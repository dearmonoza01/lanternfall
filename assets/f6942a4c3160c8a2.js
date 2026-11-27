
/* ---- p326 r2: quest system + prologue "ห้วงสีขาว" (TEST; order orders/code/ORDER_20261028_quest-system-prologue.md, DeaRz OK 28 Oct 12:02).
   Data: approved/story/quests_v1.json + npcs_v1.json, embedded by the build as window.__QDATA (text is never written in this code).
   - quest state is per player, saved inside the character save (field "quest"); the world NPC (Lysel, fixed) is never changed by it.
   - new characters start in w00_void; prologueDone = never back to the void; old characters (save without "quest") skip the prologue.
   - dialogue box (≤ 2 lines, tap to go on, choice buttons), floating thought text, ! / ? over the NPC, quest tracker (skill ticks in pro_03).
   - objective kinds: talk, interact (weapon pedestal), use_all_skills, talk_choice, cutscene (white flash → w00_forest), reach (+ spark orb guide).
   - w00_void: white, no monsters, no death; Lysel centre, 3 weapon pedestals behind her, 3 training dummies (Astoria training-yard art) on the left.
   - w00_forest: Map 1 grass + trees, one path, no monsters; exit = Map 1 south edge (2350,1650), far from the smithy (796,652).
   - pro_03: every skill of the held weapon open for the trial, short cooldowns, MP never runs out; real values come back when leaving the void.
   - r2 art (approved 28 Oct 18:40, orders/maps/ORDER_20261028_prologue-art.md): L1 Lysel 2 frames (wings down/up, swapped + float by code), L2 faces in the
     dialogue box (0 gentle, 1 serious, 2 smile; picked per dialogue key below), L3 pedestal, L4 white-void floor tile (fog/edge light by code). Embedded as window.__PROART.
   Off: ?prologue=off. Debug: window.PROLOGUE ---- */
