
/* ---- r128 skslotbar (v3l6): a skill-slot bar INSIDE the weapon skill window (wWpnSk) and its ★ special page. DeaRz order via coordinator 17 Nov 2026.
   * the long description text of the bottom detail panel is gone (it is in the skill tooltip: hover a skill card, a bar slot or a ★ card).
   * the bar mirrors the real HUD slots 1-6 Q E R F (reads the painted #bar slots every 250 ms, so it is always in sync with the HUD and with the saved maps):
       drag a skill card (mouse) onto a slot = assign · drag slot -> slot = swap / move · drag a slot out of the bar or right-click it = clear
       phone / touch: tap a skill, then tap a slot (tap the slot that already holds that skill = clear); dragging a filled slot also works.
   * assignment goes through each weapon module's OWN assign code (select row + its #wskAs button + a click on the HUD slot, with the window kept open), so saved data = the same maps as the "ช่อง N / ถอด" buttons.
     special skills (★ page) are put into P.slots[idx] like SPSLOT does.
   * locked / draft / passive skills cannot be assigned (short toast with the reason). R is reserved by the weapons' own rule (their message shows).
   ?skslotbar=off = old panel. Debug: window.__SKBAR ---- */
(function(){'use strict';
const Q=String(location.search),SB=window.__SKBAR={ver:'skbar-r1',on:!/[?&]skslotbar=off\b/.test(Q),err:null,log:[],drops:0};
if(!SB.on)return;
const ERR=(w,e)=>{SB.err=w+': '+((e&&e.message)||e);try{console.error('[SKBAR]',w,e)}catch(_){}};
const $=s=>document.querySelector(s);
const WKEYS=['ws','bs','ss','dgs','scs','hs','hws'];
const SLOTK=['1','2','3','4','5','6','Q','E','R','F'];
const SPK={sak:'spSakura',dd:'spDemon',th:'spThunder',st:'spStorm',dh:'spDragon'},SPI={};for(const k in SPK)SPI[SPK[k]]=k;
const COARSE=()=>{try{return matchMedia('(pointer:coarse)').matches||document.body.classList.contains('mobile')}catch(_){return false}};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const css=document.createElement('style');css.id='skbarCss';css.textContent=`
#wWpnSk .dtx .dd,#wWpnSk .spdtx .dd{display:none!important}
#wWpnSk .dtx.skb-nosel .dd{display:block!important}
#wWpnSk #spRow{display:none!important}
#wWpnSk .skbW{flex:0 0 auto;display:flex;flex-direction:column;gap:.25cqw;margin-top:.5cqw;user-select:none;-webkit-user-select:none}
#wWpnSk .skbar{display:flex;gap:max(2px,.45cqw);align-items:stretch;justify-content:flex-start}
#wWpnSk .skb-s{position:relative;flex:1 1 0;min-width:0;max-width:4.7cqw;aspect-ratio:1;box-sizing:border-box;border:1px dashed rgba(214,176,92,.55);border-radius:.7cqw;background:rgba(20,15,9,.82);cursor:pointer;touch-action:none;overflow:hidden;padding:0}
#wWpnSk .skb-s img{display:block;width:100%;height:100%;object-fit:cover;pointer-events:none;-webkit-user-drag:none}
#wWpnSk .skb-s .k{position:absolute;left:0;top:0;min-width:1.5cqw;padding:0 .35cqw;font:700 max(9px,1.15cqw)/1.25 system-ui,sans-serif;color:#ffe9b0;background:rgba(0,0,0,.66);border-radius:.5cqw 0 .5cqw 0;text-align:center;pointer-events:none;z-index:2}
#wWpnSk .skb-s.has{border:1px solid #d6b05c;cursor:grab}
#wWpnSk .skb-s.has.ro{cursor:default;border-color:rgba(214,176,92,.4)}
#wWpnSk .skb-s.off img{filter:grayscale(.85) brightness(.55)}
#wWpnSk .skb-s.rsv:not(.has){border-color:rgba(140,140,140,.55)}
#wWpnSk .skb-s.over{box-shadow:0 0 0 2px #ffd98a,0 0 10px rgba(255,217,138,.8);background:rgba(90,66,24,.9)}
#wWpnSk .skb-s.selk{box-shadow:0 0 0 2px #9be8b4}
#wWpnSk.tabs .dtx,#wWpnSk.tabs .spdtx{width:54.8%}
#wWpnSk.tabs .skb-s{max-width:none}
#wWpnSk .skhint{font-size:max(9px,1.12cqw);color:#a99c80;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#wWpnSk.tabs .skhint{font-size:max(9px,1.7cqw)}
#wWpnSk .skbT{position:absolute;left:13.1%;top:74.2%;max-width:53%;z-index:9;padding:.5cqw 1.2cqw;border-radius:.9cqw;background:rgba(20,15,8,.94);border:1px solid #d6b05c;color:#ffe9b0;font:700 max(11px,1.5cqw)/1.25 system-ui,sans-serif;display:none;pointer-events:none}
#skghost{position:fixed;z-index:99995;width:46px;height:46px;border-radius:8px;border:2px solid #ffd98a;box-shadow:0 4px 14px rgba(0,0,0,.7);background:#100d09;overflow:hidden;pointer-events:none;display:none;opacity:.92}
#skghost img{width:100%;height:100%;object-fit:cover;display:block}
#skghost.bad{border-color:#e07070;opacity:.7}
body.skdrag,body.skdrag *{cursor:grabbing!important;user-select:none!important;-webkit-user-select:none!important}
`;
document.head.appendChild(css);
const ghost=document.createElement('div');ghost.id='skghost';document.body.appendChild(ghost);
let EXPL=false;                                     /* the player picked a skill on purpose (tap-to-assign is only armed then) */
const winEl=()=>$('#wWpnSk');
const isOpen=()=>{const w=winEl();return !!w&&!w.hidden};
const onSp=()=>{const w=winEl();return !!w&&w.classList.contains('sp')};
/* ---------------- data ---------------- */
function types(){const m={};try{const L=__WSK.lines;for(const ln in L)for(const c of L[ln].cols)for(const s of c.skills)m[s.k]=s.type}catch(_){}return m}
function rowEl(k){const w=winEl();if(!w)return null;for(const r of w.querySelectorAll('.row[data-k]'))if(r.dataset.k===k)return r;return null}
function selRowK(){const r=$('#wWpnSk .row.sel');return r?r.dataset.k:null}
function altsOf(rk){return [rk,rk.replace(/^(bsk_|stf_|dg_|scy_|pas_)/,''),rk.replace(/^stf_h_/,'h_')]}
function rowKeyFor(v){const w=winEl();if(!w)return null;for(const r of w.querySelectorAll('.row[data-k]')){if(altsOf(r.dataset.k).includes(v))return r.dataset.k}return null}
function slotEl(i){return document.querySelector('#bar .slot[data-i="'+i+'"]')||document.querySelector('#tSkills .tsk[data-ti="'+i+'"]')}
function slotInfo(i){const el=slotEl(i);if(!el)return {i,none:true};
  let kind=null,key=null;for(const k of WKEYS){if(el.dataset[k]){kind='w';key=el.dataset[k];break}}
  if(!kind){const sk=el.dataset.sk;if(sk&&SPI[sk]){kind='s';key=SPI[sk]}else if(sk){kind='b';key=sk}}
  if(!kind)return {i,empty:true};
  const im=el.querySelector('img');const nm=el.getAttribute('title')||el.dataset.tt||'';
  return {i,kind,key,src:im?im.src:'',name:nm,off:el.classList.contains('wsoff'),rk:kind==='w'?rowKeyFor(key):null};}
const spDef=id=>{try{return SPSK.defs.find(d=>d.id===id)||null}catch(_){return null}};
/* ---------------- toast ---------------- */
let tT=0;function toast(t,ms){const w=winEl();if(!w)return;let el=w.querySelector('.skbT');if(!el){const b=w.querySelector('.box');if(!b)return;el=document.createElement('div');el.className='skbT';b.appendChild(el)}
  el.textContent=t;el.style.display='block';clearTimeout(tT);tT=setTimeout(()=>{el.style.display='none'},ms||2400)}
/* ---------------- rendering ---------------- */
let sig='';
function hintText(){return onSp()?(COARSE()?'แตะสกิลพิเศษ แล้วแตะช่อง · แตะช่องซ้ำเพื่อถอด':'ลากการ์ดสกิลพิเศษมาวางที่ช่อง · คลิกขวา/ลากออกเพื่อถอด'):(COARSE()?'แตะสกิล แล้วแตะช่อง · แตะช่องที่มีสกิลนั้นซ้ำเพื่อถอด':'ลากสกิลมาวางที่ช่อง · ลากช่องออก/คลิกขวาเพื่อถอด')}
function ensure(){const w=winEl();if(!w)return;
  for(const [sel,pos] of [['.dtx','.dn'],['.spdtx','.dn']]){const host=w.querySelector(sel);if(!host)continue;if(host.querySelector(':scope > .skbW'))continue;
    const el=document.createElement('div');el.className='skbW';el.innerHTML='<div class="skbar"></div><div class="skhint"></div>';const dn=host.querySelector(pos);if(dn&&dn.nextSibling)host.insertBefore(el,dn.nextSibling);else host.appendChild(el);}
  const dtx=w.querySelector('.dtx');if(dtx){const ns=!w.querySelector('.row.sel');if(dtx.classList.contains('skb-nosel')!==ns)dtx.classList.toggle('skb-nosel',ns)}}
function render(force){const w=winEl();if(!w||w.hidden)return;ensure();if(D&&D.active)return;
  const inf=[];for(let i=0;i<10;i++)inf.push(slotInfo(i));
  const sel=onSp()?(window.SPSK&&SPSK.sel):selRowK();
  const sg=inf.map(x=>x.empty||x.none?'-':x.kind+x.key+(x.off?'!':'')+(x.src?x.src.length:0)).join(',')+'|'+(sel||'')+'|'+onSp()+'|'+COARSE();
  if(!force&&sg===sig)return;sig=sg;
  const html=inf.map(x=>{const has=!x.empty&&!x.none;const R=SLOTK[x.i]==='R';
    const cls='skb-s'+(has?' has':'')+(has&&x.kind==='b'?' ro':'')+(x.off?' off':'')+(R?' rsv':'')+(has&&((x.kind==='w'&&x.rk&&x.rk===sel)||(x.kind==='s'&&x.key===sel))?' selk':'');
    return '<div class="'+cls+'" data-i="'+x.i+'"'+(has?' data-kind="'+x.kind+'" data-key="'+esc(x.key)+'"'+(x.rk?' data-k="'+esc(x.rk)+'"':'')+(x.kind==='s'?' data-spk="'+esc(x.key)+'"':''):'')+'>'
      +'<span class="k">'+SLOTK[x.i]+'</span>'+(has&&x.src?'<img alt="" src="'+esc(x.src)+'">':'')+'</div>'}).join('');
  for(const b of w.querySelectorAll('.skbar'))b.innerHTML=html;
  const ht=hintText();for(const h of w.querySelectorAll('.skhint'))h.textContent=ht;}
/* ---------------- validity ---------------- */
function reasonRow(k){const r=rowEl(k);if(!r)return 'ไม่พบสกิลนี้';const t=types()[k];
  if(r.classList.contains('lock')){const c=r.querySelector('.chip');return 'ล็อกอยู่ · '+(c?c.textContent.replace('🔒','').trim():'ยังไม่ปลดล็อก')}
  if(r.classList.contains('draft'))return 'ยังไม่เปิดใช้งาน (กำลังพัฒนา) ใส่ช่องไม่ได้';
  if(t!=='active')return 'สกิลพาสซีฟ ทำงานเอง ใส่ช่องไม่ได้';return ''}
function reasonSp(id){const d=spDef(id);if(!d)return 'ไม่พบสกิลนี้';if(!SPK[id])return 'สกิลนี้ใช้ปุ่มของมันเอง ใส่ช่องไม่ได้';
  let s='off';try{s=SPSK.state(id)}catch(_){}if(s==='lock')return 'ล็อกอยู่ · ต้อง Lv.'+d.lv;if(s!=='on')return 'ยังไม่เปิดใช้งาน ใส่ช่องไม่ได้';return ''}
/* ---------------- actions ---------------- */
function guard(fn){let oc=null,had=false;try{oc=closeWin;closeWin=function(){};had=true}catch(_){}try{return fn()}finally{if(had){try{closeWin=oc}catch(_){}}}}
function cancelAssign(){try{if(document.body.classList.contains('wsAssign')){document.body.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
    if(document.body.classList.contains('wsAssign')){document.body.classList.remove('wsAssign','wsAsNoR');const m=$('#wsAssignMsg');if(m)m.style.display='none'}}}catch(_){}}
function assignWeapon(rk,idx){const r=reasonRow(rk);if(r){toast(r);return false}
  const el=slotEl(idx);if(!el){toast('ไม่พบช่องนี้');return false}
  const row=rowEl(rk);if(selRowK()!==rk)row.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
  const as=document.getElementById('wskAs');if(!as||as.disabled){toast('ใส่ช่องไม่ได้');return false}
  guard(()=>{as.click();el.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));cancelAssign()});
  const at=slotInfo(idx);const ok=at&&at.kind==='w'&&at.rk===rk;
  if(!ok){if(SLOTK[idx]==='R')toast('ช่อง R สงวนไว้ให้สกิลท้ายสายของอาวุธนี้ เลือกช่องอื่น');else toast('ใส่สกิลนี้ลงช่อง '+SLOTK[idx]+' ไม่ได้')}
  SB.log.push({ev:'assignW',rk,idx,ok});setTimeout(()=>render(true),60);return ok}
