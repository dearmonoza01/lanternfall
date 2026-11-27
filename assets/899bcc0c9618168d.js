
/* ---- hammerskills-1 (TEST, 22 Nov 2026): Steam Hammer skill line, stage 1 = skills that place nothing.
   Balance: approved/BALANCE_hammer_v1.md "Rows 2-5" (DeaRz 22 Nov 14:01: OK for TEST, tune after his test). Values are Lv4; damage x curve A, MP x curve M.
   * Hammer Smash (ทุบค้อน, attack row 2): 200% in a 120 deg arc, reach 110, stun 1.0 s (elite half, boss immune, 2 s stun immunity after); Lv5+ full ring r140; cd 8 s, MP 18. Pose = Motion wr_2 (0.95 s, hit at 0.5).
   * Gear Armor (เกราะเฟือง, buff row 2): white shield 18% max HP (Lv5+ 25%), total shield capped at 50% max HP, 12 s; cd 35 s, MP 30; Lv10: when it breaks, gears fly out 200% r150.
   * Lubricant (น้ำมันหล่อลื่น, buff row 4): attack speed +15%, move speed +15%, 10 s (Lv5+ 15 s); cd 30 s, MP 20; Lv10 flag "next object placed has no cooldown" is stored for stage 2.
   * Heavy Hand (มือหนัก, passive row 3, max Lv5): basic hammer damage +3/6/9/12/15%.
   All effects are code-drawn placeholders. Turret interactions of Smash come with stage 2. Flag ?hammersk=off. Debug: window.HMSK ---- */
