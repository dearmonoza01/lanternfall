
/* ---- candidate_balance_v1_r31: p269 r7 hero sword set + draw / sheathe + designed sword wave + swing aim lock in game (TEST only) ---- */
/* p269 r6 — Hero sword set: approved 3D layers in game (candidate_balance_v1_r30, TEST only). Not merged, not published.
   Art (DeaRz 17 Oct, approved\3d\): melee_down_fast_r3_layers (sword attack = the overhead downward slash only, 45 f @ 30 fps,
   hit NN 21 = 0.70 s) and loco_r16_layers (idle / walk / run / hurt / death, sword sheathed at the left hip). Integration ordered by
   DeaRz 18 Oct ("เริ่มได้เลย"). Every frame = body layer, then sword layer, same anchor, + the 2 px #2B201C outline the other hero sets
   carry; 8 directions rendered separately, no mirroring, uniform scale only (data: window.__HEROSW).
   How it plugs in without touching p194 and the skill modules:
     • p194 still runs everything (direction pick, clip choice, hurt / death / dissolve, after-images, character screen, every skill
       wrapper around drawPlayerSprite). Only the hero frame itself is swapped: when p194 draws one of its idle / ready / walk / run /
       hurt / death cells from its atlas, the same clip + direction + frame index is drawn from the new set at the same anchor.
       Skill clips (skill1, the old combo frames some skills borrow) keep the old art — no new art for them yet.
     • basic attack: p194's 3-swing combo becomes one swing 'slash' (len 1.5 s, hit 0.7 s, the approved frames). Play speed follows the
       balance v1 sword period (p255): at base 1 swing / 1.5 s, the hit lands at 0.70 s; faster ASPD plays the whole slash inside the
       shorter period. Damage stays p194 + p255 (one normal hit, no 3rd-swing ×1.5).
     • blade trail: p194's trail follows the new blade (sword pommel / tip points exported from Blender with the approved set).
     • no root motion for the slash (the body stays in place in the render; p204's old combo step is not replayed).
   r2 (3D QA of r24, art/hero/qa_ingame_r1/QA_hero_sword_ingame_r24.md):
     A  p194's 'ready' window after a swing (3 s, standing) holds the slash guard frame (index 44 = index 0, sword in hand) instead of the
        sheathed idle, so the sword no longer jumps hand -> hip right after a swing; walking away / the end of the window = sheathed loco.
     B  the blade trail only shows while the blade drives down and follows through (slash index 21..25), looks back 2 source frames (was 4)
        and is ~40 % as strong, so the overhead wind-up no longer paints a pale sheet over the head.
     D  the death dissolve motes are re-taken from the new death frames (p194's dissolve prep runs once more after this set has loaded).
   r3 (DeaRz approved the draw / sheathe clips 19 Oct 02:04, approved\3d\sword_draw_sheathe_r1, 11 f @ 30 fps each, data: window.__HEROSW_DS):
     • the hero keeps track of where the sword is: in the hand (after a swing, in the 'ready' guard) or sheathed at the left hip.
     • a swing that starts with the sword sheathed opens with the draw clip, played in 0.25 s (instead of 0.37 s), then the slash wind-up
       (slash frames 2..20; frames 0-2 are the same held guard) is played 1.4x faster so the hit frame still lands at 0.70 s and the
       swing still ends at 1.5 s (both scale with the balance v1 sword period). Swings that start with the sword in hand are unchanged.
     • when the 'ready' window ends with the hero standing, the sheathe clip plays (0.37 s, 30 fps) and the idle loop then starts on its
       frame 00 (= the sheathe's last frame) instead of popping from the guard to the hip.
     • 'ready' with the sword already sheathed (e.g. the hero walked away from a fight and stopped) stays on the sheathed idle: no pop back
       into the hand, no extra draw. Walking / running / hurt / death keep the sheathed loco frames (no in-hand art for them).
     Turn only the draw / sheathe part off with ?herods=off. Debug: window.HEROSW.sw.
   r4 (DeaRz 19 Oct 13:22 "ท่าฟันดาบใส่คลื่นดาบตอนฟันมาด้วย จะได้เห็นทิศทางการฟันชัดเจน"): a sword wave on the basic slash.
     • a crescent of light follows the blade tip through the down-swing (source frames 18.5..27, the hit is frame 22), a band along
       the outer third of the blade, thick at the blade and thinning toward its tail (the overhead wind-up is left out), so the arc shows the swing direction; after the swing passes frame 27 the full crescent
       stays where it was cut and fades out in 0.28 s. It does not fly out and does no damage (DeaRz removed the released wave in m8).
     • it follows the frames the game really shows (first swing: after the draw, on the faster wind-up) and the hero's direction.
     • colours = the weapon palette (wpal) like the old trail; p194's thin blade trail is not drawn on the slash any more (the wave
       replaces it). Skill swings unchanged. Turn off with ?herowave=off (back to the r3 trail). Debug: window.HEROSW.wave.
   r5 (3D QA of r28, art/hero/qa_ingame_r28_wave/QA_sword_wave_r28.md):
     1  facing E / SE / NE / N the blade tip starts the down-swing BEHIND the head: the part of the wave cut before source frame
        WV.BACK[dir] is drawn under the hero (before p194 draws the body), the rest over it, so no pale band sits across the head
        (facing N or NE the blade cuts in front of the body, away from the camera, so the whole wave is under the hero).
     2  the wave is tinted in the weapon colour all along (source-over fill, not 'lighter', so it still shows over white hair / shirt),
        with a 1 px darker edge (wpal glow) and an accent-coloured cutting edge instead of a near-white core.
   r6 (DeaRz 19 Oct 15:14, reference picture art/hero/wave_ref/dearz_wave_ref_20261019.png: "ขอเป็นคลื่นดาบแบบนี้ ออกแบบมา
      ไปทิศทางเดียว ไม่ใช่หยักๆ"): the wave no longer traces the blade path (the tip swings forward and comes back on the
      follow-through, which made the zig-zag). It is now a designed, smooth one-way crescent:
     • per direction one smooth diagonal crescent in front of the hero that runs the same way as the blade (DeaRz 15:14
       "ฟันจากเฉียงซ้ายมาขวา ตามอาวุธ"), carried on 12 % past the end.
     • 5 flame streaks side by side along that curve (the middle one widest, outer ones thinner and a little shorter and later),
       plus a wide soft glow, fire colours like the picture: deep red tail -> orange -> pale yellow-white head, additive light.
     • it sweeps in with the cut (frame 19 to the farthest frame, ~0.1 s), then stays, drifts 6 px outward and fades in 0.35 s.
     • depth: the part above the hero's chest line on screen is behind the hero (drawn under the body), the rest over it.
   r7 (3D QA of r30 asked whether the hero turns during the slash facing E: it did, a real bug):
     • the wave look is exactly r30's (DeaRz 19 Oct 15:50 "ok เยี่ยมผ่าน คลื่นดาบใหม่"); QA's optional shape notes are not applied.
     • the hero no longer turns at the hit: p194 fires the game's own attack at the hit frame and the game aimed it at the mouse
       pointer / nearest enemy at that moment, so a free swing (no locked target) could snap to another direction mid-swing.
       The aim is now taken once when the swing starts (same rule as the game's: pointer on PC, nearest enemy / facing on touch),
       the hero faces it for the whole swing and the hit goes that way. A locked target (p225) is unchanged.
   With the bow equipped nothing changes (p252 / p258 draw the bow sets). Turn off with ?herosw=off. Debug: window.HEROSW. */
