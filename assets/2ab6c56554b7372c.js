
/* ---- candidate_sword_atk5_r18: p231 r7 Sword Skill 2 logic + FX (hit id for the Skill 3 beat register; nothing else changed vs r6) ---- */
/* p231 r7 — Sword Skill 2 "เขี้ยวผ่าศิลา" (candidate_sword_sk2_8dir_r4, TEST only, ALL 8 directions from ONE Action; r7 base). Not merged, not published.
   Spec (user 11 Oct 19:44, WORK_LIST round 39): fast opening slash up -> catch + short wind-up -> slam down releasing a ground blade wave. No dash.
     H1 80 % (frontal fan, close, tied to the sword) at marker H1 f19;  H2 240 % (blade wave) when the wave front reaches a monster.
     total 320 % of the real basic swing base (D().weapons[w].actionCoef × Σweights) before defence, ONE C182 cast context per cast, each monster once per hit.
     MP 22, cooldown 10 s (once per cast, taken after the target check).  Animation = 38 frames (f11..f48) at 30 fps = 1.27 s.
   Wave: starts at the slam point (X_TIP 1.286 m from the hero's start), range = 5.625 × the REAL swing reach (r3 3.75×, r4 5.625× = +50 % each over 2.5×) (TL.reachNow(): WEAPONS.sword.range after p203 halving = 60 → 150 px)
     measured from the hero's end-of-step position, width = one character width (2 × P.r), hits every monster in the corridor once, when the wave FRONT (core edge) reaches the
     monster's body; stops at walls (blocked() march); knock-back = the game's own hitEnemy kb along the wave direction (collide() keeps monsters out of obstacles, bosses ignore it).
   Aim: the p225 central lock (target chosen at the start, direction kept for the whole motion and the wave's travel; no tracking, no re-aim).
   Visuals: hero frames + baked hero-attached FX (aura, H1 / slam crescents, rings) from the Blender render (p230 data, same atlas rules as skill 1);
     the wave sprite (user's reference art, created in chat with imagegen for this work), the curved ribbons, soil dust / clods and the target contact sparks are drawn live (they depend on the wave path and the monsters).
   The hero steps 0.20 m forward over f28–31 (the frames have that travel removed; the logic moves the hero once, with the game's blocked()).
   8 directions (user 22:57): the hero frames / baked FX come from the SAME Action (Pivot turned at render time, no mirroring); the direction is chosen ONCE at the start from the locked target (screen-space 45° sector, like skill 1) and kept; the wave itself travels along the real world angle.
   The wave sprite stays upright (billboard); for leftward travel it is flipped horizontally (art, not the character); N/S use the same right-facing profile (decision flagged to the user).
   Debug: window.__SK2L. */
