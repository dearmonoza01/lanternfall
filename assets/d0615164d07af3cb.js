
/* ---- m11props-r1 + m11col-r1 (TEST allin_r89, 14 Nov 2026) ----
   PROPS: Art props_flowers_r2 (30 walk-through sprites, bottom-centre anchor, no collision) placed on the clean Map 11 ground at the old painted plant spots (default layout = window.__M11_PROPS_LAYOUT, editable data).
     grass / flower / shrub on the green side, sand / stone on the desert side; variant + scale 0.85-1.15 + flip varied; depth: they sort at their ROOT against the hero's feet like the grass standard (__GSTD picks them by name; stones sort by their anchor).
     EDITING: the engine's own Map Editor (GM Console > Map tab > "ไปแก้ไข" on Map 11, or the GM button "แก้พร็อพแมพ 11") now lists a category "Map 11 plants" with all 30 sprites: drag, place, flip, duplicate, delete, "Save Layout" (localStorage props_v1 -> zone map11). A saved layout replaces the default one.
     The Map 10 editor (__M10ED) is wired to Map 10's art and is NOT reused. ?m11props=off = no props.
   COLLISION PAINT MODE (DeaRz 14 Nov 16:45: "let me paint the collision myself"): open with ?m11ed=on or the GM button "แก้กันชนแมพ 11" (needs ?gm=on) while standing in Map 11. Shows the walk mask over the map (red = blocked, blue = water), brushes "ระบายกันชน" / "ลบกันชน" / "น้ำ"
     (size 8-200 world px, mouse or touch drag), "เลื่อนจอ/เดินปกติ" (brush off), Undo / Redo, "รีเซ็ตกลับค่า Art r4", Save (localStorage lanternfall_m11col_v1 + IndexedDB, re-applied on every load before the zone starts), Export PNG / Import PNG (3600 x 3000, green / grey / blue exactly as Art's walk map).
     An edit is live: it changes the same walk array that blocked() / the hero collision / the monster spawner read. Water edits change the blocked state at once; the animated water shimmer (waterfx) follows after a save + reload. ?m11col=off = ignore the saved edit. Debug: window.__M11COL, window.__M11PROPS ---- */
