
/* ---- merge m1: p193 Animation & Combat Studio (kit 03_p181_anim_studio.js) ---- */
/* ---- extra candidate fragment: tools/studio/p181_anim_studio.js ---- */
/* p181 — Animation & Combat Studio (TEST MODE, candidate only). Opened from the TEST menus ("Animation & Combat Studio").
   A separate test scene ('anim_studio') that runs on the REAL game systems: renderer (drawPlayer / drawEnemy_v1 / p180 slime sprite),
   combat (basicAttack, castSkill, hitEnemy, applyDamage, hurtPlayer, monster wind-up/strike in updEnemies) and statuses (applySt, PoisonSet,
   CurseState, freeze). Nothing here re-implements those systems; the Studio only arranges the scene, freezes/unfreezes AI, and reads state.
   SAVE SAFETY
   * On entry the game saves once (exactly like the 20-s autosave) so progress up to that moment is kept.
   * While the Studio is open every localStorage write/remove is redirected to an in-memory table (reads see it, the disk never does),
     saveGame is a no-op, and EXP / job EXP / loot / orbs from Studio kills are suppressed.
   * Leaving the Studio reloads the page, so every Studio change (levels, stats, test weapons, statuses, deaths) is discarded.
   Balance values of the normal game are not changed: Studio edits apply only to the Studio's own player/monster objects. */
