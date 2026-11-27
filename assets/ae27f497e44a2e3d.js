
/* ---- worldmap-r1 (TEST allin_r96, 16 Nov 2026, DeaRz "แผนที่โลกหาย"): the world-map window (M) draws again ----
   CAUSE: drawMap() loops over the OLD 34-cell world grid WG (wasteland / snow / jungle / lava ... zone ids of the old game) and reads ZONES[z].base for each; the TEST builds only keep the 20 new maps in ZONES, so the very first old id
   (ZONES['wasteland_bone_fields'] = undefined) throws "Cannot read properties of undefined (reading 'base')" at wgUnlocked() on every frame -> the window opens but the canvas stays blank (artwork + all cells missing).
   FIX: a new drawMap that draws the same world artwork and one numbered node per map that really exists now (Map 1 .. Map 12 + Cave 1 + Map 9 tower), joined by the story path, lock marks, "you are here" ring + arrow, hover name / level, click = name toast.
   Old cells whose zone no longer exists are simply not drawn. ?worldmap=off = old (crashing) function. Debug: window.__WORLDMAP ---- */
(function(){'use strict';
const Q=String(location.search);const WMP=window.__WORLDMAP={ver:'worldmap-r1',on:!/[?&]worldmap=off\b/.test(Q),err:null,hover:null,draws:0};
if(!WMP.on)return;
/* [zone id, label, x, y] in the 1600x873 artwork */
const NODES=[['sylva_lab','Map 1',300,440],['cartroad_plains','Map 2',500,525],['astoria_capital','Map 3 · เมืองหลวง',790,400],['w22_map4_test','Map 4',640,300],['w22_cave1_test','Cave 1',560,235],['w22_map5_test','Map 5',470,160],['w23_map6_test','Map 6',640,120],['w23_map7_test','Map 7',810,105],['w23_map8_test','Map 8',990,150],['w24_map9f1_test','Map 9 หอโคมไฟ',1190,210],['w24_map10_test','Map 10',1010,455],['map11','Map 11',1180,560],['map12','Map 12',1340,610]];
const ORDER=NODES.map(n=>n[0]);
let IM=null;const art=()=>{if(!IM){try{IM=new Image();IM.src=WORLD_MAP_IMG}catch(e){IM=null}}return IM&&IM.complete&&IM.naturalWidth?IM:null};
const zoneOf=z=>{try{return ZONES[z]}catch(_){return null}};
const here=z=>{try{return G.zone===z||(z==='w24_map9f1_test'&&/^w24_map9f\d_test$/.test(G.zone))}catch(_){return false}};
const unlocked=z=>{try{return z==='astoria_capital'||z==='sylva_lab'||here(z)||G.unlocked.has(z)}catch(_){return false}};
const lvText=z=>{const Z=zoneOf(z);if(!Z)return '';if(Z.range)return 'Lv '+Z.range[0]+'–'+Z.range[1];const m=/Lv\s*[\d–-]+/.exec(Z.sub||'');return m?m[0]:''};
WMP.nodes=NODES;
window.drawMap=function(){try{const c=document.getElementById('mapCv');if(!c)return;const W=(typeof WM_W==='number'?WM_W:1600),H=(typeof WM_H==='number'?WM_H:873);if(c.width!==W){c.width=W;c.height=H}
  const g=c.getContext('2d'),t=(typeof time==='number'?time:performance.now()/1000);WMP.draws++;
  const im=art();if(im)g.drawImage(im,0,0,W,H);else{g.fillStyle='#2a2016';g.fillRect(0,0,W,H)}
  g.fillStyle='rgba(8,10,22,.18)';g.fillRect(0,0,W,H);
  const live=NODES.filter(n=>zoneOf(n[0]));
  /* the story path */
  g.save();g.lineWidth=5;g.lineCap='round';g.setLineDash([2,12]);g.strokeStyle='rgba(255,236,170,.9)';g.beginPath();let first=true;for(const n of live){if(first){g.moveTo(n[2],n[3]);first=false}else g.lineTo(n[2],n[3])}g.stroke();g.restore();
  g.textAlign='center';
  let idx=0;for(const n of live){idx++;const z=n[0],on=unlocked(z),isHere=here(z),hov=WMP.hover===z,x=n[2],y=n[3],r=isHere?26:hov?24:21;
    if(isHere){g.save();g.globalCompositeOperation='lighter';g.strokeStyle='rgba(255,210,60,'+(.45+.3*Math.sin(t*4))+')';g.lineWidth=9;g.beginPath();g.arc(x,y,r+7,0,6.283);g.stroke();g.restore()}
    g.beginPath();g.arc(x,y,r,0,6.283);g.fillStyle=on?(isHere?'#ffd23d':'#fff3c9'):'rgba(40,46,66,.92)';g.fill();g.lineWidth=isHere?4:3;g.strokeStyle=isHere?'#7a4a00':on?'#6b4a14':'#8d94aa';g.stroke();
    g.font='800 17px "Noto Sans Thai",system-ui';g.fillStyle=on?'#3a2400':'#a8afc4';g.textBaseline='middle';g.fillText(String(idx),x,y+1);g.textBaseline='alphabetic';
    g.font='700 14px "Noto Sans Thai",system-ui';g.lineWidth=4;g.strokeStyle='rgba(10,6,0,.92)';g.strokeText(n[1],x,y+r+17);g.fillStyle=on?'#fff8e0':'#b4bbd0';g.fillText(n[1],x,y+r+17);
    if(!on){g.font='15px system-ui';g.fillText('🔒',x+r-2,y-r+6)}}
  /* you are here: hero marker inside the node area */
  const cur=live.find(n=>here(n[0]));if(cur&&typeof P!=='undefined'&&P){const Z=zoneOf(G.zone)||{w:1,h:1},px=cur[2]+((P.x/Z.w)-.5)*70,py=cur[3]+((P.y/Z.h)-.5)*46-34;g.fillStyle='#ff4d5e';g.strokeStyle='#fff';g.lineWidth=2.5;g.beginPath();g.moveTo(px,py+9);g.lineTo(px-7,py-5);g.lineTo(px+7,py-5);g.closePath();g.fill();g.stroke()}
  /* hover tooltip */
  if(WMP.hover){const n=live.find(q=>q[0]===WMP.hover);if(n){const Z=zoneOf(n[0]),nm=(Z&&Z.n)||n[1],lv=lvText(n[0]),st=unlocked(n[0])?'':'🔒 ยังไม่ปลดล็อก',lines=[nm,lv,st].filter(Boolean);g.font='700 15px "Noto Sans Thai",system-ui';const w=Math.max(...lines.map(s=>g.measureText(s).width))+24,h=lines.length*21+12;let bx=n[2]-w/2,by=n[3]-70-h+20;bx=Math.max(8,Math.min(W-w-8,bx));by=Math.max(8,by);
    g.fillStyle='rgba(8,10,24,.92)';g.fillRect(bx,by,w,h);g.strokeStyle='rgba(255,226,140,.8)';g.lineWidth=2;g.strokeRect(bx,by,w,h);g.textAlign='left';lines.forEach((s,i)=>{g.fillStyle=i?'#ffd88a':'#fff';g.fillText(s,bx+12,by+22+i*21)});g.textAlign='center'}}
  g.font='700 16px Cinzel, serif';g.textAlign='left';g.lineWidth=4;g.strokeStyle='rgba(20,10,0,.8)';const ws='Maps '+live.filter(n=>unlocked(n[0])).length+' / '+live.length;g.strokeText(ws,150,50);g.fillStyle='#fff6d8';g.fillText(ws,150,50);g.textAlign='center';
  }catch(e){WMP.err=String((e&&e.message)||e)}};
/* hover + click (the old handlers look the old WG cells up and find nothing) */
const hook=()=>{const c=document.getElementById('mapCv');if(!c||c._wm1)return !!c;c._wm1=1;
  const at=e=>{const r=c.getBoundingClientRect(),W=(typeof WM_W==='number'?WM_W:1600),H=(typeof WM_H==='number'?WM_H:873),x=(e.clientX-r.left)/r.width*W,y=(e.clientY-r.top)/r.height*H;let best=null,bd=40;for(const n of NODES){if(!zoneOf(n[0]))continue;const d=Math.hypot(n[2]-x,n[3]-y);if(d<bd){bd=d;best=n[0]}}return best};
  c.addEventListener('mousemove',e=>{WMP.hover=at(e)});c.addEventListener('mouseleave',()=>{WMP.hover=null});
  c.addEventListener('click',e=>{const z=at(e);if(!z)return;const Z=zoneOf(z);try{notify((Z&&Z.n||z)+(lvText(z)?' · '+lvText(z):'')+(unlocked(z)?'':' · 🔒 ยังไม่ปลดล็อก'),false)}catch(_){}});return true};
const iv=setInterval(()=>{try{if(hook())clearInterval(iv)}catch(e){WMP.err=String(e)}},500);
console.info('[WORLDMAP] ready r1');
})();