(function(){'use strict';
const Q=String(location.search),ZID='map11';
/* ======================== PROPS ======================== */
const MP=window.__M11PROPS={ver:'m11props-r1',on:!/[?&]m11props=off\b/.test(Q)&&!(window.__M11CLEAN&&__M11CLEAN.on===false),err:null,ready:false,source:'default',n:0};
const ART=window.__M11_PROPS_ART,LAY=window.__M11_PROPS_LAYOUT;
const ERRP=(w,e)=>{MP.err=w+': '+((e&&e.message)||e);try{console.error('[M11PROPS]',w,e)}catch(_){}};
const LABEL={grass:'Map 11 grass clump',flower:'Map 11 flower clump',shrub:'Map 11 shrub bush',sand:'Map 11 desert tuft',stone:'Map 11 small stone'};
function defaultProps(){return LAY.map(o=>({t:'m11f_'+o.t+'_'+o.v,x:o.x,y:o.y,s:o.k,v:0,f:o.f?-1:1,ph:0}))}
MP.defaultProps=defaultProps;
if(MP.on&&ART&&LAY){
  const IM={};const keys=Object.keys(ART);
  Promise.all(keys.map(k=>{const i=new Image();i.src=ART[k].src;IM[k]=i;return i.decode().catch(()=>{})})).then(()=>{try{
    for(const k of keys){const a=ART[k],set=k.replace(/_\d+$/,'');
      PROP_DEFS['m11f_'+k]={n:LABEL[set]+' '+k.slice(-1),cat:'map11',w:a.w,h:a.h,ax:a.w/2,ay:a.h,liveOnly:1,solid:[],
        draw(g){try{g.drawImage(IM[k],0,0)}catch(_){}},
        live(c,p){try{const i=IM[k];if(!i||!i.naturalWidth)return;const w=a.w*p.s,h=a.h*p.s;c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.translate(p.x,p.y);if(p.f<0)c.scale(-1,1);c.drawImage(i,-w/2,-h,w,h);c.restore()}catch(e){ERRP('live',e)}}}}
    try{if(!PROP_CATS.some(c=>c[0]==='map11'))PROP_CATS.push(['map11','Map 11 plants'])}catch(e){ERRP('cat',e)}
    try{PROP_KEYS.length=0;for(const k of Object.keys(PROP_DEFS))PROP_KEYS.push(k)}catch(e){ERRP('keys',e)}
    try{if(window.__OUTLINE&&__OUTLINE.keyOk){for(const k of keys)__OUTLINE.keyOk.set('m11f_'+k,false);MP.noOutline=true}}catch(e){ERRP('outline',e)}MP.ready=true;MP.IM=IM;
    if(G.zone===ZID){PROPS=loadPropsFor(ZID);buildSolids()}
  }catch(e){ERRP('defs',e)}});
  {const _l=loadPropsFor;loadPropsFor=function(zid){if(zid!==ZID)return _l.apply(this,arguments);if(!MP.ready)return [];
    let s=null;try{s=savedLayouts()[zid]}catch(_){}
    if(Array.isArray(s)){MP.source='saved';try{ED.source='saved'}catch(_){}const r=s.filter(p=>PROP_DEFS[p.t]).map(p=>({...p,ph:p.ph??rng()*TAU}));MP.n=r.length;return r}
    MP.source='default';try{ED.source='default'}catch(_){}const r=defaultProps();MP.n=r.length;return r}}
  try{const _g=genProps;genProps=function(zid){if(zid===ZID&&MP.ready)return defaultProps();return _g.apply(this,arguments)}}catch(e){ERRP('genProps',e)}
  /* preview helper: draws the default layout (or a given list) on a 2D context at scale k, sorted by y */
  MP.render=function(c,k,list){const L=(list||defaultProps()).slice().sort((a,b)=>a.y-b.y);for(const p of L){const d=PROP_DEFS[p.t];if(!d)continue;const i=MP.IM&&MP.IM[p.t.replace('m11f_','')];if(!i)continue;const w=d.w*p.s*k,h=d.h*p.s*k;c.save();c.translate(p.x*k,p.y*k);if(p.f<0)c.scale(-1,1);c.drawImage(i,-w/2,-h,w,h);c.restore()}return L.length};
  if(/[?&]gm=on\b/.test(Q)){const add=()=>{try{if(document.getElementById('m11pBtn')||!document.body)return;const b=document.createElement('button');b.id='m11pBtn';b.textContent='แก้พร็อพแมพ 11';b.style.cssText='position:fixed;left:8px;top:150px;z-index:8000;padding:7px 12px;border-radius:10px;border:1px solid #d7e8b0;background:rgba(30,50,20,.92);color:#e8f6c8;font:700 14px system-ui,sans-serif;cursor:pointer';b.addEventListener('click',e=>{e.stopPropagation();try{mapOpenIn(ZID)}catch(er){ERRP('open',er)}});document.body.appendChild(b)}catch(e){ERRP('btn',e)}};if(document.body)add();else document.addEventListener('DOMContentLoaded',add);setTimeout(add,1500)}
}
/* ======================== COLLISION PAINT MODE ======================== */
const COL=window.__M11COL={ver:'m11col-r1',on:false,err:null,key:'lanternfall_m11col_v1',mode:'block',r:60,dirty:false,saved:false,undo:[],redo:[],stats:{strokes:0}};
const ERR=(w,e)=>{COL.err=w+': '+((e&&e.message)||e);try{console.error('[M11COL]',w,e)}catch(_){}};
const W=3600,H=3000,MW=1800,MH=1500,KEY=COL.key;
const CLR={block:[60,60,60],walk:[90,200,90],water:[40,110,230]};
let MC=null,MG=null,OV=null,OG=null,CLS=null,READY=false,R4SRC=window.__M11_R4_SRC||null,tmp=null,tg=null;
const clsOf=(r,g,b)=>(b>180&&r<100&&g<160)?2:((g>r+60&&g>b+60)?1:0);
function A(){return window.__MAP11}
function load(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src})}
function sync(rx,ry,rw,rh){try{const M=A();if(!M||!M.walk||!MC)return;rx=Math.max(0,rx&~1);ry=Math.max(0,ry&~1);const x1=Math.min(W,((rx+rw+1)&~1)+2),y1=Math.min(H,((ry+rh+1)&~1)+2);const tw=(x1-rx)>>1,th=(y1-ry)>>1;if(tw<=0||th<=0)return;
    if(!tmp){tmp=document.createElement('canvas');tg=tmp.getContext('2d',{willReadFrequently:true});tg.imageSmoothingEnabled=false}
    if(tmp.width!==tw||tmp.height!==th){tmp.width=tw;tmp.height=th;tg.imageSmoothingEnabled=false}
    tg.clearRect(0,0,tw,th);tg.drawImage(MC,rx,ry,tw*2,th*2,0,0,tw,th);const d=tg.getImageData(0,0,tw,th).data,wk=M.walk,ox=rx>>1,oy=ry>>1;const od=OG.createImageData(tw,th),o=od.data;
    for(let j=0;j<th;j++)for(let i=0;i<tw;i++){const p=(j*tw+i)*4,c=clsOf(d[p],d[p+1],d[p+2]),idx=(oy+j)*MW+(ox+i);if(ox+i>=MW||oy+j>=MH)continue;wk[idx]=c===1?1:0;CLS[idx]=c;
      if(c===0){o[p]=255;o[p+1]=30;o[p+2]=30;o[p+3]=120}else if(c===2){o[p]=40;o[p+1]=120;o[p+2]=255;o[p+3]=140}}
    OG.putImageData(od,ox,oy)}catch(e){ERR('sync',e)}}