(function(){'use strict';const Q=String(location.search);
const ART={};try{const A=window.__PROART||{};for(const k of ['ly0','ly1','face0','face1','face2','ped','floor'])if(A[k]){const i=new Image();i.src=A[k];ART[k]=i;}ART.lyMeta=A.lyMeta;ART.pedMeta=A.pedMeta;}catch(_){}
const ok=i=>!!(i&&i.complete&&i.naturalWidth);
const PR=window.PROLOGUE={ver:'p326-r2',on:!/prologue=off/.test(Q),ok:false,err:null,state:null,stats:{enter:0,talks:0,picks:0,casts:0,saves:0,blocked:0},log:[]};
if(!PR.on)return;
try{
const DQ=window.__QDATA;if(!DQ||!Array.isArray(DQ.quests)||!Array.isArray(DQ.npcs))throw new Error('quest data missing');
if(typeof loadZone!=='function'||typeof saveGame!=='function'||typeof update!=='function'||typeof drawParts!=='function'||typeof drawRaidTele!=='function')throw new Error('game hooks missing');
const QBY={},NPC={};for(const q of DQ.quests)QBY[q.id]=q;for(const n of DQ.npcs)NPC[n.id]=n;
const VOID='w00_void',FOREST='w00_forest',MAP1='sylva_lab',MAP1_IN={x:2350,y:1650};
const isPro=z=>z===VOID||z===FOREST;
const clk=()=>typeof time==='number'?time:performance.now()/1000;
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,u)=>a+(b-a)*u;
const say=(m)=>{PR.log.push([+clk().toFixed(1),m]);if(PR.log.length>80)PR.log.shift();};
const firstQ=DQ.quests.find(q=>!q.requires||!q.requires.after);
const nextOf=id=>DQ.quests.find(q=>q.requires&&q.requires.after===id);
/* ---------- per-player state (lives in the save) ---------- */
const fresh=()=>({v:1,cur:null,done:{},flags:{},used:{},weapon:null});
let S=null;PR.st=()=>S;
function readSaved(){try{const raw=localStorage.getItem(SAVE_KEY);if(!raw)return null;const o=JSON.parse(raw);return o&&o.quest?o.quest:null;}catch(_){return null;}}
{const o=saveGame;saveGame=function(){const r=o.apply(this,arguments);
  try{if(S&&P&&!P.dead){const raw=localStorage.getItem(SAVE_KEY);if(raw){const j=JSON.parse(raw);j.quest=S;const s2=JSON.stringify(j);localStorage.setItem(SAVE_KEY,s2);PR.stats.saves++;
      try{if(typeof CH!=='undefined'&&CH.cur>=0&&CH.list[CH.cur]){CH.list[CH.cur].save=s2;chSave();}}catch(_){}}}}catch(e){PR.err='save '+e.message;}
  return r;};}
/* ---------- zones ---------- */
const ZV={w:1700,h:1100},ZF={w:1800,h:1500};
ZONES[VOID]={n:'ห้วงสีขาว',th:'ห้วงสีขาว',sub:'บทนำ',safe:1,fullSafe:1,w:ZV.w,h:ZV.h,seed:7,ground:['#f6f3ea','#efeadf','#ffffff','#e8e2d4'],acc:'#ffe9a8',amb:'mote',mobs:[],density:0,areas:[],prologue:1};
ZONES[FOREST]={n:'ป่าแรกเกิด',th:'ป่าแรกเกิด',sub:'บทนำ',safe:1,fullSafe:1,w:ZF.w,h:ZF.h,seed:9,ground:['#1f3a24','#2a4a2c','#35603a','#18301c'],acc:'#bfffc8',amb:'firefly',mobs:[],density:0,areas:[],prologue:1};
try{EDGE_THEME[VOID]=[];EDGE_THEME[FOREST]=[];}catch(_){}
const LYS={x:850,y:470},PED=[{w:'sword',x:590,y:360},{w:'dagger',x:720,y:310},{w:'bow',x:850,y:285},{w:'staff',x:980,y:310},{w:'holy',x:1110,y:360}],DUM=[[300,520],[380,650],[260,760]];
/* v3e: Lysel x1.3 (?lyscale=off), start empty-handed, 5 starter weapons with proper names */
const LYK=/[?&]lyscale=off\b/.test(Q)?1:1.3;
const STARTN={sword:'Tidecaller',bow:'Gale String',staff:'Starlight Staff',holy:'Sunlit Scepter',dagger:'Spirit Fang'};
function eqBare(){let i=P.inv.findIndex(x=>x&&x.kind==='wpn'&&x.t==='fist');if(i<0){const w=makeWeapon('sword',1,0);w.t='fist';w.name='มือเปล่า';w.atk=0;w.matk=0;w.refine=0;P.inv.push(w);i=P.inv.length-1;}equipItem(i);}
function EQUIPNEW(t){const w=()=>P.weapon&&P.weapon.t,H=()=>window.HOLYW&&HOLYW.on;
  if(t==='fist'){if(H())HOLYW.toggle();eqBare();}
  else if(t==='sword'){if(H())HOLYW.toggle();if(w()!=='sword'){let i=P.inv.findIndex(x=>x&&x.kind==='wpn'&&x.t==='sword');if(i<0){P.inv.push(makeWeapon('sword',P.lvl||1,0));i=P.inv.length-1;}equipItem(i);}}
  else if(t==='bow'){if(H())HOLYW.toggle();if(w()!=='bow')BOW.toggle();}
  else if(t==='staff'){if(H())HOLYW.toggle();if(w()!=='staff')STF.toggle();}
  else if(t==='holy'){if(!H())HOLYW.toggle();}
  else if(t==='dagger'){if(H())HOLYW.toggle();if(w()!=='dagger')DGR.toggle();}
  try{if(t!=='fist'&&P.weapon&&STARTN[t])P.weapon.name=STARTN[t];}catch(_){}
  try{buildBar();}catch(_){}try{buildTouchSkills();}catch(_){}try{recalc();}catch(_){}}
const HOLYL=()=>[{id:'holyJL',k:'jl',name:'แสงพิพากษา',start:()=>{try{HOLY.cast('jl')}catch(_){}}},{id:'holySR',k:'sr',name:'ฝนหอกศักดิ์สิทธิ์',start:()=>{try{HOLY.cast('sr')}catch(_){}}}];
function ENSUREW(){try{if(!S||!S.weapon||/[?&]prologue_oldequip=on\b/.test(Q))return;const t=S.weapon,cur=P.weapon&&P.weapon.t,need=(t==='holy')?(cur!=='staff'||!(window.HOLYW&&HOLYW.on)):(cur!==t);if(need){EQUIPNEW(t);PR.stats.reequip=(PR.stats.reequip||0)+1;}if(S.flags.prologueDone&&!/[?&]probag=old\b/.test(Q)&&P.inv.length)P.inv=[];}catch(e){PR.err='ensure '+e.message;}}
const PATH=[[900,1420],[780,1180],[960,930],[830,680],[990,430],[900,150],[900,30]];
function pathDist(x,y){let m=1e9;for(let i=0;i<PATH.length-1;i++){const [ax,ay]=PATH[i],[bx,by]=PATH[i+1],dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy,u=clamp(((x-ax)*dx+(y-ay)*dy)/l,0,1);m=Math.min(m,Math.hypot(x-ax-dx*u,y-ay-dy*u));}return m;}
let FPROPS=null;
function forestProps(){if(FPROPS)return FPROPS;const out=[],T=['svChPineM','svChBirch','svChOakR','svChPine','svChOakT','svChWillow','svChPineS'],B=['svChCG1','svChCG2','svChCG3','svChCG4','svChCG5'];
  let sd=4242;const r=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};
  for(let y=40;y<ZF.h;y+=120)for(let x=40;x<ZF.w;x+=130){const px=x+(r()-.5)*90,py=y+(r()-.5)*80,d=pathDist(px,py);
    if(d>190&&r()<.82)out.push({t:T[Math.floor(r()*T.length)],x:px,y:py,s:.7+r()*.35,v:0,f:r()<.5?1:-1,ph:r()*6});
    else if(d>95&&r()<.45)out.push({t:B[Math.floor(r()*B.length)],x:px,y:py,s:.8+r()*.4,v:0,f:r()<.5?1:-1,ph:r()*6});}
  return FPROPS=out.filter(p=>typeof PROP_DEFS==='undefined'||PROP_DEFS[p.t]);}
function voidProps(){return [];}   // the Astoria dummy art is a W22-only prop, so it is drawn here (drawDummy) instead
{const o=genBG;genBG=function(z){if(!isPro(z))return o.apply(this,arguments);const Z=ZONES[z],c=document.createElement('canvas');c.width=Math.ceil(Z.w*BGS);c.height=Math.ceil(Z.h*BGS);const g=c.getContext('2d');g.scale(BGS,BGS);try{LIGHTS=[];}catch(_){}
  if(z===VOID&&ok(ART.floor)){const pt=g.createPattern(ART.floor,'repeat');pt.setTransform(new DOMMatrix().scale(600/512));g.fillStyle=pt;g.fillRect(0,0,Z.w,Z.h);   // L4 tile, 600 world px
    const f=g.createRadialGradient(Z.w/2,Z.h*.45,120,Z.w/2,Z.h*.45,Z.w*.62);f.addColorStop(0,'rgba(255,253,246,0)');f.addColorStop(.55,'rgba(255,253,246,.25)');f.addColorStop(1,'rgba(255,253,246,.95)');g.fillStyle=f;g.fillRect(0,0,Z.w,Z.h);   // white fog toward the edges
    g.globalAlpha=.22;for(let i=0;i<40;i++){const x=(i*397)%Z.w,y=(i*251)%Z.h,rr=60+(i*37)%120,q=g.createRadialGradient(x,y,0,x,y,rr);q.addColorStop(0,'#fff8de');q.addColorStop(1,'rgba(255,248,222,0)');g.fillStyle=q;g.fillRect(x-rr,y-rr,rr*2,rr*2);}g.globalAlpha=1;}
  else if(z===VOID){PR.stats.floorLate=1;const r=g.createRadialGradient(Z.w/2,Z.h/2,60,Z.w/2,Z.h/2,Z.w*.72);r.addColorStop(0,'#fffdf6');r.addColorStop(.6,'#f6f1e3');r.addColorStop(1,'#e9e2cf');g.fillStyle=r;g.fillRect(0,0,Z.w,Z.h);
    g.globalAlpha=.35;for(let i=0;i<60;i++){const x=(i*397)%Z.w,y=(i*251)%Z.h,rr=60+(i*37)%120,q=g.createRadialGradient(x,y,0,x,y,rr);q.addColorStop(0,'#fff8de');q.addColorStop(1,'rgba(255,248,222,0)');g.fillStyle=q;g.fillRect(x-rr,y-rr,rr*2,rr*2);}g.globalAlpha=1;}
  else{let ok=false;try{const im=imgOf(SYLVA_ART.grass_a.src);if(im&&im.naturalWidth){g.fillStyle=g.createPattern(im,'repeat');ok=true;}}catch(_){}if(!ok)g.fillStyle='#3d6a34';g.fillRect(0,0,Z.w,Z.h);
    try{const im=imgOf(SYLVA_ART.earth.src);if(im&&im.naturalWidth){g.strokeStyle=g.createPattern(im,'repeat');}else g.strokeStyle='#8a6a44';}catch(_){g.strokeStyle='#8a6a44';}
    g.lineCap='round';g.lineJoin='round';for(const [w,a] of [[150,.35],[118,.85]]){g.globalAlpha=a;g.lineWidth=w;g.beginPath();PATH.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke();}g.globalAlpha=1;}
  PR.bg=z;return c;};}
{const o=gatesFor;gatesFor=function(z){if(isPro(z))return [];return o.apply(this,arguments);};}
{const o=edgeProps;edgeProps=function(z){if(isPro(z))return [];return o.apply(this,arguments);};}
{const o=loadPropsFor;loadPropsFor=function(z){if(z===VOID)return voidProps();if(z===FOREST)return forestProps();return o.apply(this,arguments);};}
let moving=false;
/* the map list (p148) only lets the shipped maps load; our two maps pass through it only during our own load call */
function enter(z,pos){const h=Set.prototype.has;moving=true;Set.prototype.has=function(v){if(v===z&&this.size>=14&&h.call(this,MAP1)&&h.call(this,'w24_map9f7_test'))return true;return h.call(this,v);};
  try{loadZone(z,pos);}finally{Set.prototype.has=h;moving=false;}
  if(isPro(z)){const want=z===VOID?voidProps():forestProps();if(PROPS.length!==want.length){PROPS.length=0;PROPS.push(...want);}try{buildSolids();}catch(_){}
    try{$('#banner').classList.remove('show');G.banner=0;}catch(_){}
    if(z===VOID&&S&&S.cur==='pro_03_trial')spawnDummies();}
  PR.stats.enter++;say('enter '+z);}
/* Lysel, pedestals and dummies block their footprint like solid props */
function addSolid(x,y,r){const o={x,y,r};SOLIDS.push(o);const pad=r+50;for(let gx=Math.floor((x-pad)/SCELL);gx<=Math.floor((x+pad)/SCELL);gx++)for(let gy=Math.floor((y-pad)/SCELL);gy<=Math.floor((y+pad)/SCELL);gy++){const k=gx+','+gy;let l=SGRID.get(k);if(!l)SGRID.set(k,l=[]);l.push(o);}}
{const o=buildSolids;buildSolids=function(){const r=o.apply(this,arguments);try{if(G.zone===VOID){addSolid(LYS.x,LYS.y,24);for(const q of PED)addSolid(q.x,q.y,30);if(S&&S.cur==='pro_03_trial')for(const [x,y] of DUM)addSolid(x,y,15);}}catch(e){PR.err='solid '+e.message;}return r;};}
function leave(z,pos){moving=true;try{loadZone(z,pos);}finally{moving=false;}}
/* no warping out of the prologue (map / teleport menus) until it is finished */
{const o=travel;travel=function(to){if(S&&!S.flags.prologueDone&&isPro(G.zone)&&!moving){PR.stats.blocked++;try{notify('จบบทนำก่อนนะ');}catch(_){}return;}return o.apply(this,arguments);};}
{const o=loadZone;loadZone=function(zid){if(S&&!S.flags.prologueDone&&isPro(G.zone)&&!moving&&G.state==='play'&&zid!==G.zone){PR.stats.blocked++;try{notify('จบบทนำก่อนนะ');}catch(_){}return;}return o.apply(this,arguments);};}
{const o=chBackToSelect;chBackToSelect=function(){moving=true;try{return o.apply(this,arguments);}finally{moving=false;S=null;PR.state=null;closeDlg();showUI(false);}};}
/* ---------- training dummies: Astoria art, never die, never fight back, no EXP / drops ---------- */
function spawnDummies(){for(let i=enemies.length-1;i>=0;i--)if(enemies[i]&&enemies[i].qDummy)enemies.splice(i,1);for(const [x,y] of DUM){const e=makeEnemy('devdummy',1,x+2,y+6);e.qDummy=1;e.sx0=e.x;e.sy0=e.y;e.maxHp=e.hp=1e9;e.sp=0;e.aggro=false;e.atk=0;e.sz=22;enemies.push(e);}}
{const o=drawEnemy;drawEnemy=function(e){if(e&&e.qDummy)return;return o.apply(this,arguments);};}
{const o=killEnemy;killEnemy=function(e){if(e&&e.qDummy){e.hp=e.maxHp;e.dead=false;return;}return o.apply(this,arguments);};}
/* ---------- UI: dialogue box, thought text, tracker, action button ---------- */
const css=document.createElement('style');css.id='p326';css.textContent=
 '#qDlg{position:fixed;left:50%;bottom:150px;transform:translateX(-50%);width:min(640px,92vw);z-index:80;background:rgba(18,16,30,.92);border:2px solid #d9b65c;border-radius:12px;padding:10px 14px 8px;color:#fff6e0;font:15px/1.55 Sarabun,sans-serif;box-shadow:0 4px 18px rgba(0,0,0,.45);cursor:pointer;user-select:none}'
 +'#qDlg.pf{padding-left:100px;min-height:92px}#qDlg img.pf{position:absolute;left:8px;bottom:6px;width:86px;height:86px;border-radius:10px;background:radial-gradient(#fff6dc,#e8d9b0);border:1px solid #d9b65c;object-fit:cover}'
 +'#qDlg .nm{font-weight:700;color:#ffd36b;font-size:14px;margin-bottom:2px}#qDlg .tx{min-height:2.9em;white-space:pre-line}#qDlg .tx.nar{font-style:italic;color:#e8e2cf}'
 +'#qDlg .nx{text-align:right;font-size:12px;color:#c9b98a;background:none;border:0;box-shadow:none;width:auto;height:auto;position:static}#qDlg .ch{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}#qDlg .ch button{flex:1;min-width:120px;padding:8px 10px;border-radius:8px;border:1px solid #d9b65c;background:#2a2440;color:#fff6e0;font:600 14px Sarabun,sans-serif;cursor:pointer}'
 +'#qDlg .ch button:hover,#qDlg .ch button:focus-visible{background:#4a3c70;outline:none}'
 +'#qThink{position:fixed;left:50%;top:24%;transform:translateX(-50%);z-index:79;color:#fffaf0;font:italic 600 18px Sarabun,sans-serif;text-shadow:0 1px 4px #000,0 0 10px rgba(0,0,0,.6);pointer-events:none;opacity:0;transition:opacity .5s;text-align:center;max-width:90vw}'
 +'#qTrack{position:fixed;right:10px;top:84px;z-index:56;width:220px;background:rgba(14,18,28,.78);border:1px solid rgba(217,182,92,.7);border-radius:10px;padding:7px 10px;color:#f4ecd6;font:13px/1.45 Sarabun,sans-serif;pointer-events:none}'
 +'#qTrack .h{color:#ffd36b;font-weight:700;font-size:12px;letter-spacing:.03em}#qTrack .t{font-weight:700}#qTrack ul{margin:3px 0 0;padding:0;list-style:none}#qTrack li{display:flex;gap:6px;pointer-events:auto;cursor:pointer;border-radius:5px;padding:0 3px}#qTrack li:hover{background:rgba(255,255,255,.08)}#qTrack .hint{font-size:11px;color:#c9b98a}#qTrack li.ok{color:#9ff5b0}'
 +'#qAct{position:fixed;left:50%;bottom:118px;transform:translateX(-50%);z-index:78;padding:9px 18px;border-radius:22px;border:2px solid #d9b65c;background:rgba(30,24,50,.92);color:#fff6e0;font:700 15px Sarabun,sans-serif;cursor:pointer;display:none}'
 +'#qAct kbd{font:600 11px sans-serif;background:#d9b65c;color:#1a1424;border-radius:4px;padding:0 4px;margin-right:6px}'
 +'#qFlash{position:fixed;inset:0;z-index:90;background:#fff;opacity:0;pointer-events:none;transition:opacity .9s}'
 +'@media (hover:none){#qAct kbd{display:none}#qTrack{width:180px;font-size:12px;top:70px}#qDlg{bottom:120px;font-size:14px}#qDlg.pf{padding-left:76px;min-height:70px}#qDlg img.pf{width:62px;height:62px}}';
document.head.appendChild(css);
const el=(t,id)=>{const d=document.createElement(t);d.id=id;document.body.appendChild(d);return d;};
const dlg=el('div','qDlg'),think=el('div','qThink'),track=el('div','qTrack'),act=el('button','qAct'),flash=el('div','qFlash');dlg.hidden=true;track.hidden=true;act.type='button';
let DQUEUE=null;   // {lines:[{who,text,nar}],i,choices,done}
function openDlg(lines,done,choices){DQUEUE={lines,i:0,done,choices};paint();}
function closeDlg(){DQUEUE=null;dlg.hidden=true;}
function paint(){const D=DQUEUE;if(!D){dlg.hidden=true;return;}const L=D.lines[D.i];const last=D.i===D.lines.length-1;
  dlg.innerHTML='';const fc=L.face!=null&&ART['face'+L.face];dlg.classList.toggle('pf',!!fc);if(fc){const im=document.createElement('img');im.className='pf';im.alt='';im.src=fc.src;dlg.appendChild(im);}const nm=document.createElement('div');nm.className='nm';nm.textContent=L.who||'';const tx=document.createElement('div');tx.className='tx'+(L.nar?' nar':'');tx.textContent=L.text;dlg.append(nm,tx);
  if(last&&D.choices){const ch=document.createElement('div');ch.className='ch';D.choices.forEach((c,k)=>{const b=document.createElement('button');b.type='button';b.textContent=c.label;b.dataset.k=k;ch.appendChild(b);});dlg.appendChild(ch);}
  else{const nx=document.createElement('div');nx.className='nx';nx.textContent=last?'แตะเพื่อปิด':'แตะเพื่อไปต่อ ▸';dlg.appendChild(nx);}
  dlg.hidden=false;}
function stepDlg(k){const D=DQUEUE;if(!D)return;const last=D.i===D.lines.length-1;
  if(last&&D.choices){if(k==null)return;const c=D.choices[k];DQUEUE=null;dlg.hidden=true;D.done&&D.done(c);return;}
  if(!last){D.i++;paint();return;}DQUEUE=null;dlg.hidden=true;D.done&&D.done();}
for(const t of ['pointerdown','mousedown','mouseup','touchstart','touchend'])dlg.addEventListener(t,e=>{e.stopPropagation();});
dlg.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();const b=e.target.closest('button');stepDlg(b?+b.dataset.k:null);});
let thinkT=null;function thought(s){think.textContent=s;think.style.opacity=1;clearTimeout(thinkT);thinkT=setTimeout(()=>{think.style.opacity=0;},3200);say('think '+s);}
const who=id=>{const n=NPC[id];return n?(n.title?n.title+' ':'')+n.name:'';};
const lines=(id,arr,face)=>(arr||[]).map(t=>({who:who(id),text:t,face:id==='npc_angel_lysel'?(face||0):null}));
function showUI(on){track.hidden=!on;if(!on)act.style.display='none';}
/* ---------- weapon kit bridge (filled from the skill survey) ---------- */
/* skill table = the weapon skill window (__WSK.lines[w].cols[0..1] = attack + support, cols[2] = passives); rows open by player Lv (__WSK.cfg.unlock);
   every active skill writes P.cds[cdId] when it is cast, so a rising cooldown = "used" (works for keys, phone buttons and taps alike) */
