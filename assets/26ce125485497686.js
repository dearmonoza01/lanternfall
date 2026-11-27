
/* ---- r137 dragonhunter STAGE A (TEST ONLY; Motion's Dragon Hunter / นักล่ามังกร light-bow special skill r9, passed by DeaRz 17 Nov 07:12 UTC; spec = HANDOFF_code_dragon_hunter_r9.md).
   Flow: press -> held weapon hidden, summon 0.50 s + pull 0.30 s = draw 0.80 s -> hold to aim (walk 50%), charge 1.2 s (visual only) -> release -> light arrow 1600 px/s (range 900) hits the first monster within 42 px of the line = Hit 1 (300%) on arrival -> warp 0.18 s to the front of the monster -> one basic slash with the held weapon 0.42 s, Hit 2 (500%) at 0.218 s -> end.
   Miss: no warp, the skill ends cleanly and the weapon comes back (counts a use). 5 uses per 30 s then a 15 s cooldown (the 6th press starts it); no MP. Every number lives in DH.cfg (per-level tables) so Balance values drop in later; nothing from Balance's unapproved proposal is applied.
   Pose = the game's bow combo click-1 clip driven by q (bowPose 1,q), left / right only. The bow is code-drawn gold light (vbow_r9), no image. Stage A = code FX only (Art FX layers come in Stage B).
   Unlock: GM only (the "GM: นักล่ามังกร" button, or ?dragonhunter=unlock). Locked = the ★ row says "ยังไม่เปิดใช้งาน". Use from a skill slot (castSkill spDragon) after placing it from the ★ page / the slot bar. ?dragonhunter=off = whole skill off. Debug: window.DH ---- */
