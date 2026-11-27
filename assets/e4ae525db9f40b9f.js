
/* ---- candidate_balance_v1_r71: p281 r1 sword skill rework, 4 skills (VFX + mechanics of the approved demo; TEST only) ---- */
/* p281 r1 — DeaRz APPROVED the sword rework demo 23 Oct 00:31 ("อนุมัติ"; demo v3 https://claude.ai/artifact/72HHDUDHaD16xykj1nqw6d,
   look + timing source of truth approved/vfx/SWORD_REWORK_demo_r2_source.html; order orders/code/ORDER_20261023_sword-rework-4-skills.md).
   Numbers = balance/sword_rework_r1/REPORT_20261022_sword_rework.md, used as TEST defaults (DeaRz still to decide: the new Lv5 / Lv10
   bonuses and Judgment 600 % vs 700 %). TEST only: never merged into the real game without DeaRz's order.
   The four old modules (p231 sk2, p241 atk3, p242 atk4, p244 atk5) stay loaded and untouched; this patch takes over their cast entry points
   (module .cast / .press, the U / B / N / R keys, the skill bar and phone buttons through p240) and runs the new skills instead:
     sk2  เขี้ยวผ่าศิลา  : windup 0.24 s, 3 fire crescents fan out (−24 / 0 / +24°; Lv10 5-way ±48°) on the ground for the wave length in 0.62 s,
                         each rips a cooling ground crack; hit 1 when a wave passes a monster, hit 2 = the ground under it bursts 0.24 s later;
                         one wave per monster per cast; a wave stops at a wall.
     atk3 วังวนเจ็ดคม   : windup 0.22 s, 12 hits every 0.11 s in place (one turn every 3 hits, the hero turns with the spin), fire trail band split
                         behind / in front of the hero, a short crescent per hit, floor glow, feet dust; monsters flash only every other hit at
                         55 % (jitter + spark on the others); after the last hit a flare ring pushes monsters out (Lv10: pulls them in).
     atk4 ดาบพิพากษา   : no charge. Raise the sword, a light beam goes up and back, a dashed target circle on the ground, 3 giant swords fly in
                         diagonally from high behind the hero and stab a triangle (radius 78) at 0.72 / 0.94 / 1.16 s; each impact = shake, 2 rings,
                         7 cracks, dust, chips, embers, AoE 125 px (Lv5+ 150); gold triangle link; swords wobble, glow, embers, dissolve at 2.9 s.
                         Hero locked 1.3 s. Lv10 (TEST default): the triangle bursts once more for 50 % of the total.
     atk5 เขตแดนดาบพิทักษ์: one giant sword (polished: bevel, fuller marks, winged guard, gem, grip, pommel) drops and plants beside the hero;
                         heal once at the plant (+ "+20% HP" pop), DEF buff (hex shell + badge countdown), zone 210 px (gold rings + turning ticks),
                         7 waves every 0.7 s from 0.8 s, monsters inside are hit with a 60 % flash. Lv10 (TEST default): the zone follows the hero.
   Colours = r30 sword wave fire #b8321e → #ff8a2a → #ffd36b → #fff2c0. Ground marks are drawn in world space (the camera squashes them);
   upright effects are drawn as billboards. One shared particle pool, cap 120.
   Hero poses: the approved 3D sword slash frames (p269 set) re-timed per skill — a stand-in until 3D animations exist for these skills
   (the demo hero is a stand-in too). ?swrework=off = r70. Debug: window.__SWRW. */
/* r2 (23 Oct, VFX stage 1 + stage 3 round 1): Whirl ticks no longer fire the engine's themed hit burst (mobs stayed white); Zone rim
   gets a dark outline + stronger fill; hero pose switches with a hard cut (no 0.08 s crossfade ghost); Zone plant dust starts at the
   sword base and is drawn under the hero. Effect sizes unchanged: they already equal the demo's px relative to the hero (see REPORT r72). */
