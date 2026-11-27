
/* ---- hammer-r1 (TEST allin_r63, 13 Nov 2026): STEAM HAMMER, new special weapon type 'hammer' (basic attack step only) ----
   Motion poses r7 (DeaRz passed 14:29 / 14:41): pose 1 = basic two-hand swing 0.70 s, damage at 0.32 s, steam thruster 0.20-0.34, gear-ring impact (gearHit, DeaRz 14:44). Art: starter hammer (rot3, head up 640x757, pivot (320,530), head centre (320,200)).
   * weapon row WEAPONS.hammer (two-handed melee, base interval 0.70 s, reach 95 px, arc 100 deg), D().weapons.hammer; per-hit coef = sword coef x 0.65 x (0.70 / sword interval) = 0.819 x sword (basic DPS = 0.65 S, Balance r1, still a proposal);
   * hit sector in front of the hero (aim direction = target / mouse): 100 deg, reach 95 px (+ monster size), every monster once at 0.32 s of the swing (swing length = 0.70 s x base / current ASPD, AGI as normal); no knockback; every hit = the game's own hit;
   * STUN (Balance v1): 30 % per monster hit, ordinary 0.8 s, elite 0.4 s, boss immune, a hit on an already stunned monster does not refresh, 2 s stun immunity after a stun ends, only hammer basic hits stun; the stun visual is ONE function (stunFx) so Motion's newer one can replace it;
   * puppet: hammer art on the sword part (pivot (320,530), SC.sword from the SIZE RULE function hammerSC(len) = 0.65 x 736 / rotated opaque length of the art -> 0.65 for the starter), rest pose = wr_0 (hammer on the shoulder, the arms/torso of wr_0 are laid over the walk pose while moving),
     swing = wrPose(1, q) with the far-hand grip IK;
   * unlock like the other special weapons (SPW shards -> book, 'hammer' added) + GM give (?hammer=give or __HAMMER.give()); NO hero HP/DEF bonus (Balance dropped it); skills (slam, turret, toss, robot...) NOT here;
   ?hammer=off removes the weapon. Debug: window.HAMMER ---- */
