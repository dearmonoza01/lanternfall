
/* ---- knuckle-r13 (TEST, 11 Nov 2026): Knuckle BASIC punch r13 (Art, DeaRz approved 10 Nov 21:39 / 21:42; pack knuckle_punch_r13, source of truth skill.js) ----
   Replaces the spear-combo stand-in of the knuckle basic attack.
   * dash attack (when the dash CD of 3.0 s is ready and a target is near): crouch + tremble 0.26 s, dash up to 110 px toward the target (stops short of it and at walls), 3-hit flurry jab / cross / jab, hits at q .22 / .50 / .78 of 0.56 s, hit-stop 0.045 s per hit;
   * on CD: short 16 px step + 2 hits (jab / cross), hits at q .30 / .75 of 0.8 s, hit-stop 0.05 s, no crouch.
   * VFX (gold chi only, no yin-yang, no screen shake): fist aura + flame tongues + motes, wind-up tighten, fist ghosts + comet tail, impact petals + glow + ground rings + crescents + sparks, rear burst BEHIND the monster, monster squash 12 / 18 % for 0.2 s (visual only), follow-through wisps, body after-images + dust + flame trail on the dash.
   * rules: NO knockback, every hit is a normal game hit (own damage number), damage per hit capped 99,999. Balance r13 scale: per-attack mult = TARGET_DPS (0.85 x 1.9 = 1.615 mult/s) x the attack's full cycle time (cfg.CYCLE_LUNGE 1.005 s -> MULT_LUNGE 1.623, split 30/30/40; cfg.CYCLE_STEP 0.95 s -> MULT_STEP 1.534, split 45/55); the attack cooldown is max(1/aspd, animation length) so attacks never overlap.
   * ?knuckle=off = old stand-in (spear combo). Config + stats: window.KNUCKLE (cfg, stats, A = running attack). ---- */
(function(){'use strict';
const Q=String(location.search),OFF=/[?&]knuckle=off\b/.test(Q),KASPD=!/[?&]knaspd=off\b/.test(Q);
const KN=window.KNUCKLE={ver:'knuckle-r13',on:!OFF,err:null,A:null,lastDash:-99,last:null,hist:[],imp:[],stats:{dash:0,step:0,hits:0,wallStops:0},
  cfg:{TARGET_DPS:1.615,CYCLE_LUNGE:1.005,CYCLE_STEP:.95,MULT_LUNGE:7.8,MULT_STEP:7.4,DASH:110,BUMP:16,LCD:3.0,CROUCH:.26,SHARE3:[.3,.3,.4],SHARE2:[.45,.55],CAP:99999,STOP_SHORT:.55,AURA:!/[?&]aura=off\b/.test(Q)}};
const ERR=(w,e)=>{KN.err=w+': '+((e&&e.message)||e);try{console.error('[KNUCKLE]',w,e)}catch(_){}};
if(OFF)return;
const CG='#ffb347',CY='#ffd36b',CW='#fff3c4',TAU=Math.PI*2;
const clampK=(v,a,b)=>v<a?a:v>b?b:v,sstep=(x,a,b)=>{const u=clampK((x-a)/(b-a),0,1);return u*u*(3-2*u)},seg=(x,a,b)=>clampK((x-a)/(b-a),0,1),ease=u=>1-Math.pow(1-u,3);
const hash=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s)};
const low=()=>{try{return G.gfx==='low'}catch(_){return false}};
const KF={arm_near:[[0,0],[.3,80],[.55,40],[.75,35],[1,0]],forearm_near:[[0,0],[.3,0],[.55,110],[.75,115],[1,0]],arm_far:[[0,0],[.3,28],[.55,30],[.75,88],[1,0]],forearm_far:[[0,0],[.3,125],[.55,120],[.75,0],[1,0]],torso:[[0,0],[.3,-5],[.55,0],[.75,-8],[1,0]]};
const KF3={arm_near:[[0,0],[.22,80],[.36,40],[.64,40],[.78,80],[.92,40],[1,0]],forearm_near:[[0,0],[.22,0],[.36,110],[.64,110],[.78,0],[.92,110],[1,0]],
 arm_far:[[0,0],[.1,28],[.22,30],[.5,88],[.64,30],[.9,30],[1,0]],forearm_far:[[0,0],[.1,125],[.22,120],[.5,0],[.64,120],[.9,120],[1,0]],torso:[[0,0],[.22,-5],[.5,-8],[.78,-6],[1,0]]};