const KIT=(()=>{const W=window.__WSK;if(!W||!W.lines||!W.cfg)return null;let unl=null,snap={},cb=null;
  const list=w=>{if(w==='holy')return HOLYL();const L=W.lines[w];if(!L||!L.cols)return [];return L.cols.slice(0,/[?&]trial5=off\b/.test(Q)?2:1).flatMap(c=>c.skills||[]).filter(x=>x&&x.cdId).map(x=>({id:x.cdId,k:x.k,name:x.name,start:x.start}));};
  return {skills:list,
    equip(t){if(!/[?&]prologue_oldequip=on\b/.test(Q))return EQUIPNEW(t);const w=()=>P.weapon&&P.weapon.t;if(w()===t)return;
      if(w()==='bow'&&window.BOW)BOW.toggle();else if(w()==='staff'&&window.STF)STF.toggle();else if(w()==='dagger'&&window.DGR)DGR.toggle();
      if(t==='bow'&&w()!=='bow')BOW.toggle();else if(t==='staff'&&w()!=='staff')STF.toggle();
      else if(t==='sword'&&w()!=='sword'){let i=P.inv.findIndex(x=>x&&x.kind==='wpn'&&x.t==='sword');if(i<0){P.inv.push(makeWeapon('sword',P.lvl||1,0));i=P.inv.length-1;}equipItem(i);}
      try{buildBar();}catch(_){}try{buildTouchSkills();}catch(_){}},
    open(){if(!unl)unl=W.cfg.unlock.slice();W.cfg.unlock=W.cfg.unlock.map(()=>1);try{if(window.HOLYW&&HOLYW.on&&!(S&&S.weapon==='holy'))HOLYW.toggle();}catch(_){}snap={};},
    restore(){if(unl){W.cfg.unlock=unl;unl=null;}try{P.cds={};}catch(_){}try{P.mp=Math.min(P.mp,P.maxMp);}catch(_){}},
    keep(){const c=P.cds||{};for(const id in c){const v=c[id]||0;if(v>(snap[id]||0)+.05&&cb)cb(id);if(v>1)c[id]=1;snap[id]=c[id]||0;}P.mp=P.maxMp;P.hp=P.maxHp;
      for(const e of enemies)if(e.qDummy){e.x=e.sx0;e.y=e.sy0;e.sx=e.x;e.sy=e.y;e.vx=0;e.vy=0;}},
    used(f){cb=f;},
    cast(id,w){const x=list(w).find(q=>q.id===id);if(x&&typeof x.start==='function')x.start();}};})();
