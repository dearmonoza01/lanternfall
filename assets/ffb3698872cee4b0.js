
/* scythe_waves_r5 fx_scythe_waves_single_r3.js (Art, DeaRz 09:38): replaces fx_art.js (r1b); ?scywave=r1b keeps the old waves; r22 patches: SCYFX._L export + low-graphics cap hooks (SCYFX_CAP: fewer band / ring segments and motes) */
if(!/[?&]scywave=r1b\b/.test(location.search)){
// SCYFX: code-drawn attack waves for the scythe combo demo (Motion placeholder, NOT final VFX).
// Layers per hit: blade ribbon (swing) -> release wave by type -> lingering motes/dust (follow-through). Nothing pops: every piece grows in and fades out.
// Types: arc (crescent flies forward), spin (ring around body, back half behind the hero), twirl (flat disc overhead),
//        ring (ground shockwave + dust), slam (ground impact: flash, spikes, chips, cracks), thrust (piercing spear wave).
(function(){
var L=[], H=[], TAU=Math.PI*2;
var LIFE={arc:0.55,spin:0.5,twirl:0.38,ring:0.65,slam:0.8,thrust:0.45};
function rng(s){ s=(s%2147483646)+1; return function(){ s=s*16807%2147483647; return (s-1)/2147483646; }; }
function eo(x){ x=Math.max(0,Math.min(1,x)); return 1-(1-x)*(1-x)*(1-x); }
function cl(x){ return Math.max(0,Math.min(1,x)); }
function C(r,g,b,a){ return 'rgba('+r+','+g+','+b+','+Math.max(0,Math.min(1,a)).toFixed(3)+')'; }
var VIO=[176,128,255], CY=[140,228,255], WH=[255,255,255];
// r2 Art 12 Nov 09:15 (DeaRz: first scythe waves + more wave blades, wider). BLADES = [offset in wave widths, width factor, alpha factor, taper power]
var BLADES=[]; // r3 DeaRz 09:21: ONE wave only, no stacked blades -> the single band is made wider instead
var WW=1.9;
// tapered band along an ellipse arc: points from angle a0 to a1, width follows sin
function band(g,cx,cy,rx,ry,rot,a0,a1,w,col,al,taper){ var n=(window.SCYFX_CAP?16:28), out=[], inn=[];
  for(var i=0;i<=n;i++){ var u=i/n, a=a0+(a1-a0)*u, k=taper==='flat'?1:Math.sin(Math.PI*u), ww=w*k;
    var ex=Math.cos(a), ey=Math.sin(a), px=ex*(rx+ww/2), py=ey*(ry+ww*ry/rx/2), qx=ex*(rx-ww/2), qy=ey*(ry-ww*ry/rx/2);
    var cr=Math.cos(rot), sr=Math.sin(rot);
    out.push([cx+px*cr-py*sr, cy+px*sr+py*cr]); inn.push([cx+qx*cr-qy*sr, cy+qx*sr+qy*cr]); }
  g.fillStyle=C(col[0],col[1],col[2],al); g.beginPath(); g.moveTo(out[0][0],out[0][1]);
  for(i=1;i<out.length;i++) g.lineTo(out[i][0],out[i][1]); for(i=inn.length-1;i>=0;i--) g.lineTo(inn[i][0],inn[i][1]); g.closePath(); g.fill(); }
function glow(g,x,y,r,col,al){ if(r<=0||al<=0) return; var gr=g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,C(255,255,255,al)); gr.addColorStop(0.35,C(col[0],col[1],col[2],al*0.7)); gr.addColorStop(1,C(col[0],col[1],col[2],0)); g.fillStyle=gr; g.beginPath(); g.arc(x,y,r,0,TAU); g.fill(); }
function mkMotes(r,n,spd,spread,life){ var a=[]; for(var i=0;i<n;i++) a.push({a:r()*TAU,u:r(),d:r()*0.15,v:spd*(0.5+r()),s:spread*(r()-0.5),life:life*(0.6+0.4*r()),sz:3+r()*4,c:r()<0.5?CY:VIO}); return a; }

window.SCYFX={_L:L,
 clear:function(){ L.length=0; H.length=0; },
 // record the blade each frame while a hit is active
 blade:function(T,tip,heel,on){ if(on) H.push({t:T,a:tip,b:heel}); while(H.length&&(T-H[0].t>0.13||T<H[0].t)) H.shift(); },
 spawn:function(type,T,o){ var r=rng(Math.floor(T*1000)+type.length*7919+(o.seed||0)); o.type=type; o.t0=T; o.w=window.FXW||1; o.r=r; o.life=LIFE[type]||0.5;
  o.m=mkMotes(r,window.SCYFX_CAP?6:(type==='slam'?16:12),type==='ring'||type==='slam'?240:180,1,o.life);
  if(type==='slam'){ o.sp=[]; for(var i=0;i<9;i++) o.sp.push({a:-Math.PI*(0.12+0.76*r()),l:90+r()*110}); o.ck=[]; for(i=0;i<5;i++){ var pts=[[0,0]], ang=(r()-0.5)*Math.PI*0.9+(r()<0.5?0:Math.PI), x=0,y=0; for(var j=0;j<4;j++){ x+=Math.cos(ang+(r()-0.5)*0.8)*28; y+=Math.sin(ang+(r()-0.5)*0.8)*7; pts.push([x,y]); } o.ck.push(pts); } o.ch=[]; for(i=0;i<12;i++) o.ch.push({vx:(r()-0.5)*520,vy:-260-r()*380,sz:3+r()*5}); }
  if(type==='ring') { o.du=[]; for(i=0;i<10;i++) o.du.push({a:r()*TAU,s:0.7+r()*0.6,z:r()}); }
  L.push(o); },
 // layer 'back' = behind the hero (ground + back half of rings), 'front' = over the hero
 draw:function(g,T,layer){ var keep=[];
  for(var i=0;i<L.length;i++){ var o=L[i], age=T-o.t0; if(age<0||age>o.life+0.4) continue; keep.push(o); var w=o.w||1, c=o.type==='arc'||o.type==='thrust'?[o.x,o.y]:o.type==='ring'?[o.X,o.gy]:o.type==='slam'?[o.x,o.gy]:[o.X,o.y];
   g.save(); if(w!==1){ g.translate(c[0],c[1]); g.scale(w,w); g.translate(-c[0],-c[1]); } if(window.SCYCODE_ON!==false) this['d_'+o.type](g,o,age,age/o.life,layer); if(window.SCYPAINT&&window.SCYPAINT_ON!==false) window.SCYPAINT.draw(g,o,age,age/o.life,layer); g.restore(); }
  if(layer==='front'){ L.length=0; Array.prototype.push.apply(L,keep); this.ribbon(g,T); } },
 ribbon:function(g,T){ if(H.length<2) return; g.save(); g.globalCompositeOperation='lighter';
  for(var i=1;i<H.length;i++){ var p=H[i-1], q=H[i]; if(q.t-p.t>0.05) continue; var dd=Math.abs(q.a[0]-p.a[0])+Math.abs(q.a[1]-p.a[1]); if(dd>220) continue; var al=cl(1-(T-q.t)/0.13);
   g.fillStyle=C(VIO[0],VIO[1],VIO[2],0.28*al); g.beginPath(); g.moveTo(p.a[0],p.a[1]); g.lineTo(q.a[0],q.a[1]); g.lineTo(q.b[0],q.b[1]); g.lineTo(p.b[0],p.b[1]); g.closePath(); g.fill();
   var mx=(p.a[0]*0.7+p.b[0]*0.3), my=(p.a[1]*0.7+p.b[1]*0.3), nx=(q.a[0]*0.7+q.b[0]*0.3), ny=(q.a[1]*0.7+q.b[1]*0.3);
   g.fillStyle=C(CY[0],CY[1],CY[2],0.45*al); g.beginPath(); g.moveTo(p.a[0],p.a[1]); g.lineTo(q.a[0],q.a[1]); g.lineTo(nx,ny); g.lineTo(mx,my); g.closePath(); g.fill();
   g.strokeStyle=C(255,255,255,0.9*al); g.lineWidth=1+3*al*al; g.lineCap='round'; g.beginPath(); g.moveTo(p.a[0],p.a[1]); g.lineTo(q.a[0],q.a[1]); g.stroke(); }
  g.restore(); },
 motes:function(g,o,age,ox,oy,dirx,flat){ for(var i=0;i<o.m.length;i++){ var m=o.m[i], t=age-m.d; if(t<0||t>m.life) continue; var k=t/m.life, d=m.v*eo(k)*0.6;
   var x=ox+(dirx?dirx*d+Math.cos(m.a)*30*m.u:Math.cos(m.a)*d), y=oy+(flat?Math.sin(m.a)*d*0.3:Math.sin(m.a)*d*0.5)-40*k;
   glow(g,x,y,m.sz*(1.6-k),m.c,0.8*(1-k)); } },
 d_arc:function(g,o,age,k,layer){ if(layer!=='front'||k>1) return; g.save(); g.globalCompositeOperation='lighter';
  var fw=o.fw, d=380*eo(k), R=95*(1+0.45*k), base=fw>0?0:Math.PI, tilt=(o.tilt||0)*fw, cx=o.x+fw*d-fw*R*0.55, cy=o.y, gi=cl(age/0.06), al=gi*(1-k*k);
  var sp=0.95; band(g,cx,cy,R,R,base+tilt,-sp,sp,60*WW*(1-0.5*k),VIO,0.32*al); band(g,cx,cy,R,R,base+tilt,-sp,sp,34*WW*(1-0.5*k),CY,0.7*al); band(g,cx,cy,R+6,R+6,base+tilt,-sp*0.85,sp*0.85,10*WW*(1-0.4*k),WH,0.95*al);
  for(var bl=0;bl<BLADES.length;bl++){ var B=BLADES[bl], ro=B[0]*34, sp2=sp*(1-0.12*Math.abs(B[0])); band(g,cx,cy,R+ro,R+ro,base+tilt,-sp2,sp2,48*B[1]*(1-0.5*k),VIO,0.24*al*B[2]); band(g,cx,cy,R+ro,R+ro,base+tilt,-sp2,sp2,26*B[1]*(1-0.5*k),CY,0.55*al*B[2]); band(g,cx,cy,R+ro+3,R+ro+3,base+tilt,-sp2*0.85,sp2*0.85,7*B[1]*(1-0.4*k),WH,0.75*al*B[2]); }
  /* r3: trailing echo crescents removed (one wave) */
  this.motes(g,o,age,o.x+fw*d*0.6,cy,fw,false); g.restore(); },
 ringPart:function(g,o,age,k,layer,cx,cy,rx,ry,w,sweepT,spin){ // draws the sweep ring; back half (sin<0) in back layer
  var head=o.a0+spin*TAU*eo(age/sweepT), tail=head-spin*TAU*0.85, al=cl(age/0.04)*(1-k*k), n=(window.SCYFX_CAP?20:36);
  for(var i=0;i<n;i++){ var u0=i/n, u1=(i+1)/n, a=tail+(head-tail)*u0, b=tail+(head-tail)*u1, mid=(a+b)/2, back=Math.sin(mid)<0;
   if((layer==='back')!==back) continue; var f=u1*u1;
   band(g,cx,cy,rx,ry,0,a,b+0.02*spin,w*WW*f*1.6,VIO,0.3*al,'flat'); band(g,cx,cy,rx,ry,0,a,b+0.02*spin,w*WW*f,CY,0.65*al,'flat'); band(g,cx,cy,rx+2,ry+1,0,a,b+0.02*spin,w*WW*f*0.3,WH,0.9*al,'flat');
   // r2 (DeaRz 09:10/09:13): extra wave blades outside and inside -> wider wave
   for(var bl=0;bl<BLADES.length;bl++){ var B=BLADES[bl], fo=Math.pow(u1,B[3]), ro=B[0]*w; if(fo<0.02) continue; band(g,cx,cy,rx+ro,ry+ro*ry/rx,0,a,b+0.02*spin,w*fo*B[1]*1.6,VIO,0.22*al*B[2],'flat'); band(g,cx,cy,rx+ro,ry+ro*ry/rx,0,a,b+0.02*spin,w*fo*B[1],CY,0.5*al*B[2],'flat'); band(g,cx,cy,rx+ro+1,ry+(ro+1)*ry/rx,0,a,b+0.02*spin,w*fo*B[1]*0.25,WH,0.7*al*B[2],'flat'); } }
  },
 d_spin:function(g,o,age,k,layer){ if(k>1) return; g.save(); g.globalCompositeOperation='lighter'; var e=1+0.35*eo(cl((age-0.2)/0.3));
  this.ringPart(g,o,age,k,layer,o.X,o.y,170*e,46*e,30,0.22,o.spin);
  if(layer==='front') this.motes(g,o,age,o.X,o.y,0,true); g.restore(); },
 d_twirl:function(g,o,age,k,layer){ if(k>1) return; g.save(); g.globalCompositeOperation='lighter';
  this.ringPart(g,o,age,k,layer,o.X,o.y,135,26,22,0.16,o.spin); /* r3: second inner ring removed (one wave) */
  if(layer==='front') this.motes(g,o,age,o.X,o.y,0,true); g.restore(); },
 d_ring:function(g,o,age,k,layer){ if(k>1) return; var X=o.X, Y=o.gy;
  for(var w=0;w<1;w++){ var kk=cl((age-w*0.09)/o.life); if(kk<=0) continue; var rx=40+270*eo(kk), ry=rx*0.22, al=(1-kk)*(1-kk)*cl((age-w*0.09)/0.05);
   g.save(); g.globalCompositeOperation='lighter'; g.lineWidth=((16-6*w)*(1-kk)+2)*WW;
   g.strokeStyle=C(CY[0],CY[1],CY[2],0.55*al); g.beginPath(); if(layer==='back') g.ellipse(X,Y,rx,ry,0,Math.PI,TAU); else g.ellipse(X,Y,rx,ry,0,0,Math.PI); g.stroke();
   g.strokeStyle=C(255,255,255,0.7*al); g.lineWidth=3*(1-kk)+0.5; g.stroke();
   for(var bl=0;bl<BLADES.length;bl++){ var B=BLADES[bl], ro=B[0]*16, rx2=Math.max(4,rx+ro); g.lineWidth=((16-6*w)*(1-kk)+2)*B[1]; g.strokeStyle=C(CY[0],CY[1],CY[2],0.42*al*B[2]); g.beginPath(); if(layer==='back') g.ellipse(X,Y,rx2,rx2*0.22,0,Math.PI,TAU); else g.ellipse(X,Y,rx2,rx2*0.22,0,0,Math.PI); g.stroke(); g.strokeStyle=C(255,255,255,0.5*al*B[2]); g.lineWidth=2*(1-kk)+0.5; g.stroke(); }
   g.restore(); }
  if(layer==='back'){ for(var i=0;i<o.du.length;i++){ var d=o.du[i], kd=cl((age-0.03)/(o.life+0.35)); if(kd<=0||kd>=1) continue; var rr=(60+230*eo(kd))*d.s, x=X+Math.cos(d.a)*rr, y=Y+Math.sin(d.a)*rr*0.22-30*kd*d.s, s=18+40*kd;
    var gr=g.createRadialGradient(x,y,0,x,y,s); gr.addColorStop(0,C(214,204,186,0.35*(1-kd))); gr.addColorStop(1,C(214,204,186,0)); g.fillStyle=gr; g.beginPath(); g.arc(x,y,s,0,TAU); g.fill(); } }
  else { g.save(); g.globalCompositeOperation='lighter'; this.motes(g,o,age,X,Y-10,0,true); g.restore(); } },
 d_slam:function(g,o,age,k,layer){ if(k>1) return; var X=o.x, Y=o.gy;
  if(layer==='back'){ // cracks + ground ring
   var ca=cl(age/0.05)*(1-k); g.save(); g.strokeStyle=C(40,20,60,0.55*ca); g.lineWidth=3; o.ck.forEach(function(pts){ g.beginPath(); g.moveTo(X,Y); pts.forEach(function(p){ g.lineTo(X+p[0],Y+p[1]); }); g.stroke(); });
   g.globalCompositeOperation='lighter'; g.strokeStyle=C(VIO[0],VIO[1],VIO[2],0.5*ca); g.lineWidth=2; o.ck.forEach(function(pts){ g.beginPath(); g.moveTo(X,Y); pts.forEach(function(p){ g.lineTo(X+p[0],Y+p[1]); }); g.stroke(); });
   var kr=cl(age/0.5), rx=30+220*eo(kr); g.strokeStyle=C(CY[0],CY[1],CY[2],0.6*(1-kr)); g.lineWidth=(12*(1-kr)+1)*WW; g.beginPath(); g.ellipse(X,Y,rx,rx*0.22,0,0,TAU); g.stroke(); g.restore(); return; }
  g.save(); g.globalCompositeOperation='lighter';
  glow(g,X,Y-10,40+110*eo(cl(age/0.12)),CY,0.9*cl(1-age/0.25));
  o.sp.forEach(function(s,i){ var ks=cl((age-i*0.008)/0.32); if(ks<=0||ks>=1) return; var l=s.l*eo(ks), l0=s.l*eo(cl(ks-0.35)); g.strokeStyle=C(255,255,255,0.9*(1-ks)); g.lineWidth=5*(1-ks)+1; g.lineCap='round'; g.beginPath(); g.moveTo(X+Math.cos(s.a)*l0,Y+Math.sin(s.a)*l0); g.lineTo(X+Math.cos(s.a)*l,Y+Math.sin(s.a)*l); g.stroke(); });
  g.restore(); g.save(); o.ch.forEach(function(c){ var t=age; if(t>o.life) return; var x=X+c.vx*t, y=Y+c.vy*t+900*t*t; if(y>Y+6) return; g.fillStyle=C(90,70,110,0.9*(1-t/o.life)); g.fillRect(x-c.sz/2,y-c.sz/2,c.sz,c.sz); });
  g.restore(); },
 d_thrust:function(g,o,age,k,layer){ if(layer!=='front'||k>1) return; g.save(); g.globalCompositeOperation='lighter'; var fw=o.fw, d=420*eo(k), al=cl(age/0.04)*(1-k*k), x=o.x+fw*d, y=o.y, Lg=230*(1-0.4*k), h=22*WW*(1-0.5*k);
  [].forEach(function(sd){ var off=sd*h*1.25, sc=Math.abs(sd)===1?0.75:0.5; [[VIO,1.6,0.25],[CY,0.9,0.55],[WH,0.3,0.7]].forEach(function(s){ g.fillStyle=C(s[0][0],s[0][1],s[0][2],s[2]*al*sc); g.beginPath(); g.moveTo(x+fw*40*sc,y+off*0.4); g.quadraticCurveTo(x-fw*Lg*0.3*sc,y+off-h*s[1]*sc,x-fw*Lg*sc,y+off); g.quadraticCurveTo(x-fw*Lg*0.3*sc,y+off+h*s[1]*sc,x+fw*40*sc,y+off*0.4); g.fill(); }); });
  [[VIO,2.2,0.3],[CY,1.2,0.7],[WH,0.4,0.95]].forEach(function(s){ g.fillStyle=C(s[0][0],s[0][1],s[0][2],s[2]*al); g.beginPath(); g.moveTo(x+fw*40,y); g.quadraticCurveTo(x-fw*Lg*0.3,y-h*s[1],x-fw*Lg,y); g.quadraticCurveTo(x-fw*Lg*0.3,y+h*s[1],x+fw*40,y); g.fill(); });
  var kr=cl(age/0.3); g.strokeStyle=C(CY[0],CY[1],CY[2],0.7*(1-kr)); g.lineWidth=8*(1-kr)+1; g.beginPath(); g.ellipse(o.x+fw*30,y,14+30*kr,40+70*kr,0,0,TAU); g.stroke();
  this.motes(g,o,age,o.x+fw*d*0.5,y,fw,false); g.restore(); }
};
})();

window.SCYWAVE='single_r3';}
