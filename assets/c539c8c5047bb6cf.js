
/* ---- r111 mobrefill-r2 (idle despawn OFF on EVERY zone: tested on Maps 4, 10 and 11 as well, where the farm spawner / own populator never refilled despawned monsters: 52 -> 13, 24 -> 5 alive after the first idle 5 minutes) ; idle monsters far from the hero that drifted from their home go back (W22 site, or the spot where the monster was first seen) ---- r105 mobrefill (TEST only; DeaRz decision pending): Map 2 emptied over time because mobchase's idle despawn (5 min idle, > 1400 px from the hero) deletes W22 monsters and W22 never refills them. Fix: (1) on zones that use W22 sites the idle despawn is switched off; (2) an idle W22 monster that is > 1400 px from the hero for > 5 min and > 300 px from its site goes back to its site (inside the site's spawn ring, >= 360 px from the hero) with full HP; (3) 7 new sites around the central fields and 6 in the sparse east (x > 3400) on Map 2, found by farthest-point sampling on walkable cells. ?mobrefill=off = old behaviour. Debug: window.__MOBREFILL ---- */
(function(){'use strict';
const Q=String(location.search),MR=window.__MOBREFILL={ver:'mobrefill-r1',on:!/[?&]mobrefill=off\b/.test(Q),homed:0,added:0,err:null};
if(!MR.on)return;
try{
const PD=window.__W22_DATA&&__W22_DATA.population;if(!PD||!PD.groups)throw new Error('no population');
/* ---- extra sites (Map 2) ---- */
function addSites(){const Z=ZONES.cartroad_plains;if(!Z||MR.sitesDone)return;const tpl=PD.groups.find(g=>g.id==='farmyard_1')||PD.groups[0];
  const pts=PD.groups.map(g=>g.c.slice()),C=40,cand=[];
  for(let y=160;y<Z.h-160;y+=C)for(let x=160;x<Z.w-160;x+=C){if(blocked(x,y,40))continue;if(Math.hypot(x-120,y-600)<420)continue;cand.push([x,y])}
  const pick=(n,xmin,xmax,list)=>{for(let k=0;k<n;k++){let best=null,bd=-1;for(const c of cand){if(c[0]<xmin||c[0]>xmax)continue;let d=1e9;for(const p of pts){const dd=Math.hypot(c[0]-p[0],c[1]-p[1]);if(dd<d)d=dd}if(d>bd){bd=d;best=c}}if(best){pts.push(best);list.push(best)}}};
  const fields=[],east=[];pick(7,2200,3400,fields);pick(6,3400,Z.w-200,east);
  const mk=(id,c,band,m)=>Object.assign(JSON.parse(JSON.stringify(tpl)),{id,c:[Math.round(c[0]),Math.round(c[1])],band,m:[m],core:1,p206:'mrefill',p274agg:band[0]>=7?1:undefined});
  const mixF=['seedling','slime','leafbun','slime','seedling','leafbun','slime'],mixE=['seedling','leafbun','slime','seedling','leafbun','slime'];
  fields.forEach((c,i)=>{PD.groups.push(mk('field_extra_'+(i+1),c,[5,7],mixF[i%7]));MR.added++});
  east.forEach((c,i)=>{PD.groups.push(mk('east_extra_'+(i+1),c,[8,10],mixE[i%6]));MR.added++});
  MR.sitesDone=1;MR.newSites=[...fields,...east].map(c=>c.map(Math.round).join(','));
  try{if(window.W22)W22.pop=null}catch(_){}}
const tickAdd=setInterval(()=>{try{if(typeof blocked==='function'&&ZONES.cartroad_plains&&G.zone){addSites();clearInterval(tickAdd)}}catch(e){MR.err='add '+e.message}},800);
/* ---- idle despawn off + home return ---- */
const siteOf=new Map();const siteC=id=>{if(!siteOf.size)for(const g of PD.groups)siteOf.set(g.id,g);return siteOf.get(id)};
let last=0;
const _u=update;update=function(){const r=_u.apply(this,arguments);
 try{const MC=window.__MOBCHASE;if(!MC||!MC.cfg)return r;
  const w22=enemies.some(e=>e.w22m&&e.gid);const farm=window.__FARM&&__FARM.zone===G.zone;
  if(!MR.base)MR.base=MC.cfg.DESPAWN;MC.cfg.DESPAWN=false;
  if(time-last<5)return r;last=time;
  for(const e of enemies){if(e.dead||e.aggro||(e.m&&(e.m.boss||e.m.raid))||e.gate)continue;let g=null;if(e.w22m&&e.gid)g=siteC(e.gid);else{if(!e._mrHome){e._mrHome={c:[e.x,e.y],spawnR:90};continue}g=e._mrHome}if(!g)continue;
   const mc=e.mc;if(!mc||mc.lostAt==null||time-mc.lostAt<300)continue;
   if(Math.hypot(e.x-P.x,e.y-P.y)<1400)continue;
   const hd=Math.hypot(e.x-g.c[0],e.y-g.c[1]);if(hd<300)continue;
   const a=Math.random()*6.283,rr=Math.random()*(g.spawnR||180)*.7;let x=g.c[0]+Math.cos(a)*rr,y=g.c[1]+Math.sin(a)*rr;
   try{const q=window.__MOBGUARD&&__MOBGUARD.nearest?__MOBGUARD.nearest(x,y,(e.sz||16)*.5):null;if(q){x=q.x;y=q.y}}catch(_){}
   if(Math.hypot(x-P.x,y-P.y)<360)continue;
   e.x=x;e.y=y;e.sx=x;e.sy=y;e.wx=x;e.wy=y;e.vx=e.vy=0;e.hp=e.maxHp;mc.lostAt=time;mc.sx=x;mc.sy=y;mc.mx=x;mc.my=y;MR.homed++}
 }catch(er){MR.err='tick '+er.message}
 return r};
}catch(e){MR.err=e.message}
})();
