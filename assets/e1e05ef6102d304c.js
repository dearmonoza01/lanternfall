
/* ---- candidate_bow_r5: p249 Map 1 floor r1 (= sk1a1/g46.js, round 96) ---- */
/* ---- p249: Map 1 floor r1 — seamless tile floor + transparent decor (user 15 Oct 2026 00:41) — TEST candidate, not published ----
   Outermost genBG wrapper for Map 1 (sylva_lab, after p164). The incoming bake (p164 floor) is only the SHAPE source:
     dirt = warm hue (roads, branches, yards), water = blue pixels inside the river gate, bank = same band as p164, plots = same keep/core masks.
   The result replaces the ground in ONE bake pass (cached; re-entry = one drawImage). Nothing is drawn per frame except the river sparkle overlay.
   Roles: meadow=main ground, forest=forest edge (same tree-density field as p164), flower=patches in the meadow, road=main road (rotated along the road),
   plaza=branches to the houses + yards, water=river, bank=bank band, field=3 plots. Decor: dirt patches, stepping-stone plazas (stone edge to the door),
   gravel strips along road edges, 2-4 mud puddles on the road, sharp dark clumps, riverside mud strips. Props / collision / gates / NPCs untouched.
   Switch: window.__M1FLOOR2.setMode('old'|'new') or URL ?floor=old (old = p164 floor, kept). */
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
function shadowDraw(g,SD){g.lineJoin='round';
  const one=(S,ox,oy,px,py,posts)=>{for(const [gr,al] of S.grow){g.globalAlpha=al;g.lineWidth=gr*2;g.beginPath();S.poly.forEach((p,i)=>i?g.lineTo(ox+p[0],oy+p[1]):g.moveTo(ox+p[0],oy+p[1]));g.closePath();if(gr>0)g.stroke();g.fill();
    if(posts)for(const q of posts){g.beginPath();g.ellipse(px+q[0]+S.off[0]*.7,py+q[1]+S.off[1]*.7,q[2]+gr,(q[2]+gr)*.55,0,0,6.2832);g.fill();}}};
  if(SD.p1)one(SD.p1.shadow,SD.p1.x+SD.p1.shadow.off[0],SD.p1.y+SD.p1.shadow.off[1],SD.p1.x,SD.p1.y,SD.p1.shadow.posts);
  for(const S of SD.p1w)one(S,S.x+S.off[0],S.y+S.off[1],S.x,S.y,null);
  for(const S of SD.p2)one(S,S.x+S.off[0],S.y+S.off[1],S.x,S.y,S.posts);g.globalAlpha=1;}