(function(){'use strict';
/* r6 (23 Oct, VFX stage 3): Sanctuary DEF no longer lapses ~0.1 s before each pulse: while another pulse is coming the buff holds a
   0.3 s margin past the next pulse and the badge shows the 2 s count; after the last pulse it lasts 2 s and fades as before. Numbers unchanged. */
/* r5 (23 Oct, DeaRz 12:15): Sanctuary pulses every 2 s; EVERY pulse heals +HP (20% at Lv4) and gives DEF +20% for 2 s (refreshed each pulse);
   no one-time heal at the plant any more; damage total kept (Lv4 500% split over the pulses); the sword no longer jolts on a pulse. */
/* r4 (23 Oct, DeaRz 11:36-11:37): Whirl gets the old p241 tornado back (drawn by p283 __WSTORM behind / in front of the hero);
   Judgment: the light line from the hero's sword up to the sky is gone; Sanctuary: the sword hovers above the ground (no plant, no cracks / dirt). */
/* r3 (23 Oct, DeaRz 05:13): Sanctuary zone + waves come out of the SWORD, planted 80 px in front of the hero (shortened at walls);
   ring, ticks, waves, hit test and motes use the sword point; heal pulse, +HP pop and DEF shell stay on the hero. */
const X=window.__SWRW={ver:'p281-r6',on:!/swrework=off/.test(location.search),err:null,log:[],refused:[],hits:[],cur:null,fx:[],stats:{casts:{},peakP:0,heroFrames:0,keys:0}};
if(!X.on)return;
try{
const HD=window.__HERO3D,HS=window.HEROSW,SWD=window.__HEROSW,SL=window.SKLV;
const MODS={sk2:window.__SK2L,atk3:window.__SKATK3,atk4:window.__SKATK4,atk5:window.__SKATK5};
const miss=[!HD&&'__HERO3D',...Object.keys(MODS).filter(k=>!MODS[k]),typeof hitEnemy!=='function'&&'hitEnemy',typeof update!=='function'&&'update',
  typeof drawPlayerSprite!=='function'&&'drawPlayerSprite',typeof drawSummon!=='function'&&'drawSummon',typeof surfaceFx!=='function'&&'surfaceFx',
  typeof drawParts!=='function'&&'drawParts',typeof render!=='function'&&'render',typeof recalc!=='function'&&'recalc',typeof healP!=='function'&&'healP',
  !(window.C182&&C182.api&&C182.api.ctxFor)&&'C182'].filter(Boolean);
if(miss.length){X.err='hooks missing '+miss.join(',');return;}

/* ================= numbers (balance/sword_rework_r1, Lv1..Lv10; TEST defaults) ================= */
const NUM=X.num={
  sk2:{id:'wsSword2',name:'เขี้ยวผ่าศิลา',key:'U',mul:[1.4,1.6,1.8,2.0,2.3,2.5,2.72,2.96,3.22,3.56],len:[294,311,329,346,363,381,398,415,432,450],mp:[19,20,21,22,23,24,25,26,28,29],cd:10},
  atk3:{id:'wsAtk3',name:'วังวนเจ็ดคม',key:'B',mul:[.286,.327,.367,.408,.470,.510,.555,.604,.657,.727],r:[73,77,80,84,91,95,99,106,110,117],mp:[22,23,25,26,27,29,30,31,32,34],cd:12},
  atk4:{id:'wsAtk4',name:'ดาบพิพากษา',key:'N',mul:[1.4,1.6,1.8,2.0,2.3,2.5,2.72,2.96,3.22,3.56],aoe:[125,125,125,125,150,150,150,150,150,150],mp:[26,27,28,30,32,33,34,36,38,39],cd:15},
  atk5:{id:'wsAtk5',name:'เขตแดนดาบพิทักษ์',key:'R',mul:[.500,.571,.643,.714,.821,.893,.971,1.057,1.150,1.271],heal:[.14,.16,.18,.20,.22,.23,.24,.25,.26,.27],def:[.14,.16,.18,.20,.22,.23,.24,.25,.26,.27],dur:[4,4.3,4.7,5,5.5,5.8,6,6.2,6.5,7],mp:[30,32,33,35,37,38,40,42,44,46],cd:25,r:210}};
/* r80 balance (DeaRz 14:10, balance/approved/BALANCE_skills_approved_20261023_v1.md #5): Sanctuary heal + DEF only while the hero is inside the ring,
   cd 25 -> 45 s, Lv5+ ring +15%. ?sanctbal=off = r79 rules */
const SBAL=!/sanctbal=off/.test(location.search);if(SBAL)NUM.atk5.cd=45;
const lvOf=k=>{try{return SL&&SL.get?Math.max(1,Math.min(10,SL.get(k)|0||4)):4;}catch(_){return 4;}};
const NV=(k,f)=>NUM[k][f][lvOf(k)-1];

/* ================= small helpers ================= */
const FR='#b8321e',OR='#ff8a2a',GD='#ffd36b',WY='#fff2c0',HEAL='#b8ff8a';
const clamp=(v,a,b)=>v<a?a:v>b?b:v,ease=x=>1-Math.pow(1-clamp(x,0,1),3),seg=(t,a,b)=>clamp((t-a)/(b-a),0,1),rnd=(a,b)=>a+Math.random()*(b-a),lerp=(a,b,u)=>a+(b-a)*u;
const ss=u=>u<=0?0:u>=1?1:u*u*(3-2*u),TAU2=6.2832;
const clk=()=>typeof time==='number'?time:performance.now()/1000;
const yawNow=()=>{try{return typeof camY==='function'?camY():0;}catch(_){return 0;}};
const tiltNow=()=>{try{return typeof camT==='function'?camT():1;}catch(_){return 1;}};
const swordNow=()=>!!(P&&!P.dead&&P.weapon&&P.weapon.t==='sword');
const liveE=e=>!!(e&&!e.dead&&e.hp>0&&!e.dev&&!e.sprGhost&&!e.removed);
const bossE=e=>!!(e&&e.m&&e.m.boss);
const UID=new WeakMap();let uidN=0;const uid=e=>{let v=UID.get(e);if(!v){v=++uidN;UID.set(e,v);}return v;};
const dirIdx=g=>{const a=Math.atan2(Math.sin(g),Math.cos(g));return ((Math.round(a/(Math.PI/4))%8)+8)%8;};   // screen angle -> 0 = E ... (HERO3D order)
function los(x0,y0,x1,y1,stop){const L=Math.hypot(x1-x0,y1-y0),n=Math.max(1,Math.ceil((L-stop)/8));for(let i=1;i<=n;i++){const u=Math.min(1,(i*8)/L);if(u*L>L-stop)break;if(blocked(x0+(x1-x0)*u,y0+(y1-y0)*u,2))return false;}return true;}
function wallLen(x,y,a,len){const c=Math.cos(a),s=Math.sin(a);for(let d=8;d<=len;d+=8){if(blocked(x+c*d,y+s*d,2))return Math.max(0,d-8);}return len;}
function shk(v){try{if(typeof shake==='function')shake(v);}catch(_){}}
function refuse(k,why){X.refused.push({k,t:+clk().toFixed(2),why});if(X.refused.length>40)X.refused.shift();try{textAt(P.x,P.y-62,NUM[k].name+': '+why,'#ffb4a8',13);}catch(_){}return false;}
function mk(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c;}
const GL={};function gsp(col){return GL[col]||(GL[col]=mk(64,64,g=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,col);r.addColorStop(.3,col+'bb');r.addColorStop(1,col+'00');g.fillStyle=r;g.fillRect(0,0,64,64);}));}
const DUST=mk(128,128,g=>{const r=g.createRadialGradient(58,56,0,64,64,64);r.addColorStop(0,'rgba(150,122,92,.9)');r.addColorStop(.55,'rgba(120,96,72,.55)');r.addColorStop(1,'rgba(90,70,50,0)');g.fillStyle=r;g.fillRect(0,0,128,128);});

/* ================= transforms: world (camera) pass and billboard pass ================= */
let MW=null,MS=1;   // matrix of the pass being drawn, device px per local px
function capWorld(){try{MW=ctx.getTransform();MS=DPR*(typeof camZ==='function'?camZ():1);}catch(_){MW=null;}}
function capBB(){try{MW=ctx.getTransform();MS=Math.hypot(MW.a,MW.b)||1;}catch(_){MW=null;}}
const scr=(x,y)=>MW.transformPoint({x,y});
function BB(wx,wy,fn){if(!MW)return;const p=scr(wx,wy);ctx.save();ctx.setTransform(MS,0,0,MS,p.x,p.y);try{fn();}finally{ctx.restore();}}
function loc(ax,ay,bx,by){const a=scr(ax,ay),b=scr(bx,by);return {x:(b.x-a.x)/MS,y:(b.y-a.y)/MS};}       // world point B seen from anchor A, local px
function fdir(ax,ay,ang){const v=loc(ax,ay,ax+Math.cos(ang)*60,ay+Math.sin(ang)*60),l=Math.hypot(v.x,v.y)||1;return {x:v.x/l,y:v.y/l};}   // screen direction of a world angle

/* ================= particles (world anchor + local offset; one pool, cap 120) ================= */
const PT=[],CAP=120;
function add(p){if(PT.length>=CAP)return;p.age=0;p.vx=p.vx||0;p.vy=p.vy||0;p.g=p.g||0;p.rot=p.rot||0;p.vr=p.vr||0;p.drag=p.drag||0;PT.push(p);if(PT.length>X.stats.peakP)X.stats.peakP=PT.length;}
function stepP(dt){for(const p of PT){p.age+=dt;p.vx*=1-p.drag*dt;p.vy=p.vy*(1-p.drag*dt)+p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;if(p.floor!=null&&p.y>p.floor){p.y=p.floor;p.vy*=-.25;p.vx*=.5;p.vr*=.4;}}
  for(let i=PT.length-1;i>=0;i--)if(PT[i].age>=PT[i].life)PT.splice(i,1);}
const spark=(wx,wy,x,y,o)=>add(Object.assign({k:'s',wx,wy,x,y,s:20,col:GD,life:.2},o||{}));
function ember(wx,wy,x,y,o){add(Object.assign({k:'s',wx,wy,x,y,s:rnd(4,8),col:Math.random()<.5?OR:GD,vx:rnd(-60,60),vy:-rnd(40,120),g:120,drag:1.5,life:rnd(.4,.8)},o||{}));}
function dust(wx,wy,x,y,s,o){const v=rnd(.6,1.5);add(Object.assign({k:'dust',wx,wy,x:x+rnd(-.3,.3)*s,y:y+rnd(-.2,.2)*s,s:s*v,sq:rnd(.7,1.3),vy:-rnd(10,30),vx:rnd(-15,15),life:rnd(.6,1),fin:.12,grow:.8,ph:rnd(0,TAU2)},o||{}));}
function chips(wx,wy,x,y,n,dx){for(let i=0;i<n;i++)add({k:'chip',wx,wy,x:x+rnd(-6,6),y:y+rnd(-10,10),vx:(dx||0)*rnd(60,160)+rnd(-80,80),vy:-rnd(80,200),g:600,vr:rnd(-12,12),s:rnd(3,6),life:rnd(.5,.8),floor:y+rnd(30,45)});}
function drawP(back){if(!MW||!PT.length)return;ctx.save();
  for(const p of PT){if(!!p.back!==!!back)continue;const u=p.age/p.life,fi=p.fin?seg(p.age,0,p.fin):1,a=fi*(1-Math.max(0,u-(p.hold||.5))/(1-(p.hold||.5)));if(a<=0)continue;
    const q=scr(p.wx,p.wy);ctx.setTransform(MS,0,0,MS,q.x,q.y);ctx.globalAlpha=clamp(a*(p.a||1),0,1);
    if(p.k==='dust'){const s=p.s*(1+u*(p.grow||.8)),ph=p.ph||0;ctx.globalCompositeOperation='source-over';ctx.globalAlpha*=.6;
      for(let j=0;j<3;j++){const an=ph+j*2.1+u*1.5,d=s*(.25+.35*u),q2=s*(.75-.12*j)*(.75+.5*Math.abs(Math.sin(ph*3+j)));ctx.drawImage(DUST,p.x+Math.cos(an)*d-q2,p.y+Math.sin(an)*d*.6-q2*.8,q2*2*(p.sq||1),q2*1.6/(p.sq||1));}}
    else if(p.k==='chip'){ctx.globalCompositeOperation='source-over';ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle='#8a6440';ctx.fillRect(-p.s,-p.s*.35,p.s*2,p.s*.7);ctx.restore();}
    else{ctx.globalCompositeOperation='lighter';ctx.drawImage(gsp(p.col||GD),p.x-p.s/2,p.y-p.s/2,p.s,p.s);}}
  ctx.restore();}

/* ================= ground cracks (world space; dark core + hot orange line that cools) ================= */
const CR=[];
function crack(x0,y0,x1,y1,o){const n=8,pts=[],dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1;for(let i=0;i<=n;i++){const q=i/n,j=(i&&i<n)?rnd(-7,7):0;pts.push([x0+dx*q-dy/l*j,y0+dy*q+dx/l*j]);}
  CR.push(Object.assign({pts,t0:clk(),life:2.2,w:3},o||{}));if(CR.length>90)CR.shift();}
function drawCracks(){const now=clk();for(let i=CR.length-1;i>=0;i--)if(now-CR[i].t0>CR[i].life)CR.splice(i,1);
  for(const c of CR){const age=now-c.t0;if(age<0)continue;const a=1-seg(age,c.life-.6,c.life),grow=c.grow?seg(age,0,c.grow):1,n=Math.max(2,Math.ceil(c.pts.length*grow)),pts=c.pts.slice(0,n);
    const path=()=>{ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));};
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.globalAlpha=a*.35;ctx.strokeStyle='#4a3020';ctx.lineWidth=c.w*2.6;path();ctx.stroke();
    ctx.globalAlpha=a*.75;ctx.strokeStyle='#22140a';ctx.lineWidth=c.w*1.1;path();ctx.stroke();
    const heat=1-seg(age,.2,1.6)*.85;ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a*heat*.8;ctx.strokeStyle=OR;ctx.globalAlpha=a*heat*.22;ctx.lineWidth=c.w*2.4;path();ctx.stroke();   /* soft glow without shadowBlur (phone cost) */
    ctx.globalAlpha=a*heat*.8;ctx.strokeStyle=heat>.5?OR:FR;ctx.lineWidth=c.w*.55;ctx.stroke();ctx.restore();}}

/* ================= drawing helpers (demo shapes) ================= */
function band(pts,wf,col,a){if(pts.length<2||a<=0)return;const L2=[],R2=[];
  for(let i=0;i<pts.length;i++){const p0=pts[Math.max(0,i-1)],p1=pts[Math.min(pts.length-1,i+1)],dx=p1[0]-p0[0],dy=p1[1]-p0[1],l=Math.hypot(dx,dy)||1,w=wf(pts[i][2])/2;L2.push([pts[i][0]-dy/l*w,pts[i][1]+dx/l*w]);R2.push([pts[i][0]+dy/l*w,pts[i][1]-dx/l*w]);}
  ctx.save();ctx.globalAlpha*=a;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(L2[0][0],L2[0][1]);for(const q of L2)ctx.lineTo(q[0],q[1]);for(let i=R2.length-1;i>=0;i--)ctx.lineTo(R2[i][0],R2[i][1]);ctx.closePath();ctx.fill();ctx.restore();}
function fireArc(cx,cy,ang,r,span,w,a,sq){if(a<=0)return;sq=sq||1;const pts=[];for(let k=0;k<=18;k++){const q=k/18,an=ang-span/2+span*q;pts.push([cx+Math.cos(an)*r,cy+Math.sin(an)*r*sq,q]);}
  const prof=q=>Math.pow(Math.sin(q*Math.PI),.7);band(pts,q=>w*1.25*prof(q),FR,a*.75);band(pts,q=>w*.85*prof(q),OR,a*.9);
  ctx.save();ctx.globalCompositeOperation='lighter';band(pts,q=>w*.42*prof(q),GD,a);band(pts,q=>w*.16*prof(q),WY,a*.9);ctx.restore();}
