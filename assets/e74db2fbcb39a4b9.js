
/* ---- guardian18-r2 (TEST, 8 Nov 2026; r1 look + art textures C1-C4, ?g18art=off = code-drawn r1 look): special skill #3 "ผู้พิทักษ์ 18 กร" Guardian of 18 Arms (ORDER_20261108_special-guardian18; look passed by DeaRz at demo r19) ----
   Code-drawn visuals ported AS IS from approved/vfx/guardian18_r19/skill.js (weapons, body, arms, rune circle, plunge streaks, cracks, dissolve); no art textures yet.
   Same special-skill pattern as Sakura Blade (key 7) / Demon Domain (key 8): one round button + key 9, listed in the "สกิลพิเศษ" page of the skill window (SPSK),
   learned by the existing rule player Lv >= MINLV (NPC teaching does not exist yet; ?guardian18lv=off lifts the gate for testing). Cooldown id spGuardian.
   Behaviour: V7 rune circle r~215 on the hero; a STATIC gold giant (one cached body sprite) rises behind the hero; 18 arms; 32 hits 0.11 s apart (weapon glows 0.2 s, shoots up
   0.08 s, plunges 0.12 s onto the ground r90-195 around the hero; hits 1-18 every weapon once, 19-32 reuse arms 1-14); per landing ring / dust / rocks / sparks / crack, shake 3.5 px;
   foes near the landing flinch; the giant dissolves upward at ~7.0 s. DAMAGE: every landing = 1 hit on EVERY monster inside the ring (max 10 nearest), 30 % of one basic attack of
   the held weapon each, own number per hit, display cap 99,999, neutral element, no stun, no knockback (also for bosses). The hero can move, attack and use other skills.
   ALL NUMBERS are in ONE table: window.GUARDIAN18.cfg (DeaRz has NOT confirmed the Balance numbers). Off: ?guardian18=off. Low: ?guardian18low=on (skips outer ring + flames, fewer particles).
   Phone: DPR capped at 1.25 while it runs, particles < 120. Debug: window.GUARDIAN18 (cast(force), list, stats). ---- */
