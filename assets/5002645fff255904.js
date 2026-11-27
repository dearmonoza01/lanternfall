
/* ---- r209 HOMEWARP209 — the yard cottage doormat becomes a warp circle (DeaRz 24 Nov 2026 16:24 BKK
   "เปลี่ยนให้เป็นวงวาฟก็ได้จะได้เข้าใจง่ายหน่อย แต่ต้องเดินเข้าไปกดเหมือนเดิมนะไม่ใช่เดินไปถึงละเข้าไปเลย").
   Look r1 = CODE-DRAWN VFX (DeaRz 16:33 "ใช้ VFX เขียนขึ้นมานะ", "รูปผมให้ดูเป็นเรฟเฉยๆ"; reference only: art/warp_r2/ref/REF_ONLY_warp_circle_dearz_20261124.png):
   blue-violet ellipse (height .42 of width), thick outer + thin inner white-cyan rings, deeper band between them, 8 runes (approved V7 rune atlas) on the band turning slowly,
   4 long star flares N/E/S/W, 8-point star lattice with lilac diamonds, turning white vortex in the centre, soft light columns + 3 rune crystals
   rising behind, sparkles. No picture is used. Look only: entering still needs F / the button while standing on it.
   Off: ?homewarp=off (old mat). HOMEWARP209.pad(c,x,y,W) can draw the same circle anywhere (for the map circles later). ---- */
