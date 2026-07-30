// render_real.js -- run stats.html's OWN inline script against an arbitrary
// leaderboard .md, and report what renderTable1 actually produced.
//
//   node tools/render_real.js bench/leaderboard.md
//
// Why this file exists
// --------------------
// Every other check we have reads the .md with a REIMPLEMENTATION of the page's
// parsing rule (mine in check_basis_consistency.py, Yu's and Isabella's in their
// own scripts). A reimplementation and the page read the same file and emit the
// same numbers, so **no output can distinguish "I ran the page" from "I wrote
// something that resembles it"** -- it is undetectable at the result layer.
// This runs the page's block itself, so the distinction stops depending on
// whoever writes the report being careful.
//
// The block is extracted by its own <script>/</script> boundaries, never by
// picking out a function: choosing which function to run is choosing what the
// page executes, which is the same error one layer up.
//
// WHAT THIS DOES NOT ESTABLISH  (Ham, 2026-07-30: switching from a copy to the
// real thing moves the failure surface from your copy to your FIXTURE -- it does
// not make the test correct)
//   The DOM and fetch here are stubs. Only the .md is served for real; every
//   other artifact returns ok:false and the page's own .catch fallbacks fill in
//   {}. So:
//     trustworthy  -- which rows exist, their order, their grouping, row counts
//     NOT valid    -- the CI columns, model_ranking_strict columns, error bars:
//                     their inputs are stubbed out, so whatever they render here
//                     means nothing.
//   Quote results from this only for the first list.

// Run the page's OWN inline block against #65's leaderboard.md.
// Both halves real: executor = stats.html's actual script (extracted by its own
// <script> boundaries, not by picking a function), input = the .md file from PR #65.
const fs = require('fs');
const MD = process.argv[2];

function mkEl(id){
  const el = {
    id, _html:'', children:[], style:{}, dataset:{}, className:'',
    get innerHTML(){ return this._html; },
    set innerHTML(v){ this._html = String(v); },
    get textContent(){ return this._html.replace(/<[^>]*>/g,''); },
    set textContent(v){ this._html = String(v); },
    appendChild(c){ this.children.push(c); return c; },
    setAttribute(){}, getAttribute(){ return null; },
    addEventListener(){}, removeEventListener(){}, remove(){},
    querySelector(){ return mkEl('q'); }, querySelectorAll(){ return []; },
    classList:{ add(){}, remove(){}, toggle(){}, contains(){ return false; } },
    closest(){ return null; }, insertAdjacentHTML(_,h){ this._html += h; },
  };
  return el;
}
const els = {};
const doc = {
  getElementById(id){ return (els[id] = els[id] || mkEl(id)); },
  querySelector(){ return mkEl('q'); }, querySelectorAll(){ return []; },
  createElement(t){ return mkEl(t); },
  addEventListener(){}, body: mkEl('body'), documentElement: mkEl('html'),
  readyState: 'complete',
};
global.document = doc;
global.window = { __APPS_SCRIPT_URL__: 'http://stub', addEventListener(){}, location:{href:'', search:''}, matchMedia(){ return {matches:false, addEventListener(){}}; } };
global.location = global.window.location;
global.navigator = { userAgent:'node' };
global.setTimeout = setTimeout; global.console = console;

const served = {};   // url substring -> body
served['leaderboard'] = fs.readFileSync(MD,'utf8');

global.fetch = function(url){
  const u = String(url);
  const hit = Object.keys(served).find(k => u.includes(k));
  if (hit) return Promise.resolve({ ok:true, text:()=>Promise.resolve(served[hit]), json:()=>Promise.resolve({}) });
  // every other artifact: the page's own .catch fallbacks handle a miss
  return Promise.resolve({ ok:false, text:()=>Promise.reject(new Error('n/a')), json:()=>Promise.reject(new Error('n/a')) });
};

// Extract the block by its own <script>/</script> boundaries. Anchored on the
// app.js include so it is the page's main inline block and not the one-line
// __APPS_SCRIPT_URL__ header -- and if that anchor ever moves, this throws
// rather than silently running some other block.
const page = require('path').join(__dirname, '..', 'stats.html');
const html = fs.readFileSync(page, 'utf8');
const anchor = html.indexOf('app.js?v=');
if (anchor < 0) throw new Error('stats.html: app.js include not found -- page shape changed, refusing to guess which block to run');
const i = html.indexOf('<script>', anchor);
const j = html.indexOf('</script>', i);
if (i < 0 || j < 0) throw new Error('stats.html: no inline <script> block after the app.js include');
const block = html.slice(i + '<script>'.length, j);
console.log('running ' + block.length + ' chars of stats.html\'s own inline block against ' + MD);
eval(block);

setTimeout(function(){
  const t1 = els['t1body'] || els['table1-body'] || null;
  const ids = Object.keys(els).filter(k => /t1|table1/i.test(k));
  console.log('elements the block wrote into, matching t1/table1:', ids);
  ids.forEach(function(id){
    const h = els[id]._html || '';
    const rows = (h.match(/<tr/g) || []).length;
    console.log('  #' + id + ': ' + h.length + ' chars, ' + rows + ' <tr>');
    if (rows) {
      const names = (h.match(/<tr[\s\S]*?<\/tr>/g)||[]).map(function(r){
        const cs = (r.match(/<td[^>]*>[\s\S]*?<\/td>/g)||[]).map(function(x){return x.replace(/<[^>]*>/g,'').trim();});
        return cs.slice(0,2).join('|');
      });
      console.log('    first cell of each row: ' + JSON.stringify(names));
      console.log('    wbench rows: ' + names.filter(function(n){return /wbench/i.test(n);}).length);
    }
  });
  process.exit(0);
}, 800);
