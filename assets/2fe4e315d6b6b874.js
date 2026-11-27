
/* ---- iteminfo-r1 (TEST, 12 Nov 2026): generic item info panel + card info (DRAFT card table, display only) ----
   * tap an item in the bag / equipment window / shop row -> bottom-sheet panel in the game's HUD skin (same dark glass + mint line as the item tooltip);
   * fields shown only when the item has them: icon, name (rarity / item colour), type, slot ("จุดสวมใส่"), stats, refine, heal, card slot, class, required level, description, sell / buy price, quantity;
   * gear reuses the game's own tipFor() body (so the numbers match the hover tooltip); the hover tooltip of non-gear items is extended too (type / heal / price);
   * cards: name_th + name_en (small), "ความสามารถ" lines, optional "เอฟเฟกต์สะสม", "จุดสวมใส่", type "การ์ด", small "ร่าง" tag. Data = window.__CARDS.data[slug] = {name_th,name_en,effects:[{stat,val}],slot,collect:[{stat,val}]};
     built-in = Balance's DRAFT cards_r1.json; override: ?cardsjson=<url>  or  __CARDS.load(objOrArray)  or  __CARDS.loadUrl(url). A card without data shows "ความสามารถ: รอกำหนด" / "จุดสวมใส่: รอกำหนด".
   * NOTHING is applied: no card effects, no insertion, no collection bonuses, no drops. ?iteminfo=off disables. Debug: window.__ITEMINFO ---- */
