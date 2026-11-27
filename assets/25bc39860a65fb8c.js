
/* ---- candidate_bow_r5: p251 Map 2 floor r1 (= sk1a1/g49.js, round 98) ---- */
/* ---- p251: Map 2 floor r1 — rut road + fallow soil + dry grass / wildflowers on the Map 1 floor system (user 15 Oct 2026) — TEST candidate, not published ----
   Outermost genBG wrapper for Map 2 (cartroad_plains, after p199). The incoming bake (p199 floor) is only the SHAPE source: dirt = warm hue (roads, tracks), plots = the 4 field-art rectangles.
   Main W-E road: cart-rut tile placed along the road arclength (ruts centred on the centreline, follow the curve); spur tracks + south track: Map 1 plaza dirt; fields: fallow-soil tile;
   grass: Map 1 meadow / flower / forest tiles; decor: Map 1 dirt patches / gravel / puddles / dark clumps + 2 stone plazas at the Chibi door fronts + Map 2 dry-grass and wildflower clumps.
   Props / collision / gates / monsters untouched. Switch: ?floor2=old (Map 2 only) or ?floor=old (both maps) or window.__M2FLOOR2.setMode("old"|"new"). */
(function(){
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
function rect(x0,y0,x1,y1,k,W,H){const a=Math.max(0,Math.floor(x0*k)),b=Math.max(0,Math.floor(y0*k)),c=Math.min(W,Math.ceil(x1*k)),d=Math.min(H,Math.ceil(y1*k));return c>a&&d>b?[a,b,c-a,d-b]:null;}
function raster(bb,k,draw,f){f=f||1;if(!bb)return null;const w=Math.ceil(bb[2]/f),h=Math.ceil(bb[3]/f),cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d');
  g.setTransform(k/f,0,0,k/f,-bb[0]/f,-bb[1]/f);g.fillStyle='#000';g.strokeStyle='#000';draw(g);const d=g.getImageData(0,0,w,h).data,a=new Uint8Array(w*h);for(let i=0;i<a.length;i++)a[i]=d[i*4+3];cv.width=cv.height=0;
  return {a,x:bb[0],y:bb[1],w:bb[2],h:bb[3],f,sw:w,sh:h};}
const mAt=(m,x,y)=>{if(!m)return 0;const u=x-m.x,v=y-m.y;if(u<0||v<0||u>=m.w||v>=m.h)return 0;return m.f===1?m.a[v*m.w+u]:m.a[((v/m.f)|0)*m.sw+((u/m.f)|0)];};
function polyBox(pts,grow){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of pts){x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1]);}return [x0-grow,y0-grow,x1+grow,y1+grow];}
function sidePoly(g,S,gl,gr){g.beginPath();S.forEach((q,i)=>{const x=q.x+q.nx*(q.wl+gl),y=q.y+q.ny*(q.wl+gl);i?g.lineTo(x,y):g.moveTo(x,y);});for(let i=S.length-1;i>=0;i--){const q=S[i];g.lineTo(q.x-q.nx*(q.wr+gr),q.y-q.ny*(q.wr+gr));}g.closePath();g.fill();}

function resample(pts,hw){const S=[];let s=0;for(let i=0;i<pts.length-1;i++){const x0=pts[i][0],y0=pts[i][1],x1=pts[i+1][0],y1=pts[i+1][1],L=Math.hypot(x1-x0,y1-y0)||1,nx=-(y1-y0)/L,ny=(x1-x0)/L;
  for(let t=0;t<L;t+=5)S.push({x:x0+(x1-x0)*t/L,y:y0+(y1-y0)*t/L,nx,ny,wl:hw,wr:hw,s:s+t});s+=L;}
  const l=pts[pts.length-1];if(S.length){const q=S[S.length-1];S.push({x:l[0],y:l[1],nx:q.nx,ny:q.ny,wl:hw,wr:hw,s});}return S;}