(function(){'use strict';
const Q=String(location.search),DH=window.DH={ver:'dh-stageA-r1',on:!/[?&]dragonhunter=off\b/.test(Q),err:null,st:'idle',t:0,charge:0,uses:[],cd:0,arrow:null,warp:null,hold:false,aim:[1,0],unlocked:/[?&]dragonhunter=unlock\b/.test(Q),log:[],stats:{started:0,hits:0,misses:0}};
if(!DH.on)return;
const ERR=(w,e)=>{DH.err=w+': '+((e&&e.message)||e);try{console.error('[DH]',w,e)}catch(_){}};
DH.cfg={lv:1,hit1Pct:[300],hit2Pct:[500],mpCost:[0],usesPerWindow:5,windowSec:30,cooldownSec:15,range:900,rangeByLevel:null,pierceCount:0,missSpendsUse:true,profPerUse:0,
  SUM:0.50,PULL:0.30,DRAW:0.80,FULL:1.2,artGrassK:0.45,SPEED:1600,HIT_R:42,REL:0.25,WARP:0.18,SLASH:0.42,HIT2_AT:0.52*0.42,AIM_WALK:0.5,WARP_GAP:72,DMG_CAP:99999};
const C=DH.cfg,lvI=()=>Math.max(0,Math.min((C.hit1Pct.length||1)-1,(C.lv|0)-1)),pick=a=>a[Math.min(a.length-1,lvI())];
const rangeNow=()=>(C.rangeByLevel&&C.rangeByLevel[lvI()])||C.range;
const U=()=>window.PUPPET,X=()=>window.PUPPETX;
const E=x=>x<0?0:x>1?1:x*x*(3-2*x),rnd=s=>{const x=Math.sin(s*127.1+311.7)*43758.5453;return x-Math.floor(x)},cl=(v,a,b)=>v<a?a:v>b?b:v;
const blank=document.createElement('canvas');blank.width=blank.height=2;
const API={on:true,ok:true,cfg:{MINLV:1e9}};
DH.unlock=function(on){DH.unlocked=on!==false;API.cfg.MINLV=DH.unlocked?0:1e9;try{SPSK.sig=''}catch(_){}return DH.unlocked};
if(DH.unlocked)API.cfg.MINLV=0;
/* ---------- rig helpers ---------- */
const sc=()=>X().cfg.TARGET_H*X().cfg.H_FACTOR/X().refH;
function rp(p,part,pt){const W=U().solve(p),m=W[part];if(!m)return null;const gy=U().footY(W),sg=(X().facing>0?-1:1),s=sc(),ax=m[0]*pt[0]+m[2]*pt[1]+m[4],ay=m[1]*pt[0]+m[3]*pt[1]+m[5];return [P.x+ax*s*sg,(P.y-(P.jump||0)+X().cfg.FOOT_DY)-(p.air||0)*s+(ay-gy)*s]}
/* ---------- pose ---------- */
function aimPose(){const sm=DH.st==='draw'&&DH.t<C.SUM,u=DH.st==='draw'?Math.max(0,(DH.t-C.SUM)/C.PULL):0;let q;
  if(DH.st==='draw')q=sm?0.11/0.55*E(DH.t/0.22):0.11/0.55+0.19/0.55*E(u);else if(DH.st==='aim')q=0.33/0.55;else q=0.70+0.30*Math.min(1,DH.t/C.REL);
  const p=window.bowPose(1,q);p.lunge=0;p.air=0;p.flip=0;p.turn=0;p.arrowOn=DH.st!=='release'&&!sm;p.pull=DH.st==='draw'?(sm?0:E(u)):DH.st==='aim'?1:0;p.snap=DH.st==='release'?DH.t:-1;
  if(DH.moving){try{const w=U().pose('walk',time*2.2,{});['leg_near','leg_far','foot_near','foot_far'].forEach(k=>{p.rot[k]=(w.rot[k]||0)*0.7})}catch(_){}}
  if(DH.st==='aim'){const sh=DH.charge>=1?0.8:0.3*DH.charge;p.rot.arm_far=(p.rot.arm_far||0)+Math.sin(time*70)*sh}return p}
let lastPose=null;
DH.active=()=>DH.st!=='idle';
DH.pose=function(t){if(DH.st==='idle')return null;try{if(DH.st==='draw'||DH.st==='aim'||DH.st==='release'){lastPose=aimPose();return {name:'idle',p:lastPose}}
  if(DH.st==='warp'){lastPose=aimPose();return {name:'idle',p:lastPose}}
  if(DH.st==='slash'){const p=U().pose('slash',DH.t,{dur:C.SLASH});p.lunge=0;p.air=0;p.flip=0;p.turn=0;lastPose=p;return {name:'slash',p}}}catch(e){ERR('pose',e)}return null};
/* ---------- weapon swap (puppet rig bow, blank bow image) ---------- */
let prevW=null,prevBow=null,SNAP=null;
function snapRig(){const u=U();const sl=Object.assign({},u.slots),SCc=Object.assign({},u.cfg.SC),RS=Object.assign({},u.cfg.REST),pv={};for(const k in u.P){if(u.P[k]&&Array.isArray(u.P[k].pivot))pv[k]=u.P[k].pivot.slice()}const cp=a=>a?a.slice():a;return {w:u.cfg.WEAPON,hasS:Object.prototype.hasOwnProperty.call(u.slots,'sword'),sS:u.slots.sword,hasO:Object.prototype.hasOwnProperty.call(u.slots,'offhand'),sO:u.slots.offhand,pS:cp(u.P.sword.pivot),pO:cp(u.P.offhand.pivot),pA:cp(u.P.arrow.pivot),rS:u.cfg.REST.sword,rO:u.cfg.REST.offhand,rA:u.cfg.REST.arrow,cS:u.cfg.SC.sword,cO:u.cfg.SC.offhand,cA:u.cfg.SC.arrow,show:u.cfg.showSword,full:{sl,SCc,RS,pv}}}
function restoreRig(s){const u=U();u.cfg.WEAPON=s.w;if(s.hasS)u.slots.sword=s.sS;else delete u.slots.sword;if(s.hasO)u.slots.offhand=s.sO;else delete u.slots.offhand;u.P.sword.pivot=s.pS;u.P.offhand.pivot=s.pO;u.P.arrow.pivot=s.pA;u.cfg.REST.sword=s.rS;u.cfg.REST.offhand=s.rO;u.cfg.REST.arrow=s.rA;u.cfg.SC.sword=s.cS;u.cfg.SC.offhand=s.cO;u.cfg.SC.arrow=s.cA;u.cfg.showSword=s.show;if(s.full){for(const k of Object.keys(u.slots))if(!(k in s.full.sl))delete u.slots[k];Object.assign(u.slots,s.full.sl);for(const k of Object.keys(u.cfg.SC))if(!(k in s.full.SCc))delete u.cfg.SC[k];Object.assign(u.cfg.SC,s.full.SCc);for(const k of Object.keys(u.cfg.REST))if(!(k in s.full.RS))delete u.cfg.REST[k];Object.assign(u.cfg.REST,s.full.RS);for(const k in s.full.pv)u.P[k].pivot=s.full.pv[k].slice()}}
function bowOn(){try{if(prevW!==null)return;SNAP=snapRig();prevW=U().cfg.WEAPON;prevBow=U().imgs.w_bow;U().imgs.w_bow=blank;U().setWeapon('bow')}catch(e){ERR('bowOn',e)}}
function bowOff(){try{if(prevW===null)return;U().imgs.w_bow=prevBow;if(SNAP){try{const nm=X().curW;if(nm)U().setWeapon(nm)}catch(_){}/* tells the weapon trackers (Iron Monk gloves watch the last setWeapon name) that the held weapon is back */restoreRig(SNAP);DH.again=[SNAP,6]}/* exact pre-skill rig state (cfg.WEAPON, slots, pivots, rest, scale); re-applied for a few frames because weapon modules (knuckle) react to the temporary bow */;SNAP=null}catch(e){ERR('bowOff',e)}prevW=null;prevBow=null}
/* ---------- uses / cooldown ---------- */
const usesLeft=()=>{DH.uses=DH.uses.filter(u=>time-u<C.windowSec);return C.usesPerWindow-DH.uses.length};
const say=m=>{try{textAt(P.x,P.y-70,m,'#ffd98a',13)}catch(_){}};
function riding(){try{return !!(window.ROBOT&&ROBOT.run&&ROBOT.run.ph)}catch(_){return false}}
DH.press=function(){try{if(!DH.on||DH.st!=='idle')return false;if(!DH.unlocked){say('ยังไม่เปิดใช้งาน');return false}
  if(G.state!=='play'||P.dead||G.win||P.casting){return false}if(riding()){say('ใช้ตอนขี่หุ่นยนต์ไม่ได้');return false}
  if(!window.bowPose||!U()||!X()||!X().ready){say('ข้อมูลท่ายังไม่พร้อม');return false}
  if(DH.cd>time){say('คูลดาวน์อีก '+Math.ceil(DH.cd-time)+' วิ');return false}
  if(usesLeft()<=0){DH.cd=time+C.cooldownSec;say('ครบ '+C.usesPerWindow+' ครั้งใน '+C.windowSec+' วิ → คูลดาวน์');return false}
  const mp=pick(C.mpCost)||0;if(mp>0){if(P.mp<mp){say('MP ไม่พอ');return false}P.mp-=mp}
  dragP0=lastPt.slice();backOn();DH.uses.push(time);DH.st='draw';DH.t=0;DH.charge=0;DH.hold=true;DH.arrow=null;DH.warp=null;DH.stats.started++;DH.log.push({ev:'press',t:+time.toFixed(2)});bowOn();aimUpdate();return true}catch(e){ERR('press',e);return false}};
function reset(why){backOff();if(DH.st!=='idle'){DH.log.push({ev:'reset',why})}DH.st='idle';DH.t=0;DH.arrow=null;DH.warp=null;DH.charge=0;DH.hold=false;bowOff()}
DH.reset=reset;
/* ---------- aim ---------- */
function nearestEnemy(r){let best=null,bd=r*r;for(const e of enemies){if(e.dead||!(e.hp>0))continue;const d=(e.x-P.x)**2+(e.y-P.y)**2;if(d<bd){bd=d;best=e}}return best}
function aimUpdate(){let v=null;try{if(DH.hold&&dragP0&&(isTouch||(window.TOUCH&&TOUCH.on))){const dx=lastPt[0]-dragP0[0],dy=lastPt[1]-dragP0[1];if(Math.hypot(dx,dy)>18){const a=s2w(dragP0[0],dragP0[1]),b=s2w(lastPt[0],lastPt[1]);v=[b[0]-a[0],b[1]-a[1]];DH.dragAim=true}else DH.dragAim=false}}catch(_){}if(v){const L1=Math.hypot(v[0],v[1])||1;DH.aim=[v[0]/L1,v[1]/L1];if(Math.abs(DH.aim[0])>0.05)P.face=DH.aim[0]>0?0:Math.PI;return}if(DH.aimFix){const L0=Math.hypot(DH.aimFix[0],DH.aimFix[1])||1;DH.aim=[DH.aimFix[0]/L0,DH.aimFix[1]/L0];if(Math.abs(DH.aim[0])>0.05)P.face=DH.aim[0]>0?0:Math.PI;return}try{if(window.mouse&&!isTouch&&!(window.TOUCH&&TOUCH.on)&&typeof aimPoint==='function'){const t=aimPoint(rangeNow());if(t&&isFinite(t.x))v=[t.x-P.x,(t.y-P.y)+30]}}catch(_){}
  if(!v){const e=nearestEnemy(rangeNow());if(e)v=[e.x-P.x,(e.y-(e.sz||16)*.9)-(P.y-40)];else v=[Math.cos(P.face||0),Math.sin(P.face||0)*0.2]}
  const L=Math.hypot(v[0],v[1])||1;DH.aim=[v[0]/L,v[1]/L];if(Math.abs(DH.aim[0])>0.05)P.face=DH.aim[0]>0?0:Math.PI}
/* ---------- fire / FX ---------- */
const FX=[];
function tipWorld(){const p=lastPose||aimPose();return rp(p,'arrow',[0,40])||[P.x+(Math.cos(P.face||0))*40,P.y-60]}
function hitTest(o,d){let best=null;for(const e of enemies){if(e.dead||!(e.hp>0)||e.dev)continue;const cx=e.x-o[0],cy=(e.y-(e.sz||16)*.9)-o[1],t=cx*d[0]+cy*d[1];if(t<0||t>rangeNow())continue;const px=cx-d[0]*t,py=cy-d[1]*t;if(Math.hypot(px,py)>C.HIT_R)continue;if(!best||t<best.t)best={e,t}}return best}
function fire(){const tp=tipWorld(),d=DH.aim,h=hitTest(tp,d),dist=h?h.t:rangeNow();DH.arrow={x0:tp[0],y0:tp[1],d:d.slice(),t0:time,dur:dist/C.SPEED,e:h?h.e:null};DH.st='release';DH.t=0;DH.warp=null;FX.push({k:'rel',x:tp[0],y:tp[1],a:Math.atan2(d[1],d[0]),t0:time})}
function dmg(e,pct,tag){try{const m=pct/100;const cap=C.DMG_CAP;const hp0=e.hp;hitEnemy(e,m,{dt:'phys',pl:(typeof pal==='function'?pal(null):undefined),dhTag:tag});if(cap&&e.hp<hp0-cap){e.hp=hp0-cap}DH.stats.hits++}catch(er){ERR('dmg',er)}}
/* ---------- update ---------- */
const dim=document.createElement('div');dim.id='dhDim';dim.style.cssText='position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;z-index:1;transition:opacity .12s linear';document.body.appendChild(dim);
let px0=0,py0=0,zone0=null,lastPt=[0,0],dragP0=null,isTouch=false;
for(const ev of ['pointermove','pointerdown']) addEventListener(ev,e=>{lastPt=[e.clientX,e.clientY];if(e.pointerType==='touch'||e.pointerType==='pen')isTouch=true;else if(e.pointerType==='mouse')isTouch=false},true);
function tick(dt){try{if(!DH.on)return;
  if(DH.st!=='idle'){if(P.dead||G.state!=='play'||G.zone!==zone0){reset('state');return}}
  zone0=G.zone;
  if(DH.cd>time)P.cds.spDragon=DH.cd-time;else if(P.cds&&P.cds.spDragon>0&&DH.st==='idle'&&!DH.cdKeep)P.cds.spDragon=0;
  {const dk=(DH.st==='draw'||DH.st==='aim')?0.22*chargeK():0;const s=dk.toFixed(3);if(dim.dataset.k!==s){dim.dataset.k=s;dim.style.opacity=s}}
  if(DH.again&&DH.st==='idle'){try{restoreRig(DH.again[0])}catch(_){}if(--DH.again[1]<=0)DH.again=null}
  if(DH.st==='idle'){px0=P.x;py0=P.y;return}
  if(DH.freeze)return;
  const moved=Math.hypot(P.x-px0,P.y-py0);DH.moving=moved>.5;
  if(DH.st==='draw'||DH.st==='aim'){/* walk 50% */P.x=px0+(P.x-px0)*C.AIM_WALK;P.y=py0+(P.y-py0)*C.AIM_WALK;aimUpdate()}
  else if(DH.st==='release'||DH.st==='slash'){P.x=px0;P.y=py0}
  P.atkCd=Math.max(P.atkCd||0,.1);if(backProp){backProp.x=P.x;backProp.y=P.y-3}if(DH.st==='release'||DH.st==='warp'||DH.st==='slash')backOff();
  if(DH.st==='draw'){DH.t+=dt;if(DH.t>=C.DRAW){DH.st='aim';DH.t=0}}
  else if(DH.st==='aim'){DH.t+=dt;DH.charge=Math.min(1,DH.t/C.FULL);if(!DH.hold)fire()}
  else if(DH.st==='release'){DH.t+=dt;const A=DH.arrow;
    if(A&&A.e&&time-A.t0>=A.dur&&!DH.warp){const e=A.e;if(e.dead||!(e.hp>0)){finish(false)}else{dmg(e,pick(C.hit1Pct),'dh1');FX.push({k:'hit1',x:e.x,y:e.y-(e.sz||16)*.9,t0:time});
        const side=e.x>=P.x?1:-1;let tx=e.x-side*C.WARP_GAP,ty=e.y;try{if(blocked(tx,ty,14)){tx=e.x+side*C.WARP_GAP;if(blocked(tx,ty,14)){tx=P.x;ty=P.y}}}catch(_){}
        DH.warp={x0:P.x,y0:P.y,x1:tx,y1:ty,t0:time,face:(tx===P.x&&ty===P.y)?(side):(e.x>=tx?1:-1),e};FX.push({k:'warp',x0:P.x,y0:P.y-40,x1:tx,y1:ty-40,t0:time});DH.st='warp';DH.t=0}}
    else if(A&&!A.e&&time-A.t0>=A.dur&&DH.t>=C.REL){DH.stats.misses++;finish(true,true)}}
  else if(DH.st==='warp'){DH.t+=dt;const w=DH.warp,u=E(DH.t/C.WARP);P.x=w.x0+(w.x1-w.x0)*u;P.y=w.y0+(w.y1-w.y0)*u;
    if(DH.t>=C.WARP){P.x=w.x1;P.y=w.y1;px0=P.x;py0=P.y;P.face=w.face>0?0:Math.PI;bowOff();DH.st='slash';DH.t=0;DH.hit2=false}}
  else if(DH.st==='slash'){DH.t+=dt;if(!DH.hit2&&DH.t>=C.HIT2_AT){DH.hit2=true;const e=DH.warp.e;if(e&&!e.dead&&e.hp>0){dmg(e,pick(C.hit2Pct),'dh2');FX.push({k:'slash',x:e.x-(P.face===0?1:-1)*20,y:e.y-(e.sz||16)*.9,face:P.face===0?1:-1,t0:time})}}
    if(DH.t>=C.SLASH)finish(true)}
  }catch(e){ERR('tick',e)}}
function finish(ok,miss){backOff();if(miss)say('ไม่โดน · จบท่า');DH.st='idle';DH.t=0;DH.arrow=null;DH.charge=0;DH.hold=false;DH.warp=null;bowOff();if(miss&&!C.missSpendsUse&&DH.uses.length)DH.uses.pop()}
try{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{tick(dt)}catch(e){ERR('upd',e)}return r}}catch(e){ERR('hook update',e)}
/* block other actions while the skill is running */
for(const fn of ['basicAttack','castSkill','castSkillNow']){try{const o=window[fn];if(typeof o==='function')window[fn]=function(id){if(fn!=='basicAttack'&&id==='spDragon'){return DH.press()}if(DH.st!=='idle')return;return o.apply(this,arguments)}}catch(_){}}
/* release: any pointer / touch up or key up */
for(const ev of ['pointerup','mouseup','touchend','touchcancel','keyup','blur'])addEventListener(ev,()=>{if(DH.hold)DH.hold=false},true);
/* ---------- registration: SK entry, icon, ★ page row, GM ---------- */
function reg(){try{if(typeof SK==='object'&&SK&&!SK.spDragon)SK.spDragon={id:'spDragon',name:'นักล่ามังกร',type:'spsk',cls:'novice',idx:64,cd:C.cooldownSec,mp:0,m:0,dt:'phys',r:0,range:0,th:'spirit',glyph:'🏹'}}catch(e){ERR('reg',e)}
  try{const S=window.SPSK;if(S&&S.defs&&!S.defs.some(d=>d.id==='dh')){S.defs.push({id:'dh',name:'นักล่ามังกร',en:'Dragon Hunter',col:'#ffd36b',lv:0,cd:C.cooldownSec,mp:0,key:'—',npc:(/[?&]gm=on\b/.test(location.search)?'ยังไม่เปิด (GM / ?dragonhunter=unlock)':'ยังไม่เปิดใช้งาน'),api:()=>API,cdId:'spDragon',
      desc:'เรียกธนูแสงทอง ยิงลูกศรแสงใส่มอนตรงหน้า 300% แล้ววาร์ปไปฟันด้วยอาวุธที่ถือ 500%',full:'กดค้าง: ธนูแสงก่อตัว ง้าง 0.8 วิ แล้วเล็ง/ชาร์จ (เดินได้ 50%) ปล่อย: ลูกศรแสงความเร็ว 1600 px/วิ ระยะ 900 px โดนมอนตัวแรก 300% แล้ววาร์ป 0.18 วิ ไปหน้ามอน ฟันด้วยอาวุธที่ถืออยู่ 1 ครั้ง 500% ใช้ได้ '+C.usesPerWindow+' ครั้งใน '+C.windowSec+' วิ แล้วคูลดาวน์ '+C.cooldownSec+' วิ (ตัวเลขชั่วคราว)'});if(window.__DH_ICON)S.setIcon('dh',window.__DH_ICON)}}catch(e){ERR('spsk',e)}}
reg();setInterval(reg,1500);
try{const o=skillIcon;skillIcon=function(id){if(id==='spDragon'&&window.__DH_ICON)return window.__DH_ICON;return o.apply(this,arguments)}}catch(e){ERR('hook icon',e)}
function freeIdx(){try{const used=new Set();for(const el of document.querySelectorAll('#bar .slot.wsk,#tSkills .tsk.wsk')){const i=+(el.dataset.i!==undefined?el.dataset.i:el.dataset.ti);if(i>=0)used.add(i)}const K=['1','2','3','4','5','6','q','e','r','f'];for(let i=0;i<P.slots.length;i++){if(K[i]==='r')continue;if(P.slots[i]==null&&!used.has(i))return i}}catch(e){ERR('freeIdx',e)}return -1}
DH.place=function(){try{const i=P.slots.indexOf('spDragon');if(i>=0){P.slots[i]=null;buildBar();try{saveGame()}catch(_){}say('นักล่ามังกร: ถอดออกจากช่อง');return true}
  if(!DH.unlocked){say('ยังไม่เปิดใช้งาน');return false}const f=freeIdx();if(f<0){say('ไม่มีช่องว่าง');return false}P.slots[f]='spDragon';buildBar();try{saveGame()}catch(_){}say('นักล่ามังกร: ติดตั้งช่องสกิลแล้ว');return true}catch(e){ERR('place',e);return false}};
document.addEventListener('click',e=>{try{const t=e.target&&e.target.closest?e.target:null;if(!t)return;const sl=t.closest('[data-spslot]');let k=sl&&sl.dataset.spslot;if(!k&&t.closest('#spGo')&&window.SPSK)k=SPSK.sel;if(k!=='dh')return;e.stopImmediatePropagation();e.preventDefault();DH.place();try{SPSK.sig=''}catch(_){}}catch(er){ERR('click',er)}},true);
setInterval(()=>{try{const i=P&&P.slots?P.slots.indexOf('spDragon'):-1;for(const b of document.querySelectorAll('#wWpnSk [data-spslot="dh"]')){const tx=!DH.unlocked?'🔒 ยังไม่เปิดใช้งาน':i>=0?'✔ อยู่ช่องสกิล · ถอด':'ติดตั้งลงช่องสกิล';if(b.textContent!==tx)b.textContent=tx;b.classList.toggle('on',i>=0);b.disabled=!DH.unlocked}
  const go=document.getElementById('spGo');if(go&&window.SPSK&&SPSK.sel==='dh'){const tx=!DH.unlocked?'🔒 ยังไม่เปิดใช้งาน':P.slots.indexOf('spDragon')>=0?'ถอดออกจากช่องสกิล':'ติดตั้งลงช่องสกิล';if(go.textContent!==tx)go.textContent=tx;go.disabled=!DH.unlocked}}catch(_){}},400);
try{if(!window.__REAL||new URLSearchParams(location.search).get('gm')==='on'){const b=document.createElement('button');b.id='dhGm';b.type='button';b.textContent='🏹 GM: นักล่ามังกร';b.style.cssText='position:fixed;left:8px;bottom:92px;z-index:20;padding:4px 8px;border-radius:8px;border:1px solid #ffd36b;background:rgba(40,30,8,.9);color:#ffe9a0;font:700 11px system-ui;cursor:pointer';document.body.appendChild(b);
  b.addEventListener('click',e=>{e.stopPropagation();DH.unlock(true);DH.place()});for(const ev of ['pointerdown','mousedown','touchstart'])b.addEventListener(ev,e=>e.stopPropagation())}}catch(e){ERR('gm',e)}
/* ---------- drawing (world overlay, code only) ---------- */
function vbHalf(sg){const Pt=(x,y)=>[x,y*sg];return {limb:[Pt(30,-62),Pt(52,-262),Pt(-80,-400),Pt(-282,-327),Pt(-130,-350),Pt(-22,-262),Pt(-14,-62)],horn:[Pt(-62,-112),Pt(-20,-70),Pt(40,-70),Pt(84,-112),Pt(40,-88),Pt(-20,-88)],curl:{c:Pt(66,-178),r:30},gems:[Pt(10,-128),Pt(10,-196)],spikes:[[Pt(-120,-362),70],[Pt(-18,-318),70]],ring:{c:Pt(-50,-300),r:20},fins:[[Pt(-6,-150),Pt(52,-120),Pt(14,-200)],[Pt(-6,-230),Pt(40,-246),Pt(4,-262)]]}}
const VB=[vbHalf(-1),vbHalf(1)];let VBS=null;
function vbShapes(cx){const out=[];VB.forEach(h=>{const sg=h.curl.c[1]<0?-1:1;
  out.push(()=>{const L=h.limb;cx.moveTo(L[0][0],L[0][1]);cx.bezierCurveTo(L[1][0],L[1][1],L[2][0],L[2][1],L[3][0],L[3][1]);cx.bezierCurveTo(L[4][0],L[4][1],L[5][0],L[5][1],L[6][0],L[6][1]);cx.closePath()});
  out.push(()=>{cx.moveTo(8,56*sg);cx.bezierCurveTo(70,110*sg,66,220*sg,16,282*sg);cx.bezierCurveTo(-30,220*sg,-40,110*sg,8,56*sg);cx.closePath()});
  h.fins.forEach(f=>{out.push(()=>{cx.moveTo(f[0][0],f[0][1]);cx.quadraticCurveTo((f[0][0]+f[1][0])/2+10,(f[0][1]+f[1][1])/2,f[1][0],f[1][1]);cx.quadraticCurveTo((f[1][0]+f[2][0])/2,(f[1][1]+f[2][1])/2,f[2][0],f[2][1]);cx.closePath()})});
  out.push(()=>{const o=h.horn;cx.moveTo(o[0][0],o[0][1]);cx.bezierCurveTo(o[1][0],o[1][1],o[2][0],o[2][1],o[3][0],o[3][1]);cx.bezierCurveTo(o[4][0],o[4][1],o[5][0],o[5][1],o[0][0],o[0][1]);cx.closePath()});
  h.spikes.forEach(sp=>{out.push(()=>{const x=sp[0][0],y=sp[0][1],L=sp[1];cx.moveTo(x,y-L*0.6);cx.lineTo(x+10,y-4);cx.lineTo(x+24,y);cx.lineTo(x+10,y+4);cx.lineTo(x,y+L*0.45);cx.lineTo(x-10,y+4);cx.lineTo(x-24,y);cx.lineTo(x-10,y-4);cx.closePath()})});
  h.gems.forEach(g=>{out.push(()=>{cx.moveTo(g[0],g[1]-20);cx.lineTo(g[0]+12,g[1]);cx.lineTo(g[0],g[1]+20);cx.lineTo(g[0]-12,g[1]);cx.closePath()})})});
  out.push(()=>{cx.moveTo(-18,-60);cx.lineTo(18,-60);cx.lineTo(18,60);cx.lineTo(-18,60);cx.closePath()});
  out.push(()=>{cx.moveTo(-24,-70);cx.lineTo(24,-70);cx.lineTo(24,-54);cx.lineTo(-24,-54);cx.closePath();cx.moveTo(-24,70);cx.lineTo(24,70);cx.lineTo(24,54);cx.lineTo(-24,54);cx.closePath()});return out}
function vbPath(cx){cx.beginPath();(VBS=VBS||vbShapes(cx)).forEach(f=>f())}
function vbLines(cx){cx.beginPath();VB.forEach(h=>{const c=h.curl.c,r=h.curl.r,sg=c[1]<0?-1:1;for(let i=0;i<=40;i++){const a=i/40*5.2,rr=r*(1-i/40*0.7),x=c[0]+Math.cos(a*sg+Math.PI)*rr,y=c[1]+Math.sin(a*sg+Math.PI)*rr;if(i)cx.lineTo(x,y);else{cx.moveTo(x-24,y+30*sg);cx.lineTo(x,y)}}const g=h.ring.c;cx.moveTo(g[0]+h.ring.r,g[1]);cx.arc(g[0],g[1],h.ring.r,0,6.283)})}
function vbSpine(cx){cx.beginPath();VB.forEach(h=>{const L=h.limb;cx.moveTo(8,L[0][1]);cx.bezierCurveTo(28,L[1][1]*0.98,-84,L[2][1]*0.96,-272,L[3][1])})}
const BA_K=1.25,BA_SX=0.48;
function bowXf(p){const W=U().solve(p);if(!W.offhand)return null;const G=rp(p,'offhand',[70,240]),A=rp(p,'offhand',[28,-99]),B=rp(p,'offhand',[28,579]),F=rp(p,'offhand',[170,240]),Fo=G;if(!G||!A||!B||!F)return null;
  const L=Math.hypot(B[0]-A[0],B[1]-A[1]),yx=(B[0]-A[0])/L,yy=(B[1]-A[1])/L;let fx=F[0]-Fo[0],fy=F[1]-Fo[1];const fl=Math.hypot(fx,fy)||1;fx/=fl;fy/=fl;
  const s=L*BA_K/654,a=fx*s*BA_SX,b=fy*s*BA_SX,c=yx*s,d=yy*s,e=G[0],f=G[1];const Pq=q=>[a*q[0]+c*q[1]+e,b*q[0]+d*q[1]+f];return {m:[a,b,c,d,e,f],t1:Pq([-282,-327]),t2:Pq([-282,327])}}
const chargeK=()=>DH.st==='draw'?(DH.t<C.SUM?0:0.12*E((DH.t-C.SUM)/C.PULL)):DH.st==='aim'?DH.charge:0;
function drawBow(cx,p){const X0=bowXf(p);if(!X0)return null;if(DH.st==='draw'&&DH.t<0.06)return X0;const c=chargeK(),span=420,rv=DH.st==='draw'?E(Math.min(1,Math.max(0,(DH.t-0.16)/(C.SUM-0.12)))):1,r=span*rv,pul=0.85+0.15*Math.sin(time*9);
  cx.save();cx.transform(X0.m[0],X0.m[1],X0.m[2],X0.m[3],X0.m[4],X0.m[5]);cx.beginPath();cx.rect(-420,-r,640,2*r);cx.clip();cx.lineJoin='round';cx.lineCap='round';
  cx.save();cx.globalCompositeOperation='lighter';vbPath(cx);cx.shadowColor='rgba(255,200,80,1)';cx.shadowBlur=18;cx.fillStyle='rgba(255,190,70,'+(0.35+0.3*c)*pul+')';cx.fill();cx.lineWidth=22;cx.strokeStyle='rgba(255,200,90,'+(0.18+0.2*c)*pul+')';cx.stroke();vbLines(cx);cx.lineWidth=20;cx.stroke();cx.restore();
  const gr=cx.createLinearGradient(-280,0,60,0);gr.addColorStop(0,'#ffcf5a');gr.addColorStop(0.55,'#ffe9a0');gr.addColorStop(1,'#ffd36b');
  (VBS=VBS||vbShapes(cx)).forEach(f=>{cx.beginPath();f();cx.fillStyle=gr;cx.fill();cx.lineWidth=6;cx.strokeStyle='rgba(140,76,8,0.9)';cx.stroke()});
  vbLines(cx);cx.lineWidth=13;cx.strokeStyle='rgba(150,84,10,0.85)';cx.stroke();cx.lineWidth=8;cx.strokeStyle='#ffdc78';cx.stroke();
  cx.save();cx.globalCompositeOperation='lighter';vbSpine(cx);cx.lineWidth=4;cx.strokeStyle='rgba(255,250,220,'+(0.7+0.3*c)+')';cx.stroke();
  const sy=((time*0.9)%1)*900-450,sg2=cx.createLinearGradient(0,sy-40,0,sy+40);sg2.addColorStop(0,'rgba(255,255,235,0)');sg2.addColorStop(0.5,'rgba(255,255,235,0.6)');sg2.addColorStop(1,'rgba(255,255,235,0)');(VBS=VBS||vbShapes(cx)).forEach(f=>{cx.beginPath();f();cx.fillStyle=sg2;cx.fill()});cx.restore();
  if(rv<1){cx.globalCompositeOperation='lighter';[-r,r].forEach(y=>{const g2=cx.createLinearGradient(0,y-16,0,y+16);g2.addColorStop(0,'rgba(255,230,150,0)');g2.addColorStop(0.5,'rgba(255,255,240,0.95)');g2.addColorStop(1,'rgba(255,230,150,0)');cx.fillStyle=g2;cx.fillRect(-320,y-16,420,32)})}
  cx.restore();return X0}
function drawString(cx,p,X0){const W=U().solve(p);if(!W.offhand||!X0)return;if(DH.st==='draw'&&DH.t<C.SUM-0.04)return;const T0=X0.t1,B0=X0.t2;let pts=[T0,B0];
  if(p.arrowOn&&W.arrow&&p.pull>0){const n=rp(p,'arrow',[352,40]),M=[(T0[0]+B0[0])/2,(T0[1]+B0[1])/2];if(n)pts=[T0,[M[0]+(n[0]-M[0])*p.pull,M[1]+(n[1]-M[1])*p.pull],B0]}
  else if(p.snap>=0&&p.snap<0.16){const k=p.snap/0.16,dx=B0[0]-T0[0],dy=B0[1]-T0[1],L=Math.hypot(dx,dy)||1,o=9*(1-k)*Math.sin(k*38);pts=[T0,[(T0[0]+B0[0])/2-dy/L*o,(T0[1]+B0[1])/2+dx/L*o],B0]}
  cx.save();cx.globalCompositeOperation='lighter';cx.lineCap='round';cx.lineJoin='round';const pul=0.75+0.25*Math.sin(time*9);
  [[5,'rgba(120,210,255,'+(0.25*pul)+')'],[2.4,'rgba(255,236,170,'+(0.7*pul)+')'],[1,'rgba(255,255,245,1)']].forEach(L=>{cx.strokeStyle=L[1];cx.lineWidth=L[0];cx.beginPath();cx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)cx.lineTo(pts[i][0],pts[i][1]);cx.stroke()});cx.restore()}
