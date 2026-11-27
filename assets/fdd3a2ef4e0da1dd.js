
/* ---- r178 minimap2 (TEST ONLY, owner order via coordinator 21 Nov 2026): a proper minimap. Base = TEST r175. Flag ?minimap2=off = this module does nothing and the old prototype ring (GM toggle "Minimap ring", body.hv-minion) stays exactly as it was.
   PICTURE: the map's OWN picture, generated ONCE per map and cached (no new art, no per-frame map render): about 1.2 s after a map has loaded (images decoded) the game's own render() is run ONCE inside the render hook (same frame; the normal frame draws right after, so nothing flashes): for that one call the main canvas is switched to a small flat top-down view of the whole zone (camera zoom / tilt / yaw forced, cam 0,0, vignette / bloom / shake off, no hero / monsters / NPCs / effects), copied into an offscreen canvas (longest side MM.cfg.maxPic = 768 px) and everything is put back. So the picture holds the zone's ground art, props, buildings and warp circles exactly as the game draws them. A flat-colour result is retried up to 3 times, then a plain ground-colour picture is used.
   VIEW: rounded-square frame in the gold UI style. Small maps (longest side <= MM.cfg.fitMax) show the whole map; bigger maps keep the hero in the centre and show MM.cfg.span world px across. Markers: hero arrow (facing), warp circles (cyan ring), NPCs (dots, quest / shop NPCs bigger), quest targets of the active quests in this map (gold = main, blue = side, green = repeatable, purple = affinity / special: the quest tracker's colours; the quest being walked to pulses; targets outside the view become an edge chevron). No monsters.
   TAP / CLICK = the big world map (toggleWin('wMap'), same as key M). Hidden in the cottage room, in the prologue maps, while the old ring is on, with the HUD menu / tray, and before play.
   LAYOUT: position and size are solved from the real DOM: preferred spot = top right under the top button row; when a visible HUD element (button, bar, tracker, joystick, skill button, GM panel...) would overlap it slides left / down, then shrinks (desktop 150 -> 92 px, phone 96 -> 72 px). Re-solved on resize / orientation / zone change and when something moves onto it.
   Cost: the picture is drawn once; a frame draw = one drawImage + a few small shapes at MM.cfg.hz (10) per second; numbers in MM.stats. Debug: window.__MINIMAP2 ---- */
