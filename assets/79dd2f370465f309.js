
/* ---- v3e glue (TEST allin_r28 / REAL v3e, 12 Nov 2026): DeaRz's 10 issues after playing REAL v3d ----
   1) empty slot -> the dressing room directly (creator.js ?chdirect=off = old page)
   3) empty hands until Lysel's pedestal weapon is picked (prologue patch, ?prologue_oldequip=on = old)
   4) the old "Chronicles of the Realm" text cutscene is gone from the new-game flow (?introcut=on = old); in its place window.playOpeningVideo(onDone) (opening_video_r3.js, approved 13:54; ?openvid=off skips it); onDone runs exactly once and the prologue continues
   5) no red WARNING / DANGER banner in the prologue maps; a failed save is now a plain message (with the storage use) instead of a "danger zone" banner
   6) training dummies only during the trial, 7) Lysel x1.3, 8) 5 pedestals, 9) empty bag after the prologue (?probag=old = old)
   Prologue dialogue: ONE table = window.__QDATA quests pro_* .dialogue; window.PROLOGUE_LINES (a script defining it, drop-in) overrides line by line; window.PROLOGUE_LINES_EXPORT() lists every line. Debug: window.__V3E ---- */
(function(){'use strict';
const Q=String(location.search),V=window.__V3E={ver:'v3e-r1',err:null,intro:{calls:0,done:0},banner:{blocked:0,saveFail:0},lines:{merged:0,user:0}};
/* ---- 4) opening: video instead of the text cutscene ---- */
function hookIntro(){if(typeof playIntro!=='function')return false;if(playIntro.__v3e)return true;if(/[?&]introcut=on\b/.test(Q))return true;
  const w=function(done){V.intro.calls++;let n=0;const once=()=>{if(n++)return;V.intro.done++;try{done&&done()}catch(e){V.err='introDone '+e.message}};
    if(/[?&]openvid=off\b/.test(Q)||typeof window.playOpeningVideo!=='function'){once();return}
    try{window.playOpeningVideo(once,{low:(typeof G!=='undefined'&&G.gfx==='low')||!!window.lowGfx})}catch(e){V.err='video '+e.message;once()}};
  w.__v3e=1;playIntro=w;return true}
{const iv=setInterval(()=>{try{if(hookIntro())clearInterval(iv)}catch(e){V.err='hookIntro '+e.message}},200);setTimeout(()=>clearInterval(iv),60000)}
/* ---- 5) banners ---- */
try{const _n=notify;notify=function(msg,bad){try{if(typeof msg==='string'&&msg.charAt(0)==='⚠'){
    if(typeof G!=='undefined'&&/^w00_/.test(String(G.zone))){V.banner.blocked++;return}
    if(msg.indexOf('บันทึกเกมไม่สำเร็จ')>=0){V.banner.saveFail++;let kb=0;try{for(const k in localStorage)if(Object.prototype.hasOwnProperty.call(localStorage,k))kb+=(k.length+String(localStorage.getItem(k)).length)*2/1024}catch(_){}
      return _n.call(this,msg.replace(/^⚠\s*/,'')+' [localStorage ~'+Math.round(kb)+' KB]',true)}}}catch(e){}
  return _n.apply(this,arguments)}}catch(e){V.err='notify '+e.message}
/* ---- prologue dialogue: one table ---- */
const DEFAULTS={pro_02_choose_weapon:{pedestal:{
  dagger:'มีดสั้นคู่ ปลายคมวาววับ เบาจนแทบไม่รู้สึกถึงน้ำหนัก',
  holy:'คทาพระ แสงอุ่นไหลอยู่ในลูกแก้วปลายคทา'}}};   /* the 2 new pedestal lines, approved by DeaRz 12 Nov 15:24 (also in prologue_lines_r2) */
function isSub(u,all){let j=0;for(const l of all){if(j<u.length&&l===u[j])j++}return j===u.length}
V.lines.keptRace=0;V.lines.raceDropped=0;V.lines.changed=0;
/* missingOnly: add the keys the game table lacks. user table: replaces line by line; a key that the race-lines layer made a getter (pro_05 talk) keeps its race lines when the user lines are the same base lines (subsequence), else it is replaced by a plain list */
function merge(dst,src,missingOnly){let n=0;for(const k in src){const v=src[k];
    if(v&&typeof v==='object'&&!Array.isArray(v)){if(!dst[k]||typeof dst[k]!=='object'||Array.isArray(dst[k]))dst[k]={};n+=merge(dst[k],v,missingOnly);continue}
    if(missingOnly){if(dst[k]===undefined){dst[k]=v;n++}continue}
    const d=Object.getOwnPropertyDescriptor(dst,k);
    if(d&&d.get&&!d.set){const cur=d.get.call(dst);if(Array.isArray(v)&&Array.isArray(cur)&&isSub(v,cur)){V.lines.keptRace++;continue}
      Object.defineProperty(dst,k,{value:v,writable:true,enumerable:true,configurable:true});V.lines.raceDropped++;V.lines.changed+=Array.isArray(v)?v.length:1;n+=Array.isArray(v)?v.length:1;continue}
    const cur=dst[k];if(Array.isArray(v))V.lines.changed+=v.filter((x,i)=>!(Array.isArray(cur)&&cur[i]===x)).length;else V.lines.changed+=(cur===v?0:1);
    dst[k]=v;n+=Array.isArray(v)?v.length:1}return n}function applyTable(){try{const D=window.__QDATA;if(!D||!D.quests)return false;for(const q of D.quests){if(!/^pro_/.test(q.id))continue;q.dialogue=q.dialogue||{};
    if(DEFAULTS[q.id])V.lines.merged+=merge(q.dialogue,DEFAULTS[q.id],true);
    const U=window.PROLOGUE_LINES&&window.PROLOGUE_LINES[q.id];if(U&&typeof U==='object')V.lines.user+=merge(q.dialogue,U,false)}return true}catch(e){V.err='lines '+e.message;return false}}
applyTable();
window.PROLOGUE_LINES_EXPORT=function(){const out=[],D=window.__QDATA;if(!D)return out;const nm={};for(const n of D.npcs||[])nm[n.id]=((n.title?n.title+' ':'')+n.name);
  for(const q of D.quests){if(!/^pro_/.test(q.id))continue;const who=nm[q.giver]||'(ข้อความลอย)';const d=q.dialogue||{};
    for(const key of Object.keys(d)){const v=d[key];if(Array.isArray(v))v.forEach((t,i)=>out.push({id:q.id+'.'+key+'['+i+']',quest:q.id,questName:q.name,key,idx:i,speaker:who,text:t}));
      else if(v&&typeof v==='object')for(const k2 of Object.keys(v))out.push({id:q.id+'.'+key+'.'+k2,quest:q.id,questName:q.name,key:key+'.'+k2,idx:0,speaker:'(บรรยาย)',text:v[k2]})}}
  return out};
console.info('[V3E] ready');
})();
