
/* ---- desertbal-r1 (TEST allin_r10, 12 Nov 2026): Balance's answers for the desert monsters (estimates, TEST values) - ?desertbal=off = the allin_r9 behaviour ----
   1) EXP: per-species multiplier from DESERT_monsters_balance_r1 (scarab 1.05 gecko 1.0 cactoid 1.4 jackal 1.05 scorpion 1.2 wisp 1.0 vulture 1.05 pup 1.3 mummy 1.15 mimic 1.5 cobra 1.1 statue 1.45 salamander 1.15 djinn 1.1 devil 1.0 golem 1.5) on the engine's kill exp (10+L^1.85); a field boss = 10 min of farming (12 kills/min assumed) = 120 x the normal-mob exp of its level (the engine's boss x30 is scaled x4);
   2) attack interval: Gecko x0.8; Cactoid, Tomb Statue, Glass Golem x1.3;
   3) burrow (Sandworm Pup / Dune Worm): untargetable (damage ignored, only a sand mound drawn) for at most 1.5 s (boss 2.5 s) INCLUDING a 0.6 s dust telegraph before resurfacing, at least 4 s surfaced between burrows; the worm travels under the ground toward the hero;
   4) Mirage Wisp / Lamp Djinn Imp keep 200-260 px, back off inside 160 px, and after at most 2 s of repositioning they shoot;
   5) Jar Mimic: at most 10 % of a farm map's mobs, minimum 1 (the farm spawner's makeEnemy call is refused above the cap);
   6) field-boss loot (Scarab Matriarch ...): needs >= 10 % of the boss' HP dealt by the hero, EXP = 10 min farming, gold = 10 x a normal mob (engine boss x30 scaled to x10), gear rolls Rare 90 % / Epic 10 %, + 1 Special Weapon Box (spBox); mobs keep the engine role drops;
   7) no new element rows: wind / light / dark count as Neutral; the Cat Mummy = Neutral + race 'undead'. Debug: window.__DESERTBAL ---- */