(function(){'use strict';const Q=String(location.search);
const G18=window.GUARDIAN18={ver:'guardian18-r3',art:false,on:!/[?&]guardian18=off\b/.test(Q),ok:false,err:null,list:[],
  cfg:{   /* ---- THE ONE EDITABLE TABLE ---- */
    NS:32,            /* hits per cast */
    HIT_DT:.11,       /* s between hits */
    MUL:.30,          /* damage per hit = this x one basic attack of the held weapon (C182 actionCoef) */
    CD:60,MP:60,      /* cooldown s, MP */
    MINLV:/guardian18lv=off/.test(Q)?0:40,   /* player level gate (Balance pick; NPC learning not built) */
    HIT_MODE:/[?&]g18range=screen/.test(Q)?'screen':'circle',   /* 'circle' (default) = monsters inside HIT_RADIUS around the hero; 'screen' = every live monster on screen, no range check (?g18range=screen) */
    HIT_RADIUS:195,   /* circle mode: damage ring radius px (ground plane), follows the hero */
    MAX_TARGETS:0,    /* max monsters hit per landing (nearest first). 0 = UNLIMITED (default, DeaRz): every monster inside the ring takes every hit. Set e.g. 10 for a cap */
    MAX_FLOAT_NUMBERS:120, /* max damage numbers floating on screen at once; older ones are dropped (display only, ALL damage is always applied) */
    LS_FIRST:1,LS_OTHER:.5,LS_CAP_PCT:.08,   /* lifesteal (only if the player has lifesteal): full on the first target of a landing, x0.5 on the others, total cap 8 % max HP per second (Balance v1.1, not confirmed by DeaRz) */
    CAP:99999,        /* display cap per number (after the game's level compression, as Night Harvest) */
    RUNE_R:215,       /* rune circle radius px */
    LAND_R0:.42,LAND_R1:.92,   /* landing radius = this x 215 x .92 (about r90-195) */
    SCREEN_SHAKE:0,      /* screen shake per landing in px (was 3.5 in r1/r2). 0 = OFF (DeaRz: nothing may shake). Arms, fists, shoulders, weapons and the giant never shake (no jitter code) */
    FLINCH_R:105,
    PARTS:120,        /* particle cap (low x .6) */
    K:.55,            /* ground plane flatten, as Demon Domain / Sakura Blade */
    GLOW:.2,UP:.08,FALL:.12,   /* per weapon: glow, shoot up, plunge (s) */
    T:{RING:.25,RISE0:.55,RISE1:1.9,UNF0:1.6,UNF1:2.5,T0:2.55,TD0:7.0,TD1:8.4,END:8.8},
    low:/guardian18low=on/.test(Q),key:'9',
    /* ---- art sizes (VFX demo v22, DeaRz-approved: fist 60 too big / 40 too small / 50 ok; weapons -26 %). All as a share of the BODY width ---- */
    BODY_W:303,         /* body width in demo px (canvas 900x640, GS .84) */
    FIST_W:.165,        /* fist width = this x BODY_W (50 px) */
    ARM_T:34,           /* arm thickness px */
    SH_X:[34,48],SH_Y:[-186,-136],   /* arm roots: x=GX+-SH_X*GS, y=GY+SH_Y*GS, 9 per side, top to bottom */
    WEAP_LEN:.46,       /* every weapon length = this x BODY_W (140 px) */
    GRIP:.30,GRIP_W07:.12,GRIP_W16:.12,GRIP_W10:.50,   /* grip point, fraction of the length from the back/handle end */
    CROWN_MIN:.25,      /* the whole figure is scaled down until the crown top is at least this share of the screen height from the top (hero on screen centre) */
    CRACK_F0:1.2,CRACK_F1:2.6,   /* crack decal: fully visible until F0 s after the impact, gone at F1 s */
    SHOULDER_SCALE:1,   /* art: shoulder cap size multiplier (84 px) */
    ART_BODY_W:520},
  stats:{casts:0,refused:0,landings:0,hits:0,dmg:0,perLanding:[],numDropped:0,peakParts:0,drawMs:0,frames:0,maxMs:0}};
if(!G18.on)return;
try{
if(typeof hitEnemy!=='function'||typeof bb!=='function'||typeof drawRaidTele!=='function'||typeof drawParts!=='function'||typeof update!=='function'||!window.C182||!C182.api)throw new Error('game hooks missing');
const ART_ON=!/[?&]g18art=off\b/.test(Q);   /* default ON; ?g18art=off = the r1 code-drawn look */
const CF=G18.cfg,ID='spGuardian',KG=CF.K,KD=.5;   /* KG = game ground plane, KD = the demo's own flatten (arm / weapon screen offsets) */
const clk=()=>typeof time==='number'?time:performance.now()/1000;
const clamp=(v,a,b)=>v<a?a:v>b?b:v,ease=x=>1-Math.pow(1-clamp(x,0,1),3),seg=(t,a,b)=>clamp((t-a)/(b-a),0,1),rnd=(a,b)=>a+Math.random()*(b-a);
const lerp=(a,b,u)=>a+(b-a)*u,hash=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
const liveE=e=>!!(e&&!e.dead&&e.hp>0&&!e.sprGhost&&!e.dev&&!e.removed);
const TT=()=>{try{return camT();}catch(_){return .866;}},TH=()=>{try{return camY();}catch(_){return 0;}};
const up=(x,y,h)=>{const th=TH(),hh=h/TT();return [x-hh*Math.sin(th),y-hh*Math.cos(th)];};
const GCTX=new Function('return ctx');   /* the game's drawing context (global lexical binding) */
let ctx=null;                             /* local: the game ctx while drawing, or an offscreen sprite while caching (demo code swaps it) */
function mk(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c;}
const GL={};function glow(col){return GL[col]||(GL[col]=mk(64,64,g=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,col);r.addColorStop(.3,col+'bb');r.addColorStop(1,col+'00');g.fillStyle=r;g.fillRect(0,0,64,64)}))}
const DUST2=mk(64,64,g=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(214,190,150,.9)');r.addColorStop(.6,'rgba(190,165,125,.4)');r.addColorStop(1,'rgba(180,155,115,0)');g.fillStyle=r;g.fillRect(0,0,64,64)});
const GO='#f2c14e',GL2='#ffe9a8',GDk='#a8741a',GBR='#fff4cf',AMB='#ffb347';
const GX=450,GY=452,GS=.84;                       /* giant: base centre + scale (demo screen units = px) */
const C={x:450,y:486},CR=CF.RUNE_R;                /* demo hero anchor / rune radius */
const T_RING=CF.T.RING,T_RISE0=CF.T.RISE0,T_RISE1=CF.T.RISE1,T_UNF0=CF.T.UNF0,T_UNF1=CF.T.UNF1,T0=CF.T.T0,DT=CF.HIT_DT,NS=CF.NS,T_TD0=CF.T.TD0,T_TD1=CF.T.TD1,I_END=CF.T.END;
const K=KD,WS=.95,DROP=1.05;
const SH=[[-58,-188],[58,-188]];
let t=0;                                           /* time of the cast being drawn (the demo code reads this global) */
const low=()=>!!(CF.low||(typeof G!=='undefined'&&G&&G.gfx==='low'));
const Qn=()=>low()?.5:1;
/* ---------------- art textures (embedded WebP, baked small; ?g18art=off skips them) ----------------
   body C1, arm/fist/shoulder C2, weapons W01-W18 (C3, handle LEFT head RIGHT), ground decals C4. Each piece falls back to the r1 code-drawn shape until its image has loaded. */
const ARTSRC={"body":"assets/375b9ac0a6a8091e.webp","arm":"assets/6da02c6ca8df1e44.webp","fist":"assets/1a35b38b010284ec.webp","shoulder":"assets/3a9033c92c7034b5.webp","crack1":"assets/79e71ea782bee7a6.webp","crack2":"assets/0cc9a1d43e0410ab.webp","crack3":"assets/fc3bb9bdc4f9bdb6.webp","crack4":"assets/b1169c32bd009c99.webp","crack5":"assets/4e942bee8e16be98.webp","crack6":"assets/7f88dc0476088714.webp","crater":"assets/b64e4a1211367c03.webp","scorch":"assets/29a0b5f97d2e518f.webp","w1":"assets/98bed0a4b5ad9b6c.webp","w2":"assets/92e9cc84102e83de.webp","w3":"assets/7f58dfe11361c419.webp","w4":"assets/48bcdef594cca09f.webp","w5":"assets/13c9f6c2f0445f00.webp","w6":"assets/e2303e8f2d2f90b3.webp","w7":"assets/95c5e16537d7e5b7.webp","w8":"assets/2dc75399401e12dd.webp","w9":"assets/e48e9c5739c8d75d.webp","w10":"assets/c0ec40dafbf5e286.webp","w11":"assets/c33bf00a20553673.webp","w12":"assets/d9578d904fe0294a.webp","w13":"assets/89bfa2f39fd02aca.webp","w14":"assets/5b9efad071bbe020.webp","w15":"assets/cc3d931235b54fdf.webp","w16":"assets/1ef4e4e275c72177.webp","w17":"assets/3490cf0ad671fc2c.webp","w18":"assets/b4eef4f1bcac9585.webp"};
const AI={};if(ART_ON){for(const k in ARTSRC){const im=new Image();im.decoding='async';im.src=ARTSRC[k];AI[k]=im}}
const A=k=>{const im=AI[k];return im&&im.complete&&im.naturalWidth?im:null};
const artReady=()=>ART_ON&&!!A('body')&&!!A('arm')&&!!A('fist')&&WNAMES.every(n=>A(n));
const WNAMES=['w1','w2','w3','w4','w5','w6','w7','w8','w9','w10','w11','w12','w13','w14','w15','w16','w17','w18'];
/* weapon: display long side L px, grip point = fraction GF of the length from the handle end (chakram has no handle: grip at the ring edge) */
const wartOf=i=>[CF.WEAP_LEN*CF.BODY_W,i===6?CF.GRIP_W07:i===15?CF.GRIP_W16:i===9?CF.GRIP_W10:CF.GRIP];
const wlenOf=i=>{if(!ART_ON)return(190-80)*.95;const w=wartOf(i);return w[0]*(1-w[1])};   /* grip -> head distance: the weapon head lands exactly on the target point */
let SCV=1;   /* global figure scale (crown clearance), see crownScale() */
function drawWeapArt(i,ang){const im=A(WNAMES[i]);if(!im)return false;const [L,gf]=wartOf(i),w=L,h=L*im.naturalHeight/im.naturalWidth;
  ctx.save();ctx.rotate(ang);if(Math.cos(ang)<0)ctx.scale(1,-1);ctx.drawImage(im,-gf*w,-h/2,w,h);ctx.restore();return true}
const STEEL=g=>{const q=g.createLinearGradient(0,-12,0,12);q.addColorStop(0,'#fffbe8');q.addColorStop(.5,'#f2d98a');q.addColorStop(1,'#b98a2a');return q};
function wsprite(fn){return mk(230,112,g=>{g.translate(30,56);g.lineJoin='round';g.lineCap='round';g.strokeStyle='#5a3a10';g.lineWidth=2.2;fn(g)})}
const shaft=(g,x0,x1,w)=>{g.save();g.lineCap='butt';g.strokeStyle='#4a2c0c';g.lineWidth=w+2.5;g.beginPath();g.moveTo(x0,0);g.lineTo(x1,0);g.stroke();g.strokeStyle='#a8741a';g.lineWidth=w;g.stroke();g.strokeStyle='#e6b858';g.lineWidth=w*.3;g.beginPath();g.moveTo(x0,-w*.2);g.lineTo(x1,-w*.2);g.stroke();g.restore()};
const fillS=(g,f)=>{g.fillStyle=STEEL(g);g.beginPath();f();g.fill();g.stroke()};
const spikeBall=(g,x,r,n)=>{g.fillStyle='#d9a63a';for(let i=0;i<n;i++){const a=i/n*6.283;g.beginPath();g.moveTo(x+Math.cos(a-.22)*r,Math.sin(a-.22)*r);g.lineTo(x+Math.cos(a)*(r+10),Math.sin(a)*(r+10));g.lineTo(x+Math.cos(a+.22)*r,Math.sin(a+.22)*r);g.closePath();g.fill();g.stroke()}
  const q=g.createRadialGradient(x-5,-5,2,x,0,r);q.addColorStop(0,'#fff0b8');q.addColorStop(1,'#a8741a');g.fillStyle=q;g.beginPath();g.arc(x,0,r,0,6.283);g.fill();g.stroke()};
const WEAP=[
 ['ดาบ',g=>{g.fillStyle='#5a3a10';g.fillRect(-14,-5,34,10);g.fillStyle='#d9a63a';g.fillRect(20,-22,10,44);g.strokeRect(20,-22,10,44);fillS(g,()=>{g.moveTo(30,-12);g.lineTo(170,-10);g.lineTo(204,0);g.lineTo(170,10);g.lineTo(30,12);g.closePath()});g.strokeStyle='#fff8d8';g.lineWidth=1.8;g.beginPath();g.moveTo(34,0);g.lineTo(190,0);g.stroke()}],
 ['หอก',g=>{shaft(g,-20,128,6);fillS(g,()=>{g.moveTo(124,0);g.quadraticCurveTo(140,-16,170,0);g.quadraticCurveTo(140,16,124,0)});g.fillStyle='#c0392b';g.beginPath();g.moveTo(118,-3);g.quadraticCurveTo(110,-18,96,-12);g.quadraticCurveTo(108,-4,118,3);g.fill();g.stroke()}],
 ['ขวานศึก',g=>{shaft(g,-20,130,7);fillS(g,()=>{g.moveTo(104,-4);g.quadraticCurveTo(100,-44,138,-40);g.quadraticCurveTo(128,-18,134,0);g.quadraticCurveTo(128,18,138,40);g.quadraticCurveTo(100,44,104,4);g.closePath()});g.fillStyle='#d9a63a';g.beginPath();g.arc(126,0,6,0,6.283);g.fill();g.stroke()}],
 ['กระบองหนาม',g=>{shaft(g,-20,118,8);spikeBall(g,138,20,10)}],
 ['ตรีศูล',g=>{shaft(g,-20,120,6);g.save();g.scale(1,1.5);fillS(g,()=>{g.moveTo(118,-4);g.quadraticCurveTo(122,-30,150,-34);g.lineTo(146,-26);g.quadraticCurveTo(132,-22,134,-4);g.lineTo(134,4);g.quadraticCurveTo(132,22,146,26);g.lineTo(150,34);g.quadraticCurveTo(122,30,118,4);g.closePath()});fillS(g,()=>{g.moveTo(130,-6);g.lineTo(190,0);g.lineTo(130,6);g.closePath()});g.restore()}],
 ['วัชระ',g=>{g.save();g.translate(50,0);g.lineCap='round';
   const rod=(w,c)=>{g.lineWidth=w;g.strokeStyle=c;for(const sd of [-1,1]){g.beginPath();g.moveTo(sd*14,0);g.lineTo(sd*34,0);g.stroke();for(const k of [-1,1]){g.beginPath();g.moveTo(sd*30,0);g.bezierCurveTo(sd*52,k*30,sd*82,k*34,sd*88,k*8);g.stroke()}g.beginPath();g.moveTo(sd*30,0);g.lineTo(sd*98,0);g.stroke();g.beginPath();g.moveTo(sd*30,0);g.bezierCurveTo(sd*46,k0(sd),sd*62,k0(sd),sd*70,k0(sd)*.5);g.stroke()}};
   const k0=sd=>sd*0; rod(13,'#4a2c0c');rod(8,'#e9b43c');g.lineWidth=2;g.strokeStyle='#fff8d8';g.beginPath();g.moveTo(-96,0);g.lineTo(96,0);g.stroke();
   for(const sd of [-1,1]){g.fillStyle='#fff0b8';g.beginPath();g.moveTo(sd*98,0);g.lineTo(sd*112,0);g.lineTo(sd*98,-6);g.closePath();g.fill();g.stroke()}
   const q=g.createRadialGradient(-4,-4,2,0,0,17);q.addColorStop(0,'#fff6c8');q.addColorStop(1,'#a8741a');g.fillStyle=q;g.strokeStyle='#5a3a10';g.lineWidth=2.4;g.beginPath();g.arc(0,0,17,0,6.283);g.fill();g.stroke();g.fillStyle='#c0392b';g.beginPath();g.arc(0,0,6,0,6.283);g.fill();g.stroke();g.restore()}],
 ['จักร',g=>{shaft(g,-20,64,6);g.save();g.translate(112,0);for(let i=0;i<12;i++){const a=i/12*6.283;g.fillStyle='#e9c25a';g.beginPath();g.moveTo(Math.cos(a-.14)*38,Math.sin(a-.14)*38);g.lineTo(Math.cos(a)*52,Math.sin(a)*52);g.lineTo(Math.cos(a+.14)*38,Math.sin(a+.14)*38);g.closePath();g.fill();g.stroke()}
   g.strokeStyle='#5a3a10';g.fillStyle=STEEL(g);g.beginPath();g.arc(0,0,40,0,6.283);g.arc(0,0,22,0,6.283,true);g.fill('evenodd');g.stroke();g.beginPath();g.arc(0,0,22,0,6.283);g.stroke();g.restore()}],
 ['ค้อนศึก',g=>{shaft(g,-20,128,8);fillS(g,()=>{g.rect(116,-26,44,52)});g.fillStyle='#d9a63a';g.beginPath();g.moveTo(160,-8);g.lineTo(186,0);g.lineTo(160,8);g.closePath();g.fill();g.stroke();g.beginPath();g.moveTo(116,-8);g.lineTo(100,0);g.lineTo(116,8);g.closePath();g.fill();g.stroke()}],
 ['หอกง้าว',g=>{shaft(g,-20,132,6);fillS(g,()=>{g.moveTo(128,-3);g.lineTo(168,0);g.lineTo(128,3);g.closePath()});fillS(g,()=>{g.moveTo(96,-3);g.quadraticCurveTo(90,-38,128,-34);g.quadraticCurveTo(116,-16,122,-3);g.closePath()});fillS(g,()=>{g.moveTo(96,3);g.quadraticCurveTo(80,18,86,30);g.quadraticCurveTo(100,18,112,3);g.closePath()})}],
 ['ธนู',g=>{g.lineCap='round';g.lineWidth=15;g.strokeStyle='#4a2c0c';g.beginPath();g.moveTo(-6,-54);g.quadraticCurveTo(118,0,-6,54);g.stroke();g.lineWidth=10;g.strokeStyle='#f0b640';g.stroke();g.lineWidth=2.5;g.strokeStyle='#fff8d8';g.beginPath();g.moveTo(-2,-50);g.quadraticCurveTo(108,0,-2,50);g.stroke();g.lineWidth=2;g.strokeStyle='#fff8d8';g.beginPath();g.moveTo(-6,-54);g.lineTo(-6,54);g.stroke();g.fillStyle='#8a5a22';g.strokeStyle='#4a2c0c';g.lineWidth=2.4;g.fillRect(38,-12,26,24);g.strokeRect(38,-12,26,24);g.fillStyle='#c0392b';for(const y of [-54,54]){g.beginPath();g.arc(-6,y,7,0,6.283);g.fill();g.stroke()}}],
 ['คทา',g=>{g.fillStyle='#a8741a';g.beginPath();g.moveTo(-20,-4);g.lineTo(150,-17);g.quadraticCurveTo(172,0,150,17);g.lineTo(-20,4);g.closePath();g.fill();g.stroke();g.fillStyle='#ffe9a8';for(const [x,y] of [[60,-7],[96,-9],[128,-10],[112,8],[78,6],[140,4]]){g.beginPath();g.arc(x,y,3.4,0,6.283);g.fill();g.stroke()}}],
 ['กริช',g=>{g.fillStyle='#5a3a10';g.fillRect(-14,-4,24,8);g.fillStyle='#d9a63a';g.fillRect(10,-12,7,24);g.strokeRect(10,-12,7,24);fillS(g,()=>{g.moveTo(17,-7);g.quadraticCurveTo(70,-12,104,-3);g.quadraticCurveTo(60,14,17,7);g.closePath()});g.fillStyle='#c0392b';g.beginPath();g.arc(-14,0,5,0,6.283);g.fill();g.stroke()}],
 ['แส้โซ่',g=>{shaft(g,-20,44,8);g.lineCap='round';g.lineJoin='round';const P=(u)=>[44+u*140,Math.sin(u*7)*24*u];g.strokeStyle='#3a1208';g.lineWidth=11;g.beginPath();for(let i=0;i<=30;i++){const [x,y]=P(i/30);i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke();g.strokeStyle='#b8321e';g.lineWidth=7;g.stroke();g.strokeStyle='#ff9a7a';g.lineWidth=1.8;g.stroke();const [tx,ty]=P(1);g.fillStyle='#ffe08a';g.beginPath();g.moveTo(tx,ty-9);g.lineTo(tx+28,ty+2);g.lineTo(tx,ty+12);g.closePath();g.fill();g.stroke();for(const u of [.3,.55,.8]){const [x,y]=P(u);g.fillStyle='#e9b43c';g.beginPath();g.arc(x,y,6,0,6.283);g.fill();g.stroke()}}],
 ['เคียว',g=>{shaft(g,-20,132,6);fillS(g,()=>{g.moveTo(120,-6);g.quadraticCurveTo(184,-60,208,24);g.quadraticCurveTo(168,-20,120,12);g.closePath()})}],
 ['ง้าวใหญ่',g=>{shaft(g,-20,100,6);fillS(g,()=>{g.moveTo(96,-6);g.quadraticCurveTo(150,-34,190,-4);g.quadraticCurveTo(152,2,96,8);g.closePath()});g.fillStyle='#c0392b';g.fillRect(90,-8,8,16);g.strokeRect(90,-8,8,16)}],
 ['พัดเหล็ก',g=>{g.fillStyle='#8a5a22';g.fillRect(-16,-4,40,8);g.save();g.translate(24,0);for(let i=-4;i<=4;i++){g.save();g.rotate(i*.17);g.fillStyle=i%2?'#e9c25a':'#f7de92';g.beginPath();g.moveTo(0,-3);g.lineTo(138,-15);g.quadraticCurveTo(144,0,138,15);g.lineTo(0,3);g.closePath();g.fill();g.stroke();g.restore()}g.restore()}],
 ['ตะบองโซ่',g=>{shaft(g,-20,56,7);g.fillStyle='#d9a63a';g.lineWidth=2;for(let i=0;i<5;i++){g.beginPath();g.ellipse(64+i*14,Math.sin(i*1.1)*5,8,5,0,0,6.283);g.fill();g.stroke()}spikeBall(g,148,21,10)}],
 ['ไม้เท้าขอ',g=>{shaft(g,-20,140,7);g.strokeStyle='#4a2c0c';g.lineWidth=5.5;g.fillStyle='rgba(0,0,0,0)';g.beginPath();g.arc(158,0,28,0,6.283);g.stroke();g.strokeStyle='#e6b858';g.lineWidth=3.5;g.stroke();for(const a of [-1.8,0.4,2.5]){g.strokeStyle='#5a3a10';g.lineWidth=2;g.fillStyle='#f7de92';g.beginPath();g.arc(158+Math.cos(a)*28,Math.sin(a)*28,6,0,6.283);g.fill();g.stroke()}}]
];
// ---------------- IK arm ----------------
function ik(sx,sy,hx,hy,sc){let dx=hx-sx,dy=hy-sy,d=Math.max(40,Math.hypot(dx,dy));const L1=d*.53,L2=L1;
  const a=(L1*L1-L2*L2+d*d)/(2*d),h=Math.sqrt(Math.max(0,L1*L1-a*a)),ux=dx/d,uy=dy/d;let px=-uy,py=ux;if(py>0){px=-px;py=-py}
  return {ex:sx+ux*a+px*h,ey:sy+uy*a+py*h,hx,hy}}
// arm bookkeeping: 18 arms, 9 per side; smash order alternates right/left; targets fixed by seed
const ARMS=[];
for(let i=0;i<18;i++){const side=i%2?-1:1,idx=i>>1;const fan=side>0?lerp(-76,6,idx/8):lerp(-104,-186,idx/8);
  ARMS.push({i,side,idx,fan:fan*Math.PI/180,w:i,order:i})}
function smashTarget(a,k){const r=smashRaw(a,k);return [C.x+(r[0]-C.x)/SCV,C.y+(r[1]-C.y)/SCV]}
function armShoulder(a){const u=a.idx/8;return ART_ON?[GX+a.side*lerp(CF.SH_X[0],CF.SH_X[1],u)*GS,GY+lerp(CF.SH_Y[0],CF.SH_Y[1],u)*GS]:[GX+a.side*(52+u*14)*GS,GY+lerp(-200,-128,u)*GS]}
function smashRaw(a,k){const r1=hash(a.i*7.3+1),r2=hash(a.i*3.1+5);const ang=(k*2.399+hash(k)*1.2),rad=.42+Math.sqrt(hash(k*1.7+2))*.5;let gx=C.x+Math.cos(ang)*rad*CR*.92,gy=C.y+Math.sin(ang)*rad*CR*K*.92;
  return [gx,gy]}
let _ac={t:-1,v:[]};
function armKcur(a){let k=a.i;if(a.i+18<NS&&t>=T0+(a.i+18)*DT)k=a.i+18;return k}
function armStateK(a,k){if(_ac.t!==t){_ac={t,v:{}}}const key=a.i+':'+k;if(_ac.v[key])return _ac.v[key];return _ac.v[key]=armState0(a,k)}
function armState(a){return armStateK(a,armKcur(a))}
function armState0(a,k){const [sx,sy]=armShoulder(a);const fu=ease(seg(t,T_UNF0+a.idx*.03,T_UNF1+a.idx*.03));
  const fold=[sx+a.side*-24,sy-50],fanP=[sx+Math.cos(a.fan)*150,sy+Math.sin(a.fan)*150];let hx=lerp(fold[0],fanP[0],fu),hy=lerp(fold[1],fanP[1],fu);let wa=lerp(a.side>0?.9:2.2,a.fan,fu);
  const tgt=smashTarget(a,k),Ts=T0+k*DT,SKY=1.2,dx=Math.cos(SKY),dy=Math.sin(SKY),wl=wlenOf(a.w),tipx=dx*wl,tipy=dy*wl,Hx=tgt[0]-tipx,Hy=tgt[1]-tipy;
  const tL=Ts+.2,tU=tL+.08,tC=tU+.12,tD=tC+.5,tE=tD+.3;
  let ha=1,wp=null;
  const raise=[fanP[0],fanP[1]];
  if(t>=Ts){
    if(t<tL){hx=fanP[0];hy=fanP[1];wa=a.fan}
    else{hx=fanP[0];hy=fanP[1];wa=a.fan;
      ha=t<tE?0:ease(seg(t,tE,tE+.5));
      if(t<tU){const u=ease(seg(t,tL,tU));wp={x:raise[0],y:lerp(raise[1],-140,u*u),ang:lerp(a.fan,-1.45,u),al:1,f:0,tgt,fly:false,up:true,u}}
      else if(t<tE){const f=seg(t,tU,tC),p=Math.pow(f,2.2),k=t<tC?1:1;let al=1;if(t>=tD)al=1-ease(seg(t,tD,tE));
        const px=lerp(Hx-dx*700,Hx,p),py=lerp(Hy-dy*700,Hy,p);wp={x:px,y:py,ang:SKY,al,f:p,tgt,fly:t<tC,pre:t<tL+.02}}}
  }
  const dropU=wp&&wp.fly?wp.f:0,bob=Math.sin(t*2+a.i)*5;
  return {sx,sy,hx,hy:hy,wa,dropU,tgt,Ts,tL,tC,sc:lerp(.42,1,fu),ha,wp,tU}}
function glowAt(x,y,r,col,a){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a;ctx.drawImage(glow(col),x-r,y-r,r*2,r*2);ctx.restore()}
function grad(x0,y0,x1,y1,stops){const q=ctx.createLinearGradient(x0,y0,x1,y1);stops.forEach(([o,c])=>q.addColorStop(o,c));return q}
let BSPR=null;
function mkBody(){const main=ctx,c=document.createElement('canvas');c.width=420;c.height=350;const g=c.getContext('2d');g.translate(210,340);ctx=g;ctx.lineCap='round';
  // crossed legs
  ctx.fillStyle=grad(0,-80,0,-10,[[0,'#ffe08a'],[1,'#b9822a']]);ctx.strokeStyle='#7a4a10';ctx.lineWidth=2.4;
  ctx.beginPath();ctx.ellipse(0,-44,128,34,0,0,6.283);ctx.fill();ctx.stroke();
  for(const s of [-1,1]){ctx.beginPath();ctx.ellipse(s*102,-50,40,26,s*.3,0,6.283);ctx.fill();ctx.stroke()}
  ctx.fillStyle='#ffd77a';for(const s of [-1,1]){ctx.beginPath();ctx.ellipse(s*30,-58,26,13,s*-.25,0,6.283);ctx.fill();ctx.stroke()}
  ctx.strokeStyle='rgba(122,74,16,.7)';ctx.lineWidth=1.6;for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(i*34,-30);ctx.quadraticCurveTo(i*40,-48,i*26,-66);ctx.stroke()}
  // gold ribbons flowing from shoulders to the floor
  for(const sd of [-1,1]){for(let q=0;q<2;q++){ctx.fillStyle=grad(0,-200,0,0,[[0,'rgba(255,236,150,.95)'],[1,'rgba(230,160,50,.9)']]);ctx.strokeStyle='#9a6a1c';ctx.lineWidth=2;const o=q*26;ctx.beginPath();ctx.moveTo(sd*(62+o*.3),-196);ctx.bezierCurveTo(sd*(150+o),-210,sd*(190+o),-120,sd*(150+o*1.3),-40);ctx.bezierCurveTo(sd*(170+o),-100,sd*(120+o),-150,sd*(78+o*.3),-150);ctx.closePath();ctx.fill();ctx.stroke()}}
  // torso
  ctx.fillStyle=grad(-70,-190,70,-70,[[0,'#fff0c4'],[.5,'#f2c14e'],[1,'#b9822a']]);ctx.strokeStyle='#7a4a10';ctx.lineWidth=2.6;
  ctx.beginPath();ctx.moveTo(-52,-70);ctx.quadraticCurveTo(-72,-130,-64,-196);ctx.quadraticCurveTo(0,-212,64,-196);ctx.quadraticCurveTo(72,-130,52,-70);ctx.quadraticCurveTo(0,-56,-52,-70);ctx.fill();ctx.stroke();
  // sash + belt + necklace
  ctx.fillStyle='rgba(200,60,40,.85)';ctx.beginPath();ctx.moveTo(-58,-192);ctx.lineTo(-36,-196);ctx.lineTo(48,-86);ctx.lineTo(24,-82);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=grad(0,-84,0,-66,[[0,'#ffe08a'],[1,'#b9822a']]);ctx.fillRect(-52,-84,104,16);ctx.strokeRect(-52,-84,104,16);
  ctx.strokeStyle=GL2;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-196,40,.15,Math.PI-.15);ctx.stroke();ctx.fillStyle='#fff';for(let i=0;i<7;i++){const an=.3+i*.42;ctx.beginPath();ctx.arc(Math.cos(an)*40,-196+Math.sin(an)*40,4,0,6.283);ctx.fill()}
  glowAt(0,-150,70,'#ffe9a8',.3);
  // shoulder armlets
  for(const s of [-1,1]){ctx.fillStyle=grad(0,-210,0,-170,[[0,'#ffe9a8'],[1,'#b9822a']]);ctx.strokeStyle='#7a4a10';ctx.lineWidth=2.4;ctx.beginPath();ctx.arc(s*58,-188,19,0,6.283);ctx.fill();ctx.stroke()}
  // neck + head
  ctx.save();ctx.translate(0,-250);ctx.scale(1.28,1.28);ctx.translate(0,250);
  ctx.fillStyle='#e6b858';ctx.fillRect(-14,-222,28,24);
  ctx.fillStyle=grad(0,-320,0,-230,[[0,'#fff0b8'],[1,'#e0a840']]);ctx.strokeStyle='#7a4a10';ctx.lineWidth=2;
  for(let i=-6;i<=6;i++){const an=-1.5708+i*.27,r0=34,r1=60+((i&1)?0:10)-Math.abs(i)*1.5,cx=0,cy=-254;ctx.beginPath();ctx.moveTo(cx+Math.cos(an-.16)*r0,cy+Math.sin(an-.16)*r0*1.1);ctx.lineTo(cx+Math.cos(an+.05)*r1,cy+Math.sin(an+.05)*r1*1.05);ctx.lineTo(cx+Math.cos(an+.16)*r0,cy+Math.sin(an+.16)*r0*1.1);ctx.closePath();ctx.fill();ctx.stroke()}
  ctx.fillStyle=grad(-30,-290,30,-215,[[0,'#fff4d0'],[1,'#e9b955']]);ctx.strokeStyle='#7a4a10';ctx.lineWidth=2.4;ctx.beginPath();ctx.ellipse(0,-252,35,40,0,0,6.283);ctx.fill();ctx.stroke();
  for(const s of [-1,1]){ctx.fillStyle='#f2c14e';ctx.beginPath();ctx.ellipse(s*38,-246,7,22,s*.08,0,6.283);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s*38,-226,4,0,6.283);ctx.fill()}
  // fringe (spiky) + tiara + flame
  ctx.fillStyle=grad(0,-300,0,-262,[[0,'#fff0b8'],[1,'#e8b44a']]);ctx.strokeStyle='#7a4a10';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-36,-256);ctx.lineTo(-34,-290);ctx.quadraticCurveTo(-18,-296,0,-292);ctx.quadraticCurveTo(18,-296,34,-290);ctx.lineTo(36,-256);ctx.lineTo(24,-270);ctx.lineTo(16,-258);ctx.lineTo(6,-272);ctx.lineTo(-4,-258);ctx.lineTo(-14,-272);ctx.lineTo(-22,-260);ctx.lineTo(-28,-272);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=grad(0,-300,0,-280,[[0,'#ffe9a8'],[1,'#c4872a']]);ctx.beginPath();ctx.moveTo(-34,-284);ctx.quadraticCurveTo(0,-300,34,-284);ctx.lineTo(34,-290);ctx.quadraticCurveTo(0,-306,-34,-290);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(-9,-297);ctx.quadraticCurveTo(-16,-322,0,-344);ctx.quadraticCurveTo(14,-322,9,-297);ctx.quadraticCurveTo(0,-292,-9,-297);ctx.fillStyle=grad(0,-344,0,-296,[[0,'#fff6c8'],[1,'#ffb347']]);ctx.fill();ctx.stroke();
  ctx.fillStyle='#ff6a5a';ctx.beginPath();ctx.moveTo(0,-306);ctx.lineTo(7,-295);ctx.lineTo(0,-286);ctx.lineTo(-7,-295);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#ffd77a';for(const sd of [-1,1]){ctx.beginPath();ctx.arc(sd*38,-214,6,0,6.283);ctx.fill();ctx.stroke()}
  // closed eyes, brows, nose, smile, urna
  ctx.strokeStyle='#5a3a10';ctx.lineWidth=2.4;ctx.lineCap='round';for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(s*8,-254);ctx.quadraticCurveTo(s*16,-247,s*25,-254);ctx.stroke();ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(s*7,-262);ctx.quadraticCurveTo(s*17,-269,s*27,-262);ctx.stroke();ctx.lineWidth=2.4}
  ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(0,-250);ctx.quadraticCurveTo(-3,-240,2,-238);ctx.stroke();ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(-10,-228);ctx.quadraticCurveTo(0,-222,10,-228);ctx.stroke();
  glowAt(0,-266,13,'#ffffff',.9);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,-266,2.6,0,6.283);ctx.fill();
  ctx.restore();
  // main arms + joined palms (anjali), never move
  for(const s of [-1,1]){ctx.lineCap='round';ctx.strokeStyle='#7a4a10';ctx.lineWidth=24;ctx.beginPath();ctx.moveTo(s*58,-186);ctx.lineTo(s*72,-140);ctx.lineTo(s*10,-150);ctx.stroke();ctx.strokeStyle='#f2c14e';ctx.lineWidth=20;ctx.stroke();ctx.strokeStyle='#ffe9a8';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(s*54,-190);ctx.lineTo(s*68,-144);ctx.stroke()}
  ctx.fillStyle=grad(0,-190,0,-135,[[0,'#fff4d0'],[1,'#e0a840']]);ctx.strokeStyle='#7a4a10';ctx.lineWidth=2.2;
  ctx.beginPath();ctx.moveTo(-14,-136);ctx.quadraticCurveTo(-18,-168,0,-196);ctx.quadraticCurveTo(18,-168,14,-136);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(0,-196);ctx.lineTo(0,-136);ctx.stroke();
  ctx=main;BSPR=c}
