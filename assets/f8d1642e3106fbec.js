
/* ---- spinfix-r1 (TEST, 11 Nov 2026): sword spin skills (Whirlwind / Blade Storm = P.spin) ----
   DeaRz: "the sword spin skill does no damage with the new character; make the storm able to walk".
   Findings (headless, racelines_r2 chain): with the skill learned (level >= 1) the engine spin ticks hit every enemy inside r (Whirlwind r175 every 0.2 s, Blade Storm r235 every 0.18 s), every hit shows its own number and there is no knockback; damage was 0 only when the skill level was 0
   (cast refused: castSkillNow returns false, nothing starts, nothing spins) - that is a hero that has not learned the skill (class change / new character resets nothing in this chain, but an unlearned skill never casts).
   What this module adds: (1) walking during the spin at SPIN_SPEED x walk speed (0.65) - the puppet's spin pose already plays 'moving' while the hero walks and the tornado art follows the hero; (2) a safety net: a spin that is running with 0 hits in its first 0.6 s is logged (SPINFIX.zero) so a real 'no damage' case is visible;
   (3) damage numbers are the game's own; nothing sets knockback. ?spinfix=off disables. Debug: window.SPINFIX. ---- */
(function(){'use strict';
const Q=String(location.search),OFF=/[?&]spinfix=off\b/.test(Q);
const SF=window.SPINFIX=window.SPINFIX||{ver:'spinfix-r1',on:!OFF,err:null,cfg:{SPIN_SPEED:.65},stats:{slowFrames:0,spins:0,zero:0,ticks:0},log:[]};
if(OFF)return;
const ERR=(w,e)=>{SF.err=w+': '+((e&&e.message)||e);try{console.error('[SPINFIX]',w,e)}catch(_){}};
try{const _u=update;update=function(dt){let slowed=false;try{if(P&&!P.dead&&P.spin&&P.spin.t>0&&typeof P.speed==='number'&&!P._sfSpd){P._sfSpd=P.speed;P.speed=P.speed*SF.cfg.SPIN_SPEED;slowed=true;SF.stats.slowFrames++}}catch(e){ERR('pre',e)}
    try{return _u.apply(this,arguments)}finally{try{if(slowed&&P&&P._sfSpd){P.speed=P._sfSpd;P._sfSpd=null}}catch(e){ERR('post',e)}}}}catch(e){ERR('hook update',e)}
/* Sword skill atk3 (วังวนเจ็ดคม): the game marks the hero busy with P.dash{atk3}; the movement code skips walking while P.dash exists. Outermost updPlayer wrapper: for this ONE call hide P.dash and scale P.speed, restore in finally. */
try{const _p=updPlayer;updPlayer=function(){let d=null,s0=null,sl=false;
  try{const A=window.__SKATK3;if(A&&A.state&&P&&!P.dead&&P.dash&&(P.dash.atk3||P.dash.swrw)&&!P.dash.leap&&!(P.dash.vx||P.dash.vy)&&G.state==='play'){d=P.dash;s0=P.speed;P.dash=null;P.speed=s0*SF.cfg.SPIN_SPEED;sl=true;SF.stats.atk3Walk=(SF.stats.atk3Walk||0)+1;P.face=A.state.face}}catch(e){ERR('p-pre',e)}
  /* the rework's atk3 (E.k==='atk3') keeps its damage centre, fire ring, embers and dust at E.anchor = the CAST point: move it with the hero (damage area + ring follow the walk) */
  try{const E=window.__SWRW&&__SWRW.cur;if(E&&E.k==='atk3'&&E.anchor&&P&&!P.dead){if(E.anchor.x!==P.x||E.anchor.y!==P.y){E.anchor.x=P.x;E.anchor.y=P.y;SF.stats.anchorMoves=(SF.stats.anchorMoves||0)+1}}}catch(e){ERR('anchor',e)}
  const px=P?P.x:0;
  try{return _p.apply(this,arguments)}finally{try{if(sl){SF.dbg=[Math.round(px),Math.round(P.x),Math.round(P.speed),!!keys.d,P.stunT,!!P.casting,G.joy?1:0,P.vx,P.vy];P.speed=s0;if(!P.dash)P.dash=d}}catch(e){ERR('p-post',e)}}}}catch(e){ERR('hook updPlayer',e)}
/* zero-hit watch: a spin that has enemies in range but dealt nothing is recorded */
try{const _h=hitEnemy;hitEnemy=function(e,m,o){try{if(P&&P.spin&&P.spin.t>0&&o&&o===P.spin.o){SF.stats.ticks++;P.spin._hit=(P.spin._hit||0)+1}}catch(_){}return _h.apply(this,arguments)}}catch(e){ERR('hook hit',e)}
setInterval(()=>{try{const sp=window.P&&P.spin;if(sp&&sp.t>0){if(!sp._sf){sp._sf=1;sp._t0=time;SF.stats.spins++}else if(!sp._chk&&time-sp._t0>.6){sp._chk=1;let near=0;for(const e of enemies)if(!e.dead&&Math.hypot(e.x-P.x,e.y-P.y)<sp.r+e.sz)near++;if(near&&!(sp._hit>0)){SF.stats.zero++;SF.log.push('spin with '+near+' enemies in range dealt 0 hits at t='+time.toFixed(1))}}}}catch(e){ERR('watch',e)}},100);
console.info('[SPINFIX] spin walking x'+SF.cfg.SPIN_SPEED+' loaded');
})();