function assignSpecial(spk,idx){const r=reasonSp(spk);if(r){toast(r);return false}
  if(SLOTK[idx]==='R'){toast('ช่อง R สงวนไว้ให้สกิลของอาวุธ เลือกช่องอื่น');return false}
  const id=SPK[spk];try{const el=slotEl(idx);const at=slotInfo(idx);if(at.kind==='w')guard(()=>{el.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,view:window}))});
    const old=P.slots.indexOf(id);if(old>=0)P.slots[old]=null;P.slots[idx]=id;try{buildBar()}catch(_){}try{saveGame()}catch(_){}}catch(e){ERR('assignSp',e);return false}
  const ok=slotInfo(idx).key===spk;if(!ok)toast('ใส่สกิลนี้ลงช่อง '+SLOTK[idx]+' ไม่ได้');
  SB.log.push({ev:'assignS',spk,idx,ok});setTimeout(()=>render(true),60);return ok}
function clearSlot(idx,quiet){const at=slotInfo(idx);if(at.empty||at.none)return false;
  if(at.kind==='b'){toast('สกิลพื้นฐาน ถอดจากหน้านี้ไม่ได้');return false}
  if(at.kind==='s'){try{const id=SPK[at.key];const j=P.slots.indexOf(id);if(j>=0)P.slots[j]=null;try{buildBar()}catch(_){}try{saveGame()}catch(_){}}catch(e){ERR('clrS',e)}}
  else guard(()=>{slotEl(idx).dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,view:window}))});
  SB.log.push({ev:'clear',idx});setTimeout(()=>render(true),60);if(!quiet)toast('ถอดสกิลออกจากช่อง '+SLOTK[idx]+' แล้ว',1600);return true}
