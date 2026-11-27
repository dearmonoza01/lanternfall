
/* ---- p300 r1 — Twin Daggers (กริชคู่) weapon + 15 skills (attack 5 / buff 5 / passive 5). TEST file on top of REAL v2g.
   DeaRz 24 Oct 11:52 "อนุมัติเอาเข้าเกมได้เลย" (put the twin daggers into the game).
   Numbers = balance/approved/skills_20261023_v1 (#4 "Twin daggers, for now"): REPORT_20261022_dagger.md (weapon, poison, crit / dodge caps,
   15 skills, Lv1–10 appendix) with the r2 mechanics that replace D2–D5 (REPORT_20261022_dagger_r2.md). Skill levels Lv1–5 through the p298
   point pool (own 'dagger' pool, rows open at player Lv 1 / 10 / 15 / 20 / 25). Lv6–10 need skill books (not in the game).
   Weapon: basic stab 2.2 × ATK, 2.0 per second at base (ASPD scales it, cap 5 per second), reach 60 px, crit +10, HP ×0.85, DEF ×0.80.
   Poison (dagger hits only): 1 stack = 3 % of that hit per second for 5 s, 3 stacks (Venom Coat 8 % / 5 stacks; Deep Venom +stacks, +time).
   Crit chance cap 60 % (the game's own cap), dodge cap 45 % while daggers are held.
   Motion VFX = the approved demo approved/vfx/DAGGER_SKILLS_demo_r3_source.html (D1–D6), ported 1:1 in timing and shapes
   (shadow smoke #24123a → #4a2470, highlight #7a4fb0, toxic green #9cff3c). Shadow clones = the hero's own body frame tinted violet-black.
   The 9 buffs / passive procs without a demo get a cast moment + a looping aura in the same look (standing rule 2026-10-19).
   Icons = the ChatGPT icon sheets D3b_row1 + I1–I4 (window.__DGRA, p300 data).
   Pose (STAND-IN, NOT FINAL): no dagger animation exists yet. Stabs and casts play the approved bow-shot body layer (no bow, no arrow,
   left arm pushes toward the target, like the staff stand-in); walk / run / hurt / death use the sword loco set. No dagger is drawn in the hand.
   Element: Dark / Poison are not in the game's element table yet (element v2 not built), so dagger skills hit as no element (×1.0);
   poison does ×0.7 to Poison monsters.
   Switch: button "🗡 สลับเป็นกริชคู่" (sword ↔ daggers, like the staff / bow buttons). Off with ?dgr=off, VFX off with ?dgrfx=off. Debug: window.DGR. ---- */