(function(){'use strict';
const Q=String(location.search),OFF=/[?&]iteminfo=off\b/.test(Q);
const II=window.__ITEMINFO={ver:'iteminfo-r1',on:!OFF,err:null,shown:0};
if(OFF)return;
const ERR=(w,e)=>{II.err=w+': '+((e&&e.message)||e);try{console.error('[ITEMINFO]',w,e)}catch(_){}};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmtN=n=>{try{return fmt(n)}catch(_){return String(n)}};
/* ---------- card data (draft) ---------- */
const CARDDATA=[{"slug":"slime","name_th":"การ์ดสไลม์","name_en":"Slime Card","effects":[{"stat":"maxHP%","val":4}],"slot":"armor","collect":[{"stat":"maxHP%","val":1}],"drop":0.001},{"slug":"leafbun","name_th":"การ์ดลีฟบัน","name_en":"Leafbun Card","effects":[{"stat":"move%","val":4}],"slot":"shoes","collect":[{"stat":"move%","val":1}],"drop":0.001},{"slug":"seedling","name_th":"การ์ดต้นกล้า","name_en":"Seedling Card","effects":[{"stat":"hpRegen%","val":10}],"slot":"headTop","collect":[{"stat":"hpRegen%","val":2}],"drop":0.001},{"slug":"venomslime","name_th":"การ์ดสไลม์พิษ","name_en":"Venom Slime Card","effects":[{"stat":"resPoison%","val":20}],"slot":"garment","collect":[{"stat":"resPoison%","val":5}],"drop":0.001},{"slug":"puffcap","name_th":"การ์ดเห็ดพัฟ","name_en":"Puffcap Card","effects":[{"stat":"maxMP%","val":6}],"slot":"headTop","collect":[{"stat":"maxMP%","val":1.5}],"drop":0.001},{"slug":"briarfox","name_th":"การ์ดจิ้งจอกหนาม","name_en":"Briar Fox Card","effects":[{"stat":"crit%","val":2}],"slot":"acc","collect":[{"stat":"crit%","val":0.5}],"drop":0.001},{"slug":"mossback","name_th":"การ์ดเต่ามอส","name_en":"Moss Turtle Card","effects":[{"stat":"def%","val":6}],"slot":"armor","collect":[{"stat":"def%","val":1.5}],"drop":0.001},{"slug":"stoneboar","name_th":"การ์ดหมูป่าหิน","name_en":"Stone Boar Card","effects":[{"stat":"atk%","val":4}],"slot":"weapon","collect":[{"stat":"atk%","val":1}],"drop":0.001},{"slug":"ruinwarden","name_th":"การ์ดผู้พิทักษ์ซากปรักหักพัง","name_en":"Elder Ruin Warden Card","effects":[{"stat":"def%","val":4},{"stat":"maxHP%","val":4}],"slot":"shield","collect":[{"stat":"def%","val":1},{"stat":"maxHP%","val":1}],"drop":0.001},{"slug":"galefeather","name_th":"การ์ดขนนกพายุ","name_en":"Gale Feather Card","effects":[{"stat":"aspd%","val":4}],"slot":"acc","collect":[{"stat":"aspd%","val":1}],"drop":0.001},{"slug":"frostquill","name_th":"การ์ดเม่นน้ำแข็ง","name_en":"Frostquill Card","effects":[{"stat":"resWater%","val":16}],"slot":"garment","collect":[{"stat":"resWater%","val":4}],"drop":0.001},{"slug":"rimeguard","name_th":"การ์ดอัศวินน้ำค้างแข็ง","name_en":"Rimeguard Knight Card","effects":[{"stat":"def%","val":8}],"slot":"shield","collect":[{"stat":"def%","val":2}],"drop":0.001},{"slug":"hollowlantern","name_th":"การ์ดโคมกลวง","name_en":"Hollow Lantern Card","effects":[{"stat":"mpRegen%","val":10}],"slot":"headTop","collect":[{"stat":"mpRegen%","val":2}],"drop":0.001},{"slug":"mistling","name_th":"การ์ดมิสต์ลิง","name_en":"Mistling Card","effects":[{"stat":"exp%","val":4}],"slot":"acc","collect":[{"stat":"exp%","val":1}],"drop":0.001},{"slug":"veilwater_serpent","name_th":"การ์ดอสรพิษม่านธาร","name_en":"Veilwater Serpent Card","effects":[{"stat":"atk%","val":10},{"stat":"special","val":"โจมตีปกติ 5% เกิดคลื่นน้ำ 150% รอบตัว r120"}],"slot":"weapon","collect":[{"stat":"atk%","val":3}],"drop":0.001,"boss":true},{"slug":"bogtoad","name_th":"การ์ดคางคกหนองน้ำ","name_en":"Bog Toad Card","effects":[{"stat":"maxHP%","val":6}],"slot":"armor","collect":[{"stat":"maxHP%","val":1.5}],"drop":0.001},{"slug":"meadowram","name_th":"การ์ดแกะทุ่งหญ้า","name_en":"Meadow Ram Card","effects":[{"stat":"atk%","val":4}],"slot":"weapon","collect":[{"stat":"atk%","val":1}],"drop":0.001},{"slug":"pinesquirrel","name_th":"การ์ดกระรอกสน","name_en":"Pinecone Squirrel Card","effects":[{"stat":"eva%","val":4}],"slot":"shoes","collect":[{"stat":"eva%","val":1}],"drop":0.001},{"slug":"buzzbee","name_th":"การ์ดผึ้งหึ่ง","name_en":"Buzzbee Card","effects":[{"stat":"critDmg%","val":6}],"slot":"weapon","collect":[{"stat":"critDmg%","val":1.5}],"drop":0.001},{"slug":"strawman","name_th":"การ์ดหุ่นฟาง","name_en":"Strawman Card","effects":[{"stat":"exp%","val":4}],"slot":"acc","collect":[{"stat":"exp%","val":1}],"drop":0.001},{"slug":"gloomcrow","name_th":"การ์ดอีกาหม่น","name_en":"Gloomcrow Card","effects":[{"stat":"resDark%","val":16}],"slot":"garment","collect":[{"stat":"resDark%","val":4}],"drop":0.001},{"slug":"crystal_bat","name_th":"การ์ดค้างคาวคริสตัล","name_en":"Crystal Bat Card","effects":[{"stat":"aspd%","val":4}],"slot":"acc","collect":[{"stat":"aspd%","val":1}],"drop":0.001},{"slug":"shard_crab","name_th":"การ์ดปูเศษคริสตัล","name_en":"Shard Crab Card","effects":[{"stat":"def%","val":6}],"slot":"shield","collect":[{"stat":"def%","val":1.5}],"drop":0.001},{"slug":"drowned_guard","name_th":"การ์ดทหารวิหารจมน้ำ","name_en":"Drowned Temple Guard Card","effects":[{"stat":"resWater%","val":16}],"slot":"shield","collect":[{"stat":"resWater%","val":4}],"drop":0.001},{"slug":"eel_serpentling","name_th":"การ์ดงูปลาไหลน้อย","name_en":"Eel Serpentling Card","effects":[{"stat":"move%","val":4}],"slot":"shoes","collect":[{"stat":"move%","val":1}],"drop":0.001},{"slug":"sporeling","name_th":"การ์ดเห็ดน้อย","name_en":"Sporeling Card","effects":[{"stat":"resPoison%","val":16}],"slot":"garment","collect":[{"stat":"resPoison%","val":4}],"drop":0.001},{"slug":"moth_sprite","name_th":"การ์ดแมลงเม่าแสง","name_en":"Moth Sprite Card","effects":[{"stat":"eva%","val":4}],"slot":"shoes","collect":[{"stat":"eva%","val":1}],"drop":0.001},{"slug":"magma_imp","name_th":"การ์ดภูตแมกม่า","name_en":"Magma Imp Card","effects":[{"stat":"resFire%","val":16}],"slot":"garment","collect":[{"stat":"resFire%","val":4}],"drop":0.001},{"slug":"iron_golem_hound","name_th":"การ์ดหมาเหล็ก","name_en":"Iron Golem Hound Card","effects":[{"stat":"atk%","val":6}],"slot":"weapon","collect":[{"stat":"atk%","val":1.5}],"drop":0.001},{"slug":"shadow_knight","name_th":"การ์ดอัศวินเงา","name_en":"Shadow Knight Card","effects":[{"stat":"atk%","val":6},{"stat":"def%","val":4}],"slot":"armor","collect":[{"stat":"atk%","val":1.5}],"drop":0.001},{"slug":"wraith","name_th":"การ์ดผีวิญญาณ","name_en":"Wraith Card","effects":[{"stat":"resDark%","val":20}],"slot":"shield","collect":[{"stat":"resDark%","val":5}],"drop":0.001},{"slug":"crystal_golem","name_th":"การ์ดโกเลมคริสตัล","name_en":"Crystal Golem Card","effects":[{"stat":"def%","val":15},{"stat":"special","val":"โดนตี 10% ได้เกราะคริสตัล 8% maxHP 5 วิ (cd 10 วิ)"}],"slot":"armor","collect":[{"stat":"def%","val":4}],"drop":0.001,"boss":true},{"slug":"tide_guardian","name_th":"การ์ดผู้พิทักษ์กระแสน้ำ","name_en":"Tide Guardian Card","effects":[{"stat":"maxHP%","val":15},{"stat":"special","val":"ฆ่าม้อนได้ฟื้น HP 1% maxHP"}],"slot":"armor","collect":[{"stat":"maxHP%","val":4}],"drop":0.001,"boss":true},{"slug":"mushroom_king","name_th":"การ์ดราชาเห็ด","name_en":"Mushroom King Card","effects":[{"stat":"hpRegen%","val":40},{"stat":"resPoison%","val":30},{"stat":"special","val":"ฆ่าม้อน 10% ปล่อยหมอกสปอร์พิษ 50%/วิ 3 วิ r150"}],"slot":"headTop","collect":[{"stat":"hpRegen%","val":8}],"drop":0.001,"boss":true},{"slug":"forge_titan","name_th":"การ์ดไททันโรงหลอม","name_en":"Forge Titan Card","effects":[{"stat":"atk%","val":12},{"stat":"critDmg%","val":15},{"stat":"special","val":"คริติคอล 20% จุดไฟ 30%/วิ 3 วิ"}],"slot":"weapon","collect":[{"stat":"atk%","val":3}],"drop":0.001,"boss":true},{"slug":"shadow_demon_lord","name_th":"การ์ดเงาจอมมาร","name_en":"Shadow of the Demon Lord Card","effects":[{"stat":"allDmg%","val":10},{"stat":"bossDmg%","val":20},{"stat":"special","val":"ทุก 10 วิ ตีถัดไปแรง ×2"}],"slot":"weapon","collect":[{"stat":"allDmg%","val":3}],"drop":0.001,"boss":true}];
const CD=window.__CARDS=window.__CARDS||{};
CD.data=CD.data||{};CD.dataSource='cards_r1.json (draft)';
function load(src,label){const arr=Array.isArray(src)?src:(src&&src.cards)||Object.values(src||{});let n=0;for(const c of arr){if(c&&c.slug){CD.data[c.slug]=c;n++}}CD.dataSource=label||'override';return n}
CD.load=load;CD.loadUrl=u=>fetch(u).then(r=>r.json()).then(j=>load(j,u));
load(CARDDATA,'cards_r1.json (draft)');
{const m=Q.match(/[?&]cardsjson=([^&]+)/);if(m){try{CD.loadUrl(decodeURIComponent(m[1])).catch(e=>ERR('cardsjson',e))}catch(e){ERR('cardsjson',e)}}}
const STAT={'maxHP%':'HP สูงสุด','maxMP%':'MP สูงสุด','atk%':'พลังโจมตี','allDmg%':'ดาเมจรวม','aspd%':'ความเร็วโจมตี','crit%':'คริติคอล','critDmg%':'ดาเมจคริติคอล','def%':'ป้องกัน','eva%':'หลบหลีก','exp%':'EXP ที่ได้รับ','hpRegen%':'การฟื้น HP','mpRegen%':'การฟื้น MP','move%':'ความเร็วเดิน','resPoison%':'ต้านพิษ','resFire%':'ต้านไฟ','resWater%':'ต้านน้ำ','resDark%':'ต้านมืด','bossDmg%':'ดาเมจต่อบอส'};
const SLOT={weapon:'อาวุธ',armor:'ชุดเกราะ',shield:'โล่',garment:'ผ้าคลุม',shoes:'รองเท้า',headTop:'หมวก',headMid:'หน้ากากบน',headLow:'ผ้าปิดปาก',acc:'เครื่องประดับ'};
const statLine=e=>{if(e.stat==='special')return '★ '+e.val;const lab=STAT[e.stat]||e.stat,v=+e.val,u=/%$/.test(e.stat)?'%':'';return lab+' '+(v>=0?'+':'')+(Math.round(v*100)/100)+u};
/* ---------- CSS ---------- */
{const st=document.createElement('style');st.textContent=`
#iiPanel{position:fixed;left:50%;bottom:8px;transform:translateX(-50%);z-index:9500;width:min(94vw,400px);max-height:64vh;overflow:auto;box-sizing:border-box;padding:12px 14px 12px;border-radius:14px;background:rgba(6,10,28,.97);border:1px solid var(--line,rgba(125,255,220,.2));box-shadow:0 10px 36px rgba(0,0,0,.6),inset 0 0 0 1px rgba(255,255,255,.04);color:var(--text,#e4f1ff);font:13px/1.5 "Noto Sans Thai",system-ui,sans-serif;display:none;-webkit-overflow-scrolling:touch}
#iiPanel.in{display:block}
#iiPanel .iih{display:flex;gap:10px;align-items:flex-start;padding-right:26px}
#iiPanel .iih img{width:48px;height:48px;image-rendering:auto;flex:none;border-radius:9px;background:rgba(255,255,255,.05);border:1px solid var(--line,rgba(125,255,220,.2));object-fit:contain}
#iiPanel .iin{font-weight:700;font-size:15px;line-height:1.25}
#iiPanel .iie{font-size:11px;color:var(--muted,#8fa4cc);font-weight:400}
#iiPanel .iit{font-size:12px;color:var(--muted,#8fa4cc)}
#iiPanel .iix{position:absolute;right:8px;top:6px;width:28px;height:28px;border-radius:8px;border:1px solid var(--line,rgba(125,255,220,.2));background:rgba(255,255,255,.04);color:var(--text,#e4f1ff);font-size:15px;line-height:1;cursor:pointer}
#iiPanel .iis{margin-top:8px;padding-top:6px;border-top:1px dashed rgba(143,164,204,.25)}
#iiPanel .iis h4{margin:0 0 3px;font-size:12px;color:var(--mint,#8dffc8);font-weight:700;letter-spacing:.02em}
#iiPanel .iir{display:flex;justify-content:space-between;gap:10px;font-size:13px}
#iiPanel .iir span:first-child{color:var(--muted,#8fa4cc)}
#iiPanel .iir b{font-variant-numeric:tabular-nums;text-align:right}
#iiPanel .iip{color:var(--mint,#8dffc8)}
#iiPanel .iid{margin-top:6px;font-size:12px;color:#c9d8f0}
#iiPanel .iia{display:flex;gap:8px;margin-top:10px}
#iiPanel .iia button{flex:1;padding:8px 6px;border-radius:10px;border:1px solid var(--line,rgba(125,255,220,.2));background:rgba(125,255,220,.1);color:var(--text,#e4f1ff);font:inherit;font-weight:700;cursor:pointer}
#iiPanel .draft{display:inline-block;font-size:10px;background:#ffb347;color:#1c1204;border-radius:5px;padding:0 5px;margin-left:6px;vertical-align:middle;font-weight:700}
#iiPanel .tstats{margin:4px 0;display:grid;gap:2px}
#iiPanel .tstats div{display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:baseline}
#iiPanel .tstats div.z>span,#iiPanel .tstats div.z>b{opacity:.32;font-weight:400}
#iiPanel em{font-style:normal;font-weight:700;font-size:12px}#iiPanel em.up{color:#6dff8e}#iiPanel em.down{color:#ff6b7b}
#iiPanel .tcmp{font-size:12px;color:var(--muted,#8fa4cc);border-top:1px dashed rgba(143,164,204,.25);padding-top:4px}
#iiPanel .muted{color:var(--muted,#8fa4cc)}#iiPanel .tag{font-size:10px;background:var(--mint,#8dffc8);color:#06101a;border-radius:5px;padding:0 5px}
#iiPanel.inCard{position:static;transform:none;width:min(94vw,400px);max-height:none;display:block;margin:0;box-shadow:none}
`;document.head.appendChild(st)}
/* ---------- helpers ---------- */
const KIND={pot:'ยา / ไอเทมใช้งาน',mat:'วัตถุดิบ',use:'ไอเทมใช้งาน',card:'การ์ด',gem:'อัญมณีตีบวก',dye:'สีย้อม',scroll:'ม้วนคัมภีร์ตีบวก',stone:'หินเสริมพลัง',drill:'สว่านเจาะช่อง'};
function typeOf(id,d){id=String(id||'');
  if(/^it_weapon_book_shard/.test(id))return'เศษตำราอาวุธ (ชิ้นส่วน)';
  if(/^it_weapon_book/.test(id))return'ตำราอาวุธ';
  if(/skillbook/.test(id))return'ตำราสกิล';
  if(/^(qi_|ki_)/.test(id)||d.key)return'ไอเทมเควสต์';
  if(/^gate_mat/.test(id))return'วัตถุดิบเกต';
  if(/^gateRandBox$|^spBox$/.test(id))return'กล่องสุ่ม';
  if(/^(m?card_)/.test(id)||d.k==='card')return'การ์ด';
  return KIND[d.k]||'ไอเทม'}
const isG=it=>!!it&&(it.kind==='wpn'||it.kind==='eq');
const R=(a,b,cls)=>`<div class="iir${cls?' '+cls:''}"><span>${a}</span><b>${b}</b></div>`;
function cardOf(id){try{const c=window.__CARDS&&__CARDS.items&&__CARDS.items[id];return c||null}catch(_){return null}}
const ALIAS={drowned_temple_guard:'drowned_guard',shadow_of_the_demon_lord:'shadow_demon_lord',bog_toad:'bogtoad',meadow_ram:'meadowram',pinecone_squirrel:'pinesquirrel',buzz_bee:'buzzbee',strawman_scarecrow:'strawman',venom_slime:'venomslime',leaf_bunny:'leafbun',walking_seedling:'seedling',briar_fox:'briarfox',mossback_tortoise:'mossback',stone_boar:'stoneboar',quarry_warden_stone_golem:'ruinwarden',gale_feather:'galefeather',rimeguard_frost_knight:'rimeguard',hollow_lantern:'hollowlantern'};
function cardData(c){return c&&(CD.data[c.slug]||CD.data[ALIAS[c.slug]]||CD.data[String(c.slug).replace(/_/g,'')])||null}
/* ---------- card body (also used inside the big card view) ---------- */
function cardBody(c){const dd=cardData(c);const th=(dd&&dd.name_th)||('การ์ด'+(c.monster||'')),en=(dd&&dd.name_en)||(c.monster?c.monster+' Card':'');
  let h=`<div class="iih"><img src="${esc(c.iconFace||c.icon||'')}" alt=""><div><div class="iin" style="color:${c.boss?'#ffb347':'#ffd36b'}">${esc(th)}</div><div class="iie">${esc(en)}${c.boss?' · BOSS':''}</div><div class="iit">ประเภท: การ์ด</div></div></div>`;
  h+=`<div class="iis"><h4>ความสามารถ</h4>`;
  if(dd&&dd.effects&&dd.effects.length)h+=dd.effects.map(e=>`<div class="iir"><span>${esc(statLine(e))}</span></div>`).join('');else h+=`<div class="iir"><span>ความสามารถ: รอกำหนด</span></div>`;
  h+=`</div>`;
  if(dd&&dd.collect&&dd.collect.length)h+=`<div class="iis"><h4>เอฟเฟกต์สะสม</h4>${dd.collect.map(e=>`<div class="iir"><span>${esc(statLine(e))}</span></div>`).join('')}<div class="iit" style="font-size:11px">ได้เมื่อสะสมการ์ดใบนี้ในสมุดสะสม</div></div>`;
  h+=(window.__CARDSYS&&__CARDSYS.cardHtml?__CARDSYS.cardHtml(c):'');
  h+=`<div class="iis">${R('จุดสวมใส่',dd&&dd.slot?esc(SLOT[dd.slot]||dd.slot):'รอกำหนด','iip')}</div>`;

  return h}
II.cardEl=function(c){const el=document.createElement('div');el.id='iiPanel';el.className='inCard in';el.innerHTML=cardBody(c);el.addEventListener('click',e=>e.stopPropagation());return el};
/* ---------- gear / item bodies ---------- */
function gearBody(it,opt){let tip='';try{tip=tipFor(it)}catch(e){ERR('tipFor',e)}
  const tmp=document.createElement('div');tmp.innerHTML=tip;/* drop the "double-click to equip" hint line of the hover tooltip */
  for(const d of [...tmp.querySelectorAll('div.muted')]){if(/ดับเบิลคลิก|คลิกเพื่อ/.test(d.textContent))d.remove()}
  for(const s of [...tmp.querySelectorAll('span.muted')]){if(/คลิกเพื่อ|ดับเบิลคลิก/.test(s.textContent)){const p=s.previousSibling;if(p&&p.nodeName==='BR')p.remove();s.remove()}}
  /* split off the first <b> name so the header can be built */
  tmp.innerHTML=tmp.innerHTML.replace('ช่องการ์ด:','ช่องการ์ด (ระบบเดิม):');const nm=(typeof itemName==='function'?itemName(it):it.name)||it.name,col=(RARITY[it.rar]||{}).c||'#e4f1ff',rar=(RARITY[it.rar]||{}).th||'';
  for(const g of [...tmp.querySelectorAll('.gtag')])g.remove();const first=tmp.querySelector('b');if(first){const br=first.nextSibling;first.remove();if(br&&br.nodeName==='BR')br.remove()}{const sp=tmp.querySelector('span.muted');if(sp&&/Lv\s*\d/.test(sp.textContent)){const br=sp.nextSibling;sp.remove();if(br&&br.nodeName==='BR')br.remove()}for(const g of [...tmp.querySelectorAll('span.tag')]){}}
  const isW=it.kind==='wpn',typ=isW?`อาวุธ · ${esc(WEAPONS[it.t]&&WEAPONS[it.t].th||'')} (${esc(WEAPONS[it.t]&&WEAPONS[it.t].n||'')})`:`ชุดเกราะ · ${esc(GEAR[it.type]&&GEAR[it.type].n||'')}`;
  const slotTh=isW?'อาวุธ':(SLOT[it.type]||it.type);
  let h=`<div class="iih"><img src="${esc(itemIcon(it))}" alt=""><div><div class="iin" style="color:${col}">${esc(nm)}</div><div class="iit">${rar?'ความหายาก: '+esc(rar)+' · ':''}ประเภท: ${typ}</div></div></div>`;
  h+=`<div class="iis">${tmp.innerHTML}</div>`;
  h+=`<div class="iis">${R('จุดสวมใส่',esc(slotTh),'iip')}${it.lvl?R('เลเวลอุปกรณ์','Lv '+it.lvl):''}${it.refine?R('ตีบวก','+'+it.refine):''}${R('ราคาขาย',fmtN(sellPrice(it))+' G')}</div>`;
  if(window.__CARDSYS&&__CARDSYS.gearHtml)h+=__CARDSYS.gearHtml(it);
  return h}
function itemBody(it,price){const d=ITEMS[it.id]||{n:it.id,d:''};const typ=typeOf(it.id,d),col=d.col||'#e4f1ff';
  let h=`<div class="iih"><img src="${esc(itemIcon(it))}" alt=""><div><div class="iin" style="color:${esc(col)}">${esc(d.n)}${it.q>1?` <span class="iie">x${it.q}</span>`:''}</div><div class="iit">ประเภท: ${esc(typ)}</div></div></div>`;
  let rows='';
  if(d.heal)rows+=R('ฟื้น HP',Math.round(d.heal*100)+'%');
  if(d.mana)rows+=R('ฟื้น MP',Math.round(d.mana*100)+'%');
  if(d.slot)rows+=R('จุดสวมใส่',esc(SLOT[d.slot]||d.slot),'iip');
  if(it.q!=null)rows+=R('จำนวน','x'+it.q);
  if(rows)h+=`<div class="iis">${rows}</div>`;
  if(d.d)h+=`<div class="iis"><div class="iid">${esc(d.d)}</div></div>`;
  let pr='';const sell=d.noSell?null:(d.sell!=null?d.sell:(d.price?Math.round(d.price/3):null));
  if(price!=null)pr+=R('ราคาซื้อ',fmtN(price)+' G');
  if(sell)pr+=R('ราคาขาย',fmtN(sell)+' G');else if(d.noSell)pr+=R('ราคาขาย','ขายไม่ได้');
  if(d.keep)pr+=R('หมายเหตุ','เก็บไว้ (ไม่ขาย/ไม่ทิ้ง)');
  if(pr)h+=`<div class="iis">${pr}</div>`;
  return h}
/* ---------- the panel ---------- */
let el=null,lastKey='';
function ensure(){if(el)return el;el=document.createElement('div');el.id='iiPanel';document.body.appendChild(el);el.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('[data-iia]');if(!b)return;const a=b.dataset.iia;try{if(a==='close')hide();else if(a==='use'){const i=+b.dataset.i;hide();useInv(i);renderInv()}else if(a==='unequip'){hide();if(unequip(b.dataset.slot)){recalc();log('ถอดอุปกรณ์แล้ว')}renderInv()}}catch(er){ERR('action',er)}});return el}
function show(html,actions,key){const p=ensure();p.innerHTML=`<button class="iix" data-iia="close" aria-label="ปิด">✕</button>`+html+(actions?`<div class="iia">${actions}</div>`:'');p.classList.add('in');II.shown++;II.lastKey=key||'';try{const t=document.getElementById('tip');if(t)t.hidden=true}catch(_){}}
function hide(){if(el)el.classList.remove('in')}
II.show=show;II.hide=hide;
II.cardData=c=>cardData(c);
II.refresh=function(){if(el&&el.classList.contains('in')&&II._re)II._re()};
II.forBag=function(i){const it=P.inv[i];if(!it)return false;if(isG(it)&&it.uid!=null){const u=it.uid;II._re=()=>{const j=P.inv.findIndex(x=>x&&x.uid===u);if(j>=0)II.forBag(j);else hide()}}else II._re=null;const c=it.id&&cardOf(it.id);if(c)return false;
  if(isG(it)){show(gearBody(it),`<button data-iia="use" data-i="${i}">${canEquip(it)?'สวมใส่':'สวมใส่ไม่ได้'}</button>`,'bag'+i);return true}
  const d=ITEMS[it.id];if(!d)return false;const usable=(d.k==='pot'||d.k==='use')&&!/^(spBox|gateRandBox)$/.test(it.id)||/^(spBox|gateRandBox)$/.test(it.id);
  show(itemBody(it),usable?`<button data-iia="use" data-i="${i}">ใช้</button>`:'','bag'+i);return true};
