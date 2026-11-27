
/* ---- candidate_sword_atk5_r18: p238 Provoke "คำรามท้าศึก" (TEST only) ---- */
/* p238 r1 — Provoke "คำรามท้าศึก" (candidate_sword_prov_r1, TEST only, built on candidate_sword_sk3_r1). Not merged, not published.
   Spec (user 13 Oct 09:47):
     No lock-on. Opening pose ~0.4 s; at the release moment every live enemy within CFG.radius (220 px) of the caster with no wall between is forced to take the caster as its target for CFG.dur (4 s), bosses and elites included.
     Melee enemies walk in and attack, ranged enemies keep their own attack range (the engine's own AI does all of it). No teleport / pull / damage / stun. A started attack (wind-up / lunge / telegraph / boss phase rule) is never cancelled:
     the new target takes effect when the AI picks its next action. After the time the original targeting rules apply again; caster death or leaving the map clears the state at once.
     Re-use never adds time (refreshes to CFG.dur) and MP / cooldown are charged once per cast (refused casts cost nothing). Test values MP 15 / CD 12 s live in CFG below (single place).
   HOW "target = caster" is done with the game's existing AI: in this engine the only thing an enemy can target is the player (updEnemies uses P), and the "interest" state is e.aggro. So the effect is the existing aggro state, held for the duration:
     - e.aggro=true is set on the selected enemies only (NOT through provoke(): that function also pulls same-type neighbours within 220 px and the Map 2 wrapper has group-join rules);
     - while active the calm-down timer (e.calmT) is held at 0 so a passive monster cannot lose interest; nothing else is touched (no wind / atkCd / castCd / strike / tele / position / velocity writes);
     - if a GAME rule clears e.aggro during the window (leash reset, player stealth, safe-zone pin, engine leash), that rule wins and the provoke entry is dropped for that enemy (logged);
     - at the end, an enemy that was not interested before and was not damaged meanwhile returns to aggro=false once its current attack is finished (the engine re-aggroes aggressive / boss enemies by its own detection radius).
   Look: one red-orange pressure ring spreading over the ground with a bright edge, wind streaks and soft dust; a short red challenge mark above each affected enemy. Opening pose = Skill 2 hero frames f20..f28 (arm raised) as a TEST preview.
   Skill learning / slots / save are not part of this round. */
