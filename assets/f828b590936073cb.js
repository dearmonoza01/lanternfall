
/* ---- candidate_sword_atk5_r18: p224 r9 Sword Skill 1 animation + FX (2 slashes + cross-fade to the recovery frames) ---- */
/* p224 r9 (candidate_sword_atk3_r2, user 20:17): Skill 1 = dash -> rising slash -> downward slash -> recover. H3-H5 are removed: no spin sweeps, no wind-up light, no ground ring / wind ring,
   no H3-H5 sparks or dust, no hit-stop (the clock is now plain anim time). Frames follow p223 r9 (f11..f44, cross-fade to f68..f79). H1 / H2 crescents, entry dust, target sparks of H1 / H2 unchanged.
   p224 r6 (candidate_sword_sk1_anim_r5, user 23:27): H1 / H2 (rising / downward slash) crescents = the blade's own length (tip, no extension);
   everything else = r5 (H3–H5 rings on the damage radius, ground ring, bigger dust).
   p224 r5 (candidate_sword_sk1_anim_r4, user 23:17): the sword waves now reach EXACTLY the damage radius of each hit (read live from
   p223 cfg.hits[i].r, now 30% smaller): H1/H2 crescents are extended along the blade until their farthest point = hit radius; H3–H5 rings'
   outer edge = hit radius; the faint ground ring sits on the H5 radius. Ground dust 1.6× bigger. Frames / timing / colours otherwise = r4.
   p224 r4 (candidate_sword_sk1_anim_r3, user 23:03): FX only — same frames, same clock, same wind-up / hit-stop / damage / lock / shake.
   Wind-up = light running along the blade (no scattered motes). H5 = one wide crescent: thick at the head, tapering tail, white core, gold edge,
   thin orange-gold outer rim (reads on green grass); fast sweep round the body; no thin wind rings. H5 impact = dust fanning out from the feet +
   short soil chips; the ground ring is a faint second layer. Peak light short, fades fast. H3 / H4 lighter than before so H5 stands apart.
   p224 r3 (candidate_sword_sk1_anim_r2, user 22:19): H5 weight. Frames follow p223 r5's ONE clock (SK1.frameAt = frame map of anim time,
   hit-stop included): the wind-up slows the clip before H5, then it whips. FX: H3 < H4 < H5 sweep strength; wind-up light gathers at the blade
   (f62–66); H5 = thickest / brightest sweep + a second wind ring + bigger ground impact dust + shatter sparks / shards at the target.
   p224 — Sword Skill 1 "Rending Rush": r12 body animation + FX in the game (TEST mode only, ONE direction = E).
   Uses the existing hero sprite system (HERO3D): same camera / pixel scale / anchor (frame 282, anchor 141,208, drawScale,
   footY) and the same crop + 2 px outline atlas rules — only the frames of this clip live in their own atlas (__SK1ANIM.src).
   One timeline: the frame, the FX and the damage all read the skill clock of p223 (__SK1.state.t, 30 fps, frame = 11 + t*30);
   p223's hit times are the r12 HIT markers. The dash travel is NOT in the frames (removed at render time): the logic moves the hero
   once. After the brake the world position / attack areas stay with the logic; sways and short steps are inside the image.
   FX (shape, colour, timing from the r12 FX preview) are drawn in two layers around the hero sprite: BACK (behind the body by
   camera depth) before the sprite, FRONT after it. Other directions: old p223 behaviour (no new frames, no FX) — counted. */
/* p224 r8 (candidate_sword_sk1_anim_r6, user 13:42): ALL 8 directions from the SAME r12 Action (Pivot rotated at render time, no mirroring, no new pose per direction;
   data = window.__SK1ANIM (E) + window.__SK1ANIM_DIRS (SE..NE)). One timeline for every direction (clock, hit-stop, wind-up, FX frames). Ground-plane FX vectors
   (dust, scrape, chips) are turned with the cast direction. Short blend at skill entry (0.12 s) and exit (0.12 s) between the normal hero sprite and the skill
   frames (the grips differ) — only inside this skill's draw; no other Action is touched. */
