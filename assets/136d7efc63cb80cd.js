
/* ---- merge m9: p199 Map 2 Chibi ground ---- */
/* p199 — Map 2 (cartroad_plains) ground re-painted in the same Chibi look as Map 1 (user 9 Oct 2026 22:17: "แมพ2 เปลี่ยนพื้นเป็นแบบแมพ1").
   Same painter and the same colour spec as p164 (Map 1 ground r3), run on the Map 2 bake: roads / paths keep their painted outline, the 4 farm plots
   are kept byte-for-byte, the forest ground follows the Map 2 tree rows. Ground only: no object, collision, path or layout change. */
/* r2 (user 22:27: not a copy of Map 1, a ground that suits the Chibi art): same flat Chibi painter, own Map 2 palette — a warmer, sunnier
   meadow for the farm plains; plots keep only their soil (no old grass rectangle around them) */
window.__M2GROUND=(function(){const B=window.__M1GROUND||{},P=Object.assign({},B.params||{},{
  grass:'#9EC26E',grass_light:'#B6D385',grass_dark:'#86AA5C',forest_grass:'#789E55',lawn:'#B6D385',grass_rim:'#7E9F55',plot_pad:0,protect_grow_px:0});
  return Object.assign({},B,{version:'p199-m2ground-r2',zone:'cartroad_plains',params:P});})();
(function(){const C=window.__M2GROUND;if(!C||typeof genBG!=='function')return;
const Z=C.zone||'sylva_lab',P=C.params,ST={zone:Z,runs:0,cache_hit:0,last:null,errors:0};
function smooth(a,b,x){x=(x-a)/(b-a);x=x<0?0:x>1?1:x;return x*x*(3-2*x);}
function boxH(s,o,W,H,r){const n=2*r+1;for(let y=0;y<H;y++){const row=y*W;let acc=0;for(let k=-r;k<=r;k++)acc+=s[row+Math.min(W-1,Math.max(0,k))];
  for(let x=0;x<W;x++){o[row+x]=acc/n;acc+=s[row+Math.min(W-1,x+r+1)]-s[row+Math.max(0,x-r)];}}}
function boxV(s,o,W,H,r){const n=2*r+1,acc=new Float32Array(W);for(let k=-r;k<=r;k++){const row=Math.min(H-1,Math.max(0,k))*W;for(let x=0;x<W;x++)acc[x]+=s[row+x];}
  for(let y=0;y<H;y++){const ro=y*W,ra=Math.min(H-1,y+r+1)*W,rs=Math.max(0,y-r)*W;for(let x=0;x<W;x++){o[ro+x]=acc[x]/n;acc[x]+=s[ra+x]-s[rs+x];}}}
/* blur a (W×H) into out using tmp; passes ≥1; a and out may be the same buffer */
function blurTo(a,out,tmp,W,H,r,passes){let src=a;for(let p=0;p<(passes||1);p++){boxH(src,tmp,W,H,r);boxV(tmp,out,W,H,r);src=out;}return out;}
function hash(i,j,s){let h=(i*374761393+j*668265263+s*1442695041)|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296;}
function vnoise(x,y,sc,s){const fx=x/sc,fy=y/sc,i=Math.floor(fx),j=Math.floor(fy),tx=fx-i,ty=fy-j,u=tx*tx*(3-2*tx),v=ty*ty*(3-2*ty);
  return (hash(i,j,s)*(1-u)+hash(i+1,j,s)*u)*(1-v)+(hash(i,j+1,s)*(1-u)+hash(i+1,j+1,s)*u)*v;}
/* palette colours are the ON-SCREEN target: the game's runtime light / grade over the ground (measured, headless: screen = a·bake + b per channel)
   is inverted once so the displayed ground shows the specified colours */
const DC=P.display_comp||null;
const GG=P.ground_gain||1;
const hex0=h=>{const c=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];if(!DC)return c;return c.map((v,i)=>Math.max(0,Math.min(255,(v-DC[i][1])/DC[i][0])));};
const hex=h=>{const c=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)].map(v=>v*GG);if(!DC)return c;return c.map((v,i)=>Math.max(0,Math.min(255,(v-DC[i][1])/DC[i][0])));};
const css=h=>{if(!DC||h[0]!=='#')return h;const c=hex(h);return 'rgb('+c.map(v=>Math.round(v)).join(',')+')';};
/* ---- masks (alpha only, rasterised in a sub-rectangle at canvas scale k; road mask at 1/4 scale) ---- */
function rect(x0,y0,x1,y1,k,W,H){const a=Math.max(0,Math.floor(x0*k)),b=Math.max(0,Math.floor(y0*k)),c=Math.min(W,Math.ceil(x1*k)),d=Math.min(H,Math.ceil(y1*k));return c>a&&d>b?[a,b,c-a,d-b]:null;}
function raster(bb,k,draw,f){f=f||1;if(!bb)return null;const w=Math.ceil(bb[2]/f),h=Math.ceil(bb[3]/f),cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d');
  g.setTransform(k/f,0,0,k/f,-bb[0]/f,-bb[1]/f);g.fillStyle='#000';g.strokeStyle='#000';draw(g);const d=g.getImageData(0,0,w,h).data,a=new Uint8Array(w*h);for(let i=0;i<a.length;i++)a[i]=d[i*4+3];cv.width=cv.height=0;
  return {a,x:bb[0],y:bb[1],w:bb[2],h:bb[3],f,sw:w,sh:h};}
