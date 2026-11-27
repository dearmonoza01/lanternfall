
/* ---- p298 r2 (r2 = + element staff levels, coordinator/balance 06:33, table balance/skill_unlock_r1/STAFF_LEVELS_compiled_20261024.md): skill upgrade system + skill rows by player level (DeaRz 24 Oct 05:53 "เอาระบบอัฟเกรดสกิลเข้าไปหน่อย",
   05:54 "แถวแรกของสกิลเริ่มเวล1 ... เวล10 เปิดแถว 2 เวล 15 เปิดแถว 3 เวล 20 เปิดแถว4 เวล 25 เปิดแถว5", 05:54 "ใช้แบบนี้กับทุกอาวุธ").
   Rules (balance default, balance/skill_unlock_r1/NOTE_20261024_skill_rows_by_level.md):
   - Skill rows 1..5 open at PLAYER level 1 / 10 / 15 / 20 / 25 for every weapon (was weapon mastery 10/20/30/40/50).
   - When a row opens its skills start at Lv1 for free.
   - 2 skill points per player level from Lv2 (player Lv L = 2·(L−1) points), one pool per weapon (sword, bow).
   - 1 point = +1 skill level, up to Lv5 (Lv6–10 need skill books, which do not exist yet).
   - Points can be reset for free (gives every point back).
   - Old saves get all the points of their current level at once.
   - Numbers per level = approved SKILL_LEVELS_v1 (sword + bow, through the r57 SKLV table).
   - Element staff (r2): same rules, own pool; Lv1–5 numbers from the compiled staff table (Lv4 = the old in-game value, passives Lv3).
     Blizzard / Ball Lightning / Earth Spikes read their own approved level rows through SKLV.lv.ice / .chain / .spikes.
   - Holy staff (K / G test skills on the staff): rows gate only, no level-up yet (no holy skill window).
   Saved in the player save as P.skLv = {sword:{key:bonus}, bow:{key:bonus}}. The r57 TEST −/+ buttons only show with ?sktest=1.
   Debug: window.__SKUP. ---- */
