
/* ---- race-r1 (TEST, 11 Nov 2026): race lore panel + player.race + dialogue "if":"race=..." (RACE_LORE_v1, DeaRz approved 00:04) ----
   1. Character creator (and the in-game dressing room): the race info panel under the race buttons shows section 1 "ที่มาแต่ละเผ่า" of RACE_LORE_v1.md exactly as written, one block per race (human / demon / elf / cat), updating with the selected race.
   2. player.race = human | demon | elf | cat: ALIAS of the creator's own field P.pLook.race (already saved per character slot in the save json + slot, old saves default to human): P.race is kept in sync every 250 ms, window.__RACE_NOW() reads it. No second copy is stored.
   3. Dialogue engine: a line's "if" now accepts "race=demon|elf|cat" (alternatives with |) and "!" negation ("!race=human"), together with the existing "&" / "done:<quest>" / flag conditions (base patch of the quest engine's condOk, see build). window.RACE.cond(str, flags) is the same grammar for other modules (town NPCs).
   4. ?racetest=on: talking to any existing NPC shows 2 sample lines from RACE_LORE section 2 (Ora's first greeting) and 2.1 (Varg defeated) picked by the hero's race (RACETEST.pick(race) for tests); real lines come with the Story drop.
   Flags: ?racelore=off hides the panel. Debug: window.RACE. ---- */