(function(){'use strict';
const D=window.__SK2D,SK1=window.__SK1,HD=window.__HERO3D,H=window.HERO3D,TL=window.TLOCK;
const L=window.__SK2L={ver:'p231-8dir-r4',err:null,test:false,log:[],refused:[],casts:0,state:null,last:null,debugDraw:false,frames:0,drawn:0,lastHit:null};
if(!D||!SK1||!HD||!H||!TL||TL.err||typeof castSkill!=='function'||typeof update!=='function'||typeof blocked!=='function'||typeof drawParts!=='function'||typeof drawPlayerSprite!=='function'){L.err='hooks missing '+[!D&&'data',!SK1&&'SK1',!HD&&'HERO3D data',!H&&'HERO3D',!TL&&'TLOCK',typeof drawParts!=='function'&&'drawParts',typeof drawPlayerSprite!=='function'&&'drawPlayerSprite'].filter(Boolean).join(',');return;}
const F=HD.frame,K=HD.drawScale,FPS=D.fps,F0=D.f0,N=D.n,AF=D.aff,O=D.origin,WP=D.wavep,MK=D.markers;
const PXM=AF.x[0]*K;                      // world px per render metre (43.3)
const AZ=Math.abs(AF.z[1]),AYy=Math.abs(AF.y[1]),AXx=AF.x[0];
const CFG=L.cfg={id:'wsSword2',useRange:340,waveRange:346,hit1:{f:MK.H1,r:64,halfDeg:70,label:'rising slash'},release:MK.WAVE_RELEASE,rangeMul:5.625,
  damage:{mul:[.80,3.20]},cost:{mp:22,cd:10},kb:100,sector:Math.PI/8,end:N/FPS,step:{dist:D.travel.dist,f0:D.travel.f0,span:D.travel.span},shake:3};
const dist=(a,b,c,d)=>Math.hypot(c-a,d-b),ang=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a)),ss=u=>u<=0?0:u>=1?1:u*u*(3-2*u);
const pr=()=>(P.r||14),eid=e=>TL.eid(e),alive=TL.alive,edge=TL.edge;
const DN=['E','SE','S','SW','W','NW','N','NE'];
const IMG={dirs:{}};for(const n of DN){IMG.dirs[n]={};for(const k of ['hero','back','front']){const im=new Image();im.src=D.dirs[n][k].src;IMG.dirs[n][k]=im;}}
const WV=window.__SK2W;IMG.waves={};for(const n of DN){const im=new Image();im.src=WV.dirs[n].src;IMG.waves[n]=im;}   // r2 (user 00:37): one wave sheet cell per direction (image made in chat for this project) - no flip, no rotation, root anchored
const VFX={};{const V8=window.__SK2V8;for(const k in V8){const V=V8[k];for(const L of ['B','T','E']){const Ly=V[L];Ly.im=Ly.fr.map(u=>{const im=new Image();im.src=u;return im;});}VFX[k]=V;}}   // r5 (user 01:35): all 8 directions - layered animated wave (B = body+gather+shards, T = world-baked trail, E = edge for the hit flare); each direction baked from its own art, nothing rotated
const okI=im=>im&&im.complete&&im.naturalWidth;
const ready=()=>Object.values(VFX).every(V=>['B','T','E'].every(L=>V[L].im.every(okI)))&&DN.every(n=>okI(IMG.waves[n]))&&DN.every(n=>['hero','back','front'].every(k=>okI(IMG.dirs[n][k])));
const dirIdx=g=>{const a=Math.atan2(Math.sin(g),Math.cos(g));return ((Math.round(a/(Math.PI/4))%8)+8)%8;};   // 0 = E ... same order as HERO3D / skill 1
// render-world forward / left-lateral unit vectors of a direction (E = (1,0)/(0,1)); the Pivot theta of the Blender render: E 90, SE 45, S 0 ...
const THETA=[90,45,0,-45,-90,-135,180,135];const FWDV=i=>{const t=THETA[i]*Math.PI/180;return [Math.sin(t),-Math.cos(t)];},LATV=i=>{const t=THETA[i]*Math.PI/180;return [Math.cos(t),Math.sin(t)];};
let S=null,castN=0;
function refuse(why){L.refused.push({t:+time.toFixed(2),why});if(L.refused.length>30)L.refused.shift();try{textAt(P.x,P.y-62,'Sword Skill 2: '+why,'#ffb4a8',13);}catch(e){}return false;}
function los(x0,y0,x1,y1,stopShort){const Ln=Math.hypot(x1-x0,y1-y0),n=Math.max(1,Math.ceil((Ln-stopShort)/8));for(let i=1;i<=n;i++){const u=Math.min(1,(i*8)/Ln);if(u*Ln>Ln-stopShort)break;if(blocked(x0+(x1-x0)*u,y0+(y1-y0)*u,2))return false;}return true;}
/* ---------- target: the central lock (p225) ---------- */
function findLocked(){
  TL.check();let best=TL.e;
  if(!best){best=TL.autoPick(CFG.useRange);if(!best)return {e:null,why:'ไม่มีมอนในระยะใช้สกิล (คลิก/แตะมอนเพื่อล็อก)'};TL.set(best,'auto','เลือกอัตโนมัติ (สกิล 2)');}
  const d=edge(best);if(d>CFG.useRange)return {e:null,why:`เป้าไกลเกินระยะใช้สกิล (${Math.round(d)} > ${CFG.useRange})`};
  if(!los(P.x,P.y,best.x,best.y,(best.sz||16)))return {e:null,why:'มีสิ่งกีดขวางระหว่างทาง'};
  return {e:best};}
const camYaw=()=>{try{return typeof camY==='function'?camY():0;}catch(e){return 0;}};
/* ---------- damage context (same rule as skill 1: base = the real basic swing of the equipped weapon) ---------- */
function castCtx(){
  const A=window.C182&&C182.api;if(!A||!A.ctxFor){L.err='ctx: C182 missing';return null;}
  const wt=P.weapon&&P.weapon.t,wd=A.D().weapons&&A.D().weapons[wt],W_=WEAPONS[wt]||{};
  if(!wd){L.err='ctx: no weapon data '+wt;return null;}
  const basic=wd.actionCoef*wd.weights.reduce((a,b)=>a+b,0);
  const def={id:CFG.id,mode:'native',coefTotal:basic,flatTotal:0,weights:CFG.damage.mul.map(()=>1),maxTargets:99,targeting:'around',element:'Neutral',range:CFG.useRange};
  const c=A.ctxFor('skill',CFG.id,def,{dt:W_.magic?'mag':'phys',lvScale:1,m0:1,reach:CFG.useRange+200,cdId:CFG.id});
  c.sk2={wt,basic,mul:CFG.damage.mul.slice()};return c;}
