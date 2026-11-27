
/* ---- sw3-r1 (TEST allin_r36, 12 Nov 2026): one-hand SWORD BASIC ATTACK = Motion's 3-click combo + the demo fire waves (DeaRz passed 16:09 "Okตามนั้นได้เลย") ----
   Files (sword_combo_r11): sword_combo.js (PUPPET.WEAPON_KF sword_c1..3, SWC, swPose, swEndLunge), fx_sword_r11_demo.js wrapped in an IIFE as SW3FX (its globals COL, SWW*, FLYD, SCL ... stay private), the scythe's drawCombo reused (drawc.js is the same wrapper).
   * input (same as scythe / bow / dagger): a basic-attack press with no click running starts click 1; a press while a click runs is buffered and starts the next click when it ends; the chain resets to click 1 after 0.5 s idle; clicks 1-2 take 1/ASPD s, click 3 uses click 1's factor; one press = one combo click;
   * hits (placeholder, Balance sets the real ones): click 1 slash, click 2 slash, click 3 stab (260 ms) + smash (720 ms, heavy); area in front rel > -15 && rel < reach (world px: slash 196, stab 223, smash 209 = demo x 0.91), |dy| < 45, first target 100 %, others 50 %, max 4; the waves FLY a little forward, so every target is hit when its wave arrives (arrive(): the demo's own flight curve); numbers capped at 99,999, no knockback;
   * damage placeholders in units of the sword basic hit: slash 1.0, slash 1.0, stab 1.0, smash 3.0 (6.0 per chain) x CAL (one calibration: the chain on a single dummy = the old sword basic DPS at ASPD about 2.5/s); ?sw3bal=off = flat 1 per hit, smash 3;
   * FX run in demo units (hero scale 0.1485) under scale(+-r, r), r = game hero scale / 0.1485, mirrored for facing left; the blade points follow the TEST long sword (LONGSWORD.extra);
   * the same cost cap as the dagger in low graphics or with ?sw3fxcap=on (max 4 live waves); extra layers: window.SW3.layers (ctx, t, side).
   ?sword3=off = the old sword basic attack. Debug: window.SW3 ---- */