(function(){'use strict';
const Q=String(location.search),OFF=/[?&]hammersk=off\b/.test(Q);
const S=window.HMSK={ver:'hammerskills-1c',on:!OFF,err:null,anim:null,casts:{},hits:0,dmg:0,stuns:0,armor:null,lubeFree:false,
  cfg:{A:[.70,.80,.90,1,1.147,1.249,1.358,1.479,1.607,1.776],
    smash:{pct:200,arc:120,reach:110,ring:140,stun:1.0,cd:8,mp:18,dur:.95,hit:.5},
    armor:{sh:.18,sh5:.25,cap:.5,dur:12,cd:35,mp:30,burst:200,burstR:150},
    lube:{aspd:.15,speed:.15,dur:10,dur5:15,cd:30,mp:20},
    heavy:[3,6,9,12,15]}};
if(OFF)return;
const ERR=(w,e)=>{S.err=w+': '+((e&&e.message)||e);try{console.error('[HMSK]',w,e)}catch(_){}};
const C=S.cfg,HM=()=>window.HAMMER,RB=()=>window.ROBOT;
const held=()=>{try{return !!(P&&P.weapon&&P.weapon.t==='hammer')}catch(_){return false}};
const lv=k=>{try{const r=RB();return Math.max(1,Math.min(10,(r&&r.lvOf&&r.lvOf(k))||1))}catch(_){return 1}};
const curveA=l=>C.A[Math.max(1,Math.min(10,l))-1];
const curveM=l=>l<=4?.85+.05*(l-1):1+.05*(l-4);
const mpOf=(base,l)=>Math.round(base*curveM(l));
const toast=(m,c)=>{try{textAt(P.x,P.y-62,m,c||'#ffd98a',13)}catch(_){}};
const riding=()=>{try{const r=RB();return !!(r&&r.run&&!r.run.auto)}catch(_){return false}};
const isBoss=e=>{try{return !!(e.m&&e.m.boss)||!!e.gateBoss}catch(_){return false}};
const isElite=e=>{try{return !!(e.m&&e.m.elite)||!!e.eliteX}catch(_){return false}};
function mkIcon(c1,g){try{const c=document.createElement('canvas');c.width=c.height=96;const x=c.getContext('2d');
  const rr=(a,b,w,h,r)=>{x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()};
  const bg=x.createRadialGradient(48,44,6,48,48,70);bg.addColorStop(0,c1);bg.addColorStop(1,'#1a1208');rr(3,3,90,90,13);x.fillStyle=bg;x.fill();
  x.fillStyle='rgba(255,255,255,.92)';x.font='bold 44px system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.shadowColor='#000';x.shadowBlur=6;x.fillText(g,48,50);x.shadowBlur=0;
  const fr=x.createLinearGradient(0,0,96,96);fr.addColorStop(0,'#e3a14a');fr.addColorStop(1,'#8a4f1a');rr(3,3,90,90,13);x.lineWidth=5;x.strokeStyle=fr;x.stroke();return c.toDataURL('image/png')}catch(_){return null}}
const ICO={smash:mkIcon('#b0522a','🔨'),armor:mkIcon('#7d8a9a','🛡'),lube:mkIcon('#2f8a5a','💧'),heavy:mkIcon('#8a5a2a','✊')};
/* the game's own hit, as % of one hammer basic hit (same call as the hammer basic and the robot) */
function hitPct(e,pct,tag){const hp0=e.hp,vx0=e.vx,vy0=e.vy;
  try{const A=C182.api,D=A.D(),wd=D.weapons.hammer||D.weapons.sword,basic=wd.actionCoef*wd.weights.reduce((a,b)=>a+b,0);const id='hmsk_'+tag,d={id,mode:'native',coefTotal:basic*pct/100,flatTotal:0,weights:[1],schedule:[0],maxTargets:1,targeting:'around',element:'Neutral'};
    const c=A.ctxFor('skill',id,d,{dt:'phys',lvScale:1,m0:1,reach:9999,cdId:'hmskX'});hitEnemy(e,1,{dt:'phys',ctx:c,hm:1,kb:0,knk:1})}catch(er){ERR('hit',er)}
  try{if(vx0!=null&&(e.vx!==vx0||e.vy!==vy0)){e.vx=vx0;e.vy=vy0}}catch(_){}
  const d=Math.max(0,hp0-Math.max(0,e.hp));S.hits++;S.dmg+=d;return d}
function stun(e,sec){try{if(isBoss(e))return false;e.st=e.st||{};if((e.st.stun||0)>0)return false;if(time<(e._hmImm||0))return false;
  const d=isElite(e)?sec/2:sec;e.st.stun=Math.max(e.st.stun||0,d);e._hmImm=time+d+2;S.stuns++;try{const h=HM();if(h&&h.stunFx)h.stunFx(e,d)}catch(_){}return true}catch(er){ERR('stun',er);return false}}
function canCast(id,cd,mp,name){if(!held()){toast('ต้องถือค้อนไอน้ำ');return false}if(riding()){toast('ใช้ไม่ได้ระหว่างขับหุ่นยนต์');return false}
  if(P.dead||S.anim)return false;try{if(typeof stunned==='function'&&stunned())return false}catch(_){}
  if((P.cds[id]||0)>0){toast(name+': คูลดาวน์ '+Math.ceil(P.cds[id])+' วิ');return false}if(P.mp<mp){toast('MP ไม่พอ');return false}return true}
function pay(id,cd,mp,k){P.mp-=mp;P.cds[id]=cd;S.casts[k]=(S.casts[k]||0)+1}
/* ---------------- Hammer Smash ---------------- */
const ID={smash:'hmSmash',armor:'hmArmor',lube:'hmLube'};
function aimAng(){try{const tg=typeof aimPoint==='function'?aimPoint():null;if(tg)return Math.atan2(tg.y-P.y,tg.x-P.x)}catch(_){}let b=null,bd=420;for(const e of enemies){if(e.dead||!(e.hp>0))continue;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<bd){bd=d;b=e}}return b?Math.atan2(b.y-P.y,b.x-P.x):(P.face||0)}
function smashStart(){const l=lv('hm_smash'),mp=mpOf(C.smash.mp,l);if(!canCast(ID.smash,C.smash.cd,mp,'ทุบค้อน'))return false;pay(ID.smash,C.smash.cd,mp,'smash');
  const ang=aimAng();try{P.face=ang}catch(_){}
  S.anim={k:'smash',t0:time,dur:C.smash.dur,ang,face:Math.cos(ang)>=0?1:-1,hit:false,lv:l,x:P.x,y:P.y};return true}
function smashHit(A){A.hit=true;const l=A.lv,ringMode=l>=5,pct=C.smash.pct*curveA(l),half=C.smash.arc/2*Math.PI/180;let n=0;
  const cx=ringMode?P.x:P.x+Math.cos(A.ang)*40,cy=ringMode?P.y:P.y+Math.sin(A.ang)*40;A.ix=cx;A.iy=cy;A.ring=ringMode;
  for(const e of enemies.slice()){if(e.dead||!(e.hp>0))continue;const dx=e.x-P.x,dy=e.y-P.y,d=Math.hypot(dx,dy),sz=(e.sz||16)*.6;
    if(ringMode){if(d>C.smash.ring+sz)continue}else{if(d>C.smash.reach+sz)continue;let da=Math.atan2(dy,dx)-A.ang;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)>half&&d>(e.sz||16)*.8)continue}
    hitPct(e,pct,'smash');if(e.hp>0)stun(e,C.smash.stun);n++}
  A.n=n;try{ring(cx,cy,10,ringMode?C.smash.ring:C.smash.reach,.45,'#ffe0a0',5)}catch(_){}try{sfx('swing','sword')}catch(_){}try{if(typeof shake==='function')shake(6,.2)}catch(_){}
  S.lastSmash={n,ring:ringMode,pct,t:time};try{if(S.onSmash)S.onSmash(A,ringMode,half)}catch(er){ERR('onSmash',er)}}
