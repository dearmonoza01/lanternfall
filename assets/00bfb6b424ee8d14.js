
/* ---- puppet_3q_scarf_pack_r2 face3q_scarf_h24.js (AT3Q head [131,26] torso [-51,-58]) ---- */
// Lanternfall chibi hero: 3/4 head+hair (H22/H23, DeaRz 14:06 "หัวกับผม 3/4") + fluttering scarf (H21) (Code, 9 Nov 2026)
// Art handoff HANDOFF_CODE_3q_scarf_r1.md (all QA PASS), reference = editor v28 apply3q / SCARF.
// Load AFTER parts_3q.js + parts_scarf.js (data, before PUPPET.load) and AFTER looks_h14.js + hairmesh_h23.js.
// DeaRz 14:39 "เอาหัวแบบหันข้างออกได้เลย ใช้แค่แบบ3/4 พอ": 3/4 head is ALWAYS on; old black/silver/red hair removed from the list.
// API: PUPPET.setScarf(on) (default on), PUPPET.set3q(false) only for debug (?face=side). Scarf flutter + hair mesh move only when setSway(true).
(function(){
'use strict';
var U=window.PUPPET, P=U.P, ORDER=U.ORDER, cfg=U.cfg, slots=U.slots, AL=window.PUPPET_ALIGN=window.PUPPET_ALIGN||{};
var ST={q3:true, scarf:true};
// DeaRz per-hairstyle 3/4 offsets (editor v35 layout.hair3q = {hairId:[x,y]}, hair 'at' in head coords, pivot [0,0]). Empty until DeaRz sends them.
var HAIR3Q=U.HAIR3Q={g6:[-14,-12], g7:[-21,-7], g8:[-18,-1], g9:[-19,-12], g10:[-27,-29], b3:[-29,-11]}; // DeaRz 15:21 (layout_dearz_1521.json)
function has(k){ return !!(U.imgs[k]||(window.PUPPET_PARTS||{})[k]); }
// --- scarf part: parent head, pivot=at=[0,0], scale = head; drawn after torso/head/hem/hair, before arm_near
P.scarf=P.scarf||{pivot:[0,0], parent:'head', at:[0,0]};
function placeScarf(){ var i=ORDER.indexOf('scarf'); if(i>=0) ORDER.splice(i,1);
  var an=ORDER.indexOf('arm_near'), lt=Math.max(ORDER.indexOf('torso'),ORDER.indexOf('head'),ORDER.indexOf('hem'),ORDER.indexOf('hair'));
  ORDER.splice(an>lt?an:lt+1,0,'scarf'); }
placeScarf(); slots.scarf='_none';
// --- 3/4 head: remember the side-view hair rig so it can be put back
var HO={pivot:P.hair.pivot.slice(), at:P.hair.at.slice(), sc:(cfg.SC||{}).hair};
// DeaRz layout 14:37 (layout_dearz_1437.json): with the 3/4 neck cut the head sits 10 px higher, torso 2 px. Used in 3/4 mode only.
var AT3Q=U.AT3Q={head:[131,26], torso:[-51,-58]}, ATS={head:P.head.at.slice(), torso:P.torso.at.slice()};
function apply(){ var cs=cfg.SC=cfg.SC||{}, L=U.getLook();
  if(ST.q3){
    slots.head=L.gender==='girl'?'girl_head3q':'head3q';
    var hk=has('hair3_'+L.hair)?'hair3_'+L.hair:'hair3_default'; // black/silver/red have no 3/4 art: use default 3/4 hair
    var bk=hk.replace('hair3_','hairb3_');
    slots.hair=hk; slots.hair_back=has(bk)?bk:'_none';
    var hid=hk.replace('hair3_',''), off=HAIR3Q[hid]; P.hair.pivot=[0,0]; P.hair.at=off?[+off[0]||0,+off[1]||0]:[0,0]; cs.hair=U.absS('head'); P.head.at=AT3Q.head.slice(); P.torso.at=AT3Q.torso.slice();
  } else {
    if(L.gender==='girl') slots.head='girl_head'; else if(slots.head==='head3q'||slots.head==='girl_head3q') delete slots.head;
    P.hair.pivot=HO.pivot.slice(); P.hair.at=HO.at.slice(); P.head.at=ATS.head.slice(); P.torso.at=ATS.torso.slice(); if(HO.sc==null) delete cs.hair; else cs.hair=HO.sc;
  }
  slots.scarf=(ST.scarf&&has('scarf_'+L.outfit))?'scarf_'+L.outfit:'_none';
  syncScarf(); }
function syncScarf(){ cfg.SC=cfg.SC||{}; cfg.SC.scarf=U.absS('head'); P.scarf.pivot=[0,0]; P.scarf.at=[0,0]; }
// re-apply after every look change (these wrappers sit outside looks_h14 + hairmesh_h23)
['setOutfit','setGender','setLook','setHair'].forEach(function(f){ var b=U[f]; if(!b) return; U[f]=function(){ var r=b.apply(this,arguments); apply(); return r; }; });
var baseApply=U.applyLayout;
U.applyLayout=function(L){ if(typeof L==='string') L=JSON.parse(L); if(L&&L.hair3q){ for(var hk3 in L.hair3q) HAIR3Q[hk3]=L.hair3q[hk3]; } var q=ST.q3; if(q){ ST.q3=false; apply(); } var r=baseApply(L); HO={pivot:P.hair.pivot.slice(), at:P.hair.at.slice(), sc:(cfg.SC||{}).hair}; ATS={head:P.head.at.slice(), torso:P.torso.at.slice()}; placeScarf(); ST.q3=q; apply(); return r; };
function reapply(){ U.setLook(U.getLook()); } // full rebuild of slots from the current look, then apply()
U.set3q=function(on){ ST.q3=!!on; reapply(); };
U.setScarf=function(on){ ST.scarf=!!on; reapply(); };
U.setHair3q=function(o){ for(var k in (o||{})) HAIR3Q[k]=o[k]; reapply(); };
U.get3q=function(){ return {q3:ST.q3, scarf:ST.scarf}; };

// --- scarf flutter (SC2 = Art values). Neck wrap never moves; tail weight w=q^2 along u past wrap_end.
var SC2=U.SC2={walk:9, run:15, idle:2, ripW:3, ripR:4, ripI:1.5, k:70, c:7, max:30, f:9, grid:24};
var SS={dx:0, v:0, pt:0, t:0, an:''};
function triDraw(x,im,s0,s1,s2,d0,d1,d2){ var cx=(d0[0]+d1[0]+d2[0])/3, cy=(d0[1]+d1[1]+d2[1])/3, e=2.5;
  function ex(p){ var vx=p[0]-cx, vy=p[1]-cy, l=Math.hypot(vx,vy)||1; return [p[0]+vx/l*e, p[1]+vy/l*e]; }
  var a=ex(d0), b=ex(d1), c=ex(d2); x.save(); x.beginPath(); x.moveTo(a[0],a[1]); x.lineTo(b[0],b[1]); x.lineTo(c[0],c[1]); x.closePath(); x.clip();
  var x1=s1[0]-s0[0], y1=s1[1]-s0[1], x2=s2[0]-s0[0], y2=s2[1]-s0[1], X1=d1[0]-d0[0], Y1=d1[1]-d0[1], X2=d2[0]-d0[0], Y2=d2[1]-d0[1], det=x1*y2-x2*y1; if(!det){ x.restore(); return; }
  var A=(X1*y2-X2*y1)/det, B=(Y1*y2-Y2*y1)/det, C=(X2*x1-X1*x2)/det, D=(Y2*x1-Y1*x2)/det;
  x.transform(A,B,C,D,d0[0]-A*s0[0]-C*s0[1],d0[1]-B*s0[0]-D*s0[1]); x.drawImage(im,0,0); x.restore(); }
var PAD=48, CVS=null, ORIG=null;
function restoreSlot(){ if(ORIG!=null){ if(slots.scarf==='_sc_scarf') slots.scarf=ORIG; ORIG=null; } }
function renderScarf(sk){ var im=U.imgs[sk], inf=(window.SCARF_INFO||{})[sk]; if(!im||!im.width||!inf) return false;
  var a=AL[sk]||[0,0];
  if(!CVS){ CVS=document.createElement('canvas'); CVS._key='_sc_scarf'; U.imgs[CVS._key]=CVS; }
  if(CVS.width!==im.width+2*PAD||CVS.height!==im.height+2*PAD){ CVS.width=im.width+2*PAD; CVS.height=im.height+2*PAD; }
  AL[CVS._key]=[a[0]-PAD, a[1]-PAD];
  var x=CVS.getContext('2d'); x.setTransform(1,0,0,1,0,0); x.clearRect(0,0,CVS.width,CVS.height);
  var g=SC2.grid, nx=Math.ceil(im.width/g)+1, ny=Math.ceil(im.height/g)+1, u0=inf.wrap_end_u-a[0]-10, L=Math.max(40,im.width-u0);
  var amp=SS.an==='run'?SC2.ripR:SS.an==='walk'?SC2.ripW:SS.an==='idle'?SC2.ripI:0, sp=SS.an==='run'?SC2.f*1.4:SC2.f, t=SS.t;
  function S(i,j){ return [Math.min(im.width,i*g), Math.min(im.height,j*g)]; }
  function Dp(i,j){ var s=S(i,j), q=Math.max(0,Math.min(1,(s[0]-u0)/L)), w=q*q; return [s[0]+PAD+SS.dx*w*0.6, s[1]+PAD-SS.dx*w*0.35+amp*w*Math.sin(t*sp-q*5.5)]; }
  for(var j=0;j<ny-1;j++)for(var i=0;i<nx-1;i++){ var s00=S(i,j), s10=S(i+1,j), s01=S(i,j+1), s11=S(i+1,j+1);
    if(s10[0]<=s00[0]||s01[1]<=s00[1]) continue;
    if(s10[0]<=u0){ var gx0=Math.max(0,s00[0]-2), gy0=Math.max(0,s00[1]-2), gx1=Math.min(im.width,s11[0]+2), gy1=Math.min(im.height,s11[1]+2); x.drawImage(im,gx0,gy0,gx1-gx0,gy1-gy0,gx0+PAD,gy0+PAD,gx1-gx0,gy1-gy0); continue; }
    triDraw(x,im,s00,s10,s11,Dp(i,j),Dp(i+1,j),Dp(i+1,j+1)); triDraw(x,im,s00,s11,s01,Dp(i,j),Dp(i+1,j+1),Dp(i,j+1)); }
  return true; }
var basePose=U.pose;
// BODY ROCK (Art RIG_SKIRT_r5_ROCK, DeaRz 14:53 clip): rigid shirt+skirt rocks around the hip each step; legs keep their world swing.
var RK=U.RK={on:false, walk:3.5, run:4.5, lag:0.35, headKeep:0.6, armKeep:0.3};
// SKIRT FLARE r6 (Art RIG_SKIRT_r6_FLARE, DeaRz 15:10 "hem opens/closes with the legs", body upright; rock r5 dropped)
var FL=U.FL={on:true, walk:0.13, run:0.19, y0:0.58, pow:1.6, asym:0.35, rows:3};
var FCV=null, FORIG=null;
function restoreFlare(){ if(FORIG!=null){ if(slots.torso==='_fl_torso'){ if(FORIG===false) delete slots.torso; else slots.torso=FORIG; } FORIG=null; } }
function renderFlare(tk,amt,sg){ var im=U.imgs[tk]; if(!im||!im.width) return false; var Wd=im.width, H=im.height, pad=Math.ceil(Wd*0.15), cx=Wd/2, y0=H*FL.y0, r=FL.rows;
  if(!FCV){ FCV=document.createElement('canvas'); FCV._key='_fl_torso'; U.imgs[FCV._key]=FCV; }
  if(FCV.width!==Wd+2*pad||FCV.height!==H){ FCV.width=Wd+2*pad; FCV.height=H; }
  var a=AL[tk]||[0,0]; AL[FCV._key]=[a[0]-pad,a[1]];
  var x=FCV.getContext('2d'); x.setTransform(1,0,0,1,0,0); x.clearRect(0,0,FCV.width,FCV.height);
  x.drawImage(im,0,0,Wd,Math.ceil(y0),pad,0,Wd,Math.ceil(y0));
  for(var y=Math.floor(y0);y<H;y+=r){ var h=Math.min(r+1,H-y), t=Math.pow(Math.max(0,(y+h/2-y0)/(H-y0)),FL.pow);
    var fL=amt*t*(1+FL.asym*sg), fR=amt*t*(1-FL.asym*sg); x.drawImage(im,0,y,Wd,h,pad-cx*fL,y,Wd*(1+(fL+fR)/2),h); }
  return true; }
U.pose=function(name,t,o){ restoreSlot(); restoreFlare(); var p=basePose(name,t,o); syncScarf();
  if(cfg.SWAY&&FL.on&&(name==='walk'||name==='run')&&p.rot&&!p.attack){ var A=name==='run'?38:24, sg=Math.max(-1,Math.min(1,((p.rot.leg_near||0)-(p.rot.leg_far||0))/(2*A))), amt=(name==='run'?FL.run:FL.walk)*Math.abs(sg);
    var tk=slots.torso||P.torso.img||'torso'; if(amt>0.002&&renderFlare(tk,amt,sg)){ FORIG=slots.torso===undefined?false:slots.torso; slots.torso=FCV._key; } }
  if(cfg.SWAY&&RK.on&&(name==='walk'||name==='run')&&p.rot&&!p.attack){ var run=name==='run', per=run?0.48:0.8, ph=(((t||0)/per)%1)*2*Math.PI, rk=(run?RK.run:RK.walk)*Math.sin(ph+RK.lag);
    p.rot.torso=(p.rot.torso||0)+rk; ['leg_near','leg_far','arm_near','arm_far'].forEach(function(k){ p.rot[k]=(p.rot[k]||0)-rk*(k.indexOf('leg')===0?1:RK.armKeep); }); p.rot.head=(p.rot.head||0)-rk*RK.headKeep; }
  var sk=slots.scarf; if(!cfg.SWAY||!sk||sk==='_none'||!U.imgs[sk]) return p;
  var an=(name==='attack'||name==='slash'||p.attack)?'attack':name, rot=p.rot||{};
  var now=(window.performance?performance.now():Date.now())/1000, dt=SS.pt?Math.min(0.05,Math.max(0.001,now-SS.pt)):0.016; SS.pt=now; SS.t+=dt; SS.an=an;
  var lr=(an==='walk'||an==='run')?((rot.leg_near||0)-(rot.leg_far||0)):0;
  var tx=(an==='walk'?SC2.walk:an==='run'?SC2.run:0)+0.06*lr;
  SS.v+=(SC2.k*(tx-SS.dx)-SC2.c*SS.v)*dt; SS.dx+=SS.v*dt; SS.dx=Math.max(-SC2.max,Math.min(SC2.max,SS.dx));
  if(renderScarf(sk)){ ORIG=sk; slots.scarf=CVS._key; }
  return p; };
var baseSway=U.setSway; U.setSway=function(on){ restoreSlot(); restoreFlare(); if(!on){ SS.dx=SS.v=0; } return baseSway(on); };
['setOutfit','setGender','setLook','setHair'].forEach(function(f){ var b=U[f]; U[f]=function(){ restoreSlot(); restoreFlare(); return b.apply(this,arguments); }; });
U.HAIRS=['default','b1','b2','b3','b4','b5','g6','g7','g8','g9','g10'];
apply();
})();

