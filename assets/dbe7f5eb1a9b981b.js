
/* p319 r1 — holy staff full kit (DeaRz 27 Oct 05:29 "รอครบชุด": every holy skill + poses in ONE test file). Needs p318 (HOLYW) + p290 (HOLY).
   15 holy skills in the staff skill window while the holy staff is held (window "ทักษะสายคทาพระ"), own slot map (lanternfall_holySlots_v1),
   keys J U B N R (attacks) O Y (2 buffs) + slots 1–6 Q E R F like the arcane staff. Numbers = balance REPORT_20261022_elements-v2_holy Lv4 (passives Lv4),
   no level-up yet (Lv4 fixed, TEST). Rows open at player Lv 1/10/15/20/25 like every weapon.
   attack : แสงพิพากษา (p290) · โคมลอยวิญญาณ · ตราผนึกแสง · วงแหวนทัณฑ์สวรรค์ · ฝนหอกศักดิ์สิทธิ์ (p290)
   support: แสงฟื้นฟู · พรแห่งแสง · ม่านพิทักษ์ · เร่งมานา · รัศมีอรุณ
   passive: ศรัทธา · ใจเมตตา (party only) · แสงสะท้อน · เปลวไม่ดับ · ผู้พิทักษ์
   Poses = the 3D v7 holy clips: shot (heal), slam (seal), buff (bless/ward/mana/lanterns), aura (ring/halo). VFX = code-drawn + approved holy pieces
   (window.__HOLYA) + V7 rune rims (STF.runeRing). Off: ?holyk=off (= p318 r1). Debug: window.HOLYK. */