(function(){'use strict';
const Q=String(location.search);
const R=window.DGR={ver:'p300-r3',on:!/dgr=off/.test(Q),public:false,err:null,log:[],
  stats:{casts:{},refused:{},hits:{},dmg:{},basic:0,twin:0,body:0,pz:{stacks:0,ticks:0,dmg:0},dodge:0,blind:0,cloakUse:0,ptPeak:0,bodyDraws:0}};
if(!R.on)return;
const A=window.__DGRA,D=window.__BOW8,HD=window.__HERO3D,W=window.__WSK;
if(!A||!D||!HD||!W||!W.lines||!window.C182||!C182.api||typeof hitEnemy!=='function'||typeof WEAPONS==='undefined'){
  R.err='missing '+[!A&&'icons',!D&&'bow8',!HD&&'hero3d',!W&&'wsk',!window.C182&&'c182'].filter(Boolean).join(' ');return;}
const FXON=!/dgrfx=off/.test(Q);
try{
/* ---------------- numbers (Lv4 shown here; the level table below sets the live values) ---------------- */
const CFG={
  dt:'phys',
  basic:{coef:2.2,per:.5,ref:1+5*.012,cap:5,range:60,arc:.9,wind:.10,maxT:3},
  wpn:{crit:10,hp:.85,def:.80},
  dodgeCap:.45,
  pz:{pct:.03,dur:5,max:3},
  shadow:{id:'dgShadow',name:'เงาสังหาร',key:'J',row:0,col:0,ic:'shadow',el:'Dark',mul:4.0,n:1,dash:300,cd:7,mp:16,cast:.25,lock:.62},
  blades:{id:'dgBlades',name:'ใบมีดพิษ',key:'U',row:1,col:0,ic:'blades',el:'Poison',mul:2.0,n:5,reach:300,cd:9,mp:18,cast:.36,lock:.5},
  storm:{id:'dgStorm',name:'พายุกริช',key:'B',row:2,col:0,ic:'storm',el:'Neutral',mul:1.5,n:8,range:300,cd:10,mp:22,cast:.24,lock:2.2},
  smoke:{id:'dgSmoke',name:'ระเบิดควันพิษ',key:'N',row:3,col:0,ic:'smoke',el:'Poison',mul:.214,r:180,dur:10,tick:.7,ticks:14,blind:.30,dodge:20,range:320,cd:20,mp:20,cast:.12,lock:.45},
  ult:{id:'dgUlt',name:'ราตรีพันเงา',key:'R',row:4,col:0,ic:'ult',el:'Dark',shad:12.0,cuts:30,fin:5.0,r:200,range:320,inv:1.0,cd:40,mp:40,cast:.8,lock:3.3},
  cloak:{id:'dgCloak',name:'อำพรางเงา',key:'O',row:0,col:1,ic:'cloak',dur:4.0,bonus:.50,spd:0,cd:16,mp:14,cast:.25},
  coat:{id:'dgCoat',name:'เคลือบพิษ',key:'Y',row:1,col:1,ic:'coat',dur:20,pct:.08,max:5,cd:30,mp:15,cast:.3},
  step:{id:'dgStep',name:'ฝีเท้าเงา',key:'',row:2,col:1,ic:'step',dur:8,spd:.25,dodge:12,cd:20,mp:15,cast:.25},
  focus:{id:'dgFocus',name:'สมาธินักฆ่า',key:'',row:3,col:1,ic:'focus',dur:15,cdmg:.40,crit:0,cd:30,mp:15,cast:.3},
  body:{id:'dgBody',name:'ร่างเงา',key:'',row:4,col:1,ic:'body',dur:15,chance:1,x3:.30,cd:30,mp:25,cast:.6},
  weak:{row:0,col:2,ic:'weak',name:'จุดตาย',crit:8,cdmg:0},
  deep:{row:1,col:2,ic:'deep',name:'พิษซึมลึก',dur:.30,stk:1,pow:0},
  prey:{row:2,col:2,ic:'prey',name:'ล่าเหยื่อ',dmg:.15,hp:.40},
  sdodge:{row:3,col:2,ic:'sdodge',name:'หลบเงา',dodge:6,heal:0},
  twin:{row:4,col:2,ic:'twin',name:'สองคมสองมือ',chance:.15,mul:.60}};
/* Lv1..5 (index 0 = Lv1). Active skills: dagger report appendix (D2–D5 from r2). Passives: the appendix Lv1–5 rows. */
const A5=(a,b,c,d,e)=>[a,b,c,d,e];
const LV={
  dg_shadow:{mul:A5(2.8,3.2,3.6,4.0,4.6),n:A5(1,1,1,1,2),mp:A5(14,14,15,16,17)},
  dg_cloak:{dur:A5(3.2,3.5,3.7,4.0,4.4),bonus:A5(.35,.40,.45,.50,.55),spd:A5(0,0,0,0,.20),mp:A5(12,13,13,14,15)},
  dg_weak:{crit:A5(5,6,8,10,11),cdmg:A5(0,0,0,0,.15)},
  dg_blades:{mul:A5(1.4,1.6,1.8,2.0,2.3),n:A5(5,5,5,5,7),reach:A5(300,300,300,300,360),mp:A5(15,16,17,18,19)},
  dg_coat:{pct:A5(.06,.06,.07,.08,.09),max:A5(5,5,5,5,7),dur:A5(16,17.4,18.6,20,22),mp:A5(13,14,14,15,16)},
  dg_deep:{dur:A5(.18,.24,.30,.36,.42),stk:A5(1,1,1,1,2),pow:A5(0,0,0,0,.20)},
  dg_storm:{mul:A5(1.05,1.2,1.35,1.5,1.725),mp:A5(19,20,21,22,23)},
  dg_step:{spd:A5(.18,.20,.22,.25,.28),dodge:A5(8,10,11,12,13),dur:A5(6.4,7,7.4,8,8.8),mp:A5(13,14,14,15,16)},
  dg_prey:{dmg:A5(.09,.12,.15,.18,.21)},
  dg_smoke:{mul:A5(.15,.171,.193,.214,.246),r:A5(180,180,180,180,225),blind:A5(.21,.24,.27,.30,.33),mp:A5(17,18,19,20,21)},
  dg_focus:{cdmg:A5(.28,.32,.36,.40,.44),crit:A5(0,0,0,0,10),dur:A5(12,13.1,14,15,16.5),mp:A5(13,14,14,15,16)},
  dg_sdodge:{dodge:A5(3.6,4.8,6,7.2,8.4),heal:A5(0,0,0,0,.01)},
  dg_ult:{shad:A5(8.4,9.6,10.8,12,13.8),cuts:A5(30,30,30,30,40),fin:A5(3.5,4,4.5,5,5.75),r:A5(200,200,200,200,240),mp:A5(34,36,38,40,42)},
  dg_body:{dur:A5(12,13.1,14,15,19.8),mp:A5(21,22,24,25,26)},
  dg_twin:{chance:A5(.09,.12,.15,.18,.21)}};
R.cfg=CFG;R.lvTab=LV;
R.applyLv=function(lvOf){for(const k in LV){const c=CFG[k.slice(3)],t=LV[k];let L=1;try{L=lvOf?(lvOf(k)|0):1;}catch(_){}const i=Math.max(0,Math.min(4,L-1));for(const f in t)c[f]=t[f][i];}};
R.applyLv(null);
const ACT=['shadow','blades','storm','smoke','ult'],BUF=['cloak','coat','step','focus','body'],PAS=['weak','deep','prey','sdodge','twin'];
const V0='#24123a',V1='#4a2470',VH='#7a4fb0',VL='#b48ae8',GRN='#9cff3c';
/* ---------------- helpers ---------------- */
const clk=()=>typeof time==='number'?time:performance.now()/1000;
const clamp=(v,a,b)=>v<a?a:v>b?b:v,ease=x=>1-Math.pow(1-clamp(x,0,1),3),seg=(t,a,b)=>clamp((t-a)/(b-a),0,1),lerp=(a,b,u)=>a+(b-a)*u;
const rf=()=>{try{return typeof rng==='function'?rng():Math.random();}catch(e){return Math.random();}};
const rnd=(a,b)=>a+Math.random()*(b-a);   // VFX only (never game randomness)
const wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a));
const yaw=()=>{try{return CAM&&!(typeof ED!=='undefined'&&ED.on)?CAM.yaw||0:0;}catch(e){return 0;}};
const ORDER=D.dirs,KS=HD.drawScale,FY=HD.footY,AX=HD.frame.ax,AY=HD.frame.ay+80;
const dirOf=sa=>((Math.round(wrapA(sa)/(Math.PI/4))%8)+8)%8;
const dgEq=()=>!!(typeof P!=='undefined'&&P&&P.weapon&&P.weapon.t==='dagger');
const liveE=e=>!!(e&&!e.dead&&e.hp>0&&!e.sprGhost&&!e.dev&&!e.removed);
const isBoss=e=>!!(e&&e.m&&e.m.boss);
const plv=()=>((typeof P!=='undefined'&&P&&P.lvl)|0);
const UNL=()=>(W.cfg&&W.cfg.unlock)||[1,10,15,20,25];
const needLv=c=>UNL()[Math.min(c.row|0,4)];
const unl=c=>plv()>=needLv(c);
const pon=k=>R.public&&dgEq()&&P&&!P.dead&&unl(CFG[k]);
const pct=v=>Math.round(v*1000)/10;
const stunnedNow=()=>{try{return typeof stunned==='function'&&stunned();}catch(e){return false;}};
const safeNow=()=>{try{return !!(window.COLSLAB&&COLSLAB.safeZone.full(G.zone));}catch(e){return false;}};
const eCy=e=>e.y-(e.sz||16)*.6;
function log(ev,x){R.log.push(Object.assign({t:+clk().toFixed(2),ev},x||{}));if(R.log.length>150)R.log.shift();}
const heroW=()=>{try{return D.layers.body.rects[ORDER[2]][D.rest][2]*KS;}catch(e){return 32;}};
const heroH=()=>{try{return D.layers.body.rects[ORDER[2]][D.rest][3]*KS;}catch(e){return 60;}};
let Z=1;   // VFX scale: demo hero = 62 px tall
function feetY(y){return (y==null?P.y:y)+FY+(D.anchor[1]-AY)*KS;}
function handAt(ang,up){return {x:P.x+Math.cos(ang)*16*Z,y:feetY()-(up==null?38:up)*Z+Math.sin(ang)*6*Z};}
function nearestE(x,y,range,skip){let b=null,bd=1e9;for(const e of enemies){if(!liveE(e)||(skip&&skip.has(e)))continue;const d=Math.hypot(e.x-x,e.y-y);if(d<=range&&d<bd){bd=d;b=e;}}return b;}
function aimAt(range){let e=null,ang=P.face||0,pt=null;
  if(R.aimOv){const o=R.aimOv;return {e:nearestE(o.x,o.y,80),ang:Math.atan2(o.y-P.y,o.x-P.x)||ang,pt:{x:o.x,y:o.y}};}
  try{const t=window.TLOCK&&TLOCK.e;if(liveE(t)&&Math.hypot(t.x-P.x,t.y-P.y)<=range+60){e=t;ang=Math.atan2(t.y-P.y,t.x-P.x);pt={x:t.x,y:t.y};}}catch(_){}
  if(!e){let b=null,bs=-1e9;for(const o of enemies){if(!liveE(o))continue;const dx=o.x-P.x,dy=o.y-P.y,dl=Math.hypot(dx,dy);if(dl>range+(o.sz||16))continue;
      const sc=Math.cos(Math.atan2(dy,dx)-(P.face||0))*1.5-dl/range;if(sc>bs){bs=sc;b=o;}}
    if(b){e=b;ang=Math.atan2(b.y-P.y,b.x-P.x);pt={x:b.x,y:b.y};}}
  if(!pt){try{const r=aimPoint(range);if(r&&isFinite(r.x)&&(r.x!==P.x||r.y!==P.y)){ang=Math.atan2(r.y-P.y,r.x-P.x);pt={x:r.x,y:r.y};}}catch(_){}}
  if(!pt)pt={x:P.x+Math.cos(ang)*range*.6,y:P.y+Math.sin(ang)*range*.6};
  return {e,ang,pt};}
/* walk the hero along a line, stopping at walls (returns the distance moved) */
function slide(x1,y1){const dx=x1-P.x,dy=y1-P.y,L=Math.hypot(dx,dy);if(L<.5)return 0;const n=Math.ceil(L/6);let moved=0;
  for(let i=0;i<n;i++){const nx=P.x+dx/n,ny=P.y+dy/n;if(typeof blocked==='function'&&blocked(nx,ny,(P.r||12)*.8))break;P.x=nx;P.y=ny;moved+=L/n;}return moved;}
/* ---------------- damage ---------------- */
function mkCtx(id,nh,kind){const def={id,mode:'native',coefTotal:CFG.basic.coef,flatTotal:0,weights:Array(Math.max(1,nh|0)).fill(1),maxTargets:99,targeting:'around',element:'Neutral',range:900};
  const c=C182.api.ctxFor(kind||'skill',id,def,{dt:CFG.dt,lvScale:1,m0:1,reach:1400,cdId:id});c.dg=1;return c;}
let CUR=null;   // per-hit bonus info read by the damage bonus hook
const PROCS=[];
function dmg(e,ctx,m,x){x=x||{};if(!liveE(e)||!ctx)return 0;
  const prev=C182.cur,vx=e.vx||0,vy=e.vy||0;let r=0,pl=null;try{pl=wpal();}catch(_){}
  const o={dt:CFG.dt,pl,ctx,kind:x.kind||'orb'};let cb=0;
  if(BUFS.cloak&&!x.proc){cb=CFG.cloak.bonus;o.critAlways=1;R.stats.cloakUse++;cloakEnd('hit');}   // the next hit after Shadow Cloak: sure crit + bonus
  if(x.crit)o.critAlways=1;
  const pc=CUR;CUR={cb};C182.cur=ctx;
  try{r=hitEnemy(e,m,o)||0;}catch(er){R.err='dmg '+er.message;}finally{C182.cur=prev;CUR=pc;}
  try{if(!e.dead){e.vx=vx;e.vy=vy;}}catch(_){}   // dagger hits do not push (the short flinch stays)
  const id=ctx.id;R.stats.hits[id]=(R.stats.hits[id]||0)+1;R.stats.dmg[id]=(R.stats.dmg[id]||0)+Math.max(0,r);
  if(r>0&&!x.proc){if(x.pz)pzAdd(e,r,x.pz);
    if(BUFS.body){const pid=x.kind==='basic'?'basic':id;PROCS.push({t:clk()+.12,e,m,id:pid});if(rf()<CFG.body.x3)PROCS.push({t:clk()+.24,e,m,id:pid});}}   // r3 (DeaRz 27 Oct 02:29): every dagger hit x2, 30% x3
  return r;}
/* ---------------- poison: own stacks on the monster, each with its own 1 s ticks ---------------- */
function pzMax(){let m=BUFS.coat?CFG.coat.max:CFG.pz.max;if(pon('deep'))m+=CFG.deep.stk;return m;}
function pzAdd(e,hit,n){if(!liveE(e)||e.elem==='Undead')return;let p=BUFS.coat?CFG.coat.pct:CFG.pz.pct,dur=CFG.pz.dur;
  if(pon('deep')){dur*=1+CFG.deep.dur;p*=1+(CFG.deep.pow||0);}if(e.elem==='Poison')p*=.7;
  const L=e._dgPz||(e._dgPz=[]),now=clk();for(let i=0;i<n;i++)L.push({dps:hit*p,next:now+1,end:now+dur+.001});
  const mx=pzMax();while(L.length>mx)L.shift();R.stats.pz.stacks+=n;}
const pzN=e=>{const L=e&&e._dgPz;return L?L.length:0;};
function pzTick(){const now=clk();for(const e of enemies){const L=e._dgPz;if(!L)continue;if(!liveE(e)){delete e._dgPz;continue;}let sum=0;
    for(const s of L){if(now>=s.next&&s.next<=s.end){sum+=s.dps;s.next+=1;}}
    for(let i=L.length-1;i>=0;i--)if(L[i].next>L[i].end)L.splice(i,1);
    if(!L.length)delete e._dgPz;
    if(sum>0){const a=Math.max(1,Math.round(sum));try{applyDamage(e,a,false,{dot:'poison'});}catch(er){R.err='pz '+er.message;}R.stats.pz.ticks++;R.stats.pz.dmg+=a;
      if(FXON)for(let i=0;i<2;i++)add({k:'drop',x:e.x+rnd(-8,8)*Z,y:eCy(e)-rnd(0,10)*Z,vy:10,g:200,s:2.5*Z,life:.6,floor:e.y});}}}
/* ---------------- state ---------------- */
let S=null,castN=0,POSE=null,BA=null,HAND=0;const BUFS={};R.bufs=BUFS;
R.heroA=1;   // hero draw alpha (vanish in Blade Storm / the ultimate)
function refuse(k,why){R.stats.refused[k]=(R.stats.refused[k]||0)+1;log('refuse',{k,why});try{textAt(P.x,P.y-62,CFG[k].name+': '+why,'#d9c4ff',13);}catch(e){}return false;}
function canStart(k){const c=CFG[k];
  if(!P||P.dead||G.state!=='play'||G.edit)return refuse(k,'ใช้ไม่ได้ตอนนี้');
  if(!dgEq())return refuse(k,'ต้องถือกริชคู่');
  if(!unl(c))return refuse(k,'ล็อกอยู่ ต้องเลเวลตัวละคร '+needLv(c));
  if(S)return refuse(k,'กำลังใช้สกิลอื่น');
  if((P.cds[c.id]||0)>0)return refuse(k,'คูลดาวน์ '+P.cds[c.id].toFixed(1)+' วิ');
  if(P.dash||stunnedNow())return refuse(k,'กำลังทำท่าอื่น');
  if(BUFS[k])return refuse(k,'บัฟทำงานอยู่ (ไม่ซ้อน)');
  if(P.mp<c.mp)return refuse(k,'MP ไม่พอ');
  return true;}
function begin(k,ang,x){const c=CFG[k];BA=null;P.atkCd=0;P.mp-=c.mp;P.cds[c.id]=c.cd;
  const kind=ACT.includes(k)?(k==='ult'?'ult':'atk'):'buff',now=clk();
  S=Object.assign({k,id:++castN,t0:now,ang,d:dirOf(ang+yaw()),zone:G.zone,rel:false,cast:c.cast||.3,lock:c.lock||((c.cast||.3)+.3),ev:{}},x||{});
  POSE={kind,t0:now,ang,d:S.d,cast:S.cast,lock:S.lock,sk:k};
  R.stats.casts[k]=(R.stats.casts[k]||0)+1;log('cast',{k,cast:S.id});
  if(kind==='buff')buffCastFx(k);
  try{sfx('swing','dagger');}catch(_){}
  return true;}
const once=(S_,n,f)=>{if(!S_.ev[n]){S_.ev[n]=1;f();}};
function cast(k){try{if(!canStart(k))return false;const c=CFG[k];
  if(k==='shadow'){const a=aimAt(c.dash);let e=a.e;if(e&&Math.hypot(e.x-P.x,e.y-P.y)>c.dash+(e.sz||16))e=null;
    return begin(k,e?Math.atan2(e.y-P.y,e.x-P.x):a.ang,{e,x0:P.x,y0:P.y});}
  if(k==='blades'){const a=aimAt(c.reach);return begin(k,a.ang,{e:a.e,hit:new Map(),hist:[]});}
  if(k==='storm'){const a=aimAt(c.range);let e=a.e;if(!e||Math.hypot(e.x-P.x,e.y-P.y)>c.range+(e.sz||16))e=null;
    if(!e)return refuse(k,'ไม่มีเป้าในระยะ '+c.range+' px');return begin(k,Math.atan2(e.y-P.y,e.x-P.x),{e,x0:P.x,y0:P.y});}
  if(k==='smoke'||k==='ult'){const rg=c.range,a=aimAt(rg);let dx=a.pt.x-P.x,dy=a.pt.y-P.y,dl=Math.hypot(dx,dy);if(dl>rg){dx*=rg/dl;dy*=rg/dl;}
    return begin(k,Math.atan2(dy,dx)||a.ang,{cx:P.x+dx,cy:P.y+dy});}
  return begin(k,P.face||0,{});
  }catch(er){R.err='cast '+er.message;S=null;POSE=null;R.heroA=1;return false;}}
R.cast=cast;
/* ---------------- buffs ---------------- */
const PAL={main:VH,accent:GRN};
function buffOn(k){const c=CFG[k],now=clk();BUFS[k]={t0:now,end:now+c.dur};
  const ent={t:c.dur,max:c.dur,pl:PAL,dg:k};
  if(k==='cloak'){P.stealth=c.dur;ent.sneak=.4+(c.spd||0);for(const e of enemies)if(e.aggro&&!isBoss(e)){e.aggro=false;e.calmT=0;}try{sfx('stealth');}catch(_){}}
  else if(k==='step')ent.speed=c.spd;
  else if(k==='focus'){ent.critDmg=c.cdmg;if(c.crit)ent.crit=c.crit;}
  else if(k==='body'){BUFS.body.ctx=mkCtx('dgBodyHit',999);BUFS.body.hist=[];}
  P.buffs[c.id]=ent;log('buff on',{k});}
function buffOff(k,why){const b=BUFS[k];if(!b)return;delete BUFS[k];try{delete P.buffs[CFG[k].id];}catch(_){}
  if(k==='cloak'){try{P.stealth=0;}catch(_){}}
  if(FXON&&k==='body'&&b.cl)for(let i=0;i<8;i++)smoke(b.cl.x+rnd(-14,14)*Z,feetY(b.cl.y)-rnd(0,60)*Z,rnd(10,15)*Z,{vy:-rnd(5,25),life:.8,dark:true});
  log('buff off',{k,why});}
function cloakEnd(why){if(!BUFS.cloak)return;buffOff('cloak',why);if(FXON){for(let i=0;i<6;i++)smoke(P.x+rnd(-14,14)*Z,feetY()-rnd(0,50)*Z,rnd(9,13)*Z,{life:.6,dark:true});}}
/* ---------------- basic attack: a quick stab, hands alternate ---------------- */
function period(){let b=0;try{b=B('aspd')||0;}catch(_){}const sp=(P.aspdF||1)*(1+b);return Math.max(1/CFG.basic.cap,CFG.basic.per*CFG.basic.ref/Math.max(.05,sp));}
R.period=period;
function stab(ba,twin){const c=CFG.basic,ctx=mkCtx(twin?'dgTwin':'basic:dagger',1,twin?'skill':'basic');const hits=[];
  for(const e of enemies){if(!liveE(e))continue;const dx=e.x-P.x,dy=e.y-P.y,d=Math.hypot(dx,dy);if(d>c.range+(e.sz||16))continue;
    if(d>8&&Math.abs(wrapA(Math.atan2(dy,dx)-ba.ang))>c.arc)continue;hits.push([d,e]);}
  hits.sort((a,b)=>a[0]-b[0]);let any=false;
  for(const [,e] of hits.slice(0,c.maxT)){const r=dmg(e,ctx,twin?CFG.twin.mul:1,{kind:'basic',pz:(BUFS.coat&&!twin)?1:0});if(r>0)any=true;}
  if(!twin){R.stats.basic++;if(any&&pon('twin')&&rf()<CFG.twin.chance){ba.twin=(clk()-ba.t0)+.1;R.stats.twin++;}}
  if(FXON)stabFx(ba,twin,hits.length?hits[0][1]:null);}
function basicTick(){if(!BA)return;const now=clk(),t=now-BA.t0;
  if(!dgEq()||P.dead||G.zone!==BA.zone||stunnedNow()||S){BA=null;if(POSE&&POSE.kind==='basic')POSE=null;return;}
  P.face=BA.ang;
  if(!BA.rel&&t>=BA.wind){BA.rel=true;stab(BA,false);}
  if(BA.twin&&!BA.twinDone&&t>=BA.twin){BA.twinDone=true;stab(BA,true);}
  if(BA.rel&&t>=BA.wind+.1&&(!BA.twin||BA.twinDone))BA=null;}
{const o=basicAttack;basicAttack=function(){
  if(!(R.public&&dgEq()))return o.apply(this,arguments);
  if(S||BA||P.atkCd>0||P.dead||P.dash||(typeof G!=='undefined'&&G.edit)||stunnedNow())return;
  let ang=P.face||0;
  try{const t=window.TLOCK&&TLOCK.e;if(liveE(t)&&Math.hypot(t.x-P.x,t.y-P.y)<=CFG.basic.range+(t.sz||16)+40)ang=Math.atan2(t.y-P.y,t.x-P.x);
    else{const a=aimPoint(CFG.basic.range+60);if(a&&isFinite(a.x)&&(a.x!==P.x||a.y!==P.y))ang=Math.atan2(a.y-P.y,a.x-P.x);}}catch(_){}
  const per=period(),now=clk(),wind=Math.min(CFG.basic.wind,per*.3);HAND^=1;
  BA={t0:now,ang,wind,per,rel:false,hand:HAND,zone:G.zone,d:dirOf(ang+yaw())};P.face=ang;P.atkCd=per;
  POSE={kind:'basic',t0:now,ang,d:BA.d,cast:wind,lock:Math.min(per*.95,wind+.2)};
  try{G.basicT=now;}catch(e){}try{sfx('swing','dagger');}catch(_){}};}
/* ---------------- per-skill timelines (demo r3 timings) ---------------- */
function tickSkill(S,t,dt){const c=CFG[S.k];if(window.__DGHIDE&&__DGHIDE.on&&((S.k==='storm'&&t<D3_BACK)||(S.k==='ult'&&t<3.0)))__DGHIDE.until=clk()+.12;
  if(S.k==='shadow')tShadow(S,t,dt,c);else if(S.k==='blades')tBlades(S,t,dt,c);else if(S.k==='storm')tStorm(S,t,dt,c);
  else if(S.k==='smoke')tSmoke(S,t,dt,c);else if(S.k==='ult')tUlt(S,t,dt,c);
  else if(!S.rel&&t>=S.cast){S.rel=true;buffOn(S.k);if(FXON)buffRelFx(S.k);}}
/* D1 Shadow Strike: crouch 0–0.25 → dash THROUGH the target 0.25–0.38 (afterimages) → X crit from behind at 0.46 */
function tShadow(S,t,dt,c){
  if(t<.25){once(S,'rb',()=>{if(FXON)for(let i=0;i<3;i++)ribbon(P.x,feetY()-(14+i*12)*Z,(26+i*4)*Z,{life:.34,hold:.3,climb:24*Z,fol:(o=>()=>({x:P.x,y:feetY()-(14+o*12)*Z}))(i)});});
    if(FXON&&Math.random()<dt*25)smoke(P.x+rnd(-18,18)*Z,feetY()-rnd(0,10)*Z,rnd(10,16)*Z,{vy:-rnd(20,40),life:.6});return;}
  once(S,'start',()=>{const e=liveE(S.e)?S.e:null,ca=Math.cos(S.ang),sa=Math.sin(S.ang);
    let L=c.dash;if(e){const d=Math.hypot(e.x-P.x,e.y-P.y);L=Math.min(c.dash,d+(e.sz||16)+40*Z);}
    S.x1=P.x+ca*L;S.y1=P.y+sa*L;S.L=L;P.invT=Math.max(P.invT||0,.25);
    // who the dash passes through (closest first along the path)
    const list=[];for(const o of enemies){if(!liveE(o))continue;const dx=o.x-P.x,dy=o.y-P.y,u=dx*ca+dy*sa,v=Math.abs(-dx*sa+dy*ca);
      if(u<-10||u>L+(o.sz||16)||v>(o.sz||16)+26)continue;list.push([u,o]);}
    list.sort((a,b)=>a[0]-b[0]);S.tg=list.slice(0,c.n).map(q=>q[1]);if(e&&!S.tg.includes(e)&&S.tg.length<c.n)S.tg.unshift(e);
    if(FXON)for(let i=0;i<6;i++)smoke(P.x+rnd(-14,14)*Z,feetY()-rnd(0,24)*Z,rnd(14,22)*Z,{life:.8});});
  if(t<.38){const u=ease(seg(t,.25,.38));const tx=lerp(S.x0,S.x1,u),ty=lerp(S.y0,S.y1,u);slide(tx,ty);R.heroA=.35;
    const n=Math.floor((t-.25)/.022);if(FXON)once(S,'g'+n,()=>add({k:'ghost',x:P.x,y:P.y,d:S.d,life:.45,hold:0}));}
  else{if(!S.arr){S.arr=1;slide(S.x1,S.y1);}R.heroA=1;}
  if(t>=.3)once(S,'cut',()=>{if(FXON){const y0=feetY(S.y0)-40*Z,y1=feetY(S.y1)-36*Z;add({k:'streak',x0:S.x0+Math.cos(S.ang)*20*Z,y0,x1:S.x1+Math.cos(S.ang)*20*Z,y1,w:10*Z,green:true,life:.55,hold:.2});
      for(const e of S.tg)if(liveE(e))chips(e.x,eCy(e),6,Math.sign(Math.cos(S.ang))||1);}});
  if(t>=.38){P.face=S.ang+Math.PI;if(POSE)POSE.d=dirOf(S.ang+Math.PI+yaw());}
  if(t>=.46)once(S,'x',()=>{const ctx=mkCtx(c.id,1);ctx.el=c.el;let any=null;
    for(const e of S.tg){if(!liveE(e))continue;dmg(e,ctx,c.mul,{crit:1});any=any||e;}
    const fx=any||{x:S.x1-Math.cos(S.ang)*40*Z,y:S.y1-Math.sin(S.ang)*40*Z,sz:16};
    if(FXON){const x=fx.x,y=any?eCy(any):feetY(fx.y)-44*Z;add({k:'x',x,y,s:66*Z,w:22*Z,life:.7,hold:.4});xEnds(x,y,66*Z);chips(x,y,10,-1);
      for(let i=0;i<8;i++){const a=rnd(0,6.283);add({k:'s',x,y,vx:Math.cos(a)*200*Z,vy:Math.sin(a)*120*Z,drag:4,s:rnd(5,8)*Z,col:GRN,life:.35});}
      for(let i=0;i<5;i++)smoke(x+rnd(-20,20)*Z,y+rnd(-20,20)*Z,rnd(12,18)*Z,{vx:rnd(-50,50),life:.9});}
    try{shake(4);}catch(_){}});
  if(FXON&&t>.5&&t<1.1&&Math.random()<dt*10)smoke(P.x+rnd(-14,14)*Z,feetY()-rnd(0,30)*Z,rnd(8,12)*Z,{vy:-rnd(30,50),vx:rnd(-30,30),life:.7,a:.7});}
/* D2 Venom Blades (r2): 5 (Lv5: 7) daggers out of smoke → fan out → spin and curve back to the hand; 1 hit out + 1 hit back per monster */
const D2_GO=.36,D2_BACK=1.62;
function d2Fan(n){const sp=n>5?21:28;return Array.from({length:n},(_,i)=>(i-(n-1)/2)*sp*Math.PI/180);}
function d2Pos(S,i,n,tt){const o=handAt(S.ang),fan=d2Fan(n),a=S.ang+fan[i],R_=S.reach,side=fan[i]>=0?1:-1;
  if(tt<D2_GO){const born=.06+i*.04,k=ease(seg(tt,born,D2_GO)),hx=o.x-6*Z*Math.cos(S.ang)+Math.cos(a)*26*Z,hy=o.y-10*Z+Math.sin(a)*18*Z;return {x:lerp(o.x+4*Z,hx,k),y:lerp(o.y-2*Z,hy,k),u:0,rot:a,gy:P.y};}
  const u=Math.min(1,(tt-D2_GO)/(D2_BACK-D2_GO)),r=R_*Math.sin(Math.PI*Math.pow(u,.8)),w=R_*.2*Math.sin(Math.PI*u)*Math.sin(Math.PI*u)*(u>.5?1:.4);
  const dx=Math.cos(a),dy=Math.sin(a),px=-dy,py=dx,s2=(fan[i]===0?(i%2?1:-1):side);
  return {x:o.x+dx*r+px*w*s2,y:o.y+dy*r+py*w*s2,u,gy:P.y+dy*r+py*w*s2,rot:u<.12?a:a+(tt-D2_GO-.12*(D2_BACK-D2_GO))*22};}
function tBlades(S,t,dt,c){
  if(!S.init){S.init=1;S.n=c.n;S.reach=c.reach;S.ctx=mkCtx(c.id,2);S.ctx.el=c.el;S.mul=c.mul;}
  const n=S.n;S.blades=[];
  for(let i=0;i<n;i++){const p=d2Pos(S,i,n,t),born=.06+i*.04;p.a=seg(t,born,born+.1)*(1-seg(t,D2_BACK,D2_BACK+.06));p.born=born;p.i=i;
    const h=(S.hist[i]=S.hist[i]||[]);if(t>D2_GO){h.push([p.x,p.y,t]);while(h.length&&t-h[0][2]>.16)h.shift();}else h.length=0;p.h=h;S.blades.push(p);}
  if(FXON){S.blades.forEach((b,i)=>{if(t>=b.born)once(S,'b'+i,()=>{smoke(b.x,b.y,12*Z,{life:.5,vy:-10});add({k:'s',x:b.x,y:b.y,s:16*Z,col:GRN,life:.2});});});
    if(t>=D2_GO)once(S,'fan',()=>{const o=handAt(S.ang);add({k:'s',x:o.x+10*Z,y:o.y,s:46*Z,col:GRN,life:.22});for(const a0 of d2Fan(n)){const a=S.ang+a0;smoke(o.x+Math.cos(a)*30*Z,o.y+Math.sin(a)*16*Z,rnd(10,14)*Z,{vx:Math.cos(a)*60,vy:Math.sin(a)*30-10,life:.6,dark:true});}});
    if(t>D2_GO&&t<D2_BACK)for(const b of S.blades){if(Math.random()<dt*9)smoke(b.x,b.y,rnd(7,11)*Z,{vx:rnd(-10,10),vy:-rnd(5,15),life:.55,dark:Math.random()<.5});
      if(Math.random()<dt*4)add({k:'drop',x:b.x,y:b.y+3*Z,vy:20,g:300,s:2.5*Z,life:.5,floor:b.y+(38+rnd(-10,30))*Z});}}
  // hits: once on the way out, once on the way back, never more than 2 per monster per cast
  if(t>D2_GO&&t<D2_BACK)for(const b of S.blades){if(b.u<=0||b.u>=.97)continue;const leg=b.u<.5?'o':'r';
    for(const e of enemies){if(!liveE(e))continue;if(Math.hypot(e.x-b.x,e.y-b.gy)>(e.sz||16)+16)continue;let h=S.hit.get(e);if(!h){h={o:0,r:0};S.hit.set(e,h);}
      if(h[leg]||h.o+h.r>=2)continue;h[leg]=1;dmg(e,S.ctx,S.mul,{pz:1});
      if(FXON){drops(e.x,eCy(e),6);chips(e.x,eCy(e),3,leg==='o'?1:-1);add({k:'s',x:b.x,y:b.y,s:34*Z,col:GRN,life:.2});}}}
  if(FXON&&t>=D2_BACK)once(S,'catch',()=>{const o=handAt(S.ang);add({k:'s',x:o.x+6*Z,y:o.y-2*Z,s:40*Z,col:GRN,life:.22});for(let i=0;i<6;i++)smoke(o.x+rnd(-14,14)*Z,o.y+rnd(-10,10)*Z,rnd(9,13)*Z,{life:.55,dark:i%2});});}
/* D3 Blade Storm (r3): dash in 0–0.24 → hero vanishes (untouchable) → shadows 1..8 dash THROUGH the target one at a time (0.57–1.97 s)
   → hero reappears behind the target at 2.2 s */
const D3_VAN=.24,D3_S0=.42,D3_SDT=.2,D3_BACK=2.2;
const D3_ANG=[Math.PI,Math.PI*.25,-Math.PI*.75,Math.PI*.5,-Math.PI*.25,Math.PI*.75,-Math.PI*.5,Math.PI*.05];
function tStorm(S,t,dt,c){
  if(!S.init){S.init=1;S.ctx=mkCtx(c.id,c.n);S.mul=c.mul;S.cl=[];}
  let tg=liveE(S.e)?S.e:null;
  if(!tg&&t>D3_VAN&&t<D3_BACK){tg=nearestE(S.lx||P.x,S.ly||P.y,220);if(tg)S.e=tg;}
  if(tg){S.lx=tg.x;S.ly=tg.y;}
  if(t<D3_VAN){if(tg){const d=Math.hypot(tg.x-S.x0,tg.y-S.y0),k=Math.max(0,d-(tg.sz||16)-60*Z)/Math.max(1,d),u=ease(seg(t,0,.2));
      slide(lerp(S.x0,S.x0+(tg.x-S.x0)*k,u),lerp(S.y0,S.y0+(tg.y-S.y0)*k,u));}
    if(FXON&&Math.random()<dt*30)smoke(P.x-Math.cos(S.ang)*10*Z,feetY()-rnd(0,10)*Z,rnd(8,12)*Z,{vx:-Math.cos(S.ang)*40,life:.5});return;}
  once(S,'van',()=>{P.invT=Math.max(P.invT||0,D3_BACK-t+.05);if(FXON){const y=feetY()-30*Z;for(let i=0;i<9;i++){const a=i/9*6.283;smoke(P.x+Math.cos(a)*12*Z,y+Math.sin(a)*16*Z,rnd(10,15)*Z,{vx:Math.cos(a)*70,vy:Math.sin(a)*40-10,drag:2,life:.7,dark:i%2});}
    ribbon(P.x,y,20*Z,{climb:40*Z,life:.7});add({k:'s',x:P.x,y:y-10*Z,s:44*Z,col:VL,life:.2});}});
  if(t<D3_BACK){R.heroA=1-seg(t,D3_VAN,D3_VAN+.06);P.invT=Math.max(P.invT||0,.05);}
  // shadows: start / end points round the target (ground ellipse), each dashes through once
  for(let j=0;j<8;j++){const t0=D3_S0+j*D3_SDT;if(t<t0)continue;
    once(S,'mk'+j,()=>{const x=S.lx,y=S.ly,a=D3_ANG[j],r=130*Z;S.cl.push({j,ox0:Math.cos(a)*r,oy0:Math.sin(a)*r*.5,ox1:Math.cos(a+Math.PI)*r*1.05,oy1:Math.sin(a+Math.PI)*r*.5*1.05,t0,bx:x,by:y,d:dirOf(a+Math.PI+yaw())});
      if(FXON)for(let i=0;i<4;i++)smoke(x+Math.cos(a)*r+rnd(-12,12)*Z,feetY(y+Math.sin(a)*r*.5)-rnd(0,50)*Z,rnd(8,12)*Z,{life:.45,dark:true});});
    if(t>=t0+.15)once(S,'hit'+j,()=>{const fin=j===7,e=liveE(S.e)?S.e:null;if(e)dmg(e,S.ctx,S.mul,{});
      if(FXON){const cl=S.cl[j];if(cl){const y0=feetY(cl.by+cl.oy0)-36*Z,y1=feetY(cl.by+cl.oy1)-36*Z;add({k:'streak',x0:cl.bx+cl.ox0,y0,x1:cl.bx+cl.ox1,y1,w:(fin?9:7)*Z,green:j%2===0,life:.4,hold:.18});}
        const x=S.lx,y=e?eCy(e):feetY(S.ly)-44*Z;chips(x,y,3,1);add({k:'s',x,y,s:(fin?50:30)*Z,col:j%2?VL:GRN,life:.18});
        if(fin){drops(x,y,12,180);for(let i=0;i<8;i++){const a=rnd(0,6.283);add({k:'s',x,y,vx:Math.cos(a)*200*Z,vy:Math.sin(a)*120*Z,drag:4,s:rnd(6,9)*Z,col:GRN,life:.4});}}}
      try{shake(fin?4:2);}catch(_){}});
    if(FXON&&t>=t0+.45)once(S,'out'+j,()=>{const cl=S.cl[j];if(cl)for(let i=0;i<4;i++)smoke(cl.bx+cl.ox1+rnd(-12,12)*Z,feetY(cl.by+cl.oy1)-rnd(0,50)*Z,rnd(8,12)*Z,{life:.55,dark:true});});}
  if(t>=D3_BACK)once(S,'back',()=>{const x=S.lx!=null?S.lx:P.x,y=S.ly!=null?S.ly:P.y,a=Math.atan2(y-S.y0,x-S.x0);const bx=x+Math.cos(a)*(52*Z+16),by=y+Math.sin(a)*(52*Z+16);
    if(!(typeof blocked==='function'&&blocked(bx,by,(P.r||12)*.8))){P.x=bx;P.y=by;}else slide(bx,by);P.face=a+Math.PI;R.heroA=1;
    if(FXON){for(let i=0;i<7;i++)smoke(P.x+rnd(-14,14)*Z,feetY()-rnd(0,50)*Z,rnd(9,14)*Z,{life:.6,dark:true});ribbon(P.x,feetY()-30*Z,22*Z,{climb:40*Z,life:.8});}});}
/* D4 Smoke Bomb (r2): throw arc 0.12–0.6 → low dome cloud r180 (Lv5 225) for 10 s, tick every 0.7 s (14 ticks) + 1 poison stack each,
   hero inside = dodge +20, monsters inside miss 30 % */
const D4_ON=.6;
function tSmoke(S,t,dt,c){
  if(!S.cloud){S.cloud={k:'smoke',x:S.cx,y:S.cy,t0:S.t0,r:c.r,dur:c.dur,ticks:c.ticks,tick:c.tick,mul:c.mul,blind:c.blind,ctx:mkCtx(c.id,c.ticks),puffs:[],n:0,ev:{}};SCN.push(S.cloud);}
  if(FXON&&t>.12&&t<D4_ON){const p=bombPos(S,t);if(Math.random()<.8)add({k:'s',x:p.x,y:p.y-6*Z,s:rnd(5,8)*Z,col:GRN,vy:-20,life:.25});if(Math.random()<.4)smoke(p.x,p.y,5*Z,{life:.4,vy:-5});}}
function bombPos(S,t){const st=handAt(S.ang,46),gy=feetY(S.cy),u=seg(t,.12,D4_ON);return {x:lerp(st.x,S.cx,u),y:lerp(st.y,gy-10*Z,u)-Math.sin(u*Math.PI)*130*Z};}
function inSmoke(x,y){const now=clk();for(const s of SCN){if(s.k!=='smoke')continue;const t=now-s.t0;if(t<D4_ON||t>=D4_ON+s.dur)continue;if(Math.hypot(x-s.x,y-s.y)<=s.r)return true;}return false;}
R.inSmoke=inSmoke;
function smokeScene(s,t,dt){
  if(t>=D4_ON)once(s,'burst',()=>{try{shake(3);}catch(_){}if(FXON){const gy=feetY(s.y);add({k:'s',x:s.x,y:gy-20*Z,s:120*Z,col:GRN,life:.25});add({k:'ring',x:s.x,y:gy,s:s.r*1.2,w:8*Z,col:'rgba(156,255,60,.45)',life:.45});}
    const R_=s.r,NP=Math.round(22*R_/130*(FXQ())),k=Math.sqrt(R_/130);for(let i=0;i<NP;i++){const a=i*2.399,r=Math.sqrt((i+.5)/NP)*R_*.92;s.puffs.push({a,r,h:(1-r/R_)*85*Z*k+rnd(0,12)*Z,s:rnd(38,52)*Z*k,ph:rnd(0,6)});}});
  for(const p of s.puffs)p.a+=dt*.12;
  const off=D4_ON+s.dur;
  while(s.n<s.ticks){const tk=D4_ON+.4+s.n*s.tick;if(t<tk||tk>=off)break;s.n++;
    for(const e of enemies){if(!liveE(e))continue;if(Math.hypot(e.x-s.x,e.y-s.y)>s.r+(e.sz||16)*.5)continue;dmg(e,s.ctx,s.mul,{pz:1});if(FXON)add({k:'s',x:e.x,y:eCy(e)+6*Z,s:26*Z,col:GRN,life:.25});}}
  if(FXON&&t>D4_ON&&t<off){const gy=feetY(s.y);for(const e of enemies){if(!liveE(e)||Math.hypot(e.x-s.x,e.y-s.y)>s.r)continue;if(Math.random()<dt*2.5)add({k:'bubble',x:e.x+rnd(-6,6)*Z,y:eCy(e)-26*Z,vy:-22,s:rnd(3,5)*Z,life:.9,fin:.1,ph:rnd(0,6)});}
    if(Math.random()<dt*6){const a=rnd(0,6.283),r=rnd(0,s.r*.8);add({k:'s',x:s.x+Math.cos(a)*r,y:gy+Math.sin(a)*r*.5-rnd(0,40)*Z,s:rnd(8,14)*Z,col:GRN,vy:-10,life:.6,fin:.15,a:.6});}
    if(t>D4_ON+.3&&Math.random()<dt*2.2){const a=rnd(0,6.283);ribbon(s.x+Math.cos(a)*s.r*.8,gy+Math.sin(a)*s.r*.5*.8-20*Z,rnd(14,22)*Z,{climb:rnd(20,40)*Z,life:rnd(1,1.4)});}}
  if(FXON&&t>=off)once(s,'end',()=>{const gy=feetY(s.y);s.puffs.forEach((p,i)=>{const q=puffXY(s,p,t);if(i%2)smoke(q.x,q.y,p.s*rnd(.35,.7),{vx:(q.x-s.x)*.5,vy:-rnd(20,50),life:rnd(.6,1),fin:0,dark:i%3===0});});
    for(let i=0;i<5;i++){const a=i/5*6.283;ribbon(s.x+Math.cos(a)*s.r*.5,gy+Math.sin(a)*s.r*.25-30*Z,30*Z,{climb:60*Z,w:12*Z,life:1.1});}});
  return t<off+.6;}
function puffXY(s,p,t){const g=ease(seg(t,D4_ON,D4_ON+.4)),gy=feetY(s.y);return {x:s.x+Math.cos(p.a)*p.r*(.4+.6*g)+Math.sin(t*.9+p.ph)*5*Z,y:gy+Math.sin(p.a)*p.r*.5*(.4+.6*g)-p.h*g+Math.sin(t*1.3+p.ph)*3*Z,s:p.s*(.35+.65*g)*(1+.06*Math.sin(t*1.7+p.ph))};}
/* D6 Night of a Thousand Shadows: sink 0–0.8 → 7 clones rise round the circle → 30 (Lv5: 40) criss-cross cuts 1.3–2.95 s on every monster
   inside → hero reappears behind the main target, X finisher (sure crit) at 3.18 s. Untouchable the first 1 s. */
function ringPt(S,a,R_){return {x:S.cx+Math.cos(a)*R_,y:S.cy+Math.sin(a)*R_*.5};}
function tUlt(S,t,dt,c){
  if(!S.init){S.init=1;S.N=c.cuts;S.ctx=mkCtx(c.id,c.cuts+1);S.R=c.r;S.per=c.shad/c.cuts;S.fin=c.fin;S.cl=[];P.invT=Math.max(P.invT||0,c.inv);R.night={t0:S.t0};}
  const R_=S.R;
  if(t<3.0)R.heroA=1-seg(t,.45,.8);
  if(FXON&&t<.8){const n=Math.floor(45*dt)+(Math.random()<(45*dt)%1?1:0);for(let i=0;i<n;i++){const a=rnd(0,6.283),r=rnd(10,28)*Z,h=(t/.8)*70*Z;smoke(P.x+Math.cos(a)*r,feetY()-rnd(0,h),rnd(10,18)*Z,{vx:-Math.sin(a)*60,vy:-rnd(20,60),life:.7,dark:Math.random()<.4});}}
  if(t>=.8)once(S,'clones',()=>{for(let i=0;i<7;i++){const a=i/7*6.283+.3,p=ringPt(S,a,R_*.95);S.cl.push({x:p.x,y:p.y,a,born:.85+i*.05,d:dirOf(Math.atan2(S.cy-p.y,S.cx-p.x)+yaw()),mv:null});}});
  for(let j=0;j<S.N;j++){const tj=1.3+j*(1.65/S.N);if(t<tj)break;
    once(S,'cut'+j,()=>{const cl=S.cl[j%S.cl.length];if(!cl)return;const a2=cl.a+Math.PI+rnd(-.5,.5),p=ringPt(S,a2,R_*.95);
      cl.mv={x0:cl.x,y0:cl.y,x1:p.x,y1:p.y,t0:t};cl.a=a2;cl.d=dirOf(Math.atan2(p.y-cl.y,p.x-cl.x)+yaw());
      for(const e of enemies){if(!liveE(e))continue;if(Math.hypot(e.x-S.cx,e.y-S.cy)>R_+(e.sz||16)*.5)continue;dmg(e,S.ctx,S.per,{});if(FXON&&Math.random()<.5)add({k:'s',x:e.x,y:eCy(e),s:22*Z,col:j%2?GRN:VL,life:.15});}
      if(FXON)add({k:'streak',x0:cl.x,y0:feetY(cl.y)-34*Z,x1:p.x,y1:feetY(p.y)-34*Z,w:rnd(5,8)*Z,green:j%3===0,life:.45,hold:.25});});}
  for(const cl of S.cl){if(cl.mv){const u=(t-cl.mv.t0)/.12;if(u>=1){cl.x=cl.mv.x1;cl.y=cl.mv.y1;cl.mv=null;}else{cl.x=lerp(cl.mv.x0,cl.mv.x1,ease(u));cl.y=lerp(cl.mv.y0,cl.mv.y1,ease(u));}}}
  if(t>=3.0)once(S,'back',()=>{let main=null,bd=1e9;for(const e of enemies){if(!liveE(e))continue;const d=Math.hypot(e.x-S.cx,e.y-S.cy);if(d<=R_+(e.sz||16)&&d<bd){bd=d;main=e;}}S.main=main;
    const mx=main?main.x:S.cx,my=main?main.y:S.cy,a=Math.atan2(my-P.y,mx-P.x),bx=mx+Math.cos(a)*(44*Z+(main?main.sz||16:0)),by=my+Math.sin(a)*(44*Z+(main?main.sz||16:0));
    if(!(typeof blocked==='function'&&blocked(bx,by,(P.r||12)*.8))){P.x=bx;P.y=by;}else slide(mx,my);P.face=a+Math.PI;
    if(FXON){for(let i=0;i<8;i++)smoke(P.x+rnd(-16,16)*Z,feetY()-rnd(0,50)*Z,rnd(10,16)*Z,{life:.6,dark:true});for(const cl of S.cl)for(let i=0;i<3;i++)smoke(cl.x+rnd(-10,10)*Z,feetY(cl.y)-rnd(0,50)*Z,rnd(10,14)*Z,{life:.7,dark:true});}});
  if(t>=3.0)R.heroA=seg(t,3.0,3.12);
  if(t>=3.18)once(S,'X',()=>{for(const e of enemies){if(!liveE(e))continue;if(Math.hypot(e.x-S.cx,e.y-S.cy)>R_+(e.sz||16)*.5)continue;dmg(e,S.ctx,S.fin,{crit:1});}
    try{shake(8);}catch(_){}
    if(FXON){const m=liveE(S.main)?S.main:null,x=m?m.x:S.cx,y=m?eCy(m):feetY(S.cy)-30*Z;add({k:'x',x,y,s:124*Z,w:34*Z,life:1.0,hold:.5});xEnds(x,y,124*Z);
      for(let i=0;i<14;i++){const a=rnd(0,6.283);add({k:'s',x,y,vx:Math.cos(a)*260*Z,vy:Math.sin(a)*140*Z,drag:3,s:rnd(5,9)*Z,col:i%2?GRN:VL,life:.45});}
      add({k:'ring',x:S.cx,y:feetY(S.cy),s:R_*1.2,w:12*Z,col:'rgba(122,79,176,.7)',life:.6});}});
  if(FXON&&t>3.4&&t<4.4&&Math.random()<dt*14)smoke(S.cx+rnd(-R_,R_),feetY(S.cy)+rnd(-R_*.5,R_*.5),rnd(14,22)*Z,{vy:-rnd(20,40),life:.9,a:.6});}
/* ---------------- scenes that outlive the cast (smoke cloud, blades in flight, ult tail) ---------------- */
const SCN=[];R.scn=SCN;
/* ---------------- frame ---------------- */
function tick(dt){const now=clk();Z=clamp(heroH()/62,.7,2.2);
  if(S){const t=now-S.t0;
    const lost=!P||P.dead||G.zone!==S.zone||G.state!=='play'||!dgEq()||(stunnedNow()&&S.k!=='ult'&&S.k!=='storm');
    if(lost){log('cancel',{k:S.k});if(S.k==='blades'||S.k==='ult')SCN.push(Object.assign(S,{tail:1}));S=null;POSE=null;R.heroA=1;}
    else{if(S.k!=='shadow'||t<.38)P.face=S.ang;
      tickSkill(S,t,dt);
      const keep=S.k==='blades'?D2_BACK+.3:S.k==='ult'?4.6:S.k==='storm'?2.6:S.k==='shadow'?1.1:0;
      if(t>=S.lock){if(keep>t){S.tail=1;SCN.push(S);}S=null;if(POSE&&POSE.kind!=='basic')POSE=null;P.atkCd=Math.min(P.atkCd||0,.05);if(R.heroA<1&&!(SCN.some(s=>s.k==='ult'&&now-s.t0<3.12)))R.heroA=1;}}}
  if(POSE&&now-POSE.t0>POSE.lock)POSE=null;
  // scenes after the cast lock ends
  for(let i=SCN.length-1;i>=0;i--){const s=SCN[i],t=now-s.t0;let alive=true;
    if(s.k==='smoke'&&!s.tail)alive=smokeScene(s,t,dt);
    else if(s.tail){if(G.zone!==s.zone||P.dead){alive=false;}else{tickSkill(s,t,dt);alive=t<(s.k==='blades'?D2_BACK+.3:s.k==='ult'?4.6:s.k==='storm'?2.6:1.1);}}
    if(!alive)SCN.splice(i,1);}
  if(R.night&&now-R.night.t0>4.6)R.night=null;
  // buffs: time out / weapon / death
  for(const k in BUFS){const b=BUFS[k];if(!P||P.dead){buffOff(k,'death');continue;}if(!dgEq()){buffOff(k,'weapon');continue;}if(!P.buffs[CFG[k].id]||now>=b.end+.1){buffOff(k,'time');continue;}
    if(k==='cloak'&&!(P.stealth>0))buffOff(k,'stealth over');}
  if(BUFS.cloak)P.stealth=Math.max(P.stealth||0,BUFS.cloak.end-now);
  // shadow body: the clone walks a beat behind
  const bb=BUFS.body;if(bb){bb.hist.unshift({t:now,x:P.x,y:P.y,d:POSE?POSE.d:dirOf((P.face||0)+yaw())});if(bb.hist.length>60)bb.hist.length=60;}
  // shadow body procs: 20 % of dagger hits are repeated by a shadow 0.2 s later
  for(let i=PROCS.length-1;i>=0;i--){const p=PROCS[i];if(now<p.t)continue;PROCS.splice(i,1);if(!BUFS.body||!liveE(p.e))continue;
    dmg(p.e,BUFS.body.ctx,p.m,{proc:1});R.stats.body++;BUFS.body.strike=now;if(FXON)bodyProcFx(p.e);}
  if(G.state==='play')pzTick();
  stepP(dt);
  try{if(WEAPONS.dagger.range!==CFG.basic.range)WEAPONS.dagger.range=CFG.basic.range;WEAPONS.dagger.aspd=2.0;}catch(_){}}
{const o=update;update=function(dt){const r=o.apply(this,arguments);try{if(R.public){tick(+dt||0);basicTick();}}catch(e){R.err='tick '+e.message;}return r;};}
/* no walking while a stab / skill plays (same rule as the sword swing); buffs keep the hero free after the cast moment */
try{const _up=updPlayer;updPlayer=function(){const lock=!!(R.public&&dgEq()&&!P.dead&&(BA||(S&&!(BUF.includes(S.k)&&clk()-S.t0>=S.cast))));const x0=P.x,y0=P.y;const r=_up.apply(this,arguments);
  if(lock){P.x=x0;P.y=y0;P.vx=0;P.vy=0;}return r;};}catch(e){R.err='updPlayer '+e.message;}
{const o=playerDeath;playerDeath=function(){try{for(const k in BUFS)buffOff(k,'death');S=null;POSE=null;BA=null;R.heroA=1;SCN.length=0;PROCS.length=0;}catch(_){}return o.apply(this,arguments);};}
if(typeof loadZone==='function'){const o=loadZone;loadZone=function(){try{S=null;POSE=null;BA=null;R.heroA=1;SCN.length=0;PROCS.length=0;PL.length=0;R.night=null;}catch(_){}return o.apply(this,arguments);};}
/* ---------------- stats: crit (+10 weapon, passive, focus Lv5), crit damage, HP / DEF of the weapon, dodge with the 45 % cap ---------------- */
{const o=B;B=function(k){let v=o(k);if((k==='crit'||k==='critDmg')&&R.public&&dgEq()){if(k==='crit'){v+=CFG.wpn.crit;if(pon('weak'))v+=CFG.weak.crit;}else if(pon('weak'))v+=CFG.weak.cdmg||0;}return v;};}
try{const _rc=recalc;recalc=function(){const r=_rc.apply(this,arguments);try{if(R.public&&dgEq()){P.maxHp=Math.round(P.maxHp*CFG.wpn.hp);if(P.hp>P.maxHp)P.hp=P.maxHp;P.def=Math.round(P.def*CFG.wpn.def);}}catch(_){}return r;};}catch(e){R.err='recalc '+e.message;}
function dodgeAdd(){let a=0;if(BUFS.step)a+=CFG.step.dodge;if(pon('sdodge'))a+=CFG.sdodge.dodge;if(P&&inSmoke(P.x,P.y))a+=CFG.smoke.dodge;return a/100;}
let NODODGE=false;
{const o=dodgeChance;dodgeChance=function(){if(NODODGE)return 0;const b=o.apply(this,arguments);if(!(R.public&&dgEq()))return b;return Math.min(CFG.dodgeCap,b+dodgeAdd());};}
{const o=hurtPlayer;hurtPlayer=function(raw,src){
  if(!(R.public&&dgEq())||!P||P.dead||G.state!=='play'||G.edit||G.god||P.dome||P.invT>0||safeNow())return o.apply(this,arguments);
  try{if(src&&liveE(src)&&inSmoke(src.x,src.y)&&rf()<CFG.smoke.blind){R.stats.blind++;textAt(P.x,P.y-50,'พลาด!','#d9c4ff',14,{life:.6});return;}
    const p0=window.__dSrc;window.__dSrc=src||null;let dc=0;try{dc=dodgeChance();}finally{window.__dSrc=p0;}
    if(rf()<dc){R.stats.dodge++;textAt(P.x,P.y-50,'หลบ!',GRN,15,{life:.6});try{sfx('dodge');}catch(_){}
      if(pon('sdodge')&&CFG.sdodge.heal>0)P.hp=Math.min(P.maxHp,P.hp+Math.max(1,Math.round(P.maxHp*CFG.sdodge.heal)));
      if(FXON){add({k:'ghost',x:P.x,y:P.y,d:dirOf((P.face||0)+yaw()),life:.4,hold:0});for(let i=0;i<4;i++)smoke(P.x+rnd(-12,12)*Z,feetY()-rnd(0,40)*Z,rnd(7,10)*Z,{vx:rnd(20,50),life:.5,dark:true});}
      return;}}catch(er){R.err='hurt '+er.message;}
  NODODGE=true;try{return o.apply(this,arguments);}finally{NODODGE=false;}};}
/* ---------------- damage bonuses inside the game's own damage step (Shadow Cloak next hit, Hunt the Weak) ---------------- */
function hookBonus(){const PS=window.__PASS;if(!PS||typeof PS.dmgBonus!=='function')return false;if(PS.dmgBonus._p300)return true;const ob=PS.dmgBonus;
  const f=function(e,o,ctx,sub){const r=ob.apply(this,arguments)||[];
    try{if(!ctx||!ctx.dg||!dgEq()||(o&&o.dot)||!e)return r;const add_=[];if(CUR&&CUR.cb)add_.push(CUR.cb);
      if(pon('prey')&&(e.hp/Math.max(1,e.maxHp)<CFG.prey.hp||pzN(e)>0))add_.push(CFG.prey.dmg);
      return add_.length?r.concat(add_):r;}catch(er){R.err='bonus '+er.message;return r;}};
  f._p300=1;if(ob._p280)f._p280=1;PS.dmgBonus=f;return true;}
if(!hookBonus())R.err='no damage bonus hook';
{let n=0;const iv=setInterval(()=>{try{hookBonus();}catch(_){}if(++n>60)clearInterval(iv);},250);}
/* ================= VFX: particles + shapes (ported from the approved demo r3) ================= */
function mk(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c;}
const GL={};function glow(col){return GL[col]||(GL[col]=mk(64,64,g=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,col);r.addColorStop(.3,col+'bb');r.addColorStop(1,col+'00');g.fillStyle=r;g.fillRect(0,0,64,64);}));}
function smokeSpr(c0,c1,c2){return mk(128,128,g=>{const r=g.createRadialGradient(58,56,0,64,64,64);r.addColorStop(0,c0);r.addColorStop(.55,c1);r.addColorStop(1,c2);g.fillStyle=r;g.fillRect(0,0,128,128);});}
const SMK=smokeSpr('rgba(84,44,128,.95)','rgba(58,28,92,.65)','rgba(36,18,58,0)');
const SMK_D=smokeSpr('rgba(40,20,64,.95)','rgba(32,16,52,.7)','rgba(24,12,40,0)');
const SMK_H=smokeSpr('rgba(140,96,200,.85)','rgba(100,60,160,.35)','rgba(80,40,130,0)');
const PL=[];R.pl=PL;
const FXQ=()=>(window.matchMedia&&matchMedia('(pointer:coarse)').matches)?.7:1;
const CAP=()=>(S&&S.k==='ult')||SCN.some(s=>s.k==='ult')?220:120;
function add(p){if(!FXON||PL.length>=CAP()*FXQ())return;p.age=0;p.vx=p.vx||0;p.vy=p.vy||0;p.g=p.g||0;p.rot=p.rot||0;p.vr=p.vr||0;p.drag=p.drag||0;PL.push(p);R.stats.ptPeak=Math.max(R.stats.ptPeak,PL.length);}
function stepP(dt){for(const p of PL){p.age+=dt;p.vx*=1-p.drag*dt;p.vy=p.vy*(1-p.drag*dt)+p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;if(p.floor!=null&&p.y>p.floor){p.y=p.floor;p.vy*=-.25;p.vx*=.5;p.vr*=.4;}}
  for(let i=PL.length-1;i>=0;i--)if(PL[i].age>=PL[i].life)PL.splice(i,1);}
