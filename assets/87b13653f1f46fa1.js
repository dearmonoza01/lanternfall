
/* ---- scycombo-r1 (TEST, 8 Nov 2026): scythe basic attack = DeaRz's 3-hit combo (ORDER_20261108_scythe-basic-combo) ----
   Replaces the sword-pose stand-in of the scythe TEST weapon's basic attack with the approved 70-frame clip (24 fps, 362x362, anchor [181,288]):
   hit 1 = frames 0-17 (impact 7), hit 2 = 18-47 (impact 33), hit 3 = 48-63 (impact 60), settle 64-69. The four layers (body_base, hair_m2, scythe, hand_front)
   were baked in that order into one trimmed frame per (dir, frame) (frames 10-17 use the true-occlusion scythe files as delivered); one near-lossless WebP atlas
   per direction, decoded only for the facing direction and released after the combo.
   LOGIC: a press starts hit 1; a press AFTER the impact frame of a hit queues the next hit (seamless, the blend frames are the first frames of hit 2 / 3);
   after hit 3 the settle plays, then idle; with no queued press after hit 1 / hit 2 the clip ends (short cross-fade to the normal hero) and the combo is back to hit 1.
   A press during the settle (or after the end) starts hit 1 again.
   DAMAGE: on each impact frame (7 / 33 / 60 = 0.292 / 1.375 / 2.5 s of clip time at rate 1) the game's OWN basic attack is called once (same formula, same targets,
   same chain as before; single target + chain are the game's rules) with knockback forced to 0; the old 2D swing arc is removed. Every hit shows its own number.
   ASPD: clip rate = aspd factor / 1.06 (same reference as the atk19 dagger), capped at 3; impact moments are tied to the frame, so they scale with it.
   Night Harvest / Death Moon: starting either cancels the combo (the order says nothing; my choice, reported).
   Flag ?scycombo=old = the old scythe basic attack. Debug: window.__SCYCOMBO. */