const mAt=(m,x,y)=>{if(!m)return 0;const u=x-m.x,v=y-m.y;if(u<0||v<0||u>=m.w||v>=m.h)return 0;return m.f===1?m.a[v*m.w+u]:m.a[((v/m.f)|0)*m.sw+((u/m.f)|0)];};
function polyBox(pts,grow){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of pts){x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1]);}return [x0-grow,y0-grow,x1+grow,y1+grow];}
function sidePoly(g,S,gl,gr){g.beginPath();S.forEach((q,i)=>{const x=q.x+q.nx*(q.wl+gl),y=q.y+q.ny*(q.wl+gl);i?g.lineTo(x,y):g.moveTo(x,y);});for(let i=S.length-1;i>=0;i--){const q=S[i];g.lineTo(q.x-q.nx*(q.wr+gr),q.y-q.ny*(q.wr+gr));}g.closePath();g.fill();}
function shadowDraw(g,SD){g.lineJoin='round';
  const one=(S,ox,oy,px,py,posts)=>{for(const [gr,al] of S.grow){g.globalAlpha=al;g.lineWidth=gr*2;g.beginPath();S.poly.forEach((p,i)=>i?g.lineTo(ox+p[0],oy+p[1]):g.moveTo(ox+p[0],oy+p[1]));g.closePath();if(gr>0)g.stroke();g.fill();
    if(posts)for(const q of posts){g.beginPath();g.ellipse(px+q[0]+S.off[0]*.7,py+q[1]+S.off[1]*.7,q[2]+gr,(q[2]+gr)*.55,0,0,6.2832);g.fill();}}};
  if(SD.p1)one(SD.p1.shadow,SD.p1.x+SD.p1.shadow.off[0],SD.p1.y+SD.p1.shadow.off[1],SD.p1.x,SD.p1.y,SD.p1.shadow.posts);
  for(const S of SD.p1w)one(S,S.x+S.off[0],S.y+S.off[1],S.x,S.y,null);
  for(const S of SD.p2)one(S,S.x+S.off[0],S.y+S.off[1],S.x,S.y,S.posts);g.globalAlpha=1;}
/* collect the shape data from the live game (read only) */
function resample(pts,hw){const S=[];let s=0;for(let i=0;i<pts.length-1;i++){const x0=pts[i][0],y0=pts[i][1],x1=pts[i+1][0],y1=pts[i+1][1],L=Math.hypot(x1-x0,y1-y0)||1,nx=-(y1-y0)/L,ny=(x1-x0)/L;
  for(let t=0;t<L;t+=5)S.push({x:x0+(x1-x0)*t/L,y:y0+(y1-y0)*t/L,nx,ny,wl:hw,wr:hw,s:s+t});s+=L;}
  const l=pts[pts.length-1];if(S.length){const q=S[S.length-1];S.push({x:l[0],y:l[1],nx:q.nx,ny:q.ny,wl:hw,wr:hw,s});}return S;}
/* Map 2 shape data (read only): roads = the W22 road polylines, plots = the Map 2 field-art plots (kept byte-for-byte), trees = Map 2 layout rows;
   no river, no clearing, no baked house shadows on this map */
function sources(){const W=window.W22||{},rl=(W.roads&&W.roads[Z])||[];
  const roads=rl.filter(r=>r&&r.pts&&r.pts.length>1).map(r=>resample(r.pts,(r.w||60)/2));
  const fa=(window.__FIELD_ART_LIST||[]).find(e=>e.map==='m2');const plots=(fa?fa.plots:[]).map(pl=>Object.assign({},pl,{grow:0,edge_amp:0,edge_soft:0}));
  const TT=new Set(P.forest_types||[]),L=window.__M2L||{},trees=(L.props||[]).filter(r=>r&&TT.has(r[1])).map(r=>[r[2],r[3]]);
  return {roads,plots,river:[],clr:null,SD:{p1:null,p1w:[],p2:[]},trees};}
