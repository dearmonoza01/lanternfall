
/* dagger_waves_r4 fx_dagger_art_r4_moon.js (Art, crescent-moon waves, DeaRz 09:47) + dagger_smoke_r4.js inside the scope, wrapped: DG3FX_r4 (DGCRACK_ON off, DGSMOKE_ON on, DGPAINT_ON off); r22 cost-cap hooks (window.DG3CAP: ghosts 2, ribbon samples 4, wave path 24 pts, puffs 3, cross smoke 6 / 3, slash smoke 1) */
(function(){ var U=window.PUPPET, cx=null, TL=null, HX=0, HY=0, SC=0.1485, ASPD=0;
function rnd(s){ var x=Math.sin(s*127.1+311.7)*43758.5453; return x-Math.floor(x); }
var BL={n:{m:'sword',tip:[60,6],heel:[45,150]},f:{m:'offhand',tip:[9,6],heel:[36,150]}};
function bpts(p,hand){ var W=U.solve(p), b=BL[hand], M=W[b.m], gy=U.footY(W), X=HX-(p.lunge||0)*SC, Y=HY-(p.air||0)*SC;
  function f(pt){ var ax=M[0]*pt[0]+M[2]*pt[1]+M[4], ay=M[1]*pt[0]+M[3]*pt[1]+M[5]; return [X-ax*SC, Y+(ay-gy)*SC]; } return {tip:f(b.tip),heel:f(b.heel)}; }
function locate(t){ for(var i=0;i<TL.clicks.length;i++){ var c=TL.clicks[i]; if(t>=c.t0&&t<c.t1) return c; } return null; }
// ---- Twin dagger 3-click combo FX, Art r1 GRAND (12 Nov 2026, DeaRz 07:46 "ขอเอฟเฟกอลังการกว่านี้หน่อย").
// Drop-in for the page_tpl.html block "// ---- temporary FX" .. end of drawDash (same names; keyed off DGC trails/hitT via TL, no fixed times).
// Look: shadow smoke (#24123a -> #4a2470, highlight #7a4fb0) painted normally under additive violet/white edges, toxic green #9cff3c accents.
// Layers grow in and fade out; no flying waves; per-tick dimming at high ASPD; afterimage hero ghosts during the click-3 flurry.
var COL={core:'255,255,255',vio:'176,128,255',hi:'122,79,176',deep:'74,36,112',ink:'36,18,58',tox:'156,255,60',toxd:'60,140,20'};
function A(a){ return Math.max(0,Math.min(1,a)); }
function eo(x){ x=A(x); return 1-(1-x)*(1-x)*(1-x); }
var DGW=2.5; // DeaRz 07:54: waves from the daggers 2.5x (scaled about each wave's own origin; line widths scale too)
var DGW_X=1.4; // DeaRz 07:55 "ตอนกากาบาทใหญ่เกิน": the cross finisher only 1.4x
function SCL(x,y,w){ w=w||window.DGFXW||DGW; cx.translate(x,y); cx.scale(w,w); cx.translate(-x,-y); }
function DIM(){ return (typeof ASPD!=='undefined'&&ASPD>=4)?0.72:1; }
function glow(x,y,r,col,a){ if(r<=0||a<=0) return; var g=cx.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,'rgba('+col+','+A(a)+')'); g.addColorStop(1,'rgba('+col+',0)'); cx.fillStyle=g; cx.beginPath(); cx.arc(x,y,r,0,6.2832); cx.fill(); }
function NB(col){ return col===COL.ink||col===COL.deep||col===COL.toxd; } // dark colours paint normally so they read on sand
function crescent(x,y,rx,ry,a0,a1,w,col,a,rot){ if(a<=0||w<=0) return; var n=16, o=[], q=[], gc=cx.globalCompositeOperation; if(NB(col)) cx.globalCompositeOperation='source-over';
  cx.save(); cx.translate(x,y); if(rot) cx.rotate(rot);
  for(var i=0;i<=n;i++){ var u=i/n, an=a0+(a1-a0)*u, k=Math.pow(Math.sin(Math.PI*u),0.8)*(0.35+0.65*u), ww=w*k; o.push([Math.cos(an)*(rx+ww/2),Math.sin(an)*(ry+ww/2)]); q.push([Math.cos(an)*(rx-ww/2),Math.sin(an)*(ry-ww/2)]); }
  cx.fillStyle='rgba('+col+','+A(a)+')'; cx.beginPath(); cx.moveTo(o[0][0],o[0][1]); for(i=1;i<=n;i++) cx.lineTo(o[i][0],o[i][1]); for(i=n;i>=0;i--) cx.lineTo(q[i][0],q[i][1]); cx.closePath(); cx.fill(); cx.restore(); cx.globalCompositeOperation=gc; }
function blade(x0,y0,x1,y1,w,col,a){ if(a<=0) return; var dx=x1-x0, dy=y1-y0, L=Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L, gc=cx.globalCompositeOperation; if(NB(col)) cx.globalCompositeOperation='source-over';
  cx.fillStyle='rgba('+col+','+A(a)+')'; cx.beginPath(); cx.moveTo(x0,y0); cx.quadraticCurveTo(x0+dx*0.55+nx*w,y0+dy*0.55+ny*w,x1,y1); cx.quadraticCurveTo(x0+dx*0.55-nx*w*0.35,y0+dy*0.55-ny*w*0.35,x0,y0); cx.fill(); cx.globalCompositeOperation=gc; }
function puff(x,y,r,a){ if(a<=0) return; var gc=cx.globalCompositeOperation; cx.globalCompositeOperation='source-over';
  var g=cx.createRadialGradient(x,y-r*0.2,0,x,y,r); g.addColorStop(0,'rgba(74,36,112,'+A(a)+')'); g.addColorStop(0.6,'rgba(36,18,58,'+A(a*0.7)+')'); g.addColorStop(1,'rgba(36,18,58,0)'); cx.fillStyle=g; cx.beginPath(); cx.arc(x,y,r,0,6.2832); cx.fill();
  cx.globalCompositeOperation=gc; }
function sparkLine(x,y,a,r0,r1,col,al,w){ cx.strokeStyle='rgba('+col+','+A(al)+')'; cx.lineWidth=w; cx.lineCap='round'; cx.beginPath(); cx.moveTo(x+Math.cos(a)*r0,y+Math.sin(a)*r0); cx.lineTo(x+Math.cos(a)*r1,y+Math.sin(a)*r1); cx.stroke(); }

// BLADE RIBBONS: tapered ribbon (ink smoke under, violet, white leading edge) + 2 afterimage ribbons + smoke puffs left along the tip path + toxic glints
function drawTrails(t){ var c=locate(t); if(!c) return; var dc=DGC[c.n], tc=(t-c.t0)*c.f, dim=DIM();
  dc.trails.forEach(function(tr,ti){ if(tc<tr[1]||tc>tr[2]+0.3) return;
    function sample(lag,len){ var a1=Math.min(tc-lag,tr[2]), a0=Math.max(tr[1],a1-len); if(a1<=a0) return null; var S=[]; var NS=window.DG3CAP?4:8; for(var i=0;i<=NS;i++){ var s=a0+(a1-a0)*i/NS, p=dgPose(c.n,s/dc.dur); p.lunge+=c.root; S.push(bpts(p,tr[0])); } return S; }
    function ribbon(S,col,al,reach,lift){ var gc=cx.globalCompositeOperation; if(NB(col)) cx.globalCompositeOperation='source-over';
      for(var i=1;i<S.length;i++){ var u=i/(S.length-1), a=al*Math.pow(u,1.3); if(a<=0.01) continue; var r0=reach*(0.6+0.4*(i-1)/(S.length-1)), r1=reach*(0.6+0.4*u);
        var P=S[i-1], Q=S[i]; cx.fillStyle='rgba('+col+','+A(a)+')'; cx.beginPath(); cx.moveTo(P.tip[0],P.tip[1]-lift); cx.lineTo(Q.tip[0],Q.tip[1]-lift);
        cx.lineTo(Q.tip[0]+(Q.heel[0]-Q.tip[0])*r1,Q.tip[1]+(Q.heel[1]-Q.tip[1])*r1); cx.lineTo(P.tip[0]+(P.heel[0]-P.tip[0])*r0,P.tip[1]+(P.heel[1]-P.tip[1])*r0); cx.closePath(); cx.fill(); }
      cx.globalCompositeOperation=gc; }
    var fade=tc>tr[2]?1-(tc-tr[2])/0.12:1;
    cx.save(); cx.globalCompositeOperation='lighter';
    // smoke puffs along the tip path, lingering after the swing
    var NJ=window.DG3CAP?3:6; for(var j=0;j<NJ;j++){ var ps=tr[1]+(tr[2]-tr[1])*(j+0.5)/NJ, age=tc-ps; if(age<0||age>0.3) continue; var p=dgPose(c.n,ps/dc.dur); p.lunge+=c.root; var b=bpts(p,tr[0]), k=age/0.3;
      puff(b.tip[0]+(rnd(ti*9+j)-0.5)*10,b.tip[1]-10*k,5+12*eo(k),0.35*(1-k)*dim); }
    if(fade>0){ var S=sample(0,0.1);
      if(S){ 
        /* r3 (DeaRz 09:40, like the scythe): echo ribbons removed, one trail only */
        ribbon(S,COL.ink,0.45*fade*dim,0.8,-2); ribbon(S,COL.vio,0.75*fade*dim,0.6,0); ribbon(S,COL.core,0.85*fade*dim,0.16,0);
        var T0=S[S.length-1].tip; glow(T0[0],T0[1],10,COL.tox,0.55*fade*dim);
        for(var g=0;g<3;g++){ var ga=rnd(Math.floor(tc*60)+g*5)*6.2832; sparkLine(T0[0],T0[1],ga,3,9+6*rnd(g+tc),COL.tox,0.7*fade*dim,1.2); } } }
    cx.restore(); }); }

// SWORD WAVE (DeaRz 07:56 "ใส่คลื่นดาบที่ใช้กับเคียวได้เลย"): same streak crescent as the approved r30 sword wave / scythe waves,
// 5 side-by-side streaks + soft glow, colour ramp tail->head, sweeps in, lingers and drifts outward, then fades. Dagger palette.
var DP={glow:[122,79,176],deep:[74,36,112],mid:[176,128,255],hot:[214,170,255],core:[246,255,226],tox:[156,255,60]};
var DSTR=[[0,2.0,['mid','hot','core'],1,0]]; // r3 DeaRz 09:40: ONE wide wave (was 5 side-by-side streaks)
function dmix(a,b,t){ return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]; }
function dramp(u,cols){ var n=cols.length-1, x=Math.min(0.9999,Math.max(0,u))*n, i=Math.floor(x); return dmix(DP[cols[i]],DP[cols[Math.min(n,i+1)]],x-i); }
function swordWave(x,y,rx,ry,a0,span,w,rot,age,D,dim){ /* r4 DeaRz 09:44 "เอาเส้นๆออก วาดเป็นพระจันทร์เสี้ยว": ONE smooth crescent-moon path, gradient fill, no slices = no lines */
  var sweep=0.08, hd=eo(age/sweep), k=age/D, al=A(age/0.03)*(1-k*k)*dim, drift=10*eo(A((age-sweep)/0.3)); if(al<=0) return;
  var a=a0, b=a0+span*hd, R=rx+drift, hw=w*1.25*(1+0.25*k), n=(window.DG3CAP?24:40);
  function moon(th,lift,col0,col1,col2,alpha,mode){ var o=[],q=[],i; for(i=0;i<=n;i++){ var u=i/n, an=a+(b-a)*u, p=Math.pow(Math.sin(Math.PI*u),0.75)*(0.55+0.45*u), t=th*p;
      o.push([Math.cos(an)*(R+t*0.55),Math.sin(an)*(R+t*0.55)]); q.push([Math.cos(an)*(R-t*0.45-lift*p),Math.sin(an)*(R-t*0.45-lift*p)]); }
    cx.globalCompositeOperation=mode; var g=cx.createRadialGradient(0,0,Math.max(1,R-th*0.5-lift),0,0,R+th*0.56);
    g.addColorStop(0,'rgba('+col0+','+A(alpha*0.25)+')'); g.addColorStop(0.45,'rgba('+col0+','+A(alpha*0.95)+')'); g.addColorStop(0.85,'rgba('+col1+','+A(alpha)+')'); g.addColorStop(0.97,'rgba('+col2+','+A(alpha)+')'); g.addColorStop(1,'rgba('+col2+',0)');
    cx.fillStyle=g; cx.beginPath(); cx.moveTo(o[0][0],o[0][1]); for(i=1;i<=n;i++) cx.lineTo(o[i][0],o[i][1]); for(i=n;i>=0;i--) cx.lineTo(q[i][0],q[i][1]); cx.closePath(); cx.fill(); }
  cx.save(); cx.translate(x,y); cx.rotate(rot||0); cx.scale(1,ry/rx);
  moon(hw*1.7,hw*0.3,'122,79,176','150,95,235','176,128,255',0.4*al,'lighter');
  moon(hw,0,'74,36,112','150,95,235','214,170,255',0.95*al,'source-over'); /* r4c DeaRz 09:45 as strong as the X */
  moon(hw*0.6,0,'176,128,255','230,200,255','255,255,255',0.95*al,'lighter');
  cx.restore(); }

