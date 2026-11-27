
/* ===== scythe-r1: weapon type 'scythe' (alias of the sword entries) + p298 lane 'scythe' + skill window line + ultimate Night Harvest (ราตรีเก็บเกี่ยว) ===== */
(function(){'use strict';
const SCY_ICON='assets/f3789ff64569e7ec.png';const SCY_ITEM='assets/7adb3a49d13d60e1.png';const SCY_RUNE='assets/13beb52e855b0113.png';
const TX={"mist":"assets/cdc0e8c184fb3879.png","rpA":"assets/77054a45a14f40ae.png","rpB":"assets/2ceac2cafa223217.png","rpC":"assets/f9301a896f317b98.png","rpD":"assets/20bae34cec56453c.png","rpE":"assets/a1923b35e40a99a4.png","rpF":"assets/c5f32321f927466b.png","rp1":"assets/c807627b207b69a0.png","rp2":"assets/1aef26c157fb3b50.png","rp3":"assets/12534885ea523384.png"};const TXS={"reap_sweep": [560, 304], "reap_up": [420, 368], "reap_side": [420, 224], "sl_wide": [540, 233], "sl_mid": [420, 214], "sl_thin": [320, 203], "wisp0": [120, 85], "wisp1": [110, 99], "wisp2": [60, 89], "wisp3": [76, 131], "wisp4": [170, 54], "mist": [560, 201], "rpA": [548, 376], "rpB": [459, 416], "rpC": [532, 331], "rpD": [632, 348], "rpE": [646, 326], "rpF": [454, 403], "rp1": [402, 399], "rp2": [564, 384], "rp3": [573, 371]};const FR={"A": {"eye": [349.5, 121.0], "gem": [58.0, 66.5]}, "B": {"eye": [327.5, 169.5], "gem": [215.0, 52.5]}, "C": {"eye": [325.0, 146.0], "gem": [493.5, 64.0]}, "D": {"eye": [334.5, 109.0], "gem": [573.0, 84.5]}, "E": {"eye": [400.5, 108.5], "gem": [623.5, 271.0]}, "F": {"eye": [352.5, 178.5], "gem": [370.0, 396.0]}, "1": {"eye": [275.5, 234.0], "gem": [15.5, 176.0]}, "2": {"eye": [279.5, 190.5], "gem": [447.5, 88.5]}, "3": {"eye": [298.0, 92.5], "gem": [404.0, 28.5]}};
/* ---- scythe-r1 main code (weapon type 'scythe' + skill window line + p298 lane + Night Harvest ultimate) ---- */
const Qs=location.search,offF=n=>new RegExp('[?&]'+n+'=off\\b').test(Qs);
const S=window.__SCY={ver:'scythe-r1',on:!offF('scythe'),nh:!offF('nightharvest'),dissolve:!offF('nhdissolve'),drop:/[?&]scythe=on\b/.test(Qs),err:null,phone:null,
  stats:{casts:0,hits:0,aborted:0,refused:0,fps:[],peakLayers:0,peakLayersStrict:0,peakParts:0,peakMotes:0,last:null},log:[],fx:null,aim:null};
const ERR=(w,e)=>{S.err=w+': '+((e&&e.message)||e);try{console.error('[SCY]',w,e);}catch(_){}};
/* ------------------------------------------------------------------ the numbers (one table) ------------------------------------------------------------------ */
const TBL=S.tbl={
  pct:[700,800,900,1000,1150,1250,1360,1480,1610,1780],     /* % of the basic hit per target, skill Lv1..10 (Lv1-5 usable, 6-10 locked) */
  usable:5,maxTargets:12,
  radius:[205,205,205,205,230,230,230,230,230,230],aimRange:420,
  dizzy:1.75,dizzyElite:.9,                                  /* s from the slam (normal: slam 1.15 -> hit 2.88); boss immune */
  mp:60,mpMul:[.85,.90,.95,1.0,1.05,1.10,1.15,1.20,1.25,1.30],cd:60,lock:3.0,
  heal:{base:.06,per:.015,maxN:5,cap:.14},                   /* at cast end: 6% maxHP + 1.5% per target hit (max 5 targets), cap 14% */
  ele:{undead:.25,light:1.5},                                /* dark element: undead x0.25, light mobs x1.5 */
  basic:{coef:3.1,hitsPerSec:1.2},dispCap:99999,
  minLv:30,rowLv:25,
  T:{ring:.3,slam:1.15,reap0:1.25,reap1:2.35,swing:2.55,hit:2.88,die:3.55,end:5.6,dissA:3.05,dissB:4.4}
};
const T=TBL.T;
const CD_ID='scyNH';
/* ------------------------------------------------------------------ weapon type 'scythe' (alias of the sword entries) ------------------------------------------------------------------ */
try{
  WEAPONS.scythe=Object.assign({},WEAPONS.sword,{n:'Scythe',th:'เคียว',aspd:TBL.basic.hitsPerSec});
  const al=o=>{try{if(o&&o.sword&&!o.scythe)o.scythe=o.sword;}catch(_){}};
  try{WPAL.scythe=Object.assign({},WPAL.sword,{core:'#f1e9ff',main:'#a98bff',glow:'#6a3ee0',accent:'#d9c8ff',dark:'#0e0a24',part:'wisp'});}catch(_){}
  try{WHOOSH.scythe=Object.assign({},WHOOSH.sword,{f0:2000,f1:640,dur:.18,v:.34});}catch(_){}
  for(const o of [()=>SIZE_TABLE,()=>WEAPON_CLS,()=>WCLS,()=>WSCALE,()=>COMBO_N,()=>WLEN,()=>WHAND,()=>WCLASS])try{al(o());}catch(_){}
  WNAMES.scythe=['Night Harvester','Moonreaper','Dusk Reaper'];
  try{const w=COLCMB.data.weapons;if(w&&!w.scythe)w.scythe={actionCoef:TBL.basic.coef,hits:1,weights:[1],schedule:[0],baseInterval:+(1/TBL.basic.hitsPerSec).toFixed(4),perHitCoef:TBL.basic.coef};}catch(e){ERR('combat data',e);}
  if(S.on&&S.drop&&typeof WTYPES!=='undefined'&&!WTYPES.includes('scythe'))WTYPES.push('scythe');
  {const _ic=itemIcon;itemIcon=function(it){if(it&&it.t==='scythe')return SCY_ITEM;return _ic.apply(this,arguments);};}
  {const _eq=equipItem;equipItem=function(i){try{const it=typeof i==='number'?P.inv[i]:i;if(it&&it.t==='scythe'){
      if(!S.on){notify('เคียวถูกปิดด้วย ?scythe=off');return false;}
      if((P.lvl|0)<TBL.minLv){notify('เคียวใช้ได้ตั้งแต่เลเวลตัวละคร '+TBL.minLv);return false;}}}catch(_){}return _eq.apply(this,arguments);};}
  /* basic attack of the scythe = SINGLE target (the sword's engine budget is "cone, max 8"): the locked target, else the nearest, first hit only */
  let inBasic=false,pri=null;
  {const _ba=basicAttack;basicAttack=function(){try{if(scyHeld()&&!(P.atkCd>0)&&!P.dead){const T0=window.TLOCK,lk=T0&&T0.e&&liveE(T0.e)?T0.e:null;
        enemies.sort((a,b)=>(a===lk?-1e12:Math.hypot(a.x-P.x,a.y-P.y))-(b===lk?-1e12:Math.hypot(b.x-P.x,b.y-P.y)));inBasic=true;pri=null;}}catch(_){}
    try{return _ba.apply(this,arguments);}finally{inBasic=false;pri=null;}};}
  {const _he=hitEnemy;hitEnemy=function(e,m,o){try{if(e&&!(o&&o.dot)&&scyHeld()){const c=(o&&o.ctx)||(window.C182&&C182.cur);if(c&&c.def&&c.def.id==='basic:scythe')c.def.maxTargets=1;
        if(inBasic){if(pri&&e!==pri)return 0;if(!pri)pri=e;}}}catch(_){}return _he.apply(this,arguments);};}
}catch(e){ERR('weapon alias',e);}
S.give=function(rar,lvl){
  if(!S.on)return null;
  try{const L=Math.max(TBL.minLv,lvl||(P.lvl|0)),it=makeWeapon('scythe',L,rar==null?2:rar);it.sc=1;addItemTo(P,it);if(P.inv.indexOf(it)<0)P.inv.push(it);try{if(G.win==='wInv')renderInv();}catch(_){}return it;}catch(e){ERR('give',e);return null;}};
/* ------------------------------------------------------------------ helpers ------------------------------------------------------------------ */
const clamp=(v,a,b)=>v<a?a:v>b?b:v,ease=x=>1-Math.pow(1-clamp(x,0,1),3),seg=(t,a,b)=>clamp((t-a)/(b-a),0,1),rnd=(a,b)=>a+Math.random()*(b-a);
const lerp=(a,b,u)=>a+(b-a)*u,hash=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s)};
const liveE=e=>!!e&&!e.dead&&e.hp>0&&!e.sprGhost;
const isBossE=e=>!!(e&&e.m&&(e.m.boss||e.m.raid));
const isEliteE=e=>!!(e&&((e.m&&e.m.elite)||e.eliteX));
const phone=()=>{if(S.phone!=null)return !!S.phone;try{return !!(TOUCH&&TOUCH.on);}catch(_){return false;}};
const scyHeld=()=>!!(P&&P.weapon&&P.weapon.t==='scythe');
const lvNow=()=>{try{const v=window.__SKUP&&__SKUP.lv?(__SKUP.lv('scy_nh')|0):0;return clamp(v||1,1,TBL.usable);}catch(_){return 1;}};
const mpFor=lv=>Math.round(TBL.mp*TBL.mpMul[clamp(lv,1,10)-1]);
const cdFor=()=>{try{const c=clamp(B('cdr'),0,.7);return TBL.cd*(1-c);}catch(_){return TBL.cd;}};
const toast=m=>{try{textAt(P.x,P.y-62,m,'#d8c9ff',13);}catch(_){}};
const VIO='#8a5cff',VL2='#c9a8ff',PK='#d8a0ff';
function mk(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c}
const GL={};function glowS(col){return GL[col]||(GL[col]=mk(64,64,g=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,col);r.addColorStop(.3,col+'bb');r.addColorStop(1,col+'00');g.fillStyle=r;g.fillRect(0,0,64,64)}))}
const DUST2=mk(64,64,g=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(40,30,70,.9)');r.addColorStop(.6,'rgba(34,26,60,.4)');r.addColorStop(1,'rgba(30,20,50,0)');g.fillStyle=r;g.fillRect(0,0,64,64)});
const MOON=mk(170,170,g=>{const gl=g.createRadialGradient(85,85,10,85,85,85);gl.addColorStop(0,'rgba(190,170,255,.45)');gl.addColorStop(1,'rgba(120,90,220,0)');g.fillStyle=gl;g.fillRect(0,0,170,170);
  g.fillStyle='#ece8ff';g.beginPath();g.arc(85,85,44,0,6.283);g.fill();g.globalCompositeOperation='destination-out';g.beginPath();g.arc(105,72,40,0,6.283);g.fill()});
const RUNE_IMG=new Image();let RUNE_OK=false;RUNE_IMG.onload=()=>{RUNE_OK=true};RUNE_IMG.src=SCY_RUNE;
const RUNE_T={};function runeTint(col){if(RUNE_T[col])return RUNE_T[col];if(!RUNE_OK)return null;return RUNE_T[col]=mk(64*12,64,g=>{g.drawImage(RUNE_IMG,0,0);g.globalCompositeOperation='source-in';g.fillStyle=col;g.fillRect(0,0,64*12,64)})}
const TXI={};for(const k in TX){const i=new Image();i.src=TX[k];TXI[k]=i}
const TXOK=()=>{for(const k in TXI)if(!(TXI[k].complete&&TXI[k].naturalWidth))return false;return true};
const F2={};function faded2(n){return F2[n]||(F2[n]=(()=>{const im=TXI[n],c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;c.getContext('2d').drawImage(im,0,0);return c})())}
const DS=1.2;
let cx=null;   /* current drawing context (the game's ctx, or the offscreen mask while the reaper dissolves) */
const dW=(n,x,y,w)=>{const i=TXI[n],h=w*TXS[n][1]/TXS[n][0];cx.drawImage(i,x-w/2,y-h/2,w,h)};
/* ------------------------------------------------------------------ particles ------------------------------------------------------------------ */
let PT=[],MOTES=[],mLast=0;
const Qn=()=>phone()?.5:1;
const pcap=()=>Math.round(120*(phone()?.6:1)),mcap=()=>phone()?80:170;
function addP(p){if(PT.length>=pcap())return;p.age=0;p.vx=p.vx||0;p.vy=p.vy||0;p.g=p.g||0;p.rot=p.rot||0;p.vr=p.vr||0;p.drag=p.drag||0;p.ox=p.ox||0;p.oy=p.oy||0;PT.push(p)}
function stepP(dt){for(const p of PT){p.age+=dt;p.vx*=1-p.drag*dt;p.vy=p.vy*(1-p.drag*dt)+p.g*dt;p.ox+=p.vx*dt;p.oy+=p.vy*dt;p.rot+=p.vr*dt;if(p.floor!=null&&p.oy>p.floor){p.oy=p.floor;p.vy*=-.2;p.vx*=.5;p.vr*=.4}}PT=PT.filter(p=>p.age<p.life)}
/* a particle is anchored at a world point (wx,wy); ox/oy are billboard-pixel offsets from it (bb() local units = screen px at zoom 1) */
function drawParticle(p){const u=p.age/p.life,fi=p.fin?seg(p.age,0,p.fin):1,a=fi*(1-Math.max(0,u-(p.hold||.5))/(1-(p.hold||.5)));if(a<=0)return;
  const al=clamp(a*(p.a||1),0,1);
  if(p.k==='ring'&&!p.flat){ /* ground ring: world circle, the camera tilt squashes it */
    const r=p.s*(.3+.7*ease(u));cx.save();cx.translate(p.wx,p.wy);cx.globalAlpha=al;cx.strokeStyle=p.col;cx.lineWidth=p.w*(1-u);cx.beginPath();cx.arc(0,0,r,0,6.283);cx.stroke();cx.restore();return;}
  bb(p.wx,p.wy,()=>{const X=p.wx+p.ox,Y=p.wy+p.oy;cx.save();cx.globalAlpha=al;
    if(p.k==='dust'){const s=p.s*(1+u*1.2);cx.globalAlpha*=.5;cx.drawImage(DUST2,X-s,Y-s*.6,s*2,s*1.2)}
    else if(p.k==='rock'){cx.translate(X,Y);cx.rotate(p.rot);cx.fillStyle=p.col||'#3a2c20';cx.beginPath();cx.moveTo(-p.s/2,-p.s/3);cx.lineTo(p.s/2,-p.s/2);cx.lineTo(p.s*.4,p.s/3);cx.lineTo(-p.s*.3,p.s/2);cx.closePath();cx.fill()}
    else if(p.k==='ring'){cx.translate(X,Y);const r=p.s*(.3+.7*ease(u));cx.strokeStyle=p.col;cx.lineWidth=p.w*(1-u);cx.beginPath();cx.arc(0,0,r,0,6.283);cx.stroke()}
    else if(p.k==='flash'){const sz=70+110*u;cx.globalCompositeOperation='lighter';cx.globalAlpha=(1-u)*.3;cx.drawImage(glowS(VL2),X-sz,Y-sz*.6,sz*2,sz*1.2);cx.globalAlpha=(1-u)*.12;cx.drawImage(glowS('#ffffff'),X-sz*.4,Y-sz*.3,sz*.8,sz*.6)}
    else{cx.globalCompositeOperation='lighter';cx.drawImage(glowS(p.col||VL2),X-p.s/2,Y-p.s/2,p.s,p.s)}
    cx.restore();});}
/* ------------------------------------------------------------------ geometry / rings (world coordinates, K = 1: the camera tilt squashes them) ------------------------------------------------------------------ */
function runeRing(x,y,r,col,a,rot,n,grow){if(a<=0||r<=4)return;n=n||Math.max(14,Math.round(r/7.5));grow=grow==null?1:grow;const bw=Math.max(12,r*.12),gs=bw*1.15,img=runeTint(col);
  const st=Math.max(.5,Math.min(1.6,.8/Math.max(.5,camT())));   /* glyph stretch: demo 1.6 x K 0.5 = 0.8 net */
  cx.save();cx.translate(x,y);cx.globalAlpha=a;cx.strokeStyle=col;
  cx.lineWidth=2;cx.beginPath();cx.arc(0,0,r+bw*.62,0,6.283);cx.stroke();cx.lineWidth=1.4;cx.beginPath();cx.arc(0,0,r-bw*.62,0,6.283);cx.stroke();
  cx.save();cx.globalCompositeOperation='lighter';cx.globalAlpha=a*.14;cx.lineWidth=bw*1.3;cx.beginPath();cx.arc(0,0,r,0,6.283);cx.stroke();cx.restore();
  cx.save();cx.globalAlpha=a*.28;cx.strokeStyle='#0c0a14';cx.lineWidth=bw*1.1;cx.beginPath();cx.arc(0,0,r,0,6.283);cx.stroke();cx.restore();
  if(img)for(let i=0;i<n;i++){if(i/n>grow)break;const an=i/n*6.283+(rot||0),gi=Math.floor(hash(i*3.7)*12);cx.save();cx.rotate(an);cx.translate(r,0);cx.rotate(Math.PI/2);cx.scale(1,st);cx.drawImage(img,gi*64,0,64,64,-gs/2,-gs/2,gs,gs);cx.globalCompositeOperation='lighter';cx.globalAlpha=a*.45;cx.drawImage(img,gi*64,0,64,64,-gs/2,-gs/2,gs,gs);cx.restore()}
  cx.restore()}
function band(pts,wf,col,a){if(pts.length<2||a<=0)return;const L2=[],R2=[];for(let i=0;i<pts.length;i++){const p0=pts[Math.max(0,i-1)],p1=pts[Math.min(pts.length-1,i+1)],dx=p1[0]-p0[0],dy=p1[1]-p0[1],l=Math.hypot(dx,dy)||1,w=wf(pts[i][2])/2;L2.push([pts[i][0]-dy/l*w,pts[i][1]+dx/l*w]);R2.push([pts[i][0]+dy/l*w,pts[i][1]-dx/l*w])}
  cx.save();cx.globalAlpha=a;cx.fillStyle=col;cx.beginPath();cx.moveTo(L2[0][0],L2[0][1]);for(const q of L2)cx.lineTo(q[0],q[1]);for(let i=R2.length-1;i>=0;i--)cx.lineTo(R2[i][0],R2[i][1]);cx.closePath();cx.fill();cx.restore()}
/* ------------------------------------------------------------------ demo timeline curves ------------------------------------------------------------------ */
const SW_P=.65,SW_D=.6,TS0=T.swing,TH0=T.hit;
let t=0;   /* effect clock of the running cast */
const swAmt=()=>ease(seg(t,TS0-.55,TS0-.05));
const lunge=()=>Math.sin(Math.PI*clamp(seg(t,TS0,TS0+SW_D),0,1));
const presence=()=>ease(seg(t,T.reap0,T.reap1))*(1-ease(seg(t,4.3,4.5)));
const nightAmt=()=>ease(seg(t,.4,1.5))*(1-seg(t,4.0,5.4));
let LS=new Set();const LAY=n=>LS.add(n);
/* ---- sky: deep violet dim, moon, a few stars (screen space, transform reset) ---- */
function skyDraw(){const d=nightAmt()*.68;if(d<=0)return;const Wd=W,Hd=H;LAY('sky');ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  ctx.fillStyle='rgba(14,8,46,'+d+')';ctx.fillRect(0,0,Wd,Hd);
  const ma=ease(seg(t,.5,1.4))*(1-seg(t,4.0,5.4)),sc=clamp(Wd/900,.8,1.3);if(ma>0){ctx.globalAlpha=ma;ctx.drawImage(MOON,Wd*.30-75*sc,50*sc,150*sc,150*sc);ctx.globalAlpha=1}
  ctx.fillStyle='#e8e4ff';for(let i=0;i<22;i++){const x=hash(i*3.1)*Wd,y=50+hash(i*7.7)*200*sc;ctx.globalAlpha=d*(.35+.45*Math.sin(t*2+i*1.7));ctx.fillRect(x,y,2,2)}ctx.restore()}
/* ---- ground: V7 rune band around the hero, breathing mist ring, low mist (world, flat) ---- */
const UR=250;
function groundFx(F){const a=ease(seg(t,T.ring,T.ring+.5))*(1-seg(t,3.9,5.1));if(a<=0||!TXOK())return;LAY('ground');const hx=F.hx,hy=F.hy;
  cx.save();cx.globalAlpha=1;cx.globalCompositeOperation='source-over';
  runeRing(hx,hy,UR*.92,VL2,a*.22,t*.25,0,ease(seg(t,T.ring,T.ring+.8)));
  const g=ease(seg(t,T.ring,T.ring+.9)),w=UR*2*g,br=1+.03*Math.sin(t*2.2);
  cx.globalCompositeOperation='lighter';cx.globalAlpha=a*.55;dwFlat('mist',hx,hy,w*br);cx.globalAlpha=a*.3;dwFlat('mist',hx,hy,w*.82/br);cx.globalCompositeOperation='source-over';
  const nF=Math.round(12*Qn());for(let i=0;i<nF;i++){const th=hash(i)*6.283+t*(.1+.05*(i%3))*(i%2?1:-1),r=Math.sqrt(hash(i*2.3))*UR*.95*g,sz=60+hash(i*5)*50;cx.globalAlpha=a*.42*(.6+.4*Math.sin(t*.9+i));cx.drawImage(DUST2,hx+Math.cos(th)*r-sz,hy+Math.sin(th)*r-sz*.56,sz*2,sz*1.12)}
  cx.restore()}
function dwFlat(n,x,y,w){const i=TXI[n],h=w*TXS[n][1]/TXS[n][0]*2;cx.drawImage(i,x-w/2,y-h/2,w,h)}   /* the mist art is pre-flattened (K 0.5): stretch x2 on the ground plane, the camera squashes it again */
function slamCracks(F){const a=seg(t,T.slam,T.slam+.2)*(1-seg(t,1.7,2.4));if(a<=0)return;const fx0=F.hx,fy0=F.hy+4,g=ease(seg(t,T.slam,T.slam+.25));LAY('cracks');cx.save();cx.translate(fx0,fy0);cx.lineCap='round';cx.lineJoin='round';cx.globalCompositeOperation='source-over';
  for(let pass=0;pass<2;pass++){cx.strokeStyle=pass?'#e6d8ff':'#6a35d0';cx.lineWidth=pass?3.2:11;cx.globalAlpha=a*(pass?.9:.5);cx.beginPath();for(let i=0;i<9;i++){const an=i/9*6.283+hash(i)*.4,L0=(110+hash(i*3)*150)*g;cx.moveTo(0,0);for(let k=1;k<=5;k++){const r=L0*k/5,j=(hash(i*7+k)-.5)*.5;cx.lineTo(Math.cos(an+j)*r,Math.sin(an+j)*r)}}cx.stroke()}
  cx.globalCompositeOperation='lighter';cx.globalAlpha=a*.7*(1-seg(t,1.2,1.5));cx.drawImage(glowS(VL2),-90,-90,180,180);cx.restore()}
function areaRing(F){const a=Math.max(.45*seg(t,0,.05),ease(seg(t,0,.4)))*(1-ease(seg(t,3.2,3.8)));if(a<=0||!TXOK())return;const RA=F.rad,pu=1+.025*Math.sin(t*3),hit=Math.exp(-Math.max(0,t-TH0)*6)*(t>=TH0?1:0),sl=t>=T.slam?1:.55;
  cx.save();cx.translate(F.ax,F.ay);cx.globalCompositeOperation='lighter';const gr=cx.createRadialGradient(0,0,RA*.2,0,0,RA);gr.addColorStop(0,'rgba(120,70,220,0)');gr.addColorStop(.8,'rgba(140,90,255,'+(.10*a*(sl+hit))+')');gr.addColorStop(1,'rgba(170,120,255,'+(.3*a*(sl+hit))+')');cx.fillStyle=gr;cx.beginPath();cx.arc(0,0,RA*pu,0,6.283);cx.fill();
  cx.lineWidth=2.5;cx.strokeStyle='#c9a8ff';cx.globalAlpha=a*(.5+.4*hit)*sl;cx.beginPath();cx.arc(0,0,RA*pu,0,6.283);cx.stroke();cx.restore();
  cx.save();cx.globalCompositeOperation='source-over';runeRing(F.ax,F.ay,RA*.93,VL2,a*(.45+.35*hit),t*.25,0,ease(seg(t,0,.5)));cx.restore();LAY('area')}
/* ---- the giant translucent reaper (billboard behind the hero) + arc trail + dissolve ---- */
const PV=[10,70],PL=[0,1,2,3,4,5].map(k=>{const F=FR['ABCDEF'[k]],x=(F.gem[0]-F.eye[0])*DS-PV[0],y=(F.gem[1]-F.eye[1])*DS-PV[1];return[Math.atan2(y,x),Math.hypot(x,y)]});
for(let k=1;k<6;k++)while(PL[k][0]<PL[k-1][0])PL[k][0]+=6.2832;
const angAt=f=>{f=Math.min(5,f);const k=Math.min(4,Math.floor(f));return lerp(PL[k][0],PL[k+1][0],f-k)};
const fk=tt=>{const p0=(tt-TS0)/SW_P;if(p0<0)return 0;if(p0>=.86)return 5.0;const p=p0-Math.floor(p0);const K=[[0,0],[.12,1],[.27,2],[.38,3],[.5,4],[.64,5],[1,5]];for(let q=0;q<6;q++)if(p<=K[q+1][0]){const u=(p-K[q][0])/(K[q+1][0]-K[q][0]);return K[q][1]+(K[q+1][1]-K[q][1])*(q===0?u*u:u)}return 4};
let OC=null,SMC=null,SMX=null;
function reaperDraw(F){const p=presence();if(p<=0||!TXOK())return;LAY('reaper');const sa=swAmt(),lg=lunge(),C0={x:F.hx,y:F.hy};
  const rx=C0.x+80+lg*40,ry=C0.y-150-(1-ease(seg(t,T.reap0,T.reap1)))*190+Math.sin(t*1.7)*6+lg*30;
  const real=ctx;cx=real;
  real.save();real.globalAlpha=1;real.globalCompositeOperation='source-over';
  /* faint light shafts behind */
  real.save();real.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const sx=rx-110+i*110+Math.sin(t*.7+i)*10,a0=.1*p;real.save();real.translate(sx,ry+85);real.scale(.11,1);const gr=real.createRadialGradient(0,0,0,0,0,145);gr.addColorStop(0,'rgba(150,110,255,'+a0+')');gr.addColorStop(1,'rgba(150,110,255,0)');real.fillStyle=gr;real.fillRect(-146*9,-146,146*18,292);real.restore()}real.restore();
  {const hx0=C0.x+160+lg*40,hy0=ry-70,g2=2*ease(seg(t,T.reap0,T.reap1)),a0=Math.min(1,Math.floor(g2)),m0=g2-a0,seq=['1','2','3'];
   for(const[k,wt]of[[a0,1-m0],[Math.min(2,a0+1),m0]]){if(wt<.02)continue;const nm='rp'+seq[k],e=FR[seq[k]].eye;real.save();real.globalAlpha=p*.95*(1-sa)*wt;{const im=faded2(nm),br=1+.014*Math.sin(t*2.3),sw=Math.sin(t*1.3)*.02;real.translate(hx0,hy0);real.rotate(sw);real.drawImage(im,-e[0]*DS*br,-e[1]*DS*br+Math.sin(t*1.7)*4,im.width*DS*br,im.height*DS*br)}real.restore()}}
  if(sa>0){const hx=C0.x+160+lg*40,hy=ry-70;
    const drawF=(f,al)=>{const a=Math.floor(f)%6,b=(a+1)%6,m=ease(clamp((f-Math.floor(f)-.42)/.16,0,1)),L2=[[a,m<.5?1:(1-m)*2],[b,Math.min(1,m*2)]];for(const[i2,wt]of L2){if(wt<.02)continue;const nm='rp'+'ABCDEF'[i2],e=FR['ABCDEF'[i2]].eye;cx.save();cx.globalAlpha=al*wt;{const im=faded2(nm),d2=DS*(i2===5?.86:1),dl=clamp((angAt(f)-PL[i2][0])*.7,-.4,.4),px=hx,py=hy;const hold=seg(t,TS0+SW_P*.9,TS0+SW_P*1.3),kk=(t>TH0?Math.exp(-(t-TH0)*9):0);cx.translate(px,py+hold*Math.sin(t*2.2)*5);cx.rotate(dl+hold*(Math.sin(t*2.9)*.018-kk*.012));cx.translate(-px,-py);cx.drawImage(im,hx-e[0]*d2,hy-e[1]*d2,im.width*d2,im.height*d2)};cx.restore()}};
    const f0=fk(t),D=seg(t,T.dissA,T.dissB);
    if(D<=0)drawF(f0,p*.95*sa);
    else if(!S.dissolve){const fa=1-ease(D);if(fa>0){cx=real;drawF(f0,p*.95*sa*fa)}}   /* ?nhdissolve=off: plain fade */
    else{const cvs=real.canvas;if(!OC||OC.width!==cvs.width||OC.height!==cvs.height){OC=document.createElement('canvas');OC.width=cvs.width;OC.height=cvs.height}
      const oc=OC.getContext('2d'),tf=real.getTransform();oc.setTransform(1,0,0,1,0,0);oc.globalCompositeOperation='source-over';oc.globalAlpha=1;oc.clearRect(0,0,OC.width,OC.height);oc.setTransform(tf);
      cx=oc;drawF(f0,p*.95*sa);cx=real;LAY('dissolve');
      const cutY=hy-430+D*520,fe=70;oc.globalCompositeOperation='destination-out';const gg=oc.createLinearGradient(0,cutY,0,cutY+fe);gg.addColorStop(0,'rgba(0,0,0,1)');gg.addColorStop(1,'rgba(0,0,0,0)');
      for(let sx=hx-460;sx<hx+460;sx+=6){const off=(Math.sin(sx*.045+1.3)*34+Math.sin(sx*.13+t*3)*22+(hash((sx/6)|0)-.5)*14);oc.save();oc.translate(0,off);oc.fillStyle='#000';oc.fillRect(sx,hy-1200,6,cutY-(hy-1200));oc.fillStyle=gg;oc.fillRect(sx,cutY,6,fe);oc.restore()}
      const fl=Math.floor(t*10),nh=Math.round(28*(phone()?.6:1));for(let k=0;k<nh;k++){const cx2=hx-440+hash(k*7.1+fl*.37)*880,cy2=cutY+fe*.6+hash(k*3.3+fl*.71)*190*Math.min(1,D*3),rr=3+Math.pow(hash(k*5.9+fl),2)*24,pts=[];for(let v=0;v<11;v++){const an=v/11*6.283,rv=rr*(.35+hash(k*13+v*3.1+fl)*1.1)*(v%2?.7:1.15);pts.push([cx2+Math.cos(an)*rv,cy2+Math.sin(an)*rv])}
        const path=()=>{oc.beginPath();pts.forEach((q,v)=>v?oc.lineTo(q[0],q[1]):oc.moveTo(q[0],q[1]));oc.closePath()};
        oc.globalCompositeOperation='source-atop';oc.strokeStyle='rgba(138,77,255,.8)';oc.lineWidth=9;oc.lineJoin='round';path();oc.stroke();oc.strokeStyle='#d9c4ff';oc.lineWidth=3;path();oc.stroke();
        oc.globalCompositeOperation='destination-out';oc.fillStyle='#000';path();oc.fill()}
      oc.globalCompositeOperation='source-over';
      real.save();real.setTransform(1,0,0,1,0,0);real.globalAlpha=1;real.globalCompositeOperation='source-over';real.drawImage(OC,0,0);real.restore();
      if(D>0&&D<1&&!F.frozenMotes){if(!SMC){SMC=document.createElement('canvas');SMC.width=56;SMC.height=40;SMX=SMC.getContext('2d',{willReadFrequently:true})}
        const W2=56,H2=40;SMX.clearRect(0,0,W2,H2);SMX.drawImage(OC,0,0,OC.width,OC.height,0,0,W2,H2);const px=SMX.getImageData(0,0,W2,H2).data,inv=tf.inverse(),n=Math.round(26*Qn());
        for(let q=0,tries=0;q<n&&tries<60;tries++){const cx0=(Math.random()*W2)|0,cy0=(Math.random()*H2)|0;if(px[(cy0*W2+cx0)*4+3]<50)continue;const X=(cx0+.5)/W2*OC.width,Y=(cy0+.5)/H2*OC.height,wx=inv.a*X+inv.c*Y+inv.e,wy=inv.b*X+inv.d*Y+inv.f;if(Math.abs(wy-cutY)>110)continue;q++;
          if(MOTES.length<mcap()&&F.dt>0)MOTES.push({x:wx,y:wy,vx:rnd(-20,35),vy:-rnd(30,90),s:rnd(12,28),t0:t,life:rnd(.9,1.5),ph:rnd(0,6.28),c:Math.random()<.35?'w':'v'})}}}
    /* blade-tip trail + gem glow */
    const a=Math.floor(f0)%6,b=(a+1)%6,m=f0-Math.floor(f0),ga=FR['ABCDEF'[a]],gb=FR['ABCDEF'[b]];
    const gx=hx+((ga.gem[0]-ga.eye[0])*(1-m)+(gb.gem[0]-gb.eye[0])*m)*DS,gy=hy+((ga.gem[1]-ga.eye[1])*(1-m)+(gb.gem[1]-gb.eye[1])*m)*DS;
    {const gemAt=tt=>{const f=Math.min(5,fk(tt)),k=Math.min(4,Math.floor(f)),m2=f-k,an=lerp(PL[k][0],PL[k+1][0],m2),rr=lerp(PL[k][1],PL[k+1][1],m2)*.92;return[hx+PV[0]+Math.cos(an)*rr,hy+PV[1]+Math.sin(an)*rr]};
     const p0=(t-TS0)/SW_P;if(p0>=0&&p0<1){const cs=TS0+Math.floor(p0)*SW_P,ph=p0-Math.floor(p0),al=sa*ease(seg(ph,.1,.22))*(1-ease(seg(ph,.58,.97))),t0=Math.max(t-.2,cs+.02);
      if(al>0&&t-t0>.03){const pts=[];for(let i=0;i<=28;i++){const tt=lerp(t0,t,i/28),gg2=gemAt(tt);pts.push([gg2[0],gg2[1],i/28])}LAY('trail');
       real.save();real.globalCompositeOperation='lighter';band(pts,f=>lerp(4,100,f*f),'#8a4dff',al*.55);band(pts,f=>lerp(3,48,f*f),'#c9a8ff',al*.7);band(pts,f=>lerp(0,14,f),'#ffffff',al*.8);real.restore()}}}
    real.save();real.globalCompositeOperation='lighter';real.globalAlpha=.55*sa;real.drawImage(glowS(VL2),gx-60,gy-60,120,120);real.globalAlpha=.22*sa;real.drawImage(glowS(PK),gx-28,gy-28,56,56);real.restore()}
  real.restore();cx=real;
  {const dis=seg(t,3.0,3.4)*(1-seg(t,4.2,4.5));if(F.dt>0&&Math.random()<(.2+.9*dis)*Qn())addP({k:'s',wx:C0.x,wy:C0.y,ox:rx-C0.x+rnd(-170,170),oy:ry-C0.y+rnd(40,190),s:rnd(14,26),col:VIO,vy:-rnd(20,70)*(1+dis),vx:rnd(-30,10),life:rnd(.8,1.3),a:.5*Math.max(.35,p)})}}