(function(){'use strict';
const Q=String(location.search),OFF=/[?&]hammer=off\b/.test(Q),GIVE=/[?&]hammer=give\b/.test(Q);
const HM=window.HAMMER=window.__HAMMER={ver:'hammer-r1',on:!OFF,err:null,A:null,swings:0,hits:0,stuns:0,dmg:0,applied:false,last:null,fxMs:0,fxN:0,
  cfg:{BASE_DUR:.70,HIT_T:.32,ARC:100,REACH:95,STUN_CH:.3,STUN:.8,STUN_ELITE:.4,STUN_IMM:2,SWORD_INT:.5556,COEF_DPS:.65,JET:[.20,.34],CAP:99999,STD_LEN:736,STD_SC:.65,DEMO_SC:.1485}};
if(OFF)return;
const ERR=(w,e)=>{HM.err=w+': '+((e&&e.message)||e);try{console.error('[HAMMER]',w,e)}catch(_){}};
const PU=()=>window.PUPPET;
/* SIZE RULE (DeaRz 15:20): every hammer is drawn at the same size as the starter hammer: SC = 0.65 x 736 / rotated opaque length of that hammer's art */
const hammerSC=len=>HM.cfg.STD_SC*HM.cfg.STD_LEN/Math.max(1,len||HM.cfg.STD_LEN);
HM.hammerSC=hammerSC;
const held=()=>{try{return !!(P&&P.weapon&&P.weapon.t==='hammer')}catch(_){return false}};
const COEF=()=>HM.cfg.COEF_DPS*(HM.cfg.BASE_DUR/HM.cfg.SWORD_INT);
/* ---------------- weapon / data rows ---------------- */
function defs(){try{
  if(typeof WEAPONS==='object'&&WEAPONS&&!WEAPONS.hammer){const s=WEAPONS.sword||{};WEAPONS.hammer=Object.assign({},s,{n:'Steam Hammer',th:'ค้อนไอน้ำ',aspd:+(1/HM.cfg.BASE_DUR).toFixed(4),range:HM.cfg.REACH,arc:+(HM.cfg.ARC*Math.PI/180).toFixed(3),mult:s.mult||1,_p203:1})}
  const D=C182&&C182.api&&C182.api.D&&C182.api.D();
  if(D&&D.weapons&&!D.weapons.hammer&&D.weapons.sword){const s=D.weapons.sword,c=+(s.actionCoef*COEF()).toFixed(4);D.weapons.hammer=Object.assign({},s,{actionCoef:c,perHitCoef:c,baseInterval:HM.cfg.BASE_DUR})}
  if(window.SPW&&SPW.cfg){const C=SPW.cfg;if(Array.isArray(C.weapons)&&!C.weapons.includes('hammer'))C.weapons.push('hammer');if(C.th&&!C.th.hammer)C.th.hammer='ค้อนไอน้ำ'}
  if(typeof ITEMS==='object'&&ITEMS){const kb=ITEMS.it_weapon_book_knuckle,ks=ITEMS.it_weapon_book_shard_knuckle;
    if(kb&&!ITEMS.it_weapon_book_hammer)ITEMS.it_weapon_book_hammer=Object.assign({},kb,{n:'ตำราอาวุธพิเศษ (ค้อนไอน้ำ)'});
    if(ks&&!ITEMS.it_weapon_book_shard_hammer)ITEMS.it_weapon_book_shard_hammer=Object.assign({},ks,{n:'เศษตำราอาวุธ (ค้อนไอน้ำ)'})}
  }catch(e){ERR('defs',e)}}
defs();setInterval(defs,1500);
/* makeWeapon('hammer', ...) = a sword item turned into a hammer (the item generator has no hammer tables) */
try{const _m=makeWeapon;makeWeapon=function(t,lvl,rar,opt){if(t!=='hammer')return _m.apply(this,arguments);
  const it=_m.call(this,'sword',lvl,rar,opt);if(it){it.t='hammer';try{const base=String(it.name||'').replace(/\b(Sword|Blade|Saber|Edge|Claymore)\b/i,'Steam Hammer');it.name=/Steam Hammer/.test(base)?base:('Steam Hammer');if(!/\[\d\]$/.test(it.name)&&/\[\d\]/.test(String(it.name)))void 0}catch(_){}}
  return it}}catch(e){ERR('hook makeWeapon',e)}
HM.give=(lvl,rar)=>{try{const it=makeWeapon('hammer',lvl||Math.max(1,P.lvl|0),rar==null?2:rar);if(addItem(it)){try{notify('ได้รับ '+it.name,false)}catch(_){}return it}}catch(e){ERR('give',e)}return null};
let gaveOnce=false;setInterval(()=>{try{if(GIVE&&!gaveOnce&&typeof P!=='undefined'&&P&&G.state==='play'&&!G.fade){gaveOnce=true;HM.give()}}catch(_){}},1000);
/* ---------------- puppet: hammer art on the sword part ---------------- */
let img=null,SAVE=null;
function loadArt(){if(img)return;const a=window.__HAMMER_ART;if(!a)return;const im=new Image();im.onload=()=>{img=im};im.src=a.starter}
loadArt();
const map={sword:'sword',bow:'bow',staff:'staff',holy:'holy',dagger:'dagger',scythe:'scythe',knuckle:'knuckle'};
function applyPuppet(){const U=PU();if(!U||!U.P||!img||!U.imgs)return false;
  if(!U.imgs.w_hammer)U.imgs.w_hammer=img;
  try{U.setWeapon('sword')}catch(_){}
  if(!SAVE)SAVE=null;
  U.slots.sword='w_hammer';U.P.sword.pivot=[320,530];U.cfg.SC.sword=hammerSC(HM.cfg.STD_LEN);U.cfg.REST.sword=0;U.cfg.showSword=true;U.cfg.WEAPON='hammer';HM.applied=true;return true}
function revertPuppet(){const U=PU();if(!U||!HM.applied)return;HM.applied=false;try{const wt=P&&P.weapon&&P.weapon.t;U.setWeapon(map[wt]||'none');U.cfg.showSword=(wt==='sword')?true:(!!map[wt]&&wt!=='bow'&&wt!=='knuckle')}catch(e){ERR('revert',e)}}
/* ---------------- swing ---------------- */
const rate=()=>{try{return Math.max(.4,Math.min(8,aspdHits()))}catch(_){return 1/HM.cfg.BASE_DUR}};
const durNow=()=>HM.cfg.BASE_DUR*(1/HM.cfg.BASE_DUR)/rate();   /* = 1 / aspd hits per s: 0.70 s at the base ASPD, faster with AGI */
function nearest(x,y,maxD){let b=null,bd=maxD;for(const e of enemies){if(e.dead||!(e.hp>0))continue;const d=Math.hypot(e.x-x,e.y-y);if(d<bd){bd=d;b=e}}return b}
function aimAng(){try{const tg=typeof aimPoint==='function'?aimPoint():null;if(tg)return Math.atan2(tg.y-P.y,tg.x-P.x)}catch(_){}const n=nearest(P.x,P.y,420);return n?Math.atan2(n.y-P.y,n.x-P.x):(P.face||0)}
function start(){if(HM.A)return false;const t=time,ang=aimAng(),face=Math.cos(ang)>=0?1:-1;try{P.face=ang;G.basicT=t;P.lastAtk=t}catch(_){}
  const A=HM.A={T0:t,dur:durNow(),ang,face,hit:false,jet:null,x:P.x,y:P.y};HM.swings++;return A}
function isBoss(e){try{return !!(e.m&&e.m.boss)||!!e.gateBoss}catch(_){return false}}
function isElite(e){try{return !!(e.m&&e.m.elite)||!!e.eliteX}catch(_){return false}}
function hitFn(e,pct){const hp0=e.hp,vx0=e.vx,vy0=e.vy;
  try{const A=C182.api,D=A.D(),wd=D.weapons.hammer||D.weapons.sword,basic=wd.actionCoef*wd.weights.reduce((a,b)=>a+b,0);const id='hm_basic',d={id,mode:'native',coefTotal:basic*pct/100,flatTotal:0,weights:[1],schedule:[0],maxTargets:1,targeting:'around',element:'Neutral'};
    const c=A.ctxFor('skill',id,d,{dt:'phys',lvScale:1,m0:1,reach:9999,cdId:'hmX'});hitEnemy(e,1,{dt:'phys',ctx:c,hm:1,kb:0,knk:1})}catch(er){ERR('hit',er)}
  try{if(vx0!=null&&(e.vx!==vx0||e.vy!==vy0)){e.vx=vx0;e.vy=vy0}}catch(_){}
  const d=Math.max(0,hp0-Math.max(0,e.hp));HM.hits++;HM.dmg+=d;return d}
try{const _a=applyDamage;applyDamage=function(e,d,crit,o){if(o&&o.hm){if(o.kb)o.kb=0;if(d>HM.cfg.CAP)d=HM.cfg.CAP}return _a.call(this,e,d,crit,o)}}catch(e){ERR('hook damage',e)}
/* stun rule (Balance v1) */
function tryStun(e){try{if(isBoss(e))return false;const t=time;e.st=e.st||{};if((e.st.stun||0)>0)return false;if(t<(e._hmImm||0))return false;if(Math.random()>=HM.cfg.STUN_CH)return false;
  const d=isElite(e)?HM.cfg.STUN_ELITE:HM.cfg.STUN;e.st.stun=Math.max(e.st.stun||0,d);e._hmImm=t+d+HM.cfg.STUN_IMM;HM.stuns++;stunFx(e,d);return true}catch(er){ERR('stun',er);return false}}
/* the stun visual lives in ONE function (Motion's newer impact can replace it): text + a ring over the monster */
function stunFx(e,d){try{textAt(e.x,e.y-(e.sz||16)*2.3,'สตั้น!','#d9c2ff',14,{life:.7})}catch(_){}try{ring(e.x,e.y,4,(e.sz||16)*2.2,.4,'#ffe38a',4)}catch(_){}}
HM.stunFx=stunFx;
function doHit(A){A.hit=true;const reach=HM.cfg.REACH,half=HM.cfg.ARC/2*Math.PI/180,out=[];
  for(const e of enemies){if(e.dead||!(e.hp>0))continue;const dx=e.x-P.x,dy=e.y-P.y,d=Math.hypot(dx,dy);if(d>reach+(e.sz||16)*.6)continue;
    let da=Math.atan2(dy,dx)-A.ang;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)>half&&d>(e.sz||16)*.8)continue;out.push(e)}
  const r=rNow();for(const e of out){hitFn(e,100);tryStun(e);HM.fx.push({t:time,x:e.x/r,y:(e.y-(e.sz||16)*1.2)/r})}
  try{sfx('swing','sword')}catch(_){}A.n=out.length}
