
/* p290 r1 — holy staff (คทาศักดิ์สิทธิ์) TEST: Judgment Light + Holy Spear Rain with the approved VFX pieces (TEST only, ?holy=off = r81).
   DeaRz 23 Oct 15:46 "3 ผ่านเอาไปทดสอบได้เลย" (put the holy VFX pieces into the TEST game).
   Motion = the approved demos, ported 1:1 in timing (approved/vfx/HOLY_SPEAR_RAIN_demo_p6_source.html; its Judgment part = HOLY_JUDGMENT_demo_r3.2).
   Art = art/skills/holy/vfx/pieces_r3/final (window.__HOLYA, uniform resize only). Glyphs and ring rims = the V7 runes (DeaRz rune rule 13:10–13:15).
   Numbers = balance/approved (BALANCE_skills_approved_20261023_v1 #2): Judgment Light Lv4 420% one target, MP 20, cd 6, range 360, pillar 70 px;
   Spear Rain Lv4 23 ticks × 35.2% = 810% per monster inside the 220 px circle over 1.5–5.0 s, lock 1.5 s, MP 45, cd 40, light element,
   1 stack per tick (DEF −1.5% / move −2%, max 20, gone 3 s after the last tick), 1 heal mote per tick to the hero if inside (1.52% max HP, cap 35%).
   The game has no holy staff weapon yet: both skills are TEST keys while the staff is held (K = Judgment Light, G = Spear Rain) + 2 touch buttons.
   Pose: STAND-IN (the hero stands; no holy staff art or animation exists). Skill levels 5/10 bonuses are not built (Lv4 only). Debug: window.HOLY. */
(function(){'use strict';const Q=String(location.search);
const H=window.HOLY={ver:'p290-r3',on:!/holy=off/.test(Q),err:null,list:[],stats:{jl:0,sr:0,refused:0,hits:{jl:0,sr:0},dmg:{jl:0,sr:0},heal:0,peakP:0,peakSP:0,stackMax:0,runeN:0}};
if(!H.on)return;
try{
const A=window.__HOLYA;if(!A||!A.fx){H.err='no holy art';return;}
if(typeof hitEnemy!=='function'||!window.C182||!C182.api){H.err='no damage core';return;}
const clk=()=>typeof time==='number'?time:performance.now()/1000;
const clamp=(v,a,b)=>v<a?a:v>b?b:v,ease=x=>1-Math.pow(1-clamp(x,0,1),3),seg=(t,a,b)=>clamp((t-a)/(b-a),0,1);
const inout=(t,a,ai,b,bo)=>seg(t,a,a+ai)*(1-seg(t,b,b+bo));
const rnd=(a,b)=>a+(typeof rng==='function'?rng():Math.random())*(b-a),rf=()=>typeof rng==='function'?rng():Math.random();
const T=()=>{try{return typeof camT==='function'?camT():.866;}catch(_){return .866;}};
const KY=.55;                                  // ground ellipse ry/rx in world space (same as the staff areas)
const GOLD='#ffd36b',CREAM='#fff6dc',AMB='#ffb347',HEAL='#b8f07a';
const liveE=e=>!!(e&&!e.dead&&e.hp>0&&!e.sprGhost&&!e.dev&&!e.removed);
const staffEq=()=>!!(P&&P.weapon&&P.weapon.t==='staff')&&(!window.HOLYW||!HOLYW.ok||HOLYW.on);
/* ---------- numbers (approved, Lv4) ---------- */
const CFG=H.cfg={
  jl:{id:'holyJL',name:'แสงพิพากษา',mul:4.20,mp:20,cd:6,range:360,r:70,lock:.95,pool:1.0},
  sr:{id:'holySR',name:'ฝนหอกศักดิ์สิทธิ์',tickMul:.352,ticks:23,r:220,mp:45,cd:40,lock:1.5,range:320,rain0:1.5,rain1:5.0,dmg0:1.6,dmg1:5.3,end:5.8,   /* r2: dmg0/dmg1 = first/last damage tick window (the rain itself is still 1.5–5.0 s; spears in flight land until ~5.35 s) */
     
      stk:{max:20,def:.015,slow:.02,linger:3},heal:{per:.0152,cap:.35}}};
/* ---------- art ---------- */
const IM={};for(const k in A.fx){const im=new Image();im.src=A.fx[k].src;IM[k]=im;}
const ok=im=>im&&im.complete&&im.naturalWidth>0;
const fx=k=>{const im=IM[k];return ok(im)?im:null;};
const RUNES=new Image();RUNES.src=A.runes.src;
let GLY=null;function glyphs(){if(GLY)return GLY;if(!ok(RUNES))return null;GLY=[];   // 12 V7 glyphs tinted gold once (fill = gold, + a soft amber glow)
  for(let i=0;i<12;i++){const c=document.createElement('canvas');c.width=c.height=48;const g=c.getContext('2d');g.shadowColor=AMB;g.shadowBlur=6;g.drawImage(RUNES,i*64,0,64,64,4,4,40,40);
    g.shadowBlur=0;g.globalCompositeOperation='source-in';g.fillStyle='#ffe7a6';g.fillRect(0,0,48,48);g.globalCompositeOperation='source-over';g.globalAlpha=.55;g.drawImage(RUNES,i*64,0,64,64,10,10,28,28);
    g.globalCompositeOperation='source-atop';g.globalAlpha=1;g.fillStyle=CREAM;g.fillRect(0,0,48,48);GLY.push(c);}return GLY;}
const GL={};function glowS(col){return GL[col]||(GL[col]=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const r=g.createRadialGradient(32,32,0,32,32,32);
  r.addColorStop(0,col);r.addColorStop(.3,col+'bb');r.addColorStop(1,col+'00');g.fillStyle=r;g.fillRect(0,0,64,64);return c;})());}
const mk=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c;};
const SHOCK=mk(256,256,g=>{const r=g.createRadialGradient(128,128,90,128,128,125);r.addColorStop(0,'rgba(255,220,140,0)');r.addColorStop(.75,'rgba(255,236,180,.5)');r.addColorStop(.9,'rgba(255,255,240,1)');r.addColorStop(1,'rgba(255,220,140,0)');g.fillStyle=r;g.fillRect(0,0,256,256);});
const KHS=mk(16,128,g=>{const h=g.createLinearGradient(0,0,16,0);h.addColorStop(0,'rgba(255,216,138,0)');h.addColorStop(.5,'rgba(255,230,170,1)');h.addColorStop(1,'rgba(255,216,138,0)');g.fillStyle=h;g.fillRect(0,0,16,128);
  g.globalCompositeOperation='destination-in';const v=g.createLinearGradient(0,0,0,128);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(.2,'rgba(0,0,0,1)');v.addColorStop(.6,'rgba(0,0,0,.55)');v.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=v;g.fillRect(0,0,16,128);});