function drawAimLine(cx){const tp=tipWorld(),d=DH.aim,L=rangeNow(),w=(1-DH.charge)*0.12+0.02;cx.save();cx.globalCompositeOperation='lighter';cx.setLineDash([2,12]);cx.lineWidth=3;cx.strokeStyle='rgba(255,236,170,'+(0.25+0.4*DH.charge)+')';cx.beginPath();cx.moveTo(tp[0],tp[1]);cx.lineTo(tp[0]+d[0]*L,tp[1]+d[1]*L);cx.stroke();cx.restore()}
function drawCharge(cx){const c=chargeK();if(c<=0&&DH.st!=='aim')return;const x=P.x,y=P.y+2;cx.save();cx.globalCompositeOperation='lighter';const R=34+34*Math.min(1,c*2);cx.strokeStyle='rgba(255,220,120,'+(0.3+0.5*c)+')';cx.lineWidth=3;cx.beginPath();cx.ellipse(x,y,R,R*0.3,0,0,6.283);cx.stroke();cx.beginPath();cx.ellipse(x,y,R*0.65,R*0.2,0,0,6.283);cx.stroke();
  const tp=tipWorld();const g=cx.createRadialGradient(tp[0],tp[1],0,tp[0],tp[1],10+26*c);g.addColorStop(0,'rgba(255,255,240,.95)');g.addColorStop(0.45,'rgba(255,225,140,.6)');g.addColorStop(1,'rgba(110,200,255,0)');cx.fillStyle=g;cx.beginPath();cx.arc(tp[0],tp[1],10+26*c,0,6.283);cx.fill();cx.restore()}