function smoke(x,y,s,o){const v=rnd(.6,1.5);add(Object.assign({k:'smoke',x:x+rnd(-.3,.3)*s,y:y+rnd(-.2,.2)*s,s:s*v,sq:rnd(.7,1.3),vy:-rnd(10,30),vx:rnd(-15,15),life:rnd(.6,1),fin:.12,grow:.8,ph:rnd(0,6.283)},o||{}));}
function ribbon(x,y,r,o){add(Object.assign({k:'rib',x,y,r,a0:rnd(0,6.283),spin:rnd(2.5,4)*(Math.random()<.5?-1:1),climb:rnd(30,60)*Z,w:rnd(7,11)*Z,life:rnd(.7,1),fin:.1,hold:.4},o||{}));}
function xEnds(x,y,sc){const c=Math.cos(.75)*sc,s=Math.sin(.75)*sc;for(const [ex,ey] of [[-c,-s],[c,-s],[-c,s],[c,s]]){smoke(x+ex,y+ey,rnd(10,15)*Z,{vx:ex*.8,vy:ey*.6,drag:2,life:.8,dark:Math.random()<.5});add({k:'s',x:x+ex*.9,y:y+ey*.9,s:22*Z,col:GRN,life:.3});}}
function band(pts,wf,col,a){if(pts.length<2||a<=0)return;const L2=[],R2=[];for(let i=0;i<pts.length;i++){const p0=pts[Math.max(0,i-1)],p1=pts[Math.min(pts.length-1,i+1)],dx=p1[0]-p0[0],dy=p1[1]-p0[1],l=Math.hypot(dx,dy)||1,w=wf(pts[i][2])/2;L2.push([pts[i][0]-dy/l*w,pts[i][1]+dx/l*w]);R2.push([pts[i][0]+dy/l*w,pts[i][1]-dx/l*w]);}
  ctx.save();ctx.globalAlpha=a;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(L2[0][0],L2[0][1]);for(const q of L2)ctx.lineTo(q[0],q[1]);for(let i=R2.length-1;i>=0;i--)ctx.lineTo(R2[i][0],R2[i][1]);ctx.closePath();ctx.fill();ctx.restore();}