(function(){'use strict';const Q=String(location.search);
const HK=window.HOLYK={ver:'p319-r1',ok:!/holyk=off/.test(Q),err:null,list:[],buf:{},stats:{casts:{},refused:0,hits:{},dmg:{},heal:{},undying:0,reflect:0,guard:0,peakP:0,shieldAbs:0}};
if(!HK.ok)return;
try{
const R=window.STF,HW=window.HOLYW,HO=window.HOLY,A=window.__HOLYA,IC=window.__HOLYIC,SA=window.__STFA,W=window.__WSK;
if(!R||!R.cfg||!R.skills||!R.slots||!HW||!HW.ok||!HO||!A||!A.fx||!IC||!SA||!SA.icons||!W||!W.lines||typeof hitEnemy!=='function'||!window.C182){HK.err='missing '+[!R&&'STF',!HW&&'HOLYW',!HO&&'HOLY',!IC&&'icons'].filter(Boolean).join(' ');HK.ok=false;return;}
const CFG=R.cfg,SKB=R.skills,SS=R.slots;
const clk=()=>typeof time==='number'?time:performance.now()/1000;
const clamp=(v,a,b)=>v<a?a:v>b?b:v,ease=x=>1-Math.pow(1-clamp(x,0,1),3),seg=(t,a,b)=>clamp((t-a)/(b-a),0,1);
const rf=()=>typeof rng==='function'?rng():Math.random(),rnd=(a,b)=>a+rf()*(b-a);
const T=()=>{try{return typeof camT==='function'?camT():.866;}catch(_){return .866;}};
const KY=.55;let KL=.476;
const GOLD='#ffd36b',CREAM='#fff6dc',AMB='#ffb347',PINK='#ffc7a8',HEALC='#b8f07a',SKY='#7fd0ff';
const liveE=e=>!!(e&&!e.dead&&e.hp>0&&!e.sprGhost&&!e.dev&&!e.removed);
const undead=e=>!!(e&&(e.elem==='Undead'));
const holyOn=()=>!!(HW.on&&typeof P!=='undefined'&&P&&P.weapon&&P.weapon.t==='staff');
const unlockAt=row=>{const u=(W.cfg&&W.cfg.unlock)||[1,10,15,20,25];return u[Math.min(row|0,u.length-1)];};
const unl=c=>((typeof P!=='undefined'&&P&&P.lvl)|0)>=unlockAt(c.row);
const pas=k=>holyOn()&&!P.dead&&unl(CFG[k]);
/* ---------- skills (Lv4, passives Lv4) ---------- */
const HC={
  h_jl:  {id:'holyJL',name:'แสงพิพากษา',col:0,row:0,ic:'jl',el:'Light',mp:20,cd:6,range:360,ext:'jl',lock:.95},
  h_lant:{id:'hkLant',name:'โคมลอยวิญญาณ',col:0,row:1,ic:'lant',el:'Light',mp:22,cd:16,n:2,sparks:7,mul:.36,every:1.5,dur:10,range:300,rel:.5,lock:.75,clip:'buff'},
  h_seal:{id:'hkSeal',name:'ตราผนึกแสง',col:0,row:2,ic:'seal',el:'Light',mp:22,cd:14,mul:.90,ticks:6,r:110,range:340,slow:.30,stun:.5,dur:6,rel:.75,lock:1.0,clip:'slam',aimArea:1},
  h_ring:{id:'hkRing',name:'วงแหวนทัณฑ์สวรรค์',col:0,row:3,ic:'ring',el:'Light',mp:26,cd:20,mul:.60,ticks:10,r:150,heal:.20,healCap:.025,dur:10,rel:.5,lock:.75,clip:'aura'},
  h_sr:  {id:'holySR',name:'ฝนหอกศักดิ์สิทธิ์',col:0,row:4,ic:'ult',el:'Light',mp:45,cd:40,range:320,r:220,ext:'sr',lock:1.5,aimArea:1},
  h_heal:{id:'hkHeal',name:'แสงฟื้นฟู',col:1,row:0,ic:'heal',el:'Light',mp:20,cd:8,pct:.25,undead:2.5,range:300,rel:.79,lock:1.0,clip:'shot'},
  h_bless:{id:'hkBless',name:'พรแห่งแสง',col:1,row:1,ic:'bless',mp:18,cd:40,atk:.12,dur:20,rel:.5,lock:.75,clip:'buff',buff:1},
  h_ward:{id:'hkWard',name:'ม่านพิทักษ์',col:1,row:2,ic:'ward',mp:20,cd:18,hp:.18,dur:8,rel:.5,lock:.75,clip:'buff',buff:1},
  h_mana:{id:'hkMana',name:'เร่งมานา',col:1,row:3,ic:'mana',mp:0,cd:30,regen:.5,dur:8,rel:.5,lock:.75,clip:'buff',buff:1},
  h_halo:{id:'hkHalo',name:'รัศมีอรุณ',col:1,row:4,ic:'halo',mp:25,cd:45,spd:.20,heal:.02,r:200,dur:12,rel:.5,lock:.75,clip:'aura',buff:1},
  h_faith:{name:'ศรัทธา',col:2,row:0,ic:'faith',pas:1,heal:.18},
  h_mercy:{name:'ใจเมตตา',col:2,row:1,ic:'mercy',pas:1,back:.36},
  h_reflect:{name:'แสงสะท้อน',col:2,row:2,ic:'reflect',pas:1,mul:1.2,r:150},
  h_undying:{name:'เปลวไม่ดับ',col:2,row:3,ic:'undying',pas:1,cdS:125},
  h_guard:{name:'ผู้พิทักษ์',col:2,row:4,ic:'guard',pas:1,def:.10,below:.40}};
const pc=v=>Math.round(v*1000)/10;
const DESC={
  h_jl:c=>'ลำแสงตกใส่มอน 1 ตัว ดาเมจแสง 420% ของตีปกติ · ระยะ 360',
  h_lant:c=>'โคมแสง '+c.n+' ดวงลอยรอบตัว '+c.dur+' วิ ยิงประกายใส่มอนในระยะ '+c.range+' ทุก '+c.every+' วิ · โคมละ '+c.sparks+' ประกาย × '+pc(c.mul)+'% (รวม '+Math.round(c.n*c.sparks*c.mul*100)+'%) · มอนตายแล้วประกายที่เหลือยิงตัวถัดไป',
  h_seal:c=>'วางตราแสงบนพื้น รัศมี '+c.r+' นาน '+c.dur+' วิ · มอนในตราโดน '+pc(c.mul)+'%/วิ ช้าลง '+pc(c.slow)+'% · เหยียบครั้งแรกมึน '+c.stun+' วิ',
  h_ring:c=>'วงแหวนแสงรอบตัว รัศมี '+c.r+' นาน '+c.dur+' วิ · มอนในวงโดน '+pc(c.mul)+'%/วิ · ฮีลเรา '+pc(c.heal)+'% ของดาเมจที่ทำ (ไม่เกิน '+pc(c.healCap)+'% HP/วิ)',
  h_sr:c=>'ฝนหอกแสงในวง 220 px ราว 23 ครั้ง × 35.2% (810%) · ซ้อนลดป้องกัน/ความเร็วมอน · ฮีลเราเมื่ออยู่ในวง',
  h_heal:c=>'ฮีลตัวเอง '+pc(c.pct)+'% ของ HP สูงสุด (+ศรัทธา) · ถ้าเป้าที่ล็อก/มอนใกล้สุดในระยะ '+c.range+' เป็นอันเดด: ดาเมจแสง '+pc(c.undead)+'% ของตีปกติด้วย',
  h_bless:c=>'พลังโจมตี +'+pc(c.atk)+'% นาน '+c.dur+' วิ (ปาร์ตี้: ตอนนี้เล่นคนเดียว = ตัวเอง)',
  h_ward:c=>'โล่แสงดูดซับ '+pc(c.hp)+'% ของ HP สูงสุด นาน '+c.dur+' วิ',
  h_mana:c=>'MP ฟื้นเพิ่ม 1.5 เท่า นาน '+c.dur+' วิ (ปาร์ตี้: ตอนนี้ = ตัวเอง)',
  h_halo:c=>'รัศมีอรุณ '+c.dur+' วิ: เดินเร็ว +'+pc(c.spd)+'% · ฮีลรอบตัว '+pc(c.heal)+'% HP/วิ (รัศมี '+c.r+')',
  h_faith:c=>'ฮีลทุกแบบของคทาพระแรงขึ้น +'+pc(c.heal)+'%',
  h_mercy:c=>'ฮีลคนอื่นได้ MP คืน '+pc(c.back)+'% ของค่า MP สกิลฮีล · ใช้ได้ตอนเล่นปาร์ตี้เท่านั้น (เกมยังเล่นคนเดียว = ยังไม่มีผล)',
  h_reflect:c=>'ฮีลด้วยแสงฟื้นฟูแล้ว แสงกระเด็นใส่มอนรอบตัวในระยะ '+c.r+' px ดาเมจ '+pc(c.mul)+'% ของตีปกติ',
  h_undying:c=>'โดนตีถึงตาย รอดด้วย HP 1 (ไม่มีอมตะ) แล้วคูลดาวน์ '+c.cdS+' วิ',
  h_guard:c=>'HP ต่ำกว่า '+pc(c.below)+'%: รับดาเมจลดลง '+pc(c.def)+'%'};
for(const k in HC){const c=CFG[k]=Object.assign({holy:1,key:''},HC[k]);const ik='hk_'+c.ic;SA.icons[ik]={src:IC[c.ic]};c.ic=ik;}
const ACTK=['h_jl','h_lant','h_seal','h_ring','h_sr'],SUPK=['h_heal','h_bless','h_ward','h_mana','h_halo'],PASK=['h_faith','h_mercy','h_reflect','h_undying','h_guard'];
const lvTxt=' · Lv4 (ทดสอบ ยังอัปเลเวลไม่ได้)';
function mkS(k){const c=CFG[k],act=!c.pas;return {k:'stf_'+k,bk:k,name:c.name,type:act?'active':'passive',key:'',row:c.row,
  ok:()=>!!(R.public&&holyOn()),icon:()=>SA.icons[c.ic].src,desc:()=>DESC[k](c)+lvTxt,cost:act?()=>({mp:c.mp,cd:c.cd}):undefined,cdId:c.id,start:act?()=>R.cast?R.cast(k):false:undefined};}
for(const k of [...ACTK,...SUPK,...PASK])SKB[k]=mkS(k);
const HL={title:'ทักษะสายคทาพระ',holy:true,cols:[{name:'โจมตี',skills:ACTK.map(k=>SKB[k])},{name:'ฮีล / บัฟ',skills:SUPK.map(k=>SKB[k])},{name:'พาสซีฟ',skills:PASK.map(k=>SKB[k])}]};
let AL=W.lines.staff;
/* J U B N R / O Y on the arcane keys → holy skill in the same place */
R.hmap={fireball:'h_jl',ice:'h_lant',chain:'h_seal',spikes:'h_ring',ult:'h_sr',focus:'h_heal',shield:'h_bless'};
/* ---------- own slot map while holy ---------- */
const HDEF={0:'h_jl',1:'h_lant',2:'h_seal',3:'h_ring',8:'h_sr',4:'h_heal',5:'h_bless',6:'h_ward',7:'h_mana',9:'h_halo'};
const SLOT_K=['1','2','3','4','5','6','q','e','r','f'];
let HMAP={};try{HMAP=JSON.parse(localStorage.getItem('lanternfall_holySlots_v1')||'{}')||{};}catch(_){HMAP={};}
for(const i in HMAP)if(!CFG[HMAP[i]]||!CFG[HMAP[i]].holy||CFG[HMAP[i]].pas||+i<0||+i>9||(SLOT_K[+i]==='r'&&HMAP[i]!=='h_sr'))delete HMAP[i];
if(!Object.keys(HMAP).length)Object.assign(HMAP,HDEF);
let AMAP=SS.map;
const _save=SS.save,_set=SS.set;
SS.save=()=>{if(!HW.on)return _save();try{localStorage.setItem('lanternfall_holySlots_v1',JSON.stringify(SS.map));}catch(_){}};
SS.set=(i,k)=>{if(!HW.on)return _set(i,k);
  if(SLOT_K[i]==='r'&&k!=='h_sr'){try{textAt(P.x,P.y-62,'ช่อง R สงวนไว้ให้ "ฝนหอกศักดิ์สิทธิ์"','#ffe7a6',13);}catch(_){}return false;}
  for(const j in SS.map)if(SS.map[j]===k)delete SS.map[j];SS.map[i]=k;SS.save();try{buildBar();}catch(_){}return true;};
let modeNow=false;
function syncMode(){const on=!!HW.on;if(on===modeNow)return;modeNow=on;
  if(on){AMAP=SS.map;SS.map=HMAP;if(W.lines.staff!==HL)AL=W.lines.staff;W.lines.staff=HL;}
  else{HMAP=SS.map;SS.map=AMAP;W.lines.staff=AL;endSpells('weapon');}
  try{if(SS.assign)SS.stop();}catch(_){}try{buildBar();}catch(_){}try{if(typeof buildTouchSkills==='function')buildTouchSkills();}catch(_){}}
setInterval(()=>{try{syncMode();}catch(e){HK.err='mode '+e.message;}},100);
R.hon=k=>!!(HK.buf[k]||HK.list.some(L=>L.k===k&&!L.dead));
/* ---------- art ---------- */
const IM={};for(const k in A.fx){const im=new Image();im.src=A.fx[k].src;IM[k]=im;}
const ok=im=>im&&im.complete&&im.naturalWidth>0;
const fx=k=>{const im=IM[k];return ok(im)?im:null;};
const RUNES=new Image();RUNES.src=A.runes.src;
let GLY=null;function glyphs(){if(GLY)return GLY;if(!ok(RUNES))return null;GLY=[];
  for(let i=0;i<12;i++){const c=document.createElement('canvas');c.width=c.height=48;const g=c.getContext('2d');g.shadowColor=AMB;g.shadowBlur=6;g.drawImage(RUNES,i*64,0,64,64,4,4,40,40);
    g.shadowBlur=0;g.globalCompositeOperation='source-in';g.fillStyle='#ffe7a6';g.fillRect(0,0,48,48);g.globalCompositeOperation='source-over';g.globalAlpha=.55;g.drawImage(RUNES,i*64,0,64,64,10,10,28,28);
    g.globalCompositeOperation='source-atop';g.globalAlpha=1;g.fillStyle=CREAM;g.fillRect(0,0,48,48);GLY.push(c);}return GLY;}
const GL={};function glowS(col){return GL[col]||(GL[col]=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const r=g.createRadialGradient(32,32,0,32,32,32);
  r.addColorStop(0,col);r.addColorStop(.3,col+'bb');r.addColorStop(1,col+'00');g.fillStyle=r;g.fillRect(0,0,64,64);return c;})());}
const mk=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c;};
const SHOCK=mk(256,256,g=>{const r=g.createRadialGradient(128,128,90,128,128,125);r.addColorStop(0,'rgba(255,220,140,0)');r.addColorStop(.75,'rgba(255,236,180,.5)');r.addColorStop(.9,'rgba(255,255,240,1)');r.addColorStop(1,'rgba(255,220,140,0)');g.fillStyle=r;g.fillRect(0,0,256,256);});
const SHOCKG=mk(256,256,g=>{const r=g.createRadialGradient(128,128,90,128,128,125);r.addColorStop(0,'rgba(184,240,122,0)');r.addColorStop(.75,'rgba(214,248,160,.5)');r.addColorStop(.9,'rgba(250,255,230,1)');r.addColorStop(1,'rgba(184,240,122,0)');g.fillStyle=r;g.fillRect(0,0,256,256);});
/* dome: upper half ellipse, bright rim, clear middle (S3 / ward) */
const DOME=mk(256,160,g=>{g.save();g.beginPath();g.ellipse(128,150,124,148,0,Math.PI,2*Math.PI);g.closePath();g.clip();
  const r=g.createRadialGradient(128,150,60,128,150,150);r.addColorStop(0,'rgba(255,246,220,0)');r.addColorStop(.72,'rgba(255,226,150,.10)');r.addColorStop(.93,'rgba(255,236,180,.42)');r.addColorStop(1,'rgba(255,250,235,.85)');
  g.fillStyle=r;g.fillRect(0,0,256,160);const v=g.createLinearGradient(0,0,0,160);v.addColorStop(0,'rgba(255,255,255,.18)');v.addColorStop(.6,'rgba(255,255,255,0)');g.fillStyle=v;g.fillRect(0,0,256,160);g.restore();});
