
/* ---- ironmonk-r1 (TEST, 13 Nov 2026): Iron Monk knuckle art on the hero's fists (DeaRz OK 14:19; Art design A, QA passed 10 Nov) ----
   While the KNUCKLE weapon is the hero's weapon (game weapon t='knuckle', or a portrait / preview that called PUPPET.setWeapon('knuckle')) both fist parts (fist_near, fist_far) draw the Iron Monk glove
   (wrapped fist + brass-studded steel plate) instead of the bare fist: ONE 3/4 art (a_game) is used for the near hand, the far hand gets the same piece mirrored and darkened (the puppet's far hand is darker).
   The part keeps its parent (forearm) and layer, so the glove follows the arm2 forearm / hand rotation in every pose (idle, jab / cross, lunge, every facing; the back view uses the same parts).
   Size: the art is scaled so its alpha bounding box width equals the bare fist image it replaces, and its wrist (top-right corner of the art) is aligned with the old pivot, so the knuckles land where the old fist was.
   The gold punch VFX (knuckle-r13) is untouched. Other weapons get the old fists back (the part image / pivot are restored every draw).  ?ironmonk=off = bare fists.  Debug: window.IRONMONK ---- */
(function(){'use strict';
const Q=String(location.search),OFF=/[?&]ironmonk=off\b/.test(Q);
const IM=window.IRONMONK={ver:'ironmonk-r1',on:!OFF,err:null,ready:false,draws:0,applied:0,curW:null,info:{}};
if(OFF)return;
const ERR=(w,e)=>{IM.err=w+': '+((e&&e.message)||e);try{console.error('[IRONMONK]',w,e)}catch(_){}};
const PU=()=>window.PUPPET;
function load(src){return new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=src})}
function bbox(im){const c=document.createElement('canvas');c.width=im.naturalWidth||im.width;c.height=im.naturalHeight||im.height;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0);
  const d=g.getImageData(0,0,c.width,c.height).data;let x0=c.width,y0=c.height,x1=-1,y1=-1;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){if(d[(y*c.width+x)*4+3]>24){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}}
  return {x0,y0,x1,y1,w:x1-x0+1,h:y1-y0+1,W:c.width,H:c.height}}
