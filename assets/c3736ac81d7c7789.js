
/* ---- mastgate-r1 (TEST allin_r78, 14 Nov 2026): DeaRz "อาวุธทุกอาวุธทำให้เหมือนกันทั้งหมด ปลดล็อคสกิลตามค่าความชำนาญของแต่ละอาวุธ" ----
   * every weapon line of the skill window (sword, dagger, bow, staff, holy staff, scythe, knuckle, hammer ...) unlocks its rows by THAT weapon's own mastery Lv (P.jobLv = the held weapon's mastery, glue_mastery swaps it per line), not the character level:
     row 1 = mastery Lv1, row 2 = Lv10, row 3 = Lv15, row 4 = Lv20, row 5 = Lv25 (same thresholds as before, mastery max 50). Done by turning __WSK.cfg.unlock into live getters (every module compares the character level with these numbers: 0 = open, 1000000 + N = locked), so the window, the skill points module and the slot modules follow with no change.
   * lock text: detail panel "🔒 ต้องการค่าความชำนาญ<อาวุธ> Lv.N (ตอนนี้ JobLv. m)", row chip "🔒 ชำนาญ Lv.N".
   * existing saves: a skill that already has points or is already installed in a slot stays usable (SU.need returns 0 for it); only learning NEW points and installing respect the gate. Special skills (★ page) are not weapon rows and are not touched. ?robot=give keeps the robot row open on the hammer.
   * HUD: "JobLv. N" next to the character level (N = mastery Lv of the HELD weapon, live on weapon swap / level-up); the small "ชำนาญ" EXP bar row and the "ชำนาญ Lv" chip of the portrait are removed (too small to read).
   ?mastunlock=off = character-level unlock as before (HUD JobLv. stays). Debug: window.__MASTGATE ---- */
(function(){const Q=String(location.search),OFF=/[?&]mastunlock=off\b/.test(Q),RBGIVE=/[?&]robot=give\b/.test(Q);
const MG=window.__MASTGATE={ver:'mastgate-r1',on:!OFF,err:null,TH:[1,10,15,20,25],installed:false};
const ERR=e=>{MG.err=(e&&e.message)||String(e);try{console.error('[MASTGATE]',e)}catch(_){}};
const mast=()=>{try{return Math.max(1,P.jobLv|0)}catch(_){return 1}};
const wname=()=>{try{const t=P.weapon.t;return (WEAPONS[t]&&WEAPONS[t].th)||t}catch(_){return 'อาวุธ'}};
MG.mast=mast;
/* ---- 1) live unlock numbers ---- */
function install(){try{const W=window.__WSK;if(!W||!W.cfg||MG.installed)return;const arr=[0,0,0,0,0];
  MG.TH.forEach((t,i)=>Object.defineProperty(arr,i,{enumerable:true,configurable:true,get(){try{if(RBGIVE&&i===4&&P.weapon&&P.weapon.t==='hammer')return 0;return mast()>=t?0:1000000+t}catch(_){return 0}}}));
  W.cfg.unlock=arr;MG.installed=true;
  /* learned / installed skills stay usable */
  const SU=window.__SKUP;if(SU&&SU.need&&!SU._mg){const o=SU.need;SU.need=function(k){const r=o.apply(this,arguments);if(r>=1000000){try{const ln=['sword','bow','staff','dagger','holy','scythe'];let b=0;for(const l of ln){const v=P.skLv&&P.skLv[l]&&P.skLv[l][k];if(v>0)b=v}if(b>0||(window.SLOTUI&&SLOTUI.slotOf&&SLOTUI.slotOf(k)))return 0}catch(_){}}return r};SU._mg=1}}catch(e){ERR(e)}}
if(!OFF)setInterval(install,400);
/* ---- 2) lock texts in the skill window ---- */
let busy=false;
function fixTexts(){if(busy||OFF)return;busy=true;try{const win=document.getElementById('wWpnSk');if(!win||win.hidden)return;
  const re=/(1000\d{3})/;for(const el of win.querySelectorAll('.chip,.supN,.knN,.hmN,#wskDm,.dm')){const t=el.textContent;if(!re.test(t))continue;const n=+re.exec(t)[1]-1000000;
    let nt;if(el.id==='wskDm'||el.classList.contains('dm')){nt='🔒 ต้องการค่าความชำนาญ'+wname()+' Lv.'+n+' (ตอนนี้ JobLv. '+mast()+')'}else nt=t.replace(/Lv\.\s*1000\d{3}/,'ชำนาญ Lv.'+n).replace(/1000\d{3}/,String(n));
    if(el.textContent!==nt)el.textContent=nt}}catch(e){ERR(e)}finally{busy=false}}
setInterval(()=>{try{const win=document.getElementById('wWpnSk');if(win&&!win._mg){win._mg=1;new MutationObserver(fixTexts).observe(win,{childList:true,subtree:true,characterData:true})}fixTexts()}catch(e){ERR(e)}},300);
/* ---- 3) HUD: JobLv. next to the level; remove the tiny mastery bar row + chip ---- */
try{const st=document.createElement('style');st.textContent='.xpr.j,#cJob{display:none!important}body.mobile #hud .hplate>#hJob{display:flex!important;font-size:11px;align-items:baseline;gap:2px;white-space:nowrap;color:#c9a24e;margin-left:4px;height:14px;line-height:14px}body.mobile #hud .hplate>#hJob b{font-size:12px}';document.head.appendChild(st)}catch(e){ERR(e)}
function hud(){try{const pl=document.querySelector('.hplate');if(!pl)return;let b=document.getElementById('hJobLv');
  if(!b){const sep=document.createElement('div');sep.className='hsep';sep.id='hJobSep';const w=document.createElement('div');w.className='hlv';w.id='hJob';w.innerHTML='JobLv.<b id="hJobLv">1</b>';pl.appendChild(sep);pl.appendChild(w);b=document.getElementById('hJobLv')}
  const v=String(P&&P.jobLv!=null?P.jobLv|0:1);if(b.textContent!==v)b.textContent=v}catch(e){}}
setInterval(hud,250);
console.info('[MASTGATE] ready');
})();
