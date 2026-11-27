
/* ---- candidate_balance_v1_r42: p272 r4 hooks + p275 r2 bow motion VFX + looping buff auras (art fix FIX_r2_focus_stance, DeaRz 19 Oct 23:45; TEST only) ---- */
/* p275 r2 — r1 + looping buff auras that never stand still (art fix art/skills/bow/vfx_motion_r1/FIX_r2_focus_stance.md, DeaRz 23:45
   "2สกิลนี้ยังแข็งอยุ่"): every active aura keeps at least 2 motions running with offset phases; the charge starts on the cast frame.
   p275 r1 — Bow skills motion VFX pass (art handoff art/skills/bow/vfx_motion_r1/HANDOFF_bow_vfx_motion_r1.md; DeaRz 19 Oct 23:15
   "ตอนนี้สกิลมันดูแข็งไป ให้ดูสกิลคลื่นดาบของนักดาบเป็นตัวอย่าง"). Built like the r30 sword wave: code-drawn tapered streaks that sweep with
   the action, stay where they were drawn, then linger and fade. TEST only. Reads p272 r3 (window.BSK) and never changes damage, timing or hits.
   Layers (attack skills): A charge (streaks spiral into the arrowhead, motes pulled in, ground ring, gold glint), B release (5-streak
   bowstring crescent, ring pop, air puff, 3 px recoil), C flight (5-streak ribbon trail that stays and fades/widens), D impact (white flash,
   jade crescent shards, gold sparks, flat ground ring, wisps). Per skill extras, buff cast moment, passive accents: see the handoff.
   Palette jade #3fd6a0, mint #bff5e0, white, gold #ffd36a / #fff1b8. Code shapes only, particles capped at 40 live.
   Off: ?bowfx=off (whole pass) or ?bowfx=-A,-B,-C,-D,-X,-buff,-pas to drop single layers. Debug: window.BOWFX. */
(function(){'use strict';
let Q='';try{Q=location.search;}catch(_){}
const m=/[?&]bowfx=([^&]*)/.exec(Q),opt=m?decodeURIComponent(m[1]):'';if(opt==='off')return;
const R=window.BSK,BW=window.BOW,HD=window.__HERO3D;if(!R||!R.on||!R.tipAt||!BW||!HD)return;
const OFF=new Set(opt.split(',').filter(s=>s[0]==='-').map(s=>s.slice(1)));const on=k=>!OFF.has(k);
const X=window.BOWFX={ver:'p275-r2',parts:[],shapes:[],trails:[],ghosts:[],cap:40,err:null,stats:{peakParts:0,releases:0,impacts:0,trails:0,casts:0,crits:0,finish:0,drops:0}};
const clk=()=>typeof time==='number'?time:performance.now()/1000;
const CF=R.cfg,ACT=['pierce','rain','leap','fan','lantern'],BUF=['focus','wind','poison','weak','stance'];
const JADE='#3fd6a0',MINT='#bff5e0',WHITE='#ffffff',GOLD='#ffd36a',GOLD2='#fff1b8';
const BCOL={focus:GOLD,wind:MINT,poison:'#b77bff',weak:'#ff6f5e',stance:JADE};
const rgba=(h,a)=>{const n=parseInt(h.slice(1),16);return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')';};
const ease=u=>1-(1-u)*(1-u),cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const footY=()=>P.y+(HD.footY||0);
/* ---------------- particles (capped) and shapes ---------------- */
function part(o){X.parts.push(Object.assign({t0:clk(),dur:.4,vx:0,vy:0,sz:2,col:JADE},o));if(X.parts.length>X.cap)X.parts.splice(0,X.parts.length-X.cap);}
function shape(k,o){X.shapes.push(Object.assign({k,t0:clk(),dur:.35},o));if(X.shapes.length>60)X.shapes.shift();}
/* a tapered streak along a polyline pts [[x,y],...] tail->head, offset off along the normal, width wd, gradient cols tail->head */
function ribbon(pts,off,wd,cols,alpha,lighter,taper){if(pts.length<2||alpha<=0)return;const n=pts.length,out=[],inn=[];
  for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,q=i/(n-1);
    const hw=wd*.5*(taper==='mid'?Math.pow(Math.sin(Math.PI*Math.min(1,q*1.1)),.7):q<.8?Math.pow(q/.8,.6):1-(q-.8)/.2*.85)+.3;   // trails: thin tail, full body, pointed head
    out.push([pts[i][0]+nx*(off+hw),pts[i][1]+ny*(off+hw)]);inn.push([pts[i][0]+nx*(off-hw),pts[i][1]+ny*(off-hw)]);}
  const g=ctx.createLinearGradient(pts[0][0],pts[0][1],pts[n-1][0],pts[n-1][1]);g.addColorStop(0,rgba(cols[0],0));
  cols.forEach((c,i)=>g.addColorStop(.25+.75*i/(cols.length-1),c));
  ctx.globalCompositeOperation=lighter?'lighter':'source-over';ctx.globalAlpha=cl(alpha,0,1);ctx.fillStyle=g;ctx.beginPath();
  out.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));for(let i=inn.length-1;i>=0;i--)ctx.lineTo(inn[i][0],inn[i][1]);ctx.closePath();ctx.fill();}
