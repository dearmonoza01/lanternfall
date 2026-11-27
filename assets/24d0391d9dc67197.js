/* p313 — GM UPGRADE test panel (DeaRz 26 Oct 16:52 "ขอ แผง gm ลองเทสอัฟเกรดหน่อย"): gold, smith materials, weapon +refine, status points, six stats, skill points, level.
   Touches only the running game; nothing is saved by the panel. Button "🔧 อัปเกรด" only with ?gm=on. */
(function(){try{
if(!/[?&]gm=on\b/.test(location.search))return;if(window.__GUP)return;const GU=window.__GUP={on:false,err:null};
const css=document.createElement('style');css.textContent='#gupBtn{position:fixed;left:10px;top:322px;z-index:9998;background:#b26a00;color:#fff;border:2px solid #ffe0a0;border-radius:10px;padding:8px 12px;font:700 14px system-ui;min-height:40px;cursor:pointer;opacity:.92}'
 +'#gupP{position:fixed;left:10px;top:370px;z-index:9998;width:290px;max-height:62vh;overflow:auto;background:rgba(26,16,6,.96);color:#eee;border:1px solid #d9a040;border-radius:12px;padding:10px;font:13px/1.45 system-ui;display:none}'
 +'#gupP h4{margin:10px 0 4px;font-size:12px;color:#ffd58a;letter-spacing:.04em}#gupP h4:first-child{margin-top:0}'
 +'#gupP .r{display:flex;flex-wrap:wrap;gap:5px;align-items:center}#gupP button{font:600 13px system-ui;background:#5a3a14;color:#fff;border:1px solid #c89040;border-radius:8px;padding:7px 10px;min-height:38px;cursor:pointer}#gupP button:active{filter:brightness(1.3)}'
 +'#gupP .m{color:#cfc;font-size:12px;min-height:16px;margin-top:6px}#gupP .i{color:#ddd;font-size:12px;margin-bottom:4px}#gupP .sr{display:flex;align-items:center;gap:6px;width:100%}#gupP .sr b{width:34px}#gupP .sr em{width:34px;text-align:center;font-style:normal}#gupP .sr button{min-height:32px;padding:4px 9px}';
document.head.appendChild(css);
const btn=document.createElement('button');btn.id='gupBtn';btn.type='button';btn.textContent='🔧 อัปเกรด';
const pan=document.createElement('div');pan.id='gupP';
const stop=e=>e.stopPropagation();for(const el of [btn,pan])for(const ev of ['pointerdown','pointerup','mousedown','mouseup','touchstart','touchend','click','keydown','keyup','wheel'])el.addEventListener(ev,stop);
const info=document.createElement('div'),msgEl=document.createElement('div');info.className='i';msgEl.className='m';
const msg=t=>{msgEl.textContent=t;upd();};
const safe=(f,n)=>()=>{try{f();}catch(e){GU.err=n+' '+e.message;msgEl.textContent='ผิดพลาด: '+n+' '+e.message;}};
const sec=t=>{const h=document.createElement('h4');h.textContent=t;pan.appendChild(h);const r=document.createElement('div');r.className='r';pan.appendChild(r);return r;};
const add=(r,t,f)=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.addEventListener('click',safe(f,t));r.appendChild(b);return b;};
const fmtN=n=>(n|0).toLocaleString('en-US');
const rf=()=>{const it=P.weapon;return it&&it.t!=='fist'?it:null;};
const redraw=()=>{try{recalc();}catch(_){}try{if(G.win==='wInv')renderInv();}catch(_){}try{if(G.win==='wSkill')renderSkillWin();}catch(_){}try{if(G.win==='wRefine')renderRefine();}catch(_){}try{buildBar();}catch(_){}};
const stats=['str','agi','vit','int','dex','luk'];
const sv={};
function upd(){try{if(typeof P==='undefined'||!P)return;const w=rf();let nx='';
  if(w){const I=refineInfo(w);nx=I?` · ตีบวกต่อไป +${I.n}: ${Math.round(I.rate*100)}% (ใช้ ${ITEMS[I.mat].n} 1 + ${fmtN(I.fee)} G)`:' · ตีบวกสูงสุดแล้ว';}
  info.textContent=`Gold ${fmtN(P.gold)} · Lv ${P.lvl} · Job ${P.jobLv} · แต้มสเตตัส ${P.statPts} · แต้มสกิล ${P.skillPts}\nอาวุธ: ${w?itemName(w)+nx:'ไม่มี (มือเปล่า)'}`;info.style.whiteSpace='pre-line';
  for(const k of stats)if(sv[k])sv[k].textContent=P.stats[k];}catch(_){}}
let r=sec('สถานะปัจจุบัน');pan.appendChild(info);
r=sec('เงิน และของตีบวก');
add(r,'+100,000 G',()=>{P.gold+=1e5;redraw();msg('+100,000 G');});
add(r,'+10,000,000 G',()=>{P.gold+=1e7;redraw();msg('+10,000,000 G');});
add(r,'+50 Smithing Gem',()=>{addItem({id:'smithGem',q:50});msg('+50 Smithing Gem (ตีบวก +1~+5)');});
add(r,'+50 Gem Upgrade',()=>{addItem({id:'smithGemUp',q:50});msg('+50 Smithing Gem Upgrade (ตีบวก +6~+10)');});
add(r,'+10 ใบโชคดี',()=>{addItem({id:'luckScroll',q:10});msg('+10 Blessed Luck Scroll');});
add(r,'+10 ใบคงที่',()=>{addItem({id:'safeScroll',q:10});msg('+10 Steadfast Scroll');});
r=sec('ตีบวกอาวุธที่ถืออยู่');
add(r,'ตีบวกให้ 1 ครั้ง',()=>{const w=rf();if(!w){msg('ไม่มีอาวุธ');return;}const I=refineInfo(w);if(!I){msg('ตีบวกสูงสุด +10 แล้ว');return;}
  if(countItem(I.mat)<1)addItem({id:I.mat,q:1});if(P.gold<I.fee)P.gold+=I.fee;const was=w.refine||0;refineItem(w);redraw();msg((w.refine||0)>was?`สำเร็จ +${w.refine}`:`ล้มเหลว ระดับ +${w.refine||0}`);});
for(const n of [0,4,5,9,10])add(r,'ตั้ง +'+n,()=>{const w=rf();if(!w){msg('ไม่มีอาวุธ');return;}w.refine=n;redraw();msg('ตั้งอาวุธเป็น +'+n+' (ดูค่า ATK ในหน้าต่างตัวละคร)');});
add(r,'เปิดหน้าตีบวก',()=>{try{openWin('wRefine');}catch(e){msg('เปิดไม่ได้ — ไปหา Master Smith');}});
r=sec('Status Points');
add(r,'+50 แต้ม',()=>{P.statPts+=50;redraw();msg('+50 แต้มสเตตัส (กดเพิ่มในหน้าต่าง Status)');});
add(r,'+500 แต้ม',()=>{P.statPts+=500;redraw();msg('+500 แต้มสเตตัส');});
add(r,'รีเซ็ตสเตตัส',()=>{const b=statReset();redraw();msg('รีเซ็ต คืน '+b+' แต้ม');});
add(r,'ทุกสเตต=50',()=>{for(const k of stats)P.stats[k]=50;redraw();msg('ตั้งทุกสเตต = 50');});
add(r,'ทุกสเตต=99',()=>{for(const k of stats)P.stats[k]=99;redraw();msg('ตั้งทุกสเตต = 99');});
add(r,'ทุกสเตต=200',()=>{for(const k of stats)P.stats[k]=200;redraw();msg('ตั้งทุกสเตต = 200 (ทดสอบเกินเพดาน)');});
const holder=document.createElement('div');holder.style.width='100%';pan.appendChild(holder);
for(const k of stats){const row=document.createElement('div');row.className='sr';const lab=document.createElement('b');lab.textContent=k.toUpperCase();const val=document.createElement('em');sv[k]=val;
  const mk=(t,d)=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.addEventListener('click',safe(()=>{P.stats[k]=Math.max(1,Math.min(300,(P.stats[k]|0)+d));redraw();msg(k.toUpperCase()+' = '+P.stats[k]);},t));return b;};
  row.append(lab,mk('−10',-10),mk('−1',-1),val,mk('+1',1),mk('+10',10));holder.appendChild(row);}
r=sec('สกิล / เลเวล');
add(r,'+10 แต้มสกิล',()=>{P.skillPts+=10;redraw();msg('+10 Skill Points');});
add(r,'Job เต็ม',()=>{P.jobLv=jobCap();redraw();msg('Job Lv '+P.jobLv);});
for(const n of [30,60,100])add(r,'Lv '+n,()=>{P.lvl=n;let pts=20;for(let l=2;l<=n;l++)pts+=3+Math.floor(l/5);P.statPts+=pts;P.jobLv=Math.max(P.jobLv|0,Math.min(jobCap(),50));redraw();P.hp=P.maxHp;P.mp=P.maxMp;msg('ตั้งเลเวล '+n+' (+'+pts+' แต้มสเตตัส)');});
pan.appendChild(msgEl);
const tip=document.createElement('div');tip.className='m';tip.style.color='#aaa';tip.textContent='ค่าในแผงนี้ตั้งตรง ไม่เซฟ — รีโหลดหน้าแล้วกลับเป็นปกติ';pan.appendChild(tip);
btn.addEventListener('click',()=>{GU.on=!GU.on;pan.style.display=GU.on?'block':'none';upd();});
document.body.appendChild(btn);document.body.appendChild(pan);
setInterval(()=>{try{const pl=typeof G!=='undefined'&&G.state==='play';btn.style.display=pl?'':'none';pan.style.display=(pl&&GU.on)?'block':'none';if(pl&&GU.on)upd();}catch(_){}},500);
}catch(e){window.__GUPERR=e.message;}})();

/* p314 — attack-speed cap 5 hits/s (DeaRz 26 Oct 17:33): same base speed, cap 10 → 5, AGI 180 reaches the cap (aspdF 1 + 2.975·min(1,AGI/180), set in recalc_v3). ?stats=off keeps the old cap 10. */
(function(){try{if(!(window.ST6&&ST6.on))return;
const B=window.__BAL1;if(!B||!B.cfg||!B.cfg.rate)throw new Error('__BAL1 missing');B.cfg.rate.cap=5;
const BW=window.BOW;if(BW&&BW.cfg)BW.cfg.maxSpd=5*B.cfg.rate.bowShot;
window.__RATE5={ok:true};}catch(e){window.__RATE5={ok:false,err:e.message};}})();
