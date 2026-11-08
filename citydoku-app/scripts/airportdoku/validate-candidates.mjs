#!/usr/bin/env node
// Offline candidate-data validation. Run from citydoku-app/ with:
// node scripts/airportdoku/validate-candidates.mjs
import fs from 'node:fs';
const folder='data/airportdoku/';
const airports=JSON.parse(fs.readFileSync(folder+'airports_candidates.json','utf8'));
const previous=JSON.parse(fs.readFileSync(folder+'candidate_validation.json','utf8'));
const validCont=new Set(['Africa','Asia','Europe','North America','South America','Oceania']);
const countryCodes=new Set(), codeSet=new Set(), duplicates=[], failures=[], byCont={};
let coordinates=0,missingCoordinates=0, passVerified=0, routesVerified=0;
for(const [i,a] of airports.entries()){
  const tag=a.iata||('row '+i);
  if(!/^[A-Z]{3}$/.test(a.iata))failures.push(tag+': invalid IATA');
  if(codeSet.has(a.iata))duplicates.push(a.iata);
  codeSet.add(a.iata);
  if(!a.name||!a.country||!validCont.has(a.continent))failures.push(tag+': identity/geography incomplete');
  countryCodes.add(a.country);
  byCont[a.continent]=(byCont[a.continent]||0)+1;
  if(a.lat===null||a.lon===null){missingCoordinates++}
  else if(!Number.isFinite(a.lat)||!Number.isFinite(a.lon)||Math.abs(a.lat)>90||Math.abs(a.lon)>180){failures.push(tag+': invalid coordinates')}
  else coordinates++;
  if(a.passengers2025!==null&&a.passengersSource)passVerified++;
  if(a.servesFiveContinents!==null)routesVerified++;
}
if(airports.length!==previous.counts.largeMediumCandidates)failures.push('candidate count does not match manifest');
if(coordinates!==previous.counts.coordinatesMatched)failures.push('coordinate count does not match manifest');
if(duplicates.length)failures.push('duplicate IATA codes: '+duplicates.join(','));
const results={status:failures.length?'FAIL':'PASS_CANDIDATE_CHECKS_ONLY',candidateCount:airports.length,
 countries:countryCodes.size,continents:byCont,coordinates,missingCoordinates,
 passengerRecordsVerified:passVerified,routeRecordsClassified:routesVerified,
 releaseReady:false,failures};
console.log(JSON.stringify(results,null,2));
if(failures.length)process.exitCode=1;
