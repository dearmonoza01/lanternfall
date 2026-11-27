
/* ---- waterfx-r2 (TEST, 12 Nov 2026): visibly MOVING water on the ponds of Map 12 (drum-stage pond) and Map 11 (pond + creek) ----
   r2 (DeaRz: "only the sparkles move"): * two scrolling caustic layers (network-of-light texture), different directions and speeds, shifts clearly within ~1 s, additive ('lighter') at ~0.33;
   * surface wobble: the water region of the ground is re-drawn in 6-px horizontal strips shifted by +-2.5 px (sine over time and y), clipped by the water mask;
   * Map 11: the creek (water thinner than the pond core, found once by a distance transform) gets a FLOW direction along its main axis, the pond drifts / swirls slowly;
   * bank shimmer kept; sparkles toned down (24, smaller, alpha .55);
   * phone-cheap: masks baked once at 1/4 res; textures pre-rendered once; caustics composed at half res into small off-screen canvases; wobble only for strips that contain water; view-only; ?waterfx=off disables; ?waterfx=nowobble disables only the wobble.
   Water classes (Art's walk masks): Map 12 (20,40,140) in map12_walk_r2; Map 11 (40,110,230) in map11_walk_r3_3600 (only at the default 3600 scale). Debug: window.__WATERFX ---- */