function buildMasks(S,k,W,H){const M={};
  M.road=raster([0,0,W,H],k,g=>{for(const R of S.roads)sidePoly(g,R,0,0);},4);
  const kp=P.plot_pad;let pb=null;for(const pl of S.plots){const b=polyBox(pl.poly,(pl.grow||0)+(pl.edge_amp||0)+(pl.edge_soft||0)+kp+2);pb=pb?[Math.min(pb[0],b[0]),Math.min(pb[1],b[1]),Math.max(pb[2],b[2]),Math.max(pb[3],b[3])]:b;}
  if(pb){const bb=rect(pb[0],pb[1],pb[2],pb[3],k,W,H);
    M.keep=raster(bb,k,g=>{g.lineJoin='round';for(const pl of S.plots){const gr=(pl.grow||0)+(pl.edge_amp||0)+(pl.edge_soft||0)+kp;g.lineWidth=gr*2;g.beginPath();pl.poly.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();g.fill();g.stroke();}});
    M.core=raster(bb,k,g=>{g.lineJoin='round';g.lineWidth=P.protect_grow_px*2;for(const pl of S.plots){g.beginPath();pl.poly.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();g.fill();if(P.protect_grow_px>0)g.stroke();}});}
  if(S.river.length){const gp=P.water_gate_px;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const q of S.river){const r=Math.max(q.wl,q.wr)+gp+2;x0=Math.min(x0,q.x-r);x1=Math.max(x1,q.x+r);y0=Math.min(y0,q.y-r);y1=Math.max(y1,q.y+r);}
    const rb=rect(x0,y0,x1,y1,k,W,H);M.gate=raster(rb,k,g=>sidePoly(g,S.river,gp,gp));M.wprot=raster(rb,k,g=>sidePoly(g,S.river,P.protect_grow_px,P.protect_grow_px));}
  if(S.clr){const b=polyBox(S.clr,2);M.lawn=raster(rect(b[0],b[1],b[2],b[3],k,W,H),k,g=>{g.beginPath();S.clr.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();g.fill();});}
  {const all=[];if(S.SD.p1){const s=S.SD.p1.shadow;for(const p of s.poly)all.push([S.SD.p1.x+s.off[0]+p[0],S.SD.p1.y+s.off[1]+p[1]]);}for(const s of S.SD.p1w.concat(S.SD.p2))for(const p of s.poly)all.push([s.x+s.off[0]+p[0],s.y+s.off[1]+p[1]]);
   if(all.length){const b=polyBox(all,40);M.shadow=raster(rect(b[0],b[1],b[2],b[3],k,W,H),k,g=>shadowDraw(g,S.SD));}}
  M.trees=S.trees;
  return M;}
