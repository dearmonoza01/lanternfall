
/* ---- candidate_bow_r5: p253 r3 click-lock = automatic basic attack + walk into reach at normal walk speed, no drifting away, every weapon (TEST only) ---- */
/* p253 r3 — click / tap a monster = lock it AND keep basic-attacking it automatically, for every weapon (user 15 Oct 2026 18:05).
   r2 (user 18:30): a clicked target out of reach → the hero walks into attack reach by itself, then attacks.
   r3 (user 18:57): (1) the walk-in now goes through the game's OWN walking input (the same path as a touch-walk), so its speed,
       acceleration and wall sliding are exactly normal walking — r2 moved the hero a second time on top of the game's momentum (≈1.5× speed).
       (2) the hero no longer drifts away from the target: it walks in a bit deeper than the edge of reach (sword 60 → stops at 36),
       the sword's root-motion steps are aimed at the locked target (not at the cursor), and while a click-locked swing plays a
       backward root-motion step is not allowed to carry the hero away from the target (side steps stay).
   Uses the central lock (p225, TLOCK) and the game's own basicAttack chain (so sword combo, bow shot, damage, ASPD … are unchanged).
   Rules:
     • only a CLICK lock auto-attacks (an auto-picked lock still needs the attack button, as before).
     • attacks start only when the target is inside the equipped weapon's reach with a clear line (TLOCK.reachNow / losTo);
       out of reach / behind a wall → walk straight toward it at the hero's normal speed (slides along walls; if stuck, a note),
       stop as soon as it is in reach, then attack. No swinging at air.
     • moving (keys / joystick) pauses the auto attack; it resumes when the hero stops. Skills / dash / editor / autoplay are left alone.
     • ends when the lock ends (target dies / ✕ / same monster tapped again / out of lock range / map change).
   Debug: window.LOCKATK. */
(function(){
'use strict';
const LA=window.LOCKATK={ver:'p253-r3',on:true,err:null,stats:{calls:0,far:0,dir:0,moving:0,chase:0,stuck:0,backHeld:0,backPx:0,aimFix:0},last:null,chase:false,eng:null};
const TL=window.TLOCK;if(!TL||typeof basicAttack!=='function'||typeof update!=='function'||typeof updPlayer!=='function'){LA.err='hooks missing';return;}
const clk=()=>typeof time==='number'?time:performance.now()/1000;
let lastNote=-9;
function note(m){const t=clk();if(t-lastNote<1.4)return;lastNote=t;try{textAt(P.x,P.y-70,m,'#ffcf9a',13,{life:1,vy:-30});}catch(e){}}
let fake=null;   // the walk-in input while it is fed to the game (never seen outside updPlayer)
function moving(){try{if(typeof keys!=='undefined'&&(keys.w||keys.a||keys.s||keys.d||keys.arrowup||keys.arrowdown||keys.arrowleft||keys.arrowright))return true;
  if(typeof G!=='undefined'&&((G.joy&&G.joy.m>0)||(G.touch&&G.touch.move&&G.touch!==fake)))return true;}catch(e){}return false;}
function swinging(){const H=window.HERO3D;if(!H||!H.anim||!H.segLen)return false;const A=H.anim;return clk()<A.t0+H.segLen(A.k)/A.f;}
function busy(){const H=window.HERO3D,BW=window.BOW;
  if(P.atkCd>0||P.dash||P.casting||P.dead)return true;
  if(H&&H.anim&&H.segLen){const A=H.anim,D=window.__HERO3D||{};if(clk()<A.t0+(H.segLen(A.k)-(D.comboChain||0))/A.f)return true;}   // the sword swing still playing (same gate as HERO3D)
  if(BW&&BW.st)return true;
  if(window.__SK1&&__SK1.state)return true;if(window.__SK2L&&__SK2L.state)return true;
  try{if(typeof stunned==='function'&&stunned())return true;}catch(e){}
  return false;}
const clickLock=()=>{const e=TL.e;return LA.on&&e&&TL.src==='click'&&TL.alive(e)&&typeof G!=='undefined'&&G.state==='play'&&!G.edit&&!(G.auto&&G.autoT&&!G.autoT.dead)&&P&&!P.dead&&P.weapon&&P.weapon.t!=='fist'?e:null;};
/* r3: where to stop — a bit inside the reach so the first swing really lands (sword 60 → 36, bow 340 → 316) */
const stopEdge=reach=>reach-Math.max(8,Math.min(24,reach*.4));
let stuckT=0,lastPos=null;
function tick(){
  const e=clickLock();if(!e){LA.chase=false;LA.eng=null;return;}
  if(typeof ED!=='undefined'&&ED.on)return;
  if(LA.eng&&LA.eng!==TL.id)LA.eng=null;
  if(moving()){LA.stats.moving++;LA.chase=false;return;}
  if(busy())return;
  const reach=TL.reachNow(),ed=TL.edge(e),los=TL.losTo(e);
  const inStop=ed<=stopEdge(reach)+2,stuckIn=ed<=reach&&stuckT>.3;
  if(!los||!(inStop||stuckIn)){LA.stats.far++;LA.chase=true;return;}   // walk in (fed to updPlayer below)
  LA.chase=false;
  const BW=window.BOW;
  if(P.weapon.t==='bow'&&BW&&BW.bowNow&&BW.bowNow()){            // bow TEST art is E only
    let a=Math.atan2(e.y-P.y,e.x-P.x);try{a+=typeof camY==='function'?camY():0;}catch(_){}
    if(Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))>=Math.PI/8){LA.stats.dir++;note('ธนู (TEST): ยิงได้เฉพาะทิศ E — ทิศอื่นยังไม่มีภาพ');return;}}
  LA.stats.calls++;LA.eng=TL.id;LA.last={t:+clk().toFixed(2),id:TL.id,w:P.weapon.t,edge:Math.round(ed)};
  try{basicAttack();}catch(err){LA.err='attack '+err.message;}
}
/* r3 (1): the walk-in is the game's own touch-walk input → same speed formula, momentum, wall collision, facing */
try{const o1=mwx,o2=mwy;mwx=function(sx,sy){return fake&&G.touch===fake?fake.wx:o1.apply(this,arguments);};mwy=function(sx,sy){return fake&&G.touch===fake?fake.wy:o2.apply(this,arguments);};}catch(err){LA.err='mw '+err.message;}
/* r3 (2): sword root-motion aimed at the locked target while a click-locked swing plays */
try{const o=aimPoint;aimPoint=function(range){
  try{const e=clickLock();if(e&&!TL.use&&LA.eng===TL.id&&swinging()){LA.stats.aimFix++;return {x:e.x,y:e.y};}}catch(_){}
  return o.apply(this,arguments);};}catch(err){LA.err='aim '+err.message;}