function motesDraw(F){if(t<mLast-.01)MOTES=[];const dt=Math.min(.05,Math.max(0,t-mLast));mLast=t;if(!MOTES.length)return;LAY('motes');
  bb(F.hx,F.hy,()=>{cx.save();cx.globalCompositeOperation='lighter';
    MOTES=MOTES.filter(m=>{const u=(t-m.t0)/m.life;if(u>=1)return false;m.x+=(m.vx+Math.sin(t*3+m.ph)*18)*dt;m.y+=m.vy*dt;m.vy*=.985;const a=Math.sin(Math.min(1,u)*3.1416)*(.7+.3*Math.sin(t*14+m.ph));cx.globalAlpha=a*.8;const sz=m.s*(1-.5*u);cx.drawImage(glowS(m.c==='w'?'#c9a0ff':'#9a55ff'),m.x-sz,m.y-sz,sz*2,sz*2);if(m.c==='v'){cx.globalAlpha=a*.35;cx.drawImage(glowS('#e8d6ff'),m.x-sz*.3,m.y-sz*.3,sz*.6,sz*.6)}return true});cx.restore()})}
/* dizzy stars over the monsters stunned by the slam */
function stars(F){for(const d of F.dz){const e=d.e;if(!liveE(e)&&!e.dead)continue;const until=d.until;if(t<=T.slam||t>until)continue;const g=ease(seg(t,T.slam,T.slam+.2))*(1-seg(t,until-.12,until));if(g<=0)continue;
    bb(e.x,e.y,()=>{cx.save();cx.globalAlpha=g;cx.globalCompositeOperation='source-over';const hy2=e.y-(e.sz||16)*2.6;for(let j=0;j<3;j++){const a=t*4+j*2.094+e.x,sx=e.x+Math.cos(a)*15,sy=hy2+Math.sin(a)*5;cx.fillStyle=j%2?'#ffe9a8':'#fff6d6';cx.beginPath();for(let v=0;v<10;v++){const rr=v%2?3.6:8,an=v*.628-1.57;cx.lineTo(sx+Math.cos(an)*rr,sy+Math.sin(an)*rr)}cx.closePath();cx.fill()}cx.restore()})}}