(function(){'use strict';
const D=window.__SCYCOMBO_DATA,SCY=window.__SCY;
const C=window.__SCYCOMBO={ver:'scycombo-r1',on:false,err:null,ready:0,log:[],hits:[],stats:{starts:0,strikes:0,queued:0,resets:0,late:0,aborts:0,dirs:{}},st:null};
if(!D||!SCY||typeof drawPlayerSprite!=='function'||typeof basicAttack!=='function'||typeof updPlayer!=='function'){C.err='missing data / hooks';try{console.warn('[scycombo]',C.err);}catch(_){}return;}
C.on=!/[?&]scycombo=old\b/.test(location.search);C.data=D;
const DN=D.dirs,FPS=D.fps,N=D.n,AX=D.anchor[0],AY=D.anchor[1];
const SEG=[{s:0,n:18,hit:7},{s:18,n:30,hit:33},{s:48,n:16,hit:60}],SETTLE0=64;
const REF=1.06,RMAX=3,FADE=.15;
const dirOf=a=>((Math.round(a/(Math.PI/4))%8)+8)%8;
const aspdNow=()=>{let b=0;try{b=B('aspd')||0;}catch(e){}return (P.aspdF||1)*(1+b);};
const rateNow=()=>Math.max(.2,Math.min(RMAX,aspdNow()/REF));
C.rate=rateNow;C.sched={seg:SEG,settle:SETTLE0};
const scyNow=()=>{try{return !!(P&&P.weapon&&P.weapon.t==='scythe');}catch(e){return false;}};
const busy=()=>{try{return !!(SCY.fx||SCY.aim||(SCY.dm&&SCY.dm.fx));}catch(e){return false;}};
/* ---- atlases: one image per direction, decoded on demand, released when the combo is idle ---- */
const IM={};
C.warm=dn=>{if(!D.atlas[dn])return null;if(IM[dn])return IM[dn];const im=new Image();im.decoding='async';im.onload=()=>{im.__ok=1;C.ready++;};im.onerror=()=>{if(IM[dn]===im)C.err='decode '+dn;};im.src=D.atlas[dn].src;IM[dn]=im;return im;};
C.release=keep=>{for(const k in IM){if(k===keep)continue;try{IM[k].onload=IM[k].onerror=null;IM[k].src='';}catch(_){}delete IM[k];}};
C.images=()=>Object.keys(IM);
/* ---- state ---- */
let st=null;                       /* {cf, k, dn, queued, struck[3], phase:'play'|'settle'|'fade', fadeT, zone} */
const clk=()=>(typeof time==='number'?time:performance.now()/1000);
const faceNow=()=>{let fa=(P.face!=null&&isFinite(P.face))?P.face:0;try{const tg=aimPoint();if(tg&&isFinite(tg.x)&&isFinite(tg.y))fa=Math.atan2(tg.y-P.y,tg.x-P.x);}catch(e){}return fa;};
const origAtk=basicAttack;
/* knockback is forced to 0 for the combo's strikes (standing rule: basic attacks do not knock back) */
let STRIKING=false;
try{const oh=hitEnemy;hitEnemy=function(e,m,o){if(STRIKING&&o&&o.kb)o=Object.assign({},o,{kb:0});return oh.call(this,e,m,o);};}catch(e){C.err='hitEnemy hook '+e.message;}
function strike(k){
  const on0=window.HERO3D&&HERO3D.on;let err=null;const nFx=(typeof fx!=='undefined'&&fx)?fx.length:0;
  STRIKING=true;
  try{P.atkCd=0;P.chain=k;P.lastAtk=clk();if(window.HERO3D)HERO3D.on=false;origAtk.call(null);}catch(e){err=e.message;}
  finally{STRIKING=false;if(window.HERO3D)HERO3D.on=on0;P.atkCd=0;try{P.swing=null;}catch(_){}
    try{for(let i=fx.length-1;i>=nFx;i--){const o=fx[i];if(o&&(o.k==='cres'||o.k==='thrust'||o.k==='star'||o.k==='wave'||o.k==='ring'))fx.splice(i,1);}}catch(x){}}
  if(err)C.err='strike '+err;
  C.stats.strikes++;const rec={k:k+1,cf:+(st?st.cf:0).toFixed(2),game:+clk().toFixed(3),clip:st?+(((clk()-st.t0))).toFixed(3):null,wall:+performance.now().toFixed(0)};C.hits.push(rec);if(C.hits.length>60)C.hits.shift();}
function startHit1(){
  const fa=faceNow();P.face=fa;const dn=DN[dirOf(fa)];
  st={cf:0,k:0,dn,queued:false,struck:[false,false,false],phase:'play',fadeT:0,zone:G.zone,t0:clk(),nd:dirOf(fa)};
  C.warm(dn);C.release(dn);C.stats.starts++;C.stats.dirs[dn]=(C.stats.dirs[dn]||0)+1;C.st=st;
}
function endCombo(why){if(!st)return;if(why==='abort')C.stats.aborts++;C.log.push('end '+why+' cf'+st.cf.toFixed(1));if(C.log.length>30)C.log.shift();st=null;C.st=null;}
/* ---- input: the game calls basicAttack on a press / while attack is held ---- */
basicAttack=function(){
  if(!(C.on&&scyNow()&&!busy()))return origAtk.apply(this,arguments);
  try{
    if(P.dead||P.dash||(typeof G!=='undefined'&&G.edit)||P.casting)return;
    if(!st||st.phase==='fade'||st.phase==='settle'){startHit1();return;}   /* idle / fading / settle: (re)start hit 1 */
    if(st.k<2&&!st.queued&&st.cf>=SEG[st.k].hit){st.queued=true;C.stats.queued++;try{C.warm(DN[dirOf(faceNow())]);}catch(_){}}   /* a press after the impact frame queues the next hit */
  }catch(e){C.err='atk '+e.message;}
};
/* ---- stepping (game time, in the player update) ---- */
function step(dt){
  if(!st)return;
  if(!P||P.dead||G.state!=='play'||G.zone!==st.zone||!scyNow()||!C.on){endCombo('abort');return;}
  if(busy()){endCombo('abort');return;}
  dt=Math.min(dt,.05);
  if(st.phase==='fade'){st.fadeT+=dt;if(st.fadeT>=FADE){endCombo('fade');}return;}
  const r=rateNow(),cf0=st.cf;st.cf+=dt*FPS*r;
  /* impact frames */
  for(let k=0;k<3;k++){if(!st.struck[k]&&cf0<SEG[k].hit&&st.cf>=SEG[k].hit&&(k===st.k||k<=st.k)){st.struck[k]=true;st.cf=Math.max(st.cf,SEG[k].hit);strike(k);}}
  if(st.phase==='play'){
    const sg=SEG[st.k],end=sg.s+sg.n;
    if(st.cf>=end){
      if(st.k<2&&st.queued){st.k++;st.queued=false;const fa=faceNow();P.face=fa;const nd=dirOf(fa);if(nd!==st.nd&&IM[DN[nd]]&&IM[DN[nd]].__ok){st.nd=nd;st.dn=DN[nd];C.release(st.dn);}}
      else if(st.k===2){st.phase='settle';}
      else{st.cf=end-.001;st.phase='fade';st.fadeT=0;C.stats.resets++;}
    }
  }
  if(st&&st.phase==='settle'&&st.cf>=N){st.cf=N-.001;st.phase='fade';st.fadeT=0;C.stats.resets++;}
}
try{const _up=updPlayer;updPlayer=function(dt){try{step(dt);}catch(e){C.err='step '+e.message;st=null;}return _up.apply(this,arguments);};}catch(e){C.err='hook updPlayer '+e.message;}
/* ---- drawing: outermost hook on the hero sprite, only while the combo is playing ---- */
const K=()=>{try{return window.__HERO3D.drawScale||.4223;}catch(_){return .4223;}};
const FY=()=>{try{return window.__HERO3D.footY||0;}catch(_){return 0;}};
function drawFrame(x,y,alpha){
  const im=IM[st.dn];if(!im||!im.__ok)return false;
  const f=Math.max(0,Math.min(N-1,Math.floor(st.cf+1e-6))),r=D.atlas[st.dn].rects[f];if(!r)return true;
  const k=K(),yy=y+FY();ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';if(alpha<1)ctx.globalAlpha=alpha;
  ctx.drawImage(im,r[0],r[1],r[2],r[3],x+(r[4]-AX)*k,yy+(r[5]-AY)*k,r[2]*k,r[3]*k);ctx.restore();
  C.frame=f;C.dn=st.dn;C.drawn=(C.drawn||0)+1;return true;}
try{const o=drawPlayerSprite;drawPlayerSprite=function(x,y,bob,fa){
  try{if(C.on&&st){
    if(st.phase==='fade'){const r=o.apply(this,arguments);drawFrame(x,y,Math.max(0,1-st.fadeT/FADE));return r;}
    if(drawFrame(x,y,1))return;else C.stats.late++;}}catch(e){C.err='draw '+e.message;}
  return o.apply(this,arguments);};}catch(e){C.err='hook draw '+e.message;}
/* release the atlases a moment after the combo ended */
setInterval(()=>{try{if(!st&&Object.keys(IM).length&&!C.hold)C.release();}catch(_){}},400);
C.state=()=>st?{phase:st.phase,k:st.k+1,cf:+st.cf.toFixed(2),dn:st.dn,queued:st.queued}:'idle';
C.debug=()=>({on:C.on,ready:C.ready,imgs:C.images(),err:C.err,stats:C.stats,hits:C.hits.slice(-6),state:C.state()});
})();