const ROCKS=['P2_08_rock_1','P2_08_rock_2','P2_08_rock_3','P2_08_rock_4','P2_08_rock_5','P2_08_rock_6'],SHARDS=['P2_08_shard_1','P2_08_shard_2','P2_08_shard_3','P2_08_shard_4','P2_08_shard_5','P2_08_shard_6'];
const PLUS=['P2_07_heal_plus_1','P2_07_heal_plus_2','P2_07_heal_plus_3','P2_07_heal_plus_4','P2_07_heal_plus_5','P2_07_heal_plus_6'];
/* ---------- drawing helpers (local space = screen px around the skill centre, ground squash K, rotate THEN squash) ---------- */
let KL=.476;   // local ground squash = KY × camera tilt (set per draw)
function img(k,x,y,w,o){const im=fx(k);if(!im)return;o=o||{};const f=A.fx[k],h=w*f.h/f.w;ctx.save();ctx.translate(x,y);if(o.rot)ctx.rotate(o.rot);ctx.globalAlpha=clamp(o.a==null?1:o.a,0,1);
  if(o.add)ctx.globalCompositeOperation='lighter';ctx.drawImage(im,-w*(o.ax==null?.5:o.ax),-h*(o.ay==null?.5:o.ay),w,h);ctx.restore();}
function groundImg(k,x,y,r,rot,alpha,add){if(alpha<=0)return;const im=k.getContext?k:fx(k);if(!im)return;ctx.save();ctx.translate(x,y);ctx.scale(1,KL);ctx.rotate(rot||0);ctx.globalAlpha=clamp(alpha,0,1);if(add)ctx.globalCompositeOperation='lighter';ctx.drawImage(im,-r,-r,r*2,r*2);ctx.restore();}
function groundReveal(k,x,y,r,rot,alpha,prog,add){if(prog<=0||alpha<=0)return;const im=fx(k);if(!im)return;ctx.save();ctx.translate(x,y);ctx.scale(1,KL);ctx.rotate(rot);
  if(prog<1){ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,r*1.05,-Math.PI/2,-Math.PI/2+prog*6.283);ctx.closePath();ctx.clip();}ctx.globalAlpha=clamp(alpha,0,1);if(add)ctx.globalCompositeOperation='lighter';ctx.drawImage(im,-r,-r,r*2,r*2);ctx.restore();}
function rune(x,y,r,a,rot,grow,n,half){if(!(r>=16)||!(a>0))return;try{if(window.STF&&STF.runeRing){STF.runeRing(x,y,r,GOLD,a,rot,n||0,grow,KL,half?{half}:null);H.stats.runeN++;}}catch(e){H.err='rune '+e.message;}}
function glowAt(col,x,y,w,h,a){if(a<=0)return;ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=clamp(a,0,1);ctx.drawImage(glowS(col),x-w/2,y-h/2,w,h);ctx.restore();}
/* a vertical light tile (P1_04) scrolled down a column: uniform scale, repeated, faded in at the top and out near the ground */
function tileCol(k,cx,top,bot,w,alpha,scroll,add,fb){const im=fx(k);if(!im||alpha<=0||bot<=top||w<=0)return;const f=A.fx[k],th=f.h*w/f.w;ctx.save();if(add)ctx.globalCompositeOperation='lighter';
  ctx.beginPath();ctx.rect(cx-w,top,w*2,bot-top);ctx.clip();const o=((scroll%th)+th)%th;const STEP=Math.max(8,(bot-top)/10);
  for(let y=top;y<bot;y+=STEP){const fa=clamp((y-top)/30,0,1)*(fb?clamp((bot-y)/fb,0,1):1);ctx.globalAlpha=clamp(alpha*fa,0,1);ctx.save();ctx.beginPath();ctx.rect(cx-w,y,w*2,STEP+.5);ctx.clip();
    for(let ty=top-th+o;ty<bot;ty+=th)ctx.drawImage(im,cx-w/2,ty,w,th);ctx.restore();}
  ctx.restore();}
/* ---------- particles (one list per cast, demo types) ---------- */
function add(L,p){p.age=0;p.vx=p.vx||0;p.vy=p.vy||0;p.g=p.g||0;p.rot=p.rot||0;p.vr=p.vr||0;p.drag=p.drag||0;if(L.P.length<(L.cap||220))L.P.push(p);}
function stepP(L,dt){for(const p of L.P){p.age+=dt;p.vx*=1-p.drag*dt;p.vy=p.vy*(1-p.drag*dt)+p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
    if(p.floor!=null&&p.y>p.floor){p.y=p.floor;p.vy*=-.3;p.vx*=.6;p.vr*=.5;}if(p.k==='wisp')p.vx+=Math.sin(p.age*6+(p.ph||0))*30*dt;}
  L.P=L.P.filter(p=>p.age<p.life);}
