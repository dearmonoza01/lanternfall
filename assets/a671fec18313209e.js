
/* ---- candidate_sword_atk5_r18: p242 r8 Sword attack skill 4 "ดาบพิพากษา" hold-to-charge giant light blade (TEST only) ---- */
/* p242 r7 — ALL 8 DIRECTIONS (user 14 Oct 13:36, E r6 approved): the slash uses the real SK4_judgment_r2 frames of every direction (Blender Pivot rotation, no mirror, no re-timing: __SK4ANIM_DIRS). The blade / pattern geometry is the same E-local data turned by the direction (verified against the per-direction render data, < 0.2 mm). Front / back layers of the blade follow the camera depth of each part of the blade (E keeps the r6 drawing). Nothing else changed: charge 2 s, 250-700 %, reach, sweep area, MP 30 / CD 15.
   p242 r6 — (r6, user 14 Oct 13:12: ONLY colours/drawing of the charge fill: deep translucent gold body, dull-gold unfilled grooves, warm-white core + bright gold edge when filled, an energy head running up every groove; nothing else changed.)
   p242 r5 — Sword ATTACK skill 4 "ดาบพิพากษา" (candidate_sword_atk4_r5, TEST only, continues r4: ONLY the light-blade art + the charge fill changed, see r5 below). Not merged, not published.
   window.__SKATK4, cast / cooldown / ctx id 'wsAtk4', key N (hold). Nothing of skill 1, skill 2, the buff, the passives or "วังวนเจ็ดคม" is touched.
   r2 (user 13 Oct 21:43), direction E first:
     1 RANGE = THE REAL LIGHT BLADE. The fixed 120 x 70 px area is gone. The blade length Lg (metres, hilt -> tip) is a function of the charge:
         Lg(u) = heroM x (lenMin .. lenFull, smoothstep(u)) ; the drawn blade and the hit test read the SAME blade state (bladeAtTau(): hilt, axis, Lg).
       The hit area is what the blade sweeps: for every 1/120 s of the downswing the part of the blade that is low enough (0 <= Z <= zMax) is projected onto the ground as a segment
       (render metres -> game px with the same PXM the sprite uses, NOT the screen height); a monster is hit once per cast if it is within half-width + its size of any of those segments.
       Walls block (LOS from the hero, blocked()). Damage 250..500 % (linear in the hold time), MP 30, CD 15, full charge 1.0 s as before. Fragments never damage.
     2 SLASH = a new Blender action (SK4_judgment_r1, 30 frames, __SK4ANIM): brace -> hips and chest lead -> arms and sword follow -> crouch to absorb. The blade keeps its length and
       sweeps down from the hand (axis taken from the sprite sword frame by frame, interpolated at quarter frames); it is NEVER shrunk to aim at the impact point.
       Uniform playback of the action (the easing lives in its keys), no image cross-fade as the smoothing method. Other 7 directions: fallback (old frames), not part of this round.
     3 BREAK. Impact = the first moment the blade tip touches the ground. White-gold flash, then the light body tears from the tip towards the hand, section by section, into curved ribbons and
       soft light fragments of different sizes that keep moving with the swing (drag + a little gravity) and fade one by one. Light trail along the swing, soft dust + soil at the contact point.
   r3 (user 14 Oct 09:16), direction E first, slash pose + the FX that follow it:
     4 WIND-BACK after the charge (new Blender action SK4_judgment_r2, 35 frames = .17 s wind-back + slash + absorb + follow-through): on release / full charge the sword goes round over the head to the back,
       chest opens and twists, hips go back, knees bend, the hand rests high above the shoulder, then the leg push -> hips/chest -> arm whip, hand arc from behind the head down to the front, absorb, follow-through, ready.
       The light blade keeps its length and follows the hand through the wind-back (axis from the action, no shrink, no jump); the trail draws the wind-back arc (dimmer) and then the sweep.
       NO damage before action frame hitFrom (7): the wind-back never hits; one hit per monster, only in the forward slash.
     5 CHARGE 2 s (was 1 s): multiplier = 2.5 + 4.5 x clamp(hold / 2, 0, 1)  (0 / 1 / 2 s = 250 / 475 / 700 %). The wind-back adds nothing. Gather + blade growth + reach all run over the 2 s. Max blade length unchanged. MP 30, CD 15 s, once.
   r4 (user 14 Oct 11:43): LIGHT BLADE SHAPE only (pose, wind-back, timing, damage, reach, charge 2 s, MP/CD untouched): a clear giant sword blade following the 3-panel concept picture:
     broad base (shoulder) -> straight side edges -> long tapering pointed tip ; warm-white core, gold body (two tones = the two faces of the blade), orange rim ; much less glow (no soft halo polygons, shadowBlur 2),
     a small light cross-guard at the hilt joined to the sword in the hand. The shape is kept all through the downswing; after the impact the torn ribbons / fragments are cut from the same outline.
   r5 (user 14 Oct 12:26): LIGHT BLADE ART + CHARGE FILL only (pose, wind-back, timing, damage 250-700 %, reach, charge 2 s, MP/CD, blade silhouette untouched):
     the blade carries a symmetric geometric pattern that is part of the sword (centre ridge + nested V grooves along the blade + a large diamond near the hilt), big plain lines, no random texture.
     CHARGE: at the start the outline and the pattern are faint dark gold; the power starts at the hilt and flows up the ridge / grooves to the tip; the filled part goes orange -> gold -> warm white with the charge level,
     the unfilled part stays dark gold (filled / not filled clearly different); a gold shadow line under every pattern line keeps the depth. Full charge: pattern fully connected, one flash, then the same wind-back + slash.
     SLASH: the pattern stays on the blade through the wind-back and the sweep and warms towards white; after the impact the unbroken part keeps the pattern and tears with the light body.
   All numbers live in __SKATK4.cfg. Debug: window.__SKATK4 (L.debug = true draws the swept area over the blade). */