/* placeholder hero pose (raise / slam): the scythe art held overhead, then planted in the ground (the real 3D pose is a later job) */
const ITEM_IMG=new Image();ITEM_IMG.src=SCY_ITEM;
function heroProp(F){if(F.nhc)return;const up=ease(seg(t,.45,.98))*(1-ease(seg(t,1.04,1.15)));const sl=ease(seg(t,1.1,1.2))*(1-ease(seg(t,1.7,2.4)));const hold=up>0||sl>0;if(!hold||!ITEM_IMG.naturalWidth)return;
  bb(P.x,P.y,()=>{cx.save();cx.globalAlpha=1;cx.translate(P.x+14,P.y-44-up*34+sl*30);const ang=lerp(.7,-1.15,up)*(1-sl)+sl*1.2;cx.rotate(ang);const w=96;cx.drawImage(ITEM_IMG,-w*.18,-w*.2,w,w*ITEM_IMG.naturalHeight/ITEM_IMG.naturalWidth);cx.restore()})}
/* ------------------------------------------------------------------ the effect engine ------------------------------------------------------------------ */
function dmgCtx(e,pct){const A=C182.api,wd=A.D().weapons.scythe||A.D().weapons.sword,basic=wd.actionCoef*wd.weights.reduce((a,b)=>a+b,0);
  let ea=1;try{const X=mobInfo(e);if(X.race==='undead'||X.ele==='undead')ea=TBL.ele.undead;else if(X.ele==='holy'||e.elem==='Light')ea=TBL.ele.light;}catch(_){}
  const def={id:'scy_nh',mode:'native',coefTotal:basic*pct/100*ea,flatTotal:0,weights:[1],schedule:[0],maxTargets:1,targeting:'around',element:'Neutral'};
  return {ctx:A.ctxFor('skill','scy_nh',def,{dt:'phys',lvScale:1,m0:1,reach:9999,cdId:CD_ID}),ea};}
function inArea(F,lim){const L=[];for(const e of enemies){if(!liveE(e))continue;const d=Math.hypot(e.x-F.ax,e.y-F.ay);if(d<=F.rad+(e.sz||0)*.5)L.push({e,d});}L.sort((a,b)=>a.d-b.d);return L.slice(0,lim||TBL.maxTargets).map(o=>o.e);}
function startCast(ax,ay,force){
  const why=S.ready(force);if(why){S.stats.refused++;toast('ราตรีเก็บเกี่ยว: '+why);return false;}
  const lv=lvNow(),rad=TBL.radius[lv-1],pct=TBL.pct[lv-1];
  let dx=ax-P.x,dy=ay-P.y;const dl=Math.hypot(dx,dy);if(dl>TBL.aimRange){dx*=TBL.aimRange/dl;dy*=TBL.aimRange/dl;}
  const mp=mpFor(lv);
  if(!force){P.mp-=mp;P.cds[CD_ID]=cdFor();}
  S.aim=null;hideHint();
  const F=S.fx={t0:time,hx:P.x,hy:P.y,ax:P.x+dx,ay:P.y+dy,rad,lv,pct,mp,done:{},dz:[],dying:[],hit:[],dt:0,frames:[],zone:G.zone,dprOld:null,frozenMotes:false};
  t=0;mLast=0;PT=[];MOTES=[];LS=new Set();
  try{if(DPR>1.25){F.dprOld=DPR;DPR=1.25;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);vignette=null;}}catch(_){}
  S.stats.casts++;S.stats.peakLayers=0;
  try{P.face=Math.atan2(F.ay-P.y,F.ax-P.x);}catch(_){}try{F.nhc=!!(window.__NHCAST&&window.__NHCAST.on);if(F.nhc)window.__NHCAST.begin(F,P.face);}catch(e){ERR('nhcast',e);F.nhc=false;}
  try{sfx('cast','void');}catch(_){}
  S.log.push('cast lv'+lv+' pct'+pct+' rad'+rad+' @'+Math.round(F.ax)+','+Math.round(F.ay));
  return true;}
