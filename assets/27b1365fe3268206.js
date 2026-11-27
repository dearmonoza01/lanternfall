
/* ---- p340 r1 (TEST build, 4 Nov 2026; coordinator task for DeaRz): two UI changes, no rule changes.
   (1) The four weapon-switch buttons on the left of the screen (#bowTestBtn bow, #stfTestBtn staff, #holyBtn holy staff, #dgrBtn daggers) are hidden
       (CSS only; the buttons and their code stay). ?wswitch=on brings them back. Without them the weapon changes by equipping a weapon item from the bag (C / I).
   (2) "สกิลพิเศษ" page in the skill window (K): Sakura Blade (key 7) + Demon Domain (key 8). Rows show name, level, CD, MP, short text, learned/locked,
       a slot button (= show the skill on its round special button, default on; off hides the button and ignores its key) and an icon area that says "รอไอคอน"
       until icon files arrive (window.SPSK.setIcon(id,url) or SPSK.icons.sak / .dd = url). Learned = the existing rule (player Lv >= the skill's MINLV, 30);
       NPC teaching (Sabi / Kraga) is not built, so the page only names the NPC. Debug: window.SPSK. Placement preference key: lanternfall_spSkill_placed_v1 (not the save). ---- */
(function(){'use strict';const Q=String(location.search);
const S=window.SPSK={ver:'p340-r1',err:null,wswitch:/[?&]wswitch=on/.test(Q),placed:{sak:1,dd:1},sel:'sak',icons:{},open:false,page:false};
const LS='lanternfall_spSkill_placed_v1';
try{const o=JSON.parse(localStorage.getItem(LS)||'null');if(o){S.placed.sak=o.sak===0?0:1;S.placed.dd=o.dd===0?0:1;}}catch(_){}
const save=()=>{try{localStorage.setItem(LS,JSON.stringify(S.placed));}catch(_){}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const DEF=[
 {id:'sak',name:'ดาบซากุระ',en:'Sakura Blade',col:'#ff9fc0',lv:30,cd:25,mp:35,key:'7',npc:'ซาบิ (Sabi)',api:()=>window.SAKURA,cdId:'spSakura',
  desc:'ปักดาบยักษ์ลงพื้น กลีบซากุระพัดเป็นแนวยาวทะลุศัตรู ฟัน 23 ครั้ง ครั้งละ 30% ของโจมตีปกติ',
  full:'ปักดาบยักษ์ลงพื้น กลีบซากุระพัดเป็นแนวยาวทะลุศัตรูในเลน ฟัน 23 ครั้ง ครั้งละ 30% ของโจมตีปกติของอาวุธที่ถือ ไม่ติดธาตุ ล็อกท่า 1 วิ (เดินได้ ตีปกติไม่ได้)'},
 {id:'dd',name:'อาณาเขตปีศาจ',en:'Demon Domain',col:'#c2366f',lv:30,cd:40,mp:50,key:'8',npc:'ครากา (Kraga)',api:()=>window.DDOM,cdId:'spDemon',
  desc:'แผ่อาณาเขตปีศาจรอบตัว มือปีศาจคว้าศัตรูในวงให้ติดสตัน แล้วฟัน 22 ครั้ง ครั้งละ 25% ของโจมตีปกติ',
  full:'แผ่อาณาเขตปีศาจรอบตัว มือปีศาจคว้าศัตรูในวงให้ติดสตัน (มอนทั่วไป 2.6 วิ เอไลต์ 1.3 วิ) แล้วฟัน 22 ครั้ง ครั้งละ 25% ของโจมตีปกติ บอสไม่ติดสตันแต่โดนฟัน ใช้ทันที ไม่ต้องเล็ง'}];
S.defs=DEF;
const cfg=(d,k)=>{try{const a=d.api();return a&&a.cfg&&a.cfg[k]!=null?a.cfg[k]:d[k==='CD'?'cd':k==='MP'?'mp':'lv'];}catch(_){return d[k==='CD'?'cd':k==='MP'?'mp':'lv'];}};
function state(d){try{const a=d.api();if(!a||!a.on||!a.ok)return 'off';const lvl=(typeof P!=='undefined'&&P&&P.lvl)|0;return lvl>=(a.cfg&&a.cfg.MINLV!=null?a.cfg.MINLV:d.lv)?'on':'lock';}catch(_){return 'off';}}
S.state=id=>state(DEF.find(d=>d.id===id));
S.setIcon=(id,src)=>{S.icons[id]=src;S.sig='';};
/* ---------- (1) left weapon switcher + key gate for an unplaced special button ---------- */
{const st=document.createElement('style');st.id='spskCss1';
 st.textContent=(S.wswitch?'':'#bowTestBtn,#stfTestBtn,#holyBtn,#dgrBtn{display:none!important}')+'body.spNoSak #sakBtn{display:none!important}body.spNoDd #ddBtn{display:none!important}';
 document.head.appendChild(st);}
const syncBody=()=>{document.body.classList.toggle('spNoSak',!S.placed.sak);document.body.classList.toggle('spNoDd',!S.placed.dd);};syncBody();
addEventListener('keydown',e=>{try{if(e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;const k=e.key;if(k!=='7'&&k!=='8')return;const t=e.target;if(t&&(/INPUT|TEXTAREA/.test(t.tagName)||t.isContentEditable))return;
  if((k==='7'&&!S.placed.sak)||(k==='8'&&!S.placed.dd))e.stopImmediatePropagation();}catch(_){}},true);
/* ---------- (2) special skills page inside the skill window #wWpnSk ---------- */
const CSS=`
#wWpnSk .sptog{left:69.5%;top:1.6%;width:20.5%;height:6.4%}
#wWpnSk .sptog button{position:absolute;inset:0;width:100%;height:100%;min-height:30px;border-radius:.9cqw;border:1px solid rgba(214,176,92,.85);background:linear-gradient(180deg,rgba(60,38,48,.95),rgba(24,14,20,.95));color:#ffd3e2;font-family:inherit;font-weight:700;font-size:max(11px,1.7cqw);cursor:pointer;touch-action:manipulation;white-space:nowrap;padding:0 .6cqw}
#wWpnSk.sp .sptog button{background:linear-gradient(180deg,#f0c368,#b8801f);color:#2c1a05;border-color:#ffe1a0}
#wWpnSk .sppn{display:none}
#wWpnSk.sp .sppn{display:flex;flex-direction:column;left:1.93%;width:96.3%;top:10.5%;height:65.6%;box-sizing:border-box;border:1px solid rgba(160,128,64,.6);border-radius:1.2cqw;background:linear-gradient(180deg,#1b1610,#12100b);z-index:3}
#wWpnSk.sp .col,#wWpnSk.sp .tp{display:none!important}
#wWpnSk.sp .dic,#wWpnSk.sp .dtx,#wWpnSk.sp .pl,#wWpnSk.sp .bt.as,#wWpnSk.sp .supP,#wWpnSk.sp .bt.go:not(.spgo){visibility:hidden!important}#wWpnSk.sp .bt.as,#wWpnSk.sp .supP{display:none!important}
#wWpnSk .sppn .sph{flex:0 0 auto;padding:.8cqw 1.2cqw .2cqw;font-size:max(11px,1.6cqw);color:#c9b27a;line-height:1.35}
#wWpnSk .sppn .lst{flex:1;overflow-y:auto;padding:.8cqw 1cqw;gap:.9cqw}
#wWpnSk .spr{flex:0 0 auto;display:flex;align-items:stretch;gap:1.4cqw;min-height:max(70px,14.5cqw);box-sizing:border-box;padding:.9cqw 1.1cqw;border:1px solid rgba(120,96,52,.55);border-left:.5cqw solid var(--c);border-radius:.9cqw;background:linear-gradient(180deg,rgba(40,33,24,.92),rgba(22,18,13,.94));cursor:pointer;touch-action:manipulation}
#wWpnSk .spr.sel{border-color:var(--c);box-shadow:0 0 0 1px var(--c),0 0 1.6cqw color-mix(in srgb,var(--c) 45%,transparent)}
#wWpnSk .spr.lock .spnm,#wWpnSk .spr.off .spnm{color:#b9ad92}
#wWpnSk .spic{flex:0 0 max(64px,12.5cqw);width:max(64px,12.5cqw);align-self:center;aspect-ratio:1;box-sizing:border-box;border:1px dashed rgba(201,168,106,.6);border-radius:.9cqw;background:#100d09;display:flex;align-items:center;justify-content:center;text-align:center;overflow:hidden;color:#9c917c;font-size:max(10px,1.5cqw);line-height:1.2;padding:.4cqw}
#wWpnSk .spic img{width:100%;height:100%;object-fit:contain;display:block}
#wWpnSk .spr.has .spic{border:1px solid rgba(150,120,60,.55)}
#wWpnSk .spmain{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:.5cqw}
#wWpnSk .spnm{font-size:max(14px,2.3cqw);font-weight:700;color:#f0e4c8;line-height:1.15}
#wWpnSk .spnm small{font-size:.62em;font-weight:500;color:#a99c80;margin-left:.6em}
#wWpnSk .spchips{display:flex;flex-wrap:wrap;gap:.5cqw}
#wWpnSk .spchips span{font-size:max(10px,1.35cqw);padding:.15cqw .8cqw;border-radius:99px;border:1px solid rgba(201,168,106,.5);background:rgba(60,48,28,.6);color:#f1deaa;white-space:nowrap}
#wWpnSk .spds{font-size:max(11px,1.55cqw);line-height:1.35;color:#d8ccb2;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
#wWpnSk .spnpc{font-size:max(10px,1.35cqw);color:#a99c80}
#wWpnSk .spside{flex:0 0 auto;display:flex;flex-direction:column;align-items:flex-end;justify-content:center;gap:.8cqw}
#wWpnSk .spside .chip{font-size:max(11px,1.45cqw)}
#wWpnSk .spside button{min-width:max(92px,15cqw);min-height:44px;padding:.4cqw 1cqw;border-radius:.9cqw;border:1px solid rgba(214,176,92,.85);background:rgba(40,30,16,.92);color:#ffe9b0;font-family:inherit;font-weight:700;font-size:max(11px,1.5cqw);cursor:pointer;touch-action:manipulation}
#wWpnSk .spside button.on{border-color:var(--c);color:#fff}
#wWpnSk .spside button:disabled{color:#7a6c52;border-color:rgba(120,96,52,.5);cursor:default}
#wWpnSk .spdic{left:3.3%;top:79.4%;width:8.6%;aspect-ratio:1;border-radius:1cqw;box-sizing:border-box;border:1px dashed rgba(201,168,106,.6);background:#100d09;display:none;align-items:center;justify-content:center;text-align:center;color:#9c917c;font-size:max(9px,1.3cqw);line-height:1.15;overflow:hidden}
#wWpnSk.sp .spdic{display:flex}
#wWpnSk .spdic img{width:100%;height:100%;object-fit:contain}
#wWpnSk .spdtx{left:13.1%;top:78.6%;width:53%;height:18.6%;display:none;flex-direction:column;gap:.35cqw;min-height:0}
#wWpnSk.sp .spdtx{display:flex}
#wWpnSk .spdtx .dn{color:var(--c,#e5c9ff)}
#wWpnSk .sppl{left:68.7%;top:81.1%;width:26.8%;height:4.8%;display:none;align-items:center;justify-content:center;font-size:1.8cqw;color:#e8c98a;font-weight:600;white-space:nowrap}
#wWpnSk.sp .sppl{display:flex}
#wWpnSk .bt.spgo{display:none}
#wWpnSk.sp .bt.spgo{display:block}
#wWpnSk.sp .bt.spgo button{color:#2c1a05;text-shadow:0 1px 0 rgba(255,235,170,.6)}
#wWpnSk.sp .bt.spgo button:disabled{color:#5b4a2c;text-shadow:none;cursor:default}
#wWpnSk.tabs .spnm{font-size:max(13px,3cqw)}
#wWpnSk.tabs .spds{font-size:max(11px,2.1cqw)}
#wWpnSk.tabs .spchips span{font-size:max(10px,1.9cqw)}
#wWpnSk.tabs .spnpc{font-size:max(10px,1.9cqw)}
#wWpnSk.tabs .spdtx .dn{font-size:max(12px,3cqw)}
#wWpnSk.tabs .spdtx .dd{font-size:max(10px,2cqw)}
#wWpnSk.tabs .sppl{font-size:max(10px,2.1cqw)}
#wWpnSk.tabs .spic{flex-basis:max(52px,12cqw);width:max(52px,12cqw)}
#wWpnSk.tabs .sph{font-size:max(10px,1.9cqw)}
`;
function build(win){
  const box=win.querySelector('.box');if(!box||win.querySelector('.sppn'))return false;
  const st=document.createElement('style');st.id='spskCss2';st.textContent=CSS;document.head.appendChild(st);
  const h=document.createElement('div');
  h.innerHTML='<div class="abs sptog"><button type="button" id="spTog">★ สกิลพิเศษ</button></div>'
   +'<div class="abs sppn"><div class="sph">สกิลพิเศษ — ไม่ผูกกับอาวุธ ใช้ผ่านปุ่มกลมพิเศษบนจอ</div><div class="lst" id="spList"></div></div>'
   +'<div class="abs spdic" id="spDic"></div><div class="abs spdtx"><div class="dn" id="spDn"></div><div class="dd" id="spDd"></div><div class="dm" id="spDm"></div></div>'
   +'<div class="abs sppl" id="spPl"></div>'
   +'<div class="abs bt go spgo"><button type="button" id="spGo"></button></div>';
  while(h.firstChild)box.appendChild(h.firstChild);
  /* taps here must not reach the game or the window's own handlers (the window closes on a click outside .box) */
  win.addEventListener('click',e=>{const t=e.target;if(!t.closest)return;
    if(t.closest('#spTog')){e.stopImmediatePropagation();S.page=!S.page;apply(win);return;}
    if(!S.page)return;
    const sl=t.closest('[data-spslot]');if(sl){e.stopImmediatePropagation();if(!sl.disabled)toggle(sl.dataset.spslot);return;}
    if(t.closest('#spGo')){e.stopImmediatePropagation();if(!t.closest('#spGo').disabled)toggle(S.sel);return;}
    const r=t.closest('.spr');if(r){e.stopImmediatePropagation();S.sel=r.dataset.sp;S.sig='';render(win);return;}
  },true);
  return true;}
function toggle(id){const d=DEF.find(x=>x.id===id);if(!d||state(d)!=='on')return;S.placed[id]=S.placed[id]?0:1;save();syncBody();S.sig='';render(document.getElementById('wWpnSk'));}
function apply(win){win.classList.toggle('sp',!!S.page);const b=win.querySelector('#spTog');if(b)b.textContent=S.page?'◀ สกิลอาวุธ':'★ สกิลพิเศษ';S.sig='';if(S.page)render(win);}
function sigOf(){const lvl=(typeof P!=='undefined'&&P&&P.lvl)|0;let cd='';try{for(const d of DEF){const c=(P.cds&&P.cds[d.cdId])||0;cd+=c>0?Math.ceil(c):0;cd+=',';}}catch(_){}
  return [S.sel,lvl,DEF.map(d=>state(d)+(S.placed[d.id]?1:0)+(S.icons[d.id]?1:0)).join(''),cd].join('|');}
function render(win){if(!win||!S.page)return;const sg=sigOf();if(sg===S.sig)return;S.sig=sg;
  const lvl=(typeof P!=='undefined'&&P&&P.lvl)|0,list=win.querySelector('#spList');if(!list)return;
  const keep=list.scrollTop;
  list.innerHTML=DEF.map(d=>{const s=state(d),ic=S.icons[d.id],pl=!!S.placed[d.id];
    const chip=s==='on'?'<span class="chip on">✔ เรียนแล้ว</span>':s==='lock'?'<span class="chip lk">🔒 ล็อก · ต้อง Lv.'+d.lv+'</span>':'<span class="chip off">ปิดอยู่ (URL flag)</span>';
    const btn='<button type="button" data-spslot="'+d.id+'" class="'+(s==='on'&&pl?'on':'')+'"'+(s==='on'?'':' disabled')+'>'+(s!=='on'?'🔒 วางไม่ได้':pl?'✔ วางบนปุ่ม '+d.key+' แล้ว':'วางบนปุ่ม '+d.key)+'</button>';
    return '<div class="spr '+s+(S.sel===d.id?' sel':'')+(ic?' has':'')+'" data-sp="'+d.id+'" style="--c:'+d.col+'"><div class="spic">'+(ic?'<img alt="" src="'+esc(ic)+'">':'รอไอคอน')+'</div>'
     +'<div class="spmain"><div class="spnm">'+esc(d.name)+'<small>'+esc(d.en)+'</small></div><div class="spchips"><span>Lv '+d.lv+'</span><span>CD '+cfg(d,'CD')+' วิ</span><span>MP '+cfg(d,'MP')+'</span><span>ปุ่ม '+d.key+'</span></div>'
     +'<div class="spds">'+esc(d.desc)+'</div><div class="spnpc">เรียนจาก NPC '+esc(d.npc)+'</div></div><div class="spside">'+chip+btn+'</div></div>';}).join('');
  list.scrollTop=keep;
  const d=DEF.find(x=>x.id===S.sel)||DEF[0],s=state(d),pl=!!S.placed[d.id],ic=S.icons[d.id];
  const learned=DEF.filter(x=>state(x)==='on').length;
  win.style.setProperty('--c',d.col);
  win.querySelector('#spDic').innerHTML=ic?'<img alt="" src="'+esc(ic)+'">':'รอไอคอน';
  win.querySelector('#spDn').textContent=d.name+' · '+d.en;
  win.querySelector('#spDd').textContent=d.full;
  let cdn=0;try{cdn=(P.cds&&P.cds[d.cdId])||0;}catch(_){}
  win.querySelector('#spDm').textContent=s==='on'?'Lv '+d.lv+' · MP '+cfg(d,'MP')+' · คูลดาวน์ '+cfg(d,'CD')+' วิ · ปุ่ม '+d.key+(cdn>0?' · รอ '+Math.ceil(cdn)+' วิ':'')+' · เรียนจาก NPC '+d.npc+' (ระบบเรียนยังไม่เปิด ใช้กฎ Lv '+d.lv+' เดิม)'
    :s==='lock'?'🔒 ปลดล็อกที่เลเวลตัวละคร '+d.lv+' (ตอนนี้ Lv.'+lvl+') · เรียนจาก NPC '+d.npc:'สกิลนี้ถูกปิดด้วย URL flag ในไฟล์ทดสอบนี้';
  win.querySelector('#spPl').textContent='เลเวล '+lvl+' · เรียนแล้ว '+learned+'/'+DEF.length;
  const go=win.querySelector('#spGo');go.disabled=s!=='on';go.textContent=s!=='on'?'ล็อกอยู่':pl?'ถอดจากปุ่ม '+d.key:'วางบนปุ่ม '+d.key;go.style.fontSize='max(11px,2cqw)';}
let tries=0;const iv=setInterval(()=>{try{const win=document.getElementById('wWpnSk');
  if(!win){if(++tries>200){clearInterval(iv);S.err='skill window not found';}return;}
  if(!win.querySelector('.sppn')){if(!build(win))return;}
  S.open=!win.hidden;if(win.hidden&&S.page){S.page=false;win.classList.remove('sp');const b=win.querySelector('#spTog');if(b)b.textContent='★ สกิลพิเศษ';}
  if(S.page)render(win);}catch(e){S.err=e.message;}},250);
})();
