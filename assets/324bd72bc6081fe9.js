
/* ---- candidate_balance_v1_r36: p272 r2 bow skills 15 (art review r1 fixes) + approved bow skill art in game (TEST only) ---- */
/* p272 r4 (= r3 + R.aura / R.weakFx draw hooks for the looping buff auras, p275 r2)
   p272 r3 (= r2 + hooks for the motion VFX pass p275: R.tipAt/pon/heroW, R.beamFx beam width/wobble/tail, R.weakDrop mark drop-in; without p275 nothing changes)
   p272 r1 — Bow skills, all 15 (attack 5 / buff 5 / passive 5) with the approved bow skill art (DeaRz 19 Oct 2026 11:07 "นำไปใส่ได้เลย";
   handoff art/skills/bow/handoff-code-bow-art-v1.md). TEST candidate only: not merged, not published.
   Numbers: balance/bow_skills_r1/REPORT_20261019_bow-skill-numbers.md, option 85 % (the balance thread's recommendation), skill Lv 1, all
   trial values in window.BSK.cfg (one place). Mastery curve and row unlocks are the sword's (p240: row 1..5 at mastery Lv 10/20/30/40/50).
   Art: icons = the frameless 450 px set (192 px here), in-world VFX = the approved sprites (one uniform scale each, never squashed / stretched /
   mirrored; projectiles and trails are rotated to the aim), alpha < 8 cleared (handoff: Hunter's Focus noise; done for every sprite, invisible).
   VFX drawn in code where no sprite was drawn (Arrow Rain warning circle + falling arrows, Leap-Back wind circle = the wind sprite at the
   take-off spot, Fan Volley crescents, Spirit Lantern charge circle / beam / gold dome): jade #3fd6a0 / #b8ffe0 + gold #ffc95a, no fire, no blue.
   Poses: no bow SKILL animation is approved yet, so every skill plays the approved basic shot clip (bow_shoot_r13x3_layers, 8 dirs) through
   p252 / p258 with its own timing (held frames for the charge). This is a stand-in, not the final skill animation.
   Plug-in: the skills are a 'bow' line of the weapon skill window (p240 W.lines), with their own skill buttons and skill slots while a bow is held.
   Turn off with ?bsk=off. Debug: window.BSK. */
(function(){'use strict';
const A=window.__BSKA,D=window.__BOW8,BW=window.BOW,HD=window.__HERO3D,H=window.HERO3D,W=window.__WSK,B8=window.BOW8;
const CFG={
  pierce:{id:'bskPierce',name:'ยิงทะลวง',key:'J',row:0,col:0,ic:'piercing_shot',mul:6.0,pierce:3,range:520,width:36,speed:1100,cd:7,mp:16,rel:.84,lock:1.25},
  rain:{id:'bskRain',name:'ห่าธนู',key:'U',row:1,col:0,ic:'arrow_rain',waves:8,mul:.5,radius:120,castRange:420,warn:.5,fall:1.5,cd:10,mp:22,rel:.6,lock:1.0},
  leap:{id:'bskLeap',name:'กระโดดถอยยิง',key:'B',row:2,col:0,ic:'leapback_shot',back:220,leapT:.25,mul:4.0,push:{r:110,dist:160,t:.2},range:340,speed:1000,cd:9,mp:14,rel:.34,lock:.67},
  fan:{id:'bskFan',name:'ยิงพัดสามดอก',key:'N',row:3,col:0,ic:'fan_volley',n:3,mul:4.5,spread:40,range:400,speed:1000,bigSz:22,bigNear:200,cd:8,mp:16,rel:.84,lock:1.25},
  lantern:{id:'bskLantern',name:'ศรตะเกียงวิญญาณ',key:'R',row:4,col:0,ic:'spirit_lantern_arrow',charge:1.16,beam:1.2,ticks:12,mul:1.0,len:600,width:48,after:.35,cd:30,mp:40},
  focus:{id:'bskFocus',name:'สมาธินักล่า',key:'O',row:0,col:1,ic:'hunters_focus',crit:15,hit:20,dur:20,cd:30,mp:15,cast:.5},
  wind:{id:'bskWind',name:'ฝีเท้าลม',key:'Y',row:1,col:1,ic:'wind_step',speed:.25,flee:10,dur:8,cd:18,mp:15,cast:.3},
  poison:{id:'bskPoison',name:'ลูกศรพิษ',key:'',row:2,col:1,ic:'poison_arrows',tick:.5,secs:5,dur:30,cd:30,mp:12,cast:.3},
  weak:{id:'bskWeak',name:'จับจุดอ่อน',key:'',row:3,col:1,ic:'weak_spot',def:.5,dur:15,range:520,cd:18,mp:10,cast:.3},
  stance:{id:'bskStance',name:'ท่าตั้งมั่น',key:'',row:4,col:1,ic:'steady_stance',dmg:.10,aspd:.20,dur:10,cd:20,mp:12,cast:.3},
  steady:{row:0,col:2,name:'มือนิ่ง',ic:'steady_hand',range:30,dmg:.10,from:120},
  swift:{row:1,col:2,name:'ลูกศรรีบเร่ง',ic:'swift_arrows',aspd:.06},
  hawk:{row:2,col:2,name:'ตาเหยี่ยว',ic:'hawk_eye',critDmg:.40},
  double:{row:3,col:2,name:'ยิงซ้ำ',ic:'double_shot',chance:.15,mul:1.0},
  finish:{row:4,col:2,name:'ศรปลิดชีพ',ic:'finishing_shot',dmg:.25,below:.30}};
const R=window.BSK={ver:'p272-r1',on:true,public:false,err:null,cfg:CFG,log:[],fx:[],proj:[],zones:[],slides:[],weak:[],
  stats:{casts:{},refused:{},hits:{},dmg:{},ghost:0,poisonTicks:0,weakMiss:0,crits:0,finish:0,stanceBreak:0}};
try{if(/bsk=off/.test(location.search))R.on=false;}catch(e){}
if(!R.on)return;
if(!A||!D||!BW||!HD||!H||!W||!W.lines||!window.C182||!C182.api||typeof hitEnemy!=='function'){R.err='missing '+[!A&&'art',!D&&'bow8',!BW&&'bow',!W&&'wsk',!window.C182&&'c182'].filter(Boolean).join(' ');return;}
try{
const ACT=['pierce','rain','leap','fan','lantern'],BUF=['focus','wind','poison','weak','stance'],PAS=['steady','swift','hawk','double','finish'];
const clk=()=>typeof time==='number'?time:performance.now()/1000;
const wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a));
const yaw=()=>{try{return CAM&&!(typeof ED!=='undefined'&&ED.on)?CAM.yaw||0:0;}catch(e){return 0;}};
const ORDER=D.dirs,NF=D.shot.n,REL=D.shot.release,K=HD.drawScale,FY=HD.footY,AX=HD.frame.ax,AY=HD.frame.ay+80;
const dirOf=sa=>((Math.round(wrapA(sa)/(Math.PI/4))%8)+8)%8;
const bowEq=()=>!!(typeof P!=='undefined'&&P&&P.weapon&&P.weapon.t==='bow');
const liveE=e=>!!(e&&!e.dead&&e.hp>0&&!e.sprGhost&&!e.dev&&!e.removed);
const lv=()=>(P&&P.jobLv)|0;
const needLv=c=>W.cfg.unlock[Math.min(c.row|0,W.cfg.unlock.length-1)];
const unl=c=>((typeof P!=='undefined'&&P&&P.lvl)|0)>=needLv(c);
const pon=k=>R.public&&bowEq()&&!P.dead&&unl(CFG[k]);
const pct=v=>Math.round(v*1000)/10;
const stunnedNow=()=>{try{return typeof stunned==='function'&&stunned();}catch(e){return false;}};
const rnd=()=>{try{return typeof rng==='function'?rng():Math.random();}catch(e){return Math.random();}};
function log(ev,x){R.log.push(Object.assign({t:+clk().toFixed(2),ev},x||{}));if(R.log.length>120)R.log.shift();}
/* ---------------- art ---------------- */
const IM={};let imOk=0;for(const k in A.fx){const im=new Image();im.onload=()=>{imOk++;};im.src=A.fx[k].src;IM[k]=im;}
const okI=im=>im&&im.complete&&im.naturalWidth>0;
const ICON=k=>{const c=CFG[k];return c&&A.icons[c.ic]?A.icons[c.ic].src:null;};
const heroW=()=>{try{return D.layers.body.rects[ORDER[2]][D.rest][2]*K;}catch(e){return 32;}};
const heroH=()=>{try{return D.layers.body.rects[ORDER[2]][D.rest][3]*K;}catch(e){return 60;}};
/* draw one sprite: (ax,ay) = the image point (0..1) placed at (x,y), width w (height follows the image: uniform scale), angle a, rows y0..y1 (0..1) */
function spr(k,x,y,w,o){const im=IM[k];if(!okI(im))return;o=o||{};const f=A.fx[k],s=w/f.w,hh=f.h*s,ax=o.ax==null?.5:o.ax,ay=o.ay==null?.5:o.ay,y0=o.y0||0,y1=o.y1==null?1:o.y1;
  ctx.save();ctx.translate(x,y);if(o.a)ctx.rotate(o.a);if(o.alpha!=null)ctx.globalAlpha*=Math.max(0,Math.min(1,o.alpha));if(o.add)ctx.globalCompositeOperation='lighter';
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.drawImage(im,0,f.h*y0,f.w,f.h*(y1-y0),-ax*w,-ay*hh+hh*y0,w,hh*(y1-y0));ctx.restore();}
/* ---------------- damage ---------------- */
const HITS={bskRain:CFG.rain.waves,bskLantern:CFG.lantern.ticks,bskFan:2};   // native contexts count hits per target: one weight slot per possible hit
function mkCtx(id){const Aa=C182.api,wd=Aa.D().weapons&&Aa.D().weapons.bow;if(!wd)throw new Error('no bow data');
  const basic=wd.actionCoef*wd.weights.reduce((a,b)=>a+b,0);
  const def={id,mode:'native',coefTotal:basic,flatTotal:0,weights:Array(HITS[id]||1).fill(1),maxTargets:99,targeting:'around',element:'Neutral',range:700};
  const c=Aa.ctxFor('skill',id,def,{dt:'phys',lvScale:1,m0:1,reach:900,cdId:id});c.bsk=1;return c;}
function dmg(e,ctx,m,x){const prev=C182.cur;let pl,r=0;try{pl=wpal();}catch(_){}C182.cur=ctx;
  try{r=hitEnemy(e,m,Object.assign({dt:'phys',pl,ctx,kind:'arrow'},x||{}))||0;}catch(er){R.err='dmg '+er.message;}finally{C182.cur=prev;}
  const id=ctx.id;R.stats.hits[id]=(R.stats.hits[id]||0)+1;R.stats.dmg[id]=(R.stats.dmg[id]||0)+Math.max(0,r);return r;}
const isBowCtx=ctx=>!!ctx&&((ctx.kind==='basic'&&ctx.id==='basic:bow')||(ctx.kind==='skill'&&ctx.bsk));
/* ---------------- state ---------------- */
let S=null,castN=0;const BUFS={};   // BUFS[k] = {t0,end} while a buff runs
function refuse(k,why){R.stats.refused[k]=(R.stats.refused[k]||0)+1;log('refuse',{k,why});try{textAt(P.x,P.y-62,CFG[k].name+': '+why,'#ffd98a',13);}catch(e){}return false;}
function tipAt(d){const sp=D.spawn[ORDER[d]];return {x:P.x+(sp.tip[0]-AX)*K,y:P.y+FY+(sp.tip[1]-AY)*K};}
function aimAt(range){let e=null,ang=P.face||0,pt=null;
  try{const T_=window.TLOCK,t=T_&&T_.e;if(liveE(t)&&Math.hypot(t.x-P.x,t.y-P.y)<=range+60){e=t;ang=Math.atan2(t.y-P.y,t.x-P.x);pt={x:t.x,y:t.y};}}catch(_){}
  if(!e){try{const r=aimPoint(range);if(r&&isFinite(r.x)&&(r.x!==P.x||r.y!==P.y)){ang=Math.atan2(r.y-P.y,r.x-P.x);pt={x:r.x,y:r.y};}}catch(_){}}
  if(!pt)pt={x:P.x+Math.cos(ang)*range*.6,y:P.y+Math.sin(ang)*range*.6};
  return {e,ang,pt};}
function nearestE(range){let b=null,bd=1e9;for(const e of enemies){if(!liveE(e))continue;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<=range&&d<bd){bd=d;b=e;}}return b;}
/* the shot clip through p252 / p258: rel = true (no basic arrow), the frame is set here each frame */
function pose(ang,d){const st={t0:clk(),dur:10,ang,rel:true,a:1,ctx:null,b8:{d},bsk:1};BW.st=st;P.face=ang;try{if(B8)B8.dir=d;}catch(_){}return st;}
function setFrame(st,k){k=Math.max(0,Math.min(NF-1,k));st.t0=clk()-(k+.5)/NF*st.dur;}
function endPose(){if(S&&BW.st===S.st){BW.st=null;BW.lastEnd=clk();}P.atkCd=Math.min(P.atkCd||0,.05);}
function canStart(k){const c=CFG[k];
  if(!P||P.dead||G.state!=='play'||G.edit)return refuse(k,'ใช้ไม่ได้ตอนนี้');
  if(!bowEq())return refuse(k,'ต้องถือธนู');
  if(!unl(c))return refuse(k,'ล็อกอยู่ ต้องเลเวลตัวละคร '+needLv(c));
  if(S)return refuse(k,'กำลังใช้สกิลอื่น');
  if((P.cds[c.id]||0)>0)return refuse(k,'คูลดาวน์ '+P.cds[c.id].toFixed(1)+' วิ');
  if(P.dash||stunnedNow())return refuse(k,'กำลังทำท่าอื่น');
  if(BUFS[k]&&k!=='weak')return refuse(k,'บัฟทำงานอยู่ (ไม่ซ้อน)');
  if(P.mp<c.mp)return refuse(k,'MP ไม่พอ');
  if(BW.st&&!BW.st.bsk&&BW.st.rel)return refuse(k,'กำลังยิง');      // a basic arrow already left: wait for the shot to end
  return true;}