try{const _up=updPlayer;updPlayer=function(dt){
  let e=null,saved,useFake=false;
  try{e=clickLock();
    if(e&&LA.chase&&!moving()&&!P.dash&&!P.casting&&!swinging()&&!(window.BOW&&BOW.st)){
      useFake=true;saved=G.touch;fake={move:true,x:0,y:0,wx:e.x,wy:e.y,fake:1};G.touch=fake;}
  }catch(err){LA.err='pre '+err.message;}
  const x0=P.x,y0=P.y;let r;
  try{r=_up.apply(this,arguments);}finally{if(useFake){if(G.touch===fake)G.touch=saved;fake=null;}}
  try{
    if(useFake){LA.stats.chase++;const mv=Math.hypot(P.x-x0,P.y-y0);
      if(mv<.4*Math.max(1,(P.speed||200)*dt*.1)){stuckT+=dt;if(stuckT>.6){LA.stats.stuck++;note('ไปหาเป้าไม่ได้ (มีสิ่งกีดขวาง)');}}else stuckT=0;}
    else if(!LA.chase)stuckT=0;
    // (2) a backward root-motion step during a click-locked swing must not carry the hero away from the target
    if(e&&!useFake&&LA.eng===TL.id&&swinging()&&!P.dash&&TL.alive(e)){
      const dx=e.x-x0,dy=e.y-y0,dl=Math.hypot(dx,dy)||1,ux=dx/dl,uy=dy/dl,out=-((P.x-x0)*ux+(P.y-y0)*uy);   // the hero's OWN move away from the target (monster knock-back is not followed)
      if(out>.05){const nx=P.x+ux*out,ny=P.y+uy*out;if(!blocked(nx,ny,P.r)){P.x=nx;P.y=ny;LA.stats.backHeld++;LA.stats.backPx+=out;}}}
  }catch(err){LA.err='post '+err.message;}
  return r;};}catch(err){LA.err='updPlayer '+err.message;}
{const o=update;update=function(dt){const r=o.apply(this,arguments);try{tick();}catch(err){LA.err='tick '+err.message;}return r;};}
})();

