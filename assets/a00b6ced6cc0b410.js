
/* ===== dir4-r1 (DeaRz 6 Nov; TEST build only, not the real game) =====
   A. NPC 4-direction sprites (Lysel / Ora / Mali): the single-image sprite is replaced by the sprite of the direction the NPC faces
      (down / up / left / right drawn separately, 627x627 cells, never mirrored). The NPC turns to the player (screen direction),
      hysteresis so it does not flicker, 'down' when the player is far (> 520 px). On-screen height = the old sprite's visible height,
      feet on the old sprite's feet line, same x centre. Collision / talk range / dialogue are not touched. Off: ?npc4=off
   B. Hero walk 4 directions: while the hero walks / runs (clip walk or run, not dashing, not a skill clip) the 8-frame 4-dir sheet is played
      in a loop instead of the 3D walk / run frame; standing idle = frame 1 of the sheet in the last direction (the 3D 'ready' stance after a fight,
      attacks, skills, hurt and death stay 3D). Cell (443x443) is never re-centred per frame; one uniform scale = current hero height.
      The sheets have NO weapon: the sword that is sheathed at the hip in the 3D walk is not drawn while walking. Off: ?walk4=off,
      idle only: ?walk4idle=off. TEMP flag ?walk8swapup=1 (or window.__DIR4.swapUp=true) swaps the two UP diagonal sets (NW draws upright, NE draws upleft). dir8run-r5: RUN UP set = run_up_pack_r4 (default r4; ?runup=a = the r4a set; ?runup=old = the r3 up set of r2-r4). dir8run-r4: breathing IDLE (?idle8=off). dir8run-r3: real run speed (?runspd=<x walk speed> default 1.6, ?runspeed alias, ?runfps default 14, 0.15 s ease; see the RUN speed note). dir8run-r2: all 8 directions have their own run set (down: run_pack_r1; up, downleft, downright, left, right r3, upleft / upright r1gif; ?runul=sheet = the r1sheet versions of upleft / upright; right is NOT the flipped left in run); the faster-walk fallback is kept only for a missing set. dir8run-r1: RUN state (Shift or 0.4 s of continuous movement; ?run=off = off): run sets for down / up, every other facing = walk frames played x1.6 faster. dir8-r3: the UP diagonal sets are Art's redrawn walk8_r2_up_pack frames (down diagonals stay r1). 8 directions (?walk8=off = back to the 4-direction r7 behaviour): the 4 diagonals use Art's walk8_r1 sets (not mirrored in code; baseline y417 down / y416 up, head cell x 221.5, all placed on the same screen baseline as the cardinals); the facing comes from the movement vector in 45 deg sectors. Frames: walk4_r4 for down / up / left; the RIGHT direction = the LEFT r4 sheet mirrored about its head x (213.3) (default, DeaRz 7 Nov), so the head stays on the same screen x and the feet on the same y when turning left <-> right; ?walkright=r6 | r5 = Art's own right sheets, ?walk4src=r4 / r3 / r2 / r1 = the earlier sets (all four directions). Phase: one 0..7 counter, 10 fps at the hero's normal speed (236 px/s), scaled with speed, clamped 6..12 fps, never skips a frame. Only the frame draw is swapped (inside ctx.drawImage), shadows / auras / names stay as they were. Debug: window.__DIR4 */
