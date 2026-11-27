
/* ---- mobclean-r1 (TEST, 11 Nov 2026; DeaRz 21:19 "ม้อนชุดเก่า86ตัวเอาออกจากเกมได้เลย" + Art addendum): the 86 old code-drawn species (no sprite) leave the game.
   - no field / zone spawn, no raid, no summon: ZONES mob lists are filtered, the field spawner and any stray removed monster are removed, makeEnemy(removed id) is remapped to a live species (counted in window.__MOBCLEAN.remaps).
   - the MOBS entries stay as retired DATA (m.retired=1) because old saves / socketed cards / the item names still read them; nothing can spawn them.
   - gate placeholders use their own gate-only copies gp_<id> (made in the gates module).
   - the 85 old card_* items: no longer drop; hidden from the wiki / card book; shown in the bag as 'การ์ดเก่า (เลิกใช้)'; definitions kept so old saves load.
   - ?oldmobs=on restores the old behaviour. Debug: window.__MOBCLEAN. ---- */
(function(){'use strict';
const OLD=/[?&]oldmobs=on\b/.test(String(location.search));
const REMOVED=new Set('wisp,mossling,thornbeetle,sprite,naga,treant,sandwisp,mummy,scorpion,sandwraith,djinn,ashghoul,skeleton,wraithknight,golem,revenant,frostwisp,yeti,icewraith,drake,lavael,cinderhound,demon,magmatitan,angler,sirenwraith,leviathan,jelly,tidelord,voidspawn,kraken,abyssal,darklord,vinecreeper,mushroomling,junglecat,cactoid,dunehound,sandworm,bonecrawler,rustbat,snowman,frostbear,magmaslime,emberbat,piranha,sharkfang,voidwisp,raid_jungle,raid_desert,raid_wasteland,raid_snow,raid_lava,raid_deepsea,raid_dark,puffjelly,meadowhop,sproutling,honeybuzz,tuskboar,rivertoad,swamppiranha,snapcroc,jadeserpent,miragespecter,sandcolossus,ironsentinel,ironarcher,warcaptain,forgeimp,moltencon,overseer,coralgolem,drownedknight,abysspriest,ruinleviathan,duskwisp,twistalker,riftelem,stardrake,eclipseknight,nullhound,voidcolossus,riftreaver,dewbeetle,duskstag'.split(','));
const MC=window.__MOBCLEAN={ver:'mobclean-r1',on:!OLD,err:null,removed:REMOVED.size,remaps:{},purged:0,zonesFiltered:0,cardsRetired:0,questFixes:[],log:[]};
if(OLD)return;
const ERR=(w,e)=>{MC.err=w+': '+((e&&e.message)||e);try{console.error('[MOBCLEAN]',w,e)}catch(_){}};
const SHAPE_LIVE={blob:'slime',wisp:'mistling',sprite:'mistling',beast:'briarfox',brute:'briarfox',golem:'mossback',wraith:'rimeguard',lord:'rimeguard',skeleton:'rimeguard',drake:'veilwater_serpent',kraken:'veilwater_serpent',fish:'frostquill',elemental:'hollowlantern',shroom:'puffcap',cactus:'seedling',scorp:'seedling',snowman:'slime',mummy:'rimeguard'};
const OVR={tuskboar:'meadowram'};   /* Code/Balance 11 Nov: the Monk Suri defend quest (Lv40, Map 10) used the Tusk Boar -> live Map 10 charger Meadow Ram */
const liveFor=id=>{if(OVR[id]&&MOBS[OVR[id]])return OVR[id];const m=MOBS[id];let t=m&&SHAPE_LIVE[m.sh];if(!t||!MOBS[t])t='slime';return t};
/* 1. retire the data, filter every zone mob list */
for(const id of REMOVED)if(MOBS[id])MOBS[id].retired=1;
function filterZones(){try{for(const z in ZONES){const Z=ZONES[z];if(Z&&Array.isArray(Z.mobs)){const n=Z.mobs.length;Z.mobs=Z.mobs.filter(x=>!REMOVED.has(x[0]));if(Z.mobs.length!==n)MC.zonesFiltered++}}}catch(e){ERR('zones',e)}}
filterZones();setInterval(filterZones,3000);
/* 2. nothing removed can be created: remap to a live species (stats keep the level formula) */
try{const _m=makeEnemy;makeEnemy=function(type,L,x,y){if(REMOVED.has(type)){const t=liveFor(type);MC.remaps[type]=(MC.remaps[type]||0)+1;type=t}return _m.call(this,type,L,x,y)}}catch(e){ERR('makeEnemy',e)}
/* 3. stray removed monsters (field spawner, old modules) are removed silently */
try{const _s=spawnEnemy;spawnEnemy=function(){const n=enemies.length;const r=_s.apply(this,arguments);for(let i=enemies.length-1;i>=n;i--)if(REMOVED.has(enemies[i].type)){enemies.splice(i,1);MC.purged++}return r}}catch(e){ERR('spawnEnemy',e)}
setInterval(()=>{try{if(typeof enemies==='undefined')return;for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];if(e&&REMOVED.has(e.type)){enemies.splice(i,1);MC.purged++}}}catch(e){ERR('purge',e)}},500);
/* 4. old cards: no drop, hidden in the wiki / card book, bag name */
const OLDCARD='การ์ดเก่า (เลิกใช้)';
function retireCards(){try{let n=0;for(const id in ITEMS){const I=ITEMS[id];if(I&&I.k==='card'&&!I.newCard){if(!I.oldName){I.oldName=I.n;I.n=OLDCARD;I.oldCard=1}n++}}MC.cardsRetired=n}catch(e){ERR('cards',e)}}
retireCards();setInterval(retireCards,3000);
try{const _d=dropLoot;dropLoot=function(x,y,o){try{const it=o&&o.item;if(it&&it.id&&ITEMS[it.id]&&ITEMS[it.id].oldCard){MC.log.length<20&&MC.log.push('blocked drop '+it.id);return}}catch(e){ERR('dropLoot',e)}return _d.apply(this,arguments)}}catch(e){ERR('hook drop',e)}
try{const _w=wkBuild;wkBuild=function(){const E=_w.apply(this,arguments);return E.filter(o=>!(o.cat==='card'&&ITEMS[o.id]&&ITEMS[o.id].oldCard)&&!(o.cat==='mob'&&REMOVED.has(o.id)))}}catch(e){ERR('wiki',e)}
/* 5. quests: any quest field pointing at a removed monster is remapped to a live species (listed in MC.questFixes) */
function scanQuests(){try{for(const n of ['QUESTS','QUEST_DEF','QUEST_LIST','MONKQ','NPCQ']){let v=null;try{v=(0,eval)('typeof '+n+'!=="undefined"?'+n+':null')}catch(_){}if(!v||typeof v!=='object')continue;
    const seen=new Set(),walk=(o,path,d)=>{if(!o||typeof o!=='object'||seen.has(o)||d>6)return;seen.add(o);for(const k of Object.keys(o)){const val=o[k];if(typeof val==='string'&&REMOVED.has(val)&&/mob|target|species|kill|enemy|type/i.test(k)){const to=liveFor(val);MC.questFixes.push(n+'.'+path+k+': '+val+' -> '+to);o[k]=to}else if(val&&typeof val==='object')walk(val,path+k+'.',d+1)}};walk(v,'',0)}}catch(e){ERR('quests',e)}}
scanQuests();setTimeout(scanQuests,4000);
console.info('[MOBCLEAN] '+REMOVED.size+' old species retired');
})();
