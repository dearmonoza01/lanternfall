
/* ---- mastery-r2 (TEST, 11 Nov 2026): weapon mastery (ชำนาญอาวุธ Job Lv / EXP) is SEPARATE PER WEAPON LINE, never pooled (DeaRz rule 4 Nov) ----
   Lines: sword, dagger, bow, staff, holystaff (staff with hs flag), scythe, knuckle (+ any other weapon type by its own name).
   State: P.skLv.__mast = { line: {lv, exp} } (non-enumerable, so the skill-point code that stringifies P.skLv is not disturbed) saved per character slot in localStorage 'lanternfall_mast_v1'.
   The game's own P.jobLv / P.jobExp always hold the HELD weapon's values (swapped in when the weapon changes), so Job EXP from kills, the HUD chip and the skill window follow the held weapon with no other change.
   Skill points: the p298 skill-upgrade system already keeps ONE POOL PER WEAPON LINE (P.skLv.sword / bow / staff / dagger / scythe, 2 points per player level each, spent only on that line);
   this module only exposes them in the inspector. Holy staff has no pool in this build (priest line not merged). Old save: the single pooled Job Lv/EXP goes to the sword line.
   Class change (if ever used) keeps the held weapon's Job Lv / EXP and resets nothing else. ?mastery=off = old single pool. Debug: window.__MASTERY. ---- */
(function(){'use strict';
const OFF=/[?&]mastery=off\b/.test(String(location.search));
const M=window.__MASTERY={ver:'mastery-r2',on:!OFF,err:null,cur:null,log:[]};
if(OFF)return;
const ERR=(w,e)=>{M.err=w+': '+((e&&e.message)||e);try{console.error('[MASTERY]',w,e)}catch(_){}};
const SK_='lanternfall_mast_v1';
const charKey=()=>{try{if(typeof CH!=='undefined'&&CH&&CH.cur>=0&&CH.list&&CH.list[CH.cur])return CH.cur+':'+(CH.list[CH.cur].name||'')}catch(_){}return 'solo'};
const readAll=()=>{try{return JSON.parse(localStorage.getItem(SK_)||'{}')||{}}catch(_){return {}}};
const lineNow=()=>{const w=typeof P!=='undefined'&&P&&P.weapon;if(!w)return 'fist';if(w.t==='staff'&&w.hs)return 'holystaff';return w.t||'fist'};
const LINES=['sword','dagger','bow','staff','holystaff','scythe','knuckle'];
function mast(){const s=P.skLv&&typeof P.skLv==='object'?P.skLv:(P.skLv={});if(!s.__mast||typeof s.__mast!=='object')Object.defineProperty(s,'__mast',{value:{},enumerable:false,writable:true,configurable:true});return s.__mast}
function init(){const sv=readAll()[charKey()],m=mast();for(const k of Object.keys(m))delete m[k];
  if(sv&&typeof sv==='object'){for(const k in sv)if(sv[k]&&typeof sv[k]==='object')m[k]={lv:Math.max(0,sv[k].lv|0),exp:+sv[k].exp||0}}
  else{m.sword={lv:Math.max(0,P.jobLv|0),exp:+P.jobExp||0};M.log.push('old save: pooled Job Lv '+P.jobLv+' -> sword')}   /* old save: the pooled value goes to the sword line */
  for(const k of LINES)if(!m[k])m[k]={lv:1,exp:0};
  const cur=lineNow();if(!m[cur])m[cur]={lv:1,exp:0};
  P.jobLv=m[cur].lv;P.jobExp=m[cur].exp;M.cur=cur;P._mastInit=1;P._mastKey=charKey();persist(true)}
function flush(){if(!P||P._mastInit!==1||!M.cur)return;const m=mast();if(!m[M.cur])m[M.cur]={lv:1,exp:0};m[M.cur].lv=P.jobLv|0;m[M.cur].exp=+P.jobExp||0}
let lastSave='';
function persist(force){try{if(!P||P._mastInit!==1)return;flush();const m=mast(),o={};for(const k in m)o[k]={lv:m[k].lv,exp:Math.round(m[k].exp*100)/100};const s=JSON.stringify(o);if(!force&&s===lastSave)return;lastSave=s;const a=readAll();a[P._mastKey||charKey()]=o;localStorage.setItem(SK_,JSON.stringify(a))}catch(e){ERR('persist',e)}}
function swap(){if(!P||P._mastInit!==1)return;const n=lineNow();if(n===M.cur)return;flush();const m=mast();if(!m[n])m[n]={lv:1,exp:0};
  M.log.push('swap '+M.cur+' -> '+n);M.cur=n;P.jobLv=m[n].lv;P.jobExp=m[n].exp;try{if(G.win==='wSkill')renderSkillWin()}catch(_){}persist(true)}
M.state=()=>{if(!P||P._mastInit!==1)return null;flush();const m=mast(),o={cur:M.cur,lines:{}};for(const k in m)o.lines[k]={lv:m[k].lv,exp:Math.round(m[k].exp)};
  try{if(window.__SKUP){o.points={};for(const l of ['sword','dagger','bow','staff','scythe'])o.points[l]={free:__SKUP.free(l),total:__SKUP.total()}}}catch(_){}return o};
M.init=init;M.persist=persist;
/* the weapon changes through the game's equip path: swap right before and right after it, and poll (belt and braces) */
try{const _e=equipItem;equipItem=function(){try{flush()}catch(_){}const r=_e.apply(this,arguments);try{swap()}catch(e){ERR('swap',e)}return r}}catch(e){ERR('hook equip',e)}
/* a kill must credit the weapon in hand NOW (not 50 ms ago) */
try{const _g=gainJobExp;gainJobExp=function(){try{swap()}catch(_){}return _g.apply(this,arguments)}}catch(e){ERR('hook gain',e)}
/* class change keeps the held weapon's Job Lv / EXP and resets nothing else */
try{const _c=setClass;setClass=function(){const lv=P.jobLv,ex=P.jobExp;const r=_c.apply(this,arguments);try{P.jobLv=lv;P.jobExp=ex;flush();persist(true)}catch(_){}return r}}catch(e){ERR('hook class',e)}
setInterval(()=>{try{if(typeof P==='undefined'||!P)return;if(P._mastInit===1&&P._mastKey!==charKey())P._mastInit=0;if(P._mastInit!==1){if(!P.weapon)return;init();return}swap();persist(false)}catch(e){ERR('tick',e)}},120);
window.addEventListener('beforeunload',()=>{try{persist(true)}catch(_){}});
console.info('[MASTERY] per-weapon mastery loaded');
})();
