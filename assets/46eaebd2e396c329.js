
/* ---- r198 swpress (TEST ONLY): sword skill PRESS motions r3 by Motion, PASSED by DeaRz 24 Nov 06:46 BKK ("ผ่าน").
   Handoff /mnt/project-files/motion/sword_skills_r1/code_handoff_r3/ (sk_defs.js = pose data, embedded verbatim; main_sw.js = code-drawn FX, functions embedded).
   9 skills (not วังวนเจ็ดคม): S1 wsSword1 พายุคมดาบ, S2 wsSword3 นักดาบคลั่ง, S3 wsSword2 เขี้ยวผ่าศิลา, S4 provoke คำรามท้าศึก, S5 wsBuff3 ตั้งรับเหล็กกล้า,
   S6 wsAtk4 ดาบพิพากษา, S7 wsBuff4 ย่างก้าวนักรบ, S8 wsAtk5 เขตแดนดาบพิทักษ์, S9 wsBuff5 คมดาบดูดชีพ.
   - When a skill's cooldown starts, the hero's PUPPET pose = sword idle + Motion keys for the motion length (mirrored left/right like other clips).
   - S3 / S6 / S8 keep the existing p281 VFX and timings (pose only). S1 / S2 / S4 / S5 / S7 / S9 get Motion's code-drawn FX.
     S2 red tint + aura, S5 steel tint + hex dome, S9 red blade + eye stay for the whole buff (P.buffs[id]).
   - S1 is now a dash-stab: the game's own dash (prep 0.17 s, dash 0.23 s, max 330 px) with hits moved to 0.40 / 0.56 s, no brake slide after the dash, and the skill ending at 0.95 s (was 0.70 / 1.00, brake 0.20, end 1.63).
     Damage numbers unchanged (Balance to re-check because it now closes distance).
   ?swpress=off = old poses / timings. Debug window.SWPRESS198 ---- */