const CFGA={lunge:{kf:KF3,hits:[.22,.5,.78],dur:.56,hs:.045},step:{kf:KF,hits:[.3,.75],dur:.8,hs:.05}};
const STANCE={leg_near:14,leg_far:-14,foot_near:-12,foot_far:12,head:0};
const kfv=(keys,q)=>{for(let i=1;i<keys.length;i++)if(q<=keys[i][0]){const a=keys[i-1],b=keys[i],u=(q-a[0])/(b[0]-a[0]),s=u*u*(3-2*u);return a[1]+(b[1]-a[1])*s}return keys[keys.length-1][1]};
const PU=()=>window.PUPPET,PX=()=>window.PUPPETX;
/* ---------------- attack clock (same maths as skill.js, per attack A with T0) ---------------- */
const hitT=(A,k)=>A.T0+A.c.hits[k]*A.c.dur+k*A.c.hs;
function qAt(A,tt){const C=A.c,n=C.hits.length;let pt=tt-A.T0;if(pt<0||pt>C.dur+n*C.hs)return -1;for(let k=0;k<n;k++)pt-=clampK(tt-hitT(A,k),0,C.hs);return pt>=0&&pt<=C.dur?pt/C.dur:-1}
function crouchAt(A,tt){if(!A||!A.lunge)return 0;const T0=A.T0,s=A.s||1;return sstep(tt,T0-.26*s,T0-.07*s)*(1-sstep(tt,T0+.02*s,T0+.12*s))}
function poseAt(A,tt){const q=qAt(A,tt),r=Object.assign({},STANCE);r.torso=0;r.arm_near=0;r.arm_far=0;r.forearm_near=0;r.forearm_far=0;
  const b=Math.sin(tt*2.6);r.torso=b*.8;r.arm_near=b*1.5;r.arm_far=-b*1.5;
  const cr=crouchAt(A,tt);if(cr>0){r.torso+=-15*cr;r.leg_near+=26*cr;r.leg_far+=-20*cr;r.foot_near+=-14*cr;r.foot_far+=12*cr;r.arm_near+=22*cr;r.forearm_near+=70*cr;r.arm_far+=14*cr;r.forearm_far+=90*cr}
  if(q>=0)for(const k in A.c.kf)r[k]=kfv(A.c.kf[k],q);return {rot:r,off:{},air:0,q}}
const A_END=A=>A.T0+A.c.dur+A.c.hits.length*A.c.hs;
/* pose the puppet glue asks for (see glue_h5r6p2 poseNow): returns null when no attack is running */
KN.pose=function(){const A=KN.A;if(!A||!KN.on)return null;const tt=time;if(tt>A_END(A)+.02)return null;if(tt<A.T0-.27*(A.s||1))return null;return poseAt(A,tt)};
/* hero position history (for fist ghosts) */
const histAt=tt=>{const H=KN.hist;for(let i=H.length-1;i>=0;i--)if(H[i].t<=tt)return H[i];return H[0]||{x:P.x,y:P.y}};
/* ---------------- fist world positions ---------------- */
const FL=75,FT=70;
function fistPos(which,pose,x,y,sc,fac){const U=PU();if(!U||!U.solve)return null;try{const W=U.solve(pose),m=W['fist_'+which];if(!m)return null;const al=(window.PUPPET_ALIGN||{})[(U.slots&&U.slots['fist_'+which])||(which==='near'?'fist':'fist_dark')]||[0,0];
  const lx=FL+al[0],ly=FT+al[1],X=m[0]*lx+m[2]*ly+m[4],Y=m[1]*lx+m[3]*ly+m[5],gy=U.footY(W),sx=fac>0?-1:1,h=W.head,hx=h?h[0]*140+h[2]*150+h[4]:X,hy=h?h[1]*140+h[3]*150+h[5]:Y;
  return {x:x+sx*sc*X,y:y+sc*(Y-gy),hx:x+sx*sc*hx,hy:y+sc*(hy-gy)}}catch(e){ERR('fistPos',e);return null}}
/* ---------------- sprites ---------------- */
const mk=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'));return c};
const FIST=mk(44,34,g=>{g.translate(4,17);const q=g.createRadialGradient(18,-2,2,16,0,22);q.addColorStop(0,'#fffbe6');q.addColorStop(.5,'#ffc46b');q.addColorStop(1,'#d9822a');
  g.fillStyle=q;g.strokeStyle='#fff0b8';g.lineWidth=2;g.lineJoin='round';g.beginPath();g.moveTo(0,-9);g.quadraticCurveTo(6,-14,20,-13);g.quadraticCurveTo(34,-12,36,-3);g.quadraticCurveTo(38,3,34,9);g.quadraticCurveTo(22,14,8,12);g.quadraticCurveTo(0,10,0,-9);g.closePath();g.fill();g.stroke();
  g.fillStyle='#fffbe6';for(let i=0;i<4;i++){g.beginPath();g.arc(30,-10+i*6.4,2.6,0,6.283);g.fill()}});
