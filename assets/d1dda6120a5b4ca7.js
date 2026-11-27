
/* ---- r143 nightlights (TEST ONLY, DeaRz 17 Nov 2026 09:51 UTC via coordinator): lamps and house windows light up at night.
   Module on top of GTIME (game clock). Street lamps get a warm additive glow (90-140 px, slow flicker) from dusk (17:12 -> full 19:00), lit all night, fading out through dawn (05:00 -> 07:00).
   House windows: lit from dusk, ON until GTIME.cfg.windowsOffHour (default 02:00 game time), then OFF (fade ~2 game minutes), dark until the next dusk. Campfires and the house-lantern prop glow stronger at night.
   The lights are drawn on their own canvas ABOVE the night tint (the tint is the DOM layer #gtTint) with CSS mix-blend-mode:screen, aligned to the game camera with w2s(); nothing in caves / indoor zones (GTIME.tintOn()); lights outside the screen are culled; frame cost is measured (NLIGHT.stats.ms).
   Where the lights come from: (1) auto from the zone's props (lamp types / house types, cfg.lampRe / cfg.houseRe with per-house window layouts), (2) per-map lists  window.NLIGHT.maps[zone] = {lamps:[[x,y,r?]], windows:[[x,y,w,h]], fires:[[x,y,r?]]} (world px) - mark them in the game with the GM tool (button "💡 NL" bottom-left, ?gm=on): pick a kind, click the map, then "ส่งออก".
   ?nightlights=off = nothing. Debug: window.NLIGHT ---- */
