
/* ---- bow3-r1 (TEST allin_r20, 12 Nov 2026): bow BASIC ATTACK = Motion's 3-click combo (DeaRz passed 04:51 / 04:53) + Art FX r2 (passed 07:47) ----
   Files (bow_combo_r9): bow_combo.js (PUPPET.WEAPON_KF bow_c1..3, BOWC, bowPose), bow_nostring.js (stringless bow, string drawn by code), fx_bow_art_r2.js (BOW3FX: shots, release, impacts, charge, dust). drawc.js is NOT loaded twice: the scythe's drawCombo (same wrapper, the bow never sets p.over / p.turn) is reused.
   * input (same as the scythe): a basic-attack press with no click running starts click 1; a press while a click runs is buffered and starts the next click when it ends; the chain resets to click 1 after 0.5 s idle; clicks 1-2 take 1/ASPD seconds (ASPD = the weapon's attacks per second), click 3 uses click 1's factor (5/s = 0.47 s);
   * hits: one hit per click: release for the shooter, arrival for each target; clicks 1-2 stop at the first monster in line, click 3 (heavy, 1.6x) pierces every monster in line: first target 100 %, others 70 %, no cap; |dy| < 40 px of the shooter; every hit shows its own number (cap 99,999), no knockback;
   * damage (Balance, as a multiple of the bow basic hit): click 1 0.50, click 2 0.45, click 3 1.40 (2.35 per chain) x CAL 3.15 (one calibration, measured on a dummy: the chain on a single dummy = 85 % of the sword basic DPS at ASPD about 2.5/s); ?bow3bal=off = placeholders 1 / 1 / 2.6;
   * arrow slot restored right before the hero draw, string drawn by code (follows the hand, snaps back), backflip rotation mirrored when facing left, stringless bow only during the combo;
   * all FX run in demo units (hero scale 0.1485) under a transform scale(+-r, r) with r = game hero scale / 0.1485, mirrored for left shots; extra layers: push functions (ctx, t, side) into window.BOW3.layers.
   ?bow3=off = the old bow basic attack. Debug: window.BOW3 ---- */