const GL=c=>glowSprite(c);
function curl(x,y,len,wid,ang,bend,a){if(a<=.01||len<4)return;const dx=Math.cos(ang),dy=Math.sin(ang),nx=-dy,ny=dx,N=12,L1=[],R1=[];
  for(let k=0;k<=N;k++){const u=k/N,cx=x+dx*len*u+nx*bend*Math.sin(u*Math.PI)*(1-u*.3),cy=y+dy*len*u+ny*bend*Math.sin(u*Math.PI)*(1-u*.3),w=wid*Math.pow(Math.sin(Math.min(1,u*1.0+.18)*Math.PI*.5),.7)*Math.pow(1-u,.75)+.2;L1.push([cx+nx*w,cy+ny*w]);R1.push([cx-nx*w,cy-ny*w])}
  ctx.save();ctx.globalAlpha=Math.min(1,a);const g=ctx.createLinearGradient(x,y,x+dx*len,y+dy*len);g.addColorStop(0,CW);g.addColorStop(.3,CY);g.addColorStop(.65,CG);g.addColorStop(1,'rgba(255,150,40,0)');ctx.fillStyle=g;
  ctx.beginPath();ctx.moveTo(L1[0][0],L1[0][1]);for(const p of L1)ctx.lineTo(p[0],p[1]);for(let k=N;k>=0;k--)ctx.lineTo(R1[k][0],R1[k][1]);ctx.closePath();ctx.fill();ctx.restore()}
function tear(x,y,len,wid,ang,a){if(a<=.01||len<2)return;ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.globalAlpha=Math.min(1,a);
  const g=ctx.createLinearGradient(-wid*.5,0,len,0);g.addColorStop(0,CW);g.addColorStop(.3,CY);g.addColorStop(.65,CG);g.addColorStop(1,'rgba(255,150,40,0)');ctx.fillStyle=g;
  ctx.beginPath();ctx.moveTo(0,-wid);ctx.bezierCurveTo(len*.35,-wid*1.05,len*.7,-wid*.5,len,0);ctx.bezierCurveTo(len*.7,wid*.5,len*.35,wid*1.05,0,wid);ctx.quadraticCurveTo(-wid*.9,0,0,-wid);ctx.fill();ctx.restore()}
/* ---------------- aura on one fist ---------------- */
function auraFist(fp,A,wu,ph,t){const fade=clampK((Math.hypot(fp.x-fp.hx,fp.y-fp.hy)-26)/36,.3,1),a=A*fade;if(a<=.02)return;
  const br=1+.12*Math.sin(t*5.2+ph)+.06*Math.sin(t*8.7+ph*2.3),R=(26-8*wu)*br;ctx.save();ctx.globalCompositeOperation='lighter';
  ctx.globalAlpha=clampK(.42*a,0,.85);ctx.drawImage(GL(CG),fp.x-R*1.7,fp.y-R*1.7,R*3.4,R*3.4);ctx.globalAlpha=clampK(.55*a,0,.95);ctx.drawImage(GL(CY),fp.x-R*.9,fp.y-R*.9,R*1.8,R*1.8);
  if(wu>0){ctx.globalAlpha=.35*wu*fade;ctx.drawImage(GL(CW),fp.x-R*.6,fp.y-R*.6,R*1.2,R*1.2)}
  const n=low()?3:5;for(let i=0;i<n;i++){const f=((t*.95+i/n+ph*.31)%1),fl=.75+.25*Math.sin(t*14+i*2+ph),x=fp.x+(i-(n-1)/2)*5+Math.sin(f*6+i+ph)*3,y=fp.y-8,len=(18+9*wu+8*Math.sin(i*1.7+ph))*(1-f*.5)*fl*clampK((Math.hypot(fp.x-fp.hx,fp.y-fp.hy)-20)/60,.25,1),ang=-Math.PI/2+Math.sin(f*5+i*1.3+ph)*.35;
    curl(x,y,len*.9,4.4+wu*1.5,ang,(i%2?1:-1)*(5+3*Math.sin(t*6+i)),clampK((1-f*.7)*.9*a,0,.95))}
  for(let i=0;i<3;i++){const an=t*3.4+ph*1.9+i*2.094,rx=(22-8*wu),x=fp.x+Math.cos(an)*rx,y=fp.y+Math.sin(an)*rx*.45,s=7+2*Math.sin(an);ctx.globalAlpha=clampK(.75*a*(Math.sin(an)>0?1:.6),0,.9);ctx.drawImage(GL(CW),x-s/2,y-s/2,s,s)}
  ctx.restore()}