function drawArrow(cx){const A=DH.arrow;if(!A)return;const e=time-A.t0;if(e<0||e>A.dur)return;const u=Math.min(1,e/A.dur),L=A.dur*C.SPEED*u,x=A.x0+A.d[0]*L,y=A.y0+A.d[1]*L,a=Math.atan2(A.d[1],A.d[0]);
  cx.save();cx.globalCompositeOperation='lighter';const tl=Math.min(L,220),g=cx.createLinearGradient(x,y,x-A.d[0]*tl,y-A.d[1]*tl);g.addColorStop(0,'rgba(255,255,240,1)');g.addColorStop(0.3,'rgba(255,220,130,.8)');g.addColorStop(1,'rgba(110,200,255,0)');
  cx.strokeStyle=g;cx.lineCap='round';cx.lineWidth=10;cx.beginPath();cx.moveTo(x,y);cx.lineTo(x-A.d[0]*tl,y-A.d[1]*tl);cx.stroke();cx.lineWidth=3;cx.strokeStyle='rgba(255,255,250,1)';cx.stroke();
  cx.translate(x,y);cx.rotate(a);const hg=cx.createRadialGradient(0,0,0,0,0,26);hg.addColorStop(0,'rgba(255,255,245,1)');hg.addColorStop(0.4,'rgba(255,225,140,.8)');hg.addColorStop(1,'rgba(110,200,255,0)');cx.fillStyle=hg;cx.beginPath();cx.arc(0,0,26,0,6.283);cx.fill();cx.fillStyle='#fffbe6';cx.beginPath();cx.moveTo(14,0);cx.lineTo(-4,-6);cx.lineTo(0,0);cx.lineTo(-4,6);cx.closePath();cx.fill();cx.restore()}