/* build one replacement: art scaled to the old image's bbox width, canvas = old image size (+margin), pivot from the old pivot relative to the bbox top-right corner */
function build(art,oldIm,oldPivot,mirror,dark){const ob=bbox(oldIm),ab=bbox(art),s=ob.w/ab.w,M=24;
  const W=Math.ceil(oldIm.naturalWidth+2*M+Math.max(0,ab.h*s-ob.h)),H=Math.ceil(Math.max(oldIm.naturalHeight,ab.h*s+ob.y0)+2*M);
  const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.imageSmoothingQuality='high';
  /* wrist corner of the art (top-right of its bbox) lands on the old bbox top-right, shifted by the margin */
  const relx=ob.x1-oldPivot[0],rely=oldPivot[1]-ob.y0;     // old pivot measured from the old bbox top-right (relx to the left, rely down)
  const ax=ab.x1-relx/s,ay=ab.y0+rely/s;                      // pivot in art pixels
  const dx=M+ob.x1-ab.x1*s,dy=M+ob.y0-ab.y0*s;                // draw offset of the art
  g.save();if(mirror){g.translate(W,0);g.scale(-1,1)}g.drawImage(art,mirror?(W-(dx+art.width*s)):dx,dy,art.width*s,art.height*s);g.restore();
  if(dark){g.globalCompositeOperation='source-atop';g.fillStyle='rgba(30,12,4,.34)';g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over'}
  const px=mirror?(W-(dx+ax*s)):(dx+ax*s),py=dy+ay*s;
  return {canvas:c,pivot:[+px.toFixed(1),+py.toFixed(1)],s:+s.toFixed(3),ob,ab}}
function toImg(c){return load(c.toDataURL('image/png'))}
let SAVE=null,NEARI=null,FARI=null;
async function init(){const U=PU();if(!U||!U.P||!U.imgs||!U.imgs.fist||!U.imgs.fist.complete||!U.imgs.fist_front_dark||!window.__IRONMONK_ART)return false;
  try{const art=await load(window.__IRONMONK_ART.game);
    const near=build(art,U.imgs.fist,U.P.fist_near.pivot,false,false);
    /* far hand: the puppet draws fist_front_dark there (slot), keep its size / pivot and use the mirrored dark piece */
    const farOld=U.imgs.fist_front_dark,farPiv=U.P.fist_far.pivot.slice();
    const far=build(art,farOld,farPiv,true,true);
    U.imgs.ironmonk_near=await toImg(near.canvas);U.imgs.ironmonk_far=await toImg(far.canvas);
    NEARI={img:'ironmonk_near',pivot:near.pivot};FARI={img:'ironmonk_far',pivot:far.pivot};
    IM.info={near:{pivot:near.pivot,s:near.s,old:near.ob,art:near.ab},far:{pivot:far.pivot,s:far.s,old:far.ob}};
    IM.ready=true;return true}catch(e){ERR('init',e);return false}}
const iv=setInterval(()=>{init().then(ok=>{if(ok)clearInterval(iv)})},500);
/* weapon tracking (portraits / previews call setWeapon without the game weapon changing) */
function trackW(){const U=PU();if(!U||U._imTrack||typeof U.setWeapon!=='function')return;U._imTrack=1;const _sw=U.setWeapon;U.setWeapon=function(w){IM.curW=w;return _sw.apply(this,arguments)}}
setInterval(trackW,300);
const knuckleNow=()=>{try{return IM.curW==='knuckle'||(IM.curW==null&&typeof P!=='undefined'&&P&&P.weapon&&P.weapon.t==='knuckle')}catch(_){return false}};
function apply(on){const U=PU();if(!U||!U.P||!U.P.fist_near)return;
  if(!SAVE)SAVE={near:{img:U.P.fist_near.img,pivot:U.P.fist_near.pivot.slice()},far:{img:U.P.fist_far.img,pivot:U.P.fist_far.pivot.slice(),slot:U.slots?U.slots.fist_far:undefined},nearSlot:U.slots?U.slots.fist_near:undefined};
  if(on&&IM.ready){U.P.fist_near.img=NEARI.img;U.P.fist_near.pivot=NEARI.pivot.slice();U.P.fist_far.img=FARI.img;U.P.fist_far.pivot=FARI.pivot.slice();
    if(U.slots){if(U.slots.fist_near!==undefined&&U.slots.fist_near!==NEARI.img&&SAVE.nearSlot===undefined)SAVE.nearSlot=U.slots.fist_near;if(U.slots.fist_far!==FARI.img)SAVE.far.slot=U.slots.fist_far;U.slots.fist_near=NEARI.img;U.slots.fist_far=FARI.img}IM.applied++}
  else if(SAVE&&NEARI){U.P.fist_near.img=SAVE.near.img;U.P.fist_near.pivot=SAVE.near.pivot.slice();U.P.fist_far.img=SAVE.far.img;U.P.fist_far.pivot=SAVE.far.pivot.slice();
    if(U.slots){if(U.slots.fist_near===NEARI.img)delete U.slots.fist_near;if(SAVE.nearSlot!==undefined&&U.slots.fist_near===undefined)U.slots.fist_near=SAVE.nearSlot;if(U.slots.fist_far===FARI.img&&SAVE.far.slot!==undefined)U.slots.fist_far=SAVE.far.slot}}}
function hook(){const U=PU();if(!U||U._imHook||typeof U.draw!=='function')return;U._imHook=1;const _d=U.draw;
  U.draw=function(){IM.draws++;try{apply(!!IM.on&&knuckleNow())}catch(e){ERR('apply',e)}return _d.apply(this,arguments)}}
setInterval(hook,300);
console.info('[IRONMONK] r1');
})();