function drops(x,y,n,sp){for(let i=0;i<n;i++){const a=rnd(0,6.283),v=rnd(40,sp||160)*Z;add({k:'drop',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.6-rnd(40,120)*Z,g:520*Z,s:rnd(2.5,4.5)*Z,life:rnd(.5,.8),floor:y+rnd(20,40)*Z});}}
function chips(x,y,n,dir){for(let i=0;i<n;i++)add({k:'chip',x:x+rnd(-6,6)*Z,y:y+rnd(-10,10)*Z,vx:((dir||0)*rnd(60,160)+rnd(-80,80))*Z,vy:-rnd(80,200)*Z,g:600*Z,vr:rnd(-12,12),s:rnd(2,4)*Z,life:rnd(.4,.6),floor:y+rnd(30,45)*Z,col:Math.random()<.5?VH:'#2a1446'});}
/* tapered slash: dark violet body, light violet edge, toxic green core */
function slashLine(x0,y0,x1,y1,w,alpha,green){if(alpha<=0)return;const dx=x1-x0,dy=y1-y0,len=Math.hypot(dx,dy)+.01,nx=-dy/len,ny=dx/len,mx=(x0+x1)/2,my=(y0+y1)/2,bow=len*.14+w*.6;ctx.save();
  const cres=(th,col,a)=>{ctx.globalAlpha=alpha*a;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo(mx+nx*(bow+th),my+ny*(bow+th),x1,y1);ctx.quadraticCurveTo(mx+nx*(bow-th*.7),my+ny*(bow-th*.7),x0,y0);ctx.fill();};
  cres(w*1.35,'#2a1446',.85);cres(w*.9,'#5a2c90',.9);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=alpha*.35;ctx.drawImage(glow(green?GRN:VL),mx+nx*bow*.7-w*2.4,my+ny*bow*.7-w*2.4,w*4.8,w*4.8);
  cres(w*.5,green?GRN:'#a070e0',.95);if(green)cres(w*.16,'#eaffc8',.45);ctx.restore();}
