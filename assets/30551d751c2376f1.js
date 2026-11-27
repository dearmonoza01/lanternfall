
/* ---- candidate_perf1_r1: p262 perf-fix1 r1 (ORDER_20261018_perf-fix1) ----
   B monster frames from small pre-shrunk copies · D ground in tiles · A tree/grass sway from ready-made poses · F still trees on "low"
   graphics · FPS counter in the TEST tray. C (save/restore) was measured and skipped (< 1 ms). Nothing here writes the save.
   Switches: window.__PF1 (A/B/D/F, memory only). */
/* p262 perf-fix1 r1 header: switches (TEST: they can be flipped from the FPS panel; never saved) */
window.__PF1=window.__PF1||{ver:'p262-r1',B:true,D:true,A:true,F:true,stats:{}};if(/[?&]perf1=off\b/.test(location.search)){const P0=window.__PF1;P0.B=P0.D=P0.A=P0.F=false;P0.offFlag=true;}
/* B — monster frames: each atlas cell is shrunk ONCE to a half / quarter copy (exact 2×2 averages, the same steps the browser's own
   high-quality shrink uses) and the frame is then drawn from that small copy with the same smoothing, to the same rectangle.
   Applies only to 9-argument draws from the monster sprite atlases when the frame is shown at ≤ 1/2 size. Toggle: __PF1.B */
(function(){const PF=window.__PF1;if(typeof ctx==='undefined'||!ctx||!window.MON_SPRITES)return;
  const ST=PF.stats.B={hit:0,built:0,px:0,evict:0,skip:0};const CAP=16e6;   // cached pixels (≈64 MB)
  const IMGS=new WeakSet();let lastScan=-1e9;function scan(){lastScan=performance.now();for(const R of (MON_SPRITES.list||[]))for(const i of (R.imgs||[]))if(i)IMGS.add(i);}
  const ID=new WeakMap();let nid=0;const C=new Map();
  function half(src,w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='low';return [c,g];}
  function cell(img,sx,sy,sw,sh,L){let id=ID.get(img);if(id==null){id=++nid;ID.set(img,id);}const k=id+'|'+sx+'|'+sy+'|'+sw+'|'+sh+'|'+L;let e=C.get(k);
    if(e){C.delete(k);C.set(k,e);return e;}
    let w=sw,h=sh,src=img,x=sx,y=sy,c=null;for(let l=0;l<L;l++){const [cc,g]=half(null,w/2,h/2);g.drawImage(src,x,y,w,h,0,0,w/2,h/2);src=cc;x=0;y=0;w/=2;h/=2;c=cc;}
    C.set(k,c);ST.built++;ST.px+=c.width*c.height;while(ST.px>CAP&&C.size){const [k0,c0]=C.entries().next().value;C.delete(k0);ST.px-=c0.width*c0.height;ST.evict++;}return c;}
  const prev=ctx.drawImage;
  ctx.drawImage=function(img,sx,sy,sw,sh,dx,dy,dw,dh){
    if(PF.B&&arguments.length===9&&img){if(!IMGS.has(img)&&performance.now()-lastScan>2000)scan();
      if(IMGS.has(img)){const m=this.getTransform(),k=Math.max(Math.abs(dw)*Math.hypot(m.a,m.b)/sw,Math.abs(dh)*Math.hypot(m.c,m.d)/sh);
        let L=k>0&&k<=.5?Math.min(2,Math.floor(Math.log2(1/k))):0;while(L>0&&((sw%(1<<L))||(sh%(1<<L))||(sx%(1<<L))||(sy%(1<<L))))L--;
        if(L>0){const c=cell(img,sx,sy,sw,sh,L);ST.hit++;return prev.call(this,c,0,0,c.width,c.height,dx,dy,dw,dh);}ST.skip++;}}
    return prev.apply(this,arguments);};
})();
/* D — ground background in tiles. The map's baked ground (BG, up to 5480 px wide) is copied into 1024 px tiles (+2 px margin on each
   side, copied only when a tile first comes on screen); render() then draws only the tiles inside the requested rectangle, each with the
   same source→screen mapping as the one big draw. Each tile is cut to its own band of whole screen pixels, and its margin feeds the
   smoothing at the cut, so every screen pixel is sampled exactly as before. With a rotated camera it falls back to the single draw.
   Rebuilt when the zone's ground is re-baked (BG replaced). Toggle: __PF1.D */