function begin(k,ang,x){const c=CFG[k];if(BW.st&&!BW.st.bsk){BW.st=null;}P.atkCd=0;
  P.mp-=c.mp;P.cds[c.id]=c.cd;
  const d=dirOf(ang+yaw());S=Object.assign({k,id:++castN,t0:clk(),ang,d,zone:G.zone,rel:false,st:pose(ang,d),ctx:mkCtx(c.id)},x||{});
  R.stats.casts[k]=(R.stats.casts[k]||0)+1;log('cast',{k,dir:ORDER[d],cast:S.id});return true;}
function cast(k){
  try{if(!canStart(k))return false;const c=CFG[k];
  if(k==='fan'&&TRI)return triCast(c);   /* r77: p284 */
  if(k==='pierce'||k==='fan'||k==='leap'||k==='lantern'){const a=aimAt(k==='pierce'?c.range:k==='lantern'?c.len:c.range);return begin(k,a.ang,{e:a.e});}
  if(k==='rain'){const a=aimAt(c.castRange);let dx=a.pt.x-P.x,dy=a.pt.y-P.y,dl=Math.hypot(dx,dy);if(dl>c.castRange){dx*=c.castRange/dl;dy*=c.castRange/dl;}
    return begin(k,Math.atan2(dy,dx)||a.ang,{tx:P.x+dx,ty:P.y+dy});}
  if(k==='weak'){let e=null;try{const t=window.TLOCK&&TLOCK.e;if(liveE(t)&&Math.hypot(t.x-P.x,t.y-P.y)<=c.range)e=t;}catch(_){}if(!e)e=nearestE(c.range);
    if(!e)return refuse(k,'ไม่มีเป้าในระยะ '+c.range+' px');return begin(k,Math.atan2(e.y-P.y,e.x-P.x),{e});}
  return begin(k,P.face||0,{});   // buffs
  }catch(er){R.err='cast '+er.message;S=null;return false;}}
/* ---------------- buffs ---------------- */
const BENT={focus:c=>({crit:c.crit,hit:c.hit}),wind:c=>({speed:c.speed,flee:c.flee}),poison:()=>({}),stance:c=>({aspd:c.aspd})};
function buffOn(k){const c=CFG[k];BUFS[k]={t0:clk(),end:clk()+c.dur};P.buffs[c.id]=Object.assign({t:c.dur,max:c.dur,pl:{main:k==='poison'?'#b77bff':'#3fd6a0',accent:'#ffc95a'},bsk:k},BENT[k](c));
  if(k==='stance')BUFS[k].px=P.x,BUFS[k].py=P.y;log('buff on',{k});}
function buffOff(k,why){if(!BUFS[k])return;delete BUFS[k];try{delete P.buffs[CFG[k].id];}catch(_){}log('buff off',{k,why});}
function weakOn(e){const c=CFG.weak;try{const Kk=C182.api.K;const hc=Kk.hitChance(playerHit()+(B('hit')||0),e.eva||0,e.L);if(rnd()>=hc){R.stats.weakMiss++;textAt(e.x,e.y-e.sz*1.6,'MISS','#9fb4d8',14,{life:.6});log('weak miss',{hc:+hc.toFixed(2)});return;}}catch(_){}
  let w=R.weak.find(x=>x.e===e);if(!w){w={e};R.weak.push(w);}w.t0=clk();w.end=clk()+c.dur;e.st=e.st||{};e.st.armorBreak=Math.max(e.st.armorBreak||0,c.dur);log('weak',{mon:e.type});}
/* ---------------- projectiles ---------------- */
function shoot(o){const c=Math.cos(o.ang),s=Math.sin(o.ang),tip=tipAt(S?S.d:dirOf(o.ang+yaw()));
  const p=Object.assign({c,s,x:P.x,y:P.y,x0:P.x,y0:P.y,trav:0,hit:new Set(),end:null,t0:clk(),vx:tip.x-P.x,vy:tip.y-P.y},o);
  if(o.lat){p.x+=-s*o.lat;p.y+=c*o.lat;p.x0=p.x;p.y0=p.y;}
  R.proj.push(p);return p;}
function stepP(p,dt){if(p.end!=null)return;let dist=p.speed*dt;const n=Math.max(1,Math.ceil(dist/6)),dd=dist/n;
  for(let i=0;i<n;i++){
    if(p.trav+dd>p.range){p.end=clk();p.why='range';return;}
    const nx=p.x+p.c*dd,ny=p.y+p.s*dd;
    if(typeof blocked==='function'&&blocked(nx,ny,2)){p.end=clk();p.why='wall';return;}
    p.x=nx;p.y=ny;p.trav+=dd;
    for(const e of enemies){if(!liveE(e)||p.hit.has(e))continue;if(Math.hypot(e.x-p.x,e.y-p.y)>(e.sz||16)+p.hw)continue;
      if(p.cap){const mx=((e.sz||16)>=CFG.fan.bigSz&&Math.hypot(e.x-P.x,e.y-P.y)<=CFG.fan.bigNear)?2:1;if((p.cap.get(e)||0)>=mx)continue;p.cap.set(e,(p.cap.get(e)||0)+1);}
      p.hit.add(e);dmg(e,p.ctx,p.mul,{fx:p.x-p.c*12,fy:p.y-p.s*12});
      if(p.impact)fxAdd(p.impact,e.x,e.y-(e.sz||16)*.6,{w:Math.max((e.sz||16)*2.2,heroW()*.8),dur:.42});
      if(p.kind==='fan')fxAdd('spiral',e.x,e.y-(e.sz||16)*.6,{w:(e.sz||16)*2.4,dur:.5});
      if(--p.left<=0){p.end=clk();p.why='hit';return;}}}}
/* ---------------- FX list ---------------- */
function fxAdd(k,x,y,o){R.fx.push(Object.assign({k,x,y,t0:clk(),dur:.4,w:40},o||{}));if(R.fx.length>80)R.fx.shift();}
/* ---------------- per frame ---------------- */
function tick(dt){const now=clk();
  if(S){const c=CFG[S.k],t=now-S.t0;
    const lost=!P||P.dead||G.zone!==S.zone||G.state!=='play'||!bowEq()||BW.st!==S.st;
    if(lost){log('cancel',{k:S.k,why:!P||P.dead?'death':G.zone!==S.zone?'map':!bowEq()?'weapon':'pose'});if(BW.st===S.st)BW.st=null;S=null;}
    else{P.face=S.ang;
      if(S.tri)triTick(S,t,c,dt);   /* r77: p284 */
      else if(ACT.includes(S.k)&&S.k!=='lantern'){const dur=c.rel*NF/REL;
        setFrame(S.st,t<dur?Math.floor(t/dur*NF):NF-1);if(t>=dur)S.st.dur=10;
        if(S.k==='leap'){if(!S.leapInit){S.leapInit=1;S.sx=P.x;S.sy=P.y;fxAdd('wind',P.x,P.y,{w:heroW()*3.1,dur:.9,hold:.25,ay:.733});
            for(const e of enemies){if(!liveE(e)||e.m&&e.m.boss)continue;const dx=e.x-P.x,dy=e.y-P.y,dl=Math.hypot(dx,dy);if(dl>CFG.leap.push.r+(e.sz||16))continue;
              const a=dl>1?Math.atan2(dy,dx):S.ang,f=(e.m&&e.m.elite)?.3:1;R.slides.push({e,c:Math.cos(a),s:Math.sin(a),v:CFG.leap.push.dist*f/CFG.leap.push.t,t:CFG.leap.push.t});}}
          if(t<c.leapT){const u=Math.min(1,t/c.leapT),want=c.back*(1-(1-u)*(1-u));const cur=S.moved||0,stp=want-cur;
            const nx=P.x-Math.cos(S.ang)*stp,ny=P.y-Math.sin(S.ang)*stp;if(!(typeof blocked==='function'&&blocked(nx,ny,P.r||10))){P.x=nx;P.y=ny;S.moved=want;}}}
        if(!S.rel&&t>=c.rel){S.rel=true;release(S);}
        if(t>=c.lock){endPose();S=null;}}
      else if(S.k==='lantern'){const t1=c.charge,t2=t1+c.beam,t3=t2+c.after;
        if(t<t1)setFrame(S.st,Math.floor(t/t1*REL));else if(t<t2)setFrame(S.st,REL+1);else setFrame(S.st,REL+1+Math.floor((t-t2)/c.after*(NF-REL-2)));
        if(t>=t1&&!S.rel){S.rel=true;S.ticks=0;try{sfx('swing','bow');}catch(_){}}
        if(S.rel){while(S.ticks<c.ticks&&t>=t1+S.ticks*(c.beam/c.ticks)){S.ticks++;beamTick(S);}}
        if(t>=t3){endPose();S=null;}}
      else{ // buffs: hand to the quiver (first frames of the clip) for the cast time
        setFrame(S.st,Math.floor(Math.min(1,t/c.cast)*9));
        if(t>=c.cast){if(S.k==='weak')weakOn(S.e);else buffOn(S.k);fxAdd('flash',P.x,P.y-heroH()*.5,{dur:.35,col:S.k==='poison'?'#b77bff':'#3fd6a0'});endPose();S=null;}}}}
  // buffs: time out / weapon / death / stance broken by moving
  for(const k in BUFS){const b=BUFS[k];if(!P||P.dead){buffOff(k,'death');continue;}if(!bowEq()){buffOff(k,'weapon');continue;}if(!P.buffs[CFG[k].id]){buffOff(k,'time');continue;}
    if(k==='stance'&&Math.hypot(P.x-b.px,P.y-b.py)>2){buffOff(k,'moved');R.stats.stanceBreak++;try{textAt(P.x,P.y-62,'ท่าตั้งมั่น: หลุดเพราะขยับ','#b8ffe0',13);}catch(_){}}}
  // projectiles, zones, slides, poison, weak marks
  if(G.state==='play'){for(const p of R.proj)stepP(p,dt);if(TRI)triStep(+dt||0);}
  R.proj=R.proj.filter(p=>p.end==null||now-p.end<(p.kind==='spear'?.7:.15));
  for(const z of R.zones){const tz=now-z.t0;z.dw=z.dw||0;while(z.dw<z.n&&tz>=z.warn+z.dw*(z.fall/z.n)-.35){z.dw++;rainDrops(z);}while(z.wave<z.n&&tz>=z.warn+z.wave*(z.fall/z.n)){z.wave++;rainWave(z);}}
  R.zones=R.zones.filter(z=>now-z.t0<z.warn+z.fall+.8);
  for(const sl of R.slides){if(sl.t<=0||!liveE(sl.e))continue;const st=Math.min(sl.t,dt);sl.t-=st;const nx=sl.e.x+sl.c*sl.v*st,ny=sl.e.y+sl.s*sl.v*st;if(!(typeof blocked==='function'&&blocked(nx,ny,(sl.e.sz||16)*.5))){sl.e.x=nx;sl.e.y=ny;}}
  R.slides=R.slides.filter(s=>s.t>0);
  for(const e of enemies){const z=e._bskPz;if(!z)continue;if(!liveE(e)){delete e._bskPz;continue;}z.next-=dt;
    if(z.next<=0){z.next+=1;z.left--;R.stats.poisonTicks++;try{applyDamage(e,Math.max(1,Math.round(z.dps)),false,{dot:'poison'});}catch(er){R.err='poison '+er.message;}
      fxAdd('puff',e.x,e.y-(e.sz||16)*1.4,{dur:.5});if(z.left<=0)delete e._bskPz;}}
  for(const w of R.weak){if(!liveE(w.e)||now>=w.end){if(w.e&&w.e.st&&w.e.st.armorBreak>0&&now>=w.end-.05)w.e.st.armorBreak=0;w.dead=1;continue;}w.e.st.armorBreak=Math.max(w.e.st.armorBreak||0,w.end-now);}
  R.weak=R.weak.filter(w=>!w.dead);
  R.fx=R.fx.filter(f=>now-f.t0<f.dur);
  // passive: range
  try{const want=340+(pon('steady')?CFG.steady.range:0);if(BW.cfg.range!==want){BW.cfg.range=want;if(WEAPONS.bow)WEAPONS.bow.range=want;}}catch(_){}}
