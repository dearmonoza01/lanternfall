
/* ---- gates-r4 (TEST, 11 Nov 2026): GATE special maps G1-G5 (SPEC_gate_maps_r1 + BALANCE_gates_g1_g5_v1 v1.6) ----
   WHAT IS HERE: closed gate instances (3 fight rooms + boss room, rooms drawn from gate_maps_pack_r1), altar waves (3:00 timer, altar skip, alive cap 20, max 6 attackers),
   elites, boss (2 phases), death lock, one clear per gate per day, rewards, random item box, GM buttons, debug overlay.
   WHAT IS NOT HERE: the world GATE spawner of the old gates_r3 build (coloured gates in the field, gate panel, 24 h life) is NOT in this build chain: its code was not found on this notebook.
   A STAND-IN is used instead: the left HUD button "เกต" opens a panel with up to 3 gates (one per Lv band, 24 h life each, random level in the band); "เข้า" enters the instance directly. Replace it with the real spawner later.
   Flags: ?gates2=off (no gate maps, no panel) · ?gatedbg=on (walkable mask overlay) · ?gatemob=art (HP5/ATK2) | ?gatemob=hp5 (HP5/ATK0.5) · ?gaterule=off (no lock, no daily limit) · ?gm=on (GM buttons). Debug: window.GATE2. ---- */
