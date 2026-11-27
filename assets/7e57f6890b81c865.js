
/* ---- creator-r1 (TEST r6p, 9 Nov 2026): the new-character LOOK page + save field P.pLook ----
   Replaces the old "ปรับหน้าตา" face-editor step (that whole module + its 3 data blocks were removed from this file).
   Flow (same hook points the old step used): press 'สร้างตัวละคร' (name >= 2 letters) -> PUPPET.openCreator (gender, hairstyle, hair colour; no outfit / scarf: cash shop)
   -> confirm -> the game's own chCreate runs -> the look is stored as P.pLook = {gender, hair, hairColor} in the save (SAVE_KEY json + character slot) and applied with PUPPET.setChar.
   Old saves without P.pLook get {boy, default, natural}. Debug: ?phair= / ?pgender= keep the look from the URL (not the save). ?gm=on adds a button that reopens the creator in game. window.PUPPETCR. ---- */
(function(){'use strict';
const CR=window.PUPPETCR={ver:'creator-r3',err:null,pending:null,key:null,log:[]};
const DEF={gender:'boy',hair:'default',hairColor:'natural'},Q=String(location.search),DBG=/[?&](phair|pgender)=/.test(Q),RACEOFF=/[?&]race=off\b/.test(Q),FACESOFF=/[?&]faces=off\b/.test(Q);
const $=s=>document.querySelector(s);
function norm(o){o=o||{};const g=o.gender==='girl'?'girl':'boy',list=(window.PUPPET&&PUPPET.HAIRS_BY_GENDER&&PUPPET.HAIRS_BY_GENDER[g])||['default'];let h=list.indexOf(o.hair)>=0?o.hair:list[0];const L={gender:g,hair:h,hairColor:o.hairColor||'natural'};
  if(!RACEOFF){const rc=['human','demon','elf','cat'].indexOf(o.race)>=0?o.race:'human';L.race=rc;if(o.catColor)L.catColor=o.catColor;L.raceBonus=Object.assign({},o.raceBonus||{});L.freePts=Object.assign({},o.freePts||{});}
  if(!FACESOFF){L.face=/^f[1-5]$/.test(o.face||'')?o.face:'f1';L.eyeColor=o.eyeColor||'amber';}
  return L}
let CHF={look:null,done:false};
/* r4 (REAL v3e item 1): an empty slot goes straight into the dressing room (name field in its right-hand list); the old name page + empty preview are no longer used (?chdirect=off = the old page) */
const DIRECT=!/[?&]chdirect=off\b/.test(Q);
function openDirect(slot,prev){try{PUPPET.openCreator({askName:true,bare:true,char:(prev&&prev.look)||DEF,name:(prev&&prev.name)||'',okText:'สร้างตัวละคร',onCancel:()=>{}},r=>{
  const nm=String(r.name||'').trim().slice(0,16);
  if(nm.length<2){try{notify('ตั้งชื่อตัวละคร 2–16 ตัวอักษร')}catch(_){}return setTimeout(()=>openDirect(slot,{look:r,name:nm}),50)}
  if(CH.list.some((c,j)=>c&&String(c.name).toLowerCase()===nm.toLowerCase()&&j!==slot)){try{notify('มีตัวละครชื่อนี้แล้ว')}catch(_){}return setTimeout(()=>openDirect(slot,{look:r,name:nm}),50)}
  CHF={look:norm(r),done:true};CR.log.push('direct '+slot+' '+nm);
  chCreate(slot,nm,(typeof defaultLook==='function'?defaultLook():CHV.look))})}catch(er){CR.err='direct '+er.message}}
try{
document.addEventListener('click',e=>{try{if(typeof CHV==='undefined')return;const t=e.target.closest&&e.target.closest('button,[data-chnew]');if(!t)return;
  if(t.dataset&&t.dataset.chnew!=null){if(DIRECT){e.stopImmediatePropagation();e.preventDefault();openDirect(+t.dataset.chnew);return}CHF={look:null,done:false};return}
  if(t.id==='chCreate'&&!CHF.done){const nm=String(($('#chNameIn')||{}).value||'').trim();if(nm.length<2)return;   /* the game shows its own name warning */
    e.stopImmediatePropagation();e.preventDefault();
    PUPPET.openCreator({askName:false,char:DEF,okText:'สร้างตัวละคร'},r=>{CHF.look=norm(r);CHF.done=true;CR.log.push('picked '+JSON.stringify(CHF.look));const b=$('#chCreate');if(b)b.click()});}}catch(er){CR.err='ch '+er.message}},true);
const oc=chCreate;chCreate=function(i,name,look){const L=norm(CHF.look||DEF);CHF={look:null,done:false};const r=oc.apply(this,arguments);CR.pending={look:L,name};return r};
}catch(e){CR.err='hook '+e.message}
try{const _rc=recalc;recalc=function(){if(RACEOFF||!P||!P.pLook||!P.pLook.raceBonus)return _rc.apply(this,arguments);const rb=P.pLook.raceBonus,add={};for(const k in rb){const kk=k.toLowerCase();if(P.stats&&kk in P.stats&&rb[k]){add[kk]=rb[k];P.stats[kk]+=rb[k]}}
  try{return _rc.apply(this,arguments)}finally{for(const kk in add)P.stats[kk]-=add[kk]}}}catch(e){CR.err='hook recalc '+e.message}
function applyLook(){try{if(!P||!P.pLook||DBG)return;const k=JSON.stringify(P.pLook);if(CR.key===k)return;CR.key=k;PUPPET.setChar(P.pLook);try{recalc()}catch(_){}}catch(e){CR.err='apply '+e.message}}
function sync(){try{if(!P)return;let src=null;try{const raw=localStorage.getItem(SAVE_KEY);const j=raw&&JSON.parse(raw);src=j&&j.P&&j.P.pLook}catch(_){}
  P.pLook=norm(P.pLook||src||DEF);applyLook()}catch(e){CR.err='sync '+e.message}}
CR.sync=sync;
setInterval(()=>{try{if(!P||G.state!=='play')return;
  if(CR.pending&&P.look&&P.look._v===11&&(!CH||CH.cur<0||!CH.list[CH.cur]||CH.list[CH.cur].name===CR.pending.name)){P.pLook=CR.pending.look;CR.key=null;CR.log.push('new char look set');CR.pending=null;applyLook();try{saveGame()}catch(_){}}
  else if(!P.pLook)sync();else applyLook()}catch(e){CR.err='tick '+e.message}},700);
try{const os=startGame;startGame=function(){const r=os.apply(this,arguments);try{sync()}catch(_){}setTimeout(sync,400);return r}}catch(e){CR.err='hook startGame '+e.message}
try{const og=saveGame;saveGame=function(){const r=og.apply(this,arguments);try{if(P&&P.pLook&&!P.dead){const s=localStorage.getItem(SAVE_KEY);if(s){const j=JSON.parse(s);if(j&&j.P){j.P.pLook=P.pLook;const ns=JSON.stringify(j);localStorage.setItem(SAVE_KEY,ns);if(typeof CH!=='undefined'&&CH.cur>=0&&CH.list[CH.cur]){CH.list[CH.cur].save=ns;chSave()}}}}}catch(e){CR.err='save '+e.message}return r}}catch(e){CR.err='hook saveGame '+e.message}
/* GM (?gm=on): reopen the creator in game */
if(/[?&]gm=on\b/.test(Q)){const iv=setInterval(()=>{try{if(document.getElementById('pcrBtn')||!document.body)return;const b=document.createElement('button');b.id='pcrBtn';b.type='button';b.textContent='🎨 ตัวละคร (GM)';
  b.style.cssText='position:fixed;left:6px;bottom:96px;z-index:9000;font:12px system-ui,sans-serif;padding:6px 8px;border-radius:8px;border:1px solid #6a7a8c;background:rgba(20,30,44,.85);color:#fff;min-height:36px';
  for(const ev of ['pointerdown','pointerup','mousedown','touchstart'])b.addEventListener(ev,e=>e.stopPropagation());
  b.addEventListener('click',e=>{e.stopPropagation();if(!P||G.state!=='play')return;PUPPET.openCreator({askName:false,char:P.pLook||DEF,okText:'ตกลง'},r=>{P.pLook=norm(r);CR.key=null;applyLook();try{saveGame()}catch(_){}})});document.body.appendChild(b)}catch(_){}},1500)}
})();