(function(){'use strict';
const Q=String(location.search),OFF=/[?&]waterfx=off\b/.test(Q),NOWOB=/[?&]waterfx=nowobble\b/.test(Q);
const WF=window.__WATERFX={ver:'waterfx-r2',on:!OFF,err:null,maps:{},stats:{frames:0,skipped:0,sparkles:0,ms:0,wobbleStrips:0}};
if(OFF)return;
const ERR=(w,e)=>{WF.err=w+': '+((e&&e.message)||e);try{console.error('[WATERFX]',w,e)}catch(_){}};
const RS=.25,CELL=32,STRIP=8,WOB=2.5;
/* ---- caustic texture (periodic network of bright lines) ---- */
function texture(seed,f1,f2,tint){const N=128,c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d'),id=g.createImageData(N,N),d=id.data;
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const u=x/N*6.2832,v=y/N*6.2832;
    const s1=Math.sin(u*f1+Math.sin(v*3+seed)*1.3),s2=Math.sin(v*f2+Math.sin(u*2+seed*2)*1.3);
    const c1=Math.pow(Math.max(0,1-Math.abs(s1+s2)*.55),4);const a=Math.min(1,c1*1.0);const k=(y*N+x)*4;
    d[k]=tint[0];d[k+1]=tint[1];d[k+2]=tint[2];d[k+3]=Math.round(a*255)}
  g.putImageData(id,0,0);return c}
let TEX1=null,TEX2=null;const L=[];/* layers: {c,g,p1,p2} */
function mkLayer(){const c=document.createElement('canvas'),g=c.getContext('2d');return{c,g,p1:g.createPattern(TEX1,'repeat'),p2:g.createPattern(TEX2,'repeat')}}
function ensureTex(){if(TEX1)return;TEX1=texture(0,2,2,[225,248,255]);TEX2=texture(2.1,3,2,[200,235,255]);L.push(mkLayer(),mkLayer(),mkLayer());/* 0 = pond/all, 1 = creek, 2 = bank shimmer */}
/* ---- per-map mask bake ---- */
const MAPS={map12:{key:'map12',w:3200,h:2602,src:()=>window.__M12_MASK&&__M12_MASK.walk,isWater:(r,g,b)=>r<40&&g<70&&b>100&&b<180,ok:()=>true},
            map11:{key:'map11',w:3600,h:3000,src:()=>window.__M11_MASK3&&__M11_MASK3.walk,isWater:(r,g,b)=>r<90&&g>80&&g<150&&b>190,ok:()=>window.__MAP11&&__MAP11.K!==1}};
WF._M=MAPS;function maskCanvas(mw,mh,pred){const c=document.createElement('canvas');c.width=mw;c.height=mh;const g=c.getContext('2d'),im=g.createImageData(mw,mh);let n=0;for(let j=0;j<mw*mh;j++)if(pred(j)){const k=j*4;im.data[k]=im.data[k+1]=im.data[k+2]=255;im.data[k+3]=255;n++}g.putImageData(im,0,0);return{c,n}}
/* chamfer distance (3-4) from non-water, in cells; and distance from a given set */
function dist(mw,mh,inSet){const D=new Uint16Array(mw*mh),INF=60000;for(let j=0;j<D.length;j++)D[j]=inSet(j)?INF:0;
  for(let y=0;y<mh;y++)for(let x=0;x<mw;x++){const j=y*mw+x;let v=D[j];if(!v)continue;if(x>0)v=Math.min(v,D[j-1]+3);if(y>0){v=Math.min(v,D[j-mw]+3);if(x>0)v=Math.min(v,D[j-mw-1]+4);if(x<mw-1)v=Math.min(v,D[j-mw+1]+4)}D[j]=v}
  for(let y=mh-1;y>=0;y--)for(let x=mw-1;x>=0;x--){const j=y*mw+x;let v=D[j];if(!v)continue;if(x<mw-1)v=Math.min(v,D[j+1]+3);if(y<mh-1){v=Math.min(v,D[j+mw]+3);if(x<mw-1)v=Math.min(v,D[j+mw+1]+4);if(x>0)v=Math.min(v,D[j+mw-1]+4)}D[j]=v}
  return D}
function bake(M){if(M.state)return;M.state='loading';const s=M.src();if(!s){M.state='nodata';return}const im=new Image();im.onload=()=>{try{const mw=Math.ceil(M.w*RS),mh=Math.ceil(M.h*RS),c=document.createElement('canvas');c.width=mw;c.height=mh;const g=c.getContext('2d',{willReadFrequently:true});g.imageSmoothingEnabled=false;g.drawImage(im,0,0,M.w,M.h,0,0,mw,mh);const d=g.getImageData(0,0,mw,mh).data;
    const w=new Uint8Array(mw*mh);for(let i=0,j=0;j<w.length;i+=4,j++)w[j]=M.isWater(d[i],d[i+1],d[i+2])?1:0;
    const edge=new Uint8Array(mw*mh);const occ=new Map(),rows=new Map();let n=0;
    for(let y=0;y<mh;y++)for(let x=0;x<mw;x++){const j=y*mw+x;if(!w[j])continue;n++;occ.set(Math.floor(x/RS/CELL)+','+Math.floor(y/RS/CELL),1);{const rk=Math.floor(y/RS/STRIP),r0=rows.get(rk);const wx=x/RS;if(!r0)rows.set(rk,[wx,wx+4]);else{if(wx<r0[0])r0[0]=wx;if(wx+4>r0[1])r0[1]=wx+4}}
      if(x>0&&!w[j-1]||x<mw-1&&!w[j+1]||y>0&&!w[j-mw]||y<mh-1&&!w[j+mw]){for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=mw||yy>=mh)continue;if(w[yy*mw+xx])edge[yy*mw+xx]=1}}}
    const wm=maskCanvas(mw,mh,j=>w[j]).c,em=maskCanvas(mw,mh,j=>edge[j]).c;
    /* pond core = water far from the bank (distance >= RC cells); pond = water within RC cells of a core cell; creek = the rest */
    let pm=null,cm=null,flow=null,creekN=0;
    if(M.key==='map11'){const D=dist(mw,mh,j=>w[j]);const RC=3*22;/* 22 cells ~ 88 world px */
      const core=new Uint8Array(mw*mh);let cn=0;for(let j=0;j<core.length;j++)if(D[j]>=RC){core[j]=1;cn++}
      if(cn){const D2=dist(mw,mh,j=>!core[j]);const pond=new Uint8Array(mw*mh);for(let j=0;j<pond.length;j++)pond[j]=w[j]&&D2[j]<=RC+8?1:0;
        const cr=new Uint8Array(mw*mh);let sx=0,sy=0,sxx=0,syy=0,sxy=0;for(let j=0;j<cr.length;j++)if(w[j]&&!pond[j]){cr[j]=1;creekN++;const x=j%mw,y=(j/mw)|0;sx+=x;sy+=y;sxx+=x*x;syy+=y*y;sxy+=x*y}
        pm=maskCanvas(mw,mh,j=>pond[j]).c;
        if(creekN>200){cm=maskCanvas(mw,mh,j=>cr[j]).c;const mx=sx/creekN,my=sy/creekN,cxx=sxx/creekN-mx*mx,cyy=syy/creekN-my*my,cxy=sxy/creekN-mx*my;const th=.5*Math.atan2(2*cxy,cxx-cyy);let fx=Math.cos(th),fy=Math.sin(th);if(Math.abs(fx)>=Math.abs(fy)?fx<0:fy<0){fx=-fx;fy=-fy}flow={x:fx,y:fy}}}}
    M.mw=mw;M.mh=mh;M.water=w;M.wm=wm;M.em=em;M.pm=pm;M.cm=cm;M.flow=flow;M.occ=occ;M.rows=rows;M.cells=n;M.state='ready';WF.maps[M.key]={cells:n,w:mw,h:mh,creekCells:creekN,flow:flow&&[+flow.x.toFixed(2),+flow.y.toFixed(2)]}}catch(e){M.state='error';ERR('bake '+M.key,e)}};im.onerror=()=>{M.state='error';ERR('bake img',M.key)};im.src=s}