(function(){
'use strict';
const M=window.__HEROSW,D=window.__HERO3D,H=window.HERO3D;
const R=window.HEROSW={ver:'p269-r7',on:true,err:null,ready:0,stats:{swaps:0,pass:0,swings:0,miss:0},last:null};
try{if(/herosw=off/.test(location.search))R.on=false;}catch(e){}
if(!M||!D||!H){R.err='missing '+(!M?'data ':'')+(!D||!H?'hero':'');console.warn('[p269]',R.err);return;}
if(!R.on)return;
const F=D.frame,AX=F.ax,AY=F.ay,NAX=141,NAY=F.ay+80;   // new 282x362 frames = old 282x282 frame with 80 rows added on top (measured: sword tip / pommel data +80)
let DSON=false;try{const X=window.__HEROSW_DS;DSON=!!X&&!/herods=off/.test(location.search);
  if(DSON){Object.assign(M.atlases,X.atlases);Object.assign(M.rects,X.rects);Object.assign(M.clips,X.clips);}}catch(e){R.err='ds '+e.message;DSON=false;}
const NAT=Object.keys(M.atlases).length;
const IM={};for(const k in M.atlases){const im=new Image();im.onload=()=>{R.ready++;if(R.ready===NAT)redoDissolve();};im.src=M.atlases[k].src;IM[k]=im;}
/* D: p194 builds its dissolve motes from its death frames on its image's load event. Once this set is ready, the hero image is loaded
   again from the same data (its load event runs p194's prep again, now through the frame swap = new death frames). Once only. */
let heroIm=null,redo=0;function redoDissolve(){if(redo||!heroIm||R.ready!==NAT)return;redo=1;try{const s_=heroIm.src;heroIm.src=s_;R.dissolveRedo=1;}catch(e){R.err='dissolve '+e.message;}}
const bowOn=()=>{try{return !!(window.BOW&&BOW.bowNow&&BOW.bowNow());}catch(e){return false;}};

/* ---------- data: the slash clip in p194's tables (cells point at unique off-atlas rects; only this module draws them) ---------- */
const SL=M.clips.slash;
D.clips.slash={n:SL,fps:30,loop:false};
D.index.slash=D.dirs.map((d,di)=>{const a=[];for(let i=0;i<SL;i++){a.push(D.rects.length);D.rects.push([-10000-(di*SL+i)*2,-10000,1,1,AX,AY]);}return a;});
D.trails=D.trails||{};D.trails.slash=M.trail;
/* B: trail window. p194 reads D.wave.minLen / window on every draw: outside slash index 19..24 the trail needs an impossible length (not drawn) */
const TRW=[21,25],W0=Object.assign({},D.wave);
function slashIdx(){try{const A_=H.anim;if(!A_||!D.combo[A_.k]||D.combo[A_.k].clip!=='slash')return -1;return Math.floor(H.uOf(A_,time)*30);}catch(e){return -1;}}
let WVON=true;try{WVON=!/herowave=off/.test(location.search);}catch(e){}
Object.defineProperty(D.wave,'minLen',{get(){const i=slashIdx();return i<0||(!WVON&&i>=TRW[0]&&i<=TRW[1])?W0.minLen:1e9;},configurable:true});
Object.defineProperty(D.wave,'fullLen',{get(){return slashIdx()>=0?W0.fullLen*2.5:W0.fullLen;},configurable:true});   // softer glow on the slash (~40 % of full)
Object.defineProperty(D.wave,'window',{get(){return slashIdx()>=0?2:W0.window;},configurable:true});
let inUpd=0;   // p204 (root motion of the old combo) reads combo.src inside updPlayer: no src there -> no step
const SEG0={clip:'slash',len:1.5,hit:0.7};let SRC=[1,SL];
Object.defineProperty(SEG0,'src',{get(){return inUpd?null:SRC;},enumerable:true});
D.combo.length=0;D.combo.push(SEG0);
{const o=updPlayer;updPlayer=function(){inUpd++;try{return o.apply(this,arguments);}finally{inUpd--;}};}

/* ---------- cell map: p194 atlas cell -> new frame of the same clip / direction / index ---------- */
const NEW={idle:'idle',ready:'idle',walk:'walk',run:'run',hurt:'hurt',death:'death',slash:'slash'};
const MAP=new Map(),key=(sx,sy)=>(sx+30000)*100000+(sy+30000);
for(const c in NEW){const ix=D.index[c];if(!ix)continue;const nc=NEW[c],n=M.clips[nc];
  ix.forEach((row,di)=>row.forEach((ri,i)=>{const r=D.rects[ri];if(r[6])return;
    const nr=c==='ready'?M.rects['slash|'+D.dirs[di]+'|'+(SL-1)]:M.rects[nc+'|'+D.dirs[di]+'|'+Math.min(n-1,i)];if(nr)MAP.set(key(r[0],r[1]),{r,nr,c,i,dn:D.dirs[di]});}));}
R.cells=MAP.size;
/* ---------- r3: draw / sheathe. Decided once per game frame on the hero's own frame (p194 sets clip / frame / dir just before it) ---------- */
const SW=R.sw={on:DSON,st:'sheathed',t0:0,idleT0:0,shown:null,lastT:null,lastM:null,pick:null,draws:0,sheathes:0};
const DN8=['E','SE','S','SW','W','NW','N','NE'],TD=0.25,W0F=2,HIT=SEG0.hit,IDF=D.clips.idle.fps,IDN=M.clips.idle;
const rc=(c,dn,i)=>M.rects[c+'|'+dn+'|'+i];
const sheatheK=()=>Math.floor((time-SW.t0)*30);
function pick(m){const c=m.c,dn=m.dn;
  if(c==='slash'){SW.st='hand';SW.shown='slash';const an=H.anim;
    if(an&&an.draw&&D.combo[an.k]===SEG0){const u=H.uOf(an,time);
      if(u<TD)return rc('draw',dn,Math.min(10,Math.floor(u/TD*11)));
      if(u<HIT)return rc('slash',dn,W0F+Math.min(18,Math.floor((u-TD)/(HIT-TD)*19)));}
    return m.nr;}
  if(c==='ready'||c==='idle'){
    if(SW.st==='hand'){if(c==='ready'){SW.shown='ready';return m.nr;}SW.st='sheathing';SW.t0=time;SW.sheathes++;}
    if(SW.st==='sheathing'){const k=sheatheK();if(k<11){SW.shown='sheathe';return rc('sheathe',dn,k);}SW.st='sheathed';SW.shown=null;}
    if(SW.shown!=='idle'){SW.idleT0=time;SW.shown='idle';}
    return rc('idle',dn,Math.floor((time-SW.idleT0)*IDF)%IDN);}
  SW.st='sheathed';SW.shown=c;return m.nr;}
function pickMain(m){
  if(SW.lastT===time&&SW.lastM===m)return SW.pick;
  if(m.c!==H.clip||m.i!==H.frame||m.dn!==DN8[H.dir])return m.nr;   // after-images / other copies of a frame: plain swap
  let nr=m.nr;try{nr=pick(m)||m.nr;}catch(e){R.err='sw '+e.message;}
  SW.lastT=time;SW.lastM=m;SW.pick=nr;return nr;}
const HI=new WeakMap();
function heroImg(im){let v=HI.get(im);if(v===undefined){v=false;try{if(im&&im.tagName==='IMG'){const s=im.src;v=!!s&&s===new URL(D.src,location.href).href;}}catch(e){}HI.set(im,v);if(v&&!heroIm){heroIm=im;redoDissolve();}}return v;}
const oDI=CanvasRenderingContext2D.prototype.drawImage;   // the real one draws the swapped frame (no other hook sees our atlas)
function wrapDI(orig){const w=function(im,sx,sy,sw,sh,dx,dy,dw,dh){
  if(arguments.length===9&&R.ready===NAT&&heroImg(im)){
    const m=MAP.get(key(sx,sy));
    if(m&&bowOn())SW.st='sheathed';
    if(m&&!bowOn()){const r=m.r,nr=DSON?pickMain(m):m.nr,k=dw/sw,X=dx-(r[4]-AX)*k,Y=dy-(r[5]-AY)*k;R.stats.swaps++;R.last=m.c;
      return oDI.call(this,IM[nr[0]],nr[1],nr[2],nr[3],nr[4],X+(nr[5]-NAX)*k,Y+(nr[6]-NAY)*k,nr[3]*k,nr[4]*k);}
    if(sx<=-10000){R.stats.miss++;return;}
    R.stats.pass++;}
  return orig.apply(this,arguments);};w.__p269=1;return w;}
CanvasRenderingContext2D.prototype.drawImage=wrapDI(oDI);
/* the main game context carries its own drawImage (p221 static-image cache): wrap that one too, and again if it is ever replaced */
function hookCtx(){try{if(typeof ctx!=='undefined'&&ctx&&Object.prototype.hasOwnProperty.call(ctx,'drawImage')&&!ctx.drawImage.__p269){ctx.drawImage=wrapDI(ctx.drawImage);R.ctxHooks=(R.ctxHooks||0)+1;}}catch(e){R.err='ctx '+e.message;}}
hookCtx();{const o=update;update=function(){hookCtx();return o.apply(this,arguments);};}

/* ---------- speed: the slash plays inside the balance v1 sword period (base 1.5 s -> hit 0.70 s) ---------- */
{const o=basicAttack;basicAttack=function(){const a0=H.anim;const r=o.apply(this,arguments);
  try{const an=H.anim;if(!H.firing&&an&&an!==a0&&Math.abs(an.t0-time)<1e-9&&!bowOn()){
    const B=window.__BAL1,T=B&&B.swordPeriod?B.swordPeriod():1.5,f=SEG0.len/T;
    an.f=f;if(DSON){an.draw=SW.st==='sheathed'||(SW.st==='sheathing'&&sheatheK()>=4);if(an.draw)SW.draws++;}
    const p=H.pend;if(p){p.t=an.t0+SEG0.hit/f;p.end=an.t0+SEG0.len/f;}P.atkCd=SEG0.len/f;
    if(WVON)WV.list.push({an,t0:time,te:null,dn:null,ax:0,ay:0,h:null});
    if(LKON){const TLK=window.TLOCK,tg=TLK&&TLK.swing&&TLK.swing.t===+time.toFixed(3);let a=P.face;
      if(!tg){try{const q=aimPoint();if(q&&isFinite(q.x)&&Math.hypot(q.x-P.x,q.y-P.y)>4)a=Math.atan2(q.y-P.y,q.x-P.x);}catch(e){}P.face=a;}
      AL.lock={an,a,tg:!!tg};AL.n++;}
    R.stats.swings++;R.lastSwing={t0:an.t0,T,f,hitAt:SEG0.hit/f,draw:!!an.draw,drawEnd:an.draw?TD/f:0};}}catch(e){R.err='speed '+e.message;}
  return r;};}

/* ---------- r7: the swing keeps the aim it started with (no turn at the hit frame) ---------- */
let LKON=true;try{LKON=!/heroaim=off/.test(location.search);}catch(e){}
const AL=R.aim={on:LKON,lock:null,n:0,held:0};
function lockLive(){const L=AL.lock;if(!L)return null;if(L.an!==H.anim||P.dead||bowOn()){AL.lock=null;return null;}return L;}
if(LKON){
  const oA=aimPoint;aimPoint=function(range){const L=lockLive();
    if(L&&!L.tg&&H.firing){const d=range||200;AL.held++;return {x:P.x+Math.cos(L.a)*d,y:P.y+Math.sin(L.a)*d};}
    return oA.apply(this,arguments);};
  const oU=update;update=function(){const r=oU.apply(this,arguments);try{const L=lockLive();if(L&&!L.tg)P.face=L.a;}catch(e){R.err='aim '+e.message;}return r;};}
/* ---------- r6: designed sword wave (smooth one-way flame crescent) on the basic slash ---------- */
const WV=R.wave={on:WVON,list:[],drawn:0,F0:19,LINGER:.35,EXT:1.12,arc:{}};
function dispSF(an){const u=H.uOf(an,time);
  if(an.draw&&DSON&&u<HIT){if(u<TD)return -1;return 1+W0F+(u-TD)/(HIT-TD)*19;}return 1+u*30;}
function tipAt(dn,sf){const t=M.trail[dn];if(!t)return null;const i=Math.max(0,Math.min(t.length-1,sf-t[0][0])),a=t[Math.floor(i)],b=t[Math.min(t.length-1,Math.floor(i)+1)],u=i-Math.floor(i);
  return [a[3]+(b[3]-a[3])*u,a[4]+(b[4]-a[4])*u];}
/* the cut (DeaRz 15:14 "ฟันจากเฉียงซ้ายมาขวา ตามอาวุธ"): per direction one smooth crescent in front of the hero (old 282x282 frame px,
   chest at 141,150): 150 degrees of the ground ellipse round the chest (y squashed .6 for the camera), starting 40 px higher and
   ending 10 px lower (a diagonal downward cut). Its sense (which end it starts from) is the one that goes the same way as the
   approved blade (tip at frame 19 -> tip where it is farthest along), so it follows the weapon: facing S it runs from upper left to
   lower right on screen like the picture; facing E / W it comes over the top and down in front. Screen angle of direction i = i*45 deg. */
const FIRE={glow:'#ff4a1a',deep:'#e8240c',mid:'#ff7a1e',hot:'#ffc04a',core:'#fff4cc'};   // the reference picture's flame colours
function bez(A,t){const th=A.phi+A.s*(-75+150*t)*Math.PI/180;return [141+A.R*Math.cos(th),150+A.R*.6*Math.sin(th)+A.y0+A.dy*t];}
function bezN(A,t){const th=A.phi+A.s*(-75+150*t)*Math.PI/180,x=Math.cos(th),y=.6*Math.sin(th),l=Math.hypot(x,y)||1;return [x/l,y/l];}
const TUNE={};   // per-direction shape overrides (none: r30 shape approved)
for(let i=0;i<8;i++){const dn=DN8[i],p0=tipAt(dn,WV.F0);let best=WV.F0+1,bd=-1;
  for(let s=WV.F0+1;s<=WV.F0+5;s+=.25){const q=tipAt(dn,s),d_=Math.hypot(q[0]-p0[0],q[1]-p0[1]);if(d_>bd){bd=d_;best=s;}}
  const p2=tipAt(dn,best),T=TUNE[dn]||{},vx=p2[0]-p0[0],vy=p2[1]-p0[1],A={phi:(T.phi!=null?T.phi:i*45)*Math.PI/180,R:112,y0:T.y0!=null?T.y0:-40,dy:T.dy!=null?T.dy:50,s:1,f1:Math.min(best,22.5)};
  const a0=bez(A,0),a1=bez(A,1);if((a1[0]-a0[0])*vx+(a1[1]-a0[1])*vy<0)A.s=-1;WV.arc[dn]=A;}
/* one streak: centre offset off along the normal, width wd (frame px), drawn on curve range [ta,tb] clipped to [from,to] */
function streak(w,A,ta,tb,from,to,off,wd,cols,alpha,lighter){const a=Math.max(ta,from),b=Math.min(tb,to);if(b-a<.01)return;
  const F=D.frame,k=D.drawScale,N=18,out=[],inn=[];
  for(let j=0;j<=N;j++){const t=a+(b-a)*j/N,q=(t-ta)/(tb-ta),p=bez(A,t),n=bezN(A,t),hw=wd*.5*Math.pow(Math.sin(Math.PI*Math.min(1,q*1.15)),.7)+.3;
    out.push([w.ax+(p[0]+n[0]*(off+hw)-F.ax)*k,w.ay+(p[1]+n[1]*(off+hw)-F.ay)*k]);inn.push([w.ax+(p[0]+n[0]*(off-hw)-F.ax)*k,w.ay+(p[1]+n[1]*(off-hw)-F.ay)*k]);}
  const t0=bez(A,ta),t1=bez(A,tb),g=ctx.createLinearGradient(w.ax+(t0[0]-F.ax)*k,w.ay+(t0[1]-F.ay)*k,w.ax+(t1[0]-F.ax)*k,w.ay+(t1[1]-F.ay)*k);
  g.addColorStop(0,'rgba(232,36,12,0)');cols.forEach((c_,i)=>g.addColorStop(.25+.75*i/(cols.length-1),c_));
  ctx.globalCompositeOperation=lighter?'lighter':'source-over';ctx.globalAlpha=alpha;ctx.fillStyle=g;
  ctx.beginPath();out.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));for(let i=inn.length-1;i>=0;i--)ctx.lineTo(inn[i][0],inn[i][1]);ctx.closePath();ctx.fill();}