function windStreaks(fp,u,id){if(u<=0||u>=1)return;ctx.save();ctx.globalCompositeOperation='lighter';const n=low()?4:6,al=Math.sin(u*Math.PI);
  for(let i=0;i<n;i++){const an=i/n*6.283+hash(id*3+i)*.6+u*.8,f=((u*1.25+i*.17)%1),r0=58*(1-ease(f))+10,x=fp.x+Math.cos(an)*r0,y=fp.y+Math.sin(an)*r0*.7;ctx.globalAlpha=al*.9*(1-f*.3);ctx.drawImage(GL(CY),x-6,y-6,12,12);tear(x,y,16+8*(1-f),3.2,an,al*.8*(1-f*.4))}ctx.restore()}
const LAGS=[.035,.07,.11,.16];
function ghosts(which,fp0,A,t){const U=PU(),L=KN.last;if(!A||!L)return;const n=low()?2:4;
  for(let j=n-1;j>=0;j--){const lag=LAGS[j],tt=t-lag,h=histAt(tt),fa=PX()&&PX().cfg?(PX().cfg.FOOT_DY||0):0,p=fistPos(which,poseAt(A,tt),h.x,L.y+(h.y-P.y),L.sc,L.fac);if(!p)continue;
    const dx=fp0.x-p.x,dy=fp0.y-p.y,d=Math.hypot(dx,dy);if(d<3)continue;const al=clampK(d/30,0,1)*(.85-j*.17);
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=al*.35;ctx.drawImage(GL(CG),p.x-20,p.y-14,40,28);ctx.restore();ctx.save();ctx.translate(p.x,p.y);ctx.globalAlpha=al;ctx.drawImage(FIST,-16,-17,44,34);ctx.restore()}
  const t2=t-.05,h2=histAt(t2),p1=fistPos(which,poseAt(A,t2),h2.x,L.y+(h2.y-P.y),L.sc,L.fac);if(!p1)return;const vx=fp0.x-p1.x,vy=fp0.y-p1.y,sp=Math.hypot(vx,vy);
  if(sp>5){const al=clampK(sp/22,0,1),ang=Math.atan2(-vy,-vx),nx=-Math.sin(ang),ny=Math.cos(ang);ctx.save();ctx.globalCompositeOperation='lighter';
    for(let i=-1;i<=1;i++)curl(fp0.x+nx*i*6-Math.cos(ang)*4,fp0.y+ny*i*6*.8-Math.sin(ang)*4,(30+sp*2.2)*(i?.7:1),i?4:7.5,ang,i*5+3,al*(i?.55:.85));ctx.restore()}}