(function(){
const BASE=window.__M1GROUND,AS=window.__M1FLOOR2_ASSETS;
if(!BASE||!AS||typeof genBG!=='function')return;
const Z=BASE.zone||'sylva_lab',P=BASE.params;
const CFG=window.__M1FLOOR2={version:'floor2-r1',on:!/[?&]floor=old/.test(location.search),
  tile_world:{meadow:512,flower:512,forest:512,road:512,plaza:512,water:512,bank:512,field:192},
  flower_scale:340,flower_lo:.56,flower_hi:.76,flower_clear:.45,tone_scale:520,tone_amt:.12,
  edge_dark:.14,dirt_feather_px:3,dirt_ao:.16,dirt_rim:.2,bank_dark:.14,
  water_edge_dark:.22,water_foam:.30,
  patch_p:.34,patch_cell:230,patch_w:[150,250],clump_p:.17,clump_cell:150,clump_w:[70,110],
  plaza_w:[300,400],strip_step:230,strip_w:[260,400],puddles:3,puddle_w:[58,84],mud_step:135,mud_w:[230,330],
  sparkles:240,flow:11,seed:5};
const ST=window.__M1FLOOR2_STATE={runs:0,cache_hit:0,last:null,errors:0,ready:false,active:false,err:null};
CFG.setMode=function(m){CFG.on=(m!=='old');try{if(typeof G!=='undefined'&&G.zone===Z)BG=genBG(Z);}catch(e){console.warn('[p249] setMode',e);}return CFG.on;};
/* ---------- assets ---------- */
const TL={},DE={};let READY=false;
const DC=P.display_comp||null;
const inv=(v,i)=>{if(!DC)return v;const q=(v-DC[i][1])/DC[i][0];return q<0?0:q>255?255:q;};
const loadImg=s=>new Promise((ok,no)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=()=>no(new Error('img'));im.src=s;});
Promise.all([].concat(Object.keys(AS.tiles).map(async n=>{const im=await loadImg(AS.tiles[n]),cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const g=cv.getContext('2d');g.drawImage(im,0,0);
    const d=g.getImageData(0,0,im.width,im.height).data,o=new Uint8ClampedArray(d.length);for(let i=0;i<d.length;i+=4){o[i]=inv(d[i],0);o[i+1]=inv(d[i+1],1);o[i+2]=inv(d[i+2],2);o[i+3]=255;}TL[n]={d:o};}),
  Object.keys(AS.decor).map(async n=>{const im=await loadImg(AS.decor[n]),cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const g=cv.getContext('2d');g.drawImage(im,0,0);
    const id=g.getImageData(0,0,im.width,im.height),d=id.data;for(let i=0;i<d.length;i+=4){d[i]=inv(d[i],0);d[i+1]=inv(d[i+1],1);d[i+2]=inv(d[i+2],2);}g.putImageData(id,0,0);DE[n]={cv,w:im.width,h:im.height};})))
 .then(()=>{READY=true;ST.ready=true;try{if(CFG.on&&typeof G!=='undefined'&&G.zone===Z&&typeof slReady==='function'&&slReady())BG=genBG(Z);}catch(e){ST.err=String(e&&e.stack||e);}})
 .catch(e=>{ST.err='asset '+e;console.warn('[p249] assets',e);});
let sr=0,sg=0,sb=0;
function tx(T,u,v){const d=T.d,iu=Math.floor(u),iv=Math.floor(v),fu=u-iu,fv=v-iv,x0=iu&511,x1=(iu+1)&511,y0=(iv&511)<<9,y1=((iv+1)&511)<<9;
  const a=(y0+x0)<<2;if(fu===0&&fv===0){sr=d[a];sg=d[a+1];sb=d[a+2];return;}
  const b=(y0+x1)<<2,c=(y1+x0)<<2,e=(y1+x1)<<2,w0=(1-fu)*(1-fv),w1=fu*(1-fv),w2=(1-fu)*fv,w3=fu*fv;
  sr=d[a]*w0+d[b]*w1+d[c]*w2+d[e]*w3;sg=d[a+1]*w0+d[b+1]*w1+d[c+1]*w2+d[e+1]*w3;sb=d[a+2]*w0+d[b+2]*w1+d[c+2]*w2+d[e+2]*w3;}
const hex0=h=>{const c=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];if(!DC)return c;return c.map((v,i)=>Math.max(0,Math.min(255,(v-DC[i][1])/DC[i][0])));};
/* ---------- sources (read only, same data as p164) ---------- */
function sources(){const R2=window.SYLVA_R2||{},LY=R2.layout||{};
  const rs=R2.roadSamples||[],roads=rs.map(o=>o.S),names=rs.map(o=>o.nm);
  const fa=(window.__FIELD_ART_LIST||[]).find(e=>e.map==='m1');const plots=fa?fa.plots:[];
  const river=typeof window.__slRiver==='function'?window.__slRiver():[];
  const clr=LY.clearing&&LY.clearing.outline||null;
  const TT=new Set(P.forest_types||[]),trees=(LY.props||[]).filter(r=>r&&TT.has(r[0])).map(r=>[r[1],r[2]]);
  const benches=(LY.props||[]).filter(r=>r&&/^svBench/.test(r[0])).map(r=>[r[1],r[2]]);
  const H1=window.__SYLVA_R3P1,SD={p1:(H1&&H1.shadow&&H1.reg&&H1.reg.items&&H1.reg.items[0])?{shadow:H1.shadow,x:H1.reg.items[0].x,y:H1.reg.items[0].y}:null,
    p1w:((window.__SYLVA_R3P1W||{}).shadows)||[],p2:((window.__SYLVA_R3P2||{}).shadows)||[]};
  const doors=[];const d1=R2.houseP1,d2=R2.gardenP2;
  if(d1&&d1.door&&d1.entrance)doors.push({door:d1.door,ent:d1.entrance});else doors.push({door:[825.7,592.5],ent:[798.6,635.2]});
  if(d2&&d2.door&&d2.entrance)doors.push({door:d2.door,ent:d2.entrance});else doors.push({door:[1414.1,478.6],ent:[1379.9,537.9]});
  {const h=(LY.props||[]).find(r=>r&&r[0]==='svHouseR');if(h){const sc=.6,ax=335,ay=452.8,st=[220,546.5];const dx=h[1]+(st[0]-ax)*sc,dy=h[2]+(st[1]-ay)*sc;doors.push({door:[dx,dy],ent:[dx,dy+35]});}}
  return {roads,names,plots,river,clr,SD,trees,benches,doors};}
/* ---------- masks ---------- */
function buildMasks(S,k,W,H){const M={};
  const mainR=S.roads.filter((r,i)=>S.names[i]==='main');
  M.roadAll=raster([0,0,W,H],k,g=>{for(const R of S.roads)sidePoly(g,R,0,0);},4);
  M.roadMain=raster([0,0,W,H],k,g=>{for(const R of mainR)sidePoly(g,R,0,0);},4);
  const kp=P.plot_pad;let pb=null;for(const pl of S.plots){const b=polyBox(pl.poly,(pl.grow||0)+(pl.edge_amp||0)+(pl.edge_soft||0)+kp+2);pb=pb?[Math.min(pb[0],b[0]),Math.min(pb[1],b[1]),Math.max(pb[2],b[2]),Math.max(pb[3],b[3])]:b;}
  if(pb){const bb=rect(pb[0],pb[1],pb[2],pb[3],k,W,H);
    M.keep=raster(bb,k,g=>{g.lineJoin='round';for(const pl of S.plots){const gr=(pl.grow||0)+(pl.edge_amp||0)+(pl.edge_soft||0)+kp;g.lineWidth=gr*2;g.beginPath();pl.poly.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();g.fill();g.stroke();}});
    M.core=raster(bb,k,g=>{g.lineJoin='round';g.lineWidth=P.protect_grow_px*2;for(const pl of S.plots){g.beginPath();pl.poly.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();g.fill();if(P.protect_grow_px>0)g.stroke();}});}
  if(S.river.length){const gp=P.water_gate_px;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const q of S.river){const r=Math.max(q.wl,q.wr)+gp+2;x0=Math.min(x0,q.x-r);x1=Math.max(x1,q.x+r);y0=Math.min(y0,q.y-r);y1=Math.max(y1,q.y+r);}
    const rb=rect(x0,y0,x1,y1,k,W,H);M.gate=raster(rb,k,g=>sidePoly(g,S.river,gp,gp));}
  if(S.clr){const b=polyBox(S.clr,2);M.lawn=raster(rect(b[0],b[1],b[2],b[3],k,W,H),k,g=>{g.beginPath();S.clr.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();g.fill();});}
  {const all=[];if(S.SD.p1){const s=S.SD.p1.shadow;for(const p of s.poly)all.push([S.SD.p1.x+s.off[0]+p[0],S.SD.p1.y+s.off[1]+p[1]]);}for(const s of S.SD.p1w.concat(S.SD.p2))for(const p of s.poly)all.push([s.x+s.off[0]+p[0],s.y+s.off[1]+p[1]]);
   if(all.length){const b=polyBox(all,40);M.shadow=raster(rect(b[0],b[1],b[2],b[3],k,W,H),k,g=>shadowDraw(g,S.SD));}}
  return M;}
