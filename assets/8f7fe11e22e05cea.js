
/* scythe_combo_r4 fx_art.js (Art r1b, DeaRz approved 12 Nov 04:21) + r17 cost-cap hooks */
// SCYFX (Art r1, 12 Nov): scythe combo waves restyled with the APPROVED SWORD WAVE look (balance r30 p269_hero_sword_r6: 5 side-by-side flame streaks
// + soft glow, colour ramp tail->head, lingers and drifts outward then fades). Same API/timing/types as Motion fx.js. Palette: window.SCYFX_PAL='reaper' (default) | 'fire' (sword colours).
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
var PALS={ reaper:{glow:[122,60,255],deep:[90,31,176],mid:[154,107,255],hot:[140,228,255],core:[240,251,255]},
           fire:{glow:[255,74,26],deep:[232,36,12],mid:[255,122,30],hot:[255,192,74],core:[255,244,204]} };
var P=PALS.reaper;
function setPal(){ P=PALS[window.SCYFX_PAL]||PALS.reaper; VIO=P.mid; CY=P.hot; }
function mixc(a,b,t){ return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]; }
// colour ramp along a streak like the sword wave: tail deep -> mid -> hot -> core at the head
function ramp(u,cols){ if(u<=0) return cols[0]; var n=cols.length-1, x=Math.min(0.9999,u)*n, i=Math.floor(x); return mixc(cols[i],cols[Math.min(n,i+1)],x-i); }
// sword-wave streak set: [normal offset (x half-width), width (x w), colour ramp, alpha, late start]
var STR=[[0,1,['mid','hot','core'],1,0],[-0.64,0.5,['deep','mid','hot'],0.85,0.06],[0.64,0.57,['deep','mid','hot'],0.85,0.03],[-1.2,0.29,['deep','mid'],0.7,0.12],[1.2,0.32,['deep','mid'],0.7,0.09]];
// tapered band along an ellipse arc: points from angle a0 to a1, width follows sin
function band(g,cx,cy,rx,ry,rot,a0,a1,w,col,al,taper){ var n=(window.SCYFX_CAP?14:28), out=[], inn=[];
  for(var i=0;i<=n;i++){ var u=i/n, a=a0+(a1-a0)*u, k=taper==='flat'?1:Math.sin(Math.PI*u), ww=w*k;
    var ex=Math.cos(a), ey=Math.sin(a), px=ex*(rx+ww/2), py=ey*(ry+ww*ry/rx/2), qx=ex*(rx-ww/2), qy=ey*(ry-ww*ry/rx/2);
    var cr=Math.cos(rot), sr=Math.sin(rot);
    out.push([cx+px*cr-py*sr, cy+px*sr+py*cr]); inn.push([cx+qx*cr-qy*sr, cy+qx*sr+qy*cr]); }
  g.fillStyle=C(col[0],col[1],col[2],al); g.beginPath(); g.moveTo(out[0][0],out[0][1]);
  for(i=1;i<out.length;i++) g.lineTo(out[i][0],out[i][1]); for(i=inn.length-1;i>=0;i--) g.lineTo(inn[i][0],inn[i][1]); g.closePath(); g.fill(); }
function glow(g,x,y,r,col,al){ if(r<=0||al<=0) return; var gr=g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,C(255,255,255,al)); gr.addColorStop(0.35,C(col[0],col[1],col[2],al*0.7)); gr.addColorStop(1,C(col[0],col[1],col[2],0)); g.fillStyle=gr; g.beginPath(); g.arc(x,y,r,0,TAU); g.fill(); }
function mkMotes(r,n,spd,spread,life){ var a=[]; for(var i=0;i<n;i++) a.push({a:r()*TAU,u:r(),d:r()*0.15,v:spd*(0.5+r()),s:spread*(r()-0.5),life:life*(0.6+0.4*r()),sz:3+r()*4,c:r()<0.5?CY:VIO}); return a; }

