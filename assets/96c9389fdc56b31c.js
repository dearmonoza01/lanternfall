
/* ---- stormfists-r1 (TEST allin_r65, 13 Nov 2026): STORM FISTS (หมัดพายุ), first KNUCKLE skill (Motion r9 poses + VFX r2, DeaRz passed 15:48) ----
   * a slot skill id spStorm (installable from the special page like Sakura / Demon / Thunder, own SK entry, cooldown ring and key from the slot); usable ONLY while the knuckle is held (the Iron Monk gloves from the ironmonk module show); ?stormfists=off removes it, ?knuckle=off removes the knuckle weapon module too.
   * flow (Motion): press -> 0.5 s ready / charge (wide crouch, fists to hips, tremble, curl swirl on the ground) -> dash (up to 90 px toward the nearest monster, stops 40 px short) -> barrage: the first hit 1.15 s after the press, then every 0.075 s, alternating near / far fists (N-1 hits)
     -> wind-up 0.26 s -> FINISHER (hit-stop 0.08 s, lunge, big impact + rear burst, Lv10: crescent shockwave 220 px, knockback ON by default, ?kb=off).
   * hits: Lv1-4 = 8, Lv5-9 = 10, Lv10 = 12 (the finisher is the last); total % per level (Balance knuckle_r1, Fist Storm) 159/182/204/227/261/284/309/336/365/404 split evenly per hit, as % of the knuckle basic hit; CD 7 s; MP 15/16/17/18/19/20/21/22/22/23;
     every hit = the game's own hit, no knockback except the finisher (default on), cap 99,999. Targets: every monster in front within 85 px of the hero (Lv10 finisher: within the 220 px shockwave).
   * level: ?stormlv=N (default 1; the knuckle skill-point line / mastery are NOT built yet). Debug: window.STORM ---- */
(function(){'use strict';
const Q=String(location.search),OFF=/[?&]stormfists=off\b/.test(Q);
const lvq=/[?&]stormlv=(\d+)/.exec(Q);
const ST=window.STORM=window.__STORM={ver:'stormfists-r1',on:!OFF,err:null,lv:Math.max(1,Math.min(10,lvq?+lvq[1]:1)),force:!!lvq,kb:!/[?&]kb=off\b/.test(Q),run:null,casts:0,hits:0,dmg:0,fxMs:0,fxN:0,
  cfg:{PCT:[159,182,204,227,261,284,309,336,365,404],MP:[15,16,17,18,19,20,21,22,22,23],CD:7,DASH_W:90,STOP_SHORT:40,REACH:85,SHOCK:220,CAP:99999,GAP:.075,CH0:.5,WIND:.26,HSF:.08,LUNGE_W:12,KP:true}};
if(OFF)return;
const ERR=(w,e)=>{ST.err=w+': '+((e&&e.message)||e);try{console.error('[STORM]',w,e)}catch(_){}};
const ID='spStorm',PU=()=>window.PUPPET,SC0=.34,K_ISO=.5;
const CG='#ffb347',CY='#ffd36b',CW='#fff3c4',IM=window.__IRON_JSON;
if(!IM){ST.err='ironmonk.json missing';return}
const FL=IM.kn[0],FT=IM.kn[1];
const clamp=(v,a,b)=>v<a?a:v>b?b:v,ease=x=>1-Math.pow(1-clamp(x,0,1),3),seg=(t,a,b)=>clamp((t-a)/(b-a),0,1),sstep=(x,a,b)=>{const u=clamp((x-a)/(b-a),0,1);return u*u*(3-2*u)},hash=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s)};
/* ---- special page entry + SK entry ---- */
const STA=window.STORMAPI={on:true,ok:true,cfg:{CD:7,MP:15,MINLV:0}};
/* r66: NOT on the special page any more (DeaRz 10 Nov 12:05: special weapons behave like normal ones): the skill lives in the knuckle skill line (glue_knuckleline.js) */
function reg(){try{if(typeof SK==='object'&&SK&&!SK[ID])SK[ID]={id:ID,name:'หมัดพายุ',type:'spsk',cls:'novice',idx:63,cd:ST.cfg.CD,mp:ST.cfg.MP[ST.lv-1],m:0,dt:'phys',r:0,range:0,th:'spirit',glyph:'☄'};if(SK&&SK[ID])SK[ID].mp=ST.cfg.MP[ST.lv-1]}catch(e){ERR('reg',e)}}
reg();setInterval(reg,2000);
try{const _si=skillIcon;skillIcon=function(id){if(id===ID&&window.__STORM_ICON)return window.__STORM_ICON;return _si.apply(this,arguments)}}catch(e){ERR('icon',e)}
/* ---------------- timeline (Motion) ---------------- */
const lvN=()=>ST.lv>=10?12:ST.lv>=5?10:8;
function sched(){const N=lvN(),T1=1.65,th=[],G=ST.cfg.GAP;for(let i=0;i<N-1;i++)th.push(T1+i*G);const tF=th[N-2]+G+ST.cfg.WIND;return {N,T1,th,tF,end:tF+1.7}}
let SCH=null,cx=null;
const tpAt=tt=>tt-clamp(tt-SCH.tF,0,ST.cfg.HSF);
const chargeAt=tt=>sstep(tt,ST.cfg.CH0,ST.cfg.CH0+.35)*(1-sstep(tt,SCH.T1-.3,SCH.T1-.14));
function extAt(tp,i){const ti=SCH.th[i];return sstep(tp,ti-.055,ti)*(1-sstep(tp,ti+.012,ti+.075))}
const KP={ready:{torso:-4,sp:14,arm_near:38,forearm_near:105,arm_far:28,forearm_far:112,head:0},charge:{torso:-6,sp:34,arm_near:12,forearm_near:72,arm_far:8,forearm_far:80,head:4},dash:{torso:-30,sp:40,arm_near:-28,forearm_near:95,arm_far:52,forearm_far:62,head:-6},
  bar:{torso:-16,sp:38,arm_near:28,forearm_near:122,arm_far:24,forearm_far:125,head:-3},wind:{torso:12,sp:28,arm_near:-48,forearm_near:125,arm_far:78,forearm_far:8,head:6},fin:{torso:-28,sp:44,arm_near:90,forearm_near:0,arm_far:-12,forearm_far:122,head:-4}};
