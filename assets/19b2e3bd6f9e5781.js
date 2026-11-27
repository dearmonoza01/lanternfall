
/* ---- hammerskills-2 (TEST, 22 Nov 2026): Steam Hammer skill line, stage 2 = placed objects and the rest of rows 1-5. Needs hammerskills-1 (window.HMSK.api).
   Balance: approved/BALANCE_hammer_v1.md (row 1 approved 19 Nov; rows 2-5 OK for TEST 22 Nov 14:01). Values are Lv4; damage x curve A, MP x curve M.
   * Gear Turret (ป้อมปืนเฟือง, attack row 1): place within 120 px, 20 s, HP 25% hero max HP, shoots the nearest monster in 360 px every 0.8 s for 31.3%; cd 22, MP 30.
     Lv5+: 2 turrets alive, each at 70%. Lv10: 2 bullets per shot at 50% each, piercing.
   * Quick Repair (ซ่อมด่วน, buff row 1): hero heal 15% max HP, objects (turret, trap, robot) repair 40%; cd 30, MP 35, lock 0.5 s. Lv10: turrets destroyed in the last 10 s come back at 50% HP.
   * Craftsman (ช่างฝีมือ, passive row 1, max 5): turret / doll / trap damage +4..20%.
   * Wind-up Dolls (หุ่นจิ๋วไขลาน, attack row 3): 3 dolls (Lv5+ 5) run 220 px/s to the nearest monsters, 4 s max, each explodes 70% r70; cd 12, MP 22; Lv10 blast stuns 0.5 s. Max 5 alive.
   * Coil Trap (กับดักขดลวด, attack row 4): 15 s; first monster inside r60 takes 120% + root 1.5 s, then 15% every 0.5 s for 3 s to all in r60; re-arms 3 s after it fired; cd 16, MP 24.
     Lv5+: 2 traps. Lv10: 2 traps join with a fence, 30% every 0.5 s on the line.
   * Machine Upgrade (อัปเกรดเครื่องจักร, buff row 3): object damage +20%, range +25%, 12 s (Lv5+ 18 s); cd 40, MP 30; Lv10: ground cap +1 while active.
   * Steam Suit (ชุดเกราะไอน้ำ, buff row 5): 15 s (Lv5+ 20 s) DEF stat +30%, each basic hammer hit adds a steam burst 40% r100; cd 60, MP 50; Lv10 shoulder gun 25% every 0.6 s. Not while riding.
   * Durable Work (งานทนทาน, passive row 2): object HP +10..50%, duration +5..25%. Spare Gear (เฟืองสำรอง, passive row 4): placing a turret / trap has 4..20% chance of no cooldown.
     Recycle (รีไซเคิล, passive row 5): a turret that is DESTROYED gives back 10..50% of the turret cooldown.
   * Smash on your own turret: it fires 50% faster for 4 s; Smash Lv10 also repairs it 20% and adds 5 s of life. Lubricant Lv10: next turret / trap has no cooldown.
   Ground cap 4 = turrets + traps (over the cap the oldest of the same type goes). Monsters still target the hero only.
   CODE'S OWN READINGS (not in the Balance file): trap HP = 25% hero max HP like the turret; objects lose HP when the hero is hit while they stand within 60 px of the hero (stand-in for "splash that covers them");
   root follows the stun rule (boss immune, elite half); a revived turret gets a full new life. All effects are code-drawn placeholders, drawn above the scene (no depth sort).
   Flag ?hammersk=off (same flag as stage 1). Debug: window.HMSK.objs / dolls / start.turret() ... ---- */
