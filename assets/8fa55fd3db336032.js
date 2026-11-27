
/* ---- farm-r1 (TEST, 11 Nov 2026): dense farm maps (BALANCE_farm_density_chase_v1 v1.1 + BALANCE_gate_monsters_field_v1) ----
   ONE spawner (window.__FARM) that keeps Map 4, Cave 1, Map 5, Map 6, Map 8 and Map 10 populated however the map was entered (warp circle, gate, tray button, loadZone): the old per-map populators only started when entered through their own enter() path,
   so a hero arriving any other way found an empty map. FARM is count based and ADOPTS whatever the old populators already spawned (same species inside the same zone count toward the target), so entering the old way never doubles the monsters.
   Counts (alive per map): Map 4 = 40, Cave 1 = 18, Map 5 = 72 (gate species Eel / Crystal Bat of z7 skipped: no field art for Eel), Map 6 = 66 (Drowned Guard + Eel skipped: no art), Map 10 = 70, Map 8 = 45; Map 2 unchanged (its own populator).
   Respawn per mob = 2.5 s x N (min 70 s): Map 4 100 s, Cave 1 70 s, Map 5 180 s, Map 6 165 s, Map 8 110 s, Map 10 175 s; group species x1.5, Warden / Knight (solo) x1.5. Spawn rules: inside the zone, not on solids / water (the old maps' own spot check when available), >= 200 px from safe areas, >= 360 px from the hero, solo species homes >= 300 px apart.
   Zones come from the maps' own data at runtime (Map 4 / Cave 1 rectangles, Map 5 / 6 polygons) and from draw_map8_layout_v2.py (Map 8 ring arcs, scaled by the live map's KX / KY).
   Flags: ?farm=off. Config + state: window.__FARM (cfg, stats, state()). ---- */
(function(){'use strict';
const Q=String(location.search),OFF=/[?&]farm=off\b/.test(Q);
const F=window.__FARM={ver:'farm-r1',on:!OFF,err:null,stats:{spawned:0,respawned:0,tries:0,rejected:0},zone:null,slots:[],pend:[],cfg:{HERO_MIN:360,SAFE_MIN:200,SOLO_SEP:300,TICK:.5,BATCH:6,MAXN:{},SPECIES_ATK:{frostquill:.65}}};
if(OFF)return;
const ERR=(w,e)=>{F.err=w+': '+((e&&e.message)||e);try{console.error('[FARM]',w,e)}catch(_){}};
const rnd=(a,b)=>a+Math.random()*(b-a);
const inPoly=(x,y,p)=>{let c=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c}return c};
const bbox=p=>{let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const q of p){x0=Math.min(x0,q[0]);y0=Math.min(y0,q[1]);x1=Math.max(x1,q[0]);y1=Math.max(y1,q[1])}return [x0,y0,x1,y1]};
const rect=r=>({rects:r,inside:(x,y)=>r.some(q=>x>=q[0]&&x<=q[2]&&y>=q[1]&&y<=q[3]),sample:()=>{const q=r[Math.floor(Math.random()*r.length)];return [rnd(q[0],q[2]),rnd(q[1],q[3])]}});
const poly=p=>{const b=bbox(p);return {poly:p,inside:(x,y)=>inPoly(x,y,p),sample:()=>[rnd(b[0],b[2]),rnd(b[1],b[3])]}};
/* ---- Map 8 ring arcs (plan 3400x3600, CX,CY = 1700,1650) ---- */
function ringPts(cx,cy,rx,ry,a0,a1,n){const o=[];for(let i=0;i<=n;i++){const a=(a0+(a1-a0)*i/n)*Math.PI/180;o.push([cx+rx*Math.cos(a),cy+ry*Math.sin(a)])}return o}
function map8Zones(D){const CX=1700,CY=1650,Z8=ZONES.w23_map8_test||{},kx=(Z8.w||3400)/3400,ky=(Z8.h||3600)/3600;const Z={2:ringPts(CX,CY,1450,1550,100,160,12).concat(ringPts(CX,CY,940,860,160,100,12)),3:ringPts(CX,CY,1450,1550,165,215,12).concat(ringPts(CX,CY,940,860,215,165,12)),
  4:ringPts(CX,CY,1450,1550,220,320,16).concat(ringPts(CX,CY,940,860,320,220,16)),5:ringPts(CX,CY,1450,1550,325,385,12).concat(ringPts(CX,CY,940,860,385,325,12)),6:ringPts(CX,CY,600,540,20,330,30).concat(ringPts(CX,CY,400,350,330,20,30))};
  const o={};for(const k in Z)o[k]=Z[k].map(p=>[p[0]*kx,p[1]*ky]);return o}