const KK=Object.keys(KP.ready);
function kmix(a,b,u){if(u<=0)return a;const o={};for(const k of KK)o[k]=a[k]+(b[k]-a[k])*u;return o}
function poseAt(tt){const S0=SCH,tp=tpAt(tt);let q=KP.ready;
  q=kmix(q,KP.charge,sstep(tt,.45,.75));q=kmix(q,KP.dash,sstep(tt,S0.T1-.32,S0.T1-.18));q=kmix(q,KP.bar,sstep(tt,S0.T1-.12,S0.T1-.03));
  const inB=sstep(tt,S0.T1-.12,S0.T1-.03)*(1-sstep(tp,S0.tF-.3,S0.tF-.2));
  if(inB>0){let en=0,ef=0;for(let i=0;i<S0.N-1;i++){const e=extAt(tp,i);if(i%2)ef=Math.max(ef,e);else en=Math.max(en,e)}
    q=Object.assign({},q);const L_=(a,b,u)=>a+(b-a)*u*inB;q.arm_near=L_(q.arm_near,90,en);q.forearm_near=L_(q.forearm_near,0,en);q.arm_far=L_(q.arm_far,92,ef);q.forearm_far=L_(q.forearm_far,0,ef);q.torso+=(-8*en-12*ef)*inB}
  const wu=sstep(tp,S0.tF-.3,S0.tF-.14),eF=sstep(tp,S0.tF-.1,S0.tF);q=kmix(q,KP.wind,wu*(1-eF));q=kmix(q,KP.fin,eF);q=kmix(q,KP.ready,sstep(tp,S0.tF+.55,S0.tF+1.1));
  const c=chargeAt(tt);const r=Object.assign({},q);if(c>.05){r.arm_near+=Math.sin(tt*90)*1.5*c;r.arm_far+=Math.sin(tt*83+1)*1.5*c}
  const br=Math.sin(tt*2.6)*(1-sstep(tt,.45,.75)+sstep(tp,S0.tF+.55,S0.tF+1.1));r.torso+=br*.8;
  r.leg_near=-r.sp-r.torso;r.leg_far=r.sp-r.torso;r.foot_near=r.sp;r.foot_far=-r.sp;delete r.sp;
  return {rot:r,off:{},air:0,c}}
function heroOffD(tt){const S0=SCH,tp=tpAt(tt),DASH=90,LUNGE=24;let dxD=DASH*sstep(tt,S0.T1-.2,S0.T1-.04),dxL=LUNGE*sstep(tp,S0.tF-.1,S0.tF)*(1-sstep(tp,S0.tF+.9,S0.tF+1.4));
  const c=chargeAt(tt),pre=c>.05?c:0;let dy=Math.sin(tt*83+1)*1.6*pre+7*c,sh=Math.sin(tt*97)*1.8*pre;
  const rb2=sstep(tt,S0.T1-.2,S0.T1-.08)*(1-sstep(tp,S0.tF+.35,S0.tF+.85));let ex=0;if(rb2>0){let e=0;for(let i=0;i<S0.N-1;i++)e=Math.max(e,extAt(tp,i));const eF=sstep(tp,S0.tF-.1,S0.tF)*(1-sstep(tp,S0.tF+.25,S0.tF+.6));ex=3*e*rb2*(1-eF);dy+=(6+4*eF)*rb2}
  return {dash:dxD/DASH,lunge:dxL/LUNGE,vx:sh+ex,vy:dy}}