/* ---------------- Gear Armor ---------------- */
function armorStart(){const l=lv('hm_armor'),mp=mpOf(C.armor.mp,l);if(!canCast(ID.armor,C.armor.cd,mp,'เกราะเฟือง'))return false;pay(ID.armor,C.armor.cd,mp,'armor');
  armorEnd(false);const want=P.maxHp*(l>=5?C.armor.sh5:C.armor.sh),room=Math.max(0,P.maxHp*C.armor.cap-(P.shield||0)),amt=Math.round(Math.min(want,room));
  P.shield=(P.shield||0)+amt;S.armor={amt,left:amt,until:time+C.armor.dur,lv:l,t0:time,other:(P.shield||0)-amt};
  try{textAt(P.x,P.y-74,'เกราะเฟือง +'+amt,'#e8f0ff',14,{life:.9})}catch(_){}try{ring(P.x,P.y,8,60,.4,'#dfe8f5',4)}catch(_){}return true}
function armorEnd(broken){const a=S.armor;if(!a)return;S.armor=null;if(a.left>0)P.shield=Math.max(0,(P.shield||0)-a.left);
  if(broken&&a.lv>=10){const pct=C.armor.burst*curveA(a.lv);let n=0;for(const e of enemies.slice()){if(e.dead||!(e.hp>0))continue;if(Math.hypot(e.x-P.x,e.y-P.y)<=C.armor.burstR+(e.sz||16)*.6){hitPct(e,pct,'gears');n++}}
    try{ring(P.x,P.y,10,C.armor.burstR,.5,'#ffd27a',6)}catch(_){}S.lastBurst={n,t:time};S.fx.push({k:'gears',t:time,x:P.x,y:P.y})}
  else if(broken){try{textAt(P.x,P.y-70,'เกราะแตก','#c8d2e0',12,{life:.6})}catch(_){}}}
function armorTick(){const a=S.armor;if(!a)return;const sh=P.shield||0;
  /* our part of P.shield is what is left above the shield that was there before us; damage eats ours first */
  const mine=Math.max(0,Math.min(a.left,sh));if(mine<a.left)a.left=mine;
  if(a.left<=0){armorEnd(true);return}if(time>=a.until||P.dead)armorEnd(false)}
/* ---------------- Lubricant ---------------- */
function lubeStart(){const l=lv('hm_lube'),mp=mpOf(C.lube.mp,l);if(!canCast(ID.lube,C.lube.cd,mp,'น้ำมันหล่อลื่น'))return false;pay(ID.lube,C.lube.cd,mp,'lube');
  const d=l>=5?C.lube.dur5:C.lube.dur;P.buffs.hmLube={t:d,max:d,aspd:C.lube.aspd,speed:C.lube.speed};if(l>=10)S.lubeFree=true;
  try{textAt(P.x,P.y-74,'น้ำมันหล่อลื่น','#9df0c0',14,{life:.9})}catch(_){}try{ring(P.x,P.y,8,50,.35,'#9df0c0',3)}catch(_){}return true}
/* ---------------- Heavy Hand (passive): the hammer BASIC hit goes through applyDamage with o.hm and ctx id 'hm_basic' ---------------- */
const heavyPct=()=>{try{const r=RB();if(!r||!r.KEYS||!r.KEYS.hm_heavy||!r.openK('hm_heavy'))return 0;const b=Math.max(1,Math.min(5,r.lvOf('hm_heavy')|0));return C.heavy[b-1]}catch(_){return 0}};
S.heavyPct=heavyPct;
try{const _a=applyDamage;applyDamage=function(e,d,crit,o){try{if(o&&o.hm&&o.ctx&&o.ctx.id==='hm_basic'){const h=heavyPct();if(h>0)d=d*(1+h/100)}}catch(_){}return _a.call(this,e,d,crit,o)}}catch(e){ERR('hook damage',e)}
/* ---------------- tick ---------------- */
S.fx=[];
function tick(dt){try{const A=S.anim;if(A){if(P.dead||!held()){S.anim=null}else{try{P.vx=0;P.vy=0}catch(_){}
      const el=time-A.t0;if(A.k==='smash'&&!A.hit&&el>=C.smash.hit)smashHit(A);if(el>=A.dur)S.anim=null}}
  armorTick();S.fx=S.fx.filter(f=>time-f.t<.6)}catch(e){ERR('tick',e)}}