/* 5 streaks like the sword wave: [offset, width, alpha, late start (0..1 of the length)] */
const STR5=[[0,1,1,0],[-.55,.55,.85,.08],[.55,.55,.85,.05],[-1,.28,.7,.16],[1,.28,.7,.12]],STR3=[[0,1,1,0],[-.6,.45,.7,.1],[.6,.45,.7,.08]];
function streaks(pts,W,fade,set,lit){const n=pts.length;if(n<2)return;
  ribbon(pts,0,W*2.2,[JADE,JADE],.18*fade,true,lit);
  for(const s of set){const i0=Math.floor(s[3]*(n-1)),sub=pts.slice(i0,Math.max(i0+2,n-Math.round(s[3]*.6*(n-1))));if(sub.length<2)continue;
    ribbon(sub,s[0]*W*.9,W*s[1],[JADE,JADE,MINT],s[2]*fade*.6,false,lit);ribbon(sub,s[0]*W*.9,W*s[1]*.5,[JADE,MINT,WHITE],s[2]*fade*.55,true,lit);}}
/* arc points: centre (cx,cy), radius r, y squash k, from angle a0 to a1, n points */
function arcPts(cx,cy,r,k,a0,a1,n){const o=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;o.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r*k]);}return o;}
/* ---------------- state watch (cast begin / release / leap landing / beam end / buffs / weak) ---------------- */
let lastId=0,lastRel=false,S0=null;const seenFx=new WeakSet(),seenDrop=new WeakSet(),zoneDone=new WeakSet();
const relT=S=>{const c=CF[S.k];return S.k==='lantern'?c.charge:c.rel;};
function onBegin(S){X.stats.casts++;S0={id:S.id,k:S.k,t0:S.t0,ang:S.ang,d:S.d,landed:false,ghostT:[.05,.12,.19],beamEnd:false};
  if(BUF.includes(S.k)&&on('buff')){const col=BCOL[S.k];shape('buffring',{x:P.x,y:footY(),col,dur:.35});
    for(let i=0;i<10;i++){const a=i/10*6.283;part({k:'rise',x:P.x+Math.cos(a)*R.heroW()*.45,y:footY()+Math.sin(a)*R.heroW()*.16,vy:-120-40*Math.random(),dur:.5,t0:clk()+i*.025,sz:2.6,col});}}
  if(S.k==='leap'&&on('X'))dust(P.x,footY(),1.1);}
function onRelease(S){X.stats.releases++;if(!on('B'))return;const tip=R.tipAt(S.d),a=S.ang,c=CF[S.k];
  shape('cres',{x:tip.x,y:tip.y,a,span:(S.k==='fan'?100:70)*Math.PI/180,r:R.heroW()*(S.k==='fan'?1.15:.95),dur:.12+.3});
  shape('ringpop',{x:tip.x+Math.cos(a)*10,y:tip.y+Math.sin(a)*10,dur:.2});
  shape('puff',{x:P.x-Math.cos(a)*R.heroW()*.5,y:footY()-R.heroH()*.35-Math.sin(a)*R.heroW()*.2,a:a+Math.PI,dur:.32});
  X.recoil={t0:clk(),a};
  if(S.k==='rain'&&on('X'))shape('upstreak',{x:tip.x,y:tip.y,dur:.55});}
function watch(){const S=R.state&&R.state();
  if(S&&S.id!==lastId){lastId=S.id;lastRel=false;onBegin(S);}
  if(S&&S.id===lastId){if(S.rel&&!lastRel){lastRel=true;if(ACT.includes(S.k))onRelease(S);}
    const t=clk()-S.t0;
    if(S.k==='leap'&&S0&&on('X')){while(S0.ghostT.length&&t>=S0.ghostT[0]){const i=3-S0.ghostT.length;S0.ghostT.shift();X.ghosts.push({x:P.x,y:P.y,t0:clk(),a0:[.5,.35,.2][i]});}
      if(!S0.landed&&t>=CF.leap.leapT){S0.landed=true;dust(P.x,footY(),.9);}}
    if(S.k==='lantern'&&S.rel&&S0&&on('X')){const tb=t-CF.lantern.charge,L=S.beamL||CF.lantern.len,tip=R.tipAt(S.d),ca=Math.cos(S.ang),sa=Math.sin(S.ang),Wd=CF.lantern.width;
      if(tb<CF.lantern.beam&&Math.random()<.7){const u=Math.random(),sd=Math.random()<.5?-1:1,px=tip.x+ca*L*u-sa*sd*Wd*.5,py=tip.y+sa*L*u+ca*sd*Wd*.5;
        part({k:'mote',x:px,y:py,vx:-sa*sd*40+ca*30,vy:ca*sd*40+sa*30-20,dur:.45,sz:2,col:Math.random()<.5?GOLD:MINT});}
      if(!S0.beamEnd&&tb>=CF.lantern.beam){S0.beamEnd=true;shape('pulse',{x:tip.x+ca*L,y:tip.y+sa*L,r:Wd*2.2,k:.8,col:GOLD,dur:.4});}}}
  else if(!S)lastRel=false;
  // finish / hawk accents: p272 pushes 'finish' / 'hawk' into BSK.fx when they happen
  for(const f of R.fx){if(seenFx.has(f))continue;seenFx.add(f);
    if(f.k==='finish'&&on('pas')){X.stats.finish++;shape('xslash',{x:f.x,y:f.y,w:f.w*.9,dur:.15+.12});flashScreen();}}
  // arrow rain: fall streaks, landing puffs + sparks, last-wave ring pulse
  for(const z of R.zones){if(on('X')){for(const d of z.drops){if(seenDrop.has(d))continue;if((clk()-d.t0)/.35>=1){seenDrop.add(d);X.stats.drops++;
        shape('dust',{x:d.x,y:d.y,w:14,dur:.35});part({k:'spark',x:d.x,y:d.y-4,vx:(Math.random()-.5)*90,vy:-60-60*Math.random(),dur:.3,sz:1.8,col:GOLD});}}
      if(z.wave>=z.n&&!zoneDone.has(z)){zoneDone.add(z);shape('pulse',{x:z.x,y:z.y,r:z.r*1.25,k:.55,col:JADE,dur:.45});}}}}
