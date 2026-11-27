
/* ---- map12-r1 (TEST, 11 Nov 2026): Map 12 "Sunscar Caravan Bazaar" (catfolk safe town), ground r3 + DeaRz's own prop layout + Art's collision r2 ----
   * zone id 'map12', 3200 x 2602, SAFE ZONE (safe + fullSafe, no monsters: spawnEnemy is blocked here; FARM / mobchase never see the zone);
   * ground = ONE replaceable blob (window.__M12_GROUND, ground r3, WebP): to swap tiles later only that blob (map12_ground.js) changes;
   * props = DeaRz's layout exactly as he placed it (47 items, bottom-centre anchor, size = png x scale, flip), depth-sorted by feet y like every prop; bushes follow the grass standard (__GSTD picks them by name: walk-through, never see-through);
   * collision = Art's map12_collision_with_props_r2.png (walk map + solid footprints of the 47 props; black and pond water = blocked; bushes and stage_stair are walkable). Not a disc grid: the hero (collide radius 16 x 0.8 = 12.8 px) is tested against the mask at its centre + 8 points on its circle after every movement step, with axis sliding;
   * stage_stair = walkable link from the ring road onto the drum-stage island (it is walkable in Art's mask);
   * gate pillars (x 1235-1452 and 1745-1962): blocked from y 2400; behind them (hero y < 2420) they are drawn again over the hero (occluder crop of the ground art);
   * exits W -> Map 11, E -> Map 13, S -> Map 15: blocked gate stubs (toast "ยังไม่เปิด"; Map 11 link comes with map11);
   * entry: TEST button (?gm=on) or window.__MAP12.enter(); ?map12=off disables everything. Debug: window.__MAP12 (walkR, enter, bfs, dist ...). ---- */
(function(){'use strict';
const Q=String(location.search),OFF=/[?&]map12=off\b/.test(Q),ZID='map12',GW=3200,GH=2602,HR=12.8;
const M=window.__MAP12={ver:'map12-r1',on:!OFF,err:null,ready:false,ZID,W:GW,H:GH,exits:{},stats:{slide:0,revert:0,exitToasts:0},log:[],links:{}};
const ART=window.__M12_PROPS,LAY=window.__M12_LAYOUT,MASK=window.__M12_MASK,GR=window.__M12_GROUND;
if(OFF||!ART||!LAY||!MASK||!GR){if(!OFF)M.err='data missing';return}
const ERR=(w,e)=>{M.err=w+': '+((e&&e.message)||e);try{console.error('[MAP12]',w,e)}catch(_){}};
/* ---------- walk mask ---------- */
const EXTRA=[];M.extra=EXTRA;   /* r4: the Art foot-band extension (+6 px, down to the feet y) is now built into the collision mask at the corrected positions */
let WALK=null;
function loadMask(){const im=new Image();im.onload=()=>{try{const c=document.createElement('canvas');c.width=GW;c.height=GH;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0);const d=g.getImageData(0,0,GW,GH).data,w=new Uint8Array(GW*GH);
    for(let i=0,j=0;j<w.length;i+=4,j++){const r=d[i],gg=d[i+1],b=d[i+2];if(r+gg+b<40||d[i+3]<128){w[j]=0;continue}if(r<40&&gg<70&&b>100&&b<180){w[j]=0;continue}w[j]=1}
    /* r2 (Art 11 Nov 14:50): foot bands the hero could walk into: both lamp_posts, the palm_small_b trunk (758,1279) and the guild_board posts -> footprint grown by 6 px on every side and extended down to the prop's feet y */
    for(const R of EXTRA){const x0=Math.max(0,R[0]),y0=Math.max(0,R[1]),x1=Math.min(GW-1,R[2]),y1=Math.min(GH-1,R[3]);for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)w[y*GW+x]=0}
    WALK=w;M.walk=w;M.ready=true;edges()}catch(e){ERR('mask',e)}};im.onerror=()=>ERR('mask img','load');im.src=MASK.coll}