/* the whole wave at head position h (0..EXT, sweeping) or full (linger f<1), drawn on curve range from..to */
const STR=[[0,14,[FIRE.mid,FIRE.hot,FIRE.core],1,0],[-9,7,[FIRE.deep,FIRE.mid,FIRE.hot],.85,.06],[9,8,[FIRE.deep,FIRE.mid,FIRE.hot],.85,.03],
  [-17,4,[FIRE.deep,FIRE.mid],.7,.12],[17,4.5,[FIRE.deep,FIRE.mid],.7,.09]];   // [normal offset, width, colours, alpha, late start]
function drawWave(w,h,fade,from,to,sweep){const A=WV.arc[w.dn];if(!A)return;const drift=(1-fade)*6;
  ctx.save();
  streak(w,A,Math.max(0,h-.9),h,from,to,drift,30,[FIRE.glow,FIRE.glow],.22*fade,true);                                // soft glow
  for(const s of STR){const ta=Math.max(0,h-.85)+s[4],tb=h-s[4]*.6;if(tb-ta<.05)continue;
    streak(w,A,ta,tb,from,to,s[0]+drift*(1+Math.abs(s[0])/20),s[1]*(1+(1-fade)*.25),s[2],s[3]*fade*.55,false);       // tinted body
    streak(w,A,ta,tb,from,to,s[0]+drift*(1+Math.abs(s[0])/20),s[1]*.6,s[2],s[3]*fade*.6,true);}                      // hot light
  ctx.restore();WV.drawn++;}
