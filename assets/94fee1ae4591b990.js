
/* ---- r120 baginfo-r2 (DeaRz bag order + coordinator regression 2): (1) hover card (#tip) in the dark-gold card style, now also listing the monster cards inserted in the gear (name + effects); (2) SINGLE CLICK on equippable gear = compare block at the top of the item sheet: selected item beside the worn item (stats, options, inserted cards + their effects), every difference as green ▲ / red ▼, stats only one item has included, unappraised random stats "???", empty slot "ไม่มีของที่สวมอยู่"; (3) DOUBLE CLICK equips / uses via the game's useInv and hides the sheet; multi-discard untouched. ?bagtip=off = old look and no compare, ?bagdbl=off. Debug: window.__BAGINFO ---- */
(function(){'use strict';
const Q=String(location.search),BI=window.__BAGINFO={ver:'baginfo-r2',on:!/[?&]bagtip=off\b/.test(Q),dbl:!/[?&]bagdbl=off\b/.test(Q),err:null,cmp:0};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
if(BI.on){const st=document.createElement('style');st.id='baginfoCss';st.textContent=`#tip{background:linear-gradient(180deg,rgba(44,34,20,.97),rgba(16,12,8,.97))!important;border:1px solid #c9a86a!important;border-radius:10px!important;box-shadow:0 6px 22px rgba(0,0,0,.7),inset 0 0 0 1px rgba(255,220,150,.12)!important;color:#e9dcc0!important}
#tip .bcards{margin-top:6px;padding-top:5px;border-top:1px dashed rgba(201,168,106,.5)}#tip .bch{font-size:11px;color:#c9b27a}#tip .bcn{color:#c9a8ff;font-weight:700}#tip .bce{color:#7be08a;font-size:12px;margin-left:12px}
#iiPanel{background:linear-gradient(180deg,rgba(44,34,20,.98),rgba(16,12,8,.98))!important;border:1px solid #c9a86a!important;box-shadow:0 10px 36px rgba(0,0,0,.65),inset 0 0 0 1px rgba(255,220,150,.12)!important;color:#e9dcc0!important}
#iiPanel.iicw{width:min(96vw,560px)!important}
#iiPanel .iicmp{margin-top:10px;padding-top:8px;border-top:1px solid rgba(201,168,106,.45)}
#iiPanel .iich{font-weight:700;color:#f3e2b0;margin-bottom:6px}
#iiPanel .iicg{display:grid;grid-template-columns:1fr 1fr;gap:8px}
#iiPanel .iicc{padding:7px 9px;border-radius:9px;border:1px solid rgba(201,168,106,.5);background:rgba(255,255,255,.04);min-width:0}
#iiPanel .iicc .t{font-size:11px;color:#c9b27a}#iiPanel .iicc .n{font-weight:700;line-height:1.25;word-break:break-word}
#iiPanel .iicc img{width:34px;height:34px;object-fit:contain;float:left;margin:0 7px 2px 0;border-radius:7px;background:#100d09;border:1px solid rgba(150,120,60,.55)}
#iiPanel .iicc ul{margin:6px 0 0;padding:0;list-style:none;clear:both;font-size:12px}
#iiPanel .iicc li{display:flex;justify-content:space-between;gap:6px}
#iiPanel .iicc .cd{color:#c9a8ff;font-size:11.5px;margin-top:3px}
#iiPanel .iicd{margin-top:8px;font-size:12.5px}
#iiPanel .iicd div{display:flex;justify-content:space-between;gap:8px;padding:2px 0;border-bottom:1px dashed rgba(201,168,106,.2)}
#iiPanel .up{color:#7be08a;font-weight:700}#iiPanel .dn{color:#ff6f6f;font-weight:700}#iiPanel .eq0{color:#9c917c}`;document.head.appendChild(st)}
const CSTAT={'maxHP%':'HP สูงสุด','maxMP%':'MP สูงสุด','atk%':'พลังโจมตี','allDmg%':'ดาเมจรวม','aspd%':'ความเร็วโจมตี','crit%':'คริติคอล','critDmg%':'ดาเมจคริติคอล','def%':'ป้องกัน','eva%':'หลบหลีก','exp%':'EXP ที่ได้รับ','hpRegen%':'การฟื้น HP','mpRegen%':'การฟื้น MP','move%':'ความเร็วเดิน','resPoison%':'ต้านพิษ','resFire%':'ต้านไฟ','resWater%':'ต้านน้ำ','resDark%':'ต้านมืด','bossDmg%':'ดาเมจต่อบอส'};
function cardsOf(it){const out=[];try{for(const s of (it&&it.mc)||[]){const dd=window.__CARDS&&__CARDS.data&&__CARDS.data[s];out.push({slug:s,name:(dd&&dd.name_th)||s,fx:(dd&&dd.effects)||[]})}}catch(_){}return out}
function cardTipHTML(it){const cs=cardsOf(it);if(!cs.length)return '';let h='<div class="bcards"><div class="bch">ช่องการ์ดมอนสเตอร์</div>';for(const c of cs){h+='<div class="bcn">◆ '+esc(c.name)+'</div>';for(const e of c.fx){h+='<div class="bce">'+(e.stat==='special'?'★ '+esc(e.val):esc(CSTAT[e.stat]||e.stat)+' +'+(Math.round(+e.val*100)/100)+'%')+'</div>'}}return h+'</div>'}
const OPTL=k=>{try{const o=OPT[k];return o?o[0]:k}catch(_){return k}},OPTU=k=>{try{const o=OPT[k];return o?(o[1]||''):''}catch(_){return ''}};
function stats(it){const m=new Map(),hidden=[];if(!it)return {m,hidden};const add=(k,l,v,u)=>{if(v==null||v===0||isNaN(v))return;m.set(k,{l,v:+v,u:u||''})};
  add('atk','ATK',it.atk);add('matk','MATK',it.matk);add('def','DEF',it.def);add('mdef','MDEF',it.mdef);
  if(it.bonus)for(const k in it.bonus)add('b:'+k,String(k).toUpperCase(),it.bonus[k]);
  if(it.seal){hidden.push('Base Status สุ่ม / Option (ยังไม่ส่อง)')}
  else{if(it.rs)for(const k in it.rs)add('rs:'+k,String(k).toUpperCase(),it.rs[k]);if(Array.isArray(it.op))for(const o of it.op)add('op:'+o.k,OPTL(o.k),o.v,OPTU(o.k))}
  for(const c of cardsOf(it))for(const e of c.fx){if(e.stat==='special')continue;const k='card:'+e.stat,cur=m.get(k);m.set(k,{l:(CSTAT[e.stat]||e.stat)+' (การ์ด)',v:(cur?cur.v:0)+(+e.val),u:'%'})}
  return {m,hidden}}
function equippedFor(it){try{if(it.kind==='wpn')return P.weapon;const t=it.type;if(P.equip[t]!==undefined)return P.equip[t];if(/^acc/.test(t))return P.equip.acc1||P.equip.acc2||null;return null}catch(_){return null}}
const fmtv=(x)=>{const v=Math.round(x.v*100)/100;return v+x.u};
function miniCard(it,title){if(!it)return `<div class="iicc"><div class="t">${esc(title)}</div><div class="eq0">ไม่มีของที่สวมอยู่</div></div>`;
  const S=stats(it);let ic='';try{ic=itemIcon(it)}catch(_){}let col='#e9dcc0';try{col=RARITY[it.rar].c}catch(_){}
  const li=[...S.m.values()].map(x=>`<li><span>${esc(x.l)}</span><b>${fmtv(x)}</b></li>`).join('')+S.hidden.map(h=>`<li class="eq0"><span>${esc(h)}</span><b>???</b></li>`).join('');
  const cl=cardsOf(it).map(c=>`<div class="cd">◆ ${esc(c.name)}: ${c.fx.map(e=>e.stat==='special'?'★ '+esc(e.val):esc(CSTAT[e.stat]||e.stat)+' +'+(Math.round(+e.val*100)/100)+'%').join(', ')}</div>`).join('');
  return `<div class="iicc"><div class="t">${esc(title)}</div>${ic?`<img src="${esc(ic)}" alt="">`:''}<div class="n" style="color:${col}">${esc(it.name||'')}${it.refine>0?' +'+it.refine:''}</div><ul>${li||'<li class="eq0">—</li>'}</ul>${cl}</div>`}
function compareHTML(it,cur){const A=stats(it).m,B=stats(cur).m;const keys=[...new Set([...A.keys(),...B.keys()])];let rows='';
  for(const k of keys){const a=A.get(k),b=B.get(k),lab=(a||b).l,u=(a||b).u,av=a?a.v:0,bv=b?b.v:0,df=Math.round((av-bv)*100)/100;if(df===0)continue;
    rows+=`<div><span>${esc(lab)}</span><span>${a?Math.round(a.v*100)/100+u:'—'} ${b?'(ที่สวม '+Math.round(b.v*100)/100+u+')':'(ที่สวม —)'} <span class="${df>0?'up':'dn'}">${df>0?'▲ +':'▼ '}${df}${u}</span></span></div>`}
  if(!rows)rows='<div class="eq0"><span>ไม่มีค่าที่ต่างกัน (หรือยังไม่ส่อง)</span></div>';
  return `<div class="iicmp"><div class="iich">เปรียบเทียบกับที่สวมอยู่</div><div class="iicg">${miniCard(it,'ที่เลือก')}${miniCard(cur,'ที่สวมอยู่')}</div><div class="iicd">${rows}</div></div>`}
function decorate(it){try{const p=document.getElementById('iiPanel');if(!p||!p.classList.contains('in'))return;p.querySelectorAll('.iicmp').forEach(e=>e.remove());
  if(!it||(it.kind!=='wpn'&&it.kind!=='eq'))return;const cur=equippedFor(it);if(cur===it)return;const html=compareHTML(it,cur);
  const hd=p.querySelector('.iih');const act=p.querySelector('.iia');const wrap=document.createElement('div');wrap.innerHTML=html;if(hd&&hd.parentNode)hd.parentNode.insertBefore(wrap.firstChild,hd.nextSibling);else if(act&&act.parentNode)act.parentNode.insertBefore(wrap.firstChild,act);else p.appendChild(wrap.firstChild);p.classList.add('iicw');BI.cmp++}catch(e){BI.err='decorate '+e.message}}
if(BI.on){let tries=0;const iv=setInterval(()=>{try{const II=window.__ITEMINFO;if(!II||!II.forBag){if(++tries>200)clearInterval(iv);return}clearInterval(iv);
  const _fb=II.forBag;II.forBag=function(i){const r=_fb.apply(this,arguments);try{if(r)decorate(P.inv[i])}catch(e){BI.err='fb '+e.message}return r}}catch(e){BI.err=e.message}},300)}
if(BI.on){try{const _t=tipFor;tipFor=function(it){let h=_t.apply(this,arguments);try{if(it&&(it.kind==='wpn'||it.kind==='eq')&&it.mc&&it.mc.length)h+=cardTipHTML(it)}catch(_){}return h}}catch(e){BI.err='tipFor '+e.message}}
if(BI.dbl)document.addEventListener('dblclick',e=>{try{const c=e.target.closest&&e.target.closest('#invBody .invg .cell[data-inv]');if(!c)return;if(window.DISCARD&&DISCARD.mode)return;const p=document.getElementById('iiPanel');if(p)p.classList.remove('in')}catch(_){}},true);
})();

