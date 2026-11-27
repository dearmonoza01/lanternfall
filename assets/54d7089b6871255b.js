
/* ---- p260 r1: Cave 1 TEST map (DeaRz 18 Oct 09:49 "เริ่มได้เลย"; brief art/cave1/handoff-code-cave1-r1.md, layout cave1-layout-v2.png, plan cave1-plan-v1.md,
   population balance/approved/BALANCE_cave1_population_v2.md). A TEST sub-map of the Map 4 TEST session (p254 r39 hooks: M4.sub, M4.load, M4.r28.pause/resume):
   - entered by walking into the Map 4 tier-2 cave mouth, left through the exit arch at the south edge of the entry hall (back in front of the cave mouth);
     the save stays untouched the whole time (Map 4's snapshot + storage hold cover the cave too), the TEST button "ออกจากแมพ 4 ทดสอบ" still leaves both.
   - ground: one image baked from the approved art (tools/cave1, Python): floor tiles c1-floor-a/b (512 world px, b in soft patches over a), edge shade,
     contact / cast shadows toward the lower right (light from the upper left), crystal light pools, pool c5 (scenery), walls c2-wall-dark (8 pieces)
     along the floor edge by its direction (north: straight a/b, north-west / north-east turns: inner corners, west / east: side pieces, south: straight),
     clipped so they never cover the floor more than 10 px in. Every piece is the approved image at one uniform scale; nothing stretched or flipped.
   - live sprites (y-sorted): stalagmites + rock piles (c3), crystals (c4, code glow), exit arch (c5, code daylight); tall ones turn see-through
     while the hero stands behind them.
   - collision: rock next to the floor, stalagmites / rocks / crystals at the base, the pool, the arch sides (the doorway stays open).
   - monsters: zone C 5 Moss Turtle Lv13-15, A 7 Stone Boar Lv14-16, B 4 Elder Ruin Warden Lv16-18 (homes >= 300 px apart, >= 40 px from the pool,
     respawn x1.5); member 70-110 s, whole group 120-170 s; never within 200 px of the entry hall, never inside it (a fight resets when the hero
     leaves the zone), no respawn within 360 px of the hero, pulls inside the zone within 170 px. Same reset / walk-home rules as Map 4 (r28).
   - atmosphere: darker screen edges, blue crystal glow, light dust motes (engine 'mote' ambience). No grass system. ---- */