function drawFX(cx){for(let i=FX.length-1;i>=0;i--){if(time-FX[i].t0>1.0)FX.splice(i,1)}
  for(const f of FX){const e=time-f.t0;cx.save();cx.globalCompositeOperation='lighter';
    if(f.k==='rel'&&e<0.3){const q=e/0.3;const g=cx.createRadialGradient(f.x,f.y,0,f.x,f.y,30+40*q);g.addColorStop(0,'rgba(255,255,240,'+(1-q)+')');g.addColorStop(1,'rgba(255,200,80,0)');cx.fillStyle=g;cx.beginPath();cx.arc(f.x,f.y,30+40*q,0,6.283);cx.fill()}
    if(f.k==='hit1'&&e<0.6){const q=e/0.6;cx.strokeStyle='rgba(255,240,190,'+(1-q)+')';cx.lineWidth=4;cx.beginPath();cx.arc(f.x,f.y,14+60*E(q),0,6.283);cx.stroke();for(let j=0;j<8;j++){const a=j*0.785+0.3,r1=18+50*E(q),r2=r1+22*(1-q);cx.beginPath();cx.moveTo(f.x+Math.cos(a)*r1,f.y+Math.sin(a)*r1);cx.lineTo(f.x+Math.cos(a)*r2,f.y+Math.sin(a)*r2);cx.stroke()}}
    if(f.k==='warp'&&e<0.5){const q=e/0.5;cx.strokeStyle='rgba(255,236,170,'+(1-q)*0.9+')';cx.lineWidth=16*(1-q)+2;cx.lineCap='round';cx.beginPath();cx.moveTo(f.x0,f.y0);cx.lineTo(f.x0+(f.x1-f.x0)*E(Math.min(1,q*1.5)),f.y0+(f.y1-f.y0)*E(Math.min(1,q*1.5)));cx.stroke();cx.strokeStyle='rgba(120,210,255,'+(1-q)*0.7+')';cx.lineWidth=6*(1-q)+1;cx.stroke()}
    if(f.k==='slash'&&e<0.4){const q=e/0.4;cx.translate(f.x,f.y);cx.scale(f.face,1);cx.strokeStyle='rgba(255,245,200,'+(1-q)+')';cx.lineWidth=10*(1-q)+2;cx.lineCap='round';cx.beginPath();cx.arc(0,0,60+20*q,-1.2+q*0.6,0.8+q*0.8);cx.stroke()}
    cx.restore()}}