function dust(x,y,s){shape('dust',{x,y,w:22*s,dur:.4});for(let i=0;i<4;i++)part({k:'dust',x:x+(i-1.5)*8*s,y:y-2,vx:(i-1.5)*40*s,vy:-20-20*Math.random(),dur:.4,sz:4*s,col:'#c8a878'});}
let flashEl=null;function flashScreen(){try{if(!flashEl){flashEl=document.createElement('div');flashEl.style.cssText='position:fixed;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:9000';document.body.appendChild(flashEl);}
  X.flashT=clk();}catch(_){}}
/* ---------------- impacts (from the game's own hit call: bow skill contexts only) ---------------- */
const lastHit=new WeakMap();
function impact(e,a,o){if(!on('D'))return;X.stats.impacts++;o=o||{};const s=e.sz||16,x=e.x,y=e.y-s*.6,big=o.big||1;
  shape('hflash',{x,y,r:s*1.2*big,dur:.06});
  shape('gring',{x,y:e.y,w:s*2.6*big,dur:.35});
  shape('wisp',{x,y,a,w:s*1.8*big,dur:.35});
  const n=o.lite?3:5;for(let i=0;i<n;i++){const sp=a+(i-(n-1)/2)*.38+(Math.random()-.5)*.15,v=160+80*Math.random();part({k:'shard',x,y,vx:Math.cos(sp)*v,vy:Math.sin(sp)*v,a:sp,dur:.35,sz:6,col:JADE});}
  for(let i=0;i<(o.lite?2:4);i++){const sp=a+(Math.random()-.5)*1.8,v=90+120*Math.random();part({k:'spark',x,y,vx:Math.cos(sp)*v,vy:Math.sin(sp)*v-30,dur:.3,sz:1.8,col:GOLD});}}
{const _h=hitEnemy;hitEnemy=function(e,mm,o){const r=_h.apply(this,arguments);
  try{const ctx=o&&o.ctx;if(r>0&&e&&ctx&&ctx.bsk&&!o.tri){const id=ctx.id,sx=o.fx!=null?o.fx:P.x,sy=o.fy!=null?o.fy:P.y,a=Math.atan2(e.y-sy,e.x-sx);
    if(id==='bskRain'){}   // rain landings have their own dust + spark
    else if(id==='bskLantern'){const t=lastHit.get(e)||0;if(clk()-t>.3){lastHit.set(e,clk());impact(e,a,{lite:1});}}
    else impact(e,a,{big:id==='bskPierce'?1.15:1});}}catch(er){X.err='hit '+er.message;}
  return r;};}
{const _ad=applyDamage;applyDamage=function(e,d,crit,o){const r=_ad.apply(this,arguments);
  try{if(crit&&e&&on('pas')&&R.pon('hawk')&&P.weapon&&P.weapon.t==='bow'&&o&&o.ctx&&((o.ctx.kind==='basic'&&o.ctx.id==='basic:bow')||o.ctx.bsk)){X.stats.crits++;const s=e.sz||16,x=e.x,y=e.y-s*.8;
    shape('hflash',{x,y,r:s*1.2*1.4,dur:.08,gold:1});for(let i=0;i<6;i++){const a=-Math.PI/2+(i-2.5)*.5;part({k:'feather',x,y,vx:Math.cos(a)*110,vy:Math.sin(a)*110,a,dur:.6,sz:7,col:GOLD});}}}catch(er){X.err='crit '+er.message;}
  return r;};}
/* ---------------- trails (skill projectiles + basic arrows with the wind-ribbon passives) ---------------- */
const TR=new WeakMap();
function trailFor(obj,kind){let t=TR.get(obj);if(!t){t={kind,pts:[],end:null};TR.set(obj,t);X.trails.push(t);X.stats.trails++;if(X.trails.length>24)X.trails.shift();}return t;}
const TLEN={spear:260,fan:130,leap:140,ghost:120,basic:110};
function stepTrails(){const now=clk();if(!on('C'))return;
  for(const p of R.proj){const t=trailFor(p,p.kind);if(p.end==null){t.pts.push([p.x+p.vx,p.y+p.vy]);t.hw=p.hw;}else if(t.end==null)t.end=now;}
  if(P.weapon&&P.weapon.t==='bow'&&on('pas')&&(R.pon('swift')||R.pon('steady')))for(const ar of BW.arrows){const t=trailFor(ar,'basic');
    if(ar.end==null)t.pts.push([ar.x+(ar.ox||0),ar.y+(ar.oy||0)-(ar.h||0)]);else if(t.end==null)t.end=now;}
  for(const t of X.trails){if(t.end==null&&t.pts.length&&!t.seen)t.seen=now;   // arrows removed without an end mark
    let L=0;const max=TLEN[t.kind]||120;for(let i=t.pts.length-1;i>0;i--){L+=Math.hypot(t.pts[i][0]-t.pts[i-1][0],t.pts[i][1]-t.pts[i-1][1]);if(L>max){t.pts.splice(0,i-1);break;}}}
  X.trails=X.trails.filter(t=>t.end==null?t.pts.length<400:now-t.end<(t.kind==='spear'?.5:.3));}
