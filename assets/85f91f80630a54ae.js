
/* ---- discard-r1 (TEST allin_r92, 15 Nov 2026, DeaRz 00:07 / 00:10): discard items = destroy (not dropped), single + multi ----
   * single: bag item panel (iteminfo) gets a red "ทิ้งไอเท็ม" button in the same row / same size as "สวมใส่"; stackable non-gear items get a quantity picker (- / + / ทั้งหมด);
   * multi: bag toolbar "ทิ้งหลายชิ้น" -> tap items to tick them, count shown, "เลือกทั้งหมดในหน้านี้", quick filters (grade select, "ธรรมดา", "ไม่ใส่การ์ด", "ล้าง"), "ทิ้ง N ชิ้น", "ยกเลิก";
   * one in-game confirm panel (no browser confirm()): item name, grade, enhance level, socketed cards, red warning "ทิ้งแล้วกู้คืนไม่ได้", cards inside are destroyed with the item;
   * double confirm (second press needed) if any item is Mythic / Immortal grade, +7 or higher, or holds a boss card;
   * NOT discardable: equipped (the equipment panel button says "ถอดก่อนทิ้ง"), locked flag (none exists in the bag today; it.locked / userLock / fav are honoured if a later build adds them), quest / key items, monster-card items, fashion;
   * saves right after (saveGame + chSave). ?discard=off = nothing is added. Debug: window.DISCARD ---- */
