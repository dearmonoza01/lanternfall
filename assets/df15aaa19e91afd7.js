
/* ---- mobchase-r1 (TEST, 11 Nov 2026): Ragnarok-style monster chasing (DeaRz 22:49; SPEC_mob_chase_ro_r1 + BALANCE_mob_chase_farming_v1 + BALANCE_field_swarm_v2) ----
   1. NO leash / reset on field monsters: every module's leash / rectangle / "return home, full HP, immune (รีเซ็ต)" state is cancelled the frame it starts (w22ret, Map 10 _home heal, engine 1600 px leash).
   2. A monster with a target keeps chasing while the hero is within LOSE (520 px); beyond LOSE for GRACE (1.5 s) it drops the target and STOPS where it is: no walk home, no heal; its new home is that spot, wander radius 60 px.
   3. Aggressive monsters notice the hero within SIGHT (360 px, or their own existing per-species value); passive ones only when hit. LINK: when a monster is hit / starts chasing, idle monsters of the SAME species within LINK_R (300 px) join (one step, no chain).
   4. No cap on followers; at most MAX_ATTACKERS (8) attack at the same time (the rest wait). Field ordinary hits x FIELD_ATK_MULT 0.70, count-scaled swarm factor per attacker (1 + 0.25 x (n-1)) / n with n = attackers hitting now (cap 8; n=2 0.625, n=4 0.44, n=8 0.34) [BALANCE_field_swarm_v2.md v2.1]; ?swarm2=off = old flat 0.6. Aggressive share 0.85 on Lv10+ farm maps (stable per monster; retaliatory species stay passive).
   5. Safe areas: monsters stop at the edge (position reverted) and lose the target after the grace time. Warps: monsters are per-map and never follow. Walls: a chaser blocked for 2 s slides along the wall (no pathfinding).
   6. A monster with NO target left alone 5 min may despawn (spawner refills); ?mobdespawn=off disables. Bosses, gates and safe maps are untouched.
   Flags: ?mobchase=off (old leash), ?swarm2=off (old swarm numbers: SIGHT 300, ATK x1, swarm .6, max 6, share .7, no LINK), ?mobsight=N, ?moblose=N. Config + stats: window.__MOBCHASE. ---- */