/* ---------- quest engine ---------- */
function startQ(id){S.cur=id;const q=QBY[id];say('start '+id);
  if(id==='pro_01_awaken'){thought((q.dialogue.before||[])[0]||'');}
  if(id==='pro_03_trial'){S.used={};trialOpen(true);if(G.zone===VOID){try{spawnDummies();buildSolids();}catch(e){PR.err='dum '+e.message;}}}
  if(id==='pro_06_forest_path'){setTimeout(()=>thought((q.dialogue.start||[])[0]||''),700);setTimeout(()=>{ORB.on=true;ORB.x=P.x;ORB.y=P.y-30;ORB.i=1;thought((q.dialogue.orb||[])[0]||'');},4300);}
  saveGame();renderTrack();}
function doneQ(id,next){S.done[id]=1;say('done '+id);const n=next?QBY[next]:nextOf(id);if(n)startQ(n.id);else{S.cur=null;renderTrack();saveGame();}}
function objective(){const q=QBY[S&&S.cur];return q&&q.objectives&&q.objectives[0];}
function canTalkLysel(){return S&&S.cur&&['pro_01_awaken','pro_03_trial','pro_04_answer'].includes(S.cur);}
function talkLysel(){PR.stats.talks++;const id=S.cur,q=QBY[id];
  if(id==='pro_01_awaken'){openDlg(lines(q.giver,q.dialogue.talk),()=>doneQ(id));return;}
  if(id==='pro_03_trial'){if(trialLeft().length){openDlg(lines(q.giver,q.dialogue.inProgress,1),null);return;}doneQ(id);return;}
  if(id==='pro_04_answer'){const o=q.objectives[0];openDlg(lines(q.giver,q.dialogue.ask),c=>{
      if(c.resetsFrom){openDlg(lines(q.giver,q.dialogue.retry,2),()=>{trialOpen(false);for(const k of [c.resetsFrom,'pro_03_trial','pro_04_answer'])delete S.done[k];startQ(c.next);});}
      else{doneQ(id,c.next);rebirth();}},o.choices);}}
