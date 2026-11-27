
/* ---- candidate_sword_atk5_r18: p223 r9 Sword Skill 1 logic (dash -> rising 150% -> downward 150% -> recover; H3-H5 removed) ---- */
/* p223 r9 (candidate_sword_atk3_r2, user 20:17): Skill 1 = dash -> rising slash (150%) -> downward slash (150%) -> recover. The spin H3-H5 (hits, FX, damage, wind-up, hit-stop,
   camera shake) is removed. Total damage unchanged 300% of one basic swing = 2 hits x 150%, ONE cast context, MP/CD charged once, lock / dash / follow-the-flung-target / collisions unchanged.
   The clip jumps from the end of the downward slash (f44) to the recovery frames (f68..79) through a short cross-fade (the poses match: crouched, blade low in front);
   the end time follows the new clip (1.63 s, was 2.41 s). Hit times H1 .699 / H2 .999 are unchanged.
   p223 r6 (candidate_sword_sk1_anim_r4, user 23:17): damage radius of all 5 hits −30% (95/100/120/120/130 → 66.5/70/84/84/91). Nothing else changed.
   p223 r5 (candidate_sword_sk1_anim_r2, user 22:19): (1) the lock is now the ONE central lock of p225 (window.TLOCK) — this file keeps no
   lock of its own (no second pointer listener, no second ring); no lock when J is pressed → auto-pick inside useRange with a clear line.
   (2) H5 weight: a short wind-up before H5 (~0.12 s, the clip slows then whips — no hard stop) and a 0.05 s hit-stop when H5 really hits.
   ONE skill clock: anim time = real time − hit-stop; the frame map, the FX and every hit / end read anim time (SK1.animTime / SK1.frameAt).
   Hits 1–4 unchanged; H5 .8323 → 1.9423, end 2.30 → 2.41 (+0.05 hit-stop when it lands). Damage, areas, MP, cooldown unchanged.
   Light camera shake only on the H5 hit (the game's shake(), world only — the DOM UI never shakes; p226 can switch it off).
   p223 r3 (candidate_sword_sk1_logic_r3, user 13:54): damage base fixed. ONE C182 cast context per cast (opened at the accepted cast, used by
   all 5 hits). Base = the real basic swing of the equipped weapon: D().weapons[w].actionCoef × Σweights (sword 4.0 × 1.00). Hit i coef =
   base × mul[i] (0.50/0.50/0.60/0.60/0.80 = 3.00 × basic, pre-defence; defence once per hit inside K.resolveHit). Inside the context the
   game's own rules apply: lifesteal per-cast cap (existing default 10% MaxHP), proc roll once per target per cast, ≤5 hits per target.
   r2 is kept as candidate_sword_sk1_logic_r2 — WRONG damage base (legacy procCoefScale path, 0.45× a basic swing): not for balance.
   p223 r2 (candidate_sword_sk1_logic_r2, user 10:56): + real target lock (click/tap a monster, stable enemy id, ring under its feet, lock button
   for touch), + damage in TEST mode (300% of one normal swing split 0.50/0.50/0.60/0.60/0.80 through the game's own damage formula per hit).
   p223 — Sword Skill 1 LOGIC ONLY (candidate_sword_sk1_logic_r1, ChatGPT brief via user 11 Oct 2026 10:37). Replaces p222 (m37 test skill).
   Scope: lock target → dash → brake → hits 1–5 → recover. No FX, no knockback, no hit-stop, no new art in the normal game.
   Opt-in TEST mode only (TEST tray button "Sword Skill 1 · logic test", or key J while the test mode is on). Normal game: the skill does nothing
   and nothing is written to the save (no slot / skill entry is added; an old m37 test save that already holds the skill is left as it is).
   Existing systems used (nothing duplicated):
     targeting  = the game's aimPoint() (autoplay target / touch → nearest / mouse → cursor). The game has NO lock-on system: the "locked"
                  target is the living monster under that aim point (within CFG.pick of it). No aimed monster → refused with a reason;
                  never picks a random / nearest one by itself.
     movement   = the hero is moved in short steps (≤ CFG.step px) and every step is checked with the game's blocked() (circles + shapes,
                  edge ring, buildings); the game's own collide() still runs after it. Zone bounds as the game clamps them.
     state lock = P.dash (the engine then skips walking, facing and basic attack); other skills are refused while it runs.
     damage     = the game's hitEnemy() — DISABLED: Sword Skill 1 has no decided damage (m37 numbers were Claude's test guesses, never
                  approved), so hits are detected and logged only, HP is not reduced (CFG.damage = null).
     cost       = P.mp / P.cds like every skill, taken ONCE per cast after the target check (CFG.cost — m37 test placeholder, not approved).
   Timing runs on real time (dt), never on frame count; a long frame that jumps past several hit times fires each of them in order.
   Hit registry key = castId:hitId:enemyId → one hit per enemy per hit, max 5 per cast. No hit through walls (line checked with blocked()).
   Debug window.__SK1 (config, state, log, test()). */
