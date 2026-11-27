
/* ---- scy3-r1 (TEST allin_r15, 12 Nov 2026): scythe BASIC ATTACK = Motion's 3-click combo + Art's attack waves (DeaRz: motion passed 04:01, waves passed 04:21) ----
   Files (scythe_combo_r4): combo.js (keys / click data, PUPPET.WEAPON_KF scythe_c1..3 chained + scythe_s1..3 solo), drawc.js (drawCombo: layer swap, lunge, turns, air), views.js + spin_parts.js (front / back views for the spins), fx_art.js (SCYFX waves; FXW 3.5, palette 'reaper').
   * input (Motion's proposal): a basic-attack press with no click running starts click 1 (solo); a press during click 1's body (before 0.81 s) chains straight into click 2; a press while a click runs is buffered and starts the next click when it ends (click 3 after click 2);
     the combo resets to click 1 when no press comes within 0.5 s after a click ended; hits and animation scale with attack speed f = aspdF x (1 + aspd bonus); the lunge is visual only (no root motion, the hero can still walk);
   * hits: 12 hits per full chain, every hit shows its own number (cap 99,999), no knockback; the hit areas = the drawn wave radii (none 190 px in front, twirl 128, spin 160, slam 236, ring 293, x0.91 for world px, vertical distance counts double), front target 100 %, other targets in the wave 50 %, max 6 targets, the 'none' hit is single target;
   * damage (CAL 0.86 = engine calibration measured on a dummy so the chained combo DPS = the sword basic DPS; raw Balance proportions): Balance's TEST numbers as a multiple of the OLD scythe basic hit (coefficient 3.1): click 1 .26/.26/.45, click 2 .32/.32/.62, click 3 .19(none)/.23/.23/.26/.26/.42 = 3.82 per chain = the approved scythe basic DPS (sword-equal); ?scy3bal=off = placeholder 0.5 x the basic hit per hit;
   * no wave at click 1 frame 19.7 or click 3 frame 141 (blade trail only); draw order per frame: back waves, hero (drawCombo), blade sub-samples, wave spawns for the hits crossed, front waves (after the entities).
   r17 cost cap (default off, approved look unchanged): in low graphics or with ?scyfxcap=on: max 4 live waves (the oldest ends early) and fewer streaks / segments in spin, twirl and bands.
   r22 (DeaRz 09:59 'the waves fill the whole screen'): the scythe demo draws the waves in its stage space (hero SC 0.55, the whole stage scaled by GK 0.27), so the waves run in stage units under ctx.scale(r, r) with r = game hero scale / 0.55 (about 0.201), all positions divided by r: the wave size relative to the hero equals the demo (the first r22 try used 0.1485 and was 3.7x too big); ?scyfxscale=off = the old unscaled waves. The hit radii (x0.91, Balance) are unchanged.
   r23 (Balance, 12 Nov): the hit world factor is 0.745 (= hero scale / 0.55 x 0.27 / 0.27, the same ratio the waves are drawn with) for ALL wave types, so what you see is what you hit; ?scyhitold=on = the old 0.91.
   ?scythe3=off = the old scythe basic attack. Debug: window.SCY3 ---- */