/* road UV grid (1/2 grid): for each cell near the main road, arclength s (along) and signed lateral offset t -> the drag-mark tile follows the road without shearing */
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
  const LD=new Float32Array(511),LWt=new Float32Array(511);for(let v=-255;v<=255;v++){LD[v+255]=smooth(P.dirt_lo,P.dirt_hi,v);LWt[v+255]=smooth(P.water_lo,P.water_hi,v);}
  tm('read');
  /* water mask (copy of p164's: blue pixels inside the river gate, closed, then bank bands) */
  let WB=null;if(M.gate){const m=M.gate,w=m.w,h=m.h,wat=new Float32Array(w*h);let any=0;
    for(let v=0;v<h;v++)for(let u=0;u<w;u++){const gv=m.a[v*w+u];if(!gv)continue;const p=((v+m.y)*W+u+m.x)*4,wv=(gv/255)*LWt[d[p+2]-d[p]+255];if(wv>0){wat[v*w+u]=wv;any=1;}}
    if(any){const t=new Float32Array(w*h),Wm=new Float32Array(w*h),rc=Math.max(1,Math.round(P.water_close_px*k));
      blurTo(wat,Wm,t,w,h,rc,1);for(let i=0;i<Wm.length;i++)Wm[i]=Wm[i]>.2?1:0;blurTo(Wm,Wm,t,w,h,rc,1);for(let i=0;i<Wm.length;i++)Wm[i]=Math.max(smooth(.3,.6,wat[i]),smooth(.8,.97,Wm[i]));
      blurTo(Wm,Wm,t,w,h,1,1);
      const W1=new Float32Array(w*h),Wi=new Float32Array(w*h);blurTo(Wm,W1,t,w,h,Math.round(P.bank_px*k),2);blurTo(Wm,Wi,t,w,h,Math.max(2,Math.round(5*k)),2);
      WB={x:m.x,y:m.y,w,h,Wm,W1,Wi};}}
  tm('water');
  /* dirt: crisp AA mask + feathered mask */
  const Cm=new Float32Array(N),Af=new Float32Array(N),B=new Float32Array(N);
  for(let i=0,p=0;i<N;i++,p+=4)Af[i]=LD[d[p]-d[p+1]+255];
  blurTo(Af,Cm,B,W,H,Math.max(1,Math.round(1.5*k)),1);for(let i=0;i<N;i++)Cm[i]=smooth(.35,.65,Cm[i]);
  blurTo(Cm,Af,B,W,H,Math.max(1,Math.round(CFG.dirt_feather_px*k)),1);      // Af = feathered (soft edge of every dirt shape)
  tm('dirt');
  /* road/yard blend (1/4 grid) + direction */
  const rm=M.roadMain,w4=rm.sw,h4=rm.sh,RMn=new Float32Array(w4*h4),t4=new Float32Array(w4*h4);for(let i=0;i<RMn.length;i++)RMn[i]=rm.a[i]/255;blurTo(RMn,RMn,t4,w4,h4,Math.max(1,Math.round(P.yard_blend_px*k/4)),2);
  const RU=roadUV(S,k,W,H);
  const bil=(F,fw,fx,fy)=>{const x0=fx|0,y0=fy|0,tx_=fx-x0,ty_=fy-y0;return (F[y0*fw+x0]*(1-tx_)+F[y0*fw+x0+1]*tx_)*(1-ty_)+(F[(y0+1)*fw+x0]*(1-tx_)+F[(y0+1)*fw+x0+1]*tx_)*ty_;};
  /* lawn (clearing) */
  let LWb=null;if(M.lawn){const m=M.lawn,w=m.w,h=m.h,pad=Math.round(P.lawn_soft_px*k*2+4),ww=w+pad*2,hh=h+pad*2,a=new Float32Array(ww*hh),t=new Float32Array(ww*hh);
    for(let v=0;v<h;v++)for(let u=0;u<w;u++)a[(v+pad)*ww+u+pad]=m.a[v*w+u]/255;blurTo(a,a,t,ww,hh,Math.max(1,Math.round(P.lawn_soft_px*k)),2);LWb={a,x:m.x-pad,y:m.y-pad,w:ww,h:hh};}
  /* forest density (p164's field) + low-frequency noise grids (1/4) */
  const NF=4,nw=Math.ceil(W/NF)+2,nh=Math.ceil(H/NF)+2,NFl=new Float32Array(nw*nh),NTn=new Float32Array(nw*nh);
  for(let y=0;y<nh;y++)for(let x=0;x<nw;x++){const wx=(x*NF)/k,wy=(y*NF)/k;NFl[y*nw+x]=vnoise(wx,wy,CFG.flower_scale,CFG.seed*7+1)*.7+vnoise(wx,wy,CFG.flower_scale*.4,CFG.seed*7+2)*.3;NTn[y*nw+x]=vnoise(wx,wy,CFG.tone_scale,CFG.seed*7+3)*.65+vnoise(wx,wy,CFG.tone_scale*.35,CFG.seed*7+4)*.35;}
  let FO=null;if(S.trees.length){const ff=8,fw=Math.ceil(W/ff)+2,fh=Math.ceil(H/ff)+2,a=new Float32Array(fw*fh),t=new Float32Array(fw*fh),sg_=P.forest_sigma*k/ff,R3=Math.ceil(sg_*3);
    for(const [tx_,ty_] of S.trees){const cx=tx_*k/ff,cy=ty_*k/ff;for(let v=Math.max(0,Math.floor(cy-R3));v<=Math.min(fh-1,Math.ceil(cy+R3));v++)for(let u=Math.max(0,Math.floor(cx-R3));u<=Math.min(fw-1,Math.ceil(cx+R3));u++){const dx=u-cx,dy=v-cy;a[v*fw+u]+=Math.exp(-(dx*dx+dy*dy)/(2*sg_*sg_));}}
    blurTo(a,a,t,fw,fh,Math.max(1,Math.round(P.forest_blur*k/ff/1.7)),3);
    for(let v=0;v<fh;v++)for(let u=0;u<fw;u++){const wx=u*ff/k,wy=v*ff/k,n=vnoise(wx,wy,P.forest_edge_scale,53)*.7+vnoise(wx,wy,P.forest_edge_scale*.4,59)*.3;a[v*fw+u]=smooth(P.forest_lo,P.forest_hi,a[v*fw+u]+(n-.5)*P.forest_edge_amp);}
    FO={a,w:fw,h:fh,f:ff};}
  tm('fields');
  /* plots: field weight (same soil test as p164's protect) */
  const KE=M.keep,KC=M.core;let FA=null,PB=[];
  for(const pl of S.plots){const b=polyBox(pl.poly,0);PB.push(b);}
  if(KE){const w=KE.w,h=KE.h;FA=new Float32Array(w*h);const SLH=P.soil_L_hi,SLL=P.soil_L_lo;
    for(let v=0;v<h;v++)for(let u=0;u<w;u++){const kp=KE.a[v*w+u];if(!kp)continue;const p=((v+KE.y)*W+u+KE.x)*4,o0=d[p],o1=d[p+1],o2=d[p+2],Lo=.3*o0+.59*o1+.11*o2,kc=KC.a[v*w+u];
      FA[v*w+u]=(kp/255)*Math.max(kc/255,smooth(.25,.7,LD[o0-o1+255])*smooth(SLH,SLL,Lo));}
    const t=new Float32Array(w*h);blurTo(FA,FA,t,w,h,Math.max(1,Math.round(1.5*k)),1);
    // halo = soft tilled-earth ring around the soil, so the plot melts into the grass
    var FH=new Float32Array(w*h);blurTo(FA,FH,t,w,h,Math.max(2,Math.round(7*k)),2);}
  const fAt=(x,y,F)=>{if(!KE||!F)return 0;const u=x-KE.x,v=y-KE.y;return u<0||v<0||u>=KE.w||v>=KE.h?0:F[v*KE.w+u];};
  tm('plots');
  /* colours of the shading tints (bake space) */
  const SA=P.shadow_amt,S0=P.shadow_lo_hi[0],S1=P.shadow_lo_hi[1],SCL=hex0(P.shadow_colour||'#000000'),DB=DC?DC.map(q=>q[1]/q[0]):[0,0,0];
  const TM_=TL.meadow,TF_=TL.flower,TFo=TL.forest,TR_=TL.road,TP_=TL.plaza,TW_=TL.water,TB_=TL.bank,TFi=TL.field;
  const sMe=sc('meadow'),sFl=sc('flower'),sFo=sc('forest'),sRo=sc('road'),sPl=sc('plaza'),sWa=sc('water'),sBa=sc('bank'),sFi=sc('field');
  const outId=go.createImageData(W,H),od=outId.data;
  const FLO=CFG.flower_lo,FHI=CFG.flower_hi,FCL=CFG.flower_clear,TNA=CFG.tone_amt,ED=CFG.edge_dark,DAO=CFG.dirt_ao,DRM=CFG.dirt_rim,BDK=CFG.bank_dark,WED=CFG.water_edge_dark,WFO=CFG.water_foam;
  const WWm=W/k,HHm=H/k;
  /* ===== pass A: ground + bank + water + plots, one pixel at a time ===== */
  for(let y=0;y<H;y++){const fy=y/NF,wy=y/k,ry=Math.min(h4-1.001,Math.max(0,(y+.5)/4-.5));
   for(let x=0;x<W;x++){const i=y*W+x,p=i*4,wx=x/k;
    /* water + bank weights (sub-rect) */
    let w=0,w1=0,wi=0;if(WB){const u=x-WB.x,v=y-WB.y;if(u>=0&&v>=0&&u<WB.w&&v<WB.h){const j=v*WB.w+u;w=WB.Wm[j];w1=WB.W1[j];wi=WB.Wi[j];}}
    let r,g_,b;
    if(w>=.999){tx(TW_,wx*sWa,wy*sWa);r=sr;g_=sg;b=sb;}
    else{
      /* --- grass: meadow / flower patches / forest edge --- */
      const nfx=x/NF,nT=bil(NTn,nw,nfx,fy);let tone=1+(nT-.5)*2*TNA;
      let fo=0;if(FO){const fx=Math.min(FO.w-1.001,Math.max(0,(x+.5)/FO.f-.5)),fyy=Math.min(FO.h-1.001,Math.max(0,(y+.5)/FO.f-.5));fo=bil(FO.a,FO.w,fx,fyy);}
      let lwi=0;if(LWb){const u=x-LWb.x,v=y-LWb.y;if(u>=0&&v>=0&&u<LWb.w&&v<LWb.h)lwi=LWb.a[v*LWb.w+u];}
      const nfl=bil(NFl,nw,nfx,fy);let fl=smooth(FLO,FHI,nfl);fl=Math.max(fl,lwi*FCL);fl*=(1-fo);
      tx(TM_,wx*sMe,wy*sMe);let gr=sr,gg=sg,gb=sb;
      if(fl>.002){tx(TF_,wx*sFl+137,wy*sFl+71);gr+=(sr-gr)*fl;gg+=(sg-gg)*fl;gb+=(sb-gb)*fl;}
      if(fo>.002){tx(TFo,wx*sFo+59,wy*sFo+203);gr+=(sr-gr)*fo;gg+=(sg-gg)*fo;gb+=(sb-gb)*fo;}
      gr*=tone;gg*=tone;gb*=tone;
      /* --- dirt --- */
      const Dc=Cm[i],Dsoft=Af[i];let D=Dsoft;
      /* bank band (same footprint as p164's bank) */
      let bz=0;if(w1>0)bz=smooth(.015,.08,w1)*(1-w);
      if(bz>0)D*=(1-bz);
      /* the dirt of the plot soil is not road */
      if(KE){const kk=fAt(x,y,FA);if(kk>0)D*=(1-Math.min(1,kk*1.5));}
      if(D>.002||bz>0){
        let dr,dg,db;
        const mm=bil(RMn,w4,Math.min(w4-1.001,Math.max(0,(x+.5)/4-.5)),ry);
        tx(TP_,wx*sPl+11,wy*sPl+301);dr=sr;dg=sg;db=sb;
        if(mm>.004&&RU){const gx=Math.min(RU.w-1.001,Math.max(0,(x+.5)/RU.f-.5)),gy=Math.min(RU.h-1.001,Math.max(0,(y+.5)/RU.f-.5));
          if(RU.best[(gy|0)*RU.w+(gx|0)]<1e8){const s_=bil(RU.s,RU.w,gx,gy),t_=bil(RU.t,RU.w,gx,gy);tx(TR_,(t_+256)*sRo,s_*sRo);dr+=(sr-dr)*mm;dg+=(sg-dg)*mm;db+=(sb-db)*mm;}}
        /* thin darker inner edge so the dirt reads as slightly sunk */
        const rimk=Dc*smooth(.02,.35,1-Af[i])*DRM;if(rimk>0){const f=1-.14*rimk/Math.max(.01,DRM);dr*=f;dg*=f;db*=f;}
        /* contact shade on the grass side of the edge */
        const ao=(1-Dc)*smooth(.02,.3,Af[i])*DAO;if(ao>0){gr*=1-ao*.55;gg*=1-ao*.55;gb*=1-ao*.55;}
        if(D>0){gr+=(dr-gr)*D;gg+=(dg-gg)*D;gb+=(db-gb)*D;}
        if(bz>0){tx(TB_,wx*sBa+23,wy*sBa+97);let br=sr,bg=sg,bb=sb;const wet=smooth(.25,.6,w1),f=1-BDK*wet;br*=f;bg*=f;bb*=f;gr+=(br-gr)*bz;gg+=(bg-gg)*bz;gb+=(bb-gb)*bz;}
      }
      /* --- plots (field tile anchored to each plot's top-left so furrows start clean) --- */
      if(KE){const kk=fAt(x,y,FA),kh=fAt(x,y,FH);
        if(kh>.01&&kk<1){tx(TP_,wx*sPl+11,wy*sPl+301);const hz=smooth(.04,.35,kh)*(1-kk)*.55;gr+=(sr-gr)*hz;gg+=(sg-gg)*hz;gb+=(sb-gb)*hz;}
        if(kk>.002){let pb=PB[0],bd=1e9;for(const q of PB){const dy=wy<q[1]?q[1]-wy:wy>q[3]?wy-q[3]:0;if(dy<bd){bd=dy;pb=q;}}
          tx(TFi,(wx-pb[0])*sFi,(wy-pb[1])*sFi);const e=smooth(.25,.9,kk),dk=1-.16*(1-smooth(.55,.95,kk));gr+=(sr*dk-gr)*e;gg+=(sg*dk-gg)*e;gb+=(sb*dk-gb)*e;}}
      /* soft map-edge darkening */
      if(ED>0){let keepF=1;for(const dd of [wx,wy,WWm-wx,HHm-wy])if(dd<240)keepF*=1-ED*(1-dd/240);if(keepF<1){gr=gr*keepF+8*(1-keepF);gg=gg*keepF+24*(1-keepF);gb=gb*keepF+10*(1-keepF);}}
      r=gr;g_=gg;b=gb;
      if(w>0){tx(TW_,wx*sWa,wy*sWa);r+=(sr-r)*w;g_+=(sg-g_)*w;b+=(sb-b)*w;}
    }
    /* water: shade + foam near the shore */
    if(w>.002){const e=1-smooth(.5,.95,wi);if(e>0){const f=1-WED*e;const t_=w*e;r+=(r*f-r)*t_;g_+=(g_*f-g_)*t_;b+=(b*f-b)*t_;}
      const fm=smooth(.3,.5,wi)*(1-smooth(.5,.62,wi))*WFO*w;if(fm>0){r+=(236-r)*fm;g_+=(250-g_)*fm;b+=(250-b)*fm;}}
    od[p]=r;od[p+1]=g_;od[p+2]=b;od[p+3]=255;}}
  go.putImageData(outId,0,0);tm('paintA');
  return {out,Cm,WB,FA,FO,KE,TM,T0,fAt,bil,nw,NFl,FLO,FHI,LWb};}