/* p284 r1 — bow "ยิงพัดสามดอก" → 3 rapid shots at ONE locked target (TEST only; order orders/code/ORDER_20261023_bow-triple-shot.md,
   DeaRz passed the demo 23 Oct 12:37 "ผ่านแต่ไม่ต้องมีจุดบนหัว"; look + timing = approved/vfx/BOW_TRIPLE_SHOT_demo_r1_source.html tab B1).
   Numbers = balance proposal balance/sword_rework_r1/REPORT_20261023_bow_triple_shot.md (TEST, DeaRz reviews later): Lv4 232% / 232% / 310%.
   Lv5+ splash (90 px, 50% of the last shot) and Lv10 4 shots are in the table; Lv5 splash is drawn with the finisher ring.
   Pose: the approved basic shot clip (bow_shoot_r13x3) re-timed: draw → release → half re-draw → release ... (stand-in, no new bow skill pose).
   ?bowtriple=off = the old 3-arrow fan. Lives inside p272 (window.BSK) so it reuses its cast / cooldown / MP / pose / damage code. */
const TRI=(()=>{try{return !/bowtriple=off/.test(location.search);}catch(_){return true;}})();
const T3={SHOT:[.24,.42,.62,.80],FL:.15,REDRAW:.55,TAIL:.3,FRONT:Math.PI/2,
  L:[null,[3,1.68,2.24],[3,1.92,2.56],[3,2.16,2.88],[3,2.40,3.20],[3,2.76,3.68,.9],[3,3.00,4.00,.9],[3,3.26,4.35,.9],[3,3.55,4.74,.9],[3,3.86,5.15,.9],[4,4.27,5.70,.9]]};   /* r80: approved table balance/approved/BOW_TRIPLE_SHOT_v1.md (DeaRz 14:10 "ดาเมจรวม 800%พอ") */
const TJD='#3fd6a0',TJL='#9ff5d2',TGD='#ffd36b',TWY='#fff2c0';
const TF=R.triFx={on:TRI,arrows:[],stuck:[],parts:[],rings:[],marks:[],log:[],stats:{casts:0,shots:0,hits:0,retarget:0,straight:0,splash:0,peakParts:0}};
CFG.fan.triOn=TRI;if(TRI)HITS.bskFan=4;   // one weight slot per hit on the same target (Lv10 = 4 shots)
const triLv=()=>{try{const v=window.SKLV&&SKLV.on&&SKLV.lv&&SKLV.lv.fan;return Math.max(1,Math.min(10,v|0||4));}catch(_){return 4;}};
const triRow=()=>T3.L[triLv()];
const triEnd=n=>T3.SHOT[n-1]+T3.TAIL;
function triPick(range,ang,from){from=from||P;let b=null,bd=1e9;
  for(const e of enemies){if(!liveE(e))continue;const dx=e.x-P.x,dy=e.y-P.y,d=Math.hypot(dx,dy);if(d>range+(e.sz||16)*.5)continue;
    const df=from===P?d:Math.hypot(e.x-from.x,e.y-from.y),da=Math.abs(wrapA(Math.atan2(dy,dx)-ang)),sc=df+(da>T3.FRONT?1e5:0);if(sc<bd){bd=sc;b=e;}}
  return b;}
function triCast(c){const a=aimAt(c.range);let e=liveE(a.e)&&Math.hypot(a.e.x-P.x,a.e.y-P.y)<=c.range+(a.e.sz||16)*.5?a.e:triPick(c.range,a.ang);
  const ang=e?Math.atan2(e.y-P.y,e.x-P.x):a.ang,row=triRow();TF.stats.casts++;
  const ok=begin('fan',ang,{e,tri:1,row,n:0,mk:null});if(ok){S.mk=e?triMark(e):null;TF.log.push({ev:'cast',lv:triLv(),tgt:e?e.type:null});}return ok;}
function triMark(e){const m={e,t0:clk(),hits:0,last:null,end:null};TF.marks.push(m);if(TF.marks.length>4)TF.marks.shift();return m;}
const tpart=o=>{if(TF.parts.length>=110)return;TF.parts.push(Object.assign({t0:clk(),dur:.4,vx:0,vy:0,g:0,drag:0,s:5,col:TJD,k:'s'},o));};
const trnd=(a,b)=>a+Math.random()*(b-a);
function tipNow(S){const tp=tipAt(S.d);return {x:tp.x+Math.cos(S.ang)*6,y:tp.y+Math.sin(S.ang)*6};}
function triTick(Q,t,c,dt){const row=Q.row,N=row[0],sh=T3.SHOT,end=triEnd(N);dt=Math.min(.05,dt||0);
  // keep facing the locked target (re-pick if it died; nothing left = keep the last aim)
  if(!liveE(Q.e)&&Q.n<N){const ne=triPick(c.range,Q.ang);if(ne&&ne!==Q.e){if(Q.mk)Q.mk.end=clk();Q.e=ne;TF.stats.retarget++;Q.mk=triMark(ne);}else if(!ne){if(Q.e&&Q.mk)Q.mk.end=clk();Q.e=null;}}
  if(Q.e){const a=Math.atan2(Q.e.y-P.y,Q.e.x-P.x);Q.ang=a;const d=dirOf(a+yaw());if(d!==Q.d){Q.d=d;Q.st.b8.d=d;try{if(B8)B8.dir=d;}catch(_){}}}
  // pose: draw 0..REL by shot 1, then for every next shot a quick release follow-through and a half re-draw, then the clip's follow-through
  let k;if(t<sh[0])k=t/sh[0]*REL;
  else if(Q.n<N&&t<sh[N-1]){const i=Math.max(0,Q.n-1),a=sh[i],b=sh[i+1],u=(t-a)/(b-a);k=u<.18?REL+u/.18*1.2:REL*T3.REDRAW+(u-.18)/.82*REL*(1-T3.REDRAW);}
  else k=REL+Math.min(1,(t-sh[N-1])/T3.TAIL)*(NF-1-REL);
  setFrame(Q.st,Math.floor(k));
  // charge motes: jade into the arrow tip while drawing, gold before the last shot
  const tp=tipNow(Q),hs=heroH()/67;
  const gold=Q.n===N-1&&t>sh[N-2];if((t<sh[0]||gold)&&Math.random()<dt*(gold?30:40)){const an=trnd(0,6.283),r=trnd(26,46)*hs;
    tpart({k:'pull',x:tp.x+Math.cos(an)*r,y:tp.y+Math.sin(an)*r,dur:gold?.2:.25,s:trnd(4,7)*hs,col:gold?TGD:TJD,S:Q});}
  while(Q.n<N&&t>=sh[Q.n]){triFire(Q,Q.n,N,c);Q.n++;}
  if(t>=end){endPose();S=null;}}
function triFire(S,i,N,c){const big=i===N-1,tp=tipNow(S),hs=heroH()/67;TF.stats.shots++;
  let e=liveE(S.e)?S.e:null;
  const ar={i,big,t0:clk(),x0:tp.x,y0:tp.y,x:tp.x,y:tp.y,e,ang:S.ang,ctx:S.ctx,mul:big?S.row[2]:S.row[1],splash:big?(S.row[3]||0):0,pts:[],done:null,mk:S.mk,hs,
    straight:!e,trav:0};
  if(!e)TF.stats.straight++;
  TF.arrows.push(ar);
  // release: string flash, small jade ring at the bow, motes thrown forward, bow recoil
  TF.rings.push({x:tp.x,y:tp.y,t0:clk(),dur:big?.2:.16,k:'flash',r:(big?70:50)*hs*.5,col:big?TGD:TJD});
  TF.rings.push({x:tp.x+Math.cos(S.ang)*10,y:tp.y+Math.sin(S.ang)*10,t0:clk(),dur:.22,k:'ring',r:(big?40:28)*hs,w:4,col:TJL,flat:1});
  for(let q=0;q<(big?6:3);q++){const sp=trnd(120,260);tpart({x:tp.x,y:tp.y+trnd(-6,6),vx:Math.cos(S.ang)*sp,vy:Math.sin(S.ang)*sp+trnd(-40,40),drag:5,dur:.3,s:trnd(4,7)*hs,col:Math.random()<.6?TJD:TGD});}
  try{if(window.BOWFX)BOWFX.recoil={t0:clk(),a:S.ang};}catch(_){}
  try{sfx('swing','bow');}catch(_){}}
const hitY=e=>e.y-(e.sz||16)*.6;
function triStep(dt){const now=clk(),c=CFG.fan;
  for(const ar of TF.arrows){if(ar.done!=null)continue;
    if(!ar.straight&&!liveE(ar.e)){const ne=triPick(c.range,ar.ang,{x:ar.x,y:ar.y});
      if(ne){ar.e=ne;ar.x0=ar.x;ar.y0=ar.y;ar.t0=now;TF.stats.retarget++;}else{ar.straight=true;TF.stats.straight++;}}
    if(ar.straight){const sp=Math.max(1400,c.range/T3.FL*.6),st=sp*dt,nx=ar.x+Math.cos(ar.ang)*st,ny=ar.y+Math.sin(ar.ang)*st;ar.trav+=st;
      if(ar.trav>c.range){ar.done=now;ar.miss=1;continue;}ar.x=nx;ar.y=ny;}
    else{const e=ar.e,u=Math.min(1,(now-ar.t0)/T3.FL),tx=e.x-Math.cos(ar.ang)*(e.sz||16)*.3,ty=hitY(e)+(ar.i-1)*4;
      ar.ang=Math.atan2(ty-ar.y0,tx-ar.x0);ar.x=ar.x0+(tx-ar.x0)*u;ar.y=ar.y0+(ty-ar.y0)*u-Math.sin(u*Math.PI)*6;ar.tx=tx;ar.ty=ty;
      if(u>=1){ar.done=now;triImpact(ar,e);}}
    ar.pts.push([ar.x,ar.y,now]);while(ar.pts.length&&now-ar.pts[0][2]>.09)ar.pts.shift();}
  TF.arrows=TF.arrows.filter(a=>a.done==null||now-a.done<.36);
  for(const p of TF.parts){const dt2=Math.min(dt,.05);if(p.k==='pull'&&p.S){const tp=p.S===S&&S?tipNow(S):null;if(tp){p.x+=(tp.x-p.x)*Math.min(1,dt2*14);p.y+=(tp.y-p.y)*Math.min(1,dt2*14);}}
    else{p.vy+=p.g*dt2;const f=Math.max(0,1-p.drag*dt2);p.vx*=f;p.vy*=f;p.x+=p.vx*dt2;p.y+=p.vy*dt2;}}
  TF.parts=TF.parts.filter(p=>now-p.t0<p.dur);TF.stats.peakParts=Math.max(TF.stats.peakParts,TF.parts.length);
  TF.rings=TF.rings.filter(r=>now-r.t0<r.dur);
  for(const s of TF.stuck){if(!s.dis&&now-s.t0>.7){s.dis=1;const x=s.e.x+s.dx,y=s.e.y+s.dy;for(let q=0;q<4;q++)tpart({x,y,vx:trnd(-20,20),vy:-trnd(20,60),g:-20,dur:.6,s:trnd(4,7)*s.hs,col:TJD});}}
  TF.stuck=TF.stuck.filter(s=>now-s.t0<1.1);
  TF.marks=TF.marks.filter(m=>m.end==null||now-m.end<.3);}
