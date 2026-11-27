
/* ---- p325 r2: special skill "อาณาเขตปีศาจ" Demon Domain (TEST; order orders/code/ORDER_20261028_special-demon-domain.md UPDATE 7).
   r2 = Art textures + final layout of the textured demo v14 DeaRz passed 28 Oct ("Okผ่าน เยี่ยมมาก"):
   approved/vfx/SPECIAL_DEMON_DOMAIN_textured_demo_r3_source.html, code = vfx/demos/special_demon_domain_r3/skill.js (+ tex_slice.py sprites, embedded below as TX/TXS).
   Shrine: D6 horns, D1 platform, code-drawn back wall + D2 throat + D2 teeth-only mouth frame, D3 pillars, roof body + D4/D5 roofs, D7 skull piles in front.
   Ground: V7 rune bands, D11 cracks, D12 fog. Hits: D10 slash sprites wiping along the cut (no flying blades). Seize: only the D9 ground hand gripping the legs.
   Crumble: thin ragged edge sweeps top→bottom 4.8–5.5 s throwing D8 ash/slab bits. Area UR 286 (Spear Rain 220 × 1.3, ≥ 260), 22 hits 0.11 s apart,
   numbers DeaRz approved 28 Oct 12:02 (balance/demon_domain_r1): 25 % of one basic attack per hit, CD 40 s, MP 50, Lv 30+, cast lock 0.8 s,
   stun 2.6 s mobs / 1.3 s elites (from the first hit), bosses not stunned but hit, then 4 s immune to this seize; monsters walking in during the first 1.0 s are seized too. Key 8 / teal button. ?ddlv=off lifts Lv gate.
   Off: ?demondomain=off. Low: ?ddlow=on. Debug: window.DDOM ---- */
