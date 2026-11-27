
/* ---- p297 r1: Map 2 fixes (DeaRz 24 Oct 05:03 "เช็คกันชนแมพ 2 ทำไมม้อนยังทะลุบ้านอยู่ ... ม้อนเตอร์เมื่อเราโจมตีจะเข้าสู่สถานะ Combat ซึ่งจะตามเรา*2 ของระยะจุดเกิด").
   1. Houses: the collision circles already cover each house's ground footprint (no monster ever stood inside them in tests), but the two
      Chibi houses are drawn at an angle and were depth-sorted by their lowest point only, so a monster (or the hero) standing on open
      ground in front of the door was drawn BEHIND the wall and looked like it walked into the house. Now anything whose feet are in
      front of the house's visible base line (measured from the art's own outline) draws over the house, anything behind draws under it;
      the house no longer fades when the hero stands in front of the door.
   2. Combat: a monster you attack (or that spots you) is in Combat: it keeps chasing (no early calm-down) until it is 2 x its spawn
      range from its spawn point, then the existing reset runs (walks home, immune, full HP). Spawn range = the group's spawn radius,
      or 220 px (the normal wander radius) when the group has none. Map 2 only.
   ?m2fix=off = old behaviour. Debug: window.__P297. ---- */
(function(){'use strict';
const ST=window.__P297={ver:'p297-r1',on:!/m2fix=off/.test(location.search),houses:0,leash:{},err:null};
if(!ST.on)return;
const CZ='cartroad_plains',FL={"m2HouseRed": [[-80, -76], [-72, -73], [-64, -70], [-56, -70], [-48, -67], [-40, -52], [-32, -49], [-24, -46], [-16, -44], [-8, -41], [0, -39], [8, -36], [16, -34], [24, -35], [32, -39], [40, -36], [48, -33], [56, -33], [64, -33], [72, -31], [80, -24], [88, -22], [96, -19], [104, -15], [112, -13], [120, -12], [128, -11], [136, -10], [144, -5], [152, -2], [160, 0], [168, -5], [176, -17], [184, -25], [192, -34], [200, -48], [208, -61], [216, -72], [224, -79], [227, -82]], "m2HouseGreen": [[-164, -65], [-156, -62], [-148, -61], [-140, -61], [-132, -58], [-124, -55], [-116, -52], [-108, -49], [-100, -47], [-92, -45], [-84, -43], [-76, -41], [-68, -38], [-60, -26], [-52, -24], [-44, -22], [-36, -20], [-28, -18], [-20, -15], [-12, -12], [-4, -9], [4, -6], [12, -6], [20, -9], [28, -13], [36, -14], [44, -11], [52, -6], [60, -3], [68, -1], [76, 0], [84, -4], [92, -7], [100, -14], [108, -18], [116, -21], [124, -24], [132, -29], [140, -33], [148, -36], [156, -40], [164, -44], [172, -47], [180, -54], [188, -54], [196, -57], [203, -60]]},TOL=6,R0=220;
let HOUSES=[];
function refresh(){HOUSES=G.zone===CZ?PROPS.filter(p=>p&&FL[p.t]):[];ST.houses=HOUSES.length;}
function frontY(h,x){const L=FL[h.t],dx=x-h.x;if(dx<=L[0][0])return h.y+L[0][1];const n=L.length-1;if(dx>=L[n][0])return h.y+L[n][1];
  for(let i=1;i<=n;i++)if(dx<=L[i][0]){const a=L[i-1],b=L[i],u=(dx-a[0])/((b[0]-a[0])||1);return h.y+a[1]+(b[1]-a[1])*u;}return h.y+L[n][1];}
function near(h,x,y){const d=PROP_DEFS[h.t];return x>h.x-d.ax-30&&x<h.x-d.ax+d.w+30&&y>h.y-d.ay&&y<h.y+20;}
const front=(h,x,y)=>y>=frontY(h,x)-TOL;
const _dk=depthKey;depthKey=function(e){const k=_dk.apply(this,arguments);
  try{if(!HOUSES.length||!e||(e.t&&PROP_DEFS[e.t])||typeof e.x!=='number'||Math.abs(camY())>1e-3)return k;
    for(const h of HOUSES){if(!near(h,e.x,e.y))continue;const hk=_dk(h);return front(h,e.x,e.y)?Math.max(k,hk+.5):Math.min(k,hk-.5);}}catch(er){ST.err='dk '+er.message;}
  return k;};
for(const t in FL){const d=PROP_DEFS[t];if(!d||!d.live)continue;const o=d.live;
  d.live=function(g,p){if(P&&near(p,P.x,P.y)&&front(p,P.x,P.y)){const y0=P.y;P.y=p.y+100;try{return o.apply(this,arguments);}finally{P.y=y0;}}return o.apply(this,arguments);};}
function leashOf(e){if(e.p297L!=null&&e.p297g===e.gid)return e.p297L;let r=R0;
  try{const g=window.__W22_DATA.population.groups.find(q=>q.id===e.gid);if(g&&g.spawnR)r=g.spawnR;}catch(_){}
  e.p297g=e.gid;e.p297L=Math.min(560,2*r);ST.leash[e.gid]=e.p297L;return e.p297L;}
const _ue=updEnemies;updEnemies=function(dt){
  if(G.zone===CZ)for(const e of enemies){if(e.dead||e.gid==null||e.w22ret)continue;e.leashR=leashOf(e);if(e.aggro)e.calmT=0;}
  return _ue.apply(this,arguments);};
const _lz=loadZone;loadZone=function(){const r=_lz.apply(this,arguments);try{refresh();}catch(er){ST.err='zone '+er.message;}return r;};
setInterval(()=>{try{refresh();}catch(_){}},2000);
try{if(typeof G!=='undefined'&&G.zone)refresh();}catch(_){}
})();

