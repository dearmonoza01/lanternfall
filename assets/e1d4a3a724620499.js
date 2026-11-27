
/* ---- candidate_bow_r2: p252 r2 bow weapon: shot clip, arrow (straight / first monster once / walls), central lock, E-only art (TEST only) ---- */
/* p252 r1 — Bow (TEST candidate, user 15 Oct 2026 15:53). Loaded right after the hero / combat patches and BEFORE p225 (central target
   lock), so the lock stays the outermost basic-attack wrapper: click-select and auto-pick work for the bow exactly as for the sword.
   What it does (existing systems reused, nothing duplicated):
     • weapon      = the game's own WEAPONS.bow / makeWeapon / equipItem (inventory). Bow numbers per the bow brief: 100 % damage
                     (mult 1.0), reach 340 px. Damage, crit, defence, element … = the game's own hitEnemy() on the arrow hit.
     • attack time = one full shot clip (reach to the quiver → nock → draw → release → lower) = 1.0 s at base, sped up by the same ASPD
                     rule as the sword (1× … 1.5×). The arrow leaves on the release frame of the clip.
     • arrow       = straight line, 650 px/s, max 340 px, hits the FIRST monster once, stops on a wall / solid (the game's blocked()).
     • art         = Blender frames (BOW_shoot_r13x3 + quiver r14), direction E ONLY. Other directions have no bow art yet: the bow only
                     shoots toward E (target within the E sector); anything without bow art (walk / run / hurt / death / other
                     directions) still uses the current hero frames — the E frames are never used for another direction.
     • sword-only  = sword skills / passives / buffs check the equipped weapon themselves; the skill keys are additionally refused here.
   Debug: window.BOW (state, stats, log). */
(function(){
'use strict';
const D=window.__BOW3D,HD=window.__HERO3D,H=window.HERO3D;
const BW=window.BOW={ver:'p252-r2',on:true,err:null,st:null,arrows:[],log:[],ready:false,
  stats:{start:0,released:0,hit:0,crit:0,wall:0,range:0,dirRefused:0,cancel:0,skillRefused:0,draws:0},
  cfg:{range:340,speed:650,shot:1.0,maxSpd:1.5,hitR:3,step:6}};
if(!D||!HD||!H||typeof basicAttack!=='function'||typeof WEAPONS==='undefined'){BW.err='missing hooks/data';console.warn('[p252]',BW.err);return;}
const CF=BW.cfg;
try{Object.assign(WEAPONS.bow,{mult:1.0,range:CF.range});}catch(e){BW.err='weapons '+e.message;}
const img=new Image();img.onload=()=>{BW.ready=true;};img.src=D.src;
const N=D.shot.n,REL=D.shot.release,K=HD.drawScale,F=HD.frame;
const bowNow=BW.bowNow=()=>!!(BW.on&&typeof P!=='undefined'&&P&&P.weapon&&P.weapon.t==='bow'&&H.on&&H.ready()&&BW.ready);
const clk=()=>typeof time==='number'?time:performance.now()/1000;
const cam=()=>{try{return typeof camY==='function'?camY():0;}catch(e){return 0;}};
const wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a));
let wasE=false;
function isE(fa,hold){const a=Math.abs(wrapA(fa));return a<Math.PI/8+(hold?0.09:0);}
function stunnedNow(){try{return typeof stunned==='function'&&stunned();}catch(e){return false;}}
function log(k,x){BW.log.push(Object.assign({t:+clk().toFixed(2),k},x||{}));if(BW.log.length>80)BW.log.shift();}
let lastNote={m:'',t:-9};
function note(m,c){const t=clk();if(lastNote.m===m&&t-lastNote.t<1.1)return;lastNote={m,t};try{textAt(P.x,P.y-70,m,c||'#ffcf9a',13,{life:1,vy:-30});}catch(e){}}
/* the sword ASPD rule (p194): factor relative to the starting character, 1× … 1.5× */
const ASPD_REF=1+5*.012;
function spdNow(){let a=1;try{a=Math.max(1,Math.min(CF.maxSpd,(P.aspdF||1)*(1+(B('aspd')||0))/ASPD_REF));}catch(e){}return a;}

