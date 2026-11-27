
/* ---- r206 farm motions (TEST ONLY). Replaces r203's object (window.FMOT202 / FMOT203 now point here; the older modules stay idle).
   Motion farm r4 handoff (motion/farm_r1/code_handoff_r4_harvest/), all PASSED by DeaRz 24 Nov 15:02-15:07 BKK ("ส่ง codeได้เลยทุกท่าผ่านหมด"):
   - vegetable harvest 1.45 s: hero on the cell, legs keep the standing stance, only the body leans, both hands on the leaves, loading ring .38-1.05,
     crop taken at 1.05 (the game's own harvest) + poof + "+1 name".
   - tree fruit 1.35 s: hero 30 px from the trunk facing it, both hands up, ring .25-1.05, fruit taken at 1.05 (tree ripe -> bare).
   - watering a vegetable cell: hero stands 55 px behind the cell centre, water arcs into that one cell (was 15 px, on the cell).
   - farmKeys interpolates the union of keys (no leg snap).
   Unchanged from r202/r203: sow 1.0 s, tree watering 46 px beside the trunk, tree marks (TMK203). No dig motion.
   ?farmmotion=off = old instant actions. Debug window.FMOT206 ---- */
(function(){'use strict';
const Q=String(location.search);
const R=window.FMOT206=window.FMOT203={ver:'farmmotion-r206',cfg:{treeGap:46,glide:.22},on:!/[?&]farmmotion=off\b/.test(Q),err:null,M:null,queue:[],stats:{water:0,sow:0,harvest:0,fruit:0,applied:0,cancel:0,draws:0,queued:0}};
const ERR=(w,e)=>{R.err=w+': '+((e&&e.message)||e);try{console.error('[FMOT206]',w,e)}catch(_){}};
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
/* (r1c farmKeys replaced by the r4 one below) */
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
/* ======== Motion farm_defs_r4.js (verbatim) ======== */
function star(cx,x,y,r,c){cx.save();cx.translate(x,y);cx.fillStyle=c;cx.beginPath();for(let i=0;i<8;i++){const r2=i%2?r*.35:r,a=i*Math.PI/4;cx.lineTo(Math.cos(a)*r2,Math.sin(a)*r2)}cx.closePath();cx.fill();cx.restore()}
// Farm motion r4 data (Motion, 24 Nov 2026). Requires FARM (r1c handoff), restApply/rE/drawAtHip/partScreen/fistOnly helpers from r1c.
FARM.HARV={ dur:1.45, ringOn:0.38, done:1.05,
  // r3 (DeaRz 10:57 "แค่ทำมือก็พอและมีวงเหมือนโหลดและผักก็หาย ไม่ต้องยกขึ้นมา"): reach a hand to the crop, a loading ring fills, the crop vanishes
  P:{ STAND:{ torso:0, head:0, arm_near:8, forearm_near:14, fist_near:0, arm_far:6, forearm_far:14, fist_far:0 },
      // r3f (DeaRz 11:42 "นั่งเหมือนเดิมแหละ แต่ทำให้สมูทกว่านี้ และเท้าติดพื้น"): squat again, one eased move down/up, feet pinned to the same ground spot
      // r4 (DeaRz 14:29-14:31 BKK ref panel 1 only "เอาแค่ท่าแรกนะก้มเก็บ" + ring/vanish as before): wide stance, bent forward, knees bent, both hands on the leaves
      REACH:{ torso:-45, head:-2, arm_near:36, forearm_near:6, fist_near:-6, arm_far:42, forearm_far:6, fist_far:-6, leg_near:31, foot_near:14, leg_far:59, foot_far:-14 } }, // r4c (DeaRz 15:02 "ไม่ต้องขยับขาเลยเอียงตัวไปข้างหน้าเหมือนเดิม"): legs = standing stance + torso compensation (leg = LEGS - torso), only the body leans
  tl:[[0,'STAND'],[0.38,'REACH'],[1.05,'REACH'],[1.45,'STAND']], pulse:'REACH', pinFeet:1 };
FARM.FRUIT={ dur:1.35, ringOn:0.25, done:1.05, stand:30, // r3h (DeaRz 15:06 "ยืนห่างจากต้นซัก30 px"): hero 30 game px from the trunk, facing it
  // r3: fruit tree = same idea, hand stretched UP into the canopy + the same loading ring; tree swaps ripe -> bare
  P:{ STAND:{ torso:0, head:0, arm_near:8, forearm_near:14, fist_near:0, arm_far:6, forearm_far:14, fist_far:0 },
      UP:{ torso:4, head:5, arm_near:168, forearm_near:0, fist_near:0, arm_far:125, forearm_far:10, fist_far:0, leg_near:-10, foot_near:16, leg_far:10, foot_far:-4 } },
  tl:[[0,'STAND'],[0.25,'UP'],[1.05,'UP'],[1.35,'STAND']], pulse:'UP' };
function farmKeys(D,t,T){ var L=D.tl, i=1; while(i<L.length-1&&t>L[i][0]) i++; var A=L[i-1], B=L[i], u=rE(Math.min(1,Math.max(0,(t-A[0])/((B[0]-A[0])||1)))), a=D.P[A[1]], b=D.P[B[1]], k={}, can=0;
  // r3g fix: interpolate the UNION of keys (missing leg keys fall back to the standing stance), so legs bend smoothly instead of snapping at the end
  var names={}; Object.keys(a).forEach(function(n){names[n]=1;}); Object.keys(b).forEach(function(n){names[n]=1;});
  Object.keys(names).forEach(function(n){ var df=FARM.LEGS[n]!=null?FARM.LEGS[n]:0, av=a[n]!=null?a[n]:df, bv=b[n]!=null?b[n]:df, v=av+(bv-av)*u; if(n==='can') can=v; else k[n]=v; });
  Object.keys(FARM.LEGS).forEach(function(n){ if(k[n]==null) k[n]=FARM.LEGS[n]; });
  if(D.pulse&&A[1]===D.pulse&&B[1]===D.pulse){ k.fist_near=(k.fist_near||0)+4*Math.sin((t-A[0])*14); k.fist_far=(k.fist_far||0)+4*Math.sin((t-A[0])*14+1.5); k.forearm_near=(k.forearm_near||0)+2*Math.sin((t-A[0])*7); }
  if(D.sway&&A[1]===D.sway&&B[1]===D.sway){ var w=Math.sin((t-A[0])*7); k.arm_near+=3*w; can+=4*Math.sin((t-A[0])*9); }
  k.torso+=0.5*Math.sin(T*2.6); return {k:k,can:can}; }
function loadRing(cx,x,y,r,q,s){ cx.save(); cx.lineCap='round'; cx.fillStyle='rgba(20,24,36,.55)'; cx.beginPath(); cx.arc(x,y,r+3*s,0,6.283); cx.fill();
  cx.strokeStyle='rgba(255,255,255,.25)'; cx.lineWidth=3.2*s; cx.beginPath(); cx.arc(x,y,r,0,6.283); cx.stroke();
  cx.strokeStyle='#ffd84a'; cx.shadowColor='#ffd84a'; cx.shadowBlur=6*s; cx.beginPath(); cx.arc(x,y,r,-Math.PI/2,-Math.PI/2+6.283*q); cx.stroke(); cx.restore(); }
function poof(cx,x,y,q,s){ for(var i=0;i<8;i++){ var a=i*0.785+0.3, r=(4+16*q)*s; cx.globalAlpha=(1-q)*0.85; cx.fillStyle='#fffbe8'; cx.beginPath(); cx.arc(x+Math.cos(a)*r,y+Math.sin(a)*r*0.8,(3.2-2*q)*s,0,6.283); cx.fill(); } for(var k=0;k<5;k++){ var a2=k*1.256+q*2; cx.globalAlpha=1-q; star(cx,x+Math.cos(a2)*20*s*q,y+Math.sin(a2)*18*s*q-6*s*q,(6-3*q)*s*0.6,'#fff2a0'); } cx.globalAlpha=1; }

// WATER (r1d, DeaRz passed 55 px):
// WATER:{ dur:1.3, pourOn:0.38, pourOff:0.95, behind:55, ahead:0, // r1d (DeaRz 14:05): stand 55 px from the cell centre, water arcs into the cell

FARM.WATER.behind=55;FARM.WATER.ahead=0;/* r1d (DeaRz 14:05 BKK) */
/* ======== game glue ======== */
const GRIP=[40,58];
const now=()=>performance.now()/1000;
function restApply(p,K,k){Object.keys(K).forEach(n=>{p.rot[n]=(p.rot[n]||0)*(1-k)+K[n]*k});return p}
function hipPt(U,p){const W=U.solve(p),a=W.leg_near,b=W.leg_far,PP=U.P,pa=PP.leg_near.pivot,pb=PP.leg_far.pivot;return [(a[0]*pa[0]+a[2]*pa[1]+a[4]+b[0]*pb[0]+b[2]*pb[1]+b[4])/2,(a[1]*pa[0]+a[3]*pa[1]+a[5]+b[1]*pb[0]+b[3]*pb[1]+b[5])/2]}
function partScreen(U,p,part,pt,x,y,SC,face){const W=U.solve(p),m=W[part],hp=hipPt(U,p),sg=face>0?-1:1,ax=m[0]*pt[0]+m[2]*pt[1]+m[4],ay=m[1]*pt[0]+m[3]*pt[1]+m[5];return [x+(ax-hp[0])*SC*sg,y+(ay-hp[1])*SC]}
function playerInput(){try{for(const k of ['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'])if(keys[k])return true;if(typeof TOUCH!=='undefined'&&TOUCH&&TOUCH.joy)return true;if(G.touch&&G.touch.move)return true;if(G.joy&&!G.joy.f193)return true}catch(_){}return false}
R.busy=()=>!!R.M;
const nameOf=id=>{try{const F=HOUSE.farm.cfg;const c=(F.trees&&F.trees[id])||(F.crops&&F.crops[id]);return c?c.name:''}catch(_){return ''}};
R.start=function(s,act,arg,apply){try{
 if(!R.on||!s||(act!=='water'&&act!=='plant'&&act!=='harvest')||(s.tree&&act==='plant'))return false;
 if(act==='harvest'&&!(s.sp&&s.sp.ripe))return false;
 if(R.M){R.queue.push({s,act,arg,apply});R.stats.queued++;return true}
 const k=act==='water'?'water':act==='plant'?'sow':s.tree?'fruit':'harvest';
 const D=k==='water'?FARM.WATER:k==='sow'?FARM.SOW:k==='fruit'?FARM.FRUIT:FARM.HARV;let f,hx,hy,tx,ty;
 if(s.tree){f=P.x<=s.x?1:-1;tx=s.x;ty=s.y;if(k==='fruit'){hx=s.x-f*FARM.FRUIT.stand;hy=s.y+20}else{hx=s.x-f*R.cfg.treeGap;hy=s.y+FARM.footDY;tx=s.x-f*8}}
 else{f=Math.cos(P.face||0)>=0?1:-1;const bh=k==='water'?FARM.WATER.behind:FARM.behind;hx=s.x-f*bh;hy=s.y+FARM.footDY;tx=s.x;ty=s.y}
 const g=Math.hypot(P.x-hx,P.y-hy)>3?R.cfg.glide*(Math.hypot(P.x-hx,P.y-hy)>40?1.6:1):0;
 R.M={act:k,D,s,tree:!!s.tree,cx:tx,cy:ty,f,hx,hy,fx:P.x,fy:P.y,g,t0:now()+g,apply,applied:false,at:k==='water'?0.93:k==='sow'?0.65:D.done,name:nameOf(s.sp&&s.sp.crop)};
 try{P.face=f>0?0:Math.PI;if(!g){P.x=hx;P.y=hy}}catch(_){}
 R.stats[k]++;if(s.tree)R.stats.tree=(R.stats.tree|0)+1;return true}catch(e){ERR('start',e);return false}};
const FXL=[];/* poof + "+1" that outlive the motion */
function end(){R.M=null;const n=R.queue.shift();if(n){const j=n;setTimeout(()=>{if(!R.start(j.s,j.act,j.arg,j.apply))j.apply()},0)}}
function tick(){requestAnimationFrame(tick);const M=R.M;if(!M)return;try{
 const t=now()-M.t0;
 if(t<0){const u=1+t/M.g,e=u*u*(3-2*u);P.x=M.fx+(M.hx-M.fx)*e;P.y=M.fy+(M.hy-M.fy)*e;P.face=M.f>0?0:Math.PI;return}
 if(M.g&&!M.snap){M.snap=1;P.x=M.hx;P.y=M.hy}
 if(!M.applied&&(playerInput()||Math.hypot(P.x-M.hx,P.y-M.hy)>6)){R.stats.cancel++;R.queue.length=0;R.M=null;return}
 if(!M.applied&&t>=M.at){M.applied=true;R.stats.applied++;try{M.apply()}catch(e){ERR('apply',e)}if((M.act==='harvest'||M.act==='fruit')&&M.rp)FXL.push({x:M.rp[0],y:M.rp[1],s:M.rp[2],t0:now(),name:M.name,fr:M.act==='fruit'})}
 if(t>=M.D.dur)end()}catch(e){ERR('tick',e);R.M=null}}
requestAnimationFrame(tick);
/* ---- hero draw ---- */
function isHero(x,y){try{const X=window.PUPPETX;if(!X||X.inGhost||X.hideP)return false;return Math.abs(x-P.x)<.6&&Math.abs(y-(P.y-(P.jump||0)+X.cfg.FOOT_DY))<.6&&!P.dead}catch(_){return false}}
function fistOnly(_d,c,x,y,sc,f,p){const X=window.PUPPETX,g0=X.inGhost;X.inGhost=true;window.__ONLY='fist_near';try{_d.call(window.PUPPET,c,x,y,sc,f,p)}finally{window.__ONLY=null;X.inGhost=g0}}
function under(c,M,tt,s){const W0=M.act==='water',f=M.f,cX=M.cx,cY=M.cy;
 if(W0&&!M.tree){const wet=Math.max(0,Math.min(1,(tt-M.D.pourOn-0.05)/0.5));if(wet>0&&!M.applied){c.save();c.globalCompositeOperation='multiply';c.globalAlpha=wet;c.fillStyle='rgb(158,153,186)';c.beginPath();if(c.roundRect)c.roundRect(cX-15,cY-10.5,30,21,2);else c.rect(cX-15,cY-10.5,30,21);c.fill();c.restore()}}
 else{for(const sd of FARM.SEEDS){const la=M.D.release+sd[2];if(tt>la){const ex=cX+sd[0]+FARM.ahead*f,ey=cY+sd[1];c.fillStyle='#e8c060';c.strokeStyle='#7a5520';c.lineWidth=1;c.beginPath();c.ellipse(ex,ey,2.2,1.5,.4,0,6.283);c.fill();c.stroke();const pu=(tt-la)/.25;if(pu<1){c.globalAlpha=1-pu;c.fillStyle='rgba(120,85,50,.55)';c.beginPath();c.ellipse(ex,ey,2+5*pu,1+2*pu,0,0,6.283);c.fill();c.globalAlpha=1}}}}}
function over(c,M,tt,T,g,sp,s){const f=M.f,cX=M.cx,cY=M.cy,D=M.D;
 if(M.act==='harvest'||M.act==='fruit'){const FR=M.act==='fruit',rx=FR?g[0]+f*10*s:cX+6*f,ry=FR?g[1]-26*s:cY-40;M.rp=[rx,ry,s];const q=Math.max(0,Math.min(1,(tt-D.ringOn)/(D.done-D.ringOn)));if(tt>=D.ringOn&&tt<D.done)loadRing(c,rx,ry,14*s,q,s);return}
 if(M.act==='water'){if(!sp)return;const K=farmKeys(D,tt,T),pourK=Math.max(0,Math.min(1,(K.can-26)/14));if(pourK<=0)return;const tg=M.tree?[cX,cY+2]:[cX+f*FARM.WATER.ahead,cY+2],LN=FARM.LANES,arcH=Math.max(4,Math.abs(tg[0]-sp[0])*0.35);
  for(let li=0;li<LN.length;li++){const le=[tg[0]+LN[li][0],tg[1]+LN[li][1]],ss=[sp[0]+LN[li][0]*0.12*s,sp[1]+LN[li][1]*0.12*s];c.save();c.globalAlpha=0.30*pourK;c.strokeStyle='#d6eeff';c.lineWidth=1.3*s;c.beginPath();c.moveTo(ss[0],ss[1]);c.quadraticCurveTo(ss[0]+(le[0]-ss[0])*0.45,Math.min(ss[1],le[1])-arcH*0.9,le[0],le[1]);c.stroke();c.restore();
   for(let di=0;di<4;di++){const u=((T*2.4+di/4+li*0.13)%1),px=ss[0]+(le[0]-ss[0])*u,py=ss[1]+(le[1]-ss[1])*u*u-arcH*Math.sin(u*Math.PI)*0.9;c.globalAlpha=pourK*(u<0.9?0.95:(1-u)*9.5);c.fillStyle='#8fd0ff';c.beginPath();c.ellipse(px,py,1.3*s,2.1*s,0,0,6.283);c.fill();c.globalAlpha=1}
   const q=((T*2.8+li*0.21)%1);c.globalAlpha=pourK*(1-q)*0.75;c.strokeStyle='#e6f6ff';c.lineWidth=1.1;c.beginPath();c.ellipse(le[0],le[1],(1.5+4*q)*0.6,(0.8+2*q)*0.6,0,0,6.283);c.stroke();c.globalAlpha=1}
  for(let mi=0;mi<6;mi++){const q3=((T*4+mi/6)%1);c.globalAlpha=pourK*(1-q3)*0.6;c.fillStyle='#e6f6ff';c.beginPath();c.arc(sp[0]+f*(2+8*q3)*s+Math.sin(mi*2.1)*5*s*q3,sp[1]+(mi-2.5)*1.6*s*q3+6*s*q3,1.1*s,0,6.283);c.fill();c.globalAlpha=1}}
 else{for(const sd of FARM.SEEDS){const t0=D.release,t1=D.release+sd[2];if(tt>=t0&&tt<=t1){const u2=(tt-t0)/(t1-t0),ex=cX+sd[0]+FARM.ahead*f,ey=cY+sd[1],sx=g[0]+(ex-g[0])*u2,sy=g[1]+(ey-g[1])*u2-Math.sin(u2*Math.PI)*sd[3]*s;c.fillStyle='#ffd84a';c.strokeStyle='#5a3a10';c.lineWidth=1.6;c.beginPath();c.ellipse(sx,sy,3.4*s,2.4*s,u2*6,0,6.283);c.fill();c.stroke()}}
  if(tt>D.release-0.02&&tt<D.release+0.2){const fl=(tt-D.release+0.02)/0.22;c.globalAlpha=1-fl;c.strokeStyle='#fff3c0';c.lineWidth=2;c.beginPath();c.arc(g[0],g[1],(4+10*fl)*s,0,6.283);c.stroke();c.globalAlpha=1}}}
function fxl(c){const T=now();for(let i=FXL.length-1;i>=0;i--){const e=FXL[i],a=T-e.t0;if(a>1.0){FXL.splice(i,1);continue}if(a<.35)poof(c,e.x,e.y+(e.fr?0:4*e.s),a/.35,e.s);if(e.name){const q3=Math.min(1,a/.8);c.save();c.globalAlpha=1-Math.max(0,q3-.6)/.4;c.font='bold '+Math.round(15*e.s)+'px system-ui,sans-serif';c.textAlign='center';c.lineWidth=3;c.strokeStyle='#3a2a10';const ty=e.y-22*e.s-q3*20*e.s;c.strokeText('+1 '+e.name,e.x,ty);c.fillStyle='#ffe27a';c.fillText('+1 '+e.name,e.x,ty);c.restore()}}}
function soleX(U,pp,x,y,sc,f){const W=U.solve(pp),gy=U.footY(W),hp=hipPt(U,pp),sg=f>0?-1:1,hx=x+hp[0]*sc*sg,hy=y+(hp[1]-gy)*sc;return (partScreen(U,pp,'foot_near',[95,165],hx,hy,sc,f)[0]+partScreen(U,pp,'foot_far',[90,165],hx,hy,sc,f)[0])/2}
function hookDraw(){const U=window.PUPPET;if(!U||!U.draw||!U.pose||!U.solve)return false;if(U._r206)return true;U._r206=1;const _d=U.draw;
 U.draw=function(c,x,y,sc,fac,p){try{if(FXL.length&&typeof P!=='undefined'&&P&&isHero(x,y)&&!R.M){const r=_d.apply(this,arguments);fxl(c);return r}const M=R.M;if(M&&typeof P!=='undefined'&&P&&isHero(x,y)){R.stats.draws++;
   const T=now(),tt=Math.max(0,Math.min(M.D.dur,T-M.t0)),f=M.f,s=sc/0.27,sw=U.cfg.showSword;U.cfg.showSword=false;
   try{const K=farmKeys(M.D,tt,T),p2=U.pose('idle',T,{});p2.lunge=0;restApply(p2,K.k,1);
    under(c,M,tt,s);
    if(M.D.pinFeet){const K0=farmKeys(M.D,0,T),p0=U.pose('idle',T,{});p0.lunge=0;restApply(p0,K0.k,1);x+=soleX(U,p0,x,y,sc,f)-soleX(U,p2,x,y,sc,f)}
    const r=_d.call(this,c,x,y,sc,f,p2);
    const W=U.solve(p2),gy=U.footY(W),hp=hipPt(U,p2),sg=f>0?-1:1,hx=x+hp[0]*sc*sg,hy=y+(hp[1]-gy)*sc;
    const g=partScreen(U,p2,'fist_near',GRIP,hx,hy,sc,f);let sp=null;
    if(M.act==='water'){sp=drawCan(c,g,K.can,f,s);fistOnly(_d,c,x,y,sc,f,p2)}
    else if(M.act==='harvest'||M.act==='fruit'){fistOnly(_d,c,x,y,sc,f,p2)}
    else{if(tt<M.D.release-0.03){c.fillStyle='#e8c060';for(let hi=0;hi<3;hi++){c.beginPath();c.arc(g[0]+(hi-1)*3*s,g[1]+7*s,1.8*s,0,6.283);c.fill()}}fistOnly(_d,c,x,y,sc,f,p2)}
    over(c,M,tt,T,g,sp,s);fxl(c);return r}finally{U.cfg.showSword=sw}}}catch(e){ERR('draw',e)}
  return _d.apply(this,arguments)};return true}
{let n=0;const iv=setInterval(()=>{if(hookDraw()||++n>120)clearInterval(iv)},500)}
})();