function fistPos(which,pose,off){const W=PU().solve(pose),m=W['fist_'+which],X=m[0]*FL+m[2]*FT+m[4],Y=m[1]*FL+m[3]*FT+m[5],gy=PU().footY(W),sx=-1;
  const h=W.head,hx=h[0]*140+h[2]*150+h[4],hy=h[1]*140+h[3]*150+h[5],ox=off.vx||0,oy=off.vy||0;
  return {x:ox+sx*SC0*X,y:oy+SC0*(Y-gy),hx:ox+sx*SC0*hx,hy:oy+SC0*(hy-gy)}}
/* ---------------- FX primitives (demo skill.js, ported: frame = hero ground point at (0,0), hero faces RIGHT, 1 unit = r world px) ---------------- */
const GL={};function glow(col){if(GL[col])return GL[col];const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,col);r.addColorStop(.3,col+'bb');r.addColorStop(1,col+'00');g.fillStyle=r;g.fillRect(0,0,64,64);return GL[col]=c}
const low=()=>{try{return G.gfx==='low'}catch(_){return false}};
let tNow=0;
function curl(x,y,len,wid,ang,bend,a){if(a<=.01||len<4)return;const dx=Math.cos(ang),dy=Math.sin(ang),nx=-dy,ny=dx,N=12,L1=[],R1=[];
  for(let k=0;k<=N;k++){const u=k/N,cx_=x+dx*len*u+nx*bend*Math.sin(u*Math.PI)*(1-u*.3),cy_=y+dy*len*u+ny*bend*Math.sin(u*Math.PI)*(1-u*.3),w=wid*Math.pow(Math.sin(Math.min(1,u*1.0+.18)*Math.PI*.5),.7)*Math.pow(1-u,.75)+.2;L1.push([cx_+nx*w,cy_+ny*w]);R1.push([cx_-nx*w,cy_-ny*w])}
  cx.save();cx.globalAlpha=Math.min(1,a);const g=cx.createLinearGradient(x,y,x+dx*len,y+dy*len);g.addColorStop(0,CW);g.addColorStop(.3,CY);g.addColorStop(.65,CG);g.addColorStop(1,'rgba(255,150,40,0)');cx.fillStyle=g;
  cx.beginPath();cx.moveTo(L1[0][0],L1[0][1]);for(const p of L1)cx.lineTo(p[0],p[1]);for(let k=N;k>=0;k--)cx.lineTo(R1[k][0],R1[k][1]);cx.closePath();cx.fill();cx.restore()}
function tear(x,y,len,wid,ang,a){if(a<=.01||len<2)return;cx.save();cx.translate(x,y);cx.rotate(ang);cx.globalAlpha=Math.min(1,a);
  const g=cx.createLinearGradient(-wid*.5,0,len,0);g.addColorStop(0,CW);g.addColorStop(.3,CY);g.addColorStop(.65,CG);g.addColorStop(1,'rgba(255,150,40,0)');cx.fillStyle=g;
  cx.beginPath();cx.moveTo(0,-wid);cx.bezierCurveTo(len*.35,-wid*1.05,len*.7,-wid*.5,len,0);cx.bezierCurveTo(len*.7,wid*.5,len*.35,wid*1.05,0,wid);cx.quadraticCurveTo(-wid*.9,0,0,-wid);cx.fill();cx.restore()}
function auraFist(which,fp,A,wu,ph){const t=tNow,fade=clamp((Math.hypot(fp.x-fp.hx,fp.y-fp.hy)-26)/36,.3,1),a=A*fade;if(a<=.02)return;
  const br=1+.12*Math.sin(t*5.2+ph)+.06*Math.sin(t*8.7+ph*2.3),R=(26-8*wu)*br;cx.save();cx.globalCompositeOperation='lighter';
  cx.globalAlpha=clamp(.42*a,0,.85);cx.drawImage(glow(CG),fp.x-R*1.7,fp.y-R*1.7,R*3.4,R*3.4);cx.globalAlpha=clamp(.55*a,0,.95);cx.drawImage(glow(CY),fp.x-R*.9,fp.y-R*.9,R*1.8,R*1.8);
  if(wu>0){cx.globalAlpha=.35*wu*fade;cx.drawImage(glow(CW),fp.x-R*.6,fp.y-R*.6,R*1.2,R*1.2)}
  const n=low()?3:5;for(let i=0;i<n;i++){const f=((t*.95+i/n+ph*.31)%1),fl=.75+.25*Math.sin(t*14+i*2+ph),x=fp.x+(i-(n-1)/2)*5+Math.sin(f*6+i+ph)*3,y=fp.y-8,len=(18+9*wu+8*Math.sin(i*1.7+ph))*(1-f*.5)*fl*clamp((Math.hypot(fp.x-fp.hx,fp.y-fp.hy)-20)/60,.25,1),ang=-Math.PI/2+Math.sin(f*5+i*1.3+ph)*.35;
    curl(x,y,len*.9,4.4+wu*1.5,ang,(i%2?1:-1)*(5+3*Math.sin(t*6+i)),clamp((1-f*.7)*.9*a,0,.95))}
  for(let i=0;i<3;i++){const an=t*3.4+ph*1.9+i*2.094,rx=(22-8*wu),x=fp.x+Math.cos(an)*rx,y=fp.y+Math.sin(an)*rx*.45,s=7+2*Math.sin(an);cx.globalAlpha=clamp(.75*a*(Math.sin(an)>0?1:.6),0,.9);cx.drawImage(glow(CW),x-s/2,y-s/2,s,s)}
  cx.restore()}