(function(){'use strict';
if(!/[?&]mmround=off\b/.test(String(location.search)))return;
const Q=String(location.search),MM=window.__MINIMAP2={ver:'minimap2-r178',on:!/[?&]minimap2=off\b/.test(Q),err:null,pic:{},stats:{caps:0,capMs:{},draws:0,drawMs:0,drawMax:0,solves:0,solveMs:0,retries:0,fallback:0},shown:false,rect:null,size:0,mode:'',
 cfg:{maxPic:768,span:1500,fitMax:2600,delay:1200,hz:10,margin:8,sizesDesk:[150,130,110,92],sizesPhone:[96,84,72],edgeArrows:true,zoneView:{house_platform:{cx:1200,cy:750,span:1150}}}};
if(!MM.on)return;
const ERR=(w,e)=>{MM.err=w+': '+((e&&e.message)||e);try{console.error('[MINIMAP2]',w,e)}catch(_){}};
/* NOTE: the game's globals W / H are the screen size; the housing object is called HS here */
const HS=window.HOUSE;
/* ---------------- DOM ---------------- */
const css=document.createElement('style');css.textContent='#mm2{position:fixed;z-index:9;display:none;box-sizing:border-box;border-radius:16px;border:2px solid #d6b05c;background:#0b0a08;box-shadow:0 0 0 1px #3a2410,inset 0 0 0 1px rgba(255,224,150,.35),0 4px 14px rgba(0,0,0,.65);cursor:pointer;touch-action:manipulation;overflow:hidden;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}#mm2 canvas{display:block;width:100%;height:100%;pointer-events:none}#mm2 i{position:absolute;right:3px;top:2px;font:800 9px/1 system-ui,sans-serif;font-style:normal;color:#ffe9b0;text-shadow:0 0 3px #000,0 0 3px #000;opacity:.85;pointer-events:none}';document.head.appendChild(css);
const el=document.createElement('div');el.id='mm2';el.setAttribute('role','button');el.setAttribute('aria-label','แผนที่ย่อ · แตะเพื่อเปิดแผนที่โลก');el.title='แผนที่ย่อ · แตะเพื่อเปิดแผนที่โลก (M)';
const cvs=document.createElement('canvas');el.appendChild(cvs);const kb=document.createElement('i');kb.textContent='M';el.appendChild(kb);document.body.appendChild(el);const g=cvs.getContext('2d');
for(const ev of ['pointerdown','mousedown','touchstart','pointerup','mouseup','touchend'])el.addEventListener(ev,e=>{e.stopPropagation()});
el.addEventListener('click',e=>{e.stopPropagation();try{if(typeof toggleWin==='function')toggleWin('wMap')}catch(er){ERR('open map',er)}});
/* ---------------- picture: once per zone ---------------- */
let wantZone=null,wantAt=0,lastZone=null;
const roomOn=()=>{try{return !!(HS&&HS.roomOn)}catch(_){return false}};
function lumVar(c){try{const x=c.getContext('2d',{willReadFrequently:true}),w=c.width,h=c.height;let s=0,s2=0,n=0;for(let i=0;i<500;i++){const d=x.getImageData((Math.random()*w)|0,(Math.random()*h)|0,1,1).data,l=.3*d[0]+.59*d[1]+.11*d[2];s+=l;s2+=l*l;n++}const m=s/n;return Math.sqrt(Math.max(0,s2/n-m*m))}catch(_){return 99}}
/* average brightness of a picture (8x8 sample): dark pictures (night yard, caves) are drawn lifted so the minimap stays readable at night */
function avgLum(c){try{const s=document.createElement('canvas');s.width=s.height=8;const x=s.getContext('2d',{willReadFrequently:true});x.drawImage(c,0,0,8,8);const d=x.getImageData(0,0,8,8).data;let a=0;for(let i=0;i<d.length;i+=4)a+=.3*d[i]+.59*d[i+1]+.11*d[i+2];return a/64}catch(_){return 100}}
function capture(inner,zid){const Z=ZONES[zid];if(!Z)return;const t0=performance.now();
 const s=Math.min(MM.cfg.maxPic/Z.w,MM.cfg.maxPic/Z.h),ow=Math.max(8,Math.round(Z.w*s)),oh=Math.max(8,Math.round(Z.h*s)),sc=ow/Z.w;
 const S={cw:cv.width,ch:cv.height,W:W,H:H,DPR:DPR,cx:cam.x,cy:cam.y,camZ:camZ,camT:camT,camY:camY,vig:vignette,bl:G.bloom,sh:G.shake,en:enemies,su:summons,npc:NPCS,pr:projs,fx:fx,gfx:gfx,tx:texts,pa:parts,am:amb,or:orbs,lo:loot,tu:tumbles,px:P.x,py:P.y};
 let out=null,err=null;
 try{cv.width=ow;cv.height=oh;W=ow;H=oh;DPR=1;camZ=()=>sc;camT=()=>1;camY=()=>0;cam.x=0;cam.y=0;vignette=ctx.createLinearGradient(0,0,1,1);G.bloom=false;G.shake=0;enemies=[];summons=[];NPCS=[];projs=[];fx=[];gfx=[];texts=[];parts=[];amb=[];orbs=[];loot=[];tumbles=[];P.x=-99999;P.y=-99999;
  inner();out=document.createElement('canvas');out.width=ow;out.height=oh;out.getContext('2d').drawImage(cv,0,0)}catch(e){err=e}
 finally{cv.width=S.cw;cv.height=S.ch;W=S.W;H=S.H;DPR=S.DPR;camZ=S.camZ;camT=S.camT;camY=S.camY;cam.x=S.cx;cam.y=S.cy;vignette=S.vig;G.bloom=S.bl;G.shake=S.sh;enemies=S.en;summons=S.su;NPCS=S.npc;projs=S.pr;fx=S.fx;gfx=S.gfx;texts=S.tx;parts=S.pa;amb=S.am;orbs=S.or;loot=S.lo;tumbles=S.tu;P.x=S.px;P.y=S.py}
 const ms=+(performance.now()-t0).toFixed(1);MM.stats.caps++;MM.stats.capMs[zid]=ms;
 const rec=MM.pic[zid]||{tries:0};rec.tries++;MM.pic[zid]=rec;
 if(err){ERR('capture '+zid,err);out=null}
 if(out&&lumVar(out)<4){out=null;MM.stats.retries++}
 if(out){rec.cv=out;rec.ow=ow;rec.oh=oh;rec.ok=true;rec.ms=ms;rec.lum=avgLum(out);rec.gain=rec.lum<85?Math.min(1.7,85/Math.max(20,rec.lum)):1;wantZone=null}
 else if(rec.tries>=3){const f=document.createElement('canvas');f.width=ow;f.height=oh;const fg=f.getContext('2d'),gc=Z.ground||[];const gr=fg.createLinearGradient(0,0,ow,oh);gr.addColorStop(0,gc[1]||'#2a3a2a');gr.addColorStop(1,gc[3]||'#1a2a1a');fg.fillStyle=gr;fg.fillRect(0,0,ow,oh);rec.cv=f;rec.ow=ow;rec.oh=oh;rec.ok=false;MM.stats.fallback++;wantZone=null}
 else wantAt=performance.now()+2000}
MM.capture=zid=>{wantZone=zid;wantAt=0;if(MM.pic[zid]){MM.pic[zid].tries=0;delete MM.pic[zid].cv}};
function canCapture(){try{return G.state==='play'&&!!P&&!G.fade&&!G.win&&!roomOn()&&wantZone===G.zone&&performance.now()>=wantAt&&!!ZONES[G.zone]}catch(_){return false}}
{const _r=render;render=function(){try{if(wantZone&&canCapture())capture(_r,wantZone)}catch(e){ERR('render hook',e)}return _r.apply(this,arguments)}}
/* ---------------- quest targets (same data and colours as the quest tracker) ---------------- */
const CATC={main:'#ffd36b',side:'#7fb8ff',daily:'#8fe39a',special:'#d8a6ff'};
function npcAt(id){try{for(const k of ['__QDATA2','__QDATA']){const n=(window[k]&&window[k].npcs||[]).find(x=>x.id===id);if(n&&n.at&&n.at.zone)return n.at}}catch(_){}return null}
function targetOf(a,q,r){try{if(r.s==='r'){const at=npcAt(q.receiver);return at?{zone:at.zone,x:at.x,y:at.y}:null}
  const ob=(q.objectives||[])[r.i|0];if(!ob)return null;
  if(ob.npc&&/^(talk|buy|deliver)$/.test(ob.kind)){const at=npcAt(ob.npc);return at?{zone:at.zone,x:at.x,y:at.y}:null}
  if(ob.point&&a.PT&&a.PT[ob.point]){const p=a.PT[ob.point];return {zone:p.zone,x:p.x,y:p.y}}
  if(Array.isArray(ob.points)&&a.PT){let best=null,bd=1e18;for(const id of ob.points){const p=a.PT[id];if(!p)continue;const d=(p.zone===G.zone?0:1e9)+Math.hypot(p.x-P.x,p.y-P.y);if(d<bd){bd=d;best=p}}if(best)return {zone:best.zone,x:best.x,y:best.y}}}catch(_){}return null}
let qCache={t:0,list:[]};
function questMarks(){const now=performance.now();if(now-qCache.t<400)return qCache.list;qCache.t=now;const L=[];try{const a=window.CH1Q&&CH1Q.api;if(a&&a.state){const st=a.state(),qs=(st&&st.q)||{},cat=(window.__QUESTHUD&&__QUESTHUD.catOf)||(q=>{const t=String(q.type||'').toLowerCase();return t==='main'?'main':t==='side'?'side':'special'});const cur=window.__QUESTHUD&&__QUESTHUD.cur&&__QUESTHUD.cur.id;
  for(const id in qs){const r=qs[id],q=a.QBY[id];if(!q||!r||(r.s!=='a'&&r.s!=='r'))continue;const t=targetOf(a,q,r);if(!t||t.zone!==G.zone)continue;L.push({x:t.x,y:t.y,c:CATC[cat(q)]||CATC.special,cat:cat(q),cur:cur===id,id})}}}catch(e){ERR('quests',e)}qCache.list=L;return L}
let npcCache={t:0,zone:'',list:[]};
function npcMarks(){const now=performance.now();if(now-npcCache.t<800&&npcCache.zone===G.zone)return npcCache.list;npcCache={t:now,zone:G.zone,list:[]};const L=npcCache.list;
 try{const a=window.CH1Q&&CH1Q.api;const seen=new Set();for(const k of ['__QDATA2','__QDATA']){for(const n of (window[k]&&window[k].npcs||[])){if(!n||!n.at||n.at.zone!==G.zone||seen.has(n.id))continue;seen.add(n.id);let sh=true;try{if(a&&a.shown&&a.NPC&&a.NPC[n.id])sh=a.shown(a.NPC[n.id])}catch(_){}if(sh)L.push({x:n.at.x,y:n.at.y,k:'q'})}}}catch(_){}
 try{const shops=(window.__TOWNNPC&&__TOWNNPC.goods)||{};if(typeof NPCS!=='undefined')for(const n of NPCS){if(!n||typeof n.x!=='number')continue;const big=!!(n.shop||n.vendor||(n.id&&shops[n.id])||/merchant|smith/i.test(String(n.kind)));L.push({o:n,k:big?'s':'v'})}}catch(_){}
 return L}
function warpMarks(){const L=[];try{const C=window.__WARP&&__WARP.circles;if(Array.isArray(C))for(const c of C)if(c&&c.z===G.zone)L.push({x:c.x,y:c.y});}catch(_){}
 try{if(typeof GATES!=='undefined')for(const t of GATES)L.push({x:t.x,y:t.y})}catch(_){}
 try{if(typeof WAY!=='undefined'&&WAY)L.push({x:WAY.x,y:WAY.y});if(typeof NEXUS!=='undefined'&&NEXUS)L.push({x:NEXUS.x,y:NEXUS.y})}catch(_){}
 try{if(G.zone==='house_platform'&&HS&&HS.exitPos){const e=HS.exitPos();if(e&&e.x>-1000)L.push({x:e.x,y:e.y})}}catch(_){}return L}
/* ---------------- drawing ---------------- */
let px=0,pface=0;
function view(Z,sz){const zv=MM.cfg.zoneView[G.zone];if(zv){const s=sz/zv.span;MM.mode='fixed';return {s,ox:sz/2-zv.cx*s,oy:sz/2-zv.cy*s}}const mx=Math.max(Z.w,Z.h);if(mx<=MM.cfg.fitMax){const s=sz/mx;MM.mode='fit';return {s,ox:(sz-Z.w*s)/2,oy:(sz-Z.h*s)/2}}const sp=MM.cfg.span,s=sz/sp;MM.mode='follow';/* hero in the centre; near a map edge the view stops at the edge (no empty border) so the hero dot moves off-centre there */const vx=Z.w>sp?Math.max(0,Math.min(Z.w-sp,P.x-sp/2)):(Z.w-sp)/2,vy=Z.h>sp?Math.max(0,Math.min(Z.h-sp,P.y-sp/2)):(Z.h-sp)/2;return {s,ox:-vx*s,oy:-vy*s}}
function draw(){const t0=performance.now();try{const sz=MM.size||150,dpr=Math.min(2,window.devicePixelRatio||1),pw=Math.round(sz*dpr);if(cvs.width!==pw||cvs.height!==pw){cvs.width=pw;cvs.height=pw}
  g.setTransform(dpr,0,0,dpr,0,0);g.fillStyle='#0b0e12';g.fillRect(0,0,sz,sz);const Z=ZONES[G.zone];if(!Z||!P)return;const V=view(Z,sz),X=x=>V.ox+x*V.s,Y=y=>V.oy+y*V.s;
  const rec=MM.pic[G.zone];
  if(rec&&rec.cv){g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';const gn=rec.gain>1.02&&typeof g.filter==='string';if(gn)g.filter='brightness('+rec.gain.toFixed(2)+') contrast(1.06)';g.drawImage(rec.cv,X(0),Y(0),Z.w*V.s,Z.h*V.s);if(gn)g.filter='none'}
  else{g.fillStyle='#1a2a1c';g.fillRect(X(0),Y(0),Z.w*V.s,Z.h*V.s);g.fillStyle='rgba(255,233,176,.7)';g.font='700 10px system-ui';g.textAlign='center';g.fillText('…',sz/2,sz/2)}
  /* border of the map */
  g.strokeStyle='rgba(214,176,92,.7)';g.lineWidth=1;g.strokeRect(X(0)+.5,Y(0)+.5,Z.w*V.s-1,Z.h*V.s-1);
  const inV=(x,y,m)=>x>=-m&&y>=-m&&x<=sz+m&&y<=sz+m;
  /* warp circles */
  for(const w of warpMarks()){const x=X(w.x),y=Y(w.y);if(!inV(x,y,4))continue;g.lineWidth=2;g.strokeStyle='#04202a';g.beginPath();g.arc(x,y,5.5,0,6.2832);g.stroke();g.lineWidth=1.4;g.strokeStyle='#7ff0ff';g.beginPath();g.arc(x,y,5,0,6.2832);g.stroke();g.fillStyle='#e8fdff';g.beginPath();g.arc(x,y,1.6,0,6.2832);g.fill()}
  /* NPC dots */
  for(const n of npcMarks()){const x=X(n.o?n.o.x:n.x),y=Y(n.o?n.o.y:n.y);if(!inV(x,y,3))continue;const r=n.k==='v'?1.9:3;g.fillStyle='rgba(0,0,0,.75)';g.beginPath();g.arc(x,y,r+1,0,6.2832);g.fill();g.fillStyle=n.k==='q'?'#ffffff':n.k==='s'?'#ffb84a':'#d6dce8';g.beginPath();g.arc(x,y,r,0,6.2832);g.fill()}
  /* quest targets */
  const tm=performance.now()/1000;
  for(const q of questMarks()){let x=X(q.x),y=Y(q.y);const out=!inV(x,y,0);
   if(out){if(!MM.cfg.edgeArrows)continue;const cx=sz/2,cy=sz/2,dx=x-cx,dy=y-cy,a=Math.atan2(dy,dx),k=Math.min((cx-7)/Math.max(1e-6,Math.abs(dx)),(cy-7)/Math.max(1e-6,Math.abs(dy)));x=cx+dx*k;y=cy+dy*k;g.save();g.translate(x,y);g.rotate(a);g.fillStyle=q.c;g.strokeStyle='#14100a';g.lineWidth=1.6;g.beginPath();g.moveTo(5,0);g.lineTo(-4,-4.5);g.lineTo(-2,0);g.lineTo(-4,4.5);g.closePath();g.stroke();g.fill();g.restore();continue}
   if(q.cur){const p=(tm*1.6)%1;g.strokeStyle=q.c;g.globalAlpha=1-p;g.lineWidth=2;g.beginPath();g.arc(x,y,6+p*9,0,6.2832);g.stroke();g.globalAlpha=1}
   g.fillStyle=q.c;g.strokeStyle='#14100a';g.lineWidth=1.8;g.beginPath();g.moveTo(x,y-7);g.lineTo(x+5,y);g.lineTo(x,y+7);g.lineTo(x-5,y);g.closePath();g.stroke();g.fill();g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.arc(x,y,1.5,0,6.2832);g.fill()}
  /* hero arrow */
  {const x=X(P.x),y=Y(P.y),a=(P.face||0);g.save();g.translate(x,y);g.rotate(a);g.fillStyle='#ffffff';g.strokeStyle='#101418';g.lineWidth=2;g.beginPath();g.moveTo(7,0);g.lineTo(-5,-5);g.lineTo(-2.5,0);g.lineTo(-5,5);g.closePath();g.stroke();g.fill();g.restore()}
 }catch(e){ERR('draw',e)}
 const ms=performance.now()-t0;MM.stats.draws++;MM.stats.drawMs+=ms;if(ms>MM.stats.drawMax)MM.stats.drawMax=ms}
/* ---------------- layout solver (from the real DOM) ---------------- */
let blockers=[],blkT=0;
function collectBlockers(){const vw=innerWidth,vh=innerHeight,L=[];try{for(const e of document.body.querySelectorAll('*')){if(e===el||el.contains(e)||e.tagName==='CANVAS'||e.tagName==='SCRIPT'||e.tagName==='STYLE'||e.id==='gtTint'||e.id==='nlLayer')continue;const cs=getComputedStyle(e);if(cs.position!=='fixed'&&cs.position!=='absolute')continue;if(cs.pointerEvents==='none'&&cs.backgroundColor==='rgba(0, 0, 0, 0)')continue;if(cs.display==='none'||cs.visibility==='hidden')continue;const r=e.getBoundingClientRect();if(r.width<8||r.height<8)continue;if(r.width>vw*.8&&r.height>vh*.7)continue;L.push(e)}}catch(er){ERR('collect',er)}blockers=L;blkT=performance.now()}
/* GM / test-build panels and buttons (they do not exist in a REAL build): avoided first; only when no free spot exists they are allowed to lie under the minimap */
const DEVRX=/(^|[a-z])(GM|Gm)$|^(gm|gup|pcr|cs2|ds[A-Z]|m1[12][a-z]*Btn|cards|puppet|spw|mq|wpEd|dh|dev|gdq|hudMiniOpen|m10Ed|m4Ed|edBtn)/;
function isDev(e){for(let a=e;a&&a!==document.body;a=a.parentElement){const id=a.id||'';if(id&&DEVRX.test(id))return true}return false}
function rectsNow(){const R=[];for(const e of blockers){if(!e.isConnected)continue;const cs=e.style;const r=e.getBoundingClientRect();if(r.width<8||r.height<8||r.bottom<0||r.right<0||r.left>innerWidth||r.top>innerHeight)continue;const c=getComputedStyle(e);if(c.display==='none'||c.visibility==='hidden'||+c.opacity<.05)continue;R.push({x:r.left,y:r.top,w:r.width,h:r.height,id:e.id||e.className||e.tagName,dev:isDev(e)})}return R}
function covered(){const r=MM.rect;if(!r)return false;try{const vw=innerWidth,vh=innerHeight;const pts=[];for(let i=0;i<=8;i++){const u=-2+(r.w+4)*i/8;pts.push([r.x+u,r.y-2],[r.x+u,r.y+r.h+2],[r.x-2,r.y+u],[r.x+r.w+2,r.y+u])}for(let i=1;i<4;i++)for(let j=1;j<4;j++)pts.push([r.x+r.w*i/4,r.y+r.h*j/4]);const t0c=performance.now();for(const [x,y] of pts){if(x<0||y<0||x>=vw||y>=vh)continue;for(const e of document.elementsFromPoint(x,y)){if(e===el||el.contains(e)||e===document.body||e===document.documentElement||e.tagName==='CANVAS'||e.id==='gtTint'||e.id==='nlLayer')continue;let a=e,fx=null;while(a&&a!==document.body){const cs=getComputedStyle(a);if(cs.position==='fixed'||cs.position==='absolute'){fx=a;break}a=a.parentElement}if(!fx)continue;const b=fx.getBoundingClientRect();if(b.width>vw*.8&&b.height>vh*.7)continue;if(getComputedStyle(fx).pointerEvents==='none')continue;if(MM.devIgnored&&isDev(fx))continue;MM.stats.coverMs=(MM.stats.coverMs||0)+performance.now()-t0c;MM.stats.covers=(MM.stats.covers||0)+1;return fx.id||String(fx.className)||fx.tagName}}MM.stats.coverMs=(MM.stats.coverMs||0)+performance.now()-t0c;MM.stats.covers=(MM.stats.covers||0)+1}catch(_){}return false}
const hit=(a,b,m)=>a.x<b.x+b.w+m&&a.x+a.w+m>b.x&&a.y<b.y+b.h+m&&a.y+a.h+m>b.y;
const isMobile=()=>document.body.classList.contains('mobile')||innerWidth<700||innerHeight<430;
function solve(){const t0=performance.now();try{collectBlockers();const RA=rectsNow(),vw=innerWidth,vh=innerHeight,m=MM.cfg.margin,sizes=isMobile()?MM.cfg.sizesPhone:MM.cfg.sizesDesk;
  let best=null,pass=0;
  for(pass=0;pass<2&&!best;pass++){const R=pass===0?RA:RA.filter(r=>!r.dev);
   /* the top button row on the right: its lowest edge */
   let rowBottom=0;for(const r of R)if(r.y<110&&r.x+r.w>vw*.55&&r.y+r.h<130)rowBottom=Math.max(rowBottom,r.y+r.h);
   outer:for(const sz of sizes){const top0=Math.max(m,rowBottom+6);
    const tryAt=(x,y)=>{const c={x,y,w:sz,h:sz};if(x<m||y<m||x+sz>vw-m||y+sz>vh-m)return false;for(const r of R)if(hit(c,r,2))return false;return c};
    /* 1) top right, 2) slide left along the row, 3) slide down along the right edge, 4) slide down and left */
    for(let dx=0;dx<=vw*.5;dx+=8){const c=tryAt(vw-m-sz-dx,top0);if(c){best=c;break outer}}
    for(let dy=8;dy<=vh*.7;dy+=8){const c=tryAt(vw-m-sz,top0+dy);if(c){best=c;break outer}}
    for(let dy=8;dy<=vh*.6;dy+=12)for(let dx=8;dx<=vw*.4;dx+=12){const c=tryAt(vw-m-sz-dx,top0+dy);if(c){best=c;break outer}}}}
  MM.devIgnored=!!best&&pass===2;
  if(!best){const sz=sizes[sizes.length-1];best={x:vw-m-sz,y:Math.max(m,40),w:sz,h:sz,forced:true}}
  MM.size=best.w;MM.rect=best;MM.forced=!!best.forced;el.style.left=Math.round(best.x)+'px';el.style.top=Math.round(best.y)+'px';el.style.width=best.w+'px';el.style.height=best.w+'px';
 }catch(e){ERR('solve',e)}MM.stats.solves++;MM.stats.solveMs+=performance.now()-t0}
MM.solve=solve;
/* ---------------- tick (inside the game's update) ---------------- */
let acc=0,lastLayoutSig='',overlapN=0,lastCheck=0;
function visibleNow(){try{if(G.state!=='play'||!P)return false;if(roomOn())return false;if(String(G.zone).indexOf('w00_')===0)return false;const b=document.body.classList;if(b.contains('hv-minion')||b.contains('hv-menu')||b.contains('hv-tray')||b.contains('hv-mini'))return false;if(!ZONES[G.zone])return false;return true}catch(_){return false}}
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{
  const vis=visibleNow();if(vis!==MM.shown){MM.shown=vis;el.style.display=vis?'block':'none';if(vis)lastLayoutSig=''}
  if(G.zone!==lastZone){lastZone=G.zone;qCache.t=0;if(!MM.pic[G.zone]||!MM.pic[G.zone].cv){wantZone=G.zone;wantAt=performance.now()+MM.cfg.delay}lastLayoutSig=''}
  if(!vis)return r;
  const now=performance.now();
  const sig=innerWidth+'x'+innerHeight+'|'+G.zone+'|'+document.body.className;
  if(sig!==lastLayoutSig){lastLayoutSig=sig;solve();overlapN=0;lastCheck=now}
  else if(now-lastCheck>600){lastCheck=now;/* something moved onto the minimap? */const c=MM.rect;if(c&&c.forced){if(now-(MM.forcedT||0)>2500){MM.forcedT=now;solve()}}else if(c){const bad=covered();overlapN=bad?overlapN+1:0;if(bad)MM.lastCover=bad;if(overlapN>=2){overlapN=0;solve()}}}
  acc+=dt;if(acc>=1/MM.cfg.hz){acc=0;draw()}
 }catch(e){ERR('tick',e)}return r}}
addEventListener('resize',()=>{lastLayoutSig=''});addEventListener('orientationchange',()=>{lastLayoutSig=''});
MM.ready=true;
})();