/* ---------- cast ---------- */
function start(){
  if(!L.test)return refuse('ใช้ได้เฉพาะโหมดทดสอบ');
  if(!P||P.dead||G.state!=='play'||G.edit)return refuse('ใช้ไม่ได้ตอนนี้');
  if(!ready())return refuse('ภาพยังโหลดไม่เสร็จ');
  if(S||(SK1&&SK1.state)||(window.__SK3&&__SK3.state))return refuse('สกิลกำลังทำงาน');
  if((P.cds[CFG.id]||0)>0)return refuse(`คูลดาวน์ ${P.cds[CFG.id].toFixed(1)} วิ`);
  if(P.dash||P.casting)return refuse('กำลังทำท่าอื่น');
  // r7 (user 22:40): long-range skill. No 60 px melee requirement. Central lock: the clicked target has priority, else auto-pick inside the wave range. H1 whiffs if the target is far; H2 flies 346 px from the cast spot.
  TL.check();const rng=CFG.useRange;let e=TL.e&&alive(TL.e)?TL.e:null;
  if(!e){e=TL.autoPick(rng);if(!e)return refuse('ไม่มีมอนในระยะคลื่น (คลิก/แตะมอนเพื่อล็อก)');TL.set(e,'auto','เลือกอัตโนมัติ (สกิล 2)');}
  const dE=edge(e);if(dE>rng)return refuse(`เป้าไกลเกินระยะคลื่น (${Math.round(dE)} > ${rng})`);
  const a=Math.atan2(e.y-P.y,e.x-P.x),dirSrc='lock';
  const di=dirIdx(a+camYaw());   // r8: all 8 directions; chosen once, kept for the whole cast
  if(P.mp<CFG.cost.mp)return refuse('MP ไม่พอ');
  P.mp-=CFG.cost.mp;P.cds[CFG.id]=CFG.cost.cd;
  const ctx=castCtx();
  S={id:++castN,di,dn:DN[di],fv:FWDV(di),lv:LATV(di),t:0,f:F0,zone:G.zone,tgt:e,tgtId:e?eid(e):null,dirSrc,face:a,sx:P.x,sy:P.y,trav:0,ctx,reg:new Set(),hits:[],h1:false,rel:false,contacts:[],parts:null,ended:null,dmg:[],tgtLost:false,blockedAt:null};
  P.face=a;P.dash={vx:0,vy:0,t:99,sk2:1,hit:new Set()};
  L.casts++;L.state=S;L.log.push({cast:S.id,t0:+time.toFixed(2),target:S.tgtId,dirSrc,face:+a.toFixed(3),dir:S.dn});L.dirs=L.dirs||{};L.dirs[S.dn]=(L.dirs[S.dn]||0)+1;return true;}
{const o=castSkill;castSkill=function(id){if(id===CFG.id)return start();if(S)return false;return o.apply(this,arguments);};}
L.cast=start;
function finish(why){if(!S)return;S.ended=why;L.log.push({cast:S.id,end:why,t:+S.t.toFixed(3),hits:S.hits.map(h=>[h.id,h.list.length])});
  if(P&&P.dash&&P.dash.sk2)P.dash=null;if(P){P.vx=0;P.vy=0;}S.endAt=time;L.last=S;S=null;L.state=null;}
/* ---------- wave model (metres from the hero's START point along the cast direction; lead = the front core edge) ---------- */
const T_REL=13,PW=WP.PW,WR=CFG.release,HM=WP.HM,HMs=HM*AZ*K;   // HMs = final wave height in game px (unchanged, 83 px)
function lead(tf){const u=Math.max(0,Math.min(1,tf/T_REL));return WP.X_TIP+(S.Dend-WP.X_TIP)*(1-Math.pow(1-u,PW));}
function tArrive(x){const r=Math.max(0,Math.min(1,(x-WP.X_TIP)/Math.max(.05,S.Dend-WP.X_TIP)));return WR+(1-Math.pow(1-r,1/PW))*T_REL;}
function initWave(){
  const reach=TL.reachNow();let Dpx=CFG.waveRange;   // real swing reach × 2.5, from the hero's end-of-step position
  const ca=Math.cos(S.face),sa=Math.sin(S.face);let wall=null;
  for(let d=WP.X_TIP*PXM;d<=Dpx;d+=5){if(blocked(S.sx+ca*d,S.sy+sa*d,6)){wall=d-5;break;}}
  if(wall!=null){Dpx=Math.max(WP.X_TIP*PXM+4,wall);S.wall=Math.round(wall);}
  S.Dpx=Dpx;S.Dend=Dpx/PXM;S.reach=reach;S.halfW=pr();
  // particles: soft dust + soil clods thrown to both sides at random spots along the path (live, so a wall / short range shortens them)
  let r=(S.id*9301+49297)%233280;const R=()=>{r=(r*9301+49297)%233280;return r/233280;};const U=(a,b)=>a+R()*(b-a);
  const dust=[],chips=[],SOIL=[[92,74,58],[120,96,70],[70,58,48],[142,116,84]];
  for(let i=0;i<78;i++){const x=U(WP.X_TIP,S.Dend),s=R()<.5?-1:1,big=R()<.25;
    dust.push({f0:tArrive(x)+U(0,2),x:x+U(-.1,.1),y:s*U(0,.12),z:U(0,.06),vx:U(-1.6,.5),vy:s*U(.7,3.4),vz:U(.1,.9),r0:U(.03,.08),r1:big?U(.16,.34):U(.08,.19),life:U(11,19),tone:U(-.12,.12)});}
  for(let i=0;i<46;i++){const x=U(WP.X_TIP,S.Dend),s=R()<.5?-1:1;
    chips.push({f0:tArrive(x)+U(0,1.5),x,y:s*U(0,.1),z:.05,vx:U(-.8,1.2),vy:s*U(.8,2.8),vz:U(1.4,3.6),s:[2.2,3,3.8,5,6.5,8][Math.floor(R()*6)],life:U(12,18),col:SOIL[Math.floor(R()*4)],rot:U(0,6.28),sq:U(.55,1),n:[4,5,5,6][Math.floor(R()*4)]});}
  for(let i=0;i<26;i++){const a=U(0,6.283),sp=U(1,3.2);dust.push({f0:WR+U(0,1),x:WP.X_TIP-.05,y:0,z:.03,vx:Math.cos(a)*sp*.8,vy:Math.sin(a)*sp,vz:U(.2,.9),r0:.06,r1:U(.12,.22),life:U(12,18),tone:U(-.1,.1)});}
  for(let i=0;i<14;i++){const a=U(0,6.283);chips.push({f0:WR,x:WP.X_TIP,y:0,z:.04,vx:Math.cos(a)*U(.6,2.2),vy:Math.sin(a)*U(.6,2.2),vz:U(2,3.8),s:[3,4,5,7][Math.floor(R()*4)],life:U(12,17),col:SOIL[Math.floor(R()*4)],rot:U(0,6.28),sq:U(.55,1),n:[4,5,6][Math.floor(R()*3)]});}
  S.parts={dust,chips};
  try{shake(CFG.shake);}catch(e){}}