(function(){'use strict';
const Q=String(location.search),OFF=/[?&]bow3=off\b/.test(Q),BALOFF=/[?&]bow3bal=off\b/.test(Q);
const S=window.BOW3={ver:'bow3-r1',on:!OFF,err:null,A:null,lastN:0,lastEnd:-99,root:0,TL:{shots:[],imp:[],clicks:[]},layers:[],
  stats:{clicks:[0,0,0,0],hits:0,dmg:0,chains:0,shots:0,drawMs:0,draws:0,maxMs:0,fxMs:0,fxN:0},
  cfg:{CAL:3.15,MULT:{1:.5,2:.45,3:1.4},PLACEHOLDER:{1:1,2:1,3:2.6},RESET:.5,DY:40,PIERCE2:.7,CAP:99999,SPD:{n:1300,h:1750},DEMO_SC:.1485,STOP:14,RANGE:370,WALL:!/[?&]bow3wall=off\b/.test(Q)},bal:!BALOFF};
if(OFF)return;
const ERR=(w,e)=>{S.err=w+': '+((e&&e.message)||e);try{console.error('[BOW3]',w,e)}catch(_){}};
const PU=()=>window.PUPPET,held=()=>!!(typeof P!=='undefined'&&P&&P.weapon&&P.weapon.t==='bow');
const rate=()=>{try{return Math.max(.4,Math.min(8,aspdHits()))}catch(_){return 2}};
function ready(){return !!(window.BOWC&&window.bowPose&&window.drawCombo&&window.BOW3FX&&PU()&&PU().WEAPON_KF&&PU().WEAPON_KF.bow_c1&&PU().solve&&PU().footY)}
let NS=null;(function(){try{if(!window.BOW_NOSTRING)return;const im=new Image();im.onload=()=>{im._ns=1;NS=im};im.src=window.BOW_NOSTRING}catch(e){ERR('nostring',e)}})();
const fOf=n=>{const R=rate();return n===2?BOWC[2].dur*R:BOWC[1].dur*R};
/* ---------------- click clock ---------------- */
const durOf=A=>BOWC[A.n].dur/A.f,endT=A=>A.T0+durOf(A),qOf=(A,t)=>Math.max(0,Math.min(1,(t-A.T0)/durOf(A)));
function facePress(){try{const tg=typeof aimPoint==='function'?aimPoint():null;if(tg)P.face=Math.atan2(tg.y-P.y,tg.x-P.x);else{let best=null,bd=420;for(const e of enemies){if(e.dead)continue;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<bd){bd=d;best=e}}if(best)P.face=Math.atan2(best.y-P.y,best.x-P.x)}}catch(_){}}
/* ---- bowaim-r1 (TEST allin_r92, 15 Nov 2026, DeaRz 00:05 "อาชีพธนู ยิงได้ทุกทิศ"): the bow basic attack + 3-click combo shoot along the REAL angle to the target / mouse / tap point ----
   hit line = from the arrow tip along that angle (|perpendicular| < 40 px, same band as before); arrow sprite + release + impact FX are drawn rotated along it (same art, same speed);
   the body still faces left / right; the bow arm + bow + arrow in hand tilt toward the aim, limited to +-60 deg; beyond that only the flying arrow follows the real angle.
   ?bowaim=off = old behaviour (horizontal only). Debug: window.BOW3.aim ---- */
const AIM=S.aim={on:!/[?&]bowaim=off\b/.test(Q),side:1,phi:0,e:0,lim:60,sgn:1,shots:0,rot:0,vert:0};
const wA=a=>Math.atan2(Math.sin(a),Math.cos(a)),cl=(v,a,b)=>Math.max(a,Math.min(b,v));
/* aim source: 1 aim drag / touch aim (aimPoint, not on the hero) 2 the locked target (TLOCK) 3 the nearest monster within 420 4 nothing = old horizontal shot */
function aimTarget(){try{const q=typeof aimPoint==='function'?aimPoint():null;if(q&&isFinite(q.x)&&isFinite(q.y)&&Math.hypot(q.x-P.x,q.y-P.y)>4)return{x:q.x,y:q.y}}catch(_){}
  try{const T=window.TLOCK,e=T&&T.e;if(e&&!e.dead&&e.hp>0&&isFinite(e.x))return{x:e.x,y:e.y}}catch(_){}
  let best=null,bd=420;for(const e of enemies){if(e.dead||!(e.hp>0)||e.sprGhost)continue;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<bd){bd=d;best=e}}return best?{x:best.x,y:best.y}:null}
function aimFrom(ox,oy){const t=aimTarget();if(t&&(Math.abs(t.x-ox)>1||Math.abs(t.y-oy)>1))return Math.atan2(t.y-oy,t.x-ox);return null}
function phiOf(a,side){return cl(side>0?a:wA(Math.PI-a),-Math.PI/2,Math.PI/2)}
function aimStart(A){if(!AIM.on)return;const a=aimFrom(P.x,P.y);if(a!=null)P.face=a;A.side=Math.cos(P.face||0)>=0?1:-1;aimTick(A)}
function aimTick(A){if(!AIM.on){AIM.e=0;AIM.phi=0;return}const L=S.last,side=L&&L.fac?L.fac:(A.side||1),a=aimFrom(P.x,P.y);AIM.side=side;const phi=a==null?AIM.phi:phiOf(a,side);AIM.phi=phi;AIM.e=cl(-phi*180/Math.PI,-AIM.lim,AIM.lim)}
{const _bp=window.bowPose;if(_bp)window.bowPose=function(n,q){if(!AIM.on||!S.A||!AIM.e)return _bp(n,q);
  const U=PU(),K=U.WEAPON_KF&&U.WEAPON_KF['bow_c'+n],c=BOWC[n];if(!K||!K.keys||!K.keys.arm_far||!K.keys.arm_near)return _bp(n,q);
  const a0=c.arrow[0],h=c.hits[0],up=cl((q-(a0-.12))/.12,0,1),dn=cl((1-q)/(1-(h+.06)),0,1),env=Math.min(up*up*(3-2*up),dn*dn*(3-2*dn)),add=AIM.sgn*AIM.e*env;
  if(Math.abs(add)<.01)return _bp(n,q);
  const ka=K.keys.arm_near,kb=K.keys.arm_far,kw=K.world;
  try{K.keys.arm_near=ka.map(k=>[k[0],k[1]+add]);K.keys.arm_far=kb.map(k=>[k[0],k[1]+add]);K.world={arrow:[[0,270+add],[1,270+add]]};return _bp(n,q)}
  finally{K.keys.arm_near=ka;K.keys.arm_far=kb;K.world=kw}};}
