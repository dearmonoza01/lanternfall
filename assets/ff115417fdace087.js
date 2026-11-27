
/* ---- r140 gtime (TEST ONLY, DeaRz 17 Nov 07:48 "ใส่ระบบเวลาเข้าไปด้วยเลยในเกม จะได้เห็นเหมือนกัน"): a shared day / night clock.
   The game had NO clock (only the player brightness option G.bright + per-zone lights), so this is new.
   Game time = the real UTC clock, not the save: 1 game day = cfg.dayLenMin (48) real minutes, 1 game hour = 2 real minutes, so every player on every device sees the same game time with no server.
   Phases by game hour (four distinct looks): dawn 05-07 (cool pink / pale), day 07-17, dusk 17-19 (warm orange), night 19-05 (dark blue, never darker than cfg.maxNight 0.35).
   API: GTIME.now() -> {hour, minute, hhmm, phase, t01}; GTIME.hourAt(ms); GTIME.phaseBlend() -> {from, to, k, tint:[r,g,b,a]}; GTIME.isNight(); GTIME.phase().
   World look: one cheap full-screen tint layer (#gtTint, a DOM div under the HUD, no per-sprite work), smooth blend; none in caves / tower interiors / prologue / gate rooms (cfg.noTint regex, per zone id). HUD: a small clock chip with a sun / moon icon under the minimap compass.
   No gameplay effect. GM only (?gm=on, or TEST): force a phase, set the hour, speed up x30; forcing is local and off by default. ?gametime=off = nothing. Debug: window.GTIME ---- */