(function(){'use strict';
const S=window.HMSK;if(!S||!S.on||!S.api){try{console.info('[HMSK2] off')}catch(_){}return}
const A=S.api,ERR=A.ERR,lv=A.lv,curveA=A.curveA,mpOf=A.mpOf,hitPct=A.hitPct,RB=()=>window.ROBOT;
S.ver2='hammerskills-2';
const C2=S.cfg2={cap:4,place:[40,120],hurtR:60,
  turret:{pct:31.3,life:20,hp:.25,range:360,iv:.8,cd:22,mp:30,two:.7,fast:1.5,fastDur:4,l10Heal:.2,l10Life:5},
  repair:{hero:[10,11.5,13,15,17,18,20,21.5,23,25],obj:[30,33,36,40,50,52,54,56,58,60],cd:30,mp:35,lock:.5,revWin:10,revHp:.5},
  craft:[4,8,12,16,20],
  dolls:{n:3,n5:5,spd:220,life:4,pct:70,r:70,cd:12,mp:22,stun:.5,max:5},
  trap:{life:15,hp:.25,r:60,first:120,root:1.5,tick:15,tickIv:.5,tickDur:3,rearm:3,cd:16,mp:24,fence:30,fenceW:14},
  upg:{dmg:.2,range:.25,dur:12,dur5:18,cd:40,mp:30},
  suit:{dur:15,dur5:20,def:.3,burst:40,burstR:100,cd:60,mp:50,gun:25,gunIv:.6,gunR:360},
  durable:{hp:[10,20,30,40,50],dur:[5,10,15,20,25]},spare:[4,8,12,16,20],recycle:[10,20,30,40,50]};
const ID={turret:'hmTurret',repair:'hmRepair',dolls:'hmDolls',trap:'hmTrap',upg:'hmUpg',suit:'hmSuit'};
S.objs=[];S.dolls=[];S.dead=[];S.fx2=[];S.upg=null;S.suit=null;S.stat2={shots:0,blasts:0,trapFires:0,fence:0,free:0,recycle:0,revived:0,objHurt:0};
const alive=e=>e&&!e.dead&&e.hp>0;
const pLv=(k,max)=>{try{const r=RB();if(!r||!r.KEYS||!r.KEYS[k]||!r.openK(k))return 0;return Math.max(1,Math.min(max||5,r.lvOf(k)|0))}catch(_){return 0}};
const pVal=(k,arr)=>{const l=pLv(k,arr.length);return l>0?arr[l-1]:0};
const upgOn=()=>!!(S.upg&&time<S.upg.until);
const objMul=()=>(1+pVal('hm_craft',C2.craft)/100)*(upgOn()?1+C2.upg.dmg:1);
const rngMul=()=>upgOn()?1+C2.upg.range:1;
const durMul=()=>1+pVal('hm_durable',C2.durable.dur)/100;
const hpMul=()=>1+pVal('hm_durable',C2.durable.hp)/100;
const capNow=()=>C2.cap+((upgOn()&&S.upg.lv>=10)?1:0);
const nearest=(x,y,r,skip)=>{let b=null,bd=r;for(const e of enemies){if(!alive(e)||(skip&&skip.has(e)))continue;const d=Math.hypot(e.x-x,e.y-y);if(d<bd){bd=d;b=e}}return b};
const fx=(o)=>{o.t=time;S.fx2.push(o)};
function placePos(){let tg=null;try{tg=aimPoint()}catch(_){}let dx,dy;if(tg){dx=tg.x-P.x;dy=tg.y-P.y}else{dx=Math.cos(P.face||0)*80;dy=Math.sin(P.face||0)*80}
  const d=Math.hypot(dx,dy)||1,m=Math.max(C2.place[0],Math.min(C2.place[1],d));return {x:P.x+dx/d*m,y:P.y+dy/d*m}}
/* cooldown after placing: Lubricant Lv10 flag first, then the Spare Gear roll */
function placeCd(id){let free=false;if(S.lubeFree){S.lubeFree=false;free=true}else{const ch=pVal('hm_spare',C2.spare);if(ch>0&&Math.random()*100<ch)free=true}
  if(free){P.cds[id]=0;S.stat2.free++;try{textAt(P.x,P.y-88,'ไม่ติดคูลดาวน์!','#ffe08a',13,{life:.9})}catch(_){}}return free}
function removeObj(o,why){const i=S.objs.indexOf(o);if(i>=0)S.objs.splice(i,1);fx({k:'poof',x:o.x,y:o.y});
  if(why==='destroyed'&&o.type==='turret'){S.dead.push({x:o.x,y:o.y,t:time,maxHp:o.maxHp});const rf=pVal('hm_recycle',C2.recycle);
    if(rf>0&&(P.cds[ID.turret]||0)>0){P.cds[ID.turret]=Math.max(0,P.cds[ID.turret]-C2.turret.cd*rf/100);S.stat2.recycle++;try{textAt(o.x,o.y-40,'รีไซเคิล -'+(C2.turret.cd*rf/100).toFixed(1)+' วิ','#9df0c0',12,{life:.9})}catch(_){}}}}
function addObj(type,x,y,l,life,hpPct){const max=l>=5?2:1;let same=S.objs.filter(o=>o.type===type);
  while(same.length>=max){removeObj(same[0],'replaced');same.shift()}
  while(S.objs.length>=capNow()){const old=S.objs.filter(o=>o.type===type)[0]||S.objs[0];removeObj(old,'cap')}
  const mh=Math.max(1,Math.round(P.maxHp*hpPct*hpMul())),o={type,x,y,lv:l,born:time,until:time+life*durMul(),hp:mh,maxHp:mh,next:time+.35,fast:0,ang:0,armAt:time+.3,actUntil:0,tickAt:0,fenceAt:0};
  S.objs.push(o);fx({k:'place',x,y});return o}
/* ---------------- Gear Turret ---------------- */
function turretStart(){const l=lv('hm_turret'),mp=mpOf(C2.turret.mp,l);if(!A.canCast(ID.turret,C2.turret.cd,mp,'ป้อมปืนเฟือง'))return false;A.pay(ID.turret,C2.turret.cd,mp,'turret');
  const q=placePos();addObj('turret',q.x,q.y,l,C2.turret.life,C2.turret.hp);placeCd(ID.turret);try{sfx('cast','sword')}catch(_){}return true}
function segHit(x0,y0,x1,y1,w,fn){const dx=x1-x0,dy=y1-y0,L2=dx*dx+dy*dy||1;for(const e of enemies.slice()){if(!alive(e))continue;let t=((e.x-x0)*dx+(e.y-y0)*dy)/L2;t=Math.max(0,Math.min(1,t));
    if(Math.hypot(e.x-(x0+dx*t),e.y-(y0+dy*t))<=w+(e.sz||16)*.6)fn(e)}}
function turretTick(o,n){const T=C2.turret,R=T.range*rngMul();if(time<o.next)return;const tg=nearest(o.x,o.y,R);if(!tg){o.next=time+.15;return}
  const l=lv('hm_turret');o.lv=l;o.ang=Math.atan2(tg.y-o.y,tg.x-o.x);o.next=time+T.iv/(time<o.fast?T.fast:1);
  const pct=T.pct*curveA(l)*objMul()*(n>=2?T.two:1);S.stat2.shots++;
  if(l>=10){const x1=o.x+Math.cos(o.ang)*R,y1=o.y+Math.sin(o.ang)*R;for(let b=0;b<2;b++)segHit(o.x,o.y,x1,y1,8,e=>hitPct(e,pct*.5,'turret'));fx({k:'shot',x:o.x,y:o.y-18,x1,y1:y1-10,tw:1})}
  else{hitPct(tg,pct,'turret');fx({k:'shot',x:o.x,y:o.y-18,x1:tg.x,y1:tg.y-(tg.sz||16)*.5})}}
S.onSmash=function(An,ringMode,half){const sm=S.cfg.smash,T=C2.turret;for(const o of S.objs){if(o.type!=='turret')continue;const dx=o.x-P.x,dy=o.y-P.y,d=Math.hypot(dx,dy);
    if(ringMode){if(d>sm.ring+14)continue}else{if(d>sm.reach+14)continue;let da=Math.atan2(dy,dx)-An.ang;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)>half&&d>20)continue}
    o.fast=time+T.fastDur;fx({k:'spark',x:o.x,y:o.y-16});if(An.lv>=10){o.hp=Math.min(o.maxHp,o.hp+o.maxHp*T.l10Heal);o.until+=T.l10Life}
    try{textAt(o.x,o.y-46,'ยิงเร็วขึ้น!','#ffd27a',12,{life:.7})}catch(_){}}};