(function(){'use strict';
const Q=String(location.search);if(/[?&]discard=off\b/.test(Q))return;
const D=window.DISCARD={ver:'discard-r1',on:true,err:null,mode:false,sel:new Set(),pend:null,stats:{single:0,multi:0,items:0,units:0,doubles:0,blocked:{}}};
const ERR=(w,e)=>{D.err=w+': '+((e&&e.message)||e);try{console.error('[DISCARD]',w,e)}catch(_){}};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const isG=it=>!!it&&(it.kind==='wpn'||it.kind==='eq');
const note=m=>{try{notify(m)}catch(_){}};
const blk=r=>{D.stats.blocked[r]=(D.stats.blocked[r]||0)+1};
function eqList(){const a=[];try{if(P.weapon)a.push(P.weapon);for(const k in P.equip||{})if(P.equip[k])a.push(P.equip[k])}catch(_){}return a}
function reason(it){if(!it)return 'ไม่พบไอเท็ม';
  if(eqList().includes(it))return 'ถอดก่อนทิ้ง';
  if(it.locked||it.userLock||it.fav||it.favorite||it.lock)return 'ไอเท็มล็อกอยู่ ทิ้งไม่ได้';
  if(isG(it))return null;
  if(it.kind==='fash')return 'ชุดแฟชั่นทิ้งไม่ได้';
  const d=it.id&&ITEMS[it.id];if(!d)return 'ทิ้งไม่ได้';
  if(/^(qi_|ki_)/.test(it.id)||d.key||d.keep||d.quest||d.k==='quest')return 'ไอเท็มเควส ทิ้งไม่ได้';
  if(d.k==='card'||/^(m?card_)/.test(it.id))return 'การ์ดทิ้งไม่ได้ (ใช้ขาย / สมุดสะสมแทน)';
  return null}
function cardsOf(it){const out=[];try{const CDm=window.__CARDS&&__CARDS.data||{};for(const s of (it.mc||[])){const d=CDm[s];out.push({n:(d&&d.name_th)||String(s),boss:!!(d&&d.boss)})}
  for(const k of ['card','card2']){const id=it[k];if(id){const d=ITEMS[id];out.push({n:d?d.n:String(id),boss:!!(d&&d.boss)})}}}catch(_){}return out}
function gradeOf(it){const R=(typeof RARITY!=='undefined'&&RARITY[it.rar])||null;return R?{th:R.th,g:R.g,c:R.c}:{th:'',g:'',c:'#e8edf5'}}
function risky(it){if(!isG(it))return false;return (it.refine|0)>=7||(it.rar|0)>=5||cardsOf(it).some(c=>c.boss)}
function nameOf(it){if(isG(it))return it.name||'?';const d=ITEMS[it.id];return d?d.n:String(it.id)}
function colOf(it){if(isG(it))return gradeOf(it).c;const d=ITEMS[it.id];return (d&&d.col)||'#e4f1ff'}
function iconOf(it){try{return itemIcon(it)}catch(_){return ''}}
/* ---------- styles ---------- */
(function(){const st=document.createElement('style');st.textContent=`
#iiPanel .iia{position:sticky;bottom:-12px;padding:6px 0 0;margin-top:6px;background:rgba(6,10,28,.97);z-index:2}
#iiPanel .iia button{white-space:nowrap}
#iiPanel .iia button.dcDel{background:rgba(120,18,32,.55);border-color:rgba(255,96,110,.6);color:#ffc2c8}
#dcPanel{position:fixed;inset:0;z-index:9800;display:none;align-items:center;justify-content:center;background:rgba(2,4,14,.72);font:13px/1.5 "Noto Sans Thai",system-ui,sans-serif;color:#e4f1ff}
#dcPanel.in{display:flex}
#dcPanel .dcb{width:min(94vw,420px);max-height:92vh;overflow:auto;box-sizing:border-box;padding:12px 14px;border-radius:14px;background:rgba(10,8,22,.98);border:1px solid rgba(255,96,110,.7);box-shadow:0 12px 40px rgba(0,0,0,.7),inset 0 0 0 1px rgba(255,255,255,.04)}
#dcPanel h3{margin:0 0 6px;font-size:16px;color:#ff8a96}
#dcPanel .dcl{max-height:34vh;overflow:auto;border-top:1px dashed rgba(143,164,204,.3);border-bottom:1px dashed rgba(143,164,204,.3);padding:4px 0;margin:4px 0}
#dcPanel .dcr{display:flex;gap:8px;align-items:flex-start;padding:4px 0}
#dcPanel .dcr img{width:36px;height:36px;flex:none;border-radius:7px;background:rgba(255,255,255,.05);border:1px solid rgba(125,255,220,.2);object-fit:contain}
#dcPanel .dcn{font-weight:700;line-height:1.25}#dcPanel .dcm{font-size:11.5px;color:#9fb2d8}
#dcPanel .dcw{margin:6px 0 2px;padding:6px 8px;border-radius:9px;background:rgba(255,64,80,.14);border:1px solid rgba(255,96,110,.55);color:#ff9aa4;font-weight:700}
#dcPanel .dcw2{margin:4px 0;padding:5px 8px;border-radius:9px;background:rgba(255,190,64,.12);border:1px solid rgba(255,200,80,.55);color:#ffd66e;font-size:12px}
#dcPanel .dcq{display:flex;gap:6px;align-items:center;margin:6px 0}
#dcPanel .dcq button{width:34px;height:30px;border-radius:8px;border:1px solid rgba(125,255,220,.3);background:rgba(255,255,255,.06);color:#e4f1ff;font:inherit;font-weight:700;cursor:pointer}
#dcPanel .dcq input{width:64px;height:30px;text-align:center;border-radius:8px;border:1px solid rgba(125,255,220,.3);background:rgba(0,0,0,.35);color:#e4f1ff;font:inherit}
#dcPanel .dcq .all{width:auto;padding:0 10px}
#dcPanel .dcbtn{display:flex;gap:8px;margin-top:8px}
#dcPanel .dcbtn button{flex:1;padding:9px 6px;border-radius:10px;border:1px solid rgba(125,255,220,.25);background:rgba(125,255,220,.1);color:#e4f1ff;font:inherit;font-weight:700;cursor:pointer}
#dcPanel .dcbtn button.red{background:rgba(160,20,36,.75);border-color:rgba(255,96,110,.8);color:#fff}
#dcPanel .dcbtn button:disabled{opacity:.45;cursor:default}
.dcbar{display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin:0 0 5px;font-size:11px}
.dcbar button,.dcbar select{padding:3px 7px;border-radius:8px;border:1px solid var(--line,rgba(125,255,220,.2));background:rgba(255,255,255,.04);color:var(--text,#e4f1ff);font:inherit;font-size:11px;cursor:pointer}
.dcbar.on{padding:4px;border-radius:9px;border:1px solid rgba(255,96,110,.5);background:rgba(120,18,32,.18)}
.dcbar b{color:#ffb0b8}.dcbar button.red{background:rgba(160,20,36,.75);border-color:rgba(255,96,110,.8);color:#fff}.dcbar button:disabled{opacity:.45}
#invBody .cell.dcsel{outline:2px solid #ff5a6b;box-shadow:0 0 9px rgba(255,80,96,.75)}
#invBody .cell.dcsel::after{content:'✓';position:absolute;right:1px;top:1px;width:16px;height:16px;border-radius:50%;background:#ff4d5e;color:#fff;font-size:11px;line-height:16px;text-align:center;font-weight:700}
#invBody .cell.dcno{opacity:.42}
`;document.head.appendChild(st)})();
/* ---------- confirm panel ---------- */
let el=null;
function ensure(){if(el)return el;el=document.createElement('div');el.id='dcPanel';document.body.appendChild(el);
  el.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('[data-dc]');if(!b||b.disabled){if(e.target===el)close();return}const a=b.dataset.dc;try{
    if(a==='no')close();else if(a==='go')go();else if(a==='minus')qty(-1);else if(a==='plus')qty(1);else if(a==='all')qty(1e9)}catch(er){ERR('click',er)}});
  el.addEventListener('input',e=>{if(e.target&&e.target.dataset&&e.target.dataset.dcq!=null){qty(0,+e.target.value||1)}});
  return el}