function drawP(L,t){const G_=glyphs();for(const p of L.P){const u=p.age/p.life,fi=p.fin?seg(p.age,0,p.fin):1,hd=p.hold||.5,a=fi*(1-Math.max(0,u-hd)/(1-hd));if(a<=0)continue;
    ctx.globalAlpha=clamp(a*(p.a||1),0,1);ctx.globalCompositeOperation='source-over';
    if(p.k==='rock'||p.k==='shard'){const im=fx(p.img);if(im){const f=A.fx[p.img],w=p.s*2.4,h=w*f.h/f.w;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);if(p.k==='shard')ctx.globalCompositeOperation='lighter';ctx.drawImage(im,-w/2,-h/2,w,h);ctx.restore();}}
    else if(p.k==='ray'){ctx.save();ctx.globalCompositeOperation='lighter';ctx.translate(p.x0,p.y0);ctx.scale(1,KL);ctx.rotate(p.ang);const len=p.len*ease(u*2.5);ctx.fillStyle='rgba(255,236,170,.9)';ctx.beginPath();ctx.moveTo(len*.2,-3);ctx.lineTo(len,0);ctx.lineTo(len*.2,3);ctx.fill();ctx.restore();}
    else if(p.k==='plus'){const im=fx(p.img);if(im){const f=A.fx[p.img],w=p.s*1.6,h=w*f.h/f.w;ctx.drawImage(im,p.x-w/2,p.y-h/2,w,h);}}
    else if(p.k==='glyph'||p.k==='lift'){if(!G_)continue;let x=p.x,y=p.y;if(p.k==='lift'){const m=ease(clamp(u/.9,0,1));x=p.x0+(p.x1-p.x0)*m;y=p.y0+(p.y1-p.y0)*m-Math.sin(m*Math.PI)*40;
        ctx.globalCompositeOperation='lighter';const ga=ctx.globalAlpha;ctx.globalAlpha=ga*.4;ctx.drawImage(glowS(GOLD),x-9,y-9,18,18);ctx.globalAlpha=ga;ctx.globalCompositeOperation='source-over';}
      ctx.drawImage(G_[p.img%12],x-12,y-12,24,24);}
    else if(p.k==='jstreak'){if(!G_)continue;const w=Math.min(1,p.age/.05),m=ease(clamp((p.age-.05)/.12,0,1)),x=p.x0+(p.x1-p.x0)*m,y=p.y0+(p.y1-p.y0)*m;ctx.globalCompositeOperation='lighter';
      if(m<=0){ctx.drawImage(G_[p.img%12],x-11,y-11,22,22);ctx.globalAlpha=clamp(a,0,1)*w;ctx.drawImage(glowS(CREAM),x-12,y-12,24,24);}
      else{const Lg=10+70*Math.sin(m*Math.PI);ctx.drawImage(glowS(CREAM),x-4,y-Lg,8,Lg*1.15);ctx.drawImage(glowS(GOLD),x-7,y-Lg*.6,14,Lg*.7);}}
    else if(p.k==='heal'){ctx.globalCompositeOperation='lighter';const tr=p.tr;for(let k=0;k<tr.length;k++){const q=tr[k],f=(k+1)/(tr.length+1);ctx.globalAlpha=clamp(a,0,1)*f*.6;ctx.drawImage(glowS(p.col),q[0]-p.s*f/2,q[1]-p.s*f/2,p.s*f,p.s*f);}
      ctx.globalAlpha=clamp(a,0,1);ctx.drawImage(glowS(p.col),p.x-p.s/2,p.y-p.s/2,p.s,p.s);ctx.drawImage(glowS('#ffffff'),p.x-p.s/5,p.y-p.s/5,p.s*.4,p.s*.4);}
    else if(p.k==='kx'){ctx.globalCompositeOperation='lighter';const r=p.s*(1+u);ctx.drawImage(glowS('#ffffff'),p.x-r/2,p.y-r/2,r,r);}
    else if(p.k==='kg'){groundImg('P2_04_hit_ring',p.x,p.y,p.s*(1+u*.8),0,ctx.globalAlpha*.9,true);}
    else if(p.k==='wisp'){ctx.globalCompositeOperation='lighter';const s=p.s;ctx.drawImage(glowS(p.col),p.x-s*.35,p.y-s*1.3,s*.7,s*2.6);ctx.drawImage(glowS(CREAM),p.x-s*.15,p.y-s*.5,s*.3,s);}
    else if(p.k==='twinkle'){const tw=Math.sin(u*Math.PI);ctx.globalAlpha=tw;ctx.fillStyle=CREAM;ctx.save();ctx.translate(p.x,p.y);ctx.beginPath();for(let k=0;k<8;k++){const aa=k/8*6.283,l=k%2?p.s*.18:p.s;ctx.lineTo(Math.cos(aa)*l,Math.sin(aa)*l);}ctx.fill();ctx.restore();}
    else{ctx.globalCompositeOperation='lighter';ctx.drawImage(glowS(p.col||GOLD),p.x-p.s/2,p.y-p.s/2,p.s,p.s);}}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
/* ---------- damage ---------- */
function mkCtx(id,nh){   /* r2: nh = hits per target per cast; the damage core (native mode) gives 0 damage after weights.length hits on one target — Spear Rain needs 23 (was 16: hits 17–23 did 0 and showed no number, DeaRz 16:28/16:41) */
  const coef=(window.STF&&STF.cfg&&STF.cfg.basic&&STF.cfg.basic.coef)||3.4;
  const def={id,mode:'native',coefTotal:coef,flatTotal:0,weights:Array(nh||16).fill(1),maxTargets:99,targeting:'around',element:'Light',range:900};
  const c=C182.api.ctxFor('skill',id,def,{dt:'phys',lvScale:1,m0:1,reach:1400,cdId:id});c.el='Light';return c;}
const PAL={main:'#ffd36b',accent:'#fff2b8',core:'#fffbea',glow:'#ffa62e',dark:'#4a2e06',part:'feather'};
function deal(e,ctx,m,k,x,y){const prev=C182.cur;let r=0;C182.cur=ctx;try{r=hitEnemy(e,m,{dt:'phys',pl:PAL,ctx,kind:'orb',fx:x,fy:y})||0;}catch(er){H.err='dmg '+er.message;}finally{C182.cur=prev;}
  H.stats.hits[k]++;H.stats.dmg[k]+=Math.max(0,r);return r;}
/* ---------- cast gate ---------- */
let LOCK=0;
function refuse(c,why){H.stats.refused++;try{textAt(P.x,P.y-62,c.name+': '+why,'#ffe7a6',13);}catch(_){}return false;}
function canCast(c){if(!P||P.dead||G.state!=='play'||G.edit)return refuse(c,'ใช้ไม่ได้ตอนนี้');if(!staffEq())return refuse(c,'ต้องถือคทา (TEST)');
  if(clk()<LOCK)return refuse(c,'กำลังร่าย');if((P.cds[c.id]||0)>0)return refuse(c,'คูลดาวน์ '+P.cds[c.id].toFixed(1)+' วิ');if(P.dash)return refuse(c,'กำลังทำท่าอื่น');
  if(P.mp<c.mp)return refuse(c,'MP ไม่พอ');return true;}
function aimPt(range){try{if(H.aimOv)return {x:H.aimOv.x,y:H.aimOv.y};const r=aimPoint(range);if(r&&isFinite(r.x))return r;}catch(_){}const a=P.face||0;return {x:P.x+Math.cos(a)*range*.6,y:P.y+Math.sin(a)*range*.6};}
function nearest(x,y,range){let b=null,bd=1e9;for(const e of enemies){if(!liveE(e))continue;const d=Math.hypot(e.x-x,e.y-y);if(d<=range&&d<bd){bd=d;b=e;}}return b;}
/* ================= JUDGMENT LIGHT ================= */
function castJL(){const c=CFG.jl;if(!canCast(c))return false;let e=null;
  try{const t_=window.TLOCK&&TLOCK.e;if(liveE(t_)&&Math.hypot(t_.x-P.x,t_.y-P.y)<=c.range+40)e=t_;}catch(_){}
  if(!e){const a=aimPt(c.range);e=nearest(a.x,a.y,140);if(e&&Math.hypot(e.x-P.x,e.y-P.y)>c.range+40)e=null;}
  if(!e)e=nearest(P.x,P.y,c.range);if(!e)return refuse(c,'ไม่มีเป้าในระยะ '+c.range+' px');
  P.mp-=c.mp;P.cds[c.id]=c.cd;const now=clk();LOCK=now+c.lock;P.face=Math.atan2(e.y-P.y,e.x-P.x);
  H.list.push({k:'jl',t0:now,e,x:e.x,y:e.y,ev:{},P:[],cap:90,ctx:mkCtx(c.id)});H.stats.jl++;try{window.HOLYW&&HOLYW.pose&&HOLYW.pose('shot');}catch(_){}return true;}