/* ---------- decor ---------- */
function placeDecor(R,S,k,M){const go=R.out.getContext('2d'),{Cm,WB,KE}=R,W=R.out.width,H=R.out.height,WWm=W/k,HHm=H/k,R2=CFG;const log={};
  const cmAt=(x,y)=>{const a=Math.round(x*k),b=Math.round(y*k);return a<0||b<0||a>=W||b>=H?0:Cm[b*W+a];};
  const foAt=(x,y)=>{if(!R.FO)return 0;const F=R.FO,fx=Math.min(F.w-1.001,Math.max(0,(x*k+.5)/F.f-.5)),fy=Math.min(F.h-1.001,Math.max(0,(y*k+.5)/F.f-.5));return R.bil(F.a,F.w,fx,fy);};
  const rv=S.river,rvStride=Math.max(1,Math.floor(rv.length/150));
  const riverDist=(x,y)=>{let m=1e9;for(let i=0;i<rv.length;i+=rvStride){const q=rv[i],dd=Math.hypot(x-q.x,y-q.y)-Math.max(q.wl,q.wr);if(dd<m)m=dd;}return m;};
  const pbs=S.plots.map(pl=>polyBox(pl.poly,(pl.grow||0)+(pl.edge_amp||0)+12));
  const nearPlot=(x,y,r)=>pbs.some(b=>x>b[0]-r&&x<b[2]+r&&y>b[1]-r&&y<b[3]+r);
  const rnd=(i,j,s)=>hash(i,j,s+R2.seed*131);
  const onRoad=(x,y)=>mAt(M.roadAll,Math.round(x*k),Math.round(y*k))>0;
  const waterAt=(x,y)=>{if(!WB)return 0;const u=Math.round(x*k)-WB.x,v=Math.round(y*k)-WB.y;return u<0||v<0||u>=WB.w||v>=WB.h?0:WB.Wm[v*WB.w+u];};
  const lineClear=(x,y,rot,len,th)=>{const c=Math.cos(rot),s=Math.sin(rot);for(let t=-.5;t<=.5;t+=.125)for(const o of [-th,0,th]){const px=x+c*len*t-s*o,py=y+s*len*t+c*o;if(waterAt(px,py)>.02||onRoad(px,py))return false;}return true;};
  const plazaC=[];
  const draw=(name,x,y,rot,wTarget,alpha,flip)=>{const e=DE[name];if(!e)return;const s=wTarget/e.w;go.save();go.setTransform(k,0,0,k,0,0);go.globalAlpha=alpha;go.imageSmoothingQuality='high';go.translate(x,y);go.rotate(rot);go.scale(flip?-s:s,s);go.drawImage(e.cv,-e.w/2,-e.h/2);go.restore();};
  const ring=(x,y,r,f)=>{if(!f(x,y))return false;for(let a=0;a<6.283;a+=.785)if(!f(x+Math.cos(a)*r,y+Math.sin(a)*r))return false;return true;};
  /* house plazas first (so scatter keeps away from them): stone edge faces the door */
  const pz=['plazaA0','plazaB1','plazaA1','plazaB0'];let nPz=0;
  S.doors.forEach((dr,i)=>{const dx=dr.door[0]-dr.ent[0],dy=dr.door[1]-dr.ent[1],L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,wt=R2.plaza_w[0]+(R2.plaza_w[1]-R2.plaza_w[0])*rnd(i,1,500),nm=pz[i%pz.length],e=DE[nm];if(!e)return;
    const hs=e.h*wt/e.w,cx=dr.door[0]-ux*(26+.3*hs),cy=dr.door[1]-uy*(26+.3*hs),rot=Math.atan2(ux,-uy);
    draw(nm,cx,cy,rot,wt,.97,false);plazaC.push([cx,cy,wt*.7]);nPz++;});
  log.plazas=nPz;
  const farFromPlaza=(x,y,r)=>plazaC.every(q=>Math.hypot(x-q[0],y-q[1])>q[2]+r);
  /* bare dirt patches: under benches, beside paths, scattered in the meadow */
  const dp=['dirtA0','dirtA1','dirtA2','dirtB0','dirtB1','dirtB2'],placed=[];let nP=0;
  const okPatch=(x,y,wt,strict)=>{const r=wt*.5;if(x<r+30||y<r+30||x>WWm-r-30||y>HHm-r-30)return false;if(riverDist(x,y)<r+70)return false;if(nearPlot(x,y,r+25))return false;if(!farFromPlaza(x,y,r))return false;
    if(strict&&!ring(x,y,r*.75,(a,b)=>cmAt(a,b)<.05))return false;if(foAt(x,y)>.6)return false;for(const q of placed)if(Math.hypot(x-q[0],y-q[1])<(q[2]+r)*.55)return false;return true;};
  const putPatch=(x,y,wt,i,j,alpha)=>{const nm=dp[Math.floor(rnd(i,j,510)*dp.length)];draw(nm,x,y,rnd(i,j,511)*6.283,wt,alpha||.92,rnd(i,j,512)>.5);placed.push([x,y,wt]);nP++;};
  S.benches.forEach((b,i)=>{const wt=150+rnd(i,2,520)*40,x=b[0],y=b[1]+8;if(okPatch(x,y,wt,false))putPatch(x,y,wt,i,2,.9);});
  S.roads.forEach((Rr,ri)=>{let acc=0,pd=0;for(let s=1;s<Rr.length;s++){acc+=Math.hypot(Rr[s].x-Rr[s-1].x,Rr[s].y-Rr[s-1].y);if(acc-pd<300)continue;pd=acc;const q=Rr[s],side=rnd(ri,s,530)>.5?1:-1,off=(side>0?q.wl:q.wr)+55+rnd(ri,s,531)*70,x=q.x+q.nx*side*off,y=q.y+q.ny*side*off,wt=R2.patch_w[0]+(R2.patch_w[1]-R2.patch_w[0])*rnd(ri,s,532);
    if(rnd(ri,s,533)<.55&&okPatch(x,y,wt,true))putPatch(x,y,wt,ri,s,.9);}});
  {const cs=R2.patch_cell;for(let j=0;j<HHm/cs;j++)for(let i=0;i<WWm/cs;i++){if(rnd(i,j,540)>R2.patch_p)continue;const x=(i+.1+rnd(i,j,541)*.8)*cs,y=(j+.1+rnd(i,j,542)*.8)*cs,wt=R2.patch_w[0]+(R2.patch_w[1]-R2.patch_w[0])*rnd(i,j,543);if(okPatch(x,y,wt,true))putPatch(x,y,wt,i,j,.9);}}
  log.patches=nP;
  /* gravel + grass strips along the road edges */
  let nS=0;S.roads.forEach((Rr,ri)=>{if(S.names[ri]==='wheat_spine_S')return;let acc=0,pd=-1e9;for(let s=1;s<Rr.length;s++){acc+=Math.hypot(Rr[s].x-Rr[s-1].x,Rr[s].y-Rr[s-1].y);if(acc-pd<R2.strip_step*(.7+.6*rnd(ri,s,550)))continue;pd=acc;const q=Rr[s],side=rnd(ri,s,551)>.5?1:-1,off=(side>0?q.wl:q.wr)+3,x=q.x+q.nx*side*off,y=q.y+q.ny*side*off,len=R2.strip_w[0]+(R2.strip_w[1]-R2.strip_w[0])*rnd(ri,s,552);
    const rot=Math.atan2(q.nx,-q.ny)+(rnd(ri,s,553)-.5)*.1;if(riverDist(x,y)<len*.5+30||nearPlot(x,y,len*.4)||x<40||x>WWm-40)continue;draw(rnd(ri,s,554)>.5?'stripA':'stripB',x,y,rot,len,.9,false);nS++;}});
  log.strips=nS;
  /* mud puddles: 2-4 on the main road, random rotation + scale */
  {const mi=S.names.indexOf('main');let nPd=0;if(mi>=0){const Rr=S.roads[mi],others=[];S.roads.forEach((o,oi)=>{if(oi!==mi){others.push([o[0].x,o[0].y]);others.push([o[o.length-1].x,o[o.length-1].y]);}});const sp=[];
    for(let t=0;t<80&&nPd<R2.puddles;t++){const s=Math.floor(rnd(t,1,560)*Rr.length),q=Rr[s];if(q.x<350||q.x>2300)continue;if(others.some(o=>Math.hypot(o[0]-q.x,o[1]-q.y)<170))continue;if(sp.some(o=>Math.hypot(o-q.x)<420))continue;
      const lat=(rnd(t,2,561)-.5)*(q.wl+q.wr)*.3,x=q.x+q.nx*lat,y=q.y+q.ny*lat,wt=R2.puddle_w[0]+(R2.puddle_w[1]-R2.puddle_w[0])*rnd(t,3,562);draw(rnd(t,4,563)>.5?'puddle0':'puddle1',x,y,rnd(t,5,564)*6.283,wt,.97,rnd(t,6,565)>.5);sp.push(q.x);nPd++;}}
    log.puddles=nPd;}
  /* dark overgrown clumps (sharp sheet) in the meadow to break the tile repetition */
  {let nC=0;const cs=R2.clump_cell;for(let j=0;j<HHm/cs;j++)for(let i=0;i<WWm/cs;i++){if(rnd(i,j,570)>R2.clump_p)continue;const x=(i+.1+rnd(i,j,571)*.8)*cs,y=(j+.1+rnd(i,j,572)*.8)*cs,wt=R2.clump_w[0]+(R2.clump_w[1]-R2.clump_w[0])*rnd(i,j,573),r=wt*.5;
      if(x<r+20||y<r+20||x>WWm-r-20||y>HHm-r-20)continue;if(riverDist(x,y)<r+30||nearPlot(x,y,r+10)||foAt(x,y)>.7||!farFromPlaza(x,y,r*.6))continue;if(!ring(x,y,r*.8,(a,b)=>cmAt(a,b)<.04))continue;
      draw('clump'+Math.floor(rnd(i,j,574)*3),x,y,(rnd(i,j,575)-.5)*.5,wt,.96,rnd(i,j,576)>.5);nC++;}log.clumps=nC;}
  /* riverside mud strips: blend the bank into the grass */
  {let nM=0;const bc=[2650,1010];let acc=0,pd=-1e9;for(let s=1;s<rv.length;s++){acc+=Math.hypot(rv[s].x-rv[s-1].x,rv[s].y-rv[s-1].y);if(acc-pd<R2.mud_step*(.75+.5*rnd(s,1,580)))continue;pd=acc;const q=rv[s];
    for(const side of [1,-1]){if(rnd(s,side+3,581)>.75)continue;const off=(side>0?q.wl:q.wr)+24,x=q.x+q.nx*side*off,y=q.y+q.ny*side*off,len=R2.mud_w[0]+(R2.mud_w[1]-R2.mud_w[0])*rnd(s,side+3,582);
      const rot=Math.atan2(q.nx,-q.ny)+(rnd(s,side+3,583)-.5)*.12;if(Math.hypot(x-bc[0],y-bc[1])<340||nearPlot(x,y,len*.4)||x<30||y<30||x>WWm-30||y>HHm-30||!lineClear(x,y,rot,len,13))continue;draw('mudstrip',x,y,rot,len,.85,rnd(s,side+3,584)>.5);nM++;}}log.mud=nM;}
  return log;}
