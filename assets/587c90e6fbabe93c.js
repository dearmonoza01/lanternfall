
/* p339 outline r2 (DeaRz 2 Nov 18:59 "พร้อพแต่ละชิ้นทำไมความหนาของขอบดำไม่เท่ากัน บางอันมีบางอันไม่มี แก้ให้หน่อย";
   3 Nov 04:49 chose "เส้นบาง" = a thin line on every prop, too-thick lines made thin).
   Each standing prop picture is prepared once (cached):
   - it already has a dark rim thicker than the target -> the outer part of that dark rim is trimmed away, so the line left is the target width;
   - it has no dark rim -> a thin dark line of the target width is added around it;
   - see-through layers (water, glow), ground decals, buildings cut in slices and pieces laid edge to edge (walls, cliffs, banks,
     bridges) are left as they are.
   The target is in WORLD pixels (OL.w), so every prop shows the same line at any zoom. ?outline=off = old look, ?olw=2.5 = width. */
(function(){'use strict';if(/[?&]outline=off/.test(location.search))return;
const OL=window.__OUTLINE={on:true,w:2,col:[34,23,15],made:0,trim:0,add:0,keep:0,skipKey:0,cache:new WeakMap(),seen:new WeakMap(),info:new Map(),err:[],bud:1,msMax:0,dbg:[],watch:null};
{const m=/[?&]olw=([\d.]+)/.exec(location.search);if(m)OL.w=Math.max(.5,Math.min(6,+m[1]));}
const SKIP=/fountain|wall|cliff|fence|bridge|rail|deck|water|fall|stream|tile|floor|path|plaza|zone|solid|out$|sky|swirl|ring|glow|light|shadow|fx|mist|rope|stair|carpet|rug|decal|cg_|slice|main\d|hs[a-f]\d|z4|occ|fix|gorge|crest|top_|puddle|lily|post_|gbpost|brpost/i;
const keyOk=OL.keyOk=new Map();OL.wantKey=t=>wantKey(t);function wantKey(t){let v=keyOk.get(t);if(v===undefined){const d=PROP_DEFS[t];v=!!d&&d.layer!=='ground'&&!SKIP.test(t)&&!SKIP.test(d.n||'');keyOk.set(t,v);}return v;}
let inProp=0;
{const od=drawProp;window.drawProp=function(p){if(!OL.on||!p||!wantKey(p.t)){OL.skipKey++;return od.apply(this,arguments);}inProp++;const ot=OL.curT,ov=OL.curV;OL.curT=p.t;OL.curV=p.v;if(inProp===1){const T=ctx.getTransform();OL.ws=Math.sqrt(Math.abs(T.a*T.d-T.b*T.c));}   // world -> canvas scale (zoom x pixel ratio)
  try{return od.apply(this,arguments);}finally{inProp--;OL.curT=ot;OL.curV=ov;}};}
OL.fr=0;OL.spent=0;OL.pN=OL.pJ=OL.pB=0;OL.pendF=[0,0,0];(function f(){OL.bud=1;OL.fr++;OL.spent=0;OL.pendF=[OL.pN,OL.pJ,OL.pB];OL.pN=OL.pJ=OL.pB=0;requestAnimationFrame(f);})();   // pictures are prepared within a small time slice each frame (no hitch on map load)
/* chamfer distance (3-4) from the pixels where M=0, for the pixels where M=1; result /3 = px */
function dist(M,w,h,ob,wantI){const n=w*h,D=new Float32Array(n),I=wantI?new Int32Array(n).fill(-1):null,BIG=1e9,E=ob?3:BIG,F=ob?4:BIG;   // chamfer 3-4 distance from pixels where M=0 (/3 = px); I = index of that nearest pixel (-1 = canvas edge)
  for(let i=0;i<n;i++){if(M[i])D[i]=BIG;else{D[i]=0;if(I)I[i]=i;}}
  const st=(i,j,c)=>{const v=D[j]+c;if(v<D[i]){D[i]=v;if(I)I[i]=I[j];}};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(!D[i])continue;
    if(x>0)st(i,i-1,3);else if(E<D[i])D[i]=E;
    if(y>0){st(i,i-w,3);if(x>0)st(i,i-w-1,4);if(x<w-1)st(i,i-w+1,4);}else if(E<D[i])D[i]=E;}
  for(let y=h-1;y>=0;y--)for(let x=w-1;x>=0;x--){const i=y*w+x;if(!D[i])continue;
    if(x<w-1)st(i,i+1,3);else if(E<D[i]){D[i]=E;if(I)I[i]=-1;}
    if(y<h-1){st(i,i+w,3);if(x<w-1)st(i,i+w+1,4);if(x>0)st(i,i+w-1,4);}else if(E<D[i]){D[i]=E;if(I)I[i]=-1;}}
  for(let i=0;i<n;i++)D[i]/=3;return wantI?{D,I}:D;}
const idMap=new WeakMap();let idN=0;const idOf=o=>{let v=idMap.get(o);if(!v){v=++idN;idMap.set(o,v);}return v;};
/* the measuring work (runs in a background worker so the game never waits; same code runs inline if workers are not available) */
function ana(D,w,h,pad,sw,sh,tg,col){const n=w*h,M=new Uint8Array(n),Lm=new Float32Array(n),K=new Uint8Array(n);let op=0,soft=0;
  const lum=()=>{for(let i=0;i<n;i++){const o=i*4,r=D[o],g=D[o+1],b=D[o+2];Lm[i]=.3*r+.59*g+.11*b;M[i]=D[o+3]>=128&&!(D[o+3]<240&&Lm[i]<90)?1:0;const ch=Math.max(r,g,b)-Math.min(r,g,b);K[i]=M[i]&&(Lm[i]<40||(Lm[i]<56&&ch<30))?1:0;}
    /* drop small specks (noisy baked shadow / sparkles): only solid pieces get a line */
    const L=new Int32Array(n),st=[],sizes=[0];let tot=0;for(let i=0;i<n;i++)tot+=M[i];const minA=Math.max(40,tot*.004);
    for(let i=0;i<n;i++){if(!M[i]||L[i])continue;const id=sizes.length;let c=0;L[i]=id;st.push(i);
      while(st.length){const p=st.pop(),x=p%w;c++;if(x>0&&M[p-1]&&!L[p-1]){L[p-1]=id;st.push(p-1);}if(x<w-1&&M[p+1]&&!L[p+1]){L[p+1]=id;st.push(p+1);}if(p>=w&&M[p-w]&&!L[p-w]){L[p-w]=id;st.push(p-w);}if(p<n-w&&M[p+w]&&!L[p+w]){L[p+w]=id;st.push(p+w);}}
      sizes.push(c);}
    for(let i=0;i<n;i++)if(M[i]&&sizes[L[i]]<minA){M[i]=0;K[i]=0;}};   // K = line-coloured pixel (near black / dark brown / dark navy; dark leaf green is not a line)
  lum();for(let i=0;i<n;i++){const a=D[i*4+3];if(a>20){op++;if(a<200)soft++;}}
  if(!op||soft/op>.45)return {r:'soft'};
  {let bo=0,bn=0;for(let X=pad;X<pad+sw;X++){bn+=2;bo+=M[pad*w+X]+M[(pad+sh-1)*w+X];}for(let Y=pad;Y<pad+sh;Y++){bn+=2;bo+=M[Y*w+pad]+M[Y*w+pad+sw-1];}
   if(bo/bn>.2)return {r:'edge'};}
  let dIn=dist(M,w,h,1);
  const ring=new Array(26).fill(0),rdk=new Array(26).fill(0);for(let i=0;i<n;i++){if(!M[i])continue;const r=Math.ceil(dIn[i]-.01);if(r<1||r>25)continue;ring[r]++;if(Lm[i]<58)rdk[r]++;}
  const darkFrac=ring[1]?rdk[1]/ring[1]:0;let t=0;if(darkFrac>=.5){t=1;while(t<25&&ring[t+1]&&rdk[t+1]/ring[t+1]>=.45)t++;}
  if(t>Math.max(8,2.5*tg))return {r:'dark',t};   // dark all through (far shaded tree): not a line, leave alone
  let res='add';
  if(t>tg+1){/* 1) the whole rim is thicker than the target: cut away the outer (t - target) px */
    const cut=Math.min(t-tg,10);for(let i=0;i<n;i++){if(!M[i])continue;const v=dIn[i];if(v<=cut&&Lm[i]<80){D[i*4+3]=0;}else if(v<=cut+1&&Lm[i]<80){D[i*4+3]=Math.round(D[i*4+3]*Math.min(1,v-cut));}}
    res='trim';lum();dIn=dist(M,w,h,1);}
  /* 2) measure the line width at every point of the edge, then add outside only what is missing to reach the target */
  const di=dist(M,w,h,1,1),IN=di.I;dIn=di.D;
  const R=new Uint8Array(n),q=[];for(let i=0;i<n;i++)if(K[i]&&dIn[i]<=1.5){R[i]=1;q.push(i);}
  while(q.length){const i=q.pop(),x=i%w;
    if(x>0){const j=i-1;if(!R[j]&&K[j]&&dIn[j]<=8){R[j]=1;q.push(j);}}
    if(x<w-1){const j=i+1;if(!R[j]&&K[j]&&dIn[j]<=8){R[j]=1;q.push(j);}}
    if(i>=w){const j=i-w;if(!R[j]&&K[j]&&dIn[j]<=8){R[j]=1;q.push(j);}}
    if(i<n-w){const j=i+w;if(!R[j]&&K[j]&&dIn[j]<=8){R[j]=1;q.push(j);}}}
  let bw=new Float32Array(n);for(let i=0;i<n;i++){if(!R[i])continue;const o=IN[i];if(o>=0&&dIn[i]>bw[o])bw[o]=dIn[i];}   // width of the line, stored on the outside pixel next to it
  for(let pass=0;pass<2;pass++){const b2=bw.slice();for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x;if(M[i])continue;let m=b2[i];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const v=b2[i+dy*w+dx];if(v>m)m=v;}bw[i]=m;}}
  const Mo=new Uint8Array(n);for(let i=0;i<n;i++)Mo[i]=M[i]?0:1;const dO=dist(Mo,w,h,0,1),dOut=dO.D,IO=dO.I,R0=col[0],G0=col[1],B0=col[2];let added=0;
  for(let i=0;i<n;i++){if(M[i])continue;const v=dOut[i];if(v>tg+1)continue;const b=IO[i];let w0=0;if(b>=0){const o=IN[b];if(o>=0)w0=bw[o];}
    const need=tg-w0;if(need<=.25||D[i*4+3]>60)continue;const a=Math.max(0,Math.min(1,need+.5-v))*235;if(a<=D[i*4+3])continue;
    const o=i*4,ea=D[o+3]/255,na=a/255;added++;
    D[o]=Math.round(D[o]*ea+R0*(1-ea));D[o+1]=Math.round(D[o+1]*ea+G0*(1-ea));D[o+2]=Math.round(D[o+2]*ea+B0*(1-ea));D[o+3]=Math.round(255*Math.max(ea,na));}
  if(res==='add'&&!added)return {r:'ok',t};
  return {r:res,t,ch:1};}