/* ---------- hits ---------- */
function hitDamage(e,i,extra){
  if(!S.ctx)return;const ctx=S.ctx,m=CFG.damage.mul[i],prev=C182.cur;let pl;try{pl=wpal();}catch(_){}const hp0=e.hp;C182.cur=ctx;
  try{hitEnemy(e,m,Object.assign({dt:ctx.dt,pl,ctx,b3:i},extra||{}));}catch(err){L.err='dmg '+err.message;}finally{C182.cur=prev;}
  S.dmg.push({hit:i+1,id:eid(e),m:+m.toFixed(3),coef:+(ctx.def.coefTotal*m).toFixed(3),cast:ctx.seq,hpLoss:Math.round(hp0-e.hp)});}
function fireH1(){
  const h=CFG.hit1,list=[];
  for(const e of enemies){if(e.dead||!(e.hp>0))continue;const key=S.id+':1:'+eid(e);if(S.reg.has(key))continue;
    const R=h.r+(e.sz||16),d=dist(P.x,P.y,e.x,e.y);if(d>R)continue;
    if(d>(e.sz||16)+pr()){const da=Math.abs(ang(S.face,Math.atan2(e.y-P.y,e.x-P.x)));if(da>h.halfDeg*Math.PI/180)continue;}
    if(!los(P.x,P.y,e.x,e.y,(e.sz||16)))continue;
    S.reg.add(key);list.push(eid(e));hitDamage(e,0);}
  S.hits.push({id:1,f:+S.f.toFixed(2),t:+S.t.toFixed(3),x:Math.round(P.x),y:Math.round(P.y),list,r:h.r,half:h.halfDeg});S.flash1={x:P.x,y:P.y,face:S.face,t:time};}
function waveHits(f){
  const tf=f-WR;if(tf<0)return;const ld=lead(tf)*PXM,ca=Math.cos(S.face),sa=Math.sin(S.face),list=[];
  for(const e of enemies){if(e.dead||!(e.hp>0))continue;const key=S.id+':2:'+eid(e);if(S.reg.has(key))continue;
    const sz=e.sz||16,dx=e.x-S.sx,dy=e.y-S.sy,along=dx*ca+dy*sa,perp=Math.abs(-dx*sa+dy*ca);
    if(perp>S.halfW+sz*.6)continue;                       // width ≈ one character (hero body width) + the monster's own body
    if(along<-sz*.5||along-sz*.6>S.Dpx)continue;          // behind the hero / beyond the wave's real end (range or wall)
    if(along-sz*.6>ld)continue;                            // the wave front has not reached this monster yet
    S.reg.add(key);list.push(eid(e));
    S.contacts.push({f0:f,x:e.x-ca*sz*.6,y:e.y-sa*sz*.6,seed:S.id*31+list.length});
    hitDamage(e,1,{kb:CFG.kb,fx:e.x-ca,fy:e.y-sa});       // push along the wave direction (game kb: bosses ignore, elites ×.3, collide() keeps it out of obstacles)
    L.lastHit={cast:S.id,id:eid(e),f:+f.toFixed(2),along:Math.round(along),lead:Math.round(ld)};}
  if(list.length)S.hits.push({id:2,f:+f.toFixed(2),t:+S.t.toFixed(3),list,lead:Math.round(ld),Dpx:Math.round(S.Dpx)});}
function moveFwd(dd){const ca=Math.cos(S.face),sa=Math.sin(S.face),n=Math.ceil(dd/6),ux=ca*dd/n,uy=sa*dd/n,r=pr()*.8,Z=ZONES[G.zone];
  for(let i=0;i<n;i++){const nx=P.x+ux,ny=P.y+uy;if(blocked(nx,ny,r)||nx<30||ny<30||(Z&&(nx>Z.w-30||ny>Z.h-30)))return true;P.x=nx;P.y=ny;S.trav+=Math.hypot(ux,uy);}return false;}
