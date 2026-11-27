
/* LANTUT233 r233 (?lanterntut=off): DeaRz 26 Nov 2026 09:21 BKK (bag screenshot, the golden hanging lantern): "เมื่อจบเควสและได้รับตะเกียงมา ให้สอนวิธีใช้ด้วย".
   The house lantern (ITEMS.houseLantern) comes from main quest m2_02_forge_gift (r217); before, the player only got a one-line notice.
   Now: the first time the lantern is in the bag (and not yet planted), a one-time how-to card: what it does, how to use it from the bag, where it can be planted,
   how to go up / down, how to move it. Buttons: "ลองปักเลย" (opens the normal place mode) / "เข้าใจแล้ว". Seen once per character (localStorage lf_lantut233).
   Re-view: SET window button "🏮 วิธีใช้ตะเกียงบ้าน", and LANTUT233.show(). Texts follow the real controls of the housing module (r141/r146). */
(function(){'use strict';
const X=window.LANTUT233={on:true,ver:'r233',shown:0,err:null};
try{if(/[?&]lanterntut=off\b/.test(location.search)){X.on=false;return}}catch(e){}
const KEY='lf_lantut233',touch=(()=>{try{return matchMedia('(pointer:coarse)').matches}catch(_){return false}})();
const who=()=>{try{if(window.CHARNAME237)return CHARNAME237();return String((P&&(P.name||P.nm||P.charName))||'')}catch(_){return ''}};
function seen(){try{const o=JSON.parse(localStorage.getItem(KEY)||'{}');return !!o[who()||'_']}catch(_){return false}}
function mark(){try{const o=JSON.parse(localStorage.getItem(KEY)||'{}');o[who()||'_']=Date.now();localStorage.setItem(KEY,JSON.stringify(o))}catch(_){}}
const css=`#lt233{position:fixed;inset:0;z-index:9000;display:none;align-items:center;justify-content:center;background:rgba(5,8,16,.55);padding:16px}
#lt233 .c{max-width:440px;width:100%;max-height:calc(100vh - 32px);overflow:auto;background:linear-gradient(180deg,#2a2016,#17120c);border:1px solid #ffd98a;border-radius:14px;box-shadow:0 0 30px rgba(255,200,100,.35);color:#fff4dc;padding:16px 18px;font:14px/1.5 "Noto Sans Thai",system-ui,sans-serif}
#lt233 h3{margin:0 0 4px;font-size:18px;color:#ffd98a}#lt233 .in{margin:0 0 10px;color:#e9dcc0}
#lt233 ol{margin:0;padding:0;list-style:none;counter-reset:s}#lt233 li{counter-increment:s;position:relative;padding:6px 0 6px 34px;border-top:1px solid rgba(255,217,138,.15)}
#lt233 li:before{content:counter(s);position:absolute;left:0;top:7px;width:24px;height:24px;border-radius:50%;background:#ffd98a;color:#1a0e00;font-weight:700;text-align:center;line-height:24px}
#lt233 kbd{display:inline-block;min-width:18px;padding:0 5px;border-radius:5px;background:#ffd98a;color:#1a0e00;font-weight:700;text-align:center;font-size:12px}
#lt233 .nt{margin:10px 0 0;font-size:12px;color:#bfae8c}#lt233 .b{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}
#lt233 button{border-radius:999px;border:1px solid #ffd98a;padding:7px 16px;font:600 14px "Noto Sans Thai",system-ui,sans-serif;cursor:pointer;background:#3a2c18;color:#fff4dc}#lt233 button.go{background:#ffd98a;color:#1a0e00}`;
function html(){const K=k=>'<kbd>'+k+'</kbd>';
 return '<div class="c" role="dialog" aria-label="วิธีใช้ตะเกียงบ้าน"><h3>🏮 ได้รับ ตะเกียงบ้าน</h3><p class="in">ปักตะเกียงไว้ที่ไหน ที่นั่นจะเป็นทางขึ้น <b>ลานตะเกียงลอยฟ้า</b> บ้านส่วนตัวของคุณ</p><ol>'+
 '<li>เปิดกระเป๋า แล้ว'+(touch?'<b>แตะสองครั้ง</b>':'<b>ดับเบิลคลิก</b>')+'ที่ "ตะเกียงบ้าน"</li>'+
 '<li>เลื่อน'+(touch?'นิ้ว':'เมาส์')+'ไปจุดที่อยากปัก ถ้าขึ้น <b style="color:#8dffa8">✔ เขียว</b> แปลว่าปักได้ แล้วกด <b>"วาง"</b>'+(touch?'':' (หรือคลิกซ้าย / '+K('Enter')+')')+' · ยกเลิก: '+(touch?'ปุ่มยกเลิก':'คลิกขวา / '+K('Esc'))+'</li>'+
 '<li>เดินไปใกล้ตะเกียง แล้ว'+(touch?'แตะป้ายที่ขึ้นมา หรือแตะที่ตะเกียง':'กด '+K('F')+' หรือคลิกที่ตะเกียง')+' เพื่อขึ้นบ้านลอยฟ้า · ลงจากบ้าน: ไปที่จุดทางลงแล้ว'+(touch?'แตะ':'กด '+K('F'))+'</li>'+
 '<li>อยากย้ายที่: ยืนใกล้ตะเกียงแล้ว'+(touch?'แตะ "เก็บตะเกียง" บนป้าย':'กด '+K('V'))+' ตะเกียงกลับเข้ากระเป๋า แล้วไปปักใหม่</li></ol>'+
 '<p class="nt">ใช้แล้วไม่หาย · มีได้ 1 ดวงต่อคน · ปักไม่ได้ระหว่างต่อสู้ (รอ 5 วินาที) · ปักในถ้ำ ดันเจี้ยน ห้องบอส และในบ้านไม่ได้ · ดูหน้านี้อีกครั้งได้ที่ ตั้งค่า (SET) › 🏮 วิธีใช้ตะเกียงบ้าน</p>'+
 '<div class="b"><button type="button" data-a="ok">เข้าใจแล้ว</button><button type="button" class="go" data-a="try">🏮 ลองปักเลย</button></div></div>'}
let box=null;
function ensure(){if(box)return box;const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);box=document.createElement('div');box.id='lt233';document.body.appendChild(box);
 for(const ev of ['pointerdown','pointerup','mousedown','mouseup','click','dblclick','touchstart','touchend','wheel','contextmenu'])box.addEventListener(ev,e=>e.stopPropagation());
 box.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-a]');if(!b){if(e.target===box)close();return}const a=b.dataset.a;close();
  if(a==='try'){try{const H=window.HOUSE;if(H&&H.startPlace&&countItem('houseLantern')>0){if(typeof closeWin==='function'&&G.win)closeWin();H.startPlace()}else if(typeof notify==='function')notify('ตะเกียงปักอยู่แล้ว · ยืนใกล้ตะเกียงแล้ว'+(touch?'แตะ "เก็บตะเกียง"':'กด V')+' เพื่อเก็บก่อนย้าย')}catch(er){X.err='try '+er.message}}});
 return box}
