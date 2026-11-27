
/* ---- r208 HOTITEM208 — usable items on the hotkey slots (DeaRz 24 Nov 2026 15:43 BKK "กำหนดให้ไอเท่มกดใช้สามารถใส่ช่องคีย์ลัดข้างล่างได้ด้วยนะ").
   Bag item panel: usable items (those with a "ใช้" button) get "ใส่ช่องคีย์ลัด" -> the bag closes, tap a free slot on the bar (or phone ring).
   A slot is free when no skill / weapon skill sits on it; skills always win, so weapon switching never loses an item silently (it just hides).
   The slot shows the item icon + count, greys at 0 and stays (comes back when you get more). Key / tap = the same use as from the bag.
   Right click (PC) or long press 0.6 s (phone) on an item slot clears it. Stored per character in localStorage (like the weapon-skill slots).
   Off: ?hotitem=off. Debug window.HOTITEM208 ---- */
(function(){'use strict';
const Q=String(location.search);const X=window.HOTITEM208={ver:'hotitem-r208',on:!/[?&]hotitem=off\b/.test(Q),err:null,map:{},assign:null,stats:{use:0,set:0,clear:0}};
if(!X.on)return;
const ERR=(w,e)=>{X.err=w+': '+((e&&e.message)||e);try{console.error('[HOTITEM208]',w,e)}catch(_){}};
try{
const KEY=()=>'lanternfall_hotItems_v1:'+(typeof SAVE_KEY!=='undefined'?SAVE_KEY:'');
X.load=()=>{try{X.map=JSON.parse(localStorage.getItem(KEY())||'{}')||{}}catch(_){X.map={}}};
X.save=()=>{try{localStorage.setItem(KEY(),JSON.stringify(X.map))}catch(_){}};
X.load();
const css=document.createElement('style');css.textContent='#bar .slot.hki img,#tSkills .tsk.hki img{width:78%;height:78%;object-fit:contain;margin:11%}#bar .slot.hki .hkq,#tSkills .tsk.hki .hkq{position:absolute;right:2px;bottom:1px;font:700 11px/1 sans-serif;color:#fff;text-shadow:0 0 3px #000,0 0 2px #000;pointer-events:none}#bar .slot.hki.hk0 img,#tSkills .tsk.hki.hk0 img{filter:grayscale(1) brightness(.5)}body.hkAssign #bar .slot.wsk,body.hkAssign #bar .slot[data-sk],body.hkAssign #tSkills .tsk.wsk{pointer-events:none;opacity:.4}body.hkAssign #bar .slot:not(.pot):not(.wsk):not([data-sk]),body.hkAssign #tSkills .tsk:not(.wsk){outline:2px dashed #8fe3ff;outline-offset:-2px}body.mobile.hkAssign #tSkills .tsk:not(.wsk){display:block!important;border-radius:50%;background:rgba(10,14,24,.55)}body.mobile #tSkills .tsk.hki{display:block!important}#hkMsg{position:fixed;left:50%;top:14%;transform:translateX(-50%);z-index:70;padding:8px 16px;border-radius:12px;background:rgba(8,16,24,.92);border:1px solid #5cb8d6;color:#d6f4ff;font-size:14px;font-weight:700;display:none;pointer-events:none;text-align:center;max-width:90vw}';document.head.appendChild(css);
const msg=document.createElement('div');msg.id='hkMsg';document.body.appendChild(msg);let mT=0;
const say=(t,ms)=>{msg.textContent=t;msg.style.display='block';clearTimeout(mT);if(ms)mT=setTimeout(()=>{msg.style.display='none'},ms)};
const nm=id=>{try{return (ITEMS[id]&&ITEMS[id].n)||id}catch(_){return id}};
const idx=el=>+(el.dataset.i!==undefined?el.dataset.i:el.dataset.ti);
const els=()=>document.querySelectorAll('#bar .slot[data-i]:not(.pot),#tSkills .tsk[data-ti]');
const isItemEl=el=>el.classList.contains('hki');
const busy=el=>el.classList.contains('wsk')||(!isItemEl(el)&&el.dataset.sk&&el.dataset.sk.indexOf('it:')!==0)||(el.dataset.i!==undefined&&P&&P.slots&&P.slots[idx(el)]);
function unpaint(el){if(!isItemEl(el))return;el.classList.remove('hki','hk0');const k=el.querySelector('kbd'),kt=k?k.textContent:'';el.innerHTML='<div class="cd"></div><div class="cdt"></div>'+(kt?'<kbd>'+kt+'</kbd>':'');delete el.dataset.hk;if(el.dataset.sk&&el.dataset.sk.indexOf('it:')===0)el.removeAttribute('data-sk');}
function paint(el,id){const n=countItem(id);
  if(el.dataset.hk!==id){const k=el.querySelector('kbd'),kt=k?k.textContent:'';let ic='';try{ic=itemIcon({id,q:1})}catch(_){}
    el.innerHTML=(ic?'<img alt="" src="'+ic+'">':'<div class="wstx">'+nm(id)+'</div>')+'<span class="hkq"></span>'+(kt?'<kbd>'+kt+'</kbd>':'');el.dataset.hk=id;el.classList.add('hki');el.title=nm(id);
    if(el.classList.contains('tsk'))el.setAttribute('data-sk','it:'+id);}
  const q=el.querySelector('.hkq');if(q&&q.textContent!==String(n))q.textContent=n;el.classList.toggle('hk0',n<1);}
X.apply=()=>{try{for(const el of els()){const id=X.map[idx(el)];
    if(id&&ITEMS[id]&&!(el.classList.contains('wsk')||(el.dataset.i!==undefined&&P.slots&&P.slots[idx(el)])||(el.dataset.sk&&el.dataset.sk.indexOf('it:')!==0&&!isItemEl(el))))paint(el,id);else unpaint(el);}}catch(e){ERR('apply',e)}};
for(const fn of ['buildBar','buildTouchSkills']){try{const o=window[fn];if(typeof o!=='function')continue;const w=function(){const r=o.apply(this,arguments);X.apply();return r};
  if(fn==='buildBar')buildBar=w;else buildTouchSkills=w;}catch(e){ERR('hook '+fn,e)}}
X.use=id=>{if(!id)return false;if(countItem(id)<1){try{textAt(P.x,P.y-60,'ไม่มี '+nm(id),'#8fa4cc',13)}catch(_){}return false}
  if(P.dead||G.state!=='play')return false;X.stats.use++;try{useItemId(id)}catch(e){ERR('use',e)}try{if(G.win==='wInv')renderInv()}catch(_){}X.apply();return true};
X.set=(i,id)=>{for(const k in X.map)if(X.map[k]===id)delete X.map[k];X.map[i]=id;X.stats.set++;X.save();try{buildBar()}catch(_){}try{buildTouchSkills()}catch(_){}X.apply();};
X.clear=i=>{if(X.map[i]==null)return;delete X.map[i];X.stats.clear++;X.save();for(const el of els())if(idx(el)===+i)unpaint(el);try{buildBar()}catch(_){}try{buildTouchSkills()}catch(_){}};
X.startAssign=id=>{X.assign=id;try{if(window.__ITEMINFO)__ITEMINFO.hide()}catch(_){}try{if(G.win)closeWin()}catch(_){}document.body.classList.add('hkAssign');say('แตะช่องคีย์ลัดที่ว่างเพื่อวาง "'+nm(id)+'" · แตะที่อื่นเพื่อยกเลิก',0);};
X.stopAssign=()=>{X.assign=null;document.body.classList.remove('hkAssign');msg.style.display='none'};
/* bag panel button */
try{const II=window.__ITEMINFO;if(II&&II.forBag){const _f=II.forBag;II.forBag=function(i){const r=_f.apply(this,arguments);
  try{const p=document.getElementById('iiPanel'),box=p&&p.querySelector('.iia'),it=P.inv[i];
    if(r&&box&&box.querySelector('[data-iia="use"]')&&!box.querySelector('[data-hk208]')&&it&&it.id&&!it.kind&&ITEMS[it.id]){const on=Object.keys(X.map).some(k=>X.map[k]===it.id);
      box.insertAdjacentHTML('beforeend','<button data-hk208="'+it.id+'">'+(on?'ย้ายช่องคีย์ลัด':'ใส่ช่องคีย์ลัด')+'</button>');}}catch(e){ERR('panel',e)}return r};}else X.err='no __ITEMINFO';}catch(e){ERR('panel hook',e)}
addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-hk208]');if(!b)return;e.stopImmediatePropagation();e.preventDefault();X.startAssign(b.dataset.hk208);},true);
/* slot events (capture, after the weapon-skill layers which only act on their own slots) */
const slotEl=e=>e.target&&e.target.closest&&e.target.closest('#bar .slot[data-i]:not(.pot),#tSkills .tsk[data-ti]');
let lp=null;
for(const ev of ['pointerdown','pointerup','pointercancel','click','contextmenu'])addEventListener(ev,e=>{try{
  if(X.assign){if(ev!=='click'&&ev!=='pointerdown')return;const el=slotEl(e);e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();if(ev==='pointerdown')return;
    if(el){if(busy(el)){say('ช่องนี้มีสกิลอยู่ · เลือกช่องว่าง',1800);return}X.set(idx(el),X.assign);say('วาง "'+nm(X.assign)+'" แล้ว',1400);X.assign=null;document.body.classList.remove('hkAssign');}else X.stopAssign();return;}
  const el=slotEl(e);if(!el||!isItemEl(el))return;const i=idx(el),id=X.map[i];if(!id)return;
  e.stopImmediatePropagation();if(e.cancelable&&ev!=='pointerup'&&ev!=='pointercancel')e.preventDefault();
  if(ev==='contextmenu'){X.clear(i);say('เอา "'+nm(id)+'" ออกจากช่องแล้ว',1400);return}
  if(ev==='pointerdown'){if(e.button===2)return;lp={i,t:performance.now(),done:false,to:setTimeout(()=>{if(lp&&lp.i===i){lp.done=true;X.clear(i);say('เอา "'+nm(id)+'" ออกจากช่องแล้ว',1400)}},600)};return}
  if(ev==='pointerup'||ev==='pointercancel'){if(lp&&lp.i===i){clearTimeout(lp.to);const ok=!lp.done&&ev==='pointerup';lp=null;if(ok){X.use(id);if(el.classList.contains('tsk')){el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),350)}}}return}
}catch(er){ERR('evt '+ev,er)}},true);
addEventListener('keydown',e=>{try{if(e.key==='Escape'&&X.assign){X.stopAssign();return}
  if(e.repeat||G.win||G.state!=='play'||(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName)))return;const k=(e.key||'').toLowerCase(),i=SLOT_KEYS.indexOf(k);if(i<0)return;const id=X.map[i];if(!id)return;
  const el=document.querySelector('#bar .slot[data-i="'+i+'"]');if(!el||!isItemEl(el))return;
  if(k==='f'){try{if(interact()||pickupNear())return}catch(_){}}e.stopImmediatePropagation();e.preventDefault();X.use(id);}catch(er){ERR('key',er)}},true);
setInterval(()=>{try{if(X.assign&&G.state!=='play')X.stopAssign();X.apply()}catch(_){}},500);
setTimeout(()=>{try{buildBar()}catch(_){}},800);
}catch(e){ERR('init',e)}})();

