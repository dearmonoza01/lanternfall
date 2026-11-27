
/* ---- r130 campfire (TEST ONLY, DeaRz 17 Nov 2026 via coordinator; numbers from BALANCE_campfire_cooking_r1.md + BALANCE_astoria_stalls_r1.md r1.2 = PROPOSALS, not approved).
   Campfire kit (ชุดก่อกองไฟ): use from the bag -> placement mode (ghost follows mouse / finger, green = valid, red = invalid; วาง / click confirms, ยกเลิก / Esc cancels and keeps the kit).
   Valid = blocked() free, <= COOK.cfg.RANGE from the hero, inside the map, not on a warp circle, not near an NPC, not in water (map 4). Confirm consumes the kit: logs stack (~1 s), then the fire lights (flicker, embers, glow, smoke) and burns COOK.cfg.FIRE_SEC.
   The fire is an object: F prompt "คุยกับกองไฟ · ทำอาหาร" (or tap the fire / the prompt) opens the cooking window (recipes from window.COOK.recipes: icon, name, have/need, result + effect, quantity, ทำอาหาร). One fire per player (a new one replaces the old), monsters ignore it, not kept across a map change.
   Food: one food buff at a time (P.buffs.food), heal-over-time foods do not stack with another HoT, potions are separate. Cooking drops (8% normal / 25% elite, Map 1-4 mobs) + kit drop 1%.
   Stall goods (?stallgoods=off to skip): veg stall = 10 crafting materials, bakery foods, fish stall, cloth stall, pottery says it is out of stock, demon knife whetstone; prices = Balance x0.6 (min 2 G). Mali also sells the kit (no innkeeper NPC exists yet).
   Everything is drawn in code: replace COOK.drawFire / COOK.drawPile / COOK.drawGhost / item icons later. Flags ?campfire=off ?stallgoods=off. Debug: window.COOK. ---- */