function pool(x,y,r,a){if(a<=0)return;const now=clk();ctx.save();ctx.globalAlpha=a;ctx.translate(x,y);ctx.scale(1,.5);const g=ctx.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,'rgba(24,10,40,.9)');g.addColorStop(.7,'rgba(50,22,84,.7)');g.addColorStop(1,'rgba(74,36,112,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r,0,6.283);ctx.fill();
  ctx.strokeStyle=VH;ctx.lineWidth=2;ctx.globalAlpha=a*.6;ctx.setLineDash([12,10]);ctx.lineDashOffset=-now*30;ctx.beginPath();ctx.arc(0,0,r*.8,0,6.283);ctx.stroke();ctx.setLineDash([]);ctx.restore();}
/* one curved "Night Fang" blade (the flying Venom Blades), dir = where it points */
function blade(x,y,dir,len){ctx.save();ctx.translate(x,y);ctx.rotate(dir);ctx.fillStyle='#3a2a1c';ctx.fillRect(-7*Z,-2*Z,7*Z,4*Z);
  ctx.fillStyle='#d8d0ea';ctx.beginPath();ctx.moveTo(0,-3*Z);ctx.quadraticCurveTo(len*.6,-6*Z,len,-1*Z);ctx.quadraticCurveTo(len*.55,1*Z,0,3*Z);ctx.closePath();ctx.fill();ctx.fillStyle='#6a4a9a';ctx.fillRect(-1*Z,-4*Z,3*Z,8*Z);ctx.restore();}
/* ---- the hero's body frames (approved bow-shot body layer = stand-in pose) + tinted copies for shadows ---- */
let bodyImg=null,bodyOk=false;function bodyLoad(){if(bodyImg)return;bodyImg=new Image();bodyImg.onload=()=>{bodyOk=true;};bodyImg.src=D.src.body;}
const OL={map:new Map(),max:60},TN={map:new Map(),max:80};const OLO=[];for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(dx*dx+dy*dy<=5)OLO.push([dx,dy]);
function olFrame(d,i){const key=d*1000+i;let c=OL.map.get(key);if(c){OL.map.delete(key);OL.map.set(key,c);return c;}
  const r=D.layers.body.rects[ORDER[d]][i];if(!r)return null;const x0=r[4]-3,y0=r[5]-3;
  c=document.createElement('canvas');c.width=r[2]+6;c.height=r[3]+6;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  for(const [dx,dy] of OLO)g.drawImage(bodyImg,r[0],r[1],r[2],r[3],3+dx,3+dy,r[2],r[3]);
  g.globalCompositeOperation='source-in';g.fillStyle='#2B201C';g.fillRect(0,0,c.width,c.height);g.globalCompositeOperation='source-over';
  g.drawImage(bodyImg,r[0],r[1],r[2],r[3],3,3,r[2],r[3]);c.ox=x0;c.oy=y0;OL.map.set(key,c);if(OL.map.size>OL.max)OL.map.delete(OL.map.keys().next().value);return c;}
/* shadow copy: the same frame filled violet-black with a soft violet rim (kind 'dark') or a light violet afterimage (kind 'ghost') */
function tnFrame(d,i,kind){const key=(kind==='ghost'?1e6:0)+d*1000+i;let c=TN.map.get(key);if(c){TN.map.delete(key);TN.map.set(key,c);return c;}
  const b=olFrame(d,i);if(!b)return null;const pad=6;c=document.createElement('canvas');c.width=b.width+pad*2;c.height=b.height+pad*2;const g=c.getContext('2d');
  if(kind!=='ghost'){g.shadowColor='#9a6ad8';g.shadowBlur=6;}g.drawImage(b,pad,pad);g.shadowBlur=0;
  g.globalCompositeOperation='source-atop';g.fillStyle=kind==='ghost'?VH:'#2a1640';g.globalAlpha=kind==='ghost'?.92:.94;g.fillRect(0,0,c.width,c.height);
  if(kind!=='ghost'){g.globalAlpha=.35;const gr=g.createLinearGradient(0,0,0,c.height);gr.addColorStop(0,'rgba(154,106,216,.9)');gr.addColorStop(.5,'rgba(154,106,216,0)');g.fillStyle=gr;g.fillRect(0,0,c.width,c.height);}
  g.globalAlpha=1;g.globalCompositeOperation='source-over';c.ox=b.ox-pad;c.oy=b.oy-pad;TN.map.set(key,c);if(TN.map.size>TN.max)TN.map.delete(TN.map.keys().next().value);return c;}
function cloneDraw(x,y,d,a,o){if(a<=0||!bodyOk)return;o=o||{};const i=o.i==null?D.rest:o.i,c=tnFrame(d,i,o.kind||'dark');if(!c)return;
  ctx.save();if(o.kind!=='ghost'){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a*.4;const fy=feetY(y);ctx.drawImage(glow(VH),x-34*Z,fy-80*Z,68*Z,90*Z);}
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=clamp(a*(o.kind==='ghost'?.55:.92),0,1);
  if(o.clipH!=null){const fy=feetY(y);ctx.beginPath();ctx.rect(x-80*Z,fy-o.clipH,160*Z,o.clipH+4*Z);ctx.clip();}
  ctx.imageSmoothingEnabled=true;ctx.drawImage(c,x+(c.ox-AX)*KS,y+(o.dy||0)+(c.oy-AY)*KS,c.width*KS,c.height*KS);
  if(o.kind!=='ghost'&&o.eyes!==false){const fy=feetY(y)+(o.dy||0);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a*.8;const ex=x+(d===0||d===1||d===7?3:d>=3&&d<=5?-3:0)*Z;
    if(d!==6){ctx.drawImage(glow(GRN),ex-4*Z,fy-heroH()*.74-3*Z,8*Z,6*Z);}}
  ctx.restore();}
/* stand-in pose: bow-shot body frames 20..52 (charge / release 37 / follow) mapped onto the stab or cast timing */
function poseIdx(now){const p=POSE;if(!p)return D.rest;const t=now-p.t0;
  if(p.kind==='basic'){if(t<p.cast){const u=t/p.cast;return 1+30+Math.min(6,Math.floor(u*7));}const v=clamp((t-p.cast)/Math.max(.05,p.lock-p.cast),0,1);return 1+37+Math.min(10,Math.floor(v*11));}
  if(t<p.cast){const u=t/p.cast;return 1+20+Math.min(16,Math.floor(u*17));}
  const v=clamp((t-p.cast)/Math.max(.05,p.lock-p.cast),0,1);return 1+37+Math.min(15,Math.floor(v*16));}
function standing(){const sp=Math.hypot(P.vx||0,P.vy||0);return sp<=25&&!P.dash&&!P.dead&&!((P.hurtT||0)>0);}
{const o=drawPlayerSprite;drawPlayerSprite=function(x,y,bob,fa){
  if(!(R.public&&dgEq()&&G.state==='play')||P.dead)return o.apply(this,arguments);
  bodyLoad();const now=clk(),fy=y+FY,ha=clamp(((window.__DGVIS&&__DGVIS.on&&S&&(S.k==='storm'||S.k==='ult'))?1:R.heroA),0,1);if(window.__DGVIS)__DGVIS.last=ha;
  try{aura(false,x,fy,now);}catch(e){R.err='aura '+e.message;}
  let r;
  if(ha>.01){ctx.save();if(ha<1)ctx.globalAlpha*=ha;
    if(bodyOk&&(POSE||standing())){let d,i;if(POSE){d=POSE.d;i=poseIdx(now);}else{d=fa!=null&&isFinite(fa)?dirOf(fa):dirOf((P.face||0)+yaw());i=D.rest;}
      let rx=0,ry=0;if(POSE&&POSE.kind==='basic'){const u=(now-POSE.t0-POSE.cast)/.12;if(u>=0&&u<1){const e=Math.sin(u*Math.PI)*4*Z;rx=Math.cos(POSE.ang)*e;ry=Math.sin(POSE.ang)*e*.5;}}
      const c=olFrame(d,i);if(c){ctx.imageSmoothingEnabled=true;ctx.drawImage(c,x+rx+(c.ox-AX)*KS,y+ry+(c.oy-AY)*KS,c.width*KS,c.height*KS);}R.stats.bodyDraws++;}
    else r=o.apply(this,arguments);
    ctx.restore();}
  try{aura(true,x,fy,now);}catch(e){R.err='aura '+e.message;}
  return r;};}