function slam(F){try{if(F.nhc)window.__NHCAST.mark(F,'slam');}catch(_){}
  try{shake(9);}catch(_){}
  const fx0=F.hx,fy0=F.hy+6;
  addP({k:'ring',wx:fx0,wy:fy0,s:380,w:18,col:'#9b6bff',life:.85,a:.9});addP({k:'ring',wx:fx0,wy:fy0,s:260,w:8,col:'#ffffff',life:.6,a:.8});addP({k:'ring',wx:fx0,wy:fy0,s:150,w:12,col:PK,life:.5,a:.8});
  const nd=Math.round(14*Qn()),nr=Math.round(16*Qn());
  for(let q=0;q<nd;q++){const an=rnd(0,6.283),sp=rnd(120,320);addP({k:'dust',wx:fx0,wy:fy0,ox:Math.cos(an)*30,oy:Math.sin(an)*10,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp*.35-20,s:rnd(22,38),life:rnd(.6,1),hold:.3,a:.6})}
  for(let q=0;q<nr;q++){const an=rnd(-2.9,-.25),sp=rnd(180,460);addP({k:'rock',wx:fx0,wy:fy0,ox:rnd(-40,40),vx:Math.cos(an)*sp,vy:Math.sin(an)*sp,g:620,s:rnd(5,11),vr:rnd(-12,12),life:rnd(.6,1),hold:.3,col:'#2a2036'})}
  /* dizzy: every monster in the area (max 12 nearest); boss immune, elite short */
  let nb=0;
  for(const e of inArea(F)){
    if(isBossE(e)){nb++;try{textAt(e.x,e.y-(e.sz||16)*2.5,'IMMUNE','#a9b4c8',11,{life:.7});}catch(_){}continue;}
    const el=isEliteE(e),sec=el?TBL.dizzyElite:TBL.dizzy;
    try{e.st=e.st||{};e.st.stun=Math.max(e.st.stun||0,sec);e.wind=0;}catch(_){}
    F.dz.push({e,until:T.slam+sec,elite:el});}
  F.bossImmune=nb;}
function doHit(F){try{if(F.nhc)window.__NHCAST.mark(F,'hit');}catch(_){}
  const A=C182.api,tg=inArea(F);F.hit=[];const dm=[];
  try{shake(15);}catch(_){}
  const cap=COLCMB.CFG&&COLCMB.CFG.dmg,cap0=cap&&cap.cap;
  /* display cap 99,999 on the number that is shown (= after the game's (30/L)^2 compression, p323): raw cap = 99,999 / c(L) */
  let cmp=1;try{if(window.COMP30&&COMP30.on&&COMP30.c)cmp=COMP30.c(P.lvl|0)||1;}catch(_){}
  const rawCap=Math.round(TBL.dispCap/cmp);F.rawCap=rawCap;
  for(const e of tg){
    const hp0=e.hp,BIG=1e12;let dmg=0,lethal=false,boss=isBossE(e),er=null;
    try{const {ctx:c,ea}=dmgCtx(e,F.pct);if(cap)cap.cap=rawCap;e.hp=hp0+BIG;
      try{hitEnemy(e,1,{dt:'phys',ctx:c,kb:200,fx:F.hx,fy:F.hy,pl:(typeof THEMES!=='undefined'&&THEMES.void)||undefined});}finally{if(cap)cap.cap=cap0;}
      dmg=hp0+BIG-e.hp;if(!(dmg>=0))dmg=0;lethal=dmg>=hp0;e.hp=lethal?Math.max(1,Math.min(hp0,1)):hp0-dmg;if(e.hp<=0)e.hp=1;
      F.hit.push(e);dm.push({t:e.type,d:Math.round(dmg),ea,boss,elite:isEliteE(e),lethal});
    }catch(err){er=err;try{e.hp=hp0;}catch(_){}ERR('hit',err);}
    if(lethal){F.dying.push(e);try{e.st=e.st||{};e.st.stun=Math.max(e.st.stun||0,T.die-T.hit+.3);}catch(_){}}
    /* rings, flash, dust, rocks at the monster */
    addP({k:'ring',wx:e.x,wy:e.y,s:100,w:12,col:VL2,life:.5,flat:1,a:.9});addP({k:'ring',wx:e.x,wy:e.y,s:40,w:3,col:'#ffffff',life:.25,flat:1,a:.7});
    addP({k:'flash',wx:e.x,wy:e.y,life:.2});
    const n2=Math.round(2*Qn()),n3=Math.round(3*Qn());
    for(let q=0;q<n2;q++)addP({k:'dust',wx:e.x,wy:e.y,ox:rnd(-10,10),oy:rnd(-2,6),vx:rnd(30,120)*(e.x>=F.hx?1:-1),vy:-rnd(10,50),s:rnd(14,24),life:rnd(.5,.8),hold:.3,a:.6});
    for(let q=0;q<n3;q++)addP({k:'rock',wx:e.x,wy:e.y,ox:rnd(-10,10),oy:-rnd(0,20),vx:rnd(80,260)*(e.x>=F.hx?1:-1),vy:-rnd(120,280),g:620,s:rnd(3,6),vr:rnd(-12,12),life:rnd(.5,.8),hold:.4,col:'#2a2036'});
  }
  S.stats.hits+=F.hit.length;F.dm=dm;}
function endCast(F,why){try{if(F.nhc)window.__NHCAST.end(F);}catch(_){}
  try{for(const e of F.dying){if(e&&!e.dead){e.hp=0;killEnemy(e);}}}catch(e){ERR('kill',e);}
  try{if(F.dprOld){resize();}}catch(_){}
  /* fps summary (headless numbers are NOT a real device) */
  try{const fr=F.frames;if(fr.length>5){const sorted=fr.slice().sort((a,b)=>a-b),avg=fr.reduce((a,b)=>a+b,0)/fr.length;S.stats.fps.push({frames:fr.length,avgMs:+avg.toFixed(2),avgFps:+(1000/avg).toFixed(1),worstMs:+sorted[sorted.length-1].toFixed(1),p95Ms:+sorted[Math.floor(sorted.length*.95)].toFixed(1),minFps:+(1000/sorted[sorted.length-1]).toFixed(1),phone:phone()});}}catch(_){}
  S.stats.last={why,lv:F.lv,pct:F.pct,rad:F.rad,targets:F.hit.length,dmg:F.dm,heal:F.heal||0,bossImmune:F.bossImmune|0,dizzy:F.dz.length,peakParts:S.stats.peakParts,peakMotes:S.stats.peakMotes,layers:S.stats.peakLayers,strict:S.stats.peakLayersStrict};
  PT=[];MOTES=[];S.fx=null;if(why!=='end')S.stats.aborted++;}
function stepFx(dt){
  const F=S.fx;if(!F)return;
  if(!P||P.dead||G.state!=='play'||G.zone!==F.zone||!scyHeld()){endCast(F,'abort');return;}
  {const NC_=window.__NHCAST;F.dt=Math.min(dt,.05);if(F.nhc&&NC_&&NC_.on){const t0=t;F.tr=(F.tr||0)+F.dt;t=NC_.warp(F.tr);F.dt=Math.max(0,t-t0);}else t+=F.dt;}
  if(t>=T.slam&&!F.done.slam){F.done.slam=1;slam(F);}
  if(t>=T.hit&&!F.done.hit){F.done.hit=1;doHit(F);}
  if(t>=TBL.lock&&!F.done.heal){F.done.heal=1;
    const n=Math.min(TBL.heal.maxN,F.hit.length),h=Math.min(P.maxHp*TBL.heal.cap,P.maxHp*(TBL.heal.base+TBL.heal.per*n));F.heal=Math.round(h);
    try{healP(h);}catch(e){ERR('heal',e);}}
  if(t>=T.die&&!F.done.die){F.done.die=1;for(const e of F.dying){if(e&&!e.dead){e.hp=0;try{killEnemy(e);}catch(er){ERR('kill',er);}}}F.dying=[];}
  stepP(F.dt);
  if(t>=T.end){endCast(F,'end');return;}}
/* ------------------------------------------------------------------ hooks into the game ------------------------------------------------------------------ */
try{
  const _up=updPlayer;updPlayer=function(dt){
    const F=S.fx;
    if(F){try{stepFx(dt);}catch(e){ERR('step',e);try{S.fx=null;}catch(_){}}}
    const F2=S.fx;let sv=null;
    if(F2&&t<TBL.lock){sv={k:Object.assign({},keys),md:mouse&&mouse.down,joy:G.joy,tj:TOUCH&&TOUCH.joy,touch:G.touch};
      try{for(const k in keys)keys[k]=false;if(mouse)mouse.down=false;G.joy=null;if(TOUCH)TOUCH.joy=null;G.touch=null;}catch(_){}
      try{C182.lockUntil=Math.max(C182.lockUntil||0,time+.15);P.atkCd=Math.max(P.atkCd||0,.15);P.dash=null;}catch(_){}}
    let r;try{r=_up.apply(this,arguments);}finally{
      if(sv){try{Object.assign(keys,sv.k);if(mouse)mouse.down=sv.md;G.joy=sv.joy;if(TOUCH)TOUCH.joy=sv.tj;G.touch=sv.touch;}catch(_){}
        try{if(S.fx&&t<TBL.lock){P.x=F2.hx;P.y=F2.hy;}}catch(_){}}}
    return r;};
}catch(e){ERR('hook updPlayer',e);}
try{const _db=drawBeacons;drawBeacons=function(){const r=_db.apply(this,arguments);
  try{const F=S.fx;if(F&&G.zone===F.zone){LS=new Set();cx=ctx;ctx.save();skyDraw();groundFx(F);slamCracks(F);areaRing(F);bb(F.hx,F.hy,()=>reaperDraw(F));ctx.restore();}}catch(e){ERR('draw ground',e);try{ctx.restore();}catch(_){}}
  return r;};}catch(e){ERR('hook drawBeacons',e);}
try{const _dp=drawParts;drawParts=function(){const r=_dp.apply(this,arguments);
  try{const F=S.fx;cx=ctx;
    if(F&&G.zone===F.zone){ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';stars(F);heroProp(F);for(const p of PT)drawParticle(p);motesDraw(F);ctx.restore();
      S.stats.peakParts=Math.max(S.stats.peakParts,PT.length);S.stats.peakMotes=Math.max(S.stats.peakMotes,MOTES.length);
      if(MOTES.length)LAY('motes');S.stats.peakLayers=Math.max(S.stats.peakLayers,LS.size);S.stats.peakLayersStrict=Math.max(S.stats.peakLayersStrict,LS.size);}
    else if(S.aim){ctx.save();drawAim();ctx.restore();}
  }catch(e){ERR('draw top',e);try{ctx.restore();}catch(_){}}
  return r;};}catch(e){ERR('hook drawParts',e);}
/* frame timing during a cast (headless numbers are not a real device) */
try{const _r=render;let last=0;render=function(){const n=performance.now();if(S.fx&&last&&!(window.__frz&&window.__frz.on)&&n-last<1500&&document.visibilityState==='visible')S.fx.frames.push(n-last);last=n;return _r.apply(this,arguments);};}catch(e){ERR('hook render',e);}
/* hero crouch while raising / slamming (placeholder) */
try{const _dpl=drawPlayer;drawPlayer=function(){const F=S.fx;if(!F)return _dpl.apply(this,arguments);const c=F.nhc?0:-5*ease(seg(t,.45,.98))*(1-ease(seg(t,1.0,1.1)))+9*ease(seg(t,1.12,1.2))*(1-ease(seg(t,1.3,1.8)));ctx.save();ctx.translate(0,c);try{return _dpl.apply(this,arguments);}finally{ctx.restore();}};}catch(e){ERR('hook drawPlayer',e);}
/* ------------------------------------------------------------------ aim (like the mage ultimates: free aim within 420 px, tap / click confirms, Esc cancels) ------------------------------------------------------------------ */
const hint=document.createElement('div');hint.id='scyHint';hint.style.cssText='position:fixed;left:50%;top:12%;transform:translateX(-50%);z-index:60;pointer-events:none;display:none;padding:6px 14px;border-radius:12px;background:rgba(20,12,44,.88);border:1px solid #8a5cff;color:#efe4ff;font:700 14px system-ui,sans-serif;text-align:center;white-space:nowrap;max-width:94vw;overflow:hidden;text-overflow:ellipsis';
document.body.appendChild(hint);
function showHint(){hint.textContent='ราตรีเก็บเกี่ยว · แตะ/คลิกพื้นที่ที่จะฟัน (ในระยะ '+TBL.aimRange+' px) · Esc / คลิกขวา = ยกเลิก';hint.style.display='block';}
function hideHint(){hint.style.display='none';}
S.ready=function(force){
  if(!S.on)return 'ปิดอยู่ (?scythe=off)';
  if(!S.nh)return 'ปิดอยู่ (?nightharvest=off)';
  if(!P||P.dead||G.state!=='play')return 'ใช้ไม่ได้ตอนนี้';
  if(G.fade||G.win||G.edit)return 'ใช้ไม่ได้ตอนนี้';
  if(!scyHeld())return 'ต้องถือเคียว';
  if(S.fx)return 'กำลังร่ายอยู่';
  if(force)return null;
  if((P.lvl|0)<TBL.rowLv)return 'ล็อกอยู่ ต้องเลเวลตัวละคร '+TBL.rowLv;
  const cd=P.cds&&P.cds[CD_ID]||0;if(cd>0)return 'คูลดาวน์ '+cd.toFixed(1)+' วิ';
  if(P.mp<mpFor(lvNow()))return 'MP ไม่พอ';
  if((P.stunT||0)>0||P.dash)return 'กำลังทำท่าอื่น';
  try{if(C182&&C182.lockUntil>time)return 'กำลังทำท่าอื่น';}catch(_){}
  return null;};