(function(){'use strict';
const SK1=window.__SK1={ver:'p223-r9',debugDraw:true,err:null,test:false,log:[],casts:0,refused:[],state:null};
if(!window.TLOCK||TLOCK.err||typeof castSkill!=='function'||typeof update!=='function'||typeof blocked!=='function'||typeof aimPoint!=='function'){SK1.err='hooks missing';return;}
/* ---------- the one config (times in seconds from the start of the skill; distances in world px) ---------- */
const CFG=SK1.cfg={
  id:'wsSword1',
  useRange:340,         // max distance hero → locked target's edge to START the skill
  lockRange:420,        // a lock is kept while the target's edge stays within this (beyond it → unlocked)
  pickR:12,             // click / tap must land within the monster's body (sz) + this, measured at its body centre
  stopGap:10,           // dash stops at heroR + targetR + stopGap (blade reach starts here)
  catchUp:90,           // r8: one extra step (px) after the brake when the target was flung out of reach
  maxDash:330,          // never travel further than this
  turnDegPerSec:220,    // max steering while dashing (no snapping, no endless chase)
  step:6,               // movement sub-step (px) for the collision check — no tunnelling at low fps
  t:{prep:.17,dash:.23,brake:.20,hits:[.699,.999],end:1.63},   // r5: H5 after the wind-up (anim time; frame map below)
  // r9 frame map (anim time -> r12 source frame, 30 fps): f11..f44 linear (H1 f32 at .699, H2 f41 at .999), a short cross-fade f44 -> f68, then the recovery f68..f79 (slightly slower than 30 fps, no hard stop).
  seq:[{t0:0,t1:1.1,f0:11,f1:44},{t0:1.1,t1:1.18,xf:1,fa:44,fb:68},{t0:1.18,t1:1.63,f0:68,f1:79}],
  hitStop:null,   // r9: no hit-stop (it belonged to H5)
  hits:[{id:1,area:'front',r:44.5,halfDeg:60,label:'rising slash'},
        {id:2,area:'front',r:42,halfDeg:55,label:'downward slash'}],
  // damage (user 10:56, TEST mode only): total = 300% of ONE normal basic swing (weapon mult, non-finisher), split per hit.
  // Each hit goes through the game's own hitEnemy() with m = weaponMult × mul[i] (pre-defence base) → defence, crit, element, size,
  // on-hit effects are applied by the game once PER HIT. Nothing after defence is ever multiplied again.
  damage:{total:3.0,mul:[1.5,1.5]},
  cost:{mp:18,cd:8,placeholder:true},   // m37 test placeholder (not approved) — only here so the once-per-cast rule can be tested
};
if(typeof SK==='object'&&!SK[CFG.id])SK[CFG.id]={id:CFG.id,name:'Rending Rush',type:'wsrush',cls:'novice',idx:0,cd:CFG.cost.cd,mp:CFG.cost.mp,m:0,dt:'phys',r:0,range:CFG.useRange,th:'spirit',glyph:'⚔'};   // kept so an m37 test save that holds it is not refunded as an unknown skill
/* ---------- helpers ---------- */
const eid=e=>window.TLOCK.eid(e);
const dist=(a,b,c,d)=>Math.hypot(c-a,d-b);
const ang=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
function los(x0,y0,x1,y1,stopShort){const L=Math.hypot(x1-x0,y1-y0),n=Math.max(1,Math.ceil((L-stopShort)/8));for(let i=1;i<=n;i++){const u=Math.min(1,(i*8)/L);if(u*L>L-stopShort)break;if(blocked(x0+(x1-x0)*u,y0+(y1-y0)*u,2))return false;}return true;}
const pr=()=>(P.r||14);
let S=null,castN=0;
function refuse(why){SK1.refused.push({t:+time.toFixed(2),why});if(SK1.refused.length>30)SK1.refused.shift();try{textAt(P.x,P.y-62,'Sword Skill 1: '+why,'#ffb4a8',13);}catch(e){}return false;}
/* ---------- target: the central lock of p225 (window.TLOCK) ---------- */
const TL=window.TLOCK,LOCK=SK1.lock=TL;
const alive=TL.alive,edge=TL.edge;
SK1.lockButton=TL.button;SK1.tapLock=TL.tap;SK1.pickAt=TL.pickAt;
function findLocked(){
  TL.check();
  let best=TL.e;
  if(!best){best=TL.autoPick(CFG.useRange);if(!best)return {e:null,why:'ไม่มีมอนในระยะใช้สกิล (คลิก/แตะมอนเพื่อล็อก)'};TL.set(best,'auto','เลือกอัตโนมัติ (สกิล)');}
  const d=edge(best);if(d>CFG.useRange)return {e:null,why:`เป้าไกลเกินระยะใช้สกิล (${Math.round(d)} > ${CFG.useRange})`};
  if(!los(P.x,P.y,best.x,best.y,(best.sz||16)))return {e:null,why:'มีสิ่งกีดขวางระหว่างทาง'};
  return {e:best};}
/* ---------- cast ---------- */
function start(){
  if(!SK1.test)return refuse('ใช้ได้เฉพาะโหมดทดสอบ');
  if(!P||P.dead||G.state!=='play'||G.edit)return refuse('ใช้ไม่ได้ตอนนี้');
  if(S)return refuse('สกิลกำลังทำงาน');                      // spam: no second combo, no second cost
  if((P.cds[CFG.id]||0)>0)return refuse(`คูลดาวน์ ${P.cds[CFG.id].toFixed(1)} วิ`);
  if(P.dash||P.casting)return refuse('กำลังทำท่าอื่น');
  const L=findLocked();if(!L.e)return refuse(L.why);              // target first, cost after
  if(P.mp<CFG.cost.mp)return refuse('MP ไม่พอ');
  P.mp-=CFG.cost.mp;P.cds[CFG.id]=CFG.cost.cd;                    // once per cast; not refunded later
  const ctx=CFG.damage?castCtx():null;
  const e=L.e,a=Math.atan2(e.y-P.y,e.x-P.x),stopD=pr()+(e.sz||16)+CFG.stopGap;
  const need=Math.max(0,Math.min(CFG.maxDash,dist(P.x,P.y,e.x,e.y)-stopD));
  S={id:++castN,t:0,zone:G.zone,tgt:e,tgtId:eid(e),face:a,sx:P.x,sy:P.y,need,trav:0,stopD,blockedAt:null,fired:new Set(),reg:new Set(),
     ctx,state:'prep',ended:null,path:[[P.x,P.y]],planStop:[P.x+Math.cos(a)*need,P.y+Math.sin(a)*need],hitsDone:[],tgtLost:false};
  P.face=a;P.dash={vx:0,vy:0,t:99,sk1:1,hit:new Set()};
  SK1.casts++;SK1.state=S;SK1.log.push({cast:S.id,t0:+time.toFixed(2),target:S.tgtId,need:Math.round(need)});
  return true;}
{const o=castSkill;castSkill=function(id){if(id===CFG.id)return start();if(S)return false;return o.apply(this,arguments);};}
SK1.cast=start;
/* ---------- one skill clock: anim time (real time minus hit-stop) and the frame map ---------- */
function animTime(s){if(!s)return 0;if(s.hsT0==null)return s.t;return s.t-Math.max(0,Math.min(s.hs,s.t-s.hsT0));}
function segOf(ta){const Q=CFG.seq;for(let i=0;i<Q.length;i++)if(ta<Q[i].t1||i===Q.length-1)return Q[i];return Q[Q.length-1];}
function fmapT(ta){const q=segOf(ta);if(q.xf)return q.fa;const u=Math.max(0,Math.min(1,(ta-q.t0)/(q.t1-q.t0)));return q.f0+(q.f1-q.f0)*u;}
function xfAt(s){const q=segOf(animTime(s));if(!q.xf)return null;const u=Math.max(0,Math.min(1,(animTime(s)-q.t0)/(q.t1-q.t0)));return {a:q.fa,b:q.fb,u};}
SK1.animTime=animTime;SK1.fmap=fmapT;SK1.xfAt=xfAt;SK1.frameAt=s=>fmapT(animTime(s));
/* ---------- per frame (real time in, anim time for everything the player sees / gets hit by) ---------- */
const easeOut=u=>1-Math.pow(1-Math.max(0,Math.min(1,u)),3);
function finish(why){if(!S)return;S.ended=why;SK1.log.push({cast:S.id,end:why,t:+S.t.toFixed(3),hits:S.hitsDone.map(h=>[h.id,h.list.length])});
  if(P&&P.dash&&P.dash.sk1)P.dash=null;if(P){P.vx=0;P.vy=0;}SK1.last=S;S=null;SK1.state=null;}
function moveTo(dx,dy){   // sub-stepped move with the game's collision; returns true if stopped by an obstacle
  const L=Math.hypot(dx,dy);if(L<1e-6)return false;const n=Math.ceil(L/CFG.step),ux=dx/n,uy=dy/n,r=pr()*.8,Z=ZONES[G.zone];
  for(let i=0;i<n;i++){const nx=P.x+ux,ny=P.y+uy;
    if(blocked(nx,ny,r)||nx<30||ny<30||(Z&&(nx>Z.w-30||ny>Z.h-30)))return true;
    P.x=nx;P.y=ny;S.trav+=Math.hypot(ux,uy);}
  return false;}
function inArea(h,e){
  const R=h.r+(e.sz||16),d=dist(P.x,P.y,e.x,e.y);if(d>R)return false;
  if(h.area==='front'&&d>(e.sz||16)+pr()){const da=Math.abs(ang(S.face,Math.atan2(e.y-P.y,e.x-P.x)));if(da>h.halfDeg*Math.PI/180)return false;}
  return los(P.x,P.y,e.x,e.y,(e.sz||16));}
/* r3: one C182 cast context per cast — base from the real basic swing of the equipped weapon */
function castCtx(){
  const A=window.C182&&C182.api;if(!A||!A.ctxFor){SK1.err='ctx: C182 missing';return null;}
  const wt=P.weapon&&P.weapon.t,wd=A.D().weapons&&A.D().weapons[wt],W_=WEAPONS[wt]||{};
  if(!wd){SK1.err='ctx: no weapon data '+wt;return null;}
  const basic=wd.actionCoef*wd.weights.reduce((a,b)=>a+b,0);   // what one real basic swing delivers (sum of its sub-hit coefs)
  const def={id:CFG.id,mode:'native',coefTotal:basic,flatTotal:0,weights:CFG.damage.mul.map(()=>1),maxTargets:99,targeting:'around',element:'Neutral',range:CFG.useRange};
  const c=A.ctxFor('skill',CFG.id,def,{dt:W_.magic?'mag':'phys',lvScale:1,m0:1,reach:CFG.useRange+200,cdId:CFG.id});
  c.sk1={wt,basic,mul:CFG.damage.mul.slice()};return c;}
function fireHit(i){
  const h=CFG.hits[i],list=[];
  for(const e of enemies){if(e.dead||!(e.hp>0))continue;const key=S.id+':'+h.id+':'+eid(e);if(S.reg.has(key))continue;
    if(!inArea(h,e))continue;S.reg.add(key);list.push(eid(e));
    if(CFG.damage&&S.ctx){const ctx=S.ctx,m=CFG.damage.mul[i],prev=C182.cur;let pl;try{pl=wpal();}catch(_){}
        const hp0=e.hp;C182.cur=ctx;   // k = m/m0 = mul[i] → coef = basic × mul[i]
        try{hitEnemy(e,m,{dt:ctx.dt,pl,ctx,b3:i});}catch(err){SK1.err='dmg '+err.message;}finally{C182.cur=prev;}
        S.dmg=S.dmg||[];S.dmg.push({hit:h.id,id:eid(e),m:+m.toFixed(3),coef:+(ctx.def.coefTotal*m).toFixed(3),cast:ctx.seq,hpLoss:Math.round(hp0-e.hp)});}
    else{try{textAt(e.x,e.y-(e.sz||16)*2.2,'HIT '+h.id,'#ffe08a',13,{life:.6});}catch(err){}}}
  const HS=CFG.hitStop;if(HS&&i===HS.hit&&list.length&&S.hsT0==null){   // hit-stop: the anim clock is held AT the H5 time (marker frame f66) for HS.dur
    S.hsT0=S.t-Math.max(0,(S.ta||0)-CFG.t.hits[i]);S.hs=HS.dur;S.hsHit=h.id;try{shake(HS.shake);}catch(e){}SK1.lastHS={cast:S.id,t:+S.t.toFixed(3),n:list.length};}
  S.hitsDone.push({id:h.id,t:+animTime(S).toFixed(3),real:+S.t.toFixed(3),x:Math.round(P.x),y:Math.round(P.y),face:+S.face.toFixed(3),list,area:h.area,r:h.r,half:h.halfDeg||null});
  S.flash=S.flash||[];S.flash.push({i,t0:animTime(S),x:P.x,y:P.y,face:S.face});}
function step(dt){
  if(!S)return;
  if(!P||P.dead){finish('hero died');return;}
  if(G.zone!==S.zone||G.state!=='play'){finish('left the map');return;}
  if(!P.dash||!P.dash.sk1)P.dash={vx:0,vy:0,t:99,sk1:1,hit:new Set()};
  P.dash.vx=0;P.dash.vy=0;P.dash.t=99;
  const T=CFG.t,t0=animTime(S);S.t+=dt;const t1=animTime(S);S.ta=t1;if(t1<=t0&&S.hsT0!=null){P.face=S.face;return;}   // hit-stop: clock held
  const tg=S.tgt,alive=tg&&!tg.dead&&tg.hp>0&&enemies.includes(tg);
  if(!alive&&!S.tgtLost){S.tgtLost=true;S.lostAt=+t1.toFixed(3);}
  // --- movement: dash + brake share one ease-out curve (≈90% during the dash, the rest while braking) ---
  const mv0=T.prep,mv1=T.prep+T.dash+T.brake;
  if(t1>mv0&&t0<mv1&&!S.blockedAt&&!S.stopped){
    if(alive&&t0<T.prep+T.dash){const want=Math.atan2(tg.y-P.y,tg.x-P.x),mx=CFG.turnDegPerSec*Math.PI/180*dt,d=ang(S.face,want);S.face+=Math.max(-mx,Math.min(mx,d));}   // limited steering, only while dashing
    if(!alive&&t1>=T.prep&&t1<T.prep+T.dash&&!S.stopped){S.stopped='target lost → brake';}
    const u0=(Math.max(t0,mv0)-mv0)/(mv1-mv0),u1=(Math.min(t1,mv1)-mv0)/(mv1-mv0);
    if(alive)S.need=Math.max(S.need,Math.min(CFG.maxDash,S.trav+Math.max(0,dist(P.x,P.y,tg.x,tg.y)-S.stopD)));   // r8: the target was knocked away while dashing → the dash follows it (never beyond maxDash)
    let ds=S.need*(easeOut(u1)-easeOut(u0));
    if(alive){const room=dist(P.x,P.y,tg.x,tg.y)-S.stopD;if(room<=0)ds=0;else ds=Math.min(ds,room);}
    if(S.stopped)ds=0;
    if(ds>0&&moveTo(Math.cos(S.face)*ds,Math.sin(S.face)*ds)){S.blockedAt=+t1.toFixed(3);}
    S.path.push([P.x,P.y]);}
  // --- state label ---
  S.state=t1<T.prep?'prep':t1<T.prep+T.dash?'dash':t1<mv1?'brake':'combo';
  // after the brake: is the target still in blade reach? (blocked dash / lost target → end safely, no new target)
  if(!S.checked&&(t1>=mv1||S.blockedAt)){
    const reach=CFG.hits[0].r+(alive?(tg.sz||16):0);
    if(S.blockedAt&&(!alive||dist(P.x,P.y,tg.x,tg.y)>reach)){finish('blocked by obstacle, target out of reach');return;}
    if(t1>=mv1){S.checked=true;
      if(!alive&&S.lostAt<mv1){finish('target lost before the slash');return;}
      if(alive&&dist(P.x,P.y,tg.x,tg.y)>reach&&!S.blockedAt){   // r8: still out of blade reach (target flung during the dash) → one short catch-up step toward it, then re-check
        const dd=dist(P.x,P.y,tg.x,tg.y),st=Math.min(CFG.catchUp,Math.max(0,dd-S.stopD)),an=Math.atan2(tg.y-P.y,tg.x-P.x);if(st>0&&!moveTo(Math.cos(an)*st,Math.sin(an)*st)){S.catchUp=Math.round(st);S.face=an;}}
      if(alive&&dist(P.x,P.y,tg.x,tg.y)>reach){finish('target out of reach after the dash');return;}
      if(alive)S.face=Math.atan2(tg.y-P.y,tg.x-P.x);}}
  // --- hits on real time; every hit time crossed this frame fires, in order ---
  for(let i=0;i<T.hits.length;i++){if(S.fired.has(i))continue;if(t1>=T.hits[i]){S.fired.add(i);fireHit(i);S.state='hit'+(i+1);}}
  if(S.fired.size===T.hits.length&&t1<T.end)S.state=t1-T.hits[T.hits.length-1]<.08?'hit2':'recover';
  P.face=S.face;
  if(t1>=T.end)finish('done');}
{const o=update;update=function(dt){try{step(dt);}catch(e){SK1.err='step '+e.message;try{finish('error');}catch(_){}}return o.apply(this,arguments);};}
{const o=playerDeath;playerDeath=function(){if(S)finish('hero died');return o.apply(this,arguments);};}
if(typeof loadZone==='function'){const o=loadZone;loadZone=function(){if(S)finish('left the map');return o.apply(this,arguments);};}
/* hero body while the skill runs: the existing clips only (run while moving, ready otherwise) — no temporary skill art */
if(window.HERO3D&&window.__HERO3D){const H=window.HERO3D,D=window.__HERO3D;H.ext=function(now){if(!S)return null;const mv=S.state==='dash'||(S.state==='brake'&&!S.blockedAt);const c=D.clips[mv?'run':'ready'];return [mv?'run':'ready',Math.floor(now*c.fps)%c.n];};}
/* lock ring + target HUD: p225 (central) */
/* ---------- TEST overlay (world) ---------- */
function drawDebug(){
  const s=S||SK1.last;if(!SK1.test||!s||SK1.debugDraw===false)return;/* r4: p224 turns the TEST overlay off while the new animation + FX play */const age=S?0:(time-(s.endT||(s.endT=time)));if(age>2.5)return;
  ctx.save();ctx.globalAlpha=Math.max(0,1-age/2.5);ctx.lineWidth=2;
  ctx.strokeStyle='rgba(255,255,255,.55)';ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(s.sx,s.sy);ctx.lineTo(s.planStop[0],s.planStop[1]);ctx.stroke();ctx.setLineDash([]);   // planned line
  ctx.strokeStyle='#7fe8ff';ctx.beginPath();s.path.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();                                         // real path
  ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(s.planStop[0],s.planStop[1],4,0,6.283);ctx.fill();
  if(s.blockedAt!=null){const p=s.path[s.path.length-1];ctx.strokeStyle='#ff8a3a';ctx.beginPath();ctx.moveTo(p[0]-7,p[1]-7);ctx.lineTo(p[0]+7,p[1]+7);ctx.moveTo(p[0]+7,p[1]-7);ctx.lineTo(p[0]-7,p[1]+7);ctx.stroke();}
  for(const f of (s.flash||[])){const h=CFG.hits[f.i],a=Math.max(0,1-((S?animTime(s):animTime(s)+age)-f.t0)/.45);if(a<=0)continue;
    ctx.globalAlpha=a*.85;ctx.fillStyle=h.area==='front'?'rgba(255,214,90,.22)':'rgba(120,220,255,.18)';ctx.strokeStyle=h.area==='front'?'#ffd65a':'#7fe8ff';
    ctx.beginPath();if(h.area==='front'){const hf=h.halfDeg*Math.PI/180;ctx.moveTo(f.x,f.y);ctx.arc(f.x,f.y,h.r,f.face-hf,f.face+hf);ctx.closePath();}else ctx.arc(f.x,f.y,h.r,0,6.283);ctx.fill();ctx.stroke();
    ctx.fillStyle='#ffffff';ctx.font='bold 13px sans-serif';ctx.fillText('H'+h.id,f.x+Math.cos(f.face)*h.r*.55-8,f.y+Math.sin(f.face)*h.r*.55);}
  ctx.restore();}
if(typeof drawPlayer==='function'){const o=drawPlayer;drawPlayer=function(){const r=o.apply(this,arguments);try{drawDebug();}catch(e){SK1.err='dbg '+e.message;}return r;};}
/* ---------- TEST panel (DOM, test mode only) ---------- */
let panel=null;
function panelHTML(){const s=S||SK1.last;const row=(a,b)=>`<div><span style="color:#9ab">${a}</span> ${b}</div>`;
  const lk=row('ล็อก (กลาง)',TL.e?TL.id+' · '+(TL.src==='auto'?'อัตโนมัติ':'คลิก')+' · ห่าง '+Math.round(edge(TL.e)):'— ('+(TL.why||'ยังไม่เลือก')+')');
  if(!s)return lk+row('สถานะ','พร้อม — คลิก/แตะมอนเพื่อล็อก (หรือปล่อยให้เลือกอัตโนมัติ) แล้วกด J')+row('ปฏิเสธล่าสุด',(SK1.refused.slice(-1)[0]||{}).why||'-');
  return lk+row('cast',s.id)+row('สถานะ',S?s.state:'จบ: '+s.ended)+row('เวลา',animTime(s).toFixed(2)+' วิ'+(s.hsT0!=null?' (+hit-stop '+s.hs.toFixed(2)+')':''))+row('เป้า',s.tgtId+(s.tgtLost?' (หาย/ตาย @'+s.lostAt+')':''))
    +row('พุ่ง',`${Math.round(s.trav)} / ${Math.round(s.need)} px`+(s.blockedAt!=null?` · ชนสิ่งกีดขวาง @${s.blockedAt}`:''))
    +s.hitsDone.map(h=>row('H'+h.id+' @'+h.t,h.list.length?h.list.join(', '):'—')).join('')+row('ดาเมจ',CFG.damage?('ฐานฟันปกติ × '+CFG.damage.mul.join('/')+(s.dmg?' · HP ลด '+s.dmg.reduce((a,b)=>a+b.hpLoss,0):'')):'ปิด')
    +row('ปฏิเสธล่าสุด',(SK1.refused.slice(-1)[0]||{}).why||'-');}
function setTest(on){SK1.test=!!on;
  if(on&&!panel){panel=document.createElement('div');panel.id='sk1Panel';panel.style.cssText='position:fixed;left:10px;top:120px;z-index:60;width:250px;padding:8px 10px;border-radius:10px;background:rgba(8,14,32,.88);border:1px solid #3a5a8a;color:#e8f0ff;font:12px/1.45 sans-serif;pointer-events:auto';
    panel.innerHTML='<b>Sword Skill 1 · logic test</b> <span style="color:#ffd65a">TEST</span><div id="sk1Body"></div><div style="display:flex;gap:6px;margin-top:6px"><button id="sk1Lock" type="button" style="min-height:44px;flex:1">ล็อก / ยกเลิก</button><button id="sk1Use" type="button" style="min-height:44px;flex:1">ใช้สกิล (J)</button></div>';
    document.body.appendChild(panel);panel.querySelector('#sk1Use').addEventListener('click',()=>start());panel.querySelector('#sk1Lock').addEventListener('click',()=>lockButton());
    for(const ev of ['pointerdown','pointerup','mousedown','touchstart','click'])panel.addEventListener(ev,e=>e.stopPropagation());}   // taps on the panel never reach the game
  if(panel)panel.style.display=on?'block':'none';if(!on&&S)finish('test mode off');}   // r5: the central lock is not tied to TEST mode
SK1.setTest=setTest;
setInterval(()=>{try{if(panel&&SK1.test)panel.querySelector('#sk1Body').innerHTML=panelHTML();}catch(e){}},120);
window.addEventListener('keydown',e=>{if(!SK1.test)return;if((e.key==='j'||e.key==='J')&&!e.repeat){const a=document.activeElement;if(a&&/INPUT|TEXTAREA/.test(a.tagName))return;start();}});
setInterval(()=>{try{const row=document.getElementById('hudTrayRow');if(row&&!document.getElementById('sk1Tog')){const b=document.createElement('button');b.type='button';b.className='tbtn';b.id='sk1Tog';row.appendChild(b);
  const lab=()=>{b.textContent='Sword Skill 1 · logic test: '+(SK1.test?'เปิด':'ปิด');};lab();b.addEventListener('click',()=>{setTest(!SK1.test);lab();});}}catch(e){}},700);
try{if(/sk1test/.test(String(location.hash)+String(location.search)))setTest(true);}catch(e){}
})();

