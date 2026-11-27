
/* ---- scygame-r1 (TEST r6q, 10 Nov 2026): wires scythe_module_r2 (scy_fx.js + scy_skills.js) into the game ----
   13 new scythe skills behind the scythe weapon, same pattern as Death Moon: rows in the weapon skill window (__WSK.lines.scythe), levels / points from __SKUP (Lv1-5 usable),
   keys, cooldown mirrored into P.cds. Attack skills (Soul Reap, Scythe Storm, Flying Scythe) / buffs (Bloodlust, Reaper Form, Scream, Blood Pact, Soul Armor) / passives (Harvest,
   Pain Power, Moon Edge, Spirit Boost, Won't Die). Damage goes through the game's own combat (C182 ctx per hit, dark element; undead x0.25, light x1.5), numbers shown by the game.
   Hooks: update (SCY.update, hero held in place while SCY.locked(), monster fear / slow / no-attack), render parts (SCY.draw back / front), hurtPlayer (Soul Armor DEF % + shield),
   recalc (Spirit Boost), hitEnemy (basic scythe hits: Bloodlust / Won't Die lifesteal, Blood Pact / Pain Power damage), killEnemy (Harvest), puppet pose (window.SCYG.pose, read by the puppet glue).
   Flag ?scyskills=off. Debug: window.SCYG. ---- */