(function(){'use strict';
const Q=String(location.search),GT=window.GTIME={ver:'gtime-r1',on:!/[?&]gametime=off\b/.test(Q),err:null,ov:null,ticks:0};
if(!GT.on)return;
GT.cfg={dayLenMin:48,dawn:[5,7],dusk:[17,19],maxNight:0.48,noTint:/cave|^w24_map9f|^w00_|gate_inst|house|platform|indoor/i,
  /* tint keyframes by game hour: [hour, r, g, b, a] (linear blend, wraps at 24) */
  keys:[[0,18,28,78,0.48],[4.5,18,28,78,0.48],[5.5,60,60,120,0.30],[6.2,255,175,210,0.25],[7.5,255,215,225,0.08],[8.5,255,255,255,0],[16.0,255,255,255,0],[17.0,255,170,70,0.19],[18.0,255,125,40,0.29],[19.2,120,60,110,0.36],[20.5,18,28,78,0.48],[24,18,28,78,0.48]]};
const C=GT.cfg,hourMs=()=>C.dayLenMin*60000/24;
const mod=(a,b)=>((a%b)+b)%b;
GT.hourAt=ms=>mod(ms/hourMs(),24);
GT.hour=()=>{if(GT.ov){return mod(GT.ov.h0+((Date.now()-GT.ov.t0)/hourMs())*GT.ov.speed,24)}return GT.hourAt(Date.now())};
const phaseOf=h=>(h>=C.dawn[0]&&h<C.dawn[1])?'dawn':(h>=C.dawn[1]&&h<C.dusk[0])?'day':(h>=C.dusk[0]&&h<C.dusk[1])?'dusk':'night';
GT.phase=()=>phaseOf(GT.hour());
GT.isNight=()=>GT.phase()==='night';
GT.now=()=>{const h=GT.hour(),hh=Math.floor(h),mm=Math.floor((h-hh)*60);return {hour:hh,minute:mm,hhmm:String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0'),phase:phaseOf(h),t01:h/24}};
function tintAt(h){const K=C.keys;for(let i=0;i<K.length-1;i++){if(h>=K[i][0]&&h<=K[i+1][0]){const u=(h-K[i][0])/((K[i+1][0]-K[i][0])||1);return [0,1,2,3,4].slice(1).map(j=>K[i][j]+(K[i+1][j]-K[i][j])*u)}}return [255,255,255,0]}
GT.tintAt=tintAt;
GT.phaseBlend=()=>{const h=GT.hour(),p=phaseOf(h),t=tintAt(h),B=[['dawn',C.dawn[0],C.dawn[1]],['day',C.dawn[1],C.dusk[0]],['dusk',C.dusk[0],C.dusk[1]]];let k=0,to=p;if(p==='night'){const len=24-C.dusk[1]+C.dawn[0],at=h>=C.dusk[1]?h-C.dusk[1]:h+24-C.dusk[1];k=at/len;to='dawn'}else{const b=B.find(x=>x[0]===p);k=(h-b[1])/(b[2]-b[1]);to=p==='dawn'?'day':p==='day'?'dusk':'night'}return {from:p,to,k:Math.max(0,Math.min(1,k)),tint:t}};
/* ---------- overlay + clock ---------- */
const tint=document.createElement('div');tint.id='gtTint';tint.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:1;background:rgba(0,0,0,0);transition:background-color 1.2s linear';document.body.appendChild(tint);
const clock=document.createElement('div');clock.id='gtClock';clock.style.cssText='position:fixed;left:62px;top:124px;z-index:7;display:none;align-items:center;gap:5px;padding:2px 9px 2px 6px;border-radius:12px;background:rgba(14,12,22,.78);border:1px solid rgba(214,176,92,.7);color:#ffe9b0;font:700 12px/1.3 system-ui,sans-serif;pointer-events:none;white-space:nowrap';document.body.appendChild(clock);
const ICON={dawn:'🌅',day:'☀️',dusk:'🌇',night:'🌙'};
const noTintNow=()=>{try{return C.noTint.test(String(G.zone||''))}catch(_){return false}};
GT.tintOn=()=>!noTintNow();
function paint(){try{const t=GT.phaseBlend().tint;const a=noTintNow()||G.state!=='play'?0:Math.min(C.maxNight,t[3]);const s='rgba('+Math.round(t[0])+','+Math.round(t[1])+','+Math.round(t[2])+','+a.toFixed(3)+')';if(tint.dataset.s!==s){tint.dataset.s=s;if(!GT.lift)tint.style.backgroundColor=s;GT.tA=a;GT.tRGB=[Math.round(t[0]),Math.round(t[1]),Math.round(t[2])]}
  const n=GT.now();const txt=ICON[n.phase]+' '+n.hhmm;if(clock.textContent!==txt)clock.textContent=txt;const show=G.state==='play'?'flex':'none';if(clock.style.display!==show)clock.style.display=show;GT.ticks++}catch(e){GT.err='paint '+e.message}}
setInterval(paint,500);paint();
/* ---------- GM (local, off by default) ---------- */
GT.setHour=(h)=>{GT.ov={h0:mod(+h,24),t0:Date.now(),speed:0};paint();return GT.now()};
GT.setPhase=(p)=>{const m={dawn:6,day:12,dusk:18,night:23};return GT.setHour(m[p]!=null?m[p]:12)};
GT.speed=(k)=>{const h=GT.hour();GT.ov={h0:h,t0:Date.now(),speed:+k};return GT.now()};
GT.real=()=>{GT.ov=null;paint();return GT.now()};
try{if(!window.__REAL||new URLSearchParams(location.search).get('gm')==='on'){const p=document.createElement('div');p.id='gtGm';p.style.cssText='position:fixed;left:8px;bottom:122px;z-index:20;display:flex;gap:3px;flex-wrap:wrap;max-width:230px;padding:3px;border-radius:8px;background:rgba(20,16,30,.88);border:1px solid #7a6a9a;font:700 10px system-ui';
  const mk=(t,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.style.cssText='width:auto;min-width:0;min-height:0;height:20px;margin:0;padding:0 6px;border-radius:6px;border:1px solid #9a8ac0;background:#2a2340;color:#e8dcff;font:700 10px/18px system-ui;cursor:pointer';b.addEventListener('click',e=>{e.stopPropagation();fn()});for(const ev of ['pointerdown','mousedown','touchstart'])b.addEventListener(ev,e=>e.stopPropagation());p.appendChild(b)};
  mk('⏰ รุ่งอรุณ',()=>GT.setPhase('dawn'));mk('กลางวัน',()=>GT.setPhase('day'));mk('เย็น',()=>GT.setPhase('dusk'));mk('กลางคืน',()=>GT.setPhase('night'));mk('+1ชม.',()=>GT.setHour(GT.hour()+1));mk('×30',()=>GT.speed(30));mk('เวลาจริง',()=>GT.real());document.body.appendChild(p)}}catch(e){GT.err='gm '+e.message}
})();

