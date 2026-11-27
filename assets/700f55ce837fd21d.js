
/* ---- candidate_balance_v1_r67: p279 r1 monster element table v2 + Venom Slime on Map 2 east (TEST only) ---- */
/* p279 r1 — DeaRz 22 Oct 05:05 "Okตามนั้นได้เลบ" (monster element table v2, https://claude.ai/artifact/8BEjHbrujFbvUZxrnPT4GA)
   + balance/approved/BALANCE_map2_venomslime_v1.md. TEST only, nothing merged into the real game.
   1. Element v2 (on top of p273 ELEM.cfg): Dusk Stag = Dark, Puffcap = Poison, Venom Slime = Poison, every other monster unchanged.
      Name-tag words มืด / พิษ (แสง / อันเดด ready, no monster uses them). Element colours = v2 table. Icons: E1–E4 unchanged; Dark/Poison
      monsters show no icon until E7/E8 art exists (nothing stands in). Player attacks have no Dark/Poison element, so these monsters take
      x1.0 from everything (bow poison stays "no element", ELEMENT_SYSTEM_v1).
   2. Venom Slime ('venomslime'): the slime with a purple body (sheets recoloured offline by tools/venom_recolour.py: green/mint body ->
      #482a80/#8a5cd6/#d2b8f8 ramp by brightness; outline, eyes, mouth, cheeks and the leaf sprout untouched; no glow).
      Built by the engine exactly as a slime of the same level (HP, DEF, EVA, EXP, drops, behaviour rows) and then retyped, so every
      layer keeps the slime numbers. Raw attack x0.87. Each hit that takes HP adds 1 poison stack on the player: 3% of that hit per
      second for 5 s, max 3 stacks (the oldest drops), each with its own timer. Poison never kills (leaves 1 HP), stops in safe zones,
      on death and on a map change.
   3. Spawn points: Map 2 groups with x > 2740, band starting at Lv7+, currently 'slime' -> sorted by id -> index 1, 3, 5 ... become
      venomslime. Same spots, same respawn, total mob count unchanged.
   Debug: window.VENOM (stats, points, stacks). ?venom=off = no Venom Slime (slimes as before). ?elv2=off = element table v1 as before. */