(function(){
const BASE=window.__M2GROUND,A1=window.__M1FLOOR2_ASSETS,A2=window.__M2FLOOR2_ASSETS;
if(!BASE||!A1||!A2||typeof genBG!=='function')return;
const Z='cartroad_plains',P=BASE.params;
const CFG=window.__M2FLOOR2={version:'m2floor-r1',on:!/[?&]floor=old/.test(location.search)&&!/[?&]floor2=old/.test(location.search),
  tile_world:{meadow:512,flower:512,forest:512,plaza:512,field:240},rut_period:170,rut_center:252.5,
  flower_scale:340,flower_lo:.56,flower_hi:.76,flower_clear:.45,tone_scale:520,tone_amt:.12,edge_dark:.14,dirt_feather_px:3,dirt_ao:.16,dirt_rim:.2,
  plot_wobble:1.2,
  patch_p:.30,patch_cell:230,patch_w:[150,250],clump_p:.10,clump_cell:170,clump_w:[70,110],plaza_w:[300,400],strip_step:230,strip_w:[260,400],puddles:6,puddle_w:[58,84],
  dry_cell:130,dry_w:[100,170],dry_near:.16,dry_far:.60,dry_mix:[.42,.87],dry_home_r:70,
  flow_cell:150,flow_w:[85,140],flow_base:.30,flow_peak:.55,flow_home_r:45,gate_r:240,seed:11};
const ST=window.__M2FLOOR2_STATE={runs:0,cache_hit:0,last:null,errors:0,ready:false,active:false,err:null};
CFG.setMode=function(m){CFG.on=(m!=='old');try{if(typeof G!=='undefined'&&G.zone===Z)BG=genBG(Z);}catch(e){console.warn('[p251] setMode',e);}return CFG.on;};
const TL={},DE={};let READY=false;
const DC=P.display_comp||null;
const inv=(v,i)=>{if(!DC)return v;const q=(v-DC[i][1])/DC[i][0];return q<0?0:q>255?255:q;};
const loadImg=s=>new Promise((ok,no)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=()=>no(new Error('img'));im.src=s;});
const T_USE=[[A1,'meadow'],[A1,'flower'],[A1,'forest'],[A1,'plaza'],[A2,'rut'],[A2,'fallow']];
const D_USE=[].concat(['dirtA0','dirtA1','dirtA2','dirtB0','dirtB1','dirtB2','plazaA0','plazaA1','plazaB0','plazaB1','stripA','stripB','puddle0','puddle1','clump0','clump1','clump2'].map(n=>[A1,n]),Object.keys(A2.decor).map(n=>[A2,n]));
Promise.all([].concat(T_USE.map(async([A,n])=>{const im=await loadImg(A.tiles[n]),cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const g=cv.getContext('2d');g.drawImage(im,0,0);
    const d=g.getImageData(0,0,im.width,im.height).data,o=new Uint8ClampedArray(d.length);for(let i=0;i<d.length;i+=4){o[i]=inv(d[i],0);o[i+1]=inv(d[i+1],1);o[i+2]=inv(d[i+2],2);o[i+3]=255;}TL[n]={d:o};}),
  D_USE.map(async([A,n])=>{const im=await loadImg(A.decor[n]),cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const g=cv.getContext('2d');g.drawImage(im,0,0);
    const id=g.getImageData(0,0,im.width,im.height),d=id.data;for(let i=0;i<d.length;i+=4){d[i]=inv(d[i],0);d[i+1]=inv(d[i+1],1);d[i+2]=inv(d[i+2],2);}g.putImageData(id,0,0);DE[n]={cv,w:im.width,h:im.height};})))
 .then(()=>{READY=true;ST.ready=true;try{if(CFG.on&&typeof G!=='undefined'&&G.zone===Z&&typeof slReady==='function'&&slReady())BG=genBG(Z);}catch(e){ST.err=String(e&&e.stack||e);}})
 .catch(e=>{ST.err='asset '+e;console.warn('[p251] assets',e);});
let sr=0,sg=0,sb=0;
function tx(T,u,v){const d=T.d,iu=Math.floor(u),iv=Math.floor(v),fu=u-iu,fv=v-iv,x0=iu&511,x1=(iu+1)&511,y0=(iv&511)<<9,y1=((iv+1)&511)<<9;
  const a=(y0+x0)<<2;if(fu===0&&fv===0){sr=d[a];sg=d[a+1];sb=d[a+2];return;}
  const b=(y0+x1)<<2,c=(y1+x0)<<2,e=(y1+x1)<<2,w0=(1-fu)*(1-fv),w1=fu*(1-fv),w2=(1-fu)*fv,w3=fu*fv;
  sr=d[a]*w0+d[b]*w1+d[c]*w2+d[e]*w3;sg=d[a+1]*w0+d[b+1]*w1+d[c+1]*w2+d[e+1]*w3;sb=d[a+2]*w0+d[b+2]*w1+d[c+2]*w2+d[e+2]*w3;}
/* ---------- sources (read only) ---------- */
function sources(){const W=window.W22||{},rl=((W.roads&&W.roads[Z])||[]).filter(r=>r&&r.pts&&r.pts.length>1);
  const roads=rl.map(r=>resample(r.pts,(r.w||60)/2)),names=rl.map((r,i)=>i===0?'main':(r.pts.length<=3?'spur':'south'));
  const fa=(window.__FIELD_ART_LIST||[]).find(e=>e.map==='m2');const plots=(fa?fa.plots:[]).map(pl=>Object.assign({},pl,{grow:0,edge_amp:0,edge_soft:0}));
  const TT=new Set(P.forest_types||[]),L=window.__M2L||{},trees=(L.props||[]).filter(r=>r&&TT.has(r[1])).map(r=>[r[2],r[3]]);
  /* the 2 Chibi house doors (p211): red two-storey door (902,535), green cottage door (2362,445); the front faces south onto the track */
  const doors=[{door:[902,535],ent:[902,570]},{door:[2362,445],ent:[2362,480]}];
  const gates=[];try{for(const k of ['cartW','cartE','cartSW']){const g=W.gate&&W.gate[k];if(g)gates.push([g.x,g.y]);}}catch(e){}
  try{for(const k in (W.arr||{})){if(k.indexOf(Z+'<')===0){const a=W.arr[k];if(a&&typeof a.x==='number')gates.push([a.x,a.y]);}}}catch(e){}
  const homes=[];try{const PD=window.__W22_DATA&&window.__W22_DATA.population;if(PD&&PD.groups)for(const g of PD.groups)if(g.c)homes.push([g.c[0],g.c[1]]);}catch(e){}
  return {roads,names,plots,trees,doors,gates,homes};}
function buildMasks(S,k,W,H){const M={};
  const mainR=S.roads.filter((r,i)=>S.names[i]==='main');
  M.roadAll=raster([0,0,W,H],k,g=>{for(const R of S.roads)sidePoly(g,R,0,0);},4);
  M.roadMain=raster([0,0,W,H],k,g=>{for(const R of mainR)sidePoly(g,R,0,0);},4);
  const kp=P.plot_pad;let pb=null;for(const pl of S.plots){const b=polyBox(pl.poly,kp+12);pb=pb?[Math.min(pb[0],b[0]),Math.min(pb[1],b[1]),Math.max(pb[2],b[2]),Math.max(pb[3],b[3])]:b;}
  if(pb){const bb=rect(pb[0],pb[1],pb[2],pb[3],k,W,H);
    M.keep=raster(bb,k,g=>{for(const pl of S.plots){g.beginPath();pl.poly.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();g.fill();}});}
  return M;}
function roadUV(S,k,W,H){const f=2,w=Math.ceil(W/f)+2,h=Math.ceil(H/f)+2,sA=new Float32Array(w*h),tA=new Float32Array(w*h),best=new Float32Array(w*h).fill(1e9),mi=S.names.indexOf('main');if(mi<0)return null;const R=S.roads[mi];
  for(let i=0;i<R.length-1;i++){const q0=R[i],q1=R[i+1];for(let a=0;a<1;a+=.34){const x=q0.x+(q1.x-q0.x)*a,y=q0.y+(q1.y-q0.y)*a,nx0=q0.nx+(q1.nx-q0.nx)*a,ny0=q0.ny+(q1.ny-q0.ny)*a,L=Math.hypot(nx0,ny0)||1,nx=nx0/L,ny=ny0/L,wl=q0.wl+(q1.wl-q0.wl)*a,wr=q0.wr+(q1.wr-q0.wr)*a,s=q0.s+(q1.s-q0.s)*a;
    for(let t=-(wr+30);t<=wl+30;t+=1){const gx=Math.round((x+nx*t)*k/f),gy=Math.round((y+ny*t)*k/f);if(gx<0||gy<0||gx>=w||gy>=h)continue;const j=gy*w+gx,ab=Math.abs(t);if(ab<best[j]){best[j]=ab;sA[j]=s;tA[j]=t;}}}}
  for(let pass=0;pass<2;pass++){const nb=best.slice(),ns=sA.slice(),nt=tA.slice();for(let v=1;v<h-1;v++)for(let u=1;u<w-1;u++){const j=v*w+u;if(best[j]<1e8)continue;let c=0,ss=0,tt=0,bb=1e9;for(let dv=-1;dv<=1;dv++)for(let du=-1;du<=1;du++){const q=j+dv*w+du;if(best[q]<1e8){c++;ss+=sA[q];tt+=tA[q];bb=Math.min(bb,best[q]);}}if(c){nb[j]=bb;ns[j]=ss/c;nt[j]=tt/c;}}best.set(nb);sA.set(ns);tA.set(nt);}
  return {s:sA,t:tA,best,w,h,f};}
/* ---------- the floor bake ---------- */
function paintFloor(c,S,M,k){
  const T0=performance.now(),TM={},tm=n=>{const t=performance.now();TM[n]=+(t-tm.l).toFixed(1);tm.l=t;};tm.l=T0;
  const W=c.width,H=c.height,N=W*H,g0=c.getContext('2d'),src=g0.getImageData(0,0,W,H),d=src.data;
  const out=document.createElement('canvas');out.width=W;out.height=H;const go=out.getContext('2d');
  const tw=CFG.tile_world,sc=n=>512/tw[n];
  const LD=new Float32Array(511);for(let v=-255;v<=255;v++)LD[v+255]=smooth(P.dirt_lo,P.dirt_hi,v);
  tm('read');
  const Cm=new Float32Array(N),Af=new Float32Array(N),B=new Float32Array(N);
  for(let i=0,p=0;i<N;i++,p+=4)Af[i]=LD[d[p]-d[p+1]+255];
  /* the p199 bake has a few narrow grass slits cut into the road: morphological closing (dilate then erode, radius 8 px) fills holes narrower than ~16 px; the outer edge and thin tracks are unchanged */
  {const T2=new Float32Array(N),r8=Math.max(2,Math.round(8*k));
   blurTo(Af,Cm,B,W,H,r8,1);for(let i=0;i<N;i++)Cm[i]=Cm[i]>.02?1:0;           // dilate
   blurTo(Cm,T2,B,W,H,r8,1);for(let i=0;i<N;i++){if(T2[i]>.985&&Af[i]<1)Af[i]=1;}}   // erode -> closed mask; Af = max(Af, closed)
  blurTo(Af,Cm,B,W,H,Math.max(1,Math.round(1.5*k)),1);for(let i=0;i<N;i++)Cm[i]=smooth(.35,.65,Cm[i]);
  blurTo(Cm,Af,B,W,H,Math.max(1,Math.round(CFG.dirt_feather_px*k)),1);
  tm('dirt');
  const rm=M.roadMain,w4=rm.sw,h4=rm.sh,RMn=new Float32Array(w4*h4),t4=new Float32Array(w4*h4);for(let i=0;i<RMn.length;i++)RMn[i]=rm.a[i]/255;blurTo(RMn,RMn,t4,w4,h4,Math.max(1,Math.round(P.yard_blend_px*k/4)),2);
  const RU=roadUV(S,k,W,H);
  const bil=(F,fw,fx,fy)=>{const x0=fx|0,y0=fy|0,tx_=fx-x0,ty_=fy-y0;return (F[y0*fw+x0]*(1-tx_)+F[y0*fw+x0+1]*tx_)*(1-ty_)+(F[(y0+1)*fw+x0]*(1-tx_)+F[(y0+1)*fw+x0+1]*tx_)*ty_;};
  const NF=4,nw=Math.ceil(W/NF)+2,nh=Math.ceil(H/NF)+2,NFl=new Float32Array(nw*nh),NTn=new Float32Array(nw*nh);
  for(let y=0;y<nh;y++)for(let x=0;x<nw;x++){const wx=(x*NF)/k,wy=(y*NF)/k;NFl[y*nw+x]=vnoise(wx,wy,CFG.flower_scale,CFG.seed*7+1)*.7+vnoise(wx,wy,CFG.flower_scale*.4,CFG.seed*7+2)*.3;NTn[y*nw+x]=vnoise(wx,wy,CFG.tone_scale,CFG.seed*7+3)*.65+vnoise(wx,wy,CFG.tone_scale*.35,CFG.seed*7+4)*.35;}
  let FO=null;if(S.trees.length){const ff=8,fw=Math.ceil(W/ff)+2,fh=Math.ceil(H/ff)+2,a=new Float32Array(fw*fh),t=new Float32Array(fw*fh),sg_=P.forest_sigma*k/ff,R3=Math.ceil(sg_*3);
    for(const [tx_,ty_] of S.trees){const cx=tx_*k/ff,cy=ty_*k/ff;for(let v=Math.max(0,Math.floor(cy-R3));v<=Math.min(fh-1,Math.ceil(cy+R3));v++)for(let u=Math.max(0,Math.floor(cx-R3));u<=Math.min(fw-1,Math.ceil(cx+R3));u++){const dx=u-cx,dy=v-cy;a[v*fw+u]+=Math.exp(-(dx*dx+dy*dy)/(2*sg_*sg_));}}
    blurTo(a,a,t,fw,fh,Math.max(1,Math.round(P.forest_blur*k/ff/1.7)),3);
    for(let v=0;v<fh;v++)for(let u=0;u<fw;u++){const wx=u*ff/k,wy=v*ff/k,n=vnoise(wx,wy,P.forest_edge_scale,53)*.7+vnoise(wx,wy,P.forest_edge_scale*.4,59)*.3;a[v*fw+u]=smooth(P.forest_lo,P.forest_hi,a[v*fw+u]+(n-.5)*P.forest_edge_amp);}
    FO={a,w:fw,h:fh,f:ff};}
  tm('fields');
  /* plots: exact poly footprint, edge wobbled by a few px of noise so the straight rectangles read as neglected soil; halo = soft tilled-earth ring */
  const KE=M.keep;let FA=null,FH=null,PB=[];for(const pl of S.plots)PB.push(polyBox(pl.poly,0));
  if(KE){const w=KE.w,h=KE.h;FA=new Float32Array(w*h);for(let i=0;i<FA.length;i++)FA[i]=KE.a[i]/255;
    const t=new Float32Array(w*h),Fb=new Float32Array(w*h);blurTo(FA,Fb,t,w,h,Math.max(2,Math.round(4*k)),2);
    for(let v=0;v<h;v++)for(let u=0;u<w;u++){const wx=(u+KE.x)/k,wy=(v+KE.y)/k,n=vnoise(wx,wy,34,CFG.seed+3)*.6+vnoise(wx,wy,12,CFG.seed+5)*.4;FA[v*w+u]=smooth(.42,.58,Fb[v*w+u]+(n-.5)*CFG.plot_wobble);}
    blurTo(FA,FA,t,w,h,Math.max(1,Math.round(1.5*k)),1);FH=new Float32Array(w*h);blurTo(FA,FH,t,w,h,Math.max(2,Math.round(7*k)),2);}
  const fAt=(x,y,F)=>{if(!KE||!F)return 0;const u=x-KE.x,v=y-KE.y;return u<0||v<0||u>=KE.w||v>=KE.h?0:F[v*KE.w+u];};
  tm('plots');
  const TM_=TL.meadow,TF_=TL.flower,TFo=TL.forest,TR_=TL.rut,TP_=TL.plaza,TFi=TL.fallow;
  const sMe=sc('meadow'),sFl=sc('flower'),sFo=sc('forest'),sPl=sc('plaza'),sFi=sc('field'),PR=CFG.rut_period,RK=512/PR,RC=CFG.rut_center;
  const outId=go.createImageData(W,H),od=outId.data;
  const FLO=CFG.flower_lo,FHI=CFG.flower_hi,TNA=CFG.tone_amt,ED=CFG.edge_dark,DAO=CFG.dirt_ao,DRM=CFG.dirt_rim;
  const WWm=W/k,HHm=H/k;
  for(let y=0;y<H;y++){const fy=y/NF,wy=y/k,ry=Math.min(h4-1.001,Math.max(0,(y+.5)/4-.5));
   for(let x=0;x<W;x++){const i=y*W+x,p=i*4,wx=x/k;
      const nfx=x/NF,nT=bil(NTn,nw,nfx,fy);let tone=1+(nT-.5)*2*TNA;
      let fo=0;if(FO){const fx=Math.min(FO.w-1.001,Math.max(0,(x+.5)/FO.f-.5)),fyy=Math.min(FO.h-1.001,Math.max(0,(y+.5)/FO.f-.5));fo=bil(FO.a,FO.w,fx,fyy);}
      const nfl=bil(NFl,nw,nfx,fy);let fl=smooth(FLO,FHI,nfl);fl*=(1-fo);
      tx(TM_,wx*sMe,wy*sMe);let gr=sr,gg=sg,gb=sb;
      if(fl>.002){tx(TF_,wx*sFl+137,wy*sFl+71);gr+=(sr-gr)*fl;gg+=(sg-gg)*fl;gb+=(sb-gb)*fl;}
      if(fo>.002){tx(TFo,wx*sFo+59,wy*sFo+203);gr+=(sr-gr)*fo;gg+=(sg-gg)*fo;gb+=(sb-gb)*fo;}
      gr*=tone;gg*=tone;gb*=tone;
      const Dc=Cm[i],Dsoft=Af[i];let D=Dsoft;
      if(FA){const kk=fAt(x,y,FA);if(kk>0)D*=(1-Math.min(1,kk*1.5));}
      if(D>.002){
        let dr,dg,db;
        const mm=bil(RMn,w4,Math.min(w4-1.001,Math.max(0,(x+.5)/4-.5)),ry);
        tx(TP_,wx*sPl+11,wy*sPl+301);dr=sr;dg=sg;db=sb;
        if(mm>.004&&RU){const gx=Math.min(RU.w-1.001,Math.max(0,(x+.5)/RU.f-.5)),gy=Math.min(RU.h-1.001,Math.max(0,(y+.5)/RU.f-.5));
          if(RU.best[(gy|0)*RU.w+(gx|0)]<1e8){const s_=bil(RU.s,RU.w,gx,gy),t_=bil(RU.t,RU.w,gx,gy),cell=Math.floor(s_/PR),fr=s_/PR-cell,fl_=hash(cell,7,CFG.seed*13)>.5;
            tx(TR_,(fl_?1-fr:fr)*512,t_*RK+RC);const tn=1+(nT-.5)*.1;dr+=(sr*tn-dr)*mm;dg+=(sg*tn-dg)*mm;db+=(sb*tn-db)*mm;}}
        const rimk=Dc*smooth(.02,.35,1-Af[i])*DRM;if(rimk>0){const f=1-.14*rimk/Math.max(.01,DRM);dr*=f;dg*=f;db*=f;}
        const ao=(1-Dc)*smooth(.02,.3,Af[i])*DAO;if(ao>0){gr*=1-ao*.55;gg*=1-ao*.55;gb*=1-ao*.55;}
        gr+=(dr-gr)*D;gg+=(dg-gg)*D;gb+=(db-gb)*D;
      }
      if(FA){const kk=fAt(x,y,FA),kh=fAt(x,y,FH);
        if(kh>.01&&kk<1){tx(TP_,wx*sPl+11,wy*sPl+301);const hz=smooth(.04,.35,kh)*(1-kk)*.55;gr+=(sr-gr)*hz;gg+=(sg-gg)*hz;gb+=(sb-gb)*hz;}
        if(kk>.002){let pb=PB[0],bd=1e9;for(const q of PB){const dy=wy<q[1]?q[1]-wy:wy>q[3]?wy-q[3]:0,dx=wx<q[0]?q[0]-wx:wx>q[2]?wx-q[2]:0,dd=dy+dx;if(dd<bd){bd=dd;pb=q;}}
          tx(TFi,(wx-pb[0])*sFi,(wy-pb[1])*sFi);const e=smooth(.25,.9,kk),dk=1-.12*(1-smooth(.55,.95,kk));gr+=(sr*dk-gr)*e;gg+=(sg*dk-gg)*e;gb+=(sb*dk-gb)*e;}}
      if(ED>0){let keepF=1;for(const dd of [wx,wy,WWm-wx,HHm-wy])if(dd<240)keepF*=1-ED*(1-dd/240);if(keepF<1){gr=gr*keepF+8*(1-keepF);gg=gg*keepF+24*(1-keepF);gb=gb*keepF+10*(1-keepF);}}
    od[p]=gr;od[p+1]=gg;od[p+2]=gb;od[p+3]=255;}}
  go.putImageData(outId,0,0);tm('paintA');
  return {out,Cm,FA,FO,KE,TM,T0,fAt,bil};}
/* ---------- decor ---------- */
function placeDecor(R,S,k,M){const go=R.out.getContext('2d'),{Cm}=R,W=R.out.width,H=R.out.height,WWm=W/k,HHm=H/k,R2=CFG;const log={};
  const cmAt=(x,y)=>{const a=Math.round(x*k),b=Math.round(y*k);return a<0||b<0||a>=W||b>=H?0:Cm[b*W+a];};
  const foAt=(x,y)=>{if(!R.FO)return 0;const F=R.FO,fx=Math.min(F.w-1.001,Math.max(0,(x*k+.5)/F.f-.5)),fy=Math.min(F.h-1.001,Math.max(0,(y*k+.5)/F.f-.5));return R.bil(F.a,F.w,fx,fy);};
  const pbs=S.plots.map(pl=>polyBox(pl.poly,12));
  const nearPlot=(x,y,r)=>pbs.some(b=>x>b[0]-r&&x<b[2]+r&&y>b[1]-r&&y<b[3]+r);
  const rnd=(i,j,s)=>hash(i,j,s+R2.seed*131);
  const onRoad=(x,y)=>mAt(M.roadAll,Math.round(x*k),Math.round(y*k))>0;
  const nearHome=(x,y,r)=>S.homes.some(q=>Math.hypot(x-q[0],y-q[1])<r);
  const nearGate=(x,y,r)=>S.gates.some(q=>Math.hypot(x-q[0],y-q[1])<r);
  const rs_=[];S.roads.forEach(Rr=>{for(let i=0;i<Rr.length;i+=3)rs_.push(Rr[i]);});
  const roadDist=(x,y)=>{let m=1e9;for(const q of rs_){const dd=Math.abs(x-q.x)+Math.abs(y-q.y);if(dd<m*1.5){const e=Math.hypot(x-q.x,y-q.y)-Math.max(q.wl,q.wr);if(e<m)m=e;}}return m;};
  const plazaC=[];
  const draw=(name,x,y,rot,wTarget,alpha,flip)=>{const e=DE[name];if(!e)return;const s=wTarget/e.w;go.save();go.setTransform(k,0,0,k,0,0);go.globalAlpha=alpha;go.imageSmoothingQuality='high';go.translate(x,y);go.rotate(rot);go.scale(flip?-s:s,s);go.drawImage(e.cv,-e.w/2,-e.h/2);go.restore();};
  const ring=(x,y,r,f)=>{if(!f(x,y))return false;for(let a=0;a<6.283;a+=.785)if(!f(x+Math.cos(a)*r,y+Math.sin(a)*r))return false;return true;};
  const pz=['plazaA0','plazaB1'];let nPz=0;
  S.doors.forEach((dr,i)=>{const dx=dr.door[0]-dr.ent[0],dy=dr.door[1]-dr.ent[1],L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,wt=R2.plaza_w[0]+(R2.plaza_w[1]-R2.plaza_w[0])*rnd(i,1,500),nm=pz[i%pz.length],e=DE[nm];if(!e)return;
    const hs=e.h*wt/e.w,cx=dr.door[0]-ux*(26+.3*hs),cy=dr.door[1]-uy*(26+.3*hs),rot=Math.atan2(ux,-uy);
    draw(nm,cx,cy,rot,wt,.97,false);plazaC.push([cx,cy,wt*.7]);nPz++;});
  log.plazas=nPz;
  const farFromPlaza=(x,y,r)=>plazaC.every(q=>Math.hypot(x-q[0],y-q[1])>q[2]+r);
  /* bare dirt patches */
  const dp=['dirtA0','dirtA1','dirtA2','dirtB0','dirtB1','dirtB2'],placed=[];let nP=0;
  const okPatch=(x,y,wt,strict)=>{const r=wt*.5;if(x<r+30||y<r+30||x>WWm-r-30||y>HHm-r-30)return false;if(nearPlot(x,y,r+25))return false;if(!farFromPlaza(x,y,r))return false;if(nearHome(x,y,60)||nearGate(x,y,R2.gate_r+r))return false;
    if(strict&&!ring(x,y,r*.75,(a,b)=>cmAt(a,b)<.05))return false;if(foAt(x,y)>.6)return false;for(const q of placed)if(Math.hypot(x-q[0],y-q[1])<(q[2]+r)*.55)return false;return true;};
  const putPatch=(x,y,wt,i,j,alpha)=>{const nm=dp[Math.floor(rnd(i,j,510)*dp.length)];draw(nm,x,y,rnd(i,j,511)*6.283,wt,alpha||.92,rnd(i,j,512)>.5);placed.push([x,y,wt]);nP++;};
  S.roads.forEach((Rr,ri)=>{let acc=0,pd=0;for(let s=1;s<Rr.length;s++){acc+=Math.hypot(Rr[s].x-Rr[s-1].x,Rr[s].y-Rr[s-1].y);if(acc-pd<300)continue;pd=acc;const q=Rr[s],side=rnd(ri,s,530)>.5?1:-1,off=(side>0?q.wl:q.wr)+55+rnd(ri,s,531)*70,x=q.x+q.nx*side*off,y=q.y+q.ny*side*off,wt=R2.patch_w[0]+(R2.patch_w[1]-R2.patch_w[0])*rnd(ri,s,532);
    if(rnd(ri,s,533)<.5&&okPatch(x,y,wt,true))putPatch(x,y,wt,ri,s,.9);}});
  {const cs=R2.patch_cell;for(let j=0;j<HHm/cs;j++)for(let i=0;i<WWm/cs;i++){if(rnd(i,j,540)>R2.patch_p)continue;const x=(i+.1+rnd(i,j,541)*.8)*cs,y=(j+.1+rnd(i,j,542)*.8)*cs,wt=R2.patch_w[0]+(R2.patch_w[1]-R2.patch_w[0])*rnd(i,j,543);if(okPatch(x,y,wt,true))putPatch(x,y,wt,i,j,.9);}}
  log.patches=nP;
  /* gravel strips along the road edges */
  let nS=0;S.roads.forEach((Rr,ri)=>{let acc=0,pd=-1e9;for(let s=1;s<Rr.length;s++){acc+=Math.hypot(Rr[s].x-Rr[s-1].x,Rr[s].y-Rr[s-1].y);if(acc-pd<R2.strip_step*(.7+.6*rnd(ri,s,550)))continue;pd=acc;const q=Rr[s],side=rnd(ri,s,551)>.5?1:-1,off=(side>0?q.wl:q.wr)+3,x=q.x+q.nx*side*off,y=q.y+q.ny*side*off,len=R2.strip_w[0]+(R2.strip_w[1]-R2.strip_w[0])*rnd(ri,s,552);
    const rot=Math.atan2(q.nx,-q.ny)+(rnd(ri,s,553)-.5)*.1;if(nearPlot(x,y,len*.4)||x<40||x>WWm-40||nearGate(x,y,R2.gate_r*.6)||!farFromPlaza(x,y,len*.3))continue;draw(rnd(ri,s,554)>.5?'stripA':'stripB',x,y,rot,len,.9,false);nS++;}});
  log.strips=nS;
  /* mud puddles on the main road (6) + 1 on the south track */
  {let nPd=0;const mi=S.names.indexOf('main');if(mi>=0){const Rr=S.roads[mi],sp=[];
    for(let t=0;t<400&&nPd<R2.puddles;t++){const s=Math.floor(rnd(t,1,560)*Rr.length),q=Rr[s];if(q.x<500||q.x>4900)continue;if(S.roads.some((o,oi)=>oi!==mi&&Math.hypot(o[0].x-q.x,o[0].y-q.y)<190))continue;if(nearGate(q.x,q.y,R2.gate_r))continue;if(sp.some(o=>Math.abs(o-q.x)<520))continue;
      const lat=(rnd(t,2,561)-.5)*(q.wl+q.wr)*.3,x=q.x+q.nx*lat,y=q.y+q.ny*lat,wt=R2.puddle_w[0]+(R2.puddle_w[1]-R2.puddle_w[0])*rnd(t,3,562);draw(rnd(t,4,563)>.5?'puddle0':'puddle1',x,y,rnd(t,5,564)*6.283,wt,.97,rnd(t,6,565)>.5);sp.push(q.x);nPd++;}}
    const si=S.names.indexOf('south');if(si>=0){const Rr=S.roads[si];const q=Rr[Math.floor(Rr.length*.55)];if(q&&!nearPlot(q.x,q.y,30)){draw('puddle1',q.x,q.y,rnd(9,9,566)*6.283,66,.97,false);nPd++;}}
    log.puddles=nPd;}
  /* ---- vegetation (upright clumps: small tilt only, y-sorted) ---- */
  const items=[],vplaced=[];
  const okVeg=(x,y,wt,homeR,foMax)=>{const r=wt*.5;if(x<r+30||y<r+30||x>WWm-r-30||y>HHm-r-30)return false;if(nearGate(x,y,R2.gate_r+r*.5)||nearHome(x,y,homeR)||nearPlot(x,y,r*.7+30)||!farFromPlaza(x,y,r*.6))return false;
    if(foAt(x,y)>foMax)return false;if(!ring(x,y,r*.55,(a,b)=>cmAt(a,b)<.04&&!onRoad(a,b)))return false;
    for(const q of placed)if(Math.hypot(x-q[0],y-q[1])<(q[2]+r)*.4)return false;for(const q of vplaced)if(Math.hypot(x-q[0],y-q[1])<(q[2]+r)*.42)return false;return true;};
  {const cs=R2.dry_cell;let nA=0,nB=0,nC=0;for(let j=0;j<HHm/cs;j++)for(let i=0;i<WWm/cs;i++){const x=(i+.1+rnd(i,j,600)*.8)*cs,y=(j+.1+rnd(i,j,601)*.8)*cs;
      const dd=roadDist(x,y),pr=R2.dry_near+(R2.dry_far-R2.dry_near)*smooth(80,520,dd);if(rnd(i,j,602)>pr)continue;
      const wt=R2.dry_w[0]+(R2.dry_w[1]-R2.dry_w[0])*rnd(i,j,603);
      if(!okVeg(x,y,wt,R2.dry_home_r,.5))continue;const u=rnd(i,j,604),fam=u<R2.dry_mix[0]?'dryA':u<R2.dry_mix[1]?'dryB':'dryC';
      items.push({nm:fam+Math.floor(rnd(i,j,605)*3),x,y,rot:(rnd(i,j,606)-.5)*.35,wt,flip:rnd(i,j,607)>.5,al:.97});vplaced.push([x,y,wt]);if(fam==='dryA')nA++;else if(fam==='dryB')nB++;else nC++;}
    log.dry={A:nA,B:nB,C:nC};}
  {const cs=R2.flow_cell;let nF=0;for(let j=0;j<HHm/cs;j++)for(let i=0;i<WWm/cs;i++){const x=(i+.1+rnd(i,j,610)*.8)*cs,y=(j+.1+rnd(i,j,611)*.8)*cs;
      const pr=R2.flow_base+R2.flow_peak*smooth(.55,.75,vnoise(x,y,420,CFG.seed*3+1));if(rnd(i,j,612)>pr)continue;
      const wt=R2.flow_w[0]+(R2.flow_w[1]-R2.flow_w[0])*rnd(i,j,613);if(!okVeg(x,y,wt,R2.flow_home_r,.75))continue;
      items.push({nm:(rnd(i,j,614)>.5?'flowA':'flowB')+Math.floor(rnd(i,j,615)*3),x,y,rot:(rnd(i,j,616)-.5)*.3,wt,flip:rnd(i,j,617)>.5,al:.97});vplaced.push([x,y,wt]);nF++;}log.flowers=nF;}
  /* dark overgrown clumps (sharp sheet) */
  {let nC=0;const cs=R2.clump_cell;for(let j=0;j<HHm/cs;j++)for(let i=0;i<WWm/cs;i++){if(rnd(i,j,570)>R2.clump_p)continue;const x=(i+.1+rnd(i,j,571)*.8)*cs,y=(j+.1+rnd(i,j,572)*.8)*cs,wt=R2.clump_w[0]+(R2.clump_w[1]-R2.clump_w[0])*rnd(i,j,573);
      if(!okVeg(x,y,wt,R2.dry_home_r,.7))continue;items.push({nm:'clump'+Math.floor(rnd(i,j,574)*3),x,y,rot:(rnd(i,j,575)-.5)*.5,wt,flip:rnd(i,j,576)>.5,al:.96});vplaced.push([x,y,wt]);nC++;}log.clumps=nC;}
  items.sort((a,b)=>a.y-b.y);for(const it of items)draw(it.nm,it.x,it.y,it.rot,it.wt,it.al,it.flip);
  return log;}
/* ---------- cache + genBG wrapper ---------- */
let CACHE=null;
function fp(c){const g=c.getContext('2d'),W=c.width,H=c.height;let h=2166136261;for(let y=7;y<H;y+=97){const d=g.getImageData(0,y,W,1).data;for(let i=0;i<d.length;i+=28)h=Math.imul(h^d[i]^(d[i+1]<<8)^(d[i+2]<<16),16777619);}return (h>>>0)+':'+W+'x'+H;}
const oG=genBG;genBG=function(zid){const c=oG.apply(this,arguments);ST.active=false;
  try{if(CFG.on&&zid===Z&&READY&&c&&c.getContext&&!(typeof slReady==='function'&&!slReady())){const t0=performance.now(),key=CFG.version+'|'+fp(c),tf=performance.now();
      if(CACHE&&CACHE.key===key){const g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);g.drawImage(CACHE.cv,0,0);ST.cache_hit++;ST.last={cached:true,fp_ms:+(tf-t0).toFixed(1),ms:+(performance.now()-t0).toFixed(1)};ST.active=true;}
      else{const k=c.width/ZONES[zid].w,S=sources(),tm0=performance.now(),M=buildMasks(S,k,c.width,c.height),tm1=performance.now(),R=paintFloor(c,S,M,k),tA=performance.now(),dl=placeDecor(R,S,k,M),tB=performance.now();
        const g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);g.drawImage(R.out,0,0);
        if(CACHE){CACHE.cv.width=CACHE.cv.height=0;}CACHE={key,cv:R.out};ST.runs++;ST.active=true;
        ST.last={cached:false,fp_ms:+(tf-t0).toFixed(1),masks_ms:+(tm1-tm0).toFixed(1),paint_ms:+(tA-tm1).toFixed(1),decor_ms:+(tB-tA).toFixed(1),total_ms:+(performance.now()-t0).toFixed(1),k,size:[c.width,c.height],decor:dl,T:R.TM,
          sources:{roads:S.roads.length,names:S.names,plots:S.plots.length,trees:S.trees.length,doors:S.doors.length,gates:S.gates.length,homes:S.homes.length}};ST.firstRun=ST.firstRun||ST.last;}}}
  catch(e){ST.errors++;ST.err=String(e&&e.stack||e);console.warn('[p251] Map 2 floor',e);}
  return c;};
ST.dropCache=()=>{if(CACHE){CACHE.cv.width=CACHE.cv.height=0;CACHE=null;}};
})();

})();

