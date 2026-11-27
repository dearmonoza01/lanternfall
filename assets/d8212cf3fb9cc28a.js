
/* sword_combo_r11 fx_sword_r11_demo.js (fire waves, dagger-sized, DeaRz 16:09) wrapped: SW3FX */
(function(){ var U=window.PUPPET, cx=null, TL=null, HX=0, HY=0, SC=0.1485, ASPD=0, HEEL=250;
function rnd(s){ var x=Math.sin(s*127.1+311.7)*43758.5453; return x-Math.floor(x); }
function bpts(p,hand){ var W=U.solve(p), M=W.sword, gy=U.footY(W), X=HX-(p.lunge||0)*SC, Y=HY-(p.air||0)*SC;
  function f(pt){ var ax=M[0]*pt[0]+M[2]*pt[1]+M[4], ay=M[1]*pt[0]+M[3]*pt[1]+M[5]; return [X-ax*SC, Y+(ay-gy)*SC]; } return {tip:f([69,6]),heel:f([72,HEEL])}; }
function locate(t){ for(var i=0;i<TL.clicks.length;i++){ var c=TL.clicks[i]; if(t>=c.t0&&t<c.t1) return c; } return null; }
// ---- One-hand SWORD 3-click combo FX, Art r1 POWERFUL (12 Nov 2026, DeaRz 15:35 "ได้แต่ขอเอฟเฟกทรงพลังกว่านี้หน่อย").
// Drop-in for the page_tpl.html block "// ---- temporary FX" .. end of drawDash (same names; keyed off SWC trails / TL hits, no fixed times).
// Look: the approved r30 sword wave palette (fire): ink #5a1208, deep #E8240C, mid #FF7A1E, hot #FFC04A, core #FFF4CC, glow #FF4A1A.
// ONE bold crescent wave per hit (no stacked blades / echo lines), smooth gradient path (no sliced strips), layers grow in and fade out,
// no flying projectiles, dimmed when ASPD stacks hits. Smash = vertical fire slash + ground shock rings + rock chunks + soft flash.
var COL={core:'255,244,204',hot:'255,192,74',mid:'255,122,30',deep:'232,36,12',glow:'255,74,26',ink:'90,18,8',ash:'60,40,34',dust:'150,120,84'};
function A(a){ return Math.max(0,Math.min(1,a)); }
function eo(x){ x=A(x); return 1-(1-x)*(1-x)*(1-x); }
var SWW=1.8; // r3 DeaRz 15:47 'คลื่นดาบใหญ่เกินไป' + 15:48 'เท่ามีดสั้นมั้ย': measured on screen, 1.8 = about the dagger crescent size (Art r1 was 2.7)      // slash wave scale about its own origin (DeaRz wants powerful; dagger waves are 2.5x)
var SWW_S=1.25;    // stab cone scale
var SWW_M=1.2;    // smash scale
// r4 DeaRz 15:50 'ปรับคลื่นดาบให้พุ่งไปข้างหน้าทั้งหมด': every sword wave flies forward. FLYD = travel in screen px (game view) over the wave life; hits land when the wave reaches the monster.
var FLYD={slash:90,stab:90,smash:80}; // r5 DeaRz 15:53 'ไกลไป ลดลงมาให้เหลือข้างหน้านิดเดียวพอ' (r4 was 330/330/300)
function FWD(type,dt,D){ return FLYD[type]*eo(dt/D); }
function SCL(x,y,w){ cx.translate(x,y); cx.scale(w,w); cx.translate(-x,-y); }
function DIM(){ return (typeof ASPD!=='undefined'&&ASPD>=4)?0.72:1; }
function glow(x,y,r,col,a){ if(r<=0||a<=0) return; var g=cx.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,'rgba('+col+','+A(a)+')'); g.addColorStop(1,'rgba('+col+',0)'); cx.fillStyle=g; cx.beginPath(); cx.arc(x,y,r,0,6.2832); cx.fill(); }
function NB(col){ return col===COL.ink||col===COL.ash||col===COL.dust; } // dark colours paint normally so they read on sand
function sparkLine(x,y,a,r0,r1,col,al,w){ cx.strokeStyle='rgba('+col+','+A(al)+')'; cx.lineWidth=w; cx.lineCap='round'; cx.beginPath(); cx.moveTo(x+Math.cos(a)*r0,y+Math.sin(a)*r0); cx.lineTo(x+Math.cos(a)*r1,y+Math.sin(a)*r1); cx.stroke(); }
function ring(x,y,rx,ry,w,col,a){ if(a<=0||w<=0) return; var gc=cx.globalCompositeOperation; if(NB(col)) cx.globalCompositeOperation='source-over'; cx.strokeStyle='rgba('+col+','+A(a)+')'; cx.lineWidth=w; cx.beginPath(); cx.ellipse(x,y,Math.max(1,rx),Math.max(1,ry),0,0,6.2832); cx.stroke(); cx.globalCompositeOperation=gc; }
function blade(x0,y0,x1,y1,w,col,a){ if(a<=0) return; var dx=x1-x0, dy=y1-y0, L=Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L, gc=cx.globalCompositeOperation; if(NB(col)) cx.globalCompositeOperation='source-over';
  cx.fillStyle='rgba('+col+','+A(a)+')'; cx.beginPath(); cx.moveTo(x0,y0); cx.quadraticCurveTo(x0+dx*0.55+nx*w,y0+dy*0.55+ny*w,x1,y1); cx.quadraticCurveTo(x0+dx*0.55-nx*w*0.35,y0+dy*0.55-ny*w*0.35,x0,y0); cx.fill(); cx.globalCompositeOperation=gc; }
function smoke(x,y,r,a){ if(a<=0) return; var gc=cx.globalCompositeOperation; cx.globalCompositeOperation='source-over';
  var g=cx.createRadialGradient(x,y-r*0.2,0,x,y,r); g.addColorStop(0,'rgba(110,40,20,'+A(a)+')'); g.addColorStop(0.6,'rgba(60,28,20,'+A(a*0.7)+')'); g.addColorStop(1,'rgba(60,28,20,0)'); cx.fillStyle=g; cx.beginPath(); cx.arc(x,y,r,0,6.2832); cx.fill();
  cx.globalCompositeOperation=gc; }
function ember(x,y,s,a){ if(a<=0) return; glow(x,y,s*2.6,COL.deep,a*0.5); cx.fillStyle='rgba('+COL.hot+','+A(a)+')'; cx.fillRect(x-s*0.5,y-s*0.5,s,s); }

// BLADE RIBBON: tapered ribbon (ink smoke under, red, orange, hot leading edge) + embers shed along the tip path + hot glint at the tip
function drawTrails(t){ var c=locate(t); if(!c) return; var dc=SWC[c.n], tc=(t-c.t0)*c.f, dim=DIM();
  dc.trails.forEach(function(tr,ti){ if(tc<tr[1]||tc>tr[2]+0.3) return;
    function sample(lag,len){ var a1=Math.min(tc-lag,tr[2]), a0=Math.max(tr[1],a1-len); if(a1<=a0) return null; var S=[]; for(var i=0;i<=8;i++){ var s=a0+(a1-a0)*i/8, p=swPose(c.n,s/dc.dur); p.lunge+=c.root; S.push(bpts(p,tr[0])); } return S; }
    function ribbon(S,col,al,reach,lift){ var gc=cx.globalCompositeOperation; if(NB(col)) cx.globalCompositeOperation='source-over';
      for(var i=1;i<S.length;i++){ var u=i/(S.length-1), a=al*Math.pow(u,1.25); if(a<=0.01) continue; var r0=reach*(0.55+0.45*(i-1)/(S.length-1)), r1=reach*(0.55+0.45*u);
        var P=S[i-1], Q=S[i]; cx.fillStyle='rgba('+col+','+A(a)+')'; cx.beginPath(); cx.moveTo(P.tip[0],P.tip[1]-lift); cx.lineTo(Q.tip[0],Q.tip[1]-lift);
        cx.lineTo(Q.tip[0]+(Q.heel[0]-Q.tip[0])*r1,Q.tip[1]+(Q.heel[1]-Q.tip[1])*r1); cx.lineTo(P.tip[0]+(P.heel[0]-P.tip[0])*r0,P.tip[1]+(P.heel[1]-P.tip[1])*r0); cx.closePath(); cx.fill(); }
      cx.globalCompositeOperation=gc; }
    var fade=tc>tr[2]?1-(tc-tr[2])/0.12:1;
    cx.save(); cx.globalCompositeOperation='lighter';
    // embers left along the tip path, rising and cooling
    for(var j=0;j<8;j++){ var ps=tr[1]+(tr[2]-tr[1])*(j+0.5)/8, age=tc-ps; if(age<0||age>0.3) continue; var p=swPose(c.n,ps/dc.dur); p.lunge+=c.root; var b=bpts(p,tr[0]), k=age/0.3;
      ember(b.tip[0]+(rnd(ti*9+j)-0.5)*12,b.tip[1]-16*k-4*Math.sin(age*14+j),2.2*(1-0.5*k),0.85*(1-k)*dim); }
    if(fade>0){ var S=sample(0,0.1);
      if(S){ ribbon(S,COL.ink,0.4*fade*dim,0.85,-2); ribbon(S,COL.deep,0.8*fade*dim,0.7,0); ribbon(S,COL.mid,0.85*fade*dim,0.45,0); ribbon(S,COL.core,0.9*fade*dim,0.14,0);
        var T0=S[S.length-1].tip; glow(T0[0],T0[1],14,COL.hot,0.6*fade*dim);
        for(var g=0;g<3;g++){ var ga=rnd(Math.floor(tc*60)+g*5)*6.2832; sparkLine(T0[0],T0[1],ga,3,10+7*rnd(g+tc),COL.hot,0.75*fade*dim,1.3); } } }
    cx.restore(); }); }

// FIRE CRESCENT: ONE smooth crescent-moon path with gradient fill (deep red body, orange, hot rim, white-yellow edge). Sweeps in, lingers, drifts out, fades.
function fireWave(x,y,rx,ry,a0,span,w,rot,age,D,dim){
  var sweep=0.08, hd=eo(age/sweep), k=age/D, al=A(age/0.03)*(1-k*k)*dim, drift=12*eo(A((age-sweep)/0.3)); if(al<=0) return;
  var a=a0, b=a0+span*hd, R=rx+drift, hw=w*1.3*(1+0.25*k), n=40;
  function moon(th,lift,c0,c1,c2,alpha,mode){ var o=[],q=[],i; for(i=0;i<=n;i++){ var u=i/n, an=a+(b-a)*u, p=Math.pow(Math.sin(Math.PI*u),0.75)*(window.SWSYM===false?(0.55+0.45*u):1), t=th*p;
      o.push([Math.cos(an)*(R+t*0.55),Math.sin(an)*(R+t*0.55)]); q.push([Math.cos(an)*(R-t*0.45-lift*p),Math.sin(an)*(R-t*0.45-lift*p)]); }
    cx.globalCompositeOperation=mode; var g=cx.createRadialGradient(0,0,Math.max(1,R-th*0.5-lift),0,0,R+th*0.56);
    g.addColorStop(0,'rgba('+c0+','+A(alpha*0.25)+')'); g.addColorStop(0.45,'rgba('+c0+','+A(alpha*0.95)+')'); g.addColorStop(0.85,'rgba('+c1+','+A(alpha)+')'); g.addColorStop(0.97,'rgba('+c2+','+A(alpha)+')'); g.addColorStop(1,'rgba('+c2+',0)');
    cx.fillStyle=g; cx.beginPath(); cx.moveTo(o[0][0],o[0][1]); for(i=1;i<=n;i++) cx.lineTo(o[i][0],o[i][1]); for(i=n;i>=0;i--) cx.lineTo(q[i][0],q[i][1]); cx.closePath(); cx.fill(); }
  cx.save(); cx.translate(x,y); cx.rotate(rot||0); cx.scale(1,ry/rx);
  moon(hw*1.8,hw*0.3,'255,74,26','255,122,30','255,192,74',0.42*al,'lighter');          // soft outer heat glow
  moon(hw*1.25,hw*0.1,'60,10,4','110,20,8','150,30,10',0.22*al,'source-over'); /* r11 DeaRz 16:09 'เข้มน้อยลง': ink 0.55->0.22 */             // dark ink under-body so the fire reads on sand
  moon(hw,0,'150,18,6','235,60,16','255,170,60',0.62*al,'source-over'); /* r11: body 0.98->0.62 */                    // opaque fire body
  moon(hw*0.6,0,'255,150,40','255,222,140','255,250,220',0.95*al,'lighter');               // hot core + near-white rim
  cx.restore(); }

// HIT SHAPES at the blade. slash = one fire crescent + embers; stab = piercing flame cone + shock ring; smash = vertical fire slash + ground shock rings + rock chunks + flash
function drawHits(t){ var dim=DIM(); TL.hits.forEach(function(H){ var big=H.big, D=big?0.5:(H.type==='stab'?0.45:0.5) /* r9 DeaRz 16:04: click 3 wave must not linger, same as the others (was 0.95 s) */, dt=t-H.t; if(dt<0||dt>D) return; var k=dt/D, e=eo(k), gin=A(dt/0.03);
  cx.save(); cx.globalCompositeOperation='lighter';
  if(H.type==='slash'){ var cl=locate(H.t), cn=cl?cl.n:1, al=(1-k)*(1-k)*gin*dim, R=44+36*e, x=H.x+6, y=H.y+8;
    // r7 DeaRz 15:59 'ใช้ลายอื่นบ้าง ขอสัก3ลาย เฉียงบ้างนอนบ้าง': click 1 = DIAGONAL crescent (tilted 0.7 rad, follows the down-forward chop),
    // click 2 = LYING crescent (flat wide sweep, like a ground-plane arc), click 3 smash = UPRIGHT fire slash. All stay symmetric.
    var PAT=cn===2?'flat':'diag', rot=PAT==='diag'?0.7:0, a0=-1.15; y=HY-44; x=H.hx+34; // r8 DeaRz 16:02 'ไม่ตรงมันแฉลบออกข้าง': every slash wave starts at the hero's chest line in front of him (not at the low blade tip) and flies straight forward   // r6 DeaRz 15:56 'ทำไมคลื่นมันเบี้ยว': upright, symmetric crescent facing forward for every slash (was tilted per swing: c1 0.5 rad down, c2 -0.55 up)
    cx.save(); cx.translate(FWD('slash',dt,D),0); SCL(x-6,y-8,SWW);
    if(PAT==='flat') fireWave(x,y,R*1.15,R*0.38,a0,2.3,24,0,dt,D,dim); else { var rr=R*0.9; fireWave(x+rr*(1-Math.cos(rot)),y-rr*Math.sin(rot),rr,R*0.8,a0,2.3,24,rot,dt,D,dim); } // r8: tilt about the crescent's middle so it stays on the chest line
    glow(x,y,26*(0.5+e),COL.hot,al*0.45); glow(x,y,10,COL.core,al*0.55);
    for(var i=0;i<6;i++){ var pa=a0+0.3+i*0.4, ek=A((dt-0.03*i)/(D*0.8)); if(ek<=0||ek>=1) continue; ember(x+Math.cos(pa+rot)*R*(0.95+0.4*ek),y+Math.sin(pa+rot)*R*0.58*(0.95+0.4*ek)-18*ek,2.4*(1-ek*0.5),0.9*(1-ek)*dim); }
    cx.restore(); }
  else if(H.type==='stab'){ var al=(1-k)*(1-k)*gin*dim, x=H.x, y=H.y, L=80+90*e; cx.save(); cx.translate(FWD('stab',dt,D),0); SCL(x,y,SWW_S);
    blade(x-12,y,x+L,y,30*(1-0.5*k),COL.ink,al*0.45); blade(x-8,y,x+L*0.97,y,24*(1-0.4*k),COL.deep,al*0.92); blade(x-4,y,x+L*0.94,y,14*(1-0.4*k),COL.mid,al*0.95); blade(x,y,x+L*0.9,y,5,COL.core,al);
    for(var r=0;r<2;r++){ var kr=A((dt-r*0.05)/(D*0.75)); if(kr<=0) continue; var rx=x+20+L*0.85*eo(kr); ring(rx,y,6+8*kr,20+26*kr,5*(1-kr)+1,r?COL.hot:COL.mid,(1-kr)*(1-kr)*0.9*dim); }
    glow(x+L,y,22*(1-k)+8,COL.hot,al*0.75); glow(x+L,y,8,COL.core,al*0.8);
    for(var s=0;s<7;s++) sparkLine(x+L*0.9,y,(rnd(H.seed*5+s)-0.5)*1.6,5+34*e,12+46*e,s%2?COL.mid:COL.hot,al,1.5); cx.restore(); }
  else { // SMASH: vertical fire slash, ground shock rings, rock chunks, short soft flash, lingering embers
    var gx=H.hx+62, gy=HY+4, topY=HY-150, g=eo(A(dt/0.07)), al=(1-k)*(1-k)*gin, kk=A(dt/0.5);
    cx.save(); SCL(gx,gy,SWW_M);
    // vertical fire slash from above down to the ground (crescent opening toward the hero)
    cx.save(); cx.translate(FWD('smash',dt,D*0.7)/SWW_M,0); fireWave(gx-62,gy-72,118,118,-1.05,2.1,30,0,dt,D,1); cx.restore();
    // heat column + burst at the ground
    glow(gx,gy-20,90*(0.45+e),COL.glow,al*0.55); glow(gx,gy-6,40*(1-k)+14,COL.core,al*0.7);
    // ground shock rings (outer orange, inner hot) and a dark scorch ring under them
    for(var w=0;w<3;w++){ var kw=A((dt-w*0.07)/(D*0.55)); if(kw<=0||kw>=1) continue; var rr=26+170*eo(kw); ring(gx,gy,rr,rr*0.27,(w?7:11)*(1-kw)+1.5,w===0?COL.ink:(w===1?COL.mid:COL.hot),(1-kw)*(1-kw)*(w===0?0.4:0.95)); }
    // rock chunks + dust thrown up, falling back
    for(var j=0;j<11;j++){ var ja=Math.PI+(j+rnd(H.seed+j)*0.6)/11*Math.PI, sp=70+90*rnd(j+3), tt=Math.min(dt,0.55), jx=gx+Math.cos(ja)*sp*tt*1.5, jy=gy+Math.sin(ja)*sp*tt*1.1+330*tt*tt; if(jy>gy+3||dt>0.55) continue;
      cx.save(); cx.globalCompositeOperation='source-over'; cx.fillStyle='rgba(70,48,40,'+A(1-dt/0.55)+')'; cx.translate(jx,jy); cx.rotate(j+tt*9); cx.fillRect(-4,-3,8,6); cx.restore(); glow(jx,jy,5,COL.mid,0.5*(1-dt/0.55)); }
    for(var d=0;d<7;d++){ var da=Math.PI+(d+0.5)/7*Math.PI, dd=(26+80*rnd(d+9))*eo(A(dt/0.6)); smoke(gx+Math.cos(da)*dd*1.5,gy+Math.sin(da)*dd*0.45-8*k,12+18*eo(A(dt/0.6)),0.28*(1-k)); }
    // lingering embers rising until D
    for(var m=0;m<14;m++){ var st=0.06+m*0.025, am=dt-st; if(am<0) continue; var km=am/(D-st); if(km>=1) continue; var mx=gx+(rnd(m*5+H.seed)-0.5)*190+Math.sin(am*7+m)*7, my=gy-4-85*km; ember(mx,my,2.4+1.4*Math.sin(am*12+m),0.9*Math.sin(km*Math.PI)); }
    cx.restore();
    // short soft flash centred on the impact (screen-space, never whites out the hero: capped alpha, fades in 0.12 s)
    var fa=dt<0.12?0.22*(1-dt/0.12):0; if(fa>0){ var fg=cx.createRadialGradient(gx,gy-30,10,gx,gy-30,330); fg.addColorStop(0,'rgba(255,214,140,'+fa+')'); fg.addColorStop(1,'rgba(255,214,140,0)'); cx.fillStyle=fg; cx.fillRect(gx-340,gy-360,680,420); } }
  cx.restore(); }); }

// ON THE MONSTER: fire burst ring, shard sparks, embers; heavy adds a bigger blast and rock chips
function drawImpacts(t){ var dim=DIM(); TL.imp.forEach(function(o,i){ var H=o.heavy, D=H?0.55:0.3, dt=t-o.t; if(dt<0||dt>D) return; var k=dt/D, e=eo(k), al=(1-k)*(1-k)*A(dt/0.02)*(H?1:dim), x=o.x, y=o.y;
  cx.save(); cx.globalCompositeOperation='lighter';
  glow(x,y,(H?46:26)*(0.6+0.6*e),COL.glow,al*0.65); glow(x,y,(H?14:8),COL.core,al*0.7);
  var R=(H?12:7)+(H?58:30)*Math.sqrt(k); ring(x,y,R,R*0.85,(H?9:5)*(1-k)+1.5,COL.deep,al*0.7); ring(x,y,R*0.92,R*0.78,(H?5:3)*(1-k)+1,COL.hot,al);
  for(var j=0;j<(H?12:7);j++){ var a=j/(H?12:7)*6.2832+rnd(i*7+j)*0.5; sparkLine(x,y,a,(H?12:7)+e*(H?60:34),(H?12:7)+e*(H?60:34)+(H?18:10)*(1-k),j%3?COL.mid:COL.hot,al,(H?2.6:1.8)*(1-0.4*k)); }
  for(var d=0;d<(H?8:4);d++){ var dx=x+(rnd(i*3+d)-0.5)*(H?60:32), dy=y-e*(H?40:22)+60*k*k; ember(dx,dy,H?3:2.2,al*0.9); }
  if(H){ for(var p=0;p<5;p++){ var pa=rnd(i+p*7)*6.2832, pd=22+34*e; smoke(x+Math.cos(pa)*pd,y+Math.sin(pa)*pd*0.7,9+13*e,0.26*(1-k)); } }
  cx.restore(); }); }

// AFTERIMAGES: orange-red ghosts of the hero (real silhouettes, tinted) during the click-3 lunge (thrust) and the jump
var GHOSTC=null; function ghostCanvas(){ if(!GHOSTC){ GHOSTC=document.createElement('canvas'); GHOSTC.width=240; GHOSTC.height=260; } return GHOSTC; }
function drawDash(t){ var c=locate(t); if(!c||c.n!==3) return; var tc=(t-c.t0)*c.f, dc=SWC[3];
  var kA=(tc>=0.14&&tc<=0.34)?(tc<0.2?A((tc-0.14)/0.06):1-(tc-0.28)/0.06):0, kB=(tc>=0.48&&tc<=0.8)?(tc<0.56?A((tc-0.48)/0.08):1-(tc-0.7)/0.1):0, k=Math.max(A(kA),A(kB)); if(k<=0) return;
  var G=ghostCanvas(), g=G.getContext('2d');
  for(var i=3;i>=1;i--){ var s=Math.max(0.12,tc-i*0.045), p=swPose(3,s/dc.dur); p.lunge+=c.root; var x=HX-p.lunge*SC+(i%2?-4:4)*i*0.5, air=(p.air||0)*SC; p.lunge=0;
    g.setTransform(1,0,0,1,0,0); g.globalCompositeOperation='source-over'; g.clearRect(0,0,240,260); drawCombo(g,120,200,SC,1,p);
    g.globalCompositeOperation='source-in'; g.fillStyle=i===1?'rgb(255,122,30)':'rgb(232,36,12)'; g.fillRect(0,0,240,260);
    cx.save(); cx.globalAlpha=A(k*(0.4-i*0.09)); cx.drawImage(G,x-120,HY-200); cx.restore();
    cx.fillStyle='rgba(90,30,10,'+A(0.15*k*(1-i/4))+')'; cx.beginPath(); cx.ellipse(x,HY+3,22,6,0,0,6.2832); cx.fill(); } }


function arrive(type,rel){ var L={slash:0.5,stab:0.45,smash:0.5*0.7}[type], f=Math.max(0,Math.min(0.999,(rel-30)/FLYD[type])); return L*(1-Math.pow(1-f,1/3)); }
window.SW3FX={set:function(o){cx=o.cx;TL=o.TL;HX=o.HX;HY=o.HY;SC=o.SC;ASPD=o.ASPD;HEEL=o.HEEL||250;},drawTrails:drawTrails,drawHits:drawHits,drawImpacts:drawImpacts,drawDash:drawDash,arrive:arrive,ver:'sword_fx_r11_demo'};
})();