(function(){
'use strict';
const ZID='anim_studio',VER='p181-studio-r8';
const POSES=[['idle','ยืน'],['walk','เดิน'],['run','วิ่ง'],['jump','กระโดด'],['windup','ง้างโจมตี'],['slash','ฟัน'],['thrust','แทง'],['ranged','โจมตีระยะไกล'],['skill','ใช้สกิล'],['hurt','โดนโจมตี'],['knock','กระเด็น'],['fall','ล้ม'],['death','ตาย']];
const SPEEDS=[.1,.25,.5,1,2];
const ST={on:false,ver:VER,paused:false,step:0,speedI:3,loop:true,zoom:1.6,sheetOpen:true,tab:'pose',
  subject:'mob',mobType:'slime',mobLv:5,mode:'dummy',mob:null,home:{x:700,y:560},mobHome:{x:820,y:560},
  pose:'auto',poseRun:null,clean:false,act:null,repeatT:0,autoAtk:false,mobImmortal:true,autoRespawn:true,deadT:null,
  ov:{hit:true,skill:true,hurt:true,range:true,detect:false,coll:false,shadow:true,anchor:true},
  stTarget:'mob',stDur:5,events:[],hits:[],labels:[],lastSwing:null,lastWind:0,blockedWrites:0,suppressed:{exp:0,job:0,loot:0,orbs:0},
  snap:null,msg:'',installed:false,ui:null};
window.STUDIO=ST;
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const f1=v=>v==null||!isFinite(v)?'—':(Math.round(v*10)/10).toString();
const f2=v=>v==null||!isFinite(v)?'—':(Math.round(v*100)/100).toFixed(2);
const fi=v=>v==null||!isFinite(v)?'—':Math.round(v).toLocaleString('en-US');
const speed=()=>SPEEDS[ST.speedI];
function note(m){ST.msg=m;ST.msgT=performance.now();}

/* ================= storage shadow (only while the Studio is open; the page reloads on exit) ================= */
const SP=Storage.prototype,oSet=SP.setItem,oGet=SP.getItem,oRem=SP.removeItem,MEM=new Map(),GONE={};
SP.setItem=function(k,v){if(ST.on&&this===window.localStorage){MEM.set(String(k),String(v));ST.blockedWrites++;return;}return oSet.apply(this,arguments);};
SP.getItem=function(k){if(ST.on&&this===window.localStorage&&MEM.has(String(k))){const v=MEM.get(String(k));return v===GONE?null:v;}return oGet.apply(this,arguments);};
SP.removeItem=function(k){if(ST.on&&this===window.localStorage){MEM.set(String(k),GONE);ST.blockedWrites++;return;}return oRem.apply(this,arguments);};

/* ================= scene zone ================= */
function registerZone(){
  if(ZONES[ZID])return;
  const base=ZONES.cartroad_plains||ZONES[Object.keys(ZONES)[0]];
  const Z=JSON.parse(JSON.stringify(base));delete Z.w22;delete Z.stub;delete Z.range;
  Object.assign(Z,{n:'Animation & Combat Studio',th:'สตูดิโอแอนิเมชันและการต่อสู้',sub:'Test mode',mobs:[],field:0,safe:false,fullSafe:false,seed:1810,w:1400,h:1100,
    ground:['#3b4a44','#46574f','#52645a','#2c3934'],acc:'#ffd36b',amb:'mote',density:0,areas:[],studio:1});
  ZONES[ZID]=Z;
  FEAT[ZID]=function(g,Z){g.strokeStyle='rgba(255,255,255,.07)';g.lineWidth=2;for(let x=0;x<=Z.w;x+=50){g.globalAlpha=x%200?0.5:1;g.beginPath();g.moveTo(x,0);g.lineTo(x,Z.h);g.stroke();}
    for(let y=0;y<=Z.h;y+=50){g.globalAlpha=y%200?0.5:1;g.beginPath();g.moveTo(0,y);g.lineTo(Z.w,y);g.stroke();}g.globalAlpha=1;};
  try{EDGE_THEME[ZID]=[];}catch(e){}
  {const o=gatesFor;gatesFor=function(z){if(z===ZID)return [];return o.apply(this,arguments);};}
  {const o=genProps;genProps=function(z){if(z===ZID)return [];return o.apply(this,arguments);};}
  {const o=spawnEnemy;spawnEnemy=function(){if(G.zone===ZID)return;return o.apply(this,arguments);};}
  {const o=edgeEligible;edgeEligible=function(z){if(z===ZID)return false;return o.apply(this,arguments);};}
  {const o=updZoneTag;updZoneTag=function(){const r=o.apply(this,arguments);if(G.zone===ZID){const n=$('#zName'),s=$('#zSub');if(n)n.textContent='ANIMATION & COMBAT STUDIO';if(s)s.textContent='Test mode · ไม่บันทึกเซฟ';}return r;};}
}
function loadStudioZone(){
  // the new-maps build redirects unknown zone ids to Map 1 inside loadZone; for this one synchronous call the studio id is treated as known
  const h=Set.prototype.has;Set.prototype.has=function(v){return v===ZID||h.call(this,v);};
  // the map-recipe module reports "no recipe for this zone" as a toast; the studio has no map recipe by design, so that one notice is muted
  const n0=window.notify;if(typeof n0==='function')window.notify=function(m){if(/Recipe/.test(String(m)))return;return n0.apply(this,arguments);};
  try{loadZone(ZID,{x:ST.home.x,y:ST.home.y});}finally{Set.prototype.has=h;if(typeof n0==='function')window.notify=n0;}
}

/* ================= mobs ================= */
function mobGroups(){
  // Map 2 species get their MOBS record when Map 2 first loads; register the same records here (same code as w22SpeciesInit, no spawn, W22.species untouched)
  try{const PD=window.__W22_DATA&&__W22_DATA.population;if(PD)for(const q of PD.species){if(q.new&&!MOBS[q.id])MOBS[q.id]=Object.assign({},q.new);try{if(!MOBX[q.id])MOBX[q.id]=[q.race,q.element];}catch(_){}}}catch(_){}
  const sp=(window.W22&&W22.sp10&&W22.sp10.data)||{},seen=new Set(['slime']);
  const lvOf=k=>{try{const r=W22.mondata.byOld[k];if(r&&r.zone_lv&&r.zone_lv[0])return r.zone_lv[0];}catch(_){}return 10;};
  const G1=[['slime','Slime',5,'ภาพ Chibi ทดลอง']];
  const G2=[];for(const k in sp)if(MOBS[k]){seen.add(k);const art=window.MON_SPRITES&&MON_SPRITES.byType[k];G2.push([k,MOBS[k].n,sp[k].lv[0],'เกิดจริงใน Map 2 · '+(art?'ภาพใหม่ทดลอง (เฉพาะ Studio)':'ภาพชั่วคราว')]);}
  const G3=[],G4=[];
  for(const k in MOBS){if(seen.has(k)||/^(c182_|devdummy|raid_)/.test(k))continue;const m=MOBS[k];if(!m||!m.n)continue;
    (m.boss?G4:G3).push([k,m.n,lvOf(k),(m.elite?'Elite · ':'')+'ไม่มีจุดเกิดในแผนที่ใหม่ · ภาพชั่วคราว']);}
  G3.sort((a,b)=>a[2]-b[2]||a[1].localeCompare(b[1]));
  return [['สไลม์ (ภาพใหม่)',G1],['Map 2 · มีจุดเกิดจริงตอนนี้',G2],['มอนสเตอร์อื่นในข้อมูลเกม',G3],['บอส (ข้อมูลเกม)',G4]];}
function mobList(){const out=[];for(const [,g] of mobGroups())for(const m of g)out.push(m);return out;}
function pickMob(k){const L=mobList().find(m=>m[0]===k);if(!L)return;ST.mobType=k;ST.mobLv=L[2];ST.subject='mob';ST.stTarget='mob';spawnMob();note('เรียก '+L[1]+' Lv'+L[2]+' มาแล้ว');}
function SPR(e){return e&&window.MON_SPRITES?MON_SPRITES.byType[e.type]||null:null;}   // per-monster sprite renderer (p182)
const DIRNAME={S:'S หน้าตรง (หันลง)',SW:'SW หน้าเฉียงซ้าย',W:'W ด้านข้างซ้าย',NW:'NW หลังเฉียงซ้าย',N:'N หลังตรง (หันขึ้น)',NE:'NE หลังเฉียงขวา',E:'E ด้านข้างขวา',SE:'SE หน้าเฉียงขวา'};
function sprDirs(e){const R=SPR(e);return R&&R.dirs||null;}
function hasArt(e){const R=SPR(e);return !!(R&&R.cfg.enabled&&R.ready&&R.inScope());}
function clearField(){enemies.length=0;try{projs.length=0;}catch(e){}try{loot.length=0;}catch(e){}try{orbs.length=0;}catch(e){}try{timers.length=0;}catch(e){}try{gfx.length=0;}catch(e){}}
function spawnMob(){
  for(let i=enemies.length-1;i>=0;i--)if(enemies[i].studio)enemies.splice(i,1);
  const e=makeEnemy(ST.mobType,Math.max(1,ST.mobLv|0),ST.mobHome.x,ST.mobHome.y);
  e.studio=1;e.sx=ST.mobHome.x;e.sy=ST.mobHome.y;e.face=Math.PI;e.wanderT=99;e.atkCd=1.2;
  enemies.push(e);ST.mob=e;try{if(ST.dir&&sprDirs(e))SPR(e).forceDir(e,ST.dir);}catch(_){}ST.deadT=null;ST.mobDef={atk:e.atk,def:e.def,sp:e.sp,maxHp:e.maxHp};ST.pose='auto';ST.poseRun=null;ST.act=null;
  return e;}
function placePlayer(){P.x=ST.home.x;P.y=ST.home.y;P.vx=P.vy=0;P.face=0;}
function revivePlayer(){if(P.dead||G.state==='dead'){P.dead=false;G.state='play';}const o=$('#over');if(o)o.hidden=true;P.hp=P.maxHp;P.mp=P.maxMp;P.invT=0;P.hurtT=0;}
function restoreHpMp(){P.hp=P.maxHp;P.mp=P.maxMp;if(ST.mob&&!ST.mob.dead)ST.mob.hp=ST.mob.maxHp;try{P.cds={};}catch(e){}}
function clearPlayerStatus(){try{C182.api.units();P.pz.clear();P.pzLed.refMax=null;P.pzLed.entries.length=0;P.curse.clear();}catch(e){}P.buffs={};}
function clearMobStatus(e){if(!e)return;e.st={};try{if(e.pz)e.pz.clear();}catch(_){}e.wfrz=0;e.wchill=0;e.wbld=null;}
function resetScene(){revivePlayer();clearPlayerStatus();clearField();placePlayer();spawnMob();restoreHpMp();ST.events.length=0;ST.hits.length=0;ST.labels.length=0;keysOff();ST.autoAtk=false;note('รีเซ็ตฉากแล้ว');}
function snapPlayer(){ST.snap=JSON.parse(JSON.stringify({lvl:P.lvl,stats:P.stats,weapon:P.weapon,skills:P.skills,exp:P.exp,statPts:P.statPts}));}
function resetPlayerStats(){if(!ST.snap)return;const s=JSON.parse(JSON.stringify(ST.snap));P.lvl=s.lvl;P.stats=s.stats;P.weapon=s.weapon;P.skills=s.skills;P.exp=s.exp;P.statPts=s.statPts;try{recalc();}catch(e){}restoreHpMp();note('คืนค่าสเตตัสผู้เล่นเป็นค่าตอนเข้า Studio');}

/* ================= reward guard (Studio kills give nothing) ================= */
let NR=0;
function guard(name,key){const f=window[name];if(typeof f!=='function')return;window[name]=function(){if(ST.on&&NR>0){ST.suppressed[key]++;return;}return f.apply(this,arguments);};}

/* ================= events ================= */
function ev(k,o){const r=Object.assign({k,t:time},o||{});ST.events.push(r);if(ST.events.length>200)ST.events.shift();return r;}
function subjFrameText(){const e=ST.mob;if(ST.subject==='mob'&&hasArt(e)){const F=SPR(e).frameInfo(e);if(F)return F.clip+' #'+(F.i+1)+'/'+F.n;}return null;}

/* ================= hooks (installed once, on first entry, so they are the outermost layer) ================= */
let keyHeld=null;
function keysOff(){if(keyHeld){keys[keyHeld]=false;keyHeld=null;}}
function install(){
  if(ST.installed)return;ST.installed=true;
  registerZone();
  {const o=saveGame;saveGame=function(){if(ST.on)return;return o.apply(this,arguments);};}
  guard('gainExp','exp');guard('gainJobExp','job');guard('dropLoot','loot');
  {const o=killEnemy;killEnemy=function(e){
    if(ST.on&&e&&e===ST.mob&&ST.mobImmortal&&!e.dead){e.hp=Math.max(1,e.hp);return;}
    if(!(ST.on&&e&&e.studio))return o.apply(this,arguments);
    const n0=orbs.length,was=e.dead;NR++;let r;try{r=o.apply(this,arguments);}finally{NR--;}
    if(orbs.length>n0){ST.suppressed.orbs+=orbs.length-n0;orbs.length=n0;}
    if(!was&&e.dead){ev('death',{who:'mob',frame:subjFrameText(),st:Object.keys(e.st||{}).concat(e.pz&&e.pz.active()?['poison×'+e.pz.stacks.length]:[])});ST.deadT=time;}
    return r;};}
  {const o=playerDeath;playerDeath=function(){const r=o.apply(this,arguments);if(ST.on&&P.dead){ev('death',{who:'player'});setTimeout(()=>{if(ST.on){const ov=$('#over');if(ov)ov.hidden=true;note('ผู้เล่นตาย (ไม่มีแอนิเมชันตาย) — กด “ชุบชีวิต”');paint(true);}},950);}return r;};}
  {const o=hurtPlayer;hurtPlayer=function(raw,src){if(!ST.on)return o.apply(this,arguments);const h0=P.hp,r=o.apply(this,arguments);
    const d=h0-P.hp;ev('dmgP',{d,src:src&&src.type,frame:src&&src===ST.mob?subjFrameText():null,since:ST.lastWind?time-ST.lastWind:null});if(d>0)ST.labels.push({x:P.x,y:P.y,t:time,txt:'โดน −'+fi(d)});return r;};}
  {const o=applyDamage;applyDamage=function(e,d,crit,opt){if(!ST.on)return o.apply(this,arguments);const h0=e?e.hp:0,r=o.apply(this,arguments);
    if(e&&e.studio){const dd=h0-e.hp;if(ST.dotKill&&ST.dotKill.e===e&&opt&&opt.dot&&dd>0&&!e.dead){e.hp=Math.max(1,Math.min(e.hp,Math.round(dd*4)));ST.dotKill=null;}const sw=ST.lastSwing;ev('dmgM',{d:dd,crit:!!crit,dot:opt&&opt.dot||null,frame:subjFrameText(),since:sw?time-sw.t:null,swing:sw?sw.type:null});
      ST.labels.push({x:e.x,y:e.y-e.sz,t:time,txt:(opt&&opt.dot?opt.dot+' ':'HIT ')+(subjFrameText()||'')});}return r;};}
  {const o=inSector;inSector=function(e,cx,cy,a,r,arc){if(ST.on)recHit({k:'sector',x:cx,y:cy,a,r,arc});return o.apply(this,arguments);};}
  {const o=inLine;inLine=function(e,x,y,a,len,w){if(ST.on)recHit({k:'line',x,y,a,len,w});return o.apply(this,arguments);};}
  {const o=ell;ell=function(){if(ST.on&&!ST.ov.shadow&&ST.inEnt&&arguments[4]==='#000000')return;return o.apply(this,arguments);};}
  {const o=drawEnemy_v1;drawEnemy_v1=function(e){if(!ST.on)return o.apply(this,arguments);ST.inEnt=1;
    let rr=null,ft=null;if(CLEAN()){rr=window.rrect;window.rrect=function(){ctx.beginPath();};ft=ctx.fillText;ctx.fillText=function(){};}   // name + HP bar off
    try{o.apply(this,arguments);}finally{ST.inEnt=0;if(rr){window.rrect=rr;}if(ft){delete ctx.fillText;if(ctx.fillText!==CanvasRenderingContext2D.prototype.fillText)ctx.fillText=CanvasRenderingContext2D.prototype.fillText;}}
    if(e===ST.mob)drawMobAnchor(e);};}
  {const o=drawPlayer;drawPlayer=function(){if(!ST.on)return o.apply(this,arguments);ST.inEnt=1;try{o.apply(this,arguments);}finally{ST.inEnt=0;}drawPlayerAnchor();};}
  {const o=castSkillNow;castSkillNow=function(id){if(!ST.on||G.zone!==ZID)return o.apply(this,arguments);const s=SK[id];let tgt=null;try{tgt=aimPoint((s&&s.range)||450);}catch(_){}
    const px=P.x,py=P.y,ang=tgt?Math.atan2(tgt.y-py,tgt.x-px):P.face,r=o.apply(this,arguments);if(r&&s)try{recordSkill(id,s,tgt,px,py,ang);}catch(er){}return r;};}
  {const o=explode;explode=function(p){if(ST.on&&p)SKA.timed.push({k:'circle',x:p.x,y:p.y,r:p.aoe,t0:time,dur:.5,plusSz:true,col:'#ff8a3d',why:'ระเบิด aoe'});return o.apply(this,arguments);};}
  /* "ดูท่าชัด" (clean view): drawing only. Skill FX, particles, projectiles' and ground zones' visuals, floating numbers and the
     monster name/HP bar are not drawn; every update, hit test and damage still runs exactly as before. */
  const CLEAN=()=>ST.on&&ST.clean&&G.zone===ZID;
  for(const n of ['drawFx','drawParts','drawProj','drawTexts']){const o=window[n];if(typeof o==='function')window[n]=function(){if(CLEAN())return;return o.apply(this,arguments);};}
  {const o=window.drawGround;if(typeof o==='function')window.drawGround=function(){if(CLEAN())return;return o.apply(this,arguments);};}
  {const o=window.drawRaidTele;drawRaidTele=function(){const r=o.apply(this,arguments);if(ST.on&&G.zone===ZID)try{drawGround();}catch(e){}return r;};}
  {const o=update;update=function(dt){
    if(!ST.on||G.zone!==ZID)return o.apply(this,arguments);
    let d=dt*speed();
    if(ST.paused){if(ST.step>0){d=ST.step;ST.step=0;}else{camHold();return;}}
    pre(d);const r=o.call(this,d);post(d);camHold();return r;};}
}
function recHit(h){const k=h.k+'|'+Math.round(h.x)+'|'+Math.round(h.y)+'|'+(h.a||0).toFixed(2)+'|'+(h.r||h.len);const now=time;
  if(ST.hits.some(q=>q.key===k&&now-q.t<.05))return;h.key=k;h.t=now;ST.hits.push(h);if(ST.hits.length>40)ST.hits.shift();}

/* ================= per-tick control ================= */
function pre(d){
  const e=ST.mob;
  if(G.god!==!!ST.god)G.god=!!ST.god;
  // player: face the target, pace when "walk" is chosen
  if(ST.poseRun==='pwalk'){const t=time%2.4;const want=t<1.2?'d':'a';if(keyHeld!==want){keysOff();keys[want]=true;keyHeld=want;}}
  else if(keyHeld)keysOff();
  if(!P.dead&&!keyHeld&&e&&!e.dead&&!P.swing&&!P.casting)P.face=Math.atan2(e.y-P.y,e.x-P.x);
  if(ST.autoAtk&&!P.dead&&e&&!e.dead&&P.atkCd<=0&&!P.casting){G.lastInput='touch';try{basicAttack();}catch(er){}}
  if(!e||e.dead)return;
  e._pw=e.wind;                                    // engine wind-up state before this tick (edge detection in post)
  // monster control
  const fight=ST.mode==='fight'||(ST.act&&ST.act.k==='mobAtk');
  if(ST.poseRun==='mwalk'){const sp=(e.m&&e.m.sp||60)*(e.st&&e.st.slow?.45:1)*((e.st&&(e.st.stun||e.st.root))||e.wfrz>time?0:1);
    ST.walkDir=ST.walkDir||-1;e.x+=ST.walkDir*sp*d;if(e.x<ST.mobHome.x-90)ST.walkDir=1;if(e.x>ST.mobHome.x+90)ST.walkDir=-1;e.face=ST.walkDir>0?0:Math.PI;}
  if(!fight){e.aggro=false;e.wind=0;e.atkCd=Math.max(e.atkCd||0,1);e.castCd=9;e.calmT=0;e.wanderT=99;e.wx=e.x;e.wy=e.y;}
  else{if(!e.aggro){e.aggro=true;e.alertT=0;}
    if(ST.act&&ST.act.k==='mobAtk'&&!ST.act.started&&!(e.st&&e.st.stun)){ST.act.started=true;
      if(e.m.rng){try{enemyShoot(e);ev('shoot',{});}catch(er){}ST.act.doneT=time+.6;}
      else{e.wind=e.windT||.42;e.atkAng=Math.atan2(P.y-e.y,P.x-e.x);e.face=e.atkAng;}}}
}
function post(d){
  const e=ST.mob;
  // wind-up / strike edges (read from the engine schedule)
  if(e&&!e.dead){
    if(e.wind>0&&!(e._pw>0)){ST.lastWind=time;ev('wind',{dur:e.windT||.42,frame:subjFrameText()});}
    if(e._pw>0&&e.wind<=0){if(e.strikeT>0||e.lunge>0){ev('strike',{frame:subjFrameText(),ang:e.atkAng});if(ST.act&&ST.act.k==='mobAtk')ST.act.doneT=time+.3;}else{ev('cancel',{why:(e.st&&e.st.stun)?'stun':'interrupt'});if(ST.act&&ST.act.k==='mobAtk')ST.act.doneT=time+.2;}}
    if(ST.mode!=='fight'&&!(ST.act&&ST.act.k==='mobAtk')){e.aggro=false;e.wind=0;}
  }
  if(ST.act&&ST.act.doneT&&time>=ST.act.doneT){const k=ST.act.k;ST.act=null;if(ST.loop&&ST.poseRun==='mattack')ST.repeatT=time+.6;}
  if(!ST.act&&ST.loop&&ST.poseRun==='mattack'&&ST.repeatT&&time>=ST.repeatT){ST.repeatT=0;mobAttackOnce();}
  // player swing edges
  if(P.swing&&P.swing!==ST._sw){ST._sw=P.swing;ST.lastSwing={t:time,type:P.swing.type,dur:P.swing.dur,wind:P.swing.wind||0};ev('swing',{type:P.swing.type,dur:P.swing.dur,wind:P.swing.wind||0,chain:P.chain});}
  if(!P.swing)ST._sw=null;
  if(ST.poseRun==='pattack'&&ST.loop&&!P.swing&&P.atkCd<=0&&!P.dead){ST.pRepT=ST.pRepT||time+.45;if(time>=ST.pRepT){ST.pRepT=0;P.chain=0;P.lastAtk=0;G.lastInput='touch';try{basicAttack();}catch(er){}}}
  // player DoT-death test: once the first poison tick lands, leave about 3 ticks of HP
  try{if(ST.pDotKill&&ST._php!=null&&P.hp<ST._php&&P.pz&&P.pz.active()&&!P.dead){P.hp=Math.max(1,Math.min(P.hp,Math.round((ST._php-P.hp)*3)));ST.pDotKill=false;}}catch(_){}
  ST._php=P.hp;
  // monster death → respawn
  if((!e||e.dead)&&ST.autoRespawn){if(ST.deadT==null)ST.deadT=time;if(time-ST.deadT>2.5)spawnMob();}
  ST.labels=ST.labels.filter(l=>time-l.t<.9);ST.hits=ST.hits.filter(h=>time-h.t<.45);
}
function camHold(){
  const e=ST.mob,mx=e&&!e.dead?e.x:ST.mobHome.x,my=e&&!e.dead?e.y:ST.mobHome.y;
  CAM.zt=ST.zoom;CAM.z=ST.zoom;try{camSync();}catch(_){}
  const fx=(P.x+mx)/2,fy=(P.y+my)/2-20,mob=document.body.classList.contains('mobile')||innerWidth<760;
  const sheetPx=ST.ui&&ST.sheetOpen?(mob?Math.min(innerHeight*.46,ST.ui.sheet.offsetHeight+56):0):0;
  const sidePx=ST.ui&&ST.sheetOpen&&!mob?Math.min(380,innerWidth*.34):0;
  const z=camZ(),ct=camT();
  cam.x=fx-VW/2+(sidePx/2)/z;cam.y=fy-VH/2+(sheetPx/2)/(z*ct);
}

/* ================= scene actions ================= */
function equipTest(t){if(P.weapon&&P.weapon.t===t)return false;try{P.weapon=makeWeapon(t,Math.max(1,P.lvl),0);P.weapon.name=(WEAPONS[t]?WEAPONS[t].n:t)+' (ทดลองใน Studio)';recalc();}catch(e){note('เปลี่ยนอาวุธไม่ได้: '+e.message);return false;}return true;}
function playerAttackOnce(first){if(first){P.chain=0;P.lastAtk=0;}if(P.dead){note('ผู้เล่นตายอยู่ — กดชุบชีวิตก่อน');return;}P.atkCd=0;G.lastInput='touch';try{basicAttack();}catch(e){note('basicAttack: '+e.message);}}
function mobAttackOnce(){const e=ST.mob;if(!e||e.dead){note('ไม่มีมอนสเตอร์');return;}
  const reach=attackR(e)+e.sz+P.r;const dP=Math.hypot(e.x-P.x,e.y-P.y);if(dP>reach){const a=Math.atan2(e.y-P.y,e.x-P.x);e.x=P.x+Math.cos(a)*(reach-8);e.y=P.y+Math.sin(a)*(reach-8);}
  ST.act={k:'mobAtk',started:false,doneT:0};}
function castFirstSkill(id){if(P.dead)return;G.lastInput='touch';id=id||Object.keys(P.skills||{}).find(k=>SK[k]);if(!id){note('ตัวละครนี้ยังไม่มีสกิล');return;}
  P.mp=P.maxMp;try{P.cds&&(P.cds[id]=0);}catch(e){}const r=castSkill(id);ev('skill',{id,name:SK[id]&&SK[id].name,ok:r!==false});}
function knockMob(){const e=ST.mob;if(!e||e.dead)return;try{hitEnemy(e,.3,{dt:'phys',kb:180});}catch(er){note('hitEnemy: '+er.message);}}
function killMob(){const e=ST.mob;if(!e||e.dead)return;const im=ST.mobImmortal;ST.mobImmortal=false;e.hp=1;try{hitEnemy(e,1,{dt:'phys'});}catch(er){}if(!e.dead){try{killEnemy(e);}catch(_){}}ST.mobImmortal=im;}
function scenario(k){const e=ST.mob;
  if(k==='interrupt'){if(!e||e.dead)return;mobAttackOnce();const w=(e.windT||.42)*.5;timers.push({t:w+.02,fn:()=>{try{applySt(e,{stun:1.5},{dt:'phys'});ev('status',{s:'stun',to:'mob',note:'กลางท่าง้าง'});}catch(er){}}});note('สั่งโจมตี แล้วสตันกลางท่าง้าง ('+f2(w)+' วิ) — ดูว่าดาเมจถูกยกเลิก');}
  else if(k==='combo'){ST.autoAtk=false;let n=0;const go=()=>{if(!ST.on||n>=5)return;if(P.atkCd<=0&&!P.dead){playerAttackOnce();n++;}timers.push({t:.05,fn:go});};go();note('โจมตีต่อเนื่อง 5 ครั้งด้วยระบบ combo จริง');}
  else if(k==='dotDeath'){if(!e||e.dead)spawnMob();const m=ST.mob;ST.mobImmortal=false;ST.dotKill={e:m};try{applySt(m,{poison:6},{dt:'phys'});applySt(m,{burn:6},{dt:'phys'});}catch(er){}ev('status',{s:'poison+burn',to:'mob'});note('พิษ + เผาไหม้, ปิด “ไม่ตาย” · HP จะถูกตั้งให้เหลือประมาณ 4 ติ๊กของ DoT แรก — รอดูตายจาก DoT');paint(true);}
  else if(k==='pDot'){if(P.dead)revivePlayer();ST.god=false;applyPStatus('poison');ST.pDotKill=true;note('ผู้เล่นติดพิษ, ปิดอมตะ · หลังติ๊กพิษแรก HP จะเหลือประมาณ 3 ติ๊ก — ดูตายระหว่างติดสถานะ');paint(true);}
}

/* ================= poses ================= */
function poseTable(){
  const out={};const S=ST.subject;
  const set=(k,st,note,run)=>out[k]={st,note:note||'',run};
  if(S==='player'){
    const wt=P.weapon&&P.weapon.t;
    set('idle','engine','ตัวละคร 3D-พิกเซลของเกม (ไม่ใช่เฟรมภาพ)',()=>{ST.poseRun=null;ST.autoAtk=false;});
    set('walk','engine','เดินไป-กลับด้วยระบบเดินจริง',()=>{ST.poseRun='pwalk';});
    set('run','none','ยังไม่มี — เกมมีแต่ dash');
    set('jump','none','ยังไม่มี — กระโดดมีเฉพาะระหว่างสกิลพุ่ง');
    set('windup','engine',(wt==='greatsword'||wt==='axe')?'ท่าง้างของ '+WEAPONS[wt].n:'จะเปลี่ยนเป็น Greatsword ทดลอง',()=>{if(!(wt==='greatsword'||wt==='axe'))equipTest('greatsword');ST.poseRun='pattack';playerAttackOnce(true);});
    set('slash','engine',(wt==='sword'||wt==='dagger'||wt==='axe'||wt==='greatsword')?'ฟันด้วย '+WEAPONS[wt].n:'จะเปลี่ยนเป็น Sword ทดลอง',()=>{if(!(wt==='sword'||wt==='dagger'||wt==='axe'||wt==='greatsword'))equipTest('sword');ST.poseRun='pattack';playerAttackOnce(true);});
    set('thrust','engine',(wt==='spear'||wt==='dagger')?'แทงด้วย '+WEAPONS[wt].n:'จะเปลี่ยนเป็น Spear ทดลอง',()=>{if(!(wt==='spear'||wt==='dagger'))equipTest('spear');ST.poseRun='pattack';playerAttackOnce(true);});
    set('ranged','engine',(wt==='bow'||wt==='gun'||wt==='book')?'ยิงด้วย '+WEAPONS[wt].n:'จะเปลี่ยนเป็น Bow ทดลอง',()=>{if(!(wt==='bow'||wt==='gun'||wt==='book'))equipTest('bow');ST.poseRun='pattack';playerAttackOnce(true);});
    const sk=Object.keys(P.skills||{}).filter(k=>SK[k]);
    if(sk.length)set('skill','engine','ร่ายสกิล '+SK[sk[0]].name+' (เลือกสกิลอื่นในแท็บต่อสู้)',()=>{ST.poseRun=null;castFirstSkill(sk[0]);});else set('skill','none','ยังไม่มีสกิลที่เรียนแล้ว');
    set('hurt','engine','มอนสเตอร์ตีเรา 1 ครั้ง (แฟลช + จอแดง)',()=>{ST.poseRun=null;mobAttackOnce();});
    set('knock','none','ยังไม่มี — ผู้เล่นไม่มีการกระเด็นในระบบ');
    set('fall','none','ยังไม่มี');
    set('death','none','ยังไม่มีแอนิเมชันตาย (ตัวละครหายไป + เอฟเฟกต์) · ทดสอบการตายได้ในแท็บต่อสู้');
  }else{
    const e=ST.mob,art=hasArt(e),m=e&&e.m||MOBS[ST.mobType]||{};
    if(art){
      set('idle','frames','คลิป idle '+SPR(e).baseN('idle')+' เฟรม'+(sprDirs(e)?' × '+sprDirs(e).length+' ทิศ':''),()=>{ST.poseRun='mframes';SPR(e).force(e,'idle',!ST.loop);});
      set('walk','frames','คลิป move '+SPR(e).baseN('move')+' เฟรม'+(sprDirs(e)?' × '+sprDirs(e).length+' ทิศ ('+(SPR(e).data.moveNote||'เดินสลับเท้า')+')':' (กระโดดไปข้างหน้า)'),()=>{ST.poseRun='mframes';SPR(e).force(e,'move',!ST.loop);});
      set('run','none','ยังไม่มี');
      set('jump','none',sprDirs(e)?'ยังไม่มี':'ยังไม่มีคลิปแยก — การกระโดดอยู่ในคลิป move');
      const RD=SPR(e).slotReady();
      if(RD.attack){set('windup','frames','ช่องโจมตี: ช่วงง้าง (ยืดตามเวลาง้างจริง)',()=>{ST.poseRun='mattack';mobAttackOnce();});set('slash','frames','ช่องโจมตี: จังหวะตี (เฟรมแรก = จังหวะดาเมจ)',()=>{ST.poseRun='mattack';mobAttackOnce();});}
      else{set('windup','none','ยังไม่มี · ช่องเตรียมไว้แล้ว รออาร์ต · ตอนนี้ค้างท่ายืน ระบบยังเตือนและตีตามจังหวะเดิม');
      set('slash','none','ยังไม่มี · ช่องเตรียมไว้แล้ว รออาร์ต · ระหว่างโจมตีค้างท่ายืน (ไม่ใช้ท่าเดินแทน)');}
      set('thrust','none','ยังไม่มี');set('ranged','none','ยังไม่มี (มอนสเตอร์ประชิด)');set('skill','none','ยังไม่มี');
      if(RD.hurt)set('hurt','frames','ช่องโดนตี',()=>{ST.poseRun=null;playerAttackOnce(true);});else set('hurt','none','ยังไม่มี · ช่องเตรียมไว้แล้ว รออาร์ต · ตอนนี้ระบบแฟลชขาว');
      set('knock','none','ยังไม่มีภาพ · ระบบยังผลักตัวตามแรงกระเด็น');
      set('fall','none','ยังไม่มี');
      if(RD.death)set('death','frames','ตาย '+SPR(e).baseN('death')+' เฟรม เล่นครั้งเดียว ค้างเฟรมสุดท้ายแล้วจาง (ภาพค้างหลังมอนหายจากระบบ)',()=>{ST.poseRun=null;killMob();});else set('death','none','ยังไม่มี · ช่องเตรียมไว้แล้ว รออาร์ต · ตอนนี้เอฟเฟกต์วิญญาณสลายแล้วตัวหายไป');
    }else{
      const E='เอฟเฟกต์ระบบ · ภาพชั่วคราวของเกม (ไม่ใช่เฟรม)';
      set('idle','engine',E,()=>{ST.poseRun=null;});
      set('walk','engine','เดินไป-กลับ · '+E,()=>{ST.poseRun='mwalk';});
      set('run','none','ยังไม่มี');set('jump','none','ยังไม่มี');
      if(!m.rng){set('windup','engine','โค้งเตือนก่อนตี · '+E,()=>{ST.poseRun='mattack';mobAttackOnce();});set('slash','engine','โจมตีประชิด (พุ่ง) · '+E,()=>{ST.poseRun='mattack';mobAttackOnce();});set('ranged','none','ยังไม่มี');}
      else{set('windup','none','ยังไม่มี (ตัวยิงไกลไม่มีท่าง้าง)');set('slash','none','ยังไม่มี');set('ranged','engine','ยิงกระสุน · '+E,()=>{ST.poseRun='mattack';mobAttackOnce();});}
      set('thrust','none','ยังไม่มี');set('skill','none','ยังไม่มี');
      set('hurt','engine','แฟลชขาว · '+E,()=>{ST.poseRun=null;playerAttackOnce();});
      set('knock','engine','ถูกผลักตามแรงกระเด็น · '+E,()=>{ST.poseRun=null;knockMob();});
      set('fall','none','ยังไม่มี');
      set('death','engine','วิญญาณสลาย · '+E,()=>{ST.poseRun=null;killMob();});
    }
  }
  return out;}
function choosePose(k){const T=poseTable()[k];if(!T||!T.run){note((POSES.find(p=>p[0]===k)||[k,k])[1]+': '+(T?T.note:'ยังไม่มี'));return;}
  if(SPR(ST.mob))SPR(ST.mob).unforce(ST.mob);
  if(ST.poseRun==='mwalk'&&ST.mob){ST.mob.x=ST.mobHome.x;ST.mob.y=ST.mobHome.y;}
  ST.poseRun=null;ST.pose=k;keysOff();T.run();paint(true);}

/* ================= statuses ================= */
const MSTAT=[['poison','พิษ'],['burn','เผาไหม้'],['slow','สโลว์'],['stun','สตัน'],['freeze','แช่แข็ง'],['root','ตรึง'],['fear','หวาดกลัว'],['silence','ใบ้'],['armorBreak','เกราะแตก'],['bleed','เลือดไหล']];
const PSTAT=[['poison','พิษ',true],['curse','คำสาป',true],['burn','เผาไหม้',false],['slow','สโลว์',false],['stun','สตัน',false],['freeze','แช่แข็ง',false]];
function applyMStatus(k){const e=ST.mob;if(!e||e.dead){note('ไม่มีมอนสเตอร์');return;}const d=Math.max(.5,+ST.stDur||5);
  try{
    if(k==='freeze'){e.wfrz=time+d;e.st.stun=Math.max(e.st.stun||0,d);e.wind=0;}
    else if(k==='bleed'){if(typeof wBleed==='function')wBleed(e,{dur:d,pct:.02});else{note('ระบบเลือดไหลเรียกใช้ไม่ได้');return;}}
    else applySt(e,{[k]:d},{dt:'phys'});
    ev('status',{s:k,to:'mob',d});note('ใส่สถานะ '+k+' ให้มอนสเตอร์ ('+d+' วิ)');}catch(er){note('ใส่สถานะไม่ได้: '+er.message);}
  paint(true);}
function applyPStatus(k){const d=Math.max(.5,+ST.stDur||5);
  try{C182.api.units();
    if(k==='poison'){const src=ST.mob&&!ST.mob.dead?ST.mob:{type:'studio',atk:Math.max(10,P.maxHp*.2),m:{rng:false}};C182.api.S.playerPoison(src,false);}
    else if(k==='curse'){P.curse.apply(undefined,d,time);}
    else{note('ระบบยังไม่รองรับสถานะนี้กับผู้เล่น');return;}
    ev('status',{s:k,to:'player',d});note('ใส่สถานะ '+k+' ให้ผู้เล่น');}catch(er){note('ใส่สถานะไม่ได้: '+er.message);}paint(true);}
function mobStatusRows(e){const rows=[];if(!e||e.dead)return rows;const st=e.st||{};
  const left=v=>typeof v==='number'?v:(v&&v.t);
  for(const [k,n] of MSTAT){let rem=null,stk=null,eff='';
    if(k==='poison'){if(e.pz&&e.pz.active()){stk=e.pz.stacks.length;rem=Math.max(...e.pz.stacks.map(s=>s.expires-time));const tb=e.pz.stacks.reduce((a,s)=>a+s.tickBase,0);eff='~'+fi(tb)+'/วิ ก่อนหักเกราะ · ทุก 1 วิ';}}
    else if(k==='freeze'){if(e.wfrz>time){rem=e.wfrz-time;eff='ขยับ/โจมตีไม่ได้ (ทำงานผ่านสตัน)';}}
    else if(k==='bleed'){if(e.wbld&&e.wbld.t>time){rem=e.wbld.t-time;eff=fi((e.wbld.pct||0)*100)+'% MaxHP ต่อวิ';}}
    else if(st[k]!=null){rem=left(st[k]);
      eff=k==='burn'?('~'+fi(st[k].dps*.5)+' ทุก 0.5 วิ ก่อนหักเกราะ'):k==='slow'?('ความเร็ว ×0.45 ('+fi(e.sp)+'→'+fi(e.sp*.45)+')'):k==='stun'?'ขยับ/โจมตีไม่ได้ · ยกเลิกท่าง้าง':k==='root'?'เดินไม่ได้ (ยังโจมตีได้)':k==='fear'?'วิ่งหนีผู้เล่น':k==='silence'?'ยิง/ร่ายระยะไกลไม่ได้':k==='armorBreak'?'DEF ในสูตรดาเมจ ×0.5 ('+f1(e.def)+'→'+f1(e.def*.5)+')':'';}
    if(rem!=null&&rem>0)rows.push({k,n,rem,stk,eff});}
  return rows;}
function playerStatusRows(){const rows=[];try{C182.api.units();
  if(P.pz&&P.pz.active()){const s=P.pz.stacks;rows.push({k:'poison',n:'พิษ',stk:s.length,rem:Math.max(...s.map(q=>q.expires-time)),eff:'ดาเมจทุก 1 วิ ต่อชั้น'});}
  const cv=P.curse.value(time);if(cv>0)rows.push({k:'curse',n:'คำสาป',rem:P.curse.expires-time,eff:'ฮีล −'+fi(cv*100)+'%'});
  for(const id in (P.buffs||{})){const b=P.buffs[id];const rem=b&&(b.t!=null?b.t:(b.until!=null?b.until-time:null));rows.push({k:'buff:'+id,n:'บัฟ '+(SK[id]?SK[id].name:id),rem,eff:Object.keys(b||{}).filter(x=>x!=='t'&&x!=='until').slice(0,4).join(', ')});}}catch(e){}
  return rows;}
function clearAllStatus(){if(ST.stTarget==='mob')clearMobStatus(ST.mob);else clearPlayerStatus();ev('status',{s:'clear',to:ST.stTarget});note('ล้างสถานะทั้งหมดแล้ว');paint(true);}

/* ================= stats ================= */
function playerStats(){const K=C182.api.K,A=C182.api;let crit=null,atk=null,matk=null,mdef=null,hit=null;
  try{atk=A.atkOf('phys');matk=A.atkOf('mag');mdef=A.playerMdef();hit=A.playerHit();crit=K.critChance(P.stats.dex||0,(B('crit')||0)/100,0)*100;}catch(e){}
  const W_=WEAPONS[P.weapon&&P.weapon.t]||{};let aspd=null;try{aspd=Math.min(8,W_.aspd*P.aspdF*(1+B('aspd')));}catch(e){}
  return [['Lv',P.lvl,'lvl'],['HP',fi(P.hp)+' / '+fi(P.maxHp),'hp'],['MP',fi(P.mp)+' / '+fi(P.maxMp),'mp'],['ATK',fi(atk)],['MATK',fi(matk)],['DEF',f1(P.def)],['MDEF',f1(mdef)],['HIT',f1(hit)],['คริติคอล',f1(crit)+'%'],
    ['ความเร็วโจมตี',f2(aspd)+' ครั้ง/วิ'],['ความเร็วเดิน',fi(P.speed)],['อาวุธ',(P.weapon&&P.weapon.name)||'—'],
    ['STR',P.stats.str,'str'],['AGI',P.stats.agi,'agi'],['VIT',P.stats.vit,'vit'],['INT',P.stats.int,'int'],['DEX',P.stats.dex,'dex'],['LUK',P.stats.luk,'luk']];}
function mobStats(){const e=ST.mob;if(!e||e.dead)return [['สถานะ','ตาย / ไม่มี']];let reach=null,det=null;try{reach=attackR(e)+e.sz+P.r;det=detectR(e);}catch(_){}
  return [['ชนิด',e.m.n+' ('+e.type+')'],['Lv',e.L,'mlv'],['HP',fi(e.hp)+' / '+fi(e.maxHp),'mhp'],['ATK',fi(e.atk),'matk'],['DEF',f1(e.def),'mdef'],['MDEF',f1(e.mdef)],['EVA',f1(e.eva)],['ความเร็ว',fi(e.sp),'msp'],
    ['ระยะตี (reach)',fi(reach)+' px'],['เวลาง้าง',f2(e.windT||.42)+' วิ'],['ธาตุ',e.elem||'—'],['คริติคอล','— (ระบบไม่มีคริมอนสเตอร์)'],['ขนาด sz / ชน',fi(e.sz)+' / '+f1(e.sz*.7)]];}
function editStat(key,val){val=+val;if(!isFinite(val))return;
  if(key==='lvl'){P.lvl=Math.max(1,Math.min(255,Math.round(val)));try{recalc();}catch(e){}restoreHpMp();}
  else if(['str','agi','vit','int','dex','luk'].includes(key)){P.stats[key]=Math.max(1,Math.round(val));try{recalc();}catch(e){}}
  else if(key==='hp')P.hp=Math.max(1,Math.min(P.maxHp,val));else if(key==='mp')P.mp=Math.max(0,Math.min(P.maxMp,val));
  else if(key==='mlv'){ST.mobLv=Math.max(1,Math.round(val));spawnMob();}
  else if(ST.mob&&!ST.mob.dead){const e=ST.mob;if(key==='mhp')e.hp=Math.max(1,Math.min(e.maxHp,val));else if(key==='matk')e.atk=Math.max(0,val);else if(key==='mdef')e.def=Math.max(0,val);else if(key==='msp')e.sp=Math.max(0,val);}
  paint(true);}

/* ================= skill hit areas (read from the real skill code / live skill objects; drawing only) =================
   acc 'exact'  = same centre, radius and condition the code uses (enemy is hit when its centre is within r + its own size e.sz)
   acc 'approx' = only the reach is known (direction or placement decided later / randomly) — labelled โดยประมาณ
   acc 'none'   = the skill has no hit area (buff / heal / movement) or the shape cannot be read — labelled แสดงไม่ได้ */
const SKA={last:null,timed:[]};
function recordSkill(id,s,tgt,px,py,ang){
  const T=(o)=>{o.t0=time;SKA.timed.push(o);if(SKA.timed.length>30)SKA.timed.shift();};
  const name=s.name||id;let acc='exact',desc='';
  const live='ติดตามวัตถุสกิลจริงระหว่างทำงาน';
  switch(s.type){
    case 'slash':case 'execute':desc='กรวยรอบตัว รัศมี '+s.r+' มุม '+f2(s.arc)+' rad — จับจากการตรวจจริง (inSector)';break;
    case 'line':desc='แนวตรง ยาว '+s.len+' กว้าง '+s.w+' — จับจากการตรวจจริง (inLine)';break;
    case 'nova':T({k:'circle',x:px,y:py,r:s.r,dur:.6,plusSz:true,col:'#ffd36b'});desc='วงกลมรอบตัว r '+s.r+' + ขนาดเป้า (ตรวจครั้งเดียวตอนร่าย)';break;
    case 'burst':if(tgt)T({k:'circle',x:tgt.x,y:tgt.y,r:s.r,dur:.6,plusSz:true,col:'#ffd36b'});desc='วงกลมที่จุดเล็ง r '+s.r+' + ขนาดเป้า';break;
    case 'chain':T({k:'circle',x:px,y:py,r:s.range,dur:.8,col:'#9be8ff',dash:[6,6]});desc='กระโดดหาเป้าใกล้สุดในรัศมี '+s.range+' จากตัว จากนั้นรัศมี 280 จากเป้าก่อนหน้า สูงสุด '+s.n+' เป้า (วัดจากจุดกลางเป้า)';break;
    case 'proj':case 'boomerang':desc='กระสุนจริง: โดนเมื่อระยะถึงเป้า < ขนาดกระสุน + ขนาดเป้า'+(s.aoe?' · ระเบิด r '+s.aoe:'')+(s.n>1?' · '+s.n+' ลูก':'')+' — '+live;break;
    case 'ground':case 'trap':desc=(s.type==='trap'?'กับดัก: ทำงานเมื่อเป้าเข้าใน r×0.55, ดาเมจ r ':'พื้นที่ค้าง r ')+s.r+' + ขนาดเป้า — '+live;break;
    case 'meteor':desc='ตกที่จุดเล็ง r '+s.r+' + ขนาดเป้า'+(s.n>1?' · '+s.n+' ลูก กระจายสุ่มในรัศมี '+(s.spreadR||150)+' (ตำแหน่งสุ่ม)':'')+' — '+live;break;
    case 'dash':desc=s.back?'ถอยหลัง ไม่มีดาเมจ':'พุ่ง: โดนเมื่อเป้าอยู่ใน 40 + ขนาดเป้า รอบตัวระหว่างพุ่ง — '+live;if(s.back)acc='none';break;
    case 'leap':desc='กระโดดลงที่จุดเล็ง: วง r '+s.r+' + ขนาดเป้าตอนลงพื้น — '+live;break;
    case 'spin':desc='หมุนรอบตัว r '+s.r+' + ขนาดเป้า ทุกช่วงติ๊ก — '+live;break;
    case 'summon':desc='ดาเมจมาจากตัวอัญเชิญ: แต่ละตัวหาเป้าในรัศมี 420 รอบตัวมัน (วงประ)';break;
    case 'custom':{const fx=s.fx;
      if(fx==='raid'){T({k:'circle',x:px,y:py,r:s.r,dur:.6,plusSz:true,col:'#ffd36b'});desc='วงกลมรอบตัว r '+s.r+' + ขนาดเป้า';}
      else if(fx==='sonic'||fx==='snatch')desc='กรวยหน้าตัว — จับจากการตรวจจริง (inSector)';
      else if(['shadowStep','ambush','backstab','confine','markTarget'].includes(fx)){const sel=fx==='markTarget'?260:240;
        if(tgt)T({k:'circle',x:tgt.x,y:tgt.y,r:sel,dur:.8,col:'#c79bff',dash:[4,6]});T({k:'circle',x:px,y:py,r:s.range,dur:.8,col:'#c79bff',dash:[10,6]});
        desc='เป้าเดียว: ตัวที่ใกล้จุดเล็งสุดในรัศมี '+sel+' ถ้าไม่มี ใช้ตัวใกล้สุดในระยะ '+s.range+' จากตัว';}
      else if(fx==='overwatch'){T({k:'circle',x:px,y:py,r:s.range,dur:s.dur||5,plusSz:true,follow:1,col:'#ffd36b',dash:[8,6]});desc='ยิงอัตโนมัติใส่ตัวใกล้สุดในระยะ '+s.range+' + ขนาดเป้า ทุก 0.45 วิ';}
      else if(fx==='eclipse'){T({k:'line',x:px,y:py,a:ang,len:s.len,w:s.w,dur:s.charge||1,col:'#c98cff',dash:[6,6]});acc='approx';desc='โดยประมาณ: แนวยิงตอนเริ่มชาร์จ (ยาว '+s.len+' กว้าง '+s.w+') — ทิศจริงคำนวณใหม่ตอนยิง และแนวที่ยิงจริงจะแสดงจากการตรวจจริง';}
      else if(fx==='rift'){desc='โดนทุกตัวที่อยู่ในจอตอนร่าย (ไม่มีรูปทรงให้วาด)';}
      else if(['stealth','blink','illusion'].includes(fx)){acc='none';desc='ไม่มีพื้นที่ตี';}
      else{acc='none';desc='แสดงไม่ได้ — อ่านรูปทรงจากโค้ดสกิลนี้ไม่ได้';}
      break;}
    case 'buff':case 'heal':case 'revive':case 'dome':case 'blink':case 'passive':acc='none';desc='ไม่มีพื้นที่ตี ('+s.type+')';break;
    default:
      if(s.r>0){T({k:'circle',x:px,y:py,r:s.r,dur:.8,col:'#aaa',dash:[2,6]});acc='approx';desc='โดยประมาณ: ใช้ค่า r '+s.r+' ของสกิล — ไม่ได้ยืนยันรูปทรงจากโค้ด';}
      else{acc='none';desc='แสดงไม่ได้ — ชนิดสกิล '+s.type+' ไม่มีรูปทรงที่อ่านได้';}
  }
  SKA.last={id,name,type:s.type,acc,desc,t:time};ev('skillArea',{id,acc});}
function drawSkillAreas(c){
  const circ=(x,y,r,col,dash,fillA)=>{c.beginPath();c.arc(x,y,Math.max(1,r),0,TAU);if(fillA){c.globalAlpha=fillA;c.fillStyle=col;c.fill();c.globalAlpha=1;}c.setLineDash(dash||[]);c.strokeStyle=col;c.lineWidth=2;c.stroke();c.setLineDash([]);};
  // timed shapes recorded at cast
  SKA.timed=SKA.timed.filter(o=>time-o.t0<o.dur);
  for(const o of SKA.timed){const k=1-(time-o.t0)/o.dur,x=o.follow?P.x:o.x,y=o.follow?P.y:o.y;c.globalAlpha=.35+.5*k;
    if(o.k==='circle'){circ(x,y,o.r,o.col,o.dash,.10*k);}
    else{c.save();c.translate(x,y);c.rotate(o.a);c.setLineDash(o.dash||[]);c.strokeStyle=o.col;c.lineWidth=2;c.strokeRect(0,-o.w/2,o.len,o.w);c.restore();c.setLineDash([]);}}
  c.globalAlpha=.85;
  // live skill objects (exact fields used by the engine)
  for(const p of projs){if(p.team!=='p')continue;circ(p.x,p.y,p.size,'#ffe14a',[3,3]);if(p.aoe)circ(p.x,p.y,p.aoe,'#ff8a3d',[6,5]);
    const L=Math.max(0,p.life)*p.spd,a=Math.atan2(p.vy,p.vx);c.globalAlpha=.4;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x+Math.cos(a)*L,p.y+Math.sin(a)*L);c.strokeStyle='#ffe14a';c.setLineDash([2,6]);c.stroke();c.setLineDash([]);c.globalAlpha=.85;}
  for(const z of gfx){if(z.trap){circ(z.x,z.y,z.r*.55,'#c79bff',[4,4]);circ(z.x,z.y,z.r,'#ff4a6a',null,.08);}else{circ(z.x,z.y,z.r,z.m>0?'#ff4a6a':'#5effa0',[8,4],.08);if(z.pull)circ(z.x,z.y,z.r*1.3,'#9be8ff',[2,6]);}}
  for(const f of fx){if(f.k==='meteor'&&!f.hit){const k=Math.max(0,Math.min(1,f.t/f.fall));circ(f.x,f.y,f.r,'#ff4a6a',[6,4],.06+.18*k);}}
  if(P.dash){const d=P.dash;if(d.leap)circ(d.tx,d.ty,d.r,'#ff4a6a',[6,4],.12);else if(!d.back&&d.m)circ(P.x,P.y,40,'#ff4a6a',[4,4],.12);}
  if(P.spin)circ(P.x,P.y,P.spin.r,'#ff4a6a',[6,4],.1);
  try{for(const u of summons)circ(u.x,u.y,420,'#9be8ff',[2,8]);}catch(_){}
  try{if(B('aura')>0)circ(P.x,P.y,170,'#ffd36b',[2,6]);}catch(_){}
  c.globalAlpha=1;}

/* ================= overlays ================= */
function drawGround(){
  if(ST.clean)return;
  const c=ctx;c.save();
  const e=ST.mob,alive=e&&!e.dead;
  const circ=(x,y,r,col,dash,fill)=>{c.beginPath();c.arc(x,y,r,0,TAU);if(fill){c.fillStyle=fill;c.fill();}c.setLineDash(dash||[]);c.strokeStyle=col;c.lineWidth=2;c.stroke();c.setLineDash([]);};
  if(ST.ov.range){const W_=WEAPONS[P.weapon&&P.weapon.t];if(W_){c.globalAlpha=.55;c.beginPath();c.moveTo(P.x,P.y);c.arc(P.x,P.y,W_.range,P.face-.6,P.face+.6);c.closePath();c.strokeStyle='#7fd3ff';c.lineWidth=1.5;c.setLineDash([6,5]);c.stroke();c.setLineDash([]);}
    if(alive){let reach=0;try{reach=attackR(e)+e.sz+P.r;}catch(_){}c.globalAlpha=.6;circ(e.x,e.y,reach+18,'#ff9a5c',[8,6]);
      if(e.wind>0||e.strikeT>0||e.lunge>0){const a=e.atkAng||e.face;c.globalAlpha=.35;c.beginPath();c.moveTo(e.x,e.y);c.arc(e.x,e.y,reach+18,a-.75,a+.75);c.closePath();c.fillStyle=e.wind>0?'#ff9a5c':'#ff3a5a';c.fill();}}}
  if(ST.ov.detect&&alive){let det=0;try{det=detectR(e);}catch(_){}c.globalAlpha=.4;circ(e.x,e.y,det,'#ffe38a',[3,7]);}
  if(ST.ov.hurt){c.globalAlpha=.7;circ(P.x,P.y,P.r,'#5effa0',null,'rgba(94,255,160,.12)');if(alive)circ(e.x,e.y,e.sz,'#5effa0',null,'rgba(94,255,160,.12)');}
  if(ST.ov.coll){c.globalAlpha=.8;if(alive)circ(e.x,e.y,e.sz*.7,'#c79bff',[2,3]);circ(P.x,P.y,P.r*.8,'#c79bff',[2,3]);}
  if(ST.ov.skill)drawSkillAreas(c);
  if(ST.ov.hit)for(const h of ST.hits){const k=1-(time-h.t)/.45;c.globalAlpha=.25+.45*k;c.fillStyle='rgba(255,70,90,.28)';c.strokeStyle='#ff4a6a';c.lineWidth=2;
    if(h.k==='sector'){c.beginPath();if(h.arc>=TAU-.01)c.arc(h.x,h.y,h.r,0,TAU);else{c.moveTo(h.x,h.y);c.arc(h.x,h.y,h.r,h.a-h.arc/2,h.a+h.arc/2);c.closePath();}c.fill();c.stroke();}
    else{c.save();c.translate(h.x,h.y);c.rotate(h.a);c.fillRect(0,-h.w/2,h.len,h.w);c.strokeRect(0,-h.w/2,h.len,h.w);c.restore();}}
  c.restore();}
function cross(x,y,col){const c=ctx;c.save();c.strokeStyle=col;c.lineWidth=1.5;c.globalAlpha=.95;c.beginPath();c.moveTo(x-9,y);c.lineTo(x+9,y);c.moveTo(x,y-9);c.lineTo(x,y+9);c.stroke();c.beginPath();c.arc(x,y,3,0,TAU);c.stroke();c.restore();}
function drawMobAnchor(e){
  if(ST.clean)return;
  if(ST.ov.anchor&&!e.dead){const ay=e.y+e.sz*.35;cross(e.x,ay,'#ffe14a');
    if(hasArt(e)){const F=SPR(e).frameInfo(e);if(F&&F.drawn){const d=F.drawn;ctx.save();ctx.strokeStyle='rgba(255,225,74,.45)';ctx.setLineDash([4,4]);ctx.strokeRect(d.ax-(d.anchor||SPR(e).data.anchor)[0]*d.sc,d.ay-(d.anchor||SPR(e).data.anchor)[1]*d.sc,d.w,d.h);ctx.setLineDash([]);
      if(F.lift){ctx.strokeStyle='#7fd3ff';ctx.beginPath();ctx.moveTo(e.x+14,ay);ctx.lineTo(e.x+14,ay-F.lift*d.sc);ctx.stroke();}ctx.restore();}}}
  drawLabels();}
function drawPlayerAnchor(){if(ST.clean)return;if(ST.ov.anchor&&!P.dead)cross(P.x,P.y+10,'#ffe14a');}
function drawLabels(){const c=ctx;c.save();c.font='700 11px system-ui,sans-serif';c.textAlign='center';
  for(const l of ST.labels){const k=1-(time-l.t)/.9;c.globalAlpha=Math.max(0,k);c.fillStyle='rgba(10,12,20,.75)';const w=c.measureText(l.txt).width+8;c.fillRect(l.x-w/2,l.y-74-14+(1-k)*-10,w,16);c.fillStyle='#ffe14a';c.fillText(l.txt,l.x,l.y-74-2+(1-k)*-10);}
  c.restore();ST.labels.forEach(l=>l.drawn=1);}

/* ================= UI ================= */
const CSS=`
body.studio-on #banner,body.studio-on #touchUI,body.studio-on #dock,body.studio-on .glb,body.studio-on #tPots,body.studio-on #bar,body.studio-on #menu,body.studio-on #log,body.studio-on #orb,body.studio-on #hud,body.studio-on #hudPots,body.studio-on #hudTrayBtn,body.studio-on #hudTray,body.studio-on #hudMini,body.studio-on #r2tBtn,body.studio-on #r2tPanel,body.studio-on #bAuto,body.studio-on .hv-b,body.studio-on .hv-p{display:none!important}
#stu{position:fixed;inset:auto 0 0 0;z-index:80;font:12px/1.35 "Noto Sans Thai",system-ui,sans-serif;color:#eef2fb;pointer-events:none}
#stu *{box-sizing:border-box}
#stuBar{pointer-events:auto;display:flex;flex-wrap:nowrap;gap:4px;align-items:center;padding:6px calc(6px + env(safe-area-inset-right,0px)) calc(6px + env(safe-area-inset-bottom,0px)) calc(6px + env(safe-area-inset-left,0px));background:rgba(10,14,26,.96);border-top:1px solid #3c4a6a;overflow-x:auto}
#stuBar button{flex:0 0 auto;min-width:40px;height:40px;border-radius:10px;border:1px solid #55658a;background:#18213a;color:#eef2fb;font:600 14px system-ui;padding:0 9px}
#stuBar button.on{background:#ffd36b;color:#1a1204;border-color:#ffe3a0}
#stuInfo{flex:1 1 auto;min-width:120px;font:11px/1.25 ui-monospace,monospace;color:#cfe0ff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 4px}
#stuSheet{pointer-events:auto;background:rgba(12,16,30,.97);border-top:1px solid #3c4a6a;max-height:min(46vh,430px);overflow:auto;padding:8px 10px 10px}
#stuSheet[hidden]{display:none}
#stuTabs{display:flex;gap:4px;position:sticky;top:-8px;background:rgba(12,16,30,.98);padding:4px 0 6px;margin-top:-4px;z-index:1}
#stuTabs button{flex:1;height:34px;border-radius:9px;border:1px solid #44557a;background:#151d33;color:#cdd8f0;font:600 12px "Noto Sans Thai",system-ui}
#stuTabs button.on{background:#2e4b86;color:#fff;border-color:#7fa2e6}
.sr{display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin:0 0 7px}
.sr>label,.sr>span.l{color:#9fb0cf;min-width:62px}
#stu .b{height:34px;border-radius:9px;border:1px solid #55658a;background:#1a2440;color:#eef2fb;padding:0 10px;font:600 12px "Noto Sans Thai",system-ui}
#stu .b.on{background:#ffd36b;color:#1a1204;border-color:#ffe3a0}#stu .b.warn{border-color:#a8574a;background:#3a1a18}
#stu select,#stu input[type=number]{height:34px;border-radius:9px;border:1px solid #55658a;background:#0f1628;color:#eef2fb;padding:0 6px;font:12px system-ui;max-width:100%}
#stu input[type=number]{width:74px}
.pg{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:5px}
.pg button{min-height:46px;border-radius:10px;border:1px solid #4a5a80;background:#172038;color:#eef2fb;text-align:left;padding:4px 7px;font:600 12px "Noto Sans Thai",system-ui}
.pg button small{display:block;font-weight:400;font-size:10px;color:#9fb0cf;line-height:1.2}
.pg button.none{opacity:.55;border-style:dashed}.pg button.none small{color:#ffb4a0}
.pg button.frames{border-color:#5fd39a}.pg button.sel{outline:2px solid #ffd36b}
.kv{display:grid;grid-template-columns:auto 1fr;gap:3px 10px;font-size:12px}.kv b{color:#9fb0cf;font-weight:500}
.tl{width:100%;height:96px;background:#0a0f1c;border:1px solid #33415f;border-radius:8px;display:block}
.hint{color:#9fb0cf;font-size:11px;margin:2px 0 8px}.msg{color:#ffd36b;font-size:12px;min-height:16px;margin:0 0 6px}
.stl{width:100%;border-collapse:collapse;font-size:12px}.stl td{border-bottom:1px solid #222c45;padding:4px 3px;vertical-align:top}
@media (min-width:760px){body:not(.mobile) #stu{inset:0 0 0 auto;width:min(380px,34vw);display:flex;flex-direction:column-reverse}
 body:not(.mobile) #stuSheet{max-height:none;flex:1 1 auto;border-top:0;border-left:1px solid #3c4a6a}body:not(.mobile) #stuBar{flex-wrap:wrap;border-left:1px solid #3c4a6a;border-bottom:1px solid #3c4a6a}
 body:not(.mobile) #stuInfo{order:9;flex:1 1 100%;white-space:normal;padding:4px 2px 0}}
`;
function build(){
  if(ST.ui)return ST.ui;
  const st=document.createElement('style');st.id='stuCss';st.textContent=CSS;document.head.appendChild(st);
  const d=document.createElement('div');d.id='stu';d.setAttribute('role','region');d.setAttribute('aria-label','Animation & Combat Studio');
  d.innerHTML=`<div id="stuSheet"><div id="stuTabs" role="tablist">
     <button data-tab="pose">ท่า</button><button data-tab="mob">มอน</button><button data-tab="fight">ต่อสู้</button><button data-tab="stat">สเตตัส</button><button data-tab="status">สถานะ</button><button data-tab="view">แสดงผล</button></div>
     <div class="msg" id="stuMsg"></div><div id="stuBody"></div></div>
   <div id="stuBar">
     <button data-c="play" aria-label="เล่น/หยุด">⏸</button><button data-c="stepb" aria-label="เลื่อนทีละเฟรม">⏭</button>
     <button data-c="loop" aria-label="เล่นซ้ำ/ครั้งเดียว">🔁</button><button data-c="speed" aria-label="ความเร็ว">1×</button>
     <button data-c="clean" aria-label="ดูท่าชัด: ซ่อนเอฟเฟกต์ ตัวเลข ชื่อ และเส้นตรวจชั่วคราว">ดูท่าชัด</button><button data-c="zout" aria-label="ซูมออก">−</button><button data-c="zin" aria-label="ซูมเข้า">+</button>
     <div id="stuInfo">—</div>
     <button data-c="sheet" aria-label="พับ/กางแผง">▾</button><button data-c="exit" aria-label="ออกจาก Studio" style="border-color:#a8574a">✕</button></div>`;
  document.body.appendChild(d);
  const sheet=d.querySelector('#stuSheet');ST.ui={root:d,sheet,body:d.querySelector('#stuBody'),info:d.querySelector('#stuInfo'),msg:d.querySelector('#stuMsg')};
  d.addEventListener('click',onClick);d.addEventListener('change',onChange);
  d.addEventListener('input',ev=>{if(ev.target.id==='stuMobQ'){ST.mobQ=ev.target.value;paint(true);const i=document.getElementById('stuMobQ');if(i){i.focus();try{i.setSelectionRange(i.value.length,i.value.length);}catch(_){}}}});
  ['pointerdown','touchstart','mousedown','wheel'].forEach(t=>d.addEventListener(t,ev=>ev.stopPropagation(),{passive:true}));
  d.addEventListener('keydown',ev=>ev.stopPropagation());
  setInterval(()=>{if(ST.on)paint(false);},150);
  return ST.ui;}
function onClick(evn){const b=evn.target.closest('button');if(!b)return;
  if(b.dataset.tab){ST.tab=b.dataset.tab;paint(true);return;}
  const c=b.dataset.c;
  if(c==='play'){ST.paused=!ST.paused;}
  else if(c==='stepb'){ST.paused=true;ST.step=stepDt();}
  else if(c==='loop'){ST.loop=!ST.loop;if(ST.poseRun==='mframes'&&ST.mob&&ST.pose){const r=SPR(ST.mob).rec(ST.mob);if(r.force){r.force.once=!ST.loop;r.force.t0=time;}}}
  else if(c==='speed'){ST.speedI=(ST.speedI+1)%SPEEDS.length;}
  else if(c==='clean'){ST.clean=!ST.clean;note(ST.clean?'ดูท่าชัด: ซ่อนเอฟเฟกต์ ตัวเลข ชื่อ และเส้นตรวจ (การต่อสู้ยังทำงานจริง) — กดอีกครั้งเพื่อคืนค่า':'คืนการแสดงผลแบบรายละเอียดแล้ว');}
  else if(c==='zin'){ST.zoom=Math.min(4,+(ST.zoom*1.25).toFixed(2));}
  else if(c==='zout'){ST.zoom=Math.max(.6,+(ST.zoom/1.25).toFixed(2));}
  else if(c==='sheet'){ST.sheetOpen=!ST.sheetOpen;}
  else if(c==='exit'){exit();return;}
  const a=b.dataset.a;
  if(a){const [k,v]=a.split(':');
    if(k==='subj'){ST.subject=v;ST.stTarget=v==='player'?'player':'mob';ST.pose='auto';ST.poseRun=null;keysOff();}
    else if(k==='pose')choosePose(v);
    else if(k==='mob'){pickMob(v);ST.tab='pose';}
    else if(k==='dir'){ST.dir=v==='auto'?null:v;if(ST.mob&&sprDirs(ST.mob))SPR(ST.mob).forceDir(ST.mob,ST.dir);note(ST.dir?'ทิศภาพ: '+DIRNAME[ST.dir]+' (ทุกท่าใช้ทิศนี้)':'ทิศภาพตามเกมจริง (เวกเตอร์บนจอ)');}
    else if(k==='auto'){ST.pose='auto';ST.poseRun=null;keysOff();if(SPR(ST.mob))SPR(ST.mob).unforce(ST.mob);if(ST.mob){ST.mob.x=ST.mobHome.x;ST.mob.y=ST.mobHome.y;}}
    else if(k==='mode'){ST.mode=v;}
    else if(k==='patk')playerAttackOnce();else if(k==='pauto')ST.autoAtk=!ST.autoAtk;
    else if(k==='matk'){ST.poseRun='mattack';mobAttackOnce();}
    else if(k==='skill')castFirstSkill(v);
    else if(k==='god')ST.god=!ST.god;else if(k==='imm')ST.mobImmortal=!ST.mobImmortal;else if(k==='aresp')ST.autoRespawn=!ST.autoRespawn;
    else if(k==='scn')scenario(v);
    else if(k==='reset')resetScene();else if(k==='revive'){revivePlayer();if(!ST.mob||ST.mob.dead)spawnMob();note('ชุบชีวิตแล้ว');}
    else if(k==='heal'){restoreHpMp();note('คืน HP/MP แล้ว');}else if(k==='respawn'){spawnMob();}
    else if(k==='knock')knockMob();else if(k==='kill')killMob();
    else if(k==='sttgt')ST.stTarget=v;
    else if(k==='mst')applyMStatus(v);else if(k==='pst')applyPStatus(v);else if(k==='stclr')clearAllStatus();
    else if(k==='rstp')resetPlayerStats();else if(k==='rstm'){spawnMob();note('คืนค่ามอนสเตอร์เป็นค่าเริ่มของเลเวลนี้');}
    else if(k==='ov'){ST.ov[v]=!ST.ov[v];}
    else if(k==='slime'){const L_=(window.MON_SPRITES&&MON_SPRITES.list)||[],on=!L_.every(R=>R.cfg.enabled);L_.forEach(R=>R.enable(on));}
  }
  paint(true);}
function onChange(evn){const t=evn.target;
  if(t.id==='stuMob'){pickMob(t.value);}
  else if(t.id==='stuWpn'){if(t.value)equipTest(t.value);}
  else if(t.id==='stuSkillPick'){const id=t.value;if(id&&SK[id]){P.skills[id]=Math.max(1,P.skills[id]||0);castFirstSkill(id);}t.value='';}
  else if(t.id==='stuDur'){ST.stDur=+t.value||5;}
  else if(t.dataset.ed){editStat(t.dataset.ed,t.value);}
  paint(true);}
function stepDt(){const e=ST.mob;if(ST.subject==='mob'&&hasArt(e)){const F=SPR(e).frameInfo(e);if(F){const left=(F.t0+F.ms/1000)-F.u;return Math.max(1/240,left+1e-3);}}return 1/60;}
function infoLine(){const e=ST.mob;
  if(ST.subject==='mob'){if(!e||e.dead)return 'มอนสเตอร์: ตาย/ไม่มี';
    if(hasArt(e)){const F=SPR(e).frameInfo(e);if(F)return `${dirTxt(F)} · ${({idle:'ยืน',move:'เคลื่อนที่',atk_windup:'ง้าง',atk_strike:'ตี',atk_recover:'คืนท่า',hurt:'โดนตี'})[F.logical||F.clip]||F.clip} · เฟรม ${F.i+1}/${F.n} · ${F.ms}ms · t ${f2(F.u)}/${f2(F.tot)}s${F.lift?' · ลอย '+F.lift+'px':''}${F.forced?'':' · '+F.why}`;}
    return `${e.m.n} · ภาพชั่วคราว (ไม่มีเฟรม) · ง้าง ${f2(Math.max(0,e.wind))}s · พุ่ง ${f2(Math.max(0,e.lunge||0))}s`;}
  const s=P.swing;return `ผู้เล่น · ไม่มีเฟรม (procedural) · ${s?('ท่า '+s.type+' '+f2(s.t)+'/'+f2(s.dur)+'s'+(s.wind?' ง้าง '+f2(s.wind):'')):(P.casting?'กำลังร่าย':'พร้อม')} · combo ${P.chain||0}`;}
function paint(full){if(!ST.ui)return;const U=ST.ui;
  {const pb=U.root.querySelector('[data-c=play]');if(!pb)return;pb.textContent=ST.paused?'▶':'⏸';} /* merge m1: Studio panel is gone while exiting */
  const lb=U.root.querySelector('[data-c=loop]');lb.textContent=ST.loop?'🔁':'1×▶';lb.classList.toggle('on',!ST.loop);
  U.root.querySelector('[data-c=speed]').textContent=speed()+'×';
  {const cb=U.root.querySelector('[data-c=clean]');cb.classList.toggle('on',ST.clean);cb.textContent=ST.clean?'ดูท่าชัด ✓':'ดูท่าชัด';cb.setAttribute('aria-pressed',ST.clean?'true':'false');}U.root.querySelector('[data-c=sheet]').textContent=ST.sheetOpen?'▾':'▴';
  U.sheet.hidden=!ST.sheetOpen;U.info.textContent=(ST.paused?'⏸ ':'')+infoLine();
  U.msg.textContent=ST.msg&&performance.now()-ST.msgT<6000?ST.msg:'';
  U.root.querySelectorAll('#stuTabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab===ST.tab));
  if(ST.tab==='fight')drawTimeline();
  if(!full){liveBits();return;}
  U.body.innerHTML=ST.tab==='mob'?tabMob():ST.tab==='pose'?tabPose():ST.tab==='fight'?tabFight():ST.tab==='stat'?tabStat():ST.tab==='status'?tabStatus():tabView();
  if(ST.tab==='fight')drawTimeline();}
function liveBits(){const U=ST.ui;const n=U.body.querySelector('[data-live]');if(!n)return;
  if(ST.tab==='pose')n.innerHTML=frameBlock();else if(ST.tab==='stat')n.innerHTML=statTable();else if(ST.tab==='status')n.innerHTML=statusTable();else if(ST.tab==='fight')n.innerHTML=lastExchange();}
function tabPose(){const T=poseTable(),ml=mobList();
  let h=`<div class="sr"><span class="l">ตัวทดลอง</span><button class="b ${ST.subject==='player'?'on':''}" data-a="subj:player">ผู้เล่น</button><button class="b ${ST.subject==='mob'?'on':''}" data-a="subj:mob">มอนสเตอร์</button></div><div class="sr"><span class="l">มอนสเตอร์</span><b>${esc((MOBS[ST.mobType]||{}).n||ST.mobType)}</b><button class="b" data-tab="mob">เลือกมอน…</button></div>`;
  if(ST.subject==='mob'&&hasArt(ST.mob)&&sprDirs(ST.mob)){const R_=SPR(ST.mob),M=R_.dirReady(),K=[['idle','ยืน'],['move','เดิน'],['atk_windup','ง้าง'],['atk_strike','ฟาด'],['atk_recover','คืนท่า'],['hurt','โดนตี'],['death','ตาย']];
    h+=`<div class="sr"><span class="l">ทิศภาพ</span><button class="b ${!ST.dir?'on':''}" data-a="dir:auto">ตามเกมจริง</button>${R_.dirs.map(d=>`<button class="b ${ST.dir===d?'on':''}" data-a="dir:${d}">${d}</button>`).join('')}</div>`;
    h+=`<div class="sr"><span class="l">ภาพที่มี</span><span class="hint">${K.map(([k,n])=>{const miss=R_.dirs.filter(d=>!M[k][d]);return n+(miss.length?' ยังไม่มี '+miss.join(','):' ครบ 8 ทิศ');}).join(' · ')} · ไม่กลับภาพ ไม่ใช้มุมอื่นแทน</span></div>`;}
  else h+=`<div class="sr"><span class="l">มุมหัน</span><span>${ST.subject==='mob'&&hasArt(ST.mob)?('ชุดหันซ้าย: มีภาพ · ชุดหันขวา: '+(()=>{const R_=SPR(ST.mob).rightReady();return ['idle','move','attack'].map(k=>({idle:'ยืน',move:'เคลื่อนที่',attack:'โจมตี'})[k]+(R_[k]?' มี':' รออาร์ต')).join(', ');})()+' · ไม่กลับภาพ (แสงซ้ายบน)'):ST.subject==='player'?'ตามทิศที่หันจริง (ตัวละครหันหาเป้า)':'ภาพชั่วคราวของเกม'}</span></div>`;
  h+=`<div class="sr"><button class="b ${ST.pose==='auto'?'on':''}" data-a="auto:1">ตามเกมจริง (auto)</button><span class="hint">เลือกท่าด้านล่างเพื่อสั่งเล่น · ปุ่ม 🔁 = วนซ้ำ / 1×▶ = ครั้งเดียว</span></div><div class="pg">`;
  for(const [k,n] of POSES){const t=T[k]||{st:'none',note:'ยังไม่มี'};const lab=t.st==='frames'?'มีเฟรมภาพ':t.st==='engine'?'ระบบเกม':'ยังไม่มี';
    h+=`<button class="${t.st} ${ST.pose===k?'sel':''}" data-a="pose:${k}" ${t.st==='none'?'aria-disabled="true"':''}>${n} · ${lab}<small>${esc(t.note)}</small></button>`;}
  h+=`</div><div data-live style="margin-top:8px">${frameBlock()}</div>`;return h;}
function dirTxt(F){if(DIRNAME[F.dir])return DIRNAME[F.dir];return F.dir==='R'?(F.fallback?'หันขวา→ใช้ชุดซ้าย (รอภาพขวา)':'หันขวา'):'หันซ้าย';}
function frameBlock(){const e=ST.mob;let rows=[];
  if(ST.subject==='mob'&&e&&!e.dead){const A=e.x,B_=e.y+e.sz*.35;
    if(hasArt(e)){const F=SPR(e).frameInfo(e),D=SPR(e).data;if(F)rows=[['ท่า',(F.logical||F.clip)+(F.forced?' (สั่งเล่น)':' (auto)')],['ทิศ',dirTxt(F)+(F.slot==='attack'?' · ล็อกตั้งแต่เริ่มง้างจนคืนท่า':'')],['คลิปที่วาด',F.clip],['เฟรม',(F.i+1)+' / '+F.n],['เวลาเฟรม',F.ms+' ms'],['เวลาในคลิป',f2(F.u)+' / '+f2(F.tot)+' วิ'],['ลอยเหนือจุดยึด',(F.lift||0)+' px ในช่องภาพ'],
      ['จุดยึดเท้า (โลก)',fi(A)+', '+f1(B_)],['จุดยึดในช่องภาพ',(F.drawn&&F.drawn.anchor||D.anchor).join(', ')+' (ช่อง '+(F.drawn&&F.drawn.cell||D.cell).join('×')+(F.drawn&&D.sheets?' · แผ่น '+(F.drawn.sheet+1)+'/'+D.sheets.length:'')+')'],...(D.dirs?[['ที่มาของทิศ',ST.dir?'สั่งจาก Studio':(F.slot?'ล็อกตอนเริ่มท่า':'เวกเตอร์หันบนจอ '+Math.round(((e.face||0)*180/Math.PI+360)%360)+'°')],['มุม hit test จริง',e.atkAng!=null?Math.round(((e.atkAng*180/Math.PI)+360)%360)+'° (แยกจากทิศภาพ)':'—']]:[]),['เหตุผล',F.forced?'สั่งจาก Studio':F.why]];}
    else rows=[['ภาพ','รูปทรงชั่วคราวของเกม — ไม่มีเฟรม'],['ง้าง',f2(Math.max(0,e.wind))+' / '+f2(e.windT||.42)+' วิ'],['พุ่ง',f2(Math.max(0,e.lunge||0))],['จุดยึดเท้า (โลก)',fi(A)+', '+f1(B_)]];}
  else if(ST.subject==='player'){const s=P.swing;rows=[['ภาพ','ตัวละครของเกม (procedural) — ไม่มีเลขเฟรม'],['ท่าปัจจุบัน',s?s.type:(P.casting?'ร่ายสกิล':Math.hypot(P.vx,P.vy)>25?'เดิน':'ยืน')],['ความคืบหน้า',s?f2(s.t)+' / '+f2(s.dur)+' วิ':'—'],['ช่วงง้าง',s&&s.wind?f2(s.wind)+' วิ':'—'],['combo',P.chain||0],['จุดยึดเท้า (โลก)',fi(P.x)+', '+fi(P.y+10)]];}
  return '<div class="kv">'+rows.map(r=>`<b>${r[0]}</b><span>${esc(r[1])}</span>`).join('')+'</div>';}
function tabFight(){const ml=mobList(),sk=Object.keys(P.skills||{}).filter(k=>SK[k]);
  let h=`<div class="sr"><span class="l">มอนสเตอร์</span><b>${esc((MOBS[ST.mobType]||{}).n||ST.mobType)}</b><button class="b" data-tab="mob">เลือกมอน…</button><button class="b" data-a="respawn:1">เกิดใหม่</button></div>
  <div class="sr"><span class="l">บทบาท</span><button class="b ${ST.mode==='dummy'?'on':''}" data-a="mode:dummy">หุ่นเป้า (เราตี)</button><button class="b ${ST.mode==='fight'?'on':''}" data-a="mode:fight">ศัตรู (ตีเรา)</button></div>
  <div class="sr"><span class="l">ผู้เล่น</span><button class="b" data-a="patk:1">โจมตี 1 ครั้ง</button><button class="b ${ST.autoAtk?'on':''}" data-a="pauto:1">โจมตีต่อเนื่อง</button>
   <select id="stuWpn" aria-label="อาวุธทดลอง"><option value="">อาวุธ: ${esc(P.weapon&&P.weapon.name||'—')}</option>${Object.keys(WEAPONS).filter(k=>k!=='fist').map(k=>`<option value="${k}">${esc(WEAPONS[k].n)} (ทดลอง)</option>`).join('')}</select></div>
  <div class="sr"><span class="l">สกิล</span>${sk.map(k=>`<button class="b" data-a="skill:${k}">${esc(SK[k].name)}</button>`).join('')||'<span class="hint">ยังไม่มีสกิลที่เรียน</span>'}
   <select id="stuSkillPick" aria-label="ทดลองสกิลอื่น"><option value="">ทดลองสกิลอื่น…</option>${Object.keys(SK).slice(0,400).map(k=>`<option value="${k}">${esc(SK[k].name||k)}</option>`).join('')}</select></div>
  <div class="sr"><span class="l">มอนสเตอร์</span><button class="b" data-a="matk:1">สั่งโจมตี 1 ครั้ง</button><button class="b" data-a="knock:1">ตีให้กระเด็น</button><button class="b warn" data-a="kill:1">ทำให้ตาย</button></div>
  <div class="sr"><span class="l">ตั้งค่า</span><button class="b ${ST.god?'on':''}" data-a="god:1">ผู้เล่นอมตะ</button><button class="b ${ST.mobImmortal?'on':''}" data-a="imm:1">มอนไม่ตาย</button><button class="b ${ST.autoRespawn?'on':''}" data-a="aresp:1">เกิดใหม่อัตโนมัติ</button></div>
  <div class="sr"><span class="l">ทดสอบ</span><button class="b" data-a="scn:interrupt">ขัดจังหวะท่าง้าง</button><button class="b" data-a="scn:combo">คอมโบ 5 ครั้ง</button><button class="b" data-a="scn:dotDeath">มอนตายระหว่างติดสถานะ</button><button class="b" data-a="scn:pDot">ผู้เล่นตายระหว่างติดพิษ</button></div>
  <div class="sr"><span class="l">รีเซ็ต</span><button class="b" data-a="reset:1">รีเซ็ตฉาก</button><button class="b" data-a="revive:1">ชุบชีวิต</button><button class="b" data-a="heal:1">คืน HP/MP</button></div>
  <canvas class="tl" id="stuTL" width="600" height="96" aria-label="ไทม์ไลน์จังหวะง้าง-ตี-ดาเมจ 3 วินาทีล่าสุด"></canvas>
  <div class="hint">แถวบน = ผู้เล่น (ฟ้า = ท่าโจมตี, ขีดเหลือง = ดาเมจเข้ามอน) · แถวล่าง = มอนสเตอร์ (ส้ม = ง้าง, แดง = จังหวะตี, ขีดชมพู = ดาเมจเข้าผู้เล่น, เทา = ถูกยกเลิก)</div>
  <div data-live>${lastExchange()}</div>`;return h;}
function lastExchange(){const E=ST.events;const lw=[...E].reverse().find(x=>x.k==='wind'),ls=[...E].reverse().find(x=>x.k==='strike'||x.k==='cancel'),lp=[...E].reverse().find(x=>x.k==='dmgP'),lm=[...E].reverse().find(x=>x.k==='dmgM'),lsw=[...E].reverse().find(x=>x.k==='swing'),ld=[...E].reverse().find(x=>x.k==='death');
  const r=[];
  if(lw)r.push(['มอน: เริ่มง้าง','ยาว '+f2(lw.dur)+' วิ'+(lw.frame?' · ภาพ '+lw.frame:'')]);
  if(ls)r.push(['มอน: '+(ls.k==='strike'?'จังหวะตี':'ถูกยกเลิก'),ls.k==='strike'?('+'+f2(ls.t-(lw?lw.t:ls.t))+' วิ หลังเริ่มง้าง'+(ls.frame?' · ภาพ '+ls.frame:'')):('สาเหตุ: '+ls.why)]);
  if(lp)r.push(['ดาเมจเข้าผู้เล่น',fi(lp.d)+(lp.since!=null?' · +'+f2(lp.since)+' วิ หลังเริ่มง้าง':'')+(lp.frame?' · ภาพ '+lp.frame:'')]);
  if(lsw)r.push(['ผู้เล่น: ท่า',lsw.type+' · ยาว '+f2(lsw.dur)+' วิ'+(lsw.wind?' · ง้าง '+f2(lsw.wind):'')+' · combo '+(lsw.chain||0)]);
  if(lm)r.push(['ดาเมจเข้ามอน',fi(lm.d)+(lm.crit?' (คริ)':'')+(lm.dot?' ['+lm.dot+']':'')+(lm.since!=null&&!lm.dot?' · +'+f2(lm.since)+' วิ หลังเริ่มท่า':'')+(lm.frame?' · ภาพมอน '+lm.frame:'')]);
  if(ld)r.push(['ตาย',(ld.who==='mob'?'มอนสเตอร์':'ผู้เล่น')+(ld.st&&ld.st.length?' · ขณะติด '+ld.st.join(', '):'')+(ld.frame?' · ภาพ '+ld.frame:'')]);
  if(SKA.last){const L=SKA.last;r.push(['พื้นที่ตีสกิลล่าสุด',L.name+' ('+L.type+') · '+(L.acc==='exact'?'ตรงตามโค้ด':L.acc==='approx'?'โดยประมาณ':'แสดงไม่ได้/ไม่มี')+' · '+L.desc]);}
  r.push(['กันเซฟ','บล็อกการเขียน '+ST.blockedWrites+' ครั้ง · งดรางวัล EXP '+ST.suppressed.exp+' / ของ '+ST.suppressed.loot+' / ออร์บ '+ST.suppressed.orbs]);
  return '<div class="kv">'+r.map(x=>`<b>${esc(x[0])}</b><span>${esc(x[1])}</span>`).join('')+'</div>';}
function drawTimeline(){const cv=document.getElementById('stuTL');if(!cv)return;const W_=cv.clientWidth||600;if(cv.width!==Math.round(W_*devicePixelRatio)){cv.width=Math.round(W_*devicePixelRatio);cv.height=Math.round(96*devicePixelRatio);}
  const g=cv.getContext('2d'),k=devicePixelRatio,w=cv.width,h=cv.height,span=3,t1=time,t0=t1-span,X=t=>(t-t0)/span*w;
  g.clearRect(0,0,w,h);g.fillStyle='#0a0f1c';g.fillRect(0,0,w,h);g.strokeStyle='#23304d';g.lineWidth=1;
  for(let s=Math.ceil(t0*10)/10;s<t1;s+=.1){const x=X(s);g.globalAlpha=Math.abs(s-Math.round(s))<.01?.9:.3;g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke();}g.globalAlpha=1;
  g.fillStyle='#9fb0cf';g.font=(10*k)+'px system-ui';g.fillText('ผู้เล่น',4*k,14*k);g.fillText('มอน',4*k,62*k);
  for(const e of ST.events){if(e.t<t0-2)continue;
    if(e.k==='swing'){g.fillStyle='rgba(127,211,255,.55)';g.fillRect(X(e.t),20*k,Math.max(2,(e.dur/span)*w),14*k);if(e.wind){g.fillStyle='rgba(127,211,255,.9)';g.fillRect(X(e.t),20*k,(e.wind/span)*w,4*k);}}
    else if(e.k==='dmgM'){g.fillStyle=e.dot?'#8dff6a':'#ffe14a';g.fillRect(X(e.t)-1*k,16*k,3*k,24*k);}
    else if(e.k==='wind'){g.fillStyle='rgba(255,154,92,.6)';g.fillRect(X(e.t),66*k,(e.dur/span)*w,14*k);}
    else if(e.k==='strike'){g.fillStyle='#ff3a5a';g.fillRect(X(e.t)-1.5*k,60*k,3*k,26*k);}
    else if(e.k==='cancel'){g.fillStyle='#8a93a8';g.fillRect(X(e.t)-1.5*k,60*k,3*k,26*k);}
    else if(e.k==='dmgP'){g.fillStyle='#ff7ad9';g.fillRect(X(e.t)-1*k,56*k,3*k,10*k);}
    else if(e.k==='death'){g.fillStyle='#fff';g.font=(11*k)+'px system-ui';g.fillText('✝',X(e.t)-3*k,(e.who==='mob'?92:44)*k);}
    else if(e.k==='status'){g.fillStyle='#c79bff';g.fillRect(X(e.t)-1*k,(e.to==='mob'?84:38)*k,3*k,6*k);}}
  g.fillStyle='#ffd36b';g.fillRect(w-2*k,0,2*k,h);}
function tabMob(){const q=(ST.mobQ||'').trim().toLowerCase();let h=`<div class="sr"><input type="search" id="stuMobQ" placeholder="ค้นหาชื่อมอน" value="${esc(ST.mobQ||'')}" style="height:34px;border-radius:9px;border:1px solid #55658a;background:#0f1628;color:#eef2fb;padding:0 8px;flex:1;min-width:140px"></div>
  <div class="hint">กดเพื่อเรียกมาในฉากทันที (ไม่ต้องใช้คอนโซล) · เลเวลเริ่มต้นตามข้อมูลโซนเดิม ปรับได้ในแท็บสเตตัส · บอสเรดไม่อยู่ในรายการเพราะต้องใช้ระบบเรด</div>`;
  for(const [title,list] of mobGroups()){const L=list.filter(m=>!q||m[1].toLowerCase().includes(q)||m[0].toLowerCase().includes(q));if(!L.length)continue;
    h+=`<div class="sr" style="margin-top:6px"><b>${esc(title)}</b><span class="hint" style="margin:0">${L.length} ชนิด</span></div><div class="pg">`+
      L.map(m=>`<button class="${m[0]===ST.mobType?'sel':''} ${window.MON_SPRITES&&MON_SPRITES.byType[m[0]]?'frames':''}" data-a="mob:${m[0]}">${esc(m[1])} · Lv${m[2]}<small>${esc(m[3])}</small></button>`).join('')+'</div>';}
  return h;}
function tabStat(){return `<div class="sr"><span class="l">ดูของ</span><button class="b ${ST.stTarget==='player'?'on':''}" data-a="sttgt:player">ผู้เล่น</button><button class="b ${ST.stTarget==='mob'?'on':''}" data-a="sttgt:mob">มอนสเตอร์</button>
  ${ST.stTarget==='player'?'<button class="b" data-a="rstp:1">รีเซ็ตค่าผู้เล่น</button>':'<button class="b" data-a="rstm:1">รีเซ็ตค่ามอน</button>'}</div>
  <div class="hint">แก้ตัวเลขในช่องแล้วกดออกนอกช่อง · ค่าที่แก้มีผลเฉพาะใน Studio และหายเมื่อออก (เซฟจริงไม่ถูกเขียน)</div>
  <div class="sr">${ST.stTarget==='player'?['lvl','hp','mp','str','agi','vit','int','dex','luk'].map(k=>`<label>${k.toUpperCase()} <input type="number" data-ed="${k}" value="${k==='lvl'?P.lvl:k==='hp'?Math.round(P.hp):k==='mp'?Math.round(P.mp):P.stats[k]}"></label>`).join(''):
   (ST.mob&&!ST.mob.dead?[['mlv','Lv',ST.mob.L],['mhp','HP',Math.round(ST.mob.hp)],['matk','ATK',Math.round(ST.mob.atk)],['mdef','DEF',Math.round(ST.mob.def*10)/10],['msp','SPD',Math.round(ST.mob.sp)]].map(x=>`<label>${x[1]} <input type="number" data-ed="${x[0]}" value="${x[2]}"></label>`).join(''):'')}</div>
  <div data-live>${statTable()}</div>`;}
function statTable(){const rows=ST.stTarget==='player'?playerStats():mobStats();return '<div class="kv">'+rows.map(r=>`<b>${esc(r[0])}</b><span>${esc(r[1])}</span>`).join('')+'</div>';}
function tabStatus(){const tgt=ST.stTarget;
  let h=`<div class="sr"><span class="l">เป้าหมาย</span><button class="b ${tgt==='player'?'on':''}" data-a="sttgt:player">ผู้เล่น</button><button class="b ${tgt==='mob'?'on':''}" data-a="sttgt:mob">มอนสเตอร์</button>
   <label>นาน <input type="number" id="stuDur" min="0.5" step="0.5" value="${ST.stDur}"> วิ</label><button class="b warn" data-a="stclr:1">ล้างสถานะทั้งหมด</button></div><div class="sr">`;
  if(tgt==='mob')h+=MSTAT.map(([k,n])=>`<button class="b" data-a="mst:${k}">${n}</button>`).join('');
  else h+=PSTAT.map(([k,n,ok])=>ok?`<button class="b" data-a="pst:${k}">${n}</button>`:`<button class="b" aria-disabled="true" style="opacity:.5;border-style:dashed" data-a="pst:${k}">${n} · ไม่รองรับ</button>`).join('');
  h+=`</div><div class="hint">${tgt==='mob'?'พิษซ้อนได้ตามระบบ (ระยะเวลาพิษใช้ค่าของระบบ ไม่ใช่ช่อง “นาน”) · แช่แข็งใช้กลไกเดียวกับอาวุธน้ำแข็ง (สตัน + น้ำแข็ง)':'ผู้เล่นรองรับเฉพาะ พิษ (ซ้อนชั้น) และ คำสาป ตามระบบปัจจุบัน · บัฟจากสกิลจะแสดงในตารางเมื่อมี'}</div>
   <div data-live>${statusTable()}</div>`;return h;}
function statusTable(){const rows=ST.stTarget==='mob'?mobStatusRows(ST.mob):playerStatusRows();
  if(!rows.length)return '<div class="hint">ไม่มีสถานะที่ทำงานอยู่</div>';
  return '<table class="stl"><tr><td><b>สถานะ</b></td><td><b>เหลือ</b></td><td><b>ซ้อน</b></td><td><b>ผล</b></td></tr>'+rows.map(r=>`<tr><td>${esc(r.n)}</td><td>${r.rem!=null?f1(r.rem)+' วิ':'—'}</td><td>${r.stk!=null?r.stk:'—'}</td><td>${esc(r.eff)}</td></tr>`).join('')+'</table>';}
function tabView(){const O=[['hit','Hitbox (ระยะดาเมจของท่า)'],['skill','พื้นที่ตีของสกิล'],['hurt','Hurtbox (ตัวรับดาเมจ)'],['range','ระยะโจมตี'],['detect','ระยะตรวจจับ'],['coll','Collision'],['shadow','เงาพื้น'],['anchor','จุดยึดเท้า + กรอบภาพ']];
  return `<div class="sr">${O.map(([k,n])=>`<button class="b ${ST.ov[k]?'on':''}" data-a="ov:${k}">${n}</button>`).join('')}</div>
  <div class="sr"><span class="l">ภาพมอนใหม่</span>${(()=>{const L_=(window.MON_SPRITES&&MON_SPRITES.list)||[],on=L_.length&&L_.every(R=>R.cfg.enabled);return `<button class="b ${on?'on':''}" data-a="slime:1">${on?'เปิด (ทดลอง: '+L_.map(R=>(MOBS[R.cfg.target]||{}).n||R.cfg.target).join(', ')+')':'ปิด (รูปทรงเดิม)'}</button>`;})()}</div>
  <div class="hint">ซูม ${ST.zoom}× · Hitbox แสดงเฉพาะรูปทรงที่ระบบใช้ตรวจจริง (inSector / inLine) ของท่าโจมตีผู้เล่น และโค้งตีของมอน (reach ±0.75 rad) · สกิลบางตัวใช้วงกลมภายในโค้ดของตัวเองจึงไม่ปรากฏ</div>
  <div class="hint">TEST MODE · ${VER} · ไม่มีการบันทึกเซฟ · ออกด้วยปุ่ม ✕ (เกมจะโหลดใหม่และกลับไปที่เซฟล่าสุด)</div>`;}

/* ================= enter / exit ================= */
function enter(){
  if(ST.on)return true;
  if(typeof G==='undefined'||!P||G.state!=='play'){alert('เปิด Studio ได้ระหว่างเล่นเกมเท่านั้น');return false;}
  try{saveGame();}catch(e){}                        // same as the normal autosave: progress up to now is kept
  install();snapPlayer();
  ST.on=true;ST.ret={zone:G.zone,x:P.x,y:P.y};
  document.body.classList.add('studio-on');
  try{if(G.auto&&typeof toggleAuto==='function')toggleAuto();}catch(e){}
  try{closeWin&&closeWin();}catch(e){}
  loadStudioZone();clearField();placePlayer();spawnMob();restoreHpMp();
  try{G.banner=0;const bn=$('#banner');if(bn)bn.classList.remove('show');}catch(e){}   // zone title would cover the scene on phones
  build();paint(true);note('เข้า Studio แล้ว — ไม่มีการบันทึกเซฟระหว่างนี้');
  return true;}
function exit(){keysOff();try{document.body.classList.remove('studio-on');}catch(e){}if(ST.ui)ST.ui.root.innerHTML='<div style="pointer-events:auto;background:#0c1020;padding:14px;text-align:center">กำลังออกจาก Studio และโหลดเกมใหม่จากเซฟล่าสุด…</div>';
  setTimeout(()=>{try{location.reload();}catch(e){}},150);}
ST.enter=enter;ST.exit=exit;ST.choosePose=choosePose;ST.scenario=scenario;ST.applyMStatus=applyMStatus;ST.applyPStatus=applyPStatus;ST.spawnMob=spawnMob;ST.resetScene=resetScene;ST.paint=paint;ST.mobAttackOnce=mobAttackOnce;ST.playerAttackOnce=playerAttackOnce;

/* ================= menu entries (both TEST menus) ================= */
function addButtons(){
  const p=document.getElementById('r2tPanel');
  if(p&&!document.getElementById('stuOpenA')){const d=document.createElement('div');d.className='row';d.innerHTML='<b>Animation &amp; Combat Studio</b><span class="tag pl">TEST</span><br><span style="color:#9ab">ฉากทดลองแอนิเมชัน · ต่อสู้ · สถานะ (ไม่บันทึกเซฟ)</span><br><button id="stuOpenA">เปิด Studio</button>';
    p.insertBefore(d,p.children[3]||null);d.querySelector('button').addEventListener('click',()=>{p.hidden=true;enter();});}
  const row=document.getElementById('hudTrayRow');
  if(row&&!document.getElementById('stuOpenB')){const b=document.createElement('button');b.type='button';b.className='tbtn';b.id='stuOpenB';b.textContent='Animation & Combat Studio';row.appendChild(b);
    b.addEventListener('click',()=>{try{window.HUDV177&&HUDV177.closeAll();}catch(e){}enter();});}
  // test toggle for the p180 slime art (in memory only; off = the engine's original slime shape)
  if(row&&window.MON_SPRITES&&MON_SPRITES.list.length&&!document.getElementById('slimeTog')){const t=document.createElement('button');t.type='button';t.className='tbtn';t.id='slimeTog';row.appendChild(t);
    const L_=MON_SPRITES.list,lab=()=>{t.textContent='ภาพมอนใหม่ (ทดลอง): '+(L_.every(R=>R.cfg.enabled)?'เปิด':'ปิด');};lab();t.addEventListener('click',()=>{const on=!L_.every(R=>R.cfg.enabled);L_.forEach(R=>R.enable(on));lab();});}
}
setInterval(()=>{try{addButtons();}catch(e){}},700);
try{if(/studio/.test(String(location.hash)))setTimeout(()=>{const iv=setInterval(()=>{if(typeof G!=='undefined'&&G.state==='play'){clearInterval(iv);enter();}},400);},500);}catch(e){}
})();

