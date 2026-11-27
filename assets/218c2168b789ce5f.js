
/* ---- candidate_sword_atk5_r18: p244 r3 Sword attack skill 5 "เขตแดนดาบพิทักษ์" guardian sword zone: 5 waves, heal, defence buff, FX (TEST only) ---- */
/* p244 r1 — Sword ATTACK skill 5 "เขตแดนดาบพิทักษ์" (candidate_sword_atk5_r9, TEST only, built on candidate_sword_atk4_r8). Not merged, not published.
   Module window.__SKATK5, cast / cooldown / ctx / buff id 'wsAtk5', key R.
   Spec (user 14 Oct 17:41):
     press to cast, NO target lock; a giant sword falls from above and plants at the hero's position (cfg.plant.fwd = a few px in front of the feet so the blade does not hide the hero; falls back to the feet when that spot is blocked).
     the sword stays still; the hero may walk and attack once the short call animation has ended.
     5 attack waves round the sword, starting 0 / 2.5 / 5 / 7.5 / 10 s after the plant; each wave spreads and fades in 1.5 s, then 1 s of rest; the skill ends 11.5 s after the plant and the sword dissolves.
     a monster is hit when the wave front reaches it (front radius eases out to cfg.radius over the wave), ONCE per wave; walls block (LOS from the sword base); no extra hit outside the 5 waves; a monster that walks into the circle behind the front is not hit by that wave.
     each wave = 100 % of the REAL basic sword swing (D().weapons[w].actionCoef x sum(weights)); max 500 %; radius 140 px; MP 35 charged ONCE at the press (never refunded); CD 25 s.
     ONE cast context (ctxFor) for all 5 waves and the game's own hitEnemy / C182 formula (b3 = wave index).
     heal: ONCE at a successful plant, 20 % of MaxHP through healP (never above MaxHp).
     defence: P.def +20 % for 11.5 s through a recalc wrapper (a STAT, not a direct damage cut; no B('def') key) on the caster even outside the circle; restored at the end.
     hero death / map change / weapon change / test mode off -> cancel the zone and the buff (P.dash, state, def restored).
   Works with the existing systems (nothing duplicated):
     Sword Skill 3 "นักดาบคลั่ง"  -> p237 r4 counts every wave that lands a hit as ONE beat (ctx id wsAtk5, b3 = wave): the first target of a wave spends the charge and ALL targets of that wave (even those reached later) get the same guaranteed crit.
     passives (mastery / sharp / breath) -> through the game's core() as every sword skill; chain passive is NOT filled and NO shadow.
   Visuals: the 8-direction sword PNG (window.__SKATK5_SWORD) is drawn as an upright billboard whose tip is the ground anchor (direction picked at the cast and kept); it is a pseudo entity in render() so it is y-sorted with the heroes and monsters;
     ground runes (white-gold ring front, glyph rings, spokes) are drawn in the ground pass and only while a wave is alive (never a solid disc); rest = sword + a faint glow at the base;
     impact flash, soft dust and soil chips; heal = green streaks into the hero; defence = a short gold shield; the 5th wave has extra rings + a light pillar but the same damage.
   Hero call animation: the existing r12 frames (window.__SK1ANIM / __SK1ANIM_DIRS) re-timed by cfg.call.seq (raise f28..41 -> hold -> settle f67..77). No new Blender action.
   Debug: window.__SKATK5. */