(function(){
'use strict';
const Q=String(location.search)+String(location.hash);
const V=window.VENOM={version:'p279-r1',on:!/venom=off/.test(Q),elv2:!/elv2=off/.test(Q),ok:false,err:[],points:[],stats:{stacks:0,ticks:0,tickDmg:0,hits:0,scaled:0,made:0},stacks:[]};
const TYPE='venomslime',ATK=0.87,PCT=0.03,DUR=5,MAXS=3,PCOL='#9be04a';

/* ---- 1. element table v2 ---- */
try{const E=window.ELEM;
  if(V.elv2&&E&&E.cfg&&!E.off){const c=E.cfg;
    Object.assign(c.species,{duskstag:'Dark',puffcap:'Poison'});if(V.on)c.species[TYPE]='Poison';
    Object.assign(c.word,{Dark:'มืด',Poison:'พิษ',Light:'แสง',Undead:'อันเดด'});
    Object.assign(c.col,{Fire:'#ff7a3a',Ice:'#6fd8ff',Lightning:'#ffe14a',Earth:'#b98a4a',Light:'#ffe9a8',Dark:'#8a5cd6',Poison:'#9be04a',Undead:'#7fe3cf'});
    E.v2=true;}
  else if(!E||!E.cfg)V.err.push('ELEM missing');
}catch(er){V.err.push('elv2 '+er.message);}
if(!V.on){V.ok=V.err.length===0;return;}

/* ---- 2a. monster records ---- */
try{if(!MOBS[TYPE])MOBS[TYPE]=Object.assign({},MOBS.slime,{n:'Venom Slime'});}catch(er){V.err.push('MOBS '+er.message);}   // same tint values as the slime: no purple glow (art rule: no glow)
try{if(typeof MOBX!=='undefined'&&!MOBX[TYPE])MOBX[TYPE]=['formless','poison'];}catch(_){}
try{const S=window.W22&&W22.sp10&&W22.sp10.data;if(S&&S.slime&&!S[TYPE])S[TYPE]=Object.assign({},S.slime,{id:TYPE,name:'Venom Slime',stable_id:'w22_venomslime',lv:[7,10],element:'poison',note:'p279 TEST'});}
catch(er){V.err.push('sp10 '+er.message);}

/* ---- 2b. sprite: the slime record with the purple sheets ---- */
try{const ART=window.__VENOM_ART,base=window.__MON_SPRITES&&window.__MON_SPRITES.slime,REG=window.MON_SPRITES;
  if(!ART||!base||!base.sheets||!REG||!REG.byType)throw new Error('slime sprite / venom art missing');
  const rec=Object.assign({},base,{version:'venom-slime-r1 (slime '+base.version+')',target:TYPE,offKey:TYPE,
    status:'TEST MODE — recolour of the slime, art check pending',sheets:base.sheets.map((sh,i)=>Object.assign({},sh,{src:ART.sheets[i]}))});
  window.__VENOM_REC=rec;window.__MON_SPRITES[TYPE]=rec;
  let src=null;for(const s of document.scripts){const t=s.text;if(t&&t.indexOf('p182 (r3) — data-driven monster sprite renderer')>=0&&t.indexOf('function makeSprite(D)')>=0){src=t;break;}}
  if(!src)throw new Error('p182 source not found');
  const swap=(a,b)=>{const i=src.indexOf(a);if(i<0||src.indexOf(a,i+1)>=0)throw new Error('p182 text changed: '+a.slice(0,40));src=src.slice(0,i)+b+src.slice(i+a.length);};
  swap("const SRC=Object.assign({},window.__MON_SPRITES||{});if(window.__SLIME_CHIBI&&!SRC[window.__SLIME_CHIBI.target])SRC[window.__SLIME_CHIBI.target]=window.__SLIME_CHIBI;","const SRC={venomslime:window.__VENOM_REC};");
  swap("const REG={byType:{},list:[]};window.MON_SPRITES=REG;","const REG=window.MON_SPRITES;");
  swap("window.SLIME_CHIBI=REG.byType.slime||null;","");
  swap("setTimeout(()=>{try{install();}catch(er){console.warn('[p182] install',er);}},0);","");   // hooks already installed by the original
  (0,eval)(src);
  V.R=REG.byType[TYPE];if(!V.R)throw new Error('sprite not registered');
  // same draw size as the slime (p207 draws Map 2 sprites 1.4x; copied once the slime value is final)
  const syncK=()=>{const a=REG.byType.slime,b=V.R;if(!a||!a.cfg||!b||!b.cfg)return false;b.cfg.drawK=a.cfg.drawK;return !!(window.__P207&&__P207.done&&__P207.done.includes('slime'));};
  if(!syncK()){let n=0;const iv=setInterval(()=>{if(syncK()||++n>60)clearInterval(iv);},250);}
}catch(er){V.err.push('sprite '+er.message);}

/* ---- 2b'. facing like the slime (p203: look at the player while fighting, else where it walks; render-side only) ---- */
{const LAST=new WeakMap();
  const wanted=e=>{if(e.wind>0||e.strikeT>0||e.lunge>0)return null;let s=LAST.get(e);const t=time;
    if(!s){s={x:e.x,y:e.y,t,vx:0,vy:0};LAST.set(e,s);return null;}
    const dt=t-s.t;if(dt>1e-4){const k=Math.min(1,dt*8);s.vx+=((e.x-s.x)/dt-s.vx)*k;s.vy+=((e.y-s.y)/dt-s.vy)*k;if(dt>.4){s.vx=0;s.vy=0;}s.x=e.x;s.y=e.y;s.t=t;}
    const moving=Math.hypot(s.vx,s.vy)>30&&Math.hypot(e.vx||0,e.vy||0)<40;
    if(e.aggro&&!e.w22ret&&P&&!P.dead)return Math.atan2(P.y-e.y,P.x-e.x);
    if(moving)return Math.atan2(s.vy,s.vx);return null;};
  setTimeout(()=>{try{const _d=drawEnemy_v1;drawEnemy_v1=function(e){
      if(!e||e.dead||e.sprGhost||e.type!==TYPE)return _d.apply(this,arguments);
      let a=null;try{a=wanted(e);}catch(_){}if(a==null)return _d.apply(this,arguments);
      const f0=e.face;e.face=a;try{return _d.apply(this,arguments);}finally{e.face=f0;}};}catch(er){V.err.push('facing '+er.message);}},80);}

/* ---- 2c. build as a slime of the same level, then retype ---- */
{const _mk=makeEnemy;makeEnemy=function(type,L,x,y){
  if(type!==TYPE)return _mk.apply(this,arguments);
  const a=Array.prototype.slice.call(arguments);a[0]='slime';const e=_mk.apply(this,a);
  if(e){e.type=TYPE;e.m=MOBS[TYPE];e.venom=1;V.stats.made++;}
  return e;};}

/* ---- 2d. attack x0.87 + poison stacks on the player ---- */
const now=()=>time;
const safe=()=>{try{return typeof szFullNow==='function'&&szFullNow();}catch(_){return false;}};
{const _hp=hurtPlayer;hurtPlayer=function(raw,src){
  const ven=src&&src.type===TYPE&&!src.dead;
  if(ven&&typeof raw==='number'){raw*=ATK;V.stats.scaled++;}
  const hp0=P?P.hp:0;const a=Array.prototype.slice.call(arguments);a[0]=raw;const r=_hp.apply(this,a);
  try{const lost=hp0-P.hp;
    if(ven&&lost>0&&!P.dead&&!safe()){V.stats.hits++;
      V.stacks.push({dps:lost*PCT,next:now()+1,end:now()+DUR,zone:G.zone});V.stats.stacks++;
      while(V.stacks.length>MAXS)V.stacks.shift();
      textAt(P.x,P.y-78,'พิษ',PCOL,13,{life:.7});}}catch(_){}
  return r;};}
let carry=0;
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);
  try{if(V.stacks.length){
      if(!P||P.dead||safe()){V.stacks.length=0;carry=0;}
      else{const t=now();let dmg=0;
        for(const s of V.stacks){if(s.zone!==G.zone){s.end=-1;continue;}
          while(t>=s.next&&s.next<=s.end+1e-6){dmg+=s.dps;s.next+=1;}}
        V.stacks=V.stacks.filter(s=>s.next<=s.end+1e-6);
        if(dmg>0){carry+=dmg;const d=Math.floor(carry);
          if(d>0){carry-=d;const hp=Math.min(d,Math.max(0,P.hp-1));   // poison never kills (leaves 1 HP)
            if(hp>0){P.hp-=hp;V.stats.ticks++;V.stats.tickDmg+=hp;textAt(P.x,P.y-40,String(hp),PCOL,13,{life:.7});}}}
        if(!V.stacks.length)carry=0;}}}catch(_){}
  return r;};}

/* ---- 3. Map 2 east spawn points ---- */
try{const PD=window.__W22_DATA&&window.__W22_DATA.population;if(!PD)throw new Error('no population');
  if(!PD.species.some(s=>s.id===TYPE)){const sl=PD.species.find(s=>s.id==='slime')||{};
    PD.species.push(Object.assign({},sl,{id:TYPE,name:'Venom Slime',lv:[7,10],element:'poison',aggro:0.7,
      art:{status:'TEST',source:'slime sprite recoloured (p279)',final:'p279 TEST'}}));}
  const pts=PD.groups.filter(g=>g.c&&g.c[0]>2740&&g.band&&g.band[0]>=7&&Array.isArray(g.m)&&g.m.length&&g.m.every(t=>t==='slime'))
    .sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
  V.eastSlime=pts.map(g=>g.id);
  pts.forEach((g,i)=>{if(i%2===1){g.m=g.m.map(()=>TYPE);g.p279=1;V.points.push({id:g.id,c:g.c.slice(),band:g.band.slice(),spots:g.spots||1});}});
}catch(er){V.err.push('population '+er.message);}
V.ok=V.err.length===0;if(!V.ok)console.warn('[p279]',V.err);
})();