(function(){'use strict';
const Q=String(location.search),G0=window.SCYG={ver:'scygame-r1',err:null,on:!/[?&]scyskills=off\b/.test(Q),pose:null,log:[],casts:{},hits:0,dmg:0,skills:{}};
const ERR=(w,e)=>{G0.err=w+': '+((e&&e.message)||e);try{console.error('[SCYG]',w,e)}catch(_){}};
if(!window.SCY||!window.SCY_FX){G0.err='module missing';return}
if(!G0.on){try{window.SCY.cfg.enabled=false}catch(_){}return}
const SCY=window.SCY,clampN=(v,a,b)=>Math.max(a,Math.min(b,v));
const held=()=>!!(P&&P.weapon&&P.weapon.t==='scythe');
const playing=()=>G.state==='play'&&!P.dead&&!G.win&&!G.edit;
/* ---------------------------------------------------------------- adapter */
let inSkillHit=false,lastDmg=0;
function mobInfoOf(e){try{return typeof mobInfo==='function'?mobInfo(e):{}}catch(_){return {}}}
function skillHit(e,pct,info){
  const hp0=e.hp;let ok=false;
  try{
    const A=C182.api,wd=(A.D().weapons.scythe||A.D().weapons.sword),basic=wd.actionCoef*wd.weights.reduce((a,b)=>a+b,0);
    let ea=1;try{const X=mobInfoOf(e);if(X.race==='undead'||X.ele==='undead')ea=.25;else if(X.ele==='holy'||e.elem==='Light')ea=1.5}catch(_){}
    const id='scy_'+((info&&info.skill)||'x'),def={id,mode:'native',coefTotal:basic*pct/100*ea,flatTotal:0,weights:[1],schedule:[0],maxTargets:1,targeting:'around',element:'Neutral'};
    const c=A.ctxFor('skill',id,def,{dt:'phys',lvScale:1,m0:1,reach:9999,cdId:'scyX'});
    inSkillHit=true;
    hitEnemy(e,1,{dt:'phys',ctx:c,pl:(typeof THEMES!=='undefined'&&THEMES.void)||undefined});ok=true;
  }catch(er){ERR('hit',er)}finally{inSkillHit=false}
  const d=Math.max(0,hp0-Math.max(0,e.hp));G0.hits++;G0.dmg+=d;lastDmg=d;return d}
function dirOf(){try{return Math.cos(P.face)<0?-1:1}catch(_){return -1}}
function heroH(){try{const X=window.PUPPETX;return X&&X.cfg?X.cfg.TARGET_H*X.cfg.H_FACTOR:135}catch(_){return 135}}
const ADAPT={K:.5,
  hero:()=>({x:P.x,y:P.y,dir:dirOf(),hp:P.hp,hpMax:P.maxHp,mp:P.mp}),
  mobs:()=>{const L=[];for(const e of enemies){if(e.dead||!(e.hp>0))continue;
      if(!('boss' in e))Object.defineProperty(e,'boss',{get(){return !!(this.m&&this.m.boss)},configurable:true,enumerable:false});
      if(!('elite' in e))Object.defineProperty(e,'elite',{get(){return !!(this.m&&this.m.elite)||!!this.eliteX},configurable:true,enumerable:false});
      if(!('h' in e))Object.defineProperty(e,'h',{get(){return (this.sz||20)*2.6},configurable:true,enumerable:false});
      L.push(e)}return L},
  hit:(m,pct,info)=>skillHit(m,pct,info),
  heal:(amt,info)=>{if(P.dead)return;const h0=P.hp;P.hp=Math.min(P.maxHp,P.hp+amt);const d=P.hp-h0;if(d>=1){try{textAt(P.x,P.y-70,'+'+fmt(Math.round(d)),'#8dffc8',13,{life:.7})}catch(_){}}},
  spendHP:n=>{P.hp=Math.max(1,P.hp-n)},spendMP:n=>{P.mp=Math.max(0,P.mp-n)},
  moveMob:(m,dx,dy)=>{m.x+=dx;m.y+=dy},
  onPose:(kind,dur,o)=>{G0.pose={kind,dur,spin:!!(o&&o.spin),start:time}},
  onCast:(id,L)=>{G0.casts[id]=(G0.casts[id]||0)+1;try{G0.lastCast={id,L,t:time}}catch(_){}},
  onBuff:(id,v)=>{try{if(window.recalc)recalc()}catch(_){}}};
try{SCY.init(ADAPT);SCY.cfg.bodyScale=heroH()/62;SCY.cfg.heroH=heroH()}catch(e){ERR('init',e)}
/* ---------------------------------------------------------------- skill table: keys, rows, icons */
const SU=()=>window.__SKUP;
const DEF=[
 {id:'soulreap',k:'scy_soulreap',row:0,col:0,th:'เกี่ยววิญญาณ',ic:'#a97bff',g:'☽'},
 {id:'storm',k:'scy_storm',row:1,col:0,th:'พายุเคียว',ic:'#7f8bff',g:'꩜'},
 {id:'flying',k:'scy_flying',row:2,col:0,th:'เคียวบิน',ic:'#c86bff',g:'✦'},
 {id:'bloodlust',k:'scy_bloodlust',row:0,col:1,th:'กระหายเลือด',ic:'#e0245e',g:'♥'},
 {id:'reaper',k:'scy_reaper',row:1,col:1,th:'ร่างยมทูต',ic:'#6a4cff',g:'☠'},
 {id:'scream',k:'scy_scream',row:2,col:1,th:'กรีดร้อง',ic:'#ff8fc0',g:'!'},
 {id:'bloodpact',k:'scy_bloodpact',row:3,col:1,th:'สัญญาเลือด',ic:'#b01040',g:'✚'},
 {id:'soularmor',k:'scy_soularmor',row:4,col:1,th:'เกราะวิญญาณ',ic:'#4c63d8',g:'◈'},
 {id:'harvest',k:'scy_harvest',row:0,col:2,pas:1,th:'เก็บเกี่ยว',ic:'#7ad8c0',g:'✿'},
 {id:'pain',k:'scy_pain',row:1,col:2,pas:1,th:'พลังแห่งความเจ็บปวด',ic:'#e0245e',g:'▲'},
 {id:'moonedge',k:'scy_moonedge',row:2,col:2,pas:1,th:'คมจันทร์',ic:'#8fa6ff',g:'☾'},
 {id:'spirit',k:'scy_spirit',row:3,col:2,pas:1,th:'วิญญาณเสริม',ic:'#4cc97a',g:'❖'},
 {id:'wontdie',k:'scy_wontdie',row:4,col:2,pas:1,th:'ไม่ยอมตาย',ic:'#ff4f8f',g:'⚑'}];
const byId={};DEF.forEach(d=>byId[d.id]=d);
function icon(d){try{const c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d');
  const rr=(x,y,w,h,r)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()};
  const bg=g.createRadialGradient(48,44,6,48,48,70);bg.addColorStop(0,d.ic);bg.addColorStop(1,'#120a2c');rr(3,3,90,90,13);g.fillStyle=bg;g.fill();
  g.fillStyle='rgba(255,255,255,.92)';g.font='bold 46px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.shadowColor='#000';g.shadowBlur=6;g.fillText(d.g,48,50);g.shadowBlur=0;
  const fr=g.createLinearGradient(0,0,96,96);fr.addColorStop(0,'#e3a14a');fr.addColorStop(1,'#8a4f1a');rr(3,3,90,90,13);g.lineWidth=5;g.strokeStyle=fr;g.stroke();return c.toDataURL('image/png')}catch(_){return null}}
const lvOf=d=>{try{const u=SU();const v=u&&u.lv?(u.lv(d.k)|0):0;return clampN(v||1,1,5)}catch(_){return 1}};
const open=d=>{try{const u=SU();return !u||!u.need||(P.lvl|0)>=u.need(d.k)}catch(_){return true}};
const toast=(m,c)=>{try{textAt(P.x,P.y-62,m,c||'#d8c9ff',13)}catch(_){}};
function aimGround(){try{const t=(typeof aimPoint==='function')?aimPoint(400):null;if(t&&isFinite(t.x))return t}catch(_){}return {x:P.x+dirOf()*280,y:P.y}}
function cast(id){const d=byId[id];if(!d||d.pas)return false;
  if(!held()){toast('ต้องถือเคียว');return false}if(!playing())return false;
  if(!open(d)){toast('ยังไม่ปลดล็อก');return false}
  const L=lvOf(d),opt={};
  if(id==='flying'){const t=aimGround(),dx=t.x-P.x,dy=t.y-P.y,l=Math.hypot(dx,dy)||1,k=Math.min(1,400/l);opt.tx=P.x+dx*k;opt.ty=P.y+dy*k;P.face=Math.atan2(dy,dx)}
  else if(id==='soulreap'||id==='storm'){try{const t=aimGround();P.face=Math.atan2(t.y-P.y,t.x-P.x)}catch(_){}}
  const why=SCY.cast(id,L,opt);
  if(why){if(why==='mp')toast('MP ไม่พอ','#7fc8ff');else if(why==='cd')toast('คูลดาวน์','#8fa4cc');return false}
  try{if(window.__WSK&&__WSK.log)__WSK.log.push({k:d.k,L,t:time})}catch(_){}return true}
G0.cast=cast;G0.lvOf=id=>lvOf(byId[id]);
/* ---------------------------------------------------------------- skill window rows */
function descOf(d){const T=SCY.TAB[d.id],P5=SCY.PAS[d.id],L=lvOf(d),f=(a)=>a;let s='';
  try{
  switch(d.id){
   case 'soulreap':s='ฟันเคียวรอบตัวเป็นวงกลมเต็ม รัศมี '+T.r(L)+' px (สูงสุด '+T.max+' ตัว) ฮิตตรง '+T.direct(L)+'% ของตีปกติ'+(T.second(L)?' + ฮิตกวาดกลับ '+T.second(L)+'%':'')+(T.bleed(L)?'\nเลือดไหล '+T.bleed(L)+'% ต่อวินาที นาน '+T.bleedT(L)+' วิ':'')+' · ธาตุมืด · MP '+T.mp(L)+' · คูลดาวน์ '+T.cd+' วิ';break;
   case 'storm':s='หมุนเคียวเป็นพายุรอบตัว รัศมี '+T.r(L)+' px ดูดมอนเข้าหา '+T.pull+' px ('+T.n(L)+' ฮิต ฮิตละ '+T.pct(L)+'% ของตีปกติ)'+(T.walk(L)?'\nเดินได้ระหว่างหมุน':'\nยืนนิ่งระหว่างหมุน (เดินได้ตั้งแต่ Lv5)')+' · ธาตุมืด · MP '+T.mp(L)+' · คูลดาวน์ '+T.cd+' วิ';break;
   case 'flying':s='ขว้างเคียวไปยังจุดที่เลือก (ไกลสุด '+T.range+' px ปกติ '+T.def+' px) เกิดพายุเคียวรัศมี '+T.R(L)+' px นาน '+T.dur(L)+' วิ ฟันแรก '+T.slash(L)+'% + '+T.ticks(L)+' ติ๊กๆ ละ '+T.tick(L)+'% ดูดมอน '+T.pullV+' px/วิ (อีลิทครึ่งหนึ่ง บอสไม่ถูกดูด)'+(T.slow(L)?' ช้าลง '+Math.round(T.slow(L)*100)+'%':'')+' · MP '+T.mp(L)+' · คูลดาวน์ '+T.cd+' วิ';break;
   case 'bloodlust':s='ดูดเลือดจากดาเมจเคียว +'+T.v(L)+'% นาน '+T.dur(L)+' วิ · MP '+T.mp(L)+' · คูลดาวน์ '+T.cd+' วิ · ดูดเลือดไม่เกิน 1.5% ต่อฮิต 4% ต่อการกวาด 8% ต่อวินาที';break;
   case 'reaper':s='ร่างยมทูต: รัศมีโจมตี +'+T.rad(L)+'% ความเร็วโจมตี +'+T.as(L)+'% นาน '+T.dur(L)+' วิ · MP '+T.mp(L)+' · คูลดาวน์ '+T.cd+' วิ';break;
   case 'scream':s='กรีดร้อง รัศมี '+T.R(L)+' px มอนกลัววิ่งหนีไม่โจมตี '+T.fear(L)+' วิ แล้วช้าลง '+T.slow(L)+'% อีก '+T.slowT+' วิ · MP '+T.mp(L)+' · คูลดาวน์ '+T.cd+' วิ';break;
   case 'bloodpact':s='เสียเลือด '+T.cost(L)+'% MaxHP ทันที แล้วดาเมจ +'+T.up(L)+'% นาน '+T.dur(L)+' วิ · MP '+T.mp(L)+' · คูลดาวน์ '+T.cd+' วิ';break;
   case 'soularmor':s='เกราะวิญญาณ ดูดซับ '+T.armor(L)+' ดาเมจ (+10% ต่อเลเวล) และลดดาเมจที่ได้รับ '+T.def(L)+'% นาน '+T.dur(L)+' วิ · MP '+T.mp(L)+' · คูลดาวน์ '+T.cd+' วิ';break;
   case 'harvest':s='ฆ่ามอนฟื้น HP '+P5.v(L)+'% ของ MaxHP';break;
   case 'pain':s='HP ≤ 20% ดาเมจ +'+P5.v(L)+'%';break;
   case 'moonedge':s='ต่อเป้าหมายเพิ่มเติมที่โดนในท่าเดียว ดาเมจ +'+P5.v(L)+'% (สูงสุด 4 ตัวเพิ่ม)';break;
   case 'spirit':s='MaxHP +'+P5.v(L)+'%';break;
   case 'wontdie':s='HP < '+Math.round(P5.th(L)*100)+'% ดูดเลือด ×'+P5.v(L);break}
  }catch(e){s=''}
  return s+'\nค่าทดลอง ยังไม่ผ่านการเล่นจริง · Lv6-10 ยังไม่เปิดในเกม'}
function register(){const W_=window.__WSK;if(!(W_&&W_.lines&&W_.lines.scythe))return false;const cols=W_.lines.scythe.cols;if(G0.registered)return true;
  for(const d of DEF){const ent={k:d.k,name:d.th,type:d.pas?'passive':'active',row:d.row,ok:()=>G0.on&&SCY.cfg.enabled&&!!SCY_FX,icon:()=>G0.skills[d.id]&&G0.skills[d.id].icon||null,desc:()=>descOf(d)};
    if(!d.pas){ent.key=d.key;ent.cdId='scy_'+d.id;ent.cost=()=>({mp:SCY.mpCost(d.id,lvOf(d)),cd:SCY.TAB[d.id].cd});ent.start=()=>cast(d.id)}
    G0.skills[d.id]={icon:(window.SCYICONS&&SCYICONS[d.id])||icon(d),ent};cols[d.col].skills.push(ent)}
  for(const c of cols)c.skills.sort((a,b)=>(a.row|0)-(b.row|0));for(const k of ['scy_nh','scy_dm']){const e=entOf(k);if(e){e.key='';const ic=window.SCYICONS&&SCYICONS[k==='scy_nh'?'nh':'dm'];if(ic)e.icon=()=>ic}}G0.registered=true;return true}
/* ---------------------------------------------------------------- skill slots: the SAME hotbar as the other weapons (r6q2). No fixed keys any more. Template = the dagger slot module (own map per weapon, painted onto #bar .slot / #tSkills .tsk
   while the weapon is held, keys 1-6 Q E R F, cooldown on the slot, right-click clears, "ใส่ช่องสกิล" in the weapon skill window, map in localStorage 'lanternfall_scytheSlots_v1').
   Slottable: the 8 new actives + Night Harvest (scy_nh) + Death Moon (scy_dm), whose old fixed keys R / N and floating buttons are switched off. Passives are not slottable. */
window.__SCYKEY='';try{if(window.__SCY&&__SCY.dm&&__SCY.dm.tbl)__SCY.dm.tbl.key=''}catch(_){}
try{const st=document.createElement('style');st.textContent='#scyBtn,#scyDmBtn{display:none!important}#wWpnSk.scy #wskAs{display:inline-block!important}';document.head.appendChild(st)}catch(_){}
const SLOT_K=['1','2','3','4','5','6','q','e','r','f'];
const SS=G0.slots={map:{},assign:null,err:null};
try{SS.map=JSON.parse(localStorage.getItem('lanternfall_scytheSlots_v1')||'{}')||{}}catch(_){SS.map={}}
const SKEYS=DEF.filter(d=>!d.pas).map(d=>d.k).concat(['scy_nh','scy_dm']);
for(const i in SS.map)if(!SKEYS.includes(SS.map[i])||+i<0||+i>9)delete SS.map[i];
SS.save=()=>{try{localStorage.setItem('lanternfall_scytheSlots_v1',JSON.stringify(SS.map))}catch(_){}};
SS.find=k=>{for(const i in SS.map)if(SS.map[i]===k)return +i;return -1};
const entOf=k=>{try{const cols=__WSK.lines.scythe.cols;for(const c of cols)for(const s of c.skills)if(s.k===k)return s}catch(_){}return null};
const eq=()=>!!(window.__WSK&&__WSK.public&&held());
const unl=ent=>{try{return !!ent&&ent.ok()&&(!SU()||!SU().need||(P.lvl|0)>=SU().need(ent.k))}catch(_){return false}};
let msgEl=null;function say(t,ms){msgEl=msgEl||document.getElementById('wsAssignMsg');if(!msgEl)return;msgEl.textContent=t;msgEl.style.display='block';clearTimeout(say.t);if(ms)say.t=setTimeout(()=>{msgEl.style.display='none'},ms)}
SS.start=k=>{SS.assign=k;document.body.classList.add('wsAssign');document.body.classList.add('wsAsNoR');const e=entOf(k);say('แตะช่องสกิลที่ต้องการวาง "'+(e?e.name:k)+'" · แตะนอกช่องเพื่อยกเลิก',0)};
SS.stop=()=>{SS.assign=null;document.body.classList.remove('wsAssign','wsAsNoR');if(msgEl)msgEl.style.display='none'};
SS.set=(i,k)=>{const o=SS.find(k);if(o>=0)delete SS.map[o];SS.map[i]=k;SS.save();repaint(true);return true};
SS.clear=i=>{delete SS.map[i];SS.save();repaint(true)};
SS.use=k=>{const e=entOf(k);if(!e)return false;if(!eq()||!playing())return false;
  if(!unl(e)){toast('ยังไม่ปลดล็อก');return false}try{e.start();return true}catch(er){SS.err='use '+er.message;return false}};
try{const win=document.getElementById('wWpnSk');if(win)win.addEventListener('click',e=>{if(!eq()||!e.target.closest('#wskAs'))return;
  const sel=win.querySelector('.row.sel'),kk=sel&&sel.dataset.k;if(!kk||!SKEYS.includes(kk))return;const en=entOf(kk);if(!en||en.type!=='active'||!unl(en))return;
  e.stopImmediatePropagation();e.preventDefault();try{if(G.win==='wWpnSk')closeWin()}catch(_){}SS.start(kk)},true)}catch(e){ERR('assign',e)}
setInterval(()=>{try{const as=document.getElementById('wskAs');if(!as||!eq()||!(window.__WSK&&__WSK.open))return;const sel=document.querySelector('#wWpnSk .row.sel'),kk=sel&&sel.dataset.k;
  if(kk&&SKEYS.includes(kk)){const at=SS.find(kk),t=at>=0?'ช่อง '+SLOT_K[at].toUpperCase()+' · ย้าย':'ใส่ช่องสกิล';if(as.textContent!==t)as.textContent=t}}catch(_){}},250);
const slotEl=e=>e.target&&e.target.closest&&e.target.closest('#bar .slot[data-i]:not(.pot),#tSkills .tsk[data-ti]');
const slIdx=el=>+(el.dataset.i!==undefined?el.dataset.i:el.dataset.ti);
for(const ev of ['pointerdown','click','contextmenu'])addEventListener(ev,e=>{try{
  if(SS.assign){if(ev==='contextmenu')return;e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();if(ev==='pointerdown')return;const el=slotEl(e);if(el){if(SS.set(slIdx(el),SS.assign))SS.stop()}else SS.stop();return}
  const el=slotEl(e);if(!el||!el.dataset.scs||!eq())return;
  if(ev==='contextmenu'){e.preventDefault();e.stopImmediatePropagation();SS.clear(slIdx(el));return}
  e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();
  if(ev==='pointerdown'){SS.use(el.dataset.scs);if(el.classList.contains('tsk')){el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),350)}}
}catch(er){SS.err='slot '+er.message}},true);
addEventListener('keydown',e=>{try{if(e.key==='Escape'&&SS.assign){SS.stop();return}
  if(!eq()||(window.__WSK&&__WSK.open)||G.win||G.state!=='play'||e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;const k=(e.key||'').toLowerCase(),i=SLOT_K.indexOf(k);if(i<0)return;const sk=SS.map[i];if(!sk)return;
  if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))return;e.stopImmediatePropagation();e.preventDefault();SS.use(sk)}catch(er){SS.err='slot key '+er.message}},true);
