
/* ---- p278 r2 (r66; r1 = r65): Map 8 TEST map "ยอดน้ำแข็ง" Frostpeak, walk-through only (DeaRz 21 Oct 19:52 "Oksaveแล้วนำไปใช้ได้เลย" + "เริ่มส่วนต่อ ไปได้เลย";
   brief art/map8/handoff-code-map8-r1.md). A TEST sub-map of the Map 4 TEST session like Map 7; the save stays untouched.
   - no monsters, no boss, the whole map is SAFE.
   - way in: Map 7's north wall opening (x 540-660) or the TEST button "แมพ 8 ทดสอบ"; arrival at the bottom of the south road facing north.
     Walking off the south edge goes back to Map 7, just inside the north opening.
   - ground: M8 base layer 2x (same world transform as Map 7). y-sorted sprites: summit ice lantern, south gate, every placed prop.
   - two bridges are drawn over or under the hero by the art thread's per-column rule (overlay_bottom_y_1x.json):
     hero foot above the bridge's lowest painted pixel in that column = behind / under it (bridge over hero), else hero over the bridge;
     hero on the gorge deck, or up on the sky deck, is always over that bridge.
   - sky deck = level 2: the only way on / off is the summit's NW landing. Up there only the deck is walkable (collision swapped), below it
     the outer path passes under the bridge. The deck's far end (future Map 9 tower) is closed.
   - collision fixes on top of the art mask (tools/map8_r1/bake8.py): 105 tiny ray-cast specks filled, gorge deck east end opened onto the
     plateau, floor between the summit stair top posts and the plinth opened (posts drawn as base-layer cut-outs), sky-deck post notches filled.
   - r2 (art review of r65): outside the map edge is filled with the painting's sky blue #9db4d6 instead of black.
   - TEST: M4T.map8.dbg = true draws the current collision discs; ?map8=off removes the map. ---- */