function wRing(x,y,r,w,col,a){if(a<=0||r<=0)return;ctx.save();ctx.globalAlpha=a;ctx.strokeStyle=col;ctx.lineWidth=Math.max(.1,w);ctx.beginPath();ctx.arc(x,y,r,0,TAU2);ctx.stroke();ctx.restore();}
function wDisc(x,y,r,c0,c1,a){if(a<=0||r<=0)return;ctx.save();ctx.globalAlpha=a;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,c0);g.addColorStop(1,c1);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU2);ctx.fill();ctx.restore();}
function floatText(x,y,s,col,a){if(a<=0)return;ctx.save();ctx.globalAlpha=a;ctx.font='700 13px "Noto Sans Thai",system-ui,sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#2a1608';ctx.strokeText(s,x,y);ctx.fillStyle=col;ctx.fillText(s,x,y);ctx.restore();}
/* giant sword, point (0,0) = where the blade enters the ground, hilt up */
function giantSword(x,y,a,glowA,rot,sc,tt){if(a<=0)return;sc=sc||1;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);if(rot)ctx.rotate(rot);ctx.scale(sc,sc);const L2=200,BW=16,A=ctx.globalAlpha;
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=A*glowA*.5;ctx.drawImage(gsp(GD),-72,-L2-50,144,L2+80);ctx.restore();
  const g=ctx.createLinearGradient(-BW,0,BW,0);g.addColorStop(0,'#7c8798');g.addColorStop(.47,'#f6f9ff');g.addColorStop(.53,'#b9c3d1');g.addColorStop(1,'#5f697a');
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-BW,-L2+6);ctx.lineTo(BW,-L2+6);ctx.lineTo(BW*.92,-40);ctx.quadraticCurveTo(BW*.7,-4,0,22);ctx.quadraticCurveTo(-BW*.7,-4,-BW*.92,-40);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(255,226,150,.95)';ctx.lineWidth=1.6;ctx.stroke();
  ctx.fillStyle='rgba(120,90,40,.5)';ctx.fillRect(-3,-L2+14,6,L2-70);
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=A*(.5+.5*glowA);ctx.fillStyle=GD;ctx.fillRect(-1.2,-L2+16,2.4,L2-74);
  for(let k=0;k<5;k++){const yy=-L2+34+k*26;ctx.globalAlpha=A*(.35+.65*glowA)*(.6+.4*Math.sin(tt*4+k));ctx.beginPath();ctx.moveTo(0,yy-7);ctx.lineTo(5,yy);ctx.lineTo(0,yy+7);ctx.lineTo(-5,yy);ctx.closePath();ctx.fill();}ctx.restore();
  ctx.fillStyle='#d9b45a';ctx.fillRect(-BW-2,-L2+2,BW*2+4,8);
  const gg=ctx.createLinearGradient(0,-L2-22,0,-L2+8);gg.addColorStop(0,'#ffe9a8');gg.addColorStop(1,'#a8781e');ctx.fillStyle=gg;
  ctx.beginPath();ctx.moveTo(-52,-L2-14);ctx.quadraticCurveTo(-30,-L2-2,-12,-L2-4);ctx.lineTo(0,-L2-16);ctx.lineTo(12,-L2-4);ctx.quadraticCurveTo(30,-L2-2,52,-L2-14);ctx.quadraticCurveTo(40,-L2+6,14,-L2+4);ctx.lineTo(0,-L2+10);ctx.lineTo(-14,-L2+4);ctx.quadraticCurveTo(-40,-L2+6,-52,-L2-14);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#7a5418';ctx.lineWidth=1.2;ctx.stroke();
  ctx.fillStyle='#ff7a2a';ctx.beginPath();ctx.arc(0,-L2-4,5.5,0,TAU2);ctx.fill();ctx.fillStyle='#fff2c0';ctx.beginPath();ctx.arc(-1.5,-L2-5.5,1.8,0,TAU2);ctx.fill();
  ctx.fillStyle='#4a2a14';ctx.fillRect(-6,-L2-54,12,40);ctx.strokeStyle='#8a5a2a';ctx.lineWidth=2;for(let k=0;k<5;k++){ctx.beginPath();ctx.moveTo(-6,-L2-50+k*8);ctx.lineTo(6,-L2-46+k*8);ctx.stroke();}
  ctx.fillStyle='#d9b45a';ctx.beginPath();ctx.moveTo(0,-L2-72);ctx.lineTo(9,-L2-62);ctx.lineTo(0,-L2-52);ctx.lineTo(-9,-L2-62);ctx.closePath();ctx.fill();
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=A*(.5+.5*glowA);ctx.drawImage(gsp(OR),-14,-L2-76,28,28);ctx.restore();ctx.restore();}
function mound(x,y,a,glowA,big){ctx.save();ctx.globalAlpha*=a;const s=big?1:.6;ctx.fillStyle='#3a2616';ctx.beginPath();ctx.ellipse(x,y+4*s,30*s,9*s,0,0,TAU2);ctx.fill();
  if(big){ctx.fillStyle='#6a4a2c';for(let k=0;k<7;k++){const ox=(k-3)*9,h=6+((k*37)%5);ctx.beginPath();ctx.ellipse(x+ox,y+6-Math.abs(ox)*.08,6,h*.6,0,0,TAU2);ctx.fill();}}
  ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=glowA;ctx.drawImage(gsp(OR),x-26*s,y-10*s,52*s,22*s);ctx.restore();}

/* ================= damage (same rule as the old sword skills: base = the real basic swing of the equipped weapon) ================= */
let seqN=0;
function castCtx(k,nHits,reach){const A=C182.api,wt=P.weapon&&P.weapon.t,wd=A.D().weapons&&A.D().weapons[wt],W_=(typeof WEAPONS!=='undefined'&&WEAPONS[wt])||{};
  if(!wd)return null;const basic=wd.actionCoef*wd.weights.reduce((a,b)=>a+b,0);
  const def={id:NUM[k].id,mode:'native',coefTotal:basic,flatTotal:0,weights:new Array(nHits).fill(1),maxTargets:99,targeting:'around',element:'Neutral',range:reach};
  const c=A.ctxFor('skill',NUM[k].id,def,{dt:W_.magic?'mag':'phys',lvScale:1,m0:1,reach:reach+200,cdId:NUM[k].id});c.swrw={k,basic};return c;}
function dmg(E,e,m,b3,o){o=o||{};const c=E.ctx,prev=C182.cur;let pl;if(!o.nopl){try{pl=wpal();}catch(_){}}const hp0=e.hp;C182.cur=c;let r=0;
  const oo={dt:c.dt,pl,ctx:c,b3};if(o.kb){oo.kb=o.kb;oo.fx=o.fx;oo.fy=o.fy;}
  const v0=o.hold?[e.vx||0,e.vy||0]:null;   // hold: the whirl / zone ticks keep monsters in place (no per-hit push-back from p203)
  try{r=hitEnemy(e,m,oo);}catch(err){X.err='dmg '+err.message;}finally{C182.cur=prev;}
  if(v0&&!e.dead){e.vx=v0[0];e.vy=v0[1];}
  if(o.flash!=null&&e.flash>0)e.flash=.12*o.flash;
  X.hits.push({k:E.k,cast:E.id,b3,id:uid(e),m:+m.toFixed(4),hp:Math.round(hp0-e.hp),t:+E.t.toFixed(3)});if(X.hits.length>900)X.hits.shift();return r;}
const near=(x,y,r)=>enemies.filter(e=>liveE(e)&&Math.hypot(e.x-x,e.y-y)-(e.sz||16)*.5<=r);

/* ================= hero pose (approved p269 slash frames, re-timed; stand-in until 3D poses for these skills exist) ================= */
const HIMG=new Image();HIMG.src=HD.src;X.himg=HIMG;   /* r84 p292: exposed so the pre-warm can decode it before the first Whirl */   // p269 swaps frames drawn from the p194 atlas (same src) to the new hero set
const ORD=['E','SE','S','SW','W','NW','N','NE'],DIX={};(HD.dirs||[]).forEach((d,i)=>DIX[d]=i);
const HF=HD.frame,KS=HD.drawScale;
const heroOK=()=>{try{return !!(HS&&HS.on!==false&&HD.index&&HD.index.slash&&SWD&&HS.ready>=Object.keys(SWD.atlases).length);}catch(_){return false;}};
function heroFrame(x,y,d,i,al){const row=HD.index.slash[DIX[ORD[d]]];if(!row||al<=0)return;const r=HD.rects[row[clamp(i|0,0,row.length-1)]];
  ctx.save();ctx.globalAlpha*=al;ctx.drawImage(HIMG,r[0],r[1],r[2],r[3],x+(r[4]-HF.ax)*KS,y+HD.footY+(r[5]-HF.ay)*KS,r[2]*KS,r[3]*KS);ctx.restore();X.stats.heroFrames++;}
function poseAt(seq,t){for(let n=0;n<seq.length;n++){const s=seq[n];if(t<s[1]||n===seq.length-1){const u=clamp((t-s[0])/Math.max(1e-6,s[1]-s[0]),0,1);return Math.round(lerp(s[2],s[3],u));}}return 0;}
const POSE={sk2:[[0,.20,2,18],[.20,.30,18,26],[.30,.85,26,44]],atk4:[[0,.30,2,19],[.30,.60,19,19],[.60,.75,19,22],[.75,1.3,22,22]],atk5:[[0,.25,2,10],[.25,.40,10,10],[.40,.55,10,22],[.55,.75,22,22]]};

/* ================= casts ================= */
let castN=0;
function busyOther(){const st=n=>{try{const o=window[n];return !!(o&&!o.err&&o.state);}catch(_){return false;}};return st('__SK1')||st('__SK3')||st('__PROV')||(window.BOW&&BOW.st);}
function aimAng(range){try{const T=window.TLOCK;if(T&&T.e&&liveE(T.e)&&Math.hypot(T.e.x-P.x,T.e.y-P.y)<=range)return {a:Math.atan2(T.e.y-P.y,T.e.x-P.x),e:T.e};}catch(_){}
  try{const q=aimPoint(range);if(q&&isFinite(q.x)&&Math.hypot(q.x-P.x,q.y-P.y)>8)return {a:Math.atan2(q.y-P.y,q.x-P.x),q};}catch(_){}
  return {a:typeof P.face==='number'?P.face:0};}
