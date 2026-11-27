
/* ---- merge m8: p194 hero 3D sprite r7 (blade aura +30%, no released wave) ---- */
/* p194 — Hero 3D sprite (merge m7 candidate, r5: faster combo, sword wave from the blade, Mixamo fist grip).
   The player body is drawn from pre-rendered frames of the Meshy chibi model holding the new sword (Blender, 8 directions,
   light from the upper left, every direction rendered separately — no mirrored frames).
   Basic attack = the Mixamo one-hand combo (3 swings), retargeted onto the Meshy rig with the sword in the right hand.
   Damage lands on the impact frame of each swing (user rule).
   Death: the body falls, then dissolves into rising motes of light.
   Turn the new body off for a comparison with ?hero3d=off in the URL. */
(function(){
'use strict';
const D=window.__HERO3D;if(!D){console.warn('[p194] no hero data');return;}
const img=new Image();let ready=false;img.onload=()=>{ready=true;try{prepDissolve();}catch(e){console.warn('[p194] dissolve',e);}};img.src=D.src;
const img2=new Image();if(D.src2)img2.src=D.src2;   // m37: second atlas (skill clips), rect[6]=1
const ST={ver:D.version,on:true,ready:()=>ready,dir:2,clip:'idle',frame:0,anim:null,pend:null,combo:0,lastEnd:-99,interval:.5,
  deadAt:null,hurtAt:-99,lastCombat:-99,lastSwing:null,skillT0:-99,draws:0,fired:0,cancelled:0,motes:[],dissolve:0,waves:[],anchor:null};
try{if(/hero3d=off/.test(location.search))ST.on=false;}catch(e){}
window.HERO3D=ST;
const DI={};D.dirs.forEach((d,i)=>DI[d]=i);
const ORDER=['E','SE','S','SW','W','NW','N','NE'];
const active=()=>ST.on&&ready&&typeof P!=='undefined'&&P;
function pickDir(fa){
  const a=Math.atan2(Math.sin(fa),Math.cos(fa));
  const cc=ST.dir*Math.PI/4,d=Math.atan2(Math.sin(a-cc),Math.cos(a-cc));
  if(Math.abs(d)<Math.PI/8+0.09)return ST.dir;
  return ((Math.round(a/(Math.PI/4))%8)+8)%8;
}
function cellOf(clip,dir,i){const n=D.clips[clip].n;i=Math.max(0,Math.min(n-1,i|0));return D.index[clip][DI[ORDER[dir]]][i];}
const RC=cell=>D.rects[cell];   // [sx,sy,w,h,ox,oy]: full-resolution frame cropped to its pixels (r5)

/* ---------- basic attack = Mixamo "One Hand Club Combo" split into 3 swings (r4) ----------
   Each press plays the next swing (1 → 2 → 3 → 1). A swing always plays at its full speed (user: attacks were too fast
   to read), so the next swing can only start when the current one is nearly finished. The game's own basic attack runs
   on the impact frame of the swing: damage per hit and hit effects stay the game's own. Dying, being stunned or dashing
   before the impact cancels that hit. */
const stunned=()=>(P.stunT||0)>0;
const SEG=D.combo;            // [{clip,len,hit}, ...]
SEG[SEG.length-1].rec=1.5;    // user 10 Oct 00:05: the 3rd swing's recovery (after the hit) plays 50% faster
const segLen=k=>{const A=SEG[k],r=A.rec||1;return A.hit+(A.len-A.hit)/r;};                  // real seconds at speed 1
const uOf=(A,now)=>{const S_=SEG[A.k],r=(now-A.t0)*A.f;return r<=S_.hit?r:S_.hit+(r-S_.hit)*(S_.rec||1);};   // animation time
ST.uOf=uOf;ST.segLen=segLen;
/* ASPD speeds the swings up (user 9 Oct): speed = ASPD factor relative to the starting character (AGI 5), 1× … 1.5× */
const ASPD_REF=1+5*.012,SPD_MAX=1.5,BASE_SPD=1.5;   // user 9 Oct: swings 50% faster; ASPD adds up to 1.5× on top
function speedNow(){let a=1;try{a=Math.max(1,Math.min(SPD_MAX,(P.aspdF||1)*(1+(B('aspd')||0))/ASPD_REF));}catch(e){}return BASE_SPD*a;}
/* swing 3 hits ×1.5 (user 9 Oct). The game's own chain counter is lined up with the swing number so its built-in
   finisher bonus is not added on top: the third swing is exactly 1.5× a normal hit. */
const FIN_MUL=1.5;
const SWING_FX=new Set(['cres','thrust','star']);   // the game's swing light; replaced by the sword wave below
{const o=hitEnemy;hitEnemy=function(e,m){if(ST.mul&&ST.mul!==1){const a=Array.prototype.slice.call(arguments);a[1]=(m||0)*ST.mul;return o.apply(this,a);}return o.apply(this,arguments);};}
{const o=basicAttack;basicAttack=function(){
  if(!active()||ST.firing)return o.apply(this,arguments);
  const now=time;
  if(ST.anim&&now<ST.anim.t0+(segLen(ST.anim.k)-D.comboChain)/ST.anim.f)return;      // current swing still playing
  if(P.dead||P.dash||G.edit||P.casting||stunned())return o.apply(this,arguments);
  const k=(ST.anim||now-ST.lastEnd<D.comboReset)&&ST.combo<SEG.length-1?ST.combo+1:0;
  const A=SEG[k],f=speedNow();
  ST.combo=k;ST.anim={k,t0:now,f};ST.lastCombat=now;
  ST.pend={t:now+A.hit/f,args:arguments,self:this,end:now+segLen(k)/f,k};
  P.atkCd=segLen(k)/f;                                                         // keep autoplay / other code from swinging again
};}
function firePending(){
  const p=ST.pend;if(!p||time<p.t)return;ST.pend=null;
  if(P.dead||stunned()||P.dash||G.edit){ST.cancelled++;ST.anim=null;P.atkCd=0;return;}
  ST.firing=1;P.atkCd=0;
  let mul=1;
  try{const wt=P.weapon&&P.weapon.t,N=(typeof COMBO_N!=='undefined'&&COMBO_N[wt])||3;
    P.chain=p.k;P.lastAtk=time;                                              // game chain index = swing number
    const gameFin=p.k%N===N-1;
    if(p.k===SEG.length-1)mul=FIN_MUL/(gameFin?1.35:1);else if(gameFin)mul=1/1.35;}catch(e){}
  ST.mul=mul;
  const nFx=fx.length,nParts=parts.length;
  try{basicAttack.apply(p.self,p.args);}finally{ST.firing=0;ST.mul=1;}
  try{const near=o=>enemies.some(e=>Math.hypot((o.x||0)-e.x,(o.y||0)-e.y)<(e.sz||16)+26);
    for(let i=fx.length-1;i>=nFx;i--){const o=fx[i];if(o&&SWING_FX.has(o.k))fx.splice(i,1);}
    for(let i=parts.length-1;i>=nParts;i--){const o=parts[i];if(o&&!near(o))parts.splice(i,1);}
}catch(e){}
  P.atkCd=Math.max(0,p.end-time-D.comboChain/(ST.anim?ST.anim.f:1));
  ST.fired++;ST.lastMul=mul;
}
{const o=update;update=function(dt){const r=o.apply(this,arguments);try{if(active())firePending();}catch(e){}return r;};}
{const o=playerDeath;playerDeath=function(){ST.pend=null;ST.anim=null;return o.apply(this,arguments);};}

function choose(){
  const now=time;
  if(P.swing!==ST.lastSwing){ // skill swings (not the sword basic attack) — sword move 1 is used as a stand-in, not a final skill animation
    if(P.swing&&P.swing.type!=='cast'&&!ST.firing&&!ST.anim)ST.skillT0=now;ST.lastSwing=P.swing;}
  if(P.dead){if(ST.deadAt==null){ST.deadAt=now;ST.motes.length=0;ST.dissolve=0;}const c=D.clips.death,k=Math.floor((now-ST.deadAt)*c.fps);return ['death',Math.min(c.n-1,k)];}
  ST.deadAt=null;
  if(ST.ext){const r_=ST.ext(now);if(r_){ST.lastCombat=now;return r_;}}   // m37: skill clips (p222) — played through, no flinch
  if(P.hurtT>0&&!ST.anim){if(now-ST.hurtAt>.3)ST.hurtAt=now;ST.lastCombat=now;const c=D.clips.hurt,k=Math.floor((now-ST.hurtAt)*c.fps);if(k<c.n)return ['hurt',k];}
  if(ST.anim){const A=SEG[ST.anim.k],u=uOf(ST.anim,now);
    if(u<A.len){const c=D.clips[A.clip];return [A.clip,Math.min(c.n-1,Math.floor(u/A.len*c.n))];}
    ST.anim=null;ST.lastEnd=now;}
  if(now-ST.skillT0<SEG[0].len){const A=SEG[0],c=D.clips[A.clip];ST.lastCombat=now;return [A.clip,Math.min(c.n-1,Math.floor((now-ST.skillT0)/A.len*c.n))];}
  const sp=Math.hypot(P.vx,P.vy);
  if(sp>25||P.dash){const run=!!P.dash||sp>D.runSpeed;const c=D.clips[run?'run':'walk'];return [run?'run':'walk',Math.floor(now*c.fps)%c.n];}
  const stance=now-ST.lastCombat<3||!!P.casting;const c=D.clips[stance?'ready':'idle'];return [stance?'ready':'idle',Math.floor(now*c.fps)%c.n];
}

/* ---------- death dissolve: motes taken from the real pixels of the fallen body ---------- */
const DS={pts:{}};
function prepDissolve(){
  const F=D.frame,c=document.createElement('canvas');c.width=F.w;c.height=F.h;const g=c.getContext('2d',{willReadFrequently:true});
  const n=D.clips.death.n;
  for(let d=0;d<8;d++){const [sx,sy,w,h,ox,oy]=RC(cellOf('death',d,n-1));g.clearRect(0,0,F.w,F.h);g.drawImage(img,sx,sy,w,h,ox,oy,w,h);
    const px=g.getImageData(0,0,F.w,F.h).data,pts=[];
    for(let y=0;y<F.h;y+=4)for(let x=0;x<F.w;x+=4){const i=(y*F.w+x)*4;if(px[i+3]>160)pts.push([x,y,px[i],px[i+1],px[i+2]]);}
    for(let i=pts.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[pts[i],pts[j]]=[pts[j],pts[i]];}
    DS.pts[d]=pts.slice(0,170);}
}
const DZ=D.dissolve;   // {start, dur}
function drawDeath(x,y,fa){
  const now=time,t=now-ST.deadAt,F=D.frame,k=D.drawScale;
  if(t<DZ.start){draw(x,y,fa,1);return;}
  const u=Math.min(1,(t-DZ.start)/DZ.dur);
  if(u<1)draw(x,y,fa,Math.pow(1-u,1.6));
  const pts=DS.pts[ST.dir]||[],want=Math.floor(pts.length*Math.min(1,u*1.25));
  while(ST.motes.length<want){const p=pts[ST.motes.length];
    ST.motes.push({x:x+(p[0]-F.ax)*k,y:y+(p[1]-F.ay)*k,c:`rgb(${p[2]},${p[3]},${p[4]})`,t0:now,life:1.1+Math.random()*0.9,vy:-(26+Math.random()*46),ph:Math.random()*6.28,r:1.2+Math.random()*1.8});}
  ctx.save();
  for(const m of ST.motes){const a=(now-m.t0)/m.life;if(a>=1)continue;const yy=m.y+m.vy*(now-m.t0)-14*a*a,xx=m.x+Math.sin(m.ph+(now-m.t0)*3)*5*a;
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=(1-a)*.9;ctx.fillStyle=a<.35?m.c:'#d9fbff';ctx.beginPath();ctx.arc(xx,yy,m.r*(1-a*.4),0,6.283);ctx.fill();
    ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(1-a)*.45;ctx.fillStyle='#7fe8ff';ctx.beginPath();ctx.arc(xx,yy,m.r*2.4,0,6.283);ctx.fill();}
  ctx.restore();ST.dissolve=u;
}


/* ---------- sword wave: follows the real blade (hilt→tip positions exported from Blender per source frame) ---------- */
const TR=D.trails||{};
function bladeAt(clip,dirName,sf){const t=TR[clip]&&TR[clip][dirName];if(!t||!t.length)return null;
  const f0=t[0][0],i=Math.max(0,Math.min(t.length-1,sf-f0)),a=t[Math.floor(i)],b=t[Math.min(t.length-1,Math.floor(i)+1)],u=i-Math.floor(i);
  return [a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u,a[3]+(b[3]-a[3])*u,a[4]+(b[4]-a[4])*u];}
function toW(px,py){const A=ST.anchor,F=D.frame,k=D.drawScale;return [A.x+(px-F.ax)*k,A.y+(py-F.ay)*k];}
function ribbon(clip,dirName,sf){ // blade sweep over the last few source frames: outer edge = tip, inner edge = 45% down the blade
  const out=[],inn=[];let sp=0,prev=null;
  for(let s=sf-D.wave.window;s<=sf+1e-6;s+=.5){const b=bladeAt(clip,dirName,s);if(!b)return null;
    const T0=toW(b[2],b[3]),H=toW(b[0],b[1]),R_=D.wave.reach,T=[H[0]+(T0[0]-H[0])*R_,H[1]+(T0[1]-H[1])*R_],M=[H[0]+(T0[0]-H[0])*.45,H[1]+(T0[1]-H[1])*.45];out.push(T);inn.push(M);
    if(prev)sp+=Math.hypot(T[0]-prev[0],T[1]-prev[1]);prev=T;}
  return {out,inn,len:sp};}
function pal3(){try{const w=wpal();return [w.core||'#ffffff',w.main||'#7fe8ff',w.accent||w.main||'#bff6ff'];}catch(e){return ['#ffffff','#7fe8ff','#bff6ff'];}}
function fillRibbon(R,alpha,dx,dy,sc){if(!R||R.out.length<2)return;const c=pal3(),cx=R.out[R.out.length-1][0],cy=R.out[R.out.length-1][1];
  const P_=p=>[(p[0]-cx)*sc+cx+dx,(p[1]-cy)*sc+cy+dy];
  ctx.save();ctx.globalCompositeOperation='lighter';
  ctx.beginPath();R.out.forEach((p,i)=>{const q=P_(p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);});
  for(let i=R.inn.length-1;i>=0;i--){const q=P_(R.inn[i]);ctx.lineTo(q[0],q[1]);}ctx.closePath();
  const a=R.out[0],b=R.out[R.out.length-1],g=ctx.createLinearGradient(P_(a)[0],P_(a)[1],P_(b)[0],P_(b)[1]);
  g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.55,c[1]);g.addColorStop(1,c[0]);
  ctx.globalAlpha=alpha*.55;ctx.fillStyle=g;ctx.fill();
  ctx.globalAlpha=alpha;ctx.strokeStyle=c[0];ctx.lineWidth=1.6;ctx.beginPath();R.out.forEach((p,i)=>{const q=P_(p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);});ctx.stroke();
  ctx.restore();}
function drawBladeTrail(){const A=ST.anim;if(!A||!ST.anchor)return;const S_=SEG[A.k],u=uOf(A,time);if(u>=S_.len)return;
  const sf=S_.src[0]+u*30,R=ribbon(S_.clip,ORDER[ST.dir],sf);if(!R)return;
  const a=Math.min(1,Math.max(0,(R.len-D.wave.minLen)/D.wave.fullLen));if(a>0.02)fillRibbon(R,a,0,0,1);}
function releaseWave(){const A=ST.anim;if(!A||!ST.anchor)return;const S_=SEG[A.k],u=uOf(A,time),sf=S_.src[0]+u*30;
  const R=ribbon(S_.clip,ORDER[ST.dir],sf);if(!R||R.len<D.wave.minLen*.5)return;
  ST.waves.push({R,t0:time,dx:Math.cos(P.face),dy:Math.sin(P.face)*.7,fin:A.k===SEG.length-1});}
function drawWaves(){for(let i=ST.waves.length-1;i>=0;i--){const w=ST.waves[i],t=(time-w.t0)/D.wave.life;if(t>=1){ST.waves.splice(i,1);continue;}
  const d=D.wave.dist*(w.fin?1.35:1)*(1-Math.pow(1-t,2));fillRibbon(w.R,(1-t)*(w.fin?1:.85),w.dx*d,w.dy*d,1+t*.35);}}
function draw(x,y,fa,alpha){
  if(!ready)return false;
  ST.dir=pickDir(fa);const [clip,i]=choose();ST.clip=clip;ST.frame=i;
  const F=D.frame,k=D.drawScale,R_=RC(cellOf(clip,ST.dir,i)),[sx,sy,w,h,ox,oy]=R_;
  ctx.save();if(alpha!=null&&alpha<1)ctx.globalAlpha*=alpha;
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.drawImage(R_[6]?img2:img,sx,sy,w,h,x+(ox-F.ax)*k,y+(oy-F.ay)*k,w*k,h*k);
  ctx.restore();
  ST.anchor={x,y};
  if(alpha==null){try{drawBladeTrail();}catch(e){}}
  ST.draws++;return true;
}
ST.draw=draw;
ST.drawCell=function(clip,dir,i,x,y,alpha,comp){const r=RC(cellOf(clip,dir,i)),F=D.frame,k=D.drawScale;ctx.save();ctx.globalAlpha*=alpha;if(comp)ctx.globalCompositeOperation=comp;
  ctx.imageSmoothingEnabled=true;ctx.drawImage(r[6]?img2:img,r[0],r[1],r[2],r[3],x+(r[4]-F.ax)*k,y+(r[5]-F.ay)*k,r[2]*k,r[3]*k);ctx.restore();};   // m37: after-images
/* body: route drawPlayer_v1 through its sprite branch; the old 2D weapon / hand / pixel hero are not drawn for the new body */
{const o=drawPlayer_v1;drawPlayer_v1=function(){
  if(!active())return o.apply(this,arguments);
  const hadOvr=Object.prototype.hasOwnProperty.call(SPR_OVR,'player'),ov=SPR_OVR.player;
  const dW=drawWeapon,gH=gripHand,uH=useHero;
  SPR_OVR.player={hero3d:1};drawWeapon=function(){};gripHand=function(){};useHero=function(){return false;};
  try{return o.apply(this,arguments);}
  finally{if(hadOvr)SPR_OVR.player=ov;else delete SPR_OVR.player;drawWeapon=dW;gripHand=gH;useHero=uH;}
};}
{const o=drawPlayerSprite;drawPlayerSprite=function(x,y,bob,fa){
  const ov=SPR_OVR.player;if(ov&&ov.hero3d){draw(x,y+D.footY,fa);return;}return o.apply(this,arguments);};}
{const o=drawPlayer;drawPlayer=function(){
  const r=o.apply(this,arguments);
  if(active()&&P.dead){try{const t=time-(ST.deadAt==null?time:ST.deadAt);if(t<DZ.start+DZ.dur*.6)ell(P.x,P.y+10,22,7,'#000000',.4*(1-Math.max(0,t-DZ.start)/DZ.dur));
    if(ST.deadAt==null)choose();drawDeath(P.x,P.y+D.footY,P.face+camY());}catch(e){}}
  return r;};}
})();
