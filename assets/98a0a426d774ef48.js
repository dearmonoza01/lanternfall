
/* ---- puppet_weapons_pack_r3b weapons_h10.js; patched: apply_knuckle.py ---- */
// Lanternfall chibi hero: H10 weapons + per-weapon attack poses (Code, 9 Nov 2026) r3b: DeaRz 08:30/08:39 attack poses (dagger/bow/staff/holy/scythe) + weapon placement as defaults; sword pose unchanged
// Load AFTER parts_h5.js, fist_front_parts.js, parts_h10.js, puppet_h5.js.
// API: PUPPET.setWeapon('sword'|'dagger'|'bow'|'staff'|'holy'|'scythe'); PUPPET.pose('slash'|'attack', t, {dur}) plays that weapon's attack.
(function(){
'use strict';
var U = window.PUPPET, P = U.P, ORDER = U.ORDER, cfg = U.cfg, slots = U.slots;
var G = window.PUPPET_WEAPON_GRIPS || {};
// extra parts: offhand on the far fist (dagger B, bow), arrow on the near fist (bow draw)
P.offhand = {pivot:[35,217], parent:'fist_far', at:[72,71]};
P.arrow   = {pivot:[317,33], parent:'fist_near', at:[72,71]};
var EXTRA_BEFORE = {offhand:'fist_far', arrow:'fist_near'};
function insertExtras(){ Object.keys(EXTRA_BEFORE).forEach(function(k){ var i=ORDER.indexOf(k); if(i>=0) ORDER.splice(i,1); var j=ORDER.indexOf(EXTRA_BEFORE[k]); ORDER.splice(j<0?ORDER.length:j,0,k); }); }
insertExtras();
// keep editor layouts working: they list 12 parts, extras are re-inserted after
var baseApply = U.applyLayout;
U.applyLayout = function(L){ restoreSC(); if(typeof L==='string') L=JSON.parse(L); var keep=ORDER.slice();
  Object.keys(EXTRA_BEFORE).forEach(function(k){ var i=ORDER.indexOf(k); if(i>=0) ORDER.splice(i,1); });
  var r=baseApply(L); if(ORDER.length===0) keep.forEach(function(k){ORDER.push(k);}); insertExtras(); SWORD0=snapSword(); return r; };
cfg.SC = cfg.SC||{}; cfg.REST = cfg.REST||{};
if(cfg.SC.offhand==null) cfg.SC.offhand = cfg.SC.sword||0.8;
if(cfg.SC.arrow==null) cfg.SC.arrow = cfg.SC.sword||0.8;
function snapSword(){ return {pivot:P.sword.pivot.slice(), rest:cfg.REST.sword||0}; }
var SWORD0 = snapSword(); // DeaRz's approved H5 sword placement
// rest angle of each H10 weapon relative to its fist (art is upright, tip up)
var W = {
  sword:  {main:null},                                   // approved H5 sword + DeaRz layout
  dagger: {main:'dagger_a', rest:-62, off:'dagger_b', offRest:180, sc:0.96},
  bow:    {main:null, off:'bow', offRest:168, noMain:true},
  knuckle:{main:null, noMain:true},                      // knuckle/fist: bare fists until Iron Monk knuckle art (DeaRz 05:56)
  staff:  {main:'staff_arcane', rest:-5, backIdle:true},
  holy:   {main:'staff_holy', rest:-5, backIdle:true},
  scythe: {main:'scythe', rest:50, backIdle:true}
};
cfg.WEAPON = 'sword';
var SC0=null, SCX={};
var WL={"dagger_a":{"hand":"near","pivot":[45,192],"rot":-62,"scale":0.96,"layer":"front"},"dagger_b":{"hand":"far","pivot":[36,187],"rot":82.4,"scale":0.96,"layer":"front"},"bow":{"hand":"far","pivot":[103,242],"rot":88.1,"scale":0.8,"layer":"front"},"arrow":{"hand":"near","pivot":[323,39],"rot":0,"scale":0.8,"layer":"front"},"staff_arcane":{"hand":"near","pivot":[80,409],"rot":-64.8,"scale":0.8,"layer":"front"},"staff_holy":{"hand":"near","pivot":[128,401],"rot":-70.1,"scale":0.8,"layer":"front"},"scythe":{"hand":"near","pivot":[263,492],"rot":-70.4,"scale":0.8,"layer":"front"},"sword":{"hand":"near","pivot":[86,350],"rot":-62.2,"scale":0.8,"layer":"front"}}; // DeaRz weapon placement 9 Nov 08:30 (Art editor). weapon placement from Art's editor (applyWeaponLayout), keyed by art name
function wl(n,f,d){ var o=WL[n]; return o&&o[f]!=null?o[f]:d; }
function setWeapon(name){ restoreSC(); var w=W[name]||W.sword; cfg.WEAPON=W[name]?name:'sword';
  if(SC0===null) SC0=cfg.SC.sword||0.8;
  if(w.main){ slots.sword='w_'+w.main; P.sword.pivot=wl(w.main,'pivot',G[w.main]||[0,0]).slice(); cfg.REST.sword=wl(w.main,'rot',w.rest); cfg.SC.sword=wl(w.main,'scale',w.sc||SC0); }
  else { delete slots.sword; P.sword.pivot=wl('sword','pivot',SWORD0.pivot).slice(); cfg.REST.sword=wl('sword','rot',SWORD0.rest); cfg.SC.sword=wl('sword','scale',SC0); }
  cfg.showSword = !w.noMain; if(w.noMain) slots.sword='_none';
  if(w.off){ slots.offhand='w_'+w.off; P.offhand.pivot=wl(w.off,'pivot',G[w.off]||[0,0]).slice(); cfg.REST.offhand=wl(w.off,'rot',w.offRest); cfg.SC.offhand=wl(w.off,'scale',w.sc||SC0); } else slots.offhand='_none';
  P.arrow.pivot=wl('arrow','pivot',G.arrow||P.arrow.pivot).slice(); cfg.REST.arrow=wl('arrow','rot',cfg.REST.arrow||0); cfg.SC.arrow=wl('arrow','scale',SC0);
  slots.arrow='_none';
}
// L = {version:1, weapons:{sword|dagger_a|dagger_b|bow|arrow|staff_arcane|staff_holy|scythe:{pivot,rot,scale,layer}}}
function applyWeaponLayout(L){ if(typeof L==='string') L=JSON.parse(L); WL=(L&&L.weapons)||{}; setWeapon(cfg.WEAPON||'sword'); return true; }
function getWeaponLayout(){ return {version:1, weapons:JSON.parse(JSON.stringify(WL))}; }
slots.offhand='_none'; slots.arrow='_none';
// keyframes: q = 0..1 of the swing; values are degrees added to the layout rest angles
function E(x){ return x<0?0:x>1?1:x*x*(3-2*x); }
function K(keys,q){ if(!keys) return 0; for(var i=1;i<keys.length;i++){ if(q<=keys[i][0]){ var a=keys[i-1],b=keys[i],u=E((q-a[0])/((b[0]-a[0])||1)); return a[1]+(b[1]-a[1])*u; } } return keys[keys.length-1][1]; }
// r2 poses (DeaRz 08:01 "จัดท่าโจมตีใหม่"): world keys = where an arm or weapon POINTS on screen, independent of rest angles
// angles (art faces left): 0/360 up, 270 forward, 180 down, 90 back. 'sword@fist_near' = aim the sword by turning the fist.
// env blends from the idle pose in and back out so attacks start/end without a jump.
var KF = {
  dagger: {dur:0.36, hits:[0.3,0.7], env:[[0,0],[0.1,1],[0.85,1],[1,0]], world:{
    arm_near:[[0,200],[0.15,160],[0.3,268],[0.45,215],[1,205]],
    'sword@fist_near':[[0,300],[0.15,295],[0.3,272],[0.45,300],[1,300]],
    arm_far:[[0,190],[0.4,120],[0.55,20],[0.7,-95],[0.85,-150],[1,-170]],
    'offhand@fist_far':[[0,170],[0.4,250],[0.55,300],[0.7,215],[1,180]] }, keys:{
    torso:[[0,0],[0.15,4],[0.3,-14],[0.45,-3],[0.55,4],[0.7,-14],[1,0]],
    leg_near:[[0,0],[0.3,14],[0.5,4],[0.7,10],[1,0]], leg_far:[[0,0],[0.3,-10],[0.7,-12],[1,0]] }},
  bow: {dur:0.55, hits:[0.7], arrow:[0.2,0.7], env:[[0,0],[0.15,1],[0.88,1],[1,0]], world:{
    arm_far:[[0,190],[0.2,280],[0.88,280],[1,200]],
    'offhand@fist_far':[[0,180],[1,180]],
    arm_near:[[0,200],[0.2,282],[0.32,282],[0.5,300],[0.7,300],[0.76,325],[0.9,310],[1,210]],
    arrow:[[0,270],[1,270]] }, sc:{arm_near:[[0,1],[0.2,1],[0.45,0.55],[0.7,0.55],[0.8,0.8],[1,1]]}, keys:{
    torso:[[0,0],[0.3,5],[0.7,5],[0.8,-3],[1,0]], head:[[0,0],[0.3,-3],[0.7,-3],[1,0]],
    leg_near:[[0,0],[0.25,10],[0.88,10],[1,0]], leg_far:[[0,0],[0.25,-8],[0.88,-8],[1,0]] }},
  staff: {dur:0.45, hits:[0.5], env:[[0,0],[0.12,1],[0.8,1],[1,0]], world:{
    arm_near:[[0,190],[0.3,150],[0.5,275],[0.75,275],[1,200]],
    'sword@fist_near':[[0,10],[0.3,30],[0.5,-60],[0.75,-60],[1,10]],
    arm_far:[[0,185],[0.3,170],[0.5,235],[0.75,235],[1,190]] }, keys:{
    torso:[[0,0],[0.3,6],[0.5,-10],[0.75,-8],[1,0]], head:[[0,0],[0.5,-4],[1,0]],
    leg_near:[[0,0],[0.5,12],[0.75,12],[1,0]], leg_far:[[0,0],[0.5,-8],[0.75,-8],[1,0]] }},
  holy: {dur:0.55, hits:[0.6], env:[[0,0],[0.12,1],[0.85,1],[1,0]], world:{
    arm_near:[[0,190],[0.3,355],[0.45,355],[0.6,280],[0.8,280],[1,200]],
    'sword@fist_near':[[0,0],[0.3,0],[0.45,0],[0.6,-40],[0.8,-40],[1,0]],
    arm_far:[[0,185],[0.3,330],[0.45,330],[0.6,240],[0.8,240],[1,190]] }, keys:{
    torso:[[0,0],[0.3,6],[0.45,6],[0.6,-8],[0.8,-6],[1,0]], head:[[0,0],[0.3,-8],[0.45,-8],[0.6,0],[1,0]] }},
  scythe: {dur:0.55, hits:[0.55], env:[[0,0],[0.12,1],[0.85,1],[1,0]], world:{
    arm_near:[[0,190],[0.3,110],[0.55,265],[0.7,300],[1,200]],
    'sword@fist_near':[[0,30],[0.3,60],[0.55,250],[0.7,300],[1,390]],
    arm_far:[[0,185],[0.3,140],[0.55,255],[0.7,280],[1,190]] }, keys:{
    torso:[[0,0],[0.3,14],[0.55,-16],[0.7,-10],[1,0]],
    leg_near:[[0,0],[0.3,-6],[0.55,18],[1,0]], leg_far:[[0,0],[0.3,6],[0.55,-12],[1,0]] }}
};
// direction a part "points" in its own image
function dirOf(k){ if(k==='arm_near'||k==='arm_far'){ var f=P[k==='arm_near'?'fist_near':'fist_far'], p=P[k]; return [f.at[0]-p.pivot[0], f.at[1]-p.pivot[1]]; }
  if(k==='arrow') return [-1,0]; return [0,-1]; }
function aimOf(m,v){ var x=m[0]*v[0]+m[2]*v[1], y=m[1]*v[0]+m[3]*v[1]; return Math.atan2(x,-y)*180/Math.PI; }
var basePose = U.pose;
// long weapons rest behind the body (so the blade/orb does not cover the face), come to the front while attacking
var swordFront = null;
function weaponLayer(front){ if(swordFront===null) swordFront = ORDER.indexOf('sword')-ORDER.indexOf('torso');
  var i=ORDER.indexOf('sword'); if(i<0) return; ORDER.splice(i,1);
  if(front){ var a=ORDER.indexOf('arm_near'); ORDER.splice(a<0?ORDER.length:a,0,'sword'); }
  else { var t=ORDER.indexOf('torso'); ORDER.splice(t<0?0:t,0,'sword'); } }
function rest(k){ return cfg.REST[k]||0; }
function restoreSC(){ Object.keys(SCX).forEach(function(p){ cfg.SC[p]=SCX[p]; }); SCX={}; }
function kfPose(w,t,o){ var k=KF[w], D=(o&&o.dur)||k.dur, q=Math.min(1,Math.max(0,t/D)), r={}, P2={rot:r, off:{}, air:0};
  if(k.sc) Object.keys(k.sc).forEach(function(p){ if(!(p in SCX)) SCX[p]=cfg.SC[p]==null?1:cfg.SC[p]; cfg.SC[p]=SCX[p]*K(k.sc[p],q); });
  Object.keys(k.keys||{}).forEach(function(part){ r[part]=K(k.keys[part],q); });
  if(k.level) Object.keys(k.level).forEach(function(f){ r[f]=(r[f]||0)-(r[k.level[f]]||0); });
  if(k.arrow){ var on=q>=k.arrow[0]&&q<=k.arrow[1]; slots.arrow=on?'w_arrow':'_none'; } else slots.arrow='_none';
  if(k.world){ var env=k.env?K(k.env,q):1;
    Object.keys(k.world).forEach(function(spec){ var sp=spec.split('@'), part=sp[0], turn=sp[1]||part;
      if(!P[part]) return; var m=U.solve(P2)[part]; if(!m) return;
      var d=K(k.world[spec],q)-aimOf(m,dirOf(part)); d=((d%360)+540)%360-180; r[turn]=(r[turn]||0)+d*env; }); }
  var win=0.1; P2.strike=k.hits.some(function(h){ return q>=h-win/2&&q<h+win/2; }); P2.hitT=k.hits[0]*D; P2.hits=k.hits.map(function(h){return h*D;});
  P2.attack=w; return P2; }
function pose(name,t,o){ restoreSC();
  if(name==='attack') name = cfg.WEAPON==='sword'?'slash':cfg.WEAPON;
  else if(name==='slash' && cfg.WEAPON!=='sword') name = cfg.WEAPON;
  var w=W[cfg.WEAPON]||{}, ly=wl(w.main||'sword','layer',null), back=ly?ly==='behind':!!w.backIdle; weaponLayer(!(back && !KF[name]));
  if(KF[name]) return kfPose(name,t,o);
  slots.arrow='_none';
  return basePose(name,t,o);
}
// attack pose editing (Art's pose editor): replace one weapon's attack with {dur, hits:[q..], keys:{part:[[q,deg]..]}, world?, env?, sc?, arrow?}
function setAttackPose(w,kf){ if(typeof kf==='string') kf=JSON.parse(kf); if(!kf||!W[w]) return false; kf.hits=kf.hits&&kf.hits.length?kf.hits:[0.5]; kf.dur=kf.dur||0.5; KF[w]=kf; return true; }
function getAttackPose(w){ return KF[w]?JSON.parse(JSON.stringify(KF[w])):null; }
U.setAttackPose = setAttackPose; U.getAttackPose = getAttackPose;
U.pose = pose; U.setWeapon = setWeapon; U.applyWeaponLayout = applyWeaponLayout; U.getWeaponLayout = getWeaponLayout; U.WEAPON_KF = KF; U.WEAPONS = Object.keys(W);
// DeaRz attack poses 9 Nov 08:30 (bow 08:39) (Art pose editor): defaults, replace the Code r2 poses
var DEARZ_ATTACKS={"scythe":{"dur":0.55,"hits":[0.55],"keys":{"torso":[[0,0],[0.3,14],[0.43,14],[0.55,-16],[0.75,-9.3],[1,0]],"leg_near":[[0,0],[0.3,-6],[0.43,-6],[0.55,18],[0.75,10.5],[1,0]],"leg_far":[[0,0],[0.3,6],[0.43,6],[0.55,-12],[0.75,-7],[1,0]],"arm_near":[[0,0],[0.3,-85.5],[0.43,-85.5],[0.55,99.5],[0.75,120.4],[1,0]],"fist_near":[[0,0],[0.3,-126.1],[0.43,-126.1],[0.55,-91.1],[0.75,-62],[1,0]],"arm_far":[[0,0],[0.3,-59.8],[0.43,-59.8],[0.55,85.2],[0.75,96.7],[1,0]],"sword":[[0,0],[0.3,7.2],[0.43,-89.4],[0.55,0],[0.75,197.3],[1,0]]}},"dagger":{"dur":0.36,"hits":[0.3],"keys":{"torso":[[0,0],[0.3,-14],[0.55,4],[0.75,-13],[1,0]],"leg_near":[[0,0],[0.3,14],[0.55,4.9],[0.75,9.3],[1,0]],"leg_far":[[0,0],[0.3,-10],[0.55,-11.4],[0.75,-11.1],[1,0]],"arm_near":[[0,0],[0.3,177.8],[0.55,28.7],[0.75,40.8],[1,0]],"fist_near":[[0,0],[0.3,3.4],[0.55,1.3],[0.75,6.2],[1,0]],"arm_far":[[0,0],[0.3,-40.9],[0.55,-169.8],[0.75,183.6],[1,0]],"fist_far":[[0,0],[0.3,-162],[0.55,11.4],[0.75,7.5],[1,0]]}},"bow":{"dur":0.55,"hits":[0.7],"keys":{"torso":[[0,0],[0.3,0.1],[0.55,5],[0.75,1],[1,0]],"head":[[0,0],[0.3,-3],[0.55,-3],[0.75,-2.8],[1,0]],"leg_near":[[0,0],[0.3,10],[0.55,10],[0.75,10],[1,0]],"leg_far":[[0,0],[0.3,-8],[0.55,-8],[0.75,-8],[1,0]],"arm_far":[[0,0],[0.3,89.2],[0.55,89.2],[0.75,93.2],[1,0]],"fist_far":[[0,0],[0.3,-14.3],[0.55,-14.3],[0.75,-14.3],[1,0]],"arm_near":[[0,0],[0.3,47.5],[0.55,77.1],[0.75,87.4],[1,0]],"arrow":[[0,0],[0.3,-46.9],[0.55,-46.4],[0.75,9],[1,0]],"fist_near":[[0,0],[0.3,0],[0.55,-9.4],[0.75,-59.7],[1,19.2]]},"arrow":[0.2,0.7],"shot":{"speed":1400}},"staff":{"dur":0.45,"hits":[0.5],"keys":{"torso":[[0,0],[0.3,6],[0.55,-9.8],[0.75,-8],[1,0]],"head":[[0,0],[0.3,-2.6],[0.55,-3.9],[0.75,-2],[1,0]],"leg_near":[[0,0],[0.3,7.8],[0.55,12],[0.75,12],[1,0]],"leg_far":[[0,0],[0.3,-5.2],[0.55,-8],[0.75,-8],[1,0]],"arm_near":[[0,0],[0.3,-37.5],[0.55,103.3],[0.75,101.5],[1,0]],"fist_near":[[0,0],[0.3,158.3],[0.55,-56.7],[0.75,-56.7],[1,0]],"arm_far":[[0,0],[0.3,-21.8],[0.55,-41.9],[0.75,-45.4],[1,0]],"fist_far":[[0,0],[0.3,0],[0.55,5.2],[0.75,0],[1,0]]}},"holy":{"dur":0.55,"hits":[0.6],"keys":{"torso":[[0,0],[0.3,6],[0.55,-4.4],[0.75,-6.3],[1,0]],"head":[[0,0],[0.3,-8],[0.55,-2.1],[0.75,0],[1,0]],"arm_near":[[0,0],[0.3,167.5],[0.55,122.3],[0.75,46.6],[1,0]],"fist_near":[[0,0],[0.3,-36.2],[0.55,-45.5],[0.75,-22],[1,0]],"arm_far":[[0,0],[0.3,-27.6],[0.55,-36],[0.75,-39.4],[1,0]],"sword":[[0,0],[0.3,0],[0.55,0],[0.75,-0.1],[1,0]]}}}; // bow 08:39: DeaRz aimed the arrow himself; shot.speed = model px/s for the flying arrow
Object.keys(DEARZ_ATTACKS).forEach(function(w){ setAttackPose(w, DEARZ_ATTACKS[w]); });
setWeapon('sword');
})();