/* ---- sparkles (toned down) ---- */
const SP=[];for(let i=0;i<24;i++)SP.push({x:0,y:0,t:1,life:1,sz:2,on:false});
const rnd=(a,b)=>a+Math.random()*(b-a);
function respawn(s,M,vx,vy,vw,vh){for(let k=0;k<10;k++){const x=vx+Math.random()*vw,y=vy+Math.random()*vh,cx=Math.floor(x*RS),cy=Math.floor(y*RS);if(cx<0||cy<0||cx>=M.mw||cy>=M.mh)continue;if(M.water[cy*M.mw+cx]){s.x=x;s.y=y;s.t=0;s.life=rnd(.9,1.7);s.sz=rnd(1.6,3.2);s.on=true;return true}}s.on=false;return false}
/* ---- caustic layer: two scrolling pattern passes composed at half res, clipped by a mask ---- */
function caustics(Ly,fw,fh,vx,vy,vw,vh,T,v1,v2,mix,mask,srcX,srcY,srcW,srcH,alpha){const g=Ly.g,sc=fw/vw;
  g.globalCompositeOperation='source-over';g.clearRect(0,0,fw,fh);g.save();g.scale(sc,sc);g.translate(-vx,-vy);
  g.globalAlpha=alpha*(.12+.88*mix);g.save();g.translate(v1[0],v1[1]);g.scale(1.5,1.5);g.fillStyle=Ly.p1;g.fillRect((vx-v1[0])/1.5-4,(vy-v1[1])/1.5-4,vw/1.5+8,vh/1.5+8);g.restore();
  g.globalAlpha=alpha*(.12+.88*(1-mix));g.save();g.translate(v2[0],v2[1]);g.scale(1.9,1.9);g.fillStyle=Ly.p2;g.fillRect((vx-v2[0])/1.9-4,(vy-v2[1])/1.9-4,vw/1.9+8,vh/1.9+8);g.restore();g.restore();
  g.globalCompositeOperation='destination-in';g.globalAlpha=1;g.drawImage(mask,srcX,srcY,srcW,srcH,0,0,fw,fh);g.globalCompositeOperation='source-over'}
