
/* ---- knuckleline-r1 (TEST allin_r66, 13 Nov 2026): the KNUCKLE skill line in the weapon skill window (coordinator order after DeaRz rule 10 Nov 12:05: special weapons behave exactly like normal weapons) ----
   * Storm Fists (หมัดพายุ) is NOT on the special page any more: it is row 1 (first row) of the knuckle line in the weapon skill window (__WSK.lines.knuckle), like the scythe skills.
   * skill points: its OWN pool for the knuckle line = the game's skill points (2 per character level, like every other line) minus the points spent on the knuckle line; Lv1 is free, +1 level per point up to Lv10
     (the sword / bow lines stop at Lv5 and use books for 6-10; the knuckle line takes Lv1-10 by points, order). Saved in P.skLv.knuckle = {kn_storm: bonus}. Row unlock = the game's unlock levels (row 1 = Lv1).
   * the other knuckle skills of the art set (Ground Pound, Piercing Fist, Counter Punch, 64 Fists, Charge, Iron Body, Awaken Power, War God, Recover Breath, Tough Skin, Relentless, Iron Fist, Stun) are shown LOCKED / coming soon with their icons (names are placeholders from the icon files).
   * install to a slot: same hotbar as the scythe (own map per weapon, painted onto #bar .slot / #tSkills .tsk while the knuckle is held, keys 1-6 Q E R F, cooldown + MP shading on the slot, right-click clears, "ติดตั้ง" button in the window); map in localStorage 'lanternfall_knuckleSlots_v1'.
   * save migration: a Storm Fists that was installed by the old special page (P.slots has 'spStorm') is moved to the same slot index of the knuckle map and the old slot is cleared.
   * ?stormlv=N stays as the GM override (level N, no points needed). ?knucklelv=off removes this module (Storm Fists then has no UI). Debug: window.KNLINE ---- */
