
/* ---- r129 wikinew (v3l6): Realm Wiki (H button) rebuilt from the CURRENT game only. DeaRz order via coordinator 17 Nov 2026.
   The old wiki table (old classes / jobs / 79 old monsters / 22 old maps / fashion / old sets) is no longer used; categories with 0 entries are hidden.
   Live sources: quests = __QDATA2.quests (types main / side / affinity / daily) · NPCs = __QDATA2.npcs · maps = __WORLDMAP.nodes + Map 9 floors (ZONES, __WARP.circles, __ZONE_NAMES_22)
   · monsters = spawn census per map (WN.where, taken 17 Nov 2026 from the running game) + every monster that has a card (__MCARDS / ITEMS.mcard_*) and still exists in MOBS
   · weapons / skills / unlock levels = __WSK.lines + __WSK.cfg.unlock (holy staff = live while held, else snapshot) · robot = ROBOT.cfg · cards = __MCARDS (36 incl. 6 boss)
   · items = shop goods + refine / socket materials + quest items · systems pages use live tables (refineInfo, ELE_TABLE, DRILL, warp circles).
   Same look, same search. ?wikinew=off = old wiki. Debug: window.__WIKINEW ---- */
(function(){'use strict';
const Q=String(location.search),WN=window.__WIKINEW={ver:'wikinew-r1',on:!/[?&]wikinew=off\b/.test(Q),err:null,counts:{},built:0};
if(!WN.on)return;
const ERR=(w,e)=>{WN.err=w+': '+((e&&e.message)||e);try{console.error('[WIKINEW]',w,e)}catch(_){}};
const E=s=>wkE(s);
/* spawn census (what actually spawns per map, measured in the running game 17 Nov 2026) */
const WHERE=WN.where={cartroad_plains:['slime','leafbun','seedling','venomslime'],w22_map4_test:['stoneboar','mossback','puffcap','ruinwarden_m4'],w22_cave1_test:['stoneboar','mossback','ruinwarden_m4'],
 w22_map5_test:['stoneboar','mossback','galefeather','ruinwarden_m4'],w23_map6_test:['stoneboar','mossback','galefeather','ruinwarden_m4','shard_crab','crystal_bat'],w23_map8_test:['frostquill','hollowlantern','rimeguard'],
 w24_map10_test:['bogtoad','pinesquirrel','meadowram','buzzbee','strawman','gloomcrow'],map11:['ds_sand_scarab','ds_dune_gecko','ds_cactoid','ds_dust_jackal','ds_scarab_matriarch']};
const HOLY=[['โจมตี',['แสงพิพากษา','โคมลอยวิญญาณ','ตราผนึกแสง','วงแหวนทัณฑ์สวรรค์','ฝนหอกศักดิ์สิทธิ์']],['บัฟ / สนับสนุน',['แสงฟื้นฟู','พรแห่งแสง','ม่านพิทักษ์','เร่งมานา','รัศมีอรุณ']],['พาสซีฟ',['ศรัทธา','ใจเมตตา','แสงสะท้อน','เปลวไม่ดับ','ผู้พิทักษ์']]];
const QCOL={main:['เควสหลัก','#ffd36b'],side:['เควสรอง','#7fb8ff'],daily:['เควสรายวัน','#8fe39a'],affinity:['เควสพิเศษ (ความสนิท)','#d8a6ff'],special:['เควสพิเศษ','#d8a6ff']};
const PLAN={w22_map4_planned:'w22_map4_test',w22_map10_planned:'w24_map10_test'};
const zname=z=>{z=PLAN[z]||z;return ZONES[z]?ZONES[z].n:null};
const L=(cat,id,label)=>wkLink(cat,id,label);
const g=(ch,col)=>wkGlyph(ch,col);
const Qd=()=>window.__QDATA2||{quests:[],npcs:[],points:[],items:{}};
const itemName=id=>{try{if(ITEMS[id])return ITEMS[id].n}catch(_){}const it=Qd().items&&Qd().items[id];return it?it.n:id};
const ALIAS={quarry_warden_stone_golem:'ruinwarden_m4',frostquill:'frostquill',rimeguard_frost_knight:'rimeguard',hollow_lantern:'hollowlantern'};
let RS={};
function roster(){const R={};const add=(t,o)=>{R[t]=Object.assign(R[t]||{t},o)};
  for(const c of (window.__MCARDS?__MCARDS.cards:[])){const id='mcard_'+c.slug,I=ITEMS[id];if(!I)continue;const t=I.mob||ALIAS[c.slug]||c.slug;add(t,{card:id,boss:!!c.boss,cname:I.n.replace(/^การ์ด\s*/,''),ccol:I.col})}
  for(const z in WHERE)for(const t of WHERE[z])add(t,{});
  try{for(const z in ZONES)if(!WHERE[z]&&ZONES[z].mobs)for(const m of ZONES[z].mobs)add(m[0],{})}catch(_){}
  for(const t of Object.keys(R)){const m=MOBS[t],r=R[t];if(!m&&!r.card){delete R[t];(WN.missing=WN.missing||[]).push(t);continue}r.name=m?m.n:(r.cname||t);r.kind=m?wkMobKind(m):(r.boss?'boss':'normal');r.col=m?m.c:(r.ccol||'#cfe8ff')}
  RS=R;return R}
const mobName=t=>RS[t]?RS[t].name:(MOBS[t]?MOBS[t].n:t);
const mobIcon=t=>MOBS[t]?wkMobIcon(t):(RS[t]&&RS[t].card?wkItemIcon({id:RS[t].card,q:1}):g('☠','#345'));
const npcOf=id=>Qd().npcs.find(n=>n.id===id)||null;
const ptLabel=id=>{const a=Qd().points;const p=Array.isArray(a)?a.find(x=>x.id===id):null;return p?p.label:id};
const unlockTxt=row=>{try{const u=__WSK.cfg.unlock,v=u[Math.min(row|0,u.length-1)];return v>=1e6?'ชำนาญอาวุธ Lv.'+(v-1e6):v>0?'เลเวลตัวละคร '+v:'เปิดตั้งแต่เริ่ม'}catch(_){return ''}};
/* ---------- monsters ---------- */
function mobIdsOld(){const s=new Set();for(const z in WHERE)for(const t of WHERE[z])s.add(t);
  for(const k in ITEMS){const I=ITEMS[k];if(I&&I.k==='card'&&I.card2&&I.mob)s.add(I.mob)}
  try{for(const z in ZONES)if(WHERE[z]===undefined&&ZONES[z].mobs)for(const m of ZONES[z].mobs)s.add(m[0])}catch(_){}
  return [...s].filter(t=>{if(!MOBS[t]){WN.missing=(WN.missing||[]).concat(t);return false}return true})}
function mobWhere(t){const r=[];for(const z in WHERE)if(WHERE[z].includes(t))r.push(z);try{for(const z in ZONES)if(!WHERE[z]&&ZONES[z].mobs&&ZONES[z].mobs.some(m=>m[0]===t))r.push(z)}catch(_){}return r}
const cardOf=t=>(RS[t]&&RS[t].card)||null;
function mobQuests(t){return Qd().quests.filter(q=>(q.objectives||[]).some(o=>(o.types&&o.types.includes(t))||(o.dropFrom&&o.dropFrom.includes(t))))}
function mobPage(t){const m=MOBS[t]||{sp:'-'},kd=RS[t].kind,x=(typeof MOBX!=='undefined'&&MOBX[t])||null,wh=mobWhere(t),cd=cardOf(t),qs=mobQuests(t);
  let h=`<div class="wkHero"><img src="${mobIcon(t)}" alt=""><div><span class="wkTag" style="--c:${WK_KIND[kd][1]}">${WK_KIND[kd][0]}</span><div class="wkMeta">${x?'เผ่า <b>'+wkCap(x[0])+'</b> · ธาตุ <b>'+wkCap(x[1])+'</b> · ':''}${m.sp!=='-'?'ความเร็ว '+m.sp:''}${m.rng?' · โจมตีระยะไกล':''}</div></div></div>`;
  h+='<h4>พบได้ที่</h4>'+(wh.length?`<div class="wkChips">${wh.map(z=>L('zone',z,zname(z)||z)).join('')}</div>`:'<p class="muted">ไม่ได้เกิดตามแผนที่ปกติ (บอส / ประตูมิติ / อีเวนต์)</p>');
  if(cd)h+=`<h4>การ์ด</h4><div class="wkChips">${L('card',cd,ITEMS[cd].n)}</div>`;
  if(qs.length)h+=`<h4>เควสที่เกี่ยวข้อง</h4><div class="wkChips">${qs.map(q=>L('quest',q.id,q.name)).join('')}</div>`;
  if(m.elite||kd==='elite')h+='<p class="muted">Elite: มีคุณสมบัติพิเศษ (Affix) สุ่ม</p>';
  return h}
/* ---------- maps ---------- */
function zoneList(){const out=[];const nodes=(window.__WORLDMAP&&__WORLDMAP.nodes)||[];for(const n of nodes)if(ZONES[n[0]])out.push({z:n[0],label:n[1]});
  for(let f=2;f<=7;f++){const z='w24_map9f'+f+'_test';if(ZONES[z])out.push({z,label:'Map 9 ชั้น '+f})}return out}
function zoneEdges(z){const r=[];try{for(const c of (window.__WARP&&__WARP.circles)||[])if(c.z===z&&c.dest){const d=PLAN[c.dest]||c.dest;r.push(d)}}catch(_){}return [...new Set(r)]}
function zonePage(z,label){const Z=ZONES[z],m=/Map (\d+)/.exec(label),pn=m&&window.__ZONE_NAMES_22&&__ZONE_NAMES_22[m[1]];let h='';
  if(pn)h+=`<p>${E(pn[2]||'')}</p><p class="muted">ชื่อแผน: ${E(pn[0])} · ${E(pn[1])}</p>`;
  const ed=zoneEdges(z);h+='<h4>ทางไปต่อ (วงวาร์ป)</h4>'+(ed.length?`<div class="wkChips">${ed.map(d=>zname(d)?L('zone',d,zname(d)):`<span class="wkChip">${E(d.replace(/^w\d+_|_planned$/g,''))} (ยังไม่เปิด)</span>`).join('')}</div>`:'<p class="muted">ไม่มีวงวาร์ปออกจากแผนที่นี้ในตอนนี้</p>');
  const wh=(WHERE[z]||[]).filter(t=>RS[t]);if(wh.length)h+=`<h4>มอนสเตอร์</h4><div class="wkGrid">${wh.map(t=>`<a class="wkCard" data-wk="mob:${t}"><img src="${mobIcon(t)}" alt=""><b>${E(mobName(t))}</b><small>${RS[t].kind==='boss'?'บอส':RS[t].kind==='elite'?'Elite':'ทั่วไป'}</small></a>`).join('')}</div>`;
  const ns=Qd().npcs.filter(n=>(n.at&&n.at.zone===z)||n.map===z);if(ns.length)h+=`<h4>NPC</h4><div class="wkChips">${ns.map(n=>L('npc',n.id,n.name)).join('')}</div>`;
  const qs=Qd().quests.filter(q=>q.zone===z);if(qs.length)h+=`<h4>เควสในแมพนี้</h4><div class="wkChips">${qs.map(q=>`<a class="wkA" data-wk="quest:${E(q.id)}" style="border-color:${(QCOL[q.type]||QCOL.main)[1]};color:${(QCOL[q.type]||QCOL.main)[1]}">${E(q.name)}</a>`).join('')}</div>`;
  return h}
/* ---------- weapons ---------- */
function linesFor(t){const Ls=window.__WSK&&__WSK.lines;if(!Ls)return null;if(t==='holy'){const st=Ls.staff;if(st&&st.holy)return st;return null}return Ls[t]||null}
function skillRows(ln){let h='';ln.cols.forEach(c=>{if(!c.skills.length)return;h+=`<h4>${E(c.name)}</h4><table class="wkT"><tr><th></th><th>สกิล</th><th>ปลดล็อก</th><th>MP / CD</th></tr>`+c.skills.map(s=>{let ic='',ok=false,mp='-',d='';try{ic=s.icon()||''}catch(_){}try{ok=s.ok()}catch(_){}
      try{if(ok&&s.type==='active'){const k=s.cost();mp='MP '+k.mp+' · '+k.cd+' วิ'}}catch(_){}try{if(ok)d=String(s.desc()).replace(/^เลเวล \d+ \/ \d+\s*\n*/,'').slice(0,260)}catch(_){}
      return `<tr><td style="width:44px">${ic?`<img src="${ic}" alt="" style="width:38px;height:38px;border-radius:7px">`:''}</td><td><b>${E(s.name)}</b> <small class="muted">${s.type==='passive'?'พาสซีฟ':'สกิลกด'}${ok?'':' · ยังไม่เปิดใช้งาน'}</small>${d?`<div class="muted" style="font-size:12px;white-space:pre-line;max-width:520px">${E(d)}</div>`:''}</td><td>${E(unlockTxt(s.row))}</td><td>${E(mp)}</td></tr>`}).join('')+'</table>'});return h}
function holyRows(){let h='';HOLY.forEach(([cn,names])=>{h+=`<h4>${E(cn)}</h4><table class="wkT"><tr><th>สกิล</th><th>ปลดล็อก</th></tr>`+names.map((n,i)=>`<tr><td><b>${E(n)}</b></td><td>${E(unlockTxt(i))}</td></tr>`).join('')+'</table>'});return h}
function weaponList(){const L=[];const Ls=(window.__WSK&&__WSK.lines)||{};for(const t of ['sword','dagger','bow','staff'])if(Ls[t])L.push(t);
  if(Ls.staff&&window.HOLYW&&HOLYW.ok)L.push('holy');for(const t of ['scythe','knuckle','hammer'])if(Ls[t])L.push(t);if(window.ROBOT&&ROBOT.cfg&&Ls.hammer)L.push('robot');return L}
const WN_NAME={holy:['คทาพระ','Holy Staff'],robot:['หุ่นยนต์ไอน้ำ','Steam Robot']};
function wName(t){return WN_NAME[t]?WN_NAME[t][0]:(WEAPONS[t]&&WEAPONS[t].th)||t}
function weaponPage(t){let h='';const W0=WEAPONS[t==='holy'?'staff':t==='robot'?'hammer':t];
  if(t==='robot'){const c=ROBOT.cfg;h+=`<p>หุ่นยนต์ไอน้ำ เรียกด้วยสกิลของค้อนไอน้ำ (ปลดล็อกแถวที่ ${(c.UNLOCK_ROW|0)+1} · ${E(unlockTxt(c.UNLOCK_ROW))}) ขึ้นขี่แล้วโจมตีด้วยการคลิก / ใช้ท่ากระโดด กวาด ดีดตัวออก</p>
    <table class="wkT"><tr><th>MP</th><td>${c.MP}</td><th>คูลดาวน์</th><td>${c.CD} วิ</td></tr><tr><th>ดาเมจฐาน</th><td>${c.BASE}%</td><th>กระโดด CD</th><td>${c.JUMP_CD} วิ</td></tr><tr><th>กวาด CD</th><td>${c.SW_CD} วิ</td><th>ระยะกระโดด</th><td>${c.JUMP_RANGE} px</td></tr></table>
    <h4>ดาเมจตามเลเวลสกิล (Lv 1–10)</h4><div class="wkChips">${c.PCT.map((p,i)=>`<span class="wkChip">Lv${i+1} · ${p}%</span>`).join('')}</div><p class="muted">เลเวลสกิลเพิ่มด้วยแต้มสกิลในหน้าต่างทักษะอาวุธ (+1 เลเวล)</p>`;
    const ln=linesFor('hammer');if(ln)h+=skillRows(ln);return h}
  if(W0)h+=`<table class="wkT"><tr><th>ความเร็วโจมตี</th><td>${W0.aspd}</td><th>ระยะ</th><td>${W0.range}</td></tr></table>`;
  const ln=linesFor(t);h+=ln?skillRows(ln):(t==='holy'?'<p class="muted">สลับเป็นคทาพระด้วยปุ่ม 🔆 ตอนถือคทาเวท (รายการด้านล่างเป็นรายการสกิลของโหมดนี้ — เปิดหน้านี้ตอนถือคทาพระเพื่อดูรายละเอียดจริงของแต่ละสกิล)</p>'+holyRows():'');
  h+=`<h4>ระบบชำนาญอาวุธ</h4><p class="muted">สกิลแถวที่ 1–2 ใช้ได้ตั้งแต่เริ่ม · แถวที่ 3–5 ปลดล็อกตามเลเวลชำนาญอาวุธ (${[2,3,4].map(i=>unlockTxt(i)).join(' · ')}) · ใส่สกิลลงช่องแถบสกิลได้จากหน้าต่างทักษะอาวุธ (K)</p>`;return h}
/* ---------- quests / npcs ---------- */
function objText(o){const k=o.kind,n=o.n&&o.n>1?' ×'+o.n:'';
  if(k==='reach')return 'ไปที่ '+ptLabel(o.point);if(k==='interact')return 'โต้ตอบที่ '+ptLabel(o.point);if(k==='talk')return 'คุยกับ '+((npcOf(o.npc)||{}).name||o.npc);
  if(k==='buy')return 'ซื้อ '+itemName(o.item)+(o.n?' ×'+o.n:'')+(o.npc?' จาก '+((npcOf(o.npc)||{}).name||o.npc):'');if(k==='use')return 'ใช้ '+itemName(o.item)+(o.n?' ×'+o.n:'');
  if(k==='deliver')return 'ส่ง '+itemName(o.item)+(o.n?' ×'+o.n:'')+' ให้ '+((npcOf(o.npc)||{}).name||o.npc);
  if(k==='kill')return 'กำจัด '+(o.types||[]).map(mobName).join(' / ')+(o.n?' ×'+o.n:'')+(o.zone&&zname(o.zone)?' ที่ '+zname(o.zone):'');
  if(k==='collect')return 'เก็บ '+itemName(o.item)+(o.n?' ×'+o.n:'')+(o.dropFrom?' (ดรอปจาก '+o.dropFrom.map(mobName).join(' / ')+')':'');
  if(k==='hit_dummy')return 'ตีหุ่นซ้อม'+n+' ครั้ง';if(k==='switch_weapon')return 'สลับอาวุธ';if(k==='cutscene')return null;return k}
function questPage(q){const T=QCOL[q.type]||QCOL.main,rq=q.requires||{},rw=q.reward||{};
  let h=`<div class="wkHero"><div><span class="wkTag" style="--c:${T[1]}">${T[0]}</span><div class="wkMeta">${q.zone&&zname(q.zone)?'แมพ '+L('zone',q.zone,zname(q.zone)):''}${q.giver?' · ผู้ให้ '+L('npc',q.giver,(npcOf(q.giver)||{}).name||q.giver):''}${q.receiver&&q.receiver!==q.giver?' · ส่งที่ '+L('npc',q.receiver,(npcOf(q.receiver)||{}).name||q.receiver):''}</div></div></div>`;
  const aft=(rq.after||[]).map(id=>{const x=Qd().quests.find(y=>y.id===id);return x?L('quest',id,x.name):null}).filter(Boolean);
  h+=`<h4>เงื่อนไข</h4><ul class="wkUl"><li>เลเวลตัวละคร ${rq.lv||1}+</li>${aft.length?'<li>ทำเควสก่อนหน้า: '+aft.join(' ')+'</li>':''}${rq.aff?'<li>ความสนิท: '+E(JSON.stringify(rq.aff))+'</li>':''}</ul>`;
  const ob=(q.objectives||[]).map(objText).filter(Boolean);if(ob.length)h+=`<h4>เป้าหมาย</h4><ol class="wkUl">${ob.map(x=>`<li>${E(x)}</li>`).join('')}</ol>`;
  const it=(rw.items||[]).map(i=>E(itemName(i.id))+(i.n>1?' ×'+i.n:''));const af=rw.affinity?Object.entries(rw.affinity).map(([k,v])=>E((npcOf(k)||{}).name||k)+' +'+v):[];
  h+=`<h4>รางวัล</h4><ul class="wkUl">${rw.exp?`<li>EXP ${wkN(rw.exp)}</li>`:''}${rw.goldMult?`<li>Gold ×${rw.goldMult} (ตามเลเวลเควส)</li>`:''}${it.length?'<li>ไอเทม: '+it.join(', ')+'</li>':''}${af.length?'<li>ความสนิท: '+af.join(', ')+'</li>':''}</ul>`;
  return h}
function npcPage(n){let h=`<p>${E(n.title||'')}${n.position?' · '+E(n.position):''}</p>`;const qz=(Qd().quests.find(q=>q.giver===n.id||q.receiver===n.id)||{}).zone;const z=(n.at&&n.at.zone)||n.map||qz;if(!n.title&&!n.position&&!(n.shop&&n.shop.length))h='<p class="muted">ตัวละครในเควส</p>';if(z&&zname(z))h+=`<h4>อยู่ที่</h4><div class="wkChips">${L('zone',z,zname(z))}</div>`;
  if(n.shop&&n.shop.length)h+=`<h4>สินค้า</h4><table class="wkT">${n.shop.map(s=>`<tr><td>${E(itemName(s.id))}</td><td>${wkN(s.price)} G</td></tr>`).join('')}</table>`;
  const qs=Qd().quests.filter(q=>q.giver===n.id||q.receiver===n.id);if(qs.length)h+=`<h4>เควส</h4><div class="wkChips">${qs.map(q=>`<a class="wkA" data-wk="quest:${E(q.id)}" style="border-color:${(QCOL[q.type]||QCOL.main)[1]};color:${(QCOL[q.type]||QCOL.main)[1]}">${E(q.name)}</a>`).join('')}</div>`;
  if(n.affinity)h+='<p class="muted">NPC นี้มีระบบความสนิท (ให้ของขวัญ / เควสพิเศษ)</p>';return h}
/* ---------- systems ---------- */
function sysList(){const S=[];
  S.push(['refine','การตีบวก (Refine)','+1 ถึง +10 ที่ Master Smith','⚒',()=>{let r='';for(let n=1;n<=10;n++){let I=null;try{I=refineInfo({refine:n-1,lvl:50})}catch(e){}if(!I)continue;r+=`<tr><td>+${n-1} → +${n}</td><td><b style="color:${I.rate>=1?'#8dffc8':I.rate>=.4?'#ffd36b':'#ff8a9a'}">${Math.round(I.rate*100)}%</b></td><td>${ITEMS[I.mat]?L('item',I.mat,ITEMS[I.mat].n):E(I.mat)}</td><td>${I.safe?'ปลอดภัย':'ล้มเหลว = ลด +1'}</td></tr>`}
    return `<table class="wkT"><tr><th>ขั้น</th><th>โอกาส</th><th>วัสดุ</th><th>ถ้าล้มเหลว</th></tr>${r}</table>`}]);
  S.push(['card','ใส่การ์ด / เจาะรู','การ์ดมอนสเตอร์ · ช่องการ์ด','▣',()=>{const n=Object.keys(ITEMS).filter(k=>ITEMS[k].card2).length;let d='';try{d=`<li>เจาะรูเพิ่มด้วย ${L('item','abyssDrill',ITEMS.abyssDrill?ITEMS.abyssDrill.n:'Abyssal Drill')} โอกาสสำเร็จ <b>${Math.round(DRILL.rate*100)}%</b></li>`}catch(_){}
    return `<ul class="wkUl"><li>การ์ดมอนสเตอร์ในเกมตอนนี้ ${n} ใบ (รวมการ์ดบอส ${(window.__MCARDS?__MCARDS.cards.filter(c=>c.boss).length:0)}) ดูได้ที่หมวด “การ์ด”</li><li>การ์ดเก็บสะสมในสมุดการ์ด กดที่การ์ดในกระเป๋าเพื่อดูภาพการ์ด</li>${d}</ul>`}]);
  S.push(['element','ตารางธาตุ','ธาตุโจมตี × ธาตุเป้าหมาย','☯',()=>{if(typeof ELE_TABLE==='undefined')return '';const A=Object.keys(ELE_TABLE),D=Object.keys(ELE_TABLE[A[0]]||{});
    return `<div class="wkScroll"><table class="wkT wkSm"><tr><th>โจมตี ↓ / รับ →</th>${D.map(d=>`<th>${wkCap(d)}</th>`).join('')}</tr>${A.map(a=>`<tr><th>${wkCap(a)}</th>${D.map(d=>{const v=ELE_TABLE[a][d];return `<td style="color:${v>1?'#8dffc8':v<1?'#ff8a9a':'#c8d4f0'}">${Math.round(v*100)}%</td>`}).join('')}</tr>`).join('')}</table></div>`}]);
  S.push(['gates','ประตู / วงวาร์ป','เดินทางระหว่างแมพ','⛩',()=>{const by={};try{for(const c of __WARP.circles){if(!c.dest)continue;(by[c.z]=by[c.z]||new Set()).add(PLAN[c.dest]||c.dest)}}catch(_){}
    return `<p>ยืนบนวงวาร์ปค้างไว้ครู่หนึ่งเพื่อเดินทางไปแมพถัดไป</p><table class="wkT"><tr><th>จาก</th><th>ไป</th></tr>${Object.keys(by).filter(z=>zname(z)).map(z=>`<tr><td>${L('zone',z,zname(z))}</td><td>${[...by[z]].map(d=>zname(d)?L('zone',d,zname(d)):'<span class="muted">'+E(d.replace(/^w\d+_|_planned$/g,''))+' (ยังไม่เปิด)</span>').join(' ')}</td></tr>`).join('')}</table>`}]);
  S.push(['mastery','ชำนาญอาวุธ / JobLv','เลเวลสกิลและการปลดล็อกแถวสกิล','★',()=>{const u=(window.__WSK&&__WSK.cfg.unlock)||[];return `<ul class="wkUl"><li>ชำนาญอาวุธเพิ่มจากการใช้อาวุธนั้นต่อสู้ แยกตามอาวุธที่ถือ</li><li>แถวสกิลที่ 1–5 ปลดล็อก: ${u.map((v,i)=>'แถว '+(i+1)+' = '+unlockTxt(i)).join(' · ')}</li><li>เลเวลสกิล 1–5 เพิ่มด้วยแต้มสกิล (ได้ตามเลเวลตัวละคร) ในหน้าต่างทักษะอาวุธ · รีเซ็ตแต้มได้</li></ul>`}]);
  if(window.ROBOT&&ROBOT.cfg)S.push(['robot','หุ่นยนต์ไอน้ำ','ท่าของค้อนไอน้ำ','⚙',()=>`<p>ดูรายละเอียดที่หมวด “อาวุธ” › ${L('weapon','robot','หุ่นยนต์ไอน้ำ')}</p>`]);
  S.push(['discard','ทิ้งของ (หลายชิ้น)','โหมดเลือกทิ้งในกระเป๋า','🗑',()=>'<ul class="wkUl"><li>เปิดโหมดทิ้งในกระเป๋า แล้วแตะเลือกหลายชิ้นพร้อมกันได้</li><li>ของมีค่า / ของที่สวมอยู่จะมีข้อความเตือนก่อนทิ้ง</li></ul>']);
  S.push(['shop','ร้านค้า','ซื้อ-ขายกับ NPC','$',()=>{const rows=[];try{for(const n of Qd().npcs)if(n.shop&&n.shop.length)rows.push(`<tr><td>${L('npc',n.id,n.name)}</td><td>${n.shop.map(s=>E(itemName(s.id))+' '+wkN(s.price)+' G').join(' · ')}</td></tr>`)}catch(_){}
    return `<p>ซื้อของจาก NPC ที่เป็นร้านค้า และขายของที่ไม่ต้องการได้ที่ร้านเดียวกัน</p>${rows.length?'<table class="wkT"><tr><th>ร้าน</th><th>สินค้า</th></tr>'+rows.join('')+'</table>':''}`}]);
  return S}
/* ---------- items ---------- */
function itemIds(){const s=new Set();try{for(const n of Qd().npcs)for(const x of n.shop||[])s.add(x.id)}catch(_){}
  try{for(const k in __TOWNNPC.goods)for(const id of __TOWNNPC.goods[k])s.add(id)}catch(_){}
  try{for(let i=1;i<=10;i++){const I=refineInfo({refine:i-1,lvl:50});if(I&&I.mat)s.add(I.mat)}}catch(_){}
  if(ITEMS.abyssDrill)s.add('abyssDrill');
  return [...s].filter(id=>ITEMS[id]&&ITEMS[id].k!=='card')}
function itemPage(id){const I=ITEMS[id];return `<div class="wkHero"><img src="${wkItemIcon({id,q:1})}" alt=""><div><span class="wkTag" style="--c:${I.col||'#ccc'}">${E(I.k)}</span><div class="wkMeta">${E(I.d||'')}</div></div></div><table class="wkT">${I.price?`<tr><th>ราคาซื้อ</th><td>${wkN(I.price)} G</td></tr>`:''}${I.sell?`<tr><th>ราคาขาย</th><td>${wkN(I.sell)} G</td></tr>`:''}</table>`}
/* ---------- builder ---------- */
function build(){const out=[],push=o=>{o.key=o.cat+':'+o.id;out.push(o)};
  try{for(const q of Qd().quests){const T=QCOL[q.type]||QCOL.main;push({cat:'quest',id:q.id,name:q.name,sub:[T[0],q.zone&&zname(q.zone),q.requires&&q.requires.lv?'Lv '+q.requires.lv:''].filter(Boolean).join(' · '),chip:q.type,col:T[1],icon:()=>g('!',T[1]),search:[q.id,q.name,T[0],q.zone,zname(q.zone)].join(' '),html:()=>questPage(q)})}}catch(e){ERR('quests',e)}
  try{const R=roster();for(const t of Object.keys(R)){const r=R[t],kd=r.kind,wh=mobWhere(t);push({cat:'mob',id:t,name:r.name,sub:WK_KIND[kd][0]+(wh.length?' · '+wh.map(zname).filter(Boolean).join(', '):''),chip:kd,col:r.col,icon:()=>mobIcon(t),search:[t,r.name,kd,...wh.map(zname)].join(' '),html:()=>mobPage(t)})}}catch(e){ERR('mobs',e)}
  try{for(const zz of zoneList()){const Z=ZONES[zz.z];const m=/Map (\d+)/.exec(zz.label);push({cat:'zone',id:zz.z,name:Z.n,sub:zz.label,col:Z.acc||'#7fdcff',icon:()=>g(Z.safe?'⌂':'⛰',Z.acc||'#3a6aa8'),search:[zz.z,Z.n,zz.label,(m&&__ZONE_NAMES_22&&__ZONE_NAMES_22[m[1]]||[]).join(' ')].join(' '),html:()=>zonePage(zz.z,zz.label)})}}catch(e){ERR('zones',e)}
  try{for(const t of weaponList()){push({cat:'weapon',id:t,name:wName(t),sub:t==='robot'?'ท่าของค้อนไอน้ำ':t==='holy'?'โหมดของคทาเวท':(WEAPONS[t]?'ASPD '+WEAPONS[t].aspd+' · ระยะ '+WEAPONS[t].range:''),col:'#ffd36b',icon:()=>{const u=t==='robot'?'':wkItemIcon({kind:'wpn',t:t==='holy'?'staff':t,rar:4});return u||g(t==='robot'?'⚙':'⚔','#8a6a1a')},search:[t,wName(t),(WN_NAME[t]||[])[1]||''].join(' '),html:()=>weaponPage(t)})}}catch(e){ERR('weapons',e)}
  try{for(const k in GEAR){const G0=GEAR[k],th=(EQ_SLOTS.find(s=>s[0]===k)||[])[2]||G0.n;push({cat:'gear',id:k,name:G0.n,sub:th+' · '+G0.names.join(', '),col:'#9fc4ff',icon:()=>wkItemIcon({kind:'eq',type:k,rar:4}),search:[k,G0.n,th,...G0.names].join(' '),html:()=>wkGearPage(k)})}}catch(e){ERR('gear',e)}
  try{for(const c of (window.__MCARDS?__MCARDS.cards:[])){const id='mcard_'+c.slug;if(!ITEMS[id])continue;const I=ITEMS[id],mt=I.mob||ALIAS[c.slug]||c.slug;push({cat:'card',id,name:I.n,sub:(c.boss?'การ์ดบอส · ':'')+mobName(mt),chip:c.boss?'boss':'normal',col:c.boss?'#ff9a6a':(I.col||'#ffd36b'),icon:()=>wkItemIcon({id,q:1}),search:[id,I.n,mobName(mt),c.slug].join(' '),html:()=>`<div class="wkHero"><img src="${wkItemIcon({id,q:1})}" alt=""><div><span class="wkTag" style="--c:${c.boss?'#ff9a6a':'#ffd36b'}">${c.boss?'การ์ดบอส':'การ์ดมอนสเตอร์'}</span><div class="wkMeta">${E(I.d||'')}</div></div></div><h4>มอนสเตอร์</h4><div class="wkChips">${L('mob',mt,mobName(mt))}</div>${(()=>{try{const dd=__CARDS.data instanceof Map?__CARDS.data.get(c.slug):Array.isArray(__CARDS.data)?(__CARDS.data.find(x=>x[0]===c.slug)||[])[1]:__CARDS.data[c.slug];return dd&&dd.drop?'<h4>โอกาสดรอป</h4><p>'+wkPct(dd.drop)+'</p>':''}catch(_){return ''}})()}`})}}catch(e){ERR('cards',e)}
  try{for(const id of itemIds())push({cat:'item',id,name:ITEMS[id].n,sub:ITEMS[id].d||'',chip:ITEMS[id].k,col:ITEMS[id].col||'#ccc',icon:()=>wkItemIcon({id,q:1}),search:[id,ITEMS[id].n,ITEMS[id].d].join(' '),html:()=>itemPage(id)});
    for(const id in (Qd().items||{})){const I=Qd().items[id];push({cat:'item',id,name:I.n,sub:I.d||'ไอเทมเควส',chip:'quest',col:I.col||'#e8dcc0',icon:()=>g('✉',I.col||'#8a6a1a'),search:[id,I.n].join(' '),html:()=>`<p>${E(I.d||'ไอเทมเควส')}</p>${(()=>{const qs=Qd().quests.filter(q=>(q.startGive||[]).some(x=>x.id===id)||(q.objectives||[]).some(o=>o.item===id));return qs.length?'<h4>เควสที่เกี่ยวข้อง</h4><div class="wkChips">'+qs.map(q=>L('quest',q.id,q.name)).join('')+'</div>':''})()}`})}}catch(e){ERR('items',e)}
  try{for(const n of Qd().npcs)push({cat:'npc',id:n.id,name:n.name,sub:[n.title,(n.at&&zname(n.at.zone))||zname(n.map)].filter(Boolean).join(' · '),col:'#ffbe5c',icon:()=>g('☻','#a86a2a'),search:[n.id,n.name,n.nameEn,n.title].join(' '),html:()=>npcPage(n)})}catch(e){ERR('npcs',e)}
  try{for(const s of sysList())push({cat:'sys',id:s[0],name:s[1],sub:s[2],col:'#5ef0e0',icon:()=>g(s[3],'#1f6a8a'),search:s.slice(1,3).join(' '),html:s[4]})}catch(e){ERR('sys',e)}
  /* categories: only those with entries */
  const cnt={};for(const e of out)cnt[e.cat]=(cnt[e.cat]||0)+1;
  const ALL=[['home','หน้าแรก','⌂'],['quest','เควส','!'],['mob','มอนสเตอร์','☠'],['zone','แผนที่','⛰'],['weapon','อาวุธ','⚔'],['gear','อุปกรณ์สวมใส่','⛨'],['card','การ์ด','▣'],['item','ไอเทม','◍'],['npc','NPC','☻'],['sys','ระบบเกม','⚙']];
  WK_CATS.length=0;for(const c of ALL)if(c[0]==='home'||cnt[c[0]])WK_CATS.push(c);
  for(const k of Object.keys(WK_CHIPS))delete WK_CHIPS[k];
  const qt=[...new Set(out.filter(e=>e.cat==='quest').map(e=>e.chip))];WK_CHIPS.quest=qt.map(t=>[t,(QCOL[t]||[t])[0]]);
  WK_CHIPS.mob=[['normal','ทั่วไป'],['elite','Elite'],['boss','บอส']].filter(c=>out.some(e=>e.cat==='mob'&&e.chip===c[0]));
  if(out.some(e=>e.cat==='card'&&e.chip==='boss'))WK_CHIPS.card=[['normal','ทั่วไป'],['boss','บอส']];
  try{WK.reg.length=0}catch(_){}
  WN.counts=cnt;WN.built++;return out}
try{wkBuild=build}catch(e){ERR('hook build',e)}
try{wkSeen=function(){try{return JSON.parse(localStorage.getItem('wiki_seen_v2')||'null')}catch(e){return null}};wkMarkSeen=function(E2){try{localStorage.setItem('wiki_seen_v2',JSON.stringify(E2.map(e=>e.key)))}catch(e){}}}catch(e){ERR('hook seen',e)}
try{wkGuideBtn=function(sel){if(sel.cat!=='quest'||!window.__QUESTHUD||!__QUESTHUD.go)return '';return `<div class="wkGuide"><button class="wkGo" data-wkqgo="${E(sel.id)}" ${G.state==='play'?'':'disabled'}>🧭 นำทางไปเควสนี้</button><span>${G.state==='play'?'เดินไปยังเป้าหมายเควสอัตโนมัติ':'เข้าเกมก่อนจึงจะนำทางได้'}</span></div>`}}catch(e){ERR('hook guide',e)}
document.addEventListener('click',e=>{try{const b=e.target.closest&&e.target.closest('[data-wkqgo]');if(!b||!window.__QUESTHUD||!__QUESTHUD.go)return;e.stopImmediatePropagation();wikiClose();__QUESTHUD.go(b.dataset.wkqgo)}catch(er){ERR('qgo',er)}},true);
try{wkHome=function(cnt){const tot=Object.values(cnt).reduce((a,b)=>a+b,0);const recent=[...WK.newSet].slice(0,24).map(k=>WK.E.find(e=>e.key===k)).filter(Boolean);
  const has=id=>WK.E.some(e=>e.cat==='sys'&&e.id===id);
  return `<div class="wkH"><h3>ยินดีต้อนรับสู่ Realm Wiki</h3></div><p class="muted" style="font-size:14px;max-width:720px">รวมข้อมูลที่มีอยู่ในเกมตอนนี้ ${wkN(tot)} หน้า · สร้างจากข้อมูลเกมโดยตรงทุกครั้งที่เปิด หมวดที่ยังไม่มีข้อมูลจะซ่อนอัตโนมัติ</p>
  <div class="wkStats">${WK_CATS.filter(c=>c[0]!=='home').map(([c,l,i])=>`<div class="wkStat" data-wkcat="${c}"><span>${i} ${l}</span><b>${cnt[c]||0}</b></div>`).join('')}</div>
  ${recent.length?`<h4>เพิ่มใหม่ตั้งแต่เปิดครั้งก่อน</h4><div class="wkGrid">${recent.map(e=>`<a class="wkCard" data-wk="${e.cat}:${wkE(e.id)}"><img src="${e.icon()}" alt=""><b>${wkE(e.name)}</b><small>${wkE((WK_CATS.find(c=>c[0]===e.cat)||[0,e.cat])[1])}</small></a>`).join('')}</div>`:''}
  <h4>หน้าแนะนำ</h4><div class="wkChips">${[['refine','การตีบวก'],['card','ใส่การ์ด'],['element','ตารางธาตุ'],['gates','วงวาร์ป'],['mastery','ชำนาญอาวุธ']].filter(x=>has(x[0])).map(x=>wkLink('sys',x[0],x[1])).join('')}</div>`}}catch(e){ERR('hook home',e)}
})();