(function(){
'use strict';
const L=window.__SKATK4={ver:'p242-r8',err:null,test:false,fx:true,debug:false,log:[],refused:[],casts:0,state:null,last:null,hitLog:[],dirs:{},frames:0,lastFrame:null,held:false};
try{
const A0=window.__SK1ANIM,AD=window.__SK1ANIM_DIRS||{},A4=window.__SK4ANIM||null,A4D=window.__SK4ANIM_DIRS||{},HD=window.__HERO3D,H=window.HERO3D,TL=window.TLOCK;
if(!A0||!HD||!H||!window.C182||!C182.api||!TL||typeof hitEnemy!=='function'||typeof update!=='function'||typeof blocked!=='function'||typeof drawPlayerSprite!=='function'||typeof playerDeath!=='function'||typeof aimPoint!=='function'){L.err='hooks missing '+[!A0&&'__SK1ANIM',!HD&&'__HERO3D',!H&&'HERO3D',!window.C182&&'C182',!TL&&'TLOCK'].filter(Boolean).join(',');return;}
/* ---------------- config (single place) ---------------- */
const CFG=L.cfg={id:'wsAtk4',name:'ดาบพิพากษา',key:'N',
  cost:{mp:30,cd:15},                          // trial values, charged once when the command is accepted
  charge:{max:2.0,minWind:.35},                // s: full charge / the shortest wind-up before a slash may start (= the time the blade needs to come up)
  damage:{min:2.5,max:7.0},                    // x the real basic swing = 2.5 + 4.5 x clamp(hold/2,0,1): hold 0 / 1 / 2 s = 250 / 475 / 700 %
  area:{half:35,zMax:1.5},                     // px half width of the swept strip (monster size added) / only the part of the blade lower than this (m) cuts
  slash:{speed:1.0,windF:6,hitFrom:7,hitUntil:16,sub:1/120,tipZ:.02},   // action playback speed (1 = 30 fps) / action frames in which the blade may hit / sweep step / tip height that counts as contact
  time:{end:34/30},                            // s after the slash starts: end of the recovery (action frame 35); the wind-back is frames 1-6 (.17 s)
  pose:{f0:28,f1:39,rise:.35},                 // charge pose frames (old r12 action) and the time the blade needs to come up
  fx:{heroM:1.78,lenMin:1.3,lenFull:3.5,wMin:7,wFull:24,sections:16,streaks:34,motes:36,chips:14,shake:[2,8],hold:.95}};
const ss=u=>u<=0?0:u>=1?1:u*u*(3-2*u),cl=(v,a,b)=>v<a?a:v>b?b:v,clk=()=>typeof time==='number'?time:performance.now()/1000;
const wrapA=d=>Math.atan2(Math.sin(d),Math.cos(d));
const DN=['E','SE','S','SW','W','NW','N','NE'],DATA=DN.map((n,i)=>i===0?A0:AD[n]||null),IMG=DATA.map(d=>{if(!d)return null;const im=new Image();im.src=d.src;return im;});
const DATA4=DN.map((n,i)=>i===0?A4:A4D[n]||null),IMG4=DATA4.map(d=>{if(!d)return null;const im=new Image();im.src=d.src;return im;});
const A4C=window.__SK4CHG_DIRS||{},DATAC=DN.map((n,i)=>i===0?null:A4C[n]||null),IMGC=DATAC.map(d=>{if(!d)return null;const im=new Image();im.src=d.src;return im;});   // r8: re-posed charge frames (SK1 f28..39 + sword arm lifted) for SW / W only
const okI=im=>im&&im.complete&&im.naturalWidth;
const F=HD.frame,K=HD.drawScale,F0=A0.f0,N=A0.n,AF=(A4||A0).aff,CD=(A4||A0).camdir,O=(A4||A0).origin_px;
const PXM=AF.x[0]*K,ZPX=-AF.z[1]*K;         // game px per render metre on the ground / per metre of height (same numbers the sprite is drawn with)
const XA=(F.ax-O[0])/AF.x[0],YA=(F.ay-O[1])/AF.y[1];   // render-world ground point under the sprite anchor = the hero's position
const dirIdx=g=>{const a=Math.atan2(Math.sin(g),Math.cos(g));return ((Math.round(a/(Math.PI/4))%8)+8)%8;};
const camYaw=()=>{try{return typeof camY==='function'?camY():0;}catch(e){return 0;}};
const fdOf=d=>d*Math.PI/4-camYaw();            // game angle the sprite of direction d looks along
const swordNow=()=>!!(P&&P.weapon&&P.weapon.t==='sword');
const UID=new WeakMap();let uidN=0;const uid=e=>{let v=UID.get(e);if(!v){v=++uidN;UID.set(e,v);}return v;};
const liveE=e=>!!(e&&!e.dead&&e.hp>0&&!e.dev&&!e.sprGhost&&!e.rush&&!e.removed);
const dirOk=d=>!!DATA[d];
let S=null,castN=0,V=null;   // S = the live cast, V = what the FX draw (survives a normal finish for a short tail)
function refuse(why){L.refused.push({t:+clk().toFixed(2),why});if(L.refused.length>30)L.refused.shift();try{textAt(P.x,P.y-62,'ดาบพิพากษา: '+why,'#ffb4a8',13);}catch(e){}return false;}
function los(x0,y0,x1,y1,stopShort){const Ln=Math.hypot(x1-x0,y1-y0),n=Math.max(1,Math.ceil((Ln-stopShort)/8));for(let i=1;i<=n;i++){const u=Math.min(1,(i*8)/Ln);if(u*Ln>Ln-stopShort)break;if(blocked(x0+(x1-x0)*u,y0+(y1-y0)*u,2))return false;}return true;}
const dmgMul=u=>CFG.damage.min+(CFG.damage.max-CFG.damage.min)*cl(u,0,1);
/* THE blade length (metres, hilt -> tip) for a charge u 0..1 : one function for the picture, the hit test, the window text */
const lenOf=u=>{const C=CFG.fx;return C.heroM*(C.lenMin+(C.lenFull-C.lenMin)*ss(cl(u,0,1)));};
L.reach=u=>{const m=lenOf(u);return {m:+m.toFixed(2),px:Math.round(m*PXM)};};
/* ---------------- damage context (same rule as the other skills: base = the real basic swing of the equipped weapon) ---------------- */
function castCtx(){
  const API=window.C182&&C182.api;if(!API||!API.ctxFor){L.err='ctx: C182 missing';return null;}
  const wt=P.weapon&&P.weapon.t,wd=API.D().weapons&&API.D().weapons[wt],W_=WEAPONS[wt]||{};
  if(!wd){L.err='ctx: no weapon data '+wt;return null;}
  const basic=wd.actionCoef*wd.weights.reduce((a,b)=>a+b,0),mx=Math.round(lenOf(1)*PXM)+80;
  const def={id:CFG.id,mode:'native',coefTotal:basic,flatTotal:0,weights:[1],maxTargets:99,targeting:'around',element:'Neutral',range:mx};
  const c=API.ctxFor('skill',CFG.id,def,{dt:W_.magic?'mag':'phys',lvScale:1,m0:1,reach:mx+200,cdId:CFG.id});
  c.atk4={wt,basic};return c;}
/* ---------------- aim ---------------- */
function aimAngle(){
  try{TL.check();const e=TL.e;if(e&&liveE(e))return Math.atan2(e.y-P.y,e.x-P.x);}catch(err){}
  try{const a=aimPoint();if(a&&(Math.abs(a.x-P.x)+Math.abs(a.y-P.y))>4)return Math.atan2(a.y-P.y,a.x-P.x);}catch(err){}
  return (typeof P.face==='number')?P.face:0;}
/* ---------------- cast: press / release ---------------- */
function press(src){
  if(!L.test)return refuse('ใช้ได้เฉพาะโหมดทดสอบ');
  if(!P||P.dead||G.state!=='play'||G.edit||G.win)return refuse('ใช้ไม่ได้ตอนนี้');
  if(!swordNow())return refuse('ต้องถือดาบ');
  if(!DATA.some((d,i)=>dirOk(i)&&IMG[i]&&okI(IMG[i])))return refuse('ภาพยังโหลดไม่เสร็จ');
  if(S)return refuse('กำลังร่าย (ไม่คิดซ้ำ)');
  if((P.cds[CFG.id]||0)>0)return refuse(`คูลดาวน์ ${P.cds[CFG.id].toFixed(1)} วิ`);
  if(P.dash||P.casting)return refuse('กำลังทำท่าอื่น');
  for(const n of ['__SK1','__SK2L','__SK3','__SKATK3']){const m=window[n];if(m&&m.state)return refuse('กำลังทำท่าอื่น');}
  if(P.mp<CFG.cost.mp)return refuse('MP ไม่พอ');
  const ctx=castCtx();if(!ctx)return refuse('ระบบดาเมจยังไม่พร้อม');
  P.mp-=CFG.cost.mp;P.cds[CFG.id]=CFG.cost.cd;                              // once per cast, never refunded
  const a=aimAngle();
  S={id:++castN,t:0,phase:'charge',src:src||'api',face:a,d:dirIdx(a+camYaw()),zone:G.zone,ctx,reg:new Set(),rel:false,relT:null,ts:null,u:0,hit:null,dmg:[],ended:null,atk0:P.atkCd||0,sx:P.x,sy:P.y,moved:0,full:false,tFull:null,Lg:0,delta:0,imp:null,sweep:[],contacts:[],tauDone:0,reachPx:0};
  P.face=a;P.dash={vx:0,vy:0,t:99,atk4:1,hit:new Set()};
  V=S;L.casts++;L.state=S;L.held=true;L.log.push({cast:S.id,t0:+clk().toFixed(2),src:S.src,face:+a.toFixed(3)});return true;}
L.press=press;L.cast=()=>press('api');
L.release=()=>{L.held=false;if(S&&S.phase==='charge'&&!S.rel){S.rel=true;S.relT=Math.min(S.t,CFG.charge.max);return true;}return false;};
L.cancelInput=why=>{L.held=false;if(S&&S.phase==='charge'&&!S.rel){finish(why||'input cancelled');return true;}return false;};
let TAILEND=0;
function finish(why){if(!S)return;S.ended=why;L.log.push({cast:S.id,end:why,t:+S.t.toFixed(3),phase:S.phase,u:+S.u.toFixed(3),hit:S.dmg.length});
  try{if(P&&P.dash&&P.dash.atk4)P.dash=null;if(P){P.vx=0;P.vy=0;P.atkCd=Math.max(0,S.atk0-S.t);}}catch(e){}
  S.endAt=clk();L.last=S;L.held=false;S.over=true;
  if(why==='done'){S.tEnd=S.t;TAILEND=clk()+CFG.fx.hold;}else{V=null;PRT.length=0;}
  S=null;L.state=null;}
L.cancel=finish;
/* ================================================= geometry ================================================= */
/* render world (metres, relative to the hero): X = forward (facing E = screen right), Y = depth (+Y = screen up), Z = up.  game offset = f*X*PXM + n*(-Y)*PXM, n = (-f.y,f.x) */
function unproj(p){const M=[[AF.x[0],AF.y[0],AF.z[0]],[AF.x[1],AF.y[1],AF.z[1]],[CD[0],CD[1],CD[2]]],v=[p[0]-O[0],p[1]-O[1],p[2]-O[2]];
  const d=(a,b,c)=>a[0]*(b[1]*c[2]-b[2]*c[1])-a[1]*(b[0]*c[2]-b[2]*c[0])+a[2]*(b[0]*c[1]-b[1]*c[0]);
  const D=d(M[0],M[1],M[2]),col=i=>M.map((r,j)=>r.map((x,k)=>k===i?v[j]:x));return [0,1,2].map(i=>{const m=col(i);return d(m[0],m[1],m[2])/D;});}
const MEM=new Map();
function axisOf(Q){let r=MEM.get(Q);if(!r){const h=unproj(Q[0]),t=unproj(Q[5]),d=[t[0]-h[0],t[1]-h[1],t[2]-h[2]],l=Math.hypot(d[0],d[1],d[2]);r={h:[h[0]-XA,h[1]-YA,h[2]],u:[d[0]/l,d[1]/l,d[2]/l]};MEM.set(Q,r);}return r;}
/* r8: per-direction axis for the re-posed SW / W frames: the direction's own render data (its own camera affine), turned into the hero-local frame (fwd, left, up). For E the maths gives exactly axisAt(). */
function unprojD(D,p){const AFd=D.aff||D.aff_px_per_m,Od=D.origin_px,CDd=D.camdir,M=[[AFd.x[0],AFd.y[0],AFd.z[0]],[AFd.x[1],AFd.y[1],AFd.z[1]],[CDd[0],CDd[1],CDd[2]]],v=[p[0]-Od[0],p[1]-Od[1],p[2]-Od[2]];
  const d=(a,b,c)=>a[0]*(b[1]*c[2]-b[2]*c[1])-a[1]*(b[0]*c[2]-b[2]*c[0])+a[2]*(b[0]*c[1]-b[1]*c[0]);
  const Dt=d(M[0],M[1],M[2]),col=i=>M.map((r,j)=>r.map((x,k)=>k===i?v[j]:x));return [0,1,2].map(i=>{const m=col(i);return d(m[0],m[1],m[2])/Dt;});}
const MEMD=new Map();
function axisOfD(D,Q){let m=MEMD.get(D);if(!m){m=new Map();MEMD.set(D,m);}let r=m.get(Q);if(!r){
  const th=(D.theta==null?90:D.theta)*Math.PI/180,fx=Math.sin(th),fy=-Math.cos(th),lx=-fy,ly=fx,loc=w=>[w[0]*fx+w[1]*fy,w[0]*lx+w[1]*ly,w[2]];
    const h=loc(unprojD(D,Q[0])),t=loc(unprojD(D,Q[5])),g=[XA,YA,0],d=[t[0]-h[0],t[1]-h[1],t[2]-h[2]],l=Math.hypot(d[0],d[1],d[2]);
  r={h:[h[0]-g[0],h[1]-g[1],h[2]],u:[d[0]/l,d[1]/l,d[2]/l]};m.set(Q,r);}return r;}
function axisAtD(D,fr){const lo=D.f0,hi=D.f0+D.n-1;fr=cl(fr,lo,hi);let k=Math.floor(fr*4+1e-9)/4;if(k>hi)k=hi;const k2=Math.min(k+.25,hi),w=cl((fr-k)*4,0,1),a=axisOfD(D,D.q[k.toFixed(2)]),b=axisOfD(D,D.q[k2.toFixed(2)]);
  if(w<=0)return a;const u=[a.u[0]+(b.u[0]-a.u[0])*w,a.u[1]+(b.u[1]-a.u[1])*w,a.u[2]+(b.u[2]-a.u[2])*w],l=Math.hypot(u[0],u[1],u[2]);
  return {h:[a.h[0]+(b.h[0]-a.h[0])*w,a.h[1]+(b.h[1]-a.h[1])*w,a.h[2]+(b.h[2]-a.h[2])*w],u:[u[0]/l,u[1]/l,u[2]/l]};}
const axC=(d,cf)=>DATAC[d]?axisAtD(DATAC[d],cf):axisAt(A0,cf);                 // charge pose axis (re-posed SW / W use their own data)
const axS=(d,nf)=>(DATAC[d]&&nf<=5&&DATA4[d])?axisAtD(DATA4[d],nf):axisAt(A4,nf);   // slash axis: only the first frames (arm lift fades out by f4) differ from the E data turned
function axisAt(A,fr){   // hilt + unit axis (hero-local metres) at a fractional action frame, interpolated between the quarter-frame keys
  const lo=A.f0,hi=A.f0+A.n-1;fr=cl(fr,lo,hi);let k=Math.floor(fr*4+1e-9)/4;if(k>hi)k=hi;const k2=Math.min(k+.25,hi),w=cl((fr-k)*4,0,1),a=axisOf(A.q[k.toFixed(2)]),b=axisOf(A.q[k2.toFixed(2)]);
  if(w<=0)return a;const u=[a.u[0]+(b.u[0]-a.u[0])*w,a.u[1]+(b.u[1]-a.u[1])*w,a.u[2]+(b.u[2]-a.u[2])*w],l=Math.hypot(u[0],u[1],u[2]);
  return {h:[a.h[0]+(b.h[0]-a.h[0])*w,a.h[1]+(b.h[1]-a.h[1])*w,a.h[2]+(b.h[2]-a.h[2])*w],u:[u[0]/l,u[1]/l,u[2]/l]};}
let AN=null,CAL=[0,0];
/* render-local point -> screen (absolute), for the sprite facing fd */
function scr(fd,p){const fw=p[0]*PXM,lt=-p[1]*PXM,c=Math.cos(fd),s=Math.sin(fd),o=wl(c*fw-s*lt,s*fw+c*lt);return [AN.x+CAL[0]+o[0],AN.y+CAL[1]+o[1]-p[2]*ZPX];}
function calib(){   // the one constant offset between the maths and the drawn sprite (hilt of the first slash frame, E)
  const q=(A4||A0).q[A4?'1.00':'39.00'],a=axisOf(q),pb=[(q[0][0]-F.ax)*K,(q[0][1]-F.ay)*K],fd=-camYaw(),fw=a.h[0]*PXM,lt=-a.h[1]*PXM,c=Math.cos(fd),s=Math.sin(fd),o=wl(c*fw-s*lt,s*fw+c*lt);
  CAL=[pb[0]-o[0],pb[1]-(o[1]-a.h[2]*ZPX)];}
/* r7 (directions other than E): the hilt is pinned to the hand pixel of the sprite that is drawn (per-direction render data), because the baked sprite uses its own camera tilt (ratio .53) while the game ground uses CAM.tilt: a hilt placed through the game ground would float off the hand in the directions where the hand offset runs in depth. The blade VECTOR keeps the game ground mapping (hit geometry unchanged). E keeps the r6 drawing. */
function handPx(d,kind,fr){if(d===0)return null;const D=kind===4?DATA4[d]:(DATAC[d]||DATA[d]);if(!D||!D.q)return null;const lo=D.f0,hi=D.f0+D.n-1;fr=cl(fr,lo,hi);let k=Math.floor(fr*4+1e-9)/4;if(k>hi)k=hi;const k2=Math.min(k+.25,hi),w=cl((fr-k)*4,0,1),a=D.q[k.toFixed(2)],b=D.q[k2.toFixed(2)];if(!a||!b)return null;
  const x=a[0][0]+(b[0][0]-a[0][0])*w,y=a[0][1]+(b[0][1]-a[0][1])*w;return [(x-F.ax)*K,(y-F.ay)*K];}
/* the blade state: hilt + axis (axis yawed by delta = aim - sprite direction), length Lg */
function mkBlade(ax,s,Lg,hp){const d=s.delta||0,c=Math.cos(d),sn=Math.sin(d),lt=-ax.u[1],fw2=ax.u[0]*c-lt*sn,lt2=ax.u[0]*sn+lt*c;return {h:ax.h,u:[fw2,-lt2,ax.u[2]],Lg,hp:hp||null};}
const NF=A4?A4.n:30,nfOf=tau=>cl(1+tau*30*CFG.slash.speed,1,NF);
function bladeAtTau(s,tau){const nf=nfOf(tau);return Object.assign(mkBlade(axS(s.d,nf),s,s.Lg,handPx(s.d,4,nf)),{nf,tau});}
const tipOf=b=>[b.h[0]+b.u[0]*b.Lg,b.h[1]+b.u[1]*b.Lg,b.h[2]+b.u[2]*b.Lg];
function bladeScr(b,fd){const a0=scr(fd,b.h),t0=scr(fd,tipOf(b)),a=b.hp?[AN.x+b.hp[0],AN.y+b.hp[1]]:a0,t=[a[0]+t0[0]-a0[0],a[1]+t0[1]-a0[1]];return {hx:a[0],hy:a[1],ang:Math.atan2(t[1]-a[1],t[0]-a[0]),len:Math.hypot(t[0]-a[0],t[1]-a[1])};}
/* hero-local (render m) -> (al,pe) px in the frame of the sprite direction */
const gpx=p=>[p[0]*PXM,-p[1]*PXM];
/* ---------------- the hit: what the blade sweeps ---------------- */
function lowSeg(b){   // part of the blade (s in metres from the hilt) that is between the ground and zMax, clipped to the blade length and the ground
  const z0=b.h[2],uz=b.u[2],zM=CFG.area.zMax;let lo=0,hi=b.Lg;
  if(uz<0){const sg=z0/(-uz);if(sg<hi)hi=Math.max(0,sg);}
  if(Math.abs(uz)<1e-5){if(z0<0||z0>zM)return null;}
  else{const a=(0-z0)/uz,c=(zM-z0)/uz,l=Math.min(a,c),h=Math.max(a,c);lo=Math.max(lo,l);hi=Math.min(hi,h);}
  if(hi<lo)return null;return [lo,hi];}
function segPx(b,lo,hi){const a=[b.h[0]+b.u[0]*lo,b.h[1]+b.u[1]*lo],c=[b.h[0]+b.u[0]*hi,b.h[1]+b.u[1]*hi];return [gpx(a),gpx(c)];}
function hitTest(b,tau){
  const lw=lowSeg(b);if(!lw)return;const sg=segPx(b,lw[0],lw[1]),fd=fdOf(S.d),cf=Math.cos(fd),sf=Math.sin(fd),half=CFG.area.half;
  if(S.sweep.length<400)S.sweep.push({tau:+tau.toFixed(4),a:sg[0],b:sg[1]});
  S.reachPx=Math.max(S.reachPx,sg[0][0],sg[1][0]);
  const dx=sg[1][0]-sg[0][0],dy=sg[1][1]-sg[0][1],ln=Math.hypot(dx,dy),ux=ln>1e-6?dx/ln:1,uy=ln>1e-6?dy/ln:0;
  for(const e of enemies.slice()){
    if(!liveE(e))continue;const key=S.id+':'+uid(e);if(S.reg.has(key))continue;const sz=e.sz||16,ex=e.x-P.x,ey=e.y-P.y,al=ex*cf+ey*sf,pe=-ex*sf+ey*cf;
    const rx=al-sg[0][0],ry=pe-sg[0][1],along=rx*ux+ry*uy,perp=Math.abs(-rx*uy+ry*ux);
    if(along<-sz||along>ln+sz||perp>half+sz)continue;
    if(!los(P.x,P.y,e.x,e.y,sz))continue;                                     // walls block
    S.reg.add(key);const m=dmgMul(S.u),hp0=e.hp,prev=C182.cur;let pl;try{pl=wpal();}catch(_){}C182.cur=S.ctx;
    try{hitEnemy(e,m,{dt:S.ctx.dt,pl,ctx:S.ctx,b3:0});}catch(err){L.err='dmg '+err.message;}finally{C182.cur=prev;}
    S.dmg.push({id:uid(e),m:+m.toFixed(3),coef:+(S.ctx.def.coefTotal*m).toFixed(3),cast:S.ctx.seq,hpLoss:Math.round(hp0-e.hp),tau:+tau.toFixed(3),al:Math.round(al),pe:Math.round(pe),nf:+b.nf.toFixed(2)});
    S.contacts.push({al,pe,sz,t:S.t});
    if(!S.hit)S.hit={t:+(S.t).toFixed(3),m:+m.toFixed(3),u:+S.u.toFixed(3),list:[]};S.hit.list.push(uid(e));
    L.hitLog.push({cast:S.id,seq:S.ctx.seq,u:+S.u.toFixed(3),m:+m.toFixed(3),n:1,t:+S.t.toFixed(3),id:uid(e)});if(L.hitLog.length>300)L.hitLog.shift();}}
function scanNow(){const fd=fdOf(S.d),cf=Math.cos(fd),sf=Math.sin(fd);return enemies.filter(liveE).slice(0,30).map(e=>{const ex=e.x-P.x,ey=e.y-P.y;return {id:uid(e),al:Math.round(ex*cf+ey*sf),pe:Math.round(-ex*sf+ey*cf),sz:e.sz||16,hit:S.reg.has(S.id+':'+uid(e))};});}
/* ---------------- one step per frame (after the game's own update) ---------------- */
const chargeFrame=tc=>CFG.pose.f0+(CFG.pose.f1-CFG.pose.f0)*ss(tc/CFG.pose.rise);
function startSlash(){
  S.phase='slash';S.ts=S.t;const hold=S.rel?S.relT:Math.min(S.t,CFG.charge.max);S.u=cl(hold/CFG.charge.max,0,1);S.holdAtSlash=hold;S.Lg=lenOf(S.u);
  S.delta=wrapA(S.face-fdOf(S.d));S.lock=true;                                 // direction locked: S.face / S.d stay as they are now
  S.full=S.u>=.999;S.mode4=!!(DATA4[S.d]&&okI(IMG4[S.d]));S.tauDone=0;}
function sweep(t0,t1){
  const sub=CFG.slash.sub;let tau=t0;
  while(tau<t1-1e-9&&S&&!S.imp){tau=Math.min(t1,tau+sub);const b=bladeAtTau(S,tau);
    if(b.nf>=CFG.slash.hitFrom)hitTest(b,tau);
    const tz=tipOf(b)[2];
    if(tz<=CFG.slash.tipZ||b.nf>=CFG.slash.hitUntil){
      let lo=Math.max(t0,tau-sub),hi=tau;                                         // find the exact moment the tip touches the ground (the blade keeps its full length)
      if(tz<=CFG.slash.tipZ&&lo<hi){for(let i=0;i<16;i++){const m=(lo+hi)/2;if(tipOf(bladeAtTau(S,m))[2]<=CFG.slash.tipZ)hi=m;else lo=m;}}
      const bc=bladeAtTau(S,hi);hitTest(bc,hi);doImpact(bc,hi);break;}}}
function step(dt){
  if(!S)return;
  if(!P||P.dead){finish('hero died');return;}
  if(G.zone!==S.zone||G.state!=='play'){finish('left the map');return;}
  if(!swordNow()){finish('weapon changed');return;}
  if(S.phase==='charge'&&G.win&&!S.rel){finish('menu opened');return;}
  if(!P.dash||!P.dash.atk4)P.dash={vx:0,vy:0,t:99,atk4:1,hit:new Set()};
  P.dash.vx=0;P.dash.vy=0;P.dash.t=99;P.vx=0;P.vy=0;
  S.moved+=Math.hypot(P.x-S.sx,P.y-S.sy);
  if(!(P.atkCd>.2))P.atkCd=.2;
  S.t+=dt;
  if(S.phase==='charge'){
    S.face=aimAngle();S.d=dirIdx(S.face+camYaw());P.face=S.face;                // aim is free while charging
    if(S.t>=CFG.charge.max&&S.tFull==null)S.tFull=S.t;
    if((S.rel&&S.t>=CFG.charge.minWind)||S.t>=CFG.charge.max)startSlash();}
  else{P.face=S.face;}
  if(S.phase==='slash'){
    const tau=S.t-S.ts;if(!S.imp)sweep(S.tauDone,tau);S.tauDone=tau;
    if(S&&tau>=CFG.time.end){if(!S.imp)doImpact(bladeAtTau(S,tau),tau);S.scan=scanNow();finish('done');}}}
{const o=update;update=function(dt){let r;try{r=o.apply(this,arguments);}finally{try{step(dt);}catch(e){L.err='step '+e.message;try{finish('error');}catch(_){}}}return r;};}
{const o=playerDeath;playerDeath=function(){try{if(S)finish('hero died');}catch(e){}return o.apply(this,arguments);};}
if(typeof loadZone==='function'){const o=loadZone;loadZone=function(){try{if(S)finish('left the map');V=null;PRT.length=0;}catch(e){}return o.apply(this,arguments);};}
/* ================================================= effects ================================================= */
const WHITE=[255,246,222],GOLD=[255,196,84],RIM=[255,138,40],DUST=[176,150,114],SOIL=[96,78,60];
const rgba=(c,a)=>`rgba(${c[0]},${c[1]},${c[2]},${cl(a,0,1).toFixed(3)})`;
const mixc=(a,b,u)=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u].map(Math.round);
let rs=17;const R=()=>{rs=(rs*16807)%2147483647;return rs/2147483647;};
const PRT=[];   // dust + soil, parameters fixed at the impact; position is a pure function of the age
const gpAt=(fd,al,pe,z)=>{const c=Math.cos(fd),s=Math.sin(fd),o=wl(c*al-s*pe,s*al+c*pe);return [AN.x+o[0],AN.y+o[1]-(z||0)];};   // ground (al,pe px, frame of the sprite direction) -> screen
/* blade outline: half width profile along s (0 hilt .. 1 tip) */
const hwAt=(s,w)=>s<.10?w*(.72+.43*ss(s/.10)):s<.76?w*(1.15-.17*((s-.10)/.66)):w*.98*Math.pow(Math.max(0,1-(s-.76)/.24),.8);   // r4: broad shoulder near the hilt, straight edges, long pointed tip
function bladePoly(b,s0,s1,wK){const n=Math.max(2,Math.ceil((s1-s0)*16)),ca=Math.cos(b.ang),sa=Math.sin(b.ang),pts=[],pr=[];
  for(let i=0;i<=n;i++){const s=s0+(s1-s0)*i/n,x=b.hx+ca*b.len*s,y=b.hy+sa*b.len*s,h=hwAt(s,b.w)*wK;pts.push([x-sa*h,y+ca*h]);pr.push([x+sa*h,y-ca*h]);}
  return pts.concat(pr.reverse());}
function fillPoly(c,pts){c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath();c.fill();}
function halfPoly(b,s0,s1,side,wK){const n=Math.max(2,Math.ceil((s1-s0)*16)),ca=Math.cos(b.ang),sa=Math.sin(b.ang),c0=[],ed=[];
  for(let i=0;i<=n;i++){const s=s0+(s1-s0)*i/n,x=b.hx+ca*b.len*s,y=b.hy+sa*b.len*s,h=hwAt(s,b.w)*wK*side;c0.push([x,y]);ed.push([x-sa*h,y+ca*h]);}
  return c0.concat(ed.reverse());}
/* r4: a real blade, two faces (gold / deeper gold), warm-white core, thin orange rim, almost no halo + a small light cross-guard at the hilt */
function drawBlade(c,b,s0,s1,al){
  if(b.len<4||al<.02)return;const ca=Math.cos(b.ang),sa=Math.sin(b.ang);
  c.save();c.globalAlpha=1;c.shadowBlur=2;c.shadowColor='rgba(255,170,60,.5)';
  c.fillStyle=rgba(RIM,.97*al);fillPoly(c,bladePoly(b,s0,s1,1.07));                              // orange rim
  c.shadowBlur=0;
  if(b.pat){const DG=[128,84,14];                                                                  // r6: deep, translucent gold body; the ridge stays a little lighter
    c.fillStyle=rgba(mixc(GOLD,DG,.62),.74*al);fillPoly(c,halfPoly(b,s0,s1,1,1));
    c.fillStyle=rgba(mixc(GOLD,DG,.8),.74*al);fillPoly(c,halfPoly(b,s0,s1,-1,1));
    c.fillStyle=rgba(mixc(GOLD,DG,.35),.55*al);fillPoly(c,bladePoly(b,s0,s1,.3));}
  else{
  c.fillStyle=rgba(mixc(GOLD,WHITE,.22),.98*al);fillPoly(c,halfPoly(b,s0,s1,1,1));                                // face A
  c.fillStyle=rgba(mixc(GOLD,RIM,.12),.98*al);fillPoly(c,halfPoly(b,s0,s1,-1,1));                 // face B (the other bevel)
  c.fillStyle=rgba(mixc(WHITE,GOLD,.3),.97*al);fillPoly(c,bladePoly(b,s0,s1,.76));               // warm inner body
  c.fillStyle=rgba(WHITE,.99*al);fillPoly(c,bladePoly(b,s0,s1,.5));}                              // white-warm core
  if(b.pat)drawPattern(c,b,s0,s1,al);
  if(s0<=.001){   // cross-guard
    const ux=ca,uy=sa,nx=-sa,ny=ca,w=b.w,gl=w*1.45+3,th=Math.max(3,w*.36),gx=b.hx-ux*th*.1,gy=b.hy-uy*th*.1;
    const P=(a1,a2)=>[gx+ux*a1+nx*a2,gy+uy*a1+ny*a2];
    const g=[P(-th*.6,-gl),P(th*.7,-gl*.82),P(th*.7,-w*.5),P(th*.9,0),P(th*.7,w*.5),P(th*.7,gl*.82),P(-th*.6,gl),P(-th*.9,gl*.35),P(-th*.9,-gl*.35)];
    c.fillStyle=rgba(RIM,.98*al);const g2=g.map(p=>[gx+(p[0]-gx)*1.12,gy+(p[1]-gy)*1.12]);fillPoly(c,g2);
    c.fillStyle=rgba(GOLD,.99*al);fillPoly(c,g);
    c.fillStyle=rgba(WHITE,.95*al);const g3=g.map(p=>[gx+(p[0]-gx)*.45,gy+(p[1]-gy)*.45]);fillPoly(c,g3);
    const pm=P(-th*.5,0),r=Math.max(2,w*.32);c.fillStyle=rgba(WHITE,.98*al);c.beginPath();c.arc(pm[0],pm[1],r,0,6.283);c.fill();}
  c.restore();}
/* r6 pattern: dull-gold grooves (not filled) -> warm-white core with a bright gold edge (filled); an energy head runs up every groove from the hilt; body is deep translucent gold so the pattern separates from it. */
const PCOL={dull:[222,176,88],shade:[96,58,10],edge:[255,200,76],hot:[255,150,40],white:[255,246,222]};
function patLines(){const L=[];const ridge=[];for(let i=0;i<=60;i++)ridge.push([.07+.87*i/60,0]);L.push({p:ridge,k:1.3});
  for(const sk of [.36,.52,.68,.84])for(const sg of [-1,1]){const a=[];for(let i=0;i<=14;i++){const u=i/14;a.push([sk-.13+.13*u,sg*.66*(1-u)]);}L.push({p:a,k:1});}
  {const sc=.185,hl=.075,dw=.62,q=[[sc-hl,0],[sc,dw],[sc+hl,0],[sc,-dw],[sc-hl,0]];const a=[];for(let e=0;e<4;e++)for(let i=0;i<10;i++){const u=i/10;a.push([q[e][0]+(q[e+1][0]-q[e][0])*u,q[e][1]+(q[e+1][1]-q[e][1])*u]);}a.push(q[4]);L.push({p:a,k:1.1});}
  return L;}
const PAT_L=patLines();
function drawPattern(c,b,s0,s1,al){
  const pt=b.pat,ca=Math.cos(b.ang),sa=Math.sin(b.ang),nx=-sa,ny=ca,lw=Math.max(1.8,b.w*.15),F=pt.f>=1?2:.03+.92*pt.f;
  const P=(s,t)=>{const h=hwAt(s,b.w)*t;return [b.hx+ca*b.len*s+nx*h,b.hy+sa*b.len*s+ny*h];};
  const heads=[];c.lineCap='butt';
  const draw=(w,col,a,fn)=>{c.lineWidth=w;for(const L of PAT_L){const pp=L.p;for(let i=0;i<pp.length-1;i++){const sm=(pp[i][0]+pp[i+1][0])/2;if(sm<s0-1e-6||sm>s1+1e-6)continue;const fe=cl((F-sm)/.035,0,1),aa=fn(fe);if(aa<=.01)continue;
    const p=P(pp[i][0],pp[i][1]),q=P(pp[i+1][0],pp[i+1][1]);c.strokeStyle=rgba(typeof col==='function'?col(fe,F-sm):col,aa*a*al);c.lineWidth=w*L.k;c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(q[0],q[1]);c.stroke();}}};
  draw(lw+lw*.5,PCOL.shade,.24,()=>1);                                                   // gold shadow under every groove (depth)
  draw(lw*.85,PCOL.dull,.72,fe=>1-fe);                                                     // not filled yet: dull gold, a faint frame
  draw(lw*1.8,PCOL.edge,.95,fe=>fe);                                                     // filled: bright gold edge
  draw(lw*.62,(fe,age)=>age<.07?mixc(PCOL.hot,PCOL.white,cl(age/.07,0,1)):PCOL.white,1,fe=>fe);   // filled: warm-white core (just-filled is hotter)
  if(pt.head&&F>.04&&F<1.5){for(const L of PAT_L){let best=null,bd=.02;for(let i=0;i<L.p.length-1;i++){const sm=(L.p[i][0]+L.p[i+1][0])/2;if(sm<s0||sm>s1)continue;const d=Math.abs(sm-F);if(d<bd){bd=d;best=[(L.p[i][0]+L.p[i+1][0])/2,(L.p[i][1]+L.p[i+1][1])/2];}}
      if(best)heads.push(P(best[0],best[1]));}
    const r=Math.max(3,b.w*.42);for(const p of heads){const g=c.createRadialGradient(p[0],p[1],0,p[0],p[1],r);g.addColorStop(0,rgba(PCOL.white,.95*al));g.addColorStop(.45,rgba(PCOL.edge,.5*al));g.addColorStop(1,rgba(PCOL.edge,0));c.fillStyle=g;c.beginPath();c.arc(p[0],p[1],r,0,6.283);c.fill();}}
  {const sc=.185;if(sc>=s0&&sc<=s1){const fe=cl((F-sc)/.035,0,1),p=P(sc,0),r=Math.max(2,b.w*.2);const lz=(k,col,a)=>{c.fillStyle=rgba(col,a*al);c.beginPath();c.moveTo(p[0]-ca*r*k*1.3,p[1]-sa*r*k*1.3);c.lineTo(p[0]+nx*r*k,p[1]+ny*r*k);c.lineTo(p[0]+ca*r*k*1.3,p[1]+sa*r*k*1.3);c.lineTo(p[0]-nx*r*k,p[1]-ny*r*k);c.closePath();c.fill();};
    lz(1,PCOL.dull,.6*(1-fe));lz(1,PCOL.edge,.95*fe);lz(.6,PCOL.white,fe);}}
  c.lineCap='butt';}
/* what the player sees right now (charge or before the impact): {hx,hy,ang,len,w,al,cu} + the world blade state */
const cuOf=s=>s.phase==='charge'?(s.rel?s.relT:Math.min(s.t,CFG.charge.max))/CFG.charge.max:s.u;
function bladeNow(s){
  const C=CFG.fx,fd=fdOf(s.d);let sc,bs;
  if(s.phase==='charge'){const tc=Math.min(s.t,CFG.charge.max),cu=cuOf(s),grow=ss(Math.min(1,tc/.14)),d0=s.delta;s.delta=wrapA(s.face-fd);
    bs=mkBlade(axC(s.d,chargeFrame(tc)),s,lenOf(cu)*grow,handPx(s.d,1,chargeFrame(tc)));s.delta=d0;sc=bladeScr(bs,fd);
    const sz=ss(cu),w=C.wMin+(C.wFull-C.wMin)*sz;return Object.assign(sc,{w:w*(.55+.45*grow),al:.82+.18*sz,cu,bs,pat:{f:cu*(cu>=.999?1.02:1),lv:cu,x:0,head:true}});}
  const tau=cl((s.tEnd!=null?Math.min(s.t,s.tEnd):s.t)-s.ts,0,CFG.time.end);bs=bladeAtTau(s,s.imp?Math.min(tau,s.imp.tau):tau);sc=bladeScr(bs,fd);
  const sz=ss(s.u),w=C.wMin+(C.wFull-C.wMin)*sz;return Object.assign(sc,{w,al:1,cu:s.u,bs,pat:{f:1.02,lv:1,x:.05+tau*.5,head:false}});}
/* ---------------- charge-phase effects ---------------- */
const SRND=(()=>{let r=9;const q=()=>{r=(r*16807)%2147483647;return r/2147483647;};const st=[],mo=[],ch=[];
  for(let i=0;i<48;i++)st.push({ph:q(),th:q()*6.283,R:62+q()*92,sp:.8+q()*.7,sk:.1+q()*.8,lift:30+q()*60,w:.6+q()*.8});
  for(let i=0;i<48;i++)mo.push({ph:q(),th:q()*6.283,R:26+q()*100,sp:.25+q()*.35,sz:1.2+q()*2.2,h:80+q()*120,sw:(q()-.5)*3});
  for(let i=0;i<24;i++)ch.push({ph:q(),th:q()*6.283,R:30+q()*85,sp:.2+q()*.3,sz:2+q()*3,h:60+q()*100,rot:q()*6.3,sw:(q()-.5)*4,hue:q()});
  return {st,mo,ch};})();
const isFront=(th)=>wl(Math.cos(th),Math.sin(th))[1]>0;
function gather(s,t,b,back,c){
  const C=CFG.fx,cu=s.phase==='charge'?cuOf(s):s.u,fadeOut=s.phase==='charge'?1:Math.max(0,1-(t-s.ts)/.12);if(fadeOut<=0)return;
  const nS=Math.round(8+(C.streaks-8)*ss(cu)),nM=Math.round(10+(C.motes-10)*ss(cu)),nC=Math.round(4+(C.chips-4)*ss(cu)),str=(.55+.45*cu)*fadeOut;
  if(back){for(let k=0;k<2;k++){const p=((t*(.9+.5*cu)+k*.5)%1),r=140*(1-p)+10,al=Math.sin(Math.PI*p)*.5*str;c.lineWidth=1.3+cu*1.6;c.strokeStyle=rgba(GOLD,al);c.beginPath();
    for(let i=0;i<=40;i++){const a=i/40*6.283,o=wl(Math.cos(a)*r,Math.sin(a)*r);i?c.lineTo(AN.x+o[0],AN.y+o[1]):c.moveTo(AN.x+o[0],AN.y+o[1]);}c.stroke();}}
  c.lineCap='round';
  for(let i=0;i<nS;i++){const q=SRND.st[i],front=isFront(q.th);if(front===back)continue;
    const p=((q.ph+t*q.sp*(.8+.5*cu))%1),o=wl(Math.cos(q.th+p*q.w*1.4)*q.R*(1-.55*p),Math.sin(q.th+p*q.w*1.4)*q.R*(1-.55*p)),
      sx=AN.x+o[0],sy=AN.y+o[1]-p*8,s2=cl(.15+q.sk*.7,.1,.95),ex=b.hx+Math.cos(b.ang)*b.len*s2,ey=b.hy+Math.sin(b.ang)*b.len*s2,
      cx=(sx+ex)/2+(sx<ex?-1:1)*20*q.w,cy=Math.min(sy,ey)-q.lift*(1-p)-10;
    const pts=[];for(let j=0;j<=5;j++){const pp=Math.max(0,p-j*.045),u=pp,x=(1-u)*(1-u)*sx+2*(1-u)*u*cx+u*u*ex,y=(1-u)*(1-u)*sy+2*(1-u)*u*cy+u*u*ey;pts.push([x,y]);}
    const al=Math.sin(Math.PI*Math.min(1,p*1.05))*str;if(al<.03)continue;
    for(let j=0;j<5;j++){const f=1-j/5;c.strokeStyle=rgba(j<2?WHITE:GOLD,al*f);c.lineWidth=(1+2.2*cu)*(.4+.6*f);c.beginPath();c.moveTo(pts[j][0],pts[j][1]);c.lineTo(pts[j+1][0],pts[j+1][1]);c.stroke();}}
  c.lineCap='butt';
  for(let i=0;i<nM;i++){const q=SRND.mo[i],front=isFront(q.th);if(front===back)continue;const p=((q.ph+t*q.sp)%1),th=q.th+q.sw*p,o=wl(Math.cos(th)*q.R,Math.sin(th)*q.R),
      x=AN.x+o[0],y=AN.y+o[1]-p*q.h*(.6+.6*cu),al=Math.sin(Math.PI*p)*.7*str;c.fillStyle=rgba(i%3?DUST:WHITE,al);c.beginPath();c.arc(x,y,q.sz*(1+.4*cu),0,6.283);c.fill();}
  for(let i=0;i<nC;i++){const q=SRND.ch[i],front=isFront(q.th);if(front===back)continue;const p=((q.ph+t*q.sp)%1),th=q.th+q.sw*p,o=wl(Math.cos(th)*q.R,Math.sin(th)*q.R),
      x=AN.x+o[0],y=AN.y+o[1]-Math.sin(p*Math.PI*.9)*q.h*(.5+.7*cu),al=Math.sin(Math.PI*p)*.95*fadeOut,sz=q.sz*(1+.5*cu);
    c.save();c.translate(x,y);c.rotate(q.rot+p*q.sw*4);c.fillStyle=rgba([SOIL[0]+Math.round(q.hue*40),SOIL[1]+Math.round(q.hue*30),SOIL[2]+Math.round(q.hue*24)],al);c.beginPath();c.moveTo(-sz,-sz*.6);c.lineTo(sz*.8,-sz);c.lineTo(sz,sz*.5);c.lineTo(-sz*.3,sz);c.closePath();c.fill();
    c.fillStyle=rgba(WHITE,al*.25);c.fillRect(-sz*.6,-sz*.7,sz*.7,sz*.3);c.restore();}}
/* faint ground strip = where the blade will land (length = the blade length of the current charge, width = the swept strip); follows the aim until the slash locks it */
function aimRect(s,t,c){
  const fa=s.phase==='charge'?1:Math.max(0,1-(t-s.ts)/.1);if(fa<=0)return;const cu=cuOf(s),fd=fdOf(s.d),d=s.phase==='charge'?wrapA(s.face-fd):s.delta,len=(lenOf(cu)+.35)*PXM,h=CFG.area.half,cd=Math.cos(d),sd=Math.sin(d),
    pt=(al,pe)=>gpAt(fd,al*cd-pe*sd,al*sd+pe*cd,0),p0=pt(0,-h),p1=pt(len,-h),p2=pt(len,h),p3=pt(0,h);
  const al=(.07+.12*cu)*fa*(.85+.15*Math.sin(t*9));c.fillStyle=rgba(GOLD,al);c.beginPath();c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1]);c.lineTo(p2[0],p2[1]);c.lineTo(p3[0],p3[1]);c.closePath();c.fill();
  c.setLineDash([7,5]);c.lineDashOffset=-t*20;c.lineWidth=1.4;c.strokeStyle=rgba(WHITE,(.18+.3*cu)*fa);c.stroke();c.setLineDash([]);}
