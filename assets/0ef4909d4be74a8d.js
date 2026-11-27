
/* ---- p324 r1: special skill "ดาบซากุระ" Sakura Blade (TEST; order orders/code/ORDER_20261028_special-sakura-blade.md, DeaRz passed demo v7 28 Oct 10:16).
   Look + timing = approved/vfx/SPECIAL_SAKURA_BLADE_demo_r7_source.html, ported to the game camera (ground plane K 0.55 as the staff ground areas,
   upright parts through bb(), petal heights lifted up-screen). Not tied to a weapon: one pink button (left side) + key 7.
   PC: key 7 / click the button → path follows the mouse, left click = use, right click / Esc / 7 again = cancel.
   Phone: hold the button and drag (aim like the other ground skills), release = use; plain tap = toward the nearest monster; release back on the button = cancel.
   Path = Ball Lightning sweep: centre line 450, radius 135 (ground plane). Pink lane only while aiming, fades 0.3 s after use.
   Hits: every monster inside the lane at the moment of use takes 23 hits 0.12 s apart from when the petal front reaches it (1.75 s + (u−70)/380 + 0.08 s
   after the click in demo time), pierce, each hit its own number + slash mark. Hit = 30 % of one basic attack of the held weapon (C182 actionCoef),
   crit as normal, no element. CD 25 s, MP 35, lock 1.0 s (no basic attack; walking allowed). Numbers = balance/sakura_blade_r1, approved by DeaRz 28 Oct 10:29 (23 × 30 %, CD 25 s, MP 35, player Lv 30+).
   No skill window / NPC learning yet (built later). Lv 30 gate on; ?sakuralv=off lifts it for testing. Off: ?sakura=off. Fewer petals: ?sakuralow=on. Debug: window.SAKURA ---- */