function windStreaks(fp,u,id){if(u<=0||u>=1)return;cx.save();cx.globalCompositeOperation='lighter';const n=low()?4:6,al=Math.sin(u*Math.PI);
  for(let i=0;i<n;i++){const an=i/n*6.283+hash(id*3+i)*.6+u*.8,f=((u*1.25+i*.17)%1),r0=58*(1-ease(f))+10,x=fp.x+Math.cos(an)*r0,y=fp.y+Math.sin(an)*r0*.7;cx.globalAlpha=al*.9*(1-f*.3);cx.drawImage(glow(CY),x-6,y-6,12,12);tear(x,y,16+8*(1-f),3.2,an,al*.8*(1-f*.4))}cx.restore()}
function groundSwirl(cxp,cyp,al){if(al<=.02)return;cx.save();cx.globalCompositeOperation='lighter';const n=low()?6:9,t=tNow;for(let i=0;i<n;i++){const an=t*3.6+i*6.283/n,r=78-18*al+6*Math.sin(t*4+i),x=cxp+Math.cos(an)*r,y=cyp+Math.sin(an)*r*.38;curl(x,y,42,7,an+Math.PI/2+.25,-8,Math.min(1,al*1.1))}cx.restore()}
function yinFaint(cxp,cyp,R,al){if(al<=.01)return;cx.save();cx.translate(cxp,cyp);cx.scale(1,K_ISO);cx.globalAlpha=al;cx.strokeStyle=CY;cx.lineWidth=2;cx.beginPath();cx.arc(0,0,R,0,6.283);cx.stroke();
  cx.fillStyle=CG;cx.beginPath();cx.arc(0,0,R,-Math.PI/2,Math.PI/2);cx.arc(0,R/2,R/2,Math.PI/2,-Math.PI/2,true);cx.arc(0,-R/2,R/2,Math.PI/2,-Math.PI/2);cx.closePath();cx.globalAlpha=al*.55;cx.fill();cx.globalAlpha=al;cx.fillStyle=CW;cx.beginPath();cx.arc(0,-R/2,R*.1,0,6.283);cx.fill();cx.restore()}
function impactDraw(m){const t=tNow,a=t-m.t0;if(a<0||a>.75)return;const s=m.size;cx.save();cx.globalCompositeOperation='lighter';const f=1-seg(a,0,.2),gr=ease(seg(a,0,.09));
  if(f>0){const r=(20+20*gr)*(s>1?1.15:1);cx.globalAlpha=f*.5;cx.drawImage(glow(CY),m.x-r,m.y-r,r*2,r*2);cx.globalAlpha=f*.22;cx.drawImage(glow(CW),m.x-r*.5,m.y-r*.5,r,r);cx.globalAlpha=f*.4;cx.drawImage(glow(CG),m.x-r*1.5,m.y-r*1.5,r*3,r*3);
    const np=low()?6:8;for(let i=0;i<np;i++){const an=i/np*6.283+m.id*.5+a*1.2,ln=(26+16*(i%2))*s*gr*(1-seg(a,.08,.2)*.4);tear(m.x,m.y,ln*(1-.65*Math.max(0,-Math.sin(an))),6.5*s,an,f*.9)}}
  for(let r2=0;r2<2;r2++){const u=ease(seg(a,r2*.06,.45+r2*.06));if(u<=0||u>=1)continue;cx.save();cx.translate(m.fx,m.gy+2);cx.scale(1,K_ISO);const R2=(12+88*s*u)*(r2?.8:1)*(m.lun?1.25:1);
    cx.strokeStyle=CG;cx.globalAlpha=(1-u)*.35;cx.lineWidth=(16*(1-u)+3);cx.beginPath();cx.arc(0,0,R2,0,6.283);cx.stroke();cx.strokeStyle=r2?CY:CW;cx.globalAlpha=(1-u)*(r2?.7:.95);cx.lineWidth=(5*(1-u)+1)*(r2?.7:1);cx.stroke();cx.restore()}
  for(let c=0;c<2;c++){const u=ease(seg(a,c*.05,.3+c*.05));if(u>0&&u<1){cx.save();cx.lineCap='round';cx.strokeStyle=c?CG:CY;cx.globalAlpha=(1-u)*(c?.6:.9);cx.lineWidth=(16*s*(1-u)+2);cx.beginPath();cx.arc(m.x-30*s*(1-u),m.y,(24+80*s*u)*(c?.8:1),-.95,.95);cx.stroke();cx.restore()}}
  const ns=Math.round((low()?8:13)*(s>1?1.4:1));for(let i=0;i<ns;i++){const an=-1.9+hash(m.id*31+i)*3.8,sp=220+hash(m.id*17+i)*260,life=.3+hash(i*3+m.id)*.2,u=a/life;if(u>=1)continue;
    const d=sp*(1-Math.exp(-5*a))/5,x=m.x+Math.cos(an)*d*.95,y=m.y+Math.sin(an)*d*.8+60*a*a,sz=(8+5*hash(i+9))*(1-u*.6);cx.globalAlpha=(1-u);cx.drawImage(glow(i%2?CY:CW),x-sz/2,y-sz/2,sz,sz);tear(x,y,18*(1-u)+4,sz*.32,an+Math.PI,(1-u)*.8)}
  cx.restore()}
