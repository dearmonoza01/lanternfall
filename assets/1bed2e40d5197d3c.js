
/* bow_combo_r9 bow_combo.js (Motion, DeaRz 04:51 / 04:53) */
// Bow 3-click combo r1 (Motion, 12 Nov). Click 1 = DeaRz bow attack (Art pose editor 9 Nov 08:39) unchanged.
// r2 (DeaRz 04:37): click 3 is a backward somersault (screen-plane roll, p.flip deg, - = backflip when facing right) instead of the flat Y-spin.
// r3 (DeaRz 04:38): real elbow draw on all clicks: upper arm swings back (elbow behind), forearm folds so the string hand reaches the chin (forearm_near), arrow kept level (world 270).
// r4 (DeaRz 04:40 legs looked odd): archer stance = legs spread apart (near back, far forward) with FEET FLAT (foot = -leg). Old keys crossed the legs.
// Click 2 = same draw, faster, with a half step forward. Click 3 = backward spin (hop back), heavy draw with charge, big piercing shot.
// Keys are written in SECONDS and converted to q (0..1). Values are added to the idle pose (deg). Lunge: + = backward (rig units).
(function(){
var U=window.PUPPET, K=U.WEAPON_KF;
function E(x){return x<0?0:x>1?1:x*x*(3-2*x);}
function key(keys,q){ if(!keys) return 0; for(var i=1;i<keys.length;i++){ if(q<=keys[i][0]){ var a=keys[i-1],b=keys[i],u=E((q-a[0])/((b[0]-a[0])||1)); return a[1]+(b[1]-a[1])*u; } } return keys[keys.length-1][1]; }
function conv(d){ var o={}; Object.keys(d.k).forEach(function(p){ o[p]=d.k[p].map(function(x){return [x[0]/d.dur,x[1]];}); });
  function tr(a){ return (a||[[0,0]]).map(function(x){return [x[0]/d.dur,x[1]];}); }
  return {name:d.name,dur:d.dur,hits:d.hits.map(function(h){return h/d.dur;}),hitT:d.hits,shot:d.shot,arrow:[d.arrow[0]/d.dur,d.arrow[1]/d.dur],keys:o,
    lunge:tr(d.lunge),air:tr(d.air),turn:tr(d.turn),flip:tr(d.flip),pull:[d.pull[0]/d.dur,d.pull[1]/d.dur],charge:d.charge?[d.charge[0]/d.dur,d.charge[1]/d.dur]:null,beats:d.beats.map(function(b){return [b[0]/d.dur,b[1]/d.dur,b[2]];})}; }
var B=K.bow&&K.bow.keys; // DeaRz bow attack keys (q over 0.55 s)
function fromQ(keys,dur){ var o={}; Object.keys(keys).forEach(function(p){ o[p]=keys[p].map(function(x){return [x[0]*dur,x[1]];}); }); return o; }
var D={};
// string arm with a real elbow: an = upper arm, fe = forearm (elbow bend), fn = fist. Arrow is aimed level by world, so its own keys are dropped.
function ST(k,ln,lf){ k.leg_near=ln; k.leg_far=lf; k.foot_near=ln.map(function(x){return [x[0],-x[1]];}); k.foot_far=lf.map(function(x){return [x[0],-x[1]];}); return k; }
function EL(k,an,fe,fn){ k.arm_near=an; k.forearm_near=fe; k.fist_near=fn; delete k.arrow; return k; }
// ---- click 1: DeaRz pose as it is
D[1]={name:'คลิก 1 ง้างยิง',dur:0.55,pull:[0.17,0.30],hits:[0.385],arrow:[0.11,0.385],shot:'shot',k:ST(EL(fromQ(B,0.55),[[0,0],[0.11,40],[0.17,40],[0.30,-60],[0.385,-60],[0.41,-72],[0.55,0]],[[0,0],[0.11,0],[0.17,10],[0.30,180],[0.385,180],[0.41,150],[0.55,0]],[[0,0],[0.385,0],[0.41,-20],[0.55,0]]),[[0,0],[0.15,-18],[0.42,-18],[0.55,0]],[[0,0],[0.15,18],[0.42,18],[0.55,0]]),
  beats:[[0,0.11,'ยกธนู'],[0.11,0.30,'พาดลูก ดึงศอกไปข้างหลัง'],[0.30,0.385,'เล็ง (ง้างสุด)'],[0.385,0.42,'ปล่อย'],[0.42,0.55,'กลับท่ายืน']]};
// ---- click 2: faster draw, half step forward, deeper stance and more lean
D[2]={name:'คลิก 2 ง้างยิง (ก้าวหน้า)',dur:0.5,pull:[0.12,0.26],hits:[0.32],arrow:[0.08,0.32],shot:'shot',
  k:{torso:[[0,0],[0.12,3],[0.26,7],[0.35,2],[0.5,0]], head:[[0,0],[0.12,-4],[0.26,-5],[0.35,-3],[0.5,0]],
     leg_near:[[0,0],[0.12,-22],[0.36,-22],[0.5,0]], leg_far:[[0,0],[0.12,22],[0.36,22],[0.5,0]],
     foot_near:[[0,0],[0.12,22],[0.36,22],[0.5,0]], foot_far:[[0,0],[0.12,-22],[0.36,-22],[0.5,0]],
     arm_far:[[0,0],[0.12,89.2],[0.26,89.2],[0.35,93.2],[0.5,0]], fist_far:[[0,0],[0.12,-14.3],[0.35,-14.3],[0.5,0]],
     arm_near:[[0,0],[0.08,40],[0.12,40],[0.26,-60],[0.32,-60],[0.35,-72],[0.5,0]], forearm_near:[[0,0],[0.08,0],[0.12,10],[0.26,180],[0.32,180],[0.35,150],[0.5,0]],
     fist_near:[[0,0],[0.32,0],[0.35,-20],[0.5,0]]},
  lunge:[[0,0],[0.06,0],[0.2,-14],[0.5,-14]],
  beats:[[0,0.08,'ก้าวครึ่งก้าว'],[0.08,0.24,'พาดลูก ง้างเร็ว'],[0.24,0.32,'เล็ง'],[0.32,0.36,'ปล่อย'],[0.36,0.5,'กลับท่ายืน']]};
// ---- click 3: backward spin, land wide, heavy draw with charge, big shot, recoil
(function(){ var an=[[0,0],[0.08,-10],[0.42,-25],[0.5,40],[0.62,40],[0.8,-50]], fn=[[0,0],[0.96,0],[0.98,-25],[1.08,-20],[1.3,0]],
    fe=[[0,0],[0.1,40],[0.4,40],[0.5,0],[0.62,10],[0.8,190],[0.96,190],[0.98,150],[1.08,150],[1.3,0]];
  for(var t=0.83,s=1;t<0.96;t+=0.035,s=-s){ an.push([t,-50+s*1.6]); } // trembling heavy draw (elbow high, hand at the cheek)
  an.push([0.96,-50],[0.98,-75],[1.08,-70],[1.3,0]);
  D[3]={name:'คลิก 3 ตีลังกาม้วนหลัง ง้างแรง ยิง',dur:1.3,pull:[0.62,0.8],hits:[0.96],arrow:[0.5,0.96],shot:'heavy',charge:[0.6,0.96],
  k:{torso:[[0,0],[0.08,10],[0.25,-6],[0.42,8],[0.5,4],[0.78,9],[0.96,9],[0.98,-6],[1.08,-3],[1.3,0]],
     head:[[0,0],[0.08,-4],[0.42,-4],[0.78,-5],[0.96,-5],[1.0,-2],[1.3,0]],
     leg_near:[[0,0],[0.08,-14],[0.16,45],[0.34,45],[0.42,-26],[0.96,-26],[1.1,-22],[1.3,0]],
     leg_far:[[0,0],[0.08,14],[0.16,40],[0.34,40],[0.42,26],[0.96,26],[1.1,22],[1.3,0]],
     foot_near:[[0,0],[0.08,14],[0.16,20],[0.34,20],[0.42,26],[0.96,26],[1.1,22],[1.3,0]], foot_far:[[0,0],[0.08,-14],[0.16,20],[0.34,20],[0.42,-26],[0.96,-26],[1.1,-22],[1.3,0]],
     arm_far:[[0,0],[0.08,20],[0.42,30],[0.5,80],[0.62,89.2],[0.96,89.2],[0.98,96],[1.08,93],[1.3,0]],
     fist_far:[[0,0],[0.42,0],[0.62,-14.3],[1.08,-14.3],[1.3,0]],
     arm_near:an, forearm_near:fe, fist_near:fn},
  lunge:[[0,0],[1.3,0]], // r7 DeaRz 04:48: flip in place, no backward travel
  air:[[0,0],[0.08,0],[0.25,270],[0.42,0],[1.3,0]],
  turn:[[0,0]],
  flip:[[0,0],[0.1,0],[0.4,-360],[1.3,-360]],
  beats:[[0,0.08,'ย่อตัว'],[0.08,0.42,'กระโดดตีลังกาม้วนหลัง (อยู่กับที่)'],[0.42,0.5,'ลงยืนกางขากว้าง'],[0.5,0.62,'พาดลูก'],[0.62,0.8,'ง้างแรง (ศอกสูง ดึงถึงแก้ม)'],[0.8,0.96,'ค้างชาร์จ (มือสั่น)'],[0.96,1.05,'ปล่อย'],[1.05,1.3,'กลับท่ายืน']]};
})();
var C={}; [1,2,3].forEach(function(n){ C[n]=conv(D[n]); K['bow_c'+n]={dur:C[n].dur,hits:C[n].hits,keys:C[n].keys,arrow:C[n].arrow,world:{arrow:[[0,270],[1,270]]}}; });
function inB(c,q){ for(var i=0;i<c.beats.length;i++){ var b=c.beats[i]; if(q>=b[0]&&q<b[1]) return b[2]; } return ''; }
window.BOWC=C;
window.bowPose=function(n,q){ var c=C[n], p=U.pose('bow_c'+n,q*c.dur,{dur:c.dur});
  p.lunge=key(c.lunge,q); p.air=key(c.air,q); p.turn=key(c.turn,q); p.flip=key(c.flip,q); p.q=q; p.hit=n; p.beat=inB(c,q); p.over=false; p.arrowOn=q>=c.arrow[0]&&q<=c.arrow[1]; p.pull=E((q-c.pull[0])/(c.pull[1]-c.pull[0])); var hq=c.hits[0]; p.snap=q>=hq?(q-hq)*c.dur:-1;
  p.charge=c.charge&&q>=c.charge[0]&&q<=c.charge[1]?(q-c.charge[0])/(c.charge[1]-c.charge[0]):0; return p; };
window.bowEndLunge=function(n){ var c=C[n]; return c.lunge[c.lunge.length-1][1]; };
})();