(function(){'use strict';const Q=String(location.search);
const SK=window.SAKURA={ver:'p324-r1',on:!/sakura=off/.test(Q),ok:false,err:null,list:[],aim:null,
  cfg:{NH:23,HIT_DT:.12,MUL:.30,CD:25,MP:35,LOCK:1.0,PATH_L:450,PATH_R:135,SW_U:70,K:.55,VFRONT:380,MINLV:/sakuralv=off/.test(Q)?0:30,low:/sakuralow=on/.test(Q)},
  stats:{casts:0,refused:0,cancel:0,hits:0,dmg:0,perT:[],peakPet:0,peakParts:0,drawMs:0,frames:0,maxMs:0}};
if(!SK.on)return;
try{
if(typeof hitEnemy!=='function'||typeof bb!=='function'||typeof drawRaidTele!=='function'||typeof drawParts!=='function'||typeof update!=='function'||!window.C182||!C182.api)throw new Error('game hooks missing');
const C=SK.cfg,ID='spSakura',K=C.K;
const clk=()=>typeof time==='number'?time:performance.now()/1000;
const clamp=(v,a,b)=>v<a?a:v>b?b:v,ease=x=>1-Math.pow(1-clamp(x,0,1),3),seg=(t,a,b)=>clamp((t-a)/(b-a),0,1),lerp=(a,b,u)=>a+(b-a)*u;
const rnd=(a,b)=>a+Math.random()*(b-a),hash=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
const liveE=e=>!!(e&&!e.dead&&e.hp>0&&!e.sprGhost&&!e.dev&&!e.removed);
const TT=()=>{try{return camT();}catch(_){return .866;}},TH=()=>{try{return camY();}catch(_){return 0;}};
const dk=(x,y)=>{const th=TH();return Math.sin(th)*x+Math.cos(th)*y;};   // depth like depthKey()
const up=(x,y,h)=>{const th=TH(),hh=h/TT();return [x-hh*Math.sin(th),y-hh*Math.cos(th)];};   // a point h px above the ground, as an upright billboard
/* demo timeline, 0 = the click (demo AIM_T 1.0 subtracted) */
const FALL0=.05,PLANT=.32,DISS0=.55,DISS1=1.35,SURGE0=.75,EM_END=3.37,I_END=6.2;
const PK='#ff9fc0',PL='#ffd3e2',PW='#fff4f8';
function mk(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c;}
const GL={};function glow(col){return GL[col]||(GL[col]=mk(64,64,g=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,col);r.addColorStop(.3,col+'bb');r.addColorStop(1,col+'00');g.fillStyle=r;g.fillRect(0,0,64,64);}));}
function petalSpr(c0,c1){return mk(32,32,g=>{const r=g.createRadialGradient(16,22,1,16,14,18);r.addColorStop(0,c0);r.addColorStop(1,c1);g.fillStyle=r;g.beginPath();g.moveTo(16,29);g.bezierCurveTo(3,23,1,8,10,3);g.lineTo(16,9);g.lineTo(22,3);g.bezierCurveTo(31,8,29,23,16,29);g.fill();
  g.strokeStyle='rgba(217,85,138,.35)';g.lineWidth=1;g.beginPath();g.moveTo(16,27);g.lineTo(16,11);g.stroke();});}
const PET=[petalSpr('#fff4f8','#ffc2d8'),petalSpr('#ffd3e2','#ff9fc0'),petalSpr('#ffb3cf','#e8709e')];
const DUST=mk(64,64,g=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(222,200,190,.9)');r.addColorStop(.6,'rgba(200,176,168,.4)');r.addColorStop(1,'rgba(190,170,160,0)');g.fillStyle=r;g.fillRect(0,0,64,64);});
function drawPetal(x,y,s,rot,flip,spr,a){if(a<=0)return;ctx.globalAlpha=a;ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(flip,1);ctx.drawImage(spr,-s/2,-s/2,s,s);ctx.restore();}
function band(pts,wf,col,a){if(pts.length<2||a<=0)return;const L2=[],R2=[];for(let i=0;i<pts.length;i++){const p0=pts[Math.max(0,i-1)],p1=pts[Math.min(pts.length-1,i+1)],dx=p1[0]-p0[0],dy=p1[1]-p0[1],l=Math.hypot(dx,dy)||1,w=wf(pts[i][2])/2;L2.push([pts[i][0]-dy/l*w,pts[i][1]+dx/l*w]);R2.push([pts[i][0]+dy/l*w,pts[i][1]-dx/l*w]);}
  ctx.save();ctx.globalAlpha=a;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(L2[0][0],L2[0][1]);for(const q of L2)ctx.lineTo(q[0],q[1]);for(let i=R2.length-1;i>=0;i--)ctx.lineTo(R2[i][0],R2[i][1]);ctx.closePath();ctx.fill();ctx.restore();}
/* ground plane: (u along the path, v across) → world */
const GP=(c,u,v)=>[c.hx+Math.cos(c.a)*u-Math.sin(c.a)*v,c.hy+K*(Math.sin(c.a)*u+Math.cos(c.a)*v)];
const angTo=(x,y)=>Math.atan2((y-P.y)/K,x-P.x);
function inLane(e,hx,hy,a){const dx=e.x-hx,dy=(e.y-hy)/K,c=Math.cos(a),s=Math.sin(a),u=dx*c+dy*s,v=-dx*s+dy*c,cu=clamp(u,0,C.PATH_L);return Math.hypot(u-cu,v)<=C.PATH_R+(e.sz||16)*.5?cu:-1;}
/* ---------- damage: 30 % of one basic attack of the held weapon ---------- */
function mkCtx(){const wt=P.weapon&&P.weapon.t,A=C182.api;let coef=4;try{const D=typeof A.D==='function'?A.D():null,wd=D&&D.weapons&&D.weapons[wt];if(wd&&wd.actionCoef>0)coef=wd.actionCoef;}catch(_){}
  const W=typeof WEAPONS!=='undefined'&&WEAPONS[wt],dt=W&&W.magic?'mag':'phys';
  const def={id:ID,mode:'native',coefTotal:coef,flatTotal:0,weights:Array(32).fill(1),maxTargets:99,targeting:'around',element:'Neutral',range:900};
  const cx=A.ctxFor('skill',ID,def,{dt,lvScale:1,m0:1,reach:1400,cdId:ID});cx.coef=coef;return cx;}
function deal(e,c){const prev=C182.cur;let r=0;C182.cur=c.cx;try{r=hitEnemy(e,C.MUL,{dt:c.cx.dt,ctx:c.cx,kind:'sakura',fx:e.x,fy:e.y})||0;}catch(er){SK.err='dmg '+er.message;}finally{C182.cur=prev;}
  SK.stats.hits++;SK.stats.dmg+=Math.max(0,r);return r;}
/* ---------- petal storm (closed-form paths, demo mkPetals / petPos) ---------- */
const petU=(p,a)=>p.u0+p.vmax*(a-.35*(1-Math.exp(-a/.35)));
function mkPetals(c){const N=C.low?170:320,out=[];for(let i=0;i<N;i++){const h=k=>hash(i*17.3+k*5.1+c.seed);
  const p={b:SURGE0+(i/N)*(EM_END-SURGE0)+h(1)*.04,vmax:lerp(250,420,h(2)),spread:lerp(10,C.PATH_R*.95,Math.pow(h(3),.6)),ph:h(4)*6.283,fr:lerp(2.5,5.5,h(5)),ph2:h(6)*6.283,fr2:lerp(3,7,h(7)),v0:(h(8)-.5)*18,u0:C.SW_U+(h(9)-.5)*16,sz:lerp(9,17,h(10)),sp:lerp(3,9,h(11)),spph:h(12)*6.283,tint:h(13)<.45?0:h(13)<.8?1:2,uE:lerp(330,490,Math.pow(h(14),.6)),h0:lerp(50,90,h(15)),tr:i%2===0};
  let a=0;for(;a<4;a+=.02)if(petU(p,a)>=p.uE)break;p.aE=a;p.life=a+1.1;out.push(p);}return out;}
function petPos(c,p,a){const env=ease(a/.45),q=a>p.aE?clamp((a-p.aE)/1.1,0,1):0;const u=Math.min(petU(p,a),p.uE)+22*ease(q);
  const v=p.v0+p.spread*env*Math.sin(a*p.fr+p.ph)*(1-.6*ease(q));
  const hg=(p.h0*(1-env)+12+30*env*(.5+.5*Math.sin(a*p.fr2+p.ph2)))*(1-ease(q));
  const g=GP(c,u,v),w=up(g[0],g[1],hg),al=Math.min(1,a/.12)*(q>.55?1-(q-.55)/.45:1);
  return {x:w[0],y:w[1],gx:g[0],gy:g[1],al,rot:p.sp*a+p.spph,fl:Math.abs(Math.cos(a*p.sp*.9+p.ph))*.85+.15};}
let petN=0;
function petalsDraw(c,t,front){const hd=dk(P.x,P.y);ctx.save();
  for(const p of c.pets){const a=t-p.b;if(a<0||a>p.life)continue;const o=petPos(c,p,a);if(o.al<=0)continue;if((dk(o.gx,o.gy)>hd)!==front)continue;petN++;
    if(p.tr&&a<p.aE)for(let g=2;g>=1;g--){const o2=petPos(c,p,Math.max(0,a-g*.04));drawPetal(o2.x,o2.y,p.sz*(1-.12*g),o2.rot,o2.fl,PET[p.tint],o.al*(g===1?.3:.15));}
    drawPetal(o.x,o.y,p.sz,o.rot,o.fl,PET[p.tint],o.al*.92);}
  ctx.restore();ctx.globalAlpha=1;}
function ribbons(c,t){const on=seg(t,SURGE0+.1,SURGE0+.5)*(1-seg(t,EM_END,EM_END+.8));if(on<=0)return;const front=Math.min(C.PATH_L+40,C.SW_U+C.VFRONT*(t-SURGE0)),nR=C.low?3:4,tc=clk();
  for(let k=0;k<nR;k++){const pts=[];for(let j=0;j<=16;j++){const f=j/16,u=lerp(C.SW_U,front,f),v=Math.sin(u*.021-tc*5.5+k*1.9)*(30+22*k)*ease(f*3),hg=22+14*Math.sin(u*.03-tc*4+k),g=GP(c,u,v),w=up(g[0],g[1],hg);pts.push([w[0],w[1],f]);}
    band(pts,f=>lerp(2,12,Math.sin(f*Math.PI)),k%2?PK:PL,.2*on);}}
/* ---------- small particles (dust, petals, rings, sparks): ground x/y + height z ---------- */
function add(c,p){if(c.parts.length>=(C.low?90:150))return;p.age=0;p.vx=p.vx||0;p.vy=p.vy||0;p.z=p.z||0;p.vz=p.vz||0;p.g=p.g||0;p.rot=p.rot||0;p.vr=p.vr||0;p.drag=p.drag||0;c.parts.push(p);}
function stepParts(c,dt){for(const p of c.parts){p.age+=dt;p.vx*=1-p.drag*dt;p.vy*=1-p.drag*dt;p.vz=p.vz*(1-p.drag*dt)-p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.rot+=p.vr*dt;if(p.z<0&&p.floor){p.z=0;p.vz*=-.2;p.vx*=.5;p.vy*=.5;p.vr*=.4;}}c.parts=c.parts.filter(p=>p.age<p.life);SK.stats.peakParts=Math.max(SK.stats.peakParts,c.parts.length);}
function drawParts_(c){for(const p of c.parts){const u=p.age/p.life,hold=p.hold||.5,a=(1-Math.max(0,u-hold)/(1-hold))*(p.a||1);if(a<=0)continue;ctx.globalAlpha=clamp(a,0,1);
    if(p.k==='ring'){ctx.save();ctx.translate(p.x,p.y);ctx.scale(1,K);const r=p.s*(.3+.7*ease(u));ctx.strokeStyle=p.col;ctx.lineWidth=p.w*(1-u);ctx.beginPath();ctx.arc(0,0,r,0,6.283);ctx.stroke();ctx.restore();continue;}
    const w=up(p.x,p.y,p.z);
    if(p.k==='dust'){const s=p.s*(1+u*1.2);ctx.globalAlpha*=.5;ctx.drawImage(DUST,w[0]-s,w[1]-s*.6,s*2,s*1.2);}
    else if(p.k==='pet'){const s=p.s,fl=Math.abs(Math.cos(p.age*(p.spin||6)+p.ph))*.85+.15;ctx.save();ctx.translate(w[0],w[1]);ctx.rotate(p.rot);ctx.scale(fl,1);ctx.drawImage(PET[p.tint||0],-s/2,-s/2,s,s);ctx.restore();}
    else{ctx.globalCompositeOperation='lighter';ctx.drawImage(glow(p.col||PK),w[0]-p.s/2,w[1]-p.s/2,p.s,p.s);ctx.globalCompositeOperation='source-over';}}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
/* ---------- ground: aim lane (stadium) with petals round its edge ---------- */
function stadium(){const L2=C.PATH_L,R=C.PATH_R;ctx.beginPath();ctx.moveTo(0,-R);ctx.lineTo(L2,-R);ctx.arc(L2,0,R,-Math.PI/2,Math.PI/2);ctx.lineTo(0,R);ctx.arc(0,0,R,Math.PI/2,Math.PI*1.5);ctx.closePath();}
function stadPt(s){const L2=C.PATH_L,R=C.PATH_R,pi=Math.PI,arc=pi*R;s=((s%(2*L2+2*arc))+2*L2+2*arc)%(2*L2+2*arc);
  if(s<L2)return [s,-R,0];s-=L2;if(s<arc){const an=-pi/2+s/R;return [L2+Math.cos(an)*R,Math.sin(an)*R,an+pi/2];}s-=arc;
  if(s<L2)return [L2-s,R,pi];s-=L2;const an=pi/2+s/R;return [Math.cos(an)*R,Math.sin(an)*R,an+pi/2];}
function laneDraw(hx,hy,a,on){if(on<=0)return;const tc=clk(),pulse=.85+.15*Math.sin(tc*6);
  ctx.save();ctx.translate(hx,hy);ctx.scale(1,K);ctx.rotate(a);stadium();ctx.save();ctx.clip();
  const lg=ctx.createLinearGradient(0,-C.PATH_R,0,C.PATH_R);lg.addColorStop(0,'rgba(255,159,192,0)');lg.addColorStop(.12,'rgba(255,140,180,.6)');lg.addColorStop(.5,'rgba(255,200,222,.24)');lg.addColorStop(.88,'rgba(255,140,180,.6)');lg.addColorStop(1,'rgba(255,159,192,0)');
  ctx.globalAlpha=on*pulse;ctx.fillStyle=lg;ctx.fillRect(-C.PATH_R,-C.PATH_R,C.PATH_L+C.PATH_R*2,C.PATH_R*2);ctx.restore();
  const nB=C.low?26:52,Ptot=2*C.PATH_L+2*Math.PI*C.PATH_R;for(let j=0;j<nB;j++){const s=j/nB*Ptot+tc*38,p=stadPt(s);ctx.save();ctx.translate(p[0],p[1]);ctx.rotate(p[2]+Math.sin(tc*3+j)*.5);ctx.globalAlpha=on*pulse*.85;const fl=Math.abs(Math.cos(tc*2.4+j*1.3))*.6+.4,sz=14+4*Math.sin(j*2.1);ctx.scale(fl,1);ctx.drawImage(PET[j%3],-sz/2,-sz/2,sz,sz);ctx.restore();}
  ctx.restore();ctx.globalAlpha=1;}
/* ---------- the black reaper sword (vector stand-in, demo swordDraw) ---------- */
const dsv=x=>x*x*(3-2*x)*.35+x*.65;
function jag(cut,tc){const pts=[];for(let x=-80;x<=80;x+=8)pts.push([x,cut+(hash(x*.37+Math.floor(tc*14)*3.1)-.5)*22+Math.sin(x*.21+tc*6)*5]);return pts;}
function swordDraw(c,t){if(t<FALL0)return;const fa=1-seg(t,DISS1-.2,DISS1);if(fa<=0)return;const SX=c.SX,SY=c.SY,tc=clk();
  const fu=seg(t,FALL0,PLANT),hf=t<PLANT?520*Math.pow(1-fu,2):0,rot=t<PLANT?.14*(1-fu):.05*Math.exp(-(t-PLANT)*6)*Math.sin((t-PLANT)*40)+(t>DISS0?.012*Math.sin(tc*9):0),cut=-172*(1-dsv(seg(t,DISS0,DISS1)));
  bb(SX,SY,()=>{
  if(t<PLANT){ctx.save();ctx.globalCompositeOperation='lighter';band([[SX,SY-hf-150,0],[SX+34,SY-hf-460,1]],f=>lerp(12,1,f),PK,.5*fu);ctx.restore();}
  ctx.save();ctx.translate(SX,SY-hf);ctx.rotate(rot);ctx.globalAlpha=fa;ctx.beginPath();if(t<DISS0){ctx.rect(-80,-300,160,300+(t<PLANT?60:0));}else{const jp=jag(cut,tc);ctx.moveTo(-80,80);ctx.lineTo(80,80);for(let i=jp.length-1;i>=0;i--)ctx.lineTo(jp[i][0],jp[i][1]);ctx.closePath();}ctx.clip();
  const bg=ctx.createLinearGradient(-15,0,15,0);bg.addColorStop(0,'#1b1d24');bg.addColorStop(.5,'#4b5060');bg.addColorStop(1,'#23252d');
  ctx.fillStyle=bg;ctx.beginPath();ctx.moveTo(-15,-92);ctx.lineTo(15,-92);ctx.lineTo(10,12);ctx.lineTo(0,28);ctx.lineTo(-10,12);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(120,128,150,.6)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-88);ctx.lineTo(0,10);ctx.stroke();
  ctx.strokeStyle='rgba(255,159,192,.55)';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(15,-92);ctx.lineTo(10,12);ctx.stroke();
  ctx.fillStyle='#2a2c36';ctx.fillRect(-32,-101,64,10);ctx.fillStyle='#b79a5a';ctx.fillRect(-36,-103,8,14);ctx.fillRect(28,-103,8,14);
  ctx.fillStyle='#3a2f2a';ctx.fillRect(-5,-146,10,46);ctx.strokeStyle='rgba(216,207,184,.85)';ctx.lineWidth=3;for(let j=0;j<5;j++){ctx.beginPath();ctx.moveTo(-5,-104-j*9);ctx.lineTo(5,-110-j*9);ctx.stroke();}
  ctx.fillStyle='#2a2c36';ctx.beginPath();ctx.arc(0,-152,8,0,6.283);ctx.fill();ctx.strokeStyle='#b79a5a';ctx.lineWidth=2;ctx.stroke();
  for(let k=0;k<3;k++){const pts=[],bx=5,by=-116-k*11,len=34+k*14;for(let j=0;j<=6;j++)pts.push([bx+j*len/6,by+Math.sin(tc*7+j*.9+k*2)*(1.5+j*1.1)+j*1.2,j/6]);band(pts,f=>lerp(7,2,f),'#e6dfcc',.95);}   // torn cloth, always fluttering
  ctx.restore();
  if(t>DISS0&&t<DISS1+.1){const a=(1-seg(t,DISS1-.1,DISS1+.1))*.9,jp=jag(cut,tc);ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a*.4;for(let i=0;i<jp.length;i++)if(Math.abs(jp[i][0])<=24)ctx.drawImage(glow(PK),SX+jp[i][0]-12,SY+jp[i][1]-9,24,18);ctx.restore();}
  });}
/* ---------- slash marks on the targets (demo slashFx) ---------- */
function slashDraw(c,t){for(const s of c.slashes){const e=s.e,age=t-s.t;if(age<0||age>.22)continue;const sc=clamp((e.sz||16)/16,.8,1.8),h=k=>hash(s.i*13.7+s.ti*5.3+k*3.1),rv=ease(age/.07),fa=1-seg(age,.07,.22),
    th=(h(1)-.5)*3.0,l=(38+h(2)*46)*rv*sc,cx=e.x+(h(3)-.5)*22*sc,cy=e.y-(e.sz||16)*1.1+(h(4)-.5)*22*sc,co=Math.cos(th),sn=Math.sin(th),nx=-sn,ny=co,b=(h(5)<.5?-1:1)*(5+h(6)*9)*sc,w=(3+h(7)*5)*sc,tint=h(8)<.5?PW:PL;
  bb(e.x,e.y,()=>{for(let d=0;d<(h(9)<.35?2:1);d++){const o=d*(h(10)>.5?9:-9)*sc,p0=[cx-co*l/2+nx*o,cy-sn*l/2+ny*o],p1=[cx+co*l/2+nx*o,cy+sn*l/2+ny*o],mx=cx+nx*o,my=cy+ny*o;
    ctx.save();ctx.globalAlpha=fa*(d?.7:1);ctx.globalCompositeOperation='lighter';ctx.fillStyle=PK;ctx.beginPath();ctx.moveTo(p0[0],p0[1]);ctx.quadraticCurveTo(mx+nx*(b+w+3),my+ny*(b+w+3),p1[0],p1[1]);ctx.quadraticCurveTo(mx+nx*(b-w-3),my+ny*(b-w-3),p0[0],p0[1]);ctx.fill();
    ctx.globalCompositeOperation='source-over';ctx.fillStyle=tint;ctx.beginPath();ctx.moveTo(p0[0],p0[1]);ctx.quadraticCurveTo(mx+nx*(b+w*.4),my+ny*(b+w*.4),p1[0],p1[1]);ctx.quadraticCurveTo(mx+nx*(b-w*.4),my+ny*(b-w*.4),p0[0],p0[1]);ctx.fill();ctx.restore();}});}}
/* ---------- cast ---------- */
function say(txt){try{textAt(P.x,P.y-62,txt,'#ffd3e2',13);}catch(_){}}
function ready(quiet){const why=!P||P.dead?'—':G.state!=='play'?'—':(P.lvl|0)<C.MINLV?'ต้อง Lv '+C.MINLV+' ขึ้นไป':(P.cds[ID]||0)>0?'ยังคูลดาวน์ '+Math.ceil(P.cds[ID])+' วิ':P.mp<C.MP?'มานาไม่พอ ('+C.MP+')':(SK.lockT>clk())?'กำลังร่าย':'';
  if(why&&!quiet){SK.stats.refused++;if(why!=='—')say('ดาบซากุระ: '+why);}return !why;}
function autoAng(){let b=null,bd=650;for(const e of enemies){if(!liveE(e))continue;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<bd){bd=d;b=e;}}return b?angTo(b.x,b.y):Math.atan2(Math.sin(P.face||0)/K,Math.cos(P.face||0));}
function cast(a){if(!ready())return false;const now=clk();P.mp-=C.MP;P.cds[ID]=C.CD;SK.lockT=now+C.LOCK;P.atkCd=Math.max(P.atkCd||0,C.LOCK);
  const c={t0:now,a,hx:P.x,hy:P.y,seed:(SK.stats.casts*7.3)%97,ev:{},parts:[],slashes:[],targets:[],cx:mkCtx()};const g=GP(c,C.SW_U,0);c.SX=g[0];c.SY=g[1];c.pets=mkPetals(c);
  try{P.face=Math.atan2(K*Math.sin(a),Math.cos(a));}catch(_){}
  for(const e of enemies){if(!liveE(e))continue;const cu=inLane(e,c.hx,c.hy,a);if(cu<0)continue;c.targets.push({e,tf:SURGE0+Math.max(0,(cu-C.SW_U)/C.VFRONT)+.08,n:0,ti:c.targets.length});}
  const r=GP(c,260,0);add(c,{k:'ring',x:r[0],y:r[1],s:50,w:4,col:PW,life:.4});
  SK.list.push(c);SK.fade={hx:c.hx,hy:c.hy,a,t0:now};SK.stats.casts++;SK.stats.perT=c.targets.map(()=>0);return true;}
SK.cast=cast;
function tick(dt){const now=clk();if(!SK.list.length)return;
  for(const c of SK.list){const t=now-c.t0;
    if(t>=PLANT&&!c.ev.plant){c.ev.plant=1;for(let i=0;i<12;i++)add(c,{k:'dust',x:c.SX+rnd(-20,20),y:c.SY+rnd(-3,3),vx:rnd(-70,70),vz:rnd(5,25),s:rnd(18,30),life:rnd(.5,.8),hold:.2,a:.6});
      for(let i=0;i<14;i++)add(c,{k:'pet',x:c.SX+rnd(-14,14),y:c.SY+rnd(-4,4),z:rnd(0,14),vx:rnd(-90,90),vz:rnd(60,150),g:260,floor:1,s:rnd(8,12),spin:rnd(3,9),ph:rnd(0,6.283),vr:rnd(-6,6),life:rnd(.6,1),hold:.3,tint:i%3});
      add(c,{k:'ring',x:c.SX,y:c.SY,s:70,w:3,col:PK,life:.3,a:.7});try{shake(2);}catch(_){}}
    if(t>=DISS0&&t<DISS1){const cz=172*(1-dsv(seg(t,DISS0,DISS1))),d=[Math.cos(c.a),Math.sin(c.a)*K],q=C.low?.5:1;   // petals peel off the cut line as it runs from the grip down to the planted tip
      for(let k=0;k<2;k++)if(Math.random()<dt*60*q)add(c,{k:'pet',x:c.SX+rnd(-20,20),y:c.SY,z:cz+rnd(-4,4),vx:d[0]*rnd(40,150)+rnd(-20,20),vy:d[1]*rnd(40,150),vz:rnd(20,90),g:10,s:rnd(8,13),spin:rnd(3,9),ph:rnd(0,6.283),vr:rnd(-6,6),life:rnd(.7,1.1),hold:.5,tint:Math.floor(rnd(0,3))});
      if(Math.random()<dt*22*q)add(c,{k:'s',x:c.SX+rnd(-14,14),y:c.SY,z:cz,s:rnd(10,16),col:PK,vz:rnd(10,40),life:.3});}
    for(const T of c.targets){while(T.n<C.NH&&t>=T.tf+T.n*C.HIT_DT){const e=T.e;if(!liveE(e)){T.n=C.NH;break;}
      deal(e,c);T.n++;SK.stats.perT[T.ti]=T.n;c.slashes.push({e,t,i:T.n,ti:T.ti});
      for(let j=0;j<2;j++)add(c,{k:'pet',x:e.x+rnd(-12,12),y:e.y,z:rnd(20,46),vx:rnd(-80,80),vz:rnd(30,90),g:200,s:rnd(6,9),spin:rnd(4,10),ph:rnd(0,6.283),vr:rnd(-8,8),life:rnd(.3,.5),hold:.3,tint:Math.floor(rnd(0,3))});}}
    c.slashes=c.slashes.filter(s=>t<s.t+.3);stepParts(c,dt);}
  SK.list=SK.list.filter(c=>now-c.t0<I_END);}
{const o=update;update=function(dt){const r=o.apply(this,arguments);try{if(G.state==='play')tick(dt);}catch(e){SK.err='tick '+e.message;}return r;};}
/* ---------- drawing: ground layer (under the characters) and top layer ---------- */
function drawGround(){const now=clk(),A=SK.aim;
  if(A&&!P.dead)laneDraw(P.x,P.y,A.a,ease(seg(now,A.t0,A.t0+.3)));
  const F=SK.fade;if(F){const on=1-seg(now,F.t0+.03,F.t0+.3);if(on>0)laneDraw(F.hx,F.hy,F.a,on);else SK.fade=null;}
  for(const c of SK.list){const t=now-c.t0;
    const d=seg(t,PLANT,DISS0)*(1-seg(t,EM_END+.5,EM_END+1.5))*.12;if(d>0){ctx.save();ctx.fillStyle='rgba(30,14,30,'+d+')';ctx.fillRect(c.hx-2200,c.hy-2200,4400,4400);ctx.restore();}   // the storm darkens the scene a little
    if(t>=FALL0){const fu=seg(t,FALL0,PLANT),sh=t<PLANT?fu:1-seg(t,DISS1-.3,DISS1);if(sh>0){ctx.save();ctx.globalAlpha=.3*sh;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(c.SX,c.SY,lerp(8,26,fu),lerp(3,8,fu),0,0,6.283);ctx.fill();ctx.restore();}}
    const sa=ease(seg(t,PLANT,PLANT+.35))*(1-seg(t,DISS1,DISS1+.7));
    if(sa>0&&window.STF&&STF.runeRing){ctx.save();try{STF.runeRing(c.SX,c.SY,lerp(20,50,ease(seg(t,PLANT,PLANT+.3))),'#ffb3cf',sa*.9,now*.5,0,ease(seg(t,PLANT,PLANT+.45)),K);}catch(_){}ctx.restore();}
    if(dk(c.SX,c.SY)<=dk(P.x,P.y))swordDraw(c,t);   // sword behind the hero: before the characters
    petalsDraw(c,t,false);}}
function drawTop(){const now=clk();
  for(const c of SK.list){const t=now-c.t0;if(dk(c.SX,c.SY)>dk(P.x,P.y))swordDraw(c,t);slashDraw(c,t);petalsDraw(c,t,true);ribbons(c,t);drawParts_(c);}}
{const o=drawRaidTele;drawRaidTele=function(){const r=o.apply(this,arguments);try{if(SK.aim||SK.fade||SK.list.length){ctx.save();drawGround();ctx.restore();}}catch(e){SK.err='ground '+e.message;}return r;};}
{const o=drawParts;drawParts=function(){const r=o.apply(this,arguments);if(!SK.list.length)return r;const t0=performance.now();petN=0;
  try{ctx.save();drawTop();ctx.restore();}catch(e){SK.err='draw '+e.message;}
  const ms=performance.now()-t0;SK.stats.frames++;SK.stats.drawMs+=ms;SK.stats.maxMs=Math.max(SK.stats.maxMs,ms);SK.stats.peakPet=Math.max(SK.stats.peakPet,petN);return r;};}
/* ---------- input ---------- */
const blockedUI=()=>!P||P.dead||G.state!=='play'||!!G.win||(typeof ED!=='undefined'&&ED.on);
function aimStart(mode,ev){if(blockedUI()||!ready())return false;SK.aim={mode,t0:clk(),a:mode==='pc'?mouseAng():autoAng(),pid:ev&&ev.pointerId,sx:ev&&ev.clientX,sy:ev&&ev.clientY,maxd:0,drag:false};document.body.classList.add('sakAiming');return true;}
function aimStop(){SK.aim=null;document.body.classList.remove('sakAiming');}
function mouseAng(){try{return angTo(mwx(mouse.x,mouse.y),mwy(mouse.x,mouse.y));}catch(_){return autoAng();}}
function fire(){const A=SK.aim;if(!A)return;const a=A.a;aimStop();cast(a);}
function cancel(){if(!SK.aim)return;aimStop();SK.stats.cancel++;say('ดาบซากุระ: ยกเลิก');}
SK.aimStart=aimStart;SK.fire=fire;SK.cancel=cancel;
addEventListener('keydown',e=>{try{if(e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;
  if(e.key==='Escape'&&SK.aim){cancel();e.stopImmediatePropagation();return;}
  if(e.key!=='7')return;if(blockedUI())return;e.stopImmediatePropagation();e.preventDefault();if(SK.aim)cancel();else aimStart('pc');}catch(er){SK.err='key '+er.message;}},true);
let swallowT=0;
addEventListener('pointermove',e=>{const A=SK.aim;if(!A)return;
  if(A.mode==='pc'){A.a=mouseAng();return;}
  if(e.pointerId!==A.pid)return;const dx=e.clientX-A.sx,dy=e.clientY-A.sy,dl=Math.hypot(dx,dy);A.maxd=Math.max(A.maxd,dl);
  if(dl>=14){A.drag=true;let w=[dx,dy];try{w=scr2wDir(dx,dy);}catch(_){}A.a=Math.atan2(w[1]/K,w[0]);}
  e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();},true);
for(const t of ['pointerdown','mousedown','contextmenu'])addEventListener(t,e=>{const A=SK.aim;if(!A||A.mode!=='pc'){if(t!=='contextmenu'&&clk()<swallowT){e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();}return;}
  if(e.target&&e.target.closest&&e.target.closest('#sakBtn'))return;
  e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();if(t!=='pointerdown')return;
  if(e.button===2)cancel();else if(e.button===0){A.a=mouseAng();fire();swallowT=clk()+.25;}},true);
for(const t of ['pointerup','mouseup','click'])addEventListener(t,e=>{if(clk()<swallowT&&!(e.target&&e.target.closest&&e.target.closest('#sakBtn'))){e.stopImmediatePropagation();}},true);
for(const t of ['pointerup','pointercancel'])addEventListener(t,e=>{const A=SK.aim;if(!A||A.mode!=='touch'||e.pointerId!==A.pid)return;e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();
  if(t==='pointercancel'||blockedUI()){aimStop();return;}
  const r=btn.getBoundingClientRect(),back=A.maxd>=14&&e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;
  if(back){cancel();return;}if(!A.drag)A.a=autoAng();fire();},true);
/* ---------- the button (pink): PC = left of the bottom skill bar; phone = bottom row, left of the touch skill cluster ---------- */
function place(){const vis=el=>{if(!el)return null;const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'?r:null;};
  const bw=btn.offsetWidth||52,bar=vis(document.getElementById('bar'));let x,y,ts=null;
  for(const el of document.querySelectorAll('#tSkills .tsk,#tSkills button')){const r=vis(el);if(!r)continue;ts=ts?{left:Math.min(ts.left,r.left),top:Math.min(ts.top,r.top),bottom:Math.max(ts.bottom,r.bottom)}:{left:r.left,top:r.top,bottom:r.bottom};}
  if(ts&&!bar){x=ts.left-bw-14;y=innerHeight-bw-12;}
  else if(bar){x=bar.left-bw-10;y=bar.top+(bar.height-bw)/2;}
  else{x=14;y=innerHeight-bw-120;}
  btn.style.left=Math.round(Math.max(8,x))+'px';btn.style.top=Math.round(Math.max(8,y))+'px';}
const css=document.createElement('style');css.id='p324';css.textContent=
 '#sakBtn{position:fixed;left:14px;top:300px;z-index:57;width:52px;height:52px;padding:0;border-radius:50%;border:2px solid #ffb3cf;background:radial-gradient(circle at 50% 40%,#3a1d2c,#140a12);cursor:pointer;display:none;touch-action:none;overflow:hidden;box-shadow:0 0 8px rgba(255,159,192,.45)}'
 +'#sakBtn svg{position:absolute;inset:8px;width:32px;height:32px;pointer-events:none}'
 +'#sakBtn .k{position:absolute;z-index:3;left:3px;top:1px;font:600 9px sans-serif;color:#ffe3ee;background:rgba(0,0,0,.6);padding:0 3px;border-radius:4px}'
 +'#sakBtn .cd{position:absolute;inset:0;z-index:1;border-radius:50%;background:conic-gradient(rgba(0,0,0,.66) calc(var(--cd,0)*360deg),transparent 0)}'
 +'#sakBtn .ct{position:absolute;inset:0;z-index:2;display:flex;align-items:center;justify-content:center;font:700 15px sans-serif;color:#fff;text-shadow:0 1px 2px #000}'
 +'#sakBtn.nomp{opacity:.55}body.sakAiming #sakBtn{box-shadow:0 0 0 3px #ff9fc0,0 0 14px rgba(255,159,192,.9)}'
 +'@media (hover:none){#sakBtn .k{display:none}#sakBtn{width:56px;height:56px}}';
document.head.appendChild(css);
const btn=document.createElement('button');btn.type='button';btn.id='sakBtn';btn.title='ดาบซากุระ (สกิลพิเศษ · คีย์ 7)';btn.setAttribute('aria-label','ดาบซากุระ สกิลพิเศษ');
btn.innerHTML='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2 L19 18 L16 23 L13 18 Z" fill="#2a2c36" stroke="#ffb3cf" stroke-width="1"/><rect x="10" y="17" width="12" height="2.5" fill="#b79a5a"/><rect x="14.8" y="19.5" width="2.4" height="7" fill="#3a2f2a"/>'
 +'<g fill="#ffc2d8"><path d="M7 25c-3-1-3-5 0-6l1 2 1-2c3 1 3 5 0 6z"/><path d="M25 9c-3-1-3-5 0-6l1 2 1-2c3 1 3 5 0 6z" opacity=".85"/><path d="M24 27c-2-1-2-4 0-5l1 1.5 1-1.5c2 1 2 4 0 5z" opacity=".7"/></g></svg>'
 +'<span class="cd"></span><span class="ct"></span><span class="k">7</span>';
document.body.appendChild(btn);
for(const t of ['mousedown','mouseup','touchstart','touchend','click'])btn.addEventListener(t,e=>{e.stopPropagation();if(t==='touchstart'&&e.cancelable)e.preventDefault();});
btn.addEventListener('pointerdown',e=>{e.stopPropagation();e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();
  if(SK.aim){cancel();return;}
  if(e.pointerType==='mouse'){aimStart('pc',e);return;}
  if(aimStart('touch',e)){try{btn.setPointerCapture&&btn.releasePointerCapture&&btn.releasePointerCapture(e.pointerId);}catch(_){}}});
setInterval(()=>{try{const show=G.state==='play'&&!G.win&&P&&!P.dead&&!(typeof ED!=='undefined'&&ED.on);btn.style.display=show?'block':'none';if(!show){if(SK.aim)aimStop();return;}
  place();
  const cd=(P.cds&&P.cds[ID])||0;btn.querySelector('.cd').style.setProperty('--cd',cd>0?Math.min(1,cd/C.CD):0);btn.querySelector('.ct').textContent=cd>0?(cd>=10?String(Math.ceil(cd)):cd.toFixed(1)):'';btn.classList.toggle('nomp',P.mp<C.MP||(P.lvl|0)<C.MINLV);}catch(_){}},120);
SK.ok=true;
}catch(e){SK.err=e.message;SK.ok=false;}
})();

