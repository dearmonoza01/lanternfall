
/* ---- wlook179 (TEST r179, 23 Nov 2026): the weapon in the hero's hand shows the look of the equipped item's BASE NAME.
   DeaRz picked "by weapon name" 22 Nov 04:14 UTC; art approved 23 Nov 09:55 UTC ("ที่ผมอนุมัติคือภาพอาวุธ"), order 07:03 "ส่งให้ code นำเข้าเกมได้เลย".
   Art pack art/weaponlook_r1/pack_r1 (30 sprites: dagger sword axe bow staff book gun scythe hammer knuckle x 3 names). Greatsword and spear keep the old look (removed for now, DeaRz 23 Nov 06:32).
   Rarity prefix ignored; unique weapons (own names) keep the old look of their type.
   How: the puppet draws each part in its own image space; a hook in that one drawImage replaces the old weapon image by the new sprite,
   grip placed on the old grip point (same fraction of the height), scaled at draw time to the old image's visible height (book and gun smaller, see SIZE). Knuckle: sprite worn over the near fist.
   No pose, pivot, scale or slot is changed, so every attack animation stays as it is. Flag ?wlook=off. Debug window.WLOOK ---- */
(function(){'use strict';
const Q=String(location.search),OFF=/[?&]wlook=off\b/.test(Q);
const X=window.WLOOK={ver:'wlook179-r2',on:!OFF,err:null,ready:0,draws:0,cur:null,looks:{}};
if(OFF)return;
const D=window.__WL179_DATA||[];
/* puppet part(s) that hold the weapon, per game type */
const PARTS={sword:['sword'],dagger:['sword','offhand'],bow:['offhand'],gun:['offhand'],staff:['sword'],scythe:['sword'],hammer:['sword'],knuckle:['fist_near']};
const FLIP={bow:true};   /* r2 (DeaRz 23 Nov 12:14 UTC "ธนูกลับด้านแก้ใหม่"): Art's bow faces the other way from the puppet's old bow, so it is mirrored left-right about its grip */
/* size vs the old image's visible height, grip fraction override (0 = top, 1 = bottom) */
const SIZE={book:.42,gun:.62,knuckle:1.25},SIZEN={"Gale Carbine":.85,"Aurora Rifle":.95},GRIP={book:.86,gun:.80};
function info(im){if(im.__wlI)return im.__wlI;const w=im.naturalWidth||im.width,h=im.naturalHeight||im.height;let o={x0:0,y0:0,x1:w,y1:h,w,h,rows:null};
  try{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,w,h).data;let x0=w,y0=h,x1=-1,y1=-1;const rows=new Float32Array(h*2);
    for(let y=0;y<h;y++){let sx=0,n=0;for(let x=0;x<w;x++){if(d[(y*w+x)*4+3]>40){n++;sx+=x;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}}rows[y*2]=n;rows[y*2+1]=n?sx/n:0}
    if(x1>=0)o={x0,y0,x1:x1+1,y1:y1+1,w:x1+1-x0,h:y1+1-y0,rows,W:w,H:h}}catch(e){X.err='info '+e.message}
  im.__wlI=o;return o}
/* handle centre x at height y of a sprite: centroid of opaque pixels in a small band of rows */
function midX(I,y){const r=I.rows;if(!r)return (I.x0+I.x1)/2;const b=Math.max(2,Math.round(I.h*.03));let s=0,n=0;for(let yy=Math.max(I.y0,Math.round(y)-b);yy<=Math.min(I.y1-1,Math.round(y)+b);yy++){const k=r[yy*2];if(k){s+=r[yy*2+1]*k;n+=k}}return n?s/n:(I.x0+I.x1)/2}
for(const d of D){const im=new Image();im.onload=()=>{X.ready++;info(im)};im.src=d.src;(X.looks[d.t]=X.looks[d.t]||{})[d.n]=im;im._wl=d.t+':'+d.n}
function lookOf(){try{const w=P&&P.weapon;if(!w||!w.t)return null;const L=X.looks[w.t];if(!L)return null;const nm=String(w.name||'');
    let best=null;for(const n in L)if((nm===n||nm.endsWith(' '+n))&&(!best||n.length>best.length))best=n;if(best){const im=L[best];return im.complete&&im.naturalWidth?{t:w.t,n:best,im}:null}}catch(_){}return null}
let LK=null,LKf=-1;
window.__WLD=function(ctx,k,im,al){try{if(!X.on)return false;const f=(typeof frameN!=='undefined')?frameN:performance.now();if(f!==LKf){LK=lookOf();LKf=f;X.cur=LK?LK.t+':'+LK.n:null}
    const L=LK;if(!L)return false;const parts=PARTS[L.t];if(!parts||parts.indexOf(k)<0)return false;if(!im||im._key==='_none')return false;
    const U=window.PUPPET;if(!U||!U.P[k])return false;
    if(window.__WLHERO===false)return false;
    const O=info(im),S=info(L.im);if(!O.rows||!S.rows)return false;
    if(L.t==='knuckle'){ctx.drawImage(im,al[0],al[1]);const s=O.h*SIZE.knuckle/S.h,cx=al[0]+(O.x0+O.x1)/2,cy=al[1]+(O.y0+O.y1)/2;
      ctx.drawImage(L.im,cx-(S.x0+S.w/2)*s,cy-(S.y0+S.h/2)*s,S.W*s,S.H*s);X.draws++;return true}
    const pv=U.P[k].pivot,gf=GRIP[L.t]!=null?GRIP[L.t]:Math.max(0,Math.min(1,(pv[1]-O.y0)/O.h)),s=O.h*(SIZEN[L.n]||SIZE[L.t]||1)/S.h,gy=S.y0+gf*S.h,gx=midX(S,gy);
    if(L.t==='gun'){/* the bow is held upright while shooting: turn the gun 90 deg so its muzzle points forward when the bow would stand up */
      ctx.save();ctx.translate(al[0]+pv[0],al[1]+pv[1]);ctx.rotate(-Math.PI/2);ctx.drawImage(L.im,-gx*s,-gy*s,S.W*s,S.H*s);ctx.restore();X.draws++;return true}
    if(FLIP[L.t]){ctx.save();ctx.translate(al[0]+pv[0],al[1]+pv[1]);ctx.scale(-1,1);ctx.drawImage(L.im,-gx*s,-gy*s,S.W*s,S.H*s);ctx.restore();X.draws++;return true}
    ctx.drawImage(L.im,al[0]+pv[0]-gx*s,al[1]+pv[1]-gy*s,S.W*s,S.H*s);X.draws++;return true}catch(e){X.err='draw '+e.message;return false}};
console.info('[WLOOK] wlook179 ready, looks:',D.length);
})();

