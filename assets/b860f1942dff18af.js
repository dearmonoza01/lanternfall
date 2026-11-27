
/* ---- p303 r2 (r2: right end wider, under-deck strip closed; DeaRz 13:21 'เดินลงได้อย่างเดียวขึ้นไม่ได้'): Map 8 NEW gorge stone bridge (DeaRz 24 Oct 11:26 "สะพานตรงนี้มันแคบไป", ChatGPT redraw 13:11, art_src/map8/bridge_redo/gorge_new_v1_*).
   - the gorge bridge picture is the new wide deck with low curbs (same ends, arch and pillar as before), drawn flat on the ground plane like the sky bridge (p300 r3).
   - walls: the old deck walls inside the bridge are dropped; new walls follow the new deck's back curb and front curb; both ends stay open.
   - depth: standing on the new deck the hero is drawn over the bridge. ---- */
(function(){'use strict';
const D=window.__M8_DATA,A=window.__M8_ART,NEW=window.__M8_GORGE_NEW,ID='w23_map8_test';
if(!D||!A||!A.gorge||!NEW||typeof PROP_DEFS==='undefined')return;
A.gorge.src=NEW;
const S2=1.425,T=.866,KV=S2/T,a=A.gorge,BX=D.br.gorge[0],BY=D.br.gorge[1];
const W=(u,v)=>[BX+(u-a.ax2)*S2,BY+(v-a.ay2)*KV],UV=(x,y)=>[(x-BX)/S2+a.ax2,(y-BY)/KV+a.ay2];
const BACK=[[48,80],[125,62],[150,62],[270,120],[380,150],[548,150]],FRONT=[[132,150],[210,148],[400,212],[566,205]];   // r2: right end measured again (the deck is wider there)   // picture px (606 x 531 frame)
const lerp=(P,u)=>{for(let i=0;i<P.length-1;i++){const [a0,b0]=P[i],[a1,b1]=P[i+1];if(u>=a0&&u<=a1)return b0+(b1-b0)*(u-a0)/(a1-a0);}return null;};
const B={};window.__M8GB=B;
/* walls */
const d=PROP_DEFS.m8Solid;if(d&&Array.isArray(d.solid)){const n0=d.solid.length;
  d.solid=d.solid.filter(o=>{const [u,v]=UV(o.dx,o.dy);if(u<70||u>555)return true;const bk=lerp(BACK,u),fr=lerp(FRONT,u);if(bk==null||fr==null)return true;return !(v>bk-30&&v<fr+45);});
  d.solid=d.solid.filter(o=>!(o.dx>=2253&&o.dx<=2346&&o.dy>=1765&&o.dy<=1931));   // old rail-post walls at the west end, now inside the wider deck
  d.solid=d.solid.filter(o=>{const [u,v]=UV(o.dx,o.dy);return !(u>=528&&u<=650&&v>=150&&v<=204);});   // r2: old plateau-edge walls across the (now wider) east end
  B.removed=n0-d.solid.length;const add=[];
  const line=(P,dv)=>{for(let i=0;i<P.length-1;i++){const [u0,v0]=P[i],[u1,v1]=P[i+1];const [x0,y0]=W(u0,v0+dv),[x1,y1]=W(u1,v1+dv),L=Math.hypot(x1-x0,y1-y0),n=Math.max(1,Math.ceil(L/10));
    for(let k=0;k<=n;k++)add.push({dx:x0+(x1-x0)*k/n,dy:y0+(y1-y0)*k/n,r:12});}};
  /* r3 (DeaRz 13:34): blue = old walls round the front-left post removed; red hatching = the corner posts solid (back-left, back-right, front-right column) */
  d.solid=d.solid.filter(o=>{const [u,v]=UV(o.dx,o.dy);return !(u>=78&&u<=150&&v>=120&&v<=200);});
  {const disc=(u,v,r)=>{const [x,y]=W(u,v);add.push({dx:x,dy:y,r});};
   for(const [u,v] of [[18,100],[34,108],[26,90]])disc(u,v,22);                 // back-left post
   for(const [u,v] of [[548,148],[566,152],[580,140]])disc(u,v,22);              // back-right post
   for(const [u,v] of [[574,215],[590,222],[582,232],[596,210]])disc(u,v,20);    // front-right post column
   disc(108,182,16);disc(584,232,14);}                                           // small feet for the two y-sorted front posts
  line(BACK,4);line(FRONT,-4);line(FRONT,44);line(FRONT,20);line(FRONT,32);   // r3: the strip under the deck front is filled, not just outlined
  {const [u0,v0]=FRONT[0],[u1,v1]=FRONT[FRONT.length-1];line([[u0,v0-4],[u0,v0+44]],0);line([[u1,v1-4],[u1,v1+44]],0);}   // r2: the strip under the deck's front is closed (no walking under the bridge)
  /* r5 (DeaRz 14:58 marks, read on the collision view, world px): blue = two stray old wall bits on the east plateau removed;
     red = the notch by the cliff edge north of the bridge and the gap west of the back-left post filled */
  {const inE=(o,cx,cy,rx,ry)=>((o.dx-cx)/rx)**2+((o.dy-cy)/ry)**2<=1;const n1=d.solid.length;
   d.solid=d.solid.filter(o=>!inE(o,2968,1874,157,91)&&!inE(o,3104,2312,100,66)&&!(o.r<=8&&o.dx>=2984&&o.dx<=3210&&o.dy>=2160&&o.dy<=2380));   // + the small specks of that stray bit (screen reading is ~15 px off)B.removed+=n1-d.solid.length;
   const inP=(x,y,Q)=>{let c=false;for(let i=0,j=Q.length-1;i<Q.length;j=i++){const [xi,yi]=Q[i],[xj,yj]=Q[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c;}return c;};
   const fill=Q=>{const xs=Q.map(q=>q[0]),ys=Q.map(q=>q[1]);for(let x=Math.min(...xs);x<=Math.max(...xs);x+=14)for(let y=Math.min(...ys);y<=Math.max(...ys);y+=14)if(inP(x,y,Q))add.push({dx:x,dy:y,r:12});};
   fill([[2868,1610],[2754,1618],[2639,1651],[2611,1693],[2639,1783],[2711,1874],[2811,1957],[2825,1941],[2697,1792],[2682,1717],[2790,1712],[2697,1693],[2840,1635]]);
   fill([[2217,1750],[2267,1759],[2317,1850],[2310,1866],[2253,1841],[2213,1783]]);
   fill([[2663,1902],[2721,1885],[2807,1885],[2871,1910],[2890,1952],[2864,1980],[2778,1973],[2692,1943]]);   // r7 (DeaRz 15:16): the gap between the cliff fill and the deck's back curb
   /* r8 (DeaRz 15:29): the back curb of the east half is solid (the hero stood on it from the snow plateau), and the snow ledge below-left
      of the west end is solid; neither touches the walkable deck */
   for(let u=380;u<=548;u+=7)for(let v=124;v<=140;v+=8){const [x,y]=W(u,v);add.push({dx:x,dy:y,r:12});}
   {const n0=add.length;fill([[2413,2023],[2499,2039],[2506,2114],[2363,2213],[2305,2287],[2162,2279],[2148,2238],[2248,2130],[2348,2064]]);
    const FE=[[40,192],[110,192],...FRONT.slice(1)];for(let i=add.length-1;i>=n0;i--){const [u,v]=UV(add[i].dx,add[i].dy);const fe=lerp(FE,Math.max(40,Math.min(566,u)));if(u>=30&&fe!=null&&v<fe+10)add.splice(i,1);}}}
  d.solid=d.solid.concat(add);B.added=add.length;
  /* r6 (DeaRz 15:05 "เพิ่มตรงนี้เอาออกด้วย"): two more small blue-circled bits: the west deck end left of the front-left post, and the specks east of the back-right post */
  {const inE=(o,cx,cy,rx,ry)=>((o.dx-cx)/rx)**2+((o.dy-cy)/ry)**2<=1;const n2=d.solid.length;
   d.solid=d.solid.filter(o=>!inE(o,2384,1985,48,38)&&!inE(o,3147,1902,55,56));B.removed2=n2-d.solid.length;}}
/* drawing: flat on the ground plane */
const im=new Image();im.src=NEW;
function gspace(c,p){const T0=camT(),th=camY();if(T0>.995&&Math.abs(th)<1e-3)return;const s=CAM.persp?1+(w2s(p.x,p.y)[1]/H-.55)*(1-T0)*.5:1;c.translate(p.x,p.y);c.scale(1/s,T0/s);if(th)c.rotate(th);c.translate(-p.x,-p.y);}
{const g=PROP_DEFS.m8B_gorge;if(g){g.live=(c,p)=>{if(!im.complete||!im.naturalWidth)return;c.save();gspace(c,p);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  c.drawImage(im,p.x-a.ax2*S2,p.y-a.ay2*KV,a.w2*S2,a.h2*KV);c.restore();};B.ground=1;}}
/* r3: the two front corner posts (yellow) are their own y-sorted pieces, cut at full opacity from the bridge picture */
/* r4: each piece is clipped to the post's own outline (r3 cut a rectangle, which carried deck floor over a hero standing beside the post) */
const OUT={86:[[87,141],[101,137],[105,127],[111,116],[117,127],[120,137],[132,141],[130,198],[100,203],[89,196],[89,152]],
           558:[[560,186],[574,180],[578,170],[582,160],[587,170],[590,180],[602,186],[600,245],[572,248],[569,202],[562,198]]};
for(const [x0,x1,top,bot] of [[86,134,114,204],[558,604,158,250]]){const key='m8GbPost_'+x0,[bx,by]=W((x0+x1)/2,bot-8);let pc=null;
  const cut=()=>{if(pc)return pc;if(!im.complete||!im.naturalWidth)return null;const k=im.naturalWidth/a.w2,c=document.createElement('canvas');c.width=Math.ceil((x1-x0)*k);c.height=Math.ceil((bot-top)*k);
    const g=c.getContext('2d');g.beginPath();OUT[x0].forEach(([u,v],i)=>i?g.lineTo((u-x0)*k,(v-top)*k):g.moveTo((u-x0)*k,(v-top)*k));g.closePath();g.clip();
    g.drawImage(im,x0*k,top*k,c.width,c.height,0,0,c.width,c.height);pc=c;return pc;};
  PROP_DEFS[key]=Object.assign({cat:'m4test',w:2,h:2,ax:1,ay:1,liveOnly:1,nofade:1,draw(){}},{n:'Map 8 gorge bridge post '+x0,w:120,h:240,ax:60,ay:220,
    live:(c,p)=>{if(G.zone!==ID)return;const k=cut();if(!k)return;c.save();gspace(c,p);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';const [wx,wy]=W(x0,top);c.drawImage(k,wx,wy,(x1-x0)*S2,(bot-top)*KV);c.restore();}});
  const o=loadPropsFor;loadPropsFor=function(zid){const r=o.apply(this,arguments);try{if(zid===ID&&Array.isArray(r)&&!r.some(q=>q&&q.t===key))r.push({t:key,x:Math.round(bx),y:Math.round(by),s:1,v:0,f:1,ph:0,edge:1,nc:0,m4:1});}catch(_){}return r;};}/* depth: on the new deck the hero is over the bridge */
const onDeck=()=>{if(!P)return false;const [u,v]=UV(P.x,P.y);if(u<0||u>600)return false;const bk=lerp(BACK,Math.max(48,Math.min(545,u))),fr=lerp([[40,192],[110,192],...FRONT.slice(1)],Math.max(40,Math.min(566,u)));return bk!=null&&fr!=null&&v>bk-10&&v<fr+10;};   // r3: the west end's front edge (by the front-left post) is lower
{const o=depthKey;depthKey=function(e){if(e&&e.m8b==='gorge'&&G.zone===ID&&P&&onDeck())return o(P)-.5;return o(e);};}
})();

