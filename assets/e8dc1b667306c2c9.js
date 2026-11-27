
/* ---- candidate_balance_v1_r33: p270 r1 HUD v2 split Character / Items / Status windows (TEST only) ---- */
/* p270 r1 — HUD v2: the Character window split into three windows (DeaRz 19 Oct 2026 "ไม่เห็น hud ที่แยก ตัวละคร ไอเท่ม status ใหม่เลย
   เอามารวมกันด้วยเลย"). TEST candidate only: not merged, not published.
   Before: one big "Character" window (equipment + inventory + status + profile + combat stats side by side), opened by I or C.
   Now three windows, each with its own menu button and key, drawn in the HUD v2 frame:
     ตัวละคร (C)  equipment + fashion tabs + profile (class, job, weapon)     icon: ic_helm (HUD v2 set, unused until now)
     ไอเท็ม  (I)  inventory, sort / filter tabs, pages, gold, bag upgrade      icon: ic_bag
     สเตตัส  (L)  the 6 main stats (+ buttons) + combat stats (real time)      icon: st_str (HUD v2 stat icon); keeps the red dot for unspent points
   Pressing the key / button of the open window closes it, another one switches. S is move-down, U/O/Y/J/B/N are taken by other modules, P is the map editor and V is dash, so status uses L.
   It is the game's own window and its own render (renderInv), only one part is shown per window: every handler, rule, item and save
   stays exactly as it was. Phones: p210's tab row is replaced by the three windows (p210 still sizes the window to the screen).
   Inside colours follow HUD v2 (charcoal + antique gold) with CSS only (no new art). Turn off with ?hudsplit=off. Debug: window.HUDSPLIT. */
