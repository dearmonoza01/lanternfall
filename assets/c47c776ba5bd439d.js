
/* ---- candidate_sword_atk5_r18: p240 r14 Weapon skill window (unlock by weapon mastery level) + sword skills public + class system off (TEST candidate) ---- */
/* p240 r10 = r9 + the 5 sword attack skills show the icon set from p245 (window rows, detail panel, skill buttons; same image everywhere; passive icons unchanged). Selected highlight / dim / cooldown / not-usable are CSS overlays, the images are never edited. Skill logic, FX, damage untouched. */
/* p240 r8 = r7 + attack column slot 5 = 'เขตแดนดาบพิทักษ์' (key R, id wsAtk5, text from __SKATK5.cfg, unlock = row 5), skill bar button, MODS / enable() know __SKATK5. Nothing else changed.
/* p240 r2 — adds weapon-mastery unlocks: the old Job level is now the weapon mastery level (ชำนาญอาวุธ); row 1 of every column opens at Lv 10, row 2 at Lv 20, rows 3/4/5 at Lv 30/40/50 (W.cfg.unlock). Mastery EXP / curve = the game's existing Job EXP (untouched), cap raised to 50. TEST buttons Lv-10 / Lv+10 in the window.
   p240 r1 — weapon skill window (replaces the class skill window), sword skills usable in the normal game, class / job system switched off.
   TEST candidate on top of passive r6 (r7: atk4 text = 2 s charge, 250-700 %, wind-back) (nothing merged / published).
   1. Window "ทักษะสายดาบ" (K / menu button): the supplied black-gold frame is only the background, every text / icon / button is drawn by the UI.
      The window follows the equipped weapon (data table LINES, one entry per weapon type; weapons without skills show an empty list).
      Three columns (attack / buff+support / passive), each scrolls by itself; on a narrow screen the columns become three tabs.
      Tapping a skill shows icon, name, description and the real numbers read from each module's config in the bottom panel.
      A skill is "เปิดใช้งาน" only when its module exists in the page without error, otherwise "ยังไม่เปิดใช้งาน" (draft: name only, no effect invented).
   2. Public mode: the finished sword skills (SK1 พายุคมดาบ, SK2 เขี้ยวผ่าศิลา, SK3 นักดาบคลั่ง, Provoke คำรามท้าศึก) and the five passives work in the normal game while a
      sword is equipped (their own test flag is switched on without their TEST panels; the panels / tray buttons are hidden). Skill buttons (J U O Y) are on screen too.
      No learn system, no level, no slots, no save of skills (not designed yet). MP / CD / numbers stay the trial values of each module.
   3. Class / job system off for the player: no class restriction on equipment, no Job EXP / Job level / class change, job labels hidden.
      (The internal class tables stay in the file so old saves still load; they just have no effect and no UI.)
   While the window is open every tap / click / wheel / key is swallowed by the overlay: nothing walks, attacks or casts underneath. Closing restores normal control. */
