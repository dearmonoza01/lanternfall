
/* ---- slotui-r1 (TEST, 10 Nov 2026): "ติดตั้ง" (install) button on every ACTIVE skill row of the weapon skill window (DeaRz 12:22) ----
   Works for every weapon line that lives in the skill window (sword, dagger, bow, staff, holy staff, scythe; knuckle has no skills yet).
   It does not add a new slot system: it drives the game's own one. Press "ติดตั้ง" on a row = select the row + press the window's own assign button -> the window closes, the hotbar slots are highlighted,
   tap / click a slot = the skill goes there (replacing the slot's skill), tap outside = cancel (each weapon module already does this, also on the touch skill ring).
   A skill already in a slot shows "ติดตั้งแล้ว (ช่อง N)" + a "ถอด" button (= the slot's own right-click clear). Big tap targets on phones, no drag needed. The slots are the weapons' own saved maps.
   The old small bottom button of the detail panel is restyled to the same words. Flag ?slotui=off. Debug: window.SLOTUI. ---- */
(function(){'use strict';
const Q=String(location.search),SUI=window.SLOTUI={ver:'slotui-r1',on:!/[?&]slotui=off\b/.test(Q),err:null,n:0};
if(!SUI.on)return;
const ERR=(w,e)=>{SUI.err=w+': '+((e&&e.message)||e);try{console.error('[SLOTUI]',w,e)}catch(_){}};
const st=document.createElement('style');
st.textContent=`
#wWpnSk .row{position:relative}
#wWpnSk .spBox{display:flex;flex-direction:column;gap:4px;align-items:stretch;justify-content:center;margin-left:auto;flex:none;padding-left:6px}#wWpnSk .spBox .spInst,#wWpnSk .spBox .spUn{min-height:30px;font-size:12px;padding:0 8px}
#wWpnSk .spInst,#wWpnSk .spUn{min-height:34px;padding:0 12px;border-radius:9px;border:1px solid #ffd98a;background:linear-gradient(#d49a3a,#8a5a14);color:#fff4cf;font:800 13px/1 system-ui,sans-serif;cursor:pointer;touch-action:manipulation;white-space:nowrap}
#wWpnSk .spInst.on{background:linear-gradient(#3f8a5a,#215238);border-color:#9be8b4;color:#eafff0}
#wWpnSk .spUn{background:linear-gradient(#6a3a3a,#3f1f1f);border-color:#e0a0a0;color:#ffe6e6;padding:0 10px}
@media (max-width:900px),(pointer:coarse){#wWpnSk .spInst,#wWpnSk .spUn{min-height:38px;min-width:70px;font-size:14px;padding:0 10px}#wWpnSk .spInst.on{min-width:104px}#wWpnSk #wskAs,#spUnFloat{display:none!important}#wWpnSk .spBox{flex-direction:row;gap:4px;padding-left:4px}#wWpnSk .spBox .spInst,#wWpnSk .spBox .spUn{min-height:38px;font-size:14px}}
#wWpnSk #wskAs{font-size:0!important;min-height:40px}
#wWpnSk #wskAs::before{font:800 max(14px,1.7cqw)/1.1 system-ui,sans-serif;content:'ติดตั้ง'}
#wWpnSk #wskAs[data-st=inst]::before{content:'ติดตั้งแล้ว (ช่อง ' attr(data-slot) ') · ย้าย'}
#spUnFloat{position:fixed;z-index:9700;min-height:40px;padding:0 14px;border-radius:9px;border:1px solid #e0a0a0;background:linear-gradient(#6a3a3a,#3f1f1f);color:#ffe6e6;font:800 14px system-ui;cursor:pointer;touch-action:manipulation;display:none}
body.wsAssign #wsAssignMsg{font-size:16px!important;padding:10px 16px!important}
body.wsAssign #bar .slot:not(.pot),body.wsAssign #tSkills .tsk{outline:3px dashed #ffd98a!important;outline-offset:-2px}`;
document.head.appendChild(st);
const $=s=>document.querySelector(s);
/* r75 (DeaRz 14 Nov 00:52): the detail panel's install area is ONE small row on a single line, never wrapping:
   not installed = [ติดตั้ง]; installed = chip "ช่อง N" (text, not a button) + [ย้าย] + [ถอด]. The old wide #wskAs box and the floating ถอด are hidden (the old button is still clicked by script, so every weapon module's own assign code keeps working). */
const st2=document.createElement('style');st2.textContent=`
#wWpnSk .bt.as,#spUnFloat{display:none!important}
#wWpnSk #spRow{left:40%;width:22.5%;top:92.2%;height:5%;display:flex;align-items:center;justify-content:flex-end;gap:.45cqw;z-index:5;white-space:nowrap}
#wWpnSk #spRow[hidden]{display:none}
#wWpnSk #spRow .spChip{height:100%;display:flex;align-items:center;padding:0 .8cqw;border-radius:.7cqw;border:1px dashed rgba(214,176,92,.7);color:#ffe9b0;font-weight:700;font-size:max(10px,1.3cqw);background:rgba(40,30,16,.7)}
#wWpnSk #spRow .spChip[hidden]{display:none}
#wWpnSk #spRow .spB{height:100%;min-height:24px;padding:0 .9cqw;border-radius:.7cqw;border:1px solid #ffd98a;background:rgba(96,66,16,.92);color:#ffe9b0;font-family:inherit;font-weight:800;font-size:max(11px,1.4cqw);cursor:pointer;touch-action:manipulation;white-space:nowrap}
#wWpnSk #spRow .spB.un{border-color:#e0a0a0;background:rgba(88,40,40,.92);color:#ffe6e6}
#wWpnSk #spRow .spB[hidden]{display:none}
@media (pointer:coarse){#wWpnSk #spRow .spB{min-height:30px}}`;
document.head.appendChild(st2);
/* r83 (DeaRz via coordinator 14 Nov): per-row install area in the skill list = ONE small line, no overlap / clipping:
   not installed = small [ติดตั้ง]; installed = small chip "ช่อง N" (still tappable = move) + small [ถอด]. Same style as the detail-panel row (r75). ?rowfix=off = r82 look. */
if(!/[?&]rowfix=off\b/.test(Q)){const st3=document.createElement('style');st3.textContent=`
#wWpnSk .row{flex-wrap:nowrap!important;align-items:center}
#wWpnSk .row>.mid{flex:1 1 0!important;min-width:0!important}
#wWpnSk .row>.spBox{flex-direction:row!important;align-items:center!important;gap:3px!important;padding:0!important;margin-left:auto;flex:none!important;white-space:nowrap}
#wWpnSk .row>.spBox .spInst,#wWpnSk .row>.spBox .spUn{min-height:0!important;min-width:0!important;height:22px;padding:0 6px!important;border-radius:6px;font:800 11px/1 system-ui,sans-serif!important}
#wWpnSk .row>.spBox .spInst.on{background:rgba(40,30,16,.75)!important;border:1px dashed rgba(214,176,92,.8)!important;color:#ffe9b0!important}
#wWpnSk .row>.spBox .spInst:disabled{padding:0 4px!important}
#wWpnSk .row.lock>.spBox{display:none!important}
#wWpnSk .row>.mid .nm{font-size:15px!important;line-height:1.1!important}
#wWpnSk .row>.mid .slvW{flex-wrap:nowrap!important;gap:2px!important}
#wWpnSk .row>.mid .slvW>*{font-size:10px!important;padding-left:5px!important;padding-right:5px!important;white-space:nowrap}
@media (pointer:coarse){#wWpnSk .row>.spBox .spInst,#wWpnSk .row>.spBox .spUn{height:26px}}`;document.head.appendChild(st3)}
function syncRow(win){try{const box=win.querySelector('.box');if(!box)return;let row=box.querySelector('#spRow');
  if(!row){row=document.createElement('div');row.id='spRow';row.className='abs';row.hidden=true;row.innerHTML='<span class="spChip" hidden></span><button type="button" class="spB mv">ติดตั้ง</button><button type="button" class="spB un" hidden>ถอด</button>';box.appendChild(row);
    row.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.spB');if(!b)return;e.stopPropagation();e.preventDefault();if(b.classList.contains('un'))unSel();else{const a=$('#wskAs');if(a&&!a.disabled)a.click()}},true)}
  const as=$('#wskAs'),can=!!as&&!as.disabled&&as.style.visibility!=='hidden';if(!can){if(!row.hidden)row.hidden=true;return}
  const rk=selKey(),at=rk?slotOf(rk):null,m=at?[0,at.label]:null,inst=!!m,ch=row.querySelector('.spChip'),mv=row.querySelector('.mv'),un=row.querySelector('.un');
  if(row.hidden)row.hidden=false;if(ch.hidden!==!inst)ch.hidden=!inst;const ct=inst?'ช่อง '+m[1]:'';if(ch.textContent!==ct)ch.textContent=ct;const mt=inst?'ย้าย':'ติดตั้ง';if(mv.textContent!==mt)mv.textContent=mt;if(un.hidden!==!inst)un.hidden=!inst}catch(e){ERR('row',e)}}
/* ---- which skills of the skill window are ACTIVE (type from the window's own line tables) ---- */
function types(){const m={};try{const L=__WSK.lines;for(const ln in L)for(const c of L[ln].cols)for(const s of c.skills)m[s.k]=s.type}catch(_){}return m}
/* ---- where is a row's skill installed? scan the painted hotbar slots (every weapon module marks its painted slots with its own data-* key) ---- */
const KEYS=['ws','bs','ss','dgs','scs','hs','hws'];
let _seC=null,_seT=0;function slotEls(){const PF=window.__PERF;if(PF&&PF.dom){const t=performance.now();if(_seC&&t-_seT<100&&t>=_seT&&_seC.every(e=>e.isConnected)){PF.stats.dom.slotHit++;return _seC.slice()}_seC=Array.from(document.querySelectorAll('#bar .slot[data-i],#tSkills .tsk[data-ti]'));_seT=t;return _seC.slice()}return Array.from(document.querySelectorAll('#bar .slot[data-i],#tSkills .tsk[data-ti]'))}/* r187 perf_dom: the slot list is reused for 100 ms (it was searched again for every passive skill on every frame) */
function slotOf(rowK){const alt=[rowK,rowK.replace(/^(bsk_|stf_|dg_|scy_|pas_)/,''),rowK.replace(/^stf_h_/,'h_')];
  for(const el of slotEls()){for(const k of KEYS){const v=el.dataset[k];if(v&&alt.includes(v)){const kb=el.querySelector('kbd');const i=+(el.dataset.i!==undefined?el.dataset.i:el.dataset.ti);return {el,idx:i,label:kb&&kb.textContent?kb.textContent.trim().toUpperCase():String(i+1)}}}}return null}
/* ---- decorate rows ---- */
let busy=false;
function decorate(){if(busy)return;const win=$('#wWpnSk');if(!win||win.hidden)return;busy=true;
  try{const ty=types();
    for(const row of win.querySelectorAll('.row[data-k]')){const k=row.dataset.k;if(ty[k]!=='active')continue;
      let box=row.querySelector(':scope > .spBox');
      if(!box){box=document.createElement('span');box.className='spBox';box.innerHTML='<button type="button" class="spInst"></button>';row.appendChild(box);SUI.n++}
      const at=slotOf(k),b=box.querySelector('.spInst'),un=box.querySelector('.spUn');
      const lock=row.classList.contains('lock');
      const narrow=matchMedia('(max-width:900px)').matches,lab=lock?'🔒':at?'ช่อง '+at.label:'ติดตั้ง';
      if(b.textContent!==lab)b.textContent=lab;b.classList.toggle('on',!!at);b.disabled=lock;
      if(at&&!un){const u=document.createElement('button');u.type='button';u.className='spUn';u.textContent='ถอด';box.appendChild(u)}
      else if(!at&&un)un.remove()}
    /* detail panel's own assign button: state for the CSS words + a floating "ถอด" next to it */
    const as=$('#wskAs'),sel=win.querySelector('.row.sel');
    if(as){const m=/ช่อง\s+(\S+)\s*·\s*ย้าย/.exec(as.textContent||'');const sta=m?'inst':'new';if(as.dataset.st!==sta)as.dataset.st=sta;if(m&&as.dataset.slot!==m[1])as.dataset.slot=m[1]}
    syncRow(win);
  }catch(e){ERR('decorate',e)}finally{busy=false}}
let raf=0;const sched=()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;decorate();floatUn()})};
function floatUn(){try{let f=document.getElementById('spUnFloat');const as=$('#wskAs'),win=$('#wWpnSk');
  const show=as&&win&&!win.hidden&&as.dataset.st==='inst'&&as.style.visibility!=='hidden'&&as.getBoundingClientRect().width>0;
  if(!f){f=document.createElement('button');f.id='spUnFloat';f.type='button';f.textContent='ถอด';document.body.appendChild(f);f.addEventListener('click',e=>{e.stopPropagation();unSel()})}
  if(!show){f.style.display='none';return}const r=as.getBoundingClientRect();f.style.display='block';f.style.left=Math.round(r.right+8)+'px';f.style.top=Math.round(r.top+r.height/2-20)+'px'}catch(e){ERR('float',e)}}
