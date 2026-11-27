
/* ---- candidate_sword_atk5_r18: p239 r6 Sword passives 1-5 (TEST only) ---- */
/* p239 r6 — sword HUD moved into the top unit frame: dark box right of the name plate (r5 = shadow 400% + darker body). Before: p239 r5 — shadow total damage 400% (chain.hitMul .40 -> .80, 5 hits), shadow body darker (black-violet, vivid violet only on rim / trail / slash). Rest = r4.
   p239 r4 — r3 minus the thin highlight line along the runner's trail (ribbon centre stroke removed). Nothing else changed.
   p239 r3 — shadow art only: r1 multi-side rush pattern restored (in -> slash through the target -> dissolve), purple shadow palette, tapered curved trails, front/back layering. Systems identical to r2.
   p239 r2 — Sword class passives 1-5 (candidate_sword_passive_r2, TEST only; built on candidate_sword_prov_r1). r2: real icons, 5 power-swords HUD (replaces fire-orbs), one-runner shadow art. Values unchanged from r1. Not merged, not published.
   Every passive works only while a SWORD is held. Toggle each one from the TEST panel (no learn-skill / slots / save yet). All numbers live in __PASS.cfg.
   1 ชำนาญดาบ   +8 % weapon damage, ONE term in the bonus step of the game's own resolveHit (core() -> bonuses[]); applies to cast contexts only (basic swing / skills / shadow), never to ctx-less legacy hits.
   2 คมต่อเนื่อง 5 grey-black power-swords above the HP orb (ดาบสะสมพลัง); one 20 % roll per landed basic sword swing (cast ctx seq) fills one red sword; skills / shadow never fill. 5 = glowing "ready"; the next landed basic swing
                 spends all 5 and summons the sword shadow (5 hits around the target it was hitting, 40 % of the basic action each = 200 %). That swing does not roll. Shadow = ONE cast ctx (ctxFor), native mode,
                 each monster at most once per hit, wall-blocked (LOS from the strike point), no MP, no button. The shadow never charges orbs and never uses Sword Skill 3's guaranteed crits (normal crit roll).
   3 คมสังหาร   crit damage +0.20 (x1.50 -> x1.70) through the game's own B('critDmg') term (no crit-chance change; basic / Sword Skill 3 guaranteed / shadow all pass through the same core()).
   4 ยืนหยัดกลางศึก >= 3 live enemies within 150 px with a clear line -> incoming damage -10 %, added to the game's own `reductions` list of the hurtPlayer resolveHit (no standing DEF buff).
   5 ลมหายใจนักรบ  kill with sword-weapon damage (basic / skill / shadow) heals 2 % MaxHP through healP; shared 2 s internal cooldown across all sources; no heal when dead.
   Weapon change / death / switch-off clears the swords and cancels the shadows; leaving the map cancels the shadows (swords stay). */
