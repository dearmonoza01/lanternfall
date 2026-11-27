
/* ---- merge m19: p210 inventory window on phones (r3) ---- */
/* p210 — Character / Inventory window on a portrait phone (user 10 Oct 2026 06:31: "overflows the screen on mobile").
   Before: one long scrolling column (inventory 10 rows + equipment + status + combat stats ≈ 1840 px) in a window sized by 100dvh,
   so the bottom (pager, hint) was cut off behind the browser bar and the TEST / settings buttons sat on top of it.
   Now (screens ≤ 760 px wide only; desktop / landscape layout untouched):
   - the window is sized to the real visible area (visualViewport height), never taller than the screen;
   - 3 tabs under the title: กระเป๋า / อุปกรณ์ / สเตตัส — one section at a time;
   - กระเป๋า: 5 columns, the slot grid scrolls inside, the filter row and the page buttons stay visible;
   - the floating TEST and ⚙ buttons are hidden while the window is open; title line no longer wraps.
   r3 (user 06:50, still overflowing on the phone): sizing no longer trusts 100vw / media queries — the window is placed and sized from the
   browser's real visible area (visualViewport: works when the page is zoomed or laid out wider than the screen); mobile layout is on whenever
   that visible area is ≤ 760 px wide.
   A small grey debug line (sizes the phone reports) is drawn at the bottom-right of the window in this TEST build.
   r2 (user 06:45): the closed window stayed drawn as an empty blue panel over the game (a display rule overrode [hidden]) — fixed. */