function drawRot(t){const T=S.TL,L=S.last;if(!L)return;for(const s of T.shots){if(!s.rot)continue;const r=s.r;
  const TLs={shots:[s],imp:T.imp.filter(o=>o.sid===s.id),clicks:[]};
  ctx.save();ctx.translate(s.side*s.x0*r,s.y*r);ctx.scale(s.side,1);ctx.rotate(s.phi);ctx.scale(r,r);ctx.translate(-s.x0,-s.y);
  BOW3FX.set({cx:ctx,TL:TLs,HX:0,HY:0,SC:L.sc/r});window.__BOWPOSE=L.p;
  try{BOW3FX.drawRelease(t);BOW3FX.drawShots(t);BOW3FX.drawImpacts(t)}catch(e){ERR('rot fx',e)}
  ctx.restore()}}
function start(n,t){const A={n,f:fOf(n),T0:t,rel:0,buf:false,root:S.root,id:(S._id=(S._id||0)+1)};if(n===1)S.root=0,A.root=0;S.A=A;S.stats.clicks[n]++;facePress();try{aimStart(A)}catch(e){ERR('aim',e)}try{G.basicT=t;P.lastAtk=t}catch(_){}return A}
function press(){const t=time;if(!ready())return false;const A=S.A;
  if(!A){const n=(t-S.lastEnd<=S.cfg.RESET&&S.lastN>0&&S.lastN<3)?S.lastN+1:1;start(n,t);return true}
  if(A.n<3)A.buf=true;else A.buf=true;return true}
/* ---------------- damage ---------------- */
function hitFn(e,pct,tag){
  const hp0=e.hp,vx0=e.vx,vy0=e.vy;
  try{const A=C182.api,wd=(A.D().weapons.bow||A.D().weapons.sword),basic=wd.actionCoef*wd.weights.reduce((a,b)=>a+b,0);
    const id='bow3_'+tag,d={id,mode:'native',coefTotal:basic*pct/100,flatTotal:0,weights:[1],schedule:[0],maxTargets:1,targeting:'around',element:'Neutral'};
    const c=A.ctxFor('skill',id,d,{dt:'phys',lvScale:1,m0:1,reach:9999,cdId:'bowX'});
    hitEnemy(e,1,{dt:'phys',ctx:c,bow3:1,kb:0,knk:1})}catch(er){ERR('hit',er)}
  try{if(vx0!=null&&(e.vx!==vx0||e.vy!==vy0)){e.vx=vx0;e.vy=vy0}}catch(_){}
  const d=Math.max(0,hp0-Math.max(0,e.hp));S.stats.hits++;S.stats.dmg+=d;try{const b=(S.stats.by=S.stats.by||{});const o=(b[tag]=b[tag]||{n:0,d:0,pct:0});o.n++;o.d+=d;o.pct=pct}catch(_){}return d}
try{const _a=applyDamage;applyDamage=function(e,d,crit,o){if(o&&o.bow3){if(o.kb)o.kb=0;if(d>S.cfg.CAP)d=S.cfg.CAP}return _a.call(this,e,d,crit,o)}}catch(e){ERR('hook damage',e)}
/* ---------------- shots (timeline in demo units: x' = side * world x / r) ---------------- */
const rOf=sc=>sc/S.cfg.DEMO_SC;
function tipAt(p,x,y,sc){const U=PU(),W=U.solve(p),m=W.arrow,gy=U.footY(W),X=x-(p.lunge||0)*sc,Y=y-(p.air||0)*sc;
  const f=pt=>{const ax=m[0]*pt[0]+m[2]*pt[1]+m[4],ay=m[1]*pt[0]+m[3]*pt[1]+m[5];return[X-ax*sc,Y+(ay-gy)*sc]};return{tip:f([0,40]),tail:f([365,40])}}
