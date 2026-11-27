
/* ---- spin_h33.js (spin pose: Art tornado, hero hidden; ?spinpose=off; after the PUPPET core and modules) ---- */
// spin_h33 (Code 10 Nov 2026, from spin_h32): puppet SPIN pose for the sword spin skills (Whirlwind / Blade Storm). DeaRz 10:33 "ท่าหมุนของดาบแก้ยัง".
// Before: while P.spin was active the puppet just played idle/run. Now: PUPPET.pose('spin', t, {moving}) = sword arm straight out, sword level,
// legs braced (or running when moving); PUPPET.draw then turns the body like a 2D spin (squash through the side view, flip, repeat).
// One turn = 0.36 s (o.per to change). Game glue: when P.spin is active use pose('spin', spinTime, {moving: hero is walking, left: seconds of spin left}). ?spinpose=off.
// QA r3b: 0.12 s fade in and out (needs o.left for the fade-out), 8 veil bands.
// h33: Art SW1 tornado pieces (spin_art_r1.js, window.SPIN_ART) replace the code-drawn funnel. If the art is missing it falls back to the h32 code funnel.
(function(){
if(/[?&]spinpose=off/.test(location.search)) return;
var U=window.PUPPET; if(!U) return;
var basePose=U.pose;
U.pose=function(n,t,o){ if(n!=='spin') return basePose.apply(this,arguments); o=o||{};
  var p=basePose(o.moving?'run':'idle',t,o), r=p.rot;
  r.torso=-6; r.head=4;
  r.arm_near=75; r.forearm_near=0; r.fist_near=-55;       // sword arm straight out, sword level (world ~270 = forward)
  r.arm_far=-50; r.forearm_far=25;                          // other arm swung back for balance
  if(!o.moving){ r.leg_near=16; r.leg_far=-16; r.foot_near=-5; r.foot_far=5; p.air=0; }
  r.sword=0; p.spinT=t; p.spinPer=o.per||0.36; p.spinK=Math.max(0,Math.min(1,t/0.12,(o.left==null?1:o.left/0.12))); p.blink=false; return p; };   // spinK: QA-motion 0.12 s fade in / out (o.left = seconds left)
var baseDraw=U.draw;
// r3 (DeaRz 10:44 "ใช้ไต้ฝุ่นบังตัวทั้งหมด ... ให้เห็นเงาๆดำๆตรงกลางใต้ฝุ่นพอ"): the hero is hidden inside a code-drawn whirlwind;
// only a dark blurred silhouette shows in the middle. Funnel = stacked rings of wind streaks (each ring its own speed + wobble, back half
// behind the silhouette, front half in front), dust skirt + flying grit at the base. Nothing is a moving single image.
var TW={h:900, r0:170, r1:380};    // funnel height / bottom radius / top radius, in puppet units x draw scale
var SIL=null;
function _unused(){}
var SILT=-9, SILF=0, SILK='';
function silhouette(ctx,x,y,sc,f,p,t){ if(!SIL){ SIL=document.createElement('canvas'); }
  var hs=sc*0.5, w=Math.ceil(900*hs)+4, h=Math.ceil(1000*hs)+4, key=w+'x'+h+(p.air?'a':'');   // QA-motion v5 perf: half-res, re-rendered only on facing flip or every 0.12 s
  if(SIL.width!==w||SIL.height!==h){ SIL.width=w; SIL.height=h; SILT=-9; }
  if(f!==SILF||key!==SILK||Math.abs(t-SILT)>0.12){ SILF=f; SILK=key; SILT=t;
    var s=SIL.getContext('2d'); s.setTransform(1,0,0,1,0,0); s.clearRect(0,0,w,h); s.globalCompositeOperation='source-over';
    baseDraw.call(U,s,w/2,h-2,hs,f,p); s.globalCompositeOperation='source-in'; s.fillStyle='#07050a'; s.fillRect(0,0,w,h); s.globalCompositeOperation='source-over'; }
  ctx.save(); ctx.beginPath(); ctx.moveTo(x-TW.r0*0.85*sc,y+4); ctx.lineTo(x+TW.r0*0.85*sc,y+4); ctx.lineTo(x+TW.r1*0.8*sc,y-TW.h*sc); ctx.lineTo(x-TW.r1*0.8*sc,y-TW.h*sc); ctx.closePath(); ctx.clip();   // shadow stays inside the funnel
  ctx.globalAlpha*=0.18+0.03*Math.sin(t*9);   // DeaRz 10 Nov 10:54: faint shadow, storm dominates; no ctx.filter blur (perf)
  ctx.drawImage(SIL,x-w,y-2*h+4,2*w,2*h); ctx.restore(); }
function rings(ctx,x,y,sc,t,front){ var N=12;
  for(var i=0;i<N;i++){ var q=Math.min(1,(i+0.35*Math.sin(i*2.3))/(N-1)), R=(TW.r0+(TW.r1-TW.r0)*Math.pow(q,1.3))*sc, ry=R*0.24, cy=y-q*TW.h*sc,
      wob=Math.sin(t*3.1+i*0.9)*14*sc*q, spd=9+3*Math.sin(i*1.7), th0=t*spd+i*1.3, cx=x+wob;
    var KN=3+(i*7)%3; for(var k=0;k<KN;k++){ var st=th0+k*(6.283/KN)+0.6*Math.sin(i*3+k), L=0.7+0.9*Math.abs(Math.sin(i*1.9+k*2.7)), M=6, tilt=(k%2?1:-1)*0.18*R;   // QA r3: varied length/width + diagonal
      for(var j=0;j<M;j++){ var a0=st-L*j/M, a1=st-L*(j+1)/M; if((Math.sin(a0)>0)!==front) continue; var al=(1-j/M)*(front?0.55:0.35)*(0.75+0.25*(1-q));
        ctx.strokeStyle=(k===1?'rgba(205,220,235,':'rgba(238,244,250,')+al.toFixed(3)+')'; ctx.lineWidth=Math.max(1,(8+10*Math.abs(Math.sin(i+k*1.3))-5*q)*sc*(1-j/M)+2*sc);
        ctx.beginPath(); ctx.moveTo(cx+R*Math.cos(a0),cy+ry*Math.sin(a0)-tilt*j/M*0.0); ctx.lineTo(cx+R*Math.cos(a1),cy+ry*Math.sin(a1)+tilt*(1/M)*Math.cos(a1)); ctx.stroke(); } } } }
// veil: QA-motion perf, 8 bands
function veil(ctx,x,y,sc,t,front){ var N=8; for(var i=0;i<N;i++){ var q=Math.min(1,(i+0.35*Math.sin(i*2.3))/(N-1)), R=(TW.r0+(TW.r1-TW.r0)*Math.pow(q,1.3))*sc, cy=y-q*TW.h*sc, cx=x+Math.sin(t*3.1+i*0.9)*14*sc*q;
    var g=ctx.createLinearGradient(cx-R,0,cx+R,0), a=front?0.10:0.16; g.addColorStop(0,'rgba(220,228,236,0)'); g.addColorStop(0.2,'rgba(220,228,236,'+a+')'); g.addColorStop(0.5,'rgba(235,240,246,'+(a*0.6)+')'); g.addColorStop(0.8,'rgba(220,228,236,'+a+')'); g.addColorStop(1,'rgba(220,228,236,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(cx,cy,R,R*0.24+TW.h*sc/N*0.6,0,front?0:Math.PI,front?Math.PI:2*Math.PI); ctx.fill(); } }
function dust(ctx,x,y,sc,t,front){ for(var i=0;i<26;i++){ var ph=(t*0.9+i*0.137)%1, a=t*7+i*2.4, R=(TW.r0*0.8+ph*170)*sc, s=Math.sin(a);
    if((s>0)!==front) continue; var px=x+R*Math.cos(a), py=y-ph*120*sc+R*0.22*s, rr=(4+5*(1-ph))*sc;
    ctx.fillStyle='rgba(150,135,110,'+(0.45*(1-ph)).toFixed(3)+')'; ctx.beginPath(); ctx.arc(px,py,rr,0,6.283); ctx.fill(); }
  var g=ctx.createRadialGradient(x,y,0,x,y,TW.r1*1.1*sc); g.addColorStop(0,'rgba(165,150,125,'+(front?0.0:0.35)+')'); g.addColorStop(1,'rgba(165,150,125,0)');
  if(!front){ ctx.save(); ctx.translate(x,y); ctx.scale(1,0.25); ctx.translate(-x,-y); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,TW.r1*1.1*sc,0,6.283); ctx.fill(); ctx.restore(); } }

// ---- h33 art tornado (Art SW1 r1b). Order: dust_ring_back < funnel_back < back streaks/debris < faint shadow < funnel_front < front streaks/debris < dust_ring_front.
// Funnels are never one moving still: each is bent band-by-band (snaking lean wave), and its texture flows sideways inside its own fixed
// silhouette by 3 cross-faded copies (back flows right, front flows left = opposite spin, different speeds). Streaks/debris orbit, dust rings expand.
var A={}, AR=false;
(function(){ var S=window.SPIN_ART; if(!S) return; var n=0, k; for(k in S) n++; for(k in S){ (function(k){ var im=new Image(); im.onload=function(){ if(--n===0) AR=true; }; im.onerror=function(){ n=-999; }; im.src=S[k]; A[k]=im; })(k); } })();
var FB={};   // offscreen per funnel
function funnel(ctx,key,x,y,k,t,dir,spd,al){ var im=A[key], r=Math.max(0.3,Math.min(1,k*1.05)), W=Math.ceil(im.width*r), H=Math.ceil(im.height*r);   // QA-motion v5 perf: offscreen at on-screen size
  var o=FB[key]; if(!o){ o=FB[key]=document.createElement('canvas'); } if(o.width!==W||o.height!==H){ o.width=W; o.height=H; } var c=o.getContext('2d');
  c.globalCompositeOperation='source-over'; c.globalAlpha=1; c.clearRect(0,0,W,H); c.drawImage(im,0,0,W,H);
  c.globalCompositeOperation='source-atop';
  for(var i=0;i<3;i++){ var ph=(t*spd+i/3)%1, w=Math.sin(Math.PI*ph); c.globalAlpha=w*w*0.85; c.drawImage(im,dir*(ph-0.5)*W*0.22,0,W,H); }
  c.globalCompositeOperation='source-over'; c.globalAlpha=1; k=k/r;
  var NB=14, dw=W*k*(1+0.03*Math.sin(t*5.3+spd)), dh=H*k, a0=ctx.globalAlpha; ctx.globalAlpha=a0*al;
  for(var b=0;b<NB;b++){ var sy=H*b/NB, q=1-(b+0.5)/NB;   // q: 0 bottom, 1 top
    var dx=(Math.sin(t*2.4-q*2.8)*0.06+Math.sin(t*1.3+0.7)*0.025)*W*k*q;
    var y0=Math.round(y-dh+dh*b/NB), y1=Math.round(y-dh+dh*(b+1)/NB); if(y1>y0) ctx.drawImage(o,0,sy,W,H/NB, x-dw/2+dx, y0, dw, y1-y0); }   // whole-pixel bands: no overlap lines
  ctx.globalAlpha=a0; }
function bendAt(q,t,Wk){ return (Math.sin(t*2.4-q*2.8)*0.06+Math.sin(t*1.3+0.7)*0.025)*Wk*q; }
var STK=['streak1_curl','streak2_short','streak3_diag','streak4_ring','streak5_mid','streak6_long'], DEB=['debris1_rock','debris2_pebble','debris3_leaf','debris4_leaf_s','debris5_puff','debris6_puff_s'];
function orbit(ctx,x,y,k,t,front,FW,FH){ var a0=ctx.globalAlpha;
  for(var i=0;i<6;i++){ var im=A[STK[i]], q=0.15+0.7*((i*0.37)%1), th=-t*(7+1.6*i)+i*1.9, s=Math.sin(th); if((s>0)!==front) continue;
    var R=FW*(0.07+0.36*Math.pow(q,1.15)), px=x+R*Math.cos(th)+bendAt(q,t,FW), py=y-q*FH+R*0.22*s, sx=0.25+0.75*Math.abs(s), sc=k*0.62*(0.8+0.4*q);
    ctx.globalAlpha=a0*Math.min(1,Math.abs(s)*3)*(front?0.9:0.55);
    ctx.save(); ctx.translate(px,py); ctx.rotate(-0.12*Math.cos(th)); ctx.scale(sx*sc*(Math.cos(th)>0?1:1),sc); ctx.drawImage(im,-im.width/2,-im.height/2); ctx.restore(); }
  for(var j=0;j<6;j++){ var im2=A[DEB[j]], ph=(t*0.5+j*0.167+0.11*Math.sin(j*2.1))%1, th2=-t*(5+0.6*j)+j*1.047+ph*2, s2=Math.sin(th2); if((s2>0)!==front) continue;
    var q2=ph*0.9, R2=FW*(0.09+0.38*Math.pow(q2,1.15)), px2=x+R2*Math.cos(th2)+bendAt(q2,t,FW), py2=y-q2*FH+R2*0.22*s2, sc2=k*0.42*(1-0.3*ph);
    ctx.globalAlpha=a0*Math.min(1,Math.abs(s2)*3)*Math.sin(Math.PI*ph)*(front?1:0.6);
    ctx.save(); ctx.translate(px2,py2); ctx.rotate(t*(3+j)*(j%2?1:-1)); ctx.scale(sc2,sc2); ctx.drawImage(im2,-im2.width/2,-im2.height/2); ctx.restore(); }
  ctx.globalAlpha=a0; }
function ring(ctx,key,x,y,k,t,flip){ var im=A[key], a0=ctx.globalAlpha;
  for(var i=0;i<2;i++){ var ph=(t*0.9+i*0.5)%1, s=k*0.78*(0.8+0.35*ph); ctx.globalAlpha=a0*Math.sin(Math.PI*ph)*0.75;
    ctx.save(); ctx.translate(x,y); ctx.scale(((i^flip)?-1:1)*s,s); ctx.drawImage(im,-im.width/2,-im.height/2); ctx.restore(); }
  ctx.globalAlpha=a0; }
function artStorm(ctx,x,y,sc,f,p,t){ var fb=A.funnel_back, FH=TW.h*sc, k=FH/fb.height, FW=fb.width*k, by=y+6*sc;
  ring(ctx,'dust_ring_back',x,y-10*sc,k,t,0);
  funnel(ctx,'funnel_back',x,by,k,t,1,0.55,0.95);
  orbit(ctx,x,y,k,t,false,FW,FH);
  dust(ctx,x,y,sc,t,false);
  silhouette(ctx,x,y,sc,f,p,t);
  funnel(ctx,'funnel_front',x,by,k*(fb.height/A.funnel_front.height)*1.0,t+0.4,-1,0.8,1);
  orbit(ctx,x,y,k,t,true,FW,FH);
  dust(ctx,x,y,sc,t,true);
  ring(ctx,'dust_ring_front',x,y+4*sc,k,t,1); }
U.draw=function(ctx,x,y,sc,face,p){ if(!p||p.spinT==null) return baseDraw.apply(this,arguments);
  var t=p.spinT, f=Math.sin(t*2*Math.PI/p.spinPer)>=0?1:-1, K=p.spinK==null?1:p.spinK;
  if(K<1){ ctx.save(); ctx.globalAlpha=1-K; baseDraw.call(this,ctx,x,y,sc,face,p); ctx.restore(); }   // hero fades into / out of the storm
  if(K<=0) return;
  ctx.save(); ctx.globalAlpha=K;
  if(AR){ artStorm(ctx,x,y,sc,f,p,t); ctx.restore(); return; }
  ctx.save(); ctx.lineCap='round'; dust(ctx,x,y,sc,t,false); veil(ctx,x,y,sc,t,false); rings(ctx,x,y,sc,t,false); ctx.restore();
  silhouette(ctx,x,y,sc,f,p,t);
  ctx.save(); ctx.lineCap='round'; veil(ctx,x,y,sc,t,true); rings(ctx,x,y,sc,t,true); dust(ctx,x,y,sc,t,true); ctx.restore(); ctx.restore(); };
U.SPIN_TWISTER=TW;
})();