function step(dt){
  if(!S)return;
  if(!P||P.dead){finish('hero died');return;}
  if(G.zone!==S.zone||G.state!=='play'){finish('left the map');return;}
  if(!P.dash||!P.dash.sk2)P.dash={vx:0,vy:0,t:99,sk2:1,hit:new Set()};
  P.dash.vx=0;P.dash.vy=0;P.dash.t=99;
  S.t+=dt;S.f=F0+S.t*FPS;const f=S.f;
  const tg=S.tgt;if(tg&&!S.tgtLost&&!(tg&&!tg.dead&&tg.hp>0&&enemies.includes(tg))){S.tgtLost=true;S.lostAt=+f.toFixed(2);}
  const want=CFG.step.dist*PXM*ss((f-CFG.step.f0)/CFG.step.span),dd=want-S.trav;   // the 0.20 m step of the slam (removed from the frames)
  if(dd>.01&&S.blockedAt==null&&moveFwd(dd))S.blockedAt=+f.toFixed(2);
  if(!S.h1&&f>=CFG.hit1.f){S.h1=true;fireH1();}
  if(!S.rel&&f>=WR){S.rel=true;initWave();}
  if(S.rel)waveHits(f);
  P.face=S.face;
  if(S.t>=CFG.end)finish('done');}
{const o=update;update=function(dt){try{step(dt);}catch(e){L.err='step '+e.message;try{finish('error');}catch(_){}}return o.apply(this,arguments);};}
{const o=playerDeath;playerDeath=function(){if(S)finish('hero died');return o.apply(this,arguments);};}
if(typeof loadZone==='function'){const o=loadZone;loadZone=function(){if(S)finish('left the map');return o.apply(this,arguments);};}
if(window.HERO3D&&window.__HERO3D){const Hh=window.HERO3D,Dd=window.__HERO3D,oe=Hh.ext;Hh.ext=function(now){if(S){const c=Dd.clips.ready;return ['ready',Math.floor(now*c.fps)%c.n];}return oe?oe.apply(this,arguments):null;};}
/* ---------- drawing: hero frame + baked hero-attached FX (inside the hero's billboard, like skill 1) ---------- */
const BLEND_IN=.12,BLEND_OUT=.12,clk=()=>typeof time==='number'?time:performance.now()/1000;let EX=null;
const fy0=()=>HD.footY+(O[1]-F.ay)*K;                    // render ground-origin y offset from the entity pivot (billboard px)
function heroFrame(i,x,y,alpha,dn){const r=D.dirs[dn].hero.rects[i];if(!r)return;ctx.save();ctx.globalAlpha=alpha;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.drawImage(IMG.dirs[dn].hero,r[0],r[1],r[2],r[3],x+(r[4]-F.ax)*K,y+HD.footY+(r[5]-F.ay)*K,r[2]*K,r[3]*K);ctx.restore();}
function bake(kind,i,x,y,dn){const r=D.dirs[dn][kind].rects[i];if(!r)return;const gx=x+(O[0]-F.ax)*K,gy=y+fy0();ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  (window.__B3RAW||((...q)=>ctx.drawImage(...q)))(IMG.dirs[dn][kind],r[0],r[1],r[2],r[3],gx+r[4]*K,gy+r[5]*K,r[2]*K,r[3]*K);ctx.restore();}   // r7: baked FX layers are never tinted by the Skill 3 buff
{const o=drawPlayerSprite;drawPlayerSprite=function(x,y,bob,fa){
  const s=S,ov=SPR_OVR.player;
  if(!s||!ov||!ov.hero3d||!L.test||!ready()){
    if(EX&&ov&&ov.hero3d&&ready()){const u=(clk()-EX.t)/BLEND_OUT;if(u>=0&&u<1){const r=o.apply(this,arguments);try{heroFrame(EX.i,x,y,1-ss(u),EX.dn);L.exitBlend=(L.exitBlend||0)+1;}catch(e){}return r;}EX=null;}
    return o.apply(this,arguments);}
  try{
    const f=Math.min(F0+N-1,s.f),i=Math.max(0,Math.min(N-1,Math.floor(f-F0+.06)));
    const bi=s.t<BLEND_IN?ss(s.t/BLEND_IN):1;
    bake('back',i,x,y,s.dn);
    if(bi<1){o.apply(this,arguments);L.entryBlend=(L.entryBlend||0)+1;}
    heroFrame(i,x,y,bi,s.dn);EX={t:clk(),i,dn:s.dn};
    H.anchor={x:x,y:y+HD.footY};L.frames++;L.lastFrame=F0+i;
    bake('front',i,x,y,s.dn);
  }catch(e){L.err='draw '+e.message;return o.apply(this,arguments);}
};}
/* ---------- live FX (above every entity: wrapped after drawParts) ---------- */
const rgb=(c,a)=>`rgba(${c[0]},${c[1]},${c[2]},${Math.max(0,Math.min(1,a)).toFixed(3)})`;
const BLUE_M=[253,172,62],BLUE_W=[255,242,210];   // r6 (user 02:19): names kept, colours now the orange-gold of the sword aura (amber 253,197,82 / warm white 255,251,239)
function bbAt(x,y,fn){if(typeof bb==='function')bb(x,y,fn);else fn();}
function gnd(xm,ym){const ca=Math.cos(S.face),sa=Math.sin(S.face);return [S.sx+(ca*xm+sa*ym)*PXM,S.sy+(sa*xm-ca*ym)*PXM];}   // ground metres (along, lateral, +left-of-screen-up) -> world px
function dustDraw(f){const c=ctx;
  for(const d of S.parts.dust){const a=f-d.f0;if(a<0||a>d.life)continue;const u=a/d.life,tt=a/FPS,dr=1-.4*u;
    const xm=d.x+d.vx*tt*dr,ym=d.y+d.vy*tt*dr,z=Math.max(0,d.z+d.vz*tt-.4*tt*tt),w=gnd(xm,ym),r=(d.r0+(d.r1-d.r0)*u)*PXM*1.0,al=.5*Math.pow(1-u,1.3);
    const tone=d.tone,cc=[176+60*tone,160+55*tone,128+50*tone];
    bbAt(w[0],w[1],()=>{const x=w[0],y=w[1]+fy0()-z*AZ*K,g=c.createRadialGradient(x-r*.15,y-r*.2,r*.1,x,y,r);g.addColorStop(0,rgb([cc[0]+30,cc[1]+28,cc[2]+24],al));g.addColorStop(1,rgb(cc,0));c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,6.283);c.fill();});}
  for(const ch of S.parts.chips){const a=f-ch.f0;if(a<0||a>ch.life)continue;const tt=a/FPS,u=a/ch.life;
    const xm=ch.x+ch.vx*tt,ym=ch.y+ch.vy*tt;let z=ch.z+ch.vz*tt-4.9*tt*tt;if(z<0)z=0;const w=gnd(xm,ym),sz=ch.s*K,rot=ch.rot+a*.7,al=Math.min(1,(1-u)*2.2);
    bbAt(w[0],w[1],()=>{const x=w[0],y=w[1]+fy0()-z*AZ*K;c.fillStyle=rgb(ch.col,al);c.beginPath();
      for(let k=0;k<ch.n;k++){const rr=sz*(k%2?1:.7),px=x+Math.cos(rot+k*6.283/ch.n)*rr,py=y+Math.sin(rot+k*6.283/ch.n)*rr*ch.sq;k?c.lineTo(px,py):c.moveTo(px,py);}c.closePath();c.fill();});}}