try{const _u=update;update=function(dt){const r0=_u.apply(this,arguments);tick(dt);return r0}}catch(e){ERR('hook update',e)}
try{const _b=basicAttack;basicAttack=function(){if(S.anim)return;return _b.apply(this,arguments)}}catch(e){ERR('hook basic',e)}
/* ---------------- puppet pose while smashing (hammer hook is switched off for our own draw, like the robot does) ---------------- */
let inMine=false;
function hook(){const U=window.PUPPET;if(!U||U._hmskHook||!U._hmHook||typeof U.draw!=='function')return;U._hmskHook=1;const _d=U.draw;
  U.draw=function(c,x,y,sc,fac,pose){const A=S.anim;if(inMine||!A||A.k!=='smash'||!held()||!window.wrPose)return _d.apply(this,arguments);
    const h=HM();if(!h||!h.applied)return _d.apply(this,arguments);inMine=true;const on=h.on;h.on=false;
    try{const q=Math.max(0,Math.min(1,(time-A.t0)/A.dur)),p=window.wrPose(2,q);return window.drawCombo?window.drawCombo(c,x,y,sc,fac,p):_d.call(this,c,x,y,sc,fac,p)}
    catch(e){ERR('draw',e);return _d.apply(this,arguments)}finally{h.on=on;inMine=false}}}
