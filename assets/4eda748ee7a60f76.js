
/* ---- thunder-r1 (TEST allin_r53, 13 Nov 2026): special skill THUNDER SWORD GOD (เทพดาบสายฟ้า), Motion demo r8 (DeaRz passed 00:57) ----
   Pack: thunder_sword_god_r8 (thunder_kf.js poses th_c1..4, thspr_r1.js sprites THSPR_*, FX = the demo's thBehind / thHero / thFront / rocks / dissolve code ported as is).
   * special skill like spSakura / spDemon: slot id spThunder, installable from the special page, works with ANY weapon (the hero holds the demo sword while the skill runs), proficiency 'th' (PROF) by use: tap 0.25, charged 1.0.
   * TAP (press and release within 0.2 s): iai dash toward the aimed monster (mouse / nearest on touch), target + path px; hits every monster within 70 px of the path once, 250 % (Lv4), CD 8 s, MP 15.
   * HOLD (still held after 0.2 s): the hero crouches (0.55 s), then an orb lights every 0.5 s (max 6), 18 rocks rise (the hero cannot move, hits do not break it); RELEASE with N >= 2 orbs and a monster within the retarget range = N dash-slashes at 160 % (hit 1 through the target, hits 2..N from random sides round the target),
     each monster within 70 px of a dash path is hit once per dash; if the target dies the next dash goes to the nearest live monster in range (retarget adds no hits); CD 30 s, MP 45 paid at release; no target / < 2 orbs = no MP, 2 s cd.
   * damage per level Lv1-10 (Balance r1.1): tap 273/312/351/390/449/488/530/577/628/694 %, charged hit per dash 175/200/225/250/288/313/340/370/403/445 %; retarget 380 (Lv1-4) / 420 (Lv5) .. 460 (Lv10) interpolated, path 70 (90 at Lv10); cap 99,999 per hit, no knockback.
   * unlock (quest sp_04_thunder not written): ?thunder=give or __TH.give(). ?thunder=off removes it. Debug: window.TH ---- */