function cast(k){
  const m=MODS[k];
  if(!m||!m.test)return refuse(k,'ใช้ได้เฉพาะโหมดทดสอบ');
  if(!P||P.dead||typeof G==='undefined'||G.state!=='play'||G.edit||G.win)return refuse(k,'ใช้ไม่ได้ตอนนี้');
  if(!swordNow())return refuse(k,'ต้องถือดาบ');
  if(X.cur)return refuse(k,'กำลังร่ายสกิล');
  if(k==='atk5'&&X.fx.some(E=>E.k==='atk5'))return refuse(k,'เขตแดนยังอยู่');
  if((P.cds[NUM[k].id]||0)>0)return refuse(k,`คูลดาวน์ ${P.cds[NUM[k].id].toFixed(1)} วิ`);
  if(P.dash||P.casting||busyOther())return refuse(k,'กำลังทำท่าอื่น');
  const mp=NV(k,'mp');if(P.mp<mp)return refuse(k,'MP ไม่พอ');
  let E=null;
  if(k==='sk2')E=newFang();else if(k==='atk3')E=newWhirl();else if(k==='atk4')E=newJudg();else E=newSanct();
  if(!E||!E.ctx)return refuse(k,'ระบบดาเมจยังไม่พร้อม');
  P.mp-=mp;P.cds[NUM[k].id]=NUM[k].cd;
  Object.assign(E,{id:++castN,k,t:0,lv:lvOf(k),zone:G.zone,ev:{},anchor:{x:P.x,y:P.y},d:dirIdx(E.face+yawNow())});
  P.face=E.face;P.dash={vx:0,vy:0,t:99,swrw:1,hit:new Set()};
  X.cur=E;X.fx.push(E);X.stats.casts[k]=(X.stats.casts[k]||0)+1;
  X.log.push({cast:E.id,k,lv:E.lv,t0:+clk().toFixed(2),face:+E.face.toFixed(3),dir:ORD[E.d],mp});if(X.log.length>80)X.log.shift();
  return true;}
const once=(E,n,f)=>{if(!E.ev[n]){E.ev[n]=1;f();}};

/* ---------- 1. เขี้ยวผ่าศิลา ---------- */
const S1={GO:.24,T:.62};
function newFang(){const len=NV('sk2','len'),lv=lvOf('sk2'),A=aimAng(len+80),a=A.a,ox=P.x+Math.cos(a)*30,oy=P.y+Math.sin(a)*30;
  const fan=(lv>=10?[-48,-24,0,24,48]:[-24,0,24]).map(v=>v*Math.PI/180);
  const W=fan.map(f=>{const wa=a+f;return {a:wa,ux:Math.cos(wa),uy:Math.sin(wa),max:wallLen(ox,oy,wa,len),d:0,dp:0,ck:1,stop:null};});
  return {face:a,ox,oy,len,mul:NV('sk2','mul'),half:lv>=5?34:26,kb:lv>=5?160:100,W,hitSet:new Set(),bursts:[],lockT:.85,end:S1.GO+S1.T+1.9,ctx:castCtx('sk2',2,len)};}
function stepFang(E,dt){const t=E.t,{GO,T}=S1,hx=E.anchor.x,hy=E.anchor.y,fx=Math.cos(E.face)>=0?1:-1;
  if(t<GO-.04&&Math.random()<dt*25)ember(hx,hy,fx*14+rnd(-4,4),-50,{vy:-rnd(20,60),life:.4});
  if(t>=GO)once(E,'rel',()=>{shk(3);spark(hx,hy,fx*34,-24,{s:70,col:OR,life:.2});for(let i=0;i<5;i++)dust(E.ox,E.oy,rnd(-10,20),rnd(-4,4),rnd(10,14),{vx:fx*rnd(20,80),life:.6});});
  if(t<GO)return;
  const dNow=E.len*seg(t,GO,GO+T);
  for(const w of E.W){if(w.stop!=null)continue;
    w.dp=w.d;w.d=Math.min(dNow,w.max);const px=E.ox+w.ux*w.d,py=E.oy+w.uy*w.d;
    while(w.ck*40<=w.d){const d0=Math.max(0,(w.ck-1)*40),d1=w.ck*40;crack(E.ox+w.ux*d0,E.oy+w.uy*d0,E.ox+w.ux*d1,E.oy+w.uy*d1,{w:3.5});chips(E.ox+w.ux*d1,E.oy+w.uy*d1,0,-4,2,w.ux>=0?1:-1);w.ck++;}
    if(Math.random()<dt*8)ember(px,py,0,-30,{vx:-w.ux*60});if(Math.random()<dt*5)dust(px,py,0,0,rnd(8,12),{life:.6});
    for(const e of enemies){if(!liveE(e)||E.hitSet.has(e))continue;const rx=e.x-E.ox,ry=e.y-E.oy,s=rx*w.ux+ry*w.uy,lat=Math.abs(rx*w.uy-ry*w.ux),sz=e.sz||16;
      if(s>=w.dp-20-sz&&s<=w.d+10+sz*.5&&lat<E.half+sz*.6){E.hitSet.add(e);dmg(E,e,E.mul,0,{kb:E.kb,fx:e.x-w.ux,fy:e.y-w.uy});chips(e.x,e.y,0,-40,4,w.ux>=0?1:-1);spark(e.x,e.y,0,-40,{s:44,col:GD,life:.2});E.bursts.push({e,t:t+.24});}}
    if(w.d>=w.max&&w.max<E.len-1){w.stop=t;crack(px-w.uy*14,py+w.ux*14,px+w.uy*14,py-w.ux*14,{w:3});for(let i=0;i<4;i++)dust(px,py,rnd(-8,8),rnd(-6,2),rnd(10,14),{life:.7});}
    else if(dNow>=E.len)w.stop=t;}
  for(const b of E.bursts){if(b.done||t<b.t)continue;b.done=1;const e=b.e;if(!liveE(e))continue;
    dmg(E,e,E.mul,1);shk(3);for(let k=0;k<6;k++){const a=k/6*TAU2+rnd(-.2,.2),r=rnd(26,44);crack(e.x,e.y,e.x+Math.cos(a)*r,e.y+Math.sin(a)*r,{w:3,life:1.8});}
    for(let k=0;k<7;k++)add({k:'chip',wx:e.x,wy:e.y,x:rnd(-14,14),y:-rnd(0,10),vx:rnd(-90,90),vy:-rnd(160,280),g:700,vr:rnd(-12,12),s:rnd(4,8),life:rnd(.6,.9),floor:rnd(-4,10)});
    for(let k=0;k<5;k++)dust(e.x,e.y,rnd(-18,18),-rnd(0,14),rnd(12,18),{life:.8});for(let k=0;k<6;k++)ember(e.x,e.y,0,-10);}}
function topFang(E){const t=E.t,{GO,T}=S1;if(t<GO||t>GO+T+.15)return;
  for(const w of E.W){const end=w.stop!=null?Math.min(w.stop,GO+T):GO+T,a=seg(t,GO,GO+.05)*(1-seg(t,end-.08,end+.12));if(a<=0)continue;
    const d=Math.min(E.len*seg(Math.min(t,end),GO,GO+T),w.max),px=E.ox+w.ux*d,py=E.oy+w.uy*d,grow=.7+.3*seg(t,GO,GO+.2);
    BB(px,py,()=>{const sd=fdir(px,py,w.a),sa=Math.atan2(sd.y*1.4,sd.x);
      for(let g=2;g>=1;g--){const dd=Math.max(0,d-E.len*(g*.035)/T),o=loc(px,py,E.ox+w.ux*dd,E.oy+w.uy*dd);fireArc(o.x-Math.cos(sa)*44,o.y-34-Math.sin(sa)*22,sa,44*grow,1.9,16,a*.25/g,1.3);}
      fireArc(-Math.cos(sa)*44,-34-Math.sin(sa)*22,sa,44*grow,1.9,18,a,1.3);
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a*.5;ctx.drawImage(gsp(OR),-36,-70,72,72);ctx.restore();});}}

/* ---------- 2. วังวนเจ็ดคม ---------- */
const S2={T0:.22,DT:.11,N:12};
function newWhirl(){const R=NV('atk3','r');return {face:typeof P.face==='number'?P.face:0,R,Rv:96*R/84,mul:NV('atk3','mul'),lockT:S2.T0+S2.N*S2.DT+.2,end:2.4,ctx:castCtx('atk3',S2.N,R)};}
const whirlAng=(E,tt)=>E.th0+(tt-S2.T0)*(TAU2/(S2.DT*3));
function stepWhirl(E,dt){const t=E.t,{T0,DT,N}=S2,hx=E.anchor.x,hy=E.anchor.y;if(E.th0==null)E.th0=E.face+yawNow();
  const tEnd=T0+N*DT,spinning=t>=T0&&t<tEnd+.05;
  for(let k=0;k<N;k++){const tk=T0+k*DT;if(t<tk)break;once(E,'h'+k,()=>{
    for(const e of enemies){if(!liveE(e)||Math.hypot(e.x-hx,e.y-hy)-(e.sz||16)>E.R)continue;if(!los(hx,hy,e.x,e.y,e.sz||16))continue;
      dmg(E,e,E.mul,k,{flash:k%2?0:.55,nopl:1,hold:1});   // r2: no engine themed hit burst on any tick (it kept the mobs glowing white)
      if(k%2){e._swJit=clk();spark(e.x,e.y,0,-26,{s:22,col:OR,life:.15});}else spark(e.x,e.y,0,-26,{s:28,col:GD,life:.18});}
    const a2=whirlAng(E,tk);for(let i=0;i<2;i++)ember(hx,hy,Math.cos(a2)*E.Rv,-30+Math.sin(a2)*E.Rv*tiltNow(),{vx:-Math.sin(a2)*160,vy:-rnd(40,90)});
    if(k%3===0)shk(2);});}
  if(spinning&&Math.random()<dt*22){const a=rnd(0,TAU2);dust(hx,hy,Math.cos(a)*E.Rv*.9,4+Math.sin(a)*E.Rv*tiltNow()*.9,rnd(6,9),{vx:-Math.sin(a)*80,vy:-rnd(0,6),grow:.4,life:.45});}
  if(t>=tEnd)once(E,'fin',()=>{shk(4);const pull=E.lv>=10;
    for(const e of enemies){if(!liveE(e)||bossE(e))continue;const dx=e.x-hx,dy=e.y-hy,l=Math.hypot(dx,dy)||1;if(l-(e.sz||16)>E.R*1.8)continue;const f=(e.m&&e.m.elite?.3:1)*(pull?-200:260);e.vx=(e.vx||0)+dx/l*f;e.vy=(e.vy||0)+dy/l*f;e._swJit=clk();spark(e.x,e.y,0,-26,{s:28,col:WY,life:.18});}
    for(let i=0;i<14;i++){const a=i/14*TAU2;ember(hx,hy,Math.cos(a)*E.Rv,-24+Math.sin(a)*E.Rv*tiltNow(),{vx:Math.cos(a)*180,vy:Math.sin(a)*90-60});}
    for(let i=0;i<8;i++){const a=i/8*TAU2,w=loc(hx,hy,hx+Math.cos(a)*E.Rv,hy+Math.sin(a)*E.Rv);dust(hx,hy,w.x,w.y,rnd(14,20),{vx:Math.cos(a)*70,life:.9});}});}