/* ---------------- figure: aura + halo + flames (dynamic) + the cached body sprite ---------------- */
function bodyDraw(alpha){
  const a=ease(seg(t,T_RISE0,T_RISE1)),rise=(1-ease(seg(t,T_RISE0,T_RISE1)))*95;if(a<=0)return;
  ctx.save();ctx.globalAlpha=a*alpha;ctx.translate(GX,GY+rise);ctx.scale(GS,GS);
  const pul=.82+.18*Math.sin(t*2.6);
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.55*pul*a*alpha;ctx.drawImage(glow('#ffb347'),-300,-470,600,580);ctx.globalAlpha=.55*a*alpha;ctx.drawImage(glow('#ffe9a8'),-150,-400,300,300);ctx.restore();
  ctx.save();ctx.translate(0,-262);ctx.strokeStyle=GL2;ctx.globalAlpha=a*alpha*.9;ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,82,0,6.283);ctx.stroke();ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,72,0,6.283);ctx.stroke();
  ctx.setLineDash([3,9]);ctx.rotate(t*.35);ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,96,0,6.283);ctx.stroke();ctx.setLineDash([]);
  ctx.rotate(-t*.35);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a*alpha*.5*pul;for(let i=0;i<16;i++){ctx.rotate(6.283/16);ctx.fillStyle=GL2;ctx.beginPath();ctx.moveTo(100,-3);ctx.lineTo(128,0);ctx.lineTo(100,3);ctx.fill()}ctx.restore();
  if(!low()){ctx.save();ctx.globalCompositeOperation="lighter";for(let q=0;q<12;q++){const ang=-Math.PI+q*Math.PI/11,r0=190+(q%3)*14,fx=Math.cos(ang)*r0*1.15,fy=-150+Math.sin(ang)*r0*.95,fl=.7+.3*Math.sin(t*5+q*1.7),h=58*fl+30;ctx.globalAlpha=a*alpha*.8*fl;ctx.fillStyle='rgba(255,205,100,.85)';ctx.beginPath();ctx.moveTo(fx-16,fy);ctx.quadraticCurveTo(fx-18+Math.sin(t*4+q)*5,fy-h*.6,fx+Math.sin(t*3+q)*4,fy-h);ctx.quadraticCurveTo(fx+18,fy-h*.5,fx+16,fy);ctx.fill()}ctx.restore()}
  const BA=A('body');ctx.globalAlpha=a*alpha;
  const BWl=CF.BODY_W/GS,BHl=BA?BWl*BA.naturalHeight/BA.naturalWidth:0;if(BA)ctx.drawImage(BA,-BWl/2,8-BHl,BWl,BHl);   /* C1 art: ONE static sprite, bottom at the local floor line */
  else{if(!BSPR)mkBody();ctx.drawImage(BSPR,-210,-340)}
  ctx.restore()}
