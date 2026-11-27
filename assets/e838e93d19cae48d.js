
/* ---- r197 rodtier (TEST ONLY): 7 fishing rod tiers, Balance r1.9b APPROVED by DeaRz 23 Nov 17:49 UTC ("Okผ่าน", Balance thread),
   file balance/approved/BALANCE_housing_fishing_v1.md section r1.9b. Built on r195 (fishpose195 = hold the rod, click to cast).
   - 7 bag items: fishRod (1 เบ็ดไม้ธรรมดา) + fishRod2..fishRod7. Bag "ใช้" = hold that rod (again = put away; another rod = switch).
   - The held rod sets the catch chances (base uncommon 25 %, rare 6 %, very rare 1.5 %, shiny 1 %, x the rod; "-" = cannot bite; the rest = common),
     the green zone width (x1.00..x1.30) and the bite wait (x1.00..x0.75).
   - Emma (the shop that sells the pond): rods 1-3 for gold; rod 4 needs 30 Fish Tokens; rods 5-7 come from the fish collection page.
     Fish Tokens and the collection page are NOT in the game yet, so rods 4-7 cannot be obtained in this TEST except by GM (?gm=on button).
   - Legendary fish (rods 6-7, event only, r1.8) is NOT in this build.
   - Icons are code-drawn placeholders until Art draws 7 rod icons; the rod in hand looks the same for every tier.
   ?rodtier=off = r195 single rod. Debug window.ROD197 ---- */