(function(){'use strict';
const Q=String(location.search),KL=window.KNLINE={ver:'knuckleline-r1',on:!/[?&]knucklelv=off\b/.test(Q),err:null,registered:false,uses:0,migrated:0,placed:0};
if(!KL.on)return;
const ERR=(w,e)=>{KL.err=w+': '+((e&&e.message)||e);try{console.error('[KNLINE]',w,e)}catch(_){}};
const clampN=(v,a,b)=>Math.max(a,Math.min(b,v));
const IC=window.__KN_ICONS||{};
const held=()=>{try{return !!(P&&P.weapon&&P.weapon.t==='knuckle')}catch(_){return false}};
const playing=()=>{try{return G.state==='play'&&!P.dead&&!G.win&&!G.edit}catch(_){return false}};
const toast=(m,c)=>{try{textAt(P.x,P.y-62,m,c||'#ffd98a',13)}catch(_){}};
const SU=()=>window.__SKUP;
const ST=()=>window.STORM;
const MAXLV=10;
/* ---------------------------------------------------------------- points / levels */
const KEYS={kn_storm:{row:0}};
const UNL=()=>(window.__WSK&&__WSK.cfg&&__WSK.cfg.unlock)||[1,10,15,20,25];
const plv=()=>{try{return P.lvl|0}catch(_){return 1}};
function sk(){try{if(!P.skLv||typeof P.skLv!=='object')P.skLv={};if(!P.skLv.knuckle||typeof P.skLv.knuckle!=='object')P.skLv.knuckle={};return P.skLv.knuckle}catch(_){return {}}}
const needOf=k=>{const u=UNL();return u[Math.min((KEYS[k]&&KEYS[k].row)|0,u.length-1)]};
const needLv=k=>{try{const r=entOf(k);return UNL()[Math.min((r&&r.row)|0,UNL().length-1)]}catch(_){return 1}};
const open=k=>plv()>=needOf(k)||bonus(k)>0||!!(window.SLOTUI&&SLOTUI.slotOf&&SLOTUI.slotOf(k));
const bonus=k=>clampN(sk()[k]|0,0,MAXLV-1);
function lvOf(k){if(!KEYS[k])return 0;const s=ST();if(s&&s.force)return s.lv;return 1+bonus(k)}
const total=()=>{try{const t=SU()&&SU().total?SU().total():null;return t!=null?t:Math.max(0,2*(plv()-1))}catch(_){return Math.max(0,2*(plv()-1))}};
function spent(){const o=sk();let n=0;for(const k in KEYS)n+=bonus(k);return n}
const free=()=>Math.max(0,total()-spent());
function up(k){if(!KEYS[k])return 'ไม่มีเลเวล';const s=ST();if(s&&s.force)return 'ล็อกเลเวลด้วย ?stormlv';if(!open(k))return 'ยังไม่ปลดล็อก';if(lvOf(k)>=MAXLV)return 'เต็มแล้ว';if(free()<1)return 'แต้มไม่พอ';
  sk()[k]=bonus(k)+1;syncLv();try{saveGame()}catch(_){}return ''}
function reset(){const o=sk();for(const k in KEYS)o[k]=0;syncLv();try{saveGame()}catch(_){}}
KL.lv=lvOf;KL.free=free;KL.total=total;KL.up=up;KL.reset=reset;KL.spent=spent;
/* Storm Fists reads its own level from STORM.lv: keep it in step with the line (unless ?stormlv forces it) */
function syncLv(){try{const s=ST();if(s&&!s.force&&P&&P.skLv)s.lv=clampN(lvOf('kn_storm'),1,MAXLV)}catch(e){ERR('sync',e)}}
setInterval(syncLv,250);
/* points text in the window header for the knuckle line */
function wrapPts(){try{const u=SU();if(!u||u._knPts)return;const o=u.ptsTxt;u.ptsTxt=function(){try{if(held())return ' · แต้ม '+free()}catch(_){}return o.apply(this,arguments)};u._knPts=1}catch(e){ERR('pts',e)}}
setInterval(wrapPts,500);
/* ---------------------------------------------------------------- the line: Storm Fists + locked / coming-soon rows */
const PH=[ /* [key,name,type,col,row,icon] - locked rows, names from Balance KNUCKLE_numbers_r1, no numbers wired yet */
 ['knx_pierce','Piercing Fist','active',0,1,'pierce'],['knx_charge','Charge Fist','active',0,2,'charge'],['knx_ground','Ground Pound','active',0,3,'ground'],['knx_ult64','64 Fists Yin-Yang (ult)','active',0,4,'ult64'],
 ['knx_awaken','ปลุกพลังหมัด (Awaken Fist)','active',1,0,'awaken'],['knx_ironbody','Iron Body','active',1,1,'ironbody'],['knx_relent','หมัดไม่หยุด (Relentless Fist)','active',1,2,'relentless'],['knx_recover','Recover Breath','active',1,3,'recover'],['knx_wargod','War God Form','active',1,4,'wargod'],
 ['knx_ironfist','กำปั้นเหล็ก (Iron Fist) ATK +8%','passive',2,0,'ironfist'],['knx_relstack','Relentless Stacks','passive',2,1,'relstack'],['knx_stun','Stun Knuckle','passive',2,2,'stun'],['knx_tough','Tough Skin','passive',2,3,'tough'],['knx_counter','Counter Punch','passive',2,4,'counter']];
function stormDesc(){const s=ST(),L=lvOf('kn_storm'),c=s.cfg,N=L>=10?12:L>=5?10:8,pct=c.PCT[L-1];let base=3.23,sec=0;try{const k=window.KNUCKLE.cfg;base=s.base();sec=pct/100*base/(k.MULT_LUNGE/k.CYCLE_LUNGE)}catch(_){}
  return 'ชาร์จชี่ พุ่งเข้าหาเป้า รัวหมัดสลับซ้ายขวา '+N+' ครั้ง ปิดด้วยหมัดแรง'+(L>=10?' + คลื่นเสี้ยวพระจันทร์ '+c.SHOCK+' px':'')+'\nดาเมจรวม '+pct+'% ของหมัดมาตรฐาน (ราว '+sec.toFixed(2)+' วิของดาเมจตีสนับมือปกติ) แบ่งเท่ากันทุกหมัด · Lv5 = 10 หมัด · Lv10 = 12 หมัด'+(s.force?' · ล็อกเลเวลด้วย ?stormlv':'')}
function register(){const W=window.__WSK;if(!(W&&W.lines&&W.lines.knuckle&&window.STORM&&window.STORM.start))return false;if(KL.registered)return true;const L=W.lines.knuckle,cols=L.cols;
  const storm={k:'kn_storm',name:'หมัดพายุ',type:'active',row:0,ok:()=>!!(ST()&&ST().on&&ST().start),icon:()=>IC.storm||null,desc:stormDesc,key:'',cdId:'spStorm',cost:()=>({mp:ST().cfg.MP[lvOf('kn_storm')-1],cd:ST().cfg.CD}),start:()=>ST().start()};
  cols[0].skills.push(storm);
  for(const [k,name,type,col,row,ic] of PH){cols[col].skills.push({k,name,type,row,ok:()=>true,icon:()=>IC[ic]||null,desc:()=>'กำลังพัฒนา — ท่าและตัวเลขยังไม่เสร็จ ใช้งานไม่ได้',cost:()=>{throw new Error('in development')},key:'',cdId:k,start:()=>{toast('กำลังพัฒนา');return false}})}
  for(const c of cols)c.skills.sort((a,b)=>(a.row|0)-(b.row|0));
  try{L.empty=false}catch(_){}
  KL.registered=true;return true}
const iv=setInterval(()=>{try{if(register())clearInterval(iv)}catch(e){ERR('register',e)}},500);
try{const st=document.createElement('style');st.textContent='#wWpnSk .row[data-k^="knx_"] .spBox{display:none!important}'+`
#wWpnSk .knP{left:43.5%;top:78.3%;width:22.6%;height:4.6%;display:flex;align-items:center;justify-content:flex-end;gap:.5cqw;z-index:4}
#wWpnSk .knP button{height:100%;min-height:24px;padding:0 .9cqw;border-radius:.7cqw;border:1px solid #ffd98a;background:rgba(96,66,16,.92);color:#ffe9b0;font-family:inherit;font-weight:800;font-size:max(11px,1.4cqw);cursor:pointer;touch-action:manipulation;white-space:nowrap}
#wWpnSk .knP button.rs{border-color:#8aa0c8;background:rgba(30,40,70,.9);color:#cfe0ff}
#wWpnSk .knP button:disabled{opacity:.35;cursor:default}
#wWpnSk .knP .knN{font-size:max(10px,1.3cqw);color:#ffe9b0;font-weight:700;white-space:nowrap}
#wWpnSk .knP[hidden]{display:none}`;document.head.appendChild(st)}catch(e){ERR('css',e)}
/* ---------------------------------------------------------------- "+1 level" panel in the window (own panel; the game's skill-point panel only knows its own lines) */
const selK=()=>{const r=document.querySelector('#wWpnSk .row.sel');return r?r.dataset.k:null};
function decorate(){const win=document.getElementById('wWpnSk');if(!win||win.hidden)return;const box=win.querySelector('.box');if(!box)return;let pn=box.querySelector('.knP');
  if(!pn){box.insertAdjacentHTML('beforeend','<div class="abs knP" hidden><span class="knN"></span><button type="button" class="kup" aria-label="เพิ่มเลเวลสกิล 1 แต้ม">+1 เลเวล</button><button type="button" class="rs" aria-label="คืนแต้มสกิลสายสนับมือทั้งหมด">รีเซ็ตแต้ม</button></div>');pn=box.querySelector('.knP')}
  const k=selK(),ok=!!(k&&KEYS[k]&&held());if(pn.hidden!==!ok)pn.hidden=!ok;if(!ok)return;
  const f=free(),L=lvOf(k),s=ST(),txt=s&&s.force?'Lv '+L+' (?stormlv)':open(k)?'Lv '+L+'/'+MAXLV+' · แต้มเหลือ '+f:'🔒 Lv.'+needOf(k);
  const n=pn.querySelector('.knN');if(n.textContent!==txt)n.textContent=txt;
  const b=pn.querySelector('.kup'),dis=!open(k)||L>=MAXLV||f<1||!!(s&&s.force);if(b.disabled!==dis)b.disabled=dis;const lb=L>=MAXLV?'เต็ม':'+1 เลเวล';if(b.textContent!==lb)b.textContent=lb;
  const r=pn.querySelector('.rs'),rd=spent()<1;if(r.disabled!==rd)r.disabled=rd}
function hookWin(){const win=document.getElementById('wWpnSk');if(!win||win._kn)return !!win;win._kn=1;
  new MutationObserver(()=>{try{decorate()}catch(e){ERR('ui',e)}}).observe(win,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class']});
  win.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('.knP button');if(!t)return;e.stopPropagation();e.stopImmediatePropagation();e.preventDefault();
    try{const k=selK();if(!k||!KEYS[k])return;if(t.classList.contains('rs')){const now=Date.now();if(t._arm&&now-t._arm<3000){t._arm=0;t.textContent='รีเซ็ตแต้ม';reset()}else{t._arm=now;t.textContent='แตะอีกครั้ง';setTimeout(()=>{if(t._arm&&Date.now()-t._arm>=2900){t._arm=0;t.textContent='รีเซ็ตแต้ม'}},3000);return}}
      else{const why=up(k);if(why)toast(why)}
      const r=win.querySelector('.row.sel');if(r)r.dispatchEvent(new MouseEvent('click',{bubbles:true}));decorate()}catch(er){ERR('btn',er)}},true);
  return true}
setInterval(()=>{try{hookWin();decorate()}catch(e){ERR('tick ui',e)}},300);
/* rows still in development (no motion / numbers yet): unlocked by character level like every other line. The normal panel renderer draws them (cost() throws on purpose, so the renderer leaves the MP / cooldown line empty and its own install button / ใช้สกิล button stay as they are);
   one idempotent MutationObserver pass then (a) turns the empty footer line into a small status chip "กำลังพัฒนา", (b) greys the normal ใช้สกิล button, (c) hides the install button. It runs in the same task as the renderer's change (before paint), so the panel never flickers. No extra button. */
const DEVCSS=document.createElement('style');DEVCSS.textContent='#wWpnSk #wskDm.knDev{display:inline-block;margin-top:.2cqw;padding:.1cqw .9cqw;border:1px dashed rgba(214,176,92,.75);border-radius:.7cqw;background:rgba(40,30,16,.75);color:#ffe9b0;font-weight:700;font-size:max(10px,1.3cqw);white-space:nowrap}';document.head.appendChild(DEVCSS);
let devBusy=false;
function devEnforce(){if(devBusy)return;devBusy=true;try{const win=document.getElementById('wWpnSk');if(!win)return;const dm=document.getElementById('wskDm');if(!dm)return;
    for(const r of win.querySelectorAll('.row[data-k^="knx_"]')){if(r.classList.contains('lock'))continue;const c=r.querySelector('.chip');if(c&&c.textContent!=='กำลังพัฒนา'){c.textContent='กำลังพัฒนา';c.classList.remove('on');c.classList.add('off')}}
    const k=selK(),sel=win.querySelector('.row.sel'),isDev=!!(k&&k.indexOf('knx_')===0&&sel&&!sel.classList.contains('lock'));
    if(isDev){if(dm.textContent!=='กำลังพัฒนา')dm.textContent='กำลังพัฒนา';if(!dm.classList.contains('knDev'))dm.classList.add('knDev');
      const go=document.getElementById('wskGo');if(go&&!go.disabled)go.disabled=true;
      const as=document.getElementById('wskAs');if(as){if(!as.disabled)as.disabled=true;if(as.style.visibility!=='hidden')as.style.visibility='hidden'}}
    else if(dm.classList.contains('knDev'))dm.classList.remove('knDev')}catch(e){ERR('devEnforce',e)}finally{devBusy=false}}
function devHook(){const win=document.getElementById('wWpnSk');if(!win||win._knDev)return !!win;win._knDev=1;
  const mo=new MutationObserver(devEnforce);mo.observe(win,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['disabled','style','class']});return true}