let WSP=null;
function armsDraw(pass,alpha){
  const a=ease(seg(t,T_RISE0+.4,T_RISE1+.2));if(a<=0)return;if(!WSP)WSP=WEAP.map(w=>wsprite(w[1]));
  ctx.save();ctx.globalAlpha=a*alpha;ctx.lineCap='round';const useArt=artReady();
  for(const arm of ARMS){const st=armState(arm),r=ik(st.sx,st.sy,st.hx,st.hy,st.sc);
    if(pass===1){
    {const u=ease(seg(t,st.Ts,st.tL))*(1-seg(t,st.tL,st.tL+.2));if(u>0){const cx=r.hx+Math.cos(st.wa)*60*WS,cy=r.hy+Math.sin(st.wa)*60*WS;glowAt(cx,cy,34+54*u,'#fff0b8',.95*u);glowAt(r.hx,r.hy,26+30*u,'#ffd060',.8*u)}}
    if(st.ha>0){ctx.save();ctx.globalAlpha*=st.ha;ctx.translate(r.hx,r.hy);if(!(useArt&&drawWeapArt(arm.w,st.wa))){ctx.rotate(st.wa);ctx.drawImage(WSP[arm.w],-80*WS,-56*WS,230*WS,112*WS)}ctx.restore()}
    if(useArt){const F=A('fist'),fa=Math.atan2(r.hy-r.ey,r.hx-r.ex);ctx.save();ctx.translate(r.hx,r.hy);ctx.rotate(fa);if(Math.cos(fa)<0)ctx.scale(1,-1);const dw=CF.FIST_W*CF.BODY_W,dh=dw*F.naturalHeight/F.naturalWidth;ctx.drawImage(F,-dw/2,-dh/2,dw,dh);ctx.restore();continue}
    ctx.fillStyle='#ffd77a';ctx.strokeStyle='#7a4a10';ctx.lineWidth=2;ctx.beginPath();ctx.arc(r.hx,r.hy,13,0,6.283);ctx.fill();ctx.stroke();ctx.strokeStyle='#b9822a';ctx.lineWidth=1.6;for(let k=-1;k<=1;k++){ctx.beginPath();ctx.moveTo(r.hx+Math.cos(st.wa+1.57)*k*5+Math.cos(st.wa)*-2,r.hy+Math.sin(st.wa+1.57)*k*5+Math.sin(st.wa)*-2);ctx.lineTo(r.hx+Math.cos(st.wa+1.57)*k*5+Math.cos(st.wa)*6,r.hy+Math.sin(st.wa+1.57)*k*5+Math.sin(st.wa)*6);ctx.stroke()}continue}
    if(useArt){const AR=A('arm'),seg2=(x0,y0,x1,y1)=>{const L=Math.hypot(x1-x0,y1-y0),an=Math.atan2(y1-y0,x1-x0);ctx.save();ctx.translate(x0,y0);ctx.rotate(an);if(Math.cos(an)<0)ctx.scale(1,-1);ctx.drawImage(AR,-10,-CF.ARM_T/2,L+4,CF.ARM_T);ctx.restore()};seg2(st.sx,st.sy,r.hx,r.hy);continue}
    ctx.strokeStyle='#6a3e0c';ctx.lineWidth=23;ctx.beginPath();ctx.moveTo(st.sx,st.sy);ctx.lineTo(r.ex,r.ey);ctx.lineTo(r.hx,r.hy);ctx.stroke();
    ctx.strokeStyle=grad(st.sx,st.sy,r.hx,r.hy,[[0,'#ffe08a'],[.5,'#f2c14e'],[1,'#d9a63a']]);ctx.lineWidth=18;ctx.stroke();
    ctx.strokeStyle='rgba(255,244,207,.8)';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(st.sx-2,st.sy-3);ctx.lineTo(r.ex-2,r.ey-3);ctx.lineTo(r.hx-1,r.hy-3);ctx.stroke();
    {const bx=lerp(r.ex,r.hx,.62),by=lerp(r.ey,r.hy,.62),bx2=lerp(r.ex,r.hx,.74),by2=lerp(r.ey,r.hy,.74);ctx.strokeStyle='#8a5a14';ctx.lineWidth=24;ctx.lineCap='butt';ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx2,by2);ctx.stroke();ctx.strokeStyle='#ffd77a';ctx.lineWidth=19;ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx2,by2);ctx.stroke();ctx.strokeStyle='#c4872a';ctx.lineWidth=2;ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(lerp(r.ex,r.hx,.3),lerp(r.ey,r.hy,.3));ctx.lineTo(bx,by);ctx.stroke();ctx.setLineDash([]);ctx.lineCap='round'}
    ctx.fillStyle='#ffe9a8';ctx.strokeStyle='#7a4a10';ctx.lineWidth=2;for(const [x,y,rr] of [[r.ex,r.ey,6]]){ctx.beginPath();ctx.arc(x,y,rr,0,6.283);ctx.fill();ctx.stroke()}
  }
  ctx.restore()}