function drawTrails(){const now=clk();
  for(const t of X.trails){if(t.pts.length<2)continue;const u=t.end==null?0:(now-t.end)/(t.kind==='spear'?.5:.3),f=1-u;if(f<=0)continue;
    const W=(t.kind==='spear'?11:t.kind==='basic'?4.5:t.kind==='ghost'?6:7)+6*u;
    ctx.save();
    if(t.kind==='ghost'){ribbon(t.pts,0,W*1.6,[JADE,JADE],.35*f,true);ribbon(t.pts,0,W,[JADE,MINT],.55*f,false);}
    else streaks(t.pts,W,f,t.kind==='basic'?STR3:STR5);
    if(t.kind==='spear'&&on('X')){   // wind-wake curls peeling off both sides
      for(const sd of [-1,1]){const pts=[];const n=t.pts.length;for(let i=0;i<n;i+=2){const a=t.pts[Math.max(0,i-1)],b=t.pts[Math.min(n-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,q=i/(n-1);
          const off=(t.hw||18)+10+18*(1-q)*(1+u)+6*Math.sin(q*9-now*6);pts.push([t.pts[i][0]-dy/l*off*sd,t.pts[i][1]+dx/l*off*sd*.6]);}
        ribbon(pts,0,3,[JADE,MINT],.55*f,true,'mid');}}
    ctx.restore();}}
/* ---------------- charge (layer A) ---------------- */
function drawCharge(){const S=R.state&&R.state();if(!S||!ACT.includes(S.k)||S.rel||S.tri||!on('A'))return;
  const now=clk(),t=now-S.t0,T=relT(S),u=cl(t/T,0,1),tip=R.tipAt(S.d),hw=R.heroW();
  ctx.save();
  // 3 jade wind streaks spiralling in to the nocked arrow
  for(let i=0;i<3;i++){const base=i*2.094+u*5.5,pts=[];for(let j=0;j<=14;j++){const q=j/14,ph=base-1.6*(1-q),rr=(10+(1-u)*hw*1.25)*(1.6-q*.95);pts.push([tip.x+Math.cos(ph)*rr,tip.y+Math.sin(ph)*rr*.8]);}
    const fa=.6+.4*Math.min(1,u*3);ribbon(pts,0,4.2,[JADE,MINT,WHITE],.55*fa,true);ribbon(pts,0,2,[JADE,MINT,WHITE],.75*fa,false);}
  if(t<.05&&!S._fx0){S._fx0=1;for(let i=0;i<6;i++)part({k:'pull',x:tip.x,y:tip.y,a:i*1.05,r0:hw*(.9+.4*Math.random()),dur:.35,sz:2.2,col:MINT});}   // r2: the charge starts on the cast frame
  if(Math.random()<.55)part({k:'pull',x:tip.x,y:tip.y,a:Math.random()*6.283,r0:hw*(.8+.5*Math.random()),dur:.35,sz:2.2,col:Math.random()<.3?GOLD:MINT});
  if(S.k==='lantern'){   // 2 gold rings shrinking into the bow + 6 lanterns orbiting faster and faster
    ctx.globalCompositeOperation='lighter';for(let k=0;k<2;k++){const v=((u*1.6+k*.5)%1),r=hw*1.6*(1-v)+3;ctx.globalAlpha=(1-v)*.85*Math.min(1,u*4);ctx.strokeStyle=GOLD;ctx.lineWidth=2.2;ctx.beginPath();ctx.ellipse(tip.x,tip.y,r,r*.8,0,0,6.283);ctx.stroke();}
    const ang=(t*t)*7.5;for(let i=0;i<6;i++){const a=ang+i*1.047,x=tip.x+Math.cos(a)*hw*.95,y=tip.y+Math.sin(a)*hw*.7;
      const g=ctx.createRadialGradient(x,y,0,x,y,7);g.addColorStop(0,rgba(GOLD2,.95));g.addColorStop(.5,rgba(GOLD,.6));g.addColorStop(1,rgba(GOLD,0));ctx.globalAlpha=Math.min(1,u*3);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,7,0,6.283);ctx.fill();
      ctx.fillStyle=GOLD2;ctx.globalAlpha=Math.min(1,u*3);ctx.fillRect(x-2,y-3,4,6);}}
  // gold glint star at the arrowhead in the last 0.1 s
  const left=T-t;if(left<.1){const g=1-left/.1,r=6+10*g;ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.95;ctx.fillStyle=GOLD2;ctx.beginPath();
    for(let i=0;i<8;i++){const a=i*Math.PI/4+now*2,rr=i%2?r*.22:r;ctx.lineTo(tip.x+Math.cos(a)*rr,tip.y+Math.sin(a)*rr);}ctx.closePath();ctx.fill();}
  ctx.restore();}
function drawChargeGround(){const S=R.state&&R.state();if(!S||!ACT.includes(S.k)||S.tri||!on('A'))return;const t=clk()-S.t0,T=relT(S),u=cl(t/T,0,1),fade=S.rel?Math.max(0,1-(t-T)/.25):1;if(fade<=0)return;
  const hw=R.heroW(),x=P.x,y=footY(),rx=hw*(.75+.15*u),ry=rx*.36;
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(.25+.6*u)*fade;ctx.strokeStyle=JADE;ctx.lineWidth=2.5+2*u;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,6.283);ctx.stroke();
  ctx.globalAlpha=(.15+.35*u)*fade;ctx.fillStyle=JADE;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,6.283);ctx.fill();ctx.restore();}