const JH_N=16;
function haloC(t){const tight=1-.08*ease(seg(t,.65,.79)),R=92;return {x:0,y:-80-(R*.5+10),rx:R*tight,ry:R*tight*.5};}
function haloAng(x){const w0=.698,w1=3.49;if(x<.65)return w0*x;const d=Math.min(x,.79)-.65;return w0*.65+w0*d+(w1-w0)*d*d/(2*.14);}
function once(J,n,f){if(!J.ev[n]){J.ev[n]=1;f();}}
function tipL(J){const tt=T();return [P.x-J.x+12,(P.y-J.y)*tt-96];}   // staff tip (stand-in: above the hero's raised hand)
function jlStep(J,dt,t){const c=CFG.jl;
  if(t<.95&&liveE(J.e)){J.x=J.e.x;J.y=J.e.y;}          // the pillar follows the locked monster until the impact
  if(t>.1&&t<.79&&rf()<dt*7){const a=rnd(0,6.283),h=haloC(t);add(J,{k:'mote',x:h.x+Math.cos(a)*h.rx*1.05,y:h.y+Math.sin(a)*h.ry*1.2,vx:-Math.sin(a)*20,vy:rnd(-15,5),life:rnd(.5,.8),s:rnd(5,8),col:'#ffe08a'});}
  if(t>=.79)once(J,'jhrel',()=>{const h=haloC(.79),A0=haloAng(.79);for(let i=0;i<JH_N;i++){const a=A0+i/JH_N*6.283;add(J,{k:'jstreak',img:i,x0:h.x+Math.cos(a)*h.rx,y0:h.y+Math.sin(a)*h.ry,x1:0,y1:-30,x:0,y:0,life:.2,hold:.75});}});
  if(t>=.95)once(J,'impact',()=>{try{shake(3);}catch(_){}
    if(liveE(J.e))deal(J.e,J.ctx,c.mul,'jl',J.x,J.y);
    for(let i=0;i<8;i++)add(J,{k:'ray',x0:0,y0:0,ang:i/8*6.283+rnd(-.2,.2),len:rnd(70,120),life:.35,hold:.3});
    for(let i=0;i<10;i++){const a=rnd(-Math.PI,0),sp=rnd(120,260);add(J,{k:'spark',x:0,y:-10,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,g:600,life:rnd(.4,.7),s:rnd(6,10),col:CREAM});}
    for(let i=0;i<8;i++){const a=rnd(-Math.PI*.95,-Math.PI*.05),sp=rnd(120,240);add(J,{k:'rock',img:ROCKS[i%6],x:rnd(-20,20),y:-4,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-80,g:900,floor:rnd(-10,25)*.6,vr:rnd(-10,10),life:.9,hold:.6,s:rnd(3,6)});}});
  if(t>=1.35)once(J,'j5m',()=>{for(let i=0;i<20;i++)add(J,{k:'mote',x:rnd(-8,8),y:-rnd(10,300),vy:rnd(-70,-30),life:rnd(.4,.7),s:rnd(5,9),col:CREAM});});
  const pEnd=1.35+c.pool;
  if(t>1.35&&t<pEnd){if(rf()<dt*10)add(J,{k:'wisp',x:rnd(-70,70),y:rnd(-18,18)*.5,vy:rnd(-70,-45),ph:rnd(0,6),life:rnd(.8,1.1),fin:.15,s:rnd(16,24),col:'#ffd36b'});
    if(rf()<dt*6)add(J,{k:'twinkle',x:rnd(-80,80),y:rnd(-30,10)-rnd(0,50),life:rnd(.35,.6),s:rnd(5,9)});}
  return t<pEnd+.6;}
function jlGround(J,t){const c=CFG.jl,pEnd=1.35+c.pool;
  /* J3 target ring under the monster: in at .95–1.1, grows into the pool edge, out at the end · + V7 rune rim */
  const j3a=.7*seg(t,.95,1.1)*(1-seg(t,pEnd,pEnd+.4)),grow=1+.55*ease(seg(t,.95,1.35)),rot=t<1.35?t*.7:-(t-1.35)*.5+1.35*.7;
  if(j3a>0){groundImg('P1_02_target_ring',0,0,62*grow,rot,j3a,true);rune(0,0,62*grow*.86,j3a,rot,seg(t,.95,1.3),14);}
  const j9=seg(t,1.15,1.35)*(1-seg(t,pEnd,pEnd+.4));if(j9>0){groundImg('P1_07_light_pool',0,0,92*(1+.03*Math.sin(t*5.2)),(t-1.15)*.105,j9*(.6+.12*Math.sin(t*5.2)),true);
    const rp=((t-1.35)/.7)%1;if(t>1.35)groundImg(SHOCK,0,0,92*(.25+.8*rp),0,j9*.45*Math.sin(rp*Math.PI),true);}
  if(t>=.95&&t<1.2){const u=seg(t,.983,1.183),sc=1+.3*ease(u);groundImg('P1_06_impact_flash',0,0,85*sc,0,(t<.983?1:1-u),true);}}
function halo(t,side){if(t>=.79)return;const h=haloC(t),A0=haloAng(t),fill=seg(t,0,.7),peak=t>.65?.5+.5*Math.sin(t*40):0,G_=glyphs();
  ctx.save();ctx.strokeStyle=GOLD;ctx.lineWidth=1.6;ctx.globalAlpha=seg(t,.05,.6)*(side>0?.7:.4)*(1+.4*peak);ctx.beginPath();ctx.ellipse(h.x,h.y,h.rx,h.ry,0,side>0?0:Math.PI,side>0?Math.PI:2*Math.PI);ctx.stroke();
  if(G_)for(let i=0;i<JH_N;i++){const born=.05+i*.04;if(t<born)continue;const a=A0+i/JH_N*6.283,sn=Math.sin(a);if((sn>0)!==(side>0))continue;
    const age=t-born,pop=.4+.6*ease(Math.min(1,age/.08)),x=h.x+Math.cos(a)*h.rx,y=h.y+sn*h.ry,sz=22*pop*(side>0?1:.85),al=(side>0?1:.6)*(.6+.4*fill);
    ctx.globalCompositeOperation='lighter';ctx.globalAlpha=clamp(al*(.15+.15*fill+.3*peak+(age<.1?.8*(1-age/.1):0)),0,1);ctx.drawImage(glowS(AMB),x-sz*.7,y-sz*.7,sz*1.4,sz*1.4);
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=al;ctx.drawImage(G_[i%12],x-sz/2,y-sz/2,sz,sz);}
  ctx.restore();ctx.globalAlpha=1;}