setInterval(()=>{try{devHook()}catch(e){ERR('devHook',e)}},500);
try{const win=document.getElementById('wWpnSk');if(win)win.addEventListener('click',e=>{const k=selK();if(!k||k.indexOf('knx_')!==0)return;if(!e.target.closest('#wskAs,#wskGo'))return;e.stopImmediatePropagation();e.preventDefault();toast('กำลังพัฒนา')},true)}catch(e){ERR('devblock',e)}
/* ---------------------------------------------------------------- skill slots (template: scythe slot module in glue_scy.js) */
const SLOT_K=['1','2','3','4','5','6','q','e','r','f'];
const SS=KL.slots={map:{},assign:null,err:null};
try{SS.map=JSON.parse(localStorage.getItem('lanternfall_knuckleSlots_v1')||'{}')||{}}catch(_){SS.map={}}
const SKEYS=['kn_storm'];
for(const i in SS.map)if(!SKEYS.includes(SS.map[i])||+i<0||+i>9)delete SS.map[i];
SS.save=()=>{try{localStorage.setItem('lanternfall_knuckleSlots_v1',JSON.stringify(SS.map))}catch(_){}};
SS.find=k=>{for(const i in SS.map)if(SS.map[i]===k)return +i;return -1};
const entOf=k=>{try{for(const c of __WSK.lines.knuckle.cols)for(const s of c.skills)if(s.k===k)return s}catch(_){}return null};
const eq=()=>!!(window.__WSK&&__WSK.public&&held());
const unl=ent=>{try{return !!ent&&ent.ok()&&open(ent.k)}catch(_){return false}};
let msgEl=null;function say(t,ms){msgEl=msgEl||document.getElementById('wsAssignMsg');if(!msgEl)return;msgEl.textContent=t;msgEl.style.display='block';clearTimeout(say.t);if(ms)say.t=setTimeout(()=>{msgEl.style.display='none'},ms)}
SS.start=k=>{SS.assign=k;document.body.classList.add('wsAssign');document.body.classList.add('wsAsNoR');const e=entOf(k);say('แตะช่องสกิลที่ต้องการวาง "'+(e?e.name:k)+'" · แตะนอกช่องเพื่อยกเลิก',0)};
SS.stop=()=>{SS.assign=null;document.body.classList.remove('wsAssign','wsAsNoR');if(msgEl)msgEl.style.display='none'};
SS.set=(i,k)=>{const o=SS.find(k);if(o>=0)delete SS.map[o];SS.map[i]=k;SS.save();KL.placed++;repaint(true);return true};
SS.clear=i=>{delete SS.map[i];SS.save();repaint(true)};
SS.use=k=>{const e=entOf(k);if(!e)return false;if(!eq()||!playing())return false;
  if(!unl(e)){toast('ยังไม่ปลดล็อก');return false}try{KL.uses++;return !!e.start()}catch(er){SS.err='use '+er.message;return false}};