function aimDefault(){let best=null,bd=1e9;for(const e of enemies){if(!liveE(e))continue;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<bd&&d<=TBL.aimRange){bd=d;best=e;}}
  if(best)return {x:best.x,y:best.y};const f=P.face||0;return {x:P.x+Math.cos(f)*200,y:P.y+Math.sin(f)*200};}
function clampAim(x,y){const dx=x-P.x,dy=y-P.y,d=Math.hypot(dx,dy);if(d>TBL.aimRange)return {x:P.x+dx/d*TBL.aimRange,y:P.y+dy/d*TBL.aimRange};return {x,y};}
S.begin=function(){const why=S.ready(false);if(why){S.stats.refused++;toast('ราตรีเก็บเกี่ยว: '+why);return false;}
  const d=aimDefault();S.aim={x:d.x,y:d.y,t0:performance.now(),down:null};showHint();return true;};
S.cancel=function(msg){if(!S.aim)return;S.aim=null;hideHint();if(msg)toast(msg);};
S.cast=function(x,y,force){if(x==null||y==null){const d=aimDefault();x=d.x;y=d.y;}return startCast(x,y,force);};
const toWorld=e=>{const r=cv.getBoundingClientRect();return s2w((e.clientX-r.left)*(W/r.width),(e.clientY-r.top)*(H/r.height));};
const uiTarget=el=>!!(el&&el.closest&&el.closest('button,input,select,textarea,a,#bar,#tSkills,#wWpnSk,.win,#hudTrayRow,#touchUI .btn'));
addEventListener('pointermove',e=>{const A=S.aim;if(!A)return;try{const w=toWorld(e),c=clampAim(w[0],w[1]);A.x=c.x;A.y=c.y;}catch(_){}},true);
addEventListener('pointerdown',e=>{const A=S.aim;if(!A||!e.isTrusted)return;
  if(e.target!==cv&&uiTarget(e.target)){if(e.target.id==='scyBtn')return;S.cancel();return;}
  e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();
  if(e.button===2){S.cancel('ราตรีเก็บเกี่ยว: ยกเลิก');return;}
  try{const w=toWorld(e),c=clampAim(w[0],w[1]);A.x=c.x;A.y=c.y;A.down=e.pointerId;}catch(_){}},true);
addEventListener('pointerup',e=>{const A=S.aim;if(!A||!e.isTrusted||A.down==null)return;e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();if(e.pointerId!==A.down)return;
  const x=A.x,y=A.y;S.aim=null;hideHint();startCast(x,y,false);},true);
addEventListener('contextmenu',e=>{if(S.aim){e.preventDefault();S.cancel('ราตรีเก็บเกี่ยว: ยกเลิก');}},true);
const typing=t=>!!(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'||t.isContentEditable));
addEventListener('keydown',e=>{try{
  if(S.aim&&e.key==='Escape'){e.stopImmediatePropagation();e.preventDefault();S.cancel('ราตรีเก็บเกี่ยว: ยกเลิก');return;}
  if(!S.on||e.ctrlKey||e.metaKey||e.altKey||typing(e.target)||e.repeat)return;
  if((e.key||'').toLowerCase()!==(window.__SCYKEY!=null?window.__SCYKEY:'r'))return;
  if(!scyHeld()||G.state!=='play'||P.dead||G.win)return;
  e.stopImmediatePropagation();e.preventDefault();
  if(S.aim){const x=S.aim.x,y=S.aim.y;S.aim=null;hideHint();startCast(x,y,false);return;}
  S.begin();}catch(er){ERR('key',er);}},true);
function drawAim(){const A=S.aim;if(!A)return;if(!P||P.dead||G.state!=='play'||!scyHeld()){S.aim=null;hideHint();return;}
  cx=ctx;const lv=lvNow(),rad=TBL.radius[lv-1],pu=.85+.15*Math.sin(performance.now()/1000*8);
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  ctx.save();ctx.strokeStyle='rgba(216,200,255,.55)';ctx.lineWidth=2;ctx.setLineDash([10,7]);ctx.beginPath();ctx.arc(P.x,P.y,TBL.aimRange,0,6.283);ctx.stroke();ctx.setLineDash([]);
  ctx.beginPath();ctx.moveTo(P.x,P.y);ctx.lineTo(A.x,A.y);ctx.strokeStyle='rgba(216,200,255,.5)';ctx.stroke();
  ctx.translate(A.x,A.y);ctx.globalCompositeOperation='lighter';const gr=ctx.createRadialGradient(0,0,rad*.2,0,0,rad);gr.addColorStop(0,'rgba(120,70,220,0)');gr.addColorStop(.8,'rgba(140,90,255,'+.12*pu+')');gr.addColorStop(1,'rgba(170,120,255,'+.3*pu+')');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(0,0,rad,0,6.283);ctx.fill();
  ctx.lineWidth=2.5;ctx.strokeStyle='#c9a8ff';ctx.globalAlpha=.8*pu;ctx.beginPath();ctx.arc(0,0,rad,0,6.283);ctx.stroke();ctx.restore();
  if(RUNE_OK){ctx.save();ctx.globalCompositeOperation='source-over';runeRing(A.x,A.y,rad*.93,VL2,.55*pu,performance.now()/4000,0,1);ctx.restore();}
  let n=0;for(const e of enemies){if(liveE(e)&&Math.hypot(e.x-A.x,e.y-A.y)<=rad+(e.sz||0)*.5){n++;ctx.save();ctx.strokeStyle='#fff4b0';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,(e.sz||16)+8,0,6.283);ctx.stroke();ctx.restore();}}
  A.n=n;}
/* on-screen skill button (phone friendly) */
const btn=document.createElement('button');btn.id='scyBtn';btn.type='button';btn.setAttribute('aria-label','ราตรีเก็บเกี่ยว (R)');btn.style.cssText='position:fixed;right:16px;bottom:236px;z-index:57;width:54px;height:54px;padding:0;border:0;border-radius:10px;background:none;display:none;cursor:pointer;touch-action:manipulation';
btn.innerHTML='<img alt="" src="'+SCY_ICON+'" style="width:100%;height:100%;display:block;pointer-events:none"><span class="k" style="position:absolute;left:3px;top:2px;padding:0 4px;border-radius:5px;background:rgba(0,0,0,.66);color:#ffe9b0;font:700 10px system-ui">R</span><span class="cd" style="position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.6);color:#fff;font:700 15px system-ui;border-radius:10px"></span>';
for(const ev of ['pointerdown','pointerup','mousedown','mouseup','touchstart','touchend'])btn.addEventListener(ev,e=>e.stopPropagation());
btn.addEventListener('click',e=>{e.stopPropagation();if(S.aim){S.cancel();return;}S.begin();});
document.body.appendChild(btn);
setInterval(()=>{try{const show=S.on&&S.nh&&G.state==='play'&&scyHeld()&&!P.dead&&!G.win&&(P.lvl|0)>=TBL.rowLv;btn.style.display=show?'block':'none';if(!show)return;const cd=(P.cds&&P.cds[CD_ID])||0,c=btn.querySelector('.cd');c.style.display=cd>0?'flex':'none';if(cd>0)c.textContent=Math.ceil(cd);btn.style.opacity=P.mp<mpFor(lvNow())?.55:1;
  if(S.aim&&(G.win||P.dead||!scyHeld()))S.cancel();}catch(_){}},200);
S.state=()=>S.fx?('cast t='+t.toFixed(2)):S.aim?'aim':'idle';
Object.defineProperty(S,'t',{get:()=>t});
/* ------------------------------------------------------------------ skill window line (generic weapon skill window) ------------------------------------------------------------------ */
try{
  const W_=window.__WSK;
  if(S.on&&W_&&W_.lines){
    const NH={k:'scy_nh',name:'ราตรีเก็บเกี่ยว',type:'active',key:'R',row:4,
      ok:()=>S.on&&S.nh&&!!window.C182,icon:()=>SCY_ICON,cdId:CD_ID,
      desc:()=>{const lv=lvNow(),pc=TBL.pct[lv-1];return 'วงรูนที่เลือก (ในระยะ '+TBL.aimRange+' px จากตัว) · ผู้เล่นฟาดเคียวลงพื้น มอนในวงมึน แล้วยมทูตยักษ์ฟัน 1 ครั้ง ฮิตหนัก '+pc+'% ของตีปกติ ใส่ทุกตัวในวงรัศมี '+TBL.radius[lv-1]+' px (สูงสุด '+TBL.maxTargets+' ตัว) ดาเมจธาตุมืด (อันเดด ×'+TBL.ele.undead+' · ธาตุแสง ×'+TBL.ele.light+')\nบอสโดนเต็มฮิต แต่ไม่มึน · มอนปกติมึน '+TBL.dizzy+' วิ · อีลิทมึน '+TBL.dizzyElite+' วิ\nจบท่าฟื้น HP '+Math.round(TBL.heal.base*100)+'% + '+(TBL.heal.per*100)+'% ต่อตัวที่โดน (สูงสุด '+TBL.heal.maxN+' ตัว) ไม่เกิน '+Math.round(TBL.heal.cap*100)+'% ของ MaxHP ต่อครั้ง · ล็อกท่า '+TBL.lock+' วิ · ค่าทดลอง ยังไม่ผ่านการเล่นจริง'+(S.nh?'':'\n(ปิดอยู่ด้วย ?nightharvest=off)');},
      cost:()=>({mp:mpFor(lvNow()),cd:TBL.cd}),
      start:()=>S.begin()};
    W_.lines.scythe={title:'ทักษะสายเคียว',cols:[{name:'โจมตี',skills:[NH]},{name:'บัฟ / สนับสนุน',skills:[]},{name:'พาสซีฟ',skills:[]}]};
    S.nhSkill=NH;
    /* the bar-slot assignment button is not supported for this skill (R key / on-screen button / "ใช้สกิล" instead) */
    const st=document.createElement('style');st.textContent='#wWpnSk.scy #wskAs{display:none!important}';document.head.appendChild(st);
    setInterval(()=>{try{const w=document.getElementById('wWpnSk');if(w)w.classList.toggle('scy',scyHeld());}catch(_){}},300);
  }
}catch(e){ERR('skill window',e);}

/* ===================================================================== scythe-r2: Death Moon (จันทร์มรณะ), second skill of the scythe line (key scy_dm) =====================================================================
   Ported from the demo (death_moon/skill.js, v19-v21): charge -> slash -> spinning aura crescent -> ricochet (split, graze, falloff). Numbers: BALANCE_scythe_deathmoon_v2.md (v2.1-v2.9).
   Runs inside the r1 IIFE (uses its helpers: mk, glowS, band, runeRing, ITEM_IMG, phone, scyHeld, liveE ...). Does NOT touch Night Harvest (own state S.dm, own clock, own particles). */