(function(){'use strict';
const Q=location.search,NPC_ON=!/[?&]npc4=off\b/.test(Q),WALK_ON=!/[?&]walk4=off\b/.test(Q),IDLE_ON=!/[?&]walk4idle=off\b/.test(Q),SELM=/[?&]walk4src=(r1|r2|r3|r4)\b/.exec(Q),SEL=SELM?SELM[1]:'r5',WSM=/[?&]walkspd=(slow|normal)\b/.exec(Q),WS=WSM?WSM[1]:'slow',WK=WS==='slow'?0.55:1,WRM=/[?&]walkright=(r5|r6|leftflip)\b/.exec(Q),WR=WRM?WRM[1]:'leftflip',LF=WR==='leftflip',W8=!/[?&]walk8=off\b/.test(Q),RUN_ON=!/[?&]run=off\b/.test(Q),RUNUL=/[?&]runul=sheet\b/.test(Q),IDLE8=!/[?&]idle8=off\b/.test(Q),RUNUPM=/[?&]runup=(a|old)\b/.exec(Q),RUNUP=RUNUPM?RUNUPM[1]:'r4';
let RUNMUL=1.6,RUNPX=null;{const a=/[?&]runspd=(\d+(?:\.\d+)?)/.exec(Q),b=/[?&]runspeed=(\d+(?:\.\d+)?)/.exec(Q);
  if(a)RUNMUL=Math.max(.5,Math.min(6,+a[1]));else if(b){const v=+b[1];if(v>10)RUNPX=Math.min(900,v);else RUNMUL=Math.max(.5,Math.min(6,v));}}
let RUNFPS=14;{const m=/[?&]runfps=(\d+(?:\.\d+)?)/.exec(Q);if(m)RUNFPS=Math.max(4,Math.min(30,+m[1]));}
const X=window.__DIR4={ver:'dir8run-r5',npc:NPC_ON,walk:WALK_ON,idle:IDLE_ON,src:SEL,err:null,hooks:0,walkspd:WS,walkright:WR,walk8:W8,idle8:IDLE8,runup:RUNUP,idleMs:240,idleSkip:{},idleKind:null,run:RUN_ON,runul:RUNUL?'sheet':'gif',runDelay:.4,runFps:RUNFPS,runMul:RUNMUL,runPx:RUNPX,fbMul:1.6,fpsMaxRun:18,shift:false,runSet:null,moveT:0,swapUp:/[?&]walk8swapup=1\b/.test(Q),d8:null,diag:null,dbg:null,walkK:WK,fpsBase:10,fpsAt:236*WK,fpsMin:6,fpsMax:WK<1?14:12,hold:.12,chg:[],far:520,ready:{hero:false,npc:{}},stats:{hero:0,skip:0,npc:{}},dir:null,frame:null,npcDir:{}};
const SRC=window.__DIR4_SRC;if(!SRC){X.err='no data';return;}
const DIRS=['down','up','left','right'];
const load=u=>{const i=new Image();i.decoding='async';i.src=u;return i;};
const done=i=>!!(i&&i.complete&&i.naturalWidth>0);
function bbox(im,x0,y0,w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(im,x0,y0,w,h,0,0,w,h);
  const d=g.getImageData(0,0,w,h).data;let a=w,b=-1,c0=h,e=-1;for(let y=0;y<h;y++){const r=y*w*4;for(let x=0;x<w;x++)if(d[r+x*4+3]>24){if(x<a)a=x;if(x>b)b=x;if(y<c0)c0=y;if(y>e)e=y;}}
  return b<0?null:{x0:a,x1:b,y0:c0,y1:e,w:b-a+1,h:e-c0+1};}
/* ---------------- images ---------------- */
const HIMG={},NIMG={},NB={},OLDBOX=new WeakMap();
if(WALK_ON)for(const d of DIRS)HIMG[d]=load((SRC['hero_'+SEL]||SRC.hero)[d]);
if(WALK_ON&&!SELM&&WR==='r5'&&SRC.hero_r5right)HIMG.right=load(SRC.hero_r5right);
if(NPC_ON)for(const n in SRC.npc){NIMG[n]={};for(const d of DIRS)NIMG[n][d]=load(SRC.npc[n][d]);}
const DIAG=['downleft','downright','upleft','upright'],HIMG8={},BL8={downleft:417,downright:417,upleft:416,upright:416};
if(WALK_ON&&W8&&SRC.hero8)for(const d of DIAG)HIMG8[d]=load(SRC.hero8[d]);
/* ---- RUN sets: a table keyed by facing name (down, up, left, right, downleft, downright, upleft, upright). A key that has an entry in SRC.run is drawn from that
   sheet at X.runFps; every other facing falls back to the WALK frames played X.runMul times faster. Adding a run set later = adding a data entry
   (SRC.run.left = 'data:...' and, if its feet are not on the walk baseline, SRC.runBL.left = y). ---- */
const RUNIMG={},BLR=Object.assign({down:417,up:416},SRC.runBL||{});   // baseline per run set
if(WALK_ON&&RUN_ON&&SRC.run)for(const k in SRC.run)RUNIMG[k]=load((RUNUL&&SRC.runalt&&SRC.runalt[k])||(k==='up'&&RUNUP!=='r4'&&SRC.runup_alt&&SRC.runup_alt[RUNUP])||SRC.run[k]);
let moveT=0,shiftDown=false;
/* ---- breathing IDLE (dir8run-r4): table keyed by facing name, frames loop at X.idleMs (240 ms) on the game clock, starting at f1 when the hero stops. SRC.idle.<dir> = 4x2 sheet,
   SRC.idleBL.<dir> = baseline, SRC.idle1.<dir> = the single-frame fallback. Missing sheet -> single frame -> the old walk frame 1. ---- */
const IDLEIMG={},IDLE1={},IDLEBL=Object.assign({},SRC.idleBL||{}),IDN=['right','downright','down','downleft','left','upleft','up','upright'];
if(WALK_ON&&IDLE8){if(SRC.idle)for(const k in SRC.idle)IDLEIMG[k]=load(SRC.idle[k]);if(SRC.idle1)for(const k in SRC.idle1)IDLE1[k]=load(SRC.idle1[k]);}
let idleT0=null;
function pickIdle(name,t){if(!IDLE8)return null;const sk=X.idleSkip[name];
  const sh=IDLEIMG[name];if(sk!=='sheet'&&sk!=='all'&&sh&&done(sh)){const f=Math.floor(Math.max(0,t-idleT0)/(X.idleMs/1000))%8;return{img:sh,f,bl:IDLEBL[name]||419,kind:'sheet',name};}
  const s1=IDLE1[name];if(sk!=='all'&&s1&&done(s1))return{img:s1,f:0,bl:IDLEBL[name]||419,kind:'single',name};
  return null;}
addEventListener('keydown',e=>{if(e.key==='Shift'){shiftDown=true;X.shift=true;}},true);
addEventListener('keyup',e=>{if(e.key==='Shift'){shiftDown=false;X.shift=false;}},true);
addEventListener('blur',()=>{shiftDown=false;X.shift=false;});
let hsc=null;   // hero scale record
function heroReady(){if(hsc)return true;try{const HD=window.__HERO3D;if(!HD||!DIRS.every(d=>done(HIMG[d])))return false;
  const b=bbox(HIMG.down,0,0,443,443);if(!b)return false;const r=HD.rects[HD.index.idle[HD.dirs.indexOf('S')][0]],H=r[3]*HD.drawScale;
  hsc={s:H/b.h,ref:b,heroH:H};X.hsc=hsc;X.ready.hero=true;return true;}catch(e){X.err='heroReady '+e.message;return false;}}
function npcReady(n){if(NB[n])return true;try{const S=NIMG[n];if(!S||!DIRS.every(d=>done(S[d])))return false;const o={};for(const d of DIRS){o[d]=bbox(S[d],0,0,627,627);if(!o[d])return false;}NB[n]=o;X.ready.npc[n]=true;
  for(const d of DIRS)try{S[d].decode();}catch(_){}return true;}catch(e){X.err='npcReady '+e.message;return false;}}
/* ---------------- which image is which (cached per image element) ---------------- */
const CLS=new WeakMap();let TARGET=null;
function targets(){if(TARGET)return TARGET;const m=new Map(),C=window.__C1ART||{},P2=window.__PROART||{};
  for(const [k,n] of [['ora_0','ora'],['ora_1','ora'],['mali_0','mali'],['mali_1','mali']])if(C[k]&&NIMG[n])m.set(C[k],n);
  for(const [k,n] of [['ly0','lysel'],['ly1','lysel']])if(P2[k]&&NIMG[n])m.set(P2[k],n);
  return TARGET=m;}
function cls(im){let v=CLS.get(im);if(v!==undefined)return v;v=null;try{if(im&&im.tagName==='IMG'&&im.src){const HD=window.__HERO3D;if(HD&&im.src===HD.src)v='hero';else{const n=targets().get(im.src);if(n)v=n;}}}catch(_){}CLS.set(im,v);return v;}
/* ---------------- hero ---------------- */
const ORDER=['E','SE','S','SW','W','NW','N','NE'];   // same indexing as the 3D hero's direction
const CARD={0:['right'],1:['right','down'],2:['down'],3:['left','down'],4:['left'],5:['left','up'],6:['up'],7:['right','up']};
let curQ='down',cur=0,acc=0,lt=null,started=false,lastWalk=null;
/* 8 sectors of 45 deg from the MOVEMENT vector (screen angle = world angle + camera yaw, E = 0, SE = 1 ... same indexing as the 3D hero), hysteresis +-8 deg
   so the facing does not flicker on a border; standing = the hero's own facing. */
let cur8=2;
function sector8(dI,clip){const S=Math.PI/4;
  if(clip==='idle'||typeof P==='undefined'||!P||Math.hypot(P.vx||0,P.vy||0)<25){cur8=dI&7;return cur8;}
  let cy=0;try{if(typeof camY==='function')cy=+camY()||0;}catch(_){}
  const a=Math.atan2(P.vy,P.vx)+cy,d=Math.atan2(Math.sin(a-cur8*S),Math.cos(a-cur8*S));
  if(Math.abs(d)<=S/2+0.14)return cur8;
  cur8=((Math.round(a/S)%8)+8)%8;return cur8;}
const DN8a=['','downright','','downleft','','upleft','','upright'],DN8b=['','downright','','downleft','','upright','','upleft'],DN8g=s=>(X.swapUp?DN8b:DN8a)[s],ready8=d=>!!(HIMG8[d]&&done(HIMG8[d]));
const quarter=d8=>{const c=CARD[d8&7];if(c.indexOf(curQ)<0)curQ=c[0];return curQ;};
function heroDraw(c,a){
  if(!WALK_ON||typeof P==='undefined'||!P||P.dead)return false;
  const HD=window.__HERO3D,HS=window.HERO3D;if(!HD||!HS)return false;
  const clip=HS.clip;if(clip!=='walk'&&clip!=='run'&&clip!=='idle')return false;
  if(clip!=='idle'&&P.dash)return false;
  if(clip==='idle'&&!IDLE_ON)return false;
  try{if(typeof HS.ext==='function'&&HS.ext(time))return false;}catch(_){}
  const dI=HS.dir,rowI=HD.dirs.indexOf(ORDER[dI]),row=HD.index[clip]&&HD.index[clip][rowI],cell=row&&row[HS.frame],r=cell!=null&&HD.rects[cell];
  if(!r||a[1]!==r[0]||a[2]!==r[1])return false;          // only the hero's own main frame (not after-images)
  if(!heroReady())return false;
  const F=HD.frame,k=a[7]/a[3],Xa=a[5]-(r[4]-F.ax)*k,Ya=a[6]-(r[5]-F.ay)*k,sec=W8?sector8(dI,clip):dI,dg=W8?DN8g(sec):'',diag=(dg&&ready8(dg))?dg:null,q=diag||quarter(sec),im=diag?HIMG8[diag]:HIMG[q];
    /* walk phase: one counter (cur) kept across direction changes; starts on frame 1 (contact pose) when the hero starts to walk; moves on by exactly one
     frame at a time (never skips: if the game draws slower than the walk rate it just plays slower); 0.12 s hold so a brush against a wall does not flip to idle */
  const t=typeof time==='number'?time:performance.now()/1000;let walking=clip!=='idle';
  if(clip!=='idle')lastWalk=t;else if(lastWalk!=null&&t-lastWalk<X.hold)walking=true;
  let f=0,useRun=null,runAct=false,idleDraw=null;
  if(walking){idleT0=null;const dt=lt==null?0:Math.min(.1,Math.max(0,t-lt));lt=t;
    /* run state: Shift forces it, otherwise 0.4 s of continuous movement (direction changes do not reset it; stopping does) */
    moveT=X.rs.t;runAct=RUN_ON&&X.rs.on;   // run state comes from the update side (same clock as the speed)
    if(runAct&&RUNIMG[q]&&done(RUNIMG[q]))useRun=q;
    if(!started){started=true;cur=0;acc=0;}
    else{const sp=Math.hypot(P.vx||0,P.vy||0);let fps=Math.max(X.fpsMin,Math.min(X.fpsMax,sp/X.fpsAt*X.fpsBase));
      if(useRun)fps=X.runFps;else if(runAct)fps=Math.min(X.fpsMaxRun,fps*X.fbMul);
      acc+=dt*fps;
      if(acc>=1){const n=Math.floor(acc);acc-=n;if(n>1)X.stats.skip+=n-1;cur=(cur+1)%8;X.chg.push(cur);if(X.chg.length>80)X.chg.shift();}}
    f=cur;}
  else{started=false;lt=null;cur=0;acc=0;moveT=0;if(IDLE8&&clip==='idle'){if(idleT0==null)idleT0=t;idleDraw=pickIdle(W8?IDN[sec&7]:q,t);}}
  X.runSet=useRun;X.moveT=+moveT.toFixed(2);  const s=hsc.s;
  const tf=c.getTransform();
  if(walking&&!idleDraw&&window.__FACE1&&__FACE1.f3&&__FACE1.draw&&__FACE1.draw(c,Xa,Ya,k,f,runAct,BASE)){}
  else if(idleDraw&&window.__FACE1&&__FACE1.f3&&__FACE1.drawIdle&&__FACE1.drawIdle(c,Xa,Ya,k,BASE)){}
  else if(idleDraw)BASE.call(c,idleDraw.img,(idleDraw.f%4)*443,(idleDraw.f>>2)*443,443,443,Xa-221.5*s,Ya+5*k-idleDraw.bl*s,443*s,443*s);
  else if(useRun)BASE.call(c,RUNIMG[useRun],(f%4)*443,(f>>2)*443,443,443,Xa-221.5*s,Ya+5*k-BLR[useRun]*s,443*s,443*s);
  else if(LF&&q==='right'&&HIMG.left){   // option: the LEFT sheet mirrored about its head x (213.3) is used for the right direction; fixed cell position, one scale
    const hx=Xa+(213.3-221.5)*s;c.save();c.translate(hx,0);c.scale(-1,1);BASE.call(c,HIMG.left,(f%4)*443,(f>>2)*443,443,443,-213.3*s,Ya+5*k-419*s,443*s,443*s);c.restore();}
  else if(diag)BASE.call(c,im,(f%4)*443,(f>>2)*443,443,443,Xa-221.5*s,Ya+5*k-BL8[diag]*s,443*s,443*s);
  else BASE.call(c,im,(f%4)*443,(f>>2)*443,443,443,Xa-221.5*s,Ya+5*k-419*s,443*s,443*s);
  const HXC={left:213.3,right:228.5,up:219.3,down:219,downleft:221.5,downright:221.5,upleft:221.5,upright:221.5},mir=LF&&q==='right';X.idleKind=idleDraw?idleDraw.kind:null;X.dbg={q,sec,diag,f,idle:idleDraw?idleDraw.name:null,idleF:idleDraw?idleDraw.f:null,idleKind:X.idleKind,idleHeadX:idleDraw?Xa+(0)*s:null,run:useRun,runAct,moveT:+moveT.toFixed(2),mirrored:mir,headX:Xa+((mir?213.3:HXC[q])-221.5)*s,footY:Ya+5*k,tfA:tf.a,tfD:tf.d,tfB:tf.b,tfC:tf.c,dI,clip,face:P.face,vx:P.vx,vy:P.vy,Xa:Math.round(Xa),Ya:Math.round(Ya)};
  X.stats.hero++;X.dir=q;X.frame=f;return true;}
/* ---------------- NPCs ---------------- */
const FACE={};
function faceDir(n,wx,wy){const st=FACE[n]||(FACE[n]={d:'down'});
  try{if(Math.hypot(P.x-wx,P.y-wy)>X.far){st.d='down';return st.d;}
    const a=w2s(P.x,P.y-20),b=w2s(wx,wy-30),dx=a[0]-b[0],dy=a[1]-b[1],ax=Math.abs(dx),ay=Math.abs(dy),hor=st.d==='left'||st.d==='right';
    const goHor=hor?!(ay>ax*1.25):(ax>ay*1.25);
    st.d=goHor?(dx<0?'left':'right'):(dy<0?'up':'down');}catch(_){}
  X.npcDir[n]=st.d;return st.d;}
function oldBox(im){let b=OLDBOX.get(im);if(b!==undefined)return b;b=null;try{if(done(im))b=bbox(im,0,0,im.naturalWidth,im.naturalHeight);else return null;}catch(_){}OLDBOX.set(im,b);return b;}
function npcDraw(c,im,n,a){
  if(!NPC_ON||!npcReady(n))return false;
  const ob=oldBox(im);if(!ob)return false;
  const dx=a[0],dy=a[1],dw=a[2],dh=a[3],nat=im.naturalHeight;
  let cx=dx+dw/2,feet=dy+(ob.y1+1)/nat*dh;
  if(n==='lysel'){const M=(window.__PROART||{}).lyMeta;if(M){cx=dx+M.cx*dw/M.w;feet=dy+M.footY*dh/M.h;}}
  const visOld=ob.h/nat*dh,wx=cx,wy=n==='lysel'?feet+14:feet,d=faceDir(n,wx,wy),nb=NB[n][d],s=visOld/NB[n].down.h;
  const by=n==='lysel'?1:1+.012*Math.sin((typeof time==='number'?time:0)*2.2+cx*.01);   // the old single-frame NPCs breathe a little
  BASE.call(c,NIMG[n][d],cx-313.5*s,feet-(nb.y1+1)*s*by,627*s,627*s*by);
  X.stats.npc[n]=(X.stats.npc[n]||0)+1;return true;}
/* ---------------- ?walkspd=slow (default here) | normal ----------------
   Only the hero's BASE walking speed is scaled (x0.55 = ~130 px/s instead of ~236): during the game's own updPlayer call P.speed is set to
   base x (K + b) / (1 + b), b = the speed bonus B('speed'), so the game's own formula (P.speed x (1 + b)) gives base x (K + b): buffs / gear still add
   the same absolute amount of the normal speed. Dash, leap, knock-back and skill movement use their own vectors and are not touched; weapons,
   attack speed and skills are not touched. The walk animation rate follows the speed (fpsAt = 236 x K). Debug: window.__DIR4.walkK */
/* RUN speed (dir8run-r3). One wrapper around the game's own updPlayer(dt): P.speed (the base walking speed that the game multiplies by its buffs) is set to
   base x (K + b) / (1 + b), b = the speed bonus, so the game's own formula gives base x (K + b): buffs keep adding the same absolute amount. K = WK (0.55, the
   slow walk) while walking, K = run K while the run state is on, eased linearly over 0.15 s. Run K = WK x ?runspd (default 1.6) (?runspeed=<px> if > 10 = absolute px/s),
   never below the walk K (so with ?walkspd=normal the run is max(run, walk)). Dash / leap / knock-back / skills do not read P.speed and are untouched.
   Run state (also drives the run sprites): Shift held while moving, or 0.4 s of continuous movement; stopping for more than 0.12 s resets it. ?run=off: no run state, no change. */
const RS=X.rs={t:0,still:0,on:false,k:WK,kRun:WK,ease:.15,sp:0};
if(RUN_ON||WK<1){try{const o=updPlayer;updPlayer=function(dt){let s0=null,s1=null;
  try{if(typeof P!=='undefined'&&P&&!P.dead){
    const d=(typeof dt==='number'&&dt>0&&dt<.5)?dt:1/60,sp=Math.hypot(P.vx||0,P.vy||0);RS.sp=sp;
    if(sp>25){RS.t+=d;RS.still=0;}else{RS.still+=d;if(RS.still>X.hold)RS.t=0;}
    RS.on=RUN_ON&&((X.shift&&sp>25)||RS.t>=X.runDelay);
    s0=P.speed;let b=0;try{b=+B('speed')||0;}catch(_){}if(b<-.9)b=-.9;
    const kRun=RUN_ON?(X.runPx?Math.max(X.runPx/s0,WK):WK*Math.max(1,X.runMul)):WK;RS.kRun=kRun;
    if(Math.abs(kRun-WK)<1e-6)RS.k=WK;else{const st=Math.abs(kRun-WK)/RS.ease*d,tg=RS.on?kRun:WK;RS.k+=Math.max(-st,Math.min(st,tg-RS.k));}
    s1=s0*(RS.k+b)/(1+b);P.speed=s1;}}catch(_){s0=null;}
  try{return o.apply(this,arguments);}finally{try{if(s0!=null&&P.speed===s1)P.speed=s0;}catch(_){}}};}catch(e){X.err='walkspd '+e.message;}}/* ---------------- the ctx.drawImage hook ----------------
   Other modules (the 3D hero set's frame swap, the outline pass ...) keep wrapping ctx.drawImage on top of each other, and the hero set swaps the
   hero's frame itself without calling the wrapper below it. So this hook is an accessor on ctx: reading it always gives this wrapper (outermost),
   assigning to it just replaces what we call next (INNER); a call that comes back into the wrapper from inside the chain goes straight to BASE. */
let BASE=null,INNER=null,BUSY=false;
const myW=function(im){
  if(BUSY)return BASE.apply(this,arguments);
  const n=arguments.length;
  if(n===9||n===5){let k=null;try{k=cls(im);}catch(_){}
    if(k){try{if(k==='hero'){if(n===9&&heroDraw(this,arguments))return;}
      else if(n===5&&npcDraw(this,im,k,[arguments[1],arguments[2],arguments[3],arguments[4]]))return;}catch(e){X.err='draw '+e.message;}}}
  BUSY=true;try{return INNER.apply(this,arguments);}finally{BUSY=false;}};
myW.__p269=1;myW.__dir4=1;
const myGet=function(){return myW;},mySet=function(f){if(typeof f==='function')INNER=f;};
function install(){try{if(typeof ctx==='undefined'||!ctx)return;const d=Object.getOwnPropertyDescriptor(ctx,'drawImage');
  if(d&&d.get===myGet)return;
  if(d&&d.value&&d.value!==myW)BASE=d.value;else if(!BASE)BASE=ctx.drawImage;
  INNER=BASE;Object.defineProperty(ctx,'drawImage',{configurable:true,enumerable:true,get:myGet,set:mySet});X.hooks++;}catch(e){X.err='hook '+e.message;}}
install();setInterval(install,300);X.state=()=>({err:X.err,hooks:X.hooks,ready:X.ready,stats:X.stats,dir:X.dir,frame:X.frame,npcDir:X.npcDir,hsc:hsc&&{s:hsc.s,heroH:hsc.heroH,refH:hsc.ref.h}});
console.info('[DIR4] dir4-r1 loaded · npc4='+NPC_ON+' walk4='+WALK_ON+' idle='+IDLE_ON);
})();