II.forEquip=function(slot){const it=slot==='weapon'?P.weapon:P.equip[slot];if(!it)return false;II._re=()=>II.forEquip(slot);show(gearBody(it),`<button data-iia="unequip" data-slot="${esc(slot)}">ถอด</button>`,'eq'+slot);return true};
II.forShopRow=function(row){const btn=row.querySelector('button[data-buy],button[data-buyw],button[data-buyg],button[data-buyc]'),b=row.querySelector('b'),sm=row.querySelector('small'),im=row.querySelector('img');
  if(btn&&btn.dataset.buy&&ITEMS[btn.dataset.buy]){show(itemBody({id:btn.dataset.buy},btn.dataset.p!=null?+btn.dataset.p:null),'','shop'+btn.dataset.buy);return true}
  if(!b)return false;const price=btn?btn.textContent.trim():'';
  let h=`<div class="iih"><img src="${esc(im?im.src:'')}" alt=""><div><div class="iin">${b.innerHTML}</div><div class="iit">${btn&&btn.dataset.buyw?'ประเภท: อาวุธ':btn&&btn.dataset.buyg?'ประเภท: ชุดเกราะ / เครื่องประดับ':'ประเภท: ไอเทม'}</div></div></div>`;
  if(sm)h+=`<div class="iis"><div class="iid">${sm.innerHTML}</div></div>`;
  if(btn&&btn.dataset.buyg)h+=`<div class="iis">${R('จุดสวมใส่',esc(SLOT[btn.dataset.buyg]||btn.dataset.buyg),'iip')}</div>`;
  if(price)h+=`<div class="iis">${R('ราคาซื้อ',esc(price))}</div>`;
  show(h,'','shoprow');return true};
