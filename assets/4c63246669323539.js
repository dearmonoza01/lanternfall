
/* p333 Map 10 "Riverfork" ทุ่งสองแคว (TEST). Order orders/code/ORDER_20261031_map10-riverfork.md (DeaRz 31 Oct 11:26 "ให้โค้ดทำก่อนเลย").
   Layout art/map10 layout v3 + zones v3 + props v2; new art approved/maps/map10 (HANDOFF_map10_props_r1.md), cut + de-fringed 1 px.
   - Map 3's east gate (closed before) now opens into Map 10 (warp light like the north gate); arrival on plaza A west of the map,
     just east of the Map 4 stone arch bridge. Walking west over that bridge to the map's west edge goes back to Map 3, west of its east gate.
   - World 3400 x 3000, Lv 36-40 farming map, NOT a safe map: only plaza A is safe. No monsters yet (no spawns; the zones are kept for later).
   - Ground: one baked image (m10/mk_m10.py, 0.8 px per world px): Map 1 meadow / flower / forest / road / plaza / water / bank tiles,
     marsh tiles A+B mixed in zone 1, the 4 crop decals on the farm plots (zone 5).
   - Watermill on the creek's west bank (scenery, no NPC), its wheel turns slowly over the mill race at the axle stub on the right wall.
   - East gate E to Map 11: visible, CLOSED (Map 11 does not exist). The road turns north into the gate; a wall line runs west of it.
   - Collision: map edge forests, river + creek banks (bridge decks + the stepping-stone ford open), every tree base, solid props by their
     full footprint (mill, shed, well, bales, crates, barrow, trough, boat, post, rocks, walls, signposts, gate pillar bases). Reeds, lilies,
     puddles, crops and grass are walk-through.
   - A save made inside Map 10 is stored as Map 3 next to its east gate (the TEST map never ends up in the save).
   ?map10=off = old game (Map 3 east gate closed). */
