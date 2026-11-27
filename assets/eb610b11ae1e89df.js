
/* ---- r139 worldmap3 (TEST ONLY, DeaRz/Art 17 Nov): the M window shows the approved World Map v3 painting (Art WORLD_MAP_v3_approved.png 1536x1024, 22 painted badges; badge number = map number; MD5 98be200a… of the PNG, embedded here as a JPEG q92).
   No new number circles are drawn on the painting: an invisible hit area sits on each painted badge, with overlays only - a pulsing gold ring on the map the hero is in, a small lock on maps that are locked, a "เร็วๆ นี้" lock on maps that do not exist in the game yet (13-22), hover / tap label with the in-game name, and the same click behaviour as before (a toast with name + level + lock state; no new travel rules).
   Cave 1 has no painted badge: a small code-drawn cave marker sits on the road between badges 4 and 5 (assumption, not approved). Counter "MAPS x / 22" = maps unlocked in the game over the 22 planned. ?worldmap3=off = the old 13-point book map. Debug: window.__WORLDMAP3 ---- */
(function(){'use strict';
const Q=String(location.search),W3=window.__WORLDMAP3={ver:'worldmap3-r1',on:!/[?&]worldmap3=off\b/.test(Q),err:null,hover:null,draws:0};
if(!W3.on||!window.__WM3_IMG)return;
const IW=1536,IH=1024;
try{const st=document.createElement('style');st.textContent='#wMap #mapCv{background:#0b0d16}@media (max-height:560px){#wMap #mapCv{max-height:calc(100vh - 118px)}#wMap .legend{font-size:10px;gap:4px 8px}}';document.head.appendChild(st)}catch(_){}
const BADGE=[null,[121,444],[384,476],[673,476],[661,379],[661,303],[661,224],[706,147],[689,68],[471,70],[889,468],[990,413],[1137,398],[1317,393],[1461,380],[733,574],[869,674],[1047,781],[1326,828],[346,594],[406,673],[370,818],[114,925]];
const ZID={1:'sylva_lab',2:'cartroad_plains',3:'astoria_capital',4:'w22_map4_test',5:'w22_map5_test',6:'w23_map6_test',7:'w23_map7_test',8:'w23_map8_test',9:'w24_map9f1_test',10:'w24_map10_test',11:'map11',12:'map12'};
const CAVE={x:632,y:343,z:'w22_cave1_test'};
const zone=z=>{try{return ZONES[z]}catch(_){return null}};
const here=z=>{try{return G.zone===z||(z==='w24_map9f1_test'&&/^w24_map9f\d_test$/.test(G.zone))}catch(_){return false}};
const unlocked=z=>{try{return z==='astoria_capital'||z==='sylva_lab'||here(z)||G.unlocked.has(z)}catch(_){return false}};
const lvText=z=>{const Z=zone(z);if(!Z)return '';if(Z.range)return 'Lv '+Z.range[0]+'–'+Z.range[1];const m=/Lv\s*[\d–-]+/.exec(Z.sub||'');return m?m[0]:''};
let IM=null;const art=()=>{if(!IM){try{IM=new Image();IM.src=window.__WM3_IMG}catch(e){IM=null}}return IM&&IM.complete&&IM.naturalWidth?IM:null};
function state(n){const z=ZID[n];if(!z||!zone(z))return {n,z:null,exists:false,on:false};return {n,z,exists:true,on:unlocked(z),here:here(z)}}
W3.state=state;W3.toClient=(ix,iy)=>{const c=document.getElementById('mapCv'),r=c.getBoundingClientRect(),k=Math.min(r.width/IW,r.height/IH);return [r.left+(r.width-IW*k)/2+ix*k,r.top+(r.height-IH*k)/2+iy*k]};
window.drawMap=function(){try{const c=document.getElementById('mapCv');if(!c)return;if(c.width!==IW){c.width=IW;c.height=IH}
  const g=c.getContext('2d'),t=(typeof time==='number'?time:performance.now()/1000);W3.draws++;const im=art();if(im)g.drawImage(im,0,0,IW,IH);else{g.fillStyle='#2a2016';g.fillRect(0,0,IW,IH)}
  let cnt=0;
  for(let n=1;n<=22;n++){const s=state(n),[x,y]=BADGE[n];if(s.exists&&s.on)cnt++;
    if(s.here){g.save();g.globalCompositeOperation='lighter';const p=.5+.5*Math.sin(t*4);g.strokeStyle='rgba(255,214,70,'+(.6+.35*p)+')';g.lineWidth=7;g.beginPath();g.arc(x,y,24+4*p,0,6.283);g.stroke();g.strokeStyle='rgba(255,255,200,.9)';g.lineWidth=3;g.beginPath();g.arc(x,y,21,0,6.283);g.stroke();g.restore();
      g.fillStyle='#ff4d5e';g.strokeStyle='#fff';g.lineWidth=2.5;g.beginPath();g.moveTo(x,y-26);g.lineTo(x-8,y-42);g.lineTo(x+8,y-42);g.closePath();g.fill();g.stroke()}
    if(!s.exists||!s.on){g.save();g.fillStyle='rgba(20,24,40,.5)';g.beginPath();g.arc(x,y,17,0,6.283);g.fill();g.font='15px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff';g.fillText('🔒',x+15,y-14);g.restore()}}
  /* Cave 1 marker (code drawn) */
  {const x=CAVE.x,y=CAVE.y,on=unlocked(CAVE.z)||here(CAVE.z),ex=!!zone(CAVE.z);g.save();g.fillStyle=on?'#2a1c10':'#2c3040';g.strokeStyle=on?'#ffe9a0':'#9aa3bd';g.lineWidth=3;g.beginPath();g.moveTo(x-13,y+10);g.quadraticCurveTo(x-13,y-12,x,y-12);g.quadraticCurveTo(x+13,y-12,x+13,y+10);g.closePath();g.fill();g.stroke();g.fillStyle='#000';g.beginPath();g.ellipse(x,y+4,6,7,0,0,6.283);g.fill();
    g.font='700 12px "Noto Sans Thai",system-ui';g.textAlign='center';g.lineWidth=3;g.strokeStyle='rgba(10,6,0,.9)';g.strokeText('Cave 1',x,y+25);g.fillStyle='#fff6d8';g.fillText('Cave 1',x,y+25);
    if(here(CAVE.z)){g.globalCompositeOperation='lighter';g.strokeStyle='rgba(255,214,70,.9)';g.lineWidth=5;g.beginPath();g.arc(x,y,20+3*Math.sin(t*4),0,6.283);g.stroke()}g.restore()}
  /* hover label */
  const h=W3.hover;if(h){let nm,lv,st,x,y;if(h==='cave'){x=CAVE.x;y=CAVE.y;const Z=zone(CAVE.z);nm=(Z&&Z.n)||'Cave 1';lv=lvText(CAVE.z);st=(unlocked(CAVE.z)||here(CAVE.z))?'':'🔒 ยังไม่ปลดล็อก'}else{const s=state(h);[x,y]=BADGE[h];if(s.exists){const Z=zone(s.z);nm='Map '+h+' · '+((Z&&Z.n)||s.z);lv=lvText(s.z);st=s.on?'':'🔒 ยังไม่ปลดล็อก'}else{nm='Map '+h;lv='';st='🔒 เร็วๆ นี้'}}
    const lines=[nm,lv,st].filter(Boolean);g.save();g.font='700 17px "Noto Sans Thai",system-ui';const w=Math.max(...lines.map(s=>g.measureText(s).width))+24,hh=lines.length*24+12;let bx=x-w/2,by=y-34-hh;bx=Math.max(8,Math.min(IW-w-8,bx));if(by<8)by=y+34;
    g.fillStyle='rgba(8,10,24,.93)';g.fillRect(bx,by,w,hh);g.strokeStyle='rgba(255,226,140,.85)';g.lineWidth=2;g.strokeRect(bx,by,w,hh);g.textAlign='left';lines.forEach((s,i)=>{g.fillStyle=i?'#ffd88a':'#fff';g.fillText(s,bx+12,by+26+i*24)});g.restore()}
  g.save();g.font='700 22px Cinzel, serif';g.textAlign='left';g.lineWidth=5;g.strokeStyle='rgba(20,10,0,.85)';const ws='MAPS '+cnt+' / 22';g.strokeText(ws,24,IH-24);g.fillStyle='#fff6d8';g.fillText(ws,24,IH-24);g.restore();
  }catch(e){W3.err=String((e&&e.message)||e)}};
const hit=e=>{const c=document.getElementById('mapCv'),r=c.getBoundingClientRect(),k=Math.min(r.width/IW,r.height/IH),ox=r.left+(r.width-IW*k)/2,oy=r.top+(r.height-IH*k)/2,x=(e.clientX-ox)/k,y=(e.clientY-oy)/k;
  if(Math.hypot(CAVE.x-x,CAVE.y-y)<24)return 'cave';let best=null,bd=30;for(let n=1;n<=22;n++){const d=Math.hypot(BADGE[n][0]-x,BADGE[n][1]-y);if(d<bd){bd=d;best=n}}return best};
const hook=()=>{const c=document.getElementById('mapCv');if(!c||c._wm3)return !!c;c._wm3=1;
  c.addEventListener('mousemove',e=>{e.stopImmediatePropagation();W3.hover=hit(e)},true);c.addEventListener('mouseleave',e=>{W3.hover=null},true);
  c.addEventListener('click',e=>{e.stopImmediatePropagation();const h=hit(e);W3.hover=h;if(!h)return;let msg;if(h==='cave'){const Z=zone(CAVE.z);msg=((Z&&Z.n)||'Cave 1')+(lvText(CAVE.z)?' · '+lvText(CAVE.z):'')+((unlocked(CAVE.z)||here(CAVE.z))?'':' · 🔒 ยังไม่ปลดล็อก')}
    else{const s=state(h);if(!s.exists)msg='Map '+h+' · 🔒 เร็วๆ นี้';else{const Z=zone(s.z);msg=((Z&&Z.n)||s.z)+(lvText(s.z)?' · '+lvText(s.z):'')+(s.on?'':' · 🔒 ยังไม่ปลดล็อก')}}
    try{notify(msg,false)}catch(_){}},true);
  c.addEventListener('touchstart',e=>{try{const t=e.touches[0];W3.hover=hit(t)}catch(_){}},{passive:true,capture:true});return true};
setInterval(()=>{try{hook();const lg=document.querySelector('#wMap .legend');if(lg&&lg.dataset.w3!=='1'){lg.dataset.w3='1';lg.innerHTML='<span><i style="background:#ffd23d;box-shadow:0 0 8px #ffd23d"></i>แมพที่คุณอยู่</span><span><i style="background:#56688f"></i>🔒 ยังไม่ปลดล็อก</span><span><i style="background:#7a8099"></i>🔒 เร็วๆ นี้ (ยังไม่มีในเกม)</span><span>Lantern Lands 1-10 · Sunscar Desert 11-14 · Emberhold 15-18 · Coral Coast 19-22</span>'}}catch(e){W3.err=String(e)}},500);
})();
