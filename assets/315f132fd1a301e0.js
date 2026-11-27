
/* ---- r195 fishpose + fishrod (TEST ONLY).
   (1) Motion fishing poses r5 (PASSED by DeaRz 19 Nov 13:20 BKK "Okตามนั้น"; handoff motion/fishing_r5_handoff/, asked again 23 Nov 17:03 UTC "ผมเคยทำโมชั่นตกปลาไปแล้วไม่ใช่หรอ"): standing fishing pose (fishStandPose) + code rod / line / bobber (drawFishRod) replace the r175 placeholder.
       Game phase -> motion: cast press = cast 0.70 s (the bite wait starts when the bobber lands, +0.46 s); wait = wait loop; bite window = wait body + bobber dip ("!" sign kept); tap in window = bite 0.45 s then bar loop; catch = win 0.80 s (the caught fish's own icon is lifted out); 3rd miss / too early / too late = lose 0.60 s; cancel = straight back to normal.
   (2) DeaRz 23 Nov 17:06 UTC "จะตกปลาได้ต้องถือเบ็ดตกปลาก่อนนะ": new bag item fishRod "เบ็ดตกปลา" (Emma housing shop, PLACEHOLDER price 150 G / sell 75 G (Balance r1.9 proposal) until Balance + DeaRz approve; code-drawn placeholder icon until Art's icon). Bag "ใช้" = hold the rod in hand instead of the weapon (weapon hidden, rod drawn in the near fist); "ใช้" again, an attack or a skill puts it away. Casting is refused unless the rod is held. DeaRz 17:08: while holding, a click / tap casts toward that point: a yard pond there = normal fishing; no water = the line flies out, lands and vanishes (map rivers = not yet, no water outlines on the maps except Map 4's stream).
   Rig/rod code below = Motion rest_defs_r5.js + fish_rod_r5.js unchanged, except drawFishRod's optional fishDraw callback (caught fish icon).
   ?fishpose=off = old placeholder pose; ?fishrod=off = no rod item, fishing needs nothing (old rule). Debug: window.FISHPOSE195 ---- */
