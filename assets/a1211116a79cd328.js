
/* ---- robot-r1 (TEST allin_r68, 13 Nov 2026): STEAM ROBOT = the Steam Hammer ULTIMATE (Motion r29, all 6 modes passed by DeaRz 13 Nov 17:10; Balance BALANCE_wrench_r1 sec 4, option A) ----
   Flow: ultimate (hammer held, MP 80, CD 90 s, Lv10 -30 %) -> pose 6 (throw blueprint) -> blueprint on the ground, robot ASSEMBLES (1.6 s) -> pose 7 (mount) -> RIDE (18 s, Lv5+ 24 s) -> pose 8 (eject) when the time is up / Eject skill / robot HP 0.
   RIDE: the hero is hidden (drawn seated in the cockpit), moves with the normal controls (robot walk cycle), normal skills and the basic attack are locked (no claw), bar slots 1 / 2 / 3 show the robot skills:
     1 Jump Smash (click point, range 420 px, r150 demo units ring, 500 % x curve, knockback 120 px, CD 6 s) · 2 Steam Sweep (cone, 20 hits 0.4-1.8 s, 720 % total x curve split over the 20 hits, push 70, slow 40 % 3 s (boss 20 %), CD 8 s)
     3 Eject (hero ejects, the robot runs to the nearest monster within 400 (else walks 150) and self-destructs: ring r220, 800 % x curve, Lv10 x1.3). Robot HP = 300 % of the hero's max HP, the hero takes NO damage while riding (every hit goes to the robot, hero DEF applies), HP 0 = forced eject + a 50 % explosion on the spot.
   Curve A per level = the knuckle curve (159..404 / 227: Lv1 .70 ... Lv4 1.00 ... Lv10 1.78). Demo units (the motion's px) are drawn x r world px (r = hero draw scale / 0.1485); Balance px (jump range 420, jump knockback 120) are world px.
   The skill lives in the hammer skill line of the weapon skill window (__WSK.lines.hammer, own points Lv1-10 like the knuckle line, row 5 = unlock Lv25); installable in a slot; ?robot=give = GM (gives the hammer, opens every row); ?robot=off removes it. Debug: window.ROBOT ---- */
(function(){
const Q=String(location.search),OFF=/[?&]robot=off\b/.test(Q),GIVE=/[?&]robot=give\b/.test(Q),SWMOVE=!/[?&]sweepmove=off\b/.test(Q),SWFIX=/[?&]sweepaim=fixed\b/.test(Q),KOFF=/[?&]knight=off\b/.test(Q),R30=!/[?&]robot30=off\b/.test(Q),R30F=.65,AUTOF=!/[?&]robotauto=off\b/.test(Q);
const RB=window.ROBOT={ver:'robot-r1',on:!OFF,err:null,run:null,casts:0,hits:0,dmg:0,fxMs:0,fxN:0,sc:.1105,give:GIVE,
  cfg:{PCT:[159,182,204,227,261,284,309,336,365,404],BASE:227,JUMP:500,SWEEP:720,EJECT:800,DUR:18,DUR5:24,CD:90,CD10:.7,MP:80,HPX:3,JUMP_CD:6,SW_CD:8,JUMP_RANGE:420,JUMP_KB:120,SLOW:.4,SLOW_BOSS:.2,SLOW_T:3,R_JUMP:160,R_BOOM:220,CONE:240,CHASE:400,PUSH:70,CAP:99999,B10:1.3,HP0_BOOM:.5,UNLOCK_ROW:4}};
if(OFF)return;
const ERR=(w,e)=>{RB.err=w+': '+((e&&e.message)||e);try{console.error('[ROBOT]',w,e)}catch(_){}};
const clampN=(v,a,b)=>Math.max(a,Math.min(b,v));
const held=()=>{try{return !!(P&&P.weapon&&P.weapon.t==='hammer')}catch(_){return false}};
const playing=()=>{try{return G.state==='play'&&!P.dead&&!G.win&&!G.edit}catch(_){return false}};
const toast=(m,c)=>{try{textAt(P.x,P.y-62,m,c||'#ffd98a',13)}catch(_){}};
/* ======================== demo code (Motion r29 body.html: rig, walk, steam jet, land / boom FX, rune ring) ======================== */
var cx=null,RS=0.3,RX0=0,GW=1200,GH=680,JET={phi:0,on:false},JETX=440,SCD=0.1485,GD=10;
var RI={};try{Object.keys(window.RB_SRC||{}).forEach(function(k){var im=new Image();im.src=window.RB_SRC[k];RI[k]=im})}catch(e){ERR('imgs',e)}
function ok(im){ return im&&im.complete&&im.naturalWidth; }
function rnd(s){ var x=Math.sin(s*127.1+311.7)*43758.5453; return x-Math.floor(x); }
function E(x){ x=Math.max(0,Math.min(1,x)); return x*x*(3-2*x); }
function lerp(a,b,u){ return a+(b-a)*u; }
function seg(x,a,b){ return Math.max(0,Math.min(1,(x-a)/(b-a))); }
var RP={
 torso:{img:'torso',pivot:[217,200],parent:null,at:[0,0]},
 stack:{img:'smoke_stack',pivot:[62,222],parent:'torso',at:[322,42]},
 armF:{img:'upper_arm_far',pivot:[140,40],parent:'torso',at:[404,172]},
 foreF:{img:'forearm_claw',pivot:[318,42],parent:'armF',at:[42,150]},
 thighF:{img:'far_thigh',pivot:[75,40],parent:'torso',at:[258,318]},
 shinF:{img:'far_shin',pivot:[88,128],parent:'thighF',at:[53,185]},
 footF:{img:'far_foot',pivot:[83,24],parent:'shinF',at:[62,200]},
 thighN:{img:'near_thigh',pivot:[75,40],parent:'torso',at:[104,318]},
 shinN:{img:'near_shin',pivot:[88,128],parent:'thighN',at:[53,185]},
 footN:{img:'near_foot',pivot:[83,24],parent:'shinN',at:[62,200]},
 armN:{img:'upper_arm_near',pivot:[140,40],parent:'torso',at:[26,184]},
 foreN:{img:'forearm_nozzle',pivot:[284,40],parent:'armN',at:[42,150]}};
// r7 DeaRz 16:28: claw arm drawn FRONT-MOST and mirrored to the front side (MIRF)
var RORD=['stack','torso','RIDER','thighN','shinN','footN','thighF','shinF','footF','armN','foreN','armF','foreF'], MIRF=true, MIRFOOT=true; // r10 DeaRz 16:32: both feet flipped (toe to the other side)
var REST={armF:-60,foreF:-70,armN:0,foreN:0,thighN:16,shinN:-18,footN:2,thighF:-22,shinF:22,footF:0};
var TINT={}; function tint(k,col){ var key=k+col; if(TINT[key]) return TINT[key]; var im=RI[k], c=document.createElement('canvas'); c.width=im.width; c.height=im.height; var g=c.getContext('2d'); g.drawImage(im,0,0); g.globalCompositeOperation='source-atop'; g.fillStyle='rgb('+col+')'; g.fillRect(0,0,c.width,c.height); return TINT[key]=c; }
function mul(a,b){ return [a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]]; }
function Tm(x,y){ return [1,0,0,1,x,y]; } function Rm(d){ var c=Math.cos(d*Math.PI/180),s=Math.sin(d*Math.PI/180); return [c,s,-s,c,0,0]; }
function rsolve(p){ var W={}; function g(k){ if(W[k]) return W[k]; var q=RP[k], r=(p.rot[k]||0)+(REST[k]||0), base=q.parent?g(q.parent):Tm(0,0);
  var m=mul(base,Tm(q.at[0],q.at[1])); m=mul(m,Rm(r)); m=mul(m,Tm(-q.pivot[0],-q.pivot[1])); if((k==='footN'||k==='footF')&&MIRFOOT) m=mul(m,[-1,0,0,1,2*q.pivot[0],0]); if(k==='armF'&&MIRF){ var tq=g('torso'), sx=tq[0]*q.at[0]+tq[2]*q.at[1]+tq[4]; m=mul([-1,0,0,1,2*sx,0],m); } W[k]=m; return m; }
  Object.keys(RP).forEach(g); return W; }
function rpt(W,k,x,y){ var m=W[k]; return [m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]]; }
// ground offset: lowest foot bottom (foot image bottom y 138)
function rFootY(W){ return Math.max(rpt(W,'footN',30,138)[1],rpt(W,'footN',200,138)[1],rpt(W,'footF',30,138)[1],rpt(W,'footF',200,138)[1]); }
// draw robot with feet at (x,y) facing right; p={rot,air,dx,off:{k:[dx,dy,rot,alpha]},rider:fn,flash,swell}
function rDraw(x,y,p){ var W=rsolve(p), gy=p.gy!=null?p.gy:rFootY(W);
  cx.save(); cx.translate(x,y-(p.air||0)); cx.scale(-RS*(p.swell||1),RS*(p.swell||1)); cx.translate(0,-gy);
  var base=cx.getTransform();
  RORD.forEach(function(k){
    if(k==='RIDER'){ if(p.rider){ cx.save(); var m=W.torso; cx.transform(m[0],m[1],m[2],m[3],m[4],m[5]); cx.beginPath(); cx.moveTo(40,214); cx.lineTo(40,96); cx.quadraticCurveTo(48,22,140,24); cx.quadraticCurveTo(232,26,240,100); cx.lineTo(240,214); cx.closePath(); cx.clip();
        var sp=rpt(W,'torso',150,330); cx.setTransform(base); cx.transform(1,0,0,1,sp[0],sp[1]); var inv=cx.getTransform(); cx.setTransform(1,0,0,1,0,0); p.rider(inv); cx.restore(); } return; }
    var q=RP[k], im=RI[q.img]; if(!ok(im)) return; var m=W[k], o=(p.off&&p.off[k])||null;
    cx.save(); if(o){ if(o[3]<=0){ cx.restore(); return; } cx.globalAlpha=o[3]; var pv=rpt(W,k,q.pivot[0],q.pivot[1]); cx.translate(o[0],o[1]); cx.translate(pv[0],pv[1]); cx.rotate(o[2]*Math.PI/180); cx.translate(-pv[0],-pv[1]); }
    cx.transform(m[0],m[1],m[2],m[3],m[4],m[5]); cx.drawImage(im,0,0);
    if(p.flash>0){ var ti=tint(q.img,p.flashCol||'255,240,200'); cx.globalAlpha=(o?o[3]:1)*p.flash; cx.drawImage(ti,0,0); }
    cx.restore(); });
  cx.restore(); return W; }
// world (screen) point of a robot part point for a pose drawn at (x,y)
function rScreen(x,y,p,k,px,py){ var W=rsolve(p), gy=p.gy!=null?p.gy:rFootY(W), a=rpt(W,k,px,py), s=RS*(p.swell||1); return [x-a[0]*s, y-(p.air||0)+(a[1]-gy)*s]; }
// ---------------- ROBOT POSES ----------------
function idleRot(t){ var b=Math.sin(t*2*Math.PI/1.6); return {torso:b*1.2,armN:b*3,foreN:-b*2,armF:-b*3,foreF:b*3,thighN:0,shinN:0,footN:0,thighF:0,shinF:0,footF:0,stack:b*2, bob:b*4}; }
function legs(r,aN,kN,aF,kF){ r.thighN=aN; r.shinN=kN; r.footN=-(aN+kN+(r.torso||0)); r.thighF=aF; r.shinF=kF; r.footF=-(aF+kF+(r.torso||0)); }
// r5: same walk cycle as the main hero (rig_base pose 'walk'): period 0.8 s, thigh +-24, knee bend 34 on the forward swing, foot = half of knee, arms +-26 opposite the legs, small root bob
var WPER=0.8, WV=150;
function walkRot(t){ var a=((t/WPER)%1)*2*Math.PI, sn=Math.sin(a), c=Math.cos(a), r=idleRot(0), A=24, K=85, LIFT=34, AR=8;
  r.torso=-2; var lN=Math.max(0,c), lF=Math.max(0,-c); // r15 DeaRz: lift the swinging foot (no dragging)
  r.thighN=A*sn+LIFT*lN; r.thighF=-A*sn+(LIFT+38)*lF; r.shinN=-K*lN; r.shinF=-K*lF;
  r.footN=-(r.thighN+r.shinN+r.torso); r.footF=-(r.thighF+r.shinF+r.torso);
  r.armN=-AR*sn; r.armF=(MIRF?-1:1)*AR*sn; // mirrored claw arm: sign flips so it swings opposite the nozzle arm
  r.foreN=2*sn; r.foreF=-2*sn; r.stack=sn*2.2; r.bob=(3*(1-Math.abs(sn))*2-3)*0.5; return r; } // r17: bob kept at half (DeaRz: reduce, not remove)
// r16 DeaRz 'ตัวสั่นเยอะ': body height follows the STANCE foot with a smooth blend (no jump when the lowest foot changes), then damped to 35% of the hip arc
var GY0=null; function walkGy(t,r){ var W=rsolve({rot:r}), c=Math.cos(((t/WPER)%1)*2*Math.PI), wN=0.5-0.5*c, yN=rpt(W,'footN',110,138)[1], yF=rpt(W,'footF',110,138)[1], g=wN*yN+(1-wN)*yF;
  if(GY0==null){ var Wi=rsolve({rot:idleRot(0)}); GY0=rFootY(Wi); } return GY0+(g-GY0)*0.6; }
function steamJet2(R,s,al){ var a=rScreen(R.x,R.y,R.p,'foreN',18,96), ph=JET.phi*Math.PI/180, L=Math.max(160,Math.min(JETX+40,(JETX-a[0])/Math.cos(ph))), im=RI.steam_jet_l, sm=RI.smoke_m; if(!ok(im)||!ok(sm)) return;
  cx.save(); cx.translate(a[0],a[1]); cx.rotate(ph);
  // core streak
  cx.save(); cx.globalCompositeOperation='lighter'; var g=cx.createLinearGradient(0,0,L,0); g.addColorStop(0,'rgba(255,255,255,'+(0.55*al)+')'); g.addColorStop(1,'rgba(220,235,255,0)'); cx.fillStyle=g; cx.beginPath(); cx.moveTo(0,-8); cx.lineTo(L,-85); cx.lineTo(L,85); cx.lineTo(0,8); cx.closePath(); cx.fill(); cx.restore();
  for(var i=0;i<12;i++){ var k=((s*3.2+i/12)%1), d=L*k; cx.save(); cx.globalAlpha=al*Math.pow(1-k,0.6)*0.9; var sc=0.18+0.55*k; cx.translate(d,(rnd(i+Math.floor(s*3.2))-0.5)*130*k); sc*=1.5; cx.scale(sc,sc); cx.drawImage(i%2?im:sm,0,-(i%2?im:sm).height/2); cx.restore(); }
  cx.restore();
  // mist around the hit zone
  var hx=a[0]+Math.cos(ph)*L*0.82, hy=a[1]+Math.sin(ph)*L*0.82;
  for(var j=0;j<7;j++){ var t2=(s*0.9+j/7)%1; cx.save(); cx.globalAlpha=al*0.6*(1-t2); var sc=0.3+0.4*t2; cx.translate(hx+(rnd(j*3)-0.5)*300+20*t2,hy+(rnd(j*5)-0.5)*150-30*t2); cx.scale(sc,sc); cx.drawImage(sm,-sm.width/2,-sm.height/2); cx.restore(); }
  // droplets
  cx.save(); cx.fillStyle='rgba(200,230,255,'+(0.9*al)+')'; for(var j=0;j<14;j++){ var t3=(s*2.4+j/14)%1, dd=L*(0.3+0.7*t3), off=(rnd(j*7)-0.5)*140*t3; var px=a[0]+Math.cos(ph)*dd-Math.sin(ph)*off, py=a[1]+Math.sin(ph)*dd+Math.cos(ph)*off+40*t3*t3; cx.beginPath(); cx.arc(px,py,2.2,0,6.283); cx.fill(); } cx.restore();
  // nozzle muzzle puff
  cx.save(); cx.globalAlpha=al*0.8; var ms=0.22+0.06*Math.sin(s*50); cx.translate(a[0],a[1]); cx.scale(ms,ms); cx.drawImage(sm,-sm.width/2,-sm.height/2); cx.restore(); }
function puff(x,y,s,i){ var im=RI.smoke_m; if(!ok(im)) return; var k=s%1; cx.save(); cx.globalAlpha=0.7*(1-k); var sc=0.18+0.25*k; cx.translate(x+10*k+(i||0),y-60*k); cx.scale(sc,sc); cx.drawImage(im,-im.width/2,-im.height/2); cx.restore(); }
// r19 DeaRz 'เอฟเฟกต์ตอนลงเยอะกว่านี้ มีคลื่นกระแทกและควันรอบๆ': flash, 2 shockwaves, ground cracks, smoke ring rolling outward, debris, dust column (Motion placeholders; VFX may redo)
function smokeAt(x,y,sc,al,key){ var im=RI[key||'smoke_m']; if(!ok(im)||al<=0) return; cx.save(); cx.globalAlpha=al; cx.translate(x,y); cx.scale(sc,sc); cx.drawImage(im,-im.width/2,-im.height/2); cx.restore(); }
function landFX(x,y,e){
  // ground cracks (dark jagged lines), fade over 1.1 s
  if(e<1.1){ var ca=1-e/1.1, cl=Math.min(1,e/0.08); cx.save(); cx.strokeStyle='rgba(60,30,10,'+(0.75*ca)+')'; cx.lineWidth=3; cx.lineJoin='round';
    for(var j=0;j<8;j++){ var a=j/8*6.283+0.3, L=(70+rnd(j*3)*70)*cl; cx.beginPath(); cx.moveTo(x,y); var px=x,py=y; for(var q=1;q<=4;q++){ var rr=L*q/4, jx=(rnd(j*7+q)-0.5)*14; px=x+Math.cos(a)*rr+jx; py=y+Math.sin(a)*rr*0.33+jx*0.3; cx.lineTo(px,py); } cx.stroke(); } cx.restore(); }
  // impact flash
  if(e<0.18){ var fk=e/0.18; cx.save(); cx.globalCompositeOperation='lighter'; var g=cx.createRadialGradient(x,y-20,0,x,y-20,60+120*fk); g.addColorStop(0,'rgba(255,250,225,'+(1-fk)+')'); g.addColorStop(0.5,'rgba(255,200,110,'+(0.6*(1-fk))+')'); g.addColorStop(1,'rgba(255,160,60,0)'); cx.fillStyle=g; cx.beginPath(); cx.arc(x,y-20,60+120*fk,0,6.283); cx.fill(); cx.restore(); }
  // shockwave 1: bright thick ring
  if(e<0.45){ var k=e/0.45, ke=1-Math.pow(1-k,2.2); cx.save(); cx.strokeStyle='rgba(255,244,210,'+(1-k)+')'; cx.lineWidth=14*(1-k)+2; cx.beginPath(); cx.ellipse(x,y,30+210*ke,10+70*ke,0,0,6.283); cx.stroke(); cx.strokeStyle='rgba(255,190,90,'+(0.7*(1-k))+')'; cx.lineWidth=4; cx.beginPath(); cx.ellipse(x,y,22+200*ke,7+66*ke,0,0,6.283); cx.stroke(); cx.restore(); }
  // shockwave 2: wider dusty ring, slightly later
  var e2=e-0.08; if(e2>0&&e2<0.65){ var k2=e2/0.65, k2e=1-Math.pow(1-k2,2); cx.save(); cx.strokeStyle='rgba(225,190,130,'+(0.8*(1-k2))+')'; cx.lineWidth=10*(1-k2)+2; cx.beginPath(); cx.ellipse(x,y,40+280*k2e,13+92*k2e,0,0,6.283); cx.stroke(); cx.restore(); }
  // smoke ring rolling outward around the impact
  if(e<1.2){ var k3=e/1.2, r3=1-Math.pow(1-k3,2.5); for(var j=0;j<16;j++){ var a=j/16*6.283+rnd(j)*0.3, R=40+230*r3*(0.85+rnd(j*5)*0.3); var px=x+Math.cos(a)*R, py=y+Math.sin(a)*R*0.32-14-30*k3*(0.5+rnd(j*9)); smokeAt(px,py,0.22+0.4*k3,0.85*Math.pow(1-k3,1.3),j%3===0?'smoke_l':'smoke_m'); } }
  // dust column at the centre
  if(e<1.0){ var k4=e/1.0; for(var j=0;j<4;j++) smokeAt(x+(j-1.5)*26,y-30-90*k4*(0.6+0.2*j),0.35+0.5*k4,0.8*(1-k4),'smoke_l'); }
  // debris rocks
  if(e<0.9){ for(var j=0;j<12;j++){ var a=-Math.PI*(0.1+0.8*rnd(j*11)), v=180+rnd(j*13)*220, dx=Math.cos(a)*v*e*(j%2?1:-1), dy=Math.sin(a)*v*e+520*e*e; if(dy>8) continue; var sz=4+rnd(j*17)*6; cx.save(); cx.globalAlpha=1-e/0.9; cx.translate(x+dx,y-10+dy); cx.rotate(e*10+j); cx.fillStyle=j%3?'#8a5a2b':'#c9a46a'; cx.strokeStyle='#3a2210'; cx.lineWidth=1.5; cx.beginPath(); cx.moveTo(-sz,-sz*0.4); cx.lineTo(sz*0.2,-sz); cx.lineTo(sz,0); cx.lineTo(0,sz*0.8); cx.closePath(); cx.fill(); cx.stroke(); cx.restore(); } }
}
// r25 explosion: flash, layered fireball, 2 shockwaves, cracks, smoke ring, dark smoke column, embers (Motion placeholders; VFX may redo)
// r26 rune circle on the ground (squashed ellipse): outer + inner rings, 28 procedural glyphs between them rotating, small ticks; glows with pulse pl
var RUNE_IM=new Image(); RUNE_IM.src='assets/4805fb864a70531e.png'; var RUNE_T=null; window.__rune=function(){return [RUNE_IM.complete,RUNE_IM.naturalWidth,!!RUNE_T];}; // DeaRz standing rule: rune circles use the EXISTING cut V7 rune art (approved/vfx/runes/v7_runes_atlas_64x12.png)
var RUNE_D=null; function runeTintC(col){ var c=document.createElement('canvas'); c.width=RUNE_IM.width; c.height=RUNE_IM.height; var g=c.getContext('2d'); g.drawImage(RUNE_IM,0,0); g.globalCompositeOperation='source-atop'; g.fillStyle=col; g.fillRect(0,0,c.width,c.height); return c; }
function runeTint(){ if(RUNE_T||!ok(RUNE_IM)) return RUNE_T; RUNE_D=runeTintC('rgb(60,8,4)'); return RUNE_T=runeTintC('rgb(255,236,180)'); }
function glyph(g,seed){ g.beginPath(); var n=2+Math.floor(rnd(seed)*3); g.moveTo(0,-7); g.lineTo(0,7); for(var k=0;k<n;k++){ var t=rnd(seed*3+k), y0=-7+14*rnd(seed*5+k); if(t<0.33){ g.moveTo(0,y0); g.lineTo(5*(rnd(seed+k*7)>0.5?1:-1),y0+4); } else if(t<0.66){ g.moveTo(-4,y0); g.lineTo(4,y0); } else { g.moveTo(3,y0); g.arc(0,y0,3,0,Math.PI*(rnd(seed+k)>0.5?1:-1),true); } } g.stroke(); }
function runeRing(x,y,R,ratio,rot,al,pl){ var glow='rgba(255,'+Math.floor(200+40*pl)+',150,1)', RI2=R-44, RT=runeTint();
  cx.save(); cx.globalAlpha=al; cx.translate(x,y);
  function ell(r,w,col,blur){ cx.save(); cx.strokeStyle=col; cx.lineWidth=w; cx.shadowColor='rgba(255,90,40,.9)'; cx.shadowBlur=blur||0; cx.beginPath(); cx.ellipse(0,0,r,r*ratio,0,0,6.283); cx.stroke(); cx.restore(); }
  cx.save(); cx.fillStyle='rgba(110,15,8,'+(0.42+0.15*pl)+')'; cx.beginPath(); cx.ellipse(0,0,R,R*ratio,0,0,6.283); cx.ellipse(0,0,RI2,RI2*ratio,0,0,6.283,true); cx.fill('evenodd'); cx.restore();
  ell(R,7,'rgba(70,10,5,.85)'); ell(RI2,6,'rgba(70,10,5,.85)'); ell(R,3,glow,12); ell(RI2,2.5,glow,10); ell(RI2-7,1.5,glow,0);
  // runes stand upright on the band (billboard, lightly squashed) so they read clearly on a phone
  var N=24; for(var j=0;j<N;j++){ var a=rot+j/N*6.283, rr=(R+RI2)/2, px=Math.cos(a)*rr, py=Math.sin(a)*rr*ratio; if(!RT) break; cx.save(); cx.translate(px,py); cx.scale(1,0.62); var c=j%12; cx.drawImage(RUNE_D,c*64,0,64,64,-18,-18,36,36); cx.shadowColor='rgba(255,90,30,1)'; cx.shadowBlur=10; cx.drawImage(RT,c*64,0,64,64,-15,-15,30,30); cx.restore(); }
  cx.restore(); }