/* ---- buff cast moment + looping auras (standing rule: cast moment + looping aura for every buff) ---- */
function buffCastFx(k){if(!FXON)return;const y=feetY();
  for(let i=0;i<3;i++)ribbon(P.x,y-(14+i*12)*Z,(24+i*5)*Z,{life:.5,hold:.3,climb:30*Z,fol:(o=>()=>({x:P.x,y:feetY()-(14+o*12)*Z}))(i)});
  for(let i=0;i<6;i++)smoke(P.x+rnd(-16,16)*Z,y-rnd(0,20)*Z,rnd(10,15)*Z,{vy:-rnd(20,40),life:.6,dark:i%2});}
function buffRelFx(k){if(!FXON)return;const y=feetY();
  add({k:'ring',x:P.x,y,s:70*Z,w:6*Z,col:k==='coat'?'rgba(156,255,60,.6)':'rgba(122,79,176,.75)',life:.5});
  add({k:'s',x:P.x,y:y-34*Z,s:56*Z,col:k==='coat'||k==='focus'?GRN:VL,life:.25});
  for(let i=0;i<8;i++){const a=i/8*6.283;smoke(P.x+Math.cos(a)*14*Z,y-30*Z+Math.sin(a)*14*Z,rnd(9,13)*Z,{vx:Math.cos(a)*70,vy:Math.sin(a)*40-10,drag:2,life:.6,dark:i%2});}
  if(k==='coat')drops(P.x+10*Z,y-34*Z,8,120);
  if(k==='body')BUFS.body&&(BUFS.body.rise0=clk());}
function bfade(k,now){const b=BUFS[k];if(!b)return 0;return Math.min(1,(now-b.t0)/.3,(b.end-now)/.45+.0001);}
let AT={};
function aura(front,x,fy,now){if(!FXON)return;const dt=Math.min(.05,now-(AT.last||now));if(front)AT.last=now;
  // cloak: the hero is see-through (game stealth), violet ribbons coil round the body
  let a=bfade('cloak',now);if(a>0&&front&&dt>0&&Math.random()<dt*3)ribbon(P.x,fy-26*Z,16*Z,{climb:28*Z,w:6*Z,life:.8,fol:()=>({x:P.x,y:feetY()-26*Z})});
  // venom coat: green drips from both hands + a green sheen
  a=bfade('coat',now);if(a>0&&front){if(dt>0&&Math.random()<dt*6){const s=Math.random()<.5?1:-1;add({k:'drop',x:P.x+s*12*Z,y:fy-30*Z,vy:20,g:300*Z,s:2.4*Z,life:.6,floor:fy+4*Z});}
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a*(.35+.15*Math.sin(now*5));for(const s of [-1,1])ctx.drawImage(glow(GRN),P.x+s*12*Z-7*Z,fy-36*Z,14*Z,14*Z);ctx.restore();}
  // shadow step: smoke footprints while moving + low violet wisps at the feet
  a=bfade('step',now);if(a>0){if(!front){ctx.save();ctx.globalAlpha=a*.5;ctx.translate(P.x,fy);ctx.scale(1,.35);ctx.globalCompositeOperation='lighter';ctx.drawImage(glow(VH),-30*Z,-30*Z,60*Z,60*Z);ctx.restore();}
    else if(dt>0){const mv=Math.hypot(P.vx||0,P.vy||0)>30;if(mv&&Math.random()<dt*10)smoke(P.x+rnd(-8,8)*Z,fy-rnd(0,6)*Z,rnd(7,10)*Z,{vx:-(P.vx||0)*.2,vy:-rnd(5,15),life:.6,dark:true,a:.8});
      if(mv&&Math.random()<dt*4)add({k:'ghost',x:P.x,y:P.y,d:dirOf((P.face||0)+yaw()),life:.3,hold:0});}}
  // assassin's focus: a green glint orbits at eye height, a thin violet ring breathes at the feet
  a=bfade('focus',now);if(a>0){const ang=now*2.6,ex=P.x+Math.cos(ang)*18*Z,ey=fy-heroH()*.72+Math.sin(ang)*5*Z,inFront=Math.sin(ang)>0;
    if(inFront===front){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a*.9;ctx.drawImage(glow(GRN),ex-7*Z,ey-7*Z,14*Z,14*Z);ctx.fillStyle='#eaffc8';ctx.beginPath();ctx.arc(ex,ey,1.6*Z,0,6.283);ctx.fill();ctx.restore();}
    if(!front){const pu=(now/1.2)%1;ctx.save();ctx.globalAlpha=a*(1-pu)*.7;ctx.strokeStyle=VL;ctx.lineWidth=2*Z;ctx.beginPath();ctx.ellipse(P.x,fy,(18+pu*26)*Z,(18+pu*26)*Z*.45,0,0,6.283);ctx.stroke();ctx.restore();}}
  // shadow body: the clone a half-step behind (drawn behind the hero), rising out of a pool when cast
  const b=BUFS.body;if(b&&!front){const h=b.hist.find(q=>now-q.t>=.1)||b.hist[b.hist.length-1];if(h){const f=dirOf((P.face||0)+yaw()),back=(P.face||0)+Math.PI*.75,ox=Math.cos(back)*38*Z,oy=Math.sin(back)*20*Z;
      const cx=h.x+ox,cy=h.y+oy,rise=ease(seg(now,b.t0,b.t0+.6)),out=seg(now,b.end-.5,b.end);b.cl={x:cx,y:cy};
      pool(cx,feetY(cy),30*Z*(.5+.5*rise),(1-out)*.8);
      // r3 (DeaRz 27 Oct 02:29): the follower copies the hero's current pose (every hit now really lands twice, so the swing is never empty)
      cloneDraw(cx,cy,POSE?POSE.d:f,(1-out)*(.4+.6*rise),{i:POSE?poseIdx(now):D.rest,clipH:rise*heroH()*1.3,dy:(1-rise)*20*Z});
      if(front===false&&Math.random()<.12)smoke(cx+rnd(-16,16)*Z,feetY(cy)-rnd(10,60)*Z,rnd(6,10)*Z,{vy:-rnd(15,30),life:.7,a:.7,dark:true});}}}
/* ---- stab FX: a short crescent per hand (right = violet, left reverse grip = green edge) + spark on the target ---- */
function stabFx(ba,twin,e){const a=ba.ang,ca=Math.cos(a),sa=Math.sin(a),side=(ba.hand?1:-1)*(twin?-1:1),nx=-sa*side,ny=ca*side;
  const hx=P.x+ca*10*Z,hy=feetY()-36*Z+sa*4*Z,L=(CFG.basic.range+10)*Z*.8;
  add({k:'streak',x0:hx+nx*14*Z-ca*4*Z,y0:hy+ny*8*Z-10*Z,x1:hx+ca*L-nx*6*Z,y1:hy+sa*L*.5-ny*4*Z+6*Z,w:(twin?5:6)*Z,green:twin||ba.hand===0,life:.3,hold:.15});
  if(e&&liveE(e)){const y=eCy(e);add({k:'s',x:e.x,y,s:(twin?30:24)*Z,col:twin?GRN:VL,life:.15});chips(e.x,y,2,Math.sign(ca)||1);}}
function bodyProcFx(e){if(!liveE(e))return;const side=Math.random()<.5?1:-1,y=eCy(e);   // r3: the shadow's extra cut lands on the target (no clone popping beside it)
  add({k:'streak',x0:e.x-side*30*Z,y0:y-26*Z,x1:e.x+side*24*Z,y1:y+14*Z,w:6*Z,green:true,life:.32,hold:.2});add({k:'s',x:e.x,y,s:30*Z,col:VL,life:.18});
  for(let i=0;i<3;i++)smoke(e.x+rnd(-14,14)*Z,y+rnd(-10,10)*Z,rnd(7,10)*Z,{life:.4,dark:true});}
/* ---- particle draw (demo drawP, + 'ghost' / 'shade' = tinted hero frames) ---- */
function drawP(){for(const p of PL){const u=p.age/p.life,hd=p.hold==null?.5:p.hold,fi=p.fin?seg(p.age,0,p.fin):1,a=fi*(hd>=1?1:(1-Math.max(0,u-hd)/(1-hd)));if(a<=0)continue;ctx.globalAlpha=clamp(a*(p.a||1),0,1);
    if(p.k==='smoke'){const s=p.s*(1+u*(p.grow||.8)),ph=p.ph||0,img=p.dark?SMK_D:SMK;ctx.globalAlpha*=.6;
      for(let j=0;j<3;j++){const an=ph+j*2.1+u*1.5,d=s*(.25+.35*u),ss=s*(.75-.12*j)*(.75+.5*Math.abs(Math.sin(ph*3+j)));ctx.drawImage(img,p.x+Math.cos(an)*d-ss,p.y+Math.sin(an)*d*.6-ss*.8,ss*2*(p.sq||1),ss*1.6/(p.sq||1));}
      ctx.globalAlpha*=.45;ctx.drawImage(SMK_H,p.x-s*.7,p.y-s*.95,s*1.1,s*.8);}
    else if(p.k==='rib'){const A_=ctx.globalAlpha,N=16,f=p.fol?p.fol():null,cx=f?f.x:p.x,cy=f?f.y:p.y,pts=[];
      for(let k=0;k<=N;k++){const q=k/N,an=p.a0+p.spin*p.age-q*2.2*Math.sign(p.spin),rr=p.r*(1+u*.6)*(.75+.25*q)+Math.sin(q*9+p.a0+p.age*5)*2.5*Z,yy=cy+Math.sin(an)*rr*.45-p.climb*u-q*10*Z;pts.push([cx+Math.cos(an)*rr,yy,q]);}
      band(pts,q=>p.w*Math.pow(Math.sin(q*Math.PI),.8)*(1-u*.4)*(.85+.3*Math.sin(q*13+p.a0)),'rgba(30,14,50,1)',A_*.6);band(pts.slice(3,N-2),q=>p.w*.3*Math.sin(q*Math.PI),VH,A_*.4);
      ctx.save();ctx.globalAlpha=A_*.35;ctx.strokeStyle=V1;ctx.lineWidth=1.2*Z;for(let k=4;k<N;k+=4){const [x,y]=pts[k];ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+6*Z*Math.sign(p.spin),y-6*Z,x+3*Z,y-(12+6*u)*Z);ctx.stroke();}ctx.restore();}
    else if(p.k==='drop'){ctx.fillStyle=GRN;ctx.beginPath();ctx.ellipse(p.x,p.y,p.s*.7,p.s,0,0,6.283);ctx.fill();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=.5;ctx.drawImage(glow(GRN),p.x-p.s*2,p.y-p.s*2,p.s*4,p.s*4);ctx.globalCompositeOperation='source-over';}
    else if(p.k==='chip'){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=p.col||'#8a6440';ctx.fillRect(-p.s,-p.s*.35,p.s*2,p.s*.7);ctx.restore();}
    else if(p.k==='ghost'){const A_=ctx.globalAlpha;cloneDraw(p.x,p.y,p.d,A_,{kind:'ghost'});}
    else if(p.k==='shade'){const A_=ctx.globalAlpha,sw=p.age>.35&&p.age<.55;cloneDraw(p.x,p.y,p.d,A_*seg(p.age,0,.12)*(1-seg(p.age,.6,.75)),{i:sw?1+37+Math.min(10,Math.floor((p.age-.35)/.02)):1+30});}
    else if(p.k==='bubble'){ctx.strokeStyle=GRN;ctx.lineWidth=1.5*Z;ctx.beginPath();ctx.arc(p.x+Math.sin(p.age*7+p.ph)*2*Z,p.y,p.s*(.6+u*.6),0,6.283);ctx.stroke();}
    else if(p.k==='streak'){const sw=ease(Math.min(1,p.age/.07));slashLine(p.x0,p.y0,lerp(p.x0,p.x1,sw),lerp(p.y0,p.y1,sw),p.w*1.4*(1-u*.4),ctx.globalAlpha,p.green!==false);}
    else if(p.k==='x'){const sc=p.s*(.8+.2*ease(p.age/.12));for(const sd of [-1,1]){const c=Math.cos(.75)*sc,s=Math.sin(.75)*sc;slashLine(p.x-c*sd,p.y-s,p.x+c*sd,p.y+s,p.w,ctx.globalAlpha,true);}}
    else if(p.k==='ring'){ctx.save();ctx.translate(p.x,p.y);ctx.scale(1,.5);const r=p.s*(.3+.7*ease(u));ctx.strokeStyle=p.col;ctx.lineWidth=Math.max(.1,p.w*(1-u));ctx.beginPath();ctx.arc(0,0,r,0,6.283);ctx.stroke();ctx.restore();}
    else{ctx.globalCompositeOperation='lighter';ctx.drawImage(glow(p.col||GRN),p.x-p.s/2,p.y-p.s/2,p.s,p.s);ctx.globalCompositeOperation='source-over';}}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
/* ---- skill shapes per frame ---- */
function curScenes(){const L=SCN.slice();if(S)L.push(S);return L;}
function drawBlades(s,t){if(!s.blades||!s.blades.length)return;
  const tr=t>D2_GO&&t<D2_BACK+.15;if(tr){for(const b of s.blades){const h=b.h;if(!h||h.length<3)continue;const f=1-seg(t,D2_BACK-.05,D2_BACK+.1);
    const pts=h.map((p,k)=>[p[0],p[1],k/(h.length-1)]);band(pts,q=>14*Z*q,'rgba(58,28,94,1)',.55*f);ctx.save();ctx.globalCompositeOperation='lighter';band(pts,q=>3.2*Z*q,GRN,.85*f);ctx.restore();}}
  for(const b of s.blades){if(b.a<=0)continue;const spin=b.u>.12&&b.u<1;
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=b.a*(spin?.75:.5);ctx.drawImage(glow(spin?GRN:VH),b.x-24*Z,b.y-24*Z,48*Z,48*Z);ctx.restore();
    ctx.save();ctx.globalAlpha=b.a;ctx.translate(b.x,b.y);ctx.scale(1,spin?.6:1);blade(-22*Z*Math.cos(b.rot),-22*Z*Math.sin(b.rot),b.rot,44*Z);
    if(spin){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=b.a*.35;ctx.strokeStyle=VL;ctx.lineWidth=2*Z;ctx.beginPath();ctx.arc(0,0,23*Z,b.rot,b.rot+2.2);ctx.stroke();}ctx.restore();}}
function drawStormClones(s,t){for(const c of (s.cl||[])){const age=t-c.t0;if(age<0||age>.6)continue;const a=seg(age,0,.08)*(1-seg(age,.42,.6)),mv=age>.1&&age<.21;
    const x0=c.bx+c.ox0,y0=c.by+c.oy0,x1=c.bx+c.ox1,y1=c.by+c.oy1,u=ease(seg(age,.1,.21)),x=lerp(x0,x1,u),y=lerp(y0,y1,u);
    if(mv)for(let g=1;g<=2;g++){const uu=ease(seg(age-g*.03,.1,.21));cloneDraw(lerp(x0,x1,uu),lerp(y0,y1,uu),c.d,a*.3/g,{kind:'ghost'});}
    cloneDraw(x,y,c.d,a*(mv?.8:1),{i:mv?1+37:age>.21?1+44:1+30});}}