/* depth: the part of the crescent above the hero's chest line on screen is behind the hero (drawn before the body), the rest in front */
function drawWaves(layer){if(!WV.list.length)return;
  for(const w of WV.list){if(!w.dn||w.h==null)continue;const cy=w.ay+(150-D.frame.ay)*D.drawScale;
    ctx.save();ctx.beginPath();if(layer==='under')ctx.rect(w.ax-4000,cy-4000,8000,4000);else ctx.rect(w.ax-4000,cy,8000,4000);ctx.clip();
    if(w.te==null)drawWave(w,w.h,1,0,9,true);else{const f=1-(time-w.te)/WV.LINGER;if(f>0)drawWave(w,WV.EXT,f,0,9);}
    ctx.restore();}}
function stepWaves(){
  for(let i=WV.list.length-1;i>=0;i--){const w=WV.list[i];
    if(w.te==null){const live=H.anim===w.an&&!P.dead;
      if(live){const sf=dispSF(w.an);w.dn=DN8[H.dir];if(H.anchor){w.ax=H.anchor.x;w.ay=H.anchor.y;}const A=WV.arc[w.dn];
        if(!A||sf<WV.F0){w.h=null;continue;}
        w.h=Math.min(WV.EXT,(sf-WV.F0)/(A.f1-WV.F0)*WV.EXT/1.0);if(w.h>=WV.EXT)w.te=time;continue;}
      if(w.h!=null&&w.h>.5)w.te=time;else{WV.list.splice(i,1);continue;}}
    if(time-w.te>=WV.LINGER)WV.list.splice(i,1);}
  if(WV.list.length>6)WV.list.splice(0,WV.list.length-6);}
if(WVON){const o=drawPlayer;drawPlayer=function(){
  try{if(!bowOn())drawWaves('under');}catch(e){R.err='wave '+e.message;}
  const r=o.apply(this,arguments);
  try{if(!bowOn()){stepWaves();drawWaves('over');}else WV.list.length=0;}catch(e){R.err='wave '+e.message;}return r;};}
})();

