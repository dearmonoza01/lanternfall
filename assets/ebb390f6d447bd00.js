
/* ---- p277 r2 (r61): Map 7 TEST map "ปราสาทหิมะ" Frost Castle, walk-through only (DeaRz 21 Oct 07:58 "ถ้าแมพเสร็จแล้วผมขอเข้าไปเทสด้วยนะ";
   brief art/map7/handoff-code-map7-r1.md). A TEST sub-map of the Map 4 TEST session like Map 5 / Map 6 / Cave 1; the save stays untouched.
   - no monsters, the whole map is SAFE.
   - way in: Map 6's north ice gate (walk up to it, fade) or the TEST button "แมพ 7 ทดสอบ"; arrival at the bottom of the south road facing north.
     Walking off the south edge goes back to Map 6, just south of the ice gate.
   - ground: F3 base layer v3 + F7/F8 snow bases baked into one image (tools/map7_r1/bake7.py). World = 1x x 2.85 and y / 0.866, so with the
     game's tilted camera the painting keeps the approved proportions on screen (nothing squashed).
   - live sprites (y-sorted at their bottom-centre foot): palace, south gatehouse, big crystal fountain, 2 court fountains and every placed prop from
     DeaRz's editor layout (F5 lamps / planters / benches / banners / pier lamps / garden beds, F7 market, F8 buildings), 2x art at x1.425, uniform scale.
     Tall pieces turn 55 % see-through while the hero stands behind them (the gatehouse only north of its open arch, under its roof).
   - collision: map7_walkmask_v1 (art thread) turned into discs along every edge of the non-walkable area (walls, towers, palace, gate towers, pool,
     fountains, buildings, stalls, lamps, planters, benches, hedges); stairs walkable.
   - camera zoom 0.7 while here (as Map 6), restored on leaving.
   - also: balance Map 7 ATK rule (balance/map7_r1/MAP7_monsters_DRAFT_r1.md): monster ATK x (1 + 0.045 x (L - 30)) for L > 30 only, all roles,
     Lv 1-30 unchanged; ?m7atk=off = r59 values.
   - r2 (DeaRz 21 Oct 09:00 "เช็คและแก้ ทุกด้าน" + the palace stair post): nothing painted in the base layer can be stood on any more:
     code mask r2 = art mask v1 minus every wall / tower / post / hedge extended 12 px north (merlons, caps, post tops) + NW/NE tower roofs,
     palace front stair posts, south-wall tower caps; the 2 tower roofs over the upper walkway are base-layer cut-outs drawn y-sorted at the
     tower foot, so the hero walks behind them (55 % see-through while behind). ?m7occ=off = no cut-outs.
   - TEST: M4T.map7.dbg = true draws the collision discs; ?map7=off removes the map. ---- */