(function(){'use strict';
const W=window.__WSK={ver:'p240-r7',err:null,open:false,public:false,log:[],cfg:{unlock:[1,10,15,20,25]}};
try{
const FRAME='assets/bae1e4c0082169db.webp';
const $=id=>document.getElementById(id);
const swordNow=()=>!!(P&&!P.dead&&P.weapon&&P.weapon.t==='sword');
const WLAB={sword:'ดาบ',dagger:'มีดสั้น',greatsword:'ดาบใหญ่',axe:'ขวาน',spear:'หอก',bow:'ธนู',staff:'ไม้เท้า',gun:'ปืน',book:'คัมภีร์',fist:'มือเปล่า'};
const wtype=()=>(P&&P.weapon&&P.weapon.t)||'fist';
const lv=()=>(P&&P.jobLv)|0;
const needLv=s=>W.cfg.unlock[Math.min(s.row|0,W.cfg.unlock.length-1)];
const unlocked=s=>((typeof P!=='undefined'&&P&&P.lvl)|0)>=needLv(s);
const stOf=s=>!s.ok()?'draft':(unlocked(s)?'on':'lock');
/* ---------------------------------------------------------------- data: the weapon lines (title / columns / skills) ---------------------------------------------------------------- */
const pct=v=>Math.round(v*100);
const mod={atk5:()=>window.__SKATK5,atk4:()=>window.__SKATK4,atk3:()=>window.__SKATK3,sk1:()=>window.__SK1,sk2:()=>window.__SK2L,sk3:()=>window.__SK3,prov:()=>window.__PROV,buf3:()=>window.__SKBUF3,buf4:()=>window.__SKBUF4,buf5:()=>window.__SKBUF5,pas:()=>window.__PASS};
const live=(m,fn)=>{try{return !!(m&&!m.err&&fn(m));}catch(e){return false;}};
const exp=' (ค่าทดลอง)';
const ICO=k=>{try{for(const o of [window.__SKATK_ICONS,window.__SKBUFF_ICONS])if(o&&o.icons&&o.icons[k])return o.icons[k].src;return null;}catch(e){return null;}};   // r13: attack icons (p245) + buff/support icons (p247), same image everywhere   // r10: attack skill icons (data file p245), same image everywhere
const ACT=(k,name,key,fn)=>({k,name,type:'active',key,ok:()=>live(mod[k](),fn.ok),icon:()=>ICO(k),desc:()=>fn.desc(mod[k]()),cost:()=>fn.cost(mod[k]()),cdId:fn.id,start:()=>fn.start(mod[k]())});
const PAS=(k,name,icoKey,fn)=>({k:'pas_'+icoKey,name,type:'passive',ok:()=>live(mod.pas(),m=>m.cfg&&m.cfg.ids&&m.cfg.ids[icoKey]),icon:()=>{try{return mod.pas().cfg.icons[icoKey]||null;}catch(e){return null;}},desc:()=>fn(mod.pas().cfg)});
const DRAFT=(k,name,type)=>({k,name,type,ok:()=>false,icon:()=>null,desc:()=>'ยังไม่เปิดใช้งาน\nเป็นแบบร่างในรายการ ยังไม่มีเอฟเฟกต์และค่าในเกม'});
const SK={
  sk1:ACT('sk1','พายุคมดาบ','J',{ok:m=>m.cfg&&typeof m.cast==='function',id:'wsSword1',
    desc:m=>{const c=m.cfg,t=c.damage.total;const a=c.damage.mul;return 'พุ่งเข้าหาเป้าที่ล็อก (ระยะเริ่มใช้ '+c.useRange+' px) แล้วฟันเสย '+pct(a[0])+'% และฟันลง '+pct(a[1])+'% จากนั้นคืนท่าพร้อมรบ\nรวม '+a.length+' ฮิต '+pct(t)+'% ของฟันปกติ 1 ครั้ง · ยังล็อกเป้าและตามเป้าที่กระเด็นได้เหมือนเดิม';},
    cost:m=>({mp:m.cfg.cost.mp,cd:m.cfg.cost.cd}),start:m=>m.cast()}),
  sk2:ACT('sk2','เขี้ยวผ่าศิลา','U',{ok:m=>m.cfg&&typeof m.cast==='function',id:'wsSword2',
    desc:m=>{const c=m.cfg,a=c.damage.mul;return 'ฟันเปิด '+pct(a[0])+'% แล้วปล่อยคลื่นดาบ '+pct(a[1])+'% ไปตามทิศของเป้าที่ล็อก (ระยะ '+c.useRange+' px) ผ่านได้หลายตัว หยุดที่กำแพง\nรวมสูงสุด '+pct(a[0]+a[1])+'% ของฟันปกติ 1 ครั้ง · ครบ 8 ทิศ';},
    cost:m=>({mp:m.cfg.cost.mp,cd:m.cfg.cost.cd}),start:m=>m.cast()}),
  sk3:ACT('sk3','นักดาบคลั่ง','O',{ok:m=>m.cfg&&typeof m.start==='function',id:'wsSword3',
    desc:m=>{const c=m.cfg;return 'บัฟ '+c.dur+' วินาที: ฟันดาบที่โดนครบ '+c.charges+' จังหวะเป็นคริติคอล 100% และฟันปกติเร็วขึ้น +'+pct(c.aspd)+'%\nพลาด กำแพง หรือไม่มีเป้าไม่นับจำนวนครั้ง ใช้ซ้อนไม่ได้';},
    cost:m=>({mp:m.cfg.mp,cd:m.cfg.cd}),start:m=>m.start()}),
  prov:ACT('prov','คำรามท้าศึก','Y',{ok:m=>m.cfg&&typeof m.start==='function',id:'provoke',
    desc:m=>{const c=m.cfg;return 'ส่งเสียงคำรามท้าศัตรูในรัศมี '+c.radius+' px ให้หันมาไล่โจมตีผู้เล่นนาน '+c.dur+' วินาที\nไม่ลด HP ไม่ทำให้มึน ไม่ดึงตำแหน่ง ศัตรูหลังกำแพงไม่ได้รับผล';},
    cost:m=>({mp:m.cfg.mp,cd:m.cfg.cd}),start:m=>m.start()}),
  atk3:ACT('atk3','วังวนเจ็ดคม','B',{ok:m=>m.cfg&&typeof m.cast==='function',id:'wsAtk3',
    desc:m=>{const c=m.cfg,a=c.damage.mul,n=a.length;return 'หมุนดาบฟันรอบตัว '+n+' จังหวะ ไม่ต้องล็อกเป้า รัศมี '+c.radius+' px (ฮิตตรวจศัตรูในวง ณ เวลาฮิตนั้น ศัตรูแต่ละตัวโดนได้ครั้งเดียวต่อฮิต กำแพงกันดาเมจ)\nฮิตละ '+pct(a[0])+'% ของฟันปกติ 1 ครั้ง × '+n+' ฮิต รวม '+pct(c.damage.total)+'% ต่อศัตรูที่โดนครบ · มี FX ทอร์นาโด (ไม่เพิ่มดาเมจ/แรงผลัก)\nระหว่างหมุนเดินได้ด้วยคีย์บอร์ด/จอย ความเร็ว '+pct(c.walk.speedMul)+'% ของความเร็วปัจจุบัน ตัวละคร พายุ และวงโจมตีเคลื่อนตามผู้เล่น ติดกำแพงตามระบบชนเดิม\nนักดาบคลั่ง: ฮิตที่โดนนับเป็นจังหวะคริ (ฮิตหมู่นับ 1) · ไม่สะสมดาบและไม่เรียกเงาคมต่อเนื่อง'+exp;},
    cost:m=>({mp:m.cfg.cost.mp,cd:m.cfg.cost.cd}),start:m=>m.cast()}),
  atk4:ACT('atk4','ดาบพิพากษา','N',{ok:m=>m.cfg&&typeof m.cast==='function',id:'wsAtk4',
    desc:m=>{const c=m.cfg,d=c.damage;return 'กดค้างปุ่มชาร์จสูงสุด '+c.charge.max+' วินาที แล้วปล่อยเพื่อฟันลงหนึ่งฮิต ครบ '+c.charge.max+' วินาทีจะฟันเองอัตโนมัติ หลังปล่อยหรือชาร์จเต็มจะมีจังหวะง้างดาบอ้อมเหนือหัวไปด้านหลังราว 0.17 วินาทีก่อนเหวี่ยงลง (ช่วงง้างไม่เพิ่มดาเมจและไม่ทำดาเมจ) (ดาบแสงยักษ์ ยอดดาบเป็นเพียงภาพ)\nดาเมจ '+pct(d.min)+'% ถึง '+pct(d.max)+'% ของฟันปกติ 1 ครั้ง = '+pct(d.min)+'% + '+pct(d.max-d.min)+'% × (เวลาชาร์จ ÷ '+c.charge.max+' วินาที) เช่นชาร์จ '+(c.charge.max/2)+' วินาที = '+pct((d.min+d.max)/2)+'% ความยาวดาบแสงและระยะโจมตีโตตามเวลาชาร์จ ตลอด '+c.charge.max+' วินาที (ชาร์จสั้น ดาบสั้น ระยะใกล้ · ชาร์จเต็ม ดาบยาว ระยะไกลสุด) ระยะโจมตีคือพื้นที่ที่ใบดาบกวาดผ่านตอนฟัน กว้าง '+(c.area.half*2)+' px ศัตรูแต่ละตัวโดนครั้งเดียว กำแพงกันดาเมจ'+(m.reach?' (ดาบยาว '+m.reach(0).px+' ถึง '+m.reach(1).px+' px)':'')+'\nหยุดเดินระหว่างชาร์จและฟัน เล็งได้ตอนชาร์จ ทิศล็อกเมื่อเริ่มฟัน (ใช้เป้าที่ล็อกถ้ามี ไม่มีก็ตามทิศเล็ง) ถ้าถูกยกเลิกกลางคันจะไม่ฟันและไม่คืน MP'+exp;},
    cost:m=>({mp:m.cfg.cost.mp,cd:m.cfg.cost.cd}),start:m=>m.cast()}),
  atk5:ACT('atk5','เขตแดนดาบพิทักษ์','R',{ok:m=>m.cfg&&typeof m.cast==='function',id:'wsAtk5',
    desc:m=>{const c=m.cfg,w=c.waves,n=w.starts.length;return 'เรียกดาบแสงยักษ์ลงมาลอยตรงหน้าผู้ร่าย ไม่ต้องล็อกเป้า หลังจบท่าเรียกเดินและโจมตีต่อได้ ดาบลอยขึ้นลงและหมุนช้าๆ อยู่กับที่จนครบ '+w.end+' วินาทีหลังปล่อยแล้วสลาย\nปล่อยวงอักขระรอบดาบ '+n+' ระลอก เริ่มที่ '+w.starts.join(' / ')+' วินาทีหลังปัก ระลอกละ '+w.life+' วินาที (แผ่ออกแล้วจาง) พัก '+(w.starts[1]-w.life)+' วินาที รัศมี '+c.radius+' px ศัตรูโดนเมื่อคลื่นถึง ครั้งเดียวต่อระลอก กำแพงกันดาเมจ\nระลอกละ '+pct(c.damage.mul[0])+'% ของฟันปกติ 1 ครั้ง × '+n+' รวมสูงสุด '+pct(c.damage.total)+'% (ไม่มีฮิตนอกระลอก)\nปักสำเร็จฟื้น HP '+pct(c.heal.pct)+'% ของ HP สูงสุดครั้งเดียว · เพิ่มค่าป้องกัน +'+pct(c.def.pct)+'% นาน '+c.def.dur+' วินาที (ติดตัวผู้ร่ายแม้ออกจากวง จบแล้วคืนค่า)\nตาย เปลี่ยนแมพ หรือเปลี่ยนอาวุธ ยกเลิกเขตและบัฟ · ใช้ซ้อนไม่ได้'+exp;},
    cost:m=>({mp:m.cfg.cost.mp,cd:m.cfg.cost.cd}),start:m=>m.cast()}),
  buf3:ACT('buf3','ตั้งรับเหล็กกล้า','',{ok:m=>m.cfg&&typeof m.start==='function',id:'wsBuff3',
    desc:m=>{const c=window.__SKBUFF.cfg.guard;return 'บัฟ '+c.dur+' วินาที: ลดดาเมจที่ได้รับ '+pct(c.reduce)+'% (ขั้นลดดาเมจเดิม ไม่เพิ่มค่าป้องกัน) เดินและโจมตีได้ตามปกติ ไม่ต้องล็อกเป้า\nรวมกับ ยืนหยัดกลางศึก แบบคูณ: 0.'+pct(1-c.reduce)+' × 0.90 = รับดาเมจ '+Math.round((1-c.reduce)*90)+'% · ใช้ซ้อนไม่ได้'+exp;},
    cost:m=>({mp:m.cfg.mp,cd:m.cfg.cd}),start:m=>m.start()}),
  buf4:ACT('buf4','ย่างก้าวนักรบ','',{ok:m=>m.cfg&&typeof m.start==='function',id:'wsBuff4',
    desc:m=>{const c=window.__SKBUFF.cfg.step;return 'บัฟ '+c.dur+' วินาที: ความเร็วเคลื่อนที่ +'+pct(c.speed)+'% และสโลว์ที่ได้รับลดลง '+pct(c.slowCut)+'% (สโลว์ 40% เหลือ 20%)\nไม่เพิ่มความเร็วโจมตีหรือเวลาอนิเมชันสกิล · ระหว่างวังวนเจ็ดคมคิดความเร็วรวมก่อนแล้วลดเหลือ 50% ตามกฎสกิล · ใช้ซ้อนไม่ได้'+exp;},
    cost:m=>({mp:m.cfg.mp,cd:m.cfg.cd}),start:m=>m.start()}),
  buf5:ACT('buf5','คมดาบดูดชีพ','',{ok:m=>m.cfg&&typeof m.start==='function',id:'wsBuff5',
    desc:m=>{const c=window.__SKBUFF.cfg.leech;return 'บัฟ '+c.dur+' วินาที: ดูดเลือด '+pct(c.pct)+'% ของดาเมจ HP ที่ทำได้จริงด้วยดาบ (ฟันปกติ สกิลดาบ และเงาของคมต่อเนื่อง) ไม่นับส่วนที่เกิน HP มอน\nฟื้นสูงสุดรวม '+pct(c.capPct)+'% MaxHP ต่อการเปิดหนึ่งครั้ง แยกจากฮีลของลมหายใจนักรบและสกิล 5 · ดาเมจหลังบัฟหมดไม่รับผล · ใช้ซ้อนไม่ได้'+exp;},
    cost:m=>({mp:m.cfg.mp,cd:m.cfg.cd}),start:m=>m.start()}),
  mastery:PAS('mastery','ชำนาญดาบ','mastery',c=>'ดาเมจของอาวุธดาบเพิ่ม +'+pct(c.mastery.dmg)+'% (ฟันปกติ สกิล และเงา) ใช้ได้เฉพาะตอนถือดาบ'+exp),
  chain:PAS('chain','คมต่อเนื่อง','chain',c=>{const h=c.chain;return 'ฟันปกติที่โดนมีโอกาส '+pct(h.chance)+'% สะสมดาบ 1 อัน ครบ '+h.slots+' อัน ฟันปกติครั้งถัดไปที่โดนจะเรียกเงา '+h.hits+' ฮิต ฮิตละ '+pct(h.hitMul)+'% รวม '+pct(h.hitMul*h.hits)+'% ตัวเงาดำอมม่วง\nสะสมดาบแล้วแสดงเป็นดาบสีแดงข้างแถบชื่อ'+exp;}),
  sharp:PAS('sharp','คมสังหาร','sharp',c=>'เพิ่มดาเมจคริติคอล +'+pct(c.sharp.critDmg)+' จุด (ไม่เพิ่มโอกาสคริ)'+exp),
  stand:PAS('stand','ยืนหยัดกลางศึก','stand',c=>'มีศัตรูอย่างน้อย '+c.stand.count+' ตัวในรัศมี '+c.stand.radius+' px ลดดาเมจที่ได้รับ '+pct(c.stand.reduce)+'% (แสดงไอคอนสถานะ)'+exp),
  breath:PAS('breath','ลมหายใจนักรบ','breath',c=>'เมื่อสังหารศัตรู ฟื้น HP '+pct(c.breath.heal)+'% ของ HP สูงสุด คูลดาวน์ร่วม '+c.breath.icd+' วินาที (ฆ่าหมู่ฟื้นครั้งเดียว)'+exp)};
const LINES={
  sword:{title:'ทักษะสายดาบ',cols:[
    {name:'โจมตี',skills:[SK.sk1,SK.sk2,SK.atk3,SK.atk4,SK.atk5]},
    {name:'บัฟ / สนับสนุน',skills:[SK.sk3,SK.prov,SK.buf3,SK.buf4,SK.buf5]},
    {name:'พาสซีฟ',skills:[SK.mastery,SK.chain,SK.sharp,SK.stand,SK.breath]}]}};
const lineOf=t=>LINES[t]||{title:'ทักษะ'+(WLAB[t]||'อาวุธ'),cols:[{name:'โจมตี',skills:[]},{name:'บัฟ / สนับสนุน',skills:[]},{name:'พาสซีฟ',skills:[]}],empty:true};
for(const c of LINES.sword.cols)c.skills.forEach((s,i)=>{s.row=i;});
W.lines=LINES;
/* ---------------------------------------------------------------- styles + DOM ---------------------------------------------------------------- */
const css=document.createElement('style');css.id='wskCss';
css.textContent=`
#hudTrayRow #sk1Tog,#hudTrayRow #sk2Tog,#hudTrayRow #sk3Tog,#hudTrayRow #provTog,#hudTrayRow #pasTog,#pasPanel,#sk1Panel,#sk2Panel,#sk3Panel,#provPanel{display:none!important}
#hCls,.hcls{display:none!important}
#wWpnSk .tst{left:3.2%;top:2.4%;display:flex;gap:.6cqw}
#wWpnSk .tst button{font-size:max(10px,1.3cqw);padding:.3cqw .9cqw;border-radius:.6cqw;border:1px solid #c9a86a;background:rgba(40,32,20,.9);color:#e8c98a;cursor:pointer;font-family:inherit;touch-action:manipulation}
#wWpnSk .row.lock .nm{color:#b9ad92}
#wWpnSk .chip.lk{color:#ffd98a;border-color:#a8843c;background:rgba(80,56,18,.6)}
#wWpnSk{position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;background:rgba(4,3,2,.66);touch-action:none;-webkit-user-select:none;user-select:none}
#wWpnSk[hidden]{display:none}
#wWpnSk .box{position:relative;aspect-ratio:1401/973;width:min(calc(100vw - 8px),calc((100vh - 8px)*1.4398));container-type:inline-size;background:url(${FRAME}) center/100% 100% no-repeat;font-family:var(--body,system-ui,sans-serif);color:#e9dcc0}
#wWpnSk .abs{position:absolute}
#wWpnSk .ttl{left:32.8%;top:.7%;width:33.8%;height:8.2%;display:flex;align-items:center;justify-content:center;font-size:3.3cqw;font-weight:700;letter-spacing:.05em;color:#f3e2b0;text-shadow:0 1px 0 #3a2508,0 0 12px rgba(255,200,110,.35);white-space:nowrap}
#wWpnSk .xw{left:95.2%;top:4.8%;width:4.6%;height:6.4%}
#wWpnSk .xw button{position:absolute;left:50%;top:50%;width:max(100%,44px);height:max(100%,44px);transform:translate(-50%,-50%);background:none;border:0;color:#f3e2b0;font-size:3.2cqw;line-height:1;cursor:pointer;touch-action:manipulation;padding:0}
#wWpnSk .col{top:10.5%;height:65.6%;display:flex;flex-direction:column}
#wWpnSk .ch{flex:0 0 8.7%;display:flex;align-items:center;justify-content:center;font-size:2.35cqw;font-weight:700;color:#e8c98a;letter-spacing:.04em;white-space:nowrap}
#wWpnSk .lst{flex:1;overflow-y:auto;overflow-x:hidden;padding:.5cqw .7cqw .5cqw .7cqw;display:flex;flex-direction:column;gap:.55cqw;touch-action:pan-y;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#6b5328 transparent}
#wWpnSk .row{flex:0 0 auto;display:flex;align-items:center;gap:1cqw;height:7.7cqw;box-sizing:border-box;padding:.5cqw .8cqw;border:1px solid rgba(120,96,52,.55);border-radius:.8cqw;background:linear-gradient(180deg,rgba(40,33,24,.9),rgba(22,18,13,.92));cursor:pointer;touch-action:manipulation}
#wWpnSk .row.sel{border-color:#c9a8ff;box-shadow:0 0 0 1px #c9a8ff,0 0 1.6cqw rgba(190,140,255,.55),inset 0 0 1.2cqw rgba(170,120,255,.18)}
#wWpnSk .ic{flex:0 0 6cqw;width:6cqw;height:6cqw;border-radius:.8cqw;border:1px solid rgba(150,120,60,.55);background:#100d09;display:flex;align-items:center;justify-content:center;overflow:hidden}
#wWpnSk .ic img{width:100%;height:100%;object-fit:contain;display:block}
#wWpnSk .ic.sk{border:0;background:none;border-radius:0;overflow:visible}
#wWpnSk .ic.sk{position:relative}
#wWpnSk .ic.sk img{position:absolute;left:0;top:0;width:100%;height:100%;box-shadow:none!important;border:0!important;outline:0}
#wWpnSk .row.draft .ic.sk img,#wWpnSk .row.lock .ic.sk img,#wWpnSk .ic.sk.dim img{filter:grayscale(.8) brightness(.55)}
#wWpnSk .row.sel .ic.sk img{filter:drop-shadow(0 0 .45cqw rgba(200,160,255,.95))}
#wWpnSk .row.sel.draft .ic.sk img,#wWpnSk .row.sel.lock .ic.sk img{filter:grayscale(.8) brightness(.6) drop-shadow(0 0 .45cqw rgba(200,160,255,.95))}
#wWpnSk .mid{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:.45cqw}
#wWpnSk .nm{max-width:100%;font-size:2cqw;font-weight:600;line-height:1.12;color:#f0e4c8;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
#wWpnSk .row.draft .nm{color:#9c917c}
#wWpnSk .chip{flex:0 0 auto;font-size:1.3cqw;line-height:1.2;padding:.2cqw .8cqw;border-radius:99px;border:1px solid;white-space:nowrap}
#wWpnSk .chip.on{color:#bff0b4;border-color:#5f9a58;background:rgba(40,80,36,.55)}
#wWpnSk .chip.off{color:#a79d88;border-color:#5a5242;background:rgba(40,36,28,.7)}
#wWpnSk .emp{padding:2cqw 1cqw;text-align:center;font-size:1.7cqw;color:#9c917c;line-height:1.5}
#wWpnSk .dic{left:3.3%;top:79.4%;width:8.6%;aspect-ratio:1;border-radius:1cqw}
#wWpnSk .dtx{left:13.1%;top:78.6%;width:53%;height:18.6%;display:flex;flex-direction:column;gap:.35cqw;min-height:0}
#wWpnSk .dn{font-size:2.5cqw;font-weight:700;color:#e5c9ff;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#wWpnSk .dd{flex:1;min-height:0;overflow-y:auto;font-size:1.6cqw;line-height:1.38;color:#e3d8c0;white-space:pre-line;touch-action:pan-y;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#6b5328 transparent}
#wWpnSk .dm{font-size:1.4cqw;color:#c9b27a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#wWpnSk .pl{left:68.7%;top:81.1%;width:26.8%;height:4.8%;display:flex;align-items:center;justify-content:center;font-size:1.8cqw;color:#e8c98a;font-weight:600;white-space:nowrap}
#wWpnSk .bt{top:87.8%;height:8.3%}
#wWpnSk .bt button{position:absolute;left:0;top:50%;width:100%;height:max(100%,44px);transform:translateY(-50%);background:none;border:0;cursor:pointer;font-size:2.3cqw;font-weight:800;letter-spacing:.04em;touch-action:manipulation;padding:0;font-family:inherit}
#wWpnSk .bt.go{left:67.2%;width:16.1%}
#wWpnSk .bt.go button{color:#2c1a05;text-shadow:0 1px 0 rgba(255,235,170,.6)}
#wWpnSk .bt.go button:disabled{color:#5b4a2c;cursor:default;text-shadow:none}
#wWpnSk .bt.as{left:50.6%;width:15.6%;top:92.4%;height:4.8%}
#wWpnSk .bt.as button{height:max(100%,28px);border:1px solid rgba(214,176,92,.85);border-radius:8px;background:rgba(40,30,16,.92);color:#ffe9b0;text-shadow:0 1px 1px #000;font-size:max(11px,1.5cqw);font-weight:700;letter-spacing:0}
#wWpnSk .bt.as button:disabled{color:#7a6c52}
#wWpnSk.tabs .bt.as button{font-size:max(11px,2.1cqw)}
#wWpnSk .bt.cl{left:84.9%;width:11.6%}
#wWpnSk .bt.cl button{color:#efe3cb;text-shadow:0 1px 1px #000}
#wWpnSk .bt.go button.sm{font-size:1.8cqw}
/* narrow screens: one category at a time */
#wWpnSk.tabs .col{display:none}
#wWpnSk .tp{display:none}
#wWpnSk.tabs .tp{display:flex;flex-direction:column;left:1.93%;width:96.3%;top:10.5%;height:65.6%;box-sizing:border-box;border:1px solid rgba(160,128,64,.6);border-radius:1.2cqw;background:linear-gradient(180deg,#1b1610,#12100b)}
#wWpnSk .tabrow{flex:0 0 auto;display:flex;gap:.6cqw;padding:.7cqw .9cqw .3cqw}
#wWpnSk .tabrow button{flex:1;min-height:34px;background:rgba(36,29,20,.9);border:1px solid rgba(120,96,52,.6);border-radius:.9cqw;color:#cdb98a;font-size:max(13px,2.5cqw);font-weight:700;font-family:inherit;cursor:pointer;touch-action:manipulation;white-space:nowrap}
#wWpnSk .tabrow button.on{color:#2c1a05;background:linear-gradient(180deg,#f0c368,#b8801f);border-color:#ffe1a0}
#wWpnSk.tabs .lst{padding:.8cqw .9cqw}
#wWpnSk.tabs .row{height:auto;min-height:40px;flex:1 0 40px;max-height:max(11cqw,56px);padding:.4cqw 1cqw;gap:1.6cqw}
#wWpnSk.tabs .mid{flex-direction:row;align-items:center;justify-content:space-between;gap:1cqw}
#wWpnSk.tabs .ic{flex:0 0 32px;width:32px;height:32px}
#wWpnSk.tabs .nm{font-size:max(14px,3cqw);-webkit-line-clamp:1}
#wWpnSk.tabs .chip{font-size:max(11px,2cqw);padding:.3cqw 1.1cqw}
#wWpnSk.tabs .dn{font-size:max(14px,3.1cqw)}
#wWpnSk.tabs .dd{font-size:max(11px,2.1cqw);line-height:1.3}
#wWpnSk.tabs .dm{font-size:max(10px,1.9cqw)}
#wWpnSk.tabs .pl{font-size:max(11px,2.2cqw)}
#wWpnSk.tabs .bt button{font-size:max(13px,2.9cqw)}
#wWpnSk.tabs .bt.go button.sm{font-size:max(11px,2.2cqw)}
/* skill buttons */
#wsBar{position:fixed;z-index:57;display:none;flex-wrap:wrap;justify-content:flex-end;width:284px;gap:6px;right:16px;bottom:172px;pointer-events:auto;touch-action:manipulation}
@media (max-width:900px){#wsBar{flex-wrap:wrap;justify-content:flex-end;width:254px}#wsBar button{height:42px!important;min-width:70px!important}}
#wsBar button{position:relative;overflow:hidden;min-width:78px;height:46px;padding:0 8px;border-radius:12px;border:1px solid rgba(214,176,92,.75);background:linear-gradient(180deg,rgba(40,32,22,.92),rgba(16,13,9,.94));color:#f0e4c8;font-size:12px;font-weight:700;font-family:inherit;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.5)}
#wsBar button .k{position:absolute;left:5px;top:2px;font-size:9px;color:#c9b27a;font-weight:600}
#wsBar button .cd{position:absolute;left:0;right:0;bottom:0;background:rgba(0,0,0,.62);height:0}
#wsBar button .ct{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:15px;color:#fff;text-shadow:0 1px 2px #000}
#wsBar button.nomp{opacity:.55}
#wsBar button.ico{min-width:0!important;width:52px!important;height:52px!important;padding:0!important;border:0!important;background:none!important;border-radius:7px;box-shadow:none}
#wsBar button.ico img{display:block;width:100%;height:100%;pointer-events:none;-webkit-user-drag:none}
#wsBar button.ico .k{z-index:2;left:4px;top:3px;padding:0 4px;border-radius:5px;background:rgba(0,0,0,.66);color:#ffe9b0}
#wsBar button.ico .cd{z-index:1;border-radius:0 0 7px 7px}
#wsBar button.ico .ct{z-index:2}
#wsBar button.ico.on{box-shadow:0 0 0 2px #ff9a60,0 0 10px rgba(255,100,40,.75)}
@media (max-width:900px){#wsBar{width:262px}#wsBar button.ico{width:44px!important;height:44px!important}}
#wsBar button.on{border-color:#ff9a60;box-shadow:0 0 10px rgba(255,100,40,.7)}
@media (hover:none){#wsBar button .k{display:none}#wsBar button{min-width:70px;height:48px}}
`;
document.head.appendChild(css);
const win=document.createElement('div');win.id='wWpnSk';win.className='wsk';win.hidden=true;
win.innerHTML='<div class="box"><div class="abs ttl" id="wskTitle"></div><div class="abs tst"><button type="button" data-lv="-10">TEST Lv−10</button><button type="button" data-lv="10">Lv+10</button></div><div class="abs xw"><button type="button" data-x aria-label="ปิด">✕</button></div>'
 +'<div class="abs col" style="left:1.93%;width:31.6%" data-col="0"><div class="ch"></div><div class="lst"></div></div>'
 +'<div class="abs col" style="left:34.5%;width:30.8%" data-col="1"><div class="ch"></div><div class="lst"></div></div>'
 +'<div class="abs col" style="left:66.3%;width:31.8%" data-col="2"><div class="ch"></div><div class="lst"></div></div>'
 +'<div class="abs tp"><div class="tabrow"></div><div class="lst" id="wskTabList"></div></div>'
 +'<div class="abs ic dic" id="wskDIc"></div><div class="abs dtx"><div class="dn" id="wskDn"></div><div class="dd" id="wskDd"></div><div class="dm" id="wskDm"></div></div>'
 +'<div class="abs pl" id="wskPl"></div>'
 +'<div class="abs bt as"><button type="button" id="wskAs">ใส่ช่องสกิล</button></div>'
 +'<div class="abs bt go"><button type="button" id="wskGo"></button></div><div class="abs bt cl"><button type="button" data-x>ปิด</button></div></div>';
document.body.appendChild(win);
/* nothing under the window may receive a tap / click / wheel */
for(const ev of ['pointerdown','pointerup','pointermove','mousedown','mouseup','mousemove','click','dblclick','touchstart','touchmove','touchend','wheel','contextmenu'])win.addEventListener(ev,e=>{e.stopPropagation();if(ev==='contextmenu'||ev==='wheel'&&!e.target.closest('.lst,.dd'))e.preventDefault();},{passive:false});
/* ---------------------------------------------------------------- state + render ---------------------------------------------------------------- */
const ST={wt:null,tab:0,sel:null};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function allSkills(L){const a=[];for(const c of L.cols)for(const s of c.skills)a.push(s);return a;}
function rowHTML(s){const st=stOf(s),ok=st==='on',ic=s.icon();
  return '<div class="row'+(st==='draft'?' draft':st==='lock'?' lock':'')+(ST.sel===s.k?' sel':'')+'" data-k="'+s.k+'"><div class="ic'+(ic&&s.type==='active'?' sk':'')+'">'+(ic?'<img alt="" src="'+ic+'">':'')+'</div><div class="mid"><div class="nm">'+esc(s.name)+'</div><span class="chip '+(st==='on'?'on':st==='lock'?'lk':'off')+'">'+(st==='on'?'เปิดใช้งาน':st==='lock'?'🔒 Lv.'+needLv(s):'ยังไม่เปิดใช้งาน')+'</span></div></div>';}
function render(){
  const wt=wtype(),L=lineOf(wt);ST.wt=wt;
  const all=allSkills(L);if(!all.find(s=>s.k===ST.sel))ST.sel=all.length?all[0].k:null;
  win.querySelector('#wskTitle').textContent=L.title;
  const keep=[...win.querySelectorAll('.lst')].map(l=>l.scrollTop);
  L.cols.forEach((c,i)=>{const col=win.querySelector('[data-col="'+i+'"]');col.querySelector('.ch').textContent=c.name;
    col.querySelector('.lst').innerHTML=c.skills.length?c.skills.map(rowHTML).join(''):'<div class="emp">ยังไม่มีสกิลของอาวุธนี้</div>';});
  const tr=win.querySelector('.tabrow');tr.innerHTML=L.cols.map((c,i)=>'<button type="button" data-tab="'+i+'" class="'+(ST.tab===i?'on':'')+'">'+esc(c.name)+'</button>').join('');
  const cur=L.cols[Math.min(ST.tab,L.cols.length-1)];
  win.querySelector('#wskTabList').innerHTML=cur.skills.length?cur.skills.map(rowHTML).join(''):'<div class="emp">ยังไม่มีสกิลของอาวุธนี้</div>';
  win.querySelectorAll('.lst').forEach((l,i)=>{if(keep[i])l.scrollTop=keep[i];});
  detail(L);fit();}
function detail(L){
  L=L||lineOf(wtype());const all=allSkills(L),s=all.find(x=>x.k===ST.sel);
  const n=all.filter(x=>stOf(x)==='on').length;win.querySelector('#wskPl').textContent=all.length?'เลเวล '+((typeof P!=='undefined'&&P&&P.lvl)|0)+' · ใช้ได้ '+n+'/'+all.length+(window.__SKUP?__SKUP.ptsTxt():''):'ชำนาญ Lv '+lv();
  const ic=win.querySelector('#wskDIc'),dn=win.querySelector('#wskDn'),dd=win.querySelector('#wskDd'),dm=win.querySelector('#wskDm'),go=win.querySelector('#wskGo');
  if(!s){ic.innerHTML='';ic.classList.remove('sk','dim');dn.textContent=L.title;dd.textContent=L.empty?'ยังไม่มีสกิลของอาวุธที่ถืออยู่ (สกิลสายดาบใช้เมื่อถือดาบ)':'';dm.textContent='';go.textContent='ใช้สกิล';go.disabled=true;go.classList.remove('sm');{const as=win.querySelector('#wskAs');if(as){as.disabled=true;as.style.visibility='hidden';as.textContent='ใส่ช่องสกิล';}}return;}
  const ok=s.ok(),st=stOf(s),im=s.icon();ic.innerHTML=im?'<img alt="" src="'+im+'">':'';ic.classList.toggle('sk',!!(im&&s.type==='active'));ic.classList.toggle('dim',!!im&&st!=='on');
  dn.textContent=s.name;
  let d;try{d=ok?s.desc():'ยังไม่เปิดใช้งาน\nเป็นแบบร่างในรายการ ยังไม่มีเอฟเฟกต์และค่าในเกม';}catch(e){d='อ่านค่าไม่ได้ ('+e.message+')';}
  dd.textContent=d;
  let m='';
  if(ok&&s.type==='active'){try{const c=s.cost();const cd=(P&&P.cds&&P.cds[s.cdId])||0;m='MP '+c.mp+' · คูลดาวน์ '+c.cd+' วิ'+exp+(s.key?' · ปุ่ม '+s.key:'')+(cd>0?' · รอ '+cd.toFixed(1)+' วิ':'');}catch(e){}}
  else if(ok)m='พาสซีฟ · ทำงานเองตอนถือดาบ';else m='ชนิด: '+(s.type==='passive'?'พาสซีฟ':'สกิลใช้งาน')+' · ยังไม่มีในเกม';
  if(st==='lock')m='🔒 ปลดล็อกที่เลเวลตัวละคร '+needLv(s)+' (ตอนนี้ Lv.'+((typeof P!=='undefined'&&P&&P.lvl)|0)+')';else if(st==='draft')m+=' · แถวนี้ปลดล็อกที่ Lv.'+needLv(s);
  dm.textContent=m;
  const can=st==='on'&&s.type==='active';
  {const as=win.querySelector('#wskAs');if(as){as.disabled=!(can);as.style.visibility=can?'visible':'hidden';const at=SL.find(s.k);as.textContent=at>=0?'ช่อง '+SLOT_K[at].toUpperCase()+' · ย้าย':'ใส่ช่องสกิล';}}
  go.textContent=can?'ใช้สกิล':st==='on'?'ทำงานอยู่':st==='lock'?'ล็อกอยู่':'ยังไม่เปิดใช้งาน';go.disabled=!can;go.classList.toggle('sm',!can);}
function fit(){const bw=win.querySelector('.box').getBoundingClientRect().width;win.classList.toggle('tabs',bw<820);}
win.addEventListener('click',e=>{
  if(e.target===win){close();return;}
  if(e.target.closest('[data-x]')){close();return;}
  const tl=e.target.closest('[data-lv]');if(tl){try{P.jobLv=Math.max(1,Math.min(jobCap(),lv()+(+tl.dataset.lv)));P.jobExp=0;gate();render();}catch(err){W.err='lv '+err.message;}return;}
  const t=e.target.closest('[data-tab]');if(t){ST.tab=+t.dataset.tab;render();return;}
  const r=e.target.closest('.row');if(r){ST.sel=r.dataset.k;render();return;}
  if(e.target.closest('#wskAs')){const L=lineOf(wtype()),s=allSkills(L).find(x=>x.k===ST.sel);if(s&&stOf(s)==='on'&&s.type==='active'&&SL.startAssign(s.k))close();return;}
  if(e.target.closest('#wskGo')){const L=lineOf(wtype()),s=allSkills(L).find(x=>x.k===ST.sel);if(s&&stOf(s)==='on'&&s.type==='active'){close();setTimeout(()=>{try{s.start();}catch(err){W.err='use '+err.message;}},60);}}});
addEventListener('resize',()=>{if(W.open)fit();});
let sig='';setInterval(()=>{try{if(!W.open)return;const g=allSkills(lineOf(wtype())).map(x=>stOf(x)[0]).join('');if(wtype()!==ST.wt||g!==sig){sig=g;render();}else detail();}catch(e){W.err='tick '+e.message;}},300);
/* ---------------------------------------------------------------- open / close (hooked into the game's own window functions) ---------------------------------------------------------------- */
function release(){try{for(const k in keys)keys[k]=false;}catch(e){}try{mouse.down=false;}catch(e){}try{G.touch=null;}catch(e){}try{TOUCH.joy=null;}catch(e){}}
function close(){if(G.win==='wWpnSk')closeWin();else{win.hidden=true;W.open=false;}}
try{const _open=openWin;
openWin=function(id){if(id==='wSkill')id='wWpnSk';const r=_open.call(this,id);if(id==='wWpnSk'){W.open=true;release();ST.tab=Math.min(ST.tab,2);render();}return r;};}catch(e){W.err='hook openWin '+e.message;}
try{toggleWin=function(id){if(id==='wSkill')id='wWpnSk';if(G.win===id)closeWin();else openWin(id);};}catch(e){W.err='hook toggleWin '+e.message;}
try{const _close=closeWin;
closeWin=function(){const was=G.win==='wWpnSk';const r=_close.apply(this,arguments);if(was){W.open=false;release();}return r;};}catch(e){W.err='hook closeWin '+e.message;}
addEventListener('keydown',e=>{if(!W.open)return;const k=(e.key||'').toLowerCase();if(k==='k'||k==='escape')return;e.stopImmediatePropagation();if(!(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName)))e.preventDefault();},true);
addEventListener('keyup',e=>{if(!W.open)return;},true);
try{const b=document.querySelector('.mbtn[data-win="wSkill"]');if(b)b.title='ทักษะอาวุธ (K)';}catch(e){}
/* ---------------------------------------------------------------- public mode: sword skills + passives usable without the TEST panels ---------------------------------------------------------------- */
const PK=['mastery','chain','sharp','stand','breath'];
function gate(){try{const p=window.__PASS;if(!p||p.err)return;for(const k of PK)p.set(k,unlocked(SK[k])&&SK[k].ok());}catch(e){W.err='gate '+e.message;}}
setInterval(gate,400);
let lastToast=0;
addEventListener('keydown',e=>{if(W.open||!W.public||e.repeat)return;const k=(e.key||'').toLowerCase();const m={j:'sk1',u:'sk2',o:'sk3',y:'prov',b:'atk3',n:'atk4',r:'atk5'}[k];if(!m||!swordNow())return;const s=SK[m];
  if(s.ok()&&!unlocked(s)){e.stopImmediatePropagation();const t=performance.now();if(t-lastToast>800){lastToast=t;try{textAt(P.x,P.y-62,s.name+': ล็อกอยู่ ต้องเลเวลตัวละคร '+needLv(s),'#ffd98a',13);}catch(err){}}}},true);
const MODS=[['__SKATK5','test'],['__SKATK4','test'],['__SKATK3','test'],['__SK1','test'],['__SK2L','test'],['__SK3','test'],['__PROV','test'],['__SKBUF3','test'],['__SKBUF4','test'],['__SKBUF5','test']];
function enable(){
  if(W.public)return true;
  const need=['__SK1','__SK2L','__SK3','__PROV','__PASS','__SKATK3','__SKATK4','__SKATK5'].every(n=>window[n]);if(!need)return false;
  for(const [n] of MODS){const m=window[n];if(m&&!m.err)m.test=true;}try{if(window.__SKBUFF)window.__SKBUFF.test=true;}catch(e){}
  const p=window.__PASS;if(!p.err){p.test=true;gate();}
  W.public=true;W.log.push({ev:'public',t:+(typeof time==='number'?time:0).toFixed(2),errs:['__SK1','__SK2L','__SK3','__PROV','__PASS'].map(n=>window[n].err||null)});return true;}
const en=setInterval(()=>{try{if(enable())clearInterval(en);}catch(e){W.err='enable '+e.message;}},500);
/* ---------------------------------------------------------------- sword skills in the game's real skill slots (player-assigned, nothing pre-filled) ---------------------------------------------------------------- */
const SLOT_K=['1','2','3','4','5','6','q','e','r','f'],KEYTAKEN={r:'atk5'};
const SL=W.slots={map:{},msg:'',assign:null,err:null};
try{SL.map=JSON.parse(localStorage.getItem('lanternfall_wsSlots_v1')||'{}')||{};}catch(e){SL.map={};}
const SLK=['sk1','sk2','atk3','atk4','atk5','buf3','buf4','buf5'];
for(const i in SL.map)if(!SLK.includes(SL.map[i])||+i>9||+i<0||(SLOT_K[+i]==='r'&&SL.map[i]!=='atk5'))delete SL.map[i];
SL.save=()=>{try{localStorage.setItem('lanternfall_wsSlots_v1',JSON.stringify(SL.map));}catch(e){}};
SL.find=k=>{for(const i in SL.map)if(SL.map[i]===k)return +i;return -1;};
const slCss=document.createElement('style');slCss.textContent='body.wsAsNoR #bar .slot.wsrsv,body.wsAsNoR #tSkills .tsk.wsrsv{outline:2px solid #8a8a8a!important;animation:none!important;opacity:.5}body.wsAsNoR #bar .slot.wsrsv::after,body.wsAsNoR #tSkills .tsk.wsrsv::after{content:"R สงวน";position:absolute;left:0;right:0;bottom:2px;text-align:center;font:700 9px sans-serif;color:#ffd98a;background:rgba(0,0,0,.7);z-index:5;pointer-events:none}.slot.wsk{background:none!important;border:0!important;overflow:visible;border-radius:7px}.slot.wsk img{inset:0!important;width:100%!important;height:100%!important;border-radius:0!important;box-shadow:none!important;border:0!important;outline:0}.slot.wsk .cd{border-radius:0 0 7px 7px}.slot.wsk .wstx{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:3px;border-radius:8px;border:1px solid rgba(214,176,92,.85);background:linear-gradient(180deg,rgba(52,40,24,.96),rgba(18,14,9,.96));color:#ffe9b0;font:700 10px/1.15 sans-serif;overflow:hidden}.slot.wsk.wsoff .wstx{filter:grayscale(.85) brightness(.6)}.slot.wsk.wsoff img{filter:grayscale(.85) brightness(.55)}.slot.wsk.nomp img{filter:brightness(.6)}.slot.wsk.wson{box-shadow:0 0 0 2px #ff9a60,0 0 10px rgba(255,100,40,.75)}body.mobile #tSkills .tsk.wsk{border-radius:9px;overflow:visible}body.mobile #tSkills .tsk.wsk::before{border-radius:11px}body.mobile #tSkills .tsk.wsk::after{display:none!important}body.mobile #tSkills .tsk.wsk img{inset:0!important;width:100%!important;height:100%!important;border-radius:0!important;filter:none;z-index:2}body.mobile #tSkills .tsk.wsk.wsoff img{filter:grayscale(.85) brightness(.55)}body.mobile #tSkills .tsk.wsk.nomp img{filter:brightness(.6)}body.mobile #tSkills .tsk.wsk .cd{inset:0!important;border-radius:0 0 9px 9px!important;z-index:3}body.mobile.wsAssign #tSkills .tsk:not([data-sk]){display:block!important;border-radius:50%;background:rgba(10,14,24,.55);border:1px dashed #ffd98a}body.wsAssign #bar .slot:not(.pot),body.wsAssign #tSkills .tsk{outline:2px dashed #ffd98a;outline-offset:-2px;animation:wsPulse 1s ease-in-out infinite}@keyframes wsPulse{50%{outline-color:rgba(255,217,138,.25)}}#wsAssignMsg{position:fixed;left:50%;top:14%;transform:translateX(-50%);z-index:70;padding:8px 16px;border-radius:12px;background:rgba(20,15,8,.92);border:1px solid #d6b05c;color:#ffe9b0;font-size:14px;font-weight:700;display:none;pointer-events:none;text-align:center;max-width:90vw}';document.head.appendChild(slCss);
const slMsg=document.createElement('div');slMsg.id='wsAssignMsg';document.body.appendChild(slMsg);
let slMsgT=0;function say(t,ms){slMsg.textContent=t;slMsg.style.display='block';clearTimeout(slMsgT);if(ms)slMsgT=setTimeout(()=>{slMsg.style.display='none';},ms);}
SL.startAssign=k=>{SL.assign=k;document.body.classList.add('wsAssign');document.body.classList.toggle('wsAsNoR',k!=='atk5');say('แตะช่องสกิลที่ต้องการวาง'+(SK[k]?' "'+SK[k].name+'"':'')+' · แตะนอกช่องเพื่อยกเลิก',0);return true;};
SL.stopAssign=()=>{SL.assign=null;document.body.classList.remove('wsAssign','wsAsNoR');slMsg.style.display='none';};
SL.set=(i,k)=>{if(SLOT_K[i]==='r'&&k!=='atk5'){say('ช่อง R ถูกสงวนไว้ให้ "เขตแดนดาบพิทักษ์" (คีย์ R ใช้สกิลนี้อยู่แล้ว) — วางได้เฉพาะสกิลนั้น เลือกช่องอื่นสำหรับ "'+(SK[k]?SK[k].name:k)+'"',3200);return false;}
  const o=SL.find(k);if(o>=0)delete SL.map[o];SL.map[i]=k;SL.save();SL.refresh(true);return true;};
SL.clear=i=>{delete SL.map[i];SL.save();SL.refresh(true);};
const slOn=()=>W.public&&swordNow();
function slotUse(k,ph){const s=SK[k],m=mod[k]&&mod[k]();if(!s||!m)return false;
  if(!(s.ok()&&unlocked(s))){const t=performance.now();if(t-lastToast>800){lastToast=t;try{textAt(P.x,P.y-62,s.name+(s.ok()?': ล็อกอยู่ ต้องเลเวลตัวละคร '+needLv(s):': ยังไม่เปิดใช้งาน'),'#ffd98a',13);}catch(e){}}return false;}
  try{if(k==='atk4'){if(ph==='down')m.press('slot');else if(ph==='up')m.release();else if(ph==='cancel')m.cancelInput('slot cancel');}else if(ph==='down')s.start();}catch(err){SL.err='use '+err.message;}return true;}
function paint(el,k){if(el.dataset.ws===k&&el.classList.contains('wsk'))return;const im=ICO(k),s=SK[k],ki=el.querySelector('kbd');const kt=ki?ki.textContent:'';
  el.innerHTML=(im?'<img alt="'+s.name+'" src="'+im+'">':'<div class="wstx">'+s.name+'</div>')+'<div class="cd"></div><div class="cdt"></div>'+(kt?'<kbd>'+kt+'</kbd>':'');
  el.classList.add('wsk');el.dataset.ws=k;if(el.classList.contains('tsk'))el.setAttribute('data-sk','ws:'+k);else el.removeAttribute('data-sk');el.removeAttribute('draggable');el.title=s.name;}
SL.apply=()=>{try{const on=slOn();
  for(const el of document.querySelectorAll('#bar .slot[data-i],#tSkills .tsk[data-ti]')){const i=+(el.dataset.i!==undefined?el.dataset.i:el.dataset.ti),k=SL.map[i];
    if(on&&k&&SK[k])paint(el,k);el.classList.toggle('wsrsv',SLOT_K[i]==='r'&&on);}
}catch(e){SL.err='apply '+e.message;}};
let slSig='';
SL.refresh=force=>{const sig=JSON.stringify(SL.map)+'|'+slOn();if(!force&&sig===slSig){SL.apply();return;}slSig=sig;try{buildBar();}catch(e){}SL.apply();};
try{const _bb=buildBar;buildBar=function(){const r=_bb.apply(this,arguments);SL.apply();return r;};}catch(e){SL.err='hook buildBar '+e.message;}
try{const _bt=buildTouchSkills;buildTouchSkills=function(){const r=_bt.apply(this,arguments);SL.apply();return r;};}catch(e){SL.err='hook touch '+e.message;}
function slotEl(e){return e.target&&e.target.closest&&e.target.closest('#bar .slot[data-i]:not(.pot),#tSkills .tsk[data-ti]');}
const slIdx=el=>+(el.dataset.i!==undefined?el.dataset.i:el.dataset.ti);
function slEvt(ev,ph){addEventListener(ev,e=>{
  if(SL.assign){const el=slotEl(e);
    if(ev==='click'||ev==='pointerdown'){e.stopImmediatePropagation();e.preventDefault&&e.preventDefault();
      if(ev==='pointerdown')return;   // act on click only (pointerdown is swallowed so the touch ring does not cast)
      if(el){if(SL.set(slIdx(el),SL.assign))SL.stopAssign();}else SL.stopAssign();}
    return;}
  const el=slotEl(e);if(!el||!el.dataset.ws)return;
  if(ev==='contextmenu'){e.preventDefault();e.stopImmediatePropagation();SL.clear(slIdx(el));return;}
  e.stopImmediatePropagation();if(ev!=='pointerup'&&ev!=='pointercancel'&&e.cancelable)e.preventDefault();
  const k=el.dataset.ws;
  if(k==='atk4'){if(ev==='pointerdown'){try{el.setPointerCapture(e.pointerId);}catch(x){}slotUse(k,'down');}else if(ev==='pointerup')slotUse(k,'up');else if(ev==='pointercancel')slotUse(k,'cancel');}
  else if(ev==='pointerdown')slotUse(k,'down');
  if(ev==='pointerdown'&&el.classList.contains('tsk')){el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),350);}
 },true);}