/* ---- surface wobble: ground water strips shifted sideways, clipped by the water mask ---- */
let WB=null,WG=null,SN=null,SG2=null;
function wobble(M,vx,vy,vw,vh,T,srcX,srcY,srcW,srcH){const tr=ctx.getTransform(),k=Math.abs(tr.a);if(!k||tr.b||tr.c)return;
  let w=Math.min(k,.5);
  const pw=Math.ceil(vw*w),ph=Math.ceil(vh*w);if(!WB){WB=document.createElement('canvas');WG=WB.getContext('2d');SN=document.createElement('canvas');SG2=SN.getContext('2d')}const still=WB.width===pw&&WB.height===ph&&WF._cx===vx&&WF._cy===vy&&WF._cg===G.zone;WF._cx=vx;WF._cy=vy;WF._cg=G.zone;WF._wk=((WF._wk||0)+1)%3;if(still&&WF._wk!==0){ctx.drawImage(WB,vx,vy,vw,vh);return}
  if(WB.width!==pw||WB.height!==ph){WB.width=pw;WB.height=ph;SN.width=pw;SN.height=ph}
  /* one snapshot of the ground in view (single read of the main canvas), strips are then cut from the small off-screen copy */
  const q0=performance.now();SG2.globalCompositeOperation='copy';try{SG2.drawImage(ctx.canvas,tr.a*vx+tr.e,tr.d*vy+tr.f,tr.a*vw,tr.d*vh,0,0,pw,ph)}catch(_){return}SG2.globalCompositeOperation='source-over';WF.stats.msSnap=(WF.stats.msSnap||0)+performance.now()-q0;const q1=performance.now();
  WG.globalCompositeOperation='source-over';WG.clearRect(0,0,pw,ph);let n=0;
  const y0=Math.floor(vy/STRIP)*STRIP;for(let y=y0;y<vy+vh;y+=STRIP){const rg=M.rows.get(Math.floor(y/STRIP));if(!rg)continue;const x0=Math.max(vx,rg[0]-4),x1=Math.min(vx+vw,rg[1]+4);if(x1<=x0)continue;
    const dx=WOB*Math.sin(T*2.3+y*.047)+.8*Math.sin(T*3.7+y*.11);
    const sx=(x0+dx-vx)*w,sy=(y-vy)*w,sw=(x1-x0)*w,sh=STRIP*w;const dy=(y-vy)*w;
    try{WG.drawImage(SN,Math.max(0,sx),sy,Math.min(sw,pw-Math.max(0,sx)),sh,(x0-vx)*w+Math.max(0,-sx),dy,Math.min(sw,pw-Math.max(0,sx)),sh)}catch(_){}n++}
  WG.globalCompositeOperation='destination-in';WG.drawImage(M.wm,srcX,srcY,srcW,srcH,0,0,pw,ph);WG.globalCompositeOperation='source-over';
  ctx.drawImage(WB,vx,vy,vw,vh);WF.stats.msStrips=(WF.stats.msStrips||0)+performance.now()-q1;WF.stats.wobbleStrips=n}