/* thin rings climbing the blade + the white flash when it is full */
function ringsOn(s,t,b,c){
  if(b.len<20)return;const cu=b.cu,n=0,ca=Math.cos(b.ang),sa=Math.sin(b.ang);
  for(let i=0;i<n;i++){const p=((t*.85+i/n)%1),sp=.1+.85*p,al=Math.sin(Math.PI*p)*(.55+.4*cu),h=hwAt(sp,b.w)*1.45,x=b.hx+ca*b.len*sp,y=b.hy+sa*b.len*sp;
    c.lineWidth=1.2+1.4*cu;c.strokeStyle=rgba(WHITE,al);c.beginPath();c.moveTo(x-sa*h,y+ca*h);c.lineTo(x+sa*h,y-ca*h);c.stroke();
    c.strokeStyle=rgba(GOLD,al*.7);c.lineWidth=1;c.beginPath();c.ellipse(x,y,h*1.05,h*.3,b.ang+Math.PI/2,0,6.283);c.stroke();}
  if(s.tFull!=null){const a=t-s.tFull;if(a>=0&&a<.34){const u=a/.34,fl=Math.pow(1-u,1.4);c.fillStyle=rgba(WHITE,.55*fl);fillPoly(c,bladePoly(b,0,1,1.28));
    c.lineWidth=2.2;c.strokeStyle=rgba(WHITE,.9*fl);const q=u,sp=.08+.9*q,h=hwAt(sp,b.w)*2.4,x=b.hx+ca*b.len*sp,y=b.hy+sa*b.len*sp;c.beginPath();c.moveTo(x-sa*h,y+ca*h);c.lineTo(x+sa*h,y-ca*h);c.stroke();
    c.strokeStyle=rgba(GOLD,.7*fl);c.beginPath();c.ellipse(b.hx,b.hy,(20+60*u),(8+22*u),0,0,6.283);c.stroke();}}}