/* ---------- basic attack: start a shot (the lock p225 wraps this and has already turned P.face to the locked target) ---------- */
{const o=basicAttack;basicAttack=function(){
  if(!bowNow())return o.apply(this,arguments);
  if(BW.st||P.atkCd>0||P.dead||P.dash||(typeof G!=='undefined'&&G.edit)||P.casting||stunnedNow())return;
  let ang=P.face||0;
  try{const t=aimPoint(CF.range);if(t&&isFinite(t.x)&&(t.x!==P.x||t.y!==P.y))ang=Math.atan2(t.y-P.y,t.x-P.x);}catch(e){}
  if(!isE(ang+cam(),false)){BW.stats.dirRefused++;log('dir',{a:+ang.toFixed(2)});note('ธนู (TEST): ยิงได้เฉพาะทิศ E — ทิศอื่นยังไม่มีภาพ');return;}
  const a=spdNow(),dur=CF.shot/a;
  P.face=ang;BW.st={t0:clk(),dur,ang,rel:false,a,ctx:basicCtx()};P.atkCd=dur;
  try{G.basicT=clk();}catch(e){}
  BW.stats.start++;log('start',{a:+ang.toFixed(2),dur:+dur.toFixed(3)});
};}

/* the game's own basic-attack damage context (combat v182: same call as its basic-attack wrapper — actionCoef / weights / m0 = weapon mult) */
function basicCtx(){try{const A=window.C182&&C182.api;if(!A||!A.ctxFor)return null;const wd=A.D().weapons&&A.D().weapons.bow,W=WEAPONS.bow;if(!wd)return null;
  return A.ctxFor('basic','basic:bow',{id:'basic:bow',mode:'sched',coefTotal:wd.actionCoef,flatTotal:0,weights:wd.weights,schedule:wd.schedule,maxTargets:8,targeting:'cone',element:'Neutral',range:W.range},
    {dt:'phys',lvScale:1,m0:W.mult,reach:(W.range||120)*1.6+120});}catch(e){BW.err='ctx '+e.message;return null;}}
/* ---------- arrow ---------- */
function spawn(st){
  const c=Math.cos(st.ang),s=Math.sin(st.ang);
  const d0=(D.tip[0]-F.ax)*K,h0=-(HD.footY+(D.tip[1]-F.ay)*K);     // body → arrow head (ground distance) and height of the head above the feet
  const ar={ctx:st.ctx,x:P.x,y:P.y,h:h0,c,s,trav:0,t0:clk(),hit:null,end:null,why:null,len:D.arrowLenPx*K};
  BW.arrows.push(ar);
  stepArrow(ar,0,d0);   // body → bow: the arrow appears at the drawn arrow head; a monster / wall closer than that is still hit / stops it (point blank)
  BW.stats.released++;log('release',{x:Math.round(ar.x),y:Math.round(ar.y)});
  try{sfx('swing','bow');}catch(e){}
  return ar;}
function liveE(e){return !!e&&!e.dead&&e.hp>0&&!e.sprGhost;}
function stepArrow(ar,dt,d){
  if(ar.end!=null)return;
  let dist=d!=null?d:CF.speed*dt;const n=Math.max(1,Math.ceil(dist/CF.step)),dd=dist/n;
  for(let i=0;i<n;i++){
    if(ar.trav+dd>CF.range){ar.end=clk();ar.why='range';BW.stats.range++;log('range');return;}
    const nx=ar.x+ar.c*dd,ny=ar.y+ar.s*dd;
    if(typeof blocked==='function'&&blocked(nx,ny,2)){ar.end=clk();ar.why='wall';BW.stats.wall++;log('wall',{x:Math.round(nx),y:Math.round(ny)});return;}
    ar.x=nx;ar.y=ny;ar.trav+=dd;
    for(const e of enemies){if(!liveE(e))continue;
      if(Math.hypot(e.x-ar.x,e.y-ar.y)>(e.sz||16)+CF.hitR)continue;
      const hp0=e.hp;let r=null;BW._lastCrit=null;
      try{let pl;try{pl=wpal();}catch(_){pl=null;}const prev=window.C182?C182.cur:null;if(ar.ctx&&window.C182)C182.cur=ar.ctx;try{r=hitEnemy(e,WEAPONS.bow.mult,{dt:'phys',pl,kind:'arrow',ctx:ar.ctx||undefined,fx:ar.x-ar.c*12,fy:ar.y-ar.s*12});}finally{if(window.C182)C182.cur=prev;}}catch(err){BW.err='hit '+err.message;}
      ar.end=clk();ar.why='hit';ar.hit=e;BW.stats.hit++;
      const cr=!!BW._lastCrit;if(cr)BW.stats.crit++;
      log('hit',{mon:(e.m&&(e.m.n||e.m.th))||e.type,dmg:Math.round(hp0-(e.hp||0)),crit:cr});
      return;}
  }}