(function(){
'use strict';
const L=window.__SKATK5={ver:'p244-r3',err:null,test:false,fx:true,log:[],refused:[],casts:0,state:null,last:null,hitLog:[],waveLog:[],defLog:[],healLog:[],dirs:{},frames:0};
try{
const A0=window.__SK1ANIM,AD=window.__SK1ANIM_DIRS||{},HD=window.__HERO3D,H=window.HERO3D,SD=window.__SKATK5_SWORD;
if(!A0||!HD||!H||!SD||!SD.tt||!window.C182||!C182.api||typeof hitEnemy!=='function'||typeof update!=='function'||typeof blocked!=='function'||typeof drawPlayerSprite!=='function'||typeof playerDeath!=='function'||typeof render!=='function'||typeof drawSummon!=='function'||typeof surfaceFx!=='function'||typeof drawParts!=='function'||typeof recalc!=='function'||typeof healP!=='function'){
  L.err='hooks missing '+[!A0&&'__SK1ANIM',!HD&&'__HERO3D',!H&&'HERO3D',!SD&&'__SKATK5_SWORD',!window.C182&&'C182'].filter(Boolean).join(',');return;}
/* ---------------- config (single place) ---------------- */
const CFG=L.cfg={id:'wsAtk5',name:'เขตแดนดาบพิทักษ์',key:'R',
  cost:{mp:35,cd:25},
  radius:210,                                              // px, sword base -> monster body edge (monster size added)
  damage:{mul:[1,1,1,1,1],total:5},                        // each wave = 100 % of the real basic swing; max 500 %
  waves:{starts:[0,2.5,5,7.5,10],life:1.5,end:11.5},        // s after the plant; each wave spreads + fades in `life`, rest = start gap - life; zone ends at `end`
  heal:{pct:.20},
  def:{pct:.20,dur:11.5},
  call:{plantAt:.62,end:.95,seq:[{a:28,b:41,dur:.50},{a:41,b:41.4,dur:.12},{a:67,b:77,dur:.33,xf:.06}]},   // s from the press; source frames of the r12 action, re-timed (sum dur = call.end)
  plant:{fwd:34,dropFrom:.30,dropH:720},                    // fwd px in front of the feet; the sword falls from dropH px above the plant point between dropFrom and plantAt
  sword:{h:167,dissolve:.85,hover:25,bob:8,bobT:3.4,spinT:11},                               // world px (blade + hilt, tip to pommel; r3 = 70 % of r2's 238, r2 = 70 % of r1's 340); hover px tip above the ground; bob +-px with period bobT s; spinT s per full turn; dissolve s after the zone end
  dirs:'all'};
CFG.damage.total=+CFG.damage.mul.reduce((a,b)=>a+b,0).toFixed(4);
const NW=CFG.waves.starts.length,LAST=NW-1;
{let t=0;for(const s of CFG.call.seq){s.t0=t;t+=s.dur;}CFG.call.seqTotal=+t.toFixed(3);}
const ss=u=>u<=0?0:u>=1?1:u*u*(3-2*u),clk=()=>typeof time==='number'?time:performance.now()/1000;
const DN=['E','SE','S','SW','W','NW','N','NE'],DATA=DN.map((n,i)=>i===0?A0:AD[n]||null),IMG=DATA.map(d=>{if(!d)return null;const im=new Image();im.src=d.src;return im;});
const TT=SD.tt,TTI=new Image();TTI.src=TT.src;   // turntable sheet: TT.n frames of the Meshy sword (tip down), TT.cols per row
const okI=im=>im&&im.complete&&im.naturalWidth;
const F=HD.frame,K=HD.drawScale,F0=A0.f0,N=A0.n;
const dirIdx=g=>{const a=Math.atan2(Math.sin(g),Math.cos(g));return ((Math.round(a/(Math.PI/4))%8)+8)%8;};   // 0 = E (HERO3D order)
const camYaw=()=>{try{return typeof camY==='function'?camY():0;}catch(e){return 0;}};
const swordNow=()=>!!(P&&P.weapon&&P.weapon.t==='sword');
const UID=new WeakMap();let uidN=0;const uid=e=>{let v=UID.get(e);if(!v){v=++uidN;UID.set(e,v);}return v;};
L.uid=uid;   // test helper
const liveE=e=>!!(e&&!e.dead&&e.hp>0&&!e.dev&&!e.sprGhost&&!e.rush&&!e.removed);
const dirOk=d=>!!DATA[d]&&(CFG.dirs==='all'||(Array.isArray(CFG.dirs)&&CFG.dirs.includes(DN[d])));
const BID=CFG.id,PL={main:'#ffd36a',accent:'#fff2c4'};
let S=null,castN=0,TAILZ=null;
const mkRnd=seed=>{let r=(seed*7919+13)%2147483647;if(r<=0)r+=2147483646;return()=>{r=(r*16807)%2147483647;return r/2147483647;};};
function refuse(why){L.refused.push({t:+clk().toFixed(2),why});if(L.refused.length>30)L.refused.shift();try{textAt(P.x,P.y-62,'เขตแดนดาบพิทักษ์: '+why,'#ffb4a8',13);}catch(e){}return false;}
function los(x0,y0,x1,y1,stopShort){const Ln=Math.hypot(x1-x0,y1-y0),n=Math.max(1,Math.ceil((Ln-stopShort)/8));for(let i=1;i<=n;i++){const u=Math.min(1,(i*8)/Ln);if(u*Ln>Ln-stopShort)break;if(blocked(x0+(x1-x0)*u,y0+(y1-y0)*u,2))return false;}return true;}
/* ---------------- hero call animation timeline (cfg.call.seq) ---------------- */
function segAt(t){const sq=CFG.call.seq;for(let i=sq.length-1;i>=0;i--)if(t>=sq[i].t0)return i;return 0;}
function srcFrame(t){const sq=CFG.call.seq,i=segAt(t),s=sq[i],u=Math.max(0,Math.min(1,(t-s.t0)/s.dur));return s.a+(s.b-s.a)*u;}
L.srcFrame=srcFrame;
/* ---------------- damage context (same rule as skills 1-4: base = the real basic swing of the equipped weapon) ---------------- */
function castCtx(){
  const API=window.C182&&C182.api;if(!API||!API.ctxFor){L.err='ctx: C182 missing';return null;}
  const wt=P.weapon&&P.weapon.t,wd=API.D().weapons&&API.D().weapons[wt],W_=WEAPONS[wt]||{};
  if(!wd){L.err='ctx: no weapon data '+wt;return null;}
  const basic=wd.actionCoef*wd.weights.reduce((a,b)=>a+b,0);
  const def={id:CFG.id,mode:'native',coefTotal:basic,flatTotal:0,weights:CFG.damage.mul.map(()=>1),maxTargets:99,targeting:'around',element:'Neutral',range:CFG.radius+60};
  const c=API.ctxFor('skill',CFG.id,def,{dt:W_.magic?'mag':'phys',lvScale:1,m0:1,reach:CFG.radius+260,cdId:CFG.id});
  c.atk5={wt,basic,mul:CFG.damage.mul.slice()};return c;}
/* ---------------- cast ---------------- */
function plantPoint(a){
  const f=CFG.plant.fwd,x=P.x+Math.cos(a)*f,y=P.y+Math.sin(a)*f;
  try{if(!blocked(x,y,8)&&los(P.x,P.y,x,y,0))return [x,y,true];}catch(e){}return [P.x,P.y,false];}
function start(){
  if(!L.test)return refuse('ใช้ได้เฉพาะโหมดทดสอบ');
  if(!P||P.dead||G.state!=='play'||G.edit)return refuse('ใช้ไม่ได้ตอนนี้');
  if(!swordNow())return refuse('ต้องถือดาบ');
  if(!DATA.some((d,i)=>dirOk(i)&&IMG[i]&&okI(IMG[i])&&okI(TTI)))return refuse('ภาพยังโหลดไม่เสร็จ');
  if(S)return refuse('เขตแดนยังอยู่ (ไม่คิดซ้ำ)');
  const SK1=window.__SK1,SK2=window.__SK2L,SK3=window.__SK3,A3=window.__SKATK3,A4=window.__SKATK4;
  if((P.cds[CFG.id]||0)>0)return refuse(`คูลดาวน์ ${P.cds[CFG.id].toFixed(1)} วิ`);
  if(P.dash||P.casting||(SK1&&SK1.state)||(SK2&&SK2.state)||(SK3&&SK3.state)||(A3&&A3.state)||(A4&&A4.state))return refuse('กำลังทำท่าอื่น');
  if(P.mp<CFG.cost.mp)return refuse('MP ไม่พอ');
  const ctx=castCtx();if(!ctx)return refuse('ระบบดาเมจยังไม่พร้อม');
  P.mp-=CFG.cost.mp;P.cds[CFG.id]=CFG.cost.cd;                              // once per cast, never refunded
  const a=(typeof P.face==='number')?P.face:0,d=dirIdx(a+camYaw()),pp=plantPoint(a);
  TAILZ=null;
  S={id:++castN,t:0,d,dn:DN[d],face:a,zone:G.zone,ctx,x:pp[0],y:pp[1],fwdOk:pp[2],sx:P.x,sy:P.y,locked:true,planted:false,tPlant:null,buffOn:false,healed:false,defAdd:0,
     w:[],wdone:new Array(NW).fill(false),reg:new Set(),contacts:[],hits:[],dmg:[],ended:null,anim:dirOk(d)&&!!IMG[d],fx:null,hitN:0};
  P.face=a;P.dash={vx:0,vy:0,t:99,atk5:1,hit:new Set()};
  L.casts++;L.state=S;L.dirs[S.dn]=(L.dirs[S.dn]||0)+1;L.log.push({cast:S.id,t0:+clk().toFixed(2),face:+a.toFixed(3),dir:S.dn,anim:S.anim,plant:[Math.round(S.x),Math.round(S.y)],fwdOk:S.fwdOk});return true;}
L.cast=start;
function unbuff(){
  if(!S||!S.buffOn)return;S.buffOn=false;S.defAdd=0;
  try{delete P.buffs[BID];}catch(e){}
  try{recalc();}catch(e){L.err='unbuff '+e.message;}
  try{L.defLog.push({ev:'off',cast:S.id,def:P.def,t:+clk().toFixed(2)});}catch(e){}}
function unlock(){try{if(P&&P.dash&&P.dash.atk5)P.dash=null;if(P){P.vx=0;P.vy=0;}}catch(e){}if(S)S.locked=false;}
function finish(why){if(!S)return;S.ended=why;
  L.log.push({cast:S.id,end:why,t:+S.t.toFixed(3),hits:S.hits.map(h=>[h.k,h.list.length])});
  unbuff();unlock();
  L.last=S;TAILZ=(why==='done')?{x:S.x,y:S.y,d:S.d,dn:S.dn,id:S.id,tp0:S.t,c0:clk(),contacts:S.contacts,fx:S.fx}:null;S=null;L.state=null;}
L.cancel=finish;
/* ---------------- plant: heal once + defence buff ---------------- */
function plant(){
  S.planted=true;S.tPlant=S.t;S.fx=impactFx(S.id);
  if(P&&!P.dead){
    const hp0=P.hp,mx=P.maxHp;C182.hsrc='wsAtk5';
    try{healP(P.maxHp*CFG.heal.pct);}catch(e){L.err='heal '+e.message;}finally{C182.hsrc=null;}
    S.healed=true;L.healLog.push({cast:S.id,t:+clk().toFixed(2),hp0,hp1:P.hp,max:mx,want:Math.round(mx*CFG.heal.pct)});
    const d0=P.def;
    P.buffs[BID]={t:CFG.def.dur+1,max:CFG.def.dur,pl:PL,wsDef:1};   // no 'def' key: B('def') is the direct damage multiplier, this is a STAT bonus applied in the recalc wrapper below; t is longer than the zone so the game never drops it first
    S.buffOn=true;
    try{recalc();}catch(e){L.err='buff recalc '+e.message;}
    L.defLog.push({ev:'on',cast:S.id,def0:d0,def1:P.def,add:S.defAdd,t:+clk().toFixed(2)});}
  L.log.push({cast:S.id,ev:'plant',t:+S.t.toFixed(3),x:Math.round(S.x),y:Math.round(S.y)});}
{const _rc=recalc;recalc=function(){const r=_rc.apply(this,arguments);try{if(P&&S&&S.buffOn){const a=Math.round(P.def*CFG.def.pct);S.defAdd=a;P.def+=a;}}catch(e){}return r;};}
/* ---------------- waves ---------------- */
const front=u=>{u=Math.max(0,Math.min(1,u));return 1-(1-u)*(1-u);};            // front radius fraction (eases out)
L.front=front;
function hitDamage(e,k){
  const ctx=S.ctx,m=CFG.damage.mul[k],prev=C182.cur;let pl;try{pl=wpal();}catch(_){}const hp0=e.hp;C182.cur=ctx;
  try{hitEnemy(e,m,{dt:ctx.dt,pl,ctx,b3:k});}catch(err){L.err='dmg '+err.message;}finally{C182.cur=prev;}
  S.dmg.push({wave:k+1,id:uid(e),m:+m.toFixed(3),coef:+(ctx.def.coefTotal*m).toFixed(3),cast:ctx.seq,hpLoss:Math.round(hp0-e.hp)});}
function tickWave(k,zt,u){
  const R=CFG.radius,rf=R*front(u);let W=S.w[k];if(!W)W=S.w[k]={m:new Map(),first:true,t0:S.t,n:0};
  const M=W.m,reached=[];
  for(const e of enemies.slice()){
    if(!liveE(e))continue;const id=uid(e),sz=e.sz||16,d=Math.hypot(e.x-S.x,e.y-S.y)-sz,st=M.get(id);   // d = distance from the sword base to the body edge
    if(d>rf){if(st!=='hit')M.set(id,'out');continue;}                                              // the front has not reached it yet
    if(st==='hit')continue;
    if(st==='out'||(st===undefined&&W.first)){                                                      // the front reaches it NOW
      if(!los(S.x,S.y,e.x,e.y,sz)){M.set(id,'wall');continue;}                                      // walls block
      const key=S.id+':'+k+':'+id;if(S.reg.has(key)){M.set(id,'hit');continue;}
      S.reg.add(key);M.set(id,'hit');reached.push({e,d,id,sz});}
    else if(st===undefined)M.set(id,'skip');                                                        // walked into the circle behind the front: not this wave
  }
  W.first=false;reached.sort((a,b)=>a.d-b.d);
  for(const r of reached){S.contacts.push({k,t:S.t,zt,x:r.e.x,y:r.e.y,sz:r.sz,last:k===LAST,seed:S.id*31+k*7+r.id});hitDamage(r.e,k);}
  if(reached.length||!W.logged){W.n+=reached.length;}
  if(reached.length){S.hitN+=reached.length;L.hitLog.push({cast:S.id,seq:S.ctx.seq,wave:k+1,t:+zt.toFixed(3),front:+rf.toFixed(1),n:reached.length,ids:reached.map(r=>r.id),d:reached.map(r=>+r.d.toFixed(1))});if(L.hitLog.length>600)L.hitLog.shift();}}
function step(dt){
  if(!S)return;
  if(!P||P.dead){finish('hero died');return;}
  if(G.zone!==S.zone||G.state!=='play'){finish('left the map');return;}
  if(!swordNow()){finish('weapon changed');return;}
  if(S.buffOn&&!(P.buffs&&P.buffs[BID])){finish('buff cleared');return;}
  if(S.locked){if(!P.dash||!P.dash.atk5)P.dash={vx:0,vy:0,t:99,atk5:1,hit:new Set()};P.dash.vx=0;P.dash.vy=0;P.dash.t=99;P.face=S.face;}
  S.t+=dt;
  if(!S.planted&&S.t>=CFG.call.plantAt){plant();if(!S)return;}
  if(S.locked&&S.t>=CFG.call.end)unlock();
  if(S.planted){
    const zt=S.t-CFG.call.plantAt,Wc=CFG.waves;
    for(let k=0;k<NW;k++){const ws=Wc.starts[k];if(zt<ws||S.wdone[k])continue;
      const u=Math.min(1,(zt-ws)/Wc.life);tickWave(k,zt,u);if(S&&zt>=ws+Wc.life){S.wdone[k]=true;S.hits.push({k:k+1,list:(S.w[k]&&[...S.w[k].m.entries()].filter(x=>x[1]==='hit').map(x=>x[0]))||[]});L.waveLog.push({cast:S.id,wave:k+1,t:+zt.toFixed(3),n:S.w[k]?S.w[k].n:0});}
      if(!S)return;}
    if(zt>=Wc.end)finish('done');}}
{const o=update;update=function(dt){
  let r;
  try{r=o.apply(this,arguments);}
  finally{try{step(dt);}catch(e){L.err='step '+e.message;try{finish('error');}catch(_){}}}
  return r;};}
{const o=playerDeath;playerDeath=function(){try{if(S)finish('hero died');}catch(e){}return o.apply(this,arguments);};}
if(typeof loadZone==='function'){const o=loadZone;loadZone=function(){try{if(S)finish('left the map');}catch(e){}return o.apply(this,arguments);};}
/* ================================================= visuals ================================================= */
const GOLD=[255,205,110],WHT=[255,248,228],WARM=[255,226,160],GRN=[120,255,160],SOIL=[104,78,54];
const rgba=(c,a)=>`rgba(${c[0]},${c[1]},${c[2]},${Math.max(0,Math.min(1,a)).toFixed(3)})`;
const VS=()=>S||(TAILZ&&tpNow()<CFG.call.plantAt+CFG.waves.end+CFG.sword.dissolve+.05?TAILZ:null);
function tpNow(){return S?S.t:(TAILZ?TAILZ.tp0+(clk()-TAILZ.c0):0);}
L.vis=()=>!!VS();
/* impact particles (made once at the plant, drawn analytically from their age) */
function impactFx(seed){const R=mkRnd(seed+5),dust=[],chips=[],sparks=[];
  for(let i=0;i<26;i++){const a=R()*6.283;dust.push({a,sp:26+R()*60,rise:12+R()*42,r0:5+R()*7,r1:18+R()*18,life:.75+R()*.7,tone:R(),dl:R()*.05});}
  for(let i=0;i<18;i++){const a=R()*6.283;chips.push({a,sp:50+R()*130,vz:150+R()*130,s:2.2+R()*2.6,rot:R()*6.3,spin:(R()-.5)*16,life:1.25,shape:4+Math.floor(R()*3),hue:R()});}
  for(let i=0;i<24;i++){const a=R()*6.283;sparks.push({a,sp:80+R()*140,vz:50+R()*170,life:.4+R()*.4,w:1.4+R()*1.6});}
  return {dust,chips,sparks};}
function glyph(c,type,s){
  switch(type%5){
    case 0:c.moveTo(-s,0);c.lineTo(s,0);break;
    case 1:c.moveTo(-s*.6,-s*.7);c.lineTo(s*.5,0);c.lineTo(-s*.6,s*.7);break;
    case 2:c.moveTo(0,-s);c.lineTo(s*.7,0);c.lineTo(0,s);c.lineTo(-s*.7,0);c.closePath();break;
    case 3:c.moveTo(-s*.7,-s*.7);c.lineTo(s*.7,s*.7);c.moveTo(s*.7,-s*.7);c.lineTo(-s*.7,s*.7);break;
    default:c.moveTo(-s,-s*.5);c.lineTo(s,-s*.5);c.moveTo(-s,s*.5);c.lineTo(s,s*.5);}}
function glyphRing(c,cx,cy,rr,n,rot,s,col,al,sw,seed){
  if(al<.02||rr<4)return;
  for(const pass of [0,1]){c.strokeStyle=pass?rgba(col,al):`rgba(74,46,10,${(al*.42).toFixed(3)})`;c.lineWidth=pass?sw:sw+2.2;
    for(let i=0;i<n;i++){const an=i/n*6.2832+rot;c.save();c.translate(cx+Math.cos(an)*rr,cy+Math.sin(an)*rr);c.rotate(an);c.beginPath();glyph(c,(i+seed)%5,s);c.stroke();c.restore();}}}
function circ(c,cx,cy,r,w,col,al,dash,under){if(al<.02||r<1)return;if(dash)c.setLineDash(dash);
  if(under){c.strokeStyle=`rgba(74,46,10,${(al*.40).toFixed(3)})`;c.lineWidth=w+2.4;c.beginPath();c.arc(cx,cy,r,0,6.2832);c.stroke();}
  c.strokeStyle=rgba(col,al);c.lineWidth=w;c.beginPath();c.arc(cx,cy,r,0,6.2832);c.stroke();if(dash)c.setLineDash([]);}
/* ---- ground pass: world coordinates under camApply (the camera foreshortens the circles) ---- */
function groundFx(c,V,tp){
  const zt=tp-CFG.call.plantAt,R=CFG.radius,cx=V.x,cy=V.y,Wc=CFG.waves,endT=Wc.end,dis=CFG.sword.dissolve;
  c.save();
  /* the call: faint seal + shadow of the falling sword */
  if(tp>=CFG.plant.dropFrom-.04&&tp<CFG.call.plantAt){const u=Math.max(0,Math.min(1,(tp-CFG.plant.dropFrom)/(CFG.call.plantAt-CFG.plant.dropFrom))),sh=u*u;
    c.fillStyle=`rgba(0,0,0,${(.10+.30*sh).toFixed(3)})`;c.beginPath();c.ellipse(cx,cy+2,7+16*sh,3+6*sh,0,0,6.2832);c.fill();
    c.globalCompositeOperation='lighter';circ(c,cx,cy,34-14*sh,1.6,GOLD,.5*Math.min(1,u*3)*(1-.4*sh));glyphRing(c,cx,cy,34-14*sh,10,tp*3,3.2,WHT,.55*Math.min(1,u*3),1.3,0);}
  if(zt>=0&&zt<endT+dis){
    const fade=zt>endT?Math.max(0,1-(zt-endT)/dis):1,sealA=fade*(zt<.3?ss(zt/.3):1);
    /* rest glow + small seal at the sword base (always while the sword stands) */
    c.globalCompositeOperation='lighter';
    {const br=.5+.5*Math.sin(zt*2.6),r=54+4*br,g=c.createRadialGradient(cx,cy,2,cx,cy,r);g.addColorStop(0,rgba(WARM,(.30+.07*br)*sealA));g.addColorStop(.5,rgba(GOLD,.12*sealA));g.addColorStop(1,rgba(GOLD,0));c.fillStyle=g;c.beginPath();c.arc(cx,cy,r,0,6.2832);c.fill();}
    circ(c,cx,cy,24,1.5,GOLD,.45*sealA);glyphRing(c,cx,cy,24,8,zt*.6,2.6,WHT,.5*sealA,1.2,2);circ(c,cx,cy,31,1,WHT,.28*sealA,[3,6]);
    /* plant shock ring */
    if(zt<.55){const u=zt/.55,r=14+100*(CFG.radius/140)*front(u);circ(c,cx,cy,r,5*(1-u)+.8,WHT,.95*Math.pow(1-u,1.3),null,true);circ(c,cx,cy,r*.8,2.4,GOLD,.6*Math.pow(1-u,1.3),null,true);}
    /* the five waves */
    for(let k=0;k<NW;k++){
      const ws=Wc.starts[k],a=zt-ws;if(a<0||a>=Wc.life)continue;const u=a/Wc.life,big=k===LAST,fr=front(u),rf=R*fr;if(rf<2)continue;
      const env=(u<.06?u/.06:1)*Math.pow(1-Math.pow(u,1.7),1.2)*(big?1.15:1),gs=(big?1.3:1.12),rot=k*.7+a*.9;
      c.globalCompositeOperation='source-over';
      {const g=c.createRadialGradient(cx,cy,Math.max(0,rf-R*.42),cx,cy,rf+6);g.addColorStop(0,rgba(GOLD,0));g.addColorStop(.62,rgba(GOLD,.22*env));g.addColorStop(.93,rgba([255,236,170],.58*env));g.addColorStop(1,rgba(WHT,0));c.fillStyle=g;c.beginPath();c.arc(cx,cy,rf+6,0,6.2832);c.fill();}
      c.shadowColor='rgba(255,214,120,.95)';c.shadowBlur=big?20:13;
      circ(c,cx,cy,rf,(4.2+4.2*(1-u))*gs,WHT,.98*env,null,true);c.shadowBlur=0;
      circ(c,cx,cy,Math.max(1,rf-7*gs),2.2*gs,GOLD,.8*env,null,true);
      if(fr>.15){
        glyphRing(c,cx,cy,rf*.86,26,rot,(5+R*.034)*gs,[255,240,190],.95*env,2.2*gs,k);circ(c,cx,cy,rf*.86,1.4,GOLD,.55*env,[3,6],true);
        if(fr>.28){glyphRing(c,cx,cy,rf*.62,16,-rot*1.3,(6.4+R*.04)*gs,WHT,.92*env,2.4*gs,k+2);circ(c,cx,cy,rf*.62,1.4,WHT,.5*env,[7,7],true);}
        if(big&&fr>.4){glyphRing(c,cx,cy,rf*.40,10,rot*1.8,(7+R*.044)*gs,GOLD,.95*env,2.8,k+1);circ(c,cx,cy,rf*.40,2.2,WHT,.7*env,null,true);circ(c,cx,cy,rf*.93,1.6,WHT,.55*env,[10,5]);}
        c.strokeStyle=rgba(GOLD,.38*env);c.lineWidth=1.4;for(let i=0;i<12;i++){const an=i/12*6.2832+rot*.4;c.beginPath();c.moveTo(cx+Math.cos(an)*rf*.18,cy+Math.sin(an)*rf*.18);c.lineTo(cx+Math.cos(an)*rf*.97,cy+Math.sin(an)*rf*.97);c.stroke();}}
      /* bloom */
      c.globalCompositeOperation='lighter';
      {const g=c.createRadialGradient(cx,cy,Math.max(0,rf-R*.2),cx,cy,rf+10);g.addColorStop(0,rgba(GOLD,0));g.addColorStop(.8,rgba(WARM,.18*env));g.addColorStop(1,rgba(WHT,0));c.fillStyle=g;c.beginPath();c.arc(cx,cy,rf+10,0,6.2832);c.fill();}
      c.globalCompositeOperation='source-over';
      if(big&&u>.12){const r2=R*front(Math.max(0,u-.14));circ(c,cx,cy,r2,2.6,GOLD,.7*env*(1-u),null,true);}   // echo ring behind the last front
    }}
  c.restore();}
/* ---- sword billboard (drawn inside the pseudo entity, anchor = the tip at the ground, upright) ---- */
function pulseAt(zt){let p=0;for(let k=0;k<NW;k++){const a=zt-CFG.waves.starts[k],len=k===LAST?.85:.5;if(a>=0&&a<len)p=Math.max(p,Math.pow(1-a/len,1.6)*(k===LAST?1.35:1));}return p;}
function swordDraw(){
  const V=VS();if(!V)return;const tp=tpNow(),im=TTI,m=TT;if(!okI(im))return;
  const c=ctx,zt=tp-CFG.call.plantAt,dis=CFG.sword.dissolve,endT=CFG.waves.end,HH=CFG.sword.h,ks=HH/(m.tipy-m.top),x=V.x,y=V.y,SW=CFG.sword;
  if(tp<CFG.plant.dropFrom)return;
  let off=0,alpha=1,cut=0;const falling=tp<CFG.call.plantAt;
  if(falling){const u=(tp-CFG.plant.dropFrom)/(CFG.call.plantAt-CFG.plant.dropFrom);off=CFG.plant.dropH*(1-u*u);alpha=Math.min(1,u*6);}
  else if(zt>endT)cut=Math.min(1,(zt-endT)/dis);
  /* float: hover + slow bob; spin = one full turn per spinT s through all TT.n views (start phase from the cast id) */
  const bobAmp=falling?0:SW.bob*ss(Math.min(1,zt/.5)),bob=Math.sin(Math.max(0,zt)*6.2832/SW.bobT)*bobAmp,lift=SW.hover+bob,
        ph=((Math.max(0,tp-CFG.plant.dropFrom)/SW.spinT)+((V.id||0)*.37))%1,fq=ph*m.n,fi=Math.floor(fq)%m.n,ft=fq-Math.floor(fq),fj=(fi+1)%m.n,sx0=(fi%m.cols)*m.fw,sy0=Math.floor(fi/m.cols)*m.fh,sx1=(fj%m.cols)*m.fw,sy1=Math.floor(fj/m.cols)*m.fh;
  const p=falling?0:pulseAt(zt),bx=x-m.tipx*ks,by=y-lift-m.tipy*ks-off,pw=m.fw*ks,ph2=m.fh*ks,Lf=lift+off;
  c.save();
  /* contact shadow */
  if(!falling&&cut<1){c.globalAlpha=.42*(1-cut);c.fillStyle='#000';c.beginPath();{const sh=1-.28*Math.max(0,Math.min(1,(lift-SW.hover+SW.bob)/(2*SW.bob)));c.ellipse(x+1.5,y+1.5,12*sh,4*sh,0,0,6.2832);};c.fill();}
  /* back glow along the blade */
  if(L.fx){c.globalCompositeOperation='lighter';c.save();c.translate(x,y-lift-HH*.5-off);c.scale(.55,1);
    const g=c.createRadialGradient(0,0,4,0,0,HH*.62);const ga=(falling?.20:(.12+.30*p))*(1-cut)*alpha;g.addColorStop(0,rgba(WARM,ga));g.addColorStop(1,rgba(GOLD,0));c.fillStyle=g;c.beginPath();c.arc(0,0,HH*.62,0,6.2832);c.fill();c.restore();
    /* light streak above the falling sword */
    if(falling){const top=by+m.tipy*ks-HH,g2=c.createLinearGradient(0,top-300,0,top+30);g2.addColorStop(0,rgba(WHT,0));g2.addColorStop(1,rgba(WHT,.55*alpha));c.fillStyle=g2;c.fillRect(x-5,top-300,10,330);
      const g3=c.createLinearGradient(0,top-300,0,top+30);g3.addColorStop(0,rgba(GOLD,0));g3.addColorStop(1,rgba(GOLD,.25*alpha));c.fillStyle=g3;c.fillRect(x-14,top-300,28,330);}
    c.globalCompositeOperation='source-over';}
  /* the sprite (dissolve: the blade is cut away from the tip upward) */
  c.globalAlpha=alpha;c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  const vh=m.fh*(1-cut);
  if(vh>1){c.drawImage(im,sx0,sy0,m.fw,vh,bx,by,pw,vh*ks);if(ft>.02){c.globalAlpha=alpha*ft;c.drawImage(im,sx1,sy1,m.fw,vh,bx,by,pw,vh*ks);c.globalAlpha=alpha;}
    if(p>.02&&L.fx){c.globalCompositeOperation='lighter';c.globalAlpha=Math.min(1,p*.5)*alpha;c.drawImage(im,sx0,sy0,m.fw,vh,bx,by,pw,vh*ks);if(ft>.02){c.globalAlpha*=ft;c.drawImage(im,sx1,sy1,m.fw,vh,bx,by,pw,vh*ks);}c.globalCompositeOperation='source-over';}}
  c.globalAlpha=1;
  if(L.fx){
    /* thin light thread from the hovering tip to the ground + soft tip glow */
    if(!falling&&cut<1){c.globalCompositeOperation='lighter';const g=c.createLinearGradient(0,y-lift,0,y);g.addColorStop(0,rgba(WHT,.55*(1-cut)));g.addColorStop(1,rgba(GOLD,0));c.fillStyle=g;c.fillRect(x-.8,y-lift,1.6,lift);
      const gg=c.createRadialGradient(x,y-lift,0,x,y-lift,11);gg.addColorStop(0,rgba(WHT,.5*(1-cut)));gg.addColorStop(1,rgba(GOLD,0));c.fillStyle=gg;c.beginPath();c.arc(x,y-lift,11,0,6.2832);c.fill();c.globalCompositeOperation='source-over';}
    /* dissolve: bright cut line + rising motes released as the cut passes (analytic, seeded) */
    if(cut>0){const R=mkRnd(V.id*13+3),ad=zt-endT;c.globalCompositeOperation='lighter';
      if(cut<1){const hy=by+vh*ks,wd=Math.max(8,pw*.55);const g=c.createLinearGradient(x-wd,0,x+wd,0);g.addColorStop(0,rgba(GOLD,0));g.addColorStop(.5,rgba(WHT,.85));g.addColorStop(1,rgba(GOLD,0));c.fillStyle=g;c.fillRect(x-wd,hy-2,wd*2,4);}
      for(let i=0;i<70;i++){const v=R(),rx=(R()-.5),rs=22+R()*60,sz=1.6+R()*3.2,tone=R(),rt=v*dis,a=ad-rt;if(a<0||a>1)continue;
        const hw=pw*(v>.7?.28:.5)*.9,px=x+rx*hw*2,py=y-lift-v*(m.tipy-m.top)*ks-a*rs,al=Math.pow(1-a,1.3);c.fillStyle=rgba(tone>.4?WHT:GOLD,al*.9);c.beginPath();c.arc(px,py,sz*(1-a*.5),0,6.2832);c.fill();}
      c.globalCompositeOperation='source-over';}
    /* last-wave light pillar */
    if(!falling&&cut<1){const a=zt-CFG.waves.starts[LAST];if(a>=0&&a<1.3){const e=(a<.1?a/.1:Math.pow(1-(a-.1)/1.2,1.5)),wd=22+16*Math.sin(Math.min(1,a/.3)*1.57),top=y-HH*1.9;
      c.globalCompositeOperation='lighter';
      for(const [w_,col,al] of [[wd*1.3,GOLD,.30],[wd*.6,WHT,.55]]){const gv=c.createLinearGradient(0,top,0,y);gv.addColorStop(0,rgba(col,0));gv.addColorStop(.75,rgba(col,al*e));gv.addColorStop(1,rgba(col,al*e*.7));
        const tmp=c;c.save();c.beginPath();c.rect(x-w_,top,w_*2,y-top);c.clip();
        for(let q=0;q<6;q++){const ww=w_*(1-q/6);c.globalAlpha=1/6*1.6;c.fillStyle=gv;c.fillRect(x-ww,top,ww*2,y-top);}c.restore();c.globalAlpha=1;}
      const R=mkRnd(V.id*17+9);for(let i=0;i<30;i++){const t0=R()*.5,aa=a-t0;if(aa<0||aa>1)continue;const ox=(R()-.5)*pw*.9,rise=60+R()*150;c.fillStyle=rgba(i%2?WHT:GOLD,(1-aa)*.8);c.beginPath();c.arc(x+ox,y-aa*rise-8,1.6+R()*2,0,6.2832);c.fill();}
      c.globalCompositeOperation='source-over';}}
    /* plant impact: flash, dust, soil chips, sparks */
    if(!falling&&V.fx&&zt<1.6){impactDraw(c,V,zt);}
  }
  c.restore();}
function impactDraw(c,V,a){
  const x=V.x,y=V.y,fx=V.fx,T=(typeof camT==='function'?camT():1);
  const off=(ang,dist)=>{let o;try{o=wl(Math.cos(ang)*dist,Math.sin(ang)*dist);}catch(e){o=[Math.cos(ang)*dist,Math.sin(ang)*dist*T];}return o;};
  if(a<.4){const u=a/.4,r=24+120*front(u),g=c.createRadialGradient(x,y-6,2,x,y-6,r);c.globalCompositeOperation='lighter';g.addColorStop(0,rgba(WHT,.95*Math.pow(1-u,1.5)));g.addColorStop(.35,rgba(GOLD,.55*Math.pow(1-u,1.5)));g.addColorStop(1,rgba(GOLD,0));c.fillStyle=g;c.beginPath();c.ellipse(x,y-6,r,r*.8,0,0,6.2832);c.fill();c.globalCompositeOperation='source-over';}
  for(const p of fx.dust){const t=a-p.dl;if(t<0||t>p.life)continue;const u=t/p.life,tr=p.sp*(1-Math.exp(-t*3))/3,o=off(p.a,tr),ease=1-Math.pow(1-Math.min(1,t/(p.life*.35)),3),r=p.r0+(p.r1-p.r0)*ease,al=Math.min(1,t*14)*Math.pow(1-u,1.4)*.62;
    const px=x+o[0],py=y+o[1]-p.rise*(1-Math.exp(-t*2.2))/2.2*1.0,cc=[176+Math.round(p.tone*40),152+Math.round(p.tone*34),116+Math.round(p.tone*28)];
    const g=c.createRadialGradient(px-r*.2,py-r*.25,r*.1,px,py,r);g.addColorStop(0,`rgba(${cc[0]+36},${cc[1]+32},${cc[2]+28},${al.toFixed(3)})`);g.addColorStop(1,`rgba(${cc[0]},${cc[1]},${cc[2]},0)`);c.fillStyle=g;c.beginPath();c.arc(px,py,r,0,6.2832);c.fill();}
  for(const p of fx.chips){const t=a;if(t>p.life)continue;const tl=2*p.vz/620,tt=Math.min(t,tl),o=off(p.a,p.sp*tt*.9),z=t<tl?Math.max(0,p.vz*t-310*t*t):0,px=x+o[0],py=y+o[1]-z,al=t>p.life-.3?Math.max(0,(p.life-t)/.3):1,rot=p.rot+p.spin*Math.min(t,tl),s=p.s;
    c.save();c.translate(px,py);c.rotate(rot);c.fillStyle=`rgba(${SOIL[0]+Math.round(p.hue*30)},${SOIL[1]+Math.round(p.hue*22)},${SOIL[2]+Math.round(p.hue*16)},${al.toFixed(3)})`;c.strokeStyle=`rgba(46,34,24,${(al*.8).toFixed(3)})`;c.lineWidth=.8;
    c.beginPath();for(let i=0;i<p.shape;i++){const an=i/p.shape*6.2832,rd=s*(i%2?.7:1.1);i?c.lineTo(Math.cos(an)*rd,Math.sin(an)*rd*.8):c.moveTo(Math.cos(an)*rd,Math.sin(an)*rd*.8);}c.closePath();c.fill();c.stroke();c.restore();}
  c.globalCompositeOperation='lighter';
  for(const p of fx.sparks){const t=a;if(t>p.life)continue;const u=t/p.life,o=off(p.a,p.sp*t*.8),z=Math.max(0,p.vz*t-300*t*t),px=x+o[0],py=y+o[1]-z,o2=off(p.a,p.sp*Math.max(0,t-.04)*.8),z2=Math.max(0,p.vz*Math.max(0,t-.04)-300*Math.max(0,t-.04)**2);
    c.strokeStyle=rgba(u<.4?WHT:GOLD,(1-u)*.95);c.lineWidth=p.w;c.beginPath();c.moveTo(x+o2[0],y+o2[1]-z2);c.lineTo(px,py);c.stroke();}
  c.globalCompositeOperation='source-over';}
/* ---- top layer (after all entities): heal streaks + gold shield on the hero, hit sparks on the monsters ---- */
function heroFx(c,tpA){
  const zt=tpA-CFG.call.plantAt;if(zt<0||zt>1.3||!P)return;const cx=P.x,cy=P.y-52;
  /* heal: green streaks curving into the hero */
  if(zt<1.0&&S&&S.healed){const R=mkRnd((S.id||1)*3+1);c.globalCompositeOperation='lighter';
    for(let i=0;i<20;i++){const ang=i/20*6.2832+R()*.5,r0=58+R()*46,dl=R()*.28,du=.46+R()*.16,sw=(R()<.5?1:-1)*(.9+R()*.8),s=(zt-dl)/du;if(s<0||s>1.3)continue;
      const head=Math.min(1,s),tail=Math.max(0,head-.4),pts=[];for(let j=0;j<=10;j++){const q=tail+(head-tail)*j/10,rr=r0*Math.pow(1-q,1.15),an=ang+sw*(1-q)*1.2;pts.push([cx+Math.cos(an)*rr,cy+Math.sin(an)*rr*.78-12*q]);}
      const fo=s>1?Math.max(0,1-(s-1)/.3):1;
      for(let j=0;j<10;j++){const f=(j+1)/10,al=f*f*.9*fo;c.strokeStyle=rgba(GRN,al);c.lineWidth=1.2+3.2*f;c.lineCap='round';c.beginPath();c.moveTo(pts[j][0],pts[j][1]);c.lineTo(pts[j+1][0],pts[j+1][1]);c.stroke();
        c.strokeStyle=rgba([220,255,230],al*.8);c.lineWidth=.8+1.1*f;c.beginPath();c.moveTo(pts[j][0],pts[j][1]);c.lineTo(pts[j+1][0],pts[j+1][1]);c.stroke();}
      c.lineCap='butt';}
    const ga=ss((zt-.25)/.25)*Math.max(0,1-(zt-.6)/.4);if(ga>.02){const g=c.createRadialGradient(cx,cy,2,cx,cy,52);g.addColorStop(0,rgba(GRN,.55*ga));g.addColorStop(1,rgba(GRN,0));c.fillStyle=g;c.beginPath();c.arc(cx,cy,52,0,6.2832);c.fill();}
    c.globalCompositeOperation='source-over';}
  /* defence: a short gold shield (dome + heater-shield emblem) */
  if(zt<1.15){const e=zt<.12?zt/.12:Math.pow(Math.max(0,1-(zt-.12)/1.03),1.35);
    if(e>.02){c.save();c.globalCompositeOperation='lighter';
      const g=c.createRadialGradient(cx,cy,10,cx,cy,50);g.addColorStop(0,rgba(GOLD,0));g.addColorStop(.75,rgba(GOLD,.20*e));g.addColorStop(1,rgba(WHT,.5*e));c.fillStyle=g;c.beginPath();c.ellipse(cx,cy,38,54,0,0,6.2832);c.fill();
      c.strokeStyle=rgba(WHT,.85*e);c.lineWidth=1.8;c.beginPath();c.ellipse(cx,cy,38,54,0,0,6.2832);c.stroke();
      c.strokeStyle=rgba(GOLD,.4*e);c.lineWidth=1;for(let i=-1;i<=1;i++){c.beginPath();c.ellipse(cx,cy+i*17,36*Math.sqrt(1-Math.pow(i*17/54,2)),5,0,0,6.2832);c.stroke();}
      c.beginPath();c.ellipse(cx,cy,14,54,0,0,6.2832);c.stroke();
      c.restore();
      const rise=-18*ss(zt/1.1),sc=.85+.25*ss(zt/.3),W_=13*sc,Hh=17*sc,ox=cx,oy=cy-6+rise;
      c.save();c.globalAlpha=Math.min(1,e*1.15);c.translate(ox,oy);
      const sh=()=>{c.beginPath();c.moveTo(-W_,-Hh*.8);c.quadraticCurveTo(0,-Hh*1.05,W_,-Hh*.8);c.lineTo(W_,-Hh*.05);c.quadraticCurveTo(W_*.8,Hh*.62,0,Hh);c.quadraticCurveTo(-W_*.8,Hh*.62,-W_,-Hh*.05);c.closePath();};
      sh();const gg=c.createLinearGradient(-W_,-Hh,W_,Hh);gg.addColorStop(0,'#fff0b8');gg.addColorStop(.5,'#ffc94f');gg.addColorStop(1,'#c8821e');c.fillStyle=gg;c.fill();c.lineWidth=1.8;c.strokeStyle='#7a4a10';c.stroke();
      c.save();c.scale(.72,.72);sh();c.lineWidth=1.4;c.strokeStyle='rgba(255,250,222,.9)';c.stroke();c.restore();
      c.beginPath();c.moveTo(0,-Hh*.55);c.lineTo(0,Hh*.5);c.moveTo(-W_*.45,-Hh*.15);c.lineTo(W_*.45,-Hh*.15);c.lineWidth=2;c.strokeStyle='rgba(255,252,236,.95)';c.stroke();
      c.restore();}}}
function hitFx(c,h,zt){
  const a=zt-h.zt,life=h.last?.30:.22;if(a<0||a>=life)return;const u=a/life,x=h.x,y=h.y-(h.sz||16)*.9,fS=h.last?1.3:.9;
  c.save();c.globalCompositeOperation='lighter';
  const r=(14+22*front(u))*fS,g=c.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,rgba(WHT,.95*(1-u)));g.addColorStop(.45,rgba(GOLD,.55*(1-u)));g.addColorStop(1,rgba(GOLD,0));c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,6.2832);c.fill();
  const R=mkRnd(h.seed),n=h.last?12:7;c.lineWidth=1.8;for(let i=0;i<n;i++){const an=R()*6.2832,L1=(18+R()*24)*fS*(.5+u),L0=L1*u*.5;c.strokeStyle=rgba(i%2?WHT:GOLD,(1-u)*.95);c.beginPath();c.moveTo(x+Math.cos(an)*L0,y+Math.sin(an)*L0*.85);c.lineTo(x+Math.cos(an)*L1,y+Math.sin(an)*L1*.85);c.stroke();}
  c.restore();}
/* ---------------- hooks: ground pass / pseudo entity / top layer ---------------- */
const ENT={x:0,y:0,sd:{col:'#ffd98a'},wsAtk5:true,hp:1,t:0,life:9};delete ENT.t;
{const o=surfaceFx;surfaceFx=function(Z){const r=o.apply(this,arguments);try{const V=VS();if(V&&L.fx)groundFx(ctx,V,tpNow());}catch(e){L.err='ground '+e.message;}return r;};}
{const o=render;render=function(){let added=false;try{const V=VS();if(V&&typeof summons!=='undefined'&&Array.isArray(summons)&&tpNow()>=CFG.plant.dropFrom){ENT.x=V.x;ENT.y=V.y;summons.push(ENT);added=true;}}catch(e){L.err='ent '+e.message;}
  try{return o.apply(this,arguments);}finally{if(added){try{const i=summons.indexOf(ENT);if(i>=0)summons.splice(i,1);}catch(e){}}}};}
{const o=drawSummon;drawSummon=function(u){if(u&&u.wsAtk5){try{swordDraw();}catch(e){L.err='sword '+e.message;}return;}return o.apply(this,arguments);};}
{const o=drawParts;drawParts=function(){const r=o.apply(this,arguments);
  try{const V=VS();if(V&&L.fx){const tp=tpNow(),zt=tp-CFG.call.plantAt;
    for(const h of V.contacts||[]){if(zt-h.zt>.4)continue;bb(h.x,h.y,()=>hitFx(ctx,h,zt));}
    if(S&&P)bb(P.x,P.y,()=>heroFx(ctx,tp));}}catch(e){L.err='top '+e.message;}
  return r;};}
/* ---------------- hero sprite (call animation) ---------------- */
const BLEND_IN=.10,BLEND_OUT=.08;let EX=null;
function skillSprite(d,i,x,y,alpha){const dd=DATA[d],r=dd.rects[i];if(!r||!okI(IMG[d]))return;ctx.save();ctx.globalAlpha=alpha;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.drawImage(IMG[d],r[0],r[1],r[2],r[3],x+(r[4]-F.ax)*K,y+HD.footY+(r[5]-F.ay)*K,r[2]*K,r[3]*K);ctx.restore();}
const idxOf=fs=>Math.max(0,Math.min(N-1,Math.floor(fs-F0+.06)));
{const o=drawPlayerSprite;drawPlayerSprite=function(x,y,bob,fa){
  const s=S,ov=SPR_OVR.player;
  if(!s||!s.locked||!L.test||!ov||!ov.hero3d||!s.anim||!okI(IMG[s.d])){
    if(EX&&ov&&ov.hero3d&&!(s&&s.locked)&&okI(IMG[EX.d])){const u=(clk()-EX.t)/BLEND_OUT;if(u>=0&&u<1){const r=o.apply(this,arguments);try{skillSprite(EX.d,EX.i,x,y,1-ss(u));}catch(e){}return r;}EX=null;}
    return o.apply(this,arguments);}
  try{
    const t=Math.min(CFG.call.end,s.t),fs=srcFrame(t),i=idxOf(fs);
    const bi=s.t<BLEND_IN?ss(s.t/BLEND_IN):1;if(bi<1)o.apply(this,arguments);
    const sg=segAt(t),sq=CFG.call.seq[sg],ux=sq.xf?(t-sq.t0)/sq.xf:2;
    if(sg>0&&ux<1){skillSprite(s.d,idxOf(CFG.call.seq[sg-1].b),x,y,bi);skillSprite(s.d,i,x,y,bi*ss(ux));}else skillSprite(s.d,i,x,y,bi);
    EX={t:clk(),i,d:s.d};H.anchor={x:x,y:y+HD.footY};L.frames++;L.lastFrame=F0+i;
  }catch(e){L.err='draw '+e.message;return o.apply(this,arguments);}
};}
/* ---------------- key (TEST / public mode only) ---------------- */
window.addEventListener('keydown',e=>{if(!L.test)return;if((e.key==='r'||e.key==='R')&&!e.repeat&&!e.ctrlKey&&!e.metaKey&&!e.altKey){const a=document.activeElement;if(a&&/INPUT|TEXTAREA/.test(a.tagName))return;start();}});
L.setTest=on=>{L.test=!!on;if(!on)finish('test mode off');};
}catch(e){L.err='init '+e.message;}
})();