function close(){if(el)el.classList.remove('in');D.pend=null}
function qty(delta,abs){const P0=D.pend;if(!P0||!P0.stack)return;const it=P0.items[0].it,mx=it.q|0||1;let n=abs!=null?abs:(P0.items[0].n+delta);n=Math.max(1,Math.min(mx,n|0));P0.items[0].n=n;const inp=el.querySelector('[data-dcq]');if(inp)inp.value=n;const t=el.querySelector('.dcmm');if(t)t.textContent='ทิ้ง '+n+' จาก '+mx}
function rowHtml(o){const it=o.it,gr=gradeOf(it),cs=cardsOf(it);let m='';
  if(isG(it)){m=`เกรด ${esc(gr.th)} (${esc(gr.g)})${it.refine?' · ตีบวก +'+it.refine:''}${it.lvl?' · Lv '+it.lvl:''}`;m+=cs.length?`<br>การ์ดที่ใส่: ${cs.map(c=>esc(c.n)+(c.boss?' ★':'')).join(', ')}`:'<br>การ์ดที่ใส่: ไม่มี'}
  else m=`x${it.q||1}${o.n&&o.n!==(it.q||1)?' · ทิ้ง '+o.n:''}`;
  return `<div class="dcr"><img src="${esc(iconOf(it))}" alt=""><div><div class="dcn" style="color:${esc(colOf(it))}">${esc(nameOf(it))}${it.refine?' <span style="color:#ffd36b">+'+it.refine+'</span>':''}</div><div class="dcm">${m}</div></div></div>`}
function render(){const P0=D.pend;if(!P0)return;const ensureEl=ensure();const n=P0.items.length,anyCards=P0.items.some(o=>isG(o.it)&&cardsOf(o.it).length);
  const ttl=P0.stack?'ทิ้งไอเท็ม (เลือกจำนวน)':n>1?`ทิ้ง ${n} ชิ้น`:'ทิ้งไอเท็ม';
  let h=`<div class="dcb"><h3>🗑 ${esc(ttl)}</h3><div class="dcl">${P0.items.map(rowHtml).join('')}</div>`;
  if(P0.stack){const it=P0.items[0].it,mx=it.q|0||1;h+=`<div class="dcq"><button data-dc="minus">−</button><input data-dcq type="number" min="1" max="${mx}" value="${P0.items[0].n}"><button data-dc="plus">+</button><button class="all" data-dc="all">ทั้งหมด</button><span class="dcmm dcm">ทิ้ง ${P0.items[0].n} จาก ${mx}</span></div>`}
  h+=`<div class="dcw">⚠ ทิ้งแล้วกู้คืนไม่ได้${anyCards?' · การ์ดที่ใส่อยู่ในไอเท็มจะถูกทำลายไปพร้อมกัน':''}</div>`;
  h+=`<div class="dcm" style="margin:2px 0">ไอเท็มจะถูกทำลายทันที (ไม่ตกลงพื้น)</div>`;
  if(P0.dbl)h+=`<div class="dcw2">★ มีไอเท็มเกรดเทพนิยาย/อมตะ, ตีบวก +7 ขึ้นไป หรือการ์ดบอส — ต้องกดยืนยัน 2 ครั้ง${P0.stage===2?' (ครั้งที่ 2: กดอีกครั้งเพื่อทิ้งจริง)':''}</div>`;
  h+=`<div class="dcbtn"><button data-dc="no">ยกเลิก</button><button class="red" data-dc="go" id="dcGo"${P0.stage===2?' disabled':''}>${P0.dbl&&P0.stage===2?'กดอีกครั้งเพื่อทิ้งจริง':P0.dbl?'ยืนยันทิ้ง (1/2)':'ยืนยันทิ้ง'}</button></div></div>`;
  ensureEl.innerHTML=h;ensureEl.classList.add('in');
  if(P0.stage===2){setTimeout(()=>{const b=document.getElementById('dcGo');if(b)b.disabled=false},700)}}
