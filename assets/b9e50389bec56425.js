
/* ---- mobguard-r1 + edgehit-r1 + bosspush-r1 (TEST allin_r94, 15 Nov 2026, DeaRz 01:23) ----
   A) MONSTERS STUCK OUTSIDE / INSIDE WALLS (Map 10, cave, every map with monsters). Causes found:
      1 the farm spawner (farm-r1) only tested blocked() with ONE radius and never "is this spot connected to the map" -> spawns on small enclosed pockets / beside the edge forest;
      2 knockback / dash-shove / skill pushes add velocity or move e.x/e.y directly and updEnemies only runs collide() afterwards (a circle push-out), so a hard push tunnels through thin walls or lands inside a solid and the circle push cannot resolve it;
      3 wander targets (home + 220 px) and homes can be inside solids or outside the map, so a monster walks into the wall forever;
      4 monsters made by other spawners (summons, old per-map populators, respawns) were never checked at all.
   FIX (this module, ?mobguard=off = old behaviour): every frame the position of every live monster is compared with the one before the frame; a move into a blocked / outside / unreachable spot is replaced by axis sliding (x only, then y only), else reverted;
   every 0.4 s any monster still inside a blocked or unreachable spot (or outside the world, or NaN) is moved to the nearest reachable walkable spot, and its home + wander target are repaired;
   every monster created (makeEnemy) and every farm spawn must be on a walkable cell connected to the main area (components smaller than 120 cells = pockets are not reachable).
   Walkable = the game's own blocked() (solids, water, map masks of Map 5 / 6 / 11), so walking, push and spawn all use one collision. Debug: window.__MOBGUARD (stats, ok(), nearest(), scan()).
   B) MELEE vs BIG BODIES (Map 11 boss pushes the player, basic attacks miss): the combo modules (sword sw3, dagger, scythe scy3, bow3) measured the target from its CENTRE with a +-45 px side band (scythe: an ellipse with the vertical axis doubled),
      while a boss (body radius 104) shoves the player out to 116 px from its centre -> from above / below every hit missed. edgehit-r1: those tests now measure from the body edge (extra = body radius - 16, nothing changes for small monsters); ?edgehit=off = old.
      bosspush-r1: while the engine step runs, a boss / raid body is 0.8 x its radius, so the player is never shoved out further than 80 % of the body; ?bosspush=off = old. Debug: __EDGE, __BOSSPUSH. ---- */