(function(){'use strict';
const Q=String(location.search),OFF=/[?&]mobchase=off\b/.test(Q),SW2=!/[?&]swarm2=off\b/.test(Q);
const num=(k,d)=>{const m=new RegExp('[?&]'+k+'=(\\d+)').exec(Q);return m?+m[1]:d};
const MC=window.__MOBCHASE={ver:'mobchase-r1',on:!OFF,err:null,
  cfg:{SIGHT:num('mobsight',SW2?360:300),LOSE:num('moblose',520),GRACE:1.5,WANDER:60,DESPAWN_S:300,DESPAWN:!/[?&]mobdespawn=off\b/.test(Q),
    FIELD_ATK_MULT:SW2?.70:1,SWARM_MULT:.6,SWARM_ALPHA:.25,SWARM_COUNT:SW2,MAX_ATTACKERS:SW2?8:6,AGGRO_SHARE:SW2?.85:.7,LINK_R:SW2?300:0,AGGRO_MIN_LV:10,SWARM_R:260,STUCK_S:2},
  stats:{lost:0,leashCancelled:0,healUndone:0,linked:0,safeStops:0,despawned:0,slides:0,held:0}};
if(OFF)return;
const ERR=(w,e)=>{MC.err=w+': '+((e&&e.message)||e);try{console.error('[MOBCHASE]',w,e)}catch(_){}};
const C=MC.cfg;
const isField=e=>{try{if(!e||e.dead||e.gate||e.m.boss||e.raid||e.raidB||e.dev)return false;const Z=ZONES[G.zone];return !!Z&&!Z.safe&&!Z.fullSafe&&!Z.dev&&G.zone!=='gate_inst'&&!Z.gate}catch(_){return false}};
/* ---- safe areas: engine areas flagged safe + the Map 4 family's rectangles + any registered function ---- */
MC.safeFns=[];
function safeAt(x,y){try{const Z=ZONES[G.zone];for(const a of (Z&&Z.areas)||[])if(a.safe&&Math.hypot(a.x-x,a.y-y)<a.r)return true;
  const M4=window.__M4T;if(M4&&M4.zsafe&&G.zone&&(G.zone===M4.id||(M4.sub&&M4.sub.has(G.zone)))){const L=Array.isArray(M4.zsafe)?M4.zsafe:Object.values(M4.zsafe);for(const r of L){if(Array.isArray(r)&&r.length>=4&&x>=r[0]&&x<=r[2]&&y>=r[1]&&y<=r[3])return true;if(r&&typeof r==='object'&&r.r!=null&&Math.hypot(r.x-x,r.y-y)<r.r)return true}}
  for(const f of MC.safeFns)if(f(x,y))return true}catch(_){}return false}
MC.safeAt=safeAt;
/* ---- sight / aggressive share ---- */
try{const _d=detectR;detectR=function(e){const o=_d.apply(this,arguments);if(!isField(e)||e.w22am!=null||e.sp10)return o;return Math.max(o,C.SIGHT)}}catch(e){ERR('detectR',e)}
try{const _a=isAggressive;isAggressive=function(e){const o=_a.apply(this,arguments);if(o||!isField(e)||e.retal||(e.L|0)<C.AGGRO_MIN_LV)return o;if(e.mcAgg==null)e.mcAgg=Math.random()<C.AGGRO_SHARE?1:0;return !!e.mcAgg}}catch(e){ERR('isAggressive',e)}
/* ---- LINK: one step, same species, idle monsters within LINK_R join ---- */
try{const _p=provoke;provoke=function(e){const was=e&&e.aggro;const r=_p.apply(this,arguments);try{if(C.LINK_R>0&&e&&!was&&e.aggro&&isField(e)&&!e.mcLinkedBy){for(const o of enemies){if(o===e||o.dead||o.aggro||o.type!==e.type||!isField(o)||o.w22ret)continue;if(Math.hypot(o.x-e.x,o.y-e.y)<=C.LINK_R){o.aggro=true;o.alertT=.9;o.calmT=0;o.mcLinkedBy=1;MC.stats.linked++}}}}catch(er){ERR('link',er)}return r}}catch(e){ERR('provoke',e)}
/* ---- swarm v2 + field ATK ---- */
try{const C2=window.__C2||window.C2;if(C2&&C2.api&&C2.api.SWARM)C2.api.SWARM.on=false}catch(_){}
function nearAttackers(){let n=0;for(const e of enemies)if(!e.dead&&e.aggro&&isField(e)&&Math.hypot(e.x-P.x,e.y-P.y)<C.SWARM_R)n++;return n}
try{const _h=hurtPlayer;hurtPlayer=function(raw,src){try{if(src&&isField(src)&&!src.m.elite){raw*=C.FIELD_ATK_MULT;{const n=Math.min(C.MAX_ATTACKERS,nearAttackers());if(n>=2)raw*=C.SWARM_COUNT?(1+C.SWARM_ALPHA*(n-1))/n:C.SWARM_MULT}}}catch(er){ERR('hurt',er)}return _h.call(this,raw,src)}}catch(e){ERR('hurtPlayer',e)}
/* ---- the per-frame step around the engine AI ---- */
try{const _u=updEnemies;updEnemies=function(dt){
  if(typeof P==='undefined'||!P||G.zone==='gate_inst')return _u.apply(this,arguments);
  const pre=new Map(),field=[];for(const e of enemies){if(!isField(e))continue;field.push(e);pre.set(e,{aggro:e.aggro,x:e.x,y:e.y,hp:e.hp,ret:!!e.w22ret,home:!!e._home})}
  /* attacker cap: the nearest MAX_ATTACKERS may attack, the rest wait */
  try{const al=field.filter(e=>e.aggro&&Math.hypot(e.x-P.x,e.y-P.y)<C.SWARM_R).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y));for(let i=C.MAX_ATTACKERS;i<al.length;i++){const e=al[i];if(!(e.wind>0)){e.atkCd=Math.max(e.atkCd||0,.3);e.castCd=Math.max(e.castCd||0,.3)}MC.stats.held++}}catch(er){ERR('cap',er)}
  const r=_u.apply(this,arguments);
  try{const alive=!P.dead&&G.state==='play'&&!(P.stealth>0),inSafeP=safeAt(P.x,P.y),t=time;
    for(const e of field){if(e.dead)continue;const p=pre.get(e);if(!p)continue;const dP=Math.hypot(e.x-P.x,e.y-P.y);
      /* no leash / reset: cancel every module's reset state, undo any heal, keep the target while the hero is in LOSE range */
      if(e.w22ret){e.w22ret=null;MC.stats.leashCancelled++;e.hp=Math.min(e.hp,Math.max(p.hp,1));if(p.aggro&&!p.ret)e.aggro=p.aggro}
      if(e._home&&!p.home){e._home=0;if(e.hp>p.hp){e.hp=p.hp;MC.stats.healUndone++}}
      if(p.aggro&&!e.aggro&&alive&&!inSafeP&&dP<=C.LOSE&&!e.mcLost)e.aggro=true;
      /* lose the target beyond LOSE for GRACE (or while the hero is safe / dead) and stop where we are */
      const mc=e.mc||(e.mc={out:0,t0:t,sx:e.x,sy:e.y,mx:e.x,my:e.y});
      if(e.aggro){if(!alive||dP>C.LOSE||inSafeP)mc.out+=dt;else mc.out=0;
        if(mc.out>=C.GRACE){e.aggro=false;e.vx=e.vy=0;e.wind=0;e.strikeT=0;e.tele=null;e.calmT=0;e.sx=e.x;e.sy=e.y;e.wx=e.x;e.wy=e.y;e.wanderT=1+Math.random()*2;mc.out=0;mc.lostAt=t;MC.stats.lost++}}
      else{mc.out=0;if(mc.lostAt==null)mc.lostAt=t;
        /* new home = where it stopped: wander only within WANDER px of it */
        if(e.sx!=null&&e.wx!=null&&Math.hypot(e.wx-e.sx,e.wy-e.sy)>C.WANDER){const a=Math.atan2(e.wy-e.sy,e.wx-e.sx),d=Math.random()*C.WANDER;e.wx=e.sx+Math.cos(a)*d;e.wy=e.sy+Math.sin(a)*d}
        /* idle 5 min, far from the hero: despawn so the spawner refills */
        if(C.DESPAWN&&t-mc.lostAt>C.DESPAWN_S&&dP>1400){e.dead=true;e.mcDespawn=1;MC.stats.despawned++}}
      if(e.aggro)mc.lostAt=null;
      /* safe area edge: never step into it */
      if(!e.dead&&(e.x!==p.x||e.y!==p.y)&&safeAt(e.x,e.y)&&!safeAt(p.x,p.y)){e.x=p.x;e.y=p.y;MC.stats.safeStops++}
      /* blocked by a wall for STUCK_S while chasing: slide along it */
      if(e.aggro&&dP>(e.sz||16)+P.r+10){if(Math.hypot(e.x-mc.mx,e.y-mc.my)>3){mc.mx=e.x;mc.my=e.y;mc.st=t}else if(t-(mc.st==null?t:mc.st)>C.STUCK_S){const a=Math.atan2(P.y-e.y,P.x-e.x),s=(mc.dir=(mc.dir||(Math.random()<.5?1:-1))),spd=(e.sp||60)*dt*1.1,nx=e.x-Math.sin(a)*s*spd,ny=e.y+Math.cos(a)*s*spd;if(!(typeof blocked==='function'&&blocked(nx,ny,(e.sz||16)*.7))){e.x=nx;e.y=ny;MC.stats.slides++}else{mc.dir=-s}}}
      else mc.st=t}
    for(let i=enemies.length-1;i>=0;i--)if(enemies[i].mcDespawn)enemies.splice(i,1)}catch(er){ERR('post',er)}
  return r}}catch(e){ERR('updEnemies',e)}
console.info('[MOBCHASE] Ragnarok-style chase loaded: SIGHT '+C.SIGHT+' LOSE '+C.LOSE+' swarm2='+SW2);
})();