function helix(t,top,bot,r,n,speed,alpha,side){const G_=glyphs();if(!G_||alpha<=0)return;for(let i=0;i<n;i++){const ph=((t*speed+i/n)%1+1)%1,y=top+(bot-top)*ph,a=ph*6.283*2.2+i*2.4+t*3,s=Math.sin(a);if((s>0)!==(side>0))continue;
  ctx.globalAlpha=clamp(alpha*(s>0?1:.45)*Math.sin(ph*Math.PI),0,1);ctx.save();ctx.translate(Math.cos(a)*r,y+s*r*.25);ctx.rotate(-Math.cos(a)*.4);ctx.drawImage(G_[i%12],-10,-10,20,20);ctx.restore();}ctx.globalAlpha=1;}
const SKY=-520;
function jlAir(J,t,side){const tip=tipL(J);
  if(side<0){const j4=inout(t,.45,.25,.79,.2);if(j4>0){const im=fx('P1_03_light_cone');if(im){const f=A.fx.P1_03_light_cone,hh=-SKY,ww=hh*f.w/f.h;ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=j4*.55;ctx.drawImage(im,-ww/2,SKY,ww,hh);ctx.restore();}}
    if(t>=.79&&t<1.5){const fall=d=>SKY+(0-SKY)*ease(seg(t,.79,.79+d)),nar=k=>1-.85*ease(seg(t,.95+k*.05,1.35)),out=1-seg(t,1.35,1.5),bw=1.4;
      tileCol('P1_04_pillar_wide_tile',0,SKY,fall(.10),80*nar(0)*bw,.55*out,t*260,false,26);
      tileCol('P1_04_pillar_mid_tile',0,SKY,fall(.12),44*nar(1)*bw,.8*out,t*420,true,24);
      tileCol('P1_04_pillar_core_tile',0,SKY,fall(.14),(17*nar(2)+2)*bw,.9*out,t*640,true,20);
      helix(t,SKY,fall(.10),34*nar(0)+6,14,1.6,out,-1);
      const j6=1-seg(t,.95,1.05);if(j6>0)img('P1_05_pillar_head_flare',0,fall(.12),78,{a:j6,add:true});}}
  else{if(t>=.79&&t<1.5){const out=1-seg(t,1.35,1.5),fall=SKY+(0-SKY)*ease(seg(t,.79,.89)),nar=1-.85*ease(seg(t,.95,1.35));helix(t,SKY,fall,34*nar+6,14,1.6,out,1);}
    const j1=seg(t,0,.15)*(1-seg(t,.79,1.09));if(j1>0){const sp=(t>=.79&&t<.823)?1.4:1,pu=1+.12*Math.sin(t*18);img('P1_01_lantern_glow',tip[0],tip[1],58*sp*pu,{a:j1,add:true});}
    halo(t,-1);halo(t,1);}}   /* r2: both halo halves above the map props */
/* ================= HOLY SPEAR RAIN ================= */
const SLANT=.21;
function castSR(){const c=CFG.sr;if(!canCast(c))return false;const a=aimPt(c.range);let dx=a.x-P.x,dy=a.y-P.y,dl=Math.hypot(dx,dy);if(dl>c.range){dx*=c.range/dl;dy*=c.range/dl;}
  P.mp-=c.mp;P.cds[c.id]=c.cd;const now=clk();LOCK=now+c.lock;if(dl>1)P.face=Math.atan2(dy,dx);try{window.HOLYW&&HOLYW.pose&&HOLYW.pose('slam');}catch(_){}
  const U={k:'sr',t0:now,x:P.x+dx,y:P.y+dy,R:c.r,ev:{},P:[],cap:220,SP:[],mobs:new Map(),healGiven:0,ctx:mkCtx(c.id,c.ticks+2)};
  fitSky(U);const n=14,ky=khY(U);U.portals=[];for(let i=0;i<n;i++){const big=i===0,an=((i-1)/(n-1))*6.283+rnd(-.12,.12),rr=big?0:rnd(.72,.95);
    U.portals.push({x:Math.cos(an)*U.R*rr,y:ky+Math.sin(an)*U.R*U.ks*rr,s:big?1.25:rnd(.7,1.05),open:1.05+.3+i*.03,close:5.4,rr,rot:rnd(0,6)});}
  U.portals.slice(1).sort((a,b)=>b.rr-a.rr).forEach((p,k)=>p.close=5.0+k*.025);
  H.list.push(U);H.stats.sr++;return true;}
function khY(U){return U&&U.ky!=null?U.ky:-230;}
/* r2: the demo ring sat 230 px above the circle, but in the game view its top went under the map title + menu bar (stage 1 QA r82 #1).
   At cast: keep its top (ring + portal half) at least TOPM px below the screen top; lower it down to 150 px above the circle, then flatten it (ry down to 0.32 R). */
const TOPM=86;function fitSky(U){U.ky=-230;U.ks=.5;try{const sy=w2s(U.x,U.y)[1],z=(typeof camZ==='function'?camZ():1)||1,av=(sy-TOPM)/z,top=22;
  let ky=av-U.R*.5-top;if(ky>=230)return;if(ky>=150){U.ky=-ky;return;}U.ky=-150;U.ks=clamp((av-150-top)/U.R,.32,.5);}catch(_){}}
function khAng(x){const w0=.698,w1=3.49;if(x<.8)return w0*x;const d=Math.min(x,1.0)-.8;return w0*.8+w0*d+(w1-w0)*d*d/(2*.2);}
function portalScale(p,t){if(t<p.open)return 0;const o=seg(t,p.open,p.open+.12);let s=o<1?1.15*ease(o):1.15-.15*seg(t,p.open+.12,p.open+.2);if(t>p.close)s*=1-seg(t,p.close,p.close+.18);return s;}
const SRK=/srhalf=off/.test(location.search)?1:.5;H.srk=SRK;
function rainRate(t){if(t<1.5||t>5.0)return 0;return 220*SRK*seg(t,1.5,1.8)*(1-seg(t,4.6,5.0));}
const inSR=(U,o,pad)=>{const rx=U.R+(pad||0),ry=U.R*KY+(pad||0)*KY,dx=(o.x-U.x)/rx,dy=(o.y-U.y)/ry;return dx*dx+dy*dy<=1;};
const loc=(U,x,y)=>[x-U.x,(y-U.y)*T()];
function stackOn(e){const c=CFG.sr.stk,now=clk();let s=e._hly;if(!s){s=e._hly={stk:0,def0:e.def,sp0:e.sp};STK.add(e);}s.stk=Math.min(c.max,s.stk+1);s.until=now+c.linger;
  if(s.def0!=null)e.def=s.def0*(1-c.def*s.stk);if(s.sp0!=null)e.sp=s.sp0*(1-c.slow*s.stk);H.stats.stackMax=Math.max(H.stats.stackMax,s.stk);}