/* flame lick (holy fire on enemies) */
const FLAME=mk(32,72,g=>{const r=g.createRadialGradient(16,54,2,16,46,30);r.addColorStop(0,'rgba(255,255,245,1)');r.addColorStop(.35,'rgba(255,230,150,.9)');r.addColorStop(.7,'rgba(255,190,80,.45)');r.addColorStop(1,'rgba(255,170,60,0)');
  g.fillStyle=r;g.beginPath();g.moveTo(16,2);g.bezierCurveTo(30,30,30,58,16,70);g.bezierCurveTo(2,58,2,30,16,2);g.fill();});
/* lantern of light (small, S1): body glow + cap + wings drawn once */
const LANT=mk(64,64,g=>{g.globalCompositeOperation='lighter';let r=g.createRadialGradient(32,34,0,32,34,30);r.addColorStop(0,'rgba(255,250,230,1)');r.addColorStop(.35,'rgba(255,214,120,.75)');r.addColorStop(1,'rgba(255,180,70,0)');g.fillStyle=r;g.fillRect(0,0,64,64);
  g.globalCompositeOperation='source-over';g.fillStyle='rgba(255,246,220,.95)';g.beginPath();g.moveTo(25,26);g.lineTo(39,26);g.lineTo(37,43);g.lineTo(27,43);g.closePath();g.fill();
  g.fillStyle='rgba(255,211,107,.95)';g.fillRect(23,22,18,4);g.fillRect(25,43,14,3);g.beginPath();g.arc(32,19,3,0,6.283);g.fill();
  g.fillStyle='rgba(255,236,180,.8)';for(const s of [-1,1]){g.beginPath();g.moveTo(32+s*8,28);g.quadraticCurveTo(32+s*22,16,32+s*24,26);g.quadraticCurveTo(32+s*18,30,32+s*9,33);g.closePath();g.fill();}
  g.fillStyle='rgba(255,255,255,1)';g.beginPath();g.ellipse(32,35,3.5,5,0,0,6.283);g.fill();});
/* crystal droplet (mana) */
const DROP=mk(48,64,g=>{g.globalCompositeOperation='lighter';const r=g.createRadialGradient(24,40,0,24,38,24);r.addColorStop(0,'rgba(240,250,255,1)');r.addColorStop(.4,'rgba(127,208,255,.75)');r.addColorStop(1,'rgba(127,208,255,0)');g.fillStyle=r;g.fillRect(0,0,48,64);
  g.globalCompositeOperation='source-over';g.fillStyle='rgba(225,245,255,.95)';g.beginPath();g.moveTo(24,14);g.bezierCurveTo(34,30,34,40,24,46);g.bezierCurveTo(14,40,14,30,24,14);g.fill();g.fillStyle='rgba(255,226,140,.9)';g.fillRect(22,30,3,10);});
function img(k,x,y,w,o){const im=k&&k.getContext?k:fx(k);if(!im)return;o=o||{};const f=k.getContext?{w:k.width,h:k.height}:A.fx[k],h=w*f.h/f.w;ctx.save();ctx.translate(x,y);if(o.rot)ctx.rotate(o.rot);ctx.globalAlpha=clamp(o.a==null?1:o.a,0,1);
  if(o.add)ctx.globalCompositeOperation='lighter';ctx.drawImage(im,-w*(o.ax==null?.5:o.ax),-h*(o.ay==null?.5:o.ay),w,h);ctx.restore();}
function groundImg(k,x,y,r,rot,alpha,add){if(alpha<=0||!(r>0))return;const im=k.getContext?k:fx(k);if(!im)return;ctx.save();ctx.translate(x,y);ctx.scale(1,KL);ctx.rotate(rot||0);ctx.globalAlpha=clamp(alpha,0,1);if(add)ctx.globalCompositeOperation='lighter';ctx.drawImage(im,-r,-r,r*2,r*2);ctx.restore();}
function groundReveal(k,x,y,r,rot,alpha,prog,add){if(prog<=0||alpha<=0)return;const im=fx(k);if(!im)return;ctx.save();ctx.translate(x,y);ctx.scale(1,KL);ctx.rotate(rot);
  if(prog<1){ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,r*1.05,-Math.PI/2,-Math.PI/2+prog*6.283);ctx.closePath();ctx.clip();}ctx.globalAlpha=clamp(alpha,0,1);if(add)ctx.globalCompositeOperation='lighter';ctx.drawImage(im,-r,-r,r*2,r*2);ctx.restore();}
function rune(x,y,r,a,rot,grow,n,half,col){if(!(r>=16)||!(a>0))return;try{if(R.runeRing)R.runeRing(x,y,r,col||GOLD,a,rot,n||0,grow,KL,half?{half}:null);}catch(e){HK.err='rune '+e.message;}}
function glowAt(col,x,y,w,h,a){if(a<=0)return;ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=clamp(a,0,1);ctx.drawImage(glowS(col),x-w/2,y-h/2,w,h);ctx.restore();}
function star(x,y,s,a,col){if(a<=0)return;ctx.save();ctx.globalAlpha=clamp(a,0,1);ctx.fillStyle=col||CREAM;ctx.translate(x,y);ctx.beginPath();for(let k=0;k<8;k++){const aa=k/8*6.283,l=k%2?s*.2:s;ctx.lineTo(Math.cos(aa)*l,Math.sin(aa)*l);}ctx.fill();ctx.restore();}
function domeAt(x,y,rx,a,sh){if(a<=0)return;const h=rx*.62*(sh||1);ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=clamp(a,0,1);ctx.drawImage(DOME,x-rx,y-h,rx*2,h*160/150);ctx.restore();}
/* ---------- particles ---------- */
function add(L,p){p.age=0;p.vx=p.vx||0;p.vy=p.vy||0;p.g=p.g||0;p.rot=p.rot||0;p.vr=p.vr||0;p.drag=p.drag||0;if(L.P.length<(L.cap||160))L.P.push(p);}
function stepP(L,dt){for(const p of L.P){p.age+=dt;p.vx*=1-p.drag*dt;p.vy=p.vy*(1-p.drag*dt)+p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;if(p.k==='wisp')p.vx+=Math.sin(p.age*6+(p.ph||0))*30*dt;
    if(p.k==='spiral'){p.ang+=p.w*dt;p.rad=Math.max(0,p.rad-p.rin*dt);p.x=Math.cos(p.ang)*p.rad+(p.cx||0);p.y=Math.sin(p.ang)*p.rad*.45+(p.cy||0)-p.age*p.up;}}
  L.P=L.P.filter(p=>p.age<p.life);}
