
/* ---- p322 r1: Map 8 "ยอดน้ำแข็ง" monsters (DeaRz 27 Oct 10:56 "ม่อนใหม่เริ่มได้เลย"). TEST: ?m8mob=off = the old safe walk-through Map 8.
   Species = p315 art (Frostquill Porcupine, Rimeguard Knight, Hollow Lantern + fireball), stats = balance/new_monsters_r1/NOTE_20261026_new_monsters_stats.md:
   the game's live role row (C182.monStats; Knight = elite row, no promoteElite, no affix) x hpMul / atkMul / defMul / evaMul / expMul (the note: "the multipliers rule,
   not the absolute numbers"). The live rows already grow above Lv 30 (live ordinary ATK Lv36 = the note's 198.1), so no extra Lv>30 ATK factor.
   Live HP rows are about 1/3.6 of rows_v2p.json, so HP is lower than the note's table; ATK / DEF / EXP match it.
   Zones = art/map8/draw_map8_layout_v6.py (DeaRz markup 11:55), concept px x (KX, KY). Population is my provisional plan (no balance population spec yet):
   1 south plain Lv30-31 Lantern x3 · 2 frozen lake Lv31-32 Frostquill x3 + Lantern x3 · 3 north ring Lv32-34 Knight + Frostquill x4 + Lantern x2 ·
   5 S/W ledge Lv35-36 Knight (leash 300) + Lantern · 4 back ledge Lv35-36 Frostquill + Lantern = 20 (2 Knights; r2 = balance 27 Oct: Z4 / Z5 thinner). Zone 6 (post walkway) is the gorge bridge deck: no homes there (bridge drawing order is per hero only).
   Species minimum level wins (Frostquill / Knight from Lv 32).
   Rules as Map 6: member respawn 50-80 s, zone cleared 90-120 s (Knight x2), never refill during a fight, homes spread (Knight 300 px apart), spawn >= 360 px
   from the hero, chase ends outside the zone / in a safe area / past the leash, then the monster walks home at full HP.
   SAFE: the south gate yard and the summit (lantern + stairs). Homes only on ground reachable from the gate (20 px grid flood over the collision),
   never on the two bridge decks. While the hero is up on the sky deck (level 2) monsters hold still and do not notice the hero. ---- */