/* ---------- shadows (p164's house / prop cast shadows, re-applied over the new ground + decor) ---------- */
function shadowPass(R,M,k){const m=M.shadow;if(!m)return 0;const go=R.out.getContext('2d'),id=go.getImageData(m.x,m.y,m.w,m.h),dd=id.data,W=R.out.width,WB=R.WB,SA=P.shadow_amt,S0=P.shadow_lo_hi[0],S1=P.shadow_lo_hi[1],SCL=hex0(P.shadow_colour||'#000000');let n=0;
  for(let v=0;v<m.h;v++)for(let u=0;u<m.w;u++){const sv=m.a[v*m.w+u];if(!sv)continue;const s=SA*smooth(S0,S1,sv/255);if(s<=0)continue;const x=u+m.x,y=v+m.y;let wg=1;
    if(WB){const a=x-WB.x,b=y-WB.y;if(a>=0&&b>=0&&a<WB.w&&b<WB.h)wg*=1-WB.Wm[b*WB.w+a];}if(R.FA)wg*=1-Math.min(1,R.fAt(x,y,R.FA)*1.2);if(wg<=0)continue;const q=s*wg,p=(v*m.w+u)*4;
    dd[p]+=(SCL[0]-dd[p])*q;dd[p+1]+=(SCL[1]-dd[p+1])*q;dd[p+2]+=(SCL[2]-dd[p+2])*q;n++;}
  go.putImageData(id,m.x,m.y);return n;}