function boomFX(x,y,e){
  if(e<0.12){ cx.save(); cx.globalCompositeOperation='lighter'; cx.fillStyle='rgba(255,245,220,'+(0.55*(1-e/0.12))+')'; cx.fillRect(x-900,y-600,1800,900); cx.restore(); }
  if(e<0.7){ var k=e/0.7, rr=40+190*(1-Math.pow(1-k,2)); cx.save(); cx.globalCompositeOperation='lighter'; for(var l=0;l<3;l++){ var cy=y-60-40*k-l*18, g=cx.createRadialGradient(x,cy,0,x,cy,rr*(1-l*0.22)); g.addColorStop(0,'rgba(255,250,220,'+(1-k)+')'); g.addColorStop(0.35,'rgba(255,190,70,'+(0.9*(1-k))+')'); g.addColorStop(0.7,'rgba(255,90,30,'+(0.6*(1-k))+')'); g.addColorStop(1,'rgba(200,40,10,0)'); cx.fillStyle=g; cx.beginPath(); cx.arc(x,cy,rr*(1-l*0.22),0,6.283); cx.fill(); } cx.restore(); }
  landFX(x,y,e*0.9);
  if(e<0.6){ var k2=e/0.6, k2e=1-Math.pow(1-k2,2); cx.save(); cx.strokeStyle='rgba(255,140,60,'+(0.9*(1-k2))+')'; cx.lineWidth=12*(1-k2)+2; cx.beginPath(); cx.ellipse(x,y,50+300*k2e,16+98*k2e,0,0,6.283); cx.stroke(); cx.restore(); }
  if(e<1.4){ var k3=e/1.4; for(var j=0;j<5;j++){ var im=RI.smoke_l; if(!ok(im)) break; cx.save(); cx.globalAlpha=0.75*(1-k3); cx.translate(x+(j-2)*30+Math.sin(e*3+j)*10,y-90-160*k3*(0.7+0.15*j)); var sc=0.45+0.7*k3; cx.scale(sc,sc); cx.filter='brightness(0.45)'; cx.drawImage(im,-im.width/2,-im.height/2); cx.restore(); } }
  if(e<1.0){ cx.save(); cx.globalCompositeOperation='lighter'; for(var j=0;j<18;j++){ var a=-Math.PI*rnd(j*19), v=200+rnd(j*23)*300, ex=x+Math.cos(a)*v*e*(j%2?1:-1), ey=y-60+Math.sin(a)*v*e+400*e*e; cx.fillStyle='rgba(255,'+(150+Math.floor(rnd(j)*90))+',60,'+(1-e)+')'; cx.beginPath(); cx.arc(ex,ey,2.5+rnd(j*29)*2.5,0,6.283); cx.fill(); } cx.restore(); }
}
/* ======================== numbers ======================== */
const C=RB.cfg;
const lvAt=()=>{try{return RB.lv}catch(_){return 1}};
const curve=lv=>C.PCT[clampN(lv,1,10)-1]/C.BASE;
const durOf=lv=>lv>=5?C.DUR5:C.DUR,cdOf=lv=>C.CD*(lv>=10?C.CD10:1);
const rk=()=>Math.max(.3,(RB.sc||SCD)/SCD);
/* ======================== points / levels (own pool for the hammer line, like the knuckle line: Lv1 free, +1 per point up to Lv10, saved in P.skLv.hammer) ======================== */
const MAXLV=10,KEYS={hm_robot:{row:C.UNLOCK_ROW}};if(!/[?&]hammersk=off\b/.test(Q))Object.assign(KEYS,{hm_smash:{row:1},hm_armor:{row:1},hm_lube:{row:3},hm_heavy:{row:2,max:5},hm_turret:{row:0},hm_repair:{row:0},hm_craft:{row:0,max:5},hm_dolls:{row:2},hm_trap:{row:3},hm_upg:{row:2},hm_suit:{row:4},hm_durable:{row:1,max:5},hm_spare:{row:3,max:5},hm_recycle:{row:4,max:5}});RB.KEYS=KEYS;RB.lvOf=k=>lvOf(k);RB.openK=k=>open(k);
const UNL=()=>(window.__WSK&&__WSK.cfg&&__WSK.cfg.unlock)||[1,10,15,20,25];
const plv=()=>{try{return P.lvl|0}catch(_){return 1}};
const SU=()=>window.__SKUP;
function sk(){try{if(!P.skLv||typeof P.skLv!=='object')P.skLv={};if(!P.skLv.hammer||typeof P.skLv.hammer!=='object')P.skLv.hammer={};return P.skLv.hammer}catch(_){return {}}}
const needOf=k=>{const u=UNL();return u[Math.min((KEYS[k]&&KEYS[k].row)|0,u.length-1)]};
const open=k=>GIVE||plv()>=needOf(k)||bonus(k)>0||!!(window.SLOTUI&&SLOTUI.slotOf&&SLOTUI.slotOf(k));
const bonus=k=>clampN(sk()[k]|0,0,MAXLV-1);
const lvOf=k=>KEYS[k]?(/[?&]robotlv=(\d+)/.test(Q)?clampN(+/[?&]robotlv=(\d+)/.exec(Q)[1],1,10):1+bonus(k)):0;
const total=()=>{try{const t=SU()&&SU().total?SU().total():null;return t!=null?t:Math.max(0,2*(plv()-1))}catch(_){return Math.max(0,2*(plv()-1))}};
const spent=()=>{let n=0;for(const k in KEYS)n+=bonus(k);return n};
const free=()=>Math.max(0,total()-spent());
function up(k){if(!KEYS[k])return 'ไม่มีเลเวล';if(/[?&]robotlv=/.test(Q))return 'ล็อกเลเวลด้วย ?robotlv';if(!open(k))return 'ยังไม่ปลดล็อก';if(lvOf(k)>=((KEYS[k]&&KEYS[k].max)||MAXLV))return 'เต็มแล้ว';if(free()<1)return 'แต้มไม่พอ';sk()[k]=bonus(k)+1;syncLv();try{saveGame()}catch(_){}return ''}
function reset(){const o=sk();for(const k in KEYS)o[k]=0;syncLv();try{saveGame()}catch(_){}}
function syncLv(){try{if(P&&P.skLv)RB.lv=clampN(lvOf('hm_robot'),1,MAXLV)}catch(e){ERR('sync',e)}}
RB.lv=1;setInterval(syncLv,250);
RB.free=free;RB.up=up;RB.reset=reset;RB.spent=spent;
function wrapPts(){try{const u=SU();if(!u||u._hmPts)return;const o=u.ptsTxt;u.ptsTxt=function(){try{if(held())return ' · แต้ม '+free()}catch(_){}return o.apply(this,arguments)};u._hmPts=1}catch(e){ERR('pts',e)}}
setInterval(wrapPts,500);
/* ======================== icons (placeholders: Art has not drawn the robot icons yet) ======================== */
function mkIcon(c1,g){try{const c=document.createElement('canvas');c.width=c.height=96;const x=c.getContext('2d');
  const rr=(a,b,w,h,r)=>{x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()};
  const bg=x.createRadialGradient(48,44,6,48,48,70);bg.addColorStop(0,c1);bg.addColorStop(1,'#1a1208');rr(3,3,90,90,13);x.fillStyle=bg;x.fill();
  x.fillStyle='rgba(255,255,255,.92)';x.font='bold 46px system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.shadowColor='#000';x.shadowBlur=6;x.fillText(g,48,50);x.shadowBlur=0;
  const fr=x.createLinearGradient(0,0,96,96);fr.addColorStop(0,'#e3a14a');fr.addColorStop(1,'#8a4f1a');rr(3,3,90,90,13);x.lineWidth=5;x.strokeStyle=fr;x.stroke();return c.toDataURL('image/png')}catch(_){return null}}
const ICO={ult:mkIcon('#b9792a','⚙'),jump:mkIcon('#c0562b','⤓'),sweep:mkIcon('#4a8fc0','≋'),eject:mkIcon('#c02b2b','✹')};
/* ======================== helpers: world ======================== */
const freeAt=(x,y)=>{try{return !blocked(x,y,10)}catch(_){return true}};
function nearestMon(x,y,maxD){let b=null,bd=maxD;for(const e of enemies){if(e.dead||!(e.hp>0))continue;const d=Math.hypot(e.x-x,e.y-y);if(d<bd){bd=d;b=e}}return b}
const isBoss=e=>{try{return !!(e.m&&e.m.boss)||!!e.gateBoss}catch(_){return false}};
function hitPct(e,pct,tag){if(R30&&/^(jump|sw|gt|rk|th|pn)/.test(tag))pct*=R30F;try{e._rbHit=time}catch(_){}const hp0=e.hp,vx0=e.vx,vy0=e.vy;
  try{const A=C182.api,D=A.D(),wd=D.weapons.hammer||D.weapons.sword,basic=wd.actionCoef*wd.weights.reduce((a,b)=>a+b,0);const id='rb_'+tag,d={id,mode:'native',coefTotal:basic*pct/100,flatTotal:0,weights:[1],schedule:[0],maxTargets:1,targeting:'around',element:'Neutral'};
    const c=A.ctxFor('skill',id,d,{dt:'phys',lvScale:1,m0:1,reach:9999,cdId:'rbX'});hitEnemy(e,1,{dt:'phys',ctx:c,rb:1,kb:0,knk:1})}catch(er){ERR('hit',er)}
  try{if(vx0!=null&&(e.vx!==vx0||e.vy!==vy0)){e.vx=vx0;e.vy=vy0}}catch(_){}
  const d=Math.max(0,hp0-Math.max(0,e.hp));RB.hits++;RB.dmg+=d;return d}
try{const _a=applyDamage;applyDamage=function(e,d,crit,o){if(o&&o.rb){if(o.kb)o.kb=0;if(d>C.CAP)d=C.CAP}return _a.call(this,e,d,crit,o)}}catch(e){ERR('hook damage',e)}
/* knockback slide + slow bookkeeping */
let KO=[];const SLOWED=new Set();
function push(e,dx,dy,dur){if(isBoss(e))return;KO.push({e,t0:time,dur:dur||.3,x0:e.x,y0:e.y,dx,dy})}
function slow(e){try{const a=isBoss(e)?C.SLOW_BOSS:C.SLOW;if(!e._rbS){e._rbS={sp0:e.sp,end:0};SLOWED.add(e)}e._rbS.end=time+C.SLOW_T;e.sp=e._rbS.sp0*(1-a)}catch(_){}}
function koTick(){KO=KO.filter(k=>{const u=clampN((time-k.t0)/k.dur,0,1),e=k.e;if(!e||e.dead)return false;const eu=1-Math.pow(1-u,3),nx=k.x0+k.dx*eu,ny=k.y0+k.dy*eu;if(freeAt(nx,ny)){e.x=nx;e.y=ny}return u<1});
  for(const e of Array.from(SLOWED)){const s=e._rbS;if(!s||e.dead||time>=s.end){try{if(s)e.sp=s.sp0}catch(_){}e._rbS=null;SLOWED.delete(e)}}}
/* ======================== robot poses (ported from robotState) ======================== */
function idleP(t){const r=idleRot(t);return {gy:null,rot:r,air:0,off:null,flash:0,flashCol:'255,240,200',swell:1,bob:r.bob,x:0}}
function walkP(wt){const r=walkRot(wt);return {gy:walkGy(wt,r),rot:r,air:0,off:null,flash:0,flashCol:'255,240,200',swell:1,bob:r.bob,x:0}}
function assembleP(s){const r=idleRot(0);let off=null,vis=true,rider=false;
  if(s<0){vis=false}else{off={};const order=[['footN',0.10],['footF',0.14],['shinN',0.26],['shinF',0.30],['thighN',0.42],['thighF',0.46],['torso',0.62],['armF',0.80],['foreF',0.86],['armN',0.92],['foreN',0.98],['stack',1.10]];
    order.forEach(function(o,i){const k=o[0],ta=o[1],st=ta-0.32,u=seg(s,st,ta),e=1-Math.pow(1-u,3),sx=(rnd(i*7)-0.5)*600,sy=-260-rnd(i*3)*200;off[k]=[sx*(1-e),sy*(1-e),(rnd(i*5)-0.5)*720*(1-e),u<=0?0:Math.min(1,u*3)]})}
  return {gy:null,rot:r,air:0,off,flash:0,flashCol:'255,240,200',swell:1,bob:0,x:0,vis,rider}}
function jumpP(s){const r=idleRot(s);const KF=function(keys){for(let i=1;i<keys.length;i++){if(s<=keys[i][0]){const a=keys[i-1],b=keys[i],u=E((s-a[0])/(b[0]-a[0]));return a[1]+(b[1]-a[1])*u}}return keys[keys.length-1][1]};
  const T=[0,0.28,0.4,0.6,0.76,0.82,0.95,1.4];const V=v=>KF(T.map((t,i)=>[t,v[i]]));
  r.torso=V([0,10,-6,-4,-18,-12,-12,0]);const th=V([0,30,-6,46,10,30,30,0]),kn=V([0,-62,6,-92,-10,-60,-60,0]);legs(r,th,kn,th,kn);
  const arm=V([0,-24,40,150,135,-12,-12,0]),fore=V([0,30,-10,-30,-20,-55,-55,0]);r.armN=arm;r.foreN=fore;r.armF=-arm;r.foreF=-fore;r.stack=V([0,6,-8,0,4,10,0,0]);r.bob=0;
  const up=seg(s,0.38,0.82);const air=s>0.38&&s<0.82?Math.sin(Math.PI*Math.pow(up,0.85))*190:0;
  return {gy:null,rot:r,air,off:null,flash:0,flashCol:'255,240,200',swell:1,bob:0,x:0}}
function sweepP(s,la){la=la||0;const r=idleRot(s);const aim=E(seg(s,0,0.3))*(1-E(seg(s,1.9,2.2))),on=(s>0.3&&s<1.9),sw=on?Math.sin((s-0.3)*Math.PI*2/0.8):0,jit=on?Math.sin(s*70)*0.8:0;
  r.torso=(-8+jit)*aim;legs(r,12*aim,-26*aim,-8*aim,8*aim);r.bob=-4*aim;r.armF=30*aim;r.foreF=40*aim;r.armN=-8*aim;r.stack=(on?Math.sin(s*40)*3:0);
  const x=RX0-(6*aim+(on?2*Math.abs(sw):0));const pp={rot:r},el=rScreen(x,0,pp,'armN',42,150),ty=-40+265*Math.sin(la),tx=RX0+265*Math.cos(la),phi=Math.atan2(ty-el[1],tx-el[0])*180/Math.PI+(sw>0?5:12)*sw;
  r.foreN=(-phi-r.armN-r.torso)*aim;JET={phi:phi,on:on};
  return {gy:null,rot:r,air:0,off:null,flash:0,flashCol:'255,240,200',swell:1,bob:r.bob,x}}
/* eject: s6 = mapped time (S6 applied by the caller); kind 'skill' | 'hp0' = overheating + red flashing, 'timeout' = calm shutdown (parts drop, no explosion) */
function ejectP(s6,run,kind){let r=idleRot(s6),off=null,flash=0,swell=1;
  if(run&&s6>0.2&&s6<0.62){r=walkRot((s6-0.2)*1.5);r.bob=0}
  if(kind!=='timeout'){const sh=seg(s6,0.5,1.0);r.torso=(r.torso||0)+Math.sin(s6*90)*5*sh;r.armN=(r.armN||0)+Math.sin(s6*70)*6*sh;r.armF=(r.armF||0)-Math.sin(s6*64)*6*sh;
    flash=s6<0.2?0:(0.25+0.6*sh)*(0.5+0.5*Math.sin(s6*(14+50*sh)));swell=1+0.12*E(sh)}
  if(s6>=1.0){off={};const e=s6-1.0,sp=kind==='timeout'?0.35:1;Object.keys(RP).forEach(function(k,i){const a=rnd(i*11)*Math.PI-Math.PI,v=(420+rnd(i*13)*360)*sp;off[k]=[Math.cos(a)*v*e/RS*0.6,(-Math.abs(Math.sin(a))*v*e+760*e*e)/RS*0.6,(rnd(i)-0.5)*1100*e*sp,Math.max(0,1-e/0.9)]});swell=kind==='timeout'?1:1.12;flash=kind==='timeout'?0:Math.max(0,0.9-e*2)}
  return {gy:null,rot:r,air:0,off,flash,flashCol:kind==='timeout'?'255,240,200':'255,70,30',swell,bob:r.bob,x:0}}
/* ======================== run ======================== */
let R=null;const IDS={ult:'rbUlt',jump:'rbJump',sweep:'rbSweep'};
const T6=0.7,T7=0.9,TAS=2.0,LEAD=0.4;
let RIDERP=null;function riderPose(){if(RIDERP)return RIDERP;try{RIDERP=window.wrPose(7,1)}catch(e){ERR('riderPose',e)}return RIDERP}
function aimAng(){try{const t=typeof aimPoint==='function'?aimPoint():null;if(t&&isFinite(t.x))return Math.atan2(t.y-P.y,t.x-P.x)}catch(_){}const n=nearestMon(P.x,P.y,420);return n?Math.atan2(n.y-P.y,n.x-P.x):(P.face||0)}
function start(){try{if(R||typeof P==='undefined'||!P||P.dead||G.state!=='play'||G.win||P.casting)return false;
    if(!held()){toast('หุ่นยนต์: ต้องถือค้อนไอน้ำ');return false}
    if(!window.wrPose||!window.drawCombo||!window.RB_SRC){toast('หุ่นยนต์: ข้อมูลยังไม่พร้อม');return false}
    if(!open('hm_robot')){toast('ยังไม่ปลดล็อก');return false}
    if((P.cds[IDS.ult]||0)>0){toast('หุ่นยนต์: คูลดาวน์ '+Math.ceil(P.cds[IDS.ult])+' วิ');return false}
    syncLv();const KNI0=!!KN&&RB.lv>=10;if(P.mp<(KNI0?KC.MP:C.MP)){toast('MP ไม่พอ','#7fc8ff');return false}
    syncLv();const lv=RB.lv,k=rk(),ang=aimAng(),face=Math.cos(ang)>=0?1:-1;
    let bx=P.x,by=P.y;for(const d of [150,110,70,0]){const x=P.x+face*d*k;if(freeAt(x,P.y)){bx=x;break}}
    P.mp-=KNI0?KC.MP:C.MP;LASTCD=KNI0?KC.CD:cdOf(lv);P.cds[IDS.ult]=R30?1800+LASTCD:LASTCD;P.face=face>0?0:Math.PI;
    R=RB.run={ph:'throw',t0:time,lv,face,hx:P.x,hy:P.y,bx,by,hp0:P.hp,kn:KNI0,hpMax:Math.max(1,P.maxHp*(KNI0?KC.HPX:C.HPX)),hpR:Math.max(1,P.maxHp*(KNI0?KC.HPX:C.HPX)),ride:null,sub:null,wt:0,lastX:P.x,lastY:P.y,ko:[],ek:null};
    RB.casts++;return true}catch(e){ERR('start',e);return false}}
RB.start=start;
const lockPos=()=>!!(R&&(R.ph==='throw'||R.ph==='assemble'||R.ph==='mount'||(R.ph==='eject'&&R.ek&&R.ek.heroLock)||(R.ph==='ride'&&!R.auto&&R.sub&&(R.sub.k==='jump'||R.sub.k==='rocket'||R.sub.k==='hammer'||!SWMOVE))));
function finish(){if(R&&R30)P.cds[IDS.ult]=LASTCD;R=RB.run=null;try{buildBar()}catch(_){}}
function beginRide(){R.ph='ride';R.rt0=R.rt0||time;R.dur=R.kn?KC.DUR:durOf(R.lv);P.x=R.bx;P.y=R.by;R.lastX=P.x;R.lastY=P.y;P.vx=0;P.vy=0;R.hp0=P.hp}
function beginEject(kind){if(!R||R.ph==='eject')return;if(R.kn&&KN){KN.beginEject(kind);return}const k=rk();R.ph='eject';R.sub=null;
  const ek=R.ek={kind,t0:time,rx:P.x,ry:P.y,face:R.face,wd:0,wt6:.4,tx:P.x,ty:P.y,boomed:false,heroLock:true,heroDone:false};
  if(kind==='skill'){const tg=nearestMon(P.x,P.y,C.CHASE);if(tg){const d=Math.hypot(tg.x-P.x,tg.y-P.y);ek.wd=d/k;ek.tx=tg.x;ek.ty=tg.y;ek.face=(tg.x-P.x)>=0?1:-1}else{ek.wd=150;ek.tx=P.x+R.face*150*k;ek.ty=P.y;ek.face=R.face}
    for(let f=1;f>=0&&!freeAt(ek.tx,ek.ty);f-=.25){ek.tx=P.x+(ek.tx-P.x)*.75;ek.ty=P.y+(ek.ty-P.y)*.75}
    ek.wd=Math.hypot(ek.tx-P.x,ek.ty-P.y)/k}
  ek.wt6=Math.max(0.4,ek.wd/400);ek.dur=2.2+(ek.wt6-0.4);
  let lx=P.x-R.face*230*k,ly=P.y;for(let f=1;f>=0&&!freeAt(lx,ly);f-=.25){lx=P.x-R.face*230*k*f}
  ek.lx=lx;ek.ly=ly;ek.seat=seatWorld(P.x,P.y,R.face,time);if(R.auto){ek.noHero=true;ek.heroLock=false;ek.heroDone=true}else{try{P.vx=0;P.vy=0}catch(_){}}}
const S6=(s,wt6)=>s<0.2?s:s<0.2+wt6?0.2+(s-0.2)*0.4/wt6:s-(wt6-0.4);
function seatWorld(rx,ry,face,t){if(R&&R.kn&&KN)return KN.seat(rx,ry,face,t);const k=rk(),p=idleP(t),a=rScreen(0,0,p,'torso',196,150);return {x:rx+face*k*a[0],y:ry+GD+k*a[1]}}
/* ---- Steam Sweep aim: live mouse on PC; on touch the finger drag from the skill button (aim stick) or, without a drag, the facing ---- */
const SWT=RB.swt={seen:false,pid:null,cx:0,cy:0,ang:null,drag:false};
const touchMode=()=>{try{return SWT.seen||!!(window.TOUCH&&TOUCH.on)||document.body.classList.contains('mobile')}catch(_){return SWT.seen}};
function sweepAng(S){if(S.auto)return S.ang;if(SWFIX&&S.ang!=null)return S.ang;
  if(touchMode()){if(SWT.ang!=null)return SWT.ang;return (R&&R.face<0)?Math.PI:0}
  try{const t=typeof aimPoint==='function'?aimPoint():null;if(t&&isFinite(t.x)){const dx=t.x-P.x,dy=t.y-P.y;if(Math.hypot(dx,dy)>8)return Math.atan2(dy,dx)}}catch(_){}
  return S.ang!=null?S.ang:((R&&R.face<0)?Math.PI:0)}
const localAng=(a,face)=>{let l=face>0?a:Math.PI-a;l=Math.atan2(Math.sin(l),Math.cos(l));return clampN(l,-1.05,1.05)};
addEventListener('pointerdown',e=>{try{if(e.pointerType==='mouse'||!R||R.ph!=='ride')return;const el=e.target&&e.target.closest&&e.target.closest('[data-hmk="rb_sweep"]');if(!el)return;
  const b=el.getBoundingClientRect();SWT.seen=true;SWT.pid=e.pointerId;SWT.cx=b.x+b.width/2;SWT.cy=b.y+b.height/2;SWT.drag=false;SWT.ang=null}catch(er){ERR('swt down',er)}},true);
addEventListener('pointermove',e=>{try{if(SWT.pid==null||e.pointerId!==SWT.pid)return;const dx=e.clientX-SWT.cx,dy=e.clientY-SWT.cy;if(Math.hypot(dx,dy)>14){SWT.drag=true;SWT.ang=Math.atan2(dy,dx)}}catch(er){ERR('swt move',er)}},true);
const swUp=e=>{if(SWT.pid!=null&&e.pointerId===SWT.pid){SWT.pid=null;SWT.drag=false}};
addEventListener('pointerup',swUp,true);addEventListener('pointercancel',swUp,true);
/* ---- robot skills ---- */
function useSkill(id){if(!R||R.ph!=='ride'||R.sub||!playing())return false;const lv=R.lv,k=rk();if(R.kn&&KN)return KN.use(id);
  if(id==='jump'){if((P.cds[IDS.jump]||0)>0){toast('คูลดาวน์ '+Math.ceil(P.cds[IDS.jump])+' วิ');return false}
    let t=null;try{t=typeof aimPoint==='function'?aimPoint(C.JUMP_RANGE):null}catch(_){}if(!t||!isFinite(t.x))t={x:P.x+R.face*280,y:P.y};
    let dx=t.x-P.x,dy=t.y-P.y,d=Math.hypot(dx,dy)||1;if(d>C.JUMP_RANGE){dx*=C.JUMP_RANGE/d;dy*=C.JUMP_RANGE/d}
    let tx=P.x+dx,ty=P.y+dy;for(let f=1;f>=0&&!freeAt(tx,ty);f-=.1){tx=P.x+dx*f;ty=P.y+dy*f}
    if(Math.hypot(tx-P.x,ty-P.y)<30){toast('กระโดดไม่ได้ (ติดสิ่งกีดขวาง)');return false}
    R.face=(tx-P.x)>=0?1:-1;P.face=R.face>0?0:Math.PI;P.cds[IDS.jump]=C.JUMP_CD;
    R.sub={k:'jump',t0:time,x0:P.x,y0:P.y,tx,ty,hit:false};return true}
  if(id==='sweep'){if((P.cds[IDS.sweep]||0)>0){toast('คูลดาวน์ '+Math.ceil(P.cds[IDS.sweep])+' วิ');return false}
    P.cds[IDS.sweep]=C.SW_CD;if(!SWT.drag)SWT.ang=null;
    R.sub={k:'sweep',t0:time,x0:P.x,y0:P.y,n:0,lastS:-1,ang:null};R.sub.ang=sweepAng(R.sub);R.sub.cur=R.sub.ang;if(Math.abs(Math.cos(R.sub.ang))>.2){R.face=Math.cos(R.sub.ang)>0?1:-1;P.face=R.face>0?0:Math.PI}return true}
  if(id==='eject'){beginEject('skill');return true}
  return false}