(function(){'use strict';
const Q=location.search;const NP=window.M8POP={ver:'p322-r2',on:!/m8mob=off/.test(Q),ok:false,err:[],stats:{spawn:{},rej:{},respawns:0,kills:0,resets:0,pulls:0,minSpawnDist:null,held:0,safeDrops:0},members:[],zones:null,where:null};
if(!NP.on)return;
const M4=window.__M4T,D=window.__M8_DATA;const M8=M4&&M4.map8;if(!M4||!M8||!D||typeof ZONES==='undefined'||!ZONES[M8.id]){NP.err.push('map 8 missing');return;}
const ID=M8.id,KX=D.KX,KY=D.KY,now=()=>(typeof time==='number'?time:0);
const Z8=ZONES[ID];Z8.safe=0;Z8.fullSafe=0;Z8.sub='Map 8 · Lv 30–36';Z8.n='Map 8';
/* ---------- species ---------- */
const SPC={
  frostquill:{name:'Frostquill Porcupine',stable_id:'m8_frostquill',lv:[32,36],role:'ordinary',hpMul:1.3,atkMul:1.0,defMul:1.3,expMul:1.4,evaMul:.6,speed:60,atkRange:130,atkInt:[1.8,2.4],windup:.6,atkCoef:1.1,mode:'aggressive',join:'solo',joinR:170,aggro:.7,leash:420,respMul:1,lootFrom:'stoneboar'},
  rimeguard:{name:'Rimeguard Knight',stable_id:'m8_rimeguard',lv:[32,36],role:'elite',hpMul:.75,atkMul:.85,defMul:1.0,expMul:1.0,evaMul:.6,speed:42,atkRange:140,atkInt:[3.0,3.4],windup:.5,atkCoef:1.25,mode:'aggressive',join:'solo',joinR:170,aggro:.6,leash:340,respMul:2,lootFrom:'ruinwarden_m4'},
  hollowlantern:{name:'Hollow Lantern',stable_id:'m8_hollowlantern',lv:[30,36],role:'ordinary',hpMul:.7,atkMul:1.0,defMul:.6,expMul:1.0,evaMul:1.4,speed:80,atkRange:220,atkInt:[2.2,3.0],windup:.6,atkCoef:1.0,mode:'aggressive',join:'pack',joinR:170,aggro:.9,leash:480,respMul:1,lootFrom:'galefeather'}};
const TYPES=Object.keys(SPC);
let SPREADY=false;
function species(){if(SPREADY)return true;
  try{if(window.__NEWMON&&__NEWMON.pick)__NEWMON.pick('frostquill');}catch(_){}   // p315 register() (MOBS / MOBX / element); pick itself stops outside the Studio
  const SPD=window.W22&&W22.sp10&&W22.sp10.data;if(!SPD){NP.err.push('species layer missing');return false;}
  for(const t of TYPES){if(!MOBS[t]){NP.err.push('no MOBS '+t);return false;}const s=SPC[t];
    if(!SPD[t]){const src=SPD[s.lootFrom]||{};SPD[t]=Object.assign({id:t},s,{loot:Object.assign({},src.loot||{})});}}
  /* sprites: the p315 records are Studio-only; on Map 8 they are used too (same way Map 6 opens the Gale Feather art) */
  const REG=window.MON_SPRITES;if(!REG||!REG.byType)return false;
  for(const t of TYPES){const R=REG.byType[t];if(!R){NP.err.push('no sprite '+t);return false;}if(R.data.m8scope)continue;R.data.m8scope=1;
    const d=Object.getOwnPropertyDescriptor(R.data,'scope'),old=d&&d.get?d.get:()=>d?d.value:'studio';
    Object.defineProperty(R.data,'scope',{configurable:true,get(){return (typeof G!=='undefined'&&G.zone===ID)?'map8test':old.call(R.data);}});}
  return SPREADY=true;}
/* stats: outermost makeEnemy layer */
function nmStats(e){const s=e&&SPC[e.type];if(!s||typeof C182==='undefined'||!C182.monStats)return e;
  const t={type:e.type,L:e.L,m:Object.assign({},e.m,{elite:s.role==='elite'?1:0})};C182.monStats(t);const ak=1;
  e.maxHp=e.hp=Math.max(1,Math.round(t.maxHp*s.hpMul));e.atk=t.atk*s.atkMul*ak;e.def=t.def*s.defMul;e.def0=e.def;if(t.eva!=null)e.eva=t.eva*s.evaMul;
  e.expBase=Math.round(t.expBase*s.expMul);e.atkRange=e.m.rng?Math.max(30,(s.atkRange-(e.sz||20))/2.4):s.atkRange;   // ranged: the engine casts inside max(reach, 2.4 x range + size) = the note's 220 px
  e.sp=s.speed;e.m8row=s.role;e.eliteX=e.eliteX||(s.role==='elite'?'m8':undefined);return e;}
{const o=makeEnemy;makeEnemy=function(){return nmStats(o.apply(this,arguments));};}
NP.statsOf=(t,L)=>{const e=makeEnemy(t,L,0,0);return {hp:e.maxHp,atk:+e.atk.toFixed(1),def:Math.round(e.def),exp:e.expBase,eva:e.eva!=null?+e.eva.toFixed(1):null};};
/* ---------- zones (concept px -> world) ---------- */
const W=p=>p.map(([x,y])=>[x*KX,y*KY]);
const ZDEF=[
 {id:1,nm:'ทุ่งหิมะใต้',lv:[30,31],col:'#ffc83c',mix:[['hollowlantern',3]],poly:[[138,730],[368,720],[403,780],[483,830],[573,850],[703,830],[803,805],[823,830],[803,880],[723,910],[698,970],[703,1030],[573,1030],[483,1010],[403,960],[323,910],[243,850],[183,790]]},
 {id:2,nm:'ทะเลสาบน้ำแข็ง',lv:[31,32],col:'#50c8ff',mix:[['frostquill',3],['hollowlantern',3]],poly:[[190,335],[250,380],[340,420],[350,520],[330,600],[360,685],[330,695],[210,740],[110,670],[80,570],[100,470],[160,390]]},
 {id:3,nm:'วงธารน้ำแข็งเหนือ',lv:[32,34],col:'#ff8c3c',mix:[['rimeguard',1],['frostquill',4],['hollowlantern',2]],poly:[[245,340],[260,240],[340,150],[430,120],[560,90],[700,80],[830,90],[930,150],[990,210],[1050,290],[1080,390],[1110,480],[1040,395],[1030,330],[970,260],[880,210],[780,195],[610,180],[490,200],[400,260],[380,290],[450,340],[440,360],[360,330],[330,300],[290,280]]},
 {id:6,nm:'ทางเดินเสาและทางขึ้นตะวันออก',lv:[34,35],col:'#78e68c',mix:[],poly:[[690,465],[725,445],[785,490],[770,355],[825,430],[820,505],[925,540],[1025,585],[1065,580],[1115,610],[1085,650],[1025,665],[925,610],[825,560],[755,510]]},
 {id:5,nm:'ระเบียงหน้าผาใต้/ตะวันตก',lv:[35,36],col:'#c878ff',leash:300,mix:[['rimeguard',1],['hollowlantern',1]],poly:[[515,365],[415,480],[430,580],[550,655],[700,660],[840,605],[800,580],[620,595],[520,580],[470,510],[465,430]]},
 {id:4,nm:'ระเบียงหลังโคมยักษ์',lv:[35,36],col:'#f06ec8',mix:[['frostquill',1],['hollowlantern',1]],poly:[[460,300],[500,250],[620,230],[730,225],[830,250],[930,330],[980,410],[985,420],[940,430],[890,350],[810,290],[720,280],[590,280],[550,290],[480,310]]}];
const SAFE=[{nm:'ลานประตูใต้',poly:W([[500,1060],[730,1060],[740,1288],[490,1288]])},{nm:'ยอดเขา โคมน้ำแข็งยักษ์',poly:W([[555,265],[745,265],[770,330],[755,430],[690,445],[680,640],[605,640],[595,445],[540,430],[530,330]])}];
const POP={member:[50,80],cleared:[90,120],minP:360,retry:2.5,aggro:.72,ret:1.6,timeout:20,safeGap:160,sep:170,knightSep:300,mixGap:150};
function polyIn(x,y,Q){let c=false;for(let i=0,j=Q.length-1;i<Q.length;j=i++){const a=Q[i],b=Q[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
function edgeD(x,y,Q){let m=1e9;for(let i=0,j=Q.length-1;i<Q.length;j=i++){const [x1,y1]=Q[j],[x2,y2]=Q[i],dx=x2-x1,dy=y2-y1,L=dx*dx+dy*dy,t=L?Math.max(0,Math.min(1,((x-x1)*dx+(y-y1)*dy)/L)):0;m=Math.min(m,Math.hypot(x-x1-t*dx,y-y1-t*dy));}return m;}
const ZC=ZDEF.map(z=>{const poly=W(z.poly),xs=poly.map(q=>q[0]),ys=poly.map(q=>q[1]);return Object.assign({},z,{poly,bb:[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)],cnt:z.mix.reduce((a,q)=>a+q[1],0)});});
NP.zones=ZC;NP.safe=SAFE;
const inZ=(z,x,y,m)=>{const i=polyIn(x,y,z.poly);if(!m)return i;if(m>0)return i&&edgeD(x,y,z.poly)>=m;return i||edgeD(x,y,z.poly)<-m;};
const safeAt=(x,y)=>SAFE.find(s=>polyIn(x,y,s.poly))||null;
const safeGap=(x,y)=>Math.min(...SAFE.map(s=>polyIn(x,y,s.poly)?0:edgeD(x,y,s.poly)));
function zoneAt(x,y){for(const z of ZC)if(inZ(z,x,y))return z;return null;}
/* reachable ground: 20 px flood from the gate arrival over the level-1 collision (sky deck + gorge deck cells excluded for homes) */
const LK=D.look;
function lbit(o,x,y){if(!o||!o.u)return false;x=Math.floor(x/KX)-o.x0;y=Math.floor(y/KY)-o.y0;if(x<0||y<0||x>=o.w||y>=o.h)return false;const i=y*o.w+x;return !!(o.u[i>>3]&(128>>(i&7)));}
let REACH=null;const GS=20;
function reach(){if(REACH)return REACH;const cols=Math.ceil(D.W/GS),rows=Math.ceil(D.H/GS),R=new Uint8Array(cols*rows),q=[];
  const free=(c,r)=>{const x=c*GS+GS/2,y=r*GS+GS/2;return !(typeof blocked==='function'&&blocked(x,y,8));};
  const c0=Math.floor(D.arrive[0]/GS),r0=Math.floor(D.arrive[1]/GS);if(!free(c0,r0)){NP.err.push('arrival blocked');}
  R[r0*cols+c0]=1;q.push(c0,r0);
  while(q.length){const r=q.pop(),c=q.pop();for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){const nc=c+dc,nr=r+dr;if(nc<0||nr<0||nc>=cols||nr>=rows)continue;const k=nr*cols+nc;if(R[k])continue;if(!free(nc,nr)){R[k]=2;continue;}R[k]=1;q.push(nc,nr);}}
  let n=0;for(let i=0;i<R.length;i++)if(R[i]===1)n++;NP.reachCells=n;return REACH={R,cols,rows};}
const onReach=(x,y)=>{const M=reach(),c=Math.floor(x/GS),r=Math.floor(y/GS);return c>=0&&r>=0&&c<M.cols&&r<M.rows&&M.R[r*M.cols+c]===1;};
function spotWhy(z,x,y,r,o){o=o||{};
  if(!inZ(z,x,y,r+10))return 'zone';
  for(const [dx,dy] of [[0,0],[-r-12,0],[r+12,0],[0,-r-12],[0,r+12]])if(!onReach(x+dx,y+dy))return 'floor';
  if(typeof blocked==='function'&&blocked(x,y,r+8))return 'solid';
  if(lbit(LK.deck,x,y)||lbit(LK.gorge,x,y)||lbit(LK.lz,x,y))return 'bridge';
  if(safeGap(x,y)<POP.safeGap)return 'safe';
  if(!o.home){if(P&&!P.dead&&o.minP&&Math.hypot(x-P.x,y-P.y)<o.minP)return 'player';
    for(const q of enemies)if(!q.dead&&Math.hypot(q.x-x,q.y-y)<Math.max((q.sz+r)*1.15,q.m8z===z?POP.sep*.5:0))return 'monster';}
  return null;}
const isK=t=>t==='rimeguard';
function grnd(){let sd=8808;return ()=>(sd=(sd*16807)%2147483647)/2147483647;}
function plan(){if(NP.planned)return;NP.planned=true;const R=grnd();
  for(const z of ZC){if(!z.mix.length){z.n=0;z.walk=0;continue;}const mr=Math.max(...z.mix.map(q=>(MOBS[q[0]]&&MOBS[q[0]].sz)||20)),b=z.bb,cells=[];
    for(let y=Math.ceil((b[1]+10)/20)*20;y<b[3];y+=20)for(let x=Math.ceil((b[0]+10)/20)*20;x<b[2];x+=20)if(!spotWhy(z,x,y,mr,{home:1}))cells.push([x,y]);
    z.walk=Math.round(cells.length*400);
    const types=[];for(const [t,n] of z.mix)for(let i=0;i<n;i++)types.push(t);   // Knight first (widest spacing)
    const fits=(h,t,c)=>h.every(p=>{const d=Math.hypot(p[0]-c[0],p[1]-c[1]);if(p[2]===t)return d>=(isK(t)?POP.knightSep:POP.sep);return d>=(isK(t)||isK(p[2])?Math.max(POP.mixGap,200):POP.mixGap);});
    let best=[];if(cells.length)for(let t=0;t<80&&best.length<types.length;t++){const h=[];for(const ty of types){let ok=null;for(let j=0;j<600&&!ok;j++){const c=cells[Math.floor(R()*cells.length)];if(fits(h,ty,c))ok=c;}if(!ok)break;h.push([ok[0],ok[1],ty]);}if(h.length>best.length)best=h;}
    z.n=best.length;best.forEach((h,i)=>NP.members.push({z,type:h[2],idx:i,hx:h[0],hy:h[1],e:null,respT:null,L:null}));}}
function spawn(m,initial){const z=m.z,mob=MOBS[m.type],s=SPC[m.type];if(!mob){m.respT=now()+30;return false;}
  const r=mob.sz||20,o={minP:initial?0:POP.minP};let p=null;
  for(let k=0;k<26&&!p;k++){const a=Math.random()*6.2832,d=k?Math.min(120,Math.random()*(30+k*8)):0,x=m.hx+Math.cos(a)*d,y=m.hy+Math.sin(a)*d,why=spotWhy(z,x,y,r,o);if(!why)p=[x,y];else NP.stats.rej[why]=(NP.stats.rej[why]||0)+1;}
  if(!p)return false;
  const lo=Math.max(z.lv[0],s.lv[0]),hi=Math.max(lo,Math.min(z.lv[1],s.lv[1])),L=lo+Math.floor(Math.random()*(hi-lo+1)),e=makeEnemy(m.type,L,p[0],p[1]);
  e.m8z=z;e.m8m=m;e.sx=p[0];e.sy=p[1];e.w22am=(s.aggro||1)*POP.aggro;e.wx=e.x;e.wy=e.y;e.wanderT=1+Math.random()*3;e.joinMode=s.join==='solo'?'solo':'pack';e.m8leash=z.leash&&m.type==='rimeguard'?z.leash:s.leash;
  m.e=e;m.respT=null;m.L=L;enemies.push(e);NP.stats.spawn[z.id]=(NP.stats.spawn[z.id]||0)+1;
  if(!initial){NP.stats.respawns++;const dd=P?Math.hypot(p[0]-P.x,p[1]-P.y):0;NP.stats.minSpawnDist=Math.min(NP.stats.minSpawnDist==null?1e9:NP.stats.minSpawnDist,Math.round(dd));try{ring(p[0],p[1],8,60,.5,mob.c,3);}catch(_){}}
  return true;}
function populate(){if(!species())return false;try{if(M4.popInstall)M4.popInstall();}catch(_){}plan();for(const m of NP.members){m.e=null;if(m.respT!=null&&now()<m.respT)continue;spawn(m,true);}NP.on8=true;NP.ok=true;NP.where=null;return true;}
function leaveClean(){if(!NP.on8)return;NP.on8=false;for(const m of NP.members){if(m.e&&!m.e.dead)m.respT=now();m.e=null;}NP.where=null;}
NP.populate=populate;NP.leave=leaveClean;
function died(e){const m=e.m8m;if(!m||m.e!==e)return;m.e=null;NP.stats.kills++;const k=SPC[m.type].respMul||1,rr=a=>a[0]+Math.random()*(a[1]-a[0]);
  m.respT=now()+rr(POP.member)*k;const live=NP.members.filter(q=>q.z===m.z&&q.e&&!q.e.dead);
  if(!live.length){const t0=now()+rr(POP.cleared)*k;let i=0;for(const q of NP.members)if(q.z===m.z)q.respT=Math.max(q.respT||0,t0+(i++)*4);}}
{const o=killEnemy;killEnemy=function(e){const was=e&&e.dead,r=o.apply(this,arguments);try{if(e&&!was&&e.dead&&e.m8m)died(e);}catch(er){NP.err.push('kill '+er.message);}return r;};}
const up2=()=>M8.level===2;
const heroIn=z=>P&&!P.dead&&!up2()&&inZ(z,P.x,P.y,-40)&&!safeAt(P.x,P.y);
function zPre(dt){const alive=P&&!P.dead&&G.state==='play'&&!(P.stealth>0);
  for(const e of enemies){if(e.dead||!e.m8z)continue;
    if(up2()){e._m8h=[e.x,e.y];e.aggro=false;e.wind=0;continue;}
    if(e.w22ret){e.hp=e.w22ret.hp;e.w22px=e.x;e.w22py=e.y;e.aggro=false;e.wind=0;e.strikeT=0;e.tele=null;e.vx=e.vy=0;for(const k in e.st)delete e.st[k];continue;}
    if(alive&&!e.aggro&&!(e.st&&e.st.stun)&&heroIn(e.m8z)&&Math.hypot(e.x-P.x,e.y-P.y)<detectR(e)){e.aggro=true;e.alertT=.9;e.calmT=0;NP.stats.pulls++;try{textAt(e.x,e.y-e.sz*2.6,'!','#ff5a6a',22,{life:.7,vy:-30});}catch(_){}
      if(e.joinMode!=='solo')for(const q of enemies)if(q!==e&&!q.dead&&!q.aggro&&q.m8z===e.m8z&&q.joinMode!=='solo'&&Math.hypot(q.x-e.x,q.y-e.y)<170){q.aggro=true;q.alertT=.9;}}}}
function rStart(e){e.w22ret={t:0,hp:e.hp};e.aggro=false;e.wind=0;e.strikeT=0;e.tele=null;e.vx=e.vy=0;e.calmT=0;e.atkCd=1.4;
  for(const k in e.st)delete e.st[k];if(e.pz&&e.pz.clear)try{e.pz.clear();}catch(_){}e.dotT=.5;for(let i=projs.length-1;i>=0;i--)if(projs[i].src===e)projs.splice(i,1);}
function rEnd(e,why){e.w22ret=null;if(why==='timeout'){e.x=e.sx;e.y=e.sy;}
  e.hp=e.maxHp;e.aggro=false;e.wind=0;e.tele=null;e.strikeT=0;e.atkCd=1+Math.random()*.6;e.dotT=.5;for(const k in e.st)delete e.st[k];if(e.pz&&e.pz.clear)try{e.pz.clear();}catch(_){}}
function zPost(dt){
  for(const e of enemies){if(e.dead||!e.m8z)continue;const z=e.m8z;
    if(e._m8h){e.x=e._m8h[0];e.y=e._m8h[1];e.vx=e.vy=0;e._m8h=null;NP.stats.held++;continue;}
    if(e.w22ret){const r=e.w22ret;r.t+=dt;const dx=e.sx-e.w22px,dy=e.sy-e.w22py,d=Math.hypot(dx,dy)||1;
      if(d<26||r.t>POP.timeout){rEnd(e,d<26?'home':'timeout');continue;}
      const st=Math.min(d,e.sp*POP.ret*dt);e.x=e.w22px+dx/d*st;e.y=e.w22py+dy/d*st;e.vx=e.vy=0;e.hp=r.hp;try{collide(e,e.sz*.7);}catch(_){}continue;}
    if(e.aggro){const far=e.m8leash&&Math.hypot(e.x-e.sx,e.y-e.sy)>e.m8leash;
      if(far||!inZ(z,e.x,e.y,-24)||!heroIn(z)){if(P&&safeAt(P.x,P.y))NP.stats.safeDrops++;rStart(e);e.w22px=e.x;e.w22py=e.y;NP.stats.resets++;}}
    else if(!inZ(z,e.wx,e.wy,30)||!onReach(e.wx,e.wy)){e.wx=e.sx;e.wy=e.sy;}}
  NP.respT=(NP.respT||0)-dt;if(NP.respT<=0){NP.respT=1;
    for(const m of NP.members){if(m.e&&!m.e.dead)continue;if(m.respT!=null&&now()>=m.respT){
      if(NP.members.some(q=>q.z===m.z&&q.e&&!q.e.dead&&(q.e.aggro||q.e.w22ret))){m.respT=now()+POP.retry;continue;}
      if(!spawn(m,false))m.respT=now()+POP.retry;}}}}
{const o=updEnemies;updEnemies=function(dt){if(G.zone!==ID||!NP.on8)return o.apply(this,arguments);try{zPre(dt);}catch(er){if(NP.err.length<20)NP.err.push('pre '+er.message);}
  const r=o.apply(this,arguments);try{zPost(dt);}catch(er){if(NP.err.length<20)NP.err.push('post '+er.message);}return r;};}
/* the hero cannot hurt or be hurt in the safe areas (gate yard, summit): monsters there are only ones walking home */
{const o=hurtPlayer;hurtPlayer=function(raw,src){if(G.zone===ID&&NP.on8&&P&&safeAt(P.x,P.y)&&src&&src.m8z)return;return o.apply(this,arguments);};}
/* enter / leave (Map 8 has no enter hook for other modules: watch the zone) */
setInterval(()=>{try{if(G.zone===ID&&M8.on&&!G.fade&&!NP.on8&&G.state==='play')populate();else if(G.zone!==ID&&NP.on8)leaveClean();}catch(er){if(NP.err.length<20)NP.err.push('watch '+er.message);}},200);
/* HUD: zone names */
function whereText(){if(!P)return null;const s=safeAt(P.x,P.y);if(s)return {k:'s'+s.nm,t:s.nm,s:'🛡 Safe Zone · '+s.nm,safe:1};
  if(up2())return {k:'sky',t:null,s:'แมพ 8 · สะพานลอยฟ้า'};
  const z=zoneAt(P.x,P.y);if(z)return {k:'z'+z.id,t:z.nm,s:`แมพ 8 · ${z.nm} · Lv ${z.lv[0]}–${z.lv[1]}`};return {k:'p',t:null,s:'แมพ 8 · ทางเดิน'};}
{const o=updZoneTag;updZoneTag=function(){const r=o.apply(this,arguments);try{if(G.zone===ID&&NP.on8){const w=whereText(),s=document.getElementById('zSub'),n=document.getElementById('zName');
  if(n){n.textContent='Map 8';n.style.color=w&&w.safe?'#7dff9a':'';}if(s&&w)s.textContent=w.s;}}catch(_){}return r;};}
setInterval(()=>{try{if(G.zone!==ID||!P||!NP.on8)return;const w=whereText();if(!w||w.k===NP.where)return;const first=NP.where==null;NP.where=w.k;updZoneTag();if(!first&&w.t)showBanner(w.t,w.s,2.2);}catch(_){}},200);
NP.whereText=whereText;NP.spotWhy=(i,x,y,r)=>spotWhy(ZC[i],x,y,r||20,{home:1});NP.reach=reach;
})();