function groundWhirl(E){const t=E.t,{T0,DT,N}=S2,on=seg(t,T0-.05,T0+.1)*(1-seg(t,T0+N*DT,T0+N*DT+.35)),hx=E.anchor.x,hy=E.anchor.y;
  if(on>0){wDisc(hx,hy,E.Rv*1.15,'rgba(255,138,42,.28)','rgba(184,50,30,0)',on);wRing(hx,hy,E.Rv,3,OR,on*.6);}
  const tE=T0+N*DT;if(t>=tE){const u=seg(t,tE,tE+.45);wRing(hx,hy,E.Rv*(1+u*.8),10*(1-u),GD,1-u);}}
function arcsWhirl(E,front){const t=E.t,{T0,DT,N}=S2,on=seg(t,T0-.05,T0+.1)*(1-seg(t,T0+N*DT,T0+N*DT+.35)),sq=tiltNow();
  if(on>0){const an=whirlAng(E,t);
    for(let g=0;g<3;g++){const a0=an-g*.95,s=Math.sin(a0);if(front?s<0:s>=0)continue;fireArc(0,-30,a0-.45,E.Rv,1.0,16-g*4,on*(1-g*.28),sq);}
    for(let k=0;k<N;k++){const tk=T0+k*DT,age=t-tk;if(age<0||age>.2)continue;const a2=whirlAng(E,tk);if(front?Math.sin(a2)<0:Math.sin(a2)>=0)continue;fireArc(0,-30,a2,E.Rv*1.08,.9,20,1-age/.2,sq);}}
  const tE=T0+N*DT,fa=1-seg(t,tE,tE+.45);if(front&&t>=tE&&fa>0){const u=seg(t,tE,tE+.45);fireArc(0,-30,1.57,E.Rv*(1+u*.6),6.1,14*(1-u),fa,sq);}}
function poseWhirl(E,t){const {T0,DT,N}=S2,tE=T0+N*DT;
  if(t<T0)return {d:E.d,i:Math.round(lerp(2,10,ease(t/T0)))};
  if(t<tE)return {d:dirIdx(whirlAng(E,t)),i:22};
  return {d:dirIdx(whirlAng(E,tE)),i:Math.round(lerp(30,44,seg(t,tE,E.lockT)))};}

/* ---------- 3. ดาบพิพากษา ---------- */
const S3={R:78,T:[.72,.94,1.16],FALL:.2,OUT:2.9};
function newJudg(){const aoe=NV('atk4','aoe');let C;
  const T=window.TLOCK;
  if(T&&T.e&&liveE(T.e)&&Math.hypot(T.e.x-P.x,T.e.y-P.y)<=380)C={x:T.e.x,y:T.e.y};
  else{let a=typeof P.face==='number'?P.face:0,d=230;try{const q=aimPoint(320);if(q&&isFinite(q.x)){const dd=Math.hypot(q.x-P.x,q.y-P.y);if(dd>8){a=Math.atan2(q.y-P.y,q.x-P.x);d=dd<140?230:Math.min(320,dd);}}}catch(_){}
    C={x:P.x+Math.cos(a)*d,y:P.y+Math.sin(a)*d};}
  const face=Math.atan2(C.y-P.y,C.x-P.x),yw=yawNow();
  const pts=[-90,150,30].map(sa=>{const wa=sa*Math.PI/180-yw;return {x:C.x+Math.cos(wa)*S3.R,y:C.y+Math.sin(wa)*S3.R};});
  return {face,C,pts,aoe,mul:NV('atk4','mul'),lockT:1.3,end:S3.OUT+.7,ents:pts.map((p,j)=>({x:p.x,y:p.y,sd:{col:GD,sz:20},swrw:1,hp:1,life:9,j})),ctx:castCtx('atk4',4,S3.R+aoe)};}
function stepJudg(E,dt){const t=E.t,hx=E.anchor.x,hy=E.anchor.y,fx=Math.cos(E.face)>=0?1:-1;
  /* r4: the sparks rising from the sword tip went with the sky light line (DeaRz 11:37 remove the line) */
  for(let j=0;j<3;j++){const p=E.pts[j];
    if(t>=S3.T[j])once(E,'imp'+j,()=>{shk(7);spark(p.x,p.y,0,-10,{s:150,col:WY,life:.18});
      for(let k=0;k<7;k++){const a=k/7*TAU2+rnd(-.3,.3),r=rnd(60,110);crack(p.x,p.y,p.x+Math.cos(a)*r,p.y+Math.sin(a)*r,{w:4,life:2.6,grow:.12});}
      for(let k=0;k<10;k++){const a=rnd(0,TAU2);dust(p.x,p.y,Math.cos(a)*20,Math.sin(a)*10,rnd(14,22),{vx:Math.cos(a)*rnd(80,160),vy:-rnd(10,40),drag:2.5,life:rnd(.8,1.2)});}
      for(let k=0;k<9;k++)add({k:'chip',wx:p.x,wy:p.y,x:rnd(-16,16),y:-rnd(0,8),vx:rnd(-160,160),vy:-rnd(200,340),g:800,vr:rnd(-14,14),s:rnd(4,9),life:rnd(.7,1),floor:rnd(-10,20)});
      for(let k=0;k<10;k++)ember(p.x,p.y,0,-10,{vx:rnd(-160,160),vy:-rnd(80,220)});
      for(const e of near(p.x,p.y,E.aoe))dmg(E,e,E.mul,j,{kb:120,fx:p.x,fy:p.y});});
    if(t>S3.T[j]&&t<S3.OUT&&Math.random()<dt*7)ember(p.x,p.y,rnd(-20,20),-rnd(0,8),{vx:rnd(-15,15),vy:-rnd(40,90),g:-20,life:rnd(.8,1.2)});}
  if(t>=S3.T[2]+.2)once(E,'link',()=>{for(const e of near(E.C.x,E.C.y,S3.R+E.aoe*.6))spark(e.x,e.y,0,-26,{s:28,col:GD,life:.18});});
  if(E.lv>=10&&t>=S3.T[2]+.25)once(E,'lv10',()=>{shk(5);for(const e of near(E.C.x,E.C.y,S3.R+E.aoe*.6))dmg(E,e,E.mul*1.5,3);});
  if(t>=S3.OUT)once(E,'out',()=>{for(const p of E.pts)for(let k=0;k<12;k++)add({k:'s',wx:p.x,wy:p.y,x:rnd(-12,12),y:-rnd(10,190),vy:-rnd(30,90),vx:rnd(-15,15),s:rnd(5,9),col:k%2?GD:WY,life:rnd(.6,1)});});}
/* r80 (p287, DeaRz 13:15): the Judgment target circle and the Sanctuary rim use the shared V7 rune band (STF.runeRing); ?runering=off = old rings */
const RRON=!/runering=off/.test(location.search),RRF=()=>RRON&&window.STF&&STF.runeRing;
function groundJudg(E){const t=E.t,C=E.C,T2=S3.T[2];
  const tel=seg(t,.3,.55)*(1-seg(t,T2,T2+.3));if(tel>0){const RR=RRF();if(RR){RR(C.x,C.y,S3.R+E.aoe*.7,GD,tel*.95,t*.5,0,seg(t,.3,.6),1);X.runeN=(X.runeN||0)+1;}else{ctx.save();ctx.globalAlpha=tel*.7;ctx.strokeStyle=GD;ctx.lineWidth=3;ctx.setLineDash([18,10]);ctx.lineDashOffset=-t*40;ctx.beginPath();ctx.arc(C.x,C.y,S3.R+E.aoe*.7,0,TAU2);ctx.stroke();ctx.restore();}}
  for(let j=0;j<3;j++){const p=E.pts[j],age=t-S3.T[j];if(age<0)continue;const u=seg(age,0,.45);
    wRing(p.x,p.y,E.aoe*(.25+.75*ease(u)),12*(1-u),WY,1-u);wRing(p.x,p.y,E.aoe*(.2+.8*ease(seg(age,.05,.55))),6*(1-u),OR,(1-seg(age,.05,.55))*.8);
    wDisc(p.x,p.y,46,'rgba(255,211,107,.55)','rgba(255,138,42,0)',(1-seg(age,.4,1.6))*(1-seg(t,S3.OUT,S3.OUT+.4)));}
  const la=seg(t,T2+.1,T2+.25)*(1-seg(t,T2+.9,T2+1.4));
  if(la>0){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=la;ctx.lineJoin='round';ctx.beginPath();E.pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.strokeStyle=OR;ctx.globalAlpha=la*.25;ctx.lineWidth=26;ctx.stroke();ctx.globalAlpha=la*.45;ctx.lineWidth=16;ctx.stroke();ctx.globalAlpha=la;ctx.strokeStyle=GD;ctx.lineWidth=10;ctx.stroke();ctx.restore();
    wDisc(C.x,C.y,S3.R+E.aoe*.6,'rgba(255,211,107,.35)','rgba(255,138,42,0)',la*.8);}}
/* flight: from high behind the hero (screen space, as in the demo) to the impact point */
function flight(E,j){const t=E.t,tt=t-S3.T[j]+S3.FALL;if(tt<0)return null;const p=E.pts[j],hx=E.anchor.x,hy=E.anchor.y;
  const hl=loc(p.x,p.y,hx,hy),fs=fdir(hx,hy,E.face);let bx=-fs.x,by=-fs.y;const bl=Math.hypot(bx,by)||1;bx/=bl;by/=bl;
  const sx=hl.x+bx*(170+j*40),sy=hl.y+by*(170+j*40)-(536+j*30),u=tt<S3.FALL?Math.pow(tt/S3.FALL,1.6):1;
  return {x:lerp(sx,0,u),y:lerp(sy,0,u),rot:Math.atan2(sx,-sy),u,dx:-sx,dy:-sy};}