try{const win=document.getElementById('wWpnSk');if(win)win.addEventListener('click',e=>{if(!eq()||!e.target.closest('#wskAs'))return;
  const sel=win.querySelector('.row.sel'),kk=sel&&sel.dataset.k;if(!kk||!SKEYS.includes(kk))return;const en=entOf(kk);if(!en||en.type!=='active'||!unl(en))return;
  e.stopImmediatePropagation();e.preventDefault();try{if(G.win==='wWpnSk')closeWin()}catch(_){}SS.start(kk)},true)}catch(e){ERR('assign',e)}
setInterval(()=>{try{const as=document.getElementById('wskAs');if(!as||!eq()||!(window.__WSK&&__WSK.open))return;const sel=document.querySelector('#wWpnSk .row.sel'),kk=sel&&sel.dataset.k;
  if(kk&&SKEYS.includes(kk)){const at=SS.find(kk),t=at>=0?'ช่อง '+SLOT_K[at].toUpperCase()+' · ย้าย':'ใส่ช่องสกิล';if(as.textContent!==t)as.textContent=t}}catch(_){}},250);
const slotEl=e=>e.target&&e.target.closest&&e.target.closest('#bar .slot[data-i]:not(.pot),#tSkills .tsk[data-ti]');
const slIdx=el=>+(el.dataset.i!==undefined?el.dataset.i:el.dataset.ti);
for(const ev of ['pointerdown','click','contextmenu'])addEventListener(ev,e=>{try{
  if(SS.assign){if(ev==='contextmenu')return;e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();if(ev==='pointerdown')return;const el=slotEl(e);if(el){if(SS.set(slIdx(el),SS.assign))SS.stop()}else SS.stop();return}
  const el=slotEl(e);if(!el||!el.dataset.knk||!eq())return;
  if(ev==='contextmenu'){e.preventDefault();e.stopImmediatePropagation();SS.clear(slIdx(el));return}
  e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();
  if(ev==='pointerdown'){SS.use(el.dataset.knk);if(el.classList.contains('tsk')){el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),350)}}
}catch(er){SS.err='slot '+er.message}},true);
addEventListener('keydown',e=>{try{if(e.key==='Escape'&&SS.assign){SS.stop();return}
  if(!eq()||(window.__WSK&&__WSK.open)||G.win||G.state!=='play'||e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;const k=(e.key||'').toLowerCase(),i=SLOT_K.indexOf(k);if(i<0)return;const s=SS.map[i];if(!s)return;
  if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))return;e.stopImmediatePropagation();e.preventDefault();SS.use(s)}catch(er){SS.err='slot key '+er.message}},true);
