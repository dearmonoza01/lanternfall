
/* ---- candidate_sword_atk5_r18: p241 r2 Sword attack skill 3 "วังวนเจ็ดคม" tornado FX + walking while spinning (TEST only) ---- */
/* p241 r1 — Sword ATTACK skill 3 "วังวนเจ็ดคม" (candidate_sword_atk3_r1, TEST only, built on candidate_sword_passive_r8). Not merged, not published.
   NOT the buff "นักดาบคลั่ง" (that one stays __SK3 / id wsSword3, untouched). This skill: window.__SKATK3, cast / cooldown / ctx id 'wsAtk3', key B.
   Spec (user 13 Oct 17:42):
     press to cast, no target lock; spin the sword around the hero in 7 beats (no need for 7 full turns).
     each hit = 70 % of the REAL basic sword swing base (D().weapons[w].actionCoef x sum(weights)) before defence / crit; 7 x 70 % = 490 % per monster hit by all 7.
     each hit looks at the circle at its OWN time; each monster at most once per hit (key cast:hit:monster); walls block (LOS from the hero, blocked()); ONE cast context (ctxFor) for all 7 hits + the game's own hitEnemy / C182 formula.
     MP 26, cooldown 12 s, charged ONCE when the cast starts (never refunded); a press while active / on cooldown / without MP is refused (no cost, no second cast).
     hero death, map change, weapon change, leaving play -> cancel and clear (P.dash, state, particles).
     radius 84 px (from the hero centre to the monster's body edge: monster size is added, same convention as Skill 2's first hit).
     timeline: opening 0.26 s (short crouch + sweep into the spin), hits 0.30 .. 1.46 s (7 beats, even spacing), brake until 1.60 s, then the game's 0.12 s exit blend. The hero turns on the spot (no dash).
   Works with the existing systems (nothing duplicated):
     mastery / sharp (passives)       -> through the game's own core() (ctx.kind 'skill' + B('critDmg')).
     Sword Skill 3 "นักดาบคลั่ง"        -> p237 r2 counts every landed hit as one beat (cast seq + hit id b3 = 0..6); a beat spends ONE charge however many monsters it hits; the first 5 landed beats are guaranteed crits, the rest roll normally.
     chain passive "คมต่อเนื่อง"        -> NOT filled and NO shadow: it only reacts to ctx id 'basic:sword'.
     breath passive "ลมหายใจนักรบ"     -> kills from this ctx heal through the passive's own shared cooldown (isSwordCtx).
   Animation (preview, no new Blender Action): the hero frames are the existing r12 sword action (window.__SK1ANIM / __SK1ANIM_DIRS, 8 directions, Pivot turned at render time, no mirroring), RE-TIMED by cfg.seq:
     crouch -> spin (f41..60) -> spin again (f46..60, 5 % cross-fade at the seam) -> the whip (f60..66, last hit) -> brake (f67..77).
     FX are drawn live (two layers around the hero sprite, back / front by camera depth): per hit a blade-trail crescent (white-warm core, gold edge, the last one wide with an orange rim) cut to the real blade path and reaching the hit radius,
     a thin broken orange-gold ground ring per beat (never a solid disc), light dust at the feet on beats 2/4/6, and a spark flash on every monster that was hit; the last beat has the wide crescent, a stronger ring and the fan of dust + soil chips. No screen shake, no hit-stop.
     cfg.fx=false (window.__SKATK3.fx=false) draws the hero pose only, for pose checking.
   All numbers live in __SKATK3.cfg. Debug: window.__SKATK3. */