/* ---------- Art FX layers (LBFX1 pieces, additive; ported from art_fx.js) ---------- */
(function(){
var cx=null,T=0;var H={get x(){return P.x},get y(){return P.y+(X().cfg.FOOT_DY||0)-6}};
var S={get st(){return DH.st},get charge(){return DH.charge},get t(){return DH.t},get arrow(){return DH.arrow}};
var LB={get SPEED(){return C.SPEED},get FULL(){return C.FULL}};
function tipPt(p){return tipWorld()}
// ---- r3 DeaRz 16 Nov 'รอเอฟเฟกวาดจาก ChatGPT': Art LBFX1 pieces (fx_pieces_r1, additive). Every piece is layered with motion; none moves alone.
var FXI={}; if(window.LBFX) Object.keys(window.LBFX).forEach(function(k){ var im=new Image(); im.src=window.LBFX[k]; FXI[k]=im; });
var ARTFX=!/[?&]artfx=off/.test(location.search);
function fxd(k,x,y,sc,rot,al,ax,ay,sx,sy){ var im=FXI[k]; if(!ARTFX||!im||!im.complete||!im.naturalWidth||al<=0||sc<=0) return; cx.save(); cx.globalCompositeOperation='lighter'; cx.globalAlpha=Math.min(1,al*((k.indexOf('pillar')===0||k.indexOf('mote')===0)?DH.artK():1)); cx.translate(x,y); if(rot) cx.rotate(rot); cx.scale(sc*(sx||1),sc*(sy||1)); cx.drawImage(im,-im.width*(ax==null?0.5:ax),-im.height*(ay==null?0.5:ay)); cx.restore(); }
var MOTES=['mote_1','mote_2','mote_3','mote_4','mote_5','mote_6','mote_7','mote_8','mote_9','mote_10','mote_11','mote_12','mote_13'];
// charge: two pillars (gold + cyan) breathing at different rates, glint/leaf motes rising and turning
function drawChargeArt(){ var c=chargeK(); if(c<=0) return; var x=H.x, y=H.y+4, full=S.charge>=1&&S.st==='aim';
  var b1=1+0.06*Math.sin(T*5.3), b2=1+0.08*Math.sin(T*3.7+1), fl=0.85+0.15*Math.sin(T*23)*Math.sin(T*7);
  fxd('pillar_2',x,y,0.55+0.45*c,0,0.55*c*fl,0.5,0.93,1.05*b2,0.6+0.7*c);
  fxd('pillar_1',x,y,0.45+0.4*c,0,0.75*c*fl,0.5,0.97,0.8*b1,0.55+0.75*c*(full?1.08:1));
  var N=Math.floor(6+18*c); for(var i=0;i<N;i++){ var u=((T*0.55+rnd(i*5))%1), a=rnd(i)*6.283, r=(40+60*c)*(0.3+0.7*rnd(i*9));
    fxd(MOTES[i%MOTES.length],x+Math.cos(a)*r+Math.sin(T*2+i)*6,y+Math.sin(a)*r*0.32-u*(90+220*c),0.35+0.35*rnd(i*13),u*4+i,Math.sin(Math.PI*u)*0.95); } }
// arrow-tip orb: small -> medium -> large orbs cross-fade with charge; each drawn twice turning opposite ways at different speeds, scale breathing out of phase
function drawOrbArt(p){ var tp=tipPt(p); if(!tp) return; var c=chargeK(), full=S.charge>=1&&S.st==='aim'; if(c<=0) return;
  var w1=1-E(seg2(c,0.2,0.5)), w2=E(seg2(c,0.2,0.5))*(1-E(seg2(c,0.65,0.95))), w3=E(seg2(c,0.65,0.95)), base=0.18+0.32*c+(full?0.03*Math.sin(T*24):0);
  [['orb_1',w1,2.2],['orb_2',w2,1.1],['orb_3',w3,0.55]].forEach(function(o){ if(o[1]<=0) return; var s=base*(o[0]==='orb_1'?1.7:o[0]==='orb_2'?1:0.62);
    fxd(o[0],tp[0],tp[1],s*(1+0.07*Math.sin(T*6)),-T*o[2]*3,0.9*o[1]);
    fxd(o[0],tp[0],tp[1],s*0.72*(1+0.1*Math.sin(T*8+2)),T*o[2]*4.6+1.3,0.6*o[1]); });
  if(c>0.55){ var k=(c-0.55)/0.45; fxd('flash_2',tp[0],tp[1],(0.18+0.22*k)*(1+0.15*Math.sin(T*17)),T*0.4,0.75*k); }
  var fe=S.st==='aim'?S.t-LB.FULL:-1; if(fe>=0&&fe<0.4){ var q=fe/0.4; fxd('star',tp[0],tp[1],0.3+0.9*E(q),0,1-q); } }
function seg2(x,a,b){ return Math.max(0,Math.min(1,(x-a)/(b-a))); }
// flying arrow: head + two trails (one long and steady, one shorter flickering), small glints shed behind
function drawArrowArt(){ var A=S.arrow; if(!A) return; var e=T-A.t0; if(e<0||e>A.dur) return; var u=Math.min(1,e/A.dur), L=A.dur*LB.SPEED*u, x=A.x0+A.d[0]*L, y=A.y0+A.d[1]*L, a=Math.atan2(A.d[1],A.d[0]);
  var tl=Math.min(1,L/260); fxd('arrow_2',x,y,0.9,a,0.9,0.98,0.5,0.4+0.9*tl,0.7); fxd('arrow_3',x,y,0.85,a,0.6+0.4*Math.sin(T*50),0.98,0.5,0.3+0.8*tl,0.9+0.2*Math.sin(T*37)); fxd('arrow_1',x,y,0.42,a,1,0.92,0.5);
  for(var i=0;i<4;i++){ var q=((T*8+i/4)%1); fxd(MOTES[(i*3)%MOTES.length],x-A.d[0]*q*120+(rnd(i+Math.floor(T*8))-0.5)*16,y-A.d[1]*q*120+(rnd(i*5+Math.floor(T*8))-0.5)*16,0.35,q*6,1-q); } }
// one-shot FX on top of the code FX
function drawFXArt(){ FX.forEach(function(f){ var e=T-f.t0;
  if(f.k==='rel'&&e<0.3){ var q=e/0.3; fxd('flash_2',f.x,f.y,0.3+0.5*E(q),f.a,1-q); fxd('arrow_2',f.x,f.y,0.7,f.a+Math.PI,0.8*(1-q),0.02,0.5,0.5+0.6*q,1.2*(1-q)); }
  if(f.k==='hit1'&&e<0.6){ var q=e/0.6; fxd('star',f.x,f.y,0.3+0.5*E(Math.min(1,q*2)),q*0.6,1-E(q)); fxd('burst',f.x,f.y+44,0.35+0.35*E(q),0,(1-q)*1.1,0.5,0.95); fxd('hit_3',f.x+8,f.y+40,0.3+0.4*E(q),0,(1-q)*0.9,0.5,0.95,-1,1);
    for(var j=0;j<6;j++){ var aa=-0.4-rnd(j)*2.4, v=120+rnd(j*3)*200; fxd(MOTES[(j*2+1)%MOTES.length],f.x+Math.cos(aa)*v*e,f.y+Math.sin(aa)*v*e+260*e*e,0.45,e*9+j,1-q); } }
  if(f.k==='warp'&&e<0.5){ var q=e/0.5, dx=f.x1-f.x0, dy=f.y1-f.y0, L=Math.hypot(dx,dy)||1, a=Math.atan2(dy,dx);
    // two streaks stretched along the path at different speeds, plus vertical flares where the hero leaves and lands
    fxd('arrow_2',f.x0+dx*E(Math.min(1,q*1.4)),f.y0+dy*E(Math.min(1,q*1.4)),1,a,(1-q)*1.1,0.98,0.5,L/270*(0.6+0.4*q),0.9);
    fxd('arrow_3',f.x0+dx*E(Math.min(1,q*1.8)),f.y0+dy*E(Math.min(1,q*1.8))-10,1,a,(1-q)*0.8,0.98,0.5,L/300*0.8,0.6+0.3*Math.sin(T*40));
    if(e<0.3){ var k=e/0.3; fxd('warp_4',f.x0,f.y0+10,0.7+0.4*k,0,1-k,0.5,0.6,1+k,1); fxd('warp_4',f.x1,f.y1+10,0.4+0.8*E(k),0,(1-k)*1.2,0.5,0.6,1.4,1); } }
  if(f.k==='slash'&&e<0.4){ var q=e/0.4, fc=f.face;
    cx.save(); cx.translate(f.x,f.y-40); cx.scale(fc,1); var r0=-0.6+0.9*E(Math.min(1,q*2));
    fxd('slash_1',0,0,0.55+0.25*q,r0,(1-q)*1.1,0.62,0.5); fxd('slash_2',8,-6,0.8+0.3*q,r0+0.15,(1-q)*1.2,0.6,0.5); fxd('slash_3',-6,8,0.42+0.2*q,r0-0.2,(1-E(q))*0.8,0.62,0.5); cx.restore(); } }); }

DH.artDraw=function(c,phase,p){cx=c;T=time;try{if(phase==='back'){drawChargeArt()}else if(phase==='orb'){drawOrbArt(p)}else if(phase==='arrow'){drawArrowArt()}else if(phase==='fx'){drawFXArt()}}catch(e){ERR('art',e)}};
DH.artOn=ARTFX;DH.artK=function(){try{return (G.zone==='map11'||G.zone==='map12')?1:C.artGrassK}catch(_){return 1}};
})();
/* behind the hero: the charge ground circles + pillars are a y-sorted prop under the hero's feet (the hero draws on top of them, as in the demo) */
let backProp=null;
function ensureBack(){try{if(!PROP_DEFS.dhfx)PROP_DEFS.dhfx={n:'DH back FX',cat:'misc',w:300,h:300,ax:150,ay:150,liveOnly:1,nofade:1,draw(){},live(c){try{if(DH.st==='draw'||DH.st==='aim'){drawCharge(c);DH.artDraw(c,'back')}}catch(e){ERR('back',e)}}};return true}catch(e){return false}}
function backOn(){try{if(backProp||!ensureBack())return;backProp={t:'dhfx',x:P.x,y:P.y-3,s:1,v:0,f:1,ph:0};PROPS.push(backProp)}catch(e){ERR('backOn',e)}}
function backOff(){try{if(!backProp)return;const i=PROPS.indexOf(backProp);if(i>=0)PROPS.splice(i,1)}catch(_){}backProp=null}
DH.draw=function(cx){try{if(DH.st==='idle'&&!FX.length)return;if(DH.st!=='idle'&&lastPose&&(DH.st==='draw'||DH.st==='aim'||DH.st==='release'||DH.st==='warp')){const p=lastPose;if(DH.st==='aim')drawAimLine(cx);if(DH.st!=='warp'){DH.artDraw(cx,'orb',p);const X0=drawBow(cx,p);drawString(cx,p,X0)}drawArrow(cx);DH.artDraw(cx,'arrow')}else{drawArrow(cx);DH.artDraw(cx,'arrow')}drawFX(cx);DH.artDraw(cx,'fx')}catch(e){ERR('draw',e)}};
try{const _o=drawEditorOverlay;drawEditorOverlay=function(){const r=_o.apply(this,arguments);try{DH.draw(ctx)}catch(e){ERR('ovl',e)}return r}}catch(e){ERR('hook overlay',e)}
})();