(function(){'use strict';
const Q=String(location.search);
window.__EDGE={ver:'edgehit-r1',on:!/[?&]edgehit=off\b/.test(Q)};
const BP=window.__BOSSPUSH={ver:'bosspush-r1',on:!/[?&]bosspush=off\b/.test(Q),K:.8,n:0};
try{const _u=updEnemies;updEnemies=function(dt){if(!BP.on)return _u.apply(this,arguments);const sv=[];try{for(const e of enemies){if(!e.dead&&e.m&&(e.m.boss||e.m.raid)&&e.sz>40){sv.push([e,e.sz]);e.sz=e.sz*BP.K}}}catch(_){}
  BP.n+=sv.length?1:0;try{return _u.apply(this,arguments)}finally{for(const [e,s] of sv)e.sz=s}}}catch(e){BP.err=String(e)}
const MG=window.__MOBGUARD={ver:'mobguard-r1',on:!/[?&]mobguard=off\b/.test(Q),err:null,CELL:32,RG:6,MINC:120,g:null,builtAt:-99,stats:{relocated:0,slid:0,reverted:0,created:0,wander:0,home:0,scans:0,grids:0,nan:0,lastBuildMs:0}};
const ERR=(w,e)=>{MG.err=w+': '+((e&&e.message)||e);try{console.error('[MOBGUARD]',w,e)}catch(_){}};
const NB=[[1,0],[-1,0],[0,1],[0,-1]];
const zone=()=>{try{return ZONES[G.zone]}catch(_){return null}};
const playing=()=>{try{return G.state==='play'&&!G.fade}catch(_){return false}};
function build(){const Z=zone();if(!Z||!Z.w||!Z.h)return null;const t0=performance.now(),C=MG.CELL,cols=Math.ceil(Z.w/C),rows=Math.ceil(Z.h/C),wk=new Uint8Array(cols*rows);
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const x=i*C+C/2,y=j*C+C/2;if(x<40||y<40||x>Z.w-40||y>Z.h-40)continue;let b=false;try{b=blocked(x,y,MG.RG)}catch(_){}if(!b)wk[j*cols+i]=1}
  const comp=new Int32Array(cols*rows),sizes=[0],st=[];let id=0;
  for(let s=0;s<wk.length;s++){if(!wk[s]||comp[s])continue;id++;let cnt=0;st.length=0;st.push(s);comp[s]=id;
    while(st.length){const c=st.pop();cnt++;const ci=c%cols,cj=(c/cols)|0;for(const d of NB){const ni=ci+d[0],nj=cj+d[1];if(ni<0||nj<0||ni>=cols||nj>=rows)continue;const t=nj*cols+ni;if(wk[t]&&!comp[t]){comp[t]=id;st.push(t)}}}sizes[id]=cnt}
  let best=0;for(let k=1;k<=id;k++)best=Math.max(best,sizes[k]);const minc=Math.min(MG.MINC,best),reach=new Uint8Array(cols*rows);let rn=0,wn=0;
  for(let s=0;s<wk.length;s++){if(wk[s]){wn++;if(sizes[comp[s]]>=minc){reach[s]=1;rn++}}}
  MG.stats.grids++;MG.stats.lastBuildMs=+(performance.now()-t0).toFixed(1);return {zid:G.zone,cols,rows,C,reach,walk:wk,comps:id,best,walkN:wn,reachN:rn,sig:(typeof SGRID!=='undefined'?SGRID.size:0)}}
function grid(){if(!playing())return MG.g&&MG.g.zid===G.zone?MG.g:null;const now=performance.now()/1000;
  if(!MG.g||MG.g.zid!==G.zone||now-MG.builtAt>15||MG.g.sig!==(typeof SGRID!=='undefined'?SGRID.size:0)){try{MG.g=build();MG.builtAt=now}catch(e){ERR('build',e);MG.g=null}}
  return MG.g}
function reachNear(g,x,y){const i=(x/g.C)|0,j=(y/g.C)|0;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const a=i+di,b=j+dj;if(a<0||b<0||a>=g.cols||b>=g.rows)continue;if(g.reach[b*g.cols+a])return true}return false}
function ok(x,y,r){const Z=zone();if(!Z)return true;if(!isFinite(x)||!isFinite(y))return false;if(x<24||y<24||x>Z.w-24||y>Z.h-24)return false;
  const g=grid();if(g&&g.zid===G.zone&&!reachNear(g,x,y))return false;try{if(blocked(x,y,r==null?6:r))return false}catch(_){}return true}
function nearest(x,y,r){const g=grid(),Z=zone();if(!Z)return null;if(!isFinite(x)||!isFinite(y)){x=P.x;y=P.y}x=Math.max(40,Math.min(Z.w-40,x));y=Math.max(40,Math.min(Z.h-40,y));
  if(!g)return {x,y};const C=g.C,ci=(x/C)|0,cj=(y/C)|0;let best=null,bd=1e18,found=-1;
  for(let k=0;k<=70;k++){if(found>=0&&k>found+1)break;for(let dj=-k;dj<=k;dj++)for(let di=-k;di<=k;di++){if(Math.max(Math.abs(di),Math.abs(dj))!==k)continue;const a=ci+di,b=cj+dj;if(a<0||b<0||a>=g.cols||b>=g.rows||!g.reach[b*g.cols+a])continue;
      const cx=a*C+C/2,cy=b*C+C/2;if(!ok(cx,cy,r))continue;const d=(cx-x)*(cx-x)+(cy-y)*(cy-y);if(d<bd){bd=d;best={x:cx,y:cy};if(found<0)found=k}}}
  return best}
MG.ok=ok;MG.nearest=nearest;MG.grid=grid;
const skip=e=>!e||e.dead||G.zone==='gate_inst'||e.sprGhost||e.mnnGhost||e.dt247;
function fixOne(e,why){const r=(e.sz||16)*.5,q=nearest(e.x,e.y,r);if(!q)return false;e.x=q.x;e.y=q.y;e.vx=e.vy=0;e.strikeT=0;e.wind=0;e.tele=null;
  if(e.sx==null||!ok(e.sx,e.sy,r)){e.sx=q.x;e.sy=q.y;MG.stats.home++}if(e.wx==null||!ok(e.wx,e.wy,r)){e.wx=q.x;e.wy=q.y;MG.stats.wander++}
  MG.stats.relocated++;try{(MG.log=MG.log||[]).push({t:+time.toFixed(1),z:G.zone,type:e.type,why,x:Math.round(q.x),y:Math.round(q.y)});if(MG.log.length>40)MG.log.shift()}catch(_){}return true}
