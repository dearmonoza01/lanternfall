
/* ---- candidate_sword_atk5_r18: p246 r5 Sword buffs 3-5: ตั้งรับเหล็กกล้า / ย่างก้าวนักรบ / คมดาบดูดชีพ (TEST only) ---- */
/* p246 r5 = r1 + HUD chips show the supplied buff icons (p247) when present; no gameplay change. */
/* p246 r1 — Sword buffs 3-5 (candidate_sword_buffs_r1, TEST only, built on candidate_sword_atk5_r13). Not merged, not published.
   Spec (user 14 Oct 21:08). ALL tunable numbers live in __SKBUFF.cfg (single place); every value is an experiment value.
   3 ตั้งรับเหล็กกล้า   -30 % damage taken for 5 s. Goes through the game's own `reductions` step of the hurtPlayer resolveHit (no DEF added). Stacks with the passive "ยืนหยัดกลางศึก" MULTIPLICATIVELY:
                        the game's reductions are summed, so this module adds x = 0.30 x (1 - S) with S = the reductions already in the list (incl. the stand passive when it applies):
                        stand 0.10 + guard -> 1 - (0.10 + 0.27) = 0.63 = 0.70 x 0.90. MP 20 / CD 18.
   4 ย่างก้าวนักรบ     +25 % move speed for 6 s through the game's own B('speed') term (P.buffs entry). While it is on, every NEGATIVE B('speed') term (slow) is cut by 50 % (-40 % -> -20 %).
                        No attack-speed change, no animation-time change. The game's skill rules are untouched: Skill atk3 (วังวนเจ็ดคม) halves P.speed inside the game's update, i.e. 50 % of the already combined speed. MP 15 / CD 15.
   5 คมดาบดูดชีพ       lifesteal 8 % of the HP damage really dealt with the sword for 6 s: basic swing, sword skills and the passive shadow (cast contexts of kind basic / skill). Goes through the game's own lifesteal path
                        (applyDamage -> C182.lifesteal): the damage is passed as o.drain, overkill is not counted (actual = min(damage, HP before the hit)), dots / echo / thorn / reflected excluded.
                        Own budget: at most 15 % MaxHP healed per cast (all hits, all targets, real healing only, overheal does not use the budget); separate from the passive "ลมหายใจนักรบ" kill heal and the heal of attack skill 5.
                        Damage that lands after the buff ended gets no lifesteal (checked at the moment the damage is applied). MP 25 / CD 20.
   Rules: sword only; a press while the opening pose / the buff of the same kind runs is refused (no second cost, no stacking); different buffs run together; time-out / death / map change / weapon change clear the effect + FX;
          everything is computed through the buff state (no permanent value is multiplied); FX are drawn at draw time for any of the 8 directions (no new Blender action); the opening is a short reuse of the Skill 2 frames f26..f37 (0.32 s).
   HUD: one small timer chip per running buff (ring = remaining time, Thai name, seconds). No icon art has been supplied for these three buffs -> text chips, no placeholder art.
   Learning / slots / save are not part of this round. */