(function(){'use strict';
const Q=String(location.search),ON=!/[?&]gates2=off\b/.test(Q),OLDW=/[?&]gatewave=old\b/.test(Q),OLDB=/[?&]bossadds=off\b/.test(Q),NOCAP=/[?&]mincap=off\b/.test(Q);   /* boss minions v1.1: minion HP = min(row HP x gate 2.5, 0.03 x boss maxHP); ?mincap=off = no cap */   /* v1.10 (12 Nov): wave timer 60 s, waves x mobs 4x8/5x10/6x12 · 4x10/5x11/6x11 · 4x10/5x10/6x10; ?gatewave=old = the old 3:00 timer and counts */
const GT=window.GATE2={ver:'gates-r6 (g2g5 art, death, behaviours, boss x3)',on:ON,err:null,log:[],run:null,gates:[],lock:{},clear:{},stats:{spawned:0,kills:0,rewards:0}};
const ERR=(w,e)=>{GT.err=w+': '+((e&&e.message)||e);try{console.error('[GATES]',w,e)}catch(_){}};
if(!ON)return;
const ART=window.__GATE_ART||{rooms:{},altar:{},mon:{}};
const NEW=(window.__GATE_ORB&&!/[?&]gateorb=old\b/.test(Q))?window.__GATE_ORB:null;   /* orb-free rooms (Art r1); ?gateorb=old = the old room images with the baked pedestal */
const MM=/[?&]gatemob=(art|hp5)\b/.exec(Q);
const DBG=/[?&]gatedbg=on\b/.test(Q),RULE=!/[?&]gaterule=off\b/.test(Q),GM=/[?&]gm=on\b/.test(Q);
const C=GT.cfg={S:.95,HP_MULT:MM?5:2.5,ATK_MULT:MM?(MM[1]==='art'?2:.5):1,ATK_MULT_G5:MM?(MM[1]==='art'?2:.5):.8,SWARM:.6,ELITE_HP:4,ELITE_ATK:1,BOSS_HP:{G1:38,G2:38,G3:33,G4:33,G5:29},BOSS_ATK:.07,RING_MIN:6,
  WAVE_T:OLDW?180:60,CAP:20,MAX_ATK:OLDW?6:8,HEAL:.3,MOB_EXP:.3,BASE_T:OLDW?[13,17,19]:[8,9,9.5],GATE_CLEAR_MIN:null,RANDOM_BOX:1,LOCK_H:24,LIFE_H:24,MAX_GATES:3,OVER_LV:10,OVER_MUL:.4,
  WAVES:OLDW?[[[5,4],[6,5],[7,6]],[[6,5],[8,6],[9,6]],[[7,5],[9,6],[10,7]]]:[[[4,8],[5,10],[6,12]],[[4,10],[5,11],[6,11]],[[4,10],[5,10],[6,10]]],ROOMS:['A','C','B','A'],BOSS_SZ:1.4,MODE:MM?MM[1]:'default'};
const RW=Math.round(1254*C.S),ZID='gate_inst';
/* gate-only private copies of existing species (mobclean_r1 retires the old species from the field; the gates keep their own copies under gp_<id>) */
const GP_IDS=['naga','jelly','tidelord','mushroomling','vinecreeper','treant','lavael','cinderhound','magmatitan','wraithknight','skeleton','abyssal','darklord','golem'];
for(const id of GP_IDS)if(MOBS[id]&&!MOBS['gp_'+id])MOBS['gp_'+id]=Object.assign({},MOBS[id],{gateOnly:1});
const TYPES={
 G1:{band:0,n:'Crystal Cave',th:'ถ้ำคริสตัล',ord:['crystal_bat','shard_crab'],elite:'crystal_golem',boss:'crystal_golem',bossN:'Crystal Golem',mat:['gate_mat_G1','Crystal Core (แก่นคริสตัล)','#7fe8ff']},
 G2:{band:0,n:'Sunken Temple',th:'วิหารจมน้ำ',ord:['gp_naga','gp_jelly'],elite:'gp_tidelord',boss:'gp_tidelord',bossN:'Tide Guardian (ตัวแทน: Tide Lord)',mat:['gate_mat_G2','Temple Pearl (ไข่มุกวิหาร)','#5ef0e0'],ph:1},
 G3:{band:1,n:'Night Mushroom Forest',th:'ป่าเห็ดราตรี',ord:['gp_mushroomling','gp_vinecreeper'],elite:'gp_treant',boss:'gp_treant',bossN:'Mushroom King (ตัวแทน: Elder Treant)',mat:['gate_mat_G3','Glow Spore (สปอร์เรืองแสง)','#9ff4ff'],ph:1},
 G4:{band:1,n:'Lava Forge',th:'โรงหลอมลาวา',ord:['gp_lavael','gp_cinderhound'],elite:'gp_magmatitan',boss:'gp_magmatitan',bossN:'Forge Titan (ตัวแทน: Magma Titan)',mat:['gate_mat_G4','Forge Ember (ถ่านโรงหลอม)','#ff8a3d'],ph:1},
 G5:{band:2,n:'Shadow Castle',th:'ปราสาทเงา',ord:['gp_wraithknight','gp_skeleton'],elite:'gp_abyssal',boss:'gp_darklord',bossN:'Shadow of the Demon Lord (ตัวแทน: Dark Lord)',mat:['gate_mat_G5','Shadow Shard (เศษเงา)','#b04cff'],ph:1}};
const BANDS=[{n:'เริ่มต้น',lv:[20,30],col:'#4aa8ff',types:['G1','G2']},{n:'กลาง',lv:[40,60],col:'#b070ff',types:['G3','G4']},{n:'สูง',lv:[80,100],col:'#ff5a6a',types:['G5']}];
GT.TYPES=TYPES;GT.BANDS=BANDS;
const charKey=()=>{try{if(typeof CH!=='undefined'&&CH&&CH.cur>=0&&CH.list&&CH.list[CH.cur])return CH.cur+':'+(CH.list[CH.cur].name||'')}catch(_){}return 'solo'};
const SK_='lanternfall_gates_v1';
const readAll=()=>{try{return JSON.parse(localStorage.getItem(SK_)||'{}')||{}}catch(_){return {}}};
const today=()=>{if(window.__GATE_TODAY)return String(window.__GATE_TODAY);const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const now=()=>window.__GATE_NOW?+window.__GATE_NOW:Date.now();
const say=(m,c)=>{try{log(m,c||'g')}catch(_){}try{textAt(P.x,P.y-80,m,'#ffe08a',14,{life:1.6})}catch(_){}};
const rnd=(a,b)=>a+Math.random()*(b-a),ric=(a,b)=>Math.floor(rnd(a,b+1)),pk=a=>a[Math.floor(Math.random()*a.length)];
/* ---------------------------------------------------------------- persistent state (per character slot) */
let loadedKey=null;
function load(){const k=charKey(),sv=readAll()[k];GT.gates=(sv&&Array.isArray(sv.gates))?sv.gates.filter(g=>g&&g.exp>now()):[];GT.lock=(sv&&sv.lock)||{};GT.clear=(sv&&sv.clear)||{};loadedKey=k;sync()}
function sync(){try{if(P){P.gateLock=GT.lock;P.gateClear=GT.clear}}catch(_){}}
function save(){try{const a=readAll();a[loadedKey||charKey()]={gates:GT.gates,lock:GT.lock,clear:GT.clear};localStorage.setItem(SK_,JSON.stringify(a))}catch(e){ERR('save',e)}}
function newGate(bi){const b=BANDS[bi],tp=pk(b.types),T=TYPES[tp];const g={id:'g'+Math.floor(now()/1000).toString(36)+Math.floor(Math.random()*1e5).toString(36),type:tp,band:bi,Lg:ric(b.lv[0],b.lv[1]),t0:now(),exp:now()+C.LIFE_H*3600e3};GT.gates.push(g);GT.stats.spawned++;save();return g}
function topUp(){const cnt=[0,0,0];for(const g of GT.gates)cnt[g.band]++;
  while(GT.gates.length<C.MAX_GATES){let bi=cnt.findIndex(n=>n===0);if(bi<0)bi=ric(0,2);cnt[bi]++;newGate(bi)}}
GT.newGate=newGate;GT.today=today;
/* ---------------------------------------------------------------- items: theme materials + random box */
const mkIcon=(col,kind)=>g=>{try{g.globalCompositeOperation='lighter';g.drawImage(glowSprite(col),4,4,56,56);g.globalCompositeOperation='source-over';
  if(kind==='box'){g.fillStyle='#3a4a6a';g.fillRect(12,24,40,26);g.fillStyle=col;g.fillRect(12,24,40,7);g.fillRect(29,24,6,26);g.strokeStyle='#e8f4ff';g.lineWidth=2;g.strokeRect(12,24,40,26);g.fillStyle='#fff';g.beginPath();g.arc(32,18,4,0,6.283);g.fill()}
  else{g.fillStyle=col;g.strokeStyle='#ffffff';g.lineWidth=2;g.beginPath();g.moveTo(32,8);g.lineTo(48,30);g.lineTo(38,56);g.lineTo(24,56);g.lineTo(16,30);g.closePath();g.fill();g.stroke()}}catch(_){}};
for(const k in TYPES){const m=TYPES[k].mat;ITEMS[m[0]]={n:m[1],d:'วัสดุจากบอสของ Gate '+TYPES[k].n+' (ยังไม่มีสูตรคราฟต์ใช้จริง)',k:'mat',col:m[2],icon:mkIcon(m[2],'gem'),sell:60}}
ITEMS.gateRandBox={n:'Gate Random Box (กล่องสุ่มจากเกต)',d:'กล่องสุ่มจากบอสเกต เปิดแล้วได้ของ 1 ชิ้น (ชุด/อาวุธเลเวลของเกต ยา หรือวัสดุ) ไม่มีตำราสกิล · คลิกเพื่อเปิด',k:'use',col:'#8fd0ff',icon:mkIcon('#8fd0ff','box'),sell:0};
function openRandBox(){if(!P||P.dead||countItem('gateRandBox')<1)return false;const L=Math.max(1,(P.gateBoxLv|0)||(P.lvl|0));
  const roll=rng();let it,txt;
  if(roll<.35){it=makeGear(pk(GEAR_TYPES),L,rng()<.12?3:rng()<.45?2:1);txt=itemName(it)}
  else if(roll<.55){it=makeWeapon(pk(WTYPES),L,rng()<.12?3:rng()<.45?2:1);txt=itemName(it)}
  else if(roll<.8){it={id:pk(['hpPot','mpPot','hpPot2']),q:ric(3,6)};txt=ITEMS[it.id].n+' x'+it.q}
  else{const tk=Object.keys(TYPES),m=TYPES[pk(tk)].mat;it={id:m[0],q:ric(2,4)};txt=ITEMS[m[0]].n+' x'+it.q}
  if(it.id&&!ITEMS[it.id]){it={id:'hpPot',q:3};txt='HP Potion x3'}
  const hold=P.inv.length<P.invSize||(it.id&&P.inv.find(x=>x.id===it.id));if(!hold){say('กระเป๋าเต็ม','r');return false}
  takeItem('gateRandBox',1);addItem(it);say('กล่องเกต: ได้ '+txt);GT.log.push('randbox '+txt);if(G.win==='wInv')renderInv();return true}
try{const _u=useItemId;useItemId=function(id){try{if(id==='gateRandBox')return openRandBox()}catch(e){ERR('use',e)}return _u.apply(this,arguments)}}catch(e){ERR('hook use',e)}
GT.openRandBox=openRandBox;
/* ---------------------------------------------------------------- monsters */
const SP={crystal_bat:{n:'Crystal Bat',sz:15,sp:130,c:'#7fe8ff',c2:'#1f4a7a',k:7.2,fy:.85},shard_crab:{n:'Shard Crab',sz:20,sp:70,c:'#9fd8ff',c2:'#2a4a8a',k:6.2,fy:.86},crystal_golem:{n:'Crystal Golem',sz:34,sp:46,c:'#7fe8ff',c2:'#1f3a6a',k:4.6,fy:.88}};
/* ---- gates2 r1 (12 Nov): G2-G5 monster sheets (Art, QA PASS, DeaRz OK 11 Nov 14:01) replace the gp_ placeholders; ?gates2art=off keeps the placeholders ----
   left-facing 256 px cells, mirrored for right; the attack sheets are drawn smaller than idle by Art, so the attack frames are drawn x ak (Art's table g2g5_attack_scale_table_r1: Tide Guardian 1.41, Drowned Guard 1.30, Mushroom King 1.24, Forge Titan 1.23, Demon Lord 1.20 ...), hurt frames x hk
   (measured: Iron Golem Hound hurt is 0.84 of idle (Art noted 0.75), Mushroom King hurt 0.94 (Art noted 0.86)); frames are drawn unclipped. Species multipliers hp / atk / def from BALANCE_gate_monsters_field_v1 apply on top of the gate row (HP x2.5, swarm ATK x0.6) for ordinary mobs and elites. */
const G2ART=window.__GATES2_ART,G2ON=!!G2ART&&!/[?&]gates2art=off\b/.test(Q);
const g2=(n,sz,hd,ih,ak,hk,hp,atk,def,spd,c,c2,x)=>Object.assign({n,sz,sp:spd,c,c2,k:hd*256/(ih*sz),fy:.93,ak,hk,hp,atk,def,g2:1,ih},x||{});
const G2SP={
 g2_drowned_temple_guard:g2('Drowned Temple Guard',26,86,220,1.30,1,1.2,1.1,1.0,58,'#5ef0e0','#1a4a5a'),
 g2_eel_serpentling:g2('Eel Serpentling',20,70,215,1.04,1,.8,.85,.7,110,'#4fd0ff','#1a3a6a'),
 g2_tide_guardian:g2('Tide Guardian',30,96,209,1.41,1,1,1,1,52,'#5ef0e0','#1a4a5a'),
 g3_sporeling:g2('Sporeling',22,74,203,1.04,1,1.0,.9,.9,62,'#b8ff7a','#3a5a2a',{elem:'Poison'}),
 g3_moth_sprite:g2('Moth Sprite',18,72,190,1.16,1,.7,1.0,.6,120,'#d8c8ff','#4a3a7a',{fly:1}),
 g3_mushroom_king:g2('Mushroom King',30,96,218,1.24,1.16,1,1,1,50,'#9ff4ff','#2a4a5a'),
 g4_magma_imp:g2('Magma Imp',20,74,204,1.12,1,.8,1.1,.8,90,'#ff8a3d','#6a2a10',{rng:1}),
 g4_iron_golem_hound:g2('Iron Golem Hound',26,78,197,1.17,1.19,1.2,1.15,1.3,100,'#ff9a5a','#4a3a3a'),
 g4_forge_titan:g2('Forge Titan',32,100,197,1.23,1,1,1,1,46,'#ff8a3d','#6a2a10'),
 g5_wraith:g2('Wraith',22,82,201,1.02,1,.8,1.1,.5,85,'#b04cff','#2a1a4a',{fly:1}),
 g5_shadow_knight:g2('Shadow Knight',26,88,190,1.15,1,1.4,1.15,1.2,62,'#b04cff','#2a1a4a'),
 g5_shadow_of_the_demon_lord_boss_final:g2('Shadow of the Demon Lord',32,100,199,1.20,1,1,1,1,50,'#b04cff','#2a1a4a')};
if(G2ON){Object.assign(SP,G2SP);try{Object.assign(MOBX,{g2_drowned_temple_guard:['humanoid','water'],g2_eel_serpentling:['fish','water'],g2_tide_guardian:['construct','water'],g3_sporeling:['plant','poison'],g3_moth_sprite:['insect','neutral'],g3_mushroom_king:['plant','poison'],g4_magma_imp:['demon','fire'],g4_iron_golem_hound:['construct','fire'],g4_forge_titan:['construct','fire'],g5_wraith:['undead','shadow'],g5_shadow_knight:['undead','shadow'],g5_shadow_of_the_demon_lord_boss_final:['demon','shadow']})}catch(e){ERR('MOBX',e)}
  Object.assign(TYPES.G2,{ord:['g2_drowned_temple_guard','g2_eel_serpentling'],elite:'g2_drowned_temple_guard',boss:'g2_tide_guardian',bossN:'Tide Guardian'});
  Object.assign(TYPES.G3,{ord:['g3_sporeling','g3_moth_sprite'],elite:'g3_sporeling',boss:'g3_mushroom_king',bossN:'Mushroom King'});
  Object.assign(TYPES.G4,{ord:['g4_magma_imp','g4_iron_golem_hound'],elite:'g4_iron_golem_hound',boss:'g4_forge_titan',bossN:'Forge Titan'});
  Object.assign(TYPES.G5,{ord:['g5_wraith','g5_shadow_knight'],elite:'g5_shadow_knight',boss:'g5_shadow_of_the_demon_lord_boss_final',bossN:'Shadow of the Demon Lord'});
  GT.g2={on:true,species:Object.keys(G2SP)}}else GT.g2={on:false};const ANI={idle:[6,150],move:[8,90],attack:[8,70],hurt:[3,90],death:[6,110]};
const sheets={};
function sheet(sp,a){const k=sp+'_'+a;if(sheets[k])return sheets[k];const src=(ART.mon&&ART.mon[k])||(G2ART&&G2ART[k]);if(!src)return null;const im=new Image();im.decoding='async';im.src=src;return sheets[k]=im}
for(const k in SP){MOBS[k]=Object.assign({n:SP[k].n,sh:'gatespr',c:SP[k].c,c2:SP[k].c2,sz:SP[k].sz,sp:SP[k].sp,gspr:1},SP[k].rng?{rng:1}:{})}
/* boss size (Monster artist 12 Nov): gate bosses are drawn 3 x hero height (idle figure); k is solved from the measured idle figure height so attack / hurt keep their scale relative to idle */
function figIh(sp,D){if(D.ih)return D.ih;if(D.ihm)return D.ihm;try{const im=sheet(sp,'idle');if(im&&im.complete&&im.naturalWidth){const cw=im.naturalWidth/6,ch=im.naturalHeight,c=document.createElement('canvas');c.width=cw;c.height=ch;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0,cw,ch,0,0,cw,ch);const d=g.getImageData(0,0,cw,ch).data;let tp=ch,bt=-1;for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(d[(y*cw+x)*4+3]>40){if(y<tp)tp=y;if(y>bt)bt=y}if(bt>=0)return D.ihm=(bt-tp+1)*256/ch}}catch(_){}return 200}
function bossK(sp,D,M0,s){return M0.bossH*256/(figIh(sp,D)*s)}
SHAPES.gatespr=function(e,x,y,s,t){const sp=SP[e.type]?e.type:((MOBS[e.type]||{}).spk||e.type),D=SP[sp];if(!D){return SHAPES.blob(e,x,y,s,t)}
  let a='idle',f=0;const tt=time;const dx=e._gx==null?0:e.x-e._gx,dy=e._gy==null?0:e.y-e._gy;e._gx=e.x;e._gy=e.y;
  const mv=Math.hypot(dx,dy)>.35;
  if(e._death!=null){a='death';f=Math.min(5,Math.floor(e._death*1000/ANI.death[1]))}else if(e._tele>0){a='attack';f=Math.min(3,Math.floor((1-e._tele/.45)*4))}else if(e.flash>0){a='hurt';f=Math.min(2,Math.floor((1-Math.min(1,e.flash/.15))*3))}
  else if(e.wind>0){a='attack';f=Math.min(3,Math.floor((1-e.wind/.42)*4))}
  else if(e.lunge>0){a='attack';f=4+Math.min(3,Math.floor((1-e.lunge/.15)*4))}
  else if(mv){a='move';f=Math.floor(tt*1000/ANI.move[1])%ANI.move[0]}
  else f=Math.floor((tt+e.ph)*1000/ANI.idle[1])%ANI.idle[0];
  const im=sheet(sp,a),M0=MOBS[e.type];if(!im||!im.complete||!im.naturalWidth)return SHAPES.blob(e,x,y,s,t);
  const n=ANI[a][0],cw=im.naturalWidth/n,ch=im.naturalHeight,dh=s*(M0&&M0.bossH?bossK(sp,D,M0,s):D.k)*(a==='attack'?(D.ak||1):a==='hurt'?(D.hk||1):1),dw=dh*cw/ch,flip=Math.cos(e.face)>0;
  const lift=D.fly&&e._death==null?(11+4.5*Math.sin((tt+(e.ph||0))*2.4)):0;ctx.save();if(e._dalpha!=null)ctx.globalAlpha*=e._dalpha;if(D.fly){ctx.save();ctx.globalAlpha*=.3;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(x,y+s*.35,dw*.17,dw*.06,0,0,6.283);ctx.fill();ctx.restore()}ctx.translate(x,y+s*.32-lift);if(flip)ctx.scale(-1,1);ctx.imageSmoothingEnabled=true;ctx.drawImage(im,f*cw,0,cw,ch,-dw/2,-dh*D.fy,dw,dh);ctx.restore()};
/* gate bosses / elites: clones of the base species with their own flags (boss -> m.boss, elite -> m.elite) */
for(const k in TYPES){const T=TYPES[k],base=MOBS[T.boss]||MOBS.gp_golem||MOBS.golem;
  MOBS['gb_'+k]=Object.assign({},base,{n:T.bossN,boss:1,elite:0,raid:0,sz:SP[T.boss]?104:Math.round(base.sz*C.BOSS_SZ),gate:1,rng:0,spk:T.boss,bossH:SP[T.boss]?3*((window.PUPPETX&&PUPPETX.cfg)?PUPPETX.cfg.TARGET_H*PUPPETX.cfg.H_FACTOR:76):0});
  MOBS['ge_'+k]=Object.assign({},MOBS[T.elite]||base,{n:(MOBS[T.elite]||base).n+' (Elite)',elite:1,boss:0,raid:0,gate:1,spk:T.elite});try{if(MOBX[T.boss])MOBX['gb_'+k]=MOBX[T.boss];if(MOBX[T.elite])MOBX['ge_'+k]=MOBX[T.elite]}catch(_){}}
const rowHp=(L,sz)=>Math.round((30+L*18+Math.pow(L,1.5)*2.2)*Math.sqrt((sz||22)/22)),rowAtk=L=>6+L*2.4;
const atkMul=T=>T.band===2?C.ATK_MULT_G5:C.ATK_MULT;
function mkMon(T,kind,L,x,y){const SM=SP[kind==='elite'?T.elite:kind]||{},type=kind==='boss'?'gb_'+T.key:kind==='elite'?'ge_'+T.key:kind,e=makeEnemy(type,L,x,y);
  if(kind==='boss'){e.maxHp=e.hp=Math.round((C.BOSS_HP[T.key]||30)*rowHp(L,22));e.atk=C.BOSS_ATK*rowAtk(L)*2.4;e.gateBoss=1}
  else if(kind==='elite'){e.maxHp=e.hp=Math.round(C.ELITE_HP*rowHp(L,22)*C.HP_MULT*(SM.hp||1));e.atk=C.ELITE_ATK*rowAtk(L)*atkMul(T)*(SM.atk||1);e.gateElite=1}
  else{e.maxHp=e.hp=Math.round(rowHp(L,e.sz)*C.HP_MULT*(SM.hp||1));e.atk=rowAtk(L)*C.SWARM*atkMul(T)*(SM.atk||1)}
  e.def=L*.9*(kind==='boss'?1:(SM.def||1));if(SM.elem){const el=SM.elem;try{Object.defineProperty(e,'elem',{configurable:true,enumerable:true,get(){return el},set(){}})}catch(_){e.elem=el}}e.gate=1;e.gateType=T.key;e.aggro=true;e.alertT=.5;return e}
/* ---- gates2 r2 (12 Nov): death animations (6 frames, hold, 0.3 s fade, for every sheet-based gate monster incl. bosses), Magma Imp fireball with telegraph (placeholder: 0.45 s telegraph, 1.0 x ATK, range 260), floaters (Moth Sprite, Wraith: bob + soft ground shadow), Sporeling poison via the engine's own on-hit poison (elem 'Poison') ---- */
const ghosts=[];GT.ghosts=ghosts;
const isSheetMon=e=>{const m=e&&MOBS[e.type];return !!(e&&e.gate&&(SP[e.type]||(m&&m.spk&&SP[m.spk])))};
try{const _k=killEnemy;killEnemy=function(e){const was=e&&e.dead;const r=_k.apply(this,arguments);try{if(e&&!was&&e.dead&&G.zone===ZID&&isSheetMon(e))ghosts.push({type:e.type,x:e.x,y:e.y,face:e.face||0,ph:e.ph||0,sz:e.sz,t0:time})}catch(er){ERR('ghost',er)}return r}}catch(e){ERR('hook kill',e)}
try{const _es=enemyShoot;enemyShoot=function(e,ang,spd){if(e&&e.type==='g4_magma_imp'&&e.gate){if(e._tele>0)return;e._tele=.45;return}return _es.apply(this,arguments)}}catch(e){ERR('hook shoot',e)}
/* boss bar: the in-world bar of a 3x boss can sit behind the top HUD, so a fixed bar under the HUD shows the gate boss name + HP */
let bbEl=null;function bossBar(){const b=G.zone===ZID&&G.state==='play'?enemies.find(e=>e.gateBoss&&!e.dead):null;if(!b){if(bbEl)bbEl.style.display='none';return}if(!bbEl){bbEl=document.createElement('div');bbEl.id='gtBossBar';bbEl.style.cssText='position:fixed;left:50%;top:118px;transform:translateX(-50%);z-index:7000;width:min(460px,66vw);pointer-events:none;text-align:center;font:700 13px system-ui,sans-serif;color:#ffe9d0;text-shadow:0 1px 3px #000';bbEl.innerHTML='<div class="n"></div><div class="bb" style="height:11px;border-radius:6px;background:rgba(10,8,20,.8);border:1px solid #b55;margin-top:2px;overflow:hidden"><div class="f" style="height:100%;background:linear-gradient(90deg,#c0303c,#ff6b5a);width:100%"></div></div>';document.body.appendChild(bbEl)}bbEl.style.display='block';bbEl.querySelector('.n').textContent=b.m.n+' · Lv'+b.L;bbEl.querySelector('.f').style.width=Math.max(0,Math.min(100,b.hp/b.maxHp*100))+'%'}
/* while the fixed top bar is shown the game's own in-world HP bar of a gate boss is not drawn (rrect becomes an empty path for the duration of that one drawEnemy call; the in-world name stays) */
let noBar=false;try{const _de=drawEnemy;drawEnemy=function(e){if(e&&e.gateBoss&&bbEl&&bbEl.style.display==='block'){noBar=true;try{return _de.apply(this,arguments)}finally{noBar=false}}return _de.apply(this,arguments)}}catch(e){ERR('hook drawEnemy',e)}
try{const _rr=rrect;rrect=function(){if(noBar)return _rr.call(this,0,0,0,0,0);return _rr.apply(this,arguments)}}catch(e){ERR('hook rrect',e)}
try{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{bossBar()}catch(er){ERR('bossbar',er)}try{if(G.zone===ZID){for(const e of enemies){const sd=SP[e.type]||SP[(MOBS[e.type]||{}).spk];if(sd&&sd.elem&&e.elem!==sd.elem)e.elem=sd.elem;if(e._tele>0){if(e.dead||(e.st&&e.st.stun)){e._tele=0;continue}e._tele-=dt;e.face=Math.atan2(P.y-e.y,P.x-e.x);if(e._tele<=0){e._tele=0;const a=Math.atan2(P.y-e.y,P.x-e.x),v=320;projs.push({team:'e',x:e.x,y:e.y-e.sz*.6,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:260/v,dmg:e.atk*1.0,size:9,col:'#ff8a3d',src:e,trail:[],kind:'eorb'});e.lunge=.15;GT.stats.fireballs=(GT.stats.fireballs||0)+1}}}}else if(ghosts.length)ghosts.length=0}catch(er){ERR('upd2',er)}return r}}catch(e){ERR('hook upd2',e)}
try{const _p=drawParts;drawParts=function(){const r=_p.apply(this,arguments);try{if(G.zone===ZID){for(let i=ghosts.length-1;i>=0;i--){const g=ghosts[i],age=time-g.t0;if(age>1.2){ghosts.splice(i,1);continue}ctx.save();SHAPES.gatespr({type:g.type,x:g.x,y:g.y,face:g.face,ph:g.ph,flash:0,wind:0,lunge:0,_death:age,_dalpha:age<.8?1:Math.max(0,1-(age-.8)/.3)},g.x,g.y,g.sz,time);ctx.restore()}
    for(const e of enemies){if(!(e._tele>0)||e.dead)continue;const k=1-e._tele/.45,a=Math.atan2(P.y-e.y,P.x-e.x);ctx.save();try{add()}catch(_){}try{glow(e.x+Math.cos(a)*e.sz,e.y-e.sz*.6,10+22*k,'#ff7a2a',.35+.5*k)}catch(_){}try{norm()}catch(_){}ctx.globalAlpha=.25+.45*k;ctx.strokeStyle='#ff5a2a';ctx.lineWidth=2;ctx.setLineDash([8,7]);ctx.beginPath();ctx.moveTo(e.x,e.y-e.sz*.6);ctx.lineTo(e.x+Math.cos(a)*260,e.y-e.sz*.6+Math.sin(a)*260);ctx.stroke();ctx.restore()}}}catch(er){ERR('drawParts2',er)}return r}}catch(e){ERR('hook drawParts2',e)}/* ---------------------------------------------------------------- room geometry (image px 1254x1254, scaled by C.S) */
function walk(kind,x,y,open){
  if(kind==='A'){if(x>=100&&x<=1155&&y>=225&&y<=1015)return 1}
  else if(kind==='B'){const dx=(x-627)/520,dy=(y-632)/392;if(dx*dx+dy*dy<=1)return 1}
  else if(kind==='C'){if(x>=350&&x<=915&&y>=210&&y<=1020)return 1}
  if(open&&x>=578&&x<=678&&y>=90&&y<=240)return 1;return 0}
const wk=(kind,wx,wy,open)=>walk(kind,wx/C.S,wy/C.S,open);
GT.walk=wk;
const ALTAR={x:627,y:645};   /* image px: pedestal centre / base */
/* ---------------------------------------------------------------- zone, background, solids, props */
ZONES[ZID]={n:'Gate',th:'Gate',sub:'Gate',safe:0,fullSafe:0,w:RW,h:RW,seed:4141,ground:['#10182a','#141e34','#18243e','#0c1424'],acc:'#7fe8ff',amb:'mote',mobs:[],density:0,areas:[],gate:1};
const imgs={};function roomImg(key){if(imgs[key])return imgs[key];const src=(NEW&&NEW.rooms[key])||(ART.rooms&&ART.rooms[key]);if(!src)return null;const im=new Image();im.decoding='async';im.src=src;return imgs[key]=im}
const roomKey=()=>GT.run?(GT.run.type+GT.run.kinds[GT.run.room]):null;
{const _g=genBG;genBG=function(zid){if(zid!==ZID||!GT.run)return _g.apply(this,arguments);BGS=1;LIGHTS=[];
  const c=document.createElement('canvas');c.width=c.height=RW;const g=c.getContext('2d');g.fillStyle='#070b16';g.fillRect(0,0,RW,RW);
  const im=roomImg(roomKey());if(im&&im.complete&&im.naturalWidth){g.imageSmoothingQuality='high';g.drawImage(im,0,0,RW,RW);
    /* the baked 'scale hero' painted at the bottom door is covered with neighbouring floor (the real hero arrives there) */
    if(!NEW){const k=RW/1254;g.drawImage(im,500,926,84,116,588*k,926*k,84*k,116*k)}}else{GT.pendingPaint=true}
  return c}}
{const _f=gatesFor;gatesFor=function(zid){if(zid===ZID)return [];return _f.apply(this,arguments)}}
{const _l=loadPropsFor;loadPropsFor=function(zid){if(zid===ZID){const alt=GT.run&&GT.run.room<3?(NEW?[orbPropFor(roomKey())]:[{t:'gtaltar',x:ALTAR.x*C.S,y:ALTAR.y*C.S,s:1,v:0,f:1,ph:0}]):[];return alt}return _l.apply(this,arguments)}}
{const _e=edgeProps;edgeProps=function(zid){const r=_e.apply(this,arguments);return zid===ZID?[]:r}}
PROP_DEFS.gtaltar={n:'Gate Altar',cat:'gate',w:420,h:560,ax:210,ay:540,nofade:1,liveOnly:1,solid:[{dx:0,dy:-18,r:58*C.S}],
  live(c,p){try{const st=altarState(),im=altarImg(st);if(!im||!im.complete||!im.naturalWidth)return;const sc=.40*C.S,w=418*sc,h=561*sc;
    c.save();c.imageSmoothingEnabled=true;if(st==='ready'){c.globalAlpha=1;add();glow(p.x,p.y-h*.75,h*.55,'#ffd86b',.28+.1*Math.sin(time*3));norm()}c.drawImage(im,p.x-w/2,p.y-h+h*.04,w,h);c.restore()}catch(e){ERR('altar',e)}}};
/* ---- orb prop (orb-free rooms): ONE prop type per room key (gtorb_G1A ... gtorb_G5C) so the editor JSON names the room; position + scale saved per room in localStorage 'lanternfall_gateorb_v1' when the editor Save is pressed ---- */
function orbSaved(){try{return JSON.parse(localStorage.getItem('lanternfall_gateorb_v1')||'{}')||{}}catch(_){return {}}}
const orbImgs={};function orbImg(g){const k='g'+g;if(orbImgs[k])return orbImgs[k];const im=new Image();im.decoding='async';im.src=NEW.orbs[k];return orbImgs[k]=im}
function orbFor(key){const c=NEW.centres[key]||[627,577],sv=orbSaved()[key];if(sv&&isFinite(sv.x)&&isFinite(sv.y)&&isFinite(sv.s)&&sv.s>0)return {x:sv.x,y:sv.y,s:sv.s};return {x:c[0]*C.S,y:(c[1]-8)*C.S,s:1}}
function orbPropFor(key){const o=orbFor(key);return {t:'gtorb_'+key,x:o.x,y:o.y,s:o.s,v:0,f:1,ph:0}}
function orbProp(){try{return PROPS.find(q=>/^gtorb_/.test(q.t))||null}catch(_){return null}}
function altarPos(){if(NEW){const p=orbProp();if(p)return [p.x,p.y]}return [ALTAR.x*C.S,ALTAR.y*C.S]}
GT.orbProp=orbProp;GT.altarPos=altarPos;
if(NEW){for(const key in NEW.centres){const g=key[1],sz=NEW.orbSize['g'+g],w=sz.w*C.S,h=sz.h*C.S;
  PROP_DEFS['gtorb_'+key]={n:'Gate Orb '+key,cat:'gate',w:w,h:h,ax:sz.px*C.S,ay:sz.py*C.S,nofade:1,liveOnly:1,solid:[{dx:0,dy:Math.round(h*.22),r:Math.round(Math.min(w,h)*.30)}],
   live(c,p){try{const st=altarState(),im=orbImg(g);if(!im||!im.complete||!im.naturalWidth)return;const s=+p.s||1,W=w*s,H=h*s,x0=p.x-sz.px*C.S*s,y0=p.y-sz.py*C.S*s;
     c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
     if(st==='ready'){add();glow(p.x,p.y,H*.7,'#ffd86b',.26+.1*Math.sin(time*3));norm()}
     else{c.globalAlpha=st==='used'?.45:.7;try{c.filter=st==='used'?'grayscale(1) brightness(.7)':'grayscale(.6) brightness(.85)'}catch(_){}}
     c.drawImage(im,x0,y0,W,H);c.restore()}catch(e){ERR('orb',e)}}}}
 /* editor: + / - resize the selected orb (the mouse wheel and the size slider work already); Save writes position + scale of this room */
 addEventListener('keydown',e=>{try{if(!ED.on||!ED.sel||!/^gtorb_/.test(ED.sel.t))return;const tg=e.target;if(tg&&/INPUT|TEXTAREA|SELECT/.test(tg.tagName))return;const k=e.key;let f=0;if(k==='+'||k==='=')f=1.05;else if(k==='-'||k==='_')f=1/1.05;if(!f)return;
   e.stopImmediatePropagation();e.preventDefault();ED.sel.s=clamp(+(ED.sel.s*f).toFixed(3),.3,4);edMark();try{buildSolids()}catch(_){}}catch(er){ERR('orbkey',er)}},true);
 {const _s=saveLayout;saveLayout=function(){if(G.zone===ZID&&GT.run){try{const p=orbProp();if(p){const m=orbSaved();m[p.t.slice(6)]={x:Math.round(p.x*10)/10,y:Math.round(p.y*10)/10,s:+(+p.s).toFixed(3)};localStorage.setItem('lanternfall_gateorb_v1',JSON.stringify(m))}}catch(e){ERR('orbsave',e)}}return _s.apply(this,arguments)}}}
const altImgs={};function altarImg(st){if(altImgs[st])return altImgs[st];const src=ART.altar&&ART.altar[st];if(!src)return null;const im=new Image();im.decoding='async';im.src=src;return altImgs[st]=im}
{const _b=buildSolids;buildSolids=function(){const r=_b.apply(this,arguments);if(G.zone!==ZID||!GT.run)return r;
  try{const kind=GT.run.kinds[GT.run.room],open=!!GT.run.open,st=22,R0=24,add=(x,y)=>{const o={x,y,r:R0};SOLIDS.push(o);const pad=R0+50;for(let gx=Math.floor((x-pad)/SCELL);gx<=Math.floor((x+pad)/SCELL);gx++)for(let gy=Math.floor((y-pad)/SCELL);gy<=Math.floor((y+pad)/SCELL);gy++){const k=gx+','+gy;let l=SGRID.get(k);if(!l)SGRID.set(k,l=[]);l.push(o)}};
    let n=0;for(let y=-st;y<=RW+st;y+=st)for(let x=-st;x<=RW+st;x+=st){if(wk(kind,x,y,open))continue;let near=false;
      for(let dy=-2;dy<=2&&!near;dy++)for(let dx=-2;dx<=2;dx++){if(wk(kind,x+dx*st,y+dy*st,open)){near=true;break}}
      if(near){add(x,y);n++}}
    GT.solidN=n;try{buildNav()}catch(_){}}catch(e){ERR('solids',e)}return r}}
{const _s=spawnEnemy;spawnEnemy=function(){if(G.zone===ZID)return;return _s.apply(this,arguments)}}
{const _t=travel;travel=function(to,how){if(to==='__altar')return;return _t.apply(this,arguments)}}
/* ---------------------------------------------------------------- run state */
const bandOf=Lg=>Lg<=30?0:Lg<=60?1:2;
function expOf(L){return 50*Math.pow(L,2.5)+100}
function clearMin(bi){return C.GATE_CLEAR_MIN!=null?C.GATE_CLEAR_MIN:1.2*C.BASE_T[bi]*(.4+.6*C.HP_MULT)}
function rewardOf(Lg,bi){const T=C.BASE_T[bi]*(.4+.6*C.HP_MULT),min=clearMin(bi);return {exp:Math.round(min*expOf(Lg)/(3+.45*(Lg-1))),gold:Math.round(30*(6+3.4*Lg)*(T/C.BASE_T[bi])),min:+min.toFixed(1)}}
GT.rewardOf=rewardOf;
function roomPlan(room,bi){if(room>=3)return {boss:1,waves:0,per:0};const w=C.WAVES[bi][room];return {boss:0,waves:w[0],per:w[1]}}
function lockedMsg(g){if(!RULE)return null;const t=GT.lock[g.id];if(t&&t>now())return 'เข้าไม่ได้ (ตายใน Gate นี้แล้ว)';if(GT.clear[g.type]===today())return 'เคลียร์แล้ววันนี้';return null}
GT.lockedMsg=lockedMsg;
function enter(g,room,force){if(!P||P.dead||G.fade)return false;if(G.zone===ZID)return false;const msg=force?null:lockedMsg(g);if(msg){say(msg,'r');return false}
  const T=Object.assign({key:g.type},TYPES[g.type]);
  GT.run={gate:g,type:g.type,T,Lg:g.Lg,bi:T.band,room:room|0,kinds:C.ROOMS,ret:{zone:G.zone,x:P.x,y:P.y},waves:null,open:false,done:false,dead:false,reward:null,boss:null,phase2:false,t:0,startT:now(),kills:0,fx:[]};
  for(const k of C.ROOMS.map(r=>g.type+r))roomImg(k);altarImg('locked');altarImg('ready');altarImg('used');for(const a in ANI)for(const s of Object.keys(SP))sheet(s,a);
  const wait=()=>{const R=GT.run;if(!R)return;const im=roomImg(roomKey());if(im&&!(im.complete&&im.naturalWidth)){setTimeout(wait,100);return}go()};
  const go=()=>{G.unlocked&&G.unlocked.add&&G.unlocked.add(ZID);enterRoom(GT.run.room,true)};wait();return true}
GT.enter=enter;
function setupRoom(R){const pl=roomPlan(R.room,R.bi);R.pl=pl;R.waves={n:pl.waves,per:pl.per,spawned:0,t:null,queue:[]};R.open=false;R.boss=null;R.phase2=false;R.bossDone=false}
function enterRoom(room,first,tries){const R=GT.run;if(!R)return;R.room=room;const im0=roomImg(roomKey());if(im0&&!(im0.complete&&im0.naturalWidth)&&(tries|0)<100){setTimeout(()=>enterRoom(room,first,(tries|0)+1),100);return}setupRoom(R);
  const arr={x:627*C.S,y:985*C.S};
  G.fade={t:0,fn:()=>{try{if(G.zone!==ZID){R.ret={zone:G.zone,x:P.x,y:P.y}}ZONES[ZID].n='Gate · '+R.T.n;ZONES[ZID].th=R.T.th;ZONES[ZID].sub=room>=3?'ห้องบอส':'ห้อง '+(room+1)+' / 3';
    {const h=Set.prototype.has;Set.prototype.has=function(k){return k===ZID||h.call(this,k)};try{loadZone(ZID,arr)}finally{Set.prototype.has=h}}fitCam();if(!first&&room>0){const h=Math.round(P.maxHp*C.HEAL),m=Math.round(P.maxMp*C.HEAL);P.hp=Math.min(P.maxHp,P.hp+h);P.mp=Math.min(P.maxMp,P.mp+m);say('ประตูปลอดภัย: ฟื้น HP/MP +30%')}
    if(room>=3)spawnBossNow();GT.log.push('room '+room);hud()}catch(e){ERR('enterRoom',e)}}}}
function fitCam(){try{if(typeof CAM==='undefined')return;if(CAM._gt0===undefined)CAM._gt0={zt:CAM.zt,tt:CAM.tt};if(/[?&]gatezoom=fit\b/.test(Q)){const z=Math.min(W/RW,H/RW)*.98;CAM.zt=z;CAM.z=z}CAM.tt=1;CAM.tilt=1;CAM.yaw=0;CAM.yt=0}catch(e){ERR('fitCam',e)}}
function unfitCam(){try{if(typeof CAM!=='undefined'&&CAM._gt0){CAM.zt=CAM._gt0.zt;CAM.tt=CAM._gt0.tt;delete CAM._gt0}}catch(_){}}
function alive(){let n=0;for(const e of enemies)if(e.gate&&!e.dead)n++;return n}
GT.alive=alive;
function spotNear(R){const kind=R.kinds[R.room];for(let i=0;i<60;i++){const x=rnd(120,RW-120),y=rnd(120,RW-120);if(!wk(kind,x,y,false))continue;{const ap=altarPos();if(Math.hypot(x-ap[0],y-ap[1])<130*C.S)continue}if(Math.hypot(x-P.x,y-P.y)<300)continue;
  let ok=true;for(const e of enemies)if(!e.dead&&Math.hypot(e.x-x,e.y-y)<28){ok=false;break}if(ok)return [x,y]}return [rnd(300,RW-300),rnd(300,RW*.5)]}
function waveList(R){const w=R.waves,list=[];for(let i=0;i<w.per;i++)list.push(pk(R.T.ord));
  if(w.spawned===w.n){if(R.room===1)list.push('E');else if(R.room===2){list.push('E');list.push('E')}}return list}
function releaseWave(R,why){const w=R.waves;if(w.spawned>=w.n)return;w.spawned++;for(const k of waveList(R))w.queue.push(k);w.t=w.spawned<w.n?C.WAVE_T:null;R.lastWave=why;
  try{showBanner('เวฟ '+w.spawned+' / '+w.n,R.room===2||R.room===1?(w.spawned===w.n?'เวฟสุดท้าย':''):(w.spawned===w.n?'เวฟสุดท้าย':''),1.4)}catch(_){}GT.log.push('wave '+w.spawned+' '+why);pump(R);hud()}
function pump(R){const w=R.waves;while(w&&w.queue.length&&alive()<C.CAP){const k=w.queue.shift(),[x,y]=spotNear(R);const e=k==='E'?mkMon(R.T,'elite',R.Lg,x,y):mkMon(R.T,k,R.Lg,x,y);enemies.push(e);try{ring(x,y,6,50,.4,'#7fe8ff',4)}catch(_){}}}
/* boss escort (v1: 6 minions at the boss spawn, split 3+3 over the gate's two ordinary species; +4 once at 50 % HP below; no respawn while the boss lives); ?bossadds=off = the old 50 %-only adds */
function mixList(R,n){const w=R.T.key==='G3'?[2/3,1/3]:[.5,.5],a=Math.round(n*w[0]),o=[];for(let i=0;i<n;i++)o.push(R.T.ord[i<a?0:1]);return o}   /* spec: Mushroom King = Sporeling 4 + Moth Sprite 2, every other gate 3 + 3; the +4 use the same mix */
function escort(R,b,n){let made=0;const ml=mixList(R,n);for(let i=0;i<n;i++){const a=i/n*TAU+.4,k=ml[i];const e=mkMon(R.T,k,R.Lg,b.x+Math.cos(a)*150,b.y+Math.sin(a)*150);e.aggro=true;e.escort=1;if(!NOCAP&&b.maxHp>0){const cap=Math.max(1,Math.round(.03*b.maxHp));if(e.maxHp>cap){const f=e.maxHp>0?e.hp/e.maxHp:1;e.maxHp=cap;e.hp=Math.max(1,Math.round(cap*f))}}enemies.push(e);made++}GT.stats.escort=(GT.stats.escort||0)+made;return made}
function spawnBossNow(){const R=GT.run;if(!R||R.boss&&!R.boss.dead)return;const e=mkMon(R.T,'boss',R.Lg,RW/2,RW*.38);e.aggro=true;enemies.push(e);R.boss=e;if(!OLDB)try{escort(R,e,6)}catch(er){ERR('escort',er)}try{showBanner(R.T.bossN,'บอสของเกต',2.2)}catch(_){}GT.log.push('boss spawned hp='+e.maxHp+' atk='+Math.round(e.atk))}
function altarState(){const R=GT.run;if(!R||!R.waves)return 'locked';const w=R.waves;if(alive()>0||w.queue.length)return 'locked';if(w.spawned>=w.n)return 'used';return 'ready'}
GT.altarState=altarState;
function callWave(){const R=GT.run;if(!R||P.dead||G.zone!==ZID)return false;if(altarState()!=='ready')return false;releaseWave(R,'altar');return true}
GT.callWave=callWave;
function openDoor(R){if(R.open)return;R.open=true;try{buildSolids()}catch(_){}try{ring(RW/2,160*C.S,10,150,.8,'#7fe8ff',6);showBanner('ประตูเปิดแล้ว','เดินผ่านประตูด้านบน',2)}catch(_){}GT.log.push('door open room '+R.room)}
/* ---------------------------------------------------------------- per-frame logic */
function tick(dt){const R=GT.run;if(!R||G.zone!==ZID||G.state!=='play'||P.dead)return;R.t+=dt;const w=R.waves;
  /* other game modules (boss minion / reinforcement rules) can drop foreign monsters (bogtoad, strawman...) into the gate: a gate holds only gate monsters */
  for(const e of enemies)if(!e.gate&&!e.dead){e.dead=true;GT.stats.purged=(GT.stats.purged||0)+1}
  if(R.room<3&&w){if(w.t!=null&&w.spawned<w.n){w.t-=dt;if(w.t<=0)releaseWave(R,'timer')}pump(R);
    if(w.spawned>=w.n&&alive()===0&&!w.queue.length)openDoor(R)}
  const b=R.boss;if(b&&!b.dead&&!R.phase2&&b.hp<=b.maxHp*.5){R.phase2=true;b.p2=1;GT.log.push('phase2');try{showBanner('บอสโกรธ!','ความเร็วโจมตี +25% · ลูกสมุนมา',2)}catch(_){}
    if(OLDB){for(let i=0;i<4;i++){const a=i/4*TAU,e=mkMon(R.T,pk(R.T.ord),R.Lg,b.x+Math.cos(a)*120,b.y+Math.sin(a)*120);e.aggro=true;enemies.push(e)}}else escort(R,b,4)}
  if(b&&b.dead&&!R.bossDone){R.bossDone=true;openDoor(R)}
  if(R.open&&P.y<150*C.S&&Math.abs(P.x-RW/2)<70*C.S+20&&!G.fade){if(R.room<3)enterRoom(R.room+1,false);else leave('clear')}
  hudSoft()}
function leave(why){const R=GT.run;if(!R||G.fade)return;G.fade={t:0,fn:()=>{try{const r=R.ret||{zone:'capital',x:0,y:0};let zid=r.zone;if(!ZONES[zid]||zid===ZID)zid='capital';let pos={x:r.x,y:r.y};if(zid==='capital')pos=capSpawn();
  G.unlocked&&G.unlocked.add&&G.unlocked.add(zid);loadZone(zid,pos);unfitCam();endRun(why);saveGame()}catch(e){ERR('leave',e)}}}}
GT.leave=leave;
function endRun(why){const R=GT.run;GT.run=null;GT.log.push('end '+why);hud();if(R&&R.bossDone&&why==='clear'){GT.log.push('exit after clear')}}
/* kill wrapper: gate mobs give 30% exp/gold; boss drops handled here */
let mulOn=false,suppress=false;
{const _g=gainExp;gainExp=function(x,tx,ty){if(mulOn)x=Math.max(1,Math.round(x*C.MOB_EXP));return _g.call(this,x,tx,ty)}}
{const _d=dropLoot;dropLoot=function(x,y,o){try{if(o){if(o.gold&&mulOn)o.gold=Math.max(1,Math.round(o.gold*C.MOB_EXP));const it=o.item;if(it&&it.id&&/^card_/.test(it.id)&&!ITEMS[it.id])return;
  if(suppress&&it&&(it.kind==='wpn'||it.kind==='eq')&&!o._sp&&!o._gt)return}}catch(e){ERR('dropLoot',e)}return _d.apply(this,arguments)}}
{const _k=killEnemy;killEnemy=function(e){const was=e&&e.dead,g=e&&e.gate&&!was;if(g){mulOn=true;suppress=!!e.gateBoss}let r;try{r=_k.apply(this,arguments)}finally{mulOn=false;suppress=false}
  try{if(g&&e.dead){GT.stats.kills++;const R=GT.run;if(R)R.kills++;
    if(SP[e.type]){fx.push({k:'gatedeath',x:e.x,y:e.y,sp:e.type,sz:e.sz,flip:Math.cos(e.face)>0,t:0,dur:.7})}
    if(e.gateBoss&&R)bossReward(R,e)}}catch(er){ERR('kill',er)}return r}}
{const _f=drawFx;drawFx=function(f){if(f.k==='gatedeath'){try{const D=SP[f.sp],im=sheet(f.sp,'death');if(im&&im.complete&&im.naturalWidth){const n=6,cw=im.naturalWidth/n,ch=im.naturalHeight,fr=Math.min(n-1,Math.floor(f.t/f.dur*n)),dh=f.sz*D.k,dw=dh*cw/ch;
    ctx.save();ctx.translate(f.x,f.y+f.sz*.32);if(f.flip)ctx.scale(-1,1);ctx.globalAlpha=fr>=n-1?Math.max(0,1-(f.t-f.dur*(n-1)/n)/(f.dur/n)):1;ctx.drawImage(im,fr*cw,0,cw,ch,-dw/2,-dh*D.fy,dw,dh);ctx.restore()}}catch(e){}return}return _f.apply(this,arguments)}}
function bossReward(R,e){if(R.reward)return;const over=P.lvl>R.Lg+C.OVER_LV,mul=over?C.OVER_MUL:1,rw=rewardOf(R.Lg,R.bi),first=!RULE||GT.clear[R.type]!==today();
  const got={exp:0,gold:0,gear:null,box:0,mat:0,mul,first};R.reward=got;
  if(first){got.exp=Math.round(rw.exp*mul);got.gold=Math.round(rw.gold*mul);try{gainExp(got.exp,P.x,P.y-90)}catch(_){}P.gold+=got.gold;try{textAt(P.x,P.y-60,'+'+got.gold+' G','#ffd36b',16,{life:1.4})}catch(_){}
    if(rng()<mul){const rar=rng()<.25?3:2,it=makeGear(pk(GEAR_TYPES),R.Lg,rar);got.gear=itemName(it);dropLoot(e.x,e.y,{item:it,_gt:1,rare:0})}
    dropLoot(e.x+20,e.y,{item:{id:R.T.mat[0],q:ric(2,4)},_gt:1});got.mat=1;
    if(C.RANDOM_BOX){P.gateBoxLv=R.Lg;dropLoot(e.x-20,e.y,{item:{id:'gateRandBox',q:C.RANDOM_BOX},_gt:1});got.box=C.RANDOM_BOX}
    if(RULE){GT.clear[R.type]=today();save()}GT.stats.rewards++}
  GT.log.push('reward '+JSON.stringify(got));try{showBanner(first?'GATE CLEARED!':'เคลียร์แล้ว (ไม่มีรางวัล)',R.T.n,3);log(first?`Gate เคลียร์! EXP +${got.exp} · ทอง +${got.gold}${over?' (เลเวลสูงกว่า Gate >10: x0.4)':''}`:'เคลียร์ซ้ำในวันเดียวกัน: ไม่มีรางวัล','g')}catch(_){}}
/* death inside a gate = lock, no revive */
{const _p=playerDeath;playerDeath=function(){const R=GT.run;if(R&&G.zone===ZID&&!R.dead){for(const id in P.buffs){if(P.buffs[id]&&P.buffs[id].revive)delete P.buffs[id]}}
  const r=_p.apply(this,arguments);try{if(R&&G.zone===ZID&&P.dead&&!R.dead){R.dead=true;if(RULE){GT.lock[R.gate.id]=now()+C.LOCK_H*3600e3;save()}GT.log.push('death lock');
    setTimeout(()=>{try{const s=document.getElementById('overSub');if(s)s.textContent+=' · ตายใน Gate: เข้า Gate นี้ไม่ได้อีก '+C.LOCK_H+' ชม.'}catch(_){}},1000)}}catch(e){ERR('death',e)}return r}}
/* leaving the instance any way (revive in the capital, warp...) ends the run */
{const _l=loadZone;loadZone=function(zid,arr){const was=G.zone===ZID;const r=_l.apply(this,arguments);try{if(zid!==ZID&&was&&GT.run){unfitCam();endRun(GT.run.dead?'death':'left')}}catch(e){ERR('loadZone',e)}return r}}
/* save: inside an instance the character is saved at the gate entrance (run is not saved) */
{const _s=saveGame;saveGame=function(){const R=GT.run;if(R&&G.zone===ZID){const z=G.zone,x=P.x,y=P.y,r=R.ret||{};G.zone=ZONES[r.zone]&&r.zone!==ZID?r.zone:'capital';if(r.zone&&ZONES[r.zone]&&r.zone!==ZID){P.x=r.x;P.y=r.y}try{return _s.apply(this,arguments)}finally{G.zone=z;P.x=x;P.y=y}}return _s.apply(this,arguments)}}
/* hero damage rules: no single hit above 25% maxHP */
{const _h=hurtPlayer;hurtPlayer=function(raw,src){if(GT.run&&G.zone===ZID&&src&&src.gate){const f=Math.max(.1,100/(100+P.def));const cap=.25*P.maxHp/f;if(raw>cap)raw=cap}return _h.call(this,raw,src)}}
/* enemies: attacker cap 6, boss phase 2 aspd, boss AI without the dark lord summons */
{const _u=updEnemies;updEnemies=function(dt){const R=GT.run;if(R&&G.zone===ZID){try{const nb=(!OLDW&&enemies.some(x=>x.gate&&x.m&&x.m.boss&&!x.dead&&x.aggro))?1:0,al=enemies.filter(e=>e.gate&&!e.dead&&e.aggro&&!e.m.boss).sort((a,b)=>d2(a.x,a.y,P.x,P.y)-d2(b.x,b.y,P.x,P.y));
    for(let i=0;i<al.length;i++){const e=al[i];if(i>=C.MAX_ATK-nb&&!(e.wind>0)){e.atkCd=Math.max(e.atkCd,.35);e.castCd=Math.max(e.castCd,.35)}}
    for(const e of enemies){if(e.gate&&e.p2&&!e.dead){e.atkCd-=dt*.25;e.castCd-=dt*.25;e.special-=dt*.25}}}catch(er){ERR('upd',er)}}
  const r=_u.apply(this,arguments);try{tick(dt)}catch(er){ERR('tick',er)}return r}}
{const _b=bossAI;bossAI=function(e,dt,dP){if(e&&e.gate&&e.m&&e.m.boss){const m=e.m;e.m=Object.assign({},m,{boss:0,elite:1});const s0=e.special;try{return _b.call(this,e,dt,dP)}finally{e.m=m;if(e.special>s0+1)e.special=Math.max(e.special,C.RING_MIN+.01)}}return _b.apply(this,arguments)}}
/* ---------------------------------------------------------------- HUD, panel, altar button, GM */
const css=document.createElement('style');css.textContent='#gtHud{position:fixed;left:50%;top:64px;transform:translateX(-50%);z-index:8000;padding:5px 14px;border-radius:12px;background:rgba(8,14,30,.82);border:1px solid #7fe8ff;color:#e8fbff;font:700 15px system-ui,sans-serif;display:none;text-align:center;pointer-events:none;white-space:nowrap}#gtHud small{display:block;font:600 11px system-ui;color:#9fc8d8}'
 +'#gtBtn{position:fixed;left:8px;top:150px;z-index:8000;padding:7px 12px;border-radius:10px;border:1px solid #c9a46a;background:rgba(40,28,12,.9);color:#ffe9b0;font:700 14px system-ui,sans-serif;cursor:pointer}'
 +'#gtPanel{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:8100;width:min(520px,94vw);max-height:86vh;overflow:auto;padding:14px;border-radius:14px;background:rgba(10,12,28,.96);border:1px solid #6a78b8;color:#eef;font:14px system-ui,sans-serif;display:none}'
 +'#gtPanel h3{margin:0 0 4px;font:700 17px system-ui}#gtPanel .note{font-size:11px;color:#ffb070;margin-bottom:8px}#gtPanel .row{display:flex;align-items:center;gap:8px;margin:6px 0;padding:8px 10px;border-radius:10px;background:rgba(30,34,70,.7);border-left:4px solid #4aa8ff}#gtPanel .row .t{flex:1}#gtPanel .row .s{font-size:12px;color:#aab}#gtPanel button{padding:6px 12px;border-radius:8px;border:1px solid #8a96d8;background:rgba(60,70,130,.8);color:#fff;font:600 13px system-ui;cursor:pointer;min-height:34px}#gtPanel button[disabled]{opacity:.45;cursor:default}'
 +'#gtAltar{position:fixed;left:50%;bottom:170px;transform:translateX(-50%);z-index:8000;padding:10px 20px;border-radius:12px;border:2px solid #ffd86b;background:rgba(60,44,10,.92);color:#fff2c0;font:700 16px system-ui,sans-serif;display:none;cursor:pointer}'
 +'#gtGM{position:fixed;right:6px;top:300px;z-index:8000;display:flex;flex-direction:column;gap:4px;font:12px system-ui}#gtGM button,#gtGM select{padding:4px 8px;border-radius:8px;border:1px solid #7fe8ff;background:rgba(10,30,40,.9);color:#d8f8ff;min-height:28px}';
document.head.appendChild(css);
const el=(t,id,p)=>{const e=document.createElement(t);if(id)e.id=id;(p||document.body).appendChild(e);return e};
const stop=e=>{for(const ev of ['pointerdown','pointerup','mousedown','mouseup','touchstart'])e.addEventListener(ev,x=>x.stopPropagation())};
let hudEl=null,btn=null,panel=null,altBtn=null;
function mkUI(){if(btn||!document.body)return;hudEl=el('div','gtHud');btn=el('button','gtBtn');btn.type='button';btn.textContent='⛩ เกต';stop(btn);btn.onclick=()=>{panelToggle()};
  panel=el('div','gtPanel');stop(panel);altBtn=el('button','gtAltar');altBtn.type='button';altBtn.textContent='เริ่มเวฟต่อไป';stop(altBtn);altBtn.onclick=()=>{callWave()};
  window.addEventListener('keydown',e=>{if((e.key==='f'||e.key==='F')&&altBtn.style.display==='block'&&!e.repeat)callWave()});
  if(GM)mkGM()}
function fmtT(ms){const s=Math.max(0,Math.floor(ms/1000)),h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return h+':'+String(m).padStart(2,'0')+':'+String(x).padStart(2,'0')}
function panelToggle(force){if(!panel)return;const show=force!=null?force:panel.style.display!=='block';if(show){GT.gates=GT.gates.filter(g=>g.exp>now());topUp();save();renderPanel();panel.style.display='block'}else panel.style.display='none'}
function renderPanel(){if(!panel)return;const inRun=!!GT.run;let h='<div style="display:flex;justify-content:space-between;align-items:center"><h3>⛩ เกต (Gate) · '+GT.gates.length+'/'+C.MAX_GATES+'</h3><button type="button" data-x="close">✕</button></div>'
  +'<div class="note">ตัวแทนชั่วคราว: ระบบเกตในโลก (เกตสีในแมพ) ยังไม่อยู่ใน build นี้ · กด "เข้า" เพื่อเข้าห้องเกตโดยตรง</div>';
  for(const g of GT.gates){const b=BANDS[g.band],T=TYPES[g.type],msg=lockedMsg(g);
    h+='<div class="row" style="border-left-color:'+b.col+'"><div class="t"><b>ระดับ'+b.n+' · Lv '+g.Lg+'</b> · '+g.type+' '+T.n+(T.ph?' *':'')+'<div class="s">เหลือ '+fmtT(g.exp-now())+(msg?' · <span style="color:#ff8a8a">'+msg+'</span>':'')+'</div></div><button type="button" data-g="'+g.id+'"'+(msg||inRun?' disabled':'')+'>เข้า</button></div>'}
  h+='<div class="s" style="font-size:11px;color:#99a;margin-top:6px">* ตัวแทน: มอนสเตอร์/บอสของ Gate นี้ยังไม่มีภาพเฉพาะ ใช้มอนสเตอร์ที่มีอยู่แทน</div>';
  if(GM)h+='<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">'+BANDS.map((b,i)=>'<button type="button" data-n="'+i+'" style="border-color:'+b.col+'">+เกต'+b.n+'</button>').join('')+'<button type="button" data-x="clr">ล้างล็อก/เคลียร์</button></div>';
  panel.innerHTML=h}
document.addEventListener('click',e=>{try{const t=e.target&&e.target.closest?e.target.closest('#gtPanel button'):null;if(!t)return;e.stopPropagation();
  if(t.dataset.x==='close'){panelToggle(false);return}if(t.dataset.x==='clr'){GT.lock={};GT.clear={};sync();save();renderPanel();return}
  if(t.dataset.n!=null){GT.gates.push(Object.assign(newGateRaw(+t.dataset.n)));save();renderPanel();return}
  if(t.dataset.g){const g=GT.gates.find(x=>x.id===t.dataset.g);if(g){panelToggle(false);enter(g,0)}}}catch(er){ERR('panel',er)}},true);
function newGateRaw(bi){GT.gates.pop&&0;const b=BANDS[bi],tp=pk(b.types);GT.stats.spawned++;return {id:'g'+Math.floor(now()/1000).toString(36)+Math.floor(Math.random()*1e5).toString(36),type:tp,band:bi,Lg:ric(b.lv[0],b.lv[1]),t0:now(),exp:now()+C.LIFE_H*3600e3}}
function hud(){if(!hudEl)return;const R=GT.run;if(!R||G.zone!==ZID){hudEl.style.display='none';if(altBtn)altBtn.style.display='none';return}hudSoft()}
let lastHud='';function hudSoft(){if(!hudEl)return;const R=GT.run;if(!R||G.zone!==ZID){hudEl.style.display='none';altBtn.style.display='none';return}
  let a,b='';const w=R.waves;
  if(R.room>=3){a='บอส · '+R.T.bossN;const bo=R.boss;b=bo&&!bo.dead?'HP '+Math.max(0,Math.round(bo.hp/bo.maxHp*100))+'%':(R.bossDone?'เดินผ่านประตูด้านบนเพื่อออก':'')}
  else{a='ห้อง '+(R.room+1)+'/3 · เวฟ '+w.spawned+'/'+w.n;if(w.t!=null&&w.spawned<w.n){const s=Math.max(0,Math.ceil(w.t));a+=' · '+Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}b='เหลือ '+(alive()+w.queue.length)+' ตัว'+(R.open?' · ประตูเปิดแล้ว':'')}
  const h='<div>'+a+'</div><small>Gate '+R.type+' '+R.T.n+' · Lv '+R.Lg+(b?' · '+b:'')+'</small>';if(h!==lastHud){hudEl.innerHTML=h;lastHud=h}hudEl.style.display='block';
  const near=R.room<3&&(()=>{const ap=altarPos();return Math.hypot(P.x-ap[0],P.y-ap[1])})()<150&&altarState()==='ready'&&!P.dead;altBtn.style.display=near?'block':'none'}
setInterval(()=>{try{mkUI();if(P&&loadedKey!==charKey()){load();topUp();save()}if(P&&!GT._init){GT._init=1;load();topUp();save()}if(P&&P.gateLock!==GT.lock)sync();hudSoft();if(panel&&panel.style.display==='block')renderPanel()}catch(e){ERR('iv',e)}},400);
/* debug overlay + door */
{const _t=drawTexts;drawTexts=function(){const r=_t.apply(this,arguments);try{if(G.zone===ZID&&GT.run){const R=GT.run,kind=R.kinds[R.room];
  const dx=RW/2,dy=140*C.S;ctx.save();if(R.open){add();ctx.globalAlpha=.5+.2*Math.sin(time*3);glow(dx,dy,70,'#7fe8ff',.5);norm()}
  else{ctx.globalAlpha=.55;ctx.fillStyle='#10182c';ctx.fillRect(dx-52*C.S,dy-50*C.S,104*C.S,110*C.S);ctx.strokeStyle='#ff6b8b';ctx.lineWidth=2;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(dx-50*C.S+i*33*C.S,dy-50*C.S);ctx.lineTo(dx-50*C.S+i*33*C.S,dy+60*C.S);ctx.stroke()}}
  ctx.restore();
  if(DBG){ctx.save();ctx.fillStyle='rgba(80,255,120,.22)';const st=20;for(let y=0;y<RW;y+=st)for(let x=0;x<RW;x+=st)if(wk(kind,x+st/2,y+st/2,R.open))ctx.fillRect(x,y,st,st);
    ctx.fillStyle='rgba(255,60,60,.5)';for(const o of SOLIDS){ctx.beginPath();ctx.arc(o.x,o.y,o.r,0,TAU);ctx.stroke()}ctx.restore()}}}catch(e){ERR('drawTexts',e)}return r}}