(function(){'use strict';
const Q=String(location.search),C=window.COOK={ver:'campfire-r1',on:!/[?&]campfire=off\b/.test(Q),stall:!/[?&]stallgoods=off\b/.test(Q),err:null,fire:null,place:null,hot:null,stats:{placed:0,cooked:0,drops:0,kitDrops:0},log:[]};
if(!C.on)return;
const ERR=(w,e)=>{C.err=w+': '+((e&&e.message)||e);try{console.error('[COOK]',w,e)}catch(_){}};
C.cfg={BAG_FLOW:!/[?&]campbag=off\b/.test(Q),FIRE_SEC:600,COOK_SEC:2,RANGE:150,ONE_FIRE:true,SAFE_OK:true,KIT_PRICE:40,KIT_DROP:.01,MAT_DROP:.08,MAT_DROP_ELITE:.25,FOOD_SEC:900,SHOP_FOOD_SEC:600,MAT_SELL:2,STALL_MULT:.6,MP_REGEN_BASE:.01,DROP_ZONES:['cartroad_plains','w22_map4_test','w22_cave1_test'],PILE_SEC:1,FIRE_INTERACT:95};
/* ---------------- items (placeholder icons drawn in code; need Art icons: all of these) ---------------- */
const px=(g,f)=>{g.save();f(g);g.restore()};
const ICO={
 kit:g=>{g.fillStyle='#7a4a22';for(const [x,y,a] of [[16,40,-.5],[30,44,.4],[24,34,0]]){px(g,()=>{g.translate(x+12,y);g.rotate(a);g.fillRect(-14,-4,28,8);g.fillStyle='#b27a3a';g.fillRect(-14,-4,28,3)})}g.fillStyle='#ff9a3a';g.beginPath();g.moveTo(32,10);g.quadraticCurveTo(44,26,36,34);g.quadraticCurveTo(32,28,28,34);g.quadraticCurveTo(20,26,32,10);g.fill()},
 veg:(g,c)=>{g.fillStyle=c;g.beginPath();g.arc(32,36,16,0,7);g.fill();g.fillStyle='#4a8a3a';g.fillRect(30,12,5,10);g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.arc(26,30,5,0,7);g.fill()},
 leaf:(g,c)=>{g.fillStyle=c;g.beginPath();g.moveTo(14,50);g.quadraticCurveTo(10,16,50,12);g.quadraticCurveTo(54,48,14,50);g.fill();g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=2;g.beginPath();g.moveTo(16,48);g.lineTo(44,18);g.stroke()},
 root:(g,c)=>{g.fillStyle=c;g.beginPath();g.moveTo(20,16);g.lineTo(44,16);g.quadraticCurveTo(40,46,32,56);g.quadraticCurveTo(24,46,20,16);g.fill();g.fillStyle='#5a9a40';g.fillRect(26,6,12,10)},
 meat:(g,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(30,34,18,14,-.4,0,7);g.fill();g.fillStyle='#f4e8d0';g.fillRect(40,16,6,22);g.beginPath();g.arc(43,14,6,0,7);g.fill()},
 mush:(g,c)=>{g.fillStyle='#efe0c0';g.fillRect(27,34,10,18);g.fillStyle=c;g.beginPath();g.ellipse(32,32,20,14,0,Math.PI,0);g.fill();g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.arc(24,26,3,0,7);g.arc(38,24,3,0,7);g.fill()},
 fish:(g,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(30,34,20,11,0,0,7);g.fill();g.beginPath();g.moveTo(48,34);g.lineTo(60,24);g.lineTo(60,44);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(20,31,2.5,0,7);g.fill()},
 bread:(g,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(32,38,22,14,0,0,7);g.fill();g.strokeStyle='rgba(120,70,20,.7)';g.lineWidth=2;for(const x of [22,32,42]){g.beginPath();g.moveTo(x-3,30);g.lineTo(x+3,42);g.stroke()}},
 bowl:(g,c)=>{g.fillStyle='#8a5a30';g.beginPath();g.moveTo(10,32);g.lineTo(54,32);g.quadraticCurveTo(50,54,32,54);g.quadraticCurveTo(14,54,10,32);g.fill();g.fillStyle=c;g.beginPath();g.ellipse(32,32,22,7,0,0,7);g.fill();g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.arc(36,10,3,0,7);g.arc(28,16,3,0,7);g.fill()},
 pie:(g,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(32,36,22,12,0,0,7);g.fill();g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(32,32,16,6,0,0,7);g.fill()},
 band:(g,c)=>{g.fillStyle=c;g.fillRect(10,26,44,14);g.fillStyle='#d44';g.fillRect(28,20,8,26);g.fillRect(24,29,16,8)},
 stone:(g,c)=>{g.fillStyle=c;g.beginPath();g.moveTo(14,44);g.lineTo(24,18);g.lineTo(44,14);g.lineTo(52,40);g.lineTo(34,52);g.fill()},
 cloth:(g,c)=>{g.fillStyle=c;g.beginPath();g.moveTo(14,14);g.lineTo(50,14);g.quadraticCurveTo(58,40,48,54);g.lineTo(18,54);g.quadraticCurveTo(6,40,14,14);g.fill()}};
const D=(n,d,shape,col,o)=>Object.assign({n,d,k:'mat',col,icon:g=>ICO[shape](g,col)},o||{});
const FOOD=(n,d,shape,col,food,price)=>({n,d,k:'use',col,food,price,sell:Math.max(1,Math.floor(price/4)),icon:g=>ICO[shape](g,col)});
const MAT=C.mats={slimeJelly:D('เยลลี่สไลม์','วัตถุดิบทำอาหาร · ดรอปจากสไลม์','bowl','#5ef0e0',{sell:2}),tenderLeaf:D('ยอดใบอ่อน','วัตถุดิบทำอาหาร · ดรอปจากลีฟบัน','leaf','#8fe39a',{sell:2}),sweetRoot:D('รากหวาน','วัตถุดิบทำอาหาร · ดรอปจากซีดลิง','root','#e8a06a',{sell:2}),
 boarMeat:D('เนื้อหมูป่า','วัตถุดิบทำอาหาร · ดรอปจากหมูป่าหิน','meat','#d4607a',{sell:2}),puffcapMush:D('เห็ดพัฟแคป','วัตถุดิบทำอาหาร · ดรอปจากพัฟแคป','mush','#e8c8a0',{sell:2}),mossHerb:D('มอสสมุนไพร','วัตถุดิบทำอาหาร · ดรอปจากมอสแบ็ก','leaf','#6aa860',{sell:2}),
 riverFish:D('ปลาแม่น้ำสด','วัตถุดิบทำอาหาร · ซื้อได้ที่ร้านปลา','fish','#8ab8e8',{price:4,sell:1})};
const VEG={eastApple:['แอปเปิลทุ่งตะวันออก','#e85a5a',5],mistCarrot:['แครอทหมอก','#f08a3a',4],potato:['มันฝรั่ง','#c9a46a',3],onion:['หัวหอม','#d8b0e0',3],cabbage:['กะหล่ำปลี','#a8e08a',4],tomato:['มะเขือเทศ','#f0503a',4],wheat:['ฟ่อนข้าวสาลี','#e8d070',3],mtGrape:['องุ่นภูเขา','#8a5ad0',8],indigoBerry:['เบอร์รี่สีคราม','#4a5ac8',6],goldPeach:['ลูกพีชทอง','#ffc85a',12]};
const sp=p=>Math.max(2,Math.round(p*C.cfg.STALL_MULT));
for(const id in VEG){const v=VEG[id];MAT[id]=D(v[0],'วัตถุดิบ (ไม่มีสถานะ) · ใช้ทำอาหาร / คราฟต์ในอนาคต','veg',v[1],{price:sp(v[2]),sell:Math.max(1,Math.floor(sp(v[2])/4)),stall:1})}
const FD=C.foods={ /* hot = {hp|mp: fraction of max, s: seconds}, buff = stat mods (fractions; crit in points), sec */
 campBread:FOOD('ขนมปังกองไฟ','ฟื้น HP 15% ใน 6 วินาที','bread','#d8a050',{hot:{hp:.15,s:6}},0),boarSkewer:FOOD('หมูป่าเสียบไม้','ฟื้น HP 25% ใน 8 วินาที','meat','#d4607a',{hot:{hp:.25,s:8}},0),jellyDessert:FOOD('เยลลี่ผลไม้','ฟื้น MP 20% ใน 6 วินาที','bowl','#8a5ad0',{hot:{mp:.2,s:6}},0),
 mushSoup:FOOD('ซุปเห็ด','MP regen +25% นาน 15 นาที','bowl','#e8c8a0',{buff:{mpRegen:.25},sec:'cook'},0),hunterStew:FOOD('สตูว์นายพราน','Max HP +6% นาน 15 นาที','bowl','#c08050',{buff:{hpPct:.06},sec:'cook'},0),herbFish:FOOD('ปลาอบสมุนไพร','ฟื้น HP 1% Max ทุก 3 วินาที นาน 15 นาที','fish','#8ab8e8',{buff:{hpRegen:.01},sec:'cook'},0),
 rootPancake:FOOD('แพนเค้กรากหวาน','ความเร็วเดิน +5% นาน 15 นาที','pie','#e8a06a',{buff:{speed:.05},sec:'cook'},0),forestSalad:FOOD('สลัดป่า','ATK +4% นาน 15 นาที','leaf','#8fe39a',{buff:{atk:.04},sec:'cook'},0),
 warmBread:FOOD('ขนมปังอุ่น','ฟื้น HP 12% ใน 6 วินาที','bread','#e0b060',{hot:{hp:.12,s:6}},sp(12)),meatPie:FOOD('พายเนื้อ','ATK +3% นาน 10 นาที','pie','#c88a50',{buff:{atk:.03},sec:'shop'},sp(60)),
 garlicBread:FOOD('ขนมปังกระเทียม','ฟื้น HP 15% ใน 6 วินาที','bread','#e8d080',{hot:{hp:.15,s:6}},sp(15)),croissant:FOOD('ครัวซองต์เนย','ฟื้น MP 12% ใน 6 วินาที','bread','#f0c870',{hot:{mp:.12,s:6}},sp(15)),
 hamSandwich:FOOD('แซนด์วิชแฮม','คริติคอล +3% นาน 10 นาที','pie','#e89a8a',{buff:{crit:3},sec:'shop'},sp(60)),fruitTart:FOOD('ทาร์ตผลไม้','ความเร็วเดิน +4% นาน 10 นาที','pie','#e85a8a',{buff:{speed:.04},sec:'shop'},sp(55)),breadStew:FOOD('สตูว์ในถ้วยขนมปัง','ความเร็วโจมตี +3% นาน 10 นาที','bowl','#c08a50',{buff:{aspd:.03},sec:'shop'},sp(70)),
 grillFish:FOOD('ปลาย่าง','ฟื้น HP 20% ใน 8 วินาที','fish','#d8a060',{hot:{hp:.2,s:8}},sp(20)),fishSoup:FOOD('ซุปปลา','MP regen +20% นาน 10 นาที','bowl','#8ab8e8',{buff:{mpRegen:.2},sec:'shop'},sp(50)),
 bandage:FOOD('ผ้าพันแผล','ฟื้น HP 30% ใน 10 วินาที (หยุดถ้าโดนตี)','band','#e8dcc0',{hot:{hp:.3,s:10,stopHit:1}},sp(15)),mistShawl:FOOD('ผ้าคลุมกันหมอก','DEF +3% นาน 10 นาที','cloth','#9ab0d8',{buff:{def:.03},sec:'shop'},sp(60)),
 whetstone:FOOD('หินลับมีด','ATK +5% นาน 3 นาที (ใช้ร่วมกับอาหารได้)','stone','#9a9aa8',{buff:{atk:.05},sec:180,slot:'whet'},sp(80))};
const KIT={n:'ชุดก่อกองไฟ',d:'ใช้แล้ววางกองไฟบนพื้น (ไกลสุดราว 150 px) · ไหม้ 10 นาที · คุยกับกองไฟเพื่อทำอาหาร',k:'use',col:'#ff9a3a',price:C.cfg.KIT_PRICE,sell:10,icon:g=>ICO.kit(g)};
function regItems(){try{ITEMS.campKit=ITEMS.campKit||KIT;for(const id in MAT)ITEMS[id]=ITEMS[id]||MAT[id];for(const id in FD)ITEMS[id]=ITEMS[id]||FD[id]}catch(e){ERR('items',e)}}
regItems();
/* ---------------- recipes (Balance r1, all known from the start) ---------------- */
C.recipes=[
 {id:'campBread',ing:[['wheat',2]],out:'campBread'},{id:'boarSkewer',ing:[['boarMeat',2],['onion',1]],out:'boarSkewer'},{id:'jellyDessert',ing:[['slimeJelly',3],['mtGrape',1]],out:'jellyDessert'},{id:'mushSoup',ing:[['puffcapMush',2],['potato',1]],out:'mushSoup'},
 {id:'hunterStew',ing:[['boarMeat',2],['mistCarrot',1],['potato',1]],out:'hunterStew'},{id:'herbFish',ing:[['riverFish',1],['mossHerb',2]],out:'herbFish'},{id:'rootPancake',ing:[['sweetRoot',2],['wheat',1]],out:'rootPancake'},{id:'forestSalad',ing:[['tenderLeaf',3],['tomato',1],['cabbage',1]],out:'forestSalad'}];
const nm=id=>(ITEMS[id]||{}).n||id;
const icoOf=id=>{try{return itemIcon({id,q:1})}catch(_){return ''}};
/* ---------------- placement ---------------- */
function npcNear(x,y){try{for(const n of NPCS)if(Math.hypot(n.x-x,n.y-y)<70)return true}catch(_){}try{const T=window.__TOWN;if(T&&T.npcs)for(const n of T.npcs)if(Math.hypot(n.x-x,n.y-y)<70)return true}catch(_){}
  try{const Qd=window.__QDATA2;if(Qd)for(const n of Qd.npcs)if(n.at&&n.at.zone===G.zone&&Math.hypot(n.at.x-x,n.at.y-y)<70)return true}catch(_){}return false}
function warpNear(x,y){try{for(const c of (window.__WARP&&__WARP.circles)||[])if(c.z===G.zone&&Math.hypot(c.x-x,c.y-y)<(c.r||60)+40)return true}catch(_){}try{for(const g of GATES)if(Math.hypot(g.x-x,g.y-y)<90)return true}catch(_){}return false}
function waterAt(x,y){try{if(window.__M4T&&typeof __M4T.inWater==='function'&&G.zone==='w22_map4_test')return !!__M4T.inWater(x,y)}catch(_){}return false}
C.valid=function(x,y){const Z=ZONES[G.zone];if(!Z)return 'no zone';if(x<40||y<40||x>Z.w-40||y>Z.h-40)return 'ขอบแผนที่';if(Math.hypot(x-P.x,y-P.y)>C.cfg.RANGE)return 'ไกลเกินไป';
  if(!C.cfg.SAFE_OK&&Z.safe)return 'ในเมืองวางไม่ได้';try{if(blocked(x,y,16))return 'มีสิ่งกีดขวาง'}catch(_){}if(warpNear(x,y))return 'ใกล้วงวาร์ป';if(npcNear(x,y))return 'ใกล้ NPC';if(waterAt(x,y))return 'บนน้ำ';return ''};
const bar=document.createElement('div');bar.id='cookPlaceBar';bar.innerHTML='<span class="cpm"></span><button type="button" class="ok">วาง</button><button type="button" class="no">ยกเลิก</button>';document.body.appendChild(bar);
const css=document.createElement('style');css.textContent=`#cookPlaceBar{position:fixed;left:50%;bottom:calc(170px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:60;display:none;gap:10px;align-items:center;padding:8px 14px;border-radius:14px;background:rgba(20,15,8,.94);border:1px solid #d6b05c;color:#ffe9b0;font:700 14px system-ui,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.6)}
#cookPlaceBar button{min-height:40px;padding:0 18px;border-radius:10px;border:1px solid #ffd98a;background:linear-gradient(#d49a3a,#8a5a14);color:#fff4cf;font:800 15px system-ui,sans-serif;cursor:pointer;touch-action:manipulation}#cookPlaceBar button.no{background:linear-gradient(#6a3a3a,#3f1f1f);border-color:#e0a0a0}#cookPlaceBar button.ok:disabled{opacity:.4}#cookPlaceBar .cpm{min-width:150px}
#cookPrompt{position:fixed;left:50%;bottom:calc(205px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:6;display:none;padding:8px 18px;border-radius:999px;background:rgba(20,15,8,.9);border:1px solid #ffb35a;color:#fff;font-size:13px;cursor:pointer;box-shadow:0 0 18px rgba(255,150,60,.4);white-space:nowrap}#cookPrompt kbd{display:inline-block;min-width:20px;padding:0 6px;margin-right:6px;border-radius:6px;background:#ffb35a;color:#1a0e00;font-weight:700;text-align:center}
#cookWin{position:fixed;inset:0;z-index:80;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.55);font-family:var(--body,system-ui,sans-serif);color:#f0e4c8}
#cookWin .cw{width:min(760px,calc(100vw - 16px));max-height:calc(100vh - 16px);display:flex;flex-direction:column;border-radius:16px;border:2px solid #b8924a;background:linear-gradient(180deg,#2c2216,#120d08);box-shadow:0 10px 40px rgba(0,0,0,.8),inset 0 0 0 1px rgba(255,220,150,.15)}
#cookWin .ch{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid rgba(214,176,92,.35)}#cookWin .ch h2{margin:0;font-size:20px;color:#ffe9b0;flex:1}#cookWin .ch .tm{font-size:13px;color:#ffb35a}#cookWin .ch button{width:38px;height:38px;border-radius:10px;border:1px solid rgba(214,176,92,.6);background:rgba(40,30,16,.9);color:#ffe9b0;font-size:18px;cursor:pointer}
#cookWin .cl{flex:1;overflow:auto;padding:10px 12px;display:flex;flex-direction:column;gap:7px;min-height:120px}
#cookWin .rw{display:flex;gap:11px;align-items:center;padding:8px 10px;border-radius:11px;border:1px solid rgba(120,96,52,.55);background:rgba(30,23,14,.9);cursor:pointer}#cookWin .rw.sel{border-color:#ffd98a;box-shadow:0 0 0 1px #ffd98a,0 0 14px rgba(255,200,100,.3)}#cookWin .rw.no{opacity:.62}
#cookWin .rw img{width:48px;height:48px;border-radius:9px;background:#100d09;flex:none}#cookWin .rw b{display:block;font-size:15px;color:#fff}#cookWin .rw small{display:block;font-size:12px;color:#c9b27a}#cookWin .ing{font-size:12px}#cookWin .ing .hv{color:#8fe39a}#cookWin .ing .lk{color:#ff8a8a}
#cookWin .cf{display:flex;gap:10px;align-items:center;padding:10px 14px;border-top:1px solid rgba(214,176,92,.35);flex-wrap:wrap}#cookWin .cf .q{display:flex;align-items:center;gap:6px}#cookWin .cf .q button{width:34px;height:34px;border-radius:8px;border:1px solid #b8924a;background:rgba(40,30,16,.9);color:#ffe9b0;font-size:18px;cursor:pointer}
#cookWin .cf .go{margin-left:auto;min-height:44px;padding:0 26px;border-radius:12px;border:1px solid #ffd98a;background:linear-gradient(#d49a3a,#8a5a14);color:#fff4cf;font:800 16px system-ui,sans-serif;cursor:pointer}#cookWin .cf .go:disabled{opacity:.4;cursor:default}
#cookWin .pg{height:6px;background:#1b140c;position:relative;display:none}#cookWin .pg i{position:absolute;left:0;top:0;bottom:0;width:0;background:linear-gradient(90deg,#ff9a3a,#ffd36b)}
#cookBuff{position:fixed;left:8px;top:150px;z-index:5;display:none;padding:4px 10px;border-radius:9px;background:rgba(20,15,8,.85);border:1px solid #c9a86a;color:#ffe9b0;font:12px system-ui,sans-serif;pointer-events:none}
#cookGm{position:fixed;left:8px;bottom:60px;z-index:20;padding:4px 8px;border-radius:8px;border:1px solid #ffb35a;background:rgba(40,20,8,.9);color:#ffd9a0;font:700 11px system-ui;cursor:pointer}`;document.head.appendChild(css);
let ghostXY=[0,0];
function setGhost(sx,sy){try{ghostXY=s2w(sx,sy)}catch(_){}}
function hideBag(){C.wasInv=false;if(!C.cfg.BAG_FLOW)return;try{if(G.win==='wInv')closeWin();const ip=document.getElementById('iiPanel');if(ip)ip.classList.remove('in');const tp=document.getElementById('tip');if(tp)tp.style.display='none'}catch(e){ERR('hideBag',e)}}
function showBag(){/* DeaRz 17 Nov 06:04: the bag does NOT come back after placing or cancelling */}
function startPlace(){if(C.place||G.state!=='play'||P.dead)return false;hideBag();C.place={x:P.x+40,y:P.y};try{const m=mouse;if(m&&m.x!=null)setGhost(m.x,m.y);else ghostXY=[P.x+40,P.y]}catch(_){ghostXY=[P.x+40,P.y]}
  try{for(const k in keys)keys[k]=false}catch(_){}bar.style.display='flex';updBar();try{log('วางกองไฟ: เลื่อนเมาส์/นิ้วไปจุดที่ต้องการ (เขียว = วางได้) แล้วกด “วาง”','v')}catch(_){}return true}
function updBar(){if(!C.place)return;const r=C.valid(ghostXY[0],ghostXY[1]);bar.querySelector('.cpm').textContent=r?'✖ '+r:'✔ วางตรงนี้ได้';bar.querySelector('.ok').disabled=!!r;bar.dataset.bad=r?1:''}
function cancelPlace(){if(!C.place)return;C.place=null;bar.style.display='none';showBag();try{log('ยกเลิกการวางกองไฟ (ชุดก่อกองไฟยังอยู่)','v')}catch(_){}}
function confirmPlace(){if(!C.place)return false;const r=C.valid(ghostXY[0],ghostXY[1]);if(r){try{textAt(P.x,P.y-60,r,'#ff8a8a',14)}catch(_){}return false}
  if(!countItem('campKit')){cancelPlace();return false}takeItem('campKit',1);try{if(G.win==='wInv')renderInv()}catch(_){}
  if(C.fire)removeFire(true);C.fire={x:ghostXY[0],y:ghostXY[1],zone:G.zone,t0:time,em:[],sm:[],lit:false,ph:Math.random()*9};C.place=null;bar.style.display='none';addProp(C.fire);showBag();C.stats.placed++;C.log.push({ev:'place',x:C.fire.x|0,y:C.fire.y|0});return true}
bar.querySelector('.ok').addEventListener('click',e=>{e.stopPropagation();confirmPlace()});bar.querySelector('.no').addEventListener('click',e=>{e.stopPropagation();cancelPlace()});
for(const ev of ['pointerdown','pointerup','click','mousedown','mouseup','touchstart'])bar.addEventListener(ev,e=>e.stopPropagation());
document.addEventListener('pointermove',e=>{if(!C.place)return;setGhost(e.clientX,e.clientY);updBar()},true);
document.addEventListener('pointerdown',e=>{if(!C.place)return;if(e.target.closest&&e.target.closest('#cookPlaceBar'))return;setGhost(e.clientX,e.clientY);updBar();e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();if(e.pointerType==='mouse'&&e.button===0)confirmPlace()},true);
document.addEventListener('contextmenu',e=>{if(!C.place)return;e.preventDefault();e.stopImmediatePropagation();cancelPlace()},true);
for(const ev of ['mousedown','click','touchstart'])document.addEventListener(ev,e=>{if(C.place&&!(e.target.closest&&e.target.closest('#cookPlaceBar'))){e.stopImmediatePropagation()}},true);
addEventListener('keydown',e=>{try{if(e.key==='Escape'){if(C.place){cancelPlace();e.stopImmediatePropagation();e.preventDefault()}else if(cookOpen()){closeCook();e.stopImmediatePropagation();e.preventDefault()}return}
  if(C.place&&(e.key==='Enter')){confirmPlace();e.stopImmediatePropagation();e.preventDefault();return}
  if(cookOpen()){if(!/INPUT|TEXTAREA/.test((e.target||{}).tagName||'')){e.stopImmediatePropagation();e.preventDefault()}return}
  if((e.key==='f'||e.key==='F')&&!e.repeat&&nearFire()&&!G.interact&&!G.win&&G.state==='play'){e.stopImmediatePropagation();e.preventDefault();openCook()}}catch(er){ERR('key',er)}},true);
/* ---------------- fire: removal, tick, drawing (swappable) ---------------- */
function removeFire(silent){const f=C.fire;if(!f)return;if(f.prop)dropProp(f);if(!silent&&f.lit&&C.onBurnOut){try{C.onBurnOut(f)}catch(e){ERR('burnout',e)}}try{if(f.light){const i=LIGHTS.indexOf(f.light);if(i>=0)LIGHTS.splice(i,1)}}catch(_){}C.fire=null;closeCook();if(!silent)try{log('กองไฟมอดดับแล้ว','v')}catch(_){}}
/* depth sorting: while burning the fire is a PROPS entry (type campfire, liveOnly) so the game's own y-sort draws it behind / in front of the hero */
C.cfg.USE_PROP=true;
function ensureDef(){try{if(!PROP_DEFS.campfire)PROP_DEFS.campfire={n:'Campfire',cat:'misc',w:140,h:140,ax:70,ay:100,liveOnly:1,nofade:1,draw(){},live(c,p){try{if(p.cfEmber){if(C.paintEmber)C.paintEmber(c,p);return}const f=C.fire;if(f&&f.prop===p){if(f.lit)C.drawFire(c,f,time,f.k||1);else C.drawPile(c,f,Math.min(1,(time-f.t0)/C.cfg.PILE_SEC))}}catch(e){ERR('live',e)}}};return true}catch(e){return false}}
function addProp(f){if(!C.cfg.USE_PROP||!ensureDef())return;const p={t:'campfire',x:f.x,y:f.y,s:1,v:0,f:1,ph:0};PROPS.push(p);f.prop=p}
function dropProp(f){try{const i=PROPS.indexOf(f.prop);if(i>=0)PROPS.splice(i,1)}catch(_){}f.prop=null}
const nearFire=()=>{const f=C.fire;return !!f&&f.lit&&f.zone===G.zone&&!P.dead&&Math.hypot(f.x-P.x,f.y-P.y)<C.cfg.FIRE_INTERACT};
C.drawPile=function(c,f,u){c.save();c.translate(f.x,f.y);c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(0,4,26,10,0,0,7);c.fill();
  for(let i=0;i<7;i++){const a=i/7*6.283;c.fillStyle='#7a7468';c.beginPath();c.ellipse(Math.cos(a)*22,Math.sin(a)*8+2,6,4,0,0,7);c.fill()}
  const logs=[[-14,-2,-.5],[12,-1,.5],[0,-9,.05],[-4,3,-1.2],[6,4,1.15]];const n=Math.min(logs.length,Math.ceil(u*logs.length));
  for(let i=0;i<n;i++){const l=logs[i],k=Math.min(1,u*logs.length-i);c.save();c.translate(l[0],l[1]-(1-k)*18);c.rotate(l[2]);c.globalAlpha=Math.min(1,k*1.4);c.fillStyle='#5a3a1a';c.fillRect(-15,-4,30,8);c.fillStyle='#8a5a2a';c.fillRect(-15,-4,30,3);c.fillStyle='#3a2410';c.beginPath();c.ellipse(15,0,3,4,0,0,7);c.fill();c.restore()}c.restore()};
C.drawFire=function(c,f,t,k){/* k = 0..1 burn strength (fades at the end) */const x=f.x,y=f.y;C.drawPile(c,f,1);c.save();c.globalCompositeOperation='lighter';
  const fl=.85+.15*Math.sin(t*13+f.ph)+.08*Math.sin(t*29);const gr=c.createRadialGradient(x,y-10,2,x,y-10,150*k*fl);gr.addColorStop(0,'rgba(255,170,70,.38)');gr.addColorStop(1,'rgba(255,120,30,0)');c.fillStyle=gr;c.fillRect(x-160,y-170,320,320);
  for(let i=0;i<5;i++){const w=(16-i*2.2)*k,h=(46-i*4)*k*(fl+.12*Math.sin(t*9+i*1.7)),dx=Math.sin(t*7+i*2+f.ph)*(3+i*.6),cx=x+(i-2)*5;
    const g=c.createLinearGradient(0,y-h,0,y);g.addColorStop(0,i<2?'rgba(255,230,140,.0)':'rgba(255,110,20,.0)');g.addColorStop(.35,i%2?'rgba(255,190,60,.8)':'rgba(255,120,30,.75)');g.addColorStop(1,'rgba(255,230,150,.9)');c.fillStyle=g;
    c.beginPath();c.moveTo(cx-w,y-2);c.quadraticCurveTo(cx-w*.7+dx,y-h*.55,cx+dx,y-h);c.quadraticCurveTo(cx+w*.7+dx,y-h*.55,cx+w,y-2);c.closePath();c.fill()}
  c.restore();
  c.save();for(const s of f.sm){c.globalAlpha=Math.max(0,s.life/s.max)*.22*k;c.fillStyle='#b8b4ac';c.beginPath();c.arc(s.x,s.y,s.r*(1+(1-s.life/s.max)*1.6),0,7);c.fill()}c.restore();
  c.save();c.globalCompositeOperation='lighter';for(const e of f.em){c.globalAlpha=Math.max(0,e.life/e.max);c.fillStyle='#ffb04a';c.fillRect(e.x-1,e.y-1,2.2,2.2)}c.restore()};
C.drawGhost=function(c,x,y,ok){const pu=.5+.5*Math.sin(time*6);c.save();c.globalAlpha=.35+.45*pu;c.strokeStyle=ok?'#b8ffd0':'#ffb0b0';c.lineWidth=4;c.beginPath();c.ellipse(x,y+2,36+4*pu,15+2*pu,0,0,7);c.stroke();c.globalAlpha=.55;c.strokeStyle=ok?'#6dff9a':'#ff6a6a';c.lineWidth=2;c.setLineDash([6,5]);c.beginPath();c.ellipse(x,y+2,30,12,0,0,7);c.stroke();c.setLineDash([]);
  c.beginPath();c.ellipse(P.x,P.y+2,C.cfg.RANGE,C.cfg.RANGE*.55,0,0,7);c.globalAlpha=.16;c.stroke();c.globalAlpha=.6;c.fillStyle=ok?'rgba(80,255,130,.35)':'rgba(255,80,80,.35)';c.beginPath();c.ellipse(x,y+2,24,9,0,0,7);c.fill();
  C.drawPile(c,{x,y},1);c.restore()};
function tickFire(dt){const f=C.fire;if(!f)return;if(f.zone!==G.zone){removeFire(true);return}
  const age=time-f.t0;if(!f.lit&&age>=C.cfg.PILE_SEC){f.lit=true;f.tLit=time;try{ring(f.x,f.y,6,70,.5,'#ffb35a',3);textAt(f.x,f.y-50,'🔥','#ffb35a',22);log('กองไฟติดแล้ว · คุยกับกองไฟ (F) เพื่อทำอาหาร','g')}catch(_){}}
  if(f.lit){const left=C.cfg.FIRE_SEC-(time-f.tLit);f.left=left;if(left<=0){removeFire(false);return}
    if(!f.light){try{f.light={x:f.x,y:f.y-14,r:130,col:'#ffa55a',sp:6,ph:f.ph};LIGHTS.push(f.light)}catch(_){}}else{try{if(!LIGHTS.includes(f.light))LIGHTS.push(f.light)}catch(_){}}
    const k=left<4?Math.max(.2,left/4):1;f.k=k;
    if(Math.random()<dt*10*k)f.em.push({x:f.x+(Math.random()-.5)*14,y:f.y-12,vx:(Math.random()-.5)*26,vy:-30-Math.random()*50,life:1.2,max:1.2});
    if(Math.random()<dt*2.2*k)f.sm.push({x:f.x+(Math.random()-.5)*8,y:f.y-40,vx:(Math.random()-.5)*8,vy:-22,life:3,max:3,r:6});
    for(const e of f.em){e.x+=e.vx*dt;e.y+=e.vy*dt;e.vx+=(Math.random()-.5)*60*dt;e.life-=dt}f.em=f.em.filter(e=>e.life>0);
    for(const s of f.sm){s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt}f.sm=f.sm.filter(s=>s.life>0)}}
try{const _o=drawEditorOverlay;drawEditorOverlay=function(){const r=_o.apply(this,arguments);try{const f=C.fire;if(f&&!f.prop&&f.zone===G.zone&&inView(f.x,f.y,200)){if(!f.lit)C.drawPile(ctx,f,Math.min(1,(time-f.t0)/C.cfg.PILE_SEC));else C.drawFire(ctx,f,time,f.k||1)}
    if(C.place){const bad=C.valid(ghostXY[0],ghostXY[1]);C.drawGhost(ctx,ghostXY[0],ghostXY[1],!bad)}}catch(e){ERR('draw',e)}return r}}catch(e){ERR('hook overlay',e)}
/* ---------------- prompt + tap ---------------- */
const pr=document.createElement('div');pr.id='cookPrompt';pr.innerHTML='<kbd>F</kbd>คุยกับกองไฟ · ทำอาหาร';document.body.appendChild(pr);
pr.addEventListener('click',e=>{e.stopPropagation();openCook()});for(const ev of ['pointerdown','mousedown','touchstart'])pr.addEventListener(ev,e=>e.stopPropagation());
document.addEventListener('click',e=>{try{if(C.place||cookOpen()||!C.fire||!C.fire.lit||C.fire.zone!==G.zone||G.state!=='play')return;if(e.target.closest&&e.target.closest('#cookPrompt,#cookWin,.mbtn,#bar,#tSkills'))return;
  const [wx,wy]=s2w(e.clientX,e.clientY);if(Math.hypot(wx-C.fire.x,wy-C.fire.y)<46&&nearFire()){e.stopImmediatePropagation();openCook()}}catch(er){ERR('tap',er)}},true);
/* ---------------- cooking window ---------------- */
const win=document.createElement('div');win.id='cookWin';win.innerHTML='<div class="cw"><div class="ch"><h2>🔥 กองไฟ · ทำอาหาร</h2><span class="tm"></span><button type="button" class="x" aria-label="ปิด">✕</button></div><div class="pg"><i></i></div><div class="cl"></div><div class="cf"><div class="q"><button type="button" class="mn">−</button><b class="qn">1</b><button type="button" class="pl">+</button><button type="button" class="mx" style="width:auto;padding:0 10px;font-size:13px">สูงสุด</button></div><span class="cs" style="font-size:12px;color:#c9b27a"></span><button type="button" class="go">ทำอาหาร</button></div></div>';document.body.appendChild(win);
let selR=0,qty=1,cooking=null;
const cookOpen=()=>win.style.display==='flex';
function canMake(r){let n=99;for(const [id,k] of r.ing)n=Math.min(n,Math.floor(countItem(id)/k));return n}
function effTxt(id){return (ITEMS[id]||{}).d||''}
function renderCook(){const L=win.querySelector('.cl');if(cooking)return;
  L.innerHTML=C.recipes.map((r,i)=>{const mk=canMake(r);return `<div class="rw ${i===selR?'sel':''} ${mk?'':'no'}" data-i="${i}"><img alt="" src="${icoOf(r.out)}"><div style="flex:1;min-width:0"><b>${nm(r.out)}</b><small>${effTxt(r.out)}</small><div class="ing">${r.ing.map(([id,k])=>{const h=countItem(id);return `<span class="${h>=k?'hv':'lk'}">${nm(id)} ${h}/${k}</span>`}).join(' · ')}</div></div><small>${mk?'ทำได้ '+mk:'ของไม่พอ'}</small></div>`}).join('');
  const r=C.recipes[selR],mk=r?canMake(r):0;qty=Math.max(1,Math.min(qty,Math.max(1,mk)));win.querySelector('.qn').textContent=qty;win.querySelector('.go').disabled=!r||mk<1;win.querySelector('.cs').textContent=r?'ทำเสร็จ → '+nm(r.out)+' ×'+qty+' · ใช้เวลา '+(C.cfg.COOK_SEC*qty)+' วิ':''}
function tickWin(){if(!cookOpen())return;const f=C.fire;if(!f||!f.lit){closeCook();return}if(Math.hypot(f.x-P.x,f.y-P.y)>C.cfg.FIRE_INTERACT+80){closeCook();return}const m=Math.max(0,Math.floor(f.left||0));win.querySelector('.tm').textContent='ไฟเหลือ '+Math.floor(m/60)+':'+String(m%60).padStart(2,'0')}
function openCook(){if(!nearFire()||cookOpen())return;try{for(const k in keys)keys[k]=false;mouse.down=false}catch(_){}win.style.display='flex';selR=0;qty=1;renderCook();tickWin();C.log.push({ev:'open'})}
function closeCook(){if(cooking){clearTimeout(cooking.t);cooking=null;win.querySelector('.pg').style.display='none'}win.style.display='none'}
win.addEventListener('click',e=>{const t=e.target;if(t===win){closeCook();return}if(t.closest('.x')){closeCook();return}const rw=t.closest('.rw');if(rw&&!cooking){selR=+rw.dataset.i;qty=1;renderCook();return}
  if(t.closest('.mn')&&!cooking){qty=Math.max(1,qty-1);renderCook();return}if(t.closest('.pl')&&!cooking){qty++;renderCook();return}if(t.closest('.mx')&&!cooking){qty=Math.max(1,canMake(C.recipes[selR]));renderCook();return}
  if(t.closest('.go')){doCook()}});
for(const ev of ['pointerdown','mousedown','touchstart','wheel'])win.addEventListener(ev,e=>e.stopPropagation(),{passive:true});
function doCook(){if(cooking)return;const r=C.recipes[selR];if(!r)return;let left=Math.min(qty,canMake(r));if(left<1)return;const total=left;const pg=win.querySelector('.pg'),bar2=pg.querySelector('i');pg.style.display='block';win.querySelector('.go').disabled=true;
  const step=()=>{if(!cookOpen()||!C.fire){cooking=null;pg.style.display='none';return}const t0=performance.now();bar2.style.transition='none';bar2.style.width='0';void bar2.offsetWidth;bar2.style.transition='width '+C.cfg.COOK_SEC+'s linear';bar2.style.width='100%';
    cooking={t:setTimeout(()=>{if(canMake(r)<1){cooking=null;pg.style.display='none';renderCook();return}
      if((window.QBAG222?QBAG222.used(P):P.inv.length)>=P.invSize&&!countItem(r.out)){log('กระเป๋าเต็ม ทำอาหารต่อไม่ได้','r');cooking=null;pg.style.display='none';renderCook();return}
      for(const [id,k] of r.ing)takeItem(id,k);addItem({id:r.out,q:1});C.stats.cooked++;try{textAt(P.x,P.y-60,'+ '+nm(r.out),'#ffd98a',16);log('ทำ '+nm(r.out)+' สำเร็จ','g')}catch(_){}
      left--;if(left>0&&canMake(r)>0)step();else{cooking=null;pg.style.display='none';qty=1;renderCook();try{if(G.win==='wInv')renderInv()}catch(_){}}},C.cfg.COOK_SEC*1000)}};step()}
/* ---------------- eating: kit use, food buff / heal-over-time ---------------- */
let hadFood=false;
function applyFood(id){const it=ITEMS[id],f=it&&it.food;if(!f)return false;
  if(f.hot){C.hot={hp:f.hot.hp||0,mp:f.hot.mp||0,s:f.hot.s,t:0,stopHit:!!f.hot.stopHit,id,acc:{hp:0,mp:0}}}
  if(f.buff){const sec=f.sec==='cook'?C.cfg.FOOD_SEC:f.sec==='shop'?C.cfg.SHOP_FOOD_SEC:f.sec,slot=f.slot||'food';P.buffs[slot]=Object.assign({t:sec,max:sec,food:id},f.buff);try{recalc()}catch(_){}}
  try{ring(P.x,P.y,30,60,.4,'#ffb35a',3);textAt(P.x,P.y-56,it.n,'#ffd98a',14)}catch(_){}return true}
try{const _u=useItemId;useItemId=function(id){try{if(id==='campKit'){startPlace();return}if(ITEMS[id]&&ITEMS[id].food){if(!countItem(id))return;if(applyFood(id)){takeItem(id,1);if(G.win==='wInv')renderInv();return}}}catch(e){ERR('use',e)}return _u.apply(this,arguments)}}catch(e){ERR('hook use',e)}
try{const _r=recalc;recalc=function(){const r=_r.apply(this,arguments);try{const h=B('hpPct');if(h){P.maxHp=Math.round(P.maxHp*(1+h));P.hp=Math.min(P.hp,P.maxHp)}}catch(_){}return r}}catch(e){ERR('hook recalc',e)}
try{const _h=hurtPlayer;hurtPlayer=function(){const r=_h.apply(this,arguments);try{if(C.hot&&C.hot.stopHit){C.hot=null;textAt(P.x,P.y-60,'ผ้าพันแผลหลุด','#ff8a8a',12)}}catch(_){}return r}}catch(e){ERR('hook hurt',e)}
const chip=document.createElement('div');chip.id='cookBuff';document.body.appendChild(chip);
let rgT=0,lastTime=0;
function tickFood(dt){const h=C.hot;if(h){h.t+=dt;const part=Math.min(dt,h.s-(h.t-dt));if(part>0){if(h.hp)healP(P.maxHp*h.hp*part/h.s,true);if(h.mp)P.mp=Math.min(P.maxMp,P.mp+P.maxMp*h.mp*part/h.s)}if(h.t>=h.s)C.hot=null}
  const b=P.buffs&&P.buffs.food;if(b){if(b.hpRegen){rgT+=dt;if(rgT>=3){rgT=0;healP(P.maxHp*b.hpRegen,true)}}}
  let mr=0;for(const id in P.buffs)if(P.buffs[id]&&P.buffs[id].mpRegen)mr+=P.buffs[id].mpRegen;if(mr&&!P.dead)P.mp=Math.min(P.maxMp,P.mp+P.maxMp*C.cfg.MP_REGEN_BASE*mr*dt);
  const has=!!(P.buffs&&P.buffs.food);if(hadFood&&!has){try{recalc();log('ผลอาหารหมดแล้ว','v')}catch(_){}}hadFood=has;
  const parts=[];if(has){const t=Math.max(0,Math.ceil(P.buffs.food.t));parts.push((ITEMS[P.buffs.food.food]||{}).n+' '+Math.floor(t/60)+':'+String(t%60).padStart(2,'0'))}if(P.buffs&&P.buffs.whet)parts.push('หินลับมีด '+Math.ceil(P.buffs.whet.t)+'s');if(C.hot)parts.push('กำลังฟื้น…');
  if(parts.length){chip.textContent='🍲 '+parts.join(' · ');chip.style.display='block'}else chip.style.display='none'}
/* ---------------- drops ---------------- */
const DROP={slime:'slimeJelly',leafbun:'tenderLeaf',seedling:'sweetRoot',stoneboar:'boarMeat',puffcap:'puffcapMush',mossback:'mossHerb'};
try{const _k=killEnemy;killEnemy=function(e){const was=e&&e.dead;const r=_k.apply(this,arguments);try{if(e&&!was&&e.dead&&!e._ckd){e._ckd=1;rollDrop(e)}}catch(er){ERR('drop',er)}return r}}catch(e){ERR('hook kill',e)}
function rollDrop(e){if(!C.cfg.DROP_ZONES.includes(G.zone))return;const el=!!(e.m&&e.m.elite),boss=!!(e.m&&e.m.boss);const id=DROP[e.type];
  if(id&&Math.random()<(el?C.cfg.MAT_DROP_ELITE:C.cfg.MAT_DROP)){addItem({id,q:1});C.stats.drops++;try{log('ได้ '+nm(id),'g');textAt(e.x,e.y-30,'+ '+nm(id),'#ffd98a',13)}catch(_){}}
  if(!el&&!boss&&Math.random()<C.cfg.KIT_DROP){addItem({id:'campKit',q:1});C.stats.kitDrops++;try{log('ได้ ชุดก่อกองไฟ','g')}catch(_){}}}
/* ---------------- stalls / shops ---------------- */
function stalls(){if(!C.stall)return;const TN=window.__TOWNNPC;if(!TN||!TN.goods||C._stalled)return;const G0=TN.goods;C._stalled=1;
  const add=(k,ids)=>{G0[k]=G0[k]||[];for(const id of ids)if(!G0[k].includes(id))G0[k].push(id)};
  add('ast_fruit',Object.keys(VEG));add('ast_baker',['campKit','warmBread','meatPie','garlicBread','croissant','hamSandwich','fruitTart','breadStew']);add('ast_fish',['riverFish','grillFish','fishSoup']);add('ast_emma',['bandage','mistShawl']);add('ast_demon_knife',['whetstone']);G0.ast_cat_stall=[];
  try{const T=window.__TOWN;const _s=T.say}catch(_){}
  try{const _i=interact;interact=function(){try{const it=G.interact;if(it&&it.k==='npc'&&it.n&&it.n.id==='ast_cat_stall'){const s='ช่วงนี้ของขาดตลาด ไม่มีอะไรขายให้หรอกนะ';it.n.bubble={s,t:time+4.2};try{log('['+it.n.n+'] '+s,'v')}catch(_){}return true}}catch(e){ERR('pottery',e)}return _i.apply(this,arguments)}}catch(e){ERR('hook pottery',e)}}
function malis(){try{const Qd=window.__QDATA2;const m=Qd&&Qd.npcs.find(n=>n.id==='npc_mali');if(m&&m.shop&&!m.shop.some(s=>s.id==='campKit'))m.shop.push({id:'campKit',price:C.cfg.KIT_PRICE})}catch(e){ERR('mali',e)}}
try{if(C.stall){let n=0;const iv=setInterval(()=>{stalls();malis();if(C._stalled||++n>60)clearInterval(iv)},500)}else{let n=0;const iv=setInterval(()=>{malis();if(++n>10)clearInterval(iv)},500)}}catch(_){}
/* ---------------- loop + GM ---------------- */
try{const _up=update;update=function(dt){const r=_up.apply(this,arguments);try{if(G.state==='play'){tickFire(dt);tickFood(dt);tickWin();const np=nearFire()&&!C.place&&!cookOpen()&&!G.win;if(pr.style.display!==(np?'block':'none'))pr.style.display=np?'block':'none';if(C.place)updBar()}else{pr.style.display='none'}}catch(e){ERR('tick',e)}return r}}catch(e){ERR('hook update',e)}
try{if(!window.__REAL||new URLSearchParams(location.search).get('gm')==='on'){const gm=document.createElement('button');gm.id='cookGm';gm.type='button';gm.textContent='🔥 GM: ชุดก่อไฟ+วัตถุดิบ';document.body.appendChild(gm);gm.addEventListener('click',e=>{e.stopPropagation();regItems();addItem({id:'campKit',q:3});for(const id of ['slimeJelly','tenderLeaf','sweetRoot','boarMeat','puffcapMush','mossHerb','riverFish','wheat','onion','potato','mistCarrot','tomato','cabbage','mtGrape'])addItem({id,q:6})});for(const ev of ['pointerdown','mousedown','touchstart'])gm.addEventListener(ev,e=>e.stopPropagation())}}catch(e){ERR('gm',e)}
C.give=()=>{regItems();addItem({id:'campKit',q:3});for(const id of ['slimeJelly','tenderLeaf','sweetRoot','boarMeat','puffcapMush','mossHerb','riverFish','wheat','onion','potato','mistCarrot','tomato','cabbage','mtGrape'])addItem({id,q:6})};
C.rollDrop=rollDrop;C.startPlace=startPlace;C.confirmPlace=confirmPlace;C.cancelPlace=cancelPlace;C.open=openCook;C.ghost=(x,y)=>{ghostXY=[x,y];updBar()};
})();