(function(){'use strict';const Q=String(location.search);
const DD=window.DDOM={ver:'p325-r2',on:!/demondomain=off/.test(Q),ok:false,err:null,list:[],
  cfg:{NH:22,HIT_DT:.11,MUL:.25,CD:40,MP:50,LOCK:.8,STUN:2.6,STUN_E:1.3,IMM:4,LATE:1.0,UR:286,K:.55,SH:.85,MINLV:/ddlv=off/.test(Q)?0:30,low:/ddlow=on/.test(Q)},
  stats:{casts:0,refused:0,hits:0,dmg:0,perT:[],stunned:0,peakParts:0,drawMs:0,frames:0,maxMs:0,cacheN:0}};
if(!DD.on)return;
try{
if(typeof hitEnemy!=='function'||typeof bb!=='function'||typeof drawRaidTele!=='function'||typeof drawParts!=='function'||typeof update!=='function'||!window.C182||!C182.api)throw new Error('game hooks missing');
const C=DD.cfg,ID='spDemon',K=C.K,SH=C.SH,QL=()=>C.low?.5:1;
const clk=()=>typeof time==='number'?time:performance.now()/1000;
const clamp=(v,a,b)=>v<a?a:v>b?b:v,ease=x=>1-Math.pow(1-clamp(x,0,1),3),seg=(t,a,b)=>clamp((t-a)/(b-a),0,1),lerp=(a,b,u)=>a+(b-a)*u;
const rnd=(a,b)=>a+Math.random()*(b-a),hash=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
const liveE=e=>!!(e&&!e.dead&&e.hp>0&&!e.sprGhost&&!e.dev&&!e.removed);
const TT=()=>{try{return camT();}catch(_){return .866;}},TH=()=>{try{return camY();}catch(_){return 0;}};
const up=(x,y,h)=>{const th=TH(),hh=h/TT();return [x-hh*Math.sin(th),y-hh*Math.cos(th)];};
/* demo timeline (0 = press) */
const T_CAST=.25,T_RING=.35,T_CRACK=.5,T_RISE0=.6,T_SEIZE=1.65,T_HIT0=1.95,T_CRUM0=4.8,T_CRUM1=5.7,T_FADE0=5.0,T_FADE1=5.9,I_END=6.6;
const T_G=[.6,.72,.72,.9,1.05,1.15,1.05];   // rise start of: platform, gate wall, pillars, lower roof, upper roof, horns, front pile
const VP='#7a5cd0',VL='#8ff0e0',CR='#3fe0c8',EMB='#6af5d8',AMB='#e29a3c',TG='#9ff5e6';
const ROCKC=['#241a16','#4a2a22','#202e36','#d8d2b8','#5a2a20'];
let ctx_=null;const X=()=>ctx_||ctx;   // drawing context: the game canvas, or a sprite while caching
function mk(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c;}
const GL={};function glow(col){return GL[col]||(GL[col]=mk(64,64,g=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,col);r.addColorStop(.3,col+'bb');r.addColorStop(1,col+'00');g.fillStyle=r;g.fillRect(0,0,64,64);}));}
const DUST2=mk(64,64,g=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(30,38,46,.9)');r.addColorStop(.6,'rgba(24,30,38,.4)');r.addColorStop(1,'rgba(20,26,34,0)');g.fillStyle=r;g.fillRect(0,0,64,64);});
const FOG=mk(128,64,g=>{const r=g.createRadialGradient(64,32,0,64,32,64);r.addColorStop(0,'rgba(24,70,72,.55)');r.addColorStop(.6,'rgba(24,60,70,.25)');r.addColorStop(1,'rgba(20,50,60,0)');g.save();g.scale(1,.5);g.translate(0,32);g.fillStyle=r;g.fillRect(0,-32,128,128);g.restore();});
const dsv=x=>x*x*(3-2*x)*.35+x*.65;
function gRing(x,y,r,w,col,a){if(a<=0)return;const c=X();c.save();c.translate(x,y);c.scale(1,K);c.globalAlpha=a;c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.arc(0,0,r,0,6.283);c.stroke();c.restore();}
function text(x,y,s,col,a,sz){if(a<=0)return;const c=X();c.save();c.globalAlpha=a;c.font='bold '+(sz||14)+'px Sarabun,sans-serif';c.textAlign='center';c.lineWidth=3;c.strokeStyle='#0c2238';c.strokeText(s,x,y);c.fillStyle=col;c.fillText(s,x,y);c.restore();}
/* ---------- textures (Art D1–D12, sliced by tex_slice.py; identical data to the passed demo v14) ---------- */
const TX={"plat": "assets/74eed321552385ef.png", "frame": "assets/cd79bf74fe87b26c.png", "throat": "assets/5599047533d915f0.png", "pillar": "assets/763f85af40b3dfef.png", "roofL": "assets/abf3e4b17079151a.png", "roofU": "assets/1110f354ef336803.png", "pile": "assets/e1bdacaad6192714.png", "horn00": "assets/9c550d3485864573.png", "horn01": "assets/e9bbb23d0cbafc78.png", "horn02": "assets/fd9f33ad1fd58f8f.png", "horn10": "assets/0cc54610cf4c9b3b.png", "horn11": "assets/161a356137a96565.png", "horn12": "assets/79b7a651550cd23b.png", "hand0": "assets/61982539b694bbcf.png", "hand1": "assets/2afca320a8de481b.png", "hand2": "assets/79f2d9bae40b4405.png", "slash0": "assets/070cd18fccb47c50.png", "slash1": "assets/dceb31d8310cae22.png", "slash2": "assets/e071f0cb8d25fcc0.png", "crack0": "assets/b6af174f9a936545.png", "crack1": "assets/3958af1b78953bf1.png", "crack2": "assets/ef8faacecbfd409e.png", "crack3": "assets/01be7bddd7455202.png", "fog": "assets/bd251a0f344c1fbd.png", "ash0": "assets/c7fa4fc141e3f008.png", "ash1": "assets/2df3ec1e21ab254d.png", "ash2": "assets/d5bb42f1ec417754.png", "ash3": "assets/2676e43308d6bd6e.png", "ash4": "assets/8862ce1a46b09cc8.png", "ash5": "assets/1a21f8f9e6882032.png", "ash6": "assets/4e2b3c28fe6d528c.png", "ash7": "assets/db2c04d1a5058d2e.png", "ash8": "assets/6ebb425990eb6065.png", "ash9": "assets/2ebc49a3ae3cae51.png"};const TXS={"plat": [580, 86], "frame": [440, 279], "throat": [420, 234], "pillar": [52, 320], "roofL": [700, 162], "roofU": [540, 174], "pile": [360, 201], "horn00": [192, 232], "horn01": [122, 168], "horn02": [72, 120], "horn10": [202, 232], "horn11": [130, 168], "horn12": [78, 120], "hand0": [150, 74], "hand1": [150, 77], "hand2": [88, 100], "slash0": [170, 149], "slash1": [170, 195], "slash2": [170, 235], "crack0": [420, 238], "crack1": [300, 258], "crack2": [420, 202], "crack3": [300, 441], "fog": [320, 166], "ash0": [64, 38], "ash1": [64, 36], "ash2": [64, 46], "ash3": [64, 32], "ash4": [64, 47], "ash5": [64, 20], "ash6": [40, 25], "ash7": [64, 32], "ash8": [40, 38], "ash9": [64, 29]};
let T=0,tickP=0;
const TXI={};for(const k in TX){const i=new Image();i.src=TX[k];TXI[k]=i;}
let txOk=false;const TXOK=()=>{if(txOk)return true;for(const k in TXI)if(!(TXI[k].complete&&TXI[k].naturalWidth))return false;return txOk=true;};
function dC(n,cx,cy,w,fl){const c=X(),h=w*TXS[n][1]/TXS[n][0];c.save();c.translate(cx,cy);if(fl)c.scale(-1,1);c.drawImage(TXI[n],-w/2,-h/2,w,h);c.restore();}   // centred
function dCW(n,cx,cy,w,h){X().drawImage(TXI[n],cx-w/2,cy-h/2,w,h);}   // centred, free aspect
function dB(n,cx,by,w,fl){const h=w*TXS[n][1]/TXS[n][0];dC(n,cx,by-h/2,w,fl);}   // bottom-centred
function hornsDraw(){const c=X(),hz=[[58,-200,160],[108,-178,116],[28,-244,76]];for(let ci=0;ci<3;ci++){const [x0,y0,hh]=hz[ci],L0='horn0'+ci,R0='horn1'+ci,wL=hh*TXS[L0][0]/TXS[L0][1],wR=hh*TXS[R0][0]/TXS[R0][1];
  c.drawImage(TXI[L0],-x0-wL,y0-hh,wL,hh);c.drawImage(TXI[R0],x0,y0-hh,wR,hh);}}
function wallDraw(){const c=X();c.scale(.7,1.16);   // back wall: dark teal-black interior, board seams, jaw-rib bones, teal gloom round the mouth
  let g=c.createLinearGradient(0,-140,0,0);g.addColorStop(0,'#0b1418');g.addColorStop(.6,'#0f1c21');g.addColorStop(1,'#070c0e');c.fillStyle=g;c.fillRect(-158,-140,316,138);
  c.strokeStyle='rgba(2,6,8,.7)';c.lineWidth=1.5;for(let x=-150;x<=150;x+=25){c.beginPath();c.moveTo(x,-138);c.lineTo(x+(hash(x)-.5)*3,-2);c.stroke();}
  c.lineCap='round';for(const sx of[-1,1])for(let i=0;i<4;i++){const x0=sx*(118+i*13),bend=sx*(10+i*5);c.strokeStyle=i%2?'#2c3d44':'#394c52';c.lineWidth=7-i;c.beginPath();c.moveTo(x0,-136+i*6);c.quadraticCurveTo(x0+bend,-70,x0-sx*6,-6);c.stroke();c.strokeStyle='rgba(143,240,224,.28)';c.lineWidth=1.2;c.stroke();}
  c.fillStyle='#3a1612';c.fillRect(-158,-140,316,7);c.fillRect(-158,-9,316,7);
  const r=c.createRadialGradient(0,-74,10,0,-74,150);r.addColorStop(0,'rgba(63,224,200,.32)');r.addColorStop(.55,'rgba(40,150,140,.14)');r.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=r;c.fillRect(-166,-146,332,150);
  const v=c.createLinearGradient(-158,0,158,0);v.addColorStop(0,'rgba(0,0,0,.55)');v.addColorStop(.18,'rgba(0,0,0,0)');v.addColorStop(.82,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.55)');c.fillStyle=v;c.fillRect(-158,-140,316,138);}
function roofBody(){const c=X();   // solid roof body between the tiers so nothing shows through
  const g=c.createLinearGradient(0,-246,0,-150);g.addColorStop(0,'#16232a');g.addColorStop(1,'#0c161a');c.fillStyle=g;c.beginPath();c.moveTo(-160,-150);c.lineTo(-132,-246);c.lineTo(132,-246);c.lineTo(160,-150);c.closePath();c.fill();
  c.strokeStyle='rgba(2,8,10,.6)';c.lineWidth=1.5;for(let y=-238;y<-154;y+=11){c.beginPath();c.moveTo(-150,y);c.lineTo(150,y);c.stroke();}
  dB('roofL',0,-150,436);}
/* static parts drawn once into 2× sprites (order: keep cached()) */
const CACHE={};function cached(key,x0,y0,w,h,fn){let s=CACHE[key];if(!s){if(!TXOK())return;const R=2;s=CACHE[key]=mk(w*R,h*R,g=>{const o=ctx_;ctx_=g;g.scale(R,R);g.translate(-x0,-y0);try{fn();}finally{ctx_=o;}});DD.stats.cacheN++;}X().drawImage(s,x0,y0,w,h);}
/* ---------- particles: ground x/y + height z ---------- */
function add(c,p){if(c.parts.length>=(C.low?80:140))return;p.age=0;p.vx=p.vx||0;p.vy=p.vy||0;p.z=p.z||0;p.vz=p.vz||0;p.g=p.g||0;p.rot=p.rot||0;p.vr=p.vr||0;c.parts.push(p);}
function stepParts(c,dt){for(const p of c.parts){p.age+=dt;p.vz-=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.rot+=p.vr*dt;if(p.z<0&&p.floor){p.z=0;p.vz*=-.2;p.vx*=.5;p.vy*=.5;p.vr*=.4;}}c.parts=c.parts.filter(p=>p.age<p.life);DD.stats.peakParts=Math.max(DD.stats.peakParts,c.parts.length);}
function drawParts_(c){const g=ctx;for(const p of c.parts){const u=p.age/p.life,hold=p.hold||.5,a=(1-Math.max(0,u-hold)/(1-hold))*(p.a||1);if(a<=0)continue;g.globalAlpha=clamp(a,0,1);
    if(p.k==='ring'){g.save();g.translate(p.x,p.y);g.scale(1,K);const r=p.s*(.3+.7*ease(u));g.strokeStyle=p.col;g.lineWidth=p.w*(1-u);g.beginPath();g.arc(0,0,r,0,6.283);g.stroke();g.restore();continue;}
    const w=up(p.x,p.y,p.z);
    if(p.k==='dust'){const s=p.s*(1+u*1.2);g.globalAlpha*=.5;g.drawImage(DUST2,w[0]-s,w[1]-s*.6,s*2,s*1.2);}
    else if((p.k==='rock'||p.k==='ash')&&txOk){if(p.sp==null)p.sp=Math.floor(Math.random()*(p.k==='rock'?10:6));const n='ash'+p.sp,w2=p.s*(p.k==='rock'?3.6:2.8),h2=w2*TXS[n][1]/TXS[n][0];g.save();if(p.k==='ash')g.globalAlpha*=.85;g.translate(w[0],w[1]);g.rotate(p.rot);g.drawImage(TXI[n],-w2/2,-h2/2,w2,h2);g.restore();}
    else if(p.k==='rock'){g.save();g.translate(w[0],w[1]);g.rotate(p.rot);g.fillStyle=p.col||'#3a2c20';g.beginPath();g.moveTo(-p.s/2,-p.s/3);g.lineTo(p.s/2,-p.s/2);g.lineTo(p.s*.4,p.s/3);g.lineTo(-p.s*.3,p.s/2);g.closePath();g.fill();g.restore();}
    else if(p.k==='ash'){g.save();g.translate(w[0],w[1]);g.rotate(p.rot);g.fillStyle='rgba(42,50,56,.85)';g.beginPath();g.moveTo(-p.s/2,0);g.lineTo(0,-p.s*.14);g.lineTo(p.s/2,p.s*.04);g.lineTo(0,p.s*.12);g.closePath();g.fill();g.restore();}
    else{g.globalCompositeOperation='lighter';g.drawImage(glow(p.col||CR),w[0]-p.s/2,w[1]-p.s/2,p.s,p.s);g.globalCompositeOperation='source-over';}}
  g.globalAlpha=1;g.globalCompositeOperation='source-over';}
/* ---------- ground: rune bands, cracks, fog, seize wave ---------- */
const CRK=[[0,.2,330],[1,2.3,250],[2,4.0,320],[3,5.3,260]];
const areaAmt=t=>ease(seg(t,T_RING,T_RING+.3))*(1-seg(t,T_FADE0,T_FADE1));
function ringDraw(c,t,now){const a=areaAmt(t);if(a<=0)return;const g=seg(t,T_RING,T_RING+.7),R=window.STF&&STF.runeRing;
  if(R){try{R(c.x,c.y,C.UR,VL,a*.95,now*.3,0,g,K);if(t>T_RING+.5)R(c.x,c.y,C.UR*.64,VP,a*.55*seg(t,T_RING+.5,T_RING+.9),-now*.45,0,seg(t,T_RING+.5,T_RING+1.1),K);}catch(_){}}
  else gRing(c.x,c.y,C.UR,3,VL,a*.8);
  const cg=ease(seg(t,T_CRACK,T_CRACK+.45)),cd=1-.7*seg(t,T_RISE0+.8,T_RISE0+1.6);
  if(cg>0&&TXOK()){const cs=C.UR/260;ctx.save();ctx.translate(c.x,c.y);ctx.scale(1,K);ctx.beginPath();ctx.arc(0,0,225*cs*cg,0,6.283);ctx.clip();ctx.globalAlpha=a*cd;   // D11 cracks, revealed outward
    for(const [n,r,w0] of CRK){const nm='crack'+n,w=w0*cs,hh=w*TXS[nm][1]/TXS[nm][0];ctx.save();ctx.rotate(r);ctx.drawImage(TXI[nm],-w/2,-hh/2,w,hh);ctx.restore();}
    ctx.restore();}
  const fa=ease(seg(t,T_RISE0,T_RISE0+.9))*(1-seg(t,T_FADE0,T_FADE1)),nF=Math.round(14*QL());if(fa>0)for(let i=0;i<nF;i++){const th=hash(i)*6.283+now*(.08+.05*(i%3))*(i%2?1:-1),r=Math.sqrt(hash(i*2.3))*C.UR*.95,sz=70+hash(i*5)*60;ctx.globalAlpha=fa*(.6+.4*Math.sin(now*.8+i));const fo=TXI.fog.naturalWidth;ctx.drawImage(fo?TXI.fog:FOG,c.x+Math.cos(th)*r-sz,c.y+Math.sin(th)*r*K-sz*.3,sz*2,sz*.6*(fo?1.5:1));}
  ctx.globalAlpha=1;
  const w=seg(t,T_SEIZE-.15,T_SEIZE+.5);if(w>0&&w<1)gRing(c.x,c.y,C.UR*ease(w),3,TG,(1-w)*.6);}
/* ---------- the shrine: part 0 behind the characters, part 1 (bone pile) in front ---------- */
const gRise=(t,k)=>ease(seg(t,T_G[k],T_G[k]+.5));
function grp(t,k,fn){const r=gRise(t,k);if(r<=0)return;ctx.save();ctx.translate(0,(1-r)*(250+k*10)+Math.sin(seg(t,T_G[k]+.5,T_G[k]+.9)*9)*3*(1-seg(t,T_G[k]+.5,T_G[k]+.9)));ctx.globalAlpha*=Math.min(1,r*2.5);fn();ctx.restore();}
function tearY(x,cp){const i=x/8,i0=Math.floor(i),f=i-i0,sm=f*f*(3-2*f),a=hash(i0*1.7+3),b=hash((i0+1)*1.7+3),n=lerp(a,b,sm)*.2+.03*Math.sin(x*.5)*hash(i0*.9);return -310+335*dsv(clamp((cp-n)/.65,0,1));}
const crumAt=t=>Math.min(1,seg(t,T_CRUM0,T_CRUM1)*1.35);
function shrinePart(c,t,part){const crumP=crumAt(t);if(gRise(t,0)<=0||crumP>=1||t>5.5||!TXOK())return;T=t;tickP=c.tickP;
  const shk=(tickP>.7&&t>T_HIT0&&t<T_HIT0+C.NH*C.HIT_DT)?(Math.random()-.5)*1.6:0;
  bb(c.x,c.y,()=>{ctx.save();ctx.translate(c.x+shk,c.y);ctx.scale(SH,SH);ctx.beginPath();
  if(t<T_CRUM0){ctx.rect(-300,-480,600,480+38);}else{   // tears away top to bottom along a thin ragged edge
    ctx.moveTo(-264,80);for(let x=-264;x<=264;x+=4)ctx.lineTo(x,tearY(x,crumP));ctx.lineTo(264,80);ctx.closePath();}
  ctx.globalAlpha=1-ease(seg(t,T_CRUM0+.1,5.35));ctx.clip();
  if(part===0){
    grp(t,5,()=>cached('h',-220,-395,440,260,hornsDraw));
    grp(t,0,()=>cached('p',-150,-30,300,60,()=>dC('plat',0,-2,290)));
    grp(t,1,()=>{cached('wall',-140,-170,280,176,wallDraw);
      const pu=.5+.5*Math.sin(t*1.7)+tickP*.6;ctx.save();ctx.globalAlpha*=.85+.15*Math.min(1,pu);dCW('throat',0,-80,176*(1+.012*pu),150*(1+.012*pu));ctx.restore();
      if(t>T_HIT0&&t<T_HIT0+C.NH*C.HIT_DT){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=.16*tickP;dCW('throat',0,-80,168,144);ctx.restore();}
      dCW('frame',0,-80,196,176);});   // UPDATE 7: teeth-only mouth frame
    grp(t,2,()=>cached('pl',-150,-176,300,186,()=>{const g=X();g.drawImage(TXI.pillar,-114,-162,26,158);g.drawImage(TXI.pillar,88,-162,26,158);}));
    grp(t,3,()=>cached('r1',-225,-280,450,160,roofBody));
    grp(t,4,()=>cached('r2',-175,-345,350,150,()=>dB('roofU',0,-198,340)));}
  else{
    grp(t,6,()=>{cached('pile',-225,-120,450,170,()=>{dB('pile',-130,40,172);dB('pile',130,40,172,true);});
      ctx.save();ctx.globalCompositeOperation='lighter';for(const sx of[-1,1])for(let j=0;j<4;j++){const u=(t*.8+j/4+hash(sx+j))%1;ctx.globalAlpha=.6*Math.sin(u*Math.PI);ctx.drawImage(glow(j%2?TG:CR),sx*84-10+Math.sin(t*3+j)*6,-20-u*40,20,28);}ctx.restore();});}
  ctx.restore();});}
/* ---------- per target: slash marks, shadow hands, stun mark ---------- */
function slashDraw(c,t){if(!TXOK())return;for(const s of c.slashes){const e=s.e,age=t-s.t;if(age<0||age>.2)continue;const sz=e.sz||16,sc=clamp(sz/16,.8,1.5),h=k=>hash(s.i*9.1+s.ti*3.3+k*1.7);
  const rv=Math.min(1,age/.06),sf=1-seg(age,.08,.2),w=(78+h(7)*46)*sc,cx=e.x+(h(8)-.5)*14*sc,cy=e.y-sz*1.1+(h(9)-.5)*12*sc,fl=h(10)<.5?-1:1;
  bb(e.x,e.y,()=>{for(let d=0;d<(h(13)<.3?2:1);d++){const n='slash'+((s.i+d)%4===3?1:0),o=d*(h(14)>.5?10:-10)*sc,hh=w*TXS[n][1]/TXS[n][0];   // D10 cut, wiping along like a blade pass
    ctx.save();ctx.globalAlpha=sf*(d?.75:1);ctx.translate(cx+o*.4,cy+o);ctx.rotate((h(6)-.5)*.5+(d?.25:0));ctx.scale(fl,1);ctx.beginPath();ctx.rect(-w/2,-hh/2,w*rv,hh);ctx.clip();ctx.drawImage(TXI[n],-w/2,-hh/2,w,hh);ctx.restore();}});}}
function foeHands(c,T_,t){const e=T_.e;if(!T_.sd)return;   // bosses: immune to the seize, still take the hits
  const gr=ease(seg(t,T_.ts,T_.ts+.3))*(1-ease(seg(t,T_.te,T_.te+.35)));if(gr<=0||e.removed||!TXOK())return;   // DeaRz: only the ground hand gripping the legs, in front
  const sc=clamp((e.sz||16)/16,.9,1.3),tr=Math.sin(t*34+4)*(c.tickP>.6?1.4:.3)*gr;
  bb(e.x,e.y,()=>{ctx.save();ctx.globalAlpha=Math.min(1,gr*1.8);dB('hand2',e.x+tr,e.y+9+(1-gr)*30,36*sc);ctx.restore();});}
function foeStun(c,T_,t){const e=T_.e;if(!T_.sd)return;const gr=ease(seg(t,T_.ts+.1,T_.ts+.35))*(1-seg(t,T_.te,T_.te+.25));if(gr<=0||e.dead)return;const hh=(e.sz||16)*2.6;
  bb(e.x,e.y,()=>{ctx.save();ctx.globalAlpha=gr*.5;ctx.drawImage(DUST2,e.x-30,e.y-8,60,16);ctx.restore();
  ctx.save();ctx.globalCompositeOperation='lighter';for(let j=0;j<3;j++){const an=t*5+j*2.094,x=e.x+Math.cos(an)*14,y=e.y-hh+Math.sin(an)*5;ctx.globalAlpha=gr*(.5+.4*Math.sin(an));ctx.drawImage(glow(EMB),x-6,y-6,12,12);}ctx.restore();
  if(t>T_.ts+.15&&t<T_.ts+.9)text(e.x,e.y-hh-14-seg(t,T_.ts+.15,T_.ts+.9)*10,'ชะงัก',VL,1-seg(t,T_.ts+.55,T_.ts+.9),12);});}
/* ---------- damage: 12 % (placeholder) of one basic attack of the held weapon ---------- */
function mkCtx(){const wt=P.weapon&&P.weapon.t,A=C182.api;let coef=4;try{const D=typeof A.D==='function'?A.D():null,wd=D&&D.weapons&&D.weapons[wt];if(wd&&wd.actionCoef>0)coef=wd.actionCoef;}catch(_){}
  const W=typeof WEAPONS!=='undefined'&&WEAPONS[wt],dt=W&&W.magic?'mag':'phys';
  const def={id:ID,mode:'native',coefTotal:coef,flatTotal:0,weights:Array(32).fill(1),maxTargets:99,targeting:'around',element:'Neutral',range:900};
  const cx=A.ctxFor('skill',ID,def,{dt,lvScale:1,m0:1,reach:1400,cdId:ID});cx.coef=coef;return cx;}
function deal(e,c){const prev=C182.cur,vx=e.vx,vy=e.vy;let r=0;C182.cur=c.cx;try{r=hitEnemy(e,C.MUL,{dt:c.cx.dt,ctx:c.cx,kind:'demon',fx:c.x,fy:c.y})||0;}catch(er){DD.err='dmg '+er.message;}finally{C182.cur=prev;e.vx=vx;e.vy=vy;}   // the hands hold it: hits do not push a seized monster
  DD.stats.hits++;DD.stats.dmg+=Math.max(0,r);return r;}
const isBoss=e=>!!(e.m&&e.m.boss),isElite=e=>!!(e.m&&e.m.elite)||!!e.eliteX;
/* ---------- render DPR cap 1.5 while the skill runs (the game's own cap is already ≤ 1.5 on most setups) ---------- */
let dprCapped=false;
function dprCap(on){try{if(typeof gfxCap!=='function'||typeof resize!=='function')return;if(on===dprCapped)return;if(on&&(window.devicePixelRatio||1)<=1.5)return;dprCapped=on;resize();}catch(_){}}
try{if(typeof gfxCap==='function'){const o=gfxCap;gfxCap=function(){const v=o.apply(this,arguments);return dprCapped?Math.min(1.5,v):v;};}}catch(_){}
/* ---------- cast / tick ---------- */
function say(txt){try{textAt(P.x,P.y-62,txt,'#9ff5e6',13);}catch(_){}}
function ready(){const why=!P||P.dead||G.state!=='play'?'—':(P.lvl|0)<C.MINLV?'ต้อง Lv '+C.MINLV+' ขึ้นไป':(P.cds[ID]||0)>0?'ยังคูลดาวน์ '+Math.ceil(P.cds[ID])+' วิ':P.mp<C.MP?'มานาไม่พอ ('+C.MP+')':'';
  if(why){DD.stats.refused++;if(why!=='—')say('อาณาเขตปีศาจ: '+why);}return !why;}
function cast(){if(!ready())return false;const now=clk();P.mp-=C.MP;P.cds[ID]=C.CD;P.atkCd=Math.max(P.atkCd||0,C.LOCK);
  const c={t0:now,x:P.x,y:P.y,ev:{},parts:[],slashes:[],targets:[],cx:mkCtx(),tickP:0};DD.list.push(c);DD.stats.casts++;DD.stats.perT=[];dprCap(true);return true;}
DD.cast=cast;
function once(c,k,f){if(!c.ev[k]){c.ev[k]=1;f();}}
function tick(dt){const now=clk();if(!DD.list.length)return;
  for(const c of DD.list){const t=now-c.t0,q=QL();
    const inTick=t>=T_HIT0&&t<T_HIT0+C.NH*C.HIT_DT+.3;c.tickP=inTick?.5+.5*Math.cos(((t-T_HIT0)/C.HIT_DT)*6.283):0;
    if(t>=T_CRACK+.1)once(c,'burst',()=>{for(let i=0;i<14;i++)add(c,{k:'rock',x:c.x+rnd(-90,90),y:c.y+rnd(-6,10),vx:rnd(-90,90),vz:rnd(120,260),g:620,floor:1,s:rnd(4,9),vr:rnd(-12,12),life:rnd(.6,.9),hold:.5,col:['#3a2c20','#2a2018','#4a3a28'][i%3]});try{shake(3);}catch(_){}});
    if(t>=T_RISE0&&t<T_G[6]+.9){if(Math.random()<dt*46*q)add(c,{k:'dust',x:c.x+rnd(-120,120),y:c.y+rnd(-4,16),vx:rnd(-30,30),vz:rnd(8,36),s:rnd(24,40),life:rnd(.8,1.3),hold:.3,a:.7});
      if(Math.random()<dt*16*q)add(c,{k:'s',x:c.x+rnd(-110,110),y:c.y+rnd(-2,14),s:rnd(14,24),col:CR,vz:rnd(20,60),life:rnd(.5,.9)});
      if(Math.random()<dt*14*q)add(c,{k:'rock',x:c.x+rnd(-110,110),y:c.y+rnd(-2,10),vx:rnd(-50,50),vz:rnd(60,150),g:520,floor:1,s:rnd(3,6),vr:rnd(-10,10),life:rnd(.5,.8),hold:.4,col:ROCKC[0]});}
    if(t>=T_SEIZE-.1&&t<T_SEIZE-.1+C.LATE){if(!c.seen)c.seen=new Set();const first=!c.ev.lock;c.ev.lock=1;if(first){try{shake(2.5);}catch(_){}}
      for(const e of enemies){if(c.seen.has(e)||!liveE(e))continue;const d=Math.hypot(e.x-c.x,(e.y-c.y)/K);if(d>C.UR+(e.sz||16)*.5)continue;c.seen.add(e);   // inside at the seize, or walks in during the first 1.0 s
        const ts=Math.max(t,T_SEIZE+.4*Math.min(1,d/C.UR)),boss=isBoss(e),now=clk(),imm=(e._ddImm||0)>now,sd=boss||imm?0:isElite(e)?C.STUN_E:C.STUN,te=ts+.3+sd;   // stun counts from the first hit
        if(sd>0){e.st=e.st||{};e.st.stun=Math.max(e.st.stun||0,te-t);e._ddImm=now+(te-t)+C.IMM;DD.stats.stunned++;}
        c.targets.push({e,ts,te:sd>0?te:ts,n:0,ti:c.targets.length,sd});DD.stats.perT.push(0);}}
    for(const T_ of c.targets){if(t>=T_.ts&&t<T_.te&&liveE(T_.e)){T_.e.vx=0;T_.e.vy=0;}while(T_.n<C.NH&&t>=T_.ts+.3+T_.n*C.HIT_DT){const e=T_.e;if(!liveE(e)){T_.n=C.NH;break;}
      deal(e,c);T_.n++;DD.stats.perT[T_.ti]=T_.n;c.slashes.push({e,t,i:T_.n,ti:T_.ti});add(c,{k:'ring',x:e.x,y:e.y,s:34,w:3,col:T_.n%2?AMB:CR,life:.3,a:.8});}}
    c.slashes=c.slashes.filter(s=>t<s.t+.3);
    if(areaAmt(t)>.5&&Math.random()<dt*20*q){const a=rnd(0,6.283);add(c,{k:'s',x:c.x+Math.cos(a)*C.UR,y:c.y+Math.sin(a)*C.UR*K,s:rnd(6,10),col:Math.random()<.5?CR:TG,vz:rnd(30,90),life:rnd(.5,.9)});}
    if(t>=T_CRUM0&&t<=5.3){const p=crumAt(t);c.acc=(c.acc||0)+dt*62*q;while(c.acc>=1){c.acc--;   // thrown from the tear edge as it sweeps down (D8 ash / slab bits)
        const lx=rnd(-190,190),ly=tearY(lx,p)+rnd(0,14),x=c.x+SH*lx,y=c.y+rnd(-3,3),z=Math.max(0,-SH*ly);
        if(Math.random()<.3)add(c,{k:'rock',x,y,z,vx:rnd(-60,60),vz:-rnd(10,80),g:420,floor:1,s:rnd(3,7),vr:rnd(-8,8),life:rnd(.7,1.05),hold:.5,col:ROCKC[Math.floor(rnd(0,5))]});
        else add(c,{k:'ash',x,y,z,vx:rnd(-30,30),vz:-rnd(40,110),g:320,floor:1,s:rnd(5,12),life:rnd(.7,1.05),hold:.4,rot:rnd(0,6),vr:rnd(-6,6)});}
      if(Math.random()<dt*12*q)add(c,{k:'s',x:c.x+rnd(-110,110),y:c.y,z:Math.max(0,-SH*(-330+380*dsv(p)))+rnd(0,30),s:rnd(8,14),col:EMB,vz:rnd(10,40),life:.35});}
    stepParts(c,dt);}
  DD.list=DD.list.filter(c=>now-c.t0<I_END);if(!DD.list.length)dprCap(false);}
{const o=update;update=function(dt){const r=o.apply(this,arguments);try{if(G.state==='play')tick(dt);}catch(e){DD.err='tick '+e.message;}return r;};}
/* ---------- drawing ---------- */
function drawGround(){const now=clk();
  for(const c of DD.list){const t=now-c.t0;
    const d=seg(t,T_RISE0,T_RISE0+1)*(1-seg(t,T_FADE0,T_FADE1))*.4;if(d>0){ctx.save();ctx.fillStyle='rgba(4,10,18,'+d+')';ctx.fillRect(c.x-2600,c.y-2600,5200,5200);ctx.restore();}   // dim (fades in .6–1.6 s, out 5.0–5.9 s)
    ringDraw(c,t,now);ctx.save();shrinePart(c,t,0);ctx.restore();
  }}
function drawTop(){const now=clk();
  for(const c of DD.list){const t=now-c.t0;for(const T_ of c.targets){foeHands(c,T_,t);foeStun(c,T_,t);}
    ctx.save();shrinePart(c,t,1);ctx.restore();slashDraw(c,t);drawParts_(c);}}
{const o=drawRaidTele;drawRaidTele=function(){const r=o.apply(this,arguments);try{if(DD.list.length){ctx.save();drawGround();ctx.restore();}}catch(e){DD.err='ground '+e.message;}return r;};}
{const o=drawParts;drawParts=function(){const r=o.apply(this,arguments);if(!DD.list.length)return r;const t0=performance.now();
  try{ctx.save();drawTop();ctx.restore();}catch(e){DD.err='draw '+e.message;}
  const ms=performance.now()-t0;DD.stats.frames++;DD.stats.drawMs+=ms;DD.stats.maxMs=Math.max(DD.stats.maxMs,ms);return r;};}
/* ---------- input: key 8 / the button (casts at once, nothing to aim) ---------- */
const blockedUI=()=>!P||P.dead||G.state!=='play'||!!G.win||(typeof ED!=='undefined'&&ED.on);
addEventListener('keydown',e=>{try{if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||e.key!=='8')return;const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;
  if(blockedUI())return;e.stopImmediatePropagation();e.preventDefault();cast();}catch(er){DD.err='key '+er.message;}},true);
const css=document.createElement('style');css.id='p325';css.textContent=
 '#ddBtn{position:fixed;left:14px;top:240px;z-index:57;width:52px;height:52px;padding:0;border-radius:50%;border:2px solid #3fe0c8;background:radial-gradient(circle at 50% 40%,#173238,#071014);cursor:pointer;display:none;touch-action:manipulation;overflow:hidden;box-shadow:0 0 8px rgba(63,224,200,.4)}'
 +'#ddBtn svg{position:absolute;inset:8px;width:32px;height:32px;pointer-events:none}'
 +'#ddBtn .k{position:absolute;z-index:3;left:3px;top:1px;font:600 9px sans-serif;color:#dffcf6;background:rgba(0,0,0,.6);padding:0 3px;border-radius:4px}'
 +'#ddBtn .cd{position:absolute;inset:0;z-index:1;border-radius:50%;background:conic-gradient(rgba(0,0,0,.66) calc(var(--cd,0)*360deg),transparent 0)}'
 +'#ddBtn .ct{position:absolute;inset:0;z-index:2;display:flex;align-items:center;justify-content:center;font:700 15px sans-serif;color:#fff;text-shadow:0 1px 2px #000}'
 +'#ddBtn.nomp{opacity:.55}@media (hover:none){#ddBtn .k{display:none}#ddBtn{width:56px;height:56px}}';
document.head.appendChild(css);
const btn=document.createElement('button');btn.type='button';btn.id='ddBtn';btn.title='อาณาเขตปีศาจ (สกิลพิเศษ · คีย์ 8)';btn.setAttribute('aria-label','อาณาเขตปีศาจ สกิลพิเศษ');
btn.innerHTML='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 14 Q9 4 6 1 Q12 7 12 12 Z M28 14 Q23 4 26 1 Q20 7 20 12 Z" fill="#5a6a72"/><path d="M5 15 L16 9 L27 15 L24 15 L24 27 L8 27 L8 15 Z" fill="#1c2a31" stroke="#3fe0c8" stroke-width="1"/>'
 +'<path d="M12 27 L12 19 Q16 15 20 19 L20 27 Z" fill="#07090c"/><circle cx="16" cy="22" r="2.5" fill="#3fe0c8" opacity=".8"/><path d="M12.5 19.5 l1 2 1-2 1 2 1-2 1 2 1-2 1 2" stroke="#d8d2b8" stroke-width="1" fill="none"/></svg>'
 +'<span class="cd"></span><span class="ct"></span><span class="k">8</span>';
document.body.appendChild(btn);
for(const t of ['pointerdown','mousedown','mouseup','touchstart','touchend'])btn.addEventListener(t,e=>{e.stopPropagation();if(t==='touchstart'&&e.cancelable)e.preventDefault();});
btn.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();cast();});
btn.addEventListener('pointerup',e=>{if(e.pointerType==='touch'){e.stopPropagation();cast();}});
function place(){const sk=document.getElementById('sakBtn'),bw=btn.offsetWidth||52;let r=null;if(sk&&getComputedStyle(sk).display!=='none'){const q=sk.getBoundingClientRect();if(q.width>0)r=q;}
  if(r){btn.style.left=Math.round(Math.max(8,r.left-bw-10))+'px';btn.style.top=Math.round(r.top+(r.height-bw)/2)+'px';return;}
  const bar=document.getElementById('bar'),q=bar&&bar.getBoundingClientRect();if(q&&q.width>0){btn.style.left=Math.round(Math.max(8,q.left-bw-10))+'px';btn.style.top=Math.round(q.top+(q.height-bw)/2)+'px';}}
setInterval(()=>{try{const show=G.state==='play'&&!G.win&&P&&!P.dead&&!(typeof ED!=='undefined'&&ED.on);btn.style.display=show?'block':'none';if(!show)return;place();
  const cd=(P.cds&&P.cds[ID])||0;btn.querySelector('.cd').style.setProperty('--cd',cd>0?Math.min(1,cd/C.CD):0);btn.querySelector('.ct').textContent=cd>0?(cd>=10?String(Math.ceil(cd)):cd.toFixed(1)):'';btn.classList.toggle('nomp',P.mp<C.MP||(P.lvl|0)<C.MINLV);}catch(_){}},120);
DD.ok=true;
}catch(e){DD.err=e.message;DD.ok=false;}
})();