(function(){
'use strict';
const A0=window.__SK1ANIM,AD=window.__SK1ANIM_DIRS||{};let A=A0;const SK1=window.__SK1,HD=window.__HERO3D,H=window.HERO3D;
const ST=window.SK1ANIM={ver:'p224-r9',err:null,frames:0,fallback:0,fx:{},lastFrame:null,lastDir:null};
if(!A0||!SK1||!HD||!H){ST.err='missing '+[!A0&&'__SK1ANIM',!SK1&&'__SK1',!HD&&'__HERO3D',!H&&'HERO3D'].filter(Boolean).join(',');return;}
const DN=['E','SE','S','SW','W','NW','N','NE'];const DATA=DN.map((n,i)=>i===0?A0:AD[n]||null);const IMG=DATA.map(d=>{if(!d)return null;const im=new Image();im.src=d.src;return im;});
let img=IMG[0];const ready0=()=>!!(img&&img.complete&&img.naturalWidth);let ready=true;
const F=HD.frame,K=HD.drawScale,FPS=A0.fps,F0=A0.f0,N=A0.n;
const WHITE=[255,252,240],GOLD=[255,196,84],DUST=[176,150,114],RIM=[255,138,40];
const rgba=(c,a)=>`rgba(${c[0]},${c[1]},${c[2]},${Math.max(0,Math.min(1,a)).toFixed(3)})`;
const HIT=A0.hits;                       // HIT_01..05 frames (r12 markers)
const live=()=>{const s=SK1.state;return s&&!s.ended&&SK1.test?s:null;};
const frameOf=s=>SK1.frameAt?SK1.frameAt(s):F0+s.t*FPS;   // r3: fractional source frame from the ONE skill clock (anim time + frame map)
let castDir={id:-1,d:0};
const dirOf=fa=>{const a=Math.atan2(Math.sin(fa),Math.cos(fa));return ((Math.round(a/(Math.PI/4))%8)+8)%8;};   // 0 = E (HERO3D ORDER)
// ---------- geometry: frame px -> world (anchor = sprite anchor of this draw) ----------
let AN=null;   // {x,y} sprite anchor in world (x, y+footY)
const W=p=>[AN.x+(p[0]-F.ax)*K,AN.y+(p[1]-F.ay)*K];
const AF=A0.aff,CD=A0.camdir,O=A0.origin_px;
const px3=(X,Y,Z)=>[O[0]+AF.x[0]*X+AF.y[0]*Y+AF.z[0]*Z,O[1]+AF.x[1]*X+AF.y[1]*Y+AF.z[1]*Z];
const depth3=(X,Y,Z)=>X*CD[0]+Y*CD[1]+Z*CD[2];
function qAt(fr){const t=Math.round(Math.max(F0,Math.min(F0+N-1,fr))*4)/4;return A.q[t.toFixed(2)];}
function qW(fr){const t=Math.round(Math.max(F0,Math.min(F0+N-1,fr))*4)/4;return A.qW[t.toFixed(2)];}   // [blade s=.60 X,Y,Z, hips X,Y,Z] render metres
function hipsW(fr){const w=qW(fr);return [w[3],w[4],w[5]];}
// ---------- slash crescents (real blade sweep, crescent profile, white core + gold rim) ----------
const SLASH=[{h:HIT[0],a:30,b:35,L:2.25,S:1.0,inner:1,ext:0},{h:HIT[1],a:39,b:44,L:2.25,S:1.0,inner:1,ext:0}];   // r6: blade length only; r9: H3-H5 crescents removed
function env(f,h,a,b){if(f<a||f>b)return 0;if(f<=h)return .35+.65*Math.pow((f-a)/Math.max(h-a,1e-6),1.5);return Math.pow(Math.max(0,1-(f-h)/(b-h)),1.6);}
// ---------- r5: hit radius (world px, from the logic) -> render metres; frame px (+depth) -> render metres ----------
const PXM=AF.x[0]*K;   // world px per render metre (43.3)
const hitRm=k=>{const h=SK1.cfg&&SK1.cfg.hits&&SK1.cfg.hits[k];return h?h.r/PXM:null;};
function unproj(p){   // inverse of px3 + depth3 (3 equations, 3 unknowns)
  const M=[[AF.x[0],AF.y[0],AF.z[0]],[AF.x[1],AF.y[1],AF.z[1]],[CD[0],CD[1],CD[2]]],v=[p[0]-O[0],p[1]-O[1],p[2]-O[2]];
  const d=(a,b,c)=>a[0]*(b[1]*c[2]-b[2]*c[1])-a[1]*(b[0]*c[2]-b[2]*c[0])+a[2]*(b[0]*c[1]-b[1]*c[0]);
  const D=d(M[0],M[1],M[2]),col=(i)=>M.map((r,j)=>r.map((x,k)=>k===i?v[j]:x));return [0,1,2].map(i=>{const m=col(i);return d(m[0],m[1],m[2])/D;});}
function slashReach(sl,ext){let m=0;for(let f=sl.a;f<=sl.b+1e-6;f+=.25){const Q=qAt(f),h=unproj(Q[6]),t=unproj(tipOf(Q,ext));m=Math.max(m,Math.hypot(t[0]-h[0],t[1]-h[1]));}return m;}
function fitSlashes(){ST.reach={};for(let k=0;k<2;k++){const sl=SLASH[k],T=hitRm(k);if(!T)continue;let lo=0,hi=2.5;
    for(let i=0;i<32;i++){const m=(lo+hi)/2;if(slashReach(sl,m)<T)lo=m;else hi=m;}sl.ext=lo;ST.reach['H'+(k+1)]={ext:+lo.toFixed(3),m:+slashReach(sl,lo).toFixed(3),hitM:+T.toFixed(3)};}}
function tipOf(Q,ext){const a=Q[4],b=Q[5],u=ext/.30;return [a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];}
function slashes(fr,L_){for(const s of SLASH){const e=env(fr,s.h,s.a,s.b)*s.S;if(e<=.02)continue;
  const ts=[];for(let t=fr-s.L;t<=fr+1e-6;t+=.25)if(t>=F0)ts.push(t);const n=ts.length;if(n<2)continue;
  for(const [j0,col,kk] of [[s.inner,GOLD,.8],[s.inner?2:1,WHITE,1.0]]){
    const B=ts.map((t,i)=>{const Q=qAt(t),u=i/(n-1),w=Math.pow(Math.sin(Math.PI*Math.min(1,u*1.1)),.7),tip=tipOf(Q,s.ext),inn=Q[j0];
      return {o:W(tip),i:W([tip[0]+(inn[0]-tip[0])*(.15+.85*w),tip[1]+(inn[1]-tip[1])*(.15+.85*w)]),d:tip[2]-Q[6][2]};});
    for(let i=0;i<n-1;i++){const u=(i+1)/(n-1),al=e*Math.pow(u,1.2)*kk,back=(B[i].d+B[i+1].d)/2>.05;
      if(back!==L_.back||al<.02)continue;const c=L_.ctx;
      c.fillStyle=rgba(col,al);c.beginPath();c.moveTo(B[i].o[0],B[i].o[1]);c.lineTo(B[i].i[0],B[i].i[1]);c.lineTo(B[i+1].i[0],B[i+1].i[1]);c.lineTo(B[i+1].o[0],B[i+1].o[1]);c.closePath();c.fill();}}}}
// ---------- spin energy sweeps H3..H5 (attack area): head starts at the real blade, sweeps WITH the spin, reaches the target on the HIT frame ----------
const SWEEP=[{k:2,z0:.36,z1:.36,R:.98,wd:.13,S:.55,pre:3.5,post:3.5,core:1,span:330,tp:.8,fade:1.4},{k:3,z0:.55,z1:.95,R:1.08,wd:.17,S:.68,pre:3.5,post:3.5,core:1,span:330,tp:.8,fade:1.4},
  {k:4,z0:.55,z1:.55,R:1.18,wd:.50,S:1.0,pre:1.6,post:4,core:1.6,span:235,tp:1.7,fade:2.2,rim:1}];   // r4: H3/H4 lighter; H5 one wide tapering crescent (head thick, tail thin) + orange rim   // r3: H3 < H4 < H5; H5 sweeps only on the whip (after the wind-up), thickest
function groundAz(dx,dy){   // world px offset (from the hero anchor) of a ground point -> azimuth in the render's ground plane
  const a=dx/K,b=dy/K,I=A.affInv;const X=I[0][0]*a+I[0][1]*b,Y=I[1][0]*a+I[1][1]*b;return Math.atan2(Y,X)*180/Math.PI;}
function sweeps(fr,L_,s){const tg=s.tgt;if(!tg)return;
  for(const w of SWEEP){const T=hitRm(w.k);if(T)w.R=T-(w.rim?w.wd*.62:w.wd/2);}   // r5: outer edge of each ring = that hit's damage radius
  for(const w of SWEEP){const hit=HIT[w.k],pre=w.pre,post=w.post;if(fr<hit-pre||fr>hit+post)continue;
    const C=hipsW(fr),cpx=px3(C[0],C[1],0),cw=W(cpx);   // ground point under the hips (world)
    const aT=groundAz(tg.x-cw[0],tg.y-cw[1]);
    const w0=qW(hit-pre);let a0=Math.atan2(w0[1]-w0[4],w0[0]-w0[3])*180/Math.PI;   // real blade azimuth around the hips, 3.5 frames before the hit
    while(a0-aT<90)a0+=360;while(a0-aT>450)a0-=360;
    let head,en;if(fr<=hit){const u=(fr-(hit-pre))/pre;head=a0-(a0-aT)*Math.pow(u,1.5);en=.6+.4*u;}
    else{const v=(fr-hit)/post,spd=1.5*(a0-aT)/pre;head=aT-Math.min(300,spd*(fr-hit));en=Math.pow(1-v,w.fade);}
    const tail=Math.min(a0,head+w.span),span=tail-head;if(span<2)continue;const NS=Math.max(6,Math.floor(span/6)),c=L_.ctx;
    const pt=(az,r,z)=>W(px3(C[0]+Math.cos(az*Math.PI/180)*r,C[1]+Math.sin(az*Math.PI/180)*r,z));
    for(let k=0;k<NS;k++){const aa=head+span*k/NS,ab=head+span*(k+1)/NS,q=1-(k+.5)/NS,zz=w.z1+(w.z0-w.z1)*(1-q),wd=w.wd*(w.rim?.10+.90*Math.pow(q,w.tp):.25+.75*Math.pow(q,w.tp)),al=w.S*en*Math.pow(q,.7),hh=wd*.9;
      if(al<.02)continue;const am=(aa+ab)/2*Math.PI/180,back=depth3(Math.cos(am),Math.sin(am),0)>0;if(back!==L_.back)continue;
      const LY=[[w.R-wd/2,w.R+wd/2,zz-hh/2,zz+hh/2,GOLD,w.rim?.92:.8],[w.R-wd*.15*w.core,w.R+wd*.3*w.core,zz-hh*.15*w.core,zz+hh*.3*w.core,WHITE,1.0]];
      if(w.rim)LY.unshift([w.R-wd*.62,w.R+wd*.62,zz-hh*.6,zz+hh*.6,RIM,.55]);   // thin orange-gold outer rim (separates the crescent from green ground)
      for(const [r0,r1,za,zb,col,kk] of LY){
        const p1=pt(aa,r0,za),p2=pt(aa,r1,zb),p3=pt(ab,r1,zb),p4=pt(ab,r0,za);
        c.fillStyle=rgba(col,al*kk);c.beginPath();c.moveTo(p1[0],p1[1]);c.lineTo(p2[0],p2[1]);c.lineTo(p3[0],p3[1]);c.lineTo(p4[0],p4[1]);c.closePath();c.fill();}}}}
function groundRing(fr,L_){const h=HIT[4];const t=fr-h,life=7;if(t<0||t>=life)return;const u=t/life,al=.42*Math.pow(1-u,2),rr=(hitRm(4)||1.35)*(.88+.12*u);   // r5: on the H5 damage radius   // r4: faint second layer under the crescent
  const C=hipsW(h),c=L_.ctx;c.lineWidth=Math.max(1,3*(1-u*.5)*K);
  for(let i=0;i<40;i++){const a0=i/40*2*Math.PI,a1=(i+1)/40*2*Math.PI,am=(a0+a1)/2,back=depth3(Math.cos(am),Math.sin(am),0)>0;if(back!==L_.back)continue;
    const p=W(px3(C[0]+Math.cos(a0)*rr,C[1]+Math.sin(a0)*rr,.02)),q=W(px3(C[0]+Math.cos(a1)*rr,C[1]+Math.sin(a1)*rr,.02));
    c.strokeStyle=rgba(GOLD,al*.6);c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(q[0],q[1]);c.stroke();}}
// ---------- r3: wind-up light gathering at the blade before H5 (f62 → f66) ----------
function windup(fr,L_){const a=62,b=HIT[4];if(fr<a||fr>b+.5)return;if(L_.back)return;   // r4: light gathers ALONG the blade (no scattered motes); always on top
  const u=Math.min(1,(fr-a)/(b-a)),fade=fr>b?Math.max(0,1-(fr-b)/.5):1,c=L_.ctx;
  // short trail of the blade edge over the last frame (the blade's own path), then the blade itself lit from hilt to tip
  const ts=[];for(let t=fr-2;t<=fr+1e-6;t+=.25)if(t>=F0)ts.push(t);
  for(let i=0;i<ts.length-1;i++){const Q0=qAt(ts[i]),Q1=qAt(ts[i+1]),v=(i+1)/(ts.length-1),al=.7*u*fade*Math.pow(v,1.3);if(al<.02)continue;
    const a0=W(Q0[1]),b0=W(Q0[5]),a1=W(Q1[1]),b1=W(Q1[5]);c.fillStyle=rgba(GOLD,al);c.beginPath();c.moveTo(a0[0],a0[1]);c.lineTo(b0[0],b0[1]);c.lineTo(b1[0],b1[1]);c.lineTo(a1[0],a1[1]);c.closePath();c.fill();}
  const Q=qAt(fr),h=W(Q[0]),tp=W(Q[5]);
  const g=c.createLinearGradient(h[0],h[1],tp[0],tp[1]);g.addColorStop(0,rgba(GOLD,.15*fade));g.addColorStop(.55,rgba(WHITE,.75*u*fade));g.addColorStop(1,rgba(WHITE,.98*u*fade));
  c.lineCap='round';c.strokeStyle=rgba(GOLD,.28*u*fade);c.lineWidth=(10+12*u)*K*2.2;c.beginPath();c.moveTo(h[0],h[1]);c.lineTo(tp[0],tp[1]);c.stroke();
  c.strokeStyle=rgba(GOLD,.7*u*fade);c.lineWidth=(5+6*u)*K*2.2;c.beginPath();c.moveTo(h[0],h[1]);c.lineTo(tp[0],tp[1]);c.stroke();
  c.strokeStyle=g;c.lineWidth=(2.5+3.5*u)*K*2.2;c.beginPath();c.moveTo(h[0],h[1]);c.lineTo(tp[0],tp[1]);c.stroke();
  const rr=(8+12*u)*K*2.2,gg=c.createRadialGradient(tp[0],tp[1],0,tp[0],tp[1],rr);gg.addColorStop(0,rgba(WHITE,.9*u*fade));gg.addColorStop(1,rgba(GOLD,0));
  c.fillStyle=gg;c.beginPath();c.arc(tp[0],tp[1],rr,0,6.283);c.fill();c.lineCap='butt';}
// ---------- r3: second wind ring after H5 (wider, white-blue, broken arcs) ----------
function windRing(fr,L_){const h=HIT[4],t=fr-h,life=9;if(t<0||t>=life)return;const u=t/life,al=.85*Math.pow(1-u,1.3),rr=1.25+1.0*Math.pow(u,.6);
  const C=hipsW(h),c=L_.ctx;c.lineWidth=Math.max(1.2,6*(1-u*.6)*K);
  for(let i=0;i<48;i++){if(i%8>5)continue;const a0=i/48*2*Math.PI+u*.9,a1=(i+1)/48*2*Math.PI+u*.9,am=(a0+a1)/2,back=depth3(Math.cos(am),Math.sin(am),0)>0;if(back!==L_.back)continue;
    const p=W(px3(C[0]+Math.cos(a0)*rr,C[1]+Math.sin(a0)*rr,.28)),q=W(px3(C[0]+Math.cos(a1)*rr,C[1]+Math.sin(a1)*rr,.28));
    c.strokeStyle=`rgba(225,240,255,${(al*.8).toFixed(3)})`;c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(q[0],q[1]);c.stroke();}}
// ---------- impact sparks on the target (all 5 hits) ----------
const SPK=[{k:0,S:.8,n:7,hz:1.0},{k:1,S:1.0,n:9,hz:.9}];   // r3: H5 biggest
function sparks(fr,c,s){const tg=s.tgt;if(!tg)return;
  for(const sp of SPK){const t=fr-HIT[sp.k],life=sp.k<4?4:3.5;if(t<0||t>=life)continue;const u=t/life,sz=tg.sz||16;
    const dx=AN.x-tg.x,dy=AN.y-tg.y,L=Math.hypot(dx,dy)||1,x=tg.x+dx/L*sz*.6,y=tg.y-sz*sp.hz+dy/L*sz*.3;
    const fS=sp.k===4?1.05:sp.S,fl=(13*fS*(1-u)+3)*K;c.fillStyle=rgba(WHITE,(sp.k===4?.8:.92*sp.S)*Math.pow(1-u,sp.k===4?2.4:1.5));   // r4: H5 core flash kept small + short so the monster stays visiblec.beginPath();c.ellipse(x,y,fl,fl*.8,0,0,6.283);c.fill();
    let r=sp.k*977+13;const rnd=()=>{r=(r*16807)%2147483647;return r/2147483647;};c.lineWidth=Math.max(1,4*K);c.strokeStyle=rgba(GOLD,1-u);
    for(let i=0;i<sp.n;i++){const a=rnd()*6.283,Lr=(30+rnd()*32)*sp.S*(.6+u*1.1)*K,L0=Lr*u*.55;c.beginPath();c.moveTo(x+Math.cos(a)*L0,y+Math.sin(a)*L0*.8);c.lineTo(x+Math.cos(a)*Lr,y+Math.sin(a)*Lr*.8);c.stroke();}
    if(sp.k===4){const tt=t/30;c.fillStyle=rgba(GOLD,1-u);   // r3: shatter shards (fly out, fall)
      for(let i=0;i<12;i++){const a=rnd()*6.283,v=(120+rnd()*160)*K*2.2,sx=x+Math.cos(a)*v*tt,sy=y+Math.sin(a)*v*tt*.7+380*K*tt*tt,s=(2.5+rnd()*3)*K*2.2,ro=rnd()*6+t*.8;
        c.save();c.translate(sx,sy);c.rotate(ro);c.beginPath();c.moveTo(-s,-s*.4);c.lineTo(s,0);c.lineTo(-s*.6,s*.5);c.closePath();c.fill();c.restore();}
      const rw=(14+50*u)*K*2.2;c.lineWidth=Math.max(1,3*(1-u)*K*2.2);c.strokeStyle=rgba(WHITE,.85*(1-u));c.beginPath();c.ellipse(x,y,rw,rw*.62,0,0,6.283);c.stroke();}}}
// ---------- dust / scrape / chips / wind (world-space particles, spawned from the real toe joints) ----------
const PRT=[],MARK=[];let lastFr=-1,castId=-1,rs=11;const R=()=>{rs=(rs*16807)%2147483647;return rs/2147483647;};
const G2W=(X,Y)=>{const a=AF.x,b=AF.y;return [(a[0]*X+b[0]*Y)*K,(a[1]*X+b[1]*Y)*K];};   // ground metres -> world px
const ZUP=z=>[AF.z[0]*z*K,AF.z[1]*z*K];
function puffs(x,y,n,dirs,spd,up,r0,r1,life,spread,lag){for(let i=0;i<n;i++){const d=dirs[i%dirs.length],a=Math.atan2(d[1],d[0])+(R()*2-1)*spread,v=spd[0]+R()*(spd[1]-spd[0]);
  PRT.push({k:'d',t0:lastFr+R()*lag,x:x+(R()-.5)*4,y:y+(R()-.5)*4,vx:Math.cos(a)*v,vy:Math.sin(a)*v,vz:up[0]+R()*(up[1]-up[0]),r0:r0[0]+R()*(r0[1]-r0[0]),r1:r1[0]+R()*(r1[1]-r1[0]),life:life[0]+R()*(life[1]-life[0]),tone:(R()-.5)*.24});}}
function chips(x,y,n,dirs,spd,vz){for(let i=0;i<n;i++){const d=dirs[i%dirs.length],a=Math.atan2(d[1],d[0])+(R()*2-1)*.35,v=spd[0]+R()*(spd[1]-spd[0]);
  PRT.push({k:'c',t0:lastFr,x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,vz:vz[0]+R()*(vz[1]-vz[0]),s:.02+R()*.02,life:7+R()*4,rot:R()*6.3,w:(R()-.5)*1.2});}}
const THETA=[90,45,0,-45,-90,-135,180,135];let RC=1,RS=0;   // render Pivot Z rotation per direction; forward (render metres) = (sin th, -cos th); E = +X
const rot=v=>[v[0]*RC-v[1]*RS,v[0]*RS+v[1]*RC];
const BASE={BACKD:[-1,0],FL:[.35,1],FR:[.35,-1],BL:[-1,.45],BR:[-1,-.45],FW:[1,0]};let BACKD,FL,FR,BL,BR,FW;
function setDir(d){A=DATA[d];img=IMG[d];const r=THETA[d]*Math.PI/180,fx=Math.sin(r),fy=-Math.cos(r),ph=Math.atan2(fy,fx);RC=Math.cos(ph);RS=Math.sin(ph);BACKD=rot(BASE.BACKD);FL=rot(BASE.FL);FR=rot(BASE.FR);BL=rot(BASE.BL);BR=rot(BASE.BR);FW=rot(BASE.FW);}
setDir(0);
function emit(fr){   // emitters fire when the clock crosses their frame (once per cast)
  const toe=(side,f)=>W(A.f[f][side+'ToeBase']);
  const EV=[[17,()=>{const p=toe('Right',17);puffs(p[0],p[1],30,[BACKD,BL,BR],[2,5.5],[.3,1.1],[.03,.06],[.09,.24],[12,18],.35,3);chips(p[0],p[1],18,[BACKD,BL,BR],[2.6,4.6],[1.8,3]);}],
    [19,()=>{const p=toe('Right',19);MARK.push({t0:19,a:p,b:[p[0]-G2W(...rot([.26,0]))[0],p[1]-G2W(...rot([.26,0]))[1]],life:20,w:.045});puffs(p[0],p[1],8,[BACKD],[.6,1.4],[.15,.4],[.04,.06],[.12,.2],[9,13],.5,0);}],
    [23,()=>{const p=toe('Left',23);puffs(p[0],p[1],56,[FL,FR],[3.5,9],[.3,1],[.03,.06],[.11,.28],[14,20],.32,2.5);chips(p[0],p[1],20,[FL,FR,FW],[2.2,4],[1.2,2.4]);
      MARK.push({t0:23,a:p,b:[p[0]+G2W(...rot([.2,0]))[0],p[1]+G2W(...rot([.2,0]))[1]],life:22,w:.06});}],
    [25,()=>{const p=toe('Left',25);puffs(p[0],p[1],18,[FL,FR],[1.5,3.5],[.1,.5],[.03,.05],[.08,.18],[10,16],.35,1.5);}],
    [26,()=>{const p=toe('Right',26);puffs(p[0],p[1],8,[FR,BACKD,FL],[.4,1],[.08,.25],[.04,.06],[.12,.2],[9,13],.7,0);}],
    [HIT[1],()=>{const s=live();if(!s||!s.tgt)return;const tg=s.tgt;const d8=[0,1,2,3,4,5,6,7].map(i=>[Math.cos(i*.785),Math.sin(i*.785)]);puffs(tg.x-(tg.sz||16)*.5,tg.y,10,d8,[1.2,3],[.15,.6],[.024,.04],[.08,.18],[8,13],.4,1);}]];
  for(const [f,fn] of EV)if(lastFr<f&&fr>=f){try{fn();}catch(e){ST.err='emit '+e.message;}}}
const DUSTK=1.6;   // r5: ground dust 1.6x bigger
function dustDraw(fr,L_,footY){const c=L_.ctx;
  for(const m of MARK){const t=fr-m.t0;if(t<0||t>=m.life||L_.back!==true)continue;const al=.67*Math.pow(1-t/m.life,1.4);
    c.strokeStyle=`rgba(62,46,32,${al.toFixed(3)})`;c.lineWidth=Math.max(1.5,m.w*AF.x[0]*K);c.beginPath();c.moveTo(m.a[0],m.a[1]);c.lineTo(m.b[0],m.b[1]);c.stroke();}
  for(const p of PRT){const t=fr-p.t0;if(t<0||t>=p.life)continue;const u=t/p.life;
    if(p.k==='d'){const ease=1-Math.pow(1-Math.min(1,t/(p.life*.22)),3),drag=1-Math.exp(-t/7),gm=G2W(p.vx*drag*7/30,p.vy*drag*7/30),zu=ZUP(p.vz*drag*7/30);
      const gx=p.x+gm[0],gy=p.y+gm[1];if((gy>=footY)===L_.back)continue;   // behind the feet line = back layer
      const r=DUSTK*(Math.max(p.r0,p.r1*.45)+(p.r1-Math.max(p.r0,p.r1*.45))*ease)*AF.x[0]*K,al=Math.min(1,t)*Math.pow(1-u,1.4)*.78;
      const x=gx+zu[0],y=gy+zu[1],cc=DUST.map(v=>Math.round(v*(1+p.tone)));
      const g=c.createRadialGradient(x-r*.18,y-r*.22,r*.1,x,y,r);g.addColorStop(0,`rgba(${cc[0]+40},${cc[1]+36},${cc[2]+30},${al})`);g.addColorStop(1,`rgba(${cc[0]},${cc[1]},${cc[2]},0)`);
      c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,6.283);c.fill();}
    else{const tt=t/30,z=Math.max(0,.02+p.vz*tt-4.9*tt*tt*1.6),gm=G2W(p.vx*tt*.8,p.vy*tt*.8),zu=ZUP(z),gx=p.x+gm[0],gy=p.y+gm[1];if((gy>=footY)===L_.back)continue;
      const s=Math.max(2,p.s*AF.x[0]*K),x=gx+zu[0],y=gy+zu[1],ang=p.rot+p.w*t,al=1-Math.max(0,u-.7)/.3;
      c.fillStyle=`rgba(120,96,70,${al})`;c.save();c.translate(x,y);c.rotate(ang);c.fillRect(-s,-s*.7,s*2,s*1.4);c.restore();}}
  if(!L_.back&&fr>=17&&fr<=23){const h=W(A.f[Math.round(fr)].Hips),c2=L_.ctx;let rr=Math.round(fr)*7+1;const rn=()=>{rr=(rr*16807)%2147483647;return rr/2147483647;};
    c2.lineWidth=Math.max(1,2*K);c2.strokeStyle=`rgba(255,250,232,${(.75*Math.max(0,1-Math.abs(fr-20)/4)).toFixed(3)})`;
    for(let i=0;i<6;i++){const dz=ZUP(-.35+rn()*.75),oo=(rn()-.5)*.36,L=.35+rn()*.35,a0=G2W(...rot([-.15,oo])),a1=G2W(...rot([-.15-L,oo]));
      c2.beginPath();c2.moveTo(h[0]+a0[0]+dz[0],h[1]+a0[1]+dz[1]);c2.lineTo(h[0]+a1[0]+dz[0],h[1]+a1[1]+dz[1]);c2.stroke();}}}
// ---------- one layer pass ----------
function layer(fr,s,back,footY){const L_={ctx,back};ctx.save();ctx.globalCompositeOperation='source-over';
  dustDraw(fr,L_,footY);
  ctx.shadowColor='rgba(255,214,120,.85)';ctx.shadowBlur=7;
  slashes(fr,L_);if(!back)sparks(fr,ctx,s);   // r4: no thin wind rings; ground ring drawn first (second layer)
  ctx.restore();}
// ---------- hook: the hero sprite draw ----------
const BLEND_IN=.12,BLEND_OUT=.12,ss=u=>u<=0?0:u>=1?1:u*u*(3-2*u);   // short blends (s) between the normal hero sprite and this skill's frames
const clk=()=>typeof time==='number'?time:performance.now()/1000;let EX=null;   // EX = last skill frame drawn (for the exit blend)
function skillSprite(i,x,y,alpha){const r=A.rects[i];ctx.save();ctx.globalAlpha=alpha;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.drawImage(img,r[0],r[1],r[2],r[3],x+(r[4]-F.ax)*K,y+HD.footY+(r[5]-F.ay)*K,r[2]*K,r[3]*K);ctx.restore();}
{const o=drawPlayerSprite;drawPlayerSprite=function(x,y,bob,fa){
  const s=live(),ov=SPR_OVR.player;
  if(!s||!ov||!ov.hero3d){   // not casting: exit blend (the last skill frame fades out over the normal sprite)
    if(EX&&ov&&ov.hero3d&&A===DATA[EX.d]&&ready0()){const u=(clk()-EX.t)/BLEND_OUT;if(u>=0&&u<1){const r=o.apply(this,arguments);try{skillSprite(EX.i,x,y,1-ss(u));ST.exitBlend=(ST.exitBlend||0)+1;}catch(e){}return r;}EX=null;}
    return o.apply(this,arguments);}
  // the direction is decided ONCE per cast (first drawn frame) and kept for the whole cast; all 8 come from the same r12 Action
  if(s.id!==castDir.id){const d0=dirOf(fa);castDir={id:s.id,d:DATA[d0]?d0:-1};if(castDir.d>=0)setDir(castDir.d);}
  const d=castDir.d;ST.lastDir=d;ST.lastDirName=DN[d]||'?';SK1.debugDraw=false;
  if(d<0||!ready0()){if(ST.fbCast!==s.id){ST.fbCast=s.id;ST.fallback++;}return o.apply(this,arguments);}
  try{
    if(s.id!==castId){castId=s.id;PRT.length=0;MARK.length=0;lastFr=F0-1;rs=11+s.id;ST.newCasts=(ST.newCasts||0)+1;ST.dirs=ST.dirs||{};ST.dirs[DN[d]]=(ST.dirs[DN[d]]||0)+1;}
    const fr=Math.min(F0+N-1,frameOf(s));AN={x,y:y+HD.footY};const footY=AN.y-1;
    if(fr>lastFr){emit(fr);}
    layer(fr,s,true,footY);
    const i=Math.max(0,Math.min(N-1,Math.floor(fr-F0+.06)));   // frame from the frame map (hit frame held during hit-stop)
    const bi=s.t<BLEND_IN?ss(s.t/BLEND_IN):1;   // entry blend: normal sprite underneath, skill frame fades in over it
    if(bi<1){o.apply(this,arguments);ST.entryBlend=(ST.entryBlend||0)+1;}
    const xf=SK1.xfAt?SK1.xfAt(s):null;let ie=i;
    if(xf){const ia=Math.max(0,Math.min(N-1,Math.floor(xf.a-F0+.06))),ib=Math.max(0,Math.min(N-1,Math.floor(xf.b-F0+.06))),u=xf.u*xf.u*(3-2*xf.u);skillSprite(ia,x,y,bi);skillSprite(ib,x,y,bi*u);ie=u>=.5?ib:ia;ST.xf=(ST.xf||0)+1;}   // r9: short cross-fade between the end of the downward slash and the recovery frames
    else skillSprite(i,x,y,bi);EX={t:clk(),i:ie,d};
    H.anchor={x:AN.x,y:AN.y};ST.frames++;ST.lastFrame=F0+i;
    layer(fr,s,false,footY);
    lastFr=fr;
  }catch(e){ST.err='draw '+e.message;return o.apply(this,arguments);}
};}
// ---------- TEST panel note ----------
setInterval(()=>{try{const pn=document.getElementById('sk1Panel');if(!pn)return;let n=document.getElementById('sk1AnimNote');
  if(!n){n=document.createElement('div');n.id='sk1AnimNote';n.style.cssText='margin-top:6px;padding:5px 7px;border-radius:7px;background:rgba(255,214,90,.12);border:1px solid rgba(255,214,90,.45);color:#ffe9a8;font:12px/1.4 sans-serif';pn.appendChild(n);}
  const have=DN.filter((x,i)=>DATA[i]).length;
  const last=ST.lastDirName?`ครั้งล่าสุด: ทิศ ${ST.lastDirName}${ST.lastDir>=0?' → ท่า r12 (หมุนมุมส่งออก)':' → ท่าเดิม (ไม่มีข้อมูลทิศนี้)'}`:'ยังไม่ได้ใช้สกิล';
  n.innerHTML=`<b>ท่า + FX ใหม่ (r12): ${have}/8 ทิศ</b> · ภาพทุกทิศมาจาก Action เดียว ไม่ mirror<br>${last}`;}catch(e){}},300);
try{ST.reach={};for(let k=0;k<2;k++){const m=slashReach(SLASH[k],0),hm=hitRm(k)||0;ST.reach['H'+(k+1)]={ext:0,m:+m.toFixed(3),hitM:+hm.toFixed(3),ok:hm<=m+1e-6};}ST.dirsLoaded=DN.filter((x,i)=>DATA[i]);}catch(e){ST.err='reach '+e.message;}
})();