(function(){
'use strict';
const L=window.__PASS={ver:'p239-r6',err:null,test:false,on:{mastery:false,chain:false,sharp:false,stand:false,breath:false},stats:{dmgBonus:0,hurtReduced:0,heals:0,healBlocked:0,rolls:0,fills:0,summons:0,shadowHits:0},
  log:[],rolls:[],shadows:[],heals:[],standLog:[],lastCore:null};
try{
const D=window.__SK2D,HD=window.__HERO3D,H=window.HERO3D;
if(!D||!HD||!H||!window.C182||!C182.api||typeof hitEnemy!=='function'||typeof killEnemy!=='function'||typeof hurtPlayer!=='function'||typeof update!=='function'||typeof drawParts!=='function'||typeof drawPlayerSprite!=='function'||typeof blocked!=='function'){L.err='hooks missing';return;}
/* ---------------- config (single place) ---------------- */
const CFG=L.cfg={
  weapon:'sword',
  ids:{mastery:'wsPassMastery',chain:'wsPassChain',sharp:'wsPassSharp',stand:'wsPassStand',breath:'wsPassBreath'},
  names:{mastery:'1 ชำนาญดาบ',chain:'2 คมต่อเนื่อง',sharp:'3 คมสังหาร',stand:'4 ยืนหยัดกลางศึก',breath:'5 ลมหายใจนักรบ'},
  icons:{"mastery": "assets/95f0d67c471478c3.png", "chain": "assets/352b4ce6019b24ef.png", "sharp": "assets/e93212c1929de7ec.png", "stand": "assets/c0bb34c61b02d8df.png", "breath": "assets/e6b4393ce9ba4629.png"},          // the five designed icons (Five chibi sword skill icons.png, cut per frame, uniform 192 px)
  mastery:{dmg:.08},
  chain:{slots:5,chance:.20,hits:5,hitMul:.80,gap:.11,dash:.12,life:.34,area:56,strikeR:34,fromR:96,id:'wsPassShadow',f0:26,n:12,warm:150},
  sharp:{critDmg:.20},
  stand:{radius:150,count:3,reduce:.10},
  breath:{heal:.02,icd:2.0}};
const clk=()=>typeof time==='number'?time:performance.now()/1000;
const ss=u=>u<=0?0:u>=1?1:u*u*(3-2*u),clamp01=u=>u<0?0:u>1?1:u;
const swordNow=()=>!!(P&&!P.dead&&P.weapon&&P.weapon.t===CFG.weapon);
const A=C182.api,K=A.K;
const F=HD.frame,KS=HD.drawScale,F0=D.f0;
const DN=['E','SE','S','SW','W','NW','N','NE'];
const dirIdx=g=>{const a=Math.atan2(Math.sin(g),Math.cos(g));return ((Math.round(a/(Math.PI/4))%8)+8)%8;};
const camYaw=()=>{try{return typeof camY==='function'?camY():0;}catch(e){return 0;}};
const okI=im=>im&&im.complete&&im.naturalWidth;
const IMG={};for(const n of DN){const im=new Image();im.src=D.dirs[n].hero.src;IMG[n]=im;}
const isSwordCtx=ctx=>!!ctx&&(ctx.kind==='basic'||ctx.kind==='skill')&&swordNow();
function losClear(x0,y0,e,short){const dx=e.x-x0,dy=e.y-y0,d=Math.hypot(dx,dy);if(d<1)return true;const stop=Math.max(0,d-(short==null?Math.min(14,(e.sz||12)*.6):short));
  for(let s=10;s<stop;s+=10){if(blocked(x0+dx/d*s,y0+dy/d*s,3))return false;}return true;}
const liveE=e=>!!(e&&!e.dead&&e.hp>0&&!e.dev&&!e.sprGhost&&!e.rush&&!e.removed);
/* ---------------- 1 + core hook: one bonus term inside core() ---------------- */
L.dmgBonus=function(e,o,ctx,sub){
  try{
    if(L.on.breath||L.on.chain||L.on.mastery)L.lastCore={e,ctx,t:clk()};
    if(L.on.mastery&&isSwordCtx(ctx)&&!(o&&o.dot)){L.stats.dmgBonus++;return [CFG.mastery.dmg];}
  }catch(er){L.err='bonus '+er.message;}
  return [];};
/* ---------------- 3 crit damage via the game's B() term; 4 incoming-damage step ---------------- */
const _B=B;
B=function(k){const v=_B.apply(this,arguments);
  if(k==='critDmg'&&L.on.sharp&&swordNow())return v+CFG.sharp.critDmg;
  return v;};
const HURT={on:false,cond:false,n:0};
const _rh=K.resolveHit;
K.resolveHit=function(i){
  if(HURT.on&&HURT.cond&&i&&i.reductions&&i.bonuses&&i.bonuses.length===1&&i.tgtLvl!=null){
    L.stats.hurtReduced++;i=Object.assign({},i,{reductions:i.reductions.concat([CFG.stand.reduce])});}
  return _rh.call(this,i);};
function standCount(){let n=0;if(!P||P.dead)return 0;const R=CFG.stand.radius;
  for(const e of enemies){if(!liveE(e))continue;if(Math.hypot(e.x-P.x,e.y-P.y)>R)continue;if(!losClear(P.x,P.y,e))continue;n++;}return n;}
{const o=hurtPlayer;hurtPlayer=function(raw,src){
  let own=false;
  try{if(L.on.stand&&swordNow()&&!HURT.on){HURT.n=standCount();HURT.cond=HURT.n>=CFG.stand.count;HURT.on=true;own=true;}}catch(er){L.err='stand '+er.message;}
  try{return o.apply(this,arguments);}finally{if(own){HURT.on=false;HURT.cond=false;}}};}
/* ---------------- 5 heal on sword kill ---------------- */
let lastHeal=-99;const HEALFX=[];
function onKill(e){
  if(!L.on.breath||!swordNow())return;
  const lc=L.lastCore,S=A.S,ev=S&&S.dmgEvt;
  if(!lc||lc.e!==e||!ev||ev.e!==e||!isSwordCtx(lc.ctx))return;                     // only the killing blow from sword cast-context damage (basic / skill / shadow)
  const t=clk();if(t-lastHeal<CFG.breath.icd){L.stats.healBlocked++;return;}
  if(!P||P.dead)return;
  lastHeal=t;const hp0=P.hp;C182.hsrc='warriorBreath';try{healP(P.maxHp*CFG.breath.heal);}finally{C182.hsrc=null;}
  L.stats.heals++;L.heals.push({t:+t.toFixed(2),gain:Math.round(P.hp-hp0),hp0:Math.round(hp0),max:Math.round(P.maxHp),ctx:lc.ctx.id});if(L.heals.length>60)L.heals.shift();
  HEALFX.push({t0:t,seed:Math.random()*100});}
{const o=killEnemy;killEnemy=function(e){const was=!!(e&&e.dead);const r=o.apply(this,arguments);try{if(!was&&e&&e.dead)onKill(e);}catch(er){L.err='kill '+er.message;}return r;};}
/* ---------------- 2 chain: orbs, roll, shadow ---------------- */
const CH=L.chain={n:0,ready:false,rolled:new Set(),shadows:[],popT:-9,wasReady:false};
let castN=0;
function shadowCtx(base){
  const wt=P.weapon&&P.weapon.t,wd=A.D().weapons&&A.D().weapons[wt];
  const basic=base!=null?base:(wd?wd.actionCoef*wd.weights.reduce((a,b)=>a+b,0):0);
  const C=CFG.chain,w=[];for(let i=0;i<C.hits;i++)w.push(1/C.hits);
  const def={id:C.id,mode:'native',coefTotal:basic*C.hitMul*C.hits,flatTotal:0,weights:w,maxTargets:99,targeting:'around',element:'Neutral',range:C.area+80};
  const c=A.ctxFor('skill',C.id,def,{dt:'phys',lvScale:1,m0:1,reach:C.area+260,cdId:C.id});c.pass={basic};return c;}
function summon(e,baseCtx){
  const C=CFG.chain,bd=baseCtx&&baseCtx.def,bc=bd?bd.coefTotal*(bd.weights||[1]).reduce((x,y)=>x+y,0):null,ctx=shadowCtx(bc);   // base = the real total of one basic swing (actionCoef x sum of weights), same rule as Sword Skill 1/2
  const sh={id:++castN,t0:clk(),t:0,e,eid:e.id!=null?e.id:(e.__tid!=null?e.__tid:null),tx:e.x,ty:e.y,px:P.x,py:P.y,zone:G.zone,ctx,base:ctx.pass.basic,hit:new Array(C.hits).fill(false),th0:Math.random()*6.283,done:false,
    perHit:[],dead:false};
  CH.shadows.push(sh);L.stats.summons++;
  L.log.push({ev:'summon',cast:sh.id,t:+sh.t0.toFixed(2),target:sh.eid,coef:+ctx.def.coefTotal.toFixed(3),ctxSeq:ctx.seq});
  L.shadows.push({cast:sh.id,ctxSeq:ctx.seq,target:sh.eid,hits:sh.perHit,t0:+sh.t0.toFixed(2)});if(L.shadows.length>20)L.shadows.shift();
  return sh;}
function onBasicLand(ctx,e){
  if(CH.rolled.has(ctx.seq))return;CH.rolled.add(ctx.seq);if(CH.rolled.size>40)CH.rolled.delete(CH.rolled.values().next().value);
  if(CH.n>=CFG.chain.slots){
    CH.n=0;CH.ready=false;L.rolls.push({seq:ctx.seq,action:'summon',t:+clk().toFixed(2)});summon(e,ctx);return;}
  const roll=L.forceRoll!=null?L.forceRoll:rng();const ok=roll<CFG.chain.chance;L.stats.rolls++;   // forceRoll = TEST switch (null in normal use)
  L.rolls.push({seq:ctx.seq,action:ok?'fill':'miss',roll:+roll.toFixed(3),t:+clk().toFixed(2),n:CH.n+(ok?1:0)});if(L.rolls.length>300)L.rolls.shift();
  if(ok){CH.n++;L.stats.fills++;CH.popT=clk();if(CH.n>=CFG.chain.slots)CH.ready=true;}}
{const _h=hitEnemy;hitEnemy=function(e,m,o){
  o=o||{};
  if(L.on.chain&&e&&!e.dead&&!(o.dot||o.echo||o.thorn||o.reflected)){
    const ctx=o.ctx||window.C182.cur;
    if(ctx&&ctx.kind==='basic'&&ctx.id==='basic:sword'&&swordNow()){
      const r=_h.apply(this,arguments);
      try{if(r>0)onBasicLand(ctx,e);}catch(er){L.err='chain '+er.message;}
      return r;}}
  return _h.apply(this,arguments);};}
function strikePos(sh,k){
  const C=CFG.chain,a=sh.th0+k*(Math.PI*2*2/C.hits);   // 144 deg between neighbouring strikes: five different sides
  for(const R of [C.strikeR,C.strikeR*.6,0]){const x=sh.tx+Math.cos(a)*R,y=sh.ty+Math.sin(a)*R;if(R===0||!blocked(x,y,3))return {x,y,a,R};}
  return {x:sh.tx,y:sh.ty,a,R:0};}
function impact(sh,k){
  const C=CFG.chain,sp=strikePos(sh,k),ctx=sh.ctx,seen=new Set(),rec={k:k+1,t:+(clk()-sh.t0).toFixed(3),pos:[Math.round(sp.x),Math.round(sp.y)],targets:[]};
  sh.hit[k]=true;sh.fx=sh.fx||[];sh.fx.push({k,x:sp.x,y:sp.y,a:sp.a,t0:clk()});
  const prev=C182.cur;C182.cur=ctx;let pl;try{pl=wpal();}catch(_){}
  try{
    for(const e of enemies.slice()){
      if(!liveE(e)||seen.has(e))continue;
      if(Math.hypot(e.x-sh.tx,e.y-sh.ty)>C.area+(e.sz||0)*.35)continue;
      if(!losClear(sp.x,sp.y,e)){rec.targets.push({id:e.id!=null?e.id:e.__tid,type:e.type,blocked:true});continue;}
      seen.add(e);const hp0=e.hp;
      try{hitEnemy(e,1,{dt:'phys',pl,ctx,pass:1,b3:k});}catch(er){L.err='shadow dmg '+er.message;}
      rec.targets.push({id:e.id!=null?e.id:e.__tid,type:e.type,loss:Math.round(hp0-e.hp)});L.stats.shadowHits++;}
  }finally{C182.cur=prev;}
  sh.perHit.push(rec);}
function stepShadows(dt){
  const C=CFG.chain;
  for(const sh of CH.shadows){
    if(sh.done)continue;
    if(G.zone!==sh.zone||G.state!=='play'||!P||P.dead||!swordNow()||!L.on.chain){sh.done=true;sh.cancel=true;L.log.push({ev:'cancel',cast:sh.id,hits:sh.hit.filter(Boolean).length});continue;}
    sh.t+=dt;
    if(!sh.dead){if(liveE(sh.e)&&enemies.includes(sh.e)){sh.tx=sh.e.x;sh.ty=sh.e.y;}else{sh.dead=true;sh.deadAt=sh.t;}}   // the target is locked at the trigger; if it dies the rest lands at its last position
    for(let k=0;k<C.hits;k++){if(!sh.hit[k]&&sh.t>=k*C.gap+C.dash)impact(sh,k);}
    if(sh.t>=(C.hits-1)*C.gap+C.life){sh.done=true;L.log.push({ev:'end',cast:sh.id,hits:sh.hit.filter(Boolean).length});}}
  if(CH.shadows.length&&CH.shadows.every(s=>s.done))CH.shadows.length=0;}
function clearChain(why){
  if(CH.n||CH.shadows.length)L.log.push({ev:'clear',why,n:CH.n,shadows:CH.shadows.length});
  CH.n=0;CH.ready=false;for(const s of CH.shadows){s.done=true;s.cancel=true;}CH.shadows.length=0;}
/* ---------------- per-frame ---------------- */
let wasSword=true,zone0=null,standT=0,standOn=false,standN=0;
function step(dt){
  const sw=swordNow();
  if(!sw&&wasSword&&(CH.n||CH.shadows.length))clearChain(P&&P.dead?'death':'weapon changed');
  wasSword=sw;
  if(zone0!==G.zone){if(zone0!==null&&CH.shadows.length){for(const s of CH.shadows){s.done=true;s.cancel=true;}CH.shadows.length=0;L.log.push({ev:'clear',why:'left the map'});}zone0=G.zone;}
  if(L.on.chain&&sw&&G.state==='play')stepShadows(dt);
  standT-=dt;if(standT<=0){standT=.1;if(L.on.stand&&sw&&G.state==='play'){standN=standCount();standOn=standN>=CFG.stand.count;}else{standN=0;standOn=false;}}
  for(let i=HEALFX.length-1;i>=0;i--)if(clk()-HEALFX[i].t0>.7)HEALFX.splice(i,1);}
{const o=update;update=function(dt){try{step(dt);}catch(e){L.err='step '+e.message;}return o.apply(this,arguments);};}
{const o=playerDeath;playerDeath=function(){try{clearChain('death');}catch(e){}return o.apply(this,arguments);};}
{const o=loadZone;loadZone=function(){try{if(CH.shadows.length){for(const s of CH.shadows){s.done=true;s.cancel=true;}CH.shadows.length=0;L.log.push({ev:'clear',why:'left the map'});}}catch(e){}return o.apply(this,arguments);};}
/* ---------------- toggles (idempotent: wrappers above are installed once) ---------------- */
function set(id,on){
  if(!(id in L.on))return false;on=!!on;if(L.on[id]===on)return true;L.on[id]=on;
  L.log.push({ev:on?'on':'off',id,t:+clk().toFixed(2)});
  if(id==='chain'){if(!on)clearChain('switched off');else warm();}
  if(id==='breath'&&!on){HEALFX.length=0;}
  syncPanel();return true;}
L.set=set;L.hurt=HURT;L.forceRoll=null;
L.testReset=function(){lastHeal=-99;CH.rolled.clear();clearChain('test reset');HEALFX.length=0;L.forceRoll=null;for(const k in L.stats)L.stats[k]=0;L.rolls.length=0;L.heals.length=0;L.shadows.length=0;L.log.length=0;standN=0;standOn=false;};   // TEST helper
L.setTest=function(on){L.test=!!on;if(!on){for(const k in L.on)set(k,false);}syncPanel();};
/* ---------------- shadow art: existing hero frames (Skill 2 slash poses) drawn as a dark translucent silhouette with a red-orange rim ---------------- */
const SIL={};
function silFor(dn){
  if(SIL[dn])return SIL[dn];const im=IMG[dn];if(!okI(im))return null;
  const w=im.naturalWidth,h=im.naturalHeight,a=document.createElement('canvas'),r=document.createElement('canvas');a.width=r.width=w;a.height=r.height=h;
  const ga=a.getContext('2d'),gr=r.getContext('2d');ga.drawImage(im,0,0);
  try{const id=ga.getImageData(0,0,w,h),d=id.data;           // dark violet body; the original shading is kept as a violet lift so head / arms / sword stay readable
    for(let i=0;i<d.length;i+=4){if(!d[i+3])continue;const lum=(.3*d[i]+.59*d[i+1]+.11*d[i+2])/255,l2=Math.pow(lum,1.25);d[i]=4+l2*24;d[i+1]=1+l2*8;d[i+2]=9+l2*46;}
    ga.putImageData(id,0,0);}catch(e){ga.globalCompositeOperation='source-atop';ga.fillStyle='rgba(60,24,110,.85)';ga.fillRect(0,0,w,h);}
  gr.drawImage(im,0,0);gr.globalCompositeOperation='source-in';gr.fillStyle='#b266ff';gr.fillRect(0,0,w,h);
  return SIL[dn]={dark:a,rim:r};}
function warm(){let i=0;const go=()=>{if(!L.on.chain||i>=8)return;try{silFor(DN[i]);}catch(e){}i++;setTimeout(go,CFG.chain.warm);};go();}
function figure(x,y,dn,j,al,sc){
  const S_=silFor(dn);if(!S_||al<=.01)return;const rt=D.dirs[dn].hero.rects[CFG.chain.f0-F0+j];if(!rt)return;sc=sc||1;
  const k=KS*sc,dx=x+(rt[4]-F.ax)*k,dy=y+HD.footY+(rt[5]-F.ay)*k,w=rt[2]*k,h=rt[3]*k;
  bb(x,y,()=>{ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=al*al*.85;                  // thin violet rim UNDER the body: only the edge shows
    for(const o of [[-1.6,0],[1.6,0],[0,-1.6],[0,1.6],[-1.1,-1.1],[1.1,1.1],[-1.1,1.1],[1.1,-1.1]])ctx.drawImage(S_.rim,rt[0],rt[1],rt[2],rt[3],dx+o[0],dy+o[1],w,h);
    ctx.globalAlpha=al*.92;ctx.drawImage(S_.dark,rt[0],rt[1],rt[2],rt[3],dx,dy,w,h);
    ctx.restore();});}
/* tapered, curved energy trail behind the runner: dark violet -> bright violet -> transparent, fades fast */
function ribbon(x0,y0,x1,y1,al,bow,wd){
  if(al<=.01)return;const c=ctx,dx=x1-x0,dy=y1-y0,d=Math.hypot(dx,dy);if(d<3)return;const nx=-dy/d,ny=dx/d,N=9,up=[],dn=[];
  for(let i=0;i<=N;i++){const u=i/N,b=Math.sin(Math.PI*u)*bow,wv=wd*Math.pow(u,1.25),px=x0+dx*u+nx*b,py=y0+dy*u+ny*b-14;up.push([px+nx*wv,py+ny*wv]);dn.push([px-nx*wv,py-ny*wv]);}
  c.save();const g=c.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,'rgba(60,20,120,0)');g.addColorStop(.5,`rgba(120,50,220,${(.55*al).toFixed(3)})`);g.addColorStop(1,`rgba(205,150,255,${(.9*al).toFixed(3)})`);
  c.fillStyle=g;c.beginPath();c.moveTo(up[0][0],up[0][1]);for(const p of up)c.lineTo(p[0],p[1]);for(let i=dn.length-1;i>=0;i--)c.lineTo(dn[i][0],dn[i][1]);c.closePath();c.fill();
  c.restore();}
/* white-violet crescent: warm... no, violet: white-violet core, saturated violet edge, translucent violet body; hit 5 is bigger */
function slashArc(x,y,a,u,big,sgn){
  if(u<0||u>1)return;const g=big?1.38:1,al=(1-u)*(1-u),r=(26+u*16)*g,c=ctx,cy=y-16;c.save();
  const half=1.05*g,a0=a-half*sgn,a1=a+half*sgn,ccw=sgn<0;
  const crescent=(rr,off)=>{c.beginPath();c.arc(x,cy,rr,a0,a1,ccw);c.arc(x-Math.cos(a)*off,cy-Math.sin(a)*off,rr*.9,a1,a0,!ccw);c.closePath();};
  c.globalCompositeOperation='source-over';crescent(r,r*.30);c.fillStyle=`rgba(112,40,200,${(.42*al).toFixed(3)})`;c.fill();
  c.globalCompositeOperation='lighter';crescent(r,r*.30);c.lineWidth=2.4*g;c.strokeStyle=`rgba(170,80,255,${(.9*al).toFixed(3)})`;c.stroke();
  c.lineCap='round';c.strokeStyle=`rgba(244,232,255,${(.95*al).toFixed(3)})`;c.lineWidth=1.7*g;c.beginPath();c.arc(x,cy,r*.97,a0+.2*sgn,a1-.2*sgn,ccw);c.stroke();c.restore();}
/* impact: short white-violet flash + curved violet shards flying out */
function flash(x,y,u,big,a0){
  if(u<0||u>1)return;const g=big?1.55:1,al=1-u,r=(9+u*15)*g,c=ctx;c.save();c.globalCompositeOperation='lighter';
  const gr=c.createRadialGradient(x,y-16,0,x,y-16,r);gr.addColorStop(0,`rgba(250,244,255,${(.7*al).toFixed(3)})`);gr.addColorStop(.45,`rgba(190,120,255,${(.34*al).toFixed(3)})`);gr.addColorStop(1,'rgba(120,40,220,0)');
  c.fillStyle=gr;c.beginPath();c.arc(x,y-16,r,0,6.283);c.fill();
  c.lineCap='round';const n=big?9:6;
  for(let i=0;i<n;i++){const a=a0+i*(6.283/n)+.35,r0=(8+u*18)*g,sp=.28+.1*(i%3);c.strokeStyle=`rgba(${i%2?'214,170,255':'160,90,255'},${(.85*al).toFixed(3)})`;c.lineWidth=(i%2?1.2:1.8)*g;
    c.beginPath();c.arc(x+Math.cos(a)*r0*.2,y-16+Math.sin(a)*r0*.16,r0,a,a+sp,false);c.stroke();}
  c.restore();}
/* r1 pattern, extended: the runner of each beat comes in from its own side (144 deg steps), cuts THROUGH the target at the impact moment and dissolves on the far side.
   Layering: the part of a runner that is behind the target (screen-up) is drawn right before the target sprite, the rest on top. */
let fN=0;
function runnerState(sh,k){
  const C=CFG.chain,T=sh.t,s0=k*C.gap;if(T<s0)return null;const tin=T-s0,a=sh.th0+k*(Math.PI*2*2/C.hits),dirx=Math.cos(a),diry=Math.sin(a);
  const dashU=clamp01(tin/C.dash),e=1-Math.pow(1-dashU,3);let Rp;
  if(tin<=C.dash)Rp=C.strikeR+C.fromR*(1-e)-(C.strikeR)*e*.82;    // from outside (134) to ~6 px from the centre at the impact moment
  else{const o=clamp01((tin-C.dash)/.13),eo=1-Math.pow(1-o,2);Rp=6-eo*(C.strikeR+8);}   // follow-through to the far side
  const fade=clamp01((C.dash+.17-tin)/.17),big=k===C.hits-1;
  const al=Math.min(clamp01(tin/.035),fade);if(al<=.01)return null;
  const px=sh.tx+dirx*Rp,py=sh.ty+diry*Rp;
  const mv=a+Math.PI,dn=DN[dirIdx(mv+camYaw())];
  const iu=tin/C.dash,j=Math.max(0,Math.min(C.n-1,iu<1?Math.floor(3+clamp01(iu)*5):Math.floor(8+clamp01((tin-C.dash)/(C.life-C.dash))*3.99)));
  return {k,a,px,py,al,dn,j,big,tin,Rp,dirx,diry};}
function drawRunner(sh,st,layer){   // layer 'back' | 'front' | 'all'
  const C=CFG.chain,back=st.py<sh.ty-3;if(layer==='back'&&!back)return;if(layer==='front'&&back)return;
  const sc=st.big?1.12:1;
  // trail: from where the runner was ~0.09 s ago to where it is now (curved, tapered), only while moving
  const tR=Math.min(st.Rp+50,C.strikeR+C.fromR+30);
  ribbon(sh.tx+st.dirx*tR,sh.ty+st.diry*tR,st.px,st.py,st.al*(st.tin<=C.dash+.08?1:.55),(st.k%2?1:-1)*7,4.2*(st.big?1.4:1));
  figure(st.px,st.py,st.dn,st.j,st.al,sc);}
function drawShadows(layer,only){
  if(!CH.shadows.length||G.state!=='play')return;const C=CFG.chain,c=ctx;
  for(const sh of CH.shadows){
    if(sh.done&&sh.cancel)continue;if(only&&sh!==only)continue;
    const T=sh.t;
    if(layer!=='back'){
      const lu=T/.5;if(lu<1){c.save();c.globalCompositeOperation='lighter';c.strokeStyle=`rgba(170,90,255,${(.38*(1-lu)).toFixed(3)})`;c.lineWidth=1.5;c.beginPath();c.ellipse(sh.tx,sh.ty+6,C.area*(.55+.45*ss(lu)),C.area*(.55+.45*ss(lu))*.62,0,0,6.283);c.stroke();c.restore();}}
    const sts=[];for(let k=0;k<C.hits;k++){const st=runnerState(sh,k);if(st)sts.push(st);}
    if(layer==='back'){for(const st of sts)drawRunner(sh,st,'back');sh.bk=fN;continue;}
    for(const st of sts)drawRunner(sh,st,sh.bk===fN?'front':'all');
    for(let k=0;k<C.hits;k++){   // slash + impact are always on top, thin
      const s0=k*C.gap,iT=T-(s0+C.dash);if(iT<0)continue;const a=sh.th0+k*(Math.PI*2*2/C.hits),big=k===C.hits-1;
      slashArc(sh.tx,sh.ty,a+Math.PI,iT/(big?.2:.16),big,k%2?1:-1);flash(sh.tx,sh.ty,iT/(big?.22:.18),big,a);}
  }}
{const o=drawParts;drawParts=function(){const r=o.apply(this,arguments);try{drawShadows('front');}catch(e){L.err='shadowdraw '+e.message;}fN++;return r;};}
if(typeof drawEnemy==='function'){const o=drawEnemy;drawEnemy=function(e){try{if(CH.shadows.length&&G.state==='play'){const sh=CH.shadows.find(s=>s.e===e&&!(s.done&&s.cancel));if(sh)drawShadows('back',sh);}}catch(er){L.err='shadowback '+er.message;}return o.apply(this,arguments);};}
/* ---------------- heal ribbons (green, converge on the body) ---------------- */
function drawHeal(x,y){
  const t=clk(),c=ctx;
  for(const h of HEALFX){const u=(t-h.t0)/.7;if(u<0||u>1)continue;c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
    for(let i=0;i<9;i++){const a0=h.seed+i*.698,R0=62-8*(i%3),r1=R0*(1-ss(u)),r2=R0*(1-ss(Math.max(0,u-.28))),sw=Math.sin(u*5+i)*.35;
      const x1=x+Math.cos(a0+sw*(1-u))*r1,y1=y-18+Math.sin(a0+sw*(1-u))*r1*.7,x2=x+Math.cos(a0+sw*(1-u)+.55)*r2,y2=y-18+Math.sin(a0+sw*(1-u)+.55)*r2*.7;
      const al=Math.sin(Math.PI*u);
      c.strokeStyle=`rgba(40,200,110,${(.8*al).toFixed(3)})`;c.lineWidth=6;c.beginPath();c.moveTo(x2,y2);c.lineTo(x1,y1);c.stroke();
      c.strokeStyle=`rgba(190,255,210,${(1*al).toFixed(3)})`;c.lineWidth=2.4;c.beginPath();c.moveTo(x2,y2);c.lineTo(x1,y1);c.stroke();}
    const g=c.createRadialGradient(x,y-18,0,x,y-18,30);g.addColorStop(0,`rgba(170,255,200,${(.35*Math.sin(Math.PI*u)).toFixed(3)})`);g.addColorStop(1,'rgba(60,200,120,0)');c.fillStyle=g;c.beginPath();c.arc(x,y-18,30,0,6.283);c.fill();
    c.restore();}}
{const o=drawPlayerSprite;drawPlayerSprite=function(x,y,bob,fa){const r=o.apply(this,arguments);try{if(HEALFX.length)drawHeal(x,y);}catch(e){L.err='healdraw '+e.message;}return r;};}
/* ---------------- HUD: five power-swords (ดาบสะสมพลัง) above the HP orb, small stand-firm status icon ---------------- */
let hud=null,sHud=null,css=null,lastN=0;
const SWORD_SVG='<svg viewBox="0 0 14 34" preserveAspectRatio="xMidYMid meet"><path class="bl" d="M7 .8 L10.6 7.2 V22 H3.4 V7.2 Z"/><path class="ct" d="M7 3.4 V21"/><rect class="gd" x="1" y="22" width="12" height="2.8" rx="1"/><rect class="gr" x="5.8" y="24.8" width="2.4" height="6"/><circle class="gr" cx="7" cy="32.2" r="1.7"/></svg>';
function ensureCss(){if(css)return;css=document.createElement('style');
  css.textContent=`#pasSw{position:fixed;z-index:56;display:none;pointer-events:none;align-items:flex-end;box-sizing:border-box}
#pasSw.box{align-items:center;justify-content:center;background:linear-gradient(180deg,rgba(26,26,34,.88),rgba(12,12,18,.88));border:1px solid rgba(170,160,130,.38);border-radius:8px;box-shadow:0 1px 6px rgba(0,0,0,.45),inset 0 0 0 1px rgba(0,0,0,.5)}
#pasSw i{display:block;flex:none;filter:drop-shadow(0 0 1px rgba(0,0,0,.95)) drop-shadow(0 0 1px rgba(0,0,0,.7))}
#pasSw svg{display:block;width:100%;height:100%;overflow:visible}
#pasSw .bl{fill:#2e2e36;stroke:#b4b4c4;stroke-width:.9;stroke-linejoin:round}
#pasSw .ct{fill:none;stroke:#5a5a68;stroke-width:.9}
#pasSw .gd,#pasSw .gr{fill:#3a3a44;stroke:#9c9cae;stroke-width:.8}
#pasSw i.on{filter:drop-shadow(0 0 3px rgba(255,90,30,.95)) drop-shadow(0 0 7px rgba(255,60,20,.55));animation:pasFlick 1.2s ease-in-out infinite}
#pasSw i.on .bl{fill:#d62a18;stroke:#ff9a60}
#pasSw i.on .ct{stroke:#ffc080;stroke-width:1.4}
#pasSw i.on .gd,#pasSw i.on .gr{fill:#8a1a10;stroke:#ff8a50}
#pasSw i.pop{animation:pasPop .45s ease-out}
#pasSw.ready i.on{filter:drop-shadow(0 0 5px rgba(255,170,70,1)) drop-shadow(0 0 12px rgba(255,70,20,.8));animation:pasReady .75s ease-in-out infinite}
#pasSw.ready i.on .bl{fill:#ff3a1c;stroke:#ffd0a0}
@keyframes pasFlick{0%,100%{opacity:.92}50%{opacity:1}}
@keyframes pasPop{0%{transform:scale(1.6);filter:brightness(2)}100%{transform:scale(1)}}
@keyframes pasReady{0%,100%{transform:translateY(0) scale(1);filter:brightness(1.1) drop-shadow(0 0 5px rgba(255,170,70,1))}50%{transform:translateY(-2px) scale(1.12);filter:brightness(1.55) drop-shadow(0 0 12px rgba(255,90,30,1))}}
#pasStand{position:fixed;z-index:55;display:none;pointer-events:none;width:30px;height:30px}
#pasStand img{display:block;width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 1px 2px rgba(0,0,0,.8))}`;
  document.head.appendChild(css);}
let orbC={t:-9,r:null};
function orbRect(){   // the round HP orb of the bottom-left HUD: found by shape (near-square, 50-150 px, lower-left, text mentions HP); cached 1 s
  const n=performance.now()/1000;if(n-orbC.t<1)return orbC.r;orbC.t=n;let best=null;
  try{for(const el of document.querySelectorAll('div,section,span,button')){const r=el.getBoundingClientRect();if(r.width<50||r.width>150||Math.abs(r.width-r.height)>10)continue;if(r.left>innerWidth*.4||r.top<innerHeight*.45)continue;
      const cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden')continue;if(!/HP/i.test(el.textContent||''))continue;if(!best||r.width*r.height<best.width*best.height)best=r;}}catch(e){}
  if(!best){const t=document.getElementById('hpT');let el=t;for(let i=0;i<8&&el;i++,el=el.parentElement){const r=el.getBoundingClientRect();if(r.width>50&&Math.abs(r.width-r.height)<8){best=r;break;}}}
  return orbC.r=best;}
let plC={t:-9,r:null};
function plateRect(){   // the top unit-frame name plate (text has LV, wide dark bar, top-left); cached 1 s
  const n=performance.now()/1000;if(n-plC.t<1)return plC.r;plC.t=n;let best=null;
  try{for(const el of document.querySelectorAll('#hud div,#hud section')){const r=el.getBoundingClientRect();if(r.width<110||r.width>520||r.height<26||r.height>90||r.top>140||r.left>600)continue;
      const cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden')continue;if(!/LV/i.test(el.textContent||''))continue;if(!best||r.width*r.height<best.width*best.height)best=r;}}catch(e){}
  return plC.r=best;}
function ensureHud(){if(hud)return hud;ensureCss();hud=document.createElement('div');hud.id='pasSw';hud.innerHTML=('<i>'+SWORD_SVG+'</i>').repeat(5);document.body.appendChild(hud);return hud;}
function ensureStand(){if(sHud)return sHud;ensureCss();sHud=document.createElement('div');sHud.id='pasStand';
  sHud.innerHTML=CFG.icons.stand?'<img alt="" src="'+CFG.icons.stand+'">':'';document.body.appendChild(sHud);return sHud;}
L.hudLayout=null;
function hudTick(){
  try{
    const show=L.test&&L.on.chain&&swordNow()&&G.state==='play',h=ensureHud();
    h.style.display=show?'flex':'none';
    if(show){const r=orbRect();L.hudRect=r?{x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)}:null;
      const pl=innerWidth>=900?plateRect():null;   // wide (desktop) layout only: on the narrow/mobile layout the box would sit on the zone banner -> keep the old under-the-MP-bar placement
      let ow=r?r.width:100,uw=Math.round(Math.min(17,Math.max(11,r?ow*.125:13))),uh=Math.round(uw*2.4),gap=Math.max(3,Math.round(uw*.38)),w=uw*5+gap*4,boxH=0;
      let x,y,mode='orb';
      if(pl){uh=Math.round(Math.max(22,Math.min(40,pl.height-14)));uw=Math.round(uh/2.4);gap=Math.max(4,Math.round(uw*.5));w=uw*5+gap*4+20;boxH=Math.round(pl.height);x=pl.right+6;y=pl.top;mode='plate';
        if(x+w>innerWidth-4){mode='orb';boxH=0;uh=Math.round(uw*2.4);w=uw*5+gap*4;}}                // top: dark box right of the name plate (same height); if it does not fit -> old placement
      if(mode==='plate'){}
      else if(r){x=r.left+r.width/2-w/2;y=r.top-uh-Math.max(4,Math.round(uw*.4));}                 // desktop: centred above the round HP orb
      else{const mp=document.querySelector('.bar.mp'),mr=mp&&mp.getBoundingClientRect();           // mobile (no HP orb): directly under the unit frame's MP bar, left edge on the bars; clear of name / level / fold button
        if(mr&&mr.width>20&&getComputedStyle(mp).display!=='none'){x=mr.left;y=mr.bottom+5;mode='bar';}else{x=20;y=innerHeight-uh-150;mode='fallback';}}
      x=Math.max(4,Math.min(innerWidth-w-4,x));y=Math.max(4,y);
      h.classList.toggle('box',mode==='plate');h.style.left=Math.round(x)+'px';h.style.top=Math.round(y)+'px';h.style.gap=gap+'px';h.style.width=mode==='plate'?w+'px':'auto';h.style.height=mode==='plate'?boxH+'px':'auto';L.hudLayout={x:Math.round(x),y:Math.round(y),w,h:mode==='plate'?boxH:uh,uw,gap,mode};
      const els=h.children;for(let i=0;i<5;i++){els[i].style.width=uw+'px';els[i].style.height=uh+'px';const on=i<CH.n;if(on&&!els[i].classList.contains('on')){els[i].classList.add('on');els[i].classList.add('pop');setTimeout(()=>{try{els[i].classList.remove('pop');}catch(e){}},500);}if(!on)els[i].classList.remove('on');}
      h.classList.toggle('ready',CH.n>=CFG.chain.slots);}
    const sShow=L.test&&L.on.stand&&standOn&&swordNow(),sh=ensureStand();sh.style.display=sShow?'block':'none';L.standIcon=sShow;
    if(sShow){const hh=document.getElementById('sk3Hud');sh.style.left=(hh&&hh.style.display!=='none'?446:394)+'px';sh.style.top=(L.hudLayout&&L.hudLayout.mode==='plate'?Math.round(L.hudLayout.y+L.hudLayout.h+4):62)+'px';sh.title='ยืนหยัดกลางศึก: ศัตรู '+standN+' ตัวในรัศมี '+CFG.stand.radius+' px · ลดดาเมจ '+Math.round(CFG.stand.reduce*100)+'%';}
  }catch(e){}}
setInterval(hudTick,60);
/* ---------------- TEST panel ---------------- */
let panel=null;
function panelHTML(){const row=(a,b)=>`<div><span style="color:#e9b">${a}</span> ${b}</div>`;
  return row('ดาบสะสมพลัง',L.on.chain?`${CH.n}/${CFG.chain.slots}${CH.n>=CFG.chain.slots?' · พร้อมปล่อยเงา':''} · เงา ${CH.shadows.length}`:'-')
   +row('ยืนหยัด',L.on.stand?(standOn?`ทำงาน (${standN} ตัว)`:`ไม่ครบ (${standN}/${CFG.stand.count})`):'-')
   +row('ฮีล',L.on.breath?`${L.stats.heals} ครั้ง · ถัดไปใน ${Math.max(0,CFG.breath.icd-(clk()-lastHeal)).toFixed(1)} วิ`:'-')
   ;}
function syncPanel(){
  if(L.test&&!panel){panel=document.createElement('div');panel.id='pasPanel';
    panel.style.cssText='position:fixed;right:10px;top:560px;z-index:60;width:250px;padding:6px 10px;border-radius:10px;background:rgba(30,10,8,.9);border:1px solid #b5502a;color:#ffeadb;font:11.5px/1.4 sans-serif;pointer-events:auto';
    const rows=Object.keys(CFG.ids).map(k=>`<label style="display:flex;gap:6px;align-items:center;min-height:21px"><input type="checkbox" data-p="${k}" style="width:16px;height:16px"> ${CFG.icons[k]?`<img src="${CFG.icons[k]}" alt="" style="width:22px;height:22px;object-fit:contain">`:''}${CFG.names[k]}</label>`).join('');
    panel.innerHTML='<b>พาสซีฟอาชีพดาบ</b> <span style="color:#ffd65a">TEST</span><div style="margin:2px 0">'+rows+'</div><div id="pasBody"></div>';
    document.body.appendChild(panel);
    panel.addEventListener('change',e=>{const k=e.target&&e.target.dataset&&e.target.dataset.p;if(k)set(k,e.target.checked);});
    for(const ev of ['pointerdown','pointerup','mousedown','touchstart','click'])panel.addEventListener(ev,e=>e.stopPropagation());}
  if(panel){panel.style.display=L.test?'block':'none';for(const cb of panel.querySelectorAll('input[data-p]'))cb.checked=!!L.on[cb.dataset.p];}}
setInterval(()=>{try{if(panel&&L.test)panel.querySelector('#pasBody').innerHTML=panelHTML();}catch(e){}},150);
setInterval(()=>{try{const row=document.getElementById('hudTrayRow');if(row&&!document.getElementById('pasTog')){const b=document.createElement('button');b.type='button';b.className='tbtn';b.id='pasTog';row.appendChild(b);
  const lab=()=>{b.textContent='พาสซีฟดาบ: '+(L.test?'เปิดแผง':'ปิด');};lab();b.addEventListener('click',()=>{L.setTest(!L.test);lab();});}}catch(e){}},700);
}catch(e){L.err='init '+e.message;}
})();

