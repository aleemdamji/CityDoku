#!/usr/bin/env node
// Airportdoku staging integrity + grid feasibility checker.
// Run from citydoku-app/: node scripts/airportdoku/validate-staging.mjs
import fs from 'node:fs';
import assert from 'node:assert/strict';
const base='data/airportdoku/staging/';
const parts=['africa','asia','europe','north-america','oceania','south-america'];
const airports=parts.flatMap(n=>JSON.parse(fs.readFileSync(base+n+'.json','utf8')));
const manifest=JSON.parse(fs.readFileSync('data/airportdoku/validation_2026-10.json','utf8')).manifest;
const codes=new Set(),ids=new Set(),issues=[];
for(const a of airports){
  if(!/^[A-Z]{3}$/.test(a.iata))issues.push('Bad IATA '+a.iata);
  if(codes.has(a.iata))issues.push('Duplicate code '+a.iata);
  codes.add(a.iata);
  if(ids.has(a.id))issues.push('Duplicate ID '+a.id);
  ids.add(a.id);
  if(!a.name||!a.country||!a.cont)issues.push('Missing identity '+a.iata);
  if(!Number.isFinite(a.lat)||!Number.isFinite(a.lon)||Math.abs(a.lat)>90||Math.abs(a.lon)>180)
    issues.push('Bad coordinates '+a.iata);
  if(a.pop!==null&&(!Number.isSafeInteger(a.pop)||a.pop<0||a.trafficYear!==2025||!a.trafficSource))
    issues.push('Bad passenger evidence '+a.iata);
  if(a.cap!==null||a.island!==null||a.cont5!==null||a.releaseEligible!==false)
    issues.push('Unapproved classification '+a.iata);
  if(a.runways!==null && (!Number.isInteger(a.runways)||a.runways<1||!Number.isFinite(a.longest)||a.longest<1||!a.runwaySource))
    issues.push('Invalid runway source or dimensions '+a.iata);
  if(a.runways===null && a.longest!==null)
    issues.push('Longest runway without known runway count '+a.iata);
  if(!Number.isInteger(Number(a.ourairportsId))||!a.ourairportsId)
    issues.push('Missing OurAirports ID '+a.iata);
  if(typeof a.capitalCandidate!=='boolean'||typeof a.islandCandidate!=='boolean')
    issues.push('Missing curated-review candidate flag '+a.iata);
}
if(airports.length!==manifest.baselineCount)issues.push('Mismatch with manifest count');
if(airports.filter(a=>a.pop!==null).length!==manifest.traffic2025Verified)issues.push('Traffic count mismatch');
const countries=new Set(airports.map(a=>a.country));
const continentCounts=Object.fromEntries(parts.map(p=>[p,airports.filter(a=>a.cont.toLowerCase().replaceAll(' ','-')===p).length]));
// Puzzle feasibility from objectively populated geography + IATA clues only.
// This exercises the 3x3 all-different rule; it does NOT certify full-game daily seeds.
const geo=[...new Set(airports.map(x=>x.cont))].map(k=>({id:'cont:'+k,s:new Set(airports.map((c,i)=>c.cont===k?i:-1).filter(i=>i>=0))}));
geo.push(...['US','CA','GB','FR','DE','IN','CN','JP','BR','AU','MX','ES','IT','TR'].map(k=>({id:'country:'+k,s:new Set(airports.map((c,i)=>c.country===k?i:-1).filter(i=>i>=0))})));
const codesClues=[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].flatMap(ch=>[
  {id:'first:'+ch,s:new Set(airports.map((c,i)=>c.iata[0]===ch?i:-1).filter(i=>i>=0))},
  {id:'last:'+ch,s:new Set(airports.map((c,i)=>c.iata[2]===ch?i:-1).filter(i=>i>=0))}]);
codesClues.push(
 {id:'vowel',s:new Set(airports.map((c,i)=>/[AEIOU]/.test(c.iata)?i:-1).filter(i=>i>=0))},
 {id:'repeated',s:new Set(airports.map((c,i)=>new Set(c.iata).size<3?i:-1).filter(i=>i>=0))}
);
function matching(sets){const owner=new Map();function dfs(i,seen){for(const x of sets[i]){if(seen.has(x))continue;seen.add(x);if(!owner.has(x)||dfs(owner.get(x),seen)){owner.set(x,i);return true}}return false;}return sets.every((set,i)=>dfs(i,new Set()))}
function randomGen(seed){let a=seed;return n=>{a^=a<<13;a^=a>>>17;a^=a<<5;return (a>>>0)%n}}
let valid=0,distinctChecks=0,maxTries=0,examples=[];
for(let seed=1;seed<=100;seed++){
  const rand=randomGen(seed);let found=false;
  for(let attempt=0;attempt<2000;attempt++){
    const rows=[],cols=[];
    while(rows.length<3){let x=geo[rand(geo.length)];if(!rows.includes(x))rows.push(x)}
    while(cols.length<3){let x=codesClues[rand(codesClues.length)];if(!cols.includes(x))cols.push(x)}
    const sets=[];
    for(const a of rows)for(const b of cols){const set=[];for(const i of a.s)if(b.s.has(i))set.push(i);sets.push(set)}
    if(sets.some(s=>s.length<1||s.length>60)||sets.filter(s=>s.length>=10).length<3||sets.filter(s=>s.length<=3).length<2)continue;
    distinctChecks++;
    if(!matching(sets))continue;
    valid++;found=true;maxTries=Math.max(maxTries,attempt+1);
    if(examples.length<3)examples.push({rows:rows.map(x=>x.id),cols:cols.map(x=>x.id),counts:sets.map(s=>s.length)});
    break;
  }
  if(!found)issues.push('Could not generate geography/code Mixed test puzzle for seed '+seed);
}
const result={kind:'staging_checks_only',runwayRecords:airports.filter(a=>a.runways!==null).length,islandCandidates:airports.filter(a=>a.islandCandidate).length,capitalCandidates:airports.filter(a=>a.capitalCandidate).length,releaseReady:false,records:airports.length,countries:countries.size,continents:continentCounts,
  passedIdentityChecks:issues.filter(s=>!s.startsWith('Could not generate')).length===0,
  simulatedMixedGrids:valid,simulatedSeeds:100,distinctAnswerChecks:distinctChecks,maxTries,
  examples,errors:issues};
console.log(JSON.stringify(result,null,2));
if(issues.length)process.exitCode=1;
