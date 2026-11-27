
/* dagger_combo_r8 dagger_combo.js (Motion, DeaRz 07:56) */
// Twin dagger 3-click combo r1 (Motion, 12 Nov). Written with WORLD aims (0 up, 90 back, 180 down, 270 forward; facing right):
// arm_near / arm_far = shoulder->fist direction, 'sword@fist_near' / 'offhand@fist_far' = blade tip direction (turns the fist).
// Times in SECONDS. Lunge: - = forward (rig units). Each click starts and ends at idle (env ramps in/out).
(function(){
var U=window.PUPPET, K=U.WEAPON_KF;
function E(x){return x<0?0:x>1?1:x*x*(3-2*x);}
function key(keys,q){ if(!keys) return 0; for(var i=1;i<keys.length;i++){ if(q<=keys[i][0]){ var a=keys[i-1],b=keys[i],u=E((q-a[0])/((b[0]-a[0])||1)); return a[1]+(b[1]-a[1])*u; } } return keys[keys.length-1][1]; }
function T(a,d){ return (a||[[0,0]]).map(function(x){return [x[0]/d,x[1]];}); }
// r2: torso is the rig root (it tilts the legs too). Torso NEGATIVE = lean forward when facing right.
// Legs are written as wanted WORLD angles (near back -, far forward +) and the torso tilt is removed; feet = -world leg so soles stay flat.
function tk(a,t){ for(var i=1;i<a.length;i++){ if(t<=a[i][0]){ var u=E((t-a[i-1][0])/((a[i][0]-a[i-1][0])||1)); return a[i-1][1]+(a[i][1]-a[i-1][1])*u; } } return a[a.length-1][1]; }
// r4 (DeaRz 07:44-07:45 "เปรียบเทียบเฉยๆไม่ได้จะให้ขยับ / แค่อาวุธมีดสั้น"): no forward travel; fight in place, footwork = steps in place.
// r3 (DeaRz 05:07 "legs still drag on the ground"): real footwork. Each foot has a GROUND position track (rig units, forward +, from the start hip);
// the leg angle is solved from foot vs hip (hip = -lunge): angle = atan((foot-hip)/LEG). A planted foot keeps its key value, a step moves it while the body bobs.
var LEG=70;
function feet(k,fN,fF,lun,tor,d){ var ts={}; fN.concat(fF,lun,tor).forEach(function(x){ ts[x[0]]=1; }); for(var t=0;t<=d+1e-6;t+=0.02) ts[+t.toFixed(3)]=1;
  var tt=Object.keys(ts).map(Number).filter(function(t){return t<=d+1e-6;}).sort(function(a,b){return a-b;});
  function ang(f,t){ var a=Math.atan((tk(f,t)+tk(lun,t))/LEG)*180/Math.PI; return Math.max(-55,Math.min(55,a)); }
  function m(f){ return T(tt.map(function(t){ return [t,f(t)]; }),d); }
  k.leg_near=m(function(t){return ang(fN,t)-tk(tor,t);}); k.leg_far=m(function(t){return ang(fF,t)-tk(tor,t);});
  k.foot_near=m(function(t){return -ang(fN,t);}); k.foot_far=m(function(t){return -ang(fF,t);}); }
function legs(k,st,tor,d){ var ts={}; st.concat(tor).forEach(function(x){ ts[x[0]]=1; }); var tt=Object.keys(ts).map(Number).sort(function(a,b){return a-b;});
  function m(f){ return T(tt.map(function(t){ return [t,f(tk(st,t),tk(tor,t))]; }),d); }
  k.leg_near=m(function(s,o){return -s-o;}); k.leg_far=m(function(s,o){return s-o;}); k.foot_near=m(function(s){return s;}); k.foot_far=m(function(s){return -s;}); }
var D={};
// ---- click 1: cross slash. Near hand chops down-forward, far hand answers with a rising slash.
D[1]={name:'คลิก 1 สับไขว้',dur:0.45,hits:[0.19,0.29],
  env:[[0,0],[0.07,1],[0.34,1],[0.45,0]],
  armN:[[0,200],[0.12,375],[0.2,235],[0.45,235]], bladeN:[[0,200],[0.12,40],[0.2,215],[0.45,215]],
  armF:[[0,180],[0.12,140],[0.22,150],[0.3,300],[0.45,300]], bladeF:[[0,180],[0.12,170],[0.22,180],[0.3,340],[0.45,340]],
  foreN:[[0,0],[0.12,-30],[0.2,0]], foreF:[[0,0],[0.2,-20],[0.3,0]],
  torso:[[0,0],[0.12,-6],[0.2,-26],[0.3,-20],[0.45,0]], stance:[[0,0]], fN:[[0,-8],[0.2,-8],[0.28,-22],[0.36,-22],[0.45,-8]], fF:[[0,8],[0.04,8],[0.13,32],[0.38,32],[0.45,8]], bumps:[[0.085,8],[0.24,7],[0.415,6]],
  lunge:[[0,0]],
  trails:[['n',0.13,0.22],['f',0.23,0.32]], fx:{0.19:'slash',0.29:'slash'},
  beats:[[0,0.12,'ง้างมีดขวาขึ้น'],[0.12,0.21,'สับลง (มีดหน้า)'],[0.21,0.31,'เสยขึ้น (มีดหลัง)'],[0.31,0.45,'กลับท่ายืน']]};
// ---- click 2: step in, double stab (near then far), staggered.
D[2]={name:'คลิก 2 แทงคู่',dur:0.45,hits:[0.18,0.28],
  env:[[0,0],[0.06,1],[0.35,1],[0.45,0]],
  armN:[[0,200],[0.1,120],[0.18,272],[0.24,262],[0.45,262]], bladeN:[[0,200],[0.1,250],[0.18,272],[0.24,268],[0.45,268]],
  armF:[[0,180],[0.1,130],[0.2,125],[0.28,275],[0.45,275]], bladeF:[[0,180],[0.1,255],[0.2,255],[0.28,272],[0.45,272]],
  foreN:[[0,0],[0.1,-70],[0.18,0]], foreF:[[0,0],[0.2,-70],[0.28,0]],
  torso:[[0,0],[0.1,-8],[0.18,-30],[0.28,-30],[0.45,0]], stance:[[0,0]], fN:[[0,-8],[0.08,-8],[0.16,-30],[0.36,-30],[0.45,-8]], fF:[[0,8],[0.03,8],[0.15,40],[0.38,40],[0.45,8]], bumps:[[0.09,12],[0.415,7]],
  lunge:[[0,0]],
  trails:[['n',0.12,0.2],['f',0.21,0.3]], fx:{0.18:'stab',0.28:'stab'},
  beats:[[0,0.1,'ดึงมีดทั้งคู่ไว้ข้างหลัง'],[0.1,0.2,'ก้าวเท้าออก แทงมีดหน้า'],[0.2,0.3,'แทงมีดหลังตาม'],[0.3,0.45,'กลับท่ายืน']]};
// ---- click 3: shadow dash with 3 fast alternating slashes, then jump and X-slash down, land.
D[3]={name:'คลิก 3 ฟันรัว + กระโดดฟันกากบาท',dur:1.05,hits:[0.24,0.33,0.42,0.74],
  env:[[0,0],[0.06,1],[0.92,1],[1.05,0]],
  armN:[[0,200],[0.12,20],[0.24,240],[0.3,200],[0.42,265],[0.5,265],[0.6,10],[0.66,350],[0.74,215],[0.9,215],[1.05,200]],
  bladeN:[[0,200],[0.12,60],[0.24,215],[0.3,200],[0.42,275],[0.5,275],[0.6,30],[0.66,20],[0.74,205],[0.9,205],[1.05,200]],
  armF:[[0,180],[0.15,150],[0.24,140],[0.33,310],[0.42,300],[0.5,300],[0.6,340],[0.66,330],[0.74,240],[0.9,240],[1.05,180]],
  bladeF:[[0,180],[0.15,175],[0.24,175],[0.33,345],[0.42,330],[0.5,330],[0.6,10],[0.66,0],[0.74,220],[0.9,220],[1.05,180]],
  foreN:[[0,0],[0.12,-30],[0.24,0],[0.6,-25],[0.74,0]], foreF:[[0,0],[0.24,-20],[0.33,0]],
  torso:[[0,0],[0.1,-18],[0.24,-28],[0.33,-24],[0.42,-30],[0.5,-20],[0.62,6],[0.74,-30],[0.86,-22],[1.05,0]],
  stance:[[0,0]], fN:[[0,-8],[0.1,-8],[0.16,-22],[0.24,-22],[0.3,-6],[0.36,-6],[0.42,-24],[0.52,-24],[0.6,-14],[0.76,-26],[0.92,-26],[1.05,-8]], fF:[[0,8],[0.12,8],[0.18,28],[0.26,28],[0.32,12],[0.38,12],[0.44,32],[0.52,32],[0.6,14],[0.76,30],[0.92,30],[1.05,8]], bumps:[[0.15,9],[0.21,9],[0.29,9],[0.35,9],[0.42,9],[0.98,6]],
  lunge:[[0,0]],
  air:[[0,0],[0.5,0],[0.62,130],[0.68,120],[0.76,0],[1.05,0]],
  trails:[['n',0.16,0.26],['f',0.26,0.35],['n',0.35,0.44],['n',0.67,0.77],['f',0.67,0.77]], fx:{0.24:'slash',0.33:'slash',0.42:'slash',0.74:'cross'},
  beats:[[0,0.12,'ย่อตัว'],[0.12,0.45,'ซอยเท้าอยู่กับที่ ฟันสลับ 3 ครั้ง'],[0.45,0.62,'กระโดดขึ้น ชูมีดทั้งคู่'],[0.62,0.76,'ฟันกากบาทลงพร้อมกัน'],[0.76,0.9,'ลงพื้น ย่อรับ'],[0.9,1.05,'กลับท่ายืน']]};
var C={};
[1,2,3].forEach(function(n){ var d=D[n], du=d.dur, k={torso:T(d.torso,du),head:T(d.torso.map(function(x){return [x[0],-0.5*x[1]];}),du)};
  feet(k,d.fN,d.fF,d.lunge,d.torso,du); k.forearm_near=T(d.foreN,du); k.forearm_far=T(d.foreF,du);
  K['dagger_c'+n]={dur:du,hits:d.hits.map(function(h){return h/du;}),keys:k,env:T(d.env,du),
    world:{arm_near:T(d.armN,du),arm_far:T(d.armF,du),'sword@fist_near':T(d.bladeN,du),'offhand@fist_far':T(d.bladeF,du)}};
  C[n]={name:d.name,dur:du,hitT:d.hits,fx:d.fx,trails:d.trails,lunge:T(d.lunge,du),air:T(d.air,du),bumps:d.bumps||[],beats:d.beats}; });
window.DGC=C;
window.dgPose=function(n,q){ var c=C[n], p=U.pose('dagger_c'+n,q*c.dur,{dur:c.dur}); var t=q*c.dur;
  p.lunge=key(c.lunge,q); p.air=key(c.air,q); c.bumps.forEach(function(b){ var u=(t-b[0])/0.07+0.5; if(u>0&&u<1) p.air+=b[1]*Math.sin(u*Math.PI); }); p.turn=0; p.over=false; p.q=q; p.hit=n;
  var b=''; c.beats.forEach(function(x){ if(t>=x[0]&&t<x[1]) b=x[2]; }); p.beat=b; return p; };
window.dgEndLunge=function(n){ var l=C[n].lunge; return l[l.length-1][1]; };
})();