/* ---------------- shapes and particles ---------------- */
function drawShape(s,ground){const now=clk(),u=(now-s.t0)/s.dur;if(u<0||u>1)return;const G_=s.k==='gring'||s.k==='dust'||s.k==='buffring'||s.k==='pulse';if(G_!==ground)return;
  ctx.save();
  switch(s.k){
  case 'cres':{const sw=.12/s.dur,h=Math.min(1,u/sw),f=u<sw?1:1-(u-sw)/(1-sw),drift=(1-f)*8,cx=s.x-Math.cos(s.a)*s.r*.55+Math.cos(s.a)*drift,cy=s.y-Math.sin(s.a)*s.r*.55+Math.sin(s.a)*drift;
    const a0=s.a-s.span/2,pts=arcPts(cx,cy,s.r,.85,a0,a0+s.span*h,18);streaks(pts,7*(1+(1-f)*.3),f,STR5,'mid');break;}
  case 'ringpop':{const r=4+20*ease(u);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=1-u;ctx.strokeStyle=WHITE;ctx.lineWidth=2.5*(1-u)+.5;ctx.beginPath();ctx.ellipse(s.x,s.y,r,r*.8,0,0,6.283);ctx.stroke();break;}
  case 'puff':{ctx.globalAlpha=(1-u)*.5;for(let i=0;i<3;i++){const d=8+18*u+i*5,x=s.x+Math.cos(s.a)*d+(i-1)*4,y=s.y+Math.sin(s.a)*d*.6-i*3;ctx.fillStyle=i===1?rgba(MINT,.8):rgba(WHITE,.7);ctx.beginPath();ctx.arc(x,y,4+8*u,0,6.283);ctx.fill();}break;}
  case 'upstreak':{const h=Math.min(1,u/.35),f=u<.35?1:1-(u-.35)/.65,top=s.y-900*ease(h),pts=[];for(let i=0;i<=12;i++){const q=i/12;pts.push([s.x+Math.sin(q*3)*2,s.y+(top-s.y)*q]);}
    streaks(pts.reverse().reverse(),6,f,STR5);break;}
  case 'hflash':{const r=s.r*(.6+.6*u);const g=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,r);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.5,s.gold?rgba(GOLD2,.8):'rgba(255,255,255,.7)');g.addColorStop(1,'rgba(255,255,255,0)');
    ctx.globalCompositeOperation='lighter';ctx.globalAlpha=1-u;ctx.fillStyle=g;ctx.beginPath();ctx.arc(s.x,s.y,r,0,6.283);ctx.fill();break;}
  case 'wisp':{ctx.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const a=s.a+(i-1)*.7,st=s.w*(.3+.6*u),pts=arcPts(s.x+Math.cos(a)*st*.4,s.y+Math.sin(a)*st*.4,st,.7,a-.9,a+.4,10);ribbon(pts,0,3,[JADE,MINT],(1-u)*.6,true,'mid');}break;}
  case 'gring':{const w=s.w*(.6+.8*ease(u));ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(1-u)*.8;ctx.strokeStyle=JADE;ctx.lineWidth=3*(1-u)+1;ctx.beginPath();ctx.ellipse(s.x,s.y,w*.5,w*.5*.55,0,0,6.283);ctx.stroke();
    ctx.globalAlpha=(1-u)*.6;ctx.strokeStyle=GOLD;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(s.x,s.y,w*.38,w*.38*.55,0,0,6.283);ctx.stroke();break;}
  case 'dust':{const w=s.w*(1+u);ctx.globalAlpha=(1-u)*.5;ctx.fillStyle='rgba(190,160,115,.85)';for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(s.x+(i-1)*w*.5,s.y-1-u*4,w*.45,w*.45*.55,0,0,6.283);ctx.fill();}break;}
  case 'buffring':{const hw=R.heroW(),r=hw*(.3+1.1*ease(u));ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(1-u)*.9;ctx.strokeStyle=s.col;ctx.lineWidth=3.5*(1-u)+1;ctx.beginPath();ctx.ellipse(P.x,footY(),r,r*.36,0,0,6.283);ctx.stroke();
    ctx.globalAlpha=(1-u)*.3;ctx.fillStyle=s.col;ctx.beginPath();ctx.ellipse(P.x,footY(),r,r*.36,0,0,6.283);ctx.fill();break;}
  case 'pulse':{const r=s.r*(1+.25*ease(u));ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(1-u)*.85;ctx.strokeStyle=s.col;ctx.lineWidth=4*(1-u)+1;ctx.beginPath();ctx.ellipse(s.x,s.y,r,r*s.k,0,0,6.283);ctx.stroke();break;}
  case 'xslash':{const sw=.15/s.dur,h=Math.min(1,u/sw),f=u<sw?1:1-(u-sw)/(1-sw),w=s.w*.55;ctx.globalCompositeOperation='lighter';
    for(const [dx,dy,del] of [[1,1,0],[-1,1,.35]]){const hh=cl((h-del)/(1-del),0,1);if(hh<=0)continue;const pts=[];for(let i=0;i<=8;i++){const q=i/8*hh;pts.push([s.x-dx*w+dx*2*w*q,s.y-dy*w*.8+dy*1.6*w*.8*q]);}
      ribbon(pts,0,7,[GOLD,GOLD2,WHITE],f,true,'mid');ribbon(pts,0,3,[GOLD,GOLD2,WHITE],f,false,'mid');}break;}
  }
  ctx.restore();}
function stepParts(dt){const now=clk();for(const p of X.parts){if(now<p.t0)continue;
    if(p.k==='pull'){continue;}
    p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.k==='spark'||p.k==='dust')p.vy+=260*dt;if(p.k==='feather'){p.vx*=.96;p.vy=p.vy*.94+40*dt*10;}if(p.k==='shard'){p.vx*=.9;p.vy*=.9;}}
  X.parts=X.parts.filter(p=>now-p.t0<p.dur);const live=X.parts.filter(p=>now>=p.t0).length;if(live>X.stats.peakParts)X.stats.peakParts=live;}
