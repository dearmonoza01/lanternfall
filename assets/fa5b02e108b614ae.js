
/* ---- r177 home sit / lie (TEST ONLY): sit on woodenChair, lie on simpleBed at home (yard platform + cottage room). Cosmetic only: no heal, no time skip, no buff.
   Poses: Motion rest_defs.js r2 (REST.SIT / SITF / LIE, restApply, drawAtHip, breathing loops, timings) ported as is. Points: Art decor_r1e3.json (seat_point_1x, back_in_front, lie_point_1x, front_poly_1x) + the OV table below (corrections measured in game).
   F near the furniture (or tap on it) = sit / lie, move input or F = get up, not in build mode. Beds heading straight into / out of the screen (n, s) are blocked (Thai hint).
   Flag ?sit=off = nothing. Debug: window.__SIT ---- */
(function(){'use strict';
const Q=String(location.search);
const ST=window.__SIT={ver:'sitlie-r177',on:!/[?&]sit=off\b/.test(Q),err:null,R:null,stats:{sit:0,lie:0,up:0,blocked:0},cfg:{near:52,tap:340,slide:.22,liftK:.5,backCut:16,slow:1}};
if(!ST.on)return;
const HS=window.HOUSE,PU=window.PUPPET,PX=window.PUPPETX;
if(!HS||!HS.on||!PU||!PX){ST.err='missing house / puppet';return}
const ERR=(w,e)=>{ST.err=w+': '+((e&&e.message)||e);try{console.error('[SIT]',w,e)}catch(_){}};
/* ---------------- Motion rest_defs.js r2 (MD5 d04e1ee11d5a806b7a2214b0d6f38cb6), logic unchanged ---------------- */
const REST={
  SIT:{ leg_near:84, leg_far:80, foot_near:-86, foot_far:-82, torso:-3, head:1, arm_near:14, forearm_near:16, fist_near:-6, arm_far:12, forearm_far:14, fist_far:-6 },
  SITF:{ leg_near:58, leg_far:54, foot_near:-60, foot_far:-56, torso:-3, head:1, arm_near:12, forearm_near:14, fist_near:-6, arm_far:10, forearm_far:12, fist_far:-6 },
  LIE:{ leg_near:4, leg_far:10, foot_near:-6, foot_far:-14, torso:0, head:6, arm_near:6, forearm_near:12, fist_near:0, arm_far:2, forearm_far:8, fist_far:0 },
  LIE_LIFT:110, LIE_ROOT:90,
  T:{ sitDown:0.25, standUp:0.20, lieDown:0.35, getUp:0.30 }
};
const rE=x=>x<0?0:x>1?1:x*x*(3-2*x);
function sitBreath(t){const b=Math.sin(t*6.2832/3.0);return{torso:0.5*b,head:-0.4*b,arm_near:1.0*b,arm_far:-0.8*b}}
function lieBreath(t){const b=Math.sin(t*6.2832/4.2);return{torso:0.9*b,head:0.6*b,arm_near:1.4*b,forearm_near:-1.2*b}}
function restApply(p,K,k,L){Object.keys(K).forEach(n=>{if(n==='LIE_ROOT'||n==='T')return;p.rot[n]=(p.rot[n]||0)*(1-k)+K[n]*k});if(L)Object.keys(L).forEach(n=>{p.rot[n]=(p.rot[n]||0)+L[n]*k});return p}
function hipPt(p){const W=PU.solve(p),a=W.leg_near,b=W.leg_far,P=PU.P,pa=P.leg_near.pivot,pb=P.leg_far.pivot;
  return[(a[0]*pa[0]+a[2]*pa[1]+a[4]+b[0]*pb[0]+b[2]*pb[1]+b[4])/2,(a[1]*pa[0]+a[3]*pa[1]+a[5]+b[1]*pb[0]+b[3]*pb[1]+b[5])/2]}
function drawAtHip(cx,x,y,SC,face,p){const W=PU.solve(p),hp=hipPt(p),gy=PU.footY(W);p.air=hp[1]-gy;window.drawCombo(cx,x-hp[0]*SC*(face>0?-1:1),y,SC,face,p)}
/* ---------------- Art points (decor_r1e3.json, 1x sprite px, origin = top-left of the sprite) ---------------- */
const CHAIR={s:{seat:[14,26],over:0},e:{seat:[18,27],over:0},n:{seat:[15,31],over:1},w:{seat:[12,27],over:0},se:{seat:[20,26],over:0},sw:{seat:[16,30],over:0},nw:{seat:[21,24],over:1},ne:{seat:[13,24],over:1}};
const BED={
 s:{lie:[25,33],head:[25,20],front:[[4,55],[45,55],[45,75],[4,75]]},
 e:{lie:[40,30],head:[14,26],front:[[1,49],[76,46],[76,59],[1,59]]},
 n:{lie:[24,23],head:[24,40],front:[[2,30],[45,30],[45,69],[2,69]]},
 w:{lie:[29,28],head:[62,25],front:[[2,49],[76,46],[76,59],[2,59]]},
 se:{lie:[34,36],head:[24,25],front:[[67.2,53],[30,56],[27.5,80.5],[64.5,75]]},
 sw:{lie:[34,36],head:[45,23],front:[[1.3,53],[38.5,56],[41,80.5],[4,75]]},
 nw:{lie:[31,25],head:[43,33],front:[[31,32],[64,25],[68,56],[34,66]]},
 ne:{lie:[39.5,25],head:[27,33],front:[[39.5,32],[6.5,25],[2.5,56],[36.5,66]]}};
/* chair facing -> pose / hero face; bed facing -> body tilt (deg, demo sign convention: SE -, SW +, NE +, NW -) */
const CHF={e:{p:'SIT',f:1},w:{p:'SIT',f:-1},se:{p:'SIT',f:1},sw:{p:'SIT',f:-1},ne:{p:'SIT',f:1},nw:{p:'SIT',f:-1},s:{p:'SITF',f:0},n:{p:'SITF',f:0}};
/* beds: s / n (head straight into / out of the screen) are blocked. Hero face + body tilt come from the Art points: head left of the lie point = hero faces right; tilt = damp * elevation of (lie -> head) on screen */
const BDF={e:{ok:1},w:{ok:1},se:{ok:1},sw:{ok:1},ne:{ok:1},nw:{ok:1},s:{ok:0},n:{ok:0}};
const TILT_DAMP=0.5;/* the puppet is rotated on screen by half the projected bed axis, like Motion's +-24 deg demo */
/* corrections found in game (overrides on top of the Art points): chair seat {dx,dy} in sprite px, bed {lie:[dx,dy], ang:deg} (filled in after the in-game check) */
const OV={chair:{},bed:{e:{lie:[7,6]},w:{lie:[-7,6]},se:{lie:[5,9]},sw:{lie:[-5,9]},ne:{lie:[4,3]},nw:{lie:[-4,3]}}};
ST.OV=OV;ST.CHAIR=CHAIR;ST.BED=BED;
/* ---------------- helpers ---------------- */
const stNow=()=>(HS.roomOn&&HS.roomView)?HS.roomView():HS.state();
const scale=()=>PX.cfg.TARGET_H*PX.cfg.H_FACTOR/PX.refH;
const now=()=>performance.now()/1000/(ST.cfg.slow||1);/* ST.cfg.slow = test knob (frame sequences), 1 in play */
let toastEl=null,toastT=0;
const say=(m,bad)=>{ST.msg=m;try{document.querySelectorAll('#sitToast').forEach(e=>{if(e!==toastEl)e.remove()});if(!toastEl||!toastEl.isConnected){toastEl=document.createElement('div');toastEl.id='sitToast';toastEl.style.cssText='position:fixed;left:50%;top:16%;transform:translateX(-50%);z-index:100001;max-width:92vw;padding:9px 16px;border-radius:12px;background:rgba(20,14,8,.94);border:1px solid #ffd98a;color:#ffe9b0;font:700 14px/1.4 "Noto Sans Thai",system-ui,sans-serif;text-align:center;box-shadow:0 6px 24px rgba(0,0,0,.6);pointer-events:none;display:none';document.body.appendChild(toastEl)}
  toastEl.textContent=m;toastEl.style.borderColor=bad?'#ff8a8a':'#b8ffd0';toastEl.style.display='block';clearTimeout(toastT);toastT=setTimeout(()=>{toastEl.style.display='none'},3000)}catch(_){}};
function infoOf(o){const d=HS.items[o.id];if(!d||!d.fkeys)return null;const key=d.fkeys[o.f|0],F=(d.fac&&d.fac[o.f|0])||d;return{d,key,ox:o.x-F.ax,oy:o.y-F.ay,F}}
function sitObj(){const L=[];try{for(const o of stNow().placed||[]){if(o.id==='woodenChair'||o.id==='simpleBed')L.push(o)}}catch(_){}return L}
function nearestObj(maxD){if(G.zone!==HS.ZID||G.state!=='play'||!P||P.dead||HS.busy||(HS.build&&HS.build.on)||G.win||G.interact)return null;
  let best=null,bd=1e9;const fx=P.x,fy=P.y+PX.cfg.FOOT_DY;
  for(const o of sitObj()){const d=HS.items[o.id];if(!d)continue;const Q2=HS.build.poly(d,o.x,o.y,o.f);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of Q2){x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1])}
    const dx=Math.max(x0-fx,0,fx-x1),dy=Math.max(y0-fy,0,fy-y1),dd=Math.hypot(dx,dy*1.4);if(dd<bd){bd=dd;best=o}}
  return best&&bd<(maxD||ST.cfg.near)?best:null}