function triImpact(ar,e){const big=ar.big,c=CFG.fan,hs=ar.hs,hx=ar.tx,hy=ar.ty,now=clk();TF.stats.hits++;
  dmg(e,ar.ctx,ar.mul,{fx:ar.x0,fy:ar.y0,tri:1});
  if(big&&e&&!(e.m&&e.m.boss)){const f=(e.m&&e.m.elite)?.4:1;R.slides.push({e,c:Math.cos(ar.ang),s:Math.sin(ar.ang),v:26*f/.12,t:.12});e._triJit=now;}
  else if(e)e._triJit=now;
  if(big&&ar.splash>0){for(const o of enemies){if(o===e||!liveE(o))continue;if(Math.hypot(o.x-e.x,o.y-e.y)>90+(o.sz||16)*.5)continue;TF.stats.splash++;dmg(o,ar.ctx,ar.mul*.5,{fx:e.x,fy:e.y,tri:1});}}
  const m=ar.mk&&ar.mk.e===e?ar.mk:TF.marks.find(q=>q.e===e&&q.end==null);if(m){m.hits++;m.last=now;if(big)m.end=now;}
  TF.rings.push({x:hx,y:hy,t0:now,dur:big?.22:.15,k:'flash',r:(big?120:70)*hs*.5,col:big?TWY:TJL});
  TF.rings.push({x:hx,y:hy,t0:now,dur:big?.4:.28,k:'ring',r:(big?70:40)*hs,w:big?6:4,col:big?TGD:TJD,flat:1});
  for(let q=0;q<(big?10:6);q++){const a=ar.ang+Math.PI+trnd(-1.2,1.2)+(Math.random()<.3?Math.PI:0);tpart({k:'shard',x:hx,y:hy,a,v:trnd(160,320)*hs,dur:trnd(.22,.36),s:trnd(8,16)*hs,col:q%2?TJL:TGD});}
  for(let q=0;q<(big?8:3);q++)tpart({x:hx,y:hy,vx:trnd(-40,120)*Math.cos(ar.ang)-trnd(0,30),vy:-trnd(40,140),g:80,drag:1.5,dur:trnd(.4,.8),s:trnd(4,8)*hs,col:Math.random()<.6?TJD:TGD});
  TF.stuck.push({e,t0:now,dx:hx-e.x+trnd(-4,4),dy:hy-e.y,a:ar.ang+trnd(-.15,.15),big,hs});
  if(big){TF.rings.push({x:e.x,y:e.y,t0:now,dur:.55,k:'gpulse',r:(ar.splash?90:100)*hs,col:TGD});
    for(let q=0;q<5;q++)tpart({k:'dust',x:e.x+trnd(-20,20)*hs,y:e.y,vx:trnd(20,80)*Math.cos(ar.ang),vy:-trnd(10,25),dur:trnd(.5,.8),s:trnd(12,18)*hs,col:'#c8a878'});}}
/* ---- drawing (world space, inside drawParts) ---- */
function tGlow(x,y,r,col,a){if(a<=0||r<=0)return;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=a;ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.fill();}
function tBand(pts,wf,col,a){if(pts.length<2||a<=0)return;const L2=[],R2=[];for(let i=0;i<pts.length;i++){const p0=pts[Math.max(0,i-1)],p1=pts[Math.min(pts.length-1,i+1)],dx=p1[0]-p0[0],dy=p1[1]-p0[1],l=Math.hypot(dx,dy)||1,w=wf(i/(pts.length-1))/2;
    L2.push([pts[i][0]-dy/l*w,pts[i][1]+dx/l*w]);R2.push([pts[i][0]+dy/l*w,pts[i][1]-dx/l*w]);}
  ctx.globalAlpha=a;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(L2[0][0],L2[0][1]);for(const q of L2)ctx.lineTo(q[0],q[1]);for(let i=R2.length-1;i>=0;i--)ctx.lineTo(R2[i][0],R2[i][1]);ctx.closePath();ctx.fill();}
function tArrow(x,y,a,al,gl,sc){ctx.save();ctx.globalAlpha=al;ctx.translate(x,y);ctx.rotate(a);ctx.scale(sc,sc);
  if(gl>0){ctx.save();ctx.globalCompositeOperation='lighter';tGlow(22,0,30,'rgba(63,214,160,.8)',al*gl);ctx.restore();ctx.globalAlpha=al;}
  ctx.strokeStyle='#6a4a2c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(40,0);ctx.stroke();
  ctx.fillStyle=TJL;ctx.beginPath();ctx.moveTo(40,-4);ctx.lineTo(50,0);ctx.lineTo(40,4);ctx.closePath();ctx.fill();
  ctx.fillStyle=TGD;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-5,-5);ctx.lineTo(8,-1);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-5,5);ctx.lineTo(8,1);ctx.closePath();ctx.fill();ctx.restore();}
const segT=(t,a,b)=>Math.max(0,Math.min(1,(t-a)/(b-a))),easeT=u=>1-(1-u)*(1-u);
function tRingG(x,y,r,w,col,a,rot,dash){if(a<=0||r<=0)return;ctx.save();ctx.translate(x,y);ctx.scale(1,.5);if(rot)ctx.rotate(rot);ctx.globalAlpha=a;ctx.strokeStyle=col;ctx.lineWidth=w;if(dash)ctx.setLineDash(dash);ctx.beginPath();ctx.arc(0,0,r,0,6.283);ctx.stroke();ctx.restore();}
function triDrawGround(){if(!TRI)return;const now=clk();ctx.save();
  for(const m of TF.marks){const e=m.e;if(!e)continue;const on=segT(now,m.t0+.08,m.t0+.2)*(m.end==null?1:1-segT(now,m.end+T3.FL*0,m.end+.25));if(on<=0)continue;
    const sc=Math.max(.8,(e.sz||16)/16),n=Math.min(3,m.hits),r=(46-20*n/3)*sc;
    ctx.globalCompositeOperation='lighter';tRingG(e.x,e.y,r+8,3,TJD,on*.8,now*1.5,[14,8]);
    ctx.save();ctx.translate(e.x,e.y);ctx.scale(1,.5);const g=ctx.createRadialGradient(0,0,0,0,0,r+4);g.addColorStop(0,'rgba(63,214,160,.28)');g.addColorStop(1,'rgba(63,214,160,0)');ctx.globalAlpha=on;ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r+4,0,6.283);ctx.fill();ctx.restore();}
  for(const g of TF.rings){if(g.k!=='gpulse')continue;const age=now-g.t0,u=segT(age,0,.5),k=g.r/100;ctx.globalCompositeOperation='lighter';
    tRingG(g.x,g.y,(30+70*easeT(u))*k,8*(1-u),TGD,1-u);tRingG(g.x,g.y,(20+50*easeT(segT(age,.05,.55)))*k,4*(1-u),TJD,(1-u)*.8);}
  ctx.restore();}
function triDraw(){if(!TRI)return;const now=clk();ctx.save();
  // corner ticks of the lock-on (no pips above the head, DeaRz 12:37)
  for(const m of TF.marks){const e=m.e;if(!e)continue;const on=segT(now,m.t0+.08,m.t0+.2)*(m.end==null?1:1-segT(now,m.end,m.end+.25));if(on<=0)continue;
    const sc=Math.max(.8,(e.sz||16)/16),n=Math.min(3,m.hits),r=(46-20*n/3)*sc,cx=e.x,cy=hitY(e);ctx.globalAlpha=on;ctx.strokeStyle=TJL;ctx.lineWidth=2.5;ctx.lineCap='round';
    for(let k=0;k<4;k++){const a=k*Math.PI/2+.785+now*.8;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*(r+8),cy+Math.sin(a)*(r+8));ctx.lineTo(cx+Math.cos(a)*(r-2),cy+Math.sin(a)*(r-2));ctx.stroke();}}
  // arrows stuck in the target, then they dissolve into motes
  for(const s of TF.stuck){const age=now-s.t0,a=1-segT(age,.7,1.1);if(a<=0||!s.e)continue;const jx=s.e._triJit&&now-s.e._triJit<.12?Math.sin(now*60)*2:0,x=s.e.x+s.dx+jx,y=s.e.y+s.dy,sc=s.hs*(s.big?1.25:1);
    tArrow(x-Math.cos(s.a)*44*sc,y-Math.sin(s.a)*44*sc,s.a,a,.3*(1-segT(age,0,.4)),sc);}
  // flight: jade ribbon with a white core behind each arrow; afterglow along the path for 0.35 s after the hit
  ctx.globalCompositeOperation='lighter';
  for(const ar of TF.arrows){const sc=ar.hs*(ar.big?1.25:1);
    if(ar.done==null){if(ar.pts.length>1){tBand(ar.pts,f=>(ar.big?14:9)*ar.hs*f,ar.big?TGD:TJD,.55);tBand(ar.pts,f=>(ar.big?5:3)*ar.hs*f,TWY,.8);}}
    else if(!ar.miss){const aft=1-segT(now,ar.done,ar.done+.35);if(aft>0){const pts=[];for(let k=0;k<=8;k++){const f=k/8,u=.55+.45*f;pts.push([ar.x0+(ar.tx-ar.x0)*u,ar.y0+(ar.ty-ar.y0)*u]);}tBand(pts,f=>(ar.big?8:5)*ar.hs*f*aft,TJD,.4*aft);}}}
  ctx.globalCompositeOperation='source-over';
  for(const ar of TF.arrows){if(ar.done!=null)continue;const sc=ar.hs*(ar.big?1.25:1);tArrow(ar.x-Math.cos(ar.ang)*50*sc*.7,ar.y-Math.sin(ar.ang)*50*sc*.7,ar.ang,1,ar.big?1:.7,sc);}
  // the arrow on the string while drawing (glows brighter before the finisher)
  if(S&&S.tri&&S.n<S.row[0]){const tp=tipNow(S),gl=S.n===S.row[0]-1?1:S.n?.6:segT(now-S.t0,.05,.22);tArrow(tp.x-Math.cos(S.ang)*48*(heroH()/67),tp.y-Math.sin(S.ang)*48*(heroH()/67),S.ang,.95,gl,heroH()/67*(S.n===S.row[0]-1?1.1:1));}
  // flashes, rings, particles
  for(const g of TF.rings){const u=(now-g.t0)/g.dur;if(u>=1)continue;ctx.globalCompositeOperation='lighter';
    if(g.k==='flash')tGlow(g.x,g.y,g.r,g.col,1-u);
    else if(g.k==='ring'){ctx.save();ctx.translate(g.x,g.y);ctx.scale(1,g.flat?1:.5);ctx.globalAlpha=1-u;ctx.strokeStyle=g.col;ctx.lineWidth=g.w*(1-u);ctx.beginPath();ctx.arc(0,0,g.r*(.3+.7*easeT(u)),0,6.283);ctx.stroke();ctx.restore();}}
  for(const p of TF.parts){const u=(now-p.t0)/p.dur,a=1-Math.max(0,u-.5)/.5;if(a<=0)continue;
    if(p.k==='shard'){const d=p.v*easeT(u)*.35,x=p.x+Math.cos(p.a)*d,y=p.y+Math.sin(p.a)*d*.7,l=p.s*(1-u*.5);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a;ctx.strokeStyle=p.col;ctx.lineWidth=2.4*(1-u);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(p.a)*l,y+Math.sin(p.a)*l*.7);ctx.stroke();}
    else if(p.k==='dust'){ctx.globalCompositeOperation='source-over';const s=p.s*(.6+u*.9);for(let j=0;j<3;j++){const an=p.t0*7+j*2.1+u*1.5,d=s*(.25+.35*u),ss=s*(.6-.12*j);tGlow(p.x+Math.cos(an)*d,p.y-ss*.4+Math.sin(an)*d*.4,ss,'rgba(200,168,120,.55)',a*.5);}}
    else{ctx.globalCompositeOperation='lighter';tGlow(p.x,p.y,p.s,p.col,a);}}
  ctx.restore();}