// HIT SHAPES at the blade: slash = 3 layered crescents + smoke; stab = piercing cone + travelling shock rings; cross = big X finisher
function drawHits(t){ var dim=DIM(); TL.hits.forEach(function(H){ var big=H.big, D=big?0.95:(H.type==='stab'?0.32:0.34), dt=t-H.t; if(dt<0||dt>D) return; var k=dt/D, e=eo(k), gin=A(dt/0.03);
  cx.save(); cx.globalCompositeOperation='lighter';
  if(H.type==='slash'){ var al=(1-k)*(1-k)*gin*dim, a0=-1.1+rnd(H.seed)*0.5, R=40+34*e, x=H.x+6, y=H.y+8, rot=(H.seed%2?0.35:-0.35); cx.save(); SCL(x-6,y-8);
    swordWave(x,y,R*0.9,R*0.55,a0,2.2,16,rot,dt,D,dim); for(var i=0;i<4;i++){ var pa=a0+0.4+i*0.45; puff(x+Math.cos(pa+rot)*R*0.95,y+Math.sin(pa+rot)*R*0.58-14*e,6+12*e,0.35*(1-k)*dim); } cx.restore(); }
  else if(H.type==='stab'){ var al=(1-k)*(1-k)*gin*dim, x=H.x, y=H.y, L=70+90*e; cx.save(); SCL(x,y);
    blade(x-10,y,x+L,y,18*(1-0.5*k),COL.ink,al*0.45); blade(x-6,y,x+L*0.95,y,11*(1-0.4*k),COL.vio,al*0.9); blade(x,y,x+L*0.9,y,3.5,COL.core,al);
    for(var r=0;r<1;r++){ var kr=A((dt-r*0.04)/(D*0.7)); if(kr<=0) continue; var rx=x+20+L*0.8*eo(kr); crescent(rx,y,6+6*kr,18+22*kr,-1.3,1.3,6*(1-kr)+1,r%2?COL.tox:COL.vio,(1-kr)*(1-kr)*0.9*dim); }
    glow(x+L,y,16*(1-k)+6,COL.tox,al*0.7); for(var s=0;s<5;s++) sparkLine(x+L*0.9,y,(rnd(H.seed*5+s)-0.5)*1.4,4+30*e,10+40*e,s%2?COL.vio:COL.tox,al,1.4); cx.restore(); }
  else { // CROSS finisher: big X of layered slash bands, shadow smoke burst, ground cracks + poison splash ring, toxic motes rising
    var x=H.hx+66, y=HY-44, s=72+26*e, al=(1-k)*(1-k)*gin, kx=A(dt/0.09), ks=A((dt-0.05)/0.09); cx.save(); SCL(H.hx+20,y,DGW_X);
    [[1,kx],[-1,ks]].forEach(function(d){ if(d[1]<=0) return; var g=eo(d[1]), ax=x-s*d[0]*g, ay=y-s, bx=x+s*d[0]*g, by=y+s*0.75;
      blade(ax,ay,bx,by,34*(1-0.4*k),COL.ink,al*0.55); blade(ax,ay,bx,by,22*(1-0.4*k),COL.vio,al*0.95); blade(ax+(bx-ax)*0.05,ay+(by-ay)*0.05,bx,by,8,COL.core,al); blade(ax,ay,bx,by,2,COL.tox,al*0.8); });
    glow(x,y,50*(0.5+e),COL.vio,al*0.45); glow(x,y,16*(1-k),COL.core,al*0.5);
    // shadow smoke burst
    for(var i=0;i<(window.DG3CAP?6:12);i++){ var a=i/12*6.2832+rnd(H.seed+i)*0.4, d=(30+70*rnd(i+3))*eo(A(dt/0.5)); puff(x+12+Math.cos(a)*d,y+Math.sin(a)*d*0.7-10*k,10+22*eo(A(dt/0.5)),0.3*(1-k)); }
    cx.restore();
    // ground cracks with violet glow + poison splash ring
    var gx=H.hx+45, gy=HY+4, ck=A(dt/0.08), ca=(1-k); cx.save(); SCL(H.hx+20,gy,DGW_X);
    cx.save(); cx.globalCompositeOperation='source-over'; cx.strokeStyle='rgba(36,18,58,'+A(0.7*ca)+')'; cx.lineWidth=3; cx.lineCap='round';
    for(var c2=0;c2<(window.DGCRACK_ON?7:0);c2++){ var ang=c2/7*6.2832+rnd(H.seed*3+c2), px=gx, py=gy; cx.beginPath(); cx.moveTo(px,py); for(var sgm=1;sgm<=4;sgm++){ var rr=sgm*26*ck, jit=(rnd(c2*11+sgm)-0.5)*0.5; px=gx+Math.cos(ang+jit)*rr; py=gy+Math.sin(ang+jit)*rr*0.28; cx.lineTo(px,py); } cx.stroke(); }
    cx.restore(); cx.strokeStyle='rgba('+COL.vio+','+A(0.6*ca)+')'; cx.lineWidth=1.2;
    for(c2=0;c2<(window.DGCRACK_ON?7:0);c2++){ var ang2=c2/7*6.2832+rnd(H.seed*3+c2); cx.beginPath(); cx.moveTo(gx,gy); for(sgm=1;sgm<=4;sgm++){ var rr2=sgm*26*ck, jit2=(rnd(c2*11+sgm)-0.5)*0.5; cx.lineTo(gx+Math.cos(ang2+jit2)*rr2,gy+Math.sin(ang2+jit2)*rr2*0.28); } cx.stroke(); }
    var kr=A(dt/0.5), R=30+120*eo(kr); crescent(gx,gy,R,R*0.27,0,6.2832,10*(1-kr)+2,COL.toxd,(1-kr)*0.55); crescent(gx,gy,R,R*0.27,0,6.2832,5*(1-kr)+1,COL.tox,(1-kr)*0.9);
    for(var dpl=0;dpl<10;dpl++){ var da=rnd(H.seed*7+dpl)*3.1416+3.1416, sp=80+80*rnd(dpl+9), tt=Math.min(dt,0.5), dx2=gx+Math.cos(da)*sp*tt*1.6, dy2=gy+Math.sin(da)*sp*tt*0.9+260*tt*tt; if(dy2>gy+4||dt>0.5) continue; glow(dx2,dy2,3.5,COL.tox,0.9*(1-dt/0.5)); }
    // lingering toxic motes rising (last until D)
    for(var m=0;m<10;m++){ var st=0.1+m*0.03, am=dt-st; if(am<0) continue; var km=am/(D-st); if(km>=1) continue; var mx=gx+(rnd(m*5)-0.5)*160+Math.sin(am*6+m)*6, my=gy-6-70*km; glow(mx,my,3+2*Math.sin(am*12+m),COL.tox,0.8*Math.sin(km*Math.PI)); } cx.restore(); }
  cx.restore(); }); }