(function(){
'use strict';
const DM=S.dm={ver:'deathmoon-r2',on:!offF('deathmoon'),err:null,lvOverride:null,fx:null,last:null,log:[],
  stats:{casts:0,hits:0,grazes:0,aborted:0,cancelled:0,refused:0,peakParts:0,peakLayers:0,peakNums:0,peakCopies:0,frames:[],renderMs:[],casts_done:0}};
S.ver='scythe-r2';
const dERR=(w,e)=>{DM.err=w+': '+((e&&e.message)||e);try{console.error('[SCY-DM]',w,e);}catch(_){}};
const lv3=(a,b,c)=>[a,a,a,a,b,b,b,b,b,c];
/* ---------------------------------------------------------------------------------- the numbers (ONE table; source = BALANCE_scythe_deathmoon_v2.md v2.1..v2.9 + ORDER_20261105) */
const D=DM.tbl={
  first:[147,168,189,210,241,262,286,311,338,374],        /* % of a basic hit, first (direct) hit, skill Lv1..10 (Lv1-5 usable in the game, 6-10 locked like Night Harvest) */
  bounces:lv3(10,15,20),                                   /* ricochets per cast (shared by all copies); hits = 1 + bounces */
  copies:[2,2,2,2,2,2,2,2,2,3],                           /* max copies alive */
  range:lv3(260,300,340),                                  /* bounce search range px */
  radius:lv3(90,105,120),                                  /* spin / graze radius px (v2.9; the task brief says Balance has NOT confirmed it yet) */
  grazeCap:lv3(6,9,12),                                    /* monsters grazed per cast */
  vmax:lv3(4,5,6),                                         /* visit cap for a LONE monster (nothing else in bounce range) */
  charge:[.8,.8,.8,.8,.7,.7,.7,.7,.7,.6],                  /* s, hero rooted */
  slash:.2,throwAt:.15,                                    /* slash length; the aura leaves CHARGE+0.15 */
  speed:900,minFly:.26,                                    /* px/s, min seconds per hop */
  later:.3,decay:.9,floor:.1,                              /* hop damage = later x decay^(depth-1) of the first hit, floor 10% */
  repeat:.75,gap:.4,                                       /* repeat hit on the same monster = 75%; min gap per monster 0.4 s */
  graze:.35,                                               /* graze = 35% of that hop */
  aimRange:480,                                            /* first target within 480 px, else the aura flies 480 px straight and fades */
  mp:24,cd:10,cancelCd:.5,                                 /* MP at the charge start, cooldown 10 s from the slash (CDR applies); stun/freeze/knockback = cooldown x0.5 */
  usable:5,rowLv:20,row:3,key:'N',                         /* unlock = skill row 4 (player Lv20) - decision of the build, not in the order */
  mark:{lv:10,mul:1.2,sec:6},                              /* Lv10: moon mark on the first target, +20% damage taken for 6 s */
  ls:{cap:.04,extra:.5},                                   /* lifesteal: 4% maxHP for the whole cast; targets other than the first count 50% */
  ele:TBL.ele,dispCap:99999,
  phone:{partCap:72,dpr:1.25},partCap:120
};
const CD='scyDM';
/* ---------------------------------------------------------------------------------- helpers */
const MOOND='#8fa6ff',PKG='#ff9fc0';
const pick=(arr,lv)=>arr[clamp(lv,1,10)-1];
const cfgFor=lv=>({lv,base:pick(D.first,lv),B:pick(D.bounces,lv),maxc:pick(D.copies,lv),rng:pick(D.range,lv),R:pick(D.radius,lv),gcap:pick(D.grazeCap,lv),vmax:pick(D.vmax,lv),CH:pick(D.charge,lv)});
DM.cfg=cfgFor;
const dlv=()=>{if(DM.lvOverride)return clamp(DM.lvOverride|0,1,10);try{const v=window.__SKUP&&__SKUP.lv?(__SKUP.lv('scy_dm')|0):0;return clamp(v||1,1,D.usable);}catch(_){return 1;}};
const dcd=()=>{try{return D.cd*(1-clamp(B('cdr'),0,.7));}catch(_){return D.cd;}};
const hzOf=e=>clamp((e.sz||16)*1.1,14,60);
const dtoast=m=>{try{textAt(P.x,P.y-62,m,'#d8c9ff',13);}catch(_){}};
const stunned=()=>!!(P&&((P.stunT||0)>0||(P.freezeT||0)>0||(P.frozenT||0)>0||(P.kbT||0)>0));
const sprAura=mk(210,210,g=>{g.translate(105,105);for(let k=0;k<2;k++){g.save();g.rotate(k*Math.PI);g.shadowColor='#b48cff';g.shadowBlur=10;const gr=g.createLinearGradient(-40,-70,60,60);gr.addColorStop(0,'#efe6ff');gr.addColorStop(.5,'#b894ff');gr.addColorStop(1,'#6a35d0');g.fillStyle=gr;g.beginPath();g.arc(0,0,78,-1.15,1.15);g.arc(-30,0,66,1.0,-1.0,true);g.closePath();g.fill();g.restore()}});
/* stand-in skill icon (the pack has no Death Moon icon): violet rounded tile, bronze frame, two opposed crescents */
const DM_ICON=(()=>{try{const c=mk(200,200,g=>{const rr=(x,y,w,h,r)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();};
    const bg=g.createRadialGradient(100,100,10,100,100,140);bg.addColorStop(0,'#3b1f78');bg.addColorStop(1,'#120a2c');rr(6,6,188,188,26);g.fillStyle=bg;g.fill();
    g.save();g.translate(100,100);g.rotate(-.35);g.scale(.82,.82);for(let k=0;k<2;k++){g.save();g.rotate(k*Math.PI);g.shadowColor='#b48cff';g.shadowBlur=18;const gr=g.createLinearGradient(-40,-70,60,60);gr.addColorStop(0,'#f4eeff');gr.addColorStop(.5,'#b894ff');gr.addColorStop(1,'#6a35d0');g.fillStyle=gr;g.beginPath();g.arc(0,0,78,-1.15,1.15);g.arc(-30,0,66,1.0,-1.0,true);g.closePath();g.fill();g.restore()}g.restore();
    const fr=g.createLinearGradient(0,0,200,200);fr.addColorStop(0,'#e3a14a');fr.addColorStop(1,'#8a4f1a');rr(6,6,188,188,26);g.lineWidth=10;g.strokeStyle=fr;g.stroke();});
  return c.toDataURL('image/png');}catch(_){return SCY_ICON;}})();
const MARK_SPR=mk(40,40,g=>{g.translate(20,20);g.shadowColor='#b48cff';g.shadowBlur=8;g.fillStyle='#d9c8ff';g.beginPath();g.arc(0,0,11,0,6.283);g.fill();g.globalCompositeOperation='destination-out';g.beginPath();g.arc(5,-3,10,0,6.283);g.fill();});
const scr=(ax,ay,x,y,h)=>{const o=wl(x-ax,y-ay);return [ax+o[0],ay+o[1]-h];};   /* ground point + height -> billboard-local point around the anchor (ax,ay) */
const ptCap=()=>phone()?D.phone.partCap:D.partCap;
/* ---------------------------------------------------------------------------------- particles (own lists: rings, rocks, sparks) */
let PT=[],SP=[];
function addP(p){if(PT.length+SP.length>=ptCap())return;p.age=0;p.vx=p.vx||0;p.vy=p.vy||0;p.g=p.g||0;p.rot=p.rot||0;p.vr=p.vr||0;p.ox=p.ox||0;p.oy=p.oy||0;PT.push(p);}
function addSpark(x,y,h,vx,vy){if(PT.length+SP.length>=ptCap())return;SP.push({wx:x,wy:y,oy:-h,vx,vy,age:0,c:Math.random()<.5?VL2:PKG});}
function stepP(dt){for(const p of PT){p.age+=dt;p.vy+=p.g*dt;p.ox+=p.vx*dt;p.oy+=p.vy*dt;p.rot+=p.vr*dt;}PT=PT.filter(p=>p.age<p.life);for(const s of SP)s.age+=dt;SP=SP.filter(s=>s.age<.35);}
function drawPT(){for(const p of PT){const u=p.age/p.life,hold=p.hold||.5,a=(1-Math.max(0,u-hold)/(1-hold))*(p.a||1);if(a<=0)continue;
  if(p.k==='ring'){const r=p.s*(.3+.7*ease(u));ctx.save();ctx.translate(p.wx,p.wy);ctx.globalAlpha=clamp(a,0,1);ctx.strokeStyle=p.col;ctx.lineWidth=p.w*(1-u);ctx.beginPath();ctx.arc(0,0,r,0,6.283);ctx.stroke();ctx.restore();}
  else bb(p.wx,p.wy,()=>{ctx.save();ctx.globalAlpha=clamp(a,0,1);ctx.translate(p.wx+p.ox,p.wy+p.oy);ctx.rotate(p.rot);ctx.fillStyle=p.col;ctx.beginPath();ctx.moveTo(-p.s/2,-p.s/3);ctx.lineTo(p.s/2,-p.s/2);ctx.lineTo(p.s*.4,p.s/3);ctx.lineTo(-p.s*.3,p.s/2);ctx.closePath();ctx.fill();ctx.restore();});}
  if(SP.length){ctx.save();ctx.globalCompositeOperation='lighter';for(const s of SP){const a=s.age,u=a/.35;bb(s.wx,s.wy,()=>{ctx.globalAlpha=1-u;ctx.drawImage(glowS(s.c),s.wx+s.vx*a-8,s.wy+s.oy+s.vy*a+500*a*a-8,16,16);});}ctx.restore();}}
/* ---------------------------------------------------------------------------------- plan (the chain), built when the aura leaves the hand; positions follow the live monsters */
function buildPlan(F){
  const c=F.c,nodes=[],lastEnd=new Map(),visits=new Map();let alive=1,bl=c.B;
  const foes=F.foes=enemies.filter(e=>liveE(e)&&Math.hypot(e.x-P.x,e.y-P.y)<=1200);
  const tp=e=>[e.x,e.y,hzOf(e)],gd=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
  const mkN=(e,from,t0,depth,par,toFixed)=>{const to=toFixed||tp(e),dist=gd(from,to),fly=Math.max(D.minFly,dist/D.speed);let ta=t0+fly;const le=e?lastEnd.get(e):undefined;if(le!==undefined&&ta<le+D.gap)ta=le+D.gap;
    const v=e?(visits.get(e)||0)+1:0;if(e)visits.set(e,v);const tl=ta+.06;
    const f=depth===0?1:Math.max(D.floor,D.later*Math.pow(D.decay,depth-1))*(v>1?D.repeat:1);
    const n={e,from:from.slice(),to,t0:ta-fly,ta,tl,dist,gen:depth,par,kids:[],id:nodes.length,pct:Math.round(c.base*f),v,trail:[],done:0,fromSet:0};nodes.push(n);if(e)lastEnd.set(e,tl);return n;};
  const hand=F.hand;let first=null;
  const lk=window.TLOCK&&window.TLOCK.e;
  if(lk&&liveE(lk)&&Math.hypot(lk.x-hand[0],lk.y-hand[1])<=D.aimRange)first=lk;
  else{let bd=1e9;for(const e of foes){const d=Math.hypot(e.x-hand[0],e.y-hand[1]);if(d<bd&&d<=D.aimRange){bd=d;first=e;}}}
  F.firstE=first;
  if(!first){const a=P.face||0,to=[hand[0]+Math.cos(a)*D.aimRange,hand[1]+Math.sin(a)*D.aimRange,hand[2]];mkN(null,hand,F.tThrow,0,null,to);}
  else{
    const pend=[mkN(first,hand,F.tThrow,0,null)];
    while(pend.length){pend.sort((a,b)=>a.tl-b.tl);const n=pend.shift();if(bl<=0)continue;
      const arrive=n.tl+.25;
      let cand=foes.filter(e=>e!==n.e&&(lastEnd.get(e)===undefined||lastEnd.get(e)+D.gap<=arrive+.3)).map(o=>({e:o,d:Math.hypot(o.x-n.e.x,o.y-n.e.y)})).filter(o=>o.d<=c.rng);
      cand.sort((a,b)=>a.d-b.d);
      if(!foes.some(e=>e!==n.e&&Math.hypot(e.x-n.e.x,e.y-n.e.y)<=c.rng)&&(visits.get(n.e)||0)<c.vmax)cand=[{e:n.e,d:0}];   /* a LONE monster: back to it, capped by the visit cap */
      if(!cand.length)continue;
      const split=cand.length>=2&&alive<c.maxc&&bl>=2,take=split?2:1;
      for(let i=0;i<take;i++){const k=mkN(cand[i].e,n.to,n.tl,n.gen+1,n);n.kids.push(k);pend.push(k);bl--;}
      if(split)alive++;}}
  let end=0;for(const n of nodes)if(!n.kids.length){n.tr1=n.tl+.35;end=Math.max(end,n.tr1);}
  return {nodes,end,bounces:nodes.length-1,copies:alive};}
function nodePos(n,t){if(t<n.t0)return null;
  if(t<n.ta){const u0=clamp((t-n.t0)/(n.ta-n.t0),0,1),u=lerp(u0*u0*(3-2*u0),ease(u0),.5),arc=Math.sin(u*Math.PI)*Math.min(70,n.dist*.18);return {x:lerp(n.from[0],n.to[0],u),y:lerp(n.from[1],n.to[1],u),h:lerp(n.from[2],n.to[2],u)+arc,st:0,a:1};}
  if(t<n.tl)return {x:n.to[0]+Math.sin(t*70)*3,y:n.to[1],h:n.to[2]+Math.cos(t*83)*2,st:1,a:1};
  if(!n.kids.length&&t<n.tr1)return {x:n.to[0],y:n.to[1],h:n.to[2],st:2,a:1-ease((t-n.tl)/.35)};
  return null;}
/* ---------------------------------------------------------------------------------- damage (one fresh ctx per hit: a ctx only allows one hit per target) */
function dmCtx(F,e,pct){const A=C182.api,wd=A.D().weapons.scythe||A.D().weapons.sword,basic=wd.actionCoef*wd.weights.reduce((a,b)=>a+b,0);
  let ea=1;try{const X=mobInfo(e);if(X.race==='undead'||X.ele==='undead')ea=D.ele.undead;else if(X.ele==='holy'||e.elem==='Light')ea=D.ele.light;}catch(_){}
  const def={id:'scy_dm',mode:'native',coefTotal:basic*pct/100*ea,flatTotal:0,weights:[1],schedule:[0],maxTargets:1,targeting:'around',element:'Neutral'};
  return {ctx:A.ctxFor('skill','scy_dm',def,{dt:'phys',lvScale:1,m0:1,reach:9999,cdId:CD}),ea};}
function dHit(F,e,pct,graze,seq){
  const cap=COLCMB.CFG&&COLCMB.CFG.dmg,cap0=cap&&cap.cap,hp0=e.hp,n0=texts.length;let cmp=1;try{if(window.COMP30&&COMP30.on&&COMP30.c)cmp=COMP30.c(P.lvl|0)||1;}catch(_){}
  const marked=e._dmMark>time;let rawCap=Math.round(D.dispCap/cmp/(marked?D.mark.mul:1));
  let dmg=0,ok=false;const lsOrig=C182.lifesteal,extra=e!==F.firstE;
  try{const {ctx:c}=dmCtx(F,e,pct);c.lsLeft=F.lsLeft;if(cap)cap.cap=rawCap;
    if(extra)C182.lifesteal=function(e2,d2,ls2,o2){return lsOrig.call(this,e2,d2,ls2*D.ls.extra,o2);};
    const ln=C182.log?C182.log.length:0;
    hitEnemy(e,1,{dt:'phys',ctx:c,pl:(typeof THEMES!=='undefined'&&THEMES.void)||undefined});
    F.lsLeft=c.lsLeft;
    const L=C182.log,rec=L&&L.length>ln?L[L.length-1]:null;dmg=rec&&rec.id==='scy_dm'?rec.d:Math.max(0,hp0-Math.max(0,e.hp));ok=true;
  }catch(err){dERR('hit',err);}finally{if(cap)cap.cap=cap0;C182.lifesteal=lsOrig;}
  try{adjNums(e,n0,graze,seq);}catch(err){dERR('nums',err);}
  return {dmg:Math.round(dmg),ok,marked};}
/* damage numbers: the game's own number per hit, placed in 3 lanes with small height offsets, anti-overlap nudge (demo skNums), clamped inside the screen */
function adjNums(e,n0,graze,seq){const lane=seq%3,sz=e.sz||16;
  for(let i=n0;i<texts.length;i++){const x=texts[i];if(!x||x.col==='#8dffc8'||/^\+/.test(String(x.txt)))continue;
    if(graze){x.col='#ffb5d6';x.size=Math.min(x.size||14,14);x.x=e.x+26;x.y=e.y-sz*.9;x.life=Math.max(x.life,1.2);x.max=Math.max(x.max||0,1.2);}
    else{x.x=e.x+(lane-1)*26;x.y=e.y-sz*1.6-(seq%2)*14;}
    for(let k=0;k<8;k++){const hit=texts.some((p,j)=>j!==i&&p&&p.life>0&&Math.abs(p.x-x.x)<46&&Math.abs(p.y-x.y)<17);if(!hit)break;x.y-=17;if(k===3){x.y+=68;x.x+=(lane===2?-1:1)*40;}}
    try{const s=w2s(x.x,x.y);if(s[0]<34)x.x+=(34-s[0])/camZ();else if(s[0]>W-34)x.x-=(s[0]-(W-34))/camZ();}catch(_){}}}
const MARKS=[];
function directHit(F,n){const e=n.e;if(!e)return;
  if(!liveE(e)){F.skipped++;return;}
  const seq=F.seq++,r=dHit(F,e,n.pct,false,seq);
  F.hc.set(e,(F.hc.get(e)||0)+1);DM.stats.hits++;
  F.rec.push({t:+F.t.toFixed(2),k:'d',id:idOf(F,e),ty:e.type,pct:n.pct,dmg:r.dmg,gen:n.gen,v:n.v,boss:isBossE(e),elite:isEliteE(e)});
  if(n.gen===0&&F.lv>=D.mark.lv&&!F.marked){F.marked=1;e._dmMark=time+D.mark.sec;MARKS.push(e);}
  e.flash=Math.max(e.flash||0,.25);e._dmJ=time;
  addP({k:'ring',wx:e.x,wy:e.y,s:54,w:6,col:MOOND,life:.4,a:.7});
  const nr=Math.round(6*(phone()?.5:1)),hz=hzOf(e);
  for(let q=0;q<nr;q++)addP({k:'rock',wx:e.x,wy:e.y,oy:-hz*.6,vx:rnd(-90,90),vy:-rnd(80,180),g:520,s:rnd(3,6),vr:rnd(-12,12),life:rnd(.5,.8),hold:.3,col:'#d9e2ff'});
  for(let q=0;q<3;q++)addSpark(e.x+rnd(-8,8),e.y,hz+rnd(-8,8),rnd(-160,160),rnd(-160,40));
  try{shake(1.4);}catch(_){}}
function grazeHit(F,o,n,tt){const pct=Math.round(n.pct*D.graze),seq=F.seq++,r=dHit(F,o,pct,true,seq);
  F.grazed.add(o);F.gz++;DM.stats.grazes++;
  F.rec.push({t:+tt.toFixed(2),k:'g',id:idOf(F,o),ty:o.type,pct,dmg:r.dmg,gen:n.gen,boss:isBossE(o),elite:isEliteE(o)});
  o.flash=Math.max(o.flash||0,.3);o._dmJ=time;
  const hz=hzOf(o);for(let q=0;q<3;q++)addSpark(o.x+rnd(-8,8),o.y,hz+rnd(-8,8),rnd(-160,160),rnd(-160,40));}
function idOf(F,e){let i=F.ids.get(e);if(i==null){i=F.ids.size+1;F.ids.set(e,i);}return i;}
/* graze: every monster inside the spin radius along the whole flight (sampled 1/60 s), once per monster per cast, cap 6/9/12; skipped (and NOT used up) if that monster takes a direct hit within 0.3 s */
function stepGraze(F,t0,t1){const c=F.c,pl=F.plan;if(!pl||F.gz>=c.gcap)return;
  for(let tt=t0+1/60;tt<=t1+1e-6;tt+=1/60){
    for(const n of pl.nodes){if(tt<n.t0||tt>n.ta)continue;const p=nodePos(n,tt);if(!p)continue;
      for(const o of F.foes){if(o===n.e||!liveE(o)||F.grazed.has(o))continue;if(Math.hypot(o.x-p.x,o.y-p.y)>c.R)continue;
        if(pl.nodes.some(m=>m.e===o&&m.ta<=tt+.3))continue;
        if(F.gz>=c.gcap)return;grazeHit(F,o,n,tt);}}}}
/* ---------------------------------------------------------------------------------- cast flow */
DM.ready=function(force){
  if(!S.on)return 'ปิดอยู่ (?scythe=off)';
  if(!DM.on)return 'ปิดอยู่ (?deathmoon=off)';
  if(!P||P.dead||G.state!=='play')return 'ใช้ไม่ได้ตอนนี้';
  if(G.fade||G.win||G.edit)return 'ใช้ไม่ได้ตอนนี้';
  if(!scyHeld())return 'ต้องถือเคียว';
  if(DM.fx)return 'กำลังร่ายอยู่';
  if(S.fx||S.aim)return 'กำลังใช้สกิลอื่น';
  if(force)return null;
  if((P.lvl|0)<D.rowLv)return 'ล็อกอยู่ ต้องเลเวลตัวละคร '+D.rowLv;
  const cd=P.cds&&P.cds[CD]||0;if(cd>0)return 'คูลดาวน์ '+cd.toFixed(1)+' วิ';
  if(P.mp<D.mp)return 'MP ไม่พอ';
  if((P.stunT||0)>0||P.dash)return 'กำลังทำท่าอื่น';
  try{if(C182&&C182.lockUntil>time)return 'กำลังทำท่าอื่น';}catch(_){}
  return null;};
function dStart(force,lvOv){
  const why=DM.ready(force);if(why){DM.stats.refused++;dtoast('จันทร์มรณะ: '+why);return false;}
  const lv=lvOv?clamp(lvOv|0,1,10):dlv(),c=cfgFor(lv);
  if(!force)P.mp-=D.mp;                                       /* MP is spent at the charge start */
  const F=DM.fx={t0:time,t:0,lv,c,hx:P.x,hy:P.y,zone:G.zone,force:!!force,tThrow:c.CH+D.throwAt,hand:null,plan:null,slashed:0,rel:0,foes:[],grazed:new Set(),gz:0,seq:0,hc:new Map(),ids:new Map(),rec:[],skipped:0,
    lsLeft:D.ls.cap*P.maxHp,firstE:null,marked:0,frames:[],rms:[],lastT:0,dprOld:null};
  PT=[];SP=[];DM.dls=new Set();
  try{if(phone()&&DPR>D.phone.dpr){F.dprOld=DPR;DPR=D.phone.dpr;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);vignette=null;}}catch(_){}
  DM.stats.casts++;DM.stats.peakLayers=0;DM.stats.peakParts=0;DM.stats.peakNums=0;DM.stats.peakCopies=0;
  try{sfx('cast','void');}catch(_){}
  DM.log.push('cast lv'+lv+(force?' force':'')+' mp'+(force?0:D.mp));if(DM.log.length>60)DM.log.shift();
  return true;}