function entJudg(E,ent){const j=ent.j,q=flight(E,j);if(!q)return;const t=E.t,a=1-seg(t,S3.OUT,S3.OUT+.5),age=t-S3.T[j];
  if(q.u<1){const l=Math.hypot(q.dx,q.dy)||1,ux=q.dx/l,uy=q.dy/l,tl=200+160*q.u;ctx.save();ctx.globalCompositeOperation='lighter';const pts=[];
    for(let k=0;k<=10;k++){const f=k/10;pts.push([q.x-ux*(tl*(1-f)+60),q.y-uy*(tl*(1-f)+60),f]);}band(pts,f=>4+24*f,GD,.55);band(pts,f=>2+8*f,WY,.7);ctx.restore();}
  const landed=age>=0,sw=landed?Math.sin(age*18)*Math.exp(-age*4)*.06+Math.sin(t*1.7+j)*.012:0;
  giantSword(q.x,q.y,a,age<0?1:.45+.55*(1-seg(age,0,.6))+.25*Math.sin(t*5+j*2),q.rot+sw,1,t);
  if(landed)mound(0,0,a,.35+.25*Math.sin(t*4+j),true);}
function topJudg(E){const t=E.t,sa=seg(t,.3,.5)*(1-seg(t,S3.T[2],S3.T[2]+.3));if(sa<=0)return;const hx=E.anchor.x,hy=E.anchor.y;
  BB(hx,hy,()=>{const fs=fdir(hx,hy,E.face),tip={x:fs.x*12,y:-78},p=E.pts[1],hl=loc(p.x,p.y,hx,hy);let bx=-fs.x,by=-fs.y;const bl=Math.hypot(bx,by)||1;bx/=bl;by/=bl;
    const s0={x:-hl.x+(hl.x+bx*210),y:-hl.y+(hl.y+by*210-566)};   // where sword 2 starts, seen from the hero
    const dx=s0.x-tip.x,dy=s0.y-tip.y;ctx.save();ctx.globalCompositeOperation='lighter';const pts=[];for(let k=0;k<=8;k++){const f=k/8;pts.push([tip.x+dx*f,tip.y+dy*f,f]);}
    band(pts,f=>10*(1-f*.6),GD,sa*.6);band(pts,f=>4*(1-f*.5),WY,sa*.8);ctx.globalAlpha=sa*.7;ctx.drawImage(gsp(GD),tip.x-20,tip.y-20,40,40);ctx.restore();});}

/* ---------- 4. เขตแดนดาบพิทักษ์ ---------- */
const S4={ON:.4,W0:.8,DT:2,N:3,HV:34,DEFT:2};/* r5: DT 2 s between pulses (N is per cast: E.N), DEFT = DEF time per pulse *//* r4: HV = sword tip height above the ground (px) */S4.END=S4.W0+(S4.N-1)*S4.DT+.5;
const BID='wsAtk5';
function newSanct(){const lv=lvOf('atk5'),face=typeof P.face==='number'?P.face:0,dur=NV('atk5','dur');
  const N=Math.max(1,Math.floor((dur-(S4.W0-S4.ON))/S4.DT)+1),END=S4.W0+(N-1)*S4.DT+.5;   // r5: pulses at 0.8, 2.8, 4.8 ... while the zone lasts (Lv4 5 s = 3)
  return {N,END,face,R:NUM.atk5.r*(SBAL&&lv>=5?1.15:1),mul:NV('atk5','mul')*7/N,heal:NV('atk5','heal'),def:NV('atk5','def'),dur,follow:lv>=10,Z:{x:P.x,y:P.y},sw:{x:P.x,y:P.y},
    lockT:.75,end:Math.max(END+.9,S4.ON+dur+.2),ent:{x:P.x,y:P.y,sd:{col:GD,sz:20},swrw:1,hp:1,life:9,j:-1},ctx:castCtx('atk5',N,NUM.atk5.r*(SBAL&&lv>=5?1.15:1))};}
const S4_FWD=80;   // r3: sword plants this far in front of the hero (demo v4 S4_SW)
function placeSword(E){const a=E.face,d=Math.min(S4_FWD,wallLen(P.x,P.y,a,S4_FWD));
  E.sw.x=P.x+Math.cos(a)*d;E.sw.y=P.y+Math.sin(a)*d;E.Z.x=E.sw.x;E.Z.y=E.sw.y;E.ent.x=E.sw.x;E.ent.y=E.sw.y;E.fwd=d;}
const DEFB={on:false,pct:0,until:0,add:0,E:null};
{const _rc=recalc;recalc=function(){const r=_rc.apply(this,arguments);try{if(P&&DEFB.on){const a=Math.round(P.def*DEFB.pct);DEFB.add=a;P.def+=a;}}catch(_){}return r;};}
function defOn(E,d){d=d||E.dur;DEFB.on=true;DEFB.pct=E.def;DEFB.until=clk()+d;DEFB.E=E;try{P.buffs[BID]={t:d+.3,max:d,pl:{main:GD,accent:WY},wsDef:1,swrw:1};}catch(_){}try{recalc();}catch(e){X.err='def '+e.message;}
  X.log.push({cast:E.id,ev:'def on',pct:E.def,dur:d,def:P.def,add:DEFB.add});}
function defOff(why){if(!DEFB.on)return;DEFB.on=false;try{if(P.buffs[BID]&&P.buffs[BID].swrw)delete P.buffs[BID];}catch(_){}try{recalc();}catch(_){}X.log.push({ev:'def off',why,def:P&&P.def});DEFB.E=null;}
function stepSanct(E,dt){const t=E.t;if(t<S4.ON||(E.follow&&P))placeSword(E);const zx=E.Z.x,zy=E.Z.y;
  if(t>=S4.ON)once(E,'plant',()=>{shk(2);const sx=E.sw.x,sy=E.sw.y;   // r4: the sword stops in the air (DeaRz 11:36 "2"): no cracks, no dirt; a soft gold puff under it
    for(let k=0;k<10;k++){const a=k/10*TAU2;add({k:'s',wx:sx,wy:sy,x:Math.cos(a)*14,y:-S4.HV+Math.sin(a)*6,vx:Math.cos(a)*90,vy:Math.sin(a)*30-20,s:rnd(5,8),col:k%2?WY:GD,life:rnd(.4,.6)});}
  });
  if(DEFB.on&&DEFB.E===E&&(clk()>=DEFB.until||!(P.buffs&&P.buffs[BID])))defOff(clk()>=DEFB.until?'time':'cleared');
  if(SBAL&&DEFB.on&&DEFB.E===E&&P&&Math.hypot(P.x-zx,P.y-zy)>E.R){defOff('left ring');E.leftN=(E.leftN||0)+1;}   // r80: DEF only inside the ring
  for(let w=0;w<E.N;w++){const tw=S4.W0+w*S4.DT;if(t<tw+.12)break;once(E,'w'+w,()=>{
    const inR=!SBAL||Math.hypot(P.x-zx,P.y-zy)<=E.R;(E.inR=E.inR||[]).push(inR);   // r80: heal + DEF only when the hero stands inside the ring
    const hp0=P.hp;C182.hsrc=BID;try{if(inR)healP(P.maxHp*E.heal);}catch(e){X.err='heal '+e.message;}finally{C182.hsrc=null;}(E.healed=E.healed||[]).push({w,hp0,hp1:P.hp,want:Math.round(P.maxHp*E.heal)});   // r5: every pulse heals
    if(inR)for(let k=0;k<14;k++)add({k:'s',wx:P.x,wy:P.y,x:rnd(-22,22),y:-rnd(0,20),vy:-rnd(50,110),s:rnd(6,10),col:k%2?HEAL:GD,life:rnd(.7,1)});
    E.lastP=tw;E.more=w<E.N-1;if(inR){defOn(E,E.more?S4.DT+.3:S4.DEFT);E.defShow=clk()+S4.DEFT;}if(!E.more)E.end=Math.max(E.end,E.t+S4.DEFT+.1);/* r6: the cast stays until the last DEF ends so its badge counts down to 0 and fades */   // r6: keep DEF through to the next pulse (no gap); the badge counts the 2 s
    for(const e of enemies){if(!liveE(e)||Math.hypot(e.x-zx,e.y-zy)-(e.sz||16)>E.R)continue;if(!los(zx,zy,e.x,e.y,e.sz||16))continue;dmg(E,e,E.mul,w,{flash:.6,hold:1});}
    for(let k=0;k<6;k++){const a=rnd(0,TAU2);ember(zx+Math.cos(a)*E.R*.9,zy+Math.sin(a)*E.R*.9,0,0,{vy:-rnd(60,120)});}});}
  if(t>.5&&t<E.END&&Math.random()<dt*10){const a=rnd(0,TAU2),r=rnd(0,E.R);add({k:'s',wx:zx+Math.cos(a)*r,wy:zy+Math.sin(a)*r,x:0,y:0,vy:-rnd(20,50),s:rnd(4,7),col:GD,life:rnd(.8,1.2)});}}
function groundSanct(E){const t=E.t,on=seg(t,S4.ON,S4.ON+.35)*(1-seg(t,E.END,E.END+.4)),x=E.Z.x,y=E.Z.y,R=E.R;
  if(on>0){wDisc(x,y,R,'rgba(255,211,107,.16)','rgba(255,170,60,.28)',on);const RR=RRF();if(RR){RR(x,y,R-14,GD,on,-t*.35,0,seg(t,S4.ON,S4.ON+.6),1);X.runeN=(X.runeN||0)+1;}else{   /* r80: p287 */
    wRing(x,y,R,8,'rgba(42,22,8,.5)',on);wRing(x,y,R,4.5,GD,on);wRing(x,y,R-12,3.5,'rgba(42,22,8,.35)',on);wRing(x,y,R-12,1.8,OR,on*.85);   // r2: dark outline so the rim reads on grass
    ctx.save();ctx.translate(x,y);ctx.rotate(-t*.35);ctx.globalAlpha=on*.7;ctx.strokeStyle=GD;ctx.lineWidth=2;for(let k=0;k<24;k++){const a=k/24*TAU2,r2=R-(k%3?30:40);ctx.beginPath();ctx.moveTo(Math.cos(a)*(R-22),Math.sin(a)*(R-22));ctx.lineTo(Math.cos(a)*r2,Math.sin(a)*r2);ctx.stroke();}ctx.restore();}
    for(let w=0;w<E.N;w++){const age=t-(S4.W0+w*S4.DT);if(age<0||age>.4)continue;const u=age/.4;wRing(x,y,R*ease(u),14*(1-u)+2,WY,(1-u)*.9);wRing(x,y,R*ease(u)*.94,6,OR,(1-u)*.6);wDisc(E.sw.x,E.sw.y,40,'rgba(255,242,192,.6)','rgba(255,138,42,0)',1-u);}}
  for(let w=0;w<E.N;w++){const t0=S4.W0+w*S4.DT+.12,ha=seg(t,t0,t0+.05)*(1-seg(t,t0+.3,t0+.8));if(ha>0&&P&&!(E.inR&&E.inR[w]===false)){const u=seg(t,t0,t0+.8);wRing(P.x,P.y,30+u*70,8*(1-u),HEAL,ha);}}}   // r5: heal ring on every pulse