function paint(el,k){if(el.dataset.scs===k)return;const en=entOf(k);if(!en)return;const im=en.icon(),ki=el.querySelector('kbd'),kt=ki?ki.textContent:'';
  el.innerHTML=(im?'<img alt="'+en.name+'" src="'+im+'">':'<div class="wstx">'+en.name+'</div>')+'<div class="cd"></div><div class="cdt"></div>'+(kt?'<kbd>'+kt+'</kbd>':'');
  el.classList.add('wsk');el.dataset.scs=k;delete el.dataset.ws;delete el.dataset.bs;delete el.dataset.ss;delete el.dataset.dgs;if(el.classList.contains('tsk'))el.setAttribute('data-sk','scs:'+k);else el.removeAttribute('data-sk');el.removeAttribute('draggable');el.title=en.name}
let wasOn=false,sigS='';
function repaint(force){const on=eq();
  if(!on){if(wasOn){wasOn=false;sigS='';for(const el of document.querySelectorAll('[data-scs]')){delete el.dataset.scs;el.classList.remove('wsk')}try{buildBar()}catch(_){}try{if(typeof buildTouchSkills==='function')buildTouchSkills()}catch(_){}}return}
  const s=JSON.stringify(SS.map);if(force||!wasOn||s!==sigS){wasOn=true;sigS=s;try{buildBar()}catch(_){}try{if(typeof buildTouchSkills==='function')buildTouchSkills()}catch(_){}}
  for(const el of document.querySelectorAll('#bar .slot[data-i],#tSkills .tsk[data-ti]')){const i=slIdx(el),k=SS.map[i];if(k)paint(el,k)}}
