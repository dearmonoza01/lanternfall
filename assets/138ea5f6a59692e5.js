
/* ---- spweapon-r1 (TEST, 10 Nov 2026): special-weapon unlock + drops (DeaRz 11:27 rules; Balance draft BALANCE_special_weapon_unlock_drops_v1, ALL NUMBERS ARE PLACEHOLDERS, not approved) ----
   Special weapons in this build: scythe (equip gate Lv30, drops used to be behind ?scythe=on) and knuckle (puppet punch pose exists; the game had NO knuckle weapon item, so a minimal one is registered here as an alias of the sword tables).
   Unlock flag per weapon: P.spUnlock = {scythe:true, knuckle:true}; box counter P.spPity. Saved into the save json + the character slot (same way as P.pLook), old saves start locked, except knuckle when the Monk Suri quest
   (MONKQ.S.learned, affinity 100 quest) is already done. A LOCKED special weapon never drops (dropLoot guard + removed from WTYPES). Special Weapon Box -> 1/2/3 shards of ONE locked weapon -> 50 shards = fuse -> book -> unlock + 1 weapon.
   Flag ?spweapon=off disables everything. ?gm=on: GM buttons (+50 shards, reset unlocks). Debug: window.SPW. ---- */
(function(){'use strict';
const Q=String(location.search);
const SP=window.SPW={ver:'spweapon-r2',on:!/[?&]spweapon=off\b/.test(Q),err:null,blocked:0,log:[],
  cfg:{weapons:['scythe','knuckle'],th:{scythe:'เคียว',knuckle:'สนับมือ'},
    box:{boss:2,elite:.25,mob:.004},                 /* boss: 100% x2 boxes; elite 25%; ordinary 0.4% */
    shards:{n:[1,2,3],w:[70,25,5]},pity:15,fuse:50,  /* soft pity: the 15th box without a 3-shard result is a guaranteed 3 */
    book:{grade:[[2,80],[3,20]]},                       /* DeaRz 14:55: the book guarantees Rare or better: Rare 80 / Epic 20 (RARITY index 2 / 3) */
    drop:{mob:.0003,elite:.01,boss:.05,grade:[[0,62],[2,30],[3,8]]}}};
const ERR=(w,e)=>{SP.err=w+': '+((e&&e.message)||e);try{console.error('[SPW]',w,e)}catch(_){}};
if(!SP.on)return;
const C=SP.cfg,W=C.weapons;
/* ------------------------------------------------ knuckle weapon item (minimal; alias of the sword tables like the scythe module does) */
try{
  if(!WEAPONS.knuckle){
    WEAPONS.knuckle=Object.assign({},WEAPONS.sword,{n:'Knuckle',th:'สนับมือ',aspd:1.9,range:78,arc:1.5,mult:.85,f:.9,w:46});
    WNAMES.knuckle=['Iron Fist','Monk Knuckle','Tiger Claw'];
    try{WPAL.knuckle=Object.assign({},WPAL.sword)}catch(_){}
    try{WHOOSH.knuckle=Object.assign({},WHOOSH.sword)}catch(_){}
    const al=o=>{try{if(o&&o.sword&&!o.knuckle)o.knuckle=o.sword}catch(_){}};
    for(const o of [()=>SIZE_TABLE,()=>WEAPON_CLS,()=>WCLS,()=>WSCALE,()=>COMBO_N,()=>WLEN,()=>WHAND,()=>WCLASS])try{al(o())}catch(_){}
    try{const w=COLCMB.data.weapons;if(w&&!w.knuckle&&w.sword)w.knuckle=Object.assign(JSON.parse(JSON.stringify(w.sword)),{baseInterval:+(1/1.9).toFixed(4)})}catch(e){ERR('knuckle combat data',e)}
    try{const _ic=itemIcon;itemIcon=function(it){if(it&&it.kind==='wpn'&&it.t==='knuckle'&&!it.img){const k='knuckle'+it.rar;if(ICONS[k])return ICONS[k];const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
      g.globalCompositeOperation='lighter';g.drawImage(glowSprite(RARITY[it.rar].c),0,0,64,64);g.globalCompositeOperation='source-over';
      g.fillStyle='#caa27a';g.strokeStyle=RARITY[it.rar].c;g.lineWidth=2.5;g.beginPath();g.roundRect?g.roundRect(14,22,36,22,7):g.rect(14,22,36,22);g.fill();g.stroke();
      g.fillStyle='#8a6a48';for(let i=0;i<4;i++){g.beginPath();g.arc(20+i*8,22,4.2,Math.PI,0);g.fill();g.stroke()}
      return ICONS[k]=c.toDataURL()}return _ic.apply(this,arguments)}}catch(e){ERR('knuckle icon',e)}
  }
  /* basic attack: the game's basicAttack only knows the weapon types in its switch; the knuckle punches with the spear combo (jab, double jab, hook arc) using the KNUCKLE numbers (range / mult / aspd), everything else is the normal basic attack chain */
  try{const _ba=basicAttack;basicAttack=function(){const w=P&&P.weapon;if(!w||w.t!=='knuckle')return _ba.apply(this,arguments);const d0=WEAPONS.spear;w.t='spear';WEAPONS.spear=WEAPONS.knuckle;try{return _ba.apply(this,arguments)}finally{w.t='knuckle';WEAPONS.spear=d0}}}catch(e){ERR('knuckle attack',e)}
  /* weapon skill window (mastery): own line, no skills yet (the game has no knuckle skills), same shape as the other weapons */
  try{const W_=window.__WSK;if(W_&&W_.lines&&!W_.lines.knuckle)W_.lines.knuckle={title:'ทักษะสายสนับมือ',cols:[{name:'โจมตี',skills:[]},{name:'บัฟ / สนับสนุน',skills:[]},{name:'พาสซีฟ',skills:[]}]}}catch(e){ERR('knuckle line',e)}
}catch(e){ERR('knuckle',e)}
/* ------------------------------------------------ items: box / shards / books */
const mkIcon=(col,kind)=>g=>{try{g.globalCompositeOperation='lighter';g.drawImage(glowSprite(col),4,4,56,56);g.globalCompositeOperation='source-over';
  if(kind==='box'){g.fillStyle='#5a3a1c';g.fillRect(12,24,40,26);g.fillStyle=col;g.fillRect(12,24,40,7);g.fillRect(29,24,6,26);g.strokeStyle='#ffe3a0';g.lineWidth=2;g.strokeRect(12,24,40,26);g.fillStyle='#fff6d8';g.beginPath();g.arc(32,18,4,0,6.283);g.fill()}
  else if(kind==='shard'){g.fillStyle='#efe4c8';g.beginPath();g.moveTo(18,14);g.lineTo(42,10);g.lineTo(48,34);g.lineTo(36,52);g.lineTo(16,44);g.closePath();g.fill();g.strokeStyle=col;g.lineWidth=2.5;g.stroke();g.strokeStyle='#8a6a40';g.lineWidth=1.5;for(let i=0;i<3;i++){g.beginPath();g.moveTo(22,20+i*8);g.lineTo(38,18+i*8);g.stroke()}}
  else{g.fillStyle='#3a2a58';g.fillRect(14,10,36,44);g.fillStyle=col;g.fillRect(14,10,6,44);g.strokeStyle='#ffe3a0';g.lineWidth=2;g.strokeRect(14,10,36,44);g.fillStyle='#ffe9b0';g.beginPath();g.arc(35,32,8,0,6.283);g.fill();g.fillStyle='#3a2a58';g.beginPath();g.arc(38,30,7,0,6.283);g.fill()}}catch(_){}};
ITEMS.spBox={n:'Special Weapon Box (กล่องอาวุธพิเศษ)',d:'เปิดแล้วได้เศษหนังสืออาวุธพิเศษ 1-3 ชิ้น (ของอาวุธที่ยังไม่ปลดล็อก 1 ชนิด) · คลิกเพื่อเปิด',k:'use',col:'#ffb04c',icon:mkIcon('#ffb04c','box'),sell:0};
for(const w of W){const th=C.th[w];
  ITEMS['it_weapon_book_shard_'+w]={n:'เศษตำราอาวุธ ('+th+')',d:'หน้ากระดาษขาดจากตำราของนักรบรุ่นก่อน ปลิวกระจายไปทั่วตั้งแต่คืนตะเกียงแตก รวมให้ครบ '+C.fuse+' แผ่นจะอ่านออก',k:'use',col:'#d9b86a',icon:mkIcon('#d9b86a','shard'),sell:0};
  ITEMS['it_weapon_book_'+w]={n:'ตำราอาวุธพิเศษ ('+th+')',d:'ตำราที่ต่อครบแล้ว เปิดอ่านเพื่อเรียนรู้อาวุธชิ้นนี้',k:'use',col:'#b56cff',icon:mkIcon('#b56cff','book'),sell:0}}
/* ------------------------------------------------ state */
const SK_='lanternfall_spw_v1';   /* per character slot (slot number + name): a death, an exp change or a new character cannot mix it up */
const charKey=()=>{try{if(typeof CH!=='undefined'&&CH&&CH.cur>=0&&CH.list&&CH.list[CH.cur])return CH.cur+':'+(CH.list[CH.cur].name||'')}catch(_){}return 'solo'};
const readAll=()=>{try{return JSON.parse(localStorage.getItem(SK_)||'{}')||{}}catch(_){return {}}};
function initState(){const sv=readAll()[charKey()];
  P.spUnlock=Object.assign({},(sv&&sv.unlock&&typeof sv.unlock==='object')?sv.unlock:{});P.spPity=(sv&&sv.pity)|0;P.spPityW=Object.assign({},(sv&&sv.pityW&&typeof sv.pityW==='object')?sv.pityW:{});P._spInit=1;P._spKey=charKey()}
function persist(){try{if(!P||P._spInit!==1)return;const a=readAll();a[P._spKey||charKey()]={unlock:P.spUnlock,pity:P.spPity|0,pityW:P.spPityW||{}};localStorage.setItem(SK_,JSON.stringify(a))}catch(e){ERR('persist',e)}}
SP.persist=persist;const U=()=>{if(!P)return {};if(P._spInit!==1)initState();return P.spUnlock};
const isLocked=w=>!U()[w];
const lockedList=()=>W.filter(isLocked);
function questSync(){try{if(window.MONKQ&&MONKQ.S&&MONKQ.S.learned&&isLocked('knuckle')){U().knuckle=true;SP.log.push('knuckle unlocked by the Monk Suri quest')}}catch(_){}}
const wpick=a=>{let t=0;for(const x of a)t+=x[1];let r=rng()*t;for(const x of a){r-=x[1];if(r<=0)return x[0]}return a[a.length-1][0]};
/* ------------------------------------------------ drops */
function roll(kind,L){const out={boxes:0,weapons:[]};
  if(lockedList().length){if(kind==='boss')out.boxes=C.box.boss;else if(rng()<C.box[kind])out.boxes=1}
  for(const w of W)if(!isLocked(w)&&rng()<C.drop[kind])out.weapons.push({t:w,rar:wpick(C.drop.grade)});
  return out}
SP.roll=roll;
function spawn(x,y,kind,L){const r=roll(kind,L);
  if(r.boxes)dropLoot(x,y,{item:{id:'spBox',q:r.boxes},_sp:1});
  for(const d of r.weapons)dropLoot(x,y,{item:makeWeapon(d.t,Math.max(1,P.lvl|0),d.rar),_sp:1,rare:0});
  return r}
try{const _k=killEnemy;killEnemy=function(e){const was=e&&e.dead;const r=_k.apply(this,arguments);
  try{if(e&&!was&&e.dead&&!e._spDone&&P&&!P.dead){e._spDone=1;const m=e.m||{};spawn(e.x,e.y,m.boss?'boss':(m.elite||e.eliteX)?'elite':'mob',e.L|0)}}catch(er){ERR('kill',er)}return r}}catch(e){ERR('hook kill',e)}
/* a locked special weapon never drops: guard on every weapon loot, special types are also removed from the generic drop table */
try{const _dl=dropLoot;dropLoot=function(x,y,o){try{const it=o&&o.item;if(it&&it.kind==='wpn'&&W.includes(it.t)&&(!o._sp||isLocked(it.t))){if(isLocked(it.t)||!o._sp){SP.blocked++;return}}}catch(er){ERR('dropLoot',er)}return _dl.apply(this,arguments)}}catch(e){ERR('hook dropLoot',e)}
function stripTable(){try{for(const w of W){const i=WTYPES.indexOf(w);if(i>=0)WTYPES.splice(i,1)}}catch(_){}}
stripTable();setInterval(stripTable,2000);
/* ------------------------------------------------ box / fuse / book */
const hasRoom=id=>!!P.inv.find(x=>x.id===id)||P.inv.length<P.invSize;
const say=(m,c)=>{try{log(m,c||'g')}catch(_){}try{textAt(P.x,P.y-70,m,'#ffe08a',13,{life:1.4})}catch(_){}};
function openBox(){if(!P||P.dead)return false;if(countItem('spBox')<1)return false;const lk=lockedList();
  if(!lk.length){const g=Math.max(1,P.lvl|0)*40;takeItem('spBox',1);P.gold+=g;say('ปลดล็อกอาวุธพิเศษครบแล้ว — กล่องให้ทอง '+g+' G');SP.log.push('box -> gold '+g);if(G.win==='wInv')renderInv();return {gold:g}}
  U();P.spPityW=P.spPityW||{};
  const due=lk.filter(x=>(P.spPityW[x]|0)>=C.pity);const w=due.length?due[0]:lk[Math.floor(rng()*lk.length)];if(!hasRoom('it_weapon_book_shard_'+w)){say('กระเป๋าเต็ม','r');return false}
  const n=wpick(C.shards.n.map((v,i)=>[v,C.shards.w[i]]));
  P.spPity=(P.spPity|0)+1;for(const x of lk)P.spPityW[x]=x===w?0:(P.spPityW[x]|0)+1;   /* soft pity per weapon: after 15 boxes without a shard of a still-locked weapon, the 16th box gives that weapon */
  takeItem('spBox',1);addItem({id:'it_weapon_book_shard_'+w,q:n});say('ได้ '+ITEMS['it_weapon_book_shard_'+w].n+' x'+n);SP.log.push('box -> '+w+' x'+n);
  persist();if(G.win==='wInv')renderInv();return {w,n}}
function fuse(w){if(!W.includes(w)||countItem('it_weapon_book_shard_'+w)<C.fuse)return false;
  takeItem('it_weapon_book_shard_'+w,C.fuse);if(!addItem({id:'it_weapon_book_'+w,q:1})){addItem({id:'it_weapon_book_shard_'+w,q:C.fuse});say('กระเป๋าเต็ม','r');return false}
  say('ผสมได้ '+ITEMS['it_weapon_book_'+w].n);SP.log.push('fuse '+w);persist();if(G.win==='wInv')renderInv();return true}
function useBook(w){if(!W.includes(w)||countItem('it_weapon_book_'+w)<1)return false;
  if(!isLocked(w)){say('ปลดล็อก'+C.th[w]+'ไปแล้ว','r');return false}
  takeItem('it_weapon_book_'+w,1);U()[w]=true;limits();const rar=wpick(C.book.grade),it=makeWeapon(w,Math.max(1,P.lvl|0),rar);
  if(!addItem(it))dropLoot(P.x,P.y,{item:it,_sp:1});
  say('ปลดล็อกอาวุธพิเศษ: '+C.th[w]+' ('+RARITY[rar].g+')');SP.log.push('book '+w+' rar '+rar);persist();if(G.win==='wInv')renderInv();return {w,rar}}
Object.assign(SP,{open:openBox,fuse,book:useBook,state:()=>({unlock:Object.assign({},U()),pity:P.spPity|0,locked:lockedList(),blocked:SP.blocked,box:countItem('spBox'),shards:Object.fromEntries(W.map(w=>[w,countItem('it_weapon_book_shard_'+w)])),books:Object.fromEntries(W.map(w=>[w,countItem('it_weapon_book_'+w)]))})});
try{const _u=useItemId;useItemId=function(id){try{if(id==='spBox')return openBox();
    if(typeof id==='string'&&id.startsWith('it_weapon_book_shard_')){const w=id.slice('it_weapon_book_shard_'.length);if(countItem(id)>=C.fuse)return fuse(w);say('เศษ'+C.th[w]+' '+countItem(id)+' / '+C.fuse,'v');return}
    if(typeof id==='string'&&id.startsWith('it_weapon_book_')&&!id.startsWith('it_weapon_book_shard_'))return useBook(id.slice('it_weapon_book_'.length))}catch(e){ERR('use',e)}return _u.apply(this,arguments)}}catch(e){ERR('hook use',e)}
/* inventory: fuse button when 50 shards of one weapon */
function fuseUI(){try{const body=document.getElementById('invBody');if(!body)return;const old=document.getElementById('spFuse');if(old)old.remove();
  const ok=W.filter(w=>countItem('it_weapon_book_shard_'+w)>=C.fuse);if(!ok.length)return;
  const d=document.createElement('div');d.id='spFuse';d.style.cssText='margin:0 0 8px;padding:6px 8px;border:1px solid #d9b86a;border-radius:8px;background:rgba(80,56,20,.55);display:flex;gap:8px;flex-wrap:wrap;align-items:center;font-size:13px';
  d.innerHTML='<span>ครบ '+C.fuse+' ชิ้น:</span>'+ok.map(w=>'<button type="button" class="btn gold" data-spfuse="'+w+'">ผสมเป็นตำรา'+C.th[w]+'</button>').join('');
  body.insertBefore(d,body.firstChild)}catch(e){ERR('fuseUI',e)}}
try{const _ri=renderInv;renderInv=function(){const r=_ri.apply(this,arguments);fuseUI();return r}}catch(e){ERR('hook renderInv',e)}
document.addEventListener('click',e=>{try{const b=e.target.closest&&e.target.closest('[data-spfuse]');if(!b)return;e.stopPropagation();e.preventDefault();fuse(b.getAttribute('data-spfuse'))}catch(er){ERR('fuse click',er)}},true);
setInterval(()=>{try{if(!P)return;if(P._spInit===1&&P._spKey!==charKey())P._spInit=0;U();questSync();persist();
  /* scythe / knuckle have NO level limit once unlocked (DeaRz 14:55): the scythe module's equip gate (Lv 30) is lifted for an unlocked scythe */
  limits()}catch(e){ERR('tick',e)}},500);
function limits(){try{const T=window.__SCY&&__SCY.tbl;if(T){if(T._minLv0===undefined)T._minLv0=T.minLv;T.minLv=(U().scythe||/[?&]scythe=on\b/.test(location.search))?0:T._minLv0}}catch(_){}}
SP.limits=limits;
/* ------------------------------------------------ GM buttons */
if(/[?&]gm=on\b/.test(Q)){const iv=setInterval(()=>{try{if(document.getElementById('spwGM')||!document.body)return;const box=document.createElement('div');box.id='spwGM';
  box.style.cssText='position:fixed;left:6px;bottom:140px;z-index:9000;display:flex;gap:4px;flex-direction:column;font:12px system-ui,sans-serif';
  const mk=(t,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.style.cssText='padding:5px 8px;border-radius:8px;border:1px solid #d9b86a;background:rgba(40,30,10,.88);color:#ffe9b0;min-height:32px';
    for(const ev of ['pointerdown','pointerup','mousedown','touchstart'])b.addEventListener(ev,e=>e.stopPropagation());b.addEventListener('click',e=>{e.stopPropagation();try{fn()}catch(er){ERR('gm',er)}});box.appendChild(b)};
  mk('📜 +50 เศษ (ทุกอาวุธ)',()=>{for(const w of W){if(isLocked(w))addItem({id:'it_weapon_book_shard_'+w,q:50})}if(G.win==='wInv')renderInv();persist()});
  mk('📦 +5 กล่อง',()=>{addItem({id:'spBox',q:5});if(G.win==='wInv')renderInv()});
  mk('🔒 รีเซ็ตปลดล็อก',()=>{U();P.spUnlock={};P.spPity=0;P.spPityW={};questSync();persist()});
  document.body.appendChild(box);clearInterval(iv)}catch(_){}},1500)}
console.info('[SPW] special weapon unlock/drops loaded · weapons='+W.join(','));
})();