/* ---------------- Quick Repair ---------------- */
function repairStart(){const l=lv('hm_repair'),R=C2.repair,mp=mpOf(R.mp,l);if(!A.canCast(ID.repair,R.cd,mp,'ซ่อมด่วน'))return false;A.pay(ID.repair,R.cd,mp,'repair');
  S.anim={k:'repair',t0:time,dur:R.lock,hit:true,lv:l};const heal=Math.round(P.maxHp*R.hero[l-1]/100),h0=P.hp;try{healP(heal)}catch(_){P.hp=Math.min(P.maxHp,P.hp+heal)}
  let n=0;for(const o of S.objs){o.hp=Math.min(o.maxHp,o.hp+o.maxHp*R.obj[l-1]/100);fx({k:'spark',x:o.x,y:o.y-16});n++}
  let rb=0;try{const r=RB(),run=r&&r.run;if(run&&run.hpMax>0&&run.hpR>0){const a=run.hpMax*R.obj[l-1]/100;run.hpR=Math.min(run.hpMax,run.hpR+a);rb=1}}catch(_){}
  let rev=0;if(l>=10){for(const d of S.dead.slice()){if(time-d.t>R.revWin)continue;const o=addObj('turret',d.x,d.y,lv('hm_turret'),C2.turret.life,C2.turret.hp);o.hp=Math.round(o.maxHp*R.revHp);rev++;S.stat2.revived++}S.dead.length=0}
  S.lastRepair={heal:P.hp-h0,want:heal,objs:n,robot:rb,rev,t:time};try{ring(P.x,P.y,8,70,.4,'#8dffc8',4)}catch(_){}try{sfx('cast','holy')}catch(_){}return true}
/* ---------------- Wind-up Dolls ---------------- */
function dollsStart(){const l=lv('hm_dolls'),D=C2.dolls,mp=mpOf(D.mp,l);if(!A.canCast(ID.dolls,D.cd,mp,'หุ่นจิ๋วไขลาน'))return false;A.pay(ID.dolls,D.cd,mp,'dolls');
  const n=l>=5?D.n5:D.n,used=new Set();while(S.dolls.length+n>D.max)dollBoom(S.dolls[0]);
  for(let i=0;i<n;i++){const a=(P.face||0)+(i-(n-1)/2)*.5,x=P.x+Math.cos(a)*26,y=P.y+Math.sin(a)*26;let tg=nearest(x,y,600,used);if(tg)used.add(tg);else tg=nearest(x,y,600);S.dolls.push({x,y,tg,born:time,lv:l,ph:i*1.3})}
  try{sfx('cast','sword')}catch(_){}return true}