function drawParts_(){const now=clk();ctx.save();
  for(const p of X.parts){const u=(now-p.t0)/p.dur;if(u<0||u>1)continue;ctx.globalCompositeOperation=p.k==='dust'?'source-over':'lighter';ctx.globalAlpha=(1-u)*(p.k==='dust'?.5:1);ctx.fillStyle=p.col;
    if(p.k==='pull'){const S=R.state&&R.state();const tip=S&&!S.rel?R.tipAt(S.d):{x:p.x,y:p.y},r=p.r0*(1-ease(u)),x=tip.x+Math.cos(p.a+u*2)*r,y=tip.y+Math.sin(p.a+u*2)*r*.8;ctx.globalAlpha=Math.min(1,u*4)*(1-u*.3);ctx.beginPath();ctx.arc(x,y,p.sz,0,6.283);ctx.fill();continue;}
    if(p.k==='shard'){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a);ctx.strokeStyle=u<.3?MINT:JADE;ctx.lineWidth=2.4*(1-u)+.6;ctx.beginPath();ctx.arc(-p.sz,0,p.sz,-.9,.9);ctx.stroke();ctx.restore();continue;}
    if(p.k==='feather'){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a+u*3);ctx.fillStyle=GOLD2;ctx.beginPath();ctx.ellipse(0,0,p.sz,p.sz*.32,0,0,6.283);ctx.fill();ctx.strokeStyle=GOLD;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-p.sz,0);ctx.lineTo(p.sz,0);ctx.stroke();ctx.restore();continue;}
    ctx.beginPath();ctx.arc(p.x,p.y,p.sz*(p.k==='rise'?1:(1-u*.5)),0,6.283);ctx.fill();}
  ctx.restore();}
/* ---------------- beam (p272 r3 hooks): ramp 0 -> full in 0.12 s, wobble +-2 px, thin out to nothing over 0.2 s ---------------- */
if(on('X'))R.beamFx={tail:.2,w:t=>{const B=CF.lantern.beam;if(t<.12)return ease(t/.12);if(t>B)return Math.max(0,1-(t-B)/.2);return 1;},wob:now=>Math.sin(now*31)*2};
/* weak spot mark drops in from above with a small scale bounce 1.3 -> 1.0 */
if(on('buff'))R.weakDrop=dt=>{if(dt>=.4)return null;const k=Math.min(1,dt/.2);return [-70*(1-k)*(1-k),dt<.2?1.3:1.3-.3*Math.min(1,(dt-.2)/.2)];};

/* ---------------- r2: looping buff auras (p272 r4 R.aura / R.weakFx hooks). Approved sprites only move / scale uniformly; the moving
   marks, light bands, pulses and motes are code-drawn on top. Back half (behind the hero) / front half split as before. ---------------- */
const TAU=6.283;
const ageOf=k=>{const b=R.buffs&&R.buffs[k];return b?clk()-b.t0:0;};
function halfEll(cx,cy,rx,ry,front,col,lw,al,add){ctx.save();if(add)ctx.globalCompositeOperation='lighter';ctx.globalAlpha=cl(al,0,1);ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,front?0:Math.PI,front?Math.PI:TAU);ctx.stroke();ctx.restore();}
function marks(cx,cy,rx,ry,base,n,front,al,d,col){ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=col||GOLD;
  for(let i=0;i<n;i++){const th=base+i*TAU/n,sn=Math.sin(th);if((sn>0)!==front)continue;const x=cx+Math.cos(th)*rx,y=cy+sn*ry,dd=d*(.8+.3*Math.max(0,sn));ctx.globalAlpha=cl(al*(.65+.35*sn*(front?1:-1)),0,1);
    ctx.beginPath();ctx.moveTo(x,y-dd);ctx.lineTo(x+dd*.55,y);ctx.lineTo(x,y+dd);ctx.lineTo(x-dd*.55,y);ctx.closePath();ctx.fill();}ctx.restore();}
function runLight(cx,cy,rx,ry,th0,len,front,col,lw,al){const pts=[];for(let i=0;i<=16;i++){const th=th0+len*i/16;if((Math.sin(th)>0)!==front){if(pts.length>1)break;pts.length=0;continue;}pts.push([cx+Math.cos(th)*rx,cy+Math.sin(th)*ry]);}
  if(pts.length>1){ctx.save();ribbon(pts,0,lw,[col,MINT,WHITE],al,true,'mid');ctx.restore();}}