if(typeof applyDamage==='function'){const o=applyDamage;applyDamage=function(e,d,crit){BW._lastCrit=!!crit;return o.apply(this,arguments);};}
/* ---------- per frame ---------- */
{const o=update;update=function(dt){
  const r=o.apply(this,arguments);
  try{
    const st=BW.st,now=clk();
    if(st){
      if(!bowNow()||P.dead||stunnedNow()||P.dash||(typeof G!=='undefined'&&(G.edit||G.state!=='play'))){BW.st=null;BW.stats.cancel++;log('cancel');P.atkCd=0;}
      else{P.face=st.ang;
        const k=Math.floor((now-st.t0)/st.dur*N);
        if(!st.rel&&k>=REL){st.rel=true;
          try{const T_=window.TLOCK,e=T_&&T_.e;if(e&&liveE(e)){const a2=Math.atan2(e.y-P.y,e.x-P.x);if(isE(a2+cam(),true)){st.ang=a2;P.face=a2;}}}catch(_){}   // the archer tracks the locked target while drawing (E sector only)
          spawn(st);}
        if(now>=st.t0+st.dur){BW.st=null;BW.lastEnd=now;}}}
    if(typeof G!=='undefined'&&G.state==='play'){for(const ar of BW.arrows)stepArrow(ar,dt);}
    BW.arrows=BW.arrows.filter(ar=>ar.end==null||now-ar.end<(ar.why==='wall'?.6:.12));
  }catch(e){BW.err='update '+e.message;}
  return r;};}
/* no walking while a shot plays (same rule as the sword swing, p204) */
try{const _up=updPlayer;updPlayer=function(){const lock=!!(BW.st&&!P.dash&&!P.dead);const x0=P.x,y0=P.y;const r=_up.apply(this,arguments);
  if(lock&&!P.dash){P.x=x0;P.y=y0;P.vx=0;P.vy=0;}return r;};}catch(e){BW.err='updPlayer '+e.message;}
if(typeof loadZone==='function'){const o=loadZone;loadZone=function(){BW.arrows.length=0;BW.st=null;return o.apply(this,arguments);};}

/* ---------- drawing: hero frames from the bow atlases ----------
   shot (+ the lowered-bow rest pose right after shooting) = E only; idle / walk / run / hurt / death with the bow + quiver on the
   back and NO sword / scabbard = all 8 directions (r2, rendered separately, no mirroring). */