/* ---- draw (called from surfaceFx: after the ground, before props / entities) ---- */
function draw(){const Z=ZONES[G.zone];if(!Z)return;const M=G.zone==='map12'?MAPS.map12:(G.zone==='map11'&&MAPS.map11.ok()?MAPS.map11:null);if(!M){return}
  if(!M.state)bake(M);if(M.state!=='ready'){return}
  const t0=performance.now();ensureTex();
  const vx=Math.max(0,cam.x),vy=Math.max(0,cam.y),vx1=Math.min(M.w,cam.x+VW+2),vy1=Math.min(M.h,cam.y+VH+2),vw=vx1-vx,vh=vy1-vy;if(vw<=0||vh<=0)return;
  let any=false;for(let cy=Math.floor(vy/CELL);cy<=Math.floor(vy1/CELL)&&!any;cy++)for(let cx=Math.floor(vx/CELL);cx<=Math.floor(vx1/CELL);cx++){if(M.occ.has(cx+','+cy)){any=true;break}}
  if(!any){WF.stats.skipped++;return}
  const sc=.5,fw=Math.ceil(vw*sc),fh=Math.ceil(vh*sc);for(const Ly of L){if(Ly.c.width!==fw||Ly.c.height!==fh){Ly.c.width=fw;Ly.c.height=fh;Ly.p1=Ly.g.createPattern(TEX1,'repeat');Ly.p2=Ly.g.createPattern(TEX2,'repeat')}}
  const T=time,ph=(T%2.8)/2.8,mix=.5+.5*Math.sin(ph*6.2832),srcX=vx*RS,srcY=vy*RS,srcW=vw*RS,srcH=vh*RS;
  /* 1) wobble the ground water */
  if(!NOWOB)wobble(M,vx,vy,vw,vh,T,srcX,srcY,srcW,srcH);
  /* 2) caustics: pond / whole water = two layers drifting in slowly rotating, opposite directions; creek = flow along its axis */
  const pondMask=M.pm||M.wm,sw=T*.32;
  caustics(L[0],fw,fh,vx,vy,vw,vh,T,[26*Math.sin(T*1.3),16*Math.sin(T*1.0+1)],[-22*Math.sin(T*.95+2),18*Math.cos(T*1.45)],mix,pondMask,srcX,srcY,srcW,srcH,.95);
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.34;ctx.imageSmoothingEnabled=true;ctx.drawImage(L[0].c,vx,vy,vw,vh);
  if(M.cm&&M.flow){const f=M.flow,sp=78;caustics(L[1],fw,fh,vx,vy,vw,vh,T,[f.x*sp*T,f.y*sp*T],[f.x*sp*.6*T+f.y*10*Math.sin(T*1.3),f.y*sp*.6*T-f.x*10*Math.sin(T*1.3)],mix,M.cm,srcX,srcY,srcW,srcH,.95);ctx.globalAlpha=.36;ctx.drawImage(L[1].c,vx,vy,vw,vh)}
  ctx.restore();
  /* 3) bank shimmer */
  const S=L[2],SG=S.g;SG.globalCompositeOperation='source-over';SG.clearRect(0,0,fw,fh);SG.save();SG.scale(sc,sc);SG.translate(-vx,-vy);SG.globalAlpha=.25+.55*(.5+.5*Math.sin(T*1.7));SG.fillStyle='#d8f6ff';SG.fillRect(vx,vy,vw,vh);SG.restore();SG.globalCompositeOperation='destination-in';SG.globalAlpha=1;SG.drawImage(M.em,srcX,srcY,srcW,srcH,0,0,fw,fh);SG.globalCompositeOperation='source-over';
  ctx.save();ctx.globalAlpha=.34;ctx.drawImage(S.c,vx,vy,vw,vh);ctx.restore();
  /* 4) sparkles (small, fewer) */
  ctx.save();ctx.globalCompositeOperation='lighter';const dt=Math.min(.1,Math.max(0,T-(WF._t||T)));WF._t=T;let live=0;
  for(const s of SP){if(!s.on||s.x<vx||s.x>vx1||s.y<vy||s.y>vy1){if(!respawn(s,M,vx,vy,vw,vh))continue}s.t+=dt/s.life;if(s.t>=1){if(!respawn(s,M,vx,vy,vw,vh))continue}live++;const a=Math.sin(Math.min(1,s.t)*Math.PI),r=s.sz*(.6+.6*a);ctx.globalAlpha=.55*a;ctx.fillStyle='#ffffff';ctx.fillRect(s.x-r*.5,s.y-r*.5,r,r);ctx.strokeStyle='#ffffff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(s.x-r*1.8*a,s.y);ctx.lineTo(s.x+r*1.8*a,s.y);ctx.moveTo(s.x,s.y-r*1.8*a);ctx.lineTo(s.x,s.y+r*1.8*a);ctx.stroke()}
  ctx.restore();WF.stats.sparkles=live;WF.stats.frames++;WF.stats.ms+=performance.now()-t0}
try{const _s=surfaceFx;surfaceFx=function(Z){const r=_s.apply(this,arguments);try{draw()}catch(e){ERR('draw',e)}return r}}catch(e){ERR('hook surfaceFx',e)}
console.info('[WATERFX] ready r2');
})();