function mkGM(){const b=el('div','gtGM');stop(b);const sel=document.createElement('select');for(const k in TYPES){const o=document.createElement('option');o.value=k;o.textContent=k+' '+TYPES[k].n;sel.appendChild(o)}b.appendChild(sel);
  const lv=document.createElement('select');for(const L of [20,25,30,40,50,60,80,90,100]){const o=document.createElement('option');o.value=L;o.textContent='Lv '+L;lv.appendChild(o)}b.appendChild(lv);
  const mk=(t,fn)=>{const x=document.createElement('button');x.type='button';x.textContent=t;x.onclick=()=>{try{fn()}catch(e){ERR('gm',e)}};b.appendChild(x)};
  const mkG=()=>{const tp=sel.value,Lg=+lv.value;const bi=bandOf(Lg);return {id:'gm'+tp+Lg+'_'+Math.floor(now()/1000),type:tp,band:TYPES[tp].band,Lg,t0:now(),exp:now()+C.LIFE_H*3600e3}};
  GT.gmJump=(room,type,Lg)=>{const tp=type||sel.value,L=Lg||+lv.value;const g={id:'gm'+tp+L+'_'+Math.floor(now()/1000),type:tp,band:TYPES[tp].band,Lg:L,t0:now(),exp:now()+C.LIFE_H*3600e3};if(GT.run&&G.zone===ZID){GT.run.gate=g;GT.run.type=tp;GT.run.T=Object.assign({key:tp},TYPES[tp]);GT.run.Lg=L;GT.run.bi=TYPES[tp].band;for(const e of enemies)if(e.gate)e.dead=true;enemies=enemies.filter(e=>!e.dead);enterRoom(room,true)}else enter(g,room,true)};
  for(const [t,r] of [['▶ ห้อง 1',0],['▶ ห้อง 2',1],['▶ ห้อง 3',2],['▶ บอส',3]])mk(t,()=>GT.gmJump(r));
  mk('✖ ฆ่ามอนสเตอร์ทั้งหมด',()=>{for(const e of enemies.slice())if(e.gate&&!e.dead){e.hp=0;killEnemy(e)}if(GT.run&&GT.run.waves)GT.run.waves.queue.length=0});
  mk('⏭ เวฟต่อไป',()=>{const R=GT.run;if(R&&R.waves)releaseWave(R,'gm')});
  mk('🔓 ล้างล็อก/เคลียร์',()=>{GT.lock={};GT.clear={};sync();save()});
  mk('⛩ เปิดเกต',()=>{panelToggle(true)});
  mk('🚪 ออก',()=>leave('gm'))}
{const _z=updZoneTag;updZoneTag=function(){const r=_z.apply(this,arguments);try{if(G.zone===ZID&&GT.run){const n=document.getElementById('zName'),s=document.getElementById('zSub');if(n)n.textContent='Gate · '+GT.run.T.n;if(s)s.textContent='Lv '+GT.run.Lg+' · '+(GT.run.room>=3?'ห้องบอส':'ห้อง '+(GT.run.room+1)+' / 3')}}catch(_){}return r}}
console.info('[GATES] gate maps loaded · S='+C.S+' room='+RW+' mode='+C.MODE+' rule='+RULE);
})();