const LD=window.__BOW3D_LOCO||null;const img2=new Image();let ready2=false;if(LD){img2.onload=()=>{ready2=true;try{prepMotes();}catch(e){BW.err='motes '+e.message;}};img2.src=LD.src;}
BW.loco=()=>!!(LD&&ready2);
const ORDER=['E','SE','S','SW','W','NW','N','NE'];let dirN=0,hurtAt=-99,deadAt=null;
function pickDir(fa){const a=wrapA(fa),cc=dirN*Math.PI/4,d=wrapA(a-cc);if(Math.abs(d)<Math.PI/8+0.09)return dirN;return ((Math.round(a/(Math.PI/4))%8)+8)%8;}
function cellNow(fa){
  const st=BW.st,now=clk();
  if(st){dirN=0;const k=Math.max(0,Math.min(N-1,Math.floor((now-st.t0)/st.dur*N)));return {img,r:D.rects[1+k],clip:'bow_shot',dir:0};}
  if(!BW.loco()){if(P.dead||(P.hurtT||0)>0)return null;const sp=Math.hypot(P.vx||0,P.vy||0);if(sp>25||P.dash)return null;
    return isE(fa,wasE)?{img,r:D.rects[D.idle],clip:'bow_rest',dir:0}:null;}
  dirN=pickDir(fa);const C=LD.clips,ix=(c,i)=>LD.rects[LD.index[c][dirN][Math.max(0,Math.min(C[c].n-1,i))]];
  if(P.dead){if(deadAt==null)deadAt=now;return {img:img2,r:ix('death',Math.floor((now-deadAt)*C.death.fps)),clip:'bow_death',dir:dirN};}
  deadAt=null;
  if((P.hurtT||0)>0){if(now-hurtAt>.3)hurtAt=now;const k=Math.floor((now-hurtAt)*C.hurt.fps);if(k<C.hurt.n)return {img:img2,r:ix('hurt',k),clip:'bow_hurt',dir:dirN};}
  const sp=Math.hypot(P.vx||0,P.vy||0);
  if(sp>25||P.dash){const run=!!P.dash||sp>(HD.runSpeed||160),c=run?'run':'walk';return {img:img2,r:ix(c,Math.floor(now*C[c].fps)%C[c].n),clip:'bow_'+c,dir:dirN};}
  if(dirN===0&&BW.lastEnd!=null&&now-BW.lastEnd<3)return {img,r:D.rects[D.idle],clip:'bow_rest',dir:0};     // just shot: bow still in hand (E)
  return {img:img2,r:ix('idle',Math.floor(now*C.idle.fps)%C.idle.n),clip:'bow_idle',dir:dirN};}
function drawCell(c,x,y,alpha){const r=c.r;
  ctx.save();if(alpha!=null&&alpha<1)ctx.globalAlpha*=alpha;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.drawImage(c.img,r[0],r[1],r[2],r[3],x+(r[4]-F.ax)*K,y+(r[5]-F.ay)*K,r[2]*K,r[3]*K);ctx.restore();}
{const o=drawPlayerSprite;drawPlayerSprite=function(x,y,bob,fa){
  try{const ov=typeof SPR_OVR!=='undefined'&&SPR_OVR.player;
    if(ov&&ov.hero3d&&bowNow()&&!P.dead){const c=cellNow(fa);wasE=!!c&&c.dir===0;
      if(c){const yy=y+HD.footY;drawCell(c,x,yy);H.anchor={x,y:yy};H.dir=c.dir;H.clip=c.clip;BW.stats.draws++;return;}}}
  catch(e){BW.err='draw '+e.message;}
  return o.apply(this,arguments);};}
/* death with the bow: the same fall + dissolve into rising motes as the hero (p194 rule), from the bow-death frames */
const MT={pts:{},motes:[]};
function prepMotes(){const n=LD.clips.death.n,c=document.createElement('canvas');c.width=282;c.height=362;const g=c.getContext('2d',{willReadFrequently:true});
  for(let d=0;d<8;d++){const r=LD.rects[LD.index.death[d][n-1]];g.clearRect(0,0,282,362);g.drawImage(img2,r[0],r[1],r[2],r[3],r[4],r[5]+80,r[2],r[3]);
    const px=g.getImageData(0,0,282,362).data,pts=[];for(let y=0;y<362;y+=4)for(let x=0;x<282;x+=4){const i=(y*282+x)*4;if(px[i+3]>160)pts.push([x,y-80,px[i],px[i+1],px[i+2]]);}
    for(let i=pts.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[pts[i],pts[j]]=[pts[j],pts[i]];}MT.pts[d]=pts.slice(0,170);}}