function impactRear(m){const t=tNow,a=t-m.t0-.03;if(a<0||a>.6)return;const s=m.size,cxr=m.fx+14,cyr=m.y+6,gr=ease(seg(a,0,.1)),f=1-seg(a,.06,.3);cx.save();cx.globalCompositeOperation='lighter';
  if(f>0){const r=44*s*(.6+.4*gr);cx.globalAlpha=f*.7;cx.drawImage(glow(CY),cxr-r,cyr-r,r*2,r*2);cx.globalAlpha=f*.35;cx.drawImage(glow(CW),cxr-r*.45,cyr-r*.45,r*.9,r*.9);
    const np=low()?4:6;for(let i=0;i<np;i++){const an=-1.0+i*(2.0/(np-1))+(hash(m.id*7+i)-.5)*.3,ln=(46+26*(i%2))*s*gr;tear(cxr,cyr,ln,8*s,an,f*.95)}}
  const ns=Math.round((low()?7:12)*(s>1.2?1.4:1));for(let i=0;i<ns;i++){const an=-1.0+hash(m.id*13+i)*2.0,sp=260+hash(m.id*5+i)*300,life=.3+hash(i*7+m.id)*.2,u=a/life;if(u>=1)continue;
    const d=sp*(1-Math.exp(-5*a))/5,x=cxr+Math.cos(an)*d,y=cyr+Math.sin(an)*d*.8+50*a*a,sz=(8+5*hash(i+3))*(1-u*.6);cx.globalAlpha=(1-u);cx.drawImage(glow(i%2?CY:CW),x-sz/2,y-sz/2,sz,sz);tear(x,y,20*(1-u)+4,sz*.32,an+Math.PI,(1-u)*.8)}
  cx.restore()}
function impactLite(m){const t=tNow,a=t-m.t0;if(a<0||a>.3)return;cx.save();cx.globalCompositeOperation='lighter';const f=1-seg(a,0,.16),gr=ease(seg(a,0,.07));
  if(f>0){const r=(16+18*gr);cx.globalAlpha=f*.55;cx.drawImage(glow(CY),m.x-r,m.y-r,r*2,r*2);cx.globalAlpha=f*.3;cx.drawImage(glow(CW),m.x-r*.45,m.y-r*.45,r*.9,r*.9);
    const np=low()?3:4;for(let i=0;i<np;i++){const an=-1.2+i*(2.4/(np-1))+(m.id%3-1)*.25+Math.PI;tear(m.x,m.y,(20+12*(i%2))*gr,5.2,an+Math.PI,f*.9)}}
  const u=ease(seg(a,0,.28));if(u>0&&u<1){cx.save();cx.translate(m.fx,m.gy+2);cx.scale(1,K_ISO);cx.strokeStyle=CY;cx.globalAlpha=(1-u)*.5;cx.lineWidth=3*(1-u)+1;cx.beginPath();cx.arc(0,0,14+46*u,0,6.283);cx.stroke();cx.restore()}
  const ns=low()?2:3;for(let i=0;i<ns;i++){const an=-1.9+hash(m.id*31+i)*3.8,sp=170+hash(m.id*17+i)*140,u2=a/.26;if(u2>=1)continue;const d=sp*(1-Math.exp(-6*a))/6,x=m.x+Math.cos(an)*d,y=m.y+Math.sin(an)*d*.8+40*a*a,sz=7*(1-u2*.6);cx.globalAlpha=1-u2;cx.drawImage(glow(i%2?CY:CW),x-sz/2,y-sz/2,sz,sz)}
  cx.restore()}
function crescent(m,u,al,sc){if(u<=0||u>=1||al<=.01)return;const R=(78+56*u)*sc,cxr=m.fx-30+(ST.cfg.SHOCK/ (rS()||1))*ease(u)*sc,cyr=m.gy-56-10*u,th=15*(1-u*.3)*sc,N=22,O=[],In=[];
  for(let k=0;k<=N;k++){const s=-1+2*k/N,a=s*1.05,ox=cxr+R*Math.cos(a)*.95,oy=cyr+R*Math.sin(a)*1.0;O.push([ox,oy]);In.push([ox-th*Math.pow(1-s*s,1.4),oy])}
  cx.save();cx.globalCompositeOperation='lighter';cx.globalAlpha=al;const g=cx.createLinearGradient(cxr-th,cyr,cxr+R*.95,cyr);g.addColorStop(0,'rgba(255,150,40,0)');g.addColorStop(.35,CG);g.addColorStop(.75,CY);g.addColorStop(1,CY);cx.fillStyle=g;
  cx.beginPath();cx.moveTo(O[0][0],O[0][1]);for(const p of O)cx.lineTo(p[0],p[1]);for(let k=N;k>=0;k--)cx.lineTo(In[k][0],In[k][1]);cx.closePath();cx.fill();cx.globalAlpha=al*.35;cx.drawImage(glow(CY),cxr-R*.3,cyr-R*1.1,R*1.0,R*2.2);cx.restore()}