/* ---------------- state machine ---------------- */
let R=null;
function targets(o){const I=infoOf(o);if(!I)return null;const k=I.key;
  if(o.id==='woodenChair'){const A=CHAIR[k],cf=CHF[k];if(!A||!cf)return null;const ov=OV.chair[k]||[0,0];return{kind:'sit',I,key:k,seat:[I.ox+A.seat[0]+ov[0],I.oy+A.seat[1]+ov[1]],over:A.over,pose:cf.p,face:cf.f}}
  const A=BED[k],bf=BDF[k];if(!A||!bf)return null;if(!bf.ok)return{kind:'lie',I,key:k,blocked:1};const ov=OV.bed[k]||{},lp=ov.lie||[0,0];
  const lie=[I.ox+A.lie[0]+lp[0],I.oy+A.lie[1]+lp[1]],dx=A.head[0]-A.lie[0],dy=A.head[1]-A.lie[1];
  const elev=ov.elev!=null?ov.elev:TILT_DAMP*Math.atan2(-dy,Math.abs(dx))*180/Math.PI;
  return{kind:'lie',I,key:k,lie,seat:lie,front:A.front.map(p=>[I.ox+p[0],I.oy+p[1]]),face:dx<0?1:-1,elev}}
function start(o){try{if(R||G.zone!==HS.ZID)return false;const T=targets(o);if(!T)return false;
  if(T.blocked){ST.stats.blocked++;say('เตียงหันตรงหน้า/หลังจอ นอนไม่ได้ ลองหมุนเตียงก่อน',true);return false}
  const sc=scale(),fy=P.y+PX.cfg.FOOT_DY;let face=T.face;if(!face)face=(P.x>T.seat[0])?-1:1;
  /* measured seat height: footY - hipY of the posed rig (rig units) -> the floor point under the hip */
  const p0=PU.pose('idle',0,{});p0.lunge=0;restApply(p0,T.kind==='sit'?REST[T.pose]:REST.SIT,1);const W0=PU.solve(p0),hs=(PU.footY(W0)-hipPt(p0)[1]);
  R={uid:o.uid,id:o.id,kind:T.kind,T,face,sc,hsit:hs,P0:{x:P.x,y:P.y,fy:fy},ph:'in',t0:now(),k:0,room:!!HS.roomOn,sig:[o.x,o.y,o.f|0].join(),floor:[T.seat[0],T.seat[1]+hs*sc]};
  PX.hideP=true;ST.R=R;if(T.kind==='sit')ST.stats.sit++;else ST.stats.lie++;return true}catch(e){ERR('start',e);R=null;PX.hideP=false;return false}}