(function(){
'use strict';
const MQ={get matches(){const vv=window.visualViewport;return Math.min(innerWidth,vv?vv.width:innerWidth)<=760||(vv&&vv.scale>1.05&&vv.width<=900);},addEventListener(){} };
const setH=()=>{const h=(window.visualViewport&&visualViewport.height)||innerHeight;document.documentElement.style.setProperty('--p210h',Math.round(h)+'px');};
setH();addEventListener('resize',setH);if(window.visualViewport){visualViewport.addEventListener('resize',()=>{setH();try{apply();}catch(_){}});visualViewport.addEventListener('scroll',()=>{try{apply();}catch(_){}});}
const st=document.createElement('style');st.id='p210';st.textContent=`
 body.p210m #wInv,body.p210m.mobile #wInv{top:50%!important;height:calc(var(--p210h,100dvh) - 14px)!important;width:calc(100vw - 12px)!important}
 body.p210m #wInv[hidden]{display:none!important}
 body.p210m #wInv .cw{display:flex!important;flex-direction:column!important;gap:10px!important;grid-template-columns:none!important}
 body.p210m #wInv .cw>section{min-width:0;width:auto!important}
 body.p210m #wInv>header{flex:none;flex-wrap:wrap;row-gap:6px}
 body.p210m #wInv h2{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:calc(100% - 44px);font-size:15px}
 body.p210m #wInv h2 small{font-size:10.5px}
 body.p210m #p210tabs{display:flex;gap:6px;width:100%;order:3}
 body.p210m #p210tabs button{flex:1;height:34px;border-radius:10px;border:1px solid rgba(143,164,204,.3);background:rgba(4,8,22,.6);color:#cfe0ff;font:700 13px/1 inherit;font-family:inherit}
 body.p210m #p210tabs button.on{background:linear-gradient(180deg,#3a3010,#241c08);border-color:#e6c870;color:#ffe08a}
 body.p210m #wInv .body,body.p210m.mobile #wInv .body{flex:1;min-height:0;padding:8px 8px 8px!important}
 body.p210m #wInv[data-p210] .cw{height:100%!important}
 body.p210m #wInv[data-p210="inv"] .cwEq,body.p210m #wInv[data-p210="inv"] .cwSt,body.p210m #wInv[data-p210="inv"] .cwDer{display:none!important}
 body.p210m #wInv[data-p210="inv"] .body{overflow:hidden!important}
 body.p210m #wInv[data-p210="inv"] .cwInv{display:flex!important;flex-direction:column;flex:1;min-height:0;overflow:hidden!important}
 body.p210m #wInv[data-p210="inv"] .invtabs{flex:none;flex-wrap:wrap;row-gap:5px}
 body.p210m #wInv[data-p210="inv"] .invg{flex:1;min-height:0;overflow-y:auto;grid-template-columns:repeat(5,1fr)!important;gap:5px!important;align-content:start;padding-bottom:4px;-webkit-overflow-scrolling:touch}
 body.p210m #wInv[data-p210="inv"] .pager{flex:none;flex-wrap:wrap;row-gap:4px}
 body.p210m #wInv[data-p210="eq"] .cwInv,body.p210m #wInv[data-p210="eq"] .cwSt,body.p210m #wInv[data-p210="eq"] .cwDer{display:none!important}
 body.p210m #wInv[data-p210="st"] .cwInv,body.p210m #wInv[data-p210="st"] .cwEq{display:none!important}
 body.p210m #wInv[data-p210="eq"] .body,body.p210m #wInv[data-p210="st"] .body{overflow-y:auto!important}
 body.p210m.p210open #hudTrayBtn,body.p210m.p210open #hudxGear,body.p210m.p210open #r2tBtn,body.p210m.p210open .p210hide{visibility:hidden!important}
 body.p210m #wInv[data-p210="eq"] .cw,body.p210m #wInv[data-p210="st"] .cw{height:auto!important;display:flex!important;flex-direction:column}
 body.p210m #wInv[data-p210="eq"] .cw>section,body.p210m #wInv[data-p210="st"] .cw>section{flex:none!important;height:auto!important;max-height:none!important;overflow:visible!important}
`;
document.head.appendChild(st);
let tab='inv';
function ensure(){const w=document.getElementById('wInv');if(!w)return null;
  const hd=w.querySelector(':scope>header');if(hd&&!document.getElementById('p210tabs')){const t=document.createElement('div');t.id='p210tabs';
    t.innerHTML='<button data-t="inv">กระเป๋า</button><button data-t="eq">อุปกรณ์</button><button data-t="st">สเตตัส</button>';
    t.addEventListener('click',e=>{const b=e.target.closest('button[data-t]');if(!b)return;e.stopPropagation();tab=b.dataset.t;apply();const bd=document.getElementById('invBody');if(bd)bd.scrollTop=0;});hd.appendChild(t);}
  return w;}
function geom(w,mob){const vv=window.visualViewport;
  if(!mob){for(const k of ['left','top','width','height','transform'])w.style.removeProperty(k);return;}
  const W=vv?vv.width:innerWidth,H=vv?vv.height:innerHeight,L=vv?vv.offsetLeft:0,T=vv?vv.offsetTop:0;
  w.style.setProperty('left',Math.round(L+6)+'px','important');w.style.setProperty('top',Math.round(T+6)+'px','important');
  w.style.setProperty('width',Math.round(W-12)+'px','important');w.style.setProperty('height',Math.round(H-12)+'px','important');
  w.style.setProperty('transform','none','important');}
function diag(w){try{let d=document.getElementById('p210diag');if(!d){d=document.createElement('div');d.id='p210diag';d.style.cssText='position:absolute;right:8px;bottom:2px;font:10px/1.2 monospace;color:rgba(160,180,220,.55);pointer-events:none;z-index:5';w.appendChild(d);}
  const vv=window.visualViewport,pr=document.createElement('div');pr.style.cssText='position:fixed;width:100vw;height:0;left:0;top:0;visibility:hidden';document.body.appendChild(pr);const vw=pr.getBoundingClientRect().width;pr.remove();const r=w.getBoundingClientRect();
  d.textContent=`dbg ${innerWidth}x${innerHeight} vv ${vv?Math.round(vv.width)+'x'+Math.round(vv.height)+' s'+vv.scale.toFixed(2):'-'} vw ${Math.round(vw)} win ${Math.round(r.width)}x${Math.round(r.height)} dpr ${devicePixelRatio}`;}catch(_){}}
function apply(){const w=ensure();if(!w)return;const mob=MQ.matches;document.body.classList.toggle('p210m',mob);geom(w,mob);setTimeout(()=>diag(w),50);
  if(mob)w.setAttribute('data-p210',tab);else w.removeAttribute('data-p210');
  const t=document.getElementById('p210tabs');if(t){t.style.display=mob?'':'none';for(const b of t.children)b.classList.toggle('on',b.dataset.t===tab);}
  const open=!w.hidden&&getComputedStyle(w).display!=='none';document.body.classList.toggle('p210open',mob&&open);
}
// the floating ⚙ graphics button has no id in every build: tag the round one at the right edge once
function tagGear(){for(const el of document.querySelectorAll('body > *')){if(el.id==='wInv'||el.classList.contains('p210hide'))continue;const tx=(el.textContent||'').trim();if(tx==='⚙'||tx==='⚙️'){el.classList.add('p210hide');}}}
addEventListener('resize',()=>{try{apply();}catch(_){}});
if(typeof openWin==='function'){const o=openWin;openWin=function(id){const r=o.apply(this,arguments);try{if(id==='wInv'){tagGear();apply();}else document.body.classList.remove('p210open');}catch(_){}return r;};}
if(typeof closeWin==='function'){const o=closeWin;closeWin=function(){const r=o.apply(this,arguments);try{apply();}catch(_){}return r;};}
setInterval(()=>{try{const w=document.getElementById('wInv');if(w){const open=!w.hidden&&getComputedStyle(w).display!=='none';if(open!==document.body.classList.contains('p210open')||(open&&MQ.matches&&w.getAttribute('data-p210')!==tab))apply();}}catch(_){}},400);
window.__P210={apply,get tab(){return tab;}};
})();