(function(){
'use strict';
const L=window.__PROV={ver:'p238-r1',err:null,test:false,log:[],refused:[],casts:0,state:null,last:null,drops:[],expired:[]};
try{
const D=window.__SK2D,HD=window.__HERO3D,H=window.HERO3D,SK1=window.__SK1,SK2=window.__SK2L,SK3=window.__SK3;
if(!D||!HD||!H||typeof drawPlayerSprite!=='function'||typeof update!=='function'||typeof updEnemies!=='function'||typeof blocked!=='function'){L.err='hooks missing';return;}
/* ---------------- config: everything tunable lives here (test values) ---------------- */
const CFG=L.cfg={id:'provoke',mp:15,cd:12,dur:4,radius:220,open:.40,activate:.22,markDur:1.2,ringDur:1.0,fpsOpen:22.5,f0:20,n:9,needSword:true};
const clk=()=>typeof time==='number'?time:performance.now()/1000;
const ss=u=>u<=0?0:u>=1?1:u*u*(3-2*u);
const F=HD.frame,K=HD.drawScale,F0=D.f0;
const DN=['E','SE','S','SW','W','NW','N','NE'];
const dirIdx=g=>{const a=Math.atan2(Math.sin(g),Math.cos(g));return ((Math.round(a/(Math.PI/4))%8)+8)%8;};
const camYaw=()=>{try{return typeof camY==='function'?camY():0;}catch(e){return 0;}};
const IMG={};for(const n of DN){const im=new Image();im.src=D.dirs[n].hero.src;IMG[n]=im;}
const okI=im=>im&&im.complete&&im.naturalWidth;
const swordNow=()=>!!(P&&P.weapon&&P.weapon.t==='sword');
let S=null,castN=0,FX=null;const SET=new Set();
function refuse(why){L.refused.push({t:+clk().toFixed(2),why});if(L.refused.length>30)L.refused.shift();try{textAt(P.x,P.y-62,'Provoke: '+why,'#ffb4a8',13);}catch(e){}return false;}
/* ---------------- cast ---------------- */
function start(){
  if(!L.test)return refuse('ใช้ได้เฉพาะโหมดทดสอบ');
  if(!P||P.dead||G.state!=='play'||G.edit)return refuse('ใช้ไม่ได้ตอนนี้');
  if(CFG.needSword&&!swordNow())return refuse('ต้องถือดาบ (พรีวิวท่า)');
  if(S)return refuse('กำลังร่าย (ไม่คิดซ้ำ)');
  if((P.cds[CFG.id]||0)>0)return refuse(`คูลดาวน์ ${P.cds[CFG.id].toFixed(1)} วิ`);
  if(P.dash||P.casting||(SK1&&SK1.state)||(SK2&&SK2.state)||(SK3&&SK3.state))return refuse('กำลังทำท่าอื่น');
  if(P.mp<CFG.mp)return refuse('MP ไม่พอ');
  P.mp-=CFG.mp;P.cds[CFG.id]=CFG.cd;                                      // charged once per cast, never refunded
  const a=(typeof P.face==='number')?P.face:0,di=dirIdx(a+camYaw());
  S={id:++castN,t:0,di,dn:DN[di],face:a,zone:G.zone,act:false,ended:null};
  P.dash={vx:0,vy:0,t:99,prov:1,hit:new Set()};
  L.casts++;L.state=S;L.log.push({ev:'cast',cast:S.id,t:+clk().toFixed(2),dir:S.dn});return true;}
function finishOpen(why){if(!S)return;S.ended=why;if(P&&P.dash&&P.dash.prov)P.dash=null;L.last=Object.assign(L.last||{},{poseEnd:why});L.state=null;S=null;}
/* ---------------- selection at the release moment ---------------- */
function losClear(e){const dx=e.x-P.x,dy=e.y-P.y,d=Math.hypot(dx,dy),stop=Math.max(0,d-Math.min(14,(e.sz||12)*.6));
  for(let s=10;s<stop;s+=10){if(blocked(P.x+dx/d*s,P.y+dy/d*s,3))return false;}return true;}
function release(){
  const t=clk(),aff=[],skip=[];
  for(const e of enemies){
    if(!e||e.dead||!e.m)continue;
    const d=Math.hypot(e.x-P.x,e.y-P.y);
    if(d>CFG.radius){continue;}                                              // out of range: not even listed
    const why=e.dev?'dev dummy':(e.w22ret||(e.unreach>t))?'resetting':e.rush?'untargetable':e.sprGhost?'ghost':(P.stealth>0&&!(e.m.boss||e.m.raid))?'stealth':!losClear(e)?'wall':null;
    if(why){skip.push({id:e.id!=null?e.id:enemies.indexOf(e),type:e.type,why,d:Math.round(d)});continue;}
    const was=!!e.aggro,pr=e.prov;
    if(pr&&pr.state==='active'){pr.until=t+CFG.dur;pr.mark=t;pr.cast=S?S.id:castN;}     // re-use refreshes, never adds
    else{e.prov={cast:castN,t0:t,until:t+CFG.dur,mark:t,state:'active',fresh:!was,hp0:e.hp,was};
      if(!was){e.aggro=true;e.alertT=Math.max(e.alertT||0,.9);e.calmT=0;}      // only this enemy; no group pull
      SET.add(e);}
    aff.push({id:e.id!=null?e.id:enemies.indexOf(e),type:e.type,L:e.L,boss:!!(e.m.boss||e.m.raid),elite:!!(e.m.elite||e.eliteX),was,d:Math.round(d),rng:!!e.m.rng});
  }
  FX={t0:t,x:P.x,y:P.y};
  L.last={cast:castN,t:+t.toFixed(2),x:Math.round(P.x),y:Math.round(P.y),affected:aff,skipped:skip};
  L.log.push({ev:'release',cast:castN,t:+t.toFixed(2),n:aff.length,skipped:skip.length});
  try{shake(3);}catch(e){}
}
/* ---------------- state upkeep (before the engine's own enemy update each frame) ---------------- */
function clearAll(why){for(const e of SET){if(e.prov){L.drops.push({id:e.id,why,t:+clk().toFixed(2)});delete e.prov;}}SET.clear();}
function maintain(){
  const t=clk();
  for(const e of SET){const pr=e.prov;
    if(!pr||e.dead){SET.delete(e);if(pr)delete e.prov;continue;}
    if(pr.state==='active'){
      if(!e.aggro){L.drops.push({id:e.id,why:e.w22ret?'leash reset':(P.stealth>0?'stealth':'game rule'),t:+t.toFixed(2)});delete e.prov;SET.delete(e);continue;}
      if(t<pr.until){e.calmT=0;continue;}
      pr.state='ending';}
    if(pr.state==='ending'){
      if(pr.fresh&&e.hp>=pr.hp0){                                              // back to the original rules: not interested, not hurt
        if(e.wind>0||e.strikeT>0||e.tele)continue;                              // let the attack that already started finish
        e.aggro=false;e.alertT=0;e.calmT=0;}
      L.expired.push({id:e.id,t:+t.toFixed(2),fresh:pr.fresh});if(L.expired.length>200)L.expired.shift();
      delete e.prov;SET.delete(e);}}
}
function step(dt){
  if(S){
    if(!P||P.dead){finishOpen('hero died');}
    else if(G.zone!==S.zone||G.state!=='play'){finishOpen('left the map');}
    else if(CFG.needSword&&!swordNow()){finishOpen('weapon changed');}
    else{
      if(!P.dash||!P.dash.prov)P.dash={vx:0,vy:0,t:99,prov:1,hit:new Set()};P.dash.vx=0;P.dash.vy=0;P.dash.t=99;P.face=S.face;
      S.t+=dt;
      if(!S.act&&S.t>=CFG.activate){S.act=true;release();}
      if(S.t>=CFG.open)finishOpen('done');}}
  if(SET.size)maintain();
}
{const o=update;update=function(dt){try{step(dt);}catch(e){L.err='step '+e.message;}return o.apply(this,arguments);};}
{const o=playerDeath;playerDeath=function(){try{if(S)finishOpen('death');clearAll('caster died');FX=null;}catch(e){}return o.apply(this,arguments);};}
if(typeof loadZone==='function'){const o=loadZone;loadZone=function(){try{if(S)finishOpen('left the map');clearAll('left the map');FX=null;}catch(e){}return o.apply(this,arguments);};}
{const o=basicAttack;basicAttack=function(){if(S)return;return o.apply(this,arguments);};}   // no attacking during the opening pose
L.start=start;L.cancel=function(why){if(S)finishOpen(why||'cancel');clearAll(why||'cancel');FX=null;};L.active=()=>[...SET].map(e=>({id:e.id,type:e.type,until:+e.prov.until.toFixed(2),state:e.prov.state,fresh:e.prov.fresh}));
/* ---------------- ground ring (spreads once): drawn in the ground layer, below all entities ---------------- */
const RAT=.62;
const STREAK=[],PUFF=[];{let r=11;const R=()=>{r=(r*16807)%2147483647;return r/2147483647;};
  for(let i=0;i<18;i++)STREAK.push({a:R()*6.283,span:.35+R()*.5,rad:.38+R()*.55,dl:R()*.18,w:1.2+R()*1.8,sp:.5+R()*.8});
  for(let i=0;i<26;i++)PUFF.push({a:R()*6.283,rad:.55+R()*.45,dl:R()*.22,sz:8+R()*12,up:8+R()*16,dr:.05+R()*.14,sh:R()});}
function ringR(a){const R=CFG.radius,u=Math.min(1,a/.5);return 16+(R-16)*(1-Math.pow(1-u,2.4));}
function drawRing(){
  const f=FX;if(!f)return;const a=clk()-f.t0,dur=CFG.ringDur+.35;if(a<0)return;if(a>dur){FX=null;return;}
  const R=CFG.radius,r=ringR(a),fade=Math.max(0,1-Math.max(0,a-.45)/(dur-.45)),x=f.x,y=f.y,c=ctx;
  c.save();c.lineCap='round';
  // soft pressure disc
  let g=c.createRadialGradient(x,y,r*.2,x,y,r);g.addColorStop(0,'rgba(255,90,30,0)');g.addColorStop(.7,`rgba(210,40,14,${(.12*fade).toFixed(3)})`);g.addColorStop(1,`rgba(255,110,40,${(.30*fade).toFixed(3)})`);
  c.fillStyle=g;c.beginPath();c.ellipse(x,y,r,r*RAT,0,0,6.283);c.fill();
  // dust (soft, normal blend)
  for(const p of PUFF){const u=(a-p.dl)/1.0;if(u<=0||u>=1)continue;const rr=R*p.rad*Math.min(1,ringR(a)/R)*(1+.12*u),px=x+Math.cos(p.a)*rr,py=y+Math.sin(p.a)*rr*RAT-p.up*u,sz=p.sz*(.7+.9*u);
    const al=Math.sin(Math.PI*u)*.36*(p.sh>.5?1:.8);const gg=c.createRadialGradient(px,py,0,px,py,sz);gg.addColorStop(0,`rgba(190,120,80,${al.toFixed(3)})`);gg.addColorStop(1,'rgba(150,80,50,0)');c.fillStyle=gg;c.beginPath();c.arc(px,py,sz,0,6.283);c.fill();}
  // wind streaks (curved, tapered, sweeping outward)
  c.globalCompositeOperation='lighter';
  for(const s of STREAK){const u=(a-s.dl)/.7;if(u<=0||u>=1)continue;const rad=R*s.rad*(.55+.45*Math.min(1,u*1.3)),a0=s.a+u*s.sp*1.2,N=9;
    for(let j=0;j<N;j++){const t0=j/N,t1=(j+1)/N,A0=a0+s.span*t0,A1=a0+s.span*t1,al=Math.sin(Math.PI*u)*.85*(t1)*fade;if(al<.02)continue;
      c.strokeStyle=`rgba(255,${150+Math.round(70*t1)},${90+Math.round(60*t1)},${al.toFixed(3)})`;c.lineWidth=s.w*(.4+1.2*t1);c.beginPath();c.moveTo(x+Math.cos(A0)*rad,y+Math.sin(A0)*rad*RAT);c.lineTo(x+Math.cos(A1)*rad,y+Math.sin(A1)*rad*RAT);c.stroke();}}
  // bright edge (wide red-orange glow + hot core + trailing echo)
  const w=Math.max(1.5,10*(1-Math.min(1,a/.9)*.6));
  c.strokeStyle=`rgba(255,60,20,${(.5*fade).toFixed(3)})`;c.lineWidth=w*1.8;c.beginPath();c.ellipse(x,y,r,r*RAT,0,0,6.283);c.stroke();
  c.strokeStyle=`rgba(255,150,60,${(.85*fade).toFixed(3)})`;c.lineWidth=w*.8;c.beginPath();c.ellipse(x,y,r,r*RAT,0,0,6.283);c.stroke();
  c.strokeStyle=`rgba(255,236,190,${(.95*fade).toFixed(3)})`;c.lineWidth=Math.max(1.2,w*.28);c.beginPath();c.ellipse(x,y,r,r*RAT,0,0,6.283);c.stroke();
  const r2=ringR(Math.max(0,a-.12))*.9;c.strokeStyle=`rgba(255,110,40,${(.45*fade).toFixed(3)})`;c.lineWidth=3;c.beginPath();c.ellipse(x,y,r2,r2*RAT,0,0,6.283);c.stroke();
  // flash under the caster at the release
  if(a<.3){const k=1-a/.3;g=c.createRadialGradient(x,y,2,x,y,46);g.addColorStop(0,`rgba(255,220,150,${(.6*k).toFixed(3)})`);g.addColorStop(1,'rgba(220,40,10,0)');c.fillStyle=g;c.beginPath();c.ellipse(x,y,46,46*RAT,0,0,6.283);c.fill();}
  c.restore();}
if(typeof surfaceFx==='function'){const o=surfaceFx;surfaceFx=function(){const r=o.apply(this,arguments);try{drawRing();}catch(e){L.err='ring '+e.message;}return r;};}
/* ---------------- challenge mark above the affected enemies ---------------- */
function drawMark(e){
  const pr=e.prov;if(!pr)return;const a=clk()-pr.mark;if(a<0||a>CFG.markDur)return;
  const k=a/CFG.markDur,pop=a<.14?ss(a/.14)*1.25:a<.26?1.25-.25*ss((a-.14)/.12):1,al=Math.min(1,(1-k)*3.2),c=ctx;
  const x=e.x,y=e.y-(e.sz||14)*2.7-22-(e.eliteX?18:0)-6*Math.sin(Math.min(1,k*1.6)*3.14159);
  c.save();c.translate(x,y);c.scale(pop*1.2,pop*1.2);c.globalAlpha=al;
  // red challenge mark: bold "!" with excitement ticks on a soft dark halo (readable on grass and dirt), short pulse ring; placed above the name / HP bar
  const hg=c.createRadialGradient(0,0,2,0,0,19);hg.addColorStop(0,'rgba(40,0,0,.6)');hg.addColorStop(1,'rgba(40,0,0,0)');c.fillStyle=hg;c.beginPath();c.arc(0,0,19,0,6.283);c.fill();
  if(a<.35){c.strokeStyle=`rgba(255,150,80,${(.8*(1-a/.35)).toFixed(3)})`;c.lineWidth=2;c.beginPath();c.arc(0,0,9+14*(a/.35),0,6.283);c.stroke();}
  c.lineCap='round';c.lineJoin='round';
  for(let i=-1;i<=1;i++){const an=-Math.PI/2+i*.75;c.strokeStyle='#ff6a3a';c.lineWidth=2.2;c.beginPath();c.moveTo(Math.cos(an)*12.5,Math.sin(an)*12.5);c.lineTo(Math.cos(an)*17,Math.sin(an)*17);c.stroke();}
  c.beginPath();c.moveTo(-3.6,-10);c.lineTo(3.6,-10);c.lineTo(2.2,3.2);c.lineTo(-2.2,3.2);c.closePath();c.fillStyle='#ff2a18';c.fill();c.lineWidth=1.8;c.strokeStyle='#fff0d0';c.stroke();
  c.beginPath();c.arc(0,8,2.7,0,6.283);c.fill();c.stroke();
  c.restore();}
{const o=drawEnemy;drawEnemy=function(e){const r=o.apply(this,arguments);try{if(e&&e.prov)drawMark(e);}catch(er){L.err='mark '+er.message;}return r;};}
/* ---------------- hero draw: opening pose (Skill 2 frames, preview) ---------------- */
function heroOpen(x,y,alpha,dn,i){const D2=D.dirs[dn].hero,r=D2.rects[i];if(!r||!okI(IMG[dn]))return false;
  const draw=()=>{ctx.save();ctx.globalAlpha=alpha;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    ctx.drawImage(IMG[dn],r[0],r[1],r[2],r[3],x+(r[4]-F.ax)*K,y+HD.footY+(r[5]-F.ay)*K,r[2]*K,r[3]*K);ctx.restore();};
  if(SK3&&SK3.tintDraw)SK3.tintDraw(draw);else draw();return true;}      // keeps the Skill 3 red tint if that buff is on
{const o=drawPlayerSprite;drawPlayerSprite=function(x,y,bob,fa){
  if(!S||G.state!=='play')return o.apply(this,arguments);
  let r;const t=S.t,i=Math.max(0,Math.min(CFG.n-1,Math.floor(t*CFG.fpsOpen)))+(CFG.f0-F0),bi=ss(t/.08),bo=1-ss((t-(CFG.open-.1))/.1),al=Math.min(bi,bo);
  if(al<1)r=o.apply(this,arguments);
  heroOpen(x,y,al,S.dn,i);H.anchor={x:x,y:y+HD.footY};return r;};}
/* ---------------- TEST panel / key Y ---------------- */
let panel=null;
function panelHTML(){const row=(a,b)=>`<div><span style="color:#d9a">${a}</span> ${b}</div>`,n=SET.size;
  return row('ท้า',n?`ทำงาน · ${n} ตัว`:'ปิด')+row('คูลดาวน์',((P.cds[CFG.id]||0)>0?P.cds[CFG.id].toFixed(1)+' วิ':'พร้อม')+' · MP '+CFG.mp+' (ค่าทดลอง)')+row('รัศมี/เวลา',CFG.radius+' px · '+CFG.dur+' วิ')+row('ปฏิเสธล่าสุด',(L.refused.slice(-1)[0]||{}).why||'-');}
function setTest(on){L.test=!!on;
  if(on&&!panel){panel=document.createElement('div');panel.id='provPanel';panel.style.cssText='position:fixed;left:10px;top:350px;z-index:60;width:250px;padding:8px 10px;border-radius:10px;background:rgba(34,8,6,.88);border:1px solid #b5502a;color:#ffeadb;font:12px/1.45 sans-serif;pointer-events:auto';
    panel.innerHTML='<b>Provoke · คำรามท้าศึก</b> <span style="color:#ffd65a">TEST</span><div id="provBody"></div><div style="display:flex;gap:6px;margin-top:6px"><button id="provUse" type="button" style="min-height:44px;flex:1">ใช้สกิล (Y)</button></div>';
    document.body.appendChild(panel);panel.querySelector('#provUse').addEventListener('click',()=>start());
    for(const ev of ['pointerdown','pointerup','mousedown','touchstart','click'])panel.addEventListener(ev,e=>e.stopPropagation());}
  if(panel)panel.style.display=on?'block':'none';if(!on){if(S)finishOpen('test mode off');clearAll('test mode off');}}
L.setTest=setTest;
setInterval(()=>{try{if(panel&&L.test)panel.querySelector('#provBody').innerHTML=panelHTML();}catch(e){}},150);
window.addEventListener('keydown',e=>{if(!L.test)return;if((e.key==='y'||e.key==='Y')&&!e.repeat){const a=document.activeElement;if(a&&/INPUT|TEXTAREA/.test(a.tagName))return;start();}});
setInterval(()=>{try{const row=document.getElementById('hudTrayRow');if(row&&!document.getElementById('provTog')){const b=document.createElement('button');b.type='button';b.className='tbtn';b.id='provTog';row.appendChild(b);
  const lab=()=>{b.textContent='Provoke · คำรามท้าศึก: '+(L.test?'เปิด':'ปิด');};lab();b.addEventListener('click',()=>{setTest(!L.test);lab();});}}catch(e){}},700);
}catch(e){L.err='init '+e.message;}
})();

