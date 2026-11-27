
/* ---- r176 helper (TEST ONLY, owner order via coordinator 21 Nov 2026): house monster helpers. Base = TEST r178d. Flags: ?helper=off (nothing: no book effect, no cage item, no helpers; a placed cage is parked in state.cageStash), ?helperfatigue=off (no fatigue, no stamina trait).
   Sources of truth: incoming\cloud_20261121\ MONSTER_HELPER_notes_r1.md, _build_plan_r1.md, BALANCE_monster_helper_v1.md (main part approved; the fatigue / stamina-trait part at its end is NOT approved and is built behind ?helperfatigue=off), soul_chain_demo_r1.html (chain), house_helper_demo_r1.html (at-home behaviour), plus the owner decisions of 21 Nov in the coordinator brief.
   CAPTURE: bag item "หนังสือผนึกวิญญาณ" (Emma 40 G, 0.5 % / 3 % elite drop): use = aim line straight ahead of the hero; F / the ปาลูกไฟ button throws a fireball (range 260); a hit on an ordinary / elite monster uses up the book, grows the two curved chains (duration 1.0 s + 1.3 s x HP fraction), then success (chain turns blue, monster shrinks into a cage that flies to the hero and becomes a cage item in the housing storage) or fail (the two chains MEET, strain 0.6 s, then break: that ONE monster is marked uncatchable). p = 5 % + 90 % x (1 - HP)^2, elite x0.5, 10+ levels above the hero x0.5, boss immune (fireball absorbed, book kept).
   AT HOME: the cage (housing item "กรงผู้ช่วย", yard only) has a menu (F / tap): helper out = เรียกกลับ + change job; in cage = ปล่อยออกมาทำงาน + เก็บเข้ากระเป๋า (back to the housing storage) + change job; always ปล่อยคืนธรรมชาติ (confirm; monster and cage gone, nothing refunded). One assigned job per helper (farm / fishing / cooking / weapon crafting greyed out), default = its strong job (star), a job without station is greyed out, warning when two helpers have the same job. Status over the head is a picture bubble, free time = walks back and forth. Monster pictures = the monster's own sprites (game drawEnemy); cage, bubble icons, chain are code-drawn and swappable (HELPER.frames).
   WORK goes into the owner's bag (full bag: the helper waits, bag picture): farm = water dry plots / harvest ripe crops (F.water / F.harvest), fishing = a fish every N min at the r175 pond, cooking = queued dishes with a cook TIME at the lit campfire. Helpers keep working on other maps (the same tick runs away from the yard; no walking there). Time while the game is closed is NOT counted (HELPER.cfg.closedTime = false: one switch). Best-helper-only bonus per job (no stacking).
   Numbers: HELPER.cfg (one object). Debug: window.__HELPER ---- */
