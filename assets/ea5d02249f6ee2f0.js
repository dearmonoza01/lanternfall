
/* ---- desert-r1 (TEST allin_r9, 12 Nov 2026): the 20 Sunscar DESERT monsters (Art sheets QA PASS + DeaRz OK 12 Nov 00:47; stats = Balance DESERT_monsters_balance_r1 as TEST values) ----
   * sheets: window.__DESERT_ART (desert_data.js): left-facing, 256 px cells, baseline y=232; idle 6, move 8, attack 8 (hit on frame 4), hurt 3, death 6, + attack2 for the 4 bosses; right-facing = mirror;
   * SHAPES.desertspr (the gate-monster method): attack frames 1-4 = the engine wind-up (burrow telegraph for Sandworm Pup / Dune Worm, jar opens for Jar Mimic), frames 5-8 = the strike; death animation + fade via ghosts;
     floaters (Mirage Wisp, Desert Vulture, Lamp Djinn Imp, Dust Devil) bob + ground shadow; Dust Devil / Pharaoh Sphinx / Cat Mummy get a soft dark outline (tan floor contrast); bosses alternate attack / attack2;
   * stats: ordinary = engine level row x Balance multipliers (hp / atk / def); field ATK x0.70, swarm and chase come from __MOBCHASE; bosses = field-boss rules (HP 30 x row, ATK 0.35 x boss row, +25 % aspd below 50 % HP, 3 x hero height); passive species (retal) wake only when hit; Jar Mimic ambushes inside 120 px; poison species use the engine's elem 'Poison' on-hit poison; Mirage Wisp / Lamp Djinn Imp = ranged with a 0.45 s telegraph;
   * Map 11 ('map11'): populated through __FARM (60 monsters: Scarab 16, Gecko 16, Cactoid 12, Jackal 16) + the Scarab Matriarch field boss (respawn 60-90 min, map notice). Maps 12-14 of the roster are not built yet.
   * ?desert=off disables. GM (?gm=on): "Desert 20 TEST" spawns one of each around the hero, "Matriarch" spawns the boss. Debug: window.__DESERT ---- */