function tick(dt){try{const A=HM.A;if(!A){HM.fx=HM.fx.filter(f=>time-f.t<.5);return}
  if(P.dead||!held()){HM.A=null;return}
  const el=time-A.T0;if(!A.hit&&el>=HM.cfg.HIT_T*A.dur/HM.cfg.BASE_DUR)doHit(A);
  if(el>=A.dur){HM.A=null}
  HM.fx=HM.fx.filter(f=>time-f.t<.5)}catch(e){ERR('tick',e)}}
HM.fx=[];
try{const _u=update;update=function(dt){const r0=_u.apply(this,arguments);tick(dt);return r0}}catch(e){ERR('hook update',e)}
try{const _b=basicAttack;basicAttack=function(){if(!HM.on||!held()||!window.wrPose||!img)return _b.apply(this,arguments);
  if(P.dead||P.dash||G.edit||P.casting)return;try{if(typeof stunned==='function'&&stunned())return}catch(_){}
  start()}}catch(e){ERR('hook basic',e)}
/* ---------------- drawing ---------------- */
const SCd=HM.cfg.DEMO_SC;let TH_sc=SCd;const rNow=()=>Math.max(.3,TH_sc/SCd);
function movingPose(p){const w=window.wrPose(0,(time%.6)/.6),rot=p&&p.rot,wr=w&&w.rot;if(!rot||!wr)return p;for(const k of ['arm_near','forearm_near','elbow_near','fist_near','arm_far','forearm_far','elbow_far','fist_far','sword','head'])if(wr[k]!==undefined)rot[k]=wr[k];return p}
let inDraw=false;
function hook(){const U=PU();if(!U||U._hmHook||typeof U.draw!=='function')return;U._hmHook=1;const _d=U.draw;
  U.draw=function(c,x,y,sc,fac,pose){if(!inDraw){TH_sc=sc}
    if(inDraw||!HM.on)return _d.apply(this,arguments);
    try{if(held()){if(!HM.applied&&img)applyPuppet()}else if(HM.applied)revertPuppet()}catch(e){ERR('apply',e)}
    if(!HM.applied||!held()||!window.wrPose||P.dead)return _d.apply(this,arguments);
    inDraw=true;const t0=performance.now();
    try{const A=HM.A,face=fac>0?1:-1;let p;
      if(A){const q=Math.max(0,Math.min(1,(time-A.T0)/A.dur));p=window.wrPose(1,q);HM.last={x,y,sc,face,p,q}}
      else{const mv=(Math.abs(P.vx||0)+Math.abs(P.vy||0))>5;p=mv?movingPose(pose):window.wrPose(0,(time%.6)/.6);HM.last={x,y,sc,face,p,q:0}}
      return window.drawCombo?window.drawCombo(c,x,y,sc,fac,p):_d.call(this,c,x,y,sc,fac,p)}
    finally{inDraw=false;HM.fxMs+=0}}}