// ground wave in the sword-wave colour ramp: trailing deep band (tinted, readable on bright sand) -> mid -> hot -> thin core at the leading edge, + soft glow
function gwave(g,X,Y,rx,ry,w,al,layer){ if(al<=0) return; var a0=layer==='back'?Math.PI:0, a1=layer==='back'?TAU:Math.PI;
  function ring(off,lw,col,a,mode){ g.globalCompositeOperation=mode; g.strokeStyle=C(col[0],col[1],col[2],a); g.lineWidth=Math.max(0.5,lw); g.beginPath(); g.ellipse(X,Y,Math.max(1,rx+off),Math.max(1,(rx+off)*ry/rx),0,a0,a1); g.stroke(); }
  ring(-w*0.2,w*2.2,P.glow,0.18*al,'lighter');
  ring(-w*0.55,w*0.9,P.deep,0.45*al,'source-over');
  ring(-w*0.25,w*0.7,P.mid,0.55*al,'source-over');
  ring(-w*0.05,w*0.45,P.hot,0.75*al,'lighter');
  ring(w*0.12,Math.max(1.2,w*0.18),P.core,0.95*al,'lighter'); }
window.SCYFX={_L:L,
 clear:function(){ L.length=0; H.length=0; },
 // record the blade each frame while a hit is active
 blade:function(T,tip,heel,on){ if(on) H.push({t:T,a:tip,b:heel}); while(H.length&&(T-H[0].t>0.13||T<H[0].t)) H.shift(); },
 spawn:function(type,T,o){ var r=rng(Math.floor(T*1000)+type.length*7919+(o.seed||0)); o.type=type; o.t0=T; o.w=window.FXW||1; o.r=r; o.life=LIFE[type]||0.5;
  o.m=mkMotes(r,type==='slam'?16:12,type==='ring'||type==='slam'?240:180,1,o.life);
  if(type==='slam'){ o.sp=[]; for(var i=0;i<9;i++) o.sp.push({a:-Math.PI*(0.12+0.76*r()),l:90+r()*110}); o.ck=[]; for(i=0;i<5;i++){ var pts=[[0,0]], ang=(r()-0.5)*Math.PI*0.9+(r()<0.5?0:Math.PI), x=0,y=0; for(var j=0;j<4;j++){ x+=Math.cos(ang+(r()-0.5)*0.8)*28; y+=Math.sin(ang+(r()-0.5)*0.8)*7; pts.push([x,y]); } o.ck.push(pts); } o.ch=[]; for(i=0;i<12;i++) o.ch.push({vx:(r()-0.5)*520,vy:-260-r()*380,sz:3+r()*5}); }
  if(type==='ring') { o.du=[]; for(i=0;i<10;i++) o.du.push({a:r()*TAU,s:0.7+r()*0.6,z:r()}); }
  L.push(o); },
 // layer 'back' = behind the hero (ground + back half of rings), 'front' = over the hero
 draw:function(g,T,layer){ setPal(); var keep=[];
  for(var i=0;i<L.length;i++){ var o=L[i], age=T-o.t0; if(age<0||age>o.life+0.4) continue; keep.push(o); var w=o.w||1, c=o.type==='arc'||o.type==='thrust'?[o.x,o.y]:o.type==='ring'?[o.X,o.gy]:o.type==='slam'?[o.x,o.gy]:[o.X,o.y];
   g.save(); if(w!==1){ g.translate(c[0],c[1]); g.scale(w,w); g.translate(-c[0],-c[1]); } this['d_'+o.type](g,o,age,age/o.life,layer); g.restore(); }
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
  var sp=0.95; band(g,cx,cy,R,R,base+tilt,-sp,sp,60*(1-0.5*k),VIO,0.32*al); band(g,cx,cy,R,R,base+tilt,-sp,sp,34*(1-0.5*k),CY,0.7*al); band(g,cx,cy,R+6,R+6,base+tilt,-sp*0.85,sp*0.85,10*(1-0.4*k),WH,0.95*al);
  for(var j=1;j<=3;j++){ var kk=cl(k-0.06*j); band(g,o.x+fw*380*eo(kk)-fw*R*0.55,cy,R*0.9,R*0.9,base+tilt,-sp*0.7,sp*0.7,14,CY,0.18*al/j); }
  this.motes(g,o,age,o.x+fw*d*0.6,cy,fw,false); g.restore(); },
 ringPart:function(g,o,age,k,layer,cx,cy,rx,ry,w,sweepT,spin){ // sword-wave crescent swept round the ellipse; back half (sin<0) behind the hero
  var hd=eo(age/sweepT), head=o.a0+spin*TAU*hd, span=TAU*0.85, tail=head-spin*span, al=cl(age/0.04)*(1-k*k), n=48,
      drift=12*eo(cl((age-sweepT)/0.3)), hw=w*0.5;
  var self=this;
  function seg(off,wd,cols,alpha,late,light){ // one streak from tail+late to head-late*0.6, tapered like the sword wave
   g.globalCompositeOperation=light?'lighter':'source-over';
   for(var i=0;i<n;i++){ var u0=i/n, u1=(i+1)/n; if(u1<late||u0>1-late*0.6) continue;
    var a=tail+(head-tail)*u0, b=tail+(head-tail)*u1, mid=(a+b)/2, back=Math.sin(mid)<0; if((layer==='back')!==back) continue;
    var q=(u1-late)/(1-late*1.6), prof=Math.pow(Math.sin(Math.PI*Math.min(1,Math.max(0,q)*1.15)),0.7), ww=wd*prof+0.6;
    var c=ramp(q,cols.map(function(x){return P[x];})), aa=alpha*al*Math.min(1,q*3);
    var ro=off*hw+drift*(1+Math.abs(off)); band(g,cx,cy,rx+ro,ry+ro*ry/rx,0,a,b+0.02*spin,ww,c,aa,'flat'); } }
  seg(0,w*2.1,['glow','glow'],0.22,0,true);                                   // soft glow
  for(var s=0;s<(window.SCYFX_CAP?3:STR.length);s++){ var t=STR[s]; seg(t[0],w*t[1]*(1+0.25*k),t[2],t[3]*0.55,t[4],false); seg(t[0],w*t[1]*0.6,t[2],t[3]*0.6,t[4],true); }
  g.globalCompositeOperation='lighter';
  },
 d_spin:function(g,o,age,k,layer){ if(k>1) return; g.save(); g.globalCompositeOperation='lighter'; var e=1+0.35*eo(cl((age-0.2)/0.3));
  this.ringPart(g,o,age,k,layer,o.X,o.y,170*e,46*e,(window.SCYFX_CAP?14:30),0.22,o.spin);
  if(layer==='front') this.motes(g,o,age,o.X,o.y,0,true); g.restore(); },
 d_twirl:function(g,o,age,k,layer){ if(k>1) return; g.save(); g.globalCompositeOperation='lighter';
  this.ringPart(g,o,age,k,layer,o.X,o.y,135,26,(window.SCYFX_CAP?10:22),0.16,o.spin); var o2=Object.create(o); o2.a0=o.a0+Math.PI; this.ringPart(g,o2,age,k,layer,o.X,o.y,110,20,(window.SCYFX_CAP?7:14),0.16,o.spin);
  if(layer==='front') this.motes(g,o,age,o.X,o.y,0,true); g.restore(); },
 d_ring:function(g,o,age,k,layer){ if(k>1) return; var X=o.X, Y=o.gy;
  for(var w=0;w<2;w++){ var kk=cl((age-w*0.09)/o.life); if(kk<=0) continue; var rx=40+270*eo(kk), ry=rx*0.22, al=(1-kk)*(1-kk)*cl((age-w*0.09)/0.05);
   g.save(); gwave(g,X,Y,rx,ry,(18-6*w)*(1-0.6*kk)+3,al,layer); g.restore(); }
  if(layer==='back'){ for(var i=0;i<o.du.length;i++){ var d=o.du[i], kd=cl((age-0.03)/(o.life+0.35)); if(kd<=0||kd>=1) continue; var rr=(60+230*eo(kd))*d.s, x=X+Math.cos(d.a)*rr, y=Y+Math.sin(d.a)*rr*0.22-30*kd*d.s, s=18+40*kd;
    var gr=g.createRadialGradient(x,y,0,x,y,s); gr.addColorStop(0,C(214,204,186,0.35*(1-kd))); gr.addColorStop(1,C(214,204,186,0)); g.fillStyle=gr; g.beginPath(); g.arc(x,y,s,0,TAU); g.fill(); } }
  else { g.save(); g.globalCompositeOperation='lighter'; this.motes(g,o,age,X,Y-10,0,true); g.restore(); } },
 d_slam:function(g,o,age,k,layer){ if(k>1) return; var X=o.x, Y=o.gy;
  if(layer==='back'){ // cracks + ground ring
   var ca=cl(age/0.05)*(1-k); g.save(); g.strokeStyle=C(40,20,60,0.55*ca); g.lineWidth=3; o.ck.forEach(function(pts){ g.beginPath(); g.moveTo(X,Y); pts.forEach(function(p){ g.lineTo(X+p[0],Y+p[1]); }); g.stroke(); });
   g.globalCompositeOperation='lighter'; g.strokeStyle=C(VIO[0],VIO[1],VIO[2],0.5*ca); g.lineWidth=2; o.ck.forEach(function(pts){ g.beginPath(); g.moveTo(X,Y); pts.forEach(function(p){ g.lineTo(X+p[0],Y+p[1]); }); g.stroke(); });
   g.restore(); for(var q=0;q<2;q++){ var kr=cl((age-q*0.08)/0.55), rx=30+230*eo(kr)*(1-0.25*q); if(kr<=0) continue; g.save(); gwave(g,X,Y,rx,rx*0.22,(16-5*q)*(1-0.6*kr)+3,(1-kr)*(1-kr)*cl((age-q*0.08)/0.04),'back'); gwave(g,X,Y,rx,rx*0.22,(16-5*q)*(1-0.6*kr)+3,(1-kr)*(1-kr)*cl((age-q*0.08)/0.04),'front'); g.restore(); } return; }
  g.save(); g.globalCompositeOperation='lighter';
  glow(g,X,Y+4,(26+44*eo(cl(age/0.12)))/Math.sqrt(o.w||1),P.hot,0.5*cl(1-age/0.22)); /* r1b: small low flash so the hero never vanishes at 3.5x */
  o.sp.forEach(function(s,i){ var ks=cl((age-i*0.008)/0.32); if(ks<=0||ks>=1) return; var l=s.l*eo(ks), l0=s.l*eo(cl(ks-0.35)); var sc=ks<0.4?P.core:P.hot; g.strokeStyle=C(sc[0],sc[1],sc[2],0.9*(1-ks)); g.lineWidth=5*(1-ks)+1; g.lineCap='round'; g.beginPath(); g.moveTo(X+Math.cos(s.a)*l0,Y+Math.sin(s.a)*l0); g.lineTo(X+Math.cos(s.a)*l,Y+Math.sin(s.a)*l); g.stroke(); });
  g.restore(); g.save(); o.ch.forEach(function(c){ var t=age; if(t>o.life) return; var x=X+c.vx*t, y=Y+c.vy*t+900*t*t; if(y>Y+6) return; g.fillStyle=C(90,70,110,0.9*(1-t/o.life)); g.fillRect(x-c.sz/2,y-c.sz/2,c.sz,c.sz); });
  g.restore(); },
 d_thrust:function(g,o,age,k,layer){ if(layer!=='front'||k>1) return; g.save(); g.globalCompositeOperation='lighter'; var fw=o.fw, d=420*eo(k), al=cl(age/0.04)*(1-k*k), x=o.x+fw*d, y=o.y, Lg=230*(1-0.4*k), h=22*(1-0.5*k);
  [[VIO,2.2,0.3],[CY,1.2,0.7],[WH,0.4,0.95]].forEach(function(s){ g.fillStyle=C(s[0][0],s[0][1],s[0][2],s[2]*al); g.beginPath(); g.moveTo(x+fw*40,y); g.quadraticCurveTo(x-fw*Lg*0.3,y-h*s[1],x-fw*Lg,y); g.quadraticCurveTo(x-fw*Lg*0.3,y+h*s[1],x+fw*40,y); g.fill(); });
  var kr=cl(age/0.3); g.strokeStyle=C(CY[0],CY[1],CY[2],0.7*(1-kr)); g.lineWidth=8*(1-kr)+1; g.beginPath(); g.ellipse(o.x+fw*30,y,14+30*kr,40+70*kr,0,0,TAU); g.stroke();
  this.motes(g,o,age,o.x+fw*d*0.5,y,fw,false); g.restore(); }
};
})();