/* ---- the re-paint (in place on the bake canvas) ---- */
function repaint(c,M,k){const t0=performance.now(),T={},tm=n=>{const t=performance.now();T[n]=+(t-tm.l).toFixed(1);tm.l=t;};tm.l=t0;
  const g=c.getContext('2d'),W=c.width,H=c.height,N=W*H,id=g.getImageData(0,0,W,H),d=id.data;
  const G0=hex(P.grass),GL=hex(P.grass_light),GD=hex(P.grass_dark),R0=hex(P.road),R1=hex(P.road_2),Y0=hex(P.yard),RIM=hex(P.road_rim),BK=hex(P.bank),BKW=hex(P.bank_wet),GR=hex(P.grass_rim),LL=hex(P.lawn);
  tm('read');
  // 1. dirt-ness of every pixel (warm vs green), water inside the river gate (blue)
  const A=new Float32Array(N),B=new Float32Array(N),Cm=new Float32Array(N);
  const LD=new Float32Array(511),LWt=new Float32Array(511);for(let v=-255;v<=255;v++){LD[v+255]=smooth(P.dirt_lo,P.dirt_hi,v);LWt[v+255]=smooth(P.water_lo,P.water_hi,v);}
  for(let i=0,p=0;i<N;i++,p+=4)A[i]=LD[d[p]-d[p+1]+255];
  let WB=null;if(M.gate){const m=M.gate,w=m.w,h=m.h,wat=new Float32Array(w*h);let any=0;
    for(let v=0;v<h;v++)for(let u=0;u<w;u++){const gv=m.a[v*w+u];if(!gv)continue;const p=((v+m.y)*W+u+m.x)*4;const wv=(gv/255)*LWt[d[p+2]-d[p]+255];if(wv>0){wat[v*w+u]=wv;any=1;}}
    if(any){const t=new Float32Array(w*h),Wm=new Float32Array(w*h),rc=Math.max(1,Math.round(P.water_close_px*k));
      // water mask = blue pixels, closed (dilate → erode) so the old painted bank pebbles / foam specks inside the water stay water (kept as painted)
      blurTo(wat,Wm,t,w,h,rc,1);for(let i=0;i<Wm.length;i++)Wm[i]=Wm[i]>.2?1:0;blurTo(Wm,Wm,t,w,h,rc,1);for(let i=0;i<Wm.length;i++)Wm[i]=Math.max(smooth(.3,.6,wat[i]),smooth(.8,.97,Wm[i]));
      blurTo(Wm,Wm,t,w,h,1,1);
      const W1=new Float32Array(w*h),W2=new Float32Array(w*h);blurTo(Wm,W1,t,w,h,Math.round(P.bank_px*k),2);blurTo(Wm,W2,t,w,h,Math.round((P.bank_px+P.bank_rim_px)*k),2);WB={x:m.x,y:m.y,w,h,Wm,W1,W2,wat};}}
  tm('classify_water');
  blurTo(A,Cm,B,W,H,Math.max(1,Math.round(1.5*k)),1);for(let i=0;i<N;i++)Cm[i]=smooth(.35,.65,Cm[i]);   // Cm = crisp anti-aliased dirt mask
  blurTo(Cm,A,B,W,H,Math.max(1,Math.round(P.rim_px*k)),1);                                                // A  = dirt mask blurred (edge rims)
  tm('dirt_masks');
  // road vs yard (1/4 grid), lawn (sub-rect), noise fields (1/4 grid, world coordinates)
  let RY=null;if(M.road){const m=M.road,w=m.sw,h=m.sh,a=new Float32Array(w*h),t=new Float32Array(w*h);for(let i=0;i<a.length;i++)a[i]=m.a[i]/255;blurTo(a,a,t,w,h,Math.max(1,Math.round(P.yard_blend_px*k/4)),2);RY={a,w,h};}
  let LWb=null;if(M.lawn){const m=M.lawn,w=m.w,h=m.h,pad=Math.round(P.lawn_soft_px*k*2+4),ww=w+pad*2,hh=h+pad*2,a=new Float32Array(ww*hh),t=new Float32Array(ww*hh);
    for(let v=0;v<h;v++)for(let u=0;u<w;u++)a[(v+pad)*ww+u+pad]=m.a[v*w+u]/255;blurTo(a,a,t,ww,hh,Math.max(1,Math.round(P.lawn_soft_px*k)),2);LWb={a,x:m.x-pad,y:m.y-pad,w:ww,h:hh};}
  const NF=4,nw=Math.ceil(W/NF)+2,nh=Math.ceil(H/NF)+2,NB=new Float32Array(nw*nh),NM=new Float32Array(nw*nh);
  for(let y=0;y<nh;y++)for(let x=0;x<nw;x++){const wx=(x*NF)/k,wy=(y*NF)/k;NB[y*nw+x]=vnoise(wx,wy,P.blob_scale,11)*.65+vnoise(wx,wy,P.blob_scale*.45,23)*.35;NM[y*nw+x]=vnoise(wx,wy,P.mottle_scale,37)*.7+vnoise(wx,wy,P.mottle_scale*.4,41)*.3;}
  const bil=(F,fw,fx,fy)=>{const x0=fx|0,y0=fy|0,tx=fx-x0,ty=fy-y0;return (F[y0*fw+x0]*(1-tx)+F[y0*fw+x0+1]*tx)*(1-ty)+(F[(y0+1)*fw+x0]*(1-tx)+F[(y0+1)*fw+x0+1]*tx)*ty;};
  // forest field (1/8 grid): gaussian density of the existing tree rows, blurred, threshold perturbed by noise → rounded patch edge
  let FO=null;if(M.trees&&M.trees.length){const ff=8,fw=Math.ceil(W/ff)+2,fh=Math.ceil(H/ff)+2,a=new Float32Array(fw*fh),t=new Float32Array(fw*fh),sg=P.forest_sigma*k/ff,R3=Math.ceil(sg*3);
    for(const [tx,ty] of M.trees){const cx=tx*k/ff,cy=ty*k/ff;for(let v=Math.max(0,Math.floor(cy-R3));v<=Math.min(fh-1,Math.ceil(cy+R3));v++)for(let u=Math.max(0,Math.floor(cx-R3));u<=Math.min(fw-1,Math.ceil(cx+R3));u++){const dx=u-cx,dy=v-cy;a[v*fw+u]+=Math.exp(-(dx*dx+dy*dy)/(2*sg*sg));}}
    blurTo(a,a,t,fw,fh,Math.max(1,Math.round(P.forest_blur*k/ff/1.7)),3);
    for(let v=0;v<fh;v++)for(let u=0;u<fw;u++){const wx=u*ff/k,wy=v*ff/k,n=vnoise(wx,wy,P.forest_edge_scale,53)*.7+vnoise(wx,wy,P.forest_edge_scale*.4,59)*.3;a[v*fw+u]=smooth(P.forest_lo,P.forest_hi,a[v*fw+u]+(n-.5)*P.forest_edge_amp);}
    FO={a,w:fw,h:fh,f:ff};}
  const PROT=[];for(const m of [M.wprot,M.core])if(m){const sub=g.getImageData(m.x,m.y,m.w,m.h);PROT.push({m,sub});}
  tm('fields');
  // 2. paint
  const B0=P.blob_lo_hi[0],B1=P.blob_lo_hi[1],BA=P.blob_amt,M0=P.mottle_lo_hi[0],M1=P.mottle_lo_hi[1],MA=P.mottle_amt,GRA=P.grass_rim_amt,RRA=P.road_rim_amt,BRA=P.bank_rim_amt,
    LA=P.lawn_amt,SA=P.shadow_amt,S0=P.shadow_lo_hi[0],S1=P.shadow_lo_hi[1],YG=P.yard_road_gain,SLH=P.soil_L_hi,SLL=P.soil_L_lo,EA=P.edge_dark||0,FDK=P.forest_extra_dark||0,DB=DC?DC.map(q=>q[1]/q[0]):[0,0,0],SCL=hex0(P.shadow_colour||'#000000'),FG=hex(P.forest_grass),FB0=P.forest_patch_lo_hi[0],FB1=P.forest_patch_lo_hi[1],FPA=P.forest_patch_amt,LP0=P.lawn_patch_lo_hi[0],LP1=P.lawn_patch_lo_hi[1],
    LPC=(()=>{const a=[parseInt(P.grass.slice(1,3),16),parseInt(P.grass.slice(3,5),16),parseInt(P.grass.slice(5,7),16)],b=[parseInt(P.road.slice(1,3),16),parseInt(P.road.slice(3,5),16),parseInt(P.road.slice(5,7),16)],q=P.lawn_patch_earth;
      return hex('#'+a.map((v,i)=>Math.round(v*(1-q)+b[i]*q).toString(16).padStart(2,'0')).join(''));})();
  const KE=M.keep,KC=M.core,SH=M.shadow;
  for(let y=0;y<H;y++){const fy=y/NF,ry=Math.min(RY?RY.h-1.001:0,Math.max(0,(y+.5)/4-.5));
   for(let x=0;x<W;x++){const i=y*W+x,p=i*4;
    const kp=KE?mAt(KE,x,y):0,kc=kp?mAt(KC,x,y):0;if(kc===255&&d[p]>d[p+1]+4)continue;   // Map 2: only the plot soil is kept, the old grass margin is repainted
    let w=0,w1=0,w2=0;if(WB){const u=x-WB.x,v=y-WB.y;if(u>=0&&v>=0&&u<WB.w&&v<WB.h){const j=v*WB.w+u;w=WB.Wm[j];w1=WB.W1[j];w2=WB.W2[j];}}
    if(w>=.999)continue;
    let lwi=0;if(LWb){const u=x-LWb.x,v=y-LWb.y;if(u>=0&&v>=0&&u<LWb.w&&v<LWb.h)lwi=LWb.a[v*LWb.w+u];}
    let fo=0;if(FO){const fx=Math.min(FO.w-1.001,Math.max(0,(x+.5)/FO.f-.5)),fyy=Math.min(FO.h-1.001,Math.max(0,(y+.5)/FO.f-.5));fo=bil(FO.a,FO.w,fx,fyy);}
    const Draw=Cm[i],dri=A[i];
    // clearing: off-road wear patches become faint grass/earth patches (no road look)
    let lo=0;if(lwi>0&&Draw>0){const ydl=RY?1-Math.min(1,bil(RY.a,RY.w,Math.min(RY.w-1.001,Math.max(0,(x+.5)/4-.5)),ry)*YG):0;lo=lwi*ydl;}
    const D=Draw*(1-lo);let r,g2,b,gr=0,gg=0,gb=0;
    if(D<1){const n=bil(NB,nw,x/NF,fy),bl=BA*(1-lwi),lt=smooth(B0,B1,n)*bl,dk=smooth(B0,B1,1-n)*bl;
      gr=G0[0]+(GL[0]-G0[0])*lt+(GD[0]-G0[0])*dk;gg=G0[1]+(GL[1]-G0[1])*lt+(GD[1]-G0[1])*dk;gb=G0[2]+(GL[2]-G0[2])*lt+(GD[2]-G0[2])*dk;
      if(fo>0){const fn=bil(NB,nw,x/NF,fy),pl=smooth(FB0,FB1,1-fn)*FPA;const fr=FG[0]+(G0[0]-FG[0])*pl,fg=FG[1]+(G0[1]-FG[1])*pl,fb=FG[2]+(G0[2]-FG[2])*pl;gr+=(fr-gr)*fo;gg+=(fg-gg)*fo;gb+=(fb-gb)*fo;
        if(FDK>0){const q=FDK*fo;gr=gr*(1-q)-q*DB[0];gg=gg*(1-q)-q*DB[1];gb=gb*(1-q)-q*DB[2];}}
      if(lwi>0){const lw=lwi*LA;gr+=(LL[0]-gr)*lw;gg+=(LL[1]-gg)*lw;gb+=(LL[2]-gb)*lw;}
      if(lo>0){const pw=lo*smooth(LP0,LP1,dri);gr+=(LPC[0]-gr)*pw;gg+=(LPC[1]-gg)*pw;gb+=(LPC[2]-gb)*pw;}
      const outer=dri>0?(1-D)*smooth(.02,.3,dri)*GRA*(1-lo):0;let rimZ=0;if(w1>0||w2>0){const bz=smooth(.015,.08,w1)*(1-w);rimZ=smooth(.01,.05,w2)*(1-bz)*(1-w)*BRA;}
      const gm=outer>rimZ?outer:rimZ;if(gm>0){gr+=(GR[0]-gr)*gm;gg+=(GR[1]-gg)*gm;gb+=(GR[2]-gb)*gm;}}
    if(D>0){const yd=RY?1-Math.min(1,bil(RY.a,RY.w,Math.min(RY.w-1.001,Math.max(0,(x+.5)/4-.5)),ry)*YG):0;
      let dr=R0[0]+(Y0[0]-R0[0])*yd,dg=R0[1]+(Y0[1]-R0[1])*yd,db=R0[2]+(Y0[2]-R0[2])*yd;
      const m=smooth(M0,M1,bil(NM,nw,x/NF,fy))*MA;if(m>0){dr+=(R1[0]-dr)*m;dg+=(R1[1]-dg)*m;db+=(R1[2]-db)*m;}
      const inner=D*smooth(.02,.35,1-dri)*RRA;if(inner>0){dr+=(RIM[0]-dr)*inner;dg+=(RIM[1]-dg)*inner;db+=(RIM[2]-db)*inner;}
      if(D<1){r=gr+(dr-gr)*D;g2=gg+(dg-gg)*D;b=gb+(db-gb)*D;}else{r=dr;g2=dg;b=db;}}
    else{r=gr;g2=gg;b=gb;}
    if(w1>0){const bankZ=smooth(.015,.08,w1)*(1-w);if(bankZ>0){const wet=smooth(.25,.6,w1);const br=BK[0]+(BKW[0]-BK[0])*wet,bg=BK[1]+(BKW[1]-BK[1])*wet,bb=BK[2]+(BKW[2]-BK[2])*wet;r+=(br-r)*bankZ;g2+=(bg-g2)*bankZ;b+=(bb-b)*bankZ;}}
    if(EA>0){const wx=x/k,wy=y/k,WWm=W/k,HHm=H/k;let keepF=1;for(const dd of [wx,wy,WWm-wx,HHm-wy])if(dd<240)keepF*=1-EA*(1-dd/240);if(keepF<1){r=r*keepF+8*(1-keepF);g2=g2*keepF+24*(1-keepF);b=b*keepF+10*(1-keepF);}}
    if(SH){const sv=mAt(SH,x,y);if(sv){const s=SA*smooth(S0,S1,sv/255);r+=(SCL[0]-r)*s;g2+=(SCL[1]-g2)*s;b+=(SCL[2]-b)*s;}}
    const o0=d[p],o1=d[p+1],o2=d[p+2];
    if(w>0){r+=(o0-r)*w;g2+=(o1-g2)*w;b+=(o2-b)*w;}
    if(kp){const Lo=.3*o0+.59*o1+.11*o2,kk=(kp/255)*Math.max((kc/255)*(o0>o1+4?1:0),smooth(.25,.7,LD[o0-o1+255])*smooth(SLH,SLL,Lo));r+=(o0-r)*kk;g2+=(o1-g2)*kk;b+=(o2-b)*kk;}
    d[p]=r;d[p+1]=g2;d[p+2]=b;}}
  g.putImageData(id,0,0);tm('paint');
  // 3. decorations: flat pebbles on dirt, sparse grass tufts on open grass, soft map-edge darkening (world-grid cells, hashed → fixed)
  const at=(F,wx,wy)=>{const x=Math.round(wx*k),y=Math.round(wy*k);return x<0||y<0||x>=W||y>=H?0:F[y*W+x];};
  const wAt=(wx,wy)=>{if(!WB)return 0;const u=Math.round(wx*k)-WB.x,v=Math.round(wy*k)-WB.y;return u<0||v<0||u>=WB.w||v>=WB.h?0:WB.W1[v*WB.w+u];};
  const kept=(wx,wy)=>KE&&mAt(KE,Math.round(wx*k),Math.round(wy*k))>0;
  const WW=W/k,HH=H/k;let np=0,nt=0;g.save();g.setTransform(k,0,0,k,0,0);
  const PS=P.pebble_cell;for(let j=0;j<HH/PS;j++)for(let i=0;i<WW/PS;i++){if(hash(i,j,71)>P.pebble_p)continue;const x=(i+hash(i,j,72))*PS,y=(j+hash(i,j,73))*PS;
    let ok=at(Cm,x,y)>.97&&!kept(x,y)&&wAt(x,y)<.01&&!(LWb&&(()=>{const u=Math.round(x*k)-LWb.x,v=Math.round(y*k)-LWb.y;return u>=0&&v>=0&&u<LWb.w&&v<LWb.h&&LWb.a[v*LWb.w+u]>.02;})());for(const [dx,dy] of [[-7,0],[7,0],[0,-6],[0,6]])ok=ok&&at(Cm,x+dx,y+dy)>.9;if(!ok)continue;
    const rx=P.pebble_r[0]+hash(i,j,74)*(P.pebble_r[1]-P.pebble_r[0]),ry=rx*(.55+hash(i,j,75)*.15),rot=(hash(i,j,76)-.5)*.6;
    g.fillStyle=P.pebble_shade;g.beginPath();g.ellipse(x+.6,y+.7,rx,ry,rot,0,6.2832);g.fill();
    g.fillStyle=css(P.pebble);g.beginPath();g.ellipse(x,y,rx,ry,rot,0,6.2832);g.fill();
    g.fillStyle=css(P.pebble_light);g.beginPath();g.ellipse(x-rx*.28,y-ry*.3,rx*.5,ry*.42,rot,0,6.2832);g.fill();np++;}
  const TS=P.tuft_cell;for(let j=0;j<HH/TS;j++)for(let i=0;i<WW/TS;i++){if(hash(i,j,81)>P.tuft_p)continue;const x=(i+.15+hash(i,j,82)*.7)*TS,y=(j+.15+hash(i,j,83)*.7)*TS;
    let ok=!kept(x,y)&&wAt(x,y)<.01;for(const [dx,dy] of [[0,0],[-16,0],[16,0],[0,-14],[0,14],[-30,0],[30,0],[0,-26],[0,26]])ok=ok&&at(Cm,x+dx,y+dy)<.05&&wAt(x+dx,y+dy)<.01;
    if(SH)ok=ok&&mAt(SH,Math.round(x*k),Math.round(y*k))<20;if(!ok)continue;
    const s=P.tuft_size*(.8+hash(i,j,84)*.5),n=3+((hash(i,j,85)*3)|0);
    for(let q=0;q<n;q++){const a=-Math.PI/2+(q-(n-1)/2)*.42+(hash(i,j,90+q)-.5)*.2,L=s*(.75+hash(i,j,95+q)*.4),bx=x+(q-(n-1)/2)*s*.18,tx=bx+Math.cos(a)*L,ty=y+Math.sin(a)*L*.9,w=s*.17;
      g.fillStyle=css(P.tuft_dark);g.beginPath();g.moveTo(bx-w,y);g.quadraticCurveTo(bx-w*.6+(tx-bx)*.4,y+(ty-y)*.55,tx,ty);g.quadraticCurveTo(bx+w*.6+(tx-bx)*.45,y+(ty-y)*.5,bx+w,y);g.closePath();g.fill();
      g.fillStyle=css(P.tuft_light);g.beginPath();g.moveTo(bx-w*.55,y-L*.1);g.quadraticCurveTo(bx-w*.5+(tx-bx)*.4,y+(ty-y)*.5,tx-w*.15,ty+L*.12);g.quadraticCurveTo(bx+(tx-bx)*.3,y+(ty-y)*.45,bx,y-L*.1);g.closePath();g.fill();}
    nt++;}
  g.restore();tm('decor');
  // protected: river polygon + plot polygons back to the incoming bake (any coverage of the polygon edge counts)
  // water: the river polygon (hard) + every water-tinted pixel of the river band (soft by tint strength: fully blue pixels exact),
  // + the old painted bank stones touching the water (grey, bright, inside the bank band; with a 2 px outline) → all kept as painted
  let restored=0;for(const {m,sub} of PROT){const cur=g.getImageData(m.x,m.y,m.w,m.h),cd=cur.data,od=sub.data,isW=(m===M.wprot&&WB&&WB.w===m.w&&WB.h===m.h),n=m.a.length;
    let st=null;if(isW){st=new Float32Array(n);for(let i=0;i<n;i++){if(!(WB.W2[i]>0))continue;const p=i*4,r=od[p],g1=od[p+1],b1=od[p+2],mx=Math.max(r,g1,b1),mn=Math.min(r,g1,b1),L=.3*r+.59*g1+.11*b1;st[i]=smooth(P.stone_sat_hi,P.stone_sat_lo,mx-mn)*smooth(P.stone_L_lo,P.stone_L_hi,L);}
      const t=new Float32Array(n);blurTo(st,st,t,m.w,m.h,P.stone_pad_px,1);for(let i=0;i<n;i++)st[i]=smooth(.03,.15,st[i]);}
    for(let i=0;i<n;i++){let wgt=m.a[i]>0?1:0;if(!isW&&wgt){const q=i*4;if(!(od[q]>od[q+1]+4))wgt=0;}if(isW&&wgt<1){wgt=Math.max(wgt,smooth(0,P.water_restore_soft,WB.wat[i]),st[i]);}if(wgt<=0)continue;const p=i*4;
      for(let c=0;c<3;c++){const v=Math.round(cd[p+c]+(od[p+c]-cd[p+c])*wgt);if(v!==cd[p+c]){cd[p+c]=v;}}if(wgt>=1){cd[p+3]=od[p+3];}restored++;}
    g.putImageData(cur,m.x,m.y);}
  tm('protect');
  return {T,ms:+(performance.now()-t0).toFixed(1),pebbles:np,tufts:nt,size:[W,H],protect_restored_px:restored,forest:!!FO};}