(function(){'use strict';
const Q=String(location.search),OFF=/[?&]thunder=off\b/.test(Q),GIVE=/[?&]thunder=give\b/.test(Q);
const TH=window.TH=window.__TH={ver:'thunder-r1',on:!OFF,err:null,given:GIVE,run:null,sc:null,
  stats:{taps:0,charges:0,dashes:0,hits:0,dmg:0,fizzle:0,fxMs:0,fxN:0,maxMs:0,frames:0},
  cfg:{CD_TAP:8,MP_TAP:15,CD_CH:30,MP_CH:45,CD_FAIL:2,TAP_PCT:[273,312,351,390,449,488,530,577,628,694],DASH_PCT:[175,200,225,250,288,313,340,370,403,445],HIT_R:70,HOLD_T:.2,CAP:99999,
    RANGE:[380,380,380,380,420,425,430,440,450,460],PATH:[70,70,70,70,70,70,70,70,70,90],PROF_TAP:.25,PROF_CH:1}};
if(OFF)return;
const ERR=(w,e)=>{TH.err=w+': '+((e&&e.message)||e);try{console.error('[TH]',w,e)}catch(_){}};
const PU=()=>window.PUPPET,SCd=.1485;
const DM=/[?&]thdash=1x\b/.test(Q)?1:2;   /* DeaRz 04:45 13 Nov: dash distances x2 (tap 400, charged overshoot +180 at Lv10 / +140, cross-dash radius 280); ?thdash=1x = the old distances */
const TAPDASH=200*DM,R3=140*DM,DASH=.18,BLINK=.07,ORB=.5,ENTER=.55,MORPH=.16,IAIMORPH=.24,OUT=1.1,OUTCUT=.75,OUTH=118,THSPR_H=128,NROCK=18,ID='spThunder';
/* ---- THUNDER unlock / special page entry ---- */
const TU=window.THUNDER={ver:'thunder-r1',on:true,ok:true,cfg:{CD:TH.cfg.CD_TAP,MP:TH.cfg.MP_TAP,MINLV:GIVE?0:99999}};
TH.give=()=>{TU.cfg.MINLV=0;try{if(window.SPSK)SPSK.sig=''}catch(_){}return true};
try{const S=window.SPSK;if(S&&S.defs&&!S.defs.some(d=>d.id==='th')){S.defs.push({id:'th',name:'เทพดาบสายฟ้า',en:'Thunder Sword God',col:'#ffd34a',lv:0,cd:8,mp:15,key:'—',npc:(/[?&]gm=on\b/.test(location.search)?'ภารกิจ sp_04_thunder (ยังไม่เปิด · TEST ใช้ ?thunder=give)':'ยังไม่เปิดใช้งาน'),api:()=>window.THUNDER,cdId:ID,
  desc:'กดครั้งเดียว = พุ่งชักดาบฟันทะลุเป้า · กดค้าง = ชาร์จลูกแก้ว (สูงสุด 6) ปล่อยแล้วพุ่งฟันหลายทิศเท่าจำนวนลูก',
  full:'ใช้ได้ทุกอาวุธ กดครั้งเดียว: พุ่งชักดาบ ฟันทะลุเป้า 250% (CD 8 วิ MP 15) · กดค้าง: ตัวนิ่งชาร์จลูกแก้วทุก 0.5 วิ (สูงสุด 6) ปล่อยแล้วพุ่งฟัน N ครั้ง ครั้งละ 160% ฮิตเป้าแรกแล้วโผล่ฟันจากทิศรอบเป้า ศัตรูใน 70 px ของแนวพุ่งโดนครั้งละหนึ่งฮิต (CD 30 วิ MP 45 จ่ายตอนปล่อย) ถ้าเป้าตายจะไปเป้าที่ใกล้สุดในระยะ'});}}catch(e){ERR('defs',e)}
try{if(window.PROF&&PROF.cfg){PROF.cfg.names.th='เทพดาบสายฟ้า'}}catch(_){}
/* ---------------- thunder_kf.js (Motion, poses th_c1..4) ---------------- */
function kfInit(){const U=PU();if(!U||!U.WEAPON_KF||window.thPose)return !!window.thPose;
 var K=U.WEAPON_KF;
 function E(x){return x<0?0:x>1?1:x*x*(3-2*x);}
 function key(keys,q){ if(!keys) return 0; for(var i=1;i<keys.length;i++){ if(q<=keys[i][0]){ var a=keys[i-1],b=keys[i],u=E((q-a[0])/((b[0]-a[0])||1)); return a[1]+(b[1]-a[1])*u; } } return keys[keys.length-1][1]; }
 function T(a,d){ return (a||[[0,0]]).map(function(x){return [x[0]/d,x[1]];}); }
 function tk(a,t){ for(var i=1;i<a.length;i++){ if(t<=a[i][0]){ var u=E((t-a[i-1][0])/((a[i][0]-a[i-1][0])||1)); return a[i-1][1]+(a[i][1]-a[i-1][1])*u; } } return a[a.length-1][1]; }
 var LEG=70;
 function feet(k,fN,fF,lun,tor,d){ var ts={}; fN.concat(fF,lun,tor).forEach(function(x){ ts[x[0]]=1; }); for(var t=0;t<=d+1e-6;t+=0.02) ts[+t.toFixed(3)]=1;
  var tt=Object.keys(ts).map(Number).filter(function(t){return t<=d+1e-6;}).sort(function(a,b){return a-b;});
  function ang(f,t){ var a=Math.atan((tk(f,t)+tk(lun,t))/LEG)*180/Math.PI; return Math.max(-72,Math.min(72,a)); }
  function m(f){ return T(tt.map(function(t){ return [t,f(t)]; }),d); }
  k.leg_near=m(function(t){return ang(fN,t)-tk(tor,t);}); k.leg_far=m(function(t){return ang(fF,t)-tk(tor,t);});
  k.foot_near=m(function(t){return -ang(fN,t);}); k.foot_far=m(function(t){return -ang(fF,t);}); }
 var D={};
 D[1]={dur:0.42,hits:[0.2],env:[[0,0],[0.06,1],[0.34,1],[0.42,0]],
  armN:[[0,200],[0.08,178],[0.13,178],[0.2,285],[0.27,330],[0.42,300]], bladeN:[[0,200],[0.08,98],[0.13,98],[0.2,290],[0.27,350],[0.42,330]],
  armF:[[0,180],[0.08,205],[0.2,150],[0.3,130],[0.42,170]], bladeF:[[0,180]],
  foreN:[[0,0],[0.08,-62],[0.13,-62],[0.2,0]], foreF:[[0,0],[0.08,-58],[0.2,-10],[0.3,0]],
  torso:[[0,0],[0.08,-46],[0.13,-50],[0.2,-36],[0.3,-24],[0.42,0]], fN:[[0,-8],[0.08,-100],[0.13,-100],[0.2,-30],[0.3,-26],[0.42,-8]], fF:[[0,8],[0.08,80],[0.13,80],[0.2,32],[0.3,30],[0.42,8]], bumps:[],
  lunge:[[0,0]], air:[[0,0],[0.08,-12],[0.13,-12],[0.2,0]]};
 D[2]={dur:0.3,hits:[],env:[[0,0],[0.3,1]],armN:[[0,200],[0.3,205]], bladeN:[[0,200],[0.3,92]],armF:[[0,180],[0.3,228]], bladeF:[[0,180]],
  foreN:[[0,0],[0.3,-55]], foreF:[[0,0],[0.3,-45]],torso:[[0,0],[0.3,-52]], fN:[[0,-8],[0.3,-220]], fF:[[0,8],[0.3,200]], bumps:[],lunge:[[0,0]], air:[[0,0],[0.3,-26]]};
 D[3]={dur:0.18,hits:[0.08],env:[[0,1],[0.18,1]],armN:[[0,205],[0.08,288],[0.14,335],[0.18,330]], bladeN:[[0,92],[0.08,292],[0.14,352],[0.18,350]],
  armF:[[0,228],[0.08,150],[0.18,130]], bladeF:[[0,180]],foreN:[[0,-55],[0.08,0]], foreF:[[0,-45],[0.08,-10],[0.18,0]],
  torso:[[0,-52],[0.08,-40],[0.18,-26]], fN:[[0,-220],[0.08,-30],[0.18,-30]], fF:[[0,200],[0.08,34],[0.18,34]], bumps:[],lunge:[[0,0]], air:[[0,-26],[0.08,0]]};
 D[4]={dur:0.4,hits:[],env:[[0,1],[0.4,0]],armN:[[0,330],[0.2,200],[0.4,200]], bladeN:[[0,350],[0.2,200],[0.4,200]],armF:[[0,130],[0.2,180],[0.4,180]], bladeF:[[0,180]],
  foreN:[[0,0],[0.1,-30],[0.2,0]], foreF:[[0,0]],torso:[[0,-26],[0.25,-6],[0.4,0]], fN:[[0,-30],[0.25,-12],[0.4,-8]], fF:[[0,34],[0.25,12],[0.4,8]], bumps:[],lunge:[[0,0]]};
 var C={};
 [1,2,3,4].forEach(function(n){ var d=D[n], du=d.dur, k={torso:T(d.torso,du),head:T(d.torso.map(function(x){return [x[0],-0.5*x[1]];}),du)};
  feet(k,d.fN,d.fF,d.lunge,d.torso,du); k.forearm_near=T(d.foreN,du); k.forearm_far=T(d.foreF,du);
  K['th_c'+n]={dur:du,hits:d.hits.map(function(h){return h/du;}),keys:k,env:T(d.env,du),world:{arm_near:T(d.armN,du),arm_far:T(d.armF,du),'sword@fist_near':T(d.bladeN,du)}};
  C[n]={dur:du,lunge:T(d.lunge,du),air:T(d.air||[[0,0]],du),bumps:d.bumps||[]}; });
 window.thPose=function(n,q){ var c=C[n], p=U.pose('th_c'+n,q*c.dur,{dur:c.dur}); var t=q*c.dur;
  p.lunge=key(c.lunge,q); p.air=key(c.air,q); c.bumps.forEach(function(b){ var u=(t-b[0])/0.07+0.5; if(u>0&&u<1) p.air+=b[1]*Math.sin(u*Math.PI); }); p.turn=0; p.over=false; p.q=q; p.hit=n; p.beat=''; return p; };
 return true;}
/* ---------------- helpers (demo units: 1 unit = r world px, r = game hero scale / 0.1485) ---------------- */
const rNow=()=>Math.max(.3,(TH.sc||SCd)/SCd);
function rnd(s){ var x=Math.sin(s*127.1+311.7)*43758.5453; return x-Math.floor(x); }
function E(x){ x=Math.max(0,Math.min(1,x)); return x*x*(3-2*x); }
const lvl=()=>{try{return Math.max(1,Math.min(10,(window.PROF&&PROF.state&&PROF.state().th&&PROF.state().th.lv)||4))}catch(_){return 4}};
const rangeW=()=>TH.cfg.RANGE[lvl()-1],pathW=()=>TH.cfg.PATH[lvl()-1];
const held=()=>{try{return P.weapon&&P.weapon.t}catch(_){return null}};
let R=null;   /* current run */
/* ---------------- damage ---------------- */
function basicCoef(){try{const A=C182.api,D=A.D(),wt=held(),wd=D.weapons[wt]||D.weapons.sword;return wd.actionCoef*wd.weights.reduce((a,b)=>a+b,0)}catch(_){return 1}}
function hitFn(e,pct,tag){const hp0=e.hp,vx0=e.vx,vy0=e.vy;
  try{const A=C182.api,id='th_'+tag,d={id,mode:'native',coefTotal:basicCoef()*pct/100,flatTotal:0,weights:[1],schedule:[0],maxTargets:1,targeting:'around',element:'Neutral'};
    const c=A.ctxFor('skill',id,d,{dt:'phys',lvScale:1,m0:1,reach:9999,cdId:ID});hitEnemy(e,1,{dt:'phys',ctx:c,th:1,kb:0,knk:1})}catch(er){ERR('hit',er)}
  try{if(vx0!=null&&(e.vx!==vx0||e.vy!==vy0)){e.vx=vx0;e.vy=vy0}}catch(_){}
  const d=Math.max(0,hp0-Math.max(0,e.hp));TH.stats.hits++;TH.stats.dmg+=d;return d}
try{const _a=applyDamage;applyDamage=function(e,d,crit,o){if(o&&o.th){if(o.kb)o.kb=0;if(d>TH.cfg.CAP)d=TH.cfg.CAP}return _a.call(this,e,d,crit,o)}}catch(e){ERR('hook damage',e)}
/* hit along a path (demo units): every live monster within HIT_R px of the segment, once */
function pathHit(H,pct,tag){const r=rNow(),dx=H.x1-H.x0,dy=H.y1-H.y0,L2=dx*dx+dy*dy||1,thr=TH.cfg.HIT_R/r;let n=0;
  for(const e of enemies){if(e.dead||!(e.hp>0))continue;const mx=e.x/r,my=e.y/r,u=Math.max(0,Math.min(1,((mx-H.x0)*dx+(my-H.y0)*dy)/L2)),px=H.x0+dx*u,py=H.y0+dy*u,d=Math.hypot(mx-px,(my-py)*1.6);
    if(d<thr){hitFn(e,pct,tag);n++;R.imp.push({t:time+.03*u,x:mx,y:my-30})}}
  R.hits.push({t:H.t,x0:H.x0,y0:H.y0,x1:H.x1,y1:H.y1,i:R.hits.length});return n}
/* ---------------- run: planning ---------------- */
const nearest=(x,y,maxD,skip)=>{let b=null,bd=maxD;for(const e of enemies){if(e.dead||!(e.hp>0)||e===skip)continue;const d=Math.hypot(e.x-x,e.y-y);if(d<bd){bd=d;b=e}}return b};
function setFace(f){try{P.face=f>0?0:Math.PI}catch(_){}}
function aimFace(){try{const tg=nearest(P.x,P.y,rangeW());if(tg)return tg.x>=P.x?1:-1;const p=aimPoint();if(p)return p.x>=P.x?1:-1}catch(_){}return Math.cos(P.face||0)>=0?1:-1}
function newRun(src,t){R=TH.run={src,tDown:t,tReal:performance.now(),phase:'pre',segs:[],hits:[],imp:[],orbs:{lit:[],used:[]},N:6,released:false,tgt:null,pend:[],dashes:0,planned:0,last:null,gainAmt:0,end:null,wasW:null,key:null,cdSet:false,
  X:P.x/rNow(),Y:P.y/rNow(),face:aimFace(),mode:null};setFace(R.face);return R}
function pushSeg(s){R.segs.push(s);return s}
/* walkable clamp (demo units in, demo units out): walk the segment in 10 px steps and stop before the first blocked point */
const okAt=(x,y,r)=>{try{return !blocked(x*r,y*r,6)}catch(_){return true}};
function clampEnd(x0,y0,x1,y1){const r=rNow(),L=Math.hypot(x1-x0,y1-y0),n=Math.max(1,Math.ceil(L*r/10));let lx=x0,ly=y0;for(let i=1;i<=n;i++){const u=i/n,x=x0+(x1-x0)*u,y=y0+(y1-y0)*u;if(!okAt(x,y,r)){if(i*10<30&&!okAt(x0,y0,r))continue;break}lx=x;ly=y}return [lx,ly]}   /* a start point that is itself inside a collision circle (tight spot) does not stop the first 30 px */
function freeNear(sx,sy,tx,ty){const r=rNow();if(okAt(sx,sy,r))return [sx,sy];for(let k=1;k<=8;k++){const u=k/8,x=sx+(tx-sx)*u,y=sy+(ty-sy)*u;if(okAt(x,y,r))return [x,y]}return [tx,ty]}
function startTap(t){const r=rNow(),X=R.X,Y=R.Y;let ax,ay;
  const tg=nearest(P.x,P.y,rangeW());let dist;
  if(tg){ax=tg.x-P.x;ay=tg.y-P.y;const d=Math.hypot(ax,ay)||1;ax/=d;ay/=d;dist=Math.min(d+pathW()*DM,rangeW()+pathW()*DM)/r}
  else{let p;try{p=aimPoint(rangeW())}catch(_){p=null}ax=p?p.x-P.x:Math.cos(P.face||0);ay=p?p.y-P.y:Math.sin(P.face||0);const d=Math.hypot(ax,ay)||1;ax/=d;ay/=d;dist=TAPDASH}
  const ce=clampEnd(X,Y,X+ax*dist,Y+ay*dist),x1=ce[0],y1=ce[1],face=ax>=0?1:-1;R.mode='tap';R.face=face;setFace(face);
  pushSeg({k:'iai',t0:t,t1:t+.42,x0:X,y0:Y,x1,y1,m0:.1/.42,m1:.22/.42,face,form:true});
  R.pend.push({t:t+.2,kind:'tap',x0:X,y0:Y,x1:x1+ax*8,y1:y1+ay*8});
  R.segs.push({k:'rec0',t0:t+.42,t1:t+.43,x0:x1,y0:y1,x1,y1,face});R.end=t+.43;R.X=x1;R.Y=y1;
  try{P.mp-=TH.cfg.MP_TAP;P.cds[ID]=TH.cfg.CD_TAP}catch(_){}R.cdSet=true;R.gainAmt=TH.cfg.PROF_TAP;TH.stats.taps++}
function startCharge(t){R.mode='charge';const X=R.X,Y=R.Y,face=R.face;
  pushSeg({k:'enter',t0:t,t1:t+ENTER,x0:X,y0:Y,x1:X,y1:Y,face});
  const h0=t+ENTER;for(let i=0;i<6;i++)R.orbs.lit.push(h0+(i+1)*ORB);
  pushSeg({k:'hold',t0:h0,t1:1e9,x0:X,y0:Y,x1:X,y1:Y,face});R.holdT0=h0;R.phase='charge';TH.stats.charges++}
function failEnd(t,why){TH.stats.fizzle++;R.failed=why;try{P.cds[ID]=TH.cfg.CD_FAIL}catch(_){}R.cdSet=true;
  const h=R.segs.find(s=>s.k==='hold');if(h&&h.t1>t)h.t1=t;const en=R.segs.find(s=>s.k==='enter');if(en&&!h&&en.t1>t)en.t1=t;
  const last=R.segs[R.segs.length-1],face=last?last.face:R.face;
  pushSeg({k:'rec',t0:t,t1:t+.4,x0:R.X,y0:R.Y,x1:R.X,y1:R.Y,face});
  for(let i=0;i<6;i++)R.orbs.used.push(t);R.end=t+.4;R.phase='end';R.N=0;try{if(why)textAt(P.x,P.y-62,why,'#ffd98a',13)}catch(_){}}
function release(t){if(!R)return;
  if(R.phase==='pre'){startTap(t);R.phase='tapRun';return}
  if(R.phase!=='charge'||R.released)return;R.released=true;
  const lit=R.orbs.lit.filter(a=>a<=t).length;
  if(lit<2){failEnd(t,'ชาร์จไม่ถึง 2 ลูก');return}
  const tg=nearest(P.x,P.y,rangeW());if(!tg){R.N=lit;failEnd(t,'ไม่มีเป้าในระยะ');return}
  let mpOk=true;try{mpOk=P.mp>=TH.cfg.MP_CH}catch(_){}
  if(!mpOk){failEnd(t,'MP ไม่พอ');return}
  try{P.mp-=TH.cfg.MP_CH;P.cds[ID]=TH.cfg.CD_CH}catch(_){}R.cdSet=true;R.gainAmt=TH.cfg.PROF_CH;
  R.N=lit;R.tgt=tg;const h=R.segs.find(s=>s.k==='hold');if(h)h.t1=t;R.phase='dash';R.tNext=t;R.dashIdx=0;
  /* the orbs of the unlit slots are not part of this release */
  planDash(t)}
const ANG=[0,200,330,150,25,250];
function planDash(t){const r=rNow();const h=R.dashIdx;
  if(h>0&&(!R.tgt||R.tgt.dead||!(R.tgt.hp>0))){const ni=nearest(R.last?R.last.x1*r:P.x,R.last?R.last.y1*r:P.y,rangeW(),R.tgt);if(!ni){for(let k=h;k<R.N;k++)R.orbs.used.push(t);endDashes(t);return}R.tgt=ni}
  const tg=R.tgt,TX=tg.x/r,TY=tg.y/r;let sx,sy,ex,ey,tt=t;
  if(h===0){sx=R.X;sy=R.Y;const dx=TX-sx,dy=TY-sy,d=Math.hypot(dx,dy)||1;{const ce=clampEnd(sx,sy,TX+dx/d*(pathW()*DM/r),TY+dy/d*(pathW()*DM/r));ex=ce[0];ey=ce[1]}}
  else{const a=(ANG[h%6]+(rnd(h*13+Math.floor(t*10))-.5)*30)*Math.PI/180,cxr=Math.cos(a)*R3,syr=Math.sin(a)*R3*.45;const fs=freeNear(TX+cxr,TY+syr,TX,TY);sx=fs[0];sy=fs[1];ex=TX-cxr;ey=TY-syr;const ce=clampEnd(sx,sy,ex,ey);ex=ce[0];ey=ce[1];
    pushSeg({k:'blink',t0:t,t1:t+BLINK,x0:R.X,y0:R.Y,x1:sx,y1:sy,face:R.face,hidden:true,form:true});tt=t+BLINK}
  const face=ex>=sx?1:-1,seg=pushSeg({k:'dash',t0:tt,t1:tt+DASH,x0:sx,y0:sy,x1:ex,y1:ey,m0:0,m1:.75,face,form:true,hit:h});
  R.face=face;R.last=seg;R.pend.push({t:tt+.08,kind:'dash',x0:sx,y0:sy,x1:ex,y1:ey,orb:true});R.X=ex;R.Y=ey;R.dashIdx++;R.tNext=tt+DASH;TH.stats.dashes++;
  if(R.dashIdx>=R.N)R.phase='lastDash'}
function endDashes(t){const last=R.segs[R.segs.length-1];R.phase='end';
  pushSeg({k:'rec',t0:t,t1:t+.4,x0:R.X,y0:R.Y,x1:R.X,y1:R.Y,face:last?last.face:R.face});
  pushSeg({k:'out',t0:t+.4,t1:t+.4+OUT,x0:R.X,y0:R.Y,x1:R.X,y1:R.Y,face:last?last.face:R.face});R.end=t+.4+OUT}
/* ---------------- run: per-frame ---------------- */
function segAt(t){const S=R.segs;for(let i=S.length-1;i>=0;i--){const s=S[i];if(t>=s.t0&&t<s.t1)return s}return S[S.length-1]}
function stateAt(t){const s=segAt(t);if(!s)return null;const q=(t-s.t0)/((Math.min(s.t1,t+1e6)-s.t0)||1),qq=Math.min(1,Math.max(0,(t-s.t0)/(((s.t1>=1e8)?1:(s.t1-s.t0))||1)));
  let m=s.m0!=null?E((q-s.m0)/((s.m1-s.m0)||1)):0,p;
  if(s.k==='dash')m=Math.min(1,Math.pow(Math.max(0,q)/s.m1,.6));
  const x=s.x0+(s.x1-s.x0)*m,y=s.y0+(s.y1-s.y0)*m;
  if(s.k==='iai')p=thPose(1,q);else if(s.k==='enter')p=thPose(2,q);else if(s.k==='hold'){p=thPose(2,1);p.air=(p.air||0)+1.5*Math.sin(t*40)}
  else if(s.k==='dash'||s.k==='blink')p=thPose(3,s.k==='blink'?0:q);else if(s.k==='rec')p=thPose(4,q);
  else{p=PU().pose('idle',t,{});p.lunge=0;p.air=0;p.turn=0}
  const lit=R.orbs.lit.filter(a=>a<=t).length,used=R.orbs.used.filter(a=>a<=t).length;
  const spr={iai:q<.24?'charge':(q<.42?'dash':(q<.7?'slash':'recover')),enter:'charge',hold:'charge',dash:(q<.4?'dash':'slash'),blink:'dash',rec:'recover'}[s.k]||null;
  return {seg:s,q,x,y,face:s.face,p,hidden:!!s.hidden,form:!!(s.k!=='idle'&&s.k!=='rec0'&&s.k!=='out'&&s.k!=='enter'&&!(s.k==='iai'&&q<IAIMORPH)),charging:s.k==='hold'||s.k==='enter',lit,used,spr,t}}
function finish(){if(!R)return;const r=R;try{if(r.cdSet&&r.gainAmt&&window.PROF&&PROF.gain)PROF.gain('th',r.gainAmt)}catch(e){ERR('gain',e)}
  restoreWeapon();TH.run=null;R=null;try{P.invT=Math.max(P.invT||0,0)}catch(_){}}
function useSword(){try{const U=PU();if(R&&R.wasW==null){R.wasW={w:(U.cfg&&U.cfg.WEAPON)||'sword',ss:U.cfg&&U.cfg.showSword};U.setWeapon('sword');if(U.cfg)U.cfg.showSword=true}}catch(_){}}
function restoreWeapon(){try{const U=PU();if(R&&R.wasW){const wt=held(),M={sword:'sword',bow:'bow',staff:'staff',holy:'holy',dagger:'dagger',scythe:'scythe',knuckle:'knuckle'};U.setWeapon(M[wt]||'none');if(U.cfg){U.cfg.showSword=!!M[wt]&&wt==='sword'?true:R.wasW.ss;}R.wasW=null}}catch(_){}}
function tick(dt){try{if(!R)return;if(typeof P==='undefined'||!P||P.dead||G.state!=='play'){finish();return}const t=time,r=rNow();
  if(R.phase==='pre'){if((performance.now()-R.tReal)/1000>=TH.cfg.HOLD_T){startCharge(t)}}   /* press length is measured in real time (a game-time hitch must not turn a tap into a hold) */
  /* pending hits */
  for(let i=R.pend.length-1;i>=0;i--){const h=R.pend[i];if(t>=h.t){R.pend.splice(i,1);
    if(h.kind==='tap')pathHit(h,TH.cfg.TAP_PCT[lvl()-1],'tap');else{pathHit(h,TH.cfg.DASH_PCT[lvl()-1],'d'+R.dashes);R.dashes++;if(h.orb)R.orbs.used.push(h.t)}}}
  /* next dash */
  if((R.phase==='dash')&&t>=R.tNext){planDash(R.tNext)}
  if(R.phase==='lastDash'&&t>=R.tNext){endDashes(R.tNext)}
  /* hero position / lock */
  const S=stateAt(t);if(S){R.S=S;const nx=S.x*r,ny=S.y*r;if(!blocked(nx,ny,10)){P.x=nx;P.y=ny}P.vx=0;P.vy=0;try{P.face=S.face>0?0:Math.PI;P.atkCd=Math.max(P.atkCd||0,.2)}catch(_){}}
  if(R.end!=null&&t>=R.end)finish()}catch(e){ERR('tick',e)}}
/* the hero is frozen by us: let the game run its own player update (timers, cooldowns), then put the hero back */
try{const _p=updPlayer;updPlayer=function(dt){if(!R||R.phase==='pre')return _p.apply(this,arguments);const x=P.x,y=P.y;try{return _p.apply(this,arguments)}finally{P.x=x;P.y=y}}}catch(e){ERR('hook updPlayer',e)}
try{const _u=update;update=function(dt){const r0=_u.apply(this,arguments);tick(dt);return r0}}catch(e){ERR('hook update',e)}
try{const _b=basicAttack;basicAttack=function(){if(R&&R.phase!=='pre')return;return _b.apply(this,arguments)}}catch(e){ERR('hook basic',e)}
const castOther=o=>function(id){if(R&&R.phase!=='pre'&&id!==ID)return false;return o.apply(this,arguments)};
try{castSkill=castOther(castSkill)}catch(e){ERR('hook castSkill',e)}try{castSkillNow=castOther(castSkillNow)}catch(e){ERR('hook castSkillNow',e)}
/* ---------------- input ---------------- */
const slotIdx=()=>{try{return P.slots.indexOf(ID)}catch(_){return -1}};
const stateOk=()=>{try{return window.SPSK&&SPSK.state&&SPSK.state('th')==='on'}catch(_){return false}};
function down(src,key){try{if(!TH.on||R||typeof P==='undefined'||!P||P.dead||G.state!=='play'||G.win||P.casting)return false;
    if(!stateOk()){try{textAt(P.x,P.y-62,'เทพดาบสายฟ้า: ยังไม่ปลดล็อก','#ffd98a',13)}catch(_){}return false}
    if(!kfInit()||!window.drawCombo||!window.THSPR){return false}
    if((P.cds[ID]||0)>0){try{textAt(P.x,P.y-62,'เทพดาบสายฟ้า: คูลดาวน์ '+Math.ceil(P.cds[ID])+' วิ','#ffd98a',13)}catch(_){}return false}
    if(P.mp<TH.cfg.MP_TAP){try{textAt(P.x,P.y-62,'MP ไม่พอ','#ffd98a',13)}catch(_){}return false}
    newRun(src,time);R.key=key;useSword();return true}catch(e){ERR('down',e);return false}}
function up(){try{if(R&&!R.released)release(time)}catch(e){ERR('up',e)}}
TH.down=down;TH.up=up;
addEventListener('keydown',e=>{try{if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||!TH.on)return;const t=e.target;if(t&&/INPUT|TEXTAREA|SELECT/.test(t.tagName||''))return;
  const i=slotIdx();if(i<0||R)return;const k=String(e.key||'').toLowerCase();if(k!==String(SLOT_KEYS[i]).toLowerCase())return;
  if(down('key',k)){e.stopImmediatePropagation();e.preventDefault()}}catch(er){ERR('keydown',er)}},true);
addEventListener('keyup',e=>{try{if(!R||R.src!=='key')return;if(String(e.key||'').toLowerCase()===R.key){up()}}catch(er){ERR('keyup',er)}},true);
addEventListener('pointerdown',e=>{try{if(!TH.on||R||G.assign||e.button>0)return;const el=e.target&&e.target.closest&&e.target.closest('.slot[data-sk="'+ID+'"],.tsk[data-sk="'+ID+'"]');if(!el)return;
  if(down('ptr',e.pointerId)){e.stopImmediatePropagation();e.preventDefault()}}catch(er){ERR('pointerdown',er)}},true);
for(const ev of ['pointerup','pointercancel'])addEventListener(ev,e=>{try{if(R&&R.src==='ptr')up()}catch(er){ERR(ev,er)}},true);
addEventListener('blur',()=>{try{if(R&&!R.released)up()}catch(_){}});
/* ---------------- drawing (the demo FX, ported) ---------------- */
let cx=null;const OC=document.createElement('canvas'),ox=OC.getContext('2d');
const YC={core:'255,251,224',y1:'255,228,90',y2:'255,196,0',edge:'255,154,0'};
function A(a){return Math.max(0,Math.min(1,a))}
function glow(x,y,r,col,a){if(r<=0||a<=0)return;var g=cx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba('+col+','+A(a)+')');g.addColorStop(1,'rgba('+col+',0)');cx.fillStyle=g;cx.beginPath();cx.arc(x,y,r,0,6.2832);cx.fill()}
function zig(x0,y0,x1,y1,seed,amp,w,col,a){var dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,n=Math.max(3,Math.round(L/22));cx.strokeStyle='rgba('+col+','+A(a)+')';cx.lineWidth=w;cx.lineJoin='miter';cx.beginPath();cx.moveTo(x0,y0);
  for(var i=1;i<n;i++){var u=i/n,o=(rnd(seed+i)-.5)*2*amp;cx.lineTo(x0+dx*u+nx*o,y0+dy*u+ny*o)}cx.lineTo(x1,y1);cx.stroke()}
function bolt(x0,y0,x1,y1,seed,amp,wid,a,withBranch){var dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,n=Math.max(4,Math.round(L/26)),Pp=[];
  for(var i=0;i<=n;i++){var u=i/n,o=(i==0||i==n)?0:(rnd(seed*13+i)-.5)*2*amp;Pp.push([x0+dx*u+nx*o,y0+dy*u+ny*o,Math.sin(u*Math.PI)])}
  function poly(wm,col,al){cx.fillStyle='rgba('+col+','+A(al)+')';cx.beginPath();var i;for(i=0;i<Pp.length;i++){var w=wid*wm*(.25+.75*Pp[i][2]);if(i==0)cx.moveTo(Pp[i][0]+nx*w,Pp[i][1]+ny*w);else cx.lineTo(Pp[i][0]+nx*w,Pp[i][1]+ny*w)}
    for(i=Pp.length-1;i>=0;i--){var w2=wid*wm*(.25+.75*Pp[i][2]);cx.lineTo(Pp[i][0]-nx*w2,Pp[i][1]-ny*w2)}cx.closePath();cx.fill()}
  poly(2.2,YC.edge,.35*a);poly(1.3,YC.y2,.8*a);poly(.55,YC.core,a);
  if(withBranch){for(var b=0;b<2;b++){var k=Math.floor(n*(.3+.35*b))+1,p=Pp[Math.min(k,n-1)],s=(b?1:-1),bl=L*.16,ang=Math.atan2(dy,dx)+s*.7;zig(p[0],p[1],p[0]+Math.cos(ang)*bl,p[1]+Math.sin(ang)*bl,seed+b*7,5,wid*.5,YC.y1,.8*a)}}}
function heroRaw(g,S){var im=window.THSPR[S.spr];if(S.form&&im&&im.complete&&im.naturalWidth){var h=THSPR_H,w=h*im.naturalWidth/im.naturalHeight;g.save();g.translate(S.x,S.y-(S.p.air||0)*SCd);g.scale(S.face,1);g.drawImage(im,-w/2,-h,w,h);g.restore();return}
  window.drawCombo(g,S.x,S.y,SCd,S.face,S.p)}
function heroTinted(S,col,alpha,mat){const cw=cx.canvas.width,ch=cx.canvas.height;if(OC.width!==cw||OC.height!==ch){OC.width=cw;OC.height=ch}
  ox.setTransform(1,0,0,1,0,0);ox.clearRect(0,0,cw,ch);ox.setTransform(mat.a,mat.b,mat.c,mat.d,mat.e,mat.f);heroRaw(ox,S);
  ox.setTransform(1,0,0,1,0,0);ox.globalCompositeOperation='source-atop';ox.fillStyle=col;ox.fillRect(0,0,cw,ch);ox.globalCompositeOperation='source-over';
  cx.save();cx.setTransform(1,0,0,1,0,0);cx.globalAlpha=alpha;cx.drawImage(OC,0,0);cx.restore()}
function sprOK(S){var im=window.THSPR[S.spr];return !!(S.form&&im&&im.complete&&im.naturalWidth)}
function thBehind(t,mat){var fl=Math.floor(t*30);
  R.segs.forEach(function(s,si){if((s.k!=='dash'&&s.k!=='iai')||t<s.t0||t>s.t1+.3)return;var k=t>s.t1?(t-s.t1)/.3:0,st=stateAt(Math.min(t,s.t1-1e-4));if(!st)return;var ex=st.x,ey=st.y-40;
    cx.save();cx.globalCompositeOperation='lighter';
    var gr=cx.createLinearGradient(s.x0,s.y0-40,ex,ey-.001);gr.addColorStop(0,'rgba('+YC.y2+',0)');gr.addColorStop(1,'rgba('+YC.y1+','+.5*(1-k)+')');
    cx.strokeStyle=gr;cx.lineWidth=26*(1-k)+4;cx.lineCap='round';cx.beginPath();cx.moveTo(s.x0,s.y0-40);cx.lineTo(ex,ey);cx.stroke();
    bolt(s.x0,s.y0-40,ex,ey,fl*3+si,10,5,1-k,true);cx.restore();
    if(t<=s.t1)for(var g=1;g<=5;g++){var tt=t-.022*g;if(tt<s.t0)break;var G2=stateAt(tt);if(G2&&!G2.hidden)heroTinted(G2,'rgba(255,214,60,1)',.4*(1-g/6),mat)}})}
function dissolve(t,S){var im=window.THSPR.recover,ok=im&&im.complete&&im.naturalWidth;if(!ok){heroRaw(cx,S);return}
  var tt=t-S.seg.t0,u=E(tt/OUTCUT),cut=S.y-OUTH*(1-u),W=3000*4/4*1.5;
  cx.save();cx.beginPath();cx.rect(S.x-W,cut-W,2*W,W);cx.clip();heroRaw(cx,S);cx.restore();
  if(u<1){cx.save();cx.beginPath();cx.rect(S.x-W,cut,2*W,W);cx.clip();var h=THSPR_H,w=h*im.naturalWidth/im.naturalHeight;cx.translate(S.x,S.y);cx.scale(S.face,1);cx.drawImage(im,-w/2,-h,w,h);cx.restore();
    cx.save();cx.globalCompositeOperation='lighter';var gl=cx.createLinearGradient(0,cut-6,0,cut+6);gl.addColorStop(0,'rgba('+YC.y1+',0)');gl.addColorStop(.5,'rgba('+YC.core+',.85)');gl.addColorStop(1,'rgba('+YC.y1+',0)');cx.fillStyle=gl;cx.fillRect(S.x-40,cut-6,80,12);cx.restore()}
  cx.save();cx.globalCompositeOperation='lighter';
  for(var j=0;j<110;j++){var tb=rnd(j*1.37)*OUTCUT,age=tt-tb;if(age<0||age>.75)continue;var ub=E(tb/OUTCUT),yb=S.y-OUTH*(1-ub),half=ub<.35?34:24,xb=S.x+(rnd(j*2.9)-.5)*2*half;
    var k=age/.75,sp=40+rnd(j*4.1)*70,x=xb-S.face*sp*age+Math.sin(age*9+j)*5,y=yb-(18+rnd(j*6.3)*40)*age-10*age*age,rr=1.2+rnd(j*7.7)*2.4;
    glow(x,y,rr*3,YC.y1,.55*(1-k));cx.fillStyle='rgba('+YC.core+','+(1-k)+')';cx.fillRect(x-rr/2,y-rr/2,rr,rr)}
  cx.restore()}
function thHero(t,S,mat){if(S.hidden)return;var fl=Math.floor(t*24);
  if(S.seg.k==='out'){dissolve(t,S);return}
  var sk=S.seg.k,pre=(sk==='enter')?S.q:(sk==='iai'&&S.q<IAIMORPH?S.q/IAIMORPH:-1);
  if(pre>=0){heroRaw(cx,S);var gk=Math.max(0,(pre-.4)/.6);if(gk>0){heroTinted(S,'rgba(255,226,90,1)',.75*gk*gk,mat);cx.save();cx.globalCompositeOperation='lighter';glow(S.x,S.y-45,40+40*gk,YC.y1,.4*gk);cx.restore()}return}
  var mt=-1;if(sprOK(S)){if(sk==='hold')mt=(t-S.seg.t0)/MORPH;else if(sk==='iai')mt=(S.q*(S.seg.t1-S.seg.t0)-IAIMORPH*(S.seg.t1-S.seg.t0))/MORPH}
  if(mt>=0&&mt<1){var P2=Object.assign({},S,{form:false});if(sk==='hold'){P2.p=thPose(2,1)}else{P2.p=thPose(1,IAIMORPH)}
    heroTinted(P2,'rgba(255,236,140,1)',1-mt,mat);cx.save();cx.globalAlpha=mt;heroRaw(cx,S);cx.restore();
    cx.save();cx.globalCompositeOperation='lighter';glow(S.x,S.y-45,95,YC.core,.7*(1-mt));for(var i=0;i<6;i++){var a2=rnd(fl+i*7)*6.28;zig(S.x,S.y-45,S.x+Math.cos(a2)*70,S.y-45+Math.sin(a2)*55,fl+i,6,2,YC.core,1-mt)}cx.restore();return}
  if(sprOK(S)){cx.save();cx.globalCompositeOperation='lighter';glow(S.x,S.y-45,70+6*Math.sin(t*40),YC.y1,.35);cx.restore()}
  heroRaw(cx,S);
  if(S.charging&&S.lit>0){cx.save();cx.globalCompositeOperation='lighter';
    var L=S.lit;glow(S.x,S.y-45,45+7*L,YC.y1,.16+.05*L);
    cx.strokeStyle='rgba('+YC.y1+','+(.25+.07*L)+')';cx.lineWidth=2.5;cx.beginPath();cx.ellipse(S.x,S.y-2,22+5*L,6+1.4*L,0,0,6.28);cx.stroke();
    for(var j=0;j<6+2*L;j++){var ph=(t*.9+rnd(j*3))%1,sx=S.x+(rnd(j)-.5)*(30+6*L),sy=S.y-ph*110;glow(sx,sy,3+2*(1-ph),YC.core,.85*(1-ph))}
    for(var i2=0;i2<2+Math.min(3,L);i2++){var a3=rnd(fl+i2*5)*6.28;zig(S.x+Math.cos(a3)*14,S.y-45+Math.sin(a3)*30,S.x+Math.cos(a3)*(40+3*L),S.y-45+Math.sin(a3)*(55+3*L),fl+i2,5,1.8,YC.core,.85)}
    cx.restore()}}
function thFront(t,S,mat){
  if(S&&(S.charging||S.lit>S.used)&&R.N>0){var oxp=S.x,oyp=S.y-112;cx.save();
    for(var i=0;i<6;i++){var a=Math.PI*(1.12+i*.152),px=oxp+Math.cos(a)*48,py=oyp+Math.sin(a)*26+24;var litT=R.orbs.lit[i],on=litT!=null&&t>=litT,usedT=R.orbs.used[i],gone=usedT!=null&&t>=usedT;
      if(gone){var kk=(t-usedT)/.25;if(kk<1){cx.globalCompositeOperation='lighter';glow(oxp+(px-oxp)*(1-kk),py+(oyp+36-py)*kk,12*(1-kk),YC.core,.8*(1-kk))}continue}
      if(i>=R.N)continue;
      if(!on){cx.strokeStyle='rgba(255,255,255,.4)';cx.lineWidth=1.5;cx.beginPath();cx.arc(px,py,5,0,6.28);cx.stroke();continue}
      var pk=A((t-litT)/.2),pulse=1+.8*(1-pk),fl2=Math.floor(t*20);cx.globalCompositeOperation='lighter';glow(px,py,17*pulse,YC.y2,.75);
      for(var q=0;q<3;q++){var qa=rnd(fl2+i*9+q)*6.28;zig(px,py,px+Math.cos(qa)*(9+3*pulse),py+Math.sin(qa)*(9+3*pulse),fl2+q,2,1.2,YC.core,.8)}
      cx.globalCompositeOperation='source-over';var og=cx.createRadialGradient(px-1.5,py-1.5,0,px,py,5.5*pulse);og.addColorStop(0,'rgb(255,255,240)');og.addColorStop(1,'rgb(255,200,20)');cx.fillStyle=og;cx.beginPath();cx.arc(px,py,5.2*pulse,0,6.28);cx.fill()}
    if(S.lit>=6&&S.charging){cx.globalCompositeOperation='lighter';cx.strokeStyle='rgba('+YC.y1+','+(.45+.2*Math.sin(t*20))+')';cx.lineWidth=3;cx.beginPath();cx.ellipse(S.x,S.y-2,46,13,0,0,6.28);cx.stroke()}
    cx.restore()}
  R.hits.forEach(function(H){var dt=t-H.t,D=.32;if(!(dt>=0&&dt<=D))return;var k=dt/D,dx=H.x1-H.x0,dy=H.y1-H.y0,a=Math.atan2(dy,dx),mx=H.x0+dx*.55,my=H.y0+dy*.55-38;
    cx.save();cx.globalCompositeOperation='lighter';cx.translate(mx,my);cx.rotate(a);
    var Rr=78,th0=-2.5,th1=-.6,e=Math.min(1,k*3.2),thA=th0+(th1-th0)*e,w=(1-k)*14+1;
    var g=cx.createLinearGradient(-Rr,0,Rr,0);g.addColorStop(0,'rgba('+YC.edge+',0)');g.addColorStop(.5,'rgba('+YC.y1+','+.95*(1-k)+')');g.addColorStop(1,'rgba('+YC.core+','+(1-k)+')');
    cx.fillStyle=g;cx.beginPath();cx.ellipse(0,0,Rr,Rr*.36,0,th0,thA);cx.ellipse(0,0,Rr-w*1.6,Rr*.36-w*.5,0,thA,th0,true);cx.closePath();cx.fill();cx.restore();
    cx.save();cx.globalCompositeOperation='lighter';glow(mx,my,46*(.5+k),YC.core,(1-k)*.85);
    for(var s2=0;s2<6;s2++){var sa=s2*1.047+a+.3,len=(26+30*e)*(1-k*.4);bolt(mx,my,mx+Math.cos(sa)*len,my+Math.sin(sa)*len*.8,Math.floor(H.t*40)+s2,5,3,1-k,false)}
    cx.strokeStyle='rgba('+YC.y2+','+(1-k)+')';cx.lineWidth=3*(1-k)+1;cx.beginPath();cx.ellipse(mx,my+30,14+60*k,5+20*k,0,0,6.28);cx.stroke();cx.restore()})}
/* rocks (r7): break off the ground, rise, tremble per lit orb, blast out on release */
function rockSeg(){var e=null,h=null;R.segs.forEach(function(s){if(s.k==='enter')e=s;if(s.k==='hold')h=s});return e?{t0:e.t0,tr:h?h.t1:1e9,x:e.x0,y:e.y0}:null}
function rocks(t,front){var Rk=rockSeg();if(!Rk||t<Rk.t0||t>Rk.tr+.9)return;var lit=R.orbs.lit.filter(function(a){return a<=t}).length,nr=(function(){try{return G.gfx==='low'?10:NROCK}catch(_){return NROCK}})();
  for(var i=0;i<nr;i++){var a=rnd(i*3.1)*6.2832,rr=46+rnd(i*5.7)*64,gx=Rk.x+Math.cos(a)*rr,gy=Rk.y+Math.sin(a)*rr*.32;
    if((gy>=Rk.y)!==front)continue;
    var ts=Rk.t0+.15+i*.09,u=(t-ts)/.45;if(u<=0)continue;u=Math.min(1,u);
    var big=5+rnd(i*9.3)*8,H=(22+rnd(i*2.2)*62)*(1-Math.pow(1-u,3)),bob=Math.sin(t*3+i)*3*u;
    var amp=u<1?.6:(.8+.55*lit),jx=Math.sin(t*57+i*1.7)*amp,jy=Math.cos(t*49+i*2.3)*amp*.7;
    var x=gx+jx,y=gy-H+bob+jy,rot=rnd(i)*6+Math.sin(t*2+i)*.3,al=1;
    if(t>Rk.tr){var k=(t-Rk.tr)/.9,dx=Math.cos(a),dy=Math.sin(a)*.32;x+=dx*170*k;y+=dy*170*k+(-120*k+380*k*k);rot+=k*8*(i%2?1:-1);al=1-Math.max(0,(k-.6)/.4)}
    cx.fillStyle='rgba(0,0,0,'+(.22*al*Math.max(.2,1-H/90))+')';cx.beginPath();cx.ellipse(gx,gy,big*1.1,big*.35,0,0,6.28);cx.fill();
    cx.save();cx.globalAlpha=al;cx.translate(x,y);cx.rotate(rot);var n=5+(i%3),Pp=[];
    for(var v=0;v<n;v++){var va=v/n*6.2832,vr=big*(.7+rnd(i*11+v)*.5);Pp.push([Math.cos(va)*vr,Math.sin(va)*vr*.8])}
    var path=function(){cx.beginPath();Pp.forEach(function(p,j){if(j)cx.lineTo(p[0],p[1]);else cx.moveTo(p[0],p[1])});cx.closePath()};
    path();cx.fillStyle=['#a5784a','#8f6640','#b8895a'][i%3];cx.fill();
    cx.save();cx.clip();cx.fillStyle='rgba(255,230,180,.45)';cx.fillRect(-big*1.5,-big*1.5,big*3,big*1.1);cx.fillStyle='rgba(70,40,20,.35)';cx.fillRect(-big*1.5,big*.25,big*3,big*1.5);cx.restore();
    path();cx.lineWidth=1.3;cx.strokeStyle='rgba(58,34,16,.95)';cx.stroke();
    if(lit>0&&t<=Rk.tr){cx.globalCompositeOperation='lighter';path();cx.strokeStyle='rgba('+YC.y1+','+(.12+.08*lit)+')';cx.lineWidth=2.2;cx.stroke()}
    cx.restore();
    var du=(t-ts)/.5;if(du>0&&du<1){cx.fillStyle='rgba(214,186,140,'+(.45*(1-du))+')';cx.beginPath();cx.ellipse(gx,gy-2-6*du,big*(1+2*du),big*(.5+.8*du),0,0,6.28);cx.fill()}}}
/* ---- game hooks ---- */
let inDraw=false;
function hookPuppet(){const U=PU();if(!U||U._thHook)return !!(U&&U._thHook);const _d=U.draw;if(typeof _d!=='function')return false;U._thHook=1;
  U.draw=function(c,x,y,sc,fac,pose){if(!inDraw)TH.sc=sc;
    if(inDraw||!R||R.phase==='pre'||!R.S||!window.THSPR||!window.thPose)return _d.apply(this,arguments);
    const t0=performance.now();inDraw=true;
    try{const t=time,S=stateAt(t);if(!S)return _d.apply(this,arguments);R.S=S;const r=rNow();
      /* shadow */
      if(!S.hidden){c.save();c.fillStyle='rgba(0,0,0,.22)';c.beginPath();c.ellipse(x,y+4,24*r,6*r,0,0,6.3);c.fill();c.restore()}
      cx=c;c.save();c.scale(r,r);const mat=c.getTransform();
      try{thHero(t,S,mat)}finally{c.restore()}
      return null}
    finally{inDraw=false;const ms=performance.now()-t0;TH.stats.fxMs+=ms;TH.stats.fxN++;if(ms>TH.stats.maxMs)TH.stats.maxMs=ms}};
  return true}
setInterval(()=>{try{hookPuppet()}catch(e){ERR('hookPuppet',e)}},300);
/* behind pass (before the characters) and front pass (after) */
try{const _g=drawRaidTele;drawRaidTele=function(){const r0=_g.apply(this,arguments);try{if(R&&R.phase!=='pre'&&R.S&&window.THSPR){const t=time,r=rNow();cx=ctx;ctx.save();ctx.scale(r,r);const mat=ctx.getTransform();const tb=performance.now();try{rocks(t,false);const tr=performance.now();thBehind(t,mat);TH.stats.rockMs=(TH.stats.rockMs||0)+tr-tb;TH.stats.behMs=(TH.stats.behMs||0)+performance.now()-tr;TH.stats.behN=(TH.stats.behN||0)+1}finally{ctx.restore()}}}catch(e){ERR('behind',e)}return r0}}catch(e){ERR('hook behind',e)}
try{const _t=drawTexts;drawTexts=function(){const r0=_t.apply(this,arguments);try{if(R&&R.phase!=='pre'&&R.S&&window.THSPR){const t0=performance.now(),t=time,r=rNow(),S=stateAt(t);cx=ctx;ctx.save();ctx.scale(r,r);const mat=ctx.getTransform();try{rocks(t,true);thFront(t,S,mat)}finally{ctx.restore()}TH.stats.frontMs=(TH.stats.frontMs||0)+performance.now()-t0;TH.stats.frontN=(TH.stats.frontN||0)+1}}catch(e){ERR('front',e)}return r0}}catch(e){ERR('hook front',e)}
setInterval(()=>{try{kfInit()}catch(_){}},400);
console.info('[TH] thunder-r1 ready');
})();