const useSeq=()=>S&&VFX[S.dn];
const GYR=22.95/43.3,DEND_FULL=346/43.3;
function waveDrawSeq(f){
  const VF=VFX[S.dn],tf=f-WR,k=Math.round(tf)-VF.tf0;if(k<0||k>=VF.n)return;const c=ctx;
  const ca=Math.cos(S.face),sa=Math.sin(S.face),dpx=lead(Math.max(tf,0))*PXM,wxf=S.sx+ca*dpx,wyf=S.sy+sa*dpx,FRg=VF.fg;   // sequences are baked with the root FRg game px behind the front
  const wx=wxf-ca*FRg,wy=wyf-sa*FRg,sw=Math.max(.08,Math.min(1,(S.Dend-WP.X_TIP)/(DEND_FULL-WP.X_TIP)));   // sw<1 only when a wall shortens the path: the same 13-frame animation, the world trail is shortened along the travel axis (art itself is never squeezed)
  const th=Math.atan2(sa*GYR,ca);
  bbAt(wx,wy,()=>{const gy=wy+fy0();c.save();c.globalCompositeOperation='source-over';c.globalAlpha=1;
    const T=VF.T,B=VF.B,E=VF.E,it=T.im[k],ib=B.im[k],ie=E.im[k];
    c.save();c.translate(wx,gy);c.rotate(th);c.scale(sw,1);c.rotate(-th);c.translate(-wx,-gy);c.drawImage(it,wx-T.ox*T.sc,gy-T.oy*T.sc,it.naturalWidth*T.sc,it.naturalHeight*T.sc);c.restore();
    c.drawImage(ib,wx-B.ox*B.sc,gy-B.oy*B.sc,ib.naturalWidth*B.sc,ib.naturalHeight*B.sc);
    // hit: the sharp front edge flares for a moment (the wave keeps going)
    for(const h of S.contacts){const a=f-h.f0;if(a<0||a>=3.2)continue;const u=a/3.2,al=.95*Math.pow(1-u,1.4);
      c.globalCompositeOperation='lighter';c.globalAlpha=al;c.drawImage(ie,wx-E.ox*E.sc,gy-E.oy*E.sc,ie.naturalWidth*E.sc,ie.naturalHeight*E.sc);c.globalAlpha=al*.55;c.drawImage(ie,wx-E.ox*E.sc-1.2,gy-E.oy*E.sc-1.2,ie.naturalWidth*E.sc+2.4,ie.naturalHeight*E.sc+2.4);}
    c.restore();});}
function waveDraw(f){
  if(useSeq()){waveDrawSeq(f);return;}
  const tf=f-WR;if(tf<-.01||tf>T_REL+3.5)return;const c=ctx;
  const lm=lead(Math.max(tf,0)),dpx=lm*PXM,fade=tf<=T_REL?1:Math.max(0,1-(tf-T_REL)/3.5),e=1-Math.pow(1-Math.min(1,Math.max(tf,0)/3),2.2);
  const sy=.28+.72*e,sxr=sy*(1+.55*(1-e)),ca=Math.cos(S.face),sa=Math.sin(S.face),wxf=S.sx+ca*dpx,wyf=S.sy+sa*dpx;   // wxf/wyf = wave FRONT on the ground (damage / ribbons reference)
  const wd=WV.dirs[S.dn],sc=HMs/WV.href,mfm=Math.min(1.05,wd.mf*sc/PXM)*sy,wx=wxf-ca*mfm*PXM,wy=wyf-sa*mfm*PXM;   // sprite root sits behind the front by the sprite's own forward extent (capped)
  bbAt(wx,wy,()=>{
    const gy=wy+fy0(),gyf=wyf+fy0();
    c.save();c.globalCompositeOperation='source-over';
    c.fillStyle=rgb(BLUE_M,.22*fade);c.beginPath();c.arc(wx,gy,15*K,0,6.283);c.fill();c.fillStyle=rgb(BLUE_W,.25*fade);c.beginPath();c.arc(wx,gy,8*K,0,6.283);c.fill();
    const fv=S.fv,lv=S.lv,wxS=wxf;
    const dw=wd.w*sc*sxr,dh=wd.h*sc*sy;   // same scale on both axes at full size (growth at release as before)
    c.globalAlpha=fade;c.drawImage(IMG.waves[S.dn],wx-wd.rx*sc*sxr,gy-wd.ry*sc*sy,dw,dh);
    // curved airy ribbons trailing the wave, fading fast
    c.globalAlpha=1;c.lineCap='round';c.shadowColor='rgba(253,172,62,.8)';c.shadowBlur=6*K;
    for(let k=0;k<9;k++){const zz=(.07+.86*k/8)*HM,ph=k*1.9,amp=(.05+.04*((k*5)%3))*HM*.5,lag=2.2+.5*((k*7)%4)/3,w0=7+3*((k*3)%3),off=.30+.05*(k%3);
      if(tf<.3+(.1*k)%.5)continue;const pts=[],NN=14;
      for(let j=0;j<=NN;j++){const s_=lag*j/NN,xp=lead(Math.max(tf-s_,0))-off-.05*s_,zp=zz+amp*Math.sin(ph+s_*2.6+tf*.5),yp=.10*Math.sin(ph*1.3+s_*2)*(k%2?1:-1);
        const ga=xp-lm,Xr=ga*fv[0]+yp*lv[0],Yr=ga*fv[1]+yp*lv[1];
        pts.push([wxS+(Xr*AF.x[0]+Yr*AF.y[0])*K,gyf+(Xr*AF.x[1]+Yr*AF.y[1]-zp*AZ)*K,s_/lag]);}
      for(let j=0;j<NN;j++){const p0=pts[j],p1=pts[j+1],u1=p1[2],al=.42*Math.pow(1-u1,1.6)*fade*Math.min(1,(tf-.2)/1.2);if(al<.02)continue;
        const w=w0*Math.pow(1-u1,.8)*Math.pow(Math.sin(Math.PI*Math.min(1,(1-u1)+.15)),.5);
        c.strokeStyle=rgb(BLUE_M,al);c.lineWidth=Math.max(.6,w*K);c.beginPath();c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1]);c.stroke();
        c.strokeStyle=rgb(BLUE_W,al*.8);c.lineWidth=Math.max(.5,w*.35*K);c.beginPath();c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1]);c.stroke();}}
    c.restore();});}