function pick(w){const id=S.cur,q=QBY[id];if(id!=='pro_02_choose_weapon')return;PR.stats.picks++;
  try{if(KIT)KIT.equip(w);}catch(e){PR.err='equip '+e.message;}S.weapon=w;
  openDlg([{who:'',text:q.dialogue.pedestal[w],nar:true}].concat(lines(q.giver,q.dialogue.after)),()=>doneQ(id));}
function trialSkills(){try{return KIT?KIT.skills(S.weapon||(P.weapon&&P.weapon.t)):[];}catch(_){return [];}}
function trialLeft(){return trialSkills().filter(s=>!S.used[s.id]);}
let trialOn=false;function trialOpen(on){if(on===trialOn)return;trialOn=on;try{if(KIT)on?KIT.open(S.weapon):KIT.restore();}catch(e){PR.err='trial '+e.message;}}
function onCast(id){if(!S||S.cur!=='pro_03_trial'||G.zone!==VOID)return;if(!trialSkills().some(s=>s.id===id)||S.used[id])return;S.used[id]=1;PR.stats.casts++;renderTrack();
  if(!trialLeft().length){thought('ลองครบทุกท่าแล้ว กลับไปคุยกับไลเซล');doneQ('pro_03_trial');}}
PR.onCast=onCast;if(/[?&]gm=on\b/.test(Q))PR.__test={path:function(){return PATH},st:function(){return S},rebirth:function(race){try{if(race&&typeof P!=='undefined'&&P){P.pLook=P.pLook||{};P.pLook.race=race}if(!S)S=fresh();rebirth();return true}catch(e){PR.err='test '+e.message;return false}},ver:'r1'};
function rebirth(){const q=QBY.pro_05_rebirth;openDlg(lines(q.giver,q.dialogue.talk,2),()=>{
  flash.style.transition='opacity .9s';flash.style.opacity=1;
  setTimeout(()=>{trialOpen(false);S.flags.prologueDone=true;S.flags.startingWeapon=S.weapon||(P.weapon&&P.weapon.t)||null;
    try{const n0=P.inv.length;if(/[?&]probag=old\b/.test(Q))P.inv=P.inv.filter(x=>!(x&&x.kind==='wpn'&&['sword','bow','staff'].includes(x.t)&&(x.lvl|0)<=1&&!(x.refine>0)));else P.inv=[];PR.stats.trialWpnRemoved=n0-P.inv.length;}catch(_){}
    enter(FOREST,{x:PATH[0][0],y:PATH[0][1]-10});doneQ('pro_05_rebirth');setTimeout(ENSUREW,60);setTimeout(ENSUREW,400);setTimeout(ENSUREW,2500);
    setTimeout(()=>{flash.style.transition='opacity 1.6s';flash.style.opacity=0;},250);},1100);});}