async function applyMaskImage(src,keepUndo){try{const im=await load(src);MG.imageSmoothingEnabled=false;MG.clearRect(0,0,W,H);MG.drawImage(im,0,0,W,H);
    // normalise to the three exact colours
    const id=MG.getImageData(0,0,W,H),d=id.data;for(let i=0;i<d.length;i+=4){const c=clsOf(d[i],d[i+1],d[i+2]),col=c===2?CLR.water:c===1?CLR.walk:CLR.block;d[i]=col[0];d[i+1]=col[1];d[i+2]=col[2];d[i+3]=255}MG.putImageData(id,0,0);
    OG.clearRect(0,0,MW,MH);sync(0,0,W,H);if(!keepUndo){COL.undo.length=0;COL.redo.length=0}ui();return true}catch(e){ERR('apply',e);return false}}
(window.__PRELZ=window.__PRELZ||{})[ZID]=()=>{if(!READY||!MC||COL.on||COL.dirty||G.zone===ZID)return 0;let px=MC.width*MC.height+OV.width*OV.height+(tmp?tmp.width*tmp.height:0);MC.width=MC.height=0;OV.width=OV.height=0;if(tmp){tmp.width=tmp.height=0}MC=MG=OV=OG=tmp=tg=null;READY=false;COL.ready=false;COL.undo.length=0;COL.redo.length=0;return Math.round(px*4/1e6)};
async function init(){try{const M=A();if(!M||!M.walk||!M.ready||READY||!/^r3/.test(M.mask||''))return;const src=(window.__M11_MASK3&&__M11_MASK3.walk)||null;if(!src)return;
    MC=document.createElement('canvas');MC.width=W;MC.height=H;MG=MC.getContext('2d',{willReadFrequently:true});OV=document.createElement('canvas');OV.width=MW;OV.height=MH;OG=OV.getContext('2d',{willReadFrequently:true});CLS=new Uint8Array(MW*MH);
    if(!R4SRC&&window.__M11_R4_SRC)R4SRC=window.__M11_R4_SRC;
    const ok=await applyMaskImage(src);if(!ok)return;READY=true;COL.ready=true;
    try{if(!localStorage.getItem(KEY)){const o=await idbGet();if(o&&o.png&&!(o.t>=1794700800000)){try{await idbDel()}catch(_){}COL.stale=o.t}else if(o&&o.png&&!/[?&]m11col=off\b/.test(Q)){await applyMaskImage(o.png);COL.fromIdb=true;COL.saved=true}}else COL.saved=true}catch(e){ERR('idb load',e)}
  }catch(e){ERR('init',e)}}