/* ---------------- slash: light trail along the swing (the blade of the last ~0.1 s, fanned) ---------------- */
function trail(s,t,c,fd){
  const tauN=t-s.ts,imp=s.imp?s.imp.tau:1e9,tauT=Math.min(tauN,imp),fade=s.imp?cl(1-(tauN-imp)/.28,0,1):1;if(fade<=0||tauT<=0)return;
  const n=10,dl=.0105,e=(q,sp)=>[q.hx+Math.cos(q.ang)*q.len*sp,q.hy+Math.sin(q.ang)*q.len*sp];let prev=null;
  for(let i=0;i<=n;i++){const t2=tauT-i*dl;if(t2<0)break;const q=bladeScr(bladeAtTau(s,t2),fd);
    if(prev){const wbk=nfOf(t2)<CFG.slash.windF?.55:1,al=(1-i/(n+1))*.5*fade*wbk,A1=e(q,.18),A2=e(q,1),B2=e(prev,1),B1=e(prev,.18);c.fillStyle=rgba(i<3?WHITE:GOLD,al);c.beginPath();c.moveTo(A1[0],A1[1]);c.lineTo(A2[0],A2[1]);c.lineTo(B2[0],B2[1]);c.lineTo(B1[0],B1[1]);c.closePath();c.fill();}
    prev=q;}
  /* bright thread along the tip path */
  c.lineCap='round';const pts=[];for(let i=0;i<=22;i++){const t2=tauT-i*.008;if(t2<0)break;const q=bladeScr(bladeAtTau(s,t2),fd);pts.push(e(q,1));}
  for(let j=0;j+1<pts.length;j++){const f=1-j/pts.length;c.strokeStyle=rgba(WHITE,.9*f*fade*(nfOf(tauT-j*.008)<CFG.slash.windF?.6:1));c.lineWidth=1+3.2*f;c.beginPath();c.moveTo(pts[j][0],pts[j][1]);c.lineTo(pts[j+1][0],pts[j+1][1]);c.stroke();}c.lineCap='butt';}