setInterval(()=>{try{hook()}catch(e){ERR('hook',e)}},300);
/* FX (demo code): steam thruster along the head path + impact steam + gear ring, drawn in demo units (1 = r world px) after the characters */
function A_(a){return Math.max(0,Math.min(1,a))}
function rnd(s){var x=Math.sin(s*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function headAtA(A,tt,L){const U=PU(),q=Math.max(0,Math.min(1,(tt-A.T0)/A.dur)),p=window.wrPose(1,q),W=U.solve(p),m=W.sword,gy=U.footY(W)-(p.air||0)+(p.rootBob||0),pt=[320,200];
  const ax=m[0]*pt[0]+m[2]*pt[1]+m[4],ay=m[1]*pt[0]+m[3]*pt[1]+m[5];return [L.x+ax*SCd*(L.face>0?-1:1),L.y+(ay-gy)*SCd]}
function gearHit(cx,x,y,k){cx.save();cx.globalCompositeOperation='lighter';var g=cx.createRadialGradient(x,y,0,x,y,40);g.addColorStop(0,'rgba(255,255,240,'+(1-k)+')');g.addColorStop(1,'rgba(255,230,160,0)');cx.fillStyle=g;cx.beginPath();cx.arc(x,y,40,0,6.28);cx.fill();cx.restore();
  var R=14+34*Math.sqrt(k),n=10,a0=k*1.2;cx.save();cx.translate(x,y);cx.rotate(a0);cx.beginPath();
  for(var i=0;i<n;i++){var a=i/n*6.2832,b=(i+.5)/n*6.2832;cx.lineTo(Math.cos(a-.12)*R,Math.sin(a-.12)*R);cx.lineTo(Math.cos(a-.1)*R*1.22,Math.sin(a-.1)*R*1.22);cx.lineTo(Math.cos(a+.1)*R*1.22,Math.sin(a+.1)*R*1.22);cx.lineTo(Math.cos(a+.12)*R,Math.sin(a+.12)*R);cx.lineTo(Math.cos(b)*R,Math.sin(b)*R)}
  cx.closePath();cx.lineWidth=5*(1-k)+1;cx.strokeStyle='rgba(240,190,80,'+(1-k)+')';cx.stroke();cx.lineWidth=2;cx.strokeStyle='rgba(255,250,220,'+(1-k)+')';cx.stroke();cx.restore();
  cx.save();cx.strokeStyle='rgba(255,255,255,'+(1-k)+')';cx.lineCap='round';cx.lineWidth=3;for(var j=0;j<8;j++){var aj=j*.785+.3,r0=10+40*k,r1=r0+14*(1-k)+6;cx.beginPath();cx.moveTo(x+Math.cos(aj)*r0,y+Math.sin(aj)*r0);cx.lineTo(x+Math.cos(aj)*r1,y+Math.sin(aj)*r1);cx.stroke()}cx.restore()}
function steam(cx,A,L,t){const w=[HM.cfg.JET[0]*A.dur/HM.cfg.BASE_DUR,HM.cfg.JET[1]*A.dur/HM.cfg.BASE_DUR],a0=A.T0+w[0],a1=A.T0+w[1];
  if(!A.jet){A.jet=[];for(let tb=a0;tb<=a1;tb+=.006){const h=headAtA(A,tb,L),h0=headAtA(A,tb-.016,L),vx=h[0]-h0[0],vy=h[1]-h0[1],Ln=Math.hypot(vx,vy)||1;A.jet.push({tb,x:h[0]-vx/Ln*16,y:h[1]-vy/Ln*16,dx:-vx/Ln,dy:-vy/Ln,j:A.jet.length})}}
  cx.save();A.jet.forEach(function(J){var age=t-J.tb;if(age<0||age>.45)return;var k=age/.45,sp=420*(1-.7*k),d=sp*age,r=4+22*k+rnd(J.j)*4,side=(rnd(J.j*3)-.5)*14*k;
    var x=J.x+J.dx*d-J.dy*side,y=J.y+J.dy*d+J.dx*side-14*k*k;var g=cx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(255,255,255,'+.6*(1-k)+')');g.addColorStop(.6,'rgba(240,244,248,'+.4*(1-k)+')');g.addColorStop(1,'rgba(220,228,235,0)');cx.fillStyle=g;cx.beginPath();cx.arc(x,y,r,0,6.28);cx.fill()});cx.restore();
  var ig=a0-.03;if(t>=ig&&t<=a1+.04){const h=headAtA(A,Math.min(t,a1),L),tf=Math.max(t,a0),hA=headAtA(A,Math.min(tf,a1-.02),L),hB=headAtA(A,Math.min(tf,a1-.02)+.02,L),vx=hB[0]-hA[0],vy=hB[1]-hA[1],Ln=Math.hypot(vx,vy)||1;
    const dx=-vx/Ln,dy=-vy/Ln,nx=-dy,ny=dx,ox=h[0]+dx*18,oy=h[1]+dy*18,on=t<a0?(t-ig)/.03:(t>a1?1-(t-a1)/.04:1),fl=Math.floor(t*60),len=(130+rnd(fl)*25)*on,w0=9,w1=38*on;
    cx.save();cx.globalCompositeOperation='lighter';
    const cone=(lm,wm,col,a)=>{var g=cx.createLinearGradient(ox,oy,ox+dx*len*lm,oy+dy*len*lm);g.addColorStop(0,'rgba('+col+','+a+')');g.addColorStop(.55,'rgba('+col+','+a*.55+')');g.addColorStop(1,'rgba('+col+',0)');
      cx.fillStyle=g;cx.beginPath();cx.moveTo(ox+nx*w0*wm,oy+ny*w0*wm);cx.lineTo(ox+dx*len*lm+nx*w1*wm,oy+dy*len*lm+ny*w1*wm);cx.lineTo(ox+dx*len*lm-nx*w1*wm,oy+dy*len*lm-ny*w1*wm);cx.lineTo(ox-nx*w0*wm,oy-ny*w0*wm);cx.closePath();cx.fill()};
    cone(1,1.1,'200,215,230',.4);cone(.8,.6,'235,242,250',.8);cone(.5,.28,'255,255,255',1);
    cx.strokeStyle='rgba(255,255,255,.9)';cx.lineCap='round';
    for(var s=0;s<7;s++){var off=(rnd(fl*7+s)-.5)*1.6,st=rnd(fl*3+s)*.5,ln=.25+rnd(fl*5+s)*.35;cx.lineWidth=2+rnd(s)*2;cx.beginPath();cx.moveTo(ox+dx*len*st+nx*w1*off*st,oy+dy*len*st+ny*w1*off*st);cx.lineTo(ox+dx*len*(st+ln)+nx*w1*off*(st+ln),oy+dy*len*(st+ln)+ny*w1*off*(st+ln));cx.stroke()}
    var gg=cx.createRadialGradient(ox,oy,0,ox,oy,26);gg.addColorStop(0,'rgba(255,255,255,'+on+')');gg.addColorStop(1,'rgba(255,255,255,0)');cx.fillStyle=gg;cx.beginPath();cx.arc(ox,oy,26,0,6.28);cx.fill();cx.restore()}
  const ie=t-a0;if(ie>=0&&ie<.18&&A.jet.length){const J0=A.jet[0],k3=ie/.18;cx.save();cx.strokeStyle='rgba(255,255,255,'+.9*(1-k3)+')';cx.lineWidth=5*(1-k3)+1;cx.beginPath();cx.ellipse(J0.x,J0.y,10+50*k3,6+26*k3,Math.atan2(J0.dy,J0.dx),0,6.28);cx.stroke();cx.restore()}
  const hT=A.T0+HM.cfg.HIT_T*A.dur/HM.cfg.BASE_DUR,e=t-hT;if(e>=0&&e<.7){const hp=headAtA(A,hT,L),k2=e/.7;cx.save();for(var i=0;i<12;i++){var a=(i/12)*Math.PI*2,rr=20+170*Math.sqrt(k2)*(.6+.4*rnd(i*5)),x2=hp[0]+Math.cos(a)*rr,y2=hp[1]+Math.sin(a)*rr*.7-20*k2,r2=14+30*k2;
    var g2=cx.createRadialGradient(x2,y2,0,x2,y2,r2);g2.addColorStop(0,'rgba(255,255,255,'+.7*(1-k2)+')');g2.addColorStop(1,'rgba(230,236,240,0)');cx.fillStyle=g2;cx.beginPath();cx.arc(x2,y2,r2,0,6.28);cx.fill()}cx.restore()}}
try{const _t=drawTexts;drawTexts=function(){const r0=_t.apply(this,arguments);try{const A=HM.A,L=HM.last;if(HM.on&&held()&&L&&(A||HM.fx.length)&&window.wrPose){const t0=performance.now(),t=time,r=rNow();
    ctx.save();ctx.scale(r,r);try{if(A&&A.face===L.face){const LL={x:P.x/r,y:P.y/r,face:L.face};steam(ctx,A,LL,t)}
      for(const f of HM.fx){const k=(t-f.t)/.4;if(k>=0&&k<=1)gearHit(ctx,f.x,f.y,k)}}finally{ctx.restore()}
    HM.fxMs+=performance.now()-t0;HM.fxN++}}catch(e){ERR('fx',e)}return r0}}catch(e){ERR('hook texts',e)}
console.info('[HAMMER] hammer-r1 ready');
})();