function exitForest(){const q=QBY.pro_06_forest_path;if(S.cur!==q.id||PR.exiting)return;PR.exiting=true;ORB.on=false;thought((q.dialogue.exit||[])[0]||'');
  setTimeout(()=>{flash.style.transition='opacity .7s';flash.style.opacity=1;setTimeout(()=>{leave(MAP1,Object.assign({},MAP1_IN));doneQ(q.id);showUI(false);setTimeout(ENSUREW,60);setTimeout(ENSUREW,400);setTimeout(ENSUREW,2500);setTimeout(ENSUREW,8000);PR.exiting=false;
    setTimeout(()=>{flash.style.transition='opacity 1.2s';flash.style.opacity=0;},200);},800);},1400);}
function renderTrack(){if(!S||!S.cur||S.flags.prologueDone&&S.cur!=='pro_06_forest_path'){track.hidden=true;return;}const q=QBY[S.cur];if(!q){track.hidden=true;return;}
  const o=q.objectives[0],txt={talk:'คุยกับ'+(NPC[o.target]?NPC[o.target].name:''),interact:'เลือกอาวุธจากแท่น 1 แท่น',use_all_skills:'ใช้ทุกท่ากับหุ่นซ้อม',talk_choice:'กลับไปคุยกับ'+(NPC[o.target]?NPC[o.target].name:''),cutscene:'',reach:'เดินตามแสงไปขอบป่า'}[o.kind]||'';
  let h='<div class="h">เควสบทนำ</div><div class="t"></div><div class="o"></div>';track.innerHTML=h;track.querySelector('.t').textContent=q.name;track.querySelector('.o').textContent=txt;
  if(o.kind==='use_all_skills'){const ul=document.createElement('ul');for(const s of trialSkills()){const li=document.createElement('li');li.dataset.sk=s.id;li.title='แตะเพื่อใช้ท่านี้';li.className=S.used[s.id]?'ok':'';li.textContent=(S.used[s.id]?'✓ ':'○ ')+s.name;ul.appendChild(li);}track.appendChild(ul);const hn=document.createElement('div');hn.className='hint';hn.textContent='แตะชื่อท่าเพื่อใช้ หรือใช้ปุ่มสกิลตามปกติ';track.appendChild(hn);}
  track.hidden=false;}
/* ---------- action button (talk / pick) ---------- */
let ACT=null;
function nearAct(){if(!S||G.state!=='play'||DQUEUE||PR.exiting)return null;
  if(G.zone===VOID){if(canTalkLysel()&&Math.hypot(P.x-LYS.x,(P.y-LYS.y)/.7)<120)return {k:'talk',label:'คุยกับ'+NPC.npc_angel_lysel.name};
    if(S.cur==='pro_02_choose_weapon')for(const p of PED)if(Math.hypot(P.x-p.x,(P.y-p.y-40)/.7)<95)return {k:'pick',w:p.w,label:'เลือก'+WNAME[p.w]};}
  return null;}
const WNAME={sword:'ดาบ',bow:'ธนู',staff:'คทาเวท',holy:'คทาพระ',dagger:'มีดสั้น'};
function doAct(){const a=ACT;if(!a)return;act.style.display='none';if(a.k==='talk')talkLysel();else if(a.k==='pick')pick(a.w);}
for(const t of ['pointerdown','mousedown','mouseup','touchstart','touchend'])act.addEventListener(t,e=>{e.stopPropagation();});
for(const t of ['pointerdown','mousedown','mouseup','touchstart','touchend'])track.addEventListener(t,e=>{if(e.target.closest('li'))e.stopPropagation();});
track.addEventListener('click',e=>{const li=e.target.closest('li[data-sk]');if(!li||!KIT||!S)return;e.stopPropagation();e.preventDefault();try{KIT.cast(li.dataset.sk,S.weapon||P.weapon.t);}catch(er){PR.err='tap '+er.message;}});
act.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();doAct();});
addEventListener('keydown',e=>{try{if(!S||(!isPro(G.zone)&&!DQUEUE))return;const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'))return;
  if(DQUEUE&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.stopImmediatePropagation();if(!DQUEUE.choices||DQUEUE.i<DQUEUE.lines.length-1)stepDlg(null);return;}
  if(DQUEUE&&DQUEUE.choices&&DQUEUE.i===DQUEUE.lines.length-1&&/^[1-4]$/.test(e.key)&&+e.key<=DQUEUE.choices.length){e.preventDefault();e.stopImmediatePropagation();stepDlg(+e.key-1);return;}
  if(DQUEUE&&!isPro(G.zone)&&(e.key==='Escape')){e.preventDefault();e.stopImmediatePropagation();closeDlg();return;}
  if(ACT&&e.key==='Enter'){e.preventDefault();e.stopImmediatePropagation();doAct();}}catch(er){PR.err='key '+er.message;}},true);