let WK=null;const JOBS=new Map();let jid=0;OL.jobs=0;
try{const src=dist.toString()+'\n'+ana.toString()+'\nself.onmessage=function(e){const m=e.data;let r;try{if(m.bm){const oc=new OffscreenCanvas(m.w,m.h),x=oc.getContext("2d",{willReadFrequently:true});x.drawImage(m.bm,m.pad,m.pad);m.bm.close();const im=x.getImageData(0,0,m.w,m.h);r=ana(im.data,m.w,m.h,m.pad,m.sw,m.sh,m.tg,m.col);if(r.ch){x.putImageData(im,0,0);const ob=oc.transferToImageBitmap();self.postMessage({id:m.id,r:r.r,t:r.t,ob},[ob]);return;}self.postMessage({id:m.id,r:r.r,t:r.t});return;}const D=new Uint8ClampedArray(m.buf);r=ana(D,m.w,m.h,m.pad,m.sw,m.sh,m.tg,m.col);self.postMessage({id:m.id,r:r.r,t:r.t,buf:r.ch?D.buffer:null},r.ch?[D.buffer]:[]);}catch(x){self.postMessage({id:m.id,r:"err "+x.message});}};';
  const url=URL.createObjectURL(new Blob([src],{type:'text/javascript'})),NW=Math.max(1,Math.min(3,(navigator.hardwareConcurrency||2)-1)),POOL=[];   // 1-3 background workers
  for(let q=0;q<NW;q++){const wk=new Worker(url);wk.onmessage=e=>{const m=e.data,j=JOBS.get(m.id);if(!j)return;JOBS.delete(m.id);OL.jobs--;if(m.ob)doneBM(j,m.r,m.t,m.ob);else done(j,m.r,m.t,m.buf?new Uint8ClampedArray(m.buf):null);};POOL.push(wk);}
  let rr=0;WK={postMessage:(m,tr)=>{POOL[rr++%POOL.length].postMessage(m,tr);}};OL.nw=NW;}catch(_){WK=null;}
