
/* ---- p296 r5 (r4 = solid stair rails; r5 = Map 9 stairs per floor): stair feel on Maps 4-9 (r1 = Map 4 only; r2 = all maps, DeaRz 24 Oct 08:30; r3 = left / right free on the stairs, DeaRz 24 Oct 08:57).
   On every stairway (measured on the art / collision corridor):
   1. walking on the steps is slower (x0.62) and the hero rises and drops a little on every step (drawn only, the position is not changed)
   2. r3: left / right work on the steps (the stair's rails / walls still block); on Map 9's diagonal stair any push along it climbs it
   3. cliffs / walls beside the stairs: the maps' own collision + r4 rails
   4. draw order: unchanged
   Stair kinds: 'v' = straight up the screen (rectangle x0..x1, y0..y1); 'd' = diagonal (Map 9 back-wall stair: foot a -> top b, half width hw).
   TEST: window.__STAIR.off = true turns it off; ?stair=off removes it. ---- */
(function(){'use strict';
if(/stair=off/.test(location.search))return;
const v=(z,x0,y0,x1,y1)=>({z,v:1,x0,x1,y0,y1});
const ST=[
  v('w22_map4_test',1415,2550,1550,2885),v('w22_map4_test',375,1495,525,1835),                       // Map 4: the two cliff stairs
  v('w22_map5_test',917,1350,1067,1664),v('w22_map5_test',973,1652,1123,1840),                        // Map 5: upper and lower flight (map data: x 992 / 1048)
  v('w23_map6_test',1673,874,1832,1116),                                                              // Map 6: ridge stair
  v('w23_map7_test',1581,2466,1841,2743),v('w23_map7_test',1595,1766,1825,2004),v('w23_map7_test',1589,547,1829,787),   // Map 7: centre stairs (town, plaza, palace back)
  v('w23_map7_test',440,1898,600,2074),v('w23_map7_test',2841,1898,2989,2074),                        // Map 7: west / east terrace stairs
  v('w23_map7_test',629,974,772,1212),v('w23_map7_test',2645,974,2773,1212),                          // Map 7: north-west / north-east stairs
  v('w23_map8_test',1730,1475,1953,2053),v('w23_map8_test',1767,1279,1935,1430)];                     // Map 8: summit stair + lantern plinth steps
{const KX=1.75,KY=1.75/.866,F9=window.__M4T&&__M4T.map9&&__M4T.map9.F;for(let n=1;n<=6;n++){const s=F9&&F9[n]&&F9[n].st;   // r5: each floor's measured stair (centre line between its two edges)
  if(s){const {bk,fr}=s;ST.push({z:'w24_map9f'+n+'_test',a:[(bk[0]+fr[0])/2*KX,(bk[1]+fr[1])/2*KY],b:[(bk[2]+fr[2])/2*KX,(bk[3]+fr[3])/2*KY],hw:34*KX});}
  else ST.push({z:'w24_map9f'+n+'_test',a:[440*KX,392*KY],b:[690*KX,238*KY],hw:30*KX});}}   // Map 9 floors 1-6: back-wall stair
const STEP=26,SLOW=.62,HOP=4;
const S={off:false,on:null,last:null,ST,stats:{locked:0}};window.__STAIR=S;
/* r4 (DeaRz 24 Oct 09:05 "เช็คกันชนใหม่"): with left / right free the hero could walk onto the stone rails beside the steps (Map 5 most of all).
   Solid rails along both sides of every straight stair, measured on screen: Map 4 + Map 5 rail centres; Map 7 / Map 8 along the stair edges
   (their walls were mostly solid already; this closes the gaps). Map 6's stair is already narrow between solid rocks. */
const RAIL={
  w22_map4_test:[[1410,2573,1408,2856],[1552,2573,1554,2856],[368,1522,357,1803],[518,1522,537,1803]],
  w22_map5_test:[[915,1367,915,1646],[1069,1367,1069,1646],[961,1659,961,1821],[1133,1659,1133,1821]],
  w23_map7_test:[[1572,2470,1572,2740],[1857,2470,1857,2740],[1589,1770,1589,2000],[1829,1770,1829,2000],[1589,550,1589,785],[1829,550,1829,785],
                 [440,1900,440,2072],[600,1900,600,2072],[2841,1900,2841,2072],[2989,1900,2989,2072],[629,978,629,1210],[772,978,772,1210],[2645,978,2645,1210],[2773,978,2773,1210]],
  w23_map8_test:[[1724,1420,1712,2050],[1962,1420,1953,2050]]};
const RR=24;
for(const z in RAIL){const sol=[];for(const [x1,y1,x2,y2] of RAIL[z]){const L=Math.hypot(x2-x1,y2-y1),n=Math.max(1,Math.ceil(L/(RR*.8)));for(let i=0;i<=n;i++)sol.push({dx:x1+(x2-x1)*i/n,dy:y1+(y2-y1)*i/n,r:RR});}
  PROP_DEFS['stRail_'+z]=Object.assign({cat:'m4test',w:2,h:2,ax:1,ay:1,liveOnly:1,nofade:1,draw(){}},{n:'stair rails '+z,solid:sol});}
{const o=loadPropsFor;loadPropsFor=function(zid){const r=o.apply(this,arguments);try{if(RAIL[zid]&&Array.isArray(r)&&!r.some(p=>p&&p.t==='stRail_'+zid))r.push({t:'stRail_'+zid,x:0,y:0,s:1,v:0,f:1,ph:0,edge:1,nc:0,m4:1});}catch(_){}return r;};}
S.RAIL=RAIL;
function at(x,y){for(const s of ST){if(G.zone!==s.z)continue;
  if(s.v){if(x>s.x0&&x<s.x1&&y>s.y0&&y<s.y1)return {s,ux:0,uy:-1,al:s.y1-y};continue;}
  const ax=s.b[0]-s.a[0],ay=s.b[1]-s.a[1],L=Math.hypot(ax,ay),ux=ax/L,uy=ay/L,px=x-s.a[0],py=y-s.a[1],t=(px*ux+py*uy)/L,d=Math.abs(px*uy-py*ux);
  if(t>-.02&&t<1.02&&d<s.hw)return {s,ux,uy,al:t*L};}
  return null;}
{const o=collide;collide=function(e,r){
  if(e===P&&P&&!S.off&&!P.dash){const L=S.last,h=at(P.x,P.y);
    if(h&&L&&L.z===G.zone&&Math.hypot(P.x-L.x,P.y-L.y)<60){const dx=P.x-L.x,dy=P.y-L.y;
      if(h.s.v){P.x=L.x+dx*SLOW;P.y=L.y+dy*SLOW;}   // r3: straight stairs = free movement (left / right too), just slower; the stair's own rails / walls still block
      else{const dot=dx*h.ux+dy*h.uy,len=Math.hypot(dx,dy);
        if(Math.abs(dot)>.45*len){const k=Math.sign(dot)*len*SLOW;P.x=L.x+h.ux*k;P.y=L.y+h.uy*k;}   /* diagonal (Map 9): a push mostly along the stair climbs it */
        else{P.x=L.x+dx*SLOW;P.y=L.y+dy*SLOW;}}}   /* r6 (DeaRz 16:01 "แดชได้แต่เดินไปไม่ได้"): a sideways push moves freely (slower), like the other stairs; the edge walls still block */
    S.on=h;}
  const out=o.apply(this,arguments);if(e===P&&P)S.last={x:P.x,y:P.y,z:G.zone};return out;};}
{const o=drawPlayer;drawPlayer=function(){   // same lift as the sky-deck code: shift the whole hero up inside the world transform
  const h=S.on;if(h&&!S.off&&P&&G.state==='play'&&!P.dash){const ph=((h.al/STEP)%1+1)%1,u=HOP*Math.sin(Math.PI*ph);
    if(u>.05){ctx.save();ctx.translate(0,-u/.866);try{return o.apply(this,arguments);}finally{ctx.restore();}}}
  return o.apply(this,arguments);};}
})();