(function(){'use strict';
if(/[?&]map10=off/.test(location.search))return;
const M4=window.__M4T,A=window.__M10_ART,D=window.__M10_DATA,GSRC=window.__M10_GROUND,A4=window.__M4T_ART;
if(!M4||!M4.load||!A||!D||!GSRC||typeof ZONES==='undefined'||typeof PROP_DEFS==='undefined'||typeof loadPropsFor!=='function')return;
const ID='w24_map10_test',M3='astoria_capital',M10P='w22_map10_planned',MW=D.W,MH=D.H,GK=D.GK,T=.866;
const M10=window.__M10={on:false,id:ID,data:D,stats:{enter:0,exit:0,hint:0,saveRedirect:0,wheel:0},err:[],art:{},dbg:false};
const now=()=>(typeof time==='number'?time:performance.now()/1000);
const img=k=>{const a=A[k];if(!a)return null;if(!M10.art[k]){const i=new Image();i.decoding='async';i.src=a.src;M10.art[k]=i;}const i=M10.art[k];return i.complete&&i.naturalWidth?i:null;};
const img4=k=>{const a=A4&&A4[k];if(!a||!a.src)return null;if(!M4.art)M4.art={};if(!M4.art[k]){const i=new Image();i.decoding='async';i.src=a.src;M4.art[k]=i;}const i=M4.art[k];return i.complete&&i.naturalWidth?i:null;};
let GIMG=null;const ground=()=>{if(!GIMG){GIMG=new Image();GIMG.decoding='async';GIMG.src=GSRC;}return GIMG.complete&&GIMG.naturalWidth?GIMG:null;};
function preload(){ground();for(const k in A)img(k);}
/* ---------- zone ---------- */
ZONES[ID]={n:'Map 10 (TEST)',th:'ทุ่งสองแคว · แมพทดสอบ',sub:'Map 10 · Lv 36–40 · TEST',safe:0,fullSafe:0,w:MW,h:MH,seed:1010,ground:['#7cae58','#6a9e4a','#8cbc64','#4a7a3a'],acc:'#ffe08a',amb:'mote',mobs:[],density:0,areas:[]};
try{if(typeof EDGE_THEME!=='undefined')EDGE_THEME[ID]=[];}catch(e){}
/* ---------- props ---------- */
const P_=(o)=>Object.assign({cat:'m10test',w:2,h:2,ax:1,ay:1,liveOnly:1,nofade:1,draw(){}},o);
const behindOf=(p,cx,gw,hT)=>!!P&&Math.abs(P.x-cx)<gw*.42&&P.y<p.y-6&&P.y>p.y-hT*.95;
// upright pieces: drawn at their foot point; taller than 90 px turn see-through (55 %) while the hero stands behind them
function still(c,p,k){const a=A[k],im=img(k);if(!im)return;let al=1;
  if(a.gh>90){const b=behindOf(p,p.x-a.fx+a.gw/2,a.gw*1.05,a.gh/T);p.m10al=(p.m10al==null?1:p.m10al)+((b?.55:1)-(p.m10al==null?1:p.m10al))*.15;al=p.m10al;}
  c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';if(al<1)c.globalAlpha*=al;c.drawImage(im,p.x-a.fx,p.y-a.fy,a.gw,a.gh);c.restore();}
function flat(c,p,k){const a=A[k],im=img(k);if(!im)return;c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(im,p.x-a.gw/2,p.y-a.gh/2,a.gw,a.gh);c.restore();}
/* waterwheel: turns in the plane of its front face (the face is an upright ellipse, 0.726 wide); 12 spokes, so the picture at angle a and at
   a-30 deg line up spoke for spoke: drawing a (full) and a-30 (fading in) keeps the turn seamless; the hub + axle end stay still (drawn
   again unturned, clipped to the hub) */
const WH={cx:756,cy:641,kx:.726,rx:392,ry:540,hubR:130,per:30*Math.PI/180,spd:.22};
function wheel(c){const a=A.a_wheel,im=img('a_wheel');if(!im)return;const s=a.gw/1254,hx=D.hub[0],hy=D.hub[1];
  const ox=hx-a.fx+WH.cx*s,oy=hy-a.fy+WH.cy*s,ang=(now()*WH.spd)%WH.per,u=ang/WH.per;M10.stats.wheel++;
  const one=(th,al)=>{c.save();c.globalAlpha*=al;c.translate(ox,oy);c.scale(WH.kx,1);c.rotate(th);c.scale(1/WH.kx,1);c.drawImage(im,-WH.cx*s,-WH.cy*s,a.gw,a.gh);c.restore();};
  c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  // ripples where the paddles meet the race
  {const r=img4('ring-foam-thick')||img4('ring-thin');if(r){const rx=D.race[0],ry=D.race[1]-8;for(let i=0;i<2;i++){const k=(now()*.5+i*.5)%1;c.save();c.globalAlpha=.45*(1-k);const w=70+k*60;c.drawImage(r,rx-w/2,ry-w*.22,w,w*.44);c.restore();}}}
  // drum + back rim stay as drawn (outside the front face); the front face (rim, spokes) turns inside its own ellipse
  const face=()=>{c.beginPath();c.ellipse(ox,oy,WH.rx*s,WH.ry*s,0,0,6.2832);};
  c.save();face();c.rect(ox+4000,oy-4000,-8000,8000);c.clip('evenodd');c.drawImage(im,hx-a.fx,hy-a.fy,a.gw,a.gh);c.restore();
  c.save();face();c.clip();one(ang,1);one(ang-WH.per,u);c.restore();
  c.save();c.translate(ox,oy);c.beginPath();c.ellipse(0,0,WH.hubR*s*1.25,WH.hubR*s,0,0,6.2832);c.clip();c.drawImage(im,-WH.cx*s,-WH.cy*s,a.gw,a.gh);c.restore();
  c.restore();}
function mill(c,p){still(c,p,'a_mill');wheel(c);}
function liveDbg(c){if(!M10.dbg)return;c.save();c.strokeStyle='rgba(255,40,60,.9)';c.lineWidth=2;for(const o of SOLIDS){c.beginPath();c.arc(o.x,o.y,o.r,0,6.2832);c.stroke();}
  c.strokeStyle='#50bef0';c.setLineDash([6,6]);const q=D.safe;c.strokeRect(q[0],q[1],q[2]-q[0],q[3]-q[1]);c.setLineDash([]);
  c.lineWidth=3;for(const z of D.zones){c.strokeStyle=z.col;c.beginPath();z.poly.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.closePath();c.stroke();}c.restore();}
function register(){
  PROP_DEFS.m10Dbg=P_({n:'Map 10 collision + zones (TEST view)',layer:'ground',w:MW+400,h:MH+400,ax:(MW+400)/2,ay:(MH+400)/2,live:liveDbg});
  for(const k in A){const a=A[k];if(k==='a_wheel')continue;
    if(k==='a_mill'){PROP_DEFS.m10_a_mill=P_({n:'Map 10 watermill + wheel',w:a.gw+80,h:a.gh,ax:a.fx,ay:a.fy,live:mill});continue;}
    if(a.ground){PROP_DEFS['m10_'+k]=P_({n:'Map 10 '+k+' (ground layer)',layer:'ground',w:a.gw,h:a.gh,ax:a.gw/2,ay:a.gh/2,live:(c,p)=>flat(c,p,k)});continue;}
    const nm=a.kind==='veg'?'Map 10 reed clump '+k:'Map 10 '+k;
    PROP_DEFS['m10_'+k]=P_({n:nm,w:a.gw,h:a.gh,ax:a.fx,ay:a.fy,live:(c,p)=>still(c,p,k)});}
  PROP_DEFS.m10Solid=P_({n:'Map 10 collision',solid:D.solids.map(([x,y,r])=>({dx:x,dy:y,r}))});}
register();
function props(){const m=(t,x,y,o)=>Object.assign({t,x:Math.round(x),y:Math.round(y),s:1,v:0,f:1,ph:0,edge:1,nc:0,m4:1},o||{});const out=[m('m10Dbg',MW/2,MH/2)],miss=[];
  const add=(t,x,y,o)=>{if(PROP_DEFS[t])out.push(m(t,x,y,o));else if(miss.indexOf(t)<0)miss.push(t);};
  for(const b of D.bridges){add('m4L1_'+b.k,b.x,b.y);add('m4L2_'+b.k,b.x,b.y,{m4sy:b.y+b.D});}
  for(const [n,x,y] of D.ford)add('m4Rf_'+n,x,y,{m4s:1});
  for(const [k,x,y] of D.fences)add('m4W_'+k.slice(4),x,y);
  for(const [k,x,y] of D.props)add(k,x,y);
  for(const [k,x,y] of D.newp)add('m10_'+k,x,y);
  out.push(m('m10Solid',0,0));M10.missing=miss;return out;}
{const o=loadPropsFor;loadPropsFor=function(zid){if(zid===ID){try{ED.source='default';}catch(e){}return props();}return o.apply(this,arguments);};}
{const o=genBG;genBG=function(zid){if(zid!==ID)return o.apply(this,arguments);LIGHTS=[];const c=document.createElement('canvas');c.width=Math.round(MW*GK);c.height=Math.round(MH*GK);const g=c.getContext('2d');g.fillStyle='#7cae58';g.fillRect(0,0,c.width,c.height);BGS=GK;
  let n=0;const go=()=>{const im=ground();if(im){g.drawImage(im,0,0,c.width,c.height);M10.groundOk=true;return;}if(++n<300)setTimeout(go,50);};M10.groundOk=false;go();return c;};}
{const o=gatesFor;gatesFor=function(zid){if(zid===ID)return [];return o.apply(this,arguments);};}
{const o=spawnEnemy;spawnEnemy=function(){if(G.zone===ID)return;return o.apply(this,arguments);};}
/* ---------- Map 3 east gate <-> Map 10 ---------- */
{const og=gatesFor;gatesFor=function(zid){const out=og.apply(this,arguments);
  try{if(zid===M3)for(const g of out)if(g&&g.to===M10P){g.open4=1;g.label='Map 10 · ทุ่งสองแคว';g.sub='Map 10 · Lv 36–40 · TEST · ออกนอก Safe Zone';}}catch(_){}return out;};}
/* load a zone the game's world list does not know (same trick as Map 4's M4.load, but the world list is matched by its 3 base maps at any size,
   since the REAL build added Maps 4-8 to it) */
function load(zid,pos){const oh=Set.prototype.has,isW=s=>s instanceof Set&&oh.call(s,'sylva_lab')&&oh.call(s,'cartroad_plains')&&oh.call(s,'astoria_capital');
  Set.prototype.has=function(v){return (v===zid)&&isW(this)?true:oh.call(this,v);};try{loadZone(zid,pos);}finally{Set.prototype.has=oh;}return G.zone===zid;}
function enter(){preload();const a=D.arrive;
  if(!load(ID,{x:a[0],y:a[1]})){M10.err.push('load failed');return false;}
  M10.on=true;M10.stats.enter++;M10.armT=now()+1.5;try{P.face=0;}catch(_){}M10.where=null;return true;}
function goMap10(){if(G.fade||G.zone!==M3||G.state!=='play')return;preload();G.fade={t:0,fn:()=>{enter();}};}
{const oT=travel;travel=function(to,how){if(to===M10P){goMap10();return;}return oT.apply(this,arguments);};}
function goBack(){if(G.fade)return;M10.stats.exit++;G.fade={t:0,fn:()=>{M10.on=false;try{loadZone(M3,{x:D.backM3[0],y:D.backM3[1]});P.face=Math.PI;saveGame();}catch(e){M10.err.push('back '+e.message);}}};}
M10.enter=()=>{if(G.zone===M3)return goMap10();};M10.goBack=goBack;
let hintT=-99;
setInterval(()=>{try{if(G.zone!==ID){M10.on=false;return;}if(!P||G.fade||G.state!=='play')return;
  const e=D.exit;if(now()>M10.armT&&P.x<e.x&&P.y>e.y0&&P.y<e.y1){goBack();return;}
  const q=D.gap;if(Math.abs(P.x-q.x)<q.hw+30&&P.y<q.y+60&&P.y>q.y-60&&now()-hintT>4){hintT=now();M10.stats.hint++;
    try{log('ประตูไปแมพ 11 ยังปิดอยู่ (ยังไม่เปิดใช้งาน)');}catch(_){}try{textAt(P.x,P.y-70,'ประตูยังปิดอยู่','#ffe08a',18,{life:1.6,vy:-22});}catch(_){}}}catch(e){if(M10.err.length<20)M10.err.push('tick '+e.message);}},100);
/* a save inside Map 10 is written as Map 3 next to its east gate (the TEST map is never stored in the save) */
{const o=saveGame;saveGame=function(){if(typeof G==='undefined'||G.zone!==ID||!P)return o.apply(this,arguments);
  const z=G.zone,x=P.x,y=P.y,had=Set.prototype.has.call(G.unlocked,ID);G.zone=M3;P.x=D.backM3[0];P.y=D.backM3[1];if(had)G.unlocked.delete(ID);M10.stats.saveRedirect++;
  try{return o.apply(this,arguments);}finally{G.zone=z;P.x=x;P.y=y;if(had)G.unlocked.add(ID);}};}
/* ---------- HUD: zone names ---------- */
function polyIn(x,y,Q){let c=false;for(let i=0,j=Q.length-1;i<Q.length;j=i++){const a=Q[i],b=Q[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
function whereText(){if(!P)return null;const q=D.safe;if(P.x>q[0]&&P.x<q[2]&&P.y>q[1]&&P.y<q[3])return {k:'s',t:'ลานมาถึง',s:'🛡 Safe Zone · ลานมาถึง',safe:1};
  for(const z of D.zones)if(polyIn(P.x,P.y,z.poly))return {k:'z'+z.id,t:z.nm,s:`แมพ 10 · ${z.nm} · Lv ${z.lv[0]}–${z.lv[1]}`};
  return {k:'r',t:null,s:'แมพ 10 · ทุ่งสองแคว'};}
{const o=updZoneTag;updZoneTag=function(){const r=o.apply(this,arguments);try{if(G.zone===ID){const w=whereText(),s=document.getElementById('zSub'),n=document.getElementById('zName');
  if(n)n.textContent='Map 10 (TEST)';if(s&&w)s.textContent=w.s;if(n)n.style.color=w&&w.safe?'#7dff9a':'';}}catch(_){}return r;};}
setInterval(()=>{try{if(G.zone!==ID||!P)return;const w=whereText();if(!w||w.k===M10.where)return;const first=M10.where==null;M10.where=w.k;updZoneTag();if(!first&&w.t)showBanner(w.t,w.s,2.2);}catch(_){}},200);
M10.whereText=whereText;
})();

