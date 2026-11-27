
/* ---- shopwin-r1 (TEST allin_r96, 16 Nov 2026, DeaRz: Mali's shop should open as its OWN shop window) ----
   HOW IT WORKED BEFORE: the old "Spirit Merchant" window (wShop) is blocked in this build (p195 remove-old-NPCs: GONE = wShop / wRefine / wWard / wAlch / wJob). Mali (npc_mali, Map 1) is a Chapter-1 NPC: F -> a dialog box with her idle lines and 3 buttons
   (ร้านค้า / ของขวัญ / ลาก่อน). "ร้านค้า" = another dialog line "เชิญเลือก · ทอง N" with one button per item ("<name> <price>G", max 3: Spirit Tonic 30, Greater Spirit Tonic 120, Mana Draught 30) + ลาก่อน.
   One click = buy ONE (gold - price, item into the bag, quest "buy" event, save) then the same dialog again. No icon, no description, no quantity, no sell list.
   NOW: "ร้านค้า" opens a separate shop window: title = the NPC's shop (Mali's name), gold shown top right, tabs ซื้อ / ขาย; BUY: one row per item = icon, name + description, price (with the NPC's affinity discount), quantity stepper (- n +), button "ซื้อ xN · total G" (greyed when gold is not enough);
   SELL: the bag (icon, name, sell price, quantity stepper, ขาย) through the game's sellInv. Buying runs the same code as the old dialog button (gold, bag, quest event, affinity, save). ?shopwin=off = the old dialog. Debug: window.__SHOPWIN ---- */