/* ---------------- impacts (local frame: +x = hero -> target) ---------------- */
function impactDraw(m,t){const a=t-m.t0;if(a<0||a>.75)return;const s=m.size;ctx.save();ctx.translate(m.x,m.y);ctx.rotate(m.ang);ctx.globalCompositeOperation='lighter';
  const f=1-seg(a,0,.2),gr=ease(seg(a,0,.09));
  if(f>0){const r=(20+20*gr)*(s>1?1.15:1);ctx.globalAlpha=f*.5;ctx.drawImage(GL(CY),-r,-r,r*2,r*2);ctx.globalAlpha=f*.22;ctx.drawImage(GL(CW),-r*.5,-r*.5,r,r);ctx.globalAlpha=f*.4;ctx.drawImage(GL(CG),-r*1.5,-r*1.5,r*3,r*3);
    const np=low()?6:8;for(let i=0;i<np;i++){const an=i/np*6.283+m.id*.5+a*1.2,ln=(26+16*(i%2))*s*gr*(1-seg(a,.08,.2)*.4);tear(0,0,ln*(1-.65*Math.max(0,-Math.sin(an))),6.5*s,an,f*.9)}}
  for(let c=0;c<2;c++){const u=ease(seg(a,c*.05,.3+c*.05));if(u>0&&u<1){ctx.save();ctx.lineCap='round';ctx.strokeStyle=c?CG:CY;ctx.globalAlpha=(1-u)*(c?.6:.9);ctx.lineWidth=(16*s*(1-u)+2);ctx.beginPath();ctx.arc(-30*s*(1-u),0,(24+80*s*u)*(c?.8:1),-.95,.95);ctx.stroke();ctx.restore()}}
  const ns=Math.round((low()?8:13)*(s>1?1.4:1));
  for(let i=0;i<ns;i++){const an=-1.9+hash(m.id*31+i)*3.8,sp=220+hash(m.id*17+i)*260,life=.3+hash(i*3+m.id)*.2,u=a/life;if(u>=1)continue;const d=sp*(1-Math.exp(-5*a))/5,x=Math.cos(an)*d*.95,y=Math.sin(an)*d*.8+60*a*a,sz=(8+5*hash(i+9))*(1-u*.6);
    ctx.globalAlpha=(1-u);ctx.drawImage(GL(i%2?CY:CW),x-sz/2,y-sz/2,sz,sz);tear(x,y,18*(1-u)+4,sz*.32,an+Math.PI,(1-u)*.8)}
  for(let k=0;k<5;k++){const u0=seg(a,.04+k*.03,.04+k*.03+.4);if(u0<=0||u0>=1)continue;for(let j=0;j<3;j++){const u=clampK(u0-j*.07,0,1),x=-u*(46+k*7)+Math.sin(k*2.1+u*5)*9*u,y=-u*(34+k*5)+Math.sin(k*1.3+u*4)*6,sz=(j?9:15)*s*(1-u*.4);ctx.globalAlpha=(1-seg(u0,.7,1))*(j?.45:.8);ctx.drawImage(GL(j?CG:CY),x-sz/2,y-sz/2,sz,sz)}}
  ctx.restore();
  /* two soft ground rings at the target's feet (not rotated) */
  ctx.save();ctx.globalCompositeOperation='lighter';for(let r2=0;r2<2;r2++){const u=ease(seg(a,r2*.06,.45+r2*.06));if(u<=0||u>=1)continue;ctx.save();ctx.translate(m.fx,m.fy);ctx.scale(1,.55);const R2=(12+88*s*u)*(r2?.8:1)*(m.lun?1.25:1);
    ctx.strokeStyle=CG;ctx.globalAlpha=(1-u)*.35;ctx.lineWidth=(16*(1-u)+3);ctx.beginPath();ctx.arc(0,0,R2,0,6.283);ctx.stroke();ctx.strokeStyle=r2?CY:CW;ctx.globalAlpha=(1-u)*(r2?.7:.95);ctx.lineWidth=(5*(1-u)+1)*(r2?.7:1);ctx.stroke();ctx.restore()}ctx.restore()}
/* burst THROUGH the monster, drawn behind its sprite, flying away from the hero */
function impactRear(m,t){const a=t-m.t0-.03;if(a<0||a>.6)return;const s=m.size,gr=ease(seg(a,0,.1)),f=1-seg(a,.06,.3);ctx.save();ctx.translate(m.rx,m.ry);ctx.rotate(m.ang);ctx.globalCompositeOperation='lighter';
  if(f>0){const r=44*s*(.6+.4*gr);ctx.globalAlpha=f*.7;ctx.drawImage(GL(CY),-r,-r,r*2,r*2);ctx.globalAlpha=f*.35;ctx.drawImage(GL(CW),-r*.45,-r*.45,r*.9,r*.9);
    const np=low()?4:6;for(let i=0;i<np;i++){const an=-1.0+i*(2.0/(np-1))+(hash(m.id*7+i)-.5)*.3,ln=(46+26*(i%2))*s*gr;tear(0,0,ln,8*s,an,f*.95)}}
  const ns=Math.round((low()?7:12)*(s>1.2?1.4:1));
  for(let i=0;i<ns;i++){const an=-1.0+hash(m.id*13+i)*2.0,sp=260+hash(m.id*5+i)*300,life=.3+hash(i*7+m.id)*.2,u=a/life;if(u>=1)continue;const d=sp*(1-Math.exp(-5*a))/5,x=Math.cos(an)*d,y=Math.sin(an)*d*.8+50*a*a,sz=(8+5*hash(i+3))*(1-u*.6);
    ctx.globalAlpha=(1-u);ctx.drawImage(GL(i%2?CY:CW),x-sz/2,y-sz/2,sz,sz);tear(x,y,20*(1-u)+4,sz*.32,an+Math.PI,(1-u)*.8)}
  ctx.restore()}