function selKey(){const s=$('#wWpnSk .row.sel');return s&&s.dataset.k}
function uninstall(k){const at=slotOf(k);if(!at)return false;at.el.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,view:window}));setTimeout(sched,150);return true}
function unSel(){const k=selKey();if(k)uninstall(k)}
/* ---- clicks ---- */
document.addEventListener('click',e=>{try{
  const ui=e.target.closest&&e.target.closest('.spInst'),un=e.target.closest&&e.target.closest('.spUn');
  if(!ui&&!un)return;const row=(ui||un).closest('.row');if(!row)return;e.stopImmediatePropagation();e.stopPropagation();e.preventDefault();
  const k=row.dataset.k;
  if(un){uninstall(k);return}
  if(ui.disabled)return;
  row.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));          /* the window selects the row + shows its detail */
  setTimeout(()=>{try{const as=document.getElementById('wskAs');if(as&&!as.disabled)as.click()}catch(er){ERR('assign',er)}},30)
}catch(er){ERR('click',er)}},true);
function hook(){const win=$('#wWpnSk');if(!win||win._spui)return !!win;win._spui=1;new MutationObserver(sched).observe(win,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden']});sched();return true}
setInterval(()=>{try{hook();if(window.__WSK&&__WSK.open){sched();const w0=$('#wWpnSk');if(w0&&!w0.hidden)syncRow(w0)}else{const f=document.getElementById('spUnFloat');if(f)f.style.display='none'}}catch(e){ERR('tick',e)}},400);
Object.assign(SUI,{decorate,slotOf,uninstall,types});
console.info('[SLOTUI] install buttons loaded');
})();
