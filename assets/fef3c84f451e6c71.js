
/* r220 DEATHUI220 (?deathui=off): DeaRz 25 Nov 2026 01:35 BKK: "redo the death screen, and the town name it returns to is wrong".
   The button said "Capital City" but revive really loads Map 1 (sylva_lab, the start village); the text now names the real place.
   New look (code-drawn, no new art): dark vignette, a small lantern whose flame has gone out with a rising wisp, title and description = DeaRz's own words (01:39 BKK: "พ่ายแพ้ต่อความมืด" / "ความตายไม่ใช่จุดจบ แต่เป็นบทเรียน... จงลุกขึ้นสู้อีกครั้ง", button = town name),
   01:41 BKK: "the description should tell how to grow, e.g. refine gear, raise status, wear defence gear, upgrade skills, as a list of tips the player picks" -> 4 tip rows (TIPS); tapping one revives and opens the matching window (status/equipment = wInv, skills = wSkill; refine = hint to the smith). Wording and the tap behaviour are Code's own choice.
   where you fell (Thai map name) + level, the EXP cost shown as a number, one clear button. The revive rule itself (5 % of the level's EXP, full HP/MP, Map 1) is unchanged. */
(function(){'use strict';
const X=window.DEATHUI220={on:!/[?&]deathui=off\b/.test(String(location.search)),err:null,shown:0,TOWN:'หมู่บ้านซิลวา',TITLE:'พ่ายแพ้ต่อความมืด',DESC:'ความตายไม่ใช่จุดจบ แต่เป็นบทเรียน... จงลุกขึ้นสู้อีกครั้ง'};
if(!X.on)return;
function thName(zid){try{const N=window.__ZONE_NAMES_22,W=window.__WORLDMAP;if(N&&W&&W.nodes){const i=W.nodes.findIndex(n=>n[0]===zid);if(i>=0&&N[i+1]&&N[i+1][1])return N[i+1][1]}}catch(_){}try{return ZONES[zid].n}catch(_){return ''}}
const css=document.createElement('style');css.textContent=
 '#over.d220{background:radial-gradient(ellipse at 50% 42%,rgba(20,14,34,.55),rgba(4,3,10,.93) 70%)!important;animation:d220in .9s ease both}'
+'@keyframes d220in{from{opacity:0}to{opacity:1}}'
+'#over.d220 .ovc{display:flex;flex-direction:column;align-items:center;gap:10px;max-width:min(92vw,460px);padding:0 14px;text-align:center}'
+'#over.d220 h1.dead{font:800 clamp(26px,7.4vw,44px)/1.2 Sarabun,"Noto Sans Thai",sans-serif;letter-spacing:.02em;margin:0;background:linear-gradient(180deg,#fff3d2,#e7b867 55%,#a8652c);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 2px 10px rgba(0,0,0,.8));overflow-wrap:normal}'
+'#over.d220 #overSub{margin:0;font:600 15px/1.5 Sarabun,"Noto Sans Thai",sans-serif;color:#e9e2d0;letter-spacing:0;text-shadow:0 1px 4px #000}'
+'#d220cost{font:600 13.5px/1.4 Sarabun,"Noto Sans Thai",sans-serif;color:#ffb0a0;padding:4px 14px;border-radius:999px;background:rgba(60,14,14,.55);border:1px solid rgba(255,140,120,.35)}'
+'#d220lan{width:92px;height:118px;margin-bottom:2px}#d220lan .wisp{animation:d220w 3.2s ease-in-out infinite;transform-origin:46px 60px}@keyframes d220w{0%{opacity:0;transform:translateY(6px)}35%{opacity:.75}100%{opacity:0;transform:translateY(-16px)}}'
+'#d220lan .ember{animation:d220e 2.4s ease-in-out infinite}@keyframes d220e{0%,100%{opacity:.25}50%{opacity:.8}}'
+'#over.d220 #bRevive{margin-top:8px;min-width:min(78vw,300px);min-height:50px;font:800 17px/1.2 Sarabun,"Noto Sans Thai",sans-serif;letter-spacing:0;white-space:normal;padding:10px 20px}'
+'#over.d220 #bRevive small{display:block;font:600 12px/1.2 Sarabun,"Noto Sans Thai",sans-serif;opacity:.85;margin-bottom:2px}#d220where{font:500 12.5px/1.4 Sarabun,"Noto Sans Thai",sans-serif;color:#a9b3c8}';
css.textContent+='body:has(#over.d220:not([hidden])) #qtL,body:has(#over.d220:not([hidden])) #qTrack{visibility:hidden!important}'
+'#d220tips{display:grid;grid-template-columns:1fr;gap:6px;width:min(92vw,420px);margin-top:2px}#d220tipsH{font:700 13px/1.3 Sarabun,"Noto Sans Thai",sans-serif;color:#f1d08a;margin-top:4px}'
+'#d220tips button{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:9px;min-height:44px;padding:6px 12px;border-radius:10px;background:rgba(30,26,48,.78);border:1px solid rgba(231,184,103,.38);text-align:left;cursor:pointer;-webkit-tap-highlight-color:transparent}#d220tips button:active{background:rgba(70,54,30,.9)}'
+'#d220tips .ic{font-size:19px;width:24px;text-align:center;flex:none}#d220tips b{display:block;font:700 14px/1.25 Sarabun,"Noto Sans Thai",sans-serif;color:#fff1cf}#d220tips i{display:block;font:500 11.5px/1.3 Sarabun,"Noto Sans Thai",sans-serif;font-style:normal;color:#b9c0d2}#d220tips .go{margin-left:auto;color:#e7b867;font-size:15px;flex:none}'
+'@media (orientation:landscape){#over.d220 .ovc{max-width:min(94vw,640px);gap:6px}#d220tips{grid-template-columns:1fr 1fr;width:min(94vw,620px)}}@media (max-height:700px){#d220lan{width:56px!important;height:72px!important}}'
;
document.head.appendChild(css);
const LAN='<svg id="d220lan" viewBox="0 0 92 118" aria-hidden="true"><defs><linearGradient id="d220g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a6a36"/><stop offset="1" stop-color="#4a3418"/></linearGradient></defs>'
 +'<path class="wisp" d="M46 52c-6-7 5-10 0-18c-4-6 3-9 0-14" fill="none" stroke="#cfd6e6" stroke-width="2.2" stroke-linecap="round"/>'
 +'<path d="M34 22a12 12 0 0 1 24 0" fill="none" stroke="#8a6a36" stroke-width="3"/><rect x="30" y="22" width="32" height="8" rx="3" fill="url(#d220g)"/>'
 +'<path d="M26 32h40l6 56H20z" fill="rgba(18,22,40,.85)" stroke="#8a6a36" stroke-width="3" stroke-linejoin="round"/><path d="M46 32v56M33 32l-5 56M59 32l5 56" stroke="#5c4522" stroke-width="2"/>'
 +'<ellipse class="ember" cx="46" cy="76" rx="5" ry="3" fill="#ff7a3a"/><rect x="16" y="88" width="60" height="9" rx="3" fill="url(#d220g)"/><rect x="24" y="97" width="44" height="6" rx="2" fill="#3a2912"/></svg>';

X.TIPS=[
 {k:'refine',ic:'⚒️',t:'ตีบวกอาวุธและชุด',d:()=>'ไปหาช่างตีเหล็กใน'+X.TOWN+' ของที่ตีบวกแล้วแรงและทนขึ้น'},
 {k:'stat',ic:'📈',t:'อัปสเตตัส',d:()=>{let n=0;try{n=P.statPts|0}catch(_){}return n>0?'มีแต้มสเตตัสเหลือ '+n+' แต้ม ยังไม่ได้ใช้':'ได้แต้มทุกครั้งที่เลเวลขึ้น อย่าลืมกดเพิ่ม'}},
 {k:'gear',ic:'🛡️',t:'สวมใส่ชุดป้องกัน',d:()=>'ใส่หมวก เสื้อ รองเท้าให้ครบทุกช่อง จะรับดาเมจน้อยลง'},
 {k:'skill',ic:'✨',t:'อัปสกิล',d:()=>{let n=0;try{n=P.skillPts|0}catch(_){}return n>0?'มีแต้มสกิลเหลือ '+n+' แต้ม ยังไม่ได้ใช้':'เพิ่มเลเวลสกิลและติดตั้งลงช่องสกิล'}}];
X.after=null;X.picked=null;
function pick(k){try{X.picked=k;X.after=k;document.getElementById('bRevive').click();let n=0;const iv=setInterval(()=>{n++;try{const ov=document.getElementById('over');if(ov&&ov.hidden&&G.zone==='sylva_lab'){clearInterval(iv);setTimeout(()=>{try{const a=X.after;X.after=null;
   if(a==='stat'||a==='gear')openWin('wInv');else if(a==='skill')openWin('wSkill');else if(a==='refine')log('⚒️ ช่างตีเหล็กอยู่หน้าโรงตีเหล็กใน'+X.TOWN+' เข้าไปคุยเพื่อตีบวกของ')}catch(e){X.err='after '+e.message}},1400)}else if(n>60)clearInterval(iv)}catch(_){}},250)}catch(e){X.err='pick '+e.message}}
function tips(anchor){let h=document.getElementById('d220tipsH');if(!h){h=document.createElement('div');h.id='d220tipsH';h.textContent='หนทางแข็งแกร่งขึ้น แตะเพื่อคืนชีพแล้วไปทำเลย';anchor.insertAdjacentElement('afterend',h)}
 let t=document.getElementById('d220tips');if(!t){t=document.createElement('div');t.id='d220tips';h.insertAdjacentElement('afterend',t);X.TIPS.forEach(q=>{const b=document.createElement('button');b.type='button';b.dataset.k=q.k;b.innerHTML='<span class="ic">'+q.ic+'</span><span><b>'+q.t+'</b><i></i></span><span class="go">›</span>';b.addEventListener('click',ev=>{ev.stopPropagation();pick(q.k)});t.appendChild(b)})}
 X.TIPS.forEach(q=>{const i=t.querySelector('button[data-k="'+q.k+'"] i'),v=q.d();if(i&&i.textContent!==v)i.textContent=v});return t}
function dress(){try{const ov=document.getElementById('over');if(!ov||ov.hidden)return;const c=ov.querySelector('.ovc'),h=ov.querySelector('h1.dead'),sub=document.getElementById('overSub'),b=document.getElementById('bRevive');if(!c||!h||!sub||!b)return;
  ov.classList.add('d220');if(!document.getElementById('d220lan'))c.insertAdjacentHTML('afterbegin',LAN);
  if(h.textContent!==X.TITLE)h.textContent=X.TITLE;
  let lvl=1,z='',cost=0;try{lvl=P.lvl|0;z=thName(G.zone);cost=Math.min(P.exp|0,Math.round(need(P.lvl)*.05))}catch(_){}
  const s=X.DESC;if(sub.textContent!==s)sub.textContent=s;let wz=document.getElementById('d220where');if(!wz){wz=document.createElement('div');wz.id='d220where';sub.insertAdjacentElement('afterend',wz)}const wt='ล้มลงที่ '+z+' · Lv '+lvl;if(wz.textContent!==wt)wz.textContent=wt;
  const tp=tips(wz);let k=document.getElementById('d220cost');if(!k){k=document.createElement('div');k.id='d220cost';tp.insertAdjacentElement('afterend',k)}
  const kt=cost>0?'คืนชีพแล้วเสีย EXP '+cost.toLocaleString('en-US')+' (5% ของเลเวลนี้)':'คืนชีพครั้งนี้ไม่เสีย EXP';if(k.textContent!==kt)k.textContent=kt;
  const bt='<small>คืนชีพที่</small>'+X.TOWN;if(b.dataset.d220!==bt){b.dataset.d220=bt;b.innerHTML=bt}
  X.shown++}catch(e){X.err=e.message}}
setInterval(dress,250);
try{const _l=log;log=function(m){try{if(typeof m==='string'&&/^คืนชีพที่ (Capital City|Map 1)/.test(m))arguments[0]=m.replace(/^คืนชีพที่ (Capital City|Map 1)/,'คืนชีพที่'+X.TOWN)}catch(_){}return _l.apply(this,arguments)}}catch(e){X.err='log '+e.message}
try{const h=document.getElementById('setKillHint');if(h)h.textContent=h.textContent.replace('คืนชีพที่เมืองหลวง','คืนชีพที่'+X.TOWN)}catch(_){}
})();