(function(){const PF=window.__PF1;if(typeof ctx==='undefined'||!ctx||typeof BG==='undefined')return;
  const T=1024,O=2,ST=PF.stats.D={tiles:0,builds:0,draws:0,px:0,rotSkip:0};let src=null,TL=null,nx=0,ny=0;
  function build(bg){TL=[];nx=Math.ceil(bg.width/T);ny=Math.ceil(bg.height/T);ST.px=0;
    for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const x0=Math.max(0,i*T-O),y0=Math.max(0,j*T-O),x1=Math.min(bg.width,(i+1)*T+O),y1=Math.min(bg.height,(j+1)*T+O);
      TL.push({x0,y0,x1,y1,c:null});}src=bg;ST.tiles=TL.length;ST.builds++;}
  function tile(t){if(!t.c){const c=document.createElement('canvas');c.width=t.x1-t.x0;c.height=t.y1-t.y0;c.getContext('2d').drawImage(src,t.x0,t.y0,c.width,c.height,0,0,c.width,c.height);t.c=c;ST.px+=c.width*c.height;}return t.c;}
  const prev=ctx.drawImage;
  ctx.drawImage=function(img){if(img&&img===BG&&arguments.length===9&&PF.bgTime){const t=performance.now();try{return draw.apply(this,arguments);}finally{PF.bgTime(performance.now()-t);}}return draw.apply(this,arguments);};
  function draw(img,sx,sy,sw,sh,dx,dy,dw,dh){
    if(PF.D&&arguments.length===9&&img&&img===BG&&sw>0&&sh>0&&dw>0&&dh>0){const m=this.getTransform();
      if(m.b!==0||m.c!==0){ST.rotSkip++;return prev.apply(this,arguments);}
      if(src!==img||!TL||nx!==Math.ceil(img.width/T)||ny!==Math.ceil(img.height/T))build(img);
      const kx=dw/sw,ky=dh/sh,X1=sx+sw,Y1=sy+sh,devX=u=>m.a*(dx+(u-sx)*kx)+m.e,devY=v=>m.d*(dy+(v-sy)*ky)+m.f;
      const i0=Math.max(0,Math.floor(sx/T)),i1=Math.min(nx-1,Math.floor((X1-1e-9)/T)),j0=Math.max(0,Math.floor(sy/T)),j1=Math.min(ny-1,Math.floor((Y1-1e-9)/T));
      if(i0===i1&&j0===j1){const t=TL[j0*nx+i0],c=tile(t);ST.draws++;return prev.call(this,c,sx-t.x0,sy-t.y0,sw,sh,dx,dy,dw,dh);}
      const W=this.canvas.width,H=this.canvas.height;
      for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const t=TL[j*nx+i],c=tile(t);
        const ax=i>i0?Math.max(sx,i*T-O):sx,ay=j>j0?Math.max(sy,j*T-O):sy,bx=i<i1?Math.min(X1,(i+1)*T+O):X1,by=j<j1?Math.min(Y1,(j+1)*T+O):Y1;   // inner sides: margin for the smoothing; outer sides: exactly the request
        let cx0=i>i0?Math.round(devX(i*T)):-1,cx1=i<i1?Math.round(devX((i+1)*T)):W+1,cy0=j>j0?Math.round(devY(j*T)):-1,cy1=j<j1?Math.round(devY((j+1)*T)):H+1;
        if(m.a<0){const q=cx0;cx0=Math.min(cx0,cx1);cx1=Math.max(q,cx1);}if(m.d<0){const q=cy0;cy0=Math.min(cy0,cy1);cy1=Math.max(q,cy1);}
        this.save();this.setTransform(1,0,0,1,0,0);this.beginPath();this.rect(cx0,cy0,cx1-cx0,cy1-cy0);this.clip();this.setTransform(m);   // whole-pixel band: no partial coverage at the cut
        prev.call(this,c,ax-t.x0,ay-t.y0,bx-ax,by-ay,dx+(ax-sx)*kx,dy+(ay-sy)*ky,(bx-ax)*kx,(by-ay)*ky);this.restore();ST.draws++;}
      return;}
    return prev.apply(this,arguments);}
})();
/* A — tree / grass sway from ready-made frames. Each sway type gets PF.N poses (default 16) between full left and full right lean,
   drawn once with the engine's own strip method (p221 strips, the same lean curve and edge limits per strip). Every tree still has its
   own wind (same gust formula, own phase and rate); per frame it only picks the pose nearest to its current lean. Nothing is re-drawn
   per tree per frame. Poses are built only when a tree using them is on screen (a few per frame). Rice (p160) already works this way.
   F — on "low" graphics the trees stand still (their normal sprite); grass keeps its sway. Toggles: __PF1.A, __PF1.F */