(function(){'use strict';
const Q=String(location.search),NL=window.NLIGHT={ver:'nightlights-r1',on:!/[?&]nightlights=off\b/.test(Q),err:null,stats:{ms:0,frames:0,drawn:0,lamps:0,windows:0,fires:0},maps:{}};
if(!NL.on||!window.GTIME)return;
const GT=window.GTIME;if(GT.cfg&&GT.cfg.windowsOffHour==null)GT.cfg.windowsOffHour=2;
const C=NL.cfg={lampRe:/^(m3k_lamp|m3LampPostChibi01|svLamp|svLampPost|svLampPostL|svChLampM1|svChGdnLampM1|streetlight|crystalLamp|m4L_lantern-post-stone-b|m4L_lantern-post-wood|m7S_lamp_1000|m7S_pier_lamp_1000|m8S_lantern_1000|m12_lamp_double|m12_lamp_post)$/,
 lampR:130,lampRand:20,lampCol:'255,198,112',lampAlpha:.9,lampHeadK:.8,
 houseRe:/^(w22ds(1[0-9]|2[0-8]|[1-3]))$/,
 winCol:'255,206,124',winAlpha:.5,winW:30,winH:36,winGlow:2.8,winDyK:.068,
 fireBoost:1.7,fireR:170,houseLanternR:150,
 lampOn:[17.2,19.0],lampOff:[5.0,7.0],winOn:[17.2,19.0],winFadeMin:2,
 maxLights:120};
const sm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
NL.lampLevel=h=>h>=C.lampOn[0]?sm(C.lampOn[0],C.lampOn[1],h):h<C.lampOff[0]?1:h<C.lampOff[1]?1-sm(C.lampOff[0],C.lampOff[1],h):0;
NL.windowLevel=h=>{const off=GT.cfg.windowsOffHour,fh=C.winFadeMin/60;if(h>=C.winOn[0])return sm(C.winOn[0],C.winOn[1],h);if(h<off)return Math.max(0,Math.min(1,(off-h)/fh));return 0};
/* ---------- window layouts for the auto houses (offsets from the prop's anchor = the door base; measured on Astoria) ---------- */
function windowsFor(def){const w=def.w||300,hh0=def.h||310,dy=-C.winDyK*hh0,L=[],ww=C.winW,wh=C.winH;
  if(w<330){const o=.27*w;L.push([-o,dy],[o,dy])}else if(w<420){const o=.28*w;L.push([-o,dy],[o,dy])}else{L.push([-.33*w,dy],[-.18*w,dy],[.18*w,dy],[.33*w,dy])}
  return L.map(a=>[a[0],a[1],ww,wh])}
/* ---------- light list per zone ---------- */
let zone='',lights=[],lastN=-1,lastT=0;
function collect(){const z=G.zone,man=NL.maps[z]||null,L=[];
  try{for(const p of PROPS){const t=p.t;if(!t)continue;if(C.lampRe.test(t)){const d=PROP_DEFS[t]||{};L.push({k:'lamp',x:p.x,y:p.y-(d.ay||150)*C.lampHeadK,r:C.lampR+((p.x*7+p.y*3)%C.lampRand),ph:(p.x*.013+p.y*.007)})}
    else if(C.houseRe.test(t)){const d=PROP_DEFS[t]||{};for(const a of windowsFor(d))L.push({k:'win',x:p.x+a[0],y:p.y+a[1],w:a[2],h:a[3],ph:(p.x*.017+a[0])})}}}catch(e){NL.err='collect '+e.message}
  if(man){for(const a of man.lamps||[])L.push({k:'lamp',x:a[0],y:a[1],r:a[2]||C.lampR,ph:a[0]*.013+a[1]*.007});for(const a of man.windows||[])L.push({k:'win',x:a[0],y:a[1],w:a[2]||C.winW,h:a[3]||C.winH,ph:a[0]*.017});for(const a of man.fires||[])L.push({k:'fire',x:a[0],y:a[1],r:a[2]||C.fireR,ph:a[0]*.01})}
  try{const F=window.COOK&&COOK.fire;if(F&&F.lit&&F.zone===z)L.push({k:'fire',x:F.x,y:F.y-20,r:C.fireR,ph:1.3})}catch(_){}
  try{const S=window.HOUSE&&HOUSE.state&&HOUSE.state();if(S&&S.lantern&&S.lantern.zone===z&&z!==HOUSE.ZID)L.push({k:'hl',x:S.lantern.x+22,y:S.lantern.y-52,r:C.houseLanternR,ph:2.1})}catch(_){}
  zone=z;lights=L.slice(0,C.maxLights);lastN=PROPS.length;NL.stats.lamps=lights.filter(a=>a.k==='lamp').length;NL.stats.windows=lights.filter(a=>a.k==='win').length;NL.stats.fires=lights.filter(a=>a.k==='fire'||a.k==='hl').length}
NL.refresh=()=>{lastN=-1;lastT=0};
/* ---------- canvas above the night tint ---------- */
const cv=document.createElement('canvas');cv.id='nlLayer';cv.style.cssText='position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:2;mix-blend-mode:screen;display:none';document.body.appendChild(cv);
const g=cv.getContext('2d');let CW=0,CH=0,shown=false;
function fit(){const w=innerWidth,h=innerHeight;if(w!==CW||h!==CH){CW=cv.width=w;CH=cv.height=h}}
addEventListener('resize',fit);fit();
const spr=document.createElement('canvas');spr.width=spr.height=128;{const s=spr.getContext('2d'),gr=s.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.18,'rgba(255,255,255,.62)');gr.addColorStop(.5,'rgba(255,255,255,.18)');gr.addColorStop(1,'rgba(255,255,255,0)');s.fillStyle=gr;s.fillRect(0,0,128,128)}
const tinted={};function sprC(col){let c=tinted[col];if(c)return c;c=document.createElement('canvas');c.width=c.height=128;const s=c.getContext('2d');s.drawImage(spr,0,0);s.globalCompositeOperation='source-in';s.fillStyle='rgb('+col+')';s.fillRect(0,0,128,128);return tinted[col]=c}
function scaleK(){try{const a=w2s(0,0),b=w2s(100,0);return (b[0]-a[0])/100||1}catch(_){return 1}}
NL.draw=function(){const t0=performance.now();try{
  const play=G.state==='play',on=play&&(GT.tintOn?GT.tintOn():true);
  if(!on){if(shown){g.clearRect(0,0,CW,CH);cv.style.display='none';shown=false}return}
  const h=GT.hour(),ll=NL.lampLevel(h),wl=NL.windowLevel(h);
  if(ll<.004&&wl<.004){if(shown){g.clearRect(0,0,CW,CH);cv.style.display='none';shown=false}return}
  if(!shown){cv.style.display='block';shown=true}
  fit();const now=performance.now();if(G.zone!==zone||PROPS.length!==lastN||now-lastT>3000){lastT=now;collect()}
  g.clearRect(0,0,CW,CH);g.globalCompositeOperation='lighter';const k=scaleK(),tm=now/1000;let n=0;
  for(const L of lights){let lv=L.k==='win'?wl:ll;if(lv<.004)continue;const p=w2s(L.x,L.y);const sx=p[0],sy=p[1];
    if(L.k==='lamp'){const r=L.r*k;if(sx<-r||sy<-r||sx>CW+r||sy>CH+r)continue;const fl=.9+.07*Math.sin(tm*1.6+L.ph)+.04*Math.sin(tm*3.7+L.ph*2.3);g.globalAlpha=Math.min(1,C.lampAlpha*lv*fl);g.drawImage(sprC(C.lampCol),sx-r,sy-r,r*2,r*2);g.globalAlpha=Math.min(1,.5*lv*fl);const r2=r*.28;g.drawImage(sprC('255,236,170'),sx-r2,sy-r2,r2*2,r2*2);n++}
    else if(L.k==='win'){const w=L.w*k,hh=L.h*k;if(sx<-w*3||sy<-hh*3||sx>CW+w*3||sy>CH+hh*3)continue;const fl=.96+.04*Math.sin(tm*.9+L.ph);g.globalAlpha=Math.min(1,C.winAlpha*lv*fl);g.fillStyle='rgb('+C.winCol+')';g.fillRect(sx-w*.45,sy-hh*.45,w*.9,hh*.9);g.globalAlpha=Math.min(1,.4*lv);const gw=w*C.winGlow,gh=hh*C.winGlow;g.drawImage(sprC(C.winCol),sx-gw/2,sy-gh/2,gw,gh);n++}
    else{const nl=Math.max(ll,0),r=L.r*k*(1+.5*nl*(C.fireBoost-1)*2),fl=.88+.1*Math.sin(tm*9+L.ph)+.05*Math.sin(tm*17+L.ph*3);if(sx<-r||sy<-r||sx>CW+r||sy>CH+r)continue;g.globalAlpha=Math.min(1,(.25+.5*nl*C.fireBoost/1.7)*fl);g.drawImage(sprC('255,170,80'),sx-r,sy-r,r*2,r*2);n++}}
  g.globalAlpha=1;g.globalCompositeOperation='source-over';NL.stats.drawn=n;
 }catch(e){NL.err='draw '+e.message}
 const dt=performance.now()-t0;NL.stats.ms=NL.stats.ms*.95+dt*.05;NL.stats.frames++};
try{const _r=render;render=function(){const r=_r.apply(this,arguments);NL.draw();return r}}catch(e){NL.err='hook render '+e.message}
/* ---------- GM marking tool ---------- */
let mode=null;
function fmt(){const o={};for(const z in NL.maps)o[z]=NL.maps[z];return JSON.stringify(o)}
NL.export=fmt;
NL.add=(kind,x,y,w,h)=>{const z=G.zone,m=NL.maps[z]=NL.maps[z]||{lamps:[],windows:[],fires:[]};if(kind==='lamp')m.lamps.push([Math.round(x),Math.round(y)]);else if(kind==='win')m.windows.push([Math.round(x),Math.round(y),w||C.winW,h||C.winH]);else m.fires.push([Math.round(x),Math.round(y)]);NL.refresh()};
try{if(!window.__REAL||new URLSearchParams(location.search).get('gm')==='on'){const p=document.createElement('div');p.id='nlGm';p.style.cssText='position:fixed;left:8px;bottom:60px;z-index:20;display:flex;gap:3px;flex-wrap:wrap;max-width:230px;padding:3px;border-radius:8px;background:rgba(40,36,8,.9);border:1px solid #ffd060;font:700 10px system-ui';
  const mkb=(t,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.style.cssText='width:auto;min-width:0;min-height:0;height:20px;margin:0;padding:0 6px;border-radius:6px;border:1px solid #ffd060;background:#3a3410;color:#fff0a0;font:700 10px/18px system-ui;cursor:pointer';b.addEventListener('click',e=>{e.stopPropagation();try{fn(b)}catch(er){NL.err='gm '+er.message}});for(const ev of ['pointerdown','mousedown','touchstart'])b.addEventListener(ev,e=>e.stopPropagation());p.appendChild(b);return b};
  const setMode=(m,b)=>{mode=mode===m?null:m;for(const x of p.querySelectorAll('button[data-m]'))x.style.background=x.dataset.m===mode?'#8a7410':'#3a3410'};
  for(const [m,t] of [['lamp','💡 โคม'],['win','🪟 หน้าต่าง'],['fire','🔥 กองไฟ']]){const b=mkb(t,()=>setMode(m));b.dataset.m=m}
  mkb('ส่งออก',()=>{const t=document.createElement('textarea');t.value=fmt();t.style.cssText='position:fixed;left:10%;top:20%;width:80%;height:40%;z-index:99999';document.body.appendChild(t);t.select();setTimeout(()=>t.remove(),20000)});mkb('ล้างแมพนี้',()=>{delete NL.maps[G.zone];NL.refresh()});
  document.body.appendChild(p);document.addEventListener('pointerdown',e=>{if(!mode||G.state!=='play')return;if(e.target.closest&&e.target.closest('#nlGm,#hBox,#hAct,#swin'))return;const [x,y]=s2w(e.clientX,e.clientY);NL.add(mode,x,y);e.stopImmediatePropagation();e.preventDefault()},true)}}catch(e){NL.err='gm '+e.message}
})();