function dEnd(F,why){
  if(why==='cancel'){try{P.cds[CD]=dcd()*D.cancelCd;}catch(_){}DM.stats.cancelled++;dtoast('จันทร์มรณะ: ถูกขัดจังหวะ');}
  try{if(F.dprOld)resize();}catch(_){}
  try{const fr=F.frames,rm=F.rms;
    const sum=a=>{if(a.length<3)return null;const s=a.slice().sort((x,y)=>x-y),avg=a.reduce((x,y)=>x+y,0)/a.length;return {n:a.length,avg:+avg.toFixed(2),p95:+s[Math.floor(s.length*.95)].toFixed(2),max:+s[s.length-1].toFixed(2)};};
    DM.stats.frames.push(sum(fr));DM.stats.renderMs.push(sum(rm));}catch(_){}
  const per={};for(const [e,n] of F.hc){per[idOf(F,e)]=n;}
  const pl=F.plan;
  DM.last={why,lv:F.lv,cfg:F.c,force:F.force,plan:pl?{nodes:pl.nodes.length,bounces:pl.bounces,copies:pl.copies,end:+pl.end.toFixed(2)}:null,direct:F.rec.filter(r=>r.k==='d').length,grazes:F.gz,skipped:F.skipped,perMonsterDirect:per,
    maxPerMonster:Math.max(0,...Object.values(per)),rec:F.rec,peakParts:DM.stats.peakParts,peakLayers:DM.stats.peakLayers,peakNums:DM.stats.peakNums,peakCopies:DM.stats.peakCopies,marked:F.marked};
  if(why==='end')DM.stats.casts_done++;else if(why==='abort')DM.stats.aborted++;
  PT=[];SP=[];DM.fx=null;}
function dStep(F,dt){
  if(!P||P.dead||G.state!=='play'||G.zone!==F.zone||!scyHeld()){dEnd(F,'abort');return;}
  dt=Math.min(dt,.05);const t0=F.t;F.t+=dt;const t=F.t,c=F.c,CH=c.CH;
  if(!F.rel&&stunned()){dEnd(F,'cancel');return;}                /* stun / freeze / knockback before the aura is released */
  if(!F.slashed&&t>=CH){F.slashed=1;if(!F.force)P.cds[CD]=dcd();     /* cooldown 10 s starts at the slash */
    const lk=window.TLOCK&&window.TLOCK.e;let tg=lk&&liveE(lk)?lk:null;if(!tg){let bd=1e9;for(const e of enemies){if(!liveE(e))continue;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<bd){bd=d;tg=e;}}}
    try{if(tg)P.face=Math.atan2(tg.y-P.y,tg.x-P.x);}catch(_){}
    const a=P.face||0;F.hand=[P.x+Math.cos(a)*30,P.y+Math.sin(a)*30,58];}
  if(F.slashed&&!F.rel&&t>=CH+.05){F.rel=1;try{shake(2.5);}catch(_){}addP({k:'ring',wx:F.hand[0],wy:F.hand[1],s:70,w:6,col:VL2,life:.45,a:.8});}
  if(F.slashed&&!F.plan&&t>=F.tThrow){F.plan=buildPlan(F);F.rel=1;}
  const pl=F.plan;
  if(pl){
    F.foes=F.foes.filter(liveE);
    for(const n of pl.nodes){
      if(n.e&&liveE(n.e)&&t<=n.tl){n.to[0]=n.e.x;n.to[1]=n.e.y;n.to[2]=hzOf(n.e);}
      if(!n.fromSet&&t>=n.t0&&n.par){n.from=n.par.to.slice();n.fromSet=1;}
      if(!n.done&&t>=n.ta){n.done=1;directHit(F,n);}
      if(!n.hop&&n.kids.length&&t>=n.tl){n.hop=1;addP({k:'ring',wx:n.to[0],wy:n.to[1],s:46,w:5,col:VL2,life:.35,a:.7});for(let q=0;q<8;q++)addSpark(n.to[0],n.to[1],n.to[2],rnd(-220,220),rnd(-220,60));}}
    stepGraze(F,t0,t);
    if(t>=pl.end+.7){dEnd(F,'end');return;}}
  stepP(dt);
  F.lastT=t;}
/* ---------------------------------------------------------------------------------- hooks */
try{const _up=updPlayer;updPlayer=function(dt){
  const F=DM.fx;
  if(F){try{dStep(F,dt);}catch(e){dERR('step',e);try{DM.fx=null;}catch(_){}}}
  const F2=DM.fx;let sv=null;
  if(F2&&F2.t<F2.c.CH+D.slash){sv={k:Object.assign({},keys),md:mouse&&mouse.down,joy:G.joy,tj:TOUCH&&TOUCH.joy,touch:G.touch};
    try{for(const k in keys)keys[k]=false;if(mouse)mouse.down=false;G.joy=null;if(TOUCH)TOUCH.joy=null;G.touch=null;}catch(_){}
    try{C182.lockUntil=Math.max(C182.lockUntil||0,time+.15);P.atkCd=Math.max(P.atkCd||0,.15);P.dash=null;}catch(_){}}
  let r;try{r=_up.apply(this,arguments);}finally{
    if(sv){try{Object.assign(keys,sv.k);if(mouse)mouse.down=sv.md;G.joy=sv.joy;if(TOUCH)TOUCH.joy=sv.tj;G.touch=sv.touch;}catch(_){}
      try{if(DM.fx&&DM.fx.t<DM.fx.c.CH+D.slash){P.x=F2.hx;P.y=F2.hy;}}catch(_){}}}
  return r;};}catch(e){dERR('hook updPlayer',e);}
/* moon mark: +20% damage taken for 6 s (all hits that are not a DoT) */
try{const _ad=applyDamage;applyDamage=function(e,d,crit,o){try{if(e&&e._dmMark>time&&!(o&&o.dot))d=Math.max(1,Math.round(d*D.mark.mul));}catch(_){}return _ad.call(this,e,d,crit,o);};}catch(e){dERR('hook applyDamage',e);}
/* flinch jitter (flash comes from the game's own hit) */
try{const _de=drawEnemy;drawEnemy=function(e){const j=e&&e._dmJ?time-e._dmJ:9;if(j<.12){ctx.save();ctx.translate(Math.sin(time*90)*3*(1-j/.12),0);try{return _de.apply(this,arguments);}finally{ctx.restore();}}return _de.apply(this,arguments);};}catch(e){dERR('hook drawEnemy',e);}
/* hero crouch while drawing back (placeholder) */
try{const _dpl=drawPlayer;drawPlayer=function(){const F=DM.fx;if(!F||F.t>F.c.CH+1.1)return _dpl.apply(this,arguments);const CH=F.c.CH,t=F.t,w=ease(seg(t,0,Math.min(.45,CH-.15))),sl=ease(seg(t,CH,CH+.2)),rt=ease(seg(t,CH+.5,CH+1.0)),c=-5*w*(1-sl)+2*sl*(1-rt);ctx.save();ctx.translate(0,c);try{return _dpl.apply(this,arguments);}finally{ctx.restore();}};}catch(e){dERR('hook drawPlayer',e);}
/* ground pass: sky dim + rune ring at the feet */
try{const _db=drawBeacons;drawBeacons=function(){const r=_db.apply(this,arguments);
  try{const F=DM.fx;if(F&&G.zone===F.zone){DM.dls=new Set();dmGround(F);}}catch(e){dERR('draw ground',e);try{ctx.restore();}catch(_){}}
  return r;};}catch(e){dERR('hook drawBeacons',e);}