/* ---- cache (one entry; key = cheap sample hash of the incoming bake + size) ---- */
let CACHE=null;
function fp(c){const g=c.getContext('2d'),W=c.width,H=c.height;let h=2166136261;for(let y=7;y<H;y+=97){const d=g.getImageData(0,y,W,1).data;for(let i=0;i<d.length;i+=28)h=Math.imul(h^d[i]^(d[i+1]<<8)^(d[i+2]<<16),16777619);}return (h>>>0)+':'+W+'x'+H;}
const oG=genBG;genBG=function(zid){const c=oG.apply(this,arguments);
  try{if(zid===Z&&c&&c.getContext&&!(typeof slReady==='function'&&!slReady())){const t0=performance.now(),key=C.version+'|'+fp(c),tf=performance.now();
      if(CACHE&&CACHE.key===key){const g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);g.drawImage(CACHE.cv,0,0);ST.cache_hit++;ST.last={cached:true,fp_ms:+(tf-t0).toFixed(1),ms:+(performance.now()-t0).toFixed(1)};}
      else{const k=c.width/ZONES[zid].w,S=sources(),tm0=performance.now(),M=buildMasks(S,k,c.width,c.height),tm1=performance.now(),R=repaint(c,M,k);
        if(CACHE){CACHE.cv.width=CACHE.cv.height=0;}const cv=document.createElement('canvas');cv.width=c.width;cv.height=c.height;cv.getContext('2d').drawImage(c,0,0);CACHE={key,cv};
        ST.runs++;ST.last=Object.assign({cached:false,fp_ms:+(tf-t0).toFixed(1),masks_ms:+(tm1-tm0).toFixed(1),total_ms:+(performance.now()-t0).toFixed(1),k,
          sources:{roads:S.roads.length,plots:S.plots.length,river:S.river.length,clearing:!!S.clr,trees:S.trees.length,shadows:(S.SD.p1?1:0)+S.SD.p1w.length+S.SD.p2.length}},R);}}}
  catch(e){ST.errors++;ST.err=String(e&&e.stack||e);console.warn('[p199] Map 2 ground',e);}
  return c;};
window.__M2GROUND_STATE={stats:ST,params:P,dropCache:()=>{if(CACHE){CACHE.cv.width=CACHE.cv.height=0;CACHE=null;}}};
})();