/* ---- per-map definitions: regions (geometry resolver) + mix [type, count, lv, opts] ---- */
const M4=()=>window.__M4T;
const DEF={
 w22_map4_test:{N:40,resp:100,why:(z,x,y,r)=>{const M=M4();return M&&M.r28&&M.r28.why?M.r28.why(z,x,y,r,{home:1}):null},regions:()=>{const zc=M4().zc,by=t=>zc.find(z=>z.tag===t);return [
   {id:'z3',zo:by('3'),geo:()=>rect(by('3').rs),mix:[['ruinwarden_m4',5,[16,18],{solo:1}],['puffcap',8,[16,18],{pack:1}]]},
   {id:'2W',zo:by('2W'),geo:()=>rect(by('2W').rs),mix:[['stoneboar',6,[13,15]]]},{id:'2E',zo:by('2E'),geo:()=>rect(by('2E').rs),mix:[['stoneboar',6,[13,15]]]},
   {id:'1W',zo:by('1W'),geo:()=>rect(by('1W').rs),mix:[['mossback',5,[10,12]]]},{id:'1E',zo:by('1E'),geo:()=>rect(by('1E').rs),mix:[['mossback',10,[10,12]]]}]}},
 w22_cave1_test:{N:18,resp:70,why:(z,x,y,r)=>{const C=M4()&&M4().cave1;return C&&C.why?C.why(z,x,y,r,{home:1}):null},regions:()=>{const zc=(M4().cave1||{}).zc||[],f=t=>zc.find(z=>(z.type||'').indexOf(t)===0);const o=[];
   const t=f('mossback'),b=f('stoneboar'),w=f('ruinwarden');
   if(t)o.push({id:'C',zo:t,geo:()=>rect(t.rs),mix:[['mossback',6,[13,15]]]});if(b)o.push({id:'A',zo:b,geo:()=>rect(b.rs),mix:[['stoneboar',8,[14,16]]]});if(w)o.push({id:'B',zo:w,geo:()=>rect(w.rs),mix:[[w.type,4,[16,18],{solo:1}]]});return o}},
 w22_map5_test:{N:72,resp:180,why:(z,x,y,r)=>{const M=M4()&&M4().map5;return M&&M.why?M.why(z,x,y,r,{home:1}):null},regions:()=>{const zc=M4().map5.zc,by=i=>zc.find(z=>z.id===i);return [
   {id:'z2',zo:by(2),geo:()=>poly(by(2).poly),mix:[['stoneboar',20,[18,20]],['mossback',15,[18,20]]]},
   {id:'z3',zo:by(3),geo:()=>poly(by(3).poly),mix:[['mossback',6,[20,22]],['stoneboar',5,[20,22]]]},
   {id:'z4',zo:by(4),geo:()=>poly(by(4).poly),mix:[['ruinwarden_m4',8,[21,23],{solo:1}],['stoneboar',8,[21,23]]]},
   {id:'z7',zo:by(7),geo:()=>poly(by(7).poly),mix:[['galefeather',8,[22,24]]]}]}},
 w23_map6_test:{N:66,resp:165,why:(z,x,y,r)=>{const M=M4()&&M4().map6;return M&&M.why?M.why(z,x,y,r,{home:1}):null},regions:()=>{const zc=M4().map6.zc,by=i=>zc.find(z=>z.id===i);return [
   {id:'z2',zo:by(2),geo:()=>poly(by(2).poly),mix:[['stoneboar',12,[24,26]]]},
   {id:'z3',zo:by(3),geo:()=>poly(by(3).poly),mix:[['mossback',6,[25,27]]]},
   {id:'z5',zo:by(5),geo:()=>poly(by(5).poly),mix:[['ruinwarden_m4',14,[26,28],{solo:1}]]},
   {id:'z6',zo:by(6),geo:()=>poly(by(6).poly),mix:[['stoneboar',7,[26,28]],['ruinwarden_m4',4,[26,28],{solo:1}],['shard_crab',2,[26,28],{gate:'crab'}],['crystal_bat',2,[26,28],{gate:'bat'}]]},
   {id:'z7',zo:by(7),geo:()=>poly(by(7).poly),mix:[['galefeather',9,[28,30]],['crystal_bat',2,[28,30],{gate:'bat'}],['shard_crab',2,[28,30],{gate:'crab'}]]}]}},
 w23_map8_test:{N:45,resp:110,pre:()=>{const N=window.M8POP;if(!N||!N.populate)return;if(!N.ok)N.populate();/* the old populator only matters for installing the species; its own 20 monsters / respawns are replaced by FARM's 45 */for(let i=enemies.length-1;i>=0;i--)if(enemies[i].m8z)enemies.splice(i,1);for(const m of N.members||[]){m.e=null;m.respT=1e12}N.on8=true},regions:()=>{const Zp=map8Zones(M4().map8.data),mk=(id,n)=>({id:'z'+id,geo:()=>poly(Zp[id]),mix:n});return [
   mk(2,[['hollowlantern',9,[30,32],{pack:1}]]),mk(3,[['hollowlantern',6,[30,32],{pack:1}]]),mk(4,[['frostquill',10,[32,34]],['hollowlantern',6,[32,34],{pack:1}]]),
   mk(5,[['frostquill',5,[32,34]],['rimeguard',3,[32,34],{solo:1}]]),mk(6,[['rimeguard',4,[34,36],{solo:1}],['frostquill',2,[34,36]]])]}},
 w24_map10_test:{N:70,resp:175,regions:()=>{const Z=ZONES.w24_map10_test;return [{id:'all',geo:()=>({inside:(x,y)=>x>150&&x<Z.w-150&&y>150&&y<Z.h-150&&!(x>520&&x<920&&y>1300&&y<1700),sample:()=>[rnd(200,Z.w-200),rnd(200,Z.h-200)]}),
   mix:[['bogtoad',20,[36,37]],['meadowram',16,[37,38]],['pinesquirrel',10,[37,37],{pack:1}],['buzzbee',10,[38,38],{pack:1}],['strawman',7,[38,39]],['gloomcrow',7,[39,39]]]}]}}};