for(const ev of ['pointerdown','pointerup','pointercancel','click','contextmenu'])slEvt(ev);
addEventListener('keydown',e=>{if(e.key==='Escape'&&SL.assign){SL.stopAssign();return;}
  if(W.open||e.repeat||!slOn()||G.win||G.state!=='play')return;const k=(e.key||'').toLowerCase(),i=SLOT_K.indexOf(k);if(i<0||k==='r')return;const sk=SL.map[i];if(!sk)return;
  if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))return;e.stopImmediatePropagation();e.preventDefault();slotUse(sk,'down');},true);
addEventListener('keyup',e=>{if(W.open||!slOn())return;const k=(e.key||'').toLowerCase(),i=SLOT_K.indexOf(k);if(i<0||k==='r')return;if(SL.map[i]==='atk4'){e.stopImmediatePropagation();slotUse('atk4','up');}},true);
setInterval(()=>{try{if(SL.assign&&(G.win||G.state!=='play'))SL.stopAssign();SL.refresh(false);if(!slOn())return;
  for(const el of document.querySelectorAll('.slot.wsk[data-ws]')){const k=el.dataset.ws,s=SK[k];if(!s)continue;const ok=s.ok()&&unlocked(s);el.classList.toggle('wsoff',!ok);
    let c=null;try{c=s.cost();}catch(e){}const cd=(P.cds&&P.cds[s.cdId])||0;const cdE=el.querySelector('.cd'),tE=el.querySelector('.cdt');
    if(ok&&c){cdE.style.setProperty('--cd',cd>0?Math.min(1,cd/c.cd):0);tE.textContent=cd>0?(cd>=10?String(Math.ceil(cd)):cd.toFixed(1)):'';el.classList.toggle('nomp',P.mp<c.mp);}else{cdE.style.setProperty('--cd',0);tE.textContent='';}
    const m=mod[k]();el.classList.toggle('wson',!!(m&&(m.state||(m.buff&&m.buff.on)||(typeof m.active==='function'&&m.active().length))));}
 }catch(e){SL.err='tick '+e.message;}},120);
