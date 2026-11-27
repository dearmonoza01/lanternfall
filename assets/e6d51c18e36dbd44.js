
/* ---- r181 helpermgr (TEST ONLY, coordinator Task 17, 22 Nov 2026; DeaRz order 07:22 UTC). Base = TEST r180. Flag ?helpermgr=off = r180 behaviour with the cage (nothing of this runs).
   A) the helper CAGE is gone (flag on): not sold / not placeable / not drawn. A cage placed in an old save is moved to state.cageStash by the housing sanitize (hidden, the item record stays in the save so flag off restores it); its helper stays in the roster (state.helpers.list) and keeps working, spawned where that cage stood.
   B) "จัดการผู้ช่วย" prompt next to the "ลงจากลาน" prompt at the yard landing point (HOUSE.nearExit()). Key G on PC (taken in the game by interact / staff cast, but only consumed here while the prompt is visible), tappable pill on touch. Opens the manager window:
      1. ม้อนในกระเป๋า = captured monsters in the bag (bag items id 'cap_<recId>' that carry the helper record in item.rec; a capture now ends up in the bag, not in a cage). "ให้เป็นผู้ช่วย" moves it into the roster, up to HELPER.limit() (platform level 2/3/4).
      2. ผู้ช่วยตอนนี้ = roster: job buttons (same jobs / station rules as r176), fatigue (HELPER.fat), เก็บเข้ากระเป๋า (needs a free bag slot), ปล่อย (existing confirm), รายละเอียด (the r176 helper menu, i.e. cooking queue; reachable only from here now).
      Sources are data driven: SOURCES = [{id,label,list(),take(entry),...}] (bag now, house chest later).
   The bag item registration (ITEMS['cap_...']) is always on, so a bag that holds captured monsters stays valid with any flag. Debug: window.__HELPERMGR ---- */