/* every frame: slide / revert any move into a blocked, outside or unreachable spot */
if(MG.on)try{const _u=update;update=function(dt){let snap=null;try{if(playing()&&enemies.length&&G.zone!=='gate_inst'){grid();snap=new Map();for(const e of enemies)if(!e.dead)snap.set(e,[e.x,e.y])}}catch(er){ERR('snap',er)}
  const r0=_u.apply(this,arguments);
  try{if(snap&&playing()){for(const [e,o] of snap){if(skip(e)||(e.x===o[0]&&e.y===o[1]))continue;const r=(e.sz||16)*.5;
      if(e.m&&e.m.fly){const Z=zone();if(Z){e.x=Math.max(40,Math.min(Z.w-40,e.x));e.y=Math.max(40,Math.min(Z.h-40,e.y))}continue}
      if(ok(e.x,e.y,r))continue;
      if(ok(o[0],o[1],r)){if(ok(e.x,o[1],r)){e.y=o[1];e.vy=0;MG.stats.slid++}else if(ok(o[0],e.y,r)){e.x=o[0];e.vx=0;MG.stats.slid++}else{e.x=o[0];e.y=o[1];e.vx=e.vy=0;e.strikeT=0;MG.stats.reverted++}}}}}catch(er){ERR('post',er)}
  try{if(typeof time==='number'&&time-(MG._ls||0)>=.4){MG._ls=time;scan()}}catch(er){ERR('scan',er)}   /* frame-based (game clock), so it also runs at the same rate in fast simulations */
  return r0}}catch(e){ERR('hook update',e)}
/* every 0.4 s: anything still stuck (or outside / NaN) goes to the nearest reachable walkable spot; homes + wander targets repaired */
function scan(){let n=0;if(!playing()||G.zone==='gate_inst')return 0;MG.stats.scans++;
  for(const e of enemies){if(skip(e))continue;const r=(e.sz||16)*.5;
    if(!isFinite(e.x)||!isFinite(e.y)){MG.stats.nan++}
    if(e.m&&e.m.fly){const Z=zone();if(Z){e.x=Math.max(40,Math.min(Z.w-40,e.x));e.y=Math.max(40,Math.min(Z.h-40,e.y))}continue}
    if(!ok(e.x,e.y,r)){if(fixOne(e,'scan'))n++;continue}
    if(e.wx!=null&&!ok(e.wx,e.wy,r)){e.wx=e.x;e.wy=e.y;MG.stats.wander++}
    if(e.sx!=null&&!ok(e.sx,e.sy,r)){e.sx=e.x;e.sy=e.y;MG.stats.home++}}
  return n}
MG.scan=scan;if(MG.on)setInterval(()=>{try{if(typeof time==='number'&&time-(MG._ls||0)>=1.2){MG._ls=time;scan()}}catch(e){ERR('scan',e)}},1000);   /* fallback when update is not running */
/* every monster made while playing must start on a reachable walkable spot */
if(MG.on)try{const _m=makeEnemy;makeEnemy=function(){const e=_m.apply(this,arguments);try{if(e&&playing()&&G.zone!=='gate_inst'&&!(e.m&&e.m.fly)){const r=(e.sz||16)*.5;if(!ok(e.x,e.y,r)&&fixOne(e,'create'))MG.stats.created++}}catch(er){ERR('make',er)}return e}}catch(e){ERR('hook makeEnemy',e)}
/* debug: count invalid monsters in the current zone without moving them */
MG.audit=()=>{const o={zone:G.zone,n:0,bad:0,outside:0,blockedN:0,unreach:0};const Z=zone();for(const e of enemies){if(skip(e)||(e.m&&e.m.fly))continue;o.n++;const r=(e.sz||16)*.5;if(!ok(e.x,e.y,r)){o.bad++;if(!Z||e.x<24||e.y<24||e.x>Z.w-24||e.y>Z.h-24||!isFinite(e.x))o.outside++;else{let b=false;try{b=blocked(e.x,e.y,r)}catch(_){}if(b)o.blockedN++;else o.unreach++}}}return o};
console.info('[MOBGUARD] ready r1');
})();