function mote(x,y,r,col,al){ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(x,y,0,x,y,r*2.2);g.addColorStop(0,rgba(WHITE,.9));g.addColorStop(.35,rgba(col,.8));g.addColorStop(1,rgba(col,0));ctx.globalAlpha=cl(al,0,1);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*2.2,0,TAU);ctx.fill();ctx.restore();}
const AURA={
 focus(front,x,fy,a){const now=clk(),t=ageOf('focus'),hw=R.heroW(),hh=R.heroH(),br=1+.04*Math.sin(now*Math.PI),al=a*(.875+.125*Math.sin(now*Math.PI+.7));
   const bob1=4*Math.sin(now*TAU/1.6),bob2=4*Math.sin(now*TAU/1.6+Math.PI),w1=hw*1.9/.79*br,cy1=fy-hh*.45+bob1,y0=front?.533:0,y1=front?1:.533;
   R.spr('focus',x,cy1,w1,{ay:.533,y0,y1,alpha:al});R.spr('focus',x,cy1,w1,{ay:.533,y0,y1,alpha:al*.3,add:1});
   const rx1=w1*200/512,ry1=w1*72/512,c1=cy1-w1*.017;
   marks(x,c1,rx1,ry1,now*TAU/2.4,4,front,al,6.5);runLight(x,c1,rx1,ry1,now*TAU/2.4+.4,1.1,front,JADE,4,al*.8);          // waist ring: clockwise
   const rx2=rx1*.78,ry2=rx2*.36,cy2=fy+bob2*.5;                                                                      // feet ring: counter-clockwise
   halfEll(x,cy2,rx2*br,ry2*br,front,JADE,3.2,al*.7,true);halfEll(x,cy2,rx2*br,ry2*br,front,MINT,1.3,al*.9,true);
   marks(x,cy2,rx2*br,ry2*br,-now*TAU/2.4,4,front,al,5);runLight(x,cy2,rx2*br,ry2*br,-now*TAU/2.4+2,-1.1,front,JADE,3.5,al*.8);
   const pp=(t%1.2)/1.2,py=fy-pp*hh*1.25,pr=rx2*(1+.3*pp);halfEll(x,py,pr,pr*.36,front,MINT,2.2*(1-pp)+.6,al*(1-pp)*.8,true);   // pulse ring rising every 1.2 s
   for(let i=0;i<7;i++){const q=((t*.45+i/7)%1),th=q*TAU*1.4+i*.9,sn=Math.sin(th);if((sn>0)!==front)continue;mote(x+Math.cos(th)*hw*.55*(1-.3*q),fy-q*hh*1.15+sn*hw*.12,1.6,JADE,al*Math.sin(Math.PI*q));}
   return true;},
 stance(front,x,fy,a){const now=clk(),t=ageOf('stance'),hh=R.heroH(),w=hh*1.45/.503,k=w/512,L=x-w*.5,T=fy-w*.741,YB=338,hitU=X.stanceHit!=null?(now-X.stanceHit)/.35:9;
   const flick=i=>.85+.15*Math.sin(now*7.3+i*2.1),hitB=hitU<1?1-hitU:0,al=a*(.92+.08*Math.sin(now*2));
   if(front){R.spr('stance',x,fy,w,{ay:.741,y0:.741,y1:1,alpha:al});if(hitB)R.spr('stance',x,fy,w,{ay:.741,y0:.741,y1:1,alpha:hitB*.6,add:1});}
   else{
     R.spr('stance',x,fy,w,{ay:.741,y0:YB/512,y1:.741,alpha:al});if(hitB)R.spr('stance',x,fy,w,{ay:.741,y0:YB/512,y1:.741,alpha:hitB*.6,add:1});
     const G=[[50,102,74],[122,204,176],[296,396,340],[410,472,440]];let x0=0;
     for(let i=0;i<=G.length;i++){const g=G[i],gx0=g?g[0]:512;   // sparkles between the pillar groups: full height, no growth
       if(gx0>x0){ctx.save();ctx.beginPath();ctx.rect(L+x0*k,T,(gx0-x0)*k,YB*k);ctx.clip();R.spr('stance',x,fy,w,{ay:.741,y0:0,y1:YB/512,alpha:al*Math.min(1,t/.3)});ctx.restore();}
       if(!g)break;x0=g[1];
       const grow=ease(cl((t-.05*i)/.25,0,1)),hf=grow*(.92+.08*Math.sin(now*TAU/1.8+i*1.4)),top=T+(YB-hf*YB)*k;   // pillars grow up at cast, then breathe +-8 % height
       ctx.save();ctx.beginPath();ctx.rect(L+g[0]*k,top,(g[1]-g[0])*k,T+YB*k-top);ctx.clip();
       R.spr('stance',x,fy,w,{ay:.741,y0:0,y1:YB/512,alpha:al*flick(i)});if(hitB)R.spr('stance',x,fy,w,{ay:.741,y0:0,y1:YB/512,alpha:hitB*.7,add:1});ctx.restore();
       if(grow>=1){const p=((now/1.0)+i*.27)%1,by=T+YB*k-p*hf*YB*k,bx=L+g[2]*k,bh=36*k;   // light band running up each pillar
         ctx.save();ctx.globalCompositeOperation='lighter';const gr=ctx.createLinearGradient(bx,by-bh,bx,by+bh);gr.addColorStop(0,rgba(MINT,0));gr.addColorStop(.5,rgba(WHITE,.95));gr.addColorStop(1,rgba(MINT,0));
         ctx.globalAlpha=al*Math.sin(Math.PI*p);ctx.fillStyle=gr;ctx.fillRect(bx-6*k,by-bh,12*k,bh*2);ctx.restore();}}}
   const rx=210*k,ry=53*k;
   marks(x,fy,rx,ry,now*TAU/6,6,front,al,7);runLight(x,fy,rx,ry,now*TAU/6+.5,.8,front,JADE,4,al*.7);                   // ground ring turns once per 6 s
   const pp=(t%1.5)/1.5,pr=1+.35*ease(pp);halfEll(x,fy,rx*pr,ry*pr,front,JADE,3*(1-pp)+.6,al*(1-pp)*.85,true);           // ground pulse every 1.5 s
   if(hitB)halfEll(x,fy,rx*(1+.5*(1-hitB)),ry*(1+.5*(1-hitB)),front,WHITE,3,hitB,true);                                  // hit ripple
   if(front)for(let i=0;i<8;i++){const q=((t*.38+i/8)%1),px=x+Math.sin(i*2.13)*rx*.75+Math.sin(now*2+i)*4,py=fy+Math.cos(i*1.7)*ry*.5-q*hh*1.3,aa=al*Math.sin(Math.PI*q);
     if(i%2){mote(px,py,1.5,GOLD,aa);}else{ctx.save();ctx.translate(px,py);ctx.rotate(now*3+i);ctx.globalAlpha=cl(aa,0,1);ctx.fillStyle=JADE;ctx.beginPath();ctx.ellipse(0,0,4,1.6,0,0,TAU);ctx.fill();ctx.restore();}}
   return true;},
 wind(front,x,fy,a){const now=clk(),t=ageOf('wind'),hw=R.heroW(),hh=R.heroH(),br=1+.03*Math.sin(now*TAU/1.4),bob=2*Math.sin(now*TAU/1.1),w=hw*1.5/.9*br,y0=front?.733:0,y1=front?1:.733;
   R.spr('wind',x,fy+bob,w,{ay:.733,y0,y1,alpha:a*(.85+.15*Math.sin(now*TAU/1.4+1)),a:0});
   const rx=w*230/512,ry=rx*.4;for(let i=0;i<2;i++)runLight(x,fy+bob,rx*(.85+.1*i),ry*(.85+.1*i),now*TAU/1.2+i*Math.PI,1.3,front,MINT,3.2,a*.8);
   for(let i=0;i<5;i++){const q=((t*.6+i/5)%1),th=q*TAU*1.2+i*1.3,sn=Math.sin(th);if((sn>0)!==front)continue;const px=x+Math.cos(th)*rx*(.9-.4*q),py=fy-q*hh*.9+sn*ry*.5;
     ctx.save();ctx.translate(px,py);ctx.rotate(th+now*2);ctx.globalAlpha=cl(a*Math.sin(Math.PI*q),0,1);ctx.fillStyle=i%2?MINT:JADE;ctx.beginPath();ctx.ellipse(0,0,4.5,1.8,0,0,TAU);ctx.fill();ctx.restore();}
   return true;},
 poison(front,x,fy,a){if(!front)return true;const now=clk(),t=ageOf('poison'),hw=R.heroW(),hh=R.heroH(),f=P.face||0,sw=3*Math.sin(now*TAU/2.2),bob=3*Math.sin(now*TAU/1.7+.8),br=1+.04*Math.sin(now*TAU/1.3);
   const bx=x-Math.cos(f)*hw*.22+sw,by=fy-hh*.62+bob;R.spr('poison',bx,by,hw*1.0*br,{ay:.62,alpha:a*(.8+.2*Math.sin(now*4))});
   for(let i=0;i<5;i++){const q=((t*.55+i/5)%1);mote(bx+Math.sin(i*2.4+q*4)*hw*.25,by+hw*.2-q*hh*.6,1.4+q,'#b77bff',a*Math.sin(Math.PI*q));}
   return true;}};