function endNow(why,noRestore){if(!R)return;try{if(!noRestore){P.x=R.P0.x;P.y=R.P0.y}}catch(_){}R=null;ST.R=null;PX.hideP=false;window.__REST_SLEEP=false;ST.last=why||'end'}
function getUp(){if(!R)return;if(R.ph==='hold'){R.ph='up';R.t0=now();ST.stats.up++}else if(R.ph==='in'||R.ph==='down')R.want=1}
function tickRest(){if(!R)return;
  if(G.zone!==HS.ZID||!!HS.roomOn!==R.room){endNow('left the yard / room',true);return}
  const o=sitObj().find(q=>q.uid===R.uid);
  if(!o||[o.x,o.y,o.f|0].join()!==R.sig||G.zone!==HS.ZID||(HS.build&&HS.build.on)||P.dead||HS.busy){endNow('furniture changed / left');return}
  const t=now(),el=t-R.t0,sl=ST.cfg.slide,T=REST.T,dn=R.kind==='sit'?T.sitDown:T.lieDown,up=R.kind==='sit'?T.standUp:T.getUp;
  if(R.ph==='in'&&el>=sl){R.ph='down';R.t0=t}
  else if(R.ph==='down'&&el>=dn){R.ph='hold';R.t0=t;if(R.want){R.want=0;getUp()}}
  else if(R.ph==='up'&&el>=up){R.ph='slideOut';R.t0=t}
  else if(R.ph==='slideOut'&&el>=sl){endNow('up');return}
  window.__REST_SLEEP=(R.kind==='lie'&&R.ph==='hold'&&now()-R.t0>.1);}