(function(){'use strict';
const Q=location.search;
/* ---------- balance: ATK above Lv 30 (no Map 7 monsters yet; applies wherever a Lv 31+ monster is made) ---------- */
const ATK7=window.__M7ATK={on:!/m7atk=off/.test(Q),k:.045,done:false,err:null};
function atkPatch(){if(!ATK7.on||ATK7.done)return true;const a=window.C182&&C182.api,D=a&&a.D&&a.D();if(!D||!D.mon||!D.mon._bal1)return false;
  for(const role in D.mon.atk){const t=D.mon.atk[role];for(let i=30;i<t.length;i++)t[i]=Math.round(t[i]*(1+ATK7.k*(i+1-30))*100)/100;}ATK7.done=true;return true;}
try{if(!atkPatch()){let n=0;const iv=setInterval(()=>{try{if(atkPatch()||++n>600)clearInterval(iv);}catch(e){ATK7.err=e.message;clearInterval(iv);}},50);}}catch(e){ATK7.err=e.message;}
try{const _mk=makeEnemy;makeEnemy=function(){try{atkPatch();}catch(_){}return _mk.apply(this,arguments);};}catch(e){ATK7.err=e.message;}
if(/map7=off/.test(Q))return;
const M4=window.__M4T,A=window.__M7_ART,D=window.__M7_DATA;if(!M4||!M4.sub||!M4.load||!A||!D||typeof ZONES==='undefined')return;
const ID='w23_map7_test',MW=D.W,MH=D.H,GK=((/[?&]m7gk=([0-9.]+)/.exec(location.search)||[])[1]*1)||(/[?&]m7tiles=off\b/.test(location.search)?D.GK:1),T=D.T,S2=1.425;/* r40: Map 7 ground baked at GK 1 (full res); ?m7tiles=off = old GK 0.70 bake; ?m7gk=N override */
M4.sub.add(ID);
const M7={on:false,id:ID,data:D,art:{},dbg:false,stats:{enter:0,exit:0,saveBlocked:0,gate6:0,btn:0,south:0}};M4.map7=M7;
const img=k=>{const a=A[k];if(!a)return null;if(!M7.art[k]){const i=new Image();i.decoding='async';i.src=a.src;M7.art[k]=i;}const i=M7.art[k];return i.complete&&i.naturalWidth?i:null;};
function preload(){for(const k in A)img(k);}
const now=()=>(typeof time==='number'?time:0);
ZONES[ID]={n:'Map 7 (TEST)',th:'ปราสาทหิมะ · แมพทดสอบ',sub:'Map 7 · TEST · ไม่บันทึกเซฟ',safe:1,fullSafe:1,w:MW,h:MH,seed:4707,ground:['#e3eaf2','#cfdae6','#f2f6fa','#b9c8d8'],acc:'#cfe8ff',amb:'mote',mobs:[],density:0,areas:[],m4test:1};
try{if(typeof EDGE_THEME!=='undefined')EDGE_THEME[ID]=[];}catch(e){}
/* ---------- sprites ---------- */
const P_=(o)=>Object.assign({cat:'m4test',w:2,h:2,ax:1,ay:1,liveOnly:1,nofade:1,draw(){}},o);
const geo=(k,s)=>{const a=A[k];return {gw:a.w2*S2*s,gh:a.h2*S2*s,fx:a.ax2*S2*s,fy:a.ay2*S2*s};};
const FADEY={gate:1150*D.KY};   // gatehouse: its arch is open, so it only turns see-through north of the arch's visible part (under its roof / behind it)
function still(c,p,k,s){const im=img(k);if(!im)return;const g=geo(k,s);let al=1;
  if(g.gh>170){const cx=p.x-g.fx+g.gw/2,b=!!P&&Math.abs(P.x-cx)<g.gw*.45&&P.y<Math.min(p.y-6,FADEY[k]||1e9)&&P.y>p.y-g.gh/T*.95;
    p.m7al=(p.m7al==null?1:p.m7al)+((b?.55:1)-(p.m7al==null?1:p.m7al))*.15;al=p.m7al;}
  c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';if(al<1)c.globalAlpha*=al;c.drawImage(im,p.x-g.fx,p.y-g.fy,g.gw,g.gh);c.restore();}
const key=(k,s)=>'m7S_'+k+'_'+Math.round(s*1000);
/* base-layer cut-outs (r2): drawn inside the engine's upright transform, so undo it first and draw exactly where the ground shows the same pixels */
const OCCOFF=/m7occ=off/.test(Q);
function occ(c,p,k){const a=A[k],im=img(k);if(!im)return;const T0=camT(),th=camY();
  const behind=!!P&&P.y<p.y-4&&P.y>a.y0*D.KY-10&&Math.abs(P.x-p.x)<a.w1*D.KX*.5+10;p.m7al=(p.m7al==null?1:p.m7al)+((behind?.55:1)-(p.m7al==null?1:p.m7al))*.15;
  c.save();if(!(T0>.995&&Math.abs(th)<1e-3)){const s=CAM.persp?1+(w2s(p.x,p.y)[1]/H-.55)*(1-T0)*.5:1;c.translate(p.x,p.y);c.scale(1/s,T0/s);if(th)c.rotate(th);c.translate(-p.x,-p.y);}
  c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.globalAlpha*=p.m7al;c.drawImage(im,a.x0*D.KX,a.y0*D.KY,a.w1*D.KX,a.h1*D.KY);c.restore();}
function register(){
  for(const [k,,,s] of D.props){const t=key(k,s);if(PROP_DEFS[t])continue;if(!A[k]){console.warn('[p277] missing art',k);continue;}const g=geo(k,s);
    PROP_DEFS[t]=P_({n:'Map 7 '+k,w:g.gw,h:g.gh,ax:g.fx,ay:g.fy,live:(c,p)=>still(c,p,k,s)});}
  for(const [k] of (D.occ||[])){const a=A[k];if(!a)continue;PROP_DEFS['m7O_'+k]=P_({n:'Map 7 base cut-out '+k,w:a.w1*D.KX,h:a.h1*D.KY,ax:a.w1*D.KX/2,ay:a.h1*D.KY,live:(c,p)=>occ(c,p,k)});}
  PROP_DEFS.m7Dbg=P_({n:'Map 7 collision (TEST)',layer:'ground',w:MW+400,h:MH+400,ax:(MW+400)/2,ay:(MH+400)/2,live:liveDbg});
  PROP_DEFS.m7Solid=P_({n:'Map 7 collision',solid:D.solids.map(([x,y,r])=>({dx:x,dy:y,r}))});}
register();
function props(){const m=(t,x,y)=>({t,x:Math.round(x),y:Math.round(y),s:1,v:0,f:1,ph:0,edge:1,nc:0,m4:1});
  const out=[m('m7Dbg',MW/2,MH/2)];for(const [k,x,y,s] of D.props){const t=key(k,s);if(PROP_DEFS[t])out.push(m(t,x,y));}if(!OCCOFF)for(const [k,x,y] of (D.occ||[]))if(PROP_DEFS['m7O_'+k])out.push(m('m7O_'+k,x,y));out.push(m('m7Solid',0,0));return out;}
{const o=loadPropsFor;loadPropsFor=function(zid){if(zid===ID){try{ED.source='default';}catch(e){}return props();}return o.apply(this,arguments);};}
{const o=genBG;genBG=function(zid){if(zid!==ID)return o.apply(this,arguments);LIGHTS=[];const c=document.createElement('canvas');c.width=Math.round(MW*GK);c.height=Math.round(MH*GK);const g=c.getContext('2d');g.fillStyle='#dfe7ef';g.fillRect(0,0,c.width,c.height);BGS=GK;
  let n=0;const go=()=>{const im=img('ground');if(im){g.drawImage(im,0,0,c.width,c.height);M7.groundOk=true;return;}if(++n<300)setTimeout(go,50);};M7.groundOk=false;go();return c;};}
{const o=gatesFor;gatesFor=function(zid){if(zid===ID)return [];return o.apply(this,arguments);};}
{const o=spawnEnemy;spawnEnemy=function(){if(G.zone===ID)return;return o.apply(this,arguments);};}

/* ---------- way in (Map 6 north ice gate / TEST button) and back (south edge) ---------- */
function enter(pos,face){preload();
  if(!M4.load(ID,{x:pos[0],y:pos[1]})){console.warn('[p277] Map 7 did not load');return false;}
  M7.on=true;M7.stats.enter++;M7.armT=now()+1.5;if(M7.z0==null)M7.z0=CAM.zt;CAM.zt=.7;try{P.face=face==null?-Math.PI/2:face;}catch(_){}M7.where=null;return true;}
function leaveClean(){if(M7.on&&M7.z0!=null){CAM.zt=M7.z0;M7.z0=null;}M7.on=false;}
M7.leave=leaveClean;M7.enter=enter;
function leaveSub(){try{if(M4.map6&&G.zone===M4.map6.id)M4.map6.leave();else if(M4.map5&&M4.map5.leave)M4.map5.leave();}catch(e){}}
function goMap7(){if(G.fade||!M4.on)return false;preload();const M6=M4.map6;
  G.fade={t:0,fn:()=>{leaveSub();if(!enter(D.arrive,-Math.PI/2)&&M6){try{M6.enter(D.back6,Math.PI/2);}catch(e){}}}};return true;}
function goBack(){const M6=M4.map6;if(G.fade||!M6)return;M7.stats.south++;G.fade={t:0,fn:()=>{leaveClean();M7.stats.exit++;try{M6.enter(D.back6,Math.PI/2);}catch(e){console.warn('[p277] back to Map 6',e);}}};}
M4.goMap7=goMap7;M7.goBack=goBack;
setInterval(()=>{try{if(M7.on&&G.zone!==ID&&!G.fade)leaveClean();if(!P||G.fade||G.state!=='play')return;
  if(G.zone===ID){if(now()>M7.armT&&P.y>D.exitY)goBack();return;}
  const M6=M4.map6,q=D.gate6;if(M6&&M6.on&&G.zone===M6.id&&now()>(M6.armT||0)&&Math.abs(P.x-q.x)<q.hw&&P.y<q.y+q.dy){M7.stats.gate6++;goMap7();}}catch(e){}},100);   // into Map 6's north ice gate
/* TEST button (in the TEST tray next to the Map 4 button): goes through the Map 4 TEST session, so the save is held the same way */
function btn(){const row=document.getElementById('hudTrayRow');if(!row)return;let b=document.getElementById('m7TestBtn');
  if(!b){b=document.createElement('button');b.type='button';b.className='tbtn';b.id='m7TestBtn';row.appendChild(b);
    b.addEventListener('click',()=>{try{window.HUDV177&&HUDV177.closeAll();}catch(e){}M7.stats.btn++;
      if(M4.on){goMap7();return;}if(!M4.enter())return;let n=0;const iv=setInterval(()=>{if(++n>100){clearInterval(iv);return;}if(G.zone===M4.id&&!G.fade){clearInterval(iv);goMap7();}},100);});}
  const show=G.zone!==ID,t='แมพ 7 ทดสอบ (ปราสาทหิมะ)';if(b.textContent!==t)b.textContent=t;b.style.display=show?'':'none';}
setInterval(()=>{try{btn();}catch(e){}},700);
/* HUD zone name */
{const o=updZoneTag;updZoneTag=function(){const r=o.apply(this,arguments);try{if(G.zone===ID){const s=document.getElementById('zSub'),n=document.getElementById('zName');
  if(n){n.textContent='Map 7 (TEST)';n.style.color='#7dff9a';}if(s)s.textContent='🛡 Safe Zone · ปราสาทหิมะ';}}catch(_){}return r;};}
/* TEST: collision discs (M7.dbg, or the Map 4 TEST button "แสดงเส้นโซน") */
function liveDbg(c){if(!M7.dbg&&!(M4.zones&&M4.zones.lines))return;c.save();c.fillStyle='rgba(255,40,60,.28)';c.strokeStyle='rgba(255,40,60,.85)';c.lineWidth=1.5;
  for(const o of SOLIDS){c.beginPath();c.arc(o.x,o.y,o.r,0,6.2832);c.fill();c.stroke();}c.restore();}
})();
