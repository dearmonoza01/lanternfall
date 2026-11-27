
/* ---- merge m11: p202 damage pass ---- */
/* p202 — damage pass (merge m11 candidate; user 9 Oct 2026 23:17).
   1. Monster HP: an ordinary monster of the player's level dies in about 2–3 basic-attack combos (target 2.5 combos).
      Every role's HP table (ordinary/durable/elite/boss/refboss/raid) is scaled by the same per-level factor, so the relative
      toughness between roles stays as authored (durable ~1.6x, elite ~3.5x ...). Species hpMul (e.g. Leaf Bunny 0.75) still applies on top.
      Factor = 2.5 combos x reference damage / old ordinary HP. Reference player: novice with a plain sword of its level,
      half of its stat points in STR and the rest spread over VIT/AGI/DEX, one combo = 3 swings (3rd x1.5). Levels above 99 keep the L99 factor.
   2. Weapon: the hero holds a sword, so novices use the sword (start weapon, existing novice dagger converted with the same level/rarity/refine/card).
   3. One number per hit: a basic attack swing is one hit for every weapon (whole weapon budget in one hit, not split into 3–5 small numbers).
   TEST DRAFT values; combat v182 formulas are unchanged. */
(function(){
'use strict';
const HPMUL=[0.2163,0.2504,0.3223,0.2801,0.269,0.3458,0.3213,0.2881,0.285,0.2753,0.2907,0.2921,0.3035,0.3049,0.3082,0.3105,0.3139,0.3076,0.3098,0.3066,0.3091,0.3059,0.3052,0.2967,0.2897,0.278,0.2735,0.2632,0.2553,0.2464,0.2492,0.2459,0.2457,0.2433,0.2421,0.2403,0.2424,0.2399,0.2429,0.2421,0.2415,0.2412,0.2424,0.2372,0.2382,0.2383,0.2357,0.2339,0.2348,0.2325,0.2305,0.227,0.2232,0.219,0.2142,0.2102,0.2078,0.2049,0.2022,0.1993,0.1984,0.1971,0.1977,0.1963,0.1961,0.1967,0.1983,0.1966,0.1962,0.1953,0.194,0.192,0.1892,0.1864,0.1836,0.1799,0.1756,0.1733,0.1709,0.169,0.1683,0.1677,0.1671,0.1671,0.1681,0.1683,0.1677,0.167,0.1664,0.1647,0.1646,0.165,0.1662,0.1655,0.1649,0.1645,0.1639,0.1616,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606,0.1606];
const ERR=[];
function Dt(){try{return C182.api.D();}catch(e){return null;}}
function patchData(){const D=Dt();if(!D)return false;
  if(D.mon&&D.mon.hp&&!D.mon._p202){for(const role in D.mon.hp){const a=D.mon.hp[role];for(let i=0;i<a.length;i++){const m=HPMUL[Math.min(i,HPMUL.length-1)];a[i]=Math.max(1,Math.round(a[i]*m));}}D.mon._p202=1;}
  if(D.weapons&&!D.weapons._p202){for(const k in D.weapons){const w=D.weapons[k];if(!w||typeof w!=='object'||!w.weights)continue;w.weights=[1];w.schedule=[0];w.hits=1;w.perHitCoef=w.actionCoef;}D.weapons._p202=1;}
  return true;}
try{if(!patchData())ERR.push('combat data not ready');}catch(e){ERR.push('data '+e.message);}
// sword for novices
try{if(typeof WCLASS!=='undefined'&&WCLASS.sword&&!WCLASS.sword.includes('novice'))WCLASS.sword.push('novice');
  if(typeof CLASSES!=='undefined'&&CLASSES.novice)CLASSES.novice.wp='sword';}catch(e){ERR.push('wclass '+e.message);}
function toSword(w){const s=makeWeapon('sword',Math.max(1,w.lvl||1),w.rar||0,{plain:1});s.refine=w.refine||0;s.card=w.card||null;if(w.seal!=null)s.seal=w.seal;return s;}
try{const _np=newPlayer;newPlayer=function(){const p=_np.apply(this,arguments);try{if(p&&p.weapon&&p.weapon.t==='dagger')p.weapon=toSword(p.weapon);}catch(e){}return p;};}catch(e){ERR.push('newPlayer '+e.message);}
function fixPlayer(){try{if(typeof P==='undefined'||!P||!P.weapon)return;if(P.cls==='novice'&&P.weapon.t==='dagger'&&!(window.__KEEPW&&__KEEPW.on&&__KEEPW.keep())){P.weapon=toSword(P.weapon);recalc();}}catch(e){}}
try{const _lz=loadZone;loadZone=function(){const r=_lz.apply(this,arguments);try{patchData();fixPlayer();}catch(e){}return r;};}catch(e){ERR.push('loadZone '+e.message);}
window.__P202={errors:ERR,hpMul:HPMUL};if(ERR.length)console.warn('[p202]',ERR);
})();