const BM=typeof OffscreenCanvas!=='undefined'&&typeof createImageBitmap==='function'&&!/[?&]olbm=off/.test(location.search);   // whole job (resize, read, measure, line) runs in the worker
function doneBM(j,r,t,ob){try{OL.info.set(j.T+'#'+j.k,j.T+' '+r+(t!=null?' '+t:''));ob.__pad=j.pad;ob.__u=j.U;ob.__olOut=1;OL.made++;if(r==='trim')OL.trim++;else OL.add++;j.cm.set(j.k,ob);addNear(j,ob);}catch(e){j.cm.set(j.k,null);if(OL.err.length<10)OL.err.push('b '+e.message);}}
/* the same prop picture is sometimes re-made at a slightly different size (sharp-texture redraw when the view scale changes):
   reuse the finished line picture of the same prop/variant when the size is within 15 %, instead of waiting for a new one */
OL.near=new Map();function addNear(j,c){const L=OL.near.get(j.TV)||[];if(L.length<24)L.push({c,sw:j.sw0,sh:j.sh0,tq:j.tq});OL.near.set(j.TV,L);}
function findNear(TV,sw,sh,tq){const L=OL.near.get(TV);if(!L)return undefined;for(const e of L){if(e.tq!==tq)continue;const a=sw/e.sw,b=sh/e.sh;if(a>.85&&a<1.15&&Math.abs(a-b)<.03)return e.c;}return undefined;}
function done(j,r,t,D){try{OL.info.set(j.T+'#'+j.k,j.T+' '+r+(t!=null?' '+t:''));
    if(!D){OL.keep++;j.cm.set(j.k,null);addNear(j,null);return;}
    j.x.putImageData(new ImageData(D,j.w,j.h),0,0);j.cv.__pad=j.pad;j.cv.__u=j.U;j.cv.__olOut=1;OL.made++;if(r==='trim')OL.trim++;else OL.add++;j.cm.set(j.k,j.cv);addNear(j,j.cv);
  }catch(e){j.cm.set(j.k,null);if(OL.err.length<10)OL.err.push('w '+e.message);}}