if(on('buff')){R.aura=(k,front,x,fy,a)=>{try{const f=AURA[k];return f?f(front,x,fy,a):false;}catch(e){X.err='aura '+e.message;return false;}};
  R.weakFx=(e,cy,sz,al,now)=>{try{const bob=3*Math.sin(now*TAU/1.4);R.spr('weak',e.x,cy+bob,sz*(1+.04*Math.sin(now*3)),{alpha:al});
    for(let i=0;i<2;i++){const th=now*TAU/1.6+i*Math.PI;mote(e.x+Math.cos(th)*sz*.42,cy+bob+Math.sin(th)*sz*.16,1.6,'#ff6f5e',al);}return true;}catch(er){X.err='weak '+er.message;return false;}};
  if(typeof hurtPlayer==='function'){const o=hurtPlayer;hurtPlayer=function(){const hp0=P.hp;const r=o.apply(this,arguments);try{if(R.buffs&&R.buffs.stance&&P.hp<hp0)X.stanceHit=clk();}catch(_){}return r;};}}
/* ---------------- hooks into the game loop ---------------- */
{const o=update;update=function(dt){const r=o.apply(this,arguments);try{if(G.state==='play'){watch();stepTrails();stepParts(+dt||0);}
  if(flashEl){const a=X.flashT!=null?clk()-X.flashT:1;flashEl.style.opacity=a<.08?'.08':'0';}}catch(e){X.err='tick '+e.message;}return r;};}
{const o=drawParts;drawParts=function(){try{drawChargeGround();for(const s of X.shapes)drawShape(s,true);}catch(e){X.err='draw0 '+e.message;}
  const r=o.apply(this,arguments);
  try{drawTrails();for(const s of X.shapes)drawShape(s,false);drawCharge();drawParts_();const now=clk();X.shapes=X.shapes.filter(s=>now-s.t0<s.dur);}catch(e){X.err='draw1 '+e.message;}
  return r;};}
{const o=drawPlayerSprite;drawPlayerSprite=function(x,y,bob,fa){
  try{const now=clk();   // leap after-images (jade, behind the hero), then the 3 px recoil
    if(X.ghosts.length){const dx=x-P.x,dy=y-P.y;for(const g of X.ghosts){const u=(now-g.t0)/.25;if(u<0||u>1)continue;ctx.save();ctx.globalAlpha=g.a0*(1-u);try{ctx.filter='sepia(1) hue-rotate(105deg) saturate(3.2) brightness(1.25)';}catch(_){}
        o.call(this,g.x+dx,g.y+dy,bob,fa);ctx.restore();}X.ghosts=X.ghosts.filter(g=>now-g.t0<.25);}
    if(X.recoil){const u=(now-X.recoil.t0)/.15;if(u>=0&&u<1){const k=3*(1-ease(u));x-=Math.cos(X.recoil.a)*k;y-=Math.sin(X.recoil.a)*k*.6;}}}catch(e){X.err='hero '+e.message;}
  return o.call(this,x,y,bob,fa);};}
if(typeof loadZone==='function'){const o=loadZone;loadZone=function(){try{X.parts.length=0;X.shapes.length=0;X.trails.length=0;X.ghosts.length=0;}catch(_){}return o.apply(this,arguments);};}
})();