F.DEF=DEF;
/* field stats of the gate species used in the field (BALANCE_gate_monsters_field_v1): bat hp .7 atk 1 def .6, crab hp 1.4 atk 1 def 1.3 */
const FIELD={bat:{hp:.7,atk:1,def:.6},crab:{hp:1.4,atk:1,def:1.3}};
const safeNear=(x,y)=>{const m=window.__MOBCHASE;if(!m||!m.safeAt)return false;const d=F.cfg.SAFE_MIN;if(m.safeAt(x,y))return true;return m.safeAt(x+d,y)||m.safeAt(x-d,y)||m.safeAt(x,y+d)||m.safeAt(x,y-d)};
const respFor=(cfg,o)=>{let r=Math.max(70,cfg.resp);if(o&&(o.pack||o.solo))r*=1.5;return r};
/* ---- state of the current map ---- */
function build(zid){const cfg=DEF[zid];if(!cfg)return false;try{const M=M4();if(M&&M.popInstall)M.popInstall()}catch(e){ERR('popInstall',e)}try{if(cfg.pre)cfg.pre()}catch(e){ERR('pre',e)}let regs;try{regs=cfg.regions()}catch(e){ERR('regions '+zid,e);return false}
  F.zone=zid;F.regs=[];F.pend=[];let N=0;for(const r of regs){let geo;try{geo=r.geo()}catch(e){ERR('geo',e);continue}const R={id:r.id,zo:r.zo,geo,mix:r.mix.map(m=>({type:m[0],n:m[1],lv:m[2],o:m[3]||{}}))};F.regs.push(R);for(const m of R.mix)N+=m.n}
  F.N=N;F.built=time;return true}