loadMask();
const wk=(x,y)=>{if(!WALK)return true;x=x|0;y=y|0;return x>=0&&y>=0&&x<GW&&y<GH&&WALK[y*GW+x]===1};
const DIRS=[[1,0],[.7071,.7071],[0,1],[-.7071,.7071],[-1,0],[-.7071,-.7071],[0,-1],[.7071,-.7071]];
function walkR(x,y,r){if(!WALK)return true;if(!wk(x,y))return false;if(r>0)for(const d of DIRS)if(!wk(x+d[0]*r,y+d[1]*r))return false;return true}
M.walkR=walkR;M.wk=wk;
/* exits: walkable pixels on the three map edges */
function edges(){const run=(f,n)=>{const a=[];let s=-1;for(let i=0;i<n;i++){const v=f(i);if(v&&s<0)s=i;if(!v&&s>=0){a.push([s,i-1]);s=-1}}if(s>=0)a.push([s,n-1]);return a.filter(r=>r[1]-r[0]>20)};
  M.exits={W:run(y=>wk(2,y)||wk(6,y),GH),E:run(y=>wk(GW-3,y)||wk(GW-7,y),GH),S:run(x=>wk(x,GH-3)||wk(x,GH-7),GW),N:run(x=>wk(x,2)||wk(x,6),GW)}}
/* ---------- ground (one blob) ---------- */
const gim=new Image();let gBG=null;gim.decoding='async';gim.onload=()=>{try{paint()}catch(e){ERR('paint',e)}};gim.src=GR.src;
function paint(){if(!gBG||!gim.complete||!gim.naturalWidth)return;const g=gBG.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(gim,0,0,GW,GH);M.painted=true}
ZONES[ZID]={n:'Sunscar Caravan Bazaar',th:'Sunscar Caravan Bazaar',sub:'Map 12 · Safe Zone',safe:1,fullSafe:1,w:GW,h:GH,seed:1212,ground:['#c98a4a','#d09556','#c4843f','#b97a3a'],acc:'#ffd58a',amb:'mote',mobs:[],density:0,areas:[],way:[1630,1700],town:1,map12:1};
{const _g=genBG;genBG=function(zid){if(zid!==ZID)return _g.apply(this,arguments);BGS=1;LIGHTS=[];const c=document.createElement('canvas');c.width=GW;c.height=GH;const g=c.getContext('2d');g.fillStyle='#c98a4a';g.fillRect(0,0,GW,GH);gBG=c;if(gim.complete&&gim.naturalWidth)paint();return c}}
(window.__PRELZ=window.__PRELZ||{})[ZID]=()=>{if(!gBG||G.zone===ZID||(typeof BG!=='undefined'&&BG===gBG))return 0;const px=gBG.width*gBG.height;gBG.width=gBG.height=0;gBG=null;return Math.round(px*4/1e6)};
{const _f=gatesFor;gatesFor=function(zid){if(zid===ZID)return [];return _f.apply(this,arguments)}}
{const _e=edgeProps;edgeProps=function(zid){const r=_e.apply(this,arguments);return zid===ZID?[]:r}}
{const _s=spawnEnemy;spawnEnemy=function(){if(G.zone===ZID)return;return _s.apply(this,arguments)}}
/* ---------- props: DeaRz layout, exactly ---------- */
const IM={};const img=n=>{let i=IM[n];if(i)return i;const a=ART[n];if(!a)return null;i=IM[n]=new Image();i.decoding='async';i.src=a.src;return i};
/* r4: DeaRz's editor draws a FLIPPED item with its box shifted +width to the right (translate(w/2) scale(-1) translate(-w/2) inside the box), so what he saw and approved is centred at x + w; every other item is bottom-centre at (x,y). The in-game position follows what he saw. */
for(const o of LAY){const a=ART['m12_'+o.name];o.ex=o.flip&&a?o.x+a.w*o.scale:o.x}
const LK=new Map();LAY.forEach((o,i)=>LK.set(o.name+'|'+o.ex+'|'+o.y,o));
const VEG=/^(bush_)/;
/* roof fade (DeaRz via Art, 11 Nov): the engine's own fade (x0.42, tall props in front of the hero) only runs for NON-liveOnly props, and Map 12 props are liveOnly, so they are drawn at full alpha and a hero walking on the paths behind the south shops / stalls / inn vanishes. Same test as the engine's (screen space): prop depth in front of the entity, entity x within 0.4 x scaled width of the prop, entity (feet - 20 px) between the prop's top and its feet; the hero and every NPC count. Alpha eases to 0.4 over about 0.15 s and back. Solid props taller than 120 px after scale; bushes keep the grass standard (__GSTD). */
const FADE_A=.4,FADE_T=.15;function fadeFor(p,w,h,isVeg){if(isVeg||h<=120)return 1;let cov=false;try{if(typeof P==='undefined'||!P||P.dead)throw 0;const z=camZ(),a=w2s(p.x,p.y),hw=w*z*.4,top=a[1]-h*z,test=ent=>{if(!ent)return false;if(!(depthKey(p)>depthKey(ent)))return false;const b=w2s(ent.x,ent.y-20);return Math.abs(b[0]-a[0])<hw&&b[1]<a[1]&&b[1]>top};cov=test(P);if(!cov&&typeof NPCS!=='undefined'&&NPCS)for(const n of NPCS){if(n&&test(n)){cov=true;break}}}catch(_){}const now=typeof time==='number'?time:performance.now()/1000,dt=Math.min(.1,Math.max(0,now-(p._ft||now)));p._ft=now;const tgt=cov?FADE_A:1;let fa=p._fa==null?1:p._fa;const st=dt/FADE_T*(1-FADE_A);fa+=Math.max(-st,Math.min(st,tgt-fa));p._fa=fa;return fa}
for(const n in ART){const k=n.replace(/^m12_/,'');
  PROP_DEFS['m12_'+k]={n:(VEG.test(k)?'Bazaar '+k.replace('_',' ')+' (bush)':'Bazaar '+k),cat:'map12',w:ART[n].w,h:ART[n].h,ax:ART[n].w/2,ay:ART[n].h,liveOnly:1,solid:[],
    live(c,p){try{const o=LK.get(k+'|'+p.x+'|'+p.y)||{scale:1,flip:false},i=img(n);if(!i||!i.complete||!i.naturalWidth)return;const s=o.scale,w=ART[n].w*s,h=ART[n].h*s,fa=fadeFor(p,w,h,VEG.test(k));
      c.save();if(fa<.999)c.globalAlpha*=fa;c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.translate(p.x,p.y);if(o.flip)c.scale(-1,1);c.drawImage(i,-w/2,-h,w,h);c.restore()}catch(e){ERR('prop',e)}}}}
{const _l=loadPropsFor;loadPropsFor=function(zid){if(zid===ZID)/* r5: s = the real drawn scale, so propVisible() (culling) and the fade test in drawProp use the real size ART w/h x scale (live() draws its own size from the layout, unchanged) */return LAY.map(o=>({t:'m12_'+o.name,x:o.ex,y:o.y,s:o.scale,v:0,f:0,ph:0}));return _l.apply(this,arguments)}}
M.layoutCount=LAY.length;M.gim=gim;
/* test helper: compose ground + all props (depth-sorted by feet y) at scale sc (+ optional collision overlay) */
M.render=function(sc,overlay){const c=document.createElement('canvas');c.width=Math.round(GW*sc);c.height=Math.round(GH*sc);const g=c.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(gim,0,0,c.width,c.height);
  if(!overlay){const L=LAY.slice().sort((a,b)=>a.y-b.y);for(const o of L){const n='m12_'+o.name,i=img(n);if(!i||!i.complete)continue;const w=ART[n].w*o.scale*sc,h=ART[n].h*o.scale*sc;g.save();g.translate(o.ex*sc,o.y*sc);if(o.flip)g.scale(-1,1);g.drawImage(i,-w/2,-h,w,h);g.restore()}}
  else if(WALK){const id=g.getImageData(0,0,c.width,c.height),d=id.data;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const wx=Math.min(GW-1,Math.round(x/sc)),wy=Math.min(GH-1,Math.round(y/sc));if(WALK[wy*GW+wx]!==1){const k=(y*c.width+x)*4;d[k]=d[k]*.45+255*.55;d[k+1]*=.45;d[k+2]*=.45}}g.putImageData(id,0,0)}
  return c};