function dollBoom(d){const i=S.dolls.indexOf(d);if(i<0)return;S.dolls.splice(i,1);const D=C2.dolls,R=D.r*rngMul(),pct=D.pct*curveA(d.lv)*objMul();let n=0;
  for(const e of enemies.slice()){if(!alive(e))continue;if(Math.hypot(e.x-d.x,e.y-d.y)<=R+(e.sz||16)*.6){hitPct(e,pct,'doll');if(d.lv>=10&&e.hp>0)A.stun(e,D.stun);n++}}
  S.stat2.blasts++;S.lastBlast={n,pct,t:time};fx({k:'boom',x:d.x,y:d.y,r:R})}
function dollTick(d,dt){const D=C2.dolls;if(time-d.born>=D.life){dollBoom(d);return}if(!alive(d.tg))d.tg=nearest(d.x,d.y,600);const tg=d.tg;if(!tg)return;
  const dx=tg.x-d.x,dy=tg.y-d.y,dd=Math.hypot(dx,dy)||1;if(dd<=14+(tg.sz||16)*.6){dollBoom(d);return}const st=Math.min(dd,D.spd*dt);d.x+=dx/dd*st;d.y+=dy/dd*st;d.face=dx>=0?1:-1}
/* ---------------- Coil Trap ---------------- */
function trapStart(){const l=lv('hm_trap'),T=C2.trap,mp=mpOf(T.mp,l);if(!A.canCast(ID.trap,T.cd,mp,'กับดักขดลวด'))return false;A.pay(ID.trap,T.cd,mp,'trap');
  const q=placePos();addObj('trap',q.x,q.y,l,T.life,T.hp);placeCd(ID.trap);try{sfx('cast','staff')}catch(_){}return true}
function root(e,sec){try{if(A.isBoss(e))return false;e.st=e.st||{};e.st.root=Math.max(e.st.root||0,A.isElite(e)?sec/2:sec);return true}catch(_){return false}}
function trapTick(o){const T=C2.trap,R=T.r*rngMul(),l=lv('hm_trap');o.lv=l;const m=objMul()*curveA(l);
  if(time>=o.armAt&&time>=o.actUntil){const tg=nearest(o.x,o.y,R+10);if(tg){hitPct(tg,T.first*m,'trap');if(tg.hp>0)root(tg,T.root);o.actUntil=time+T.tickDur;o.tickAt=time+T.tickIv;o.armAt=time+T.rearm;S.stat2.trapFires++;fx({k:'zap',x:o.x,y:o.y,r:R})}}
  if(time<o.actUntil+.01&&o.tickAt&&time>=o.tickAt){o.tickAt=time+T.tickIv>o.actUntil+.01?0:time+T.tickIv;for(const e of enemies.slice()){if(alive(e)&&Math.hypot(e.x-o.x,e.y-o.y)<=R+(e.sz||16)*.6)hitPct(e,T.tick*m,'trapTick')}}}
function fenceTick(){const T=C2.trap,tr=S.objs.filter(o=>o.type==='trap');S.fence=null;if(tr.length<2||lv('hm_trap')<10)return;const a=tr[0],b=tr[1];S.fence=[a,b];
  if(time<(a.fenceAt||0))return;a.fenceAt=time+T.tickIv;const m=objMul()*curveA(10);segHit(a.x,a.y,b.x,b.y,T.fenceW,e=>{hitPct(e,T.fence*m,'fence');S.stat2.fence++})}
/* ---------------- Machine Upgrade ---------------- */
function upgStart(){const l=lv('hm_upg'),U=C2.upg,mp=mpOf(U.mp,l);if(!A.canCast(ID.upg,U.cd,mp,'อัปเกรดเครื่องจักร'))return false;A.pay(ID.upg,U.cd,mp,'upg');
  const d=l>=5?U.dur5:U.dur;S.upg={until:time+d,lv:l,t0:time};P.buffs.hmUpg={t:d,max:d};try{textAt(P.x,P.y-74,'อัปเกรดเครื่องจักร','#ffb45a',14,{life:.9})}catch(_){}try{ring(P.x,P.y,8,90,.4,'#ffb45a',4)}catch(_){}
  for(const o of S.objs)fx({k:'spark',x:o.x,y:o.y-16});return true}
