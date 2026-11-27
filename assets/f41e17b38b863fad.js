
/* ---- r102 skilltip: hover (PC) / long-press (phone) a skill slot of the bottom bar, a row of the weapon skill window, or a potion slot -> a dark-gold card: icon, name, level n/max, locked state with its requirement, MP / cooldown, type, the existing Thai description with the real numbers. Data only from the weapon skill window tables (window.__WSK.lines) + __SKUP level text + ITEMS (potions); nothing invented. Skills without description text are listed in window.__SKTIP.noDesc. ?skilltip=off = only the native browser tooltip. ---- */
(function(){'use strict';
const Q=String(location.search),TT=window.__SKTIP={ver:'skilltip-r1',on:!/[?&]skilltip=off\b/.test(Q),noDesc:[],shown:0,err:null};
if(!TT.on)return;
try{
const css=document.createElement('style');css.id='sktipCss';css.textContent='#sktip{position:fixed;z-index:99990;display:none;width:min(300px,calc(100vw - 16px));box-sizing:border-box;padding:9px 11px 10px;border:1px solid #c9a86a;border-radius:10px;background:linear-gradient(180deg,rgba(44,34,20,.97),rgba(16,12,8,.97));box-shadow:0 6px 22px rgba(0,0,0,.7),inset 0 0 0 1px rgba(255,220,150,.12);color:#e9dcc0;font:12px/1.4 var(--body,system-ui,sans-serif);pointer-events:none}#sktip .h{display:flex;gap:9px;align-items:center}#sktip .ic{flex:0 0 40px;width:40px;height:40px;border-radius:7px;border:1px solid rgba(150,120,60,.6);background:#100d09;overflow:hidden}#sktip .ic img{width:100%;height:100%;object-fit:contain;display:block}#sktip .nm{font-weight:700;font-size:14px;color:#f3e2b0;line-height:1.2}#sktip .sub{font-size:11px;color:#c9b27a}#sktip .lk{margin-top:6px;padding:3px 7px;border-radius:6px;background:rgba(80,56,18,.6);border:1px solid #a8843c;color:#ffd98a;font-size:11px}#sktip .st{display:flex;flex-wrap:wrap;gap:4px 10px;margin-top:7px;font-size:11px;color:#bff0b4}#sktip .st b{color:#ffe7a6;font-weight:600}#sktip .d{margin-top:7px;white-space:pre-line;color:#e3d8c0;font-size:11.5px;max-height:46vh;overflow:hidden}#sktip .nd{margin-top:7px;color:#9c917c;font-style:italic;font-size:11px}';
document.head.appendChild(css);
const card=document.createElement('div');card.id='sktip';document.body.appendChild(card);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const W=()=>window.__WSK;
function allLines(){const L=W()&&W().lines||{};return L}
function colName(c){return c==0?'สกิลโจมตี':c==1?'บัฟ / สนับสนุน':'พาสซีฟ'}
function findByName(nm,wt){const L=allLines();const order=[wt,...Object.keys(L).filter(k=>k!==wt)];for(const w of order){const ln=L[w];if(!ln)continue;for(let c=0;c<ln.cols.length;c++)for(const s of ln.cols[c].skills)if(s.name===nm)return {s,c,w}}return null}
function findByK(k){const L=allLines();for(const w in L)for(let c=0;c<L[w].cols.length;c++)for(const s of L[w].cols[c].skills)if(s.k===k)return {s,c,w};return null}
function reqText(s){try{const u=W().cfg.unlock,v=u[Math.min(s.row|0,u.length-1)];return v>=1e6?'ชำนาญอาวุธ Lv.'+(v-1e6):'เลเวลตัวละคร '+v}catch(e){return ''}}
function build(f,iconSrc,locked){const s=f.s;let lvl='';try{lvl=window.__SKUP&&__SKUP.lvLine?__SKUP.lvLine(s.k):''}catch(_){}
  let st='';try{if(s.cost&&s.type==='active'){const c=s.cost();st='<span>MP <b>'+esc(c.mp)+'</b></span><span>คูลดาวน์ <b>'+esc(c.cd)+' วิ</b></span>'}}catch(_){}
  if(s.key)st+='<span>ปุ่ม <b>'+esc(s.key)+'</b></span>';
  let d='';try{d=String(s.desc?s.desc():'')}catch(e){d=''}
  d=d.replace(/^เลเวล \d+ \/ \d+\s*\n*/,'');
  const ok=(()=>{try{return s.ok()}catch(_){return false}})();
  if(!d.trim()||/^ยังไม่เปิดใช้งาน/.test(d)){if(!ok&&!TT.noDesc.includes(s.name))TT.noDesc.push(s.name)}
  const ic=iconSrc||(()=>{try{return s.icon()}catch(_){return null}})();
  return '<div class="h"><div class="ic">'+(ic?'<img alt="" src="'+esc(ic)+'">':'')+'</div><div><div class="nm">'+esc(s.name)+'</div><div class="sub">'+esc(colName(f.c))+(s.type==='passive'?' · ทำงานเอง':'')+(lvl?' · '+esc(lvl):'')+'</div></div></div>'
   +(locked?'<div class="lk">🔒 ล็อกอยู่ · ปลดล็อกที่ '+esc(reqText(s))+'</div>':'')+(st?'<div class="st">'+st+'</div>':'')
   +(d.trim()&&!(!ok&&/^ยังไม่เปิดใช้งาน/.test(d))?'<div class="d">'+esc(d.trim())+'</div>':'<div class="nd">'+(ok?'ยังไม่มีคำอธิบายสกิลนี้':'ยังไม่เปิดใช้งาน เป็นแบบร่างในรายการ ยังไม่มีค่าในเกม')+'</div>')}
function clsCard(el){const id=el.dataset.sk;let s=null;try{s=SK[id]}catch(_){}if(!s)return null;const TY={heal:'ฟื้นฟู',buff:'บัฟ',dome:'โล่',revive:'ชุบ',summon:'อัญเชิญ',blink:'วาร์ป',dash:'พุ่ง'};let mp='',lv='';try{mp=mpCost(s,P.skills[id])}catch(_){mp=s.mp}try{lv=P.skills&&P.skills[id]?'เลเวล '+P.skills[id]:''}catch(_){}
  const ic=el.querySelector('img');if(!TT.noDesc.includes(s.name))TT.noDesc.push(s.name);
  return '<div class="h"><div class="ic">'+(ic?'<img alt="" src="'+esc(ic.src)+'">':'')+'</div><div><div class="nm">'+esc(s.name)+'</div><div class="sub">'+esc(TY[s.type]||s.type||'สกิล')+(lv?' · '+lv:'')+'</div></div></div><div class="st"><span>MP <b>'+esc(mp)+'</b></span><span>คูลดาวน์ <b>'+esc(s.cd)+' วิ</b></span>'+(s.range?'<span>ระยะ <b>'+esc(s.range)+' px</b></span>':'')+(s.heal?'<span>ฟื้น HP <b>'+Math.round(s.heal*100)+'%</b></span>':'')+'</div><div class="nd">ยังไม่มีคำอธิบายสกิลนี้</div>'}
function potCard(el){const kind=el.dataset.pot,id=kind==='mp'?'mpPot':'hpPot';let it=null;try{it=ITEMS[id]}catch(_){}if(!it)return null;let n='';try{n=typeof countItem==='function'?countItem(id):''}catch(_){}
  return '<div class="h"><div class="ic">'+(el.querySelector('img')?'<img alt="" src="'+esc(el.querySelector('img').src)+'">':'')+'</div><div><div class="nm">'+esc(it.n)+'</div><div class="sub">ยา · ช่อง '+(kind==='mp'?'X':'Z')+'</div></div></div><div class="st"><span>จำนวน <b>'+esc(n)+'</b></span></div><div class="d">'+esc(it.d||'')+'</div>'}
function pos(el){const r=el.getBoundingClientRect(),cw=card.offsetWidth,ch=card.offsetHeight,vw=innerWidth,vh=innerHeight;let x=r.left+r.width/2-cw/2,y=r.top-ch-10;if(y<6)y=r.bottom+10;x=Math.max(8,Math.min(vw-cw-8,x));y=Math.max(6,Math.min(vh-ch-6,y));card.style.left=Math.round(x)+'px';card.style.top=Math.round(y)+'px'}
let cur=null,saveT=null;
function show(el){try{let html=null;
  if(el.matches('.slot.pot,[data-pot]')){html=potCard(el)}
  else if(el.matches('#wWpnSk .row')){const f=findByK(el.dataset.k);if(f)html=build(f,(el.querySelector('img')||{}).src,el.classList.contains('lock')||el.classList.contains('draft'))}
  else if(el.matches('#wWpnSk .skb-s')){const f=el.dataset.k?findByK(el.dataset.k):null;if(f)html=build(f,(el.querySelector('img')||{}).src,false);else if(el.dataset.spk)html=spCard(el.dataset.spk);else return hide()} else if(el.matches('#wWpnSk .spr')){html=spCard(el.dataset.sp)} else if(el.dataset.sk&&!el.getAttribute('title')&&!el.dataset.tt){html=clsCard(el)}
  else{const nm=el.getAttribute('title')||el.dataset.tt||'';if(!nm)return hide();const wt=P&&P.weapon&&P.weapon.t;const f=findByName(nm,wt);if(f)html=build(f,(el.querySelector('img')||{}).src,el.classList.contains('wsoff')||el.classList.contains('h2s-lock'));
    else html='<div class="h"><div class="ic">'+(el.querySelector('img')?'<img alt="" src="'+esc(el.querySelector('img').src)+'">':'')+'</div><div><div class="nm">'+esc(nm)+'</div></div></div><div class="nd">ยังไม่มีคำอธิบายสกิลนี้</div>';
    if(!f&&!TT.noDesc.includes(nm))TT.noDesc.push(nm)}
  if(!html)return hide();
  if(cur&&cur!==el)restore();cur=el;if(el.hasAttribute('title')){el.dataset.tt=el.getAttribute('title');el.removeAttribute('title')}
  card.innerHTML=html;card.style.display='block';pos(el);TT.shown++}catch(e){TT.err=e.message;hide()}}
function restore(){if(cur&&cur.dataset&&cur.dataset.tt!=null&&!cur.hasAttribute('title'))cur.setAttribute('title',cur.dataset.tt)}
function hide(){card.style.display='none';restore();cur=null}
function spCard(id){let d=null;try{d=SPSK.defs.find(x=>x.id===id)}catch(_){}if(!d)return null;let s='off';try{s=SPSK.state(id)}catch(_){}let ic='';try{ic=SPSK.icons[id]||''}catch(_){}let mp=d.mp,cd=d.cd;try{const a=d.api&&d.api();if(a&&a.cfg){if(a.cfg.MP!=null)mp=a.cfg.MP;if(a.cfg.CD!=null)cd=a.cfg.CD}}catch(_){}return '<div class="h"><div class="ic">'+(ic?'<img alt="" src="'+esc(ic)+'">':'')+'</div><div><div class="nm">'+esc(d.name)+'</div><div class="sub">'+esc(d.en||'')+' · สกิลพิเศษ'+(d.lv?' · ต้อง Lv.'+esc(d.lv):'')+'</div></div></div>'+(s==='lock'?'<div class="lk">🔒 ล็อกอยู่ · ปลดล็อกที่เลเวลตัวละคร '+esc(d.lv)+'</div>':'')+'<div class="st"><span>MP <b>'+esc(mp)+'</b></span><span>คูลดาวน์ <b>'+esc(cd)+' วิ</b></span></div><div class="d">'+esc(d.full||d.desc||'')+'</div>'} const SEL='#bar .slot,#tSkills .tsk,#wWpnSk .row,.slot.pot,#wWpnSk .skb-s.has,#wWpnSk .spr';
document.addEventListener('mouseover',e=>{try{if(e.sourceCapabilities&&e.sourceCapabilities.firesTouchEvents)return;const el=e.target.closest&&e.target.closest(SEL);if(!el)return;if(el===cur)return;show(el)}catch(er){TT.err=er.message}},true);
document.addEventListener('mouseout',e=>{try{const el=e.target.closest&&e.target.closest(SEL);if(el&&el===cur&&!el.contains(e.relatedTarget))hide()}catch(_){}},true);
/* phone: long press (0.45 s) shows the card, any release / scroll hides it */
let lp=null,shownByLp=false;
document.addEventListener('touchstart',e=>{try{const el=e.target.closest&&e.target.closest(SEL);clearTimeout(lp);if(!el){if(shownByLp)hide();return}lp=setTimeout(()=>{shownByLp=true;show(el)},450)}catch(_){}},{passive:true,capture:true});
const endLp=()=>{clearTimeout(lp);if(shownByLp)setTimeout(()=>{shownByLp=false;hide()},1400)};
document.addEventListener('touchend',endLp,true);document.addEventListener('touchcancel',endLp,true);document.addEventListener('touchmove',()=>{clearTimeout(lp)},{passive:true,capture:true});
document.addEventListener('keydown',e=>{if(e.key==='Escape')hide()},true);
setInterval(()=>{try{if(cur&&!document.body.contains(cur))hide()}catch(_){}},500);
}catch(e){TT.err=e.message}
})();