(function(){'use strict';
const Q=String(location.search),HP=window.__HELPER={ver:'helper-r176',hm:!/[?&]helpermgr=off\b/.test(Q),on:!/[?&]helper=off\b/.test(Q),fat:!/[?&]helperfatigue=off\b/.test(Q),gm:/[?&]gm=on\b/.test(Q),err:null,msg:'',ents:{},stats:{throws:0,hits:0,ok:0,fail:0,fizz:0,farmW:0,farmH:0,fish:0,dish:0,bagFull:0},cap:null,aim:false,last:null};
const ERR=(w,e)=>{HP.err=w+': '+((e&&e.message)||e);try{console.error('[HELPER]',w,e)}catch(_){}};
/* ---------------- config: ONE object (numbers: Balance file; (A) = approved, (P) = proposal not approved, (C) = Code default, no number given) ---------------- */
HP.cfg={timeScale:1,
 range:260,ballSpeed:780,hitR:26,                                   /* (C) range 260 = plan placeholder */
 pBase:.05,pRange:.90,eliteMul:.5,lvGap:10,lvMul:.5,                 /* (A) p = 5 % + 90 % x (1-HP)^2, elite x0.5, 10+ levels above x0.5 */
 bookPrice:40,bookDrop:.005,bookDropElite:.03,                       /* (A) */
 chainBase:1.0,chainHp:1.3,fire:.35,lock:1.5,pull:1.0,strain:.6,breakT:1.2, /* demo values */
 leanW:3,lvOdds:[.6,.3,.1],lvOddsElite:[.3,.45,.25],                 /* (A) */
 limitByPlatform:lvl=>(lvl|0)>=5?4:(lvl|0)>=3?3:2,                   /* (A) 2 / 3 / 4 working helpers at platform Lv1-2 / 3-4 / 5 */
 farm:{bonus:[.10,.20,.30],actSec:1.8},                              /* (A) crop / tree grow time -10 / -20 / -30 % ; actSec = away-from-yard time per action (C) */
 fish:{base:600,strong:[480,360,300],uncommonFrom:2,rareLv:3,rareMul:.5,holdMax:30}, /* (A) seconds per fish 10 / 8 / 6 / 5 min */
 cook:{times:{campBread:10,jellyDessert:15,boarSkewer:20,forestSalad:20,rootPancake:25,mushSoup:30,herbFish:30,hunterStew:45},bonus:[.15,.30,.45],queue:3,queueLv3:5}, /* (A) */
 fatigue:{workMin:{farm:45,other:36},restYard:12,restCage:6,strongSlow:[.10,.20,.30],  /* (P) Balance r1.1 */
  traits:[{k:'easy',lv:1,mul:1.25,p:.12},{k:'easy',lv:2,mul:1.5,p:.08},{k:'easy',lv:3,mul:2.0,p:.05},{k:'normal',lv:0,mul:1,p:.50},{k:'hardy',lv:1,mul:.8,p:.12},{k:'hardy',lv:2,mul:.6,p:.08},{k:'hardy',lv:3,mul:.4,p:.05}]}, /* (P) trait r1.4b */
 closedTime:false,                                                   /* NOT decided: game closed time is not counted */
 rimCol:'rgba(255,244,214,.95)',rimOff:[[1.5,0],[-1.5,0],[0,1.5],[0,-1.5]],
 walk:{speed:72,free:54,tired:30},                                    /* (C) px per second */
 /* species lean (C): regexes on the monster type id; no match = no lean */
 /* species -> lean job: Balance PROPOSAL (not approved), 17 Nov coordinator list. noLean (undead, spirits, void, training dummies) is checked first; then weapon, fishing, cooking, farm in that order. Weights: lean job 3, others 1. Not in MOBS: Frostquill (no id), any wolf (none). Ambiguous, left unmapped: meadowhop (Meadow Hopper), thornbeetle, dewbeetle, honeybuzz/buzzbee, strawman, yeti, dune gecko, rustbat, Forest Sprite. */
 noLean:/wraith|ghoul|skeleton|mummy|wisp|specter|revenant|bonecrawler|voidspawn|voidcolossus|darklord|devdummy|abyssal$|nullhound|riftelem|riftreaver|twistalker|stardrake|eclipse|snowman|^sprite$|m10ref|c182|g5_wraith|gb_G5/i,
 lean:[['weapon',/golem|sentinel|ironarcher|warcaptain|g4_iron|g4_forge_titan|gb_G4|ge_G4|moltencon|overseer|crystal|scarab|shadow_knight|ge_G5|ge_G1|gb_G1|sandcolossus|ruinwarden/i],['fishing',/^slime$|^venomslime$|eel|crab|croc|toad|piranha|sharkfang|angler|jelly|naga|serpent|tide|ge_G2|gb_G2|leviathan|kraken|drown|siren|fish|frog/i],['cooking',/boar|jackal|salamander|magma|cinder|ember|lava|bear|fox|ram$|stag|panther|junglecat|vulture|crow|galefeather|squirrel|imp$|^demon$|hound|wolf/i],['farm',/seedling|leafbun|puffcap|moss|spor|^g3_|ge_G3|gb_G3|treant|raid_jungle|vine|mushroom|cact|sprout|bloom|flower/i]],
 jobNames:{farm:'ทำฟาร์ม',fishing:'ตกปลา',cooking:'ทำอาหาร',weapon:'ทำอาวุธ'},jobs:['farm','fishing','cooking','weapon']};
const JOBS=HP.cfg.jobs,JN=k=>HP.cfg.jobNames[k]||k;
const HS=window.HOUSE;
/* with ?helper=off only the bag item stays registered (a bag that holds books stays valid); nothing else runs */
if(!HP.on){try{if(typeof ITEMS!=='undefined'){const reg=()=>{ITEMS.soulBook=Object.assign(ITEMS.soulBook||{},{n:'หนังสือผนึกวิญญาณ',d:'(ฟีเจอร์ผู้ช่วยปิดอยู่)',k:'misc',col:'#6fd0ff',price:0,sell:10,noSell:0,icon:g=>{g.fillStyle='#2a4a8a';g.fillRect(14,14,36,36)}})};reg();setTimeout(reg,2000)}}catch(_){}return}
/* ---------------- helpers ---------------- */
const ell=(g,x,y,rx,ry,rot)=>{g.beginPath();g.ellipse(x,y,rx,ry,rot||0,0,6.2832)};
const now=()=>performance.now()/1000;
const rnd=Math.random;
let toastEl=null,toastT=0;
function say(m,bad){HP.msg=m;try{if(!toastEl){toastEl=document.createElement('div');toastEl.id='hpToast';toastEl.style.cssText='position:fixed;left:50%;top:16%;transform:translateX(-50%);z-index:100001;max-width:92vw;padding:9px 16px;border-radius:12px;background:rgba(20,14,8,.94);border:1px solid #ffd98a;color:#ffe9b0;font:700 14px/1.4 "Noto Sans Thai",system-ui,sans-serif;text-align:center;box-shadow:0 6px 24px rgba(0,0,0,.6);pointer-events:none;display:none';document.body.appendChild(toastEl)}toastEl.textContent=m;toastEl.style.borderColor=bad?'#ff8a8a':'#b8ffd0';toastEl.style.display='block';clearTimeout(toastT);toastT=setTimeout(()=>{toastEl.style.display='none'},3200)}catch(_){}try{log(m,'g')}catch(_){}}
HP.say=say;
const mobName=t=>{try{return MOBS[t].n}catch(_){return t}};
/* ---------------- roll: strong job, level, stamina trait ---------------- */
HP.leanOf=type=>{if(HP.cfg.noLean.test(String(type)))return null;for(const [j,rx] of HP.cfg.lean)if(rx.test(String(type)))return j;return null};
HP.rollJob=function(type,elite,rng){rng=rng||rnd;const JOBS=HP.cfg.jobs.filter(j=>j!=='tank');/* r213: the feed-fish job is never a strong job */const lean=HP.leanOf(type),w=JOBS.map(j=>j===lean?HP.cfg.leanW:1),sum=w.reduce((a,b)=>a+b,0);let r=rng()*sum,job=JOBS[0];for(let i=0;i<JOBS.length;i++){r-=w[i];if(r<0){job=JOBS[i];break}}
 const o=elite?HP.cfg.lvOddsElite:HP.cfg.lvOdds;let q=rng(),lv=1;for(let i=0;i<3;i++){q-=o[i];if(q<0){lv=i+1;break}if(i===2)lv=3}return {job,lv}};
HP.rollTrait=function(rng){rng=rng||rnd;let q=rng();for(const t of HP.cfg.fatigue.traits){q-=t.p;if(q<0)return {k:t.k,lv:t.lv}}return {k:'normal',lv:0}};
const traitMul=t=>{if(!t)return 1;const r=HP.cfg.fatigue.traits.find(x=>x.k===t.k&&x.lv===t.lv);return r?r.mul:1};
const TRAITN={easy:'เหนื่อยง่าย',normal:'ปกติ',hardy:'เหนื่อยยาก'};
HP.traitText=t=>!t?'':(t.k==='normal'?'ปกติ':TRAITN[t.k]+' Lv '+t.lv);
HP.traitCol=t=>!t?'#cfc6b0':t.k==='easy'?'#ff7a6a':t.k==='hardy'?'#ffd24a':'#cfc6b0';
HP.catchP=function(e){const f=Math.max(0,Math.min(1,e.hp/Math.max(1,e.maxHp)));let p=HP.cfg.pBase+HP.cfg.pRange*Math.pow(1-f,2);if(e.eliteX||(e.m&&e.m.elite))p*=HP.cfg.eliteMul;try{if((e.L|0)>=(P.lvl|0)+HP.cfg.lvGap)p*=HP.cfg.lvMul}catch(_){}return Math.max(0,Math.min(1,p))};
const isBoss=e=>{try{return !!(e.m&&e.m.boss)||(typeof sxIsBoss==='function'&&sxIsBoss(e))||!!e.raidB}catch(_){return !!(e.m&&e.m.boss)}};
/* ---------------- items: book (always registered so a bag with books stays valid) ---------------- */
function bookIcon(g){try{g.save();g.translate(32,32);g.fillStyle='rgba(120,200,255,.25)';ell(g,0,2,26,22);g.fill();g.fillStyle='#2a4a8a';g.beginPath();g.moveTo(-18,-16);g.lineTo(0,-12);g.lineTo(18,-16);g.lineTo(18,16);g.lineTo(0,20);g.lineTo(-18,16);g.closePath();g.fill();g.strokeStyle='#d6b05c';g.lineWidth=2;g.stroke();g.fillStyle='#e8f6ff';g.beginPath();g.moveTo(-14,-12);g.lineTo(-1,-8);g.lineTo(-1,15);g.lineTo(-14,12);g.closePath();g.fill();g.beginPath();g.moveTo(14,-12);g.lineTo(1,-8);g.lineTo(1,15);g.lineTo(14,12);g.closePath();g.fill();g.strokeStyle='#6fd0ff';g.lineWidth=1.6;g.beginPath();g.arc(-7,2,4.5,0,6.2832);g.moveTo(5,-2);g.lineTo(11,-2);g.moveTo(5,3);g.lineTo(11,3);g.stroke();g.restore()}catch(_){}}
function cageIcon(g){try{g.save();g.translate(32,32);FR.cageDraw(g,0,18,1,null);g.restore()}catch(_){}}
function regItems(){try{if(typeof ITEMS==='undefined')return false;ITEMS.soulBook=Object.assign(ITEMS.soulBook||{},{n:'หนังสือผนึกวิญญาณ',d:'ใช้แล้วเห็นเส้นเล็ง กดปาลูกไฟใส่มอนสเตอร์ · ถ้าโดนจะใช้หนังสือหมดไป 1 เล่ม · เลือดน้อยจับง่าย · บอสจับไม่ได้',k:'use',col:'#6fd0ff',icon:bookIcon,price:HP.cfg.bookPrice,sell:10,stall:1});return true}catch(e){ERR('items',e);return false}}
/* ---------------- frames: swappable pictures (Art rows 296-298 later = replace these by id) ---------------- */
const FR=HP.frames={
 cageDraw(g,x,y,k,part){/* part: null = whole, 'back' / 'front' = the two layers (cage_back + cage_front) */const s=k||1;g.save();g.translate(x,y);g.scale(s,s);
  if(part!=='front'){g.fillStyle='rgba(0,0,0,.28)';ell(g,0,2,27,8);g.fill();g.fillStyle='#4a3a28';ell(g,0,-2,25,8);g.fill();g.strokeStyle='#8fc8e8';g.lineWidth=2;for(const dx of [-14,-5,5,14]){g.beginPath();g.moveTo(dx,-4);g.lineTo(dx*.8,-46);g.stroke()}g.strokeStyle='#bfeaff';g.beginPath();g.ellipse(0,-46,21,6.5,0,0,6.2832);g.stroke()}
  if(part!=='back'){g.strokeStyle='#d6f2ff';g.lineWidth=2.4;for(const dx of [-22,-10,0,10,22]){g.beginPath();g.moveTo(dx*1.0,4*Math.cos(dx*.06));g.lineTo(dx*.78,-44);g.stroke()}g.fillStyle='#5a4630';ell(g,0,3,26,8.5);g.fill();g.strokeStyle='#2a1c10';g.lineWidth=1.5;g.stroke();g.strokeStyle='#e8f8ff';g.lineWidth=2.6;g.beginPath();g.ellipse(0,-44,22,7,0,0,6.2832);g.stroke();g.fillStyle='#d6b05c';ell(g,0,-52,4,4);g.fill();g.strokeStyle='#d6b05c';g.lineWidth=2;g.beginPath();g.arc(0,-52,7,3.14,6.28);g.stroke()}
  g.restore()},
 propDraw(g,f,d){FR.cageDraw(g,28,56,1,null)},
 bubble(g,x,y,k,t){g.save();g.translate(x,y);g.fillStyle='#fdfbf2';g.strokeStyle='#3d2c20';g.lineWidth=2;g.beginPath();g.arc(0,0,15,0,6.2832);g.fill();g.stroke();g.beginPath();g.moveTo(-5,13);g.lineTo(0,21);g.lineTo(5,13);g.closePath();g.fill();g.stroke();g.fillStyle='#fdfbf2';g.fillRect(-4,12,8,3);
  const I=FR.icons[k]||FR.icons.rest;I(g,t);g.restore()},
 icons:{
  water(g){g.fillStyle='#3aa0e0';g.beginPath();g.moveTo(0,-10);g.bezierCurveTo(9,2,7,9,0,9);g.bezierCurveTo(-7,9,-9,2,0,-10);g.fill()},
  harv(g){g.fillStyle='#f2a53a';g.beginPath();g.moveTo(-5,-3);g.lineTo(5,-3);g.lineTo(0,11);g.closePath();g.fill();g.strokeStyle='#4faa5a';g.lineWidth=2.6;g.beginPath();g.moveTo(0,-3);g.lineTo(0,-10);g.moveTo(0,-4);g.lineTo(-4,-9);g.moveTo(0,-4);g.lineTo(4,-9);g.stroke()},
  fish(g){g.fillStyle='#4f9fd0';g.beginPath();g.ellipse(2,0,7,4.5,0,0,6.2832);g.fill();g.beginPath();g.moveTo(-4,0);g.lineTo(-10,-4.5);g.lineTo(-10,4.5);g.closePath();g.fill();g.fillStyle='#14202a';g.beginPath();g.arc(5,-1,1.2,0,6.2832);g.fill()},
  cook(g,t){g.fillStyle='#4a4a52';g.beginPath();g.moveTo(-9,-1);g.lineTo(9,-1);g.quadraticCurveTo(8,9,0,9);g.quadraticCurveTo(-8,9,-9,-1);g.fill();g.fillStyle='#2a2a30';g.fillRect(-10,-3,20,3);g.strokeStyle='#e8d8c0';g.lineWidth=1.6;const o=((t||0)*1.4)%1;g.globalAlpha=1-o;g.beginPath();g.moveTo(-3,-5);g.quadraticCurveTo(-6,-9-o*4,-3,-12-o*4);g.moveTo(3,-5);g.quadraticCurveTo(0,-9-o*4,3,-12-o*4);g.stroke();g.globalAlpha=1},
  craft(g){g.fillStyle='#8a6238';g.fillRect(-1.5,-3,3,13);g.fillStyle='#9aa4b4';g.fillRect(-8,-9,16,7)},
  rest(g,t){g.fillStyle='#7b6fb0';g.font='700 12px system-ui,sans-serif';g.textAlign='center';const o=((t||0)*1.5)%1;g.globalAlpha=.4+.6*(1-o);g.fillText('z',-5,6-o*3);g.font='700 16px system-ui,sans-serif';g.fillText('z',4,-1-o*3);g.globalAlpha=1},
  tired(g,t){g.fillStyle='#e0745a';g.font='700 12px system-ui,sans-serif';g.textAlign='center';const o=((t||0)*1.2)%1;g.globalAlpha=.5+.5*(1-o);g.fillText('z',-5,6-o*3);g.font='700 16px system-ui,sans-serif';g.fillText('z',4,-1-o*3);g.globalAlpha=1;g.fillStyle='#6fc0f0';g.beginPath();g.moveTo(10,-12);g.bezierCurveTo(14,-7,13,-4,10,-4);g.bezierCurveTo(7,-4,6,-7,10,-12);g.fill()},
  bag(g){g.fillStyle='#b8823c';g.beginPath();g.moveTo(-7,-2);g.lineTo(7,-2);g.lineTo(9,9);g.lineTo(-9,9);g.closePath();g.fill();g.strokeStyle='#5a3a1a';g.lineWidth=1.6;g.stroke();g.beginPath();g.arc(0,-4,5,3.14,6.28);g.stroke();g.strokeStyle='#d83a3a';g.lineWidth=2.4;g.beginPath();g.moveTo(-5,-9);g.lineTo(5,3);g.moveTo(5,-9);g.lineTo(-5,3);g.stroke()},
  done(g){g.strokeStyle='#3aa85a';g.lineWidth=3.2;g.beginPath();g.moveTo(-7,0);g.lineTo(-2,6);g.lineTo(8,-7);g.stroke()},
  walk(g){FR.icons.fish(g)}}};
/* the uncatchable mark (grey) over a monster whose chain broke */
function drawNoCap(c,e){const x=e.x,y=e.y-(e.sz||20)*2.1-16;c.save();c.translate(x,y);c.fillStyle='rgba(60,64,72,.92)';c.strokeStyle='#aab';c.lineWidth=1.6;c.beginPath();c.arc(0,0,9,0,6.2832);c.fill();c.stroke();c.strokeStyle='#d8dde6';c.lineWidth=2;c.beginPath();c.moveTo(-3.5,-3.5);c.lineTo(3.5,3.5);c.moveTo(3.5,-3.5);c.lineTo(-3.5,3.5);c.stroke();c.restore()}
/* ---------------- chain (port of soul_chain_demo_r1.html: same bezier arcs, links, wobble, strain flicker, shatter) ---------------- */
const bez=(p,t)=>{const u=1-t;return {x:u*u*u*p[0].x+3*u*u*t*p[1].x+3*u*t*t*p[2].x+t*t*t*p[3].x,y:u*u*u*p[0].y+3*u*u*t*p[1].y+3*u*t*t*p[2].y+t*t*t*p[3].y}};
const ease=t=>t<0?0:t>1?1:1-Math.pow(1-t,3);
const DH={x:150,y:330},DM={x:570,y:340},DMID={x:360,y:250};/* demo coordinates (720 x 520) */
function demoPath(side,tight){const a=side<0?{x:DH.x+24,y:DH.y-8}:{x:DM.x-34,y:DM.y-6},s=side<0?1:-1,k=tight,m={x:DMID.x,y:DMID.y+62*k};
 const c1={x:a.x+s*40,y:a.y-s*230-60},c2={x:m.x-s*170,y:m.y+s*190},l1={x:a.x+s*70,y:a.y-s*46},l2={x:m.x-s*95,y:m.y+s*34};
 return [a,{x:c1.x+(l1.x-c1.x)*k,y:c1.y+(l1.y-c1.y)*k},{x:c2.x+(l2.x-c2.x)*k,y:c2.y+(l2.y-c2.y)*k},m]}
/* demo -> world: the demo's hero point goes to the hero's hand, the demo's monster point to the monster; x stretches with the distance, y with sv */
function mapper(h,m,tl){tl=tl||0;const dx=m.x-h.x,dy=m.y-h.y,dist=Math.max(60,Math.hypot(dx,dy)),ang=Math.atan2(dy,dx),sx=dist/(DM.x-DH.x),sv0=Math.max(.3,Math.min(.8,dist/420)),sv1=Math.max(.62,Math.min(1,dist/260)),sv=sv0+(sv1-sv0)*tl;const c=Math.cos(ang),s=Math.sin(ang);
 return p=>{const lx=(p.x-DH.x)*sx,ly=(p.y-DH.y)*sv*.9;return {x:h.x+lx*c-ly*s,y:h.y+lx*s+ly*c}}}
function links(c,pw,map,grow,wob,t,bright,spd,steady){spd=spd||9;const p=pw.map(map);const pts=[],n=70,len=[0];let L=0,prev=bez(p,0);pts.push(prev);
 for(let i=1;i<=n;i++){const q=bez(p,i/n);L+=Math.hypot(q.x-prev.x,q.y-prev.y);len.push(L);pts.push(q);prev=q}
 const out=[],step=Math.max(8,L/34);let j=0;
 for(let d=0;d<=L*grow;d+=step){while(j<n-1&&len[j+1]<d)j++;const f=(d-len[j])/((len[j+1]-len[j])||1),a=pts[j],b=pts[j+1];let x=a.x+(b.x-a.x)*f,y=a.y+(b.y-a.y)*f;const ang=Math.atan2(b.y-a.y,b.x-a.x);
  const w=steady?Math.sin(6.2832*d/Math.max(46,L/1.4)-t*spd*1.3)*wob*.5*Math.min(1,Math.sin(Math.PI*d/L)*1.8):(Math.sin(d*.075-t*spd)+.5*Math.sin(d*.035+t*spd*.6))*wob*.5*Math.sin(Math.PI*d/L);x+=-Math.sin(ang)*w;y+=Math.cos(ang)*w;out.push({x,y,a:ang})}
if(steady&&out.length>3){/* r177c: the lock / pull chain keeps a constant peak-to-peak wave height (offset from the end-to-end line rescaled every frame): never flat, never spiky */const a0=out[0],b0=out[out.length-1],dx0=b0.x-a0.x,dy0=b0.y-a0.y,ch=Math.hypot(dx0,dy0)||1,ux=dx0/ch,uy=dy0/ch,nx=-uy,ny=ux;let mn=1e9,mx=-1e9;const offs=out.map(o=>{const rx=o.x-a0.x,ry=o.y-a0.y,of=rx*nx+ry*ny;mn=Math.min(mn,of);mx=Math.max(mx,of);return[rx*ux+ry*uy,of]});const p2=Math.max(1,mx-mn),tg=Math.min(steady.max,Math.max(steady.min,ch*steady.k))*(steady.fade?Math.min(1,ch/steady.fade):1),scl=Math.max(.3,Math.min(3,tg/p2));out.forEach((o,i)=>{o.x=a0.x+ux*offs[i][0]+nx*offs[i][1]*scl;o.y=a0.y+uy*offs[i][0]+ny*offs[i][1]*scl});for(let i=0;i<out.length;i++){const p=out[Math.max(0,i-1)],q=out[Math.min(out.length-1,i+1)];out[i].a=Math.atan2(q.y-p.y,q.x-p.x)}}
 /* normal blending (additive turns to white on a bright ground): dark-blue outline, glow, bright core */
 c.save();c.shadowColor='#3aa8ff';c.shadowBlur=12+bright*20;
 for(const pass of [0,1]){c.strokeStyle=pass===0?'rgba(10,50,130,.85)':'rgba('+Math.round(70+bright*150)+','+Math.round(185+bright*60)+',255,1)';c.lineWidth=pass===0?4+bright*1.4:2.2+bright*1.2;if(pass===0)c.shadowBlur=12+bright*20;else c.shadowBlur=4;
  out.forEach((o,i)=>{c.save();c.translate(o.x,o.y);c.rotate(o.a);c.beginPath();if(i%2)c.ellipse(0,0,7,1.8,0,0,6.2832);else c.ellipse(0,0,7,4.2,0,0,6.2832);c.stroke();c.restore()})}
 if(HP.dbg){(HP.dbgOut||(HP.dbgOut=[])).push({st:CH&&CH.st,t:performance.now(),pts:out.map(o=>[o.x,o.y])})}const tip=out[out.length-1];if(tip&&grow<1){c.fillStyle='#e8fbff';c.beginPath();c.arc(tip.x,tip.y,4.5,0,6.2832);c.fill()}c.restore();return out}
/* ---------------- capture state machine ---------------- */
const LOCKN={k:.45,min:36,max:58},PULLN={k:.5,min:34,max:60,fade:40};
let CH=null;HP.chSt=()=>CH?CH.st:null;/* {st,t0,e,ok,hp,dur,wob,frag,hx,hy,ball} */
let aimBtns=null;
const tsc=()=>Math.max(.05,HP.cfg.timeScale||1);
const heroHand=()=>({x:P.x+Math.cos(P.face||0)*18,y:P.y-22});
const monPt=e=>({x:e.x,y:e.y-(e.sz||20)*.9});
function canAim(){try{return G.state==='play'&&!!P&&!P.dead&&!G.win&&!G.interact&&(!HS||!HS.on||G.zone!==HS.ZID)&&!CH}catch(_){return false}}
HP.startAim=function(){if(!HP.on)return false;if(HP.hm&&HP.hmBagFull&&HP.hmBagFull()){say('กระเป๋าเต็ม เก็บมอนสเตอร์ที่จับได้ไม่ได้ · เคลียร์ช่องว่างก่อน',true);return false}const sf207=!/[?&]soulfix=off\b/.test(location.search),yd207=!!(HS&&HS.on&&G.zone===HS.ZID);if(sf207){try{if(G.win&&!yd207&&!CH)closeWin()}catch(_){}}if(!canAim()){say(!sf207?'ใช้หนังสือผนึกวิญญาณได้เฉพาะนอกลานบ้าน ตอนที่ไม่ได้เปิดหน้าต่างอื่น':yd207?'ใช้หนังสือผนึกวิญญาณในลานบ้านไม่ได้ · ใช้ได้ในแมพข้างนอก':'ตอนนี้ใช้หนังสือผนึกวิญญาณไม่ได้ · ปิดหน้าต่างอื่นก่อน',true);return false}if(typeof countItem==='function'&&countItem('soulBook')<1){say('ไม่มีหนังสือผนึกวิญญาณ ซื้อได้ที่ Emma 40 G',true);return false}
 try{if(G.win)closeWin()}catch(_){}HP.aim=true;ensureAimUI();aimBtns.style.display='flex';return true};
HP.cancelAim=function(){HP.aim=false;if(aimBtns)aimBtns.style.display='none'};
function ensureAimUI(){if(aimBtns)return;aimBtns=document.createElement('div');aimBtns.id='hpAim';aimBtns.innerHTML='<button type="button" class="go">ปาลูกไฟ <small>F</small></button><button type="button" class="no">ยกเลิก</button>';document.body.appendChild(aimBtns);
 const css=document.createElement('style');css.textContent='#hpAim{position:fixed;left:50%;bottom:calc(172px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:60;display:none;gap:10px;padding:7px 10px;border-radius:14px;background:rgba(14,18,28,.94);border:1px solid #6fd0ff;box-shadow:0 4px 16px rgba(0,0,0,.6)}#hpAim button{min-height:44px;padding:0 20px;border-radius:11px;border:1px solid #9fe0ff;background:linear-gradient(#3a8ad0,#1a4a8a);color:#fff;font:800 15px "Noto Sans Thai",system-ui,sans-serif;cursor:pointer;touch-action:manipulation}#hpAim button.no{background:linear-gradient(#5a4a4a,#3a2a2a);border-color:#d0a0a0}#hpAim small{opacity:.7;font-weight:600}@media (max-height:520px){#hpAim{bottom:calc(96px + env(safe-area-inset-bottom,0px))}}';document.head.appendChild(css);
 for(const ev of ['pointerdown','mousedown','touchstart','pointerup','mouseup','touchend'])aimBtns.addEventListener(ev,e=>e.stopPropagation());
 aimBtns.querySelector('.go').addEventListener('click',e=>{e.stopPropagation();HP.throwBall()});aimBtns.querySelector('.no').addEventListener('click',e=>{e.stopPropagation();HP.cancelAim()})}
HP.throwBall=function(){if(!HP.aim||CH)return false;if(!canAim()){HP.cancelAim();return false}const a=P.face||0,h=heroHand();HP.stats.throws++;CH={st:'fire',t0:now(),ball:{x:h.x,y:h.y,dx:Math.cos(a),dy:Math.sin(a),d:0},e:null,ok:false};HP.aim=false;if(aimBtns)aimBtns.style.display='none';try{for(const k in keys)keys[k]=false}catch(_){}return true};
function targetsOk(e){return e&&!e.dead&&e.hp>0&&!e._hlpNo}
function startChain(e){const f=Math.max(0,Math.min(1,e.hp/Math.max(1,e.maxHp))),p=HP.catchP(e);HP.stats.hits++;try{takeItem('soulBook',1);if(G.win==='wInv')renderInv()}catch(_){}
 CH={st:'chain',t0:now(),e,ok:rnd()<p,p,hp:f,dur:(HP.cfg.chainBase+HP.cfg.chainHp*f)/tsc(),wob:2+f*16,frag:[],ex:e.x,ey:e.y,elite:!!(e.eliteX||(e.m&&e.m.elite))};e._hlpHold=true;HP.last={species:e.type,hp:+f.toFixed(3),p:+p.toFixed(3),ok:CH.ok}}
function endCapture(){if(CH&&CH.e)CH.e._hlpHold=false;CH=null}
function finishSuccess(){const e=CH.e;try{const i=enemies.indexOf(e);if(i>=0)enemies.splice(i,1)}catch(_){}e.dead=true;HP.stats.ok++;const rec=newRec(e.type,CH.elite,Math.max(1,e.L|0));say('จับได้! '+mobName(e.type)+(HP.hm?' เข้ากระเป๋าแล้ว · ที่จุดลงบ้านกด G จัดการผู้ช่วย':' เข้าไปอยู่ในกรง → คลังของแต่งบ้าน'),false);showCard(rec);endCapture()}
function finishFail(){const e=CH.e;e._hlpNo=true;HP.stats.fail++;say('โซ่ขาด ตัวนี้จับไม่ได้อีก',true);endCapture()}
function tickCapture(dt){if(!CH)return;const t=now(),e=CH.e,k=tsc();
 if(CH.st==='fire'){const b=CH.ball,total=Math.min(HP.cfg.ballSpeed*dt,HP.cfg.range-b.d+1);let hit=null;
  /* sub-steps of at most 8 px so a slow frame cannot skip over a monster */
  for(let moved=0;moved<total&&!hit;){const sp=Math.min(8,total-moved);b.x+=b.dx*sp;b.y+=b.dy*sp;b.d+=sp;moved+=sp;
   for(const q of enemies){if(!q||q.dead||q.hp<=0)continue;const m=monPt(q),r=HP.cfg.hitR+(q.sz||20)*.5;if(Math.hypot(m.x-b.x,m.y-b.y)<r){hit=q;break}}}
  if(hit){if(hit._hlpNo){/* uncatchable: the fireball passes through it */}else if(isBoss(hit)){HP.stats.fizz++;say('บอสจับไม่ได้ ลูกไฟสลายไป (หนังสือไม่หมด)',true);CH=null;return}else{startChain(hit);return}}
  if(b.d>=HP.cfg.range){HP.stats.fizz++;CH=null;return}return}
 const el=t-CH.t0;
 /* the target stands still while it is bound */
 if(e){e.x=CH.ex;e.y=CH.ey;e.vx=e.vy=0;e.atkCd=Math.max(e.atkCd||0,1);e.wind=0;e.aggro=true}
 if(CH.st==='chain'){if(el>=CH.dur){if(CH.ok){CH.st='lock';CH.t0=t}else{CH.st='strain';CH.t0=t}}}
 else if(CH.st==='strain'){if(el>=HP.cfg.strain/k){CH.st='break';CH.t0=t;CH.frag=[];const h=heroHand(),m=monPt(e),map=mapper(h,m);for(const sd of [-1,1]){const pw=demoPath(sd,0).map(map);for(let i=0;i<=16;i++){const q=bez(pw,i/16);CH.frag.push({x:q.x,y:q.y,a:0,vx:(rnd()-.5)*260,vy:-rnd()*220,va:(rnd()-.5)*12})}}}}
 else if(CH.st==='break'){for(const o of CH.frag){o.vy+=520*dt;o.x+=o.vx*dt;o.y+=o.vy*dt;o.a+=o.va*dt}if(el>=HP.cfg.breakT/k)finishFail()}
 else if(CH.st==='lock'){if(el>=HP.cfg.lock/k){CH.st='pull';CH.t0=t}}
 else if(CH.st==='pull'){if(el>=HP.cfg.pull/k)finishSuccess()}}
function drawCapture(c){const t=now();
 if(HP.aim&&canAim()){const a=P.face||0,h=heroHand();let len=HP.cfg.range;for(const q of enemies){if(!q||q.dead||q.hp<=0||q._hlpNo)continue;const m=monPt(q),dx=m.x-h.x,dy=m.y-h.y,al=dx*Math.cos(a)+dy*Math.sin(a);if(al<0||al>HP.cfg.range)continue;const dd=Math.abs(-dx*Math.sin(a)+dy*Math.cos(a));if(dd<HP.cfg.hitR+(q.sz||20)*.5)len=Math.min(len,al)}
  c.save();c.setLineDash([9,9]);c.lineDashOffset=-t*30;c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=2.4;c.beginPath();c.moveTo(h.x+Math.cos(a)*14,h.y+Math.sin(a)*14);c.lineTo(h.x+Math.cos(a)*len,h.y+Math.sin(a)*len);c.stroke();c.setLineDash([]);if(len<HP.cfg.range){c.strokeStyle='rgba(120,210,255,.9)';c.lineWidth=2;c.beginPath();c.arc(h.x+Math.cos(a)*len,h.y+Math.sin(a)*len,10,0,6.2832);c.stroke()}c.restore()}
 if(!CH)return;
 if(CH.st==='fire'){const b=CH.ball;c.save();c.globalCompositeOperation='lighter';c.shadowColor='#ff9a3a';c.shadowBlur=18;c.fillStyle='#ffd27a';c.beginPath();c.arc(b.x,b.y,7,0,6.2832);c.fill();c.fillStyle='rgba(255,140,40,.5)';c.beginPath();c.arc(b.x-b.dx*10,b.y-b.dy*10,5,0,6.2832);c.fill();c.restore();return}
 const e=CH.e,h=heroHand(),m=monPt(e),map=mapper(h,m),el=t-CH.t0,k=tsc();
 if(CH.st==='chain'){const gr=ease(el/CH.dur);links(c,demoPath(-1,0),map,gr,CH.wob,t,0);links(c,demoPath(1,0),map,gr,CH.wob,t,0)}
 else if(CH.st==='strain'){const sk=Math.min(1,el*k/HP.cfg.strain),fl=Math.sin(t*50)>0?.7:0;links(c,demoPath(-1,0),map,1,CH.wob+sk*14,t,fl*sk);links(c,demoPath(1,0),map,1,CH.wob+sk*14,t,fl*sk)}
 else if(CH.st==='break'){c.save();c.strokeStyle='rgba(90,190,255,'+Math.max(0,1-el*k/1.0)+')';c.shadowColor='#3aa8ff';c.shadowBlur=8;c.lineWidth=2.6;for(const o of CH.frag){c.save();c.translate(o.x,o.y);c.rotate(o.a);c.beginPath();c.ellipse(0,0,7,3.2,0,0,6.2832);c.stroke();c.restore()}c.restore()}
 else if(CH.st==='lock'){const q=ease(el*k/.7),br=Math.min(1,el*k/.6),lw=CH.wob*(1-q)+40*Math.min(1,q*3),bp=Math.min(1,br*(.85+.15*Math.sin(t*7))),map2=mapper(h,m,q);links(c,demoPath(-1,q),map2,1,lw,t,bp,3.2,q>.01&&LOCKN);links(c,demoPath(1,q),map2,1,lw,t,bp,3.2,q>.01&&LOCKN)}
 else if(CH.st==='pull'){const p=ease(el*k/HP.cfg.pull),cx=m.x+(h.x-m.x)*p,cy=m.y+(h.y-m.y)*p-Math.sin(p*3.14)*60,dxp=cx-h.x,dyp=cy-h.y,nl=Math.hypot(dxp,dyp)||1,nx=-dyp/nl,ny=dxp/nl,sag=Math.max(12,nl*.24),w1=0;const pw=[{x:h.x,y:h.y},{x:h.x+dxp*.3+nx*(sag+w1),y:h.y+dyp*.3+ny*(sag+w1)},{x:h.x+dxp*.7-nx*(sag*.8+w1),y:h.y+dyp*.7-ny*(sag*.8+w1)},{x:cx,y:cy}];c.save();c.globalAlpha=Math.max(.15,1-p*.85);links(c,pw,q=>q,1,Math.max(30,nl*.32)*Math.min(1,nl/40),t,.85,4,PULLN);c.restore();
  c.save();c.translate(cx,cy);FR.cageDraw(c,0,10,.45+p*.35,null);c.restore()}}
/* the bound monster shrinks into the cage during the pull; marked monsters get the grey mark */
try{const _d=drawEnemy;drawEnemy=function(e){const cur=(CH&&CH.e===e)?CH:null;if(cur&&cur.st==='pull'){const p=ease((now()-cur.t0)*tsc()/HP.cfg.pull);ctx.save();ctx.globalAlpha=Math.max(0,1-p);ctx.translate(e.x,e.y);const s=1-p*.75;ctx.scale(s,s);ctx.translate(-e.x,-e.y);try{return _d.apply(this,arguments)}finally{ctx.restore()}}
 const r=_d.apply(this,arguments);try{if(e&&e._hlpNo&&!e.dead)drawNoCap(ctx,e)}catch(_){}return r}}catch(e){ERR('hook drawEnemy',e)}
/* ---------------- house helpers: data ---------------- */
const S0=()=>HS.state();
function hs(){const S=S0();let h=S.helpers;if(!h||typeof h!=='object'||h.v!==1)h=S.helpers={v:1,list:[],ts:Date.now()};if(!Array.isArray(h.list))h.list=[];return h}
HP.list=()=>hs().list;
const uidH=()=>'hp'+Math.random().toString(36).slice(2,9);
function newRec(type,elite,L){const j=HP.rollJob(type,elite),r={id:uidH(),sp:type,name:mobName(type),job:j.job,lv:j.lv,trait:HP.fat?HP.rollTrait():null,task:j.job,out:false,cage:null,fat:0,rest:false,fishT:0,cook:null,queue:[],elite:!!elite,born:Date.now(),mob:mobSnap(type)};
 if(!JOBS.includes(r.task))r.task='farm';if(HP.hm&&HP.hmNew)return HP.hmNew(r);hs().list.push(r);syncCages();try{HS.save()}catch(_){}return r}
HP.newRec=newRec;
const placedCages=()=>{try{return (S0().placed||[]).filter(o=>o&&o.id==='helperCage')}catch(_){return[]}};
/* every cage in storage = one helper record without a cage; every placed cage gets a record */
function syncCages(){if(HP.hm){try{const S=S0();if(S.storage&&S.storage.helperCage)S.storage.helperCage=0}catch(_){}return}try{const S=S0(),h=hs(),pc=placedCages();for(const r of h.list){if(r.cage&&!pc.some(o=>o.uid===r.cage)){r.cage=null;r.out=false;r.tg=null}else if(!r.cage&&r.out){r.out=false;r.tg=null}}
  for(const o of pc){if(h.list.some(r=>r.cage===o.uid))continue;const free=h.list.find(r=>!r.cage);if(free){free.cage=o.uid;free.out=false}else{o._orphan=1}}
  const stored=h.list.filter(r=>!r.cage).length;if(!S.storage)S.storage={};if((S.storage.helperCage|0)!==stored)S.storage.helperCage=stored}catch(e){ERR('syncCages',e)}}
HP.sync=syncCages;
const recOf=id=>hs().list.find(r=>r.id===id)||null;
const cageOf=r=>HP.hm?(r&&HP.hmSpawn&&(r.out||r.hmr)?HP.hmSpawn(r):null):(r&&r.cage?placedCages().find(o=>o.uid===r.cage)||null:null);
const platLevel=()=>{try{return S0().plat.level|0}catch(_){return 1}};
HP.limit=()=>HP.cfg.limitByPlatform(platLevel());
const outCount=()=>hs().list.filter(r=>r.out).length;
HP.outCount=outCount;
/* ---------------- bonuses (best helper per job only) ---------------- */
const working=r=>r&&r.out&&!r.rest&&r.job&&r.task;
HP.bonus=function(job){let best=0,rec=null;for(const r of hs().list){if(!r.out||r.rest||r.task!==job||r.job!==job)continue;if(r.lv>best){best=r.lv;rec=r}}return {lv:best,rec}};
/* ---------------- stations ---------------- */
HP.station=function(job){try{if(job==='farm')return (typeof HS!=='undefined')&&(S0().placed||[]).some(o=>o&&HS.items[o.id]&&HS.items[o.id].farm);
 if(job==='fishing')return (S0().placed||[]).some(o=>o&&o.id==='fishPond');
 if(job==='cooking'){const f=window.COOK&&COOK.fire;return !!(f&&f.lit&&f.zone===HS.ZID)}if(job==='tank')return !!(window.HLPTANK213&&HLPTANK213.on&&HLPTANK213.station());return false}catch(_){return false}};
const needTxt={farm:'ต้องมีแปลงผักหรือแปลงต้นไม้',fishing:'ต้องมีบ่อตกปลา',cooking:'ต้องมีกองไฟที่ติดอยู่ในลาน',weapon:'ยังไม่มีโต๊ะคราฟต์อาวุธ',tank:'ต้องมีตู้ปลาวางอยู่ในบ้าน'};
HP.needText=job=>needTxt[job]||'';
/* ---------------- fatigue (sub-flag ?helperfatigue=off) ---------------- */
function gainRate(r){/* fatigue per second while working */const F=HP.cfg.fatigue,mins=r.task==='farm'?F.workMin.farm:F.workMin.other;let k=100/(mins*60);k*=traitMul(r.trait);if(r.task===r.job)k*=1-(F.strongSlow[r.lv-1]||0);return k}
function restRate(r){const F=HP.cfg.fatigue;return 100/((r.cage&&!r.out?F.restCage:F.restYard)*60)}
HP.fatigueInfo=function(r){const F=HP.cfg.fatigue;return {gainPerMin:+(gainRate(r)*60).toFixed(3),workMin:+(100/gainRate(r)/60).toFixed(1),restMinYard:F.restYard,restMinCage:F.restCage}};
function fatigueTick(r,dt,workedNow){if(!HP.fat)return;const F=HP.cfg.fatigue;
 if(r.trait&&r.trait.k==='tireless'){r.fat=0;r.rest=false;return}
 if(!r.out){if(r.fat>0){r.fat=Math.max(0,r.fat-dt*100/(F.restCage*60));if(r.fat<=0)r.rest=false}return}
 if(r.rest){r.fat=Math.max(0,r.fat-dt*100/(F.restYard*60));if(r.fat<=0){r.fat=0;r.rest=false}return}
 if(workedNow){r.fat=Math.min(100,r.fat+dt*gainRate(r));if(r.fat>=100){r.fat=100;r.rest=true}}}
/* ---------------- jobs ---------------- */
function bagCan(id){try{const c=Object.assign({},P,{inv:P.inv.map(x=>x?Object.assign({},x):x)});return !!addItemTo(c,{id,q:1})}catch(_){return false}}
function bagPut(id){try{return !!addItem({id,q:1})}catch(_){return false}}
function farmSpots(){try{return (HS.farm&&HS.farm._plots)?HS.farm._plots():[]}catch(_){return[]}}
function ripeSpot(){return farmSpots().find(s=>s.sp&&s.sp.crop&&s.sp.ripe)||null}
function drySpot(){return farmSpots().find(s=>s.sp&&s.sp.crop&&!s.sp.ripe&&!s.sp.fin&&!s.sp.w)||null}
/* farm bonus: grow time shortened on every watering while the best strong-farm helper is working */
function stepMsOf(sp){try{const F=HS.farm.cfg,tree=!!F.trees[sp.crop];let q;if(tree){const c=F.trees[sp.crop];q=sp.ph==='loop'?c.loop:c.first}else{const m=F.crops[sp.crop];if(!m)return 0;const d=m.min/3;q=[['s1',d],['s2',d],['s3',d]]}return q[sp.si]?q[sp.si][1]*60000:0}catch(_){return 0}}
function applyFarmBonus(sp){try{const b=HP.bonus('farm');if(!b.lv||!sp||!sp.w)return;const ms=stepMsOf(sp);if(ms>0){sp.t0=Date.now()-ms*HP.cfg.farm.bonus[b.lv-1];HP.stats.farmBonusApplied=(HP.stats.farmBonusApplied|0)+1}}catch(e){ERR('farmBonus',e)}}
try{const F=HS&&HS.farm;if(F&&F.water){const _w=F.water;F.water=function(s){const r=_w.apply(this,arguments);try{if(!r){const sp=(s&&s.sp)||(F._nearest&&F._nearest()&&F._nearest().sp);applyFarmBonus(sp)}}catch(_){}return r};const _a=F.waterAll;F.waterAll=function(){const before=farmSpots().filter(s=>s.sp&&s.sp.w).map(s=>s.sp);const r=_a.apply(this,arguments);try{for(const s of farmSpots())if(s.sp&&s.sp.w&&!before.includes(s.sp))applyFarmBonus(s.sp)}catch(_){}return r}}}catch(e){ERR('farm hook',e)}
function doFarmAction(r){/* returns 'water' | 'harv' | 'full' | null */const rs=(r&&r.noHarv&&window.HLPFARM212&&HLPFARM212.on)?null:ripeSpot();if(rs){let m;window.__HLPHARV=1;try{m=HS.farm.harvest(rs)}finally{window.__HLPHARV=0}if(m&&/กระเป๋าเต็ม/.test(m))return 'full';HP.stats.farmH++;return 'harv'}
 const ds=drySpot();if(ds){const m=HS.farm.water(ds);if(!m){HP.stats.farmW++;return 'water'}}return null}
function fishInterval(r){const F=HP.cfg.fish;return r.task===r.job&&r.job==='fishing'?F.strong[r.lv-1]:F.base}
function rollFish(r){const F=HP.cfg.fish,FS=window.__FISHING;if(!FS||!FS.cfg)return 'pondCarp';const strong=r.task===r.job&&r.job==='fishing',lv=strong?r.lv:0;const t=FS.table();const w={};let sum=0;for(const id of FS.fishIds){const f=FS.cfg.fish[id];let x=t[id]||0;if(f.r==='uncommon'&&lv<F.uncommonFrom)x=0;if(f.r==='rare'){if(lv<F.rareLv)x=0;else x*=F.rareMul}w[id]=x;sum+=x}let q=rnd()*sum;for(const id of FS.fishIds){q-=w[id];if(q<0)return id}return 'pondCarp'}
HP.rollFish=rollFish;
function cookTime(r,rid){const C=HP.cfg.cook,base=C.times[rid]||20,b=(r.task===r.job&&r.job==='cooking')?C.bonus[r.lv-1]:0;return base*(1-b)}
function queueMax(r){const C=HP.cfg.cook;return (r.task===r.job&&r.job==='cooking'&&r.lv>=3)?C.queueLv3:C.queue}
HP.cookTime=cookTime;HP.queueMax=queueMax;
function recipeById(id){try{return COOK.recipes.find(x=>x.id===id)}catch(_){return null}}
function canMakeRecipe(rc){for(const [id,k] of rc.ing)if((window.__F183&&__F183.hCount?__F183.hCount(id):countItem(id))<k)return false;return true}
/* one second-step of work for a helper; at home the entity must have arrived (home=true gives the 'arrived' flag in ctx) */
function jobStep(r,dt,ctx){/* returns the status kind for the bubble: water/harv/fish/cook/bag/rest/tired/walk, and sets ctx.need = {x,y,k} when it wants to walk somewhere */
 if(r.rest)return 'tired';
 const job=r.task;
 if(job==='farm'){const rs=(r.noHarv&&window.HLPFARM212&&HLPFARM212.on)?null:ripeSpot(),ds=rs?null:drySpot();const sp=rs||ds;if(!sp){ctx.need=null;return null}
  const home=ctx.home;if(home){if(!ctx.at||!ctx.at.spot||ctx.at.spot.sp!==sp.sp){ctx.need={x:sp.x,y:sp.y+16,k:rs?'harv':'water',spot:sp};ctx.at=null;return rs?'walkh':'walkw'}
    ctx.act=(ctx.act||0)+dt;if(ctx.act<.7)return rs?'harv':'water';ctx.act=0;}
  else{ctx.act=(ctx.act||0)+dt;if(ctx.act<HP.cfg.farm.actSec)return rs?'harv':'water';ctx.act=0}
  const res=doFarmAction(r);ctx.at=null;if(res==='full'){HP.stats.bagFull++;return 'bag'}return res==='harv'?'harv':res==='water'?'water':null}
 if(job==='fishing'){if(!HP.station('fishing'))return null;const pond=(S0().placed||[]).find(o=>o&&o.id==='fishPond');if(ctx.home&&pond){const d=HS.items.fishPond,gx=pond.x+(r.id.charCodeAt(2)%2?-38:38),gy=pond.y+d.h/2+26;if(!ctx.at||ctx.at.k!=='pond'){ctx.need={x:gx,y:gy,k:'pond'};return 'walkf'}}
  r.fishT=(r.fishT||0)+dt;ctx.worked=true;const iv=fishInterval(r);if(r.fishT>=iv){const id=rollFish(r),item=(window.__FISHING&&__FISHING.cfg.fish[id].item);if(item&&bagCan(item)){r.fishT=0;(window.__F183&&__F183.helperFish?__F183.helperFish(id,item):bagPut(item));HP.stats.fish++;ctx.pop='fish'}else{r.fishT=iv;HP.stats.bagFull++;return 'bag'}}return 'fish'}
 if(job==='tank')return (window.HLPTANK213&&HLPTANK213.on)?HLPTANK213.step(r,dt,ctx):null;
 if(job==='cooking'){if(!HP.station('cooking'))return null;
  if(!r.cook){const rid=(r.queue||[])[0];if(!rid)return null;const rc=recipeById(rid);if(!rc||!canMakeRecipe(rc)){/* missing ingredients: skip it */r.queue.shift();return null}
   for(const [id,k] of rc.ing)(window.__F183&&__F183.hTake?__F183.hTake(id,k):takeItem(id,k));r.cook={rid,t:0,total:cookTime(r,rid)};r.queue.shift()}
  const f=COOK.fire;if(ctx.home&&f){if(!ctx.at||ctx.at.k!=='fire'){ctx.need={x:f.x+34*(r.id.charCodeAt(2)%2?1:-1),y:f.y+14,k:'fire'};return 'walkc'}}
  r.cook.t+=dt;ctx.worked=true;if(r.cook.t>=r.cook.total){const rc=recipeById(r.cook.rid),out=rc&&rc.out;if(out&&bagCan(out)){bagPut(out);HP.stats.dish++;ctx.pop='cook';r.cook=null}else{r.cook.t=r.cook.total;HP.stats.bagFull++;return 'bag'}}return 'cook'}
 return null}
/* ---------------- runtime entities (at home) ---------------- */
const ENT=HP.ents;
function ensureDef(){try{if(!PROP_DEFS.househelper)PROP_DEFS.househelper={n:'House helper',cat:'misc',w:200,h:200,ax:100,ay:150,liveOnly:1,nofade:1,draw(){},live(c,p){try{drawHelperProp(c,p)}catch(e){ERR('live',e)}}};return true}catch(e){return false}}
/* r177b: map-specific species (e.g. Map 2 stoneboar / leafbun / seedling ...) are only in MOBS after that map was visited this session; a copy of the MOBS entry is kept in the record so a helper is drawn at home after a reload too */
function mobSnap(sp){try{const m=MOBS[sp];return m?JSON.parse(JSON.stringify(m)):null}catch(_){return null}}
function mkEn(sp,x,y,rec){try{if(!MOBS[sp]&&rec&&rec.mob)MOBS[sp]=Object.assign({},rec.mob);const e=makeEnemy(sp,1,x,y);e.aggro=false;e.dead=false;e.hp=e.maxHp;e.hitT=0;e.flash=0;e.joinMode=null;e.leashR=0;return e}catch(er){ERR('makeEnemy '+sp,er);return null}}
function entFor(r){let E=ENT[r.id];if(E&&E.sp!==r.sp){delete ENT[r.id];E=null}if(!E){const c=cageOf(r);if(!c)return null;const en=mkEn(r.sp,c.x,c.y,r);if(!en)return null;E={id:r.id,sp:r.sp,en,x:c.x,y:c.y,dir:1,ctx:{home:true},t:0,tg:null,prop:null,status:'rest',wob:0,bt:0};ENT[r.id]=E}return E}
function ensureProps(){if(G.zone!==HS.ZID||!ensureDef())return;try{for(const r of hs().list){const c=cageOf(r);const E=c?entFor(r):null;if(!E){if(ENT[r.id]&&ENT[r.id].prop){const i=PROPS.indexOf(ENT[r.id].prop);if(i>=0)PROPS.splice(i,1);ENT[r.id].prop=null}continue}
   if(!E.prop||PROPS.indexOf(E.prop)<0){E.prop={t:'househelper',x:E.x,y:E.y,s:1,v:0,f:1,ph:0,hlp:r.id};PROPS.push(E.prop)}}
  for(const id of Object.keys(ENT)){if(!hs().list.some(r=>r.id===id)||!cageOf(recOf(id))){const E=ENT[id];if(E&&E.prop){const i=PROPS.indexOf(E.prop);if(i>=0)PROPS.splice(i,1)}delete ENT[id]}}}catch(e){ERR('ensureProps',e)}}
/* the game's drawEnemy draws a name plate + HP bar when the hero is within 720 px: a helper must show neither, so the hero is moved out of reach for that one call */
/* r177b: the game culls monsters further than ~600 px from the hero and shows name plates nearer than ~720; P is parked 580 px to the side so the sprite is drawn (before: -99999 = nothing drawn, helpers were invisible) */function drawMon(en){const px=P.x,py=P.y,c=ctx,sv=[c.fillText,c.strokeText,c.fillRect,c.createLinearGradient,c.fill,c.drawImage],nop=function(){};let R=null,sc0=null;try{const M=window.MON_SPRITES;R=M&&M.byType&&M.byType[en.type];if(R&&R.data&&R.data.scope==='studio'){sc0=R.data.scope;R.data.scope='home'/* r177c: approved Studio-scope art (Stone Boar, Moss Turtle, Gale Feather ...) is drawn at home too */}else R=null}catch(_){R=null}P.x=en.x+580;P.y=en.y;const V211=window.__VIS,vr211=V211?V211.r:0;if(V211&&!/[?&]helpervis=off\b/.test(location.search))V211.r=1e6;/* r211: the sight-circle cull (vision module) hid every helper on screens where its radius is under ~520 px *//* the game queues the name plate text through MNFIX (removed below) and draws the HP bar as a dark backing + a linear-gradient fill; the monster draws two 64x64 glow sprites (a big soft halo): all swallowed for a helper */c.fillText=nop;c.strokeText=nop;c.fillRect=nop;c.createLinearGradient=function(){const g=sv[3].apply(this,arguments);g.addColorStop=nop;return g};c.fill=function(){if(this.fillStyle==='rgba(3, 6, 18, 0.8)')return;return sv[4].apply(this,arguments)};c.drawImage=function(im){if(im&&im.tagName==='CANVAS'&&im.width===64&&im.height===64&&!(window.HELPERGLOW213&&HELPERGLOW213.keep(en,this)))return;return sv[5].apply(this,arguments)};try{drawEnemy(en)}catch(_){}finally{if(V211)V211.r=vr211;P.x=px;P.y=py;c.fillText=sv[0];c.strokeText=sv[1];c.fillRect=sv[2];c.createLinearGradient=sv[3];c.fill=sv[4];c.drawImage=sv[5];if(R)R.data.scope=sc0;try{const F=window.MNFIX;if(F&&F.q&&F.q.length)F.q=F.q.filter(it=>it.e!==en)}catch(_){}}}
/* r177b: a thin pale warm rim (4 shadow copies, 1.5 px, no blur) + a soft ground shadow so a helper reads on grass of any colour */
function drawMonRim(en){const c=ctx;for(const o of HP.cfg.rimOff){c.save();c.shadowColor=HP.cfg.rimCol;c.shadowBlur=0;c.shadowOffsetX=o[0];c.shadowOffsetY=o[1];try{drawMon(en)}finally{c.restore()}}drawMon(en)}
function groundShadow(c,x,y,sz){c.save();const g=c.createRadialGradient(x,y+2,2,x,y+2,sz*1.15+8);g.addColorStop(0,'rgba(0,0,0,.42)');g.addColorStop(.6,'rgba(0,0,0,.24)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.beginPath();c.ellipse(x,y+3,sz*1.15+8,(sz*.45+5),0,0,6.2832);c.fill();c.restore()}
function drawHelperProp(c,p){const r=recOf(p.hlp),E=ENT[p.hlp];if(!r||!E)return;const cg=cageOf(r),t=time||0;
 if(!r.out){if(HP.hm)return;/* in the cage: monster inside (scaled), bars in front */const cx=cg?cg.x:E.x,cy=cg?cg.y:E.y;c.save();FR.cageDraw(c,cx,cy+11,1,'back');c.translate(cx,cy+4);c.scale(.62,.62);c.translate(-cx,-(cy+4));E.en.x=cx;E.en.y=cy+4;E.en.face=Math.PI;E.en.vx=0;E.en.vy=0;drawMon(E.en);c.restore();FR.cageDraw(c,cx,cy+11,1,'front');
  if(r.rest||(r.fat>0&&HP.fat&&false))FR.bubble(c,cx,cy-62+Math.sin(t*3)*2,'tired',t);return}
 E.en.x=E.x;E.en.y=E.y;E.en.face=E.dir>0?0:Math.PI;E.en.ph=E.en.ph||0;E.en.vx=E.moving?E.dir*30:0;E.en.vy=0;E.en.hitT=0;
 groundShadow(c,E.x,E.y,E.en.sz||20);drawMonRim(E.en);
 const h=(E.en.sz||20)*2.2+34;if(E.status)FR.bubble(c,E.x,E.y-h+Math.sin(t*3)*2,E.status,t);
 if(E.work==='water'){c.save();c.fillStyle='#9fdcff';for(let d=0;d<4;d++){c.beginPath();c.arc(E.x+E.dir*4-12+d*8,E.y-(E.en.sz||20)*1.6-((t*60+d*9)%26),2.3,0,6.2832);c.fill()}c.restore()}
 if(E.work==='fish'){c.save();c.strokeStyle='#8a6238';c.lineWidth=3.4;c.beginPath();c.moveTo(E.x+E.dir*12,E.y-(E.en.sz||20));c.lineTo(E.x+E.dir*54,E.y-(E.en.sz||20)-40);c.stroke();c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=1.2;c.beginPath();c.moveTo(E.x+E.dir*54,E.y-(E.en.sz||20)-40);c.lineTo(E.x+E.dir*70,E.y-(E.en.sz||20)+6+Math.sin(t*3)*3);c.stroke();c.restore()}
 if(E.work==='cook'){c.save();c.fillStyle='rgba(255,200,120,.35)';ell(c,E.x,E.y-8,16,6);c.fill();c.restore()}}
/* walking helpers in the yard */
const solidAt=(x,y)=>{try{return HS.build.solidAt(x,y)}catch(_){return false}};
const walkOk=(x,y)=>{try{return HS.walkable(x,y)&&!solidAt(x,y)}catch(_){return true}};
function stepEnt(r,E,dt){const ctx=E.ctx;ctx.home=true;ctx.need=null;
 const st=jobStep(r,dt,ctx);const walkSt=/^walk/.test(st||'');
 if(ctx.need){E.tg={x:ctx.need.x,y:ctx.need.y,k:ctx.need.k,spot:ctx.need.spot}}
 else if(st&&!walkSt&&st!=='tired'){E.tg=null}               /* working (or waiting with a full bag) in place */
 else{/* free time / tired: walk back and forth */
  if(!E.tg||(E.tg.k!=='wander'&&E.tg.k!=='rest')){const a=rnd()<.5?-1:1,d=120+rnd()*160;let x=E.x+a*d,y=E.y+(rnd()-.5)*50,tries=0;while(!walkOk(x,y)&&tries++<14){x=E.x-a*(60+rnd()*140);y=E.y+(rnd()-.5)*80}E.tg={x,y,k:r.rest?'rest':'wander'}}
  else if(r.rest&&E.tg.k==='wander')E.tg.k='rest'}
 E.moving=false;E.work=null;const tgt=E.tg;
 if(tgt){const dx=tgt.x-E.x,dy=tgt.y-E.y,d=Math.hypot(dx,dy),spd=tgt.k==='wander'?HP.cfg.walk.free:tgt.k==='rest'?HP.cfg.walk.tired:HP.cfg.walk.speed;
  if(d>5){const stp=Math.min(d,spd*dt),nx=E.x+dx/d*stp,ny=E.y+dy/d*stp;if(walkOk(nx,ny)||tgt.k==='harv'||tgt.k==='water'){E.x=nx;E.y=ny;E.moving=true;E.blk=0;if(Math.abs(dx)>2)E.dir=dx>0?1:-1}
   else{/* blocked by a solid (no path finder): slide around it - try turning away from the straight line, remember the side so it does not jitter */
    const base=Math.atan2(dy,dx);let moved=false;const side=E.side||(E.side=rnd()<.5?1:-1);
    for(const a of [.5,1,1.5,2,2.5]){for(const sg of [side,-side]){const ang=base+a*sg,sx=E.x+Math.cos(ang)*stp,sy=E.y+Math.sin(ang)*stp;if(walkOk(sx,sy)){E.x=sx;E.y=sy;E.moving=true;if(Math.abs(Math.cos(ang))>.1)E.dir=Math.cos(ang)>0?1:-1;moved=true;break}}if(moved)break}
    E.blk=(E.blk||0)+(moved?0:1);if(!moved&&E.blk>20){E.tg=null;E.blk=0;E.side=-side}}}
  else{if(tgt.k==='wander'||tgt.k==='rest')E.tg=null;else{ctx.at={k:tgt.k,spot:tgt.spot};E.tg=null}}}
 let k=st;if(!k)k=r.rest?'tired':'rest';if(k==='walkh')k='harv';if(k==='walkw')k='water';if(k==='walkf')k='walk';if(k==='walkc')k='cook';if(k==='tired'&&!r.rest)k='rest';
 E.status=k;E.work=(!E.moving&&(st==='water'||st==='harv'||st==='fish'||st==='cook'))?st:null;return st}/* ---------------- the tick ---------------- */
let lastT=0,saveT=0;
function tick(dt){if(!HP.on||!P||G.state!=='play')return;if(!HS||!HS.on)return;
 if(!lastT)lastT=Date.now();const real=Date.now();let el=(real-lastT)/1000;lastT=real;if(el>3600)el=3600;if(el<0)el=0;
 const h=hs();for(const r of h.list)if(!r.mob&&MOBS[r.sp])r.mob=mobSnap(r.sp);syncCages();const inYard=G.zone===HS.ZID&&!HS.roomOn;if(inYard)ensureProps();
 /* steps: at home use the frame dt; away use 1 s virtual steps of the elapsed time (so a hitch / background tab is caught up) */
 const sim=HP.cfg.simSpeed||1;/* test knob only (default 1): fast-forwards helper time */let steps=[];if(inYard){if(sim>1){let rem=Math.min(el,.25)*sim;while(rem>0&&steps.length<400){const s=Math.min(.25,rem);steps.push(s);rem-=s}}else steps=[Math.min(el,.25)]}else{let rem=el*sim;while(rem>0&&steps.length<400){const s=Math.min(1,rem);steps.push(s);rem-=s}}
 for(const s of steps){for(const r of h.list){
   if(!r.out){fatigueTick(r,s,false);continue}
   const E=inYard?ENT[r.id]:null;let st;
   if(E){st=stepEnt(r,E,s)}else{const ctx=r._ctx||(r._ctx={home:false});ctx.home=false;ctx.need=null;st=jobStep(r,s,ctx)}
   fatigueTick(r,s,!!(st&&st!=='tired'&&st!=='bag'&&!r.rest))}}
 if(inYard){for(const r of h.list){const E=ENT[r.id];if(E&&E.prop){E.prop.x=r.out?E.x:(cageOf(r)?cageOf(r).x:E.x);E.prop.y=r.out?E.y:(cageOf(r)?cageOf(r).y:E.y)+.5}}}
 saveT+=el;if(saveT>20){saveT=0;try{HS.save()}catch(_){}}}
/* ---------------- housing integration: limits, yard only, shop ---------------- */
if(HS&&HS.on&&HS.items&&HS.items.helperCage){
 {const _c=HS.canPlaceAt;HS.canPlaceAt=function(x,y,a){try{if(a==='helperCage'&&HS.roomOn)return 'วางกรงผู้ช่วยได้เฉพาะที่ลานนอกบ้านเท่านั้น'}catch(e){ERR('canPlace',e)}return _c.apply(this,arguments)}}
 try{if(HS.build&&HS.build.toBag){const _t=HS.build.toBag;HS.build.toBag=function(){const r=_t.apply(this,arguments);try{syncCages();HS.save()}catch(_){}return r}}}catch(_){}
}
/* ---------------- Emma sells the book ---------------- */
function addGoods(){try{const TN=window.__TOWNNPC;if(!TN||!TN.goods)return false;const k=(HS&&HS.cfg&&HS.cfg.vendor&&HS.cfg.vendor.npc)||'ast_emma';TN.goods[k]=TN.goods[k]||[];if(!TN.goods[k].includes('soulBook'))TN.goods[k].push('soulBook');return true}catch(e){return false}}
/* ---------------- book use + drops ---------------- */
try{const _u=useItemId;useItemId=function(id){try{if(id==='soulBook'){if(HP.on)HP.startAim();return}}catch(e){ERR('use',e)}return _u.apply(this,arguments)}}catch(e){ERR('hook use',e)}
try{const _k=killEnemy;killEnemy=function(e){const r=_k.apply(this,arguments);try{if(HP.on&&e&&!isBoss(e)&&!e._hlpHold){const el=!!(e.eliteX||(e.m&&e.m.elite));if(rnd()<(el?HP.cfg.bookDropElite:HP.cfg.bookDrop)){if(addItem({id:'soulBook',q:1}))say('ได้หนังสือผนึกวิญญาณ ×1',false)}}}catch(er){ERR('drop',er)}return r}}catch(e){ERR('hook kill',e)}
/* ---------------- UI: card, menu, confirm, prompt ---------------- */
const css=document.createElement('style');css.textContent='#hpMenu{position:fixed;inset:0;z-index:9500;display:none;align-items:center;justify-content:center;background:rgba(2,4,14,.55);font:13px/1.4 "Noto Sans Thai",system-ui,sans-serif;color:#ffe9b0}#hpMenu.in{display:flex}#hpMenu .pn{width:min(94vw,420px);max-height:min(88vh,640px);overflow:auto;border-radius:16px;background:rgba(18,12,6,.98);border:1px solid #d6b05c;box-shadow:0 12px 40px rgba(0,0,0,.7);padding:12px 14px 14px}#hpMenu h3{margin:0 0 2px;font-size:16px;color:#ffd98a;display:flex;gap:8px;align-items:center}#hpMenu h3 span{flex:1}#hpMenu .x{width:32px;height:32px;border-radius:9px;border:1px solid #d6b05c;background:#3a2410;color:#ffe9b0;cursor:pointer;font-size:16px}#hpMenu .sub{color:#b9b09a;font-size:12px;margin-bottom:6px}#hpMenu .row{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}#hpMenu button.b{min-height:42px;flex:1;min-width:120px;padding:0 10px;border-radius:10px;border:1px solid #d6b05c;background:#3a2410;color:#ffe9b0;font:700 13px "Noto Sans Thai",system-ui,sans-serif;cursor:pointer;touch-action:manipulation}#hpMenu button.b.pri{background:linear-gradient(#d49a3a,#8a5a14);color:#fff}#hpMenu button.b.on{background:#f2c14e;color:#1d1a10;border-color:#f2c14e}#hpMenu button.b:disabled{opacity:.42;cursor:not-allowed}#hpMenu button.b.dng{background:linear-gradient(#6a3a3a,#3f1f1f);border-color:#e0a0a0}#hpMenu .hint{font-size:11.5px;color:#9fb2d8;margin:2px 0}#hpMenu .warn{font-size:11.5px;color:#ffb070;margin:2px 0}#hpMenu .fat{height:10px;border-radius:6px;background:#241b12;border:1px solid #4a3a26;overflow:hidden;margin:3px 0}#hpMenu .fat i{display:block;height:100%;background:linear-gradient(#5cd08a,#2a8a5a)}#hpMenu .fat.hi i{background:linear-gradient(#f0a050,#d05030)}#hpMenu .qrow{display:flex;gap:5px;flex-wrap:wrap;align-items:center}#hpMenu .qrow button{min-width:0;flex:none;min-height:36px;padding:0 8px}#hpConfirm{position:fixed;inset:0;z-index:9600;display:none;align-items:center;justify-content:center;background:rgba(2,4,14,.7);font:14px/1.5 "Noto Sans Thai",system-ui,sans-serif;color:#ffe9b0}#hpConfirm.in{display:flex}#hpConfirm .pn{width:min(92vw,360px);border-radius:14px;background:rgba(30,14,10,.98);border:1px solid #e0a0a0;padding:16px;text-align:center}#hpConfirm .row{display:flex;gap:10px;margin-top:12px}#hpConfirm button{flex:1;min-height:46px;border-radius:10px;border:1px solid #d6b05c;background:#3a2410;color:#ffe9b0;font:800 14px "Noto Sans Thai",system-ui,sans-serif;cursor:pointer}#hpConfirm button.go{background:linear-gradient(#a03a3a,#5a1a1a);border-color:#ff9a9a}#hpPrompt{position:fixed;left:50%;bottom:calc(340px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:7;display:none;padding:8px 18px;border-radius:999px;background:rgba(20,15,8,.9);border:1px solid #b8ffd0;color:#fff;font-size:13px;cursor:pointer;box-shadow:0 0 18px rgba(120,255,180,.4);white-space:nowrap}#hpPrompt kbd{display:inline-block;min-width:20px;padding:0 6px;margin-right:6px;border-radius:6px;background:#b8ffd0;color:#06301a;font-weight:700;text-align:center}@media (max-height:520px){#hpPrompt{bottom:calc(190px + env(safe-area-inset-bottom,0px))}}#hpCard{position:fixed;left:50%;top:24%;transform:translateX(-50%);z-index:9400;display:none;min-width:210px;max-width:92vw;padding:12px 18px;border-radius:14px;background:rgba(18,12,6,.97);border:1px solid #6fd0ff;color:#ffe9b0;text-align:center;font:700 14px/1.45 "Noto Sans Thai",system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.65);cursor:pointer}#hpCard canvas{display:block;margin:0 auto 4px;width:72px;height:72px}';document.head.appendChild(css);
const menu=document.createElement('div');menu.id='hpMenu';document.body.appendChild(menu);
const conf=document.createElement('div');conf.id='hpConfirm';document.body.appendChild(conf);
const pr=document.createElement('div');pr.id='hpPrompt';pr.innerHTML='<kbd>F</kbd>กรงผู้ช่วย';document.body.appendChild(pr);
const card=document.createElement('div');card.id='hpCard';document.body.appendChild(card);
for(const el of [menu,conf,pr,card])for(const ev of ['pointerdown','mousedown','touchstart','pointerup','mouseup','touchend'])el.addEventListener(ev,e=>e.stopPropagation());
card.addEventListener('click',()=>{card.style.display='none'});
let cardT=0;

function showCard(r){if(HP.hm&&HP.hmCard)return HP.hmCard(r);const j=JN(r.job),tr=HP.fat&&r.trait?'<div style="color:'+HP.traitCol(r.trait)+'">'+HP.traitText(r.trait)+'</div>':'';card.innerHTML='<div style="font-size:15px">'+r.name+'</div><div style="color:#ffd24a">★ ถนัด'+j+' เวล '+r.lv+'</div>'+tr+'<div style="font-size:12px;color:#9fe0ff">กรงอยู่ในคลังของแต่งบ้าน · วางกรงที่ลานแล้วกด “ปล่อยออกมาทำงาน”</div>';card.style.display='block';clearTimeout(cardT);cardT=setTimeout(()=>{card.style.display='none'},4500)}
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let menuFor=null;
function stationOk(j){return HP.station(j)}
function sameJobWarn(r,j){return hs().list.some(o=>o!==r&&o.out&&o.task===j)}
function openMenu(id){const r=recOf(id);if(!r)return false;menuFor=id;renderMenu();menu.classList.add('in');try{for(const k in keys)keys[k]=false}catch(_){}return true}
HP.openMenu=openMenu;
function closeMenu(){menu.classList.remove('in');menuFor=null}
function renderMenu(){const r=recOf(menuFor);if(!r){closeMenu();return}
 const c=cageOf(r),tr=HP.fat&&r.trait?'<span style="color:'+HP.traitCol(r.trait)+';font-weight:800">'+esc(HP.traitText(r.trait))+'</span>':'';
 let h='<div class="pn"><h3><span>'+esc(r.name)+'</span><button class="x" data-a="close" aria-label="ปิด">✕</button></h3><div class="sub">ถนัด <b style="color:#ffd24a">★ '+esc(JN(r.job))+' เวล '+r.lv+'</b>'+(tr?' · '+tr:'')+' · งานที่สั่ง: <b>'+esc(JN(r.task))+'</b></div>';
 if(HP.fat){const f=Math.round(r.fat||0);h+='<div class="sub">'+(r.rest?'😴 กำลังพัก':r.out?'💪 ทำงาน':'🛏 พักในกรง')+' · ความเหนื่อย '+f+'%</div><div class="fat'+(f>=70?' hi':'')+'"><i style="width:'+f+'%"></i></div>'}
 h+='<div class="row">';
 if(r.out){h+='<button class="b pri" data-a="recall">เรียกกลับ</button>'}
 else{const lim=HP.limit(),n=outCount();h+='<button class="b pri" data-a="send"'+(c?'':' disabled')+'>ปล่อยออกมาทำงาน</button>';if(c)h+='<button class="b" data-a="bag">เก็บเข้ากระเป๋า</button>';h+='<div class="hint" style="width:100%">ลานนี้มีผู้ช่วยทำงานได้พร้อมกัน '+lim+' ตัว (ตอนนี้ '+n+')</div>'}
 h+='</div><div class="hint">เลือกงาน · ดาว ★ คืองานถนัด</div><div class="row">';
 for(const j of JOBS){const ok=stationOk(j)||(j==='cooking'&&false),dis=(j==='weapon')||!ok&&j!=='cooking'?true:false;const cookingOk=j==='cooking';const dd=j==='weapon'?true:(!ok);h+='<button class="b'+(r.task===j?' on':'')+'" data-a="job" data-j="'+j+'"'+(dd?' disabled':'')+'>'+(r.job===j?'★ ':'')+esc(JN(j))+'</button>'}
 h+='</div>';
 for(const j of JOBS)if(!stationOk(j))h+='<div class="hint">'+esc(JN(j))+': '+esc(needTxt[j])+'</div>';
 if(sameJobWarn(r,r.task)&&r.out)h+='<div class="warn">⚠ มีผู้ช่วยตัวอื่นทำงานนี้อยู่แล้ว (โบนัสนับเฉพาะตัวที่เก่งที่สุด)</div>';
 if(r.task==='cooking'){const qm=queueMax(r);h+='<div class="hint">คิวทำอาหาร ('+(r.queue||[]).length+'/'+qm+') · แตะสูตรเพื่อเพิ่ม</div><div class="qrow">';try{for(const rc of COOK.recipes){const can=canMakeRecipe(rc);h+='<button class="b" data-a="q" data-r="'+rc.id+'"'+((r.queue||[]).length>=qm?' disabled':'')+'>'+esc((ITEMS[rc.out]||{}).n||rc.id)+' '+HP.cfg.cook.times[rc.id]+'s'+(can?'':' ✖')+'</button>'}}catch(_){}h+='<button class="b dng" data-a="qc">ล้างคิว</button></div>';if(r.cook)h+='<div class="hint">กำลังทำ: '+esc((ITEMS[(recipeById(r.cook.rid)||{}).out]||{}).n||r.cook.rid)+' '+Math.round(r.cook.t)+'/'+Math.round(r.cook.total)+' วิ</div>'}
 h+='<div class="row" style="margin-top:10px"><button class="b dng" data-a="free">ปล่อยคืนธรรมชาติ</button></div></div>';
 menu.innerHTML=h}
menu.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b){if(e.target===menu)closeMenu();return}if(b.disabled)return;const r=recOf(menuFor),a=b.dataset.a;try{
 if(a==='close')closeMenu();
 else if(a==='recall'&&r){HP.recall(r.id)}
 else if(a==='send'&&r){HP.send(r.id)}
 else if(a==='bag'&&r){HP.toBox(r.id);closeMenu()}
 else if(a==='job'&&r){HP.setTask(r.id,b.dataset.j)}
 else if(a==='q'&&r){if((r.queue=r.queue||[]).length<queueMax(r))r.queue.push(b.dataset.r);try{HS.save()}catch(_){}}
 else if(a==='qc'&&r){r.queue=[]}
 else if(a==='free'&&r){askFree(r.id)}
 renderMenu()}catch(er){ERR('menu',er)}});
HP.recall=id=>{const r=recOf(id);if(!r||!r.out)return false;r.out=false;r.tg=null;const E=ENT[id];if(E){E.tg=null}try{HS.save()}catch(_){}return true};
HP.send=id=>{const r=recOf(id);if(!r)return {ok:false};const c=cageOf(r);if(!c){say('วางกรงที่ลานก่อน',true);return {ok:false,why:'nocage'}}if(r.out)return {ok:true};if(outCount()>=HP.limit()){say('ลานนี้ให้ผู้ช่วยทำงานพร้อมกันได้ '+HP.limit()+' ตัวเท่านั้น (ลานเลเวลสูงขึ้นได้เพิ่ม)',true);return {ok:false,why:'limit'}}
 r.out=true;const E=entFor(r);if(E){E.x=c.x;E.y=c.y+22;E.tg=null}try{HS.save()}catch(_){}if(sameJobWarn(r,r.task))say('มีผู้ช่วยอีกตัวทำงานนี้อยู่แล้ว (โบนัสนับเฉพาะตัวที่เก่งที่สุด)',false);return {ok:true}};
HP.setTask=(id,j)=>{const r=recOf(id);if(!r||!JOBS.includes(j))return {ok:false};if(j==='weapon'){say('ยังไม่มีโต๊ะคราฟต์อาวุธ',true);return {ok:false,why:'weapon'}}if(!stationOk(j)){say(needTxt[j],true);return {ok:false,why:'station'}}r.task=j;r.fishT=0;if(j!=='cooking')r.cook=r.cook&&false;const E=ENT[id];if(E){E.tg=null;E.ctx.at=null}try{HS.save()}catch(_){}return {ok:true}};
HP.toBox=id=>{const r=recOf(id);if(!r)return false;const c=cageOf(r);if(!c)return false;r.out=false;const S=S0();try{const i=S.placed.indexOf(c);if(i>=0)S.placed.splice(i,1)}catch(_){}r.cage=null;syncCages();try{HS.build.syncDec();HS.save()}catch(_){}say('เก็บกรงเข้าคลังของแต่งบ้านแล้ว',false);return true};
function askFree(id){const r=recOf(id);if(!r)return;conf.innerHTML='<div class="pn"><div style="font-size:16px;font-weight:800;color:#ffb0a0">ปล่อยคืนธรรมชาติ?</div><div style="margin-top:6px">'+esc(r.name)+' (★ '+esc(JN(r.job))+' เวล '+r.lv+') จะจากไปถาวร'+(HP.hm?'':' พร้อมกรง')+' · ไม่ได้อะไรคืน</div><div class="row"><button data-a="no">ยกเลิก</button><button class="go" data-a="yes">ปล่อยไป</button></div></div>';conf.dataset.id=id;conf.classList.add('in')}
conf.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b){if(e.target===conf)conf.classList.remove('in');return}if(b.dataset.a==='yes')HP.release(conf.dataset.id);conf.classList.remove('in');renderMenu()});
HP.askFree=askFree;HP.release=id=>{const h=hs(),i=h.list.findIndex(r=>r.id===id);if(i<0)return false;const r=h.list[i],c=cageOf(r),S=S0();if(c){try{const k=S.placed.indexOf(c);if(k>=0)S.placed.splice(k,1)}catch(_){}}h.list.splice(i,1);const E=ENT[id];if(E&&E.prop){const k=PROPS.indexOf(E.prop);if(k>=0)PROPS.splice(k,1)}delete ENT[id];syncCages();try{HS.build.syncDec();HS.save()}catch(_){}say('ปล่อย '+r.name+' คืนธรรมชาติแล้ว',false);if(menuFor===id)closeMenu();return true};
/* prompt + F + tap on the cage / helper */
function nearCage(){try{if(G.zone!==HS.ZID||HS.roomOn||G.state!=='play'||!P||P.dead||HS.busy||HS.build.on||G.win||G.interact)return null;let best=null,bd=1e9;const d0=HS.items.helperCage;for(const o of placedCages()){const Q=HS.build.poly(d0,o.x,o.y,o.f);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of Q){x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1])}const fx=P.x,fy=P.y+10,dx=Math.max(x0-fx,0,fx-x1),dy=Math.max(y0-fy,0,fy-y1),d=Math.hypot(dx,dy*1.4);if(d<bd){bd=d;best=o}}return best&&bd<58?best:null}catch(_){return null}}
HP.nearCage=nearCage;
const recOfCage=o=>hs().list.find(r=>r.cage===o.uid)||null;
{const kh=e=>{try{if(menu.classList.contains('in')){if(e.key==='Escape'){if(conf.classList.contains('in'))conf.classList.remove('in');else closeMenu();e.stopImmediatePropagation();e.preventDefault();return true}return false}
  if(HP.aim&&(e.key==='f'||e.key==='F')&&!e.repeat){HP.throwBall();e.stopImmediatePropagation();e.preventDefault();return true}
  if(HP.aim&&e.key==='Escape'){HP.cancelAim();e.stopImmediatePropagation();e.preventDefault();return true}
  if((e.key==='f'||e.key==='F')&&!e.repeat){const o=nearCage();if(o){const r=recOfCage(o);if(r){openMenu(r.id);e.stopImmediatePropagation();e.preventDefault();return true}}}}catch(er){ERR('key',er)}return false};if(window.__EK)window.__EK.unshift(kh);else addEventListener('keydown',e=>{kh(e)},true)}