/* ---------- spark orb (pro_06) ---------- */
const ORB={on:false,x:0,y:0,i:1};
function orbTick(dt){if(!ORB.on)return;const tg=PATH[Math.min(ORB.i,PATH.length-1)],d=Math.hypot(tg[0]-ORB.x,tg[1]-ORB.y),lead=Math.hypot(P.x-ORB.x,P.y-ORB.y);
  const sp=lead<200?170:lead<300?70:0;if(d<20&&ORB.i<PATH.length-1)ORB.i++;else if(d>1){ORB.x+=(tg[0]-ORB.x)/d*Math.min(d,sp*dt);ORB.y+=(tg[1]-ORB.y)/d*Math.min(d,sp*dt);}}
/* ---------- tick ---------- */
let NEWCHAR=false,checked=false;
{const o=chCreate;chCreate=function(){NEWCHAR=true;checked=false;S=null;return o.apply(this,arguments);};}
{const o=startGame;startGame=function(){checked=false;S=null;PR.state=null;closeDlg();showUI(false);return o.apply(this,arguments);};}
function decide(){checked=true;const saved=readSaved();
  if(saved&&saved.v){S=saved;}else if(NEWCHAR){S=fresh();}else{S=fresh();S.flags.prologueDone=true;S.flags.legacy=true;}   // characters made before this build skip the prologue
  NEWCHAR=false;PR.state=S;say('decide '+JSON.stringify({cur:S.cur,done:S.flags.prologueDone}));
  if(S.flags.prologueDone){if(S.cur==='pro_06_forest_path'){enter(FOREST,{x:PATH[0][0],y:PATH[0][1]-10});ORB.on=true;ORB.x=P.x;ORB.y=P.y-30;ORB.i=1;renderTrack();}return;}
  if(S.weapon&&KIT){try{KIT.equip(S.weapon);}catch(_){}}
  if(!S.weapon&&!/[?&]prologue_oldequip=on\b/.test(Q)){try{EQUIPNEW('fist');}catch(e){PR.err='fist '+e.message;}}enter(VOID,{x:LYS.x,y:LYS.y+300});
  if(!S.cur)startQ(firstQ.id);else{if(S.cur==='pro_03_trial'){trialOn=false;trialOpen(true);try{spawnDummies();}catch(_){}}renderTrack();if(S.cur==='pro_01_awaken')thought((QBY.pro_01_awaken.dialogue.before||[])[0]||'');}}