(function(){'use strict';
const OFF=/[?&]desertbal=off\b/.test(String(location.search)),DS=window.__DESERT;
const BAL=window.__DESERTBAL={ver:'desertbal-r1',on:!OFF&&!!DS,err:null,stats:{burrows:0,repos:0,forcedShots:0,mimicRefused:0,bossLoot:0,bossNoLoot:0}};
if(OFF||!DS)return;
const ERR=(w,e)=>{BAL.err=w+': '+((e&&e.message)||e);try{console.error('[DESERTBAL]',w,e)}catch(_){}};
const rnd=(a,b)=>a+Math.random()*(b-a);
const EXPM={sand_scarab:1.05,dune_gecko:1.0,cactoid:1.4,dust_jackal:1.05,sand_scorpion:1.2,mirage_wisp:1.0,desert_vulture:1.05,sandworm_pup:1.3,bandage_cat_mummy:1.15,jar_mimic:1.5,sand_cobra:1.1,tomb_jackal_statue:1.45,fire_salamander:1.15,lamp_djinn_imp:1.1,dust_devil:1.0,glass_golem:1.5};
const IV={dune_gecko:.8,cactoid:1.3,tomb_jackal_statue:1.3,glass_golem:1.3};
const BOSS_EXP_X=4;   /* engine boss exp x30 -> x120 = 12 kills/min x 10 min */
/* 7) elements */
try{for(const k in DS.spec){const d=DS.spec[k];let ele=d.ele;if(ele==='holy'||ele==='wind'||ele==='shadow')ele='neutral';MOBX['ds_'+k]=[k==='bandage_cat_mummy'?'undead':d.race,ele]}}catch(e){ERR('MOBX',e)}
/* 1) + 6) kill context */
const X={on:false,xm:1,boss:false,noLoot:false};BAL.X=X;
try{const _g=gainExp;gainExp=function(x){if(X.on){arguments[0]=X.noLoot?0:Math.round(x*X.xm);BAL.lastExp=arguments[0];BAL.lastRaw=x}return _g.apply(this,arguments)}}catch(e){ERR('gainExp',e)}
try{if(typeof gainJobExp==='function'){const _j=gainJobExp;gainJobExp=function(x){if(X.on){arguments[0]=X.noLoot?0:Math.round(x*X.xm)}return _j.apply(this,arguments)}}}catch(e){ERR('gainJobExp',e)}
try{const _d=dropLoot;dropLoot=function(x,y,o){if(X.on){if(X.noLoot){BAL.stats.swallowed=(BAL.stats.swallowed||0)+1;return}if(X.boss&&o&&o.gold!=null){o=Object.assign({},o,{gold:Math.max(1,Math.round(o.gold/3))});BAL.lastGold=o.gold}}return _d.call(this,x,y,o)}}catch(e){ERR('dropLoot',e)}
try{const _r=rollRar;rollRar=function(m){if(X.on&&X.boss)return Math.random()<.9?2:3;return _r.apply(this,arguments)}}catch(e){ERR('rollRar',e)}
try{const _ad=applyDamage;applyDamage=function(e,d,crit,o){if(e&&e._under)return 0;const h0=e&&e.hp,r=_ad.apply(this,arguments);try{if(e&&e.fieldBoss&&h0>e.hp&&!(o&&o.team==='e'))e._pd=(e._pd||0)+(h0-e.hp)}catch(_){}return r}}catch(e){ERR('applyDamage',e)}
try{const _k=killEnemy;killEnemy=function(e){if(!e||e.dead||!e.dsr)return _k.apply(this,arguments);X.on=true;X.boss=!!e.fieldBoss;X.xm=e.fieldBoss?BOSS_EXP_X:(EXPM[e.dsr]||1);X.noLoot=!!(e.fieldBoss&&(e._pd||0)<e.maxHp*.10);
  try{const r=_k.apply(this,arguments);if(e.fieldBoss){if(X.noLoot)BAL.stats.bossNoLoot++;else{BAL.stats.bossLoot++;try{dropLoot(e.x,e.y,{item:{id:'spBox',q:1},rare:1})}catch(_){}}}return r}finally{X.on=false;X.noLoot=false;X.boss=false}}}catch(e){ERR('killEnemy',e)}
/* 5) mimic cap */
try{const _me=makeEnemy;makeEnemy=function(type){if(type==='ds_jar_mimic'&&!BAL.noMimicCap){const F=window.__FARM,N=(F&&F.N)||enemies.filter(e=>!e.dead&&e.farm).length||60,cap=Math.max(1,Math.floor(N*.10)),live=enemies.filter(e=>!e.dead&&e.type==='ds_jar_mimic').length;if(live>=cap){BAL.stats.mimicRefused++;return null}}return _me.apply(this,arguments)}}catch(e){ERR('makeEnemy',e)}
/* 3) burrow draw */
try{const _sp=SHAPES.desertspr;SHAPES.desertspr=function(e,x,y,s,t){if(e&&e._under){const bs=e._bs||{},tele=bs.until&&time>=bs.tele,k=tele?1-Math.max(0,(bs.until-time))/.6:0,R=s*(e.dsr==='dune_worm'?1.5:1.1);ctx.save();ctx.globalAlpha=.6;ctx.fillStyle='#c9a46a';ctx.beginPath();ctx.ellipse(x,y+s*.32,R*(1+.5*k),R*.32*(1+.5*k),0,0,6.283);ctx.fill();ctx.globalAlpha=.35;ctx.fillStyle='#7a5a30';ctx.beginPath();ctx.ellipse(x,y+s*.32,R*.55,R*.17,0,0,6.283);ctx.fill();
    if(tele){ctx.strokeStyle='rgba(255,230,170,.8)';ctx.lineWidth=2;for(let i=0;i<5;i++){const a=i*1.26+time*6;ctx.beginPath();ctx.arc(x+Math.cos(a)*R*(.6+k*.5),y+s*.3+Math.sin(a)*R*.18,3+k*3,0,6.283);ctx.stroke()}}ctx.restore();return}
  return _sp.apply(this,arguments)}}catch(e){ERR('draw',e)}
/* update: intervals, burrow, ranged spacing */
try{const _u=update;update=function(dt){const pre=new Map();try{for(const e of enemies){if(e.dsr&&!e.dead&&e.aggro&&DS.spec[e.dsr]&&DS.spec[e.dsr].rng&&!(e.st&&e.st.stun))pre.set(e,[e.x,e.y])}}catch(_){}const r=_u.apply(this,arguments);try{for(const [e,p0] of pre){if(e.dead)continue;e.x=p0[0];e.y=p0[1]}for(const e of enemies){if(!e.dsr||e.dead)continue;const d=DS.spec[e.dsr];
  const iv=IV[e.dsr];if(iv){const w=e.wind>0;if(w&&!e._wasW0&&e.atkCd>0){const b0=e.atkCd;e.atkCd*=iv;(BAL.ivLog=BAL.ivLog||[]).length<60&&BAL.ivLog.push([e.dsr,+b0.toFixed(2),+e.atkCd.toFixed(2)])}e._wasW0=w}
  const dist=Math.hypot(P.x-e.x,P.y-e.y),ang=Math.atan2(P.y-e.y,P.x-e.x);
  if(e.dsr==='sandworm_pup'||e.dsr==='dune_worm'){const boss=e.dsr==='dune_worm',bs=e._bs||(e._bs={st:'up',t:time+rnd(2,4),until:0,tele:0});
    if(bs.st==='up'){e._under=false;if(e.aggro&&time>=bs.t&&dist>110&&dist<520&&!(e.wind>0)&&!(e.lunge>0)&&!(e.st&&e.st.stun)){bs.st='under';bs.until=time+(boss?rnd(1.8,2.35):rnd(1.0,1.4));bs.tele=bs.until-.6;BAL.stats.burrows++;e._under=true;try{ring(e.x,e.y,10,70,.4,'#c9a46a',4)}catch(_){}}}
    else{e._under=true;e.atkCd=Math.max(e.atkCd||0,.5);e.wind=0;e.lunge=0;
      if(time<bs.tele){const sp=boss?200:240,step=Math.max(0,Math.min(sp*dt,dist-80));if(step>0){const nx=e.x+Math.cos(ang)*step,ny=e.y+Math.sin(ang)*step;try{if(!blocked(nx,ny,e.sz*.6)){e.x=nx;e.y=ny}}catch(_){e.x=nx;e.y=ny}}}
      else{try{if(Math.random()<dt*14)part({x:e.x+rnd(-e.sz,e.sz),y:e.y+rnd(-4,8),vx:rnd(-40,40),vy:rnd(-90,-30),life:rnd(.3,.6),max:.6,size:rnd(3,7),col:'#d9b46a',type:'wisp',sway:20,drag:.95})}catch(_){}}
      if(time>=bs.until){bs.st='up';e._under=false;bs.t=time+4+rnd(0,2);e.alertT=.3;try{ring(e.x,e.y,10,80,.4,'#ffe3a0',4)}catch(_){}}}}
  if(d&&d.rng&&e.aggro&&!e.dead&&!(e.st&&e.st.stun)&&pre.has(e)){const sp=(e.sp||70)*1.15,R=d.rangeR||260;
    if(e._tele>0){e._rp=0}
    else{let mv=0;if(dist<160)mv=-1;else if(dist>260)mv=1;
      if(mv){const nx=e.x+Math.cos(ang)*sp*dt*mv,ny=e.y+Math.sin(ang)*sp*dt*mv;try{if(!blocked(nx,ny,e.sz*.6)){e.x=nx;e.y=ny}}catch(_){e.x=nx;e.y=ny}e._rp=(e._rp||0)+dt;BAL.stats.repos+=dt}else e._rp=0;
      e._cs=(e._cs==null?rnd(.6,1.4):e._cs)-dt;
      if(e._rp>2){e._rp=0;e._cs=0;BAL.stats.forcedShots++}
      if(e._cs<=0&&!(e.wind>0)){e._cs=rnd(2,3);if(dist<=R+60||e._rp===0){try{enemyShoot(e,ang,320)}catch(_){}}}}}  }}catch(er){ERR('update',er)}return r}}catch(e){ERR('update hook',e)}
console.info('[DESERTBAL] ready');
})();