R.tri3=TF;R.triCfg=T3;
R.triRowTxt=c=>{const r=triRow(),n=r[0];return 'ล็อกเป้าตัวเดียว ยิงรัว '+n+' ดอก: ดอก 1–'+(n-1)+' ดอกละ '+pct(r[1])+'% ดอกสุดท้ายสีทอง '+pct(r[2])+'%'+(r[3]?' + ระเบิดวง 90 px โดนรอบ ๆ 50%':'')+' ระยะ '+c.range+' px\nเป้าตายก่อนครบ ดอกที่เหลือไปตัวใกล้สุด';};

function release(S){const c=CFG[S.k];try{sfx('swing','bow');}catch(_){}
  if(S.k==='pierce'){shoot({kind:'spear',ang:S.ang,speed:c.speed,range:c.range,hw:c.width/2,left:c.pierce,mul:c.mul,ctx:S.ctx,impact:'impact'});}
  else if(S.k==='fan'){const cap=new Map();for(let i=0;i<c.n;i++){const a=S.ang+(i-(c.n-1)/2)*(c.spread*Math.PI/180)/(c.n-1)*1;shoot({kind:'fan',ang:a,speed:c.speed,range:c.range,hw:6,left:1,mul:c.mul,ctx:S.ctx,cap,impact:'impact',impW:heroW()*1.1});}}
  else if(S.k==='leap'){let a=S.ang;try{if(liveE(S.e)){a=Math.atan2(S.e.y-P.y,S.e.x-P.x);S.ang=a;}}catch(_){}shoot({kind:'leap',ang:a,speed:c.speed,range:c.range,hw:4,left:1,mul:c.mul,ctx:S.ctx,impact:'impact',impW:heroW()*1.2});}
  else if(S.k==='rain'){const tip=tipAt(S.d);fxAdd('up',tip.x,tip.y,{dur:.35});R.zones.push({x:S.tx,y:S.ty,t0:clk(),warn:c.warn,fall:c.fall,n:c.waves,wave:0,ctx:S.ctx,r:c.radius,drops:[]});}
  log('release',{k:S.k});}
const RAIN_RX=1.25,RAIN_RY=.55;   // ellipse: rx = radius x 1.25, ry = rx x 0.55 (about 86% of the old circle's area)
function inRain(z,e){const pad=(e.sz||16)*.5,rx=z.r*RAIN_RX+pad,ry=z.r*RAIN_RX*RAIN_RY+pad*RAIN_RY,dx=(e.x-z.x)/rx,dy=(e.y-z.y)/ry;return dx*dx+dy*dy<=1;}
function rainWave(z){const c=CFG.rain;for(const e of enemies){if(!liveE(e))continue;if(!inRain(z,e))continue;dmg(e,z.ctx,c.mul,{fx:z.x,fy:z.y});}
}
function rainDrops(z){for(let i=0;i<8;i++){const a=rnd()*6.283,r=Math.sqrt(rnd());z.drops.push({x:z.x+Math.cos(a)*r*z.r*RAIN_RX,y:z.y+Math.sin(a)*r*z.r*RAIN_RX*RAIN_RY,t0:clk()+(i-4)*.02});}
  if(z.drops.length>80)z.drops.splice(0,z.drops.length-80);}
function beamEnd(S){const c=CFG.lantern;let L=c.len;for(let s=10;s<=c.len;s+=8){if(typeof blocked==='function'&&blocked(P.x+Math.cos(S.ang)*s,P.y+Math.sin(S.ang)*s,2)){L=s;break;}}return L;}
function beamTick(S){const c=CFG.lantern,L=beamEnd(S),ca=Math.cos(S.ang),sa=Math.sin(S.ang);S.beamL=L;
  for(const e of enemies){if(!liveE(e))continue;const dx=e.x-P.x,dy=e.y-P.y,u=dx*ca+dy*sa,v=Math.abs(-dx*sa+dy*ca);if(u<0||u>L+(e.sz||16)*.5||v>c.width/2+(e.sz||16))continue;dmg(e,S.ctx,c.mul,{fx:P.x,fy:P.y});}}
{const o=update;update=function(dt){const rel0=BW.stats.released;const r=o.apply(this,arguments);
  try{tick(+dt||0);
    if(BW.stats.released>rel0&&pon('double')&&rnd()<ST6.pm(CFG.double.chance)){const ar=BW.arrows[BW.arrows.length-1];if(ar){R.stats.ghost++;
      shoot({kind:'ghost',ang:Math.atan2(ar.s,ar.c),speed:BW.cfg.speed||650,range:BW.cfg.range,hw:3,left:1,mul:CFG.double.mul,ctx:mkCtx('bskGhost'),lat:7});log('ghost');}}
  }catch(e){R.err='tick '+e.message;}
  return r;};}
{const o=basicAttack;basicAttack=function(){if(S&&bowEq())return;return o.apply(this,arguments);};}
{const o=playerDeath;playerDeath=function(){try{for(const k in BUFS)buffOff(k,'death');if(S){if(BW.st===S.st)BW.st=null;S=null;}}catch(_){}return o.apply(this,arguments);};}
if(typeof loadZone==='function'){const o=loadZone;loadZone=function(){try{S=null;R.proj.length=0;R.zones.length=0;R.slides.length=0;R.fx.length=0;R.weak.length=0;for(const k of ['arrows','stuck','parts','rings','marks'])R.triFx[k].length=0;}catch(_){}return o.apply(this,arguments);};}
/* ---------------- passives + buff numbers in the game's own damage steps ---------------- */
{const _B=B;B=function(k){const v=_B.apply(this,arguments);
  if(k==='aspd'&&pon('swift'))return v+CFG.swift.aspd;
  if(k==='critDmg'&&pon('hawk'))return v+CFG.hawk.critDmg;
  return v;};}
{const PS=window.__PASS;
 if(PS&&typeof PS.dmgBonus==='function'){const ob=PS.dmgBonus;PS.dmgBonus=function(e,o,ctx,sub){const r=ob.apply(this,arguments)||[];
   try{if(!bowEq()||!isBowCtx(ctx)||(o&&o.dot)||!e)return r;const add=[];
     if(pon('steady')){const c=CFG.steady,rg=BW.cfg.range,dd=Math.hypot(e.x-P.x,e.y-P.y);const f=Math.max(0,Math.min(1,(dd-c.from)/Math.max(1,rg-c.from)));if(f>0)add.push(c.dmg*f);}
     if(pon('finish')&&e.maxHp>0&&e.hp/e.maxHp<CFG.finish.below){add.push(CFG.finish.dmg);R.stats.finish++;if(!e._bskFin||clk()-e._bskFin>.25){e._bskFin=clk();fxAdd('finish',e.x,e.y-(e.sz||16)*.9,{w:heroW()*1.7,dur:.38});}}
     if(BUFS.stance)add.push(CFG.stance.dmg);
     return add.length?r.concat(add):r;}catch(er){R.err='bonus '+er.message;return r;}};}
 else R.err='no damage bonus hook (p239)';}
{const _ad=applyDamage;applyDamage=function(e,d,crit,o){const r=_ad.apply(this,arguments);
  try{if(crit&&e&&o&&isBowCtx(o.ctx)&&bowEq()){R.stats.crits++;if(pon('hawk'))fxAdd('hawk',e.x,e.y-(e.sz||16)*.8,{w:heroW()*1.9,dur:.45});}}catch(_){}return r;};}
{const _h=hitEnemy;hitEnemy=function(e,m,o){const r=_h.apply(this,arguments);
  try{o=o||{};const ctx=o.ctx||C182.cur;
    if(r>0&&BUFS.poison&&bowEq()&&e&&!e.dead&&ctx&&ctx.kind==='basic'&&ctx.id==='basic:bow'&&!o.dot){const cm=1.5+(B('critDmg')||0),base=BW._lastCrit?r/cm:r;
      e._bskPz={dps:base*CFG.poison.tick,left:CFG.poison.secs,next:1};}}catch(er){R.err='poison set '+er.message;}
  return r;};}
/* ---------------- drawing ---------------- */
const JADE='#3fd6a0',JADE2='#b8ffe0',GOLD='#ffc95a';
function auraParts(front,x,fy){if(G.state!=='play'||!bowEq()||P.dead)return;const now=clk(),hw=heroW(),hh=heroH();
  const fade=k=>{const b=BUFS[k];if(!b)return 0;return Math.min(1,(now-b.t0)/.25,(b.end-now)/.4+.0001);};
  let a=fade('stance');if(a>0&&!(R.aura&&R.aura('stance',front,x,fy,a))){const y0=front?.741:0,y1=front?1:.741;spr('stance',x,fy,hh*1.45/.503,{ay:.741,y0,y1,alpha:a*(.9+.1*Math.sin(now*3))});}
  a=fade('wind');if(a>0&&!(R.aura&&R.aura('wind',front,x,fy,a))){const y0=front?.733:0,y1=front?1:.733;spr('wind',x,fy,hw*1.5/.9,{ay:.733,y0,y1,alpha:a*.9,a:0});}
  a=fade('focus');if(a>0&&!(R.aura&&R.aura('focus',front,x,fy,a))){const s=1+.03*Math.sin(now*2.2),y0=front?.533:0,y1=front?1:.533;spr('focus',x,fy-hh*.45,hw*1.9/.79*s,{ay:.533,y0,y1,alpha:a*(.9+.1*Math.sin(now*2.2))});spr('focus',x,fy-hh*.45,hw*1.9/.79*s,{ay:.533,y0,y1,alpha:a*.3,add:1});}
  if(front){a=fade('poison');if(a>0&&!(R.aura&&R.aura('poison',front,x,fy,a))){const f=P.face||0,bx=x-Math.cos(f)*hw*.22,by=fy-hh*.62;spr('poison',bx,by,hw*1.0,{ay:.62,alpha:a*(.8+.2*Math.sin(now*4))});}}
  if(S&&S.k==='lantern'){const t=now-S.t0,c=CFG.lantern;if(t<c.charge+c.beam){const u=Math.min(1,t/c.charge);
    ctx.save();ctx.globalCompositeOperation='lighter';
    const rx=hw*(.8+.6*u),ry=rx*.36;ctx.lineWidth=2.2;
    for(const [col,al,w] of [[JADE,.55,3],[GOLD,.65,1.6]]){ctx.strokeStyle=col;ctx.globalAlpha=al*Math.min(1,u*1.5);ctx.lineWidth=w;ctx.beginPath();ctx.ellipse(x,fy,rx,ry,0,front?0:Math.PI,front?Math.PI:Math.PI*2);ctx.stroke();}
    for(let i=0;i<12;i++){const th=i*.5236-now*.8;if((Math.sin(th)>0)!==front)continue;const px=x+Math.cos(th)*rx*.86,py=fy+Math.sin(th)*ry*.86;ctx.globalAlpha=Math.min(1,u*1.5)*.9;ctx.strokeStyle=GOLD;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(px-3,py);ctx.lineTo(px,py-2.2);ctx.lineTo(px+3,py);ctx.lineTo(px,py+2.2);ctx.closePath();ctx.stroke();}
    for(let i=0;i<6;i++){const th=i*1.0472+now*.8;if((Math.sin(th)>0)!==front)continue;lanternMark(x+Math.cos(th)*rx,fy+Math.sin(th)*ry-4,5,Math.min(1,u*1.6));}
    for(let i=0;i<5;i++){const th=now*1.6+i*1.2566,sx=x+Math.cos(th)*rx,sy=fy+Math.sin(th)*ry-hh*(.3+.25*Math.sin(now*2+i));if((Math.sin(th)>0)!==front)continue;
      const g=ctx.createRadialGradient(sx,sy,0,sx,sy,7);g.addColorStop(0,'rgba(255,240,190,.95)');g.addColorStop(.5,'rgba(255,201,90,.6)');g.addColorStop(1,'rgba(255,201,90,0)');ctx.globalAlpha=Math.min(1,u*2);ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy,7,0,6.283);ctx.fill();}
    ctx.restore();}}}
{const o=drawPlayerSprite;drawPlayerSprite=function(x,y,bob,fa){let fy=y+FY;
  try{auraParts(false,x,fy);}catch(e){R.err='aura '+e.message;}
  const r=o.apply(this,arguments);
  try{auraParts(true,x,fy);}catch(e){R.err='aura '+e.message;}
  return r;};}