/* ---------------- starting an attack ---------------- */
let uidN=0;
function startAttack(){const W=WEAPONS.knuckle||{range:78,mult:.85,aspd:1.9,arc:1.5};const tgt=aimPoint(),ang=Math.atan2(tgt.y-P.y,tgt.x-P.x);P.face=ang;
  let best=null,bd=1e9;const reach=KN.cfg.DASH+W.range;for(const e of enemies){if(e.dead)continue;const d=Math.hypot(e.x-P.x,e.y-P.y),da=Math.abs(((Math.atan2(e.y-P.y,e.x-P.x)-ang+Math.PI*3)%TAU)-Math.PI);if(d<reach&&da<.9&&d<bd){bd=d;best=e}}
  if(!best){const n=nearestEnemy(P.x,P.y,W.range+30);if(n){best=n;bd=Math.hypot(n.x-P.x,n.y-P.y)}}
  const ready=time-KN.lastDash>=KN.cfg.LCD,lunge=!!(best&&ready&&bd>W.range*.6);
  /* r73: the whole punch (crouch, dash, hit frames, hit-stop, recovery) runs 1/F times as long, F = the ASPD factor every weapon uses (aspdHits() / weapon base aspd = P.aspdF x (1 + aspd buffs)); the lunge CD (3 s) is not scaled. ?knaspd=off = old fixed timings. */
  const F=KASPD?clampK((P.aspdF||1)*(1+(typeof B==='function'?B('aspd'):0)),.4,8/(W.aspd||1.9)):1,s=1/F,C0=lunge?CFGA.lunge:CFGA.step,Cs=Object.assign({},C0,{dur:C0.dur*s,hs:C0.hs*s});
  const A={id:++uidN,lunge,s,F,c:Cs,ang:best?Math.atan2(best.y-P.y,best.x-P.x):ang,tgt:best,start:time,T0:lunge?time+KN.cfg.CROUCH*s:time,x0:P.x,y0:P.y,hit:0,mm:lunge?KN.cfg.MULT_LUNGE:KN.cfg.MULT_STEP,range:W.range,arc:W.arc||1.5};
  if(best&&best!==undefined)P.face=A.ang;
  if(lunge){KN.lastDash=time;KN.stats.dash++;const stop=Math.max(best.sz+P.r+10,W.range*KN.cfg.STOP_SHORT);A.D=clampK(bd-stop,0,KN.cfg.DASH)}else{KN.stats.step++;A.D=best?clampK(bd-(best.sz+P.r+8),0,KN.cfg.BUMP):KN.cfg.BUMP}
  KN.A=A;const dur=A_END(A)-time+.05*s,asp=Math.min(8,W.aspd*(P.aspdF||1)*(1+(typeof B==='function'?B('aspd'):0)));P.atkCd=Math.max(1/asp,dur);P.lastAtk=time;G.basicT=time;return A}
function doHit(A,k){const n=A.c.hits.length,sh=(n===3?KN.cfg.SHARE3:KN.cfg.SHARE2)[k]||1/n,mm=A.mm*sh;let first=null;
  for(const e of enemies){if(e.dead||!inSector(e,P.x,P.y,A.ang,A.range+8,A.arc))continue;hitEnemy(e,mm,{dt:'phys',pl:(typeof wpal==='function'?wpal():undefined),knk:1,basic:1});if(!first)first=e;KN.stats.hits++;e._knHit={t0:time,k:k%2,big:A.lunge&&k===2?1.55:A.lunge?1.25:1,ang:A.ang,id:A.id*3+k}}
  const tg=first||A.tgt,size=((k%2)?1.5:1)*(A.lunge?(k===2?1.55:1.25):1);
  const ex=tg?tg.x:P.x+Math.cos(A.ang)*A.range,ey=tg?tg.y:P.y+Math.sin(A.ang)*A.range,sz=tg?tg.sz:14;
  KN.imp.push({t0:time,k:k%2,size,lun:A.lunge,ang:A.ang,id:A.id*3+k,x:ex-Math.cos(A.ang)*sz*.5,y:ey-sz*.8-Math.sin(A.ang)*sz*.4+Math.sin(A.ang)*0,fx:ex,fy:ey+sz*.3,rx:ex+Math.cos(A.ang)*14,ry:ey-sz*.7+6,e:tg});
  if(KN.imp.length>16)KN.imp.shift();try{sfx('swing','knuckle')}catch(_){}}
/* ---------------- per-frame logic ---------------- */
function tick(dt){try{if(typeof P==='undefined'||!P)return;const H=KN.hist;H.push({t:time,x:P.x,y:P.y});while(H.length&&time-H[0].t>.8)H.shift();
  const A=KN.A;if(!A)return;if(P.dead||!(P.weapon&&P.weapon.t==='knuckle')){KN.A=null;return}
  const tt=time;
  /* rooted while crouching */
  const s=A.s||1;if(A.lunge&&tt<A.T0-.05*s){P.x=A.x0;P.y=A.y0;P.vx=P.vy=0}
  /* dash / step: real movement along the locked angle, stops at walls */
  const mv=A.lunge?sstep(tt,A.T0-.05*s,A.T0+.13*s):sstep(tt,A.T0-.05*s,A.T0+.15*s),want=A.D*mv,dx=Math.cos(A.ang),dy=Math.sin(A.ang);
  const cur=Math.hypot(P.x-A.x0,P.y-A.y0);if(!A.stuck&&want>cur+.01&&(A.lunge||tt>=A.T0-.05*s)){let step=want-cur;const n=Math.max(1,Math.ceil(step/6));for(let i=0;i<n;i++){const sx=P.x+dx*step/n,sy=P.y+dy*step/n;if(blocked(sx,sy,P.r*.8)){A.stuck=1;KN.stats.wallStops++;break}P.x=sx;P.y=sy}}
  for(let k=A.hit;k<A.c.hits.length;k++){if(tt>=hitT(A,k)){doHit(A,k);A.hit=k+1}else break}
  if(tt>A_END(A)+.15*s)KN.A=null}catch(e){ERR('tick',e)}}
