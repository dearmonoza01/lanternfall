
/* ---- REAL v3l6c (17 Nov 2026) = REAL v3l6b + worldmap3 ONLY (the M window shows the approved World Map v3 painting with 22 map badges; ?worldmap3=off = old map). Previous header follows. ---- */
/* ---- REAL v3l6b (17 Nov 2026) = REAL v3l6 + r132 (W22 leash off while chasing: monsters follow a kiting hero past 360/560 px from their spawn site; ?w22leash=on = old). Previous header follows. ---- */
/* ---- REAL v3l6 (17 Nov 2026) = REAL v3l5b + r129 (skill slot bar inside the skill window incl. the star page, skill tooltip on window cards; new Realm Wiki rebuilt from the current game data). Previous header follows. ---- */
/* ---- REAL v3l5b (16 Nov 2026) = REAL v3l4g + r125 (quest tracker left with categories, fold button collapses it, click-to-walk quest navigation; bag: dark-gold hover card, compare block, double-click; autostick engage-range fix, monster names white with a red crossed-swords icon in combat; town villagers: one talk per click, no log spam, vendors fixed at their stalls with the shop window, F prompt fixed; mobrefill: no idle despawn on any map + refill sites/home return + 13 extra Map 2 spawn sites, npcsize ~1.0x hero, npcfix NPC placement/overlap, no falling leaves staff skills no longer greyed by a transient error, staff Auto casts unlocked staff skills, skill tooltip) (staff Auto attacks, monsters no longer stop at the NPC pocket wall, special-skill tab guard). REAL v3k + TEST r98..r100 (dagger skills hide the hero, keepweapon: picked starter weapon kept across maps/reload, sword combo reach matches dagger -50%) + ALL dev/test UI hidden unless ?gm=on. REAL v3j + TEST work r53 .. r97 (every item DeaRz ordered, all features at their TEST defaults, each behind its own flag): knuckle / mastery unlock, JobLv HUD, install-row fix, robot + Steam Knight + AUTO, card backs, char-create fix, discard single/multi, bow any direction + range 370, dagger hero visible + combo -50%, Map 11 ground G5 + props + DeaRz mask, Suri at Map 10, mobguard / edgehit / bosspush, world map M fix, Mali shop window, thief-kid scene. Base = TEST allin_r127.
   * labels the build, strips the word "TEST" from zone names / gate hints / item names; ?testlabels=on keeps them;
   * the floating gate button is replaced by a menu-bar button (glue_v3f); the 🕯 test button stays hidden unless ?gm=on;
   * starter weapons: "Test Bow (TEST)" / "Test Staff (TEST)" / "Test Dagger (TEST)" become their real names (Gale String / Starlight Staff / Spirit Fang);
   * every feature keeps its own flag. Debug: window.__REAL ---- */
(function(){'use strict';
const Q=String(location.search),KEEP=/[?&]testlabels=on\b/.test(Q),GM=/[?&]gm=on\b/.test(Q);
const R=window.__REAL={ver:'v3l19e',base:'TEST allin_r127 on REAL v3j',stripped:0,items:0,hidden:0,err:null};
const strip=s=>typeof s!=='string'?s:s.replace(/\s*\((?:TEST)\)/g,'').replace(/\s*·\s*TEST\b/g,'').replace(/\bTEST\s*·\s*/g,'').replace(/\s*·\s*แมพทดสอบ/g,'');
const REN={'Test Bow':'Gale String','Test Staff':'Starlight Staff','Test Dagger':'Spirit Fang','Test Sword':'Tidecaller'};
function zones(){try{if(typeof ZONES==='undefined')return;for(const id in ZONES){const z=ZONES[id];if(!z||z._realClean)continue;if(!/test|planned/.test(id)&&!['n','th','sub'].some(k=>/TEST/.test(String(z[k]||''))))continue;
    for(const k of ['n','th','sub']){const v=z[k],w=strip(v);if(v!==w){z[k]=w;R.stripped++}}z._realClean=1}}catch(e){R.err=e.message}}
function nm(v){if(typeof v!=='string')return v;let w=strip(v);for(const k in REN){if(w.indexOf(k)===0)w=w.replace(k,REN[k])}return w}
function items(){try{if(typeof P==='undefined'||!P)return;const fix=it=>{if(!it||typeof it!=='object')return;for(const k of ['name','n']){const v=it[k],w=nm(v);if(v!==w){it[k]=w;R.items++}}};
    if(P.inv)for(const it of P.inv)fix(it);fix(P.weapon);if(P.eq&&typeof P.eq==='object')for(const k in P.eq)fix(P.eq[k])}catch(e){R.err=e.message}}
function hide(){if(GM)return;try{
    for(const e of document.querySelectorAll('button,div')){if(e.children.length===0&&(e.textContent||'').trim()==='🕯'&&e.style.display!=='none'){e.style.setProperty('display','none','important');R.hidden++}}}catch(e){R.err=e.message}}
if(!KEEP){setInterval(zones,1500);setInterval(items,700);
  try{const og=gatesFor;gatesFor=function(){const out=og.apply(this,arguments);try{for(const g of out||[]){for(const k of ['label','sub']){const v=g&&g[k],w=strip(v);if(v!==w){g[k]=w;R.stripped++}}}}catch(_){}return out}}catch(e){R.err=e.message}}
setInterval(hide,800);
/* v3l: dev/test UI is never shown on the real server (only with ?gm=on) */
if(!GM){try{const st=document.createElement('style');st.id='realNoDev';st.textContent='#atk19Btn,#atk19SizeBtn,#atk19PerBtn,#atk19WaveBtn,#atk19RangeBtn,#bowTestChip,#p210diag,#atk19Chip,#fpsBox,#fpsOverlay{display:none!important}';(document.head||document.documentElement).appendChild(st);
 const DEVRX=/ATK19|r7[a-z]\b|คอมโบ ATK|ขนาดมีด|จังหวะมีด|คลื่นดาบ:|ระยะฟัน|ทดสอบให้เห็น|\bTEST\b|dgvis|bow3|edgehit|FPS:/i;
 setInterval(()=>{try{for(const e of document.querySelectorAll('body *')){if(e.children.length>0||e.id==='realNoDev')continue;const cs=e.style;if(!cs||cs.position!=='fixed'&&getComputedStyle(e).position!=='fixed')continue;const tx=(e.textContent||'').trim();if(tx&&tx.length<140&&DEVRX.test(tx)&&!e.closest('#dlgBox,#chat,#bag')){e.style.setProperty('display','none','important');R.hidden++}}}catch(_){}},1200)}catch(e){R.err=e.message}}
console.info('[REAL] v3l6c');
})();
