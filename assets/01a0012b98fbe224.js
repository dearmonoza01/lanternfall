
/* ---- r172 houselooks (TEST ONLY, DeaRz 19 Nov 2026 via coordinator): the yard house can change its OUTSIDE look while staying the same house. Data = window.__HOUSE_LOOKS (houselooks_data.js, facings of smallCottage); this module = rules + UI. Build mode: select the placed house -> button "เปลี่ยนแบบบ้าน" -> picker (thumbnail + name). The change only swaps the outside picture: same house item (one-house rule), same origin point, same room / furniture / storage. If the new base polygon would overlap another placed item or leave the floor the change is refused with a short Thai message and the old look stays. The door warp (F prompt, hero exit) follows the look's own door point (facing.doorPt / warpPt, used by the patched houseroom.js). Save: house entry {look,view,fk,f}; the last look is also kept in state.hl so that storing the house and placing it again keeps its look; old saves (no look) = look 0. Rotate on a one-view look does nothing, with two views it cycles the views of that look only. Looks are free / all open in TEST. ?houselooks=off = feature hidden, every house is look 0 (saved looks are kept untouched). Night: no light points added (the snow house windows are painted lit). Debug: HOUSE.looks ---- */
(function(){'use strict';
const H=window.HOUSE,LK=window.__HOUSE_LOOKS;
const L=H&&(H.looks={on:false,ver:'houselooks-r172',err:null,stats:{changes:0,refused:0,picker:0}});
if(!H||!H.on||!H.build||!LK||!LK.on)return;
const B=H.build,IT=H.items,ID='smallCottage',d=IT[ID];
if(!d||!d.fkeys||!d.fac)return;
const ERR=(w,e)=>{L.err=w+': '+((e&&e.message)||e);try{console.error('[HOUSELOOKS]',w,e)}catch(_){}};
/* ---- tables: look/view <-> facing index ---- */
const TAB=[];/* {look,view,key,f,n(views in look)} */
try{for(const lk of LK.looks){const vs=Object.keys(lk.views);vs.forEach((v,i)=>{const w=lk.views[v],f=d.fkeys.indexOf(w.key);if(f<0)return;TAB[f]={look:lk,view:v,key:w.key,f,vi:i,nv:vs.length,w};const F=d.fac[f];if(F){F.doorPt=w.door;F.warpPt=w.warp||w.door;F.lookId=lk.id;F.view=v}})}d.looksOn=true;d.lookCount=LK.looks.length}catch(e){ERR('tables',e);return}
const byLook=id=>LK.looks.find(x=>x.id===id)||null;
const fIndex=(lk,view)=>{const w=lk&&lk.views&&(lk.views[view]||lk.views.front||lk.views[Object.keys(lk.views)[0]]);return w?d.fkeys.indexOf(w.key):-1};
const LOOK0F=fIndex(LK.looks[0],"front");L.look0F=LOOK0F;const info=f=>TAB[f|0]||TAB[LOOK0F]||null;
L.on=true;L.tab=TAB;L.info=info;L.fIndex=fIndex;
L.views=f=>{const t=info(f);return t?t.nv:1};
L.rotateSel=(sel,dir)=>{if(!sel)return;const t=info(sel.f);if(!t||t.nv<2)return;const idx=TAB.filter(x=>x&&x.look===t.look).sort((a,b)=>a.vi-b.vi);const i=idx.indexOf(TAB[t.f]);const n=idx.length;sel.f=idx[((i+(dir<0?-1:1))%n+n)%n].f};
const S0=()=>H.state();
L.savedF=()=>{try{const h=S0().hl;if(h){const f=fIndex(byLook(h.look),h.view);if(f>=0)return f}}catch(_){}return LOOK0F};
/* ---- save: stamp look/view on every house entry, remember the last look for store -> re-place ---- */
function stampAll(){const S=S0();if(!S||!Array.isArray(S.placed))return;for(const o of S.placed){if(!o||o.id!==ID)continue;const k=d.fkeys.indexOf(o.fk);if(k<0)continue;o.f=k;const t=TAB[k];if(t){o.look=t.look.id;o.view=t.view;S.hl={look:t.look.id,view:t.view}}}}
L.stamp=stampAll;
{const _s=H.save;H.save=function(){try{stampAll()}catch(e){ERR('stamp',e)}return _s.apply(this,arguments)}}
/* load / sanitize: look+view in the entry win; no look = look 0 (old saves); the fk fallback keeps a saved facing key */
function fixLooks(){try{const S=S0();if(!S||!Array.isArray(S.placed))return 0;let n=0;for(const o of S.placed){if(!o||o.id!==ID)continue;let f=-1;if(o.look){f=fIndex(byLook(o.look),o.view)}if(f<0&&o.fk&&d.fkeys.indexOf(o.fk)>=0)f=d.fkeys.indexOf(o.fk);if(f<0)f=LOOK0F;if(o.f!==f||o.fk!==d.fkeys[f]){o.f=f;o.fk=d.fkeys[f];n++}const t=info(f);if(t){o.look=t.look.id;o.view=t.view}}if(S.hl&&!byLook(S.hl.look)){delete S.hl;n++}return n}catch(e){ERR('fix',e);return 0}}
{const _z=H.sanitize;H.sanitize=function(){const r=_z.apply(this,arguments);fixLooks();return r}}
try{fixLooks()}catch(_){}
/* ---- change the outside look of the placed house ---- */
L.cottage=()=>S0().placed.find(o=>o&&o.id===ID)||null;
L.current=()=>{const o=L.cottage();const t=o&&info(o.f);return t?{look:t.look.id,view:t.view}:null};
function toastT(m,c){try{toast(m,c||'#ff8a8a')}catch(_){}}
L.apply=function(lookId,opt){try{opt=opt||{};const S=S0();const o=opt.entry||L.cottage();if(!o)return {ok:false,why:'ไม่มีบ้านบนลาน'};const lk=byLook(lookId);if(!lk)return {ok:false,why:'ไม่รู้จักแบบบ้านนี้'};const cur=info(o.f);const view=(cur&&cur.look===lk)?cur.view:'front';const f=fIndex(lk,view);if(f<0)return {ok:false,why:'ไม่มีมุมมองนี้'};
 if(cur&&cur.f===f)return {ok:true,same:true,f};
 /* same origin point (foot anchor); the new base polygon must fit there */
 const why=H.canPlaceAt(o.x,o.y,ID,o.uid,{f});
 if(why){L.stats.refused++;if(!opt.quiet)toastT('เปลี่ยนแบบบ้านไม่ได้ · ที่ตรงนี้ไม่พอสำหรับแบบนี้ ('+why+') · ยังเป็นแบบเดิม');return {ok:false,why,f}}
 o.f=f;o.fk=d.fkeys[f];stampAll();H.save();try{saveGame()}catch(_){}
 try{B.syncDec()}catch(_){}try{B.resolveHero()}catch(_){}
 if(B.sel&&B.sel.id===ID&&B.sel.uid===o.uid){B.sel.f=f;try{B.showAct()}catch(_){}}
 L.stats.changes++;if(!opt.quiet)toastT('เปลี่ยนเป็น “'+lk.name+'” แล้ว · ห้องข้างในเหมือนเดิม','#b8ffd0');return {ok:true,f}}catch(e){ERR('apply',e);return {ok:false,why:'ผิดพลาด'}}};
/* ---- picker (thumbnail + name per look) ---- */
const css=document.createElement('style');css.textContent='#hlPick{position:fixed;left:50%;top:72px;transform:translateX(-50%);z-index:40;display:none;min-width:260px;max-width:92vw;max-height:80vh;overflow:auto;padding:12px 14px 14px;border-radius:14px;background:rgba(18,14,10,.96);border:1px solid #ffd98a;color:#fff;font-size:13px;box-shadow:0 8px 40px rgba(0,0,0,.6)}#hlPick h3{margin:0 0 4px;font-size:15px;color:#ffe9b0}#hlPick .nt{color:#b9b09a;font-size:11px;margin-bottom:10px}#hlPick .lst{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}#hlPick .lk{width:132px;padding:8px;border-radius:10px;background:#241b12;border:2px solid #4a3a26;cursor:pointer;text-align:center}#hlPick .lk:hover{border-color:#ffd98a}#hlPick .lk.cur{border-color:#8dffb0;background:#1d2a1e}#hlPick .lk img{width:112px;height:112px;object-fit:contain;image-rendering:auto;display:block;margin:0 auto 4px}#hlPick .lk span{display:block}#hlPick .lk i{display:block;font-style:normal;font-size:10px;color:#8dffb0;min-height:12px}#hlPick .x{display:block;margin:10px auto 0;padding:6px 20px;border-radius:999px;border:1px solid #6a5a46;background:#2a2118;color:#fff;cursor:pointer}';document.head.appendChild(css);
const pk=document.createElement('div');pk.id='hlPick';document.body.appendChild(pk);
for(const ev of ['pointerdown','mousedown','touchstart','click'])pk.addEventListener(ev,e=>e.stopPropagation());
let pkUid=null;
function render(){const o=L.cottage(),cur=o&&info(o.f);let h='<h3>🏠 เปลี่ยนแบบบ้าน</h3><div class="nt">เปลี่ยนเฉพาะหน้าตาด้านนอก · บ้านหลังเดิม ห้องและของข้างในเหมือนเดิม · ตำแหน่งเดิม</div><div class="lst">';for(const lk of LK.looks){const v0=lk.views.front||lk.views[Object.keys(lk.views)[0]];const c=cur&&cur.look===lk;h+='<div class="lk'+(c?' cur':'')+'" data-l="'+lk.id+'"><img alt="" src="'+v0.png+'"><span>'+lk.name+'</span><i>'+(c?'ใช้อยู่':'')+'</i></div>'}h+='</div><button class="x" data-x="1">ปิด</button>';pk.innerHTML=h}
pk.addEventListener('click',e=>{const t=e.target.closest('[data-l],[data-x]');if(!t)return;if(t.dataset.x){L.closePicker();return}const r=L.apply(t.dataset.l,{});if(r&&r.ok){L.closePicker()}else render()});
L.openPicker=function(sel){try{const o=L.cottage();if(!o||!B.on)return false;pkUid=o.uid;render();pk.style.display='block';L.stats.picker++;return true}catch(e){ERR('picker',e);return false}};
L.closePicker=function(){pk.style.display='none';pkUid=null};
L.pickerOpen=()=>pk.style.display==='block';
{const kh=e=>{if(e.key==='Escape'&&L.pickerOpen()){L.closePicker();e.stopImmediatePropagation();e.preventDefault();return true}return false};if(window.__EK)window.__EK.unshift?window.__EK.unshift(kh):window.__EK.push(kh)}
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{if(pk.style.display==='block'&&(!B.on||!L.cottage()||G.zone!==H.ZID))L.closePicker()}catch(_){}return r}}
})();