/* weapons in the sky: glow lines shooting up, the plunging weapon with its streak, the landing marker */
function skyDraw(alpha){if(!WSP)WSP=WEAP.map(w=>wsprite(w[1]));
  for(const arm of ARMS){const st=armState(arm),w=st.wp;if(!w)continue;
    const [gx,gy]=st.tgt;
    if(w.fly){const m=ease(seg(t,st.tU,st.tU+.15))*(1-w.f*.2);ctx.save();ctx.globalAlpha=.55*m*alpha;ctx.strokeStyle=GL2;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(gx,gy,34-20*w.f,(34-20*w.f)*KD,0,0,6.283);ctx.stroke();ctx.restore()}
    ctx.save();ctx.globalAlpha=w.al*alpha;
    if(w.up){const len=40+120*w.u;ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createLinearGradient(w.x,w.y,w.x,w.y+len);g.addColorStop(0,'rgba(255,230,150,.8)');g.addColorStop(1,'rgba(255,170,60,0)');ctx.strokeStyle=g;ctx.lineWidth=10;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(w.x,w.y);ctx.lineTo(w.x,w.y+len);ctx.stroke();glowAt(w.x,w.y,44,'#ffcf6a',.6);ctx.restore()}
    if(w.fly&&t>st.tU){const f=w.f,dx=Math.cos(w.ang),dy=Math.sin(w.ang),len=60+260*f;ctx.save();ctx.globalCompositeOperation='lighter';
      const g=ctx.createLinearGradient(w.x,w.y,w.x-dx*len,w.y-dy*len);g.addColorStop(0,'rgba(255,230,150,.85)');g.addColorStop(1,'rgba(255,170,60,0)');ctx.strokeStyle=g;ctx.lineWidth=14;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(w.x+dx*40,w.y+dy*40);ctx.lineTo(w.x-dx*len,w.y-dy*len);ctx.stroke();
      glowAt(w.x+dx*60,w.y+dy*60,60,'#ffcf6a',.7);ctx.restore()}
    ctx.translate(w.x,w.y);if(!(artReady()&&(ctx.scale(WS,WS),drawWeapArt(arm.w,w.ang)))){ctx.rotate(w.ang);ctx.drawImage(WSP[arm.w],-80*WS,-56*WS,230*WS,112*WS)}ctx.restore();
    if(!w.fly&&w.al>0){ctx.save();ctx.globalAlpha=w.al*.22*(1-seg(t,st.tC,st.tC+.15))*alpha;glowAt(gx,gy-4,38,'#ffe08a',1);ctx.restore()}}}