const putItem=(it,idx)=>it.kind==='s'?assignSpecial(it.key,idx):assignWeapon(it.rk,idx);
function moveSlot(a,b){if(a===b)return;const A=slotInfo(a),B=slotInfo(b);if(A.empty||A.kind==='b')return;
  if(A.kind==='w'&&!A.rk){toast('ย้ายสกิลนี้ไม่ได้ในหน้านี้');return}
  if(!putItem(A,b))return;
  if(!B.empty&&!B.none&&B.kind!=='b'&&(B.kind==='s'||B.rk)){if(!putItem(B,a))toast('สลับไม่สำเร็จ · ถอด '+(B.name||'สกิล')+' ออกจากช่อง')}
  setTimeout(()=>render(true),80)}
/* ---------------- drag ---------------- */
let D=null;
function ghostAt(x,y){ghost.style.left=Math.round(x-23)+'px';ghost.style.top=Math.round(y-23)+'px'}
function endDrag(){if(D&&D.active){ghost.style.display='none';document.body.classList.remove('skdrag');for(const e of document.querySelectorAll('#wWpnSk .skb-s.over'))e.classList.remove('over')}D=null}
document.addEventListener('pointerdown',e=>{try{if(!isOpen()||e.button!==0)return;D=null;
  const s=e.target.closest&&e.target.closest('#wWpnSk .skb-s');
  if(s&&s.classList.contains('has')&&!s.classList.contains('ro')){D={from:'slot',i:+s.dataset.i,src:(s.querySelector('img')||{}).src||'',pid:e.pointerId}}
  else if(!s&&e.pointerType!=='touch'){const row=e.target.closest&&e.target.closest('#wWpnSk .row[data-k]');
    if(row)D={from:'row',k:row.dataset.k,src:(row.querySelector('img')||{}).src||'',bad:reasonRow(row.dataset.k),pid:e.pointerId};
    else{const sp=e.target.closest&&e.target.closest('#wWpnSk .spr[data-sp]');if(sp)D={from:'sp',id:sp.dataset.sp,src:(sp.querySelector('img')||{}).src||'',bad:reasonSp(sp.dataset.sp),pid:e.pointerId}}}
  if(D){D.sx=e.clientX;D.sy=e.clientY;D.active=false}}catch(er){ERR('down',er)}},true);
