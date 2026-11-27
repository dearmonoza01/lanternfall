
/* Steam HAMMER r7 data (Motion poses: wrench_kf.js -> PUPPET.WEAPON_KF wr_0..8, WRC, wrPose with far-hand grip IK; Art starter hammer rot3, head up 640x757, pivot (320,530), head centre (320,200)) */
window.__HAMMER_ART={starter:'assets/745b35d1c6bdb8a8.png',len:736};
// Giant wrench (steam mechanic) hero poses r1 (Motion, 13 Nov). WORLD aims (0 up, 90 back, 180 down, 270 forward; facing right).
// armN/armF = shoulder->fist direction, blade = wrench head direction from the near fist. Times in SECONDS.
// grip: 1 = far hand holds the wrench handle (solved by IK each frame, see wrPose), 0 = far hand free (places/throws/winds).
// Legs: fN/fF = foot ground position (rig units, forward +) solved to leg angles (standing poses); legW = direct WORLD leg angles [near,far] for jumps/seated (overrides feet).
(function(){
var U=window.PUPPET, K=U.WEAPON_KF;
function E(x){return x<0?0:x>1?1:x*x*(3-2*x);}
function key(keys,q){ if(!keys) return 0; for(var i=1;i<keys.length;i++){ if(q<=keys[i][0]){ var a=keys[i-1],b=keys[i],u=E((q-a[0])/((b[0]-a[0])||1)); return a[1]+(b[1]-a[1])*u; } } return keys[keys.length-1][1]; }
function T(a,d){ return (a||[[0,0]]).map(function(x){return [x[0]/d,x[1]];}); }
function tk(a,t){ for(var i=1;i<a.length;i++){ if(t<=a[i][0]){ var u=E((t-a[i-1][0])/((a[i][0]-a[i-1][0])||1)); return a[i-1][1]+(a[i][1]-a[i-1][1])*u; } } return a[a.length-1][1]; }
var LEG=70;
function feet(k,fN,fF,tor,d){ var ts={}; fN.concat(fF,tor).forEach(function(x){ ts[x[0]]=1; }); for(var t=0;t<=d+1e-6;t+=0.02) ts[+t.toFixed(3)]=1;
  var tt=Object.keys(ts).map(Number).filter(function(t){return t<=d+1e-6;}).sort(function(a,b){return a-b;});
  function ang(f,t){ var a=Math.atan(tk(f,t)/LEG)*180/Math.PI; return Math.max(-62,Math.min(62,a)); }
  function m(f){ return T(tt.map(function(t){ return [t,f(t)]; }),d); }
  k.leg_near=m(function(t){return ang(fN,t)-tk(tor,t);}); k.leg_far=m(function(t){return ang(fF,t)-tk(tor,t);});
  k.foot_near=m(function(t){return -ang(fN,t);}); k.foot_far=m(function(t){return -ang(fF,t);}); }
function legsW(k,lw,tor,d){ var ts={}; lw.concat(tor).forEach(function(x){ ts[x[0]]=1; }); for(var t=0;t<=d+1e-6;t+=0.02) ts[+t.toFixed(3)]=1;
  var tt=Object.keys(ts).map(Number).filter(function(t){return t<=d+1e-6;}).sort(function(a,b){return a-b;});
  function L(t,i){ var a=lw, j; for(j=1;j<a.length;j++){ if(t<=a[j][0]){ var u=E((t-a[j-1][0])/((a[j][0]-a[j-1][0])||1)); return a[j-1][1][i]+(a[j][1][i]-a[j-1][1][i])*u; } } return a[a.length-1][1][i]; }
  function m(f){ return T(tt.map(function(t){ return [t,f(t)]; }),d); }
  k.leg_near=m(function(t){return L(t,0)-tk(tor,t);}); k.leg_far=m(function(t){return L(t,1)-tk(tor,t);});
  k.foot_near=m(function(t){return -0.6*L(t,0);}); k.foot_far=m(function(t){return -0.6*L(t,1);}); }
// REST (shared start/end): wrench resting on the near shoulder, head up-back, far hand under the near hand on the shaft.
var RA={armN:205,blade:30,armF:200,foreN:-95,foreF:-40,torso:0,fN:-8,fF:8};
var D={};
D[0]={name:'ยืนถือค้อน',dur:0.6,hits:[],grip:[[0,1]],
  armN:[[0,RA.armN]],bladeN:[[0,RA.blade]],armF:[[0,RA.armF]],foreN:[[0,RA.foreN]],foreF:[[0,RA.foreF]],torso:[[0,0],[0.3,1.5],[0.6,0]],fN:[[0,-8]],fF:[[0,8]],
  beats:[[0,0.6,'ยืนพัก ค้อนพาดไหล่']]};
// 1 BASIC: two-hand swing. Wind up high behind the head, step in, swing the head forward-down onto the target, follow through, back to the shoulder.
D[1]={name:'ตีปกติ ค้อนสองมือ',dur:0.7,hits:[0.32],grip:[[0,1]],
  armN:[[0,205],[0.2,425],[0.32,285],[0.42,250],[0.7,205]], bladeN:[[0,30],[0.2,118],[0.32,-98],[0.42,-125],[0.7,30]],
  armF:[[0,200],[0.7,200]], foreN:[[0,-95],[0.2,-45],[0.32,-10],[0.42,-10],[0.7,-95]], foreF:[[0,-40]],
  torso:[[0,0],[0.2,20],[0.32,-24],[0.42,-26],[0.7,0]], fN:[[0,-8],[0.2,-22],[0.32,-30],[0.56,-30],[0.7,-8]], fF:[[0,8],[0.2,14],[0.32,34],[0.56,34],[0.7,8]],
  beats:[[0,0.2,'ง้างค้อนไปไกลหลังหัว เอนตัวไปหลัง'],[0.2,0.32,'ก้าวเข้า เหวี่ยงข้ามหัวฟาดลง'],[0.32,0.46,'โดน! ค้อนจมเป้า'],[0.46,0.7,'ยกกลับพาดไหล่']]};
// 2 SLAM (skill ทุบค้อน): crouch, hop and raise the wrench straight overhead, slam it down into the ground in front (stun), hold, pull it out.
D[2]={name:'ฟาดค้อน (ทุบพื้น มอนมึน)',dur:0.95,hits:[0.5],grip:[[0,1]],
  armN:[[0,205],[0.14,215],[0.36,425],[0.5,255],[0.68,255],[0.95,205]], bladeN:[[0,30],[0.14,60],[0.36,105],[0.5,-155],[0.68,-155],[0.95,30]],
  armF:[[0,200]], foreN:[[0,-95],[0.14,-90],[0.36,-45],[0.5,0],[0.68,0],[0.95,-95]], foreF:[[0,-40]],
  torso:[[0,0],[0.14,-10],[0.36,24],[0.5,-40],[0.68,-40],[0.95,0]], air:[[0,0],[0.14,-14],[0.3,150],[0.42,110],[0.5,-18],[0.68,-18],[0.95,0]],
  fN:[[0,-8],[0.14,-20],[0.5,-50],[0.75,-50],[0.95,-8]], fF:[[0,8],[0.14,20],[0.5,48],[0.75,48],[0.95,8]],
  beats:[[0,0.14,'ย่อตัว'],[0.14,0.36,'กระโดด ง้างค้อนไปไกลหลังหัว'],[0.36,0.5,'ทุบลงพื้น'],[0.5,0.7,'โดน! พื้นแตก มอนมึน'],[0.7,0.95,'ดึงค้อนขึ้น']]};
// 3 PLACE (ก้มวาง): wrench to the near hand pointing back-down, bow down and set the machine on the ground in front with the far hand.
D[3]={name:'ก้มวางของ (ป้อม/กับดัก)',dur:0.75,hits:[],place:0.38,grip:[[0,1],[0.1,0],[0.62,0],[0.75,1]],
  armN:[[0,205],[0.12,175],[0.6,175],[0.75,205]], bladeN:[[0,30],[0.12,140],[0.6,140],[0.75,30]],
  armF:[[0,200],[0.12,255],[0.38,238],[0.5,238],[0.66,205],[0.75,200]], foreN:[[0,-95],[0.12,-20],[0.6,-20],[0.75,-95]], foreF:[[0,-40],[0.12,-30],[0.38,-5],[0.5,-5],[0.75,-40]],
  torso:[[0,0],[0.12,-15],[0.38,-56],[0.5,-56],[0.66,-10],[0.75,0]], air:[[0,0],[0.38,-30],[0.5,-30],[0.75,0]],
  fN:[[0,-8],[0.38,-36],[0.55,-36],[0.75,-8]], fF:[[0,8],[0.38,40],[0.55,40],[0.75,8]],
  beats:[[0,0.12,'ย้ายค้อนไปมือเดียว'],[0.12,0.38,'ก้มลง ถือของ'],[0.38,0.55,'วางของลงพื้น'],[0.55,0.75,'ลุกขึ้น ค้อนกลับพาดไหล่']]};
// 4 TOSS (โยน): underhand throw with the far hand, machine arcs and lands ahead.
D[4]={name:'โยนของ (ป้อม/กับดัก)',dur:0.6,hits:[],release:0.27,grip:[[0,1],[0.08,0],[0.5,0],[0.6,1]],
  armN:[[0,205],[0.1,185],[0.5,185],[0.6,205]], bladeN:[[0,30],[0.1,130],[0.5,130],[0.6,30]],
  armF:[[0,200],[0.14,120],[0.27,280],[0.36,300],[0.6,200]], foreN:[[0,-95],[0.1,-30],[0.5,-30],[0.6,-95]], foreF:[[0,-40],[0.14,-10],[0.27,0],[0.6,-40]],
  torso:[[0,0],[0.14,-6],[0.27,-18],[0.38,-12],[0.6,0]], fN:[[0,-8],[0.14,-22],[0.45,-22],[0.6,-8]], fF:[[0,8],[0.14,24],[0.45,24],[0.6,8]],
  beats:[[0,0.14,'เหวี่ยงแขนไปหลัง'],[0.14,0.27,'โยนจากล่างขึ้นหน้า'],[0.27,0.6,'ของลอยไปตกข้างหน้า']]};
// 5 WIND-UP (ไขลานปล่อยหุ่น): kneel, far hand turns the key on the mini robot's back twice, then pushes it off.
D[5]={name:'ไขลานปล่อยหุ่นจิ๋ว',dur:1.1,hits:[],release:0.86,grip:[[0,1],[0.1,0],[0.98,0],[1.1,1]],
  armN:[[0,205],[0.12,170],[0.95,170],[1.1,205]], bladeN:[[0,30],[0.12,135],[0.95,135],[1.1,30]],
  armF:[[0,200],[0.16,232],[0.28,212],[0.4,240],[0.52,212],[0.64,240],[0.76,214],[0.86,265],[0.95,250],[1.1,200]],
  foreN:[[0,-95],[0.12,-25],[0.95,-25],[1.1,-95]], foreF:[[0,-40],[0.16,-30],[0.28,-55],[0.4,-25],[0.52,-55],[0.64,-25],[0.76,-55],[0.86,0],[1.1,-40]],
  torso:[[0,0],[0.16,-38],[0.8,-38],[0.9,-30],[1.1,0]], air:[[0,0],[0.16,-30],[0.9,-30],[1.1,0]],
  fN:[[0,-8],[0.16,-44],[0.95,-44],[1.1,-8]], fF:[[0,8],[0.16,36],[0.95,36],[1.1,8]],
  beats:[[0,0.16,'คุกเข่า มือจับกุญแจไขลาน'],[0.16,0.8,'หมุนกุญแจ 2 รอบ'],[0.8,0.95,'ดันหุ่นออกไป'],[0.95,1.1,'ลุกขึ้น']]};
// 6 BLUEPRINT (ไม้ตาย step 1): overhand throw of the rolled blueprint onto the ground ahead.
D[6]={name:'โยนพิมพ์เขียว (เรียกหุ่นยนต์)',dur:0.7,hits:[],release:0.32,grip:[[0,1],[0.08,0],[0.58,0],[0.7,1]],
  armN:[[0,205],[0.1,185],[0.58,185],[0.7,205]], bladeN:[[0,30],[0.1,130],[0.58,130],[0.7,30]],
  armF:[[0,200],[0.18,385],[0.32,265],[0.42,225],[0.7,200]], foreN:[[0,-95],[0.1,-30],[0.58,-30],[0.7,-95]], foreF:[[0,-40],[0.18,-70],[0.32,0],[0.7,-40]],
  torso:[[0,0],[0.18,10],[0.32,-24],[0.45,-20],[0.7,0]], fN:[[0,-8],[0.18,-12],[0.32,-30],[0.55,-30],[0.7,-8]], fF:[[0,8],[0.18,10],[0.32,34],[0.55,34],[0.7,8]],
  beats:[[0,0.18,'ง้างพิมพ์เขียวขึ้นเหนือไหล่'],[0.18,0.32,'ขว้างลงพื้น'],[0.32,0.7,'พิมพ์เขียวกางบนพื้น เรืองแสง']]};
// 7 MOUNT (ขึ้นขี่): crouch, big jump up-forward, tuck, land seated in the cockpit; hands to the levers (wrench upright in the near hand).
D[7]={name:'กระโดดขึ้นขี่หุ่นยนต์',dur:0.9,hits:[],grip:[[0,1],[0.52,1],[0.62,0],[0.9,0]], seat:1,
  armN:[[0,205],[0.2,215],[0.32,147],[0.45,-63],[0.55,-123],[0.62,-110],[0.9,-110]], bladeN:[[0,30],[0.2,30],[0.32,-38],[0.45,-248],[0.55,-308],[0.62,-360],[0.9,-360]],
  armF:[[0,200],[0.4,300],[0.6,250],[0.9,252]], foreN:[[0,-95],[0.4,-60],[0.6,-70],[0.9,-70]], foreF:[[0,-40],[0.4,-30],[0.6,-40],[0.9,-40]],
  torso:[[0,0],[0.2,-22],[0.32,-90],[0.45,-300],[0.55,-360],[0.62,-356],[0.9,-360]],
  legW:[[0,[-8,8]],[0.2,[-28,30]],[0.32,[-8,10]],[0.45,[60,85]],[0.62,[72,80]],[0.9,[72,80]]],
  beats:[[0,0.2,'ย่อเตรียมกระโดด'],[0.2,0.45,'กระโดดขึ้นสูง ม้วนตัวพร้อมค้อน'],[0.45,0.62,'ลงนั่งในห้องคนขับ'],[0.62,0.9,'มือจับคันโยก']]};
// 8 EJECT (ดีดตัวออก): from the cockpit, spring up and BACKFLIP out (body turns a full circle backwards), land in a crouch behind; robot explodes.
D[8]={name:'ดีดตัวออก ตีลังกากลับหลัง',dur:1.05,hits:[0.8],grip:[[0,0],[0.15,1],[1.05,1]], seat:2,
  armN:[[0,250],[0.12,250],[0.22,330],[0.42,490],[0.62,650],[0.72,658],[0.82,575],[1.05,565]], bladeN:[[0,0],[0.12,0],[0.22,10],[0.42,170],[0.62,330],[0.72,338],[0.82,400],[1.05,390]],
  armF:[[0,252],[0.15,230],[1.05,200]], foreN:[[0,-70],[0.3,-80],[0.7,-80],[0.82,-95]], foreF:[[0,-40]],
  torso:[[0,0],[0.12,-12],[0.22,40],[0.62,360],[0.72,368],[0.82,350],[1.05,360]],
  legW:[[0,[72,80]],[0.12,[40,50]],[0.22,[-20,-5]],[0.4,[60,80]],[0.6,[60,80]],[0.72,[-20,20]],[0.82,[-36,40]],[0.92,[-36,40]],[1.05,[-8,8]]],
  air:[[0,0],[0.72,0],[0.82,-24],[0.92,-24],[1.05,0]],
  beats:[[0,0.12,'ย่อในห้องคนขับ'],[0.12,0.3,'ดีดตัวขึ้น'],[0.3,0.68,'ตีลังกากลับหลัง ค้อนหมุนตาม'],[0.68,0.82,'ลงพื้น ย่อรับแรง'],[0.8,1.05,'หุ่นยนต์ระเบิด!']]};
var C={};
Object.keys(D).forEach(function(n){ var d=D[n], du=d.dur, k={torso:T(d.torso,du),head:T(d.torso.map(function(x){return [x[0],-0.45*(((x[1]%360)+540)%360-180)];}),du)};
  if(d.legW) legsW(k,d.legW,d.torso,du); else feet(k,d.fN,d.fF,d.torso,du);
  k.forearm_near=T(d.foreN,du); k.forearm_far=T(d.foreF,du);
  K['wr_'+n]={dur:du,hits:d.hits.map(function(h){return h/du;}),keys:k,env:T([[0,1]],du),
    world:{arm_near:T(d.armN,du),arm_far:T(d.armF,du),'sword@fist_near':T(d.bladeN,du)}};
  C[n]={n:+n,name:d.name,dur:du,hitT:d.hits,grip:T(d.grip,du),air:T(d.air||[[0,0]],du),beats:d.beats,place:d.place,release:d.release,seat:d.seat}; });
window.WRC=C;
// far-hand grip IK: move arm_far/forearm_far so the far fist sits on the handle, GRIP px below the near hand (wrench image coords)
var GRIP=125;
function farErr(p,W){ var s=W.sword, f=W.fist_far, P=U.P;
  var gx=P.sword.pivot[0], gy=P.sword.pivot[1]+GRIP, tx=s[0]*gx+s[2]*gy+s[4], ty=s[1]*gx+s[3]*gy+s[5];
  var fx=f[0]*89+f[2]*55+f[4], fy=f[1]*89+f[3]*55+f[5]; return Math.hypot(fx-tx,fy-ty); }
function ik(p,w){ if(w<=0.01) return; var a0=p.rot.arm_far, f0=p.rot.forearm_far||0, best=farErr(p,U.solve(p)), st=24;
  for(var it=0;it<14;it++){ var moved=false;
    [['arm_far',st],['arm_far',-st],['forearm_far',st],['forearm_far',-st]].forEach(function(c){ var o=p.rot[c[0]]||0; p.rot[c[0]]=o+c[1]; var e=farErr(p,U.solve(p)); if(e<best){ best=e; moved=true; } else p.rot[c[0]]=o; });
    if(!moved){ st/=2; if(st<1) break; } }
  p.rot.forearm_far=Math.max(-150,Math.min(20,p.rot.forearm_far));
  p.rot.arm_far=a0+(p.rot.arm_far-a0)*w; p.rot.forearm_far=f0+(p.rot.forearm_far-f0)*w; }
window.wrPose=function(n,q){ var c=C[n], p=U.pose('wr_'+n,q*c.dur,{dur:c.dur}); var t=q*c.dur;
  p.lunge=0; p.air=key(c.air,q); p.turn=0; p.over=false; p.q=q; p.hit=n; ik(p,key(c.grip,q));
  var b=''; c.beats.forEach(function(x){ if(t>=x[0]&&t<x[1]) b=x[2]; }); p.beat=b; return p; };
})();