function open(items,stack){try{items=items.filter(o=>o&&o.it);const bad=items.map(o=>reason(o.it)).find(Boolean);if(!items.length)return false;
    if(bad){note(bad);blk(bad);return false}
    D.pend={items:items.map(o=>({it:o.it,n:o.n||(isG(o.it)?1:(o.it.q|0||1))})),stack:!!stack,stage:1,dbl:items.some(o=>risky(o.it))};render();return true}catch(e){ERR('open',e);return false}}
function save(){try{if(typeof saveGame==='function')saveGame()}catch(e){ERR('saveGame',e)}try{if(typeof chSave==='function')chSave()}catch(e){ERR('chSave',e)}}
function go(){const P0=D.pend;if(!P0)return;
  if(P0.dbl&&P0.stage===1){P0.stage=2;D.stats.doubles++;render();return}
  let nI=0,nU=0;const names=[];
  for(const o of P0.items){const it=o.it,r=reason(it),i=P.inv.indexOf(it);if(r||i<0)continue;
    if(isG(it)||it.kind==='fash'){P.inv.splice(i,1);nI++;nU++;names.push(nameOf(it))}
    else{const n=Math.max(1,Math.min(it.q|0||1,o.n|0||1));it.q=(it.q|0||1)-n;if(it.q<=0)P.inv.splice(i,1);nI++;nU+=n;names.push(nameOf(it)+' x'+n)}
    D.sel.delete(it)}
  if(P0.items.length>1)D.stats.multi++;else D.stats.single++;D.stats.items+=nI;D.stats.units+=nU;
  const msg=nI?('ทิ้งแล้ว: '+(names.length>3?names.slice(0,3).join(', ')+' …+'+(names.length-3):names.join(', '))):'ไม่มีไอเท็มที่ทิ้งได้';
  try{log(msg,'r')}catch(_){}note(msg);
  close();try{const ii=window.__ITEMINFO;if(ii&&ii.hide)ii.hide()}catch(_){}
  try{if(typeof recalc==='function')recalc()}catch(_){}save();rerender()}
function rerender(){try{if(document.getElementById('invBody')&&typeof renderInv==='function')renderInv()}catch(e){ERR('renderInv',e)}}
D.open=open;D.reason=reason;D.risky=risky;D.save=save;
/* ---------- single: the bag item panel (same row, same size as "สวมใส่") ---------- */
function addBtn(html){const p=document.getElementById('iiPanel');if(!p)return;let row=p.querySelector('.iia');if(!row){row=document.createElement('div');row.className='iia';p.appendChild(row)}row.insertAdjacentHTML('beforeend',html)}
function install(){try{const II=window.__ITEMINFO;if(!II||!II.forBag||!II.forEquip||II._dc)return false;II._dc=1;
  const ob=II.forBag;II.forBag=function(i){const r=ob.apply(this,arguments);try{if(r){const it=P.inv[i];if(it){const rs=reason(it);const hide=rs&&rs!=='ถอดก่อนทิ้ง'&&!isG(it);if(!hide)addBtn(`<button class="dcDel" data-dc-i="${i}">ทิ้งไอเท็ม</button>`)}}}catch(e){ERR('forBag',e)}return r};
  const oe=II.forEquip;II.forEquip=function(slot){const r=oe.apply(this,arguments);try{if(r)addBtn(`<button class="dcDel" data-dc-eq="${esc(slot)}">ทิ้งไอเท็ม</button>`)}catch(e){ERR('forEquip',e)}return r};
  return true}catch(e){ERR('install',e);return true}}
const iv=setInterval(()=>{if(install())clearInterval(iv)},400);
document.addEventListener('click',e=>{try{const b=e.target.closest&&e.target.closest('[data-dc-i],[data-dc-eq]');if(!b)return;e.preventDefault();e.stopPropagation();
  if(b.dataset.dcEq!=null){note('ถอดก่อนทิ้ง');blk('equipped');return}
  const i=+b.dataset.dcI,it=P.inv[i];if(!it)return;const stack=!isG(it)&&it.kind!=='fash'&&(it.q|0)>1;
  open([{it,n:stack?1:undefined}],stack);if(stack&&D.pend){D.pend.items[0].n=1;render()}}catch(er){ERR('btn',er)}},true);