(function(){
'use strict';
const L=window.__SKBUFF={ver:'p246-r5',err:null,test:false,log:[],refused:[],ends:[],casts:0,heals:[],reduced:[],stats:{leechHeal:0,leechCalls:0,slowCut:0}};
try{
const D=window.__SK2D,HD=window.__HERO3D,H=window.HERO3D;
if(!D||!HD||!H||!window.C182||!C182.api||typeof update!=='function'||typeof drawPlayerSprite!=='function'||typeof applyDamage!=='function'||typeof hurtPlayer!=='function'||typeof B!=='function'||typeof playerDeath!=='function'||typeof basicAttack!=='function'){L.err='hooks missing';return;}
/* ---------------- config (single place) ---------------- */
const CFG=L.cfg={
  open:{dur:.32,activate:.12,f0:26,n:12},
  guard:{id:'wsBuff3',name:'ตั้งรับเหล็กกล้า',short:'ตั้งรับ',mp:20,cd:18,dur:5,reduce:.30,pl:{main:'#e8edf8',accent:'#ffd36b'}},
  step :{id:'wsBuff4',name:'ย่างก้าวนักรบ',short:'ย่างก้าว',mp:15,cd:15,dur:6,speed:.25,slowCut:.50,pl:{main:'#fff3c4',accent:'#ffe9a0'}},
  leech:{id:'wsBuff5',name:'คมดาบดูดชีพ',short:'ดูดชีพ',mp:25,cd:20,dur:6,pct:.08,capPct:.15,pl:{main:'#c01830',accent:'#ff6a70'}}};
const KEYS=['guard','step','leech'];
const clk=()=>typeof time==='number'?time:performance.now()/1000;
const ss=u=>u<=0?0:u>=1?1:u*u*(3-2*u);
const swordNow=()=>!!(P&&!P.dead&&P.weapon&&P.weapon.t==='sword');
const F=HD.frame,K=HD.drawScale,F0=D.f0;
const DN=['E','SE','S','SW','W','NW','N','NE'];
const dirIdx=g=>{const a=Math.atan2(Math.sin(g),Math.cos(g));return ((Math.round(a/(Math.PI/4))%8)+8)%8;};
const camYaw=()=>{try{return typeof camY==='function'?camY():0;}catch(e){return 0;}};
const okI=im=>im&&im.complete&&im.naturalWidth;
const IMG={};for(const n of DN){const im=new Image();im.src=D.dirs[n].hero.src;IMG[n]=im;}
/* ---------------- per-buff objects (what the weapon-skill window / buttons talk to) ---------------- */
const MM={},ST={};let S=null,castN=0;
const BUFF={guard:{wsGuard:1},step:{speed:CFG.step.speed},leech:{wsLeech:1}};
for(const k of KEYS){const c=CFG[k];
  const m={ver:'p246-r5',err:null,test:false,cfg:c,mp:c.mp,cd:c.cd,dur:c.dur,id:c.id,key:'',buff:{on:false,t0:0,tEnd:-9,act:-9,why:null,used:0}};
  m.start=()=>cast(k);m.cast=m.start;m.cancel=why=>off(k,why||'api');
  MM[k]=m;}
window.__SKBUF3=MM.guard;window.__SKBUF4=MM.step;window.__SKBUF5=MM.leech;
L.mm=MM;
function refuse(k,why){L.refused.push({k,t:+clk().toFixed(2),why});if(L.refused.length>40)L.refused.shift();try{textAt(P.x,P.y-62,CFG[k].name+': '+why,'#ffd98a',13);}catch(e){}return false;}
function busyOther(){const m=n=>{try{const o=window[n];return !!(o&&!o.err&&o.state);}catch(e){return false;}};return m('__SK1')||m('__SK2L')||m('__SK3')||m('__PROV')||m('__SKATK3')||m('__SKATK4');}
function on(k){const b=MM[k].buff;b.on=true;b.t0=clk();b.act=clk();b.why=null;b.used=0;const c=CFG[k];
  P.buffs[c.id]=Object.assign({t:c.dur,max:c.dur,pl:c.pl},BUFF[k]);
  L.log.push({ev:'on',k,t:+clk().toFixed(2),dur:c.dur});if(k==='step')ST.trailT=0;}
function off(k,why){const b=MM[k].buff;if(!b.on)return;b.on=false;b.tEnd=clk();b.why=why;try{delete P.buffs[CFG[k].id];}catch(e){}
  L.ends.push({k,why,t:+clk().toFixed(2),dur:+(clk()-b.t0).toFixed(2),healed:b.used?+b.used.toFixed(1):0});L.log.push({ev:'off',k,why,t:+clk().toFixed(2)});}
function cast(k){const m=MM[k],c=CFG[k];
  if(!m.test)return refuse(k,'ใช้ได้เฉพาะโหมดทดสอบ');
  if(!P||P.dead||G.state!=='play'||G.edit)return refuse(k,'ใช้ไม่ได้ตอนนี้');
  if(!swordNow())return refuse(k,'ต้องถือดาบ');
  if(S||m.buff.on)return refuse(k,'บัฟทำงานอยู่ (ไม่ซ้อน)');
  if((P.cds[c.id]||0)>0)return refuse(k,'คูลดาวน์ '+P.cds[c.id].toFixed(1)+' วิ');
  if(P.dash||P.casting||busyOther())return refuse(k,'กำลังทำท่าอื่น');
  if(P.mp<c.mp)return refuse(k,'MP ไม่พอ');
  P.mp-=c.mp;P.cds[c.id]=c.cd;                                   // once per cast, never refunded
  const a=(typeof P.face==='number')?P.face:0,di=dirIdx(a+camYaw());
  S={id:++castN,k,t:0,di,dn:DN[di],face:a,zone:G.zone,act:false};
  P.dash={vx:0,vy:0,t:99,wsbuf:1,hit:new Set()};
  L.casts++;L.log.push({ev:'cast',k,cast:S.id,t:+clk().toFixed(2),dir:S.dn});return true;}
function finishOpen(){if(!S)return;if(P&&P.dash&&P.dash.wsbuf)P.dash=null;S=null;}
function cancelAll(why){if(S)finishOpen();for(const k of KEYS)off(k,why);}
L.cancel=cancelAll;
function step(dt){
  if(S){
    if(!P||P.dead||G.zone!==S.zone||G.state!=='play'||!swordNow()){finishOpen();}
    else{
      if(!P.dash||!P.dash.wsbuf)P.dash={vx:0,vy:0,t:99,wsbuf:1,hit:new Set()};P.dash.vx=0;P.dash.vy=0;P.dash.t=99;P.face=S.face;
      S.t+=dt;
      if(!S.act&&S.t>=CFG.open.activate){S.act=true;on(S.k);ST.flash={k:S.k,t0:clk()};}
      if(S.t>=CFG.open.dur)finishOpen();}}
  for(const k of KEYS){const b=MM[k].buff;if(!b.on)continue;
    if(!P||P.dead)off(k,'death');
    else if(!swordNow())off(k,'weapon changed');
    else if(!P.buffs[CFG[k].id])off(k,'time');}
  // wind trail for the step buff (spawned while the hero really moves)
  const t=clk();
  if(MM.step.buff.on&&P&&!P.dead){const sp=Math.hypot(P.x-(ST.px==null?P.x:ST.px),P.y-(ST.py==null?P.y:ST.py))/Math.max(dt,1e-3);
    ST.spd=sp;ST.dir=sp>8?Math.atan2(P.y-ST.py,P.x-ST.px):ST.dir;
    if(sp>40){ST.trailT-=dt;if(ST.trailT<=0){ST.trailT=.035;for(const side of [-1,1]){TRAIL.push({t0:t,x:P.x+(side*5)*-Math.sin(ST.dir||0),y:P.y+(side*5)*Math.cos(ST.dir||0)*.5,a:ST.dir||0,l:10+Math.min(14,sp/18)});}if(TRAIL.length>60)TRAIL.splice(0,TRAIL.length-60);}}}
  ST.px=P?P.x:0;ST.py=P?P.y:0;
  while(TRAIL.length&&t-TRAIL[0].t0>.32)TRAIL.shift();
  while(HEALFX.length&&t-HEALFX[0].t0>.85)HEALFX.shift();}
const TRAIL=[],HEALFX=[];
{const o=update;update=function(dt){try{step(dt);}catch(e){L.err='step '+e.message;}return o.apply(this,arguments);};}
{const o=playerDeath;playerDeath=function(){try{cancelAll('death');}catch(e){}return o.apply(this,arguments);};}
if(typeof loadZone==='function'){const o=loadZone;loadZone=function(){try{cancelAll('left the map');TRAIL.length=0;HEALFX.length=0;}catch(e){}return o.apply(this,arguments);};}
{const o=basicAttack;basicAttack=function(){if(S)return;return o.apply(this,arguments);};}   // no attacking during the short opening pose
/* ---------------- 4: slow cut inside the game's own B('speed') ---------------- */
{const _B=B;B=function(k){
  if(k==='speed'&&MM.step.buff.on){let pos=0,neg=0;const add=v=>{if(v>=0)pos+=v;else neg+=v;};
    add((P.pb&&P.pb.speed)||0);for(const id in P.buffs){const b=P.buffs[id];if(b&&b.speed)add(b.speed);}
    if(neg<0)L.stats.slowCut++;
    return pos+neg*(1-CFG.step.slowCut);}
  return _B.apply(this,arguments);};}
/* ---------------- 3: damage-taken step (game's reductions list), multiplicative with the other reductions ---------------- */
const HG={on:false};
{const o=hurtPlayer;hurtPlayer=function(){let own=false;
  try{if(MM.guard.buff.on&&swordNow()&&!HG.on){HG.on=true;own=true;ST.hit={k:'guard',t0:clk()};}}catch(e){L.err='guard '+e.message;}
  try{return o.apply(this,arguments);}finally{if(own)HG.on=false;}};}
{const A=C182.api,Kk=A.K,_rh=Kk.resolveHit;
 Kk.resolveHit=function(i){
  try{
    if(HG.on&&MM.guard.buff.on&&i&&i.reductions&&i.bonuses&&i.bonuses.length===1&&i.tgtLvl!=null){
      let Sx=0;for(const r of i.reductions)if(typeof r==='number'&&isFinite(r))Sx+=r;
      try{const ps=window.__PASS;if(ps&&!ps.err&&ps.hurt&&ps.hurt.on&&ps.hurt.cond&&ps.on&&ps.on.stand&&ps.cfg&&ps.cfg.stand)Sx+=ps.cfg.stand.reduce;}catch(e){}   // the stand passive adds its own term inside p239 (it runs after this wrapper)
      Sx=Math.min(1,Math.max(0,Sx));const x=CFG.guard.reduce*(1-Sx);
      L.reduced.push({S:+Sx.toFixed(3),add:+x.toFixed(3),final:+(1-(Sx+x)).toFixed(3)});if(L.reduced.length>40)L.reduced.shift();
      i=Object.assign({},i,{reductions:i.reductions.concat([x])});}
  }catch(e){L.err='resolveHit '+e.message;}
  return _rh.call(this,i);};}
/* ---------------- 5: lifesteal through the game's own path (applyDamage -> C182.lifesteal) ---------------- */
const isSwordCtx=ctx=>!!ctx&&(ctx.kind==='basic'||ctx.kind==='skill')&&swordNow();
{const _ad=applyDamage;applyDamage=function(e,d,crit,o){
  try{const oo=o||{};
    if(MM.leech.buff.on)L.lastAD={d,kind:oo.ctx&&oo.ctx.kind,sw:swordNow(),dot:oo.dot,echo:oo.echo,thorn:oo.thorn,refl:oo.reflected,dead:P.dead,isCtx:isSwordCtx(oo.ctx)};
    if(MM.leech.buff.on&&swordNow()&&P&&!P.dead&&d>0&&!oo.dot&&!oo.echo&&!oo.thorn&&!oo.reflected&&isSwordCtx(oo.ctx)){
      o=Object.assign({},oo,{drain:(oo.drain||0)+CFG.leech.pct,_wsl:1});}
  }catch(er){L.err='leech '+er.message;}
  return _ad.call(this,e,d,crit,o);};}
{const _ls=C182.lifesteal;
 if(typeof _ls!=='function'){L.err='lifesteal hook missing';}
 else{const w=function(e,d,ls,o){
   if(!(o&&o._wsl)||!MM.leech.buff.on)return _ls.apply(this,arguments);
   L.stats.leechCalls++;
   const pc=CFG.leech.pct,rest=ls-pc;let h=rest>1e-9?_ls.call(this,e,d,rest,o):0;       // anything else the game already grants (gear leech etc.) keeps its own path / cap
   const actual=Math.min(d,Math.max(0,e.hp+d));                                          // HP before the hit: overkill is not counted
   const b=MM.leech.buff,left=Math.max(0,CFG.leech.capPct*P.maxHp-b.used),room=Math.max(0,P.maxHp-P.hp-Math.min(h,Math.max(0,P.maxHp-P.hp)));
   const mine=Math.max(0,Math.min(actual*pc,left,room));
   if(mine>0){b.used+=mine;L.stats.leechHeal+=mine;L.heals.push({t:+clk().toFixed(2),dmg:d,actual,heal:+mine.toFixed(2),used:+b.used.toFixed(2),cap:+(CFG.leech.capPct*P.maxHp).toFixed(2),ctx:o.ctx&&o.ctx.id});if(L.heals.length>200)L.heals.shift();
     HEALFX.push({t0:clk(),ex:e.x,ey:e.y-(e.sz||12)*.5,seed:Math.random()*10});}
   return h+mine;};
  C182.lifesteal=w;try{if(C182.api&&C182.api.S&&C182.api.S.lifesteal===_ls)C182.api.S.lifesteal=w;}catch(e){}}}
/* ---------------- FX (draw time only, all 8 directions, no new Blender action) ---------------- */
const RAW=CanvasRenderingContext2D.prototype.drawImage;
function heroOpen(x,y,alpha,dn,i){const D2=D.dirs[dn].hero,r=D2.rects[i];if(!r||!okI(IMG[dn]))return false;ctx.save();ctx.globalAlpha=alpha;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.drawImage(IMG[dn],r[0],r[1],r[2],r[3],x+(r[4]-F.ax)*K,y+HD.footY+(r[5]-F.ay)*K,r[2]*K,r[3]*K);ctx.restore();return true;}
function fade(b,span){const t=clk();return b.on?ss((t-b.act)/.25):Math.max(0,1-ss((t-b.tEnd)/(span||.4)));}
function shieldPath(c,cx,cy,w,h){c.beginPath();c.moveTo(cx,cy-h/2);c.quadraticCurveTo(cx+w*.55,cy-h*.42,cx+w/2,cy-h*.18);c.quadraticCurveTo(cx+w*.48,cy+h*.28,cx,cy+h/2);c.quadraticCurveTo(cx-w*.48,cy+h*.28,cx-w/2,cy-h*.18);c.quadraticCurveTo(cx-w*.55,cy-h*.42,cx,cy-h/2);c.closePath();}
function shieldPath2(c,cx,cy,w,h){c.beginPath();c.moveTo(cx-w/2,cy-h*.42);c.quadraticCurveTo(cx,cy-h*.6,cx+w/2,cy-h*.42);c.lineTo(cx+w/2,cy+h*.02);c.quadraticCurveTo(cx+w*.42,cy+h*.36,cx,cy+h/2);c.quadraticCurveTo(cx-w*.42,cy+h*.36,cx-w/2,cy+h*.02);c.closePath();}
/* 3 small orange-gold power shields orbiting slowly at waist..chest height; front/back layer by orbit depth; thin orange aura; no UI-icon frame */
function guardFx(x,y,part){
  const b=MM.guard.buff,t=clk(),gx=x,gy=y+HD.footY,c=ctx;
  const live=b.on,ending=!b.on&&b.why==='time'?Math.min(1,(t-b.tEnd)/.55):1;     // natural expiry dissolves; any cancel (why!=='time') hides at once
  if(!live&&!(b.why==='time'&&ending<1))return;
  const k=live?ss((t-b.act)/.6):1-ss(ending);                                        // soft formation .6 s / dissolve .55 s
  if(k<=.003)return;
  const hit=ST.hit&&ST.hit.k==='guard'?(t-ST.hit.t0):9,pu=hit<.3?1-hit/.3:0,pulse=.5+.5*Math.sin(t*2.2);
  c.save();c.lineCap='round';c.lineJoin='round';
  if(part==='back'){   // thin orange aura behind the body (not a fill over the hero)
    const cy=gy-38,g=c.createRadialGradient(gx,cy,12,gx,cy,52);g.addColorStop(0,'rgba(255,150,50,0)');g.addColorStop(.62,`rgba(255,150,45,${((.13+.05*pulse+.12*pu)*k).toFixed(3)})`);g.addColorStop(1,'rgba(255,120,30,0)');
    c.globalCompositeOperation='lighter';c.fillStyle=g;c.beginPath();c.ellipse(gx,cy,34*(.8+.2*k),52*(.8+.2*k),0,0,6.283);c.fill();}
  if(part==='front'){  // very faint warm veil in front (keeps hair / shirt / face detail readable)
    const cy=gy-38,g=c.createRadialGradient(gx,cy,18,gx,cy,50);g.addColorStop(0,'rgba(255,170,60,0)');g.addColorStop(.75,`rgba(255,170,60,${((.035+.02*pulse)*k).toFixed(3)})`);g.addColorStop(1,'rgba(255,150,40,0)');
    c.globalCompositeOperation='lighter';c.fillStyle=g;c.beginPath();c.ellipse(gx,cy,30,50,0,0,6.283);c.fill();}
  const rot=t*.85,rr=(.35+.65*k),rx=29*rr,ry=10*rr;
  for(let i=0;i<3;i++){
    const th=rot+i*2.0944,sn=Math.sin(th),cs=Math.cos(th),front=sn>0;if((part==='front')!==front)continue;
    const px=gx+cs*rx,py=gy-39+sn*ry+Math.sin(t*1.5+i*2.1)*1.6,wf=.34+.66*Math.abs(sn),sc=live?(.55+.45*k):(1+.35*(1-k)),al=k*(front?1:.72);
    const W=17*sc*wf,Hh=23*sc;
    c.globalCompositeOperation='lighter';
    const hg=c.createRadialGradient(px,py,2,px,py,22*sc);hg.addColorStop(0,`rgba(255,170,60,${(.28*al*(1+pu)).toFixed(3)})`);hg.addColorStop(1,'rgba(255,120,30,0)');c.fillStyle=hg;c.beginPath();c.arc(px,py,22*sc,0,6.283);c.fill();
    c.globalCompositeOperation='source-over';
    const fg=c.createLinearGradient(px,py-Hh/2,px,py+Hh/2);fg.addColorStop(0,`rgba(255,150,46,${(.36*al).toFixed(3)})`);fg.addColorStop(1,`rgba(255,86,16,${(.20*al).toFixed(3)})`);
    shieldPath2(c,px,py,W,Hh);c.fillStyle=fg;c.fill();
    c.globalCompositeOperation='lighter';
    shieldPath2(c,px,py,W,Hh);c.strokeStyle=`rgba(255,200,72,${Math.min(1,(.95+.5*pu)*al).toFixed(3)})`;c.lineWidth=1.9;c.stroke();
    shieldPath2(c,px,py,W*.62,Hh*.62);c.strokeStyle=`rgba(255,120,24,${(.6*al).toFixed(3)})`;c.lineWidth=1;c.stroke();
    c.strokeStyle=`rgba(255,226,150,${(.6*al*wf).toFixed(3)})`;c.lineWidth=1.2;c.beginPath();c.moveTo(px-W*.22,py-Hh*.3);c.lineTo(px-W*.22,py+Hh*.06);c.stroke();
    if(!live){const u=1-k;c.fillStyle=`rgba(255,214,120,${(.9*(1-u)).toFixed(3)})`;for(let j=0;j<5;j++){const aa=i*5+j*1.27,d=u*20*(.5+.5*((j*37)%7)/7);c.beginPath();c.arc(px+Math.cos(aa)*d,py+Math.sin(aa)*d*.8-u*6,1.5*(1-u)+.3,0,6.283);c.fill();}}
  }
  c.restore();}
function stepFx(x,y,part){
  const t=clk(),k=fade(MM.step.buff,.35);if(k<=.01&&!TRAIL.length)return;const gx=x,gy=y+HD.footY,c=ctx;
  c.save();c.lineCap='round';c.globalCompositeOperation='lighter';
  const sc=1; // streaks follow the walking direction; they die out .32 s after the hero stops (no new spawns)
  for(const s of TRAIL){const age=t-s.t0,u=age/.32;if(u>=1)continue;if(part==='front')continue;   // all streaks are drawn in the back layer (below the hero) so they never cover the face
    const al=(1-u)*(1-u)*.8*Math.max(.25,k),len=s.l*(1-.4*u),dx=Math.cos(s.a),dy=Math.sin(s.a)*.5,px=x+(s.x-P.x),py=gy+(s.y-P.y);
    c.strokeStyle=`rgba(255,244,205,${al.toFixed(3)})`;c.lineWidth=2.4*(1-u)+.6;c.beginPath();c.moveTo(px,py-3);c.quadraticCurveTo(px-dx*len*.5,py-3-dy*len*.5-2*Math.sin(s.t0*50),px-dx*len,py-3-dy*len);c.stroke();
    c.strokeStyle=`rgba(255,214,110,${(al*.7).toFixed(3)})`;c.lineWidth=1.2;c.beginPath();c.moveTo(px,py-1);c.lineTo(px-dx*len*.8,py-1-dy*len*.8);c.stroke();}
  if(part==='back'&&k>.01&&ST.spd>40){   // soft glint at both shoes while moving
    for(const side of [-1,1]){const sx=gx+side*7,sy=gy-2,g=c.createRadialGradient(sx,sy,0,sx,sy,12);g.addColorStop(0,`rgba(255,246,210,${(.35*k).toFixed(3)})`);g.addColorStop(1,'rgba(255,220,130,0)');c.fillStyle=g;c.beginPath();c.arc(sx,sy,12,0,6.283);c.fill();}}
  c.restore();}
function fangPath(c,w,h){c.beginPath();c.moveTo(-w/2,-h/2);c.quadraticCurveTo(0,-h*.42,w/2,-h/2);c.bezierCurveTo(w*.52,-h*.08,w*.12,h*.3,-w*.3,h/2);c.bezierCurveTo(-w*.46,h*.22,-w*.55,-h*.1,-w/2,-h/2);c.closePath();}
/* twin dark-crimson fangs with a bright red rim floating above the head (no icon frame), slow glow pulse, one short flash per real heal; red eyes only when the face is toward the camera */
function leechFx(x,y,part){
  const b=MM.leech.buff,t=clk(),gx=x,gy=y+HD.footY,c=ctx;
  const live=b.on,ending=!b.on&&b.why==='time'?Math.min(1,(t-b.tEnd)/.4):1;
  if(!live&&!(b.why==='time'&&ending<1))return;
  const k=live?ss((t-b.act)/.4):1-ss(ending);if(k<=.003)return;
  if(part!=='front')return;
  const last=HEALFX.length?HEALFX[HEALFX.length-1].t0:-9,fl=t-last,fu=fl<.28?1-fl/.28:0,pulse=.5+.5*Math.sin(t*2.3);
  const cx=gx,cy=gy-96+Math.sin(t*1.7)*2-4*(1-k),sc=(.7+.3*k)*(1+.22*fu);
  c.save();c.lineJoin='round';c.lineCap='round';
  c.globalCompositeOperation='lighter';
  const gr=26*sc,g=c.createRadialGradient(cx,cy,2,cx,cy,gr);g.addColorStop(0,`rgba(255,36,56,${((.26+.22*pulse+.45*fu)*k).toFixed(3)})`);g.addColorStop(1,'rgba(150,6,24,0)');c.fillStyle=g;c.beginPath();c.arc(cx,cy,gr,0,6.283);c.fill();
  c.globalCompositeOperation='source-over';
  for(const sd of [-1,1]){c.save();c.translate(cx+sd*5.5*sc,cy);c.scale(sd*sc,sc);
    const fg=c.createLinearGradient(0,-12,0,12);fg.addColorStop(0,`rgba(${46+Math.round(120*fu)},4,14,${(.96*k).toFixed(3)})`);fg.addColorStop(1,`rgba(${130+Math.round(110*fu)},${10+Math.round(60*fu)},${28+Math.round(50*fu)},${(.96*k).toFixed(3)})`);
    fangPath(c,8,25);c.fillStyle=fg;c.fill();
    c.globalCompositeOperation='lighter';fangPath(c,8,25);c.strokeStyle=`rgba(255,${64+Math.round(150*fu)},${86+Math.round(120*fu)},${(.95*k).toFixed(3)})`;c.lineWidth=1.7;c.stroke();
    c.strokeStyle=`rgba(255,150,160,${(.5*k).toFixed(3)})`;c.lineWidth=.8;c.beginPath();c.moveTo(-1.6,-10);c.quadraticCurveTo(-2.6,-1,-.8,8);c.stroke();
    c.restore();c.globalCompositeOperation='source-over';}
  // eyes: only when the face looks toward the camera (screen-facing direction = P.face + camera yaw)
  const a=(typeof P.face==='number'?P.face:0)+camYaw(),sn=Math.sin(a),cs=Math.cos(a);
  if(sn>.3){const va=ss((sn-.3)/.35)*k,hx=gx+cs*3.5,hy=gy-EYE_Y,sep=5.2*(1-.4*Math.abs(cs));
    c.globalCompositeOperation='lighter';
    for(const sd of [-1,1]){const ex=hx+sd*sep,ey=hy+(sd*cs>0?-.4:.4);
      const eg=c.createRadialGradient(ex,ey,0,ex,ey,6);eg.addColorStop(0,`rgba(255,40,50,${(.45*va).toFixed(3)})`);eg.addColorStop(1,'rgba(200,10,30,0)');c.fillStyle=eg;c.beginPath();c.arc(ex,ey,6,0,6.283);c.fill();
      c.fillStyle=`rgba(255,${70+Math.round(60*fu)},${70+Math.round(60*fu)},${(.9*va).toFixed(3)})`;c.beginPath();c.ellipse(ex,ey,2.1,1.1,sd*.18,0,6.283);c.fill();}}
  c.restore();}
const EYE_Y=45;
/* monster blood flows into the hero like a pickup orb: 3-5 small red dots per real heal, accelerate toward the body, fade on arrival (no ribbons, no big glow) */
function bloodDots(x,y){
  if(!HEALFX.length)return;const t=clk(),gx=x,gy=y+HD.footY,c=ctx;c.save();c.globalCompositeOperation='lighter';
  for(const h of HEALFX){const n=3+Math.floor((h.seed*977)%3),sx=x+(h.ex-P.x),sy=y+(h.ey-P.y),tx=gx,ty=gy-30;
    for(let i=0;i<n;i++){const u=(t-h.t0-i*.05)/.5;if(u<=0||u>=1)continue;
      const e=u*u*(3-2*u)*.5+u*u*.5;                       // eases in like the magnet pull
      const px=sx+(tx-sx)*e+Math.sin(h.seed*3+i*2.3)*9*(1-e)*(1-u),py=sy+(ty-sy)*e+Math.cos(h.seed*2+i*1.9)*6*(1-e)*(1-u)-8*Math.sin(u*3.14)*(1-u);
      const al=u>.7?Math.max(0,1-(u-.7)/.3):1;
      const g=c.createRadialGradient(px,py,0,px,py,5);g.addColorStop(0,`rgba(255,60,70,${(.8*al).toFixed(3)})`);g.addColorStop(1,'rgba(160,8,26,0)');c.fillStyle=g;c.beginPath();c.arc(px,py,5,0,6.283);c.fill();
      c.fillStyle=`rgba(255,170,175,${(.95*al).toFixed(3)})`;c.beginPath();c.arc(px,py,1.6,0,6.283);c.fill();}}
  c.restore();}
{const o=drawPlayerSprite;drawPlayerSprite=function(x,y,bob,fa){
  const any=S||MM.guard.buff.on||MM.step.buff.on||MM.leech.buff.on||clk()-MM.guard.buff.tEnd<.6||clk()-MM.step.buff.tEnd<.5||clk()-MM.leech.buff.tEnd<.5||TRAIL.length||HEALFX.length;
  if(!any)return o.apply(this,arguments);
  try{guardFx(x,y,'back');stepFx(x,y,'back');leechFx(x,y,'back');}catch(e){L.err='fx back '+e.message;}
  let r;
  try{
    if(S&&G.state==='play'){
      const t=S.t,i=Math.max(0,Math.min(CFG.open.n-1,Math.floor(t/CFG.open.dur*CFG.open.n)))+(CFG.open.f0-F0),bi=ss(t/.07),bo=1-ss((t-(CFG.open.dur-.08))/.08),al=Math.min(bi,bo);
      if(al<1)r=o.apply(this,arguments);
      const draw=()=>heroOpen(x,y,al,S.dn,i),tt=window.__SK3&&window.__SK3.tintDraw;if(tt)tt(draw);else draw();H.anchor={x:x,y:y+HD.footY};}
    else r=o.apply(this,arguments);
  }catch(e){L.err='draw '+e.message;}
  try{guardFx(x,y,'front');stepFx(x,y,'front');leechFx(x,y,'front');bloodDots(x,y);}catch(e){L.err='fx front '+e.message;}
  return r;};}
/* ---------------- HUD: one timer chip per running buff (existing buff state shown through the top-left HUD area) ---------------- */
let hud=null;
function ensureHud(){if(hud)return hud;
  const st=document.createElement('style');st.textContent='#wsBuffHud{position:fixed;left:0;top:0;z-index:55;display:none;gap:6px;pointer-events:none;align-items:flex-start}#wsBuffHud .bc{width:42px;text-align:center;font:700 10px/1.1 "Noto Sans Thai",sans-serif;color:#fff;text-shadow:0 1px 2px #000}#wsBuffHud .ring{position:relative;width:38px;height:38px;border-radius:50%;margin:0 2px;padding:3px;box-sizing:border-box}#wsBuffHud .in{width:100%;height:100%;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9.5px;letter-spacing:-.2px;background:radial-gradient(circle at 50% 35%,#34302a,#0f0d0a)}#wsBuffHud .tm{margin-top:1px;font-size:10px}#wsBuffHud .ring.ic{padding:0;border-radius:6px;background:none!important;width:40px;height:40px}#wsBuffHud .ring.ic img{display:block;width:100%;height:100%}#wsBuffHud .ring.ic .cdv{position:absolute;left:0;right:0;bottom:0;height:0;background:rgba(0,0,0,.6);border-radius:0 0 6px 6px}';
  document.head.appendChild(st);hud=document.createElement('div');hud.id='wsBuffHud';document.body.appendChild(hud);
  const IK={guard:'buf3',step:'buf4',leech:'buf5'};
  for(const k of KEYS){const d=document.createElement('div');d.className='bc';d.dataset.k=k;d.style.display='none';
    let im=null;try{const o=window.__SKBUFF_ICONS;im=o&&o.icons&&o.icons[IK[k]]?o.icons[IK[k]].src:null;}catch(e){}
    d.innerHTML=im?'<div class="ring ic"><img alt="'+CFG[k].name+'" src="'+im+'"><span class="cdv"></span></div><div class="tm"></div>':'<div class="ring"><div class="in">'+CFG[k].short+'</div></div><div class="tm"></div>';d.title=CFG[k].name;hud.appendChild(d);}
  return hud;}
const RING={guard:'#ffd36b',step:'#fff0b0',leech:'#e02848'};
const rc=id=>{const e=document.getElementById(id);if(!e)return null;const c=getComputedStyle(e);if(c.display==='none'||c.visibility==='hidden')return null;const b=e.getBoundingClientRect();return b.width>2&&b.height>2?b:null;};
const hit=(a,b,pad)=>a.left<b.right+pad&&a.right>b.left-pad&&a.top<b.bottom+pad&&a.bottom>b.top-pad;
/* layout from the real HUD: below the player frame (#hud) and any weapon strip / fold button / buff icon that shares its columns; pushed right of the TEST button etc. */
function place(h){const H=rc('hud');const w=h.offsetWidth||170,ht=h.offsetHeight||58;let left=H?H.left:12,top=H?H.bottom:70;
  const col=()=>({left:left,right:left+w});
  for(const id of ['pasSw','hudFold','sk3Hud']){const o=rc(id);if(o&&o.left<left+w+6&&o.right>left-6&&o.bottom>top-ht&&o.top<top+2)top=Math.max(top,o.bottom);}
  top+=6;
  for(let it=0;it<8;it++){let moved=false;for(const id of ['r2tBtn','hudxGear','zoneTag','pasSw','sk3Hud','hudFold','hudTrayBtn','hudMenuBtn']){const o=rc(id);if(!o)continue;const box={left:left,right:left+w,top:top,bottom:top+ht};if(hit(box,o,4)){const nl=o.right+8;if(nl>left){left=nl;moved=true;}}}if(!moved)break;}
  const mx=Math.max(4,innerWidth-w-4);left=Math.min(left,mx);
  h.style.left=Math.round(left)+'px';h.style.top=Math.round(top)+'px';L.hudPos={left:Math.round(left),top:Math.round(top),w,h:ht};}
setInterval(()=>{try{const h=ensureHud();let n=0;
  for(const d of h.children){const k=d.dataset.k,b=MM[k].buff,pb=P&&P.buffs&&P.buffs[CFG[k].id],show=!!(L.test&&b.on&&pb&&G.state==='play');d.style.display=show?'block':'none';if(!show)continue;n++;
    const rem=Math.max(0,pb.t),pc=Math.max(0,Math.min(1,rem/CFG[k].dur));const rg=d.querySelector('.ring');if(rg.classList.contains('ic'))d.querySelector('.cdv').style.height=((1-pc)*100).toFixed(1)+'%';else rg.style.background=`conic-gradient(${RING[k]} ${(pc*360).toFixed(1)}deg,#2a241a 0deg)`;d.querySelector('.tm').textContent=rem.toFixed(1)+'s';}
  h.style.display=n?'flex':'none';if(n)place(h);}catch(e){}},80);
L.ready=true;
}catch(e){L.err='init '+e.message;}
})();

