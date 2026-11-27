
/* ---- itemicons-r1b (TEST, 11 Nov 2026): 227 item icons from Art (item_icons_r1b, QA PASS 227/227, DeaRz approved 10 Nov 20:24). ON by default; ?itemicons=off shows the old code-drawn icons. ----
   Key = pack file name: weapons w_<kind>_<grade>, gear e_<slot>_<grade>, set pieces set_<set>_<slot>, costumes c_<id>, consumables / materials by item id (+ spBox, gate_random_box, shards / books).
   The pack art has no frame and no glow: the game keeps drawing the grade glow (under the art) and the grade-coloured slot frame. Shard / book icons are shared by scythe and knuckle: a small S / K badge tells them apart.
   card_frame is loaded but unused until the monster card art arrives. Items with no icon keep the old one. Debug: window.__ITEMICONS (stats, missing list). ---- */
(function(){'use strict';
const OFF=/[?&]itemicons=off\b/.test(String(location.search));
const II=window.__ITEMICONS={ver:'itemicons-r1b',on:!OFF,err:null,hit:0,miss:0,missed:{},used:{},total:0};
const SRC=window.__ITEM_ICONS_R1B||{};II.total=Object.keys(SRC).length;
if(OFF)return;
const IM={};for(const k in SRC){const im=new Image();im.decoding='async';im.src=SRC[k];IM[k]=im}
const ok=k=>{const im=IM[k];return im&&im.complete&&im.naturalWidth?im:null};
const cache={};
const ID_ALIAS={gateRandBox:'gate_random_box'};
function packKey(it){if(!it)return null;
  if(it.kind==='wpn'){if(it.t==='fist')return null;const kind=(it.t==='staff'&&it.hs)?'holy':it.t;return 'w_'+kind+'_'+Math.max(0,Math.min(6,it.rar|0))}
  if(it.kind==='eq'){if(it.set)return 'set_'+it.set+'_'+it.type;return 'e_'+it.type+'_'+Math.max(0,Math.min(6,it.rar|0))}
  if(it.kind==='fash')return it.cid?(/^c_/.test(it.cid)?it.cid:'c_'+it.cid):null;
  const id=it.id;if(!id)return null;if(ID_ALIAS[id])return ID_ALIAS[id];
  if(/^it_weapon_book_shard_/.test(id))return 'it_weapon_book_shard';if(/^it_weapon_book_/.test(id))return 'it_weapon_book';
  return id}
function glowCol(it){try{if(it.kind==='wpn'||it.kind==='eq'||it.kind==='fash')return RARITY[it.rar|0].c;const d=ITEMS[it.id];return d&&d.col||null}catch(_){return null}}
const _old=itemIcon;
itemIcon=function(it){let key=null;try{if(it&&it.img)return _old.apply(this,arguments);key=packKey(it);
    if(key){const im=ok(key);if(im){const ck=(typeof iconKey==='function'?iconKey(it):key)+'|'+key+(it.kind==='fash'?'|'+(it.rar|0):'')+(it.sty?'|s'+it.sty:'');
      if(cache[ck])return cache[ck];
      const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const col=glowCol(it);
      if(col&&typeof glowSprite==='function'){g.globalCompositeOperation='lighter';g.drawImage(glowSprite(col),0,0,64,64);g.globalCompositeOperation='source-over'}
      g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(im,2,2,60,60);
      const id=it.id||'',b=/_scythe$/.test(id)?'S':/_knuckle$/.test(id)?'K':'';
      if(b&&/^it_weapon_book/.test(id)){g.fillStyle='rgba(20,14,40,.9)';g.beginPath();g.arc(50,50,11,0,6.283);g.fill();g.strokeStyle=b==='S'?'#c9a8ff':'#ffb070';g.lineWidth=2;g.stroke();g.fillStyle='#fff';g.font='700 14px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(b,50,51)}
      const url=c.toDataURL();cache[ck]=url;if(typeof ICONS!=='undefined')ICONS[(typeof iconKey==='function'?iconKey(it):ck)]=url;try{ICONCV[typeof iconKey==='function'?iconKey(it):ck]=c}catch(_){}
      II.hit++;II.used[key]=1;return url}
    II.miss++;II.missed[key]=1}else if(it&&it.kind!=='wpn'){II.miss++;II.missed[(it.kind||'?')+':'+(it.id||it.cid||'?')]=1}}catch(e){II.err=e.message}
  return _old.apply(this,arguments)};
/* items in the game that have no icon file: computed on demand from the game's own tables */
II.report=function(){const out={noIcon:[],unusedFiles:[]};const used={};
  const chk=(label,it)=>{const k=packKey(it);if(!k||!SRC[k])out.noIcon.push(label+(k?' ('+k+')':''));else used[k]=1};
  try{for(const id in ITEMS){const d=ITEMS[id];chk('item '+id,{id,kind:'it'})}}catch(_){}
  try{for(const t in WEAPONS)for(let r=0;r<7;r++){if(t==='fist')continue;used['w_'+t+'_'+r]=SRC['w_'+t+'_'+r]?1:used['w_'+t+'_'+r];if(!SRC['w_'+t+'_'+r])out.noIcon.push('weapon '+t+' grade '+r)}}catch(_){}
  try{for(const t of GEAR_TYPES)for(let r=0;r<7;r++){if(SRC['e_'+t+'_'+r])used['e_'+t+'_'+r]=1;else out.noIcon.push('gear '+t+' grade '+r)}}catch(_){}
  try{for(const s in SETS)for(const sl in SETS[s].pieces){const k='set_'+s+'_'+sl;if(SRC[k])used[k]=1;else out.noIcon.push(k)}}catch(_){}
  try{for(const c of BUILTIN_COSTUMES){const k=/^c_/.test(c.id)?c.id:'c_'+c.id;if(SRC[k])used[k]=1;else out.noIcon.push('costume '+c.id)}}catch(_){}
  for(const k of ['it_weapon_book_shard','it_weapon_book','gate_random_box','spBox'])if(SRC[k])used[k]=1;
  for(const k in SRC)if(!used[k]&&!ITEMS[k])out.unusedFiles.push(k);
  return out};
console.info('[ITEMICONS] item icons loaded: '+II.total+' files');
})();