document.addEventListener('pointermove',e=>{try{if(!D||e.pointerId!==D.pid)return;
  if(!D.active){if(Math.hypot(e.clientX-D.sx,e.clientY-D.sy)<7)return;D.active=true;ghost.innerHTML=D.src?'<img alt="" src="'+esc(D.src)+'">':'';ghost.classList.toggle('bad',!!D.bad);ghost.style.display='block';document.body.classList.add('skdrag')}
  ghostAt(e.clientX,e.clientY);e.preventDefault();
  const t=document.elementFromPoint(e.clientX,e.clientY),s=t&&t.closest&&t.closest('#wWpnSk .skb-s');
  for(const x of document.querySelectorAll('#wWpnSk .skb-s.over'))if(x!==s)x.classList.remove('over');if(s)s.classList.add('over')}catch(er){ERR('move',er)}},true);
function swallowClick(){const h=ev=>{if(!ev.isTrusted)return;ev.stopImmediatePropagation();ev.preventDefault();document.removeEventListener('click',h,true)};document.addEventListener('click',h,true);setTimeout(()=>document.removeEventListener('click',h,true),120)}
document.addEventListener('pointerup',e=>{try{if(!D||e.pointerId!==D.pid)return;const d=D;if(!d.active){D=null;return}
  const t=document.elementFromPoint(e.clientX,e.clientY),s=t&&t.closest&&t.closest('#wWpnSk .skb-s');
  const w=winEl(),inBar=!!(t&&t.closest&&t.closest('#wWpnSk .skbW'));
  endDrag();SB.drops++;
  if(d.from==='slot'){if(s){moveSlot(d.i,+s.dataset.i)}else if(!inBar){clearSlot(d.i)}}
  else if(d.from==='row'){if(s){if(d.bad)toast(d.bad);else assignWeapon(d.k,+s.dataset.i)}}
  else if(d.from==='sp'){if(s){if(d.bad)toast(d.bad);else assignSpecial(d.id,+s.dataset.i)}}
  swallowClick();}catch(er){ERR('up',er);endDrag()}},true);