/* ---------------- hooks ---------------- */
try{const _u=update;update=function(dt){const r=_u.apply(this,arguments);tick(dt);return r}}catch(e){ERR('hook update',e)}
try{const _b=basicAttack;basicAttack=function(){if(!(P&&P.weapon&&P.weapon.t==='knuckle'))return _b.apply(this,arguments);
  if(P.atkCd>0||P.dead||P.dash||G.edit||P.casting)return;try{if(typeof stunned==='function'&&stunned())return}catch(_){}startAttack()}}catch(e){ERR('hook basic',e)}
/* damage cap 99,999 per hit (own number) */
try{const _a=applyDamage;applyDamage=function(e,d,crit,o){if(o&&o.knk&&d>KN.cfg.CAP)d=KN.cfg.CAP;return _a.call(this,e,d,crit,o)}}catch(e){ERR('hook damage',e)}
/* puppet: our attack pose + tremble / crouch drop; remember what was drawn (fist positions) */
function hookPuppet(){const U=PU();if(!U||U._knHook)return !!(U&&U._knHook);const _d=U.draw;if(typeof _d!=='function')return false;U._knHook=1;
  U.draw=function(c,x,y,sc,fac,pose){let dx=0,dy=0;const A=KN.A;if(A&&A.lunge){const cr=crouchAt(A,time),pre=cr>.05?cr:0;dx=Math.sin(time*97)*3.2*pre;dy=Math.sin(time*83+1)*2.4*pre+5*cr}
    KN.last={x:x+dx,y:y+dy,dy:dy,sc:sc,fac:fac,pose:pose,at:time};return _d.call(this,c,x+dx,y+dy,sc,fac,pose)};return true}
setInterval(()=>{try{hookPuppet()}catch(e){ERR('hookPuppet',e)}},300);
/* glue_h5r6p2 poseNow: our pose wins while a punch plays (patched below through PUPPETX.knPose) */
try{const X=PX();if(X)X.knPose=()=>KN.pose()}catch(_){}
/* front VFX: aura on both fists, wind-up, ghosts, impacts (world space, after the entities) */
try{const _t=drawTexts;drawTexts=function(){const r=_t.apply(this,arguments);try{if(KN.cfg.AURA&&P&&P.weapon&&P.weapon.t==='knuckle'&&!P.dead&&KN.last&&time-KN.last.at<.2){const L=KN.last,t=time,A=KN.A;
    const fn=fistPos('near',L.pose,L.x,L.y,L.sc,L.fac),ff=fistPos('far',L.pose,L.x,L.y,L.sc,L.fac);
    if(fn&&ff){let wuN=0,wuF=0,bN=0,bF=0,atk=0,cro=0;if(A){atk=qAt(A,t)>=0?1:0;cro=crouchAt(A,t);for(let k=0;k<A.c.hits.length;k++){const d=hitT(A,k)-t;if(d>0&&d<.16){const v=1-d/.16;if(k%2)wuF=Math.max(wuF,v);else wuN=Math.max(wuN,v)}}}
      for(const m of KN.imp){const a=t-m.t0;if(a>=0&&a<.5){const v=1-seg(a,.05,.5);if(m.k)bF=Math.max(bF,v);else bN=Math.max(bN,v)}}
      const aN=clampK(.85+.25*atk+.4*cro+.6*wuN+.5*bN,0,1.5),aF=clampK(.85+.25*atk+.4*cro+.6*wuF+.5*bF,0,1.5);
      auraFist(ff,aF*1.3,wuF,2.1,t);auraFist(fn,aN,wuN,0,t);windStreaks(fn,wuN,1);windStreaks(ff,wuF,2);if(A){ghosts('near',fn,A,t);ghosts('far',ff,A,t);lungeFx(A,t)}}
    for(const m of KN.imp)impactDraw(m,t)}}catch(e){ERR('draw',e)}return r}}catch(e){ERR('hook texts',e)}