(function(){'use strict';
const Q=String(location.search);
const R=window.RACE={ver:'race-r1',err:null,lore:{
 human:'<b>มนุษย์</b> — มาจากหุบเขาใจกลางแดนตะเกียง (แมพ 1–10) มีมากที่สุด ทำนา ค้าขายเก่ง สร้างเมืองใหญ่อย่าง Astoria ที่ทุกเผ่ามาพบกัน ปรับตัวได้ทุกทาง (= แต้มอิสระ 4 แต้ม)',
 demon:'<b>ปีศาจ</b> — มาจากแดนภูเขาไฟเอมเบอร์โฮลด์ทางใต้ (แมพ 15–18) ช่างแร่ ช่างไฟ นักรบภูเขา ขุดและตีเหล็กดำมาหลายชั่วคน อ่านรอยบนเหล็กดำได้ เขาเล็กกับหางเป็นเรื่องปกติของเผ่า · คำว่า "ปีศาจ" มาจากคนเมืองที่กลัวรูปร่าง ไม่ใช่นิสัย · <b>นอกซ์วาล "จอมมาร" ไม่ใช่เผ่าปีศาจ</b> ชื่อจอมมารเป็นคำที่มนุษย์เรียก ทำให้เผ่าปีศาจถูกเหมารวมมานาน · ครากาเป็นสายเลือดปีศาจโบราณ (ร่างใหญ่ สี่แขน) ที่แทบไม่เหลือแล้ว ปีศาจทั่วไปตัวเท่าคน',
 elf:'<b>เอลฟ์</b> — มาจากชายฝั่งปะการังทางตะวันตกเฉียงใต้ (แมพ 19–22) เมืองท่าบนผาขาว เฝ้าซากนครจมใต้น้ำจากยุคเก่า อายุยืน จำเพลงและตำนานเก่าได้มากที่สุด เป็นคนเฝ้าบันทึก นักเวท นักธนู · หลายคนจำได้ว่าตะเกียงใหญ่เคย "ร้องเพลง" (ปมเล็ก ไม่เฉลย)',
 cat:'<b>แมว (เผ่ามิว)</b> — ชนเผ่าคาราวานแห่งทะเลทรายซันสการ์ทางตะวันออก (แมพ 11–14) ตลาดคาราวานคือบ้านที่ใกล้เคียงที่สุด เดินทางไปทุกเมือง เป็นคนส่งของ ส่งข่าว พ่อค้าเร่ นักสำรวจ ลายหู/หางต่างกันตามครอบครัว (ส้ม ดำ ขาว ลายเสือ สามสี) · ว่องไว โชคดี (ตรงกับ AGI/LUK)'}};
const RACES=['human','demon','elf','cat'];
/* ---- player.race alias ---- */
const raceOf=()=>{try{const r=P&&P.pLook&&P.pLook.race;return RACES.indexOf(r)>=0?r:'human'}catch(_){return 'human'}};
window.__RACE_NOW=raceOf;R.get=raceOf;
setInterval(()=>{try{if(typeof P!=='undefined'&&P){const r=raceOf();if(P.race!==r)P.race=r}}catch(e){R.err='alias '+e.message}},250);
/* ---- dialogue condition grammar: "&" all, "!" negation, race=a|b|c, done:<quest>, flag, flag=value ---- */
R.cond=function(str,flags,isDone){if(!str)return true;flags=flags||{};return String(str).split('&').every(c=>{c=c.trim();let neg=c[0]==='!';if(neg)c=c.slice(1);let ok;
  if(c.indexOf('done:')===0)ok=!!(isDone&&isDone(c.slice(5)));else{const i=c.indexOf('='),k=i<0?c:c.slice(0,i),v=i<0?null:c.slice(i+1);const val=k==='race'?raceOf():flags[k];ok=v==null?!!val:v.split('|').indexOf(String(val))>=0}
  return neg?!ok:ok})};
/* ---- creator / dressing-room race info panel ---- */
if(!/[?&]racelore=off\b/.test(Q)){const st=document.createElement('style');st.textContent='.raceLore{margin:8px 0 4px;padding:8px 10px;border-radius:10px;background:rgba(14,20,44,.78);border:1px solid rgba(143,181,234,.45);color:#e6eeff;font:13px/1.55 "Noto Sans Thai",system-ui,sans-serif;max-height:30vh;overflow:auto;text-align:left}.raceLore b{color:#ffe08a}';document.head.appendChild(st);
  setInterval(()=>{try{document.querySelectorAll('[data-race][aria-pressed="true"]').forEach(btn=>{const row=btn.parentElement;if(!row)return;let p=row.nextElementSibling;if(!(p&&p.classList&&p.classList.contains('raceLore'))){p=document.createElement('div');p.className='raceLore';row.insertAdjacentElement('afterend',p)}
    const r=btn.getAttribute('data-race'),h=R.lore[r]||'';if(p.dataset.r!==r){p.dataset.r=r;p.innerHTML=h}})}catch(e){R.err='panel '+e.message}},250)}
/* ---- ?racetest=on: 2 sample lines on an existing NPC ---- */
const TEST={on:/[?&]racetest=on\b/.test(Q),sets:[
 {id:'ora_m1_01',who:'โอรา',lines:[{say:'เจ้าไม่ใช่คนแถวนี้',if:'race=human'},{say:'เด็กเผ่าภูเขา... ที่นี่ไม่มีใครไล่เจ้าหรอก',if:'race=demon'},{say:'เอลฟ์ไม่ค่อยลงมาถึงที่นี่ เจ้าหลงทางรึ',if:'race=elf'},{say:'เผ่ามิวมาส่งของอีกแล้วรึ... อ้อ ไม่ใช่',if:'race=cat'}]},
 {id:'varg_defeat',who:'วาร์ก (ตอนแพ้)',lines:[{who:'ผู้เล่น',say:'เราเกิดมาเผ่าเดียวกัน... แต่เจ้าเลือกเดินไปอีกทาง',if:'race=human'},{who:'ผู้เล่น',say:'คนชอบชี้ว่าเผ่าข้าเป็นตัวร้าย ขนาดมนุษย์อย่างเจ้า ยังไปรับใช้ความมืดได้',if:'race=demon'},{who:'ผู้เล่น',say:'ตำนานเผ่าข้าเล่าถึงคนแบบเจ้า... ไม่เคยมีตอนจบดี',if:'race=elf'},{who:'ผู้เล่น',say:'หางข้าตั้งตั้งแต่ได้กลิ่นเจ้าแล้ว ไม่ใช่เพราะเผ่า แต่เพราะสิ่งที่เจ้าทำ',if:'race=cat'},{say:'เผ่า? ...แสงหรือมืดไม่เคยถามข้าว่าเกิดมาเป็นอะไร',if:'!race=none'}]}]};
R.test=TEST;
TEST.pick=function(race){const keep=P&&P.pLook?P.pLook.race:null;let old;try{if(race){old=P.pLook.race;P.pLook.race=race}return TEST.sets.map(s=>({id:s.id,who:s.who,lines:s.lines.filter(l=>R.cond(l.if)).map(l=>(l.who?l.who+': ':'')+l.say)}))}finally{if(race&&P.pLook)P.pLook.race=old}};
if(TEST.on){try{const _i=interact;interact=function(){const it=G.interact;if(it&&it.k==='npc'&&G.state==='play'){try{const pk=TEST.pick();for(const s of pk)for(const t of s.lines){log('['+s.who+'] '+t,'v');TEST.shown=(TEST.shown||0)+1}textAt(P.x,P.y-110,pk[0].lines[0]||'','#ffe08a',14,{life:2.6})}catch(e){R.err='test '+e.message}}return _i.apply(this,arguments)}}catch(e){R.err='hook interact '+e.message}}
console.info('[RACE] race lore / player.race / dialogue if loaded'+(TEST.on?' · racetest on':''));
})();