function paintAll(){try{if(eq())for(const el of document.querySelectorAll('#bar .slot[data-i],#tSkills .tsk[data-ti]')){const k=SS.map[slIdx(el)];if(k)paint(el,k)}}catch(_){}}
try{const _bb=buildBar;buildBar=function(){const r=_bb.apply(this,arguments);paintAll();return r}}catch(e){ERR('bar hook',e)}
try{const _bt=buildTouchSkills;buildTouchSkills=function(){const r=_bt.apply(this,arguments);paintAll();return r}}catch(e){ERR('touch hook',e)}
setInterval(()=>{try{if(SS.assign&&(G.win||G.state!=='play'))SS.stop();repaint(false);if(!eq())return;
  for(const el of document.querySelectorAll('.slot.wsk[data-scs],.tsk.wsk[data-scs]')){const k=el.dataset.scs,en=entOf(k);if(!en)continue;const ok=unl(en);el.classList.toggle('wsoff',!ok);
    let c=null;try{c=en.cost()}catch(_){}const cd=(P.cds&&P.cds[en.cdId])||0,cdE=el.querySelector('.cd'),tE=el.querySelector('.cdt');
    if(cdE)cdE.style.setProperty('--cd',ok&&c&&cd>0?Math.min(1,cd/c.cd):0);if(tE)tE.textContent=ok&&cd>0?(cd>=10?String(Math.ceil(cd)):cd.toFixed(1)):'';el.classList.toggle('nomp',!!(c&&P.mp<c.mp));
    el.classList.toggle('wson',!!(SCY.mods().buffs[k.replace('scy_','')]))}
}catch(e){SS.err='slot tick '+e.message}},120);
/* ---------------------------------------------------------------- per-frame hooks */
let basePasSig='',rangeBase=null;
function syncPassives(){try{const sg=[];for(const d of DEF){if(!d.pas)continue;const L=open(d)&&held()?lvOf(d):0;SCY.setPassive(d.id,L);sg.push(L)}const s=sg.join();if(s!==basePasSig){basePasSig=s;try{recalc()}catch(_){}}}catch(e){ERR('passives',e)}}
function mirrorCd(){try{P.cds=P.cds||{};for(const id of SCY.ids)P.cds['scy_'+id]=SCY.cdLeft(id)}catch(_){}}
function mobStatus(dt){for(const e of enemies){if(e.dead)continue;const s=SCY.mob(e);
    if(!s){if(e._scyG){e.sp=e._scyG.sp0;e._scyG=null}continue}
    if(!e._scyG)e._scyG={sp0:e.sp};e.sp=e._scyG.sp0*(1-clampN(s.slow||0,0,.9));
    if(s.fear){e.st=e.st||{};e.st.fear=Math.max(typeof e.st.fear==='number'?e.st.fear:0,.2)}
    if(s.noAttack){e.wind=0;e.atkCd=Math.max(e.atkCd||0,.3)}}}