function release(A,j){const c=BOWC[A.n],U=PU(),L=S.last;if(!L)return;const side=L.fac>0?1:-1,r=rOf(L.sc),heavy=c.shot==='heavy';
  const q=c.hitT[j]/c.dur-.004,p=window.bowPose(A.n,q);p.lunge+=A.root;
  const hxF=side*L.x/r,hyF=L.y/r,scF=L.sc/r,a=tipAt(p,hxF,hyF,scF);
  const t0=time,v=heavy?S.cfg.SPD.h:S.cfg.SPD.n,s={n:A.n,t0,x0:a.tip[0],y:a.tip[1],v,heavy,seed:A.n*10+j+A.id*3,end:null,side,r,id:(S._sid=(S._sid||0)+1)};S.TL.shots.push(s);S.stats.shots++;
  /* targets in line: from the arrow tip along the aim angle (horizontal when bowaim=off), |perpendicular| < DY */
  const x0w=side*s.x0*r,out=[];let dxr=side,dyr=0;
  if(AIM.on){const a2=aimFrom(x0w,P.y);if(a2!=null){const ph=phiOf(a2,side),wa=side>0?ph:wA(Math.PI-ph);dxr=Math.cos(wa);dyr=Math.sin(wa);if(Math.abs(ph)>.02){s.rot=true;s.phi=ph;s.wa=wa;AIM.rot++;if(Math.abs(ph)>1.2)AIM.vert++}}}
  AIM.shots++;
  /* bowrange-r1: FIXED travel for every shot (cfg.RANGE, world px from the arrow tip); only a wall (blocked()) can shorten it, never the target distance */
  let Rw=S.cfg.RANGE>0&&AIM.on?S.cfg.RANGE:1e9,wallAt=null;
  if(S.cfg.RANGE>0&&AIM.on&&S.cfg.WALL){for(let d=24;d<=Rw;d+=6){let b=false;try{b=typeof blocked==='function'&&blocked(x0w+dxr*d,P.y+dyr*d,2)}catch(_){}if(b){Rw=d;wallAt=d;break}}}
  for(const e of enemies){if(e.dead||!(e.hp>0))continue;const rx=e.x-x0w,ry=e.y-P.y,al=rx*dxr+ry*dyr,eg=(window.__EDGE&&__EDGE.on)?Math.max(0,(e.sz||16)-16):0;if(al<=-eg||al>Rw+eg)continue;if(Math.abs(rx*dyr-ry*dxr)>=S.cfg.DY+eg)continue;out.push({e,dx:Math.max(1,al)})}
  out.sort((a,b)=>a.dx-b.dx);
  const tg=heavy?out:out.slice(0,1),mult=S.bal?S.cfg.MULT[A.n]*S.cfg.CAL:S.cfg.PLACEHOLDER[A.n];
  tg.forEach((o,i)=>{const dF=o.dx/r,ex=s.x0+dF,ht=t0+Math.max(0,(dF-S.cfg.STOP)/v);
    S.TL.imp.push({m:{dx:0,dy:(o.e.y-P.y)/r},t:ht,x:ex-S.cfg.STOP,y:s.y,heavy,v:0,e:o.e,pct:mult*100*(i===0?1:S.cfg.PIERCE2),tag:'c'+A.n,done:false,side,rot:s.rot,sid:s.id});
    if(!heavy)s.end=ht});
  if(s.end==null){const far=tg.length?tg[tg.length-1]:null;s.end=(S.cfg.RANGE>0&&AIM.on)?t0+(Rw/r)/v:t0+((far?far.dx/r:1400)+200)/v}
  try{const lg=(S.rlog=S.rlog||[]);lg.push({px:Math.round(P.x),py:Math.round(P.y),tx:Math.round(x0w),n:A.n,travel:Math.round((s.end-t0)*v*r),hits:tg.length,wall:wallAt,ang:+(Math.atan2(dyr,dxr)*180/Math.PI).toFixed(1)});if(lg.length>60)lg.shift()}catch(_){}
  try{sfx('shoot','bow')}catch(_){}}
