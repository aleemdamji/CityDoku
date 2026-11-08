/* CityDoku offline quality engine. No external dependencies. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.CityQuality = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const normalize = s => String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = seed => { let x = hash(seed) || 1; return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (x >>> 0) / 4294967296; }; };
  const unique = a => [...new Set(a)];
  const idOf = city => normalize(city.id || `${city.name}|${city.country || city.state || city.province || ''}`);
  const truth = v => v === true || v === 1 || v === '1' || normalize(v) === 'true' || normalize(v) === 'yes';
  const hasToken = (value, token) => {
    if (Array.isArray(value)) return value.some(x => normalize(x) === normalize(token));
    return String(value == null ? '' : value).split(/[;,|]/).some(x => normalize(x) === normalize(token));
  };
  function factPredicate(c, clue) {
    if (!c || !clue) return false;
    const value = c[clue.field];
    switch (clue.op) {
      case 'eq': return normalize(value) === normalize(clue.value);
      case 'flag': return truth(value);
      case 'has': return hasToken(value, clue.value);
      case 'gte': return Number.isFinite(Number(value)) && value !== '' && value != null && Number(value) >= Number(clue.value);
      case 'lt': return Number.isFinite(Number(value)) && value !== '' && value != null && Number(value) < Number(clue.value);
      default: return false;
    }
  }
  const answersFor = (cities, row, col) => cities.filter(c => factPredicate(c, row) && factPredicate(c, col));
  function inspectDataset(cities, clues) {
    const issues = [], ids = new Set(), names = new Map(), clueIds = new Set();
    if (!Array.isArray(cities) || !Array.isArray(clues)) return {ok:false, issues:[{severity:'error',code:'INVALID_INPUT',message:'Cities and clues must be arrays.'}], statistics:{}};
    cities.forEach((c,i) => {
      if (!c || !String(c.name || '').trim()) issues.push({severity:'error',code:'MISSING_NAME',message:`Record ${i + 1} lacks a name.`});
      const id = idOf(c || {});
      if (ids.has(id)) issues.push({severity:'error',code:'DUPLICATE_ID',message:`Duplicate identity: ${id}`});
      ids.add(id);
      const aliasSet = unique([c?.name, ...(Array.isArray(c?.aliases) ? c.aliases : String(c?.aliases || '').split(/[;|]/))].filter(Boolean).map(normalize));
      if (aliasSet.length === 0) issues.push({severity:'error',code:'NO_LOOKUP',message:`Record ${i + 1} cannot be searched.`});
      aliasSet.forEach(alias => {if (!names.has(alias)) names.set(alias, []); names.get(alias).push(id);});
    });
    clues.forEach((clue,i) => {
      if (!clue || !clue.id || !clue.label || !clue.field || !['eq','flag','has','gte','lt'].includes(clue.op)) issues.push({severity:'error',code:'INVALID_CLUE',message:`Clue ${i+1} is missing essential fields or uses an unknown operator.`});
      if (clueIds.has(clue?.id)) issues.push({severity:'error',code:'DUPLICATE_CLUE',message:`Duplicate clue id: ${clue.id}`});
      clueIds.add(clue?.id);
      const count = cities.filter(c => factPredicate(c,clue)).length;
      if (count === 0) issues.push({severity:'warning',code:'EMPTY_CLUE',message:`${clue.label || clue.id} has no valid answers.`});
    });
    for (const [alias, owners] of names) if (unique(owners).length > 1) issues.push({severity:'warning',code:'AMBIGUOUS_NAME',message:`Search name "${alias}" matches: ${unique(owners).join(', ')}`});
    let emptyPairs = 0, sparsePairs = 0;
    for (let i=0;i<clues.length;i++) for (let j=i+1;j<clues.length;j++) {
      const n = answersFor(cities,clues[i],clues[j]).length;
      if (n === 0) emptyPairs++;
      if (n > 0 && n <= 2) sparsePairs++;
    }
    const counts = {cities:cities.length,clues:clues.length,emptyPairs,sparsePairs};
    return {ok:!issues.some(x=>x.severity==='error'),issues,statistics:counts};
  }
  function evaluateGrid(cities, rows, cols, options = {}) {
    const minAnswers = options.minAnswers ?? 2, hardLimit = options.hardLimit ?? 3;
    if (rows.length !== 3 || cols.length !== 3) throw new Error('Expected exactly 3 row clues and 3 column clues');
    const cells = rows.flatMap((r,i) => cols.map((c,j) => ({row:i,col:j,answers:answersFor(cities,r,c)})));
    const counts = cells.map(x=>x.answers.length);
    const empty = counts.filter(n=>n===0).length;
    const tooSparse = counts.filter(n=>n>0 && n<minAnswers).length;
    const hard = counts.filter(n=>n>0 && n<=hardLimit).length;
    const easy = counts.filter(n=>n>=10).length;
    const avg = counts.reduce((a,b)=>a+b,0)/9;
    const spread = Math.sqrt(counts.reduce((a,b)=>a+(b-avg)**2,0)/9);
    const distinct = new Set(cells.flatMap(cell=>cell.answers.map(idOf))).size;
    const categories = [...rows,...cols].map(x=>x.family || 'other');
    const categoryDiversity = unique(categories).length;
    const duplicateFamilies = categories.length-categoryDiversity;
    const clueIds = [...rows,...cols].map(x=>x.id);
    const repeatedClue = clueIds.length-unique(clueIds).length;
    const intersectionsWithChoices = counts.filter(n=>n>=minAnswers).length;
    // Overall is bounded [0,100]. All penalties are disclosed in the returned breakdown.
    const penalties = {
      empty: empty*25,
      singleAnswer: tooSparse*8,
      repeatedClue: repeatedClue*22,
      categoryRepetition: Math.max(0,duplicateFamilies-2)*4,
      unbalanced: Math.min(14,spread*0.7),
      excessivelyBroad: counts.filter(n=>n>60).length*3,
      narrowPool: distinct<12?12:0
    };
    const score = Math.max(0,Math.min(100,Math.round(100-Object.values(penalties).reduce((a,b)=>a+b,0))));
    const passed = empty===0 && repeatedClue===0 && tooSparse<=2 && categoryDiversity>=3 && score>= (options.threshold ?? 75);
    return {score,passed,counts,cells,metrics:{empty,tooSparse,hard,easy,avg:+avg.toFixed(2),spread:+spread.toFixed(2),distinct,categoryDiversity,intersectionsWithChoices},penalties};
  }
  function generateCandidates(cities,clues,options={}) {
    const iterations= Math.max(1,Math.min(10000,options.iterations||250)), rand=rng(options.seed||'citydoku-local');
    const ranked=[];
    if (clues.length<6) return [];
    for(let k=0;k<iterations;k++) {
      const pool=clues.slice();
      for(let i=pool.length-1;i>0;i--) {const j=Math.floor(rand()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
      const rows=pool.slice(0,3),cols=pool.slice(3,6);
      const review=evaluateGrid(cities,rows,cols,options);
      ranked.push({rows,cols,...review});
    }
    return ranked.sort((a,b)=>Number(b.passed)-Number(a.passed)||b.score-a.score||a.metrics.tooSparse-b.metrics.tooSparse);
  }
  function findAnswer(cities,raw) {
    const q=normalize(raw);
    if (!q) return {kind:'missing'};
    const matches=cities.filter(c=>[c.name,...(Array.isArray(c.aliases)?c.aliases:String(c.aliases||'').split(/[;|]/))].some(x=>normalize(x)===q));
    if (!matches.length) return {kind:'not-found'};
    if (matches.length>1) return {kind:'ambiguous',matches};
    return {kind:'found',city:matches[0]};
  }
  function discovery(cities,rows,cols,selected=[],limit=4) {
    const used=new Set(selected.map(x=>normalize(typeof x==='string'?x:x?.name)));
    const candidates=[];
    rows.forEach((r,i)=>cols.forEach((c,j)=>{
      const choices=answersFor(cities,r,c).filter(a=>!used.has(normalize(a.name)));
      choices.sort((a,b)=>(Number(a.population)||Infinity)-(Number(b.population)||Infinity)||a.name.localeCompare(b.name));
      for(const city of choices.slice(0,2)) candidates.push({city,cell:[i,j],clues:[r.label,c.label],available:choices.length,fact:city.fact||`${city.name} also satisfies both clues.`});
    }));
    return candidates.sort((a,b)=>a.available-b.available||a.city.name.localeCompare(b.city.name)).filter((entry,i,arr)=>arr.findIndex(x=>idOf(x.city)===idOf(entry.city))===i).slice(0,limit);
  }
  function adaptCities(raw) {
    if (!Array.isArray(raw)) throw new Error('Expected a JSON array of city records.');
    return raw.map((c,i)=>({
      ...c,id:c.id||`${c.name||c.city||'row'+i}|${c.country||c.state||c.province||''}`,
      name:String(c.name||c.city||''),population:c.population??c.pop2025??c.pop2021??null,
      aliases:Array.isArray(c.aliases)?c.aliases:String(c.aliases||'').split(/[;|]/).map(v=>v.trim()).filter(Boolean)
    }));
  }
  return {normalize,hash,rng,truth,factPredicate,answersFor,inspectDataset,evaluateGrid,generateCandidates,findAnswer,discovery,adaptCities};
});