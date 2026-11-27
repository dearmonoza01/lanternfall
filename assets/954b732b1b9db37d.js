
/* ---- spslot r1 (TEST/REAL v3g, 12 Nov 2026): special skills live in the normal skill slots ----
   DeaRz 20:03: the two round "Lv" buttons (Sakura Blade key 7, Demon Domain key 8) must not float outside the skill bar.
   * the two skills are registered as normal skill entries (SK.spSakura / SK.spDemon, type 'spsk') so the bar draws their icon, cooldown ring, MP-low shading and key from the slot;
     slot key / tap -> castSkill(id) -> SAKURA.aimStart (PC: aim with the mouse then click; phone: auto-aim and fire) / DDOM.cast. Cooldown ids stay spSakura / spDemon (same as before).
   * the round buttons #sakBtn / #ddBtn and the legacy keys 7 / 8 are off; the proficiency level badge (PROF) shows on the slot.
   * skill window > "สกิลพิเศษ" page: the button now installs the skill into the first free slot (or removes it when it is already in a slot). Unlearned skills cannot be installed.
   * learned but unslotted (old saves): nothing is auto-filled, the skill is shown in the special page to install. Unlock rules, level-by-use and damage are unchanged.
   ?spslot=off = old round buttons. Debug: window.SPSLOT ---- */