try{const _u=update;update=function(dt){
  if(!G0.on||!SCY.cfg.enabled||typeof P==='undefined'||!P)return _u.apply(this,arguments);
  let x0=P.x,y0=P.y,lock=false;
  try{lock=SCY.locked();syncPassives();mobStatus(dt);
    const m=SCY.mods(),asp=m.aspd||1;if(asp>1&&P.atkCd>0)P.atkCd=Math.max(0,P.atkCd-dt*(asp-1));
    try{const w=WEAPONS.scythe;if(w){if(rangeBase===null)rangeBase=w.range;w.range=rangeBase*(m.range||1)}}catch(_){}}catch(e){ERR('pre',e)}
  const r=_u.apply(this,arguments);
  try{if(lock&&!P.dead){P.x=x0;P.y=y0;P.vx=0;P.vy=0}
    if(G.state==='play'){SCY.update(dt);mirrorCd();const sh=SCY.shake();if(sh>0)G.shake=Math.max(G.shake||0,sh)}}catch(e){ERR('post',e)}
  return r}}catch(e){ERR('hook update',e)}
try{const _b=drawBeacons;drawBeacons=function(){const r=_b.apply(this,arguments);try{if(G0.on&&SCY.cfg.enabled)SCY.draw(ctx,'back')}catch(e){ERR('draw back',e)}return r}}catch(e){ERR('hook back',e)}
try{const _p=drawParts;drawParts=function(){const r=_p.apply(this,arguments);try{if(G0.on&&SCY.cfg.enabled)SCY.draw(ctx,'front')}catch(e){ERR('draw front',e)}return r}}catch(e){ERR('hook front',e)}
/* hero damage: Soul Armor DEF % then shield */
try{const _h=hurtPlayer;hurtPlayer=function(raw,src){try{if(G0.on&&SCY.cfg.enabled&&P&&!P.dead&&raw>0){const m=SCY.mods();if(m.defPct)raw=raw*(1-m.defPct/100);raw=SCY.absorb(raw);if(raw<=0)return}}catch(e){ERR('hurt',e)}return _h.call(this,raw,src)}}catch(e){ERR('hook hurt',e)}
/* Spirit Boost: MaxHP + % (after every recalc) */
try{const _rc=recalc;recalc=function(){const r=_rc.apply(this,arguments);try{if(G0.on&&SCY.cfg.enabled&&P&&held()){const p=SCY.mods().maxHpPct;if(p>0){P.maxHp=Math.round(P.maxHp*(1+p/100));if(P.hp>P.maxHp)P.hp=P.maxHp}}}catch(e){ERR('recalc',e)}return r}}catch(e){ERR('hook recalc',e)}
/* basic scythe hits: Blood Pact / Pain Power damage, Bloodlust / Won't Die lifesteal, Moon Edge is per skill cast */
try{const _he=hitEnemy;hitEnemy=function(e,m,o){let basic=false;
  try{if(G0.on&&SCY.cfg.enabled&&!inSkillHit&&held()&&e&&!e.dead&&time-(G.basicT||-9)<.3&&!(o&&(o.dot||o.echo))){basic=true;const bm=SCY.basicMul();if(bm>1)m=m*bm}}catch(er){ERR('basic pre',er)}
  const r=_he.call(this,e,m,o);
  try{if(basic&&r)SCY.onBasicHit(e,100)}catch(er){ERR('basic post',er)}return r}}catch(e){ERR('hook hitEnemy',e)}