/* ---------------- impact: everything below is fixed at the contact, drawn as a function of the age ---------------- */
function doImpact(b,tau){
  const s=S;if(!s||s.imp)return;const fd=fdOf(s.d),b2=Object.assign({},b),tipZ=tipOf(b)[2];
  if(tipZ<-.05){const lw=lowSeg(b);if(lw)b2.Lg=Math.max(.5,lw[1]);}          // a blade that sank below the ground is cut at the ground (never happens at the normal contact)
  hitTest(b2,tau);
  const sc=bladeScr(b2,fd),sc0=bladeScr(bladeAtTau(s,Math.max(0,tau-1/60)),fd),tip=tipOf(b2),g=gpx(tip),C=CFG.fx,w=C.wMin+(C.wFull-C.wMin)*ss(s.u);
  /* swing direction on the screen: where the tip was going */
  let vx=(sc.hx+Math.cos(sc.ang)*sc.len)-(sc0.hx+Math.cos(sc0.ang)*sc0.len),vy=(sc.hy+Math.sin(sc.ang)*sc.len)-(sc0.hy+Math.sin(sc0.ang)*sc0.len);const vl=Math.hypot(vx,vy);
  if(vl<1e-3){vx=Math.cos(sc.ang);vy=Math.sin(sc.ang);}
  const hs_=b2.hp?scr(fd,b2.h):null;s.imp={off:b2.hp?[AN.x+b2.hp[0]-hs_[0],AN.y+b2.hp[1]-hs_[1]]:null,fr:s.d===0?null:frontRanges(b2,fd),tau,tAbs:s.ts+tau,sn:{hx:sc.hx-AN.x,hy:sc.hy-AN.y,ang:sc.ang,len:sc.len,w},g,tipZ:+tip[2].toFixed(3),nf:+b.nf.toFixed(2),Lc:+b2.Lg.toFixed(2),vx,vy,vl};
  s.scan0=scanNow();
  try{shake(C.shake[0]+(C.shake[1]-C.shake[0])*s.u);}catch(e){}
  rs=101+s.id*13;PRT.length=0;const u=s.u;
  const nd=Math.round(22+16*u);
  for(let i=0;i<nd;i++){const sp=i%2?1:-1;PRT.push({k:'d',al:g[0]+(R()-.5)*26,pe:g[1]+(R()-.5)*30,vf:(R()-.3)*60,vp:sp*(40+R()*(80+70*u)),vz:20+R()*60,r0:5+R()*5,r1:14+R()*(14+12*u),life:.55+R()*.5,tone:(R()-.5)*.25});}
  for(let i=0;i<9;i++){const q=.2+.7*R();PRT.push({k:'d',al:g[0]*q+(R()-.5)*10,pe:g[1]*q+(R()-.5)*14,vf:(R()-.3)*30,vp:(i%2?1:-1)*(25+R()*40),vz:10+R()*30,r0:4+R()*4,r1:9+R()*8,life:.45+R()*.35,tone:(R()-.5)*.25});}
  const nc=Math.round(9+9*u);
  for(let i=0;i<nc;i++)PRT.push({k:'c',al:g[0]+(R()-.5)*30,pe:g[1]+(R()-.5)*30,vf:(R()-.2)*90,vp:(R()-.5)*170,vz:90+R()*150*(.6+.5*u),sz:2+R()*3,rot:R()*6.3,w:(R()-.5)*14,life:.7+R()*.4});
  const nk=Math.round(5+5*u);
  for(let i=0;i<nk;i++){const an=i/nk*6.283+R()*.6;PRT.push({k:'z',al:g[0],pe:g[1],an,len:12+R()*(24+22*u),life:.5+R()*.25});}
  /* the light body tears: 16 sections, from the tip to the hand; each section -> 3 curved ribbons + 3 fragments of different sizes */
  const KS=C.sections,fw=[Math.cos(sc.ang),Math.sin(sc.ang)],nm=[-fw[1],fw[0]],rb=[],sh=[];
  for(let k=0;k<KS;k++){const s0=k/KS,s1=(k+1)/KS,mid=(s0+s1)/2,delay=.02+.2*(1-mid)+R()*.04,sp=(110+250*mid)*(.8+.4*u);
    for(let j=0;j<3;j++)rb.push({k,j,s0,s1:Math.min(1,s1+(s1-s0)*.7),lo:[-1,-.36,.36][j],hi:[-.36,.36,1][j],delay:delay+j*.012,vx:fw[0]*sp*(.75+.5*R())+nm[0]*(j-1)*70,vy:fw[1]*sp*(.75+.5*R())+nm[1]*(j-1)*70-(110+190*R())*(.5+mid),curl:(R()-.5)*2*(45+80*mid),life:.5+.35*R()+.2*mid,drag:1.1+1.4*R(),hs:null});
    for(let m=0;m<3;m++)sh.push({s:s0+(s1-s0)*R(),lat:(R()*2-1)*.85,delay:delay+R()*.06,vx:fw[0]*sp*(1+.8*R())+nm[0]*(R()-.5)*110,vy:fw[1]*sp*(1+.8*R())+nm[1]*(R()-.5)*110-(70+200*R())*(.4+mid),size:(1.6+R()*R()*(8+7*u))*(m===0?1.25:.75),life:.55+.6*R(),drag:.9+1.1*R(),hue:R(),hs:null});}
  s.imp.rb=rb;s.imp.sh=sh;}
