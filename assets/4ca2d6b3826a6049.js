
/* ---- puppet_hairmesh_pack_r2 hairmesh_h23.js (behind ?sway=on) ---- */
// Lanternfall chibi hero: hair mesh warp r2 SOFT + idle breathing (Art RIG_HAIRMESH_r3 + RIG_SKIRT_r4_RIGID; DeaRz 13:48 "ให้ครบทีเดียว") (Code, 9 Nov 2026)
// Load AFTER looks_h14.js (NOT skirt_h22/sway_h21: skirt is rigid = full {o}_torso, no hem part).
// PUPPET.setSway(true|false) (game flag ?sway=on, default off). Off = exactly the r6 look.
// Each pose(): a damped 2D spring gives a hair-local displacement; the hair (and hair_back x1.25) is redrawn into an offscreen
// canvas as a 30 px triangle grid where grid points over the skull/face have weight 0 (never move) and points away from the head move more.
(function(){
'use strict';
var U=window.PUPPET, P=U.P, cfg=U.cfg, slots=U.slots, AL=window.PUPPET_ALIGN=window.PUPPET_ALIGN||{};
cfg.SWAY = cfg.SWAY===true; // default off until setSway(true)
var HMS=U.HMS={walk:4, run:8, step:0.08, bob:0.02, idle:1.5, k:90, c:9, max:12, R:90, D0:25, grid:30, back:1.25, breath:0.016, breathT:2.8}; // r2 SOFT (DeaRz 13:56 too strong)
var HM={dx:0,dy:0,vx:0,vy:0,py:null,pt:0,t:0};
function mul(a,b){ return [a[0]*b[0]+a[2]*b[1], a[1]*b[0]+a[3]*b[1], a[0]*b[2]+a[2]*b[3], a[1]*b[2]+a[3]*b[3], a[0]*b[4]+a[2]*b[5]+a[4], a[1]*b[4]+a[3]*b[5]+a[5]]; }
function inv(m){ var d=m[0]*m[3]-m[1]*m[2]; return [m[3]/d,-m[1]/d,-m[2]/d,m[0]/d,(m[2]*m[5]-m[3]*m[4])/d,(m[1]*m[4]-m[0]*m[5])/d]; }
function ap(m,x,y){ return [m[0]*x+m[2]*y+m[4], m[1]*x+m[3]*y+m[5]]; }
function key(k){ return slots[k]||P[k].img||k; }
function img(k){ return U.imgs[key(k)]; }
function al(im){ return AL[im._key]||[0,0]; }
var HDF=null, HWC={};
function amap(im){ try{ var c=document.createElement('canvas'); c.width=im.width; c.height=im.height; var x=c.getContext('2d'); x.drawImage(im,0,0); return {d:x.getImageData(0,0,im.width,im.height).data,w:im.width,h:im.height}; }catch(e){ return {}; } }
function headField(){ var im=img('head'); if(!im||!im.width) return null; var hk=key('head'); if(HDF&&HDF.key===hk) return HDF;
  var A=amap(im); if(!A.d) return null; var S=4, w=Math.ceil(A.w/S), h=Math.ceil(A.h/S), D=new Float32Array(w*h), BIG=1e6, x, y, i, v;
  for(y=0;y<h;y++)for(x=0;x<w;x++){ var o=A.d[((Math.min(A.h-1,y*S))*A.w+Math.min(A.w-1,x*S))*4+3]; D[y*w+x]=o>100?0:BIG; }
  for(y=0;y<h;y++)for(x=0;x<w;x++){ i=y*w+x; v=D[i]; if(x>0)v=Math.min(v,D[i-1]+1); if(y>0)v=Math.min(v,D[i-w]+1); if(x>0&&y>0)v=Math.min(v,D[i-w-1]+1.414); if(x<w-1&&y>0)v=Math.min(v,D[i-w+1]+1.414); D[i]=v; }
  for(y=h-1;y>=0;y--)for(x=w-1;x>=0;x--){ i=y*w+x; v=D[i]; if(x<w-1)v=Math.min(v,D[i+1]+1); if(y<h-1)v=Math.min(v,D[i+w]+1); if(x<w-1&&y<h-1)v=Math.min(v,D[i+w+1]+1.414); if(x>0&&y<h-1)v=Math.min(v,D[i+w-1]+1.414); D[i]=v; }
  HDF={key:hk,w:w,h:h,S:S,D:D}; return HDF; }
var W0=null, W0k='';
function W0REST(){ var k=JSON.stringify(P.hair.at)+JSON.stringify(P.hair.pivot)+JSON.stringify(P.head.at)+JSON.stringify(cfg.SC||{}); if(W0&&W0k===k) return W0; W0k=k; W0=U.solve({}); return W0; }
function hairWeights(k,im,a){ var hf=headField(); if(!hf) return null; var hi=img('head'), ha=al(hi), W=W0REST(); if(!W[k]||!W.head) return null;
  var ck=k+'|'+im._key+'|'+hf.key+'|'+W0k+JSON.stringify(a)+'|'+HMS.R+'|'+HMS.D0; if(HWC[ck]) return HWC[ck];
  var g=HMS.grid, nx=Math.ceil(im.width/g)+1, ny=Math.ceil(im.height/g)+1, m=mul(inv(W.head),W[k]), wt=new Float32Array(nx*ny);
  for(var j=0;j<ny;j++)for(var i=0;i<nx;i++){ var u=Math.min(im.width,i*g), v=Math.min(im.height,j*g), q=ap(m,u+a[0],v+a[1]), hx=(q[0]-ha[0])/hf.S, hy=(q[1]-ha[1])/hf.S, d;
    if(hx<0||hy<0||hx>=hf.w||hy>=hf.h){ var cx=Math.max(0,Math.min(hf.w-1,hx)), cy=Math.max(0,Math.min(hf.h-1,hy)); d=hf.D[(cy|0)*hf.w+(cx|0)]+Math.hypot(hx-cx,hy-cy); } else d=hf.D[(hy|0)*hf.w+(hx|0)];
    var t=Math.max(0,Math.min(1,(d*hf.S-(HMS.D0||0))/HMS.R)); wt[j*nx+i]=t*t*(3-2*t); }
  return HWC[ck]={nx:nx,ny:ny,g:g,w:wt}; }
function triDraw(x,im,s0,s1,s2,d0,d1,d2){ var cx=(d0[0]+d1[0]+d2[0])/3, cy=(d0[1]+d1[1]+d2[1])/3, e=2.5;
  function ex(p){ var vx=p[0]-cx, vy=p[1]-cy, l=Math.hypot(vx,vy)||1; return [p[0]+vx/l*e, p[1]+vy/l*e]; }
  var a=ex(d0), b=ex(d1), c=ex(d2); x.save(); x.beginPath(); x.moveTo(a[0],a[1]); x.lineTo(b[0],b[1]); x.lineTo(c[0],c[1]); x.closePath(); x.clip();
  var x1=s1[0]-s0[0], y1=s1[1]-s0[1], x2=s2[0]-s0[0], y2=s2[1]-s0[1], X1=d1[0]-d0[0], Y1=d1[1]-d0[1], X2=d2[0]-d0[0], Y2=d2[1]-d0[1], det=x1*y2-x2*y1; if(!det){ x.restore(); return; }
  var A=(X1*y2-X2*y1)/det, B=(Y1*y2-Y2*y1)/det, C=(X2*x1-X1*x2)/det, D=(Y2*x1-Y1*x2)/det;
  x.transform(A,B,C,D,d0[0]-A*s0[0]-C*s0[1],d0[1]-B*s0[0]-D*s0[1]); x.drawImage(im,0,0); x.restore(); }
var PAD=56, CV={}, SRC={hair:null,hair_back:null};
function renderMesh(k){ var srcKey=SRC[k]; var im=srcKey&&U.imgs[srcKey]; if(!im||!im.width) return false;
  var a=al(im), hw=hairWeights(k,im,a); if(!hw) return false;
  var c=CV[k]; if(!c){ c=CV[k]=document.createElement('canvas'); c._key='_hm_'+k; U.imgs[c._key]=c; }
  if(c.width!==im.width+2*PAD||c.height!==im.height+2*PAD){ c.width=im.width+2*PAD; c.height=im.height+2*PAD; }
  AL[c._key]=[a[0]-PAD,a[1]-PAD];
  var x=c.getContext('2d'); x.setTransform(1,0,0,1,0,0); x.clearRect(0,0,c.width,c.height);
  var g=hw.g, nx=hw.nx, ny=hw.ny, kk=k==='hair_back'?HMS.back:1;
  function S(i,j){ return [Math.min(im.width,i*g), Math.min(im.height,j*g)]; }
  function Dp(i,j){ var s=S(i,j), w=hw.w[j*nx+i]*kk; return [s[0]+PAD+HM.dx*w, s[1]+PAD+HM.dy*w]; }
  for(var j=0;j<ny-1;j++)for(var i=0;i<nx-1;i++){ var s00=S(i,j), s10=S(i+1,j), s01=S(i,j+1), s11=S(i+1,j+1);
    if(s10[0]<=s00[0]||s01[1]<=s00[1]) continue;
    var w4=hw.w[j*nx+i]+hw.w[j*nx+i+1]+hw.w[(j+1)*nx+i]+hw.w[(j+1)*nx+i+1];
    if(w4===0){ var gx0=Math.max(0,s00[0]-2), gy0=Math.max(0,s00[1]-2), gx1=Math.min(im.width,s11[0]+2), gy1=Math.min(im.height,s11[1]+2); x.drawImage(im,gx0,gy0,gx1-gx0,gy1-gy0,gx0+PAD,gy0+PAD,gx1-gx0,gy1-gy0); continue; } // r5 SEAM FIX: grow 2 px
    var d00=Dp(i,j), d10=Dp(i+1,j), d01=Dp(i,j+1), d11=Dp(i+1,j+1);
    triDraw(x,im,s00,s10,s11,d00,d10,d11); triDraw(x,im,s00,s11,s01,d00,d11,d01); }
  return true; }
var ORIG={};
function restoreSlots(){ ['hair','hair_back'].forEach(function(k){ if(ORIG[k]){ if(slots[k]&&/^_hm_/.test(slots[k])){ if(ORIG[k].v===undefined) delete slots[k]; else slots[k]=ORIG[k].v; } delete ORIG[k]; } }); }
var baseTorso=null;
function restoreBreath(){ if(baseTorso!=null){ cfg.SC.torso=baseTorso; baseTorso=null; } }
['setOutfit','setGender','setLook','setHair','applyLayout'].forEach(function(f){ var b=U[f]; if(!b) return; U[f]=function(){ restoreSlots(); restoreBreath(); return b.apply(this,arguments); }; });
var basePose=U.pose;
U.pose=function(name,t,o){ restoreSlots(); restoreBreath(); var p=basePose(name,t,o); if(!cfg.SWAY) return p;
  var an=(name==='attack'||name==='slash'||p.attack)?'attack':name, rot=p.rot||{};
  var now=(window.performance?performance.now():Date.now())/1000, dt=HM.pt?Math.min(0.05,Math.max(0.001,now-HM.pt)):0.016; HM.pt=now; HM.t+=dt;
  // idle breathing
  if(an==='idle'){ cfg.SC=cfg.SC||{}; baseTorso=cfg.SC.torso!=null?cfg.SC.torso:1; cfg.SC.torso=baseTorso*(1+HMS.breath*Math.sin(HM.t*2*Math.PI/HMS.breathT)); }
  // hair spring
  var W=U.solve(p), hy=(W.head?W.head[5]:0)+(p.air||0)-(p.rootBob||0), vy=HM.py==null?0:(hy-HM.py)/dt; HM.py=hy; if(an==='attack') vy=0;
  var lr=(an==='walk'||an==='run')?((rot.leg_near||0)-(rot.leg_far||0)):0;
  var tx=(an==='walk'?HMS.walk:an==='run'?HMS.run:0)+HMS.step*lr+(an==='idle'?HMS.idle*Math.sin(HM.t*1.9):0), ty=-HMS.bob*vy;
  HM.vx+=(HMS.k*(tx-HM.dx)-HMS.c*HM.vx)*dt; HM.vy+=(HMS.k*(ty-HM.dy)-HMS.c*HM.vy)*dt; HM.dx+=HM.vx*dt; HM.dy+=HM.vy*dt;
  var L=Math.hypot(HM.dx,HM.dy); if(L>HMS.max){ HM.dx*=HMS.max/L; HM.dy*=HMS.max/L; }
  if(Math.abs(HM.dx)+Math.abs(HM.dy)>=0.05){ ['hair','hair_back'].forEach(function(k){ var sk=key(k); if(sk==='_none'||!U.imgs[sk]) return; ORIG[k]={v:slots[k]}; SRC[k]=sk; if(renderMesh(k)) slots[k]=CV[k]._key; else delete ORIG[k]; }); }
  return p; };
U.setSway=function(on){ restoreSlots(); restoreBreath(); cfg.SWAY=!!on; if(!on){ HM.dx=HM.dy=HM.vx=HM.vy=0; HM.py=null; } };
})();

