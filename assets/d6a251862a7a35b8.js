
/* ---- r155 millredraw_c (TEST ONLY): new mill house (Art mill_r3, house only) + Art's 6-frame spinning wheel (mill_wheel_spin_r1) replace the old mill picture AND the old separate code-drawn wheel. DEFAULT ON when PROPSREDRAW is on. ?millredraw=off = old house + old wheel + old foam (m10_a_mill stays in PROPSREDRAW.skip); ?propsredraw=off also gives the old mill.
   House: scaled so its visible height = the OLD house visible height (331 px), base_anchor_png on the OLD visible bottom-centre (local 7.2, 82), as r151. Wheel: hub_png on the house axle_tip_png, in front of the house, the old foam rings between house and wheel. No squash, no code rotation: 6 frames = one 30 degree step, looped at the old wheel's speed (0.3 rad/s => 6 frames per 0.5236 rad => MILLREDRAW.fps = 3.44 frames/s, one loop 1.75 s). MILLREDRAW.blend (default true) crossfades frame a -> a+1.
   Per-frame normalising (Art frames are uneven: visible height 394 px f1 -> 386 px f6, centre drifts ~3.5 px): every frame is scaled so its opaque bounding-box height equals f1's and shifted so its bbox centre equals f1's bbox centre; MILLREDRAW.norm=false shows the raw frames. Hero-behind fade (0.55), collision and depth are the old ones. ---- */
(function(){'use strict';
const MS=window.MILLREDRAW={ver:'millredraw-r155-frames',err:null,spin:.3,fps:0,blend:true,norm:true,oldHouse:{h:331,bx:7.2,by:82},oldWheelH:197,ready:false,k:0,kw:0,frames:0,fb:[]};
try{
const Qs=String(location.search);MS.on=true;/* r157: ?millredraw=off is gone */
const PR=window.PROPSREDRAW,M=window.__MILL_R3,W=window.__MILL_WHEEL_R1;if(!PR||!M||!W){MS.err='no PROPSREDRAW or pack';return}
const STEP=Math.PI/6;MS.fps=MS.spin/STEP*W.frames.length;
const hi=new Image();hi.src=M.house.src;const wf=W.frames.map(s=>{const i=new Image();i.src=s;return i});
const bbox=im=>{const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0);const d=g.getImageData(0,0,c.width,c.height).data;let x0=c.width,y0=c.height,x1=-1,y1=-1;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]>40){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}return {x0,y0,x1,y1,h:y1-y0+1,w:x1-x0+1,cx:(x0+x1+1)/2,cy:(y0+y1+1)/2}};
let HB=null;
const prep=()=>{if(MS.ready)return true;if(!(hi.complete&&hi.naturalWidth&&wf.every(i=>i.complete&&i.naturalWidth)))return false;HB=bbox(hi);MS.fb=wf.map(bbox);MS.k=MS.oldHouse.h/HB.h;MS.kw=MS.oldWheelH/MS.fb[0].h;MS.hb=HB;
 /* per-frame draw params relative to the hub: dest top-left = hub + (ox,oy)*kw, size = (w*s, h*s)*kw */
 const f1=MS.fb[0],hub=W.hub;MS.fp=MS.fb.map((b,i)=>{const s=1/*raw*/,sn=f1.h/b.h;return {raw:{s:1,ox:-hub[0],oy:-hub[1]},norm:{s:sn,ox:f1.cx-b.cx*sn-hub[0],oy:f1.cy-b.cy*sn-hub[1]}}});MS.ready=true;return true};
try{delete PR.skip.m10_a_mill}catch(_){}try{if(PR.table)delete PR.table.m10_a_mill}catch(_){}
const T=.866;
const wheel=(c,hx,hy,tm)=>{const n=wf.length,ph=((tm*MS.fps)%n+n)%n,a=Math.floor(ph),f=ph-a,b=(a+1)%n,key=MS.norm?'norm':'raw',kw=MS.kw;
 const dr=(i,al)=>{const p=MS.fp[i][key],im=wf[i];c.save();if(al<1)c.globalAlpha*=al;c.drawImage(im,hx+p.ox*kw,hy+p.oy*kw,im.naturalWidth*p.s*kw,im.naturalHeight*p.s*kw);c.restore()};
 dr(a,1);if(MS.blend&&f>0.001)dr(b,f)};
const hook=()=>{const d=typeof PROP_DEFS!=='undefined'&&PROP_DEFS.m10_a_mill;if(!d||typeof d.live!=='function'){return false}if(d.__r155)return true;const oldLive=d.live;d.__r155=1;MS.oldLive=oldLive;
 d.live=function(c,p){if(!PR.on||!prep())return oldLive.apply(this,arguments);try{
  const A=window.__M10_ART.a_mill;const cx=p.x-A.fx+A.gw/2,b=!!P&&Math.abs(P.x-cx)<A.gw*1.05*.42&&P.y<p.y-6&&P.y>p.y-A.gh/T*.95;p.m10al=(p.m10al==null?1:p.m10al)+((b?.55:1)-(p.m10al==null?1:p.m10al))*.15;
  const k=MS.k,tx=p.x+MS.oldHouse.bx-M.house.base[0]*k,ty=p.y+MS.oldHouse.by-M.house.base[1]*k;
  c.save();if(p.m10al<1)c.globalAlpha*=p.m10al;c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  c.drawImage(hi,tx,ty,M.house.w*k,M.house.h*k);
  /* old foam rings at the race, same look/place/timing as the old wheelAt (drawn between house and wheel) */
  try{const A4=window.__M4T_ART,D=window.__M10_DATA;const ra=A4&&(A4['ring-foam-thick']||A4['ring-thin']);if(ra&&ra.src&&D){if(!MS.ring){MS.ring=new Image();MS.ring.src=ra.src;const m0=(D.newp.find(n=>n[0]==='a_mill')||[0,2136,1300]).slice(1);MS.roff=[D.race[0]-m0[0],D.race[1]-m0[1]]}const r=MS.ring;if(r.complete&&r.naturalWidth){const rx=p.x+MS.roff[0],ry=p.y+MS.roff[1]-8,tm=(typeof time==='number'?time:performance.now()/1000);for(let i=0;i<2;i++){const q=(tm*.5+i*.5)%1;c.save();c.globalAlpha*=.45*(1-q);const w=70+q*60;c.drawImage(r,rx-w/2,ry-w*.22,w,w*.44);c.restore()}}}}catch(e){MS.err='foam '+e.message}
  const hx=tx+M.house.axle[0]*k,hy=ty+M.house.axle[1]*k,tm2=(typeof time==='number'?time:performance.now()/1000);
  wheel(c,hx,hy,tm2);
  c.restore();MS.frames++}catch(e){MS.err='draw '+e.message}};return true};
if(!hook()){let n=0;const iv=setInterval(()=>{if(hook())clearInterval(iv)},1000)}
}catch(e){MS.err=e.message}
})();