(function(){'use strict';
const SU=window.__SKUP={ver:'p298-r3',err:null,log:[]};
try{
const SL=window.SKLV,T=(typeof SKLV_TABLE!=='undefined')?SKLV_TABLE:null;
const BOW=['pierce','rain','leap','fan','lantern','focus','wind','poison','weak','stance','steady','swift','hawk','double','finish'];
const MAXP=5,PER=2,TEST=/sktest=1/.test(location.search);
const UNL=()=>(window.__WSK&&__WSK.cfg&&__WSK.cfg.unlock)||[1,10,15,20,25];
const key=wk=>wk&&wk.startsWith('bsk_')?wk.slice(4):wk;
const PR_ON=false;   /* v3a: holy-staff priest upgrade line (priestup r1-r3) is not part of this merge */const HKS=k=>PR_ON&&!!(k&&/^stf_h_(jl|lant|seal|ring|sr|heal|bless|ward|mana|halo|faith|mercy|reflect|undying|guard)$/.test(k));const SCYK=k=>(k==='scy_nh'||k==='scy_dm'||/^scy_(soulreap|storm|flying|bloodlust|reaper|scream|bloodpact|soularmor|harvest|pain|moonedge|spirit|wontdie)$/.test(k))&&!/[?&]scythe=off\b/.test(location.search);const lineOf=k=>SCYK(k)?'scythe':BOW.includes(k)?'bow':(HKS(k)?'holy':(k&&k.startsWith('stf_')?'staff':(k&&k.startsWith('dg_')?'dagger':'sword')));
/* element staff Lv1..5 (index 0 = Lv1); Lv4 = the old in-game value, passives Lv3 */
const A5=(a,b,c,d,e)=>[a,b,c,d,e];
const STL={
 stf_fireball:{mul:A5(2.24,2.56,2.88,3.2,3.68),r:A5(90,90,90,90,108),burn:A5(.08,.09,.10,.11,.13),mp:A5(19,20,21,22,23)},
 stf_ice:{sk:'ice',mp:A5(20,22,23,24,25)},
 stf_chain:{sk:'chain',mp:A5(20,20,20,20,20)},
 stf_spikes:{sk:'spikes',mp:A5(22,23,25,26,27)},
 stf_ult:{storm:A5(1.05,1.2,1.35,1.5,1.72),beam:A5(4.2,4.8,5.4,6,6.9),burst:A5(2.1,2.4,2.7,3,3.45),r:A5(200,200,200,200,240),pull:A5(160,160,160,160,200),mp:A5(38,40,43,45,47)},
 stf_focus:{dmg:A5(.08,.10,.11,.12,.13),cs:A5(.14,.16,.18,.20,.22),dur:A5(12,13.1,14,15,16.5),mp:A5(15,16,17,18,19)},
 stf_shield:{hp:A5(.10,.12,.14,.15,.22),dur:A5(8,8.7,9.3,10,11),mp:A5(17,18,19,20,21)},
 stf_curse:{dmg:A5(.10,.12,.14,.15,.16),dur:A5(9.6,10.4,11.2,12,13.2),mp:A5(10,11,11,12,13)},
 stf_mana:{regen:A5(.05,.20,.35,.50,.65),dur:A5(8,8,8,8,10)},
 stf_avatar:{dmg:A5(.14,.16,.18,.20,.22),dur:A5(9.6,10.4,11.2,12,15.8),mp:A5(17,18,19,20,21)},
 stf_knowledge:{dmg:A5(.04,.05,.06,.07,.08)},
 stf_alchemist:{react:A5(.15,.20,.25,.30,.35)},
 stf_echo:{chance:A5(.06,.08,.10,.12,.14),mul:A5(.6,.6,.6,.6,1)},
 stf_linger:{dur:A5(.18,.24,.30,.36,.42)},
 stf_proof:{red:A5(.06,.08,.10,.12,.14)}};
const DGT=()=>(window.DGR&&DGR.lvTab)||{};const has=k=>!!((T&&T[k])||STL[k]||DGT()[k]||HKS(k)||SCYK(k));
function applyStaff(){const C=window.STF&&STF.cfg;if(!C)return;
  for(const k in STL){const c=C[k.slice(4)],t=STL[k],i=lvOf(k)-1;if(!c||i<0)continue;
    for(const f in t){if(f==='sk'){if(SL&&SL.lv)SL.lv[t.sk]=i+1;continue;}c[f]=t[f][i];}}}
const pl=()=>((typeof P!=='undefined'&&P&&P.lvl)|0);
function st(){if(!P.skLv||typeof P.skLv!=='object')P.skLv={};for(const l of (PR_ON?['sword','bow','staff','dagger','holy','scythe']:['sword','bow','staff','dagger','scythe']))if(!P.skLv[l]||typeof P.skLv[l]!=='object')P.skLv[l]={};return P.skLv;}
const bonus=k=>{const v=st()[lineOf(k)][k]|0;return Math.max(0,Math.min(MAXP-1,v));};
const lvOf=k=>has(k)?1+bonus(k):0;
const total=()=>Math.max(0,PER*(pl()-1));
function spent(line){const o=st()[line];let n=0;for(const k in o)if(has(k))n+=Math.max(0,Math.min(MAXP-1,o[k]|0));return n;}
const free=line=>Math.max(0,total()-spent(line));
/* row of a skill (0-based) from the skill window line */
function rowOf(k){try{const W=window.__WSK,L=W&&W.lines&&W.lines[lineOf(k)==='holy'?'staff':lineOf(k)];if(!L)return 0;const wk=lineOf(k)==='bow'?'bsk_'+k:k;   // staff keys are already the window keys (stf_*)
  for(const c of L.cols)for(const s of c.skills)if(s.k===wk)return s.row|0;}catch(_){}return 0;}
const needOf=k=>{const u=UNL();return u[Math.min(rowOf(k),u.length-1)];};
const open=k=>pl()>=needOf(k);
/* push the levels into the r57 table the skill code reads */
let sig='';
function sync(force){if(!SL||!T||!SL.on||typeof P==='undefined'||!P)return;const s=JSON.stringify(st())+'|'+pl();if(!force&&s===sig)return;sig=s;
  for(const k in T)SL.lv[k]=lvOf(k);try{SL.apply();}catch(e){SU.err='apply '+e.message;}try{applyStaff();}catch(e){SU.err='staff '+e.message;}try{if(window.DGR&&DGR.applyLv)DGR.applyLv(lvOf);}catch(e){SU.err='dagger '+e.message;}}
function up(k){if(!has(k))return 'ไม่มีเลเวล';const line=lineOf(k);if(!open(k))return 'ยังไม่ปลดล็อก';if(lvOf(k)>=MAXP)return 'เต็มแล้ว';if(free(line)<1)return 'แต้มไม่พอ';
  st()[line][k]=bonus(k)+1;sync(true);SU.log.push({k,lv:lvOf(k),t:Date.now()});try{saveGame();}catch(_){}return '';}
function reset(line){st()[line]={};sync(true);try{saveGame();}catch(_){}}
SU.lv=lvOf;SU.total=total;SU.free=free;SU.up=up;SU.reset=reset;SU.sync=sync;SU.need=needOf;
SU.lvLine=k=>{const v=lvOf(k),t=T&&T[k];return 'เลเวล '+v+' / '+MAXP+((t&&t.max>MAXP)||HKS(k)||SCYK(k)?' · เลเวล 6–10 ใช้หนังสือสกิล (ยังไม่มีในเกม)':'');};
SU.badge=k=>'Lv'+lvOf(k);
const wt=()=>(P&&P.weapon&&(PR_ON&&P.weapon.t==='staff'&&P.weapon.hs?'holy':P.weapon.t))||'fist';
SU.ptsTxt=()=>{const w=wt();return (w==='sword'||w==='bow'||w==='dagger'||(w==='staff'&&!(P.weapon&&P.weapon.hs))||(PR_ON&&w==='holy')||w==='scythe')?' · แต้ม '+free(w):'';};
/* ---------- skill window: points + "+1 level" / reset buttons in the detail panel ---------- */
const css=document.createElement('style');css.textContent=(TEST?'':'#wWpnSk .slvP,#wWpnSk .tst{display:none!important}')+`
#wWpnSk .row.lock .slvB{display:none}
#wWpnSk .supP{left:43.5%;top:78.3%;width:22.6%;height:4.6%;display:flex;align-items:center;justify-content:flex-end;gap:.5cqw;z-index:4}
#wWpnSk .supP button{height:100%;min-height:24px;padding:0 .9cqw;border-radius:.7cqw;border:1px solid #ffd98a;background:rgba(96,66,16,.92);color:#ffe9b0;font-family:inherit;font-weight:800;font-size:max(11px,1.4cqw);cursor:pointer;touch-action:manipulation;white-space:nowrap}
#wWpnSk .supP button.rs{border-color:#8aa0c8;background:rgba(30,40,70,.9);color:#cfe0ff}
#wWpnSk .supP button:disabled{opacity:.35;cursor:default}
#wWpnSk .supP .supN{font-size:max(10px,1.3cqw);color:#ffe9b0;font-weight:700;white-space:nowrap}
#wWpnSk .supP[hidden]{display:none}`;
document.head.appendChild(css);
let win=null;
function selK(){const r=win&&win.querySelector('.row.sel');return r?key(r.dataset.k):null;}
function rerender(){const r=win&&win.querySelector('.row.sel');if(r)r.dispatchEvent(new MouseEvent('click',{bubbles:true}));}
function decorate(){if(!win||win.hidden)return;const box=win.querySelector('.box');if(!box)return;let pn=box.querySelector('.supP');
  if(!pn){box.insertAdjacentHTML('beforeend','<div class="abs supP"><span class="supN"></span><button type="button" class="sup" aria-label="เพิ่มเลเวลสกิล 1 แต้ม">+1 เลเวล</button><button type="button" class="rs" aria-label="คืนแต้มสกิลทั้งหมด">รีเซ็ตแต้ม</button></div>');pn=box.querySelector('.supP');}
  const k=selK(),ok=!!(k&&has(k)&&(wt()===lineOf(k)));if(pn.hidden!==!ok)pn.hidden=!ok;if(!ok)return;
  const line=lineOf(k),f=free(line),txt=open(k)?'Lv '+lvOf(k)+'/'+MAXP+' · แต้มเหลือ '+f:'🔒 Lv.'+needOf(k);
  const n=pn.querySelector('.supN');if(n.textContent!==txt)n.textContent=txt;
  const b=pn.querySelector('.sup'),dis=!open(k)||lvOf(k)>=MAXP||f<1;if(b.disabled!==dis)b.disabled=dis;
  const lb=lvOf(k)>=MAXP?'เต็ม':'+1 เลเวล';if(b.textContent!==lb)b.textContent=lb;
  const r=pn.querySelector('.rs'),rd=spent(line)<1;if(r.disabled!==rd)r.disabled=rd;}
function hook(){win=document.getElementById('wWpnSk');if(!win||win._sup)return !!win;win._sup=1;
  new MutationObserver(()=>{try{decorate();}catch(e){SU.err='ui '+e.message;}}).observe(win,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class']});
  win.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('.supP button');if(!t)return;e.stopPropagation();e.preventDefault();
    try{const k=selK();if(!k||!has(k))return;if(t.classList.contains('rs')){const now=Date.now();if(t._arm&&now-t._arm<3000){t._arm=0;t.textContent='รีเซ็ตแต้ม';reset(lineOf(k));}else{t._arm=now;t.textContent='แตะอีกครั้ง';setTimeout(()=>{if(t._arm&&Date.now()-t._arm>=2900){t._arm=0;t.textContent='รีเซ็ตแต้ม';}},3000);return;}}
      else{const why=up(k);if(why)try{textAt(P.x,P.y-62,why,'#ffd98a',13);}catch(_){}}}catch(er){SU.err='btn '+er.message;}rerender();decorate();},true);
  return true;}
/* staff rows: Lv badge (sword/bow badges come from r57) + level line at the top of the description */
function staffDecor(){if(!win||win.hidden)return;for(const r of win.querySelectorAll('.row[data-k^="stf_"],.row[data-k^="dg_"],.row[data-k^="scy_"]')){const k=r.dataset.k;if(!STL[k]&&!DGT()[k]&&!HKS(k)&&!SCYK(k))continue;
    let b=r.querySelector('.slvB');const txt='Lv'+lvOf(k);
    if(!b){const mid=r.querySelector('.mid'),ch=mid&&mid.querySelector('.chip');if(!mid||!ch)continue;let w=mid.querySelector('.slvW');if(!w){w=document.createElement('div');w.className='slvW';ch.replaceWith(w);w.appendChild(ch);}
      b=document.createElement('span');b.className='slvB';w.appendChild(b);}
    if(b.textContent!==txt)b.textContent=txt;}}
function wrapStaff(){for(const ln of ['staff','dagger','scythe']){const L=window.__WSK&&__WSK.lines&&__WSK.lines[ln];if(!L)continue;for(const c of L.cols)for(const s of c.skills){if(s._sup||!(STL[s.k]||DGT()[s.k]||HKS(s.k)||SCYK(s.k)))continue;const d=s.desc,k=s.k;
    s.desc=function(){let r='';try{r=d.apply(this,arguments);}catch(e){r='';}return SU.lvLine(k)+'\n\n'+r;};s._sup=1;}}}
/* ---------- level-up notice: new row / points ---------- */
let lastLv=null,lastP=null;
function watch(){if(typeof P==='undefined'||!P)return;const L=pl();if(P!==lastP){lastP=P;lastLv=L;return;}if(lastLv!=null&&L>lastLv&&G&&G.state==='play'){const u=UNL(),r=u.indexOf(L);
    const msg=(r>0?'ปลดล็อกสกิลแถว '+(r+1)+' · ':'')+'ได้แต้มสกิล +'+PER*(L-lastLv)+' (เปิดหน้าต่างสกิลเพื่ออัปเลเวล)';
    try{log(msg,'g');}catch(_){}try{textAt(P.x,P.y-110,r>0?'สกิลแถว '+(r+1)+' ปลดล็อก!':'แต้มสกิล +'+PER*(L-lastLv),'#ffe08a',16,{life:1.8});}catch(_){}}
  lastLv=L;}
setInterval(()=>{try{sync(false);watch();if(!win||!win._sup)hook();wrapStaff();staffDecor();}catch(e){SU.err='tick '+e.message;}},300);
hook();sync(true);
}catch(e){SU.err='init '+e.message;}
})();