/* ---------------- Steam Suit ---------------- */
const suitOn=()=>!!(S.suit&&time<S.suit.until&&A.held());
function suitStart(){const l=lv('hm_suit'),U=C2.suit,mp=mpOf(U.mp,l);if(!A.canCast(ID.suit,U.cd,mp,'ชุดเกราะไอน้ำ'))return false;A.pay(ID.suit,U.cd,mp,'suit');
  const d=l>=5?U.dur5:U.dur;S.suit={until:time+d,lv:l,t0:time,gunAt:time+U.gunIv,q:[],last:-1,add:0};P.buffs.hmSuit={t:d,max:d};try{recalc()}catch(_){}
  try{textAt(P.x,P.y-74,'ชุดเกราะไอน้ำ','#cfe6ff',14,{life:.9})}catch(_){}try{ring(P.x,P.y,8,80,.45,'#cfe6ff',5)}catch(_){}return true}
function suitEnd(){if(!S.suit)return;S.suit=null;try{delete P.buffs.hmSuit}catch(_){}try{recalc()}catch(_){}}
try{const _r=recalc;recalc=function(){const r=_r.apply(this,arguments);try{if(S.suit&&time<S.suit.until&&P){const a=Math.round(P.def*C2.suit.def);S.suit.add=a;P.def+=a}}catch(_){}return r}}catch(e){ERR('hook recalc',e)}
/* basic hammer hit while the suit is on: queue one steam burst per swing (run in tick, never inside applyDamage) */
try{const _a=applyDamage;applyDamage=function(e,d,crit,o){try{if(o&&o.hm&&o.ctx&&o.ctx.id==='hm_basic'&&suitOn()&&time-S.suit.last>.12){S.suit.last=time;S.suit.q.push({x:e.x,y:e.y})}}catch(_){}return _a.apply(this,arguments)}}catch(e){ERR('hook damage2',e)}
function suitTick(){const s=S.suit;if(!s)return;if(time>=s.until||P.dead||!A.held()||A.riding()){suitEnd();return}const U=C2.suit,m=curveA(s.lv);
  while(s.q.length){const b=s.q.shift();let n=0;for(const e of enemies.slice()){if(alive(e)&&Math.hypot(e.x-b.x,e.y-b.y)<=U.burstR+(e.sz||16)*.6){hitPct(e,U.burst*m,'steam');n++}}S.lastSteam={n,t:time};fx({k:'steam',x:b.x,y:b.y,r:U.burstR})}
  if(s.lv>=10&&time>=s.gunAt){s.gunAt=time+U.gunIv;const tg=nearest(P.x,P.y,U.gunR);if(tg){hitPct(tg,U.gun*m,'gun');S.stat2.gun=(S.stat2.gun|0)+1;fx({k:'shot',x:P.x+8,y:P.y-52,x1:tg.x,y1:tg.y-(tg.sz||16)*.5})}}}
/* ---------------- objects take damage (Code's stand-in): hero hit while the object is within 60 px of the hero ---------------- */
try{const _h=hurtPlayer;hurtPlayer=function(raw,src){try{if(S.objs.length&&raw>0&&!(G&&G.god)){for(const o of S.objs.slice()){if(Math.hypot(o.x-P.x,o.y-P.y)<=C2.hurtR){o.hp-=raw;S.stat2.objHurt++;o.hitT=time}}}}catch(_){}return _h.apply(this,arguments)}}catch(e){ERR('hook hurt',e)}
/* ---------------- tick ---------------- */
function tick(dt){try{if(!S.objs.length&&!S.dolls.length&&!S.suit&&!S.upg&&!S.fx2.length)return;
    if(P.dead||!A.held()){for(const o of S.objs.slice())removeObj(o,'gone');S.dolls.length=0}
    const nT=S.objs.filter(o=>o.type==='turret').length;
    for(const o of S.objs.slice()){if(o.hp<=0){removeObj(o,'destroyed');continue}if(time>=o.until){removeObj(o,'timeout');continue}if(o.type==='turret')turretTick(o,nT);else trapTick(o)}
    fenceTick();for(const d of S.dolls.slice())dollTick(d,dt);suitTick();if(S.upg&&time>=S.upg.until)S.upg=null;
    S.dead=S.dead.filter(d=>time-d.t<=C2.repair.revWin);S.fx2=S.fx2.filter(f=>time-f.t<.5)}catch(e){ERR('tick2',e)}}