function sparkDraw(f){const c=ctx;
  for(const k of S.contacts){const a=f-k.f0;if(a<0||a>=3.2)continue;const u=a/3.2;let r=k.seed*16807%2147483647;const R=()=>{r=(r*16807)%2147483647;return r/2147483647;};
    bbAt(k.x,k.y,()=>{c.save();const x=k.x,y=k.y+fy0()-.45*AZ*K;
      c.fillStyle=rgb(BLUE_W,.9*(1-u));c.beginPath();c.arc(x,y,(6+6*u)*(1-u*.5)*K,0,6.283);c.fill();c.fillStyle=rgb(BLUE_M,.22*(1-u));c.beginPath();c.arc(x,y,(10+10*u)*K,0,6.283);c.fill();
      c.lineCap='round';c.shadowColor='rgba(253,172,62,.9)';c.shadowBlur=5*K;
      if(VFX[S.dn]){   // r3/r4/r5: a few thick curved energy shards (burst), no thin spark spray
        for(let i=0;i<8;i++){const an=-1.2+R()*2.4+(i%2?0:3.14159)*.0,side=(i%2?1:-1),ang=(side>0?-1.57:1.57)+(R()-.5)*1.5,L1=.55+R()*.45,r0=4+5*u,r1=r0+(10+22*u)*L1;
          const cx=Math.cos(ang),cy=Math.sin(ang)*.85,bx=-cy*side*.35,by=cx*side*.35;
          c.strokeStyle=rgb(i%3===0?BLUE_W:BLUE_M,Math.pow(1-u,1.1));c.lineWidth=(4.2-2.4*u)*K*2.2;
          c.beginPath();c.moveTo(x+cx*r0*K,y+cy*r0*K);c.quadraticCurveTo(x+(cx*(r0+r1)/2+bx*r1)*K,y+(cy*(r0+r1)/2+by*r1)*K,x+cx*r1*K,y+cy*r1*K);c.stroke();}
      } else
      for(let i=0;i<11;i++){const an=R()*6.283,L1=.5+R()*.5,r0=5+6*u,r1=r0+(8+26*u)*L1;c.strokeStyle=rgb(i%3===0?BLUE_M:BLUE_W,Math.pow(1-u,1.2));c.lineWidth=(2.6-1.2*u)*K;
        c.beginPath();c.moveTo(x+Math.cos(an)*r0*K,y+Math.sin(an)*r0*.85*K);c.lineTo(x+Math.cos(an)*r1*K,y+Math.sin(an)*r1*.85*K);c.stroke();}
      c.restore();});}}
function debugDraw(s,age){if(!L.debugDraw||!L.test)return;const c=ctx;c.save();c.globalAlpha=Math.max(0,1-age/2.5);c.lineWidth=2;
  const ca=Math.cos(s.face),sa=Math.sin(s.face);
  if(s.flash1){const h=CFG.hit1,hf=h.halfDeg*Math.PI/180;c.fillStyle='rgba(255,214,90,.20)';c.strokeStyle='#ffd65a';c.beginPath();c.moveTo(s.flash1.x,s.flash1.y);c.arc(s.flash1.x,s.flash1.y,h.r,s.face-hf,s.face+hf);c.closePath();c.fill();c.stroke();}
  if(s.Dpx){const px=-sa*s.halfW,py=ca*s.halfW,ex=s.sx+ca*s.Dpx,ey=s.sy+sa*s.Dpx;c.fillStyle='rgba(120,220,255,.16)';c.strokeStyle='#7fe8ff';c.beginPath();c.moveTo(s.sx+px,s.sy+py);c.lineTo(ex+px,ey+py);c.lineTo(ex-px,ey-py);c.lineTo(s.sx-px,s.sy-py);c.closePath();c.fill();c.stroke();}
  c.restore();}
{const o=drawParts;drawParts=function(){const r=o.apply(this,arguments);
  try{if(S&&L.test){const f=S.f;if(S.rel&&S.parts){ctx.save();ctx.globalCompositeOperation='source-over';dustDraw(f);waveDraw(f);sparkDraw(f);ctx.restore();L.drawn++;}else if(!S.rel&&useSeq()&&f>=WR+VFX[S.dn].tf0){ctx.save();waveDrawSeq(f);ctx.restore();}debugDraw(S,0);}
      else if(L.last&&L.test&&L.debugDraw){const age=time-(L.last.endAt||time);if(age<2.5)debugDraw(L.last,age);}}catch(e){L.err='fx '+e.message;try{ctx.restore();}catch(_){}}
  return r;};}