/* ---------- cache + genBG wrapper ---------- */
let CACHE=null,RIV=[];
function fp(c){const g=c.getContext('2d'),W=c.width,H=c.height;let h=2166136261;for(let y=7;y<H;y+=97){const d=g.getImageData(0,y,W,1).data;for(let i=0;i<d.length;i+=28)h=Math.imul(h^d[i]^(d[i+1]<<8)^(d[i+2]<<16),16777619);}return (h>>>0)+':'+W+'x'+H;}
const oG=genBG;genBG=function(zid){const c=oG.apply(this,arguments);ST.active=false;
  try{if(CFG.on&&zid===Z&&READY&&c&&c.getContext&&!(typeof slReady==='function'&&!slReady())){const t0=performance.now(),key=CFG.version+'|'+fp(c),tf=performance.now();
      if(CACHE&&CACHE.key===key){const g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);g.drawImage(CACHE.cv,0,0);RIV=CACHE.riv;ST.cache_hit++;ST.last={cached:true,fp_ms:+(tf-t0).toFixed(1),ms:+(performance.now()-t0).toFixed(1)};ST.active=true;}
      else{const k=c.width/ZONES[zid].w,S=sources(),tm0=performance.now(),M=buildMasks(S,k,c.width,c.height),tm1=performance.now(),R=paintFloor(c,S,M,k),tA=performance.now(),dl=placeDecor(R,S,k,M),tB=performance.now(),ns=shadowPass(R,M,k),tC=performance.now();
        const g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);g.drawImage(R.out,0,0);
        if(CACHE){CACHE.cv.width=CACHE.cv.height=0;}CACHE={key,cv:R.out,riv:S.river};RIV=S.river;ST.runs++;ST.active=true;
        ST.last={cached:false,fp_ms:+(tf-t0).toFixed(1),masks_ms:+(tm1-tm0).toFixed(1),paint_ms:+(tA-tm1).toFixed(1),decor_ms:+(tB-tA).toFixed(1),shadow_ms:+(tC-tB).toFixed(1),total_ms:+(performance.now()-t0).toFixed(1),k,size:[c.width,c.height],decor:dl,shadow_px:ns,T:R.TM,
          sources:{roads:S.roads.length,plots:S.plots.length,river:S.river.length,trees:S.trees.length,doors:S.doors.length,benches:S.benches.length}};ST.firstRun=ST.firstRun||ST.last;}}}
  catch(e){ST.errors++;ST.err=String(e&&e.stack||e);console.warn('[p249] floor',e);}
  return c;};