(function(){'use strict';
const Q=String(location.search);
const R=window.SWPRESS198={ver:'swpress-r198',on:!/[?&]swpress=off\b/.test(Q),err:null,cur:null,stats:{casts:{},draws:0,fx:0,tint:0},log:[]};
if(!R.on)return;
const ERR=(w,e)=>{R.err=w+': '+((e&&e.message)||e);try{console.error('[SWPRESS198]',w,e)}catch(_){}};
/* ===== Motion sk_defs.js (verbatim) ===== */
// Lanternfall SWORD skill press motions r1 (Motion, 23 Nov) - data for PUPPET.
// rot = degrees ADDED to the sword idle pose; KF = smoothstep between keys; times in seconds.
// Signs: + arm = forward/up (0 hang, 90 forward, 170 overhead-back); sword angle on screen ~= arm_near + fist_near (0 = point forward, 90 = straight up, -90 = straight down).
// + leg = thigh forward, - foot = knee bend, + torso = lean back, - head = look up.
// dx = hero moves forward (demo px, demo scale ~1.45 x game px). hits = damage frames (s). fx = when the placeholder effect fires.
var SK={
 S1:{nm:'พายุคมดาบ (พุ่งแทง)', dur:0.95, col:[255,236,170], hits:[0.40,0.56], fx:0.40, dash:[0.16,0.40],
   keys:{torso:[[0,0],[0.16,4],[0.30,-20],[0.40,-24],[0.56,-22],[0.72,-20],[0.95,0]], head:[[0,0],[0.16,-2],[0.40,-8],[0.95,0]],
     arm_near:[[0,0],[0.16,-55],[0.30,50],[0.40,110],[0.48,84],[0.56,112],[0.72,106],[0.95,0]], forearm_near:[[0,0],[0.16,80],[0.30,40],[0.40,0],[0.48,30],[0.56,0],[0.72,0],[0.95,0]],
     fist_near:[[0,0],[0.16,-22],[0.30,-70],[0.40,-88],[0.48,-92],[0.56,-90],[0.72,-86],[0.95,0]],
     arm_far:[[0,0],[0.16,40],[0.40,-50],[0.72,-45],[0.95,0]],
     leg_near:[[0,0],[0.16,20],[0.30,40],[0.40,58],[0.72,56],[0.95,0]], foot_near:[[0,0],[0.16,-36],[0.40,-58],[0.72,-56],[0.95,0]],
     leg_far:[[0,0],[0.16,-12],[0.30,-34],[0.40,-46],[0.72,-44],[0.95,0]], foot_far:[[0,0],[0.16,-28],[0.40,-4],[0.72,-4],[0.95,0]]},
   beats:[[0.16,'ย่อตัว ดึงดาบมาข้างเอว ปลายชี้เป้า'],[0.40,'พุ่งตรงไปตัวที่ล็อคเป้า แขนเหยียดแทง'],[0.48,'แทงโดนครั้งที่ 1 ดึงดาบกลับนิดเดียว'],[0.72,'แทงซ้ำโดนครั้งที่ 2 (ค้างท่า)'],[0.95,'กลับท่ายืน']]},
 S2:{nm:'นักดาบคลั่ง (บัฟ)', dur:1.0, len:1.9, col:[255,40,30], hits:[], fx:0.45,
   keys:{torso:[[0,0],[0.12,-6],[0.38,-16],[0.45,12],[0.7,10],[1.0,0]], head:[[0,0],[0.38,-10],[0.45,18],[0.7,16],[1.0,0]],
     arm_near:[[0,0],[0.38,40],[0.45,-30],[0.7,-28],[1.0,0]], fist_near:[[0,0],[0.38,10],[0.45,40],[0.7,40],[1.0,0]],
     arm_far:[[0,0],[0.38,50],[0.45,-60],[0.7,-55],[1.0,0]],
     leg_near:[[0,0],[0.38,30],[0.45,26],[0.7,26],[1.0,0]], foot_near:[[0,0],[0.38,-42],[0.45,-26],[0.7,-26],[1.0,0]],
     leg_far:[[0,0],[0.38,-20],[0.45,-26],[0.7,-26],[1.0,0]], foot_far:[[0,0],[0.38,-34],[0.45,-14],[1.0,0]]},
   jit:[0.12,0.42,1.6],
   beats:[[0.38,'ก้มตัว กำดาบแน่น ตัวสั่น พลังแดงไหลเข้าตัว จอสั่นเบาๆ'],[0.5,'ยืดอก เงยหน้าคำราม ออร่าแดงระเบิด จอสั่นแรง (บัฟเข้า 0.45)'],[1.0,'ตัวแดง ออร่าไฟแดงลุกรอบตัว'],[1.9,'กลับท่ายืน ออร่ายังลุกตลอดเวลาบัฟ']]},
 S3:{nm:'เขี้ยวผ่าศิลา (เอฟเฟกต์เดิม)', dur:0.85, len:1.9, col:[255,138,42], hits:[], fx:0.24, ov:'S1', txt:'ปล่อยคลื่น 0.24 วิ (เดิม) · โดนตอนคลื่นผ่าน + พื้นระเบิดซ้ำ 0.24 วิหลังจากนั้น',
   keys:{torso:[[0,0],[0.16,10],[0.24,-20],[0.55,-18],[0.85,0]], head:[[0,0],[0.16,6],[0.24,-6],[0.85,0]],
     arm_near:[[0,0],[0.16,165],[0.24,20],[0.55,22],[0.85,0]], fist_near:[[0,0],[0.16,-40],[0.24,-75],[0.55,-75],[0.85,0]],
     arm_far:[[0,0],[0.16,150],[0.24,10],[0.55,10],[0.85,0]],
     leg_near:[[0,0],[0.16,6],[0.24,40],[0.55,40],[0.85,0]], foot_near:[[0,0],[0.16,-6],[0.24,-48],[0.55,-48],[0.85,0]],
     leg_far:[[0,0],[0.16,-8],[0.24,-30],[0.55,-30],[0.85,0]], foot_far:[[0,0],[0.24,-18],[0.55,-18],[0.85,0]]},
   air:[[0,0],[0.16,10],[0.2,10],[0.24,0],[0.85,0]],
   beats:[[0.16,'ชูดาบสองมือเหนือหัว ไฟลุกที่ใบดาบ'],[0.3,'ฟันลงพื้น คลื่นไฟแยก 3 แฉก (เอฟเฟกต์เดิม)'],[0.85,'ค้างท่า คลื่นผ่าพื้นเป็นรอยแยก'],[1.9,'กลับท่ายืน พื้นใต้เป้าแตกระเบิดซ้ำ']]},
 S4:{nm:'คำรามท้าศึก (โดนรอบตัว)', dur:1.0, len:1.5, col:[255,170,60], hits:[0.32], fx:0.32, txt:'โดนรอบตัว 360° ที่ 0.32 วิ (ยั่วยุทุกตัวในวง)',
   keys:{torso:[[0,0],[0.22,-12],[0.32,18],[0.7,16],[1.0,0]], head:[[0,0],[0.22,-10],[0.32,20],[0.7,18],[1.0,0]],
     arm_near:[[0,0],[0.22,30],[0.32,50],[0.7,48],[1.0,0]], fist_near:[[0,0],[0.22,20],[0.32,-100],[0.7,-100],[1.0,0]],
     arm_far:[[0,0],[0.22,40],[0.32,-85],[0.7,-80],[1.0,0]],
     leg_near:[[0,0],[0.22,26],[0.32,34],[0.7,34],[1.0,0]], foot_near:[[0,0],[0.22,-40],[0.32,-30],[0.7,-30],[1.0,0]],
     leg_far:[[0,0],[0.22,-14],[0.32,-34],[0.7,-34],[1.0,0]], foot_far:[[0,0],[0.22,-30],[0.32,-6],[1.0,0]]},
   jit:[0.32,0.7,0.8],
   beats:[[0.22,'ย่อตัว สูดหายใจ ฝุ่นถูกดูดเข้าหาตัว'],[0.4,'แหงนหน้าคำราม แบะแขนกว้าง จอสั่น คลื่นกระแทกพื้นวงกลมรอบตัว'],[0.8,'คลื่น 3 ชั้นวิ่งออกรอบตัว มอนทุกตัวในวงโดนยั่ว (! สีแดง)'],[1.5,'กลับท่ายืน']]},
 S5:{nm:'ตั้งรับเหล็กกล้า (r3 ใหม่)', dur:1.0, len:1.8, col:[190,215,240], hits:[], fx:0.3,
   keys:{torso:[[0,0],[0.18,8],[0.3,-6],[0.8,-6],[1.0,0]], head:[[0,0],[0.18,6],[0.3,-4],[0.8,-4],[1.0,0]],
     arm_near:[[0,0],[0.18,125],[0.3,62],[0.8,62],[1.0,0]], forearm_near:[[0,0],[0.18,10],[0.3,20],[0.8,20],[1.0,0]], fist_near:[[0,0],[0.18,-215],[0.3,-170],[0.8,-170],[1.0,0]],
     arm_far:[[0,0],[0.18,120],[0.3,70],[0.8,70],[1.0,0]], forearm_far:[[0,0],[0.3,20],[0.8,20],[1.0,0]],
     leg_near:[[0,0],[0.18,6],[0.3,30],[0.8,30],[1.0,0]], foot_near:[[0,0],[0.3,-28],[0.8,-28],[1.0,0]],
     leg_far:[[0,0],[0.18,-4],[0.3,-28],[0.8,-28],[1.0,0]], foot_far:[[0,0],[0.3,-14],[0.8,-14],[1.0,0]]},
   air:[[0,0],[0.18,8],[0.24,8],[0.3,0],[1.0,0]],
   beats:[[0.18,'ยกดาบสองมือ ปลายดาบชี้ลง'],[0.36,'ปักดาบลงพื้นตรงหน้า เสียงเหล็กกระทบ ประกายไฟ จอสั่นเบา (บัฟเข้า 0.30)'],[0.8,'กางขาตั้งมั่น มือทั้งสองกดด้ามดาบ ผิวเหล็กไล่ลงทั้งตัว โดมเหล็กหกเหลี่ยมคลุม'],[1.8,'ถอนดาบ กลับท่ายืน ประกายเหล็กค้างตลอดเวลาบัฟ (Lv10 สะท้อน)']]},
 S6:{nm:'ดาบพิพากษา (เอฟเฟกต์เดิม)', dur:1.3, len:3.4, col:[255,211,107], hits:[0.72,0.94,1.16], fx:0.3, ov:'S3',
   keys:{torso:[[0,0],[0.3,10],[0.6,12],[0.75,-10],[1.05,-8],[1.3,0]], head:[[0,0],[0.3,12],[0.6,14],[0.75,-2],[1.3,0]],
     arm_near:[[0,0],[0.3,168],[0.6,170],[0.75,96],[1.05,94],[1.3,0]], fist_near:[[0,0],[0.3,-78],[0.6,-80],[0.75,-96],[1.05,-96],[1.3,0]],
     arm_far:[[0,0],[0.3,30],[0.6,30],[0.75,-30],[1.05,-30],[1.3,0]],
     leg_near:[[0,0],[0.3,4],[0.6,4],[0.75,30],[1.05,30],[1.3,0]], foot_near:[[0,0],[0.75,-30],[1.05,-30],[1.3,0]],
     leg_far:[[0,0],[0.3,-6],[0.6,-6],[0.75,-22],[1.05,-22],[1.3,0]]},
   beats:[[0.3,'ชูดาบตรงขึ้นฟ้า'],[0.6,'แสงพุ่งจากปลายดาบไปด้านหลังบนฟ้า วงเป้าหมายบนพื้น (เดิม)'],[0.75,'ฟาดดาบชี้ไปข้างหน้า สั่งดาบยักษ์'],[1.3,'ดาบยักษ์ 3 เล่มปักที่ 0.72 / 0.94 / 1.16 (เดิม) · ล็อค 1.3 วิ'],[3.4,'สามเหลี่ยมแสงเชื่อม ดาบสลาย']]},
 S7:{nm:'ย่างก้าวนักรบ (บัฟ)', dur:0.6, col:[190,255,210], hits:[], fx:0.28,
   keys:{torso:[[0,0],[0.15,-10],[0.28,-14],[0.45,-12],[0.6,0]], head:[[0,0],[0.28,-6],[0.6,0]],
     arm_near:[[0,0],[0.15,-30],[0.28,-34],[0.45,-30],[0.6,0]], fist_near:[[0,0],[0.15,20],[0.28,24],[0.6,0]],
     arm_far:[[0,0],[0.15,40],[0.28,50],[0.45,45],[0.6,0]],
     leg_near:[[0,0],[0.15,40],[0.28,30],[0.45,30],[0.6,0]], foot_near:[[0,0],[0.15,-50],[0.28,-36],[0.45,-36],[0.6,0]],
     leg_far:[[0,0],[0.15,-20],[0.28,-26],[0.45,-24],[0.6,0]], foot_far:[[0,0],[0.15,-20],[0.28,-30],[0.6,0]]},
   air:[[0,0],[0.15,8],[0.22,0],[0.6,0]],
   beats:[[0.15,'ยกเข่า ก้าวกระทืบ'],[0.28,'โน้มตัวท่าเตรียมวิ่ง ลมหมุนรอบเท้า (บัฟเข้า)'],[0.6,'กลับท่ายืน (Lv10 กดซ้ำ = พุ่ง)']]},
 S8:{nm:'เขตแดนดาบพิทักษ์ (เอฟเฟกต์เดิม)', dur:1.0, len:6.1, col:[255,211,107], hits:[], fx:0.4, ov:'S4', txt:'ดาบใหญ่ปัก 0.40 วิ (เดิม) · ฮีลครั้งเดียว · คลื่น 7 ระลอกทุก 0.7 วิ เริ่ม 0.8 วิ',
   keys:{torso:[[0,0],[0.25,6],[0.45,-12],[0.75,-10],[1.0,0]], head:[[0,0],[0.25,14],[0.45,-4],[1.0,0]],
     arm_near:[[0,0],[0.25,165],[0.45,70],[0.75,70],[1.0,0]], fist_near:[[0,0],[0.25,-75],[0.45,-110],[0.75,-110],[1.0,0]],
     arm_far:[[0,0],[0.25,150],[0.45,40],[0.75,40],[1.0,0]],
     leg_near:[[0,0],[0.25,4],[0.45,34],[0.75,34],[1.0,0]], foot_near:[[0,0],[0.45,-46],[0.75,-46],[1.0,0]],
     leg_far:[[0,0],[0.45,-22],[0.75,-22],[1.0,0]], foot_far:[[0,0],[0.45,-30],[0.75,-30],[1.0,0]]},
   beats:[[0.25,'ชูดาบเรียกขึ้นฟ้า เงยหน้า'],[0.45,'ดาบใหญ่ตกลงปักข้างหน้า (เดิม) ย่อเข่า ชี้ดาบไปที่ดาบใหญ่'],[1.0,'ฮีล + DEF ขึ้น กลับท่ายืน'],[6.1,'วงดาบ 210 px คลื่น 7 ระลอกออกจากดาบใหญ่ (เดิม)']]},
 S9:{nm:'คมดาบดูดชีพ (r3 ใหม่)', dur:1.0, len:1.8, col:[230,20,50], hits:[], fx:0.45,
   keys:{torso:[[0,0],[0.2,4],[0.45,-4],[0.62,-10],[0.8,-8],[1.0,0]], head:[[0,0],[0.2,-6],[0.45,-8],[0.62,6],[1.0,0]],
     arm_near:[[0,0],[0.2,95],[0.45,55],[0.62,-25],[0.8,-22],[1.0,0]], fist_near:[[0,0],[0.2,-95],[0.45,-55],[0.62,40],[0.8,38],[1.0,0]],
     arm_far:[[0,0],[0.2,78],[0.45,80],[0.62,20],[0.8,18],[1.0,0]], forearm_far:[[0,0],[0.2,30],[0.45,30],[0.62,10],[1.0,0]],
     leg_near:[[0,0],[0.2,8],[0.62,24],[0.8,24],[1.0,0]], foot_near:[[0,0],[0.62,-22],[0.8,-22],[1.0,0]],
     leg_far:[[0,0],[0.2,-6],[0.62,-18],[0.8,-18],[1.0,0]]},
   beats:[[0.2,'ยกดาบขวางตรงอก มืออีกข้างแบออกหน้าใบดาบ'],[0.45,'ลากคมดาบผ่านฝ่ามือ เลือดแดงซึมเข้าใบดาบ (บัฟเข้า 0.45)'],[0.62,'สะบัดดาบลงข้างตัว หยดแดงกระเซ็นเป็นเสี้ยว ตาข้างหนึ่งจุดออร่าแดง'],[1.0,'ใบดาบแดงเรือง มีเส้นเลือดวนรอบใบ'],[1.8,'กลับท่ายืน ดาบแดง + ตาแดงค้างตลอดเวลาบัฟ']]}
};
var ORDER=['S1','S2','S3','S4','S5','S6','S7','S8','S9'];

/* ===== Motion main_sw.js FX functions (C.len -> c.L = live length incl. the buff) ===== */
function rnd(s){ var x=Math.sin(s*127.1+311.7)*43758.5453; return x-Math.floor(x); }
function E(x){ return x<0?0:x>1?1:x*x*(3-2*x); }
function seg(x,a,b){ return Math.max(0,Math.min(1,(x-a)/(b-a))); }
function KF(k,t){ if(t<=k[0][0]) return k[0][1]; for(var i=0;i<k.length-1;i++){ if(t<=k[i+1][0]){ var u=(t-k[i][0])/(k[i+1][0]-k[i][0]); return k[i][1]+(k[i+1][1]-k[i][1])*E(u); } } return k[k.length-1][1]; }
function glow(x,y,R,col,a){ if(a<=0) return; var g=cx.createRadialGradient(x,y,0,x,y,R); g.addColorStop(0,'rgba(255,255,255,'+a+')'); g.addColorStop(0.3,'rgba('+col.join(',')+','+(0.7*a)+')'); g.addColorStop(1,'rgba('+col.join(',')+',0)'); cx.fillStyle=g; cx.beginPath(); cx.arc(x,y,R,0,6.283); cx.fill(); }
function star(x,y,R,a,col){ if(a<=0) return; cx.save(); cx.globalAlpha=a; cx.translate(x,y); cx.fillStyle='#fff'; cx.shadowColor='rgb('+col.join(',')+')'; cx.shadowBlur=16; cx.beginPath();
  for(var i=0;i<8;i++){ var ang=i*Math.PI/4, r=i%2?R*0.28:R; cx.lineTo(Math.cos(ang)*r,Math.sin(ang)*r*0.8); } cx.closePath(); cx.fill(); cx.restore(); }
function plate(x,y,w,h,rot,a){ if(a<=0) return; cx.save(); cx.globalAlpha=a; cx.translate(x,y); cx.rotate(rot); var g=cx.createLinearGradient(-w,-h,w,h); g.addColorStop(0,'#e9f1fb'); g.addColorStop(0.5,'#8d9bb0'); g.addColorStop(1,'#4e5a6c'); cx.fillStyle=g; cx.strokeStyle='#2b313b'; cx.lineWidth=1.5; cx.beginPath(); cx.moveTo(-w,-h*0.6); cx.lineTo(0,-h); cx.lineTo(w,-h*0.6); cx.lineTo(w*0.8,h*0.7); cx.lineTo(0,h); cx.lineTo(-w*0.8,h*0.7); cx.closePath(); cx.fill(); cx.stroke(); cx.fillStyle='rgba(255,255,255,.8)'; cx.fillRect(-w*0.5,-h*0.55,w*0.3,h*0.9); cx.restore(); }
function kite(x,y,sz,rot,a,glint){ if(a<=0) return; cx.save(); cx.globalAlpha=a; cx.translate(x,y); cx.rotate(rot); cx.shadowColor='rgba(160,210,255,1)'; cx.shadowBlur=10; var g=cx.createLinearGradient(-sz,0,sz,0); g.addColorStop(0,'#5d6b80'); g.addColorStop(0.5,'#f2f7ff'); g.addColorStop(1,'#6f7d92'); cx.fillStyle=g; cx.beginPath(); cx.moveTo(0,-sz); cx.quadraticCurveTo(sz,-sz*0.9,sz*0.85,-sz*0.1); cx.quadraticCurveTo(sz*0.6,sz*0.7,0,sz*1.2); cx.quadraticCurveTo(-sz*0.6,sz*0.7,-sz*0.85,-sz*0.1); cx.quadraticCurveTo(-sz,-sz*0.9,0,-sz); cx.fill(); cx.shadowBlur=0; cx.strokeStyle='#d9b45a'; cx.lineWidth=2; cx.stroke(); cx.fillStyle='#d9b45a'; cx.fillRect(-1.5,-sz*0.7,3,sz*1.6); cx.fillRect(-sz*0.5,-sz*0.25,sz,3);
  if(glint>0){ cx.globalCompositeOperation='lighter'; cx.globalAlpha=a*glint; cx.fillStyle='#fff'; cx.beginPath(); cx.moveTo(-sz*0.5,-sz); cx.lineTo(-sz*0.1,-sz); cx.lineTo(sz*0.5,sz); cx.lineTo(sz*0.1,sz); cx.closePath(); cx.fill(); } cx.restore(); }
function skFX(c,s,p,layer){ var C=SK[c.k], col=C.col, cs='rgba('+col.join(',')+',', tip=rp(p,'sword',TIP), grip=rp(p,'sword',GRIP), hy=HY-(p.air||0)*SC;
  if(c.k==='S1'){ var D=C.dash;
    if(layer==='ground'&&s>D[0]-0.02&&s<D[1]+0.12){ var k=s<D[1]?1:1-seg(s,D[1],D[1]+0.12); for(var i=0;i<7;i++){ var yy=hy-20-rnd(i)*90, L=60+rnd(i+9)*120; cx.strokeStyle=cs+(0.55*k)+')'; cx.lineWidth=2; cx.beginPath(); cx.moveTo(HXc-30-L,yy); cx.lineTo(HXc-30,yy); cx.stroke(); }
      }
    if(layer==='top'&&tip){ C.hits.forEach(function(h,i){ var a=1-seg(s,h,h+0.16); if(s>=h&&a>0){ cx.save(); cx.globalAlpha=a; cx.strokeStyle='#fff'; cx.shadowColor=cs+'1)'; cx.shadowBlur=18; cx.lineWidth=7*a; cx.beginPath(); cx.moveTo(tip[0]-30,tip[1]); cx.lineTo(tip[0]+50+70*(1-a),tip[1]); cx.stroke(); cx.restore(); star(tip[0]+10,tip[1],38*(0.6+0.6*(1-a)),a,col); } }); } return; }
  if(c.k==='S2'){ var ch=seg(s,0.08,0.38)*(1-seg(s,0.43,0.47)), k2=seg(s,0.43,0.5)*(1-seg(s,c.L-0.25,c.L)), RED=[255,30,20];
    if(layer==='ground'){ glow(HXc,hy-40,120+50*k2,RED,0.35*k2+0.2*ch);
      var b=seg(s,0.45,0.8); if(s>=0.45&&b<1){ cx.save(); cx.strokeStyle='rgba(255,60,30,'+(1-b)+')'; cx.lineWidth=10*(1-b)+2; cx.shadowColor='rgba(255,0,0,1)'; cx.shadowBlur=20; cx.beginPath(); cx.ellipse(HXc,HY,40+b*260,(40+b*260)*0.32,0,0,6.283); cx.stroke(); cx.restore(); }
      var ck=seg(s,0.45,0.5)*(1-seg(s,C.len-0.5,C.len));/* r198: ground cracks keep the demo length, they do not follow the hero for the whole buff */ if(ck>0){ cx.save(); cx.lineCap='round'; for(var r=0;r<9;r++){ var an=r/9*6.283+0.3, L=28+rnd(r+5)*38, pts=[[HXc,HY]]; for(var q=1;q<=4;q++) pts.push([HXc+Math.cos(an+(rnd(r*7+q)-0.5)*0.5)*L*q/4, HY+Math.sin(an)*L*q/4*0.32]);
          [[4,'rgba(60,10,5,'+(0.8*ck)+')'],[1.6,'rgba(255,80,30,'+(0.95*ck)+')']].forEach(function(st){ cx.strokeStyle=st[1]; cx.lineWidth=st[0]; cx.beginPath(); pts.forEach(function(pt,i){ i?cx.lineTo(pt[0],pt[1]):cx.moveTo(pt[0],pt[1]); }); cx.stroke(); }); } cx.restore(); }
      }
    if(layer==='top'){ if(ch>0) for(var i=0;i<14;i++){ var an2=i/14*6.283+s*4, rr=150*(1-seg(s,0.08+rnd(i)*0.1,0.42)); glow(HXc+Math.cos(an2)*rr,hy-60+Math.sin(an2)*rr*0.6,9,RED,0.9*ch); }
      if(k2>0){ for(var e=0;e<14;e++){ var ph=(s*1.3+rnd(e+20))%1; glow(HXc-50+rnd(e+30)*100,hy-20-ph*170,4+3*(1-ph),[255,90,40],0.9*(1-ph)*k2); } }
      var fl=1-seg(s,0.45,0.62); if(s>=0.45&&fl>0) glow(HXc,hy-70,220,RED,0.75*fl); } return; }
  if(c.k==='S4'){ var R4=210;
    if(layer==='ground'){ var inh=seg(s,0.02,0.1)*(1-seg(s,0.24,0.3)); if(inh>0) for(var i=0;i<14;i++){ var an=i/14*6.283, r=(1-((s*2.5+rnd(i))%1))*220+20; cx.fillStyle='rgba(150,120,90,'+(0.4*inh)+')'; cx.beginPath(); cx.ellipse(HXc+Math.cos(an)*r,HY+Math.sin(an)*r*0.34-6,10,6,0,0,6.283); cx.fill(); }
      var ckk=seg(s,0.32,0.36)*(1-seg(s,1.0,1.4)); if(ckk>0){ cx.save(); cx.lineWidth=3; for(var r2=0;r2<12;r2++){ var an3=r2/12*6.283; cx.strokeStyle='rgba(50,30,15,'+(0.7*ckk)+')'; cx.beginPath(); cx.moveTo(HXc+Math.cos(an3)*20,HY+Math.sin(an3)*7); cx.lineTo(HXc+Math.cos(an3+0.15)*60,HY+Math.sin(an3+0.15)*20); cx.lineTo(HXc+Math.cos(an3)*(90+rnd(r2)*40),HY+Math.sin(an3)*(90+rnd(r2)*40)*0.34); cx.stroke(); } cx.restore(); }
      var rad=seg(s,0.3,0.35)*(1-seg(s,0.4,1.0)); if(rad>0) glow(HXc,HY-10,R4,[255,170,60],0.4*rad);
      for(var w=0;w<3;w++){ var t0=0.32+w*0.1, u=seg(s,t0,t0+0.5); if(s<t0||u>=1) continue; var R=24+E(u)*R4*(1-w*0.06)+(w?0:u*20), a=1-u;
        cx.save(); cx.strokeStyle='rgba(90,40,10,'+(0.55*a)+')'; cx.lineWidth=16*a+4; cx.beginPath(); cx.ellipse(HXc,HY,R,R*0.34,0,0,6.283); cx.stroke();
        cx.strokeStyle='rgba(255,200,90,'+(0.95*a)+')'; cx.lineWidth=8*a+2; cx.shadowColor='rgba(255,150,40,1)'; cx.shadowBlur=18; cx.stroke(); cx.shadowBlur=0; cx.strokeStyle='rgba(255,255,240,'+a+')'; cx.lineWidth=2.5; cx.stroke(); cx.restore();
        if(w===0) for(var d=0;d<18;d++){ var an4=d/18*6.283; cx.fillStyle='rgba(165,135,100,'+(0.55*a)+')'; cx.beginPath(); cx.ellipse(HXc+Math.cos(an4)*R,HY+Math.sin(an4)*R*0.34-8,12+u*16,8+u*9,0,0,6.283); cx.fill(); } } }
    if(layer==='top'){ for(var w2=0;w2<3;w2++){ var t1=0.3+w2*0.08, u2=seg(s,t1,t1+0.4); if(s<t1||u2>=1) continue; var Ra=40+u2*200, a2=1-u2; cx.save(); cx.strokeStyle='rgba(120,60,10,'+(0.4*a2)+')'; cx.lineWidth=7*a2+2; cx.beginPath(); cx.ellipse(HXc+10,hy-90,Ra,Ra*0.75,0,0,6.283); cx.stroke(); cx.strokeStyle='rgba(255,255,255,'+(0.85*a2)+')'; cx.lineWidth=4*a2+1; cx.stroke(); cx.restore(); }
      var sl=seg(s,0.3,0.34)*(1-seg(s,0.65,0.85)); if(sl>0){ cx.save(); cx.lineCap='round'; for(var l=0;l<22;l++){ var an5=l/22*6.283+rnd(l)*0.2, r0=95+rnd(l+3)*30+((s*500+rnd(l)*40)%40), r1=r0+50+rnd(l+7)*60; cx.strokeStyle='rgba(120,60,10,'+(0.35*sl)+')'; cx.lineWidth=5; cx.beginPath(); cx.moveTo(HXc+10+Math.cos(an5)*r0,hy-80+Math.sin(an5)*r0*0.75); cx.lineTo(HXc+10+Math.cos(an5)*r1,hy-80+Math.sin(an5)*r1*0.75); cx.stroke(); cx.strokeStyle='rgba(255,240,200,'+(0.85*sl)+')'; cx.lineWidth=2.5; cx.stroke(); } cx.restore(); }
      var mf=1-seg(s,0.32,0.5); if(s>=0.3&&mf>0) glow(HXc+22,hy-108,70,[255,200,120],0.85*mf);
      allMons(c).forEach(function(m){ var dd=Math.hypot((m.x-HXc)/R4,(m.y-HY)/(R4*0.34)); if(dd>1.08) return; var tt=s-0.32-dd*0.2, a3=seg(tt,0,0.05)*(1-seg(s,c.L-0.3,c.L)); if(a3<=0) return; var pop=1+0.7*(1-seg(tt,0,0.15)); cx.save(); cx.translate(m.x+monDX(m,c,s),m.y-112); cx.scale(pop,pop); cx.globalAlpha=a3; cx.fillStyle='#e8281e'; cx.strokeStyle='#fff'; cx.lineWidth=5; cx.font='bold 40px system-ui'; cx.textAlign='center'; cx.strokeText('!',0,0); cx.fillText('!',0,0); cx.restore(); }); } return; }
  if(c.k==='S5'){ var on5=seg(s,0.3,0.36)*(1-seg(s,c.L-0.3,c.L)), dome=E(seg(s,0.3,0.55)), DX=HXc+8, DY=HY, TX=tip?tip[0]:DX+40, SB=[170,215,255];
    var orb=function(front){ var oa=seg(s,0.5,0.7)*(1-seg(s,c.L-0.3,c.L)); if(oa<=0) return; for(var k=0;k<3;k++){ var an=s*2.6+k*2.094, z=Math.sin(an); if((z>0)!==front) continue; var ox=DX+Math.cos(an)*92, oy=DY-78+z*26+Math.sin(s*5+k)*6, sc=0.8+0.25*z; kite(ox,oy,15*sc,Math.cos(an)*0.5,oa*(front?1:0.7),Math.max(0,Math.sin(s*7+k*2))); } };
    if(layer==='ground'){
      if(s>=0.3){ var u=seg(s,0.3,0.7); cx.save(); cx.strokeStyle='rgba(220,240,255,'+(1-u)+')'; cx.lineWidth=7*(1-u)+1; cx.shadowColor='rgba(150,200,255,1)'; cx.shadowBlur=16; cx.beginPath(); cx.ellipse(TX,HY,20+u*190,(20+u*190)*0.32,0,0,6.283); cx.stroke(); cx.lineWidth=3*(1-u); cx.beginPath(); cx.ellipse(TX,HY,10+u*120,(10+u*120)*0.32,0,0,6.283); cx.stroke(); cx.restore();
        var du=seg(s,0.3,0.9); if(du<1) for(var d=0;d<12;d++){ var an0=d/12*6.283; cx.fillStyle='rgba(165,140,110,'+(0.5*(1-du))+')'; cx.beginPath(); cx.ellipse(TX+Math.cos(an0)*(20+du*110),HY+Math.sin(an0)*(20+du*110)*0.32-6-du*8,10+du*12,6+du*7,0,0,6.283); cx.fill(); } }
      if(on5>0){ cx.save(); cx.strokeStyle='rgba(40,40,50,'+(0.6*on5)+')'; cx.lineWidth=2.5; for(var r=0;r<7;r++){ var an=r/7*6.283+0.4; cx.beginPath(); cx.moveTo(TX,HY); cx.lineTo(TX+Math.cos(an)*(24+rnd(r)*20),HY+Math.sin(an)*(24+rnd(r)*20)*0.32); cx.stroke(); } cx.restore();
        cx.save(); cx.globalAlpha=0.45*on5*dome; cx.strokeStyle='rgba(200,225,255,1)'; cx.lineWidth=2.5; cx.beginPath(); cx.ellipse(DX,DY,105*dome,105*dome*0.32,0,0,6.283); cx.stroke(); cx.setLineDash([10,8]); cx.lineDashOffset=-s*60; cx.beginPath(); cx.ellipse(DX,DY,92*dome,92*dome*0.32,0,0,6.283); cx.stroke(); cx.restore(); }
      // light pillar from the planted sword
      var pa=seg(s,0.28,0.32)*(1-seg(s,0.45,0.85)); if(pa>0){ cx.save(); cx.globalCompositeOperation='lighter'; var w=18*(1-seg(s,0.3,0.85))+4, gp=cx.createLinearGradient(0,HY-360,0,HY); gp.addColorStop(0,'rgba(170,215,255,0)'); gp.addColorStop(0.6,'rgba(190,225,255,'+(0.45*pa)+')'); gp.addColorStop(1,'rgba(255,255,255,'+(0.75*pa)+')'); cx.fillStyle=gp; cx.fillRect(TX-w/2,HY-360,w,360); cx.fillStyle='rgba(255,255,255,'+(0.6*pa)+')'; cx.fillRect(TX-w/6,HY-300,w/3,300); cx.restore(); }
      }
    if(layer==='top'){
      // steel plates fly in from around and lock onto the body
      if(s>0.12&&s<0.5){ for(var pl=0;pl<10;pl++){ var t0=0.12+rnd(pl)*0.1, u3=seg(s,t0,0.42), an3=pl/10*6.283+0.3, rr=170*(1-E(u3)); var px=DX+Math.cos(an3)*rr, py=hy-70+Math.sin(an3)*rr*0.7; plate(px,py,7,10,an3+u3*6,seg(s,t0,t0+0.05)*(1-seg(s,0.4,0.46))); if(u3>0.2&&u3<1){ cx.strokeStyle='rgba(200,230,255,'+(0.5*(1-u3))+')'; cx.lineWidth=2; cx.beginPath(); cx.moveTo(px,py); cx.lineTo(px+Math.cos(an3)*30,py+Math.sin(an3)*21); cx.stroke(); } } }
      if(on5>0&&dome>0){ var R=105*dome, H=170*dome, cy=DY-H*0.42; cx.save(); cx.globalAlpha=on5;
        var g=cx.createRadialGradient(DX,cy,10,DX,cy,R*1.2); g.addColorStop(0,'rgba(200,225,255,0)'); g.addColorStop(0.75,'rgba(170,205,245,0.07)'); g.addColorStop(1,'rgba(200,230,255,0.32)'); cx.fillStyle=g; cx.beginPath(); cx.ellipse(DX,cy,R,H*0.62,0,0,6.283); cx.fill();
        for(var hr=0;hr<5;hr++) for(var hc2=-3;hc2<=3;hc2++){ var hx=DX+hc2*R*0.27+(hr%2)*R*0.135, hyy=DY-H*0.08-hr*H*0.19; if(Math.pow((hx-DX)/R,2)+Math.pow((hyy-cy)/(H*0.62),2)>0.82) continue; var lit=Math.max(0,Math.sin(s*5-hr*0.9+hc2*0.6)); cx.strokeStyle='rgba(235,245,255,'+(0.18+0.5*lit*lit)+')'; cx.lineWidth=1.2+lit; cx.beginPath(); for(var v=0;v<6;v++){ var a6=v/6*6.283+Math.PI/6; cx.lineTo(hx+Math.cos(a6)*R*0.13,hyy+Math.sin(a6)*H*0.1); } cx.closePath(); cx.stroke(); }
        cx.strokeStyle='rgba(255,255,255,0.85)'; cx.lineWidth=2.5; cx.shadowColor='rgba(150,200,255,1)'; cx.shadowBlur=12; cx.beginPath(); cx.ellipse(DX,cy,R,H*0.62,0,0,6.283); cx.stroke(); cx.shadowBlur=0;
        var sw=((s-0.3)*0.8)%1; cx.strokeStyle='rgba(255,255,255,'+(0.7*(1-sw))+')'; cx.lineWidth=5; cx.beginPath(); cx.ellipse(DX,cy,R,H*0.62,0,-1.9+sw*1.2,-1.2+sw*1.2); cx.stroke();
        var rp2=((s-0.3)/0.6)%1; if(s>0.55){ cx.strokeStyle='rgba(200,230,255,'+(0.5*(1-rp2))+')'; cx.lineWidth=2; cx.beginPath(); cx.ellipse(DX,cy,R*(0.6+0.4*rp2),H*0.62*(0.6+0.4*rp2),0,0,6.283); cx.stroke(); }
        cx.restore();
        for(var gl=0;gl<4;gl++){ var ph=(s*1.7+rnd(gl+40))%1; var ga=Math.sin(ph*3.14)*on5; star(DX-28+rnd(gl+41)*56,hy-30-rnd(gl+42)*100,10*ga+2,ga,SB); }
        for(var mo=0;mo<8;mo++){ var ph2=(s*0.9+rnd(mo+60))%1; glow(DX-80+rnd(mo+61)*160,DY-ph2*170,4,SB,0.7*Math.sin(ph2*3.14)*on5); } }

      if(s>=0.3&&s<0.6&&tip){ var u2=seg(s,0.3,0.6); star(TX,HY-4,60*(1.2-0.6*u2),1-u2,SB); for(var sp=0;sp<20;sp++){ var an2=-0.1-rnd(sp)*2.9, d2=u2*(60+rnd(sp+4)*100); cx.fillStyle='rgba(255,'+(200+rnd(sp)*55|0)+',120,'+(1-u2)+')'; cx.beginPath(); cx.arc(TX+Math.cos(an2)*d2,HY-4+Math.sin(an2)*d2*0.8+u2*u2*50,2.6,0,6.283); cx.fill(); }
        for(var ch=0;ch<8;ch++){ var an4=-0.3-rnd(ch+20)*2.5, d4=u2*(40+rnd(ch+21)*70); cx.fillStyle='rgba(110,90,70,'+(1-u2)+')'; cx.fillRect(TX+Math.cos(an4)*d4,HY-4+Math.sin(an4)*d4+u2*u2*70,5,4); } } } return; }
  if(c.k==='S7'){ if(layer==='ground'){ var a7=seg(s,0.2,0.3)*(1-seg(s,0.5,0.6)); if(a7<=0) return; for(var r7=0;r7<3;r7++){ cx.strokeStyle=cs+(0.8*a7)+')'; cx.lineWidth=3; var R7=40+r7*16, st=s*14+r7*2; cx.beginPath(); cx.ellipse(HXc,HY-r7*12,R7,R7*0.3,0,st,st+3.6); cx.stroke(); }
      var dust=seg(s,0.13,0.4); if(dust<1){ cx.fillStyle='rgba(140,110,80,'+(0.4*(1-dust))+')'; for(var d7=0;d7<5;d7++){ cx.beginPath(); cx.arc(HXc-40+d7*20,HY-dust*20,6+dust*10,0,6.283); cx.fill(); } } } return; }
  if(c.k==='S9'){ if(layer!=='top') return; var col9=[255,20,45], pal=rp(p,'fist_far',[40,58]);
    var bl=seg(s,0.42,0.5)*(1-seg(s,c.L-0.25,c.L));
    if(tip&&grip&&s>0.2&&s<0.47){ var u9=seg(s,0.2,0.45), mx=grip[0]+(tip[0]-grip[0])*(1-u9), my=grip[1]+(tip[1]-grip[1])*(1-u9); glow(mx,my,18,col9,0.9); for(var dp=0;dp<4;dp++){ var ph=(s*3+dp/4)%1; cx.fillStyle='rgba(200,0,30,'+(0.9*(1-ph))+')'; cx.beginPath(); cx.ellipse(mx+(rnd(dp)-0.5)*10,my+ph*50,2.5,4,0,0,6.283); cx.fill(); }
      cx.save(); cx.strokeStyle='rgba(230,20,50,.9)'; cx.shadowColor='rgba(255,0,40,1)'; cx.shadowBlur=14; cx.lineWidth=5; cx.lineCap='round'; cx.beginPath(); cx.moveTo(tip[0],tip[1]); cx.lineTo(mx,my); cx.stroke(); cx.restore(); }
    if(s>=0.45&&s<0.6){ var fb=1-seg(s,0.45,0.6); if(grip) star(grip[0],grip[1],44,fb,col9); }
    if(bl>0&&tip&&grip){ cx.save(); cx.lineCap='round'; cx.shadowColor='rgba(255,0,40,1)'; cx.shadowBlur=18; cx.strokeStyle='rgba(220,10,40,'+(0.75*bl)+')'; cx.lineWidth=7; cx.beginPath(); cx.moveTo(grip[0],grip[1]); cx.lineTo(tip[0],tip[1]); cx.stroke(); cx.shadowBlur=0;
        var dx=tip[0]-grip[0], dy=tip[1]-grip[1], ln=Math.hypot(dx,dy)||1, nx=-dy/ln, ny=dx/ln; cx.strokeStyle='rgba(255,60,80,'+(0.9*bl)+')'; cx.lineWidth=2; for(var sv=0;sv<2;sv++){ cx.beginPath(); for(var q=0;q<=20;q++){ var f=q/20, w=Math.sin(f*12-s*14+sv*3.14)*6; var X=grip[0]+dx*f+nx*w, Y=grip[1]+dy*f+ny*w; q?cx.lineTo(X,Y):cx.moveTo(X,Y); } cx.stroke(); } cx.restore();
      for(var dr=0;dr<5;dr++){ var ph2=(s*1.4+rnd(dr+9))%1, f2=rnd(dr+3); cx.fillStyle='rgba(190,0,30,'+(0.85*(1-ph2)*bl)+')'; cx.beginPath(); cx.ellipse(grip[0]+dx*f2,grip[1]+dy*f2+ph2*40,2.2,3.6,0,0,6.283); cx.fill(); } }
    if(s>=0.5&&s<0.9){ var fu=seg(s,0.5,0.9); for(var k=0;k<14;k++){ var an=-0.4+rnd(k)*1.6, d3=fu*(70+rnd(k+2)*90); cx.fillStyle='rgba(200,0,30,'+(1-fu)+')'; cx.beginPath(); cx.ellipse(HXc+30+Math.cos(an)*d3,hy-60+Math.sin(an)*d3*0.6+fu*fu*60,3.5,5,an,0,6.283); cx.fill(); }
      var ar=seg(s,0.5,0.62), aa=1-seg(s,0.6,0.9); cx.save(); cx.strokeStyle='rgba(220,10,40,'+(0.85*aa)+')'; cx.lineWidth=6*aa+1.5; cx.lineCap='round'; cx.shadowColor='rgba(255,0,40,1)'; cx.shadowBlur=16; cx.beginPath(); cx.arc(HXc+10,hy-60,72,-1.3,-1.3+2.4*ar); cx.stroke(); cx.restore(); }
    var ea=seg(s,0.55,0.62)*(1-seg(s,c.L-0.2,c.L)), e=rp(p,'head',EYE); if(ea>0&&e){ cx.save();
      for(var q2=0;q2<8;q2++){ var ph3=(s*2.4+q2/8)%1; glow(e[0]-ph3*30+Math.sin(s*7+q2)*4, e[1]-ph3*34, 13*(1-ph3)+4, col9, 0.8*(1-ph3)*ea); }
      cx.restore(); glow(e[0],e[1],16,[255,60,70],0.95*ea); var fl=1-seg(s,0.55,0.7); if(s>=0.55&&fl>0) star(e[0],e[1],28,fl,col9); } return; } }
function heroTint(c,s){ if(!c) return null; var C=SK[c.k]; if(c.k==='S2') return [255,25,15,Math.max(0.3*seg(s,0.1,0.4)*(1-seg(s,0.43,0.46)), 0.62*seg(s,0.43,0.5)*(1-seg(s,c.L-0.25,c.L)))]; if(c.k==='S5') return [120,140,170,0.38*seg(s,0.3,0.55)*(1-seg(s,c.L-0.3,c.L))]; return null; }
function auraK(c,s){ if(!c||c.k!=='S2') return 0; var C=SK[c.k]; return seg(s,0.43,0.5)*(1-seg(s,c.L-0.25,c.L)); }
R.SK=SK;
const ID2S={wsSword1:'S1',wsSword3:'S2',wsSword2:'S3',provoke:'S4',wsBuff3:'S5',wsAtk4:'S6',wsBuff4:'S7',wsAtk5:'S8',wsBuff5:'S9'};
const BUFF={S2:'wsSword3',S5:'wsBuff3',S9:'wsBuff5'};
R.ID2S=ID2S;
const SC=0.55*0.27;          /* Motion's demo puppet scale; local FX space = demo px (hero feet at 0,0, facing right) */
const HXc=0,HY=0;
let U=null,cx=null,PD=null;  /* puppet, ctx and pose used by the embedded FX functions */
const TIP=[70,18],GRIP=[70,300],EYE=[63,196];
function rp(p,part,pt){try{const W=U.solve(p),m=W[part];if(!m)return null;const gy=U.footY(W);const ax=m[0]*pt[0]+m[2]*pt[1]+m[4],ay=m[1]*pt[0]+m[3]*pt[1]+m[5];return [HXc-ax*SC,HY-(p.air||0)*SC+(ay-gy)*SC]}catch(_){return null}}
let LOC=null;/* {x,y,k,f} world -> local */
function allMons(c){const out=[];try{if(!LOC)return out;for(const e of enemies){if(!e||e.dead||!(e.hp>0))continue;out.push({x:(e.x-LOC.x)/(LOC.k*LOC.f),y:(e.y-LOC.y)/LOC.k})}}catch(_){}return out}
function monDX(){return 0}
const gt=()=>{try{if(typeof time==='number')return time}catch(_){}return performance.now()/1000};
/* ---- cast detection: a listed skill's cooldown jumps up ---- */
const last={};
function poll(){try{if(typeof P==='undefined'||!P||!P.cds)return;const sw=P.weapon&&P.weapon.t==='sword';for(const id in ID2S){const v=+P.cds[id]||0,o=last[id]||0;last[id]=v;if(sw&&v>o+.25){const k=ID2S[id];R.list=R.list.filter(q=>q.k!==k);R.cur={k,id,t0:gt(),L:SK[k].len||SK[k].dur,shook:{}};R.list.push(R.cur);R.stats.casts[k]=(R.stats.casts[k]|0)+1;R.log.push([k,+gt().toFixed(2)]);if(R.log.length>40)R.log.shift()}}}catch(e){ERR('poll',e)}}
R.list=[];
function alive(c){const C=SK[c.k];const s=gt()-c.t0;
 let L=C.len||C.dur;const bid=BUFF[c.k];if(bid){let b=null;try{b=P.buffs&&P.buffs[bid]}catch(_){}if(b&&b.t>0)L=Math.max(L,s+b.t+.25);else if(s>(C.len||C.dur))L=Math.min(c.L,s)}
 c.L=L;if(s>=L||(P&&P.dead)||!(P.weapon&&P.weapon.t==='sword'))return null;return {c,s,C}}
function active(){const out=[];for(const c of R.list){const a=alive(c);if(a)out.push(a)}R.list=out.map(a=>a.c);if(R.cur&&R.list.indexOf(R.cur)<0)R.cur=null;return out}
/* shakes from the handoff (S2 roar 12, S4 roar 11, S5 plant 8) */
const SHK={S2:[[.45,12]],S4:[[.32,11]],S5:[[.30,8]]};
function shakes(a){const L=SHK[a.c.k];if(!L)return;for(const [t,v] of L){if(a.s>=t&&!a.c.shook[t]){a.c.shook[t]=1;try{shake(v)}catch(_){}}}}
/* ---- S1 timing: the game's dash-stab with Motion's hit times ---- */
function s1(){try{const S=window.__SK1;if(!S||!S.cfg||!S.cfg.t||S._r198)return !!(S&&S._r198);S._r198=1;const t=S.cfg.t;R.s1old={hits:t.hits.slice(),end:t.end,brake:t.brake};t.hits=[.40,.56];t.end=.95;t.brake=0;/* the dash (0.17-0.40 s) ends at the first stab, no brake slide after it */
  if(Array.isArray(S.cfg.hits))S.cfg.hits.forEach((h,i)=>{if(h&&h.t!=null)h.t=t.hits[i]});return true}catch(e){ERR('s1',e);return true}}
{let n=0;const iv=setInterval(()=>{if(s1()||++n>120)clearInterval(iv)},500)}
/* ---- pose ---- */
function poseFor(a,T){const p=U.pose('idle',T,{});p.lunge=0;const C=a.C;if(a.s<C.dur){Object.keys(C.keys).forEach(k=>{p.rot[k]=(p.rot[k]||0)+KF(C.keys[k],a.s)});
  if(C.jit&&a.s>=C.jit[0]&&a.s<C.jit[1]){const j=Math.sin(T*70)*1.3;p.rot.torso=(p.rot.torso||0)+j;p.rot.arm_near=(p.rot.arm_near||0)+j*1.5}}
 p.air=(C.air&&a.s<C.dur)?KF(C.air,a.s)/SC*0.5:0;return p}
function PD0(p,a,T){return (p&&p.rot)?p:poseFor({c:a.c,C:a.C,s:9},T)}
const isHero=(x,y)=>{try{const X=window.PUPPETX;if(!X||X.inGhost||X.hideP)return false;return Math.abs(x-P.x)<.6&&Math.abs(y-(P.y-(P.jump||0)+X.cfg.FOOT_DY))<.6&&!P.dead}catch(_){return false}};
const hist=[];
let off=null,ox=null,ac=null,acx=null;
function fxLayer(c,a,p,layer,x,y,sc,face){if(a.C.ov)return;cx=c;PD=p;const k=sc/SC;LOC={x,y,k,f:face>0?1:-1};c.save();try{c.translate(x,y);c.scale(face>0?k:-k,k);skFX(a.c,a.s,p,layer);R.stats.fx++}catch(e){ERR('fx '+a.c.k,e)}finally{c.restore()}}
function hookDraw(){U=window.PUPPET;if(!U||!U.draw||!U.pose||!U.solve)return false;if(U._r198)return true;U._r198=1;const _d=U.draw;
 U.draw=function(c,x,y,sc,fac,p){try{if(typeof P!=='undefined'&&P&&isHero(x,y)){poll();const L=active();if(L.length){R.stats.draws++;L.forEach(shakes);
   const T=gt(),face=fac,self=this;
   /* pose: the newest skill still inside its motion length; otherwise the game's own pose (walk / idle / attack) */
   let m=null;for(const a of L)if(a.s<a.C.dur)m=a;
   const pp=m?poseFor(m,T):p;
   /* the game's puppet draw has no lift: carry Motion's air as a y offset (demo px -> game px) */
   const yy=y-((m&&pp.air)||0)*sc;
   for(const a of L)fxLayer(c,a,m?pp:PD0(p,a,T),'ground',x,y,sc,face);
   /* S1 after-images during the dash */
   if(m&&m.c.k==='S1'&&m.s>m.C.dash[0]&&m.s<m.C.dash[1]+.1){for(let g=hist.length-1;g>=0;g--){const h=hist[g];if(T-h.t>.09||h.t<m.c.t0)continue;try{const o=toOff(_d,self,c,h.x,h.y,sc,face,poseFor({c:m.c,C:m.C,s:h.t-m.c.t0},h.t));c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=.1+.2*(1-(T-h.t)/.09);c.drawImage(off,o.rx,o.ry);c.restore()}catch(_){}}}
   hist.push({t:T,x,y:yy});while(hist.length>6)hist.shift();
   let ta=null,TN=null;for(const a of L){const t=heroTint(a.c,a.s);if(t&&t[3]>0){ta=a;TN=t}}
   let r;if(ta){r=tinted(_d,self,c,x,yy,sc,face,pp,ta,TN,TN[3]);R.stats.tint++}else r=_d.call(self,c,x,yy,sc,face,pp);
   for(const a of L)fxLayer(c,a,m?pp:PD0(p,a,T),'top',x,y,sc,face);return r}}}catch(e){ERR('draw',e)}
  return _d.apply(this,arguments)};return true}
/* tint + S2 aura: hero drawn into an offscreen canvas (screen space, region round the hero), tinted, then put back with a glow */
/* hero drawn into an offscreen canvas: a square region (screen px) round the hero, feet at 80 % height */
function toOff(_d,self,c,x,y,sc,face,pp){
 const m=c.getTransform();if(!off){off=document.createElement('canvas');ox=off.getContext('2d');ac=document.createElement('canvas');acx=ac.getContext('2d')}
 const zs=Math.hypot(m.a,m.b)||1,Kz=zs*sc/SC,S=Math.ceil(Math.max(64,480*Kz));/* Kz = screen px per demo px */
 const sx=m.a*x+m.c*y+m.e,sy=m.b*x+m.d*y+m.f,rx=Math.round(sx-S/2),ry=Math.round(sy-S*.8);
 if(off.width!==S){off.width=off.height=S;ac.width=ac.height=S}
 ox.setTransform(1,0,0,1,0,0);ox.globalCompositeOperation='source-over';ox.globalAlpha=1;ox.filter='none';ox.clearRect(0,0,S,S);ox.setTransform(m.a,m.b,m.c,m.d,m.e-rx,m.f-ry);
 const r=_d.call(self,ox,x,y,sc,face,pp);return {r,S,rx,ry,sx,sy,zs,Kz}}
function tinted(_d,self,c,x,y,sc,face,pp,a,TN,tint){
 const o=toOff(_d,self,c,x,y,sc,face,pp),r=o.r,S=o.S,rx=o.rx,ry=o.ry,sx=o.sx,sy=o.sy,Kz=o.Kz;
 ox.setTransform(1,0,0,1,0,0);ox.globalCompositeOperation='source-atop';ox.fillStyle='rgba('+TN[0]+','+TN[1]+','+TN[2]+','+tint+')';ox.fillRect(0,0,S,S);
 if(a.c.k==='S5'){const s=a.s;/* body sheen band 0.30-0.80 */ if(s>.3&&s<.8){const by=S*.8-S*.33+((s-.3)/.5)*S*.45;const gb=ox.createLinearGradient(0,by-S*.06,0,by+S*.06);gb.addColorStop(0,'rgba(255,255,255,0)');gb.addColorStop(.5,'rgba(255,255,255,.8)');gb.addColorStop(1,'rgba(255,255,255,0)');ox.fillStyle=gb;ox.fillRect(0,by-S*.06,S,S*.12)}
  const gl=.12+.08*Math.sin(gt()*5);const g2=ox.createLinearGradient(S/2-S*.08,0,S/2+S*.08,0);g2.addColorStop(0,'rgba(255,255,255,0)');g2.addColorStop(.5,'rgba(255,255,255,'+(gl*tint)+')');g2.addColorStop(1,'rgba(255,255,255,0)');ox.fillStyle=g2;ox.fillRect(0,0,S,S)}
 ox.globalCompositeOperation='source-over';
 c.save();c.setTransform(1,0,0,1,0,0);
 const ak=auraK(a.c,a.s);if(ak>0){acx.setTransform(1,0,0,1,0,0);acx.globalCompositeOperation='source-over';acx.clearRect(0,0,S,S);acx.drawImage(off,0,0);acx.globalCompositeOperation='source-in';acx.fillStyle='rgb(255,30,10)';acx.fillRect(0,0,S,S);
  const T=gt(),fx0=sx,fy0=sy+4*Kz;for(let i=0;i<4;i++){const fl=Math.sin(T*(13+i*3)+i)*.5+.5,s2=1.06+i*.07+.03*fl,up=(i*9+fl*6)*Kz;c.filter='blur('+((5+i*3)*Kz).toFixed(1)+'px)';c.globalAlpha=ak*(.85-i*.17);
   c.setTransform(s2,0,0,s2,fx0*(1-s2),fy0*(1-s2)-up);c.drawImage(ac,rx,ry)}c.filter='none';c.globalAlpha=1;c.setTransform(1,0,0,1,0,0)}
 c.shadowColor=a.c.k==='S5'?'rgba(200,230,255,'+Math.min(1,tint*1.6)+')':'rgba(255,20,10,'+Math.min(1,tint*1.5)+')';c.shadowBlur=26*Kz;c.drawImage(off,rx,ry);c.shadowBlur=12*Kz;c.drawImage(off,rx,ry);c.restore();return r}
{let n=0;const iv=setInterval(()=>{if(hookDraw()||++n>240)clearInterval(iv)},500)}
})();