RB.useSkill=useSkill;
/* ---- per-frame ---- */
function conePoint(e,x0,y0,ang){const k=rk(),cs=Math.cos(ang),sn=Math.sin(ang),ex=(e.x-x0)/k,ey=(e.y-y0)/k,dd=ex*cs+ey*sn,dy=-ex*sn+ey*cs,x1=X1D();if(dd<70||dd>x1+(e.sz||16)*.4/k)return false;return Math.abs(dy)<=18+Math.min(1,(dd-70)/(x1-70))*88+(e.sz||16)*.4/k}
function tick(dt){try{koTick();if(!R)return;
  if(P.dead||(!held()&&!R.auto&&R.ph!=='stand')||G.state!=='play'){finish();return}
  const k=rk(),el=time-R.t0;
  if(R.ph==='stand'){standTick(dt,k);return}if(R.ph==='throw'){P.vx=0;P.vy=0;if(el>=T6){R.ph='assemble';R.t0=time}return}
  if(R.ph==='assemble'){P.vx=0;P.vy=0;if(time-R.t0>=TAS){if(AUTOF){R.ph='stand';R.t0=time;R.rt0=time;R.dur=R.kn?KC.DUR:durOf(R.lv);R.ax=R.bx;R.ay=R.by}else{R.ph='mount';R.t0=time;R.mount=true}}return}
  if(R.ph==='mount'){P.vx=0;P.vy=0;if(time-R.t0>=T7)beginRide();return}
  if(R.ph==='ride'){
    /* hero takes no damage: the HP the hero had at the mount is restored every frame */
    if(R.auto&&!R._in){R._in=true;const _t=swapIn();try{autoPre(dt,k);if(R)tick(dt)}finally{swapOut(_t);if(R)R._in=false}return}if(!R.auto)try{if(P.hp<R.hp0)P.hp=Math.min(P.maxHp,R.hp0)}catch(_){}
    if(!R.sub){const mv=Math.hypot(P.x-R.lastX,P.y-R.lastY)/Math.max(dt,1e-3);R.moving=mv>25;if(R.moving){R.wt+=dt*mv/(150*k)}else R.wt=0;try{const cf=Math.cos(P.face||0);if(Math.abs(cf)>.2)R.face=cf>0?1:-1}catch(_){}R.lastX=P.x;R.lastY=P.y;
      if(R.hpR<=0){beginEject('hp0');return}
      if(time-R.rt0>=R.dur){beginEject('timeout');return}}
    if(R.kn&&KN&&R.sub){KN.ride(dt,k);return}const S=R.sub;if(S){const s=time-S.t0;
      if(S.k==='jump'){const up=seg(s,0.38,0.82);if(s>=0.38){P.x=S.x0+(S.tx-S.x0)*E(up);P.y=S.y0+(S.ty-S.y0)*E(up)}
        if(!S.hit&&s>=0.82){S.hit=true;P.x=S.tx;P.y=S.ty;const pct=C.JUMP*curve(R.lv),Rr=C.R_JUMP;try{G.shake=Math.max(G.shake||0,10)}catch(_){}
          for(const e of enemies){if(e.dead||!(e.hp>0))continue;const dx=e.x-S.tx,dy=e.y-S.ty,d=Math.hypot(dx,dy);if(d>Rr+(e.sz||16)*.6)continue;hitPct(e,pct,'jump');const u=d>1?1/d:0;push(e,(d>1?dx*u:R.face)*C.JUMP_KB,(d>1?dy*u:0)*C.JUMP_KB,.5)}}
        if(s>=1.4){R.sub=null;R.lastX=P.x;R.lastY=P.y}}
      else if(S.k==='sweep'){if(!SWMOVE){P.x=S.x0;P.y=S.y0;P.vx=0;P.vy=0}else{const mv=Math.hypot(P.x-R.lastX,P.y-R.lastY)/Math.max(dt,1e-3);R.moving=mv>25;if(R.moving)R.wt+=dt*mv/(150*k);else R.wt=0;R.lastX=P.x;R.lastY=P.y}const ox=SWMOVE?P.x:S.x0,oy=SWMOVE?P.y:S.y0;const ang=sweepAng(S);S.cur=ang;if(Math.abs(Math.cos(ang))>.2)R.face=Math.cos(ang)>0?1:-1;const per=C.SWEEP*curve(R.lv)/20;
        while(S.n<20&&s>=0.4+S.n*1.4/19){const mons=[];for(const e of enemies){if(e.dead||!(e.hp>0))continue;if(conePoint(e,ox,oy,ang))mons.push(e)}
          for(const e of mons){hitPct(e,per,'sw'+S.n);slow(e);if(!isBoss(e)){const nx=e.x+Math.cos(ang)*C.PUSH*k/20,ny=e.y+Math.sin(ang)*C.PUSH*k/20;if(freeAt(nx,ny)){e.x=nx;e.y=ny}}}S.n++}
        if(s>=2.2){R.sub=null;SWT.ang=null;R.lastX=P.x;R.lastY=P.y}}}
    return}
  if(R.ph==='eject'){if(R.kn&&KN){KN.eject(dt,k);return}const ek=R.ek,s=time-ek.t0;if(!ek.noHero){P.vx=0;P.vy=0}
    if(!ek.heroDone&&s>=1.05){ek.heroDone=true;ek.heroLock=false;if(freeAt(ek.lx,ek.ly)){P.x=ek.lx;P.y=ek.ly}else{P.x=ek.rx;P.y=ek.ry}}
    else if(ek.heroLock){P.x=ek.rx;P.y=ek.ry}
    const s6=S6(s,ek.wt6);
    if(!ek.boomed&&ek.kind!=='timeout'&&s6>=1.0){ek.boomed=true;const mul=(ek.kind==='hp0'?C.HP0_BOOM:1)*(R.lv>=10?C.B10:1),pct=C.EJECT*curve(R.lv)*mul,Rr=C.R_BOOM;try{G.shake=Math.max(G.shake||0,16)}catch(_){}
      for(const e of enemies){if(e.dead||!(e.hp>0))continue;const dx=e.x-ek.tx,dy=e.y-ek.ty,d=Math.hypot(dx,dy);if(d>Rr+(e.sz||16)*.6)continue;hitPct(e,pct,'boom');const u=d>1?1/d:0,out=(Rr-Math.min(d,Rr)+70*k);push(e,(d>1?dx*u:1)*out,(d>1?dy*u:0)*out,.55)}}
    if(s>=ek.dur)finish();return}
}catch(e){ERR('tick',e)}}
/* ======================== hooks ======================== */
try{const _p=updPlayer;updPlayer=function(dt){if(!R||!lockPos())return _p.apply(this,arguments);const x=P.x,y=P.y;try{return _p.apply(this,arguments)}finally{P.x=x;P.y=y}}}catch(e){ERR('hook updPlayer',e)}
try{const _u=update;update=function(dt){const r0=_u.apply(this,arguments);tick(dt);return r0}}catch(e){ERR('hook update',e)}
try{const _b=basicAttack;basicAttack=function(){if(R&&!R.auto&&R.ph!=='stand'){if(R.ph==='ride'&&!R.sub){if(R.kn&&KN)KN.punch();else robotPunchClick()}return}return _b.apply(this,arguments)}}catch(e){ERR('hook basic',e)}
const castW=o=>function(id){if(R&&!R.auto&&R.ph!=='stand')return false;return o.apply(this,arguments)};
try{castSkill=castW(castSkill)}catch(e){ERR('hook castSkill',e)}try{castSkillNow=castW(castSkillNow)}catch(e){ERR('hook castSkillNow',e)}
try{const _h=hurtPlayer;hurtPlayer=function(raw,src){if(!R||(R.ph==='stand'&&!(RHIT&&R._sg&&R.hpR>0))||(R.auto&&(!R._ag||R.ph==='eject')))return _h.apply(this,arguments);
  if(R.ph==='ride'||(R.ph==='stand'&&R._sg)){const hp0=P.hp;let r0;P.hp=1e9;try{r0=_h.call(this,raw,src)}finally{const lost=1e9-P.hp;P.hp=hp0;if(lost>0)R.hpR-=lost}return r0}
  return}}catch(e){ERR('hook hurt',e)}
/* hero drawing: hidden while seated in the robot, special poses (throw / mount jump / eject flip) otherwise */
let inDraw=false,riderDraw=false;
function hookPuppet(){const U=window.PUPPET;if(!U||U._rbHook||typeof U.draw!=='function')return;U._rbHook=1;const _d=U.draw;
  U.draw=function(c,x,y,sc,fac,pose){if(!inDraw&&!riderDraw)RB.sc=sc;
    if(inDraw||riderDraw||!R)return _d.apply(this,arguments);
    const k=rk(),face=R.face,hm=window.HAMMER;let hx=x,hy=y,pz=null;
    try{if(R.ph==='throw'){pz=window.wrPose(6,clampN((time-R.t0)/T6,0,1))}
      else if(R.ph==='mount'){const e=time-R.t0,q=clampN(e/T7,0,1),u=seg(e,0.2,0.5);if(u>=1)return;const seat=seatWorld(R.bx,R.by,face,time);pz=window.wrPose(7,q);hx=x+(seat.x-x)*E(u);hy=y+(seat.y-y)*E(u)-140*k*Math.sin(Math.PI*u)}
      else if(R.ph==='ride'&&!R.auto)return;
      else if(R.ph==='eject'){const ek=R.ek,s=time-ek.t0-(ek.hoff||0);if(ek.noHero)return _d.apply(this,arguments);if(s<0.12||ek.heroDone)return ek.heroDone?_d.apply(this,arguments):undefined;
        const seat=ek.seat,u=clampN((s-0.12)/0.6,0,1);let h=s<0.72?((ek.ry+GD)-seat.y)*(1-u)+120*k*Math.sin(Math.PI*u):0;if(s>1.05)h=0;
        hx=seat.x+((ek.heroDone?ek.lx:ek.lx)-seat.x)*u;hy=(ek.ry+GD)-Math.max(0,h);hx=Math.min(hx,1e9);pz=window.wrPose(8,clampN(s/1.05,0,1))}}catch(e){ERR('hero',e);return _d.apply(this,arguments)}
    if(!pz)return _d.apply(this,arguments);
    const hmOn=hm&&hm.on;inDraw=true;if(hm)hm.on=false;
    try{return _d.call(this,c,hx,hy,sc,face>0?1:-1,pz)}finally{inDraw=false;if(hm)hm.on=hmOn}}}
setInterval(()=>{try{hookPuppet()}catch(e){ERR('hookPuppet',e)}},300);
/* ---- ground pass: blueprint, danger rings, cone, rune ring (before the characters). The hit areas are Balance WORLD px (jump r160, cone 240, boom r220): rings / cone / explosion are drawn at that size. ---- */
function frame(wx,wy,sx,scl){cx=ctx;ctx.save();ctx.translate(wx,wy+GD);const k=scl||rk();ctx.scale((sx||1)*k,k)}
const X1D=()=>((R&&R.kn)?KC.GAT_CONE:C.CONE)/rk();       /* far end of the cone in demo units of the robot frame */
function blueprint(t,s){const gl=Math.max(0,1-Math.max(0,s-1.2)/0.4);cx.save();cx.translate(0,4);cx.scale(1,0.36);cx.globalAlpha=gl;cx.fillStyle='#24456e';cx.strokeStyle='#0f2240';cx.lineWidth=4;cx.beginPath();cx.roundRect(-110,-80,220,160,8);cx.fill();cx.stroke();cx.strokeStyle='rgba(200,230,255,.9)';cx.lineWidth=3;cx.beginPath();cx.arc(0,-10,40,0,6.28);cx.stroke();cx.strokeRect(-80,-60,40,50);cx.strokeRect(40,10,40,50);cx.globalCompositeOperation='lighter';cx.fillStyle='rgba(120,190,255,'+(0.4*(0.6+0.4*Math.sin(t*20)))+')';cx.beginPath();cx.ellipse(0,0,170,130,0,0,6.28);cx.fill();cx.restore()}
function jumpRing(s){const a4=s<0.82?1:Math.max(0,1-(s-0.82)/0.43),pl4=0.5+0.5*Math.sin(s*14);cx.save();cx.globalAlpha=a4;cx.fillStyle='rgba(255,70,20,'+(0.22+0.12*pl4)+')';cx.beginPath();cx.ellipse(0,4,150,48,0,0,6.283);cx.fill();cx.strokeStyle='rgba(90,30,10,.8)';cx.lineWidth=7;cx.stroke();cx.strokeStyle='rgba(255,250,235,1)';cx.lineWidth=3.5;cx.setLineDash([12,8]);cx.stroke();cx.setLineDash([]);cx.strokeStyle='rgba(255,240,180,.9)';cx.lineWidth=2;cx.beginPath();cx.moveTo(-14,4);cx.lineTo(14,4);cx.moveTo(0,-1);cx.lineTo(0,9);cx.stroke();cx.restore()}
function coneDraw(s){const HY=0,x0=70,x1=X1D(),al5=s<0?0.5:Math.min(1,0.5+s),pul=(s>0.3&&s<1.9)?0.25*Math.sin(s*12):0;cx.save();cx.globalAlpha=al5;cx.fillStyle='rgba(90,170,255,'+(0.3+0.08*pul)+')';cx.strokeStyle='rgba(235,248,255,1)';cx.lineWidth=4;cx.setLineDash([10,8]);
  cx.beginPath();cx.moveTo(x0,HY-14);cx.lineTo(x1,HY-100);cx.quadraticCurveTo(x1+70,HY+4,x1,HY+108);cx.lineTo(x0,HY+22);cx.closePath();cx.fill();cx.stroke();cx.restore()}
function boomRing(s6){const HY=0,u6=seg(s6,0.6,1.0),g6=E(seg(s6,0.6,0.74)),BR6=C.R_BOOM,rr6=BR6*(0.35+0.65*g6),pl=0.5+0.5*Math.sin(s6*(10+40*u6)),a6=(0.7+0.3*u6)*Math.min(1,(s6-0.6)/0.06)*(s6<1.0?1:1-(s6-1.0)/0.4);
  cx.save();cx.globalAlpha=a6;cx.fillStyle='rgba(255,60,30,'+(0.12+0.18*pl*u6)+')';cx.beginPath();cx.ellipse(0,HY+4,rr6,rr6*0.32,0,0,6.283);cx.fill();cx.restore();runeRing(0,HY+4,rr6,0.32,s6*(0.6+2*u6),a6,pl)}
const JS_=()=>C.R_JUMP/150;       /* jump FX scale: the 150-unit motion ring becomes the 160 px hit radius */
try{const _g=drawRaidTele;drawRaidTele=function(){const r0=_g.apply(this,arguments);try{PEND=null;bodyDrawn=false;inEnts=false;const _sw=(R&&R.auto&&R.ph==='ride')?swapIn():null;try{if(R){const t0=performance.now();PEND=makeBody();
    if(R.ph==='throw'){const el=time-R.t0;if(el>=0.18/0.7*T6){frame(R.bx,R.by,R.face);blueprint(time,-0.4);ctx.restore()}}
    else if(R.ph==='assemble'){const s=time-R.t0-LEAD;frame(R.bx,R.by,R.face);blueprint(time,s);ctx.restore()}
    else if(R.kn&&KN&&(R.ph==='ride'&&R.sub||R.ph==='eject')){KN.ground()}else if(R.ph==='ride'&&R.sub){const S=R.sub,s=time-S.t0;
      if(S.k==='jump'&&s<1.25){frame(S.tx,S.ty,1,rk()*0+JS_());jumpRing(s);ctx.restore()}
      if(S.k==='sweep'&&s<2.1){frame(SWMOVE?P.x:S.x0,SWMOVE?P.y:S.y0,1);ctx.rotate(S.cur!=null?S.cur:0);coneDraw(s);ctx.restore()}}
    else if(R.ph==='eject'){const ek=R.ek,s6=S6(time-ek.t0,ek.wt6);if(ek.kind!=='timeout'&&s6>=0.6&&s6<1.4){frame(ek.tx,ek.ty,1,1);boomRing(s6);ctx.restore()}}
    RB.fxMs+=performance.now()-t0}}finally{swapOut(_sw)}}catch(e){ERR('ground',e)}return r0}}catch(e){ERR('hook ground',e)}
/* ---- depth sorting: the robot body is drawn inside the game's own y-sorted entity loop (just before the first entity that is nearer the camera than the robot's feet) ---- */
let PEND=null,bodyDrawn=false,inEnts=false;const DK0=depthKey,BB0=bb;
try{depthKey=function(e){inEnts=true;return DK0.apply(this,arguments)}}catch(e){ERR('hook depthKey',e)}
try{bb=function(x,y,fn){if(inEnts&&PEND&&!bodyDrawn){let kr=0,ke=0;try{kr=DK0(PEND);ke=DK0({x,y})}catch(_){kr=PEND.y;ke=y}if(ke>=kr){bodyDrawn=true;try{BB0(PEND.x,PEND.y,PEND.fn)}catch(er){ERR('body',er)}}}return BB0.apply(this,arguments)}}catch(e){ERR('hook bb',e)}
/* ---- the robot itself (rider seated in the cockpit), steam, HP bar ---- */
function riderFn(m){try{const U=window.PUPPET,hp=R&&R.ph==='mount'?window.wrPose(7,clampN((time-R.t0)/T7,0,1)):riderPose(),hm=window.HAMMER,hmOn=hm&&hm.on;if(!hp)return;
    cx.setTransform(m);const sw=U.cfg.showSword;U.cfg.showSword=false;riderDraw=true;if(hm)hm.on=false;try{window.drawCombo(cx,0,0,0.85*SCD/RS,-1,hp)}finally{riderDraw=false;if(hm)hm.on=hmOn;U.cfg.showSword=sw}}catch(er){ERR('rider',er)}}
function bodyDraw(st,wantRider){const bob=st.bob||0;st.air=(st.air||0)-bob;const p={gy:st.gy,rot:st.rot,air:st.air,off:st.off,flash:st.flash,flashCol:st.flashCol,swell:st.swell,rider:wantRider?riderFn:null};
  const shs=st.air?Math.max(0.4,1-st.air/300):1;cx.fillStyle='rgba(0,0,0,.25)';cx.beginPath();cx.ellipse(st.x||0,4,90*shs,18*shs,0,0,6.3);cx.fill();
  rDraw(st.x||0,0,p);st.air+=bob;return p}
function stackSmoke(st,p,t){const q=rScreen(st.x||0,0,p,'stack',70,6);for(let i=0;i<3;i++)puff(q[0],q[1],t*0.9+i/3,i*3)}
function hpBar(){const w=120,h=9,y=-232;cx.save();cx.fillStyle='rgba(0,0,0,.6)';cx.fillRect(-w/2-2,y-2,w+4,h+4);cx.fillStyle='#3b0d0d';cx.fillRect(-w/2,y,w,h);const f=clampN(R.hpR/R.hpMax,0,1);cx.fillStyle=f>.5?'#6fd06a':f>.25?'#e0b83a':'#e0463a';cx.fillRect(-w/2,y,w*f,h);
  if(R.ph==='ride'||R.ph==='stand'){const tf=clampN(1-(time-R.rt0)/R.dur,0,1);cx.fillStyle='rgba(0,0,0,.6)';cx.fillRect(-w/2-2,y+12,w+4,6);cx.fillStyle='#7fc8ff';cx.fillRect(-w/2,y+13,w*tf,4)}cx.restore()}
function makeBody(){if(R&&R.auto&&R.ph==='ride'){const _s=swapIn();let b;try{b=makeBody0()}finally{swapOut(_s)}if(!b)return b;const f=b.fn;return {x:b.x,y:b.y,fn(){const _s2=swapIn();try{f()}finally{swapOut(_s2)}}}}return makeBody0()}function makeBody0(){if(!window.RB_SRC||!R)return null;if(R.kn&&KN)return KN.body();const t=time;
  if(R.ph==='stand')return {x:R.bx,y:R.by,fn(){frame(R.bx,R.by,R.face);try{const st=idleP(t),p=bodyDraw(st,false);stackSmoke(st,p,t);hpBar()}finally{ctx.restore()}}};if(R.ph==='assemble'){const s=t-R.t0-LEAD;if(s<0)return null;
    return {x:R.bx,y:R.by,fn(){frame(R.bx,R.by,R.face);try{const st=assembleP(s);bodyDraw(st,false);
        ['loose_gear','loose_piston','loose_plate','loose_nut','loose_pipe','loose_gauge'].forEach(function(k,i){const u=seg(s,0.2+i*0.12,0.55+i*0.12);if(u<=0||u>=1)return;const im=RI[k];if(!ok(im))return;const sx=RX0+(rnd(i*9)-0.5)*700,sy=-400-rnd(i)*100,ex=RX0,ey=-150,x=lerp(sx,ex,E(u)),y=lerp(sy,ey,E(u));cx.save();cx.globalAlpha=Math.min(1,(1-u)*3);cx.translate(x,y);cx.rotate(u*12);cx.scale(0.3,0.3);cx.drawImage(im,-im.width/2,-im.height/2);cx.restore()});
        [0.10,0.26,0.42,0.62,0.80,0.92,1.10].forEach(function(ta,i){const e=s-ta;if(e<0||e>0.25)return;const k=e/0.25;cx.save();cx.globalCompositeOperation='lighter';cx.strokeStyle='rgba(150,210,255,'+(1-k)+')';cx.lineWidth=3;const cy=-[10,40,80,150,170,170,240][i];for(let j=0;j<6;j++){const a=j*1.05+i;cx.beginPath();cx.moveTo(RX0+Math.cos(a)*20,cy+Math.sin(a)*20);cx.lineTo(RX0+Math.cos(a)*(30+60*k)+(rnd(j+i)*10),cy+Math.sin(a)*(30+60*k));cx.stroke()}cx.restore()});
        if(s>1.1&&s<1.6){const k2=(s-1.1)/0.5;cx.save();cx.globalAlpha=1-k2;for(let j=0;j<6;j++)puff(RX0+(j-2.5)*35,-10,k2,0);cx.restore()}}finally{ctx.restore()}}}}
  if(R.ph==='mount')return {x:R.bx,y:R.by,fn(){const e=t-R.t0;frame(R.bx,R.by,R.face);try{const st=idleP(t),p=bodyDraw(st,e>=0.5);if(e>=0.5)stackSmoke(st,p,t)}finally{ctx.restore()}}};
  if(R.ph==='ride'){const S=R.sub;return {x:P.x,y:P.y,fn(){let st;
      if(!S){st=(R.pn&&t-R.pn.t0<(window.__RATK&&__RATK.on?__RATK.B.TOT:0.6))?(window.__RATK&&__RATK.on?punchNew(t-R.pn.t0):punchP(t-R.pn.t0)):R.moving?walkP(R.wt):idleP(t)}else if(S.k==='jump'){st=jumpP(t-S.t0)}else{st=sweepP(t-S.t0,localAng(S.cur!=null?S.cur:0,R.face));if(SWMOVE&&R.moving){const w=walkRot(R.wt),r=st.rot;r.thighN=w.thighN;r.shinN=w.shinN;r.thighF=w.thighF;r.shinF=w.shinF;r.footN=-(r.thighN+r.shinN+(r.torso||0));r.footF=-(r.thighF+r.shinF+(r.torso||0));st.gy=walkGy(R.wt,r)}}
      frame(P.x,P.y,R.face);try{const p=bodyDraw(st,!R.auto);stackSmoke(st,p,t);
        if(S&&S.k==='jump'){const s=t-S.t0;if(s>=0.3&&s<0.62){const kk=(s-0.3)/0.32;for(let j=0;j<5;j++)puff(RX0+(j-2)*30,-4,Math.min(0.99,kk+j*0.05),0)}}
        if(S&&S.k==='sweep'){const s=t-S.t0;if(s>=0.22&&s<0.7){const cp=rScreen(st.x,0,p,'foreF',40,100);puff(cp[0],-2,(s-0.22)/0.48,0);puff(cp[0]+18,-2,Math.min(0.99,(s-0.22)/0.48+0.2),0)}
          if(s>=0.3&&s<2.05){const on=Math.min(1,(s-0.3)/0.1)*Math.max(0,Math.min(1,(2.0-s)/0.15));JETX=X1D()-40;steamJet2({x:st.x,y:0,p:{rot:st.rot,air:0,gy:null,swell:1}},s,on)}}
        hpBar()}finally{ctx.restore()}}}}
  if(R.ph==='eject'){const ek=R.ek,s=t-ek.t0,s6=S6(s,ek.wt6),dash=E(seg(s6,0.2,0.6));if(!(s6>=0&&!(ek.kind==='timeout'&&s6>=1.9)))return null;
    const rx=ek.rx+(ek.tx-ek.rx)*(ek.kind==='skill'?dash:0),ry=ek.ry+(ek.ty-ek.ry)*(ek.kind==='skill'?dash:0);
    return {x:rx,y:ry,fn(){frame(rx,ry,ek.face);try{const st=ejectP(s6,ek.kind==='skill'&&ek.wd>0,ek.kind),p=bodyDraw(st,s<0.12);
        if(ek.kind!=='timeout'&&s6>=0.5&&s6<1.0)[['thighN',53,185],['thighF',53,185],['armN',42,150],['torso',40,214],['torso',400,120]].forEach(function(j,i){const pt=rScreen(0,0,p,j[0],j[1],j[2]);puff(pt[0],pt[1],(s6*2.2+i*0.23)%1,0)});
        if(ek.kind==='timeout'&&s6>=1.0&&s6<1.6)for(let j=0;j<5;j++)puff(RX0+(j-2)*35,-20,(s6-1.0)/0.6,0)}finally{ctx.restore()}}}}
  return null}
/* ---- front pass: leftovers (body not yet drawn this frame), landing / explosion FX ---- */
try{const _t=drawTexts;drawTexts=function(){const r0=_t.apply(this,arguments);try{const _sw=(R&&R.auto&&R.ph==='ride')?swapIn():null;try{if(R&&window.RB_SRC){const t0=performance.now(),t=time;
    if(PEND&&!bodyDrawn){bodyDrawn=true;try{BB0(PEND.x,PEND.y,PEND.fn)}catch(er){ERR('body2',er)}}
    if(R.ph==='ride'&&R.sub&&R.sub.k==='sweep'&&SWT.drag&&SWT.ang!=null){const a=SWT.ang,k=rk();ctx.save();ctx.translate(P.x,P.y+GD-6);ctx.rotate(a);ctx.strokeStyle='rgba(255,240,170,.95)';ctx.fillStyle='rgba(255,240,170,.95)';ctx.lineWidth=3;ctx.setLineDash([8,6]);ctx.beginPath();ctx.moveTo(28*k,0);ctx.lineTo(110*k,0);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(122*k,0);ctx.lineTo(104*k,-9);ctx.lineTo(104*k,9);ctx.closePath();ctx.fill();ctx.restore()}
    if(!R.kn&&R.ph==='ride'&&R.sub&&R.sub.k==='jump'){const S=R.sub,s=t-S.t0;if(s>=0.82&&s<2.2){frame(S.tx,S.ty,1,JS_());try{landFX(0,4,s-0.82)}finally{ctx.restore()}}}
    if(!R.kn&&R.ph==='eject'){const ek=R.ek,s6=S6(t-ek.t0,ek.wt6);if(ek.kind!=='timeout'&&s6>=1.0&&s6<2.4){frame(ek.tx,ek.ty,1,1);try{boomFX(0,4,s6-1.0)}finally{ctx.restore()}}}
    if(R.kn&&KN)KN.front();RB.fxMs+=performance.now()-t0;RB.fxN++}}finally{swapOut(_sw)}}catch(e){ERR('front',e);try{ctx.restore()}catch(_){}}return r0}}catch(e){ERR('hook front',e)}
