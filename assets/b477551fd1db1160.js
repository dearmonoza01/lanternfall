
/* ---- candidate_sword_sk2_8dir_r1: p225 r4 central monster target lock (= r3 + Sword Skill 2 counts as busy: no auto re-pick mid-skill) ---- */
/* p225 — ONE central monster target lock (candidate_sword_sk1_anim_r2, user 22:19). Replaces the TEST-only lock that lived inside p223
   (r2–r4): there is now a single lock for every monster type, used by the basic attack (on in this candidate) and by Sword Skill 1 (TEST).
   Existing systems read first and reused (nothing duplicated):
     input   = the game's cv pointerdown (left click = basic-attack hold, touch = walk / tap-near-monster attack), #joyZone (own element),
               HUD / tray / panels (own DOM elements — they never reach cv), two-finger pinch on cv, right-drag camera, editor (ED.on / G.edit).
     aiming  = the game's aimPoint() (autoplay target > touch nearest > mouse cursor) — it is only asked at attack / cast time.
     attack  = basicAttack chain (HERO3D wraps it: the swing starts now, the real hit fires later through basicAttack again with HERO3D.firing).
     walls   = the game's blocked() (same line test as p223).
   Rules (user 22:19):
     • click / tap a monster = select it (consumed: no walk, no damage). Another monster = switch. The same monster again or ✕ = release.
     • attack pressed with no target → auto-pick among monsters that can be hit NOW (edge in weapon reach, clear line): nearest; near-ties
       (within 15% or 20 px) go to the one closest to the aim direction. The pick is HELD (no per-frame re-pick).
     • a clicked target always wins over auto. An auto target is only replaced when the combo is over and it can no longer be hit.
     • held by monster object + stable id (never by mouse position). Released on death / removal / map change / leaving lock range.
     • basic attack: face the target when the swing STARTS; the delayed hit of that swing uses the start direction (no turn mid-swing).
       Target beyond reach → "too far" note, no swing, no auto-walk. Target behind a wall → note, no swing. Area hits stay as the game does them.
     • autoplay keeps its own target; editor / non-play states are left alone; other skills keep the game's aiming this round.
   Debug: window.TLOCK (state, log, stats). */