const live=(R,m)=>{let c=0;for(const e of enemies)if(!e.dead&&e.type===m.type&&!e.mcDespawn&&R.geo.inside(e.x,e.y))c++;return c};
function spot(cfg,R,m,hero){const r=((MOBS[m.type]&&MOBS[m.type].sz)||20)+8;for(let k=0;k<40;k++){F.stats.tries++;const [x,y]=R.geo.sample();if(!R.geo.inside(x,y)){continue}
    if(Math.hypot(x-hero.x,y-hero.y)<F.cfg.HERO_MIN)continue;if(typeof blocked==='function'&&blocked(x,y,r))continue;if(window.__MOBGUARD&&__MOBGUARD.on&&!__MOBGUARD.ok(x,y,r*.5))continue;if(safeNear(x,y))continue;
    try{if(cfg.why&&R.zo&&cfg.why(R.zo,x,y,r))continue}catch(_){}
    if(m.o.solo){let bad=false;for(const e of enemies)if(!e.dead&&e.type===m.type&&Math.hypot(e.x-x,e.y-y)<F.cfg.SOLO_SEP){bad=true;break}if(bad)continue}
    return [x,y]}F.stats.rejected++;return null}
F.missing={};function spawnOne(cfg,R,m,hero,first){if(!MOBS[m.type]){F.missing[m.type]=(F.missing[m.type]||0)+1;return false}const s=spot(cfg,R,m,hero);if(!s)return false;const L=Math.round(rnd(m.lv[0],m.lv[1]+.999));let e=makeEnemy(m.type,L,s[0],s[1]);if(!e)return false;
  if(m.o.gate&&FIELD[m.o.gate]){const f=FIELD[m.o.gate];e.maxHp=e.hp=Math.round(e.maxHp*f.hp);e.atk*=f.atk;e.def*=f.def}
  if(F.cfg.SPECIES_ATK[m.type])e.atk*=F.cfg.SPECIES_ATK[m.type];e.sx=s[0];e.sy=s[1];e.wx=e.x;e.wy=e.y;e.wanderT=1+Math.random()*3;e.farm=R.id;enemies.push(e);F.stats.spawned++;if(!first){F.stats.respawned++;try{ring(s[0],s[1],8,60,.5,(MOBS[m.type]||{}).c||'#cde',3)}catch(_){}}return true}
function tick(){try{if(typeof P==='undefined'||!P||G.state!=='play'||G.fade||P.dead)return;const zid=G.zone,cfg=DEF[zid];if(!cfg){F.zone=null;return}
    if(F.zone!==zid){if(!build(zid))return;F.first=true}
    const hero={x:P.x,y:P.y},now_=time;let spawnedNow=0;
    /* deficits -> pending timers */
    for(const R of F.regs)for(const m of R.mix){const lv=live(R,m);m.live=lv;const pend=F.pend.filter(p=>p.m===m).length,def=m.n-lv-pend;
      for(let i=0;i<def;i++)F.pend.push({m,R,due:F.first?now_+rnd(0,6):now_+respFor(cfg,m.o)*rnd(.85,1.15),first:F.first})}
    F.first=false;
    /* spawn the due ones (batch-limited so a big refill does not hitch) */
    for(let i=0;i<F.pend.length&&spawnedNow<F.cfg.BATCH;i++){const p=F.pend[i];if(p.due>now_)continue;if(live(p.R,p.m)>=p.m.n){F.pend.splice(i--,1);continue}
      if(spawnOne(cfg,p.R,p.m,hero,p.first)){F.pend.splice(i--,1);spawnedNow++}else p.due=now_+2}
  }catch(e){ERR('tick',e)}}
setInterval(tick,Math.round(F.cfg.TICK*1000));
F.state=()=>{const o={zone:F.zone,N:F.N,stats:F.stats,pend:F.pend.length,regions:[]};if(F.regs)for(const R of F.regs)o.regions.push({id:R.id,mix:R.mix.map(m=>m.type+' '+(m.live==null?'?':m.live)+'/'+m.n)});o.alive=enemies.filter(e=>!e.dead&&e.farm).length;return o};
console.info('[FARM] dense farm spawner loaded for '+Object.keys(DEF).length+' maps');
})();
