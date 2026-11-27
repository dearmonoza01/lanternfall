
/* ---- r203 farm motions + tree marks (TEST ONLY). Replaces r202's FMOT202 object (window.FMOT202 now points here; the r202 module stays idle).
   r202 (Motion farm r1c, PASSED by DeaRz 24 Nov 09:19 BKK): sow / water a vegetable cell with a motion, effect at the key moment.
   r203 (DeaRz 24 Nov 10:00 BKK): (1) tree plot icons (water drop / sparkle / text) sit ABOVE the leaves of the tree's current stage and are drawn
   after the tree (were hidden behind it): TMK203, ?treemark=off. (2) watering a tree uses the same water motion, the hero stands a little away
   from the trunk (FMOT203.cfg.treeGap px to the side) and pours at the tree base. Saplings (sow on a tree plot), harvest, dig: no motion.
   The hero glides to the motion stand point (.22 s) instead of jumping. ?farmmotion=off = old instant action. Debug window.FMOT203 / TMK203 ---- */
(function(){'use strict';
const Q=String(location.search);
const R=window.FMOT203={ver:'farmmotion-r203',cfg:{treeGap:46,glide:.22},on:!/[?&]farmmotion=off\b/.test(Q),err:null,M:null,queue:[],stats:{water:0,sow:0,applied:0,cancel:0,draws:0,queued:0}};
const ERR=(w,e)=>{R.err=w+': '+((e&&e.message)||e);try{console.error('[FMOT203]',w,e)}catch(_){}};
window.FMOT202=R;
/* tree marks: height of the tree sprite of its current stage above the spot (crop prop drawn at spot.y - gy) */
const TM=window.TMK203={on:!/[?&]treemark=off\b/.test(Q),off(s){try{const sp=s.sp,C=HOUSE.crops;if(!sp||!sp.crop||!(sp.stage>=1))return 30;const a=C.data[sp.crop][C.key(sp.crop,sp.stage|0)];return Math.max(30,(a&&a.gy||0)+4)}catch(_){return 70}}};
function rE(x){ return x<0?0:x>1?1:x*x*(3-2*x); }
/* ======== Motion farm_defs_r1c.js (verbatim) ======== */
// ===== FARM r1 data (Motion, 24 Nov): watering + sowing on the farm plot cell. Times in s. =====
var FARM={ plotW:243, footDY:4, behind:15, ahead:6, LANES:[[-10,-6],[-4,-8],[3,-7],[10,-5],[-8,1],[-1,0],[6,1],[11,3],[-5,6],[3,6]],
  spots:[[30.6,21.6],[62.5,21.5],[94.4,21.5],[29.4,44.4],[62.5,44.3],[95.6,44.3],[28.2,67.8],[62.5,67.8],[96.8,67.8]],
  // seeds: [dx, dy] landing offset in plot px from the cell centre, flight time, arc height
  SEEDS:[[-9,-5,0.20,22],[-3,-7,0.23,26],[4,-4,0.21,24],[9,-6,0.25,28],[-6,3,0.18,18],[2,4,0.20,20],[8,2,0.22,22]],
  WATER:{ dur:1.3, pourOn:0.38, pourOff:0.95,
    P:{ HOLD:{ torso:0, head:0, arm_near:10, forearm_near:12, fist_near:0, arm_far:6, forearm_far:16, fist_far:0, can:0 },
        LIFT:{ torso:-3, head:-6, arm_near:46, forearm_near:34, fist_near:-8, arm_far:14, forearm_far:30, fist_far:0, can:12 },
        POUR:{ torso:-8, head:-14, arm_near:58, forearm_near:18, fist_near:-16, arm_far:20, forearm_far:40, fist_far:0, can:50 } },
    tl:[[0,'HOLD'],[0.20,'LIFT'],[0.38,'POUR'],[0.90,'POUR'],[1.08,'LIFT'],[1.3,'HOLD']], sway:'POUR' },
  SOW:{ dur:1.0, release:0.40,
    P:{ READY:{ torso:0, head:-4, arm_near:16, forearm_near:84, fist_near:0, arm_far:6, forearm_far:14, fist_far:0 },
        DIP:{ torso:-3, head:-10, arm_near:22, forearm_near:96, fist_near:10, arm_far:6, forearm_far:14, fist_far:0 },
        BACK:{ torso:5, head:-2, arm_near:-24, forearm_near:46, fist_near:20, arm_far:6, forearm_far:14, fist_far:0 },
        THROW:{ torso:-9, head:-12, arm_near:74, forearm_near:8, fist_near:-14, arm_far:6, forearm_far:14, fist_far:0 } },
    tl:[[0,'READY'],[0.10,'DIP'],[0.18,'DIP'],[0.28,'BACK'],[0.40,'THROW'],[0.70,'THROW'],[1.0,'READY']] },
  LEGS:{ leg_near:-14, foot_near:14, leg_far:14, foot_far:-14 } };
function farmKeys(D,t,T){ var L=D.tl, i=1; while(i<L.length-1&&t>L[i][0]) i++; var A=L[i-1], B=L[i], u=rE(Math.min(1,Math.max(0,(t-A[0])/((B[0]-A[0])||1)))), a=D.P[A[1]], b=D.P[B[1]], k={}, can=0;
  Object.keys(a).forEach(function(n){ var v=a[n]+((b[n]||0)-a[n])*u; if(n==='can') can=v; else k[n]=v; });
  Object.keys(FARM.LEGS).forEach(function(n){ k[n]=FARM.LEGS[n]; });
  if(D.sway&&A[1]===D.sway&&B[1]===D.sway){ var w=Math.sin((t-A[0])*7); k.arm_near+=3*w; can+=4*Math.sin((t-A[0])*9); }
  k.torso+=0.5*Math.sin(T*2.6); return {k:k,can:can}; }
// watering can, grip = handle top; ang deg (+ = spout tips down forward). Returns spout tip screen point.
function drawCan(cx,g,ang,f,s){ var S=0.85*s; cx.save(); cx.translate(g[0],g[1]); cx.scale(f,1); cx.rotate(ang*Math.PI/180); cx.scale(S,S);
  cx.lineJoin='round'; cx.lineCap='round';
  // spout
  cx.fillStyle='#5f9aa8'; cx.strokeStyle='#2c4b55'; cx.lineWidth=3; cx.beginPath(); cx.moveTo(20,30); cx.lineTo(60,2); cx.lineTo(64,8); cx.lineTo(24,44); cx.closePath(); cx.fill(); cx.stroke();
  cx.fillStyle='#d8b25a'; cx.strokeStyle='#6b4f1e'; cx.beginPath(); cx.ellipse(64,4,5,9,0.95,0,6.283); cx.fill(); cx.stroke();
  // body
  var gr=cx.createLinearGradient(-26,0,26,0); gr.addColorStop(0,'#4f8895'); gr.addColorStop(0.45,'#8cc4cf'); gr.addColorStop(1,'#3d6f7b'); cx.fillStyle=gr; cx.strokeStyle='#2c4b55'; cx.lineWidth=3.5;
  cx.beginPath(); cx.moveTo(-24,14); cx.quadraticCurveTo(-26,58,-18,60); cx.lineTo(18,60); cx.quadraticCurveTo(26,58,24,14); cx.quadraticCurveTo(0,6,-24,14); cx.closePath(); cx.fill(); cx.stroke();
  cx.strokeStyle='#d8b25a'; cx.lineWidth=4; cx.beginPath(); cx.moveTo(-24,24); cx.quadraticCurveTo(0,30,24,24); cx.stroke(); cx.beginPath(); cx.moveTo(-25,50); cx.quadraticCurveTo(0,56,25,50); cx.stroke();
  cx.fillStyle='rgba(255,255,255,.45)'; cx.beginPath(); cx.ellipse(-10,36,4,12,0.1,0,6.283); cx.fill();
  // handle (grip at 0,0)
  cx.strokeStyle='#2c4b55'; cx.lineWidth=7; cx.beginPath(); cx.moveTo(-16,13); cx.quadraticCurveTo(-14,-6,0,-4); cx.quadraticCurveTo(14,-6,16,13); cx.stroke();
  cx.strokeStyle='#5f9aa8'; cx.lineWidth=3.5; cx.stroke();
  cx.restore();
  var a=ang*Math.PI/180, lx=64*S, ly=6*S; return [g[0]+f*(lx*Math.cos(a)-ly*Math.sin(a)), g[1]+(lx*Math.sin(a)+ly*Math.cos(a))]; }
function drawPouch(cx,g,s){ var S=0.55*s; cx.save(); cx.translate(g[0],g[1]+4*s); cx.scale(S,S); cx.fillStyle='#b8874a'; cx.strokeStyle='#5a3a18'; cx.lineWidth=3;
  cx.beginPath(); cx.moveTo(-12,-6); cx.quadraticCurveTo(-24,22,-4,26); cx.lineTo(8,26); cx.quadraticCurveTo(26,22,12,-6); cx.closePath(); cx.fill(); cx.stroke();
  cx.strokeStyle='#e8c060'; cx.lineWidth=3; cx.beginPath(); cx.moveTo(-12,-4); cx.lineTo(12,-4); cx.stroke();
  cx.fillStyle='#f0cc6a'; for(var i=0;i<4;i++){ cx.beginPath(); cx.arc(-6+i*4,-8,2.4,0,6.283); cx.fill(); } cx.restore(); }
/* ======== game glue ======== */
const GRIP=[40,58];
const now=()=>performance.now()/1000;
function restApply(p,K,k){Object.keys(K).forEach(n=>{p.rot[n]=(p.rot[n]||0)*(1-k)+K[n]*k});return p}
function hipPt(U,p){const W=U.solve(p),a=W.leg_near,b=W.leg_far,PP=U.P,pa=PP.leg_near.pivot,pb=PP.leg_far.pivot;return [(a[0]*pa[0]+a[2]*pa[1]+a[4]+b[0]*pb[0]+b[2]*pb[1]+b[4])/2,(a[1]*pa[0]+a[3]*pa[1]+a[5]+b[1]*pb[0]+b[3]*pb[1]+b[5])/2]}
function partScreen(U,p,part,pt,x,y,SC,face){const W=U.solve(p),m=W[part],hp=hipPt(U,p),sg=face>0?-1:1,ax=m[0]*pt[0]+m[2]*pt[1]+m[4],ay=m[1]*pt[0]+m[3]*pt[1]+m[5];return [x+(ax-hp[0])*SC*sg,y+(ay-hp[1])*SC]}
function playerInput(){try{for(const k of ['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'])if(keys[k])return true;if(typeof TOUCH!=='undefined'&&TOUCH&&TOUCH.joy)return true;if(G.touch&&G.touch.move)return true;if(G.joy&&!G.joy.f193)return true}catch(_){}return false}
R.busy=()=>!!R.M;
R.start=function(s,act,arg,apply){try{
 if(!R.on||!s||(act!=='water'&&act!=='plant')||(s.tree&&act!=='water'))return false;
 if(R.M){R.queue.push({s,act,arg,apply});R.stats.queued++;return true}
 const D=act==='water'?FARM.WATER:FARM.SOW;let f,hx,hy,tx,ty;
 if(s.tree){f=P.x<=s.x?1:-1;hx=s.x-f*R.cfg.treeGap;hy=s.y+FARM.footDY;tx=s.x-f*8;ty=s.y}
 else{f=Math.cos(P.face||0)>=0?1:-1;hx=s.x-f*FARM.behind;hy=s.y+FARM.footDY;tx=s.x;ty=s.y}
 /* glide to the stand point, then the motion starts */
 const g=Math.hypot(P.x-hx,P.y-hy)>3?R.cfg.glide:0;
 R.M={act:act==='water'?'water':'sow',D,s,tree:!!s.tree,cx:tx,cy:ty,f,hx,hy,fx:P.x,fy:P.y,g,t0:now()+g,apply,applied:false,at:act==='water'?0.93:0.65};
 try{P.face=f>0?0:Math.PI;if(!g){P.x=hx;P.y=hy}}catch(_){}
 R.stats[R.M.act]++;if(s.tree)R.stats.tree=(R.stats.tree|0)+1;return true}catch(e){ERR('start',e);return false}};
function end(){R.M=null;const n=R.queue.shift();if(n){const j=n;setTimeout(()=>{if(!R.start(j.s,j.act,j.arg,j.apply))j.apply()},0)}}
function tick(){requestAnimationFrame(tick);const M=R.M;if(!M)return;try{
 const t=now()-M.t0;
 if(t<0){const u=1+t/M.g,e=u*u*(3-2*u);P.x=M.fx+(M.hx-M.fx)*e;P.y=M.fy+(M.hy-M.fy)*e;P.face=M.f>0?0:Math.PI;return}
 if(M.g&&!M.snap){M.snap=1;P.x=M.hx;P.y=M.hy}
 if(!M.applied&&(playerInput()||Math.hypot(P.x-M.hx,P.y-M.hy)>6)){R.stats.cancel++;R.queue.length=0;R.M=null;return}
 if(!M.applied&&t>=M.at){M.applied=true;R.stats.applied++;try{M.apply()}catch(e){ERR('apply',e)}}
 if(t>=M.D.dur)end()}catch(e){ERR('tick',e);R.M=null}}
requestAnimationFrame(tick);
/* ---- hero draw ---- */
function isHero(x,y){try{const X=window.PUPPETX;if(!X||X.inGhost||X.hideP)return false;return Math.abs(x-P.x)<.6&&Math.abs(y-(P.y-(P.jump||0)+X.cfg.FOOT_DY))<.6&&!P.dead}catch(_){return false}}
function fistOnly(_d,c,x,y,sc,f,p){const X=window.PUPPETX,g0=X.inGhost;X.inGhost=true;window.__ONLY='fist_near';try{_d.call(window.PUPPET,c,x,y,sc,f,p)}finally{window.__ONLY=null;X.inGhost=g0}}
function under(c,M,tt,s){const W0=M.act==='water',f=M.f,cX=M.cx,cY=M.cy;
 if(W0&&!M.tree){const wet=Math.max(0,Math.min(1,(tt-M.D.pourOn-0.05)/0.5));if(wet>0&&!M.applied){c.save();c.globalCompositeOperation='multiply';c.globalAlpha=wet;c.fillStyle='rgb(158,153,186)';c.beginPath();if(c.roundRect)c.roundRect(cX-15,cY-10.5,30,21,2);else c.rect(cX-15,cY-10.5,30,21);c.fill();c.restore()}}
 else{for(const sd of FARM.SEEDS){const la=M.D.release+sd[2];if(tt>la){const ex=cX+sd[0]+FARM.ahead*f,ey=cY+sd[1];c.fillStyle='#e8c060';c.strokeStyle='#7a5520';c.lineWidth=1;c.beginPath();c.ellipse(ex,ey,2.2,1.5,.4,0,6.283);c.fill();c.stroke();const pu=(tt-la)/.25;if(pu<1){c.globalAlpha=1-pu;c.fillStyle='rgba(120,85,50,.55)';c.beginPath();c.ellipse(ex,ey,2+5*pu,1+2*pu,0,0,6.283);c.fill();c.globalAlpha=1}}}}}
function over(c,M,tt,T,g,sp,s){const f=M.f,cX=M.cx,cY=M.cy,D=M.D;
 if(M.act==='water'){if(!sp)return;const K=farmKeys(D,tt,T),pourK=Math.max(0,Math.min(1,(K.can-26)/14));if(pourK<=0)return;const tg=M.tree?[cX,cY+2]:[cX+f*FARM.ahead,cY+2],LN=FARM.LANES;
  for(let li=0;li<LN.length;li++){const le=[tg[0]+LN[li][0],tg[1]+LN[li][1]],ss=[sp[0]+LN[li][0]*0.12*s,sp[1]+LN[li][1]*0.12*s];c.save();c.globalAlpha=0.30*pourK;c.strokeStyle='#d6eeff';c.lineWidth=1.3*s;c.beginPath();c.moveTo(ss[0],ss[1]);c.quadraticCurveTo(ss[0]+f*7*s+(le[0]-ss[0])*0.25,(ss[1]+le[1])/2-4*s,le[0],le[1]);c.stroke();c.restore();
   for(let di=0;di<4;di++){const u=((T*2.4+di/4+li*0.13)%1),px=ss[0]+(le[0]-ss[0])*u+f*7*s*Math.sin(u*Math.PI)*0.7,py=ss[1]+(le[1]-ss[1])*u*u-4*s*Math.sin(u*Math.PI);c.globalAlpha=pourK*(u<0.9?0.95:(1-u)*9.5);c.fillStyle='#8fd0ff';c.beginPath();c.ellipse(px,py,1.3*s,2.1*s,0,0,6.283);c.fill();c.globalAlpha=1}
   const q=((T*2.8+li*0.21)%1);c.globalAlpha=pourK*(1-q)*0.75;c.strokeStyle='#e6f6ff';c.lineWidth=1.1;c.beginPath();c.ellipse(le[0],le[1],(1.5+4*q)*0.6,(0.8+2*q)*0.6,0,0,6.283);c.stroke();c.globalAlpha=1}
  for(let mi=0;mi<6;mi++){const q3=((T*4+mi/6)%1);c.globalAlpha=pourK*(1-q3)*0.6;c.fillStyle='#e6f6ff';c.beginPath();c.arc(sp[0]+f*(2+8*q3)*s+Math.sin(mi*2.1)*5*s*q3,sp[1]+(mi-2.5)*1.6*s*q3+6*s*q3,1.1*s,0,6.283);c.fill();c.globalAlpha=1}}
 else{for(const sd of FARM.SEEDS){const t0=D.release,t1=D.release+sd[2];if(tt>=t0&&tt<=t1){const u2=(tt-t0)/(t1-t0),ex=cX+sd[0]+FARM.ahead*f,ey=cY+sd[1],sx=g[0]+(ex-g[0])*u2,sy=g[1]+(ey-g[1])*u2-Math.sin(u2*Math.PI)*sd[3]*s;c.fillStyle='#ffd84a';c.strokeStyle='#5a3a10';c.lineWidth=1.6;c.beginPath();c.ellipse(sx,sy,3.4*s,2.4*s,u2*6,0,6.283);c.fill();c.stroke()}}
  if(tt>D.release-0.02&&tt<D.release+0.2){const fl=(tt-D.release+0.02)/0.22;c.globalAlpha=1-fl;c.strokeStyle='#fff3c0';c.lineWidth=2;c.beginPath();c.arc(g[0],g[1],(4+10*fl)*s,0,6.283);c.stroke();c.globalAlpha=1}}}
function hookDraw(){const U=window.PUPPET;if(!U||!U.draw||!U.pose||!U.solve)return false;if(U._r203)return true;U._r203=1;const _d=U.draw;
 U.draw=function(c,x,y,sc,fac,p){try{const M=R.M;if(M&&typeof P!=='undefined'&&P&&isHero(x,y)){R.stats.draws++;
   const T=now(),tt=Math.max(0,Math.min(M.D.dur,T-M.t0)),f=M.f,s=sc/0.27,sw=U.cfg.showSword;U.cfg.showSword=false;
   try{const K=farmKeys(M.D,tt,T),p2=U.pose('idle',T,{});p2.lunge=0;restApply(p2,K.k,1);
    under(c,M,tt,s);
    const r=_d.call(this,c,x,y,sc,f,p2);
    const W=U.solve(p2),gy=U.footY(W),hp=hipPt(U,p2),sg=f>0?-1:1,hx=x+hp[0]*sc*sg,hy=y+(hp[1]-gy)*sc;
    const g=partScreen(U,p2,'fist_near',GRIP,hx,hy,sc,f);let sp=null;
    if(M.act==='water'){sp=drawCan(c,g,K.can,f,s);fistOnly(_d,c,x,y,sc,f,p2)}
    else{if(tt<M.D.release-0.03){c.fillStyle='#e8c060';for(let hi=0;hi<3;hi++){c.beginPath();c.arc(g[0]+(hi-1)*3*s,g[1]+7*s,1.8*s,0,6.283);c.fill()}}fistOnly(_d,c,x,y,sc,f,p2)}
    over(c,M,tt,T,g,sp,s);return r}finally{U.cfg.showSword=sw}}}catch(e){ERR('draw',e)}
  return _d.apply(this,arguments)};return true}
{let n=0;const iv=setInterval(()=>{if(hookDraw()||++n>120)clearInterval(iv)},500)}
})();