function trailOn(ar){const hx=ar.x+(ar.ox||0),hy=ar.y+(ar.oy||0)-(ar.h||0),a=Math.atan2(ar.s,ar.c);
  if(pon('swift'))spr('swift',hx,hy,heroW()*2.6,{ax:.98,ay:.52,a,alpha:.85});
  if(pon('steady'))spr('strail',hx,hy,heroW()*2.9,{ax:.99,ay:.5,a,alpha:.9});}
function drawProj(p){const now=clk(),al=p.end==null?1:Math.max(0,1-(now-p.end)/(p.kind==='spear'?.7:.15)),hx=p.x+p.vx,hy=p.y+p.vy,a=Math.atan2(p.s,p.c),hw=heroW();
  if(p.kind==='spear'){ // ground streak along the path (rows of the approved trail, one uniform scale, clipped to the path behind the spear)
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(a);ctx.beginPath();ctx.rect(-p.trav,-80,p.trav+4,160);ctx.clip();ctx.rotate(-a);ctx.translate(-p.x,-p.y);
    spr('gtrail',p.x,p.y,hw*5.2,{ax:.99,ay:.55,a,alpha:al});ctx.restore();
    if(p.end==null){spr('spear',hx,hy,hw*4.4,{ax:.97,ay:.5,a});spr('spear',hx,hy,hw*4.4,{ax:.97,ay:.5,a,alpha:.5,add:1});}return;}
  if(p.end!=null)return;
  if(p.kind==='ghost'){spr('ghost',hx,hy,hw*1.9,{ax:.97,ay:.5,a,alpha:.9});return;}
  if(p.kind==='fan'||p.kind==='leap'){
    if(pon('steady'))spr('strail',hx,hy,hw*2.9,{ax:.99,ay:.5,a,alpha:.9});
    ctx.save();ctx.translate(hx,hy);ctx.rotate(a);ctx.globalCompositeOperation='lighter';
    if(p.kind==='fan'){ctx.restore();spr('spear',hx,hy,hw*2.6,{ax:.97,ay:.5,a});spr('spear',hx,hy,hw*2.6,{ax:.97,ay:.5,a,alpha:.45,add:1});
      ctx.save();ctx.translate(hx,hy);ctx.rotate(a);ctx.globalCompositeOperation='lighter';const r0=hw*.62;
      for(const [col,w,al2] of [[JADE,9,.5],[JADE2,3.4,.95],[GOLD,1.4,.9]]){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.globalAlpha=al2;ctx.beginPath();ctx.arc(-r0*.55,0,r0,-1.2,1.2);ctx.stroke();}
      ctx.restore();return;}
    ctx.strokeStyle=JADE;ctx.globalAlpha=.55;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-34,0);ctx.lineTo(0,0);ctx.stroke();
    ctx.strokeStyle=JADE2;ctx.globalAlpha=.95;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-30,0);ctx.lineTo(0,0);ctx.stroke();
    ctx.fillStyle=GOLD;ctx.globalAlpha=1;ctx.beginPath();ctx.moveTo(4,0);ctx.lineTo(-5,3.5);ctx.lineTo(-5,-3.5);ctx.closePath();ctx.fill();ctx.restore();}}
function drawZone(z){const now=clk(),t=now-z.t0,life=z.warn+z.fall;const al=Math.min(1,t/.15)*Math.max(0,Math.min(1,(life+.4-t)/.4));
  const rx=z.r*RAIN_RX,ry=rx*RAIN_RY,el=(k,w)=>{ctx.beginPath();ctx.ellipse(z.x,z.y,rx*k,ry*k,0,0,6.283);};
  ctx.save();ctx.globalCompositeOperation='lighter';
  ctx.globalAlpha=al*.18;ctx.fillStyle=JADE;el(1);ctx.fill();
  const RRB=!/runering=off/.test(location.search)&&window.STF&&STF.runeRing;   /* r80: p287 */
  if(RRB){RRB(z.x,z.y,rx*.9,'#3fd6a0',al*.95,now*.25,0,Math.min(1,t/.3),RAIN_RY);ctx.globalCompositeOperation='lighter';}else{
  ctx.globalAlpha=al*.9;ctx.strokeStyle=JADE;ctx.lineWidth=3.2;el(1);ctx.stroke();
  ctx.globalAlpha=al*.7;ctx.strokeStyle=GOLD;ctx.lineWidth=1.5;ctx.setLineDash([10,8]);ctx.lineDashOffset=-now*40;el(.82);ctx.stroke();ctx.setLineDash([]);}
  // gold rune diamonds on the ring (as in the approved preview)
  if(!RRB)ctx.fillStyle=GOLD;if(!RRB)for(let i=0;i<8;i++){const th=i*.785+now*.25,x=z.x+Math.cos(th)*rx,y=z.y+Math.sin(th)*ry,d=5;ctx.globalAlpha=al*.95;ctx.beginPath();ctx.moveTo(x,y-d);ctx.lineTo(x+d*.6,y);ctx.lineTo(x,y+d);ctx.lineTo(x-d*.6,y);ctx.closePath();ctx.fill();}
  if(t<z.warn){const u=t/z.warn;ctx.globalAlpha=.75*(1-u);ctx.strokeStyle=JADE2;ctx.lineWidth=2.2;el(u);ctx.stroke();}
  const hw=heroW();
  for(const d of z.drops){const u=(now-d.t0)/.35;if(u<0||u>2.2)continue;ctx.globalAlpha=1;
    if(u<=1){ctx.globalCompositeOperation='source-over';const y=d.y-230*(1-u);   // the approved ghost-arrow art turned to point down
      spr('ghost',d.x,y,hw*1.5,{ax:.97,ay:.5,a:Math.PI/2,alpha:.95});ctx.globalCompositeOperation='lighter';spr('ghost',d.x,y,hw*1.5,{ax:.97,ay:.5,a:Math.PI/2,alpha:.35});}
    else{const v=(u-1)/1.2;ctx.globalCompositeOperation='source-over';
      ctx.globalAlpha=(1-v)*.55;for(let i=0;i<3;i++){ctx.fillStyle=i===1?'rgba(150,118,78,.8)':'rgba(186,152,104,.8)';ctx.beginPath();ctx.ellipse(d.x+(i-1)*7*(1+v),d.y-2-v*8,5+v*9,(5+v*9)*.6,0,0,6.283);ctx.fill();}
      ctx.globalAlpha=1;spr('impact',d.x,d.y-3,hw*.6*(1+v*.4),{alpha:(1-v)});ctx.globalCompositeOperation='lighter';}}
  ctx.restore();}
function lanternMark(x,y,sz,al){   // small glowing lantern shape (used on the charge ring and as floating spirits)
  const g=ctx.createRadialGradient(x,y,0,x,y,sz*1.6);g.addColorStop(0,'rgba(255,240,190,.9)');g.addColorStop(1,'rgba(255,201,90,0)');
  ctx.globalAlpha=al*.8;ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,sz*1.6,0,6.283);ctx.fill();
  ctx.globalAlpha=al;ctx.fillStyle='#ffe7a6';ctx.beginPath();ctx.moveTo(x-sz*.45,y-sz*.55);ctx.lineTo(x+sz*.45,y-sz*.55);ctx.lineTo(x+sz*.6,y+sz*.25);ctx.lineTo(x+sz*.35,y+sz*.6);ctx.lineTo(x-sz*.35,y+sz*.6);ctx.lineTo(x-sz*.6,y+sz*.25);ctx.closePath();ctx.fill();
  ctx.fillStyle=GOLD;ctx.fillRect(x-sz*.5,y-sz*.8,sz,sz*.25);ctx.fillRect(x-sz*.12,y-sz*1.05,sz*.24,sz*.3);}
function drawBeam(){if(!S||S.k!=='lantern'||!S.rel)return;const c=CFG.lantern,now=clk(),t=now-S.t0-c.charge,BF=R.beamFx;if(t>c.beam+(BF?BF.tail:.15))return;
  const al=BF?Math.min(1,t/.04):Math.min(1,t/.08)*Math.max(0,Math.min(1,(c.beam+.15-t)/.25)),L=S.beamL||beamEnd(S),tip=tipAt(S.d),a=S.ang,W=c.width*(BF?BF.w(t):1);if(W<.5)return;
  ctx.save();ctx.translate(tip.x,tip.y);ctx.rotate(a);if(BF)ctx.translate(0,BF.wob(now));ctx.lineCap='round';const fl=.9+.1*Math.sin(now*40);
  // soft outer glow, gold body, thin bright core (normal blending for the body so it stays gold on a bright ground)
  ctx.globalCompositeOperation='lighter';
  for(const [col,w,a2] of [[JADE,W*1.5,.22],[GOLD,W*1.1,.28]]){ctx.globalAlpha=al*a2*fl;ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(L,0);ctx.stroke();}
  ctx.globalCompositeOperation='source-over';
  const gb=ctx.createLinearGradient(0,-W*.4,0,W*.4);gb.addColorStop(0,'rgba(255,190,70,0)');gb.addColorStop(.3,'rgba(255,201,90,.9)');gb.addColorStop(.5,'rgba(255,236,170,1)');gb.addColorStop(.7,'rgba(255,201,90,.9)');gb.addColorStop(1,'rgba(255,190,70,0)');
  ctx.globalAlpha=al*.9;ctx.fillStyle=gb;ctx.fillRect(0,-W*.4,L,W*.8);
  ctx.globalCompositeOperation='lighter';ctx.globalAlpha=al*.95;ctx.strokeStyle='#fff6dc';ctx.lineWidth=W*.1;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(L,0);ctx.stroke();
  // jade spiral wound round the beam
  ctx.globalCompositeOperation='source-over';   // normal blending keeps the spiral jade on top of the gold body
  for(let k=0;k<2;k++){ctx.globalAlpha=al*.95;ctx.strokeStyle=k?'#2fbf8c':'#1fa977';ctx.lineWidth=k?3:4.5;ctx.beginPath();
    for(let u=0;u<=L;u+=6){const o=Math.sin(u/34-now*16+k*Math.PI)*W*.55;u?ctx.lineTo(u,o):ctx.moveTo(u,o);}ctx.stroke();}
  // embers drifting along the beam
  ctx.globalCompositeOperation='lighter';
  ctx.fillStyle=GOLD;for(let i=0;i<14;i++){const u=((i*.137+now*.9)%1)*L,o=Math.sin(i*2.3+now*3)*W*.7;ctx.globalAlpha=al*.9;ctx.beginPath();ctx.arc(u,o,2.2,0,6.283);ctx.fill();}
  ctx.restore();
  // gold glow dome + floating lantern spirits at the far end
  const ex=tip.x+Math.cos(a)*L,ey=tip.y+Math.sin(a)*L,R2=W*2.4*(1+.06*Math.sin(now*9));
  ctx.save();ctx.globalCompositeOperation='lighter';
  const g=ctx.createRadialGradient(ex,ey,0,ex,ey,R2);g.addColorStop(0,'rgba(255,246,220,.85)');g.addColorStop(.4,'rgba(255,201,90,.5)');g.addColorStop(1,'rgba(255,201,90,0)');
  ctx.globalAlpha=al;ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(ex,ey,R2,R2*.8,0,0,6.283);ctx.fill();
  ctx.strokeStyle=GOLD;ctx.lineWidth=2.4;ctx.globalAlpha=al*.8;ctx.beginPath();ctx.ellipse(ex,ey,R2*.8,R2*.62,0,Math.PI,Math.PI*2);ctx.stroke();
  ctx.strokeStyle=JADE2;ctx.lineWidth=2;for(let i=0;i<2;i++){const st=now*4+i*3.1;ctx.beginPath();ctx.ellipse(ex,ey,R2*.95,R2*.5,0,st,st+1.7);ctx.stroke();}
  for(let i=0;i<5;i++){const ph=(i*.21+now*.45)%1,x=ex+Math.cos(i*1.26)*R2*.7,y=ey-R2*.2-ph*R2*1.1;lanternMark(x,y,4.5,al*(1-ph));}
  const g2=ctx.createRadialGradient(tip.x,tip.y,0,tip.x,tip.y,W*.8);g2.addColorStop(0,'rgba(255,246,220,.9)');g2.addColorStop(1,'rgba(63,214,160,0)');ctx.globalAlpha=al;ctx.fillStyle=g2;ctx.beginPath();ctx.arc(tip.x,tip.y,W*.8,0,6.283);ctx.fill();
  ctx.restore();}
