
/* ---- map11-r1 (TEST, 11 Nov 2026): Map 11 (5496 x 4580, size approved by DeaRz) - ground only for now ----
   * 16 ground JPG tiles (Art) streamed: only the tiles that touch the view are decoded and drawn each frame (LRU, at most 6 decoded at a time); a small 1/8 overview bake of the whole map (BG, ~690 x 575) is kept for the minimap and as the fallback while a tile decodes. Needs the base hook window.__TILEBG in render();
   * collision = Art's walk map r2 (green walk, grey blocked, blue water blocked; both wooden bridges walkable) sampled at half resolution (2748 x 2290, 6.3 MB) with the hero's circle (12.8 px) tested at centre + 8 points, axis sliding;
   * exits: W road (y 1980-2280) -> Map 10 (w24_map10_test); E road (y 2000-2240) -> Map 12 W stub (linked both ways); S closed; stubs show a toast if the target does not exist;
   * no monsters yet (spawnEnemy blocked in this zone until Balance gives a roster), no props yet (M11P1 props come later, scale about 2.0);
   * entry: TEST button (?gm=on) or window.__MAP11.enter(); ?map11=off disables. Debug: window.__MAP11 ---- */
(function(){'use strict';
const Q=String(location.search),OFF=/[?&]map11=off\b/.test(Q),ZID='map11',TD=window.__M11_TILES,MK=window.__M11_MASK,HR=12.8;
const M=window.__MAP11={ver:'map11-r2',on:!OFF,err:null,ready:false,ZID,stats:{drawn:0,slide:0,revert:0,toasts:0,maxLive:0,decodes:0,evict:0},log:[]};
if(OFF||!TD||!MK){if(!OFF)M.err='data missing';return}
/* r2 (Art + DeaRz 11 Nov): the 5496 x 4580 ground is too big for the hero (painted plants ~2x hero height): default world scale K = 3600/5496 = 0.655 -> 3600 x 3000, the same 16 tiles drawn scaled (no new art), walk map / exits / spawn scaled equally; ?m11scale=1 keeps the original 5496 x 4580 */
const K=/[?&]m11scale=1\b/.test(Q)?1:3600/5496,OW=TD.W,OH=TD.H,GW=Math.round(OW*K),GH=Math.round(OH*K);M.W=GW;M.H=GH;M.K=K;
/* walk map: at the default 3600 scale Art's walk r3 (3600 x 3000, blocks 61 painted plants / rocks) is used as is; with ?m11scale=1 the original 5496 r2 map is used (no plant blocks) */
const M3=window.__M11_MASK3,USE3=K!==1&&!!M3,SW=USE3?M3.w:OW,SH=USE3?M3.h:OH,KS=USE3?1:K;M.mask=USE3?'r3 (3600)':'r2 ('+OW+')';
const ERR=(w,e)=>{M.err=w+': '+((e&&e.message)||e);try{console.error('[MAP11]',w,e)}catch(_){}};
/* ---------- walk mask (half resolution) ---------- */
let WALK=null;const MW=Math.ceil(SW/2),MH=Math.ceil(SH/2);
(function(){const im=new Image();im.onload=()=>{try{const c=document.createElement('canvas');c.width=MW;c.height=MH;const g=c.getContext('2d',{willReadFrequently:true});g.imageSmoothingEnabled=false;g.drawImage(im,0,0,SW,SH,0,0,MW,MH);const d=g.getImageData(0,0,MW,MH).data,w=new Uint8Array(MW*MH);
    for(let i=0,j=0;j<w.length;i+=4,j++){const r=d[i],gg=d[i+1],b=d[i+2];w[j]=(gg>r+60&&gg>b+60)?1:0}
    WALK=w;M.walk=w;M.ready=true;im.onerror=null;im.src=''}catch(e){ERR('mask',e)}};im.onerror=()=>ERR('mask img','load');im.src=USE3?M3.walk:MK.walk})();
const wk=(x,y)=>{if(!WALK)return true;if(x<0||y<0||x>=GW||y>=GH)return false;const ox=(x/KS)|0,oy=(y/KS)|0;return WALK[(oy>>1)*MW+(ox>>1)]===1};
const DIRS=[[1,0],[.7071,.7071],[0,1],[-.7071,.7071],[-1,0],[-.7071,-.7071],[0,-1],[.7071,-.7071]];
function walkR(x,y,r){if(!WALK)return true;if(!wk(x,y))return false;if(r>0)for(const d of DIRS)if(!wk(x+d[0]*r,y+d[1]*r))return false;return true}
M.walkR=walkR;M.wk=wk;
/* ---------- tile streaming ---------- */
const TILES=TD.tiles.map((t,i)=>Object.assign({i,img:null,ok:false,last:0},t,{x:t.x*K,y:t.y*K,w:t.w*K,h:t.h*K}));let frameNo=0;
function want(t){t.last=frameNo;if(!t.img){t.img=new Image();t.img.decoding='async';t.img.onload=()=>{t.ok=true;M.stats.decodes++;try{lowres(t)}catch(_){}};t.img.src=t.src}return t.ok}
let LOW=null;const LS=.125;
function lowres(t){if(!LOW)return;const g=LOW.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(t.img,t.x*LS,t.y*LS,t.w*LS+1,t.h*LS+1)}
function evict(){const live=TILES.filter(t=>t.img);M.stats.maxLive=Math.max(M.stats.maxLive,live.length);if(live.length<=6)return;live.sort((a,b)=>a.last-b.last);for(const t of live){if(TILES.filter(q=>q.img).length<=6)break;if(frameNo-t.last>90){try{t.img.onload=null;t.img.src=''}catch(_){}t.img=null;t.ok=false;M.stats.evict++}}}
window.__TILEBG={zone:ZID,draw(ctx,bx,by,w,h){frameNo++;M.stats.drawn++;
  for(const t of TILES){if(t.x>bx+w||t.x+t.w<bx||t.y>by+h||t.y+t.h<by)continue;
    const ok=want(t);const x0=Math.max(bx,t.x),y0=Math.max(by,t.y),x1=Math.min(bx+w,t.x+t.w),y1=Math.min(by+h,t.y+t.h);if(x1<=x0||y1<=y0)continue;
    if(ok)ctx.drawImage(t.img,(x0-t.x)/K,(y0-t.y)/K,(x1-x0)/K,(y1-y0)/K,x0,y0,x1-x0+.6,y1-y0+.6);
    else if(LOW)ctx.drawImage(LOW,x0*LS,y0*LS,(x1-x0)*LS,(y1-y0)*LS,x0,y0,x1-x0,y1-y0)}
  if(frameNo%60===0)evict()}};
/* overview bake: every tile is decoded ONCE, one at a time, drawn at 1/8 scale and released (peak = one tile) */
function bakeAll(){let i=0;M.baked=false;const next=()=>{if(i>=TILES.length){M.baked=true;return}const t=TILES[i++];if(t.ok){setTimeout(next,0);return}const im=new Image();im.onload=()=>{try{lowres({x:t.x,y:t.y,w:t.w,h:t.h,img:im})}catch(_){}im.onload=null;im.src='';setTimeout(next,40)};im.onerror=()=>setTimeout(next,40);im.src=t.src};next()}
/* ---------- zone ---------- */
ZONES[ZID]={n:'Map 11',th:'Map 11',sub:'Map 11 · TEST · ground only',safe:0,fullSafe:0,w:GW,h:GH,seed:1111,ground:['#4d6b3a','#58783f','#46633a','#3f5a34'],acc:'#d7e8b0',amb:'mote',mobs:[],density:0,areas:[],map11:1};
{const _g=genBG;genBG=function(zid){if(zid!==ZID)return _g.apply(this,arguments);BGS=LS;LIGHTS=[];const c=document.createElement('canvas');c.width=Math.ceil(GW*LS);c.height=Math.ceil(GH*LS);const g=c.getContext('2d');g.fillStyle='#4d6b3a';g.fillRect(0,0,c.width,c.height);LOW=c;M.low=c;for(const t of TILES)if(t.ok)lowres(t);bakeAll();return c}}
{const _f=gatesFor;gatesFor=function(zid){if(zid===ZID)return [];return _f.apply(this,arguments)}}
{const _e=edgeProps;edgeProps=function(zid){const r=_e.apply(this,arguments);return zid===ZID?[]:r}}
{const _l=loadPropsFor;loadPropsFor=function(zid){if(zid===ZID)return [];return _l.apply(this,arguments)}}
/* r9: no longer 'temporary' - this zone has no engine spawn areas (the engine spawner throws on a.x), the monsters come from __FARM (glue_desert); the guard stays so loadZone does not hit the engine spawner */
{const _s=spawnEnemy;spawnEnemy=function(){if(G.zone===ZID)return;return _s.apply(this,arguments)}}
/* ---------- collision ---------- */
{const _b=blocked;blocked=function(x,y,r){if(G.zone===ZID)return !walkR(x,y,Math.min(r||0,HR*1.2));return _b.apply(this,arguments)}}
{const o=updPlayer;updPlayer=function(){if(G.zone!==ZID||!WALK||!P)return o.apply(this,arguments);const x0=P.x,y0=P.y,ok0=walkR(x0,y0,HR);const r=o.apply(this,arguments);
  try{if(ok0&&!walkR(P.x,P.y,HR)){const x1=P.x,y1=P.y;if(walkR(x1,y0,HR)){P.y=y0;M.stats.slide++}else if(walkR(x0,y1,HR)){P.x=x0;M.stats.slide++}else{P.x=x0;P.y=y0;M.stats.revert++}}
    if(!walkR(P.x,P.y,HR*.5)&&ok0){P.x=x0;P.y=y0}}catch(e){ERR('slide',e)}return r}}
/* zone banner: updZoneTag shows 'Safe Zone' for every zone without a level range; Map 11 is a field map (safe:0, fullSafe:0), so the sub-line says so (cosmetic only - no safe-zone logic reads this text) */
{const _z=updZoneTag;updZoneTag=function(){const r=_z.apply(this,arguments);try{if(G.zone===ZID){const s=document.getElementById('zSub');if(s)s.textContent='Map 11 · พื้นที่ฟาร์ม (ยังไม่มีมอนสเตอร์)'}}catch(_){}return r}}
/* ---------- p148 redirect bypass for map11 ---------- */
{const _l=loadZone;loadZone=function(zid){if(zid!==ZID)return _l.apply(this,arguments);const h=Set.prototype.has;Set.prototype.has=function(v){return v===ZID?true:h.call(this,v)};try{return _l.apply(this,arguments)}finally{Set.prototype.has=h}}}
{const _t=travel;travel=function(to){if(to!==ZID)return _t.apply(this,arguments);const h=Set.prototype.has;Set.prototype.has=function(v){return v===ZID?true:h.call(this,v)};try{return _t.apply(this,arguments)}finally{Set.prototype.has=h}}}
/* ---------- exits ---------- */
const MAP10='w24_map10_test';let exitT=0;
function freeNear(x,y){for(let r=0;r<500;r+=12)for(let a=0;a<6.283;a+=.3){const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;if(walkR(px,py,HR))return {x:px,y:py}}return {x,y}}
M.enter=function(where){try{const p=where==='E'?freeNear(GW-90,2120*K):freeNear(110,2130*K);G.unlocked&&G.unlocked.add&&G.unlocked.add(ZID);loadZone(ZID,p);return G.zone}catch(e){ERR('enter',e);return null}};
function toast(w){exitT=3;M.stats.toasts++;M.lastExit=w;try{textAt(P.x,P.y-62,w,'#d7e8b0',14)}catch(_){}try{log(w,'w')}catch(_){}}
{const o=update;update=function(dt){const r=o.apply(this,arguments);try{if(G.zone===ZID&&G.state==='play'&&P&&WALK){exitT-=dt;const X=P.x,Y=P.y;
   if(exitT<=0){if(X<44&&Y>(USE3?1300:1960*K)&&Y<(USE3?1500:2300*K)){if(ZONES[MAP10]){exitT=3;M.stats.toMap10=(M.stats.toMap10||0)+1;try{const Z=ZONES[MAP10],p={x:Z.w-110,y:Math.round(Z.h/2)};let q=p;try{if(!blocked(p.x,p.y,16))q=p;else{outer:for(let rr=16;rr<600;rr+=16)for(let a=0;a<6.28;a+=.35){const x=p.x+Math.cos(a)*rr,y=p.y+Math.sin(a)*rr;if(x>60&&y>60&&x<Z.w-60&&y<Z.h-60&&!blocked(x,y,16)){q={x,y};break outer}}}}catch(_){}G.unlocked&&G.unlocked.add&&G.unlocked.add(MAP10);const h=Set.prototype.has;Set.prototype.has=function(v){return v===MAP10?true:h.call(this,v)};try{loadZone(MAP10,q)}finally{Set.prototype.has=h}}catch(e){ERR('to10',e)}}else toast('ทางไปแมพ 10 — ยังไม่เปิด')}
    else if(X>GW-44&&Y>(USE3?1300:1980*K)&&Y<(USE3?1475:2260*K)){if(window.__MAP12&&ZONES.map12){exitT=3;M.stats.toMap12=(M.stats.toMap12||0)+1;try{__MAP12.enter({x:70,y:1358})}catch(e){ERR('to12',e)}}else toast('ทางไปแมพ 12 — ยังไม่เปิด')}
    else if(Y>GH-44){toast('ทางใต้ปิดอยู่')}}}}catch(e){ERR('exit',e)}return r}}
/* map 12 W stub -> here */
try{if(window.__MAP12){__MAP12.links=__MAP12.links||{};__MAP12.links.W=()=>{try{M.enter('E')}catch(e){ERR('from12',e)}}}}catch(e){ERR('link12',e)}
{const _s=saveGame;saveGame=function(){if(G.zone===ZID){const z=G.zone,x=P.x,y=P.y;G.zone='sylva_lab';P.x=2350;P.y=1650;try{return _s.apply(this,arguments)}finally{G.zone=z;P.x=x;P.y=y}}return _s.apply(this,arguments)}}
if(/[?&]gm=on\b/.test(Q)){const add=()=>{try{if(document.getElementById('m11Btn'))return;const b=document.createElement('button');b.id='m11Btn';b.textContent='Map 11 TEST';b.style.cssText='position:fixed;left:8px;top:230px;z-index:8000;padding:7px 12px;border-radius:10px;border:1px solid #d7e8b0;background:rgba(30,50,20,.92);color:#e8f6c8;font:700 14px system-ui,sans-serif;cursor:pointer';b.addEventListener('click',e=>{e.stopPropagation();M.enter()});document.body.appendChild(b)}catch(e){ERR('btn',e)}};if(document.body)add();else document.addEventListener('DOMContentLoaded',add);setTimeout(add,1500)}
console.info('[MAP11] ready: '+TILES.length+' tiles');
})();