/* slotui (the "ติดตั้ง" button on the rows) finds painted slots by data-ws/bs/ss/dgs/scs/hs/hws: the knuckle slot carries data-scs as well (the scythe module only reads it while the scythe is held) */
function paint(el,k){if(el.dataset.knk===k)return;const en=entOf(k);if(!en)return;const im=en.icon(),ki=el.querySelector('kbd'),kt=ki?ki.textContent:'';
  el.innerHTML=(im?'<img alt="'+en.name+'" src="'+im+'">':'<div class="wstx">'+en.name+'</div>')+'<div class="cd"></div><div class="cdt"></div>'+(kt?'<kbd>'+kt+'</kbd>':'');
  el.classList.add('wsk');el.dataset.knk=k;el.dataset.scs=k;delete el.dataset.ws;delete el.dataset.bs;delete el.dataset.ss;delete el.dataset.dgs;if(el.classList.contains('tsk'))el.setAttribute('data-sk','scs:'+k);else el.removeAttribute('data-sk');el.removeAttribute('draggable');el.title=en.name}
let wasOn=false,sigS='';
function repaint(force){const on=eq();
  if(!on){if(wasOn){wasOn=false;sigS='';for(const el of document.querySelectorAll('[data-knk]')){delete el.dataset.knk;delete el.dataset.scs;el.classList.remove('wsk')}try{buildBar()}catch(_){}try{if(typeof buildTouchSkills==='function')buildTouchSkills()}catch(_){}}return}
  const s=JSON.stringify(SS.map);if(force||!wasOn||s!==sigS){wasOn=true;sigS=s;try{buildBar()}catch(_){}try{if(typeof buildTouchSkills==='function')buildTouchSkills()}catch(_){}}
  for(const el of document.querySelectorAll('#bar .slot[data-i],#tSkills .tsk[data-ti]')){const i=slIdx(el),k=SS.map[i];if(k)paint(el,k)}}
