
/* ---- candidate_balance_v1_r56: p276 r14 staff skills: ROV aim for sword + bow (?skaim=off), element status badge + name-tag icons (?elbadge=off, ?eltag=text), Mana Stream + Magnet redesign + art fixes r56 (?mmfx=old), storm r3 solid (?ultsolid=off), ult leash hold (?ultleash=old), ROV aim (?skaim=off), bottom-bar only (?skbar=on); TEST only ---- */
/* p276 r1 — Staff (คทาเวท) weapon + 15 staff skills (attack 5 / buff 5 / passive 5) with the approved staff art and motion VFX
   (DeaRz 20 Oct 2026 03:56 "ส่งให้ทีม code ได้เลย"; handoff art/skills/staff/HANDOFF_staff_art_motion_r1.md). TEST candidate only: not merged,
   not published.
   Numbers: balance/staff_elements_r1/REPORT_20261019_staff-elements.md (NOT approved by DeaRz yet) = skill Lv 4 ("ค่ากลาง") and passive Lv 3,
   all trial values in window.STF.cfg (one place). Element multipliers ×1.3 / ×0.7 = approved (BALANCE_elements_v1, p273 ELEM.cfg).
   Mastery unlocks = the sword's (p240: rows at mastery Lv 10/20/30/40/50).
   Art: icons = the frameless 450 px set (192 px here); in-world pieces = the approved sprites, one uniform scale each, never squashed;
   the only stretched piece is the lightning segment along its length (the handoff allows it). Ground rings / vortex "spin" = turned on the
   ground plane (the drawn ellipse keeps its shape). Code-drawn: violet rune circle, basic orb, trails, crescents, motes, shards, rings.
   Pose (STAND-IN, not final): no staff animation and no staff-in-hand art exist yet. Casting plays the approved bow shot body layer
   (approved\3d\bow_shoot_r13x3_layers, body only: no bow, no arrow, no quiver; left arm pushed toward the target) with staff timings, and
   standing still shows that set's rest body frame. Walk / run / hurt / death still use the sword loco set (sheathed sword at the hip).
   The staff itself is not drawn (art pending). Turn off with ?stf=off; VFX layers off with ?stffx=off. Debug: window.STF. */
(function(){'use strict';
const A=window.__STFA,D=window.__BOW8,HD=window.__HERO3D,W=window.__WSK;
const CFG={
  dt:'phys',      // balance model: staff power uses the weapon attack like the sword / bow (REPORT §3)
  basic:{coef:3.4,period:1.25,wind:.45,follow:.35,speed:550,range:320,hw:5},
  mp:{max:.30,regen:.30},
  status:{dur:4},   // element status left on a monster by a staff skill hit (reactions)
  react:{melt:.60,shatter:.40,shatterSplash:.40,shatterR:120,lava:.30,lavaT:3,lavaR:100,magnet:.30,magnetR:220,magnetT:.35},
  fireball:{id:'stfFire',name:'ลูกไฟระเบิด',key:'J',row:0,col:0,ic:'fireball',el:'Fire',mul:3.2,r:90,burn:.11,burnT:4,range:380,speed:600,hw:10,cd:6,mp:22,cast:.55,lock:.95,
    ground:false,groundT:3,groundDps:.10,groundR:1.2},          // ground = skill Lv 5 (test switch only)
  ice:{id:'stfIce',name:'หอกน้ำแข็ง',key:'U',row:1,col:0,ic:'ice',el:'Ice',mul:2.9,len:450,hw:22,speed:950,slow:.30,slowT:3,freeze:0,freezeT:1.5,cd:8,mp:24,cast:.55,lock:.95},   // freeze = Lv 5 (test switch)
  chain:{id:'stfChain',name:'สายฟ้าลูกโซ่',key:'B',row:2,col:0,ic:'chain',el:'Lightning',mul:2.3,jumps:3,decay:.15,jumpR:180,range:380,gap:.06,cd:7,mp:20,cast:.5,lock:.9},
  spikes:{id:'stfSpikes',name:'หนามผืนดิน',key:'N',row:3,col:0,ic:'spikes',el:'Earth',mul:3.4,len:360,width:70,lift:.6,n:7,stagger:.06,stay:.6,cd:10,mp:26,cast:.55,lock:1.0},
  ult:{id:'stfUlt',name:'มหาเวทพายุรุ้ง',key:'R',row:4,col:0,ic:'ult',el:'Neutral',storm:1.5,stormN:8,beam:6.0,burst:3.0,r:200,pull:160,castRange:380,charge:1.0,beamAt:2.0,lock:3.0,cd:35,mp:45},
  focus:{id:'stfFocus',name:'สมาธิเวท',key:'O',row:0,col:1,ic:'focus',dmg:.12,cs:.20,dur:15,cd:30,mp:18,cast:.4},
  shield:{id:'stfShield',name:'โล่ธาตุ',key:'Y',row:1,col:1,ic:'shield',hp:.15,dur:10,cd:20,mp:20,cast:.4,earthX:1.25,burn:.11,burnT:4,slow:.30,slowT:3,stun:.2},
  curse:{id:'stfCurse',name:'คำสาปธาตุ',key:'',row:2,col:1,ic:'curse',dmg:.15,dur:12,range:420,cd:18,mp:12,cast:.4},
  mana:{id:'stfMana',name:'ธารมานา',key:'',row:3,col:1,ic:'mana',regen:.5,dur:8,cd:30,mp:0,cast:.4},
  avatar:{id:'stfAvatar',name:'ร่างอวตารธาตุ',key:'',row:4,col:1,ic:'avatar',dmg:.20,dur:12,cd:40,mp:20,cast:.4},
  knowledge:{row:0,col:2,name:'ความรู้แห่งธาตุ',ic:'knowledge',dmg:.06},
  alchemist:{row:1,col:2,name:'นักเล่นแร่ปฏิกิริยา',ic:'alchemist',react:.25},
  echo:{row:2,col:2,name:'ร่ายต่อเนื่อง',ic:'echo',chance:.10,mul:.6,delay:.35},
  linger:{row:3,col:2,name:'ไฟไม่ดับ',ic:'linger',dur:.30},
  proof:{row:4,col:2,name:'กายต้านธาตุ',ic:'proof',red:.10}};
const R=window.STF={ver:'p276-r1',on:true,public:false,err:null,cfg:CFG,log:[],fx:[],proj:[],zones:[],slides:[],segs:[],spikes:[],pt:[],echo:[],curse:[],
  lastEl:'Neutral',stats:{casts:{},refused:{},hits:{},dmg:{},react:{melt:0,shatter:0,lava:0,magnet:0},echo:0,basic:0,orbHit:0,neutralOnResist:0,shieldAbs:0,proof:0,glyph:0,ptPeak:0}};
try{if(/stf=off/.test(location.search))R.on=false;}catch(e){}
if(!R.on)return;
if(!A||!D||!HD||!W||!W.lines||!window.C182||!C182.api||typeof hitEnemy!=='function'||typeof WEAPONS==='undefined'){R.err='missing '+[!A&&'art',!D&&'bow8',!W&&'wsk',!window.C182&&'c182'].filter(Boolean).join(' ');return;}
const FXON=!/stffx=off/.test(location.search);
try{
const ACT=['fireball','ice','chain','spikes','ult'],BUF=['focus','shield','curse','mana','avatar'],PAS=['knowledge','alchemist','echo','linger','proof'];
const ELS=['Fire','Ice','Lightning','Earth'];
const COL={Fire:'#ff4a2a',Ice:'#6fe3ff',Lightning:'#ffd93a',Earth:'#5bd36a',Neutral:'#c9b8ff',Light:'#ffd36b'};
const COL2={Fire:'#ffb03a',Ice:'#e6fbff',Lightning:'#fff4b0',Earth:'#c8f5b0',Neutral:'#f1eaff',Light:'#fff6dc'};
const VIO='#7b5cff',VIO2='#c9b8ff',MAG='#ff4fa3';
const clk=()=>typeof time==='number'?time:performance.now()/1000;
const wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a));
const yaw=()=>{try{return CAM&&!(typeof ED!=='undefined'&&ED.on)?CAM.yaw||0:0;}catch(e){return 0;}};
const ORDER=D.dirs,K=HD.drawScale,FY=HD.footY,AX=HD.frame.ax,AY=HD.frame.ay+80;
const dirOf=sa=>((Math.round(wrapA(sa)/(Math.PI/4))%8)+8)%8;
const stfEq=()=>!!(typeof P!=='undefined'&&P&&P.weapon&&P.weapon.t==='staff');
const liveE=e=>!!(e&&!e.dead&&e.hp>0&&!e.sprGhost&&!e.dev&&!e.removed);
const isBoss=e=>!!(e&&e.m&&e.m.boss);
const lv=()=>(P&&P.jobLv)|0;
const needLv=c=>W.cfg.unlock[Math.min(c.row|0,W.cfg.unlock.length-1)];
const unl=c=>((typeof P!=='undefined'&&P&&P.lvl)|0)>=needLv(c);
const pon=k=>R.public&&stfEq()&&!P.dead&&unl(CFG[k]);
const pct=v=>Math.round(v*1000)/10;
const stunnedNow=()=>{try{return typeof stunned==='function'&&stunned();}catch(e){return false;}};
const rnd=()=>{try{return typeof rng==='function'?rng():Math.random();}catch(e){return Math.random();}};
const ease=u=>1-(1-u)*(1-u);
const cl01=v=>v<0?0:v>1?1:v;
const hsh=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
/* flicker: alpha lo..1 held for random 0.04-0.07 s steps (seed keeps two pieces out of step) */
const flick=(now,lo,seed)=>{const st=Math.floor(now/.055+seed*7.3);return lo+(1-lo)*hsh(st+seed*13.7);};
function log(ev,x){R.log.push(Object.assign({t:+clk().toFixed(2),ev},x||{}));if(R.log.length>150)R.log.shift();}
const elMult=(a,d)=>{try{return window.ELEM&&ELEM.mult?ELEM.mult(a,d):1;}catch(_){return 1;}};
const lingerK=()=>1+(pon('linger')?CFG.linger.dur:0);
const castK=()=>1/(1+(BUFS.focus?CFG.focus.cs:0));
/* ---------------- art ---------------- */
const IM={};for(const k in A.fx){const im=new Image();im.src=A.fx[k].src;IM[k]=im;}
const okI=im=>im&&im.complete&&im.naturalWidth>0;
const ICON=k=>{const c=CFG[k];return c&&A.icons[c.ic]?A.icons[c.ic].src:null;};
const heroW=()=>{try{return D.layers.body.rects[ORDER[2]][D.rest][2]*K;}catch(e){return 32;}};
const heroH=()=>{try{return D.layers.body.rects[ORDER[2]][D.rest][3]*K;}catch(e){return 60;}};
/* one sprite: (ax,ay) image point at (x,y), width w (height follows: uniform), angle a, rows y0..y1 / columns x0..x1 (0..1), sx = length factor
   (lightning segment only), flipY = mirror across its own long axis (lightning flicker only: the bolt has even thickness, a vertical flip is
   the same shape drawn the other way, as the handoff asks) */
/* fix r5: the approved sky-beam image (u7) is opaque right up to its top row, so a copy with its top 22 % faded out (alpha only) is used */
let U7S=null;function u7soft(){if(U7S)return U7S;const im=IM.u7;if(!okI(im))return null;const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;
  const g=c.getContext('2d');g.drawImage(im,0,0);g.globalCompositeOperation='destination-in';const gr=g.createLinearGradient(0,0,0,c.height);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.22,'rgba(0,0,0,1)');gr.addColorStop(1,'rgba(0,0,0,1)');
  g.fillStyle=gr;g.fillRect(0,0,c.width,c.height);U7S=c;return c;}   // one full-size fill: destination-in clears everything outside the drawn rect
function spr(k,x,y,w,o){const im=k==='u7'?u7soft():IM[k];if(!im||(k!=='u7'&&!okI(im)))return;o=o||{};const f=A.fx[k],s=w/f.w,hh=f.h*s,ax=o.ax==null?.5:o.ax,ay=o.ay==null?.5:o.ay,
  y0=o.y0||0,y1=o.y1==null?1:o.y1,x0=o.x0||0,x1=o.x1==null?1:o.x1;if(y1<=y0||x1<=x0)return;
  ctx.save();ctx.translate(x,y);if(o.a)ctx.rotate(o.a);if(o.sx)ctx.scale(o.sx,o.flipY?-1:1);else if(o.flipY)ctx.scale(1,-1);
  if(o.alpha!=null)ctx.globalAlpha*=cl01(o.alpha);if(o.add)ctx.globalCompositeOperation='lighter';
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.drawImage(im,f.w*x0,f.h*y0,f.w*(x1-x0),f.h*(y1-y0),-ax*w+w*x0,-ay*hh+hh*y0,w*(x1-x0),hh*(y1-y0));ctx.restore();}
/* a flat ground piece turned on the ground plane by th (the ellipse keeps its drawn shape; only what is painted on it moves round) */
function gspr(k,x,y,w,th,o){const f=A.fx[k];if(!f)return;const kk=f.h/f.w;o=o||{};
  ctx.save();ctx.translate(x,y);ctx.scale(1,kk);ctx.rotate(th||0);ctx.scale(1,1/kk);spr(k,0,0,w,o);ctx.restore();}
function glow(x,y,r,col,al){if(!(r>0))return;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=al;ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.fill();}
function rgba(h,a){const n=parseInt(h.slice(1),16);return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')';}
/* ---------------- positions ---------------- */
function palmAt(d){const _c=saCrystal(d);if(_c)return _c;const sp=D.spawn[ORDER[d]];return {x:P.x+(sp.tip[0]-AX)*K,y:P.y+FY+(sp.tip[1]-AY)*K};}
function feetY(){return P.y+FY+(D.anchor[1]-AY)*K;}
function aimAt(range){let e=null,ang=P.face||0,pt=null;
  if(R.aimOv){const o=R.aimOv;return {e:nearestE(o.x,o.y,70),ang:Math.atan2(o.y-P.y,o.x-P.x)||ang,pt:{x:o.x,y:o.y}};}   // r51: point chosen with the ROV-style aim drag
  try{const T_=window.TLOCK,t=T_&&T_.e;if(liveE(t)&&Math.hypot(t.x-P.x,t.y-P.y)<=range+60){e=t;ang=Math.atan2(t.y-P.y,t.x-P.x);pt={x:t.x,y:t.y};}}catch(_){}
  if(!e){try{const r=aimPoint(range);if(r&&isFinite(r.x)&&(r.x!==P.x||r.y!==P.y)){ang=Math.atan2(r.y-P.y,r.x-P.x);pt={x:r.x,y:r.y};}}catch(_){}}
  if(!pt)pt={x:P.x+Math.cos(ang)*range*.6,y:P.y+Math.sin(ang)*range*.6};
  return {e,ang,pt};}
function nearestE(x,y,range,skip){let b=null,bd=1e9;for(const e of enemies){if(!liveE(e)||(skip&&skip.has(e)))continue;const d=Math.hypot(e.x-x,e.y-y);if(d<=range&&d<bd){bd=d;b=e;}}return b;}
const eCy=e=>e.y-(e.sz||16)*.6;
/* ---------------- damage ---------------- */
function mkCtx(id,el){const def={id,mode:'native',coefTotal:CFG.basic.coef,flatTotal:0,weights:Array(16).fill(1),maxTargets:99,targeting:'around',element:el||'Neutral',range:900};
  const c=C182.api.ctxFor('skill',id,def,{dt:CFG.dt,lvScale:1,m0:1,reach:1400,cdId:id});c.stf=1;c.el=el||'Neutral';return c;}
let CURX=null;   // the reaction bonus of the hit in progress (read by the damage bonus hook)
function dmg(e,ctx,m,x){const prev=C182.cur;let pl,r=0;try{pl=wpal();}catch(_){}C182.cur=ctx;const px=CURX;CURX=x&&x.react?x.react:null;
  try{r=hitEnemy(e,m,Object.assign({dt:CFG.dt,pl,ctx,kind:'orb'},x&&x.fx!=null?{fx:x.fx,fy:x.fy}:{}))||0;}catch(er){R.err='dmg '+er.message;}finally{C182.cur=prev;CURX=px;}
  const id=ctx.id;R.stats.hits[id]=(R.stats.hits[id]||0)+1;R.stats.dmg[id]=(R.stats.dmg[id]||0)+Math.max(0,r);
  if(r>0&&ctx.el!=='Neutral'&&pon('knowledge')&&elMult(ctx.el,e.elem)>1)glyphPop(ctx.el);
  return r;}
function dot(e,amount,kind){try{applyDamage(e,Math.max(1,Math.round(amount)),false,{dot:kind||'burn'});}catch(er){R.err='dot '+er.message;}}
/* element status + reactions (skill hits only; basic orbs never react) */
const PAIR={'Ice+Fire':'melt','Fire+Ice':'melt','Ice+Lightning':'shatter','Lightning+Ice':'shatter','Fire+Earth':'lava','Earth+Fire':'lava','Lightning+Earth':'magnet','Earth+Lightning':'magnet'};
function reactOf(e,el){if(!el||el==='Neutral'||!e)return null;const s=e._stfEl;if(!s||clk()>=s.end||s.el===el)return null;return PAIR[s.el+'+'+el]||null;}
const alchK=()=>1+(pon('alchemist')?CFG.alchemist.react:0);
/* skill hit: reaction check, damage, status, after-effects */
function shit(e,ctx,m,x){x=x||{};const el=ctx.el,rx=reactOf(e,el);let bonus=0;
  if(rx==='melt')bonus=CFG.react.melt*alchK();else if(rx==='shatter')bonus=CFG.react.shatter*alchK();else if(rx==='magnet')bonus=CFG.react.magnet*alchK();
  const r=dmg(e,ctx,m,Object.assign({},x,bonus?{react:bonus}:{}));
  if(el&&el!=='Neutral'){const prev=e._stfEl;if(rx){if(prev)elbGone(e,prev,'burst');delete e._stfEl;R.stats.react[rx]++;log('react',{rx,mon:e.type});reactFx(rx,e,r,ctx);}
    else{e._stfEl={el,end:clk()+CFG.status.dur*lingerK(),t0:clk()};elbSet(e,prev);}}
  return r;}
function reactFx(rx,e,r,ctx){const c=CFG.react,x=e.x,y=eCy(e),hw=heroW();
  if(rx==='melt')fxAdd('melt',x,y,{w:hw*3.0,dur:.55});
  else if(rx==='shatter'){fxAdd('shatter',x,y,{w:hw*3.2,dur:.55});const sc=mkCtx('stfShatter','Ice');
    for(const o of enemies){if(o===e||!liveE(o))continue;if(Math.hypot(o.x-e.x,o.y-e.y)<=c.shatterR+(o.sz||16)*.5)dmg(o,sc,ctx.mulBase*c.shatterSplash*alchK(),{fx:x,fy:y});}
    for(let i=0;i<10;i++)part({k:'shard',x,y,vx:Math.cos(i*.63)*240,vy:Math.sin(i*.63)*150-60,life:.5,col:COL.Ice,size:5});}
  else if(rx==='lava'){
    R.zones.push({k:'lava',x:e.x,y:e.y,t0:clk(),dur:c.lavaT,r:c.lavaR,dps:Math.max(1,r*c.lava*alchK()),next:clk()+1,w:hw*4.2});}
  else if(rx==='magnet'){fxAdd('magnet',e.x,e.y,{w:hw*4.4,dur:MMOLD?.9:1.45,ground:1,mobs:[]});const MF=R.fx[R.fx.length-1];
    for(const o of enemies){if(o===e||!liveE(o)||isBoss(o))continue;const dx=e.x-o.x,dy=e.y-o.y,dl=Math.hypot(dx,dy);if(dl>c.magnetR||dl<(o.sz||16)+(e.sz||16))continue;
      const want=dl-((o.sz||16)+(e.sz||16))*.9;R.slides.push({e:o,c:dx/dl,s:dy/dl,v:want/c.magnetT,t:c.magnetT});if(MF&&MF.mobs)MF.mobs.push(o);}}}
/* ---------------- state ---------------- */
let S=null,castN=0;const BUFS={};let POSE=null;   // S = skill in progress; POSE = the body clip state (skills and basic orbs)
function refuse(k,why){R.stats.refused[k]=(R.stats.refused[k]||0)+1;log('refuse',{k,why});try{textAt(P.x,P.y-62,CFG[k].name+': '+why,'#d8c9ff',13);}catch(e){}return false;}
function canStart(k){const c=CFG[k];
  if(!P||P.dead||G.state!=='play'||G.edit)return refuse(k,'ใช้ไม่ได้ตอนนี้');
  if(!stfEq())return refuse(k,'ต้องถือคทา');if(c.holy&&!(window.HOLYW&&HOLYW.on))return refuse(k,'ต้องถือคทาพระ');if(!c.holy&&window.HOLYW&&HOLYW.on)return refuse(k,'ถือคทาพระอยู่ (ใช้สกิลคทาพระ)');
  if(!unl(c))return refuse(k,'ล็อกอยู่ ต้องเลเวลตัวละคร '+needLv(c));
  if(S)return refuse(k,'กำลังร่ายสกิลอื่น');
  if((P.cds[c.id]||0)>0)return refuse(k,'คูลดาวน์ '+P.cds[c.id].toFixed(1)+' วิ');
  if(P.dash||stunnedNow())return refuse(k,'กำลังทำท่าอื่น');
  if(BUFS[k])return refuse(k,'บัฟทำงานอยู่ (ไม่ซ้อน)');
  if(P.mp<c.mp)return refuse(k,'MP ไม่พอ');
  if(POSE&&POSE.kind==='basic'&&POSE.rel)return refuse(k,'กำลังยิงลูกพลัง');
  return true;}
function begin(k,ang,x){const c=CFG[k];if(POSE&&POSE.kind==='basic')POSE=null;P.atkCd=0;
  P.mp-=c.mp;P.cds[c.id]=c.cd;const ck=castK();
  const d=dirOf(ang+yaw()),kind=ACT.includes(k)?(k==='ult'?'ult':'atk'):'buff';
  const cast=(k==='ult'?c.charge:c.cast)*ck,lock=(k==='ult'?c.lock:(c.lock||c.cast+.3))*(k==='ult'?1:ck);
  S=Object.assign({k,id:++castN,t0:clk(),ang,d,zone:G.zone,rel:false,cast,lock,el:c.el||null},x||{});
  POSE={kind,t0:S.t0,ang,d,cast,lock,el:c.el||'Neutral',sk:k};
  if(k==='ult'){ULT={x:S.tx,y:S.ty,t0:S.t0,ctx:null,cid:S.id,stormN:0,beam:false,burst:false,fl:0,v48:!ULTOLD};if(ULT.v48)u48Init();}   // timing fix 1: rings open from the cast start
  R.stats.casts[k]=(R.stats.casts[k]||0)+1;log('cast',{k,dir:ORDER[d],cast:S.id});
  if(FXON)castFx(S);return true;}
function cast(k){
  try{if(R.hmap&&window.HOLYW&&HOLYW.on&&R.hmap[k])k=R.hmap[k];if(!canStart(k))return false;const c=CFG[k];if(c.holy)return R.hcast?!!R.hcast(k):false;
  if(k==='ice'&&BZ){const a=aimAt(BZC.RANGE);let dx=a.pt.x-P.x,dy=a.pt.y-P.y,dl=Math.hypot(dx,dy);if(dl>BZC.RANGE){dx*=BZC.RANGE/dl;dy*=BZC.RANGE/dl;}return begin(k,Math.atan2(dy,dx)||a.ang,{tx:P.x+dx,ty:P.y+dy});}   /* r84: p291 */
  if(k==='spikes'&&EARTH){const a=aimAt(ES.RANGE);let dx=a.pt.x-P.x,dy=a.pt.y-P.y,dl=Math.hypot(dx,dy);if(dl>ES.RANGE){dx*=ES.RANGE/dl;dy*=ES.RANGE/dl;}return begin(k,Math.atan2(dy,dx)||a.ang,{tx:P.x+dx,ty:P.y+dy});}   /* r80 (from r79): p286 */
  if(k==='fireball'&&FZ_ON){const a=fzAim(c.range);let dx=a.pt.x-P.x,dy=a.pt.y-P.y,dl=Math.hypot(dx,dy);if(dl>c.range){dx*=c.range/dl;dy*=c.range/dl;}return begin(k,Math.atan2(dy,dx)||a.ang,{tx:P.x+dx,ty:P.y+dy});}   /* p307 */
  if(k==='fireball'||k==='ice'||k==='spikes'){const a=aimAt(k==='ice'?c.len:k==='spikes'?c.len:c.range);return begin(k,a.ang,{e:a.e});}
  if(k==='chain'&&BALL){const a=aimAt(BL.DIST);return begin(k,a.ang,{ball:1});}   /* r78: p285 */
  if(k==='chain'){const a=aimAt(c.range);let e=a.e;if(!e||Math.hypot(e.x-P.x,e.y-P.y)>c.range+(e.sz||16))e=null;
    if(!e){let b=null,bs=-1e9;for(const o of enemies){if(!liveE(o))continue;const dx=o.x-P.x,dy=o.y-P.y,dl=Math.hypot(dx,dy);if(dl>c.range+(o.sz||16))continue;const sc=Math.cos(Math.atan2(dy,dx)-a.ang)*2-dl/c.range;if(sc>bs){bs=sc;b=o;}}e=b;}
    if(!e)return refuse(k,'ไม่มีเป้าในระยะ '+c.range+' px');return begin(k,Math.atan2(e.y-P.y,e.x-P.x),{e});}
  if(k==='ult'){const a=aimAt(c.castRange);let dx=a.pt.x-P.x,dy=a.pt.y-P.y,dl=Math.hypot(dx,dy);if(dl>c.castRange){dx*=c.castRange/dl;dy*=c.castRange/dl;}
    return begin(k,Math.atan2(dy,dx)||a.ang,{tx:P.x+dx,ty:P.y+dy});}
  if(k==='curse'){let e=null;if(R.aimOv){e=nearestE(R.aimOv.x,R.aimOv.y,90);if(e&&Math.hypot(e.x-P.x,e.y-P.y)>c.range+(e.sz||16))e=null;if(!e)return refuse(k,'ไม่มีเป้าตรงจุดที่เล็ง');return begin(k,Math.atan2(e.y-P.y,e.x-P.x),{e});}try{const t=window.TLOCK&&TLOCK.e;if(liveE(t)&&Math.hypot(t.x-P.x,t.y-P.y)<=c.range)e=t;}catch(_){}if(!e)e=nearestE(P.x,P.y,c.range);
    if(!e)return refuse(k,'ไม่มีเป้าในระยะ '+c.range+' px');return begin(k,Math.atan2(e.y-P.y,e.x-P.x),{e});}
  return begin(k,P.face||0,{});
  }catch(er){R.err='cast '+er.message;S=null;POSE=null;return false;}}
/* ---------------- buffs ---------------- */
function buffOn(k){const c=CFG[k],now=clk();BUFS[k]={t0:now,end:now+c.dur};
  const ent={t:c.dur,max:c.dur,pl:{main:VIO,accent:'#ffc95a'},stf:k};
  if(k==='shield'){const el=R.lastEl!=='Neutral'?R.lastEl:'Fire';BUFS[k].el=el;let amt=Math.round(P.maxHp*c.hp*(el==='Earth'?c.earthX:1));BUFS[k].amt=amt;BUFS[k].left=amt;P.shield=Math.max(P.shield||0,amt);}
  P.buffs[c.id]=ent;log('buff on',{k});}
function buffOff(k,why){const b=BUFS[k];if(!b)return;delete BUFS[k];try{delete P.buffs[CFG[k].id];}catch(_){}
  if(k==='shield'){try{P.shield=Math.max(0,(P.shield||0)-Math.max(0,b.left));}catch(_){}}
  log('buff off',{k,why});}
function curseOn(e){const c=CFG.curse,now=clk();let w=R.curse.find(x=>x.e===e);if(!w){w={e};R.curse.push(w);}w.t0=now;w.end=now+c.dur;log('curse',{mon:e.type});}
/* ---------------- projectiles ---------------- */
function launch(o){const c=Math.cos(o.ang),s=Math.sin(o.ang),d=o.d!=null?o.d:dirOf(o.ang+yaw()),pm=palmAt(d);
  const p=Object.assign({c,s,x:P.x,y:P.y,x0:P.x,y0:P.y,trav:0,hit:new Set(),end:null,t0:clk(),ox:pm.x-P.x,oy:pm.y-P.y,hist:[],sparkT:0,spin:rnd()*6},o);
  R.proj.push(p);return p;}
function stepP(p,dt){if(p.end!=null)return;let dist=p.speed*dt;const n=Math.max(1,Math.ceil(dist/6)),dd=dist/n;
  for(let i=0;i<n;i++){
    if(p.trav+dd>p.range){p.end=clk();p.why='range';if(p.k==='fireball')explode(p,null);return;}
    const nx=p.x+p.c*dd,ny=p.y+p.s*dd;
    if(typeof blocked==='function'&&blocked(nx,ny,2)){p.end=clk();p.why='wall';if(p.k==='fireball')explode(p,null);return;}
    p.x=nx;p.y=ny;p.trav+=dd;
    for(const e of enemies){if(!liveE(e)||p.hit.has(e))continue;if(Math.hypot(e.x-p.x,e.y-p.y)>(e.sz||16)+p.hw)continue;
      p.hit.add(e);
      if(p.k==='basic'){orbHit(p,e);p.end=clk();p.why='hit';return;}
      if(p.k==='fireball'){p.end=clk();p.why='hit';explode(p,e);return;}
      if(p.k==='ice'){iceHit(p,e);}}}}
function orbHit(p,e){let el=p.el;if(el!=='Neutral'&&elMult(el,e.elem)<1){el='Neutral';R.stats.neutralOnResist++;}
  const ctx=mkCtx('basic:staff',el);ctx.kind='basic';const r=dmg(e,ctx,1,{fx:p.x,fy:p.y});R.stats.orbHit++;
  if(FXON)impactFx(e.x,eCy(e),p.el,p.c,p.s,.7);}
function explode(p,e0){const c=CFG.fireball,x=e0?e0.x:p.x,y=e0?e0.y:p.y,rr=c.r*(c.ground?c.groundR:1),m=p.mul;
  for(const e of enemies){if(!liveE(e))continue;if(Math.hypot(e.x-x,e.y-y)>rr+(e.sz||16)*.5)continue;
    const r=shit(e,p.ctx,m,{fx:x,fy:y});if(r>0&&e.hp>0)e._stfBurn={dps:r/Math.max(.01,m)*c.burn,left:Math.round(c.burnT*lingerK()),next:1,t0:clk()};}
  R.fx.push({k:'fexp',x,y:y-6,t0:clk(),dur:.75,w:heroW()*3.6*(rr/c.r),echo:p.echo});
  if(c.ground)R.zones.push({k:'fground',x,y,t0:clk(),dur:c.groundT,r:rr,ctx:mkCtx('stfFireGround','Fire'),w:heroW()*4.4*(rr/c.r),next:clk()+1,mul:c.groundDps*(p.echo?CFG.echo.mul:1)});
  if(FXON){fxAdd('ring',x,y,{w:rr*2,dur:.45,col:VIO});for(let i=0;i<12;i++){const a=i*.52+rnd()*.3;part({k:'ember',x,y:y-10,vx:Math.cos(a)*170,vy:Math.sin(a)*90-90,life:.6,col:i%3?COL2.Fire:MAG,size:3});}}
  try{shake(3);}catch(_){}}
function iceHit(p,e){const c=CFG.ice;const r=shit(e,p.ctx,p.mul,{fx:p.x,fy:p.y});
  if(r>0&&!isBoss(e)){e.jdSlow=Math.max(e.jdSlow||0,c.slowT*lingerK());
    if(c.freeze>0&&rnd()<ST6.pm(c.freeze)){e.st=e.st||{};e.st.stun=Math.max(e.st.stun||0,c.freezeT*lingerK());R.fx.push({k:'frozen',e,x:e.x,y:e.y,t0:clk(),dur:c.freezeT*lingerK()+.45,w:Math.max(heroW()*2.2,(e.sz||16)*3.4)});}}
  if(FXON)impactFx(e.x,eCy(e),'Ice',p.c,p.s,1);}
/* ---------------- release per skill ---------------- */
function release(S,echo){const c=CFG[S.k],k=S.k,mul=c.mul*(echo?CFG.echo.mul:1);try{sfx('swing','staff');}catch(_){}
  const ctx=mkCtx(c.id+(echo?'Echo':''),c.el);ctx.mulBase=mul;
  if(c.el&&c.el!=='Neutral')R.lastEl=c.el;
  if(k==='fireball'&&FZ_ON){fzStart(S,ctx,echo);}
  else if(k==='fireball'){let a=S.ang;try{if(!echo&&liveE(S.e)){a=Math.atan2(S.e.y-P.y,S.e.x-P.x);S.ang=a;}}catch(_){}launch({k,ang:a,d:S.d,speed:c.speed,range:c.range,hw:c.hw,mul,ctx,el:'Fire',echo});}
  else if(k==='ice'&&BZ){bzStart(S,ctx,echo);}
  else if(k==='ice'){launch({k,ang:S.ang,d:S.d,speed:c.speed,range:c.len,hw:c.hw,mul,ctx,el:'Ice',echo});}
  else if(k==='chain'){if(BALL)ballStart(S,ctx,echo);else chainStart(S,ctx,mul,echo);}
  else if(k==='spikes'&&EARTH){esStart(S,ctx,echo);}
  else if(k==='spikes'){const n=c.n,ca=Math.cos(S.ang),sa=Math.sin(S.ang),hit=new Set(),t0=clk();
    fxAdd('crack',P.x,P.y,{ang:S.ang,len:c.len,dur:1.3,seed:rnd()*9,echo});
    for(let i=0;i<n;i++){const u=(i+.5)/n,d=40+u*(c.len-40);R.spikes.push({x:P.x+ca*d,y:P.y+sa*d,t0:t0+i*c.stagger,i,n,ang:S.ang,ctx,mul,hit,d,echo,done:false,seed:rnd()});}}
  else if(k==='ult'){ultStart(S,ctx);}
  if(FXON)releaseFx(S,echo);
  if(!echo&&k!=='ult'&&pon('echo')&&rnd()<ST6.pm(CFG.echo.chance)){R.echo.push({t:clk()+CFG.echo.delay,S:Object.assign({},S,{e:S.e})});R.stats.echo++;log('echo',{k});}
  log('release',{k,echo:!!echo});}
/* p285 r1 — staff "สายฟ้าลูกโซ่" → Ball Lightning (TEST only; order orders/code/ORDER_20261023_staff-ball-lightning.md,
   DeaRz passed demo v3 23 Oct 13:02 "okผ่าน"; look + timing = approved/vfx/STAFF_BALL_LIGHTNING_demo_r1_source.html).
   The ball leaves the staff at the cast point, grows in 0.1 s, then drifts straight 450 px at 90 px/s, 46 px above the ground. Every 0.2 s
   each monster inside the 135 px ground ellipse (ry = 0.55 rx, as the arrow-rain area) takes a Lightning hit (element + reactions as before).
   Numbers = balance proposal balance/staff_ball_r1/REPORT_20261023_staff_ball_lightning.md (TEST; DeaRz reviews later): Lv4 15% per tick,
   Lv5+ radius 155 px, Lv10 0.5 s shock on each monster's first tick (no boss). Staff skill levels are not in the TEST level system yet → Lv4.
   Rim = the V7 rune band (DeaRz 13:10, all staff circles). Numbers on screen: one sum per monster every 0.5 s (as the storm ult). End pop does no damage. Hero pose = the staff cast clip already in
   game (stand-in; staff_cast_shot_r1 is approved but not installed until DeaRz orders it). ?ballbolt=off = the old chain lightning. */
const BALL=(()=>{try{return !/ballbolt=off/.test(location.search);}catch(_){return true;}})();
const BL={GROW:.1,SPD:90,DIST:450,DT:.2,H:46,START:46,KY:.55,POP:.9,
  L:[null,[.105,135],[.12,135],[.135,135],[.15,135],[.172,155],[.188,155],[.204,155],[.222,155],[.241,155],[.267,155,.5]]};
const BLY='#ffe66b',BLW='#fffbe0',BLB='#9fd8ff';
R.balls=[];R.ball={on:BALL,cfg:BL,stats:{casts:0,ticks:0,hits:0,shock:0,wall:0,peakPt:0,sums:0}};
if(BALL){CFG.chain.cast=.45;CFG.chain.ballOn=true;}
const ballLv=()=>{try{const v=window.SKLV&&SKLV.on&&SKLV.lv&&SKLV.lv.chain;return Math.max(1,Math.min(10,v|0||4));}catch(_){return 4;}};
const bHash=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
function ballCtx(echo){const def={id:'stfBall'+(echo?'Echo':''),mode:'native',coefTotal:CFG.basic.coef,flatTotal:0,weights:Array(32).fill(1),maxTargets:99,targeting:'around',element:'Lightning',range:900};
  const c=C182.api.ctxFor('skill',def.id,def,{dt:CFG.dt,lvScale:1,m0:1,reach:1400,cdId:CFG.chain.id});c.stf=1;c.el='Lightning';return c;}
function ballStart(S,ctx0,echo){const row=BL.L[ballLv()],pm=palmAt(S.d),now=clk(),ca=Math.cos(S.ang),sa=Math.sin(S.ang);
  const ctx=ballCtx(echo),mul=row[0]*(echo?CFG.echo.mul:1);ctx.mulBase=mul;
  const b={t0:now,ang:S.ang,ca,sa,x0:P.x+ca*BL.START,y0:P.y+sa*BL.START,x:P.x+ca*BL.START,y:P.y+sa*BL.START,tx:pm.x,ty:pm.y,trav:0,stop:false,
    r:row[1],shock:row[2]||0,mul,ctx,echo:!!echo,k:0,acc:new Map(),sumT:now+.5,first:new Set(),zaps:[],end0:now+BL.GROW+BL.DIST/BL.SPD,popped:false,hist:[]};
  R.balls.push(b);R.ball.stats.casts++;
  if(FXON){fxAdd('flash',pm.x,pm.y,{dur:.18,el:'Lightning',w:heroW()*2.2});fxAdd('pop',pm.x,pm.y,{dur:.28,el:'Lightning'});try{shake(2);}catch(_){}}
  log('ball',{lv:ballLv(),r:b.r,mul});}
const inBallE=(b,e)=>{const rx=b.r+(e.sz||16)*.5,ry=b.r*BL.KY+(e.sz||16)*.5*BL.KY,dx=(e.x-b.x)/rx,dy=(e.y-b.y)/ry;return dx*dx+dy*dy<=1;};
const NUMSUM=(()=>{try{return /numsum=on/.test(location.search);}catch(_){return false;}})();R.numSum=NUMSUM;
function ballHit(b,e){const em=typeof emitThemed==='function'?emitThemed:null,dh=e._directHitT;R.supp=NUMSUM;if(em)emitThemed=function(){};let r=0;
  try{r=shit(e,b.ctx,b.mul,{fx:b.x,fy:b.y});}finally{R.supp=false;if(em)emitThemed=em;e._directHitT=dh;}
  if(NUMSUM)b.acc.set(e,(b.acc.get(e)||0)+Math.max(0,r));R.ball.stats.hits++;
  if(b.shock>0&&!b.first.has(e)&&!isBoss(e)&&liveE(e)){e.st=e.st||{};e.st.stun=Math.max(e.st.stun||0,b.shock);R.ball.stats.shock++;}
  b.first.add(e);e._blShock=clk();return r;}
function ballSums(b,force){const now=clk();if(!force&&now<b.sumT)return;b.sumT=now+.5;let i=0;
  for(const [e,v] of b.acc){if(v>0&&!e.dead){const s=typeof fmt==='function'?fmt(v):String(Math.round(v));textAt(e.x,e.y-(e.sz||16)*1.6-(i%3)*10,s,BLY,18,{life:.48});
      const T=typeof texts!=='undefined'&&texts[texts.length-1];if(T&&T.txt===s)T.life=T.max=.48;R.ball.stats.sums++;i++;}}
  b.acc.clear();}
function ballTick(now,dt){if(!BALL||!R.balls.length)return;
  for(const b of R.balls){const t=now-b.t0;
    if(t>=BL.GROW&&now<b.end0&&!b.stop){const st=BL.SPD*dt,nx=b.x+b.ca*st,ny=b.y+b.sa*st;
      if(b.trav+st>BL.DIST){b.trav=BL.DIST;}else if(typeof blocked==='function'&&blocked(nx,ny,4)){b.stop=true;R.ball.stats.wall++;}else{b.x=nx;b.y=ny;b.trav+=st;}}
    b.hist.push([b.x,b.y,now]);while(b.hist.length&&now-b.hist[0][2]>.2)b.hist.shift();
    while(now<b.end0&&t>=BL.GROW+.1+b.k*BL.DT){b.k++;R.ball.stats.ticks++;
      for(const e of enemies){if(!liveE(e)||!inBallE(b,e))continue;ballHit(b,e);b.zaps.push({e,t0:now,s:b.k*17+(e.id||0)%97+b.zaps.length});
        if(FXON)part({k:'mote',x:e.x,y:eCy(e),tx:e.x,ty:eCy(e),life:.12,col:BLY,size:6});}}
    b.zaps=b.zaps.filter(z=>now<z.t0+.14);ballSums(b,false);
    // scorch sparks left on the ground + motes thrown off the ball
    if(FXON&&now<b.end0&&t>BL.GROW){if(rnd()<dt*14)part({k:'mote',x:b.x+(rnd()-.5)*28,y:b.y+(rnd()-.5)*10,tx:b.x,ty:b.y-30,life:.55,col:rnd()<.5?BLY:BLB,size:2.6});
      if(rnd()<dt*10){const a=rnd()*6.283;part({k:'shard',x:b.x+Math.cos(a)*20,y:b.y-BL.H+Math.sin(a)*20,vx:Math.cos(a)*120,vy:Math.sin(a)*120,life:.25,col:BLW,size:2.4});}}
    if(now>=b.end0&&!b.popped){b.popped=true;ballSums(b,true);
      if(FXON){fxAdd('flash',b.x,b.y-BL.H,{dur:.2,el:'Lightning',w:heroW()*3});fxAdd('ring',b.x,b.y,{w:b.r*2.2,dur:.4,col:BLY});try{shake(3);}catch(_){}
        for(let i=0;i<10;i++){const a=i/10*6.283;part({k:'shard',x:b.x,y:b.y-BL.H,vx:Math.cos(a)*220,vy:Math.sin(a)*140,life:.4,col:i%2?BLY:BLB,size:3});}}}}
  R.balls=R.balls.filter(b=>now<b.end0+BL.POP);R.ball.stats.peakPt=Math.max(R.ball.stats.peakPt,R.pt.length);}
/* ---- drawing ---- */
/* rune band (DeaRz 23 Oct 13:10 "รอบวงร่ายทุกวงขอเป็นอัขระเวท"; standing rule for every staff casting circle): two thin rings with the
   approved V7 rune glyphs (approved/vfx/runes/v7_runes_atlas_64x12.png, 12 x 64 px, cut from the storm ult art) between them, tinted to the
   skill colour, flat on the ground, x1.6 tall so they read, slowly turning; glyphs appear one by one while the circle grows (grow 0..1). */
const RUNE_IMG=new Image();let RUNE_OK=false;RUNE_IMG.onload=()=>{RUNE_OK=true;};RUNE_IMG.src='assets/13beb52e855b0113.png';
const RUNE_T={};function runeTint(col){if(RUNE_T[col])return RUNE_T[col];if(!RUNE_OK)return null;const cv=document.createElement('canvas');cv.width=64*12;cv.height=64;const g=cv.getContext('2d');
  g.drawImage(RUNE_IMG,0,0);g.globalCompositeOperation='source-in';g.fillStyle=col;g.fillRect(0,0,64*12,64);return RUNE_T[col]=cv;}
/* r80 (p287 rune rings, DeaRz 13:15 "ทุกสกิลที่มีวงเวท ก็ใช้อัขระให้เหมือนกันให้หมด"): one band for every magic circle.
   VFX stage 1 on r78: on grass the glyphs read smaller and fainter than in the demo -> wider band, stronger dark backing, bigger glyphs.
   grow 0..1 also draws the two lines in (no pop at full size), O.half 'back' / 'front' = only the far / near half (circles round the hero's feet).
   ?runering=off = the r79 band exactly. */
const RUNEON=(()=>{try{return !/runering=off/.test(location.search);}catch(_){return true;}})();
function runeRing0(x,y,r,col,a,rot,n,grow,K){if(a<=0||r<=4)return;K=K||.55;n=n||Math.max(14,Math.round(r/7.5));grow=grow==null?1:grow;const bw=Math.max(12,r*.12),gs=bw*1.15,img=runeTint(col);
  ctx.save();ctx.translate(x,y);ctx.scale(1,K);ctx.globalAlpha=a;ctx.strokeStyle=col;
  ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r+bw*.62,0,6.283);ctx.stroke();ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(0,0,r-bw*.62,0,6.283);ctx.stroke();
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a*.14;ctx.lineWidth=bw*1.3;ctx.beginPath();ctx.arc(0,0,r,0,6.283);ctx.stroke();ctx.restore();
  ctx.save();ctx.globalAlpha=a*.28;ctx.strokeStyle='#0c0a14';ctx.lineWidth=bw*1.1;ctx.beginPath();ctx.arc(0,0,r,0,6.283);ctx.stroke();ctx.restore();
  if(img)for(let i=0;i<n;i++){if(i/n>grow)break;const an=i/n*6.283+(rot||0),gi=Math.floor(bHash(i*3.7)*12);ctx.save();ctx.rotate(an);ctx.translate(r,0);ctx.rotate(Math.PI/2);ctx.scale(1,1.6);
    ctx.drawImage(img,gi*64,0,64,64,-gs/2,-gs/2,gs,gs);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a*.45;ctx.drawImage(img,gi*64,0,64,64,-gs/2,-gs/2,gs,gs);ctx.restore();}
  ctx.restore();}
function runeRing(x,y,r,col,a,rot,n,grow,K,O){if(!RUNEON)return runeRing0(x,y,r,col,a,rot,n,grow,K);if(a<=0||r<=4)return;K=K||.55;n=n||Math.max(14,Math.round(r/7.5));grow=grow==null?1:Math.max(0,Math.min(1,grow));if(grow<=0)return;
  const bw=Math.min(26,Math.max(15,r*.14)),gs=bw*(RUNEON?1.25:1.15),img=runeTint(col),g0=(rot||0),ga=grow*6.283,half=O&&O.half;
  ctx.save();ctx.globalCompositeOperation='source-over';ctx.translate(x,y);ctx.scale(1,K);
  if(half){ctx.beginPath();if(half==='back')ctx.rect(-r*2,-r*2,r*4,r*2);else ctx.rect(-r*2,0,r*4,r*2);ctx.clip();}
  const arcs=(rr)=>{ctx.beginPath();if(grow>=1)ctx.arc(0,0,rr,0,6.283);else ctx.arc(0,0,rr,g0,g0+ga);};
  ctx.globalAlpha=a;ctx.strokeStyle=col;ctx.lineCap='round';
  ctx.save();ctx.globalAlpha=a*(RUNEON?.42:.28);ctx.strokeStyle='#0c0a14';ctx.lineWidth=bw*(RUNEON?1.25:1.1);arcs(r);ctx.stroke();ctx.restore();
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a*.14;ctx.lineWidth=bw*1.3;arcs(r);ctx.stroke();ctx.restore();
  ctx.lineWidth=RUNEON?2.4:2;arcs(r+bw*.62);ctx.stroke();ctx.lineWidth=RUNEON?1.8:1.4;arcs(r-bw*.62);ctx.stroke();
  if(img)for(let i=0;i<n;i++){if(i/n>grow)break;const an=i/n*6.283+g0,gi=Math.floor(bHash(i*3.7)*12),pop=grow>=1?1:Math.min(1,(grow-i/n)*n/2);ctx.save();ctx.rotate(an);ctx.translate(r,0);ctx.rotate(Math.PI/2);ctx.scale(1,1.6);
    const gg=gs*(.6+.4*pop);ctx.globalAlpha=a*pop;ctx.drawImage(img,gi*64,0,64,64,-gg/2,-gg/2,gg,gg);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a*pop*(RUNEON?.5:.45);ctx.drawImage(img,gi*64,0,64,64,-gg/2,-gg/2,gg,gg);ctx.restore();}
  ctx.restore();R.runeN=(R.runeN||0)+1;}
R.runeRing=runeRing;

const bSeg=(t,a,b)=>Math.max(0,Math.min(1,(t-a)/(b-a))),bEase=u=>1-(1-u)*(1-u);
function bGlow(x,y,r,col,a){if(a<=0||r<=0)return;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=a;ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.fill();}
function bBolt(x0,y0,x1,y1,seed,w,a,col){if(a<=0)return;const n=7,dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1,pts=[[x0,y0]];
  for(let i=1;i<n;i++){const q=i/n,j=(bHash(seed*13+i)-.5)*Math.min(26,l*.3);pts.push([x0+dx*q-dy/l*j,y0+dy*q+dx/l*j]);}pts.push([x1,y1]);
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineJoin='round';ctx.lineCap='round';
  ctx.globalAlpha=a*.45;ctx.strokeStyle=col||BLB;ctx.lineWidth=w*3.2;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();
  ctx.globalAlpha=a;ctx.strokeStyle=BLW;ctx.lineWidth=w;ctx.stroke();
  const k=2+Math.floor(bHash(seed*7)*4),p=pts[k],fa=bHash(seed*3)*6.283;ctx.globalAlpha=a*.7;ctx.lineWidth=w*.6;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(p[0]+Math.cos(fa)*14,p[1]+Math.sin(fa)*14);ctx.lineTo(p[0]+Math.cos(fa+.5)*24,p[1]+Math.sin(fa+.5)*24);ctx.stroke();ctx.restore();}
function ballGround(){if(!BALL)return;const now=clk();
  for(const b of R.balls){const t=now-b.t0,on=bSeg(t,0,.15)*(1-bSeg(now,b.end0,b.end0+.25));if(on<=0)continue;const R0=b.r,K=BL.KY;
    ctx.save();ctx.translate(b.x,b.y);ctx.scale(1,K);ctx.globalCompositeOperation='lighter';
    const g=ctx.createRadialGradient(0,0,0,0,0,R0);g.addColorStop(0,'rgba(255,230,107,.22)');g.addColorStop(1,'rgba(159,216,255,0)');ctx.globalAlpha=on;ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,R0,0,6.283);ctx.fill();
    ctx.restore();runeRing(b.x,b.y,R0,BLY,on*.9,now*.9,0,bSeg(t,0,.3),K);   /* 13:10: rune band replaces the dashed ring */
    // ground crackle: short bolts skittering inside the ring
    for(let i=0;i<3;i++){const s=Math.floor(now*30)+i*101,a0=bHash(s)*6.283,r0=bHash(s+1)*R0*.9,a1=a0+(bHash(s+2)-.5)*1.6,r1=R0*(.5+bHash(s+3)*.45);
      bBolt(b.x+Math.cos(a0)*r0*.3,b.y+Math.sin(a0)*r0*.15,b.x+Math.cos(a1)*r1,b.y+Math.sin(a1)*r1*K,s,1.2,on*.7,BLY);}
    ctx.save();ctx.globalAlpha=on*.35;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(b.x,b.y,22,7,0,0,6.283);ctx.fill();ctx.restore();}}
function ballDraw(){if(!BALL)return;const now=clk();
  for(const e of enemies){if(!e._blShock)continue;const u=(now-e._blShock)/.4;if(u>=1||!liveE(e))continue;ctx.save();ctx.globalCompositeOperation='lighter';bGlow(e.x,eCy(e),(e.sz||16)*1.8,'rgba(255,230,107,.9)',.5*(1-u));ctx.restore();}
  for(const b of R.balls){const t=now-b.t0,grow=bEase(bSeg(t,0,BL.GROW+.1)),fa=1-bSeg(now,b.end0,b.end0+.12);if(fa<=0)continue;
    const fly=bSeg(t,0,BL.GROW),x=b.tx+(b.x-b.tx)*fly,y=b.ty+(b.y-BL.H-b.ty)*fly,pul=1+.08*Math.sin(now*26)+.05*Math.sin(now*41),r=24*grow*pul*(1+.4*bSeg(now,b.end0-.1,b.end0));
    ctx.save();ctx.globalCompositeOperation='lighter';
    // short tail of fading after-images
    if(t>BL.GROW&&now<b.end0)for(let g=1;g<=3;g++){const q=b.hist[Math.max(0,b.hist.length-1-g*2)];if(q)bGlow(q[0],q[1]-BL.H,r*1.4,'rgba(255,230,107,.9)',fa*.18/g);}
    bGlow(x,y,r*2.6,'rgba(159,216,255,.9)',fa*.28);bGlow(x,y,r*1.3,'rgba(255,230,107,.95)',fa*.55);
    for(let j=0;j<3;j++){ctx.save();ctx.translate(x,y);ctx.rotate(j*1.05+now*(1.5+j*.7));ctx.scale(1,.35);ctx.globalAlpha=fa*.75;ctx.strokeStyle=j===1?BLB:BLY;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r*1.25,now*6+j,now*6+j+4.2);ctx.stroke();ctx.restore();}
    ctx.restore();ctx.save();ctx.globalAlpha=fa*.85;const cg=ctx.createRadialGradient(x-r*.2,y-r*.2,0,x,y,r*.8);cg.addColorStop(0,BLW);cg.addColorStop(.45,BLY);cg.addColorStop(1,'rgba(123,92,255,0)');ctx.fillStyle=cg;ctx.beginPath();ctx.arc(x,y,r*.8,0,6.283);ctx.fill();
    ctx.globalAlpha=fa;ctx.fillStyle=BLW;ctx.beginPath();ctx.arc(x,y,r*.3,0,6.283);ctx.fill();ctx.restore();
    for(let i=0;i<4;i++){const s=Math.floor(now*30)*7+i*31,a=bHash(s)*6.283,l=r*(1.2+bHash(s+1)*1.4);bBolt(x+Math.cos(a)*r*.5,y+Math.sin(a)*r*.5,x+Math.cos(a)*l,y+Math.sin(a)*l,s,1.3,fa*.9,BLB);}
    for(const z of b.zaps){const a=1-bSeg(now,z.t0,z.t0+.14);if(liveE(z.e)||z.e.x>-9000)bBolt(x,y,z.e.x,eCy(z.e),z.s+Math.floor(now*60),2.6,a,BLY);}}}
R.ballTxt=c=>{const row=BL.L[ballLv()];return '⚡ ลูกบอลสายฟ้าลอยตรงไป '+BL.DIST+' px ('+(BL.DIST/BL.SPD)+' วิ) ช็อตทุกตัวในวง '+row[1]+' px ทุก '+BL.DT+' วิ ครั้งละ '+pct(row[0])+'%'+(row[2]?'\nครั้งแรกที่โดนชาค้าง '+row[2]+' วิ (บอสไม่ติด)':'')+'\nร่ายเสร็จเดินต่อได้ ลูกบอลไม่หยุดที่มอน';};

/* p286 r1 — staff "หนามผืนดิน" → a wide circle of random spikes (TEST only; order orders/code/ORDER_20261023_staff-earth-spikes-area.md,
   DeaRz 13:07 "ปรับแก้เป็นวงกว้าง หนามจะพุ่งขึ้นมาย้ำๆในวงสุ่มเกิด", demo passed 13:09; look + timing = approved/vfx/STAFF_EARTH_SPIKES_AREA_demo_r1_source.html).
   Aimed at a ground point up to 420 px. The staff slams at the cast point (0.55 s); the circle opens 0.15 s later and lasts 3 s. Every 0.5 s (6 ticks)
   each monster inside the 170 px ground ellipse (ry = 0.55 rx) gets an Earth hit with a big spike right under it and a small 14 px / 0.3 s lift;
   about 9 filler spikes a second burst up at random spots (visual only). Rim = the V7 rune band (DeaRz 13:10). Numbers = balance proposal
   balance/staff_spike_r1/REPORT_20261023_staff_earth_spikes_area.md (TEST): Lv4 57% x6; Lv5+ wider circle; Lv10 last tick knocks up 0.6 s (no boss).
   Hero pose = the staff cast clip already in game (stand-in; staff_cast_slam_r1 is approved but not installed until DeaRz orders it).
   ?eartharea=off = the old line of spikes. */
const EARTH=(()=>{try{return !/eartharea=off/.test(location.search);}catch(_){return true;}})();
const ES={RANGE:420,OPEN:.15,DT:.5,N:6,FIRST:.3,KY:.55,FILL:9,
  L:[null,[.40,170],[.45,170],[.51,170],[.57,170],[.65,212],[.71,219],[.77,225],[.84,232],[.91,238],[1.01,244,.6]]};
const EB='#8a6440',ED='#4a3420',EL='#c9a070',EG='#e0b860';
R.earth=[];R.earthSt={on:EARTH,cfg:ES,stats:{casts:0,ticks:0,hits:0,fill:0,knock:0}};
if(EARTH){CFG.spikes.cast=.55;CFG.spikes.areaOn=true;}
const esLv=()=>{try{const v=window.SKLV&&SKLV.on&&SKLV.lv&&SKLV.lv.spikes;return Math.max(1,Math.min(10,v|0||4));}catch(_){return 4;}};
const esR=()=>ES.L[esLv()][1];
function esStart(S,ctx,echo){const row=ES.L[esLv()],now=clk(),mul=row[0]*(echo?CFG.echo.mul:1);ctx.mulBase=mul;
  const z={x:S.tx,y:S.ty,t0:now,r:row[1],mul,knock:row[2]||0,ctx,echo:!!echo,k:0,spikes:[],fillAcc:0,hx:P.x,hy:feetY(),end:now+ES.OPEN+ES.N*ES.DT,lastTk:-9};
  R.earth.push(z);R.earthSt.stats.casts++;
  if(FXON){fxAdd('ring',P.x,feetY(),{w:heroW()*2.6,dur:.35,col:EG});for(let i=0;i<5;i++)part({k:'dust',x:P.x+(rnd()-.5)*40,y:feetY(),vx:(rnd()-.5)*120,vy:-30-rnd()*30,life:.6,col:'#b49470',size:5});}
  try{shake(4);}catch(_){}log('earth',{lv:esLv(),r:z.r,mul});}
const inEarth=(z,e)=>{const rx=z.r+(e.sz||16)*.5,ry=z.r*ES.KY+(e.sz||16)*.5*ES.KY,dx=(e.x-z.x)/rx,dy=(e.y-z.y)/ry;return dx*dx+dy*dy<=1;};
function esSpike(z,x,y,o){z.spikes.push(Object.assign({x,y,t0:clk(),h:46+rnd()*24,w:11+rnd()*5,lean:(rnd()-.5)*.36,seed:rnd()*100},o||{}));if(z.spikes.length>40)z.spikes.shift();
  if(FXON){const n=o&&o.hit?2:1;for(let k=0;k<n;k++)part({k:'dust',x:x+(rnd()-.5)*20,y,vx:(rnd()-.5)*100,vy:-20-rnd()*30,life:.55,col:'#b49470',size:4+rnd()*2});
    part({k:'shard',x,y:y-4,vx:(rnd()-.5)*160,vy:-80-rnd()*80,life:.45,col:EB,size:2.6});}}
function esTick(now,dt){if(!EARTH||!R.earth.length)return;
  for(const z of R.earth){const t=now-z.t0;
    if(t>ES.OPEN&&now<z.end-.1){z.fillAcc+=dt*ES.FILL;while(z.fillAcc>=1){z.fillAcc-=1;const a=rnd()*6.283,r=Math.sqrt(rnd())*z.r*.92;esSpike(z,z.x+Math.cos(a)*r,z.y+Math.sin(a)*r*ES.KY);R.earthSt.stats.fill++;}}
    while(z.k<ES.N&&t>=ES.FIRST+z.k*ES.DT){z.k++;z.lastTk=now;R.earthSt.stats.ticks++;const last=z.k===ES.N;try{shake(2.5);}catch(_){}
      for(const e of enemies){if(!liveE(e)||!inEarth(z,e))continue;const r=shit(e,z.ctx,z.mul,{fx:z.x,fy:z.y});R.earthSt.stats.hits++;
        esSpike(z,e.x+(rnd()-.5)*12,e.y+3,{h:64+rnd()*16,w:15+rnd()*3,hit:1});
        if(last&&z.knock>0&&!isBoss(e)&&r>0){e.st=e.st||{};e.st.stun=Math.max(e.st.stun||0,z.knock);e._esLift={t0:now,dur:z.knock,h:40};R.earthSt.stats.knock++;}
        else if(!isBoss(e))e._esLift={t0:now,dur:.3,h:14};}}
    z.spikes=z.spikes.filter(s=>now<s.t0+1.02);R.earthSt.stats.peakPt=Math.max(R.earthSt.stats.peakPt||0,R.pt.length);R.earthSt.stats.peakSp=Math.max(R.earthSt.stats.peakSp||0,z.spikes.length);}
  R.earth=R.earth.filter(z=>now<z.end+1.1);}
/* monsters hit by a damage spike hop up a little (drawn only; the knock-up at Lv10 also stuns) */
if(typeof drawEnemy==='function'){const o=drawEnemy;drawEnemy=function(e){const L=e&&e._esLift;if(!L)return o.apply(this,arguments);const u=(clk()-L.t0)/L.dur;
  if(u<0||u>=1){delete e._esLift;return o.apply(this,arguments);}ctx.save();ctx.translate(0,-Math.sin(u*Math.PI)*L.h);try{return o.apply(this,arguments);}finally{ctx.restore();}};}
const eSeg=(t,a,b)=>Math.max(0,Math.min(1,(t-a)/(b-a))),eEase=u=>1-(1-u)*(1-u);
function esGround(){if(!EARTH)return;const now=clk();
  // telegraph while casting: the rune band draws itself round the target point
  if(S&&S.k==='spikes'&&S.tx!=null&&!S.rel){const t=now-S.t0,tel=eSeg(t,.02,S.cast);runeRing(S.tx,S.ty,esR(),EG,.95,now*.5,0,tel,ES.KY);}
  for(const z of R.earth){const t=now-z.t0,fa=1-eSeg(now,z.end,z.end+.8),sp=eEase(eSeg(t,0,ES.OPEN+.3));if(fa<=0)continue;const Rr=z.r*sp;
    if(t<.35)runeRing(z.x,z.y,z.r,EG,(1-eSeg(t,ES.OPEN,ES.OPEN+.2))*.95,now*.5,0,1,ES.KY);
    if(sp>0){ctx.save();ctx.translate(z.x,z.y);ctx.scale(1,ES.KY);const g=ctx.createRadialGradient(0,0,0,0,0,Rr);g.addColorStop(0,'rgba(90,60,30,.42)');g.addColorStop(1,'rgba(90,60,30,.12)');ctx.globalAlpha=fa;ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,Rr,0,6.283);ctx.fill();
      ctx.globalAlpha=fa*.5;ctx.strokeStyle=ED;ctx.lineWidth=9;ctx.beginPath();ctx.arc(0,0,Rr,0,6.283);ctx.stroke();ctx.restore();
      runeRing(z.x,z.y,Rr,EG,fa*(.75+.15*Math.sin(now*8)),now*.4,0,1,ES.KY);
      // radial cracks from the centre, they glow amber on each tick
      const hot=1-eSeg(now,z.lastTk,z.lastTk+.3);ctx.save();ctx.lineCap='round';
      for(let k=0;k<9;k++){const a0=k/9*6.283+bHash(k)*.4;ctx.beginPath();let x=z.x,y=z.y;ctx.moveTo(x,y);for(let j=1;j<=5;j++){const r=Rr*j/5*.95,a=a0+(bHash(k*9+j)-.5)*.35;x=z.x+Math.cos(a)*r;y=z.y+Math.sin(a)*r*ES.KY;ctx.lineTo(x,y);}
        ctx.globalAlpha=fa*.8;ctx.strokeStyle='#2a1a0c';ctx.lineWidth=2.6;ctx.stroke();if(hot>0&&z.k>0){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=fa*hot*.7;ctx.strokeStyle=EG;ctx.lineWidth=1.6;ctx.stroke();ctx.globalCompositeOperation='source-over';}}
      ctx.restore();}
    // tremor zig-zag from the staff to the circle at the slam
    const tl=eSeg(t,0,.08)*(1-eSeg(t,.3,.6));if(tl>0){const u=eSeg(t,0,.18),dx=z.x-z.hx,dy=z.y-z.hy,dl=Math.hypot(dx,dy)||1,ex=z.x-dx/dl*z.r,ey=z.y-dy/dl*z.r*ES.KY;
      ctx.save();ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();for(let j=0;j<=14;j++){const q=j/14*u,o=(j%2?6:-6)*(j?1:0),x=z.hx+(ex-z.hx)*q-dy/dl*o,y=z.hy+(ey-z.hy)*q+dx/dl*o*ES.KY;j?ctx.lineTo(x,y):ctx.moveTo(x,y);}
      ctx.globalAlpha=tl*.6;ctx.strokeStyle='#2a1a0c';ctx.lineWidth=6;ctx.stroke();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=tl*.45;ctx.strokeStyle=EG;ctx.lineWidth=9;ctx.stroke();ctx.globalAlpha=tl;ctx.lineWidth=3.2;ctx.stroke();ctx.globalAlpha=tl*.9;ctx.strokeStyle='#fff3c8';ctx.lineWidth=1.2;ctx.stroke();ctx.restore();
      if(u<1){const q=u,x=z.hx+(ex-z.hx)*q,y=z.hy+(ey-z.hy)*q;ctx.save();ctx.globalCompositeOperation='lighter';bGlow(x,y,18,'rgba(255,230,150,.95)',tl);ctx.restore();}}}}
function esSpikeDraw(s,now){const age=now-s.t0,up=eEase(eSeg(age,0,.08)),down=eSeg(age,.42,.8),h=s.h*up*(1-down*.85),a=1-eEase(eSeg(age,.5,1));if(a<=.004||h<=1)return;
  ctx.save();ctx.globalAlpha=a;ctx.translate(s.x,s.y);ctx.rotate(s.lean);const w=s.w*(1-down*.3);
  ctx.fillStyle='rgba(40,26,14,.55)';ctx.beginPath();ctx.ellipse(0,1,w*1.4,w*.45,0,0,6.283);ctx.fill();
  ctx.fillStyle=ED;ctx.beginPath();ctx.moveTo(-w,0);ctx.lineTo(-w*.25,-h*.55);ctx.lineTo(0,-h);ctx.lineTo(0,0);ctx.closePath();ctx.fill();
  ctx.fillStyle=EB;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-h);ctx.lineTo(w*.35,-h*.5);ctx.lineTo(w,0);ctx.closePath();ctx.fill();
  ctx.strokeStyle=EL;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(0,-h);ctx.lineTo(w*.35,-h*.5);ctx.lineTo(w*.8,-2);ctx.stroke();
  ctx.fillStyle=ED;ctx.beginPath();ctx.moveTo(-w*1.3,0);ctx.lineTo(-w*.9,-h*.35);ctx.lineTo(-w*.5,0);ctx.closePath();ctx.fill();
  ctx.fillStyle=EB;ctx.beginPath();ctx.moveTo(w*.5,0);ctx.lineTo(w*1.1,-h*.3);ctx.lineTo(w*1.4,0);ctx.closePath();ctx.fill();
  const gv=1-eSeg(age,.08,.45);if(gv>0){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a*gv*.8;ctx.strokeStyle=EG;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-w*.2,-2);ctx.lineTo(-w*.1,-h*.4);ctx.lineTo(0,-h*.85);ctx.stroke();}
  ctx.restore();
  if(age<.12){const f=1-age/.12;ctx.save();ctx.globalCompositeOperation='lighter';bGlow(s.x,s.y-s.h*.6,(s.hit?25:15),'rgba(224,184,96,.9)',f*.9);
    if(s.hit){ctx.translate(s.x,s.y);ctx.scale(1,ES.KY);ctx.globalAlpha=f;ctx.strokeStyle=EL;ctx.lineWidth=3*f;ctx.beginPath();ctx.arc(0,0,40*(1.2-f*.7),0,6.283);ctx.stroke();}ctx.restore();}}
function esDraw(){if(!EARTH||!R.earth.length)return;const now=clk(),all=[];for(const z of R.earth)for(const s of z.spikes)all.push(s);all.sort((a,b)=>a.y-b.y);for(const s of all)esSpikeDraw(s,now);}
R.esTxt=c=>{const row=ES.L[esLv()];return '🪨 วงหนามดิน '+row[1]+' px ที่จุดเล็ง (ไกล '+ES.RANGE+' px) อยู่ '+(ES.N*ES.DT)+' วิ\nทุก '+ES.DT+' วิ ทุกตัวในวงโดนหนามใหญ่ '+pct(row[0])+'% ('+ES.N+' ครั้ง)'+(row[2]?' · ครั้งสุดท้ายยกลอย '+row[2]+' วิ (บอสไม่ติด)':'')+'\nธาตุดิน';};

/* p307 fireball summon block */
/* p307 r1 — staff "ลูกไฟระเบิด" → Fireball SUMMON (TEST only; order orders/code/ORDER_20261026_staff-fireball-new.md, DeaRz 26 Oct 07:13 reference frames,
   07:16 "ดาเมจโดนช่วงระเบิด", 07:41 "ดาเมจเริ่มตั้งแต่ลูกบอลเล็กโดนดาเมจรัวๆจนลูกใหญ่ระเบิด", demo PASSED 07:45 "ok ผ่าน").
   Look + timing = approved/vfx/STAFF_FIREBALL_NEW_demo_r1_source.html (sphere / vortex / fbBlast), FAST timing (burst 1.8 s from the cast start; ?fireball=slow = 3.4 s).
   Procedural pieces only: art textures (orders: art thread) replace them later.
   Not a projectile: the cast picks a ground point (range 380 px, same as the old shot). From the cast start:
   0–0.3 staff raised, V7 rune band (red) draws itself round the target; 0.3 release; 0.3–0.6 blue seed falls from the sky; 0.6 it lands, red vortex opens
   on the ground; 0.8 small red orb rises out of the vortex and grows continuously 8 -> 58 px, floats fully visible; 0.9, 1.1 ... every 0.2 s until the burst:
   a hit of 10% on every monster in the circle (own number each); 1.5–1.8 swell, 1.8 BURST: one hit of 180% (the biggest) + burn 8%/s x 4 s (own number per tick,
   the old burn pipeline). Radius 120 px (= old radius x 120/90). Skill level scales damage by the old Fireball table (c.mul / 2.24); radius and burn follow c.r / c.burn.
   ?fireball=off = the old projectile Fireball. Debug window.STF.R.fz / R.fzSt. */
const FZ_ON=(()=>{try{return !/fireball=off/.test(location.search);}catch(_){return true;}})();
const FZ_T=/fireball=slow/.test(location.search)?[.5,.5,.9,1.6,2.35,3.1,3.6]:[.3,.3,.7,1.0,1.25,1.4,1.6];
const [FZ_CAST,FZ_SEED0,FZ_SEED1,FZ_RISE,FZ_BIG,FZ_SWELL,FZ_BT]=FZ_T,FZ_END=FZ_BT+1+4+.6,FZ_KY=ES.KY,FZ_TDT=FZ_T[6]>2?.2:.1;
/* balance/staff_fireball_r1/REPORT_20261026_staff_fireball.md (TEST, model only): per level [tick%, burst%, burn %/s, radius px]; 5 rapid ticks (fast timing), burn 4 x 1 s.
   Lv5+ burning ground 3 s at 0.85 x radius (tick 0.5 s, 10% /s at Lv5 ... 15.5 at Lv10, no burn refresh); Lv10 three fire pillars 0.4 s after the burst
   (ring 0.55 x radius, column r 50, one hit each = 40% of (5 ticks + burst)). Level 4 is what the test build uses when the level system is off. */
const FZL=[null,[.127,1.10,.08,120],[.145,1.25,.09,120],[.163,1.41,.10,120],[.181,1.57,.11,120],[.209,1.80,.13,144],[.227,1.96,.14,149],[.247,2.13,.15,156],[.269,2.32,.16,161],[.292,2.52,.18,167],[.323,2.79,.20,173]];
const FZG_DPS=[0,0,0,0,0,.10,.109,.118,.129,.140,.155];
const fzLv=()=>{try{const v=window.SKLV&&SKLV.on&&SKLV.lv&&SKLV.lv.fireball;return Math.max(1,Math.min(10,v|0||4));}catch(_){return 4;}};
const FZC_R='#ff4a3a',FZC_P='#ff9aa0',FZC_W='#fff4f0',FZC_O='#ff9a3a',FZC_Y='#ffd27a',FZC_B='#7fa8ff',FZC_RUNE='#ff7a68';
R.fz=[];R.fzSt={on:FZ_ON,times:FZ_T,stats:{casts:0,ticks:0,blasts:0,hits:0}};
if(FZ_ON){CFG.fireball.cast=FZ_CAST;CFG.fireball.fzOn=true;CFG.fireball.range=420;}   /* same reach as Blizzard (DeaRz 13:05) */
const fzSeg=(t,a,b)=>cl01((t-a)/(b-a)),fzEase=u=>1-Math.pow(1-cl01(u),3),fzLerp=(a,b,u)=>a+(b-a)*u;
const FZ_RW=1.3;   /* DeaRz 26 Oct 12:37: wider circle */
const fzR=()=>FZL[fzLv()][3]*FZ_RW;
const fzAim=rg=>{if(R.aimOv)return aimAt(rg);try{const r=aimPoint(rg);if(r&&isFinite(r.x)&&(r.x!==P.x||r.y!==P.y))return {e:null,ang:Math.atan2(r.y-P.y,r.x-P.x),pt:{x:r.x,y:r.y}};}catch(_){}return aimAt(rg);};
const FZG={};function fzGlow(col){return FZG[col]||(FZG[col]=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,col);r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,64,64);return c;})());}
function fzVein(seed){const c=document.createElement('canvas');c.width=256;c.height=128;const g=c.getContext('2d');g.lineCap='round';g.lineJoin='round';
  for(let i=0;i<26;i++){let x=bHash(seed+i*1.7)*256,y=bHash(seed+i*2.9)*128,a=bHash(seed+i*5.3)*6.283;const pts=[[x,y]];const n=5+Math.floor(bHash(seed+i)*6);
    for(let j=0;j<n;j++){a+=(bHash(seed+i*9+j)-.5)*1.9;x+=Math.cos(a)*(10+bHash(seed+i*3+j)*16);y+=Math.sin(a)*(8+bHash(seed+j*7+i)*12);pts.push([x,y]);}
    for(const ox of [-256,0,256]){const pass=(w,col)=>{g.lineWidth=w;g.strokeStyle=col;g.beginPath();pts.forEach((p,k)=>k?g.lineTo(p[0]+ox,p[1]):g.moveTo(p[0]+ox,p[1]));g.stroke();};pass(7,'rgba(255,40,30,.45)');pass(2.4,'rgba(255,90,70,.9)');pass(.9,'rgba(255,200,170,.9)');}}
  return c;}
/* texture pieces from the art thread (T1..T10), cut + sized in the approved demo; FZ_TX=false (?fztx=off) = code-drawn look */
const FZ_TX=!/fztx=off/.test(location.search);
const FZTD={"ripple": "assets/033c854e121f38fd.png", "swirl": "assets/4769b1354f879a05.png", "core": "assets/2569f171ad04f68c.png", "ring": "assets/6a2900402a912b22.png", "scorch": "assets/5bb5e94f298adff4.png", "lava": "assets/d8f3dafeff528440.jpg", "seedball": "assets/c0f70fcf1de78c77.png", "seedtrail": "assets/c761c3f24859cffd.png", "flame0": "assets/32f7ba5e8f17ddd3.png", "flame1": "assets/e67e21b300ad5c54.png", "flame2": "assets/1f68654228253952.png", "flame3": "assets/8b369b46e75e510c.png", "flame4": "assets/08475ca6a913d67e.png", "flame5": "assets/e46ceda0884d53c5.png", "smoke0": "assets/b23ea12a0dd1dd6d.png", "smoke1": "assets/a163ef6cc36291d3.png", "smoke2": "assets/8cf1877331258834.png", "smoke3": "assets/16c6c76ff2fe3540.png", "shard0": "assets/db74ef33fb2b5929.png", "shard1": "assets/f880c9451e4abfcb.png", "shard2": "assets/a19bc51e3e8eb5d8.png", "shard3": "assets/b17fc8a241db8956.png", "shard4": "assets/32eab6552442e80a.png", "shard5": "assets/d3a38eaacc3c45ad.png", "shard6": "assets/4a1b5ce882314a25.png", "shard7": "assets/6efa9d21be1f7323.png", "nshard": 8};
const FZI={};if(FZ_TX)for(const k in FZTD){if(typeof FZTD[k]!=='string')continue;const im=new Image();im.src=FZTD[k];FZI[k]=im;}
const fzT=k=>{if(!FZ_TX)return null;const im=FZI[k];return im&&im.complete&&im.naturalWidth?im:null;};
const fzMk=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);return c;};
const FZTC={};function fzTint(im,col,key){return FZTC[key]||(FZTC[key]=fzMk(im.naturalWidth,im.naturalHeight,(g,w,h)=>{g.drawImage(im,0,0);g.globalCompositeOperation='source-in';g.fillStyle=col;g.fillRect(0,0,w,h);}));}
let FZLM=null;function fzLavaMip(){if(FZLM)return FZLM;const im=fzT('lava');if(!im)return null;const a=fzMk(512,256,g=>{g.imageSmoothingQuality='high';g.drawImage(im,0,0,512,256);});return FZLM=fzMk(384,192,g=>{g.imageSmoothingQuality='high';g.drawImage(a,0,0,384,192);});}
let FZLD=null;const FZSPH=document.createElement('canvas'),FZSPHC=FZSPH.getContext('2d'),FZSMP=new Float32Array(3);
function fzSphereTex(r,tt){const m=fzLavaMip();if(!m)return false;if(!FZLD)FZLD=m.getContext('2d').getImageData(0,0,m.width,m.height);
  const Dd=FZLD,sd=Dd.data,tw=Dd.width,th=Dd.height,size=Math.max(10,Math.round(2*r));if(FZSPH.width!==size){FZSPH.width=size;FZSPH.height=size;}
  const id=FZSPHC.createImageData(size,size),o=id.data,sp1=tt*.5,sp2=-tt*.3+2.1,TWO=6.283185,half=size/2;
  function samp(u,y0,y1,ay){u=u-Math.floor(u);const fx=u*tw,x0=fx|0,ax=fx-x0,x1=x0+1>=tw?0:x0+1,a=(y0*tw+x0)*4,b=(y0*tw+x1)*4,c=(y1*tw+x0)*4,d=(y1*tw+x1)*4,bx=1-ax,by=1-ay;
    FZSMP[0]=(sd[a]*bx+sd[b]*ax)*by+(sd[c]*bx+sd[d]*ax)*ay;FZSMP[1]=(sd[a+1]*bx+sd[b+1]*ax)*by+(sd[c+1]*bx+sd[d+1]*ax)*ay;FZSMP[2]=(sd[a+2]*bx+sd[b+2]*ax)*by+(sd[c+2]*bx+sd[d+2]*ax)*ay;}
  for(let py=0;py<size;py++){const ny=((py+.5)/size)*2-1,v=(Math.asin(ny)/Math.PI+.5)*(th-1),y0=v|0,y1=Math.min(th-1,y0+1),ay=v-y0;
    for(let px=0;px<size;px++){const nx=((px+.5)/size)*2-1,d2=nx*nx+ny*ny;if(d2>=1)continue;const dist=Math.sqrt(d2),lon=Math.atan2(nx,Math.sqrt(1-d2))/TWO,p=(py*size+px)*4;
      samp(lon+sp1/TWO,y0,y1,ay);const r1=FZSMP[0],g1=FZSMP[1],b1=FZSMP[2];samp(lon+sp2/TWO,y0,y1,ay);
      o[p]=r1*.8+FZSMP[0]*.2;o[p+1]=(g1*.8+FZSMP[1]*.2)*.62;o[p+2]=(b1*.8+FZSMP[2]*.2)*.7;const al=(1-dist)*half;o[p+3]=(al>1?1:al)*255;}}
  FZSPHC.putImageData(id,0,0);return true;}
/* own shard list (textured shards flung by the splash and the burst) */
R.fzFr=[];const fzFrag=(x,y,vx,vy,g,s,life,floor)=>{if(R.fzFr.length<60)R.fzFr.push({x,y,vx,vy,g,s,life,age:0,floor,sh:[1,3,5,7,1,3,5,7,0,2][Math.floor(Math.random()*10)],col:Math.random()<.5?'#ff9a8a':'#ff5a4a'});};
function fzFrStep(dt){for(const p of R.fzFr){p.age+=dt;p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.floor!=null&&p.y>p.floor){p.y=p.floor;p.vy*=-.2;p.vx*=.5;}}R.fzFr=R.fzFr.filter(p=>p.age<p.life);}
function fzFrDraw(){for(const p of R.fzFr){const u=p.age/p.life,al=Math.min(1,(1-u)*2.2),SH=fzT('shard'+p.sh);ctx.save();ctx.globalAlpha=al;ctx.translate(p.x,p.y);
  if(SH){ctx.rotate(Math.atan2(p.vy,p.vx)+1.2);const ss=p.s*2.3,hh=ss*SH.naturalHeight/SH.naturalWidth;ctx.drawImage(SH,-ss/2,-hh/2,ss,hh);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=al*.55;ctx.drawImage(SH,-ss/2,-hh/2,ss,hh);}
  else{ctx.rotate(Math.atan2(p.vy,p.vx));ctx.fillStyle=p.col;ctx.fillRect(-p.s,-p.s*.25,p.s*2,p.s*.5);}ctx.restore();}}
let FZV1=null,FZV2=null,FZSMK=null;
function fzInit(){if(FZV1)return;FZV1=fzVein(3.3);FZV2=fzVein(17.9);const c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d'),r=g.createRadialGradient(48,48,0,48,48,48);r.addColorStop(0,'rgba(60,30,26,.85)');r.addColorStop(.6,'rgba(40,20,18,.4)');r.addColorStop(1,'rgba(30,14,12,0)');g.fillStyle=r;g.fillRect(0,0,96,96);FZSMK=c;}
R.fzTxt=c=>{const L=FZL[fzLv()],lv=fzLv();return '🔥 เรียกลูกไฟที่จุดเล็ง (ไกล '+c.range+' px) ลูกเล็กโตเป็นลูกใหญ่ แล้วระเบิดวง '+Math.round(fzR())+' px\nลูกเล็กโผล่แล้วโดนรัว ทุก '+FZ_TDT+' วิ ครั้งละ '+pct(L[0])+'% จนลูกใหญ่ระเบิด '+pct(L[1])+'% แล้วติดไหม้ '+pct(L[2])+'%/วิ '+c.burnT+' วิ\nระเบิดที่ '+FZ_BT+' วิหลังกดร่าย'+(lv>=5?'\nพื้นไฟลุก 3 วิหลังระเบิด '+pct(FZG_DPS[lv])+'%/วิ':'')+(lv>=10?'\nเสาไฟ 3 ต้นผุดหลังระเบิด':'')+'\nธาตุไฟ';};
const inFz=(z,e)=>{const rx=z.r+(e.sz||16)*.5,ry=z.r*FZ_KY+(e.sz||16)*.5*FZ_KY,dx=(e.x-z.x)/rx,dy=(e.y-z.y)/ry;return dx*dx+dy*dy<=1;};
function fzStart(S0,ctx0,echo){const c=CFG.fireball,now=clk(),lv=fzLv(),L=FZL[lv],em=echo?CFG.echo.mul:1,ts=FZ_T[6]>2?.64:1;
  const z={x:S0.tx,y:S0.ty,t0:now-FZ_CAST,r:L[3]*FZ_RW,mt:L[0]*em*ts,mb:L[1]*em,bn:L[2],lv,gm:(FZG_DPS[lv]||0)*em,ctx:ctx0,echo:!!echo,sx:P.x+(S0.tx<P.x?-14:14),sy:feetY()-52,k:0,seed:false,blasted:false,gk:0,pil:false,pils:null,end:now-FZ_CAST+FZ_END+(lv>=5?3:0)};ctx0.mulBase=z.mb;
  R.fz.push(z);R.fzSt.stats.casts++;
  if(FXON){fxAdd('ring',P.x,feetY(),{w:heroW()*2.2,dur:.3,col:FZC_O});for(let i=0;i<6;i++)part({k:'ember',x:P.x+(rnd()-.5)*30,y:feetY()-50,vx:(rnd()-.5)*120,vy:-120-rnd()*120,life:.45,col:i%2?FZC_R:FZC_Y,size:3});}
  try{shake(2);}catch(_){}log('fireball',{r:Math.round(z.r),tick:z.mt,blast:z.mb});}
function fzTick(now,dt){fzFrStep(dt);if(!R.fz.length)return;const c=CFG.fireball;
  for(const z of R.fz){const t=now-z.t0;
    if(!z.seed&&t>=FZ_SEED1){z.seed=true;if(FXON){fxAdd('ring',z.x,z.y,{w:120,dur:.4,col:FZC_P});}try{shake(1.5);}catch(_){}}
    if(FXON&&t>FZ_SEED1+.3&&t<FZ_BT&&rnd()<dt*(t>FZ_BIG?24:12)){const a=rnd()*6.283,rr=(.6+rnd()*.4)*100;fzFrag(z.x+Math.cos(a)*rr,z.y+Math.sin(a)*rr*FZ_KY,Math.cos(a)*40,-90-rnd()*100,520,2.5+rnd()*2,.35+rnd()*.25);}
    if(FXON&&t>FZ_BIG&&t<FZ_BT&&rnd()<dt*14){const a=rnd()*6.283,rr=90+rnd()*60,sx=z.x+Math.cos(a)*rr,sy=z.y+Math.sin(a)*rr*FZ_KY;part({k:'ember',x:sx,y:sy,vx:(z.x-sx)*1.6,vy:(z.y-72-sy)*1.6,life:.5,col:rnd()<.5?FZC_Y:FZC_O,size:3});}
    for(;;){const tk=FZ_SEED1+.05+z.k*FZ_TDT;if(tk>FZ_BT-.04||t<tk)break;z.k++;R.fzSt.stats.ticks++;
      if(FXON)fxAdd('ring',z.x,z.y,{w:z.r*1.8,dur:.3,col:FZC_P});
      for(const e of enemies){if(!liveE(e)||!inFz(z,e))continue;shit(e,z.ctx,z.mt,{fx:z.x,fy:z.y});R.fzSt.stats.hits++;e._fzFl=now;if(FXON)part({k:'ember',x:e.x,y:eCy(e),vx:(rnd()-.5)*60,vy:-50-rnd()*40,life:.25,col:FZC_O,size:3});}}
    if(!z.blasted&&t>=FZ_BT){z.blasted=true;R.fzSt.stats.blasts++;
      for(const e of enemies){if(!liveE(e)||!inFz(z,e))continue;const r=shit(e,z.ctx,z.mb,{fx:z.x,fy:z.y});R.fzSt.stats.hits++;e._fzFl=now;
        if(r>0&&e.hp>0)e._stfBurn={dps:r/Math.max(.01,z.mb)*z.bn,left:Math.round(c.burnT*lingerK()),next:1,t0:now};
        if(FXON)part({k:'ember',x:e.x,y:eCy(e),vx:(rnd()-.5)*80,vy:-80,life:.35,col:FZC_Y,size:4});}
      if(FXON){for(let i=0;i<10;i++){const a=i/10*6.283+(rnd()-.5)*.4;fzFrag(z.x,z.y-20,Math.cos(a)*(90+rnd()*140),-100-rnd()*140,600,3+rnd()*3,.5+rnd()*.4,z.y+rnd()*32-6);}
        for(let i=0;i<10;i++)part({k:'ember',x:z.x+(rnd()-.5)*120,y:z.y-rnd()*50,vx:(rnd()-.5)*60,vy:-80-rnd()*140,life:.6+rnd()*.5,col:i%2?FZC_Y:FZC_O,size:4});}
      try{shake(7);}catch(_){}}
    if(z.gm>0&&t>=FZ_BT&&t<FZ_BT+3){while(z.gk<6&&t>=FZ_BT+.5*(z.gk+1)){z.gk++;const gr=z.r*.85;for(const e of enemies){if(!liveE(e))continue;const rx=gr+(e.sz||16)*.5,ry=gr*FZ_KY+(e.sz||16)*.5*FZ_KY,dx=(e.x-z.x)/rx,dy=(e.y-z.y)/ry;if(dx*dx+dy*dy>1)continue;shit(e,z.ctx,z.gm*.5,{fx:z.x,fy:z.y});e._fzFl=now;}}}
    if(z.lv>=10&&!z.pil&&t>=FZ_BT+.4){z.pil=true;const a0=rnd()*6.283,hit=.4*(5*z.mt+z.mb);z.pils=[];for(let i=0;i<3;i++){const an=a0+i*2.094,px=z.x+Math.cos(an)*z.r*.55,py=z.y+Math.sin(an)*z.r*.55*FZ_KY;z.pils.push({x:px,y:py,t0:now});
      for(const e of enemies){if(!liveE(e))continue;const rx=50+(e.sz||16)*.5,ry=50*FZ_KY+(e.sz||16)*.5*FZ_KY,dx=(e.x-px)/rx,dy=(e.y-py)/ry;if(dx*dx+dy*dy>1)continue;shit(e,z.ctx,hit,{fx:px,fy:py});e._fzFl=now;R.fzSt.stats.hits++;}}try{shake(3);}catch(_){}}
    if(FXON&&t>FZ_BT)for(const e of enemies){if(e._stfBurn&&liveE(e)&&rnd()<dt*9)part({k:'ember',x:e.x+(rnd()-.5)*16,y:eCy(e)-rnd()*14,vx:(rnd()-.5)*16,vy:-40-rnd()*40,life:.4,col:rnd()<.5?FZC_O:FZC_R,size:4});}}
  R.fz=R.fz.filter(z=>now<z.end);}
/* ---- drawing (world space, ground ellipse = ES.KY) ---- */
function fzDisc(x,y,r,c0,c1,a){if(a<=0)return;ctx.save();ctx.translate(x,y);ctx.scale(1,FZ_KY);ctx.globalAlpha=a;const g=ctx.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,c0);g.addColorStop(1,c1);ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r,0,6.283);ctx.fill();ctx.restore();}
function fzRing(x,y,r,w,col,a){if(a<=0)return;ctx.save();ctx.translate(x,y);ctx.scale(1,FZ_KY);ctx.globalAlpha=a;ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.arc(0,0,r,0,6.283);ctx.stroke();ctx.restore();}
function fzRune(x,y,r,t){const on=fzSeg(t,.1,.25)*(1-fzSeg(t,FZ_BT+.5,FZ_BT+1.1));if(on<=0)return;
  fzDisc(x,y,r,'rgba(255,70,50,.16)','rgba(255,70,50,0)',on*(1+.5*fzSeg(t,FZ_SWELL,FZ_BT)));runeRing(x,y,r,FZC_RUNE,on*.95,t*.8,0,fzSeg(t,.1,.75),FZ_KY);}
function fzVortexTx(cx,cy,rad,a,tt,heat,RP,SW,CO){ctx.save();ctx.translate(cx,cy);ctx.scale(1,FZ_KY);
  ctx.globalAlpha=a*.7;const d=ctx.createRadialGradient(0,0,0,0,0,rad*1.1);d.addColorStop(0,'rgba(255,70,80,.8)');d.addColorStop(.6,'rgba(200,20,40,.55)');d.addColorStop(1,'rgba(90,5,25,0)');ctx.fillStyle=d;ctx.beginPath();ctx.arc(0,0,rad*1.1,0,6.283);ctx.fill();
  for(let j=0;j<2;j++){const p=((tt*.38+j*.5)%1),sc=rad*(.9+1.15*p),al=Math.sin(p*Math.PI)*a;ctx.save();ctx.rotate(tt*(j?-.35:.28)+j*1.3);const RD=fzTint(RP,'#2a0008','ripd');ctx.globalAlpha=cl01(al)*.6;ctx.drawImage(RD,-sc*1.015,-sc*1.015+3,sc*2.03,sc*2.03);ctx.globalAlpha=cl01(al);ctx.drawImage(RP,-sc,-sc,sc*2,sc*2);ctx.restore();}
  ctx.globalCompositeOperation='lighter';
  ctx.save();ctx.rotate(-tt*2.2);ctx.globalAlpha=a*.55;const ss=rad*1.8;ctx.drawImage(SW,-ss/2,-ss/2,ss,ss);ctx.restore();
  ctx.globalAlpha=a*(.55+.45*heat);const cs=rad*(1.0+.5*heat);ctx.drawImage(CO,-cs/2,-cs/2,cs,cs);ctx.restore();}
function fzVortex(cx,cy,rad,a,tt,heat,part){if(a<=0||rad<4)return;
  {const RP=fzT('ripple'),SW=fzT('swirl'),CO=fzT('core');if(RP&&SW&&CO){if(part!=='front')fzVortexTx(cx,cy,rad,a,tt,heat,RP,SW,CO);return;}}
  ctx.save();
  if(part){ctx.beginPath();ctx.rect(cx-420,part==='front'?cy:cy-420,840,part==='front'?420:420);ctx.clip();}
  ctx.translate(cx,cy);ctx.scale(1,FZ_KY);
  {ctx.globalAlpha=a*(part==='front'?.55:.85);const d=ctx.createRadialGradient(0,0,0,0,0,rad*1.15);d.addColorStop(0,'rgba(255,70,80,.8)');d.addColorStop(.6,'rgba(200,20,40,.6)');d.addColorStop(1,'rgba(90,5,25,0)');ctx.fillStyle=d;ctx.beginPath();ctx.arc(0,0,rad*1.15,0,6.283);ctx.fill();
    ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a*(.5+.5*heat);const w=ctx.createRadialGradient(0,0,0,0,0,rad*(.45+.25*heat));w.addColorStop(0,'#fff');w.addColorStop(.6,'rgba(255,190,190,.7)');w.addColorStop(1,'rgba(255,100,100,0)');ctx.fillStyle=w;ctx.beginPath();ctx.arc(0,0,rad*(.45+.25*heat),0,6.283);ctx.fill();ctx.globalCompositeOperation='source-over';}
  ctx.lineCap='round';
  for(let i=0;i<9;i++){const q=((i/9)+tt*.3)%1,rr=rad*(.1+.92*q),fade=Math.sin(q*Math.PI)*a,wd=1.3+3.4*(1-q);
    for(let j=0;j<3;j++){const s0=bHash(i*3.1+j*1.3)*6.283+tt*(i%2?.9:-.7)*(1-q*.5),len=1.1+bHash(i+j*5.7)*1.8;
      ctx.globalAlpha=fade*.7;ctx.strokeStyle='#33000a';ctx.lineWidth=wd*1.1;ctx.beginPath();ctx.arc(0,0,rr+wd*.9,s0,s0+len);ctx.stroke();
      ctx.globalAlpha=fade*.9;ctx.strokeStyle='#ffc4c4';ctx.lineWidth=wd;ctx.beginPath();ctx.arc(0,0,rr,s0,s0+len);ctx.stroke();}}
  ctx.globalCompositeOperation='lighter';
  for(let k=0;k<3;k++){ctx.globalAlpha=a*.5;ctx.strokeStyle='rgba(255,190,190,.8)';ctx.lineWidth=3;ctx.beginPath();for(let j=0;j<=14;j++){const rr=rad*(.1+.92*j/14),an=k*2.094+j/14*3.4-tt*2.4;j?ctx.lineTo(Math.cos(an)*rr,Math.sin(an)*rr):ctx.moveTo(Math.cos(an)*rr,Math.sin(an)*rr);}ctx.stroke();}
  ctx.restore();}
function fzSphere(x,y,r,tt,lava,heat,aura){if(r<2)return;
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=cl01(.55*aura);ctx.drawImage(fzGlow('#ff3a2a'),x-r*2.5,y-r*2.5,r*5,r*5);ctx.globalAlpha=cl01(.45*aura);ctx.drawImage(fzGlow(FZC_P),x-r*1.6,y-r*1.6,r*3.2,r*3.2);ctx.restore();
  ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.clip();
  const bg=ctx.createRadialGradient(x-r*.3,y-r*.35,r*.1,x,y,r);bg.addColorStop(0,'#e8303a');bg.addColorStop(.55,'#a10c18');bg.addColorStop(1,'#4a0410');ctx.fillStyle=bg;ctx.fillRect(x-r,y-r,r*2,r*2);
  if(fzT('lava')&&lava>.02&&fzSphereTex(r,tt)){ctx.globalAlpha=lava;ctx.drawImage(FZSPH,x-r,y-r,r*2,r*2);ctx.globalAlpha=1;ctx.fillStyle='rgba(70,0,12,.22)';ctx.fillRect(x-r,y-r,r*2,r*2);}
  else if(lava>.02){const N=Math.max(20,Math.round(r/1.8));
    for(const [tex,sp,al] of [[FZV2,-tt*.32+1.7,.65],[FZV1,tt*.55,.95]]){ctx.globalAlpha=lava*al;
      for(let i=0;i<N;i++){const u=(i+.5)/N*2-1,s=Math.sqrt(1-u*u),lon=Math.asin(Math.max(-.999,Math.min(.999,u)))+sp,sw=Math.min(16,2.4/Math.max(.2,s));let sx=(((lon/6.283)%1)+1)%1*256;sx=Math.min(sx,256-sw);ctx.drawImage(tex,sx,0,sw,128,x+u*r-r/N-.4,y-r,2*r/N+.9,2*r);}}ctx.globalAlpha=1;}
  const sh=ctx.createRadialGradient(x-r*.25,y-r*.3,r*.3,x,y,r*1.02);sh.addColorStop(0,'rgba(255,120,90,0)');sh.addColorStop(.7,'rgba(60,0,12,.18)');sh.addColorStop(1,'rgba(40,0,10,.6)');ctx.fillStyle=sh;ctx.fillRect(x-r,y-r,r*2,r*2);
  if(heat>0){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=heat*.4;const hg=ctx.createRadialGradient(x,y,0,x,y,r);hg.addColorStop(0,'#fff0d8');hg.addColorStop(.6,'rgba(255,150,90,.4)');hg.addColorStop(1,'rgba(255,60,30,0)');ctx.fillStyle=hg;ctx.fillRect(x-r,y-r,r*2,r*2);}
  ctx.restore();
  ctx.save();ctx.strokeStyle='rgba(255,140,120,.45)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.stroke();
  ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.9;ctx.drawImage(fzGlow('#ffffff'),x-r*.28,y-r*.28,r*.56,r*.56);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.fillStyle=FZC_W;ctx.beginPath();ctx.arc(x,y,Math.max(2.5,r*.07),0,6.283);ctx.fill();ctx.restore();
  if(lava>.3){ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<7;i++){const a=bHash(i*4.1)*6.283+Math.sin(tt*1.7+i)*.4,fl=.55+.45*Math.sin(tt*9+i*2.3),d=r*(1.02+.12*fl);ctx.globalAlpha=lava*.5*fl;const q=r*(.55+.25*fl);ctx.drawImage(fzGlow(i%2?FZC_O:FZC_R),x+Math.cos(a)*d-q/2,y+Math.sin(a)*d-q/2,q,q);}ctx.restore();}}
function fzSphState(z,t,now){if(t<FZ_RISE-.1||t>=FZ_BT)return null;
  const u=fzSeg(t,FZ_RISE,FZ_SWELL),b=u*u*(3-2*u);let r=fzLerp(8,58,b)*fzEase(fzSeg(t,FZ_RISE-.1,FZ_RISE+.1)),cy=fzLerp(z.y-34,z.y-72-4*Math.sin(t*2.4),b);
  const sw=fzEase(fzSeg(t,FZ_SWELL,FZ_BT));r*=1+.18*sw;cy-=10*sw;let x=z.x;if(sw>0){x+=(Math.random()-.5)*2.4*sw;cy+=(Math.random()-.5)*2.4*sw;}
  return {x,y:cy,r:r*(1+.03*Math.sin(t*14)),lava:fzSeg(r,22,46),heat:sw,aura:.5+.5*(1-b*.5)+sw*.4};}
const fzRad=(t,z)=>(z.r/120*100)*fzEase(fzSeg(t,FZ_SEED1,FZ_SEED1+.4))*(1+.15*fzSeg(t,FZ_SWELL,FZ_BT));
const fzVa=t=>fzSeg(t,FZ_SEED1,FZ_SEED1+.1)*(1-fzSeg(t,FZ_BT,FZ_BT+.25));
const FZK={S0:FZ_SEED0,S1:FZ_SEED1,BT:FZ_BT,KY:FZ_KY};
function fzGround(){if(!FZ_ON)return;const now=clk();
  if(S&&S.k==='fireball'&&S.tx!=null&&!S.rel){const t=now-S.t0;fzRune(S.tx,S.ty,fzR(),t);}
  for(const z of R.fz){const t=now-z.t0;const F8=!!(window.FZ8&&FZ8.ok&&FZ8.ground(z,t,now,FZK));
    const d=.3*fzSeg(t,FZ_RISE,FZ_BIG)*(1-fzSeg(t,FZ_BT+.3,FZ_BT+1.3));
    if(d>0){ctx.save();const g=ctx.createRadialGradient(z.x,z.y,80,z.x,z.y,620);g.addColorStop(0,'rgba(22,4,6,'+d+')');g.addColorStop(1,'rgba(22,4,6,0)');ctx.fillStyle=g;ctx.fillRect(z.x-640,z.y-640,1280,1280);ctx.restore();}
    const u=t-FZ_BT;if(!F8&&u>=.1){const a=fzSeg(u,.1,.35)*(1-fzSeg(u,2.4,4.2));if(a>0){const SC=fzT('scorch');if(SC){ctx.save();ctx.translate(z.x,z.y);ctx.scale(1,FZ_KY);ctx.globalAlpha=a*.95;ctx.drawImage(SC,-z.r*1.05,-z.r*1.05,z.r*2.1,z.r*2.1);ctx.restore();}else fzDisc(z.x,z.y,z.r*.95,'rgba(20,6,4,.55)','rgba(20,6,4,0)',a);
      ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<14;i++){const an=bHash(i*2.3)*6.283,rr=z.r*(.2+.7*bHash(i*5.1)),fl=.5+.5*Math.sin(now*7+i*3);ctx.globalAlpha=a*.5*fl;ctx.drawImage(fzGlow(FZC_O),z.x+Math.cos(an)*rr-9,z.y+Math.sin(an)*rr*FZ_KY-6,18,12);}ctx.restore();}}
    if(z.gm>0&&u>=0&&u<3.4){const ga=fzSeg(u,0,.25)*(1-fzSeg(u,2.9,3.4));if(ga>0){fzDisc(z.x,z.y,z.r*.85,'rgba(255,120,40,.35)','rgba(255,60,20,.08)',ga*(.8+.2*Math.sin(now*9)));
      ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<9;i++){const an=bHash(i*3.3)*6.283,rr=z.r*.85*(.2+.75*bHash(i*7.7)),fl=.5+.5*Math.sin(now*11+i*2.1),h=26+20*fl;ctx.globalAlpha=ga*.6*fl;ctx.drawImage(fzGlow(i%2?FZC_O:FZC_R),z.x+Math.cos(an)*rr-14,z.y+Math.sin(an)*rr*FZ_KY-h,28,h+8);}ctx.restore();}}
    fzRune(z.x,z.y,z.r,t);
    const va=fzVa(t);if(!F8&&va>0)fzVortex(z.x,z.y,fzRad(t,z),va,now,fzSeg(t,FZ_RISE,FZ_SWELL)*.6+fzSeg(t,FZ_SWELL,FZ_BT)*.4,'back');}}
function fzDraw(){if(!FZ_ON||!R.fz.length)return;fzInit();const now=clk();
  for(const z of R.fz){const t=now-z.t0,cx=z.x,C0=z.y;
    if(window.FZ8&&FZ8.ok&&FZ8.top(z,t,now,FZK))continue;
    // sphere (+ shadow) and the front half of the vortex
    const s=fzSphState(z,t,now);
    if(s){ctx.save();ctx.globalAlpha=.3*s.lava+.1;ctx.fillStyle='#200406';ctx.beginPath();ctx.ellipse(cx,C0+2,s.r*.8,s.r*.8*FZ_KY*.7,0,0,6.283);ctx.fill();ctx.restore();fzSphere(s.x,s.y,s.r,now,s.lava,s.heat,s.aura);}
    const va=fzVa(t);if(va>0)fzVortex(cx,C0,fzRad(t,z),va,now,fzSeg(t,FZ_RISE,FZ_SWELL)*.6+fzSeg(t,FZ_SWELL,FZ_BT)*.4,'front');
    // blue orb shot flat from the staff tip (arc like the demo), lands, floats up out of the vortex, hands over to the red orb
    {const sp=u=>({x:cx,y:fzLerp(C0-420,C0-6,u*u)});
      const u=fzSeg(t,FZ_SEED0,FZ_SEED1);if(u>0&&t<=FZ_SEED1+.05){const p=sp(u),pb=sp(Math.max(0,u-.04)),dx=p.x-pb.x,dy=p.y-pb.y,ang=0,fa=1-fzSeg(t,FZ_SEED1-.04,FZ_SEED1+.04),B=fzT('seedball'),TR=fzT('seedtrail'),tl=Math.min(150,p.y-(C0-420));
        ctx.save();ctx.globalCompositeOperation='lighter';
        if(TR){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(ang);ctx.globalAlpha=.9*fa;ctx.drawImage(TR,-9,-tl,18,tl);ctx.restore();}
        else{const g=ctx.createLinearGradient(p.x-dx/(Math.hypot(dx,dy)||1)*90,p.y-dy/(Math.hypot(dx,dy)||1)*90,p.x,p.y);g.addColorStop(0,'rgba(127,168,255,0)');g.addColorStop(1,'rgba(127,168,255,'+.55*fa+')');ctx.strokeStyle=g;ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(p.x-dx/(Math.hypot(dx,dy)||1)*90,p.y-dy/(Math.hypot(dx,dy)||1)*90);ctx.lineTo(p.x,p.y);ctx.stroke();}
        ctx.globalAlpha=.85*fa;ctx.drawImage(fzGlow(FZC_B),p.x-18,p.y-18,36,36);ctx.restore();
        if(B){ctx.globalAlpha=fa;ctx.drawImage(B,p.x-11,p.y-11,22,22);ctx.globalAlpha=1;}else{ctx.save();ctx.globalAlpha=fa;ctx.fillStyle='#dfe9ff';ctx.beginPath();ctx.arc(p.x,p.y,4.2,0,6.283);ctx.fill();ctx.restore();}}
      if(t>=FZ_SEED1&&t<FZ_RISE+.12){const w=fzEase(fzSeg(t,FZ_SEED1,FZ_RISE)),px=cx,py=C0-4-30*w,sz=fzLerp(10,17,w),fa=1-fzSeg(t,FZ_RISE-.1,FZ_RISE+.12),B=fzT('seedball');
        if(fa>0){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.85*fa;ctx.drawImage(fzGlow(FZC_B),px-sz*1.2,py-sz*1.2,sz*2.4,sz*2.4);ctx.restore();
          if(B){ctx.globalAlpha=fa;ctx.drawImage(B,px-sz/2,py-sz/2,sz,sz);ctx.globalAlpha=1;}else{ctx.save();ctx.globalAlpha=fa;ctx.fillStyle='#dfe9ff';ctx.beginPath();ctx.arc(px,py,sz*.4,0,6.283);ctx.fill();ctx.restore();}}}}
    // burst
    const u=t-FZ_BT;if(u>=0&&u<=1.6){const bx=cx,by=C0-34,R_=z.r;
      const fa=(1-fzSeg(u,0,.16))*.32;if(fa>0){ctx.save();const g=ctx.createRadialGradient(bx,by,0,bx,by,700);g.addColorStop(0,'rgba(255,240,225,'+fa+')');g.addColorStop(1,'rgba(255,240,225,0)');ctx.fillStyle=g;ctx.fillRect(bx-720,by-720,1440,1440);ctx.restore();}
      const ca=1-fzSeg(u,0,.45);if(ca>0){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=ca;const w=70*(1-fzSeg(u,0,.5))+14;ctx.drawImage(fzGlow(FZC_W),bx-w,C0-300,w*2,300);ctx.restore();}
      const du=fzEase(fzSeg(u,0,.4)),da=1-fzSeg(u,.18,.75);if(da>0){ctx.save();ctx.globalCompositeOperation='lighter';ctx.translate(bx,by+20);ctx.scale(1,.8);ctx.globalAlpha=da;const rr=fzLerp(50,R_*1.25,du),g=ctx.createRadialGradient(0,0,rr*.1,0,0,rr);g.addColorStop(0,'rgba(255,250,235,.9)');g.addColorStop(.35,'rgba(255,170,90,.6)');g.addColorStop(.75,'rgba(255,60,30,.35)');g.addColorStop(1,'rgba(160,20,10,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,rr,0,6.283);ctx.fill();ctx.restore();}
      fzDisc(cx,C0,R_*1.15*fzEase(fzSeg(u,0,.3)),'rgba(255,235,200,.9)','rgba(255,90,40,0)',(1-fzSeg(u,.15,.65))*.9);
      for(let j=0;j<3;j++){const q=fzSeg(u,j*.09,.7+j*.09);if(q<=0||q>=1)continue;const rr=R_*1.3*fzEase(q),wd=7*(1-q)+1.2,al=1-q;fzRing(cx,C0,rr+wd,wd*1.1,'#33000a',al*.6);const RG=fzT('ring');if(RG){ctx.save();ctx.translate(cx,C0);ctx.scale(1,FZ_KY);ctx.rotate(j*1.7);const RGD=fzTint(RG,'#2a0008','ringd'),q2=rr+wd*2;ctx.globalAlpha=al*.7;ctx.drawImage(RGD,-q2*1.02,-q2*1.02+3,q2*2.04,q2*2.04);ctx.globalAlpha=al*.95;ctx.drawImage(RG,-q2,-q2,q2*2,q2*2);ctx.globalAlpha=al*.5;ctx.drawImage(RG,-q2*1.04,-q2*1.04,q2*2.08,q2*2.08);ctx.restore();}else fzRing(cx,C0,rr,wd,j?'#ffc2c2':'#fff0ea',al*.9);}
      ctx.save();ctx.globalCompositeOperation='lighter';
      for(let i=0;i<11;i++){const ox=(bHash(i*1.9+.3)-.5)*R_*1.25,cen=1-Math.abs(ox)/(R_*.75),h=(40+110*bHash(i*5.3+2))*fzEase(fzSeg(u,.02+.05*bHash(i),.8)),s2=(46+46*bHash(i*7.1+3))*(.6+.5*cen),al=1-fzSeg(u,.35+.15*bHash(i*2.2),1.1);if(al<=0)continue;
        const px=cx+ox+Math.sin(u*5+i)*6,py=C0+(bHash(i*3.7+1)-.5)*14-h,col=u<.2?FZC_Y:u<.45?FZC_O:FZC_R,FL=fzT('flame'+(i%6));
        if(FL){ctx.globalAlpha=al*.35;ctx.drawImage(fzGlow(col),px-s2/2,py-s2/2,s2,s2);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=Math.min(1,al*1.1)*.9;const fs=s2*1.05*(.5+.6*fzEase(fzSeg(u,0,.4))),mx=Math.max(FL.naturalWidth,FL.naturalHeight),fw=fs*FL.naturalWidth/mx,fh=fs*FL.naturalHeight/mx;
          ctx.save();ctx.translate(px,py+fh*.3);if(i%2)ctx.scale(-1,1);ctx.drawImage(FL,-fw/2,-fh,fw,fh);ctx.restore();ctx.globalCompositeOperation='lighter';}
        else{ctx.globalAlpha=al*.75;ctx.drawImage(fzGlow(col),px-s2/2,py-s2/2,s2,s2);}}
      ctx.restore();
      for(let i=0;i<9;i++){const q=fzSeg(u,.25+bHash(i*2.1)*.2,1.6);if(q<=0||q>=1)continue;const sx=cx+(bHash(i*4.3+7)-.5)*R_*.9,sy=C0-40-q*110-bHash(i*6.1+1)*30,sz=60+50*q,SM=fzT('smoke'+(i%4));ctx.save();ctx.globalAlpha=(1-q)*(SM?.45:.5)*Math.min(1,q*5);
        if(SM){const ss=sz*1.6,sh=ss*SM.naturalHeight/SM.naturalWidth;ctx.drawImage(SM,sx-ss/2,sy-sh/2,ss,sh);}else ctx.drawImage(FZSMK,sx-sz/2,sy-sz/2,sz,sz);ctx.restore();}}}
  for(const z of R.fz){if(!z.pils)continue;for(const p of z.pils){const u=now-p.t0;if(u<0||u>.9)continue;const h=170*fzEase(fzSeg(u,0,.18)),a=1-fzSeg(u,.4,.9);ctx.save();ctx.globalCompositeOperation='lighter';
    const g=ctx.createLinearGradient(0,p.y,0,p.y-h);g.addColorStop(0,'rgba(255,230,160,.95)');g.addColorStop(.5,'rgba(255,110,50,.6)');g.addColorStop(1,'rgba(255,50,30,0)');ctx.globalAlpha=a;ctx.fillStyle=g;const w=50*(1-.25*fzSeg(u,.2,.9));ctx.beginPath();ctx.moveTo(p.x-w,p.y);ctx.lineTo(p.x-w*.6,p.y-h);ctx.lineTo(p.x+w*.6,p.y-h);ctx.lineTo(p.x+w,p.y);ctx.closePath();ctx.fill();
    ctx.globalAlpha=a*.8;ctx.drawImage(fzGlow(FZC_Y),p.x-70,p.y-60,140,80);ctx.restore();fzRing(p.x,p.y,50*(.6+.5*fzSeg(u,0,.3)),4,'#fff0ea',a*.7);}}
  fzFrDraw();
  // a short orange flash on the monsters that just took a hit
  ctx.save();ctx.globalCompositeOperation='lighter';for(const e of enemies){const f=e._fzFl;if(!f)continue;const a=1-(now-f)/.14;if(a<=0){delete e._fzFl;continue;}ctx.globalAlpha=a*.55;ctx.drawImage(fzGlow(FZC_O),e.x-26,eCy(e)-26,52,52);}ctx.restore();}


/* p291 r1 — staff "หอกน้ำแข็ง" → Blizzard circle (TEST only; order orders/code/ORDER_20261023_staff-blizzard.md, DeaRz 12:46 "วงกว้าง และมีพายุหิมะโปรยลงมา",
   15:42 knock-back + 30% freeze, 16:14/16:36 freeze 5 s and any hit breaks it, demo PASSED 16:39 "okผ่าน").
   r2 (stage 1 QA1x r84 item 8): ~6 frozen monsters in the centre merged into one white blob; less additive light on the ice block and the frost coat so each monster stays readable.
   Look + timing = approved/vfx/STAFF_BLIZZARD_demo_r1_source.html (i1, i1Ground, i1Sky, i1Snow, iceBlock, shatter), times from the cast start:
   cast 0.62 s (staff raised, frost motes into the crystal, V7 rune bands draw round the target), storm 0.8–3.8 s, 6 ticks 1.0, 1.5 … 3.5 s.
   Each tick: every monster inside the 170 px ground ellipse (ry = 0.55 rx) gets an Ice hit (own number every hit), a 30% slow (3 s after it leaves),
   an eased 36 px push out from the centre (216 px/s, decay 6/s) and a 30% freeze roll: frozen = ice block 5 s, cannot move/attack, not pushed;
   blizzard ticks do not break it, any other hit does (and the 5 s end does), with shards, mist, ring, flash, small shake and "แตก!".
   Numbers = balance/staff_blizzard_r1/REPORT_20261023_staff_blizzard.md (TEST, not yet approved by DeaRz): Lv4 48% x6 = 290%, Lv5+ circle 195, Lv10 freeze 40%.
   Balance extras behind ?bzbal=off: cooldown 8 → 10 s, no re-freeze for 3 s after the ice breaks, bosses get the 30% slow (never frozen).
   Hero pose = the staff cast clip already in game (stand-in; staff_cast_shot_r1 / slam_r1 are approved but not installed until DeaRz orders it).
   ?blizzard=off = the old ice spear. */
const BZ=(()=>{try{return !/blizzard=off/.test(location.search);}catch(_){return true;}})();
const BZX=(()=>{try{return !/bzbal=off/.test(location.search);}catch(_){return true;}})();
const BZC={RANGE:420,CAST:.62,T0:.8,DT:.5,N:6,TK:.2,END0:3.8,KY:.55,FZ_T:5,KB_V:216,KB_D:6,KB_T:.17,REFZ:3,SLOW_T:3,
  L:[null,[2.03,170,.3],[2.32,170,.3],[2.61,170,.3],[2.90,170,.3],[3.34,195,.3],[3.62,195,.3],[3.94,195,.3],[4.29,195,.3],[4.67,195,.3],[5.16,195,.4]]};   // [total of 6 ticks, circle px, freeze chance]
const IC='#6ccfff',IL='#bfeaff',IW='#f2fbff',VL2='#c9b6ff';
R.bz=[];R.bzSt={on:BZ,bal:BZX,cfg:BZC,stats:{casts:0,ticks:0,hits:0,freeze:0,shatter:0,thaw:0,knock:0,peakP:0,refz:0,boss:0}};
if(BZ){CFG.ice.cast=BZC.CAST;CFG.ice.bzOn=true;CFG.ice.name='พายุหิมะ';if(BZX)CFG.ice.cd=10;}
const bzLv=()=>{try{const v=window.SKLV&&SKLV.on&&SKLV.lv&&SKLV.lv.ice;return Math.max(1,Math.min(10,v|0||4));}catch(_){return 4;}};
const bzR=()=>BZC.L[bzLv()][1];
const bzH=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
const bzSeg=(t,a,b)=>Math.max(0,Math.min(1,(t-a)/(b-a))),bzEase=x=>1-Math.pow(1-Math.max(0,Math.min(1,x)),3),bzLerp=(a,b,u)=>a+(b-a)*u;
const bzT=()=>{try{return typeof camT==='function'?camT():.866;}catch(_){return .866;}};
const bzMk=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c;};
const BZGL={};function bzGlow(col){return BZGL[col]||(BZGL[col]=bzMk(64,64,g=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,col);r.addColorStop(.3,col+'bb');r.addColorStop(1,col+'00');g.fillStyle=r;g.fillRect(0,0,64,64);}));}
const BZCLOUD=bzMk(128,128,g=>{const r=g.createRadialGradient(60,58,0,64,64,64);r.addColorStop(0,'rgba(92,112,150,.95)');r.addColorStop(.5,'rgba(70,88,128,.7)');r.addColorStop(1,'rgba(50,64,100,0)');g.fillStyle=r;g.fillRect(0,0,128,128);});
const BZCLOUDH=bzMk(128,128,g=>{const r=g.createRadialGradient(56,46,0,64,64,64);r.addColorStop(0,'rgba(220,240,255,.8)');r.addColorStop(.5,'rgba(170,200,235,.3)');r.addColorStop(1,'rgba(150,180,220,0)');g.fillStyle=r;g.fillRect(0,0,128,128);});
const BZMIST=bzMk(128,128,g=>{const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(225,242,255,.85)');r.addColorStop(.6,'rgba(200,228,250,.4)');r.addColorStop(1,'rgba(190,220,250,0)');g.fillStyle=r;g.fillRect(0,0,128,128);});
R.bzWarm=()=>[BZCLOUD,BZCLOUDH,BZMIST,bzGlow(IC),bzGlow(IL),bzGlow(IW)];R.bzWarmRunes=()=>[[IL,.476],[VL2,.476],[IW,.476]];
/* r84 p292: Rainbow Storm (u48) art + its lazily built caches, for the pre-warm (DeaRz phone 17:33: first storm 100 ms once). The u48 consts live later in this same scope, so they are read only when called. */
R.ultReady=()=>{try{return URIB.every(uOK)&&uOK(UV7)&&UVR.every(uOK);}catch(_){return true;}};
R.ultWarm=()=>{const L=[];const add=(x,d=0)=>{if(!x||d>4)return;if(Array.isArray(x)){for(const y of x)add(y,d+1);return;}if(x.getContext||x.tagName==='IMG')L.push(x);else if(typeof x==='object')for(const k in x)add(x[k],d+1);};
  try{add(UVR);add(UV4);add(UV9);add(UV8D);add(UV8L);add(UV7);add(UV2);add(UV3);add(UV5);add(URIB);}catch(_){}
  try{add(uRunes());}catch(_){}try{add(uRibCrop());}catch(_){}try{add(ucoreV());}catch(_){}try{for(const c of URCOL)add(ugl(c));add(ugl('#ffffff'));}catch(_){}
  return L;};
const inBz=(z,e)=>{const rx=z.r+(e.sz||16)*.5,ry=z.r*BZC.KY+(e.sz||16)*.5*BZC.KY,dx=(e.x-z.x)/rx,dy=(e.y-z.y)/ry;return dx*dx+dy*dy<=1;};
/* particles: one shared list (≤120), positions in world x / local screen y offsets are kept per zone (local = bb space of the circle centre) */
function bzAdd(z,p){if(z.P.length>=120)return;p.age=0;p.vx=p.vx||0;p.vy=p.vy||0;p.g=p.g||0;p.rot=p.rot||0;p.vr=p.vr||0;p.drag=p.drag||0;z.P.push(p);}
function bzMist(z,x,y,s,o){bzAdd(z,Object.assign({k:'mist',x,y,s,vy:-(5+rnd()*15),vx:(rnd()-.5)*40,life:.6+rnd()*.4,fin:.12,ph:rnd()*6.283},o||{}));}
function bzChip(z,x,y,o){bzAdd(z,Object.assign({k:'ice',x,y,vx:(rnd()-.5)*180,vy:-(80+rnd()*100),g:600,vr:(rnd()-.5)*28,s:3+rnd()*3,life:.4+rnd()*.3,floor:y+4+rnd()*10},o||{}));}
const bzLoc=(z,x,y)=>[x-z.x,(y-z.y)*bzT()];
/* cloud height fitted to the view (the demo 250 px would go under the map title + menu bar in the game view; same rule as the holy rain ring) */
function bzFitSky(z){z.cy=-250;try{const sy=w2s(z.x,z.y)[1],zz=(typeof camZ==='function'?camZ():1)||1,av=(sy-86)/zz-100;z.cy=-Math.max(150,Math.min(250,av));}catch(_){}}
function bzStart(S,ctx,echo){const lv=bzLv(),row=BZC.L[lv],now=clk(),mul=row[0]/BZC.N*(echo?CFG.echo.mul:1);ctx.mulBase=mul;ctx.el='Ice';
  const z={x:S.tx,y:S.ty,t0:S.t0==null?now-BZC.CAST:S.t0,r:row[1],mul,fz:row[2],ctx,echo:!!echo,k:0,P:[],shards:[],ev:{},d:S.d};
  if(echo)z.t0=now-BZC.CAST;
  bzFitSky(z);R.bz.push(z);R.bzSt.stats.casts++;
  const tp=bzTip(z);bzAdd(z,{k:'s',x:tp[0],y:tp[1],s:90,col:IL,life:.2});bzAdd(z,{k:'ring',x:tp[0],y:tp[1],s:46,w:4,col:IC,life:.3,flat:1});
  for(let k=0;k<6;k++){const h=bzLoc(z,P.x,P.y);bzMist(z,h[0]+(rnd()-.4)*50,h[1],10+rnd()*6,{vx:(rnd()-.5)*80,life:.6});}
  try{shake(2);}catch(_){}log('blizzard',{lv,r:z.r,mul});}
function bzTip(z){try{const tp=tipAt(z.d!=null?z.d:(S&&S.d)||0);return bzLoc(z,tp.x,tp.y);}catch(_){const h=bzLoc(z,P.x,P.y);return [h[0]+18,h[1]-104];}}
function bzFreeze(e,now){e.st=e.st||{};e.st.stun=Math.max(e.st.stun||0,BZC.FZ_T);e._bzF={t0:now,until:now+BZC.FZ_T};e._bzKb=null;R.bzSt.stats.freeze++;}
/* the ice breaks: any non-blizzard hit, or the 5 s end */
function bzShatter(e,why){const f=e&&e._bzF;if(!f)return;const now=clk();delete e._bzF;if(e.st&&e.st.stun>0)e.st.stun=0;if(BZX)e._bzNo=now+BZC.REFZ;
  R.bzSt.stats[why==='thaw'?'thaw':'shatter']++;e._bzBrk={t0:now};
  if(FXON){const z={x:e.x,y:e.y,P:R.bzBrkP};const L_=bzLoc(z,e.x,e.y),y0=0;
    bzAdd(z,{k:'s',x:0,y:y0-26,s:110,col:IW,life:.2});bzAdd(z,{k:'ring',x:0,y:y0,s:60,w:5,col:IL,life:.35});
    for(let q=0;q<14;q++){const a=-rnd()*3.1;bzAdd(z,{k:'ice',x:(rnd()-.5)*28,y:-(10+rnd()*34),vx:Math.cos(a)*(80+rnd()*120),vy:Math.sin(a)*(80+rnd()*140),g:700,vr:(rnd()-.5)*28,s:4+rnd()*4,life:.5+rnd()*.3,floor:2+rnd()*12});}
    for(let q=0;q<4;q++)bzMist(z,(rnd()-.5)*28,-rnd()*20,10+rnd()*5,{life:.6});
    R.bzBrk.push({e,x:e.x,y:e.y,t0:now,P:z.P});R.bzBrkP=[];}
  try{shake(4);}catch(_){}try{textAt(e.x,e.y-(e.sz||16)*2.2,'แตก!',IW,16,{life:.9});}catch(_){}}
R.bzBrk=[];R.bzBrkP=[];
function bzTick(now,dt){if(!BZ)return;dt=Math.min(.05,+dt||0);
  /* frozen monsters: hold still; thaw at 5 s */
  for(const e of enemies){const f=e._bzF;if(f){if(e.dead||!liveE(e)){delete e._bzF;continue;}if(now>=f.until){bzShatter(e,'thaw');continue;}e.st=e.st||{};e.st.stun=Math.max(e.st.stun||0,f.until-now);}
    const k=e._bzKb;if(k&&!e._bzF){const u=k.v;if(u>0){const nx=e.x+k.dx*u*BZC.KB_V*dt,ny=e.y+k.dy*u*BZC.KB_V*dt;let ok=true;try{if(typeof blocked==='function'&&blocked(nx,ny,e.sz||16))ok=false;}catch(_){}
        if(ok){e.x=nx;e.y=ny;}k.v=Math.max(0,u-dt*BZC.KB_D);}else e._bzKb=null;}}
  for(const z of R.bz){const t=now-z.t0;
    /* charge motes are drawn from the cast state (see bzGround); release flash is added in bzStart */
    if(t>BZC.T0&&t<BZC.END0&&rnd()<dt*10){const a=rnd()*6.283,r=Math.sqrt(rnd())*z.r*.95;const L_=[Math.cos(a)*r,Math.sin(a)*r*BZC.KY*bzT()];bzMist(z,L_[0],L_[1],10+rnd()*6,{vx:10+rnd()*30,life:.8});}
    if(t>BZC.T0&&t<BZC.END0&&rnd()<dt*7){const a=rnd()*6.283,r=Math.sqrt(rnd())*z.r*.9;z.shards.push({t0:t,x:Math.cos(a)*r,y:Math.sin(a)*r*BZC.KY*bzT()});}
    for(const s of z.shards){if(!s.done&&t>=s.t0+.28){s.done=1;for(let k=0;k<4;k++)bzChip(z,s.x,s.y-4);bzAdd(z,{k:'s',x:s.x,y:s.y-6,s:34,col:IL,life:.14});bzAdd(z,{k:'ring',x:s.x,y:s.y,s:26,w:3,col:IL,life:.3});}}
    z.shards=z.shards.filter(s=>t<s.t0+.6);
    /* damage ticks */
    while(z.k<BZC.N&&t>=BZC.T0+BZC.TK+z.k*BZC.DT){z.k++;R.bzSt.stats.ticks++;
      for(const e of enemies){if(!liveE(e)||!inBz(z,e))continue;const boss=isBoss(e);
        R.bzTickNow=1;let r=0;try{r=shit(e,z.ctx,z.mul,{fx:z.x,fy:z.y});}finally{R.bzTickNow=0;}R.bzSt.stats.hits++;e._bzHit=now;
        if(boss){if(BZX){e.jdSlow=Math.max(e.jdSlow||0,BZC.SLOW_T);R.bzSt.stats.boss++;}continue;}
        e.jdSlow=Math.max(e.jdSlow||0,BZC.SLOW_T);
        if(e._bzF)continue;                                                   // frozen: still damaged, not pushed, ice stays
        if(!(e._bzNo>now)&&rnd()<z.fz){bzFreeze(e,now);const L_=bzLoc(z,e.x,e.y);for(let q=0;q<6;q++)bzChip(z,L_[0],L_[1]-20);}
        else{if(e._bzNo>now)R.bzSt.stats.refz++;const dx=e.x-z.x,dy=(e.y-z.y)/BZC.KY,l=Math.hypot(dx,dy)||1;e._bzKb={v:1,dx:dx/l,dy:dy/l*BZC.KY};R.bzSt.stats.knock++;
          const L_=bzLoc(z,e.x,e.y);bzMist(z,L_[0],L_[1],10+rnd()*4,{vx:dx/l*60,life:.5});}}}
    /* slowed while inside the storm (3 s linger after leaving) */
    if(t>BZC.T0+.2&&t<BZC.END0)for(const e of enemies){if(liveE(e)&&inBz(z,e)&&(!isBoss(e)||BZX))e.jdSlow=Math.max(e.jdSlow||0,BZC.SLOW_T);}
    bzStep(z.P,dt);R.bzSt.stats.peakP=Math.max(R.bzSt.stats.peakP,z.P.length);}
  for(const b of R.bzBrk)bzStep(b.P,dt);R.bzBrk=R.bzBrk.filter(b=>now<b.t0+1);
  R.bz=R.bz.filter(z=>now<z.t0+BZC.END0+1.2||z.P.length);}
function bzStep(L,dt){for(const p of L){p.age+=dt;p.vx*=1-p.drag*dt;p.vy=p.vy*(1-p.drag*dt)+p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;if(p.floor!=null&&p.y>p.floor){p.y=p.floor;p.vy*=-.2;p.vx*=.5;p.vr*=.4;}}
  for(let i=L.length-1;i>=0;i--)if(L[i].age>=L[i].life)L.splice(i,1);}
/* ---------- drawing (inside bb of the circle centre: local units = screen px, ground ellipse ry = rx * 0.55 * tilt) ---------- */
function bzBB(x,y,f){try{bb(x,y,()=>{ctx.save();ctx.translate(x,y);f(BZC.KY*bzT());ctx.restore();});}catch(e){R.err='bz draw '+e.message;}ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
function bzRing(x,y,r,col,a,rot,grow,KL){runeRing(x,y,r,col,a,rot,0,grow,KL);}
function bzDisc(r,c0,c1,a,KL){if(a<=0||r<=0)return;ctx.save();ctx.scale(1,KL);ctx.globalAlpha=a;const g=ctx.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,c0);g.addColorStop(1,c1);ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r,0,6.283);ctx.fill();ctx.restore();}
function bzBand(pts,wf,col,a){if(pts.length<2||a<=0)return;const L2=[],R2=[];for(let i=0;i<pts.length;i++){const p0=pts[Math.max(0,i-1)],p1=pts[Math.min(pts.length-1,i+1)],dx=p1[0]-p0[0],dy=p1[1]-p0[1],l=Math.hypot(dx,dy)||1,w=wf(pts[i][2])/2;L2.push([pts[i][0]-dy/l*w,pts[i][1]+dx/l*w]);R2.push([pts[i][0]+dy/l*w,pts[i][1]-dx/l*w]);}
  ctx.save();ctx.globalAlpha=a;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(L2[0][0],L2[0][1]);for(const q of L2)ctx.lineTo(q[0],q[1]);for(let i=R2.length-1;i>=0;i--)ctx.lineTo(R2[i][0],R2[i][1]);ctx.closePath();ctx.fill();ctx.restore();}
function bzDrawP(L,KL){for(const p of L){const u=p.age/p.life,fi=p.fin?bzSeg(p.age,0,p.fin):1,hd=p.hold||.5,a=fi*(1-Math.max(0,u-hd)/(1-hd));if(a<=0)continue;ctx.globalAlpha=Math.max(0,Math.min(1,a*(p.a||1)));
    if(p.k==='mist'){const s=p.s*(1+u*.9);ctx.globalAlpha*=.5;for(let j=0;j<3;j++){const an=p.ph+j*2.1+u*1.4,d=s*(.25+.35*u),ss=s*(.75-.12*j);ctx.drawImage(BZMIST,p.x+Math.cos(an)*d-ss,p.y+Math.sin(an)*d*.5-ss*.7,ss*2,ss*1.4);}}
    else if(p.k==='ice'){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=IL;ctx.beginPath();ctx.moveTo(0,-p.s);ctx.lineTo(p.s*.5,0);ctx.lineTo(0,p.s);ctx.lineTo(-p.s*.5,0);ctx.closePath();ctx.fill();ctx.restore();}
    else if(p.k==='ring'){ctx.save();ctx.translate(p.x,p.y);ctx.scale(1,p.flat||KL);const r=p.s*(.3+.7*bzEase(u));ctx.strokeStyle=p.col;ctx.lineWidth=Math.max(.1,p.w*(1-u));ctx.beginPath();ctx.arc(0,0,r,0,6.283);ctx.stroke();ctx.restore();}
    else{ctx.globalCompositeOperation='lighter';ctx.drawImage(bzGlow(p.col||IC),p.x-p.s/2,p.y-p.s/2,p.s,p.s);ctx.globalCompositeOperation='source-over';}}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
function bzCold(z,t,KL){const on=bzSeg(t,BZC.T0+.25,BZC.T0+1)*(1-bzSeg(t,BZC.END0+.2,BZC.END0+1.4));if(on<=0)return;const sp=bzSoft(),R_=z.r,n=Math.round(22*bzQ());
  ctx.save();for(let i=0;i<n;i++){const ang=bzH(i*3.7)*6.283+t*.12*(i%2?1:-1),rr=Math.sqrt(bzH(i*8.1))*R_*1.12,x=Math.cos(ang)*rr-t*6%40,y=Math.sin(ang)*rr*KL+4,w=bzLerp(60,110,bzH(i*2.9)),pul=.6+.4*Math.sin(t*1.3+i*2.1);
    ctx.globalAlpha=on*.45*pul;ctx.drawImage(sp,x-w,y-w*.22,w*2,w*.44);}
  const melt=1-bzSeg(t,BZC.END0+.2,BZC.END0+1.6),np=Math.round(16*bzQ());
  for(let i=0;i<np;i++){const bt=BZC.T0+.4+bzH(i*6.1)*(BZC.END0-BZC.T0-.6),g=bzSeg(t,bt,bt+.7)*melt;if(g<=0)continue;
    const ang=bzH(i*1.9)*6.283,rr=Math.sqrt(bzH(i*4.3))*R_*.95,px=Math.cos(ang)*rr,py=Math.sin(ang)*rr*KL,pw=bzLerp(20,38,bzH(i*7.3));
    for(let j=0;j<5;j++){const ox=(bzH(i*10+j)-.5)*pw*1.6,oy=(bzH(i*13+j)-.5)*pw*.5,w=pw*bzLerp(.5,.9,bzH(i*17+j))*g;ctx.globalAlpha=.85*g;ctx.drawImage(sp,px+ox-w,py+oy-w*.38,w*2,w*.76);}}
  ctx.restore();}
function bzGround(){if(!BZ)return;const now=clk();
  /* scene dim while a storm is up (demo: −22%) */
  let dim=0;for(const z of R.bz){const t=now-z.t0;dim=Math.max(dim,bzSeg(t,.55,.9)*(1-bzSeg(t,BZC.END0,BZC.END0+.6))*.22);}
  if(dim>0){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.fillStyle='rgba(20,34,60,'+dim.toFixed(3)+')';ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.restore();}
  /* telegraph while casting: the two rune bands draw themselves round the aim point */
  if(S&&S.k==='ice'&&S.tx!=null&&!S.rel){const t=now-S.t0,tel=bzSeg(t,.1,BZC.CAST),r=bzR();if(tel>0)bzBB(S.tx,S.ty,KL=>{bzRing(0,0,r,IL,.95,t*.5,tel,KL);bzRing(0,0,r*.62,VL2,.75,-t*.8,tel,KL);});}
  for(const z of R.bz){const t=now-z.t0;bzBB(z.x,z.y,KL=>{const R_=z.r;
    if(t<BZC.T0+.2){const tel=bzSeg(t,.1,BZC.CAST),fa=1-bzSeg(t,BZC.T0,BZC.T0+.2);if(tel>0&&fa>0){bzRing(0,0,R_,IL,fa*.95,t*.5,tel,KL);bzRing(0,0,R_*.62,VL2,fa*.75,-t*.8,tel,KL);}}
    const sp=bzEase(bzSeg(t,BZC.T0-.1,BZC.T0+.7)),fa=1-bzSeg(t,BZC.END0,BZC.END0+.9);if(sp>0&&fa>0){
      bzDisc(R_*sp*1.05,'rgba(220,242,255,.55)','rgba(170,215,250,.05)',fa,KL);
      bzRing(0,0,R_*sp,IW,fa*.85,t*.4,1,KL);
      ctx.save();ctx.globalAlpha=fa;for(let k=0;k<26;k++){const a=k/26*6.283+bzH(k)*.2,rr=R_*sp*(.96+bzH(k+9)*.08),x=Math.cos(a)*rr,y=Math.sin(a)*rr*KL,h=(6+bzH(k+3)*10)*sp*(1-bzSeg(t,BZC.END0,BZC.END0+.7)*.6);
        ctx.fillStyle=k%3?IL:IW;ctx.beginPath();ctx.moveTo(x-3,y);ctx.lineTo(x+(bzH(k)-.5)*4,y-h);ctx.lineTo(x+3,y);ctx.closePath();ctx.fill();}ctx.restore();}bzCold(z,t,KL);});}}
function bzSky(z,t,KL){const on=bzSeg(t,BZC.CAST,BZC.T0+.2)*(1-bzSeg(t,BZC.END0-.1,BZC.END0+.7));if(on<=0)return;const cy=z.cy,R_=z.r;
  for(let layer=0;layer<3;layer++){const n=layer===2?5:10,dir=layer===1?-1:1,rb=R_*[.95,.6,.25][layer];for(let k=0;k<n;k++){const h=bzH(k+layer*20),rr=rb*(.75+.5*h),a=k/n*6.283+t*.35*dir+h,x=Math.cos(a)*rr*on,y=cy+Math.sin(a)*rr*.26-layer*14-h*22+Math.sin(t*1.3+k)*4,s=(46+h*46)*(.6+.4*on)*(1+.08*Math.sin(t*2+k*1.7));
      ctx.globalAlpha=on*.85;ctx.drawImage(BZCLOUD,x-s,y-s*.55,s*2,s*1.1);ctx.globalAlpha=on*.5;ctx.drawImage(BZCLOUDH,x-s*.8,y-s*.7,s*1.6,s*.8);}}
  ctx.globalAlpha=on*.5;ctx.drawImage(BZCLOUD,-R_*1.05,cy+6,R_*2.1,40);ctx.globalAlpha=1;
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=on*(.25+.15*Math.sin(t*9));ctx.drawImage(bzGlow(IL),-90,cy-30,180,60);ctx.restore();
  /* beam from the staff tip up into the cloud right at release */
  const ba=bzSeg(t,BZC.CAST,BZC.CAST+.06)*(1-bzSeg(t,BZC.CAST+.12,BZC.CAST+.4));if(ba>0){const tp=bzTip(z),pts=[];for(let k=0;k<=10;k++){const f=k/10;pts.push([bzLerp(tp[0],-60,f),bzLerp(tp[1],cy+10,f)-Math.sin(f*Math.PI)*60,f]);}
    ctx.save();ctx.globalCompositeOperation='lighter';bzBand(pts,f=>10*(1-f*.5),IC,ba*.7);bzBand(pts,()=>3.5,IW,ba);ctx.restore();}}
function bzFlake(z,i,tt,KL){const sp=bzLerp(150,240,bzH(i*3.1)),ph=bzH(i*7.7),fall=(tt*sp/360+ph)%1,ang=bzH(i*1.3)*6.283,rr=Math.sqrt(bzH(i*5.9))*z.r*1.05;
  const gx=Math.cos(ang)*rr,gy=Math.sin(ang)*rr*KL,top=z.cy+20;return {x:gx-70*(1-fall)+Math.sin(tt*3+i)*6,gx:gx,y:bzLerp(top,gy,fall),f:fall};}
function bzSoft(){return bzSoft._c||(bzSoft._c=bzMk(32,32,g=>{const r=g.createRadialGradient(16,16,0,16,16,16);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.35,'rgba(240,248,255,.7)');r.addColorStop(1,'rgba(235,245,255,0)');g.fillStyle=r;g.fillRect(0,0,32,32);}));}
const bzQ=()=>{try{return (window.matchMedia&&matchMedia('(pointer:coarse)').matches)?.5:1;}catch(_){return 1;}};
function bzSnow(z,t,KL){const on=bzSeg(t,BZC.T0-.05,BZC.T0+.3)*(1-bzSeg(t,BZC.END0-.2,BZC.END0+.4));if(on<=0)return;
  ctx.save();const sp=bzSoft(),n=Math.round(230*bzQ());for(let i=0;i<n;i++){const k=i%3,spd=1.9+k*.3,p=bzFlake(z,i,t*spd,KL),a=on*(p.f<.1?p.f/.1:1)*(p.f>.9?(1-p.f)/.1:1);
    const sz=k===0?bzLerp(3,5,bzH(i*2.2)):k===1?bzLerp(7,11,bzH(i*2.2)):bzLerp(13,19,bzH(i*2.2));
    const wind=-(.8+.2*Math.sin(t*2.1+bzH(i*4.4)*2)),wx=wind*130*(1-p.f),x=p.gx*1.18+wx+Math.sin(t*4+i*1.7)*(k+1)*5,y=p.y+Math.sin(t*3.3+i)*3;
    ctx.globalAlpha=a*(k===0?.85:k===1?.6:.34);ctx.drawImage(sp,x-sz*1.2,y-sz*.9,sz*2.4,sz*1.8);}
  for(const s of z.shards){const u=bzSeg(t,s.t0,s.t0+.28);if(u>=1)continue;const x=s.x-60*(1-u),y=bzLerp(z.cy+30,s.y-6,u*u);ctx.globalAlpha=on;
    ctx.save();ctx.globalCompositeOperation='lighter';bzBand([[x-36,y-80,0],[x,y,1]],f=>2+5*f,IC,.6);ctx.restore();
    ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(80,36)-Math.PI/2);ctx.fillStyle=IW;ctx.beginPath();ctx.moveTo(0,8);ctx.lineTo(4,-6);ctx.lineTo(0,-16);ctx.lineTo(-4,-6);ctx.closePath();ctx.fill();ctx.restore();}
  ctx.restore();}
function bzDraw(){if(!BZ)return;const now=clk();
  /* charge: frost motes pulled into the crystal while casting */
  if(S&&S.k==='ice'&&S.tx!=null&&!S.rel&&FXON&&rnd()<.6){try{const tp=tipAt(S.d),a=rnd()*6.283,r=30+rnd()*25;part({k:'mote',x:tp.x+Math.cos(a)*r,y:tp.y+Math.sin(a)*r,vx:-Math.cos(a)*r*3,vy:-Math.sin(a)*r*3,life:.3,col:rnd()<.5?IC:IL,size:3});}catch(_){}}
  for(const z of R.bz){const t=now-z.t0;bzBB(z.x,z.y,KL=>{bzSnow(z,t,KL);bzSky(z,t,KL);bzDrawP(z.P,KL);});}
  for(const b of R.bzBrk)bzBB(b.x,b.y,KL=>bzDrawP(b.P,KL));}
/* monsters: frost coat while slowed, ice block while frozen (drawn with the monster, so it sorts with it) */
function bzIce(e,now){const f=e._bzF,b=e._bzBrk;let a,grow;if(f){grow=bzEase(bzSeg(now,f.t0,f.t0+.12));a=grow;}else if(b){const u=now-b.t0;if(u>.35){delete e._bzBrk;return;}a=1-u/.35;}else return;if(a<=0)return;
  const w=Math.max(36,(e.sz||16)*2.5),h=w*1.45,x=e.x,y=e.y+2;ctx.save();ctx.globalAlpha=a*.45;const g=ctx.createLinearGradient(x-w/2,y-h,x+w/2,y);g.addColorStop(0,'rgba(215,240,255,.75)');g.addColorStop(1,'rgba(110,185,245,.55)');ctx.fillStyle=g;
  ctx.beginPath();ctx.moveTo(x-w/2,y);ctx.lineTo(x-w/2+4,y-h*.8);ctx.lineTo(x-w*.1,y-h);ctx.lineTo(x+w*.3,y-h*.92);ctx.lineTo(x+w/2,y-h*.6);ctx.lineTo(x+w/2-3,y);ctx.closePath();ctx.fill();
  ctx.globalAlpha=a*.9;ctx.strokeStyle=IW;ctx.lineWidth=1.6;ctx.stroke();ctx.beginPath();ctx.moveTo(x-w*.25,y-h*.8);ctx.lineTo(x-w*.05,y-h*.35);ctx.moveTo(x+w*.15,y-h*.85);ctx.lineTo(x+w*.3,y-h*.55);ctx.stroke();
  ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a*(.11+.05*Math.sin(now*6));ctx.drawImage(bzGlow(IL),x-w*.55,y-h*1.0,w*1.1,h*1.0);ctx.restore();
  if(f)bzTag(x,y+18,'แช่แข็ง',IW,Math.min(1,(now-f.t0)/.1),12);}
function bzTag(x,y,s,col,a,sz){if(a<=0)return;ctx.save();ctx.globalAlpha=a;ctx.font='bold '+(sz||12)+'px Sarabun,sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#0c2238';ctx.strokeText(s,x,y);ctx.fillStyle=col;ctx.fillText(s,x,y);ctx.restore();}
if(BZ&&typeof drawEnemy==='function'){const o=drawEnemy;drawEnemy=function(e){const r=o.apply(this,arguments);try{if(e&&!e.dead){const now=clk(),fr=e.jdSlow>0&&e._bzHit&&now-e._bzHit<6?Math.min(1,e.jdSlow/1.2):0;
    if(fr>0&&!e._bzF){const x=e.x,y=e.y,top=-(e.sz||16)*2.6;ctx.save();ctx.globalAlpha=fr*.2;ctx.globalCompositeOperation='lighter';ctx.drawImage(bzGlow(IC),x-22,y+top-2,44,44);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=fr*.9;ctx.fillStyle=IW;
      for(let k=0;k<4;k++){ctx.beginPath();ctx.ellipse(x-9+k*6,y+top+Math.abs(k-1.5)*2,4,2,0,0,6.283);ctx.fill();}ctx.restore();bzTag(x,y+18,'ช้า 30%',IC,fr*.9,11);}
    bzIce(e,now);}}catch(_){}return r;};}
/* any hit that is not the blizzard's own tick breaks the ice at once */
if(BZ){const o=hitEnemy;hitEnemy=function(e,m,x){const f=e&&e._bzF;const r=o.apply(this,arguments);try{if(f&&e._bzF&&!R.bzTickNow&&!e.dead&&(r>0||(x&&x.dot)))bzShatter(e,'hit');}catch(_){}return r;};}
R.bzTxt=c=>{const row=BZC.L[bzLv()];return '❄️ พายุหิมะ วง '+row[1]+' px ที่จุดเล็ง (ไกล '+BZC.RANGE+' px) อยู่ 3 วิ\nทุก '+BZC.DT+' วิ ทุกตัวในวงโดน '+pct(row[0]/BZC.N)+'% ('+BZC.N+' ครั้ง รวม '+pct(row[0])+'%) ช้าลง 30% ดันออก 36 px\nโอกาสแช่แข็ง '+pct(row[2])+'% นาน '+BZC.FZ_T+' วิ (โดนตีอื่นแล้วแตก'+(BZX?' · บอสไม่ติด':'')+')';};

/* p287 r1 — every magic circle uses the one V7 rune band (TEST; order orders/code/ORDER_20261023_rune-rings-all-skills.md, DeaRz 13:10 / 13:15).
   Staff part (inside p276): the cast circle at the hero's feet (every staff cast, the ult linger), the buff cast moment ring, the Magic Focus
   foot ring, the Element Avatar ground circle, a band under a cursed monster, the 5 Rainbow Storm ground rings (same radius, colour, spin and
   draw-in; the V6 ring images carried their own rune text). Ball Lightning and Earth Spikes already used it (r78 / r79).
   ?runering=off = the old circles. */
function rFoot(front,x,fy,now,al,el,rx){const g=POSE?Math.min(1,(now-POSE.t0)/Math.max(.2,POSE.cast||.3)):1,col=(el&&el!=='Neutral'&&COL[el])||VIO;
  if(!front){ctx.save();ctx.globalAlpha=al*.16;ctx.fillStyle='#5a3fd6';ctx.beginPath();ctx.ellipse(x,fy,rx*g,rx*g*RING_Y_CAST,0,0,6.283);ctx.fill();ctx.restore();}
  runeRing(x,fy,rx,col,al*.95,now*.7,0,g,RING_Y_CAST,{half:front?'front':'back'});R.runeSt.foot++;}
function curseGround(now){for(const w of R.curse){const e=w.e;if(!liveE(e))continue;const al=Math.max(0,Math.min(1,(now-w.t0)/.25,(w.end-now)/.4));
  runeRing(e.x,e.y,(e.sz||16)+22,'#b06bff',al*.9,now*.7,0,cl01((now-w.t0)/.35),.5);R.runeSt.curse++;}}
R.runeSt={on:RUNEON,foot:0,curse:0,ult:0,bcast:0,focus:0,avatar:0};

function chainStart(S,ctx,mul,echo){const c=CFG.chain;const hit=new Set();let cur=liveE(S.e)?S.e:null;const list=[];
  let from={pal:true};for(let i=0;i<=c.jumps&&cur;i++){list.push(cur);hit.add(cur);const nx=nearestE(cur.x,cur.y,c.jumpR,hit);cur=nx;}
  const t0=clk();list.forEach((e,i)=>R.segs.push({i,e,prev:i?list[i-1]:null,t0:t0+i*c.gap,done:false,ctx,m:mul*Math.pow(1-c.decay,i),d:S.d,echo,seed:rnd()*9}));}
/* ---------------- ult ---------------- */
let ULT=null;
function ultStart(S,ctx){if(ULT&&ULT.cid===S.id){ULT.ctx=ctx;return;}ULT={x:S.tx,y:S.ty,t0:S.t0,ctx,cid:S.id,stormN:0,beam:false,burst:false,fl:0,v48:!ULTOLD};if(ULT.v48)u48Init();}
function ultTick(now,dt){if(!ULT)return;const c=CFG.ult,t=now-ULT.t0;
  if(ULT.v48){for(const e of enemies)if(e._uh>0)e._uh=Math.max(0,e._uh-5*dt);u48Tick(now,dt);if(t>UT.end)ULT=null;return;}
  if(!ULT.ctx)return;
  if(t>=c.charge&&t<c.beamAt){const want=Math.min(c.stormN,Math.floor((t-c.charge)/((c.beamAt-c.charge)/c.stormN))+1);
    while(ULT.stormN<want){ULT.stormN++;for(const e of enemies){if(!liveE(e))continue;if(Math.hypot(e.x-ULT.x,e.y-ULT.y)>c.r+(e.sz||16)*.5)continue;dmg(e,ULT.ctx,c.storm/c.stormN,{fx:ULT.x,fy:ULT.y});}}
    for(const e of enemies){if(!liveE(e)||isBoss(e))continue;const dx=ULT.x-e.x,dy=ULT.y-e.y,dl=Math.hypot(dx,dy);if(dl>c.pull+(e.sz||16)||dl<26)continue;const v=Math.min(dl-24,110*dt);/* timing fix 3: time-based */
      const nx=e.x+dx/dl*v,ny=e.y+dy/dl*v;if(!(typeof blocked==='function'&&blocked(nx,ny,(e.sz||16)*.5))){e.x=nx;e.y=ny;}}}
  if(t>=c.beamAt+.08&&!ULT.beam){ULT.beam=true;   // timing fix 2: the beam drop takes 0.08 s
    ULT.fl=now;for(const e of enemies){if(!liveE(e))continue;if(Math.hypot(e.x-ULT.x,e.y-ULT.y)>c.r*.5+(e.sz||16)*.5)continue;dmg(e,ULT.ctx,c.beam,{fx:ULT.x,fy:ULT.y});}if(FXON)try{shake(3);}catch(_){}}
  if(t>=c.beamAt+.12&&!ULT.burst){ULT.burst=true;for(const e of enemies){if(!liveE(e))continue;const dx=e.x-ULT.x,dy=e.y-ULT.y,dl=Math.hypot(dx,dy);if(dl>c.r+(e.sz||16)*.5)continue;dmg(e,ULT.ctx,c.burst,{fx:ULT.x,fy:ULT.y});
      if(!isBoss(e)&&dl>1)R.slides.push({e,c:dx/dl,s:dy/dl,v:60/.25,t:.25});}
    if(FXON){try{shake(2);}catch(_){}for(let i=0;i<10;i++){const a=i*.628+rnd()*.3,sp=160+rnd()*120;part({k:'dust',x:ULT.x+Math.cos(a)*20,y:ULT.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*.5-140,life:.7+rnd()*.3,col:i%2?'#8a7a66':'#b8a68c',size:3+rnd()*2,grav:420});}}
    if(FXON)for(let i=0;i<18;i++){const a=i*.349+rnd()*.2,sp=200+rnd()*160,ks=['u9g','u9r','u9v','u9c','u9rb','u9y'];part({k:'sprite',spr:ks[i%6],x:ULT.x,y:ULT.y-20,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*.55-80,life:.9+rnd()*.4,size:heroW()*(.35+rnd()*.25),rot:rnd()*6,vr:(rnd()-.5)*6,grav:120});}}
  if(t>=c.lock+.35&&!ULT.lin){ULT.lin=true;if(FXON)for(let i=0;i<8;i++){const ks=['u9g','u9r','u9v','u9c','u9rb','u9y'];part({k:'sprite',spr:ks[i%6],x:ULT.x+(rnd()-.5)*CFG.ult.r*1.2,y:ULT.y-60-rnd()*120,vx:(rnd()-.5)*20,vy:30+rnd()*25,life:.6,size:heroW()*(.22+rnd()*.12),rot:rnd()*6,vr:(rnd()-.5)*3});}}
  if(t>c.lock+1.0)ULT=null;}
/* ---------------- FX list + particles ---------------- */
function fxAdd(k,x,y,o){R.fx.push(Object.assign({k,x,y,t0:clk(),dur:.4,w:40},o||{}));if(R.fx.length>90)R.fx.shift();}
const PT_MAX=60;
function part(p){if(!FXON)return;p.t0=clk()+(p.delay||0);p.max=p.life;R.pt.push(p);if(R.pt.length>PT_MAX)R.pt.splice(0,R.pt.length-PT_MAX);R.stats.ptPeak=Math.max(R.stats.ptPeak,R.pt.length);}
function glyphPop(el){const now=clk();if(R._gl&&now-R._gl<.5)return;R._gl=now;R.stats.glyph++;fxAdd('glyph',P.x,P.y,{el,dur:.75});}
/* layer A: rune circle + motes pulled into the palm + palm flare */
function castFx(S){S.fxMote=0;}
/* layer B: release crescent + ring pop at the palm */
function releaseFx(S,echo){const pm=palmAt(S.d),el=CFG[S.k].el||'Neutral';
  fxAdd('cres',pm.x,pm.y,{ang:S.ang,dur:.32,el,echo});fxAdd('pop',pm.x,pm.y,{dur:.28,el,echo});
  if(!echo)POSE&&(POSE.relT=clk());}
/* layer D: impact = flash + shards along the travel direction + ground ring */
function impactFx(x,y,el,c,s,k){fxAdd('flash',x,y,{dur:.35,el,w:heroW()*1.6*k});fxAdd('ring',x,y+ (heroH()*.35),{w:heroW()*2.2*k,dur:.4,col:COL[el]||VIO});
  for(let i=0;i<6;i++){const a=Math.atan2(s,c)+(rnd()-.5)*1.1,sp=150+rnd()*170;part({k:'shard',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-40,life:.35,col:i%2?COL[el]||VIO:VIO2,size:3+rnd()*2});}}
/* ---------------- per frame ---------------- */
function tick(dt){const now=clk();try{uHoldTick();}catch(_){}
  if(S){const c=CFG[S.k],t=now-S.t0;
    const lost=!P||P.dead||G.zone!==S.zone||G.state!=='play'||!stfEq()||stunnedNow();
    if(lost){log('cancel',{k:S.k});S=null;POSE=null;ULT=null;}
    else{P.face=S.ang;
      if(FXON&&t<S.cast){S.fxMote+=dt;while(S.fxMote>.035){S.fxMote-=.035;const pm=palmAt(S.d),a=rnd()*6.283,r=heroW()*(1.1+rnd()*.7);
        part({k:'mote',x:pm.x+Math.cos(a)*r,y:pm.y+Math.sin(a)*r*.7,tx:pm.x,ty:pm.y,life:.32,col:rnd()<.5?VIO2:(COL[S.el]||VIO),size:2.4});}}
      if(!S.rel&&t>=S.cast){S.rel=true;
        if(ACT.includes(S.k))release(S,false);
        else{if(S.k==='curse')curseOn(S.e);else buffOn(S.k);if(FXON)fxAdd('bcast',P.x,feetY(),RUNEON?{dur:.55,bk:S.k}:{dur:.55,k:S.k});   /* r80: p287 */}}
      if(t>=S.lock){S=null;if(POSE&&POSE.kind!=='basic')POSE=null;P.atkCd=Math.min(P.atkCd||0,.05);}}}
  if(POSE&&now-POSE.t0>POSE.lock)POSE=null;
  // echo casts (no pose, no MP)
  for(const ec of R.echo){if(ec.done||now<ec.t)continue;ec.done=true;if(!stfEq()||P.dead)continue;release(ec.S,true);}
  R.echo=R.echo.filter(e=>!e.done);
  // buffs: time out / weapon / death
  for(const k in BUFS){const b=BUFS[k];if(!P||P.dead){buffOff(k,'death');continue;}if(!stfEq()){buffOff(k,'weapon');continue;}if(!P.buffs[CFG[k].id]||now>=b.end+.1){buffOff(k,'time');continue;}}
  // projectiles, chain segments, spikes, zones, slides, burn, curse, status
  if(G.state==='play'){for(const p of R.proj){stepP(p,dt);if(p.end==null){p.hist.push({x:p.x+p.ox,y:p.y+p.oy,t:now});if(p.hist.length>40)p.hist.shift();
    if(FXON&&(p.sparkT+=dt)>.045){p.sparkT=0;part({k:'glyph',x:p.x+p.ox,y:p.y+p.oy,vx:(rnd()-.5)*40,vy:-20-rnd()*30,life:.38,col:VIO2,size:2.6});}}}}
  R.proj=R.proj.filter(p=>p.end==null||now-p.end<.35);
  for(const g of R.segs){if(g.done||now<g.t0)continue;g.done=true;if(liveE(g.e)){shit(g.e,g.ctx,g.m,{fx:g.e.x,fy:g.e.y});g.hx=g.e.x;g.hy=eCy(g.e);}}
  R.segs=R.segs.filter(g=>now-g.t0<.42);
  if(BALL&&G.state==='play')ballTick(now,dt);
  if(EARTH&&G.state==='play')esTick(now,dt);
  if(FZ_ON&&G.state==='play')fzTick(now,dt);
  if(BZ&&G.state==='play')bzTick(now,dt);
  const cs=CFG.spikes;
  for(const sp of R.spikes){if(sp.done||now<sp.t0)continue;sp.done=true;if(FXON)for(let i=0;i<4;i++)part({k:'dust',x:sp.x+(rnd()-.5)*20,y:sp.y,vx:(rnd()-.5)*90,vy:-30-rnd()*40,life:.5,col:'#b49470',size:5});
    const ca=Math.cos(sp.ang),sa=Math.sin(sp.ang),seg=cs.len/sp.n;
    for(const e of enemies){if(!liveE(e)||sp.hit.has(e))continue;const dx=e.x-P.x,dy=e.y-P.y,u=dx*ca+dy*sa,v=Math.abs(-dx*sa+dy*ca);
      if(Math.abs(u-sp.d)>seg*.5+(e.sz||16)*.5||v>cs.width/2+(e.sz||16)*.5)continue;
      // first spike under a monster lifts it: the ground (u) is checked against this spike's slice only
      sp.hit.add(e);const r=shit(e,sp.ctx,sp.mul,{fx:sp.x,fy:sp.y});if(r>0&&!isBoss(e)){e.st=e.st||{};e.st.stun=Math.max(e.st.stun||0,cs.lift);e._stfLift={t0:now,dur:cs.lift};}}}
  R.spikes=R.spikes.filter(sp=>now-sp.t0<cs.stay+.5);
  for(const z of R.zones){if(now<z.next||now-z.t0>z.dur)continue;z.next+=1;
    for(const e of enemies){if(!liveE(e))continue;if(Math.hypot(e.x-z.x,e.y-z.y)>z.r+(e.sz||16)*.5)continue;
      if(z.k==='lava')dot(e,z.dps,'burn');else if(z.k==='fground'&&z.ctx){dmg(e,z.ctx,z.mul,{fx:z.x,fy:z.y});}}}
  R.zones=R.zones.filter(z=>now-z.t0<z.dur+.6);
  for(const sl of R.slides){if(sl.t<=0||!liveE(sl.e))continue;const st=Math.min(sl.t,dt);sl.t-=st;const nx=sl.e.x+sl.c*sl.v*st,ny=sl.e.y+sl.s*sl.v*st;if(!(typeof blocked==='function'&&blocked(nx,ny,(sl.e.sz||16)*.5))){sl.e.x=nx;sl.e.y=ny;}}
  R.slides=R.slides.filter(s=>s.t>0);
  for(const e of enemies){const b=e._stfBurn;if(!b)continue;if(!liveE(e)){delete e._stfBurn;continue;}b.next-=dt;
    if(b.next<=0){b.next+=1;b.left--;dot(e,b.dps,'burn');if(FXON)part({k:'ember',x:e.x+(rnd()-.5)*10,y:eCy(e),vx:(rnd()-.5)*30,vy:-60,life:.5,col:COL2.Fire,size:3});if(b.left<=0)delete e._stfBurn;}}
  for(const w of R.curse){if(!liveE(w.e)||now>=w.end)w.dead=1;}R.curse=R.curse.filter(w=>!w.dead);
  ultTick(now,dt);
  R.fx=R.fx.filter(f=>now-f.t0<f.dur);
  const pd=dt;for(const p of R.pt){const u=(now-p.t0)/p.max;if(u<0)continue;if(p.sway)p.x+=Math.sin((now+p.ph)*p.sway)*12*pd;if(p.k==='mote'){p.x+=(p.tx-p.x)*Math.min(1,pd*9);p.y+=(p.ty-p.y)*Math.min(1,pd*9);}else{p.x+=(p.vx||0)*pd;p.y+=(p.vy||0)*pd;if(p.grav)p.vy+=p.grav*pd;else{const dk=Math.pow(.96,pd*60);/* timing fix 3: drag per second, not per frame */p.vx*=dk;p.vy*=dk;}if(p.vr)p.rot+=p.vr*pd;}}
  R.pt=R.pt.filter(p=>now-p.t0<p.max);
  // weapon numbers while the staff module is on
  try{if(WEAPONS.staff.range!==CFG.basic.range)WEAPONS.staff.range=CFG.basic.range;}catch(_){}}
{const o=update;update=function(dt){const r=o.apply(this,arguments);try{tick(+dt||0);basicTick();}catch(e){R.err='tick '+e.message;}return r;};}
/* ---------------- basic attack: violet orb in the element of the last skill ---------------- */
let BA=null;
function basicTick(){if(!BA)return;const now=clk(),t=now-BA.t0;
  if(!stfEq()||P.dead||G.zone!==BA.zone||stunnedNow()||S){BA=null;if(POSE&&POSE.kind==='basic')POSE=null;return;}
  P.face=BA.ang;
  if(!BA.rel&&t>=BA.wind){BA.rel=true;let a=BA.ang;try{const T_=window.TLOCK,e=T_&&T_.e;if(liveE(e)){const a2=Math.atan2(e.y-P.y,e.x-P.x);if(Math.abs(wrapA(a2-a))<.6){a=a2;BA.ang=a;P.face=a;}}}catch(_){}
    const _hw=!!(window.HOLYW&&HOLYW.on);launch({k:'basic',ang:a,d:BA.d,speed:CFG.basic.speed,range:_hw?300:CFG.basic.range,hw:CFG.basic.hw,el:_hw?'Light':R.lastEl});R.stats.basic++;
    if(FXON){const pm=palmAt(BA.d);fxAdd('pop',pm.x,pm.y,{dur:.22,el:R.lastEl,small:1});}if(POSE)POSE.relT=now;}
  if(t>=BA.wind+CFG.basic.follow){BA=null;}}
{const o=basicAttack;basicAttack=function(){
  if(!(R.public&&stfEq()))return o.apply(this,arguments);
  if(S||BA||P.atkCd>0||P.dead||P.dash||(typeof G!=='undefined'&&G.edit)||stunnedNow())return;
  let ang=P.face||0;try{const t=aimPoint(CFG.basic.range);if(t&&isFinite(t.x)&&(t.x!==P.x||t.y!==P.y))ang=Math.atan2(t.y-P.y,t.x-P.x);}catch(e){}
  const ck=castK(),d=dirOf(ang+yaw()),now=clk(),wind=CFG.basic.wind*ck;
  BA={t0:now,ang,d,wind,rel:false,zone:G.zone};P.face=ang;P.atkCd=CFG.basic.period*ck;
  POSE={kind:'basic',t0:now,ang,d,cast:wind,lock:wind+CFG.basic.follow,el:R.lastEl};
  try{G.basicT=now;}catch(e){}};}
/* no walking while casting (same rule as the sword swing / bow shot) */
try{const _up=updPlayer;updPlayer=function(){const lock=!!((S||BA)&&stfEq()&&!P.dash&&!P.dead);const x0=P.x,y0=P.y;const r=_up.apply(this,arguments);
  if(lock&&!P.dash){P.x=x0;P.y=y0;P.vx=0;P.vy=0;}return r;};}catch(e){R.err='updPlayer '+e.message;}
{const o=playerDeath;playerDeath=function(){try{for(const k in BUFS)buffOff(k,'death');S=null;POSE=null;BA=null;ULT=null;}catch(_){}return o.apply(this,arguments);};}
if(typeof loadZone==='function'){const o=loadZone;loadZone=function(){try{S=null;POSE=null;BA=null;ULT=null;for(const a of [R.bz||[],R.earth||[],R.fz||[],R.balls||[],R.proj,R.zones,R.slides,R.fx,R.segs,R.spikes,R.pt,R.echo,R.curse])a.length=0;}catch(_){}return o.apply(this,arguments);};}
/* ---------------- MP: staff max MP +30 %, regen +30 %; mana stream ×1.5 regen ---------------- */
try{const _rc=recalc;recalc=function(){const r=_rc.apply(this,arguments);try{if(R.public&&stfEq()){const f=P.mp/Math.max(1,P.maxMp);P.maxMp=Math.round(P.maxMp*(1+CFG.mp.max));P.mp=Math.min(P.maxMp,Math.round(P.maxMp*f));}}catch(_){}return r;};}catch(e){R.err='recalc '+e.message;}
try{const _mr=C182.mpRegen;if(typeof _mr==='function')C182.mpRegen=function(){let v=_mr.apply(this,arguments);try{if(R.public&&stfEq()){v*=1+CFG.mp.regen;if(BUFS.mana)v*=1+CFG.mana.regen;}}catch(_){}return v;};}catch(e){R.err='regen '+e.message;}
/* ---------------- damage bonuses inside the game's own damage step ---------------- */
{const PS=window.__PASS;
 if(PS&&typeof PS.dmgBonus==='function'){const ob=PS.dmgBonus;PS.dmgBonus=function(e,o,ctx,sub){const r=ob.apply(this,arguments)||[];
   try{if(!ctx||!ctx.stf||!stfEq()||(o&&o.dot)||!e)return r;const add=[];
     if(pon('knowledge'))add.push(CFG.knowledge.dmg);
     if(BUFS.focus)add.push(CFG.focus.dmg);
     if(BUFS.avatar&&ctx.kind==='skill')add.push(CFG.avatar.dmg);
     if(ctx.el&&ctx.el!=='Neutral'&&R.curse.some(w=>w.e===e))add.push(CFG.curse.dmg);
     if(CURX)add.push(CURX);
     return add.length?r.concat(add):r;}catch(er){R.err='bonus '+er.message;return r;}};}
 else R.err='no damage bonus hook (p239)';}
/* ---------------- player hurt: element-proof body + shield ripple / element answer ---------------- */
try{const _hp=hurtPlayer;hurtPlayer=function(raw,src){
  let el=null;try{el=src&&src.elem&&src.elem!=='Neutral'?src.elem:null;}catch(_){}
  if(el&&R.public&&stfEq()&&pon('proof')&&!P.dead){raw*=1-CFG.proof.red;R.stats.proof++;if(FXON)fxAdd('proof',P.x,P.y,{dur:.4,el});}
  const sh0=P.shield||0,hp0=P.hp;const r=_hp.apply(this,arguments);
  try{const b=BUFS.shield;if(b&&stfEq()){const used=Math.max(0,sh0-(P.shield||0));if(used>0){b.left-=used;R.stats.shieldAbs+=used;b.hitT=clk();
      if(src&&liveE(src)&&!isBoss(src)||src&&liveE(src)&&b.el==='Fire'){const c=CFG.shield;
        if(b.el==='Fire'){src._stfBurn={dps:Math.max(1,used*c.burn),left:Math.round(c.burnT*lingerK()),next:1};}
        else if(b.el==='Ice'){src.jdSlow=Math.max(src.jdSlow||0,c.slowT*lingerK());}
        else if(b.el==='Lightning'){src.st=src.st||{};src.st.stun=Math.max(src.st.stun||0,c.stun);}
        if(FXON)fxAdd('flash',src.x,eCy(src),{dur:.3,el:b.el,w:heroW()*1.2});}
      if(b.left<=0)buffOff('shield','broken');}}}catch(er){R.err='shield '+er.message;}
  return r;};}catch(e){R.err='hurt '+e.message;}
/* ---------------- drawing: hero body (stand-in pose) ---------------- */
let bodyImg=null,bodyOk=false;function bodyLoad(){if(bodyImg)return;bodyImg=new Image();bodyImg.onload=()=>{bodyOk=true;};bodyImg.src=D.src.body;}
const OL={map:new Map(),max:60};const OLO=[];for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(dx*dx+dy*dy<=5)OLO.push([dx,dy]);
function olFrame(d,i){const key=d*1000+i;let c=OL.map.get(key);if(c){OL.map.delete(key);OL.map.set(key,c);return c;}
  const r=D.layers.body.rects[ORDER[d]][i];if(!r)return null;const x0=r[4]-3,y0=r[5]-3;
  c=document.createElement('canvas');c.width=r[2]+6;c.height=r[3]+6;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  for(const [dx,dy] of OLO)g.drawImage(bodyImg,r[0],r[1],r[2],r[3],3+dx,3+dy,r[2],r[3]);
  g.globalCompositeOperation='source-in';g.fillStyle='#2B201C';g.fillRect(0,0,c.width,c.height);g.globalCompositeOperation='source-over';
  g.drawImage(bodyImg,r[0],r[1],r[2],r[3],3,3,r[2],r[3]);c.ox=x0;c.oy=y0;OL.map.set(key,c);if(OL.map.size>OL.max)OL.map.delete(OL.map.keys().next().value);return c;}
/* shot clip index (1 + k, k = 0..52) for the pose: charge = draw frames 20..36, release = 37, follow-through 38..52; rest = index 0 */
function poseIdx(now){const p=POSE;if(!p)return 0;const t=now-p.t0;
  if(t<p.cast){const u=t/p.cast;return 1+20+Math.min(16,Math.floor(u*17));}
  if(p.kind==='ult'){const c=CFG.ult;if(t<c.lock-.4)return 1+36+(Math.floor(t*5)%2);const v=cl01((t-(c.lock-.4))/.4);return 1+37+Math.min(15,Math.floor(v*16));}
  const v=cl01((t-p.cast)/Math.max(.05,p.lock-p.cast));return 1+37+Math.min(15,Math.floor(v*16));}
function standing(){const sp=Math.hypot(P.vx||0,P.vy||0);return sp<=25&&!P.dash&&!P.dead&&!((P.hurtT||0)>0);}
{const o=drawPlayerSprite;drawPlayerSprite=function(x,y,bob,fa){
  if(!(R.public&&stfEq()&&G.state==='play')||P.dead)return o.apply(this,arguments);
  bodyLoad();const now=clk(),fy=y+FY;
  const useBody=bodyOk&&(POSE||standing());
  try{auraParts(false,x,fy,now);}catch(e){R.err='aura '+e.message;}
  let r;
  if(useBody){let d,i;if(POSE){d=POSE.d;i=poseIdx(now);}else{d=fa!=null&&isFinite(fa)?dirOf(fa):dirOf((P.face||0)+yaw());i=D.rest;}
    let rx=0,ry=0;if(POSE&&POSE.relT){const u=(now-POSE.relT)/.15;if(u>=0&&u<1){const e=(1-u)*(1-u)*3;rx=-Math.cos(POSE.ang)*e;ry=-Math.sin(POSE.ang)*e;}}
    const c=olFrame(d,i);if(c){ctx.save();ctx.imageSmoothingEnabled=true;ctx.drawImage(c,x+rx+(c.ox-AX)*K,y+ry+(c.oy-AY)*K,c.width*K,c.height*K);ctx.restore();}
    R.stats.bodyDraws=(R.stats.bodyDraws||0)+1;}
  else r=o.apply(this,arguments);
  try{auraParts(true,x,fy,now);}catch(e){R.err='aura '+e.message;}
  return r;};}
/* ---------------- p295 r1: the approved staff animations (DeaRz 24 Oct 02:14 "ท่าทางการใช้คทาเวทอนุมัติแล้วนะ นำเข้ามาได้เลย";
   approved\3d\staff_*_r1, handoffs HANDOFF_staff_*_r1.md) replace the stand-in bow-shot body. Data = window.__STF8 (body + staff composited,
   staff on top, game hero outline baked in, 8 dirs, 24 fps). Clips: basic orb = staff_atk_basic (bolt f11 on the wind-up end), fireball /
   blizzard / ball lightning = cast_shot (release f19 on the cast end), earth spikes = cast_slam (impact f18), rainbow storm = ult_storm
   (charge f0-24, hold loop f30-53, beam f60 on beamAt, brace to the lock end), buffs = cast_buff (peak f12), weapon switch = equip /
   unequip (0.42 s). Standing with the staff = the ready pose (equip f9). Spells start at the staff crystal of the clip's key frame.
   Walk / run / hurt / death still use the loco set (no staff loco set exists). ?stfanim=off = the old stand-in. ---------------- */
const SA=window.__STF8,SAON=!!(SA&&SA.clips&&!/stfanim=off/.test(location.search));R.anim={on:SAON,ver:SA&&SA.ver,eq:null,draws:0,clip:null,dy:21};   // dy (frame px): the staff frames' soles sit 21 px above the game's hero ground line (DeaRz 24 Oct 04:57 "ยืนบนพื้นปกติ")
const SAI={};function saImg(k,si){const key=(SA.__tag||'')+k+si;let m=SAI[key];if(!m){m=SAI[key]=new Image();m.ok=false;m.onload=()=>{m.ok=true;};m.src=SA.clips[k].src[si];}return m;}
if(SAON){for(const k in SA.clips)for(let si=0;si<SA.clips[k].src.length;si++)saImg(k,si);}
function saClip(p){if(!p)return null;if(p.kind==='basic')return 'basic';if(p.kind==='buff')return 'buff';if(p.sk==='ult'||p.kind==='ult')return 'ult';if(p.sk==='spikes')return 'slam';return 'shot';}
function saKey(k){const c=SA.clips[k].key;return k==='basic'||k==='shot'?c.release:k==='slam'?c.impact:k==='buff'?c.peak:k==='ult'?c.beam_hit:k==='equip'?c.ready:c.stowed;}
function saFrame(k,p,now){const n=SA.clips[k].n,t=now-p.t0,ky=saKey(k);
  if(k==='ult'){const cu=CFG.ult,tb=cu.beamAt,pre=7/24;
    if(t<p.cast)return Math.min(24,Math.floor(t/p.cast*25));
    if(t<tb-pre){let f=25+Math.floor((t-p.cast)*24);if(f>53)f=30+((f-30)%24);return f;}
    if(t<tb)return Math.min(59,53+Math.floor((t-(tb-pre))*24));
    return Math.min(n-1,60+Math.floor((t-tb)/Math.max(.05,p.lock-tb)*(n-60)));}
  if(t<p.cast)return Math.min(ky,Math.floor(t/Math.max(.05,p.cast)*(ky+1)));
  return Math.min(n-1,ky+Math.floor((t-p.cast)/Math.max(.05,p.lock-p.cast)*(n-ky)));}
function saNow(now){if(R.anim.eq){const e=R.anim.eq,f=Math.floor((now-e.t0)*24);if(f<SA.clips[e.k].n)return {k:e.k,d:e.d,f};R.anim.eq=null;}
  if(POSE){const k=saClip(POSE);return {k,d:POSE.d,f:saFrame(k,POSE,now)};}return null;}
function saCrystal(d){if(!SAON||!P)return null;const k=saClip(POSE)||'basic',dn=ORDER[d],c=SA.clips[k].crystal[dn];if(!c)return null;const q=c[saKey(k)]||c[0];
  return {x:P.x+(q[0]-AX)*K,y:P.y-(P.jump||0)+(q[1]+R.anim.dy-AY)*K};}
function saDraw(x,y,k,d,f){const c=SA.clips[k],r=c.rects[ORDER[d]]&&c.rects[ORDER[d]][f];if(!r)return false;const im=saImg(k,r[0]);if(!im.ok)return false;
  const s=K/SA.sc;ctx.save();ctx.imageSmoothingEnabled=true;ctx.drawImage(im,r[1],r[2],r[3],r[4],x+(r[5]/SA.sc-AX)*K,y+(r[6]/SA.sc+R.anim.dy-AY)*K,r[3]*s,r[4]*s);ctx.restore();
  R.anim.draws++;R.anim.clip=k+':'+f;return true;}
if(SAON){const o=drawPlayerSprite;drawPlayerSprite=function(x,y,bob,fa){
  try{if(!R.public||G.state!=='play'||P.dead)return o.apply(this,arguments);
    const now=clk(),wt=P.weapon&&P.weapon.t;
    if(R.anim.wt!==undefined&&wt!==R.anim.wt&&(wt==='staff'||R.anim.wt==='staff')){R.anim.eq={k:wt==='staff'?'equip':'unequip',t0:now,d:dirOf((P.face||0)+yaw())};R.anim.sw=(R.anim.sw||0)+1;}
    R.anim.wt=wt;
    const eq=R.anim.eq&&(now-R.anim.eq.t0)*24<SA.clips[R.anim.eq.k].n;
    if(!eq&&!stfEq())return o.apply(this,arguments);
    if(window.DH&&DH.on&&DH.active&&DH.active())return o.apply(this,arguments);
    let st=saNow(now);if(st&&window.__STFCAST&&__STFCAST.takes(st)){const fy0=y+FY;try{auraParts(false,x,fy0,now)}catch(e){}const r0=o.apply(this,arguments);try{auraParts(true,x,fy0,now)}catch(e){}return r0}
    if(!st){if(!standing())return o.apply(this,arguments);st={k:'equip',d:fa!=null&&isFinite(fa)?dirOf(fa):dirOf((P.face||0)+yaw()),f:saKey('equip')};}
    const fy=y+FY;if(stfEq())try{auraParts(false,x,fy,now);}catch(e){R.err='aura '+e.message;}
    let rx=0,ry=0;if(POSE&&POSE.relT){const u=(now-POSE.relT)/.15;if(u>=0&&u<1){const e=(1-u)*(1-u)*3;rx=-Math.cos(POSE.ang)*e;ry=-Math.sin(POSE.ang)*e;}}
    if(!saDraw(x+rx,y+ry,st.k,st.d,st.f))return o.apply(this,arguments);
    if(stfEq())try{auraParts(true,x,fy,now);}catch(e){R.err='aura '+e.message;}
  }catch(e){R.err='anim '+e.message;return o.apply(this,arguments);}};}
/* rune circle under the hero (layer A) + buff auras, split behind / in front of the body */
function runeCircle(front,x,fy,now,al,el,rx){const ry=rx*RING_Y_CAST;if(al<=0)return;if(RUNEON){rFoot(front,x,fy,now,al,el,rx);return;}   /* r80: p287 */
  // violet stays violet on a bright ground: body in normal blending, only the soft glow is added light
  ctx.save();const a0=front?0:Math.PI,a1=front?Math.PI:Math.PI*2,rot=now*(Math.PI*2/3);
  if(!front){ctx.globalAlpha=al*.22;ctx.fillStyle='#5a3fd6';ctx.beginPath();ctx.ellipse(x,fy,rx,ry,0,0,6.283);ctx.fill();}
  for(const [col,w,k,a] of [['#4a2fc0',4.2,1,.75],[VIO,2.4,1,.95],['#e6dcff',1,1,.9],[VIO,1.8,.72,.85],[COL[el]||VIO2,1.4,.86,.8]]){ctx.globalAlpha=al*a;ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.ellipse(x,fy,rx*k,ry*k,0,a0,a1);ctx.stroke();}
  ctx.globalCompositeOperation='lighter';ctx.globalAlpha=al*.35;ctx.strokeStyle=VIO2;ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(x,fy,rx,ry,0,a0,a1);ctx.stroke();ctx.globalCompositeOperation='source-over';
  // glyphs that turn (1 rev / 3 s)
  ctx.fillStyle='#efe8ff';for(let i=0;i<10;i++){const th=i*.6283+rot;if((Math.sin(th)>0)!==front)continue;const gx=x+Math.cos(th)*rx*.86,gy=fy+Math.sin(th)*ry*.86,s=3.2;
    ctx.globalAlpha=al*.95;ctx.beginPath();ctx.moveTo(gx,gy-s);ctx.lineTo(gx+s*.7,gy);ctx.lineTo(gx,gy+s);ctx.lineTo(gx-s*.7,gy);ctx.closePath();ctx.fill();}
  ctx.strokeStyle=VIO2;ctx.lineWidth=1.2;for(let i=0;i<6;i++){const th=i*1.047-rot*1.4;if((Math.sin(th)>0)!==front)continue;const gx=x+Math.cos(th)*rx*.6,gy=fy+Math.sin(th)*ry*.6;ctx.globalAlpha=al*.8;ctx.beginPath();ctx.arc(gx,gy,2.6,0,6.283);ctx.stroke();}
  ctx.restore();}
function bfade(k,now){const b=BUFS[k];if(!b)return 0;return Math.min(1,(now-b.t0)/.3,(b.end-now)/.45+.0001);}
function auraParts(front,x,fy,now){if(!FXON)return;const hw=heroW(),hh=heroH();
  // A: rune circle while a skill or orb is being cast (fades in 0.15 s, out 0.25 s after the lock)
  if(POSE){const t=now-POSE.t0,big=POSE.kind!=='basic',al=Math.min(1,t/.15)*cl01((POSE.lock-t)/.25+.2)*(big?1:.6);
    runeCircle(front,x,fy,now,al,POSE.el,hw*(big?1.75:1.25));
    if(front&&t<POSE.cast){const pm=palmAt(POSE.d),u=t/POSE.cast,fl=t>POSE.cast-.1?1:0;ctx.save();ctx.globalCompositeOperation='lighter';
      glow(pm.x,pm.y,hw*(.25+.35*u)+(fl?hw*.45:0),rgba(fl?'#ffffff':VIO2,.95),.55+.4*u);glow(pm.x,pm.y,hw*(.5+.5*u),rgba(COL[POSE.el]||VIO,.7),.35+.35*u);ctx.restore();}}
  // ult ending linger (fix r2 #7): the foot circle keeps turning until the ult is over, fading in its last 0.4 s
  else if(ULT){const t=now-ULT.t0;runeCircle(front,x,fy,now,cl01((CFG.ult.lock+1.0-t)/.4),'Neutral',hw*1.75);}
  // focus: two violet rings (waist + ground) breathe, glyph motes orbit and rise, pulse every 1.2 s
  let a=bfade('focus',now);if(a>0){const f=A.fx.focus,w=hw*2.6*(1+.035*Math.sin(now*2.4)),cy=fy-hh*.42,split=.5;
    spr('focus',x,cy,w,{ay:.5,y0:front?split:0,y1:front?1:split,alpha:a*.95});
    spr('focus',x,cy,w,{ay:.5,y0:front?split:0,y1:front?1:split,alpha:a*.35*(.5+.5*Math.sin(now*3.1)),add:1});
    orbitMotes(front,x,fy-hh*.45,hw*1.15,now,1.6,6,VIO2,a);risers(front,x,fy,hw,now,a,VIO2);
    if(RUNEON){runeRing(x,fy,hw*1.55,VIO,a*.85,now*.5,0,cl01((now-BUFS.focus.t0)/.4),.5,{half:front?'front':'back'});R.runeSt.focus++;}   /* r80: p287 */
    else{const pu=(now/1.2)%1;if(front){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a*(1-pu)*.7;ctx.strokeStyle=VIO2;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,fy,hw*(.9+pu*1.1),hw*(.9+pu*1.1)*.5,0,0,6.283);ctx.stroke();ctx.restore();}}}
  // element shield: bubble behind (stronger) and in front (faint), sheen arcs turn, ripple + flash when hit
  a=bfade('shield',now);if(a>0){const b=BUFS.shield,k='sh_'+b.el,w=hw*2.5*(1+.025*Math.sin(now*2)),cy=fy-hh*.46,hit=b.hitT?cl01(1-(now-b.hitT)/.35):0;
    spr(k,x,cy,w*(1+hit*.06),{alpha:(front?.24:.8)*a+hit*.3});if(hit>0&&front)spr(k,x,cy,w*(1+hit*.06),{alpha:hit*.7,add:1});
    if(front){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=COL2[b.el];ctx.lineWidth=2.2;for(let i=0;i<2;i++){const st=now*1.7+i*3.14;ctx.globalAlpha=a*.6;ctx.beginPath();ctx.ellipse(x,cy,w*.44,w*.44,0,st,st+1.1);ctx.stroke();}
      if(hit>0){ctx.globalAlpha=hit*.8;ctx.strokeStyle=COL[b.el];ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,cy,w*.46*(1+(1-hit)*.25),w*.46*(1+(1-hit)*.25),0,0,6.283);ctx.stroke();}
      ctx.restore();}
    orbitMotes(front,x,cy+hh*.3,hw*1.1,now,-1.2,5,COL2[b.el],a);}
  // mana stream: the ribbons scroll upward round the hero (two copies, wrap), droplets rise
  if(!MMOLD)manaFx(front,x,fy,now);   // r52 code-drawn Mana Stream (comets)
  a=MMOLD?bfade('mana',now):0;if(a>0&&front){const w=hw*2.7,f=A.fx.mana,hh2=w*f.h/f.w,ph=(now*.55)%1,cy=fy-hh*.5;
    ctx.save();ctx.beginPath();ctx.rect(x-w*.6,cy-hh2*.5,w*1.2,hh2);ctx.clip();
    for(const o of [0,1])spr('mana',x,cy-ph*hh2+o*hh2,w,{alpha:a*.75});
    ctx.restore();risers(front,x,fy,hw,now,a,'#9be8ff');}
  // elemental avatar: ground circle + waist ring + 4 element orbs orbiting (1 turn / 2.4 s), orbs bob, depth split
  a=bfade('avatar',now);if(a>0){const th0=now*(Math.PI*2/2.4);
    if(!front){if(RUNEON){runeRing(x,fy,hw*1.5,'#c9b6ff',a*.9,now*.6,0,cl01((now-BUFS.avatar.t0)/.4),.5);R.runeSt.avatar++;}else gspr('avground',x,fy,hw*3.0,now*.6,{alpha:a*.9});   /* r80: p287 */spr('avring',x,fy-hh*.42,hw*2.4,{y0:0,y1:.5,alpha:a*.85});}
    else spr('avring',x,fy-hh*.42,hw*2.4,{y0:.5,y1:1,alpha:a*.85});
    ELS.forEach((el,i)=>{const th=th0+i*Math.PI/2;if((Math.sin(th)>0)!==front)return;const ox=x+Math.cos(th)*hw*1.25,oy=fy-hh*.42+Math.sin(th)*hw*.42-hh*.18+Math.sin(now*3+i)*4;
      spr('orb_'+el,ox,oy,hw*(.62+.08*Math.sin(th)),{alpha:a});});}
  // echo after-image layer: nothing on the hero
  // knowledge glyph / proof shimmer / buff cast moment drawn from R.fx (front)
}
function orbitMotes(front,x,y,r,now,spd,n,col,a){ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<n;i++){const th=now*spd+i*6.283/n;if((Math.sin(th)>0)!==front)continue;
  const px=x+Math.cos(th)*r,py=y+Math.sin(th)*r*.4;glow(px,py,5,rgba(col,.95),a*.9);}ctx.restore();}
function risers(front,x,fy,hw,now,a,col){if(!front)return;ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const ph=(now*.7+i*.167)%1,px=x+Math.sin(i*2.4+now)*hw*.9,py=fy-ph*heroH()*1.2;glow(px,py,4,rgba(col,.9),a*(1-ph)*Math.min(1,ph*4));}ctx.restore();}
/* ---------------- drawing: world ---------------- */
function trail(p,col){const now=clk(),H=p.hist;if(H.length<2)return;ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
  const nx=-p.s,ny=p.c;for(let j=-2;j<=2;j++){ctx.beginPath();let first=true;
    for(let i=0;i<H.length;i++){const h=H[i],age=(now-h.t)/.3;if(age>1)continue;const tp=1-age,o=j*3.2*tp;const px=h.x+nx*o,py=h.y+ny*o;if(first){ctx.moveTo(px,py);first=false;}else ctx.lineTo(px,py);}
    ctx.strokeStyle=j?col:'#f1eaff';ctx.globalAlpha=(j?.5:.4)*(p.end==null?1:cl01(1-(now-p.end)/.3))*(p.echo?.5:1);ctx.lineWidth=j?2.2:1.4;ctx.stroke();}
  ctx.restore();}
function drawProj(p){const now=clk(),al=(p.end==null?1:cl01(1-(now-p.end)/.3))*(p.echo?.5:1),hx=p.x+p.ox,hy=p.y+p.oy,a=Math.atan2(p.s,p.c),hw=heroW();
  if(FXON)trail(p,p.k==='fireball'?COL.Fire:p.k==='ice'?COL.Ice:(COL[p.el]||VIO2));
  if(p.end!=null)return;
  if(p.echo){ctx.save();ctx.globalCompositeOperation='lighter';glow(hx,hy,hw*1.1,rgba(VIO,.8),.6);ctx.restore();}
  if(p.k==='fireball'){const sp=1+.05*Math.sin(now*28);spr('fball',hx,hy,hw*2.7*sp,{ax:.84,ay:.52,a,alpha:al});spr('fball',hx,hy,hw*2.7*sp,{ax:.84,ay:.52,a,alpha:al*(.25+.2*Math.sin(now*40)),add:1});
    if(FXON){ctx.save();ctx.globalCompositeOperation='lighter';ctx.translate(hx,hy);for(let i=0;i<3;i++){const st=-now*14+i*2.1;ctx.globalAlpha=al*.7;ctx.strokeStyle=i?COL2.Fire:MAG;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,hw*(.32-.07*i),st,st+2.2);ctx.stroke();}ctx.restore();}return;}
  if(p.k==='ice'){const wob=Math.sin(now*30)*.02;spr('ilance',hx,hy,hw*3.4,{ax:.96,ay:.5,a:a+wob,alpha:al});spr('ilance',hx,hy,hw*3.4,{ax:.96,ay:.5,a:a+wob,alpha:al*.35,add:1});
    if(FXON){ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const u=((now*3+i*.25)%1),px=hx-p.c*hw*(1+u*2.6),py=hy-p.s*hw*(1+u*2.6)+Math.sin(i+now*7)*4;glow(px,py,6+u*8,'rgba(230,251,255,.8)',al*(1-u)*.5);}ctx.restore();}return;}
  // basic orb: violet shell + element core, a glyph ring turning round it
  const col=COL[p.el]||VIO2,r0=hw*.28;ctx.save();ctx.globalCompositeOperation='lighter';glow(hx,hy,r0*2.4,rgba(VIO,.8),al*.7);glow(hx,hy,r0*1.3,rgba(col,.95),al);glow(hx,hy,r0*.6,'rgba(255,255,255,.95)',al);
  ctx.translate(hx,hy);ctx.rotate(now*9);ctx.strokeStyle=VIO2;ctx.lineWidth=1.6;ctx.globalAlpha=al*.9;ctx.beginPath();ctx.ellipse(0,0,r0*1.5,r0*.9,0,0,4.4);ctx.stroke();ctx.restore();}
function drawSegs(){const now=clk(),hw=heroW();for(const g of R.segs){if(now<g.t0)continue;const u=(now-g.t0)/.42,al=(u<.6?1:cl01((1-u)/.4))*(g.echo?.5:1);
  let fx,fy;if(g.prev){fx=g.prev.x;fy=eCy(g.prev);}else{const pm=palmAt(g.d);fx=pm.x;fy=pm.y;}
  const tx=g.hx!=null?g.hx:g.e.x,ty=g.hy!=null?g.hy:eCy(g.e),L=Math.hypot(tx-fx,ty-fy),a=Math.atan2(ty-fy,tx-fx);
  const f=A.fx.lseg,w=hw*3.6,len0=w*(f.srcW?1:1),fl=Math.floor((now+g.seed)/.05)%2;
  // stretch along its length only (even thickness bolt): sx = L / drawn width; flicker = vertical flip every 0.05 s
  spr('lseg',fx,fy,w,{ax:0,ay:.5,a,sx:L/w,flipY:!!fl,alpha:al});spr('lseg',fx,fy,w,{ax:0,ay:.5,a,sx:L/w,flipY:!fl,alpha:al*.4,add:1});
  const su=(now-g.t0)/.35;if(su<1){const sc=1.2-.2*cl01(su/.25);spr('lspark',tx,ty,hw*2.0*sc,{alpha:(1-su*su)*(g.echo?.5:1)});}}}
function drawSpikes(){const now=clk(),hw=heroW(),cs=CFG.spikes;
  // back to front so nearer spikes cover farther ones
  const L=R.spikes.filter(sp=>now>=sp.t0).sort((a,b)=>a.y-b.y);
  for(const sp of L){const t=now-sp.t0,w=hw*(1.5+.35*((sp.seed*7)%1));let y0;
    if(t<.1)y0=1-t/.1;else if(t<cs.stay)y0=0;else y0=cl01((t-cs.stay)/.45);   // reveal from the ground up (0.1 s), stand, crumble down
    const al=(t>cs.stay?1-cl01((t-cs.stay)/.5)*.6:1)*(sp.echo?.5:1);
    // a bottom-up reveal = draw only the image rows from y0..1 with the base fixed on the ground
    const f=A.fx.spike,hh=w*f.h/f.w,base=sp.y+4;ctx.save();ctx.beginPath();ctx.rect(sp.x-w,base-hh*(1-y0)-2,w*2,hh*(1-y0)+hh*.12);ctx.clip();
    spr('spike',sp.x,base,w,{ax:.5,ay:.94,alpha:al});ctx.restore();
    if(t<.35){ctx.save();ctx.globalCompositeOperation='source-over';const u=t/.35;ctx.globalAlpha=(1-u)*.55;ctx.strokeStyle='#c9a777';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(sp.x,base,w*(.4+u*.6),w*(.4+u*.6)*.4,0,0,6.283);ctx.stroke();ctx.restore();}}}
/* Lv5 ground fire (fix r2 fireball #2): breathing patch + 6 flame tongues cut from the approved patch (soft-edged, uniform scale), each bobbing,
   flickering and moving to a new spot every 0.5–0.9 s; embers rise all the time; last 0.5 s no new tongues, patch fades, smoke wisps */
const TONG=[[.45,.28,.57,.46],[.68,.5,.775,.71],[.25,.3,.345,.47],[.115,.36,.21,.5],[.8,.39,.885,.55]];let TCV=null;
function tongues(){if(TCV)return TCV;const im=IM.fground;if(!okI(im))return null;const f=A.fx.fground,sw=im.naturalWidth/f.w;TCV=[];
  for(const [x0,y0,x1,y1] of TONG){const w=Math.round((x1-x0)*im.naturalWidth),h=Math.round((y1-y0)*im.naturalHeight),c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
    g.drawImage(im,x0*im.naturalWidth,y0*im.naturalHeight,w,h,0,0,w,h);g.globalCompositeOperation='destination-in';
    g.save();g.translate(w/2,h*.62);g.scale(1,h/w*1.1);const rg=g.createRadialGradient(0,0,0,0,0,w*.5);rg.addColorStop(0,'rgba(0,0,0,1)');rg.addColorStop(.6,'rgba(0,0,0,.85)');rg.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=rg;g.fillRect(-w,-h*2,w*2,h*4);g.restore();TCV.push(c);}
  return TCV;}
function drawFground(z,now,t,al){const end=t>z.dur-.5,rx=z.w*.36,ry=z.w*.1,ph=z.x*.013;
  const ba=.75+.25*(.5+.5*Math.sin(now*7.85+ph)),bs=1+.03*Math.sin(now*5.71+ph+1.7);   // alpha 0.8 s / scale 1.1 s, out of phase
  spr('fground',z.x,z.y,z.w*bs,{alpha:al*ba});spr('fground',z.x,z.y,z.w*bs,{alpha:al*.3*flick(now,.3,ph),add:1});
  if(!FXON)return;const TC=tongues();
  if(TC){if(!z.tg)z.tg=[];const N=6;
    for(let i=0;i<N;i++){let q=z.tg[i];
      if((!q||now>=q.t0+q.life)&&!end){const a=rnd()*6.283,r=Math.sqrt(rnd())*.9;q=z.tg[i]={x:z.x+Math.cos(a)*rx*r,y:z.y+Math.sin(a)*ry*r,t0:now-(q?0:rnd()*.4),life:.5+rnd()*.4,c:(rnd()*TC.length)|0,w:z.w*(.16+rnd()*.08),bob:5+rnd()*5,sd:rnd()*9};}
      if(!q)continue;const v=(now-q.t0)/q.life;if(v<0||v>=1)continue;const fa=Math.min(1,v/.25,(1-v)/.3),c=TC[q.c],h=q.w*c.height/c.width,
        by=-q.bob*(.5+.5*Math.sin(now*9+q.sd)),gs=.85+.15*ease(cl01(v/.3));
      ctx.save();const ta=al*fa*flick(now,.7,q.sd);ctx.globalAlpha=ta;ctx.drawImage(c,q.x-q.w*gs/2,q.y+by-h*gs*.9,q.w*gs,h*gs);ctx.globalAlpha=ta*.45;ctx.globalCompositeOperation='lighter';ctx.drawImage(c,q.x-q.w*gs/2,q.y+by-h*gs*.9,q.w*gs,h*gs);ctx.restore();}}
  const k=Math.floor(now/.2);if(k!==z.bub&&t<z.dur){z.bub=k;for(let i=0;i<(end?1:2+(rnd()<.5));i++){const a=rnd()*6.283,r=Math.sqrt(rnd());
    part({k:'ember',x:z.x+Math.cos(a)*rx*r,y:z.y+Math.sin(a)*ry*r,vx:(rnd()-.5)*10,vy:-(120+rnd()*80),life:.7+rnd()*.3,col:rnd()<.6?'#ffb03a':'#ff6a2a',size:2.6+rnd()*1.4,sway:5+rnd()*3,ph:rnd()*6});}}
  if(end&&!z.smk){z.smk=1;for(let i=0;i<4;i++)part({k:'dust',x:z.x+(i-1.5)*rx*.45,y:z.y-6,vx:(rnd()-.5)*8,vy:-90,life:.9,col:'#6e6660',size:6+rnd()*3,delay:i*.08,fin:1,sway:3,ph:i});}}
function drawGround(){const now=clk(),hw=heroW();try{aimDraw();}catch(_){}if(RUNEON)curseGround(now);   /* r80: p287 */
  for(const z of R.zones){const t=now-z.t0,al=Math.min(1,t/.25)*cl01((z.dur+.5-t)/.5);
    if(z.k==='lava'){spr('lava',z.x,z.y,z.w,{alpha:al*(.85+.15*Math.sin(now*5))});spr('lava',z.x,z.y,z.w,{alpha:al*.25*(.5+.5*Math.sin(now*7.3)),add:1});
      if(FXON&&Math.floor(now*8)!==z.bub){z.bub=Math.floor(now*8);part({k:'ember',x:z.x+(rnd()-.5)*z.w*.6,y:z.y+(rnd()-.5)*z.w*.2,vx:0,vy:-40,life:.45,col:'#ffb03a',size:3});}}
    else if(z.k==='fground')drawFground(z,now,t,al);}
  for(const f of R.fx){if(f.k!=='crack')continue;const u=(now-f.t0)/f.dur,rev=cl01(u*f.dur/.3),al=(u<.6?1:cl01((1-u)/.4))*(f.echo?.5:1),ca=Math.cos(f.ang),sa=Math.sin(f.ang),nx=-sa,ny=ca;
    // green-lit ground crack running out along the spike line (revealed over 0.3 s, fades out)
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';for(const [col,w,a2,cmp] of [['#2f6a2a',5,.55,'source-over'],['#5bd36a',3,.9,'lighter'],['#c8f5b0',1.2,.9,'lighter']]){
      ctx.globalCompositeOperation=cmp;ctx.globalAlpha=al*a2;ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();
      for(let i=0;i<=24;i++){const u2=i/24;if(u2>rev)break;const d=30+u2*(f.len-30),j=Math.sin(i*2.7+f.seed)*9+Math.sin(i*1.3+f.seed*2)*5;const px=f.x+ca*d+nx*j,py=f.y+sa*d+ny*j*.6;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}
      ctx.stroke();}ctx.restore();}
  for(const f of R.fx){if(f.k!=='magnet')continue;if(!MMOLD){magGround(f,now);continue;}const u=(now-f.t0)/f.dur,al=Math.min(1,u*5)*cl01((1-u)/.35);gspr('magnet',f.x,f.y,f.w,-now*(Math.PI*2/1.5),{alpha:al});
    ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<8;i++){const ph=((now*1.4+i/8)%1),th=i*.785+now*2,r=f.w*.5*(1-ph);glow(f.x+Math.cos(th)*r,f.y+Math.sin(th)*r*.45,4,'rgba(255,240,140,.95)',al*ph);}ctx.restore();}
  if(ULT){drawUltGround(now);drawStormSide(false,now);}}
/* ult ground rings (fix r3, DeaRz 06:13 "วงตรงพื้นมันเป็นวงรี"): code-drawn true circles (RING_Y = 1), 4 rings outer → inner red / yellow / green / blue,
   each: glow + bright line with white core + thin inner line + rune diamonds; turning alternately, breathing out of phase, 2 glints at 2× spin;
   open from r 0 one by one 0.06 s apart (overshoot 1.05), close by widening to 1.15 while fading over 0.5 s */
const RING_Y=1.0,RING_Y_CAST=.5;   // ult rings / hero cast circle squash (kept at its r43 value)
const URG=[[140,'#ff4a2a',6.283/2.4,12],[115,'#ffd93a',-6.283/1.8,10],[90,'#5bd36a',6.283/1.4,10],[65,'#5aa8ff',-6.283/1.1,8]];   // fix r4: r 230/190/150/110 × 0.6
function ringOpen(v){return v<=0?0:v<.7?1.05*ease(v/.7):1.05-.05*cl01((v-.7)/.3);}
function drawUltGround(now){const c=CFG.ult,t=now-ULT.t0,te=c.lock+.4,fo=cl01((te+.5-t)/.5),ex=1+.15*cl01((t-te)/.5);
  ctx.save();ctx.lineCap='round';
  URG.forEach(([R0,col,sp,nt],i)=>{const v=cl01((t-i*.06)/.28);if(v<=0)return;const r=R0*ringOpen(v)*ex,ry=r*RING_Y,br=.85+.15*Math.sin(now*4.2+i*1.7),al=cl01(v*2.5)*fo*br,rot=now*sp;if(r<2)return;
    const E=(rr,w,cl,a,cmp)=>{ctx.globalCompositeOperation=cmp||'source-over';ctx.globalAlpha=a;ctx.strokeStyle=cl;ctx.lineWidth=w;ctx.beginPath();ctx.ellipse(ULT.x,ULT.y,rr,rr*RING_Y,0,0,6.283);ctx.stroke();};
    E(r,14,col,al*.35,'lighter');E(r,4.5,'#2B201C',al*.35);E(r,3,col,al);E(r,1,'#ffffff',al*.9,'lighter');E(r-6,1.2,col,al*.85);
    ctx.fillStyle=col;for(let k=0;k<nt;k++){const th=rot+k*6.283/nt,x=ULT.x+Math.cos(th)*(r-3),y=ULT.y+Math.sin(th)*(r-3)*RING_Y,d=3.2;   // rune diamonds between the lines
      ctx.globalCompositeOperation='source-over';ctx.globalAlpha=al;ctx.save();ctx.translate(x,y);ctx.rotate(th);ctx.beginPath();ctx.moveTo(d*1.4,0);ctx.lineTo(0,d*.8);ctx.lineTo(-d*1.4,0);ctx.lineTo(0,-d*.8);ctx.closePath();ctx.fill();ctx.restore();}
    if(FXON){ctx.globalCompositeOperation='lighter';for(let j=0;j<2;j++){const th=rot*2+j*Math.PI+i;for(let q=0;q<5;q++){const tq=th-Math.sign(sp)*q*.06;glow(ULT.x+Math.cos(tq)*r,ULT.y+Math.sin(tq)*ry,7-q,'rgba(255,255,255,.95)',al*(1-q*.18));}}}});
  ctx.restore();
  if(t>c.charge-.2){const u=cl01((t-c.charge+.2)/.3);ctx.save();ctx.globalCompositeOperation='lighter';glow(ULT.x,ULT.y,90,'rgba(201,184,255,.8)',.3*u*fo*(.7+.3*Math.sin(now*6)));ctx.restore();}}
/* storm (fix r3, DeaRz 06:13 "เป็นกรวยเกินไป อยากให้เป็นแบบรูปที่ 2"): a loose column of 54 thin glowing rainbow arcs, each orbiting (2.2–3.8 turns/s)
   and rising (120–220 px/s) on its own, respawning at the base; r 70 → 120 (middle) → 110 (top), h 300, top 35 % melts away; ~30 % long low sweeps
   + a ground skirt (r 150) make the bright swirl at the base; back part of each arc drawn behind hero and monsters (0.45), front part in front.
   Fade-out: no respawn, spin slows to 1 turn/s, arcs rise off and fade. No storm image is used. */
const UMK=['u9g','u9r','u9v','u9c','u9rb','u9y'];
const RIB=[[255,40,40],[255,140,0],[255,230,0],[40,230,60],[0,230,255],[40,90,255],[170,60,255]];   // fix r4: full saturation
/* fix r4 (art 06:33 "stacked hula-hoops"): tighter column r 45 → 85 → 75, ry 0.45, 76 arcs 40–110° that climb 40–90 px along their length,
   tilted 20–40° with the spin, 3 → 9 → 3 px with a 60 % white core and 0.45 glow; 4 long low base sweeps (120–160°, r 90–120) replace the skirt */
const SH=300,NARC=76,SRY=.45;
function sRad0(h){return h<.5?45+40*Math.sin(h/.5*Math.PI/2):85-10*((h-.5)/.5);}
function newArc(o,low){const sk=low===2,lg=!sk&&rnd()<.3;o.a=rnd()*6.283;o.w=(2.2+rnd()*1.6)*6.283;o.vh=sk?0:120+rnd()*100;
  o.h=sk?rnd()*.03:lg?rnd()*.3:0;o.len=(sk?120+rnd()*40:lg?90+rnd()*20:40+rnd()*70)*Math.PI/180;o.c=(rnd()*7)|0;o.tilt=(20+rnd()*20)*Math.PI/180;o.climb=sk?10:40+rnd()*50;
  o.jit=(rnd()-.5)*(sk?0:12);o.R=sk?90+rnd()*30:0;o.sk=sk;o.t0=0;o.life=sk?.6+rnd()*.4:0;return o;}
function stormState(now){const c=CFG.ult,t=now-ULT.t0;if(t<c.charge||t>=c.beamAt+.5)return null;const tau=t-c.charge,fs=c.beamAt-c.charge,v=cl01(tau/.35),fv=cl01((tau-fs)/.5);
  return {tau,v,al:cl01(v*2)*(1-fv),fv,fade:tau>fs,core:tau*4*6.283};}
function stormStep(now,st){const U=ULT;if(U.sLast===now)return;const dt=U.sLast==null?0:Math.min(.05,now-U.sLast);U.sLast=now;
  if(!U.arcs){U.arcs=[];for(let i=0;i<NARC;i++){const o=newArc({},i<4?2:0);if(!o.sk)o.h=rnd();U.arcs.push(o);}}
  const ws=st.fade?1-st.fv*(1-1/2.9):1;   // spin eases toward 1 turn/s
  for(const o of U.arcs){o.a+=o.w*(st.fade?Math.max(6.283,o.w*ws)/o.w:1)*dt;
    if(o.sk){o.t0+=dt;if(o.t0>o.life&&!st.fade)newArc(o,2);continue;}
    o.h+=o.vh/SH*dt*(st.fade?1.6:1);if(o.h>1&&!st.fade)newArc(o,0);}}
function sAxis(st,h){const q=(st.tau-h*.25)*6.283/.6;return [ULT.x+Math.cos(q)*6,ULT.y-h*SH+Math.sin(q)*6*SRY];}
function drawStorm(front,now){const st=stormState(now);if(!st||st.al<=0)return;stormStep(now,st);
  ctx.save();ctx.lineCap='round';
  if(front){// core: soft white-violet glow column + fast thin white streaks (4 turns/s)
    // fix r5: soft core, no straight edges: 40 thin slices up the (wandering) axis, each a horizontal gradient 0.55 at the centre → 0 at ±40 px,
    // vertical fade 0 at the ground lip → full by 15 % → 0 over the top 35 %
    ctx.globalCompositeOperation='lighter';const NS=40,top=st.v;
    for(let k=0;k<NS;k++){const h0=k/NS*top,h1=(k+1)/NS*top,hm=(h0+h1)/2,vf=Math.min(1,hm/.15)*cl01((1-hm)/.35);if(vf<=0)continue;
      const [x0,y0]=sAxis(st,h0),[x1,y1]=sAxis(st,h1),xm=(x0+x1)/2,g=ctx.createLinearGradient(xm-40,0,xm+40,0);
      g.addColorStop(0,'rgba(230,220,255,0)');g.addColorStop(.3,'rgba(236,228,255,.45)');g.addColorStop(.5,'rgba(250,246,255,1)');g.addColorStop(.7,'rgba(236,228,255,.45)');g.addColorStop(1,'rgba(230,220,255,0)');
      ctx.globalAlpha=.55*st.al*vf;ctx.fillStyle=g;ctx.fillRect(xm-40,y1,80,y0-y1+.6);}
    ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineWidth=1.4;
    for(let j=0;j<6;j++){const h0=((st.tau*1.3+j/6)%1)*.75*st.v;ctx.globalAlpha=.6*st.al*Math.sin(Math.min(1,h0/.75)*Math.PI);ctx.beginPath();
      for(let k=0;k<=6;k++){const a=st.core+j*1.05+k*.22,r=22,[cx,cy]=sAxis(st,h0+k*.01);const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*SRY;k?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}}
  // arcs: 16 points each, drawn as continuous strokes per side (no beading): taper 2 → 7 → 2 px built from 3 nested spans;
  // each arc also climbs 18–40 px along its length (rising helix), plus its ±10° tilt, so the streaks read as swirling wind
  const M=16;
  for(const o of ULT.arcs){if(!o.sk&&(o.h<0||o.h>1||o.h>st.v))continue;const h=o.sk?0:o.h,fa=o.sk?Math.min(1,o.t0/.15,(o.life-o.t0)/.2):Math.min(1,h/.06)*cl01((1-h)/.35);
    const a0=st.al*fa*(front?1:.45);if(a0<=.01)continue;const R=(o.sk?o.R:sRad0(h))+o.jit,[cx,cy]=sAxis(st,h),[r0,g0,b0]=RIB[o.c],climb=o.climb,tl=Math.sin(o.tilt)*.6;
    const pt=k=>{const u=k/M,th=o.a+o.len*u;return [cx+Math.cos(th)*R,cy+Math.sin(th)*R*SRY+Math.cos(th)*R*tl-u*climb,Math.sin(th)];};
    const P=[];for(let k=0;k<=M;k++)P.push(pt(k));
    const run=(k0,k1,lw,cl,al,cmp)=>{ctx.globalCompositeOperation=cmp;ctx.globalAlpha=al;ctx.strokeStyle=cl;ctx.lineWidth=lw;ctx.beginPath();let on=false;
      for(let k=k0;k<k1;k++){const q0=P[k],q1=P[k+1];if(((q0[2]+q1[2])/2>=0)!==front){on=false;continue;}if(!on){ctx.moveTo(q0[0],q0[1]);on=true;}ctx.lineTo(q1[0],q1[1]);}ctx.stroke();};
    const col='rgb('+r0+','+g0+','+b0+')',dc=front?col:'rgb('+(r0*.75|0)+','+(g0*.75|0)+','+(b0*.75|0)+')';
    run(2,M-2,18,col,a0*.45,'lighter');
    run(0,M,3,dc,a0,'source-over');run(3,M-3,6,dc,a0,'source-over');run(6,M-6,9,dc,a0,'source-over');
    if(front){run(1,M-1,1.8,'#ffffff',a0*.85,'lighter');run(4,M-4,3.6,'#ffffff',a0*.8,'lighter');run(6,M-6,5.4,'#ffffff',a0*.75,'lighter');}}
  // debris on the column, rising and thrown out at the top
  ctx.globalCompositeOperation='source-over';
  for(let j=0;j<12;j++){const hp=((st.tau*.9+j/12)%1)*st.v,a=st.tau*2.6*6.283*1.1+j*2.1+hp*2.2*6.283;if((Math.sin(a)>=0)!==front)continue;
    const out=hp>.6?1+(hp-.6)*1.5:1,r=sRad0(hp)*.75*out,[cx,cy]=sAxis(st,hp),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*SRY,da=st.al*Math.min(1,hp/.1)*cl01((.9-hp)/.3)*(front?1:.5);
    if(da<=0)continue;ctx.globalAlpha=da;
    if(j%3===0){ctx.fillStyle='#4f9a3c';ctx.save();ctx.translate(x,y);ctx.rotate(a*1.7);ctx.beginPath();ctx.ellipse(0,0,5,2.4,0,0,6.283);ctx.fill();ctx.restore();}
    else if(j%3===1){ctx.fillStyle='#9a876c';ctx.beginPath();ctx.arc(x,y,2.6,0,6.283);ctx.fill();}
    else spr(UMK[j%6],x,y,heroW()*.2,{a:a,alpha:da});}
  ctx.restore();}
function ultMotes(front,t0,now,gs,al){const c=CFG.ult,hw=heroW(),rx=140*gs,rise=220*gs;
  for(let i=0;i<20;i++){const ph=((now-t0)/1.0+i/20)%1,th=ph*6.283*1.5+i*.9;if((Math.sin(th)>0)!==front)continue;
    const a=al*Math.min(1,ph/.15,(1-ph)/.25)*(front?1:.6);if(a<=0)continue;spr(UMK[i%6],ULT.x+Math.cos(th)*rx,ULT.y-ph*rise+Math.sin(th)*50*gs,hw*.26,{a:now*2+i,alpha:a});}}
function drawStormSide(front,now){if(!ULT)return;const st=stormState(now);if(!st)return;drawStorm(front,now);ultMotes(front,ULT.t0+CFG.ult.charge,now,.3+.7*ease(st.v),st.al);}
function drawUltUp(now){if(!ULT)return;const c=CFG.ult,t=now-ULT.t0,hw=heroW();
  drawStormSide(true,now);
  // a thin line flashes down from the sky 0.1 s before the beam
  if(t>=c.beamAt-.1&&t<c.beamAt+.04){const v=cl01((t-c.beamAt+.1)/.1);ctx.save();ctx.globalCompositeOperation='lighter';const top=ULT.y-1400,yb=top+(ULT.y-top)*ease(v);
    const g=ctx.createLinearGradient(0,top,0,yb);g.addColorStop(0,'rgba(201,184,255,0)');g.addColorStop(1,'rgba(255,255,255,.95)');ctx.strokeStyle=g;ctx.lineWidth=2.5;ctx.globalAlpha=.9;ctx.beginPath();ctx.moveTo(ULT.x,top);ctx.lineTo(ULT.x,yb);ctx.stroke();ctx.restore();}
  // sky beam drops in (top→bottom reveal 0.08 s), core flickers 0.85↔1 every 0.05 s, outer glow copy fades first, then the beam over 0.4 s
  if(t>=c.beamAt&&t<c.lock+.3){const u=cl01((t-c.beamAt)/.08),out=cl01((c.lock+.3-t)/.4),gl=cl01((c.lock-.1-t)/.3),f=A.fx.u7,w=c.r*1.1,hh=w*f.h/f.w,fk=Math.floor(now/.05)%2?.85:1;
    // fix r5: no clip rectangle (its moving edge showed as a hard line): the beam slides down from above into place over 0.08 s
    const dy=-hh*(1-ease(u));spr('u7',ULT.x,ULT.y+hh*.04+dy,w,{ay:.96,alpha:out*fk*Math.min(1,u*3)});
    spr('u7',ULT.x,ULT.y+hh*.04+dy,w*1.06,{ay:.96,alpha:gl*.45*(.7+.3*Math.sin(now*14))*Math.min(1,u*3),add:1});}
  // shockwave expands 0.5→1.3 over 0.45 s and fades
  if(t>=c.beamAt+.1&&t<c.beamAt+.55){const u=cl01((t-c.beamAt-.1)/.45);gspr('u8',ULT.x,ULT.y,c.r*2*(.5+.8*ease(u)),now*.8,{alpha:(1-u*u)});}}
function drawFx(f){const now=clk(),u=(now-f.t0)/f.dur;if(u<0||u>1)return;const hw=heroW(),hh=heroH();
  if(f.k==='fexp'){const t=u*f.dur,eb=f.echo?.5:1,
      // burst: uniform 0.55→1.08 in 0.10 s, settle to 1.0 by 0.18 s (fix r2 fireball #1)
      g=t<.1?.55+.53*ease(t/.1):t<.18?1.08-.08*((t-.1)/.08):1,al=(u<.35?1:cl01((1-u)/.65))*eb,fl=flick(now,.85,f.x*.01);
    if(!f.ph){f.ph=1;if(FXON){for(let i=0;i<12;i++){const a=-Math.PI*(.1+.8*rnd()),sp=150+rnd()*130;part({k:'ember',x:f.x+(rnd()-.5)*f.w*.2,y:f.y-f.w*.1,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:.55+rnd()*.25,col:i%3?'#ffb03a':'#ff6a2a',size:2.2+rnd()*1.4,grav:340});}
      for(let i=0;i<4;i++)part({k:'dust',x:f.x+(i-1.5)*f.w*.12,y:f.y-f.w*.18,vx:(rnd()-.5)*14,vy:-95,life:.8,col:'#6e6660',size:6+rnd()*3,delay:.12+i*.04,fin:1,sway:3,ph:i});}}
    spr('fexp',f.x,f.y,f.w*g,{ay:.7,a:.1745*u,alpha:al*fl});                       // copy 1 turns +10°
    spr('fexp',f.x,f.y,f.w*g*.96,{ay:.7,a:.2618-.349*u,alpha:al*.5*flick(now,.8,f.y*.01+3)});   // copy 2 at 15°, turning −20°
    spr('fexp',f.x,f.y,f.w*g,{ay:.7,alpha:al*.25*fl,add:1});
    {const v=cl01(t/.35);if(v<1){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(1-v)*.9*eb;const rr=f.w*.5*(.6+.7*ease(v));   // thin fire ring 0.6→1.3
      ctx.strokeStyle=COL.Fire;ctx.lineWidth=3.2*(1-v)+1;ctx.beginPath();ctx.ellipse(f.x,f.y+6,rr,rr*.42,0,0,6.283);ctx.stroke();
      ctx.strokeStyle='#ffb03a';ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(f.x,f.y+6,rr*.88,rr*.37,0,0,6.283);ctx.stroke();ctx.restore();}}
    return;}
  if(f.k==='frozen'){const e=f.e,x=e&&!e.dead?e.x:f.x,y=e&&!e.dead?e.y:f.y,t=u*f.dur,end=f.dur-.45,w=f.w;
    if(t<end){// three crystal clusters grow up from the ground, 0.2 s apart (columns of the approved mark, bottom-up reveal)
      for(let i=0;i<3;i++){const g=cl01((t-i*.2)/.25);if(g<=0)continue;const fA=A.fx.frozen,hh2=w*fA.h/fA.w,cols=[[0,.36],[.36,.64],[.64,1]][i===0?1:i===1?0:2];
        ctx.save();ctx.beginPath();ctx.rect(x-w*.5+w*cols[0],y+hh2*.25-hh2*g,w*(cols[1]-cols[0]),hh2*g+2);ctx.clip();spr('frozen',x,y,w*(1+.02*Math.sin(now*3)),{ay:.75,alpha:1});ctx.restore();}}
    else{const v=(t-end)/.45;spr('frozen',x,y,w,{ay:.75,alpha:1-v});if(!f.sh){f.sh=1;for(let i=0;i<9;i++)part({k:'shard',x,y:y-10,vx:Math.cos(i*.7)*200,vy:Math.sin(i*.7)*120-90,life:.45,col:COL.Ice,size:4});}}
    return;}
  if(f.k==='melt'||f.k==='shatter'){const g=.7+.3*ease(cl01(u*2.5));spr(f.k,f.x,f.y,f.w*g,{alpha:1-u*u});spr(f.k,f.x,f.y,f.w*g,{alpha:(1-u)*.3,add:1});return;}
  if(f.k==='magnet'){if(!MMOLD)magFront(f,now);return;}if(f.k==='crack')return;
  if(f.k==='glyph'){const el=f.el,g=.6+.4*ease(cl01(u*3));spr('orb_'+el,f.x,f.y-hh*1.35-u*14,hw*.6*g,{alpha:u<.7?1:(1-u)/.3});return;}
  ctx.save();ctx.globalCompositeOperation='lighter';
  if(f.k==='cres'){const col=COL[f.el]||VIO2,a=f.ang,r0=hw*.75*(1+.4*ease(u)),al=(1-u)*(f.echo?.5:1);ctx.translate(f.x,f.y);ctx.rotate(a);ctx.lineCap='round';
    for(let i=0;i<5;i++){const off=(i-2)*.05,rr=r0*(1-Math.abs(i-2)*.08);ctx.globalAlpha=al*(i===2?1:.6);ctx.strokeStyle=i===2?'#ffffff':i%2?VIO2:col;ctx.lineWidth=i===2?2.4:1.8;
      ctx.beginPath();ctx.arc(-rr*.55+u*hw*.5,0,rr,-0.61+off,0.61+off);ctx.stroke();}}
  else if(f.k==='pop'){const r=hw*(f.small?.25:.35)*(.4+1.2*ease(u)),al=(1-u)*(f.echo?.5:1);ctx.globalAlpha=al;ctx.strokeStyle=VIO2;ctx.lineWidth=2.4;ctx.beginPath();ctx.arc(f.x,f.y,r,0,6.283);ctx.stroke();
    ctx.strokeStyle=COL[f.el]||VIO;ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(f.x,f.y,r*.7,0,6.283);ctx.stroke();glow(f.x,f.y,r*.9,'rgba(255,255,255,.9)',al*.6);}
  else if(f.k==='flash'){glow(f.x,f.y,f.w*(.5+.5*ease(u)),rgba(COL2[f.el]||'#ffffff',.95),(1-u)*.9);}
  else if(f.k==='ring'){const r=f.w*.5*(.3+.7*ease(u));ctx.globalAlpha=(1-u)*.8;ctx.strokeStyle=f.col||VIO;ctx.lineWidth=2.6;ctx.beginPath();ctx.ellipse(f.x,f.y,r,r*.45,0,0,6.283);ctx.stroke();}
  else if(f.k==='proof'){const col=COL[f.el]||VIO2;ctx.globalAlpha=(1-u)*.75;ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(f.x,feetY()-hh*.45,hw*(.75+.15*u),hh*(.62+.1*u),0,0,6.283);ctx.stroke();glow(f.x,feetY()-hh*.45,hw*1.1,rgba(col,.5),(1-u)*.5);}
  else if(f.k==='bcast'){// buff cast moment: column of light + ring burst from the feet
    const cg=ctx.createLinearGradient(0,f.y-hh*1.6,0,f.y);cg.addColorStop(0,'rgba(201,184,255,0)');cg.addColorStop(1,'rgba(201,184,255,.8)');ctx.globalAlpha=(1-u)*.8;ctx.fillStyle=cg;ctx.fillRect(f.x-hw*.45*(1-u*.5),f.y-hh*1.6,hw*.9*(1-u*.5),hh*1.6);
    if(RUNEON){runeRing(f.x,f.y,hw*(1.35+.2*ease(u)),VIO,1-cl01((u-.55)/.45),clk()*.8,0,cl01(u/.3),.5);R.runeSt.bcast++;}   /* r80: p287 */
    else{const r=hw*(.6+1.6*ease(u));ctx.globalAlpha=(1-u);ctx.strokeStyle=VIO2;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(f.x,f.y,r,r*.5,0,0,6.283);ctx.stroke();}}
  ctx.restore();}
function drawPt(){const now=clk();if(!R.pt.length)return;ctx.save();ctx.globalCompositeOperation='lighter';
  for(const p of R.pt){const u=(now-p.t0)/p.max;if(u<0)continue;const al=p.fin?Math.min(1,u*5)*(1-u):1-u;
    if(p.k==='sprite'){ctx.globalCompositeOperation='source-over';spr(p.spr,p.x,p.y,p.size,{a:p.rot,alpha:al});ctx.globalCompositeOperation='lighter';continue;}
    if(p.k==='shard'){ctx.globalAlpha=al;ctx.fillStyle=p.col;const a=Math.atan2(p.vy||0,p.vx||1),s=p.size;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(a);ctx.beginPath();ctx.moveTo(s*1.8,0);ctx.lineTo(0,s*.6);ctx.lineTo(-s*1.2,0);ctx.lineTo(0,-s*.6);ctx.closePath();ctx.fill();ctx.restore();continue;}
    if(p.k==='dust'){ctx.globalCompositeOperation='source-over';ctx.globalAlpha=al*.5;ctx.fillStyle=p.col;ctx.beginPath();ctx.arc(p.x,p.y,p.size*(1+u),0,6.283);ctx.fill();ctx.globalCompositeOperation='lighter';continue;}
    glow(p.x,p.y,p.size*2.2,rgba(p.col,.95),al);}
  ctx.restore();}
function drawCurse(){const now=clk(),hw=heroW();for(const w of R.curse){const e=w.e;if(!liveE(e))continue;const s=e.sz||16,al=Math.max(0,Math.min(1,(now-w.t0)/.25,(w.end-now)/.4));
  const cy=e.y-s*2.3-29-hw*.55+Math.sin(now*2.6)*4;spr('curse',e.x,cy,hw*1.7*(1+.03*Math.sin(now*3.3)),{alpha:al});spr('curse',e.x,cy,hw*1.7,{alpha:al*.3*(.5+.5*Math.sin(now*4)),add:1});
  ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const th=now*2.2+i*1.571;glow(e.x+Math.cos(th)*hw*.95,cy+Math.sin(th)*hw*.3,4.5,'rgba(201,184,255,.95)',al);}ctx.restore();}}
function drawLinger(){if(ELB){drawElBadges();return;}if(!pon('linger'))return;const now=clk(),hw=heroW();ctx.save();ctx.globalCompositeOperation='lighter';
  for(const e of enemies){const st=e._stfEl;if(!liveE(e)||!st||now>=st.end)continue;const col=COL[st.el],y=e.y-(e.sz||16)*.9;
    for(let i=0;i<3;i++){const th=now*2.6+i*2.094;glow(e.x+Math.cos(th)*(e.sz||16)*1.1,y+Math.sin(th)*(e.sz||16)*.4,4,rgba(col,.95),.9);}}
  ctx.restore();}
if(typeof drawRaidTele==='function'){const o=drawRaidTele;drawRaidTele=function(){const r=o.apply(this,arguments);try{if(R.public){drawGround();ballGround();esGround();bzGround();fzGround();}}catch(e){R.err='ground '+e.message;}return r;};}else R.err='no ground hook';
{const o=drawParts;drawParts=function(){const r=o.apply(this,arguments);
  try{if(R.public){drawSpikes();for(const p of R.proj)drawProj(p);drawSegs();ballDraw();esDraw();bzDraw();fzDraw();drawUltUp(clk());for(const f of R.fx)drawFx(f);drawCurse();drawLinger();drawPt();
    if(ULT&&ULT.fl){const u=(clk()-ULT.fl)/(ULT.v48?.15:.2);if(u<1){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.08*(1-u);ctx.fillStyle='#ffffff';ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.restore();}}}}catch(e){R.err='draw '+e.message;}
  return r;};}
/* ---------------- weapon skill window: the staff line ---------------- */
const tl=' (ค่าทดลอง)';
const DESC={
  fireball:c=>c.fzOn&&R.fzTxt?R.fzTxt(c)+tl:'🔥 ลูกไฟพุ่งชนแล้วระเบิดวง '+c.r+' px '+pct(c.mul)+'% ของลูกพลัง ติดไหม้ '+pct(c.burn)+'%/วิ '+c.burnT+' วิ\nระยะ '+c.range+' px'+tl,
  ice:c=>c.bzOn&&R.bzTxt?R.bzTxt(c)+tl:'❄️ หอกน้ำแข็งพุ่งเป็นแนว '+c.len+' px ทะลุทุกตัว '+pct(c.mul)+'%\nช้าลง '+pct(c.slow)+'% '+c.slowT+' วิ'+tl,
  chain:c=>c.ballOn&&R.ballTxt?R.ballTxt(c)+tl:'⚡ สายฟ้ากระโดด '+c.jumps+' ครั้ง (รวม '+(c.jumps+1)+' ตัว) ตัวแรก '+pct(c.mul)+'% ลดตัวละ '+pct(c.decay)+'%\nระยะ '+c.range+' px กระโดดไกล '+c.jumpR+' px'+tl,
  spikes:c=>c.areaOn&&R.esTxt?R.esTxt(c)+tl:'🪨 หนามหินพุ่งเป็นแนว '+c.len+' px กว้าง '+c.width+' px '+pct(c.mul)+'%\nมอนชะงัก/ลอย '+c.lift+' วิ (บอสไม่ติด)'+tl,
  ult:c=>'🌈 วงรัศมี '+c.r+' px: พายุ '+pct(c.storm)+'% + ลำแสง '+pct(c.beam)+'% (กลางวง) + ระเบิด '+pct(c.burst)+'%\nดูดมอน '+c.pull+' px · ร่าย '+c.charge+' วิ ล็อกท่า '+c.lock+' วิ · ไม่มีธาตุ'+tl,
  focus:c=>'บัฟ '+c.dur+' วิ: ดาเมจเวท +'+pct(c.dmg)+'%, ร่ายเร็ว +'+pct(c.cs)+'%'+tl,
  shield:c=>'โล่ดับดาเมจ '+pct(c.hp)+'% ของ HP สูงสุด '+c.dur+' วิ ตามธาตุสกิลล่าสุด\nไฟ=ผู้ตีไหม้ น้ำแข็ง=ช้า สายฟ้า=ช็อต ดิน=โล่หนา ×'+c.earthX+tl,
  curse:c=>'สาปมอน 1 ตัว (ระยะ '+c.range+' px) รับดาเมจธาตุ +'+pct(c.dmg)+'% นาน '+c.dur+' วิ'+tl,
  mana:c=>'บัฟ '+c.dur+' วิ: ฟื้น MP ×'+(1+c.regen)+' · ไม่ใช้ MP'+tl,
  avatar:c=>'บัฟ '+c.dur+' วิ: ทุกสกิลคทาแรงขึ้น +'+pct(c.dmg)+'%'+tl,
  knowledge:c=>'ดาเมจเวท +'+pct(c.dmg)+'% (ทั้งลูกพลังและสกิลคทา)'+tl,
  alchemist:c=>'ปฏิกิริยาธาตุแรงขึ้น +'+pct(c.react)+'%\n(ละลาย / แตกกระจาย / ลาวา / แม่เหล็ก)'+tl,
  echo:c=>'สกิลโจมตีมีโอกาส '+pct(c.chance)+'% ร่ายซ้ำฟรี แรง '+pct(c.mul)+'%\n(ไม่รวมไม้ตาย)'+tl,
  linger:c=>'ไหม้ / ช้า / ชะงัก / สถานะธาตุ นานขึ้น +'+pct(c.dur)+'%'+tl,
  proof:c=>'รับดาเมจจากมอนที่มีธาตุ −'+pct(c.red)+'%'+tl};
const okNow=()=>!R.err||/^(dmg|dot|bonus|draw|ground|shield)/.test(R.err);
function mkSkill(k){const c=CFG[k],act=ACT.includes(k)||BUF.includes(k);
  return {k:'stf_'+k,bk:k,name:c.name,type:act?'active':'passive',key:c.key||'',row:c.row,ok:()=>R.public&&okNow(),icon:()=>ICON(k),desc:()=>DESC[k](c),
    cost:act?()=>({mp:c.mp,cd:c.cd}):undefined,cdId:c.id,start:act?()=>cast(k):undefined};}
const SKB={};for(const k of [...ACT,...BUF,...PAS])SKB[k]=mkSkill(k);
W.lines.staff={title:'ทักษะสายคทา',cols:[{name:'โจมตี',skills:ACT.map(k=>SKB[k])},{name:'บัฟ / สนับสนุน',skills:BUF.map(k=>SKB[k])},{name:'พาสซีฟ',skills:PAS.map(k=>SKB[k])}]};
R.skills=SKB;
try{const dm=document.getElementById('wskDm');if(dm)new MutationObserver(()=>{if(stfEq()&&/ตอนถือดาบ/.test(dm.textContent))dm.textContent=dm.textContent.replace('ตอนถือดาบ','ตอนถือคทา');}).observe(dm,{childList:true,characterData:true,subtree:true});}catch(_){}
/* ---------------- keys (staff held): J U B N R attack 1-5, O Y buff 1-2 ---------------- */
const KEYMAP={};for(const k of [...ACT,...BUF])if(CFG[k].key)KEYMAP[CFG[k].key.toLowerCase()]=k;
addEventListener('keydown',e=>{try{if(!R.public||!stfEq()||e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;if(W.open||G.win||G.state!=='play'||(typeof ED!=='undefined'&&ED.on))return;
  const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;
  const k=KEYMAP[(e.key||'').toLowerCase()];if(!k)return;e.stopImmediatePropagation();e.preventDefault();cast(k);}catch(er){R.err='key '+er.message;}},true);
/* ---------------- skill slots while a staff is held (own map) ---------------- */
const SLOT_K=['1','2','3','4','5','6','q','e','r','f'];
const SS=R.slots={map:{},assign:null};
try{SS.map=JSON.parse(localStorage.getItem('lanternfall_staffSlots_v1')||'{}')||{};}catch(e){SS.map={};}
for(const i in SS.map)if(!SKB[SS.map[i]]||SKB[SS.map[i]].type!=='active'||+i<0||+i>9||(SLOT_K[+i]==='r'&&SS.map[i]!=='ult'))delete SS.map[i];
SS.save=()=>{try{localStorage.setItem('lanternfall_staffSlots_v1',JSON.stringify(SS.map));}catch(e){}};
SS.find=k=>{for(const i in SS.map)if(SS.map[i]===k)return +i;return -1;};
let msgEl=null;function say(t,ms){msgEl=msgEl||document.getElementById('wsAssignMsg');if(!msgEl)return;msgEl.textContent=t;msgEl.style.display='block';clearTimeout(say.t);if(ms)say.t=setTimeout(()=>{msgEl.style.display='none';},ms);}
SS.start=k=>{SS.assign=k;document.body.classList.add('wsAssign');document.body.classList.toggle('wsAsNoR',k!=='ult');say('แตะช่องสกิลที่ต้องการวาง "'+CFG[k].name+'" · แตะนอกช่องเพื่อยกเลิก',0);};
SS.stop=()=>{SS.assign=null;document.body.classList.remove('wsAssign','wsAsNoR');if(msgEl)msgEl.style.display='none';};
SS.set=(i,k)=>{if(SLOT_K[i]==='r'&&k!=='ult'){say('ช่อง R สงวนไว้ให้ "'+CFG.ult.name+'" (คีย์ R) เลือกช่องอื่นสำหรับ "'+CFG[k].name+'"',3200);return false;}
  const o=SS.find(k);if(o>=0)delete SS.map[o];SS.map[i]=k;SS.save();repaint(true);return true;};
SS.clear=i=>{delete SS.map[i];SS.save();repaint(true);};
try{const win=document.getElementById('wWpnSk');if(win)win.addEventListener('click',e=>{if(!stfEq()||!e.target.closest('#wskAs'))return;
  const sel=win.querySelector('.row.sel');const kk=sel&&sel.dataset.k;const s=kk&&Object.values(SKB).find(x=>x.k===kk);if(!s||s.type!=='active'||!unl(CFG[s.bk]))return;
  e.stopImmediatePropagation();e.preventDefault();try{if(G.win==='wWpnSk')closeWin();}catch(_){}SS.start(s.bk);},true);}catch(e){R.err='assign '+e.message;}
setInterval(()=>{try{const as=document.getElementById('wskAs');if(!as||!stfEq()||!W.open)return;const sel=document.querySelector('#wWpnSk .row.sel');const kk=sel&&sel.dataset.k;const s=kk&&Object.values(SKB).find(x=>x.k===kk);
  if(s&&s.type==='active'){const at=SS.find(s.bk),t=at>=0?'ช่อง '+SLOT_K[at].toUpperCase()+' · ย้าย':'ใส่ช่องสกิล';if(as.textContent!==t)as.textContent=t;}}catch(_){}},250);
const slotEl=e=>e.target&&e.target.closest&&e.target.closest('#bar .slot[data-i]:not(.pot),#tSkills .tsk[data-ti]');
const slIdx=el=>+(el.dataset.i!==undefined?el.dataset.i:el.dataset.ti);
for(const ev of ['pointerdown','click','contextmenu'])addEventListener(ev,e=>{try{
  if(SS.assign){if(ev==='contextmenu')return;e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();if(ev==='pointerdown')return;const el=slotEl(e);if(el){if(SS.set(slIdx(el),SS.assign))SS.stop();}else SS.stop();return;}
  const el=slotEl(e);if(!el||!el.dataset.ss||!stfEq())return;
  if(ev==='contextmenu'){e.preventDefault();e.stopImmediatePropagation();SS.clear(slIdx(el));return;}
  e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();
  if(ev==='pointerdown'){if(!aimStart(el.dataset.ss,e,el))cast(el.dataset.ss);if(el.classList.contains('tsk')){el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),350);}}
}catch(er){R.err='slot '+er.message;}},true);
addEventListener('keydown',e=>{try{if(e.key==='Escape'&&SS.assign){SS.stop();return;}
  if(!R.public||!stfEq()||W.open||G.win||G.state!=='play'||e.repeat)return;const k=(e.key||'').toLowerCase(),i=SLOT_K.indexOf(k);if(i<0||k==='r')return;const sk=SS.map[i];if(!sk)return;
  if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))return;e.stopImmediatePropagation();e.preventDefault();cast(sk);}catch(er){R.err='slot key '+er.message;}},true);
function paint(el,k){if(el.dataset.ss===k)return;const im=ICON(k),ki=el.querySelector('kbd'),kt=ki?ki.textContent:'';
  el.innerHTML='<img alt="'+CFG[k].name+'" src="'+im+'"><div class="cd"></div><div class="cdt"></div>'+(kt?'<kbd>'+kt+'</kbd>':'');
  el.classList.add('wsk');el.dataset.ss=k;delete el.dataset.ws;delete el.dataset.bs;if(el.classList.contains('tsk'))el.setAttribute('data-sk','ss:'+k);else el.removeAttribute('data-sk');el.removeAttribute('draggable');el.title=CFG[k].name;}
let wasStf=false,sig='';
function repaint(force){const on=R.public&&stfEq();
  if(!on){if(wasStf){wasStf=false;sig='';try{buildBar();}catch(_){}try{if(typeof buildTouchSkills==='function')buildTouchSkills();}catch(_){}for(const el of document.querySelectorAll('[data-ss]')){delete el.dataset.ss;el.classList.remove('wsk');}}return;}
  const s=JSON.stringify(SS.map);if(force||!wasStf||s!==sig){wasStf=true;sig=s;try{buildBar();}catch(_){}}
  for(const el of document.querySelectorAll('#bar .slot[data-i],#tSkills .tsk[data-ti]')){const i=slIdx(el),k=SS.map[i];if(k&&CFG[k])paint(el,k);}}
function paintAll(){try{if(R.public&&stfEq())for(const el of document.querySelectorAll('#bar .slot[data-i],#tSkills .tsk[data-ti]')){const k=SS.map[slIdx(el)];if(k&&CFG[k])paint(el,k);}}catch(_){}}
try{const _bb=buildBar;buildBar=function(){const r=_bb.apply(this,arguments);paintAll();return r;};}catch(e){R.err='bar hook '+e.message;}
try{const _bt=buildTouchSkills;buildTouchSkills=function(){const r=_bt.apply(this,arguments);paintAll();return r;};}catch(e){R.err='touch hook '+e.message;}
setInterval(()=>{try{if(SS.assign&&(G.win||G.state!=='play'))SS.stop();repaint(false);if(!(R.public&&stfEq()))return;
  for(const el of document.querySelectorAll('.slot.wsk[data-ss]')){const k=el.dataset.ss,c=CFG[k],ok=unl(c);el.classList.toggle('wsoff',!ok);const cd=(P.cds&&P.cds[c.id])||0,cdE=el.querySelector('.cd'),tE=el.querySelector('.cdt');
    if(cdE)cdE.style.setProperty('--cd',ok&&cd>0?Math.min(1,cd/c.cd):0);if(tE)tE.textContent=ok&&cd>0?(cd>=10?String(Math.ceil(cd)):cd.toFixed(1)):'';el.classList.toggle('nomp',P.mp<c.mp);el.classList.toggle('wson',!!(BUFS[k]||(S&&S.k===k)||(c.holy&&R.hon&&R.hon(k))));}
}catch(e){R.err='slot tick '+e.message;}},120);
/* ---------------- r51 ROV-style aim (DeaRz 11:54 "เมื่อกดสกิลเราจะมีวงสกิลบอกว่าจะไปตรงนั้น เหมือนเกม ROV"):
   press and hold a skill slot → range circle around the hero + where the skill will land; drag to aim (110 px drag = full range);
   release = cast there. A plain tap (drag < 14 px) casts at the auto target as before. Drag back onto the same slot and release = cancel.
   Buffs cast on press (nothing to aim). Keyboard keys cast at once as before. ?skaim=off = r50 behaviour ---------------- */
const AIMON=!/skaim=off/.test(location.search),AIMK={fireball:1,ice:1,chain:1,spikes:1,ult:1,curse:1,h_seal:1,h_sr:1},AIMPX=110,AIMTAP=14;
const AIM=R.aim={on:null,stats:{aimed:0,tap:0,cancel:0}};
function aimRange(k){const c=CFG[k];return k==='ult'?c.castRange:(k==='ice'&&c.bzOn)?420:(k==='spikes'&&c.areaOn)?420:(k==='ice'||k==='spikes')?c.len:(k==='chain'&&c.ballOn)?450:c.range;}
function aimCur(A){const k=A.k,rg=aimRange(k),area=k==='ult'||(k==='chain'&&!CFG.chain.ballOn)||(k==='spikes'&&CFG.spikes.areaOn)||(k==='ice'&&CFG.ice.bzOn)||(k==='fireball'&&CFG.fireball.fzOn)||k==='curse'||!!(CFG[k]&&CFG[k].aimArea),dx=A.mx-A.sx,dy=A.my-A.sy,dl=Math.hypot(dx,dy);
  if(dl>=AIMTAP){const y=yaw(),cs=Math.cos(-y),sn=Math.sin(-y),wx=(dx*cs-dy*sn)/dl,wy=(dx*sn+dy*cs)/dl,f=area?Math.min(1,dl/AIMPX):1;
    return {x:P.x+wx*rg*f,y:P.y+wy*rg*f,ang:Math.atan2(wy,wx),drag:true};}
  const a=(k==='fireball'&&CFG.fireball.fzOn)?fzAim(rg):aimAt(rg);let x=a.pt.x-P.x,y=a.pt.y-P.y;const d=Math.hypot(x,y)||1;const f=area?Math.min(1,rg/d):rg/d;   // area skills: the auto point (clamped to reach); line skills: full length toward it
  return {x:P.x+x*f,y:P.y+y*f,ang:a.ang,drag:false};}
function aimStart(k,ev,el){if(!AIMON||!AIMK[k]||!R.public||!stfEq())return false;const c=CFG[k];
  if(!unl(c)||(P.cds&&P.cds[c.id]>0)||P.mp<c.mp||S||P.dead)return false;   // let cast() show the usual refusal
  AIM.on={k,pid:ev.pointerId,sx:ev.clientX,sy:ev.clientY,mx:ev.clientX,my:ev.clientY,el,t0:clk(),maxd:0};document.body.classList.add('stfAiming');return true;}
function aimEnd(ev,cancel){const A=AIM.on;if(!A)return;AIM.on=null;document.body.classList.remove('stfAiming');if(cancel){AIM.stats.cancel++;return;}
  const q=aimCur(A);
  const back=A.maxd>=AIMTAP&&A.el&&(()=>{const r=A.el.getBoundingClientRect();return ev.clientX>=r.left&&ev.clientX<=r.right&&ev.clientY>=r.top&&ev.clientY<=r.bottom;})();
  if(back){AIM.stats.cancel++;try{textAt(P.x,P.y-62,CFG[A.k].name+': ยกเลิก','#d8c9ff',13);}catch(_){}return;}
  if(q.drag){AIM.stats.aimed++;R.aimOv={x:q.x,y:q.y};try{cast(A.k);}finally{R.aimOv=null;}}else{AIM.stats.tap++;cast(A.k);}}
addEventListener('pointermove',e=>{const A=AIM.on;if(!A||e.pointerId!==A.pid)return;A.mx=e.clientX;A.my=e.clientY;A.maxd=Math.max(A.maxd,Math.hypot(A.mx-A.sx,A.my-A.sy));e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();},true);
for(const t of ['pointerup','pointercancel'])addEventListener(t,e=>{const A=AIM.on;if(!A||e.pointerId!==A.pid)return;e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();aimEnd(e,t==='pointercancel'||G.state!=='play'||!stfEq());},true);
addEventListener('keydown',e=>{if(AIM.on&&e.key==='Escape'){aimEnd(e,true);e.stopImmediatePropagation();}},true);
function aimDraw(){const A=AIM.on;if(!A)return;if(P.dead||!stfEq()){AIM.on=null;document.body.classList.remove('stfAiming');return;}
  const k=A.k,c=CFG[k],rg=aimRange(k),q=aimCur(A),now=clk(),pu=.85+.15*Math.sin(now*8);ctx.save();ctx.globalCompositeOperation='source-over';
  // range circle around the hero (true world circle = real reach)
  ctx.globalAlpha=1;ctx.fillStyle='rgba(123,92,255,.10)';ctx.strokeStyle='rgba(230,220,255,.55)';ctx.lineWidth=2;ctx.setLineDash([10,7]);ctx.beginPath();ctx.arc(P.x,P.y,rg,0,6.283);ctx.fill();ctx.stroke();ctx.setLineDash([]);
  const col=COL[c.el||'Neutral']||VIO2;
  if((k==='fireball'&&!c.fzOn)||(k==='ice'&&!c.bzOn)||(k==='spikes'&&!c.areaOn)||(k==='chain'&&c.ballOn)){const w=k==='chain'?(BL.L[ballLv()][1])*BL.KY*2:k==='spikes'?c.width:k==='ice'?c.hw*2:c.hw*2+8,L=k==='fireball'?Math.min(rg,Math.hypot(q.x-P.x,q.y-P.y)||rg):rg;
    ctx.translate(P.x,P.y);ctx.rotate(q.ang);ctx.fillStyle=rgba(col,.22*pu);ctx.strokeStyle=rgba(col,.9);ctx.lineWidth=2;ctx.beginPath();ctx.rect(14,-w/2,L-14,w);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(L+14,0);ctx.lineTo(L-6,-w/2-8);ctx.lineTo(L-6,w/2+8);ctx.closePath();ctx.fillStyle=rgba(col,.85);ctx.fill();
    if(k==='fireball'){ctx.beginPath();ctx.arc(L,0,c.r,0,6.283);ctx.fillStyle=rgba(col,.14*pu);ctx.fill();ctx.strokeStyle=rgba(col,.7);ctx.stroke();}}
  else{const r=(c.holy&&c.r)?c.r:k==='ult'?c.r:(k==='ice'&&c.bzOn)?bzR():(k==='spikes'&&c.areaOn)?esR():(k==='fireball'&&c.fzOn)?fzR():36;if(!(k==='fireball'&&c.fzOn)){ctx.beginPath();ctx.moveTo(P.x,P.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle='rgba(230,220,255,.5)';ctx.lineWidth=2;ctx.stroke();}
    ctx.beginPath();if((k==='spikes'&&c.areaOn)||(k==='ice'&&c.bzOn)||(k==='fireball'&&c.fzOn))ctx.ellipse(q.x,q.y,r,r*ES.KY,0,0,6.283);else ctx.arc(q.x,q.y,r,0,6.283);ctx.fillStyle=rgba(col,.20*pu);ctx.fill();ctx.strokeStyle=rgba(col,.95);ctx.lineWidth=3;ctx.stroke();
    if(k!=='ult'&&!(k==='spikes'&&c.areaOn)&&!(k==='ice'&&c.bzOn)&&!(k==='fireball'&&c.fzOn)){const e=nearestE(q.x,q.y,k==='curse'?90:70);if(e){ctx.beginPath();ctx.arc(e.x,e.y,(e.sz||16)+10,0,6.283);ctx.strokeStyle='#fff4b0';ctx.lineWidth=2.5;ctx.stroke();}}}
  ctx.restore();}
/* ---------------- r51: skills only in the bottom skill bar (DeaRz 11:51 "ใช้แค่ในช่องสกิลแถบล่าง"): the floating sword / bow / staff skill
   buttons are hidden (?skbar=on brings them back). An empty slot map gets the default layout in memory only (nothing written until the
   player moves a skill): 1–4 attacks, R ultimate, 5 6 Q E F buffs ---------------- */
const SKBAR=/skbar=on/.test(location.search);
if(!SKBAR){const st=document.createElement('style');st.id='p276skbar';st.textContent='#wsBar,#bsBar,#sfBar{display:none!important}';document.head.appendChild(st);}
const SLDEF={stf:{0:'fireball',1:'ice',2:'chain',3:'spikes',8:'ult',4:'focus',5:'shield',6:'curse',7:'mana',9:'avatar'},
  bow:{0:'pierce',1:'rain',2:'leap',3:'fan',8:'lantern',4:'focus',5:'wind',6:'poison',7:'weak',9:'stance'},
  sw:{0:'sk1',1:'sk2',2:'atk3',3:'atk4',8:'atk5',4:'buf3',5:'buf4',6:'buf5'}};
function slotDefaults(){if(SKBAR)return;const fill=(o,d)=>{if(o&&o.map&&!Object.keys(o.map).length)Object.assign(o.map,d);};
  fill(SS,SLDEF.stf);try{fill(window.BSK&&BSK.slots,SLDEF.bow);}catch(_){}try{fill(window.__WSK&&__WSK.slots,SLDEF.sw);}catch(_){}
  try{buildBar();}catch(_){}try{if(typeof buildTouchSkills==='function')buildTouchSkills();}catch(_){}}
setTimeout(slotDefaults,0);
/* ---------------- skill buttons (same look and place as the sword's / bow's) ---------------- */
const css=document.createElement('style');css.id='p276';css.textContent='#sfBar{position:fixed;z-index:57;display:none;flex-wrap:wrap;justify-content:flex-end;width:284px;gap:6px;right:16px;bottom:172px;pointer-events:auto;touch-action:manipulation}'
 +'#sfBar button{position:relative;overflow:hidden;width:52px;height:52px;padding:0;border:0;background:none;border-radius:7px;cursor:pointer}'
 +'#sfBar button img{display:block;width:100%;height:100%;pointer-events:none;-webkit-user-drag:none;border-radius:7px}'
 +'#sfBar button .k{position:absolute;z-index:2;left:4px;top:3px;padding:0 4px;border-radius:5px;background:rgba(0,0,0,.66);color:#e6dcff;font-size:9px;font-weight:600}'
 +'#sfBar button .cd{position:absolute;z-index:1;left:0;right:0;bottom:0;background:rgba(0,0,0,.62);height:0;border-radius:0 0 7px 7px}'
 +'#sfBar button .ct{position:absolute;z-index:2;inset:0;display:flex;align-items:center;justify-content:center;font-size:15px;color:#fff;text-shadow:0 1px 2px #000}'
 +'#sfBar button.nomp{opacity:.55}#sfBar button.on{box-shadow:0 0 0 2px #7b5cff,0 0 10px rgba(123,92,255,.8)}'
 +'#stfTestBtn{position:fixed;left:14px;top:calc(300px + env(safe-area-inset-top,0px));z-index:57;min-width:44px;min-height:40px;padding:4px 10px;border-radius:12px;border:1px solid rgba(160,130,255,.65);background:rgba(16,10,44,.85);color:#e6dcff;font:700 13px sans-serif}'
 +'@media (max-width:900px){#sfBar{width:262px}#sfBar button{width:44px;height:44px}}@media (hover:none){#sfBar button .k{display:none}}';
document.head.appendChild(css);
const bar=document.createElement('div');bar.id='sfBar';
bar.innerHTML=[...ACT,...BUF].map(k=>'<button type="button" data-b="'+k+'" title="'+CFG[k].name+'" aria-label="'+CFG[k].name+'"><img alt="" src="'+ICON(k)+'"><span class="k">'+(CFG[k].key||'')+'</span><span class="cd"></span><span class="ct"></span></button>').join('');
document.body.appendChild(bar);
for(const ev of ['pointerdown','pointerup','mousedown','mouseup','touchstart','touchend','click'])bar.addEventListener(ev,e=>e.stopPropagation());
bar.addEventListener('click',e=>{const b=e.target.closest('button[data-b]');if(b)cast(b.dataset.b);});
setInterval(()=>{try{const show=R.public&&G.state==='play'&&!G.win&&stfEq()&&!P.dead&&!(typeof ED!=='undefined'&&ED.on);bar.style.display=show?'flex':'none';if(!show)return;
  if(innerWidth<=900){bar.style.right='8px';bar.style.top='56px';bar.style.bottom='auto';}else{bar.style.right='16px';bar.style.bottom='172px';bar.style.top='auto';}
  for(const b of bar.children){const k=b.dataset.b,c=CFG[k],ok=unl(c);b.style.display=ok?'':'none';if(!ok)continue;const cd=(P.cds&&P.cds[c.id])||0;
    b.querySelector('.cd').style.height=cd>0?Math.min(100,cd/c.cd*100)+'%':'0';b.querySelector('.ct').textContent=cd>0?(cd>=10?Math.ceil(cd):cd.toFixed(1)):'';b.classList.toggle('nomp',P.mp<c.mp);b.classList.toggle('on',!!(BUFS[k]||(S&&S.k===k)));}
}catch(e){R.err='bar tick '+e.message;}},120);
try{const wn=document.getElementById('wWpnSk');if(wn){const fixIc=()=>{if(!stfEq())return;for(const el of wn.querySelectorAll('.row[data-k^="stf_"] .ic.sk'))el.classList.remove('sk');const d=wn.querySelector('#wskDIc.sk');if(d)d.classList.remove('sk');};
  new MutationObserver(fixIc).observe(wn,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});}}catch(e){R.err='icons '+e.message;}
/* ---------------- TEST: staff ↔ sword switch (inventory + the game's equipItem). The test staff takes the sword's attack value (balance model) ---------------- */
R.testStaff=function(){let i=P.inv.findIndex(it=>it&&it.kind==='wpn'&&it.t==='staff'&&/TEST/.test(it.name||''));
  if(i<0){const w=P.weapon&&P.weapon.t!=='fist'?P.weapon:null,lvl=(w&&w.lvl)||P.lvl||1,rar=(w&&w.rar)||0;const it=makeWeapon('staff',lvl,rar),ref=makeWeapon('sword',lvl,rar);it.atk=ref.atk;it.name='Test Staff (TEST)';P.inv.push(it);i=P.inv.length-1;log('staff item',{lvl,atk:it.atk});}
  return i;};
R.toggle=function(){try{if(!P||P.dead)return;
  if(stfEq()){const i=P.inv.findIndex(it=>it&&it.kind==='wpn'&&it.t==='sword'&&(!R.swordUid||it.uid===R.swordUid));const j=i>=0?i:P.inv.findIndex(it=>it&&it.kind==='wpn'&&it.t==='sword');
    if(j<0){textAt(P.x,P.y-62,'ไม่พบดาบในกระเป๋า','#d8c9ff',13);return;}equipItem(j);}
  else{if(P.weapon&&P.weapon.t==='sword')R.swordUid=P.weapon.uid;equipItem(R.testStaff());}
  S=null;POSE=null;BA=null;log('switch',{to:P.weapon&&P.weapon.t});try{recalc();}catch(e){}}catch(e){R.err='toggle '+e.message;}};
let tbtn=null;setInterval(()=>{try{if(!R.public||G.state!=='play'){if(tbtn)tbtn.style.display='none';return;}
  if(!tbtn){tbtn=document.createElement('button');tbtn.id='stfTestBtn';tbtn.type='button';for(const ev of ['pointerdown','pointerup','mousedown','touchstart'])tbtn.addEventListener(ev,e=>e.stopPropagation());
    tbtn.addEventListener('click',e=>{e.stopPropagation();R.toggle();});document.body.appendChild(tbtn);}
  tbtn.style.display='';const t=stfEq()?'⚔ สลับเป็นดาบ':'🔮 สลับเป็นคทา';if(tbtn.textContent!==t)tbtn.textContent=t;}catch(_){}},400);
/* ---------------- public with the sword skills (p240 public mode) ---------------- */
const pv=setInterval(()=>{if(W.public){R.public=true;clearInterval(pv);}},300);
const UM1SRC=["assets/3fa7cd12a4ef667c.webp", "assets/db1262217e1156a5.webp", "assets/79ffd27f9f46bfb9.webp", "assets/c8fb10c085a5ba0d.webp", "assets/84786be11a5895cd.webp", "assets/5149470001f8f02f.webp"];
const UM3SRC=["assets/e510c1b2bb9fc393.webp", "assets/785a87c85a7c31fb.webp", "assets/7288868f98764ea8.webp", "assets/2320cc590921011e.webp"];
/* ---------------- r52/r53 (order staff-mana-magnet-redesign, DeaRz demo "ok ผ่าน" 11:55): Mana Stream buff + Magnet reaction, code-drawn,
   ported from art/skills/staff/vfx_redesign_mana_magnet/index.html (manaUpdate/manaDraw/cometDraw, magUpdate/magDraw).
   Demo scale: mana × heroH()/60 (demo hero ≈ 60 px), magnet × magnetR/121 (demo R 121 = game 220). Ground squash .5 as in the demo.
   No images: the b7 'mana' strip and the spinning 'magnet' sprite are no longer drawn. ?mmfx=old = r51 look ---------------- */
const MMOLD=/mmfx=old/.test(location.search),MK=.5;
/* r54: painted pieces (DeaRz ChatGPT M1 rocks + M3 mana, art PASS 15:15; uniform scale only, longest side 64): ?mmart=off = r53 code-drawn pieces */
const MMART=!/mmart=off/.test(location.search),mimg=s=>{const i=new Image();i.src=s;return i;},mok=i=>i&&i.complete&&i.naturalWidth>0,UM1=UM1SRC.map(mimg),UM3=UM3SRC.map(mimg);
function mpiece(im,x,y,w,rot,a){if(a<=0)return false;const h=w*im.naturalHeight/im.naturalWidth;ctx.globalAlpha=mmc(a,0,1);if(rot){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.drawImage(im,-w/2,-h/2,w,h);ctx.restore();}else ctx.drawImage(im,x-w/2,y-h/2,w,h);return true;}
const mmc=(v,a,b)=>v<a?a:v>b?b:v,mseg=(t,a,b)=>mmc((t-a)/(b-a),0,1),meO=x=>1-Math.pow(1-mmc(x,0,1),3),meI=x=>Math.pow(mmc(x,0,1),2.2),mr=(a,b)=>a+rnd()*(b-a);
const MGL={};function mglc(col){if(MGL[col])return MGL[col];const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,col);r.addColorStop(.35,col+'aa');r.addColorStop(1,col+'00');g.fillStyle=r;g.fillRect(0,0,64,64);return MGL[col]=c;}
function mgl(x,y,s,col,a){if(a<=0||s<=0)return;ctx.globalAlpha=mmc(a,0,1);ctx.drawImage(mglc(col),x-s/2,y-s/2,s,s);}
function mpoly(p){ctx.beginPath();ctx.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)ctx.lineTo(p[i][0],p[i][1]);ctx.stroke();}
/* ---- Mana Stream: state follows the buff (t = time since cast; ends with the buff) ---- */
let MM=null;
function manaState(now){const b=BUFS.mana;if(!b){MM=null;return null;}
  if(!MM||MM.t0!==b.t0){MM={t0:b.t0,dur:b.end-b.t0,last:now,comets:[],ripples:[],drops:[],splash:[],sparks:[],next:.12,n:0,crown:0,dropAcc:0};
    for(let i=0;i<14;i++){const a=mr(0,6.283),sp=mr(18,42);MM.splash.push({ox:0,oy:0,vx:Math.cos(a)*sp,vz:Math.sin(a)*sp,h:2,vh:mr(70,120),life:mr(.55,.8),age:0});}}
  const s=MM,t=now-s.t0,dt=Math.max(0,Math.min(.05,now-s.last));s.last=now;s.t=t;if(dt<=0)return s;const end=s.dur-.6;
  if(t>=s.next&&t<end){s.comets.push({ph:s.n*2.39+mr(-.3,.3),t0:t,dur:1.55*mr(.9,1.1)});s.ripples.push({ph:s.comets[s.comets.length-1].ph,age:0});s.n++;s.next=t+.36;}
  for(const c of s.comets){const u=(t-c.t0)/c.dur;if(u>=1&&!c.done){c.done=1;s.crown=1;for(let i=0;i<5;i++)s.sparks.push({ox:mr(-4,4),oy:-60,vx:mr(-30,30),vy:mr(-40,-10),age:0,life:mr(.3,.5)});}}
  s.comets=s.comets.filter(c=>t-c.t0<c.dur+.35);s.crown=Math.max(0,s.crown-dt*5);
  for(const r of s.ripples)r.age+=dt;s.ripples=s.ripples.filter(r=>r.age<1);
  if(t>.2&&t<end){s.dropAcc+=dt*7;while(s.dropAcc>1){s.dropAcc--;const a=mr(0,6.283),r=mr(6,34);s.drops.push({ox:Math.cos(a)*r,oy:Math.sin(a)*r*MK,h:0,sw:mr(0,6),age:0,life:mr(.9,1.4),v:mr(22,30)});}}
  for(const d of s.drops){d.age+=dt;d.h+=dt*d.v;}s.drops=s.drops.filter(d=>d.age<d.life);
  for(const p of s.splash){p.age+=dt;p.ox+=p.vx*dt;p.oy+=p.vz*dt*MK;p.h=Math.max(0,p.h+p.vh*dt);p.vh-=300*dt;}s.splash=s.splash.filter(p=>p.age<p.life);
  for(const p of s.sparks){p.age+=dt;p.ox+=p.vx*dt;p.oy+=p.vy*dt;}s.sparks=s.sparks.filter(p=>p.age<p.life);
  return s;}
function mcpos(c,u,x,fy,k){const th=c.ph+u*2.5*Math.PI,r=40*k*(1-Math.pow(u,3))*(1+.07*Math.sin(u*9+c.ph)),h=(3+u*64)*k;
  return {x:x+Math.cos(th)*r,y:fy-h+Math.sin(th)*r*MK,front:Math.sin(th)>0};}
function mcomet(c,t,front,x,fy,k,f){const u=(t-c.t0)/c.dur,N=26,L=.34;   // r53 (art review r52 #1): no beads/steps — each layer is one filled ribbon per run (edges offset by the half-width along the normal, taper to 0 at the tail)
  const pts=[];for(let i=0;i<=N;i++){const uu=u-L+L*i/N;pts.push(uu<0||uu>1?null:Object.assign(mcpos(c,uu,x,fy,k),{s:i/N,top:uu}));}
  const runs=[];let cur=null;for(let i=0;i<=N;i++){const q=pts[i];if(q&&q.front===front){if(!cur){cur=[];runs.push(cur);}cur.push(q);}else cur=null;}
  const fadeTop=Math.min(1,u>.9?1-(u-.9)/.1*.6:1),af=(front?1:.6)*f*fadeTop;if(af<=0)return;
  for(const r of runs){if(r.length<2)continue;
    for(const lay of [0,1]){const W=lay?q=>(1.5+4*q.s)*k*q.s:q=>(3+7*q.s)*k*Math.min(1,q.s*1.6),L1=[],R1=[];
      for(let i=0;i<r.length;i++){const a=r[Math.max(0,i-1)],b=r[Math.min(r.length-1,i+1)],dx=b.x-a.x,dy=b.y-a.y,dl=Math.hypot(dx,dy)||1,nx=-dy/dl,ny=dx/dl,w=W(r[i])/2;L1.push([r[i].x+nx*w,r[i].y+ny*w]);R1.push([r[i].x-nx*w,r[i].y-ny*w]);}
      ctx.beginPath();ctx.moveTo(L1[0][0],L1[0][1]);for(let i=1;i<L1.length;i++)ctx.lineTo(L1[i][0],L1[i][1]);for(let i=R1.length-1;i>=0;i--)ctx.lineTo(R1[i][0],R1[i][1]);ctx.closePath();
      if(lay===0){ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.55*af;ctx.fillStyle='#2a5fd0';}else{ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.85*af;ctx.fillStyle='#9fe9ff';}
      ctx.fill();}}
  if(u>0&&u<1){const h=mcpos(c,u,x,fy,k);if(h.front===front){const hf=u>.85?(1-u)/.15:1;ctx.globalCompositeOperation='lighter';if(MMART&&mok(UM3[3]))mpiece(UM3[3],h.x,h.y,11*k,t*3,(front?.7:.42)*f*hf);else mgl(h.x,h.y,16*k,'#e6fbff',(front?.7:.42)*f*hf);mgl(h.x,h.y,30*k,'#5fd8ff',(front?.42:.25)*f*hf);}}}   /* r53 #2: head glow ≤ .7, fades in the last 15 % */
function manaFx(front,x,fy,now){const s=manaState(now);if(!s)return;const t=s.t,k=heroH()/60,f=Math.min(mseg(t,0,.3),1-mseg(t,s.dur-.6,s.dur));ctx.save();
  if(!front){   // ground: pool, cast spring ring, ripples, back half of the comets
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.translate(x,fy);ctx.scale(1,MK);
    const pa=f*(.32+.12*Math.sin(t*3.2)),pg=ctx.createRadialGradient(0,0,4*k,0,0,48*k);pg.addColorStop(0,'rgba(120,220,255,'+pa+')');pg.addColorStop(1,'rgba(60,120,255,0)');ctx.fillStyle=pg;ctx.globalAlpha=1;ctx.beginPath();ctx.arc(0,0,48*k,0,6.283);ctx.fill();
    if(t<.6){const u=meO(t/.5);ctx.globalAlpha=1-mseg(t,.15,.6);ctx.strokeStyle='#bff2ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,(8+44*u)*k,0,6.283);ctx.stroke();ctx.strokeStyle='#5fd8ff';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,(4+30*u)*k,0,6.283);ctx.stroke();}
    ctx.restore();ctx.globalCompositeOperation='source-over';
    for(const r of s.ripples){const p=r.age,rx=x+Math.cos(r.ph)*40*k,ry=fy+Math.sin(r.ph)*40*k*MK;ctx.globalAlpha=(1-p)*.85*f;ctx.strokeStyle='#9be8ff';ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(rx,ry,(4+24*p)*k,(4+24*p)*k*MK,0,0,6.283);ctx.stroke();
      if(p>.2){const q=(p-.2)/.8;ctx.globalAlpha=(1-q)*.6*f;ctx.beginPath();ctx.ellipse(rx,ry,(3+16*q)*k,(3+16*q)*k*MK,0,0,6.283);ctx.stroke();}}
    for(const c of s.comets)mcomet(c,t,false,x,fy,k,f);}
  else{for(const c of s.comets)mcomet(c,t,true,x,fy,k,f);
    ctx.globalCompositeOperation='lighter';
    for(const p of s.splash){const im=UM3[p.v==null?(p.v=(rnd()*3)|0):p.v];if(MMART&&mok(im)){ctx.globalCompositeOperation='source-over';mpiece(im,x+p.ox*k,fy+p.oy*k-p.h*k,7*k,p.v===1&&p.vh<0?Math.PI:0,1-p.age/p.life);ctx.globalCompositeOperation='lighter';}else mgl(x+p.ox*k,fy+p.oy*k-p.h*k,9*k,'#bff2ff',1-p.age/p.life);}
    for(const d of s.drops){const im=UM3[d.v==null?(d.v=(rnd()*3)|0):d.v],dx=x+(d.ox+Math.sin(d.age*5+d.sw)*3)*k,dy=fy+d.oy*k-d.h*k,da=Math.sin(Math.PI*d.age/d.life)*f;if(MMART&&mok(im)){ctx.globalCompositeOperation='source-over';mpiece(im,dx,dy,6*k,0,da);ctx.globalCompositeOperation='lighter';}else mgl(dx,dy,8*k,'#9be8ff',da);}   /* rising: teardrop points up (as painted) */
    for(const p of s.sparks){if(MMART&&mok(UM3[3]))mpiece(UM3[3],x+p.ox*k,fy+p.oy*k,9*k,0,.7*(1-p.age/p.life));else mgl(x+p.ox*k,fy+p.oy*k,10*k,'#ffffff',1-p.age/p.life);}   /* crown sparks = M3 sparkle, additive ≤ .7 */
    if(s.crown>0){const hw2=heroW()*.7;mgl(x,fy-58*k,Math.min((34*s.crown+10)*k,.6*hw2),'#e6fbff',s.crown*.55);mgl(x,fy-30*k,70*k,'#5fd8ff',s.crown*.3);}   /* r53 #2: crown ≤ .55 α, ≤ 0.6 × head width, decay 5/s; body tint .3 */}   // absorb: crown glow + light-blue hero tint
  ctx.restore();}
/* ---- Magnet reaction: per-fx state (cracks, chips, field comets), pulled mobs taken from the reaction ---- */
function magState(f){if(f.G)return f.G;const G=f.G={cracks:[],chips:[],comets:[],dust:[],sparks:[],snap:false,flash:0,last:f.t0,mfl:new Map()},R0=121;
  for(let i=0;i<7;i++){const a=i*.9+mr(-.2,.2),L=mr(26,46),pts=[[0,0]];let x=0,y=0;for(let k=1;k<=5;k++){const aa=a+mr(-.35,.35);x+=Math.cos(aa)*L/5;y+=Math.sin(aa)*L/5;pts.push([x,y]);}G.cracks.push(pts);}
  for(let i=0;i<14;i++){const a=mr(0,6.283),d=mr(40,R0),n=5+(i%3),pts=[];for(let k=0;k<n;k++){const aa=k/n*6.283,rr=mr(.7,1.1);pts.push([Math.cos(aa)*rr,Math.sin(aa)*rr*.8]);}
    G.chips.push({a,d0:d,d,s:mr(4,7),pts,rot:mr(0,6),vr:mr(-8,8),st:mr(.04,.12),x:0,y:0,h:0,orb:mr(8,18),oph:mr(0,6.283),vx:0,vz:0,vh:0,bounced:0});}
  for(let i=0;i<12;i++)G.comets.push({a:i/12*6.283+mr(-.2,.2),t0:mr(.05,.17),dur:mr(.22,.3)});return G;}
function magStep(f,now){const G=magState(f),t=now-f.t0,dt=Math.max(0,Math.min(.05,now-G.last));G.last=now;if(dt<=0)return G;   // demo units (centre 0,0), ×m when drawn
  for(const o of (f.mobs||[])){if(!liveE(o))continue;let m=G.mfl.get(o)||{fl:0,dust:0};G.mfl.set(o,m);m.fl=Math.max(0,m.fl-dt*3);
    if(t>.0&&t<.38){m.dust+=dt;if(m.dust>.03){m.dust=0;const dx=o.x-f.x,dy=o.y-f.y,dl=Math.hypot(dx,dy)||1;G.dust.push({wx:o.x+dx/dl*10,wy:o.y+dy/dl*5,age:0,life:.5,r0:3,r1:11});}}}
  if(t>=.4&&!G.snap){G.snap=true;G.flash=1;for(const m of G.mfl.values())m.fl=1;for(let i=0;i<10;i++){const a=mr(0,6.283),sp=mr(80,150);G.sparks.push({x:0,y:-16,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*.6-30,age:0,life:mr(.25,.4)});}}
  G.flash=Math.max(0,G.flash-dt*4.5);
  for(const c of G.chips){
    if(t<c.st){c.d=c.d0;c.h=0;}
    else if(t<.14){c.d=c.d0;c.h=12*meO((t-c.st)/(.14-c.st));}
    else if(t<.4){const s=meI((t-.14)/.26);c.d=c.d0*(1-s)+c.orb*s;c.th=c.a+s*1.4;c.h=12+s*12;}
    else if(t<.78){const w=6.283*(3-2.2*mseg(t,.4,.78));c.oph+=w*dt;c.d=c.orb;c.th=c.a+1.4+c.oph;c.h=24+Math.sin(t*14+c.a)*2;}
    else{if(!c.rel){c.rel=1;const a=c.th||c.a;c.x=Math.cos(a)*c.d;c.y=Math.sin(a)*c.d*MK;const sp=mr(40,75);c.vx=Math.cos(a)*sp;c.vz=Math.sin(a)*sp;c.vh=mr(40,80);}
      c.x+=c.vx*dt;c.y+=c.vz*dt*MK;c.vh-=320*dt;c.h+=c.vh*dt;if(c.h<0){c.h=0;if(!c.bounced){c.bounced=1;c.vh=-c.vh*.35;c.vx*=.5;c.vz*=.5;G.dust.push({x:c.x,y:c.y,age:0,life:.45,r0:2,r1:8});}else{c.vh=0;c.vx*=.9;c.vz*=.9;}}}
    if(!c.rel){const a=c.th===undefined?c.a:c.th;c.x=Math.cos(a)*c.d;c.y=Math.sin(a)*c.d*MK;}
    c.rot+=c.vr*dt*(t<.78?1.6:1);}
  for(const d of G.dust)d.age+=dt;G.dust=G.dust.filter(d=>d.age<d.life);
  for(const s of G.sparks){s.age+=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=200*dt;}G.sparks=G.sparks.filter(s=>s.age<s.life);return G;}
function mbolt(x0,y0,x1,y1,amp,seed){const n=7,pts=[[x0,y0]],dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;let s=seed;const r=()=>((s=(s*9301+49297)%233280)/233280-.5)*2;
  for(let i=1;i<n;i++){const k=i/n,o=r()*amp;pts.push([x0+dx*k+nx*o,y0+dy*k+ny*o]);}pts.push([x1,y1]);return pts;}
function magGround(f,now){const G=magStep(f,now),t=now-f.t0,m=CFG.react.magnetR/121,TX=f.x,TY=f.y,R0=121,tick=Math.floor(t/.045);
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  const cg=mseg(t,0,.12),cf=1-mseg(t,.7,1.25);   // 7 jagged ground cracks
  for(const pts of G.cracks){const n=Math.max(1,Math.ceil(cg*(pts.length-1))),sub=pts.slice(0,n+1).map(([x,y])=>[TX+x*m,TY+y*m*MK]);
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.85*cf;ctx.strokeStyle='#2b1a0e';ctx.lineWidth=3*m*.7;mpoly(sub);
    ctx.globalCompositeOperation='lighter';ctx.globalAlpha=cf*(1-mseg(t,.4,.95));ctx.strokeStyle='#ffb84a';ctx.lineWidth=1.3*m*.7;mpoly(sub);}
  ctx.globalCompositeOperation='lighter';   // 2 contracting jagged electric rings
  for(const off of [0,.07]){const u=mseg(t,.05+off,.4);if(u<=0||u>=1)continue;const rr=(R0-(R0-16)*meI(u))*m,al=Math.min(1,u*6)*(1-mseg(u,.85,1));let s=tick*31+(off?7:1);const r=()=>((s=(s*9301+49297)%233280)/233280-.5)*2;
    const pts=[];for(let i=0;i<=48;i++){const a=i/48*6.283,j=rr+r()*3*m;pts.push([TX+Math.cos(a)*j,TY+Math.sin(a)*j*MK]);}
    ctx.globalAlpha=al*.35;ctx.strokeStyle='#ffb84a';ctx.lineWidth=6;mpoly(pts);ctx.globalAlpha=al;ctx.strokeStyle='#ffe66a';ctx.lineWidth=1.8;mpoly(pts);ctx.globalAlpha=al*.9;ctx.strokeStyle='#ffffff';ctx.lineWidth=.8;mpoly(pts);}
  for(const c of G.comets){const u=(t-c.t0)/c.dur;if(u<0||u>1.25)continue;const Pt=q=>{const kk=mmc(q,0,1),r=((R0+8)*(1-kk)+8*kk)*m,th=c.a+kk*1.6;return [TX+Math.cos(th)*r,TY+Math.sin(th)*r*MK];};   // 12 spiral field lines
    for(let i=0;i<10;i++){const s0=i/10,s1=(i+1)/10,u0=u-.35+.35*s0,u1=u-.35+.35*s1;if(u1<0||u0>1)continue;const a=Pt(u0),b=Pt(u1);ctx.globalAlpha=s1;ctx.strokeStyle=s1>.7?'#fff6c0':'#ffc94a';ctx.lineWidth=(.8+2.4*s1)*m*.7;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();}
    if(u<1){const h=Pt(u);mgl(h[0],h[1],12*m,'#fff6c0',1);}}
  if(t>=.4){const u=mseg(t,.4,.68);if(u<1){const rr=(18+60*meO(u))*m;ctx.globalAlpha=(1-u)*.9;ctx.strokeStyle='#ffe66a';ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(TX,TY,rr,rr*MK,0,0,6.283);ctx.stroke();}}   // snap shockwave
  ctx.globalCompositeOperation='source-over';   // dust (normal blend)
  for(const d of G.dust){const p=d.age/d.life,x=d.wx!=null?d.wx:TX+d.x*m,y=d.wy!=null?d.wy:TY+d.y*m,rr=(d.r0+(d.r1-d.r0)*p)*m*.7,im=typeof UV8D!=='undefined'?UV8D[d.v==null?(d.v=(rnd()*3)|0):d.v]:null;
    if(MMART&&mok(im)){mpiece(im,x,y-p*4,rr*2.6,0,(1-p)*.6);continue;}ctx.globalAlpha=(1-p)*.5;ctx.fillStyle='#b89a72';ctx.beginPath();ctx.ellipse(x,y-p*4,rr,rr*.7,0,0,6.283);ctx.fill();}   /* V8 approved dust */
  ctx.restore();}
function magFront(f,now){const G=magState(f),t=now-f.t0,m=CFG.react.magnetR/121,TX=f.x,TY=f.y,tick=Math.floor(t/.045);ctx.save();ctx.lineJoin='round';ctx.globalCompositeOperation='lighter';
  if(t>0&&t<.43){let i=0;for(const o of (f.mobs||[])){if(!liveE(o))continue;const pts=mbolt(o.x,o.y-10*m*.7,TX,TY-12*m*.7,6*m,tick*13+i*101),fl=.75+.25*((tick+i)%2);   // tethers
    ctx.globalAlpha=.4*fl;ctx.strokeStyle='#ffb84a';ctx.lineWidth=4;mpoly(pts);ctx.globalAlpha=fl;ctx.strokeStyle='#fff3a0';ctx.lineWidth=1.4;mpoly(pts);i++;}}
  for(const [o,mm] of G.mfl)if(mm.fl>0&&liveE(o))mgl(o.x,o.y-(o.sz||16),(o.sz||16)*3,'#ffffff',mm.fl*.7);   // white flash on the pulled mobs at the snap
  if(t<.16){const u=t/.16;mgl(TX,TY-12*m,90*m*(1-u*.4),'#fff6c0',1-u);ctx.globalAlpha=1-u;ctx.strokeStyle='#ffe66a';ctx.lineWidth=1.5;for(let i=0;i<8;i++){const a=i*.785+.2,r0=8*m,r1=(18+30*meO(u))*m;ctx.beginPath();ctx.moveTo(TX+Math.cos(a)*r0,TY-12*m+Math.sin(a)*r0);ctx.lineTo(TX+Math.cos(a)*r1,TY-12*m+Math.sin(a)*r1);ctx.stroke();}}   // hit flash + starburst
  const core=mseg(t,.3,.42)*(1-mseg(t,.75,.95));if(core>0)mgl(TX,TY-24*m,46*m,'#ffb84a',core*.7);
  if(G.flash>0)mgl(TX,TY-20*m,(110*G.flash+20)*m,'#ffffff',G.flash);
  ctx.globalCompositeOperation='source-over';
  for(const c of G.chips){const fade=1-mseg(t,1.0,1.4);if(fade<=0)continue;const cx=TX+c.x*m,cy=TY+c.y*m-c.h*m,cs=c.s*m;   // rock chips, lit from the upper left
    if(MMART&&mok(UM1[c.v==null?(c.v=(rnd()*6)|0):c.v])){mpiece(UM1[c.v],cx,cy,cs*1.2,c.rot,fade);if(t>.05&&t<.4){ctx.globalCompositeOperation='lighter';mgl(cx,cy,cs*4,'#ffd34a',.12*fade);ctx.globalCompositeOperation='source-over';}continue;}   /* M1 painted chip, already lit: no code highlight */
    ctx.save();ctx.translate(cx,cy);ctx.rotate(c.rot);ctx.scale(cs,cs);ctx.globalAlpha=fade;ctx.fillStyle='#7a5a3a';ctx.beginPath();c.pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();
    ctx.lineWidth=.35;ctx.strokeStyle='#3a2616';ctx.stroke();ctx.restore();
    ctx.globalAlpha=fade*.55;ctx.fillStyle='#d9b07a';ctx.beginPath();ctx.arc(cx-cs*.35,cy-cs*.35,cs*.38,0,6.283);ctx.fill();
    if(t>.05&&t<.4){ctx.globalCompositeOperation='lighter';mgl(cx,cy,cs*4,'#ffd34a',.12*fade);ctx.globalCompositeOperation='source-over';}}
  if(t>.4&&t<.8){ctx.globalCompositeOperation='lighter';for(let k=0;k<3;k++){const a=G.chips[(tick*3+k*5)%14],b=G.chips[(tick*7+k*3+4)%14],pts=mbolt(TX+a.x*m,TY+a.y*m-a.h*m,TX+b.x*m,TY+b.y*m-b.h*m,4*m,tick*7+k);ctx.globalAlpha=.9;ctx.strokeStyle='#fff3a0';ctx.lineWidth=1.2;mpoly(pts);}}   // arcs between chips
  ctx.globalCompositeOperation='lighter';for(const s of G.sparks)mgl(TX+s.x*m,TY+s.y*m,9*m,'#fff3a0',1-s.age/s.life);
  ctx.restore();}
const URIBSRC=["assets/4b2d3bd2c5b8985f.webp", "assets/5ede18c2886b26ad.webp", "assets/c6a9605fdc4efa51.webp", "assets/1b6bf6e01599ea3a.webp"];
const UV6SRC=["assets/37df71d92bf71f7c.webp", "assets/e3f5c34d6e685626.webp", "assets/068c55316f50ac6f.webp", "assets/db5a4f87195854fe.webp"];
const UV6PK=[437, 426, 393, 372];
const UR1SRC="assets/0182cad766748eae.webp";
const UV4SRC="assets/cc404f37228c71fa.webp";
const UV2SRC=["assets/33c7b3ecf309ea16.webp", "assets/8f4a64286050dca5.webp", "assets/65c161f4402c14a9.webp"];
const UV3SRC=["assets/3514d524467785b2.webp", "assets/09db1b1819d5394c.webp", "assets/a051cf1810ec92b8.webp", "assets/a55fb4b137ceba77.webp"];
const UV3OFF=[-0.3, -25.1, 2.3, -0.7];
const UV5SRC="assets/c1b10fa60d16bcf3.webp";
const UV5AN=[0.4939,0.495];
const UV9SRC="assets/05b45c517320c255.webp";
const UV7SRC="assets/e4cd6caa90bf9521.webp";
const UV7N=12;
const UV8DSRC=["assets/87782abb37f079cb.webp", "assets/8fc2ac7bad19ecbc.webp", "assets/9835272d3b8ec2d2.webp"];
const UV8LSRC=["assets/82f5296bad584835.webp", "assets/d01b6190d67e6ff5.webp", "assets/88d20b61fcfae61a.webp"];
/* ================= r48: Rainbow Storm VFX v1 (approved/vfx/RAINBOW_STORM_VFX_v1.md, DeaRz passed demo r1 07:43) =================
   Port of the demo's motion logic onto the game: 14 layers, effect clock in ms (hit-stop freezes it only), quality from the game's
   graphics level (low = the second number of each count). "Art now" column: approved u1–u5 rings (angular wedge reveal, no scale pop),
   u7 sky beam scrolled by rows, u9 shards / stars, the rest code strokes. ?ultfx=old = the r47 look for comparison.
   Also ORDER_20261020_staff-ult-timing-fixes: (1) the ult visuals start at cast start, (2) beam damage lands on the frame the beam touches
   the ground, (3) pull and particle drag are time-based. */
/* r49 (orders/code/ORDER_20261020_vfx-rainbow-storm-r2 · spec orders/vfx-real/REPORT_vfx-rainbow-storm-r2-beam-whiteout, demo approved/vfx/RAINBOW_STORM_demo_r2_source):
   beam colour bands drawn normally (no whiteout on bright grass) and behind the monsters, thin additive streaks only, small white pop + lilac glow,
   V6 rings 1–5 (violet v2 replaces u1; red spikes baked in), V4a beam band texture, V5 impact burst, V2 sparkles, V3 crystals, V7 rune motion, V8 dust + leaves, V9 edge flames, r50 draw-load pass (?ultopt=off), ring flare ×1.25, no ribbon glow after 2200, softer burst, V1 ribbon strips (12 slices per ribbon), ground dim disk (?ultdim=off turns it off),
   storm sums shown 0.48 s so one number per monster per 0.5 s, hit read = rim + violet tint only (nothing additive white). */
const ULTOLD=/ultfx=old/.test(location.search);
const ULTDIM=!/ultdim=off/.test(location.search);   // option B (dim disk) until DeaRz picks A or B
const UGRP=[0,0,1,1,2,2,3];                          // UHUES index → V1 ribbon colour group (red-orange, yellow-green, cyan-indigo, violet-pink)
const uImg=src=>{const im=new Image();im.src=src;return im;},uOK=m=>!!(m&&m.complete&&m.naturalWidth>0);
const UVR=[uImg(UR1SRC)].concat(UV6SRC.map(uImg)),UVPK=[454].concat(UV6PK),uVok=i=>uOK(UVR[i]);   // V6 rings 1–5 (violet v2, cyan, green, yellow, red) 1024 px; UVPK = main-line radius in the image (ring 1: outer line)
const UV4=uImg(UV4SRC);
const UV9=uImg(UV9SRC),UV8D=UV8DSRC.map(uImg),UV8L=UV8LSRC.map(uImg);   // V9 flame flipbook 8 × 66×155 (anchor bottom-centre), V8 dust 64² / leaves 32²
const URCOL=['#a27bff','#3fb8ff','#3fe07a','#ffd23a','#ff4a3d'];   // ring colours vio/blu/grn/yel/red
let UV7T=null;const UV7=uImg(UV7SRC);function uRunes(){if(UV7T)return UV7T;const im=UV7;if(!uOK(im))return null;   // V7 runes 12 × 32², pre-tinted ONCE into the 5 ring colours
  UV7T=URCOL.map(col=>{const c=document.createElement('canvas');c.width=32*UV7N;c.height=32;const g=c.getContext('2d');g.drawImage(im,0,0);g.globalCompositeOperation='source-atop';g.globalAlpha=.85;g.fillStyle=col;g.fillRect(0,0,c.width,32);return c;});return UV7T;}
const UV2=UV2SRC.map(uImg),UV3=UV3SRC.map(uImg),UV5=uImg(UV5SRC);   // V2 sparkles 64², V3 crystals 64×128 tip up (UV3OFF = lean of the long axis, deg), V5 impact burst 512 (UV5AN = core anchor)                                                                            // V4a beam bands 256×853, seamless top↔bottom   // V6 rings 2–5 (cyan, green, yellow, red), 1024 px; UV6PK = main-line radius in the image
/* r50 draw-load pass (VFX stage 3, same look): ?ultopt=off = the r49 drawing path for comparison.
   ribbons: each V1 slice draws only its painted rows (alpha bbox per slice, measured once) and is placed with setTransform (no save/rotate/restore
   per slice), so the ~530 slices per frame fill ~1/5 of the area; rings: each V6 image is resampled ONCE to its on-screen pixel size and cached. */
const USOLID=!/ultsolid=off/.test(location.search);   /* r51 (order vfx-rainbow-storm-r3-solid): storm reads on grass; ?ultsolid=off = r50 look */
const UOPT=!/ultopt=off/.test(location.search);
let URC=null;function uRibCrop(){if(URC)return URC;if(!URIB.every(uOK))return null;try{URC=URIB.map(im=>{const c=document.createElement('canvas');c.width=512;c.height=192;const g=c.getContext('2d');g.drawImage(im,0,0);
  const d=g.getImageData(0,0,512,192).data,sw=512/12,out=[];for(let i=0;i<12;i++){const x0=Math.floor(i*sw),x1=Math.min(512,Math.ceil((i+1)*sw));let y0=192,y1=-1;
    for(let y=0;y<192;y++){for(let x=x0;x<x1;x++)if(d[(y*512+x)*4+3]>2){if(y<y0)y0=y;y1=y;break;}}out.push(y1<0?null:[Math.max(0,y0-1),Math.min(192,y1+2)]);}return out;});}catch(_){URC=null;}return URC;}
const URCACHE=[];function uRingC(i,im,px){px=Math.max(16,Math.round(px/8)*8);let c=URCACHE[i];if(c&&c.width===px)return c;   // V6 ring resampled once to its device-pixel size
  c=document.createElement('canvas');c.width=c.height=px;const g=c.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(im,0,0,px,px);URCACHE[i]=c;return c;}
const URIB=URIBSRC.map(src=>{const im=new Image();im.src=src;return im;});
const UK=.47;                                       // ground ellipse ratio of the approved ring images, used by every ult ground layer
const UHUES=['#ff4a3d','#ff9a2e','#ffd23a','#3fe07a','#3fb8ff','#6f7bff','#b06bff'];
const USH=['u9g','u9r','u9v'],UST=['u9c','u9rb','u9y'];
const UT={tick0:1.075,tickDt:.15,sums:[1.5,2.0,2.19],beam:2.2,burst:2.45,end:3.8};
const ULOW=()=>{try{return G.gfx==='low';}catch(_){return false;}};
const UQ=()=>ULOW()?{rib:22,dust:18,spark:22,cMote:6,cBeam:10,cBurst:14,fade:16}:{rib:44,dust:40,spark:50,cMote:10,cBeam:20,cBurst:28,fade:36};
const uclamp=(v,a,b)=>v<a?a:v>b?b:v,ue3=x=>1-Math.pow(1-uclamp(x,0,1),3),useg=(t,a,b)=>uclamp((t-a)/(b-a),0,1),urnd=(a,b)=>a+rnd()*(b-a);
// glow sprites made once (64 px), no per-frame image creation
const UGL={};function ugl(col){let c=UGL[col];if(c)return c;c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,col);gr.addColorStop(.25,col+'cc');gr.addColorStop(1,col+'00');g.fillStyle=gr;g.fillRect(0,0,64,64);UGL[col]=c;return c;}
const UDEEP={};function uDeep(h){if(UDEEP[h])return UDEEP[h];const n=parseInt(h.slice(1),16);return UDEEP[h]='rgb('+Math.round((n>>16&255)*.8)+','+Math.round((n>>8&255)*.8)+','+Math.round((n&255)*.8)+')';}
let UCOREV=null;function ucoreV(){if(UCOREV)return UCOREV;const b=ucore(),c=document.createElement('canvas');c.width=b.width;c.height=b.height;const g=c.getContext('2d');g.drawImage(b,0,0);g.globalCompositeOperation='source-in';g.fillStyle='rgb(150,110,255)';g.fillRect(0,0,c.width,c.height);return UCOREV=c;}
let UCORE=null;function ucore(){if(UCORE)return UCORE;const c=document.createElement('canvas');c.width=64;c.height=256;const g=c.getContext('2d');
  const gx=g.createLinearGradient(0,0,64,0);gx.addColorStop(0,'rgba(220,200,255,0)');gx.addColorStop(.5,'rgba(255,250,255,1)');gx.addColorStop(1,'rgba(220,200,255,0)');g.fillStyle=gx;g.fillRect(0,0,64,256);
  g.globalCompositeOperation='destination-in';const gy=g.createLinearGradient(0,0,0,256);gy.addColorStop(0,'rgba(0,0,0,0)');gy.addColorStop(.35,'rgba(0,0,0,1)');gy.addColorStop(.85,'rgba(0,0,0,1)');gy.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=gy;g.fillRect(0,0,64,256);UCORE=c;return c;}
/* screen helpers: storm height HMAX = min(300, centre's screen y − HUD bottom − 40) in screen px, converted to world px */
function uScr(){const m=ctx.getTransform(),sc=Math.hypot(m.c,m.d)||1,dpr=(ctx.canvas.height/(ctx.canvas.clientHeight||ctx.canvas.height))||1;
  let hud=56;try{const el=document.getElementById('hud')||document.getElementById('topHud');if(el){const b=el.getBoundingClientRect();if(b.bottom>0&&b.bottom<300)hud=b.bottom;}}catch(_){}
  const cyS=(m.b*ULT.x+m.d*ULT.y+m.f);return {sc,hudW:(cyS-hud*dpr)/sc,HMAX:Math.max(80,Math.min(300*dpr,cyS-hud*dpr-40*dpr)/sc)};}
function UP(x,z,h){return [ULT.x+x,ULT.y+z*UK-h];}
/* ---------- state + simulation (runs in tick, dt in s) ---------- */
function u48Init(){const U=ULT;U.et=0;U.hs=0;U.ev={};U.rib=[];U.dust=[];U.spk=[];U.cry=[];U.mot=[];U.acc=new Map();U.pulled=[];U.kb=[];U.R=CFG.ult.r;U.PULL=110;U.HM=260;}
function uEv(n,fn){const U=ULT;if(!U.ev[n]){U.ev[n]=1;fn();}}
function uRib(){const q=rnd();return {th:urnd(0,6.283),u:rnd(),h:0,rf:.45+.55*Math.sqrt(q),arc:urnd(1.2,2.4),vy:urnd(120,210),w:urnd(5,11),col:UHUES[(rnd()*7)|0],tilt:urnd(6,22),out:1,a:1};}
function uDust(){const U=ULT,leaf=rnd()<.35;return {rho:urnd(U.R*1.05,U.R*1.6),phi:urnd(0,6.28),h:0,pull:urnd(60,120),lift:urnd(90,170),leaf,a:1,col:leaf?(rnd()<.5?'#7fbf4a':'#a8c95a'):(rnd()<.5?'#9a8a6a':'#cfc2a0'),s:leaf?urnd(4,7):urnd(10,18),v:leaf?(rnd()<.25?2:(rnd()*2)|0):(rnd()*3)|0,ds:leaf?urnd(7,11):urnd(12,22),da:urnd(.45,.6),seed:urnd(0,6.28)};}
const uHc=()=>ULT.HM*ue3((ULT.et-1000)/450);
const uProf=h=>ULT.R*.62*(.82+.3*h/ULT.HM);
const uAx=h=>Math.sin(ULT.et*.0021+h*.012)*10*(h/ULT.HM)+Math.sin(ULT.et*.0013)*4;
function u48Sim(dt){const U=ULT,s=dt,t=U.et,q=UQ(),R0=U.R;
  if(t>=300)uEv('motes',()=>{for(let i=0;i<q.cMote;i++)U.cry.push({x:urnd(-R0*.8,R0*.8),z:urnd(-R0*.6,R0*.6),h:urnd(0,10),vx:0,vz:0,vh:urnd(18,40),g:0,rot:urnd(0,6),vr:urnd(1,3),s:urnd(5,8),k:USH[(rnd()*3)|0],v:(rnd()*4)|0,life:urnd(1.6,2.4),age:0,float:1});});
  if(t>=1000)uEv('storm',()=>{for(let i=0;i<q.rib;i++){const r=uRib();r.u=i/q.rib;U.rib.push(r);}for(let i=0;i<q.spark;i++)U.spk.push({th:urnd(0,6.28),h:-urnd(0,200),rf:urnd(.5,1.1),vy:urnd(70,140),k:UST[(rnd()*3)|0],v:(rnd()*3)|0,s:urnd(8,16)});for(let i=0;i<q.dust;i++)U.dust.push(uDust());});
  if(t>=2200)uEv('beamfx',()=>{for(let i=0;i<q.cBeam;i++){const a=urnd(0,6.28),sp=urnd(80,220);U.cry.push({x:urnd(-10,10),z:urnd(-10,10),h:urnd(5,30),vx:Math.cos(a)*sp*.5,vz:Math.sin(a)*sp*.5,vh:urnd(380,620),g:1100,rot:urnd(0,6),vr:urnd(-12,12),s:urnd(6,11),k:USH[i%3],v:(rnd()*4)|0,life:urnd(.7,1.1),age:0});}});
  if(t>=2450)uEv('burstfx',()=>{for(let i=0;i<q.cBurst;i++){const a=i/q.cBurst*6.283+urnd(-.1,.1),sp=urnd(260,420);U.cry.push({x:Math.cos(a)*30,z:Math.sin(a)*30,h:urnd(4,20),vx:Math.cos(a)*sp,vz:Math.sin(a)*sp,vh:urnd(120,260),g:700,rot:a,vr:urnd(-10,10),s:urnd(7,12),k:USH[i%3],v:(rnd()*4)|0,life:urnd(.6,.9),age:0});}});
  if(t>=3000)uEv('fade',()=>{for(let i=0;i<q.fade;i++){const a=urnd(0,6.28),rr=R0*[1,.78,.6,.42,.22][i%5];U.mot.push({x:Math.cos(a)*rr,z:Math.sin(a)*rr,h:0,vh:urnd(30,70),k:UST[i%3],v:i%3,rune:i%2===0,ci:4-(i%5),g:(rnd()*12)|0,rot:urnd(0,6.28),age:0,life:urnd(.6,1)});}});
  const Hc=uHc();
  for(const r of U.rib){if(t<2200){r.u+=r.vy/U.HM*s;if(r.u>1){r.u-=1;r.th=urnd(0,6.283);r.col=UHUES[(rnd()*7)|0];}}else r.u+=.15*s;
    r.h=r.u*Math.max(Hc,1);r.th+=(2.6/r.rf+1.2)*s*(t>2200?.6:1);if(t>2200){r.out+=s*2.4;r.a=Math.max(0,r.a-s*3.2);}}
  U.rib=U.rib.filter(r=>r.a>.01);
  for(const p of U.spk){p.h+=p.vy*s;p.th+=(3.4/p.rf)*s;if(p.h>Hc&&t<2150){p.h=urnd(-10,0);p.th=urnd(0,6.28);}}
  if(t>2200)U.spk=U.spk.filter(p=>p.h<Hc+40&&t<2600);
  for(const d of U.dust){if(t>2200){d.rho+=260*s;d.h+=20*s;d.a-=1.6*s;continue;}
    d.rho-=d.pull*s*(1+80/Math.max(d.rho,20));d.phi+=(.9*R0/Math.max(d.rho,30))*s;
    if(d.rho<uProf(0)*.9){d.h+=d.lift*s;d.rho=Math.max(d.rho,24);}if(d.h>Hc*.75||d.rho<25&&d.h>60)Object.assign(d,uDust());}
  U.dust=U.dust.filter(d=>d.a>0);
  for(const c of U.cry){c.age+=s;c.x+=c.vx*s;c.z+=c.vz*s;c.h+=c.vh*s;c.vh-=c.g*s;c.rot+=c.vr*s;if(!c.float&&c.h<0){c.h=0;c.vh*=-.3;c.vx*=.6;c.vz*=.6;}c.vx*=Math.exp(-1.2*s);c.vz*=Math.exp(-1.2*s);}
  U.cry=U.cry.filter(c=>c.age<c.life);
  for(const m of U.mot){m.age+=s;m.h+=m.vh*s;}U.mot=U.mot.filter(m=>m.age<m.life);
  R.stats.ptPeak=Math.max(R.stats.ptPeak,U.dust.length+U.spk.length+U.cry.length+U.mot.length);U.ptNow=U.dust.length+U.spk.length+U.cry.length+U.mot.length;}
/* ---------- gameplay timeline (real time t in s from cast start) ---------- */
/* storm ticks (8 × 0.15 s) keep the monster readable: no per-hit themed glow particles (they piled up over each monster = the white monsters
   near the centre) and no hurt clip; the beam and the burst still emit and play them once. Render only, damage untouched. */
/* r51 leash fix (DeaRz 11:49 screenshot: 'รีเซ็ต — ไม่รับดาเมจ' mid-ult): the ult's pull (up to ~200 px) and knockback (130 px) move monsters,
   which the map's leash read as the monster leaving home (Map 2 per-species leash 400 px from e.sx/e.sy) → reset + damage immunity.
   The leash code is private to the map module, so the hold works on the home point: while a monster is held its home follows it
   (distance 0 = no leash reset); when the hold ends the real home comes back and the normal leash rule applies again.
   Hold = pull: every frame + 1.6 s; knockback: 1.4 s (= 1 s after the 380 ms push). After the hold, while the monster is still fighting,
   its home is the real home moved by exactly the distance the ult pushed/pulled it (its own walking still counts for the leash);
   once it calms down (or resets / dies) the real home is put back. ?ultleash=old = r50 behaviour */
const ULEASH=!/ultleash=old/.test(location.search),UHOLD=new Set();
const UNOSPR=!/ultspread=on/.test(location.search);   /* r68 DeaRz 22 Oct 06:32 'ไม่ต้องกระจายออก': monsters are not knocked out of the circle: no 130 px burst push and from the beam on, monsters in the circle stop their hit-slide and later ult hits add none; the pull phase is as r67 so damage is unchanged (visuals unchanged); ?ultspread=on = r67 */
function uHold(e,s,mx,my){if(!ULEASH||!e||e.sx==null)return;let h=e._uH;if(!h||h.ph===2){if(h&&e.sx===h.wx&&e.sy===h.wy){e.sx=h.sx;e.sy=h.sy;}
    h=e._uH=h&&h.ph===2?Object.assign(h,{ph:1}):{sx:e.sx,sy:e.sy,fx:0,fy:0,ph:1};UHOLD.add(e);R.stats.leashHeld=(R.stats.leashHeld||0)+1;}
  h.fx+=mx||0;h.fy+=my||0;h.end=Math.max(h.end||0,time+s);e.sx=h.wx=e.x;e.sy=h.wy=e.y;}
function uHoldDrop(e,h){if(e.sx===h.wx&&e.sy===h.wy){e.sx=h.sx;e.sy=h.sy;}delete e._uH;UHOLD.delete(e);}
function uHoldTick(){if(!UHOLD.size)return;for(const e of UHOLD){const h=e._uH;if(!h||e.dead){if(h)uHoldDrop(e,h);else UHOLD.delete(e);continue;}
  if(e.sx!==h.wx||e.sy!==h.wy){delete e._uH;UHOLD.delete(e);continue;}   // someone else moved the home (map roaming / respawn): stop
  if(h.ph===1){if(time<h.end){e.sx=h.wx=e.x;e.sy=h.wy=e.y;continue;}h.ph=2;e.sx=h.wx=h.sx+h.fx;e.sy=h.wy=h.sy+h.fy;}
  if(h.ph===2&&(!e.aggro||e.w22ret))uHoldDrop(e,h);}}
function uHit(e,mul,sum){const U=ULT,dh=e._directHitT,em=typeof emitThemed==='function'?emitThemed:null;if(sum){R.supp=true;if(em)emitThemed=function(){};}const v0=UNOSPR&&U.ev.beam&&!isBoss(e)?[e.vx,e.vy]:null;let r=0;try{r=dmg(e,U.ctx,mul,{fx:U.x,fy:U.y});}finally{if(v0){e.vx=v0[0];e.vy=v0[1];}R.supp=false;if(sum){e._directHitT=dh;if(em)emitThemed=em;}}
  e.flash=0;e._uh=1;if(sum)U.acc.set(e,(U.acc.get(e)||0)+Math.max(0,r));return r;}
function u48Tick(now,dt){const U=ULT,c=CFG.ult,t=now-U.t0;
  if(U.hs>0)U.hs-=dt;else U.et+=dt*1000;
  if(FXON)u48Sim(dt);
  if(!U.ctx)return;                                  // still casting (visuals only)
  for(let n=0;n<c.stormN;n++){const tt=UT.tick0+UT.tickDt*n;if(t>=tt&&!U.ev['tk'+n]){U.ev['tk'+n]=1;
    for(const e of enemies){if(!liveE(e))continue;if(Math.hypot(e.x-U.x,e.y-U.y)>U.R+10+(e.sz||16)*.5)continue;uHit(e,c.storm/c.stormN,NUMSUM);}}}
  for(const ts of UT.sums)if(t>=ts&&!U.ev['sm'+ts]){U.ev['sm'+ts]=1;let i=0;for(const [e,v] of U.acc){if(v>0&&!e.dead)textAt(e.x,e.y-(e.sz||16)*1.6-(i%3)*10,fmt(v),'#e8dcff',20,{life:.48});{const T=texts[texts.length-1];if(T&&T.txt===fmt(v))T.life=T.max=.48;}/* number-hop patch raises life to 1 s; keep .48 so one storm number per monster shows at a time */i++;}U.acc.clear();}
  // pull 1.0–2.2 s: toward the centre at 110 px/s while orbiting 0.9 rad/s, stopping at 44 + 9·index (time-based)
  if(t>=1&&t<UT.beam){let idx=0;for(const e of enemies){if(!liveE(e)||isBoss(e))continue;const dx=e.x-U.x,dy=e.y-U.y,d=Math.hypot(dx,dy);if(d>U.R*1.1+(e.sz||16))continue;
    let k=U.pulled.indexOf(e);if(k<0){U.pulled.push(e);k=U.pulled.length-1;}const stop=44+9*k;if(d<=stop)continue;
    const a=Math.atan2(dy,dx)+.9*dt,nd=Math.max(stop,d-U.PULL*dt),nx=U.x+Math.cos(a)*nd,ny=U.y+Math.sin(a)*nd;if(!(typeof blocked==='function'&&blocked(nx,ny,(e.sz||16)*.5))){uHold(e,1.6,nx-e.x,ny-e.y);e.x=nx;e.y=ny;}else uHold(e,1.6);idx++;}}
  if(t>=UT.beam&&!U.ev.beam){U.ev.beam=1;if(UNOSPR)for(const e of enemies){if(liveE(e)&&!isBoss(e)&&Math.hypot(e.x-U.x,e.y-U.y)<=U.R*1.1+(e.sz||16)){e.vx=0;e.vy=0;}}U.hs=.06;U.fl=now;for(const e of enemies){if(!liveE(e))continue;if(Math.hypot(e.x-U.x,e.y-U.y)>U.R*.5+(e.sz||16)*.5)continue;uHit(e,c.beam,false);}if(FXON)try{shake(8);}catch(_){}}
  if(t>=UT.burst&&!U.ev.burst){U.ev.burst=1;for(const e of enemies){if(!liveE(e))continue;const dx=e.x-U.x,dy=e.y-U.y,dl=Math.hypot(dx,dy);if(dl>U.R+(e.sz||16)*.5)continue;uHit(e,c.burst,false);
      if(!UNOSPR&&!isBoss(e)&&dl>1){U.kb.push({e,sx:e.x,sy:e.y,dx:dx/dl,dy:dy/dl,t0:now});uHold(e,1.4);}}if(FXON)try{shake(5);}catch(_){}}
  // knockback 130 px over 380 ms, easeOutCubic
  for(const k of U.kb){if(k.done||!liveE(k.e))continue;const u=useg(now,k.t0,k.t0+.38),e3=ue3(u),nx=k.sx+k.dx*130*e3,ny=k.sy+k.dy*130*e3;
    if(!(typeof blocked==='function'&&blocked(nx,ny,(k.e.sz||16)*.5))){uHold(k.e,1.4-(now-k.t0),nx-k.e.x,ny-k.e.y);k.e.x=nx;k.e.y=ny;}else k.done=1;if(u>=1)k.done=1;}}
/* ---------- drawing ---------- */
const ULTR=[.137,.21,.288,.39,.483];   // ring radius as a fraction of each approved ring image's width (u1 … u5)
const URINGS=[['u1',.22,0,1,1.6,'#a27bff'],['u2',.42,120,-1,.9,'#3fb8ff'],['u3',.6,240,1,.6,'#3fe07a'],['u4',.78,360,-1,.4,'#ffd23a'],['u5',1,480,1,.22,'#ff4a3d']];
function u48Ground(){const U=ULT,t=U.et,R0=U.R;const sc=uScr();U.HM=sc.HMAX;U.hudW=sc.hudW;U.sc=sc.sc;
  ctx.save();
  // 1 warning disk
  const wa=useg(t,0,300)*(1-useg(t,3000,3600));if(wa>0){ctx.save();ctx.translate(U.x,U.y);ctx.scale(1,UK);const gd=ctx.createRadialGradient(0,0,0,0,0,R0);
    gd.addColorStop(0,'rgba(150,110,255,.22)');gd.addColorStop(.85,'rgba(120,80,255,.12)');gd.addColorStop(1,'rgba(255,80,80,.18)');ctx.globalAlpha=wa;ctx.fillStyle=gd;ctx.beginPath();ctx.arc(0,0,R0*useg(t,0,300),0,6.283);ctx.fill();ctx.restore();}
  // r2 option B: violet-black dim disk under the circle 2050–3000 ms (before the rings), so the beam's colour reads on bright grass
  if(ULTDIM&&t>=(USOLID?1000:2050)&&t<=3000){const e=(USOLID&&t<2050?.55*useg(t,1000,1150)+.45*useg(t,1900,2050):useg(t,2050,2150))*(1-useg(t,2700,3000));ctx.save();ctx.translate(U.x,U.y);ctx.scale(1,UK);const g=ctx.createRadialGradient(0,0,0,0,0,R0*1.15);
    g.addColorStop(0,'rgba(28,14,60,.42)');g.addColorStop(.75,'rgba(28,14,60,.30)');g.addColorStop(1,'rgba(28,14,60,0)');ctx.globalAlpha=e;ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,R0*1.15,0,6.283);ctx.fill();ctx.restore();}
  // 2 rings: approved images, drawn in by an angular wedge (no scale pop), alternate spin, pulse in the storm, flare at the beam
  const pulse=t>1000&&t<2200?.15*Math.sin(t*.02):0,boost=t>=2200&&t<2600?1-useg(t,2200,2600):0;
  URINGS.forEach(([k,rf,t0,dir,sp,col],i)=>{const prog=ue3(useg(t,t0,t0+300));if(prog<=0)return;const rr=R0*rf,w=rr/ULTR[i],rot=dir*sp*t/1000,fade=1-useg(t,3000+(1-rf)*300,3500+(1-rf)*300);if(fade<=0)return;
    if(RUNEON){runeRing(U.x,U.y,rr,col,Math.min(1,fade*Math.min(1,.85+pulse)+boost*.25),rot,0,prog,UK);R.runeSt.ult++;return;}   /* r80: p287 */
    if(uVok(i)){const D=1024*rr/UVPK[i],im=UOPT?uRingC(i,UVR[i],D*(U.sc||1)):UVR[i];ctx.save();ctx.translate(U.x,U.y);ctx.scale(1,UK);ctx.rotate(rot);   // main line lands on rf·R, flattened like every ground layer
      if(prog<1){ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,D*.75,0,prog*6.283);ctx.closePath();ctx.clip();}
      ctx.globalAlpha=fade*Math.min(1,.85+pulse);ctx.drawImage(im,-D/2,-D/2,D,D);
      if(boost>0||pulse>0){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=fade*(Math.max(0,pulse)+boost*.25);ctx.drawImage(im,-D/2,-D/2,D,D);}ctx.restore();return;}
    const kk=A.fx[k].h/A.fx[k].w;ctx.save();ctx.translate(U.x,U.y);
    if(prog<1){ctx.scale(1,kk);ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,w,rot,rot+prog*6.283);ctx.closePath();ctx.scale(1,1/kk);ctx.clip();}
    gspr(k,0,0,w,rot,{alpha:fade*Math.min(1,.85+pulse)});
    if(boost>0||pulse>0){ctx.globalCompositeOperation='lighter';gspr(k,0,0,w,rot,{alpha:fade*(Math.max(0,pulse)+boost*.25)});}
    ctx.restore();});
  // red compass spikes pop 700–850 ms, 20 ms stagger
  {const fade=1-useg(t,3000,3500);if(t>700&&fade>0&&!uVok(4)){ctx.save();ctx.translate(U.x,U.y);ctx.scale(1,UK);const rot=.22*t/1000;ctx.rotate(rot);ctx.fillStyle='#ff4a3d';
    for(let i=0;i<8;i++){const pop=ue3(useg(t,700+i*20,850+i*20));if(pop<=0)continue;const a=i/8*6.283;ctx.save();ctx.rotate(a);ctx.translate(R0,0);ctx.globalAlpha=fade;const L=18*pop;ctx.beginPath();ctx.moveTo(L,0);ctx.lineTo(0,4);ctx.lineTo(-L*.4,0);ctx.lineTo(0,-4);ctx.closePath();ctx.fill();ctx.restore();}ctx.restore();}}
  // fallback only (V6 ring 1 v2 carries its own rays): 12-point thin-ray star, rotating (no interlaced triangles; DeaRz 09:00)
  {const cp=ue3(useg(t,100,500));if(cp>0&&!uVok(0)){ctx.save();ctx.translate(U.x,U.y);ctx.scale(1,UK);ctx.rotate(-t/600);ctx.globalAlpha=cp*(1-useg(t,3000,3500));ctx.strokeStyle='#a27bff';ctx.lineWidth=1.6;ctx.beginPath();
    for(let i=0;i<12;i++){const a=i/12*6.283,L=R0*(i%2?.12:.19)*cp;ctx.moveTo(Math.cos(a)*R0*.03,Math.sin(a)*R0*.03);ctx.lineTo(Math.cos(a)*L,Math.sin(a)*L);}ctx.stroke();ctx.restore();}}
  u48Runes();
  // 12 burst on the ground (additive only, nothing tilted)
  if(t>=2450&&t<=3300){const u=useg(t,2450,2900),f=1-useg(t,2700,3250);ctx.save();ctx.translate(U.x,U.y);ctx.scale(1,UK);ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
    const rr=R0*(.3+1.15*ue3(u));for(let i=0;i<6;i++){ctx.globalAlpha=f*.5;ctx.strokeStyle=UHUES[i];ctx.lineWidth=Math.max(1,14*(1-u))+2;ctx.beginPath();ctx.arc(0,0,Math.max(1,rr-i*7),0,6.283);ctx.stroke();}
    ctx.globalCompositeOperation='source-over';for(let a=0;a<7;a++){ctx.strokeStyle=UHUES[a];let px,py;for(let j=0;j<=18;j++){const v=j/18,rho=R0*(.08+1.15*v)*(.6+.5*ue3(u)),ph=a/7*6.283+v*2.6+(t-2450)/260,x=Math.cos(ph)*rho,y=Math.sin(ph)*rho;
      if(j){ctx.globalAlpha=f*(.5*(1-v*.7))*uclamp(v*4,0,1);ctx.lineWidth=11*(1-v)+3;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(x,y);ctx.stroke();}px=x;py=y;}}
    if(!uOK(UV9)){ctx.globalCompositeOperation='lighter';const ER=R0*(.95+.25*ue3(u));for(let i=0;i<40;i++){const a=i/40*6.283+.05*Math.sin(t*.01+i),fl=(10+14*Math.abs(Math.sin(t*.03+i*1.7)))*f;ctx.save();ctx.rotate(a);ctx.globalAlpha=f*.8;ctx.fillStyle=UHUES[i%7];ctx.beginPath();ctx.moveTo(ER,-5);ctx.lineTo(ER+fl,0);ctx.lineTo(ER,5);ctx.fill();ctx.restore();}}
    ctx.restore();if(uOK(UV9))u48Flames(t,u,f);}
  ctx.restore();
  u48Dust(-1);u48Storm(-1);u48Beam();}
/* V9 edge flames: 40 tongues (low 20) on the expanding burst edge, pointing outward in screen space, laid flat front/back (×(.55+.45|cos a|)),
   18–30 px × envelope f, random start frame, 18–22 fps, normal blend α .85·f */
function u48Flames(t,u,f){const U=ULT,R0=U.R,n=ULOW()?20:40,ER=R0*(.95+.25*ue3(u));if(!U.fseed){U.fseed=[];for(let i=0;i<40;i++)U.fseed.push([(rnd()*8)|0,urnd(18,22),urnd(18,30)]);}
  ctx.save();ctx.globalCompositeOperation='source-over';
  for(let i=0;i<n;i++){const a=i/n*6.283+.05*Math.sin(t*.01+i),[f0,fps,hh]=U.fseed[i],fr=(f0+Math.floor((t-2450)/1000*fps))%8,ca=Math.cos(a),sa=Math.sin(a),h=hh*f*(.55+.45*Math.abs(ca)),w=h*66/155;if(h<1)continue;
    ctx.save();ctx.translate(U.x+ca*ER,U.y+sa*ER*UK);ctx.rotate(Math.atan2(ca,-sa*UK));ctx.globalAlpha=.85*f;ctx.drawImage(UV9,fr*66,0,66,155,-w/2,-h,w,h);ctx.restore();}
  ctx.restore();}
/* V7 rune motion: (1) cast — runes peel off each ring's pen point every 60 ms (2 per tick ≈ 50 total), rise 18 px while standing up from flat, fade 400 ms;
   (3) 8 small violet runes orbit the core at .12R against ring 1's spin, 0–3000 ms. (2) fade flakes are drawn with the motes. Normal blend, α ≤ .9 */
function u48Runes(){const U=ULT,t=U.et,R0=U.R,T=uRunes();if(!T)return;U.rn=U.rn||[];
  URINGS.forEach(([k,rf,t0,dir,sp],i)=>{for(let tt=t0;tt<=Math.min(t,t0+300);tt+=60){const key='rn'+i+'_'+tt;if(U.ev[key])continue;U.ev[key]=1;
    const prog=ue3(useg(tt,t0,t0+300)),pen=dir*sp*tt/1000+prog*6.283;for(let j=0;j<2;j++){const a=pen-j*.12;U.rn.push({x:Math.cos(a)*R0*rf,z:Math.sin(a)*R0*rf,ci:i,g:(rnd()*UV7N)|0,t0:tt,s:urnd(10,14),r:urnd(-.4,.4)});}}});
  ctx.save();ctx.globalCompositeOperation='source-over';
  for(const q of U.rn){const age=t-q.t0;if(age<0||age>700)continue;const u=ue3(useg(age,0,300)),al=.9*(1-useg(age,300,700)),sy=UK+(1-UK)*u,[x,y]=UP(q.x,q.z,18*u);
    ctx.save();ctx.translate(x,y);ctx.rotate(q.r*u);ctx.scale(1,sy);ctx.globalAlpha=al;ctx.drawImage(T[q.ci],q.g*32,0,32,32,-q.s/2,-q.s/2,q.s,q.s);ctx.restore();}
  if(t<3300){const al=.9*useg(t,0,300)*(1-useg(t,3000,3300)),rot=-1.6*t/1000;for(let i=0;i<8;i++){const a=rot+i/8*6.283,[x,y]=UP(Math.cos(a)*R0*.12,Math.sin(a)*R0*.12,0);
    ctx.save();ctx.translate(x,y);ctx.scale(1,UK);ctx.globalAlpha=al;ctx.drawImage(T[0],(i%UV7N)*32,0,32,32,-4,-4,8,8);ctx.restore();}}
  ctx.restore();}
function u48Storm(side){const U=ULT,t=U.et;if(t<1000||!U.rib.length)return;const Hc=uHc(),Hm=U.HM;ctx.save();ctx.lineCap='round';if(UOPT)uRibCrop();const B=ctx.getTransform();
  for(const r of U.rib){if(r.h<-2)continue;const N=12,pts=[];
    for(let j=0;j<=N;j++){const v=j/N,th=r.th-v*r.arc,h=Math.max(0,r.h-v*r.tilt),rad=uProf(h)*r.rf*r.out;pts.push([uAx(h)+Math.cos(th)*rad,Math.sin(th)*rad,h,Math.sin(th)]);}
    const gi=UGRP[Math.max(0,UHUES.indexOf(r.col))],im=URIB[gi],okR=im.complete&&im.naturalWidth>0,crop=UOPT&&URC?URC[gi]:null;
    const hu=r.h/Math.max(Hc,1),hf=uclamp(r.h/25,0,1)*uclamp((1-hu)/(USOLID?.25:.3),0,1)*r.a;if(hf<=.01)continue;
    if(USOLID&&t<=2200){const dc=uDeep(r.col),fr=side>0,P2=pts.map(q=>UP(q[0],q[1],q[2]));ctx.globalCompositeOperation='source-over';ctx.strokeStyle=dc;   /* r51 solid under-copy: 2 nested batched strokes per ribbon per side */
      for(const [j0,j1,lw,af,ab] of [[1,12,.75,.65,.45],[3,9,1.15,.85,.55]]){ctx.beginPath();let any=0;for(let j=j0;j<=j1;j++){const s0=pts[j-1][3],s1=pts[j][3];if(((s0+s1)>0)!==fr)continue;ctx.moveTo(P2[j-1][0],P2[j-1][1]);ctx.lineTo(P2[j][0],P2[j][1]);any=1;}
        if(any){ctx.globalAlpha=hf*(fr?af:ab);ctx.lineWidth=r.w*lw;ctx.stroke();}}}
    for(let j=1;j<pts.length;j++){const [x0,z0,h0,s0]=pts[j-1],[x1,z1,h1,s1]=pts[j],front=(s0+s1)>0;if((side>0)!==front)continue;
      const tail=1-j/pts.length,a=USOLID?hf*(.45+.55*tail):hf*(.25+.75*tail)*(front?1:.42),[ax,ay]=UP(x0,z0,h0),[bx,by]=UP(x1,z1,h1);
      if(!front&&t<=2200){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a*.35;ctx.strokeStyle=r.col;ctx.lineWidth=r.w*2.4;ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();}  // glow on the back half only
      if(okR&&crop){const cr=crop[12-j];if(cr){// r50: same slice, painted rows only, placed by setTransform
        const dx=ax-bx,dy=ay-by,L=Math.hypot(dx,dy)+1.2,H=r.w*9,sw=512/N,ln=Math.hypot(dx,dy)||1,cs=dx/ln,sn=dy/ln,tx=(ax+bx)/2,ty=(ay+by)/2;
        ctx.setTransform(B.a*cs+B.c*sn,B.b*cs+B.d*sn,-B.a*sn+B.c*cs,-B.b*sn+B.d*cs,B.a*tx+B.c*ty+B.e,B.b*tx+B.d*ty+B.f);
        ctx.globalCompositeOperation='source-over';ctx.globalAlpha=USOLID?a*(front?1:.6):a*(front?.95:.55);ctx.drawImage(im,512-j*sw,cr[0],sw,cr[1]-cr[0],-L/2,-H/2+cr[0]/192*H,L,(cr[1]-cr[0])/192*H);
        ctx.setTransform(B);}}
      else if(okR){// V1 strip: slice j of 12 (head = right end of the image at the leading end), laid along this segment, uniform height
        const dx=ax-bx,dy=ay-by,L=Math.hypot(dx,dy)+1.2,H=r.w*9,sw=512/N;ctx.save();ctx.translate((ax+bx)/2,(ay+by)/2);ctx.rotate(Math.atan2(dy,dx));
        ctx.globalCompositeOperation='source-over';ctx.globalAlpha=USOLID?a*(front?1:.6):a*(front?.95:.55);ctx.drawImage(im,512-j*sw,0,sw,192,-L/2,-H/2,L,H);ctx.restore();}
      else{ctx.globalCompositeOperation=front?'source-over':'lighter';ctx.globalAlpha=a*(front?.9:.6);ctx.strokeStyle=r.col;ctx.lineWidth=r.w*(.4+.6*tail);ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();}}}
  // 6 sparkles riding the vortex (approved u9 stars)
  ctx.globalCompositeOperation='lighter';
  for(const p of U.spk){if(p.h<0)continue;const rad=uProf(p.h)*p.rf,fr=Math.sin(p.th)>0;if((side>0)!==fr)continue;const [x,y]=UP(uAx(p.h)+Math.cos(p.th)*rad,Math.sin(p.th)*rad,p.h),tw=.5+.5*Math.sin(t*.03+p.th*7);
    const pa=(fr?.9:.45)*tw*uclamp((1-p.h/Hm)/.3,0,1),im2=UV2[p.v|0];if(uOK(im2)){ctx.globalCompositeOperation=fr?'source-over':'lighter';ctx.globalAlpha=pa;ctx.drawImage(im2,x-p.s/2,y-p.s/2,p.s,p.s);}   /* V2: normal in front, additive only on the back half */
    else{ctx.globalCompositeOperation='source-over';spr(p.k,x,y,p.s,{a:p.th,alpha:pa});}}
  // 8 soft core (back layer) with 6 fast white streaks; brightens ×1.6 in 2050–2200, fades 2200–2450
  if(side<0&&Hc>2){const fl=.75+.25*Math.sin(t*.05)*Math.sin(t*.017),pre=t>2050&&t<2200?1+1.2*useg(t,2050,2200):1,f=1-useg(t,2200,2450);
    const cx=U.x+uAx(Hc*.5);if(USOLID){ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.35*fl*f;ctx.drawImage(ucoreV(),cx-32,U.y-Hc,64,Hc+6);}   /* r51 normal-blend violet under-core */
    ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(USOLID?.7:.55)*fl*Math.min(pre,1.6)*f;ctx.drawImage(ucore(),cx-40,U.y-Hc,80,Hc+6);
    ctx.strokeStyle='#ffffff';ctx.lineWidth=1.3;for(let i=0;i<6;i++){const a=t/90+i*1.05,hh=((t*.25+i*53)%Hc),[x0,y0]=UP(uAx(hh)+Math.cos(a)*14,Math.sin(a)*14,hh),[x1,y1]=UP(uAx(hh)+Math.cos(a+1)*14,Math.sin(a+1)*14,hh+18);
      ctx.globalAlpha=.5*f;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();}}
  ctx.restore();}
function u48Dust(side){const U=ULT;if(!U.dust.length)return;ctx.save();
  for(const d of U.dust){const z=Math.sin(d.phi);if((side>0)!==(z>0))continue;const [x,y]=UP(Math.cos(d.phi)*d.rho,z*d.rho,d.h);
    if(d.leaf&&uOK(UV8L[d.v])){ctx.save();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=uclamp(d.a,0,1);ctx.translate(x,y);ctx.rotate(d.phi*3+U.et*.01);ctx.scale(1,.4+.6*Math.abs(Math.sin(U.et*.012+d.seed)));ctx.drawImage(UV8L[d.v],-d.ds/2,-d.ds/2,d.ds,d.ds);ctx.restore();}   /* V8 leaf: spin + fake flip */
    else if(!d.leaf&&uOK(UV8D[d.v])){const g=1+.3*uclamp(d.h/60,0,1),w=d.ds*g;ctx.globalCompositeOperation='source-over';ctx.globalAlpha=uclamp(d.a,0,1)*d.da*(1-.5*uclamp(d.h/90,0,1));ctx.drawImage(UV8D[d.v],x-w/2,y-w/2,w,w);}   /* V8 dust: soft, grows ×1.3 and fades as it lifts */
    else if(d.leaf){ctx.globalAlpha=uclamp(d.a,0,1)*.95;ctx.fillStyle=d.col;ctx.save();ctx.translate(x,y);ctx.rotate(d.phi*3+U.et*.01);ctx.scale(1,.5+.5*Math.abs(Math.sin(U.et*.012+d.rho)));ctx.beginPath();ctx.ellipse(0,0,d.s,d.s*.45,0,0,6.283);ctx.fill();ctx.restore();}
    else{ctx.globalAlpha=uclamp(d.a,0,1)*.45;ctx.drawImage(ugl(d.col),x-d.s/2,y-d.s/2,d.s,d.s);}}
  ctx.restore();}
function u48Cast(){const U=ULT,t=U.et;if(t<450||t>1150)return;const hc=ue3(useg(t,450,1000))*170,f=1-useg(t,1000,1150);ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
  for(let k=0;k<3;k++){const col=[UHUES[6],UHUES[4],UHUES[2]][k];let px,py;for(let j=0;j<=22;j++){const v=j/22,h=v*hc,rr=10+55*v,a=k*2.09+v*5.2+t/220,[x,y]=UP(Math.cos(a)*rr,Math.sin(a)*rr,h);
    if(j){ctx.globalAlpha=f*(.25+.75*v)*(1-Math.max(0,v-.85)*5);ctx.strokeStyle=col;ctx.lineWidth=2+5*v;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(x,y);ctx.stroke();}px=x;py=y;}}ctx.restore();}
/* 9 beam (r2): colour bands drawn normally — 7 HUES columns of bw/7 in 12 px rows, edge .45/.8/1, bands flowing down, soft top 110 px, ±3 px wobble;
   additive only for 10 thin white streaks and a narrow hot centre; impact = white pop 100 ms + lilac glow ≤ .45 + cream spikes .5 */
function u48Beam(){const U=ULT,t=U.et;if(t<2050||t>3100)return;ctx.save();const top=U.y-Math.max(60,U.hudW||400);
  if(t<2200){ctx.globalCompositeOperation='lighter';const u=useg(t,2050,2180),yb=top+(U.y-top)*ue3(u);ctx.globalAlpha=.9;ctx.strokeStyle='#fff8e0';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(U.x,top);ctx.lineTo(U.x,yb);ctx.stroke();ctx.drawImage(ugl('#ffffff'),U.x-16,yb-16,32,32);ctx.restore();return;}
  const grow=ue3(useg(t,2200,2280)),shrink=1-useg(t,2650,3050),bw=88*grow*(.4+.6*shrink)*(1+.05*Math.sin(t*.06)),hgt=U.y-top-2,FADE=110,sw=bw/7,STEP=12;
  ctx.globalCompositeOperation='source-over';
  const tex=uOK(UV4),tk=88/256,TH=853;   // V4a texture: 1 texture px = tk screen px at full width, so bands keep their shape while bw grows/shrinks
  for(let y=0;y<hgt;y+=STEP){const wob=Math.sin(y*.05+t*.03)*3*grow,flow=.82+.18*Math.sin((y-t*.9)*.045),ra=uclamp(y/FADE,0,1)*shrink*flow,x0=U.x-bw/2+wob;
    if(tex){let sy=(((y-t*.9)/tk)%TH+TH)%TH;const sh=STEP/tk,h1=Math.min(sh,TH-sy);ctx.globalAlpha=ra;   // scrolls down 0.9 px/ms, wraps seamlessly
      ctx.drawImage(UV4,0,sy,256,h1,x0,top+y,bw,(STEP+.6)*h1/sh);if(h1<sh)ctx.drawImage(UV4,0,0,256,sh-h1,x0,top+y+STEP*h1/sh,bw,(STEP+.6)*(sh-h1)/sh);continue;}
    for(let i=0;i<7;i++){const edge=(i===0||i===6)?.45:(i===1||i===5)?.8:1;ctx.globalAlpha=ra*.8*edge;ctx.fillStyle=UHUES[i];ctx.fillRect(x0+i*sw,top+y,sw+.6,STEP+.6);}}
  ctx.globalCompositeOperation='lighter';ctx.strokeStyle='#ffffff';ctx.lineWidth=1.5;
  for(let i=0;i<10;i++){const sx=U.x-bw/2+((i*37)%7+.5)*sw,yy=((i*97+t*.9)%hgt),ra=uclamp(yy/FADE,0,1)*shrink;ctx.globalAlpha=.45*ra;ctx.beginPath();ctx.moveTo(sx,top+yy);ctx.lineTo(sx,top+Math.min(hgt,yy+46));ctx.stroke();}
  ctx.globalAlpha=.35*shrink;ctx.drawImage(ucore(),U.x-bw*.09,top,bw*.18,hgt);
  const i1=1-useg(t,2200,2300),i2=1-useg(t,2200,2600);
  ctx.globalAlpha=.45*i2;ctx.drawImage(ugl('#c9b8ff'),U.x-110,U.y-50,220,100);
  if(uOK(UV5)){if(t<2380){const u=useg(t,2200,2380),sc=.6+.55*ue3(useg(t,2200,2320)),W=170*sc;   // V5: normal blend, 170 px, scaleY .7, 0.6→1.15 in 120 ms, 0→8°, α .95→0 in 180 ms
      ctx.save();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.95*(1-u);ctx.translate(U.x,U.y-8);ctx.rotate(u*8*Math.PI/180);ctx.scale(1,.7);ctx.drawImage(UV5,-W*UV5AN[0],-W*UV5AN[1],W,W);ctx.restore();}}
  else{ctx.globalAlpha=.8*i1;ctx.drawImage(ugl('#ffffff'),U.x-60,U.y-30,120,56);}
  if(t<2450&&!uOK(UV5)){ctx.strokeStyle='#fff4c8';ctx.lineWidth=2;for(let i=0;i<14;i++){const a=i/14*6.283+.3,L=(60+50*((i*37)%5)/5)*(1.2-i2*.4);ctx.globalAlpha=.5*i2;ctx.beginPath();ctx.moveTo(U.x+Math.cos(a)*20,U.y+Math.sin(a)*20*UK-10);ctx.lineTo(U.x+Math.cos(a)*L,U.y+Math.sin(a)*L*UK-10-(Math.sin(a)<0?40:0));ctx.stroke();}}
  ctx.restore();}
function u48Cry(c){const [x,y]=UP(c.x,c.z,c.h),life=1-c.age/c.life,a=uclamp(life*3,0,1)*(c.float?Math.min(1,c.age*3):1);if(a<=0)return;
  const ang=c.float?.3*Math.sin(c.rot):Math.atan2(-c.vh,c.vx+.001)+Math.PI/2,im=UV3[c.v|0];
  if(uOK(im)){// V3 shard, normal blend, tip leads the flight (per-image lean offset), fake 3D tumble; length 14–26 px, uniform image scale before the tumble
    const L=14+12*uclamp((c.s-5)/7,0,1);ctx.save();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=a;ctx.translate(x,y);ctx.rotate(ang-UV3OFF[c.v|0]*Math.PI/180);ctx.scale(Math.abs(Math.cos(c.rot))*.7+.3,1);
    ctx.drawImage(im,-L/4,-L/2,L/2,L);ctx.restore();return;}
  spr(c.k,x,y,c.s*1.6,{a:ang,alpha:a});}      // fallback: approved u9 shard (uniform scale only)
function u48Front(){const U=ULT;u48Cast();u48Storm(1);u48Dust(1);for(const c of U.cry)u48Cry(c);
  const RT=uRunes();for(const m of U.mot){const [x,y]=UP(m.x,m.z,m.h),im2=UV2[m.v|0];if(m.rune&&RT){ctx.save();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.9*(1-m.age/m.life);ctx.translate(x,y);ctx.rotate(m.rot+m.age*1.2);ctx.drawImage(RT[m.ci],m.g*32,0,32,32,-5,-5,10,10);ctx.restore();}else if(uOK(im2)){ctx.save();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.9*(1-m.age/m.life);ctx.drawImage(im2,x-6,y-6,12,12);ctx.restore();}else spr(m.k,x,y,12,{alpha:1-m.age/m.life});}}
if(!ULTOLD){
  const _ug=drawUltGround;drawUltGround=function(now){if(ULT&&ULT.v48)return u48Ground();return _ug(now);};
  const _uu=drawUltUp;drawUltUp=function(now){if(ULT&&ULT.v48)return u48Front();return _uu(now);};
  const _ss=drawStormSide;drawStormSide=function(front,now){if(ULT&&ULT.v48)return;return _ss(front,now);};
  // monster hit read: keep the sprite, white rim + additive violet tint, decays 5/s (never a white blob: the game's flash is cleared on ult hits)
  if(typeof drawEnemy==='function'){const _de=drawEnemy;drawEnemy=function(e){const r=_de.apply(this,arguments);try{const f=e._uh;if(f>0&&!e.dead){const s=e.sz||16,cy=e.y-s*.6;
    ctx.save();ctx.globalCompositeOperation='source-over';ctx.filter='none';ctx.beginPath();ctx.ellipse(e.x,cy,s*1.05,s*1.1,0,0,6.283);ctx.save();ctx.clip();{const g=ctx.createRadialGradient(e.x,cy,0,e.x,cy,s*1.1);g.addColorStop(0,'rgba(155,107,255,.32)');g.addColorStop(1,'rgba(155,107,255,.12)');ctx.globalAlpha=f;ctx.fillStyle=g;ctx.fill();}ctx.restore();
    ctx.globalAlpha=.7*f;ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.stroke();ctx.beginPath();ctx.restore();}}   /* empty path after: game code that fills the current path next must not get this ellipse */catch(_){}return r;};}
}
if(typeof textAt==='function'){const _ta=textAt;textAt=function(x,y,txt){if(R.supp&&/^✦?[\d.,]+[kKmMbB]?$/.test(String(txt)))return;return _ta.apply(this,arguments);};}const ELGSRC={Fire:'assets/bc2146b6d8b5695d.webp',Ice:'assets/31af2834dfca141c.webp',Lightning:'assets/98156a0f356302e0.webp',Earth:'assets/05057179d2e3517f.webp'};

/* ---- r55: element status badge over mobs (replaces the 3 motes, ?elbadge=off) + element icon in name tags (replaces the [ไฟ] word, ?eltag=text).
   Glyphs E1–E4 (ChatGPT art, art check PASS 16:10): incoming/e_*.png cropped to alpha box, uniform scale to longest side 64, lossless WebP. ---- */
const ELB=!/elbadge=off/.test(location.search),ELTAG=!/eltag=text/.test(location.search);
const ELC={Fire:'#ff7a3a',Ice:'#6fd8ff',Lightning:'#ffe14a',Earth:'#b98a4a'};
const ELG={};for(const k in ELGSRC){const i=new Image();i.src=ELGSRC[k];ELG[k]=i;}
const elgOk=k=>{const i=ELG[k];return !!(i&&i.complete&&i.naturalWidth);};
function elGlyph(k,x,y,sz,al){const i=ELG[k];if(!elgOk(k))return;const s=sz/Math.max(i.naturalWidth,i.naturalHeight),w=i.naturalWidth*s,h=i.naturalHeight*s;
  ctx.globalAlpha=al;ctx.drawImage(i,x-w/2,y-h/2,w,h);}
R.elb={on:ELB,tag:ELTAG,stats:{badges:0,peak:0,burst:0,refresh:0,apply:0,expire:0,icons:0,numLift:0}};
/* events from shit(): apply / refresh, reaction burst */
function elbSet(e,prev){const now=clk();if(prev&&prev.el===e._stfEl.el&&now<prev.end){e._elRef=now;R.elb.stats.refresh++;}
  else{e._elPop=now;e._elRef=0;R.elb.stats.apply++;}e._elGone=null;}
function elbGone(e,st,kind){const now=clk();if(now>=st.end)return;e._elGone={el:st.el,t:now,kind,f:Math.max(0,Math.min(1,(st.end-now)/Math.max(.01,st.end-st.t0)))};
  if(kind==='burst')R.elb.stats.burst++;}
/* badge row centre: above the name tag drawn this frame, else from the mob's size (same top rule as the game's tag) */
function elbY(e,tol){const t=e._elTag;if(t&&(tol?Math.abs(time-t.t)<tol:t.t===time))return t.y-36;return e.y-(e.sz||16)*1.9-17-36;}
const easeO=u=>1-(1-u)*(1-u);
function badge(x,y,el,o){const col=ELC[el]||'#ffffff',now=clk();let sc=1,al=1;
  if(o.pop!=null){const u=(now-o.pop)/.16;if(u<1)sc=u<.6?.6+.52*easeO(u/.6):1.12-.12*((u-.6)/.4);}
  if(o.ref){const u=(now-o.ref)/.12;if(u<1)sc*=u<.5?1+.08*(u/.5):1.08-.08*((u-.5)/.5);}
  if(o.exp!=null){const u=Math.min(1,o.exp/.15);sc*=1-.2*u;al=1-u;}
  if(o.burst!=null){const u=Math.min(1,o.burst/.2);sc*=1+.5*easeO(u);al=1-u;}
  if(o.blink)al*=o.blink;
  if(al<=0)return;
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.globalCompositeOperation='source-over';
  ctx.globalAlpha=al*.85;ctx.fillStyle='#1a1424';ctx.beginPath();ctx.arc(0,0,12,0,6.283);ctx.fill();   // 1 plate
  ctx.globalAlpha=al;ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,11.25,0,6.283);ctx.stroke();   // rim
  ctx.globalAlpha=al*.7;ctx.strokeStyle='rgba(10,6,16,.9)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,13.6,0,6.283);ctx.stroke();   // drained track
  const f=o.f;if(f>0){ctx.globalAlpha=al;ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.lineCap='butt';ctx.beginPath();ctx.arc(0,0,13.6,-1.5708+(1-f)*6.283,4.7124);ctx.stroke();}   // 3 countdown ring, drains clockwise from 12
  if(o.pop!=null){const u=(now-o.pop)/.16;if(u<1){ctx.globalAlpha=al*(1-u);ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,13.6+u*3,0,6.283);ctx.stroke();}}   // apply ring flash
  if(o.ref){const u=(now-o.ref)/.12;if(u<1){ctx.globalAlpha=al*(1-u*.6);ctx.strokeStyle='#ffffff';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,13.6,-1.5708,-1.5708+6.283*easeO(u));ctx.stroke();}}   // refresh white sweep
  ctx.globalCompositeOperation='lighter';glow(0,0,11,rgba(col,.5),al*(.8+.2*Math.sin(now*4.488)));ctx.globalCompositeOperation='source-over';   // idle breathe .6↔1 (1.4 s)
  elGlyph(el,0,0,18,al);   // 2 glyph
  if(o.sec!=null){ctx.globalAlpha=al;ctx.font='700 11px "Noto Sans Thai", system-ui, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
    ctx.strokeStyle='#120c1a';ctx.lineWidth=4;ctx.strokeText(String(o.sec),9,8);ctx.fillStyle='#ffffff';ctx.fillText(String(o.sec),9,8);ctx.textBaseline='alphabetic';}   // 4 seconds left
  ctx.restore();
  if(o.burst!=null){const u=Math.min(1,o.burst/.2);ctx.save();ctx.globalCompositeOperation='lighter';
    for(let k=0;k<4;k++){const a=.785+k*1.571,d=12+u*22;glow(x+Math.cos(a)*d,y+Math.sin(a)*d,5,rgba(col,.95),1-u);}ctx.restore();}}
function drawElBadges(){const now=clk();let n=0;
  for(const e of enemies){if(!liveE(e)){continue;}const st=e._stfEl,g=e._elGone,list=[];
    if(st&&now<st.end){const rem=st.end-now,f=rem/Math.max(.01,st.end-st.t0);list.push({el:st.el,f,sec:Math.ceil(rem-1e-6),pop:e._elPop,ref:e._elRef,blink:rem<1?(Math.floor(rem*8)%2?.35:1):1});}
    else if(st&&now<st.end+.15){list.push({el:st.el,f:0,exp:now-st.end});if(!e._elExp){e._elExp=1;R.elb.stats.expire++;}}
    else if(g&&now-g.t<.2)list.push({el:g.el,f:g.f,burst:now-g.t});
    if(st&&now<st.end)e._elExp=0;
    if(!list.length)continue;
    const y=elbY(e),gap=4,w=24,x0=e.x-(list.length*w+(list.length-1)*gap)/2+w/2;   // later debuffs join this row, left to right
    e._elBy=y-14;e._elByT=now;
    list.forEach((b,i)=>{badge(x0+i*(w+gap),y,b.el,b);n++;});}
  R.elb.stats.badges=n;R.elb.stats.peak=Math.max(R.elb.stats.peak,n);}
/* damage numbers (and the weak/resist label) start above the badge while it shows */
if(ELB&&typeof applyDamage==='function'){const _ad=applyDamage;applyDamage=function(e,d,crit,o){
  let ok=false;try{const c=C182.cur,st=e&&e._stfEl;ok=!!(e&&!e.dead&&((st&&clk()<st.end)||(c&&c.stf&&c.el&&c.el!=='Neutral'&&!(o&&o.dot))));}catch(_){}   // a badge shows now, or this staff element hit is about to put one up
  if(!ok)return _ad.apply(this,arguments);const by=elbY(e,.25)-14;
  const _t=textAt;let dy=null;textAt=function(x,y,txt,c,size,oo){if(dy==null)dy=Math.min(0,by-4-y);if(dy)R.elb.stats.numLift++;return _t.call(this,x,y+dy,txt,c,size,oo);};
  try{return _ad.apply(this,arguments);}finally{textAt=_t;}};}
/* name tag: glyph on a small dark plate before the name; the text word is dropped. Neutral mobs: nothing. */
if(ELTAG&&typeof dgapTag==='function'){const _g=dgapTag;dgapTag=function(e){const s=_g.apply(this,arguments);return typeof s==='string'?s.replace(/ \[(ไฟ|น้ำแข็ง|สายฟ้า|ดิน)\]$/,''):s;};}
if(typeof drawEnemy==='function'){const _de=drawEnemy;drawEnemy=function(e){
  const el=ELTAG&&e&&!e.dead?e.elem:null,ic=el&&ELC[el]&&elgOk(el);
  if(!ic&&!ELB)return _de.apply(this,arguments);
  const own=Object.prototype.hasOwnProperty.call(ctx,'fillText'),ft=ctx.fillText;let done=false;
  ctx.fillText=function(tx,x,y,mw){
    if(!done&&typeof tx==='string'&&/Lv\d/.test(tx)){done=true;
      try{if(ic){const w=ctx.measureText(tx).width,al=ctx.textAlign,S=22;   // icon 17 px + 5 px gap; the text moves right by half of it so the pair stays centred
          let left;if(al==='center'){x+=S/2;left=x-w/2;}else if(al==='right'||al==='end')left=x-w;else{x+=S;left=x;}
          const cx=left-5-8.5,cy=y-4;
          ctx.save();ctx.shadowBlur=0;ctx.globalAlpha=.75;ctx.fillStyle='#1a1424';ctx.beginPath();ctx.arc(cx,cy,8.5,0,6.283);ctx.fill();
          ctx.globalAlpha=1;ctx.strokeStyle=ELC[el];ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,8,0,6.283);ctx.stroke();elGlyph(el,cx,cy,14,1);ctx.restore();R.elb.stats.icons++;}
        e._elTag={x,y,t:time};}catch(_){}}
    return mw===undefined?ft.call(this,tx,x,y):ft.call(this,tx,x,y,mw);};
  try{return _de.apply(this,arguments);}finally{if(own)ctx.fillText=ft;else delete ctx.fillText;}};}

/* ---- r56: ROV-style aim for sword + bow bottom-bar skills too (DeaRz 18:29 "ทำให้เหมือนกันทั้งหมด"), same feel as the staff aim of r51:
   hold the slot → range circle + where it lands; drag to aim (110 px = full reach); release = cast there; tap = auto target as before;
   drag out and back onto the slot = cancel. Sword Judgement (charge) steers with the drag while charging. Self / buff skills cast on press.
   The sword and bow slot handlers are older code: a real press on an aim slot is hidden from them (their slot lookup returns nothing),
   and the cast goes back through them as a synthetic press, so their own checks and messages stay. ?skaim=off = r55 behaviour ---- */
const RV=R.rov={on:null,ch:null,stats:{aimed:0,tap:0,cancel:0,pass:0,noTarget:0,charge:0}};
const SLOTSEL='#bar .slot[data-i]:not(.pot),#tSkills .tsk[data-ti]';
const swEq=()=>!!(P&&P.weapon&&P.weapon.t==='sword'),bwEq=()=>!!(P&&P.weapon&&P.weapon.t==='bow');
const JADE='#3fd6a0',GOLD='#ffd98a';
function rovSpec(w,k){try{
  if(w==='bow'){const c=window.BSK&&BSK.cfg&&BSK.cfg[k];if(!c)return null;
    if(k==='pierce')return {t:'line',rg:c.range,w:c.width};if(k==='lantern')return {t:'line',rg:c.len,w:c.width};
    if(k==='leap')return {t:'line',rg:c.range,w:14,back:c.back};if(k==='fan')return c.triOn?{t:'target',rg:c.range}:{t:'fan',rg:c.range,sp:c.spread,n:c.n};   /* r77: p284 one target */
    if(k==='rain')return {t:'area',rg:c.castRange,r:c.radius};if(k==='weak')return {t:'target',rg:c.range};return null;}
  if(w==='sword'){if(k==='sk1')return {t:'target',rg:window.__SK1.cfg.useRange};if(k==='sk2'){const f=window.__SWRW&&__SWRW.aimSpec&&__SWRW.aimSpec();if(f)return f;return {t:'target',rg:window.__SK2L.cfg.useRange};}   /* r71: p281 fan aim */return null;}
}catch(_){}return null;}
function rovOf(el){if(!el||!AIMON)return null;const b=el.dataset.bs,w=el.dataset.ws;
  if(b&&bwEq()){const s=rovSpec('bow',b);return s?{w:'bow',k:b,s}:null;}
  if(w&&swEq()){const s=rovSpec('sword',w);return s?{w:'sword',k:w,s}:null;}return null;}
const _closest=Element.prototype.closest;
Element.prototype.closest=function(sel){const r=_closest.call(this,sel);
  try{if(r&&typeof sel==='string'&&sel.indexOf('.slot[data-i]')>=0){const ev=window.event;if(ev&&ev.isTrusted&&((ev.type==='pointerdown'&&rovOf(r))||(RV.on&&(ev.type==='pointerup'||ev.type==='pointercancel'||ev.type==='click'))))return null;}}catch(_){}
  return r;};
function rovPass(el,ev){RV.stats.pass++;const o={bubbles:true,cancelable:true,pointerId:ev?ev.pointerId:1,clientX:ev?ev.clientX:0,clientY:ev?ev.clientY:0,pointerType:ev&&ev.pointerType||'mouse'};
  let e2;try{e2=new PointerEvent('pointerdown',o);}catch(_){e2=new MouseEvent('pointerdown',o);}el.dispatchEvent(e2);}
const notReady=el=>el.classList.contains('wsoff')||el.classList.contains('nomp')||!!((el.querySelector('.cdt')||{}).textContent||'').trim();
function rovAuto(A){const s=A.s,T=window.TLOCK;let x,y;
  const t=T&&T.e&&liveE(T.e)&&Math.hypot(T.e.x-P.x,T.e.y-P.y)<=s.rg+60?T.e:null;
  if(t){x=t.x;y=t.y;}else{try{const a=aimPoint(s.rg);x=a.x;y=a.y;}catch(_){x=P.x+Math.cos(P.face||0)*s.rg*.6;y=P.y+Math.sin(P.face||0)*s.rg*.6;}}
  return {x,y};}
function rovCur(A){const s=A.s,dx=A.mx-A.sx,dy=A.my-A.sy,dl=Math.hypot(dx,dy),area=s.t==='area'||s.t==='target';
  if(dl>=AIMTAP){const y=yaw(),cs=Math.cos(-y),sn=Math.sin(-y),wx=(dx*cs-dy*sn)/dl,wy=(dx*sn+dy*cs)/dl,f=area?Math.min(1,dl/AIMPX):1;
    return {x:P.x+wx*s.rg*f,y:P.y+wy*s.rg*f,ang:Math.atan2(wy,wx),drag:true};}
  const a=rovAuto(A);let x=a.x-P.x,y=a.y-P.y;const d=Math.hypot(x,y)||1,f=area?Math.min(1,s.rg/d):s.rg/d;
  return {x:P.x+x*f,y:P.y+y*f,ang:Math.atan2(y,x),drag:false};}
addEventListener('pointerdown',e=>{try{if(!e.isTrusted||!AIMON)return;const el=e.target&&_closest.call(e.target,SLOTSEL);const o=rovOf(el);if(!o)return;
  e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();
  if(RV.on){RV.on=null;RV.stats.cancel++;}   // a press that never got its release (lost pointer): drop it
  if(notReady(el)||P.dead||G.state!=='play'){rovPass(el,e);return;}   // cooldown / MP / locked: the old handler shows its usual message
  RV.on=Object.assign(o,{pid:e.pointerId,sx:e.clientX,sy:e.clientY,mx:e.clientX,my:e.clientY,el,t0:clk(),maxd:0});document.body.classList.add('stfAiming');
  if(el.classList.contains('tsk')){el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),350);}}catch(er){R.err='rov down '+er.message;}},true);
function rovEnd(ev,cancel){const A=RV.on;if(!A)return;RV.on=null;document.body.classList.remove('stfAiming');if(cancel){RV.stats.cancel++;return;}
  const back=A.maxd>=AIMTAP&&(()=>{const r=A.el.getBoundingClientRect();return ev.clientX>=r.left&&ev.clientX<=r.right&&ev.clientY>=r.top&&ev.clientY<=r.bottom;})();
  if(back){RV.stats.cancel++;try{textAt(P.x,P.y-62,(A.el.title||'สกิล')+': ยกเลิก','#d8c9ff',13);}catch(_){}return;}
  const q=rovCur(A),T=window.TLOCK;
  if(!q.drag){RV.stats.tap++;rovPass(A.el,ev);return;}
  RV.stats.aimed++;
  if(A.s.t==='target'){const e=nearestE(q.x,q.y,90);if(!e||Math.hypot(e.x-P.x,e.y-P.y)>A.s.rg+(e.sz||16)+60){RV.stats.noTarget++;try{textAt(P.x,P.y-62,(A.el.title||'สกิล')+': ไม่มีเป้าตรงจุดที่เล็ง','#ffd98a',13);}catch(_){}return;}
    try{T&&T.set(e,'click','เล็งด้วยสกิล');}catch(_){}rovPass(A.el,ev);return;}
  const ap=aimPoint,pe=T?T.e:null;
  aimPoint=function(range){let x=q.x,y=q.y;if(range){const d=Math.hypot(x-P.x,y-P.y);if(d>range){x=P.x+(x-P.x)/d*range;y=P.y+(y-P.y)/d*range;}}return {x,y};};
  if(T)T.e=null;
  try{rovPass(A.el,ev);}finally{aimPoint=ap;if(T&&T.e===null)T.e=pe;}}
/* Sword Judgement (atk4, hold to charge): its own slot handler takes the press and holds the pointer; while charging the drag steers it */
const ap0=aimPoint;
aimPoint=function(range){const C=RV.ch;if(C&&C.drag&&AIMON&&swEq()){const y=yaw(),cs=Math.cos(-y),sn=Math.sin(-y),dx=C.mx-C.sx,dy=C.my-C.sy,dl=Math.hypot(dx,dy)||1,L=range||200;
    return {x:P.x+(dx*cs-dy*sn)/dl*L,y:P.y+(dx*sn+dy*cs)/dl*L};}
  return ap0.apply(this,arguments);};
addEventListener('gotpointercapture',e=>{try{if(!AIMON||!swEq())return;const el=e.target&&e.target.closest&&_closest.call(e.target,SLOTSEL);if(!el||el.dataset.ws!=='atk4')return;
  const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;RV.ch={pid:e.pointerId,sx:cx,sy:cy,mx:cx,my:cy,el,drag:false};RV.stats.charge++;}catch(_){}},true);   // start = slot centre (the press itself went to the old handler)
for(const t of ['lostpointercapture','pointerup','pointercancel'])addEventListener(t,e=>{const C=RV.ch;if(C&&e.pointerId===C.pid)RV.ch=null;},true);
addEventListener('pointermove',e=>{const A=RV.on;if(A&&e.pointerId===A.pid){A.mx=e.clientX;A.my=e.clientY;A.maxd=Math.max(A.maxd,Math.hypot(A.mx-A.sx,A.my-A.sy));e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();return;}
  const C=RV.ch;if(C&&e.pointerId===C.pid){C.mx=e.clientX;C.my=e.clientY;if(!C.drag&&Math.hypot(C.mx-C.sx,C.my-C.sy)>=AIMTAP){C.drag=true;try{window.TLOCK&&TLOCK.clear('เล็งด้วยสกิล');}catch(_){}}}},true);
for(const t of ['pointerup','pointercancel'])addEventListener(t,e=>{const A=RV.on;if(!A||e.pointerId!==A.pid)return;e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();
  rovEnd(e,t==='pointercancel'||G.state!=='play'||(A.w==='bow'?!bwEq():!swEq()));},true);
addEventListener('keydown',e=>{if(RV.on&&e.key==='Escape'){rovEnd(e,true);e.stopImmediatePropagation();}},true);
function rovDraw(){const A=RV.on,C=RV.ch;if(!A&&!(C&&C.drag))return;
  if(A&&(P.dead||(A.w==='bow'?!bwEq():!swEq()))){RV.on=null;document.body.classList.remove('stfAiming');return;}
  const now=clk(),pu=.85+.15*Math.sin(now*8);ctx.save();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  if(C&&C.drag&&!A){const a=aimPoint(170),ang=Math.atan2(a.y-P.y,a.x-P.x);ctx.translate(P.x,P.y);ctx.rotate(ang);ctx.fillStyle=rgba(GOLD,.22*pu);ctx.strokeStyle=rgba(GOLD,.9);ctx.lineWidth=2;
    ctx.beginPath();ctx.rect(14,-14,150,28);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(184,0);ctx.lineTo(160,-24);ctx.lineTo(160,24);ctx.closePath();ctx.fillStyle=rgba(GOLD,.85);ctx.fill();ctx.restore();return;}
  const s=A.s,q=rovCur(A),col=A.w==='bow'?JADE:GOLD;
  ctx.fillStyle=rgba(col,.08);ctx.strokeStyle='rgba(240,240,225,.55)';ctx.lineWidth=2;ctx.setLineDash([10,7]);ctx.beginPath();ctx.arc(P.x,P.y,s.rg,0,6.283);ctx.fill();ctx.stroke();ctx.setLineDash([]);   // real reach
  if(s.t==='line'){ctx.save();ctx.translate(P.x,P.y);ctx.rotate(q.ang);const w=s.w,L=s.rg;ctx.fillStyle=rgba(col,.22*pu);ctx.strokeStyle=rgba(col,.9);ctx.lineWidth=2;
    ctx.beginPath();ctx.rect(14,-w/2,L-14,w);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(L+14,0);ctx.lineTo(L-6,-w/2-8);ctx.lineTo(L-6,w/2+8);ctx.closePath();ctx.fillStyle=rgba(col,.85);ctx.fill();
    if(s.back){ctx.setLineDash([6,6]);ctx.strokeStyle='rgba(240,240,225,.7)';ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(-s.back,0);ctx.stroke();ctx.setLineDash([]);   // where the hero jumps back to
      ctx.beginPath();ctx.arc(-s.back,0,14,0,6.283);ctx.stroke();}
    ctx.restore();}
  else if(s.t==='fan'){ctx.save();ctx.translate(P.x,P.y);ctx.rotate(q.ang);const h=s.sp*Math.PI/360;ctx.fillStyle=rgba(col,.16*pu);ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,s.rg,-h,h);ctx.closePath();ctx.fill();
    ctx.strokeStyle=rgba(col,.9);ctx.lineWidth=2;for(let i=0;i<s.n;i++){const a=-h+i*(2*h)/(s.n-1);ctx.beginPath();ctx.moveTo(Math.cos(a)*14,Math.sin(a)*14);ctx.lineTo(Math.cos(a)*s.rg,Math.sin(a)*s.rg);ctx.stroke();}ctx.restore();}
  else{const r=s.t==='area'?s.r:36;ctx.beginPath();ctx.moveTo(P.x,P.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle='rgba(240,240,225,.5)';ctx.lineWidth=2;ctx.stroke();
    ctx.beginPath();ctx.arc(q.x,q.y,r,0,6.283);ctx.fillStyle=rgba(col,.20*pu);ctx.fill();ctx.strokeStyle=rgba(col,.95);ctx.lineWidth=3;ctx.stroke();
    if(s.t==='target'){const e=nearestE(q.x,q.y,90);if(e){ctx.beginPath();ctx.arc(e.x,e.y,(e.sz||16)+10,0,6.283);ctx.strokeStyle='#fff4b0';ctx.lineWidth=2.5;ctx.stroke();}}}
  ctx.restore();}
if(typeof drawRaidTele==='function'){const o=drawRaidTele;drawRaidTele=function(){const r=o.apply(this,arguments);try{rovDraw();}catch(e){R.err='rov draw '+e.message;}return r;};}
/* ---- r64 PC aim (DeaRz 21 Oct 19:36): on a computer, a skill key or a mouse click on a skill slot opens the same aim circle as the
   phone drag, but it follows the mouse; left click = cast there, right click / Esc = cancel, the same key again = cast at the mouse.
   Phone / touch keeps the hold-drag-release aim of r51 / r56. Self / buff skills still cast at once. Line skills point at the mouse
   (full length), area skills land on the mouse (clamped to reach), target skills take the monster nearest the mouse. ---- */
const PCA=R.pca={on:!/pcaim=off/.test(location.search)&&AIMON,A:null,pass:false,swallow:null,stats:{start:0,cast:0,cancel:0,again:0,noTarget:0}};
const PCPID=-7;
function pcWorld(){try{return {x:mwx(mouse.x,mouse.y),y:mwy(mouse.x,mouse.y)};}catch(_){return {x:P.x+Math.cos(P.face||0)*200,y:P.y+Math.sin(P.face||0)*200};}}
function pcCur(rg,area){const m=pcWorld();let x=m.x-P.x,y=m.y-P.y;const d=Math.hypot(x,y);if(d<1){x=Math.cos(P.face||0);y=Math.sin(P.face||0);}
  const L=Math.hypot(x,y),f=area?Math.min(1,rg/Math.max(L,1e-6))*(d<1?0:1):rg/L;return {x:P.x+x*f,y:P.y+y*f,ang:Math.atan2(y,x),drag:true};}
{const o=rovCur;rovCur=function(A){if(A&&A.pc)return pcCur(A.s.rg,A.s.t==='area'||A.s.t==='target');return o.apply(this,arguments);};}
{const o=aimCur;aimCur=function(A){if(A&&A.pc){const k=A.k;return pcCur(aimRange(k),k==='ult'||(k==='chain'&&!CFG.chain.ballOn)||(k==='spikes'&&CFG.spikes.areaOn)||(k==='ice'&&CFG.ice.bzOn)||(k==='fireball'&&CFG.fireball.fzOn)||k==='curse');}return o.apply(this,arguments);};}
const typingIn=t=>!!(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'||t.isContentEditable));
const PCSLOT=['1','2','3','4','5','6','q','e','r','f'];
const slotOfKey=key=>{const i=PCSLOT.indexOf(key);return i<0?null:document.querySelector('#bar .slot[data-i="'+i+'"]');};
/* while the circle is up, a click on a monster must cast, not pick a target: the click-lock picker (p253 TLOCK, capture phase, registered
   before us) is switched off for that time */
function tlOff(){const T=window.TLOCK;if(T&&PCA.tl===undefined){PCA.tl=T.on;T.on=false;}}
function tlBack(){const T=window.TLOCK;if(T&&PCA.tl!==undefined){T.on=PCA.tl;}PCA.tl=undefined;}
function pcLive(){const A=PCA.A;if(!A)return null;const on=A.kind==='staff'?AIM.on:RV.on;if(!on||!on.pc){PCA.A=null;tlBack();document.body.classList.remove('pcAiming');return null;}return A;}
/* which skill a key / slot means for the weapon in hand, and whether it can be aimed (null = leave the event to the old handlers) */
function pcResolve(key,el){
  if(stfEq()){let k=null;if(el)k=el.dataset.ss||null;else{k=KEYMAP[key]||null;if(!k){const i=PCSLOT.indexOf(key);if(i>=0&&key!=='r')k=SS.map[i]||null;}}
    if(!k||!AIMK[k])return null;return {kind:'staff',k,w:'staff',fire:()=>cast(k)};}
  if(!el&&key){el=slotOfKey(key);const B=window.BSK;
    if(bwEq()&&B&&B.cfg){for(const kk in B.cfg){const c=B.cfg[kk];if(c&&c.key&&String(c.key).toLowerCase()===key){el=document.querySelector('#bar .slot[data-bs="'+kk+'"]')||{dataset:{bs:kk},fake:1};break;}}}
    if(swEq()){const m={j:'sk1',u:'sk2'}[key];if(m)el=document.querySelector('#bar .slot[data-ws="'+m+'"]')||{dataset:{ws:m},fake:1};}}
  const o=el&&rovOf(el);if(!o)return null;
  if(!el.fake&&notReady(el))return null;   // cooldown / MP / locked: the old handler shows its usual message
  return Object.assign(o,{kind:'rov',el:el.fake?null:el});}
function pcStart(r,key,fromSlot){
  if(r.kind==='staff'){if(!aimStart(r.k,{pointerId:PCPID,clientX:0,clientY:0},fromSlot||null))return false;AIM.on.pc=true;}
  else{if(RV.on)RV.on=null;RV.on={w:r.w,k:r.k,s:r.s,pc:true,pid:PCPID,sx:0,sy:0,mx:0,my:0,el:r.el,t0:clk(),maxd:0};}
  PCA.A={kind:r.kind,k:r.k,w:r.w,key:key||null,el:r.el||fromSlot||null,fire:r.fire||null};PCA.stats.start++;
  tlOff();document.body.classList.add('stfAiming','pcAiming');return true;}
function pcCancel(msg){const A=pcLive();if(!A)return;PCA.A=null;tlBack();PCA.stats.cancel++;if(A.kind==='staff')AIM.on=null;else RV.on=null;document.body.classList.remove('stfAiming','pcAiming');
  if(msg)try{textAt(P.x,P.y-62,msg,'#d8c9ff',13);}catch(_){}}
function pcKeyFire(key){PCA.pass=true;try{const ev=new KeyboardEvent('keydown',{key,code:/^[a-z]$/.test(key)?'Key'+key.toUpperCase():/^[0-9]$/.test(key)?'Digit'+key:'',bubbles:true,cancelable:true});
    (document.activeElement&&document.activeElement!==document.body?document.body:document.body).dispatchEvent(ev);
    const up=new KeyboardEvent('keyup',{key,code:ev.code,bubbles:true,cancelable:true});document.body.dispatchEvent(up);}finally{PCA.pass=false;}}
function pcFire(){const A=pcLive();if(!A)return;PCA.A=null;tlBack();document.body.classList.remove('stfAiming','pcAiming');
  if(A.kind==='staff'){const S0=AIM.on;const q=aimCur(S0);AIM.on=null;PCA.stats.cast++;R.aimOv={x:q.x,y:q.y};try{cast(A.k);}finally{R.aimOv=null;}return;}
  const S0=RV.on,q=rovCur(S0),T=window.TLOCK;RV.on=null;
  const go=()=>{if(A.el)rovPass(A.el,{pointerId:1,clientX:0,clientY:0,pointerType:'mouse'});else if(A.key)pcKeyFire(A.key);};
  if(S0.s.t==='target'){const e=nearestE(q.x,q.y,90);if(!e||Math.hypot(e.x-P.x,e.y-P.y)>S0.s.rg+(e.sz||16)+60){PCA.stats.noTarget++;try{textAt(P.x,P.y-62,((A.el&&A.el.title)||'สกิล')+': ไม่มีเป้าตรงจุดที่เล็ง','#ffd98a',13);}catch(_){}return;}
    PCA.stats.cast++;try{T&&T.set(e,'click','เล็งด้วยสกิล');}catch(_){}go();return;}
  PCA.stats.cast++;const ap=aimPoint,pe=T?T.e:null;
  aimPoint=function(range){let x=q.x,y=q.y;if(range){const d=Math.hypot(x-P.x,y-P.y);if(d>range){x=P.x+(x-P.x)/d*range;y=P.y+(y-P.y)/d*range;}}return {x,y};};
  if(T)T.e=null;
  try{go();}finally{aimPoint=ap;if(T&&T.e===null)T.e=pe;}}
const playOK=()=>G.state==='play'&&!P.dead&&!W.open&&!G.win&&!(typeof ED!=='undefined'&&ED.on);
if(PCA.on&&window.__PCAH){
  window.__PCAH.key=e=>{if(!e.isTrusted||PCA.pass||e.repeat||e.ctrlKey||e.metaKey||e.altKey||typingIn(e.target))return false;const key=(e.key||'').toLowerCase();
    const A=pcLive();
    if(A&&key==='escape'){pcCancel((A.kind==='staff'?CFG[A.k].name:((A.el&&A.el.title)||'สกิล'))+': ยกเลิก');return true;}
    if(!playOK())return false;
    if(A&&A.key&&key===A.key){PCA.stats.again++;pcFire();return true;}   // same key again = cast at the mouse
    const r=pcResolve(key,null);
    if(!r){if(A&&(PCSLOT.indexOf(key)>=0||KEYMAP[key]))pcCancel();return false;}   // another skill key that casts at once: drop the circle, let it cast
    if(A)pcCancel();return pcStart(r,key,null);};
  window.__PCAH.ptr=e=>{if(!e.isTrusted)return false;const t=e.type,A=pcLive();
    if(PCA.swallow!==null&&(t==='pointerup'||t==='mousedown'||t==='mouseup'||t==='click'||t==='auxclick'||t==='contextmenu')){if(t==='click'||t==='auxclick'||t==='contextmenu'){PCA.swallow=null;}return true;}
    if(t!=='pointerdown')return A&&t==='contextmenu';
    if(e.pointerType==='touch'){if(A)pcCancel();return false;}   // touching the screen: phone aim as before
    const slot=e.target&&e.target.closest&&_closest.call(e.target,SLOTSEL);
    if(A){
      if(e.button===2){pcCancel((A.kind==='staff'?CFG[A.k].name:((A.el&&A.el.title)||'สกิล'))+': ยกเลิก');PCA.swallow=e.pointerId;return true;}
      if(e.button!==0)return false;
      if(slot){const same=slot===A.el;pcCancel(same?((slot.title||'สกิล')+': ยกเลิก'):null);if(same){PCA.swallow=e.pointerId;return true;}}
      else{const ui=e.target&&e.target.closest&&e.target.closest('button,a,input,select,textarea,.win,#bar,#hud,[role=button]');
        if(ui&&e.target.tagName!=='CANVAS'){pcCancel();return false;}
        PCA.swallow=e.pointerId;pcFire();return true;}}
    if(!slot||e.button!==0||!playOK())return false;
    const r=pcResolve(null,slot);if(!r)return false;
    const key=(()=>{const i=+(slot.dataset.i!==undefined?slot.dataset.i:-1);return i>=0?PCSLOT[i]:null;})();
    if(!pcStart(r,null,slot))return false;PCA.A.key=key;PCA.swallow=e.pointerId;
    if(slot.classList.contains('tsk')){slot.classList.add('flash');setTimeout(()=>slot.classList.remove('flash'),350);}return true;};
  setInterval(()=>{try{const A=pcLive();if(A&&(!playOK()||(A.w==='staff'?!stfEq():A.w==='bow'?!bwEq():!swEq())))pcCancel();}catch(_){}},100);
  try{const s=document.createElement('style');s.id='pca64Css';s.textContent='body.pcAiming canvas{cursor:crosshair!important}';document.head.appendChild(s);}catch(_){}}


R.cast=cast;R.state=()=>S;R.buffs=BUFS;R.pose=()=>POSE;R.ult=()=>ULT;R.palmAt=palmAt;R.heroW=heroW;R.heroH=heroH;R.liveE=liveE;R.release=release;
}catch(e){R.err='init '+e.message;}
})();