(function(){
'use strict';
const L=window.__SKATK3={ver:'p241-r1',err:null,test:false,fx:true,log:[],refused:[],casts:0,state:null,last:null,hitLog:[],dirs:{},frames:0,lastFrame:null};
try{
const A0=window.__SK1ANIM,AD=window.__SK1ANIM_DIRS||{},HD=window.__HERO3D,H=window.HERO3D,TL=window.TLOCK;
if(!A0||!HD||!H||!window.C182||!C182.api||typeof hitEnemy!=='function'||typeof update!=='function'||typeof blocked!=='function'||typeof drawPlayerSprite!=='function'||typeof playerDeath!=='function'){L.err='hooks missing '+[!A0&&'__SK1ANIM',!HD&&'__HERO3D',!H&&'HERO3D',!window.C182&&'C182'].filter(Boolean).join(',');return;}
/* ---------------- config (single place) ---------------- */
const CFG=L.cfg={id:'wsAtk3',name:'วังวนเจ็ดคม',key:'B',
  cost:{mp:26,cd:12},
  radius:84,                                   // px, hero centre -> monster body edge (monster size added)
  damage:{mul:[.7,.7,.7,.7,.7,.7,.7],total:4.9}, // each hit = 70 % of the real basic swing; total 490 %
  time:{first:.30,last:1.46,end:1.60},          // hit 1 / hit 7 / end of the brake (s from the cast); hits are evenly spaced
  seq:[{a:20,b:27,dur:.26},{a:41,b:60,dur:.55,xf:.05},{a:46,b:60,dur:.45,xf:.05},{a:60,b:66,dur:.20},{a:67,b:77,dur:.14}],   // source frames of the r12 action (f11..f80), re-timed; sum(dur) = time.end
  dirs:'all',                                  // 'all' = every direction that has r12 data; or an array like ['E']
  fx:{trail:.11,trailLast:.16,ringLife:.24,ringLifeLast:.42},
  walk:{on:true,speedMul:.5},   // r2: the hero may walk while spinning at 50% of the CURRENT walking speed (after buffs / states); the effect lives only inside the game's update call
  storm:{on:true,H:1.95,rb:.14,rt:1.0,puffs:380,dust:120,streaks:28,rocks:26,rise:.8,spin:1.7,twist:6,formIn:.04,formDur:.34,burstDur:.50,tail:.46,backA:.62,frontA:.30,gold:.16}};   // tornado FX only (never hits / pulls / pushes): narrow base on the hero, funnel widens upward, height ~ head + half a body (metres of the render space)
CFG.damage.total=+CFG.damage.mul.reduce((a,b)=>a+b,0).toFixed(4);
const NH=CFG.damage.mul.length,hitT=k=>CFG.time.first+(CFG.time.last-CFG.time.first)*k/Math.max(1,NH-1);
{let t=0;for(const s of CFG.seq){s.t0=t;t+=s.dur;}CFG.seqTotal=+t.toFixed(3);}
const ss=u=>u<=0?0:u>=1?1:u*u*(3-2*u),clk=()=>typeof time==='number'?time:performance.now()/1000;
const DN=['E','SE','S','SW','W','NW','N','NE'],DATA=DN.map((n,i)=>i===0?A0:AD[n]||null),IMG=DATA.map(d=>{if(!d)return null;const im=new Image();im.src=d.src;return im;});
const okI=im=>im&&im.complete&&im.naturalWidth;
const F=HD.frame,K=HD.drawScale,FPS=A0.fps,F0=A0.f0,N=A0.n,AF=A0.aff,CD=A0.camdir,O=A0.origin_px,PXM=AF.x[0]*K;
const dirIdx=g=>{const a=Math.atan2(Math.sin(g),Math.cos(g));return ((Math.round(a/(Math.PI/4))%8)+8)%8;};   // 0 = E (HERO3D order)
const camYaw=()=>{try{return typeof camY==='function'?camY():0;}catch(e){return 0;}};
const swordNow=()=>!!(P&&P.weapon&&P.weapon.t==='sword');
const UID=new WeakMap();let uidN=0;const uid=e=>{let v=UID.get(e);if(!v){v=++uidN;UID.set(e,v);}return v;};
const liveE=e=>!!(e&&!e.dead&&e.hp>0&&!e.dev&&!e.sprGhost&&!e.rush&&!e.removed);
const dirOk=d=>!!DATA[d]&&(CFG.dirs==='all'||(Array.isArray(CFG.dirs)&&CFG.dirs.includes(DN[d])));
let S=null,castN=0;
function refuse(why){L.refused.push({t:+clk().toFixed(2),why});if(L.refused.length>30)L.refused.shift();try{textAt(P.x,P.y-62,'วังวนเจ็ดคม: '+why,'#ffb4a8',13);}catch(e){}return false;}
function los(x0,y0,x1,y1,stopShort){const Ln=Math.hypot(x1-x0,y1-y0),n=Math.max(1,Math.ceil((Ln-stopShort)/8));for(let i=1;i<=n;i++){const u=Math.min(1,(i*8)/Ln);if(u*Ln>Ln-stopShort)break;if(blocked(x0+(x1-x0)*u,y0+(y1-y0)*u,2))return false;}return true;}
/* ---------------- time -> source frame (cfg.seq) ---------------- */
function segAt(t){const sq=CFG.seq;for(let i=sq.length-1;i>=0;i--)if(t>=sq[i].t0)return i;return 0;}
function srcFrame(t){const sq=CFG.seq,i=segAt(t),s=sq[i],u=Math.max(0,Math.min(1,(t-s.t0)/s.dur));return s.a+(s.b-s.a)*u;}
L.srcFrame=srcFrame;
/* ---------------- damage context (same rule as skills 1 / 2: base = the real basic swing of the equipped weapon) ---------------- */
function castCtx(){
  const API=window.C182&&C182.api;if(!API||!API.ctxFor){L.err='ctx: C182 missing';return null;}
  const wt=P.weapon&&P.weapon.t,wd=API.D().weapons&&API.D().weapons[wt],W_=WEAPONS[wt]||{};
  if(!wd){L.err='ctx: no weapon data '+wt;return null;}
  const basic=wd.actionCoef*wd.weights.reduce((a,b)=>a+b,0);
  const def={id:CFG.id,mode:'native',coefTotal:basic,flatTotal:0,weights:CFG.damage.mul.map(()=>1),maxTargets:99,targeting:'around',element:'Neutral',range:CFG.radius+60};
  const c=API.ctxFor('skill',CFG.id,def,{dt:W_.magic?'mag':'phys',lvScale:1,m0:1,reach:CFG.radius+260,cdId:CFG.id});
  c.atk3={wt,basic,mul:CFG.damage.mul.slice()};return c;}
/* ---------------- cast ---------------- */
function start(){
  if(!L.test)return refuse('ใช้ได้เฉพาะโหมดทดสอบ');
  if(!P||P.dead||G.state!=='play'||G.edit)return refuse('ใช้ไม่ได้ตอนนี้');
  if(!swordNow())return refuse('ต้องถือดาบ');
  if(!DATA.some((d,i)=>dirOk(i)&&IMG[i]&&okI(IMG[i])))return refuse('ภาพยังโหลดไม่เสร็จ');
  if(S)return refuse('กำลังร่าย (ไม่คิดซ้ำ)');
  const SK1=window.__SK1,SK2=window.__SK2L,SK3=window.__SK3;
  if((P.cds[CFG.id]||0)>0)return refuse(`คูลดาวน์ ${P.cds[CFG.id].toFixed(1)} วิ`);
  if(P.dash||P.casting||(SK1&&SK1.state)||(SK2&&SK2.state)||(SK3&&SK3.state))return refuse('กำลังทำท่าอื่น');
  if(P.mp<CFG.cost.mp)return refuse('MP ไม่พอ');
  const ctx=castCtx();if(!ctx)return refuse('ระบบดาเมจยังไม่พร้อม');
  P.mp-=CFG.cost.mp;P.cds[CFG.id]=CFG.cost.cd;                              // once per cast, never refunded
  const a=(typeof P.face==='number')?P.face:0,d=dirIdx(a+camYaw());
  S={id:++castN,t:0,d,dn:DN[d],face:a,zone:G.zone,ctx,reg:new Set(),fired:new Array(NH).fill(false),contacts:[],hits:[],dmg:[],ended:null,sx:P.x,sy:P.y,anim:dirOk(d),atk0:P.atkCd||0,moved:0,walkF:0};
  P.face=a;P.dash={vx:0,vy:0,t:99,atk3:1,hit:new Set()};
  L.casts++;L.state=S;L.dirs[S.dn]=(L.dirs[S.dn]||0)+1;L.log.push({cast:S.id,t0:+clk().toFixed(2),face:+a.toFixed(3),dir:S.dn,anim:S.anim});return true;}
L.cast=start;
let TAIL=null;   // after a normal finish the tornado keeps dissolving for a short while (FX only)
function finish(why){if(!S)return;S.ended=why;L.log.push({cast:S.id,end:why,t:+S.t.toFixed(3),hits:S.hits.map(h=>[h.k,h.list.length])});
  try{if(P&&P.dash&&P.dash.atk3)P.dash=null;if(P){P.vx=0;P.vy=0;P.atkCd=Math.max(0,S.atk0-S.t);}}catch(e){}
  S.endAt=clk();L.last=S;TAIL=why==='done'?{t:clk(),d:S.d,id:S.id}:null;S=null;L.state=null;if(!TAIL){PRT.length=0;MARK.length=0;}}
L.cancel=finish;
/* ---------------- hits ---------------- */
function hitDamage(e,k){
  const ctx=S.ctx,m=CFG.damage.mul[k],prev=C182.cur;let pl;try{pl=wpal();}catch(_){}const hp0=e.hp;C182.cur=ctx;
  try{hitEnemy(e,m,{dt:ctx.dt,pl,ctx,b3:k});}catch(err){L.err='dmg '+err.message;}finally{C182.cur=prev;}
  S.dmg.push({hit:k+1,id:uid(e),m:+m.toFixed(3),coef:+(ctx.def.coefTotal*m).toFixed(3),cast:ctx.seq,hpLoss:Math.round(hp0-e.hp)});}
function fireHit(k){
  const R=CFG.radius,list=[];
  for(const e of enemies.slice()){
    if(!liveE(e))continue;const key=S.id+':'+k+':'+uid(e);if(S.reg.has(key))continue;
    const sz=e.sz||16,d=Math.hypot(e.x-P.x,e.y-P.y);if(d>R+sz)continue;          // the circle, looked at NOW (the hit's own time)
    if(!los(P.x,P.y,e.x,e.y,sz))continue;                                       // walls block
    S.reg.add(key);list.push(uid(e));
    S.contacts.push({k,t:S.t,x:e.x,y:e.y,sz,last:k===NH-1,seed:S.id*31+k*7+list.length});
    hitDamage(e,k);}
  S.hits.push({k:k+1,t:+S.t.toFixed(3),x:Math.round(P.x),y:Math.round(P.y),list,r:R});
  L.hitLog.push({cast:S.id,seq:S.ctx.seq,k:k+1,t:+S.t.toFixed(3),n:list.length});if(L.hitLog.length>400)L.hitLog.shift();}
function step(dt){
  if(!S)return;
  if(!P||P.dead){finish('hero died');return;}
  if(G.zone!==S.zone||G.state!=='play'){finish('left the map');return;}
  if(!swordNow()){finish('weapon changed');return;}
  if(!P.dash||!P.dash.atk3)P.dash={vx:0,vy:0,t:99,atk3:1,hit:new Set()};
  P.dash.vx=0;P.dash.vy=0;P.dash.t=99;P.face=S.face;
  S.moved+=Math.hypot(P.x-(S.lx==null?S.sx:S.lx),P.y-(S.ly==null?S.sy:S.ly));S.lx=P.x;S.ly=P.y;
  S.t+=dt;
  for(let k=0;k<NH;k++){if(!S.fired[k]&&S.t>=hitT(k)){S.fired[k]=true;fireHit(k);if(!S)return;}}   // a long frame fires every missed hit, in order, each looking at the circle at that moment
  if(S.t>=CFG.time.end)finish('done');}
/* r2: walking while spinning. The game's own movement code runs unchanged (keyboard, joystick, collide(), zone clamp); for the duration of that ONE call P.speed is halved
   (speed = P.speed x buffs x states x joystick tilt, so the result is exactly 50% of the current speed) and P.dash (the "busy" marker) is hidden so the walking branch runs.
   Both are put back in `finally` right after the call, so nothing is left behind even if the game throws. Hits are fired AFTER the movement, from the hero's real position. */
{const o=update;update=function(dt){
  let sc=null,hid=null,sp0=0,sp1=0;
  try{if(S&&P&&!P.dead&&CFG.walk.on){sc=S;hid=(P.dash&&P.dash.atk3)?P.dash:{vx:0,vy:0,t:99,atk3:1,hit:new Set()};sp0=P.speed;sp1=sp0*CFG.walk.speedMul;P.speed=sp1;P.dash=null;P.face=S.face;if(!(P.atkCd>.2))P.atkCd=.2;S.walkF++;}}catch(e){L.err='walk '+e.message;}
  let r;
  try{r=o.apply(this,arguments);}
  finally{if(sc){try{if(P.speed===sp1)P.speed=sp0;if(S===sc&&P&&!P.dead){if(P.dash)finish('other action');else{P.dash=hid;P.face=S.face;}}}catch(e){L.err='walk restore '+e.message;}}}
  try{step(dt);}catch(e){L.err='step '+e.message;try{finish('error');}catch(_){}}
  return r;};}
{const o=playerDeath;playerDeath=function(){try{if(S)finish('hero died');}catch(e){}return o.apply(this,arguments);};}
if(typeof loadZone==='function'){const o=loadZone;loadZone=function(){try{if(S)finish('left the map');}catch(e){}return o.apply(this,arguments);};}
/* ================================================= geometry (render space of the r12 data, same maths as the Skill 1 FX) ================================================= */
let A=A0,AN=null;
const W=p=>[AN.x+(p[0]-F.ax)*K,AN.y+(p[1]-F.ay)*K];
const px3=(X,Y,Z)=>[O[0]+AF.x[0]*X+AF.y[0]*Y+AF.z[0]*Z,O[1]+AF.x[1]*X+AF.y[1]*Y+AF.z[1]*Z];
const depth3=(X,Y,Z)=>X*CD[0]+Y*CD[1]+Z*CD[2];
const qk=fr=>(Math.round(Math.max(F0,Math.min(F0+N-1,fr))*4)/4).toFixed(2);
const qAt=fr=>A.q[qk(fr)],qW=fr=>A.qW[qk(fr)],hipsW=fr=>{const w=qW(fr);return [w[3],w[4],w[5]];};
function unproj(p){const M=[[AF.x[0],AF.y[0],AF.z[0]],[AF.x[1],AF.y[1],AF.z[1]],[CD[0],CD[1],CD[2]]],v=[p[0]-O[0],p[1]-O[1],p[2]-O[2]];
  const d=(a,b,c)=>a[0]*(b[1]*c[2]-b[2]*c[1])-a[1]*(b[0]*c[2]-b[2]*c[0])+a[2]*(b[0]*c[1]-b[1]*c[0]);
  const D=d(M[0],M[1],M[2]),col=i=>M.map((r,j)=>r.map((x,k)=>k===i?v[j]:x));return [0,1,2].map(i=>{const m=col(i);return d(m[0],m[1],m[2])/D;});}
function tipOf(Q,ext){const a=Q[4],b=Q[5],u=ext/.30;return [a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];}
const RM=CFG.radius/PXM;      // hit radius in render metres
let EXT=0;                    // crescent tip extension along the blade so the farthest tip point reaches the hit radius (fitted once, E data)
function reach(ext){let m=0;for(const s of CFG.seq){if(s.b-s.a<2)continue;for(let f=s.a;f<=s.b+1e-6;f+=.25){const Q=A0.q[qk(f)],h=unproj(Q[6]),t=unproj(tipOf(Q,ext));m=Math.max(m,Math.hypot(t[0]-h[0],t[1]-h[1]));}}return m;}
try{let lo=0,hi=2.5;if(reach(0)>=RM)EXT=0;else{for(let i=0;i<30;i++){const m=(lo+hi)/2;if(reach(m)<RM)lo=m;else hi=m;}EXT=lo;}L.ext={ext:+EXT.toFixed(3),reachM:+reach(EXT).toFixed(3),radiusM:+RM.toFixed(3),reach0:+reach(0).toFixed(3)};}catch(e){L.err='fit '+e.message;}
const WHITE=[255,246,222],GOLD=[255,196,84],RIM=[255,138,40],DUST=[176,150,114],SW=[255,255,255],SR2=[196,214,238],SDUST=[226,230,236];
const rgba=(c,a)=>`rgba(${c[0]},${c[1]},${c[2]},${Math.max(0,Math.min(1,a)).toFixed(3)})`;
const envT=(d,pre,post)=>d<-pre||d>post?0:(d<=0?.35+.65*Math.pow((d+pre)/pre,1.5):Math.pow(1-d/post,1.6));
/* ---- blade-trail crescents, one per beat ---- */
function crescents(t,L_){
  for(let k=0;k<NH;k++){
    const last=k===NH-1,e=envT(t-hitT(k),.07,last?.16:.11)*(last?1:.85);if(e<=.02)continue;
    const Lt=last?CFG.fx.trailLast:CFG.fx.trail,n0=Math.max(3,Math.round(Lt*120)),ts=[];
    for(let j=0;j<=n0;j++){const tt=t-Lt+Lt*j/n0;if(tt>=0)ts.push(tt);}const n=ts.length;if(n<2)continue;
    const bw=last?.42:.30,LAY=last?[[0,RIM,.45,1.3],[0,GOLD,.8,1],[1,WHITE,1,1]]:[[1,GOLD,.8,1],[2,WHITE,1,1]];
    for(const [j0,col,kk,wid] of LAY){
      const B=ts.map((tt,i)=>{const Q=qAt(srcFrame(tt)),u=i/(n-1),w=Math.pow(Math.sin(Math.PI*Math.min(1,u*1.1)),.7)*wid,tip=tipOf(Q,EXT),inn=Q[j0];
        return {o:W(tip),i:W([tip[0]+(inn[0]-tip[0])*(.10+bw*Math.min(1,w)),tip[1]+(inn[1]-tip[1])*(.10+bw*Math.min(1,w))]),d:tip[2]-Q[6][2]};});
      for(let i=0;i<n-1;i++){const u=(i+1)/(n-1),al=e*Math.pow(u,1.2)*kk,back=(B[i].d+B[i+1].d)/2>.05;if(back!==L_.back||al<.02)continue;const c=L_.ctx;
        c.fillStyle=rgba(col,al);c.beginPath();c.moveTo(B[i].o[0],B[i].o[1]);c.lineTo(B[i].i[0],B[i].i[1]);c.lineTo(B[i+1].i[0],B[i+1].i[1]);c.lineTo(B[i+1].o[0],B[i+1].o[1]);c.closePath();c.fill();}}}}
/* ---- thin broken ground ring per beat (pulse, never a solid disc) ---- */
let C0=[0,0,0];
function rings(t,L_){const c=L_.ctx;
  for(let k=0;k<NH;k++){
    const last=k===NH-1,life=last?CFG.fx.ringLifeLast:CFG.fx.ringLife,a=t-hitT(k);if(a<0||a>=life)continue;const u=a/life;
    const al=(last?.95:.42)*Math.pow(1-u,1.3),rr=RM*((last?.72:.84)+(last?.38:.16)*Math.pow(u,.6)),ph=u*.9+k*.7;
    c.lineWidth=Math.max(1.4,(last?6.5:3.4)*(1-u*.6)*K*2.2);
    for(let i=0;i<48;i++){const on=last?(i%16<13):(i%12<5);if(!on)continue;
      const a0=i/48*2*Math.PI+ph,a1=(i+1)/48*2*Math.PI+ph,am=(a0+a1)/2,back=depth3(Math.cos(am),Math.sin(am),0)>0;if(back!==L_.back)continue;
      const p=W(px3(C0[0]+Math.cos(a0)*rr,C0[1]+Math.sin(a0)*rr,.02)),q=W(px3(C0[0]+Math.cos(a1)*rr,C0[1]+Math.sin(a1)*rr,.02));
      c.strokeStyle=rgba(GOLD,al*.9);c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(q[0],q[1]);c.stroke();
      c.strokeStyle=rgba(WHITE,al*.55);c.lineWidth=Math.max(1,c.lineWidth*.4);c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(q[0],q[1]);c.stroke();c.lineWidth=Math.max(1.4,(last?6.5:3.4)*(1-u*.6)*K*2.2);}}}
/* ---- light gathering along the blade just before the first beat (sweep into the spin) ---- */
function windup(t,L_){const a=.12,b=CFG.time.first+.02;if(t<a||t>b||L_.back)return;const u=Math.min(1,(t-a)/(CFG.time.first-a)),fade=t>CFG.time.first?Math.max(0,1-(t-CFG.time.first)/.02):1,c=L_.ctx,fs=srcFrame(t);
  const ts=[];for(let tt=t-.07;tt<=t+1e-6;tt+=1/120)if(tt>=0)ts.push(tt);
  for(let i=0;i<ts.length-1;i++){const Q0=qAt(srcFrame(ts[i])),Q1=qAt(srcFrame(ts[i+1])),v=(i+1)/(ts.length-1),al=.55*u*fade*Math.pow(v,1.3);if(al<.02)continue;
    const a0=W(Q0[1]),b0=W(Q0[5]),a1=W(Q1[1]),b1=W(Q1[5]);c.fillStyle=rgba(GOLD,al);c.beginPath();c.moveTo(a0[0],a0[1]);c.lineTo(b0[0],b0[1]);c.lineTo(b1[0],b1[1]);c.lineTo(a1[0],a1[1]);c.closePath();c.fill();}
  const Q=qAt(fs),h=W(Q[0]),tp=W(Q[5]),g=c.createLinearGradient(h[0],h[1],tp[0],tp[1]);g.addColorStop(0,rgba(GOLD,.12*fade));g.addColorStop(.55,rgba(WHITE,.6*u*fade));g.addColorStop(1,rgba(WHITE,.9*u*fade));
  c.lineCap='round';c.strokeStyle=rgba(GOLD,.55*u*fade);c.lineWidth=(5+5*u)*K*2.2;c.beginPath();c.moveTo(h[0],h[1]);c.lineTo(tp[0],tp[1]);c.stroke();
  c.strokeStyle=g;c.lineWidth=(2.2+2.8*u)*K*2.2;c.beginPath();c.moveTo(h[0],h[1]);c.lineTo(tp[0],tp[1]);c.stroke();c.lineCap='butt';}
/* ---- spark flash on every monster hit ---- */
function sparks(t,L_){if(L_.back)return;const c=L_.ctx,SS_=S||L.last;if(!SS_)return;
  for(const h of SS_.contacts){const a=t-h.t,life=h.last?.14:.10;if(a<0||a>=life)continue;const u=a/life,fS=h.last?1.25:.85;
    const dx=AN.x-h.x,dy=AN.y-h.y,Ln=Math.hypot(dx,dy)||1,x=h.x+dx/Ln*h.sz*.6,y=h.y-h.sz*(.8+.15*(h.k%3))+dy/Ln*h.sz*.3,fl=(12*fS*(1-u)+3)*K*2.2;
    c.fillStyle=rgba(WHITE,(h.last?.85:.92)*Math.pow(1-u,1.6));c.beginPath();c.ellipse(x,y,fl,fl*.8,0,0,6.283);c.fill();
    let r=h.seed*977+13;const rnd=()=>{r=(r*16807)%2147483647;return r/2147483647;};c.lineWidth=Math.max(1,3.5*K*2.2);c.strokeStyle=rgba(GOLD,1-u);
    const nn=h.last?14:7;for(let i=0;i<nn;i++){const an=rnd()*6.283,Lr=(26+rnd()*30)*fS*(.6+u*1.1)*K*2.2,L0=Lr*u*.55;c.beginPath();c.moveTo(x+Math.cos(an)*L0,y+Math.sin(an)*L0*.8);c.lineTo(x+Math.cos(an)*Lr,y+Math.sin(an)*Lr*.8);c.stroke();}}}
/* ---- dust / soil chips at the feet (world particles, spawned at the real toe joints) ---- */
const PRT=[],MARK=[];let rs=11;const R=()=>{rs=(rs*16807)%2147483647;return rs/2147483647;};let T30=0;
const G2W=(X,Y)=>[(AF.x[0]*X+AF.y[0]*Y)*K,(AF.x[1]*X+AF.y[1]*Y)*K],ZUP=z=>[AF.z[0]*z*K,AF.z[1]*z*K];
function puffs(x,y,n,dirs,spd,up,r0,r1,life,spread,lag){for(let i=0;i<n;i++){const d=dirs[i%dirs.length],a=Math.atan2(d[1],d[0])+(R()*2-1)*spread,v=spd[0]+R()*(spd[1]-spd[0]);
  PRT.push({k:'d',t0:T30+R()*lag,x:x+(R()-.5)*4,y:y+(R()-.5)*4,vx:Math.cos(a)*v,vy:Math.sin(a)*v,vz:up[0]+R()*(up[1]-up[0]),r0:r0[0]+R()*(r0[1]-r0[0]),r1:r1[0]+R()*(r1[1]-r1[0]),life:life[0]+R()*(life[1]-life[0]),tone:(R()-.5)*.24});}}
function chips(x,y,n,dirs,spd,vz){for(let i=0;i<n;i++){const d=dirs[i%dirs.length],a=Math.atan2(d[1],d[0])+(R()*2-1)*.35,v=spd[0]+R()*(spd[1]-spd[0]);
  PRT.push({k:'c',t0:T30,x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,vz:vz[0]+R()*(vz[1]-vz[0]),s:.02+R()*.02,life:7+R()*4,rot:R()*6.3,w:(R()-.5)*1.2});}}
const toe=(side,fr)=>{const f=A.f[Math.round(fr)]||A.f[String(Math.round(fr))];return W(f[side+'ToeBase']);};
const outFan=(p,hp,spread)=>{const dx=p[0]-hp[0],dy=p[1]-hp[1],Ln=Math.hypot(dx,dy)||1,I=A.affInv,gx=I[0][0]*dx/Ln+I[0][1]*dy/Ln,gy=I[1][0]*dx/Ln+I[1][1]*dy/Ln,g=Math.atan2(gy,gx);return spread.map(o=>[Math.cos(g+o),Math.sin(g+o)]);};
function emitAt(ev,t){const fs=srcFrame(t),hp=W(px3(hipsW(fs)[0],hipsW(fs)[1],0)),d8=[...Array(8).keys()].map(i=>[Math.cos(i*.785),Math.sin(i*.785)]);
  if(ev==='open'){for(const side of ['Right','Left']){const p=toe(side,fs),fan=outFan(p,hp,[-.5,0,.5]);puffs(p[0],p[1],10,fan,[1.5,4],[.1,.6],[.03,.05],[.08,.18],[10,15],.4,2);}}
  else if(ev==='mid'){for(const side of ['Right','Left']){const p=toe(side,fs),fan=outFan(p,hp,[-.6,-.2,.2,.6]);puffs(p[0],p[1],9,fan,[2,5.5],[.1,.5],[.03,.055],[.1,.22],[9,14],.3,1.5);}}
  else if(ev==='last'){for(const side of ['Right','Left']){const p=toe(side,fs),fan=outFan(p,hp,[-.7,-.35,0,.35,.7]);puffs(p[0],p[1],26,fan,[4.5,10],[.05,.35],[.04,.07],[.14,.32],[11,17],.18,1);chips(p[0],p[1],8,fan,[2.6,4.4],[.9,1.6]);}}}
const EVT=[['open',.05]];for(let k=1;k<NH-1;k+=2)EVT.push(['mid',hitT(k)]);EVT.push(['last',hitT(NH-1)]);
/* ---- "พายุดาบ": low cone of thin orange-gold wind ribbons round the hero, white-warm waist sweeps, soft ground dust (FX only) ---- */
const SR=(()=>{let r=5;const q=()=>{r=(r*16807)%2147483647;return r/2147483647;};const a=[];for(let i=0;i<40;i++)a.push({ph:q(),w:.85+q()*.3,th:q()*6.283,tl:.55+q()*.45,hz:.75+q()*.25,wd:.8+q()*.6,hue:q()});return a;})();
function stormState(t){const C=CFG.storm,tL=hitT(NH-1),form=ss((t-C.formIn)/C.formDur);let b=0;
  if(t>tL)b=Math.min(1,(t-tL)/C.burstDur);
  const al=(t>tL?Math.pow(1-b,1.3):1)*Math.min(1,form*3);
  let pulse=0;for(let k=0;k<NH;k++)pulse=Math.max(pulse,envT(t-hitT(k),.05,.12));
  return {on:al>.015,hp:form,rs:(.35+.65*ss(form*1.15))*(1+.55*b),hs:1-.38*b,al,b,pulse};}
/* soft cloud sprites (pre-rendered once: lit / mid / shade / warm tones of grey-white smoke, and tan dust) */
const TONES={lit:[[250,243,230],[226,214,196]],mid:[[212,208,202],[170,168,168]],shade:[[134,136,146],[92,94,106]],warm:[[246,228,190],[214,190,150]],d1:[[196,174,140],[150,128,98]],d2:[[168,148,116],[116,98,76]]};
const SPR=(()=>{const out={};let r=77;const q=()=>{r=(r*16807)%2147483647;return r/2147483647;};
  for(const nm in TONES){out[nm]=[];for(let v=0;v<4;v++){const cv=document.createElement('canvas');cv.width=cv.height=96;const g=cv.getContext('2d'),[lc,dc]=TONES[nm],C0_=48;
    for(let i=0;i<16;i++){const an=q()*6.283,d=q()*.34*C0_,x=C0_+Math.cos(an)*d,y=C0_+Math.sin(an)*d,rr=C0_*(.34+q()*.28),sh=(Math.cos(an+.8)*.5+.5),c=[0,1,2].map(k=>Math.round(lc[k]*(1-sh)+dc[k]*sh)),gr=g.createRadialGradient(x,y,0,x,y,rr);
      gr.addColorStop(0,`rgba(${c[0]},${c[1]},${c[2]},.8)`);gr.addColorStop(1,`rgba(${c[0]},${c[1]},${c[2]},0)`);g.fillStyle=gr;g.beginPath();g.arc(x,y,rr,0,6.283);g.fill();}
    g.globalCompositeOperation='destination-in';const m=g.createRadialGradient(C0_,C0_,C0_*.25,C0_,C0_,C0_);m.addColorStop(0,'rgba(0,0,0,1)');m.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=m;g.fillRect(0,0,96,96);out[nm].push(cv);}}return out;})();
const TP=(()=>{let r=31;const q=()=>{r=(r*16807)%2147483647;return r/2147483647;};const C=CFG.storm,P_=[],D_=[],R_=[],S_=[];
  for(let i=0;i<C.puffs;i++)P_.push({ph:q(),rise:.8+q()*.45,th:q()*6.283,rho:1-.72*q()*q(),sz:.7+q()*.7,v:Math.floor(q()*4),w:q(),wob:q()*6.283,tone:q(),rot:q()*6.283,rs:(q()-.5)*3});
  for(let i=0;i<C.dust;i++)D_.push({ph:q(),rise:.55+q()*.6,th:q()*6.283,ex:.15+q()*.9,sz:.6+q()*.9,v:Math.floor(q()*4),w:q(),rot:q()*6.283,tone:q()});
  for(let i=0;i<C.rocks;i++)R_.push({ph:q(),rise:.25+q()*.5,th:q()*6.283,ex:1.05+q()*.95,sz:.018+Math.pow(q(),2.2)*.085,spin:(q()-.5)*14,w:.7+q()*.6,hue:q(),shape:5+Math.floor(q()*3),rot:q()*6.283,low:q()<.35});
  for(let i=0;i<C.streaks;i++)S_.push({ph:q(),th:q()*6.283,len:.3+q()*.3,wd:.03+q()*.05,rise:.7+q()*.4,dark:i%3===2,w:q()});
  return {P:P_,D:D_,R:R_,S:S_};})();
const rcone=(u,st)=>{const C=CFG.storm;return (C.rb+(C.rt-C.rb)*Math.pow(u,1.35))*st.rs;};
const thAt=(th0,u,t)=>th0+2*Math.PI*CFG.storm.spin*t-CFG.storm.twist*u;   // grows with t -> clockwise on screen (same sense as the hero)
const gpt=(R_,th,z)=>W(px3(C0[0]+R_*Math.cos(th),C0[1]-R_*Math.sin(th),z));
const isBack=th=>depth3(Math.cos(th),-Math.sin(th),0)>0;
const LIGHT=-2.2;   // screen direction the light comes from (up-left)
function stamp(c,spr,x,y,r,rot,sx,al){if(al<.01)return;c.globalAlpha=al;c.save();c.translate(x,y);c.rotate(rot);c.scale(sx,1);c.drawImage(spr,-r,-r,2*r,2*r);c.restore();}
function storm(t,L_){const C=CFG.storm;if(!C.on)return;const st=stormState(t);if(!st.on)return;const c=L_.ctx,H=C.H*st.hs,baseA=(L_.back?C.backA:C.frontA)*st.al*(1+.25*st.pulse),sK=PXM;
  /* 1. ground dust lifted from the foot and spiralling up round the column (tan, low) */
  for(const d of TP.D){const u=((d.ph+t*d.rise*.6)%1)*.62;if(u>st.hp*.9)continue;const th=thAt(d.th,u*1.2,t)*1.05,R0=rcone(u,st)+d.ex*(1-u/.62)*.8*st.rs,z=H*u*.8,back=isBack(th);if(back!==L_.back)continue;
    const p=gpt(R0,th,z),fd=Math.min(1,u/.06)*Math.min(1,(.62-u)/.2),r=(.1+.14*d.sz)*sK*(1+.1*st.pulse),sh=.5+.5*Math.cos(Math.atan2(p[1]-AN.y,p[0]-AN.x)-LIGHT);
    stamp(c,SPR[sh>.5?'d1':'d2'][d.v],p[0],p[1],r*1.5,d.rot+t*.6,1.5,(L_.back?.55:.32)*st.al*fd*(.5+.5*d.w));}
  /* 2. the column: soft smoke puffs on a funnel shell (inside too), stretched along the flow, sorted thin/thick */
  for(const q of TP.P){const u=((q.ph+t*C.rise*q.rise*.5)%1);const vis=Math.min(1,Math.max(0,(st.hp-u)/.14));if(vis<=0)continue;
    const th=thAt(q.th,u,t),R0=rcone(u,st)*q.rho*(1+.08*Math.sin(t*3.1+q.wob)),z=H*u,back=isBack(th);if(back!==L_.back)continue;
    const p=gpt(R0,th,z),p2=gpt(R0,th+.18,z),ang=Math.atan2(p2[1]-p[1],p2[0]-p[0]),thick=.5+.5*Math.sin(th*2.1+u*9-t*5.2+q.wob),dens=.35+.65*thick;
    const fade=Math.min(1,u/.07)*Math.min(1,(1-u)/.18)*vis,sh=.5+.5*Math.cos(ang+Math.PI/2-LIGHT+(back?0:.4))*.9+(q.tone-.5)*.45,nm=sh>.7?(q.tone<C.gold*1.4?'warm':'lit'):sh>.38?'mid':'shade';
    const r=(.12+.34*u)*q.sz*(1+.14*Math.sin(t*4.4+q.wob)+.1*st.pulse)*st.rs*sK;
    stamp(c,SPR[nm][q.v],p[0],p[1],r,ang+q.rs*t*.15,1.35+.5*thick,baseA*dens*fade);}
  /* 3. thin curved shell streaks (the spiral skin): light and shade ribbons, soft, wider at the top */
  c.lineCap='round';
  for(const s of TP.S){const u0=((s.ph+t*C.rise*s.rise*.35)%1),N=12,pts=[];for(let j=0;j<=N;j++){const uu=u0-s.len*(j/N);if(uu<0)break;pts.push({u:uu,th:thAt(s.th,uu,t)-j/N*.5,f:1-j/N});}
    if(pts.length<3)continue;const fd=Math.sin(Math.PI*Math.min(1,u0));
    for(let j=0;j<pts.length-1;j++){const a=pts[j],b=pts[j+1],am=(a.th+b.th)/2;if(isBack(am)!==L_.back||a.u>st.hp)continue;
      const al=Math.min(1,baseA*1.5*fd*(.35+.65*a.f));if(al<.015)continue;const P1=gpt(rcone(a.u,st)*1.02,a.th,H*a.u),P2=gpt(rcone(b.u,st)*1.02,b.th,H*b.u);
      c.strokeStyle=s.dark?`rgba(92,96,108,${al*.9})`:`rgba(255,250,238,${al})`;c.lineWidth=Math.max(1,s.wd*(.6+a.u*1.6)*(.4+.6*a.f)*sK*1.6);c.beginPath();c.moveTo(P1[0],P1[1]);c.lineTo(P2[0],P2[1]);c.stroke();}}
  c.lineCap='butt';c.globalAlpha=1;}
/* earth chips and stones lifted by the tornado: irregular sizes, scattered phases, orbiting outside the column (FX only) */
function rocks(t,L_){const C=CFG.storm;if(!C.on||!C.rocks)return;const st=stormState(t);if(!st.on)return;const c=L_.ctx,H=C.H*st.hs,b=st.b;
  for(const r of TP.R){const u=r.low?((r.ph+t*r.rise*.45)%1)*.5:((r.ph+t*r.rise*.45)%1)*.95,th=thAt(r.th,u,t)*r.w+b*2.2;if(u>st.hp)continue;
    const back=isBack(th);if(back!==L_.back)continue;const R0=rcone(u,st)*r.ex+.12*st.rs+b*b*.9,z=Math.max(.02,H*u*(1+.1*Math.sin(t*5+r.ph*9))-b*b*H*.7),p=gpt(R0,th,z),
      sz=Math.max(2,r.sz*PXM*1.2),al=Math.min(1,st.al*1.5)*Math.min(1,u/.05),rot=r.rot+t*r.spin;
    c.save();c.globalAlpha=1;c.translate(p[0],p[1]);c.rotate(rot);c.fillStyle=`rgba(${96+Math.round(r.hue*34)},${88+Math.round(r.hue*26)},${78+Math.round(r.hue*22)},${al.toFixed(3)})`;c.strokeStyle=`rgba(52,46,40,${(al*.8).toFixed(3)})`;c.lineWidth=Math.max(1,sz*.16);
    c.beginPath();for(let k=0;k<r.shape;k++){const an=k/r.shape*6.283,rd=sz*(k%2?.7:1.05);k?c.lineTo(Math.cos(an)*rd,Math.sin(an)*rd*.8):c.moveTo(Math.cos(an)*rd,Math.sin(an)*rd*.8);}c.closePath();c.fill();c.stroke();
    c.fillStyle=`rgba(204,198,188,${(al*.45).toFixed(3)})`;c.beginPath();c.moveTo(-sz*.5,-sz*.35);c.lineTo(sz*.2,-sz*.6);c.lineTo(sz*.1,-sz*.1);c.closePath();c.fill();c.restore();}}
function swirl(){}
const DUSTK=1.6;
function dustDraw(t,L_,footY){const c=L_.ctx,fr=t*30;
  for(const p of PRT){const a=fr-p.t0;if(a<0||a>=p.life)continue;const u=a/p.life;
    if(p.k==='d'){const ease=1-Math.pow(1-Math.min(1,a/(p.life*.22)),3),drag=1-Math.exp(-a/7),gm=G2W(p.vx*drag*7/30,p.vy*drag*7/30),zu=ZUP(p.vz*drag*7/30),gx=p.x+gm[0],gy=p.y+gm[1];if((gy>=footY)===L_.back)continue;
      const r=DUSTK*(Math.max(p.r0,p.r1*.45)+(p.r1-Math.max(p.r0,p.r1*.45))*ease)*AF.x[0]*K,al=Math.min(1,a)*Math.pow(1-u,1.4)*.78,x=gx+zu[0],y=gy+zu[1],cc=DUST.map(v=>Math.round(v*(1+p.tone)));
      const g=c.createRadialGradient(x-r*.18,y-r*.22,r*.1,x,y,r);g.addColorStop(0,`rgba(${cc[0]+40},${cc[1]+36},${cc[2]+30},${al})`);g.addColorStop(1,`rgba(${cc[0]},${cc[1]},${cc[2]},0)`);c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,6.283);c.fill();}
    else{const tt=a/30,z=Math.max(0,.02+p.vz*tt-4.9*tt*tt*1.6),gm=G2W(p.vx*tt*.8,p.vy*tt*.8),zu=ZUP(z),gx=p.x+gm[0],gy=p.y+gm[1];if((gy>=footY)===L_.back)continue;
      const s=Math.max(2,p.s*AF.x[0]*K),x=gx+zu[0],y=gy+zu[1],ang=p.rot+p.w*a,al=1-Math.max(0,u-.7)/.3;c.fillStyle=`rgba(120,96,70,${al})`;c.save();c.translate(x,y);c.rotate(ang);c.fillRect(-s,-s*.7,s*2,s*1.4);c.restore();}}}
function layer(t,back,footY){const c=ctx,L_={ctx:c,back};c.save();c.globalCompositeOperation='source-over';
  dustDraw(t,L_,footY);storm(t,L_);rocks(t,L_);c.shadowColor='rgba(255,214,120,.85)';c.shadowBlur=7;
  rings(t,L_);windup(t,L_);crescents(t,L_);sparks(t,L_);c.restore();}
/* ================================================= hero sprite hook ================================================= */
const BLEND_IN=.10,BLEND_OUT=.08;let EX=null,seen=-1,lastT=-1;
function skillSprite(d,i,x,y,alpha){const dd=DATA[d],r=dd.rects[i];if(!r||!okI(IMG[d]))return;ctx.save();ctx.globalAlpha=alpha;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.drawImage(IMG[d],r[0],r[1],r[2],r[3],x+(r[4]-F.ax)*K,y+HD.footY+(r[5]-F.ay)*K,r[2]*K,r[3]*K);ctx.restore();}
const idxOf=fs=>Math.max(0,Math.min(N-1,Math.floor(fs-F0+.06)));
{const o=drawPlayerSprite;drawPlayerSprite=function(x,y,bob,fa){
  const s=S,ov=SPR_OVR.player;
  if(!s||!L.test||!ov||!ov.hero3d||!s.anim||!okI(IMG[s.d])){   // not casting: exit blend (the last skill frame fades out over the normal sprite)
    if(TAIL&&!s&&L.fx&&ov&&ov.hero3d){const tt=CFG.time.end+(clk()-TAIL.t);if(tt<CFG.time.end+CFG.storm.tail&&A&&DATA[TAIL.d]){try{AN={x,y:y+HD.footY};const fy=AN.y-1;layer(tt,true,fy);const rr=o.apply(this,arguments);if(EX&&okI(IMG[EX.d])){const u=(clk()-EX.t)/BLEND_OUT;if(u>=0&&u<1)skillSprite(EX.d,EX.i,x,y,1-ss(u));}layer(tt,false,fy);return rr;}catch(e){L.err='tail '+e.message;}}else TAIL=null;}
    if(EX&&ov&&ov.hero3d&&!s&&okI(IMG[EX.d])){const u=(clk()-EX.t)/BLEND_OUT;if(u>=0&&u<1){const r=o.apply(this,arguments);try{skillSprite(EX.d,EX.i,x,y,1-ss(u));}catch(e){}return r;}EX=null;}
    return o.apply(this,arguments);}
  try{
    if(s.id!==seen){seen=s.id;TAIL=null;PRT.length=0;MARK.length=0;lastT=-1;rs=11+s.id;A=DATA[s.d];C0=[0,0,0];}
    const t=Math.min(CFG.time.end,s.t),fs=srcFrame(t),i=idxOf(fs);AN={x,y:y+HD.footY};const footY=AN.y-1;T30=t*30;
    if(L.fx){for(const [ev,te] of EVT)if(lastT<te&&t>=te){try{emitAt(ev,te);}catch(e){L.err='emit '+e.message;}}}
    if(L.fx)layer(t,true,footY);
    const bi=s.t<BLEND_IN?ss(s.t/BLEND_IN):1;if(bi<1)o.apply(this,arguments);
    const sg=segAt(t),sq=CFG.seq[sg],ux=sq.xf?(t-sq.t0)/sq.xf:2;
    if(sg>0&&ux<1){skillSprite(s.d,idxOf(CFG.seq[sg-1].b),x,y,bi);skillSprite(s.d,i,x,y,bi*ss(ux));}else skillSprite(s.d,i,x,y,bi);   // short cross-fade at the seam between two segments
    EX={t:clk(),i,d:s.d};H.anchor={x:AN.x,y:AN.y};L.frames++;L.lastFrame=F0+i;
    if(L.fx)layer(t,false,footY);
    lastT=t;
  }catch(e){L.err='draw '+e.message;return o.apply(this,arguments);}
};}
/* ---------------- key (TEST / public mode only) ---------------- */
window.addEventListener('keydown',e=>{if(!L.test)return;if((e.key==='b'||e.key==='B')&&!e.repeat){const a=document.activeElement;if(a&&/INPUT|TEXTAREA/.test(a.tagName))return;start();}});
L.setTest=on=>{L.test=!!on;if(!on)finish('test mode off');};
}catch(e){L.err='init '+e.message;}
})();