function drawP(L){const G_=glyphs();for(const p of L.P){const u=p.age/p.life,fi=p.fin?seg(p.age,0,p.fin):1,hd=p.hold||.5,a=fi*(1-Math.max(0,u-hd)/(1-hd));if(a<=0)continue;
    ctx.globalAlpha=clamp(a*(p.a||1),0,1);ctx.globalCompositeOperation='lighter';const x=p.x+(p.ox||0),y=p.y+(p.oy||0);
    if(p.k==='plus'){const im=fx(p.img);if(im){ctx.globalCompositeOperation='source-over';const f=A.fx[p.img],w=p.s*1.6,h=w*f.h/f.w;ctx.drawImage(im,x-w/2,y-h/2,w,h);}}
    else if(p.k==='glyph'||p.k==='spiral'){if(G_){ctx.globalCompositeOperation='source-over';ctx.drawImage(G_[p.img%12],x-p.s/2,y-p.s/2,p.s,p.s);}}
    else if(p.k==='star')star(x,y,p.s*(.6+.4*Math.sin(u*Math.PI)),ctx.globalAlpha,p.col);
    else if(p.k==='flame'){const s=p.s*(1-.5*u);ctx.drawImage(FLAME,x-s*.22,y-s,s*.44,s);}
    else if(p.k==='shard'){const im=fx(p.img);if(im){const f=A.fx[p.img],w=p.s,h=w*f.h/f.w;ctx.save();ctx.translate(x,y);ctx.rotate(p.rot);ctx.drawImage(im,-w/2,-h/2,w,h);ctx.restore();}}
    else if(p.k==='feather'){ctx.save();ctx.translate(x,y);ctx.rotate(p.rot);ctx.drawImage(glowS(p.col||CREAM),-p.s*.18,-p.s*.5,p.s*.36,p.s);ctx.restore();}
    else if(p.k==='ray'){ctx.save();ctx.translate(p.x0,p.y0);ctx.rotate(p.ang);const len=p.len*ease(u*2.2);ctx.fillStyle='rgba(255,236,170,.9)';ctx.beginPath();ctx.moveTo(len*.25,-2.5);ctx.lineTo(len,0);ctx.lineTo(len*.25,2.5);ctx.fill();ctx.restore();}
    else if(p.k==='wisp'){const s=p.s;ctx.drawImage(glowS(p.col||GOLD),x-s*.35,y-s*1.3,s*.7,s*2.6);ctx.drawImage(glowS(CREAM),x-s*.15,y-s*.5,s*.3,s);}
    else{ctx.drawImage(glowS(p.col||GOLD),x-p.s/2,y-p.s/2,p.s,p.s);}}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
/* ---------- damage / heal ---------- */
function mkCtx(id,nh){const coef=(CFG.basic&&CFG.basic.coef)||3.4;
  const def={id,mode:'native',coefTotal:coef,flatTotal:0,weights:Array(nh||16).fill(1),maxTargets:99,targeting:'around',element:'Light',range:900};
  const c=C182.api.ctxFor('skill',id,def,{dt:'phys',lvScale:1,m0:1,reach:1400,cdId:id});c.el='Light';return c;}
const PAL={main:'#ffd36b',accent:'#fff2b8',core:'#fffbea',glow:'#ffa62e',dark:'#4a2e06',part:'feather'};
function deal(e,cx,m,k,x,y){const prev=C182.cur;let r=0;C182.cur=cx;try{r=hitEnemy(e,m,{dt:'phys',pl:PAL,ctx:cx,kind:'orb',fx:x,fy:y})||0;}catch(er){HK.err='dmg '+er.message;}finally{C182.cur=prev;}
  HK.stats.hits[k]=(HK.stats.hits[k]||0)+1;HK.stats.dmg[k]=(HK.stats.dmg[k]||0)+Math.max(0,r);return r;}
const faithK=()=>1+(pas('h_faith')?CFG.h_faith.heal:0);
function heal(v,k,silent){if(!P||P.dead||!(v>0))return 0;const h0=P.hp;try{healP(Math.round(v),silent);}catch(_){P.hp=Math.min(P.maxHp,P.hp+Math.round(v));}const got=P.hp-h0;HK.stats.heal[k]=(HK.stats.heal[k]||0)+got;return got;}
function nearestE(x,y,range,f){let b=null,bd=1e9;for(const e of enemies){if(!liveE(e)||(f&&!f(e)))continue;const d=Math.hypot(e.x-x,e.y-y);if(d<=range+(e.sz||16)&&d<bd){bd=d;b=e;}}return b;}
function inR(e,x,y,r){return Math.hypot(e.x-x,e.y-y)<=r+(e.sz||16)*.6;}
/* ---------- cast ---------- */
let LOCK=0;
function refuse(c,why){HK.stats.refused++;try{textAt(P.x,P.y-62,c.name+': '+why,'#ffe7a6',13);}catch(_){}return false;}
function aimPt(range){try{if(R.aimOv)return {x:R.aimOv.x,y:R.aimOv.y};const r=aimPoint(range);if(r&&isFinite(r.x))return r;}catch(_){}const a=P.face||0;return {x:P.x+Math.cos(a)*range*.6,y:P.y+Math.sin(a)*range*.6};}
function lockTarget(range){try{const t=window.TLOCK&&TLOCK.e;if(liveE(t)&&Math.hypot(t.x-P.x,t.y-P.y)<=range+(t.sz||16))return t;}catch(_){}return null;}
function pay(c){P.mp-=c.mp;P.cds[c.id]=c.cd;const now=clk();LOCK=now+c.lock;HK.stats.casts[c.id]=(HK.stats.casts[c.id]||0)+1;try{if(c.clip)HW.pose(c.clip);}catch(_){}return now;}
function hcast(k){const c=CFG[k];if(!c||c.pas)return false;
  if(!holyOn())return refuse(c,'ต้องถือคทาพระ');
  if(clk()<LOCK)return refuse(c,'กำลังร่าย');
  if(c.ext){const was=HO.aimOv;HO.aimOv=R.aimOv?{x:R.aimOv.x,y:R.aimOv.y}:null;let r=false;try{r=HO.cast(c.ext);}finally{HO.aimOv=was;}if(r){LOCK=clk()+c.lock;HK.stats.casts[c.id]=(HK.stats.casts[c.id]||0)+1;}return r;}
  if(c.buff&&HK.buf[k])return refuse(c,'บัฟทำงานอยู่ (ไม่ซ้อน)');
  if(k==='h_heal'){const t=lockTarget(c.range)||nearestE(P.x,P.y,c.range,undead);const ut=t&&undead(t)?t:null;if(ut)P.face=Math.atan2(ut.y-P.y,ut.x-P.x);
    const now=pay(c);HK.list.push({k,t0:now,x:P.x,y:P.y,fol:1,ev:{},P:[],cap:150,ut,cx:mkCtx(c.id,4)});return true;}
  if(k==='h_lant'){const now=pay(c);const L={k,t0:now,x:P.x,y:P.y,fol:1,ev:{},P:[],cap:160,lan:[],shots:[],cx:mkCtx(c.id,c.n*c.sparks+2)};
    for(let i=0;i<c.n;i++)L.lan.push({i,left:c.sparks,next:c.rel+.6+i*(c.every/c.n),ph:i/c.n*6.283,tr:[],hit:0});HK.list.push(L);return true;}
  if(k==='h_seal'){const a=aimPt(c.range);let dx=a.x-P.x,dy=a.y-P.y,dl=Math.hypot(dx,dy);if(dl>c.range){dx*=c.range/dl;dy*=c.range/dl;}
    if(!R.aimOv){const e=lockTarget(c.range)||nearestE(P.x,P.y,c.range);if(e){dx=e.x-P.x;dy=e.y-P.y;}}
    if(Math.hypot(dx,dy)>1)P.face=Math.atan2(dy,dx);const now=pay(c);
    HK.list.push({k,t0:now,x:P.x+dx,y:P.y+dy,sx:P.x,sy:P.y,ev:{},P:[],cap:170,tick:0,seen:new Set(),cx:mkCtx(c.id,c.ticks+2)});return true;}
  if(k==='h_ring'){const now=pay(c);HK.list.push({k,t0:now,x:P.x,y:P.y,fol:1,ev:{},P:[],cap:200,tick:0,cx:mkCtx(c.id,c.ticks+2)});return true;}
  if(c.buff){const now=pay(c);HK.list.push({k,t0:now,x:P.x,y:P.y,fol:1,ev:{},P:[],cap:150,buff:1});return true;}
  return false;}
R.hcast=k=>{try{return hcast(k);}catch(e){HK.err='cast '+e.message;return false;}};
/* ---------- buffs ---------- */
function buffOn(k){const c=CFG[k],now=clk();const b=HK.buf[k]={t0:now,end:now+c.dur};const ent={t:c.dur,max:c.dur,pl:{main:GOLD,accent:CREAM},hk:k,name:c.name};
  if(k==='h_bless')ent.atk=c.atk;if(k==='h_halo'){ent.speed=c.spd;b.next=now+1;}
  if(k==='h_ward'){b.amt=Math.round(P.maxHp*c.hp);b.left=b.amt;P.shield=Math.max(0,P.shield||0)+b.amt;}
  P.buffs[c.id]=ent;}
function buffOff(k,why){const b=HK.buf[k];if(!b)return;delete HK.buf[k];try{delete P.buffs[CFG[k].id];}catch(_){}
  if(k==='h_ward'){try{P.shield=Math.max(0,(P.shield||0)-Math.max(0,b.left));}catch(_){}if(why==='broken')HK.list.push({k:'wardBreak',t0:clk(),x:P.x,y:P.y,fol:1,ev:{},P:[],cap:60});}}
function buffTick(){const now=clk();for(const k in HK.buf){const b=HK.buf[k],c=CFG[k];if(now>=b.end||!P||P.dead){buffOff(k,'time');continue;}
    if(k==='h_halo'&&now>=b.next){b.next+=1;heal(P.maxHp*c.heal*faithK(),k,false);HK.list.push({k:'haloPulse',t0:now,x:P.x,y:P.y,fol:1,ev:{},P:[],cap:30});}}}
/* MP regen (เร่งมานา) */
try{const _mr=C182.mpRegen;if(typeof _mr==='function')C182.mpRegen=function(){let v=_mr.apply(this,arguments);try{if(HK.buf.h_mana)v*=1+CFG.h_mana.regen;}catch(_){}return v;};}catch(e){HK.err='regen '+e.message;}
/* hurt: ผู้พิทักษ์ + ม่านพิทักษ์ bookkeeping */
try{const _hp=hurtPlayer;hurtPlayer=function(raw,src){
  try{if(pas('h_guard')&&P.hp<P.maxHp*CFG.h_guard.below){raw*=1-CFG.h_guard.def;HK.stats.guard++;}}catch(_){}
  const sh0=P.shield||0;const r=_hp.apply(this,arguments);
  try{const b=HK.buf.h_ward;if(b){const used=Math.max(0,sh0-(P.shield||0));if(used>0){b.left-=used;HK.stats.shieldAbs+=used;b.hitT=clk();if(b.left<=0)buffOff('h_ward','broken');}}}catch(er){HK.err='ward '+er.message;}
  return r;};}catch(e){HK.err='hurt '+e.message;}
/* เปลวไม่ดับ: survive a killing blow with 1 HP */
let UNDY=0;
try{const _pd=playerDeath;playerDeath=function(){try{if(pas('h_undying')&&clk()>=UNDY&&P&&P.hp<=0){UNDY=clk()+CFG.h_undying.cdS;P.hp=1;P.dead=false;HK.stats.undying++;
      try{textAt(P.x,P.y-70,'เปลวไม่ดับ!','#ffe7a6',16);}catch(_){}HK.list.push({k:'undy',t0:clk(),x:P.x,y:P.y,fol:1,ev:{},P:[],cap:60});return;}}catch(_){}
  try{LOCK=0;for(const k in HK.buf)buffOff(k,'death');endSpells('death');}catch(_){}return _pd.apply(this,arguments);};}catch(e){HK.err='death '+e.message;}
HK.undyLeft=()=>Math.max(0,UNDY-clk());
function endSpells(why){for(const L of HK.list)if(L.k==='h_lant'||L.k==='h_ring'||L.k==='h_seal')L.endAt=Math.min(L.endAt||1e9,clk()-L.t0);}
/* ---------- per-skill step ---------- */
function once(L,n,f){if(!L.ev[n]){L.ev[n]=1;f();}}
const tipL=L=>[P.x-L.x+12,(P.y-L.y)*T()-96];
function healStep(L,dt,t){const c=CFG.h_heal;
  if(t<c.rel&&rf()<dt*26){const a=rnd(0,6.283),r=rnd(40,70),tp=tipL(L);add(L,{k:'spiral',x:0,y:0,cx:tp[0],cy:tp[1]+10,ang:a,rad:r,rin:r/(c.rel-t+.05),w:5,up:-10,life:Math.max(.15,c.rel-t),img:(rf()*12)|0,s:16,fin:.08,hold:.8});}
  if(t>=c.rel&&!L.ev.go){L.ev.go=1;const amt=P.maxHp*c.pct*faithK();const got=heal(amt,'h_heal',false);
    for(let i=0;i<10;i++){const a=rnd(0,6.283),r=rnd(10,46);add(L,{k:'plus',x:Math.cos(a)*r,y:Math.sin(a)*r*.5-rnd(10,50),vy:-rnd(40,80),vx:rnd(-12,12),life:rnd(.9,1.4),img:'P2_07_heal_plus_'+(1+(i%6)),s:rnd(9,14),fin:.1,hold:.6});}
    for(let i=0;i<16;i++)add(L,{k:'mote',x:rnd(-30,30),y:rnd(-10,8),vy:-rnd(50,110),life:rnd(.6,1.1),s:rnd(6,11),col:i%2?HEALC:GOLD,hold:.4});
    const u=L.ut;if(liveE(u)){L.ux=u.x;L.uy=u.y;deal(u,L.cx,c.undead,'h_heal',u.x,u.y);}
    if(pas('h_reflect'))reflect(P.x,P.y);}
  return t<c.rel+1.6;}
function reflect(x,y){const c=CFG.h_reflect,cx=mkCtx('hkReflect',2);let n=0;const L={k:'refl',t0:clk(),x,y,ev:{},P:[],cap:80,tg:[]};
  for(const e of enemies){if(!liveE(e)||!inR(e,x,y,c.r))continue;deal(e,cx,c.mul,'h_reflect',e.x,e.y);n++;L.tg.push({x:e.x,y:e.y});}
  HK.stats.reflect+=n;const tt=T();for(let i=0;i<14;i++){const a=i/14*6.283+rnd(-.2,.2),v=rnd(160,260);add(L,{k:'shard',x:0,y:-30,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.5,life:.45,img:'P2_08_shard_'+(1+(i%6)),s:rnd(7,11),rot:a+1.57,drag:2,hold:.5});}
  for(const g of L.tg){const lx=g.x-x,ly=(g.y-y)*tt;for(let i=0;i<5;i++)add(L,{k:'star',x:lx+rnd(-8,8),y:ly-20+rnd(-10,10),life:.35,s:rnd(7,12),fin:.04,hold:.4});add(L,{k:'mote',x:lx,y:ly-18,life:.3,s:46,col:CREAM,hold:.2});}
  HK.list.push(L);}
function lantStep(L,dt,t){const c=CFG.h_lant,end=L.endAt!=null?L.endAt:c.rel+c.dur;
  if(t<c.rel&&rf()<dt*20){const tp=tipL(L);add(L,{k:'mote',x:tp[0]+rnd(-6,6),y:tp[1]+rnd(-6,6),vy:-rnd(10,30),life:.35,s:rnd(8,14),col:AMB,hold:.4});}
  once(L,'pop',()=>{if(t<c.rel){L.ev.pop=0;return;}const tp=tipL(L);for(let i=0;i<18;i++){const a=rnd(0,6.283),v=rnd(40,120);add(L,{k:i%3?'mote':'star',x:tp[0],y:tp[1],vx:Math.cos(a)*v,vy:Math.sin(a)*v,drag:3,life:rnd(.35,.6),s:rnd(6,11),col:GOLD,hold:.4});}});
  if(t<c.rel)return true;
  const tt=T(),now=clk();
  for(const ln of L.lan){const born=seg(t,c.rel,c.rel+.35),a=ln.ph+(t-c.rel)*1.4,rad=46*ease(born);const tp=tipL(L);
    ln.x=tp[0]*(1-ease(born))+(Math.cos(a)*rad)*ease(born);ln.y=tp[1]*(1-ease(born))+(-70+Math.sin(a)*rad*.42+Math.sin(t*3+ln.i)*4)*ease(born);ln.front=Math.sin(a)>0;
    ln.tr.push([ln.x,ln.y]);if(ln.tr.length>9)ln.tr.shift();
    if(t<end&&ln.left>0&&t>=ln.next){const tg=nearestE(P.x,P.y,c.range,e=>!L.shots.some(s=>s.e===e&&s.ln===ln.i&&s.u<1))||nearestE(P.x,P.y,c.range);
      if(tg){ln.left--;ln.next=t+c.every;L.shots.push({e:tg,ln:ln.i,x0:ln.x,y0:ln.y,u:0,hist:[]});}else ln.next=t+.25;}}
  for(const s of L.shots){if(s.u>=1)continue;const e=s.e;if(!liveE(e)){const n=nearestE(P.x,P.y,c.range+60);if(n)s.e=n;else{s.u=1;const ln=L.lan[s.ln];if(ln)ln.left++;continue;}}
    s.u=Math.min(1,s.u+dt/.26);const ex=s.e.x-L.x,ey=(s.e.y-L.y)*tt-26,m=ease(s.u),bx=(s.x0+ex)/2,by=Math.min(s.y0,ey)-40;
    s.x=(1-m)*(1-m)*s.x0+2*(1-m)*m*bx+m*m*ex;s.y=(1-m)*(1-m)*s.y0+2*(1-m)*m*by+m*m*ey;s.hist.push([s.x,s.y]);if(s.hist.length>7)s.hist.shift();
    if(s.u>=1){deal(s.e,L.cx,c.mul,'h_lant',s.e.x,s.e.y);for(let i=0;i<5;i++)add(L,{k:'star',x:ex+rnd(-8,8),y:ey+rnd(-8,8),life:.3,s:rnd(7,12),fin:.03,hold:.4});add(L,{k:'mote',x:ex,y:ey,life:.22,s:40,col:CREAM,hold:.2});}}
  L.shots=L.shots.filter(s=>s.u<1||false);
  if(t>=end&&!L.ev.out){L.ev.out=1;for(const ln of L.lan)for(let i=0;i<8;i++){const a=rnd(0,6.283),v=rnd(30,80);add(L,{k:'star',x:ln.x,y:ln.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,drag:3,life:.5,s:rnd(5,9),hold:.4});}}
  return t<end+.6;}
function sealStep(L,dt,t){const c=CFG.h_seal,end=L.endAt!=null?L.endAt:c.rel+c.dur,tt=T();
  /* script line along the ground from the hero to the spot */
  if(t>.3&&t<c.rel+.1&&rf()<dt*40){const u=seg(t,.3,c.rel),f=rf()*u,sx=(L.sx-L.x)*(1-f),sy=(L.sy-L.y)*tt*(1-f);add(L,{k:'glyph',x:sx,y:sy,life:.5,img:(rf()*12)|0,s:13,fin:.05,hold:.5,a:.9,gr:1});}
  if(t>=c.rel&&t<end){const now=clk();
    if(t>=c.rel+.5+L.tick*1&&L.tick<c.ticks){L.tick++;L.pulse=t;for(const e of enemies){if(!liveE(e)||!inR(e,L.x,L.y,c.r))continue;deal(e,L.cx,c.mul,'h_seal',e.x,e.y);
        for(let i=0;i<3;i++)add(L,{k:'wisp',x:(e.x-L.x)+rnd(-10,10),y:(e.y-L.y)*tt,vy:-rnd(40,70),life:.6,s:rnd(8,12),col:GOLD,ph:rnd(0,6),hold:.4});}}
    for(const e of enemies){if(!liveE(e)||!inR(e,L.x,L.y,c.r))continue;e.jdSlow=Math.max(e.jdSlow||0,.25);
      if(!L.seen.has(e)){L.seen.add(e);e.st=e.st||{};e.st.stun=Math.max(e.st.stun||0,c.stun);L.bind=L.bind||[];L.bind.push({e,t0:t});}}
    if(rf()<dt*14){const a=rnd(0,6.283),r=rnd(0,c.r*.9);add(L,{k:'mote',x:Math.cos(a)*r,y:Math.sin(a)*r*KL,vy:-rnd(30,60),life:rnd(.7,1.1),s:rnd(5,9),col:i2c(),hold:.4});}}
  return t<end+.5;}
const i2c=()=>rf()<.5?GOLD:CREAM;
function ringStep(L,dt,t){const c=CFG.h_ring,end=L.endAt!=null?L.endAt:c.rel+c.dur,tt=T();L.x=P.x;L.y=P.y;
  if(t<c.rel&&rf()<dt*24){const a=rnd(0,6.283),r=rnd(30,60);add(L,{k:'spiral',x:0,y:0,cx:12,cy:-90,ang:a,rad:r,rin:r/(c.rel-t+.05),w:6,up:0,life:Math.max(.12,c.rel-t),img:(rf()*12)|0,s:14,fin:.06,hold:.8});}
  if(t>=c.rel&&t<end){if(t>=c.rel+.35+L.tick&&L.tick<c.ticks){L.tick++;L.pulse=t;let sum=0;
      for(const e of enemies){if(!liveE(e)||!inR(e,P.x,P.y,c.r))continue;sum+=Math.max(0,deal(e,L.cx,c.mul,'h_ring',e.x,e.y));const lx=e.x-L.x,ly=(e.y-L.y)*tt;
        for(let i=0;i<4;i++)add(L,{k:'flame',x:lx+rnd(-12,12),y:ly+rnd(-4,4),vy:-rnd(20,50),life:rnd(.45,.7),s:rnd(26,40),fin:.05,hold:.3});
        for(let i=0;i<3;i++)add(L,{k:'mote',x:lx+rnd(-10,10),y:ly-rnd(0,20),vy:-rnd(60,100),vx:rnd(-20,20),life:.5,s:rnd(5,8),col:CREAM,hold:.3});}
      if(sum>0){const v=Math.min(sum*c.heal*faithK(),P.maxHp*c.healCap);if(v>=1){heal(v,'h_ring',true);try{textAt(P.x,P.y-56,'+'+Math.round(v),'#c8ff9a',14);}catch(_){}
          for(let i=0;i<4;i++)add(L,{k:'plus',x:rnd(-24,24),y:rnd(-60,-10),vy:-rnd(30,60),life:rnd(.8,1.1),img:'P2_07_heal_plus_'+(1+(i%6)),s:rnd(8,11),fin:.1,hold:.6});}}}
    if(rf()<dt*16){const a=rnd(0,6.283),r=c.r*rnd(.3,1);add(L,{k:'mote',x:Math.cos(a)*r,y:Math.sin(a)*r*KL,vy:-rnd(20,50),life:rnd(.6,1),s:rnd(4,8),col:i2c(),hold:.4});}}
  return t<end+.6;}
function buffStep(L,dt,t){const c=CFG[L.k];
  if(t<c.rel){if(rf()<dt*22){const tp=tipL(L);const a=rnd(0,6.283),r=rnd(26,48);
      add(L,L.k==='h_mana'?{k:'spiral',x:0,y:0,cx:0,cy:-50,ang:a,rad:r*1.4,rin:r*1.4/(c.rel-t+.05),w:7,up:0,life:Math.max(.12,c.rel-t),img:(rf()*12)|0,s:12,fin:.05,hold:.8}
        :{k:'mote',x:tp[0]+Math.cos(a)*r,y:tp[1]+Math.sin(a)*r*.6,vx:-Math.cos(a)*r*2.2,vy:-Math.sin(a)*r*1.3,life:.4,s:rnd(6,10),col:L.k==='h_mana'?SKY:GOLD,hold:.5});}
    return true;}
  once(L,'on',()=>{buffOn(L.k);const tp=tipL(L);
    if(L.k==='h_bless'){for(let i=0;i<16;i++)add(L,{k:'ray',x0:tp[0],y0:tp[1],x:0,y:0,ang:i/16*6.283,len:rnd(50,80),life:.5,hold:.3});for(let i=0;i<10;i++){const a=rnd(0,6.283),v=rnd(60,140);add(L,{k:'star',x:tp[0],y:tp[1],vx:Math.cos(a)*v,vy:Math.sin(a)*v,drag:3,life:.6,s:rnd(6,10),hold:.4});}}
    else if(L.k==='h_ward'){for(let i=0;i<14;i++){const a=i/14*6.283;add(L,{k:'glyph',x:Math.cos(a)*44,y:Math.sin(a)*44*KL,vy:-rnd(10,30),life:.6,img:i%12,s:14,fin:.05,hold:.5});}}
    else if(L.k==='h_mana'){for(let i=0;i<12;i++){const a=rnd(0,6.283),v=rnd(50,120);add(L,{k:'mote',x:0,y:-50,vx:Math.cos(a)*v,vy:Math.sin(a)*v,drag:3,life:.5,s:rnd(6,10),col:i%2?SKY:GOLD,hold:.4});}}
    else if(L.k==='h_halo'){for(let i=0;i<20;i++){const a=rnd(0,6.283),v=rnd(40,110);add(L,{k:'feather',x:0,y:-60,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.6,drag:2,life:rnd(.6,1),s:rnd(10,16),rot:a,vr:rnd(-3,3),col:i%3?CREAM:PINK,hold:.5});}}});
  return t<c.rel+1.2;}
/* loop auras of running buffs (one shared particle list) */
const AUR={k:'aura',P:[],cap:120,x:0,y:0};let lastPX=0,lastPY=0;
function auraStep(dt){const now=clk();AUR.x=P.x;AUR.y=P.y;const mv=Math.hypot(P.x-lastPX,P.y-lastPY);lastPX=P.x;lastPY=P.y;
  if(HK.buf.h_bless&&rf()<dt*7){const a=rnd(0,6.283);add(AUR,{k:'mote',x:Math.cos(a)*20,y:-rnd(10,70),vy:-rnd(20,40),life:rnd(.6,1),s:rnd(4,7),col:GOLD,hold:.4});}
  if(HK.buf.h_mana&&rf()<dt*10){const a=rnd(0,6.283),r=rnd(30,44);add(AUR,{k:'spiral',x:0,y:0,cx:0,cy:-46,ang:a,rad:r,rin:r/.7,w:6,up:0,life:.7,img:0,s:0,fin:.05,hold:.8,dot:1});}
  if(HK.buf.h_halo){if(rf()<dt*6)add(AUR,{k:'plus',x:rnd(-22,22),y:rnd(-40,0),vy:-rnd(25,45),life:rnd(.8,1.2),img:'P2_07_heal_plus_'+(1+((rf()*6)|0)),s:rnd(7,10),fin:.1,hold:.6});
    if(mv>1.2&&rf()<dt*30)add(AUR,{k:'feather',x:rnd(-10,10),y:-rnd(20,60),vx:-(P.vx||0)*.15,vy:rnd(-10,10),drag:2,life:rnd(.4,.7),s:rnd(9,14),rot:rnd(0,6),vr:rnd(-4,4),col:rf()<.3?PINK:CREAM,hold:.4});}
  stepP(AUR,dt);}
function stepAll(dt){buffTick();const now=clk();
  for(let i=HK.list.length-1;i>=0;i--){const L=HK.list[i],t=now-L.t0;let keep=true;
    try{if(L.fol){L.x=P.x;L.y=P.y;}keep=L.k==='h_heal'?healStep(L,dt,t):L.k==='h_lant'?lantStep(L,dt,t):L.k==='h_seal'?sealStep(L,dt,t):L.k==='h_ring'?ringStep(L,dt,t):CFG[L.k]&&CFG[L.k].buff?buffStep(L,dt,t):t<1.2;}catch(e){HK.err='step '+L.k+' '+e.message;keep=false;}
    stepP(L,dt);HK.stats.peakP=Math.max(HK.stats.peakP,L.P.length);if(!keep){L.dead=1;HK.list.splice(i,1);}}
  if(P&&!P.dead&&Object.keys(HK.buf).length||AUR.P.length)auraStep(dt);}
/* ---------- draw ---------- */
function inBB(L,f){try{const tt=T();KL=KY*tt;bb(L.x,L.y,()=>{ctx.save();ctx.translate(L.x,L.y);f();ctx.restore();});}catch(e){HK.err='draw '+e.message;}ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
function healG(L,t){const c=CFG.h_heal;const a=seg(t,.1,.5)*(1-seg(t,c.rel+.6,c.rel+1.2));if(a>0){groundImg('P1_07_light_pool',0,0,44*(1+.05*Math.sin(t*6)),t*.3,a*.55,true);rune(0,0,40,a*.8,t*.6,seg(t,.1,.6),12);}
  if(t>=c.rel&&t<c.rel+.6){const u=seg(t,c.rel,c.rel+.6);groundImg(SHOCKG,0,0,30+70*ease(u),0,1-u,true);}
  if(L.ux!=null&&t>=c.rel&&t<c.rel+.7){const u=seg(t,c.rel,c.rel+.7),lx=L.ux-L.x,ly=(L.uy-L.y)*T();groundImg('P1_06_impact_flash',lx,ly,50*(1+.4*ease(u)),0,1-u,true);}}
function healT(L,t){const c=CFG.h_heal,tp=tipL(L);
  const g=seg(t,0,.25)*(1-seg(t,c.rel,c.rel+.15));if(g>0)img('P1_01_lantern_glow',tp[0],tp[1],(38+16*seg(t,0,c.rel))*(1+.1*Math.sin(t*20)),{a:g,add:true});
  if(t>=c.rel-.05&&t<c.rel+.75){const u=seg(t,c.rel-.05,c.rel+.75),fall=ease(seg(t,c.rel-.05,c.rel+.08)),w=60*(1-.5*u);const im=fx('P1_03_light_cone');
    if(im){const f=A.fx.P1_03_light_cone,hh=260*fall,ww=w*1.4;ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(1-u)*.85;ctx.drawImage(im,-ww/2,-hh,ww,hh);ctx.restore();}
    glowAt(HEALC,0,-40,90*(1-u*.5),120*(1-u*.5),(1-u)*.5);glowAt(CREAM,0,-40,50,70,(1-u)*.6);}
  if(L.ux!=null&&t>=c.rel-.05&&t<c.rel+.5){const u=seg(t,c.rel-.05,c.rel+.5),lx=L.ux-L.x,ly=(L.uy-L.y)*T();const im=fx('P1_04_pillar_core_tile');
    if(im){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=1-u;ctx.drawImage(im,lx-14,ly-220,28,220);ctx.restore();}glowAt(CREAM,lx,ly-20,70,60,1-u);}
  drawP(L);}
function lantT(L,t,side){const c=CFG.h_lant;const tt=T();
  if(side>0){const tp=tipL(L),g=seg(t,0,.2)*(1-seg(t,c.rel,c.rel+.2));if(g>0)img('P1_01_lantern_glow',tp[0],tp[1],46*(1+.1*Math.sin(t*18)),{a:g,add:true});}
  if(t<c.rel)return side>0?drawP(L):null;
  const end=L.endAt!=null?L.endAt:c.rel+c.dur,fade=1-seg(t,end,end+.35),bob=1+.06*Math.sin(t*5);
  for(const ln of L.lan){if(ln.front!==(side>0))continue;ctx.save();ctx.globalCompositeOperation='lighter';
    for(let i=0;i<ln.tr.length-1;i++){const q=ln.tr[i],f=(i+1)/ln.tr.length;ctx.globalAlpha=fade*f*.45;ctx.drawImage(glowS(GOLD),q[0]-7*f,q[1]-7*f,14*f,14*f);}ctx.restore();
    const lv=ln.left/c.sparks;img(LANT,ln.x,ln.y,30*bob*(.75+.25*lv),{a:fade*(ln.front?1:.8)});glowAt(AMB,ln.x,ln.y,46,46,fade*.35);}
  if(side>0){ctx.save();ctx.globalCompositeOperation='lighter';for(const s of L.shots){if(s.u>=1||!s.hist)continue;for(let i=0;i<s.hist.length;i++){const q=s.hist[i],f=(i+1)/s.hist.length;ctx.globalAlpha=f*.8;ctx.drawImage(glowS(GOLD),q[0]-6*f,q[1]-6*f,12*f,12*f);}
      ctx.globalAlpha=1;ctx.drawImage(glowS(CREAM),s.x-9,s.y-9,18,18);ctx.drawImage(glowS('#ffffff'),s.x-4,s.y-4,8,8);}ctx.restore();drawP(L);}}
function sealG(L,t){const c=CFG.h_seal,end=L.endAt!=null?L.endAt:c.rel+c.dur;if(t<c.rel-.05)return;
  const open=ease(seg(t,c.rel-.05,c.rel+.35)),a=open*(1-seg(t,end,end+.45)),pu=L.pulse!=null?1-seg(t,L.pulse,L.pulse+.4):0,rot=t*.25;
  groundReveal('P2_05_area_ring',0,0,c.r*1.12,rot,a*(.8+.2*pu),open,true);rune(0,0,c.r*.96,a*(.85+.15*pu),-rot*1.3,open,18);rune(0,0,c.r*.62,a*.7,rot*1.6,open,12);
  groundImg('P1_07_light_pool',0,0,c.r*.55,rot,a*(.35+.25*pu),true);groundImg('P2_06_chain_ring',0,0,c.r*.32,-rot*2,a*.8,true);
  if(pu>0)groundImg(SHOCK,0,0,c.r*(.4+.7*(1-pu)),0,pu*.6,true);
  if(t<c.rel+.3){const u=seg(t,c.rel-.05,c.rel+.3);groundImg('P1_06_impact_flash',0,0,c.r*.8*(1+.3*u),0,1-u,true);}
  const tt=T();if(L.bind)for(const b of L.bind){const e=b.e;if(!liveE(e)||!inR(e,L.x,L.y,c.r+20))continue;const lx=e.x-L.x,ly=(e.y-L.y)*tt,ba=a*(.5+.5*Math.sin(t*4+lx));groundImg('P2_06_chain_ring',lx,ly,(e.sz||16)*1.5,t*2,ba*.85,true);}}
function sealT(L,t){const c=CFG.h_seal,tt=T(),end=L.endAt!=null?L.endAt:c.rel+c.dur;const a=1-seg(t,end,end+.45);
  if(t>=c.rel&&L.bind)for(const b of L.bind){const e=b.e;if(!liveE(e)||!inR(e,L.x,L.y,c.r+20))continue;const lx=e.x-L.x,ly=(e.y-L.y)*tt,G_=glyphs();
    /* ribbons of script spiralling up the target's base */
    if(G_)for(let i=0;i<6;i++){const ph=((t*.8+i/6)%1),an=ph*6.283*1.5+i,s=Math.sin(an);ctx.globalAlpha=clamp(a*Math.sin(ph*Math.PI)*(s>0?1:.5),0,1);ctx.drawImage(G_[i%12],lx+Math.cos(an)*(e.sz||16)*.9-6,ly-ph*36+s*4-6,12,12);}
    const stun=e.st&&e.st.stun>0;if(stun){const hy=ly-((e.sz||16)*2.2+18);for(let i=0;i<3;i++){const an=t*5+i*2.09;star(lx+Math.cos(an)*14,hy+Math.sin(an)*4,6,a,CREAM);}}}
  ctx.globalAlpha=1;drawP(L);}
function ringG(L,t){const c=CFG.h_ring,end=L.endAt!=null?L.endAt:c.rel+c.dur;if(t<c.rel-.05)return;
  const sp=ease(seg(t,c.rel-.05,c.rel+.4)),a=sp*(1-seg(t,end,end+.5)),pu=L.pulse!=null?1-seg(t,L.pulse,L.pulse+.35):0,rot=t*.35;
  groundImg('P2_05_area_ring',0,0,c.r*1.1*sp,rot,a*(.75+.25*pu),true);rune(0,0,c.r*sp*.95,a,-rot,sp,22);
  groundImg('P1_07_light_pool',0,0,c.r*.9*sp,0,a*(.12+.15*pu),true);if(pu>0)groundImg(SHOCK,0,0,c.r*(.5+.55*(1-pu)),0,pu*.5,true);
  domeAt(0,0,c.r*sp,a*(.55+.25*pu+.08*Math.sin(t*3)),T());}
function ringT(L,t){const c=CFG.h_ring;if(t<c.rel+.2){const g=seg(t,0,.2)*(1-seg(t,c.rel,c.rel+.2));glowAt(CREAM,12,-92,46,46,g);}drawP(L);}
function buffT(L,t){const c=CFG[L.k],tp=tipL(L);if(t<c.rel){const g=seg(t,0,.2);glowAt(L.k==='h_mana'?SKY:CREAM,tp[0],tp[1],40+20*seg(t,0,c.rel),40+20*seg(t,0,c.rel),g);
    if(L.k==='h_halo'){const u=seg(t,.05,c.rel);img('P1_01_lantern_glow',tp[0]*(1-u),tp[1]-60*ease(u),40+14*u,{a:1,add:true});}}
  else{const u=seg(t,c.rel,c.rel+.6);
    if(L.k==='h_bless'){glowAt(GOLD,tp[0],tp[1],120*(1-u*.3),120*(1-u*.3),(1-u)*.8);}
    if(L.k==='h_ward'){domeAt(0,0,60*(.4+.6*ease(u*1.6)),(1-u)*.9,T());}
    if(L.k==='h_mana'){img(DROP,0,-110+20*ease(u),26*(1-u*.4),{a:1-u,add:true});glowAt(SKY,0,-60,90,120,(1-u)*.5);}
    if(L.k==='h_halo'){const im=fx('P1_03_light_cone');if(im){const hh=300,ww=110;ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(1-u)*.7;ctx.drawImage(im,-ww/2,-hh,ww,hh);ctx.restore();}}}
  drawP(L);}
function buffG(L,t){const c=CFG[L.k];if(t<c.rel)return;const u=seg(t,c.rel,c.rel+.6);
  if(L.k==='h_halo'){groundImg(SHOCK,0,0,40+(c.r-40)*ease(u),0,(1-u)*.8,true);rune(0,0,c.r*ease(u),(1-u),t,1,24);}
  else groundImg(L.k==='h_mana'?SHOCK:SHOCK,0,0,30+60*ease(u),0,(1-u)*.7,true);}
/* running buffs: ground ring + body aura */
function auraG(){const now=clk();const tt=T();
  if(HK.buf.h_halo){const b=HK.buf.h_halo,a=seg(now-b.t0,0,.4)*(1-seg(now,b.end-.4,b.end));groundImg('P2_04_hit_ring',0,0,52,now*.8,a*.55,true);rune(0,0,58,a*.85,-now*.6,1,14);
    const pu=b.next-now;if(pu>.6){const u=1-(pu-.6)/.4;groundImg(SHOCKG,0,0,40+(CFG.h_halo.r-40)*ease(u),0,(1-u)*.45,true);}}
  if(HK.buf.h_bless){const b=HK.buf.h_bless,a=seg(now-b.t0,0,.4)*(1-seg(now,b.end-.4,b.end));groundImg('P1_07_light_pool',0,0,34,now*.4,a*.28,true);}
  if(HK.buf.h_ward){const b=HK.buf.h_ward,a=seg(now-b.t0,0,.3)*(1-seg(now,b.end-.3,b.end));rune(0,0,48,a*.8,now*.5,1,14,'back');}}
function auraT(){const now=clk();
  if(HK.buf.h_ward){const b=HK.buf.h_ward,a=seg(now-b.t0,0,.3)*(1-seg(now,b.end-.3,b.end)),hit=b.hitT?1-seg(now,b.hitT,b.hitT+.35):0,lf=clamp(b.left/b.amt,0,1);
    domeAt(0,4,52*(1+.02*Math.sin(now*2)+.06*hit),a*(.45+.25*lf+.5*hit),T());rune(0,0,48,a*.8,now*.5,1,14,'front');}
  if(HK.buf.h_halo){const b=HK.buf.h_halo,a=seg(now-b.t0,0,.4)*(1-seg(now,b.end-.4,b.end)),hy=-112+3*Math.sin(now*2.4);
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a*.9;ctx.strokeStyle=GOLD;ctx.lineWidth=2.4;ctx.beginPath();ctx.ellipse(0,hy,17,5.5,0,0,6.283);ctx.stroke();
    ctx.strokeStyle=CREAM;ctx.lineWidth=1;ctx.stroke();ctx.restore();glowAt(GOLD,0,hy,48,20,a*.45);for(let i=0;i<4;i++){const an=now*2+i*1.57;star(Math.cos(an)*17,hy+Math.sin(an)*5.5,3.5,a*(.5+.5*Math.sin(an)),CREAM);}}
  if(HK.buf.h_bless){const b=HK.buf.h_bless,a=seg(now-b.t0,0,.4)*(1-seg(now,b.end-.4,b.end));for(let i=0;i<3;i++){const an=now*2.2+i*2.09;star(Math.cos(an)*20,-102+Math.sin(an)*6,4,a*(.55+.45*Math.sin(an)),GOLD);}}
  if(HK.buf.h_mana){const b=HK.buf.h_mana,a=seg(now-b.t0,0,.3)*(1-seg(now,b.end-.3,b.end));img(DROP,0,-118+3*Math.sin(now*3),14,{a:a*.9,add:true});
    ctx.save();ctx.globalCompositeOperation='lighter';for(const p of AUR.P)if(p.dot){const u=p.age/p.life;ctx.globalAlpha=a*Math.sin(u*Math.PI);ctx.drawImage(glowS(SKY),p.x-4,p.y-4,8,8);}ctx.restore();}
  drawP({P:AUR.P.filter(p=>!p.dot)});}
function fxT(L,t){if(L.k==='refl'){drawP(L);return;}
  if(L.k==='wardBreak'){const u=seg(t,0,.5);if(!L.ev.s){L.ev.s=1;for(let i=0;i<16;i++){const a=i/16*6.283,v=rnd(90,170);add(L,{k:'shard',x:Math.cos(a)*40,y:-30+Math.sin(a)*24,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.6-40,g:260,life:.6,img:'P2_08_shard_'+(1+(i%6)),s:rnd(7,10),rot:a,vr:rnd(-6,6),hold:.5});}}
    glowAt(CREAM,0,-30,110*(1+u),70*(1+u),(1-u)*.7);drawP(L);}
  if(L.k==='undy'){const u=seg(t,0,1);img('P1_01_lantern_glow',0,-60-20*u,70*(1+.4*u),{a:1-u,add:true});glowAt(AMB,0,-40,120,140,(1-u)*.6);}
  if(L.k==='haloPulse')return;}
function drawGround(){if(!P)return;for(const L of HK.list){const t=clk()-L.t0;inBB(L,()=>{if(L.k==='h_heal')healG(L,t);else if(L.k==='h_seal')sealG(L,t);else if(L.k==='h_ring')ringG(L,t);else if(CFG[L.k]&&CFG[L.k].buff)buffG(L,t);});}
  if(Object.keys(HK.buf).length)inBB({x:P.x,y:P.y},auraG);
  for(const L of HK.list)if(L.k==='h_lant'){const t=clk()-L.t0;inBB(L,()=>lantT(L,t,-1));}}
function drawTop(){if(!P)return;for(const L of HK.list){const t=clk()-L.t0;inBB(L,()=>{if(L.k==='h_heal')healT(L,t);else if(L.k==='h_lant')lantT(L,t,1);else if(L.k==='h_seal')sealT(L,t);else if(L.k==='h_ring')ringT(L,t);else if(CFG[L.k]&&CFG[L.k].buff)buffT(L,t);else fxT(L,t);});}
  if(Object.keys(HK.buf).length||AUR.P.length)inBB({x:P.x,y:P.y},auraT);}
/* ---------- hooks ---------- */
{const o=update;update=function(dt){const r=o.apply(this,arguments);try{if(HK.list.length||Object.keys(HK.buf).length||AUR.P.length)stepAll(+dt||0);}catch(e){HK.err='tick '+e.message;}return r;};}
if(typeof drawRaidTele==='function'){const o=drawRaidTele;drawRaidTele=function(){const r=o.apply(this,arguments);try{if(HK.list.length||Object.keys(HK.buf).length)drawGround();}catch(e){HK.err='dg '+e.message;}return r;};}
{const o=drawParts;drawParts=function(){const r=o.apply(this,arguments);try{if(HK.list.length||Object.keys(HK.buf).length||AUR.P.length)drawTop();}catch(e){HK.err='dt '+e.message;}return r;};}
try{const _up=updPlayer;updPlayer=function(){const lock=clk()<LOCK&&!P.dead;const x0=P.x,y0=P.y;const r=_up.apply(this,arguments);if(lock&&!P.dash){P.x=x0;P.y=y0;P.vx=0;P.vy=0;}return r;};}catch(e){HK.err='updPlayer '+e.message;}
try{const _ba=basicAttack;basicAttack=function(){if(clk()<LOCK)return;return _ba.apply(this,arguments);};}catch(e){HK.err='basic '+e.message;}
if(typeof loadZone==='function'){const o=loadZone;loadZone=function(){try{LOCK=0;HK.list=HK.list.filter(L=>L.k!=='h_seal'&&L.k!=='h_lant'&&L.k!=='refl');}catch(_){}return o.apply(this,arguments);};}
/* the p290 TEST buttons are replaced by the holy skill slots */
try{const st=document.createElement('style');st.id='p319css';st.textContent='#holyTest{display:none!important}';(document.head||document.documentElement).appendChild(st);}catch(_){}
HK.cast=k=>R.cast?R.cast(k):hcast(k);
HK.cfg=HC;HK.warm=()=>{const L=[...Object.values(IM).filter(ok),SHOCK,SHOCKG,DOME,FLAME,LANT,DROP];for(const c of [GOLD,CREAM,AMB,HEALC,SKY,PINK,'#ffffff'])L.push(glowS(c));const g=glyphs();if(g)L.push(...g);return L;};
HK.ok=!HK.err;
}catch(e){HK.err='init '+e.message;HK.ok=false;}})();