window.__M1FLOOR2_STATE.dropCache=()=>{if(CACHE){CACHE.cv.width=CACHE.cv.height=0;CACHE=null;}};
/* ---------- river sparkles (the only per-frame part: a few dozen tiny additive stars while the river is on screen) ---------- */
const SPK=[];for(let i=0;i<CFG.sparkles;i++)SPK.push({t:hash(i,1,901),l:hash(i,2,902)*2-1,ph:hash(i,3,903),sp:.7+hash(i,4,904)*1.2,sz:1.2+hash(i,5,905)*1.8});
const oSF=typeof surfaceFx==='function'?surfaceFx:null;
if(oSF)surfaceFx=function(Zn){oSF.apply(this,arguments);
  try{if(!ST.active||!CFG.on||typeof G==='undefined'||G.zone!==Z||RIV.length<4)return;const n=RIV.length,tt=(typeof time==='number'?time:performance.now()/1000),ds=6.6;
    ctx.save();ctx.globalCompositeOperation='lighter';
    for(const s of SPK){const f=((s.t*n+tt*CFG.flow*s.sp/ds)%n+n)%n,i0=Math.floor(f),a=f-i0,q0=RIV[i0],q1=RIV[(i0+1)%n];if(!q0||!q1)continue;
      const x0=q0.x+(q1.x-q0.x)*a,y0=q0.y+(q1.y-q0.y)*a,nx=q0.nx+(q1.nx-q0.nx)*a,ny=q0.ny+(q1.ny-q0.ny)*a,wl=q0.wl*.8,wr=q0.wr*.8,off=(s.l>=0?s.l*wl:s.l*wr)+Math.sin(tt*.7+s.ph*6.283)*3;
      const x=x0+nx*off,y=y0+ny*off;if(typeof inView==='function'&&!inView(x,y,12))continue;
      const tw=.5+.5*Math.sin(tt*s.sp*2.3+s.ph*6.283),al=tw*tw*tw*Math.min(1,i0/14,(n-i0)/14);if(al<.04)continue;const z=s.sz*(.7+.5*tw);
      ctx.fillStyle='rgba(225,250,255,'+(al*.7).toFixed(3)+')';ctx.fillRect(x-z,y-.5,z*2,1);ctx.fillRect(x-.5,y-z*.8,1,z*1.6);ctx.fillStyle='rgba(255,255,255,'+al.toFixed(3)+')';ctx.fillRect(x-1,y-1,2,2);}
    ctx.restore();}catch(e){}};
})();