(function(){'use strict';
const M4=window.__M4T,A=window.__C1_ART,D=window.__C1_DATA;if(!M4||!M4.sub||!A||!D||typeof ZONES==='undefined')return;
const ID='w22_cave1_test',MW=D.W,MH=D.H,RW='#17120f';
M4.sub.add(ID);
const C1={on:false,stats:{enter:0,exit:0,saveBlocked:0},art:{},id:ID,data:D};M4.cave1=C1;
const img=k=>{const a=A[k];if(!a)return null;if(!C1.art[k]){const i=new Image();i.decoding='async';i.src=a.src;C1.art[k]=i;}const i=C1.art[k];return i.complete&&i.naturalWidth?i:null;};
for(const k in A)img(k);   // start decoding at load
const onF=(x,y)=>{const R=D.mask[Math.floor(y/2)];if(!R||x<0)return false;const c=Math.floor(x/2);for(let i=0;i<R.length;i+=2)if(c>=R[i]&&c<R[i+1])return true;return false;};
const now=()=>(typeof time==='number'?time:0);
/* ---------- zone ---------- */
ZONES[ID]={n:'Cave 1 (TEST)',th:'ถ้ำ 1 · แมพทดสอบ',sub:'ถ้ำใต้แมพ 4 · TEST · ไม่บันทึกเซฟ',safe:0,fullSafe:0,w:MW,h:MH,seed:4501,ground:['#3b302a','#2e2520','#463a32','#1d1714'],acc:'#cfe6ff',amb:'mote',mobs:[],density:0,areas:[],m4test:1};
try{if(typeof EDGE_THEME!=='undefined')EDGE_THEME[ID]=[];}catch(e){}
/* ---------- props ---------- */
const P_=(o)=>Object.assign({cat:'m4test',w:2,h:2,ax:1,ay:1,liveOnly:1,nofade:1,draw(){}},o);
function behind(p,a,k){if(typeof P==='undefined'||!P)return 1;const hw=a.gw/2,hT=a.gh/.866;return (P.y<p.y-4&&P.y>p.y-hT-12&&Math.abs(P.x-p.x)<hw)?k:1;}
function spr(c,k,p,al){const a=A[k],im=img(k);if(!im)return;c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';if(al<1)c.globalAlpha*=al;c.drawImage(im,p.x-a.gw/2,p.y-a.gh,a.gw,a.gh);c.restore();}
function glowAt(c,x,y,r,col,a){c.save();c.globalCompositeOperation='lighter';const g=c.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(.5,`rgba(${col},${a*.35})`);g.addColorStop(1,`rgba(${col},0)`);c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,6.2832);c.fill();c.restore();}
let OUTP=null;
function liveOutside(c){const t=c.getTransform().inverse(),cw=c.canvas.width,ch=c.canvas.height,ps=[[0,0],[cw,0],[0,ch],[cw,ch]].map(([u,v])=>[t.a*u+t.c*v+t.e,t.b*u+t.d*v+t.f]);
  const x0=Math.min(...ps.map(q=>q[0]))-40,x1=Math.max(...ps.map(q=>q[0]))+40,y0=Math.min(...ps.map(q=>q[1]))-40,y1=Math.max(...ps.map(q=>q[1]))+40;
  if(x0>=0&&y0>=0&&x1<=MW&&y1<=MH)return;c.save();c.beginPath();c.rect(x0,y0,x1-x0,y1-y0);c.rect(0,0,MW,MH);c.clip('evenodd');c.fillStyle=RW;c.fillRect(x0,y0,x1-x0,y1-y0);c.restore();}   // rock colour outside the map (the camera sees a little past the edge)
function register(){
  PROP_DEFS.c1Out=P_({n:'Cave 1: rock outside the map',layer:'ground',w:MW+6000,h:MH+6000,ax:(MW+6000)/2,ay:(MH+6000)/2,live:liveOutside});
  for(const k of['stal-l','stal-m','stal-s','rocks-l','rocks-m','rocks-s']){const a=A[k];PROP_DEFS['c1S_'+k]=P_({n:'Cave 1 '+k,w:a.gw,h:a.gh,ax:a.gw/2,ay:a.gh,live:(c,p)=>spr(c,k,p,k==='stal-l'||k==='stal-m'?behind(p,a,.5):1)});}
  for(const k of['cry-l','cry-m','cry-s']){const a=A[k];PROP_DEFS['c1C_'+k]=P_({n:'Cave 1 crystal '+k+' (code glow)',w:a.gw*2,h:a.gh*1.6,ax:a.gw,ay:a.gh*1.3,live:(c,p)=>{
    spr(c,k,p,k==='cry-l'?behind(p,a,.55):1);const t=now(),f=.8+.2*Math.sin(t*1.3+p.x*.01);
    glowAt(c,p.x,p.y-a.gh*.5/.866,a.gw*1.05,'90,200,255',.20*f);glowAt(c,p.x+a.gw*.05,p.y-a.gh*.72/.866,a.gw*.35,'200,245,255',.16*f);}});}
  {const a=A.exit;PROP_DEFS.c1Exit=P_({n:'Cave 1 exit arch (code daylight)',w:a.gw,h:a.gh,ax:a.gw/2,ay:a.gh,live:(c,p)=>{const al=behind(p,a,.45);spr(c,'exit',p,al);
    const t=now();glowAt(c,D.exit.dx,p.y-a.gh*.62/.866,64,'225,240,205',.20+.03*Math.sin(t*.9));}});}
  PROP_DEFS.c1Zones=P_({n:'Cave 1 zone outlines (TEST)',layer:'ground',w:MW+400,h:MH+400,ax:(MW+400)/2,ay:(MH+400)/2,live:liveZones});
  PROP_DEFS.c1Solid=P_({n:'Cave 1 collision',solid:D.solids.map(([x,y,r])=>({dx:x,dy:y,r}))});
  PROP_DEFS.c1Mouth=P_({n:'Map 4 cave mouth label (TEST)',w:300,h:300,ax:150,ay:250,live:liveMouth});}
register();
function props(){const m=(t,x,y,o)=>Object.assign({t,x:Math.round(x),y:Math.round(y),s:1,v:0,f:1,ph:0,edge:1,nc:0,m4:1},o||{});
  const out=[m('c1Out',MW/2,MH/2),m('c1Zones',MW/2,MH/2)];
  for(const [k,x,y] of D.stal.concat(D.rocks))out.push(m('c1S_'+k,x,y));
  for(const [k,x,y] of D.cry)out.push(m('c1C_'+k,x,y));
  out.push(m('c1Exit',D.exit.x,D.exit.y));out.push(m('c1Solid',0,0));return out;}
{const o=loadPropsFor;loadPropsFor=function(zid){if(zid===ID){try{ED.source='default';}catch(e){}return props();}const r=o.apply(this,arguments);
  try{if(zid===M4.id&&M4.cave&&Array.isArray(r))r.push({t:'c1Mouth',x:M4.cave.x,y:M4.cave.y,s:1,v:0,f:1,ph:0,edge:1,nc:0,m4:1,m4sy:M4.cave.y+1e5});}catch(e){}return r;};}
/* ground: the baked image (async decode -> drawn into the same canvas as soon as it is ready) */
{const o=genBG;genBG=function(zid){if(zid!==ID)return o.apply(this,arguments);LIGHTS=[];const c=document.createElement('canvas');c.width=MW;c.height=MH;const g=c.getContext('2d');g.fillStyle=RW;g.fillRect(0,0,MW,MH);BGS=1;
  let n=0;const go=()=>{const im=img('ground');if(im){g.drawImage(im,0,0,MW,MH);C1.groundOk=true;return;}if(++n<200)setTimeout(go,50);};C1.groundOk=false;go();return c;};}
{const o=gatesFor;gatesFor=function(zid){if(zid===ID)return [];return o.apply(this,arguments);};}
{const o=spawnEnemy;spawnEnemy=function(){if(G.zone===ID)return;return o.apply(this,arguments);};}

/* ---------- atmosphere: darker screen edges (on top of the engine's own vignette) ---------- */
try{const o=drawAtmos;drawAtmos=function(){const r=o.apply(this,arguments);if(G.zone===ID){try{ctx.save();const g=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.24,W/2,H/2,Math.max(W,H)*.72);
  g.addColorStop(0,'rgba(4,5,12,0)');g.addColorStop(.6,'rgba(4,5,12,.22)');g.addColorStop(1,'rgba(4,5,12,.62)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.restore();C1.stats.atmos=(C1.stats.atmos||0)+1;}catch(e){}}return r;};}catch(e){C1.atmosErr=e.message;}
/* ---------- way in (Map 4 cave mouth) and out (exit arch) ---------- */
function liveMouth(c,p){if(!P||!M4.on||G.zone!==M4.id)return;const d=Math.hypot(P.x-p.x,P.y-p.y);if(d>260)return;const a=Math.min(1,(260-d)/80);
  c.save();c.globalAlpha=a;c.font='bold 18px sans-serif';c.textAlign='center';const t='▲ ถ้ำ 1 (TEST)',w=c.measureText(t).width+20,y=p.y-150;
  c.fillStyle='rgba(0,0,0,.55)';c.fillRect(p.x-w/2,y-20,w,28);c.fillStyle='#bfe8ff';c.fillText(t,p.x,y);c.restore();}
function goCave(){if(G.fade)return;G.fade={t:0,fn:()=>{try{M4.r28.pause();}catch(e){}
  if(!M4.load(ID,{x:D.arrive[0],y:D.arrive[1]})){console.warn('[p260] the cave did not load');try{M4.load(M4.id,{x:M4.cave.x,y:M4.cave.y+80});M4.r28.resume();}catch(e){}return;}
  C1.on=true;C1.stats.enter++;ZP.where=null;try{populate();}catch(e){ZP.err.push('populate '+e.message);}}};}
function goOut(){if(G.fade)return;G.fade={t:0,fn:()=>{leaveClean();C1.stats.exit++;
  try{M4.load(M4.id,{x:M4.cave.x,y:M4.cave.y+80});}catch(e){console.warn('[p260] back to Map 4',e);}try{M4.r28.resume();}catch(e){}}};}
C1.goCave=goCave;C1.goOut=goOut;
setInterval(()=>{try{if(!P||G.fade||G.state!=='play')return;
  if(M4.on&&G.zone===M4.id&&M4.cave&&Math.abs(P.x-M4.cave.x)<44&&P.y<M4.cave.y+34&&P.y>M4.cave.y-60)goCave();
  else if(G.zone===ID&&Math.abs(P.x-D.exit.dx)<D.exit.hw&&P.y>D.exit.y0)goOut();
  if(C1.on&&G.zone!==ID)leaveClean();}catch(e){}},100);
/* ---------- monsters (Map 4 r28 rules, cave zones) ---------- */
const POP={member:[70,110],cleared:[120,170],minP:360,retry:2.5,aggro:.72,join:170,ret:1.6,timeout:20,space:90,safeGap:200,poolGap:40};
const ZC=D.zones.map(z=>Object.assign({},z,{rs:[z.rect]}));
const ZP={on:false,members:[],stats:{spawn:{},rej:{},respawns:0,kills:0,resets:0,pulls:0,minSpawnDist:null},where:null,err:[]};C1.zones=ZP;C1.zc=ZC;
const inR=(r,x,y,m)=>x>r[0]+(m||0)&&x<r[2]-(m||0)&&y>r[1]+(m||0)&&y<r[3]-(m||0);
const rectGap=(r,x,y)=>Math.hypot(Math.max(r[0]-x,0,x-r[2]),Math.max(r[1]-y,0,y-r[3]));
function zoneAt(x,y){for(const z of ZC)if(inR(z.rect,x,y))return z;return null;}
function spotWhy(z,x,y,r,o){o=o||{};
  if(!inR(z.rect,x,y,r+10))return 'rect';
  for(const [dx,dy] of[[0,0],[-r-12,0],[r+12,0],[0,-r-12],[0,r+12]])if(!onF(x+dx,y+dy))return 'floor';
  if(typeof blocked==='function'&&blocked(x,y,r+8))return 'solid';
  if(rectGap(D.safe,x,y)<POP.safeGap)return 'safe';
  {const [px,py,rx,ry]=D.pool,g=POP.poolGap+r;if(((x-px)/(rx+g))**2+((y-py)/(ry+g))**2<1)return 'pool';}
  if(!o.home){if(P&&!P.dead&&o.minP&&Math.hypot(x-P.x,y-P.y)<o.minP)return 'player';
    for(const q of enemies)if(!q.dead&&Math.hypot(q.x-x,q.y-y)<Math.max((q.sz+r)*1.15,(z.sep&&q.c1z===z)?z.sep:0))return 'monster';}
  return null;}
function grnd(){let sd=4501;return ()=>(sd=(sd*16807)%2147483647)/2147483647;}
function plan(){if(ZP.planned)return;ZP.planned=true;const R=grnd();
  for(const z of ZC){const cells=[],mr=(MOBS[z.type]&&MOBS[z.type].sz)||20,q=z.rect;
    for(let y=Math.ceil((q[1]+10)/20)*20;y<q[3];y+=20)for(let x=Math.ceil((q[0]+10)/20)*20;x<q[2];x+=20)if(!spotWhy(z,x,y,mr,{home:1}))cells.push([x,y]);
    z.walk=Math.round(cells.length*400);
    const sp=z.sep||POP.space,pick=n=>{let best=[];for(let t=0;t<60&&best.length<n;t++){const h=[];for(let k=0;k<600&&h.length<n&&cells.length;k++){const c=cells[Math.floor(R()*cells.length)];if(h.every(p=>Math.hypot(p[0]-c[0],p[1]-c[1])>=sp))h.push(c);}if(h.length>best.length)best=h;}return best;};
    const homes=pick(z.cnt);z.n=homes.length;z.minSep=0;
    if(homes.length>1){let m=1e9;for(let i=0;i<homes.length;i++)for(let j=i+1;j<homes.length;j++)m=Math.min(m,Math.hypot(homes[i][0]-homes[j][0],homes[i][1]-homes[j][1]));z.minSep=Math.round(m);}
    homes.forEach((h,i)=>ZP.members.push({z,idx:i,hx:h[0],hy:h[1],e:null,respT:null,L:null}));}}
function spawn(m,initial){if(m.z.type==='ruinwarden_m4'&&!(window.MON_SPRITES&&MON_SPRITES.byType.ruinwarden_m4)){m.respT=time+1;return false;}   // never shown before its recoloured art is ready (p254 r29)
  const z=m.z,mob=MOBS[z.type],r=(mob&&mob.sz)||20,o={minP:initial?0:POP.minP};let s=null,why=null;
  for(let k=0;k<26&&!s;k++){const a=Math.random()*6.2832,d=k?Math.min(120,Math.random()*(30+k*8)):0,x=m.hx+Math.cos(a)*d,y=m.hy+Math.sin(a)*d;why=spotWhy(z,x,y,r,o);if(!why)s=[x,y];else ZP.stats.rej[why]=(ZP.stats.rej[why]||0)+1;}
  if(!s)return false;
  const L=z.lv[0]+Math.floor(Math.random()*(z.lv[1]-z.lv[0]+1)),e=makeEnemy(z.type,L,s[0],s[1]);
  const sp=(window.W22&&W22.sp10&&W22.sp10.data||{})[z.type]||{};e.c1z=z;e.c1m=m;e.sx=s[0];e.sy=s[1];e.w22am=(sp.aggro||1)*POP.aggro;e.wx=e.x;e.wy=e.y;e.wanderT=1+Math.random()*3;
  m.e=e;m.respT=null;m.L=L;enemies.push(e);ZP.stats.spawn[z.id]=(ZP.stats.spawn[z.id]||0)+1;
  if(!initial){ZP.stats.respawns++;const dd=P?Math.hypot(s[0]-P.x,s[1]-P.y):0;ZP.stats.minSpawnDist=Math.min(ZP.stats.minSpawnDist==null?1e9:ZP.stats.minSpawnDist,Math.round(dd));try{ring(s[0],s[1],8,60,.5,mob.c,3);}catch(_){}}
  return true;}
function populate(){if(!M4.popInstall())return;plan();for(const m of ZP.members){m.e=null;if(m.respT!=null&&time<m.respT)continue;spawn(m,true);}ZP.on=true;}
function leaveClean(){if(!C1.on&&!ZP.on)return;ZP.on=false;C1.on=false;for(const m of ZP.members){if(m.e&&!m.e.dead)m.respT=time;m.e=null;}ZP.where=null;}
function died(e){const m=e.c1m;if(!m||m.e!==e)return;m.e=null;ZP.stats.kills++;const z=m.z,k=(z.resp||1),rr=a=>a[0]+Math.random()*(a[1]-a[0]);
  m.respT=time+rr(POP.member)*k;const live=ZP.members.filter(q=>q.z===z&&q.e&&!q.e.dead);
  if(!live.length){const t0=time+rr(POP.cleared)*k;let i=0;for(const q of ZP.members)if(q.z===z)q.respT=Math.max(q.respT||0,t0+(i++)*4);}}
{const o=killEnemy;killEnemy=function(e){const was=e&&e.dead,r=o.apply(this,arguments);try{if(e&&!was&&e.dead&&e.c1m)died(e);}catch(er){ZP.err.push('kill '+er.message);}return r;};}
function zPre(dt){const alive=P&&!P.dead&&G.state==='play'&&!(P.stealth>0);
  for(const e of enemies){if(e.dead||!e.c1z)continue;
    if(e.w22ret){e.hp=e.w22ret.hp;e.w22px=e.x;e.w22py=e.y;e.aggro=false;e.wind=0;e.strikeT=0;e.tele=null;e.vx=e.vy=0;for(const k in e.st)delete e.st[k];continue;}
    if(alive&&!e.aggro&&!(e.st&&e.st.stun)&&inR(e.c1z.rect,P.x,P.y,-40)&&!inR(D.safe,P.x,P.y)&&Math.hypot(e.x-P.x,e.y-P.y)<detectR(e)){e.aggro=true;e.alertT=.9;e.calmT=0;ZP.stats.pulls++;try{textAt(e.x,e.y-e.sz*2.6,'!','#ff5a6a',22,{life:.7,vy:-30});}catch(_){}
      if(e.joinMode!=='solo')for(const q of enemies)if(q!==e&&!q.dead&&!q.aggro&&q.c1z===e.c1z&&q.joinMode!=='solo'&&Math.hypot(q.x-e.x,q.y-e.y)<POP.join){q.aggro=true;q.alertT=.9;}}}}
function rStart(e){e.w22ret={t:0,hp:e.hp};e.aggro=false;e.wind=0;e.strikeT=0;e.tele=null;e.vx=e.vy=0;e.calmT=0;e.atkCd=1.4;
  for(const k in e.st)delete e.st[k];if(e.pz&&e.pz.clear)try{e.pz.clear();}catch(_){}e.dotT=.5;for(let i=projs.length-1;i>=0;i--)if(projs[i].src===e)projs.splice(i,1);}
function rEnd(e,why){e.w22ret=null;if(why==='timeout'){e.x=e.sx;e.y=e.sy;}
  e.hp=e.maxHp;e.aggro=false;e.wind=0;e.tele=null;e.strikeT=0;e.atkCd=1+Math.random()*.6;e.dotT=.5;for(const k in e.st)delete e.st[k];if(e.pz&&e.pz.clear)try{e.pz.clear();}catch(_){}}
function zPost(dt){
  for(const e of enemies){if(e.dead||!e.c1z)continue;const z=e.c1z;
    if(e.w22ret){const r=e.w22ret;r.t+=dt;const dx=e.sx-e.w22px,dy=e.sy-e.w22py,d=Math.hypot(dx,dy)||1;
      if(d<26||r.t>POP.timeout){rEnd(e,d<26?'home':'timeout');continue;}
      const st=Math.min(d,e.sp*POP.ret*dt);e.x=e.w22px+dx/d*st;e.y=e.w22py+dy/d*st;e.vx=e.vy=0;e.hp=r.hp;try{collide(e,e.sz*.7);}catch(_){}continue;}
    if(e.aggro){if(!inR(z.rect,e.x,e.y,-24)||!(P&&!P.dead&&inR(z.rect,P.x,P.y,-40)&&!inR(D.safe,P.x,P.y))||(z.leash&&Math.hypot(e.x-e.sx,e.y-e.sy)>z.leash)){rStart(e);e.w22px=e.x;e.w22py=e.y;ZP.stats.resets++;}}
    else{const q=z.rect;e.wx=Math.max(q[0]+40,Math.min(q[2]-40,e.wx));e.wy=Math.max(q[1]+40,Math.min(q[3]-40,e.wy));if(!onF(e.wx,e.wy)){e.wx=e.sx;e.wy=e.sy;}}}   // calm wander: inside the zone, on the floor
  ZP.respT=(ZP.respT||0)-dt;if(ZP.respT<=0){ZP.respT=1;
    for(const m of ZP.members){if(m.e&&!m.e.dead)continue;if(m.respT!=null&&time>=m.respT){
      if(ZP.members.some(q=>q.z===m.z&&q.e&&!q.e.dead&&(q.e.aggro||q.e.w22ret))){m.respT=time+POP.retry;continue;}   // never refill a zone during a fight
      if(!spawn(m,false))m.respT=time+POP.retry;}}}}
{const o=updEnemies;updEnemies=function(dt){if(G.zone!==ID||!ZP.on)return o.apply(this,arguments);try{zPre(dt);}catch(er){if(ZP.err.length<20)ZP.err.push('pre '+er.message);}
  const r=o.apply(this,arguments);try{zPost(dt);}catch(er){if(ZP.err.length<20)ZP.err.push('post '+er.message);}return r;};}
/* HUD: hall / entry hall / passage */
function whereText(){if(!P)return null;if(inR(D.safe,P.x,P.y))return {k:'s',t:'โถงทางเข้า',s:'🛡 Safe Zone · โถงทางเข้า',safe:1};
  const z=zoneAt(P.x,P.y);if(z)return {k:'z'+z.id,t:z.nm,s:`ถ้ำ 1 · ${z.nm} · Lv ${z.lv[0]}–${z.lv[1]}`};return {k:'p',t:null,s:'ถ้ำ 1 · ทางเดิน'};}
{const o=updZoneTag;updZoneTag=function(){const r=o.apply(this,arguments);try{if(G.zone===ID){const w=whereText(),s=document.getElementById('zSub'),n=document.getElementById('zName');
  if(n)n.textContent='Cave 1 (TEST)';if(s&&w)s.textContent=w.s;if(n)n.style.color=w&&w.safe?'#7dff9a':'';}}catch(_){}return r;};}
setInterval(()=>{try{if(G.zone!==ID||!P)return;const w=whereText();if(!w||w.k===ZP.where)return;const first=ZP.where==null;ZP.where=w.k;updZoneTag();if(!first&&w.t)showBanner(w.t,w.s,2.2);}catch(_){}},200);
/* TEST: zone outlines (the Map 4 TEST button "แสดงเส้นโซน" toggles both maps) */
function liveZones(c){if(!(M4.zones&&M4.zones.lines))return;c.save();const zk=1/Math.max(.3,Math.min(1,CAM.z||1));c.lineWidth=3*zk;c.font=`bold ${Math.round(22*Math.min(zk,2))}px sans-serif`;
  const lab=(x0,y0,lb,col)=>{c.fillStyle='rgba(0,0,0,.55)';const w=c.measureText(lb).width+12,hh=28*Math.min(zk,2);c.fillRect(x0+4,y0+4,w,hh);c.fillStyle=col;c.fillText(lb,x0+10,y0+hh-2);};
  for(const z of ZC){const q=z.rect;c.strokeStyle=z.col;c.globalAlpha=.9;c.strokeRect(q[0],q[1],q[2]-q[0],q[3]-q[1]);lab(q[0],q[1],`${z.id} · ${(MOBS[z.type]&&MOBS[z.type].n)||z.type} · Lv ${z.lv[0]}–${z.lv[1]} · ${z.n||0} ตัว`,z.col);}
  {const q=D.safe;c.strokeStyle='#50bef0';c.setLineDash([6,6]);c.strokeRect(q[0],q[1],q[2]-q[0],q[3]-q[1]);c.setLineDash([]);lab(q[0],q[1],'S · Safe Zone · โถงทางเข้า','#50bef0');}
  c.restore();}
C1.why=(i,x,y,r)=>spotWhy(ZC[i],x,y,r||20,{home:1});C1.onF=onF;C1.leave=leaveClean;
})();