function applyImpacts(t){for(const o of S.TL.imp){if(!o.done&&t>=o.t){o.done=true;if(o.e&&!o.e.dead&&o.e.hp>0)hitFn(o.e,o.pct,o.tag)}}}
function prune(t){const T=S.TL;T.shots=T.shots.filter(s=>t<s.end+.7);T.imp=T.imp.filter(o=>t<o.t+.7||!o.done);T.clicks=T.clicks.filter(c=>t<c.t0+1.6)}
/* ---------------- per-frame logic ---------------- */
function tick(dt){try{if(typeof P==='undefined'||!P)return;const t=time;
  if(S.TL.imp.length)applyImpacts(t);
  const A=S.A;if(!A){if(S.TL.shots.length||S.TL.imp.length||S.TL.clicks.length)prune(t);return}
  if(P.dead||!held()){S.A=null;return}
  try{aimTick(A)}catch(e){ERR('aimTick',e)}const c=BOWC[A.n],el=t-A.T0;
  for(let j=A.rel;j<c.hitT.length;j++){if(el>=c.hitT[j]/A.f){release(A,j);A.rel=j+1}else break}
  if(t>=endT(A)){S.lastN=A.n;S.lastEnd=t;S.root+=window.bowEndLunge(A.n);S.A=null;if(A.n===3)S.stats.chains++;
    if(A.buf){const nx=A.n<3?A.n+1:1;if(nx===1)S.root=0;start(nx,t)}}
  prune(t)}catch(e){ERR('tick',e)}}
try{const _u=update;update=function(dt){const r=_u.apply(this,arguments);tick(dt);return r}}catch(e){ERR('hook update',e)}
try{const _b=basicAttack;basicAttack=function(){if(!S.on||!held()||!ready())return _b.apply(this,arguments);
  if(P.dead||P.dash||G.edit||P.casting)return;try{if(typeof stunned==='function'&&stunned())return}catch(_){}
  press()}}catch(e){ERR('hook basic',e)}
/* ---------------- drawing ---------------- */
const STR={top:[23,76],bot:[23,399],w:19,core:7};
function drawString(c,p,X0,Y0,sc,sg){const U=PU();if(!NS)return;const W=U.solve(p),m=W.offhand,a=W.arrow;if(!m)return;let dx,dy;const gy=U.footY(W),X=X0-(p.lunge||0)*sc*sg,Y=Y0-(p.air||0)*sc;
  const sp=(M,pt)=>{const ax=M[0]*pt[0]+M[2]*pt[1]+M[4],ay=M[1]*pt[0]+M[3]*pt[1]+M[5];return[X-sg*ax*sc,Y+(ay-gy)*sc]};
  const T=sp(m,STR.top),Bt=sp(m,STR.bot);let pts=[T,Bt];const s=Math.hypot(m[0],m[1])*sc;dx=Bt[0]-T[0];dy=Bt[1]-T[1];
  if(U.slots.arrow==='w_arrow'&&a){const n=sp(a,[352,40]),belly=sp(m,[100,240]),side=q=>dx*(q[1]-T[1])-dy*(q[0]-T[0]);
    if(side(n)*side(belly)<0&&p.pull>0){const M=[(T[0]+Bt[0])/2,(T[1]+Bt[1])/2];pts=[T,[M[0]+(n[0]-M[0])*p.pull,M[1]+(n[1]-M[1])*p.pull],Bt]}}
  else if(p.snap>=0&&p.snap<.16){const k=p.snap/.16,L=Math.hypot(dx,dy)||1,o=7*s*(1-k)*Math.sin(k*38);pts=[T,[(T[0]+Bt[0])/2-dy/L*o*19,(T[1]+Bt[1])/2+dx/L*o*19],Bt]}
  c.save();c.lineCap='round';c.lineJoin='round';
  [[STR.w,'#1A0808'],[STR.core,'#FFFBEE']].forEach(L=>{c.strokeStyle=L[1];c.lineWidth=Math.max(.6,L[0]*s);c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.stroke()});c.restore()}
