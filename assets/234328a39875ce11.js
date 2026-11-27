
/* ---- merge m36: p221 draw cost (sway canvases at shown resolution + mipmaps for static sprites) ---- */
/* p221 — draw cost (user 11 Oct 2026 08:28 "เริ่มได้เลย"): same picture, less pixel work. Nothing moves, no art is edited or replaced.
   1) Sway canvases (base slSwayCanvas + chibi-grass cgsway) are re-rendered every animation tick. They were rendered at the art's full
      resolution (e.g. 533×793 for a tree) and then shrunk on screen to ~1/6. Now each prop's sway canvas is rendered at the resolution it is
      actually shown at (power-of-2 step, never below the on-screen size): canvas = ceil(art/F), the strips are walked in whole canvas rows
      (no seams), the wind offset per strip is the same formula, then drawn by drawProp to exactly the same world rectangle as before.
      F follows the camera zoom (recomputed when the zoom changes the step); F=1 = old behaviour exactly.
   2) Static prop sprites (the canvases propSprite returns that are not sway canvases) and plain images drawn whole (5-argument drawImage)
      on the main canvas are drawn from a cached half / quarter / … copy when they are shrunk below 1/2 on screen (mipmap): the copy used is
      always at least the on-screen size. Atlas cut-outs (9-argument drawImage: hero / monster frames) are NOT touched.
   Debug window.__P221 (on, stats). */
(function(){'use strict';
const ST={ver:'p221-r3',on:true,swayRes:0,swayFull:0,mipDraws:0,mipBuilt:0,plain:0,err:null};window.__P221=ST;
const OD=CanvasRenderingContext2D.prototype.drawImage;
function scaleNow(){try{const m=ctx.getTransform();return Math.max(Math.hypot(m.a,m.b),Math.hypot(m.c,m.d));}catch(_){return 1;}}
/* --- 1) sway resolution --- */
ST.lvl=function(p,S){if(!ST.on)return 1;const d=(typeof PROP_DEFS!=='undefined')&&PROP_DEFS[p.t];if(!d||!S||!S.w)return 1;
  const k=scaleNow()*d.w*(p.s||1)/S.w;if(!(k>0)||k>=.5)return 1;return Math.min(8,Math.pow(2,Math.floor(Math.log2(1/k))));};
ST.fit=function(e,S,p){const F=ST.lvl(p,S);if(e.F===F&&e.c.__p221dyn)return false;
  const c=e.c;c.width=Math.ceil(S.w/F);c.height=Math.ceil(S.h/F);c.__p221dyn=true;e.F=F;e.g=c.getContext('2d');return true;};   // true = must redraw now
ST.strips=function(e,base,S,yf,SH,offAt){const T0=performance.now();try{ST._s(e,base,S,yf,SH,offAt);}finally{ST.ms=(ST.ms||0)+performance.now()-T0;ST.n=(ST.n||0)+1;}};ST._s=function(e,base,S,yf,SH,offAt){const g=e.g,c=e.c,Wd=c.width,Hd=c.height,fx=Wd/S.w,fy=Hd/S.h;g.clearRect(0,0,Wd,Hd);
  if(e.F===1){for(let y=0;y<yf;y+=SH){const h=Math.min(SH,yf-y);OD.call(g,base,0,y,S.w,h,offAt(y,h),y,S.w,h);}
    if(yf<S.h)OD.call(g,base,0,yf,S.w,S.h-yf,0,yf,S.w,S.h-yf);ST.swayFull++;return;}
  const yR=Math.min(Hd,Math.round(yf*fy)),sh=Math.max(3,Math.round(SH*fy));
  const L=0,src=base,sx=src.width/base.width,sy=src.height/base.height;   // r3: sampled straight from the full art (plain bilinear, as the old on-screen shrink did) → same crisp outlines
  for(let r=0;r<yR;r+=sh){const hr=Math.min(sh,yR-r),y=r/fy,h=hr/fy;OD.call(g,src,0,y*sy,S.w*sx,h*sy,offAt(y,h)*fx,r,Wd,hr);}
  if(yR<Hd)OD.call(g,src,0,yR/fy*sy,S.w*sx,(S.h-yR/fy)*sy,0,yR,Wd,Hd-yR);ST.swayRes++;};
/* --- 2) mipmaps for static sprites drawn whole --- */
const STATIC=new WeakSet(),MIP=new WeakMap();
if(typeof propSprite==='function'){const _ps=propSprite;propSprite=function(){const c=_ps.apply(this,arguments);if(c&&!c.__p221dyn&&c instanceof HTMLCanvasElement)STATIC.add(c);return c;};}
else ST.err='propSprite missing';
function mip(img,L){let a=MIP.get(img);if(!a){a=[img];MIP.set(img,a);}
  while(a.length<=L){const n=a.length,W0=img.naturalWidth||img.width,H0=img.naturalHeight||img.height,w=Math.max(1,Math.ceil(W0/Math.pow(2,n))),h=Math.max(1,Math.ceil(H0/Math.pow(2,n)));if(w<2||h<2)return a[a.length-1];
    const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='low';OD.call(g,img,0,0,w,h);a.push(c);ST.mipBuilt++;}   // r3: one plain bilinear shrink from the full art (same sampling as drawing it small directly) — no box averaging, outlines stay as crisp as before
  return a[L];}
if(typeof ctx!=='undefined'&&ctx){ctx.drawImage=function(img,x,y,w,h){
  if(ST.on&&arguments.length===5&&img){const isI=img instanceof HTMLImageElement;
    if((isI&&img.complete&&img.naturalWidth)||STATIC.has(img)){const sw=isI?img.naturalWidth:img.width,sh=isI?img.naturalHeight:img.height;
      if(sw*sh>=4096&&!img.__p221dyn){const m=this.getTransform(),k=Math.max(Math.abs(w)*Math.hypot(m.a,m.b)/sw,Math.abs(h)*Math.hypot(m.c,m.d)/sh);
        if(k>0&&k<.5){const L=Math.min(5,Math.floor(Math.log2(1/k)));if(L>=1){const mc=mip(img,L);ST.mipDraws++;return OD.call(this,mc,x,y,w,h);}}}}}
  ST.plain++;return OD.apply(this,arguments);};}
else ST.err=(ST.err?ST.err+'; ':'')+'ctx missing';
})();