const STK=new Set();
function stackTick(){const now=clk();for(const e of STK){const s=e._hly;if(!s){STK.delete(e);continue;}if(now>=s.until||e.dead){if(s.def0!=null)e.def=s.def0;if(s.sp0!=null)e.sp=s.sp0;delete e._hly;STK.delete(e);}}}
function sendHeal(U,lx,ly){const c=CFG.sr.heal;if(!P||P.dead||!inSR(U,P,0))return;const capHP=Math.round(P.maxHp*c.cap);if(U.healGiven>=capHP)return;if(U.P.filter(p=>p.k==='heal').length>=45)return;
  const hp=loc(U,P.x,P.y);add(U,{k:'heal',x:lx,y:ly,x0:lx,y0:ly,tg:{x:hp[0],y:hp[1]-30},cy:Math.min(ly,hp[1]-30)-rnd(60,130),life:rnd(.45,.65),hold:.9,s:rnd(11,15),col:'#e8f7a0',tr:[],v:0});const v=Math.min(Math.max(1,Math.round(P.maxHp*c.per)),capHP-U.healGiven);U.P[U.P.length-1].v=v;U.healGiven+=v;}
function srStep(U,dt,t){const c=CFG.sr,KS=U.ks||.5;
  if(t>.2&&t<1.05&&rf()<dt*(t>.8?40:14)){const a=rnd(0,6.283);add(U,{k:'mote',x:Math.cos(a)*U.R,y:khY(U)+Math.sin(a)*U.R*KS,vy:rnd(-40,-15),life:rnd(.5,.8),s:rnd(5,8),col:'#ffe08a'});}
  if(t>=1.0)once(U,'lift',()=>{const n=16,A0=khAng(1.0);for(let i=0;i<n;i++){const a=A0+i/n*6.283,gx=Math.cos(a)*U.R,gy=khY(U)+Math.sin(a)*U.R*KS;let p=U.portals[1],bd=1e9;for(const q of U.portals.slice(1)){const d=Math.hypot(q.x-gx,q.y-gy);if(d<bd){bd=d;p=q;}}
    add(U,{k:'lift',img:i,x0:gx,y0:gy,x1:p.x,y1:p.y,x:0,y:0,life:p.open-1.0+.02,hold:.85});}});
  /* random rain from open portals, landing inside the circle (local ground = KL squash) */
  const rate=rainRate(t);let n=rate>0?Math.floor(rate*dt+rf()):0;const kl=KY*T();
  for(let i=0;i<n&&U.SP.length<Math.round(126*SRK);i++){const op=U.portals.filter(p=>portalScale(p,t)>.6);if(!op.length)break;const p=op[(rf()*op.length)|0];let gx,gy,tries=0;
    do{gy=rnd(-1,1)*U.R*kl*1.08;gx=p.x+(gy-p.y)*Math.tan(SLANT)+rnd(-40,40)*p.s;tries++;}while(tries<6&&Math.pow(gx/(U.R*1.08),2)+Math.pow(gy/(U.R*kl*1.08),2)>1);
    if(tries>=6){const a=rnd(0,6.283),r=Math.sqrt(rf());gx=Math.cos(a)*U.R*1.05*r;gy=Math.sin(a)*U.R*kl*1.05*r;}
    const sx=gx-(gy-p.y)*Math.tan(SLANT),TT=rnd(.28,.36);U.SP.push({x:sx+rnd(-8,8)*p.s,y:p.y,vx:(gx-sx)/TT,vy:(gy-p.y)/TT,gy,age:0,st:0});}
  for(const s of U.SP){s.age+=dt;if(!s.st){s.x+=s.vx*dt;s.y+=s.vy*dt;if(s.y>=s.gy){s.y=s.gy;s.st=s.age;land(U,s,t);}}}
  U.SP=U.SP.filter(s=>!(s.st&&s.age-s.st>.3));H.stats.peakSP=Math.max(H.stats.peakSP,U.SP.length);
  /* damage ticks: N per monster spread evenly over 1.5–5.0 s; only while it stands inside the circle; each = damage + 1 stack + 1 heal mote */
  const N=c.ticks,tk=k=>c.dmg0+(c.dmg1-c.dmg0)*k/N;
  if(t>=c.dmg0-.2&&t<=c.dmg1+.05)for(const e of enemies){if(!liveE(e))continue;let m=U.mobs.get(e);
    if(!m){if(!inSR(U,e,(e.sz||16)*.5))continue;let k=0;while(k<N&&tk(k+1)<=t)k++;m={k,aimed:-1,lastSp:-9};U.mobs.set(e,m);}
    if(m.k<N&&m.aimed!==m.k&&t>=tk(m.k+1)-.2){m.aimed=m.k;if(!(m.lastSp>t-.1)&&inSR(U,e,(e.sz||16)*.5))spawnAimed(U,e,t,tk(m.k+1)-t);}
    while(m.k<N&&t>=tk(m.k+1)){m.k++;if(!inSR(U,e,(e.sz||16)*.5))continue;deal(e,U.ctx,c.tickMul,'sr',e.x,e.y);stackOn(e);const l=loc(U,e.x,e.y);
      add(U,{k:'kx',x:l[0]+rnd(-6,6),y:l[1]-24+rnd(-8,8),life:.1,hold:.2,s:20});sendHeal(U,l[0],l[1]-24);}}
  if(rate>0){try{shake(rate>80?2:1);}catch(_){}}
  for(const p of U.P)if(p.k==='heal'){const hp=loc(U,P.x,P.y);p.tg.x=hp[0];p.tg.y=hp[1]-30;p.tr.push([p.x,p.y]);if(p.tr.length>5)p.tr.shift();const u=clamp(p.age/p.life,0,1),a=(1-u)*(1-u),b=2*(1-u)*u,cc=u*u;
    p.x=a*p.x0+b*((p.x0+p.tg.x)/2)+cc*p.tg.x;p.y=a*p.y0+b*p.cy+cc*p.tg.y;
    if(!p.done&&p.age+dt>=p.life){p.done=1;if(P&&!P.dead){const v=p.v||0;if(v>0){U.hq=(U.hq||0)+v;}H.stats.heal+=v;}
      if(rf()<.5)add(U,{k:'plus',img:PLUS[(rf()*6)|0],x:p.tg.x+rnd(-10,10),y:p.tg.y-rnd(0,20),vy:-40,life:.6,s:rnd(12,16)});}}
  if(U.hq>0&&(t-(U.hqT||0)>=.6||t>=c.end)&&P&&!P.dead){const v=U.hq;U.hq=0;U.hqT=t;try{healP(v);}catch(_){P.hp=Math.min(P.maxHp,P.hp+v);}}
  return t<c.end;}