/* pose + anchor for the current frame -> draws the hero */
function drawHero(c){const sc=R.sc,t=now(),el=t-R.t0,T=REST.T,dn=R.kind==='sit'?T.sitDown:T.lieDown,up=R.kind==='sit'?T.standUp:T.getUp,sl=ST.cfg.slide,face=R.face,s=face>0?-1:1;
  const sw=PU.cfg.showSword;PU.cfg.showSword=false;
  try{
    if(R.ph==='in'||R.ph==='slideOut'){/* walk (slide) between the spot where F was pressed and the floor point under the seat */
      let u=rE(Math.min(1,el/sl));if(R.ph==='slideOut')u=1-u;
      const x=R.P0.x+(R.floor[0]-R.P0.x)*u,y=R.P0.fy+(R.floor[1]-R.P0.fy)*u;
      const p=PU.pose('walk',t*1.1,{});p.air=0;window.drawCombo(c,x,y,sc,face,p);return}
    const p=PU.pose('idle',t,{});p.lunge=0;
    let k=1;if(R.ph==='down')k=el/dn;else if(R.ph==='up')k=1-el/up;
    const k1=R.kind==='sit'?(R.ph==='hold'?1:rE(k)):rE(Math.min(1,k/.45)),k2=R.kind==='sit'?0:rE(Math.max(0,(k-.45)/.55));
    /* standing hip over the floor point (same pose family as the slide end) */
    const hr=PU.footY(PU.solve(p))-hipPt(p)[1],stand=[R.floor[0],R.floor[1]-hr*sc];
    if(R.kind==='sit'){const K=REST[R.T.pose];restApply(p,K,k1,k1>0?sitBreath(t):null);
      const hx=stand[0]+(R.T.seat[0]-stand[0])*k1,hy=stand[1]+(R.T.seat[1]-stand[1])*k1;drawAtHip(c,hx,hy,sc,face,p)}
    else{if(k1>0)restApply(p,REST.SIT,k1,null);if(k2>0)restApply(p,REST.LIE,k2,(R.ph==='hold')?lieBreath(t):null);
      /* the game's PUPPET.draw drops pose.rootRot (a wrapper rebuilds the pose), so the body turn is done on the canvas: upright pose pinned at the hip, canvas rotated about the hip.
         head direction on screen = (-face cos e, -sin e); alpha turns 'up' to it */
      const e=(R.T.elev||0)*Math.PI/180,hdx=-face*Math.cos(e),hdy=-Math.sin(e),alpha=Math.atan2(hdx,-hdy)*k2,lift=REST.LIE_LIFT*ST.cfg.liftK*sc*k2;
      const bx=stand[0]+(R.T.lie[0]-stand[0])*k1,by=stand[1]+(R.T.lie[1]-stand[1])*k1,hx=bx+lift*face*Math.cos(alpha),hy=by+lift*face*Math.sin(alpha);
      c.save();c.translate(hx,hy);c.rotate(alpha);c.translate(-hx,-hy);try{drawAtHip(c,hx,hy,sc,face,p)}finally{c.restore()}}
  }finally{PU.cfg.showSword=sw}}