function drawSmokeBomb(s,t){if(t>.12&&t<D4_ON){const p=bombPos(s,t);ctx.save();ctx.lineCap='round';let px=null,py=null;for(let k=12;k>=0;k--){const q=bombPos(s,Math.max(.12,t-k*.022));if(px!=null){ctx.globalAlpha=.55*(1-k/12);ctx.strokeStyle=V1;ctx.lineWidth=(3+5*(1-k/12))*Z;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(q.x,q.y);ctx.stroke();}px=q.x;py=q.y;}ctx.restore();
    ctx.save();ctx.translate(p.x,p.y);ctx.scale(Z,Z);ctx.rotate(t*9);ctx.fillStyle='#1a0e26';ctx.strokeStyle=VL;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,10,0,6.283);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(180,138,232,.5)';ctx.beginPath();ctx.arc(-3,-3,3.5,0,6.283);ctx.fill();
    ctx.fillStyle='#4a2470';ctx.fillRect(-3,-14,6,5);ctx.strokeStyle='#8a6440';ctx.beginPath();ctx.moveTo(0,-14);ctx.quadraticCurveTo(5,-20,2,-23);ctx.stroke();ctx.globalCompositeOperation='lighter';ctx.drawImage(glow(GRN),-6,-31,16,16);ctx.restore();}}
function drawCloud(s,t,front){if(!s.puffs.length)return;const off=D4_ON+s.dur,a=1-seg(t,off,off+.5);if(a<=0)return;const R_=s.r,gy=feetY(s.y);
  if(!front){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a*.4*(.85+.15*Math.sin(t*2));ctx.translate(s.x,gy);ctx.scale(1,.5);ctx.drawImage(glow(GRN),-R_*1.1,-R_*1.1,R_*2.2,R_*2.2);
    const g=ease(seg(t,D4_ON,D4_ON+.4));ctx.strokeStyle=GRN;ctx.shadowColor=GRN;ctx.shadowBlur=10;ctx.lineWidth=3;ctx.globalAlpha=a*.55*g;ctx.beginPath();for(let k=0;k<=48;k++){const an=k/48*6.283,rr=R_*g*(1+.04*Math.sin(an*5+t*2.2));k?ctx.lineTo(Math.cos(an)*rr,Math.sin(an)*rr):ctx.moveTo(rr,0);}ctx.stroke();ctx.restore();
    ctx.save();ctx.globalAlpha=a*.75*ease(seg(t,D4_ON,D4_ON+.4));ctx.translate(s.x,gy-R_*.28*.5);ctx.scale(1,.62*.6);const cg=ctx.createRadialGradient(0,0,0,0,0,R_*.62);cg.addColorStop(0,'rgba(14,6,24,.9)');cg.addColorStop(.6,'rgba(28,12,46,.55)');cg.addColorStop(1,'rgba(36,18,58,0)');ctx.fillStyle=cg;ctx.beginPath();ctx.arc(0,0,R_*.62,0,6.283);ctx.fill();ctx.restore();}
  const list=s.puffs.map(p=>puffXY(s,p,t)).map((q,i)=>Object.assign(q,{i})).filter(q=>front?q.y>=gy-30*Z:q.y<gy-30*Z).sort((p,q)=>p.y-q.y);
  for(const q of list){ctx.globalAlpha=a*(front?.6:.9);ctx.drawImage(q.i%3?SMK:SMK_D,q.x-q.s,q.y-q.s*.8,q.s*2,q.s*1.6);ctx.globalAlpha=a*.3;ctx.drawImage(SMK_H,q.x-q.s*.8,q.y-q.s*.95,q.s*1.3,q.s*.8);}
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=GRN;ctx.lineWidth=2*Z;ctx.lineCap='round';for(let i=0;i<4;i++){const an=t*(.8+i*.15)+i*1.6,r=R_*(.3+.12*i);ctx.globalAlpha=a*.55*(.6+.4*Math.sin(t*3+i));ctx.beginPath();ctx.ellipse(s.x,gy-(30+i*6)*Z,r,r*.32,0,an,an+1.3);ctx.stroke();}ctx.restore();ctx.globalAlpha=1;}
function blindSwirl(s,t){const off=D4_ON+s.dur;if(t<D4_ON+.3||t>off+.2)return;const a=seg(t,D4_ON+.3,D4_ON+.5)*(1-seg(t,off,off+.2));ctx.save();ctx.globalAlpha=a;ctx.strokeStyle='#1a0c28';ctx.lineWidth=2*Z;
  for(const e of enemies){if(!liveE(e)||Math.hypot(e.x-s.x,e.y-s.y)>s.r)continue;const y=e.y-(e.sz||16)*1.5;for(const sx of [-4,4]){ctx.beginPath();for(let k=0;k<14;k++){const an=k*.6+t*8,r=k*.35*Z;ctx.lineTo(e.x+sx*Z+Math.cos(an)*r,y+Math.sin(an)*r);}ctx.stroke();}}ctx.restore();}
function drawUltClones(s,t){for(const c of (s.cl||[])){const age=t-c.born;if(age<0)continue;const rise=ease(seg(age,0,.35)),out=seg(t,3.0,3.25);if(out>=1)continue;
    pool(c.x,feetY(c.y),26*Z,seg(age,0,.15)*(1-out)*.85*(c.mv?.5:1));
    cloneDraw(c.x,c.y,c.d,(1-out)*(c.mv?.6:1),{i:c.mv?1+37:1+30,clipH:rise*heroH()*1.3});
    if(c.mv){const u=(t-c.mv.t0)/.12;for(let k=1;k<4;k++){const uu=Math.max(0,ease(u)-k*.12);cloneDraw(lerp(c.mv.x0,c.mv.x1,uu),lerp(c.mv.y0,c.mv.y1,uu),c.d,.25,{kind:'ghost'});}}}}
function drawGround(){const now=clk();try{aimDraw();}catch(_){}
  for(const s of curScenes()){const t=now-s.t0;if(s.k==='smoke'&&s.puffs){drawCloud(s,t,false);}}}
function drawOver(){const now=clk();
  for(const s of curScenes()){const t=now-s.t0;
    if(s.k==='smoke'&&s.puffs){drawCloud(s,t,true);blindSwirl(s,t);}
    else if(s.k==='smoke')drawSmokeBomb(s,t);
    else if(s.k==='blades')drawBlades(s,t);
    else if(s.k==='storm')drawStormClones(s,t);
    else if(s.k==='ult')drawUltClones(s,t);}
  // the thrown bomb belongs to the cast, the cloud to the scene
  drawP();
  // ultimate: the scene darkens (screen space)
  if(R.night){const t=now-R.night.t0,dk=.5*ease(seg(t,.1,.8))*(1-seg(t,3.4,4.4));if(dk>0){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.fillStyle='rgba(18,8,32,'+dk.toFixed(3)+')';ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.restore();}}}
if(typeof drawRaidTele==='function'){const o=drawRaidTele;drawRaidTele=function(){const r=o.apply(this,arguments);try{if(R.public&&(dgEq()||SCN.length))drawGround();}catch(e){R.err='ground '+e.message;}return r;};}else R.err='no ground hook';
{const o=drawParts;drawParts=function(){const r=o.apply(this,arguments);try{if(R.public&&(dgEq()||SCN.length||PL.length))drawOver();}catch(e){R.err='draw '+e.message;}return r;};}
/* ================= weapon skill window: the dagger line ================= */
const DESC={
  shadow:c=>'🗡 ย่อตัว แล้วพุ่งทะลุเป้าไกลสุด '+c.dash+' px ไปโผล่ข้างหลัง ฟันกากบาท '+pct(c.mul)+'% คริแน่นอน\nโดน '+c.n+' ตัวตามแนวพุ่ง · ไม่โดนตีตอนพุ่ง',
  blades:c=>'🧪 กริช '+c.n+' เล่มพุ่งออกเป็นพัดแล้ววกกลับเข้ามือ ไกล '+c.reach+' px\nขาไป '+pct(c.mul)+'% + ขากลับ '+pct(c.mul)+'% ต่อมอน (ไม่เกิน 2 ครั้ง) · ติดพิษครั้งละ 1 ชั้น',
  storm:c=>'🌀 พุ่งเข้าหาเป้า (ระยะ '+c.range+' px) แล้วหายตัว เงา '+c.n+' ตัวพุ่งทะลุทีละตัว ตัวละ '+pct(c.mul)+'%\nรวม '+pct(c.mul*c.n)+'% เป้าเดียว · ไม่โดนตีตอนหายตัว · โผล่ข้างหลังมอน',
  smoke:c=>'💣 โยนระเบิดควัน (ระยะ '+c.range+' px) วงรัศมี '+c.r+' px นาน '+c.dur+' วิ\nทุก '+c.tick+' วิ ดาเมจ '+pct(c.mul)+'% + พิษ 1 ชั้น ('+c.ticks+' ครั้ง) · มอนในควันตีพลาด '+pct(c.blind)+'% · เรายืนในควันหลบ +'+c.dodge,
  ult:c=>'🌑 จมลงในเงา เงา 7 ร่างล้อมวงรัศมี '+c.r+' px ฟันไขว้ '+c.cuts+' ครั้ง รวม '+pct(c.shad)+'%\nแล้วโผล่หลังเป้า ฟันปิดฉาก '+pct(c.fin)+'% คริแน่นอน · โดนทุกตัวในวง · ไม่โดนตี '+c.inv+' วิแรก',
  cloak:c=>'🌫 หายตัว '+c.dur+' วิ มอนเลิกไล่ (ยกเว้นบอส)\nตีครั้งถัดไปคริแน่นอน +'+pct(c.bonus)+'%'+(c.spd?' · เดินเร็ว +'+pct(c.spd)+'%':''),
  coat:c=>'🧪 '+c.dur+' วิ: ตีปกติติดพิษ 1 ชั้น = '+pct(c.pct)+'% ของครั้งนั้นต่อวิ 5 วิ\nซ้อนได้ '+c.max+' ชั้น (พิษจากสกิลก็ใช้ค่านี้ระหว่างบัฟ)',
  step:c=>'👣 '+c.dur+' วิ: เดินเร็ว +'+pct(c.spd)+'% · หลบ +'+c.dodge+' จุด\nหลบรวมไม่เกิน '+pct(CFG.dodgeCap)+'%',
  focus:c=>'👁 '+c.dur+' วิ: ดาเมจคริ +'+pct(c.cdmg)+'%'+(c.crit?' · โอกาสคริ +'+c.crit+' จุด':''),
  body:c=>'👥 '+c.dur+' วิ: เงาร่างแยกเดินตามหลัง ทำท่าตามตัวละคร\nทุกการโจมตีโดน 2 ครั้ง (ครั้งละ 100%) และมีโอกาส '+pct(c.x3)+'% เป็น 3 ครั้ง',
  weak:c=>'🎯 โอกาสคริ +'+c.crit+' จุด'+(c.cdmg?' · ดาเมจคริ +'+pct(c.cdmg)+'%':''),
  deep:c=>'☠ พิษนานขึ้น +'+pct(c.dur)+'% · ซ้อนได้ +'+c.stk+' ชั้น'+(c.pow?' · พิษแรง +'+pct(c.pow)+'%':''),
  prey:c=>'🩸 แรงขึ้น +'+pct(c.dmg)+'% กับมอนที่ HP ต่ำกว่า '+pct(c.hp)+'% หรือติดพิษ',
  sdodge:c=>'💨 หลบ +'+c.dodge+' จุด'+(c.heal?' · หลบได้แล้วฟื้น HP '+pct(c.heal)+'%':''),
  twin:c=>'⚔ ตีปกติโดน มีโอกาส '+pct(c.chance)+'% มือซ้ายแทงซ้ำ '+pct(c.mul)+'%'};
const ICON=k=>{const c=CFG[k];return c&&A.icons[c.ic]?A.icons[c.ic]:null;};
const WNOTE='\n\nกริชคู่: ตีปกติ 2.2 เท่าของพลังโจมตี เร็ว 2 ครั้ง/วิ ระยะ 60 px · คริ +10 · HP ×0.85 · DEF ×0.80\nท่าทางยังเป็นท่าชั่วคราว (รอท่า 3D ของกริช)';
function mkSkill(k){const c=CFG[k],act=ACT.includes(k)||BUF.includes(k);
  return {k:'dg_'+k,bk:k,name:c.name,type:act?'active':'passive',key:c.key||'',row:c.row,ok:()=>R.public,icon:()=>ICON(k),desc:()=>DESC[k](c)+(k==='shadow'?WNOTE:''),
    cost:act?()=>({mp:c.mp,cd:c.cd}):undefined,cdId:c.id,start:act?()=>cast(k):undefined};}
const SKB={};for(const k of [...ACT,...BUF,...PAS])SKB[k]=mkSkill(k);
W.lines.dagger={title:'ทักษะสายกริชคู่',cols:[{name:'โจมตี',skills:ACT.map(k=>SKB[k])},{name:'บัฟ / สนับสนุน',skills:BUF.map(k=>SKB[k])},{name:'พาสซีฟ',skills:PAS.map(k=>SKB[k])}]};
R.skills=SKB;
try{const dm=document.getElementById('wskDm');if(dm)new MutationObserver(()=>{if(dgEq()&&/ตอนถือดาบ/.test(dm.textContent))dm.textContent=dm.textContent.replace('ตอนถือดาบ','ตอนถือกริชคู่');}).observe(dm,{childList:true,characterData:true,subtree:true});}catch(_){}
try{const wn=document.getElementById('wWpnSk');if(wn){const fixIc=()=>{if(!dgEq())return;for(const el of wn.querySelectorAll('.row[data-k^="dg_"] .ic.sk'))el.classList.remove('sk');const d=wn.querySelector('#wskDIc.sk');if(d)d.classList.remove('sk');};
  new MutationObserver(fixIc).observe(wn,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});}}catch(e){R.err='icons '+e.message;}