/* offset of the live hand (screen, from the anchor) at an absolute time: the unbroken part of the blade stays planted at the tip and follows the hand */
function handOff(s,tAbs,fd){const nf=nfOf(tAbs-s.ts),hp=handPx(s.d,4,nf);if(hp)return hp;const a=axisAt(A4,nf),p=scr(fd,a.h);return [p[0]-AN.x,p[1]-AN.y];}
function impactDraw(s,t,back,c,fd){
  const im=s.imp;if(!im)return;const tau=t-im.tAbs;if(tau<0)return;const u=s.u,sc=.8+.6*u,g=im.g,gp=(al,pe,z)=>{const q=gpAt(fd,al,pe,z),v=im.off||[0,0];return [q[0]+v[0],q[1]+v[1]];};
  if(back){
    const ft=cl(1-tau/.8,0,1);
    if(ft>0){   // ground: the line the blade struck along + cracks
      const m0=gp(0,0,0),m1=gp(g[0],g[1],0),gr=c.createLinearGradient(m0[0],m0[1],m1[0],m1[1]);gr.addColorStop(0,rgba(GOLD,.12*ft));gr.addColorStop(.7,rgba(RIM,.4*ft));gr.addColorStop(1,rgba(WHITE,.55*ft));
      c.lineCap='round';c.strokeStyle=gr;c.lineWidth=(6+6*u)*ft+2;c.globalAlpha=.35;c.beginPath();c.moveTo(m0[0],m0[1]);c.lineTo(m1[0],m1[1]);c.stroke();c.globalAlpha=1;
      c.lineWidth=2+2*u;c.strokeStyle=gr;c.stroke();
      for(const q of PRT){if(q.k!=='z')continue;const fa=cl(1-tau/q.life,0,1)*Math.min(1,tau/.03);if(fa<=0)continue;const r=q.len*Math.min(1,tau/.1);
        const a1=gp(q.al,q.pe,0),a2=gp(q.al+Math.cos(q.an)*r,q.pe+Math.sin(q.an)*r,0);c.lineWidth=2.4+2*u;c.strokeStyle=rgba(RIM,.8*fa);c.beginPath();c.moveTo(a1[0],a1[1]);c.lineTo(a2[0],a2[1]);c.stroke();c.lineWidth=1.1;c.strokeStyle=rgba(WHITE,.9*fa);c.stroke();}
      c.lineCap='butt';}
    const rt=cl(tau/.5,0,1);if(rt<1){const r=(18+95*(.7+.5*u)*(1-Math.pow(1-rt,2.2))),al=(1-rt)*.7;c.lineWidth=2.5*(1-rt)+.8;c.strokeStyle=rgba(GOLD,al);c.beginPath();
      for(let i=0;i<=36;i++){const a=i/36*6.283,p=gp(g[0]+Math.cos(a)*r,g[1]+Math.sin(a)*r,0);i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]);}c.stroke();}}
  const footY=AN.y-1;
  for(const q of PRT){if(q.k==='z')continue;if(tau>q.life)continue;const u1=tau/q.life;
    if(q.k==='d'){const ease=1-Math.pow(1-Math.min(1,tau/.18),3),al_=q.al+q.vf*tau*ease,pe_=q.pe+q.vp*tau*(1-.45*u1),z=q.vz*Math.sin(Math.min(1,u1)*2.2)*.9,p=gp(al_,pe_,z);if((p[1]+z>=footY)===back)continue;
      const r=(q.r0+(q.r1-q.r0)*ease)*sc,al=Math.min(1,tau/.04)*Math.pow(1-u1,1.4)*.7,cc=DUST.map(v=>Math.round(v*(1+q.tone))),gg=c.createRadialGradient(p[0]-r*.15,p[1]-r*.2,r*.1,p[0],p[1],r);
      gg.addColorStop(0,`rgba(${cc[0]+40},${cc[1]+36},${cc[2]+30},${al})`);gg.addColorStop(1,`rgba(${cc[0]},${cc[1]},${cc[2]},0)`);c.fillStyle=gg;c.beginPath();c.arc(p[0],p[1],r,0,6.283);c.fill();}
    else{const z=Math.max(0,q.vz*tau-480*tau*tau),p=gp(q.al+q.vf*tau,q.pe+q.vp*tau,z);if((p[1]+z>=footY)===back)continue;const al=1-Math.max(0,u1-.7)/.3;
      c.save();c.translate(p[0],p[1]);c.rotate(q.rot+q.w*tau);c.fillStyle=`rgba(112,92,70,${al})`;c.fillRect(-q.sz,-q.sz*.7,q.sz*2,q.sz*1.4);c.restore();}}
  if(back)return;
  /* white-gold flash at the contact + a few light sparks (short) */
  const ct=gp(g[0],g[1],8),fl=cl(1-tau/.2,0,1);
  if(fl>0){const r=(36+44*u)*(1-fl*.3),gg=c.createRadialGradient(ct[0],ct[1],0,ct[0],ct[1],r);gg.addColorStop(0,rgba(WHITE,.98*fl));gg.addColorStop(.35,rgba(GOLD,.62*fl));gg.addColorStop(1,rgba(RIM,0));c.fillStyle=gg;c.beginPath();c.arc(ct[0],ct[1],r,0,6.283);c.fill();
    c.lineCap='round';c.strokeStyle=rgba(WHITE,.85*fl);c.lineWidth=2;for(let i=0;i<10;i++){const an=i/10*6.283+.3,L1=(24+34*u)*(1-fl)+8,L0=L1*.35;c.beginPath();c.moveTo(ct[0]+Math.cos(an)*L0,ct[1]+Math.sin(an)*L0*.6);c.lineTo(ct[0]+Math.cos(an)*L1*1.5,ct[1]+Math.sin(an)*L1*.9);c.stroke();}c.lineCap='butt';}
  /* a small flash where the blade cut a monster */
  for(const q of s.contacts){const a=t-q.t;if(a<0||a>.22)continue;const f=1-a/.22,p=gp(q.al,q.pe,22),r=14+22*(1-f)+q.sz*.3,gg=c.createRadialGradient(p[0],p[1],0,p[0],p[1],r);gg.addColorStop(0,rgba(WHITE,.9*f));gg.addColorStop(.5,rgba(GOLD,.5*f));gg.addColorStop(1,rgba(RIM,0));c.fillStyle=gg;c.beginPath();c.arc(p[0],p[1],r,0,6.283);c.fill();}}