/* ---------------------------------------------------------------- skill buttons ---------------------------------------------------------------- */
const BAR=[['sk1','พายุคมดาบ','J'],['sk2','เขี้ยวผ่าศิลา','U'],['atk3','วังวนเจ็ดคม','B'],['atk4','ดาบพิพากษา','N'],['atk5','เขตแดนดาบพิทักษ์','R'],['sk3','นักดาบคลั่ง','O'],['prov','คำรามท้าศึก','Y'],['buf3','ตั้งรับเหล็กกล้า',''],['buf4','ย่างก้าวนักรบ',''],['buf5','คมดาบดูดชีพ','']];
const bar=document.createElement('div');bar.id='wsBar';
bar.innerHTML=BAR.map(b=>{const ic=ICO(b[0]);return ic?'<button type="button" class="ico" data-s="'+b[0]+'" title="'+b[1]+'" aria-label="'+b[1]+'"><img alt="'+b[1]+'" src="'+ic+'"><span class="k">'+b[2]+'</span><span class="cd"></span><span class="ct"></span></button>':'<button type="button" data-s="'+b[0]+'">'+b[1]+'<span class="k">'+b[2]+'</span><span class="cd"></span><span class="ct"></span></button>';}).join('');
document.body.appendChild(bar);
for(const ev of ['pointerdown','pointerup','mousedown','mouseup','touchstart','touchend','click'])bar.addEventListener(ev,e=>e.stopPropagation());
bar.addEventListener('click',e=>{const b=e.target.closest('button[data-s]');if(!b||b.dataset.s==='atk4')return;const s=SK[b.dataset.s];if(s&&s.ok()){try{s.start();}catch(err){W.err='bar '+err.message;}}});
/* hold-to-charge button (touch + mouse): pointerdown = press, pointerup = release, anything that cancels the pointer = cancel the charge (no slash, no refund) */
{const hb=bar.querySelector('button[data-s="atk4"]');
 if(hb){const M=()=>window.__SKATK4;
  hb.addEventListener('pointerdown',e=>{const m=M(),s=SK.atk4;if(!m||m.err||!s.ok()||!unlocked(s))return;e.preventDefault();try{hb.setPointerCapture(e.pointerId);}catch(x){}try{m.press('ptr');}catch(err){W.err='atk4 press '+err.message;}});
  hb.addEventListener('pointerup',e=>{const m=M();if(m&&!m.err)m.release();try{hb.releasePointerCapture(e.pointerId);}catch(x){}});
  for(const ev of ['pointercancel','lostpointercapture'])hb.addEventListener(ev,()=>{const m=M();if(m&&!m.err)m.cancelInput('pointer '+ev);});
  hb.addEventListener('contextmenu',e=>e.preventDefault());hb.style.touchAction='none';}}