/* ---------------- keys while the daggers are held: J U B N R attacks 1–5, O Y buffs 1–2 ---------------- */
const KEYMAP={};for(const k of [...ACT,...BUF])if(CFG[k].key)KEYMAP[CFG[k].key.toLowerCase()]=k;
addEventListener('keydown',e=>{try{if(!R.public||!dgEq()||e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;if(W.open||G.win||G.state!=='play'||(typeof ED!=='undefined'&&ED.on))return;
  const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;
  const k=KEYMAP[(e.key||'').toLowerCase()];if(!k)return;e.stopImmediatePropagation();e.preventDefault();cast(k);}catch(er){R.err='key '+er.message;}},true);
/* ---------------- skill slots while the daggers are held (own map, same bar as the other weapons) ---------------- */
const SLOT_K=['1','2','3','4','5','6','q','e','r','f'];
const SS=R.slots={map:{},assign:null};
try{SS.map=JSON.parse(localStorage.getItem('lanternfall_daggerSlots_v1')||'{}')||{};}catch(e){SS.map={};}
for(const i in SS.map)if(!SKB[SS.map[i]]||SKB[SS.map[i]].type!=='active'||+i<0||+i>9||(SLOT_K[+i]==='r'&&SS.map[i]!=='ult'))delete SS.map[i];
const SLDEF={0:'shadow',1:'blades',2:'storm',3:'smoke',8:'ult',4:'cloak',5:'coat',6:'step',7:'focus',9:'body'};
if(!Object.keys(SS.map).length)Object.assign(SS.map,SLDEF);   // default layout in memory only (written only when the player moves a skill)
SS.save=()=>{try{localStorage.setItem('lanternfall_daggerSlots_v1',JSON.stringify(SS.map));}catch(e){}};
SS.find=k=>{for(const i in SS.map)if(SS.map[i]===k)return +i;return -1;};
let msgEl=null;function say(t,ms){msgEl=msgEl||document.getElementById('wsAssignMsg');if(!msgEl)return;msgEl.textContent=t;msgEl.style.display='block';clearTimeout(say.t);if(ms)say.t=setTimeout(()=>{msgEl.style.display='none';},ms);}
SS.start=k=>{SS.assign=k;document.body.classList.add('wsAssign');document.body.classList.toggle('wsAsNoR',k!=='ult');say('แตะช่องสกิลที่ต้องการวาง "'+CFG[k].name+'" · แตะนอกช่องเพื่อยกเลิก',0);};
SS.stop=()=>{SS.assign=null;document.body.classList.remove('wsAssign','wsAsNoR');if(msgEl)msgEl.style.display='none';};
SS.set=(i,k)=>{if(SLOT_K[i]==='r'&&k!=='ult'){say('ช่อง R สงวนไว้ให้ "'+CFG.ult.name+'" (คีย์ R) เลือกช่องอื่นสำหรับ "'+CFG[k].name+'"',3200);return false;}
  const o=SS.find(k);if(o>=0)delete SS.map[o];SS.map[i]=k;SS.save();repaint(true);return true;};
SS.clear=i=>{delete SS.map[i];SS.save();repaint(true);};
try{const win=document.getElementById('wWpnSk');if(win)win.addEventListener('click',e=>{if(!dgEq()||!e.target.closest('#wskAs'))return;
  const sel=win.querySelector('.row.sel');const kk=sel&&sel.dataset.k;const s=kk&&Object.values(SKB).find(x=>x.k===kk);if(!s||s.type!=='active'||!unl(CFG[s.bk]))return;
  e.stopImmediatePropagation();e.preventDefault();try{if(G.win==='wWpnSk')closeWin();}catch(_){}SS.start(s.bk);},true);}catch(e){R.err='assign '+e.message;}
setInterval(()=>{try{const as=document.getElementById('wskAs');if(!as||!dgEq()||!W.open)return;const sel=document.querySelector('#wWpnSk .row.sel');const kk=sel&&sel.dataset.k;const s=kk&&Object.values(SKB).find(x=>x.k===kk);
  if(s&&s.type==='active'){const at=SS.find(s.bk),t=at>=0?'ช่อง '+SLOT_K[at].toUpperCase()+' · ย้าย':'ใส่ช่องสกิล';if(as.textContent!==t)as.textContent=t;}}catch(_){}},250);
const slotEl=e=>e.target&&e.target.closest&&e.target.closest('#bar .slot[data-i]:not(.pot),#tSkills .tsk[data-ti]');
const slIdx=el=>+(el.dataset.i!==undefined?el.dataset.i:el.dataset.ti);
for(const ev of ['pointerdown','click','contextmenu'])addEventListener(ev,e=>{try{
  if(SS.assign){if(ev==='contextmenu')return;e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();if(ev==='pointerdown')return;const el=slotEl(e);if(el){if(SS.set(slIdx(el),SS.assign))SS.stop();}else SS.stop();return;}
  const el=slotEl(e);if(!el||!el.dataset.dgs||!dgEq())return;
  if(ev==='contextmenu'){e.preventDefault();e.stopImmediatePropagation();SS.clear(slIdx(el));return;}
  e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();
  if(ev==='pointerdown'){if(!aimStart(el.dataset.dgs,e,el))cast(el.dataset.dgs);if(el.classList.contains('tsk')){el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),350);}}
}catch(er){R.err='slot '+er.message;}},true);
addEventListener('keydown',e=>{try{if(e.key==='Escape'&&SS.assign){SS.stop();return;}
  if(!R.public||!dgEq()||W.open||G.win||G.state!=='play'||e.repeat)return;const k=(e.key||'').toLowerCase(),i=SLOT_K.indexOf(k);if(i<0||k==='r')return;const sk=SS.map[i];if(!sk)return;
  if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))return;e.stopImmediatePropagation();e.preventDefault();cast(sk);}catch(er){R.err='slot key '+er.message;}},true);
function paint(el,k){if(el.dataset.dgs===k)return;const im=ICON(k),ki=el.querySelector('kbd'),kt=ki?ki.textContent:'';
  el.innerHTML='<img alt="'+CFG[k].name+'" src="'+im+'"><div class="cd"></div><div class="cdt"></div>'+(kt?'<kbd>'+kt+'</kbd>':'');
  el.classList.add('wsk');el.dataset.dgs=k;delete el.dataset.ws;delete el.dataset.bs;delete el.dataset.ss;if(el.classList.contains('tsk'))el.setAttribute('data-sk','dgs:'+k);else el.removeAttribute('data-sk');el.removeAttribute('draggable');el.title=CFG[k].name;}
let wasDg=false,sig='';
function repaint(force){const on=R.public&&dgEq();
  if(!on){if(wasDg){wasDg=false;sig='';for(const el of document.querySelectorAll('[data-dgs]')){delete el.dataset.dgs;el.classList.remove('wsk');}try{buildBar();}catch(_){}try{if(typeof buildTouchSkills==='function')buildTouchSkills();}catch(_){}}return;}
  const s=JSON.stringify(SS.map);if(force||!wasDg||s!==sig){wasDg=true;sig=s;try{buildBar();}catch(_){}try{if(typeof buildTouchSkills==='function')buildTouchSkills();}catch(_){}}
  for(const el of document.querySelectorAll('#bar .slot[data-i],#tSkills .tsk[data-ti]')){const i=slIdx(el),k=SS.map[i];if(k&&CFG[k])paint(el,k);}}
function paintAll(){try{if(R.public&&dgEq())for(const el of document.querySelectorAll('#bar .slot[data-i],#tSkills .tsk[data-ti]')){const k=SS.map[slIdx(el)];if(k&&CFG[k])paint(el,k);}}catch(_){}}
try{const _bb=buildBar;buildBar=function(){const r=_bb.apply(this,arguments);paintAll();return r;};}catch(e){R.err='bar hook '+e.message;}
try{const _bt=buildTouchSkills;buildTouchSkills=function(){const r=_bt.apply(this,arguments);paintAll();return r;};}catch(e){R.err='touch hook '+e.message;}
setInterval(()=>{try{if(SS.assign&&(G.win||G.state!=='play'))SS.stop();repaint(false);if(!(R.public&&dgEq()))return;
  for(const el of document.querySelectorAll('.slot.wsk[data-dgs],.tsk.wsk[data-dgs]')){const k=el.dataset.dgs,c=CFG[k],ok=unl(c);el.classList.toggle('wsoff',!ok);const cd=(P.cds&&P.cds[c.id])||0,cdE=el.querySelector('.cd'),tE=el.querySelector('.cdt');
    if(cdE)cdE.style.setProperty('--cd',ok&&cd>0?Math.min(1,cd/c.cd):0);if(tE)tE.textContent=ok&&cd>0?(cd>=10?String(Math.ceil(cd)):cd.toFixed(1)):'';el.classList.toggle('nomp',P.mp<c.mp);el.classList.toggle('wson',!!(BUFS[k]||(S&&S.k===k)));}
}catch(e){R.err='slot tick '+e.message;}},120);
/* ---------------- press-and-drag aim (same as the staff): range circle + where the skill lands; tap = auto target ---------------- */
const AIMON=!/skaim=off/.test(Q),AIMK={shadow:1,blades:1,storm:1,smoke:1,ult:1},AIMPX=110,AIMTAP=14;
const AIM=R.aim={on:null,stats:{aimed:0,tap:0,cancel:0}};
function aimRange(k){const c=CFG[k];return k==='shadow'?c.dash:k==='blades'?c.reach:c.range;}
function aimCur(A_){const k=A_.k,rg=aimRange(k),area=k==='smoke'||k==='ult'||k==='storm',dx=A_.mx-A_.sx,dy=A_.my-A_.sy,dl=Math.hypot(dx,dy);
  if(dl>=AIMTAP){const y=yaw(),cs=Math.cos(-y),sn=Math.sin(-y),wx=(dx*cs-dy*sn)/dl,wy=(dx*sn+dy*cs)/dl,f=area?Math.min(1,dl/AIMPX):1;return {x:P.x+wx*rg*f,y:P.y+wy*rg*f,ang:Math.atan2(wy,wx),drag:true};}
  const a=aimAt(rg);let x=a.pt.x-P.x,y=a.pt.y-P.y;const d=Math.hypot(x,y)||1;const f=area?Math.min(1,rg/d):rg/d;return {x:P.x+x*f,y:P.y+y*f,ang:a.ang,drag:false};}
function aimStart(k,ev,el){if(!AIMON||!AIMK[k]||!R.public||!dgEq())return false;const c=CFG[k];
  if(!unl(c)||(P.cds&&P.cds[c.id]>0)||P.mp<c.mp||S||P.dead)return false;
  AIM.on={k,pid:ev.pointerId,sx:ev.clientX,sy:ev.clientY,mx:ev.clientX,my:ev.clientY,el,t0:clk(),maxd:0};document.body.classList.add('stfAiming');return true;}
function aimEnd(ev,cancel){const A_=AIM.on;if(!A_)return;AIM.on=null;document.body.classList.remove('stfAiming');if(cancel){AIM.stats.cancel++;return;}
  const q=aimCur(A_);const back=A_.maxd>=AIMTAP&&A_.el&&(()=>{const r=A_.el.getBoundingClientRect();return ev.clientX>=r.left&&ev.clientX<=r.right&&ev.clientY>=r.top&&ev.clientY<=r.bottom;})();
  if(back){AIM.stats.cancel++;try{textAt(P.x,P.y-62,CFG[A_.k].name+': ยกเลิก','#d9c4ff',13);}catch(_){}return;}
  if(q.drag){AIM.stats.aimed++;R.aimOv={x:q.x,y:q.y};try{cast(A_.k);}finally{R.aimOv=null;}}else{AIM.stats.tap++;cast(A_.k);}}
addEventListener('pointermove',e=>{const A_=AIM.on;if(!A_||e.pointerId!==A_.pid)return;A_.mx=e.clientX;A_.my=e.clientY;A_.maxd=Math.max(A_.maxd,Math.hypot(A_.mx-A_.sx,A_.my-A_.sy));e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();},true);
for(const t of ['pointerup','pointercancel'])addEventListener(t,e=>{const A_=AIM.on;if(!A_||e.pointerId!==A_.pid)return;e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();aimEnd(e,t==='pointercancel'||G.state!=='play'||!dgEq());},true);
addEventListener('keydown',e=>{if(AIM.on&&e.key==='Escape'){aimEnd(e,true);e.stopImmediatePropagation();}},true);
function aimDraw(){const A_=AIM.on;if(!A_)return;if(P.dead||!dgEq()){AIM.on=null;document.body.classList.remove('stfAiming');return;}
  const k=A_.k,c=CFG[k],rg=aimRange(k),q=aimCur(A_),pu=.85+.15*Math.sin(clk()*8);ctx.save();
  ctx.fillStyle='rgba(122,79,176,.10)';ctx.strokeStyle='rgba(217,196,255,.55)';ctx.lineWidth=2;ctx.setLineDash([10,7]);ctx.beginPath();ctx.arc(P.x,P.y,rg,0,6.283);ctx.fill();ctx.stroke();ctx.setLineDash([]);
  if(k==='shadow'||k==='blades'){const w=k==='shadow'?52:90,L=rg;ctx.translate(P.x,P.y);ctx.rotate(q.ang);ctx.fillStyle='rgba(156,255,60,'+(.18*pu).toFixed(3)+')';ctx.strokeStyle='rgba(156,255,60,.85)';ctx.lineWidth=2;ctx.beginPath();ctx.rect(14,-w/2,L-14,w);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(L+14,0);ctx.lineTo(L-6,-w/2-8);ctx.lineTo(L-6,w/2+8);ctx.closePath();ctx.fillStyle='rgba(156,255,60,.8)';ctx.fill();}
  else{const r=k==='smoke'?c.r:k==='ult'?c.r:36;ctx.beginPath();ctx.moveTo(P.x,P.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle='rgba(217,196,255,.5)';ctx.lineWidth=2;ctx.stroke();
    ctx.beginPath();ctx.arc(q.x,q.y,r,0,6.283);ctx.fillStyle='rgba(156,255,60,'+(.16*pu).toFixed(3)+')';ctx.fill();ctx.strokeStyle='rgba(156,255,60,.9)';ctx.lineWidth=3;ctx.stroke();
    if(k==='storm'){const e=nearestE(q.x,q.y,80);if(e){ctx.beginPath();ctx.arc(e.x,e.y,(e.sz||16)+10,0,6.283);ctx.strokeStyle='#eaffc8';ctx.lineWidth=2.5;ctx.stroke();}}}
  ctx.restore();}
/* ---------------- sword ↔ twin daggers switch (inventory + the game's equipItem). The daggers take the sword's attack value (balance model) ---------------- */
R.testDagger=function(){let i=P.inv.findIndex(it=>it&&it.kind==='wpn'&&it.t==='dagger'&&it.dg2);
  if(i<0){const w=P.weapon&&P.weapon.t!=='fist'?P.weapon:null,lvl=(w&&w.lvl)||P.lvl||1,rar=(w&&w.rar)||0;const it=makeWeapon('dagger',lvl,rar),ref=makeWeapon('sword',lvl,rar);it.atk=ref.atk;it.name='กริชคู่ Night Fang';it.dg2=1;P.inv.push(it);i=P.inv.length-1;log('dagger item',{lvl,atk:it.atk});}
  return i;};
R.toggle=function(){try{if(!P||P.dead)return;
  if(dgEq()){const i=P.inv.findIndex(it=>it&&it.kind==='wpn'&&it.t==='sword'&&(!R.swordUid||it.uid===R.swordUid));const j=i>=0?i:P.inv.findIndex(it=>it&&it.kind==='wpn'&&it.t==='sword');
    if(j<0){textAt(P.x,P.y-62,'ไม่พบดาบในกระเป๋า','#d9c4ff',13);return;}equipItem(j);}
  else{if(P.weapon&&P.weapon.t==='sword')R.swordUid=P.weapon.uid;equipItem(R.testDagger());}
  S=null;POSE=null;BA=null;R.heroA=1;log('switch',{to:P.weapon&&P.weapon.t});try{recalc();}catch(e){}}catch(e){R.err='toggle '+e.message;}};
{const css=document.createElement('style');css.id='p300';css.textContent='#dgrBtn{position:fixed;left:14px;top:calc(348px + env(safe-area-inset-top,0px));z-index:57;min-width:44px;min-height:40px;padding:4px 10px;border-radius:12px;border:1px solid rgba(156,255,60,.55);background:rgba(26,12,40,.88);color:#e6ffd0;font:700 13px sans-serif}';document.head.appendChild(css);}
let tbtn=null;setInterval(()=>{try{const play=R.public&&G.state==='play'&&!G.win&&!(typeof ED!=='undefined'&&ED.on);if(!play){if(tbtn)tbtn.style.display='none';return;}
  if(!tbtn){tbtn=document.createElement('button');tbtn.id='dgrBtn';tbtn.type='button';for(const ev of ['pointerdown','pointerup','mousedown','touchstart'])tbtn.addEventListener(ev,e=>e.stopPropagation());
    tbtn.addEventListener('click',e=>{e.stopPropagation();R.toggle();});document.body.appendChild(tbtn);}
  const narrow=innerHeight<520;tbtn.style.top=narrow?'calc(152px + env(safe-area-inset-top,0px))':'calc(348px + env(safe-area-inset-top,0px))';tbtn.style.left=narrow?'54px':'14px';
  tbtn.style.display='';const t=dgEq()?'⚔ สลับเป็นดาบ':'🗡 สลับเป็นกริชคู่';if(tbtn.textContent!==t)tbtn.textContent=t;}catch(_){}},400);
/* ---------------- public together with the sword skills (p240 public mode); the p298 skill points get the dagger levels ---------------- */
const pv=setInterval(()=>{if(W.public){R.public=true;clearInterval(pv);try{if(window.__SKUP&&__SKUP.sync)__SKUP.sync(true);}catch(_){}try{recalc();}catch(_){}}},300);
R.ok=true;
}catch(e){R.err='init '+e.message;R.stack=String(e.stack).slice(0,600);}
})();