/* the tearing blade: intact sections follow the hand, torn sections become ribbons + fragments that keep moving */
function breakDraw(s,t,front,c,fd){
  const im=s.imp;if(!im||!im.rb)return;const age=t-im.tAbs;if(age<0)return;const sn=im.sn,KS=CFG.fx.sections,ca=Math.cos(sn.ang),sa=Math.sin(sn.ang),nm=[-sa,ca];
  const hand=handOff(s,Math.min(t,s.ts+CFG.time.end),fd),hs0=[hand[0]-sn.hx,hand[1]-sn.hy];
  const basePt=(sp,hs)=>[AN.x+sn.hx+ca*sn.len*sp+hs[0]*(1-sp),AN.y+sn.hy+sa*sn.len*sp+hs[1]*(1-sp)];
  const runsPass=isF=>{
    /* the white-gold flash running through the unbroken blade (r7: drawn in the layer the part of the blade belongs to) */
    const fl=cl(1-age/.14,0,1),rg=im.fr||[[0,1,false]];
    let k=0;
    while(k<KS){if(age>=im.rb[k*3+2].delay){k++;continue;}let k2=k;while(k2+1<KS&&age<im.rb[(k2+1)*3+2].delay)k2++;     // one run of still-unbroken sections (no seams)
      const s0=k/KS,s1=(k2+1)/KS,mid=(s0+s1)/2,hs=[hs0[0]*(1-mid),hs0[1]*(1-mid)],bk={hx:AN.x+sn.hx+hs[0],hy:AN.y+sn.hy+hs[1],ang:sn.ang,len:sn.len,w:sn.w,pat:{f:1.02,lv:1,x:.05+im.tau*.5+.1,head:false}};
      for(const q of rg){if(q[2]!==isF)continue;const lo=Math.max(s0,q[0]-EPS),hi=Math.min(s1,q[1]+EPS);if(hi<=lo)continue;drawBlade(c,bk,lo,hi,1);if(fl>0){c.fillStyle=rgba(WHITE,.75*fl);fillPoly(c,bladePoly(bk,lo,hi,1.3));}}
      k=k2+1;}};
    const ribPass=isF=>{
    for(const r of im.rb){if(im.fr){const m=(r.s0+r.s1)/2,f=!!im.fr.find(q=>m>=q[0]&&m<=q[1]&&q[2]);if(f!==isF)continue;}else if(isF)continue;const a=age-r.delay;if(a<0)continue;const u=a/r.life;if(u>=1)continue;
      if(!r.hs)r.hs=handOff(s,im.tAbs+r.delay,fd).map((v,i)=>v-(i?sn.hy:sn.hx));
      const e=(1-Math.exp(-r.drag*a))/r.drag,dx=r.vx*e,dy=r.vy*e+110*a*a,ws=1-.65*ss(u),bend=r.curl*ss(a/r.life),n=6,Lp=[],Rp=[];
      for(let i=0;i<=n;i++){const q=i/n,sp=r.s0+(r.s1-r.s0)*q,B=basePt(sp,r.hs),h=hwAt(sp,sn.w)*ws,bb=bend*q*q,kq=.5+.5*q,ox=dx*kq+nm[0]*bb,oy=dy*kq+nm[1]*bb;
        Lp.push([B[0]+nm[0]*h*r.lo+ox,B[1]+nm[1]*h*r.lo+oy]);Rp.push([B[0]+nm[0]*h*r.hi+ox,B[1]+nm[1]*h*r.hi+oy]);}
      const cool=ss(u*1.3),col=r.j===1?mixc(WHITE,GOLD,cool):mixc(GOLD,RIM,cool),al=Math.pow(1-u,1.35)*Math.min(1,.4+a/.03);
      c.fillStyle=rgba(RIM,.2*al);c.beginPath();c.moveTo(Lp[0][0],Lp[0][1]);for(let i=1;i<=n;i++)c.lineTo(Lp[i][0],Lp[i][1]);for(let i=n;i>=0;i--)c.lineTo(Rp[i][0],Rp[i][1]);c.closePath();
      c.lineWidth=2.4*ws;c.strokeStyle=rgba(RIM,.2*al);c.stroke();c.fillStyle=rgba(col,.95*al);c.fill();}

    };
  if(!front){
    runsPass(false);
    ribPass(false);
    return;}
  if(im.fr){runsPass(true);ribPass(true);}
  /* fragments (front layer, soft light, different sizes) */
  for(const q of im.sh){const a=age-q.delay;if(a<0)continue;const u=a/q.life;if(u>=1)continue;
    if(!q.hs)q.hs=handOff(s,im.tAbs+q.delay,fd).map((v,i)=>v-(i?sn.hy:sn.hx));
    const B=basePt(q.s,q.hs),h=hwAt(q.s,sn.w)*q.lat,e=(1-Math.exp(-q.drag*a))/q.drag,x=B[0]+nm[0]*h+q.vx*e,y=B[1]+nm[1]*h+q.vy*e+150*a*a,
      vx=q.vx*Math.exp(-q.drag*a),vy=q.vy*Math.exp(-q.drag*a)+300*a,sp=Math.hypot(vx,vy),al=Math.pow(1-u,1.2),z=q.size*(1-.45*u),col=q.hue<.35?WHITE:q.hue<.75?GOLD:RIM;
    const tl=Math.min(30,sp*.045*(0.4+z*.12));if(sp>1e-3){c.lineCap='round';c.strokeStyle=rgba(col,.55*al);c.lineWidth=z*.9;c.beginPath();c.moveTo(x,y);c.lineTo(x-vx/sp*tl,y-vy/sp*tl);c.stroke();c.lineCap='butt';}
    const gg=c.createRadialGradient(x,y,0,x,y,z*1.9);gg.addColorStop(0,rgba(WHITE,.95*al));gg.addColorStop(.4,rgba(col,.7*al));gg.addColorStop(1,rgba(col,0));c.fillStyle=gg;c.beginPath();c.arc(x,y,z*1.9,0,6.283);c.fill();}}
/* debug: the swept area over the blade (L.debug) */
function debugDraw(s,c,fd){
  c.save();c.shadowBlur=0;const half=CFG.area.half,pts=[];
  for(const q of s.sweep){const dx=q.b[0]-q.a[0],dy=q.b[1]-q.a[1],ln=Math.hypot(dx,dy)||1,nx=-dy/ln*half,ny=dx/ln*half,P4=[[q.a[0]+nx,q.a[1]+ny],[q.b[0]+nx,q.b[1]+ny],[q.b[0]-nx,q.b[1]-ny],[q.a[0]-nx,q.a[1]-ny]];
    for(const p of P4)pts.push(p);const p=P4.map(v=>gpAt(fd,v[0],v[1],0));
    c.fillStyle='rgba(0,200,255,.13)';c.beginPath();c.moveTo(p[0][0],p[0][1]);for(let j=1;j<4;j++)c.lineTo(p[j][0],p[j][1]);c.closePath();c.fill();}
  if(pts.length>=3){   // outline of everything the blade has swept (convex hull on the ground)
    const sp=pts.slice().sort((u,v)=>u[0]-v[0]||u[1]-v[1]),cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo=[],up=[];
    for(const p of sp){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p);}
    for(const p of sp.slice().reverse()){while(up.length>=2&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p);}
    const hull=lo.slice(0,-1).concat(up.slice(0,-1));c.strokeStyle='rgba(120,240,255,.95)';c.lineWidth=2.2;c.setLineDash([8,5]);c.beginPath();
    hull.forEach((v,i)=>{const p=gpAt(fd,v[0],v[1],0);i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]);});c.closePath();c.stroke();c.setLineDash([]);}
  /* the blade's own line on the ground, now */
  const tauN=cl((s.tEnd!=null?Math.min(s.t,s.tEnd):s.t)-s.ts,0,CFG.time.end),bs=bladeAtTau(s,s.imp?Math.min(tauN,s.imp.tau):tauN),g0=gpAt(fd,...gpx(bs.h),0),g1=gpAt(fd,...gpx(tipOf(bs)),0);
  c.strokeStyle='rgba(255,255,0,.95)';c.lineWidth=3;c.beginPath();c.moveTo(g0[0],g0[1]);c.lineTo(g1[0],g1[1]);c.stroke();
  const cf=Math.cos(fd),sf=Math.sin(fd);
  for(const e of enemies){if(!liveE(e))continue;const ex=e.x-P.x,ey=e.y-P.y,al=ex*cf+ey*sf,pe=-ex*sf+ey*cf,sz=e.sz||16,hit=s.reg.has(s.id+':'+uid(e));
    c.strokeStyle=hit?'rgba(60,255,90,1)':'rgba(255,70,70,1)';c.lineWidth=3;c.beginPath();for(let i=0;i<=24;i++){const a=i/24*6.283,p=gpAt(fd,al+Math.cos(a)*sz,pe+Math.sin(a)*sz,0);i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]);}c.stroke();}
  c.font='bold 13px sans-serif';c.fillStyle='#fff';c.strokeStyle='#000';c.lineWidth=3;const tx=AN.x-110,ty=AN.y+62,t1='blade '+s.Lg.toFixed(2)+' m = '+Math.round(s.Lg*PXM)+' px  |  swept reach '+Math.round(s.reachPx)+' px'+(s.imp?'  |  tip contact '+Math.round(s.imp.g[0])+' px':'');
  c.strokeText(t1,tx,ty);c.fillText(t1,tx,ty);const t2='green = hit   red = not hit   cyan = swept area   yellow = blade on the ground';c.strokeText(t2,tx,ty+16);c.fillText(t2,tx,ty+16);
  c.restore();}