/* ---------------- particles: ground x/y + height z (as Demon Domain) ---------------- */
function add(c,p){const cap=CF.PARTS*(low()?.6:1);if(c.parts.length>=cap)return;p.age=0;p.vx=p.vx||0;p.vy=p.vy||0;p.z=p.z||0;p.vz=p.vz||0;p.g=p.g||0;p.rot=p.rot||0;p.vr=p.vr||0;c.parts.push(p)}
function stepParts(c,dt){for(const p of c.parts){p.age+=dt;p.vz-=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.rot+=p.vr*dt;if(p.z<0&&p.floor){p.z=0;p.vz*=-.2;p.vx*=.5;p.vy*=.5;p.vr*=.4}}c.parts=c.parts.filter(p=>p.age<p.life);G18.stats.peakParts=Math.max(G18.stats.peakParts,c.parts.length)}
function drawPartsG(c){const g=ctx;for(const p of c.parts){const u=p.age/p.life,hold=p.hold||.5,a=(1-Math.max(0,u-hold)/(1-hold))*(p.a||1);if(a<=0)continue;g.globalAlpha=clamp(a,0,1);
    if(p.k==='ring'){g.save();g.translate(p.x,p.y);g.scale(1,KG);const r=p.s*(.3+.7*ease(u));g.strokeStyle=p.col;g.lineWidth=p.w*(1-u);g.beginPath();g.arc(0,0,r,0,6.283);g.stroke();g.restore();continue}
    const w=up(p.x,p.y,p.z);
    if(p.k==='dust'){const s=p.s*(1+u*1.2);g.globalAlpha*=.5;g.drawImage(DUST2,w[0]-s,w[1]-s*.6,s*2,s*1.2)}
    else if(p.k==='rock'){g.save();g.translate(w[0],w[1]);g.rotate(p.rot);g.fillStyle=p.col||'#7a5a30';g.beginPath();g.moveTo(-p.s/2,-p.s/3);g.lineTo(p.s/2,-p.s/2);g.lineTo(p.s*.4,p.s/3);g.lineTo(-p.s*.3,p.s/2);g.closePath();g.fill();g.restore()}
    else{g.globalCompositeOperation='lighter';g.drawImage(glow(p.col||GL2),w[0]-p.s/2,w[1]-p.s/2,p.s,p.s);g.globalCompositeOperation='source-over'}}
  g.globalAlpha=1;g.globalCompositeOperation='source-over'}
/* ---------------- ground: rune circle (V7 runes via the game's STF.runeRing), cracks, dim ---------------- */
const CRSZ=[170,210,160,230,200,240];   /* display width of crack1..6 (px) */
function mkCracks(c,tx,ty,seed){
  if(artReady()&&A('crack1')){c.cracks.push({art:1,x:tx,y:ty,t,n:Math.floor(hash(seed*7+3)*6)+1,rot:(hash(seed*5+1)-.5)*.9,w:110+hash(seed*3+2)*60,cr:seed%4===0});if(c.cracks.length>40)c.cracks.splice(0,c.cracks.length-40);return}
  for(let b=0;b<6;b++){const a0=b*1.047+hash(seed*3+b)*.7,pts=[[0,0]];let x=0,y=0,len=22+hash(seed+b*5)*36;for(let k=0;k<4;k++){const a=a0+(hash(seed*9+b*7+k)-.5)*.9;x+=Math.cos(a)*len;y+=Math.sin(a)*len;pts.push([x,y]);len*=.8}c.cracks.push({x:tx,y:ty,pts,t,w:4.2-b*.3})}if(c.cracks.length>40)c.cracks.splice(0,c.cracks.length-40)}