(function(){'use strict';
const Q=location.search;if(/map8=off/.test(Q))return;
const M4=window.__M4T,A=window.__M8_ART,D=window.__M8_DATA;if(!M4||!M4.sub||!M4.load||!A||!D||typeof ZONES==='undefined')return;
const ID='w23_map8_test',MW=D.W,MH=D.H,GK=D.GK,T=D.T,S2=1.425,KX=D.KX,KY=D.KY;
M4.sub.add(ID);
const M8={on:false,id:ID,data:D,art:{},dbg:false,level:1,stats:{enter:0,exit:0,saveBlocked:0,gate7:0,btn:0,south:0,up:0,down:0}};M4.map8=M8;
const img=k=>{const a=A[k];if(!a)return null;if(!M8.art[k]){const i=new Image();i.decoding='async';i.src=a.src;M8.art[k]=i;}const i=M8.art[k];return i.complete&&i.naturalWidth?i:null;};
function preload(){for(const k in A)img(k);}
const now=()=>(typeof time==='number'?time:0);
ZONES[ID]={n:'Map 8 (TEST)',th:'ยอดน้ำแข็ง · แมพทดสอบ',sub:'Map 8 · TEST · ไม่บันทึกเซฟ',safe:1,fullSafe:1,w:MW,h:MH,seed:4808,ground:['#e3eaf2','#cfdae6','#f2f6fa','#9db4d6'],acc:'#cfe8ff',amb:'snow',mobs:[],density:0,areas:[],m4test:1};
try{if(typeof EDGE_THEME!=='undefined')EDGE_THEME[ID]=[];}catch(e){}
/* ---------- 1x lookups (deck / landing / gorge deck / deck distance) ---------- */
function unpack(o,bytes){const raw=atob(o.b),u=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)u[i]=raw.charCodeAt(i);o.u=u;o.bytes=bytes;return o;}
const L=D.look;unpack(L.deck);unpack(L.lz);unpack(L.gorge);unpack(L.dd,1);
function bit(o,x,y){x=Math.floor(x)-o.x0;y=Math.floor(y)-o.y0;if(x<0||y<0||x>=o.w||y>=o.h)return false;const i=y*o.w+x;return !!(o.u[i>>3]&(128>>(i&7)));}
function ddAt(x,y){const o=L.dd;x=Math.floor(x)-o.x0;y=Math.floor(y)-o.y0;if(x<0||y<0||x>=o.w||y>=o.h)return 99;return o.u[y*o.w+x];}
const f1=()=>[P.x/KX,P.y/KY];
/* ---------- sprites ---------- */
const P_=(o)=>Object.assign({cat:'m4test',w:2,h:2,ax:1,ay:1,liveOnly:1,nofade:1,draw(){}},o);
const geo=(k,s)=>{const a=A[k];return {gw:a.w2*S2*s,gh:a.h2*S2*s,fx:a.ax2*S2*s,fy:a.ay2*S2*s};};
const FADEY={gate:1085*KY};   // the gate's arch is open: it only turns see-through once the hero is north of the arch
function still(c,p,k,s,nf){const im=img(k);if(!im)return;const g=geo(k,s);let al=1;
  if(!nf&&g.gh>170){const cx=p.x-g.fx+g.gw/2,b=!!P&&Math.abs(P.x-cx)<g.gw*.45&&P.y<Math.min(p.y-6,FADEY[k]||1e9)&&P.y>p.y-g.gh/T*.95;
    p.m8al=(p.m8al==null?1:p.m8al)+((b?.55:1)-(p.m8al==null?1:p.m8al))*.15;al=p.m8al;}
  c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';if(al<1)c.globalAlpha*=al;c.drawImage(im,p.x-g.fx,p.y-g.fy,g.gw,g.gh);c.restore();}
const key=(k,s)=>'m8S_'+k+'_'+Math.round(s*1000);
/* base-layer cut-outs (summit stair top posts): drawn inside the engine's upright transform, so undo it first and draw exactly over the ground pixels */
function occ(c,p,k){const a=A[k],im=img(k);if(!im)return;const T0=camT(),th=camY();
  const behind=!!P&&P.y<p.y-4&&P.y>a.y0*KY-10&&Math.abs(P.x-p.x)<a.w1*KX*.5+10;p.m8al=(p.m8al==null?1:p.m8al)+((behind?.55:1)-(p.m8al==null?1:p.m8al))*.15;
  c.save();if(!(T0>.995&&Math.abs(th)<1e-3)){const s=CAM.persp?1+(w2s(p.x,p.y)[1]/H-.55)*(1-T0)*.5:1;c.translate(p.x,p.y);c.scale(1/s,T0/s);if(th)c.rotate(th);c.translate(-p.x,-p.y);}
  c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.globalAlpha*=p.m8al;c.drawImage(im,a.x0*KX,a.y0*KY,a.w1*KX,a.h1*KY);c.restore();}
function register(){
  for(const [k] of (D.occ||[])){const a=A[k];if(!a)continue;PROP_DEFS['m8O_'+k]=P_({n:'Map 8 base cut-out '+k,w:a.w1*KX,h:a.h1*KY,ax:a.w1*KX/2,ay:a.h1*KY,live:(c,p)=>occ(c,p,k)});}
  for(const [k,,,s] of D.props){const t=key(k,s);if(PROP_DEFS[t])continue;if(!A[k]){console.warn('[p278] missing art',k);continue;}const g=geo(k,s);
    PROP_DEFS[t]=P_({n:'Map 8 '+k,w:g.gw,h:g.gh,ax:g.fx,ay:g.fy,live:(c,p)=>still(c,p,k,s)});}
  for(const k in D.br){const g=geo(k,1);PROP_DEFS['m8B_'+k]=P_({n:'Map 8 bridge '+k,w:g.gw,h:g.gh,ax:g.fx,ay:g.fy,live:(c,p)=>still(c,p,k,1,true)});}
  PROP_DEFS.m8Dbg=P_({n:'Map 8 collision (TEST)',layer:'ground',w:MW+400,h:MH+400,ax:(MW+400)/2,ay:(MH+400)/2,live:liveDbg});
  PROP_DEFS.m8Solid=P_({n:'Map 8 collision',solid:D.solG.map(([x,y,r])=>({dx:x,dy:y,r}))});}
register();
function props(){const m=(t,x,y)=>({t,x:Math.round(x),y:Math.round(y),s:1,v:0,f:1,ph:0,edge:1,nc:0,m4:1});
  const out=[m('m8Dbg',MW/2,MH/2)];for(const [k,x,y,s] of D.props){const t=key(k,s);if(PROP_DEFS[t])out.push(m(t,x,y));}
  for(const [k,x,y] of (D.occ||[]))if(PROP_DEFS['m8O_'+k])out.push(m('m8O_'+k,x,y));
  for(const k in D.br){const q=m('m8B_'+k,D.br[k][0],D.br[k][1]);q.m8b=k;out.push(q);}out.push(m('m8Solid',0,0));return out;}
{const o=loadPropsFor;loadPropsFor=function(zid){if(zid===ID){try{ED.source='default';}catch(e){}return props();}return o.apply(this,arguments);};}
{const o=genBG;genBG=function(zid){if(zid!==ID)return o.apply(this,arguments);LIGHTS=[];const c=document.createElement('canvas');c.width=Math.round(MW*GK);c.height=Math.round(MH*GK);const g=c.getContext('2d');g.fillStyle='#9db4d6';g.fillRect(0,0,c.width,c.height);BGS=GK;
  let n=0;const go=()=>{const im=img('ground');if(im){g.drawImage(im,0,0,c.width,c.height);M8.groundOk=true;return;}if(++n<300)setTimeout(go,50);};M8.groundOk=false;go();return c;};}
{const o=gatesFor;gatesFor=function(zid){if(zid===ID)return [];return o.apply(this,arguments);};}
{const o=spawnEnemy;spawnEnemy=function(){if(G.zone===ID)return;return o.apply(this,arguments);};}

/* ---------- bridge depth: sort key next to the hero's, before or after it by the art thread's rule ---------- */
function heroOver(b){if(!P)return true;const [x,y]=f1();
  if(b==='sky'&&M8.level===2)return true;if(b==='gorge'&&bit(L.gorge,x,y))return true;
  const bot=D.bot[b][Math.max(0,Math.min(D.bot[b].length-1,Math.floor(x)))];return bot<0||y>=bot;}
{const o=depthKey;depthKey=function(e){if(e&&e.m8b&&G.zone===ID&&P){const k=o(P);return heroOver(e.m8b)?k-.5:k+.5;}return o(e);};}
/* ---------- level 2 (sky deck): swap collision while up there ---------- */
let LV2=null;
function lv2Build(){const S=[],G=new Map();for(const [x,y,r] of D.solD){const o={x,y,r};S.push(o);const pad=r+50;
  for(let gx=Math.floor((x-pad)/SCELL);gx<=Math.floor((x+pad)/SCELL);gx++)for(let gy=Math.floor((y-pad)/SCELL);gy<=Math.floor((y+pad)/SCELL);gy++){const k=gx+','+gy;let l=G.get(k);if(!l)G.set(k,l=[]);l.push(o);}}
  return {S,G};}
let GR=null;   // the ground set, kept while the hero is up
function setLevel(l){if(l===M8.level)return;if(l===2){if(!LV2)LV2=lv2Build();GR={S:SOLIDS,G:SGRID};SOLIDS=LV2.S;SGRID=LV2.G;M8.stats.up++;}
  else{if(GR){SOLIDS=GR.S;SGRID=GR.G;}GR=null;M8.stats.down++;}M8.level=l;}
function levelTick(){if(!M8.on||G.zone!==ID||!P)return;const [x,y]=f1(),lz=bit(L.lz,x,y),d=ddAt(x,y);
  if(M8.level===1){if(lz&&d<=L.sw1)setLevel(2);}
  else{if(SOLIDS!==LV2.S){GR={S:SOLIDS,G:SGRID};SOLIDS=LV2.S;SGRID=LV2.G;}   // something rebuilt the solids: keep the deck set
    if(lz&&d>L.sw2)setLevel(1);}}
/* ---------- way in (Map 7 north opening / TEST button) and back (south edge) ---------- */
function enter(pos,face){preload();
  if(!M4.load(ID,{x:pos[0],y:pos[1]})){console.warn('[p278] Map 8 did not load');return false;}
  M8.level=1;GR=null;M8.on=true;M8.stats.enter++;M8.armT=now()+1.5;if(M8.z0==null)M8.z0=CAM.zt;CAM.zt=.7;try{P.face=face==null?-Math.PI/2:face;}catch(_){}return true;}
function leaveClean(){if(M8.on&&M8.z0!=null){CAM.zt=M8.z0;M8.z0=null;}M8.on=false;M8.level=1;GR=null;}
M8.leave=leaveClean;M8.enter=enter;M8.setLevel=setLevel;
function leaveSub(){try{const M7=M4.map7;if(M7&&G.zone===M7.id)M7.leave();else if(M4.map6&&G.zone===M4.map6.id)M4.map6.leave();else if(M4.map5&&M4.map5.leave)M4.map5.leave();}catch(e){}}
function goMap8(){if(G.fade||!M4.on)return false;preload();const M7=M4.map7;
  G.fade={t:0,fn:()=>{leaveSub();if(!enter(D.arrive,-Math.PI/2)&&M7){try{M7.enter(D.back7,Math.PI/2);}catch(e){}}}};return true;}
function goBack(){const M7=M4.map7;if(G.fade||!M7)return;M8.stats.south++;G.fade={t:0,fn:()=>{leaveClean();M8.stats.exit++;try{M7.enter(D.back7,Math.PI/2);}catch(e){console.warn('[p278] back to Map 7',e);}}};}
M4.goMap8=goMap8;M8.goBack=goBack;
const SKY='#9db4d6';   // r2: outside the map = the painting's sky blue (was black)
setInterval(()=>{try{if(M8.bgSet&&G.zone!==ID){if(window.EDGE_BG===SKY)window.EDGE_BG=M8.bg0===SKY?null:M8.bg0;M8.bgSet=0;}if(M8.on&&G.zone!==ID&&!G.fade)leaveClean();if(!P||G.fade||G.state!=='play')return;
  if(G.zone===ID){if(window.EDGE_BG!==SKY){M8.bg0=window.EDGE_BG;window.EDGE_BG=SKY;M8.bgSet=1;}levelTick();if(now()>M8.armT&&P.y>D.exitY&&P.x>D.exitX[0]&&P.x<D.exitX[1]&&M8.level===1)goBack();return;}
  const M7=M4.map7,q=D.gate7;if(M7&&M7.on&&G.zone===M7.id&&now()>(M7.armT||0)&&P.x>q.x0&&P.x<q.x1&&P.y<q.y){M8.stats.gate7++;goMap8();}}catch(e){}},40);   // into Map 7's north wall opening
/* TEST button (TEST tray, next to the Map 7 button): through the Map 4 TEST session, so the save is held the same way */
function btn(){const row=document.getElementById('hudTrayRow');if(!row)return;let b=document.getElementById('m8TestBtn');
  if(!b){b=document.createElement('button');b.type='button';b.className='tbtn';b.id='m8TestBtn';row.appendChild(b);
    b.addEventListener('click',()=>{try{window.HUDV177&&HUDV177.closeAll();}catch(e){}M8.stats.btn++;
      if(M4.on){goMap8();return;}if(!M4.enter())return;let n=0;const iv=setInterval(()=>{if(++n>100){clearInterval(iv);return;}if(G.zone===M4.id&&!G.fade){clearInterval(iv);goMap8();}},100);});}
  const show=G.zone!==ID,t='แมพ 8 ทดสอบ (ยอดน้ำแข็ง)';if(b.textContent!==t)b.textContent=t;b.style.display=show?'':'none';const b7=document.getElementById('m7TestBtn');if(b7&&G.zone===ID)b7.style.display='none';}
setInterval(()=>{try{btn();}catch(e){}},300);
{const o=updZoneTag;updZoneTag=function(){const r=o.apply(this,arguments);try{if(G.zone===ID){const s=document.getElementById('zSub'),n=document.getElementById('zName');
  if(n){n.textContent='Map 8 (TEST)';n.style.color='#7dff9a';}if(s)s.textContent='🛡 Safe Zone · ยอดน้ำแข็ง';}}catch(_){}return r;};}
function liveDbg(c){if(!M8.dbg&&!(M4.zones&&M4.zones.lines))return;c.save();const up=M8.level===2;c.fillStyle=up?'rgba(60,140,255,.30)':'rgba(255,40,60,.28)';c.strokeStyle=up?'rgba(60,140,255,.9)':'rgba(255,40,60,.85)';c.lineWidth=1.5;
  for(const o of SOLIDS){c.beginPath();c.arc(o.x,o.y,o.r,0,6.2832);c.fill();c.stroke();}c.restore();}
})();