/* ---- IndexedDB ---- */
function idb(){return new Promise((res,rej)=>{try{const r=indexedDB.open('lanternfall_m11col',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}})}
async function idbPut(v){const db=await idb();return new Promise((res,rej)=>{const t=db.transaction('kv','readwrite');t.objectStore('kv').put(v,'v1');t.oncomplete=()=>res(true);t.onerror=()=>rej(t.error)})}
async function idbGet(){const db=await idb();return new Promise((res,rej)=>{const t=db.transaction('kv','readonly'),q=t.objectStore('kv').get('v1');q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})}
async function idbDel(){const db=await idb();return new Promise((res,rej)=>{const t=db.transaction('kv','readwrite');t.objectStore('kv').delete('v1');t.oncomplete=()=>res(true);t.onerror=()=>rej(t.error)})}
/* ---- painting (round brush, exact colours, no anti-aliasing) with tile based undo ---- */
const TS=256;let stroke=null;
function saveTiles(x,y,w,h){if(!stroke)return;const x0=Math.max(0,x),y0=Math.max(0,y),x1=Math.min(W,x+w),y1=Math.min(H,y+h);for(let ty=Math.floor(y0/TS);ty<=Math.floor((y1-1)/TS);ty++)for(let tx=Math.floor(x0/TS);tx<=Math.floor((x1-1)/TS);tx++){const k=tx+','+ty;if(stroke.tiles.has(k))continue;const X=tx*TS,Y=ty*TS,w2=Math.min(TS,W-X),h2=Math.min(TS,H-Y);stroke.tiles.set(k,{x:X,y:Y,w:w2,h:h2,img:MG.getImageData(X,Y,w2,h2)})}}
function stamp(x,y,r,mode){if(!READY)return;x=Math.round(x);y=Math.round(y);r=Math.max(1,Math.round(r));saveTiles(x-r,y-r,2*r+1,2*r+1);const c=CLR[mode];MG.fillStyle='rgb('+c[0]+','+c[1]+','+c[2]+')';
  for(let dy=-r;dy<=r;dy++){const yy=y+dy;if(yy<0||yy>=H)continue;const dx=Math.floor(Math.sqrt(r*r-dy*dy)),x0=Math.max(0,x-dx),x1=Math.min(W,x+dx+1);if(x1>x0)MG.fillRect(x0,yy,x1-x0,1)}
  sync(x-r,y-r,2*r+1,2*r+1);if(stroke){stroke.box=stroke.box?[Math.min(stroke.box[0],x-r),Math.min(stroke.box[1],y-r),Math.max(stroke.box[2],x+r),Math.max(stroke.box[3],y+r)]:[x-r,y-r,x+r,y+r]}}
function beginStroke(){stroke={tiles:new Map(),box:null}}
function endStroke(){if(stroke&&stroke.tiles.size){COL.undo.push(stroke);if(COL.undo.length>40)COL.undo.shift();COL.redo.length=0;COL.dirty=true;COL.stats.strokes++}stroke=null;ui()}
function swap(from,to){const s=from.pop();if(!s)return false;const cur=new Map();for(const [k,t] of s.tiles){cur.set(k,{x:t.x,y:t.y,w:t.w,h:t.h,img:MG.getImageData(t.x,t.y,t.w,t.h)});MG.putImageData(t.img,t.x,t.y);sync(t.x,t.y,t.w,t.h)}to.push({tiles:cur,box:s.box});COL.dirty=true;ui();return true}
COL.undoOp=()=>swap(COL.undo,COL.redo);COL.redoOp=()=>swap(COL.redo,COL.undo);
COL.paintAt=function(x,y,r,mode){beginStroke();stamp(x,y,r||COL.r,mode||COL.mode);endStroke();return true};
COL.paintLine=function(x0,y0,x1,y1,r,mode){beginStroke();const d=Math.hypot(x1-x0,y1-y0),st=Math.max(1,Math.ceil(d/Math.max(2,(r||COL.r)/3)));for(let i=0;i<=st;i++)stamp(x0+(x1-x0)*i/st,y0+(y1-y0)*i/st,r||COL.r,mode||COL.mode);endStroke();return true};
COL.cls=function(x,y){const M=A();if(!M||!M.walk)return null;return CLS[((y|0)>>1)*MW+((x|0)>>1)]};
COL.walkR=function(x,y,r){const M=A();return M&&M.walkR?M.walkR(x,y,r):null};
COL.save=async function(){try{if(!READY)return false;const png=MC.toDataURL('image/png'),o={v:1,t:Date.now(),png};try{localStorage.setItem(KEY,JSON.stringify(o))}catch(e){ERR('ls',e)}try{await idbPut(o)}catch(e){ERR('idb',e)}COL.dirty=false;COL.saved=true;ui();return true}catch(e){ERR('save',e);return false}};
COL.reset=async function(){try{if(!R4SRC)return false;await applyMaskImage(R4SRC);try{localStorage.removeItem(KEY)}catch(_){}try{await idbDel()}catch(_){}COL.dirty=false;COL.saved=false;ui();return true}catch(e){ERR('reset',e);return false}};
COL.exportDataURL=function(){return MC?MC.toDataURL('image/png'):null};
COL.exportPNG=function(){try{MC.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='map11_walk_edit.png';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)},'image/png');return true}catch(e){ERR('export',e);return false}};
COL.importFile=async function(file){try{const u=URL.createObjectURL(file);const ok=await applyMaskImage(u);URL.revokeObjectURL(u);COL.dirty=true;ui();return ok}catch(e){ERR('import',e);return false}};
COL.ov=()=>OV;COL.counts=function(){const c=[0,0,0];if(CLS)for(let i=0;i<CLS.length;i+=7)c[CLS[i]]++;return c};
/* ---- overlay + brush cursor (world space, in the ground pass) ---- */
let HOVER=null;
try{const _g=drawRaidTele;drawRaidTele=function(){const r0=_g.apply(this,arguments);try{if(COL.on&&COL.show!==false&&READY&&G.zone===ZID){const vx=Math.max(0,Math.floor(cam.x)),vy=Math.max(0,Math.floor(cam.y)),vw=Math.min(W-vx,Math.ceil(VW)+2),vh=Math.min(H-vy,Math.ceil(VH)+2);if(vw>0&&vh>0){ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.filter='none';ctx.imageSmoothingEnabled=false;ctx.drawImage(OV,vx/2,vy/2,vw/2,vh/2,vx,vy,vw,vh);ctx.restore()}
      if(HOVER&&COL.mode!=='off'&&COL.brushOn){ctx.save();ctx.lineWidth=3;ctx.strokeStyle=COL.mode==='walk'?'#6dff8a':COL.mode==='water'?'#6ab8ff':'#ff6a6a';ctx.fillStyle='rgba(255,255,255,.08)';ctx.beginPath();ctx.arc(HOVER[0],HOVER[1],COL.r,0,6.2832);ctx.fill();ctx.stroke();ctx.restore()}}}catch(e){ERR('draw',e)}return r0}}catch(e){ERR('hook draw',e)}