/* ---------- TEST panel ---------- */
let panel=null;
function panelHTML(){const s=S||L.last,row=(a,b)=>`<div><span style="color:#9ab">${a}</span> ${b}</div>`;
  const lk=row('ล็อก (กลาง)',TL.e?TL.id+' · '+(TL.src==='auto'?'อัตโนมัติ':'คลิก')+' · ห่าง '+Math.round(edge(TL.e)):'— ('+(TL.why||'ยังไม่เลือก')+')');
  const hint=row('ทิศ','ครบ 8 ทิศ (ตามเป้าที่ล็อก ภายในระยะคลื่น 340 px)'+(S||L.last?' · '+(S||L.last).dn:''))+row('คูลดาวน์',((P.cds[CFG.id]||0)>0?(P.cds[CFG.id]).toFixed(1)+' วิ':'พร้อม')+' · MP '+CFG.cost.mp);
  if(!s)return lk+hint+row('สถานะ','พร้อม — ล็อกมอนแล้วกด U')+row('ปฏิเสธล่าสุด',(L.refused.slice(-1)[0]||{}).why||'-');
  return lk+hint+row('cast',s.id)+row('สถานะ',S?'เล่น f'+s.f.toFixed(1):'จบ: '+s.ended)+row('ทิศ',s.dirSrc+(s.tgtId?' · '+s.tgtId:'')+(s.tgtLost?' (เป้าหาย)':''))
    +(s.Dpx?row('คลื่น',`ไกล ${Math.round(s.Dpx)} px (ระยะดาบ ${Math.round(s.reach)}×2.5${s.wall!=null?' · ชนกำแพง @'+s.wall:''}) · กว้าง ${Math.round(s.halfW*2)} px`):'')
    +s.hits.map(h=>row('H'+h.id+' f'+h.f,h.list.length?h.list.join(', '):'—')).join('')
    +row('ดาเมจ','ฐานฟันปกติ × '+CFG.damage.mul.join(' / ')+(s.dmg.length?' · HP ลด '+s.dmg.reduce((a,b)=>a+b.hpLoss,0):''))+row('ปฏิเสธล่าสุด',(L.refused.slice(-1)[0]||{}).why||'-');}
function setTest(on){L.test=!!on;
  if(on&&!panel){panel=document.createElement('div');panel.id='sk2Panel';panel.style.cssText='position:fixed;right:10px;top:120px;z-index:60;width:250px;padding:8px 10px;border-radius:10px;background:rgba(8,14,32,.88);border:1px solid #3a5a8a;color:#e8f0ff;font:12px/1.45 sans-serif;pointer-events:auto';
    panel.innerHTML='<b>Sword Skill 2 · 8 ทิศ</b> <span style="color:#ffd65a">TEST</span><div id="sk2Body"></div><label style="display:block;margin-top:4px"><input id="sk2Dbg" type="checkbox"> แสดงพื้นที่โดน (H1 พัด / ทางคลื่น)</label><div style="display:flex;gap:6px;margin-top:6px"><button id="sk2Lock" type="button" style="min-height:44px;flex:1">ล็อก / ยกเลิก</button><button id="sk2Use" type="button" style="min-height:44px;flex:1">ใช้สกิล (U)</button></div>';
    document.body.appendChild(panel);panel.querySelector('#sk2Use').addEventListener('click',()=>start());panel.querySelector('#sk2Lock').addEventListener('click',()=>TL.button());
    panel.querySelector('#sk2Dbg').addEventListener('change',e=>{L.debugDraw=!!e.target.checked;});
    for(const ev of ['pointerdown','pointerup','mousedown','touchstart','click'])panel.addEventListener(ev,e=>e.stopPropagation());}
  if(panel)panel.style.display=on?'block':'none';if(!on&&S)finish('test mode off');}
L.setTest=setTest;
setInterval(()=>{try{if(panel&&L.test)panel.querySelector('#sk2Body').innerHTML=panelHTML();}catch(e){}},120);
window.addEventListener('keydown',e=>{if(!L.test)return;if((e.key==='u'||e.key==='U')&&!e.repeat){const a=document.activeElement;if(a&&/INPUT|TEXTAREA/.test(a.tagName))return;start();}});
setInterval(()=>{try{const row=document.getElementById('hudTrayRow');if(row&&!document.getElementById('sk2Tog')){const b=document.createElement('button');b.type='button';b.className='tbtn';b.id='sk2Tog';row.appendChild(b);
  const lab=()=>{b.textContent='Sword Skill 2 · 8 ทิศ: '+(L.test?'เปิด':'ปิด');};lab();b.addEventListener('click',()=>{setTest(!L.test);lab();});}}catch(e){}},700);
try{if(/sk2test/.test(String(location.hash)+String(location.search)))setTest(true);}catch(e){}
})();

