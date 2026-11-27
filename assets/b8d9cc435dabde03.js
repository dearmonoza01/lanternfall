
/* bow_combo_r9 fx_bow_art_r2.js (Art FX r2, DeaRz 07:47) wrapped: BOW3FX */
(function(){ var U=window.PUPPET, cx=null, TL=null, HX=0, HY=0, SC=0.1485;
function rnd(s){ var x=Math.sin(s*127.1+311.7)*43758.5453; return x-Math.floor(x); }
// ---- Bow 3-click combo FX, Art r1 (12 Nov 2026). Drop-in replacement for the Motion placeholder block in page_tpl.html
// ("// ---- temporary FX" ... end of drawDust). Same function names, inputs, timing and sizes. Look = ranger wind:
// tapered streaks with a colour ramp (deep teal tail -> jade -> sky -> white head), wind wisps that peel off and fade,
// every piece grows in and fades out, nothing pops. No extra projectiles beyond the arrow. Cost kept low for 5 arrows/s.
var COL={core:'255,255,255',jade:'150,245,205',sky:'110,205,255',gold:'255,214,120',deep:'12,112,112',mint:'205,255,235'};
function A(a){ return Math.max(0,Math.min(1,a)); }
function eo(x){ x=A(x); return 1-(1-x)*(1-x)*(1-x); }
function glow(x,y,r,col,a){ if(r<=0||a<=0) return; var g=cx.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,'rgba('+col+','+A(a)+')'); g.addColorStop(1,'rgba('+col+',0)'); cx.fillStyle=g; cx.beginPath(); cx.arc(x,y,r,0,6.2832); cx.fill(); }
function ring(x,y,rx,ry,col,a,w){ cx.strokeStyle='rgba('+col+','+A(a)+')'; cx.lineWidth=w; cx.beginPath(); cx.ellipse(x,y,Math.max(0.1,rx),Math.max(0.1,ry),0,0,6.2832); cx.stroke(); }
// tapered streak along a horizontal line: thin at the tail, full width near the head, rounded head
function streak(x0,x1,y,w,col,a,wob,ph){ if(a<=0||x1-x0<1) return; var n=10, top=[], bot=[];
  for(var i=0;i<=n;i++){ var u=i/n, x=x0+(x1-x0)*u, k=Math.pow(u,0.8)*(u>0.9?1-(u-0.9)*6:1), yy=y+(wob?Math.sin(u*7+ph)*wob*(1-u):0); top.push([x,yy-w*k/2]); bot.push([x,yy+w*k/2]); }
  var gc=cx.globalCompositeOperation; if(col===COL.deep) cx.globalCompositeOperation='source-over';
  cx.fillStyle='rgba('+col+','+A(a)+')'; cx.beginPath(); cx.moveTo(top[0][0],top[0][1]); for(i=1;i<=n;i++) cx.lineTo(top[i][0],top[i][1]); for(i=n;i>=0;i--) cx.lineTo(bot[i][0],bot[i][1]); cx.closePath(); cx.fill(); cx.globalCompositeOperation=gc; }
// tapered crescent band on an ellipse (angles in radians), width max in the middle
function crescent(x,y,rx,ry,a0,a1,w,col,a){ if(a<=0||w<=0) return; var n=16, o=[], q=[];
  for(var i=0;i<=n;i++){ var u=i/n, an=a0+(a1-a0)*u, k=Math.sin(Math.PI*u), ww=w*k; o.push([x+Math.cos(an)*(rx+ww/2),y+Math.sin(an)*(ry+ww/2)]); q.push([x+Math.cos(an)*(rx-ww/2),y+Math.sin(an)*(ry-ww/2)]); }
  var gc=cx.globalCompositeOperation; if(col===COL.deep) cx.globalCompositeOperation='source-over';
  cx.fillStyle='rgba('+col+','+A(a)+')'; cx.beginPath(); cx.moveTo(o[0][0],o[0][1]); for(i=1;i<=n;i++) cx.lineTo(o[i][0],o[i][1]); for(i=n;i>=0;i--) cx.lineTo(q[i][0],q[i][1]); cx.closePath(); cx.fill(); cx.globalCompositeOperation=gc; }
// curved wind wisp (quadratic), tapers by drawing 2 passes
function wisp(x,y,dx,dy,bend,w,col,a){ if(a<=0) return; var mx=x+dx/2-dy*bend, my=y+dy/2+dx*bend; cx.lineCap='round';
  cx.strokeStyle='rgba('+col+','+A(a*0.5)+')'; cx.lineWidth=w; cx.beginPath(); cx.moveTo(x,y); cx.quadraticCurveTo(mx,my,x+dx,y+dy); cx.stroke();
  cx.strokeStyle='rgba('+col+','+A(a)+')'; cx.lineWidth=Math.max(0.6,w*0.45); cx.beginPath(); cx.moveTo(x+dx*0.25,y+dy*0.25); cx.quadraticCurveTo(mx,my,x+dx,y+dy); cx.stroke(); }
function drawArrowImg(x,y,len){ var im=U.imgs.w_arrow; if(!im||!im.complete) return; var s=len/im.width; cx.save(); cx.translate(x,y); cx.scale(-s,s); cx.drawImage(im,0,-40); cx.restore(); }

// ARROW FLIGHT: 3 tapered streaks with colour ramp + afterglow that lingers where the arrow passed + wisps peeling off
function drawShots(t){ TL.shots.forEach(function(s){ var dt=t-s.t0, H=s.heavy, LG=0.18; if(dt<0||t>s.end+LG) return; var tt=Math.min(dt,s.end-s.t0), x=s.x0+s.v*tt, L=H?66:42;
  var after=t>s.end?(t-s.end)/LG:0, fade=1-after, gin=A(dt/0.04);
  var tl=Math.min(x-s.x0,H?260:110)*(1-0.5*after), y=s.y, hx=x-L*0.35;
  cx.save(); cx.globalCompositeOperation='lighter';
  if(H){ streak(hx-tl*1.05,hx,y,30,COL.deep,0.30*fade*gin,3,t*20); streak(hx-tl,hx,y,18,COL.jade,0.55*fade*gin,2,t*24);
         streak(hx-tl*0.7,hx,y,9,COL.sky,0.75*fade*gin,0,0); streak(hx-tl*0.45,hx+4,y,4,COL.core,0.95*fade*gin,0,0);
    // 2 spiral wind ribbons around the trail (tapered: drawn as segments with shrinking width)
    for(var w=0;w<2;w++){ var prev=null; for(var u=0;u<=18;u++){ var px=hx-u*(tl/18), ph=(px*0.07)-t*30+w*Math.PI, amp=11*(1-u/20)*(0.6+0.4*gin), py=y+Math.sin(ph)*amp, front=Math.cos(ph)>0;
        if(prev){ cx.strokeStyle='rgba('+(w?COL.sky:COL.mint)+','+A((front?0.85:0.35)*(1-u/19)*fade)+')'; cx.lineWidth=3.2*(1-u/20)+0.6; cx.beginPath(); cx.moveTo(prev[0],prev[1]); cx.lineTo(px,py); cx.stroke(); } prev=[px,py]; } }
    // pressure wedge riding on the head (attached to the arrow, not a projectile)
    var wv=1+0.15*Math.sin(t*60); crescent(x+4,y,10*wv,22*wv,-1.1,1.1,7,COL.sky,0.5*fade*gin); crescent(x+2,y,6,14,-1.0,1.0,3,COL.core,0.7*fade*gin);
    glow(x,y,34,COL.jade,0.5*fade); glow(x,y,12,COL.core,0.6*fade); }
  else { streak(hx-tl,hx,y,10,COL.deep,0.35*fade*gin,1.5,t*22); streak(hx-tl*0.9,hx,y,6,COL.jade,0.7*fade*gin,0,0); streak(hx-tl*0.5,hx+2,y,2.4,COL.core,0.9*fade*gin,0,0);
    glow(x,y,14,COL.jade,0.4*fade); }
  // wisps: born along the path every ~45 px, curl up/down and fade in 0.25 s (no motion of their own beyond a short drift)
  var step=H?38:52, n0=Math.max(0,Math.floor((x-tl-s.x0)/step)), n1=Math.floor((x-L*0.5-s.x0)/step);
  for(var i=n0;i<=n1;i++){ var bx=s.x0+i*step, born=s.t0+(bx-s.x0)/s.v, age=t-born, D=H?0.32:0.24; if(age<0||age>D) continue; var k=age/D, sg=(i%2?1:-1);
    wisp(bx-6*k,y+sg*(2+6*k),-(H?22:14)*(0.4+0.6*eo(k)),sg*(H?9:5)*eo(k),0.35*sg,H?2.6:1.6,i%3?COL.jade:COL.sky,(1-k)*(1-k)*0.8); }
  cx.restore(); if(t<=s.end) drawArrowImg(x,y,L); }); }

// RELEASE: vertical wind crescents open in front of the bow (front half brighter), soft flash, wisps curling forward
function drawRelease(t){ TL.shots.forEach(function(s){ var dt=t-s.t0, H=s.heavy, D=H?0.34:0.16; if(dt<0||dt>D) return; var k=dt/D, e=eo(k), al=(1-k)*(1-k)*A(dt/0.025), x=s.x0, y=s.y;
  cx.save(); cx.globalCompositeOperation='lighter';
  glow(x,y,(H?44:18)*(0.5+0.8*e),COL.core,al*(H?0.55:0.55)); glow(x,y,(H?80:30)*(0.4+e),COL.jade,al*0.35);
  var rx=(H?8:3)+(H?22:7)*e, ry=(H?28:9)+(H?62:15)*e;
  crescent(x+(H?10:4)*e,y,rx,ry,-1.35,1.35,(H?14:5)*(1-0.5*k),COL.deep,al*0.45);
  crescent(x+(H?10:4)*e,y,rx,ry,-1.25,1.25,(H?8:3)*(1-0.4*k),COL.jade,al*0.9);
  crescent(x+(H?12:5)*e,y,rx+1,ry+1,-1.0,1.0,(H?3:1.4),COL.core,al);
  if(H){ var e2=eo(A((dt-0.05)/(D-0.05))); if(e2>0){ crescent(x+26*e2,y,6+36*e2,20+92*e2,-1.2,1.2,8*(1-e2),COL.sky,(1-e2)*0.7); } }
  for(var i=0;i<(H?7:3);i++){ var a=(rnd(s.seed+i)-0.5)*(H?1.3:0.8), r0=(H?14:5)+e*(H?62:22), ln=(H?24:9)*(1-0.6*k), sg=a<0?-1:1;
    wisp(x+Math.cos(a)*r0,y+Math.sin(a)*r0,Math.cos(a)*ln,Math.sin(a)*ln,0.25*sg,H?2.4:1.4,i%2?COL.mint:COL.sky,al*0.9); }
  cx.restore(); }); }

// HIT: flare (4 thin rays), tapered shock ring, spark streaks with a little gravity, lingering wind swirl; heavy adds X slash crescents
function drawImpacts(t){ TL.imp.forEach(function(o,i){ var dt=t-o.t, H=o.heavy, D=H?0.42:0.28; if(dt<0||dt>D) return; var k=dt/D, e=eo(k), al=(1-k)*(1-k)*A(dt/0.02), x=o.x, y=o.y;
  cx.save(); cx.globalCompositeOperation='lighter';
  glow(x,y,(H?30:18)*(0.6+0.6*e),COL.core,al*0.5); glow(x,y,(H?60:30)*(0.5+e),COL.jade,al*0.3);
  var fl=(H?46:24)*(0.5+0.7*e)*(1-0.5*k); cx.lineCap='round';
  [[1,0,1],[0,1,0.7],[0.7,0.7,0.45],[0.7,-0.7,0.45]].forEach(function(r){ cx.strokeStyle='rgba('+COL.core+','+A(al*r[2])+')'; cx.lineWidth=H?2.2:1.4; cx.beginPath(); cx.moveTo(x-r[0]*fl,y-r[1]*fl); cx.lineTo(x+r[0]*fl,y+r[1]*fl); cx.stroke(); });
  var R=(H?10:6)+(H?46:24)*Math.sqrt(k);
  crescent(x,y,R+1,R+1,0,6.2832,(H?9:5)*(1-k)+1.5,COL.deep,al*0.4);
  crescent(x,y,R,R,0,3.1416,(H?7:4)*(1-k)+1,COL.jade,al*0.9); crescent(x,y,R,R,3.1416,6.2832,(H?7:4)*(1-k)+1,COL.sky,al*0.7);
  for(var j=0;j<(H?9:6);j++){ var a=j/(H?9:6)*6.2832+rnd(i*7+j)*0.5, sp=(H?60:34), r0=(H?10:5)+e*sp, r1=r0+(H?16:9)*(1-k), gy=30*k*k;
    cx.strokeStyle='rgba('+COL.gold+','+A(al)+')'; cx.lineWidth=(H?2.4:1.6)*(1-0.5*k); cx.beginPath(); cx.moveTo(x+Math.cos(a)*r0,y+Math.sin(a)*r0+gy*0.6); cx.lineTo(x+Math.cos(a)*r1,y+Math.sin(a)*r1+gy); cx.stroke(); }
  // wind swirl lingers and turns slowly (two arcs, opposite phase)
  for(var q=0;q<2;q++){ var rr=(H?20:12)+(H?18:10)*e, a0=t*7*(q?-1:1)+q*3.14; crescent(x,y,rr,rr*0.75,a0,a0+2.2,(H?4:2.4)*(1-k),q?COL.mint:COL.jade,al*0.6); }
  if(H){ var ks=A(dt/0.12); [[1],[-1]].forEach(function(sg,z){ var kz=A((dt-z*0.04)/0.12); if(kz<=0) return; cx.save(); cx.translate(x,y); cx.rotate(sg[0]*0.78); crescent(0,0,8+30*kz,36*kz+4,-0.9,0.9,6*(1-k)+1,COL.core,al*0.9); crescent(0,0,10+30*kz,38*kz+4,-0.9,0.9,12*(1-k)+1,COL.sky,al*0.35); cx.restore(); }); }
  cx.restore(); }); }

// CHARGE: wind streaks spiral in to the tip, pulsing core, gathering ring, ground circle with 2 counter-turning arcs; all grow in from zero
function drawCharge(p,t,tip){ var c=p.charge; if(!c||!tip) return; var x=tip[0], y=tip[1], gin=Math.min(1,c*4);
  cx.save(); cx.globalCompositeOperation='lighter';
  glow(x,y,(10+22*c)*(1+0.12*Math.sin(t*40)),COL.jade,(0.3+0.5*c)*gin); glow(x,y,(4+7*c)*(1+0.2*Math.sin(t*55+1)),COL.core,0.7*gin);
  for(var i=0;i<8;i++){ var ph=((t*1.6+i/8)%1), r=(1-eo(ph))*72+6, a=i*0.785+t*4+ph*2.2, ln=0.55*(1-ph)+0.15;
    var x0=x+Math.cos(a)*r, y0=y+Math.sin(a)*r*0.8, x1=x+Math.cos(a+ln)*Math.max(4,r-14), y1=y+Math.sin(a+ln)*Math.max(4,r-14)*0.8;
    wisp(x0,y0,x1-x0,y1-y0,0.3,1.8+1.6*c,i%3?COL.jade:COL.sky,gin*Math.sin(ph*Math.PI)*0.9); }
  for(var m=0;m<6;m++){ var ph2=((t*2.3+m/6)%1), r2=(1-ph2)*50+3, a2=m*1.05-t*5; glow(x+Math.cos(a2)*r2,y+Math.sin(a2)*r2*0.8,2+2*ph2,COL.mint,gin*Math.sin(ph2*Math.PI)*0.8); }
  var rp=(t*3.2)%1; crescent(x,y,46*(1-rp)+6,46*(1-rp)+6,0,6.2832,2.6*rp+0.4,COL.jade,gin*rp*0.7);
  var fx=HX-(p.lunge||0)*SC, gy=HY+4, grx=40+18*c, gry=10+4*c;
  crescent(fx,gy,grx,gry,0,6.2832,4,COL.deep,gin*(0.25+0.25*c));
  crescent(fx,gy,grx,gry,t*3,t*3+2.4,3+2*c,COL.jade,gin*(0.35+0.4*c)); crescent(fx,gy,grx*0.82,gry*0.82,-t*4,-t*4+2.0,2+2*c,COL.sky,gin*(0.3+0.35*c));
  cx.restore(); }

// DUST (c3 take-off / landing): puffs grow, drift outward and up, lighter top/darker base, fade; small grit flecks
function drawDust(t){ TL.clicks.forEach(function(c){ if(c.n!==3) return; [[0.08,-1],[0.42,1]].forEach(function(d){ var dt=t-(c.t0+d[0]/c.f); if(dt<0||dt>0.5) return; var k=dt/0.5, e=eo(k);
    var p=bowPose(3,d[0]/BOWC[3].dur), fx=HX-(p.lunge+c.root)*SC, al=(1-k)*(1-k)*A(dt/0.03);
    for(var i=0;i<6;i++){ var dir=(i-2.5)*0.45+(d[1]<0?0.8:0), x=fx+dir*44*e, y=HY+2-(10+8*rnd(i))*e, r=4+13*e*(0.7+0.5*rnd(i+3));
      cx.fillStyle='rgba(170,140,100,'+A(0.35*al)+')'; cx.beginPath(); cx.arc(x,y+r*0.25,r,0,6.2832); cx.fill();
      cx.fillStyle='rgba(236,214,172,'+A(0.45*al)+')'; cx.beginPath(); cx.arc(x-r*0.15,y-r*0.15,r*0.75,0,6.2832); cx.fill(); }
    for(var g=0;g<6;g++){ var ga=-Math.PI*(0.15+0.7*rnd(g+11)), gs=60+50*rnd(g+17), gx=fx+Math.cos(ga)*gs*k, gyy=HY+Math.sin(ga)*gs*k+160*k*k; if(gyy>HY+4) continue;
      cx.fillStyle='rgba(150,120,80,'+A(0.8*al)+')'; cx.fillRect(gx-1.2,gyy-1.2,2.4,2.4); } }); }); }

// ===================== Art r2 (DeaRz 04:57 "ขอเอฟเฟกเท่กว่านี้"): bigger, more dramatic. Overrides drawShots/drawRelease/drawImpacts/drawCharge above.
// Adds: V7 rune circle (approved atlas, glyph rim) under the click-3 charge, wind pillar around the hero, lens flare at the tip;
// heavy arrow = wind drill (4 tapered spiral ribbons) + 3 afterimage arrows + ground skid dust under the path; bigger cone shock on release;
// hits = 8-ray star flare, double shock ring, spinning feather shards that fall, short wind pillar on heavy hits. Still no extra projectiles.
var RUNE_IMG=new Image(), RUNE_OK=false, RUNE_TINT={}; RUNE_IMG.onload=function(){ RUNE_OK=true; }; RUNE_IMG.src='assets/13beb52e855b0113.png';
function runeTint(col){ if(RUNE_TINT[col]) return RUNE_TINT[col]; if(!RUNE_OK) return null; var c=document.createElement('canvas'); c.width=768; c.height=64; var g=c.getContext('2d'); g.drawImage(RUNE_IMG,0,0); g.globalCompositeOperation='source-in'; g.fillStyle='rgb('+col+')'; g.fillRect(0,0,768,64); return RUNE_TINT[col]=c; }
function runeCircle(x,y,R,rot,al,grow){ if(al<=0) return; var ry=0.3, im=runeTint(COL.jade), imw=runeTint(COL.mint);
  // rims: outer double ring + inner ring (deep underlay keeps it readable on sand)
  crescent(x,y,R,R*ry,0,6.2832,5,COL.deep,al*0.45); ring(x,y,R,R*ry,COL.jade,al*0.9,2.2); ring(x,y,R*0.86,R*0.86*ry,COL.sky,al*0.6,1.2); ring(x,y,R*0.52,R*0.52*ry,COL.jade,al*0.7,1.6);
  // glyph rim between the two outer rings, turning
  var n=16, gs=R*0.17; if(im){ for(var i=0;i<n;i++){ var a=rot+i/n*6.2832, k=A(grow*n-i); if(k<=0) continue; var gx=x+Math.cos(a)*R*0.93, gy=y+Math.sin(a)*R*0.93*ry;
      cx.save(); cx.globalAlpha=al*k*(0.65+0.35*Math.sin(a*3+rot*5)); cx.translate(gx,gy); cx.scale(1,ry*1.6); cx.drawImage(i%4?im:imw,(i%12)*64,0,64,64,-gs/2,-gs/2,gs,gs); cx.restore(); } }
  // inner star (two rotated squares) turning the other way
  for(var s=0;s<2;s++){ cx.strokeStyle='rgba('+COL.mint+','+A(al*0.7)+')'; cx.lineWidth=1.4; cx.beginPath(); for(var j=0;j<=4;j++){ var b=-rot*1.3+s*0.785+j*1.5708; var px=x+Math.cos(b)*R*0.84, py=y+Math.sin(b)*R*0.84*ry; if(j) cx.lineTo(px,py); else cx.moveTo(px,py); } cx.stroke(); } }
function flare(x,y,r,al,rot){ if(al<=0) return; cx.lineCap='round'; [[0,1,COL.core],[1.5708,0.55,COL.sky],[0.785,0.35,COL.mint],[-0.785,0.35,COL.mint]].forEach(function(f){ var a=f[0]+(rot||0), L=r*f[1];
    cx.strokeStyle='rgba('+f[2]+','+A(al*0.45)+')'; cx.lineWidth=Math.max(1,r*0.08); cx.beginPath(); cx.moveTo(x-Math.cos(a)*L,y-Math.sin(a)*L); cx.lineTo(x+Math.cos(a)*L,y+Math.sin(a)*L); cx.stroke();
    cx.strokeStyle='rgba(255,255,255,'+A(al)+')'; cx.lineWidth=Math.max(0.6,r*0.025); cx.beginPath(); cx.moveTo(x-Math.cos(a)*L*0.8,y-Math.sin(a)*L*0.8); cx.lineTo(x+Math.cos(a)*L*0.8,y+Math.sin(a)*L*0.8); cx.stroke(); }); }
function feather(x,y,s,a,col,al){ if(al<=0) return; cx.save(); cx.translate(x,y); cx.rotate(a); cx.fillStyle='rgba('+col+','+A(al)+')'; cx.beginPath(); cx.moveTo(-s,0); cx.quadraticCurveTo(0,-s*0.45,s,0); cx.quadraticCurveTo(0,s*0.45,-s,0); cx.fill();
  cx.strokeStyle='rgba(255,255,255,'+A(al*0.8)+')'; cx.lineWidth=0.8; cx.beginPath(); cx.moveTo(-s,0); cx.lineTo(s,0); cx.stroke(); cx.restore(); }
function ghostArrow(x,y,len,al){ var im=U.imgs.w_arrow; if(!im||!im.complete||al<=0) return; cx.save(); cx.globalAlpha=al; cx.globalCompositeOperation='lighter'; var s=len/im.width; cx.translate(x,y); cx.scale(-s,s); cx.drawImage(im,0,-40); cx.restore(); }

function drawShots(t){ TL.shots.forEach(function(s){ var dt=t-s.t0, H=s.heavy, LG=H?0.3:0.2; if(dt<0||t>s.end+LG) return; var tt=Math.min(dt,s.end-s.t0), x=s.x0+s.v*tt, L=H?72:44;
  var after=t>s.end?(t-s.end)/LG:0, fade=1-after, gin=A(dt/0.04), y=s.y, hx=x-L*0.35, tl=Math.min(x-s.x0,H?340:150)*(1-0.5*after);
  cx.save(); cx.globalCompositeOperation='lighter';
  if(H){ // ground skid: dust line kicked up under the path by the wind
    var gy=HY+2; for(var d=0;d<7;d++){ var bx=x-d*36-((t*400)%36), age=(x-bx)/s.v; if(bx<s.x0) continue; var kd=A(age/0.35); if(kd>=1) continue; var r=6+14*kd;
      cx.globalCompositeOperation='source-over'; cx.fillStyle='rgba(205,175,125,'+A(0.35*(1-kd)*fade)+')'; cx.beginPath(); cx.ellipse(bx,gy-r*0.4,r*1.4,r*0.6,0,0,6.2832); cx.fill(); cx.globalCompositeOperation='lighter'; }
    streak(hx-tl*1.05,hx,y,46,COL.deep,0.35*fade*gin,4,t*20); streak(hx-tl,hx,y,28,COL.jade,0.55*fade*gin,3,t*24);
    streak(hx-tl*0.75,hx,y,14,COL.sky,0.8*fade*gin,0,0); streak(hx-tl*0.5,hx+6,y,6,COL.core,1*fade*gin,0,0);
    for(var w=0;w<4;w++){ var prev=null; for(var u=0;u<=22;u++){ var px=hx-u*(tl/22), ph=(px*0.06)-t*34+w*1.5708, amp=(16+4*(w%2))*(1-u/24)*(0.6+0.4*gin), py=y+Math.sin(ph)*amp, front=Math.cos(ph)>0;
        if(prev){ cx.strokeStyle='rgba('+(w%2?COL.sky:COL.mint)+','+A((front?0.95:0.3)*(1-u/23)*fade)+')'; cx.lineWidth=(front?4.2:2.4)*(1-u/24)+0.6; cx.beginPath(); cx.moveTo(prev[0],prev[1]); cx.lineTo(px,py); cx.stroke(); } prev=[px,py]; } }
    for(var gh=1;gh<=3;gh++) ghostArrow(x-gh*30,y,L,(0.4-gh*0.1)*fade*(t<=s.end?1:0));
    var wv=1+0.18*Math.sin(t*60); crescent(x+6,y,13*wv,30*wv,-1.15,1.15,10,COL.sky,0.6*fade*gin); crescent(x+3,y,8,19,-1.0,1.0,4,COL.core,0.8*fade*gin);
    glow(x,y,48,COL.jade,0.5*fade); glow(x,y,16,COL.core,0.7*fade); flare(x+4,y,44*(1+0.1*Math.sin(t*50)),0.85*fade,0); }
  else { streak(hx-tl,hx,y,14,COL.deep,0.38*fade*gin,2,t*22); streak(hx-tl*0.95,hx,y,8,COL.jade,0.75*fade*gin,0,0); streak(hx-tl*0.6,hx+3,y,3,COL.core,1*fade*gin,0,0);
    var prev2=null; for(var u2=0;u2<=12;u2++){ var px2=hx-u2*(tl*0.8/12), ph2=px2*0.09-t*30, py2=y+Math.sin(ph2)*7*(1-u2/13); if(prev2){ cx.strokeStyle='rgba('+COL.mint+','+A((Math.cos(ph2)>0?0.8:0.25)*(1-u2/13)*fade)+')'; cx.lineWidth=2.2*(1-u2/13)+0.5; cx.beginPath(); cx.moveTo(prev2[0],prev2[1]); cx.lineTo(px2,py2); cx.stroke(); } prev2=[px2,py2]; }
    for(var g2=1;g2<=2;g2++) ghostArrow(x-g2*22,y,L,(0.3-g2*0.1)*fade*(t<=s.end?1:0));
    glow(x,y,18,COL.jade,0.5*fade); flare(x+2,y,20,0.7*fade,0); }
  var step=H?34:46, n0=Math.max(0,Math.floor((x-tl-s.x0)/step)), n1=Math.floor((x-L*0.5-s.x0)/step);
  for(var i=n0;i<=n1;i++){ var bx2=s.x0+i*step, born=s.t0+(bx2-s.x0)/s.v, age2=t-born, D=H?0.34:0.26; if(age2<0||age2>D) continue; var k=age2/D, sg=(i%2?1:-1);
    wisp(bx2-6*k,y+sg*(3+8*k),-(H?28:16)*(0.4+0.6*eo(k)),sg*(H?12:6)*eo(k),0.35*sg,H?3:1.8,i%3?COL.jade:COL.sky,(1-k)*(1-k)*0.85); }
  cx.restore(); if(t<=s.end) drawArrowImg(x,y,L); }); }

function drawRelease(t){ TL.shots.forEach(function(s){ var dt=t-s.t0, H=s.heavy, D=H?0.42:0.2; if(dt<0||dt>D) return; var k=dt/D, e=eo(k), al=(1-k)*(1-k)*A(dt/0.025), x=s.x0, y=s.y;
  cx.save(); cx.globalCompositeOperation='lighter';
  glow(x,y,(H?50:20)*(0.5+0.8*e),COL.core,al*0.6); glow(x,y,(H?100:36)*(0.4+e),COL.jade,al*0.35); flare(x+4,y,(H?90:34)*(0.6+0.6*e),al,0);
  var cones=H?4:2; for(var c=0;c<cones;c++){ var kc=eo(A((dt-c*0.035)/(D*0.8))); if(kc<=0) continue; var ac=(1-kc)*(1-kc);
    var rx=(H?8:3)+(H?(28+c*16):(9+c*6))*kc, ry=(H?28:9)+(H?(70+c*30):(16+c*8))*kc, cxp=x+(H?(8+c*22):(4+c*8))*kc;
    crescent(cxp,y,rx,ry,-1.35,1.35,(H?16:6)*(1-0.5*kc),COL.deep,ac*0.4); crescent(cxp,y,rx,ry,-1.25,1.25,(H?9:3.5)*(1-0.4*kc),c%2?COL.sky:COL.jade,ac*0.95); crescent(cxp+1,y,rx+1,ry+1,-1.0,1.0,H?3.2:1.5,COL.core,ac); }
  if(H){ // recoil streaks behind the hero + ground dust ring
    for(var r=0;r<5;r++){ var yy=y+(r-2)*12, ln=60*e; streak(x-20-ln-30,x-20-ln*0.3,yy,4,COL.mint,al*0.6,0,0); }
    var gy=HY+3, gr=20+90*e; cx.globalCompositeOperation='source-over'; cx.strokeStyle='rgba(205,175,125,'+A(al*0.55)+')'; cx.lineWidth=10*(1-k)+2; cx.beginPath(); cx.ellipse(HX-(window.__BOWPOSE&&__BOWPOSE.lunge||0)*SC,gy,gr,gr*0.25,0,0,6.2832); cx.stroke(); cx.globalCompositeOperation='lighter'; }
  for(var i=0;i<(H?10:4);i++){ var a=(rnd(s.seed+i)-0.5)*(H?1.4:0.9), r0=(H?16:6)+e*(H?90:30), ln2=(H?30:11)*(1-0.6*k), sg=a<0?-1:1;
    wisp(x+Math.cos(a)*r0,y+Math.sin(a)*r0,Math.cos(a)*ln2,Math.sin(a)*ln2,0.25*sg,H?2.8:1.6,i%2?COL.mint:COL.sky,al*0.95); }
  cx.restore(); }); }

function drawImpacts(t){ TL.imp.forEach(function(o,i){ var dt=t-o.t, H=o.heavy, D=H?0.5:0.32; if(dt<0||dt>D) return; var k=dt/D, e=eo(k), al=(1-k)*(1-k)*A(dt/0.02), x=o.x, y=o.y;
  cx.save(); cx.globalCompositeOperation='lighter';
  var st=H?0.5:1; /* heavy hits come 3 in a row on the same target: keep each one lighter so they do not stack into a white blob */
  glow(x,y,(H?26:18)*(0.6+0.6*e),COL.core,al*0.5*st); glow(x,y,(H?80:38)*(0.5+e),COL.jade,al*0.35*st);
  flare(x,y,(H?70:34)*(0.6+0.6*e)*(1-0.4*k),al*(H?0.6:1),0); if(H) flare(x,y,46*(0.6+0.6*e),al*0.4,0.393);
  for(var rr=0;rr<(H?2:1);rr++){ var kr=A((dt-rr*0.06)/(D*0.8)); if(kr<=0) continue; var R=(H?12:7)+(H?62:30)*Math.sqrt(kr), ar=(1-kr)*(1-kr);
    crescent(x,y,R+1,R+1,0,6.2832,(H?11:6)*(1-kr)+1.5,COL.deep,ar*0.4); crescent(x,y,R,R,0,3.1416,(H?8:4.5)*(1-kr)+1,COL.jade,ar*0.95); crescent(x,y,R,R,3.1416,6.2832,(H?8:4.5)*(1-kr)+1,COL.sky,ar*0.8); }
  for(var j=0;j<(H?12:7);j++){ var a=j/(H?12:7)*6.2832+rnd(i*7+j)*0.5, sp=(H?80:40), r0=(H?10:5)+e*sp, r1=r0+(H?22:11)*(1-k), gy=40*k*k;
    cx.strokeStyle='rgba('+COL.gold+','+A(al)+')'; cx.lineWidth=(H?2.8:1.8)*(1-0.5*k); cx.beginPath(); cx.moveTo(x+Math.cos(a)*r0,y+Math.sin(a)*r0+gy*0.6); cx.lineTo(x+Math.cos(a)*r1,y+Math.sin(a)*r1+gy); cx.stroke(); }
  // feather shards: burst out, spin, drift down
  for(var f=0;f<(H?7:4);f++){ var fa=rnd(i*13+f)*6.2832, fs=(H?70:40)*(0.5+rnd(i+f*3)), fx=x+Math.cos(fa)*fs*e, fy=y+Math.sin(fa)*fs*e*0.7+50*k*k; feather(fx,fy,(H?7:5)*(1-0.3*k),fa+t*12*(f%2?1:-1),f%2?COL.mint:COL.jade,al*0.9); }
  for(var q=0;q<2;q++){ var rr2=(H?24:13)+(H?24:11)*e, a0=t*8*(q?-1:1)+q*3.14; crescent(x,y,rr2,rr2*0.75,a0,a0+2.4,(H?5:2.8)*(1-k),q?COL.mint:COL.jade,al*0.7); }
  if(H){ [1,-1].forEach(function(sg,z){ var kz=A((dt-z*0.04)/0.12); if(kz<=0) return; cx.save(); cx.translate(x,y); cx.rotate(sg*0.78); crescent(0,0,10+38*kz,46*kz+4,-0.9,0.9,8*(1-k)+1,COL.core,al*0.95); crescent(0,0,12+38*kz,48*kz+4,-0.9,0.9,16*(1-k)+1,COL.sky,al*0.4); cx.restore(); });
    // short wind pillar rising from the target's feet
    var gy2=HY+(o.m&&o.m.dy||0), ph=A(dt/0.3), pa=al*(1-ph*0.3); for(var pw=0;pw<3;pw++){ var pr=16+pw*7, top=gy2-(40+70*eo(ph))*(1-pw*0.15); var prev=null;
      for(var u=0;u<=14;u++){ var yy=gy2-(gy2-top)*u/14, an=u*0.9+t*14+pw*2.1, px=x+Math.cos(an)*pr*(1-u/20), py=yy+Math.sin(an)*pr*0.25; if(prev){ cx.strokeStyle='rgba('+(pw%2?COL.sky:COL.mint)+','+A(pa*(Math.cos(an)>0?0.8:0.3)*(1-u/15))+')'; cx.lineWidth=2.6*(1-u/16)+0.5; cx.beginPath(); cx.moveTo(prev[0],prev[1]); cx.lineTo(px,py); cx.stroke(); } prev=[px,py]; } } }
  cx.restore(); }); }

function drawCharge(p,t,tip){ var c=p.charge; if(!c||!tip) return; var x=tip[0], y=tip[1], gin=Math.min(1,c*4), fx=HX-(p.lunge||0)*SC, gy=HY+4;
  cx.save(); cx.globalCompositeOperation='lighter';
  // rune circle at the feet: grows in, glyphs appear one by one, turns
  var R=(46+30*c)*eo(gin); cx.save(); cx.globalCompositeOperation='source-over'; runeCircle(fx,gy,R,t*1.6,0.35*gin,c); cx.restore(); runeCircle(fx,gy,R,t*1.6,0.75*gin,c);
  // wind pillar around the hero: 3 spiral ribbons rising, faster with charge
  for(var pw=0;pw<3;pw++){ var prev=null; for(var u=0;u<=16;u++){ var yy=gy-u*(70+30*c)/16, an=u*0.7+t*(8+10*c)+pw*2.1, pr=(R*0.7)*(1-u/26), px=fx+Math.cos(an)*pr, py=yy+Math.sin(an)*pr*0.28;
      if(prev){ cx.strokeStyle='rgba('+(pw%2?COL.sky:COL.mint)+','+A(gin*(0.25+0.5*c)*(Math.cos(an)>0?1:0.35)*(1-u/17))+')'; cx.lineWidth=2.6*(1-u/18)+0.5; cx.beginPath(); cx.moveTo(prev[0],prev[1]); cx.lineTo(px,py); cx.stroke(); } prev=[px,py]; } }
  // tip: core ball + lens flare + gathering wind
  glow(x,y,(14+30*c)*(1+0.12*Math.sin(t*40)),COL.jade,(0.35+0.5*c)*gin); glow(x,y,(5+7*c)*(1+0.2*Math.sin(t*55+1)),COL.core,0.6*gin); flare(x,y,(20+44*c)*(1+0.08*Math.sin(t*47)),gin*(0.3+0.4*c),t*0.6);
  for(var i=0;i<10;i++){ var ph=((t*1.7+i/10)%1), r=(1-eo(ph))*(80+30*c)+6, a=i*0.628+t*4+ph*2.4, ln=0.55*(1-ph)+0.15;
    var x0=x+Math.cos(a)*r, y0=y+Math.sin(a)*r*0.8, x1=x+Math.cos(a+ln)*Math.max(4,r-16), y1=y+Math.sin(a+ln)*Math.max(4,r-16)*0.8;
    wisp(x0,y0,x1-x0,y1-y0,0.3,2+2*c,i%3?COL.jade:COL.sky,gin*Math.sin(ph*Math.PI)*0.95); }
  for(var m=0;m<8;m++){ var ph2=((t*2.3+m/8)%1), r2=(1-ph2)*60+3, a2=m*0.785-t*5; glow(x+Math.cos(a2)*r2,y+Math.sin(a2)*r2*0.8,2.4+2.4*ph2,COL.mint,gin*Math.sin(ph2*Math.PI)*0.85); }
  var rp=(t*3.4)%1; crescent(x,y,56*(1-rp)+6,56*(1-rp)+6,0,6.2832,3*rp+0.4,COL.jade,gin*rp*0.8);
  cx.restore(); }

window.BOW3FX={set:function(o){cx=o.cx;TL=o.TL;HX=o.HX;HY=o.HY;SC=o.SC;},drawShots:drawShots,drawRelease:drawRelease,drawImpacts:drawImpacts,drawCharge:drawCharge,drawDust:drawDust,ver:'bow_fx_art_r2'};
})();
