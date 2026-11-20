const test=require('node:test');const assert=require('node:assert/strict');const Q=require('../core.js');
const cities=[
{name:'Paris',country:'France',continent:'Europe',capital:true,population:2100000,aliases:['París'],fact:'On the Seine'},
{name:'London',country:'UK',continent:'Europe',capital:true,population:8900000},
{name:'Berlin',country:'Germany',continent:'Europe',capital:true,population:3600000},
{name:'Madrid',country:'Spain',continent:'Europe',capital:true,population:3300000},
{name:'Tokyo',country:'Japan',continent:'Asia',capital:true,population:14000000},
{name:'Osaka',country:'Japan',continent:'Asia',capital:false,population:2700000}
];
const clues=[{id:'capital',label:'Capital',field:'capital',op:'flag',family:'political'},
{id:'europe',label:'Europe',field:'continent',op:'eq',value:'Europe',family:'geography'},
{id:'asia',label:'Asia',field:'continent',op:'eq',value:'Asia',family:'geography'},
{id:'million',label:'≥1m',field:'population',op:'gte',value:1e6,family:'population'},
{id:'france',label:'France',field:'country',op:'eq',value:'France',family:'country'},
{id:'japan',label:'Japan',field:'country',op:'eq',value:'Japan',family:'country'}];
test('accent/case insensitive exact lookup',()=>{assert.equal(Q.findAnswer(cities,'PARÍS').city.name,'Paris');assert.equal(Q.findAnswer(cities,'unknown').kind,'not-found');});
test('intersections honor both clues',()=>{assert.deepEqual(Q.answersFor(cities,clues[0],clues[1]).map(c=>c.name),['Paris','London','Berlin','Madrid']);});
test('empty squares fail quality gate',()=>{const g=Q.evaluateGrid(cities,[clues[0],clues[1],clues[2]],[clues[3],clues[4],clues[5]]);assert.ok(g.metrics.empty>0);assert.equal(g.passed,false);});
test('deterministic candidate sequence and scoring',()=>{const a=Q.generateCandidates(cities,clues,{seed:'same',iterations:20});const b=Q.generateCandidates(cities,clues,{seed:'same',iterations:20});assert.deepEqual(a.map(g=>[g.score,g.rows.map(c=>c.id)]),b.map(g=>[g.score,g.rows.map(c=>c.id)]));});
test('duplicate identities and bad clues are caught',()=>{const result=Q.inspectDataset([...cities,cities[0]],[...clues,{id:'capital',label:'oops',field:'x',op:'nope'}]);assert.equal(result.ok,false);assert.ok(result.issues.some(x=>x.code==='DUPLICATE_ID'));assert.ok(result.issues.some(x=>x.code==='INVALID_CLUE'));});
test('missing data is not interpreted as numeric zero',()=>{assert.equal(Q.factPredicate({population:null},{op:'lt',field:'population',value:1}),false);assert.equal(Q.factPredicate({population:''},{op:'lt',field:'population',value:1}),false);});
test('ambiguous aliases are detected',()=>{const result=Q.inspectDataset([{name:'Springfield',state:'IL'},{name:'Springfield',state:'MA'}],[]);assert.ok(result.issues.some(x=>x.code==='AMBIGUOUS_NAME'));assert.equal(Q.findAnswer([{name:'Springfield',state:'IL'},{name:'Springfield',state:'MA'}],'Springfield').kind,'ambiguous');});
test('discovery never includes selected answer',()=>{const result=Q.discovery(cities,[clues[0],clues[1],clues[3]],[clues[1],clues[3],clues[0]],['Paris'],10);assert.ok(result.every(x=>x.city.name!=='Paris'));});
test('adapt existing CityDoku field names',()=>{const [c]=Q.adaptCities([{city:'Ottawa',country:'Canada',pop2025:1000,aliases:'O-town'}]);assert.equal(c.name,'Ottawa');assert.equal(c.population,1000);assert.deepEqual(c.aliases,['O-town']);});