(function(){'use strict';
const Q=String(location.search);
const HM=window.__HELPERMGR={ver:'helpermgr-r181',on:!/[?&]helpermgr=off\b/.test(Q),key:'g',err:null,open:false,stats:{opened:0,give:0,bag:0,full:0,cap:0}};
const ERR=(w,e)=>{HM.err=w+': '+((e&&e.message)||e);try{console.error('[HELPERMGR]',w,e)}catch(_){}};
const HP=window.__HELPER,HS=window.HOUSE;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* ---------------- bag items (always registered) ---------------- */
function orbIcon(g){try{g.save();g.translate(32,32);const r=g.createRadialGradient(-6,-8,3,0,0,24);r.addColorStop(0,'#eaf8ff');r.addColorStop(.45,'#5fb4ff');r.addColorStop(1,'#1d3f8a');g.fillStyle=r;g.beginPath();g.arc(0,0,22,0,6.2832);g.fill();g.strokeStyle='#d6f2ff';g.lineWidth=2.4;g.beginPath();g.ellipse(0,0,25,9,-.5,0,6.2832);g.stroke();g.strokeStyle='#3c1406';g.lineWidth=1.2;g.beginPath();g.arc(0,0,22,0,6.2832);g.stroke();g.restore()}catch(_){}}
const isCap=it=>it&&typeof it.id==='string'&&it.id.indexOf('cap_')===0&&it.rec&&typeof it.rec==='object';
function regCap(it){try{if(typeof ITEMS==='undefined'||!isCap(it))return;const r=it.rec,J=(HP&&HP.cfg&&HP.cfg.jobNames)||{};ITEMS[it.id]=Object.assign(ITEMS[it.id]||{},{n:'🐾 '+(r.name||r.sp),d:'มอนสเตอร์ที่จับได้ · ★ถนัด '+(J[r.job]||r.job)+' เวล '+r.lv+' · ไปที่จุดลงบ้านแล้วกด G (จัดการผู้ช่วย) เพื่อให้เป็นผู้ช่วย',k:'misc',col:'#6fd0ff',icon:orbIcon,price:0,sell:0,noSell:1})}catch(e){ERR('regCap',e)}}
function scan(){try{if(typeof P==='undefined'||!P||!P.inv)return;for(const it of P.inv)if(isCap(it)&&!ITEMS[it.id])regCap(it)}catch(_){}}
scan();setInterval(scan,700);
try{const _ri=renderInv;renderInv=function(){scan();return _ri.apply(this,arguments)}}catch(e){ERR('hook renderInv',e)}
try{const _u=useItemId;useItemId=function(id){try{if(typeof id==='string'&&id.indexOf('cap_')===0){if(HP)HP.say(HM.on?'ไปที่จุดลงบ้านในลานแล้วกด G เพื่อจัดการผู้ช่วย':'ฟีเจอร์จัดการผู้ช่วยปิดอยู่',false);return}}catch(e){ERR('use',e)}return _u.apply(this,arguments)}}catch(e){ERR('hook use',e)}
if(!HM.on||!HP||!HP.on||!HS||!HS.on){HM.ready=true;return}
/* ---------------- helper-side hooks (called from the three patched spots in the helper module) ---------------- */
const SPAWN=new WeakMap();
const exitPt=()=>{try{const e=HS.exitPos();if(Array.isArray(e))return{x:e[0],y:e[1]};if(e&&e.x!=null)return{x:e.x,y:e.y}}catch(_){}return{x:P.x,y:P.y}};
HP.hmSpawn=function(r){let s=SPAWN.get(r);if(s)return s;let x,y;try{const st=(HS.state().cageStash||[]).find(o=>o&&o.uid===r.cage);if(st){x=st.x;y=st.y}}catch(_){}
 if(x==null){const e=exitPt(),i=Math.max(0,HP.list().filter(inRoster).indexOf(r));x=e.x+(i-1.5)*60;y=e.y-62-(i%2)*26}
 s={x,y};SPAWN.set(r,s);return s};
const inRoster=r=>!!r&&!!(r.out||r.hmr);const migrate=()=>{try{for(const r of HP.list())if(r.hmr==null)r.hmr=(r.out||r.cage)?1:0}catch(_){}};migrate();setInterval(migrate,1500);
const bagFull=()=>(window.QBAG222?QBAG222.used(P):P.inv.length)>=P.invSize;
HP.hmBagFull=bagFull;
function mkItem(r){return {id:'cap_'+r.id,q:1,rec:r}}
/* a fresh capture (newRec in the helper module) goes into the bag; bag full = it waits in the roster as a resting helper (nothing is lost) */
HP.hmNew=function(r){r.out=false;r.cage=null;if(!bagFull()){const it=mkItem(r);P.inv.push(it);regCap(it);try{if(G.win==='wInv')renderInv()}catch(_){}}else{r.hmr=0;HP.list().push(r);HM.stats.full++}try{HS.save()}catch(_){}HM.stats.cap++;return r};
HP.hmCard=function(r){const c=document.getElementById('hpCard');if(!c)return;const J=HP.cfg.jobNames,tr=HP.fat&&r.trait?'<div style="color:'+HP.traitCol(r.trait)+'">'+esc(HP.traitText(r.trait))+'</div>':'';c.innerHTML='<div style="font-size:15px">'+esc(r.name)+'</div><div style="color:#ffd24a">★ ถนัด'+esc(J[r.job]||r.job)+' เวล '+r.lv+'</div>'+tr+'<div style="font-size:12px;color:#9fe0ff">อยู่ในกระเป๋า · ที่จุดลงบ้านกด G เพื่อจัดการผู้ช่วย</div>';c.style.display='block';clearTimeout(HM._cardT);HM._cardT=setTimeout(()=>{c.style.display='none'},4500)};
/* ---------------- sources (data driven: a house chest can be added here later) ---------------- */
const SOURCES=HM.sources=[{id:'bag',label:'ม้อนในกระเป๋า',empty:'ไม่มีมอนสเตอร์ที่จับได้ในกระเป๋า · ใช้หนังสือผนึกวิญญาณจับมอนสเตอร์นอกลาน',
 list(){return P.inv.filter(isCap).map(it=>({key:it.id,rec:it.rec,it}))},
 take(e){const i=P.inv.indexOf(e.it);if(i<0)return null;P.inv.splice(i,1);try{if(G.win==='wInv')renderInv()}catch(_){}return e.rec}},
 {id:'box',label:'ม้อนในกล่องบ้าน',empty:'ไม่มีมอนสเตอร์ในกล่องบ้าน',list(){return HP.list().filter(r=>!inRoster(r)).map(r=>({key:r.id,rec:r}))},take(e){return e.rec}}];
/* ---------------- actions ---------------- */
const roster=()=>HP.list().filter(inRoster);
const limit=()=>HP.limit();
function give(srcId,key){const S=SOURCES.find(s=>s.id===srcId);if(!S)return false;const e=S.list().find(x=>x.key===key);if(!e)return false;const L=roster();
 if(L.length>=limit()){HP.say('ลานนี้มีผู้ช่วยได้ '+limit()+' ตัว (ตอนนี้ '+L.length+') · เก็บตัวเดิมเข้ากระเป๋า หรือยกระดับลานก่อน',true);return false}
 const r=S.take(e);if(!r)return false;r.out=true;r.hmr=1;r.cage=null;r.rest=false;r.tg=null;if(!HP.cfg.jobs.includes(r.task))r.task=r.job||'farm';if(HP.list().indexOf(r)<0)HP.list().push(r);HM.stats.give++;try{HS.save()}catch(_){}
 HP.say('ให้ '+r.name+' เป็นผู้ช่วยแล้ว · ทำ'+(HP.cfg.jobNames[r.task]||r.task),false);if(!HP.station(r.task))HP.say(r.name+': '+HP.needText(r.task)+' (ตอนนี้ยังไม่ได้ทำงาน)',true);return true}
function toBag(id){const L=HP.list(),i=L.findIndex(r=>r.id===id&&inRoster(r));if(i<0)return false;const r=L[i];
 if(r.cook){HP.say(r.name+' กำลังทำอาหารอยู่ รอให้เสร็จก่อน',true);return false}
 if(bagFull()){HP.say('กระเป๋าเต็ม · เก็บ '+r.name+' เข้ากระเป๋าไม่ได้ เคลียร์ช่องว่างก่อน',true);return false}
 L.splice(i,1);const E=HP.ents[id];if(E&&E.prop){const k=PROPS.indexOf(E.prop);if(k>=0)PROPS.splice(k,1)}delete HP.ents[id];
 r.out=false;r.hmr=0;r.tg=null;r.rest=false;r.queue=[];delete r._ctx;const it=mkItem(r);P.inv.push(it);regCap(it);try{if(G.win==='wInv')renderInv()}catch(_){}HM.stats.bag++;try{HS.save()}catch(_){}HP.say('เก็บ '+r.name+' เข้ากระเป๋าแล้ว',false);return true}
HP.hmToBag=toBag;HP.toBox=id=>{const ok=toBag(id);if(ok)render();return ok};
{const _r=HP.release;HP.release=function(id){const ok=_r.apply(this,arguments);try{render()}catch(_){}return ok}}
/* ---------------- UI ---------------- */
const css=document.createElement('style');css.textContent='#hpMgr{position:fixed;inset:0;z-index:9300;display:none;align-items:center;justify-content:center;background:rgba(2,4,14,.62);font:13px/1.4 "Noto Sans Thai",system-ui,sans-serif;color:#ffe9b0}#hpMgr.in{display:flex}'
+'#hpMgr .pn{width:min(96vw,780px);height:min(92vh,540px);display:flex;flex-direction:column;border-radius:14px;background:rgba(18,12,6,.98);border:1px solid #d6b05c;box-shadow:0 12px 40px rgba(0,0,0,.7);padding:8px 10px 10px;box-sizing:border-box}'
+'#hpMgr .hd{display:flex;align-items:center;gap:8px;margin-bottom:6px}#hpMgr .hd h3{margin:0;font-size:16px;color:#ffd98a;flex:1}#hpMgr .cap{font-size:12px;color:#cfe8ff;padding:2px 9px;border-radius:99px;border:1px solid #6fd0ff;background:#12303a}'
+'#hpMgr .x{width:36px;height:36px;border-radius:9px;border:1px solid #d6b05c;background:#3a2410;color:#ffe9b0;cursor:pointer;font-size:16px;touch-action:manipulation}'
+'#hpMgr .bd{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.35fr);gap:10px}#hpMgr .col{min-height:0;overflow:auto;padding-right:3px;-webkit-overflow-scrolling:touch}'
+'#hpMgr h4{margin:0 0 5px;font-size:13px;color:#ffd98a;position:sticky;top:0;background:rgba(18,12,6,.98);padding:2px 0;z-index:1}'
+'#hpMgr .rw{display:flex;align-items:center;gap:7px;padding:6px 7px;margin-bottom:5px;border-radius:10px;border:1px solid #4a3a26;background:#241b12}#hpMgr .rw canvas{width:34px;height:34px;flex:none}#hpMgr .rw .nm{flex:1;min-width:0}#hpMgr .rw .nm b{display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#hpMgr .rw .nm small{color:#b9b09a;font-size:11px}'
+'#hpMgr .hc{padding:6px 7px;margin-bottom:6px;border-radius:10px;border:1px solid #6a5230;background:#2a2014}#hpMgr .hc .t{display:flex;align-items:center;gap:7px}#hpMgr .hc .t canvas{width:34px;height:34px;flex:none}#hpMgr .hc .t .nm{flex:1;min-width:0}#hpMgr .hc .t b{font-size:13px}#hpMgr .hc .t small{display:block;color:#b9b09a;font-size:11px}'
+'#hpMgr .jb,#hpMgr .ab{display:flex;gap:4px;flex-wrap:wrap;margin-top:5px}#hpMgr button.b{min-height:34px;padding:0 9px;border-radius:9px;border:1px solid #d6b05c;background:#3a2410;color:#ffe9b0;font:700 12px "Noto Sans Thai",system-ui,sans-serif;cursor:pointer;touch-action:manipulation}#hpMgr button.b.on{background:#f2c14e;color:#1d1a10;border-color:#f2c14e}#hpMgr button.b.pri{background:linear-gradient(#d49a3a,#8a5a14);color:#fff}#hpMgr button.b.dng{background:linear-gradient(#6a3a3a,#3f1f1f);border-color:#e0a0a0}#hpMgr button.b:disabled{opacity:.42;cursor:not-allowed}'
+'#hpMgr .fat{height:8px;border-radius:5px;background:#241b12;border:1px solid #4a3a26;overflow:hidden;margin-top:4px}#hpMgr .fat i{display:block;height:100%;background:linear-gradient(#5cd08a,#2a8a5a)}#hpMgr .fat.hi i{background:linear-gradient(#f0a050,#d05030)}#hpMgr .fs{font-size:11px;color:#b9b09a;margin-top:2px}#hpMgr .hint{font-size:11px;color:#9fb2d8;margin-top:3px}#hpMgr .none{color:#9a9078;font-size:12px;padding:8px 2px}'
+'@media (max-width:640px){#hpMgr .bd{grid-template-columns:1fr;overflow:auto}#hpMgr .col{overflow:visible}}'
+'#hpMgrPrompt{position:fixed;left:50%;bottom:calc(250px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:6;display:none;padding:8px 18px;border-radius:999px;background:rgba(20,15,8,.9);border:1px solid #6fd0ff;color:#fff;font-size:13px;cursor:pointer;box-shadow:0 0 18px rgba(111,208,255,.45);white-space:nowrap;touch-action:manipulation}#hpMgrPrompt kbd{display:inline-block;min-width:20px;padding:0 6px;margin-right:6px;border-radius:6px;background:#6fd0ff;color:#06202a;font-weight:700;text-align:center}@media (max-height:520px){#hpMgrPrompt{bottom:calc(172px + env(safe-area-inset-bottom,0px))}}';
document.head.appendChild(css);
const win=document.createElement('div');win.id='hpMgr';document.body.appendChild(win);
const pr=document.createElement('div');pr.id='hpMgrPrompt';document.body.appendChild(pr);
const touchUI=(()=>{try{return matchMedia('(pointer:coarse)').matches}catch(_){return false}})();
pr.innerHTML=(touchUI?'🐾 ':'<kbd>G</kbd>')+'จัดการผู้ช่วย';
for(const el of [win,pr])for(const ev of ['pointerdown','mousedown','touchstart','pointerup','mouseup','touchend'])el.addEventListener(ev,e=>e.stopPropagation());
const J=k=>HP.cfg.jobNames[k]||k;
function ico(r){try{if(window.HELPERCARDS235&&HELPERCARDS235.on){const h=HELPERCARDS235.ico(r);if(h)return h}}catch(_){}return '<canvas width="34" height="34" data-o="1"></canvas>'}
function paintIcons(){for(const c of win.querySelectorAll('canvas[data-o]')){try{const g=c.getContext('2d');g.clearRect(0,0,34,34);g.save();g.scale(34/64,34/64);orbIcon(g);g.restore()}catch(_){}}}
function render(){if(!HM.open)return;const L=roster(),lim=limit();let h='<div class="pn"><div class="hd"><h3>🐾 จัดการผู้ช่วย</h3><span class="cap">ผู้ช่วย '+L.length+'/'+lim+'</span><button class="x" data-a="close" aria-label="ปิด">✕</button></div><div class="bd"><div class="col">';
 for(const S of SOURCES){h+='<h4>'+esc(S.label)+'</h4>';const l=S.list();if(!l.length)h+='<div class="none">'+esc(S.empty)+'</div>';for(const e of l){const r=e.rec;h+='<div class="rw">'+ico(r)+'<div class="nm"><b>'+esc(r.name)+'</b><small>★ ถนัด'+esc(J(r.job))+' เวล '+r.lv+(HP.fat&&r.trait?' · '+esc(HP.traitText(r.trait)):'')+'</small></div><button class="b pri" data-a="give" data-s="'+S.id+'" data-k="'+esc(e.key)+'"'+(L.length>=lim?' title="ผู้ช่วยเต็ม"':'')+'>ให้เป็นผู้ช่วย</button></div>'}}
 h+='</div><div class="col"><h4>ผู้ช่วยตอนนี้</h4>';
 if(!L.length)h+='<div class="none">ยังไม่มีผู้ช่วย · เลือกมอนสเตอร์จากกระเป๋าทางซ้าย</div>';
 for(const r of L){const f=Math.round(r.fat||0);h+='<div class="hc" data-id="'+r.id+'"><div class="t">'+ico(r)+'<div class="nm"><b>'+esc(r.name)+'</b><small>★ ถนัด'+esc(J(r.job))+' เวล '+r.lv+(HP.fat&&r.trait?' · <span style="color:'+HP.traitCol(r.trait)+'">'+esc(HP.traitText(r.trait))+'</span>':'')+'</small></div></div>'
  +'<div class="jb">'+HP.cfg.jobs.map(j=>{const dis=j==='weapon'||!HP.station(j);return '<button class="b'+(r.task===j?' on':'')+'" data-a="job" data-id="'+r.id+'" data-j="'+j+'"'+(dis?' disabled title="'+esc(HP.needText(j))+'"':'')+'>'+(r.job===j?'★ ':'')+esc(J(j))+'</button>'}).join('')+'</div>'
  +(r.task==='farm'&&window.HLPFARM212&&HLPFARM212.on?'<div class="jb"><button class="b'+(r.noHarv?'':' on')+'" data-a="harv" data-id="'+r.id+'" data-v="1">เก็บผักให้</button><button class="b'+(r.noHarv?' on':'')+'" data-a="harv" data-id="'+r.id+'" data-v="0">ปล่อยไว้</button></div><div class="hint">'+(r.noHarv?'ผู้ช่วยรดน้ำอย่างเดียว · คุณเก็บผักเองได้ EXP':'ผู้ช่วยเก็บผักให้: ได้ผัก แต่ไม่ได้ EXP')+'</div>':'')+(HP.cfg.jobs.some(j=>j===r.task&&!HP.station(j))?'<div class="hint">'+esc(HP.needText(r.task))+' (ยังไม่ได้ทำงาน)</div>':'')
  +(HP.fat?'<div class="fat'+(f>=70?' hi':'')+'" data-fb="'+r.id+'"><i style="width:'+f+'%"></i></div><div class="fs" data-fs="'+r.id+'">'+(r.rest?'😴 กำลังพัก':r.out?'💪 ทำงาน':'🛏 พักอยู่ (ไม่ทำงาน)')+' · ความเหนื่อย '+f+'%</div>':'')
  +'<div class="ab">'+(r.out?'':'<button class="b pri" data-a="send" data-id="'+r.id+'">ให้ทำงาน</button>')+'<button class="b" data-a="det" data-id="'+r.id+'">รายละเอียด</button><button class="b" data-a="bag" data-id="'+r.id+'">เก็บเข้ากระเป๋า</button><button class="b dng" data-a="free" data-id="'+r.id+'">ปล่อย</button></div></div>'}
 h+='</div></div></div>';win.innerHTML=h;paintIcons()}
function liveTick(){if(!HM.open||!HP.fat)return;for(const r of roster()){const b=win.querySelector('[data-fb="'+r.id+'"]'),s=win.querySelector('[data-fs="'+r.id+'"]');if(!b||!s)continue;const f=Math.round(r.fat||0);b.firstChild.style.width=f+'%';b.classList.toggle('hi',f>=70);s.textContent=(r.rest?'😴 กำลังพัก':r.out?'💪 ทำงาน':'🛏 พักอยู่ (ไม่ทำงาน)')+' · ความเหนื่อย '+f+'%'}}
setInterval(liveTick,1000);
HM.openWin=function(){if(HM.open)return true;HM.open=true;HM.stats.opened++;try{for(const k in keys)keys[k]=false}catch(_){}win.classList.add('in');pr.style.display='none';render();return true};
HM.closeWin=function(){HM.open=false;win.classList.remove('in');win.innerHTML='';const cf=document.getElementById('hpConfirm');if(cf)cf.classList.remove('in');return true};
HM.render=render;
win.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b){if(e.target===win)HM.closeWin();return}if(b.disabled)return;const a=b.dataset.a,id=b.dataset.id;try{
 if(a==='close')HM.closeWin();
 else if(a==='give')give(b.dataset.s,b.dataset.k);
 else if(a==='job'){HP.setTask(id,b.dataset.j)}
 else if(a==='harv'){const r=HP.list().find(x=>x.id===id);if(r){r.noHarv=b.dataset.v==='0';try{HS.save()}catch(_){}}}
 else if(a==='bag')toBag(id);
 else if(a==='send')HP.send(id);
 else if(a==='det')HP.openMenu(id);
 else if(a==='free')HP.askFree?HP.askFree(id):0;
 render()}catch(er){ERR('click',er)}});