pr.addEventListener('click',e=>{e.stopPropagation();const o=nearCage();if(o){const r=recOfCage(o);if(r)openMenu(r.id)}});
document.addEventListener('pointerdown',e=>{try{if(!HP.on||G.state!=='play'||G.zone!==HS.ZID||HS.roomOn||HS.build.on||G.win)return;const t=e.target;if(t.closest&&t.closest('#hpMenu,#hpConfirm,#hpPrompt,#hBox,#hAct,#hBuildBtn,#houseDown,#houseGm,.mbtn,#bar,#tSkills,#swin,#hStore,#ftOv,#fsBar,#mm2'))return;const [wx,wy]=s2w(e.clientX,e.clientY);
  for(const r of (HP.hm?[]:hs().list)){if(!r.out)continue;const E=ENT[r.id];if(E&&Math.hypot(E.x-wx,(E.y-(E.en.sz||20)*.9)-wy)<(E.en.sz||20)*1.3+14){e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();openMenu(r.id);return}}
  const o=HS.build.itemAt(wx,wy);if(o&&o.id==='helperCage'){const r=recOfCage(o);if(r&&Math.hypot(o.x-P.x,o.y-P.y)<340){e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();openMenu(r.id)}else if(!r)say('กรงนี้ว่างอยู่',true);else say('เดินเข้าไปใกล้กรงก่อน',true)}}catch(er){ERR('tap',er)}},true);