/* ---------- collision: mask test after the game's own movement, with axis sliding ---------- */
{const _b=blocked;blocked=function(x,y,r){if(G.zone===ZID)return !walkR(x,y,Math.min(r||0,HR*1.2));return _b.apply(this,arguments)}}
{const o=updPlayer;updPlayer=function(){if(G.zone!==ZID||!WALK||!P)return o.apply(this,arguments);const x0=P.x,y0=P.y,ok0=walkR(x0,y0,HR);const r=o.apply(this,arguments);
  try{if(ok0&&!walkR(P.x,P.y,HR)){const x1=P.x,y1=P.y;if(walkR(x1,y0,HR)){P.y=y0;M.stats.slide++}else if(walkR(x0,y1,HR)){P.x=x0;M.stats.slide++}else{P.x=x0;P.y=y0;M.stats.revert++}}
    /* leave a dash / leap in a blocked spot: put the hero back on the last good point */
    if(!walkR(P.x,P.y,HR*.5)&&ok0){P.x=x0;P.y=y0}}catch(e){ERR('slide',e)}return r}}
/* ---------- exits (blocked gate stubs) ---------- */
let exitT=0;
{const o=update;update=function(dt){const r=o.apply(this,arguments);try{if(G.zone===ZID&&G.state==='play'&&P&&WALK){exitT-=dt;const X=P.x,Y=P.y;let w=null;if(X<34&&M.links.W&&Y>1300&&Y<1415){if(exitT<=0){exitT=3;M.stats.toMap11=(M.stats.toMap11||0)+1;M.links.W()}}else if(X<34)w='ทางไปแมพ 11 (ฝั่งตะวันตก) — ยังไม่เปิด';else if(X>GW-34)w='ทางไปแมพ 13 (ฝั่งตะวันออก) — ยังไม่เปิด';else if(Y>GH-34)w='ทางไปแมพ 15 (ประตูใต้) — ยังไม่เปิด';
    if(w&&exitT<=0){exitT=3;M.stats.exitToasts++;M.lastExit=w;try{textAt(P.x,P.y-62,w,'#ffd58a',14)}catch(_){}try{log(w,'w')}catch(_){}}}}catch(e){ERR('exit',e)}return r}}