/* ---------------- prompt, key, loop ---------------- */
const canShow=()=>{try{return G.zone===HS.ZID&&!HS.roomOn&&G.state==='play'&&!!P&&!P.dead&&!HS.place&&!HS.busy&&!G.win&&!G.interact&&!(HS.build&&HS.build.on)&&HS.nearExit()}catch(_){return false}};
pr.addEventListener('click',e=>{e.stopPropagation();if(canShow())HM.openWin()});
{const kh=e=>{try{if(HM.open){if(e.key==='Escape'){const cf=document.getElementById('hpConfirm'),mn=document.getElementById('hpMenu');if(cf&&cf.classList.contains('in'))return false;if(mn&&mn.classList.contains('in'))return false;HM.closeWin();e.stopImmediatePropagation();e.preventDefault();return true}if(/^[fFgG]$/.test(e.key||'')){e.stopImmediatePropagation();e.preventDefault();return true}return false}
  if((e.key==='g'||e.key==='G')&&!e.repeat&&canShow()){HM.openWin();e.stopImmediatePropagation();e.preventDefault();return true}}catch(er){ERR('key',er)}return false};if(window.__EK)window.__EK.unshift(kh);else addEventListener('keydown',e=>{kh(e)},true)}
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{const ok=canShow();if(HM.open){if(!ok){HM.closeWin()}}else{const v=ok?'block':'none';if(pr.style.display!==v)pr.style.display=v}}catch(e){ERR('tick',e)}return r}}
/* GM (only with ?gm=on) */
HM.gmAdd=function(n){const ids=Object.keys(MOBS).filter(k=>!MOBS[k].boss&&!MOBS[k].retired&&!/^(raid_|gb_|ge_|gp_|dev|c182|m10ref)/.test(k));for(let i=0;i<(n||3);i++)HP.newRec(ids[Math.floor(Math.random()*ids.length)],false,1);return P.inv.filter(isCap).length};
if(/[?&]gm=on\b/.test(Q)){let n=0;const iv=setInterval(()=>{try{const gm=document.getElementById('houseGm');if(gm&&!gm.dataset.hm){gm.dataset.hm='1';const b=document.createElement('button');b.type='button';b.textContent='🐾 GM: มอนเข้ากระเป๋า ×3';b.style.cssText='font-size:11px;margin:1px;padding:2px 5px';for(const ev of ['pointerdown','mousedown','touchstart'])b.addEventListener(ev,e=>e.stopPropagation());b.addEventListener('click',e=>{e.stopPropagation();HM.gmAdd(3)});gm.appendChild(b);clearInterval(iv)}else if(++n>60)clearInterval(iv)}catch(_){clearInterval(iv)}},1000)}
HM.ready=true;
})();