function paintAll(){try{if(eq())for(const el of document.querySelectorAll('#bar .slot[data-i],#tSkills .tsk[data-ti]')){const k=SS.map[slIdx(el)];if(k)paint(el,k)}}catch(_){}}
try{const _bb=buildBar;buildBar=function(){const r=_bb.apply(this,arguments);paintAll();return r}}catch(e){ERR('bar hook',e)}
try{const _bt=buildTouchSkills;buildTouchSkills=function(){const r=_bt.apply(this,arguments);paintAll();return r}}catch(e){ERR('touch hook',e)}
setInterval(()=>{try{if(SS.assign&&(G.win||G.state!=='play'))SS.stop();repaint(false);if(!eq())return;
  for(const el of document.querySelectorAll('.slot.wsk[data-knk],.tsk.wsk[data-knk]')){const k=el.dataset.knk,en=entOf(k);if(!en)continue;const ok=unl(en);el.classList.toggle('wsoff',!ok);
    let c=null;try{c=en.cost()}catch(_){}const cd=(P.cds&&P.cds[en.cdId])||0,cdE=el.querySelector('.cd'),tE=el.querySelector('.cdt');
    if(cdE)cdE.style.setProperty('--cd',ok&&c&&cd>0?Math.min(1,cd/c.cd):0);if(tE)tE.textContent=ok&&cd>0?(cd>=10?String(Math.ceil(cd)):cd.toFixed(1)):'';el.classList.toggle('nomp',!!(c&&P.mp<c.mp))}
}catch(e){SS.err='slot tick '+e.message}},120);
/* ---------------------------------------------------------------- save migration: Storm Fists installed from the old special page (P.slots 'spStorm') -> the knuckle slot map */
function migrate(){try{if(typeof P==='undefined'||!P||!Array.isArray(P.slots))return;const i=P.slots.indexOf('spStorm');if(i<0)return;
    let j=i;if(SS.map[j]&&SS.map[j]!=='kn_storm'){j=-1;for(let q=0;q<10;q++)if(!SS.map[q]&&String(SLOT_K[q]).toLowerCase()!=='r'){j=q;break}}
    if(SS.find('kn_storm')<0&&j>=0){SS.map[j]=SS.map[j]||'kn_storm';SS.save()}
    P.slots[i]=null;KL.migrated++;try{buildBar()}catch(_){}try{saveGame()}catch(_){}}catch(e){ERR('migrate',e)}}
setInterval(migrate,1500);
KL.state=()=>({err:KL.err,registered:KL.registered,lv:lvOf('kn_storm'),free:free(),total:total(),spent:spent(),map:SS.map,uses:KL.uses,migrated:KL.migrated});
console.info('[KNLINE] knuckleline-r1');
})();