// ON THE MONSTER: violet burst ring, shard sparks, toxic drops falling; heavy adds a poison bubble pop and smoke
function drawImpacts(t){ var dim=DIM(); TL.imp.forEach(function(o,i){ var H=o.heavy, D=H?0.5:0.28, dt=t-o.t; if(dt<0||dt>D) return; var k=dt/D, e=eo(k), al=(1-k)*(1-k)*A(dt/0.02)*(H?1:dim), x=o.x, y=o.y;
  cx.save(); cx.globalCompositeOperation='lighter';
  glow(x,y,(H?36:20)*(0.6+0.6*e),COL.vio,al*0.6); glow(x,y,(H?10:6),COL.core,al*0.6);
  var R=(H?10:6)+(H?50:26)*Math.sqrt(k); crescent(x,y,R,R,0,6.2832,(H?9:5)*(1-k)+1.5,COL.ink,al*0.4); crescent(x,y,R,R,0,3.1416,(H?6:3.5)*(1-k)+1,COL.vio,al); crescent(x,y,R,R,3.1416,6.2832,(H?6:3.5)*(1-k)+1,COL.tox,al*0.7);
  for(var j=0;j<(H?10:6);j++){ var a=j/(H?10:6)*6.2832+rnd(i*7+j)*0.5; sparkLine(x,y,a,(H?10:6)+e*(H?52:30),(H?10:6)+e*(H?52:30)+(H?16:9)*(1-k),j%3?COL.vio:COL.tox,al,(H?2.4:1.6)*(1-0.4*k)); }
  for(var d=0;d<(H?6:3);d++){ var dx=x+(rnd(i*3+d)-0.5)*(H?50:28), dy=y+e*(H?36:20)+90*k*k; glow(dx,dy,H?3.5:2.5,COL.tox,al*0.9); }
  if(H){ for(var p=0;p<5;p++){ var pa=rnd(i+p*7)*6.2832, pd=20+30*e; puff(x+Math.cos(pa)*pd,y+Math.sin(pa)*pd*0.7,8+12*e,0.3*(1-k)); }
    var bk=A((dt-0.12)/0.2); if(bk>0&&bk<1) crescent(x+12,y-14,6+10*bk,6+10*bk,0,6.2832,2.5*(1-bk)+0.5,COL.tox,(1-bk)); }
  cx.restore(); }); }