/* storage: list of the helpers waiting in the housing storage (release for good / info) */
function storageHook(){try{const el=document.getElementById('hStore');if(!el)return false;if(el._hp)return true;el._hp=1;const mo=new MutationObserver(()=>{try{const sh=el.querySelector('.sh');if(sh&&!sh.querySelector('[data-hp]')){const n=HP.hm?0:hs().list.filter(r=>!r.cage).length;if(!n)return;const b=document.createElement('button');b.type='button';b.dataset.hp='1';b.textContent='🐾 ผู้ช่วยในกรง ('+n+')';b.style.cssText='margin-left:6px;padding:4px 8px;border-radius:9px;border:1px solid #6fd0ff;background:#12303a;color:#cfefff;cursor:pointer;font-size:11px';b.addEventListener('click',ev=>{ev.stopPropagation();const l=hs().list.filter(r=>!r.cage);if(l[0])openMenu(l[0].id)});sh.insertBefore(b,sh.querySelector('.x'))}}catch(_){}});mo.observe(el,{childList:true,subtree:true});return true}catch(_){return false}}
{let n=0;const iv=setInterval(()=>{if(storageHook()||++n>60)clearInterval(iv)},1000)}
/* ---------------- loop hooks ---------------- */
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{if(HP.on){tickCapture(dt);tick(dt);const o=nearCage();const v=o&&!menu.classList.contains('in')?'block':'none';if(pr.style.display!==v)pr.style.display=v;if(HP.aim&&!canAim())HP.cancelAim();if(G.zone===HS.ZID&&HS.build&&HS.build.on&&menu.classList.contains('in'))closeMenu()}}catch(e){ERR('tick',e)}return r}}
try{const _o=drawEditorOverlay;drawEditorOverlay=function(){const r=_o.apply(this,arguments);try{if(HP.on)drawCapture(ctx)}catch(e){ERR('drawCap',e)}return r}}catch(e){ERR('hook overlay',e)}
/* GM (only with ?gm=on) */
if(HP.gm){let n=0;const iv=setInterval(()=>{try{const gm=document.getElementById('houseGm');if(gm&&!gm.dataset.hp){gm.dataset.hp='1';const mk=(t,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.style.cssText='font-size:11px;margin:1px;padding:2px 5px';for(const ev of ['pointerdown','mousedown','touchstart'])b.addEventListener(ev,e=>e.stopPropagation());b.addEventListener('click',e=>{e.stopPropagation();fn()});gm.appendChild(b)};mk('📖 GM: หนังสือผนึก ×10',()=>{addItem({id:'soulBook',q:10});say('GM: ได้หนังสือผนึก ×10')});mk('🐾 GM: ผู้ช่วยสุ่ม ×1',()=>{const ids=Object.keys(MOBS).filter(k=>!MOBS[k].boss&&!MOBS[k].retired&&!/^(raid_|gb_|ge_|gp_|dev|c182|m10ref)/.test(k));newRec(ids[Math.floor(rnd()*ids.length)],false,1);say('GM: ได้ผู้ช่วยในกรง')});clearInterval(iv)}else if(++n>60)clearInterval(iv)}catch(_){clearInterval(iv)}},1000)}
regItems();setTimeout(regItems,1500);setTimeout(regItems,6000);{let n=0;const iv=setInterval(()=>{if(addGoods()||++n>80)clearInterval(iv)},500)}
/* old-save / flag: parked cages are handled by the build's sanitize patch; make sure the records exist after load */
setTimeout(()=>{try{if(HP.on&&HS&&HS.on)syncCages()}catch(_){}},1500);
HP.cageDrawPlaceholder=FR.propDraw;window.__HELPER_DRAW=(g,f,d)=>{try{FR.propDraw(g,f,d)}catch(e){ERR('cage draw',e)}};
/* cooking takes TIME (owner order): the hero's own cooking window uses the recipe's cook time from the Balance table instead of the flat 2 s (the helper job uses the same table, shortened by its strong job) */
try{const C=window.COOK;if(C&&C.cfg){let base=C.cfg.COOK_SEC;Object.defineProperty(C.cfg,'COOK_SEC',{configurable:true,get(){try{const sel=document.querySelector('#cookWin .rw.sel'),i=sel?+sel.dataset.i:0,rc=C.recipes[i];return (rc&&HP.cfg.cook.times[rc.id])||base}catch(_){return base}},set(v){base=v}})}}catch(e){ERR('cook time',e)}
/* fishing: bite wait 6-12 s (owner decision 21 Nov 12:48 UTC; was 2-6 s) */
try{if(window.__FISHING&&__FISHING.cfg){__FISHING.cfg.waitMin=6;__FISHING.cfg.waitMax=12}}catch(e){ERR('fish cfg',e)}
HP.ready=true;
})();
