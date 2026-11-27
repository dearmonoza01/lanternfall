
/* r166: window light = the r164d pane-shaped light (rounded top for tall panes; fill .62/.52, faint halo) BLURRED, sigma = 27% of the pane's smaller side, so the edge feathers out and a few px of misalignment is not visible; replaces the r165 radial (windows only; lamps/crystals/fire unchanged). */
/* ---- r164 nightfix (TEST ONLY): night lights completed. Per-TYPE light points (window pane rectangles, lamp bulbs, crystals, fires) in prop-local px (anchor = the prop's x,y; scaled by p.s, mirrored when p.f<0) from window.__NIGHTFIX_R1; every placement gets its lights from its type. Pane rectangles were checked one by one with debug outlines over the day pictures. Own canvas layer above the night tint (same blend as NLIGHT). Replaces the r143 automatic lamp / house-window lights (NLIGHT.cfg.lampRe / houseRe cleared, old house-lantern light off); the old module still draws campfires. Lamps lit dusk to dawn (NLIGHT.lampLevel), windows until windowsOffHour 02:00 (NLIGHT.windowLevel), shop display windows dimmer (x0.72), crystals outdoors only at night / always inside caves, forge fire and lanterns all night. COST: every light kind is pre-rendered once to a small sprite canvas and blitted (no per-frame gradients). r165: window glow = ONE soft radial glow (same sprite/blend as a street lamp, x0.85, brighter core so the glass reads lit) centred on the window centre, radius 1.3 x the window's larger half-size, no pane-shaped fill. Light data = plain points (NIGHTFIX.points(): x,y,r,kind,col,strength). ?nightfix=off = r162 behaviour, ?nightlights=off = everything off. Debug: window.NIGHTFIX ---- */
(function(){'use strict';const Q=String(location.search),NL=window.NLIGHT,D=window.__NIGHTFIX_R1;const NF=window.NIGHTFIX={ver:'nightfix-r166',on:!/[?&]nightfix=off\b/.test(Q),err:null,stats:{ms:0,frames:0,total:0,drawn:0,win:0,lamp:0,cry:0}};
if(!NF.on||!NL||!NL.on||!D||!window.GTIME)return;
try{
const GT=window.GTIME,C=NL.cfg,OLD_LAMP=C.lampRe;C.lampRe=/^$/;C.houseRe=/^$/;C.houseLanternR=1;
let lights=[],zone='',lastN=-1,lastT=0;
function add(p,k,lx,ly,o){const s=p.s||1,fl=p.f<0?-1:1;lights.push(Object.assign({k,x:p.x,y:p.y,lx:lx*s*fl,ly:ly*s,s,ph:(p.x*.013+p.y*.007)},o))}
function collect(){const L=[];lights=L;try{for(const p of PROPS){const t=p.t;if(!t||t.indexOf('house')===0)continue;
  if(OLD_LAMP.test(t)){const d=PROP_DEFS[t]||{};const o=D.lamp[t];if(o)add(p,'lamp',o[0],o[1],{r:o[2]});else L.push({k:'lamp',x:p.x,y:p.y-(d.ay||150)*C.lampHeadK,s:1,r:C.lampR+((p.x*7+p.y*3)%C.lampRand),ph:(p.x*.013+p.y*.007)});continue}
  let o=D.lamp[t];if(o){add(p,'lamp',o[0],o[1],{r:o[2]});continue}
  o=D.fire[t];if(o){add(p,'fire',o[0],o[1],{r:o[2]});continue}
  const mu=D.multi[t];if(mu){for(const a of mu)add(p,'lamp',a[0],a[1],{r:a[2]});continue}
  const cr=D.cry[t];if(cr){add(p,'cry',cr[0],cr[1],{r:cr[2],col:cr[3]});continue}
  let w=D.win[t];if(w){const al=D.winA[t]||1;for(const a of w)add(p,'win',a[0],a[1],{w:a[2],h:a[3],a:al});continue}
  w=D.shop[t];if(w){for(const a of w)add(p,'win',a[0],a[1],{w:a[2],h:a[3],a:.72})}}}catch(e){NF.err='collect '+e.message}
 try{const S=window.HOUSE&&HOUSE.state&&HOUSE.state();if(S&&S.lantern&&S.lantern.zone===G.zone&&G.zone!==HOUSE.ZID)L.push({k:'fire',x:S.lantern.x+21.5,y:S.lantern.y-62.5,s:1,r:150,ph:2.1})}catch(_){}
 zone=G.zone;lastN=PROPS.length;NF.stats.total=L.length;NF.stats.win=L.filter(a=>a.k==='win').length;NF.stats.lamp=L.filter(a=>a.k==='lamp'||a.k==='fire').length;NF.stats.cry=L.filter(a=>a.k==='cry').length}
const cv=document.createElement('canvas');cv.id='nfLayer';cv.style.cssText='position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:2;mix-blend-mode:screen;display:none';document.body.appendChild(cv);const g=cv.getContext('2d');let CW=0,CH=0,shown=false;
const fit=()=>{const w=innerWidth,h=innerHeight;if(w!==CW||h!==CH){CW=cv.width=w;CH=cv.height=h}};addEventListener('resize',fit);fit();
const kk=()=>{try{const a=w2s(0,0),b=w2s(100,0);return (b[0]-a[0])/100||1}catch(_){return 1}};
/* NOTE: the game's world->screen mapping squashes y (3/4 view, x0.866), but sprite pixels are drawn at uniform zoom camZ(); pane/lamp offsets are SPRITE pixels, so screen = w2s(prop anchor) + offset*camZ() (not w2s(anchor+offset)). */
/* ---- pre-rendered sprites (built once per kind / size, then blitted) ---- */
const SPR={};
function radial(col,kind){const key='r'+col+kind;if(SPR[key])return SPR[key];const c=document.createElement('canvas');c.width=c.height=128;const s=c.getContext('2d'),gr=s.createRadialGradient(64,64,1,64,64,64);const a0=kind==='cry'?.55:.85,a1=kind==='cry'?.2:kind==='win'?.34:.3;if(kind==='win'){gr.addColorStop(0,'rgba(255,214,130,1)');gr.addColorStop(.3,'rgba(255,200,110,.72)');gr.addColorStop(.6,'rgba(255,190,100,.26)')}else{gr.addColorStop(0,'rgba('+col+','+a0+')');gr.addColorStop(.35,'rgba('+col+','+a1+')')}gr.addColorStop(1,'rgba('+col+',0)');s.fillStyle=gr;s.fillRect(0,0,128,128);return SPR[key]=c}
const FEA=0.27;/* r166: blur sigma = 27% of the pane's smaller side */
function pane(w,h){const W=Math.max(4,Math.round(w)),H=Math.max(4,Math.round(h)),key='p'+W+'x'+H;if(SPR[key])return SPR[key];const sg=Math.max(1.5,Math.min(W,H)*FEA),pad=Math.round(Math.max(W,H)*.9+sg*3),c=document.createElement('canvas');c.width=W+pad*2;c.height=H+pad*2;const s=c.getContext('2d');
 const t=document.createElement('canvas');t.width=c.width;t.height=c.height;const u=t.getContext('2d');
 const R=Math.max(W,H)*1.25,gr=u.createRadialGradient(t.width/2,t.height/2,1,t.width/2,t.height/2,R);gr.addColorStop(0,'rgba(255,200,110,.30)');gr.addColorStop(1,'rgba(255,170,70,0)');u.fillStyle=gr;u.fillRect(0,0,t.width,t.height);
 const r=Math.min(W/2,(H>W*1.25?W*.5:Math.min(W,H)*.2)),x0=pad,y0=pad;u.save();u.beginPath();u.moveTo(x0,y0+H);u.lineTo(x0,y0+r);u.arcTo(x0,y0,x0+r,y0,r);u.lineTo(x0+W-r,y0);u.arcTo(x0+W,y0,x0+W,y0+r,r);u.lineTo(x0+W,y0+H);u.closePath();u.clip();const fg=u.createLinearGradient(0,y0,0,y0+H);fg.addColorStop(0,'rgba(255,226,150,.62)');fg.addColorStop(1,'rgba(255,196,108,.52)');u.fillStyle=fg;u.fillRect(x0,y0,W,H);u.restore();
 try{s.filter='blur('+sg+'px)'}catch(_){}s.globalCompositeOperation='lighter';s.drawImage(t,0,0);s.drawImage(t,0,0);s.filter='none';/* x2 so the blurred core keeps the r164d strength */
 c._pad=pad;c._W=W;c._H=H;return SPR[key]=c}
function draw(){const t0=performance.now();try{const play=G.state==='play';if(!play||G.zone===HOUSE.ZID){if(shown){g.clearRect(0,0,CW,CH);cv.style.display='none';shown=false}return}
 const tint=GT.tintOn?GT.tintOn():true,h=GT.hour(),ll=NL.lampLevel(h),wl=NL.windowLevel(h);const cave=!tint;
 if(!cave&&ll<.004&&wl<.004){if(shown){g.clearRect(0,0,CW,CH);cv.style.display='none';shown=false}return}
 const now=performance.now();if(G.zone!==zone||PROPS.length!==lastN||now-lastT>3000){lastT=now;collect()}
 let any=false;for(const L of lights){if(!cave||L.k==='cry'){any=true;break}}if(!any){if(shown){g.clearRect(0,0,CW,CH);cv.style.display='none';shown=false}return}
 if(!shown){cv.style.display='block';shown=true}fit();g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,CW,CH);g.globalCompositeOperation='lighter';const k=(typeof camZ==='function'?camZ():kk()),tm=now/1000;let n=0;
 for(const L of lights){let lv=L.k==='win'?wl:L.k==='fire'&&L.r===90?1:ll;if(L.k==='cry'&&cave)lv=1;if(cave&&L.k!=='cry')continue;if(lv<.004)continue;const p=w2s(L.x,L.y),sx=p[0]+(L.lx||0)*k,sy=p[1]+(L.ly||0)*k;const fl=.9+.1*Math.sin(tm*1.7+L.ph)+.04*Math.sin(tm*5.3+L.ph*2);
  if(L.k==='win'){const w=L.w*L.s*k,hh=L.h*L.s*k;if(sx<-w-80||sy<-hh-80||sx>CW+w+80||sy>CH+hh+80)continue;const sp=pane(w,hh);g.globalAlpha=Math.min(1,lv*(L.a||1)*(.94+.06*fl));g.drawImage(sp,sx-sp._W/2-sp._pad,sy-sp._H/2-sp._pad);n++}
  else{const r=(L.r||110)*L.s*k*fl;if(sx<-r||sy<-r||sx>CW+r||sy>CH+r)continue;const sp=radial(L.k==='cry'?L.col:'255,198,112',L.k==='cry'?'cry':'lamp');g.globalAlpha=Math.min(1,lv);g.drawImage(sp,sx-r,sy-r,r*2,r*2);n++}}
 g.globalAlpha=1;NF.stats.drawn=n}catch(e){NF.err='draw '+e.message}NF.stats.ms=NF.stats.ms*.95+(performance.now()-t0)*.05;NF.stats.frames++}
NF.draw=draw;NF.points=()=>lights.map(L=>({x:L.x,y:L.y,lx:L.lx,ly:L.ly,r:L.k==='win'?Math.max(L.w,L.h)/2*L.s:(L.r||110)*L.s,w:L.w,h:L.h,kind:L.k==='cry'?'crystal':L.k==='win'?'window':L.k,colour:L.k==='cry'?L.col:'255,198,112',strength:L.k==='win'?(L.a||1):1}));NF.lights=()=>lights;NF.refresh=()=>{lastN=-1;lastT=0};
const od=NL.draw;NL.draw=function(){const r=od.apply(this,arguments);draw();return r};
}catch(e){NF.err=e.message}})();
