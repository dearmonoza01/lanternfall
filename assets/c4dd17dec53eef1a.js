
/* ---- candidate_sword_atk5_r18: p237 r4 Sword Skill 3 "นักดาบคลั่ง" (TEST only) ---- */
/* p237 r4 = r3 + beatKind also counts attack skill 5 'เขตแดนดาบพิทักษ์' (ctx id wsAtk5, beat = wave index b3 0..4): one charge per wave that lands a hit, every target of that wave gets the same crit right. Nothing else changed.
   (r3: beatKind also counts the single hit of attack skill 4 'ดาบพิพากษา' (ctx id wsAtk4, beat 0): one charge per cast however many monsters it hits. Nothing else changed. */
/* p237 r2 = r1b + beatKind also counts the hits of attack skill 3 'วังวนเจ็ดคม' (ctx id wsAtk3, hit id b3 0..6): one beat per hit, one charge per beat. Nothing else changed. */
/* p237 r1b (= r1 + the tintDraw export) — Sword Skill 3 "นักดาบคลั่ง" (candidate_sword_sk3_r1, TEST only, built on candidate_sword_sk2_8dir_r6). Not merged, not published.
   Spec (user 13 Oct 03:02):
     Self buff, no lock-on. MP 20, cooldown 20 s (started once at the cast), opening pose ~0.4 s; the 8 s timer starts at the "power opens" moment (0.17 s into the pose).
     Effect: the next 5 sword attack BEATS that actually land are guaranteed critical (existing crit path: hitEnemy opts.critAlways -> C182 core -> resolveHit crit; same crit multiplier, no extra roll, no extra damage).
       beat = one basic sword swing (cast ctx seq) | one hit of Skill 1 (ctx seq + hit id 0..4) | H1 or H2 of Skill 2 (ctx seq + 0/1).
       A beat costs ONE charge however many monsters it hits; every target of a granted beat gets the same guaranteed crit (even targets reached later, e.g. the Skill 2 wave, even if the charges ran out after the first target).
       Charge is only spent when damage was really dealt (a whiff / a wall-blocked swing / no target spends nothing). Keyed by cast id + hit id, never by enemy id.
     Basic attack speed +25 % while the buff is on through the game's own B('aspd') (P.buffs entry); Skill 1 / 2 timelines are not touched.
     Ends at 5 beats used OR 8 s (whichever is first); no stacking (a second cast is refused: no MP, no cooldown); death or leaving the Sword cancels it.
     Look: the hero is tinted red at DRAW time only (sprite atlases are never edited): multiply + soft contrast pass that keeps hair, face, clothes, outline; dark-red/orange aura ribbons in a back and a front layer (the front layer stays below the face);
           short burst when the power opens; a few small sparks at hands / sword; HUD icon with remaining charges 5->0 and the remaining seconds. The Skill 2 orange-gold wave is untouched.
     Opening pose = the Skill 2 hero frames f26..f37 (crouch, grip, slash down) reused as a TEST preview (no new Blender pose yet).
   Skill learning / slots / save are not part of this round. */