/* ---------- multi mode ---------- */
D.setMode=on=>{D.mode=!!on;if(!on)D.sel.clear();rerender()};
function toggle(it){const r=reason(it);if(r){note(r);blk(r);return}if(D.sel.has(it))D.sel.delete(it);else D.sel.add(it)}
function selectWhere(fn){let n=0;for(const it of P.inv){if(!it||reason(it))continue;if(fn(it)){D.sel.add(it);n++}}return n}
function pageCells(){return [...document.querySelectorAll('#invBody .invg .cell[data-inv]')]}
function bar(){const n=[...D.sel].filter(it=>P.inv.includes(it)).length;
  if(!D.mode)return `<div class="dcbar"><button data-dcm="on">🗑 ทิ้งหลายชิ้น</button></div>`;
  const gopts=['ธรรมดา','ดี','หายาก','มหากาพย์','ตำนาน','เทพนิยาย','อมตะ'].map((t,k)=>`<option value="${k}">${t}</option>`).join('');
  return `<div class="dcbar on"><span>เลือกแล้ว <b>${n}</b> ชิ้น</span><button data-dcm="page">เลือกทั้งหมดในหน้านี้</button><button data-dcm="g0">ธรรมดาทั้งหมด</button><select data-dcm="grade"><option value="">ตามเกรด…</option>${gopts}</select><button data-dcm="nocard">ไม่ใส่การ์ด</button><button data-dcm="clear">ล้าง</button><button class="red" data-dcm="go"${n?'':' disabled'}>ทิ้ง ${n} ชิ้น</button><button data-dcm="off">ยกเลิก</button></div>`}
function decorate(){const body=document.getElementById('invBody');if(!body||!P)return;const grid=body.querySelector('.invg');if(!grid)return;
  if(body.querySelector('.dcbar'))body.querySelector('.dcbar').remove();
  grid.insertAdjacentHTML('beforebegin',bar());
  if(D.mode)for(const c of grid.querySelectorAll('.cell[data-inv]')){const it=P.inv[+c.dataset.inv];if(!it)continue;c.classList.toggle('dcsel',D.sel.has(it));if(reason(it))c.classList.add('dcno')}}
try{const _r=renderInv;renderInv=function(){const r=_r.apply(this,arguments);try{decorate()}catch(e){ERR('decorate',e)}return r}}catch(e){ERR('hook renderInv',e)}
window.addEventListener('click',e=>{try{if(!D.mode)return;const c=e.target.closest&&e.target.closest('#invBody .invg .cell[data-inv]');if(!c)return;e.preventDefault();e.stopImmediatePropagation();toggle(P.inv[+c.dataset.inv]);rerender()}catch(er){ERR('cell',er)}},true);
for(const t of ['dblclick','contextmenu'])window.addEventListener(t,e=>{try{if(D.mode&&e.target.closest&&e.target.closest('#invBody .invg .cell[data-inv]')){e.preventDefault();e.stopImmediatePropagation()}}catch(_){}},true);
document.addEventListener('change',e=>{const s=e.target;if(!s||!s.dataset||s.dataset.dcm!=='grade'||!s.value)return;const g=+s.value;selectWhere(it=>isG(it)&&(it.rar|0)===g);rerender()});
document.addEventListener('click',e=>{try{const b=e.target.closest&&e.target.closest('button[data-dcm]');if(!b||b.tagName==='SELECT')return;e.preventDefault();e.stopPropagation();const a=b.dataset.dcm;
  if(a==='on')D.setMode(true);else if(a==='off')D.setMode(false);else if(a==='clear'){D.sel.clear();rerender()}
  else if(a==='page'){for(const c of pageCells()){const it=P.inv[+c.dataset.inv];if(it&&isG(it)&&!reason(it))D.sel.add(it)}rerender()}   /* bulk buttons pick gear only; stacks (potions ...) are ticked by hand */
  else if(a==='g0'){selectWhere(it=>isG(it)&&(it.rar|0)===0);rerender()}
  else if(a==='nocard'){selectWhere(it=>isG(it)&&!cardsOf(it).length);rerender()}
  else if(a==='go'){const items=[...D.sel].filter(it=>P.inv.includes(it)).map(it=>({it}));if(!items.length)return;open(items,false)}}catch(er){ERR('bar',er)}},true);
console.info('[DISCARD] ready r1');
})();