/* ---- pointer handling: capture phase, only when a brush is armed and the pointer is on the game canvas ---- */
let down=false,last=null;
const onCanvas=e=>{try{return e.target===ctx.canvas}catch(_){return false}};
const worldOf=e=>[mwx(e.clientX,e.clientY),mwy(e.clientX,e.clientY)];
function armed(){return COL.on&&COL.brushOn&&READY&&G.zone===ZID&&G.state==='play'}
window.addEventListener('pointerdown',e=>{try{if(!armed()||!onCanvas(e)||e.button>0)return;e.stopImmediatePropagation();e.preventDefault();down=true;const p=worldOf(e);beginStroke();stamp(p[0],p[1],COL.r,COL.mode);last=p;HOVER=p;try{ctx.canvas.setPointerCapture(e.pointerId)}catch(_){}}catch(er){ERR('down',er)}},true);
window.addEventListener('pointermove',e=>{try{if(!armed())return;if(onCanvas(e)||down)HOVER=worldOf(e);if(!down)return;e.stopImmediatePropagation();const p=worldOf(e);if(last){const d=Math.hypot(p[0]-last[0],p[1]-last[1]),st=Math.max(1,Math.ceil(d/Math.max(2,COL.r/3)));for(let i=1;i<=st;i++)stamp(last[0]+(p[0]-last[0])*i/st,last[1]+(p[1]-last[1])*i/st,COL.r,COL.mode)}last=p}catch(er){ERR('move',er)}},true);
const up=e=>{try{if(!down)return;down=false;last=null;endStroke()}catch(er){ERR('up',er)}};
window.addEventListener('pointerup',up,true);window.addEventListener('pointercancel',up,true);
/* ---- panel ---- */
let PN=null;
function build(){if(PN||!document.body)return;PN=document.createElement('div');PN.id='m11colPanel';PN.hidden=true;
  PN.innerHTML=`<h4>แก้กันชนแมพ 11 <button data-a="close" title="ปิด">✕</button></h4>
<div class="r"><label><input type="checkbox" data-a="show" checked> แสดงกันชน (แดง = ตัน · น้ำเงิน = น้ำ)</label></div>
<div class="r"><button data-m="block" class="on">ระบายกันชน</button><button data-m="walk">ลบกันชน</button><button data-m="water">น้ำ</button><button data-m="off">เลื่อนจอ / เดินปกติ</button></div>
<div class="r"><span>ขนาดแปรง</span><input type="range" min="8" max="200" value="60" data-a="size"><b data-a="sizev">60</b><span>px</span></div>
<div class="r"><button data-a="undo">Undo</button><button data-a="redo">Redo</button><button data-a="reset">รีเซ็ตกลับค่า Art r4</button></div>
<div class="r"><button data-a="save" class="gold">บันทึก (Save)</button><button data-a="export">Export PNG</button><button data-a="import">Import PNG</button><input type="file" accept="image/png" data-a="file" hidden></div>
<div class="s" data-a="status">เปิดอยู่ในแมพ 11 · เดินด้วยปุ่มปกติ ระบายด้วยเมาส์/นิ้ว</div>
<div class="s">พร็อพ: ใช้ Map Editor ของเกม (GM Console › แท็บ Map › ไปแก้ไข แมพ 11 หรือปุ่ม "แก้พร็อพแมพ 11") — เลือก "เลื่อนจอ / เดินปกติ" ก่อนใช้เครื่องมือพร็อพ</div>`;
  const st=document.createElement('style');st.textContent=`#m11colPanel{position:fixed;right:10px;top:64px;z-index:9200;width:min(300px,calc(100vw - 20px));max-height:calc(100vh - 80px);overflow:auto;padding:10px 12px;border-radius:12px;border:1px solid rgba(255,214,120,.65);background:rgba(16,12,6,.94);color:#ffeec4;font:13px system-ui,sans-serif}
#m11colPanel[hidden]{display:none}#m11colPanel h4{margin:0 0 8px;font-size:15px;color:#ffd77a;display:flex;justify-content:space-between;align-items:center}#m11colPanel .r{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:6px 0}
#m11colPanel button{min-height:34px;padding:4px 10px;border-radius:8px;border:1px solid rgba(255,214,120,.5);background:rgba(60,44,12,.92);color:#ffeec4;font:700 12px system-ui,sans-serif;cursor:pointer;touch-action:manipulation}#m11colPanel button.on{background:#ffcf5a;color:#2a1c00}#m11colPanel button.gold{background:#7a5410}
#m11colPanel button:disabled{opacity:.4}#m11colPanel .s{font-size:12px;color:#d9c9a0;margin-top:6px}#m11colPanel input[type=range]{flex:1;min-width:90px}`;document.head.appendChild(st);document.body.appendChild(PN);
  PN.addEventListener('pointerdown',e=>e.stopPropagation());PN.addEventListener('click',async e=>{const b=e.target.closest('[data-m],[data-a]');if(!b)return;e.stopPropagation();
    if(b.dataset.m){COL.mode=b.dataset.m;COL.brushOn=b.dataset.m!=='off';ui();return}
    const a=b.dataset.a;if(a==='close')COL.close();else if(a==='undo')COL.undoOp();else if(a==='redo')COL.redoOp();else if(a==='save'){const ok=await COL.save();status(ok?'บันทึกแล้ว ✓ (localStorage + IndexedDB) · ใช้ทุกครั้งที่เปิดเกม':'บันทึกไม่สำเร็จ')}
    else if(a==='reset'){if(b._arm&&Date.now()-b._arm<3000){b._arm=0;b.textContent='รีเซ็ตกลับค่า Art r4';await COL.reset();status('รีเซ็ตกลับค่า Art r4 แล้ว')}else{b._arm=Date.now();b.textContent='แตะอีกครั้งเพื่อยืนยัน';setTimeout(()=>{b._arm=0;b.textContent='รีเซ็ตกลับค่า Art r4'},3000)}}
    else if(a==='export'){COL.exportPNG();status('ส่งออก map11_walk_edit.png แล้ว (3600 x 3000)')}else if(a==='import')PN.querySelector('[data-a=file]').click()});
  PN.addEventListener('input',e=>{const t=e.target;if(t.dataset.a==='size'){COL.r=+t.value;PN.querySelector('[data-a=sizev]').textContent=t.value}else if(t.dataset.a==='show')COL.show=t.checked});
  PN.addEventListener('change',async e=>{const t=e.target;if(t.dataset.a==='file'&&t.files&&t.files[0]){const ok=await COL.importFile(t.files[0]);status(ok?'นำเข้า PNG แล้ว (ยังไม่บันทึก — กด Save)':'นำเข้าไม่สำเร็จ');t.value=''}})}