(function(){'use strict';
const TL=window.TLOCK={ver:"p225-r4",on:true,err:null,e:null,id:null,zone:null,src:null,why:null,log:[],swing:null,use:0,
  stats:{freeSwing:0,click:0,auto:0,switch:0,release:0,far:0,wall:0,consumed:0,skipPinch:0},
  cfg:{lockRange:420,pickR:12,tieFrac:.15,tiePx:20,noteGap:.9}};
if(typeof aimPoint!=='function'||typeof basicAttack!=='function'||typeof update!=='function'||typeof blocked!=='function'){TL.err='hooks missing';return;}
const CF=TL.cfg;
/* ---------- helpers ---------- */
const UID=new WeakMap();let uidN=0;
const eid=TL.eid=e=>{if(!e)return null;if(!UID.has(e))UID.set(e,(e.type||'mob')+'#'+(++uidN));return UID.get(e);};
const dist=(a,b,c,d)=>Math.hypot(c-a,d-b);
const angD=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
const alive=TL.alive=e=>!!e&&!e.dead&&e.hp>0&&enemies.includes(e);
const edge=TL.edge=e=>dist(P.x,P.y,e.x,e.y)-(e.sz||16);
const los=TL.los=function(x0,y0,x1,y1,stopShort){const L=Math.hypot(x1-x0,y1-y0),n=Math.max(1,Math.ceil((L-stopShort)/8));
  for(let i=1;i<=n;i++){const u=Math.min(1,(i*8)/L);if(u*L>L-stopShort)break;if(blocked(x0+(x1-x0)*u,y0+(y1-y0)*u,2))return false;}return true;};
const losTo=TL.losTo=e=>los(P.x,P.y,e.x,e.y,(e.sz||16));
const playing=()=>typeof G!=='undefined'&&G.state==='play'&&!G.edit&&!(typeof ED!=='undefined'&&ED.on)&&typeof P!=='undefined'&&P;
let lastNote={m:'',t:-9};
const note=TL.note=function(msg,col){if(lastNote.m===msg&&time-lastNote.t<CF.noteGap)return;lastNote={m:msg,t:time};TL.lastNote={m:msg,t:+time.toFixed(2)};
  try{textAt(P.x,P.y-70,msg,col||'#ffcf9a',14,{life:.9,vy:-30});}catch(e){}};
/* ---------- state ---------- */
function set(e,src,why){const old=TL.id;TL.e=e||null;TL.id=e?eid(e):null;TL.zone=e?G.zone:null;TL.src=e?src:null;TL.why=why;
  TL.log.push({t:+time.toFixed(2),from:old,to:TL.id,src:TL.src,why});if(TL.log.length>60)TL.log.shift();
  if(e){if(src==='click')TL.stats.click++;else TL.stats.auto++;if(old&&old!==TL.id)TL.stats.switch++;}else if(old)TL.stats.release++;
  hud();}
TL.set=set;TL.clear=why=>{if(TL.e||TL.id)set(null,null,why);};
function check(){if(!TL.e)return;const e=TL.e;
  if(G.zone!==TL.zone)return TL.clear('เปลี่ยนแมพ');
  if(!enemies.includes(e))return TL.clear('เป้าถูกนำออก');
  if(e.dead||!(e.hp>0))return TL.clear('เป้าตาย');
  if(typeof P!=='undefined'&&P&&edge(e)>CF.lockRange)return TL.clear('ออกนอกระยะล็อก');}
TL.check=check;
function pickAt(wx,wy){let best=null,bd=1e9;for(const e of enemies){if(!alive(e))continue;const cy=e.y-(e.sz||16)*.8,d=dist(wx,wy,e.x,cy);if(d<=(e.sz||16)*1.3+CF.pickR&&d<bd){bd=d;best=e;}}return best;}
TL.pickAt=pickAt;
function tap(e){if(!e)return false;
  if(TL.e===e){TL.clear('แตะเป้าเดิม');return true;}
  if(edge(e)>CF.lockRange){note('มอนอยู่นอกระยะล็อก');return true;}
  set(e,'click',TL.e?'เปลี่ยนเป้า':'เลือกเป้า');return true;}
TL.tap=tap;
/* aim direction used only to break near-ties (desktop: cursor; touch: joystick, else facing) */
function aimAng(){try{if(G.lastInput==='touch'){if(G.joy)return Math.atan2(G.joy.y,G.joy.x);return P.face;}
  return Math.atan2(mwy(mouse.x,mouse.y)-P.y,mwx(mouse.x,mouse.y)-P.x);}catch(e){return P.face||0;}}
function autoPick(reach){const c=[];
  for(const e of enemies){if(!alive(e))continue;const d=edge(e);if(d>reach||d>CF.lockRange)continue;if(!losTo(e))continue;c.push({e,d});}
  if(!c.length)return null;c.sort((a,b)=>a.d-b.d);
  const lim=c[0].d+Math.max(CF.tiePx,Math.abs(c[0].d)*CF.tieFrac),a=aimAng();
  let best=c[0],ba=1e9;for(const k of c){if(k.d>lim)break;const da=Math.abs(angD(a,Math.atan2(k.e.y-P.y,k.e.x-P.x)));if(da<ba-1e-6){ba=da;best=k;}}
  TL.lastAuto={t:+time.toFixed(2),n:c.length,ties:c.filter(k=>k.d<=lim).length,id:eid(best.e)};
  return best.e;}
TL.autoPick=autoPick;
/* combo / skill in progress → never auto-switch */
function busy(){const H=window.HERO3D,D=window.__HERO3D;
  if(P.atkCd>0||P.dash||P.casting)return true;if(window.__SK1&&__SK1.state)return true;if(window.__SK2L&&__SK2L.state)return true;
  if(H&&H.anim)return true;if(H&&H.lastEnd!=null&&time-H.lastEnd<((D&&D.comboReset)||.6))return true;return false;}
TL.busy=busy;
function button(){if(TL.e){TL.clear('ปุ่มยกเลิก');return;}const e=autoPick(CF.lockRange);if(e)set(e,'click','ปุ่มล็อก (ใกล้สุด)');else note('ไม่มีมอนในระยะล็อก');}
TL.button=button;
/* the basic swing's real reach (edge distance), the same modifiers the game applies inside basicAttack: weapon range (p203 halves the
   sword), a styled weapon's base range / shot (×U2), the rng bonus — inSector() hits when centre distance ≤ range + monster size */
function reachNow(){let r=0;try{const W_=WEAPONS[P.weapon&&P.weapon.t]||{};r=W_.range||60;
  const w=typeof wCur==='function'&&wCur(),D=w&&typeof wDef==='function'&&wDef(w),bs=D&&D.base;const u2=typeof U2==='number'?U2:2;
  if(bs&&bs.shot)r=bs.shot*u2;else if(bs&&bs.range)r+=bs.range*u2;
  try{if(typeof B==='function')r+=B('rng')||0;}catch(e){}}catch(e){TL.err='reach '+e.message;}return r;}
TL.reachNow=reachNow;
/* ---------- aiming: while a basic attack uses the lock, aimPoint answers with the locked target (start direction kept) ---------- */
{const o=aimPoint;aimPoint=function(range){
  try{if(TL.use&&TL.swing&&!(G.auto&&G.autoT&&!G.autoT.dead)){const s=TL.swing,e=s.e;
      const d=alive(e)?dist(P.x,P.y,e.x,e.y):s.d;let L=d;if(range&&L>range)L=range;
      return {x:P.x+Math.cos(s.ang)*L,y:P.y+Math.sin(s.ang)*L};}}catch(err){TL.err='aim '+err.message;}
  return o.apply(this,arguments);};}
/* ---------- basic attack (outermost wrapper) ---------- */
{const o=basicAttack;basicAttack=function(){
  if(!TL.on||!playing()||P.dead)return o.apply(this,arguments);
  if(G.auto&&G.autoT&&!G.autoT.dead)return o.apply(this,arguments);                 // autoplay keeps its own target
  const H=window.HERO3D;
  if(H&&H.firing){TL.use=1;try{return o.apply(this,arguments);}finally{TL.use=0;}}   // the delayed hit of a swing that already started
  if(P.atkCd>0||P.dash||P.casting)return o.apply(this,arguments);                   // no new swing can start now → game decides
  try{if(typeof stunned==='function'&&stunned())return o.apply(this,arguments);}catch(e){}
  const reach=reachNow();
  check();
  const bz=busy();if(!bz)TL.comboTgt=null;
  let e=TL.e;
  if(e&&TL.src==='auto'&&!bz&&(edge(e)>reach||!losTo(e))){const n=autoPick(reach);if(n&&n!==e){set(n,'auto','เลือกอัตโนมัติใหม่ (จบคอมโบ)');e=n;}}
  if(!e&&!(bz&&TL.comboTgt)){const n=autoPick(reach);if(n){set(n,'auto','เลือกอัตโนมัติ');e=n;}}   // target lost mid-combo → no auto-switch until the combo is over
  if(e){
    // r2 (user 14:52): a locked target flung out of reach (or behind a wall) must NOT freeze the attack: keep the lock, but swing at another monster in reach, or at the game's own aim
    if(edge(e)>reach||!losTo(e)){if(edge(e)>reach)TL.stats.far++;else TL.stats.wall++;
      const n=(TL.src==='auto'&&!(bz&&TL.comboTgt))?autoPick(reach):null;   // r3 (user 16:18): a CLICKED lock is never changed by the system; an AUTO lock may re-pick before the next attack, never mid-combo
      if(n&&n!==e){set(n,'auto','เป้าเดิมไกล/มีสิ่งกีดขวาง → เลือกอัตโนมัติ');e=n;}
      else{TL.stats.freeSwing=(TL.stats.freeSwing||0)+1;TL.swing=null;return o.apply(this,arguments);}}
    const ang=Math.atan2(e.y-P.y,e.x-P.x),cd0=P.atkCd;P.face=ang;
    TL.swing={e,id:eid(e),ang,d:dist(P.x,P.y,e.x,e.y),t:+time.toFixed(3)};TL.use=1;let r;
    try{r=o.apply(this,arguments);}finally{TL.use=0;}
    if(P.atkCd>cd0){TL.comboTgt=TL.swing.id;TL.swing.anim=H&&H.anim||null;TL.swings=(TL.swings||0)+1;TL.lastSwing={id:TL.swing.id,t:TL.swing.t,ang:+ang.toFixed(3)};}
    return r;}
  TL.swing=null;return o.apply(this,arguments);                                    // nothing to hit → the game's own aim (cursor / facing)
};}
/* ---------- input: click / tap on the game canvas only (capture phase, before the game's own pointerdown) ---------- */
const touchOnCv=new Set();
addEventListener('pointerdown',ev=>{try{
  if(ev.pointerType==='touch'&&ev.target===cv)touchOnCv.add(ev.pointerId);
  if(!TL.on||ev.target!==cv||!playing()||G.assign)return;
  if(ev.pointerType!=='touch'&&ev.button!==0)return;
  if(ev.pointerType==='touch'&&touchOnCv.size>1){TL.stats.skipPinch++;return;}     // second finger = pinch / twist, never a selection
  const m=pickAt(mwx(ev.clientX,ev.clientY),mwy(ev.clientX,ev.clientY));if(!m)return;
  ev.stopImmediatePropagation();ev.preventDefault();TL.stats.consumed++;
  tap(m);TL.lastTap={type:ev.pointerType,id:eid(m),t:+time.toFixed(2)};
}catch(err){TL.err='tap '+err.message;}},true);
const tup=ev=>{touchOnCv.delete(ev.pointerId);};addEventListener('pointerup',tup,true);addEventListener('pointercancel',tup,true);
/* ---------- per frame / map change ---------- */
{const o=update;update=function(dt){try{if(typeof G!=='undefined'&&G.state==='play')check();}catch(e){TL.err='check '+e.message;}
  const r=o.apply(this,arguments);
  try{const H=window.HERO3D,s=TL.swing;if(s&&s.anim&&H&&H.anim===s.anim&&P&&!P.dead)P.face=s.ang;}catch(e){}   // the swing keeps facing its start direction (no cursor / no turn mid-swing)
  return r;};}
if(typeof loadZone==='function'){const o=loadZone;loadZone=function(){TL.clear('เปลี่ยนแมพ');return o.apply(this,arguments);};}
/* ---------- ring under the target's feet (ground pass, under the bodies) ---------- */
if(typeof drawBeacons==='function'){const o=drawBeacons;drawBeacons=function(){const r=o.apply(this,arguments);
  try{if(TL.e&&alive(TL.e)&&!(typeof ED!=='undefined'&&ED.on)){const e=TL.e,R=(e.sz||16)+9,auto=TL.src==='auto';
    ctx.save();ctx.lineWidth=2.5;ctx.strokeStyle=auto?'rgba(255,176,60,.95)':'rgba(255,70,70,.95)';ctx.beginPath();ctx.ellipse(e.x,e.y+2,R,R*.55,0,0,6.283);ctx.stroke();
    ctx.lineWidth=1.2;ctx.strokeStyle='rgba(255,226,200,.85)';
    for(const k of [0,3.14]){ctx.beginPath();ctx.ellipse(e.x,e.y+2,R+5,(R+5)*.55,0,time*2+k,time*2+k+1.2);ctx.stroke();}
    ctx.restore();}}catch(err){TL.err='ring '+err.message;}return r;};}
/* ---------- HUD: target chip (name · Lv · HP) + ✕ release ---------- */
let chip=null;
function mkChip(){if(chip||!document.body)return;chip=document.createElement('div');chip.id='tlockChip';
  chip.style.cssText='position:fixed;left:50%;top:max(8px,env(safe-area-inset-top));transform:translateX(-50%);z-index:58;display:none;align-items:center;gap:8px;'
    +'padding:4px 6px 4px 10px;border-radius:12px;background:rgba(8,14,32,.82);border:1px solid rgba(255,120,100,.55);color:#f2f5ff;font:12px/1.3 sans-serif;'
    +'pointer-events:auto;max-width:calc(100vw - 24px);white-space:nowrap';
  chip.innerHTML='<span id="tlkSrc" style="font-weight:700"></span><span id="tlkName" style="overflow:hidden;text-overflow:ellipsis;max-width:42vw"></span>'
    +'<span style="display:inline-block;width:64px;height:6px;border-radius:3px;background:#2a1a24;overflow:hidden"><i id="tlkHp" style="display:block;height:100%;width:100%;background:linear-gradient(90deg,#ff5d7a,#ffb3c4)"></i></span>'
    +'<span id="tlkPct" style="min-width:30px;text-align:right"></span>'
    +'<button id="tlkX" type="button" aria-label="ยกเลิกล็อกเป้า" style="min-width:34px;min-height:30px;border-radius:9px;border:1px solid #6a7aa0;background:#1a2440;color:#fff;font:700 14px sans-serif">✕</button>';
  document.body.appendChild(chip);
  for(const ev of ['pointerdown','pointerup','mousedown','touchstart','click'])chip.addEventListener(ev,e=>e.stopPropagation());   // never reaches the game
  chip.querySelector('#tlkX').addEventListener('click',()=>TL.clear('ปุ่ม ✕'));}
function hud(){try{mkChip();if(!chip)return;const e=TL.e;const show=!!(e&&alive(e)&&typeof G!=='undefined'&&G.state==='play'&&!(typeof ED!=='undefined'&&ED.on));
  chip.style.display=show?'flex':'none';if(!show)return;
  chip.style.borderColor=TL.src==='auto'?'rgba(255,176,60,.7)':'rgba(255,90,90,.75)';
  chip.querySelector('#tlkSrc').textContent=TL.src==='auto'?'🎯 อัตโนมัติ':'🎯 ล็อก';chip.querySelector('#tlkSrc').style.color=TL.src==='auto'?'#ffc46a':'#ff8a8a';
  chip.querySelector('#tlkName').textContent=((e.m&&(e.m.th||e.m.n))||e.type||'มอน')+' Lv '+(e.L||'?');
  const p=Math.max(0,Math.min(1,e.hp/(e.maxHp||e.hp||1)));chip.querySelector('#tlkHp').style.width=(p*100).toFixed(0)+'%';chip.querySelector('#tlkPct').textContent=Math.ceil(p*100)+'%';}catch(err){TL.err='hud '+err.message;}}
TL.hud=hud;setInterval(hud,150);
})();