function spawnAimed(U,e,t,TT){const l=loc(U,e.x,e.y),gx=l[0]+rnd(-4,4),gy=l[1]+1;const op=U.portals.filter(p=>portalScale(p,t)>.6);if(!op.length)return;
  let best=op[0],bd=1e9;for(const p of op){const sx=gx-(gy-p.y)*Math.tan(SLANT),d=Math.abs(sx-p.x);if(d<bd){bd=d;best=p;}}
  TT=Math.max(.12,Math.min(.25,TT||.2));const sx=gx-(gy-best.y)*Math.tan(SLANT);U.SP.push({x:sx,y:best.y,vx:(gx-sx)/TT,vy:(gy-best.y)/TT,gy,age:0,st:0,aim:1});}
function land(U,s,t){let hit=null;for(const e of enemies){if(!liveE(e))continue;const l=loc(U,e.x,e.y);if(Math.abs(s.x-l[0])<26&&Math.abs(s.gy-l[1])<18){hit=e;break;}}
  if(hit){s.hit=1;const m=U.mobs.get(hit);if(m&&!s.aim)m.lastSp=t;const l=loc(U,hit.x,hit.y),ex=l[0],ey=l[1]-24;add(U,{k:'kx',x:ex+rnd(-6,6),y:ey+rnd(-8,8),life:.1,hold:.2,s:22});
    for(let i=0;i<3;i++){const a=rnd(-Math.PI,0),sp=rnd(80,180);add(U,{k:'spark',x:ex,y:ey,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,g:500,life:rnd(.25,.4),s:rnd(4,7),col:CREAM});}
    if(rf()<.35){const a=rnd(-Math.PI*.9,-Math.PI*.1),sp=rnd(90,160);add(U,{k:'shard',img:SHARDS[(rf()*6)|0],x:ex,y:ey,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,g:600,vr:rnd(-8,8),life:.45,hold:.5,s:rnd(3,4.5)});}}
  else{add(U,{k:'kg',x:s.x,y:s.gy,life:.3,hold:.2,s:16});if(rf()<.6)add(U,{k:'rock',img:ROCKS[(rf()*6)|0],x:s.x,y:s.gy-2,vx:rnd(-60,60),vy:-rnd(60,120),g:700,floor:s.gy+rnd(0,6),vr:rnd(-10,10),life:.5,hold:.6,s:rnd(2,3.5)});}}
function srGround(U,t){const sweep=ease(seg(t,1.35,1.75)),u3=1-seg(t,5.0,5.5);
  if(u3>0&&sweep>0){const a=.95*u3;groundReveal('P2_05_area_ring',0,0,U.R,t*.25,a,sweep,true);rune(0,0,U.R*.93,a,t*.25,sweep,0);}
  /* chain ring at the feet of each stacked monster: tightens per stack */
  for(const [e,m] of U.mobs){const s=e._hly;if(!s||!liveE(e))continue;const l=loc(U,e.x,e.y),r=26-10*s.stk/20;groundImg('P2_06_chain_ring',l[0],l[1],r,-t*1.5,.85,false);}}
function drawSpear(s){const im=fx('P2_03_spear');if(!im)return;const f=A.fx.P2_03_spear,ang=-SLANT;
  if(!s.st){const Lh=96,w=Lh*f.w/f.h;ctx.save();ctx.translate(s.x,s.y);ctx.rotate(ang);
      ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.35;const sl=Math.min(60,s.age*260);ctx.drawImage(glowS(CREAM),-4,-Lh-sl,8,Lh+sl);   // speed streak behind (glow, the spear itself is never stretched)
      ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.drawImage(im,-w/2,-Lh,w,Lh);ctx.restore();glowAt(CREAM,s.x,s.y,10,10,.8);}
  else if(!s.hit){const d=seg(s.age-s.st,.1,.3),Lh=46,w=Lh*f.w/f.h;ctx.save();ctx.globalAlpha=1-d;ctx.translate(s.x,s.y-d*10);ctx.rotate(ang);ctx.drawImage(im,-w/2,-Lh*.75,w,Lh);ctx.restore();}
  ctx.globalAlpha=1;}
function drawPortals(U,t){for(const p of U.portals){const sc=portalScale(p,t);if(sc<=0)continue;const r=40*p.s*sc;
  glowAt(CREAM,p.x,p.y,r*2.2,r*1.2,.28);groundImg('P2_01_portal_ring',p.x,p.y,r,t*1.4+p.rot,.95,true);rune(p.x,p.y,r*.82,.9,t*1.4+p.rot,1,p.s>1.1?16:10);
  groundImg('P2_02_portal_core',p.x,p.y,r*.62,-t*.8,.85,true);}}
function khRing(U,t,side){if(t>=1.0)return;const pk=t>.8?.5+.5*Math.sin(t*40):0,cy=khY(U),rx=U.R,ry=rx*(U.ks||.5);
  const ca=.32*seg(t,.15,.6)*(1-seg(t,.95,1.15))*(1+.3*pk);if(ca>0){ctx.save();ctx.globalCompositeOperation='lighter';const N=26,A0=khAng(t)*.5,gy=KY*T();
    for(let i=0;i<N;i++){const a=A0+i/N*6.283,sn=Math.sin(a);if((sn>0)!==(side>0))continue;const x=Math.cos(a)*rx,top=cy+sn*ry,bot=sn*U.R*gy,fl=.55+.45*Math.sin(t*(9+i%5)+i*1.7);
      ctx.globalAlpha=Math.min(1,ca*fl*(side>0?.9:.6));const w=8+(i%3)*4;ctx.drawImage(KHS,x-w/2,top-6,w,bot-top+12);}
    if(side<0){ctx.globalAlpha=ca*.35;ctx.drawImage(glowS(GOLD),-rx*1.05,-U.R*gy*1.05,rx*2.1,U.R*gy*2.1);}ctx.restore();}
  /* the floating cast ring = V7 rune band, glyphs appear one by one (0.1–0.74 s), spins up before the portals open */
  const a=seg(t,.1,.3)*(side>0?1:.6)*(1+.3*pk)*(1-seg(t,.95,1.0));const kl0=KL;KL=.5;rune(0,cy,rx,a,khAng(t),seg(t,.1,.74),20,side>0?'front':'back');KL=kl0;
  glowAt(AMB,0,cy,rx*2.2,ry*2.4,.12*a);}
