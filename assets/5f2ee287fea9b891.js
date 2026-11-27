
/* r224 ICONFIX224 (?iconfix=off): DeaRz 25 Nov 2026 07:19 BKK, phone screenshot of the live game: several bag cells show no picture (only the count or the SEAL tag).
   Likely cause (Code's diagnosis, not reproduced on a real phone): the icon pack images are created with decoding='async'; on a phone short of memory an image can report "complete" while its
   pixels are not decoded, drawImage then paints nothing, and the EMPTY 64x64 canvas is turned into a data URL and cached for the whole session, so the cell stays blank.
   Fix: every icon URL the game hands out is checked once (is anything painted?). A blank one is rebuilt here from the pack source after an explicit decode(), retried up to 12 times over about 30 s (and checked again later if that fails),
   then the bag is redrawn. Icons that are fine are untouched. Debug: ICONFIX224.stats. */
(function(){'use strict';
const X=window.ICONFIX224={on:!/[?&]iconfix=off\b/.test(String(location.search)),err:null,stats:{checked:0,blank:0,fixed:0,failed:0},bad:{}};
if(!X.on)return;
const SRC=window.__ITEM_ICONS_R1B||{},MY={},STATE=new Map();/* url -> 1 ok / 2 blank */
const ALIAS={gateRandBox:'gate_random_box'};
function packKey(it){if(!it)return null;
  if(it.kind==='wpn'){if(it.t==='fist')return null;const kind=(it.t==='staff'&&it.hs)?'holy':it.t;return 'w_'+kind+'_'+Math.max(0,Math.min(6,it.rar|0))}
  if(it.kind==='eq'){if(it.set)return 'set_'+it.set+'_'+it.type;return 'e_'+it.type+'_'+Math.max(0,Math.min(6,it.rar|0))}
  if(it.kind==='fash')return it.cid?(/^c_/.test(it.cid)?it.cid:'c_'+it.cid):null;
  const id=it.id;if(!id)return null;if(ALIAS[id])return ALIAS[id];
  if(/^it_weapon_book_shard_/.test(id))return 'it_weapon_book_shard';if(/^it_weapon_book_/.test(id))return 'it_weapon_book';return id}
const myKey=it=>{try{return (typeof iconKey==='function'?iconKey(it):'')+'|'+packKey(it)+'|'+(it.rar|0)+'|'+(it.sty|0)}catch(_){return null}};
const painted=cv=>{try{const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let n=0;for(let i=3;i<d.length;i+=16)if(d[i]>20&&++n>6)return true;return false}catch(_){return true}};
let redrawT=null;const redraw=()=>{clearTimeout(redrawT);redrawT=setTimeout(()=>{try{if(G.win==='wInv')renderInv()}catch(_){}try{document.querySelectorAll('img').forEach(im=>{const k=im.dataset&&im.dataset.if224;if(k&&MY[k])im.src=MY[k]})}catch(_){}},120)};
function glowCol(it){try{if(it.kind==='wpn'||it.kind==='eq'||it.kind==='fash')return RARITY[it.rar|0].c;const d=ITEMS[it.id];return d&&d.col||null}catch(_){return null}}
async function rebuild(it,k,n){try{const key=packKey(it),src=key&&SRC[key];if(!src){X.stats.failed++;X.bad[k]='no pack source';return}
  const im=new Image();im.src=src;try{await im.decode()}catch(_){await new Promise(r=>{im.onload=r;im.onerror=r;setTimeout(r,1500)})}
  const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const col=glowCol(it);
  if(col&&typeof glowSprite==='function'){try{g.globalCompositeOperation='lighter';g.drawImage(glowSprite(col),0,0,64,64)}catch(_){}g.globalCompositeOperation='source-over'}
  const t=document.createElement('canvas');t.width=t.height=64;const tg=t.getContext('2d');tg.imageSmoothingEnabled=true;tg.imageSmoothingQuality='high';tg.drawImage(im,2,2,60,60);
  if(!painted(t)){if(n<12){setTimeout(()=>rebuild(it,k,n+1),Math.min(3000,400*(n+1)));return}X.stats.failed++;X.bad[k]='decode failed';setTimeout(()=>{try{for(const [u,v] of STATE)if(v===2)STATE.delete(u)}catch(_){}},20000);return}
  g.drawImage(t,0,0);MY[k]=c.toDataURL();X.stats.fixed++;delete X.bad[k];redraw()}catch(e){X.err='rebuild '+e.message}}
const GLOW={};function glowOnly(it){try{const col=glowCol(it);if(!col||typeof glowSprite!=='function')return null;if(GLOW[col])return GLOW[col];const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.globalCompositeOperation='lighter';g.drawImage(glowSprite(col),0,0,64,64);return GLOW[col]=c.toDataURL()}catch(_){return null}}
function check(url,it,k){STATE.set(url,0);X.stats.checked++;
  /* art missing but the grade glow painted: the URL equals a glow-only icon */
  try{const key=packKey(it);if(key&&SRC[key]&&(url===glowOnly(it)||url.length<200)){STATE.set(url,2);X.stats.blank++;X.bad[k]='art missing';rebuild(Object.assign({},it),k,0);return}}catch(_){}
  const im=new Image();im.onload=()=>{try{const c=document.createElement('canvas');c.width=c.height=32;c.getContext('2d').drawImage(im,0,0,32,32);
    if(painted(c)){STATE.set(url,1)}else{STATE.set(url,2);X.stats.blank++;X.bad[k]='blank';rebuild(Object.assign({},it),k,0)}}catch(e){X.err='check '+e.message}};im.onerror=()=>{STATE.set(url,2);X.stats.blank++;rebuild(Object.assign({},it),k,0)};im.src=url}
try{const _i=itemIcon;itemIcon=function(it){const url=_i.apply(this,arguments);try{if(!it||typeof url!=='string')return url;const k=myKey(it);if(k&&MY[k])return MY[k];if(!STATE.has(url))check(url,it,k)}catch(e){X.err=e.message}return url}}catch(e){X.err='hook '+e.message}
})();