(function(){'use strict';
const X=window.HOMEWARP209={ver:'homewarp-r209',on:!/[?&]homewarp=off\b/.test(String(location.search)),err:null,draws:0,W:118,dy:22};
if(!X.on)return;
try{const H=window.HOUSE;if(!H||!H.houseWarp){X.err='no HOUSE.houseWarp';return}
  const TAU=Math.PI*2,KY=.42;
  const low=()=>{try{return (typeof gfxCap!=='undefined'&&gfxCap<=1)||document.body.classList.contains('mobile')}catch(_){return false}};
  function star4(c,x,y,L,w){c.beginPath();c.moveTo(x,y-L);c.quadraticCurveTo(x+w*.18,y-w*.18,x+w,y);c.quadraticCurveTo(x+w*.18,y+w*.18,x,y+L);c.quadraticCurveTo(x-w*.18,y+w*.18,x-w,y);c.quadraticCurveTo(x-w*.18,y-w*.18,x,y-L);c.closePath()}
  function dia(c,x,y,r){c.beginPath();c.moveTo(x,y-r);c.lineTo(x+r*.7,y);c.lineTo(x,y+r);c.lineTo(x-r*.7,y);c.closePath()}
  /* 8 simple angular rune glyphs (unit box -1..1), strokes */
  const RUNES=[[[-.5,-1,.5,-1],[.5,-1,-.5,1],[-.5,1,.5,1]],[[-.5,1,-.5,-1],[-.5,-1,.5,-.2],[.5,-.2,-.5,.3]],[[0,-1,0,1],[0,-.3,.6,-1],[0,.2,-.6,.9]],[[-.6,-1,.6,0],[.6,0,-.6,1]],
    [[-.5,-1,.5,-1],[.5,-1,.5,1],[-.5,0,.5,0]],[[-.6,1,0,-1],[0,-1,.6,1],[-.3,.2,.3,.2]],[[-.5,-1,-.5,1],[-.5,1,.5,1],[.5,1,.5,-.2]],[[-.6,-.6,.6,-.6],[.6,-.6,-.6,.6],[-.6,.6,.6,.6]]];
  /* r1b (DeaRz 24 Nov 16:46 BKK "อัคระผมมีอยู่นะเอามาใส่แทน"): glyphs = the approved V7 rune atlas (12 x 64 px, the game's WARP_RUNES / approved/vfx/runes), tinted; the stroke glyphs below are only a fallback */
  let RIM=null;const RT={};try{const src=(typeof WARP_RUNES!=='undefined')?WARP_RUNES:null;if(src){RIM=new Image();RIM.src=src}else X.err='no rune atlas'}catch(e){X.err='atlas '+e.message}
  function tint(col){if(RT[col])return RT[col];if(!(RIM&&RIM.complete&&RIM.naturalWidth))return null;const cv=document.createElement('canvas');cv.width=768;cv.height=64;const g=cv.getContext('2d');g.drawImage(RIM,0,0);g.globalCompositeOperation='source-in';g.fillStyle=col;g.fillRect(0,0,768,64);return RT[col]=cv}
  const RSEQ=[0,5,2,9,4,11,7,3,8,1,10,6];
  function rune(c,i,x,y,s,rot,col){const T=tint(col||'#ffffff');if(T){const d=s*2.6;c.save();c.translate(x,y);c.rotate(rot);c.drawImage(T,RSEQ[i%12]*64,0,64,64,-d/2,-d/2,d,d);c.restore();return}
    c.save();c.translate(x,y);c.rotate(rot);c.beginPath();for(const q of RUNES[i%8]){c.moveTo(q[0]*s*.6,q[1]*s);c.lineTo(q[2]*s*.6,q[3]*s)}c.stroke();c.restore()}
  function rune0(c,i,x,y,s,rot){c.save();c.translate(x,y);c.rotate(rot);c.beginPath();for(const q of RUNES[i%8]){c.moveTo(q[0]*s*.6,q[1]*s);c.lineTo(q[2]*s*.6,q[3]*s)}c.stroke();c.restore()}
  function pad(c,x,y,W,al){W=W||X.W;al=al==null?1:al;const t=(typeof time==='number'?time:performance.now()/1000),R=W/2,lo=low(),pu=.5+.5*Math.sin(t*2.1);
    c.save();c.translate(x,y);c.globalAlpha=al;
    /* outer halo */
    c.save();c.scale(1,KY);let g=c.createRadialGradient(0,0,R*.6,0,0,R*1.45);g.addColorStop(0,'rgba(122,155,211,.34)');g.addColorStop(.55,'rgba(120,130,250,'+(.16+.06*pu)+')');g.addColorStop(1,'rgba(120,130,250,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,R*1.45,0,TAU);c.fill();
    /* band + inner disc */
    c.fillStyle='rgba(112,165,230,.62)';c.beginPath();c.arc(0,0,R,0,TAU);c.fill();
    g=c.createRadialGradient(0,0,0,0,0,R*.74);g.addColorStop(0,'rgba(215,240,255,.9)');g.addColorStop(.35,'rgba(145,211,254,.8)');g.addColorStop(1,'rgba(132,170,240,.72)');c.fillStyle=g;c.beginPath();c.arc(0,0,R*.74,0,TAU);c.fill();
    /* vortex */
    c.save();c.rotate(-t*.7);c.lineCap='round';for(let a=0;a<3;a++){c.beginPath();for(let i=0;i<=22;i++){const u=i/22,r=R*.03+R*.46*u,an=a*TAU/3+u*3.6;c[i?'lineTo':'moveTo'](Math.cos(an)*r,Math.sin(an)*r)}c.strokeStyle='rgba(255,255,255,'+(.5+.15*pu)+')';c.lineWidth=R*.07;c.stroke();c.strokeStyle='rgba(190,170,255,.35)';c.lineWidth=R*.03;c.stroke()}c.restore();
    g=c.createRadialGradient(0,0,0,0,0,R*.2);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,R*.2,0,TAU);c.fill();
    /* star lattice: 8 diamonds on the middle ring, each joined to the 3rd next */
    const rm=R*.56,P8=[];for(let i=0;i<8;i++){const an=i*TAU/8+t*.12;P8.push([Math.cos(an)*rm,Math.sin(an)*rm])}
    c.strokeStyle='rgba(240,250,255,.75)';c.lineWidth=Math.max(.8,R*.018);c.beginPath();for(let i=0;i<8;i++){const a=P8[i],b=P8[(i+2)%8];c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1])}c.stroke();
    /* rings */
    c.globalCompositeOperation='lighter';
    c.strokeStyle='rgba(135,147,250,'+(.3+.12*pu)+')';c.lineWidth=R*.1;c.beginPath();c.arc(0,0,R,0,TAU);c.stroke();
    c.globalCompositeOperation='source-over';
    c.strokeStyle='rgba(249,253,253,.96)';c.lineWidth=Math.max(1.3,R*.034);c.beginPath();c.arc(0,0,R,0,TAU);c.stroke();
    c.strokeStyle='rgba(249,253,253,.9)';c.lineWidth=Math.max(.9,R*.018);c.beginPath();c.arc(0,0,R*.76,0,TAU);c.stroke();
    c.restore();
    /* unsquashed marks placed on the ellipse */
    c.fillStyle='rgba(228,201,252,.95)';c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=.8;for(const q of P8){dia(c,q[0],q[1]*KY,R*.05);c.fill();c.stroke()}
    c.strokeStyle='rgba(255,255,255,.92)';c.lineWidth=Math.max(.9,R*.018);c.lineCap='round';
    for(let i=0;i<8;i++){const an=i*TAU/8+TAU/16-t*.18,rx=Math.cos(an)*R*.88,ry=Math.sin(an)*R*.88*KY;rune(c,i,rx,ry,R*.058,Math.cos(an)*.5)}
    for(let i=0;i<4;i++){const an=i*TAU/4-Math.PI/2,fx=Math.cos(an)*R,fy=Math.sin(an)*R*KY,L=R*(.3+.04*pu),hz=i%2===1;
      c.fillStyle='rgba(255,255,255,.96)';star4(c,fx,fy,hz?L*.3:L*.5,hz?L*.8:L*.3);c.fill();c.fillStyle='rgba(209,183,252,.95)';dia(c,fx,fy,R*.06);c.fill()}
    /* light columns + rune crystals behind */
    /* r1c (DeaRz 16:47 "แท่งๆแหล่มๆ เอาอออก"): the pointed light columns are removed */
    c.globalCompositeOperation='source-over';c.strokeStyle='rgba(235,225,255,.8)';c.lineWidth=Math.max(.9,R*.018);
    for(let i=0;i<3;i++){const px=(i-1)*R*.52,py=-R*KY-R*(i===1?1.12:.8)+Math.sin(t*1.3+i*2)*R*.04;c.globalAlpha=al*(.7+.3*Math.sin(t*1.8+i));rune(c,i+8,px,py,R*.08,0,'#ece2ff');c.fillStyle='rgba(255,255,255,.9)';dia(c,px,py+R*.19,R*.022);c.fill();dia(c,px,py+R*.27,R*.016);c.fill()}
    /* sparkles */
    const NS=lo?6:12;for(let i=0;i<NS;i++){const k=(t*.3+i/NS)%1,an=i*2.4,px=Math.cos(an)*R*(.5+.6*((i*37%10)/10)),py=Math.sin(an)*R*KY*.9-k*R*.9;c.globalAlpha=al*.9*Math.sin(k*Math.PI);c.fillStyle='#fff';dia(c,px,py,R*.028*(1-k*.5)+.6);c.fill()}
    c.restore();X.draws++;}
  X.pad=pad;
  /* r1d (DeaRz 24 Nov 16:54 BKK "ok ผ่าน เมื่อเดินเข้าวาฟตัวเราจะเป็นแสงเหมือนตอนกดลงจากบ้านลอยฟ้าและก็วาฟไปอีกที"): entering / leaving the cottage through the circle
     plays the same light as the way down from the sky yard (#houseFx, 0.52 s in, move, light out), then the hero appears at the other side.
     Still only on F / the button. Forced calls (game fallbacks) stay instant. ?homewarp=off / HOMEWARP209.lightOn=false = instant as before. */
  X.lightOn=true;X.stats={in:0,out:0};
  function light(action){const fx=document.getElementById('houseFx');if(!fx||!X.lightOn){action();return}H.busy=true;const safe=setTimeout(()=>{H.busy=false;fx.classList.remove('on')},4000);
    try{for(const k in keys)keys[k]=false;mouse.down=false;P.vx=P.vy=0}catch(_){}fx.classList.add('on');
    setTimeout(()=>{try{H.busy=false;action()}catch(e){X.err='light '+e.message}H.busy=true;setTimeout(()=>{fx.classList.remove('on');setTimeout(()=>{H.busy=false;clearTimeout(safe)},450)},180)},520)}
  const _in=H.enterRoom,_out=H.exitRoom;
  H.enterRoom=function(force){if(force||!X.lightOn)return _in.apply(this,arguments);
    if(H.roomOn||G.zone!==H.ZID||G.state!=='play'||P.dead||H.busy||(H.build&&H.build.on)||!H.houseWarp())return false;X.stats.in++;light(()=>_in.call(H));return true};
  H.exitRoom=function(fallback){if(fallback||!X.lightOn||!H.roomOn||H.busy||G.state!=='play')return _out.apply(this,arguments);X.stats.out++;light(()=>_out.call(H));return true};
  const _d=H.roomWarpDraw;H.roomWarpDraw=function(c){try{if(H.roomOn)return _d&&_d.apply(this,arguments);const w=H.houseWarp();if(w)pad(c,w.x,w.y+X.dy,X.W);/* dy: the circle sits in front of the door step, not under it */}catch(e){X.err='draw '+e.message;try{return _d&&_d.apply(this,arguments)}catch(_){}}};
}catch(e){X.err=e.message}})();