(function(){'use strict';
const Q=String(location.search);
const R=window.ROD197={ver:'rodtier-r197',on:!/[?&]rodtier=off\b/.test(Q)&&!/[?&]fishrod=off\b/.test(Q),gm:/[?&]gm=on\b/.test(Q),err:null,tier:1,stats:{rolls:0,byRar:{},shiny:0,bought:0,refused:0,switch:0},log:[]};
if(!R.on)return;
const ERR=(w,e)=>{R.err=w+': '+((e&&e.message)||e);try{console.error('[ROD197]',w,e)}catch(_){}};
const FS=()=>window.__FISHING,PO=()=>window.FISHPOSE195;
const say=(m,bad)=>{try{const f=FS();if(f&&f.say){f.say(m,bad);return}}catch(_){}try{toast(m)}catch(_){}};
/* Balance r1.9b table. u/r/v/s = multipliers on uncommon / rare / very rare / shiny (0 = cannot bite). zone = green zone x, wait = bite wait x. */
const T=R.T=[null,
 {id:'fishRod', n:'เบ็ดไม้ธรรมดา',  g:150,   tok:0,  how:'shop', u:1.0,r:0,  v:0,  s:1.0,zone:1.00,wait:1.00,col:'#7a4e26',tip:'#d8b25a'},
 {id:'fishRod2',n:'เบ็ดไม้ไผ่',     g:600,   tok:0,  how:'shop', u:1.0,r:.7, v:0,  s:1.0,zone:1.05,wait:1.00,col:'#8fae4a',tip:'#e8e0a0'},
 {id:'fishRod3',n:'เบ็ดอย่างดี',    g:2000,  tok:0,  how:'shop', u:1.1,r:1.0,v:.5, s:1.0,zone:1.10,wait:.95, col:'#5a3a22',tip:'#e0b050'},
 {id:'fishRod4',n:'เบ็ดเงิน',       g:6000,  tok:30, how:'shop', u:1.2,r:1.2,v:1.0,s:1.2,zone:1.15,wait:.90, col:'#c8ccd6',tip:'#ffffff'},
 {id:'fishRod5',n:'เบ็ดคริสตัลน้ำ', g:15000, tok:100,how:'coll', u:1.3,r:1.4,v:1.3,s:1.4,zone:1.20,wait:.85, col:'#6fd0f0',tip:'#e6fbff'},
 {id:'fishRod6',n:'เบ็ดเกล็ดมังกร', g:40000, tok:300,how:'coll', vr:1,u:1.4,r:1.6,v:1.6,s:1.6,zone:1.25,wait:.80, col:'#3f8f6a',tip:'#ffd36a'},
 {id:'fishRod7',n:'เบ็ดเทพสมุทรฟ้า',g:100000,tok:800,how:'coll', vr:3,u:1.5,r:1.8,v:2.0,s:2.0,zone:1.30,wait:.75, col:'#2a5fd0',tip:'#ffe48a'}];
const BASE=R.BASE={u:.25,r:.06,v:.015,s:.01};
const tierOfId=id=>{for(let i=1;i<=7;i++)if(T[i].id===id)return i;return 0};
R.tierOfId=tierOfId;
try{const v=+localStorage.getItem('lf_rod197');if(v>=1&&v<=7)R.tier=v}catch(_){}
const held=()=>{const p=PO();return !!(p&&p.rod&&p.hold)};
/* ---- items ---- */
function icon(t){return g=>{try{g.save();g.lineCap='round';g.strokeStyle='#2a1a0c';g.lineWidth=6;g.beginPath();g.moveTo(14,54);g.lineTo(22,44);g.stroke();g.strokeStyle=t.col;g.lineWidth=4;g.beginPath();g.moveTo(22,44);g.quadraticCurveTo(38,22,54,8);g.stroke();
 g.fillStyle=t.tip;for(const [x,y] of [[32,30],[41,20],[48,13]]){g.beginPath();g.arc(x,y,2,0,6.283);g.fill()}g.fillStyle='#8c8f96';g.beginPath();g.arc(24,50,6,0,6.283);g.fill();g.strokeStyle=t.tip;g.lineWidth=2;g.stroke();
 g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=1.2;g.beginPath();g.moveTo(54,8);g.quadraticCurveTo(58,30,52,48);g.stroke();g.fillStyle='#e0402e';g.beginPath();g.arc(52,50,4,Math.PI,0);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(52,50,4,0,Math.PI);g.fill();
 const k=T.indexOf(t);g.fillStyle='rgba(0,0,0,.6)';g.fillRect(2,2,20,18);g.fillStyle=k>=6?'#ffd36a':'#fff';g.font='bold 15px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(String(k),12,11);g.restore()}catch(_){}}}
const pct=x=>(Math.round(x*1000)/10)+'%';
function desc(k){const t=T[k];const ch=['ไม่สามัญ x'+t.u,t.r?'หายาก x'+t.r:'หายาก ไม่ได้',t.v?'หายากมาก x'+t.v:'หายากมาก ไม่ได้','ปลาแวววาว x'+t.s];
 const how=t.how==='shop'?('ร้าน Emma '+t.g.toLocaleString()+' G'+(t.tok?' + Fish Token '+t.tok:'')):(t.g.toLocaleString()+' G + Fish Token '+t.tok+(t.vr?' + ปลาหายากมาก '+t.vr+' ตัว':'')+' (หน้าสะสมปลา)');
 return 'เบ็ดระดับ '+k+' · กด ใช้ เพื่อถือเบ็ดนี้ (กดอีกครั้งเพื่อเก็บ) · '+ch.join(' · ')+' · ช่องเขียว x'+t.zone.toFixed(2)+' · รอปลากิน x'+t.wait.toFixed(2)+(k>=6?' · ตกปลาในตำนานได้ช่วงอีเวนต์':'')+' · '+how+' · ไม่มีวันพัง'}
function regItems(){try{if(typeof ITEMS==='undefined')return false;for(let k=1;k<=7;k++){const t=T[k];ITEMS[t.id]=Object.assign(ITEMS[t.id]||{},{n:t.n,d:desc(k),k:'use',col:k>=6?'#ffc23a':k>=4?'#b8e0ff':'#c9a35a',icon:icon(t),price:t.g,sell:Math.round(t.g*.5)})}return true}catch(e){ERR('items',e);return false}}
regItems();{let n=0;const iv=setInterval(()=>{if(regItems()&&++n>4)clearInterval(iv)},1500)}
/* ---- use = hold / switch / put away ---- */
function setTier(k){R.tier=k;try{localStorage.setItem('lf_rod197',String(k))}catch(_){}}
try{const _u=useItemId;useItemId=function(id){try{const k=tierOfId(id);const p=PO();if(k&&p&&p.rod&&p.setHold){
   if(p.hold&&R.tier===k){p.setHold(false,'เก็บ'+T[k].n+'แล้ว')}
   else if(p.hold){const f=FS();if(f&&f.st)f.cancel('เปลี่ยนเบ็ด');setTier(k);R.stats.switch++;say('เปลี่ยนเป็น'+T[k].n+'แล้ว')}
   else{setTier(k);p.setHold(true);say('ถือ'+T[k].n+'แล้ว · คลิก/แตะที่บ่อเพื่อเหวี่ยงเบ็ด')}
   try{if(G.win==='wInv')closeWin()}catch(_){}return}}catch(e){ERR('use',e)}return _u.apply(this,arguments)}}catch(e){ERR('hook use',e)}
/* if the held rod is no longer in the bag (sold), fall back to the best rod owned */
function best(){for(let k=7;k>=1;k--){try{if(countItem(T[k].id)>0)return k}catch(_){}}return 0}
setInterval(()=>{try{if(!held())return;if(countItem(T[R.tier].id)>0)return;const b=best();if(b)setTier(b);else PO().setHold(false,'ไม่มีเบ็ดในกระเป๋าแล้ว')}catch(_){}},1000);
/* ---- roll: rarity by the held rod, species inside the rarity by the game's own weights, then shiny ---- */
function rollTier(rnd){const t=T[R.tier]||T[1];const u=BASE.u*t.u,r=BASE.r*t.r,v=BASE.v*t.v;const x=rnd();if(x<v)return 'veryrare';if(x<v+r)return 'rare';if(x<v+r+u)return 'uncommon';return 'common'}
R.chances=k=>{const t=T[k];const u=BASE.u*t.u,r=BASE.r*t.r,v=BASE.v*t.v;return {common:pct(1-u-r-v),uncommon:pct(u),rare:pct(r),veryrare:pct(v),shiny:pct(BASE.s*t.s)}};
const isShinyId=id=>/_s$/.test(id);
function pickIn(rar,h,rnd){const f=FS();const ids=f.fishIds.filter(k=>f.cfg.fish[k].r===rar&&!isShinyId(k));if(!ids.length)return null;let tb={};try{tb=f.table(h)}catch(_){}
 let w=ids.map(k=>+tb[k]||0);let sum=w.reduce((a,b)=>a+b,0);if(!(sum>0)){/* very rare species carry weight 0 in the table (they were injected): use the extra module's split if any, else even */
  let sp=null;try{sp=window.__FISHEXTRA&&__FISHEXTRA.cfg&&__FISHEXTRA.cfg.vrSplit}catch(_){}w=ids.map(k=>sp&&sp[k]>0?sp[k]:1);sum=w.reduce((a,b)=>a+b,0)}
 let q=rnd()*sum;for(let i=0;i<ids.length;i++){q-=w[i];if(q<0)return ids[i]}return ids[ids.length-1]}
function hookRoll(){const f=FS();if(!f||!f.roll||!f.cfg||!f.cfg.rar)return false;if(f._r197)return true;f._r197=1;const o=f.roll;R.origRoll=o;
 f.roll=function(h,rnd){try{if(held()){const RN=rnd||Math.random;let rar=rollTier(RN);if(!f.cfg.rar[rar])rar='common';let id=pickIn(rar,h,RN);if(!id){rar='common';id=pickIn('common',h,RN)}
   if(id){const t=T[R.tier]||T[1];if(RN()<BASE.s*t.s&&f.cfg.fish[id+'_s']){id=id+'_s';R.stats.shiny++}R.stats.rolls++;R.stats.byRar[rar]=(R.stats.byRar[rar]|0)+1;return id}}}catch(e){ERR('roll',e)}return o.apply(this,arguments)};
 /* bite wait: wrap cast (outside r195's wrapper) */
 const _c=f.cast;f.cast=function(){const r=_c.apply(this,arguments);try{if(r&&f.st&&held()&&!f.st._r197){f.st._r197=1;const t=T[R.tier]||T[1];f.st.wait*=t.wait;R.log.push(['wait',R.tier,+f.st.wait.toFixed(2)]);if(R.log.length>40)R.log.shift()}}catch(e){ERR('wait',e)}return r};
 return true}
/* green zone: scale every rarity's zone while a rod is held (the bar reads FS.cfg.rar[rar].zone) */
let Z0=null;function zones(){try{const f=FS();if(!f||!f.cfg||!f.cfg.rar)return;if(!Z0){Z0={};for(const k in f.cfg.rar)Z0[k]=f.cfg.rar[k].zone}const m=held()?((T[R.tier]||T[1]).zone):1;for(const k in f.cfg.rar){if(Z0[k]==null)Z0[k]=f.cfg.rar[k].zone;f.cfg.rar[k].zone=Math.min(.9,Z0[k]*m)}R.zoneMul=m}catch(e){ERR('zone',e)}}
R.Z0=()=>Z0;
{let n=0;const iv=setInterval(()=>{if(hookRoll()||++n>240)clearInterval(iv)},500)}
setInterval(zones,250);
/* ---- Emma's shop: rods 1-4 (rod 1 at the approved 150 G; r195's own rod row is then skipped) ---- */
try{const p=PO();if(p){p.price=T[1].g;p.sell=Math.round(T[1].g*.5)}}catch(_){}
function hookShop(){try{const SW=window.__SHOPWIN;if(!SW||!SW.openNpc||!SW._r195)return false;if(SW._r197)return true;SW._r197=1;const o=SW.openNpc;
 SW.openNpc=function(a){try{if(a&&a.list&&a.list.some(r=>r&&r.id==='fishPond')&&!a.list.some(r=>r&&r.id==='fishRod2')){a.list=a.list.filter(r=>!(r&&r.id==='fishRod')).concat([1,2,3,4].map(k=>({id:T[k].id,p:T[k].g})));const b=a.buy;
   a.buy=function(id,price,qty){const k=tierOfId(id);if(k<1)return b.apply(this,arguments);const t=T[k];
    if(countItem(t.id)>0){say('มี'+t.n+'อยู่แล้ว',true);return 0}
    if(t.tok){R.stats.refused++;say(t.n+' ต้องใช้ '+t.g.toLocaleString()+' G + Fish Token '+t.tok+' · ระบบ Fish Token ยังไม่มีในเกม',true);return 0}
    if((P.gold|0)<t.g){say('ทองไม่พอ',true);return 0}let ok=false;try{ok=addItem({id:t.id,q:1})!==false}catch(_){}if(!ok)return 0;P.gold-=t.g;R.stats.bought++;try{saveGame()}catch(_){}return 1}}}catch(e){ERR('shop',e)}return o.apply(this,arguments)};return true}catch(e){ERR('hookShop',e);return true}}
{let n=0;const iv=setInterval(()=>{if(hookShop()||++n>240)clearInterval(iv)},500)}
/* ---- GM: rods 1-7 into the bag ---- */
if(R.gm){let n=0;const iv=setInterval(()=>{try{const gm=document.getElementById('houseGm');if(gm&&!gm.dataset.r197){gm.dataset.r197='1';const bt=document.createElement('button');bt.type='button';bt.textContent='🎣 GM: เบ็ด 1-7 → กระเป๋า';bt.style.cssText='font-size:11px;margin:1px;padding:2px 5px';for(const ev of ['pointerdown','mousedown','touchstart'])bt.addEventListener(ev,e=>e.stopPropagation());bt.addEventListener('click',e=>{e.stopPropagation();for(let k=1;k<=7;k++)if(countItem(T[k].id)<1)addItem({id:T[k].id,q:1});say('GM: ใส่เบ็ด 1-7 ลงกระเป๋าแล้ว')});gm.appendChild(bt);clearInterval(iv)}else if(++n>60)clearInterval(iv)}catch(_){clearInterval(iv)}},1000)}
})();