function debris(m){const t=tNow,a=t-m.t0;if(a<0||a>.9)return;const bx=m.fx+10,by=m.gy-2;
  cx.save();for(let i=0;i<(low()?6:10);i++){const an=-1.2+hash(i*5+1)*1.5,sp=120+hash(i*3)*170,x=bx+Math.cos(an)*sp*a+hash(i)*20,y=by+Math.sin(an)*sp*a+420*a*a,rot=a*8*(hash(i+4)-.5)*2;if(y>by+10)continue;
    cx.globalAlpha=1-seg(a,.55,.9);cx.save();cx.translate(x,y);cx.rotate(rot);cx.fillStyle=i%3?'#5a4a36':'#7a6850';const s=3+hash(i+9)*3.5;cx.beginPath();cx.moveTo(-s,-s*.6);cx.lineTo(s,-s);cx.lineTo(s*.8,s*.7);cx.lineTo(-s*.6,s);cx.closePath();cx.fill();cx.restore()}
  for(let i=0;i<5;i++){const f=clamp(a*1.5-i*.06,0,1);if(f<=0||f>=1)continue;const x=bx-10+i*14+Math.sin(i)*6,y=by+2-f*7,r=7+i+f*12;cx.globalAlpha=(1-f)*.45;cx.fillStyle='#d9c690';cx.beginPath();cx.ellipse(x,y,r,r*.5,0,0,6.283);cx.fill()}cx.restore()}
/* ---------------- run ---------------- */
const held=()=>{try{return !!(P&&P.weapon&&P.weapon.t==='knuckle')}catch(_){return false}};
const rS=()=>{const s=ST.sc||SC0;return Math.max(.2,s/SC0)};
/* r66 damage base (Balance KNUCKLE_numbers_r1 section r13b): the % in the table = % of ONE MODEL PUNCH = (knuckle basic mult per second) / 2.4 = (MULT_LUNGE / CYCLE_LUNGE) / 2.4 (~3.23 mult), taken from the live knuckle constants so it follows any re-fit.
   The mult of a hit = hitEnemy multiplier, the same unit the knuckle basic attack uses. */
const punchBase=()=>{try{const c=window.KNUCKLE.cfg;return c.MULT_LUNGE/c.CYCLE_LUNGE/2.4}catch(_){return 7.8/1.005/2.4}};
ST.base=punchBase;
function hitFn(e,pct,tag){const hp0=e.hp,vx0=e.vx,vy0=e.vy;
  try{hitEnemy(e,pct/100*punchBase(),{dt:'phys',st:1,kb:0,knk:1})}catch(er){ERR('hit',er)}
  try{if(vx0!=null&&(e.vx!==vx0||e.vy!==vy0)){e.vx=vx0;e.vy=vy0}}catch(_){}
  const d=Math.max(0,hp0-Math.max(0,e.hp));ST.hits++;ST.dmg+=d;return d}
try{const _a=applyDamage;applyDamage=function(e,d,crit,o){if(o&&o.st){if(o.kb)o.kb=0;if(d>ST.cfg.CAP)d=ST.cfg.CAP}return _a.call(this,e,d,crit,o)}}catch(e){ERR('hook damage',e)}
const nearest=(x,y,maxD)=>{let b=null,bd=maxD;for(const e of enemies){if(e.dead||!(e.hp>0))continue;const d=Math.hypot(e.x-x,e.y-y);if(d<bd){bd=d;b=e}}return b};
let R=null;
function start(){try{if(R||typeof P==='undefined'||!P||P.dead||G.state!=='play'||G.win||P.casting)return false;
    if(!held()){try{textAt(P.x,P.y-62,'หมัดพายุ: ต้องถือสนับมือ','#ffd98a',13)}catch(_){}return false}
    if((P.cds[ID]||0)>0){try{textAt(P.x,P.y-62,'หมัดพายุ: คูลดาวน์ '+Math.ceil(P.cds[ID])+' วิ','#ffd98a',13)}catch(_){}return false}
    const mp=ST.cfg.MP[ST.lv-1];if(P.mp<mp){try{textAt(P.x,P.y-62,'MP ไม่พอ','#ffd98a',13)}catch(_){}return false}
    SCH=sched();const tg=nearest(P.x,P.y,320);let ax=Math.cos(P.face||0),ay=Math.sin(P.face||0),dist=ST.cfg.DASH_W;
    if(tg){ax=tg.x-P.x;ay=tg.y-P.y;const d=Math.hypot(ax,ay)||1;ax/=d;ay/=d;dist=clamp(d-ST.cfg.STOP_SHORT,0,ST.cfg.DASH_W)}
    const face=ax>=0?1:-1;
    R=ST.run={T0:time,x0:P.x,y0:P.y,ax,ay,dist,face,next:0,fin:false,imp:[],pend:[],ko:[]};
    try{P.mp-=mp;P.cds[ID]=ST.cfg.CD;P.face=Math.atan2(ay,ax)}catch(_){}ST.casts++;return true}catch(e){ERR('start',e);return false}}