// CLICK 3 FLURRY + JUMP: violet afterimage ghosts of the hero (real silhouettes, tinted), shadow smear under them
// Dagger smoke layer r4 (APPROVED DeaRz 09:47). Paste INSIDE the FX block scope, right before 'var GHOSTC=null;'. Load dagger_smoke_atlas_r4.js first.
if(window.DGPAINT_ON===undefined) window.DGPAINT_ON=false; if(window.DGSMOKE_ON===undefined) window.DGSMOKE_ON=true;
(function(){
var I={}, S=window.DGPAINT_SRC||{}; Object.keys(S).forEach(function(k){ var im=new Image(); im.src=S[k][0]; I[k]=im; });
function ok(k){ return I[k]&&I[k].complete&&I[k].naturalWidth>0; }
function pimg(k,x,y,w,rot,al,mode,flip){ if(!ok(k)||al<=0.003) return; var h=w*S[k][2]/S[k][1]; cx.save(); cx.globalAlpha=Math.min(1,al); cx.globalCompositeOperation=mode||'source-over'; cx.translate(x,y); if(rot) cx.rotate(rot); if(flip) cx.scale(-1,1); cx.drawImage(I[k],-w/2,-h/2,w,h); cx.restore(); }
function paintHits(t){ var dim=DIM(); TL.hits.forEach(function(H){ var big=H.big, D=big?0.95:(H.type==='stab'?0.32:0.34), dt=t-H.t; if(dt<0||dt>D) return; var k=dt/D, e=eo(k), gin=A(dt/0.03), al=(1-k)*(1-k)*gin*dim;
  if(H.type==='slash'){ var R=40+34*e, x=H.x+6, y=H.y+8, rot=(H.seed%2?0.35:-0.35), alt=H.seed%2; cx.save(); SCL(x-6,y-8);
    // crescent B bulges right (a forward slash); crescent A is its mirror for the back-hand cut
    pimg(alt?'crA':'crB',x+R*0.35,y,R*2.3,rot,0.9*al,'source-over',alt===1); pimg(alt?'crA':'crB',x+R*0.35,y,R*2.3,rot,0.35*al,'lighter',alt===1);
    var sm=A((dt-0.04)/0.3); if(sm>0&&sm<1) pimg('smk2',x+R*0.9,y-10-14*sm,26+30*sm,0,0.5*(1-sm)*dim);
    cx.restore(); }
  else if(H.type==='stab'){ var x=H.x, y=H.y, L=70+90*e; cx.save(); SCL(x,y);
    pimg(H.seed%2?'thrB':'thrA',x+L*0.42,y,L*1.35,0,0.9*al); pimg('thrB',x+L*0.5,y,L*1.1,0,0.4*al,'lighter'); cx.restore(); }
  else { var x=H.hx+66, y=HY-44, s=72+26*e, kx=A(dt/0.09), g=eo(kx), alx=(1-k)*(1-k)*gin; cx.save(); SCL(H.hx+20,y,DGW_X);
    pimg('X',x,y-s*0.1,s*2.5*(0.75+0.25*g),0,0.95*alx*kx); pimg('X',x,y-s*0.1,s*2.5*(0.75+0.25*g),0,0.4*alx*kx,'lighter');
    for(var i=0;i<5;i++){ var st=0.04+i*0.05, km=A((dt-st)/0.6); if(km<=0||km>=1) continue; var a=i/5*6.2832+0.6, dd=30+60*eo(km); pimg(['smk0','smk1','smk2'][i%3],x+12+Math.cos(a)*dd,y+Math.sin(a)*dd*0.6-20*km,40+40*km,0,0.55*(1-km)); }
    cx.restore(); } }); }
function paintImpacts(t){ var dim=DIM(); TL.imp.forEach(function(o,i){ var Hv=o.heavy, D=Hv?0.5:0.28, dt=t-o.t; if(dt<0||dt>D) return; var k=dt/D, e=eo(k), al=(1-k)*(1-k)*A(dt/0.02)*(Hv?1:dim), x=o.x, y=o.y;
  pimg('burst',x,y,(Hv?110:60)*(0.6+0.5*e),i*0.7,0.85*al,'lighter');
  for(var d=0;d<(Hv?3:1);d++){ var dx=x+(rnd(i*3+d)-0.5)*(Hv?50:28), dy=y+e*(Hv?36:20)+90*k*k; pimg(d%2?'drop1':'drop0',dx,dy,Hv?14:10,0,0.95*(1-k)); } }); }
// r3b (DeaRz 09:40 "อยากให้มีควันจางๆจากรูป"): faint painted DW1 smoke only, on top of the single code wave
function smokeOnly(t){ var dim=DIM(); TL.hits.forEach(function(H){ var big=H.big, D=big?0.95:(H.type==='stab'?0.32:0.34), dt=t-H.t; if(dt<0||dt>D+0.25) return; var e=eo(A(dt/D));
  if(H.type==='slash'){ var R=40+34*e, x=H.x+6, y=H.y+8; cx.save(); SCL(x-6,y-8); for(var i=0;i<(window.DG3CAP?1:2);i++){ var sm=A((dt-0.03-i*0.05)/0.5); if(sm<=0||sm>=1) continue; pimg(i?'smk1':'smk2',x+R*(0.7+0.3*i),y-6-18*sm-i*8,(26+34*sm)*(i?1.2:1),0,0.32*Math.sin(Math.PI*sm)*dim); } cx.restore(); }
  else if(H.type==='stab'){ var x=H.x, y=H.y, L=70+90*e, sm=A((dt-0.04)/0.45); if(sm>0&&sm<1){ cx.save(); SCL(x,y); pimg('smk2',x+L*0.85,y-8-14*sm,24+28*sm,0,0.28*Math.sin(Math.PI*sm)*dim); cx.restore(); } }
  else { var x=H.hx+66, y=HY-44; cx.save(); SCL(H.hx+20,y,DGW_X); for(var i=0;i<(window.DG3CAP?3:5);i++){ var st=0.04+i*0.05, km=A((dt-st)/0.7); if(km<=0||km>=1) continue; var a=i/5*6.2832+0.6, dd=30+60*eo(km); pimg(['smk0','smk1','smk2'][i%3],x+12+Math.cos(a)*dd,y+Math.sin(a)*dd*0.6-20*km,40+40*km,0,0.35*Math.sin(Math.PI*km)); } cx.restore(); } }); }
var _h=drawHits, _i=drawImpacts;
drawHits=function(t){ _h(t); if(window.DGPAINT_ON!==false) paintHits(t); else if(window.DGSMOKE_ON!==false) smokeOnly(t); };
drawImpacts=function(t){ _i(t); if(window.DGPAINT_ON!==false) paintImpacts(t); };
})();

