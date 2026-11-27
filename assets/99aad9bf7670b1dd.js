
/* ---- candidate_balance_v1_r3: p255 r3 balance v1 (balance/approved/BALANCE_SPEC_v1.md + balance/review_map4_r28, TEST only), loaded last ---- */
/* p255 r3 — Balance v1 (candidate_balance_v1_r3, TEST only, built on candidate_bow_r5 + Map 4 r28 + bow 8 directions). Not merged, not published.
   r3: balance/review_map4_r28 — Gale swoop out-cooldown [2,3] -> [3,4] s (Map 2 and Map 4 Gale); swoop wind 0.3 -> 0.36 s with the Studio attack
       frames (art wind-up 3 x 120 ms, frame 4 = the hit; balance OK'd 0.36 s) — the wind-up frames are shown for drawing only, the engine never sees it.
   Spec: balance/approved/BALANCE_SPEC_v1.md (Balance Analyst, 17 Oct 2026; DeaRz handed the balance decisions over: "ขอแค่ไม่ฟามง่ายจนเกินไปจนน่าเบื่อ").
   Loaded LAST, so every wrapper here is the outermost one. All numbers live in __BAL1.cfg.
     1 armor      K(L) = 100 + 10·L, L = level of the side that is hit (monster hit -> e.L, player hit -> P.lvl). The game's own resolveHit
                  reads CFG.dmg.armorK; it is set for the duration of each K.resolveHit call only (DoT ticks keep the old constant).
     2 attack rate one rule for sword and bow: rate = base × aspdF × (1 + aspd%) / 1.06, cap 5 / s. Sword base = 1 swing per 1.5 s
                  (the old 1.5× sword speed cap is gone). The swing itself keeps its current play speed (user 9 Oct: 50 % faster); the
                  hero waits in the ready stance until the next swing is due. Bow base = 1 shot per 1.0 s (shot clip), cap raised 1.5× -> 5 / s.
     3 damage     basic coefficient sword 4.0 -> 5.0 per swing, NO 3rd-swing ×1.5 (and no legacy ×1.35 finisher); bow 4.2 -> 2.7.
     4 monsters   HP × (0.575 + 0.028·min(L,20)), ATK × (1.84 + 0.064·min(L,20)) on every role row of D.mon.hp / D.mon.atk (index L−1),
                  once (flag D.mon._bal1), on top of p202 and the species layer (species multipliers apply after, as before).
     5 EXP        per species × (leafbun 0.85, mossback 1.35, stoneboar 1.25, dewbeetle 1.10, duskstag 1.05), on e.expBase.
     6 HP orb     8 % -> 2 % of max HP.
     7 flinch     a sword hit never cuts a wind-up (follows from 3: no 3rd-swing finisher -> p203 treats every swing as a normal hit).
     8 Gale Feather instead of shooting from 170–360 px it swoops into melee reach for its attack, strikes, and hovers there for a moment
                  (any weapon), then flies back out. Its damage is its normal ATK through the game's own hurtPlayer.
     9 stat page  (r2, balance review v1 r1) the Combat Stats ASPD row shows the real rate of rule 2: "ASPD <speed %> · <attacks> ครั้ง/วิ"
                  (sword = swings/s, bow = shots/s, both capped at 5). Other weapons keep the old line. Display only. */