/* ======================== r85: robot30 (Balance r1.4) + AUTO companion flow (DeaRz 14 Nov 11:22-11:27) ========================
   robot30: robot and Knight last 30 min (1800 s) at every level; ride attacks x0.65 (punch, jump, sweep/gatling, rockets, thunder; NOT the self-destruct / eject blasts); the 90 s cooldown starts when it ENDS (skill cooldown shows 1800+90 while it is out); no robot HP regen. ?robot30=off = old duration / damage / cooldown timing.
   AUTO flow (?robotauto=off = old instant ride): skill -> throw -> assemble -> the robot STANDS idle next to the hero (the hero is free) and two buttons appear: "AUTO" / "ขึ้นหุ่น".
     ขึ้นหุ่น = the hero climbs in (ride buttons 1-5, ride damage). AUTO = the robot fights on its own as a companion while the hero plays normally: it stays within 200 px of the hero, attacks the nearest monster INSIDE its attack range
     (punch reach, plus Steam Sweep / Gatling when off cooldown; base robot auto punch 60 %, Knight punch + Gatling), may step toward a target but never more than 200 px from the hero, never self-destructs until its HP is <= 10 % (then base = eject boom, Knight = all-out, aimed at the nearest monster).
     While in AUTO a "ขึ้นหุ่น" button boards; while riding an "AUTO" button lets the hero step out. Monsters can hurt the robot: PLACEHOLDER (BAL_TODO) = every aggro'd monster next to it deals its attack / 1.4 per second to the robot HP. The 30 min count runs in both modes. ---- */
let LASTCD=90;
/* ---- r103 robotatk: click attacks of the base robot (r31) and the Steam Knight (k33), Motion 16 Nov (passed by DeaRz). One hit per click, alternating variant A / B per click; the damage + effects now land at the HIT moment of the swing (base 0.22 s of 0.61 s, Knight 0.25 s of 0.66 s) instead of at the click; single target, no knockback; reach base 140 px (was 110), Knight 130; 0.06 s hit-stop + shake + flash + shock ring + debris (+ steam for the robot, crackle sparks for the Knight). Works in ride and AUTO (same punchArc / robotPunchAt / punchAuto paths). Damage % unchanged (placeholder 100 % stays with Balance's numbers). ?robotatk=old = old instant punch. Debug: window.__RATK ---- */
const RATK=window.__RATK={ver:'robotatk-r1',on:!/[?&]robotatk=old\b/.test(Q),n:0,pend:[],stopUntil:0,flash:function(){try{let d=document.getElementById('ratkFlash');if(!d){d=document.createElement('div');d.id='ratkFlash';d.style.cssText='position:fixed;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:9000';document.body.appendChild(d)}d.style.transition='none';d.style.opacity='.28';void d.offsetWidth;d.style.transition='opacity .16s ease-out';d.style.opacity='0'}catch(e){}},stats:{queued:0,hits:0,dropped:0,fx:0},err:null,
 B:{WIND:.17,HIT:.22,HOLD:.3,END:.55,HS:.06,SHK:10,LUNGE:14,TOT:.61,A:{w:{armN:35,foreN:75},s:{armN:-30,foreN:0}},B:{w:{armN:150,foreN:-30},s:{armN:0,foreN:-45}}},
 K:{WIND:.2,HIT:.25,HOLD:.33,END:.6,HS:.06,SHK:12,LUNGE:16,TOT:.66,A:{w:{armF:165,foreF:10,hammer:-130},s:{armF:30,foreF:-15,hammer:-120}},B:{w:{armF:-135,foreF:-20,hammer:-100},s:{armF:45,foreF:-45,hammer:-100}}},
 amt:function(e,C){if(e<0||e>=C.END+C.HS)return 0;if(e<C.WIND*.7)return -1.1*E(e/(C.WIND*.7));if(e<C.WIND)return -1.1+.1*E((e-C.WIND*.7)/(C.WIND*.3));if(e<C.HIT){const q=(e-C.WIND)/(C.HIT-C.WIND);return -1+2.15*q*q*q}if(e<C.HIT+C.HS)return 1.15;const e2=e-C.HS;if(e2<C.HOLD)return 1.15-.15*E((e2-C.HIT)/(C.HOLD-C.HIT));return 1-E((e2-C.HOLD)/(C.END-C.HOLD))},
 mkpn:function(){this.n++;return {t0:time,i:this.n}},
 cfg:function(){return (R&&R.kn)?this.K:this.B},
 hit:function(e,pct,tag,fn){if(!this.on){fn(e,pct,tag);return}const C=this.cfg();this.pend.push({t:time+C.HIT,e,pct,tag,fn,C});this.stats.queued++},
 run:function(){if(!this.pend.length)return;for(let i=this.pend.length-1;i>=0;i--){const p=this.pend[i];if(time<p.t)continue;this.pend.splice(i,1);const e=p.e;if(!e||e.dead||!(e.hp>0)||!R||R.ph!=='ride'){this.stats.dropped++;continue}
   try{p.fn(e,p.pct,p.tag);this.stats.hits++;this.fx(e,p.C)}catch(er){this.err=er.message}}},
 fx:function(e,C){this.stats.fx++;const x=e.x,y=e.y,kn=C===this.K;try{shake(C.SHK);if(window.__RATK&&__RATK.flash)__RATK.flash();ring(x,y+4,10,100,.35,kn?'#ffe08a':'#fff0c8',4);ring(x,y+4,6,60,.25,'#ffffff',2);
   for(let d=0;d<10;d++){const a=-.3-Math.random()*2.5,v=140+Math.random()*220;part({x:x+Math.cos(a)*10,y:y-10,vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,life:.55,max:.55,size:3+Math.random()*3,col:d%2?'#6b4a2a':'#c9a36a',type:'glow',grav:520})}
   if(kn){for(let d=0;d<6;d++){const a=Math.random()*6.283,v=120+Math.random()*160;part({x:x,y:y-18,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.3,max:.3,size:3,col:'#fff2a0',type:'glow'})}}
   else{for(let d=0;d<6;d++){part({x:x+(Math.random()-.5)*30,y:y-8,vx:(Math.random()-.5)*60+(R&&R.face||1)*50,vy:-30-Math.random()*50,life:.6,max:.6,size:7+Math.random()*6,col:'#e8f4ff',type:'glow',grow:20})}}
   this.stopUntil=performance.now()+C.HS*1000}catch(er){this.err=er.message}}};
try{const _ru=update;update=function(dt){let d=dt;try{if(RATK.on&&performance.now()<RATK.stopUntil)d=dt*.06}catch(_){}const r=_ru.call(this,d);try{if(RATK.on)RATK.run()}catch(er){RATK.err=er.message}return r}}catch(er){RATK.err='hook '+er.message}
function punchNew(s){const C=RATK.B,r=idleRot(s),i=Math.max(0,(R.pn&&R.pn.i||1)-1),V=i%2?C.B:C.A,a=RATK.amt(s,C),src=a<0?V.w:V.s,k=Math.abs(a)>1.15?1.15:Math.abs(a);let kk=k;if(a<0&&s>C.WIND*.7)kk+=.02*Math.sin(s*120);
  for(const p in src)r[p]=(r[p]||0)*(1-kk)+src[p]*kk;r.torso=a>0?11*a:6*a;r.armF=(r.armF||0)+12*a;return {gy:null,rot:r,air:0,off:null,flash:0,flashCol:'255,240,200',swell:1,bob:0,x:Math.min(1,Math.max(0,a))*C.LUNGE}}
const RPR=RATK.on?140:110;
const SW={d:0,x:0,y:0,f:0};
/* auto mode runs the robot with the ride code by temporarily moving the "player position" P.x/P.y onto the robot (re-entrant, restored right after) */
function swapIn(){if(!R||!R.auto)return null;if(SW.d++===0){SW.x=P.x;SW.y=P.y;SW.f=P.face;P.x=R.ax;P.y=R.ay;P.face=R.face>0?0:Math.PI}return SW}
function swapOut(t){if(!t)return;if(--SW.d===0){try{if(R){R.ax=P.x;R.ay=P.y}}catch(_){}P.x=SW.x;P.y=SW.y;P.face=SW.f}}
function punchP(s){const r=idleRot(s),pu=E(seg(s,0,0.15))*(1-E(seg(s,0.3,0.6)));r.armF=70*pu;r.foreF=-35*pu;r.torso=(r.torso||0)-5*pu;return {gy:null,rot:r,air:0,off:null,flash:0,flashCol:'255,240,200',swell:1,bob:r.bob,x:3*pu}}
const AGGRO=!/[?&]robotaggro=off\b/.test(Q),RHIT=!/[?&]robothit=off\b/.test(Q);
/* r86 (Balance r1.5, TEST proposal): ride punch = single target, 90-degree front arc, reach 110 px (robot) / 130 px (Knight), every 0.8 s, no stun, no knockback; AUTO punch = 60 % x A curve every 1.25 s on the nearest monster, same reach */
function robotPunchAt(e,pct,tag,cd){try{R.pn=(window.__RATK&&__RATK.on?__RATK.mkpn():{t0:time});P.cds[IDS.punch]=cd||1.25;__RATK.hit(e,pct,tag,function(a,b,c2){hitPct(a,b,c2)});try{G.shake=Math.max(G.shake||0,3)}catch(_){}}catch(er){ERR('rpunch',er)}}
function punchArc(pct,reach,tag,cd,ang){try{if(!R)return false;let best=null,bd=1e9;for(const e of enemies){if(e.dead||!(e.hp>0))continue;const dx=e.x-P.x,dy=e.y-P.y,d=Math.hypot(dx,dy);if(d>reach+(e.sz||16)*.6)continue;
      if(d>24){let da=Math.atan2(dy,dx)-ang;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)>Math.PI/4)continue}if(d<bd){bd=d;best=e}}
    RB.lastPunch={ang:+ang.toFixed(2),best:!!best,bd:Math.round(bd),n:enemies.length,t:+time.toFixed(2)};P.cds[IDS.punch]=cd;R.pn=(window.__RATK&&__RATK.on?__RATK.mkpn():{t0:time});if(best){__RATK.hit(best,pct,tag,function(a,b,c2){hitPct(a,b,c2)});try{G.shake=Math.max(G.shake||0,3)}catch(_){}}return !!best}catch(e){ERR('punchArc',e);return false}}
function robotPunchClick(){try{if(!R||R.ph!=='ride'||R.sub||!playing())return;if((P.cds[IDS.punch]||0)>0)return;const ang=aimAng();if(Math.abs(Math.cos(ang))>.2){R.face=Math.cos(ang)>0?1:-1;P.face=R.face>0?0:Math.PI}punchArc(130*curve(R.lv),RPR,'rpn',0.8,ang)}catch(e){ERR('rpclick',e)}}
function robotPunchClick_old(){try{const k=rk();
    const ax=P.x+R.face*55*k;let best=null,bd=1e9;for(const e of enemies){if(e.dead||!(e.hp>0))continue;const d=Math.hypot(e.x-ax,e.y-P.y);if(d<RPR*k+(e.sz||16)*.6&&d<bd){bd=d;best=e}}
    P.cds[IDS.punch]=0.8;R.pn={t0:time};if(best)hitPct(best,100,'pn')}catch(e){ERR('rpclick',e)}}
/* PLACEHOLDER (BAL_TODO): monsters next to the robot hurt it (the game's monsters only target the hero) */
function robotHurtAt(x,y,dt){try{if(AGGRO||!R||R.hpR<=0)return;let lost=0;for(const e of enemies){if(e.dead||!(e.hp>0)||!e.aggro)continue;if(Math.hypot(e.x-x,e.y-y)<(e.sz||16)*.6+70)lost+=(e.atk||10)*dt/1.4}R.hpR-=lost}catch(_){}}
function ejectAt(kind){R.auto=true;R.ax=R.bx;R.ay=R.by;R.ph='ride';R.sub=null;const s=swapIn();try{beginEject(kind)}finally{swapOut(s)}}
function standTick(dt,k){robotHurtAt(R.bx,R.by,dt);if(R.hpR<=0){ejectAt('hp0');return}if(time-R.rt0>=R.dur){ejectAt('timeout');return}}
function stepTo(tx,ty,dt,k){const dx=tx-P.x,dy=ty-P.y,d=Math.hypot(dx,dy);if(d<4)return false;const sp=150*k*dt,nx=P.x+dx/d*Math.min(sp,d),ny=P.y+dy/d*Math.min(sp,d);if(freeAt(nx,ny)){P.x=nx;P.y=ny;if(Math.abs(dx)>6)R.face=dx>0?1:-1;return true}return false}
function autoPre(dt,k){try{const hx=SW.x,hy=SW.y;robotHurtAt(P.x,P.y,dt);
  if(R.ph!=='ride')return;
  if(R.hpR<=R.hpMax*0.1&&!R.sub){beginEject('skill');return}      /* auto self-destruct only at <= 10 % HP */
  if(R.sub)return;
  const LIM=200,kn=!!R.kn,sweepReady=(P.cds[IDS.sweep]||0)<=0,coneR=kn?KC.GAT_CONE:C.CONE,pr=kn?KC.PUNCH_R:RPR;
  let tgt=null,bd=1e9;for(const e of enemies){if(e.dead||!(e.hp>0))continue;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<bd){bd=d;tgt=e}};try{const AS_=window.__AUTOSTICK;if(AS_&&AS_.on&&AS_.pickRobot){tgt=AS_.pickRobot(tgt);bd=tgt?Math.hypot(tgt.x-P.x,tgt.y-P.y):1e9}}catch(_){}
  let acted=false;
  if(tgt){const d=bd,dx=tgt.x-P.x;if(Math.abs(dx)>8)R.face=dx>0?1:-1;P.face=R.face>0?0:Math.PI;
    if(sweepReady&&d<=coneR*0.92){const A=Math.atan2(tgt.y-P.y,tgt.x-P.x);P.cds[IDS.sweep]=kn?KC.GAT_CD:C.SW_CD;R.sub={k:'sweep',t0:time,x0:P.x,y0:P.y,n:0,ang:A,cur:A,auto:1,ou:[P.x/k,P.y/k]};return}
    if(d<=pr+(tgt.sz||16)*.6&&(P.cds[IDS.punch]||0)<=0){robotPunchAt(tgt,60*curve(R.lv),'apn',1.25);return}
    const reach=(sweepReady?coneR:pr)+40;
    if(d<=reach){const ox=P.x,oy=P.y;if(stepTo(tgt.x,tgt.y,dt,k)){if(Math.hypot(P.x-hx,P.y-hy)>LIM){P.x=ox;P.y=oy}else acted=true}}}
  if(!acted){const dH=Math.hypot(P.x-hx,P.y-hy);if(dH>LIM-50)stepTo(hx,hy,dt,k)}
  P.face=R.face>0?0:Math.PI}catch(e){ERR('autoPre',e)}}