function drawFx(f){const now=clk(),u=(now-f.t0)/f.dur;if(u<0||u>1)return;
  if(f.k==='impact'||f.k==='hawk'||f.k==='finish'){spr(f.k,f.x,f.y,f.w*(.7+.4*u),{alpha:1-u*u});return;}
  if(f.k==='wind'){const tt=u*f.dur,h=f.hold||0,al=tt<h?1:Math.max(0,1-(tt-h)/(f.dur-h)),w=f.w*(.9+.25*u);   // big take-off wind circle: full strength first, then fades
    spr('wind',f.x,f.y,w,{ay:f.ay||.733,alpha:al});spr('wind',f.x,f.y,w,{ay:f.ay||.733,alpha:al*.3,add:1});
    ctx.save();ctx.globalCompositeOperation='lighter';const rx=w*.45,ry=rx*.36;
    for(let i=0;i<3;i++){const st=now*5+i*2.1;ctx.globalAlpha=al*.8;ctx.strokeStyle=i===1?JADE2:JADE;ctx.lineWidth=i===1?2:3.5;ctx.beginPath();ctx.ellipse(f.x,f.y,rx*(.65+i*.17),ry*(.65+i*.17),0,st,st+2.3);ctx.stroke();}
    ctx.restore();return;}
  if(f.k==='spiral'){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(1-u);ctx.strokeStyle=JADE2;ctx.lineWidth=2.4;ctx.beginPath();
    for(let i=0;i<26;i++){const a=i*.42+u*7,r=f.w*.06*i*(.6+.6*u);ctx.lineTo(f.x+Math.cos(a)*r,f.y+Math.sin(a)*r*.6);}ctx.stroke();
    ctx.fillStyle=GOLD;for(let i=0;i<6;i++){const a=i*1.047+u*2,r=f.w*(.3+.5*u);ctx.beginPath();ctx.arc(f.x+Math.cos(a)*r,f.y+Math.sin(a)*r*.6-u*6,2.2,0,6.283);ctx.fill();}
    ctx.restore();return;}
  ctx.save();ctx.globalCompositeOperation='lighter';
  if(f.k==='flash'){const r=heroW()*(.5+u*.9);ctx.globalAlpha=(1-u)*.8;ctx.strokeStyle=f.col||JADE;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(f.x,f.y+heroH()*.5,r,r*.36,0,0,6.283);ctx.stroke();}
  else if(f.k==='up'){ctx.globalAlpha=(1-u);ctx.strokeStyle=JADE2;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x,f.y-60-u*220);ctx.stroke();}
  else if(f.k==='puff'){ctx.globalAlpha=(1-u)*.8;for(let i=0;i<3;i++){ctx.fillStyle=i?'rgba(183,123,255,.55)':'rgba(120,60,200,.55)';ctx.beginPath();ctx.arc(f.x+(i-1)*6,f.y-u*14-i*3,5+u*6,0,6.283);ctx.fill();}}
  ctx.restore();}
function drawWeak(){const now=clk();for(const w of R.weak){const e=w.e;if(!liveE(e))continue;let s=e.sz||16,sz=Math.max(44,s*3.1),al=Math.max(0,Math.min(1,(now-w.t0)/.2,(w.end-now)/.4));
  const top=e.y-s*2.3-29,dz=R.weakDrop?R.weakDrop(now-w.t0):null,cy=top-8-sz*.5+(dz?dz[0]:0);if(dz)sz*=dz[1];   // name label + HP bar end at about y - 2.3 sz - 29; keep a clear gap above it
  ctx.save();ctx.globalCompositeOperation='lighter';const u=(now*1.6)%1;ctx.globalAlpha=al*(1-u)*.85;ctx.strokeStyle='#ff4a4a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,cy,sz*(.35+.3*u),0,6.283);ctx.stroke();ctx.restore();
  if(R.weakFx&&R.weakFx(e,cy,sz,al,now))continue;spr('weak',e.x,cy,sz*(1+.04*Math.sin(now*3)),{alpha:al});}}
{const o=drawParts;drawParts=function(){
  try{if(bowEq()&&(pon('swift')||pon('steady')))for(const ar of BW.arrows)if(ar.end==null)trailOn(ar);for(const p of R.proj)if(p.kind==='spear')drawProj(p);triDrawGround();}catch(e){R.err='draw1 '+e.message;}
  const r=o.apply(this,arguments);
  try{for(const z of R.zones)drawZone(z);for(const p of R.proj)if(p.kind!=='spear')drawProj(p);drawBeam();for(const f of R.fx)drawFx(f);drawWeak();triDraw();}catch(e){R.err='draw2 '+e.message;}
  return r;};}
/* ---------------- weapon skill window: the bow line ---------------- */
const tl=' (ค่าทดลอง)';
const DESC={   // short enough for 3 lines on desktop; the box scrolls if a line still runs long
  pierce:c=>'หอกลมพุ่งตรงไปที่เป้า ทะลุได้ '+c.pierce+' ตัว ตัวละ '+pct(c.mul)+'% ของยิงปกติ\nระยะ '+c.range+' px · หยุดที่กำแพง · ล็อกท่า '+c.lock+' วิ'+tl,
  rain:c=>'ลูกศรตก '+c.waves+' ระลอกในวงรีที่เป้า ระลอกละ '+pct(c.mul)+'% (รวม '+pct(c.mul*c.waves)+'%)\nเตือน '+c.warn+' วิ ตก '+c.fall+' วิ · ร่ายไกล '+c.castRange+' px'+tl,
  leap:c=>'กระโดดถอย '+c.back+' px ทิ้งวงลมผลักศัตรูรอบตัว แล้วยิง 1 ดอก '+pct(c.mul)+'%\nบอสไม่ถูกผลัก · เอลีทถูกผลัก 30%'+tl,
  fan:c=>c.triOn&&R.triRowTxt?R.triRowTxt(c)+tl:'ยิง '+c.n+' ใบมีดลมเป็นรูปพัด '+c.spread+'° ดอกละ '+pct(c.mul)+'% ระยะ '+c.range+' px\nตัวเล็กโดน 1 ดอก ตัวใหญ่ที่อยู่ใกล้โดน 2 ดอก'+tl,
  lantern:c=>'ชาร์จ '+c.charge+' วิ แล้วยิงลำแสงตะเกียง '+c.beam+' วิ ทะลุทุกตัว ยาว '+c.len+' px\n'+c.ticks+' ครั้ง ครั้งละ '+pct(c.mul)+'% (รวม '+pct(c.mul*c.ticks)+'%)'+tl,
  focus:c=>'บัฟ '+c.dur+' วิ: คริติคอล +'+c.crit+' จุด, ความแม่น (HIT) +'+c.hit+'\nร่าย '+c.cast+' วิ · ใช้ซ้อนไม่ได้'+tl,
  wind:c=>'บัฟ '+c.dur+' วิ: เดินเร็ว +'+pct(c.speed)+'%, หลบ (FLEE) +'+c.flee+' จุด\nใช้ซ้อนไม่ได้'+tl,
  poison:c=>'บัฟ '+c.dur+' วิ: ยิงปกติติดพิษ '+pct(c.tick)+'% ของนัดนั้นทุกวินาที นาน '+c.secs+' วิ\nโดนซ้ำ = นับเวลาใหม่ ไม่ซ้อน'+tl,
  weak:c=>'เล็งจุดอ่อนศัตรู 1 ตัว (ระยะ '+c.range+' px): DEF ลด '+pct(c.def)+'% นาน '+c.dur+' วิ\nอาจพลาดได้ (ใช้ HIT เทียบการหลบ)'+tl,
  stance:c=>'ยืนนิ่งตั้งท่า สูงสุด '+c.dur+' วิ: ดาเมจ +'+pct(c.dmg)+'%, ยิงเร็ว +'+pct(c.aspd)+'%\nขยับตัว = ท่าหลุด'+tl,
  steady:c=>'ระยะยิง +'+c.range+' px (340 → '+(340+c.range)+')\nดาเมจเพิ่มตามระยะ สูงสุด +'+pct(c.dmg)+'% ที่ระยะไกลสุด'+tl,
  swift:c=>'ยิงปกติเร็วขึ้น +'+pct(c.aspd)+'%\n(เพดานรวม 5 นัดต่อวินาที)'+tl,
  hawk:c=>'ดาเมจคริติคอล +'+pct(c.critDmg)+' จุด (×1.5 → ×'+(1.5+c.critDmg).toFixed(1)+')\nไม่เพิ่มโอกาสคริ'+tl,
  double:c=>'ยิงปกติมีโอกาส '+pct(c.chance)+'% ได้ลูกศรเงาฟรีอีก 1 ดอก '+pct(c.mul)+'%'+tl,
  finish:c=>'ดาเมจ +'+pct(c.dmg)+'% กับเป้าที่ HP ต่ำกว่า '+pct(c.below)+'%\nทั้งยิงปกติและสกิลธนู'+tl};
const okNow=()=>!R.err||/^(dmg|poison|bonus|draw)/.test(R.err)?true:false;
function mkSkill(k){const c=CFG[k],act=ACT.includes(k)||BUF.includes(k);
  return {k:'bsk_'+k,bk:k,name:c.name,type:act?'active':'passive',key:c.key||'',row:c.row,ok:()=>R.public&&okNow(),icon:()=>ICON(k),desc:()=>DESC[k](c),
    cost:act?()=>({mp:c.mp,cd:c.cd}):undefined,cdId:c.id,start:act?()=>cast(k):undefined};}