ST.start=start;
const ttNow=()=>time-R.T0+ST.cfg.CH0;
function targetsFor(reach){const out=[];for(const e of enemies){if(e.dead||!(e.hp>0))continue;const dx=e.x-P.x,dy=e.y-P.y,d=Math.hypot(dx,dy);if(d>reach+(e.sz||16)*.6)continue;const fw=dx*R.face;if(fw<-12)continue;out.push(e)}return out}
function doHit(i,fin){const r=rS(),pct=ST.cfg.PCT[ST.lv-1]/lvN(),reach=fin&&ST.lv>=10?ST.cfg.SHOCK:ST.cfg.REACH,T=targetsFor(reach).slice(0,6);if(!T.length)T.push(...(nearest(P.x,P.y,ST.cfg.REACH+40)?[nearest(P.x,P.y,ST.cfg.REACH+40)]:[]));
  const tt=ttNow(),pose=poseAt(tt),off=heroOffD(tt),fp=fistPos(i%2?'far':'near',pose,off);
  const main=T[0];for(const e of T){hitFn(e,pct,fin?'fin':'h'+i)}
  if(main){const fx=(main.x-R.x0)*R.face/r,gy=(main.y-R.y0)/r,hy=(P.y-R.y0)/r;   /* the effect frame is anchored at the hero's START point */
    R.imp.push({t0:tt,k:i%2,size:fin?2.0:.62,fin:!!fin,lun:!!fin,fx:fx,x:fx-30,y:fp.y+hy,gy:gy,id:fin?99:i})}
  if(fin&&ST.kb){for(const e of T){if(e.dead)continue;R.ko.push({e,t0:time,dx:R.ax*150*.9,dy:R.ay*150*.5,x0:e.x,y0:e.y})}}}
function tick(dt){try{if(!R)return;if(P.dead||!held()||G.state!=='play'){R=ST.run=null;return}
  const tt=ttNow(),S0=SCH,r=rS();
  while(R.next<S0.N-1&&tt>=S0.th[R.next]){doHit(R.next,false);R.next++}
  if(!R.fin&&tt>=S0.tF){R.fin=true;doHit(S0.N-1,true)}
  /* knockback of the finisher: slide to the end point over 0.6 s */
  for(const k of R.ko){const u=clamp((time-k.t0)/.6,0,1),e=k.e;if(!e||e.dead)continue;const nx=k.x0+k.dx*ease(u),ny=k.y0+k.dy*ease(u);if(!blocked(nx,ny,8)){e.x=nx;e.y=ny}}
  /* hero position along the dash / lunge, input locked until the finisher is over */
  const off=heroOffD(tt),mv=off.dash*R.dist+off.lunge*ST.cfg.LUNGE_W,nx=R.x0+R.ax*mv,ny=R.y0+R.ay*mv;if(!blocked(nx,ny,10)){P.x=nx;P.y=ny}P.vx=0;P.vy=0;
  try{P.face=Math.atan2(R.ay,R.ax);P.atkCd=Math.max(P.atkCd||0,.2)}catch(_){}
  if(tt>=S0.tF+.6&&R.ko.every(k=>time-k.t0>=.6)){R.lock=false}
  if(tt>=S0.end-.4){R=ST.run=null}}catch(e){ERR('tick',e)}}