(function(){const PF=window.__PF1;if(typeof propSprite!=='function'||typeof SYLVA_ART==='undefined'||!window.COLSLAB||!COLSLAB.amb||!COLSLAB.art||!window.__P221)return;
  const AMB=COLSLAB.amb,ART=COLSLAB.art,SA=(typeof SYLVA_ART!=='undefined')?SYLVA_ART:null,P221=window.__P221,TREE_SWAY=1.45;PF.N=PF.N||16;
  const ST=PF.stats.A={picks:0,built:0,px:0,late:0,still:0,types:{}};
  // engine copies (sylva lab r14/r18): wind and per-tree hash
  const slH=(x,y)=>{let h=Math.imul((Math.round(x)*73856093)^(Math.round(y)*19349663),2654435761);h^=h>>>15;h=Math.imul(h,2246822519);h^=h>>>13;return(h>>>0)/4294967296;};
  function slWindAt(t,x,ph){const g=.7+.3*Math.sin(t*.23-x*.0042+1.7);return g*(.62*Math.sin(t*.9+ph)+.38*Math.sin(t*1.57+ph*1.9+1.3))+.2*Math.sin(t*.31+x*.003);}
  const WMAX=1.2;   // |slWindAt| ≤ 1·(.62+.38)+.2
  const CGEXT={};
  function cgExt(t,base,yf,SH){if(CGEXT[t])return CGEXT[t];const W=base.width,d=base.getContext('2d').getImageData(0,0,W,Math.ceil(yf)).data,l=[],r=[],n=Math.ceil(yf/SH);   // same as p158 chibi-grass ext()
    for(let s=0;s<n;s++){let mn=W,mx=-1;for(let y=s*SH;y<Math.min(yf,s*SH+SH);y++){const o=y*W*4;for(let x=0;x<W;x++)if(d[o+x*4+3]>8){if(x<mn)mn=x;break;}for(let x=W-1;x>=0;x--)if(d[o+x*4+3]>8){if(x>mx)mx=x;break;}}
      l.push(mx<0?W:mn);r.push(mx<0?W:W-1-mx);}return CGEXT[t]={l,r,n};}
  function kind(p){const A=ART[p.t];if(!A)return null;if(A.risway)return null;if(A.cgsway)return 'cg';if(A.sw)return A.sw[4]?'grass':'tree';return null;}
  // per type: lean amount q in art px; the pose for q is offAt(y)=clamp(q·wt(y)) (the engine adds a small ripple; poses leave it out)
  function lean(p,k,A){const t=AMB.t,ph=slH(p.x,p.y)*6.283,rate=.85+.3*slH(p.x+7,p.y+1),w=slWindAt(t*rate,p.x,ph);
    if(k==='cg')return A.cgsway.k*(A.cgsway.yf-A.cgsway.yt)*w;const amp=A.sw[2],s=A.sc*(p.s||1),as=k==='grass'?Math.min(3.4,amp/s):amp*TREE_SWAY/s;return (p.f<0?-1:1)*as*w;}
  function range(t,k,A){const T=ST.types[t]||(ST.types[t]={Q:0,poses:0});if(T.Q)return T.Q;let Q=0;
    if(k==='cg')Q=A.cgsway.k*(A.cgsway.yf-A.cgsway.yt)*WMAX;else{let smin=1e9;for(const q of PROPS)if(q.t===t)smin=Math.min(smin,q.s||1);if(smin===1e9)smin=1;const amp=A.sw[2],s=A.sc*smin;Q=(k==='grass'?Math.min(3.4,amp/s):amp*TREE_SWAY/s)*WMAX;}
    return T.Q=Math.max(1e-3,Q);}
  const POSE=new Map(),BUILT=new Map();let win=0,winN=0;
  function build(t,k,A,S,base,F,i,N,Q){const q=-Q+2*Q*i/(N-1),c=document.createElement('canvas');c.width=Math.ceil(S.w/F);c.height=Math.ceil(S.h/F);c.__p221dyn=true;const e={c,g:c.getContext('2d'),F};
    let yf,SH,offAt;
    if(k==='cg'){const W=A.cgsway;yf=W.yf;SH=W.strip;const X=cgExt(t,base,yf,SH);offAt=(y,h)=>{const u=Math.max(0,Math.min(1,(yf-(y+h/2))/(yf-W.yt))),wt=Math.pow(u,1.6);const j=Math.min(X.n-1,(y/SH)|0);return Math.max(-X.l[j],Math.min(X.r[j],q*wt));};}
    else{const g=k==='grass',yt=A.sw[1];yf=A.sw[0];SH=g?4:5;const ex=g?null:COLSLAB.swayExt(t);
      offAt=(y,h)=>{const u=Math.max(0,Math.min(1,(yf-(y+h/2))/(yf-yt))),wt=g?Math.pow(u,1.7):Math.pow(u*u*(3-2*u),1.5);let off=q*wt;if(ex){const j=Math.min(ex.n-1,(y/SH)|0);off=Math.max(-ex.l[j],Math.min(ex.r[j],off));}return off;};}
    P221._s(e,base,S,yf,SH,offAt);ST.built++;ST.px+=c.width*c.height;ST.types[t].poses++;return c;}
  let zone=null;
  function zoneCheck(){const z=(typeof G!=='undefined')?G.zone:null;if(z===zone)return;zone=z;   // new zone: free every pose (built again as trees come on screen; the lean range follows this zone's trees)
    for(const arr of POSE.values())for(const c of arr)if(c){c.width=c.height=0;}POSE.clear();ST.px=0;for(const t in ST.types){ST.types[t].Q=0;ST.types[t].poses=0;}}
  function pose(p,k,A,base){zoneCheck();const S=SA[A.art];if(!S)return null;const F=P221.lvl(p,S),N=PF.N,Q=range(p.t,k,A),q=lean(p,k,A);
    const i=Math.max(0,Math.min(N-1,Math.round((q+Q)/(2*Q)*(N-1)))),key=p.t+'|'+F+'|'+N,arr=POSE.get(key)||(POSE.set(key,[]),POSE.get(key));
    if(arr[i])return arr[i];
    const now=performance.now();if(now-win>12){win=now;winN=0;}
    if(winN>=6){for(let d=1;d<N;d++){if(arr[i-d])return ST.late++,arr[i-d];if(arr[i+d])return ST.late++,arr[i+d];}}   // over this frame's build budget: nearest ready pose
    winN++;return arr[i]=build(p.t,k,A,S,base,F,i,N,Q);}
  const prev=propSprite;
  propSprite=function(t,v){const p=AMB.cur;
    if(p&&p.t===t&&(PF.A||PF.F)){const k=kind(p);
      if(k){const A=ART[t];
        if(PF.F&&k==='tree'&&typeof G!=='undefined'&&G.gfx==='low'){AMB.cur=null;try{ST.still++;return prev.apply(this,arguments);}finally{AMB.cur=p;}}   // F: still tree = its normal sprite
        if(PF.A){AMB.cur=null;let base;try{base=prev.apply(this,arguments);}finally{AMB.cur=p;}   // the static sprite (slSprite) = pose source
          if(base&&base.getContext){let c=null;try{c=pose(p,k,A,base);}catch(er){ST.err=String(er&&er.message||er);PF.A=false;}if(c){ST.picks++;return c;}}}}}
    return prev.apply(this,arguments);};
})();
/* FPS counter (TEST tray → "ตัวนับ FPS"). Off by default; nothing is stored (no save, no localStorage). While open it times the game's own
   functions (update / render / drawProp / drawEnemy / drawPlayer / effects / HUD) and shows, per second: FPS, the lowest FPS, the slowest
   frame, ms per frame by part, JS memory (when the browser reports it), and the A / B / D switches for an on/off comparison on the device.
   "คัดลอกผล" puts the numbers on the clipboard so they can be pasted back to Claude. */
