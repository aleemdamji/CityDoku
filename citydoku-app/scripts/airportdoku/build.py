#!/usr/bin/env python3
"""Build audited Airportdoku data from pinned OurAirports CSVs.

Usage:
  python3 scripts/airportdoku/build.py --sources data/airportdoku/sources --output src/data/airports.json
All inputs remain local; this script does not silently download changing sources.
"""
import argparse, csv, json, re, hashlib
from collections import Counter, defaultdict
from pathlib import Path

CONTINENTS = {'AF':'Africa','AN':'Antarctica','AS':'Asia','EU':'Europe',
              'NA':'North America','OC':'Oceania','SA':'South America'}
THRESHOLDS = (5_000_000,10_000_000,25_000_000,50_000_000)

def rows(path):
    if not path.exists():
        raise FileNotFoundError(f"Required input missing: {path}")
    with path.open(newline='', encoding='utf-8-sig') as f:
        return list(csv.DictReader(f))

def nullable_bool(value):
    return {'yes': True, 'no': False, 'true': True, 'false': False,
            '1': True, '0': False}.get((value or '').strip().lower())

def require(condition, message):
    if not condition:
        raise ValueError(message)

def build(args):
    source = Path(args.sources)
    base = rows(source / 'airports.csv')
    countries = {r['code']:r for r in rows(source / 'countries.csv')}
    runways = defaultdict(list)
    for r in rows(source / 'runways.csv'):
        if r.get('airport_ref'):
            runways[r['airport_ref']].append(r)
    reviews = {r['ourairports_id']:r for r in rows(args.review)}
    traffic_rows = rows(args.passengers)
    traffic = {r['ourairports_id']:r for r in traffic_rows if r.get('ourairports_id')}
    traffic_iata = {r['iata']:r for r in traffic_rows if r.get('iata')}
    overrides = {r['ourairports_id']:r for r in rows(args.overrides)}
    routes = rows(args.routes)
    candidate = [r for r in base if r.get('type') in ('large_airport','medium_airport')
                 and r.get('scheduled_service') == 'yes'
                 and re.fullmatch('[A-Z]{3}',r.get('iata_code',''))]
    ids = {r['id'] for r in candidate}
    seen_codes = Counter(r['iata_code'] for r in candidate)
    dest_cont = {}
    id_by_iata = {r['iata_code']: r['id'] for r in base if r.get('iata_code')}
    for r in base:
        country = countries.get(r['iso_country'],{})
        dest_cont[r['id']] = CONTINENTS.get(country.get('continent'))
    route_continents = defaultdict(set)
    route_sources = defaultdict(set)
    for r in routes:
        origin = r.get('origin_ourairports_id') or id_by_iata.get(r.get('origin_iata'))
        dest = r.get('destination_ourairports_id') or id_by_iata.get(r.get('destination_iata'))
        if origin not in ids or not dest_cont.get(dest):
            continue
        if r.get('service_type') != 'scheduled_passenger' or nullable_bool(r.get('operated_during_window')) is not True:
            continue
        if not r.get('source_url') or not r.get('verified_at'):
            continue
        if dest_cont[dest] != 'Antarctica':
            route_continents[origin].add(dest_cont[dest])
            route_sources[origin].add(r['source_url'])
    airport_out = []
    queues = defaultdict(list)
    for r in candidate:
        aid=r['id']
        review=reviews.get(aid,{})
        override=overrides.get(aid,{})
        if override.get('action')=='exclude':
            continue
        if seen_codes[r['iata_code']] > 1:
            queues['duplicate_iata'].append(r['iata_code'])
            continue
        if review.get('operating_status') != 'active' or not review.get('source_url'):
            queues['operations_unverified'].append(r['iata_code'])
            continue
        country = countries.get(r.get('iso_country'),{})
        continent = CONTINENTS.get(country.get('continent'))
        if not continent or continent == 'Antarctica':
            queues['continent_unverified'].append(r['iata_code'])
            continue
        island = nullable_bool(review.get('island'))
        capital = nullable_bool(review.get('serves_capital'))
        if island is None or capital is None:
            queues['geography_unverified'].append(r['iata_code'])
            continue
        t=traffic.get(aid) or traffic_iata.get(r['iata_code'],{})
        try:
            count=int(t['passengers_2025']) if t.get('passengers_2025') else None
        except ValueError:
            count=None
        if count is None or count < 0 or not t.get('source_url') or not t.get('verified_at'):
            queues['passengers_unverified'].append(r['iata_code'])
            continue
        if nullable_bool(review.get('route_coverage_verified')) is not True:
            queues['route_coverage_unverified'].append(r['iata_code'])
            continue
        rw=[]
        for item in runways.get(aid,[]):
            if nullable_bool(item.get('closed')) is True:
                continue
            try:
                length=round(float(item.get('length_ft') or 0)*0.3048)
            except ValueError:
                length=0
            if length > 0:
                rw.append(length)
        if not rw:
            queues['runway_unverified'].append(r['iata_code'])
            continue
        try:
            lat=float(r['latitude_deg']); lon=float(r['longitude_deg'])
        except (ValueError,TypeError):
            queues['coordinates_unverified'].append(r['iata_code'])
            continue
        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
            queues['coordinates_unverified'].append(r['iata_code'])
            continue
        name=r['name'].strip()
        aliases=[r['iata_code'],r.get('ident',''),r.get('municipality','') or '']
        record=dict(id=aid,n=name,a=[v for v in aliases if v],p=r['iata_code'],pop=count,
            lat=lat,lon=lon,cont=continent,country=r['iso_country'],
            city=r.get('municipality',''),island=island,cap=capital,
            runways=len(rw),longest=max(rw),elev=round(float(r['elevation_ft'])*0.3048) if r.get('elevation_ft') else None,
            cont5=len(route_continents[aid])>=5,continents=sorted(route_continents[aid]),
            trafficYear=2025)
        airport_out.append(record)
    report=dict(source_sha256={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in source.glob('*.csv')},
        initial_candidates=len(candidate),eligible=len(airport_out),
        unresolved={k:sorted(set(v)) for k,v in queues.items()},
        excluded=len(candidate)-len(airport_out),
        thresholds={str(t):sum(a['pop']>=t for a in airport_out) for t in THRESHOLDS},
        five_continents=sum(a['cont5'] for a in airport_out))
    Path(args.report).parent.mkdir(parents=True,exist_ok=True)
    Path(args.report).write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    if report['unresolved']:
        print('NOT RELEASE READY: unresolved verification cases. See '+args.report)
        if not args.allow_partial:
            return 2
    out=Path(args.output);out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(airport_out,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
    print(f"Wrote {len(airport_out)} airports to {out}")
    return 0

if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--sources',default='data/airportdoku/sources')
    p.add_argument('--review',default='data/airportdoku/manual_review.csv')
    p.add_argument('--passengers',default='data/airportdoku/passengers_2025.csv')
    p.add_argument('--routes',default='data/airportdoku/routes.csv')
    p.add_argument('--overrides',default='data/airportdoku/overrides.csv')
    p.add_argument('--output',default='src/data/airports.json')
    p.add_argument('--report',default='data/airportdoku/validation_report.json')
    p.add_argument('--allow-partial',action='store_true',help='Research only; output is NOT release-ready')
    raise SystemExit(build(p.parse_args()))