(function(){'use strict';
const A=window.__HUD2A;const R=window.HUDSPLIT={ver:'p270-r1',on:true,err:null,view:'inv',stats:{open:0,swap:0,close:0}};
try{if(/hudsplit=off/.test(location.search))R.on=false;}catch(e){}
if(!R.on)return;
if(!A||typeof toggleWin!=='function'||typeof openWin!=='function'){R.err='missing '+(!A?'hud art':'windows');return;}
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const u=k=>'url("'+A[k]+'")';
const V={eq:{t:'ตัวละคร',en:'Character',key:'C',ic:'ic_helm'},inv:{t:'ไอเท็ม',en:'Items',key:'I',ic:'ic_bag'},st:{t:'สเตตัส',en:'Status',key:'L',ic:'st_str'}};
const GOLD='#e6c27a',GOLD2='#c9a25c',INK='#ece2c8',DIM='#a99c80';
const css=document.createElement('style');css.id='p270';css.textContent=`
#p210tabs{display:none!important}
/* one part per window */
#wInv[data-h2w] .cw{display:flex!important;flex-direction:column!important;gap:12px!important;grid-template-columns:none!important}
#wInv[data-h2w] .cw>section{width:auto!important;min-width:0!important;max-width:none!important;flex:none!important;height:auto!important;max-height:none!important}
#wInv[data-h2w="eq"] .cwInv,#wInv[data-h2w="eq"] .cwDer,#wInv[data-h2w="eq"] .cwSt>.st6,#wInv[data-h2w="eq"] .cwSt>h3:first-of-type{display:none!important}
#wInv[data-h2w="inv"] .cwEq,#wInv[data-h2w="inv"] .cwSt,#wInv[data-h2w="inv"] .cwDer{display:none!important}
#wInv[data-h2w="st"] .cwEq,#wInv[data-h2w="st"] .cwInv,#wInv[data-h2w="st"] .cwSt>.prof,#wInv[data-h2w="st"] .cwSt>h3:nth-of-type(2){display:none!important}
#wInv[data-h2w="eq"] .cwSt,#wInv[data-h2w="st"] .cwSt,#wInv[data-h2w="st"] .cwDer{display:block!important}
#wInv[data-h2w="inv"] .cwInv,#wInv[data-h2w="eq"] .cwEq{display:block!important}
body:not(.p210m) #wInv[data-h2w="eq"]{width:min(760px,calc(100vw - 24px))!important}
body:not(.p210m) #wInv[data-h2w="eq"] .cw{flex-direction:row!important;align-items:flex-start}
body:not(.p210m) #wInv[data-h2w="eq"] .cw>section{flex:1 1 0!important}
#wInv[data-h2w]{height:auto!important}
body:not(.p210m) #wInv[data-h2w="inv"]{width:min(640px,calc(100vw - 24px))!important}
body:not(.p210m) #wInv[data-h2w="st"]{width:min(560px,calc(100vw - 24px))!important}
body:not(.p210m) #wInv[data-h2w] .body{max-height:calc(100vh - 150px)!important;overflow-y:auto!important}
body.p210m #wInv[data-h2w="eq"] .cwSt,body.p210m #wInv[data-h2w="st"] .cwSt,body.p210m #wInv[data-h2w="st"] .cwDer{display:block!important}
body.p210m #wInv[data-h2w="eq"] .cwEq{display:block!important}
#wInv[data-h2w="st"] .der{display:grid!important;grid-template-columns:1fr 1fr!important;column-gap:16px!important}
#wInv .h2wT{white-space:nowrap}
/* phone menu list: HUD v2's red dot replaced the row's name (::after); the dot now sits on the icon and the name stays */
body.mobile #menu .mbtn.h2dot::after{content:attr(data-hl)!important;position:static!important;width:auto!important;height:auto!important;background:none!important;left:auto!important;top:auto!important}
body.mobile #menu .mbtn.h2dot[data-h2i]::before{background:${u('ic_dot')} right top/11px 11px no-repeat,var(--h2ic) center/contain no-repeat!important}
/* inside colours: HUD v2 charcoal + antique gold (CSS only) */
#wInv .sec{color:${GOLD}!important;letter-spacing:.06em;border-bottom:1px solid rgba(201,162,92,.35)!important;padding-bottom:4px!important}
#wInv .sec em{color:${DIM}!important}
#wInv .body{color:${INK}}
#wInv .eq2,#wInv .kv,#wInv .strow,#wInv .prof .kv{background:linear-gradient(180deg,rgba(38,34,30,.92),rgba(22,20,18,.92))!important;border:1px solid rgba(201,162,92,.28)!important;color:${INK}!important}
#wInv .kv b,#wInv .strow b{color:${GOLD}!important}
#wInv .kv span{color:${DIM}!important}
#wInv .eqtabs button,#wInv .invtabs button,#wInv .pager .btn,#wInv .strow button{background:linear-gradient(180deg,#2e2924,#1a1714)!important;border:1px solid rgba(201,162,92,.45)!important;color:${INK}!important;box-shadow:none!important}
#wInv .eqtabs button.on,#wInv .invtabs button.on{background:linear-gradient(180deg,#4a3c1c,#2a2110)!important;border-color:${GOLD}!important;color:#ffe3a0!important}
#wInv .strow button:hover,#wInv .eqtabs button:hover,#wInv .invtabs button:hover,#wInv .pager .btn:hover{border-color:${GOLD}!important;color:#fff3d0!important}
#wInv .chip{background:rgba(30,26,22,.9)!important;border:1px solid rgba(201,162,92,.45)!important;color:${GOLD}!important}
#wInv .btn.gold{background:linear-gradient(180deg,#5a4720,#33280f)!important;border:1px solid ${GOLD}!important;color:#ffe3a0!important}
#wInv .muted,#wInv .pager span{color:${DIM}!important}
#wInv header h2 small{color:${DIM}!important}
`;
document.head.appendChild(css);
/* ---------- menu: the old Character button becomes สเตตัส (it keeps the game's red dot for stat points); ตัวละคร and ไอเท็ม are added ---------- */
const BT={};
function setIcon(b,v){const o=V[v];b.dataset.h2i=o.ic;b.style.setProperty('--h2ic',u(o.ic));b.dataset.hl=o.t;b.title=o.t+' · '+o.en+' ('+o.key+')';b.setAttribute('aria-label',b.title);
  const k=b.querySelector('kbd');if(k)k.textContent=o.key;b.dataset.h2w=v;}
function buildMenu(){const old=$('#menu .mbtn[data-win="wInv"]');if(!old||BT.st)return !!BT.st;
  const mk=v=>{const b=old.cloneNode(true);b.removeAttribute('data-win');b.classList.remove('h2dot','on');b.addEventListener('click',()=>{if(G.state==='play')toggleWin('wInv');});return b;};
  BT.eq=mk('eq');BT.inv=mk('inv');BT.st=old;
  old.parentNode.insertBefore(BT.eq,old);old.parentNode.insertBefore(BT.inv,old);
  setIcon(BT.eq,'eq');setIcon(BT.inv,'inv');setIcon(BT.st,'st');
  for(const v in BT)BT[v].addEventListener('click',()=>{R.req=v;},true);                 // capture: say which window, the click then toggles
  return true;}
/* ---------- which window ---------- */
function title(v){const w=$('#wInv');if(!w)return;const h=w.querySelector(':scope>header h2');if(!h)return;
  let s=h.querySelector('.h2wT');if(!s){for(const n of [...h.childNodes])if(n.nodeType===3&&n.textContent.trim())n.textContent='';s=document.createElement('span');s.className='h2wT';h.insertBefore(s,h.firstChild);}
  s.textContent=V[v].t+' ';}
function p210(v){try{const b=$('#p210tabs button[data-t="'+v+'"]');if(b&&!b.classList.contains('on'))b.click();}catch(e){}}
function setView(v){const w=$('#wInv');if(!w)return;R.view=v;w.dataset.h2w=v;title(v);p210(v);
  for(const k in BT)if(BT[k])BT[k].classList.toggle('h2on',k===v&&!w.hidden);}
function sync(){const w=$('#wInv');if(!w)return;if(w.dataset.h2w!==R.view)w.dataset.h2w=R.view;title(R.view);
  const open=G.win==='wInv'&&!w.hidden;for(const k in BT)if(BT[k])BT[k].classList.toggle('h2on',open&&k===R.view);
  if(open){const t=$('#p210tabs button.on');if(t&&t.dataset.t!==R.view)p210(R.view);}}
const oT=toggleWin;toggleWin=function(id){
  if(id!=='wInv')return oT.apply(this,arguments);
  const v=R.req||R.view||'inv';R.req=null;
  try{if(G.win==='wInv'&&R.view===v){R.stats.close++;return oT.apply(this,arguments);}
    if(G.win==='wInv'){R.stats.swap++;setView(v);try{renderInv();}catch(e){}return;}
    R.stats.open++;setView(v);const r=oT.apply(this,arguments);setView(v);return r;}catch(e){R.err='toggle '+e.message;return oT.apply(this,arguments);}};
const oO=openWin;openWin=function(id){const r=oO.apply(this,arguments);if(id==='wInv')try{setView(R.view||'inv');}catch(e){R.err='open '+e.message;}return r;};
if(typeof renderInv==='function'){const o=renderInv;renderInv=function(){const r=o.apply(this,arguments);try{sync();}catch(e){}return r;};}
/* ---------- keys: C ตัวละคร, I ไอเท็ม, L สเตตัส (the game already sends C and I to the Character window) ---------- */
addEventListener('keydown',e=>{try{
  if(e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;
  if(typeof G==='undefined'||G.state!=='play'||(window.ED&&ED.on))return;
  const k=(e.key||'').toLowerCase();const v={c:'eq',i:'inv',l:'st'}[k];if(!v)return;
  R.req=v;if(k==='l'){e.preventDefault();e.stopImmediatePropagation();toggleWin('wInv');}                                                         // the game's own handler does C / I
}catch(err){R.err='key '+err.message;}},true);
/* ---------- keep up with late DOM (HUD v2 / mobile menu build their parts after load) ---------- */
let tries=0;const iv=setInterval(()=>{try{if(buildMenu()){sync();if(++tries>4)clearInterval(iv);} }catch(e){R.err='menu '+e.message;}},300);
setInterval(()=>{try{if(G.win==='wInv')sync();else for(const k in BT)if(BT[k])BT[k].classList.remove('h2on');}catch(e){}},400);
})();