var GHOSTC=null; function ghostCanvas(){ if(!GHOSTC){ GHOSTC=document.createElement('canvas'); GHOSTC.width=220; GHOSTC.height=220; } return GHOSTC; }
function drawDash(t){ var c=locate(t); if(!c||c.n!==3) return; var tc=(t-c.t0)*c.f; if(tc<0.12||tc>0.9) return; var dc=DGC[3];
  var k=tc<0.78?A((tc-0.12)/0.06):1-(tc-0.78)/0.12, G=ghostCanvas(), g=G.getContext('2d');
  for(var i=(window.DG3CAP?2:3);i>=1;i--){ var s=Math.max(0.12,tc-i*0.045), p=dgPose(3,s/dc.dur); p.lunge+=c.root; var x=HX-p.lunge*SC+(i%2?-5:5)*i*0.6; p.lunge=0;
    g.setTransform(1,0,0,1,0,0); g.globalCompositeOperation='source-over'; g.clearRect(0,0,220,220); drawCombo(g,110,200,SC,1,p);
    g.globalCompositeOperation='source-in'; g.fillStyle=i===1?'rgb(122,79,176)':'rgb(74,36,112)'; g.fillRect(0,0,220,220);
    cx.save(); cx.globalAlpha=A(k*(0.42-i*0.1)); cx.drawImage(G,x-110,HY-200); cx.restore();
    cx.fillStyle='rgba(36,18,58,'+A(0.16*k*(1-i/4))+')'; cx.beginPath(); cx.ellipse(x,HY+3,22,6,0,0,6.2832); cx.fill(); } }

window.DG3FX_r4={set:function(o){cx=o.cx;TL=o.TL;HX=o.HX;HY=o.HY;SC=o.SC;ASPD=o.ASPD;},drawTrails:drawTrails,drawHits:drawHits,drawImpacts:drawImpacts,drawDash:drawDash,ver:'DG3FX_r4'};
})();