(function(){'use strict';
const Q=String(location.search),OFF=/[?&]desert=off\b/.test(Q),ART=window.__DESERT_ART,MEAS=window.__DESERT_MEAS||{};
const DS=window.__DESERT={ver:'desert-r1',on:!OFF&&!!ART,err:null,stats:{spawned:0,kills:0,bossSpawns:0,telegraphs:0},ghosts:[],boss:{respT:0,e:null}};
if(OFF||!ART)return;
const ERR=(w,e)=>{DS.err=w+': '+((e&&e.message)||e);try{console.error('[DESERT]',w,e)}catch(_){}};
const rnd=(a,b)=>a+Math.random()*(b-a);
/* slug: display name, collision size sz, figure height hd (world px, hero ~76), speed, race/element (engine), Balance multipliers, level range, behaviour */
const S=(n,sz,hd,sp,race,ele,hp,atk,def,lv,x)=>Object.assign({n,sz,hd,sp,race,ele,hp,atk,def,lv},x||{});
const SPEC={
 sand_scarab:S('Sand Scarab',18,54,64,'insect','earth',1,1,1.2,[40,41],{c:'#d9a441',c2:'#5a3a18',retal:1,links:1}),
 dune_gecko:S('Dune Gecko',16,50,118,'beast','neutral',.75,.9,.7,[41,42],{c:'#e0c060',c2:'#6a5020'}),
 cactoid:S('Cactoid',26,92,46,'plant','poison',1.5,1,1.4,[42,43],{c:'#6fbf5a',c2:'#2a4a20',retal:1,poison:1}),
 dust_jackal:S('Dust Jackal',20,66,112,'beast','neutral',.8,1.05,.8,[43,44],{c:'#c9a070',c2:'#5a4020',links:1}),
 scarab_matriarch:S('Scarab Matriarch',104,0,52,'insect','earth',1,1,1,[45,45],{c:'#ffc23a',c2:'#5a3a18',boss:1}),
 sand_scorpion:S('Sand Scorpion',22,70,70,'insect','poison',1.1,1.1,1.2,[45,46],{c:'#d98a3a',c2:'#5a2a10',poison:1}),
 mirage_wisp:S('Mirage Wisp',18,62,76,'formless','holy',.7,1,.6,[46,47],{c:'#bfe8ff',c2:'#2a4a6a',fly:1,rng:1,rangeR:260,orb:'#bfe8ff'}),
 desert_vulture:S('Desert Vulture',22,80,105,'beast','wind',.8,1.05,.7,[47,48],{c:'#d9c9a0',c2:'#4a3a2a',fly:1}),
 sandworm_pup:S('Sandworm Pup',22,74,66,'beast','earth',1.3,1.1,1.1,[48,49],{c:'#c9a46a',c2:'#5a3a20'}),
 dune_worm:S('Dune Worm',104,0,50,'beast','earth',1,1,1,[50,50],{c:'#d9b46a',c2:'#5a3a20',boss:1}),
 bandage_cat_mummy:S('Bandage Cat Mummy',24,84,62,'undead','shadow',1.1,1.05,1,[50,51],{c:'#e8dcc0',c2:'#4a3a2a',outline:1}),
 jar_mimic:S('Oasis Jar Mimic',22,70,56,'formless','water',1.4,1.2,1.3,[51,52],{c:'#4fb0d0',c2:'#2a4a5a',retal:1,ambush:120}),
 sand_cobra:S('Sand Cobra',22,90,66,'beast','poison',.9,1.1,.8,[52,53],{c:'#8fc060',c2:'#3a4a20',poison:1}),
 tomb_jackal_statue:S('Tomb Jackal Statue',28,100,44,'construct','earth',1.6,1,1.5,[53,54],{c:'#c9b080',c2:'#4a3a28',retal:1,solo:1}),
 pharaoh_sphinx:S('Pharaoh Sphinx',104,0,48,'construct','holy',1,1,1,[55,55],{c:'#ffd36b',c2:'#5a4020',boss:1,outline:1}),
 fire_salamander:S('Fire Salamander',22,66,78,'beast','fire',1,1.1,1,[55,56],{c:'#ff8a3d',c2:'#6a2a10'}),
 lamp_djinn_imp:S('Lamp Djinn Imp',20,62,80,'demon','neutral',.75,1.1,.7,[56,57],{c:'#9fd0ff',c2:'#2a3a6a',fly:1,rng:1,rangeR:280,orb:'#9fd0ff'}),
 dust_devil:S('Dust Devil',22,80,96,'formless','wind',.8,1,.7,[57,58],{c:'#e0c898',c2:'#5a4a30',fly:1,outline:1}),
 glass_golem:S('Glass Golem',30,104,42,'construct','earth',1.7,1.05,1.6,[58,60],{c:'#9fe8ff',c2:'#2a4a5a',retal:1,solo:1}),
 scorpion_king:S('Scorpion King',104,0,50,'insect','poison',1,1,1,[60,60],{c:'#ff8a3d',c2:'#4a1a10',boss:1,poison:1})};
DS.spec=SPEC;
const HERO_H=()=>{try{return window.PUPPETX&&PUPPETX.cfg?PUPPETX.cfg.TARGET_H*PUPPETX.cfg.H_FACTOR:76}catch(_){return 76}};
const IH=slug=>{const m=MEAS[slug];return (m&&m.idle&&m.idle.stanceH)||200};
/* ---- register as monsters ---- */
for(const k in SPEC){const d=SPEC[k];MOBS['ds_'+k]=Object.assign({n:d.n,sh:'desertspr',c:d.c,c2:d.c2,sz:d.sz,sp:d.sp,ds:k,gspr:0},d.rng?{rng:1}:{},d.boss?{boss:1,bossH:3*HERO_H(),field:1}:{});try{MOBX['ds_'+k]=[d.race,d.ele]}catch(_){}}
/* ---- sheets ---- */
const sheets={};
function sheet(slug,a){const k=slug+'_'+a;if(sheets[k])return sheets[k];const src=ART[k];if(!src)return null;const im=new Image();im.decoding='async';im.src=src;return sheets[k]=im}
const ANI={idle:[6,150],move:[8,90],attack:[8,70],attack2:[8,70],hurt:[3,90],death:[6,110]};
SHAPES.desertspr=function(e,x,y,s,t){const slug=((MOBS[e.type]||{}).ds)||String(e.type).replace(/^ds_/,''),d=SPEC[slug];if(!d)return SHAPES.blob(e,x,y,s,t);
  let a='idle',f=0;const tt=time;const dx=e._gx==null?0:e.x-e._gx,dy=e._gy==null?0:e.y-e._gy;e._gx=e.x;e._gy=e.y;const mv=Math.hypot(dx,dy)>.35;
  const winding=e._tele>0||e.wind>0;if(winding&&!e._wasW){e._an=!e._an}e._wasW=winding;
  const atkA=(d.boss&&e._an&&ART[slug+'_attack2'])?'attack2':'attack';
  if(e._death!=null){a='death';f=Math.min(5,Math.floor(e._death*1000/ANI.death[1]))}
  else if(e._tele>0){a=atkA;f=Math.min(3,Math.floor((1-e._tele/.45)*4))}
  else if(e.flash>0&&!winding){a='hurt';f=Math.min(2,Math.floor((1-Math.min(1,e.flash/.15))*3))}
  else if(e.wind>0){a=atkA;f=Math.min(3,Math.floor((1-e.wind/.42)*4))}
  else if(e.lunge>0){a=atkA;f=4+Math.min(3,Math.floor((1-e.lunge/.15)*4))}
  else if(mv){a='move';f=Math.floor(tt*1000/ANI.move[1])%ANI.move[0]}
  else f=Math.floor((tt+e.ph)*1000/ANI.idle[1])%ANI.idle[0];
  const im=sheet(slug,a);if(!im||!im.complete||!im.naturalWidth)return;
  const n=ANI[a][0],cw=im.naturalWidth/n,ch=im.naturalHeight,ih=IH(slug),M0=MOBS[e.type];
  const dh=(M0&&M0.bossH)?M0.bossH*256/ih:s*(d.hd*256/(ih*d.sz)),dw=dh*cw/ch,flip=Math.cos(e.face)>0,fy=232/256;
  const lift=d.fly&&e._death==null?(11+4.5*Math.sin((tt+(e.ph||0))*2.4)):0;
  ctx.save();if(e._dalpha!=null)ctx.globalAlpha*=e._dalpha;
  ctx.save();ctx.globalAlpha*=d.fly?.3:.22;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(x,y+s*.35,dw*(d.fly?.17:.2),dw*(d.fly?.06:.07),0,0,6.283);ctx.fill();ctx.restore();
  ctx.translate(x,y+s*.32-lift);if(flip)ctx.scale(-1,1);ctx.imageSmoothingEnabled=true;
  if(d.outline){ctx.shadowColor='rgba(28,14,4,.85)';ctx.shadowBlur=4}
  ctx.drawImage(im,f*cw,0,cw,ch,-dw/2,-dh*fy,dw,dh);ctx.restore()};
/* ---- stats / flags on spawn ---- */
const rowHp=(L,sz)=>Math.round((30+L*18+Math.pow(L,1.5)*2.2)*Math.sqrt((sz||22)/22)),rowAtk=L=>6+L*2.4;
try{const _me=makeEnemy;makeEnemy=function(type,L,x,y){const e=_me.apply(this,arguments);try{const m=MOBS[type];if(!e||!m||!m.ds)return e;const d=SPEC[m.ds];
  if(d.boss){e.maxHp=e.hp=Math.round(30*rowHp(L,22));e.atk=.35*rowAtk(L)*2.4;e.def=L*.9;e.gateBoss=0;e.fieldBoss=1}
  else{e.maxHp=e.hp=Math.round(rowHp(L,e.sz)*d.hp);e.atk=rowAtk(L)*d.atk;e.def=L*.9*d.def}
  if(d.retal)e.retal=1;if(d.poison){try{Object.defineProperty(e,'elem',{configurable:true,enumerable:true,get(){return 'Poison'},set(){}})}catch(_){e.elem='Poison'}}
  e.dsr=m.ds;DS.stats.spawned++}catch(er){ERR('makeEnemy',er)}return e}}catch(e){ERR('hook makeEnemy',e)}
/* ---- death animation ghosts ---- */
const ghosts=DS.ghosts;
try{const _k=killEnemy;killEnemy=function(e){const was=e&&e.dead,r=_k.apply(this,arguments);try{if(e&&!was&&e.dead&&e.m&&e.m.ds){ghosts.push({type:e.type,x:e.x,y:e.y,face:e.face||0,ph:e.ph||0,sz:e.sz,t0:time});DS.stats.kills++;if(e.fieldBoss){DS.boss.e=null;DS.boss.respT=time+rnd(60,90)*60;notify&&notify(e.m.n+' ถูกกำจัดแล้ว',false)}}}catch(er){ERR('kill',er)}return r}}catch(e){ERR('hook kill',e)}
try{const _p=drawParts;drawParts=function(){const r=_p.apply(this,arguments);try{for(let i=ghosts.length-1;i>=0;i--){const g=ghosts[i],age=time-g.t0;if(age>1.2||G.zone==='x'){ghosts.splice(i,1);continue}ctx.save();SHAPES.desertspr({type:g.type,x:g.x,y:g.y,face:g.face,ph:g.ph,flash:0,wind:0,lunge:0,_death:age,_dalpha:age<.8?1:Math.max(0,1-(age-.8)/.3)},g.x,g.y,g.sz,time);ctx.restore()}}catch(er){ERR('ghosts',er)}return r}}catch(e){ERR('hook drawParts',e)}
/* ---- ranged telegraph (Mirage Wisp, Lamp Djinn Imp) ---- */
try{const _es=enemyShoot;enemyShoot=function(e,ang,spd){if(e&&e.dsr&&SPEC[e.dsr]&&SPEC[e.dsr].rng){if(e._tele>0)return;e._tele=.45;DS.stats.telegraphs++;return}return _es.apply(this,arguments)}}catch(e){ERR('hook shoot',e)}
/* ---- update: telegraph projectile, ambush, boss phase 2, boss respawn ---- */
function bossSpot(){const W=ZONES.map11&&ZONES.map11.w||3600,H=ZONES.map11&&ZONES.map11.h||3000;const M=window.__MAP11;const anchors=[[W*.78,H*.72],[W*.74,H*.3],[W*.85,H*.5],[W*.6,H*.8]];for(const [ax,ay] of anchors)for(let r=0;r<300;r+=30)for(let a=0;a<6.28;a+=.6){const x=ax+Math.cos(a)*r,y=ay+Math.sin(a)*r;if(M&&M.walkR&&M.walkR(x,y,70))return [x,y]}return [W*.7,H*.6]}
function spawnBoss(slug,x,y){const d=SPEC[slug];if(!d||!d.boss)return null;if(x==null){[x,y]=bossSpot()}const L=d.lv[0];const e=makeEnemy('ds_'+slug,L,x,y);if(!e)return null;e.aggro=false;e.homeX=x;e.homeY=y;enemies.push(e);DS.boss.e=e;DS.stats.bossSpawns++;try{notify(d.n+' ปรากฏตัวใน Sunscar Outskirts!',false);log(d.n+' ปรากฏตัวแล้ว','v')}catch(_){}return e}
DS.spawn=function(slug,x,y,L){const d=SPEC[slug];if(!d)return null;if(d.boss)return spawnBoss(slug,x,y);const e=makeEnemy('ds_'+slug,L||d.lv[0],x,y);if(e)enemies.push(e);return e};
try{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{
  for(const e of enemies){if(!e.dsr||e.dead)continue;const d=SPEC[e.dsr];
    if(e._tele>0){if(e.st&&e.st.stun){e._tele=0;continue}e._tele-=dt;e.face=Math.atan2(P.y-e.y,P.x-e.x);if(e._tele<=0){e._tele=0;const a=Math.atan2(P.y-e.y,P.x-e.x),v=320;projs.push({team:'e',x:e.x,y:e.y-e.sz*.6,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:(d.rangeR||260)/v,dmg:e.atk*1.0,size:9,col:d.orb||'#cde',src:e,trail:[],kind:'eorb'});e.lunge=.15}}
    if(d.ambush&&!e.aggro&&Math.hypot(P.x-e.x,P.y-e.y)<d.ambush){e.aggro=true;e.alertT=.5;e.retal=0}
    if(d.boss){if(!e._ph2&&e.hp<e.maxHp*.5){e._ph2=1;try{textAt(e.x,e.y-e.sz*2.6,'PHASE 2','#ff6b5a',20,{life:1.4})}catch(_){}}if(e._ph2&&e.atkCd>0)e.atkCd-=dt*.25}}
  if(G.zone==='map11'&&G.state==='play'&&!DS.boss.e&&DS.boss.respT<=time&&DS.boss.respT!==-1&&ZONES.map11){spawnBoss('scarab_matriarch')}
  }catch(er){ERR('update',er)}return r}}catch(e){ERR('hook update',e)}
/* ---- Map 11 farm ---- */
function farmDef(){const F=window.__FARM;if(!F||!F.DEF){ERR('farm','missing __FARM');return}const M=()=>window.__MAP11,W=()=>(ZONES.map11&&ZONES.map11.w)||3600,H=()=>(ZONES.map11&&ZONES.map11.h)||3000;
  F.DEF.map11={N:60,resp:165,regions:()=>[{id:'sunscar',geo:()=>({inside:(x,y)=>x>140&&y>140&&x<W()-140&&y<H()-140&&(!M()||!M().walkR||M().walkR(x,y,24)),sample:()=>[rnd(160,W()-160),rnd(160,H()-160)]}),
    mix:[['ds_sand_scarab',16,SPEC.sand_scarab.lv],['ds_dune_gecko',16,SPEC.dune_gecko.lv],['ds_cactoid',12,SPEC.cactoid.lv],['ds_dust_jackal',16,SPEC.dust_jackal.lv]]}]};DS.farm=true}
farmDef();
/* ---- GM ---- */
if(/[?&]gm=on\b/.test(Q)){const add=()=>{try{if(document.getElementById('dsBtn'))return;const mk=(id,txt,top,fn)=>{const b=document.createElement('button');b.id=id;b.textContent=txt;b.style.cssText='position:fixed;left:150px;top:'+top+'px;z-index:8000;padding:6px 10px;border-radius:10px;border:1px solid #e0c060;background:rgba(60,44,10,.92);color:#ffe9b0;font:700 13px system-ui,sans-serif;cursor:pointer';b.addEventListener('click',e=>{e.stopPropagation();fn()});document.body.appendChild(b)};
  mk('dsBtn','Desert 20 TEST',470,()=>DS.gm.ring());mk('dsBoss','Matriarch (boss)',508,()=>DS.gm.boss())}catch(e){ERR('gm',e)}};if(document.body)add();else document.addEventListener('DOMContentLoaded',add);setTimeout(add,1700)}
DS.gm={ring(){const ks=Object.keys(SPEC),out=[];ks.forEach((k,i)=>{const a=i/ks.length*6.283,r=SPEC[k].boss?420:240;const e=DS.spawn(k,P.x+Math.cos(a)*r,P.y+Math.sin(a)*r*.7);if(e){e.aggro=false;e.alertT=0;out.push(k)}});return out.length},
  boss(){return !!spawnBoss('scarab_matriarch',P.x+300,P.y)}};
console.info('[DESERT] ready: '+Object.keys(SPEC).length+' species');
})();