function placeBar(){try{const ts=document.getElementById('tSkills');
  if(innerWidth<=900){bar.style.right='8px';bar.style.top='56px';bar.style.bottom='auto';return;}   // narrow / touch layout: 2x2 under the top buttons, clear of the attack ring and the zone banner
  bar.style.right='16px';bar.style.bottom='172px';bar.style.top='auto';}catch(e){}}
setInterval(()=>{try{
  const show=W.public&&G.state==='play'&&!G.win&&swordNow()&&!(typeof ED!=='undefined'&&ED.on);
  bar.style.display=show?'flex':'none';if(!show)return;placeBar();
  for(const b of bar.children){const s=SK[b.dataset.s],ok=s.ok()&&unlocked(s);b.style.display=ok?'':'none';if(!ok)continue;
    let c;try{c=s.cost();}catch(e){continue;}const cd=(P.cds&&P.cds[s.cdId])||0;
    b.querySelector('.cd').style.height=cd>0?Math.min(100,cd/c.cd*100)+'%':'0';b.querySelector('.ct').textContent=cd>0?(cd>=10?Math.ceil(cd):cd.toFixed(1)):'';
    b.classList.toggle('nomp',P.mp<c.mp);
    const m=mod[s.k]();b.classList.toggle('on',!!(m&&(m.state||(m.buff&&m.buff.on)||(typeof m.active==='function'&&m.active().length))));}
 }catch(e){W.err='bar tick '+e.message;}},120);