document.addEventListener('pointercancel',()=>{endDrag()},true);
addEventListener('keydown',e=>{if(e.key==='Escape'&&D)endDrag()},true);
/* ---------------- tap ---------------- */
document.addEventListener('click',e=>{try{const w=winEl();if(!w||w.hidden)return;
  const row=e.target.closest&&e.target.closest('#wWpnSk .row[data-k], #wWpnSk .spr[data-sp]');if(row){EXPL=true;return}
  const s=e.target.closest&&e.target.closest('#wWpnSk .skb-s');if(!s)return;
  e.stopImmediatePropagation();e.stopPropagation();e.preventDefault();
  const i=+s.dataset.i,at=slotInfo(i),sp=onSp();
  if(!EXPL){if(!at.empty&&!at.none){if(at.kind==='w'&&at.rk){const r=rowEl(at.rk);if(r)r.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}))}else if(at.kind==='s'){const c=w.querySelector('.spr[data-sp="'+at.key+'"]');if(c)c.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}))}EXPL=true}
    else toast(COARSE()?'แตะสกิลก่อน แล้วแตะช่อง':'ลากสกิลมาวาง หรือคลิกสกิลก่อน แล้วคลิกช่อง');return}
  if(sp){const id=window.SPSK&&SPSK.sel;if(!id)return;if(at.kind==='s'&&at.key===id){clearSlot(i);return}assignSpecial(id,i);return}
  const k=selRowK();if(!k)return;if(at.kind==='w'&&at.rk===k){clearSlot(i);return}assignWeapon(k,i)}catch(er){ERR('tap',er)}},true);
document.addEventListener('contextmenu',e=>{try{const s=e.target.closest&&e.target.closest('#wWpnSk .skb-s');if(!s)return;e.preventDefault();e.stopPropagation();if(s.classList.contains('has'))clearSlot(+s.dataset.i)}catch(er){ERR('ctx',er)}},true);
/* ---------------- loop ---------------- */
let wasOpen=false;
setInterval(()=>{try{const o=isOpen();if(o!==wasOpen){wasOpen=o;if(!o){EXPL=false;endDrag()}else sig=''}if(o)render()}catch(e){ERR('tick',e)}},250);
SB.assign=(rk,i)=>assignWeapon(rk,i);SB.assignSp=(id,i)=>assignSpecial(id,i);SB.clear=i=>clearSlot(i);SB.move=moveSlot;SB.info=()=>{const a=[];for(let i=0;i<10;i++)a.push(slotInfo(i));return a};SB.render=()=>render(true);
})();