/* dash extras: dust at take-off, flame trail at the feet, gold body after-images */
const FB=document.createElement('canvas');FB.width=320;FB.height=360;const FBg=FB.getContext('2d');
function lungeFx(A,t){if(!A.lunge||!KN.last)return;const L=KN.last,T0=A.T0;if(t<T0-.06||t>T0+1.0)return;const mvNow=(h=>Math.hypot(P.x-h.x,P.y-h.y))(histAt(t-.04)),dir=Math.cos(A.ang);
  const du=seg(t,T0-.05,T0+.6);if(du>0&&du<1){ctx.save();for(let i=0;i<7;i++){const f=clampK(du*1.15-i*.07,0,1);if(f<=0||f>=1)continue;const x=A.x0-Math.cos(A.ang)*i*11,y=A.y0+4-Math.sin(A.ang)*i*5-f*5,r=5+i*1.2+f*9;ctx.globalAlpha=(1-f)*.5;ctx.fillStyle='#d9c690';ctx.beginPath();ctx.ellipse(x,y,r,r*.55,0,0,6.283);ctx.fill()}ctx.restore()}
  if(mvNow>1.5){ctx.save();ctx.globalCompositeOperation='lighter';const al=clampK(mvNow/9,0,1),ln=40+mvNow*6,ba=A.ang+Math.PI;curl(P.x,P.y+6,ln,9,ba,-9,al*.85);curl(P.x,P.y+9,ln*.65,5,ba,8,al*.6);ctx.restore()}
  if(mvNow>1.2&&PU()&&PU().draw){const U=PU();for(let j=3;j>=1;j--){const lag=j*.05,h2=histAt(t-lag);if(Math.hypot(P.x-h2.x,P.y-h2.y)<5)continue;FBg.setTransform(1,0,0,1,0,0);FBg.clearRect(0,0,320,360);try{U.draw.call(U,FBg,160,300,L.sc,L.fac,poseAt(A,t-lag))}catch(_){}FBg.globalCompositeOperation='source-atop';FBg.fillStyle='rgba(255,160,40,.75)';FBg.fillRect(0,0,320,360);FBg.globalCompositeOperation='source-over';
    ctx.save();ctx.globalAlpha=.6-j*.14;ctx.drawImage(FB,h2.x-160,L.y+(h2.y-P.y)-300);ctx.restore()}}}
/* monsters: rear burst behind the sprite + squash (visual only, position never changes) */
try{const _d=drawEnemy;drawEnemy=function(e){const h=e&&e._knHit;if(!h||e.dead||time-h.t0>.8)return _d.apply(this,arguments);const a=time-h.t0;
    try{if(KN.cfg.AURA)for(const m of KN.imp)if(m.e===e||(m.id===h.id))impactRear(m,time)}catch(er){ERR('rear',er)}
    const sq=a<.2?(1-a/.2)*(h.k?.18:.12):0;if(sq<=0)return _d.apply(this,arguments);const cx=e.x,cy=e.y+e.sz*.35;ctx.save();ctx.translate(cx,cy);ctx.scale(1+sq*.6,1-sq);ctx.translate(-cx,-cy);try{return _d.apply(this,arguments)}finally{ctx.restore()}}}catch(e){ERR('hook enemy',e)}
/* dash CD indicator near the attack button */
let ring=null;function cdTick(){try{const b=document.getElementById('bAtk')||document.getElementById('atkBtn')||document.querySelector('[data-act="attack"]')||document.querySelector('.atk,#attack');
  if(!b||!P||!(P.weapon&&P.weapon.t==='knuckle')){if(ring)ring.style.display='none';return}
  if(!ring){ring=document.createElement('div');ring.id='knCd';ring.style.cssText='position:fixed;z-index:7;width:30px;height:30px;border-radius:50%;pointer-events:none;font:700 9px system-ui,sans-serif;color:#fff3c4;display:flex;align-items:center;justify-content:center;text-shadow:0 0 3px #000';document.body.appendChild(ring)}
  const r=b.getBoundingClientRect();ring.style.display='flex';ring.style.left=(r.left+r.width-14)+'px';ring.style.top=(r.top-10)+'px';const left=Math.max(0,KN.cfg.LCD-(time-KN.lastDash)),pc=1-left/KN.cfg.LCD;
  ring.style.background=left>0?'conic-gradient(#ffb347 '+(pc*360)+'deg, rgba(20,14,6,.7) 0)':'radial-gradient(circle,#fff3c4 0,#ffb347 70%)';ring.textContent=left>0?left.toFixed(1):'พุ่ง'}catch(e){}}
setInterval(cdTick,120);
console.info('[KNUCKLE] knuckle punch r13 loaded');
})();