/* the FX bundle for one facing side: demo units under scale(side*r, r) */
function fxBegin(c,side,r,x,y,sc,p,TLs){c.save();c.scale(side*r,r);window.__BOWPOSE=p;BOW3FX.set({cx:c,TL:TLs,HX:side*x/r,HY:y/r,SC:sc/r})}
function sideTL(side,t){const T=S.TL;return{shots:T.shots.filter(s=>s.side===side&&!s.rot),imp:T.imp.filter(o=>o.side===side&&!o.rot),clicks:T.clicks.filter(k=>k.side===side)}}
let inDraw=false;
function hookPuppet(){const U=PU();if(!U||U._bow3Hook)return !!(U&&U._bow3Hook);const _d=U.draw;if(typeof _d!=='function'||!ready())return false;U._bow3Hook=1;
  U.draw=function(c,x,y,sc,fac,pose){const A=S.A;if(inDraw||!A||!S.on||!held()||P.dead)return _d.apply(this,arguments);
    const t0=performance.now();inDraw=true;let sw=null,arr0;
    try{const t=time,face=fac>0?1:-1,r=rOf(sc),p=window.bowPose(A.n,qOf(A,t));p.lunge+=A.root;if(p.snap>=0)p.snap/=A.f;
      S.last={x,y,sc,fac:face,p,t};
      /* dust (click 3 flip) behind the hero */
      if(!S.TL.clicks.some(k=>k.id===A.id)&&A.n===3)S.TL.clicks.push({n:3,t0:A.T0,t1:A.T0+durOf(A),root:A.root,f:A.f,side:face,id:A.id});
      try{const tf=performance.now();const T1=sideTL(face,t);fxBegin(c,face,r,x,y,sc,p,T1);BOW3FX.drawDust(t);c.restore();S.stats.fxMs+=performance.now()-tf}catch(e){try{c.restore()}catch(_){}ERR('dust',e)}
      /* hero (arrow slot set right before the draw, stringless bow only now) */
      const U2=PU();arr0=U2.slots.arrow;U2.slots.arrow=p.arrowOn?'w_arrow':'_none';
      if(NS){sw=U2.imgs.w_bow;U2.imgs.w_bow=NS}
      if(p.flip){const fcx=x-(p.lunge||0)*sc*(face>0?-1:1),fcy=y-((p.air||0)+280)*sc;c.save();c.translate(fcx,fcy);c.rotate(p.flip*Math.PI/180*(face>0?1:-1));c.translate(-fcx,-fcy);window.drawCombo(c,x,y,sc,fac,p);drawString(c,p,x,y,sc,face>0?1:-1);c.restore()}
      else{window.drawCombo(c,x,y,sc,fac,p);drawString(c,p,x,y,sc,face>0?1:-1)}
      return null}
    finally{inDraw=false;try{const U2=PU();if(sw)U2.imgs.w_bow=sw;if(arr0!==undefined)U2.slots.arrow=arr0}catch(_){}
      const ms=performance.now()-t0;S.stats.drawMs+=ms;S.stats.draws++;if(ms>S.stats.maxMs)S.stats.maxMs=ms}};
  return true}
setInterval(()=>{try{hookPuppet()}catch(e){ERR('hookPuppet',e)}},300);
/* front effects (charge, release, shots, impacts) after the entities, in the same world space */
try{const _t=drawTexts;drawTexts=function(){const r0=_t.apply(this,arguments);try{if(window.BOW3FX&&ready()){const L=S.last,T=S.TL;
  if(L&&(T.shots.length||T.imp.length||(S.A&&S.A.n===3))){const t=time,tf=performance.now(),r=rOf(L.sc);
    for(const side of [1,-1]){const TLs=sideTL(side,t);if(!TLs.shots.length&&!TLs.imp.length&&!(S.A&&S.A.n===3&&L.fac===side))continue;
      fxBegin(ctx,side,r,L.x,L.y,L.sc,L.p,TLs);
      try{if(S.A&&L.fac===side&&L.p&&L.p.charge){const tp=tipAt(L.p,side*L.x/r,L.y/r,L.sc/r).tip;BOW3FX.drawCharge(L.p,t,tp)}
        BOW3FX.drawRelease(t);BOW3FX.drawShots(t);BOW3FX.drawImpacts(t);for(const fn of S.layers){try{fn(ctx,t,side)}catch(_){}}}catch(e){ERR('fx front',e)}
      ctx.restore()}
    try{drawRot(t)}catch(e){ERR('rot',e)}S.stats.fxMs+=performance.now()-tf;S.stats.fxN++}}}catch(e){ERR('hook texts',e)}return r0}}catch(e){ERR('hook texts',e)}
console.info('[BOW3] ready');
})();