function groundDraw(c,alpha){
  const ra=ease(seg(t,T_RING,T_RING+.4))*(1-seg(t,T_TD0+.3,T_TD1))*alpha,R=window.STF&&STF.runeRing;
  if(ra>0){
    if(R){try{R(c.x,c.y,CR,GL2,ra*.95,t*.25,0,seg(t,T_RING,T_RING+.8),KG);
      if(t>T_RING+.3&&!low())R(c.x,c.y,CR*1.18,GO,ra*.35*seg(t,T_RING+.3,T_RING+.9),t*.15,16,seg(t,T_RING+.3,T_RING+1.2),KG);
      if(t>T_RING+.5)R(c.x,c.y,CR*.62,GO,ra*.5*seg(t,T_RING+.5,T_RING+.9),-t*.4,12,seg(t,T_RING+.5,T_RING+1.1),KG)}catch(_){}}
    ctx.save();ctx.translate(c.x,c.y);ctx.scale(1,KG);ctx.globalAlpha=ra;const g=ctx.createRadialGradient(0,0,0,0,0,CR);g.addColorStop(0,'rgba(255,214,120,.16)');g.addColorStop(1,'rgba(255,200,90,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,CR,0,6.283);ctx.fill();ctx.restore()}
  const fo=(1-seg(t,T_TD0+.2,T_TD1))*alpha;
  if(fo>0&&c.cracks.length&&c.cracks.some(k=>k.art)){   /* C4 art decals: scorch (low alpha) < crater < crack; random per landing, +-25 deg, fade out */
    ctx.save();for(const k of c.cracks){if(!k.art)continue;const age=t-k.t;if(age<0||age>CF.CRACK_F1)continue;const im=A(k.cr?'crater':'crack'+k.n);if(!im)continue;   /* v24: scorch under every decal, crater instead of a crack every 4th, fade F0..F1 x dissolve */
      const u=ease(seg(age,0,.1)),f=1-seg(age,CF.CRACK_F0,CF.CRACK_F1);ctx.save();ctx.translate(k.x,k.y);ctx.scale(1,KG);ctx.rotate(k.rot);
      const s=A('scorch');if(s){ctx.globalAlpha=.5*u*f*fo;const sw=k.w*1.6;ctx.drawImage(s,-sw/2,-sw/2*s.naturalHeight/s.naturalWidth,sw,sw*s.naturalHeight/s.naturalWidth)}
      ctx.globalAlpha=u*f*fo;ctx.drawImage(im,-k.w/2,-k.w/2*im.naturalHeight/im.naturalWidth,k.w,k.w*im.naturalHeight/im.naturalWidth);ctx.restore()}ctx.restore()}
  if(fo>0&&c.cracks.length){ctx.save();ctx.globalCompositeOperation='lighter';for(const k of c.cracks){if(k.art||t-k.t>1.4)continue;const u=ease(seg(t,k.t,k.t+.12)),cool=1-.6*seg(t,k.t+.2,k.t+1.2);ctx.save();ctx.translate(k.x,k.y);ctx.scale(1,KG);ctx.strokeStyle='#ffc96a';ctx.globalAlpha=.55*u*cool*fo;ctx.lineWidth=k.w*2.6;ctx.beginPath();k.pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();ctx.restore()}ctx.restore();
    ctx.save();for(const k of c.cracks){if(k.art||t-k.t>1.8)continue;const u=ease(seg(t,k.t,k.t+.12));ctx.save();ctx.translate(k.x,k.y);ctx.scale(1,KG);ctx.strokeStyle='#2a1a08';ctx.globalAlpha=.9*u*fo*(1-seg(t-k.t,.8,1.8));ctx.lineWidth=k.w;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();k.pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();ctx.restore()}ctx.restore()}}
const dimAmt=()=>ease(seg(t,.3,1.2))*(1-ease(seg(t,T_TD0,T_TD1)))*.16;
/* hero-anchored upright drawing in the demo's screen units (demo hero anchor = C) */
const crownScale=()=>{if(!ART_ON)return 1;const hh=(typeof H==='number'&&H>0)?H:720,above=C.y-(GY+8*GS-CF.BODY_W*1169/1263);return clamp(hh*(.5-CF.CROWN_MIN)/above,.3,1)};
function bbD(c,fn){bb(c.x,c.y,()=>{ctx.save();ctx.translate(c.x-C.x,c.y-C.y);ctx.translate(C.x,C.y);ctx.scale(SCV,SCV);ctx.translate(-C.x,-C.y);fn();ctx.restore()})}
/* dissolve: from 7.0 s the figure is wiped away from the bottom (clip line rises) and fades */
function figure(c,pass){   /* pass 0 = behind characters (arms + body), 1 = in front (hands, weapons) */
  const dis=seg(t,T_TD0,T_TD1),alpha=1-.5*ease(seg(t,T_TD0+.6,T_TD1));if(t>=T_TD1)return;
  bbD(c,()=>{ctx.save();
    if(dis>0){const wy=lerp(GY+40,GY-460,dis);ctx.beginPath();ctx.rect(-3000,-3000,6000,3000+wy+10);ctx.clip()}
    if(pass===0){armsDraw(0,alpha);bodyDraw(alpha)}else{armsDraw(1,alpha);skyDraw(alpha)}
    ctx.restore()})}
/* ---------------- damage ---------------- */
function mkCtx(){const wt=P.weapon&&P.weapon.t,A=C182.api;let coef=4;try{const D=typeof A.D==='function'?A.D():null,wd=D&&D.weapons&&D.weapons[wt];if(wd&&wd.actionCoef>0)coef=wd.actionCoef}catch(_){}
  const W=typeof WEAPONS!=='undefined'&&WEAPONS[wt],dt=W&&W.magic?'mag':'phys';
  const def={id:ID,mode:'native',coefTotal:coef,flatTotal:0,weights:Array(64).fill(1),maxTargets:99,targeting:'around',element:'Neutral',range:900};
  const cx=A.ctxFor('skill',ID,def,{dt,lvScale:1,m0:1,reach:1400,cdId:ID});cx.coef=coef;return cx}
function deal(e,c,fac){const prev=C182.cur,vx=e.vx,vy=e.vy,gsh=G.shake;let r=0;C182.cur=c.cx;const lsO=C182.lifesteal;
  if(typeof lsO==='function')C182.lifesteal=function(e2,d2,ls2,o2){return lsO.call(this,e2,d2,ls2*fac,o2)};   /* lifesteal factor: first target 1.0, others 0.5 (the game's own lifesteal rule/cap still applies) */
  let cap=null,cap0=null,cmp=1;try{cap=window.COLCMB&&COLCMB.CFG&&COLCMB.CFG.dmg;cap0=cap&&cap.cap;if(window.COMP30&&COMP30.on&&COMP30.c)cmp=COMP30.c(P.lvl|0)||1}catch(_){}
  try{if(cap)cap.cap=Math.round(CF.CAP/cmp);r=hitEnemy(e,CF.MUL,{dt:c.cx.dt,ctx:c.cx,kind:'guardian18',fx:c.x,fy:c.y,kb:0})||0}catch(er){G18.err='dmg '+er.message}
  finally{if(cap)cap.cap=cap0;C182.cur=prev;C182.lifesteal=lsO;e.vx=vx;e.vy=vy;if(!(CF.SCREEN_SHAKE>0)&&typeof gsh==='number')G.shake=gsh}   /* the game's own hit-shake is undone: this skill never shakes the screen unless SCREEN_SHAKE>0 */
  try{const M=CF.MAX_FLOAT_NUMBERS;if(M>0&&typeof texts!=='undefined'&&texts.length>M){G18.stats.numDropped+=texts.length-M;texts.splice(0,texts.length-M)}}catch(_){}   /* no knockback, no stun */
  G18.stats.hits++;G18.stats.dmg+=Math.max(0,r);return r}
const onScreen=e=>{try{const s=w2s(e.x,e.y),m=-(e.sz||16);return s[0]>=m&&s[0]<=W-m&&s[1]>=m&&s[1]<=H-m}catch(_){return false}};
const inArea=(c,e)=>CF.HIT_MODE==='screen'?onScreen(e):Math.hypot(e.x-c.x,(e.y-c.y)/KG)<=CF.HIT_RADIUS+(e.sz||16)*.5;
function areaFoes(c){const L=[];for(const e of enemies){if(!liveE(e)||!inArea(c,e))continue;L.push({e,d:Math.hypot(e.x-c.x,(e.y-c.y)/KG)})}L.sort((a,b)=>a.d-b.d);return(CF.MAX_TARGETS>0?L.slice(0,CF.MAX_TARGETS):L).map(o=>o.e)}
/* ---------------- landing target of hit k (world ground point, follows the hero) ---------------- */
function tgtOff(k){const arm=ARMS[k%18],a=smashRaw(arm,k);return [a[0]-C.x,(a[1]-C.y)*(KG/KD)]}   /* demo screen offset -> world offset on the game's ground plane */
let dprCapped=false;
function dprCap(on){try{if(typeof gfxCap!=='function'||typeof resize!=='function')return;if(on===dprCapped)return;if(on&&(window.devicePixelRatio||1)<=1.25)return;dprCapped=on;resize()}catch(_){}}
try{if(typeof gfxCap==='function'){const o=gfxCap;gfxCap=function(){const v=o.apply(this,arguments);return dprCapped?Math.min(1.25,v):v}}}catch(_){}
/* ---------------- cast / tick ---------------- */
function say(txt){try{textAt(P.x,P.y-62,txt,'#ffe9a8',13)}catch(_){}}
function ready(){const why=!P||P.dead||G.state!=='play'?'—':(P.lvl|0)<CF.MINLV?'ต้อง Lv '+CF.MINLV+' ขึ้นไป':(P.cds[ID]||0)>0?'ยังคูลดาวน์ '+Math.ceil(P.cds[ID])+' วิ':P.mp<CF.MP?'มานาไม่พอ ('+CF.MP+')':G18.list.length?'กำลังใช้อยู่':'';
  if(why){G18.stats.refused++;if(why!=='—')say('ผู้พิทักษ์ 18 กร: '+why)}return !why}
function cast(force){if(!force&&!ready())return false;if(!P||P.dead||G.state!=='play')return false;if(!force){P.mp-=CF.MP;P.cds[ID]=CF.CD}
  const c={t0:clk(),x:P.x,y:P.y,ev:{},parts:[],cracks:[],cx:mkCtx(),lastT:0,lsT:-9};G18.list.push(c);G18.stats.casts++;G18.stats.perLanding=[];dprCap(true);return true}
G18.cast=cast;
/* stability probe: positions of every arm/elbow/hand/weapon angle at demo time tt (used to prove nothing wobbles while held) */
G18.probe=tt=>{const o=t,sv=SCV;t=tt;SCV=1;const r=ARMS.map(a=>{const s=armState(a),q=ik(s.sx,s.sy,s.hx,s.hy,s.sc);return [s.sx,s.sy,q.ex,q.ey,s.hx,s.hy,s.wa].map(v=>+v.toFixed(4))});t=o;SCV=sv;return r};
function once(c,k,f){if(!c.ev[k]){c.ev[k]=1;f()}}
function landing(c,k){const tt0=clk()-c.t0,[ox,oy]=tgtOff(k),gx=c.x+ox,gy=c.y+oy;G18.stats.landings++;
  try{if(CF.SCREEN_SHAKE>0)shake(CF.SCREEN_SHAKE)}catch(_){}
  add(c,{k:'ring',x:gx,y:gy,s:120,w:10,col:GL2,life:.4,a:.9});add(c,{k:'ring',x:gx,y:gy,s:210,w:5,col:'#ffc96a',life:.6,a:.65});
  const q=Qn();
  for(let i=0;i<Math.round(2*q);i++)add(c,{k:'dust',x:gx+rnd(-40,40),y:gy+rnd(-8,6),vx:rnd(-60,60),vy:rnd(-10,10),vz:rnd(30,90),s:rnd(34,64),life:rnd(.6,.9),hold:.1,a:.5});
  for(let i=0;i<Math.round(4*q);i++)add(c,{k:'rock',x:gx,y:gy,vx:rnd(-160,160),vy:rnd(-30,30),vz:rnd(180,380),g:700,floor:1,s:rnd(5,13),vr:rnd(-12,12),life:rnd(.5,.9),hold:.3,col:'#7a5a30'});
  for(let i=0;i<Math.round(8*q);i++)add(c,{k:'s',x:gx+rnd(-10,10),y:gy+rnd(-6,6),vx:rnd(-220,220),vy:rnd(-40,40),vz:rnd(80,340),g:500,s:rnd(10,16),col:Math.random()<.5?GL2:AMB,life:.4,hold:.2});
  mkCracks(c,gx,gy,k+1);
  const hit=areaFoes(c);let n=0;
  if(tt0-c.lsT>=1||c.lsT<0){c.lsT=tt0;c.cx.lsLeft=CF.LS_CAP_PCT*(P.maxHp||P.mhp||0)}   /* lifesteal budget: refilled once per second */
  let first=true;for(const e of hit){deal(e,c,first?CF.LS_FIRST:CF.LS_OTHER);first=false;n++;if(Math.hypot(e.x-gx,(e.y-gy)/KG)<=CF.FLINCH_R){add(c,{k:'ring',x:e.x,y:e.y,s:34,w:3,col:AMB,life:.3,a:.8});for(let j=0;j<2;j++)add(c,{k:'s',x:e.x+rnd(-8,8),y:e.y+rnd(-4,4),vz:rnd(20,70),s:rnd(8,12),col:GL2,life:.3})}}
  G18.stats.perLanding.push(n)}
function tick(dt){const now=clk();if(!G18.list.length)return;
  for(const c of G18.list){c.x=P.x;c.y=P.y;const tt=now-c.t0;t=tt;SCV=crownScale();const q=Qn();
    if(tt>=T_RISE0+.35)once(c,'ringBurst',()=>{add(c,{k:'ring',x:c.x,y:c.y-34*KG,s:150,w:8,col:GL2,life:.7,a:.8})});
    if(tt>=T_RISE0+.5)once(c,'riseR',()=>{try{if(CF.SCREEN_SHAKE>0)shake(CF.SCREEN_SHAKE*.85)}catch(_){}});
    if(tt>T_RISE0&&tt<T_TD1){const n=Math.round(1.2*q);for(let i=0;i<n;i++)if(Math.random()<dt*14)add(c,{k:'s',x:c.x+rnd(-120,120),y:c.y-rnd(10,40),vz:rnd(30,70),s:rnd(6,14),col:Math.random()<.5?GL2:'#ffc96a',life:rnd(1.2,2),a:.9})}
    for(let k=0;k<NS;k++){const arm=ARMS[k%18],st=armStateK(arm,k);if(tt>=st.tC)once(c,'sm'+k,()=>landing(c,k));
      if(tt>=st.tL)once(c,'a'+k,()=>{for(let i=0;i<Math.round(3*q);i++)add(c,{k:'s',x:c.x+rnd(-90,90),y:c.y-rnd(20,60),vz:rnd(90,200),s:rnd(8,12),col:GL2,life:.3})})}
    if(tt>=T_TD0&&tt<T_TD1){const n=Math.round(3*q);for(let i=0;i<n;i++)add(c,{k:'s',x:c.x+rnd(-190,230)*.6,y:c.y-rnd(0,30),z:lerp(40,440,seg(tt,T_TD0,T_TD1))+rnd(-20,40),vz:rnd(50,140),s:rnd(8,20),col:Math.random()<.5?GL2:'#ffc96a',life:rnd(.9,1.6),a:.9})}
    stepParts(c,dt)}
  G18.list=G18.list.filter(c=>now-c.t0<I_END);if(!G18.list.length)dprCap(false)}
{const o=update;update=function(dt){const r=o.apply(this,arguments);try{if(G.state==='play')tick(dt)}catch(e){G18.err='tick '+e.message}return r}}
/* ---------------- drawing ---------------- */
function drawGroundPass(){const now=clk();for(const c of G18.list){t=now-c.t0;SCV=crownScale();ctx=GCTX();
  const d=dimAmt();if(d>0){ctx.save();ctx.fillStyle='rgba(30,18,4,'+d+')';ctx.fillRect(c.x-2600,c.y-2600,5200,5200);ctx.restore()}
  groundDraw(c,1);figure(c,0)}}
function drawTopPass(){const now=clk();for(const c of G18.list){t=now-c.t0;SCV=crownScale();ctx=GCTX();ctx.save();figure(c,1);ctx.restore();ctx.save();drawPartsG(c);ctx.restore()}}
{const o=drawRaidTele;drawRaidTele=function(){const r=o.apply(this,arguments);try{if(G18.list.length){const g=GCTX();g.save();drawGroundPass();g.restore()}}catch(e){G18.err='ground '+e.message}return r}}
{const o=drawParts;drawParts=function(){const r=o.apply(this,arguments);if(!G18.list.length)return r;const t0=performance.now();
  try{drawTopPass()}catch(e){G18.err='draw '+e.message}
  const ms=performance.now()-t0;G18.stats.frames++;G18.stats.drawMs+=ms;G18.stats.maxMs=Math.max(G18.stats.maxMs,ms);return r}}
/* ---------------- input: key 9 / the round button (casts at once, nothing to aim) ---------------- */
const placed=()=>{try{return !(window.SPSK&&SPSK.placed&&SPSK.placed.g18===0)}catch(_){return true}};
const blockedUI=()=>!P||P.dead||G.state!=='play'||!!G.win||(typeof ED!=='undefined'&&ED.on);
addEventListener('keydown',e=>{try{if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||e.key!==CF.key)return;const tg=e.target;if(tg&&(tg.tagName==='INPUT'||tg.tagName==='TEXTAREA'||tg.isContentEditable))return;
  if(blockedUI()||!placed())return;e.stopImmediatePropagation();e.preventDefault();cast(false)}catch(er){G18.err='key '+er.message}},true);
const css=document.createElement('style');css.id='g18css';css.textContent=
 '#g18Btn{position:fixed;left:14px;top:180px;z-index:57;width:52px;height:52px;padding:0;border-radius:50%;border:2px solid #f2c14e;background:radial-gradient(circle at 50% 40%,#3a2a10,#140e04);cursor:pointer;display:none;touch-action:manipulation;overflow:hidden;box-shadow:0 0 8px rgba(242,193,78,.5)}'
 +'#g18Btn svg{position:absolute;inset:8px;width:32px;height:32px;pointer-events:none}'
 +'#g18Btn .k{position:absolute;z-index:3;left:3px;top:1px;font:600 9px sans-serif;color:#fff4cf;background:rgba(0,0,0,.6);padding:0 3px;border-radius:4px}'
 +'#g18Btn .cd{position:absolute;inset:0;z-index:1;border-radius:50%;background:conic-gradient(rgba(0,0,0,.66) calc(var(--cd,0)*360deg),transparent 0)}'
 +'#g18Btn .ct{position:absolute;inset:0;z-index:2;display:flex;align-items:center;justify-content:center;font:700 15px sans-serif;color:#fff;text-shadow:0 1px 2px #000}'
 +'#g18Btn.nomp{opacity:.55}@media (hover:none){#g18Btn .k{display:none}#g18Btn{width:56px;height:56px}}';
document.head.appendChild(css);
const btn=document.createElement('button');btn.type='button';btn.id='g18Btn';btn.title='ผู้พิทักษ์ 18 กร (สกิลพิเศษ · คีย์ '+CF.key+')';btn.setAttribute('aria-label','ผู้พิทักษ์ 18 กร สกิลพิเศษ');
btn.innerHTML='<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="9" r="4.5" fill="#f2c14e" stroke="#7a4a10"/><path d="M12 14 L20 14 L22 24 L10 24 Z" fill="#e6b040" stroke="#7a4a10"/><g stroke="#f2c14e" stroke-width="1.6" stroke-linecap="round"><path d="M10 15 L2 8"/><path d="M10 17 L1 15"/><path d="M10 19 L2 22"/><path d="M22 15 L30 8"/><path d="M22 17 L31 15"/><path d="M22 19 L30 22"/></g><path d="M8 26 Q16 29 24 26" stroke="#ffe9a8" fill="none" stroke-width="1.4"/></svg>'
 +'<span class="cd"></span><span class="ct"></span><span class="k">'+CF.key+'</span>';
document.body.appendChild(btn);
for(const ty of ['pointerdown','mousedown','mouseup','touchstart','touchend'])btn.addEventListener(ty,e=>{e.stopPropagation();if(ty==='touchstart'&&e.cancelable)e.preventDefault()});
btn.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();cast(false)});
btn.addEventListener('pointerup',e=>{if(e.pointerType==='touch'){e.stopPropagation();cast(false)}});
function place(){const dd=document.getElementById('ddBtn'),bw=btn.offsetWidth||52;let r=null;if(dd&&getComputedStyle(dd).display!=='none'){const q=dd.getBoundingClientRect();if(q.width>0)r=q}
  if(r){btn.style.left=Math.round(Math.max(8,r.left-bw-10))+'px';btn.style.top=Math.round(r.top+(r.height-bw)/2)+'px';return}
  const bar=document.getElementById('bar'),q=bar&&bar.getBoundingClientRect();if(q&&q.width>0){btn.style.left=Math.round(Math.max(8,q.left-3*(bw+10)))+'px';btn.style.top=Math.round(q.top+(q.height-bw)/2)+'px'}}