try{const _p=updPlayer;updPlayer=function(dt){if(!R)return _p.apply(this,arguments);const x=P.x,y=P.y;try{return _p.apply(this,arguments)}finally{P.x=x;P.y=y}}}catch(e){ERR('hook updPlayer',e)}
try{const _u=update;update=function(dt){const r0=_u.apply(this,arguments);tick(dt);return r0}}catch(e){ERR('hook update',e)}
try{const _b=basicAttack;basicAttack=function(){if(R)return;return _b.apply(this,arguments)}}catch(e){ERR('hook basic',e)}
const castW=o=>function(id){if(id===ID)return start();if(R)return false;return o.apply(this,arguments)};
try{castSkill=castW(castSkill)}catch(e){ERR('hook castSkill',e)}try{castSkillNow=castW(castSkillNow)}catch(e){ERR('hook castSkillNow',e)}
/* ---------------- drawing ---------------- */
let inDraw=false;
function hookPuppet(){const U=PU();if(!U||U._stHook||typeof U.draw!=='function')return;U._stHook=1;const _d=U.draw;
  U.draw=function(c,x,y,sc,fac,pose){if(!inDraw)ST.sc=sc;
    if(inDraw||!R||!SCH)return _d.apply(this,arguments);
    const t0=performance.now();inDraw=true;
    try{const tt=ttNow(),ps=poseAt(tt),off=heroOffD(tt),r=sc/SC0;tNow=tt;
      /* frame: hero ground point = (x,y); the hero faces right inside it (mirrored by 'fac') */
      const res=_d.call(this,c,x+off.vx*r*(fac>0?1:-1)*0,y+off.vy*r,sc,fac,{rot:ps.rot,off:{},air:0});
      cx=c;c.save();c.translate(x,y);c.scale((fac>0?1:-1)*r,r);try{
        const hoff={vx:off.vx,vy:off.vy},fn=fistPos('near',ps,hoff),ff=fistPos('far',ps,hoff),cc=ps.c,S0=SCH,tp=tpAt(tt);
        let bN=0,bF=0;for(const m of R.imp){const a=tt-m.t0;if(a>=0&&a<.3){const v=1-seg(a,.04,.3);if(m.k)bF=Math.max(bF,v);else bN=Math.max(bN,v)}}
        const bar=sstep(tt,S0.T1-.1,S0.T1)*(1-sstep(tt,S0.tF+.4,S0.tF+.9)),fw=sstep(tp,S0.tF-.3,S0.tF-.14)*(1-sstep(tp,S0.tF-.1,S0.tF));
        const aN=clamp(.85+.55*cc+.4*bar+.5*bN+.7*fw,0,1.6),aF=clamp(.85+.55*cc+.4*bar+.5*bF,0,1.5),wuN=Math.max(cc,fw),wuF=cc;
        auraFist('far',ff,aF*1.3,wuF,2.1);auraFist('near',fn,aN,wuN,0);
        if(cc>.1){const u=seg(tt,ST.cfg.CH0,S0.T1-.3);windStreaks(fn,u,1);windStreaks(ff,u,2)}
        if(bar>.1){for(const [wh,fp] of [['near',fn],['far',ff]]){const p1=fistPos(wh,poseAt(tt-.04),{vx:off.vx,vy:off.vy}),vx=fp.x-p1.x,vy=fp.y-p1.y,sp2=Math.hypot(vx,vy);if(sp2>6){const al=clamp(sp2/22,0,1),ang=Math.atan2(-vy,-vx);cx.save();cx.globalCompositeOperation='lighter';curl(fp.x-Math.cos(ang)*4,fp.y-Math.sin(ang)*4,26+sp2*2,6.5,ang,4,al*.8);cx.restore()}}}
      }finally{c.restore()}
      return res}
    finally{inDraw=false;ST.fxMs+=performance.now()-t0;ST.fxN++}}}
setInterval(()=>{try{hookPuppet()}catch(e){ERR('hookPuppet',e)}},300);
/* ground FX under the hero (swirl, yin-yang, dash trail) before the characters, impacts / crescent / debris after them */
try{const _g=drawRaidTele;drawRaidTele=function(){const r0=_g.apply(this,arguments);try{if(R&&SCH&&ST.sc){const tt=ttNow(),r=rS(),fac=R.face,ps=poseAt(tt),off=heroOffD(tt),hx=P.x,hy=P.y;tNow=tt;cx=ctx;ctx.save();ctx.translate(hx,hy);ctx.scale(fac*r,r);
    try{const c=ps.c;yinFaint(0,2,88,.5*c);groundSwirl(0,2,Math.min(1.4,c*1.4));
      const sp=(off.dash-heroOffD(tt-.04).dash)*R.dist/r;if(sp>1.5){cx.save();cx.globalCompositeOperation='lighter';const al=clamp(sp/8,0,1);curl(-4,-8,40+sp*6,8,Math.PI,-8,al*.8);curl(-4,-5,26+sp*4,5,Math.PI,7,al*.55);cx.restore()}
      for(const m of R.imp){if(m.fin||m.id%3===2)impactRear(m.fin?m:Object.assign({},m,{size:.7}))}}finally{ctx.restore()}}}catch(e){ERR('ground',e)}return r0}}catch(e){ERR('hook ground',e)}
try{const _t=drawTexts;drawTexts=function(){const r0=_t.apply(this,arguments);try{if(R&&SCH&&ST.sc&&R.imp.length){const t0=performance.now(),tt=ttNow(),r=rS(),fac=R.face;tNow=tt;cx=ctx;ctx.save();ctx.translate(R.x0,R.y0);ctx.scale(fac*r,r);
    try{for(const m of R.imp){if(m.fin)impactDraw(m);else impactLite(m)}
      const F=R.imp.find(m=>m.fin);if(F){if(ST.lv>=10){const a=tt-SCH.tF;crescent(F,seg(a,0,.45),(1-seg(a,.05,.45)),1);crescent(F,seg(a-.12,0,.4),(1-seg(a-.12,.05,.45))*.45,.8)}debris(F)}}finally{ctx.restore()}
    ST.fxMs+=performance.now()-t0}}catch(e){ERR('front',e)}return r0}}catch(e){ERR('hook front',e)}
console.info('[STORM] stormfists-r1 ready');
})();
