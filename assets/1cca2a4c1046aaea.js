
/* ---- nhcast-r1 (TEST, 8 Nov 2026): Night Harvest hero cast = DeaRz's raise-and-slam clip (ORDER_20261107_nh-cast-dearz-slam) ----
   Replaces the PLACEHOLDER hero pose (scythe art raised / planted + small crouch) of the Night Harvest ultimate (scythe, R key) with the approved
   8-direction clip: 75 frames at 24 fps = 3.125 s, 282x362, anchor [141,288]; layers body_base -> hair_m2 -> scythe -> hand_front were baked in that order
   into ONE trimmed frame per (dir, frame) (same sprite format as the atk19 dagger sets); the 4 hit-stop frames f42-45 share one cell.
   TIMING: the clip is never stretched. IMPACT = f42 = 1.75 s after the clip start; the slam events (ground wave, shake, stun/dizzy) fire at that moment and
   every later Night Harvest timing is exactly the old one measured from the slam (the effect clock t is warped before the slam: t = tr * 1.15/1.75, after it
   t = tr - 0.60), so only the hero clip is longer. The hero returns to the normal idle after f74 (3.125 s).
   Flag ?nhcast=old = the old placeholder pose and old timing, byte for byte the same code path as before. Debug: window.__NHCAST.
   Only draws while a Night Harvest cast is running: walk / run / idle / every other skill are untouched. */
(function(){'use strict';
const D=window.__NHCAST_DATA;const SCY=window.__SCY;
const NC=window.__NHCAST={ver:'nhcast-r1b',on:false,err:null,ready:0,stats:{casts:0,draws:0,late:0,lateFrames:0,marks:[],dirs:{}},log:[],dec:{}};
if(!D||!SCY||typeof drawPlayerSprite!=='function'){NC.err='missing data / hooks';try{console.warn('[nhcast]',NC.err);}catch(_){}return;}
NC.on=!/[?&]nhcast=old\b/.test(location.search);
NC.data=D;
const DN=D.dirs,N=D.n,FPS=D.fps,AX=D.anchor[0],AY=D.anchor[1],TIMP=D.impact/FPS;                      /* 42 / 24 = 1.75 s */
const dirOf=a=>((Math.round(a/(Math.PI/4))%8)+8)%8;                                              /* E,SE,S,SW,W,NW,N,NE (screen angle, y down) */
NC.dirOf=dirOf;NC.tImpact=TIMP;NC.dur=N/FPS;
/* effect clock: before the slam the old charge effects run slower so that the slam lands at the clip impact; after it, exactly the old timings */
NC.warp=tr=>{const ts=(SCY.tbl&&SCY.tbl.T&&SCY.tbl.T.slam)||1.15;return tr<TIMP?tr*ts/TIMP:ts+(tr-TIMP);};
/* one atlas image per direction, decoded only when needed and released afterwards (phone memory) */
const IM={};
NC.warm=dn=>{if(!D.atlas[dn]||IM[dn])return IM[dn];const im=new Image();im.decoding='async';im.onload=()=>{im.__ok=1;NC.ready++;};im.onerror=()=>{NC.err='decode '+dn;};im.src=D.atlas[dn].src;IM[dn]=im;return im;};
NC.release=keep=>{for(const k in IM){if(k===keep)continue;try{IM[k].onload=IM[k].onerror=null;IM[k].src='';}catch(_){}delete IM[k];}};
NC.images=()=>Object.keys(IM);
NC.begin=(F,face)=>{const nd=dirOf(face||0),dn=DN[nd];F.nd=nd;F.dn=dn;F.tr=0;F.nhcBegin=performance.now();F.img=NC.warm(dn);NC.release(dn);NC.stats.casts++;NC.stats.dirs[dn]=(NC.stats.dirs[dn]||0)+1;
  NC.log.push('begin '+dn+' face '+(face==null?'-':face.toFixed(2)));if(NC.log.length>40)NC.log.shift();};
NC.end=F=>{F.nhcEnd=performance.now();NC.last={dn:F.dn,tr:+(F.tr||0).toFixed(3),marks:F.marks||null,lateFrames:F.lateFrames|0};try{NC.release();}catch(_){}};
NC.mark=(F,k)=>{F.marks=F.marks||{};F.marks[k]={tr:+(F.tr||0).toFixed(4),wall:+((performance.now()-F.nhcBegin)/1000).toFixed(3),frame:Math.floor((F.tr||0)*FPS+1e-6)};NC.stats.marks.push({k,dn:F.dn,tr:F.marks[k].tr,wall:F.marks[k].wall,frame:F.marks[k].frame});if(NC.stats.marks.length>60)NC.stats.marks.shift();};
NC.frameAt=tr=>Math.min(N-1,Math.max(0,Math.floor(tr*FPS+1e-6)));
/* draw one clip frame at the hero's feet (same rule as the atk19 sets: frame scale = HERO3D drawScale, feet offset footY) */
const K=()=>{try{return window.__HERO3D.drawScale||.4223;}catch(_){return .4223;}};
const FY=()=>{try{return window.__HERO3D.footY||0;}catch(_){return 0;}};
NC.draw=(F,x,y)=>{
  const tr=F.tr||0;if(tr>=N/FPS)return false;                                   /* clip over: normal hero */
  const im=F.img;if(!im||!im.__ok){F.lateFrames=(F.lateFrames|0)+1;NC.stats.lateFrames++;return false;}  /* atlas still decoding: draw the normal hero for these frames */
  const f=NC.frameAt(tr),r=D.atlas[F.dn].rects[f];if(!r){return true;}
  const k=K(),yy=y+FY();ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.drawImage(im,r[0],r[1],r[2],r[3],x+(r[4]-AX)*k,yy+(r[5]-AY)*k,r[2]*k,r[3]*k);ctx.restore();
  NC.stats.draws++;NC.frame=f;NC.dn=F.dn;try{window.HERO3D.anchor={x,y:yy};}catch(_){}return true;};
/* outermost hook on the hero sprite: only while a Night Harvest cast with the new clip is running */
try{const o=drawPlayerSprite;drawPlayerSprite=function(x,y,bob,fa){
  try{const F=SCY.fx;if(NC.on&&F&&F.nhc&&NC.draw(F,x,y))return;}catch(e){NC.err='draw '+e.message;}
  return o.apply(this,arguments);};}catch(e){NC.err='hook '+e.message;}
/* warm the atlas of the aimed direction while the player is aiming (R pressed, before the click), release everything when idle */
setInterval(()=>{try{if(!NC.on)return;
  if(SCY.aim&&typeof P!=='undefined'&&P){const a=Math.atan2(SCY.aim.y-P.y,SCY.aim.x-P.x);NC.warm(DN[dirOf(a)]);}
  else if(!SCY.fx){const ks=Object.keys(IM);if(ks.length&&!NC.hold){NC.release();}}}catch(_){}},250);
NC.debug=()=>({on:NC.on,ready:NC.ready,imgs:NC.images(),err:NC.err,stats:NC.stats,last:NC.last});
})();

