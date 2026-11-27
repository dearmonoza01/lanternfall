
/* ---- puppet-h5-r6p (TEST, 9 Nov 2026; H5 chibi parts, no neck): 2-direction cut-out PUPPET hero behind ?puppet=on (default OFF) ----
   Uses puppet_h5_pack_r4 + weapons pack r1 (parts_h5.js + puppet_h5.js, QA conditional PASS). When ON, the old hero body (3D sprite / drawHeroFrame) and the old held weapon are NOT drawn; the puppet is drawn at the same spot,
   same on-screen height, facing LEFT or RIGHT only (dir2 side; without dir2 the sign of cos of the facing). Shadow / ring, name tag, HP bar, hit blink, stealth filter are the game's own and unchanged.
   Pose: slash while P.swing runs (t = P.swing.t, dur = P.swing.dur; damage code untouched) / run when the dir8 run state is on (or fast, or dashing) / walk when moving / idle. The puppet always carries its sword (TEST).
   Flags: ?puppet=on ?pout=knight|rogue, ?phair=black|silver|red (H5 r2 sets). Debug: window.PUPPET (setOutfit, setHair, ...) and window.PUPPETX (stats, cfg, force). ---- */
(function(){'use strict';const Q=String(location.search);
const X=window.PUPPETX={ver:'puppet-h5-r6p',on:true,ok:false,err:null,ready:false,draws:0,skipped:0,lastPose:null,facing:1,force:null,
  cfg:{TARGET_H:76,H_FACTOR:1,FOOT_DY:10,SWING_STRETCH:1,FACE_FORCE:0,BOW_DEFER:false,ATK_MIN_VIS:.3,NO_H3D:false,WALK_MIN:25,MOVE_HOLD:.15,RUN_MIN:function(){return(typeof P!=='undefined'&&P&&P.speed?P.speed:200)*.95}}};
const GC=new Function('return ctx');
try{
if(!window.PUPPET||!window.PUPPET_PARTS)throw new Error('puppet pack missing');
const PU=window.PUPPET;
if(X.on){
  PU.load(window.PUPPET_PARTS).then(()=>{try{const o=/[?&]pout=(default|knight|rogue|mage|cleric|ranger|eastern|reaper)\b/.exec(Q),h=/[?&]phair=(default|black|silver|red|b[1-5]|g(?:10|[6-9]))\b/.exec(Q),gd=/[?&]pgender=(boy|girl)\b/.exec(Q);X.look={outfit:o?o[1]:'default',hair:h?h[1]:'default',gender:gd?gd[1]:'boy'};if(PU.setLook)PU.setLook(X.look);else{if(o)PU.setOutfit(o[1]);if(h)PU.setHair(h[1])}/* hair mesh warp + breathing (hairmesh_h23): OFF unless ?sway=on */if(PU.setSway)PU.setSway(/[?&]sway=on\b/.test(Q));/* ?hm=<factor> (default 1.0) scales the live hair spring config PUPPET.HMS (walk, run, idle, step, bob, max) for tuning */if(PU.setScarf&&/[?&]scarf=on\b/.test(Q))PU.setScarf(true);/* r6p: scarf is OFF by default (cash item); ?scarf=on only as a GM/debug flag */if(PU.set3q&&/[?&]face=side\b/.test(Q))PU.set3q(false);if(PU.RK&&/[?&]rock=off\b/.test(Q))PU.RK.on=false;if(PU.FL&&/[?&]flare=off\b/.test(Q))PU.FL.on=false;/* r6k: the 3/4 head + scarf are on by default; ?scarf=off, ?face=side (debug) */try{const hmx=/[?&]hm=([0-9.]+)/.exec(Q),f=hmx?parseFloat(hmx[1]):1;X.hm=f;if(PU.HMS&&isFinite(f)&&f!==1)for(const k of['walk','run','idle','step','bob','max'])if(typeof PU.HMS[k]==='number')PU.HMS[k]*=f}catch(e){X.err='hm '+e.message}X.refH=measure();X.ready=true}catch(e){X.err='load '+e.message}});
}
/* puppet height at scale 1 (hair top to ground, idle pose, no sword) */
function measure(){const p=PU.pose('idle',0),W=PU.solve(p),foot=PU.footY(W);let top=1e9;
  for(const k of PU.ORDER){if(k==='sword')continue;const pt=PU.P[k],key=(PU.slots[k]||pt.img||k),im=PU.imgs[key];if(!im||!im.width)continue;const m=W[k];
    for(const c of[[0,0],[im.width,0]]){const y=m[1]*c[0]+m[3]*c[1]+m[5];if(y<top)top=y}}
  return foot-top}
function T(){try{return(new Function('return time'))()}catch(_){return performance.now()/1000}}
function facingNow(fa){if(X.cfg.FACE_FORCE)return X.cfg.FACE_FORCE>0?1:-1;const D=window.DIR2;if(D&&D.on)return D.side>0?1:-1;return Math.cos(fa)>=0?1:-1}
/* r5d: walk / run decided from the REAL position change between frames (px per game second), not from P.vx / P.vy (dir2 rewrites those while the hero is drawn). */
X.mvT=0;X.mvSp=0;const MV={x:null,y:null,t:null,z:null};
function moveSpeed(){try{const t=T(),z=G.zone;if(MV.x===null||MV.z!==z||t<MV.t){MV.x=P.x;MV.y=P.y;MV.t=t;MV.z=z;X.mvSp=0;return 0}const dt=t-MV.t;if(dt<=0.0005)return X.mvSp;const d=Math.hypot(P.x-MV.x,P.y-MV.y);MV.x=P.x;MV.y=P.y;MV.t=t;if(d>300||dt>0.5){X.mvSp=0;return 0}X.mvSp=d/dt;if(X.mvSp>X.cfg.WALK_MIN)X.mvT=t;return X.mvSp}catch(e){X.err='move '+e.message;return 0}}
/* r6: weapon sync. Game weapon type (P.weapon.t) + class path -> puppet weapon. Flag ?pweapon=sword|dagger|bow|staff|holy|scythe forces one. Not mapped: spear -> sword, book -> staff, fist -> sword (fallbacks). */
const PW=/[?&]pweapon=(sword|dagger|bow|staff|holy|scythe|knuckle)\b/.exec(Q);X.pweaponFlag=PW?PW[1]:null;X.curW=null;X.gameW=null;
function mapWeapon(){try{const w=P.weapon,t=w&&w.t;if(!t)return'sword';if(w.dg2||t==='dagger')return'dagger';if(t==='bow'||t==='gun')return'bow';if(t==='scythe')return'scythe';
  if(t==='staff'){let path=null;try{path=CLASSES[P.cls].path}catch(_){}return path==='cleric'?'holy':'staff'}if(t==='book')return'staff';if(t==='spear')return'spear';if(t==='fist'||t==='knuckle')return'knuckle';return'sword'}catch(_){return'sword'}}
/* r6p2: knuckle pack r1 = PUPPET.setWeapon('knuckle') (bare fists, 2 hits per attack: q .3 jab, q .75 cross). The game's 'fist' (Unarmed) blocks basic attacks itself, so no punch is triggered for it. spear = dagger POSE with the sword image (long thrust); fallback if the pack is missing: fist = dagger pose with empty fists (sword + offhand slots '_none'). */
function applyWeapon(w){if(w==='spear'){PU.setWeapon('sword');PU.cfg.WEAPON='dagger'}else if(w==='knuckle'&&PU.WEAPON_KF&&PU.WEAPON_KF.knuckle){PU.setWeapon('knuckle')}else if(w==='knuckle'){PU.setWeapon('sword');PU.cfg.WEAPON='dagger';PU.slots.sword='_none';PU.slots.offhand='_none'}else PU.setWeapon(w)}
function syncWeapon(){const w=X.pweaponFlag||mapWeapon();X.gameW=w;if(w!==X.curW){try{applyWeapon(w);X.curW=w}catch(e){X.err='weapon '+e.message}}}
/* r6 walk/run: RUN only while the game's own run state is on (dir8 run state) or dashing; any other movement above WALK_MIN = WALK at any speed. The walk / run cycle is timed to the real speed (phase advances with distance moved, so feet do not slide much). */
X.ph={t:0,last:null};
function cyclePhase(name,sp){const t=T();let dt=X.ph.last===null?0:t-X.ph.last;X.ph.last=t;if(dt<0||dt>.3)dt=0;
  const ref=(typeof P!=='undefined'&&P&&P.speed?P.speed:200)*.55*(name==='run'?1.6:1),k=Math.max(.35,Math.min(2.6,sp/ref));X.ph.t+=dt*k;return X.ph.t}
/* r6d: puppet attack follows the game where the game blocks or owns the attack. genOK(): no puppet attack for fist (the game says "no weapon"), and none from the generic triggers for the bow while the bow module (window.BOW) runs the shot: its state BOW.st drives the puppet instead (bowSync). */
function genOK(){try{const t=P.weapon&&P.weapon.t;if(t==='fist')return false;if(X.curW==='bow'&&window.BOW&&BOW.on!==false)return false;return true}catch(_){return true}}
const REL_FRAC=37/53;
X.bw=null;
function bowTip(){try{const D=1,p=PU.pose('slash',.7,{dur:D}),W=PU.solve(p),m=W.arrow,gy=PU.footY(W),sc=X.cfg.TARGET_H*X.cfg.H_FACTOR/X.refH,fac=X.facing||1,px=m[2]*39+m[4],py=m[3]*39+m[5];
  return{x:P.x+(fac>0?-1:1)*sc*px,y:(P.y-(P.jump||0)+X.cfg.FOOT_DY)+sc*(py-gy)}}catch(e){X.err='bowTip '+e.message;return null}}
function fixArrows(){try{const A=BOW.arrows;if(!A)return;for(let i=0;i<A.length;i++){const ar=A[i];if(ar._pp)continue;ar._pp=1;const tp=bowTip();if(tp){/* BOW8 draws each arrow at (ar.x+ar.ox, ar.y+ar.oy-ar.h): ox / oy are a fixed DRAWING offset (tipFix put it at the 3D bow's arrow head). The arrow's own x / y / h (hit tests, range, walls, damage) are NOT touched: only the offset is re-aimed at the puppet's arrow tip. */const was={ox:Math.round(ar.ox||0),oy:Math.round(ar.oy||0)};if(ar.b8==null)ar.b8=0;ar.ox=tp.x-ar.x;ar.oy=tp.y-ar.y+(ar.h||0);X.lastArrowFix={ox:Math.round(ar.ox),oy:Math.round(ar.oy),was:was,t:+T().toFixed(3)};X.arrowsFixed=(X.arrowsFixed||0)+1}}}catch(e){X.err='fixArrows '+e.message}}
/* bow: q timeline of the puppet bow attack (release at q 0.7) is warped to the module's clip: before the release q = 0.7 * el / (REL_FRAC * dur) (capped 0.69 until the module really releases), after it q = 0.7 .. 1 over the rest of the clip. */
function bowSync(t){if(!(X.curW==='bow'&&window.BOW))return null;const st=BOW.st;fixArrows();
  if(!st||st.bsk||!(st.dur>0)){X.bw=null;return null}
  if(!X.bw||X.bw.st!==st)X.bw={st:st,relEl:null};const el=t-st.t0;if(el<0||el>st.dur+.05)return null;
  let q;if(!st.rel){q=Math.min(.69,.7*el/(REL_FRAC*st.dur))}else{if(X.bw.relEl===null)X.bw.relEl=Math.min(el,st.dur*.99);q=.7+.3*Math.min(1,(el-X.bw.relEl)/Math.max(.02,st.dur-X.bw.relEl))}
  X.atk=null;X.bowQ=q;X.atkT=el;X.atkDur=st.dur;return{name:'slash',p:PU.pose('slash',q*st.dur,{dur:st.dur})}}
/* r6e sword timing: the 3D hero's sword attack (p194 / p269) is the game's real attack clock: HERO3D.anim = {t0,f}; one swing lasts 1.5 / f s (= __BAL1.swordPeriod, the attack rate), the hit lands at 0.7 / f s after t0 (P.swing / the sword wave start there). The puppet slash is stretched over that same period with its strike (q 0.52) on the hit. */
function swordSync(t){if(X.cfg.NO_H3D||X.curW!=='sword'||!window.HERO3D)return null;let A=null;try{A=HERO3D.anim}catch(_){}
  if(!A||typeof A.t0!=='number'||!(A.f>0))return null;const D=1.5/A.f,el=t-A.t0;if(el<0||el>=D)return null;
  const p=el/D,HP=.7/1.5,q=p<=HP?.52*p/HP:.52+.48*(p-HP)/(1-HP);X.atk=null;X.atkReq=null;try{X.laSeen=P.lastAtk}catch(_){}
  X.atkT=el;X.atkDur=D;X.swordQ=q;return{name:'slash',p:PU.pose('slash',q*D,{dur:D})}}
function poseNow(){const t=T();syncWeapon();try{const kp=window.KNUCKLE&&KNUCKLE.on&&KNUCKLE.pose&&KNUCKLE.pose();if(kp&&X.curW==='knuckle')return{name:'slash',p:kp}}catch(_){}
  if(X.force){const f=X.force;if(f.weapon&&f.weapon!==X.curW){try{applyWeapon(f.weapon);X.curW=f.weapon}catch(_){}}return{name:f.name,p:PU.pose(f.name,f.t!=null?f.t:t,{dur:f.dur||.42})}}
  const sp=moveSpeed(),sw=P.swing;
  /* r6p2: spin pose. While P.spin is active (Whirlwind / Blade Storm) draw PUPPET.pose('spin', time since spin start, {moving}) (spin_h32.js; ?spinpose=off). Damage + walking are the game's own and untouched. */
  try{const A3=window.__SKATK3&&__SKATK3.state;if(A3&&!(P.spin&&P.spin.t>0)&&!/[?&]spinpose=off/.test(Q)){if(X.spinMod===undefined){try{X.spinMod=PU.pose('spin',0,{}).spinT!=null}catch(_){X.spinMod=false}}if(X.spinMod){const en=(__SKATK3.cfg&&__SKATK3.cfg.time&&__SKATK3.cfg.time.end)||2;X.atk3Spin=(X.atk3Spin||0)+1;return{name:'spin',p:PU.pose('spin',A3.t,{moving:sp>X.cfg.WALK_MIN,left:Math.max(0,en-A3.t)})}}}}catch(_){}
try{if(P.spin&&P.spin.t>0&&!/[?&]spinpose=off/.test(Q)){if(X.spinMod===undefined){try{X.spinMod=PU.pose('spin',0,{}).spinT!=null}catch(_){X.spinMod=false}}if(X.spinMod)return{name:'spin',p:PU.pose('spin',Math.max(0,P.spin.max-P.spin.t),{moving:sp>X.cfg.WALK_MIN||!!P.dash,left:Math.max(0,P.spin.t)})}}}catch(_){}
  /* r6q: scythe skill pose (SCYG.pose set by the scythe skills adapter): attack = scythe attack pose stretched to the skill's swing, spin = loop it (storm), buff = short raise at 0.3 speed. */
  try{const sg=window.SCYG&&SCYG.pose;if(sg&&PU.cfg.WEAPON==='scythe'&&t-sg.start<sg.dur){const el=Math.max(0,t-sg.start);if(sg.kind==='buff')return{name:'slash',p:PU.pose('slash',el*.3,{dur:.55})};if(sg.spin)return{name:'slash',p:PU.pose('slash',el%.55,{dur:.55})};return{name:'slash',p:PU.pose('slash',el,{dur:sg.dur})}}}catch(_){}
  try{const dh=window.DH&&DH.on&&DH.pose(t);if(dh)return dh}catch(_){}
  try{const sc=window.__STFCAST&&__STFCAST.on&&__STFCAST.pose(t);if(sc)return sc}catch(_){}
  {const bs=bowSync(t);if(bs)return bs}
  {const ss=swordSync(t);if(ss)return ss}
  /* attack trigger 2: P.lastAtk is written by the game's combo basic attack (basicAttack_v5) on every attack, also for the dagger / scythe modules that do not use P.swing or P.atkCd. */
  try{const la=P.lastAtk;if(X.laSeen===undefined)X.laSeen=la;if(la!==X.laSeen){X.laSeen=la;if(la>0&&genOK()&&!(X.atk&&t-X.atk.start<.05)&&!(t-(X.lastWrapT||-9)<1.0)){const sw0=P.swing;X.atkReq={sw:(sw0&&typeof sw0.t==='number')?sw0:null,dur:Math.max((sw0&&sw0.dur)||.2,X.cfg.ATK_MIN_VIS),n:1}}}}catch(_){}
  if(X.atkReq&&!X.atkReq.used){X.atkReq.used=1;X.atk={sw:X.atkReq.sw,start:t,dur:X.atkReq.dur,viaReq:1,sword:(X.curW==='sword'),half:(X.curW==='dagger'?((X.dagN=(X.dagN||0)+1)%2):0)}}
  /* attack: the puppet attack is driven by a visual timer that starts when a NEW P.swing appears and runs max(P.swing.dur, ATK_MIN_VIS) game seconds, even after P.swing has ended; the game's damage timing is not touched. X.atkT = visual time, X.atkDur = visual length. */
  if(sw&&typeof sw.t==='number'&&sw.dur>0&&(!X.atk||X.atk.sw!==sw)&&!(t-(X.lastWrapT||-9)<1.0)){/* r6h: the P.swing that appears at the game's hit belongs to the attack already playing since the click - it must not restart it */X.atk={sw:sw,start:t,dur:Math.max(sw.dur*X.cfg.SWING_STRETCH,X.cfg.ATK_MIN_VIS)}}
  if(X.atk){const el=t-X.atk.start;if(el>=0&&el<X.atk.dur){X.atkT=el;X.atkDur=X.atk.dur;{const D=X.atk.dur;let tt=el;/* dagger: the game fires TWO thrusts per click (also with ?puppet=off) and the puppet dagger attack already holds two stabs, so each game attack plays ONE stab: odd attacks the first half of the puppet attack, even attacks the second half. */if(X.curW==='dagger'){const u=Math.min(1,el/D);tt=(X.atk.half?(.57+.43*u):(.57*u))*D}else if(X.atk.sword){/* no 3D hero clock (HERO3D.anim): same mapping as swordSync, strike (q .52) on the game's hit at .7/1.5 of the sword period */const p=Math.min(1,el/D),HP=.7/1.5,q=p<=HP?.52*p/HP:.52+.48*(p-HP)/(1-HP);tt=q*D;X.swordQ=q}return{name:'slash',p:PU.pose('slash',tt,{dur:D})}}}else if(!sw)X.atk=null}
  const mv=sp>X.cfg.WALK_MIN||!!P.dash||(t-X.mvT<X.cfg.MOVE_HOLD&&X.mvT>0);
  if(mv){let run=!!P.dash;try{const r=window.__DIR4&&__DIR4.rs;if(r&&r.on)run=true}catch(_){}const nm=run?'run':'walk';return{name:nm,p:PU.pose(nm,cyclePhase(nm,Math.max(sp,X.cfg.WALK_MIN)))}}
  X.ph.last=null;return{name:'idle',p:PU.pose('idle',t)}}
function activeB(){return X.on&&X.ready&&!X.err&&typeof P!=='undefined'&&!!P}
function active(){return X.on&&X.ready&&!X.err&&typeof P!=='undefined'&&P&&!P.dead}
X.hideP=/[?&]pdebug=hideP\b/.test(Q);X.deadAt=null;
function drawPup(x,y,fa){if(X.hideP){X.lastPose=poseNow().name;return}
  let fade=1;if(P.dead){if(X.deadAt===null)X.deadAt=T();fade=Math.max(0,1-(T()-X.deadAt)/1.2);if(fade<=0)return}else X.deadAt=null;
  if(fade<1){const c0=GC();c0.save();c0.globalAlpha*=fade;try{drawPup2(x,y,fa)}finally{c0.restore()}return}drawPup2(x,y,fa)}
function drawPup2(x,y,fa){
  const c=GC(),ps=poseNow(),fac=facingNow(fa),h=X.cfg.TARGET_H*X.cfg.H_FACTOR,sc=h/X.refH;X.facing=fac;X.lastPose=ps.name;
  PU.draw(c,x,y,sc,fac,ps.p);X.draws++}
/* the hero body: drawPlayerSprite (sheet / p194) and drawHeroFrame (pixel hero) - draw once per frame at P.x, P.y (jump included) */
function once(fa){const j=P.jump||0;drawPup(P.x,P.y-j+X.cfg.FOOT_DY,fa)}
/* r6e: ?puppet=on changes ONLY what is drawn. The game's own hero / weapon draw functions still RUN (their state machines, sword wave, attack timers live in them) but into an empty clip region, so nothing of the old body or weapon is visible. X.inGhost stops nested hooks from drawing the puppet twice. */
X.inGhost=0;function ghost(fn,bodyOnly){const c=GC();c.save();let od=null;if(bodyOnly){od=c.drawImage;c.drawImage=function(){}}else{c.beginPath();c.rect(0,0,0,0);c.clip()}X.inGhost++;try{return fn()}finally{X.inGhost--;if(bodyOnly)c.drawImage=od;c.restore()}}
/* bodyOnly = hero body draw functions: only drawImage (the 3D / pixel body atlases) is muted, so the cast rings, auras and other path-drawn effects that these functions also draw stay visible. */
if(X.on){
  try{const o=drawPlayerSprite;drawPlayerSprite=function(x,y,bob,fa){if(X.inGhost)return o.apply(this,arguments);if(activeB()){const a=arguments,self=this;try{ghost(function(){return o.apply(self,a)},X.lastPose==='slash'&&!P.dead)}catch(e){X.err='ghost sprite '+e.message}try{once(fa);return}catch(e){X.err='draw '+e.message}}return o.apply(this,arguments)}}catch(e){X.err='hook sprite '+e.message}
  try{const o=drawHeroFrame;drawHeroFrame=function(Hf){if(X.inGhost)return o.apply(this,arguments);if(activeB()){const a=arguments,self=this;try{ghost(function(){return o.apply(self,a)},X.lastPose==='slash'&&!P.dead)}catch(e){X.err='ghost hero '+e.message}try{once(P.face+(typeof camY==='function'?camY():0));return}catch(e){X.err='draw '+e.message}}return o.apply(this,arguments)}}catch(e){X.err='hook hero '+e.message}
  /* attack start detector: the game has many weapon modules (dagger / bow / staff / scythe) that defer or replace P.swing, so the puppet attack also starts when basicAttack really fires (P.atkCd goes from 0 to > 0). Damage timing is untouched. */
  try{const o=basicAttack;basicAttack=function(){const cd0=P.atkCd;const r=o.apply(this,arguments);try{if(cd0<=0&&P.atkCd>0&&X.on&&genOK()&&!(X.curW==='sword'&&X.atk&&X.atk.viaReq&&T()-X.atk.start<X.atk.dur*.8)){/* the 3D hero fires the real hit later through basicAttack AGAIN (HERO3D.firing): that 2nd call is the same attack, not a new one */const sw=P.swing;let dur=Math.max((sw&&sw.dur)||.2,X.cfg.ATK_MIN_VIS);try{if(X.curW==='sword'&&window.__BAL1&&__BAL1.swordPeriod)dur=Math.max(.15,__BAL1.swordPeriod())}catch(_){}X.lastWrapT=T();X.atkReq={sw:(sw&&typeof sw.t==='number')?sw:null,dur:dur,n:(X.atkReq?X.atkReq.n:0)+1}}}catch(_){}return r}}catch(e){X.err='hook attack '+e.message}
  /* bow: the game's arrow projectile is released at the puppet's release time (hitT of the bow attack) from the puppet's arrow (nock) position, in the aimed direction, instead of at the click. Damage / flight code is the game's own; only the spawn is delayed (X.cfg.BOW_DEFER=false = spawn at the click as the game does). */
  try{const of=fireProj;let inDef=0;fireProj=function(opts){
    try{if(X.on&&X.cfg.BOW_DEFER&&!inDef&&X.curW==='bow'&&opts&&opts.kind==='arrow'&&active()){
      const D=X.cfg.ATK_MIN_VIS,hit=PU.pose('slash',0,{dur:D}).hitT;
      if(hit>.01){X.bowDeferred=(X.bowDeferred||0)+1;timers.push({t:hit,fn:function(){inDef=1;try{const o2=Object.assign({},opts);
        try{const p=PU.pose('slash',hit,{dur:D}),W=PU.solve(p),m=W.arrow,pv=PU.P.arrow.pivot,px=m[0]*pv[0]+m[2]*pv[1]+m[4],py=m[1]*pv[0]+m[3]*pv[1]+m[5],gy=PU.footY(W),sc=X.cfg.TARGET_H*X.cfg.H_FACTOR/X.refH,fac=X.facing||1;
          o2.x=P.x+(fac>0?-1:1)*sc*px;o2.y=(P.y-(P.jump||0)+X.cfg.FOOT_DY)+sc*(py-gy);X.lastArrowSpawn={x:Math.round(o2.x-P.x),y:Math.round(o2.y-P.y),fac:fac,t:T()}}catch(e){X.err='bowpos '+e.message}
        of.call(null,o2)}finally{inDef=0}}});return}}}catch(e){X.err='bow defer '+e.message}
    return of.apply(this,arguments)}}catch(e){X.err='hook fireProj '+e.message}
  try{const o=drawWeapon;drawWeapon=function(g,t,x,y,a,sc,pl,live){if(live&&activeB()&&!X.inGhost){X.skipped++;const a2=arguments,self=this;try{ghost(function(){return o.apply(self,a2)})}catch(e){X.err='ghost weapon '+e.message}return}return o.apply(this,arguments)}}catch(e){X.err='hook weapon '+e.message}
  try{const o=gripHand;gripHand=function(){if(activeB()&&!X.inGhost){const a2=arguments,self=this;try{ghost(function(){return o.apply(self,a2)})}catch(e){}return}return o.apply(this,arguments)}}catch(e){}
}
/* r6j: tiny fps / frame-time readout (top right) when ?gm=on; window.PUPPETX.fps = {fps, ms, n}. Counts only the average frame time of the page. */
try{if(/[?&]gm=on\b/.test(Q)){const el=document.createElement('div');el.id='puppetFps';el.style.cssText='position:fixed;right:6px;top:4px;z-index:99999;font:11px/1.2 monospace;color:#cfe;background:rgba(0,0,0,.45);padding:2px 5px;border-radius:4px;pointer-events:none';document.body.appendChild(el);
 let last=performance.now(),acc=0,n=0,t0=last;X.fps={fps:0,ms:0,n:0};
 (function loop(){const t=performance.now(),d=t-last;last=t;acc+=d;n++;if(t-t0>=500){X.fps={fps:+(n*1000/(t-t0)).toFixed(1),ms:+(acc/n).toFixed(1),n:n};el.textContent=X.fps.fps+' fps · '+X.fps.ms+' ms'+(PUPPET.cfg&&PUPPET.cfg.SWAY?' · sway':'');acc=0;n=0;t0=t}requestAnimationFrame(loop)})()}}catch(e){X.err='fps '+e.message}X.ok=true;
}catch(e){X.err=e.message}
})();