try{const _k=killEnemy;killEnemy=function(e){const was=e&&e.dead;const r=_k.apply(this,arguments);try{if(G0.on&&SCY.cfg.enabled&&e&&!was&&e.dead&&held())SCY.onKill(e)}catch(er){ERR('kill',er)}return r}}catch(e){ERR('hook kill',e)}
/* ---------------------------------------------------------------- registration retries + debug */
const iv=setInterval(()=>{try{if(register())clearInterval(iv)}catch(e){ERR('register',e)}},500);
/* Art icons for the special skills that had none (window.SPSK shows 'waiting for icon'): Sakura Blade + Demon Domain. Guardian 18 icon: skill_icons_r2. */
const iv2=setInterval(()=>{try{if(window.SPSK&&SPSK.setIcon&&window.SCYICONS){SPSK.setIcon('sak',SCYICONS.sak);SPSK.setIcon('dd',SCYICONS.dd);if(SCYICONS.g18)SPSK.setIcon('g18',SCYICONS.g18);G0.spIcons=true}
  if(window.SCYICONS){let n=0;for(const [id,k] of [['sakBtn','sak'],['ddBtn','dd'],['g18Btn','g18']]){const b=document.getElementById(id);if(!b){continue}n++;if(!b.querySelector('img.scyIc')){const im=document.createElement('img');im.className='scyIc';im.alt='';im.src=SCYICONS[k];im.style.cssText='position:absolute;inset:3px;width:calc(100% - 6px);height:calc(100% - 6px);border-radius:50%;object-fit:cover;pointer-events:none;z-index:0';b.insertBefore(im,b.firstChild)}}
    if(n===3&&G0.spIcons)clearInterval(iv2)}}catch(e){ERR('spsk icons',e)}},700);
G0.state=()=>({err:G0.err,casts:G0.casts,hits:G0.hits,dmg:G0.dmg,active:SCY.active(),mods:SCY.mods(),registered:!!G0.registered});
console.info('[SCYG] scythe skills wired · '+DEF.length+' skills · flag ?scyskills=off');
})();