function overlay(c,p){/* parts of the furniture that draw OVER the hero */
  try{const T=R.T,o=sitObj().find(q=>q.uid===R.uid);if(!o)return;const B=HS.build,spr=B.sprite(o.id,o.f|0);if(!spr||spr._tmp)return;
    if(R.kind==='sit'){if(T.over&&R.ph!=='in'&&R.ph!=='slideOut'){/* chair back over the hero, but only below shoulder / chin height so the face stays clear */c.save();c.beginPath();c.rect(T.I.ox-4,T.seat[1]-ST.cfg.backCut,T.I.F.sw+8,300);c.clip();c.drawImage(spr,Math.round(T.I.ox),Math.round(T.I.oy));c.restore()}return}
    if(R.ph==='in'||R.ph==='slideOut')return;
    c.save();c.beginPath();T.front.forEach((q,i)=>{if(i)c.lineTo(q[0],q[1]);else c.moveTo(q[0],q[1])});c.closePath();c.clip();c.drawImage(spr,Math.round(T.I.ox),Math.round(T.I.oy));c.restore()}catch(e){ERR('overlay',e)}}
function dbgDraw(c){const T=R.T;c.save();const dot=(p,col,r)=>{c.fillStyle=col;c.beginPath();c.arc(p[0],p[1],r||1.6,0,6.2832);c.fill()};
  if(R.kind==='sit'){dot(T.seat,'#f0f',2);dot(R.floor,'#0ff',1.6)}else{dot(T.lie,'#f0f',2);dot(R.floor,'#0ff',1.6);const A=BED[T.key];dot([T.I.ox+A.head[0],T.I.oy+A.head[1]],'#0f0',2);c.strokeStyle='#f00';c.lineWidth=.8;c.beginPath();T.front.forEach((q,i)=>{if(i)c.lineTo(q[0],q[1]);else c.moveTo(q[0],q[1])});c.closePath();c.stroke()}c.restore()}
function hookDef(){try{const D=(typeof PROP_DEFS!=='undefined')&&PROP_DEFS.housedeco;if(!D)return false;if(D._sit===ST)return true;const o=D._sitOrig||D.live;D._sitOrig=o;D._sit=ST;
  D.live=function(c,p){const r=o.apply(this,arguments);try{if(window.__SIT===ST&&R&&p&&p.uid===R.uid&&!p.ghost){drawHero(c);overlay(c,p);if(ST.dbg)dbgDraw(c)}}catch(e){ERR('live',e)}return r};return true}catch(e){ERR('hook',e);return false}}
