
/* ---- p300 r4 (r4 = walls on DeaRz's lines, front-rail overdraw removed (it looked cut-and-pasted); r3 = bridge drawn on the ground plane; r2 = bridge v2 with crystals on both rails; front posts drawn over the hero): Map 8 NEW sky bridge (DeaRz 24 Oct 10:21 "สร้างสะพานใหม่ ให้มีพื้นที่เดิน แบบแมพ1"; ChatGPT redraw 10:35, art_src/map8/bridge_redo).
   - the bridge part of the sky sprite is the new wide, flat bridge with low rails (the tower part is unchanged).
   - up on the deck (level 2) the walls follow the new walkway's two edges (measured on the picture); the old deck walls are dropped,
     the landing walls at the summit end are kept. Both ends stay open: the tower door (Map 9) and the summit landing.
   - the front rail and everything below it are drawn over the hero while the hero is on the deck (like the Map 1 bridge's front piece).
   - "under the bridge" depth (level 1) is measured again from the new picture.
   TEST: window.__M8BR shows what was built. ---- */
(function(){'use strict';
const D=window.__M8_DATA,A=window.__M8_ART,M4=window.__M4T,NEW=window.__M8_SKY_NEW,ID='w23_map8_test';
if(!D||!A||!A.sky||!NEW||!M4)return;
A.sky.src=NEW;   // before Map 8 first loads its pictures
const S2=1.425,T=.866,a=A.sky,BX=D.br.sky[0],BY=D.br.sky[1],CX=600,CY=1700;   // crop origin of the redraw inside the sprite
const KV=S2/T;   // r3: picture px -> ground world (the bridge is now drawn flat on the ground, see GROUND below)
const W=(cx,cy)=>{const u=cx+CX,v=cy+CY;return [BX+(u-a.ax2)*S2,BY+(v-a.ay2)*KV];};   // redraw pixel -> world (ground)
const Fy=x=>400+.75*(x-300)-2,By=x=>262+.62*(x-360);   // walkway front edge (front rail's top) and back edge (back rail's foot), redraw px
const R=12,OFF=21,walls=[];
for(let x=196;x<=1112;x+=8){const [wx,wy]=W(x,Fy(x)-12);walls.push([wx,wy,R]);}   // r4 (DeaRz 13:07 pic 1): on the front rail's inner line   // front wall pulled in so the feet stay off the rail cap
for(let x=300;x<=1356;x+=8){const [wx,wy]=W(x,By(x)+30);walls.push([wx,wy,R]);}   // r5 (DeaRz 13:18 pic 1): at the back curb's foot
{for(let t=0;t<=1;t+=.05){const [wx,wy]=W(1112+52*t,Fy(1112)-12+108*t);walls.push([wx,wy,R]);}}   // r6 (DeaRz 13:28): longer, down to the cliff foot   // r5 (pic 2): the front rail's end continues down to the cliff   // r4: a step in from the back rail (DeaRz's red line + circle)
/* level-2 wall set: new walkway edges + the old walls around the summit landing (x > 1350) */
const onDeck=(x,y)=>{const u=(x-BX)/S2+a.ax2-CX,v=(y-BY)/KV+a.ay2-CY;return u<1375&&v>By(u)-30&&v<Fy(u)+30;};   // r3 (req 14): old landing walls lying on the new deck end are dropped
const keep=D.solD.filter(([x,y])=>x>1350&&!onDeck(x,y));D.solD.length=0;for(const q of keep)D.solD.push(q);for(const q of walls)D.solD.push(q);
/* level-1 depth: lowest painted pixel per 1x column of the new bridge */
const B={walls:walls.length,keep:keep.length};window.__M8BR=B;
const im=new Image();im.onload=()=>{try{const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const g=c.getContext('2d');g.drawImage(im,0,0);
  const px=g.getImageData(0,0,c.width,c.height).data,bot=D.bot.sky;let n=0;
  for(let x=0;x<bot.length;x++){const wx=x*D.KX,u=Math.round(a.ax2+(wx-BX)/S2);if(u<0||u>=c.width)continue;let low=-1;for(let v=c.height-1;v>=0;v--)if(px[(v*c.width+u)*4+3]>40){low=v;break;}
    if(low<0){bot[x]=-1;continue;}bot[x]=(BY+(low-a.ay2)*KV)/D.KY;n++;}B.bot=n;}catch(e){B.botErr=e.message;}};im.src=NEW;
/* front piece: the front rail + everything below it, drawn right after the hero while the hero is on the deck */
const POSTS=[[392,462,420],[654,731,606],[910,988,800]];   // r2: the 3 crystal posts on the front rail (redraw px: x0, x1, crystal tip)
const poly=[];for(let x=180;x<=1120;x+=4){const q=POSTS.find(([a,b])=>x>=a&&x<=b);poly.push([x+CX,(q?q[2]:Fy(x)-2)+CY]);}poly.push([1120+CX,1106+CY],[180+CX,1106+CY]);
let cv=null;const cut=()=>{if(cv)return cv;if(!im.complete||!im.naturalWidth)return null;const xs=poly.map(q=>q[0]),ys=poly.map(q=>q[1]),x0=Math.min(...xs),y0=Math.min(...ys),x1=Math.max(...xs),y1=Math.max(...ys);
  const c=document.createElement('canvas');c.width=x1-x0;c.height=Math.ceil(y1-y0);const g=c.getContext('2d');g.beginPath();poly.forEach(([x,y],i)=>i?g.lineTo(x-x0,y-y0):g.moveTo(x-x0,y-y0));g.closePath();g.clip();
  g.drawImage(im,x0,y0,x1-x0,y1-y0,0,0,x1-x0,y1-y0);cv={c,x0,y0,w:x1-x0,h:y1-y0};return cv;};
/* r3 GROUND: the sky sprite (tower + bridge) is drawn in ground space instead of standing up, so the bridge deck stays on its walls
   at any camera pitch (at the default 60 deg it looks exactly as before). Same transform undo as Map 8's base cut-outs. */
function gspace(c,p){const T0=camT(),th=camY();if(T0>.995&&Math.abs(th)<1e-3)return;const s=CAM.persp?1+(w2s(p.x,p.y)[1]/H-.55)*(1-T0)*.5:1;c.translate(p.x,p.y);c.scale(1/s,T0/s);if(th)c.rotate(th);c.translate(-p.x,-p.y);}
{const d=PROP_DEFS.m8B_sky;if(d){d.live=(c,p)=>{if(!im.complete||!im.naturalWidth)return;c.save();gspace(c,p);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  c.drawImage(im,p.x-a.ax2*S2,p.y-a.ay2*KV,a.w2*S2,a.h2*KV);c.restore();};B.ground=1;}}PROP_DEFS.m8BrFront=Object.assign({cat:'m4test',w:2,h:2,ax:1,ay:1,liveOnly:1,nofade:1,draw(){}},{n:'Map 8 new sky bridge front rail (over the hero on the deck)',w:a.w2*S2,h:a.h2*S2,ax:a.ax2*S2,ay:a.ay2*S2,
  live:(c,p)=>{const m=M4.map8;if(!m||m.level!==2||G.zone!==ID)return;const k=cut();if(!k)return;c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
    gspace(c,p);c.drawImage(k.c,p.x-a.ax2*S2+k.x0*S2,p.y+(k.y0-a.ay2)*KV,k.w*S2,k.h*KV);c.restore();}});
{const o=loadPropsFor;loadPropsFor=function(zid){const r=o.apply(this,arguments);try{if(false&&zid===ID&&Array.isArray(r)&&!r.some(q=>q&&q.t==='m8BrFront'))r.push({t:'m8BrFront',x:BX,y:BY,s:1,v:0,f:1,ph:0,edge:1,nc:0,m4:1,m8front:1});}catch(_){}return r;};}
/* walking off the new deck's summit end (its end edge, redraw px (1115,1020)-(1360,880)) puts the hero back on the ground level */
const LZ=D.look.lz,LZU=(()=>{const r=atob(LZ.b),u=new Uint8Array(r.length);for(let i=0;i<r.length;i++)u[i]=r.charCodeAt(i);return u;})();
const inLz=(x,y)=>{x=Math.floor(x)-LZ.x0;y=Math.floor(y)-LZ.y0;if(x<0||y<0||x>=LZ.w||y>=LZ.h)return false;const i=y*LZ.w+x;return !!(LZU[i>>3]&(128>>(i&7)));};   // the summit landing: Map 8's own rule handles it there
{const E1=[1115,1020],E2=[1360,880];setInterval(()=>{try{const m=M4.map8;if(!m||!m.on||G.zone!==ID||m.level!==2||!P||G.fade||!m.setLevel)return;
  const cx=(P.x-BX)/S2+a.ax2-CX,cy=(P.y-BY)/KV+a.ay2-CY,s=(E2[0]-E1[0])*(cy-E1[1])-(E2[1]-E1[1])*(cx-E1[0]);
  const nearLanding=P.x>1360&&P.x<1850&&P.y>980&&P.y<1310;   // around the summit landing: Map 8's own up/down rule works there
  if(s>0&&cx>1000&&!nearLanding&&!inLz(P.x/D.KX,P.y/D.KY)){m.setLevel(1);B.down=(B.down||0)+1;}}catch(e){B.err=e.message;}},60);}
/* r7 (DeaRz 13:29 "ให้มันยืนข้างหลังเสา"): each of the 3 crystal posts on the front rail is its own y-sorted piece, cut from the bridge picture
   at full opacity (same pixels as the bridge, so no visible seam): a hero standing behind a post is drawn under it. */
/* r8 (DeaRz 13:40 "ตัดตามรูปทรงสิไม่ใช่ตัดสี่เหลี่ยม"): each piece is clipped to the post's own outline (crystal, cap, column), measured
   on the picture from (x0-10, tip-10); r7 cut a rectangle, which carried deck floor over a hero standing beside the post */
const OUTL={392:[[46,13],[70,47],[77,56],[79,64],[78,88],[55,98],[54,138],[48,144],[18,142],[14,134],[14,84],[11,82],[10,64],[13,57],[24,50]],
            654:[[50,16],[73,52],[82,60],[84,68],[83,92],[58,104],[57,146],[50,152],[20,150],[15,142],[15,90],[12,88],[11,70],[15,62],[26,55]],
            910:[[51,14],[74,50],[83,59],[85,67],[84,92],[59,103],[57,146],[51,152],[20,150],[15,142],[15,90],[12,88],[11,68],[15,61],[27,54]]};
for(const [x0,x1,top] of POSTS){const cx=(x0+x1)/2,bot=Fy(cx)+70,[bx,by]=W(cx,Fy(cx)),key='m8BrPost_'+x0,ox=x0-10,oy=top-10;let pc=null;
  const cut2=()=>{if(pc)return pc;if(!im.complete||!im.naturalWidth)return null;const c=document.createElement('canvas');c.width=x1-x0+20;c.height=Math.ceil(bot-oy);
    const g=c.getContext('2d');g.beginPath();OUTL[x0].forEach(([u,v],i)=>i?g.lineTo(u,v):g.moveTo(u,v));g.closePath();g.clip();
    g.drawImage(im,ox+CX,oy+CY,c.width,c.height,0,0,c.width,c.height);pc=c;return pc;};
  PROP_DEFS[key]=Object.assign({cat:'m4test',w:2,h:2,ax:1,ay:1,liveOnly:1,nofade:1,draw(){}},{n:'Map 8 sky bridge front post '+x0,w:120,h:300,ax:60,ay:280,
    live:(c,p)=>{if(G.zone!==ID)return;const k=cut2();if(!k)return;c.save();gspace(c,p);   // undo the engine's upright transform about this piece's own anchor
      c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
      const [wx,wy]=W(ox,oy);c.drawImage(k,wx,wy,k.width*S2,k.height*KV);c.restore();}});
  const o=loadPropsFor;loadPropsFor=function(zid){const r=o.apply(this,arguments);try{if(zid===ID&&Array.isArray(r)&&!r.some(q=>q&&q.t===key))r.push({t:key,x:Math.round(bx),y:Math.round(by),s:1,v:0,f:1,ph:0,edge:1,nc:0,m4:1});}catch(_){}return r;};}{const o=depthKey;depthKey=function(e){if(e&&e.m8front&&G.zone===ID&&P)return o(P)+.7;return o(e);};}
})();