function close(){if(box)box.style.display='none';mark()}
X.show=function(){try{const b=ensure();b.innerHTML=html();b.style.display='flex';X.shown++;return true}catch(e){X.err='show '+e.message;return false}};
let firstSeenT=0;
setInterval(()=>{try{if(typeof G==='undefined'||G.state!=='play'||typeof P==='undefined'||!P||P.dead||G.fade)return;if(box&&box.style.display==='flex')return;
  const H=window.HOUSE,have=typeof countItem==='function'?countItem('houseLantern'):0;
  if(seen())return;
  if(H&&H.state){const S=H.state();if(S&&S.lantern){mark();return}}
  if(have<1){firstSeenT=0;return}
  if(!firstSeenT){firstSeenT=Date.now();return}if(Date.now()-firstSeenT<2500)return;   // let the quest reward dialog / notice finish first
  if(document.querySelector('#housePlaceBar[style*="flex"]'))return;
  X.show()}catch(e){X.err='tick '+e.message}},1000);
// SET window button (same place r217 put its HUD-layout button)
const addBtn=setInterval(()=>{try{const p=document.getElementById('camPanel');if(!p||document.getElementById('lt233Btn'))return;const b=document.createElement('button');b.id='lt233Btn';b.type='button';b.className='btn';b.textContent='🏮 วิธีใช้ตะเกียงบ้าน';b.style.cssText='display:block;width:100%;margin:8px 0 2px';
  b.addEventListener('click',e=>{e.stopPropagation();try{p.hidden=true}catch(_){}X.show()});const ref=document.getElementById('hudxSetBtn')||document.getElementById('benchBtn');if(ref&&ref.parentNode===p)p.insertBefore(b,ref.nextSibling);else p.appendChild(b);clearInterval(addBtn)}catch(e){X.err='btn '+e.message}},800);
// item description points to the guide too
try{const t=setInterval(()=>{try{if(typeof ITEMS!=='undefined'&&ITEMS.houseLantern){const d=ITEMS.houseLantern.d||'';if(!/วิธีใช้/.test(d))ITEMS.houseLantern.d=d+' · วิธีใช้: ตั้งค่า (SET) › 🏮 วิธีใช้ตะเกียงบ้าน';clearInterval(t)}}catch(_){}},1000)}catch(_){}
})();