function prep(img,sx,sy,sw0,sh0,sc){const t0=OL.w/sc,U=t0<1.2?Math.min(4,Math.ceil(1.2/t0)):1,tg=t0*U,k=sx+'|'+sy+'|'+sw0+'|'+sh0+'|'+Math.round(t0*8);   // small pictures are prepared U x larger so a thin line still fits
  let cm=OL.cache.get(img);if(!cm){/* only pictures that stay the same across frames are prepared (a picture made new every frame is left alone) */
    const f0=OL.seen.get(img);if(f0===undefined){OL.seen.set(img,OL.fr);if(!OL.warming)OL.pN++;return null;}if(OL.fr-f0<1){if(!OL.warming)OL.pN++;return null;}
    cm=new Map();OL.cache.set(img,cm);}
  const c=cm.get(k);if(c!==undefined){if(c===0&&!OL.warming){OL.pJ++;if(OL.jt){const q=OL.curT+'|'+k;OL.jt[q]=(OL.jt[q]||0)+1;}}return c||null;}   // 0 = being prepared
  const TV=OL.curT+'#'+(OL.curV||0),tq=Math.round(t0*8);
  if(OL.jobs>=8*(OL.nw||1)||OL.spent>6){if(!OL.warming){OL.pB++;if(OL.bt){const q=OL.curT+'|'+k;OL.bt[q]=(OL.bt[q]||0)+1;}}return null;}   // up to 8 pictures in the worker at once; at most ~6 ms of picture reading per frame
  try{const sw=Math.round(sw0*U),sh=Math.round(sh0*U);const pad=Math.ceil(tg)+2,w=sw+pad*2,h=sh+pad*2;if(w*h>4e6){OL.keep++;cm.set(k,null);return null;}
    if(WK&&BM){const id=++jid,j={cm,k,pad,U,w,h,T:OL.curT,TV,sw0,sh0,tq};JOBS.set(id,j);OL.jobs++;cm.set(k,0);
      createImageBitmap(img,sx,sy,sw0,sh0,{resizeWidth:sw,resizeHeight:sh,resizeQuality:'high'}).then(bm=>{WK.postMessage({id,bm,w,h,pad,sw,sh,tg,col:OL.col},[bm]);},()=>{JOBS.delete(id);OL.jobs--;cm.set(k,null);});
      return null;}
    const cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d',{willReadFrequently:true});x.imageSmoothingQuality='high';x.drawImage(img,sx,sy,sw0,sh0,pad,pad,sw,sh);
    const im=x.getImageData(0,0,w,h),j={cm,k,cv,x,pad,U,w,h,T:OL.curT,TV,sw0,sh0,tq};
    if(WK){const id=++jid;JOBS.set(id,j);OL.jobs++;cm.set(k,0);WK.postMessage({id,w,h,pad,sw,sh,tg,col:OL.col,buf:im.data.buffer},[im.data.buffer]);return null;}
    const D=im.data,r=ana(D,w,h,pad,sw,sh,tg,OL.col);done(j,r.r,r.t,r.ch?D:null);return cm.get(k)||null;
  }catch(e){cm.set(k,null);if(OL.err.length<10)OL.err.push(e.message);return null;}}