function entSanct(E){const t=E.t,on=1-seg(t,E.END,E.END+.5),st=S4.ON-.28;if(t<st||on<=0)return;const fall=seg(t,st,S4.ON),
    bob=fall>=1?Math.sin((t-S4.ON)*2.4)*4*seg(t,S4.ON,S4.ON+.5):0,settle=fall>=1?Math.sin(seg(t,S4.ON,S4.ON+.35)*Math.PI)*-6:0,
    yy=lerp(-300,-S4.HV,Math.pow(fall,1.7))+bob+settle;   // r4: floats: drops to HV above the ground, a small settle dip, then a slow bob
  if(fall>0){ctx.save();const sh=.35+.65*fall,k=1-(-yy-S4.HV)/300*.6;ctx.globalAlpha*=on*.45*sh;ctx.fillStyle='rgba(30,20,10,1)';ctx.beginPath();ctx.ellipse(0,2,22*k,7*k,0,0,TAU2);ctx.fill();ctx.restore();}   // soft shadow on the ground
  let pulse=0;for(let w=0;w<E.N;w++){const tw=S4.W0+w*S4.DT;pulse=Math.max(pulse,Math.exp(-Math.pow((t-tw-.05)/.09,2)));}
  if(fall<1){ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createLinearGradient(0,yy-320,0,yy-110);g.addColorStop(0,'rgba(255,211,107,0)');g.addColorStop(1,'rgba(255,242,192,.8)');ctx.fillStyle=g;ctx.fillRect(-10,yy-320,20,210);ctx.restore();}
  giantSword(0,yy,on,.4+.6*pulse+.12*Math.sin(t*3),0,.62,t);
  if(fall>=1){ctx.save();ctx.globalAlpha*=on;ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=(.25+.45*pulse);ctx.drawImage(gsp(GD),-28,-10,56,20);ctx.globalAlpha=on*(.35+.4*pulse);ctx.drawImage(gsp(WY),-10,yy-12,20,20);ctx.restore();}}   // r4: glow on the ground under the tip + a spark at the tip (no dirt mound)
function topSanct(E){if(!P)return;const t=E.t,p0=E.lastP!=null?E.lastP+.12:-9,hu=seg(t,p0,p0+1.2),ta=seg(t,p0,p0+.1)*(1-seg(t,p0+.9,p0+1.2));   // r5: '+HP' pop after every pulse
  const own=DEFB.on&&DEFB.E===E,a=own?seg(t,S4.W0+.12,S4.W0+.32)*(E.more?1:1-seg(clk(),DEFB.until-.2,DEFB.until)):0;   /* r6: no fade between pulses */if(ta<=0&&a<=0)return;
  BB(P.x,P.y,()=>{floatText(0,-84-hu*30,'+'+Math.round(E.heal*100)+'% HP',HEAL,ta);if(a<=0)return;const left=Math.max(0,Math.min(DEFB.until,E.defShow||DEFB.until)-clk());
    ctx.save();ctx.globalCompositeOperation='lighter';for(let r=0;r<2;r++){ctx.save();ctx.translate(0,-32);ctx.scale(1,1.25);ctx.rotate((r?-1:1)*t*1.2);ctx.globalAlpha=a*(.18+.08*Math.sin(t*5+r));ctx.strokeStyle=r?OR:GD;ctx.lineWidth=2;ctx.beginPath();for(let k=0;k<=6;k++){const an=k/6*TAU2;k?ctx.lineTo(Math.cos(an)*30,Math.sin(an)*30):ctx.moveTo(30,0);}ctx.stroke();ctx.restore();}
    ctx.globalAlpha=a*.1;ctx.drawImage(gsp(GD),-40,-78,80,90);ctx.restore();
    const bx=-30,by=-80;ctx.save();ctx.globalAlpha=a;ctx.fillStyle='#c9962e';ctx.beginPath();ctx.moveTo(bx,by-10);ctx.lineTo(bx+9,by-6);ctx.lineTo(bx+8,by+4);ctx.lineTo(bx,by+11);ctx.lineTo(bx-8,by+4);ctx.lineTo(bx-9,by-6);ctx.closePath();ctx.fill();ctx.strokeStyle=WY;ctx.lineWidth=1.5;ctx.stroke();ctx.restore();
    floatText(bx-50,by+5,'DEF +'+Math.round(E.def*100)+'% '+left.toFixed(1)+'s',GD,a);});}

/* ================= main step ================= */
const STEP={sk2:stepFang,atk3:stepWhirl,atk4:stepJudg,atk5:stepSanct};
function unlock(E){try{if(P&&P.dash&&P.dash.swrw)P.dash=null;if(P){P.vx=0;P.vy=0;}}catch(_){}if(X.cur===E){X.cur=null;EX.t=clk();}}
function cancelAll(why){for(const E of X.fx){E.ended=why;X.log.push({cast:E.id,end:why,t:+E.t.toFixed(3)});}if(X.cur)unlock(X.cur);X.fx.length=0;X.cur=null;defOff(why);PT.length=0;CR.length=0;}
X.cancel=cancelAll;
function step(dt){if(!X.fx.length&&!PT.length&&!DEFB.on)return;
  if(!P||P.dead){cancelAll('hero died');return;}
  if(X.fx.length&&(G.zone!==X.fx[0].zone)){cancelAll('left the map');return;}
  if(!swordNow()&&(X.fx.length||DEFB.on)){cancelAll('weapon changed');return;}
  if(G.state==='play'){
    const C=X.cur;if(C){if(!P.dash||!P.dash.swrw)P.dash={vx:0,vy:0,t:99,swrw:1,hit:new Set()};P.dash.vx=0;P.dash.vy=0;P.dash.t=99;P.face=C.face;}
    for(const E of X.fx.slice()){E.t+=dt;try{STEP[E.k](E,dt);}catch(e){X.err='step '+E.k+' '+e.message;E.t=E.end;}
      if(X.cur===E&&E.t>=E.lockT)unlock(E);
      if(E.t>=E.end){const i=X.fx.indexOf(E);if(i>=0)X.fx.splice(i,1);X.log.push({cast:E.id,end:'done',t:+E.t.toFixed(3)});}}
    if(DEFB.on&&!X.fx.some(E=>E===DEFB.E)&&clk()>=DEFB.until)defOff('time');
    stepP(dt);}}
const PRF=X.prof={step:0,ground:0,top:0,ent:0,hero:0},pnow=()=>performance.now();
{const o=update;update=function(dt){let r;try{r=o.apply(this,arguments);}finally{const t0=pnow();try{step(+dt||0);}catch(e){X.err='step '+e.message;}PRF.step+=pnow()-t0;}return r;};}
if(typeof playerDeath==='function'){const o=playerDeath;playerDeath=function(){try{cancelAll('hero died');}catch(_){}return o.apply(this,arguments);};}
if(typeof loadZone==='function'){const o=loadZone;loadZone=function(){try{if(X.fx.length||DEFB.on)cancelAll('left the map');}catch(_){}return o.apply(this,arguments);};}

/* ================= draw hooks ================= */
{const o=surfaceFx;surfaceFx=function(){const r=o.apply(this,arguments);if(!X.fx.length&&!CR.length&&!PT.length)return r;
  const t0=pnow();try{capWorld();ctx.save();drawCracks();for(const E of X.fx){if(E.k==='atk3')groundWhirl(E);else if(E.k==='atk4')groundJudg(E);else if(E.k==='atk5')groundSanct(E);}ctx.restore();drawP(true);}catch(e){X.err='ground '+e.message;}PRF.ground+=pnow()-t0;return r;};}
{const o=render;render=function(){const add_=[];try{if(typeof summons!=='undefined'&&Array.isArray(summons))for(const E of X.fx){if(E.k==='atk4')for(const en of E.ents){en.E=E;add_.push(en);}else if(E.k==='atk5'&&E.t>=S4.ON-.28){E.ent.E=E;add_.push(E.ent);}}for(const en of add_)summons.push(en);}catch(e){X.err='ent '+e.message;}
  try{return o.apply(this,arguments);}finally{for(const en of add_){const i=summons.indexOf(en);if(i>=0)summons.splice(i,1);}}};}
{const o=drawSummon;drawSummon=function(u){if(u&&u.swrw){const t0=pnow();try{capBB();const E=u.E;BB(u.x,u.y,()=>{if(E.k==='atk4')entJudg(E,u);else entSanct(E);});}catch(e){X.err='sword '+e.message;}PRF.ent+=pnow()-t0;return;}return o.apply(this,arguments);};}
{const o=drawParts;drawParts=function(){const r=o.apply(this,arguments);if(!X.fx.length&&!PT.length)return r;
  const t0=pnow();try{capWorld();for(const E of X.fx){if(E.k==='sk2')topFang(E);else if(E.k==='atk5')topSanct(E);}drawP();/* r4: topJudg (sky light line) no longer drawn */}catch(e){X.err='top '+e.message;}PRF.top+=pnow()-t0;return r;};}
/* hero: the skill pose (blend in 0.08 s, out 0.08 s); whirl fire arcs behind / in front of the hero */
const EX={t:-9,d:0,i:0};
{const o=drawPlayerSprite;drawPlayerSprite=function(x,y){const E=X.cur,whirl=X.fx.find(F=>F.k==='atk3');
  let back=null,front=null;if(whirl){const WS=window.__WSTORM&&__WSTORM.on&&__WSTORM.layer;   // r4: old tornado back (p283)
    back=()=>{if(WS)WS(whirl.t,true,x,y);capBB();BB(whirl.anchor.x,whirl.anchor.y,()=>arcsWhirl(whirl,false));};front=()=>{capBB();BB(whirl.anchor.x,whirl.anchor.y,()=>arcsWhirl(whirl,true));if(WS)WS(whirl.t,false,x,y);};}
  try{if(back)back();}catch(e){X.err='whirl back '+e.message;}
  let r;
  if(E&&heroOK()&&E.t<E.lockT){
    try{const p=E.k==='atk3'?poseWhirl(E,E.t):{d:E.d,i:poseAt(POSE[E.k],E.t)};   // r2: hard cut in and out (a crossfade showed two see-through poses)
      heroFrame(x,y,p.d,p.i,1);EX.d=p.d;EX.i=p.i;try{if(window.HERO3D)HERO3D.anchor={x,y:y+HD.footY};}catch(_){}}
    catch(e){X.err='hero '+e.message;r=o.apply(this,arguments);}}
  else r=o.apply(this,arguments);
  try{if(front)front();}catch(e){X.err='whirl front '+e.message;}
  return r;};}