function srAir(U,t,side){const tip=tipL(U);
  if(side<0)return;   /* r2: the sky layers (portals + both halves of the floating ring) all draw above the map props, so tall grass never covers them */
  khRing(U,t,-1);drawPortals(U,t);khRing(U,t,1);for(const s of U.SP)drawSpear(s);
  const k1=seg(t,0,.2)*(1-seg(t,1.0,1.3));if(k1>0)img('P1_01_lantern_glow',tip[0],tip[1],64*(1+.1*Math.sin(t*16)),{a:k1,add:true});}
/* ---------- loop + hooks ---------- */
function stepAll(dt){const now=clk();stackTick();for(let i=H.list.length-1;i>=0;i--){const L=H.list[i],t=now-L.t0;let keep=true;
    try{keep=L.k==='jl'?jlStep(L,dt,t):srStep(L,dt,t);}catch(e){H.err='step '+e.message;keep=false;}stepP(L,dt);H.stats.peakP=Math.max(H.stats.peakP,L.P.length);if(!keep)H.list.splice(i,1);}}
function inBB(L,f){try{const tt=T();KL=KY*tt;bb(L.x,L.y,()=>{ctx.save();ctx.translate(L.x,L.y);f();ctx.restore();});}catch(e){H.err='draw '+e.message;}ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
function drawGround(){const now=clk();for(const L of H.list){const t=now-L.t0;inBB(L,()=>{if(L.k==='jl'){jlGround(L,t);jlAir(L,t,-1);}else{srGround(L,t);srAir(L,t,-1);}});}}
function drawTop(){const now=clk();for(const L of H.list){const t=now-L.t0;inBB(L,()=>{if(L.k==='jl')jlAir(L,t,1);else srAir(L,t,1);drawP(L,t);});}}
{const o=update;update=function(dt){const r=o.apply(this,arguments);try{if(H.list.length||STK.size)stepAll(+dt||0);}catch(e){H.err='tick '+e.message;}return r;};}
if(typeof drawRaidTele==='function'){const o=drawRaidTele;drawRaidTele=function(){const r=o.apply(this,arguments);if(H.list.length)drawGround();return r;};}
{const o=drawParts;drawParts=function(){const r=o.apply(this,arguments);if(H.list.length)drawTop();return r;};}
try{const _up=updPlayer;updPlayer=function(){const lock=clk()<LOCK&&!P.dead;const x0=P.x,y0=P.y;const r=_up.apply(this,arguments);if(lock&&!P.dash){P.x=x0;P.y=y0;P.vx=0;P.vy=0;}return r;};}catch(e){H.err='updPlayer '+e.message;}
try{const _ba=basicAttack;basicAttack=function(){if(clk()<LOCK)return;return _ba.apply(this,arguments);};}catch(e){H.err='basic '+e.message;}
try{if(window.STF&&STF.cast){const _c=STF.cast;STF.cast=function(){if(clk()<LOCK)return false;return _c.apply(this,arguments);};}}catch(e){H.err='stf '+e.message;}
if(typeof loadZone==='function'){const o=loadZone;loadZone=function(){try{H.list.length=0;LOCK=0;for(const e of STK){const s=e._hly;if(s){if(s.def0!=null)e.def=s.def0;if(s.sp0!=null)e.sp=s.sp0;delete e._hly;}}STK.clear();}catch(_){}return o.apply(this,arguments);};}
if(typeof playerDeath==='function'){const o=playerDeath;playerDeath=function(){LOCK=0;return o.apply(this,arguments);};}
H.cast=k=>k==='jl'?castJL():k==='sr'?castSR():false;
/* r3: pre-warm list for p292 (first-cast stall on DeaRz PC 17:19): every piece, the rune atlas, the tinted glyphs and glow sprites */
H.warmList=()=>{const L=Object.values(IM).filter(ok);if(ok(RUNES))L.push(RUNES);const G_=glyphs();if(G_)for(const g of G_)L.push(g);L.push(SHOCK,KHS);for(const c of [GOLD,CREAM,AMB,HEAL,'#ffe08a','#e8f7a0','#ffd36b'])L.push(glowS(c));return L;};
H.warmRunes=()=>[[GOLD,KY*T()],[GOLD,.5]];
/* ---------- input: keys K / G + 2 touch buttons (TEST), only while the staff is held ---------- */
addEventListener('keydown',e=>{if(e.repeat||!P||G.state!=='play')return;try{if(typeof ED!=='undefined'&&ED.on)return;}catch(_){}const a=document.activeElement;if(a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName))return;
  if(e.code==='KeyK'||e.key==='k'||e.key==='K'){if(staffEq()&&!(window.HOLYK&&HOLYK.ok)){castJL();e.preventDefault();}}
  else if(e.code==='KeyG'||e.key==='g'||e.key==='G'){if(staffEq()&&!(window.HOLYK&&HOLYK.ok)){castSR();e.preventDefault();}}});
const box=document.createElement('div');box.id='holyTest';box.style.cssText='position:fixed;right:max(12px,env(safe-area-inset-right,0px));top:42%;z-index:60;display:none;flex-direction:column;gap:8px;font:600 12px/1.15 system-ui,sans-serif';
function btn(k,label,key){const b=document.createElement('button');b.type='button';b.dataset.k=k;b.style.cssText='width:64px;height:64px;border-radius:50%;border:2px solid #ffd36b;background:rgba(40,28,8,.78);color:#fff6dc;touch-action:manipulation;padding:0;text-align:center';
  b.innerHTML=label+'<br><span style="font-weight:400;opacity:.8">'+key+'</span>';b.setAttribute('aria-label',label+' (TEST)');
  const go=ev=>{ev.preventDefault();ev.stopPropagation();H.cast(k);};b.addEventListener('pointerdown',go);b.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();});return b;}
const bJ=btn('jl','แสง','K TEST'),bS=btn('sr','หอก','G TEST');box.appendChild(bJ);box.appendChild(bS);
const mount=()=>{if(document.body&&!box.isConnected)document.body.appendChild(box);};setTimeout(mount,1500);
setInterval(()=>{try{mount();const show=G.state==='play'&&staffEq()&&!(typeof ED!=='undefined'&&ED.on);box.style.display=show?'flex':'none';if(!show)return;
  for(const [b,c] of [[bJ,CFG.jl],[bS,CFG.sr]]){const cd=P.cds[c.id]||0;b.style.opacity=cd>0||P.mp<c.mp?'.55':'1';const s=b.querySelector('span');if(s)s.textContent=cd>0?Math.ceil(cd)+' วิ':(b===bJ?'K TEST':'G TEST');}}catch(_){}},250);
H.ok=!H.err;
}catch(e){H.err='init '+e.message;}})();

