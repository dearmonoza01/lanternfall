
/* ---- candidate_balance_v1_r70: p280 r2 faster basic attacks, damage per hit lowered to match (TEST only) ---- */
/* r2 — DeaRz 22 Oct 13:08 "ดาบดีขึ้น ธนูเร็วไปนิด คทาเร็วเกินแก้หน่อย": speed per weapon instead of x2 for all:
   sword x2 (as r1), bow x1.5, staff x1.25; damage per basic hit = 1 / speed, so basic DPS stays the same. */
/* p280 r1 — DeaRz 22 Oct 11:27 "แก้ไขความเร็วโจมตีเร็วขึ้น 2เท่าแต่ดาเมจลดลง2เท่ากัน" + balance/aspd_x2_r1/NOTE_aspd_x2_balance.md. TEST only.
   Player basic attacks only (sword, bow, staff). Skills, monsters and the ATK stat are unchanged.
   (r1 text below says x0.5 / x2: in r2 read it as 1/speed per weapon: sword 0.75 s, bow 0.667 s, staff 1.0 s)
   1. interval x0.5: sword 1.5 -> 0.75 s (p255 swordPer; the swing animation plays at the same faster speed), bow shot 1.0 -> 0.5 s,
      staff orb 1.25 -> 0.625 s (its wind-up and follow-through x0.5 too, so the pose fits inside the shorter cycle).
   2. damage x0.5 per basic hit: the coefficient and flat part of every hit whose cast ctx is 'basic:sword' / 'basic:bow' / 'basic:staff'
      are halved in the game's own resolveHit. Weapon actionCoef is NOT changed, so skills and the sword shadow (which read it) keep their damage.
   3. attack-speed cap 5 -> 10 hits/s.
   4. per-hit side effects kept per second, not per hit: sword "คมต่อเนื่อง" chance x0.5 (20% + 0.3%/LUK, max 45% -> 10% + 0.15%/LUK, max 22.5%,
      also halves whatever a skill level sets); bow poison-arrow buff: its DoT is set from the hit's damage and refreshed each hit, so the DoT
      from a basic arrow is doubled back (same DoT per second as before).
   Flinch is NOT halved: a normal flinch already has a 1.5 s lock-out per monster (p203), so more hits barely add flinches (see report).
   Turn off with ?aspd2=off (= r68). Debug: window.ASPD2. */
(function(){
'use strict';
const Q=String(location.search)+String(location.hash);
const X=window.ASPD2={ver:'p280-r2',on:!/aspd2=off/.test(Q),err:[],stats:{halved:0,poisonFix:0},set:{}};
if(!X.on)return;
const SPD=X.spd={sword:2,bow:1.5,staff:1.25};
const IDS={'basic:sword':1/SPD.sword,'basic:bow':1/SPD.bow,'basic:staff':1/SPD.staff};
const isBasic=c=>!!c&&c.kind==='basic'&&!!IDS[c.id];
const err=m=>{X.err.push(m);try{console.warn('[p280]',m);}catch(_){}};

/* ---- 1 + 3 intervals and cap ---- */
try{const B=window.__BAL1;if(!B||!B.cfg||!B.cfg.rate)throw new Error('__BAL1 missing');const r=B.cfg.rate;
  X.set.sword=[r.swordPer,r.swordPer/SPD.sword];r.swordPer/=SPD.sword;X.set.cap=[r.cap,10];r.cap=10;r.bowShot/=SPD.bow;
  const BW=window.BOW;if(BW&&BW.cfg){X.set.bow=[BW.cfg.shot,r.bowShot];BW.cfg.shot=r.bowShot;BW.cfg.maxSpd=r.cap*r.bowShot;}else err('bow cfg missing');
}catch(e){err('rate '+e.message);}
try{const S=window.STF&&STF.cfg&&STF.cfg.basic;if(!S)throw new Error('STF.cfg.basic missing');
  X.set.staff=[S.period,S.period/SPD.staff];S.period/=SPD.staff;S.wind/=SPD.staff;S.follow/=SPD.staff;}catch(e){err('staff '+e.message);}

/* ---- 2 half damage per basic hit: the cast ctx reaches core() -> __PASS.dmgBonus(e,o,ctx) right before resolveHit ---- */
let CUR=null;
function hookBonus(){const L=window.__PASS;if(!L||typeof L.dmgBonus!=='function')return false;if(L.dmgBonus._p280)return true;
  const ob=L.dmgBonus;L.dmgBonus=function(e,o,ctx){CUR=ctx||null;return ob.apply(this,arguments);};L.dmgBonus._p280=1;return true;}
try{const K=window.C182&&C182.api&&C182.api.K;if(!K||typeof K.resolveHit!=='function')throw new Error('C182.api.K missing');
  if(!hookBonus())throw new Error('__PASS.dmgBonus missing');
  const _rh=K.resolveHit;K.resolveHit=function(i){const c=CUR;CUR=null;
    if(i&&isBasic(c)){const k=IDS[c.id];i=Object.assign({},i,{coef:(i.coef||0)*k,flat:(i.flat||0)*k});X.stats.halved++;return _rh.call(this,i);}
    return _rh.apply(this,arguments);};
  // a later module replacing __PASS.dmgBonus must not drop the hook
  let n=0;const iv=setInterval(()=>{try{hookBonus();}catch(_){}if(++n>40)clearInterval(iv);},250);
}catch(e){err('damage '+e.message);}

/* ---- 4a sword chain chance x0.5 (on top of the p271 LUK getter and any skill-level value) ---- */
function hookChain(){const L=window.__PASS,ch=L&&L.cfg&&L.cfg.chain;if(!ch)return false;
  const d=Object.getOwnPropertyDescriptor(ch,'chance');if(d&&d.get&&d.get._p280)return true;
  if(window.P271&&P271.on&&!(d&&d.get))return false;   // wait for p271's LUK getter first
  const g=d&&d.get?d.get:null,s=d&&d.set?d.set:null;let v=d&&!d.get?d.value:0;
  const get=function(){return (g?g.call(this):v)/SPD.sword;};get._p280=1;
  Object.defineProperty(ch,'chance',{get,set(x){if(s)s.call(this,x);else v=x;},configurable:true,enumerable:true});X.set.chain=1;return true;}
try{if(!hookChain()){let n=0;const iv=setInterval(()=>{let ok=false;try{ok=hookChain();}catch(_){}if(ok||++n>80){clearInterval(iv);if(!ok)err('chain chance not hooked');}},250);}}
catch(e){err('chain '+e.message);}

/* ---- 4b bow poison-arrow DoT from a basic arrow: x2 back (set from the halved hit) ---- */
try{const _h=hitEnemy;hitEnemy=function(e,m,o){const z0=e?e._bskPz:null,r=_h.apply(this,arguments);
  try{const c=(o&&o.ctx)||(window.C182&&C182.cur);if(e&&e._bskPz&&e._bskPz!==z0&&c&&c.kind==='basic'&&c.id==='basic:bow'){e._bskPz.dps*=SPD.bow;X.stats.poisonFix++;}}catch(_){}
  return r;};}catch(e){err('poison '+e.message);}
X.ok=X.err.length===0;
})();
