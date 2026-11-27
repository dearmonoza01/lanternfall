
/* ---- p267 r1: Map 6 TEST map "ป่าสนเยือกแข็ง" Frostpine (DeaRz 18 Oct 14:50 "รอแมพ5 เสร็จก็เริ่มแมพ6ได้เลย", 15:59 "เริ่มต่อให้หมดได้เลย"; brief
   art/map6/handoff-code-map6-r1.md, layout v3 = art/map6/draw_map6_layout.py, depth rules art/map5/map5-depth-spec.md, population
   balance/approved/BALANCE_map6_population_v1.md). A TEST sub-map of the Map 4 TEST session like Map 5 (p266 r1c) and Cave 1:
   - entered by walking into Map 5's north arch doorway (fade), arriving on the safe plaza just north of an A1 arch at the south edge; walking back into that
     arch returns to Map 5 just south of its north arch. The save stays untouched (Map 4's snapshot + storage hold cover this map too).
   - ground: one baked image (tools/map6_r1, Python, 0.8 px per world px): Map 5 snow tile with cool shading under the forests, gravel paths + plaza
     recoloured cooler with snow edges, E3 ice on the frozen pond + creek with E3 snow-bank strips along their far edges, a cool lighter veil toward the top,
     contact + cast shadows, and the upright pieces at camera height: E4 ridge (cap-left, middle x4, cap-right) + E4 stairs, Map 4 wooden plank bridge deck.
   - live sprites (y-sorted): snowy + tall pines (canopy see-through with the hero behind), E1 ice gate (closed), A1 arch, E5 stumps / log / ice crystals /
     bush, C2 snowy rocks + frosted grass, the bridge's front rail.
   - camera: looks ahead up to 170 px near the top and may rise above the map top (castle + mountains in full above the ice gate); outside the map = shaded snow.
   - code-drawn: sky, 2-layer mountains (Map 5 A3) with the E2 castle between them (parallax), mist above the ice gate + side edges + 2 slow drifting layers.
     Camera zoom 0.7 while here (restored on leaving).
   - collision: map edges, ridge face (stair treads open), stair side walls, pond rim + creek banks (bridge deck open, rails at its edges), every tree base,
     gate, arch pillars, stumps / log / crystals / rocks. Bush, frosted grass, snow patches: walk-through.
   - monsters (22, existing approved sprites, no snow monster art yet): zone 2 Stone Boar x5 Lv24-26, zone 3 Moss Turtle x4 Lv25-27, zone 5 Elder Ruin
     Warden x4 Lv26-28, zone 6 Stone Boar x3 + Warden x2 Lv26-28 (group respawn per species), zone 7 Gale Feather x4 Lv28-30. Member 50-80 s, group 90-120 s,
     Warden x1.5, homes >= 300 apart, solo, leash 340; never within 200 px of the plaza or 360 px of the hero; chase ends in the plaza / outside the zone.
     No boss. ---- */