/* monsters hit on the off beats of the whirl get a short side jitter instead of a white flash */
if(typeof drawEnemy==='function'){const o=drawEnemy;drawEnemy=function(e){const j=e&&e._swJit?clk()-e._swJit:9;if(j<.1){ctx.save();ctx.translate(Math.sin(clk()*60)*3*(1-j/.1),0);try{return o.apply(this,arguments);}finally{ctx.restore();}}return o.apply(this,arguments);};}

/* ================= entry points: module API, skill bar / phone (p240 slotUse), keys ================= */
for(const k in MODS){const m=MODS[k];let own=m.state;
  try{Object.defineProperty(m,'state',{configurable:true,get(){const c=X.cur;return c&&c.k===k?c:own;},set(v){own=v;}});}catch(e){X.err='state '+k+' '+e.message;}
  m.cast=()=>cast(k);
  if(k==='atk4'){m.press=()=>cast('atk4');m.release=()=>false;m.cancelInput=()=>false;}
  m.swrw=true;}
try{Object.defineProperty(MODS.sk2.cfg,'useRange',{configurable:true,get:()=>NV('sk2','len'),set(){}});}catch(_){}
/* U / B / N / R: the old modules listen on the window (bubble); this capture listener casts the new skill and hides that one key press from them */
const KEYS={u:'sk2',b:'atk3',n:'atk4',r:'atk5'};
addEventListener('keydown',e=>{try{const k=KEYS[(e.key||'').toLowerCase()];if(!k||e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;const m=MODS[k];if(!m||!m.test||!swordNow())return;
  const a=document.activeElement;if(a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName))return;if(typeof G!=='undefined'&&(G.win||G.state!=='play'))return;
  X.stats.keys++;cast(k);m.test=false;setTimeout(()=>{m.test=true;},0);}catch(er){X.err='key '+er.message;}},true);

/* ================= skill window text + TEST level table (SKLV) ================= */
const pc=v=>Math.round(v*1000)/10+'%';
function lvBlock(k){const v=lvOf(k),n=NUM[k],a=[];a.push('เลเวล '+v+' / 10 (ทดสอบ · ค่าใหม่ของ balance r1 รอ DeaRz ยืนยัน)');
  if(k==='sk2'){const m=NV(k,'mul');a.push('สเปก: 2 ฮิตต่อเป้า × '+pc(m)+' = '+pc(m*2)+' · คลื่น '+(v>=10?5:3)+' ทาง ยาว '+NV(k,'len')+' px · MP '+NV(k,'mp')+' · คูลดาวน์ '+n.cd+' วิ');
    a.push('✨ เลเวล 5: คลื่นกว้างขึ้น + ผลักแรงขึ้น'+(v>=5?' · ทำงานแล้ว':''));a.push('✨ เลเวล 10: คลื่นแยก 5 ทาง (−48/−24/0/+24/+48°)'+(v>=10?' · ทำงานแล้ว':''));}
  if(k==='atk3'){const m=NV(k,'mul');a.push('สเปก: 12 ฮิต × '+pc(m)+' = '+pc(m*12)+' · รัศมี '+NV(k,'r')+' px · MP '+NV(k,'mp')+' · คูลดาวน์ '+n.cd+' วิ');
    a.push('✨ เลเวล 5: วงใหญ่ขึ้น (ตามรัศมีในตาราง)');a.push('✨ เลเวล 10: ตอนจบดูดมอนเข้าหาแทนผลักออก'+(v>=10?' · ทำงานแล้ว':''));}
  if(k==='atk4'){const m=NV(k,'mul');a.push('สเปก: ดาบยักษ์ 3 เล่ม × '+pc(m)+' = '+pc(m*3)+' (ยืนกลางวงโดนครบ) · วงต่อดาบ '+NV(k,'aoe')+' px · ล็อกตัว 1.3 วิ · MP '+NV(k,'mp')+' · คูลดาวน์ '+n.cd+' วิ');
    a.push('✨ เลเวล 5: วงต่อดาบ 125 → 150 px');a.push('✨ เลเวล 10: สามเหลี่ยมทองระเบิดซ้ำ 1 ครั้ง '+pc(m*1.5)+(v>=10?' · ทำงานแล้ว':''));
    a.push('รอ DeaRz: รวม 600% (ค่าตอนนี้) หรือ 700%');}
  if(k==='atk5'){const m=NV(k,'mul');const dN=Math.max(1,Math.floor((NV(k,'dur')-(S4.W0-S4.ON))/S4.DT)+1);a.push('สเปก: '+dN+' ครั้ง ทุก 2 วิ × '+pc(m*7/dN)+' = '+pc(m*7)+' · วง '+(SBAL&&v>=5?Math.round(n.r*1.15):n.r)+' px · ทุกครั้ง'+(SBAL?' (ยืนในวง)':'')+'ฮีล '+pc(NV(k,'heal'))+' + DEF +'+pc(NV(k,'def'))+' 2 วิ · เขตแดนอยู่ '+NV(k,'dur')+' วิ · MP '+NV(k,'mp')+' · คูลดาวน์ '+n.cd+' วิ');
    a.push('✨ เลเวล 5: DEF นานขึ้น (ตามตาราง)');a.push('✨ เลเวล 10: เขตแดนและดาบตามตัวผู้เล่น'+(v>=10?' · ทำงานแล้ว':''));}
  return a.join('\n');}
const DESC={
  sk2:()=>'ง้างดาบ 0.24 วิ แล้วฟันปล่อยคลื่นไฟ 3 แฉกไปตามทิศที่เล็ง (เป้าที่ล็อก หรือทิศเมาส์/จอย) คลื่นผ่าพื้นเป็นรอยแยกร้อนที่ค่อยๆ เย็นลง\nคลื่นผ่านมอนโดน 1 ฮิต แล้วพื้นใต้มอนแตกระเบิดอีก 1 ฮิตใน 0.24 วิ · มอน 1 ตัวโดนได้ 1 คลื่นต่อการร่าย · คลื่นหยุดที่กำแพง',
  atk3:()=>'ย่อตัวง้างดาบ แล้วหมุนตัวฟันอยู่กับที่ 12 ฮิต (ทุก 0.11 วิ) มีวงไฟและสายไฟตามการหมุนรอบตัว\nมอนกะพริบขาวเบาๆ ทุก 2 ฮิต (ฮิตที่เหลือสั่น + ประกายไฟ) · ตอนจบวงไฟกระจายผลักมอนออก',
  atk4:()=>'ไม่ต้องชาร์จ ชูดาบ แสงพุ่งขึ้นฟ้าด้านหลัง วงเป้าหมายขึ้นบนพื้น (เป้าที่ล็อก หรือจุดที่เล็ง)\nดาบยักษ์ 3 เล่มพุ่งเฉียงจากเหนือหลังเรามาปักเป็นสามเหลี่ยม (0.72 / 0.94 / 1.16 วิ) แต่ละเล่มกระแทกเป็นวง แล้วแสงสามเหลี่ยมเชื่อม 3 เล่ม ดาบสลายเป็นประกายที่ 2.9 วิ',
  atk5:()=>'ยกมือเรียกดาบใหญ่ 1 เล่มตกลงมาลอยหน้าตัว\nเขตแดนรัศมี 210 px รอบดาบ เด้งคลื่นแสงทุก 2 วิ ทุกครั้งที่เด้ง: มอนในวงโดนดาเมจ, ฟื้น HP และเพิ่ม DEF นาน 2 วิ (มีโล่ทองรอบตัว + ตัวนับถอยหลัง) · หลังดาบลงเดินต่อได้'};
const DNOTE='\n\n(TEST: ท่าตัวละครตอนนี้ใช้เฟรมฟันดาบที่อนุมัติแล้วมาเรียงใหม่ชั่วคราว รอท่า 3D ของสกิลนี้)';
function wrapDescs(){const W=window.__WSK;if(!W||!W.lines||!W.lines.sword)return false;let n=0;
  for(const col of W.lines.sword.cols)for(const s of col.skills){const k=s.k;if(!NUM[k]||s._swrw)continue;s.desc=()=>lvBlock(k)+'\n\n'+DESC[k]()+DNOTE;s._swrw=1;s._slv=1;n++;}return n>0;}
function patchSKLV(){if(!SL||!SL.table)return;const T=SL.table;
  for(const k in NUM){const t=T[k];if(!t)continue;const n=NUM[k];
    t.lv5={sk2:'คลื่นกว้างขึ้น + ผลักแรงขึ้น',atk3:'วงใหญ่ขึ้น',atk4:'วงต่อดาบ 125 → 150 px',atk5:'DEF นานขึ้น'}[k];
    t.lv10={sk2:'คลื่นแยก 5 ทาง',atk3:'ดูดมอนเข้าหาตอนจบ',atk4:'สามเหลี่ยมทองระเบิดซ้ำ 50%',atk5:'ดาบตามตัวผู้เล่น'}[k];
    t.L.forEach((p,i)=>{p.mp=n.mp[i];p.cd=n.cd;delete p.dev;
      const h=k==='sk2'?2:k==='atk3'?12:k==='atk4'?3:7;p.spec={hits:h,per:n.mul[i],tot:+(n.mul[i]*h).toFixed(4),txt:'rework r1'};});}
  try{SL.apply();}catch(e){X.err='sklv '+e.message;}}
patchSKLV();
if(!wrapDescs()){let tries=0;const iv=setInterval(()=>{if(wrapDescs()||++tries>20)clearInterval(iv);},500);}
setTimeout(wrapDescs,1600);
/* aim circle (r56 phone drag / r64 PC mouse): the new Fang aims as a fan (3 or 5 lines, wave length) instead of 'pick a monster' —
   read by the one-line hook added to p276 rovSpec in this build */
X.aimSpec=()=>{try{if(!swordNow())return null;const lv=lvOf('sk2');return {t:'fan',rg:NV('sk2','len'),sp:lv>=10?96:48,n:lv>=10?5:3};}catch(_){return null;}};
X.ok=true;
}catch(e){X.err='init '+e.message;}
})();