(function(){'use strict';
const Q=String(location.search);
const R=window.FISHPOSE195={ver:'fishpose-r195',pose:!/[?&]fishpose=off\b/.test(Q),rod:!/[?&]fishrod=off\b/.test(Q),err:null,hold:false,M:null,price:150,sell:75,stats:{draws:0,rodDraws:0,hold:0,unhold:0,refused:0,bought:0,win:0,lose:0}};
const ERR=(w,e)=>{R.err=w+': '+((e&&e.message)||e);try{console.error('[FISHPOSE195]',w,e)}catch(_){}};
/* ======== Motion rest_defs_r5.js (verbatim) ======== */
// r2 DeaRz 19 Nov 12:30 'ท่านั่งหลังตรงได้มั้ย': torso +3 (lean back) -> -3 (upright), head -3 -> +1, sit sway 1.2 -> 0.5
// ===== Home rest poses r1 (Motion, 19 Nov) — SIT on chair + LIE on bed for the puppet hero (existing parts, no new art)
// Values are DEGREES ADDED to the rig's own idle pose (U.pose('idle',t)), by final part name (leg_near, foot_near = lower leg+boot, arm_near = upper arm, ...).
// Sign (any facing, the rig mirrors): leg +  = thigh forward; foot - = knee bend (shin down/back); arm + = forward/up; torso + = lean back.
var REST={
  SIT:{ leg_near:84, leg_far:80, foot_near:-86, foot_far:-82, torso:-3, head:1, arm_near:14, forearm_near:16, fist_near:-6, arm_far:12, forearm_far:14, fist_far:-6 },
  // front/back-facing chairs (legs would point at the camera): knees less forward so the foreshortening reads
  SITF:{ leg_near:58, leg_far:54, foot_near:-60, foot_far:-56, torso:-3, head:1, arm_near:12, forearm_near:14, fist_near:-6, arm_far:10, forearm_far:12, fist_far:-6 },
  // LIE: on the back along the bed; the whole body turns with rootRot (deg) around the hip. Legs almost straight, one knee soft, hands on the belly.
  LIE:{ leg_near:4, leg_far:10, foot_near:-6, foot_far:-14, torso:0, head:6, arm_near:6, forearm_near:12, fist_near:0, arm_far:2, forearm_far:8, fist_far:0 },
  LIE_LIFT:110,           // rig units: hip raised off the mattress line along the bed's 'up' so the back (not the hip centre) rests on it
  LIE_ROOT:90,           // (art space) + bed angle; lying on the back means the HEAD points AWAY from the facing side (face right => head left)
  T:{ sitDown:0.25, standUp:0.20, lieDown:0.35, getUp:0.30 }
};
function rE(x){ return x<0?0:x>1?1:x*x*(3-2*x); }
// breathing loops (seconds)
function sitBreath(t){ var b=Math.sin(t*6.2832/3.0); return { torso:0.5*b, head:-0.4*b, arm_near:1.0*b, arm_far:-0.8*b }; }
function lieBreath(t){ var b=Math.sin(t*6.2832/4.2); return { torso:0.9*b, head:0.6*b, arm_near:1.4*b, forearm_near:-1.2*b }; }
// blend: base idle pose p (already from U.pose('idle',t)), target keys K, amount k (0..1, eased by caller), extra loop keys L
function restApply(p,K,k,L){ Object.keys(K).forEach(function(n){ if(n==='LIE_ROOT'||n==='T') return; p.rot[n]=(p.rot[n]||0)*(1-k)+K[n]*k; }); if(L) Object.keys(L).forEach(function(n){ p.rot[n]=(p.rot[n]||0)+L[n]*k; }); return p; }
// hip point in rig space (midpoint of the two leg pivots) — draw is anchored here so the hips land exactly on the seat / bed point
function hipPt(U,p){ var W=U.solve(p), a=W.leg_near, b=W.leg_far, P=U.P, pa=P.leg_near.pivot, pb=P.leg_far.pivot;
  return [ (a[0]*pa[0]+a[2]*pa[1]+a[4] + b[0]*pb[0]+b[2]*pb[1]+b[4])/2, (a[1]*pa[0]+a[3]*pa[1]+a[5] + b[1]*pb[0]+b[3]*pb[1]+b[5])/2 ]; }
// draw the hero with the hip at screen (x,y). face: 1 = right, -1 = left. Uses pose.air to cancel the rig's feet-on-ground anchor.
function drawAtHip(drawFn,U,cx,x,y,SC,face,p){ var W=U.solve(p), hp=hipPt(U,p), gy=U.footY(W); p.air=hp[1]-gy; drawFn(cx, x - hp[0]*SC*(face>0?-1:1), y, SC, face, p); }
// ===== r3 SIT-FISH (DeaRz 19 Nov 12:37 'ขอท่านั่งตกปลาด้วยนะถ้าวางเก้าอี้ไกลๆบ่อปลา'): seated on a chair at the pond, code-drawn rod in both hands.
// Matches Code's fishing states: cast (on press) -> wait (loop) -> bite -> bar (struggle loop) -> win / lose -> wait.
// Keys are ADDED ON TOP of REST.SIT (degrees, same signs). The rod is drawn from the near fist (FISH.grip in fist image px) at an angle
// relative to the world (deg, 0 = straight forward, + = up), length FISH.rodLen rig units; line from the rod tip to the bobber.
var FISH={ grip:[40,58], rodLen:430,
  // r4 standing version (DeaRz 19 Nov 13:06 'มีท่ายืนตกปลาหรือยัง'): feet apart, flat (foot = -leg), knees soft; same HOLD/state keys on top; drawn feet-on-ground (normal drawCombo), not hip-anchored
  STAND:{ leg_near:-22, leg_far:20, foot_near:24, foot_far:-22, torso:-2, head:0 },
  HOLD:{ arm_near:44, forearm_near:34, fist_near:-6, arm_far:52, forearm_far:30, fist_far:-6, torso:-2, head:2 }, rodHold:32,
  // [time s, extra keys, rod angle] — interpolated with smoothstep
  CAST:{ dur:0.70, water:0.46, keys:[[0,{},32],[0.22,{arm_near:70,forearm_near:70,arm_far:64,torso:6,head:-3},108],[0.40,{arm_near:-6,forearm_near:10,arm_far:2,torso:-8,head:4},10],[0.70,{},32]] },
  WAIT:{ per:3.2, sway:2.0, rodSway:2.5 },
  BITE:{ dur:0.45, keys:[[0,{},32],[0.10,{torso:-9,head:6,arm_near:-6,arm_far:-6},18],[0.45,{torso:4,head:-2,arm_near:22,arm_far:18},62]] },
  BAR:{ per:0.42, keys:{ torso:[2,7], arm_near:[14,26], arm_far:[10,22], head:[-1,-3] }, rod:[52,70] }, // ping-pong between the two values
  WIN:{ dur:0.80, keys:[[0,{torso:4,arm_near:22,arm_far:18},62],[0.30,{torso:8,head:-4,arm_near:56,forearm_near:40,arm_far:50},96],[0.80,{},32]], fishAt:0.30 },
  LOSE:{ dur:0.60, keys:[[0,{torso:4,arm_near:22,arm_far:18},62],[0.15,{torso:-6,head:8,arm_near:-4,arm_far:-4},14],[0.60,{},32]] } };
function fkey(K,t){ var a=K[0],b=K[K.length-1]; for(var i=1;i<K.length;i++){ if(t<=K[i][0]){ a=K[i-1]; b=K[i]; break; } } if(t>=b[0]) return {k:b[1],r:b[2]}; var u=rE((t-a[0])/((b[0]-a[0])||1)), o={};
  Object.keys(a[1]).concat(Object.keys(b[1])).forEach(function(n){ o[n]=(a[1][n]||0)*(1-u)+(b[1][n]||0)*u; }); return {k:o, r:a[2]+(b[2]-a[2])*u}; }
// returns {keys, rod} for a fishing state at time t into it (T = global clock for loops)
function fishPose(st,t,T,stand){ var H=FISH.HOLD, add={}, rod=FISH.rodHold;
  if(st==='cast'){ var f=fkey(FISH.CAST.keys,t); add=f.k; rod=f.r; }
  else if(st==='bite'){ var f2=fkey(FISH.BITE.keys,t); add=f2.k; rod=f2.r; }
  else if(st==='win'){ var f3=fkey(FISH.WIN.keys,t); add=f3.k; rod=f3.r; }
  else if(st==='lose'){ var f4=fkey(FISH.LOSE.keys,t); add=f4.k; rod=f4.r; }
  else if(st==='bar'){ var u=0.5-0.5*Math.cos(T*6.2832/FISH.BAR.per), j=Math.sin(T*37)*1.2; Object.keys(FISH.BAR.keys).forEach(function(n){ var v=FISH.BAR.keys[n]; add[n]=v[0]+(v[1]-v[0])*u+j; }); rod=FISH.BAR.rod[0]+(FISH.BAR.rod[1]-FISH.BAR.rod[0])*u+j*2; }
  else { var b=Math.sin(T*6.2832/FISH.WAIT.per); add={torso:0.6*b, head:-0.5*b, arm_near:FISH.WAIT.sway*0.4*b}; rod=FISH.rodHold+FISH.WAIT.rodSway*Math.sin(T*6.2832/FISH.WAIT.per+1); }
  var base=stand?FISH.STAND:REST.SIT, keys={}; Object.keys(base).forEach(function(n){ keys[n]=base[n]; }); if(stand&&(st==='cast'||st==='win')){ add.leg_near=(add.leg_near||0)+(add.torso||0)*0.6; add.leg_far=(add.leg_far||0)-(add.torso||0)*0.4; } Object.keys(H).forEach(function(n){ keys[n]=(keys[n]||0)+H[n]; }); Object.keys(add).forEach(function(n){ keys[n]=(keys[n]||0)+add[n]; });
  return {keys:keys, rod:rod}; }
// screen point of a rig part point for a hero drawn with drawAtHip(x,y) — call after drawAtHip (uses p.air it set)
function partScreen(U,p,part,pt,x,y,SC,face){ var W=U.solve(p), m=W[part], hp=hipPt(U,p), sg=face>0?-1:1, ax=m[0]*pt[0]+m[2]*pt[1]+m[4], ay=m[1]*pt[0]+m[3]*pt[1]+m[5]; return [x+(ax-hp[0])*SC*sg, y+(ay-hp[1])*SC]; }
// ===== r5 STAND-FISH redone from DeaRz's 4-pose reference (19 Nov 13:16 "4ช่อง ท่าง้าง ท่าเหวี่ยง ท่ารอ ท่าดึง"): wind-up, cast, wait, pull.
// Absolute keys over idle (incl. legs; feet kept flat with foot ~ -leg). rod = world angle (deg, + up), bend = rod curve (deg the tip bends down toward the line).
var FST={
  WAIT:{ k:{ leg_near:-16, foot_near:16, leg_far:16, foot_far:-16, torso:-2, head:2, arm_near:22, forearm_near:52, fist_near:-6, arm_far:62, forearm_far:30, fist_far:-6 }, rod:38, bend:14 },
  WIND:{ k:{ leg_near:-38, foot_near:38, leg_far:36, foot_far:-34, torso:10, head:-4, arm_near:158, forearm_near:40, fist_near:0, arm_far:150, forearm_far:40, fist_far:0 }, rod:118, bend:-16 },
  CAST:{ k:{ leg_near:-42, foot_near:38, leg_far:50, foot_far:-42, torso:-14, head:5, arm_near:86, forearm_near:6, fist_near:-4, arm_far:92, forearm_far:6, fist_far:-4 }, rod:6, bend:10 },
  PULL:{ k:{ leg_near:-40, foot_near:40, leg_far:36, foot_far:-30, torso:14, head:-4, arm_near:98, forearm_near:70, fist_near:0, arm_far:112, forearm_far:60, fist_far:0 }, rod:62, bend:34 },
  // timelines per state: [t, pose name, extra bend]
  cast:[[0,'WAIT'],[0.24,'WIND'],[0.40,'CAST'],[0.70,'WAIT']],
  bite:[[0,'WAIT',22],[0.10,'CAST',30],[0.45,'PULL',30]],
  win:[[0,'PULL',20],[0.30,'PULL',-10],[0.80,'WAIT',0]],
  lose:[[0,'PULL',0],[0.15,'CAST',-10],[0.60,'WAIT',0]] };
function fstMix(a,b,u){ var o={k:{},rod:a.rod+(b.rod-a.rod)*u,bend:a.bend+(b.bend-a.bend)*u}; Object.keys(a.k).forEach(function(n){ o.k[n]=a.k[n]+((b.k[n]||0)-a.k[n])*u; }); return o; }
function fishStandPose(st,t,T){ var L=FST[st], o;
  if(L){ var i=1; while(i<L.length-1&&t>L[i][0]) i++; var A=L[i-1], B=L[i], u=rE(Math.min(1,Math.max(0,(t-A[0])/((B[0]-A[0])||1)))); o=fstMix(FST[A[1]],FST[B[1]],u); o.bend+=(A[2]||0)+((B[2]||0)-(A[2]||0))*u; if(t>=B[0]&&i===L.length-1){ o=fstMix(FST[B[1]],FST[B[1]],0); o.bend+=(B[2]||0); } }
  else if(st==='bar'){ var w=0.5-0.5*Math.cos(T*6.2832/FISH.BAR.per), j=Math.sin(T*37)*1.2; o=fstMix(FST.PULL,FST.CAST,0.28*(1-w)); o.k.torso+=j; o.rod+=j*2; o.bend=40+18*w; }
  else { var b=Math.sin(T*6.2832/FISH.WAIT.per); o=fstMix(FST.WAIT,FST.WAIT,0); o.k.torso+=0.6*b; o.k.head-=0.5*b; o.rod+=FISH.WAIT.rodSway*Math.sin(T*6.2832/FISH.WAIT.per+1); o.bend+=2*b; }
  return {keys:o.k, rod:o.rod, bend:o.bend}; }

/* ======== Motion fish_rod_r5.js (+ fishDraw callback) ======== */
// Lanternfall fishing rod + line + bobber draw (Motion r5, PASSED by DeaRz 19 Nov 13:20 BKK "Okตามนั้น").
// Extracted unchanged from main_r5.js frame() so Code can call it from FISHING.pose. Needs rest_defs_r5.js (FISH, FST, partScreen, hipPt).
// cx = canvas ctx; g = screen point of the near fist grip = partScreen(U,p,'fist_near',FISH.grip,hipX,hipY,SC,face) (or the same point from your own draw);
// FP = {rod, bend} from fishStandPose / fishPose (bend default by state if missing); face = +1 right / -1 left; SC = hero draw scale;
// st = 'cast'|'wait'|'bite'|'bar'|'win'|'lose'; tt = seconds into st; T = global clock (s); water = [x,y] of the bobber rest point on the water.
function drawFishRod(cx,g,FP,face,SC,st,tt,T,water,fishDraw){
  var s=SC/0.27, f=face; if(FP.bend==null) FP.bend=st==='bar'?45:st==='bite'?30:st==='win'?30:st==='cast'?0:14;
  var a=FP.rod*Math.PI/180, dx=Math.cos(a)*f, dy=-Math.sin(a), L=FISH.rodLen*SC;
  var ba=(FP.rod-FP.bend)*Math.PI/180, mid=[g[0]+dx*L*0.55,g[1]+dy*L*0.55], tip=[mid[0]+Math.cos(ba)*f*L*0.47,mid[1]-Math.sin(ba)*L*0.47], butt=[g[0]-dx*70*SC,g[1]-dy*70*SC], bob=[water[0],water[1]];
  var IR=!!(window.ROD199&&ROD199.use&&ROD199.use()); if(IR){ ROD199.rodLen=FISH.rodLen; tip=ROD199.tip(g,FP,f,SC); } /* r199 item rod: rigid, line from its tip */
  if(st==='cast'){ var c=FISH.CAST, u=Math.max(0,Math.min(1,(tt-0.30)/(c.water-0.30))); if(tt<0.30) bob=[tip[0],tip[1]+30*s]; else bob=[tip[0]+(water[0]-tip[0])*u, tip[1]+(water[1]-tip[1])*u-Math.sin(u*Math.PI)*90*s]; }
  if(st==='bite') bob[1]+=8*s+Math.sin(T*40)*2*s;
  if(st==='bar'){ bob[0]+=Math.sin(T*9)*14*s; bob[1]+=10*s+Math.sin(T*23)*4*s; }
  if(st==='win'){ var wu=Math.max(0,Math.min(1,(tt-FISH.WIN.fishAt+0.15)/0.5)); bob=[bob[0]+(tip[0]-bob[0])*wu, bob[1]+(tip[1]+40*s-bob[1])*wu-Math.sin(wu*Math.PI)*60*s]; }
  if(st==='bite'||st==='bar'||(st==='cast'&&tt>FISH.CAST.water&&tt<FISH.CAST.water+0.25)){ cx.strokeStyle='rgba(255,255,255,.7)'; cx.lineWidth=2; for(var r=0;r<2;r++){ var q=((T*1.6+r*0.5)%1); cx.globalAlpha=1-q; cx.beginPath(); cx.ellipse(bob[0],bob[1]+6*s,(10+30*q)*s,(4+10*q)*s,0,0,6.283); cx.stroke(); } cx.globalAlpha=1; }
  function rq(u){ var a0=1-u; return [a0*a0*butt[0]+2*a0*u*mid[0]+u*u*tip[0], a0*a0*butt[1]+2*a0*u*mid[1]+u*u*tip[1]]; }
  if(IR){ ROD199.drawRod(cx,g,FP,f,SC); } else {
  cx.lineCap='round'; for(var i=0;i<10;i++){ var P0=rq(i/10), P1=rq((i+1)/10); cx.strokeStyle=i<2?'#3b2410':'#7a4e26'; cx.lineWidth=(i<2?8:7-i*0.55)*s; cx.beginPath(); cx.moveTo(P0[0],P0[1]); cx.lineTo(P1[0],P1[1]); cx.stroke(); cx.strokeStyle='rgba(255,220,160,.35)'; cx.lineWidth=1.2*s; cx.stroke(); }
  [0.32,0.5,0.66,0.8,0.92].forEach(function(u){ var P=rq(u); cx.fillStyle='#d8b25a'; cx.beginPath(); cx.arc(P[0],P[1],2.4*s,0,6.283); cx.fill(); });
  var rp0=rq(0.16); cx.fillStyle='#8c8f96'; cx.beginPath(); cx.arc(rp0[0],rp0[1]+7*s,7*s,0,6.283); cx.fill(); cx.strokeStyle='#d8b25a'; cx.lineWidth=2*s; cx.stroke(); cx.fillStyle='#3b2410'; cx.fillRect(rp0[0]-1.5*s,rp0[1]+1*s,3*s,7*s);
  } /* r199 */
  var slack=st==='lose'?40*s:st==='bar'||st==='bite'?2*s:18*s; cx.strokeStyle='rgba(255,255,255,.85)'; cx.lineWidth=1.3; cx.beginPath(); cx.moveTo(tip[0],tip[1]); cx.quadraticCurveTo((tip[0]+bob[0])/2,Math.max(tip[1],bob[1])+slack,bob[0],bob[1]); cx.stroke();
  if(st==='win'&&tt>FISH.WIN.fishAt-0.15&&fishDraw){ fishDraw(cx,bob[0],bob[1]+14*s,s,T); }
  else if(st==='win'&&tt>FISH.WIN.fishAt-0.15){ cx.save(); cx.translate(bob[0],bob[1]+14*s); cx.rotate(Math.sin(T*30)*0.5); cx.fillStyle='#f2b04a'; cx.beginPath(); cx.ellipse(0,0,22*s,10*s,0,0,6.283); cx.fill(); cx.beginPath(); cx.moveTo(18*s,0); cx.lineTo(32*s,-9*s); cx.lineTo(32*s,9*s); cx.fill(); cx.restore(); }
  else { cx.fillStyle='#e0402e'; cx.beginPath(); cx.arc(bob[0],bob[1],6*s,Math.PI,0); cx.fill(); cx.fillStyle='#fff'; cx.beginPath(); cx.arc(bob[0],bob[1],6*s,0,Math.PI); cx.fill(); }
  return {tip:tip, bob:bob}; }

/* ======== game glue ======== */
const now=()=>performance.now()/1000;
const FS=()=>window.__FISHING,PUo=()=>window.PUPPET,PX=()=>window.PUPPETX;
const say=(m,bad)=>{try{const f=FS();if(f&&f.say){f.say(m,bad);return}}catch(_){}try{toast(m)}catch(_){}};
/* ---- rod item ---- */
function rodIcon(g){try{g.save();g.lineCap='round';g.strokeStyle='#3b2410';g.lineWidth=6;g.beginPath();g.moveTo(14,54);g.lineTo(22,44);g.stroke();g.strokeStyle='#7a4e26';g.lineWidth=4;g.beginPath();g.moveTo(22,44);g.quadraticCurveTo(38,22,54,8);g.stroke();
  g.fillStyle='#d8b25a';for(const [x,y] of [[32,30],[41,20],[48,13]]){g.beginPath();g.arc(x,y,2,0,6.283);g.fill()}g.fillStyle='#8c8f96';g.beginPath();g.arc(24,50,6,0,6.283);g.fill();g.strokeStyle='#d8b25a';g.lineWidth=2;g.stroke();
  g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=1.2;g.beginPath();g.moveTo(54,8);g.quadraticCurveTo(58,30,52,48);g.stroke();g.fillStyle='#e0402e';g.beginPath();g.arc(52,50,4,Math.PI,0);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(52,50,4,0,Math.PI);g.fill();g.restore()}catch(_){}}
function regRod(){try{if(typeof ITEMS==='undefined')return false;if(!ITEMS.fishRod)ITEMS.fishRod={n:'เบ็ดตกปลา',d:'กด ใช้ เพื่อถือเบ็ด (กดอีกครั้งเพื่อเก็บ) · ต้องถือเบ็ดจึงจะตกปลาที่บ่อในลานได้ · ใช้แล้วไม่หาย',k:'use',col:'#c9a35a',icon:rodIcon,price:R.price,sell:R.sell};return true}catch(e){ERR('item',e);return false}}
if(R.rod){regRod();{let n=0;const iv=setInterval(()=>{if(regRod()&&++n>3)clearInterval(iv)},1500)}}
function setHold(v,why){v=!!v;if(R.hold===v)return;R.hold=v;if(v){R.stats.hold++;say('ถือเบ็ดตกปลาแล้ว · ไปยืนข้างบ่อแล้วกด F / แตะบ่อ')}else{R.stats.unhold++;try{const f=FS();if(f&&f.st)f.cancel('เก็บเบ็ดแล้ว · เลิกตกปลา')}catch(_){}if(why)say(why)}}
R.setHold=setHold;
if(R.rod){
 try{const _u=useItemId;useItemId=function(id){try{if(id==='fishRod'){setHold(!R.hold,'เก็บเบ็ดตกปลาแล้ว');try{if(G.win==='wInv')closeWin()}catch(_){}return}}catch(e){ERR('use',e)}return _u.apply(this,arguments)}}catch(e){ERR('hook use',e)}
 try{const _b=basicAttack;basicAttack=function(){try{if(R.hold&&!(FS()&&FS().st))setHold(false,'เก็บเบ็ดแล้ว (โจมตี)')}catch(_){}return _b.apply(this,arguments)}}catch(e){ERR('hook atk',e)}
 try{const _c=castSkill;castSkill=function(){try{if(R.hold&&arguments[0])setHold(false,'เก็บเบ็ดแล้ว (ใช้สกิล)')}catch(_){}return _c.apply(this,arguments)}}catch(e){ERR('hook skill',e)}
}
/* cast gate + motion tracking (wrap after the fishing module exists) */
let M=null,lastSt=null,cnt=null;
const snap=f=>({c:f.stats.caught,f:f.stats.failed,e:f.stats.escaped,s:f.stats.scared,x:f.stats.cancelled});
function hookFS(){const f=FS();if(!f||!f.cast||f._r195)return !!(f&&f._r195);f._r195=1;
 const _cast=f.cast;f.cast=function(){try{if(R.rod&&!R.hold){if(f.st)return false;R.stats.refused++;say(countItem('fishRod')>0?'ต้องถือเบ็ดตกปลาก่อน · เปิดกระเป๋าแล้วกด ใช้ ที่เบ็ดตกปลา':'ต้องมีเบ็ดตกปลาก่อน · ซื้อได้ที่ร้าน Emma ในเมือง',true);return false}}catch(e){ERR('gate',e)}
  const r=_cast.apply(this,arguments);try{if(r&&f.st&&R.pose){f.st.wait+=FISH.CAST.water;M={st:'cast',t0:now(),bob:[f.st.bob.x,f.st.bob.y]};lastSt=f.st;cnt=snap(f)}}catch(e){ERR('cast',e)}return r};
 return true}
{let n=0;const iv=setInterval(()=>{if(hookFS()||++n>120)clearInterval(iv)},500)}
/* current motion state: {st (motion), tt, rodSt (rod draw state), bob} or null */
function motion(){const f=FS();if(!R.pose||!f||typeof P==='undefined'||!P)return null;const t=now();
 if(f.st){const s=f.st;if(s!==lastSt){lastSt=s;M={st:'cast',t0:t,bob:[s.bob.x,s.bob.y]};cnt=snap(f)}
  M.bob=[s.bob.x,s.bob.y];
  if(s.ph==='reel'){if(!M.reel){M.reel=1;M.st='bite';M.t0=t}else if(M.st==='bite'&&t-M.t0>=FISH.BITE.dur){M.st='bar';M.t0=t}}
  else if(M.st==='cast'&&t-M.t0>=FISH.CAST.dur){M.st='wait';M.t0=t}
  const rodSt=(s.ph==='bite'&&M.st==='wait')?'bite':M.st;return {st:M.st,tt:t-M.t0,rodSt,bob:M.bob,ph:s.ph}}
 if(lastSt){lastSt=null;if(M&&cnt){const c=snap(f);if(c.c>cnt.c){M={st:'win',t0:t,bob:M.bob,fish:f.last&&f.last.fish};R.stats.win++}else if(c.f>cnt.f||c.e>cnt.e||c.s>cnt.s){M={st:'lose',t0:t,bob:M.bob};R.stats.lose++}else M=null}else M=null;if(M)M.P0=[P.x,P.y]}
 if(M&&(M.st==='win'||M.st==='lose')){const dur=M.st==='win'?FISH.WIN.dur:FISH.LOSE.dur;if(t-M.t0>=dur||Math.hypot(P.x-M.P0[0],P.y-M.P0[1])>2||(G.zone!==(window.HOUSE&&HOUSE.ZID)&&!(window.WATERFISH249&&WATERFISH249.zoneOn()))){M=null;return null}return {st:M.st,tt:t-M.t0,rodSt:M.st,bob:M.bob,fish:M.fish}}
 if(M&&M.dry){const tt=t-M.t0;if(tt>=FISH.CAST.dur||Math.hypot(P.x-M.P0[0],P.y-M.P0[1])>2){M=null;return null}if(tt>=FISH.CAST.water&&!M.said){M.said=1;say(M.msg||'ตรงนั้นไม่มีน้ำ · สายเบ็ดกับทุ่นหายไป',true)}return {st:'cast',tt,rodSt:'cast',bob:M.bob,dry:1}}
 M=null;return null}
R.motion=motion;
/* ---- hero draw: PUPPET.draw for the hero (at P.x, P.y + FOOT_DY) gets the fishing pose / hides the weapon while the rod is held ---- */
let frame=null;/* what the overlay draws this frame */
function isHero(x,y){try{const X=PX();if(!X||X.inGhost||X.hideP)return false;return Math.abs(x-P.x)<.6&&Math.abs(y-(P.y-(P.jump||0)+X.cfg.FOOT_DY))<.6&&!P.dead}catch(_){return false}}
function hookDraw(){const U=PUo();if(!U||!U.draw)return false;if(U._r195)return true;U._r195=1;const _d=U.draw;
 U.draw=function(c,x,y,sc,fac,p){try{if(typeof P!=='undefined'&&P&&isHero(x,y)){const m=motion();
   if(!m&&R.rod&&R.hold&&window.RC206&&RC206.ok()){frame=null;return RC206.draw(_d,this,c,x,y,sc,fac,p)}if(m||(R.rod&&R.hold)){const T=now(),sw=U.cfg.showSword;U.cfg.showSword=false;let p2=p,FP=null,face=fac;
    try{if(m){face=(m.bob[0]>=P.x)?1:-1;FP=fishStandPose(m.st,m.tt,T);p2=U.pose('idle',T,{});p2.lunge=0;restApply(p2,FP.keys,1,null)}
     const r=_d.call(this,c,x,y,sc,face,p2);
     /* fist grip in world px: feet-anchored draw -> hip point from the rig, then Motion's partScreen */
     const W=U.solve(p2),gy=U.footY(W),hp=hipPt(U,p2),sg=face>0?-1:1,hx=x+hp[0]*sc*sg,hy=y+(hp[1]-gy)*sc;
     const g=partScreen(U,p2,'fist_near',FISH.grip,hx,hy,sc,face);
     frame={m,FP:FP||{rod:70,bend:6},face,sc,g,T,id:R.stats.draws++,hx:x,hy:y,hp:p2};return r}finally{U.cfg.showSword=sw}}}}catch(e){ERR('draw',e)}
  return _d.apply(this,arguments)};return true}
{let n=0;const iv=setInterval(()=>{if(hookDraw()||++n>120)clearInterval(iv)},500)}
/* held rod without line (walking / standing with the rod) */
function drawRodOnly(cx,g,FP,face,SC){if(window.ROD199&&ROD199.use&&ROD199.use()){ROD199.rodLen=FISH.rodLen;ROD199.drawRod(cx,g,FP,face,SC);const s=SC/0.27,tip=ROD199.tip(g,FP,face,SC),lt=[tip[0]+2*s*face,tip[1]+40*s];cx.strokeStyle='rgba(255,255,255,.8)';cx.lineWidth=1.1;cx.beginPath();cx.moveTo(tip[0],tip[1]);cx.lineTo(lt[0],lt[1]);cx.stroke();cx.fillStyle='#e0402e';cx.beginPath();cx.arc(lt[0],lt[1],4*s,Math.PI,0);cx.fill();cx.fillStyle='#fff';cx.beginPath();cx.arc(lt[0],lt[1],4*s,0,Math.PI);cx.fill();return}const s=SC/0.27,f=face,a=FP.rod*Math.PI/180,dx=Math.cos(a)*f,dy=-Math.sin(a),L=FISH.rodLen*SC,ba=(FP.rod-FP.bend)*Math.PI/180,mid=[g[0]+dx*L*0.55,g[1]+dy*L*0.55],tip=[mid[0]+Math.cos(ba)*f*L*0.47,mid[1]-Math.sin(ba)*L*0.47],butt=[g[0]-dx*70*SC,g[1]-dy*70*SC];
 const rq=u=>{const a0=1-u;return [a0*a0*butt[0]+2*a0*u*mid[0]+u*u*tip[0],a0*a0*butt[1]+2*a0*u*mid[1]+u*u*tip[1]]};
 cx.lineCap='round';for(let i=0;i<10;i++){const P0=rq(i/10),P1=rq((i+1)/10);cx.strokeStyle=i<2?'#3b2410':'#7a4e26';cx.lineWidth=(i<2?8:7-i*0.55)*s;cx.beginPath();cx.moveTo(P0[0],P0[1]);cx.lineTo(P1[0],P1[1]);cx.stroke();cx.strokeStyle='rgba(255,220,160,.35)';cx.lineWidth=1.2*s;cx.stroke()}
 [0.32,0.5,0.66,0.8,0.92].forEach(u=>{const q=rq(u);cx.fillStyle='#d8b25a';cx.beginPath();cx.arc(q[0],q[1],2.4*s,0,6.283);cx.fill()});
 const r0=rq(0.16);cx.fillStyle='#8c8f96';cx.beginPath();cx.arc(r0[0],r0[1]+7*s,7*s,0,6.283);cx.fill();cx.strokeStyle='#d8b25a';cx.lineWidth=2*s;cx.stroke();cx.fillStyle='#3b2410';cx.fillRect(r0[0]-1.5*s,r0[1]+1*s,3*s,7*s);
 const lt=[tip[0]+2*s*f,tip[1]+40*s];cx.strokeStyle='rgba(255,255,255,.8)';cx.lineWidth=1.1;cx.beginPath();cx.moveTo(tip[0],tip[1]);cx.lineTo(lt[0],lt[1]);cx.stroke();cx.fillStyle='#e0402e';cx.beginPath();cx.arc(lt[0],lt[1],4*s,Math.PI,0);cx.fill();cx.fillStyle='#fff';cx.beginPath();cx.arc(lt[0],lt[1],4*s,0,Math.PI);cx.fill()}
function fishDrawer(id){return (cx,x,y,s,T)=>{try{const f=FS(),it=f&&f.cfg.fish[id]&&ITEMS[f.cfg.fish[id].item];if(!it||!it.icon)return;cx.save();cx.translate(x,y);cx.rotate(Math.sin(T*30)*0.35);const k=44*s/64;cx.scale(k,k);cx.translate(-32,-32);it.icon(cx);cx.restore()}catch(_){}}}
/* overlay pass (world coords, above the props): the old r175 rod/line/bobber is skipped while the r5 pose is on; the "!" bite sign is kept */
try{const _o=drawEditorOverlay;drawEditorOverlay=function(){const f=FS();let st0=null;const on=R.pose&&f&&f.st;if(on){st0=f.st;f.st=null}let r;try{r=_o.apply(this,arguments)}finally{if(on)f.st=st0}
 try{const fr=frame;frame=null;if(fr&&typeof P!=='undefined'&&P){const c=ctx;c.save();
   if(fr.m&&fr.m.dry&&fr.m.tt>=FISH.CAST.water){const m=fr.m,u=Math.min(1,(m.tt-FISH.CAST.water)/.22),k=fr.sc/0.27;drawRodOnly(c,fr.g,fr.FP,fr.face,fr.sc);if(window.ROD199&&ROD199.use&&ROD199.use())ROD199.fist(c,fr);if(u<1){c.globalAlpha=.55*(1-u);c.fillStyle='#d8cdb8';for(const [dx,dy] of [[-8,0],[7,-2],[0,-6]]){c.beginPath();c.ellipse(m.bob[0]+dx*k*(1+u),m.bob[1]+dy*k,(5+9*u)*k,(3+5*u)*k,0,0,6.283);c.fill()}c.globalAlpha=1}R.stats.rodDraws++}
   else if(fr.m){const m=fr.m;drawFishRod(c,fr.g,fr.FP,fr.face,fr.sc,m.rodSt,m.tt,fr.T,m.bob,m.st==='win'&&m.fish?fishDrawer(m.fish):null);if(window.ROD199&&ROD199.use&&ROD199.use())ROD199.fist(c,fr);R.stats.rodDraws++;
    if(m.ph==='bite'){const t=fr.T,s=1+.16*Math.sin(t*16),bx=m.bob[0],by=m.bob[1];c.translate(bx,by-34);c.scale(s,s);c.fillStyle='#ffd24a';c.strokeStyle='#7a4a00';c.lineWidth=2;c.beginPath();c.arc(0,0,13,0,6.2832);c.fill();c.stroke();c.fillStyle='#7a2a00';c.font='900 19px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('!',0,1)}}
   else{drawRodOnly(c,fr.g,fr.FP,fr.face,fr.sc);if(window.ROD199&&ROD199.use&&ROD199.use())ROD199.fist(c,fr);R.stats.rodDraws++}
   c.restore()}}catch(e){ERR('overlay',e)}return r}}catch(e){ERR('hook overlay',e)}
/* ---- Emma's housing shop (the list that sells the pond) also sells the rod ---- */
function hookShop(){try{const SW=window.__SHOPWIN;if(!SW||!SW.openNpc)return false;if(SW._r195)return true;SW._r195=1;const o=SW.openNpc;
 SW.openNpc=function(a){try{if(R.rod&&a&&a.list&&a.list.some(r=>r&&r.id==='fishPond')&&!a.list.some(r=>r&&r.id==='fishRod')){a.list=a.list.concat([{id:'fishRod',p:R.price}]);const b=a.buy;a.buy=function(id,price,qty){if(id!=='fishRod')return b.apply(this,arguments);if(countItem('fishRod')>0){say('มีเบ็ดตกปลาอยู่แล้ว',true);return 0}if((P.gold|0)<R.price)return 0;let ok=false;try{ok=addItem({id:'fishRod',q:1})!==false}catch(_){}if(!ok)return 0;P.gold-=R.price;R.stats.bought++;try{saveGame()}catch(_){}return 1}}}catch(e){ERR('shop',e)}return o.apply(this,arguments)};return true}catch(e){ERR('hookShop',e);return true}}
{let n=0;const iv=setInterval(()=>{if(hookShop()||++n>120)clearInterval(iv)},500)}
/* ---- click / tap while holding the rod = cast toward that point (DeaRz 23 Nov 17:08: "เมื่อกดคริกจะเหวี่ยงเบ็ด ... ถ้าไม่มีบ่อน้ำหรือแม่น้ำสายกับทุ่นก็จะหายไป ถ้ามีน้ำ ก็ตกปกติ").
   Water = a placed pond in the yard (ellipse of the pond water). No water = the line flies out, lands and vanishes. Rivers on the maps: not yet (no water outlines on the maps except Map 4's stream), they count as no water for now. ---- */
R.cfg={minD:70,maxD:240,rx:.34,ry:.30};
function pondAt(x,y){try{if(window.WATERFISH249&&WATERFISH249.zoneOn())return WATERFISH249.at(x,y);const H=window.HOUSE;if(!H||G.zone!==H.ZID||H.roomOn)return null;const d=H.items.fishPond;if(!d)return null;for(const o of (H.state().placed||[])){if(!o||o.id!=='fishPond')continue;const dx=(x-o.x)/(d.w*R.cfg.rx),dy=(y-o.y)/(d.h*R.cfg.ry);if(dx*dx+dy*dy<=1)return o}}catch(e){ERR('pondAt',e)}return null}
function riverAt(x,y){try{return !!(window.__M4T&&typeof __M4T.inWater==='function'&&G.zone==='w22_map4_test'&&__M4T.inWater(x,y))}catch(_){return false}}
function castAt(wx,wy){const f=FS();if(!f||f.st||(M&&(M.dry||M.st==='win'||M.st==='lose')))return false;let dx=wx-P.x,dy=wy-P.y;const d=Math.hypot(dx,dy)||1;
 let o=pondAt(wx,wy),tx=wx,ty=wy;if(!o||d>R.cfg.maxD){const k=Math.max(R.cfg.minD,Math.min(R.cfg.maxD,d))/d;tx=P.x+dx*k;ty=P.y+dy*k;o=pondAt(tx,ty)}
 R.stats.clickCast=(R.stats.clickCast||0)+1;
 if(o){const nb=f.nearPond;let ok=false;try{f.nearPond=()=>o;ok=f.cast()}finally{f.nearPond=nb}if(ok&&f.st){f.st.bob={x:tx,y:ty};return true}if(f.st)return true}
 if(f.st)return false;M={st:'cast',dry:1,t0:now(),bob:[tx,ty],P0:[P.x,P.y],msg:riverAt(tx,ty)?'ตกปลาในแม่น้ำยังไม่เปิด · ตอนนี้ตกได้ที่บ่อในลานบ้าน':null};R.stats.dry=(R.stats.dry||0)+1;try{P.face=Math.atan2(ty-P.y,tx-P.x)}catch(_){}return true}
R.castAt=castAt;
addEventListener('pointerdown',e=>{try{if(!R.rod||!R.hold||G.state!=='play'||G.win||e.button>0||e.target!==cv)return;if(window.RODFIX268&&RODFIX268.on&&!RODFIX268.take())return;const f=FS();if(f&&f.st)return;if(typeof P==='undefined'||!P||P.dead)return;
  const [wx,wy]=s2w(e.clientX,e.clientY);try{const H=window.HOUSE;if(H&&G.zone===H.ZID){if(H.build&&H.build.on)return;const it=H.build.itemAt(wx,wy);if(it&&it.id!=='fishPond')return}}catch(_){}
  e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();castAt(wx,wy)}catch(er){ERR('click',er)}},true);
/* prompt text by the pond */
setInterval(()=>{try{const pr=document.getElementById('fpPrompt');if(!pr||pr.style.display==='none')return;const t=(R.rod&&!R.hold)?'<kbd>F</kbd>ตกปลา (ต้องถือเบ็ดก่อน)':'<kbd>F</kbd>ตกปลา';if(pr.dataset.t195!==t){pr.dataset.t195=t;pr.innerHTML=t}if(R.hold&&(P.dead))setHold(false)}catch(_){}},300);
})();