(function(){'use strict';
const M4=window.__M4T,A6=window.__M6_ART,A5=window.__M5_ART,D=window.__M6_DATA,A4=window.__M4T_ART;if(!M4||!M4.sub||!M4.load||!A6||!A5||!D||!A4||typeof ZONES==='undefined')return;
const ID='w23_map6_test',MW=D.W,MH=D.H,GK=D.GK,T=.866;
const A=Object.assign({},A5,A6);delete A.platform;A.ground=A6.ground;   // Map 5 pieces (pines, rocks, arch, mountains) + Map 6's own
M4.sub.add(ID);
const M6={on:false,stats:{enter:0,exit:0,saveBlocked:0,arch:0,atmos:0,galeScope:0,leash:0},art:{},id:ID,data:D};M4.map6=M6;
const img=k=>{const a=A[k];if(!a)return null;if(!M6.art[k]){const i=new Image();i.decoding='async';i.src=a.src;M6.art[k]=i;}const i=M6.art[k];return i.complete&&i.naturalWidth?i:null;};
const img4=k=>{const a=A4[k];if(!a)return null;if(!M4.art[k]){const i=new Image();i.decoding='async';i.src=a.src;M4.art[k]=i;}const i=M4.art[k];return i.complete&&i.naturalWidth?i:null;};
function preload(){const need=new Set(['ground','gate','castle','mtn_far','mtn_near','arch']);for(const q of D.props)need.add(q[1]);for(const k of need)if(A[k])img(k);img('out');}
const G4=D.g4,onF=(x,y)=>{const R=D.walk[Math.floor(y/G4)];if(!R||x<0)return false;const c=Math.floor(x/G4);for(let i=0;i<R.length;i+=2)if(c>=R[i]&&c<R[i+1])return true;return false;};
const now=()=>(typeof time==='number'?time:0);
/* ---------- zone ---------- */
ZONES[ID]={n:'Map 6 (TEST)',th:'ป่าสนเยือกแข็ง · แมพทดสอบ',sub:'Map 6 · TEST · ไม่บันทึกเซฟ',safe:0,fullSafe:0,w:MW,h:MH,seed:4606,ground:['#e6edf4','#cfdbe6','#f2f6fa','#b8c8d8'],acc:'#cfe8ff',amb:'mote',mobs:[],density:0,areas:[],m4test:1};
try{if(typeof EDGE_THEME!=='undefined')EDGE_THEME[ID]=[];}catch(e){}
/* ---------- helpers ---------- */
function view(c){const t=c.getTransform().inverse(),cw=c.canvas.width,ch=c.canvas.height,ps=[[0,0],[cw,0],[0,ch],[cw,ch]].map(([u,v])=>[t.a*u+t.c*v+t.e,t.b*u+t.d*v+t.f]);
  return {x0:Math.min(...ps.map(q=>q[0])),x1:Math.max(...ps.map(q=>q[0])),y0:Math.min(...ps.map(q=>q[1])),y1:Math.max(...ps.map(q=>q[1]))};}
const foot=k=>{if(A[k])return [A[k].fx,A[k].fy];const f=D.foot[k];if(f)return f;const a=A4[k];return [a.gw/2,a.gh-3];};
const behindOf=(p,cx,gw,hT)=>!!P&&Math.abs(P.x-cx)<gw*.42&&P.y<p.y-6&&P.y>p.y-hT*.95;
/* ---------- props ---------- */
const P_=(o)=>Object.assign({cat:'m4test',w:2,h:2,ax:1,ay:1,liveOnly:1,nofade:1,draw(){}},o);
// pines: canopy fades to 45 % while the hero stands behind it, the trunk stays solid; one uniform scale, never flipped (same as Map 5)
function tree(c,p,k){const a=A[k],im=img(k);if(!im)return;const hT=a.gh/T,cx=p.x-a.fx+a.gw/2,b=behindOf(p,cx,a.gw,hT);
  p.m6al=(p.m6al==null?1:p.m6al)+((b?.45:1)-(p.m6al==null?1:p.m6al))*.15;
  const x0=p.x-a.fx,y0=p.y-a.fy,cut=a.gh*.78,nw=im.naturalWidth,nh=im.naturalHeight;c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  c.globalAlpha*=p.m6al;c.drawImage(im,0,0,nw,nh*cut/a.gh,x0,y0,a.gw,cut);c.globalAlpha=1;c.drawImage(im,0,nh*cut/a.gh,nw,nh*(1-cut/a.gh),x0,y0+cut,a.gw,a.gh-cut);c.restore();}
// still pieces (gate, arch, extras, snowy rocks, frosted grass): drawn at the foot point; pieces taller than 90 px turn see-through (55 %) with the hero behind
function still(c,p,k){const a=A[k],im=img(k);if(!im)return;const [fx,fy]=foot(k);let al=1;
  if(a.gh>90){const b=behindOf(p,p.x-fx+a.gw/2,a.gw*1.1,a.gh/T);p.m6al=(p.m6al==null?1:p.m6al)+((b?.55:1)-(p.m6al==null?1:p.m6al))*.15;al=p.m6al;}
  c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';if(al<1)c.globalAlpha*=al;c.drawImage(im,p.x-fx,p.y-fy,a.gw,a.gh);c.restore();}
let OUTPAT=null;
function liveOutside(c){const im=img('out');if(!im)return;if(!OUTPAT)OUTPAT=c.createPattern(im,'repeat');const v=view(c),x0=v.x0-40,x1=v.x1+40,y0=v.y0-40,y1=v.y1+40;
  if(x0>=0&&y0>=0&&x1<=MW&&y1<=MH)return;c.save();c.beginPath();c.rect(x0,y0,x1-x0,y1-y0);c.rect(0,0,MW,MH);c.clip('evenodd');c.fillStyle=OUTPAT;c.fillRect(x0,y0,x1-x0,y1-y0);c.restore();}
/* sky + 2 mountain layers (Map 5 A3, parallax far 0.6 / near 0.75) with the E2 castle between them (parallax 0.6, centred above the ice gate); the near range's
   straight foot fades into the snow, so the snow ground stays visible behind the gate (art rule from the Map 5 review) */
const MTN=[['mtn_far',D.mtn.far,.6],['castle'],['mtn_near',D.mtn.near,.75]];
function liveSky(c){const v=view(c);if(v.y0>D.mtn.near+20)return;const cx=(v.x0+v.x1)/2,cy=(v.y0+v.y1)/2,dy=Math.max(0,Math.min(40,(cy-500)*.06));
  const yb=D.mtn.far+dy-40,top=Math.min(v.y0,-300),g=c.createLinearGradient(0,top,0,yb);g.addColorStop(0,'#86b4dc');g.addColorStop(.7,'#c4dcee');g.addColorStop(1,'#e2edf4');
  c.save();c.fillStyle=g;c.fillRect(v.x0-10,top-10,v.x1-v.x0+20,yb-top+10);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  for(const [k,base,par] of MTN){
    if(k==='castle'){const a=A.castle,im=img('castle');if(!im)continue;const q=D.castle,h=a.gh/T,x=q.x+(cx-q.x)*(1-q.par)-a.gw/2,y=q.base+dy*.5-h;
      if(x<v.x1&&x+a.gw>v.x0)c.drawImage(im,x,y,a.gw,h);continue;}
    const a=A[k],im=img(k);if(!im)continue;const w=a.gw,h=a.gh/T,off=cx*(1-par),y=base+dy*(k==='mtn_far'?.5:1)-h;
    for(let x=off+Math.floor((v.x0-off)/w)*w;x<v.x1;x+=w)c.drawImage(im,Math.floor(x),y,Math.ceil(w)+1,h);}
  {const yb=D.mtn.near+dy,g2=c.createLinearGradient(0,yb-70,0,yb+6);g2.addColorStop(0,'rgba(214,226,240,0)');g2.addColorStop(.75,'rgba(214,226,240,.85)');g2.addColorStop(1,'rgba(214,226,240,1)');
    c.fillStyle=g2;c.fillRect(v.x0-10,yb-70,v.x1-v.x0+20,76);}
  c.restore();}
function register(){
  PROP_DEFS.m6Out=P_({n:'Map 6: shaded snow outside the map',layer:'ground',w:MW+6000,h:MH+6000,ax:(MW+6000)/2,ay:(MH+6000)/2,live:liveOutside});
  PROP_DEFS.m6Sky=P_({n:'Map 6: sky + mountains + castle (parallax)',layer:'ground',w:MW+6000,h:MH+6000,ax:(MW+6000)/2,ay:(MH+6000)/2,live:liveSky});
  PROP_DEFS.m6Zones=P_({n:'Map 6 zone outlines (TEST)',layer:'ground',w:MW+400,h:MH+400,ax:(MW+400)/2,ay:(MH+400)/2,live:liveZones});
  for(const k of new Set(D.props.filter(q=>q[0]==='tree').map(q=>q[1]))){const a=A[k];if(!a){console.warn('[p267] missing art',k);continue;}PROP_DEFS['m6T_'+k]=P_({n:'Map 6 pine '+k,w:a.gw,h:a.gh,ax:a.fx,ay:a.fy,live:(c,p)=>tree(c,p,k)});}
  for(const k of new Set(D.props.filter(q=>q[0]!=='tree').map(q=>q[1]))){const a=A[k];if(!a){console.warn('[p267] missing art',k);continue;}const [fx,fy]=foot(k);PROP_DEFS['m6S_'+k]=P_({n:'Map 6 '+k,w:a.gw,h:a.gh,ax:fx,ay:fy,live:(c,p)=>still(c,p,k)});}
  PROP_DEFS.m6Solid=P_({n:'Map 6 collision',solid:D.solids.map(([x,y,r])=>({dx:x,dy:y,r}))});}
register();
function props(){const m=(t,x,y,o)=>Object.assign({t,x:Math.round(x),y:Math.round(y),s:1,v:0,f:1,ph:0,edge:1,nc:0,m4:1},o||{});
  const out=[m('m6Out',MW/2,MH/2),m('m6Sky',MW/2,MH/2),m('m6Zones',MW/2,MH/2)];
  for(const [kind,k,x,y] of D.props){const t=(kind==='tree'?'m6T_':'m6S_')+k;
    if(!PROP_DEFS[t]){M6.missing=(M6.missing||[]);if(M6.missing.indexOf(t)<0)M6.missing.push(t);continue;}out.push(m(t,x,y));}
  {const b=D.bridge;if(PROP_DEFS['m4L2_'+b.k])out.push(m('m4L2_'+b.k,b.x,b.y,{m4sy:b.y+b.D}));}   // front rail: Map 4's L2 piece, sorted at the rail line
  out.push(m('m6Solid',0,0));return out;}
{const o=loadPropsFor;loadPropsFor=function(zid){if(zid===ID){try{ED.source='default';}catch(e){}return props();}return o.apply(this,arguments);};}
{const o=genBG;genBG=function(zid){if(zid!==ID)return o.apply(this,arguments);LIGHTS=[];const c=document.createElement('canvas');c.width=Math.round(MW*GK);c.height=Math.round(MH*GK);const g=c.getContext('2d');g.fillStyle='#e6edf4';g.fillRect(0,0,c.width,c.height);BGS=GK;
  let n=0;const go=()=>{const im=img('ground');if(im){g.drawImage(im,0,0,c.width,c.height);M6.groundOk=true;return;}if(++n<300)setTimeout(go,50);};M6.groundOk=false;go();return c;};}
/* camera: near the top of the map it looks up to 170 px ahead of the hero (eased in below y 1000) and may rise above the map top (down to D.camTop), so the
   castle + mountains over the ice gate show in full; the engine stops the camera at the map top everywhere else */
{const o=clampCam;clampCam=function(){if(G.zone!==ID||!P)return o.apply(this,arguments);const Z=ZONES[G.zone],lift=Math.max(0,Math.min(1,(1000-P.y)/500))*170;
  cam.x=Z.w<VW?(Z.w-VW)/2:clamp(cam.x,0,Z.w-VW);cam.y=clamp(Math.min(cam.y,P.y-VH/2-lift),D.camTop,Z.h-VH);};}
{const o=gatesFor;gatesFor=function(zid){if(zid===ID)return [];return o.apply(this,arguments);};}
{const o=spawnEnemy;spawnEnemy=function(){if(G.zone===ID)return;return o.apply(this,arguments);};}

/* ---------- mist (screen space, world-anchored): above the ice gate (over the castle foot and the near range's foot), soft side edges, 2 slow drifting layers ---------- */
let MC=null;function mistCanvas(){if(MC)return MC;const c=document.createElement('canvas');c.width=512;c.height=128;const g=c.getContext('2d');let sd=6606;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;
  for(let i=0;i<46;i++){const x=r()*512,y=40+r()*48,rx=40+r()*90,ry=18+r()*22,a=.10+r()*.10;for(const ox of[-512,0,512]){g.save();g.translate(x+ox,y);g.scale(1,ry/rx);const q=g.createRadialGradient(0,0,1,0,0,rx);
    q.addColorStop(0,`rgba(240,246,252,${a})`);q.addColorStop(1,'rgba(240,246,252,0)');g.fillStyle=q;g.beginPath();g.arc(0,0,rx,0,6.2832);g.fill();g.restore();}}
  return MC=c;}
function mistBand(wy0,wy1,speed,alpha,seed){const a=w2s(0,wy0),b=w2s(0,wy1);if(b[1]<-20||a[1]>H+20)return;const z=camZ(),h=b[1]-a[1],tw=1024*z,mc=mistCanvas();
  let x=(a[0]+now()*speed*z+seed*tw)%tw;if(x>0)x-=tw;ctx.save();ctx.globalAlpha=alpha;for(;x<W;x+=tw)ctx.drawImage(mc,x,a[1],tw+1,h);ctx.restore();}
function drawMist(){const z=camZ(),n=D.mtn.near;
  mistBand(n-110,n+30,6,.75,0);mistBand(n-182,n-62,-4,.55,.37);   // over the near range's foot + the castle foot: starts above the ice gate's mid-height
  for(const [wy0,wy1,sp,al,sd] of[[560,1000,9,.22,.2],[1250,1900,-7,.16,.61]])mistBand(wy0,wy1,sp,al,sd);   // light drifting layers over the upper snowfield and the middle fields
  const L=w2s(0,0)[0],R=w2s(MW,0)[0],ew=300*z;
  if(L+ew>0){const g=ctx.createLinearGradient(L-60*z,0,L+ew,0);g.addColorStop(0,'rgba(232,240,248,.38)');g.addColorStop(1,'rgba(232,240,248,0)');ctx.fillStyle=g;ctx.fillRect(0,0,Math.min(W,L+ew),H);}
  if(R-ew<W){const g=ctx.createLinearGradient(R+60*z,0,R-ew,0);g.addColorStop(0,'rgba(232,240,248,.38)');g.addColorStop(1,'rgba(232,240,248,0)');ctx.fillStyle=g;ctx.fillRect(Math.max(0,R-ew),0,W-Math.max(0,R-ew),H);}}
try{const o=drawAtmos;drawAtmos=function(){const r=o.apply(this,arguments);if(G.zone===ID){try{ctx.save();ctx.setTransform(ctx.getTransform());drawMist();ctx.restore();M6.stats.atmos++;}catch(e){M6.mistErr=e.message;}}return r;};}catch(e){M6.atmosErr=e.message;}
/* ---------- way in (Map 5 north arch) and back (Map 6 south arch) ---------- */
function enter(pos,face){preload();
  if(!M4.load(ID,{x:pos[0],y:pos[1]})){console.warn('[p267] Map 6 did not load');return false;}
  M6.on=true;M6.stats.enter++;M6.armT=now()+1.5;if(M6.z0==null)M6.z0=CAM.zt;CAM.zt=.7;try{P.face=face==null?-Math.PI/2:face;}catch(_){}ZP.where=null;try{populate();}catch(e){ZP.err.push('populate '+e.message);}return true;}
function goMap6(){const M5=M4.map5;if(G.fade||!M4.on||!M5)return false;preload();
  G.fade={t:0,fn:()=>{try{M5.leave();}catch(e){}if(!enter(D.arrive,-Math.PI/2)){try{M5.enter(D.back,Math.PI/2);}catch(e){}}}};return true;}
function goBack(){const M5=M4.map5;if(G.fade||!M5)return;M6.stats.arch++;G.fade={t:0,fn:()=>{leaveClean();M6.stats.exit++;try{M5.enter(D.back,Math.PI/2);}catch(e){console.warn('[p267] back to Map 5',e);}}};}
M4.goMap6=goMap6;M6.goBack=goBack;M6.enter=enter;
setInterval(()=>{try{if(M6.on&&G.zone!==ID&&!G.fade)leaveClean();if(!P||G.fade||G.state!=='play'||G.zone!==ID)return;
  const q=D.arch;if(now()>M6.armT&&Math.abs(P.x-q.cx)<40&&P.y>q.y-44)goBack();}catch(e){}},100);   // into the south arch doorway (between its pillar footprints)
/* ---------- monsters (Map 4 r28 / Map 5 rules + Map 6 balance: per-species homes, Warden solo + leash, zone 6 group timers per species) ---------- */
const POP={member:[50,80],cleared:[90,120],minP:360,retry:2.5,aggro:.72,join:170,ret:1.6,timeout:20,safeGap:200,wardenSep:300,mixGap:200};
function polyIn(x,y,Q){let c=false;for(let i=0,j=Q.length-1;i<Q.length;j=i++){const a=Q[i],b=Q[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
function edgeD(x,y,Q){let m=1e9;for(let i=0,j=Q.length-1;i<Q.length;j=i++){const [x1,y1]=Q[j],[x2,y2]=Q[i],dx=x2-x1,dy=y2-y1,L=dx*dx+dy*dy,t=L?Math.max(0,Math.min(1,((x-x1)*dx+(y-y1)*dy)/L)):0;m=Math.min(m,Math.hypot(x-x1-t*dx,y-y1-t*dy));}return m;}
const inZ=(z,x,y,m)=>{const i=polyIn(x,y,z.poly);if(!m)return i;if(m>0)return i&&edgeD(x,y,z.poly)>=m;return i||edgeD(x,y,z.poly)<-m;};
const inR=(r,x,y,m)=>x>r[0]+(m||0)&&x<r[2]-(m||0)&&y>r[1]+(m||0)&&y<r[3]-(m||0);
const rectGap=(r,x,y)=>Math.hypot(Math.max(r[0]-x,0,x-r[2]),Math.max(r[1]-y,0,y-r[3]));
const ZC=D.zones.map(z=>{const xs=z.poly.map(q=>q[0]),ys=z.poly.map(q=>q[1]);return Object.assign({},z,{bb:[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)],cnt:z.mix.reduce((a,q)=>a+q[1],0)});});
const ZP={on:false,members:[],stats:{spawn:{},rej:{},respawns:0,kills:0,resets:0,pulls:0,minSpawnDist:null,plazaDrops:0},where:null,err:[]};M6.zones=ZP;M6.zc=ZC;
function zoneAt(x,y){for(const z of ZC)if(inZ(z,x,y))return z;return null;}
function spotWhy(z,x,y,r,o){o=o||{};
  if(!inZ(z,x,y,r+10))return 'zone';
  for(const [dx,dy] of[[0,0],[-r-12,0],[r+12,0],[0,-r-12],[0,r+12]])if(!onF(x+dx,y+dy))return 'floor';
  if(typeof blocked==='function'&&blocked(x,y,r+8))return 'solid';
  if(rectGap(D.safe,x,y)<POP.safeGap)return 'safe';
  for(const [ax,ay,ar] of D.avoid)if(Math.hypot(x-ax,y-ay)<ar+r)return 'avoid';
  if(!o.home){if(P&&!P.dead&&o.minP&&Math.hypot(x-P.x,y-P.y)<o.minP)return 'player';
    for(const q of enemies)if(!q.dead&&Math.hypot(q.x-x,q.y-y)<Math.max((q.sz+r)*1.15,(q.m6z===z)?z.sep*.5:0))return 'monster';}
  return null;}
function grnd(){let sd=6606;return ()=>(sd=(sd*16807)%2147483647)/2147483647;}
const isW=t=>D.solo.indexOf(t)>=0;
function plan(){if(ZP.planned)return;ZP.planned=true;const R=grnd();
  for(const z of ZC){const mr=Math.max(...z.mix.map(q=>(MOBS[q[0]]&&MOBS[q[0]].sz)||20)),q=z.bb,cells=[];
    for(let y=Math.ceil((q[1]+10)/20)*20;y<q[3];y+=20)for(let x=Math.ceil((q[0]+10)/20)*20;x<q[2];x+=20)if(!spotWhy(z,x,y,mr,{home:1}))cells.push([x,y]);
    z.walk=Math.round(cells.length*400);
    const types=[];for(const [t,n] of z.mix.slice().sort((a,b)=>isW(b[0])-isW(a[0])))for(let i=0;i<n;i++)types.push(t);   // Wardens placed first (widest spacing)
    const fits=(h,t,c)=>h.every(p=>{const d=Math.hypot(p[0]-c[0],p[1]-c[1]);if(p[2]===t)return d>=(isW(t)?Math.max(POP.wardenSep,z.sep):z.sep);return d>=(isW(t)||isW(p[2])?POP.mixGap:z.sep);});
    const tryAll=()=>{let best=[];for(let t=0;t<80&&best.length<types.length;t++){const h=[];for(const ty of types){let ok=null;for(let j=0;j<600&&!ok;j++){const c=cells[Math.floor(R()*cells.length)];if(fits(h,ty,c))ok=c;}if(!ok)break;h.push([ok[0],ok[1],ty]);}if(h.length>best.length)best=h;}return best;};
    const homes=cells.length?tryAll():[];z.n=homes.length;
    z.minSep=0;if(homes.length>1){let m=1e9;for(let i=0;i<homes.length;i++)for(let j=i+1;j<homes.length;j++)m=Math.min(m,Math.hypot(homes[i][0]-homes[j][0],homes[i][1]-homes[j][1]));z.minSep=Math.round(m);}
    homes.forEach((h,i)=>ZP.members.push({z,type:h[2],idx:i,hx:h[0],hy:h[1],e:null,respT:null,L:null}));}}
function galeScope(){const REG=window.MON_SPRITES,R=REG&&REG.byType&&REG.byType.galefeather;if(!R)return false;if(R.data.m6scope)return true;R.data.m6scope=1;
  const d=Object.getOwnPropertyDescriptor(R.data,'scope'),old=d&&d.get?d.get:()=>d?d.value:'studio';   // Gale Feather art: everywhere it was, plus this map
  Object.defineProperty(R.data,'scope',{configurable:true,get(){return (typeof G!=='undefined'&&G.zone===ID)?'map6test':old.call(R.data);}});M6.stats.galeScope++;return true;}
function spawn(m,initial){if(m.type==='ruinwarden_m4'&&!(window.MON_SPRITES&&MON_SPRITES.byType.ruinwarden_m4)){m.respT=now()+1;return false;}
  if(m.type==='galefeather'&&!galeScope()){m.respT=now()+1;return false;}
  const z=m.z,mob=MOBS[m.type];if(!mob){ZP.err.length<20&&ZP.err.push('no species '+m.type);m.respT=now()+30;return false;}
  const r=mob.sz||20,o={minP:initial?0:POP.minP};let s=null,why=null;
  for(let k=0;k<26&&!s;k++){const a=Math.random()*6.2832,d=k?Math.min(120,Math.random()*(30+k*8)):0,x=m.hx+Math.cos(a)*d,y=m.hy+Math.sin(a)*d;why=spotWhy(z,x,y,r,o);if(!why)s=[x,y];else ZP.stats.rej[why]=(ZP.stats.rej[why]||0)+1;}
  if(!s)return false;
  const L=z.lv[0]+Math.floor(Math.random()*(z.lv[1]-z.lv[0]+1)),e=makeEnemy(m.type,L,s[0],s[1]);
  const sp=(window.W22&&W22.sp10&&W22.sp10.data||{})[m.type]||{};e.m6z=z;e.m6m=m;e.sx=s[0];e.sy=s[1];e.w22am=(sp.aggro||1)*POP.aggro;e.wx=e.x;e.wy=e.y;e.wanderT=1+Math.random()*3;
  if(isW(m.type))e.joinMode='solo';e.m6leash=D.leash[m.type]||0;
  m.e=e;m.respT=null;m.L=L;enemies.push(e);ZP.stats.spawn[z.id]=(ZP.stats.spawn[z.id]||0)+1;
  if(!initial){ZP.stats.respawns++;const dd=P?Math.hypot(s[0]-P.x,s[1]-P.y):0;ZP.stats.minSpawnDist=Math.min(ZP.stats.minSpawnDist==null?1e9:ZP.stats.minSpawnDist,Math.round(dd));try{ring(s[0],s[1],8,60,.5,mob.c,3);}catch(_){}}
  return true;}
function populate(){if(!M4.popInstall())return;plan();for(const m of ZP.members){m.e=null;if(m.respT!=null&&now()<m.respT)continue;spawn(m,true);}ZP.on=true;}
function leaveClean(){if(M6.on&&M6.z0!=null){CAM.zt=M6.z0;M6.z0=null;}if(!M6.on&&!ZP.on)return;ZP.on=false;M6.on=false;for(const m of ZP.members){if(m.e&&!m.e.dead)m.respT=now();m.e=null;}ZP.where=null;}
M6.leave=leaveClean;
const sameGrp=(a,b)=>a.z===b.z&&(a.z.grp!=='type'||a.type===b.type);   // zone 6: boars and Wardens keep separate group timers
function died(e){const m=e.m6m;if(!m||m.e!==e)return;m.e=null;ZP.stats.kills++;const k=D.respK[m.type]||1,rr=a=>a[0]+Math.random()*(a[1]-a[0]);
  m.respT=now()+rr(POP.member)*k;const live=ZP.members.filter(q=>sameGrp(q,m)&&q.e&&!q.e.dead);
  if(!live.length){const t0=now()+rr(POP.cleared)*k;let i=0;for(const q of ZP.members)if(sameGrp(q,m))q.respT=Math.max(q.respT||0,t0+(i++)*4);}}
{const o=killEnemy;killEnemy=function(e){const was=e&&e.dead,r=o.apply(this,arguments);try{if(e&&!was&&e.dead&&e.m6m)died(e);}catch(er){ZP.err.push('kill '+er.message);}return r;};}
const heroIn=z=>P&&!P.dead&&inZ(z,P.x,P.y,-40)&&!inR(D.safe,P.x,P.y);
function zPre(dt){const alive=P&&!P.dead&&G.state==='play'&&!(P.stealth>0);
  for(const e of enemies){if(e.dead||!e.m6z)continue;
    if(e.w22ret){e.hp=e.w22ret.hp;e.w22px=e.x;e.w22py=e.y;e.aggro=false;e.wind=0;e.strikeT=0;e.tele=null;e.vx=e.vy=0;for(const k in e.st)delete e.st[k];continue;}
    if(alive&&!e.aggro&&!(e.st&&e.st.stun)&&heroIn(e.m6z)&&Math.hypot(e.x-P.x,e.y-P.y)<detectR(e)){e.aggro=true;e.alertT=.9;e.calmT=0;ZP.stats.pulls++;try{textAt(e.x,e.y-e.sz*2.6,'!','#ff5a6a',22,{life:.7,vy:-30});}catch(_){}
      if(e.joinMode!=='solo')for(const q of enemies)if(q!==e&&!q.dead&&!q.aggro&&q.m6z===e.m6z&&q.joinMode!=='solo'&&Math.hypot(q.x-e.x,q.y-e.y)<POP.join){q.aggro=true;q.alertT=.9;}}}}
function rStart(e){e.w22ret={t:0,hp:e.hp};e.aggro=false;e.wind=0;e.strikeT=0;e.tele=null;e.vx=e.vy=0;e.calmT=0;e.atkCd=1.4;
  for(const k in e.st)delete e.st[k];if(e.pz&&e.pz.clear)try{e.pz.clear();}catch(_){}e.dotT=.5;for(let i=projs.length-1;i>=0;i--)if(projs[i].src===e)projs.splice(i,1);}
function rEnd(e,why){e.w22ret=null;if(why==='timeout'){e.x=e.sx;e.y=e.sy;}
  e.hp=e.maxHp;e.aggro=false;e.wind=0;e.tele=null;e.strikeT=0;e.atkCd=1+Math.random()*.6;e.dotT=.5;for(const k in e.st)delete e.st[k];if(e.pz&&e.pz.clear)try{e.pz.clear();}catch(_){}}
function zPost(dt){
  for(const e of enemies){if(e.dead||!e.m6z)continue;const z=e.m6z;
    if(e.w22ret){const r=e.w22ret;r.t+=dt;const dx=e.sx-e.w22px,dy=e.sy-e.w22py,d=Math.hypot(dx,dy)||1;
      if(d<26||r.t>POP.timeout){rEnd(e,d<26?'home':'timeout');continue;}
      const st=Math.min(d,e.sp*POP.ret*dt);e.x=e.w22px+dx/d*st;e.y=e.w22py+dy/d*st;e.vx=e.vy=0;e.hp=r.hp;try{collide(e,e.sz*.7);}catch(_){}continue;}
    if(e.aggro){const far=e.m6leash&&Math.hypot(e.x-e.sx,e.y-e.sy)>e.m6leash;
      if(far||!inZ(z,e.x,e.y,-24)||!heroIn(z)){if(P&&inR(D.safe,P.x,P.y))ZP.stats.plazaDrops++;if(far)M6.stats.leash++;rStart(e);e.w22px=e.x;e.w22py=e.y;ZP.stats.resets++;}}
    else if(!inZ(z,e.wx,e.wy,30)||!onF(e.wx,e.wy)){e.wx=e.sx;e.wy=e.sy;}}
  ZP.respT=(ZP.respT||0)-dt;if(ZP.respT<=0){ZP.respT=1;
    for(const m of ZP.members){if(m.e&&!m.e.dead)continue;if(m.respT!=null&&now()>=m.respT){
      if(ZP.members.some(q=>q.z===m.z&&q.e&&!q.e.dead&&(q.e.aggro||q.e.w22ret))){m.respT=now()+POP.retry;continue;}   // never refill a zone during a fight
      if(!spawn(m,false))m.respT=now()+POP.retry;}}}}
{const o=updEnemies;updEnemies=function(dt){if(G.zone!==ID||!ZP.on)return o.apply(this,arguments);try{zPre(dt);}catch(er){if(ZP.err.length<20)ZP.err.push('pre '+er.message);}
  const r=o.apply(this,arguments);try{zPost(dt);}catch(er){if(ZP.err.length<20)ZP.err.push('post '+er.message);}return r;};}
/* HUD: zone names */
function whereText(){if(!P)return null;if(inR(D.safe,P.x,P.y))return {k:'s',t:'ลานรับ',s:'🛡 Safe Zone · ลานรับ',safe:1};
  const z=zoneAt(P.x,P.y);if(z)return {k:'z'+z.id,t:z.nm,s:`แมพ 6 · ${z.nm} · Lv ${z.lv[0]}–${z.lv[1]}`};
  if(P.y<D.ridge[0])return {k:'n',t:null,s:'แมพ 6 · ทุ่งบน'};return {k:'p',t:null,s:'แมพ 6 · ทางเดิน'};}
{const o=updZoneTag;updZoneTag=function(){const r=o.apply(this,arguments);try{if(G.zone===ID){const w=whereText(),s=document.getElementById('zSub'),n=document.getElementById('zName');
  if(n)n.textContent='Map 6 (TEST)';if(s&&w)s.textContent=w.s;if(n)n.style.color=w&&w.safe?'#7dff9a':'';}}catch(_){}return r;};}
setInterval(()=>{try{if(G.zone!==ID||!P)return;const w=whereText();if(!w||w.k===ZP.where)return;const first=ZP.where==null;ZP.where=w.k;updZoneTag();if(!first&&w.t)showBanner(w.t,w.s,2.2);}catch(_){}},200);
/* TEST: zone outlines (the Map 4 TEST button "แสดงเส้นโซน" toggles every TEST map); M6.dbg = true also draws the collision discs */
function liveZones(c){const dbg=M6.dbg;if(!(M4.zones&&M4.zones.lines)&&!dbg)return;c.save();
  if(dbg){c.strokeStyle='rgba(255,40,60,.85)';c.lineWidth=2;for(const o of SOLIDS){c.beginPath();c.arc(o.x,o.y,o.r,0,6.2832);c.stroke();}}
  const zk=1/Math.max(.3,Math.min(1,CAM.z||1));c.lineWidth=3*zk;c.font=`bold ${Math.round(22*Math.min(zk,2))}px sans-serif`;
  const lab=(x0,y0,lb,col)=>{c.fillStyle='rgba(0,0,0,.55)';const w=c.measureText(lb).width+12,hh=28*Math.min(zk,2);c.fillRect(x0+4,y0+4,w,hh);c.fillStyle=col;c.fillText(lb,x0+10,y0+hh-2);};
  for(const z of ZC){c.strokeStyle=z.col;c.globalAlpha=.9;c.beginPath();z.poly.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.closePath();c.stroke();
    lab(z.bb[0]+20,z.bb[1]+10,`${z.id} · ${z.mix.map(q=>((MOBS[q[0]]&&MOBS[q[0]].n)||q[0])+'×'+q[1]).join(' + ')} · Lv ${z.lv[0]}–${z.lv[1]} · ${z.n||0} ตัว`,z.col);}
  {const q=D.safe;c.strokeStyle='#50bef0';c.setLineDash([6,6]);c.strokeRect(q[0],q[1],q[2]-q[0],q[3]-q[1]);c.setLineDash([]);lab(q[0],q[1],'1 · Safe Zone · ลานรับ','#50bef0');}
  c.restore();}
M6.why=(i,x,y,r)=>spotWhy(ZC[i],x,y,r||20,{home:1});M6.onF=onF;M6.whereText=whereText;
})();