function status(m){try{PN.querySelector('[data-a=status]').textContent=m}catch(_){}}
function ui(){try{if(!PN)return;PN.querySelectorAll('[data-m]').forEach(b=>b.classList.toggle('on',b.dataset.m===(COL.brushOn===false?'off':COL.mode)));PN.querySelector('[data-a=undo]').disabled=!COL.undo.length;PN.querySelector('[data-a=redo]').disabled=!COL.redo.length;
    const s=PN.querySelector('[data-a=status]');if(s&&!ui._lock)s.textContent=(COL.dirty?'● ยังไม่บันทึก':'บันทึกแล้ว / ตรงกับที่โหลด')+' · '+COL.counts().map((v,i)=>['ตัน','เดินได้','น้ำ'][i]+' '+Math.round(v*7/27000)+'%').join(' · ')}catch(_){}}
COL.open=function(){build();COL.on=true;COL.brushOn=COL.mode!=='off';PN.hidden=false;ui();return true};
COL.close=function(){COL.on=false;down=false;if(PN)PN.hidden=true;return true};
setInterval(()=>{try{if(READY===false&&(!(window.__PERF&&__PERF.lazy)||G.zone===ZID||COL.on))init();if(!PN)build();const here=G.zone===ZID&&G.state==='play';if(PN&&PN.hidden===false&&!here)PN.hidden=true;if(PN&&COL.on&&here&&PN.hidden)PN.hidden=false;
    if(!COL._auto&&here&&/[?&]m11ed=on\b/.test(Q)&&READY){COL._auto=true;COL.open()}}catch(e){ERR('tick',e)}},600);
if(/[?&]gm=on\b/.test(Q)){const add=()=>{try{if(document.getElementById('m11cBtn')||!document.body)return;const b=document.createElement('button');b.id='m11cBtn';b.textContent='แก้กันชนแมพ 11';b.style.cssText='position:fixed;left:8px;top:190px;z-index:8000;padding:7px 12px;border-radius:10px;border:1px solid #ffb4a0;background:rgba(70,24,16,.92);color:#ffe0d6;font:700 14px system-ui,sans-serif;cursor:pointer';
    b.addEventListener('click',e=>{e.stopPropagation();try{if(G.zone!==ZID){A()&&A().enter();const t0=performance.now();(function w(){if(G.zone===ZID&&G.state==='play'&&!G.fade){COL.open();return}if(performance.now()-t0<8000)setTimeout(w,200)})()}else COL.open()}catch(er){ERR('btn',er)}});document.body.appendChild(b)}catch(e){ERR('btn',e)}};if(document.body)add();else document.addEventListener('DOMContentLoaded',add);setTimeout(add,1500)}
console.info('[M11COL] paint mode ready (?m11ed=on)');
})();