/* ---------------------------------------------------------------- class / job system off ---------------------------------------------------------------- */
try{itemClasses=function(){return null;};canEquip=function(){return true;};classLabel=function(){return 'ทุกอาชีพ';};canAdvance=function(){return false;};}catch(e){W.err='class '+e.message;}
try{for(const k in CLASSES)CLASSES[k].jobCap=50;}catch(e){W.err='cap '+e.message;}
try{gainJobExp=function(x,tx,ty){if(P.jobLv>=jobCap())return;P.jobExp+=x;if(tx!==undefined)textAt(tx+22,ty+16,'+'+fmt(x)+' ชำนาญ','#7fe8ff',12,{life:1.1,vy:-40});
  while(P.jobLv<jobCap()&&P.jobExp>=needJob(P.jobLv)){P.jobExp-=needJob(P.jobLv);P.jobLv++;jobLevelUp();}if(P.jobLv>=jobCap())P.jobExp=0;};}catch(e){W.err='gain '+e.message;}
try{jobLevelUp=function(){fx.push({k:'pillar',x:P.x,y:P.y,t:0,dur:1.1,col:'#7fe8ff',w:50,h:320});ring(P.x,P.y,10,160,.6,'#7fe8ff',5);
  textAt(P.x,P.y-104,'ชำนาญอาวุธ Lv '+P.jobLv+'!','#7fe8ff',22,{life:1.5,vy:-35});
  log('ชำนาญอาวุธ Lv '+P.jobLv+'/'+jobCap()+'','g');};}catch(e){W.err='jlu '+e.message;}
try{const chip=document.getElementById('cJob');if(chip){const fix=()=>{const t=chip.textContent;if(/^Job /.test(t))chip.textContent=t.replace(/^Job (\d+)\/(\d+)/,'ชำนาญ Lv $1/$2');};fix();new MutationObserver(fix).observe(chip,{childList:true,characterData:true,subtree:true});}}catch(e){W.err='chip '+e.message;}
setInterval(()=>{try{const sp=document.querySelector('.xpr.j span');if(sp&&sp.textContent==='JOB')sp.textContent='ชำนาญ';}catch(e){}},700);
try{const _ri=renderInv;renderInv=function(){const r=_ri.apply(this,arguments);try{const s=document.getElementById('invSub');if(s)s.textContent=s.textContent.replace(/Job Lv/,'ชำนาญอาวุธ Lv').replace(/^[^·]*·\s*/,'');}catch(e){}return r;};}catch(e){}
setInterval(()=>{try{if(P)P.skillPts=0;}catch(e){}},400);
}catch(e){W.err='init '+e.message;}
})();

