
/* ---- candidate_balance_v1_r74: p283 r1 Whirl tornado back (TEST only) ---- */
/* DeaRz 23 Oct 11:37 "เอาพายุกลับมาด้วย": the old Whirl (p241 r2) tornado - smoke funnel, lifted dust, spiral streaks, orbiting rocks -
   drawn around the hero during the new 12-hit Whirl (p281). The storm code below is copied unchanged from p241 r2 (stormState .. rocks);
   only its clock follows p281's 12 hits (0.22 .. 1.43 s, burst after the last hit). FX only: no hits, pulls or pushes.
   p281 calls window.__WSTORM.layer(t,back,x,y) behind and in front of the hero sprite. Off with ?wstorm=off. */
(function(){'use strict';
const X=window.__WSTORM={ver:'p283-r1',on:!/wstorm=off/.test(location.search),err:null};
try{
const A0=window.__SK1ANIM,HD=window.__HERO3D;if(!A0||!HD||!A0.qW){X.err='hooks missing';X.on=false;return;}
const CFG={storm:{on:true,H:1.95,rb:.14,rt:1.0,puffs:380,dust:120,streaks:28,rocks:26,rise:.8,spin:1.7,twist:6,formIn:.04,formDur:.34,burstDur:.50,tail:.46,backA:.62,frontA:.30,gold:.16}};
const F=HD.frame,K=HD.drawScale,F0=A0.f0,N=A0.n,AF=A0.aff,CD=A0.camdir,O=A0.origin_px,PXM=AF.x[0]*K;
const S2={T0:.22,DT:.11,N:12},NH=S2.N,hitT=k=>S2.T0+S2.DT*k;
const ss=u=>u<=0?0:u>=1?1:u*u*(3-2*u);
const envT=(d,pre,post)=>d<-pre||d>post?0:(d<=0?.35+.65*Math.pow((d+pre)/pre,1.5):Math.pow(1-d/post,1.6));
let AN=null;
const W=p=>[AN.x+(p[0]-F.ax)*K,AN.y+(p[1]-F.ay)*K];
const px3=(X_,Y,Z)=>[O[0]+AF.x[0]*X_+AF.y[0]*Y+AF.z[0]*Z,O[1]+AF.x[1]*X_+AF.y[1]*Y+AF.z[1]*Z];
const depth3=(X_,Y,Z)=>X_*CD[0]+Y*CD[1]+Z*CD[2];
const qk=fr=>(Math.round(Math.max(F0,Math.min(F0+N-1,fr))*4)/4).toFixed(2);
const C0=(()=>{const w=A0.qW[qk(50)];return w?[w[3],w[4],w[5]]:[0,0,0];})();
function stormState(t){const C=CFG.storm,tL=hitT(NH-1),form=ss((t-C.formIn)/C.formDur);let b=0;
  if(t>tL)b=Math.min(1,(t-tL)/C.burstDur);
  const al=(t>tL?Math.pow(1-b,1.3):1)*Math.min(1,form*3);
  let pulse=0;for(let k=0;k<NH;k++)pulse=Math.max(pulse,envT(t-hitT(k),.05,.12));
  return {on:al>.015,hp:form,rs:(.35+.65*ss(form*1.15))*(1+.55*b),hs:1-.38*b,al,b,pulse};}
/* soft cloud sprites (pre-rendered once: lit / mid / shade / warm tones of grey-white smoke, and tan dust) */
const TONES={lit:[[250,243,230],[226,214,196]],mid:[[212,208,202],[170,168,168]],shade:[[134,136,146],[92,94,106]],warm:[[246,228,190],[214,190,150]],d1:[[196,174,140],[150,128,98]],d2:[[168,148,116],[116,98,76]]};
X.spr=null;const SPR=(()=>{const out={};let r=77;const q=()=>{r=(r*16807)%2147483647;return r/2147483647;};
  for(const nm in TONES){out[nm]=[];for(let v=0;v<4;v++){const cv=document.createElement('canvas');cv.width=cv.height=96;const g=cv.getContext('2d'),[lc,dc]=TONES[nm],C0_=48;
    for(let i=0;i<16;i++){const an=q()*6.283,d=q()*.34*C0_,x=C0_+Math.cos(an)*d,y=C0_+Math.sin(an)*d,rr=C0_*(.34+q()*.28),sh=(Math.cos(an+.8)*.5+.5),c=[0,1,2].map(k=>Math.round(lc[k]*(1-sh)+dc[k]*sh)),gr=g.createRadialGradient(x,y,0,x,y,rr);
      gr.addColorStop(0,`rgba(${c[0]},${c[1]},${c[2]},.8)`);gr.addColorStop(1,`rgba(${c[0]},${c[1]},${c[2]},0)`);g.fillStyle=gr;g.beginPath();g.arc(x,y,rr,0,6.283);g.fill();}
    g.globalCompositeOperation='destination-in';const m=g.createRadialGradient(C0_,C0_,C0_*.25,C0_,C0_,C0_);m.addColorStop(0,'rgba(0,0,0,1)');m.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=m;g.fillRect(0,0,96,96);out[nm].push(cv);}}return out;})();X.spr=SPR;   /* r84: p292 pre-warm reads these */
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
X.end=hitT(NH-1)+CFG.storm.burstDur;
X.layer=(t,back,x,y)=>{if(!X.on||t<0||t>X.end)return;AN={x,y:y+HD.footY};const L_={ctx,back};ctx.save();ctx.globalCompositeOperation='source-over';
  try{storm(t,L_);rocks(t,L_);}catch(e){X.err='draw '+e.message;}ctx.restore();ctx.globalAlpha=1;};
X.ok=true;
}catch(e){X.err='init '+e.message;X.on=false;}
})();