(function(){
'use strict';
const BAL=window.__BAL1={ver:'p255-r3',err:[],
  stats:{armorCalls:0,orbs:0,swoops:0,swoopHits:0,swoopMiss:0,expSet:0,swings:0,swingsGated:0},
  cfg:{armor:{base:100,per:10},
       rate:{ref:1+5*.012,cap:5,swordPer:1.5,bowShot:1.0},
       coef:{sword:5.0,bow:2.7},
       hpf:{a:.575,b:.028,cap:20},atkf:{a:1.84,b:.064,cap:20},
       expMul:{leafbun:.85,mossback:1.35,stoneboar:1.25,dewbeetle:1.10,duskstag:1.05},
       orb:{old:.08,now:.02},
       comboReset:1.1,
       swoop:{types:['galefeather'],lead:.6,speed:360,maxDist:440,reachPad:22,wind:.36,hover:1.5,outCd:[3.0,4.0]}}};
const CF=BAL.cfg;
const err=m=>{BAL.err.push(m);try{console.warn('[p255]',m);}catch(_){}};
const A=()=>(window.C182&&C182.api)||null;
const clk=()=>typeof time==='number'?time:performance.now()/1000;
const aspdNow=()=>{let b=0;try{b=B('aspd')||0;}catch(_){}return (P.aspdF||1)*(1+b);};

/* ---------- 1 armor: K(L) of the defender ---------- */
try{const K=(window.C182&&C182.api&&C182.api.K)||null;if(!K||!K.CFG||typeof K.resolveHit!=='function')throw new Error('combat core (C182.api.K) missing');   // COLCMB is a script-scope const: reach it through C182.api.K
  const _rh=K.resolveHit;
  K.resolveHit=function(i){const c=K.CFG.dmg,k0=c.armorK;let L=i&&i.tgtLvl!=null?+i.tgtLvl:1;if(!(L>=1))L=1;
    c.armorK=CF.armor.base+CF.armor.per*L;BAL.stats.armorCalls++;
    try{return _rh.apply(this,arguments);}finally{c.armorK=k0;}};
  BAL.armorK=L=>CF.armor.base+CF.armor.per*L;
}catch(e){err('armor '+e.message);}

/* ---------- 3 + 4 data: weapon coefficients, monster HP/ATK tables (once) ---------- */
const fac=(f,L)=>f.a+f.b*Math.min(L,f.cap);
BAL.hpf=L=>fac(CF.hpf,L);BAL.atkf=L=>fac(CF.atkf,L);
function patchData(){const a=A();if(!a)return false;const D=a.D();if(!D||!D.mon||!D.weapons)return false;
  if(!D.weapons._bal1){for(const k in CF.coef){const w=D.weapons[k];if(!w)continue;w.actionCoef=CF.coef[k];w.perHitCoef=CF.coef[k];}D.weapons._bal1=1;}
  if(!D.mon._bal1){if(!D.mon._p202)return false;   // after the p202 HP pass, never before
    for(const role in D.mon.hp){const h=D.mon.hp[role];for(let i=0;i<h.length;i++)h[i]=Math.max(1,Math.round(h[i]*BAL.hpf(i+1)));}
    for(const role in D.mon.atk){const t=D.mon.atk[role];for(let i=0;i<t.length;i++)t[i]=Math.round(t[i]*BAL.atkf(i+1)*100)/100;}
    D.mon._bal1=1;}
  return true;}
try{if(!patchData())setTimeout(()=>{try{if(!patchData())err('combat data not ready');}catch(e){err('data '+e.message);}},0);}catch(e){err('data '+e.message);}
try{const _lz=loadZone;loadZone=function(){try{patchData();}catch(_){}return _lz.apply(this,arguments);};}catch(e){err('loadZone '+e.message);}

/* ---------- 5 EXP per species (re-applied after elite promotion, which resets expBase) ---------- */
function expSet(e){try{if(!e||e.expBase==null)return e;const m=CF.expMul[e.type];if(!m||e._bal1Exp===e.expBase)return e;
  e.expBase=Math.round(e.expBase*m);e._bal1Exp=e.expBase;BAL.stats.expSet++;}catch(_){}return e;}
try{const _mk=makeEnemy;makeEnemy=function(){return expSet(_mk.apply(this,arguments));};}catch(e){err('makeEnemy '+e.message);}
try{const _pe=promoteElite;promoteElite=function(e){const r=_pe.apply(this,arguments);expSet(e);return r;};}catch(e){err('promoteElite '+e.message);}

/* ---------- 6 HP orb 8 % -> 2 % ---------- */
try{const _h=healP;healP=function(v){
    try{if(window.C182&&C182.hsrc==='pickup'&&P&&Math.abs(v-P.maxHp*CF.orb.old)<1e-6){const a=Array.prototype.slice.call(arguments);a[0]=P.maxHp*CF.orb.now;BAL.stats.orbs++;return _h.apply(this,a);}}catch(_){}
    return _h.apply(this,arguments);};}catch(e){err('healP '+e.message);}

/* ---------- 2 bow: shot time = 1.0 s / (aspd / 1.06), cap 5 shots / s ---------- */
try{const BW=window.BOW;if(BW&&BW.cfg){BW.cfg.shot=CF.rate.bowShot;BW.cfg.maxSpd=CF.rate.cap*CF.rate.bowShot;}else err('bow cfg missing');}catch(e){err('bow '+e.message);}

/* ---------- 2 + 3 + 7 sword: one swing per period, no 3rd-swing finisher ---------- */
const H=window.HERO3D,HD=window.__HERO3D;
const swordNow=()=>{try{return !!(H&&H.on&&H.ready&&H.ready()&&P&&P.weapon&&P.weapon.t==='sword'&&!(window.BOW&&BOW.bowNow&&BOW.bowNow()));}catch(_){return false;}};
BAL.swordPeriod=()=>Math.max(1/CF.rate.cap,CF.rate.swordPer*CF.rate.ref/Math.max(.05,aspdNow()));
let nextAt=-1;BAL.nextAt=()=>nextAt;
try{if(HD&&HD.comboReset<CF.comboReset)HD.comboReset=CF.comboReset;}catch(_){}   // the pause between swings must not reset the 1-2-3 swing order
if(H&&typeof H.segLen==='function'){
  const _ba=basicAttack;basicAttack=function(){
    if(!swordNow())return _ba.apply(this,arguments);
    if(H.firing){                                    // impact frame of a swing (p194 firePending)
      if(H.mul>1.01)H.mul=H.mul/1.5;                // 3rd swing: drop ×1.5 (p194 already divides out the game's ×1.35 finisher)
      return _ba.apply(this,arguments);}
    const now=clk();
    if(now<nextAt-1e-6){BAL.stats.swingsGated++;return;}
    const a0=H.anim,r=_ba.apply(this,arguments),an=H.anim;
    if(an&&an!==a0&&Math.abs(an.t0-now)<1e-9){      // a new swing started this call
      const T=BAL.swordPeriod(),k=an.k,seg=H.segLen(k),ch=(HD&&HD.comboChain)||0;
      const f=Math.max(an.f,(seg-ch)/T);             // play speed: the user's swing speed, faster only if the period is shorter than the swing
      if(f!==an.f){an.f=f;const p=H.pend;if(p&&p.k===k){const S0=HD.combo[k];p.t=an.t0+S0.hit/f;p.end=an.t0+seg/f;}P.atkCd=seg/f;}
      nextAt=now+T;BAL.stats.swings++;BAL.last={t:now,k,T,f};}
    return r;};
  try{const _pd=playerDeath;playerDeath=function(){nextAt=-1;return _pd.apply(this,arguments);};}catch(_){}
}else err('HERO3D missing: sword rate not applied');

/* ---------- 8 Gale Feather swoop ---------- */
const SW=CF.swoop,SWT=new Set(SW.types);
const rr=(a,b)=>a+Math.random()*(b-a);
const unW=(e,S)=>{if(S&&S.w){e.wind=0;e.windT=S.w0;S.w=0;}};   // the engine AI never sees the draw-only wind-up
try{const _ue=updEnemies;updEnemies=function(dt){
    const pre=[];dt=+dt||0;
    try{for(const e of enemies){if(e.dead||!SWT.has(e.type)||!e.m||!e.m.rng)continue;
      if(e.bal1S){unW(e,e.bal1S);pre.push([e,e.x,e.y,e.castCd]);}
      else if(e.aggro&&!P.dead&&e.castCd!=null&&e.castCd<SW.lead&&Math.hypot(P.x-e.x,P.y-e.y)<SW.maxDist&&!(e.st&&(e.st.stun||e.st.root||e.st.fear))){
        e.bal1S={ph:'in',t:0};e.castCd=99;BAL.stats.swoops++;pre.push([e,e.x,e.y,e.castCd]);}}}catch(_){}
    const r=_ue.apply(this,arguments);
    for(const [e,x0,y0] of pre){try{const S=e.bal1S;if(!S)continue;
      if(e.dead||P.dead||!e.aggro){unW(e,S);delete e.bal1S;if(!e.dead)e.castCd=rr(SW.outCd[0],SW.outCd[1]);continue;}
      e.castCd=99;
      // the engine moved it with its kite rule: undo that, keep only the knock-back slide
      const kx=e.x-x0,ky=e.y-y0,kb=Math.hypot(e.vx||0,e.vy||0)>1;e.x=x0+(kb?kx:0);e.y=y0+(kb?ky:0);
      if(e.st&&e.st.stun)continue;
      S.t+=dt;const dP=Math.hypot(P.x-e.x,P.y-e.y),reach=e.sz+P.r+SW.reachPad;e.face=Math.atan2(P.y-e.y,P.x-e.x);
      if(S.ph==='in'){
        if(dP>reach){const s=Math.min(SW.speed*dt,dP-reach+4);e.x+=(P.x-e.x)/dP*s;e.y+=(P.y-e.y)/dP*s;}
        if(dP<=reach+2||S.t>2.5){S.ph='wind';S.t=0;e.atkAng=e.face;}}
      else if(S.ph==='wind'){
        if(dP>reach){const s=Math.min(SW.speed*.5*dt,dP-reach);e.x+=(P.x-e.x)/dP*s;e.y+=(P.y-e.y)/dP*s;}
        if(S.t>=SW.wind){S.ph='hover';S.t=0;unW(e,S);
          if(dP<=reach+18){hurtPlayer(e.atk,e);BAL.stats.swoopHits++;}else BAL.stats.swoopMiss++;
          try{ring(e.x+Math.cos(e.face)*e.sz,e.y+Math.sin(e.face)*e.sz,4,e.sz*1.4,.25,e.m.c,4);}catch(_){}
          e.lunge=.15;}
        else{if(!S.w){S.w=1;S.w0=e.windT;}e.windT=SW.wind;e.wind=Math.max(1e-3,SW.wind-S.t);}}   // draw-only: the sprite plays its wind-up frames 1-3 over the swoop wind, frame 4 lands on the hit
      else if(S.ph==='hover'){
        if(dP>reach+30){const s=Math.min(e.sp*dt,dP-reach);e.x+=(P.x-e.x)/dP*s;e.y+=(P.y-e.y)/dP*s;}
        if(S.t>=SW.hover){delete e.bal1S;e.castCd=rr(SW.outCd[0],SW.outCd[1]);}}
    }catch(er){try{unW(e,e.bal1S||{});}catch(_){}delete e.bal1S;}}
    return r;};}catch(e){err('swoop '+e.message);}
try{const _lz2=loadZone;loadZone=function(){const r=_lz2.apply(this,arguments);try{for(const e of enemies)delete e.bal1S;}catch(_){}return r;};}catch(_){}

/* ---------- 9 stat page: ASPD row = the attack rate of rule 2 (display only) ---------- */
BAL.rateNow=()=>{try{const t=P&&P.weapon&&P.weapon.t,a=aspdNow()/CF.rate.ref;
  if(t==='bow'&&window.BOW&&BOW.cfg)return {w:'bow',pct:Math.round(a*100),hits:Math.min(CF.rate.cap,a/CF.rate.bowShot)};
  if(t==='sword'&&window.HERO3D&&HERO3D.on&&BAL.swordPeriod)return {w:'sword',pct:Math.round(a*100),hits:1/BAL.swordPeriod()};}catch(_){}return null;};
try{const _ds=derivedStats;derivedStats=function(){const d=_ds.apply(this,arguments);try{const r=BAL.rateNow();if(r){d.aspd=r.pct+'%';d.hits=r.hits;}}catch(_){}return d;};}catch(e){err('stat page '+e.message);}

if(BAL.err.length)console.warn('[p255]',BAL.err);
})();