/* r7: which parts of the blade are nearer to the camera than the hero's torso (front layer) and which are behind it (back layer). Camera depth is linear along the blade -> at most one split. E keeps the r6 drawing. */
function frontRanges(bs,fd){
  const dep=p=>{const o=scr(fd,p),gy=o[1]-AN.y+p[2]*ZPX;return -CD[1]*gy/(Math.abs(AF.y[1])*K)+CD[2]*p[2];},thr=CD[2]*.8-.12,d0=dep(bs.h),d1=dep(tipOf(bs));
  const f0=d0<thr,f1=d1<thr;if(f0&&f1)return [[0,1,true]];if(!f0&&!f1)return [[0,1,false]];
  const x=cl((thr-d0)/(d1-d0),0,1);return f0?[[0,x,true],[x,1,false]]:[[0,x,false],[x,1,true]];}
const EPS=.004;
function drawRanges(c,b,rg,front,al){for(const r of rg)if(r[2]===front&&r[1]>r[0])drawBlade(c,b,Math.max(0,r[0]-EPS),Math.min(1,r[1]+EPS),al);}
/* ---------------- draw: two layers around the hero sprite ---------------- */
function layer(s,back){
  const c=ctx,t=s.t,fd=fdOf(s.d);calib();c.save();c.globalCompositeOperation='source-over';c.shadowColor='rgba(255,208,110,.8)';c.shadowBlur=9;
  const ch=s.phase==='charge',broke=!!s.imp&&t>=s.imp.tAbs-1e-6;let b=null;
  if(!broke)b=bladeNow(s);
  if(back){
    if(ch||t-s.ts<.2)aimRect(s,t,c);
    if(L.debug&&!ch)debugDraw(s,c,fd);
    gather(s,t,b||{hx:AN.x,hy:AN.y,ang:0,len:1,w:1,cu:s.u},true,c);
    if(!ch)trail(s,t,c,fd);
    if(!broke){if(s.d===0)drawBlade(c,b,0,1,b.al);else drawRanges(c,b,(b.rg=frontRanges(b.bs,fd)),false,b.al);if(ch)ringsOn(s,t,b,c);}
    impactDraw(s,t,true,c,fd);breakDraw(s,t,false,c,fd);}
  else{
    gather(s,t,b||{hx:AN.x,hy:AN.y,ang:0,len:1,w:1,cu:s.u},false,c);
    if(!broke){if(s.d===0)drawBlade(c,b,0,1,b.al*.2);else{const rg=frontRanges(b.bs,fd);drawRanges(c,b,rg,true,b.al);drawRanges(c,b,rg,false,b.al*.2);}}                                                           // faint pass over the body: the player stays readable
    impactDraw(s,t,false,c,fd);breakDraw(s,t,true,c,fd);}
  c.restore();}
/* ================================================= hero sprite hook ================================================= */
const BLEND_IN=.10,BLEND_OUT=.08;let EX=null,seen=-1;
function sprDraw(kind,d,i,x,y,alpha){const dd=kind===5?DATAC[d]:kind===4?DATA4[d]:DATA[d],im=kind===5?IMGC[d]:kind===4?IMG4[d]:IMG[d],r=dd&&dd.rects[i];if(!r||!okI(im))return;ctx.save();ctx.globalAlpha=alpha;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.drawImage(im,r[0],r[1],r[2],r[3],x+(r[4]-F.ax)*K,y+HD.footY+(r[5]-F.ay)*K,r[2]*K,r[3]*K);ctx.restore();}
const idxOf=fs=>Math.max(0,Math.min(N-1,Math.floor(fs-F0+.06)));
function pose1w(nf){return pose1(nf<6?1:1+(nf-6)*1.8);}   // old-frame fallback (other directions) squeezed onto the new timeline
function pose1(nf){if(nf<7)return {a:39,b:null,u:0};if(nf<10.5)return {a:39+5*ss((nf-7)/3.5),b:null,u:0};if(nf<14)return {a:44,b:null,u:0};if(nf<17)return {a:44,b:68,u:ss((nf-14)/3)};return {a:68+11*ss((nf-17)/13),b:null,u:0};}
{const o=drawPlayerSprite;drawPlayerSprite=function(x,y,bob,fa){
  const s=S,ov=SPR_OVR.player;
  if(!s||!L.test||!ov||!ov.hero3d||!okI(IMG[s.d])){   // not casting: the breaking blade keeps fading for a moment, then the exit blend
    if(V&&V.over&&V.tEnd!=null&&clk()<TAILEND&&L.fx&&ov&&ov.hero3d&&!s&&DATA[V.d]){
      try{AN={x,y:y+HD.footY};const sv=V.t;V.t=V.tEnd+(clk()-V.endAt);layer(V,true);const rr=o.apply(this,arguments);
        if(EX){const u=(clk()-EX.t)/BLEND_OUT;if(u>=0&&u<1)sprDraw(EX.k,EX.d,EX.i,x,y,1-ss(u));}layer(V,false);V.t=sv;return rr;}catch(e){L.err='tail '+e.message;}}
    else if(V&&V.over&&clk()>=TAILEND){V=null;PRT.length=0;}
    if(EX&&ov&&ov.hero3d&&!s){const u=(clk()-EX.t)/BLEND_OUT;if(u>=0&&u<1){const r=o.apply(this,arguments);try{sprDraw(EX.k,EX.d,EX.i,x,y,1-ss(u));}catch(e){}return r;}EX=null;}
    return o.apply(this,arguments);}
  try{
    if(s.id!==seen){seen=s.id;}
    AN={x,y:y+HD.footY};
    let kind=1,i=0,pose=null;
    if(s.phase==='charge'){pose={a:chargeFrame(Math.min(s.t,CFG.charge.max)),b:null,u:0};i=idxOf(pose.a);if(DATAC[s.d]&&okI(IMGC[s.d])){kind=5;i=cl(Math.floor(pose.a-DATAC[s.d].f0+.06),0,DATAC[s.d].n-1);}}
    else if(s.mode4){kind=4;i=cl(Math.round(nfOf(s.t-s.ts))-1,0,A4.n-1);}
    else{pose=pose1w(nfOf(s.t-s.ts));i=idxOf(pose.a);}
    if(L.fx)layer(s,true);
    const bi=s.t<BLEND_IN?ss(s.t/BLEND_IN):1;if(bi<1)o.apply(this,arguments);
    if(kind===4)sprDraw(4,s.d,i,x,y,bi);
    else if(kind===5)sprDraw(5,s.d,i,x,y,bi);
    else{sprDraw(1,s.d,i,x,y,bi);if(pose.b!=null)sprDraw(1,s.d,idxOf(pose.b),x,y,bi*ss(pose.u));}
    EX={t:clk(),i:kind>=4?i:idxOf(pose.b!=null&&pose.u>.5?pose.b:pose.a),d:s.d,k:kind};H.anchor={x:AN.x,y:AN.y};L.frames++;L.lastFrame=kind===4?'sk4:'+(i+1):kind===5?'chg:'+(DATAC[s.d].f0+i):F0+i;
    if(L.fx)layer(s,false);
  }catch(e){L.err='draw '+e.message;return o.apply(this,arguments);}
};}
/* ---------------- input (TEST / public mode only): hold N = charge, release = slash ---------------- */
const typing=e=>{const a=e.target||document.activeElement;return a&&/INPUT|TEXTAREA/.test(a.tagName);};
window.addEventListener('keydown',e=>{if(!L.test||e.repeat||typing(e))return;if((e.key||'').toLowerCase()==='n')press('key');});
window.addEventListener('keyup',e=>{if((e.key||'').toLowerCase()==='n')L.release();});
window.addEventListener('blur',()=>L.cancelInput('lost focus'));
document.addEventListener('visibilitychange',()=>{if(document.hidden)L.cancelInput('page hidden');});
window.addEventListener('pointercancel',()=>{if(S&&S.src==='ptr')L.cancelInput('pointer cancelled');});
window.addEventListener('touchcancel',()=>{if(S&&S.src==='ptr')L.cancelInput('touch cancelled');});
L.setTest=on=>{L.test=!!on;if(!on){L.held=false;finish('test mode off');V=null;PRT.length=0;}};
L.mul=dmgMul;L.len=lenOf;L.geo={eq:(d,fr)=>{const a=axisAtD(DATA4[d],fr),b=axisAt(A4,fr);return {u:Math.max(...a.u.map((x,i)=>Math.abs(x-b.u[i]))),h:Math.max(...a.h.map((x,i)=>Math.abs(x-b.h[i])))};},chg:(d,tc)=>{AN=AN||{x:0,y:0};calib();const fd=fdOf(d),cf=chargeFrame(tc),bs=mkBlade(axC(d,cf),{delta:0},6.23,handPx(d,1,cf)),sc=bladeScr(bs,fd),D=DATAC[d]||DATA[d],k=Math.floor(cf*4)/4,q=D.q[k.toFixed(2)];return {u:bs.u.map(x=>+x.toFixed(3)),fd:+fd.toFixed(3),sc:{ang:+(sc.ang*57.3).toFixed(1),len:Math.round(sc.len)},sp:[(q[5][0]-q[0][0])*K,(q[5][1]-q[0][1])*K].map(x=>Math.round(x))};},chk:(d,nf)=>{AN=AN||{x:0,y:0};calib();const ax=axisAt(A4,nf),fd=fdOf(d),bl=Object.assign(mkBlade(ax,{delta:0},1,handPx(d,4,nf))),sc=bladeScr(bl,fd),q=DATA4[d].q[nf.toFixed(2)],sh=[(q[0][0]-F.ax)*K,(q[0][1]-F.ay)*K];return {dh:[+(sc.hx-AN.x-sh[0]).toFixed(2),+(sc.hy-AN.y-sh[1]).toFixed(2)]};},PXM,ZPX,XA,YA,axisAt:(f)=>axisAt(A4||A0,f),bladeAtTau:(tau,u,delta)=>bladeAtTau({Lg:lenOf(u),delta:delta||0},tau)};
}catch(e){L.err='init '+e.message;}
})();