/* the two buttons: AUTO / ขึ้นหุ่น */
let AUI=null;
function auiMake(){if(AUI||!document.body)return;AUI=document.createElement('div');AUI.id='rbChoice';AUI.hidden=true;AUI.style.cssText='position:fixed;left:50%;bottom:152px;transform:translateX(-50%);z-index:9100;display:flex;gap:10px;font-family:system-ui,sans-serif';
  AUI.innerHTML='<button type="button" data-a="auto">AUTO</button><button type="button" data-a="board">ขึ้นหุ่น</button>';
  const st=document.createElement('style');st.textContent='#rbChoice button{min-height:44px;min-width:92px;padding:0 16px;border-radius:12px;border:2px solid #ffd98a;background:linear-gradient(#a8741e,#5e3c0c);color:#fff4cf;font:800 16px system-ui,sans-serif;cursor:pointer;touch-action:manipulation;box-shadow:0 2px 8px rgba(0,0,0,.55)}#rbChoice button.on{background:linear-gradient(#3f8a5a,#215238);border-color:#9be8b4}#rbChoice button[hidden]{display:none}';document.head.appendChild(st);
  for(const ev of ['pointerdown','pointerup','mousedown','touchstart'])AUI.addEventListener(ev,e=>e.stopPropagation());
  AUI.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button[data-a]');if(!b)return;e.stopPropagation();auiClick(b.dataset.a)});document.body.appendChild(AUI)}
function auiClick(a){try{if(!R)return;
  if(a==='auto'){if(R.ph==='stand'){R.auto=true;R.ph='ride';R.ax=R.bx;R.ay=R.by;R.sub=null;R.moving=false;R.wt=0;R.lastX=R.ax;R.lastY=R.ay;R.rt0=R.rt0||time;R.dur=R.kn?KC.DUR:durOf(R.lv)}
    else if(R.ph==='ride'&&!R.auto&&!R.sub){const k=rk(),f=R.face;R.auto=true;R.ax=P.x;R.ay=P.y;const nx=P.x-f*90*k,ny=P.y;if(freeAt(nx,ny)){P.x=nx;P.y=ny}R.moving=false;R.wt=0;R.lastX=R.ax;R.lastY=R.ay;try{P.vx=0;P.vy=0}catch(_){}try{buildBar()}catch(_){}}}
  else if(a==='board'){if(R.ph==='stand'){R.ph='mount';R.t0=time;R.mount=true}
    else if(R.auto&&R.ph==='ride'){R.sub=null;R.auto=false;R.bx=R.ax;R.by=R.ay;R.ph='mount';R.t0=time;R.mount=true}}}catch(e){ERR('aui',e)}}
setInterval(()=>{try{if(!AUTOF)return;auiMake();if(!AUI)return;const show=!!(R&&(R.ph==='stand'||(R.ph==='ride'&&(R.auto||!R.sub)))&&G.state==='play');if(AUI.hidden!==!show)AUI.hidden=!show;if(!show)return;
  const bA=AUI.querySelector('[data-a=auto]'),bB=AUI.querySelector('[data-a=board]'),inStand=R.ph==='stand',au=!!R.auto;
  const hideA=au,hideB=!inStand&&!au;if(bA.hidden!==hideA)bA.hidden=hideA;if(bB.hidden!==hideB)bB.hidden=hideB;bA.classList.toggle('on',false)}catch(e){ERR('aui tick',e)}},200);
/* r86 aggro switch (Balance r1.5): in AUTO a monster the robot hit within 3 s and that stands within 120 px of it attacks the ROBOT instead of the hero (max 4, nearest first, bosses never). The game's own monster update runs for those monsters with the player position moved onto the robot
   (normal attack interval, normal hit formula, hero DEF = robot DEF); their hits are diverted to the robot HP in the hurtPlayer hook. Ranged projectiles still fly at the hero (not switched). ?robotaggro=off = the r85 placeholder (aggro'd monsters next to the robot drain its HP). */
try{const _ue=updEnemies;updEnemies=function(dt){
  if(RHIT&&R&&R.ph==='stand'&&!R._in&&!R._sg&&R.hpR>0){const rx=R.bx,ry=R.by,cand=[];for(const e of enemies){if(e.dead||!(e.hp>0)||isBoss(e))continue;const dr=Math.hypot(e.x-rx,e.y-ry);if(dr>120)continue;if(dr>=Math.hypot(e.x-P.x,e.y-P.y))continue;cand.push([dr,e])}if(cand.length){cand.sort((a,b)=>a[0]-b[0]);const QS=new Set(cand.slice(0,4).map(c=>c[1]));RB.aggroN=QS.size;const n1=[],q1=[];for(const e of enemies)(QS.has(e)?q1:n1).push(e);enemies.length=0;for(const e of n1)enemies.push(e);const r=_ue.apply(this,arguments);const n2=enemies.slice();enemies.length=0;for(const e of q1){e.aggro=true;enemies.push(e)}const sx=P.x,sy=P.y,sf=P.face;P.x=rx;P.y=ry;R._sg=true;try{_ue.call(this,dt)}finally{R._sg=false;P.x=sx;P.y=sy;P.face=sf}const q2=enemies.slice();enemies.length=0;for(const e of n2)enemies.push(e);for(const e of q2)enemies.push(e);return r}}if(!AGGRO||!R||!R.auto||R.ph!=='ride'||R._in)return _ue.apply(this,arguments);
  const cand=[];for(const e of enemies){if(e.dead||!(e.hp>0)||isBoss(e))continue;if(time-(e._rbHit||-99)>3)continue;const d=Math.hypot(e.x-R.ax,e.y-R.ay);if(d<=120)cand.push([d,e])}
  if(!cand.length)return _ue.apply(this,arguments);
  cand.sort((a,b)=>a[0]-b[0]);const QS=new Set(cand.slice(0,4).map(c=>c[1]));RB.aggroN=QS.size;
  const n1=[],q1=[];for(const e of enemies)(QS.has(e)?q1:n1).push(e);
  enemies.length=0;for(const e of n1)enemies.push(e);const r=_ue.apply(this,arguments);const n2=enemies.slice();
  enemies.length=0;for(const e of q1){e.aggro=true;enemies.push(e)}
  const t=swapIn();R._ag=true;try{_ue.call(this,dt)}finally{R._ag=false;swapOut(t)}
  const q2=enemies.slice();enemies.length=0;for(const e of n2)enemies.push(e);for(const e of q2)enemies.push(e);return r}}catch(e){ERR('aggro hook',e)}

/* ======================== STEAM KNIGHT (robot skill Lv10) — knight-r1 (TEST allin_r84, 14 Nov 2026) ========================
   DeaRz 14 Nov 10:42 UTC: robot skill Lv1-9 = the steam robot above, Lv10 = the Steam Knight (Motion k31: knight_k31/body.html). Only 2 tiers. ?knight=off = Lv10 stays the old robot. ?robotlv=10 forces Lv10.
   Numbers = Balance wrench_r1 r1.3 (TEST proposal, awaiting DeaRz) -> KC below. BAL_TODO: punch reach / motion are placeholders (Motion drew no punch).
   Knight lasts 24 s, cd 90 s, MP 104, HP 400 % of hero maxHP, hero takes no damage. Buttons while riding: 1 Jump · 2 Gatling · 3 Back rockets · 4 Thunder hammer · 5 All-out self-destruct · click = punch.
   Timeout = the Knight self-destructs with the same numbers (62 hits + blast); HP 0 = only the 50 % blast. Debug: ROBOT.knight, ROBOT.state(). */
const KNB=!!window.KN_SRC&&!KOFF;
const KC=RB.knight={MP:104,CD:90,DUR:24,HPX:4,
  PUNCH:356,PUNCH_CD:.8,PUNCH_R:130,
  JUMP:890,JUMP_R:190,JUMP_KB:120,JUMP_CD:4.2,
  GAT_N:24,GAT_PER:53.4,GAT_CD:5.6,GAT_CONE:260,GAT_DUR:2.4,
  RK_N:10,RK_PCT:214,RK_SPL:.5,RK_SR:60,RK_RANGE:320,RK_MAX:3,RK_CD:12,
  TH_N:5,TH_PCT:160,TH_R:230,TH_CH:.2,TH_ST:.8,TH_STE:.4,TH_IMM:2,TH_CD:10,
  AO_N:62,AO_PCT:15,AO_R:340,AO_BLAST:1300,HP0:.5,CHASE:420,
  BAL:'wrench_r1 r1.3 TEST proposal (awaiting DeaRz)'};
if(R30){KC.DUR=1800;C.DUR=1800;C.DUR5=1800}
IDS.rocket='rbRocket';IDS.hammer='rbHammer';IDS.punch='rbPunch';
const isElite=e=>{try{return !!(e.m&&e.m.elite)||!!e.eliteX}catch(_){return false}};
function tryStun(e){try{if(isBoss(e))return false;const t=time;e.st=e.st||{};if((e.st.stun||0)>0)return false;if(t<(e._hmImm||0))return false;if(Math.random()>=KC.TH_CH)return false;
  const d=isElite(e)?KC.TH_STE:KC.TH_ST;e.st.stun=Math.max(e.st.stun||0,d);e._hmImm=t+d+KC.TH_IMM;try{textAt(e.x,e.y-(e.sz||16)*2.3,'ช็อต!','#9fe0ff',14,{life:.7})}catch(_){}return true}catch(er){ERR('kstun',er);return false}}
const KN=KNB?(function(){
var KI={};try{Object.keys(window.KN_SRC).forEach(function(k){var im=new Image();im.src=window.KN_SRC[k];KI[k]=im})}catch(e){ERR('knimgs',e)}
var RS=0.278,RIDS=0.6,KCK=[54,34,186,138],KSEAT=[125,228],NZ=[14,62],KH=200;
var RP={"torso":{"img":"torso","pivot":[129,200],"parent":null,"at":[0,0]},"stack":{"img":"back_stacks","pivot":[60,160],"parent":"torso","at":[170,70]},"gun":{"img":"back_gun","pivot":[100,172],"parent":"torso","at":[185,22]},"armN":{"img":"near_upper_arm","pivot":[140,60],"parent":"torso","at":[225,115]},"foreN":{"img":"far_forearm_nozzle","pivot":[181,40],"parent":"armN","at":[19,60]},"paulN":{"img":"far_pauldron","pivot":[95,95],"parent":"torso","at":[22,110]},"thighF":{"img":"far_thigh","pivot":[53,19],"parent":"torso","at":[90,250]},"shinF":{"img":"far_shin","pivot":[77,21],"parent":"thighF","at":[56,156]},"footF":{"img":"far_foot","pivot":[98,21],"parent":"shinF","at":[49,180]},"thighN":{"img":"near_thigh","pivot":[72,21],"parent":"torso","at":[172,250]},"shinN":{"img":"near_shin","pivot":[64,21],"parent":"thighN","at":[40,145]},"footN":{"img":"near_foot","pivot":[102,21],"parent":"shinN","at":[61,177]},"crest":{"img":"head_crest","pivot":[109,120],"parent":"torso","at":[128,30]},"armF":{"img":"far_upper_arm","pivot":[136,60],"parent":"torso","at":[25,115]},"hammer":{"img":"hammer","pivot":[290,150],"parent":"foreF","at":[60,71]},"foreF":{"img":"near_forearm_fist","pivot":[192,48],"parent":"armF","at":[20,60]},"paulF":{"img":"near_pauldron","pivot":[95,95],"parent":"torso","at":[232,110],"flip":1}};
var RORD=["stack","gun","crest","paulN","thighF","shinF","footF","thighN","shinN","footN","armF","foreF","hammer","torso","RIDER","armN","foreN","paulF"];
var REST={"armN":-75,"foreN":30,"armF":-70,"foreF":30,"hammer":80,"thighN":-9,"shinN":-7,"footN":16,"thighF":11,"shinF":-8,"footF":-3};
var TINT={};function tint(k,col){var key=k+col;if(TINT[key])return TINT[key];var im=KI[k],c=document.createElement('canvas');c.width=im.width;c.height=im.height;var g=c.getContext('2d');g.drawImage(im,0,0);g.globalCompositeOperation='source-atop';g.fillStyle='rgb('+col+')';g.fillRect(0,0,c.width,c.height);return TINT[key]=c}
function mul(a,b){return [a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]]}
function Tm(x,y){return [1,0,0,1,x,y]}function Rm(d){var c=Math.cos(d*Math.PI/180),s=Math.sin(d*Math.PI/180);return [c,s,-s,c,0,0]}
function rsolve(p){var W={};function g(k){if(W[k])return W[k];var q=RP[k],r=(p.rot[k]||0)+(REST[k]||0),base=q.parent?g(q.parent):Tm(0,0);
  var m=mul(base,Tm(q.at[0],q.at[1]));m=mul(m,Rm(r));m=mul(m,Tm(-q.pivot[0],-q.pivot[1]));if(q.flip)m=mul(m,[-1,0,0,1,2*q.pivot[0],0]);W[k]=m;return m}
  Object.keys(RP).forEach(g);return W}
function rpt(W,k,x,y){var m=W[k];return [m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]]}
function rFootY(W){return Math.max(rpt(W,'footN',20,116)[1],rpt(W,'footN',175,116)[1],rpt(W,'footF',20,116)[1],rpt(W,'footF',175,116)[1])}
function rDraw(x,y,p){var W=rsolve(p),gy=p.gy!=null?p.gy:rFootY(W);
  cx.save();cx.translate(x,y-(p.air||0));cx.scale(-RS*(p.swell||1),RS*(p.swell||1));cx.translate(0,-gy);
  var base=cx.getTransform();
  RORD.forEach(function(k){
    if(k==='RIDER'){if(p.rider){cx.save();var m=W.torso;cx.transform(m[0],m[1],m[2],m[3],m[4],m[5]);cx.beginPath();cx.moveTo(KCK[0],KCK[3]);cx.lineTo(KCK[0],KCK[1]+40);cx.quadraticCurveTo(KCK[0]+4,KCK[1],(KCK[0]+KCK[2])/2,KCK[1]);cx.quadraticCurveTo(KCK[2]-4,KCK[1],KCK[2],KCK[1]+40);cx.lineTo(KCK[2],KCK[3]);cx.closePath();cx.clip();
        var sp=rpt(W,'torso',KSEAT[0],KSEAT[1]);cx.setTransform(base);cx.transform(1,0,0,1,sp[0],sp[1]);var inv=cx.getTransform();cx.setTransform(1,0,0,1,0,0);p.rider(inv);cx.restore()}return}
    var q=RP[k],im=KI[q.img];if(!ok(im))return;var m=W[k],o=(p.off&&p.off[k])||null;
    cx.save();if(o){if(o[3]<=0){cx.restore();return}cx.globalAlpha=o[3];var pv=rpt(W,k,q.pivot[0],q.pivot[1]);cx.translate(o[0],o[1]);cx.translate(pv[0],pv[1]);cx.rotate(o[2]*Math.PI/180);cx.translate(-pv[0],-pv[1])}
    cx.transform(m[0],m[1],m[2],m[3],m[4],m[5]);cx.drawImage(im,0,0);
    if(p.flash>0){var ti=tint(q.img,p.flashCol||'255,240,200');cx.globalAlpha=(o?o[3]:1)*p.flash;cx.drawImage(ti,0,0)}
    cx.restore()});
  cx.restore();return W}
/* screen point (knight-local, facing right, feet at x,y) of a part point */
function rScreen(x,y,p,k,px,py){var W=rsolve(p),gy=p.gy!=null?p.gy:rFootY(W),a=rpt(W,k,px,py),s=RS*(p.swell||1);return [x-a[0]*s,y-(p.air||0)+(a[1]-gy)*s]}
function idleRot(t){var b=Math.sin(t*2*Math.PI/1.6);return {torso:b*1.2,armN:b*3,foreN:-b*2,armF:-b*3,foreF:b*3,thighN:0,shinN:0,footN:0,thighF:0,shinF:0,footF:0,stack:b*2,bob:b*4}}
function legs(r,aN,kN,aF,kF){r.thighN=aN;r.shinN=kN;r.footN=-(aN+kN+(r.torso||0));r.thighF=aF;r.shinF=kF;r.footF=-(aF+kF+(r.torso||0))}
var WV=150,KW={P:0.68,DUTY:0.6,LIFT:50,BOB:7,AR:8,DROP:14,IDLE:10,G:null};
function kwLeg(side){var th=RP['thigh'+side],sh=RP['shin'+side],ft=RP['foot'+side];
  var v1=[sh.at[0]-th.pivot[0],sh.at[1]-th.pivot[1]],v2=[ft.at[0]-sh.pivot[0],ft.at[1]-sh.pivot[1]];
  return {hip:th.at,L1:Math.hypot(v1[0],v1[1]),L2:Math.hypot(v2[0],v2[1]),a1:Math.atan2(v1[1],v1[0]),a2:Math.atan2(v2[1],v2[0]),sole:116-ft.pivot[1]}}
function kwSolve(L,ax,ay,side,r){var dx=ax-L.hip[0],dy=ay-L.hip[1],d=Math.hypot(dx,dy),mx=(L.L1+L.L2)*0.995;if(d>mx){dx*=mx/d;dy*=mx/d;d=mx}
  var al=Math.acos(Math.max(-1,Math.min(1,(L.L1*L.L1+d*d-L.L2*L.L2)/(2*L.L1*d)))),base=Math.atan2(dy,dx);
  var p1=base+al,p2=base-al,k1=L.hip[0]+L.L1*Math.cos(p1),k2=L.hip[0]+L.L1*Math.cos(p2),ph=k1<k2?p1:p2;
  var kx=L.hip[0]+L.L1*Math.cos(ph),ky=L.hip[1]+L.L1*Math.sin(ph),ps=Math.atan2(ay-ky,ax-kx);
  var t1=(ph-L.a1)*180/Math.PI,t2=(ps-L.a2)*180/Math.PI-t1;
  r['thigh'+side]=t1-(REST['thigh'+side]||0);r['shin'+side]=t2-(REST['shin'+side]||0);r['foot'+side]=-(t1+t2)-(REST['foot'+side]||0)}
function kwGround(){if(KW.G!=null)return KW.G;var W=rsolve({rot:idleRot(0)}),m=W.torso;
  KW.G=rFootY(W)-m[5];KW.N={x:rpt(W,'footN',RP.footN.pivot[0],RP.footN.pivot[1])[0]-m[4]};KW.F={x:rpt(W,'footF',RP.footF.pivot[0],RP.footF.pivot[1])[0]-m[4]};return KW.G}
function walkRot(t){var G=kwGround(),r=idleRot(0),P_=KW.P,v=WV/RS,half=v*P_*KW.DUTY/2,bob=KW.BOB*(0.5-0.5*Math.cos(4*Math.PI*t/P_)),g=G-KW.BOB-KW.DROP+bob;
  r.torso=0;r.bob=0;
  [['N',0,KW.N.x],['F',0.5,KW.F.x]].forEach(function(q){var L=kwLeg(q[0]),u=((t/P_+q[1])%1+1)%1,s,lift=0;
    if(u<KW.DUTY){s=half-2*half*(u/KW.DUTY)}else{var w=(u-KW.DUTY)/(1-KW.DUTY),e=w*w*(3-2*w);s=-half+2*half*e;lift=KW.LIFT*Math.sin(Math.PI*w)}
    kwSolve(L,q[2]-s,g-L.sole-lift,q[0],r)});
  var a=2*Math.PI*t/P_,sn=Math.sin(a);r.armN=-KW.AR*sn;r.armF=KW.AR*sn;r.foreN=2*sn;r.foreF=-2*sn;r.stack=sn*2;r._gy=g-RP.torso.pivot[1];return r}
function walkGy(t,r){return r._gy!=null?r._gy:walkRot(t)._gy}
function rootIdle(t,r){var br=0.5-0.5*Math.cos(t*2*Math.PI/1.6),G2=kwGround(),g2=G2-KW.IDLE-6*br;r.torso=0;r.bob=0;r.stack=br*2;r.armN=-2*br;r.foreN=1.5*br;r.armF=2*br;r.foreF=-1.5*br;
  kwSolve(kwLeg('F'),KW.F.x,g2-kwLeg('F').sole,'F',r);kwSolve(kwLeg('N'),KW.N.x,g2-kwLeg('N').sole,'N',r);return g2-RP.torso.pivot[1]}
(function(){var W=rsolve({rot:idleRot(0)}),top=Math.min(rpt(W,'stack',60,8)[1],rpt(W,'stack',150,14)[1]);RS=KH/(rFootY(W)-top)})();
/* ---- timings (Motion k31) ---- */
var TH={THROW:0.40,LAND:0.78,PULSE:[0.95,1.2,1.45,1.7,1.95],BACK0:2.12,BACK1:2.45},RKF={FLY:0.6,T0:0.40,DT:0.1};
var GA={ON:0.4,OFF:2.0,RATE:36,FLY:0.1};
var AO={OPEN:0.5,F0:0.6,F1:2.1,EJ:2.2,RUN0:2.35,RUN1:2.85,BOOM:3.15,DUR:4.6,RK:[0.65,0.8,0.95,1.1,1.25,1.4,1.55,1.7,1.85,2.0],MS:[],BOLT:[0.7,0.95,1.2,1.45,1.7,1.95],MORT:[0.75,1.15,1.55,1.95]};
for(var i9=0;i9<12;i9++)AO.MS.push(+(0.62+i9*0.12).toFixed(2));
var AOH=null;function aoHits(){if(AOH)return AOH;var a=[];for(var k=Math.ceil(AO.F0*20);k<=Math.floor((AO.F1-0.05)*20);k++)a.push({t:+(k/20+0.05).toFixed(3),k:'g'});
  AO.RK.forEach(function(tf){a.push({t:+(tf+0.5).toFixed(3),k:'r'})});AO.MS.forEach(function(tf){a.push({t:+(tf+0.45).toFixed(3),k:'m'})});AO.MORT.forEach(function(tf){a.push({t:+(tf+0.7).toFixed(3),k:'o'})});AO.BOLT.forEach(function(tf){a.push({t:tf,k:'b'})});
  a.sort(function(x,y){return x.t-y.t});return AOH=a}
/* ---- poses ---- */
function KF(s,keys){for(var i=1;i<keys.length;i++){if(s<=keys[i][0]){var a=keys[i-1],b=keys[i],u=E((s-a[0])/(b[0]-a[0]));return a[1]+(b[1]-a[1])*u}}return keys[keys.length-1][1]}
function pose(kind,s,o){o=o||{};var r=idleRot(s),air=0,off=null,flash=0,swell=1,rider=true,x=0,gy=rootIdle(s,r),flashCol='255,240,200',vis=true;
  if(kind==='assemble'){if(s<0){vis=false}else{off={};var order=[['footN',0.10],['footF',0.14],['shinN',0.26],['shinF',0.30],['thighN',0.42],['thighF',0.46],['torso',0.62],['armF',0.80],['foreF',0.86],['paulF',0.84],['hammer',0.88],['armN',0.92],['foreN',0.98],['paulN',0.95],['crest',1.02],['gun',1.06],['stack',1.10]];
      order.forEach(function(q,i){var k=q[0],ta=q[1],st=ta-0.32,u=seg(s,st,ta),e=1-Math.pow(1-u,3),sx=(rnd(i*7)-0.5)*600,sy=-260-rnd(i*3)*200;off[k]=[sx*(1-e),sy*(1-e),(rnd(i*5)-0.5)*720*(1-e),u<=0?0:Math.min(1,u*3)]});rider=false}}
  else if(kind==='walk'){var rw=walkRot(s);r=rw;gy=walkGy(s,rw)}
  else if(kind==='jump'){var T=[0,0.28,0.4,0.6,0.76,0.82,0.95,1.4];var V=function(v){return KF(s,T.map(function(t,i){return [t,v[i]]}))};
    r.torso=V([0,10,-6,-4,-18,-12,-12,0]);var th=V([0,30,-6,46,10,30,30,0]),kn=V([0,-62,6,-92,-10,-60,-60,0]);legs(r,th,kn,th,kn);gy=null;
    if(s<0.4||s>=0.82){var cr=V([0,60,10,0,0,55,55,0]),G4=kwGround()-KW.IDLE-cr;kwSolve(kwLeg('F'),KW.F.x,G4-kwLeg('F').sole,'F',r);kwSolve(kwLeg('N'),KW.N.x,G4-kwLeg('N').sole,'N',r);r.torso=0;gy=G4-RP.torso.pivot[1]}
    var arm=V([0,-24,40,150,135,-12,-12,0]),fore=V([0,30,-10,-30,-20,-55,-55,0]);r.armN=arm;r.foreN=fore;r.armF=arm;r.foreF=fore;r.hammer=V([0,-20,10,30,40,0,0,0]);r.stack=V([0,6,-8,0,4,10,0,0]);r.bob=0;
    var up=seg(s,0.38,0.82);air=s>0.38&&s<0.82?Math.sin(Math.PI*Math.pow(up,0.85))*190:0}
  else if(kind==='gat'){var aim=E(seg(s,0,0.3))*(1-E(seg(s,GA.OFF+0.1,GA.OFF+0.4))),on=(s>GA.ON&&s<GA.OFF);r.torso=0;r.bob=0;
    (function(){var G=kwGround()-KW.IDLE,g=G-24*aim+(on?0.6*Math.sin(s*95):0);kwSolve(kwLeg('F'),KW.F.x-38*aim,g-kwLeg('F').sole,'F',r);kwSolve(kwLeg('N'),KW.N.x+44*aim,g-kwLeg('N').sole,'N',r);gy=g-RP.torso.pivot[1]})();
    if(o.walk){var w=walkRot(o.walk);r.thighN=w.thighN;r.shinN=w.shinN;r.footN=w.footN;r.thighF=w.thighF;r.shinF=w.shinF;r.footF=w.footF;gy=walkGy(o.walk,w)}
    r.armF=0*aim;r.foreF=-15*aim;var la=o.la||0,pp={rot:r,gy:gy},el=rScreen(0,0,pp,'armN',19,60),D=(o.D||300),ty=-40+D*Math.sin(la),tx=D*Math.cos(la),phi=Math.atan2(ty-el[1],tx-el[0])*180/Math.PI;
    r.foreN=(-phi-(r.armN+REST.armN)-REST.foreN-r.torso)*aim;x=-(on?0.8*Math.abs(Math.sin(s*95)):0)}
  else if(kind==='rocket'){var up2=E(seg(s,0,0.3))*(1-E(seg(s,1.6,2.0))),kick=0;for(var i=0;i<(o.n||10);i++){var e=s-(RKF.T0+i*RKF.DT);if(e>=0&&e<0.25)kick=Math.max(kick,1-e/0.25)}
    r.gun=12*up2+10*kick;r.torso=0;r.bob=0;r.armN=-6*up2;r.armF=4*up2;(function(){var G=kwGround()-KW.IDLE,g=G-6*up2+6*kick;kwSolve(kwLeg('F'),KW.F.x-20*up2,g-kwLeg('F').sole,'F',r);kwSolve(kwLeg('N'),KW.N.x+24*up2,g-kwLeg('N').sole,'N',r);gy=g-RP.torso.pivot[1]})();x=3*kick}
  else if(kind==='hammer'){var wu=E(seg(s,0,0.28)),sw=seg(s,0.28,0.40),fo=E(seg(s,0.40,0.62)),rel=E(seg(s,0.62,0.95)),cat=(s>=TH.BACK1-0.08&&s<TH.BACK1+0.25)?Math.sin(Math.PI*Math.min(1,(s-TH.BACK1+0.08)/0.33)):0,o8=1-E(seg(s,2.45,2.7));
    var arm2,fa;if(s<0.28){arm2=200*wu;fa=-60*wu}else if(s<0.40){var q=sw*sw;arm2=200+(60-200)*q;fa=-60+(10+60)*q}else if(s<0.62){arm2=60+(-20-60)*fo;fa=10*(1-fo)}else{arm2=-20*(1-rel);fa=0}
    r.armF=arm2-30*cat;r.foreF=fa;r.armN=(45*wu*(s<0.40?1:1-rel)+18*(s>=0.28&&s<0.62?Math.sin(Math.PI*seg(s,0.28,0.62)):0))*o8;
    r.torso=(-6*wu*(s<0.28?1:0)+(s>=0.28?(-6+(10+6)*Math.min(1,sw*1.2))*(1-rel):0));
    (function(){var G=kwGround()-KW.IDLE,dip=(s<0.28?8*wu:s<0.62?8+18*Math.sin(Math.PI*seg(s,0.28,0.62)):8*(1-rel)),g=G-dip-10*cat,st=26*wu*o8;kwSolve(kwLeg('F'),KW.F.x-st*0.5,g-kwLeg('F').sole,'F',r);kwSolve(kwLeg('N'),KW.N.x+st,g-kwLeg('N').sole-14*Math.sin(Math.PI*wu)-14*Math.sin(Math.PI*o8),'N',r);gy=g-RP.torso.pivot[1]})();
    if(s>=TH.THROW-0.02&&s<TH.BACK1)off={hammer:[0,0,0,0]}}
  else if(kind==='punch'&&window.__RATK&&__RATK.on){var Ck=__RATK.K,ik=Math.max(0,((R.pn&&R.pn.i)||1)-1),Vk=ik%2?Ck.B:Ck.A,ak=__RATK.amt(s,Ck),srck=ak<0?Vk.w:Vk.s,kk2=Math.min(1.15,Math.abs(ak));if(ak<0&&s>Ck.WIND*.7)kk2+=.02*Math.sin(s*120);Object.keys(srck).forEach(function(p){r[p]=(r[p]||0)*(1-kk2)+srck[p]*kk2});r.torso=ak>0?11*ak:6*ak;r.bob=0;x=Math.min(1,Math.max(0,ak))*Ck.LUNGE;
    (function(){var G=kwGround()-KW.IDLE,g=G-8*Math.abs(ak);kwSolve(kwLeg('F'),KW.F.x-14*Math.max(0,ak),g-kwLeg('F').sole,'F',r);kwSolve(kwLeg('N'),KW.N.x+16*Math.max(0,ak),g-kwLeg('N').sole,'N',r);gy=g-RP.torso.pivot[1]})();
    if(o.walk){var w2=walkRot(o.walk);r.thighN=w2.thighN;r.shinN=w2.shinN;r.footN=w2.footN;r.thighF=w2.thighF;r.shinF=w2.shinF;r.footF=w2.footF;gy=walkGy(o.walk,w2)}}
  else if(kind==='punch'){var pu=E(seg(s,0,0.12))*(1-E(seg(s,0.3,0.7)));r.armF=55*pu;r.foreF=-30*pu;r.hammer=-10*pu;r.torso=-5*pu;r.bob=0;x=3*pu;
    (function(){var G=kwGround()-KW.IDLE,g=G-8*pu;kwSolve(kwLeg('F'),KW.F.x-14*pu,g-kwLeg('F').sole,'F',r);kwSolve(kwLeg('N'),KW.N.x+16*pu,g-kwLeg('N').sole,'N',r);gy=g-RP.torso.pivot[1]})();
    if(o.walk){var w2=walkRot(o.walk);r.thighN=w2.thighN;r.shinN=w2.shinN;r.footN=w2.footN;r.thighF=w2.thighF;r.shinF=w2.shinF;r.footF=w2.footF;gy=walkGy(o.walk,w2)}}
  else if(kind==='ao'){var op=o.short?0:E(seg(s,0,AO.OPEN)),cl=1-E(seg(s,AO.F1,AO.EJ)),on=!o.short&&s>AO.F0&&s<AO.F1,kk=on?Math.sin(s*80):0;
    r.armN=60*op*cl+(on?3*kk:0);r.foreN=0;r.armF=150*op*cl;r.foreF=-10*op*cl;r.gun=14*op*(1-seg(s,AO.F1,AO.EJ));r.torso=0;r.bob=0;r.stack=on?3*Math.sin(s*30):0;
    var heat=seg(s,AO.F1-0.3,AO.BOOM);
    if(s<AO.RUN0){(function(){var G=kwGround()-KW.IDLE,g=G-16*op*cl+(on?0.8*Math.sin(s*95):0);kwSolve(kwLeg('F'),KW.F.x-34*op*cl,g-kwLeg('F').sole,'F',r);kwSolve(kwLeg('N'),KW.N.x+40*op*cl,g-kwLeg('N').sole,'N',r);gy=g-RP.torso.pivot[1]})();x=-(on?1.2*Math.abs(kk):0)}
    else{if(s<AO.RUN1){var rw2=walkRot((s-AO.RUN0)*2.2);['thighN','shinN','footN','thighF','shinF','footF'].forEach(function(k){r[k]=rw2[k]});r.armN=rw2.armN*2;r.armF=rw2.armF*2;r.torso=-10;gy=walkGy((s-AO.RUN0)*2.2,rw2)}
      else{(function(){var G=kwGround()-KW.IDLE-14;kwSolve(kwLeg('F'),KW.F.x-20,G-kwLeg('F').sole,'F',r);kwSolve(kwLeg('N'),KW.N.x+20,G-kwLeg('N').sole,'N',r);gy=G-RP.torso.pivot[1]})();r.armN=60;r.armF=-60}}
    var sh=seg(s,AO.RUN0,AO.BOOM);r.torso=(r.torso||0)+Math.sin(s*90)*4*sh;
    flash=s<AO.F1-0.3?0:(0.2+0.65*heat)*(0.5+0.5*Math.sin(s*(12+55*heat)));swell=1+0.12*E(seg(s,AO.RUN1,AO.BOOM));rider=s<AO.EJ+0.12;flashCol='255,70,30';
    if(s>=AO.BOOM){off={};var e9=s-AO.BOOM;Object.keys(RP).forEach(function(k,i){var a=rnd(i*11)*Math.PI-Math.PI,v=420+rnd(i*13)*360;off[k]=[Math.cos(a)*v*e9/RS*0.6,(-Math.abs(Math.sin(a))*v*e9+760*e9*e9)/RS*0.6,(rnd(i)-0.5)*1100*e9,Math.max(0,1-e9/0.9)]});swell=1.12;flash=Math.max(0,0.9-e9*2)}}
  return {x:x,vis:vis,p:{gy:gy,rot:r,air:air,off:off,flash:flash,flashCol:flashCol,swell:swell,rider:rider,bob:r.bob}}}
var HERO=null;function riderPoseOf(){return HERO||(HERO=window.wrPose(7,1))}
function seat(rx,ry,face,t){var k=rk(),st=pose('idle',t),a=rScreen(0,0,st.p,'torso',KSEAT[0],KSEAT[1]);return {x:rx+face*k*a[0],y:ry+GD+k*a[1]}}

/* ---- knight FX (Motion k31, converted: unit space = world px / k, ground y of a point = its world y / k) ---- */
function ufr(){cx=ctx;ctx.save();ctx.translate(0,GD);var k=rk();ctx.scale(k,k);return k}
function monU(e){var k=rk();return [e.x/k,e.y/k]}
function monsNear(x,y,r){var a=[];for(var i=0;i<enemies.length;i++){var e=enemies[i];if(e.dead||!(e.hp>0))continue;if(Math.hypot(e.x-x,e.y-y)<=r+(e.sz||16)*.6)a.push(e)}return a}
function thBolt(x0,y0,x1,y1,seed,w,al){var n=9,pts=[[x0,y0]],dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;
  for(var i=1;i<n;i++){var u=i/n,of=(rnd(seed*31+i)-0.5)*L*0.22*Math.sin(Math.PI*u);pts.push([x0+dx*u+nx*of,y0+dy*u+ny*of])}pts.push([x1,y1]);
  cx.save();cx.globalAlpha=al;cx.lineJoin='round';cx.lineCap='round';cx.globalCompositeOperation='lighter';
  [[w*4,'rgba(60,120,255,.35)'],[w*2,'rgba(120,200,255,.8)'],[w*0.8,'rgba(255,255,255,1)']].forEach(function(q){cx.strokeStyle=q[1];cx.lineWidth=q[0];cx.beginPath();cx.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<pts.length;i++)cx.lineTo(pts[i][0],pts[i][1]);cx.stroke()});cx.restore()}
function thHammerAt(x,y,rot,glow){var im=KI.hammer;if(!ok(im))return;cx.save();cx.translate(x,y);cx.scale(-RS,RS);cx.rotate(rot);cx.drawImage(im,-im.width/2,-im.height/2);
  if(glow>0){cx.globalAlpha=glow;cx.globalCompositeOperation='lighter';cx.drawImage(tint('hammer','90,170,255'),-im.width/2,-im.height/2)}cx.restore()}
function thRot(u){var e=1-Math.pow(1-u,2.2);return -(Math.PI/2+Math.PI*4)*e}
var THR_T=null,THR_D=null;
function thRing(x,y,R_,ratio,rot,al,pl){if(!THR_T&&ok(RUNE_IM)){THR_T=runeTintC('rgb(190,230,255)');THR_D=runeTintC('rgb(6,22,60)')}var RI2=R_-30;
  cx.save();cx.globalAlpha=al;cx.translate(x,y);
  cx.save();cx.fillStyle='rgba(20,60,140,'+(0.28+0.12*pl)+')';cx.beginPath();cx.ellipse(0,0,R_,R_*ratio,0,0,6.283);cx.ellipse(0,0,RI2,RI2*ratio,0,0,6.283,true);cx.fill('evenodd');cx.restore();
  function ell(r,w,col,b){cx.save();cx.strokeStyle=col;cx.lineWidth=w;cx.shadowColor='rgba(70,150,255,1)';cx.shadowBlur=b||0;cx.beginPath();cx.ellipse(0,0,r,r*ratio,0,0,6.283);cx.stroke();cx.restore()}
  ell(R_,5,'rgba(8,24,60,.8)');ell(R_,2.5,'rgba('+Math.floor(150+80*pl)+',220,255,1)',12);ell(RI2,1.5,'rgba(160,215,255,.9)',6);
  if(THR_T){var N=28;for(var j=0;j<N;j++){var a=rot+j/N*6.283,rr=R_-15,px=Math.cos(a)*rr,py=Math.sin(a)*rr*ratio;cx.save();cx.translate(px,py);cx.scale(1,0.6);var c=j%12;cx.drawImage(THR_D,c*64,0,64,64,-12,-12,24,24);cx.shadowColor='rgba(80,160,255,1)';cx.shadowBlur=8;cx.drawImage(THR_T,c*64,0,64,64,-10,-10,20,20);cx.restore()}}
  cx.restore()}