function dmGround(F){const t=F.t,c=F.c,CH=c.CH,end=F.plan?F.plan.end:3;
  const d=ease(seg(t,.1,.5))*(1-ease(seg(t,end,end+.6)))*.16;
  if(d>0){DM.dls.add('sky');ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.fillStyle='rgba(10,12,40,'+d+')';ctx.fillRect(0,0,W,H);ctx.restore();}
  const ch=ease(seg(t,.12,CH))*(1-seg(t,CH+.05,CH+.35));
  if(ch>.02&&RUNE_OK){DM.dls.add('rune');cx=ctx;ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';runeRing(F.hx,F.hy+4,40+60*ch,VL2,.8*ch,t*.9,0,ch);ctx.restore();}}
/* top pass: scythe prop + aura charge, bounce arcs, aura copies, rings / rocks / sparks, moon marks */
try{const _dp=drawParts;drawParts=function(){const r=_dp.apply(this,arguments);
  try{dmTop();}catch(e){dERR('draw top',e);try{ctx.restore();}catch(_){}}
  return r;};}catch(e){dERR('hook drawParts',e);}
function dmTop(){const F=DM.fx;cx=ctx;
  if(MARKS.length){for(let i=MARKS.length-1;i>=0;i--){const e=MARKS[i];if(!e||!(e._dmMark>time)||!liveE(e))MARKS.splice(i,1);}
    for(const e of MARKS){const hz=(e.sz||16)*2.7+8+Math.sin(time*4)*2;bb(e.x,e.y,()=>{ctx.save();ctx.globalAlpha=.9;ctx.drawImage(MARK_SPR,e.x-14,e.y-hz-14,28,28);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.35;ctx.drawImage(glowS('#9a6bff'),e.x-22,e.y-hz-22,44,44);ctx.restore();});}}
  if(!F||F.zone!==G.zone)return;
  const t=F.t;ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  if(t<F.c.CH+1.0)dmHand(F);
  if(F.plan){dmChain(F);dmAura(F);}
  drawPT();
  ctx.restore();
  DM.stats.peakParts=Math.max(DM.stats.peakParts,PT.length+SP.length);DM.stats.peakLayers=Math.max(DM.stats.peakLayers,DM.dls.size);
  try{let n=0;for(const x of texts)if(x&&x.life>0)n++;DM.stats.peakNums=Math.max(DM.stats.peakNums,n);}catch(_){}}
/* the scythe stays in the hand: drawn back over the shoulder, charge aura (glow, rim light, 7 spiralling motes, tremble), slash forward, back to rest (placeholder pose, the hero body is the sword stand-in) */
function dmHand(F){if(!ITEM_IMG.naturalWidth)return;const t=F.t,CH=F.c.CH,w=ease(seg(t,0,Math.min(.45,CH-.15))),sl=ease(seg(t,CH,CH+.2)),rt=ease(seg(t,CH+.5,CH+1.0));
  let ang=lerp(.5,-1.9,w);ang=lerp(ang,.9,sl);ang=lerp(ang,.5,rt);
  const ch=ease(seg(t,.12,CH))*(1-seg(t,CH+.05,CH+.35)),tr=ch*Math.sin(t*60)*.03,al=ease(seg(t,0,.15))*(1-ease(seg(t,CH+.4,CH+.9)));if(al<=0)return;
  DM.dls.add('hand');const fl=Math.cos(P.face||0)<0?-1:1,iw=ITEM_IMG.naturalWidth,ih=ITEM_IMG.naturalHeight,sc=.36;
  bb(P.x,P.y,()=>{ctx.save();ctx.globalAlpha=al;ctx.translate(P.x+4*fl,P.y-44);ctx.scale(fl,1);ctx.rotate(ang+tr+.98);ctx.scale(sc,sc);ctx.translate(-60,-280);
    ctx.drawImage(ITEM_IMG,0,0,iw,ih);
    if(ch>0){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.55*ch*al;const gs=380*ch+80;ctx.drawImage(glowS(VIO_),300-gs/2,120-gs/2,gs,gs);
      ctx.globalAlpha=.8*ch*al;ctx.strokeStyle=VL2;ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(245,95);ctx.quadraticCurveTo(330,70,405,195);ctx.stroke();
      for(let q=0;q<7;q++){const u=(t*1.4+q/7)%1,a0=q*2.4+t*3,rr=(1-u)*260*ch;ctx.globalAlpha=.7*ch*(1-u)*al;ctx.drawImage(glowS(q%2?PKG:VL2),300+Math.cos(a0)*rr-16,120+Math.sin(a0)*rr*.8-16,32,32);}}
    ctx.restore();});}
const VIO_='#8a4dff';
function dmChain(F){const t=F.t;DM.dls.add('chain');ctx.save();ctx.globalCompositeOperation='lighter';
  for(const n of F.plan.nodes){const a=t-n.t0;if(a<0||a>n.ta-n.t0+.25)continue;const f=1-seg(t,n.ta,n.ta+.25);if(f<=0)continue;
    const ax=n.from[0],ay=n.from[1];bb(ax,ay,()=>{const pts=[];for(let i=0;i<=14;i++){const u=i/14,x=lerp(n.from[0],n.to[0],u),y=lerp(n.from[1],n.to[1],u),h=lerp(n.from[2],n.to[2],u)+Math.sin(u*Math.PI)*Math.min(70,n.dist*.18),p=scr(ax,ay,x,y,h);pts.push([p[0],p[1],u]);}band(pts,f2=>5*Math.sin(f2*Math.PI)+.8,VL2,.55*f);});}
  ctx.restore();}
function dmAura(F){const t=F.t;DM.dls.add('aura');let act=0;for(const n of F.plan.nodes){const p=nodePos(n,t);if(p&&p.st!==2)act++;}DM.stats.peakCopies=Math.max(DM.stats.peakCopies,act);
  const dens=1/(1+.3*Math.max(0,act-1));
  for(const n of F.plan.nodes){const p=nodePos(n,t),fa=(p?p.a:1)*dens;
    if(p)n.trail.push([p.x,p.y,p.h,t]);while(n.trail.length&&t-n.trail[0][3]>.22)n.trail.shift();
    if(!p)continue;
    bb(p.x,p.y,()=>{
      if(n.trail.length>2&&fa>0){const pts=n.trail.map((q,i)=>{const s=scr(p.x,p.y,q[0],q[1],q[2]);return [s[0],s[1],i/(n.trail.length-1)];});ctx.save();ctx.globalCompositeOperation='lighter';band(pts,f=>34*Math.pow(f,.7)+2,'#6a35d0',.22*fa);band(pts,f=>14*Math.pow(f,.7)+1.5,VL2,.34*fa);ctx.restore();}
      const sc=.93*Math.pow(.92,Math.min(n.gen,4)),ang=t*42+n.id*1.3,X=p.x,Y=p.y-p.h;ctx.save();ctx.translate(X,Y);
      ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.14*fa;ctx.drawImage(glowS(VIO_),-84,-84,168,168);ctx.globalCompositeOperation='source-over';
      for(let g=2;g>=0;g--){ctx.save();ctx.rotate(ang-g*.5);ctx.globalAlpha=(g?.12:.78)*fa;ctx.scale(sc,sc);ctx.drawImage(sprAura,-105,-105);ctx.restore();}
      ctx.restore();});}}
/* frame cost (headless pane numbers, NOT a real device) */
try{const _r=render;render=function(){const F=DM.fx;if(!F)return _r.apply(this,arguments);const n=performance.now();if(DM.lastR&&n-DM.lastR<1500&&document.visibilityState==='visible'&&!(window.__frz&&window.__frz.on))F.frames.push(n-DM.lastR);DM.lastR=n;
  try{return _r.apply(this,arguments);}finally{F.rms.push(performance.now()-n);}};}catch(e){dERR('hook render',e);}
/* ---------------------------------------------------------------------------------- input: key U, on-screen button, skill window row */
DM.begin=function(){return dStart(false);};
DM.cast=function(o){o=o||{};return dStart(!!o.force,o.lv);};
DM.cancel=function(){const F=DM.fx;if(F)dEnd(F,'abort');};
DM.state=()=>DM.fx?('cast t='+DM.fx.t.toFixed(2)+(DM.fx.plan?' plan':' charge')):'idle';
DM.perf=()=>({frames:DM.stats.frames.slice(-3),renderMs:DM.stats.renderMs.slice(-3),peakParts:DM.stats.peakParts,peakLayers:DM.stats.peakLayers,peakNums:DM.stats.peakNums,peakCopies:DM.stats.peakCopies,note:'headless in-app pane numbers, NOT a real phone'});
addEventListener('keydown',e=>{try{
  if(!S.on||e.ctrlKey||e.metaKey||e.altKey||typing(e.target)||e.repeat)return;
  if((e.key||'').toLowerCase()!==D.key.toLowerCase())return;
  if(!scyHeld()||G.state!=='play'||P.dead||G.win)return;
  e.stopImmediatePropagation();e.preventDefault();DM.begin();}catch(er){dERR('key',er);}},true);
const dbtn=document.createElement('button');dbtn.id='scyDmBtn';dbtn.type='button';dbtn.setAttribute('aria-label','จันทร์มรณะ ('+D.key+')');dbtn.style.cssText='position:fixed;right:78px;bottom:236px;z-index:57;width:54px;height:54px;padding:0;border:0;border-radius:10px;background:none;display:none;cursor:pointer;touch-action:manipulation';
dbtn.innerHTML='<img alt="" src="'+DM_ICON+'" style="width:100%;height:100%;display:block;pointer-events:none"><span class="k" style="position:absolute;left:3px;top:2px;padding:0 4px;border-radius:5px;background:rgba(0,0,0,.66);color:#ffe9b0;font:700 10px system-ui">'+D.key+'</span><span class="cd" style="position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.6);color:#fff;font:700 15px system-ui;border-radius:10px"></span>';
for(const ev of ['pointerdown','pointerup','mousedown','mouseup','touchstart','touchend'])dbtn.addEventListener(ev,e=>e.stopPropagation());
dbtn.addEventListener('click',e=>{e.stopPropagation();DM.begin();});
document.body.appendChild(dbtn);
setInterval(()=>{try{const show=S.on&&DM.on&&G.state==='play'&&scyHeld()&&!P.dead&&!G.win&&(P.lvl|0)>=D.rowLv;dbtn.style.display=show?'block':'none';if(!show)return;const cd=(P.cds&&P.cds[CD])||0,c=dbtn.querySelector('.cd');c.style.display=cd>0?'flex':'none';if(cd>0)c.textContent=Math.ceil(cd);dbtn.style.opacity=P.mp<D.mp?.55:1;}catch(_){}},200);
try{
  const W_=window.__WSK;
  if(S.on&&W_&&W_.lines&&W_.lines.scythe){
    const SK={k:'scy_dm',name:'จันทร์มรณะ',type:'active',key:D.key,row:D.row,
      ok:()=>S.on&&DM.on&&!!window.C182,icon:()=>DM_ICON,cdId:CD,
      desc:()=>{const lv=dlv(),c=cfgFor(lv);return 'ง้างเคียวชาร์จ '+c.CH+' วิ (ยืนนิ่ง โดนตีปกติไม่สะดุด · สตัน/แช่แข็ง/ถูกกระแทกยกเลิก เสีย MP คูลดาวน์ครึ่งหนึ่ง) แล้วฟันปล่อยออร่าเคียวหมุน ความเร็ว '+D.speed+' px/วิ ล็อกเป้าหมายแรกในระยะ '+D.aimRange+' px (ไม่มีเป้า = บินตรง '+D.aimRange+' px แล้วจางหาย)\nฮิตแรก '+c.base+'% ของตีปกติ แล้วชิ่งต่ออีก '+c.B+' ครั้ง (ระยะชิ่ง '+c.rng+' px แยกได้สูงสุด '+c.maxc+' ดวง) ฮิตชิ่ง = '+Math.round(D.later*100)+'% × '+D.decay+'^(ชั้น-1) ของฮิตแรก ต่ำสุด '+Math.round(D.floor*100)+'% · ตีซ้ำตัวเดิมได้ '+Math.round(D.repeat*100)+'% ห่างตัวละ '+D.gap+' วิ · มอนตัวเดียวถูกเด้งกลับไม่เกิน '+c.vmax+' ครั้ง\nวงหมุนรัศมี '+c.R+' px ตลอดทางบิน ตัวที่อยู่ในวงโดนเฉี่ยว '+Math.round(D.graze*100)+'% ของฮิตนั้น (ครั้งเดียวต่อตัว สูงสุด '+c.gcap+' ตัว) · ธาตุมืด · บอสถูกชิ่งใส่ได้ ไม่ถูกหยุด\nLv'+D.mark.lv+': ฮิตแรกติดเครื่องหมายจันทร์ รับดาเมจ +'+Math.round((D.mark.mul-1)*100)+'% นาน '+D.mark.sec+' วิ · ดูดเลือดรวมไม่เกิน '+Math.round(D.ls.cap*100)+'% MaxHP ต่อครั้ง (เป้าอื่น ×'+D.ls.extra+') · ค่าทดลอง ยังไม่ผ่านการเล่นจริง · รัศมีวง '+D.radius[0]+'/'+D.radius[4]+'/'+D.radius[9]+' ตาม v2.9'+(DM.on?'':'\n(ปิดอยู่ด้วย ?deathmoon=off)');},
      cost:()=>({mp:D.mp,cd:D.cd}),
      start:()=>DM.begin()};
    W_.lines.scythe.cols[0].skills.unshift(SK);DM.skill=SK;
  }
}catch(e){dERR('skill window',e);}
console.info('[SCY] death moon r2 loaded · deathmoon='+DM.on+' key='+D.key);
})();

console.info('[SCY] scythe-r1 loaded · on='+S.on+' nh='+S.nh+' dissolve='+S.dissolve+' drop='+S.drop);

})();