function mk(PD){const f=function(img){
  if(!inProp||!img||img.__olOut||this.globalCompositeOperation!=='source-over')return PD.apply(this,arguments);   // __olOut = a picture this module made (when the draw call passes through a second wrapper)
  try{let sx=0,sy=0,sw,sh,dx,dy,dw,dh;const n=arguments.length,iw=img.naturalWidth||img.videoWidth||img.width,ih=img.naturalHeight||img.videoHeight||img.height;
    if(!iw||!ih)return PD.apply(this,arguments);
    if(n===9){[,sx,sy,sw,sh,dx,dy,dw,dh]=arguments;}else if(n===5){sw=iw;sh=ih;[,dx,dy,dw,dh]=arguments;}else{sw=iw;sh=ih;[,dx,dy]=arguments;dw=sw;dh=sh;}
    if(sw<12||sh<12||!dw||!dh)return PD.apply(this,arguments);
    const T=this.getTransform(),sc=Math.sqrt(Math.abs(T.a*T.d-T.b*T.c))/(OL.ws||1)*Math.abs(dw/sw);   // world px per source px
    if(!(sc>0))return PD.apply(this,arguments);
    const tm0=performance.now(),c=prep(img,sx,sy,sw,sh,Math.pow(2,Math.round(Math.log2(sc)*4)/4)),ms=performance.now()-tm0;OL.spent+=ms;if(ms>OL.msMax){OL.msMax=ms;OL.msT=OL.curT;}if(!c)return PD.apply(this,arguments);
    const p=c.__pad,kx=dw/(c.width-2*p),ky=dh/(c.height-2*p);return PD.call(this,c,dx-p*kx,dy-p*ky,c.width*kx,c.height*ky);
  }catch(e){if(OL.err.length<10)OL.err.push('d '+e.message);}
  return PD.apply(this,arguments);};f.__ol=1;return f;}
/* the main canvas context carries its own drawImage (hero sprite swaps etc.): wrap that one, and again if a later module replaces it */
function install(){const C=typeof ctx!=='undefined'?ctx:null;if(!C||(C.drawImage&&C.drawImage.__ol))return;C.drawImage=mk(C.drawImage);}
/* get props ready BEFORE they come on screen: each frame a few props just outside the view are drawn invisibly (alpha 0),
   which only starts their preparation, so the line is already there when they scroll in */
{const warmed=new WeakMap();let pi=0;
 const NOWARM=/[?&]olwarm=off/.test(location.search);const warm=()=>{try{if(NOWARM||!OL.on||typeof PROPS==='undefined'||typeof propVisible!=='function'||typeof P==='undefined')return;
   const L=PROPS,n=L.length;if(!n)return;let tries=0,did=0;ctx.save();ctx.globalAlpha=0;
   try{while(tries<120&&did<6&&OL.jobs<8*(OL.nw||1)&&OL.spent<4){tries++;pi=(pi+1)%n;const p=L[pi];if(!p)continue;const wc=warmed.get(p)||0;if(wc>=3)continue;
     if(Math.abs(p.x-P.x)>1600||Math.abs(p.y-P.y)>1100)continue;const d=PROP_DEFS[p.t];if(!d||d.layer==='ground'||!wantKey(p.t))continue;
     if(propVisible(p))continue;warmed.set(p,wc+1);did++;OL.warming=1;try{drawProp(p);}finally{OL.warming=0;}}}finally{ctx.restore();}}catch(e){if(OL.err.length<10)OL.err.push('warm '+e.message);}};
 OL.warm=warm;(function f(){warm();requestAnimationFrame(f);})();}
install();setInterval(()=>{try{install();}catch(_){}},1000);
})();