function rkRocket(x,y,a,s){cx.save();cx.translate(x,y);cx.rotate(a);cx.scale(1.6,1.6);
  cx.save();cx.globalCompositeOperation='lighter';var fl=18+8*Math.sin(s*90);var g=cx.createLinearGradient(-10,0,-10-fl,0);g.addColorStop(0,'rgba(255,250,200,1)');g.addColorStop(0.5,'rgba(255,150,40,.9)');g.addColorStop(1,'rgba(255,60,10,0)');cx.fillStyle=g;cx.beginPath();cx.moveTo(-9,-4);cx.lineTo(-10-fl,0);cx.lineTo(-9,4);cx.closePath();cx.fill();cx.restore();
  cx.lineWidth=2;cx.strokeStyle='#3a1e08';cx.fillStyle='#7a2a1a';cx.beginPath();cx.moveTo(-10,-5);cx.lineTo(-15,-9);cx.lineTo(-6,-5);cx.closePath();cx.fill();cx.stroke();cx.beginPath();cx.moveTo(-10,5);cx.lineTo(-15,9);cx.lineTo(-6,5);cx.closePath();cx.fill();cx.stroke();
  cx.fillStyle='#d8a23a';cx.beginPath();cx.roundRect(-11,-5,20,10,3);cx.fill();cx.stroke();cx.fillStyle='#c8321e';cx.beginPath();cx.moveTo(9,-5);cx.quadraticCurveTo(19,0,9,5);cx.closePath();cx.fill();cx.stroke();
  cx.fillStyle='#fff3c0';cx.fillRect(-4,-4,2,8);cx.restore()}
function rkBoom(x,y,e,Rr){Rr=Rr||115;
  if(e<0.5){var k=e/0.5,rr=30+120*(1-Math.pow(1-k,2));cx.save();cx.globalCompositeOperation='lighter';for(var l=0;l<3;l++){var cy=y-24-30*k-l*12,g=cx.createRadialGradient(x,cy,0,x,cy,rr*(1-l*0.25));g.addColorStop(0,'rgba(255,250,220,'+(1-k)+')');g.addColorStop(0.4,'rgba(255,170,60,'+(0.9*(1-k))+')');g.addColorStop(1,'rgba(200,40,10,0)');cx.fillStyle=g;cx.beginPath();cx.arc(x,cy,rr*(1-l*0.25),0,6.283);cx.fill()}cx.restore()}
  if(e<0.4){var k2=e/0.4,k2e=1-Math.pow(1-k2,2);cx.save();cx.strokeStyle='rgba(255,200,120,'+(0.9*(1-k2))+')';cx.lineWidth=12*(1-k2)+2;cx.beginPath();cx.ellipse(x,y,20+Rr*1.3*k2e,7+Rr*0.42*k2e,0,0,6.283);cx.stroke();cx.restore()}
  if(e<1.1){var k3=e/1.1;for(var j=0;j<6;j++){var a=j/6*6.283+0.4,R2=16+60*(1-Math.pow(1-k3,2));smokeAt(x+Math.cos(a)*R2*1.3,y-10+Math.sin(a)*R2*0.4-70*k3*(0.5+rnd(j)),0.3+0.5*k3,0.8*Math.pow(1-k3,1.3),j%2?'smoke_m':'smoke_s')}}
  if(e<0.8){cx.save();for(var j=0;j<16;j++){var a=-Math.PI*(0.1+0.8*rnd(j*7)),v=200+rnd(j*3)*260,px=x+Math.cos(a)*v*e*(j%2?1:-1),py=y-8+Math.sin(a)*v*e+600*e*e;if(py>y+6)continue;cx.globalAlpha=1-e/0.8;cx.fillStyle=j%3?'#7a5a30':'#ffb04a';cx.fillRect(px-2.5,py-2.5,5,5)}cx.restore()}}
function rkPath(m,t,u){var ax=(m[0]+t[0])/2-30,ay=Math.min(m[1],t[1])-360,x=(1-u)*(1-u)*m[0]+2*(1-u)*u*ax+u*u*t[0],y=(1-u)*(1-u)*m[1]+2*(1-u)*u*ay+u*u*(t[1]-4);
  var dx=2*(1-u)*(ax-m[0])+2*u*(t[0]-ax),dy=2*(1-u)*(ay-m[1])+2*u*(t[1]-4-ay);return [x,y,Math.atan2(dy,dx)]}
/* ---- gatling ---- */
function gpAt(S,tf,seed){var k=rk(),u=clampN((tf-GA.ON)/(GA.OFF-GA.ON),0,1),D=(80+(KC.GAT_CONE-80)*(0.5-0.5*Math.cos(2*Math.PI*u)))/k,a=S.cur!=null?S.cur:0,o=S.ou;
  return [o[0]+Math.cos(a)*D+(rnd(seed*3)-0.5)*40,o[1]+Math.sin(a)*D*0.8+(rnd(seed*7)-0.5)*30]}
function gatlingFX(S,s,on,m){if(on<=0)return;var now=s,k0=Math.ceil((now-0.45)*GA.RATE),k1=Math.floor(now*GA.RATE);
  for(var k=Math.max(Math.ceil(GA.ON*GA.RATE),k0);k<=k1;k++){var tf=k/GA.RATE;if(tf>GA.OFF)break;var e=now-tf,gp=gpAt(S,tf,k),gx=gp[0],gy=gp[1];
    if(e<GA.FLY){var u=e/GA.FLY,ax=m[0]+(gx-m[0])*u,ay=m[1]+(gy-m[1])*u,bx=m[0]+(gx-m[0])*Math.max(0,u-0.35),by=m[1]+(gy-m[1])*Math.max(0,u-0.35);
      cx.save();cx.globalCompositeOperation='lighter';cx.lineCap='round';cx.strokeStyle='rgba(255,170,60,'+(0.9*on)+')';cx.lineWidth=8;cx.beginPath();cx.moveTo(bx,by);cx.lineTo(ax,ay);cx.stroke();cx.strokeStyle='rgba(255,255,230,'+on+')';cx.lineWidth=3;cx.stroke();cx.restore()}
    else{var ie=e-GA.FLY;if(ie<0.4){var q=ie/0.4;cx.save();cx.fillStyle='rgba(60,35,15,'+(0.55*(1-q))+')';cx.beginPath();cx.ellipse(gx,gy,8,3,0,0,6.283);cx.fill();cx.restore();
      smokeAt(gx+(rnd(k)-0.5)*6,gy-10-40*q,0.28+0.4*q,0.9*(1-q),'smoke_s');
      if(ie<0.08){var qf=ie/0.08;cx.save();cx.globalCompositeOperation='lighter';var gf=cx.createRadialGradient(gx,gy-4,0,gx,gy-4,26);gf.addColorStop(0,'rgba(255,240,180,'+(1-qf)+')');gf.addColorStop(1,'rgba(255,120,30,0)');cx.fillStyle=gf;cx.beginPath();cx.arc(gx,gy-4,26,0,6.283);cx.fill();cx.restore()}
      if(ie<0.25){var q3=ie/0.25;cx.save();cx.fillStyle='rgba(150,110,60,'+(1-q3)+')';for(var j=0;j<7;j++){var vx=(rnd(k*5+j)-0.5)*170,vy=-80-60*rnd(k*9+j);cx.fillRect(gx+vx*ie-2,gy+vy*ie+300*ie*ie-2,4,4)}cx.restore()}}}}
  for(var k=Math.max(Math.ceil(GA.ON*GA.RATE),Math.ceil((now-0.5)*GA.RATE));k<=k1;k+=2){var tf=k/GA.RATE;if(tf>GA.OFF)break;var e=now-tf,vx=-60-50*rnd(k),vy=-150-60*rnd(k*2),px=m[0]-20+vx*e,py=m[1]-6+vy*e+700*e*e;if(py>m[1]+60)continue;
    cx.save();cx.translate(px,py);cx.rotate(e*30+k);cx.fillStyle='#d9a73a';cx.strokeStyle='#5a3a10';cx.lineWidth=1;cx.fillRect(-3,-1.5,6,3);cx.strokeRect(-3,-1.5,6,3);cx.restore()}
  var firing=now>GA.ON&&now<GA.OFF;cx.save();cx.translate(m[0],m[1]);var ang=now*(firing?60:8);cx.fillStyle='rgba(30,20,20,.9)';for(var j=0;j<6;j++){var a=ang+j*Math.PI/3;cx.beginPath();cx.arc(Math.cos(a)*5,Math.sin(a)*5,1.6,0,6.283);cx.fill()}
  if(firing){var gpn=gpAt(S,now,1),aim=Math.atan2(gpn[1]-m[1],gpn[0]-m[0]);cx.rotate(aim);cx.globalCompositeOperation='lighter';cx.globalAlpha=on;
    var fr=Math.floor(now*GA.RATE),f=0.75+0.45*rnd(fr),L=78*f,W2=16*f,halo=cx.createRadialGradient(8,0,0,8,0,48*f);halo.addColorStop(0,'rgba(255,245,200,.95)');halo.addColorStop(0.35,'rgba(255,170,60,.55)');halo.addColorStop(1,'rgba(255,90,20,0)');cx.fillStyle=halo;cx.beginPath();cx.arc(8,0,48*f,0,6.283);cx.fill();
    var g=cx.createLinearGradient(0,0,L,0);g.addColorStop(0,'rgba(255,255,235,1)');g.addColorStop(0.45,'rgba(255,200,90,.95)');g.addColorStop(1,'rgba(255,110,20,0)');cx.fillStyle=g;
    cx.beginPath();cx.moveTo(0,-W2);cx.lineTo(L*0.55,-W2*0.55);cx.lineTo(L,0);cx.lineTo(L*0.55,W2*0.55);cx.lineTo(0,W2);cx.closePath();cx.fill();
    cx.fillStyle='rgba(255,255,240,1)';cx.beginPath();cx.arc(6,0,9*f,0,6.283);cx.fill()}
  cx.restore();
  if(now>0.4){for(var j=0;j<3;j++){var q=((now*1.6)+j/3)%1;smokeAt(m[0]+8+14*q,m[1]-6-30*q,0.12+0.18*q,0.5*(1-q)*on,'smoke_s')}}}
/* ---- back rockets (Sub S = {tg:[{e,x,y}],n}) ---- */
function rocketFX(S,s,mouth){for(var i=0;i<S.tg.length;i++){var tf=RKF.T0+i*RKF.DT,e=s-tf;if(e<0)continue;var g=S.tg[i],t=g.e&&!g.e.dead&&g.e.hp>0?monU(g.e):g.u;g.u=t;
    if(e<RKF.FLY){var u=e/RKF.FLY,p=rkPath(mouth,t,u);for(var j=1;j<=8;j++){var uu=Math.max(0,u-j*0.035);if(uu<=0)break;var q=rkPath(mouth,t,uu);smokeAt(q[0],q[1],0.08+0.03*j,0.55*(1-j/9),'smoke_s')}rkRocket(p[0],p[1],p[2],s+i)}
    else rkBoom(t[0],t[1]+4,e-RKF.FLY,KC.RK_SR/rk()*1.6);
    if(e<0.35){cx.save();cx.globalCompositeOperation='lighter';var gg=cx.createRadialGradient(mouth[0],mouth[1],0,mouth[0],mouth[1],40*(1-e/0.35)+10);gg.addColorStop(0,'rgba(255,240,190,'+(1-e/0.35)+')');gg.addColorStop(1,'rgba(255,120,30,0)');cx.fillStyle=gg;cx.beginPath();cx.arc(mouth[0],mouth[1],50,0,6.283);cx.fill();cx.restore();smokeAt(mouth[0]-10-30*e,mouth[1]-10-40*e,0.2+0.5*e,0.8*(1-e/0.35),'smoke_m')}}}
/* ---- thunder hammer (Sub S = {cu:[x,y] centre in units}) ---- */
function thunderFX(S,s,hand){var C=S.cu,G=C[1]+2,k=rk(),Ru=KC.TH_R/k;
  if(s>=TH.THROW&&s<TH.LAND){var u=(s-TH.THROW)/(TH.LAND-TH.THROW),x=hand[0]+(C[0]-hand[0])*u,y=hand[1]+(G-62-hand[1])*u-110*Math.sin(Math.PI*u),rot=thRot(u);
    for(var q=1;q<=4;q++){var uu=Math.max(0,u-q*0.04);cx.save();cx.globalAlpha=0.18*(1-q/5);thHammerAt(hand[0]+(C[0]-hand[0])*uu,hand[1]+(G-62-hand[1])*uu-110*Math.sin(Math.PI*uu),thRot(uu),0);cx.restore()}
    thHammerAt(x,y,rot,0.5+0.3*Math.sin(s*60));if(Math.floor(s*30)%2)thBolt(x-20,y-20,x+20,y+25,Math.floor(s*30),1.5,0.9)}
  var planted=s>=TH.LAND&&s<TH.BACK0,hx=C[0],hy=G-62;
  if(planted){var e=s-TH.LAND,pg=0;TH.PULSE.forEach(function(p){var q=s-p;if(q>=0&&q<0.25)pg=Math.max(pg,1-q/0.25)});
    if(e<0.5)landFX(C[0],G,e*0.8);
    thHammerAt(hx,hy+6*Math.min(1,e/0.06),-Math.PI/2,0.35+0.5*pg+0.15*Math.sin(s*30));
    for(var j=0;j<2;j++){var sd=Math.floor(s*24)+j*5,a=rnd(sd)*6.283;thBolt(hx+(rnd(sd+1)-0.5)*20,hy-40+rnd(sd+2)*60,hx+Math.cos(a)*55,hy+Math.sin(a)*40,sd,1.2,0.8)}}
  TH.PULSE.forEach(function(p,pi){var q=s-p;if(q<0||q>0.6)return;var kk=q/0.6,ke=1-Math.pow(1-kk,2.2);
    if(q<0.12){thBolt(hx+(rnd(pi)-0.5)*30,hy-300,hx,hy-60,pi*7+3,3,1-q/0.12)}
    cx.save();cx.globalCompositeOperation='lighter';cx.strokeStyle='rgba(140,210,255,'+(1-kk)+')';cx.lineWidth=10*(1-kk)+2;cx.shadowColor='rgba(80,160,255,1)';cx.shadowBlur=14;cx.beginPath();cx.ellipse(C[0],G,20+(Ru-20)*ke,7+(Ru*0.33-7)*ke,0,0,6.283);cx.stroke();
    cx.strokeStyle='rgba(255,255,255,'+(0.9*(1-kk))+')';cx.lineWidth=2;cx.stroke();cx.restore();
    if(q<0.22){S.mons.forEach(function(e){if(e.dead)return;var mu=monU(e);if(Math.hypot(e.x-S.c[0],e.y-S.c[1])>KC.TH_R+(e.sz||16)*.6)return;thBolt(hx,hy-30,mu[0],mu[1]-40,pi*11+(e.x|0)%7+Math.floor(q*40),2,1-q/0.22)})}
    if(q<0.3){for(var j=0;j<6;j++){var a=j/6*6.283+pi,rr=Ru*ke;thBolt(C[0],G,C[0]+Math.cos(a)*rr,G+Math.sin(a)*rr*0.33,pi*17+j,1.2,1-q/0.3)}}});
  if(s>=TH.BACK0&&s<TH.BACK1){var u2=(s-TH.BACK0)/(TH.BACK1-TH.BACK0),x2=hx+(hand[0]-hx)*u2,y2=hy+6+(hand[1]-hy-6)*u2-100*Math.sin(Math.PI*u2);thHammerAt(x2,y2,-Math.PI/2+u2*Math.PI*3.5,0.6);if(Math.floor(s*30)%2)thBolt(x2-18,y2-18,x2+18,y2+22,Math.floor(s*30)+9,1.5,0.9)}
  if(s>=TH.BACK1&&s<TH.BACK1+0.15){var q3=(s-TH.BACK1)/0.15;cx.save();cx.globalCompositeOperation='lighter';var gg=cx.createRadialGradient(hand[0],hand[1],0,hand[0],hand[1],40);gg.addColorStop(0,'rgba(200,230,255,'+(1-q3)+')');gg.addColorStop(1,'rgba(80,150,255,0)');cx.fillStyle=gg;cx.beginPath();cx.arc(hand[0],hand[1],40,0,6.283);cx.fill();cx.restore()}}
/* ---- all-out (move 9) ---- */
function aoSc(T,seed){var k=rk(),a=rnd(seed*1.7+0.3)*6.283,d=Math.sqrt(rnd(seed*2.9+1.1))*KC.AO_R/k*0.9;return [T[0]+Math.cos(a)*d,T[1]+4+Math.sin(a)*d*0.33]}
function aoPK(){return RS*1.25}
var PODT={X:[0.47,0.65,0.83],Y:[0.46,0.76]};
function aoTube(m,ti){var k=aoPK(),w=120*k,h=56*k;return [m[0]-w/2+PODT.X[ti%3]*w,m[1]-h+PODT.Y[Math.floor(ti/3)]*h]}
function aoKick(s,side){var kk=0;AO.MS.forEach(function(tf,i){if((i%2?2:1)!==side)return;var e=s-tf;if(e>=0&&e<0.1)kk=Math.max(kk,1-e/0.1)});return kk}
function aoPod(x,y,open,s,side){var o=E(open);if(o<=0)return;var bi=KI.pod2_base,li=KI.pod2_lid;if(!ok(bi)||!ok(li))return;y+=2.5*aoKick(s,side);x-=1.5*aoKick(s,side);var k=aoPK(),w=120*k,h=56*k,rise=Math.min(1,o/0.5),lo=E(seg(o,0.45,1));
  cx.save();cx.translate(x,y);cx.save();cx.scale(1,rise);cx.drawImage(bi,-w/2,-h,w,h);cx.restore();
  if(rise>=1){AO.MS.forEach(function(tf,i){if((i%2?2:1)!==side||s<tf)return;var ti=Math.floor(i/2),tx=-w/2+PODT.X[ti%3]*w,ty=-h+PODT.Y[Math.floor(ti/3)]*h,rr=w*0.05;cx.fillStyle='#120a06';cx.beginPath();cx.arc(tx,ty,rr,0,6.283);cx.fill();var eh=s-tf;if(eh<0.6){cx.save();cx.globalCompositeOperation='lighter';cx.fillStyle='rgba(255,140,50,'+(0.8*(1-eh/0.6))+')';cx.beginPath();cx.arc(tx,ty,rr*0.8,0,6.283);cx.fill();cx.restore()}})}
  if(rise>=1){var lw=124*k,lh=9*k,hx=-w/2+0.03*w,hy=-h+0.06*h;cx.save();cx.translate(hx,hy);cx.rotate(-1.9*lo);cx.drawImage(li,-0.05*lw,-lh/2,lw,lh);cx.restore()}
  if(s>AO.F0&&s<AO.F1){cx.globalCompositeOperation='lighter';var fx=w*0.12,fy=-h*0.42,g=cx.createRadialGradient(fx,fy,0,fx,fy,w*0.3);g.addColorStop(0,'rgba(255,190,110,'+(0.3+0.2*Math.sin(s*50+side))+')');g.addColorStop(1,'rgba(255,90,20,0)');cx.fillStyle=g;cx.beginPath();cx.arc(fx,fy,w*0.3,0,6.283);cx.fill()}
  cx.restore()}
function aoLaunchFX(m,a,e,i){cx.save();cx.globalCompositeOperation='lighter';
  if(e<0.09){var q=e/0.09,g=cx.createRadialGradient(m[0],m[1],0,m[0],m[1],26*(1-q)+8);g.addColorStop(0,'rgba(255,250,215,'+(1-q)+')');g.addColorStop(0.4,'rgba(255,170,60,'+(0.85*(1-q))+')');g.addColorStop(1,'rgba(255,80,20,0)');cx.fillStyle=g;cx.beginPath();cx.arc(m[0],m[1],34,0,6.283);cx.fill()}
  if(e<0.12){var q=e/0.12,L=40*(1-q)+10;cx.save();cx.translate(m[0],m[1]);cx.rotate(a);var g2=cx.createLinearGradient(0,0,L,0);g2.addColorStop(0,'rgba(255,255,225,'+(1-q)+')');g2.addColorStop(0.5,'rgba(255,180,70,'+(0.8*(1-q))+')');g2.addColorStop(1,'rgba(255,90,20,0)');cx.fillStyle=g2;cx.beginPath();cx.moveTo(0,-6);cx.lineTo(L,0);cx.lineTo(0,6);cx.closePath();cx.fill();cx.restore()}
  cx.restore();
  if(e<0.3){var q=e/0.3;for(var j=0;j<4;j++){var ang=a+Math.PI+(rnd(i*7+j)-0.5)*1.2,v=30+50*rnd(i*3+j);smokeAt(m[0]+Math.cos(ang)*v*q*1.4,m[1]+Math.sin(ang)*v*q-14*q,0.07+0.16*q,0.55*(1-q),'smoke_s')}}}
function aoMissile(x,y,a,s){cx.save();cx.translate(x,y);cx.rotate(a);
  cx.save();cx.globalCompositeOperation='lighter';var fl=14+6*Math.sin(s*80);var g=cx.createLinearGradient(-9,0,-9-fl,0);g.addColorStop(0,'rgba(255,250,200,1)');g.addColorStop(1,'rgba(255,90,20,0)');cx.fillStyle=g;cx.beginPath();cx.moveTo(-8,-3);cx.lineTo(-9-fl,0);cx.lineTo(-8,3);cx.closePath();cx.fill();cx.restore();
  var im=KI.micro_missile,w=60*RS*1.25,h=29*RS*1.25;if(ok(im))cx.drawImage(im,-w/2,-h/2,w,h);cx.restore()}
function aoArc(m,tx,u,hgt,side,gyT){var ax=(m[0]+tx)/2+side,ay=Math.min(m[1],gyT)-hgt,x=(1-u)*(1-u)*m[0]+2*(1-u)*u*ax+u*u*tx,y=(1-u)*(1-u)*m[1]+2*(1-u)*u*ay+u*u*(gyT-6);
  var dx=2*(1-u)*(ax-m[0])+2*u*(tx-ax),dy=2*(1-u)*(ay-m[1])+2*u*(gyT-6-ay);return [x,y,Math.atan2(dy,dx)]}
