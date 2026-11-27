
/* p329 Veilwater Serpent boss kit + phase 2 · TEST ch2 (DeaRz 29 Oct 15:44 "อยากให้บอสมีสกิลโจมตีเยอะกว่านี้ นอกจากพุ่งชนและยิงกระจายรอบทิศ" ·
   15:44 "ปรับให้มีเฟส2ก็ได้"). Replaces the generic boss pattern (18-orb ring / slam circle / void-spawn summon) for 'veilwater_serpent' only.
   Phase 1: bite (engine) · water jet (line) · tail sweep (arc around the body) · spray orbs (water ring) · charge (dash along a line).
   Phase 2 (HP <= 50%): banner + roar, faster and casts more often, adds geyser chain · whirlpool (pull) · dive ambush (hides, bursts up under the hero).
   Every attack shows its area on the ground first. Damage = serpent ATK x mul (numbers sent to Balance). ?serpk=off = the old pattern.
   p330 (30 Oct): approved skill art (serpent_skills_r1, DeaRz "ผ่าน" 06:36) — body poses spit/tailsweep/slam/charge/dive/emerge/roar
   (c2serp.js) and water VFX V1-V7 (c2serpfx.js) replace the code-drawn shapes; numbers and timings unchanged (orbs leave on the slam
   frame, .21 s after the cast). Code keeps only the red warning areas and the purple spark at the shard. */