function tick(dt){
  if(!checked){if(G.state==='play'&&P&&!P.dead&&!G.fade&&typeof SAVE_KEY!=='undefined')decide();return;}
  if(!S)return;
  if(S.cur!=='pro_03_trial'&&G.zone===VOID&&enemies.some(e=>e&&e.qDummy)){for(let i=enemies.length-1;i>=0;i--)if(enemies[i]&&enemies[i].qDummy)enemies.splice(i,1);try{buildSolids();}catch(_){}}
  if(isPro(G.zone)){P.hp=Math.max(P.hp,1);if(trialOn)try{KIT&&KIT.keep&&KIT.keep();}catch(_){}}
  if(trialOn&&!isPro(G.zone))trialOpen(false);
  const a=nearAct();ACT=a;if(a){act.innerHTML='';const k=document.createElement('kbd');k.textContent='Enter';act.append(k,document.createTextNode(a.label));act.style.display='block';}else act.style.display='none';
  if(G.zone===FOREST){orbTick(dt);if(S.cur==='pro_06_forest_path'&&P.y<120&&Math.abs(P.x-PATH[PATH.length-1][0])<160)exitForest();}
  if(isPro(G.zone)&&track.hidden&&S.cur)renderTrack();}
{const o=update;update=function(dt){const r=o.apply(this,arguments);try{tick(dt);}catch(e){PR.err='tick '+e.message;}return r;};}
/* ---------- world drawing: Lysel stand-in, pedestals, markers, orb ---------- */
const GL={};function glow(col){return GL[col]||(GL[col]=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,col);r.addColorStop(.35,col+'aa');r.addColorStop(1,col+'00');g.fillStyle=r;g.fillRect(0,0,64,64);return c;})());}
const WICON={};function wIcon(w){if(WICON[w])return WICON[w];const i=new Image();try{i.src=itemIcon({kind:'wpn',t:w,rar:1,lvl:1,name:WNAME[w]});}catch(_){}return WICON[w]=i;}
function txt(s,x,y,col,sz,a){ctx.save();ctx.globalAlpha=a==null?1:a;ctx.font='bold '+(sz||13)+'px Sarabun,sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='rgba(20,16,30,.85)';ctx.strokeText(s,x,y);ctx.fillStyle=col;ctx.fillText(s,x,y);ctx.restore();}
function drawLysel(){const t=clk(),x=LYS.x,y=LYS.y,b=Math.sin(t*1.6)*4;
  ctx.save();ctx.globalAlpha=.35;ctx.fillStyle='#b8a878';ctx.beginPath();ctx.ellipse(x,y+4,26*LYK,8*LYK,0,0,6.283);ctx.fill();ctx.restore();
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.55;ctx.drawImage(glow('#ffe9a8'),x-60*LYK,y-130*LYK+b,120*LYK,140*LYK);ctx.globalAlpha=.9;ctx.drawImage(glow('#ffd36b'),x+10,y-70+b,26,26);ctx.restore();
  // L1: 2 frames (wings down / up) swapped on the wing beat, feet float 14px above the shadow
  let top=y-110+b;const M=ART.lyMeta,fr=ART[(t*1.25%1)<.5?'ly0':'ly1'];
  const _t3=window.NPC3QDRAW?NPC3QDRAW('lysel',x,y-14+b):null;if(_t3!=null){top=_t3+8}else if(M&&ok(fr)){const H=150*LYK,sc=H/M.h,W=M.w*sc;ctx.drawImage(fr,x-M.cx*sc,y-14+b-M.footY*sc,W,H);top=y-14+b-M.footY*sc+8;}
  else{ctx.save();ctx.strokeStyle='rgba(217,182,92,.9)';ctx.setLineDash([5,4]);ctx.lineWidth=2;ctx.strokeRect(x-24,y-92+b,48,88);ctx.restore();txt('รอภาพ',x,y-46+b,'#a07a20',12);PR.stats.lyMissing=(PR.stats.lyMissing||0)+1;}
  txt(NPC.npc_angel_lysel.name,x,y+24*LYK,'#ffd36b',13);
  const mk=S&&(S.cur==='pro_01_awaken'?'!':S.cur==='pro_04_answer'?'?':null);if(mk){const bb2=Math.sin(t*4)*3;txt(mk,x,top+b*0+bb2,'#ffd36b',30);}}
function drawPed(p){const t=clk(),b=Math.sin(t*1.4+p.x)*3,on=S&&S.cur==='pro_02_choose_weapon',sel=S&&S.weapon===p.w;
  ctx.save();ctx.globalAlpha=.3;ctx.fillStyle='#b8a878';ctx.beginPath();ctx.ellipse(p.x,p.y+6,30,8,0,0,6.283);ctx.fill();ctx.restore();
  ctx.save();ctx.translate(p.x,p.y-14+b);const PM=ART.pedMeta;let iy=-52;
  if(PM&&ok(ART.ped)){const W=86,H=W*PM.h/PM.w;ctx.drawImage(ART.ped,-W/2,-H*.62,W,H);iy=-H*.62+H*.2-34;}   // L3: weapon sits on the top face (~20% down the art)
  else{const g=ctx.createLinearGradient(0,-10,0,14);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#e8dcc0');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,30,11,0,0,6.283);ctx.fill();ctx.strokeStyle='#d9b65c';ctx.lineWidth=2.5;ctx.stroke();}
  if(on){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.5+.25*Math.sin(t*3);ctx.drawImage(glow(({bow:'#3fd6a0',staff:'#7b5cff',holy:'#fff2b0',dagger:'#b070ff'})[p.w]||'#ffe9a8'),-34,iy-8,68,68);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;}
  const ic=wIcon(p.w);if(ic.complete&&ic.naturalWidth)ctx.drawImage(ic,-20,iy,40,40);ctx.restore();
  txt(WNAME[p.w]+(sel?' ✓':''),p.x,p.y+26,'#6a5420',12);}
let DIMG=null;const DA={sc:.06378,ax:513,ay:1072};   // Astoria training-yard dummy piece (m3tr_dummy): scale + anchor from its art data
function drawDummy(x,y){try{const SA=SYLVA_ART.m3tr_dummy,A=Object.assign({},DA,(typeof PROP_DEFS!=='undefined'&&PROP_DEFS.m3Tr_dummy)||{});if(!SA)return;if(!DIMG){DIMG=imgOf(SA.src);}if(!DIMG||!DIMG.naturalWidth)return;const sc=A.sc||DA.sc;
  ctx.save();ctx.globalAlpha=.28;ctx.fillStyle='#8a7a58';ctx.beginPath();ctx.ellipse(x,y+2,18,6,0,0,6.283);ctx.fill();ctx.restore();const H=92,W=H*DIMG.naturalWidth/DIMG.naturalHeight;ctx.drawImage(DIMG,x-W/2,y-H*.97,W,H);}catch(e){PR.err='dummy '+e.message;}}
function drawWorld(top){if(!S)return;
  if(G.zone===VOID){const front=e=>P.y>e;   // y-sort against the hero only
    if(S&&S.cur==='pro_03_trial')for(const [x,y] of DUM)if(front(y)!==top)drawDummy(x,y);
    for(const p of PED)if(front(p.y)!==top)drawPed(p);if(front(LYS.y)!==top)drawLysel();}
  if(G.zone===FOREST&&ORB.on&&top){const t=clk();ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.9;ctx.drawImage(glow('#fff2b0'),ORB.x-34,ORB.y-62+Math.sin(t*3)*5,68,68);ctx.drawImage(glow('#ffffff'),ORB.x-12,ORB.y-40+Math.sin(t*3)*5,24,24);ctx.globalAlpha=.7;
    for(let i=0;i<4;i++){const a=t*2+i*1.57;ctx.drawImage(glow('#ffd36b'),ORB.x+Math.cos(a)*14-5,ORB.y-28+Math.sin(a)*6-5+Math.sin(t*3)*5,10,10);}ctx.restore();}}
{const o=drawRaidTele;drawRaidTele=function(){const r=o.apply(this,arguments);try{if(isPro(G.zone))drawWorld(false);}catch(e){PR.err='draw0 '+e.message;}return r;};}
{const o=drawParts;drawParts=function(){const r=o.apply(this,arguments);try{if(isPro(G.zone))drawWorld(true);}catch(e){PR.err='draw1 '+e.message;}return r;};}
/* ---------- skill-use detection for pro_03 ---------- */
try{if(KIT&&KIT.used)KIT.used(onCast);}catch(e){PR.err='hook '+e.message;}
PR.ui={openDlg,closeDlg,stepDlg,thought,isOpen:()=>!!DQUEUE,flash:typeof flashTo==='function'?flashTo:null};   // shared with p327 (chapter 1 quests)
PR.api={enter,startQ,doneQ,pick,talkLysel,stepDlg,trialSkills,trialLeft,ORB,LYS,PED,PATH,MAP1_IN,state:()=>S};
PR.ok=true;
}catch(e){PR.err=e.message;PR.ok=false;}
})();

