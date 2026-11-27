
/* ---- merge m12: p203 range / monster facing / spread / flinch / walk-through r4 ---- */
/* p203 — merge m12 candidate (user 9 Oct 2026 23:30–23:32).
   1. Sword attack range halved (WEAPONS.sword.range 120 -> 60). The 3rd swing keeps its +10.
   2. New-monster sprites (slime / leaf bunny / seedling) face where they are going: while drawn and not attacking, the facing used by the
      sprite = toward the player while it is fighting/chasing, otherwise its own movement direction when it walks. e.face is restored right after the
      draw, so gameplay code is untouched (render-side fix only).
   3. Map 2 groups spread out: every group's home radius x2.5 (min 90, max 220); members are placed 35–95 % of that radius from the centre.
   4. Hit flinch + push-back (user 23:43): normal hit 0.2 s (never cuts an attack) + ~10 px, 3rd swing 0.4 s (cuts a wind-up) + ~28 px,
      1.5 s lock between normal-hit flinches, elite half, boss none. Uses the engine's own stun branch for that update only (no STUN text,
      no stars, does not count as a status for damage bonuses). TEST DRAFT.
   5. Walk through monsters (user 23:49/23:52): the player passes through ordinary/elite monsters without pushing them; bosses stay solid. */
(function(){
'use strict';
const ERR=[];
try{if(WEAPONS.sword&&!WEAPONS.sword._p203){WEAPONS.sword.range=Math.round(WEAPONS.sword.range/2);WEAPONS.sword._p203=1;}}catch(e){ERR.push('range '+e.message);}
// 3. spread (population is read lazily on the first Map 2 entry)
try{const PD=window.__W22_DATA&&window.__W22_DATA.population;
  if(PD&&!PD._p203){for(const g of PD.groups){if(g.r!=null){g.r0=g.r;g.r=Math.max(90,Math.min(220,Math.round(g.r*2.5)));}}PD._p203=1;}
  else if(!PD)ERR.push('no population');}catch(e){ERR.push('spread '+e.message);}
// 2. facing
const TYPES=new Set(['slime','leafbun','seedling','puffcap','briarfox']);   // m22: + puffcap (p213) · m34: + briarfox (p220)
const LAST=new WeakMap();
function wanted(e){
  if(e.wind>0||e.strikeT>0||e.lunge>0)return null;                    // attack keeps its own locked direction
  let s=LAST.get(e);const now=time;
  if(!s){s={x:e.x,y:e.y,t:now,vx:0,vy:0};LAST.set(e,s);return null;}
  const dt=now-s.t;
  if(dt>1e-4){const k=Math.min(1,dt*8);s.vx+=((e.x-s.x)/dt-s.vx)*k;s.vy+=((e.y-s.y)/dt-s.vy)*k;if(dt>.4){s.vx=0;s.vy=0;}s.x=e.x;s.y=e.y;s.t=now;}
  const moving=Math.hypot(s.vx,s.vy)>30&&Math.hypot(e.vx||0,e.vy||0)<40;   // walking (not a knock-back slide / collision jitter)
  if(e.aggro&&!e.w22ret&&P&&!P.dead)return Math.atan2(P.y-e.y,P.x-e.x);  // fighting / chasing: always look at the player
  if(moving)return Math.atan2(s.vy,s.vx);                               // wandering or walking home: look where it goes
  return null;}
function install(){
  if(typeof drawEnemy_v1!=='function'){ERR.push('drawEnemy_v1 missing');return;}
  const _d=drawEnemy_v1;
  drawEnemy_v1=function(e){
    if(!e||e.dead||e.sprGhost||!TYPES.has(e.type))return _d.apply(this,arguments);
    let a=null;try{a=wanted(e);}catch(_){}
    if(a==null)return _d.apply(this,arguments);
    const f0=e.face;e.face=a;try{return _d.apply(this,arguments);}finally{e.face=f0;}};}
setTimeout(()=>{try{install();}catch(er){ERR.push('install '+er.message);}},60);
// 4. flinch + small push-back (user 23:43, agreed design)
//    normal hit : flinch 0.2 s only if the monster is NOT winding up / striking (an attack in progress is never cut), push ~10 px,
//                 then no new flinch from normal hits for 1.5 s (still pushed, still damaged)
//    3rd swing  : flinch 0.4 s even through its own wind-up (cuts the attack), push ~28 px; ignores the 1.5 s lock and starts it again
//    elite = half flinch time and half push (the engine already scales elite knock-back by 0.3, so the extra push is added on top)
//    boss / raid boss: no flinch, no push.  DoT / thorns: nothing.
const F={norm:.2,fin:.4,cd:1.5,pushN:39,pushF:110};      // push = start speed px/s; the engine decays it to ~0.26 x speed in distance
const tough=e=>!!(e.m&&(e.m.boss||e.m.raid||e.m.refboss));
const isFin=()=>{try{const H=window.HERO3D;return !!(H&&H.firing&&H.mul>1.01);}catch(_){return false;}};
try{const _he=hitEnemy;hitEnemy=function(e,m,o){const h0=e?e.hp:0,fin=isFin(),r=_he.apply(this,arguments);
    try{if(e&&!e.dead&&e.hp<h0&&!(o&&(o.dot||o.thorn||o.echo))&&!tough(e)&&!e.w22ret){
      const el=!!(e.m&&e.m.elite)||!!e.eliteX,k=el?.5:1;
      // push-back from the player (adds to whatever knock-back the attack already gave, never more than the target)
      const a=Math.atan2(e.y-P.y,e.x-P.x),want=(fin?F.pushF:F.pushN)*k,have=(o&&o.kb?o.kb*(e.m.elite?.3:1):0),add=Math.max(0,want-have);
      e.vx=(e.vx||0)+Math.cos(a)*add;e.vy=(e.vy||0)+Math.sin(a)*add;
      const busy=e.wind>0||e.strikeT>0||e.lunge>0;
      if(fin){e.flinchT=time+F.fin*k;e.flinchCd=time+F.cd;e.flinchCut=1;}
      else if(!busy&&!(e.flinchCd>time)){e.flinchT=time+F.norm*k;e.flinchCd=time+F.cd;e.flinchCut=0;}
    }}catch(_){}return r;};}catch(e){ERR.push('flinch hit '+e.message);}
try{const _ue=updEnemies;updEnemies=function(dt){const set=[],v=(+dt||0)+1e-3;   // the engine subtracts dt from st.stun before testing it: leave 1e-3 for this update only
    for(const e of enemies){if(e.dead||!(e.flinchT>time)||!e.st||e.st.stun)continue;
      if(!e.flinchCut&&(e.wind>0||e.strikeT>0||e.lunge>0))continue;        // a normal-hit flinch never cuts an attack that started meanwhile
      e.st.stun=v;set.push(e);}
    try{return _ue.apply(this,arguments);}finally{for(const e of set){if(e.st&&e.st.stun!=null&&e.st.stun<=2e-3)delete e.st.stun;}}};}catch(e){ERR.push('flinch upd '+e.message);}
// 5. walk through monsters (user 23:49 + 23:52): the player neither shoves an ordinary monster nor is stopped by it.
//    The engine pushes an overlapping monster away by half the overlap at the end of its update; that push is undone exactly
//    (post = P + (pre-P)*(1+push/dP)  =>  pre = P + (post-P)/(1+push/dP)). Bosses / raid bosses keep the engine rule (solid).
try{const _ue2=updEnemies;updEnemies=function(dt){const pre=[];
    try{if(P&&!P.dead&&G.state==='play'){const d_=+dt||0;
      for(const e of enemies){if(e.dead||e.sprGhost||(e.m&&(e.m.boss||e.m.raid)))continue;if(P.stealth>0)continue;
        const dP=Math.hypot(e.x-P.x,e.y-P.y),lim=e.sz+P.r-4;if(!(dP<lim)||dP<=.5)continue;
        if(dP>1900&&!e.aggro)continue;const s=e.st&&e.st.stun;if(typeof s==='number'&&s-d_>0)continue;   // engine skips the push for these
        pre.push([e,dP,(lim-dP)*.5]);}}}catch(_){}
    const r=_ue2.apply(this,arguments);
    for(const [e,dP,push] of pre){if(e.dead)continue;const d1=Math.hypot(e.x-P.x,e.y-P.y),back=Math.min(push,d1-dP);if(!(back>0)||!(d1>0))continue;const k=(d1-back)/d1;e.x=P.x+(e.x-P.x)*k;e.y=P.y+(e.y-P.y)*k;}   // m25: undo only the push the engine really applied (a flinched monster gets no engine push, so nothing is undone -> no more dragging on dash)
    return r;};}catch(e){ERR.push('walkthrough '+e.message);}
window.__P203={errors:ERR};setTimeout(()=>{if(ERR.length)console.warn('[p203]',ERR);},1500);
})();