if(typeof drawPlayer==='function'){const o=drawPlayer;drawPlayer=function(){
  if(!(bowNow()&&BW.loco()&&P.dead)){MT.motes.length=0;return o.apply(this,arguments);}
  try{const now=clk(),c=cellNow(P.face+cam()),DZ=HD.dissolve||{start:1.5,dur:1.6},t=now-deadAt,x=P.x,y=P.y+HD.footY;
    if(t<DZ.start+DZ.dur*.6)ell(P.x,P.y+10,22,7,'#000000',.4*(1-Math.max(0,t-DZ.start)/DZ.dur));
    if(t<DZ.start)drawCell(c,x,y);
    else{const u=Math.min(1,(t-DZ.start)/DZ.dur);if(u<1)drawCell(c,x,y,Math.pow(1-u,1.6));
      const pts=MT.pts[c.dir]||[],want=Math.floor(pts.length*Math.min(1,u*1.25));
      while(MT.motes.length<want){const p=pts[MT.motes.length];MT.motes.push({x:x+(p[0]-F.ax)*K,y:y+(p[1]-F.ay)*K,c:`rgb(${p[2]},${p[3]},${p[4]})`,t0:now,life:1.1+Math.random()*.9,vy:-(26+Math.random()*46),ph:Math.random()*6.28,r:1.2+Math.random()*1.8});}
      ctx.save();for(const m of MT.motes){const a=(now-m.t0)/m.life;if(a>=1)continue;const yy=m.y+m.vy*(now-m.t0)-14*a*a,xx=m.x+Math.sin(m.ph+(now-m.t0)*3)*5*a;
        ctx.globalCompositeOperation='source-over';ctx.globalAlpha=(1-a)*.9;ctx.fillStyle=a<.35?m.c:'#d9fbff';ctx.beginPath();ctx.arc(xx,yy,m.r*(1-a*.4),0,6.283);ctx.fill();
        ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(1-a)*.45;ctx.fillStyle='#7fe8ff';ctx.beginPath();ctx.arc(xx,yy,m.r*2.4,0,6.283);ctx.fill();}ctx.restore();}
    H.anchor={x,y};H.dir=c.dir;H.clip=c.clip;}catch(e){BW.err='death '+e.message;}};}
function drawArrow(ar){
  const now=clk(),a=ar.end==null?1:Math.max(0,1-(now-ar.end)/(ar.why==='wall'?.6:.12));if(a<=0)return;
  const L=ar.len,x=ar.x,y=ar.y-ar.h,c=ar.c,s=ar.s,n=Math.hypot(c,s),ux=c/n,uy=s/n,px=-uy,py=ux;
  ctx.save();ctx.globalAlpha*=a;ctx.lineCap='round';
  ctx.strokeStyle='rgba(20,14,10,.55)';ctx.lineWidth=3.2;ctx.beginPath();ctx.moveTo(x-ux*L,y-uy*L);ctx.lineTo(x,y);ctx.stroke();      // outline
  ctx.strokeStyle='#7a5434';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x-ux*L,y-uy*L);ctx.lineTo(x-ux*4,y-uy*4);ctx.stroke();       // shaft
  ctx.fillStyle='#e8c46a';ctx.strokeStyle='#5a3f12';ctx.lineWidth=.8;ctx.beginPath();                                                       // gold head
  ctx.moveTo(x+ux*2,y+uy*2);ctx.lineTo(x-ux*5+px*3,y-uy*5+py*3);ctx.lineTo(x-ux*4,y-uy*4);ctx.lineTo(x-ux*5-px*3,y-uy*5-py*3);ctx.closePath();ctx.fill();ctx.stroke();
  for(const sd of [1,-1]){ctx.fillStyle=sd>0?'#eef3f6':'#3f8f93';ctx.beginPath();                                                          // white / teal fletching
    ctx.moveTo(x-ux*(L-1),y-uy*(L-1));ctx.lineTo(x-ux*(L-7)+px*3*sd,y-uy*(L-7)+py*3*sd);ctx.lineTo(x-ux*(L-9),y-uy*(L-9));ctx.closePath();ctx.fill();}
  if(ar.end==null){ctx.globalAlpha*=.35;ctx.strokeStyle='#fff6d8';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-ux*(L+10),y-uy*(L+10));ctx.lineTo(x-ux*L,y-uy*L);ctx.stroke();}
  ctx.restore();
  try{ctx.save();ctx.globalAlpha=.18*a;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(ar.x-ux*L*.5,ar.y,L*.45,1.6,Math.atan2(uy,ux),0,6.283);ctx.fill();ctx.restore();}catch(e){}}
if(typeof drawParts==='function'){const o=drawParts;drawParts=function(){try{for(const ar of BW.arrows)drawArrow(ar);}catch(e){BW.err='arrow draw '+e.message;}return o.apply(this,arguments);};}

/* ---------- sword-only skills: refuse the skill keys while a bow is equipped ---------- */
addEventListener('keydown',ev=>{try{if(!bowNow()||ev.repeat)return;const k=(ev.key||'').toLowerCase();
  if(['j','u','o','y','b','n','r'].includes(k)&&!(ev.target&&/input|textarea/i.test(ev.target.tagName))){ev.stopImmediatePropagation();BW.stats.skillRefused++;note('ธนูยังไม่มีสกิล (สกิลดาบใช้ไม่ได้)','#c9d6ff');}}catch(e){}},true);