(function(){const PF=window.__PF1;
  const CAT=[['logic','ตรรกะเกม (update)',['update']],['coll','  ในนั้น: การชน',['collide']],['render','วาดทั้งหมด (render)',['render']],['prop','  ฉาก / prop / ต้นไม้',['drawProp']],
    ['mon','  มอนสเตอร์',['drawEnemy']],['hero','  ตัวเอก',['drawPlayer']],['fx','  เอฟเฟกต์ / อนุภาค',['drawFx','drawParts']],['hud','HUD',['updHUD']]];
  const S={on:false,orig:{},acc:{},bgAcc:0,frames:0,t0:0,lastF:0,iv:[],secs:[],minFps:Infinity,worst:0,last:null,panel:null,tm:null};
  const now=()=>performance.now();
  function wrapAll(){for(const [k,,fns] of CAT)for(const f of fns){if(typeof window[f]!=='function'||S.orig[f])continue;const o=window[f];S.orig[f]=o;
      const w=function(){const t=now();try{return o.apply(this,arguments);}finally{S.acc[k]=(S.acc[k]||0)+now()-t;}};w.__pf1=o;window[f]=w;}
    if(typeof window.render==='function'&&!S.rf){const o=window.render;const w=function(){const t=now();if(S.lastF){const d=t-S.lastF;S.iv.push(d);if(S.iv.length>1200)S.iv.shift();if(d>S.worst)S.worst=d;}S.lastF=t;S.frames++;return o.apply(this,arguments);};w.__pf1=o;S.rf=o;window.render=w;}}
  function unwrapAll(){if(S.rf&&window.render.__pf1===S.rf)window.render=S.rf;S.rf=null;for(const f in S.orig){if(window[f]&&window[f].__pf1===S.orig[f])window[f]=S.orig[f];}S.orig={};}
  PF.bgTime=ms=>{if(S.on)S.bgAcc+=ms;};
  const css=`#pf1Fps{position:fixed;left:50%;transform:translateX(-50%);top:calc(6px + env(safe-area-inset-top,0px));z-index:99999;background:rgba(14,13,12,.88);color:#e9dfc8;
    font:12px/1.35 system-ui,-apple-system,"Segoe UI",sans-serif;border:1px solid #8a7444;border-radius:8px;padding:6px 8px;min-width:250px;max-width:min(330px,94vw);pointer-events:auto;user-select:text}
    #pf1Fps *{font-size:12px!important;line-height:1.3!important;letter-spacing:0!important}#pf1Fps .big{font-size:17px!important;font-weight:700;color:#f3d48a}#pf1Fps table{border-collapse:collapse;width:100%}#pf1Fps td{padding:0 2px;white-space:pre}#pf1Fps td.n{text-align:right;font-variant-numeric:tabular-nums}
    #pf1Fps .bt{display:flex;flex-wrap:wrap;gap:4px;margin-top:5px}#pf1Fps button{font:12px system-ui,sans-serif;background:#2b2722;color:#f0e2bf;border:1px solid #8a7444;border-radius:5px;padding:3px 7px}
    #pf1Fps button.on{background:#5a4a24}#pf1Fps .dim{color:#a99b80;font-size:11px}#pf1Fps textarea{width:100%;height:90px;font:11px monospace}`;
  function info(){const mem=performance.memory?{used:performance.memory.usedJSHeapSize/1048576,lim:performance.memory.jsHeapSizeLimit/1048576}:null,st=PF.stats||{};
    const cache=((st.A&&st.A.px)||0)+((st.B&&st.B.px)||0)+((st.D&&st.D.px)||0);
    return {mem,cacheMB:cache*4/1048576,zone:(typeof G!=='undefined'&&G.zone)||'-',gfx:(typeof G!=='undefined'&&G.gfx)||'-',cv:(typeof cv!=='undefined'&&cv)?cv.width+'×'+cv.height:'-',dpr:typeof DPR!=='undefined'?DPR:devicePixelRatio,
      scr:screen.width+'×'+screen.height+' @'+devicePixelRatio,ua:navigator.userAgent,auto:!!navigator.webdriver};}
  function tick(){const t=now(),el=(t-S.t0)/1000;if(el<=0)return;const fps=S.frames/el;if(S.frames>3&&fps<S.minFps)S.minFps=fps;
    const per={};for(const [k] of CAT)per[k]=(S.acc[k]||0)/Math.max(1,S.frames);per.bg=S.bgAcc/Math.max(1,S.frames);
    const iv=S.iv.slice().sort((a,b)=>b-a),low1=iv.length>20?1000/iv[Math.floor(iv.length*.01)]:null,frameMs=1000/Math.max(.01,fps);
    per.wait=Math.max(0,frameMs-(per.logic||0)-(per.render||0)-(per.hud||0));
    S.last={fps,low1,minFps:S.minFps,worst:S.worst,per,frameMs};S.secs.push(+fps.toFixed(1));if(S.secs.length>60)S.secs.shift();
    S.acc={};S.bgAcc=0;S.frames=0;S.t0=t;draw();}
  const f1=v=>v==null||!isFinite(v)?'-':v.toFixed(1);
  function draw(){const p=S.panel;if(!p||!S.last)return;const L=S.last,I=info();
    let h=`<div><span class="big">${f1(L.fps)} FPS</span> <span class="dim">ต่ำสุด ${f1(L.minFps)} · 1% ต่ำ ${f1(L.low1)} · เฟรมช้าสุด ${f1(L.worst)} ms</span></div><table>`;
    for(const [k,n] of CAT)h+=`<tr><td>${n}</td><td class="n">${f1(L.per[k])} ms</td></tr>`;
    h+=`<tr><td>  พื้นหลัง (ในวาดทั้งหมด)</td><td class="n">${f1(L.per.bg)} ms</td></tr><tr><td>รอเบราว์เซอร์ / การ์ดจอ</td><td class="n">${f1(L.per.wait)} ms</td></tr><tr><td>รวมต่อเฟรม</td><td class="n">${f1(L.frameMs)} ms</td></tr></table>`;
    h+=`<div class="dim">หน่วยความจำ JS: ${I.mem?f1(I.mem.used)+' / '+f1(I.mem.lim)+' MB':'เบราว์เซอร์นี้ไม่ให้ข้อมูล'} · แคชภาพชุดนี้ ${f1(I.cacheMB)} MB<br>แมพ ${I.zone} · กราฟิก ${I.gfx} · วาด ${I.cv}${I.auto?' · <b>เบราว์เซอร์อัตโนมัติ ไม่ใช่เครื่องจริง</b>':''}</div>`;
    const sw=[['A','ต้นไม้ไหวแบบท่าสำเร็จ (A)'],['B','ภาพมอนย่อไว้ (B)'],['D','พื้นหลังแบ่งแผ่น (D)']];
    h+=`<div class="bt">${sw.map(([k,n])=>`<button data-k="${k}" class="${PF[k]?'on':''}">${n}: ${PF[k]?'เปิด':'ปิด'}</button>`).join('')}</div>`;
    h+=`<div class="bt"><button data-a="copy">คัดลอกผล</button><button data-a="reset">เริ่มนับใหม่</button><button data-a="close">ปิด</button></div><div data-r="msg" class="dim"></div>`;
    p.innerHTML=h;}
  function report(){const L=S.last||{per:{}},I=info();const r=[`Lanternfall ตัวนับ FPS (${PF.ver}) ${new Date().toISOString()}`,I.auto?'เบราว์เซอร์อัตโนมัติ ไม่ใช่เครื่องจริง':'เครื่องจริง',
      `เครื่อง: ${I.ua}`,`จอ ${I.scr} · วาด ${I.cv} (DPR ${I.dpr}) · กราฟิก ${I.gfx} · แมพ ${I.zone}`,`สวิตช์ A=${PF.A?1:0} B=${PF.B?1:0} D=${PF.D?1:0} F=${PF.F?1:0}`,
      `FPS ${f1(L.fps)} · ต่ำสุด ${f1(L.minFps)} · 1% ต่ำ ${f1(L.low1)} · เฟรมช้าสุด ${f1(L.worst)} ms`,`FPS ย้อนหลังทีละวินาที: ${S.secs.join(' ')}`];
    for(const [k,n] of CAT)r.push(`${n.trim()}: ${f1(L.per[k])} ms`);r.push(`พื้นหลัง: ${f1(L.per.bg)} ms`,`รอเบราว์เซอร์/การ์ดจอ: ${f1(L.per.wait)} ms`,`รวมต่อเฟรม: ${f1(L.frameMs)} ms`);
    r.push(`หน่วยความจำ JS: ${I.mem?f1(I.mem.used)+' / '+f1(I.mem.lim)+' MB':'ไม่มีข้อมูล'} · แคชภาพชุดนี้ ${f1(I.cacheMB)} MB`);return r.join('\n');}
  function copy(){const txt=report(),m=S.panel&&S.panel.querySelector('[data-r="msg"]');
    const fall=()=>{if(!m)return;m.innerHTML='คัดลอกอัตโนมัติไม่ได้ กดค้างในกล่องนี้แล้วเลือกคัดลอก:<textarea readonly></textarea>';const ta=m.querySelector('textarea');ta.value=txt;ta.focus();ta.select();};
    let done=false;const ok=()=>{if(done)return;done=true;if(m)m.textContent='คัดลอกแล้ว วางในแชทได้เลย';},no=()=>{if(done)return;done=true;fall();};
    try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(ok,no);setTimeout(no,1500);}else no();}catch(e){no();}}
  function reset(){S.minFps=Infinity;S.worst=0;S.iv=[];S.secs=[];S.acc={};S.bgAcc=0;S.frames=0;S.t0=now();}
  function open(){if(S.on)return;S.on=true;if(!document.getElementById('pf1FpsCss')){const st=document.createElement('style');st.id='pf1FpsCss';st.textContent=css;document.head.appendChild(st);}
    const p=document.createElement('div');p.id='pf1Fps';document.body.appendChild(p);S.panel=p;p.innerHTML='<span class="dim">กำลังวัด…</span>';
    p.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;e.stopPropagation();if(b.dataset.k){PF[b.dataset.k]=!PF[b.dataset.k];reset();draw();}else if(b.dataset.a==='copy')copy();else if(b.dataset.a==='reset'){reset();}else if(b.dataset.a==='close')close();});
    p.addEventListener('pointerdown',e=>e.stopPropagation());wrapAll();reset();S.tm=setInterval(tick,1000);lab();}
  function close(){if(!S.on)return;S.on=false;clearInterval(S.tm);unwrapAll();if(S.panel)S.panel.remove();S.panel=null;S.last=null;lab();}
  let btn=null;const lab=()=>{if(btn)btn.textContent='ตัวนับ FPS: '+(S.on?'เปิด':'ปิด');};
  setInterval(()=>{try{const row=document.getElementById('hudTrayRow');if(row&&!document.getElementById('pf1FpsTog')){btn=document.createElement('button');btn.type='button';btn.className='tbtn';btn.id='pf1FpsTog';row.appendChild(btn);lab();btn.addEventListener('click',()=>{S.on?close():open();});}}catch(e){}},700);
  PF.fps={open,close,report,state:()=>S.last};
})();