function aoSmallBoom(x,y,e,big){if(e>0.6)return;var k=e/0.6,rr=(big?70:38)*(1-Math.pow(1-k,2))+8;cx.save();cx.globalCompositeOperation='lighter';var g=cx.createRadialGradient(x,y-14,0,x,y-14,rr);g.addColorStop(0,'rgba(255,250,210,'+(1-k)+')');g.addColorStop(0.45,'rgba(255,150,40,'+(0.8*(1-k))+')');g.addColorStop(1,'rgba(200,40,10,0)');cx.fillStyle=g;cx.beginPath();cx.arc(x,y-14,rr,0,6.283);cx.fill();cx.restore();smokeAt(x,y-20-50*k,0.2+0.4*k,0.7*(1-k),'smoke_s')}
function allOutFX(ek,s,A){var T=ek.tu,gT=T[1]+4,short=ek.short;
  if(!short&&s>AO.F0-0.25&&s<AO.F1+0.2){var la=Math.min(1,(s-0.35)/0.15)*(s<AO.F1?1:1-(s-AO.F1)/0.2);if(la>0){var pl=0.5+0.5*Math.sin(s*20),rr=26+10*(1-Math.min(1,(s-0.35)/0.3));cx.save();cx.globalAlpha=la;cx.strokeStyle='rgba(255,60,30,'+(0.7+0.3*pl)+')';cx.lineWidth=3;cx.beginPath();cx.arc(T[0],T[1]-30,rr,0,6.283);cx.stroke();[0,1,2,3].forEach(function(q){var a=q*Math.PI/2+s*2;cx.beginPath();cx.moveTo(T[0]+Math.cos(a)*(rr-8),T[1]-30+Math.sin(a)*(rr-8));cx.lineTo(T[0]+Math.cos(a)*(rr+10),T[1]-30+Math.sin(a)*(rr+10));cx.stroke()});cx.restore()}}
  if(!short){
    var po=seg(s,0.15,0.45)*(1-seg(s,AO.F1+0.05,AO.F1+0.25));if(A&&s<AO.EJ+0.1){aoPod(A.podF[0],A.podF[1],po,s,1);aoPod(A.podN[0],A.podN[1],po,s,2)}
    if(A&&s>AO.F0&&s<AO.F1){var m=A.nz;for(var k=0;k<5;k++){var u=((s*9)+k/5)%1,gp=aoSc(T,Math.floor(s*9)*5+k),gx=gp[0],gy=gp[1],ax=m[0]+(gx-m[0])*u,ay=m[1]+(gy-m[1])*u,bx=m[0]+(gx-m[0])*Math.max(0,u-0.25),by=m[1]+(gy-m[1])*Math.max(0,u-0.25);
        cx.save();cx.globalCompositeOperation='lighter';cx.lineCap='round';cx.strokeStyle='rgba(255,170,60,.9)';cx.lineWidth=7;cx.beginPath();cx.moveTo(bx,by);cx.lineTo(ax,ay);cx.stroke();cx.strokeStyle='rgba(255,255,230,1)';cx.lineWidth=2.5;cx.stroke();cx.restore()}
      var fr=Math.floor(s*36),f=0.75+0.45*rnd(fr),aim=Math.atan2(gT-m[1],T[0]-m[0]);cx.save();cx.translate(m[0],m[1]);cx.rotate(aim);cx.globalCompositeOperation='lighter';var hl=cx.createRadialGradient(8,0,0,8,0,46*f);hl.addColorStop(0,'rgba(255,245,200,.95)');hl.addColorStop(1,'rgba(255,90,20,0)');cx.fillStyle=hl;cx.beginPath();cx.arc(8,0,46*f,0,6.283);cx.fill();cx.fillStyle='rgba(255,230,150,1)';cx.beginPath();cx.moveTo(0,-14*f);cx.lineTo(70*f,0);cx.lineTo(0,14*f);cx.closePath();cx.fill();cx.restore();
      for(var k=0;k<6;k++){var q=((s*7)+k/6)%1,sp=aoSc(T,Math.floor(s*7+k/6)*11+k*3);aoSmallBoom(sp[0],sp[1],q*0.35,false)}}
    if(A)AO.RK.forEach(function(tf,i){var e=s-tf;if(e<0)return;var fly=0.5,rp=aoSc(T,i*7+100);if(e<fly){var p=aoArc(A.gun,rp[0],e/fly,300,-30,rp[1]);for(var j=1;j<=6;j++){var uu=Math.max(0,e/fly-j*0.04),q=aoArc(A.gun,rp[0],uu,300,-30,rp[1]);smokeAt(q[0],q[1],0.08+0.03*j,0.5*(1-j/7),'smoke_s')}rkRocket(p[0],p[1],p[2],s+i)}else rkBoom(rp[0],rp[1],e-fly,KC.RK_SR/rk()*1.6);
      if(e<0.25){var m=A.gun;cx.save();cx.globalCompositeOperation='lighter';var g=cx.createRadialGradient(m[0],m[1],0,m[0],m[1],40);g.addColorStop(0,'rgba(255,240,190,'+(1-e/0.25)+')');g.addColorStop(1,'rgba(255,120,30,0)');cx.fillStyle=g;cx.beginPath();cx.arc(m[0],m[1],40,0,6.283);cx.fill();cx.restore()}});
    if(A)AO.MS.forEach(function(tf,i){var e=s-tf,fly=0.45;if(e<0)return;var m=aoTube(i%2?A.podN:A.podF,Math.floor(i/2)),tp=aoSc(T,i*13+200),tx=tp[0],hg=200+60*rnd(i),sd=40*(rnd(i*3)-0.5);if(e<0.3)aoLaunchFX(m,aoArc(m,tx,0.03,hg,sd,tp[1])[2],e,i);
      if(e<fly){var p=aoArc(m,tx,e/fly,hg,sd,tp[1]);for(var j=1;j<=4;j++){var q=aoArc(m,tx,Math.max(0,e/fly-j*0.05),hg,sd,tp[1]);smokeAt(q[0],q[1],0.06+0.02*j,0.45*(1-j/5),'smoke_s')}aoMissile(p[0],p[1],p[2],s+i)}else aoSmallBoom(tx,tp[1],e-fly,true)});
    if(A)AO.MORT.forEach(function(tf,i){var e=s-tf,fly=0.7;if(e<0)return;var m=A.stack,mp=aoSc(T,i*17+300);if(e<fly){var p=aoArc(m,mp[0],e/fly,380,-60,mp[1]);cx.save();cx.globalCompositeOperation='lighter';var g=cx.createRadialGradient(p[0],p[1],0,p[0],p[1],16);g.addColorStop(0,'rgba(255,240,180,1)');g.addColorStop(1,'rgba(255,90,20,0)');cx.fillStyle=g;cx.beginPath();cx.arc(p[0],p[1],16,0,6.283);cx.fill();cx.restore();var ms=KI.mortar_shell;if(ok(ms)){var mw=33*RS*1.5,mh=40*RS*1.5;cx.save();cx.translate(p[0],p[1]);cx.rotate(p[2]+Math.PI/2);cx.drawImage(ms,-mw/2,-mh/2,mw,mh);cx.restore()}if(e<0.2)smokeAt(m[0],m[1]-20-60*e,0.3+e,0.8*(1-e/0.2),'smoke_m')}else rkBoom(mp[0],mp[1],e-fly,KC.RK_SR/rk()*1.6)});
    if(A)AO.BOLT.forEach(function(tf,i){var e=s-tf;if(e<0||e>0.16)return;var h=A.ham,bp=aoSc(T,i*19+400);thBolt(h[0],h[1],bp[0],bp[1]-20,i*13+Math.floor(e*40),2.6,1-e/0.16)});
    if(A&&s>0.3&&s<AO.F1){var h=A.ham;for(var j=0;j<2;j++){var sd=Math.floor(s*24)+j*5,a=rnd(sd)*6.283;thBolt(h[0],h[1],h[0]+Math.cos(a)*40,h[1]+Math.sin(a)*40,sd,1.1,0.8)}}
  }
  if(s>=AO.BOOM&&s<AO.BOOM+1.4)boomFX(T[0],gT,s-AO.BOOM);
  for(var b=0;b<8;b++){var tb=AO.BOOM+0.08+b*0.06,e=s-tb;if(e<0||e>1.1)continue;var a=b/8*6.283+0.4,d=KC.AO_R/rk()*(0.55+0.35*rnd(b*3)),bk=rkBoom;bk(T[0]+Math.cos(a)*d,gT+Math.sin(a)*d*0.33,e,KC.RK_SR/rk()*1.6)}}
/* ---- knight body / ground / front / mechanics ---- */
function riderFn(m){try{var U=window.PUPPET,hp=R&&R.ph==='mount'?window.wrPose(7,clampN((time-R.t0)/T7,0,1)):riderPoseOf(),hm=window.HAMMER,hmOn=hm&&hm.on;if(!hp)return;
  cx.setTransform(m);var sw=U.cfg.showSword;U.cfg.showSword=false;riderDraw=true;if(hm)hm.on=false;try{window.drawCombo(cx,0,0,RIDS*SCD/RS,-1,hp)}finally{riderDraw=false;if(hm)hm.on=hmOn;U.cfg.showSword=sw}}catch(er){ERR('krider',er)}}
function bodyDraw(st,wantRider){var p=st.p,bob=p.bob||0;p.air=(p.air||0)-bob;p.rider=wantRider?riderFn:null;
  var shs=p.air?Math.max(0.4,1-p.air/300):1;cx.fillStyle='rgba(0,0,0,.25)';cx.beginPath();cx.ellipse(st.x||0,4,105*shs,20*shs,0,0,6.3);cx.fill();
  rDraw(st.x||0,0,p);p.air+=bob;return p}
function stackSmoke(st,p,t){var q=rScreen(st.x||0,0,p,'stack',60,22);for(var i=0;i<2;i++)puff(q[0],q[1],t*0.9+i/2,i*3);q=rScreen(st.x||0,0,p,'stack',150,30);for(var i=0;i<2;i++)puff(q[0],q[1],t*0.9+i/2+0.25,i*3)}
function setAnch(bx,by,face,st,p){var k=rk(),x=st.x||0,f=function(pt){return [bx/k+face*pt[0],by/k+pt[1]]},sc=function(kk,a,b){return f(rScreen(x,0,p,kk,a,b))};
  R.kx={nz:sc('foreN',NZ[0],NZ[1]),gun:sc('gun',26,37),podN:sc('paulF',95,22),podF:sc('paulN',95,22),stack:sc('stack',60,10),ham:sc('hammer',150,150),hand:sc('foreF',60,71)}}
function hpBar(){var w=130,h=9,y=-235;cx.save();cx.fillStyle='rgba(0,0,0,.6)';cx.fillRect(-w/2-2,y-2,w+4,h+4);cx.fillStyle='#3b0d0d';cx.fillRect(-w/2,y,w,h);var f=clampN(R.hpR/R.hpMax,0,1);cx.fillStyle=f>.5?'#6fd06a':f>.25?'#e0b83a':'#e0463a';cx.fillRect(-w/2,y,w*f,h);
  if(R.ph==='ride'||R.ph==='stand'){var tf=clampN(1-(time-R.rt0)/R.dur,0,1);cx.fillStyle='rgba(0,0,0,.6)';cx.fillRect(-w/2-2,y+12,w+4,6);cx.fillStyle='#7fc8ff';cx.fillRect(-w/2,y+13,w*tf,4)}cx.restore()}
function aoPos(ek,sa){var u=E(seg(sa,AO.RUN0,AO.RUN1));return [ek.rx+(ek.sx-ek.rx)*u,ek.ry+(ek.sy-ek.ry)*u]}
function body(){if(!R)return null;var t=time,k=rk();
  if(R.ph==='assemble'){var s=t-R.t0-LEAD;if(s<0)return null;
    return {x:R.bx,y:R.by,fn:function(){frame(R.bx,R.by,R.face);try{var st=pose('assemble',s);bodyDraw(st,false);
        ['loose_gear','loose_piston','loose_plate','loose_bolt','loose_pipe','loose_gauge'].forEach(function(kk,i){var u=seg(s,0.2+i*0.12,0.55+i*0.12);if(u<=0||u>=1)return;var im=KI[kk];if(!ok(im))return;var sx=(rnd(i*9)-0.5)*700,sy=-400-rnd(i)*100,ex=0,ey=-150,x=lerp(sx,ex,E(u)),y=lerp(sy,ey,E(u));cx.save();cx.globalAlpha=Math.min(1,(1-u)*3);cx.translate(x,y);cx.rotate(u*12);cx.scale(0.3,0.3);cx.drawImage(im,-im.width/2,-im.height/2);cx.restore()});
        [0.10,0.26,0.42,0.62,0.80,0.92,1.10].forEach(function(ta,i){var e=s-ta;if(e<0||e>0.25)return;var kk=e/0.25;cx.save();cx.globalCompositeOperation='lighter';cx.strokeStyle='rgba(150,210,255,'+(1-kk)+')';cx.lineWidth=3;var cy=-[10,40,80,150,170,170,240][i];for(var j=0;j<6;j++){var a=j*1.05+i;cx.beginPath();cx.moveTo(Math.cos(a)*20,cy+Math.sin(a)*20);cx.lineTo(Math.cos(a)*(30+60*kk)+(rnd(j+i)*10),cy+Math.sin(a)*(30+60*kk));cx.stroke()}cx.restore()});
        if(s>1.1&&s<1.6){var k2=(s-1.1)/0.5;cx.save();cx.globalAlpha=1-k2;for(var j=0;j<6;j++)puff((j-2.5)*35,-10,k2,0);cx.restore()}}finally{ctx.restore()}}}}
  if(R.ph==='stand')return {x:R.bx,y:R.by,fn:function(){frame(R.bx,R.by,R.face);try{var st=pose('idle',t),p=bodyDraw(st,false);setAnch(R.bx,R.by,R.face,st,p);stackSmoke(st,p,t);hpBar()}finally{ctx.restore()}}};
  if(R.ph==='mount')return {x:R.bx,y:R.by,fn:function(){var e=t-R.t0;frame(R.bx,R.by,R.face);try{var st=pose('idle',t),p=bodyDraw(st,e>=0.5);if(e>=0.5)stackSmoke(st,p,t)}finally{ctx.restore()}}};
  if(R.ph==='ride'){var S=R.sub;return {x:P.x,y:P.y,fn:function(){var kind='idle',s=t,o={};
      if(S){s=t-S.t0;if(S.k==='jump')kind='jump';else if(S.k==='sweep'){kind='gat';o.la=localAng(S.cur!=null?S.cur:0,R.face);var u=clampN((s-GA.ON)/(GA.OFF-GA.ON),0,1);o.D=(80+(KC.GAT_CONE-80)*(0.5-0.5*Math.cos(2*Math.PI*u)))/k;if(SWMOVE&&R.moving)o.walk=R.wt}else if(S.k==='rocket'){kind='rocket';o.n=S.tg.length}else if(S.k==='hammer')kind='hammer'}
      else if(R.pn&&t-R.pn.t0<0.8){kind='punch';s=t-R.pn.t0;if(R.moving)o.walk=R.wt}
      else if(R.moving){kind='walk';s=R.wt}
      var st=pose(kind,s,o);frame(P.x,P.y,R.face);try{var p=bodyDraw(st,!R.auto);setAnch(P.x,P.y,R.face,st,p);stackSmoke(st,p,t);
        if(S&&S.k==='jump'){var js=t-S.t0;if(js>=0.3&&js<0.62){var kk=(js-0.3)/0.32;for(var j=0;j<5;j++)puff((j-2)*30,-4,Math.min(0.99,kk+j*0.05),0)}}
        hpBar()}finally{ctx.restore()}}}}
  if(R.ph==='eject'){var ek=R.ek,sa=t-ek.t0+ek.s0;if(sa>=AO.BOOM+1.0)return null;var ps=aoPos(ek,sa);
    return {x:ps[0],y:ps[1],fn:function(){var st=pose('ao',sa,{short:ek.short});frame(ps[0],ps[1],ek.face);try{var p=bodyDraw(st,sa<AO.EJ+0.12);setAnch(ps[0],ps[1],ek.face,st,p);R.kao=R.kx;
        if(sa>=AO.F1-0.2&&sa<AO.BOOM&&!ek.short){[['thighN',53,185],['thighF',53,185],['armN',42,150],['torso',40,214],['torso',220,120]].forEach(function(j,i){var pt=rScreen(0,0,p,j[0],j[1],j[2]);puff(pt[0],pt[1],(sa*2.2+i*0.23)%1,0)})}
        if(ek.short&&sa<AO.BOOM){[['thighN',53,185],['armN',42,150],['torso',40,214]].forEach(function(j,i){var pt=rScreen(0,0,p,j[0],j[1],j[2]);puff(pt[0],pt[1],(sa*2.2+i*0.23)%1,0)})}}finally{ctx.restore()}}}}
  return null}
function ground(){var S=R.sub,t=time;
  if(R.ph==='ride'&&S){var s=t-S.t0,k=rk();
    if(S.k==='jump'&&s<1.25){frame(S.tx,S.ty,1,KC.JUMP_R/150);jumpRing(s);ctx.restore()}
    else if(S.k==='sweep'&&s<KC.GAT_DUR+0.1){frame(SWMOVE?P.x:S.x0,SWMOVE?P.y:S.y0,1);ctx.rotate(S.cur!=null?S.cur:0);coneDraw(s);ctx.restore()}
    else if(S.k==='rocket'&&s>0.3&&s<2.2){var lk=Math.min(1,(s-0.3)/0.2);S.tg.forEach(function(g,i){var land=RKF.T0+i*RKF.DT+RKF.FLY;if(s>land+0.15)return;var a7=Math.min(1,(s-0.3)/0.15)*(s<land?1:1-(s-land)/0.15),pl=0.5+0.5*Math.sin(s*16+i),x=g.e&&!g.e.dead?g.e.x:g.x,y=g.e&&!g.e.dead?g.e.y:g.y;
        frame(x,y,1,1);try{ctx.globalAlpha=a7;ctx.fillStyle='rgba(255,70,20,'+(0.12+0.1*pl)+')';ctx.beginPath();ctx.ellipse(0,4,KC.RK_SR,KC.RK_SR*0.32,0,0,6.283);ctx.fill()}finally{ctx.restore()}});
      var seen={};S.tg.forEach(function(g,i){if(!g.e||g.e.dead||s>RKF.T0+i*RKF.DT+RKF.FLY+0.1)return;var id=g.e._kid=g.e._kid||(++KID);seen[id]=seen[id]||{e:g.e,n:0};seen[id].n++});
      Object.keys(seen).forEach(function(id){var q=seen[id],e=q.e;frame(e.x,e.y,1,1);try{var rr=46-16*lk,rot=s*3;ctx.strokeStyle='#ff2a10';ctx.lineWidth=3;ctx.shadowColor='rgba(255,40,0,.8)';ctx.shadowBlur=8;ctx.translate(0,-40);ctx.beginPath();ctx.arc(0,0,rr,0,6.283);ctx.stroke();ctx.rotate(rot);for(var j=0;j<4;j++){ctx.rotate(Math.PI/2);ctx.beginPath();ctx.moveTo(rr-8,0);ctx.lineTo(rr+10,0);ctx.stroke()}ctx.rotate(-rot-Math.PI*2);ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.font='bold 14px sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#5a0a00';ctx.strokeText('LOCK x'+q.n,0,-rr-10);ctx.fillText('LOCK x'+q.n,0,-rr-10)}finally{ctx.restore()}})}
    else if(S.k==='hammer'&&s>=TH.LAND&&s<TH.BACK0+0.15){var eR=s-TH.LAND,aR=Math.min(1,eR/0.12)*(s<TH.BACK0?1:1-(s-TH.BACK0)/0.15),gR=0;TH.PULSE.forEach(function(p){var q=s-p;if(q>=0&&q<0.25)gR=Math.max(gR,1-q/0.25)});
      frame(S.c[0],S.c[1],1,1);try{cx=ctx;thRing(0,4,KC.TH_R*(0.85+0.15*E(Math.min(1,eR/0.12))),0.33,s*0.4,aR*0.9,gR)}finally{ctx.restore()}}}
  else if(R.ph==='eject'){var ek=R.ek,sa=t-ek.t0+ek.s0;
    if(!ek.short&&sa>0.35&&sa<AO.F1+0.2){var la=Math.min(1,(sa-0.35)/0.15)*(sa<AO.F1?1:1-(sa-AO.F1)/0.2),pl=0.5+0.5*Math.sin(sa*20);frame(ek.tx,ek.ty,1,1);try{ctx.globalAlpha=la;ctx.strokeStyle='rgba(255,60,30,'+(0.7+0.3*pl)+')';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,4,KC.AO_R,KC.AO_R*0.33,0,0,6.283);ctx.stroke();ctx.fillStyle='rgba(255,50,20,'+(0.1+0.08*pl)+')';ctx.fill()}finally{ctx.restore()}}
    if(sa>=AO.BOOM-0.55&&sa<AO.BOOM+0.4){var u6=seg(sa,AO.BOOM-0.55,AO.BOOM),g6=E(seg(sa,AO.BOOM-0.55,AO.BOOM-0.41)),rr6=KC.AO_R*(0.35+0.65*g6),pl2=0.5+0.5*Math.sin(sa*(10+40*u6)),a6=(0.7+0.3*u6)*Math.min(1,(sa-AO.BOOM+0.55)/0.06)*(sa<AO.BOOM?1:1-(sa-AO.BOOM)/0.4);
      frame(ek.tx,ek.ty,1,1);try{cx=ctx;ctx.save();ctx.globalAlpha=a6;ctx.fillStyle='rgba(255,60,30,'+(0.12+0.18*pl2*u6)+')';ctx.beginPath();ctx.ellipse(0,4,rr6,rr6*0.32,0,0,6.283);ctx.fill();ctx.restore();runeRing(0,4,rr6,0.32,sa*(0.6+2*u6),a6,pl2)}finally{ctx.restore()}}}}
var KID=0;
function front(){var S=R.sub,t=time,K=R.kx;
  if(R.ph==='ride'&&S&&K){var s=t-S.t0,k=rk();
    if(S.k==='sweep'&&s>=GA.ON-0.1&&s<GA.OFF+0.5){S.ou=[(SWMOVE?P.x:S.x0)/k,(SWMOVE?P.y:S.y0)/k];var on=Math.min(1,(s-GA.ON+0.1)/0.1)*Math.max(0,Math.min(1,(GA.OFF+0.05-s)/0.15));ufr();try{gatlingFX(S,s,on,K.nz)}finally{ctx.restore()}}
    else if(S.k==='jump'){if(s>=0.82&&s<2.2){frame(S.tx,S.ty,1,KC.JUMP_R/150);try{landFX(0,4,s-0.82)}finally{ctx.restore()}}}
    else if(S.k==='rocket'){ufr();try{rocketFX(S,s,K.gun)}finally{ctx.restore()}}
    else if(S.k==='hammer'){if(!S.hand&&s>=TH.THROW)S.hand=K.hand.slice();ufr();try{thunderFX(S,s,S.hand||K.hand)}finally{ctx.restore()}}}
  else if(R.ph==='eject'){var ek=R.ek,sa=t-ek.t0+ek.s0;ek.tu=[ek.tx/rk(),ek.ty/rk()];ufr();try{allOutFX(ek,sa,R.kao)}finally{ctx.restore()}}}
/* ---- mechanics ---- */
function use(id){var k=rk(),lv=R.lv;
  if(id==='jump'){if((P.cds[IDS.jump]||0)>0){toast('คูลดาวน์ '+Math.ceil(P.cds[IDS.jump])+' วิ');return false}
    var t=null;try{t=typeof aimPoint==='function'?aimPoint(C.JUMP_RANGE):null}catch(_){}if(!t||!isFinite(t.x))t={x:P.x+R.face*280,y:P.y};
    var dx=t.x-P.x,dy=t.y-P.y,d=Math.hypot(dx,dy)||1;if(d>C.JUMP_RANGE){dx*=C.JUMP_RANGE/d;dy*=C.JUMP_RANGE/d}
    var tx=P.x+dx,ty=P.y+dy;for(var f=1;f>=0&&!freeAt(tx,ty);f-=.1){tx=P.x+dx*f;ty=P.y+dy*f}
    if(Math.hypot(tx-P.x,ty-P.y)<30){toast('กระโดดไม่ได้ (ติดสิ่งกีดขวาง)');return false}
    R.face=(tx-P.x)>=0?1:-1;P.face=R.face>0?0:Math.PI;P.cds[IDS.jump]=KC.JUMP_CD;R.sub={k:'jump',t0:time,x0:P.x,y0:P.y,tx:tx,ty:ty,hit:false};return true}
  if(id==='sweep'){if((P.cds[IDS.sweep]||0)>0){toast('คูลดาวน์ '+Math.ceil(P.cds[IDS.sweep])+' วิ');return false}
    P.cds[IDS.sweep]=KC.GAT_CD;if(!SWT.drag)SWT.ang=null;R.sub={k:'sweep',t0:time,x0:P.x,y0:P.y,n:0,ang:null};R.sub.ang=sweepAng(R.sub);R.sub.cur=R.sub.ang;R.sub.ou=[P.x/k,P.y/k];if(Math.abs(Math.cos(R.sub.ang))>.2){R.face=Math.cos(R.sub.ang)>0?1:-1;P.face=R.face>0?0:Math.PI}return true}
  if(id==='rocket'){if((P.cds[IDS.rocket]||0)>0){toast('คูลดาวน์ '+Math.ceil(P.cds[IDS.rocket])+' วิ');return false}
    var near=[];for(var i=0;i<enemies.length;i++){var e=enemies[i];if(e.dead||!(e.hp>0))continue;var dd=Math.hypot(e.x-P.x,e.y-P.y);if(dd<=KC.RK_RANGE)near.push([dd,e])}
    if(!near.length){toast('ไม่มีเป้าหมายในระยะ '+KC.RK_RANGE+' px');return false}
    near.sort(function(a,b){return a[0]-b[0]});var mons=near.slice(0,4).map(function(q){return q[1]}),cnt=mons.map(function(){return 0}),order=[0,1,0,2,0,1,0,2,0,0],tg=[];
    for(var i=0;i<KC.RK_N;i++){var pick=-1,pref=order[i]%mons.length;if(cnt[pref]<KC.RK_MAX)pick=pref;else{for(var j=0;j<mons.length;j++){if(cnt[j]<KC.RK_MAX){pick=j;break}}}if(pick<0)break;cnt[pick]++;tg.push({e:mons[pick],x:mons[pick].x,y:mons[pick].y,u:[mons[pick].x/k,mons[pick].y/k]})}
    var f0=Math.cos(Math.atan2(mons[0].y-P.y,mons[0].x-P.x));if(Math.abs(f0)>.2){R.face=f0>0?1:-1;P.face=R.face>0?0:Math.PI}
    P.cds[IDS.rocket]=KC.RK_CD;R.sub={k:'rocket',t0:time,x0:P.x,y0:P.y,tg:tg,done:[]};return true}
  if(id==='hammer'){if((P.cds[IDS.hammer]||0)>0){toast('คูลดาวน์ '+Math.ceil(P.cds[IDS.hammer])+' วิ');return false}
    var ms=[];for(var i=0;i<enemies.length;i++){var e=enemies[i];if(e.dead||!(e.hp>0))continue;if(Math.hypot(e.x-P.x,e.y-P.y)<=KC.RK_RANGE)ms.push(e)}
    var cxw,cyw;if(ms.length){cxw=0;cyw=0;ms.forEach(function(e){cxw+=e.x;cyw+=e.y});cxw/=ms.length;cyw/=ms.length;R.face=(cxw-P.x)>=0?1:-1}else{cxw=P.x+R.face*260*k;cyw=P.y}
    P.face=R.face>0?0:Math.PI;for(var f=1;f>=0&&!freeAt(cxw,cyw);f-=.2){cxw=P.x+(cxw-P.x)*.8;cyw=P.y+(cyw-P.y)*.8}
    P.cds[IDS.hammer]=KC.TH_CD;R.sub={k:'hammer',t0:time,x0:P.x,y0:P.y,c:[cxw,cyw],cu:[cxw/k,cyw/k],mons:enemies.filter(function(e){return !e.dead}),pi:0};return true}
  if(id==='eject'){beginEject('skill');return true}
  return false}