(function(){
'use strict';
const L3=window.__SK3={ver:'p237-r2',err:null,test:false,log:[],refused:[],casts:0,state:null,last:null,beats:[],ends:[]};
try{
const D=window.__SK2D,HD=window.__HERO3D,H=window.HERO3D,SK1=window.__SK1,SK2=window.__SK2L;
if(!D||!HD||!H||typeof hitEnemy!=='function'||typeof drawPlayerSprite!=='function'||typeof update!=='function'||!window.C182){L3.err='hooks missing';return;}
const CFG=L3.cfg={id:'wsSword3',mp:20,cd:20,dur:8,charges:5,aspd:.25,open:.40,activate:.17,fpsOpen:30,f0:26,n:12,tintIn:.25,tintOut:.45};
const ss=u=>u<=0?0:u>=1?1:u*u*(3-2*u),clk=()=>typeof time==='number'?time:performance.now()/1000;
const F=HD.frame,K=HD.drawScale,O=D.origin,FPS=D.fps,F0=D.f0;
const DN=['E','SE','S','SW','W','NW','N','NE'];
const dirIdx=g=>{const a=Math.atan2(Math.sin(g),Math.cos(g));return ((Math.round(a/(Math.PI/4))%8)+8)%8;};
const camYaw=()=>{try{return typeof camY==='function'?camY():0;}catch(e){return 0;}};
const BID=CFG.id,PL={main:'#ff4a22',accent:'#ffb347'};
const IMG={};for(const n of DN){const im=new Image();im.src=D.dirs[n].hero.src;IMG[n]=im;}
const okI=im=>im&&im.complete&&im.naturalWidth;
let S3=null,castN=0;
/* ---------------- buff state ---------------- */
const B3=L3.buff={on:false,charges:0,t0:0,tEnd:-9,endWhy:null,beats:new Map(),act:-9,hits:0};
const swordNow=()=>!!(P&&P.weapon&&P.weapon.t==='sword');
function refuse(why){L3.refused.push({t:+clk().toFixed(2),why});if(L3.refused.length>30)L3.refused.shift();try{textAt(P.x,P.y-62,'Sword Skill 3: '+why,'#ffb4a8',13);}catch(e){}return false;}
function buffOn(){B3.on=true;B3.charges=CFG.charges;B3.t0=clk();B3.act=clk();B3.beats=new Map();B3.hits=0;B3.endWhy=null;
  P.buffs[BID]={t:CFG.dur,max:CFG.dur,pl:PL,aspd:CFG.aspd};
  L3.log.push({ev:'on',t:+clk().toFixed(2),charges:B3.charges,dur:CFG.dur});}
function buffOff(why){if(!B3.on)return;B3.on=false;B3.tEnd=clk();B3.endWhy=why;try{delete P.buffs[BID];}catch(e){}
  L3.ends.push({why,t:+clk().toFixed(2),left:B3.charges,used:CFG.charges-B3.charges,dur:+(clk()-B3.t0).toFixed(2)});L3.log.push({ev:'off',why,t:+clk().toFixed(2),left:B3.charges});}
/* ---------------- cast: opening pose ---------------- */
function start(){
  if(!L3.test)return refuse('ใช้ได้เฉพาะโหมดทดสอบ');
  if(!P||P.dead||G.state!=='play'||G.edit)return refuse('ใช้ไม่ได้ตอนนี้');
  if(!swordNow())return refuse('ต้องถือดาบ');
  if(S3||B3.on)return refuse('บัฟทำงานอยู่ (ไม่ซ้อน)');                 // no stacking, no second cost
  if((P.cds[BID]||0)>0)return refuse(`คูลดาวน์ ${P.cds[BID].toFixed(1)} วิ`);
  if(P.dash||P.casting||(SK1&&SK1.state)||(SK2&&SK2.state))return refuse('กำลังทำท่าอื่น');
  if(P.mp<CFG.mp)return refuse('MP ไม่พอ');
  P.mp-=CFG.mp;P.cds[BID]=CFG.cd;                                         // once per cast, never refunded
  const a=(typeof P.face==='number')?P.face:0,di=dirIdx(a+camYaw());
  S3={id:++castN,t:0,di,dn:DN[di],face:a,zone:G.zone,act:false,ended:null,sx:P.x,sy:P.y};
  P.dash={vx:0,vy:0,t:99,sk3:1,hit:new Set()};
  L3.casts++;L3.state=S3;L3.log.push({ev:'cast',cast:S3.id,t:+clk().toFixed(2),dir:S3.dn});return true;}
function finishOpen(why){if(!S3)return;S3.ended=why;if(P&&P.dash&&P.dash.sk3)P.dash=null;L3.last=S3;S3=null;L3.state=null;}
function cancelAll(why){if(S3)finishOpen(why);buffOff(why);}
L3.start=start;L3.cancel=cancelAll;
function step(dt){
  if(S3){
    if(!P||P.dead){finishOpen('hero died');}
    else if(G.zone!==S3.zone||G.state!=='play'){finishOpen('left the map');}
    else if(!swordNow()){finishOpen('weapon changed');}
    else{
      if(!P.dash||!P.dash.sk3)P.dash={vx:0,vy:0,t:99,sk3:1,hit:new Set()};P.dash.vx=0;P.dash.vy=0;P.dash.t=99;P.face=S3.face;
      S3.t+=dt;
      if(!S3.act&&S3.t>=CFG.activate){S3.act=true;buffOn();try{shake(2);}catch(e){}}
      if(S3.t>=CFG.open)finishOpen('done');}}
  if(B3.on){
    if(!P||P.dead){buffOff('death');}
    else if(!swordNow()){buffOff('weapon changed');}
    else if(!P.buffs[BID]){buffOff(B3.charges>0&&clk()-B3.t0>=CFG.dur-.25?'time':'cleared');}}}
{const o=update;update=function(dt){try{step(dt);}catch(e){L3.err='step '+e.message;}return o.apply(this,arguments);};}
{const o=playerDeath;playerDeath=function(){try{cancelAll('death');}catch(e){}return o.apply(this,arguments);};}
if(typeof loadZone==='function'){const o=loadZone;loadZone=function(){try{cancelAll('left the map');}catch(e){}return o.apply(this,arguments);};}
{const o=basicAttack;basicAttack=function(){if(S3)return;return o.apply(this,arguments);};}   // no attacking during the opening pose
/* ---------------- crit guarantee (per beat) ---------------- */
function beatKind(ctx){if(!ctx)return null;if(ctx.kind==='basic'&&ctx.id==='basic:sword')return 'basic';if(ctx.id==='wsSword1')return 'sk1';if(ctx.id==='wsSword2')return 'sk2';if(ctx.id==='wsAtk3')return 'atk3';if(ctx.id==='wsAtk4')return 'atk4';if(ctx.id==='wsAtk5')return 'atk5';return null;}
{const _h=hitEnemy;hitEnemy=function(e,m,o){
  o=o||{};
  try{
    if(!(o.dot||o.echo||o.thorn||o.reflected)&&e&&!e.dead){
      const ctx=o.ctx||window.C182.cur,kind=beatKind(ctx);
      if(kind){
        const key=ctx.seq+':'+(o.b3!=null?o.b3:0),g=B3.beats.get(key);
        if(g===true){return _h.call(this,e,m,Object.assign({},o,{critAlways:true}));}              // beat already holds the right: every target gets it
        if(g===undefined&&B3.on&&B3.charges>0&&swordNow()){
          const r=_h.call(this,e,m,Object.assign({},o,{critAlways:true}));
          if(r>0){B3.beats.set(key,true);B3.charges--;B3.hits++;L3.beats.push({key,kind,left:B3.charges,t:+clk().toFixed(2)});if(L3.beats.length>200)L3.beats.shift();
            if(B3.charges<=0)buffOff('used');}                                                   // a whiff (damage 0) spends nothing
          return r;}}}
  }catch(err){L3.err='hit '+err.message;}
  return _h.call(this,e,m,o);};}
/* ---------------- draw-time tint (atlases are never modified) ---------------- */
const RAWDRAW=CanvasRenderingContext2D.prototype.drawImage,TC=new WeakMap();
const RAMP=(()=>{const st=[[0,[.18,.02,.02]],[.35,[.62,.07,.06]],[.62,[.92,.22,.16]],[.85,[1,.55,.42]],[1,[1,.78,.66]]],L=new Float32Array(256*3);
  for(let i=0;i<256;i++){const x=i/255;let k=0;while(k<st.length-2&&x>st[k+1][0])k++;const a=st[k],b=st[k+1],u=Math.max(0,Math.min(1,(x-a[0])/(b[0]-a[0])));for(let c=0;c<3;c++)L[i*3+c]=a[1][c]+(b[1][c]-a[1][c])*u;}return L;})();
function tinted(img){
  if(!okI(img)&&!(img&&img.width))return null;let t=TC.get(img);if(t)return t;
  const w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;if(!w||!h)return null;if(window.SK3SAFE239&&SK3SAFE239.on&&w*h>SK3SAFE239.maxPx){SK3SAFE239.big++;return null;}
  const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
  RAWDRAW.call(g,img,0,0);
  try{   // luminance gradient map (dark red -> red -> warm highlight) blended with the original colours: hair strands, face, cloth folds, shadow and outline all stay readable
    const id=g.getImageData(0,0,w,h),d=id.data;
    for(let i=0;i<d.length;i+=4){if(!d[i+3])continue;const r=d[i],gg=d[i+1],b=d[i+2],L=Math.max(0,Math.min(255,(.3*r+.59*gg+.11*b)|0))*3;
      d[i]=Math.min(255,(.72*RAMP[L]*255+.28*r)|0);d[i+1]=Math.min(255,(.72*RAMP[L+1]*255+.28*gg*.62)|0);d[i+2]=Math.min(255,(.72*RAMP[L+2]*255+.28*b*.52)|0);}
    g.putImageData(id,0,0);
  }catch(e){   // fallback (tainted canvas): multiply colourise
    g.globalCompositeOperation='multiply';g.fillStyle='rgb(255,158,132)';g.fillRect(0,0,w,h);g.globalCompositeOperation='destination-in';RAWDRAW.call(g,img,0,0);}
  TC.set(img,c);return c;}
let TK=0;   // current tint strength
L3.tk=()=>TK;
let TDEPTH239=0;function tintOn(ctx){if(TK<=.01)return null;if(window.SK3SAFE239&&SK3SAFE239.on&&window.PUPPETX&&PUPPETX.inGhost>0)return null;const own=Object.getOwnPropertyDescriptor(ctx,'drawImage');const prev239=(own&&own.value)||null,safe239=!!(window.SK3SAFE239&&SK3SAFE239.on);TDEPTH239++;
  ctx.drawImage=function(img){if(safe239&&TDEPTH239<=0){try{SK3SAFE239.passed++}catch(_){}return (prev239||CanvasRenderingContext2D.prototype.drawImage).apply(this,arguments)}const t=tinted(img);if(!t)return RAWDRAW.apply(this,arguments);
    const a=Array.prototype.slice.call(arguments,1);
    if(TK>=.995)return RAWDRAW.apply(this,[t].concat(a));
    RAWDRAW.apply(this,[img].concat(a));const ga=this.globalAlpha;this.globalAlpha=ga*TK;RAWDRAW.apply(this,[t].concat(a));this.globalAlpha=ga;};
  return own||{};}
function tintOff(ctx,own){if(own===null)return;TDEPTH239=Math.max(0,TDEPTH239-1);if(window.SK3SAFE239&&SK3SAFE239.on&&own&&own.get&&own.set){try{const cur=Object.getOwnPropertyDescriptor(ctx,'drawImage');if(cur&&cur.set===own.set){ctx.drawImage=own.get.call(ctx);SK3SAFE239.acc=(SK3SAFE239.acc||0)+1;return}}catch(_){}}try{delete ctx.drawImage;}catch(e){}if(own&&own.value)ctx.drawImage=own.value;}
window.__B3RAW=function(){return RAWDRAW.apply(ctx,arguments);};
L3.tintDraw=function(fn){const own=tintOn(ctx);try{fn();}finally{tintOff(ctx,own);}};   // r1b: lets other pose overlays (Provoke) draw with the same tint while the buff is on
/* ---------------- aura (procedural ribbons, back / front) + burst + sparks ---------------- */
const RIB=[];{let r=7;const R=()=>{r=(r*16807)%2147483647;return r/2147483647;};
  for(let i=0;i<22;i++){RIB.push({ph:R(),life:.8+R()*.7,bx:(R()-.5)*50,sw:4+R()*9,spd:.6+R()*.5,hgt:66+R()*60,w:2+R()*3.2,front:i%4===3,hue:R()});}}
function ribbon(c,gx,gy,t,k,part){
  for(const b of RIB){if((part==='front')!==b.front)continue;
    const u=((t/b.life)+b.ph)%1;let pts=[];const N=11,tail=.38;
    for(let j=0;j<=N;j++){const uu=u-tail*(j/N);if(uu<0)break;
      const hh=b.hgt*Math.pow(uu,.75)*(b.front?.38:1);let x=gx+b.bx*(1-.35*uu)+Math.sin(uu*7+b.ph*20+t*3.6)*b.sw*uu*1.25,y=gy-3-hh;
      if(b.front&&Math.abs(x-gx)<13)x+=(x>=gx?1:-1)*(13-Math.abs(x-gx));
      pts.push([x,y,uu]);}
    if(pts.length<3)continue;const fade=Math.sin(Math.PI*Math.min(1,u))*k;
    for(let j=0;j<pts.length-1;j++){const a=pts[j],bb=pts[j+1],f=1-j/(pts.length-1),al=fade*(.55*f+.1);if(al<.02)continue;
      const w=b.w*(.35+.65*f)*(b.front?.8:1.15);
      c.strokeStyle=`rgba(${150+Math.round(60*b.hue)},${14+Math.round(30*b.hue)},12,${al.toFixed(3)})`;c.lineWidth=w*1.5;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(bb[0],bb[1]);c.stroke();
      c.strokeStyle=`rgba(255,${96+Math.round(90*b.hue)},${28+Math.round(30*b.hue)},${(al*.9).toFixed(3)})`;c.lineWidth=w*.62;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(bb[0],bb[1]);c.stroke();}}}
function auraDraw(x,y,part){
  if(TK<=.01)return;const c=ctx,gx=x,gy=y+HD.footY,t=clk();c.save();c.lineCap='round';c.lineJoin='round';
  if(part==='back'){const g=c.createRadialGradient(gx,gy-34,4,gx,gy-34,56);g.addColorStop(0,`rgba(255,80,30,${(.20*TK).toFixed(3)})`);g.addColorStop(1,'rgba(160,10,10,0)');c.fillStyle=g;c.beginPath();c.ellipse(gx,gy-34,40,58,0,0,6.283);c.fill();
    c.fillStyle=`rgba(120,8,8,${(.28*TK).toFixed(3)})`;c.beginPath();c.ellipse(gx,gy+1,26,8,0,0,6.283);c.fill();}
  c.globalCompositeOperation=part==='back'?'source-over':'lighter';ribbon(c,gx,gy,t,TK,part);
  if(part==='front')sparks(c,gx,gy,t);
  c.restore();}
function sparks(c,gx,gy,t){   // small sparks at the hands / sword, kept at waist..chest height so they never sit on the head (r1b; approximate spots, not bone-bound)
  const a=(typeof P.face==='number'?P.face:0)+camYaw(),fx=Math.cos(a),fy=Math.sin(a)*.55,qx=-Math.sin(a),qy=Math.cos(a)*.55;c.globalCompositeOperation='lighter';
  for(let i=0;i<9;i++){const per=.5+.07*i,u=((t/per)+i*.173)%1,side=i%3===0?16:(i%3===1?-15:0),fwd=i%3===2?26:6,sx=gx+qx*side+fx*fwd+Math.sin(i*5.1+u*9)*4,sy=gy-20-u*18+Math.cos(i*3.7)*3+qy*side*.2+fy*fwd*.2;
    const al=(1-u)*Math.min(1,u*6)*TK*.95;c.fillStyle=`rgba(255,${200-Math.round(70*u)},${90-Math.round(50*u)},${al.toFixed(3)})`;c.beginPath();c.arc(sx,sy,1+1.0*(1-u),0,6.283);c.fill();}}
function burstDraw(x,y){
  const age=clk()-B3.act;if(age<0||age>.5)return;const u=age/.5,c=ctx,gx=x,gy=y+HD.footY;c.save();c.lineCap='round';
  const ring=(r,al,lw,col)=>{c.strokeStyle=col.replace('A',(al).toFixed(3));c.lineWidth=lw;c.beginPath();c.ellipse(gx,gy,r,r*.46,0,0,6.283);c.stroke();};
  c.globalCompositeOperation='lighter';
  const f=Math.pow(1-u,1.6);ring(14+66*Math.pow(u,.6),.8*f,5*(1-u)+1,'rgba(255,120,40,A)');ring(8+46*Math.pow(u,.6),.6*f,2.5,'rgba(255,220,150,A)');
  const g=c.createRadialGradient(gx,gy-24,2,gx,gy-24,54*(.4+.6*u));g.addColorStop(0,`rgba(255,190,110,${(.30*f).toFixed(3)})`);g.addColorStop(1,'rgba(220,40,10,0)');c.fillStyle=g;c.beginPath();c.arc(gx,gy-24,54,0,6.283);c.fill();
  for(let i=0;i<16;i++){const an=i/16*6.283+.2*Math.sin(i*3.1),r0=16+14*u,r1=r0+(18+36*(.5+.5*Math.sin(i*2.3)))*Math.pow(u,.55),al=(1-u)*.6,cx=Math.cos(an),cy=Math.sin(an)*.8;
    c.strokeStyle=`rgba(255,${90+(i%3)*45},${30+(i%3)*20},${al.toFixed(3)})`;c.lineWidth=3.6*(1-u)+.8;c.beginPath();c.moveTo(gx+cx*r0,gy-24+cy*r0);c.quadraticCurveTo(gx+cx*(r0+r1)/2-cy*6,gy-24+cy*(r0+r1)/2+cx*6,gx+cx*r1,gy-24+cy*r1);c.stroke();}
  c.restore();}
/* ---------------- hero draw wrapper ---------------- */
function heroOpen(x,y,alpha,dn,i){const D2=D.dirs[dn].hero,r=D2.rects[i];if(!r||!okI(IMG[dn]))return false;ctx.save();ctx.globalAlpha=alpha;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.drawImage(IMG[dn],r[0],r[1],r[2],r[3],x+(r[4]-F.ax)*K,y+HD.footY+(r[5]-F.ay)*K,r[2]*K,r[3]*K);ctx.restore();return true;}
{const o=drawPlayerSprite;drawPlayerSprite=function(x,y,bob,fa){
  // tint strength: ramps up after the power opens, fades out after the buff ends
  const now=clk();TK=B3.on?ss((now-B3.act)/CFG.tintIn):Math.max(0,1-ss((now-B3.tEnd)/CFG.tintOut));if(!B3.on&&now-B3.tEnd>CFG.tintOut+.1)TK=0;
  const burst=B3.on&&now-B3.act<.5;
  if(!S3&&TK<=.01&&!burst)return o.apply(this,arguments);
  let r;const sg=ctx;
  try{auraDraw(x,y,'back');}catch(e){L3.err='aura '+e.message;}
  const own=tintOn(sg);
  try{
    if(S3&&G.state==='play'){
      const t=S3.t,i=Math.max(0,Math.min(CFG.n-1,Math.floor(t*CFG.fpsOpen)))+(CFG.f0-F0),bi=ss(t/.08),bo=1-ss((t-(CFG.open-.1))/.1),al=Math.min(bi,bo);
      if(al<1)r=o.apply(this,arguments);
      heroOpen(x,y,al,S3.dn,i);H.anchor={x:x,y:y+HD.footY};}
    else r=o.apply(this,arguments);
  }finally{tintOff(sg,own);}
  try{auraDraw(x,y,'front');burstDraw(x,y);}catch(e){L3.err='aura '+e.message;}
  return r;};}
/* ---------------- HUD icon + TEST panel ---------------- */
let hud=null,panel=null;
function ensureHud(){if(hud)return hud;hud=document.createElement('div');hud.id='sk3Hud';
  hud.style.cssText='position:fixed;left:394px;top:58px;z-index:55;display:none;pointer-events:none;font:12px/1.2 sans-serif;color:#ffe9d2;text-align:center;width:46px';
  hud.innerHTML='<div id="sk3Ic" style="position:relative;width:44px;height:44px;border-radius:50%;padding:3px;box-sizing:border-box;background:conic-gradient(#ff6a2b 0deg,#2a0c08 0deg)"><div style="width:100%;height:100%;border-radius:50%;background:radial-gradient(circle at 50% 40%,#ff8a3a,#8f1608 72%);border:1px solid #ffcf9a;display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 2 L15 14 L12 17 L9 14 Z" fill="#fff3dc" stroke="#5a1006" stroke-width="1"/><rect x="8" y="16" width="8" height="2.2" rx="1" fill="#ffc46b" stroke="#5a1006" stroke-width=".8"/><rect x="11" y="18" width="2" height="4" fill="#5a1006"/></svg></div><b id="sk3N" style="position:absolute;right:-5px;bottom:-5px;min-width:18px;height:18px;border-radius:9px;background:#2a0c08;border:1px solid #ffb06a;font-size:12px;line-height:16px">5</b></div><div id="sk3T" style="margin-top:3px;text-shadow:0 1px 2px #000">8.0s</div>';
  document.body.appendChild(hud);return hud;}
function hudTick(){try{const h=ensureHud(),b=P&&P.buffs&&P.buffs[BID];
  if(!L3.test||!(B3.on&&b)){h.style.display='none';return;}
  h.style.display='block';const rem=Math.max(0,b.t),pct=Math.max(0,Math.min(1,rem/CFG.dur));
  h.querySelector('#sk3Ic').style.background=`conic-gradient(#ff6a2b ${(pct*360).toFixed(1)}deg,#2a0c08 0deg)`;
  h.querySelector('#sk3N').textContent=B3.charges;h.querySelector('#sk3T').textContent=rem.toFixed(1)+'s';}catch(e){}}
setInterval(hudTick,60);
function panelHTML(){const row=(a,b)=>`<div><span style="color:#d9a">${a}</span> ${b}</div>`,b=P&&P.buffs&&P.buffs[BID];
  return row('บัฟ',B3.on?`ทำงาน · คริรับประกัน เหลือ <b>${B3.charges}</b>/5 · ${b?b.t.toFixed(1):'-'} วิ`:(B3.endWhy?'จบ: '+B3.endWhy:'ปิด'))
    +row('คูลดาวน์',((P.cds[BID]||0)>0?P.cds[BID].toFixed(1)+' วิ':'พร้อม')+' · MP '+CFG.mp)+row('ความเร็วฟัน',B3.on?'+25%':'ปกติ')+row('ปฏิเสธล่าสุด',(L3.refused.slice(-1)[0]||{}).why||'-');}
function setTest(on){L3.test=!!on;
  if(on&&!panel){panel=document.createElement('div');panel.id='sk3Panel';panel.style.cssText='position:fixed;right:10px;top:345px;z-index:60;width:250px;padding:8px 10px;border-radius:10px;background:rgba(32,10,8,.88);border:1px solid #a04a2a;color:#ffeadb;font:12px/1.45 sans-serif;pointer-events:auto';
    panel.innerHTML='<b>Sword Skill 3 · นักดาบคลั่ง</b> <span style="color:#ffd65a">TEST</span><div id="sk3Body"></div><div style="display:flex;gap:6px;margin-top:6px"><button id="sk3Use" type="button" style="min-height:44px;flex:1">ใช้บัฟ (O)</button></div>';
    document.body.appendChild(panel);panel.querySelector('#sk3Use').addEventListener('click',()=>start());
    for(const ev of ['pointerdown','pointerup','mousedown','touchstart','click'])panel.addEventListener(ev,e=>e.stopPropagation());}
  if(panel)panel.style.display=on?'block':'none';if(!on)cancelAll('test mode off');}
L3.setTest=setTest;
setInterval(()=>{try{if(panel&&L3.test)panel.querySelector('#sk3Body').innerHTML=panelHTML();}catch(e){}},150);
window.addEventListener('keydown',e=>{if(!L3.test)return;if((e.key==='o'||e.key==='O')&&!e.repeat){const a=document.activeElement;if(a&&/INPUT|TEXTAREA/.test(a.tagName))return;start();}});
setInterval(()=>{try{const row=document.getElementById('hudTrayRow');if(row&&!document.getElementById('sk3Tog')){const b=document.createElement('button');b.type='button';b.className='tbtn';b.id='sk3Tog';row.appendChild(b);
  const lab=()=>{b.textContent='Sword Skill 3 · นักดาบคลั่ง: '+(L3.test?'เปิด':'ปิด');};lab();b.addEventListener('click',()=>{setTest(!L3.test);lab();});}}catch(e){}},700);
}catch(e){L3.err='init '+e.message;}
})();