setInterval(()=>{try{hook()}catch(e){ERR('hook',e)}},300);
/* ---------------- FX (placeholder, code drawn): ground crack + shock ring for Smash, gear shards for the Lv10 armor burst, shield arc ---------------- */
function rnd(s){const x=Math.sin(s*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function drawFx(){const A=S.anim;
  if(A&&A.k==='smash'&&A.hit){const k=Math.min(1,(time-A.t0-C.smash.hit)/.45),R=(A.ring?C.smash.ring:C.smash.reach);ctx.save();ctx.translate(A.ix,A.iy);ctx.scale(1,.55);
    ctx.globalAlpha=1-k;ctx.strokeStyle='#fff3c8';ctx.lineWidth=6*(1-k)+1;ctx.beginPath();ctx.arc(0,0,R*(.3+.7*k),0,6.283);ctx.stroke();
    ctx.strokeStyle='rgba(60,40,20,'+(.8*(1-k))+')';ctx.lineWidth=3;for(let i=0;i<9;i++){const a=i/9*6.283+rnd(i)*.5,r1=R*(.35+.5*rnd(i*3));ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*r1*.5,Math.sin(a)*r1*.5+rnd(i*7)*10);ctx.lineTo(Math.cos(a+.15)*r1,Math.sin(a+.15)*r1);ctx.stroke()}
    ctx.restore();ctx.save();ctx.globalAlpha=.7*(1-k);for(let i=0;i<10;i++){const a=i/10*6.283,rr=R*.2+R*.7*k,x=A.ix+Math.cos(a)*rr,y=A.iy+Math.sin(a)*rr*.55-18*k,r=10+16*k,g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(255,255,255,.8)');g.addColorStop(1,'rgba(230,236,240,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.fill()}ctx.restore()}
  const a=S.armor;if(a&&a.left>0){const k=a.left/Math.max(1,a.amt),t=time-a.t0;ctx.save();ctx.translate(P.x,P.y-14);ctx.globalAlpha=.35+.35*k;ctx.strokeStyle='#eef4ff';ctx.lineWidth=2.5;
    for(let i=0;i<3;i++){const r=30+i*5,a0=t*(1.2+i*.3)*(i%2?-1:1);ctx.beginPath();ctx.ellipse(0,0,r,r*.8,0,a0,a0+4.2*k+.6);ctx.stroke()}
    ctx.fillStyle='rgba(240,246,255,.9)';for(let i=0;i<6;i++){const an=t*1.5+i*1.047;ctx.fillRect(Math.cos(an)*36-2,Math.sin(an)*29-2,4,4)}ctx.restore()}
  for(const f of S.fx){if(f.k!=='gears')continue;const k=(time-f.t)/.6;ctx.save();ctx.globalAlpha=1-k;ctx.fillStyle='#ffd27a';ctx.strokeStyle='#7a4a12';ctx.lineWidth=1.5;
    for(let i=0;i<12;i++){const an=i/12*6.283,r=C.armor.burstR*k,x=f.x+Math.cos(an)*r,y=f.y+Math.sin(an)*r*.6-10;ctx.save();ctx.translate(x,y);ctx.rotate(k*9+i);ctx.beginPath();for(let j=0;j<8;j++){const aj=j/8*6.283,rr=j%2?9:6;ctx.lineTo(Math.cos(aj)*rr,Math.sin(aj)*rr)}ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}ctx.restore()}}
try{const _t=drawTexts;drawTexts=function(){const r0=_t.apply(this,arguments);try{if(S.anim||S.armor||S.fx.length)drawFx()}catch(e){ERR('fx',e)}return r0}}catch(e){ERR('hook texts',e)}
/* ---------------- skill line entries ---------------- */
const pc=n=>Math.round(n);
const D={
 smash:()=>{const l=lv('hm_smash');return 'กระโดดทุบค้อนลงพื้น '+pc(C.smash.pct*curveA(l))+'% '+(l>=5?'รอบตัว รัศมี '+C.smash.ring:'ด้านหน้า 120 องศา ระยะ '+C.smash.reach)+' มอนสเตอร์ติดสตั้น '+C.smash.stun+' วิ (อีลีทครึ่งหนึ่ง บอสไม่ติด)\nเลเวล 5 ขึ้นไป: ทุบเป็นวงรอบตัว'},
 armor:()=>{const l=lv('hm_armor');return 'เกราะเฟืองสีขาว กันดาเมจ '+pc((l>=5?C.armor.sh5:C.armor.sh)*100)+'% ของ HP สูงสุด นาน '+C.armor.dur+' วิ (โล่รวมไม่เกิน 50% ของ HP สูงสุด)\nเลเวล 5 ขึ้นไป: โล่ 25% · เลเวล 10: โล่แตกแล้วเฟืองกระจาย '+pc(C.armor.burst*curveA(10))+'% รัศมี '+C.armor.burstR},
 lube:()=>{const l=lv('hm_lube');return 'ความเร็วโจมตี +15% ความเร็วเดิน +15% นาน '+(l>=5?C.lube.dur5:C.lube.dur)+' วิ\nเลเวล 5 ขึ้นไป: นาน 15 วิ · เลเวล 10: ของที่วางชิ้นถัดไปไม่ติดคูลดาวน์'},
 heavy:()=>'โจมตีปกติของค้อนแรงขึ้น +3 / 6 / 9 / 12 / 15% (สูงสุดเลเวล 5)\nตอนนี้: +'+heavyPct()+'%'};
let reg=false;
function register(){const W=window.__WSK,r=RB();if(reg)return true;if(!(W&&W.lines&&W.lines.hammer&&r&&r.KEYS&&r.lvOf))return false;const L=W.lines.hammer,ok=()=>!!(S.on&&window.wrPose&&HM()&&HM().on);
  L.cols[0].skills.push({k:'hm_smash',name:'ทุบค้อน',type:'active',row:1,ok,icon:()=>ICO.smash,desc:D.smash,key:'',cdId:ID.smash,cost:()=>({mp:mpOf(C.smash.mp,lv('hm_smash')),cd:C.smash.cd}),start:smashStart});
  L.cols[1].skills.push({k:'hm_armor',name:'เกราะเฟือง',type:'active',row:1,ok,icon:()=>ICO.armor,desc:D.armor,key:'',cdId:ID.armor,cost:()=>({mp:mpOf(C.armor.mp,lv('hm_armor')),cd:C.armor.cd}),start:armorStart});
  L.cols[1].skills.push({k:'hm_lube',name:'น้ำมันหล่อลื่น',type:'active',row:3,ok,icon:()=>ICO.lube,desc:D.lube,key:'',cdId:ID.lube,cost:()=>({mp:mpOf(C.lube.mp,lv('hm_lube')),cd:C.lube.cd}),start:lubeStart});
  L.cols[2].skills.push({k:'hm_heavy',name:'มือหนัก',type:'passive',row:2,ok,icon:()=>ICO.heavy,desc:D.heavy});
  for(const c of L.cols)c.skills.sort((a,b)=>(a.row|0)-(b.row|0));reg=true;return true}
const iv=setInterval(()=>{try{if(register())clearInterval(iv)}catch(e){ERR('register',e)}},500);
S.start={smash:smashStart,armor:armorStart,lube:lubeStart};S.api={hitPct,stun,canCast,pay,lv,curveA,curveM,mpOf,mkIcon,toast,isBoss,isElite,held,ERR,riding};S.lv=lv;S.curveA=curveA;S.mpOf=mpOf;
console.info('[HMSK] hammerskills-1 ready');
})();