/* ---------------- UI: prompt, key, tap ---------------- */
const css=document.createElement('style');css.textContent='#sitPrompt{position:fixed;left:50%;bottom:calc(290px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:7;display:none;padding:8px 18px;border-radius:999px;background:rgba(20,15,8,.9);border:1px solid #ffd98a;color:#fff;font-size:13px;cursor:pointer;box-shadow:0 0 18px rgba(255,210,120,.4);white-space:nowrap}#sitPrompt kbd{display:inline-block;min-width:20px;padding:0 6px;margin-right:6px;border-radius:6px;background:#ffd98a;color:#3a2200;font-weight:700;text-align:center}@media (max-height:520px){#sitPrompt{bottom:calc(150px + env(safe-area-inset-bottom,0px))}}';document.head.appendChild(css);
document.querySelectorAll('#sitPrompt').forEach(e=>e.remove());/* (dev re-injection only) */const pr=document.createElement('div');pr.id='sitPrompt';document.body.appendChild(pr);
for(const ev of['pointerdown','mousedown','touchstart','pointerup','mouseup','touchend'])pr.addEventListener(ev,e=>e.stopPropagation());
function promptText(){if(R)return R.kind==='sit'?'ลุก':'ลุกจากเตียง';const o=nearestObj();if(!o)return null;return o.id==='woodenChair'?'นั่ง':'นอน'}
function act(){if(R){getUp();return true}const o=nearestObj();if(o)return start(o);return false}
{const kh=e=>{try{if(window.__SIT!==ST)return false;if((e.key==='f'||e.key==='F')&&!e.repeat){if(R){getUp();e.stopImmediatePropagation();e.preventDefault();return true}
   if(!R&&!document.getElementById('hpMenu')?.classList.contains('in')){const o=nearestObj();if(o){start(o);e.stopImmediatePropagation();e.preventDefault();return true}}}}catch(er){ERR('key',er)}return false};
 if(window.__EK)window.__EK.unshift(kh);else addEventListener('keydown',e=>{kh(e)},true)}
pr.addEventListener('click',e=>{e.stopPropagation();act()});
document.addEventListener('pointerdown',e=>{try{if(window.__SIT!==ST||G.state!=='play'||G.zone!==HS.ZID||HS.build.on||G.win)return;const t=e.target;if(t.closest&&t.closest('#hpMenu,#hpConfirm,#hpPrompt,#sitPrompt,#hBox,#hAct,#hBuildBtn,#houseDown,#houseGm,.mbtn,#bar,#tSkills,#swin,#hStore,#ftOv,#fsBar,#mm2'))return;
  const[wx,wy]=s2w(e.clientX,e.clientY),o=HS.build.itemAt(wx,wy);
  if(R&&o&&o.uid===R.uid){e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();getUp();return}
  if(!R&&o&&(o.id==='woodenChair'||o.id==='simpleBed')){e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();
    if(Math.hypot(o.x-P.x,o.y-P.y)<ST.cfg.tap)start(o);else say('เดินเข้าไปใกล้ก่อน',true)}}catch(er){ERR('tap',er)}},true);
ST.api={start,getUp,nearestObj,targets,end:endNow,act,drawHero};
/* ---------------- loop ---------------- */
{const _u=update;update=function(dt){
  if(window.__SIT!==ST)return _u.apply(this,arguments);
  let x0=0,y0=0;const rs=!!R;if(rs){x0=P.x;y0=P.y}
  const r=_u.apply(this,arguments);
  ST.ticks=(ST.ticks||0)+1;try{hookDef();
   if(rs&&R){/* the hero does not walk while resting: any displacement or a held move key = get up */
     const moved=Math.abs(P.x-x0)+Math.abs(P.y-y0)>.4;P.x=x0;P.y=y0;let key=false;try{for(const k of['w','a','s','d','W','A','S','D','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'])if(keys[k])key=true}catch(_){}
     if(moved||key)getUp()}
   tickRest();
   const txt=promptText(),v=txt?'block':'none';if(txt&&pr.dataset.t!==txt){pr.dataset.t=txt;pr.innerHTML='<kbd>F</kbd>'+txt}if(pr.style.display!==v)pr.style.display=v}catch(e){ERR('tick',e)}
  return r}}
})();