(function(){'use strict';
const Q=String(location.search),OFF=/[?&]sword3=off\b/.test(Q),BALOFF=/[?&]sw3bal=off\b/.test(Q);
const S=window.SW3={ver:'sw3-r1',on:!OFF,err:null,A:null,lastN:0,lastEnd:-99,root:0,TL:{hits:[],imp:[],clicks:[]},pend:[],layers:[],
  stats:{clicks:[0,0,0,0],hits:0,dmg:0,drawMs:0,draws:0,maxMs:0,fxMs:0,fxN:0,by:{}},
  cfg:{CAL:0.215,MULT:{1:[1],2:[1],3:[1,3]},PLACEHOLDER:{slash:1,stab:1,smash:3},RESET:.5,DY:45,REACH:(/[?&]swsize=off\b/.test(Q)?{slash:196,stab:223,smash:209}:{slash:142,stab:170.5,smash:105}),SPLASH:.5,MAXT:4,MAXW:4,CAP:99999,DEMO_SC:.1485,WINDOW:-15},bal:!BALOFF};
if(OFF)return;
const ERR=(w,e)=>{S.err=w+': '+((e&&e.message)||e);try{console.error('[SW3]',w,e)}catch(_){}};
const PU=()=>window.PUPPET,held=()=>!!(typeof P!=='undefined'&&P&&P.weapon&&P.weapon.t==='sword');
const rate=()=>{try{return Math.max(.4,Math.min(8,aspdHits()))}catch(_){return 2}};
function ready(){return !!(window.SWC&&window.swPose&&window.drawCombo&&window.SW3FX&&PU()&&PU().WEAPON_KF&&PU().WEAPON_KF.sword_c1&&PU().solve&&PU().footY)}
const fOf=n=>{const R=rate();return n===2?SWC[2].dur*R:SWC[1].dur*R};
const durOf=A=>SWC[A.n].dur/A.f,endT=A=>A.T0+durOf(A),qOf=(A,t)=>Math.max(0,Math.min(1,(t-A.T0)/durOf(A)));
function facePress(){try{const tg=typeof aimPoint==='function'?aimPoint():null;if(tg)P.face=Math.atan2(tg.y-P.y,tg.x-P.x);else{let best=null,bd=420;for(const e of enemies){if(e.dead)continue;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<bd){bd=d;best=e}}if(best)P.face=Math.atan2(best.y-P.y,best.x-P.x)}}catch(_){}}
function start(n,t){const A={n,f:fOf(n),T0:t,hit:0,buf:false,root:S.root,id:(S._id=(S._id||0)+1)};if(n===1){S.root=0;A.root=0}S.A=A;S.stats.clicks[n]++;facePress();try{G.basicT=t;P.lastAtk=t}catch(_){}return A}
function press(){const t=time;if(!ready())return false;const A=S.A;
  if(!A){const n=(t-S.lastEnd<=S.cfg.RESET&&S.lastN>0&&S.lastN<3)?S.lastN+1:1;start(n,t);return true}
  A.buf=true;return true}
/* ---------------- damage ---------------- */
function hitFn(e,pct,tag){
  const hp0=e.hp,vx0=e.vx,vy0=e.vy;
  try{const A=C182.api,wd=A.D().weapons.sword,basic=wd.actionCoef*wd.weights.reduce((a,b)=>a+b,0);
    const id='sw3_'+tag,d={id,mode:'native',coefTotal:basic*pct/100,flatTotal:0,weights:[1],schedule:[0],maxTargets:1,targeting:'around',element:'Neutral'};
    const c=A.ctxFor('skill',id,d,{dt:'phys',lvScale:1,m0:1,reach:9999,cdId:'swX'});
    hitEnemy(e,1,{dt:'phys',ctx:c,sw3:1,kb:0,knk:1})}catch(er){ERR('hit',er)}
  try{if(vx0!=null&&(e.vx!==vx0||e.vy!==vy0)){e.vx=vx0;e.vy=vy0}}catch(_){}
  const d=Math.max(0,hp0-Math.max(0,e.hp));S.stats.hits++;S.stats.dmg+=d;try{const o=(S.stats.by[tag]=S.stats.by[tag]||{n:0,d:0});o.n++;o.d+=d}catch(_){}return d}
try{const _a=applyDamage;applyDamage=function(e,d,crit,o){if(o&&o.sw3){if(o.kb)o.kb=0;if(d>S.cfg.CAP)d=S.cfg.CAP}return _a.call(this,e,d,crit,o)}}catch(e){ERR('hook damage',e)}
/* ---------------- hits ---------------- */
const rOf=sc=>sc/S.cfg.DEMO_SC;S.ksz=/[?&]swsize=off\b/.test(Q)?null:{slash:142/196,stab:170.5/223,smash:105/209};function swHits(c,TLs,L,side,r,t){if(!S.ksz){SW3FX.drawHits(t);return}const hx=side*L.x/r,hy=L.y/r;for(const ty of ['slash','stab','smash']){const hs=TLs.hits.filter(h=>h.type===ty);if(!hs.length)continue;c.save();c.translate(hx,hy);c.scale(S.ksz[ty],S.ksz[ty]);c.translate(-hx,-hy);SW3FX.set({cx:c,TL:{hits:hs,imp:[],clicks:TLs.clicks},HX:hx,HY:hy,SC:L.sc/r,ASPD:rate(),HEEL:heelY()});SW3FX.drawHits(t);c.restore()}SW3FX.set({cx:c,TL:TLs,HX:hx,HY:hy,SC:L.sc/r,ASPD:rate(),HEEL:heelY()})}
const capOn=()=>/[?&]sw3fxcap=off\b/.test(Q)?false:/[?&]sw3fxcap=on\b/.test(Q)||(()=>{try{return G.gfx==='low'}catch(_){return false}})();
const heelY=()=>250+((window.LONGSWORD&&LONGSWORD.done&&LONGSWORD.extra)||0);
function bptsAt(p,x,y,sc){const U=PU(),W=U.solve(p),M=W.sword,gy=U.footY(W),X=x-(p.lunge||0)*sc,Y=y-(p.air||0)*sc;
  const f=pt=>{const ax=M[0]*pt[0]+M[2]*pt[1]+M[4],ay=M[1]*pt[0]+M[3]*pt[1]+M[5];return[X-ax*sc,Y+(ay-gy)*sc]};return{tip:f([69,6]),heel:f([72,heelY()])}}
function doHit(A,j){const c=SWC[A.n],L=S.last;if(!L)return;const h=c.hitT[j],type=c.fx[h]||'slash',side=L.fac>0?1:-1,r=rOf(L.sc),big=type==='smash';
  const p=window.swPose(A.n,h/c.dur);p.lunge+=A.root;const hxF=side*L.x/r,hyF=L.y/r,scF=L.sc/r,bp=bptsAt(p,hxF,hyF,scF);
  const t=time;S.TL.hits.push({t,type,x:bp.tip[0],y:bp.tip[1],hx:hxF-(p.lunge||0)*scF,seed:(S._k=(S._k||0)+1),big,side});
  const reach=S.cfg.REACH[type],fw=side,out=[];
  for(const e of enemies){if(e.dead||!(e.hp>0))continue;const rel=(e.x-P.x)*fw,eg=(window.__EDGE&&__EDGE.on)?Math.max(0,(e.sz||16)-16):0;if(!(rel>S.cfg.WINDOW-eg&&rel<reach+eg))continue;if(Math.abs(e.y-P.y)>=S.cfg.DY+eg)continue;out.push({e,rel})}
  out.sort((a,b)=>a.rel-b.rel);const tg=out.slice(0,S.cfg.MAXT);
  const mult=S.bal?S.cfg.MULT[A.n][j]*S.cfg.CAL:S.cfg.PLACEHOLDER[type];
  tg.forEach((o,i)=>{const ta=t+.02+SW3FX.arrive(type,o.rel/r);   /* the wave flies: the hit lands when it arrives */
    S.pend.push({t:ta,e:o.e,pct:mult*100*(i===0?1:S.cfg.SPLASH),tag:'c'+A.n+'h'+j});
    S.TL.imp.push({m:{dx:0,dy:(o.e.y-P.y)/r},t:ta,x:side*o.e.x/r-10,y:o.e.y/r-30,heavy:big,side})});
  try{sfx('swing','sword')}catch(_){}}
function applyPend(t){const L=S.pend;if(!L.length)return;for(let i=L.length-1;i>=0;i--){const o=L[i];if(t>=o.t){L.splice(i,1);if(o.e&&!o.e.dead&&o.e.hp>0)hitFn(o.e,o.pct,o.tag)}}}
function prune(t){const T=S.TL;T.hits=T.hits.filter(h=>t<h.t+1.1);T.imp=T.imp.filter(o=>t<o.t+.7);T.clicks=T.clicks.filter(c=>t<c.t1+1.2)}
function tick(dt){try{if(typeof P==='undefined'||!P)return;const t=time;applyPend(t);
  const A=S.A;if(!A){if(S.TL.hits.length||S.TL.imp.length||S.TL.clicks.length)prune(t);return}
  if(P.dead||!held()){S.A=null;return}
  const c=SWC[A.n],el=t-A.T0;
  for(let j=A.hit;j<c.hitT.length;j++){if(el>=c.hitT[j]/A.f){doHit(A,j);A.hit=j+1}else break}
  if(t>=endT(A)){S.lastN=A.n;S.lastEnd=t;S.root+=window.swEndLunge(A.n);S.A=null;
    if(A.buf){const nx=A.n<3?A.n+1:1;if(nx===1)S.root=0;start(nx,t)}}
  prune(t)}catch(e){ERR('tick',e)}}
try{const _u=update;update=function(dt){const r=_u.apply(this,arguments);tick(dt);return r}}catch(e){ERR('hook update',e)}
try{const _b=basicAttack;basicAttack=function(){if(!S.on||!held()||!ready())return _b.apply(this,arguments);
  if(P.dead||P.dash||G.edit||P.casting)return;try{if(typeof stunned==='function'&&stunned())return}catch(_){}
  press()}}catch(e){ERR('hook basic',e)}
/* ---------------- drawing ---------------- */
function fxBegin(c,side,r,x,y,sc,p,TLs){c.save();c.scale(side*r,r);window.__SW3POSE=p;window.SW3CAP=S.cap=capOn();SW3FX.set({cx:c,TL:TLs,HX:side*x/r,HY:y/r,SC:sc/r,ASPD:rate(),HEEL:heelY()})}
function sideTL(side){const T=S.TL;let hs=T.hits.filter(s=>s.side===side);if(S.cap||capOn()){const t=time;hs=hs.filter(h=>t-h.t<1.0).slice(-S.cfg.MAXW)}return{hits:hs,imp:T.imp.filter(o=>o.side===side),clicks:T.clicks.filter(k=>k.side===side)}}
let inDraw=false;
function hookPuppet(){const U=PU();if(!U||U._sw3Hook)return !!(U&&U._sw3Hook);const _d=U.draw;if(typeof _d!=='function'||!ready())return false;U._sw3Hook=1;
  U.draw=function(c,x,y,sc,fac,pose){const A=S.A;if(inDraw||!A||!S.on||!held()||P.dead)return _d.apply(this,arguments);
    const t0=performance.now();inDraw=true;
    try{const t=time,face=fac>0?1:-1,p=window.swPose(A.n,qOf(A,t));p.lunge+=A.root;
      S.last={x,y,sc,fac:face,p,t};
      if(!S.TL.clicks.some(k=>k.id===A.id))S.TL.clicks.push({n:A.n,t0:A.T0,t1:A.T0+durOf(A),root:A.root,f:A.f,side:face,id:A.id});
      window.drawCombo(c,x,y,sc,fac,p);
      return null}
    finally{inDraw=false;const ms=performance.now()-t0;S.stats.drawMs+=ms;S.stats.draws++;if(ms>S.stats.maxMs)S.stats.maxMs=ms}};
  return true}
setInterval(()=>{try{hookPuppet()}catch(e){ERR('hookPuppet',e)}},300);
/* front effects (blade ribbons, waves, impacts) after the entities, same world space */
try{const _t=drawTexts;drawTexts=function(){const r0=_t.apply(this,arguments);try{if(window.SW3FX&&ready()){const L=S.last,T=S.TL;
  if(L&&(T.hits.length||T.imp.length||S.A)){const t=time,tf=performance.now(),r=rOf(L.sc);
    for(const side of [1,-1]){const TLs=sideTL(side);if(!TLs.hits.length&&!TLs.imp.length&&!(S.A&&L.fac===side))continue;
      fxBegin(ctx,side,r,L.x,L.y,L.sc,L.p,TLs);
      try{SW3FX.drawTrails(t);swHits(ctx,TLs,L,side,r,t);SW3FX.drawImpacts(t);for(const fn of S.layers){try{fn(ctx,t,side)}catch(_){}}}catch(e){ERR('fx front',e)}
      ctx.restore()}
    S.stats.fxMs+=performance.now()-tf;S.stats.fxN++}}}catch(e){ERR('hook texts',e)}return r0}}catch(e){ERR('hook texts',e)}
console.info('[SW3] ready');
})();