(function(){'use strict';
const Q=String(location.search),OFF=/[?&]scythe3=off\b/.test(Q),BALOFF=/[?&]scy3bal=off\b/.test(Q),DEMO_SC=.55,FXSCALE=!/[?&]scyfxscale=off\b/.test(Q);
const S3=window.SCY3={ver:'scy3-r1',on:!OFF,err:null,A:null,lastN:0,lastEnd:-99,stats:{clicks:[0,0,0,0],hits:0,dmg:0,chains:0,fxSpawn:0,maxMs:0,drawMs:0,draws:0},
  cfg:{CAL:.86,MULT:{1:[.26,.26,.45],2:[.32,.32,.62],3:[.19,.23,.23,.26,.26,.42]},PLACEHOLDER:.5,RESET:.5,WORLD:(/[?&]scyhitold=on\b/.test(Q)?.91:.745),R:{none:190,twirl:128,spin:160,slam:236,ring:293,arc:200,thrust:200},CAP:99999,MAXT:6,SPLASH:.5,VW:2},bal:!BALOFF};
if(OFF)return;
const ERR=(w,e)=>{S3.err=w+': '+((e&&e.message)||e);try{console.error('[SCY3]',w,e)}catch(_){}};
window.FXW=3.5;window.SCYFX_PAL='reaper';
const PU=()=>window.PUPPET,held=()=>!!(typeof P!=='undefined'&&P&&P.weapon&&P.weapon.t==='scythe');
const fOf=()=>{try{return Math.max(.5,Math.min(3,(P.aspdF||1)*(1+(typeof B==='function'?B('aspd'):0))))}catch(_){return 1}};
const capOn=()=>/[?&]scyfxcap=off\b/.test(Q)?false:/[?&]scyfxcap=on\b/.test(Q)||(()=>{try{return G.gfx==='low'}catch(_){return false}})();
S3.cfg.MAXW=4;
function ready(){return !!(window.COMBO&&window.comboDef&&window.drawCombo&&window.SCYFX&&PU()&&PU().WEAPON_KF&&PU().WEAPON_KF.scythe_c1)}
/* ---------------- click clock ---------------- */
function def(A){return window.comboDef(A.n,A.mode)}
function elapsed(A,t){return t-A.T0}
function qOf(A,t){return Math.min(1,elapsed(A,t)*A.f/def(A).dur)}
function poseOf(A,t){return window.comboPose(A.n,qOf(A,t),A.mode)}
function endT(A){return A.T0+def(A).dur/A.f}
function chainDur(A){const c=window.comboDef(A.n,'chain');return c.dur/A.f}
function facePress(){try{const tg=typeof aimPoint==='function'?aimPoint():null;if(tg)P.face=Math.atan2(tg.y-P.y,tg.x-P.x);else{let best=null,bd=320;for(const e of enemies){if(e.dead)continue;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<bd){bd=d;best=e}}if(best)P.face=Math.atan2(best.y-P.y,best.x-P.x)}}catch(_){}}
function start(n,mode,t){const A={n,mode,f:fOf(),T0:t,hit:0,buf:false,id:(S3._id=(S3._id||0)+1)};S3.A=A;S3.stats.clicks[n]++;facePress();try{G.basicT=t;P.lastAtk=t}catch(_){}return A}
function press(){const t=time;
  if(!ready())return false;
  const A=S3.A;
  if(!A){const n=(t-S3.lastEnd<=S3.cfg.RESET&&S3.lastN>0&&S3.lastN<3)?S3.lastN+1:1;start(n,'solo',t);return true}
  if(A.n<3&&!A.buf){A.buf=true;if(A.mode==='solo'&&A.n<3&&elapsed(A,t)<chainDur(A)){A.mode='chain';A.chained=true}}
  return true}
/* ---------------- damage ---------------- */
function hitFn(e,pct,tag){
  const hp0=e.hp,vx0=e.vx,vy0=e.vy;
  try{const A=C182.api,wd=(A.D().weapons.scythe||A.D().weapons.sword),basic=wd.actionCoef*wd.weights.reduce((a,b)=>a+b,0);
    let ea=1;try{const X=typeof mobInfo==='function'?mobInfo(e):{};if(X.race==='undead'||X.ele==='undead')ea=.25;else if(X.ele==='holy'||e.elem==='Light')ea=1.5}catch(_){}
    const id='scy3_'+tag,d={id,mode:'native',coefTotal:basic*pct/100*ea,flatTotal:0,weights:[1],schedule:[0],maxTargets:1,targeting:'around',element:'Neutral'};
    const c=A.ctxFor('skill',id,d,{dt:'phys',lvScale:1,m0:1,reach:9999,cdId:'scyX'});
    hitEnemy(e,1,{dt:'phys',ctx:c,pl:(typeof THEMES!=='undefined'&&THEMES.void)||undefined,scy3:1,kb:0,knk:1})}catch(er){ERR('hit',er)}
  /* no knockback: the engine's hit may add velocity to the body, put it back */
  try{if(vx0!=null&&(e.vx!==vx0||e.vy!==vy0)){S3.stats.kbUndone=(S3.stats.kbUndone||0)+1;e.vx=vx0;e.vy=vy0}}catch(_){}
  const d=Math.max(0,hp0-Math.max(0,e.hp));S3.stats.hits++;S3.stats.dmg+=d;return d}
try{const _a=applyDamage;applyDamage=function(e,d,crit,o){if(o&&o.scy3){S3.stats.dmgCalls=(S3.stats.dmgCalls||0)+1;if(o.kb){S3.stats.kbStripped=(S3.stats.kbStripped||0)+1;o.kb=0}if(d>S3.cfg.CAP)d=S3.cfg.CAP}return _a.call(this,e,d,crit,o)}}catch(e){ERR('hook damage',e)}
function areaTargets(type,fw){const R=(S3.cfg.R[type]||190)*S3.cfg.WORLD,out=[];
  for(const e of enemies){if(e.dead||!(e.hp>0))continue;const dx=e.x-P.x,dy=e.y-P.y,d=Math.hypot(dx,dy*S3.cfg.VW);if(d>R+(e.sz||0)*.5+((window.__EDGE&&__EDGE.on)?Math.max(0,(e.sz||16)-16)*S3.cfg.VW:0))continue;if(type==='none'&&dx*fw<-10)continue;out.push({e,d,front:dx*fw>0?0:1})}
  out.sort((a,b)=>a.front-b.front||a.d-b.d);return out.slice(0,type==='none'?1:S3.cfg.MAXT)}
function doHit(A,k){const d=def(A),h=d.hitF[k],fx=(d.fx[h]||['arc',0]),type=fx[0],fw=Math.cos(P.face)>=0?1:-1;
  const mult=S3.cfg.MULT[A.n][A.n===1?k:A.n===2?k:k];let pct=S3.bal?mult*100*S3.cfg.CAL:S3.cfg.PLACEHOLDER*100;
  const tg=areaTargets(type,fw);tg.forEach((o,i)=>{hitFn(o.e,pct*(i===0?1:S3.cfg.SPLASH),'c'+A.n+'h'+k)});
  A.hits=(A.hits||0)+1;S3.stats.hitLog=(S3.stats.hitLog||[]);if(S3.stats.hitLog.length<40)S3.stats.hitLog.push([A.n,k,type,tg.length,+pct.toFixed(1)]);try{sfx('swing','scythe')}catch(_){}}
/* ---------------- per-frame logic ---------------- */
function tick(dt){try{if(typeof P==='undefined'||!P)return;const A=S3.A;if(!A)return;
  if(P.dead||!held()){S3.A=null;return}
  const t=time,d=def(A),el=elapsed(A,t);
  for(let k=A.hit;k<d.hitF.length;k++){const ht=(d.hitF[k]-d.F0)*.03/A.f;if(el>=ht){doHit(A,k);A.hit=k+1}else break}
  if(t>=endT(A)){S3.lastN=A.n;S3.lastEnd=t;S3.A=null;if(A.n===3)S3.stats.chains++;
    if(A.buf&&A.n<3){const nx=start(A.n+1,A.n===1&&A.chained?'chain':'solo',t);nx.fromChain=true}
    else if(A.buf&&A.n===3){/* the buffered press after click 3 starts a fresh chain */start(1,'solo',t)}}}catch(e){ERR('tick',e)}}
try{const _u=update;update=function(dt){const r=_u.apply(this,arguments);tick(dt);return r}}catch(e){ERR('hook update',e)}
/* the basic attack */
try{const _b=basicAttack;basicAttack=function(){if(!S3.on||!held()||!ready())return _b.apply(this,arguments);
  if(P.dead||P.dash||G.edit||P.casting)return;try{if(typeof stunned==='function'&&stunned())return}catch(_){}try{if(window.SCY&&SCY.locked&&SCY.locked())return}catch(_){}
  press()}}catch(e){ERR('hook basic',e)}
/* ---------------- drawing ---------------- */
let inDraw=false,last=null;
function hookPuppet(){const U=PU();if(!U||U._scy3Hook)return !!(U&&U._scy3Hook);const _d=U.draw;if(typeof _d!=='function'||!ready())return false;U._scy3Hook=1;
  U.draw=function(c,x,y,sc,fac,pose){const A=S3.A;if(inDraw||!A||!S3.on||!held()||P.dead)return _d.apply(this,arguments);
    const t0=performance.now();inDraw=true;try{const t=time,p=poseOf(A,t),FX=window.SCYFX,face=fac>0?1:-1;window.SCYFX_CAP=S3.cap=capOn();const r=S3.r=FXSCALE?sc/DEMO_SC:1;
      try{c.save();c.scale(r,r);FX.draw(c,t,'back');c.restore()}catch(e){try{c.restore()}catch(_){}ERR('fx back',e)}
      const tp=window.drawCombo(c,x,y,sc,fac,p);
      /* blade sub-samples between the last frame and this one (smooth fast swings) */
      try{if(last&&last.id===A.id&&t>last.t&&t-last.t<.1){for(let s=1;s<6;s++){const ts=last.t+(t-last.t)*s/6,ps=poseOf(A,ts);if(ps.hit===p.hit){const bs=window.comboBlade(x,y,sc,fac,ps);FX.blade(ts,[bs.tip[0]/r,bs.tip[1]/r],[bs.heel[0]/r,bs.heel[1]/r],true)}}}FX.blade(t,[tp.tip[0]/r,tp.tip[1]/r],[tp.heel[0]/r,tp.heel[1]/r],!!p.hit)}catch(e){ERR('blade',e)}
      /* wave spawns for the hits crossed since the last frame */
      try{if(last&&last.id===A.id&&p.hit&&last.f!=null&&p.frame>=last.f){const d=window.comboDef(A.n,A.mode);d.hitF.forEach(h=>{if(h>last.f&&h<=p.frame+1e-6){const s=d.fx[h]||['arc',0];if(s[0]!=='none'){if(S3.cap&&FX._L){try{const live=FX._L.filter(o=>(t-o.t0)<=o.life+.4).sort((a,b)=>a.t0-b.t0);while(live.length>=S3.cfg.MAXW){const old=live.shift(),age=t-old.t0;old.life=Math.min(old.life,age+.15);S3.stats.capped=(S3.stats.capped||0)+1}}catch(_){}}FX.spawn(s[0],t,{x:tp.tip[0]/r,y:tp.tip[1]/r,X:tp.X/r,gy:y/r,fw:face,spin:face,a0:face>0?-.5:Math.PI+.5,tilt:s[1]||0,seed:h+A.id*7});S3.stats.fxSpawn++}}})}}catch(e){ERR('spawn',e)}
      last={id:A.id,t:t,f:p.frame};S3.last={x,y,sc,fac,tp};
      return tp}finally{inDraw=false;const ms=performance.now()-t0;S3.stats.drawMs+=ms;S3.stats.draws++;if(ms>S3.stats.maxMs)S3.stats.maxMs=ms}};
  return true}
setInterval(()=>{try{hookPuppet()}catch(e){ERR('hookPuppet',e)}},300);
/* front waves after the entities; reset the effects when the click chain is idle */
try{const _t=drawTexts;drawTexts=function(){const r=_t.apply(this,arguments);try{if(window.SCYFX&&ready()){const FX=window.SCYFX;if(S3.A||S3.fxLive){{const r=S3.r||1;ctx.save();ctx.scale(r,r);FX.draw(ctx,time,'front');ctx.restore()}S3.fxLive=true;if(!S3.A&&time-S3.lastEnd>1.5){FX.clear();S3.fxLive=false}}}}catch(e){ERR('fx front',e)}return r}}catch(e){ERR('hook texts',e)}
/* views for the spins: load the Art parts, set the outfit tag */
function initViews(){try{if(window.SPINVIEW&&!SPINVIEW._loading){SPINVIEW._loading=1;SPINVIEW.load()}
  const U=PU();let o='default';try{const L=U.getLook&&U.getLook();if(L&&L.outfit)o=L.outfit}catch(_){}window.CUR_OUTFIT=o}catch(e){ERR('views',e)}}
setTimeout(initViews,1500);
console.info('[SCY3] ready');
})();