/* ---------- gate pillar occluders (drawn over the hero while it is behind them) ---------- */
const PIL=[[1235,2370,217,230],[1745,2370,217,230]];
{const o=drawTexts;drawTexts=function(){const r=o.apply(this,arguments);try{if(G.zone===ZID&&gim.complete&&gim.naturalWidth&&P&&P.y<2420)for(const p of PIL){if(Math.abs(P.x-(p[0]+p[2]/2))>p[2]/2+80)continue;ctx.drawImage(gim,p[0],p[1],p[2],30,p[0],p[1],p[2],30)}}catch(e){ERR('pillar',e)}return r}}
/* p148 redirects every zone that is not in its NEW set to Map 1: let 'map12' through (the Set.has patch lives only for the duration of that one call) */
{const _l=loadZone;loadZone=function(zid){if(zid!==ZID)return _l.apply(this,arguments);const h=Set.prototype.has;Set.prototype.has=function(v){return v===ZID?true:h.call(this,v)};try{return _l.apply(this,arguments)}finally{Set.prototype.has=h}}}
{const _t=travel;travel=function(to){if(to!==ZID)return _t.apply(this,arguments);const h=Set.prototype.has;Set.prototype.has=function(v){return v===ZID?true:h.call(this,v)};try{return _t.apply(this,arguments)}finally{Set.prototype.has=h}}}
/* ---------- entry ---------- */
function spawnPoint(){let x=1630,y=1700;if(WALK&&!walkR(x,y,HR)){let best=null;for(let r=0;r<600&&!best;r+=10)for(let a=0;a<6.283;a+=.2){const px=1630+Math.cos(a)*r,py=1700+Math.sin(a)*r;if(walkR(px,py,HR)){best={x:px,y:py};break}}if(best){x=best.x;y=best.y}}return {x,y}}
M.enter=function(pos){try{pos=pos||spawnPoint();G.unlocked&&G.unlocked.add&&G.unlocked.add(ZID);loadZone(ZID,pos);return G.zone}catch(e){ERR('enter',e);return null}};
{const _s=saveGame;saveGame=function(){if(G.zone===ZID){const z=G.zone,x=P.x,y=P.y;G.zone='sylva_lab';P.x=2350;P.y=1650;try{return _s.apply(this,arguments)}finally{G.zone=z;P.x=x;P.y=y}}return _s.apply(this,arguments)}}
if(/[?&]gm=on\b/.test(Q)){const add=()=>{try{if(document.getElementById('m12Btn'))return;const b=document.createElement('button');b.id='m12Btn';b.textContent='Map 12 TEST';b.style.cssText='position:fixed;left:8px;top:190px;z-index:8000;padding:7px 12px;border-radius:10px;border:1px solid #ffd58a;background:rgba(60,36,10,.92);color:#ffe9b0;font:700 14px system-ui,sans-serif;cursor:pointer';b.addEventListener('click',e=>{e.stopPropagation();M.enter()});document.body.appendChild(b)}catch(e){ERR('btn',e)}};if(document.body)add();else document.addEventListener('DOMContentLoaded',add);setTimeout(add,1500)}
console.info('[MAP12] ready: '+LAY.length+' props, mask loading');
})();
