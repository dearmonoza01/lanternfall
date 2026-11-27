
/* sword_combo_r11 sword_combo.js (Motion, DeaRz 16:09) */
// One-hand sword 3-click combo r1 (Motion, 12 Nov). Written with WORLD aims (0 up, 90 back, 180 down, 270 forward; facing right):
// arm_near / arm_far = shoulder->fist direction, 'sword@fist_near' = blade tip direction (turns the fist). Angles may go past 360 so a swing passes the right way (380 = 20, up-back).
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
// ---- click 1: overhead diagonal chop. Sword rises in front, cocks behind the head (elbow bent), chops down-forward, follow-through low.
D[1]={name:'คลิก 1 ฟันเฉียงลง',dur:0.45,hits:[0.2],
  env:[[0,0],[0.06,1],[0.34,1],[0.45,0]],
  armN:[[0,200],[0.13,385],[0.2,255],[0.27,215],[0.45,215]], bladeN:[[0,200],[0.13,405],[0.2,265],[0.27,205],[0.45,205]],
  armF:[[0,180],[0.13,235],[0.2,140],[0.3,150],[0.45,170]], bladeF:[[0,180]],
  foreN:[[0,0],[0.13,-70],[0.19,-5],[0.24,0]], foreF:[[0,0],[0.13,-30],[0.2,-10],[0.3,0]],
  torso:[[0,0],[0.13,10],[0.2,-24],[0.28,-20],[0.45,0]], fN:[[0,-8],[0.22,-8],[0.28,-18],[0.38,-18],[0.45,-8]], fF:[[0,8],[0.08,8],[0.17,32],[0.38,32],[0.45,8]], bumps:[[0.125,8],[0.415,6]],
  lunge:[[0,0]],
  trails:[['n',0.14,0.25]], fx:{0.2:'slash'},
  beats:[[0,0.13,'ยกดาบง้างไว้หลังหัว (งอศอก)'],[0.13,0.21,'ฟันเฉียงลงข้างหน้า'],[0.21,0.31,'ดาบเลยลงต่ำ'],[0.31,0.45,'กลับท่ายืน']]};
// ---- click 2: rising backhand. Sword drops low behind, sweeps up through the front and finishes high.
D[2]={name:'คลิก 2 เสยขึ้น',dur:0.45,hits:[0.2],
  env:[[0,0],[0.06,1],[0.35,1],[0.45,0]],
  armN:[[0,200],[0.12,165],[0.2,280],[0.28,335],[0.45,335]], bladeN:[[0,200],[0.12,140],[0.2,295],[0.28,375],[0.45,375]],
  armF:[[0,180],[0.12,140],[0.2,210],[0.3,200],[0.45,180]], bladeF:[[0,180]],
  foreN:[[0,0],[0.12,-25],[0.2,0]], foreF:[[0,0],[0.12,-20],[0.24,0]],
  torso:[[0,0],[0.12,-22],[0.2,-14],[0.28,0],[0.45,0]], fN:[[0,-8],[0.06,-8],[0.14,-24],[0.38,-24],[0.45,-8]], fF:[[0,8],[0.2,8],[0.26,26],[0.38,26],[0.45,8]], bumps:[[0.1,8],[0.24,10],[0.415,6]],
  lunge:[[0,0]],
  trails:[['n',0.13,0.27]], fx:{0.2:'slash'},
  beats:[[0,0.12,'ย่อตัว ลดดาบลงต่ำไว้ข้างหลัง'],[0.12,0.21,'เสยดาบขึ้นผ่านด้านหน้า'],[0.21,0.3,'ดาบจบสูง ตัวยืดขึ้น'],[0.3,0.45,'กลับท่ายืน']]};