(function(){'use strict';
const Q=String(location.search);const SW=window.__SHOPWIN={ver:'shopwin-r1',on:!/[?&]shopwin=off\b/.test(Q),err:null,opens:0,buys:0,sells:0};
if(!SW.on)return;
const ERR=(w,e)=>{SW.err=w+': '+((e&&e.message)||e);try{console.error('[SHOPWIN]',w,e)}catch(_){}};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fm=n=>{try{return fmt(n)}catch(_){return String(n)}};
let el=null,tab='buy',Q1={},CUR=null;
(function(){const st=document.createElement('style');st.textContent=`
#swin{position:fixed;inset:0;z-index:9300;display:none;align-items:center;justify-content:center;background:rgba(2,4,14,.62);font:13px/1.45 "Noto Sans Thai",system-ui,sans-serif;color:#e4f1ff}
#swin.in{display:flex}
#swin .sb{width:min(96vw,620px);max-height:min(94vh,600px);display:flex;flex-direction:column;box-sizing:border-box;border-radius:16px;background:rgba(8,12,30,.985);border:1px solid rgba(255,206,120,.55);box-shadow:0 14px 48px rgba(0,0,0,.7)}
#swin .sh{display:flex;align-items:center;gap:10px;padding:10px 14px 6px}
#swin .sh h2{margin:0;font-size:17px;color:#ffd88a;flex:1;line-height:1.2}
#swin .gold{padding:3px 12px;border-radius:999px;background:rgba(255,200,90,.14);border:1px solid rgba(255,206,120,.6);color:#ffe3a0;font-weight:700;white-space:nowrap}
#swin .x{width:30px;height:30px;border-radius:9px;border:1px solid rgba(143,164,204,.4);background:rgba(255,255,255,.05);color:#e4f1ff;cursor:pointer;font-size:15px}
#swin .tabs{display:flex;gap:6px;padding:0 14px 6px}
#swin .tabs button{flex:1;padding:6px 0;border-radius:9px;border:1px solid rgba(143,164,204,.35);background:rgba(255,255,255,.04);color:#c9d8f0;font:inherit;font-weight:700;cursor:pointer}
#swin .tabs button.on{border-color:#ffce78;color:#ffd88a;background:rgba(255,190,92,.13)}
#swin .list{overflow:auto;padding:2px 10px 10px;display:flex;flex-direction:column;gap:5px;min-height:110px}
#swin .row{display:grid;grid-template-columns:44px minmax(0,1fr) auto auto;gap:8px;align-items:center;padding:6px 8px;border-radius:11px;background:rgba(255,255,255,.04);border:1px solid rgba(143,164,204,.16)}
#swin .row img{width:40px;height:40px;object-fit:contain;border-radius:8px;background:rgba(255,255,255,.05);border:1px solid rgba(125,255,220,.18)}
#swin .nm{font-weight:700;line-height:1.2}#swin .ds{font-size:11.5px;color:#9fb2d8;line-height:1.3}
#swin .pr{font-weight:700;color:#ffd88a;white-space:nowrap;text-align:right}
#swin .ctl{display:flex;align-items:center;gap:6px;justify-self:end}
#swin .q{display:flex;align-items:center;gap:3px}
#swin .q button{width:24px;height:24px;border-radius:7px;border:1px solid rgba(125,255,220,.3);background:rgba(255,255,255,.06);color:#e4f1ff;font:inherit;font-weight:700;cursor:pointer;padding:0}
#swin .q b{min-width:22px;text-align:center}
#swin .go{padding:6px 10px;border-radius:9px;border:1px solid rgba(255,206,120,.7);background:rgba(255,190,92,.2);color:#ffe9b8;font:inherit;font-weight:700;cursor:pointer;white-space:nowrap}
#swin .go:disabled{opacity:.4;cursor:default}
#swin .empty{padding:24px;text-align:center;color:#8fa4cc}
@media (max-width:560px){#swin .row{grid-template-columns:40px minmax(0,1fr) auto}#swin .pr{display:none}}
`;document.head.appendChild(st)})();
function ensure(){if(el)return el;el=document.createElement('div');el.id='swin';document.body.appendChild(el);
  el.addEventListener('click',e=>{e.stopPropagation();if(e.target===el){close();return}const b=e.target.closest('[data-sw]');if(!b||b.disabled)return;const a=b.dataset.sw;try{
    if(a==='x')close();else if(a==='tab'){tab=b.dataset.v;render()}
    else if(a==='dn'||a==='up'){const k=b.dataset.k,mx=+b.dataset.mx||99;Q1[k]=Math.max(1,Math.min(mx,(Q1[k]||1)+(a==='up'?1:-1)));render()}
    else if(a==='buy')doBuy(b.dataset.k);else if(a==='sell')doSell(+b.dataset.i)}catch(er){ERR('click',er)}});return el}
function close(){if(el)el.classList.remove('in');CUR=null}
function doBuy(id){const r=CUR&&CUR.list.find(x=>x.id===id);if(!r)return;const n=Q1[id]||1;let done=0;try{done=CUR.buy(id,r.p,n)||0}catch(e){ERR('buy',e)}SW.buys+=done;if(done<n)try{notify(done?'ซื้อได้ '+done+' ชิ้น':'ทองไม่พอ หรือกระเป๋าเต็ม')}catch(_){}Q1[id]=1;render()}
function sellRows(){const o=[];if(typeof P==='undefined'||!P)return o;P.inv.forEach((it,i)=>{if(!it)return;let p=0;try{p=sellPrice(it)}catch(_){}const d=it.id&&ITEMS[it.id];if(d&&(d.noSell||d.keep))return;if(!(p>0))return;
  let name='?',desc='',icon='';try{name=itemName(it)}catch(_){}try{icon=itemIcon(it)}catch(_){}
  if(d){name=d.n||name;desc=(it.q>1?'x'+it.q+' · ':'')+(d.d||'')}else{desc=it.card?'มีการ์ด':''}
  o.push({i,it,p,name,icon,desc,q:it.id?(it.q|0||1):1})});return o}
function doSell(i){const it=P.inv[i];if(!it)return;const k='s'+i,n=Math.min(Q1[k]||1,it.id?(it.q|0||1):1);let done=0;
  for(let j=0;j<n;j++){const idx=P.inv.indexOf(it);if(idx<0)break;try{sellInv(idx);done++}catch(e){ERR('sell',e);break}}SW.sells+=done;try{if(done&&typeof saveGame==='function')saveGame()}catch(_){}Q1[k]=1;render()}
function render(){if(!CUR)return;const e=ensure();let h=`<div class="sb"><div class="sh"><h2>${esc(CUR.title)}</h2><div class="gold">💰 ${fm(P.gold|0)} G</div><button class="x" data-sw="x" aria-label="ปิด">✕</button></div>`;
  h+=`<div class="tabs"><button data-sw="tab" data-v="buy" class="${tab==='buy'?'on':''}">ซื้อ</button><button data-sw="tab" data-v="sell" class="${tab==='sell'?'on':''}">ขาย</button></div><div class="list">`;
  if(tab==='buy'){for(const r of CUR.list){const d=ITEMS[r.id]||{n:r.id,d:''},q=Q1[r.id]||1,tot=r.p*q,ok=(P.gold|0)>=tot,mx=Math.max(1,Math.min(99,r.p>0?Math.floor((P.gold|0)/r.p)||1:99));let ic='';try{ic=itemIcon({id:r.id})}catch(_){}
      h+=`<div class="row"><img src="${esc(ic)}" alt=""><div><div class="nm">${esc(d.n)}</div><div class="ds">${esc(d.d||'')}</div></div><div class="pr">${fm(r.p)} G</div><div class="ctl"><div class="q"><button data-sw="dn" data-k="${esc(r.id)}">−</button><b>${q}</b><button data-sw="up" data-k="${esc(r.id)}" data-mx="${mx}">+</button></div><button class="go" data-sw="buy" data-k="${esc(r.id)}"${ok?'':' disabled'}>ซื้อ ×${q} · ${fm(tot)} G</button></div></div>`}
    if(!CUR.list.length)h+='<div class="empty">ไม่มีสินค้า</div>'}
  else{const S=sellRows();for(const r of S){const k='s'+r.i,q=Math.min(Q1[k]||1,r.q),tot=r.p*q;
      h+=`<div class="row"><img src="${esc(r.icon)}" alt=""><div><div class="nm">${esc(r.name)}</div><div class="ds">${esc(r.desc)}</div></div><div class="pr">${fm(r.p)} G</div><div class="ctl">${r.q>1?`<div class="q"><button data-sw="dn" data-k="${k}">−</button><b>${q}</b><button data-sw="up" data-k="${k}" data-mx="${r.q}">+</button></div>`:''}<button class="go" data-sw="sell" data-i="${r.i}">ขาย${r.q>1?' ×'+q:''} · ${fm(tot)} G</button></div></div>`}
    if(!S.length)h+='<div class="empty">ไม่มีของที่ขายได้ในกระเป๋า</div>'}
  h+='</div></div>';{const _l=e.querySelector('.list'),_st=_l?_l.scrollTop:0,_same=e.dataset.t267===tab;e.innerHTML=h;e.dataset.t267=tab;if(_same&&_st>0&&window.SHOPSCROLL267&&SHOPSCROLL267.on){const nl=e.querySelector('.list');if(nl){nl.scrollTop=_st;SHOPSCROLL267.kept++}}}}
/* called from the patched shop(n) of the Chapter-1 NPC code: {name, off, list:[{id,p}], buy(id,price,qty)->bought} */
SW.openNpc=function(o){try{CUR={title:(o.name||'ร้านค้า')+' · ร้านค้า',list:o.list||[],buy:o.buy};tab='buy';Q1={};SW.opens++;render();ensure().classList.add('in');return true}catch(e){ERR('open',e);return false}};
SW.close=close;
let lastGold=null;setInterval(()=>{try{if(el&&el.classList.contains('in')&&typeof P!=='undefined'&&P&&lastGold!==P.gold){lastGold=P.gold;render()}}catch(e){ERR('sync',e)}},200);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&el&&el.classList.contains('in')){e.stopPropagation();close()}},true);
console.info('[SHOPWIN] ready r1');
})();