const SKB={};for(const k of [...ACT,...BUF,...PAS])SKB[k]=mkSkill(k);
W.lines.bow={title:'ทักษะสายธนู',cols:[{name:'โจมตี',skills:ACT.map(k=>SKB[k])},{name:'บัฟ / สนับสนุน',skills:BUF.map(k=>SKB[k])},{name:'พาสซีฟ',skills:PAS.map(k=>SKB[k])}]};
R.skills=SKB;
// the window's footer text says "ตอนถือดาบ" for every passive: read as bow while a bow is held
try{const dm=document.getElementById('wskDm');if(dm)new MutationObserver(()=>{if(bowEq()&&/ตอนถือดาบ/.test(dm.textContent))dm.textContent=dm.textContent.replace('ตอนถือดาบ','ตอนถือธนู');}).observe(dm,{childList:true,characterData:true,subtree:true});}catch(_){}
/* ---------------- keys (bow held): J U B N R attack 1-5, O Y buff 1-2; the rest from the buttons / skill slots ---------------- */
const KEYMAP={};for(const k of [...ACT,...BUF])if(CFG[k].key)KEYMAP[CFG[k].key.toLowerCase()]=k;
// p252 swallows these keys while a bow is held ("ธนูยังไม่มีสกิล"); for exactly those key events its bow check reads false, so the key reaches us
try{let onV=BW.on;Object.defineProperty(BW,'on',{configurable:true,enumerable:true,set(v){onV=v;},get(){try{const ev=window.event;if(ev&&ev.type==='keydown'&&R.public&&KEYMAP[(ev.key||'').toLowerCase()]&&bowEq())return false;}catch(_){}return onV;}});}catch(e){R.err='keys '+e.message;}
addEventListener('keydown',e=>{try{if(!R.public||!bowEq()||e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;if(W.open||G.win||G.state!=='play'||(typeof ED!=='undefined'&&ED.on))return;
  const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;
  const k=KEYMAP[(e.key||'').toLowerCase()];if(!k)return;e.stopImmediatePropagation();e.preventDefault();cast(k);}catch(er){R.err='key '+er.message;}},true);
/* ---------------- skill slots while a bow is held (own map; the sword map stays as it is) ---------------- */
const SLOT_K=['1','2','3','4','5','6','q','e','r','f'];
const BS=R.slots={map:{},assign:null};
try{BS.map=JSON.parse(localStorage.getItem('lanternfall_bowSlots_v1')||'{}')||{};}catch(e){BS.map={};}
for(const i in BS.map)if(!SKB[BS.map[i]]||SKB[BS.map[i]].type!=='active'||+i<0||+i>9||(SLOT_K[+i]==='r'&&BS.map[i]!=='lantern'))delete BS.map[i];
BS.save=()=>{try{localStorage.setItem('lanternfall_bowSlots_v1',JSON.stringify(BS.map));}catch(e){}};
BS.find=k=>{for(const i in BS.map)if(BS.map[i]===k)return +i;return -1;};
let msgEl=null;function say(t,ms){msgEl=msgEl||document.getElementById('wsAssignMsg');if(!msgEl)return;msgEl.textContent=t;msgEl.style.display='block';clearTimeout(say.t);if(ms)say.t=setTimeout(()=>{msgEl.style.display='none';},ms);}
BS.start=k=>{BS.assign=k;document.body.classList.add('wsAssign');document.body.classList.toggle('wsAsNoR',k!=='lantern');say('แตะช่องสกิลที่ต้องการวาง "'+CFG[k].name+'" · แตะนอกช่องเพื่อยกเลิก',0);};
BS.stop=()=>{BS.assign=null;document.body.classList.remove('wsAssign','wsAsNoR');if(msgEl)msgEl.style.display='none';};
BS.set=(i,k)=>{if(SLOT_K[i]==='r'&&k!=='lantern'){say('ช่อง R สงวนไว้ให้ "'+CFG.lantern.name+'" (คีย์ R) เลือกช่องอื่นสำหรับ "'+CFG[k].name+'"',3200);return false;}
  const o=BS.find(k);if(o>=0)delete BS.map[o];BS.map[i]=k;BS.save();repaint(true);return true;};
BS.clear=i=>{delete BS.map[i];BS.save();repaint(true);};
// the window's "ใส่ช่องสกิล" button: bow skills go to the bow map
try{const win=document.getElementById('wWpnSk');if(win)win.addEventListener('click',e=>{if(!bowEq()||!e.target.closest('#wskAs'))return;
  const sel=win.querySelector('.row.sel');const kk=sel&&sel.dataset.k;const s=kk&&Object.values(SKB).find(x=>x.k===kk);if(!s||s.type!=='active'||!unl(CFG[s.bk]))return;
  e.stopImmediatePropagation();e.preventDefault();try{if(G.win==='wWpnSk')closeWin();}catch(_){}BS.start(s.bk);},true);}catch(e){R.err='assign '+e.message;}
setInterval(()=>{try{const as=document.getElementById('wskAs');if(!as||!bowEq()||!W.open)return;const sel=document.querySelector('#wWpnSk .row.sel');const kk=sel&&sel.dataset.k;const s=kk&&Object.values(SKB).find(x=>x.k===kk);
  if(s&&s.type==='active'){const at=BS.find(s.bk),t=at>=0?'ช่อง '+SLOT_K[at].toUpperCase()+' · ย้าย':'ใส่ช่องสกิล';if(as.textContent!==t)as.textContent=t;}}catch(_){}},250);
const slotEl=e=>e.target&&e.target.closest&&e.target.closest('#bar .slot[data-i]:not(.pot),#tSkills .tsk[data-ti]');
const slIdx=el=>+(el.dataset.i!==undefined?el.dataset.i:el.dataset.ti);
for(const ev of ['pointerdown','click','contextmenu'])addEventListener(ev,e=>{try{
  if(BS.assign){if(ev==='contextmenu')return;e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();if(ev==='pointerdown')return;const el=slotEl(e);if(el){if(BS.set(slIdx(el),BS.assign))BS.stop();}else BS.stop();return;}
  const el=slotEl(e);if(!el||!el.dataset.bs||!bowEq())return;
  if(ev==='contextmenu'){e.preventDefault();e.stopImmediatePropagation();BS.clear(slIdx(el));return;}
  e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();
  if(ev==='pointerdown'){cast(el.dataset.bs);if(el.classList.contains('tsk')){el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),350);}}
}catch(er){R.err='slot '+er.message;}},true);
addEventListener('keydown',e=>{try{if(e.key==='Escape'&&BS.assign){BS.stop();return;}
  if(!R.public||!bowEq()||W.open||G.win||G.state!=='play'||e.repeat)return;const k=(e.key||'').toLowerCase(),i=SLOT_K.indexOf(k);if(i<0||k==='r')return;const sk=BS.map[i];if(!sk)return;
  if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))return;e.stopImmediatePropagation();e.preventDefault();cast(sk);}catch(er){R.err='slot key '+er.message;}},true);
function paint(el,k){if(el.dataset.bs===k)return;const im=ICON(k),ki=el.querySelector('kbd'),kt=ki?ki.textContent:'';
  el.innerHTML='<img alt="'+CFG[k].name+'" src="'+im+'"><div class="cd"></div><div class="cdt"></div>'+(kt?'<kbd>'+kt+'</kbd>':'');
  el.classList.add('wsk');el.dataset.bs=k;delete el.dataset.ws;if(el.classList.contains('tsk'))el.setAttribute('data-sk','bs:'+k);else el.removeAttribute('data-sk');el.removeAttribute('draggable');el.title=CFG[k].name;}
let wasBow=false,sig='';
function repaint(force){const on=R.public&&bowEq();
  if(!on){if(wasBow){wasBow=false;sig='';try{buildBar();}catch(_){}try{if(typeof buildTouchSkills==='function')buildTouchSkills();}catch(_){}for(const el of document.querySelectorAll('[data-bs]')){delete el.dataset.bs;el.classList.remove('wsk');}}return;}
  const s=JSON.stringify(BS.map);if(force||!wasBow||s!==sig){wasBow=true;sig=s;try{buildBar();}catch(_){}}
  for(const el of document.querySelectorAll('#bar .slot[data-i],#tSkills .tsk[data-ti]')){const i=slIdx(el),k=BS.map[i];if(k&&CFG[k])paint(el,k);}}
function paintAll(){try{if(R.public&&bowEq())for(const el of document.querySelectorAll('#bar .slot[data-i],#tSkills .tsk[data-ti]')){const k=BS.map[slIdx(el)];if(k&&CFG[k])paint(el,k);}}catch(_){}}
try{const _bb=buildBar;buildBar=function(){const r=_bb.apply(this,arguments);paintAll();return r;};}catch(e){R.err='bar hook '+e.message;}
try{const _bt=buildTouchSkills;buildTouchSkills=function(){const r=_bt.apply(this,arguments);paintAll();return r;};}catch(e){R.err='touch hook '+e.message;}
setInterval(()=>{try{if(BS.assign&&(G.win||G.state!=='play'))BS.stop();repaint(false);if(!(R.public&&bowEq()))return;
  for(const el of document.querySelectorAll('.slot.wsk[data-bs]')){const k=el.dataset.bs,c=CFG[k],ok=unl(c);el.classList.toggle('wsoff',!ok);const cd=(P.cds&&P.cds[c.id])||0,cdE=el.querySelector('.cd'),tE=el.querySelector('.cdt');
    if(cdE)cdE.style.setProperty('--cd',ok&&cd>0?Math.min(1,cd/c.cd):0);if(tE)tE.textContent=ok&&cd>0?(cd>=10?String(Math.ceil(cd)):cd.toFixed(1)):'';el.classList.toggle('nomp',P.mp<c.mp);el.classList.toggle('wson',!!(BUFS[k]||(S&&S.k===k)));}
}catch(e){R.err='slot tick '+e.message;}},120);
/* ---------------- skill buttons (same look and place as the sword's) ---------------- */
const css=document.createElement('style');css.id='p272';css.textContent='#bsBar{position:fixed;z-index:57;display:none;flex-wrap:wrap;justify-content:flex-end;width:284px;gap:6px;right:16px;bottom:172px;pointer-events:auto;touch-action:manipulation}'
 +'#bsBar button{position:relative;overflow:hidden;width:52px;height:52px;padding:0;border:0;background:none;border-radius:7px;cursor:pointer}'
 +'#bsBar button img{display:block;width:100%;height:100%;pointer-events:none;-webkit-user-drag:none;border-radius:7px}'
 +'#bsBar button .k{position:absolute;z-index:2;left:4px;top:3px;padding:0 4px;border-radius:5px;background:rgba(0,0,0,.66);color:#ffe9b0;font-size:9px;font-weight:600}'
 +'#bsBar button .cd{position:absolute;z-index:1;left:0;right:0;bottom:0;background:rgba(0,0,0,.62);height:0;border-radius:0 0 7px 7px}'
 +'#bsBar button .ct{position:absolute;z-index:2;inset:0;display:flex;align-items:center;justify-content:center;font-size:15px;color:#fff;text-shadow:0 1px 2px #000}'
 +'#bsBar button.nomp{opacity:.55}#bsBar button.on{box-shadow:0 0 0 2px #3fd6a0,0 0 10px rgba(63,214,160,.75)}'
 +'#wskDd{padding-bottom:2.4em;scroll-padding-bottom:2.4em}'
 +'@media (max-width:900px){#bsBar{width:262px}#bsBar button{width:44px;height:44px}}@media (hover:none){#bsBar button .k{display:none}}';
document.head.appendChild(css);
const bar=document.createElement('div');bar.id='bsBar';
bar.innerHTML=[...ACT,...BUF].map(k=>'<button type="button" data-b="'+k+'" title="'+CFG[k].name+'" aria-label="'+CFG[k].name+'"><img alt="" src="'+ICON(k)+'"><span class="k">'+(CFG[k].key||'')+'</span><span class="cd"></span><span class="ct"></span></button>').join('');
document.body.appendChild(bar);
for(const ev of ['pointerdown','pointerup','mousedown','mouseup','touchstart','touchend','click'])bar.addEventListener(ev,e=>e.stopPropagation());
bar.addEventListener('click',e=>{const b=e.target.closest('button[data-b]');if(b)cast(b.dataset.b);});
setInterval(()=>{try{const show=R.public&&G.state==='play'&&!G.win&&bowEq()&&!P.dead&&!(typeof ED!=='undefined'&&ED.on);bar.style.display=show?'flex':'none';if(!show)return;
  if(innerWidth<=900){bar.style.right='8px';bar.style.top='56px';bar.style.bottom='auto';}else{bar.style.right='16px';bar.style.bottom='172px';bar.style.top='auto';}
  for(const b of bar.children){const k=b.dataset.b,c=CFG[k],ok=unl(c);b.style.display=ok?'':'none';if(!ok)continue;const cd=(P.cds&&P.cds[c.id])||0;
    b.querySelector('.cd').style.height=cd>0?Math.min(100,cd/c.cd*100)+'%':'0';b.querySelector('.ct').textContent=cd>0?(cd>=10?Math.ceil(cd):cd.toFixed(1)):'';b.classList.toggle('nomp',P.mp<c.mp);b.classList.toggle('on',!!(BUFS[k]||(S&&S.k===k)));}
}catch(e){R.err='bar tick '+e.message;}},120);
/* ---------------- public with the sword skills (p240 public mode) ---------------- */
const pv=setInterval(()=>{if(W.public){R.public=true;clearInterval(pv);}},300);
// bow icons are square art with their own frame: show them in the window's square icon box (the passive style), never over the row edge
try{const wn=document.getElementById('wWpnSk');if(wn){const fixIc=()=>{if(!bowEq())return;for(const el of wn.querySelectorAll('.row[data-k^="bsk_"] .ic.sk'))el.classList.remove('sk');const d=wn.querySelector('#wskDIc.sk');if(d)d.classList.remove('sk');};
  new MutationObserver(fixIc).observe(wn,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});}}catch(e){R.err='icons '+e.message;}
R.cast=cast;R.state=()=>S;R.buffs=BUFS;R.tipAt=tipAt;R.pon=pon;R.spr=spr;R.fxArt=A.fx;R.heroW=heroW;R.heroH=heroH;R.liveE=liveE;   // r3: read by the motion VFX pass (p275)
}catch(e){R.err='init '+e.message;}
})();