// ---- click 3: pull back + lunging thrust, then jump with the sword overhead and smash down into the ground (heavy).
D[3]={name:'คลิก 3 แทงพุ่ง + กระโดดฟันลงพื้น',dur:1.0,hits:[0.26,0.72],
  env:[[0,0],[0.06,1],[0.88,1],[1.0,0]],
  armN:[[0,200],[0.16,120],[0.26,272],[0.4,268],[0.56,362],[0.62,366],[0.72,235],[0.86,225],[1.0,200]],
  bladeN:[[0,200],[0.16,270],[0.26,272],[0.4,272],[0.56,385],[0.62,392],[0.72,228],[0.86,215],[1.0,200]],
  armF:[[0,180],[0.16,250],[0.26,110],[0.4,130],[0.56,330],[0.62,320],[0.72,150],[0.86,160],[1.0,180]], bladeF:[[0,180]],
  foreN:[[0,0],[0.16,-95],[0.25,0],[0.5,-5],[0.6,-12],[0.7,0]] /* r10 DeaRz 16:06: jump wind-up arm straight up, sword above the head */, foreF:[[0,0],[0.16,-40],[0.26,0],[0.6,-30],[0.72,0]],
  torso:[[0,0],[0.16,10],[0.26,-32],[0.4,-26],[0.5,-10],[0.6,8],[0.72,-36],[0.86,-28],[1.0,0]],
  fN:[[0,-8],[0.1,-8],[0.16,-20],[0.4,-20],[0.46,-10],[0.72,-26],[0.9,-26],[1.0,-8]], fF:[[0,8],[0.17,8],[0.25,40],[0.42,40],[0.48,14],[0.72,30],[0.9,30],[1.0,8]], bumps:[[0.205,10],[0.95,6]],
  lunge:[[0,0]],
  air:[[0,0],[0.46,0],[0.58,150],[0.64,140],[0.72,0],[1.0,0]],
  trails:[['n',0.2,0.28],['n',0.64,0.76]], fx:{0.26:'stab',0.72:'smash'},
  beats:[[0,0.16,'ดึงดาบมาข้างเอว งอศอก'],[0.16,0.27,'ก้าวยาว แทงพุ่งตรง'],[0.27,0.46,'ดึงดาบกลับ ย่อเตรียมกระโดด'],[0.46,0.64,'กระโดด ชูดาบเหนือหัว'],[0.64,0.73,'ฟันลงกระแทกพื้น'],[0.73,0.88,'ย่อรับแรง'],[0.88,1.0,'กลับท่ายืน']]};
var C={};
[1,2,3].forEach(function(n){ var d=D[n], du=d.dur, k={torso:T(d.torso,du),head:T(d.torso.map(function(x){return [x[0],-0.5*x[1]];}),du)};
  feet(k,d.fN,d.fF,d.lunge,d.torso,du); k.forearm_near=T(d.foreN,du); k.forearm_far=T(d.foreF,du);
  K['sword_c'+n]={dur:du,hits:d.hits.map(function(h){return h/du;}),keys:k,env:T(d.env,du),
    world:{arm_near:T(d.armN,du),arm_far:T(d.armF,du),'sword@fist_near':T(d.bladeN,du)}};
  C[n]={name:d.name,dur:du,hitT:d.hits,fx:d.fx,trails:d.trails,lunge:T(d.lunge,du),air:T(d.air,du),bumps:d.bumps||[],beats:d.beats}; });
window.SWC=C;
window.swPose=function(n,q){ var c=C[n], p=U.pose('sword_c'+n,q*c.dur,{dur:c.dur}); var t=q*c.dur;
  p.lunge=key(c.lunge,q); p.air=key(c.air,q); c.bumps.forEach(function(b){ var u=(t-b[0])/0.07+0.5; if(u>0&&u<1) p.air+=b[1]*Math.sin(u*Math.PI); }); p.turn=0; p.over=false; p.q=q; p.hit=n;
  var b=''; c.beats.forEach(function(x){ if(t>=x[0]&&t<x[1]) b=x[2]; }); p.beat=b; return p; };
window.swEndLunge=function(n){ var l=C[n].lunge; return l[l.length-1][1]; };
})();