/* ---------- tap routing (capture; the game's own selection / use handlers keep working) ---------- */
document.addEventListener('click',e=>{try{if(!el||!el.classList.contains('in')){}else if(!e.target.closest('#iiPanel')&&!e.target.closest('.cell[data-inv],[data-eqtip],.tp')){hide()}
  const t=e.target;if(!t||!t.closest||t.closest('#iiPanel')||t.closest('#mcardView'))return;
  const cell=t.closest('.cell[data-inv]');if(cell){II.forBag(+cell.dataset.inv);return}
  const eq=t.closest('[data-eqtip]');if(eq&&!t.closest('[data-uneq-btn]')){II.forEquip(eq.dataset.eqtip);return}
  const row=t.closest('.tp');if(row&&!t.closest('button')&&row.querySelector('button[data-buy],button[data-buyw],button[data-buyg],button[data-buyc]')){II.forShopRow(row)}}catch(er){ERR('click',er)}},true);
/* hide when the window changes */
try{const _o=openWin;openWin=function(){hide();return _o.apply(this,arguments)}}catch(e){ERR('openWin',e)}
/* ---------- hover tooltip: extend for non-gear items (type / heal / price) ---------- */
try{const _t=tipFor;tipFor=function(it){let h=_t.apply(this,arguments);try{if(!isG(it)&&it&&it.id&&ITEMS[it.id]&&!cardOf(it.id)){const d=ITEMS[it.id];let x=`<div class="tcmp">ประเภท: ${esc(typeOf(it.id,d))}`;if(d.heal)x+=` · ฟื้น HP ${Math.round(d.heal*100)}%`;if(d.mana)x+=` · ฟื้น MP ${Math.round(d.mana*100)}%`;const sell=d.noSell?null:(d.sell!=null?d.sell:(d.price?Math.round(d.price/3):null));if(sell)x+=` · ขาย ${fmtN(sell)} G`;h+=x+'</div>'}}catch(_){}return h}}catch(e){ERR('hook tipFor',e)}
console.info('[ITEMINFO] ready');
})();