(function(){
'use strict';
const ON=!/[?&]serpk=off/.test(location.search);
const K=window.__SERPK={on:ON,err:[],stats:{casts:{},hits:{},phase2:0,resets:0},T:[]};
if(!ON)return;
const CFG=K.cfg={
  p2at:.5,
  gap:[3.0,4.2],gap2:[2.3,3.2],sp2:1.15,hp:210000,
  jet:{mul:2.2,len:560,w:84,tele:1.0},
  sweep:{mul:1.8,r:210,arc:3.7,tele:.85,near:260},
  orbs:{n:14,spd:250},                    // engine enemyShoot: 0.85 x ATK per orb
  // Balance 29 Oct (reply to the kit): dash/dive x2.4/x2.6 -> x2.2, phase-2 gap 1.9-2.8 -> 2.3-3.2 s, HP 235,000 -> 210,000
  dash:{mul:2.2,len:420,w:110,tele:.9,dur:.28},
  geyser:{n:5,gap:.26,tele:.95,r:82,mul:1.6},
  pool:{dur:3.6,r:300,core:125,pull:72,tick:.5,mul:.35,tele:.6},
  dive:{sink:.45,hide:1.1,lock:.7,r:135,mul:2.2},
  orbCap:2,geyCap:2,   // Balance 29 Oct: at most 2 orbs of one ring / 2 geysers of one chain hit the hero; no bite while a warning or cast runs
  roar:1.1
};
const WATER={key:'ice',core:'#f2ffff',main:'#62c9ff',glow:'#1f86e0',accent:'#c4f3ff',dark:'#06223a',part:'shard'};
const COL='#4fb9ff',DARK='#2a1f3d';
let now=0;
const isS=e=>e&&e.type==='veilwater_serpent'&&!e.dead;
const R=()=>window.__SERPENT&&window.__SERPENT.R;
const W=(x,y)=>{try{const A=window.CH1Q&&CH1Q.api&&CH1Q.api.c2&&CH1Q.api.c2();if(A&&A.api&&A.api.walkOk&&!A.api.walkOk(x,y))return false;}catch(_){}try{return !blocked(x,y,14);}catch(_){return true;}};
const cnt=(o,k)=>{o[k]=(o[k]||0)+1;};
function st(e){return e.c2k||(e.c2k={ph:1,cd:1.6,last:null,cast:null,sp0:e.sp});}
function anim(e,clip,once){try{const r=R();if(r&&r.force&&r.force(e,clip,true)){st(e).anim={until:now+r.total(clip)};return true;}}catch(_){}return false;}
function unanim(e){try{const r=R(),s=st(e);if(s.anim&&r&&r.unforce)r.unforce(e);s.anim=null;}catch(_){}}
const FXR=()=>window.__SERPFX&&__SERPFX.ready?__SERPFX:null;
function fx(o){o.t0=now;o.zone=G.zone;o.fx=1;o.art=1;K.T.push(o);return o;}   // art effect entry (drawn by drawTop / draw)
const fxN=k=>{const F=FXR();return F?F.n_(k):0;};
function face(e,x,y){e.face=Math.atan2(y-e.y,x-e.x);}
function hit(e,k,mul){if(P.dead||G.god&&G.zone==='anim_studio')return;cnt(K.stats.hits,k);hurtPlayer(e.atk*mul,e);shake(7);}
function tele(o){o.t0=now;o.zone=G.zone;K.T.push(o);return o;}
const inCirc=(x,y,cx,cy,r)=>Math.hypot(x-cx,(y-cy)/.7)<r;
function inLine(x,y,T){const dx=x-T.x,dy=y-T.y,u=dx*Math.cos(T.ang)+dy*Math.sin(T.ang),v=-dx*Math.sin(T.ang)+dy*Math.cos(T.ang);return u>-20&&u<T.len&&Math.abs(v)<T.w/2+(P.r||12);}
function inArc(x,y,T){const dx=x-T.x,dy=(y-T.y)/.7,d=Math.hypot(dx,dy);if(d>T.r+(P.r||12))return false;let a=Math.atan2(dy,dx)-T.ang;a=Math.atan2(Math.sin(a),Math.cos(a));return Math.abs(a)<T.arc/2;}
function spray(x,y,n,up,col){for(let i=0;i<n;i++){const a=Math.random()*6.283,s=40+Math.random()*up;part({x:x+Math.cos(a)*10,y:y+Math.sin(a)*6,vx:Math.cos(a)*s*.6,vy:-up*(.6+Math.random()*.7),grav:520,drag:.98,life:.55+Math.random()*.45,max:1,size:3+Math.random()*4,col:col||(i%3?'#9fe3ff':'#eaffff'),type:'glow'});}}
function mist(x,y,n,r){for(let i=0;i<n;i++){const a=Math.random()*6.283,d=Math.random()*r;part({x:x+Math.cos(a)*d,y:y+Math.sin(a)*d*.7,vx:Math.cos(a)*20,vy:-12-Math.random()*20,life:.9+Math.random()*.6,max:1.5,size:14+Math.random()*12,grow:14,drag:.95,col:i%2?'#bfeaff':'#86c9ee',type:'smoke'});}}

/* ---------------- skills ---------------- */
const SK={
  jet(e){const ang=Math.atan2(P.y-e.y,P.x-e.x);face(e,P.x,P.y);anim(e,'spit');
    tele({k:'line',src:e,x:e.x,y:e.y-6,ang,len:CFG.jet.len,w:CFG.jet.w,dur:CFG.jet.tele,go(T){let h=false;
      if(inLine(P.x,P.y,T)){hit(e,'jet',CFG.jet.mul);h=true;}
      if(FXR()){const ex=T.x+Math.cos(T.ang)*T.len,ey=T.y+Math.sin(T.ang)*T.len;const mx=e.x+Math.cos(T.ang)*44,my=e.y-92+Math.sin(T.ang)*14,bx=ex-mx,by=ey-14-my;fx({k:'abeam',x:mx,y:my,ang:Math.atan2(by,bx),len:Math.hypot(bx,by),w:T.w,dur:.42});fx({k:'asplash',key:'bsplash',x:ex,y:ey+10,wd:150,dur:.5});return h;}
      tele({k:'beam',x:T.x,y:T.y,ang:T.ang,len:T.len,w:T.w,dur:.42,fx:1});
      for(let i=0;i<=10;i++){const u=i/10*T.len;spray(T.x+Math.cos(T.ang)*u,T.y+Math.sin(T.ang)*u,4,140);}ring(T.x+Math.cos(T.ang)*T.len,T.y+Math.sin(T.ang)*T.len,8,70,.35,COL,6);return h;}});
    return CFG.jet.tele+.35;},
  sweep(e){const ang=Math.atan2(P.y-e.y,P.x-e.x);face(e,P.x,P.y);
    anim(e,'tailsweep');tele({k:'arc',src:e,x:e.x,y:e.y,ang,r:CFG.sweep.r,arc:CFG.sweep.arc,dur:CFG.sweep.tele,go(T){if(inArc(P.x,P.y,T))hit(e,'sweep',CFG.sweep.mul);
      if(FXR()){fx({k:'aarc',x:T.x,y:T.y,ang:T.ang,r:T.r,dur:.36});const a2=T.ang+T.arc/2;fx({k:'aspray',x:T.x+Math.cos(a2)*T.r*.8,y:T.y+Math.sin(a2)*T.r*.8*.7,ang:a2+1.57,dur:.36});shake(5);return;}
      tele({k:'swipe',x:T.x,y:T.y,ang:T.ang,r:T.r,arc:T.arc,dur:.32,fx:1});
      for(let i=0;i<=12;i++){const a=T.ang-T.arc/2+T.arc*i/12;spray(T.x+Math.cos(a)*T.r*.85,T.y+Math.sin(a)*T.r*.85*.7,3,120);}shake(5);}});
    return CFG.sweep.tele+.3;},
  orbs(e){const art=anim(e,'slam')&&FXR();const n=CFG.orbs.n,b=Math.random()*6.283;
    const shoot=()=>{if(!isS(e)||P.dead)return;const p0=projs.length;for(let i=0;i<n;i++)enemyShoot(e,b+i/n*6.283,CFG.orbs.spd);
    const rid=++K.rid;for(let i=p0;i<projs.length;i++){projs[i].col=COL;projs[i].c2ring=rid;}
    if(art)fx({k:'aring',key:'rring',x:e.x,y:e.y,wd:240,dur:.4});else{ring(e.x,e.y,20,120,.4,COL,8);spray(e.x,e.y-60,14,160);}};
    if(art)setTimeout(shoot,210);else shoot();
    if(st(e).ph>=2)setTimeout(()=>{if(!isS(e)||P.dead)return;const p1=projs.length,r2=++K.rid;for(let i=0;i<n;i++)enemyShoot(e,b+(i+.5)/n*6.283,CFG.orbs.spd*.9);for(let i=p1;i<projs.length;i++){projs[i].col=COL;projs[i].c2ring=r2;}},art?590:380);
    return .7;},
  dash(e){const ang=Math.atan2(P.y-e.y,P.x-e.x);face(e,P.x,P.y);let len=CFG.dash.len;
    for(let d=40;d<=CFG.dash.len;d+=20){if(!W(e.x+Math.cos(ang)*d,e.y+Math.sin(ang)*d)){len=d-20;break;}}
    if(!anim(e,'charge'))anim(e,'move');tele({k:'line',src:e,x:e.x,y:e.y,ang,len:Math.max(len,60)+40,w:CFG.dash.w,dur:CFG.dash.tele,go(T){
      st(e).dash={x0:e.x,y0:e.y,ang:T.ang,len:Math.max(len,0),t:0,hit:false};}});
    return CFG.dash.tele+CFG.dash.dur+.35;},
  geyser(e){anim(e,'slam');const n=CFG.geyser.n,ch={h:0};let px=P.x,py=P.y;const vx=(P.vx||0),vy=(P.vy||0);
    for(let i=0;i<n;i++)setTimeout(()=>{if(!isS(e))return;const lead=.25;const x=P.x+vx*lead+(Math.random()-.5)*30,y=P.y+vy*lead+(Math.random()-.5)*20;
      tele({k:'circle',src:e,x,y,r:CFG.geyser.r,dur:CFG.geyser.tele,gey:1,go(T){if(inCirc(P.x,P.y,T.x,T.y,T.r)&&ch.h<CFG.geyCap){ch.h++;hit(e,'geyser',CFG.geyser.mul);}
        if(FXR()){fx({k:'agey',x:T.x,y:T.y,r:T.r,dur:.62});spray(T.x,T.y,6,300);return;}
        tele({k:'pillar',x:T.x,y:T.y,r:T.r,dur:.6,fx:1});spray(T.x,T.y,22,420);ring(T.x,T.y,6,T.r,.35,COL,6);}});},i*CFG.geyser.gap*1000);
    return n*CFG.geyser.gap+.5;},
  pool(e){anim(e,'slam');const s=st(e);
    tele({k:'vortex',src:e,x:e.x,y:e.y,r:CFG.pool.r,core:CFG.pool.core,dur:CFG.pool.tele+CFG.pool.dur,warm:CFG.pool.tele,tk:0,follow:e,go(){mist(e.x,e.y,12,CFG.pool.r*.6);}});
    s.pool=now;return CFG.pool.tele+CFG.pool.dur+.2;},
  dive(e){const s=st(e);const art=anim(e,'dive')&&FXR();if(!art)anim(e,'hurt',true);s.dive={t:0,ph:'sink',x:e.x,y:e.y,art};
    if(art)fx({k:'aseq',key:'ripple',a:0,b:6,x:e.x,y:e.y,wd:300,dur:CFG.dive.sink+.3,gnd:1});else{spray(e.x,e.y,24,260);mist(e.x,e.y,8,60);ring(e.x,e.y,10,110,.45,COL,8);}
    return CFG.dive.sink+CFG.dive.hide+CFG.dive.lock+.6;},
  roar(e){if(anim(e,'roar')&&FXR()){fx({k:'aring',key:'rring',x:e.x,y:e.y,wd:480,dur:.6,dl:.35});}else{anim(e,'attack',true);ring(e.x,e.y,30,360,.8,'#7a5cff',12);ring(e.x,e.y,10,240,.6,COL,10);mist(e.x,e.y,18,160);}shake(12);
    try{showBanner('งูน้ำคลั่ง · เฟส 2','เศษหอกดำเรืองแสง · ออกท่าถี่ขึ้น',2.2);}catch(_){}try{textAt(e.x,e.y-190,'ROAR!','#9fd8ff',20);}catch(_){}try{sfx('blast');}catch(_){}
    return CFG.roar;}
};
K.SK=SK;
function pick(e,dP){const s=st(e);const pool=[['jet',3],['orbs',2],['dash',2]];if(dP<CFG.sweep.near)pool.push(['sweep',4]);
  if(s.ph>=2){pool.push(['geyser',3],['pool',2],['dive',2]);}
  const L=pool.filter(p=>p[0]!==s.last);let sum=0;for(const p of L)sum+=p[1];let r=Math.random()*sum;for(const p of L){r-=p[1];if(r<=0)return p[0];}return L[0][0];}
function cast(e,k){const s=st(e);s.last=k;cnt(K.stats.casts,k);e.wind=0;e.atkCd=Math.max(e.atkCd||0,.5);const dur=SK[k](e);s.cast={k,until:now+dur,x:e.x,y:e.y};return dur;}
K.cast=(e,k)=>cast(e||enemies.find(isS),k);
function phaseCheck(e){const s=st(e);if(s.ph===1&&e.hp<=e.maxHp*CFG.p2at){s.ph=2;K.stats.phase2++;e.sp=(s.sp0||e.sp)*CFG.sp2;cast(e,'roar');s.cd=1.2;return true;}return false;}
function resetKit(e){const s=st(e);if(s.anim)unanim(e);if(s.ph===1&&!s.cast&&!s.dive)return;s.ph=1;s.cast=null;s.dive=null;s.dash=null;s.cd=1.6;e.sp=s.sp0||e.sp;e.c2hide=0;K.stats.resets++;for(let i=K.T.length-1;i>=0;i--)if(K.T[i].src===e)K.T.splice(i,1);}
function ai(e,dt,dP){const s=st(e);if(e.c2reset){resetKit(e);return;}
  if(phaseCheck(e))return;if(s.cast||s.dive||s.dash)return;
  s.cd-=dt;if(s.cd>0||dP>620)return;
  cast(e,pick(e,dP));const g=s.ph>=2?CFG.gap2:CFG.gap;s.cd=g[0]+Math.random()*(g[1]-g[0]);}

/* per-frame: casts lock the body, dash/dive move it, telegraphs resolve */
function tick(dt){now+=dt;
  for(const e of enemies){if(!isS(e)||!e.c2k)continue;const s=e.c2k;
    if(e.c2reset||P.dead){resetKit(e);continue;}
    if(s.anim&&now>=s.anim.until)unanim(e);
    if(s.dash){const D=s.dash;D.t+=dt;const k=Math.min(1,D.t/CFG.dash.dur),u=D.len*k;const nx=D.x0+Math.cos(D.ang)*u,ny=D.y0+Math.sin(D.ang)*u;e.x=nx;e.y=ny;face(e,nx+Math.cos(D.ang),ny+Math.sin(D.ang));
      if(!FXR())spray(nx,ny,3,90);if(!D.hit&&Math.hypot(P.x-nx,(P.y-ny)/.7)<CFG.dash.w*.5+(e.sz||30)){D.hit=true;hit(e,'dash',CFG.dash.mul);}
      if(k>=1){s.dash=null;if(FXR())fx({k:'atrail',x:nx,y:ny,ang:D.ang,dur:.3});else{ring(nx,ny,10,140,.4,COL,8);mist(nx,ny,6,60);}s.cast&&(s.cast.x=nx,s.cast.y=ny);}e.wind=0;continue;}
    if(s.dive){const D=s.dive;D.t+=dt;e.wind=0;e.atkCd=Math.max(e.atkCd||0,.6);
      if(D.ph==='sink'){e.x=D.x;e.y=D.y;if(D.t>=CFG.dive.sink){D.ph='hide';D.t=0;e.c2hide=1;if(!D.art)mist(D.x,D.y,10,70);}}
      else if(D.ph==='hide'){e.x=D.x;e.y=D.y;if(Math.random()<.5)mist(P.x,P.y+6,1,30);if(D.t>=CFG.dive.hide){D.ph='lock';D.t=0;D.tx=P.x;D.ty=P.y;
          if(!W(D.tx,D.ty)){D.tx=D.x;D.ty=D.y;}tele({k:'circle',src:e,x:D.tx,y:D.ty,r:CFG.dive.r,dur:CFG.dive.lock,go(){}});}}
      else if(D.ph==='lock'){e.x=D.x;e.y=D.y;if(D.t>=CFG.dive.lock){D.ph='up';D.t=0;e.x=e.sx=D.tx;e.y=e.sy=D.ty;e.c2hide=0;face(e,P.x,P.y);
          if(inCirc(P.x,P.y,D.tx,D.ty,CFG.dive.r))hit(e,'dive',CFG.dive.mul);
          if(D.art&&anim(e,'emerge')){fx({k:'aseq',key:'ripple',a:6,b:14,x:D.tx,y:D.ty,wd:330,dur:.75});spray(D.tx,D.ty,10,420);}
          else{anim(e,'attack',true);spray(D.tx,D.ty,40,520);ring(D.tx,D.ty,10,CFG.dive.r+30,.45,COL,10);tele({k:'pillar',x:D.tx,y:D.ty,r:CFG.dive.r,dur:.7,fx:1});}shake(10);}}
      else if(D.t>=.5){s.dive=null;}
      continue;}
    if(s.cast){if(now>=s.cast.until){s.cast=null;}else{e.x=s.cast.x;e.y=s.cast.y;e.wind=0;}}
    if(s.cast||K.T.some(T=>T.src===e&&!T.fx)){e.wind=0;e.atkCd=Math.max(e.atkCd||0,.35);}
    // phase 2 aura: the black shard glows and water mist curls round the coil
    if(s.ph>=2&&!FXR()&&Math.random()<dt*14&&!e.c2hide){const a=Math.random()*6.283;part({x:e.x+Math.cos(a)*50,y:e.y-10+Math.sin(a)*24,vx:-Math.sin(a)*30,vy:-20-Math.random()*30,life:.9,max:.9,size:10+Math.random()*8,grow:10,drag:.95,col:Math.random()<.3?'#5a3f8f':'#9fdcff',type:'smoke'});
      }
    if(s.ph>=2&&!e.c2hide&&Math.random()<dt*5){part({x:e.x+(Math.random()-.5)*16,y:e.y-120+(Math.random()-.5)*16,vx:0,vy:-30,life:.5,max:.5,size:6+Math.random()*5,col:'#8f6bff',type:'glow'});}}
  for(let i=K.T.length-1;i>=0;i--){const T=K.T[i];if(T.zone!==G.zone){K.T.splice(i,1);continue;}
    if(T.follow&&!T.follow.dead){T.x=T.follow.x;T.y=T.follow.y;}
    if(T.k==='vortex'){const a=now-T.t0;if(a>T.warm){if(!T.on){T.on=1;T.go&&T.go(T);}
        const dx=T.x-P.x,dy=T.y-P.y,d=Math.hypot(dx,dy/.7);
        if(!P.dead&&d<T.r&&d>20){const s=CFG.pool.pull*dt*(1-d/T.r*.4),nx=P.x+dx/d*s,ny=P.y+dy/d*s;if(W(nx,ny)){P.x=nx;P.y=ny;}}
        T.tk-=dt;if(T.tk<=0){T.tk=CFG.pool.tick;if(T.src&&inCirc(P.x,P.y,T.x,T.y,T.core))hit(T.src,'pool',CFG.pool.mul);}
        if(!FXR()&&Math.random()<dt*30){const an=Math.random()*6.283,rr=T.r*(.3+Math.random()*.7);part({x:T.x+Math.cos(an)*rr,y:T.y+Math.sin(an)*rr*.7,vx:-Math.sin(an)*rr*1.2-Math.cos(an)*40,vy:(Math.cos(an)*rr*1.2-Math.sin(an)*40)*.7,life:.5,max:.5,size:3+Math.random()*3,col:'#c4f3ff',type:'glow'});}}}
    if(now-T.t0>=T.dur){K.T.splice(i,1);if(!T.fx&&T.go&&T.k!=='vortex'){try{T.go(T);}catch(er){if(K.err.length<20)K.err.push('go '+er.message);}}}}}

/* ground drawing (under the bodies): water-blue warning areas that fill up, then the splash shapes */
function draw(){if(!K.T.length)return;const c=ctx;
  for(const T of K.T){if(T.zone!==G.zone)continue;const a=now-T.t0,k=Math.min(1,a/T.dur);
    if(T.art){if(T.k==='aring'||T.k==='aseq'&&T.gnd){c.save();try{drawArt(c,T,a);}finally{c.restore();}}continue;}c.save();
    if(T.fx){const f=1-k;c.globalCompositeOperation='lighter';
      if(T.k==='beam'){c.translate(T.x,T.y);c.rotate(T.ang);const w=T.w*(.6+.4*f);let g=c.createLinearGradient(0,-w/2,0,w/2);g.addColorStop(0,'rgba(80,180,255,0)');g.addColorStop(.5,`rgba(220,250,255,${.85*f})`);g.addColorStop(1,'rgba(80,180,255,0)');c.fillStyle=g;c.fillRect(0,-w/2,T.len*Math.min(1,a/.08),w);
        c.fillStyle=`rgba(120,210,255,${.35*f})`;for(let i=0;i<6;i++){const u=((now*900+i*97)%T.len);c.beginPath();c.ellipse(u,Math.sin(i*2.1+now*20)*w*.25,26,6,0,0,6.283);c.fill();}}
      else if(T.k==='swipe'){c.translate(T.x,T.y);c.scale(1,.7);const s0=T.ang-T.arc/2,sw=T.arc*Math.min(1,a/.14);c.lineWidth=26*f+4;c.strokeStyle=`rgba(170,230,255,${.8*f})`;c.beginPath();c.arc(0,0,T.r*.82,s0,s0+sw);c.stroke();c.lineWidth=8*f+2;c.strokeStyle=`rgba(255,255,255,${.7*f})`;c.beginPath();c.arc(0,0,T.r*.9,s0,s0+sw);c.stroke();}
      else if(T.k==='pillar'){const h=200*Math.sin(Math.min(1,a/.25)*1.57)*(f>.3?1:f/.3),w=T.r*.55;let g=c.createLinearGradient(0,T.y-h,0,T.y);g.addColorStop(0,'rgba(200,245,255,0)');g.addColorStop(.3,`rgba(160,225,255,${.7*f})`);g.addColorStop(1,`rgba(90,190,255,${.8*f})`);c.fillStyle=g;
        c.beginPath();c.moveTo(T.x-w,T.y);for(let i=0;i<=8;i++){const u=i/8;c.lineTo(T.x-w*(1-u*.5)+Math.sin(now*30+i)*4,T.y-h*u);}for(let i=8;i>=0;i--){const u=i/8;c.lineTo(T.x+w*(1-u*.5)+Math.sin(now*30+i+2)*4,T.y-h*u);}c.closePath();c.fill();
        c.fillStyle=`rgba(230,250,255,${.5*f})`;c.beginPath();c.ellipse(T.x,T.y,T.r*(.7+.4*k),T.r*.7*(.7+.4*k),0,0,6.283);c.fill();}
      c.restore();continue;}
    // warning look like the game's other boss areas (red rim = danger) with water filling up as the hit comes
    const fill=`rgba(110,200,255,${.22+.33*k})`,base='rgba(255,60,90,.16)',rim=`rgba(255,96,120,${.75+.25*k})`;c.fillStyle=fill;c.strokeStyle=rim;c.lineWidth=4;
    const edge=f=>{c.save();c.strokeStyle='rgba(40,0,10,.35)';c.lineWidth=7;f();c.stroke();c.restore();f();c.stroke();};
    if(T.k==='circle'){const P0=()=>{c.beginPath();c.ellipse(T.x,T.y,T.r,T.r*.7,0,0,6.283);};P0();c.fillStyle=base;c.fill();edge(P0);c.fillStyle=fill;c.beginPath();c.ellipse(T.x,T.y,T.r*k,T.r*.7*k,0,0,6.283);c.fill();
      if(k>.6){c.strokeStyle=`rgba(255,255,255,${(k-.6)*1.6})`;c.beginPath();c.ellipse(T.x,T.y,T.r*.5,T.r*.35,0,0,6.283);c.stroke();}
      if(T.gey&&k>.45&&FXR())FXR().draw(c,'geyser',k<.75?0:1,T.x,T.y,T.r*1.7);}
    else if(T.k==='line'){c.translate(T.x,T.y);c.rotate(T.ang);c.fillStyle=base;c.fillRect(0,-T.w/2,T.len,T.w);edge(()=>{c.beginPath();c.rect(0,-T.w/2,T.len,T.w);});c.fillStyle=fill;c.fillRect(0,-T.w/2,T.len*k,T.w);
      c.fillStyle=`rgba(200,240,255,${.4+.4*k})`;for(let u=30;u<T.len;u+=60){c.beginPath();c.moveTo(u,-10);c.lineTo(u+14,0);c.lineTo(u,10);c.closePath();c.fill();}}
    else if(T.k==='arc'){c.translate(T.x,T.y);c.scale(1,.7);const P0=()=>{c.beginPath();c.moveTo(0,0);c.arc(0,0,T.r,T.ang-T.arc/2,T.ang+T.arc/2);c.closePath();};P0();c.fillStyle=base;c.fill();edge(P0);c.fillStyle=fill;c.beginPath();c.moveTo(0,0);c.arc(0,0,T.r*k,T.ang-T.arc/2,T.ang+T.arc/2);c.closePath();c.fill();}
    else if(T.k==='vortex'){const on=a>T.warm,w=on?1:a/T.warm,fade=Math.min(1,(T.dur-a)/.4);c.translate(T.x,T.y);c.scale(1,.7);c.globalAlpha=fade;
      const F=FXR();if(on&&F){const f0=F.fr('pool',0),left=T.dur-a,i=left<.4?(left<.2?9:8):Math.floor(now*11)%8;c.globalAlpha=fade*.72;F.draw(c,'pool',i,0,0,T.r*2,T.r*2*f0[3]/f0[2]/.7);c.globalAlpha=fade;}
      c.strokeStyle=`rgba(255,96,120,${.7*w})`;c.lineWidth=3;c.setLineDash([14,10]);c.beginPath();c.arc(0,0,T.r,0,6.283);c.stroke();c.setLineDash([]);
      c.fillStyle=`rgba(30,110,200,${on?.32:.14*w})`;c.beginPath();c.arc(0,0,T.core,0,6.283);c.fill();c.strokeStyle=`rgba(255,96,120,${on?.9:.5*w})`;c.lineWidth=3;c.beginPath();c.arc(0,0,T.core,0,6.283);c.stroke();
      if(on&&!F){c.lineWidth=4;for(let i=0;i<5;i++){const b=now*-3.2+i*1.2566;c.strokeStyle=`rgba(170,230,255,${.55})`;c.beginPath();for(let j=0;j<=24;j++){const u=j/24,rr=T.core*.4+(T.r-T.core*.4)*u,an=b+u*3.4;j?c.lineTo(Math.cos(an)*rr,Math.sin(an)*rr):c.moveTo(Math.cos(an)*rr,Math.sin(an)*rr);}c.stroke();}}}
    c.restore();}}

/* p330 art effects. Upright splashes / geysers / crown use bb() (stand up with the camera tilt); beam, arc, spray, trail, rings lie on the ground. */
function drawArt(c,T,a){const F=FXR();if(!F)return;const u=Math.min(.9999,a/T.dur),fade=u>.7?1-(u-.7)/.3:1;c.globalCompositeOperation='source-over';
  if(T.k==='abeam'){c.translate(T.x,T.y);c.rotate(T.ang);const L=T.len*Math.min(1,a/.08),ph=a*12,i=Math.floor(ph)%4,w=ph-Math.floor(ph),H=T.w*1.3;
    c.globalAlpha=fade*(1-w);F.draw(c,'beam',i,14,0,L-14,H);c.globalAlpha=fade*w;F.draw(c,'beam',(i+1)%4,14,0,L-14,H);
    c.globalAlpha=fade;F.draw(c,'muzzle',Math.min(3,Math.floor(u*4)),-6,0,T.w*1.35);return;}
  if(T.k==='aarc'){const f=F.fr('arc',2),sc=T.r/F.art.arc.R;c.translate(T.x,T.y-10);c.scale(1,.7);c.rotate(T.ang-Math.PI);c.globalAlpha=fade;const i=Math.min(3,Math.floor(u*4)),g=F.fr('arc',i);F.draw(c,'arc',i,0,0,g[2]*sc);return;}
  if(T.k==='aspray'){c.translate(T.x,T.y-20);c.rotate(T.ang);c.globalAlpha=fade;F.draw(c,'spray',Math.min(3,Math.floor(u*4)),0,0,170);return;}
  if(T.k==='atrail'){c.translate(T.x,T.y-10);c.rotate(T.ang);c.globalAlpha=fade;F.draw(c,'trail',Math.min(3,Math.floor(u*4)),0,0,280);return;}
  if(T.k==='aring'){if(a<(T.dl||0))return;const v=Math.min(.9999,(a-(T.dl||0))/(T.dur-(T.dl||0)));c.globalAlpha=v>.7?1-(v-.7)/.3:1;F.draw(c,T.key,Math.floor(v*4),T.x,T.y,T.wd*(.75+.25*v));return;}
  const up=(fn)=>bb(T.x,T.y,fn);
  if(T.k==='asplash'){up(()=>F.draw(c,T.key,Math.floor(u*F.n_(T.key)),T.x,T.y,T.wd));return;}
  if(T.k==='agey'){up(()=>F.draw(c,'geyser',2+Math.floor(u*6),T.x,T.y,T.r*1.7));return;}
  if(T.k==='aseq'){const i=T.a+Math.floor(u*(T.b-T.a));if(T.gnd)F.draw(c,T.key,i,T.x,T.y,T.wd);else up(()=>F.draw(c,T.key,i,T.x,T.y,T.wd));return;}}
function drawTop(){if(!K.T.length)return;const c=ctx;
  for(const T of K.T){if(!T.art||T.zone!==G.zone||T.k==='aring'||T.k==='aseq'&&T.gnd)continue;c.save();try{drawArt(c,T,now-T.t0);}finally{c.restore();}}}
// orb drops (V2) and their splash where each one ends
function trackDrops(){const F=FXR();if(!F)return;const L=K.live||(K.live=new Map());
  for(const p of projs)if(p.c2ring!==undefined&&p.team==='e'&&p.src&&isS(p.src)&&p.life>0)L.set(p,[p.x,p.y]);
  for(const [p,xy] of L){if(p.life>0&&projs.includes(p)){xy[0]=p.x;xy[1]=p.y;continue;}L.delete(p);if(p.c2capped||G.zone!==K.lz)continue;fx({k:'asplash',key:'dsplash',x:xy[0],y:xy[1]+22,wd:84,dur:.42});}K.lz=G.zone;}
function orbCap(dt){if(P.dead)return;const H=K.rh||(K.rh={});for(const p of projs){if(!p.c2ring||p.life<=0)continue;const nx=p.x+p.vx*dt,ny=p.y+p.vy*dt;
  if(Math.hypot(P.x-nx,P.y-10-ny)<(P.r||12)+p.size+2){H[p.c2ring]=(H[p.c2ring]||0)+1;if(H[p.c2ring]>CFG.orbCap){p.life=0;p.c2capped=1;K.stats.orbCapped=(K.stats.orbCapped||0)+1;}else p.c2ring=0;}}}
/* hooks */
{const o=bossAI;bossAI=function(e,dt,dP){if(isS(e)){try{return ai(e,dt,dP);}catch(er){if(K.err.length<20)K.err.push('ai '+er.message);return;}}return o.apply(this,arguments);};}
{const o=update;update=function(dt){try{orbCap(dt);}catch(er){if(K.err.length<20)K.err.push('cap '+er.message);}const r=o.apply(this,arguments);try{tick(dt);trackDrops();}catch(er){if(K.err.length<20)K.err.push('tick '+er.message);}return r;};}
{const o=drawParts;drawParts=function(){const r=o.apply(this,arguments);try{drawTop();}catch(er){if(K.err.length<20)K.err.push('top '+er.message);}return r;};}
{const o=drawProj;drawProj=function(p){const F=FXR();if(p&&p.team==='e'&&p.src&&isS(p.src)&&F){const c=ctx,f=F.fr('drop',0),sc=36/f[3];c.save();try{c.globalCompositeOperation='source-over';c.globalAlpha=1;c.translate(p.x,p.y);c.rotate(Math.atan2(p.vy,p.vx));F.draw(c,'drop',Math.floor(now*12+(p.ph||(p.ph=Math.random()*4)))%4,0,0,f[2]*sc);}finally{c.restore();}return;}return o.apply(this,arguments);};}
{const o=drawRaidTele;drawRaidTele=function(){const r=o.apply(this,arguments);try{draw();}catch(er){if(K.err.length<20)K.err.push('draw '+er.message);}return r;};}
{const o=drawEnemy;drawEnemy=function(e){if(!isS(e))return o.apply(this,arguments);if(e.c2hide){if(Math.random()<.3)mist(e.x,e.y,1,20);return;}
  const D=e.c2k&&e.c2k.dive;let a=1,dy=0;if(D&&D.art){if(D.ph==='sink'){const k=Math.min(1,D.t/CFG.dive.sink);a=k>.8?1-(k-.8)/.2:1;}}
  else if(D&&D.ph==='sink'){const k=Math.min(1,D.t/CFG.dive.sink);a=1-k;dy=k*26;}else if(D&&D.ph==='up'){const k=Math.min(1,D.t/.22);a=k;dy=(1-k)*40;}
  const F=FXR();if(F&&e.c2k&&e.c2k.ph>=2){const c=ctx;c.save();try{c.globalCompositeOperation='source-over';c.globalAlpha*=.64*a;F.draw(c,'smoke',Math.floor(now*10)%8,e.x,e.y+(e.sz||34)*.35+6,225);}finally{c.restore();}}   // V7 behind the body
  if(a>=1)return o.apply(this,arguments);ctx.save();ctx.globalAlpha*=a;ctx.translate(0,dy);try{return o.apply(this,arguments);}finally{ctx.restore();}};}
{const o=hitEnemy;hitEnemy=function(e,m,op){if(e&&e.c2hide&&isS(e))return 0;return o.apply(this,arguments);};}
// the boss summon waves (engine, every ~20 s) pulled Map 1 critters (slime, thorn beetle, treant) for the serpent: use the pool's own Mistlings
if(typeof bsumPool==='function'){const o=bsumPool;bsumPool=function(boss){if(isS(boss)&&typeof MOBS!=='undefined'&&MOBS.mistling)return [['mistling',18],['mistling',19],['mistling',20]];return o.apply(this,arguments);};}
// Balance 29 Oct: serpent minions at most 3 alive; elite-promoted ones also hit x0.6 (normal ones already get the Map 5/6 swarm x0.6)
if(typeof C182!=='undefined'&&typeof C182.bsum==='function'){const o=C182.bsum;C182.bsum=function(boss,k){if(isS(boss)&&k==='cap')return 3;return o.apply(this,arguments);};}
{const o=hurtPlayer;hurtPlayer=function(raw,src){if(src&&src.sumBoss&&isS(src.sumBoss)&&(src.eliteX||src.m&&src.m.elite))raw*=.6;return o.call(this,raw,src);};}
K.ok=true;
})();