(function(){'use strict';
const Q=String(location.search),OFF=/[?&]spslot=off\b/.test(Q);
const SP=window.SPSLOT={ver:'spslot-r1',on:!OFF,err:null,casts:0,placed:0,removed:0};
if(OFF)return;
const ERR=(w,e)=>{SP.err=w+': '+((e&&e.message)||e);try{console.error('[SPSLOT]',w,e)}catch(_){}};
const MAP={spStorm:{k:'st',name:'หมัดพายุ',cd:7,mp:15,glyph:'☄',api:()=>window.STORMAPI,self:1},spThunder:{k:'th',name:'เทพดาบสายฟ้า',cd:8,mp:15,glyph:'⚡',api:()=>window.THUNDER,self:1},spSakura:{k:'sak',name:'ดาบซากุระ',cd:25,mp:30,glyph:'❀',api:()=>window.SAKURA},spDemon:{k:'dd',name:'อาณาเขตปีศาจ',cd:40,mp:43,glyph:'☠',api:()=>window.DDOM}};
const KEYMAP={sak:'spSakura',dd:'spDemon',th:'spThunder',st:'spStorm'};
function reg(){try{if(typeof SK!=='object'||!SK)return;let n=0;for(const id in MAP){const m=MAP[id];let c=null;try{c=m.api()&&m.api().cfg}catch(_){}
    const cd=c&&c.CD!=null?c.CD:m.cd,mp=c&&c.MP!=null?c.MP:m.mp;
    if(!SK[id])SK[id]={id,name:m.name,type:'spsk',cls:'novice',idx:60+n,cd,mp,m:0,dt:'phys',r:0,range:0,th:'spirit',glyph:m.glyph};else{SK[id].cd=cd;SK[id].mp=mp}n++}}catch(e){ERR('reg',e)}}
reg();setInterval(reg,2000);
/* hide the round buttons and the legacy 7 / 8 keys */
try{const st=document.createElement('style');st.id='spslotCss';st.textContent='#sakBtn,#ddBtn{display:none!important}';document.head.appendChild(st)}catch(e){ERR('css',e)}
function off78(){try{const S=window.SPSK;if(S&&S.placed){S.placed.sak=0;S.placed.dd=0}document.body.classList.add('spNoSak','spNoDd')}catch(_){}}
off78();setInterval(off78,700);
const stateOf=id=>{try{return window.SPSK&&SPSK.state?SPSK.state(MAP[id].k):'off'}catch(_){return 'off'}};
const say=t=>{try{textAt(P.x,P.y-62,t,'#ffd3e2',13)}catch(_){}try{log(t,'w')}catch(_){}};
const touchOn=()=>{try{return !!(typeof TOUCH!=='undefined'&&TOUCH&&TOUCH.on)||document.body.classList.contains('mobile')}catch(_){return false}};
function cast(id){try{if(!P||P.dead||G.state!=='play')return false;const m=MAP[id];if(m.self)return true;const A=m.api();
    if(!A||!A.on||!A.ok)return false;
    const st=stateOf(id);if(st!=='on'){say(m.name+': ยังไม่ปลดล็อก');return false}
    SP.casts++;
    if(m.k==='sak'){if(A.aim){A.cancel();return true}const t=touchOn();if(A.aimStart(t?'touch':'pc')){if(t)A.fire();return true}return false}
    return !!A.cast();
  }catch(e){ERR('cast',e);return false}}
try{const o=castSkill;castSkill=function(id){if(MAP[id])return cast(id);return o.apply(this,arguments)}}catch(e){ERR('hook castSkill',e)}
try{const o=castSkillNow;castSkillNow=function(id){if(MAP[id])return cast(id);return o.apply(this,arguments)}}catch(e){ERR('hook castSkillNow',e)}
try{const o=skillIcon;skillIcon=function(id){const m=MAP[id];if(m&&window.SCYICONS&&SCYICONS[m.k])return SCYICONS[m.k];return o.apply(this,arguments)}}catch(e){ERR('hook skillIcon',e)}
/* install / remove */
const slotOf=id=>{try{return P.slots.indexOf(id)}catch(_){return -1}};
/* slots that a weapon-skill module has painted over (sword / bow / staff / dagger / holy / scythe loadouts) are taken; R is kept free of specials (the sword module reserves it) */
function freeIdx(){try{const used=new Set();for(const el of document.querySelectorAll('#bar .slot.wsk,#tSkills .tsk.wsk')){const i=+(el.dataset.i!==undefined?el.dataset.i:el.dataset.ti);if(i>=0)used.add(i)}
    for(let i=0;i<P.slots.length;i++){if(String(SLOT_KEYS[i]).toLowerCase()==='r')continue;if(P.slots[i]==null&&!used.has(i))return i}}catch(e){ERR('freeIdx',e)}return -1}
function place(id){try{if(!MAP[id])return false;reg();const i=slotOf(id);
    if(i>=0){P.slots[i]=null;SP.removed++;buildBar();try{saveGame()}catch(_){}say(MAP[id].name+': ถอดออกจากช่องแล้ว');return true}
    if(stateOf(id)!=='on'){say(MAP[id].name+': ยังไม่ปลดล็อก (ต้อง Lv 30)');return false}
    const f=freeIdx();
    if(f>=0){P.slots[f]=id;SP.placed++;buildBar();try{saveGame()}catch(_){}say(MAP[id].name+': ติดตั้งที่ช่อง '+String(SLOT_KEYS[f]).toUpperCase());return true}
    say('ไม่มีช่องว่าง: ถอดสกิลในช่องหนึ่งก่อน (คลิกขวาที่ช่อง) แล้วกดติดตั้งอีกครั้ง');return false
  }catch(e){ERR('place',e);return false}}
SP.place=place;SP.cast=cast;
document.addEventListener('click',e=>{try{const t=e.target&&e.target.closest?e.target:null;if(!t)return;
    const sl=t.closest('[data-spslot]');let k=sl&&sl.dataset.spslot;
    if(!k&&t.closest('#spGo')&&window.SPSK)k=SPSK.sel;
    if(!k||!KEYMAP[k])return;
    e.stopPropagation();e.preventDefault();place(KEYMAP[k]);
    try{SPSK.sig=''}catch(_){}
  }catch(er){ERR('click',er)}},true);
/* labels on the special page + level badge on the slot */
function ui(){try{
    const h=document.querySelector('#wWpnSk .sph');if(h&&h.textContent.indexOf('ช่องสกิล')<0)h.textContent='สกิลพิเศษ — ไม่ผูกกับอาวุธ ติดตั้งลงช่องสกิลได้เหมือนสกิลปกติ (กดปุ่มติดตั้งด้านขวา)';
    for(const b of document.querySelectorAll('#wWpnSk [data-spslot]')){const id=KEYMAP[b.dataset.spslot];if(!id)continue;const i=slotOf(id),s=stateOf(id);
      const tx=s!=='on'?'🔒 ติดตั้งไม่ได้':i>=0?'✔ อยู่ช่อง '+String(SLOT_KEYS[i]).toUpperCase()+' · ถอด':'ติดตั้งลงช่องสกิล';
      if(b.textContent!==tx)b.textContent=tx;b.classList.toggle('on',i>=0)}
    for(const c of document.querySelectorAll('#wWpnSk .spchips span')){if(/^ปุ่ม [78—]$/.test(c.textContent))c.textContent='ช่องสกิล'}
    const go=document.getElementById('spGo');if(go&&window.SPSK&&KEYMAP[SPSK.sel]){const id=KEYMAP[SPSK.sel],i=slotOf(id),s=stateOf(id);const tx=s!=='on'?'🔒 ยังไม่ปลดล็อก':i>=0?'ถอดออกจากช่องสกิล':'ติดตั้งลงช่องสกิล';if(go.textContent!==tx)go.textContent=tx;go.disabled=(s!=='on')}
    if(window.PROF&&PROF.state){const ps=PROF.state();for(const id in MAP){const el=document.querySelector('.slot[data-sk="'+id+'"] .lv');if(el){const L=ps[MAP[id].k]&&ps[MAP[id].k].lv;if(L&&el.textContent!==String(L))el.textContent=String(L)}}}
  }catch(e){ERR('ui',e)}}
setInterval(ui,300);
console.info('[SPSLOT] r1');
})();