/* ---------- TEST: quick sword ↔ bow switch (uses the inventory + the game's equipItem) + limitation chip ---------- */
BW.testBow=function(){let i=P.inv.findIndex(it=>it&&it.kind==='wpn'&&it.t==='bow');
  if(i<0){const w=P.weapon&&P.weapon.t!=='fist'?P.weapon:null;const it=makeWeapon('bow',(w&&w.lvl)||P.lvl||1,(w&&w.rar)||0);it.name='Test Bow (TEST)';P.inv.push(it);i=P.inv.length-1;log('bow item',{lvl:it.lvl,rar:it.rar,atk:it.atk});}
  return i;};
BW.toggle=function(){try{if(!P||P.dead)return;
  if(P.weapon&&P.weapon.t==='bow'){const i=P.inv.findIndex(it=>it&&it.kind==='wpn'&&it.t==='sword'&&(!BW.swordUid||it.uid===BW.swordUid));const j=i>=0?i:P.inv.findIndex(it=>it&&it.kind==='wpn'&&it.t==='sword');
    if(j<0){note('ไม่พบดาบในกระเป๋า');return;}equipItem(j);}
  else{if(P.weapon&&P.weapon.t==='sword')BW.swordUid=P.weapon.uid;const i=BW.testBow();equipItem(i);}
  BW.st=null;log('switch',{to:P.weapon&&P.weapon.t});try{if(typeof recalc==='function')recalc();}catch(e){}}catch(e){BW.err='toggle '+e.message;}};
let btn=null,chipB=null;
function ui(){try{if(!document.body)return;
  if(!btn){btn=document.createElement('button');btn.id='bowTestBtn';btn.type='button';
    btn.style.cssText='position:fixed;left:14px;top:calc(212px + env(safe-area-inset-top,0px));z-index:57;min-width:44px;min-height:40px;padding:4px 10px;border-radius:12px;border:1px solid rgba(255,190,92,.6);background:rgba(10,18,44,.85);color:#ffe3a0;font:700 13px sans-serif';
    for(const ev of ['pointerdown','pointerup','mousedown','touchstart'])btn.addEventListener(ev,e=>e.stopPropagation());
    btn.addEventListener('click',e=>{e.stopPropagation();BW.toggle();});document.body.appendChild(btn);}
  if(!chipB){chipB=document.createElement('div');chipB.id='bowTestChip';
    chipB.style.cssText='position:fixed;left:14px;top:calc(258px + env(safe-area-inset-top,0px));z-index:57;padding:3px 8px;border-radius:9px;background:rgba(8,14,32,.8);border:1px solid rgba(255,190,92,.45);color:#ffe3a0;font:11px/1.35 sans-serif;pointer-events:none;max-width:60vw';
    chipB.textContent='🏹 BOW TEST · ยิงได้เฉพาะทิศ E (ท่ายิงมีทิศเดียว) · ยืน/เดิน/วิ่ง/โดนตี/ตาย มีครบ 8 ทิศ ธนู+ซองสะพายหลัง';document.body.appendChild(chipB);}
  const play=typeof G!=='undefined'&&G.state==='play'&&!G.win&&!(typeof ED!=='undefined'&&ED.on);
  const narrow=innerHeight<520;   // phone landscape: next to the TEST button, clear of the joystick
  btn.style.top=narrow?'calc(104px + env(safe-area-inset-top,0px))':'calc(212px + env(safe-area-inset-top,0px))';btn.style.left=narrow?'54px':'14px';
  chipB.style.top=narrow?'calc(150px + env(safe-area-inset-top,0px))':'calc(258px + env(safe-area-inset-top,0px))';
  btn.style.display=play?'':'none';btn.textContent=(P&&P.weapon&&P.weapon.t==='bow')?'🗡 สลับเป็นดาบ':'🏹 สลับเป็นธนู';
  chipB.style.display=play&&bowNow()?'':'none';}catch(e){BW.err='ui '+e.message;}}
setInterval(ui,250);
})();