setInterval(()=>{try{const show=G.state==='play'&&!G.win&&P&&!P.dead&&!(typeof ED!=='undefined'&&ED.on)&&placed()&&(P.lvl|0)>=CF.MINLV;btn.style.display=show?'block':'none';if(!show)return;place();
  const cd=(P.cds&&P.cds[ID])||0;btn.querySelector('.cd').style.setProperty('--cd',cd>0?Math.min(1,cd/CF.CD):0);btn.querySelector('.ct').textContent=cd>0?(cd>=10?String(Math.ceil(cd)):cd.toFixed(1)):'';btn.classList.toggle('nomp',P.mp<CF.MP)}catch(_){}},120);
/* ---------------- special skills page (SPSK, the skill window's "สกิลพิเศษ"): add the third row ---------------- */
function reg(){try{const S=window.SPSK;if(!S||!S.defs)return false;if(S.defs.some(d=>d.id==='g18'))return true;
  S.defs.push({id:'g18',name:'ผู้พิทักษ์ 18 กร',en:'Guardian of 18 Arms',col:'#f2c14e',lv:CF.MINLV||40,cd:CF.CD,mp:CF.MP,key:CF.key,npc:'ยังไม่มี NPC สอน (เรียนด้วยเลเวล)',api:()=>window.GUARDIAN18,cdId:ID,
   desc:'ผู้พิทักษ์สีทองยักษ์ผุดขึ้นด้านหลัง แขน 18 ข้างปล่อยอาวุธ 32 ชิ้นจากฟ้า ศัตรูในวงรอบตัวโดนทุกครั้ง ครั้งละ 30% ของโจมตีปกติ',
   full:'วงรูนรอบตัว ผู้พิทักษ์สีทองนั่งสมาธิด้านหลัง อาวุธ 18 ชนิดพุ่งขึ้นฟ้าแล้วพุ่งลงกระแทกพื้นรอบตัว 32 ครั้ง (ห่าง 0.11 วิ) ทุกครั้งโดนมอนทุกตัวในวงรัศมี 195 (สูงสุด 10 ตัว) ครั้งละ 30% ของโจมตีปกติ ไม่ติดธาตุ ไม่สตัน ไม่กระเด็น บอสโดนเต็ม เดิน/ตีปกติ/ใช้สกิลอื่นได้ขณะใช้'});
  if(S.placed&&S.placed.g18==null)S.placed.g18=1;S.sig='';return true}catch(_){return false}}
let rt=0;const ri=setInterval(()=>{if(reg()||++rt>200)clearInterval(ri)},250);
G18.ok=true;G18.artOn=ART_ON;G18.artReady=artReady;
}catch(e){G18.err=e.message;G18.ok=false}
})();