function punch(){try{if(!R||R.ph!=='ride'||R.sub||!playing())return;if((P.cds[IDS.punch]||0)>0)return;var ang=aimAng();if(Math.abs(Math.cos(ang))>.2){R.face=Math.cos(ang)>0?1:-1;P.face=R.face>0?0:Math.PI}punchArc(KC.PUNCH,KC.PUNCH_R,'pn',KC.PUNCH_CD,ang)}catch(e){ERR('punch',e)}}
function punchAuto(e){try{R.pn=(window.__RATK&&__RATK.on?__RATK.mkpn():{t0:time});P.cds[IDS.punch]=KC.PUNCH_CD;__RATK.hit(e,KC.PUNCH,'pn',function(a,b,c2){hitPct(a,b,c2)});try{G.shake=Math.max(G.shake||0,4)}catch(_){}}catch(er){ERR('kpunchA',er)}}
function ride(dt,k){var S=R.sub;if(!S)return;var s=time-S.t0;
  if(S.k==='jump'){var up=seg(s,0.38,0.82);if(s>=0.38){P.x=S.x0+(S.tx-S.x0)*E(up);P.y=S.y0+(S.ty-S.y0)*E(up)}
    if(!S.hit&&s>=0.82){S.hit=true;P.x=S.tx;P.y=S.ty;try{G.shake=Math.max(G.shake||0,12)}catch(_){}
      for(var i=0;i<enemies.length;i++){var e=enemies[i];if(e.dead||!(e.hp>0))continue;var dx=e.x-S.tx,dy=e.y-S.ty,d=Math.hypot(dx,dy);if(d>KC.JUMP_R+(e.sz||16)*.6)continue;hitPct(e,KC.JUMP,'jump');var u=d>1?1/d:0;push(e,(d>1?dx*u:R.face)*KC.JUMP_KB,(d>1?dy*u:0)*KC.JUMP_KB,.5)}}
    if(s>=1.4){R.sub=null;R.lastX=P.x;R.lastY=P.y}}
  else if(S.k==='sweep'){if(!SWMOVE){P.x=S.x0;P.y=S.y0;P.vx=0;P.vy=0}else{var mv=Math.hypot(P.x-R.lastX,P.y-R.lastY)/Math.max(dt,1e-3);R.moving=mv>25;if(R.moving)R.wt+=dt*mv/(150*k);else R.wt=0;R.lastX=P.x;R.lastY=P.y}
    var ox=SWMOVE?P.x:S.x0,oy=SWMOVE?P.y:S.y0,ang=sweepAng(S);S.cur=ang;if(Math.abs(Math.cos(ang))>.2)R.face=Math.cos(ang)>0?1:-1;
    while(S.n<KC.GAT_N&&s>=GA.ON+S.n*(GA.OFF-GA.ON)/(KC.GAT_N-1)){for(var i=0;i<enemies.length;i++){var e=enemies[i];if(e.dead||!(e.hp>0))continue;if(!conePoint(e,ox,oy,ang))continue;hitPct(e,KC.GAT_PER,'gt'+S.n);slow(e);if(!isBoss(e)){var nx=e.x+Math.cos(ang)*C.PUSH*k/KC.GAT_N,ny=e.y+Math.sin(ang)*C.PUSH*k/KC.GAT_N;if(freeAt(nx,ny)){e.x=nx;e.y=ny}}}S.n++}
    if(s>=KC.GAT_DUR){R.sub=null;SWT.ang=null;R.lastX=P.x;R.lastY=P.y}}
  else if(S.k==='rocket'){P.vx=0;P.vy=0;
    for(var i=0;i<S.tg.length;i++){var g=S.tg[i];if(S.done[i]||s<RKF.T0+i*RKF.DT+RKF.FLY)continue;S.done[i]=true;var ix=g.x,iy=g.y;if(g.e&&!g.e.dead&&g.e.hp>0){ix=g.e.x;iy=g.e.y;hitPct(g.e,KC.RK_PCT,'rk'+i)}
      var sp=monsNear(ix,iy,KC.RK_SR);for(var j=0;j<sp.length;j++){if(sp[j]===g.e)continue;hitPct(sp[j],KC.RK_PCT*KC.RK_SPL,'rks'+i)}try{G.shake=Math.max(G.shake||0,5)}catch(_){}}
    if(s>=2.7){R.sub=null;R.lastX=P.x;R.lastY=P.y}}
  else if(S.k==='hammer'){P.vx=0;P.vy=0;
    while(S.pi<KC.TH_N&&s>=TH.PULSE[S.pi]){var ms=monsNear(S.c[0],S.c[1],KC.TH_R);for(var j=0;j<ms.length;j++){hitPct(ms[j],KC.TH_PCT,'th'+S.pi);tryStun(ms[j])}try{G.shake=Math.max(G.shake||0,6)}catch(_){}S.pi++}
    if(s>=2.7){R.sub=null;R.lastX=P.x;R.lastY=P.y}}}
function beginEject(kind){if(!R||R.ph==='eject')return;var k=rk(),short=kind==='hp0';R.ph='eject';R.sub=null;
  var tg=nearestMon(P.x,P.y,KC.CHASE),tx,ty,face=R.face;if(tg){tx=tg.x;ty=tg.y;face=(tg.x-P.x)>=0?1:-1}else{tx=P.x+R.face*260*k;ty=P.y}
  for(var f=1;f>=0&&!freeAt(tx,ty);f-=.25){tx=P.x+(tx-P.x)*.75;ty=P.y+(ty-P.y)*.75}
  var dd=Math.hypot(tx-P.x,ty-P.y),sx=P.x,sy=P.y;if(dd>70*k){var u=(dd-70*k)/dd;sx=P.x+(tx-P.x)*u;sy=P.y+(ty-P.y)*u;if(!freeAt(sx,sy)){sx=P.x;sy=P.y}}
  var s0=short?AO.F1:0,lx=P.x-face*230*k,ly=P.y;for(var f=1;f>=0&&!freeAt(lx,ly);f-=.25){lx=P.x-face*230*k*f}
  R.ek={kind:kind,t0:time,rx:P.x,ry:P.y,face:face,tx:tx,ty:ty,sx:sx,sy:sy,s0:s0,short:short,hoff:AO.EJ-s0,dur:AO.DUR-s0,lx:lx,ly:ly,seat:seat(P.x,P.y,R.face,time),heroLock:true,heroDone:false,boomed:false,hi:0,wd:0};
  if(R.auto){R.ek.noHero=true;R.ek.heroLock=false;R.ek.heroDone=true}else{try{P.vx=0;P.vy=0}catch(_){}}}
function eject(dt,k){var ek=R.ek,sa=time-ek.t0+ek.s0,sh=time-ek.t0-ek.hoff;if(!ek.noHero){P.vx=0;P.vy=0}
  if(!ek.heroDone&&sh>=1.05){ek.heroDone=true;ek.heroLock=false;if(freeAt(ek.lx,ek.ly)){P.x=ek.lx;P.y=ek.ly}else{P.x=ek.rx;P.y=ek.ry}}
  else if(ek.heroLock){P.x=ek.rx;P.y=ek.ry}
  if(!ek.short){var H=aoHits();while(ek.hi<H.length&&sa>=H[ek.hi].t){var ms=monsNear(ek.tx,ek.ty,KC.AO_R);for(var j=0;j<ms.length;j++)hitPct(ms[j],KC.AO_PCT,'ao'+ek.hi);if(H[ek.hi].k!=='g'){try{G.shake=Math.max(G.shake||0,4)}catch(_){}}ek.hi++}}
  if(!ek.boomed&&sa>=AO.BOOM){ek.boomed=true;var pct=KC.AO_BLAST*(ek.kind==='hp0'?KC.HP0:1);try{G.shake=Math.max(G.shake||0,18)}catch(_){}
    var ms2=monsNear(ek.tx,ek.ty,KC.AO_R);for(var j=0;j<ms2.length;j++){var e=ms2[j],dx=e.x-ek.tx,dy=e.y-ek.ty,d=Math.hypot(dx,dy);hitPct(e,pct,'aob');var u=d>1?1/d:0,out=(KC.AO_R-Math.min(d,KC.AO_R)+70*k);push(e,(d>1?dx*u:1)*out,(d>1?dy*u:0)*out,.55)}}
  if(time-ek.t0>=ek.dur)finish()}
function desc(){return 'เลเวล 10: หุ่นยนต์อัปเกรดเป็นอัศวินไอน้ำ (Steam Knight) ขับได้ '+KC.DUR+' วิ MP '+KC.MP+' คูลดาวน์ '+KC.CD+' วิ HP '+Math.round(KC.HPX*100)+'% ของ HP สูงสุด ตัวละครไม่โดนดาเมจ\n'
  +'คลิก = หมัด '+KC.PUNCH+'% ทุก '+KC.PUNCH_CD+' วิ · 1 กระโดดทุบ '+KC.JUMP+'% รัศมี '+KC.JUMP_R+' ผลักถอย '+KC.JUMP_KB+' คูลดาวน์ '+KC.JUMP_CD+' วิ · 2 ปืนกลยิงกวาด '+KC.GAT_N+' ฮิต ฮิตละ '+KC.GAT_PER+'% ช้าลง 40% (บอส 20%) 3 วิ คูลดาวน์ '+KC.GAT_CD+' วิ\n'
  +'3 จรวดจากหลัง '+KC.RK_N+' ลูก ล็อกมอนใกล้สุดในระยะ '+KC.RK_RANGE+' ลูกละ '+KC.RK_PCT+'% + ระเบิดรอบ '+KC.RK_SR+' px '+Math.round(KC.RK_SPL*100)+'% (สูงสุด '+KC.RK_MAX+' ลูก/ตัว) คูลดาวน์ '+KC.RK_CD+' วิ · 4 ค้อนสายฟ้า '+KC.TH_N+' ระลอก ระลอกละ '+KC.TH_PCT+'% รัศมี '+KC.TH_R+' ติดสตั้น 20%/ตัว/ระลอก คูลดาวน์ '+KC.TH_CD+' วิ\n'
  +'5 ระเบิดตัวเอง: '+KC.AO_N+' ฮิต ฮิตละ '+KC.AO_PCT+'% + ระเบิด '+KC.AO_BLAST+'% รัศมี '+KC.AO_R+' (หมดเวลา = ระเบิดเองเหมือนกัน · HP หมด = ระเบิดแค่ 50%)'}
return {punchAuto:punchAuto,seat:seat,body:body,ground:ground,front:front,use:use,punch:punch,ride:ride,beginEject:beginEject,eject:eject,desc:desc,pose:pose,rs:function(){return RS},KI:KI};
})():null;
if(KN){ICO.rocket=mkIcon('#b5561f','✦');ICO.hammer=mkIcon('#2f6fbf','⚡')}
/* ======================== the hammer skill line (weapon skill window) ======================== */
function ultDesc(){const lv=RB.lv,cv=curve(lv);if(KN&&lv>=10)return KN.desc();return 'โยนพิมพ์เขียว ประกอบหุ่นยนต์จักรกลไอน้ำ แล้วขึ้นขับ '+durOf(lv)+' วิ (เลเวล 5 ขึ้นไป '+C.DUR5+' วิ) หุ่นยนต์มี HP '+Math.round(C.HPX*100)+'% ของ HP สูงสุด ตัวละครไม่โดนดาเมจระหว่างขับ · สกิลปกติและโจมตีปกติใช้ไม่ได้ ช่อง 1-3 = สกิลหุ่นยนต์\n'
  +'1 กระโดดทุบ '+Math.round(C.JUMP*cv)+'% ที่จุดคลิก (ไกลสุด '+C.JUMP_RANGE+' px) ผลักถอย '+C.JUMP_KB+' px คูลดาวน์ '+C.JUMP_CD+' วิ\n2 พ่นไอน้ำส่าย 20 ฮิต รวม '+Math.round(C.SWEEP*cv)+'% ช้าลง 40% (บอส 20%) 3 วิ คูลดาวน์ '+C.SW_CD+' วิ\n3 ดีดตัวออก + ระเบิดฆ่าตัวตาย '+Math.round(C.EJECT*cv*(lv>=10?C.B10:1))+'% รัศมี '+C.R_BOOM+(lv>=10?' (เลเวล 10 ระเบิด x1.3)':'')+' · หุ่นพัง = ระเบิด 50%'}
const LINE={title:'ทักษะสายค้อนไอน้ำ',cols:[{name:'โจมตี',skills:[]},{name:'บัฟ / สนับสนุน',skills:[]},{name:'พาสซีฟ',skills:[]}]};
let registered=false;
function register(){const W=window.__WSK;if(!(W&&W.lines))return false;if(registered)return true;
  if(!W.lines.hammer)W.lines.hammer=LINE;const L=W.lines.hammer;
  L.cols[0].skills.push({k:'hm_robot',name:'หุ่นยนต์จักรกลไอน้ำ',type:'active',row:C.UNLOCK_ROW,ok:()=>!!(RB.on&&window.wrPose&&window.RB_SRC),icon:()=>ICO.ult,desc:ultDesc,key:'',cdId:IDS.ult,cost:()=>((KN&&RB.lv>=10)?({mp:KC.MP,cd:KC.CD}):({mp:C.MP,cd:cdOf(RB.lv)})),start:()=>start()});
  /* r78: ?robot=give is handled by the mastery gate (hammer row 5 stays open) */
  registered=true;return true}
const ivR=setInterval(()=>{try{if(register())clearInterval(ivR)}catch(e){ERR('register',e)}},500);
try{const st=document.createElement('style');st.textContent=`
#wWpnSk .hmP{left:43.5%;top:78.3%;width:22.6%;height:4.6%;display:flex;align-items:center;justify-content:flex-end;gap:.5cqw;z-index:4}
#wWpnSk .hmP button{height:100%;min-height:24px;padding:0 .9cqw;border-radius:.7cqw;border:1px solid #ffd98a;background:rgba(96,66,16,.92);color:#ffe9b0;font-family:inherit;font-weight:800;font-size:max(11px,1.4cqw);cursor:pointer;touch-action:manipulation;white-space:nowrap}
#wWpnSk .hmP button.rs{border-color:#8aa0c8;background:rgba(30,40,70,.9);color:#cfe0ff}
#wWpnSk .hmP button:disabled{opacity:.35;cursor:default}
#wWpnSk .hmP .hmN{font-size:max(10px,1.3cqw);color:#ffe9b0;font-weight:700;white-space:nowrap}
#wWpnSk .hmP[hidden]{display:none}`;document.head.appendChild(st)}catch(e){ERR('css',e)}
const selK=()=>{const r=document.querySelector('#wWpnSk .row.sel');return r?r.dataset.k:null};
function decorate(){const win=document.getElementById('wWpnSk');if(!win||win.hidden)return;const box=win.querySelector('.box');if(!box)return;let pn=box.querySelector('.hmP');
  if(!pn){box.insertAdjacentHTML('beforeend','<div class="abs hmP" hidden><span class="hmN"></span><button type="button" class="hup">+1 เลเวล</button><button type="button" class="rs">รีเซ็ตแต้ม</button></div>');pn=box.querySelector('.hmP')}
  const k=selK(),ok=!!(k&&KEYS[k]&&held());if(pn.hidden!==!ok)pn.hidden=!ok;if(!ok)return;
  const f=free(),L=lvOf(k),fixed=/[?&]robotlv=/.test(Q),txt=fixed?'Lv '+L+' (?robotlv)':open(k)?'Lv '+L+'/'+MAXLV+' · แต้มเหลือ '+f:'🔒 Lv.'+needOf(k);
  const n=pn.querySelector('.hmN');if(n.textContent!==txt)n.textContent=txt;
  const b=pn.querySelector('.hup'),dis=!open(k)||L>=((KEYS[k]&&KEYS[k].max)||MAXLV)||f<1||fixed;if(b.disabled!==dis)b.disabled=dis;const lb=L>=MAXLV?'เต็ม':'+1 เลเวล';if(b.textContent!==lb)b.textContent=lb;
  const r=pn.querySelector('.rs'),rd=spent()<1;if(r.disabled!==rd)r.disabled=rd}
function hookWin(){const win=document.getElementById('wWpnSk');if(!win||win._hm)return !!win;win._hm=1;
  new MutationObserver(()=>{try{decorate()}catch(e){ERR('ui',e)}}).observe(win,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class']});
  win.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('.hmP button');if(!t)return;e.stopPropagation();e.stopImmediatePropagation();e.preventDefault();
    try{const k=selK();if(!k||!KEYS[k])return;if(t.classList.contains('rs')){const now=Date.now();if(t._arm&&now-t._arm<3000){t._arm=0;t.textContent='รีเซ็ตแต้ม';reset()}else{t._arm=now;t.textContent='แตะอีกครั้ง';setTimeout(()=>{if(t._arm&&Date.now()-t._arm>=2900){t._arm=0;t.textContent='รีเซ็ตแต้ม'}},3000);return}}
      else{const why=up(k);if(why)toast(why)}
      const r=win.querySelector('.row.sel');if(r)r.dispatchEvent(new MouseEvent('click',{bubbles:true}));decorate()}catch(er){ERR('btn',er)}},true);
  return true}
setInterval(()=>{try{hookWin();decorate()}catch(e){ERR('tick ui',e)}},300);
/* ======================== slots (template: scythe / knuckle slot module): own map 'lanternfall_hammerSlots_v1'; while riding, slots 1 / 2 / 3 = the robot skills ======================== */
const SLOT_K=['1','2','3','4','5','6','q','e','r','f'];
const SS=RB.slots={map:{},assign:null,err:null};
try{SS.map=JSON.parse(localStorage.getItem('lanternfall_hammerSlots_v1')||'{}')||{}}catch(_){SS.map={}}
const SKEYS=['hm_robot'];if(!/[?&]hammersk=off\b/.test(Q))SKEYS.push('hm_smash','hm_armor','hm_lube','hm_turret','hm_repair','hm_dolls','hm_trap','hm_upg','hm_suit');for(const i in SS.map)if(!SKEYS.includes(SS.map[i])||+i<0||+i>9)delete SS.map[i];
SS.save=()=>{try{localStorage.setItem('lanternfall_hammerSlots_v1',JSON.stringify(SS.map))}catch(_){}};
SS.find=k=>{for(const i in SS.map)if(SS.map[i]===k)return +i;return -1};
const RBS={rb_jump:{k:'rb_jump',name:'กระโดดทุบ',icon:()=>ICO.jump,cdId:IDS.jump,cost:()=>({mp:0,cd:(R&&R.kn)?KC.JUMP_CD:C.JUMP_CD}),start:()=>useSkill('jump')},
  rb_sweep:{k:'rb_sweep',name:'พ่นไอน้ำส่าย',icon:()=>ICO.sweep,cdId:IDS.sweep,cost:()=>({mp:0,cd:(R&&R.kn)?KC.GAT_CD:C.SW_CD}),start:()=>useSkill('sweep')},
  rb_rocket:{k:'rb_rocket',name:'จรวดจากหลัง',icon:()=>ICO.rocket,cdId:IDS.rocket,cost:()=>({mp:0,cd:KC.RK_CD}),start:()=>useSkill('rocket')},rb_hammer:{k:'rb_hammer',name:'ค้อนสายฟ้า',icon:()=>ICO.hammer,cdId:IDS.hammer,cost:()=>({mp:0,cd:KC.TH_CD}),start:()=>useSkill('hammer')},rb_eject:{k:'rb_eject',name:'ดีดตัวออก + ระเบิด',icon:()=>ICO.eject,cdId:'rbEject',cost:()=>({mp:0,cd:1}),start:()=>useSkill('eject')}};
const RMAP3={0:'rb_jump',1:'rb_sweep',2:'rb_eject'},RMAP5={0:'rb_jump',1:'rb_sweep',2:'rb_rocket',3:'rb_hammer',4:'rb_eject'};
const riding=()=>!!(R&&!R.auto&&(R.ph==='ride'||R.ph==='mount'));
const curMap=()=>riding()?((R&&R.kn)?RMAP5:RMAP3):SS.map;
const entOf=k=>RBS[k]||(()=>{try{for(const c of __WSK.lines.hammer.cols)for(const s of c.skills)if(s.k===k)return s}catch(_){}return null})();
const eq=()=>!!(window.__WSK&&__WSK.public&&held());
const unl=ent=>{try{if(!ent)return false;if(RBS[ent.k])return !!(R&&R.ph==='ride'&&!R.sub);return ent.ok()&&open(ent.k)}catch(_){return false}};
let msgEl=null;function say(t,ms){msgEl=msgEl||document.getElementById('wsAssignMsg');if(!msgEl)return;msgEl.textContent=t;msgEl.style.display='block';clearTimeout(say.t);if(ms)say.t=setTimeout(()=>{msgEl.style.display='none'},ms)}
SS.start=k=>{SS.assign=k;document.body.classList.add('wsAssign');document.body.classList.add('wsAsNoR');const e=entOf(k);say('แตะช่องสกิลที่ต้องการวาง "'+(e?e.name:k)+'" · แตะนอกช่องเพื่อยกเลิก',0)};
SS.stop=()=>{SS.assign=null;document.body.classList.remove('wsAssign','wsAsNoR');if(msgEl)msgEl.style.display='none'};
SS.set=(i,k)=>{const o=SS.find(k);if(o>=0)delete SS.map[o];SS.map[i]=k;SS.save();repaint(true);return true};
SS.clear=i=>{delete SS.map[i];SS.save();repaint(true)};
SS.use=k=>{const e=entOf(k);if(!e)return false;if(!eq()||!playing())return false;if(!unl(e)){if(!RBS[k])toast('ยังไม่ปลดล็อก');return false}try{return !!e.start()}catch(er){SS.err='use '+er.message;return false}};
try{const win=document.getElementById('wWpnSk');if(win)win.addEventListener('click',e=>{if(!eq()||!e.target.closest('#wskAs'))return;
  const sel=win.querySelector('.row.sel'),kk=sel&&sel.dataset.k;if(!kk||!SKEYS.includes(kk))return;const en=entOf(kk);if(!en||en.type!=='active'||!unl(en))return;
  e.stopImmediatePropagation();e.preventDefault();try{if(G.win==='wWpnSk')closeWin()}catch(_){}SS.start(kk)},true)}catch(e){ERR('assign',e)}
setInterval(()=>{try{const as=document.getElementById('wskAs');if(!as||!eq()||!(window.__WSK&&__WSK.open))return;const sel=document.querySelector('#wWpnSk .row.sel'),kk=sel&&sel.dataset.k;
  if(kk&&SKEYS.includes(kk)){const at=SS.find(kk),t=at>=0?'ช่อง '+SLOT_K[at].toUpperCase()+' · ย้าย':'ใส่ช่องสกิล';if(as.textContent!==t)as.textContent=t}}catch(_){}},250);
const slotEl=e=>e.target&&e.target.closest&&e.target.closest('#bar .slot[data-i]:not(.pot),#tSkills .tsk[data-ti]');
const slIdx=el=>+(el.dataset.i!==undefined?el.dataset.i:el.dataset.ti);
for(const ev of ['pointerdown','click','contextmenu'])addEventListener(ev,e=>{try{
  if(SS.assign){if(ev==='contextmenu')return;e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();if(ev==='pointerdown')return;const el=slotEl(e);if(el){if(SS.set(slIdx(el),SS.assign))SS.stop()}else SS.stop();return}
  const el=slotEl(e);if(!el||!el.dataset.hmk||!eq())return;
  if(ev==='contextmenu'){e.preventDefault();e.stopImmediatePropagation();if(!riding())SS.clear(slIdx(el));return}
  e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();
  if(ev==='pointerdown'){SS.use(el.dataset.hmk);if(el.classList.contains('tsk')){el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),350)}}
}catch(er){SS.err='slot '+er.message}},true);
addEventListener('keydown',e=>{try{if(e.key==='Escape'&&SS.assign){SS.stop();return}
  if(!eq()||(window.__WSK&&__WSK.open)||G.win||G.state!=='play'||e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;const k=(e.key||'').toLowerCase(),i=SLOT_K.indexOf(k);if(i<0)return;const s=curMap()[i];if(!s)return;
  if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))return;e.stopImmediatePropagation();e.preventDefault();SS.use(s)}catch(er){SS.err='slot key '+er.message}},true);
function paint(el,k){if(el.dataset.hmk===k)return;const en=entOf(k);if(!en)return;const im=en.icon(),ki=el.querySelector('kbd'),kt=ki?ki.textContent:'';
  el.innerHTML=(im?'<img alt="'+en.name+'" src="'+im+'">':'<div class="wstx">'+en.name+'</div>')+'<div class="cd"></div><div class="cdt"></div>'+(kt?'<kbd>'+kt+'</kbd>':'');
  el.classList.add('wsk');if(k==='rb_sweep')el.style.touchAction='none';el.dataset.hmk=k;el.dataset.scs=k;delete el.dataset.ws;delete el.dataset.bs;delete el.dataset.ss;delete el.dataset.dgs;if(el.classList.contains('tsk'))el.setAttribute('data-sk','scs:'+k);else el.removeAttribute('data-sk');el.removeAttribute('draggable');el.title=en.name}
let wasOn=false,sigS='';
function repaint(force){const on=eq();
  if(!on){if(wasOn){wasOn=false;sigS='';for(const el of document.querySelectorAll('[data-hmk]')){delete el.dataset.hmk;delete el.dataset.scs;el.classList.remove('wsk')}try{buildBar()}catch(_){}try{if(typeof buildTouchSkills==='function')buildTouchSkills()}catch(_){}}return}
  const s=JSON.stringify(curMap());if(force||!wasOn||s!==sigS){wasOn=true;sigS=s;try{buildBar()}catch(_){}try{if(typeof buildTouchSkills==='function')buildTouchSkills()}catch(_){}}
  const M=curMap();for(const el of document.querySelectorAll('#bar .slot[data-i],#tSkills .tsk[data-ti]')){const k=M[slIdx(el)];if(k)paint(el,k)}}
function paintAll(){try{if(eq()){const M=curMap();for(const el of document.querySelectorAll('#bar .slot[data-i],#tSkills .tsk[data-ti]')){const k=M[slIdx(el)];if(k)paint(el,k)}}}catch(_){}}
try{const _bb=buildBar;buildBar=function(){const r=_bb.apply(this,arguments);paintAll();return r}}catch(e){ERR('bar hook',e)}
try{const _bt=buildTouchSkills;buildTouchSkills=function(){const r=_bt.apply(this,arguments);paintAll();return r}}catch(e){ERR('touch hook',e)}
setInterval(()=>{try{if(SS.assign&&(G.win||G.state!=='play'))SS.stop();repaint(false);if(!eq())return;
  for(const el of document.querySelectorAll('.slot.wsk[data-hmk],.tsk.wsk[data-hmk]')){const k=el.dataset.hmk,en=entOf(k);if(!en)continue;const ok=unl(en);el.classList.toggle('wsoff',!ok);
    let c=null;try{c=en.cost()}catch(_){}const cd=(P.cds&&P.cds[en.cdId])||0,cdE=el.querySelector('.cd'),tE=el.querySelector('.cdt');
    if(cdE)cdE.style.setProperty('--cd',c&&c.cd>0&&cd>0?Math.min(1,cd/c.cd):0);if(tE)tE.textContent=cd>0?(cd>=10?String(Math.ceil(cd)):cd.toFixed(1)):'';el.classList.toggle('nomp',!!(c&&P.mp<c.mp))}
}catch(e){SS.err='slot tick '+e.message}},120);
/* GM: ?robot=give gives the hammer once */
let gave=false;setInterval(()=>{try{if(GIVE&&!gave&&typeof P!=='undefined'&&P&&G.state==='play'&&!G.fade&&window.HAMMER&&HAMMER.give){gave=true;HAMMER.give()}}catch(_){}},1500);
RB.state=()=>({err:RB.err,registered,lv:RB.lv,free:free(),total:total(),spent:spent(),map:SS.map,kn:!!(R&&R.kn),auto:!!(R&&R.auto),ph:R&&R.ph,sub:R&&R.sub&&R.sub.k,hpR:R&&Math.round(R.hpR),hpMax:R&&Math.round(R.hpMax),casts:RB.casts,hits:RB.hits,dmg:Math.round(RB.dmg),fxMs:+(RB.fxMs/Math.max(1,RB.fxN)).toFixed(3)});
console.info('[ROBOT] robot-r1 ready');
})();