try{const _u=update;update=function(dt){const r0=_u.apply(this,arguments);tick(dt);return r0}}catch(e){ERR('hook update2',e)}
try{const _l=loadZone;loadZone=function(){S.objs.length=0;S.dolls.length=0;S.dead.length=0;return _l.apply(this,arguments)}}catch(e){ERR('hook zone',e)}
/* ---------------- drawing (placeholder, code drawn) ---------------- */
function gear(x,y,r,rot,fill,stroke){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.beginPath();for(let j=0;j<16;j++){const a=j/16*6.283,rr=j%2?r:r*.74;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke();ctx.beginPath();ctx.arc(0,0,r*.28,0,6.283);ctx.fillStyle=stroke;ctx.fill();ctx.restore()}
function bar(x,y,w,k,col){ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(x-w/2-1,y-1,w+2,5);ctx.fillStyle=col;ctx.fillRect(x-w/2,y,w*Math.max(0,Math.min(1,k)),3)}
function bolt(x0,y0,x1,y1,seed,amp){ctx.beginPath();ctx.moveTo(x0,y0);const n=6;for(let i=1;i<n;i++){const t=i/n,r=Math.sin(seed*12.9+i*78.2+Math.floor(time*24)*3.1)*amp;ctx.lineTo(x0+(x1-x0)*t-(y1-y0)/Math.hypot(x1-x0,y1-y0||1)*r*.4,y0+(y1-y0)*t+r)}ctx.lineTo(x1,y1);ctx.stroke()}
function drawObjs(){const up=upgOn();
  if(S.fence){const a=S.fence[0],b=S.fence[1];ctx.save();ctx.strokeStyle='rgba(150,220,255,.9)';ctx.lineWidth=2.5;ctx.shadowColor='#7fd8ff';ctx.shadowBlur=8;bolt(a.x,a.y-6,b.x,b.y-6,1,9);ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=1.2;bolt(a.x,a.y-6,b.x,b.y-6,2,6);ctx.restore()}
  for(const o of S.objs){const left=(o.until-time)/Math.max(.1,o.until-o.born);ctx.save();
    ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(o.x,o.y+2,20,8,0,0,6.283);ctx.fill();
    if(up){ctx.strokeStyle='rgba(255,170,70,'+(.5+.3*Math.sin(time*8))+')';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(o.x,o.y+2,26,11,0,0,6.283);ctx.stroke()}
    if(o.type==='turret'){const fast=time<o.fast;ctx.fillStyle='#6b4a22';ctx.fillRect(o.x-9,o.y-12,18,14);ctx.strokeStyle='#2c1c0a';ctx.lineWidth=1.5;ctx.strokeRect(o.x-9,o.y-12,18,14);
      gear(o.x,o.y-18,11,time*(fast?6:2),'#d9a441','#6b4310');ctx.save();ctx.translate(o.x,o.y-18);ctx.rotate(o.ang);ctx.fillStyle='#3d3d44';ctx.fillRect(4,-3,18,6);if(o.lv>=10){ctx.fillRect(4,-7,16,3);ctx.fillRect(4,4,16,3)}ctx.restore();
      if(fast){ctx.strokeStyle='#ffd27a';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(o.x,o.y-18,15+2*Math.sin(time*20),0,6.283);ctx.stroke()}
      bar(o.x,o.y-38,30,o.hp/o.maxHp,'#7be08a');bar(o.x,o.y-33,30,left,'#ffd27a')}
    else{const R=C2.trap.r*rngMul(),act=time<o.actUntil,armed=time>=o.armAt&&!act;ctx.strokeStyle=act?'rgba(150,220,255,.9)':armed?'rgba(200,170,90,.9)':'rgba(120,110,90,.6)';ctx.lineWidth=2;
      for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(o.x,o.y-i*3,14-i*3,6-i,0,0,6.283);ctx.stroke()}
      ctx.setLineDash([5,6]);ctx.strokeStyle=act?'rgba(150,220,255,.55)':'rgba(255,230,160,.25)';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(o.x,o.y,R,R*.55,0,0,6.283);ctx.stroke();ctx.setLineDash([]);
      if(act){ctx.strokeStyle='rgba(190,235,255,.9)';ctx.lineWidth=1.6;ctx.shadowColor='#7fd8ff';ctx.shadowBlur=6;for(let i=0;i<4;i++){const a=i*1.571+Math.floor(time*12)*.7;bolt(o.x,o.y-4,o.x+Math.cos(a)*R*.9,o.y+Math.sin(a)*R*.5,i,7)}}
      ctx.shadowBlur=0;bar(o.x,o.y-22,26,o.hp/o.maxHp,'#7be08a');bar(o.x,o.y-17,26,left,'#ffd27a')}
    ctx.restore()}
  for(const d of S.dolls){const bob=Math.abs(Math.sin(time*14+d.ph))*4;ctx.save();ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(d.x,d.y+1,8,3,0,0,6.283);ctx.fill();ctx.translate(d.x,d.y-9-bob);
    ctx.fillStyle='#c98b3a';ctx.strokeStyle='#3a2208';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,7,0,6.283);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.fillRect(-4,-2,2.5,2.5);ctx.fillRect(1.5,-2,2.5,2.5);
    ctx.save();ctx.translate(0,-9);ctx.rotate(time*10);ctx.strokeStyle='#e8d38a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-5,0);ctx.lineTo(5,0);ctx.stroke();ctx.restore();
    const k=(time-d.born)/C2.dolls.life;if(k>.7&&Math.floor(time*10)%2){ctx.fillStyle='rgba(255,80,60,.8)';ctx.beginPath();ctx.arc(0,0,3,0,6.283);ctx.fill()}ctx.restore()}
  if(suitOn()){const s=S.suit,t=time-s.t0;ctx.save();for(let i=0;i<6;i++){const a=t*1.4+i*1.047,x=P.x+Math.cos(a)*24,y=P.y-22+Math.sin(a)*10-((t*30+i*9)%22),r=7+((t*30+i*9)%22)*.3,g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(220,232,245,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.fill()}
    ctx.strokeStyle='rgba(200,225,255,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(P.x,P.y-18,22,30,0,0,6.283);ctx.stroke();if(s.lv>=10){ctx.fillStyle='#3d3d44';ctx.fillRect(P.x+2,P.y-56,14,6)}ctx.restore()}
  for(const f of S.fx2){const k=Math.min(1,(time-f.t)/(f.k==='shot'?.12:.45));ctx.save();ctx.globalAlpha=1-k;
    if(f.k==='shot'){ctx.strokeStyle='#ffe9a8';ctx.lineWidth=f.tw?3.5:2.5;ctx.shadowColor='#ffb84a';ctx.shadowBlur=6;ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x1,f.y1);ctx.stroke()}
    else if(f.k==='boom'||f.k==='steam'){const c=f.k==='boom'?'255,170,70':'235,242,250',g=ctx.createRadialGradient(f.x,f.y-8,0,f.x,f.y-8,f.r*(.4+.6*k));g.addColorStop(0,'rgba('+c+',.85)');g.addColorStop(1,'rgba('+c+',0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(f.x,f.y-8,f.r*(.4+.6*k),f.r*(.4+.6*k)*.7,0,0,6.283);ctx.fill()}
    else if(f.k==='zap'){ctx.strokeStyle='#dff4ff';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(f.x,f.y,f.r*k,f.r*k*.55,0,0,6.283);ctx.stroke()}
    else{ctx.strokeStyle=f.k==='spark'?'#ffe08a':'#e8e0d0';ctx.lineWidth=2;for(let i=0;i<6;i++){const a=i*1.047+f.t,r0=6+18*k;ctx.beginPath();ctx.moveTo(f.x+Math.cos(a)*r0,f.y+Math.sin(a)*r0*.7);ctx.lineTo(f.x+Math.cos(a)*(r0+7),f.y+Math.sin(a)*(r0+7)*.7);ctx.stroke()}}
    ctx.restore()}}
try{const _t=drawTexts;drawTexts=function(){try{if(S.objs.length||S.dolls.length||S.fx2.length||S.suit)drawObjs()}catch(e){ERR('draw2',e)}return _t.apply(this,arguments)}}catch(e){ERR('hook texts2',e)}
/* ---------------- skill line entries ---------------- */
const mk=A.mkIcon,ICO={turret:mk('#8a6a1a','⚙'),repair:mk('#2f8a6a','🔧'),craft:mk('#8a5a2a','🛠'),dolls:mk('#a05a2a','🤖'),trap:mk('#2a6a9a','⚡'),upg:mk('#b0702a','⏫'),suit:mk('#5a7a9a','♨'),durable:mk('#6a6a6a','🧱'),spare:mk('#8a7a2a','🎲'),recycle:mk('#3a8a4a','♻')};
const pc=n=>Math.round(n*10)/10;
const D={
 turret:()=>{const l=lv('hm_turret');return 'วางป้อมปืนเฟืองในระยะ 120 อยู่ '+C2.turret.life+' วิ HP 25% ของ HP สูงสุด ยิงมอนสเตอร์ที่ใกล้ที่สุดในระยะ 360 ทุก 0.8 วิ นัดละ '+pc(C2.turret.pct*curveA(l))+'%\nเลเวล 5 ขึ้นไป: วางได้ 2 ป้อม (ป้อมละ 70%) · เลเวล 10: ยิงทีละ 2 นัด ทะลุ'},
 repair:()=>{const l=lv('hm_repair');return 'ฟื้น HP ตัวเอง '+C2.repair.hero[l-1]+'% และซ่อมของที่วาง (ป้อม กับดัก หุ่นยนต์) '+C2.repair.obj[l-1]+'%\nเลเวล 10: ป้อมที่พังใน 10 วิล่าสุดกลับมาที่ HP 50%'},
 craft:()=>'ป้อม หุ่นจิ๋ว และกับดัก แรงขึ้น +4 / 8 / 12 / 16 / 20% (สูงสุดเลเวล 5)\nตอนนี้: +'+pVal('hm_craft',C2.craft)+'%',
 dolls:()=>{const l=lv('hm_dolls');return 'ปล่อยหุ่นจิ๋ว '+(l>=5?5:3)+' ตัว วิ่งหามอนสเตอร์ที่ใกล้ที่สุด แล้วระเบิด '+pc(C2.dolls.pct*curveA(l))+'% รัศมี 70 (อยู่ได้ 4 วิ)\nเลเวล 5 ขึ้นไป: 5 ตัว · เลเวล 10: ระเบิดแล้วสตั้น 0.5 วิ'},
 trap:()=>{const l=lv('hm_trap');return 'วางกับดักขดลวด อยู่ 15 วิ มอนสเตอร์ตัวแรกที่เหยียบโดนสายฟ้า '+pc(C2.trap.first*curveA(l))+'% และขยับไม่ได้ 1.5 วิ จากนั้นช็อต '+pc(C2.trap.tick*curveA(l))+'% ทุก 0.5 วิ นาน 3 วิ ในรัศมี 60 พร้อมทำงานใหม่ทุก 3 วิ\nเลเวล 5 ขึ้นไป: 2 กับดัก · เลเวล 10: กับดัก 2 อันต่อกันเป็นรั้วไฟฟ้า 30% ทุก 0.5 วิ'},
 upg:()=>{const l=lv('hm_upg');return 'ของที่วางแรงขึ้น +20% ระยะ +25% นาน '+(l>=5?18:12)+' วิ\nเลเวล 5 ขึ้นไป: 18 วิ · เลเวล 10: วางของได้เพิ่ม 1 ชิ้นระหว่างบัฟ'},
 suit:()=>{const l=lv('hm_suit');return 'สวมชุดเกราะไอน้ำ '+(l>=5?20:15)+' วิ DEF +30% โจมตีปกติแต่ละครั้งมีไอน้ำระเบิด '+pc(C2.suit.burst*curveA(l))+'% รัศมี 100\nเลเวล 5 ขึ้นไป: 20 วิ · เลเวล 10: ปืนบ่ายิง 25% ทุก 0.6 วิ\nใช้ไม่ได้ระหว่างขับหุ่นยนต์'},
 durable:()=>'ของที่วาง HP +10 / 20 / 30 / 40 / 50% อยู่นานขึ้น +5 / 10 / 15 / 20 / 25% (สูงสุดเลเวล 5)\nตอนนี้: HP +'+pVal('hm_durable',C2.durable.hp)+'% เวลา +'+pVal('hm_durable',C2.durable.dur)+'%',
 spare:()=>'วางป้อมหรือกับดัก มีโอกาส 4 / 8 / 12 / 16 / 20% ที่จะไม่ติดคูลดาวน์ (สูงสุดเลเวล 5)\nตอนนี้: '+pVal('hm_spare',C2.spare)+'%',
 recycle:()=>'ป้อมถูกทำลาย ได้คูลดาวน์ป้อมคืน 10 / 20 / 30 / 40 / 50% (สูงสุดเลเวล 5)\nตอนนี้: '+pVal('hm_recycle',C2.recycle)+'%'};
let reg=false;
function register(){const W=window.__WSK,r=RB();if(reg)return true;if(!(W&&W.lines&&W.lines.hammer&&r&&r.KEYS&&r.KEYS.hm_turret&&r.lvOf))return false;const L=W.lines.hammer,ok=()=>!!(S.on&&window.HAMMER&&HAMMER.on);
  const act=(col,k,name,row,key,cfg,start)=>L.cols[col].skills.push({k,name,type:'active',row,ok,icon:()=>ICO[key],desc:D[key],key:'',cdId:ID[key],cost:()=>({mp:mpOf(cfg.mp,lv(k)),cd:cfg.cd}),start});
  const pas=(k,name,row,key)=>L.cols[2].skills.push({k,name,type:'passive',row,ok,icon:()=>ICO[key],desc:D[key]});
  act(0,'hm_turret','ป้อมปืนเฟือง',0,'turret',C2.turret,turretStart);act(0,'hm_dolls','หุ่นจิ๋วไขลาน',2,'dolls',C2.dolls,dollsStart);act(0,'hm_trap','กับดักขดลวด',3,'trap',C2.trap,trapStart);
  act(1,'hm_repair','ซ่อมด่วน',0,'repair',C2.repair,repairStart);act(1,'hm_upg','อัปเกรดเครื่องจักร',2,'upg',C2.upg,upgStart);act(1,'hm_suit','ชุดเกราะไอน้ำ',4,'suit',C2.suit,suitStart);
  pas('hm_craft','ช่างฝีมือ',0,'craft');pas('hm_durable','งานทนทาน',1,'durable');pas('hm_spare','เฟืองสำรอง',3,'spare');pas('hm_recycle','รีไซเคิล',4,'recycle');
  for(const c of L.cols)c.skills.sort((a,b)=>(a.row|0)-(b.row|0));reg=true;return true}
const iv=setInterval(()=>{try{if(register())clearInterval(iv)}catch(e){ERR('register2',e)}},500);
Object.assign(S.start,{turret:turretStart,repair:repairStart,dolls:dollsStart,trap:trapStart,upg:upgStart,suit:suitStart});S.pVal=pVal;S.objMul=objMul;S.rngMul=rngMul;
console.info('[HMSK] hammerskills-2 ready');
})();

