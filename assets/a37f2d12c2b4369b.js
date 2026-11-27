
/* ---- r174b fishtank (TEST ONLY, owner decisions via coordinator 21 Nov 2026). Base = TEST r174a. Flag ?fishtank=off = no tank item / no overlay (a placed tank in an old save is parked in state.tankStash and comes back when the flag is on again).
   Housing item "fishTank" (ตู้ปลา, Emma 800 G, ONE per house = yard + room together, solid, placeable in yard and room): added to housebuild's catalogue by an exact-string patch in the build (IT entry + DRAW.fishTank -> window.__FISHTANK_DRAW).
   F / tap on the tank opens a side-view overlay (close button + Esc). The tank contents live in the house save as state.tank = {v:1, bg:'sand', fish:[{u,sp,e:{k,n}}]} (house level, so storing the tank and placing it again keeps fish + background). Old saves without state.tank load unchanged (the block is created on first use).
   ONLY interaction = feeding: one tap = exactly one pellet at that x, sinks slowly, the nearest HUNGRY fish swims to it and eats it. Each fish eats at most FT.cfg.perPeriod (3) pellets per game-time period (morning 05-11, day 11-19, night 19-05 = 9 per game day); a full fish ignores pellets; uneaten pellets rest on the bottom and fade. Cosmetic only: no penalty, no hunger icon, no counter, nothing about the quota is drawn.
   DATA (swappable by id, r175 fishing adds fish from the bag with FT.addFish(speciesId)): FT.species (8 fish, itemId = the r175 bag item), FT.sprites (fish picture per species id: code drawer or image), FT.frames (tank prop + overlay glass frame), FT.bgs (3 backgrounds: back + optional front strip, drawn at 1920x1080 design size, cover-fit). Also here (same build): house-look picker close button no longer behind the build action bar. Debug: window.__FISHTANK ---- */
(function(){'use strict';
const Q=String(location.search),FT=window.__FISHTANK={ver:'fishtank-r174b',on:!/[?&]fishtank=off\b/.test(Q),gm:/[?&]gm=on\b/.test(Q),err:null,open:false,msg:'',stats:{dropped:0,eaten:0,added:0,refused:0,opens:0,frames:0},perf:{n:0,sum:0,max:0},pellets:[],rt:[],rect:null};
const ERR=(w,e)=>{FT.err=w+': '+((e&&e.message)||e);try{console.error('[FISHTANK]',w,e)}catch(_){}};
/* ---- fix 1 (always, also with ?fishtank=off): house-look picker above the build action bar, close button always reachable ---- */
try{const c=document.createElement('style');c.textContent='#hlPick{z-index:9300 !important;top:56px !important;max-height:calc(100vh - 72px) !important;padding-bottom:0 !important}#hlPick .x{position:sticky !important;bottom:0 !important;margin:10px auto 0 !important;box-shadow:0 -8px 10px 4px rgba(18,14,10,.96)}';document.head.appendChild(c)}catch(e){ERR('pickfix',e)}
const H=window.HOUSE;
const S0=()=>H.state();
/* ---- flag off: park placed tanks of the yard so the build's sanitize cannot drop them ---- */
/* the stash is applied now AND inside H.sanitize (the build's sanitize runs 800 ms after load and drops items it does not know; the game may also replace the state object after login) */
const parkTanks=()=>{const S=S0();if(!S||!Array.isArray(S.placed))return;if(!FT.on){const t=S.placed.filter(o=>o&&o.id==='fishTank');if(t.length){S.tankStash=(S.tankStash||[]).concat(t);S.placed=S.placed.filter(o=>!(o&&o.id==='fishTank'))}}else if(Array.isArray(S.tankStash)&&S.tankStash.length){for(const o of S.tankStash)S.placed.push(o);delete S.tankStash}};
try{if(H&&H.on&&typeof H.sanitize==='function'){const _sz=H.sanitize;H.sanitize=function(){try{parkTanks()}catch(e){ERR('park',e)}return _sz.apply(this,arguments)};parkTanks()}}catch(e){ERR('stash',e)}
if(!FT.on)return;
if(!H||!H.on||!H.build||!H.items||!H.items.fishTank){FT.err='housing/item missing';return}
const B=H.build,ZID=H.ZID,IT=H.items;
/* ---------------- data ---------------- */
FT.cfg={cap:12,perPeriod:3,price:800,maxPellets:40,sinkPerSec:.07,restFadeMs:[3500,4500],surface:.07,floor:.9,
 periods:[{id:'m',from:5,to:11,name:'เช้า'},{id:'d',from:11,to:19,name:'กลางวัน'},{id:'n',from:19,to:5,name:'กลางคืน'}]};
FT.msgs={one:'ตู้ปลามีได้ 1 ตู้ต่อบ้าน · มีตู้ปลาอยู่แล้ว (วางอยู่หรืออยู่ในคลัง)',full:'ตู้ปลาเต็มแล้ว · ใส่ปลาได้ 12 ตัว',farAway:'เดินเข้าไปใกล้ตู้ปลาก่อน',unknown:'ไม่รู้จักปลาชนิดนี้'};
/* species: len / h = body size at design scale; speed px/s; band = depth band (fraction of tank height); itemId = the r175 bag item */
FT.species={
 pondCarp:{n:'ปลาคาร์ป',r:'common',itemId:'fish_carp',kind:'fish',len:120,h:44,speed:38,band:[.3,.72],body:'#c98a3c',belly:'#f4dca4',fin:'#a8641e',mark:'#e8b868'},
 mudLoach:{n:'ปลาหมู',r:'common',itemId:'fish_loach',kind:'long',len:132,h:24,speed:30,band:[.62,.86],body:'#8a6a48',belly:'#d8c29a',fin:'#6a4a2c',mark:'#4a3220'},
 reedMinnow:{n:'ปลาซิว',r:'common',itemId:'fish_minnow',kind:'fish',len:62,h:20,speed:72,band:[.2,.6],body:'#9ab88a',belly:'#eef4e0',fin:'#c8d8b8',mark:'#4a6a4a'},
 lanternGuppy:{n:'ปลาหางนกยูงตะเกียง',r:'common',itemId:'fish_lanternGuppy',kind:'guppy',len:74,h:26,speed:64,band:[.18,.55],body:'#f08a3c',belly:'#ffe0a0',fin:'#7a4ad0',mark:'#ffd870'},
 silverPerch:{n:'ปลากะพงเงิน',r:'uncommon',itemId:'fish_silverPerch',kind:'fish',len:108,h:40,speed:54,band:[.25,.65],body:'#b8c4d0',belly:'#f4f8fc',fin:'#8898aa',mark:'#5a6a7c'},
 mistEel:{n:'ปลาไหลหมอก',r:'uncommon',itemId:'fish_mistEel',kind:'eel',len:190,h:15,speed:36,band:[.45,.8],body:'#8aa0b8',belly:'#c8d8e8',fin:'#6a8098',mark:'#e8f2ff'},
 skyKoi:{n:'ปลาคาร์ปฟ้า',r:'uncommon',itemId:'fish_skyKoi',kind:'fish',len:142,h:50,speed:40,band:[.22,.62],body:'#cfe8f8',belly:'#ffffff',fin:'#7ec0ea',mark:'#4a9ad8'},
 goldenLanternfish:{n:'ปลาตะเกียงทอง',r:'rare',itemId:'fish_goldenLanternfish',kind:'lantern',len:100,h:38,speed:48,band:[.3,.7],body:'#e8b020',belly:'#fff0a0',fin:'#c8780c',mark:'#fff6b0'}};
FT.speciesIds=Object.keys(FT.species);
FT.byItem=id=>FT.speciesIds.find(k=>FT.species[k].itemId===id)||null;
/* ---- fish pictures, one drawer per species id (swap = FT.sprites[id] = {draw(g,t,sp,p)} or FT.setSpriteImage(id,src,w,h)). Art is drawn facing RIGHT, centred on the body; the overlay mirrors it when the fish swims left. ---- */
const ell=(g,x,y,rx,ry,rot)=>{g.beginPath();g.ellipse(x,y,rx,ry,rot||0,0,6.2832)};
function bodyPath(g,L,Hh){g.beginPath();g.moveTo(L*.5,0);g.bezierCurveTo(L*.4,-Hh*.62,-L*.08,-Hh*.62,-L*.4,-Hh*.14);g.lineTo(-L*.4,Hh*.14);g.bezierCurveTo(-L*.08,Hh*.62,L*.4,Hh*.62,L*.5,0);g.closePath()}
function tailFin(g,L,Hh,wag,len,spread,col){g.save();g.translate(-L*.38,0);g.rotate(wag);g.fillStyle=col;g.beginPath();g.moveTo(2,0);g.quadraticCurveTo(-len*.5,-spread*.9,-len,-spread);g.quadraticCurveTo(-len*.72,0,-len,spread);g.quadraticCurveTo(-len*.5,spread*.9,2,0);g.fill();g.restore()}
function eye(g,L,Hh){g.fillStyle='#fff';ell(g,L*.33,-Hh*.1,Hh*.15,Hh*.15);g.fill();g.fillStyle='#111';ell(g,L*.345,-Hh*.1,Hh*.075,Hh*.075);g.fill()}
function drawDefault(g,t,sp){const L=sp.len,Hh=sp.h,wag=Math.sin(t*7+sp._ph)*.32,K=sp.kind;g.save();g.lineJoin='round';
 if(K==='eel'){const n=18,pts=[];for(let i=0;i<=n;i++){const x=L*.5-L*i/n;pts.push([x,Math.sin(i*.55-t*5.5)*Hh*.55*(.3+i/n*.7)])}
  g.lineCap='round';for(const [w,c] of [[Hh,sp.body],[Hh*.55,sp.belly]]){g.strokeStyle=c;g.lineWidth=w;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()}
  g.strokeStyle=sp.mark;g.lineWidth=2;g.globalAlpha=.55;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]-Hh*.3):g.moveTo(p[0],p[1]-Hh*.3));g.stroke();g.globalAlpha=1;
  g.fillStyle=sp.body;ell(g,L*.5,pts[0][1],Hh*.8,Hh*.62);g.fill();eye(g,L*1.02,Hh*1.3);g.restore();return}
 if(K==='long'){const n=14,pts=[];for(let i=0;i<=n;i++){const x=L*.5-L*i/n;pts.push([x,Math.sin(i*.5-t*6)*Hh*.28*(.3+i/n*.7)])}
  g.lineCap='round';for(const [w,c] of [[Hh,sp.body],[Hh*.5,sp.belly]]){g.strokeStyle=c;g.lineWidth=w;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]+(w<Hh?Hh*.18:0)):g.moveTo(p[0],p[1]+(w<Hh?Hh*.18:0)));g.stroke()}
  g.fillStyle=sp.mark;for(let i=1;i<n;i+=2){const p=pts[i];ell(g,p[0],p[1]-Hh*.18,Hh*.17,Hh*.14);g.fill()}
  g.strokeStyle=sp.mark;g.lineWidth=1.6;for(const s of [-1,1]){g.beginPath();g.moveTo(L*.5+2,s*2);g.quadraticCurveTo(L*.5+10,s*9,L*.5+4,s*13);g.stroke()}eye(g,L*.98,Hh*1.1);g.restore();return}
 /* finned fish */
 const tl=K==='guppy'?L*.7:L*.42,ts=K==='guppy'?Hh*1.05:Hh*.62;
 tailFin(g,L,Hh,wag,tl,ts,sp.fin);
 g.fillStyle=sp.fin;g.globalAlpha=.9;g.beginPath();g.moveTo(L*.12,-Hh*.45);g.quadraticCurveTo(-L*.02,-Hh*(K==='koi'?.95:.9),-L*.2,-Hh*.42);g.fill();g.beginPath();g.moveTo(L*.02,Hh*.42);g.quadraticCurveTo(-L*.08,Hh*.8,-L*.18,Hh*.38);g.fill();g.globalAlpha=1;
 bodyPath(g,L,Hh);g.fillStyle=sp.body;g.fill();g.save();bodyPath(g,L,Hh);g.clip();g.fillStyle=sp.belly;ell(g,L*.05,Hh*.52,L*.5,Hh*.38);g.fill();
 if(sp.id==='pondCarp'){g.fillStyle=sp.mark;g.globalAlpha=.55;for(let i=0;i<5;i++){ell(g,-L*.28+i*L*.16,-Hh*.12,L*.05,Hh*.18);g.fill()}g.globalAlpha=1}
 if(sp.id==='reedMinnow'){g.fillStyle=sp.mark;g.fillRect(-L*.4,-Hh*.06,L*.9,Hh*.14)}
 if(sp.id==='lanternGuppy'){g.fillStyle=sp.mark;g.globalAlpha=.8;ell(g,-L*.02,-Hh*.04,L*.07,L*.07);g.fill();g.globalAlpha=1}
 if(sp.id==='silverPerch'){g.fillStyle=sp.mark;g.globalAlpha=.5;g.fillRect(-L*.4,-Hh*.12,L*.85,Hh*.1);g.globalAlpha=1}
 if(sp.id==='skyKoi'){g.fillStyle=sp.mark;g.globalAlpha=.8;ell(g,-L*.05,-Hh*.2,L*.13,Hh*.2,.2);g.fill();ell(g,-L*.28,-Hh*.05,L*.08,Hh*.15);g.fill();g.fillStyle='#ffd870';ell(g,L*.22,-Hh*.3,L*.06,Hh*.1);g.fill();g.globalAlpha=1}
 g.restore();bodyPath(g,L,Hh);g.strokeStyle='rgba(20,20,30,.38)';g.lineWidth=1.6;g.stroke();eye(g,L,Hh);
 if(K==='lantern'){const lx=L*.46,ly=-Hh*.78;g.strokeStyle='#c8780c';g.lineWidth=2;g.beginPath();g.moveTo(L*.3,-Hh*.42);g.quadraticCurveTo(L*.4,-Hh*1.0,lx,ly);g.stroke();const gr=g.createRadialGradient(lx,ly,1,lx,ly,Hh*.55);gr.addColorStop(0,'rgba(255,250,190,.95)');gr.addColorStop(.35,'rgba(255,225,110,.55)');gr.addColorStop(1,'rgba(255,200,60,0)');g.fillStyle=gr;ell(g,lx,ly,Hh*.55,Hh*.55);g.fill();g.fillStyle='#fff8c0';ell(g,lx,ly,3.2,3.2);g.fill()}
 if(K==='guppy'){const gr=g.createRadialGradient(-L*.02,-Hh*.04,1,-L*.02,-Hh*.04,Hh*.5);gr.addColorStop(0,'rgba(255,240,160,.7)');gr.addColorStop(1,'rgba(255,200,80,0)');g.fillStyle=gr;ell(g,-L*.02,-Hh*.04,Hh*.5,Hh*.5);g.fill()}
 g.restore()}
FT.sprites={};for(const id of FT.speciesIds){FT.species[id].id=id;FT.species[id]._ph=FT.speciesIds.indexOf(id)*1.7;FT.sprites[id]={draw:drawDefault}}
FT.setSpriteImage=(id,src,w,h)=>{const im=new Image();im.src=src;FT.sprites[id]={draw(g,t,sp){if(im.complete&&im.naturalWidth)g.drawImage(im,-(w||sp.len)/2,-(h||sp.h)/2,w||sp.len,h||sp.h)}}};
/* ---- tank prop (housing item sprite, 84 x 100) + overlay glass frame; swap = FT.frames.prop / FT.frames.glass ---- */
FT.frames={prop(g,f,d){const W=84;g.fillStyle='rgba(0,0,0,.28)';ell(g,42,94,36,5);g.fill();
  g.fillStyle='#5a3a1a';g.fillRect(8,66,68,26);g.fillStyle='#8a5a28';g.fillRect(8,66,68,5);g.fillStyle='#3a2410';g.fillRect(12,92,8,4);g.fillRect(64,92,8,4);g.strokeStyle='#2a1808';g.lineWidth=1.5;g.strokeRect(8,66,68,26);g.fillStyle='#3a2410';g.fillRect(40,74,4,10);
  g.fillStyle='#2a1c10';g.fillRect(6,12,72,5);g.fillRect(6,62,72,6);
  const gr=g.createLinearGradient(0,17,0,62);gr.addColorStop(0,'#9fe0f4');gr.addColorStop(1,'#3b8fb4');g.fillStyle=gr;g.fillRect(9,17,66,45);
  g.fillStyle='#d9c17c';g.fillRect(9,55,66,7);g.fillStyle='#2f9a5a';for(const x of [16,22,60,67]){g.beginPath();g.moveTo(x-2,56);g.quadraticCurveTo(x+3,44,x,34);g.quadraticCurveTo(x+4,46,x+3,56);g.fill()}
  g.fillStyle='#f08a3c';ell(g,34,36,7,4);g.fill();g.beginPath();g.moveTo(28,36);g.lineTo(23,32);g.lineTo(23,40);g.fill();g.fillStyle='#cfe8f8';ell(g,52,44,6,3.4);g.fill();g.beginPath();g.moveTo(58,44);g.lineTo(63,41);g.lineTo(63,47);g.fill();
  g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=2;g.strokeRect(9,17,66,45);g.fillStyle='rgba(255,255,255,.28)';g.beginPath();g.moveTo(13,18);g.lineTo(26,18);g.lineTo(16,60);g.lineTo(11,60);g.fill()},
 glass(g,r){const p=14;g.save();g.beginPath();g.rect(r.x-p,r.y-p,r.w+2*p,r.h+2*p);g.roundRect?g.roundRect(r.x,r.y,r.w,r.h,10):g.rect(r.x,r.y,r.w,r.h);const gr=g.createLinearGradient(0,r.y-p,0,r.y+r.h+p);gr.addColorStop(0,'#7a4e1c');gr.addColorStop(1,'#4a2e10');g.fillStyle=gr;g.fill('evenodd');
  g.strokeStyle='rgba(255,230,170,.55)';g.lineWidth=2;g.beginPath();g.rect(r.x-p+1,r.y-p+1,r.w+2*p-2,r.h+2*p-2);g.stroke();
  g.strokeStyle='rgba(220,245,255,.65)';g.lineWidth=3;g.beginPath();g.roundRect?g.roundRect(r.x+1.5,r.y+1.5,r.w-3,r.h-3,9):g.rect(r.x+1.5,r.y+1.5,r.w-3,r.h-3);g.stroke();
  g.fillStyle=(window.TANKBG250&&TANKBG250.on)?'rgba(255,255,255,0)':'rgba(255,255,255,.10)';g.beginPath();g.moveTo(r.x+r.w*.06,r.y+3);g.lineTo(r.x+r.w*.16,r.y+3);g.lineTo(r.x+r.w*.07,r.y+r.h-3);g.lineTo(r.x+3,r.y+r.h-3);g.lineTo(r.x+3,r.y+r.h*.2);g.fill();g.restore()}};
window.__FISHTANK_DRAW=(g,f,d)=>{try{FT.frames.prop(g,f,d)}catch(e){ERR('propdraw',e)}};
/* ---- backgrounds (design size 1920 x 1080, drawn once into a 960 x 540 cache, cover-fit; back = behind the fish, front = strip in front of the fish) ---- */
const rnd=seed=>{let a=seed|0;return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
const lg=(g,y0,y1,stops)=>{const q=g.createLinearGradient(0,y0,0,y1);stops.forEach(s=>q.addColorStop(s[0],s[1]));return q};
FT.bgs=[
 {id:'sand',name:'ทรายและก้อนหิน',back(g,W,Hh){const R=rnd(11);g.fillStyle=lg(g,0,Hh,[[0,'#8ad6ea'],[.55,'#3f9ab8'],[1,'#1f5f86']]);g.fillRect(0,0,W,Hh);
   g.fillStyle='rgba(255,255,255,.07)';for(let i=0;i<9;i++){ell(g,R()*W,R()*Hh*.6,60+R()*120,14+R()*20,R()*.4);g.fill()}
   g.fillStyle=lg(g,Hh*.84,Hh,[[0,'#ecd89e'],[1,'#b8985a']]);g.beginPath();g.moveTo(0,Hh*.88);for(let x=0;x<=W;x+=40)g.lineTo(x,Hh*.86+Math.sin(x*.012)*Hh*.012);g.lineTo(W,Hh);g.lineTo(0,Hh);g.fill();
   for(const [x,y,rx,ry,c] of [[.16,.9,.07,.05,'#7b7f86'],[.24,.92,.045,.035,'#9aa0a8'],[.74,.9,.085,.055,'#6c7078'],[.84,.93,.05,.04,'#8a9098']]){g.fillStyle=c;ell(g,W*x,Hh*y,W*rx,Hh*ry);g.fill();g.fillStyle='rgba(255,255,255,.2)';ell(g,W*x-W*rx*.25,Hh*y-Hh*ry*.35,W*rx*.5,Hh*ry*.35);g.fill()}
   g.strokeStyle='#2f9a5a';g.lineWidth=5;for(const x of [.4,.43,.6]){g.beginPath();g.moveTo(W*x,Hh*.92);g.quadraticCurveTo(W*x+14,Hh*.8,W*x-4,Hh*.7);g.stroke()}},
  front(g,W,Hh){const R=rnd(12);g.fillStyle='#e2cc8c';g.beginPath();g.moveTo(0,Hh*.965);for(let x=0;x<=W;x+=30)g.lineTo(x,Hh*.955+Math.sin(x*.02)*Hh*.008);g.lineTo(W,Hh);g.lineTo(0,Hh);g.fill();for(let i=0;i<26;i++){g.fillStyle=['#b8a070','#a89060','#d8c690'][i%3];ell(g,R()*W,Hh*(.972+R()*.02),4+R()*7,3+R()*4);g.fill()}}},
 {id:'garden',name:'สวนน้ำสีเขียว',back(g,W,Hh){const R=rnd(21);g.fillStyle=lg(g,0,Hh,[[0,'#a6e8c8'],[.5,'#43b08a'],[1,'#1e6a56']]);g.fillRect(0,0,W,Hh);
   g.fillStyle='rgba(255,255,255,.06)';for(let i=0;i<8;i++){ell(g,R()*W,R()*Hh*.5,50+R()*110,12+R()*16,R()*.5);g.fill()}
   g.fillStyle=lg(g,Hh*.86,Hh,[[0,'#5a4430'],[1,'#34261a']]);g.fillRect(0,Hh*.88,W,Hh*.12);
   for(let i=0;i<16;i++){const x=W*(i+.3+R()*.4)/16,h=Hh*(.2+R()*.4);g.strokeStyle=i%2?'#2f9a5a':'#58c070';g.lineWidth=5+R()*4;g.lineCap='round';g.beginPath();g.moveTo(x,Hh*.9);g.bezierCurveTo(x-18,Hh*.9-h*.4,x+22,Hh*.9-h*.7,x+(R()-.5)*30,Hh*.9-h);g.stroke()}
   g.fillStyle='#7a8a70';for(const x of [.12,.52,.88]){ell(g,W*x,Hh*.92,W*.04,Hh*.04);g.fill()}},
  front(g,W,Hh){const R=rnd(22);for(let i=0;i<70;i++){const x=R()*W,h=Hh*(.04+R()*.05);g.strokeStyle=['#3fa04a','#5cc060','#2c8040'][i%3];g.lineWidth=3+R()*3;g.lineCap='round';g.beginPath();g.moveTo(x,Hh+2);g.quadraticCurveTo(x+(R()-.5)*20,Hh-h*.6,x+(R()-.5)*26,Hh-h);g.stroke()}}},
 {id:'deep',name:'น้ำลึกสีคราม',back(g,W,Hh){const R=rnd(31);g.fillStyle=lg(g,0,Hh,[[0,'#3a6cc0'],[.45,'#15316e'],[1,'#050d26']]);g.fillRect(0,0,W,Hh);
   g.fillStyle='rgba(120,190,255,.07)';for(let i=0;i<10;i++){ell(g,R()*W,R()*Hh*.6,40+R()*110,10+R()*18,R()*.6);g.fill()}
   g.fillStyle='#0a1634';g.beginPath();g.moveTo(0,Hh*.9);for(let x=0;x<=W;x+=50)g.lineTo(x,Hh*.88+Math.sin(x*.017+1)*Hh*.02);g.lineTo(W,Hh);g.lineTo(0,Hh);g.fill();
   for(let i=0;i<22;i++){const x=R()*W,y=Hh*(.3+R()*.55),r=2+R()*3,gr=g.createRadialGradient(x,y,0,x,y,r*5);gr.addColorStop(0,'rgba(140,240,255,.85)');gr.addColorStop(1,'rgba(80,200,255,0)');g.fillStyle=gr;ell(g,x,y,r*5,r*5);g.fill()}},
  front(g,W,Hh){g.fillStyle='#030a1c';g.beginPath();g.moveTo(0,Hh);g.lineTo(0,Hh*.93);g.lineTo(W*.07,Hh*.95);g.lineTo(W*.14,Hh*.9);g.lineTo(W*.22,Hh*.96);g.lineTo(W*.4,Hh*.975);g.lineTo(W*.62,Hh*.965);g.lineTo(W*.78,Hh*.92);g.lineTo(W*.86,Hh*.95);g.lineTo(W,Hh*.91);g.lineTo(W,Hh);g.fill()}}];
const BGC={};
function bgCache(id){let c=BGC[id];if(c&&!(window.TANKBG250&&TANKBG250.on&&!TANKBG250.ready(id)))return c;const d=FT.bgs.find(b=>b.id===id)||FT.bgs[0];const mk=fn=>{if(!fn)return null;const cv=document.createElement('canvas');cv.width=960;cv.height=540;const g=cv.getContext('2d');g.scale(.5,.5);try{fn(g,1920,1080)}catch(e){ERR('bg '+d.id,e)}return cv};return BGC[id]={back:mk(d.back),front:mk(d.front)}}
/* ---------------- save block ---------------- */
function uidF(){return 'f'+Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-3)}
function tankSave(create){const S=S0();let t=S.tank;if(!t||typeof t!=='object'||t.v!==1){if(!create&&!t)return null;t=S.tank={v:1,bg:'sand',fish:[]}}
 if(!FT.bgs.some(b=>b.id===t.bg))t.bg='sand';if(!Array.isArray(t.fish))t.fish=[];
 t.fish=t.fish.filter(f=>f&&FT.species[f.sp]).slice(0,FT.cfg.cap);for(const f of t.fish){if(typeof f.u!=='string'||!f.u)f.u=uidF();if(!f.e||typeof f.e!=='object')f.e={k:'',n:0};if(typeof f.e.n!=='number')f.e.n=0;if(typeof f.e.k!=='string')f.e.k=''}return t}
let dirty=0;function persist(now){dirty=1;if(now)flush();else if(!persist.t)persist.t=setTimeout(flush,300)}
function flush(){clearTimeout(persist.t);persist.t=0;if(!dirty)return;dirty=0;try{H.save()}catch(e){ERR('save',e)}}
addEventListener('pagehide',flush);
/* ---------------- game-time period ---------------- */
function periodNow(){let h=12;try{h=GTIME.hour()}catch(_){}const P0=FT.cfg.periods;let p=P0[2];if(h>=5&&h<11)p=P0[0];else if(h>=11&&h<19)p=P0[1];let dayMs=48*60000;try{dayMs=GTIME.cfg.dayLenMin*60000}catch(_){}const day=Math.floor(Date.now()/dayMs)-(p.id==='n'&&h<5?1:0);return {id:p.id,name:p.name,key:day+p.id,hour:h}}
FT.period=periodNow;
const hungry=(rec,key)=>rec.e.k!==key||rec.e.n<FT.cfg.perPeriod;
FT.eatenNow=rec=>{const k=periodNow().key;return rec.e.k===k?rec.e.n:0};
/* ---------------- messages ---------------- */
let toastEl=null,toastT=0;
function say(m,bad){FT.msg=m;try{if(!toastEl){toastEl=document.createElement('div');toastEl.id='ftToast';toastEl.style.cssText='position:fixed;left:50%;top:18%;transform:translateX(-50%);z-index:100000;max-width:92vw;padding:10px 18px;border-radius:12px;background:rgba(20,14,8,.94);border:1px solid #ffd98a;color:#ffe9b0;font:700 14px/1.4 "Noto Sans Thai",system-ui,sans-serif;text-align:center;box-shadow:0 6px 24px rgba(0,0,0,.6);pointer-events:none;display:none';document.body.appendChild(toastEl)}
 toastEl.textContent=m;toastEl.style.borderColor=bad?'#ff8a8a':'#b8ffd0';toastEl.style.display='block';clearTimeout(toastT);toastT=setTimeout(()=>{toastEl.style.display='none'},3200)}catch(_){}
 try{log(m,'g')}catch(_){}}
FT.say=say;
/* ---------------- one tank per house (yard + room together) ---------------- */
function tanksIn(ignoreUid){const S=S0();let n=0;for(const o of (S.placed||[]))if(o&&o.id==='fishTank'&&o.uid!==ignoreUid)n++;try{const r=S.room;if(r&&Array.isArray(r.items))for(const o of r.items)if(o&&o.id==='fishTank'&&o.uid!==ignoreUid)n++}catch(_){}return n}
const owned=()=>tanksIn(null)+((S0().storage&&S0().storage.fishTank)|0);
FT.owned=owned;
{const _c=H.canPlaceAt;H.canPlaceAt=function(x,y,a){try{if(a==='fishTank'&&tanksIn(arguments[3])>0)return FT.msgs.one}catch(e){ERR('canPlace',e)}return _c.apply(this,arguments)}}
{const _s=H.storageAdd;H.storageAdd=function(id,n,quiet){try{if(id==='fishTank'&&n>0){const give=Math.max(0,Math.min(n,1-owned()));if(give<=0){FT.stats.refused++;say(FT.msgs.one,true);return false}return _s.call(this,id,give,quiet)}}catch(e){ERR('storageAdd',e)}return _s.apply(this,arguments)}}
/* shop: refuse BEFORE the gold is taken (our wrapper must sit inside the build's own openNpc wrapper) */
function wrapShop(){try{const SW=window.__SHOPWIN;if(!SW||SW._ft)return false;SW._ft=1;const o=SW.openNpc;SW.openNpc=function(a){try{if(a&&typeof a.buy==='function'&&a.list&&a.list.some(r=>r&&r.id==='fishTank')){const b=a.buy;a.buy=function(id,price,qty){if(id==='fishTank'){if(owned()>0){FT.stats.refused++;say(FT.msgs.one,true);return 0}qty=Math.min(qty|0||1,1)}return b.call(this,id,price,qty)}}}catch(e){ERR('shop',e)}const r=o.apply(this,arguments);try{if(SW._hb&&a&&a.buy&&!a.buy._ftw&&a.list&&a.list.some(r2=>r2&&r2.id==='fishTank')){const b2=a.buy;a.buy=function(id,price,qty){if(id==='fishTank'&&owned()>0){FT.stats.refused++;say(FT.msgs.one,true);return 0}return b2.apply(this,arguments)};a.buy._ftw=1}}catch(_){}return r};return true}catch(e){ERR('wrapShop',e);return true}}
if(!wrapShop()){let n=0;const iv=setInterval(()=>{if(wrapShop()||++n>80)clearInterval(iv)},250)}
/* ---------------- fish API (r175 adds fish from the bag through addFish) ---------------- */
FT.addFish=function(sp,opt){try{if(!FT.species[sp]){FT.stats.refused++;return {ok:false,why:FT.msgs.unknown}}const t=tankSave(true);if(t.fish.length>=FT.cfg.cap){FT.stats.refused++;return {ok:false,why:FT.msgs.full}}const rec={u:uidF(),sp,e:{k:'',n:0}};if(opt&&opt.src)rec.src=String(opt.src);t.fish.push(rec);FT.stats.added++;persist();if(FT.open)spawn(rec,true);return {ok:true,rec}}catch(e){ERR('addFish',e);return {ok:false,why:'ผิดพลาด'}}};
FT.removeFish=function(u){const t=tankSave(false);if(!t)return null;const i=t.fish.findIndex(f=>f.u===u);if(i<0)return null;const r=t.fish.splice(i,1)[0];persist();FT.rt=FT.rt.filter(f=>f.rec!==r);return r};
FT.fishList=()=>{const t=tankSave(false);return t?t.fish.slice():[]};
FT.bg=()=>{const t=tankSave(false);return t?t.bg:'sand'};
FT.setBg=id=>{if(!FT.bgs.some(b=>b.id===id))return false;const t=tankSave(true);t.bg=id;persist(true);if(pick)buildPick();return true};
FT.addTestFish=function(){const sp=FT.speciesIds[Math.floor(Math.random()*FT.speciesIds.length)];const r=FT.addFish(sp,{src:'gm'});say(r.ok?'เพิ่มปลาทดสอบ: '+FT.species[sp].n:r.why,!r.ok);return r};
FT.clearFish=function(){const t=tankSave(true);t.fish=[];persist(true);FT.rt=[];FT.pellets.length=0;say('ล้างปลาในตู้แล้ว (GM)');return true};
/* ---------------- overlay ---------------- */
const css=document.createElement('style');css.textContent='#ftOv{position:fixed;inset:0;z-index:99990;display:none;background:rgba(3,6,14,.94);touch-action:none;user-select:none;-webkit-user-select:none;font:13px/1.4 "Noto Sans Thai",system-ui,sans-serif}#ftOv.in{display:block}#ftOv canvas{position:absolute;inset:0;width:100%;height:100%;display:block}#ftOv button{position:absolute;z-index:2;min-height:40px;min-width:40px;padding:0 14px;border-radius:12px;border:1px solid #ffd98a;background:rgba(40,26,12,.92);color:#ffe9b0;font:800 14px system-ui,"Noto Sans Thai",sans-serif;cursor:pointer;touch-action:manipulation}#ftOv button:active{background:#6a4210}#ftX{right:10px;top:8px;font-size:18px}#ftBgBtn{left:10px;top:8px}#ftGm{left:10px;bottom:8px;display:none}#ftGm2{left:230px;bottom:8px;display:none}#ftPick{position:absolute;z-index:3;left:10px;top:56px;display:none;gap:8px;padding:8px;border-radius:12px;background:rgba(18,12,6,.96);border:1px solid #ffd98a;max-width:calc(100vw - 20px);flex-wrap:wrap}#ftPick.in{display:flex}#ftPick .bg{position:relative;min-width:0;width:104px;padding:4px;border-radius:10px;border:2px solid #4a3a26;background:#241b12;color:#ffe9b0;text-align:center;cursor:pointer;font:700 11px "Noto Sans Thai",system-ui,sans-serif}#ftPick .bg.cur{border-color:#8dffb0}#ftPick .bg canvas{position:static;width:96px;height:54px;border-radius:6px;display:block;margin:0 auto 3px}#ftPrompt{position:fixed;left:50%;bottom:calc(250px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:7;display:none;padding:8px 18px;border-radius:999px;background:rgba(20,15,8,.9);border:1px solid #7ad0ff;color:#fff;font-size:13px;cursor:pointer;box-shadow:0 0 18px rgba(120,200,255,.45);white-space:nowrap}#ftPrompt kbd{display:inline-block;min-width:20px;padding:0 6px;margin-right:6px;border-radius:6px;background:#9fe0ff;color:#06202e;font-weight:700;text-align:center}@media (max-height:520px){#ftPrompt{bottom:calc(120px + env(safe-area-inset-bottom,0px))}}';document.head.appendChild(css);
const ov=document.createElement('div');ov.id='ftOv';ov.innerHTML='<canvas id="ftCv"></canvas><button id="ftBgBtn" type="button">🖼 ฉากหลัง</button><button id="ftX" type="button" aria-label="ปิด">✕</button><div id="ftPick"></div><button id="ftGm" type="button">🐟 GM: เพิ่มปลาทดสอบ</button><button id="ftGm2" type="button">🧹 GM: ล้างตู้</button>';document.body.appendChild(ov);
const cv=ov.querySelector('#ftCv'),g=cv.getContext('2d'),pick=ov.querySelector('#ftPick'),bgBtn=ov.querySelector('#ftBgBtn'),xBtn=ov.querySelector('#ftX'),gmB=ov.querySelector('#ftGm'),gmB2=ov.querySelector('#ftGm2');
for(const ev of ['pointerdown','mousedown','mouseup','touchstart','touchend','click','pointerup','wheel','contextmenu'])ov.addEventListener(ev,e=>{e.stopPropagation();if(ev==='contextmenu'||ev==='wheel')e.preventDefault()});
if(FT.gm){gmB.style.display='block';gmB2.style.display='block'}
gmB.addEventListener('click',()=>FT.addTestFish());gmB2.addEventListener('click',()=>FT.clearFish());
xBtn.addEventListener('click',()=>FT.close());
bgBtn.addEventListener('click',()=>{pick.classList.toggle('in');if(pick.classList.contains('in'))buildPick()});
function buildPick(){const cur=FT.bg();pick.innerHTML='';for(const b of FT.bgs){const d=document.createElement('div');d.className='bg'+(b.id===cur?' cur':'');d.dataset.id=b.id;const c=document.createElement('canvas');c.width=96;c.height=54;const q=bgCache(b.id);const x=c.getContext('2d');if(q.back)x.drawImage(q.back,0,0,96,54);if(q.front)x.drawImage(q.front,0,0,96,54);d.appendChild(c);const s=document.createElement('span');s.textContent=b.name;d.appendChild(s);d.addEventListener('click',()=>{FT.setBg(b.id);pick.classList.remove('in')});pick.appendChild(d)}}
/* geometry of the tank inside the viewport */
let RC={x:0,y:0,w:100,h:100,k:1},vw=0,vh=0,dpr=1;
function layout(){vw=innerWidth;vh=innerHeight;dpr=Math.min(2,window.devicePixelRatio||1);cv.width=Math.round(vw*dpr);cv.height=Math.round(vh*dpr);const topM=58,botM=34,sideM=26;let w=vw-2*sideM,h=vh-topM-botM;if(w/h>2)w=h*2;if(h>w*1.45)h=w*1.45;const n={x:Math.round((vw-w)/2),y:Math.round(topM+(vh-topM-botM-h)/2),w:Math.round(w),h:Math.round(h),k:Math.max(.45,Math.min(1.25,w/1100))};
 if(FT.rect&&FT.rect.w>0&&(Math.abs(n.w-FT.rect.w)>1||Math.abs(n.h-FT.rect.h)>1)){const sx=n.w/FT.rect.w,sy=n.h/FT.rect.h;for(const f of FT.rt){f.x*=sx;f.y*=sy;f.by*=sy;f.ty*=sy}for(const p of FT.pellets){p.x*=sx;p.y*=sy}for(const b of bubbles){b.x*=sx;b.y*=sy}}
 RC=n;FT.rect=n}
addEventListener('resize',()=>{if(FT.open)layout()});
/* ---------------- simulation ---------------- */
const bubbles=[];function seedBubbles(){bubbles.length=0;for(let i=0;i<16;i++)bubbles.push({x:Math.random()*RC.w,y:Math.random()*RC.h,r:1.6+Math.random()*3.2,v:14+Math.random()*26,ph:Math.random()*6.28})}
const sz=f=>FT.species[f.rec.sp];
function spawn(rec,fresh){const sp=FT.species[rec.sp],k=RC.k,L=sp.len*k;const f={rec,x:L/2+10+Math.random()*(RC.w-L-20),y:0,by:0,ty:0,tyT:0,dir:Math.random()<.5?-1:1,fx:1,ph:Math.random()*6.28,gulp:0,tg:null,turnT:4+Math.random()*10,t:Math.random()*10};f.by=f.ty=ry(sp);f.y=f.by;f.fx=f.dir;if(fresh){f.x=Math.random()<.5?L/2+8:RC.w-L/2-8;f.y=f.by=f.ty=RC.h*.1}FT.rt.push(f);return f}
function ry(sp){return RC.h*(sp.band[0]+Math.random()*(sp.band[1]-sp.band[0]))}
function openFish(){FT.rt=[];const t=tankSave(false);if(!t)return;for(const rec of t.fish)spawn(rec,false)}
function floorY(){return RC.h*FT.cfg.floor}
function tapAt(cx,cy){if(!FT.open)return false;const x=cx-RC.x,y=cy-RC.y;if(x<0||y<0||x>RC.w||y>RC.h)return false;if(FT.pellets.length>=FT.cfg.maxPellets)return false;FT.pellets.push({x,y:RC.h*FT.cfg.surface+4,rest:0,a:1,own:null,id:FT.stats.dropped+1});FT.stats.dropped++;return true}
FT.tap=(cx,cy)=>tapAt(cx,cy);
FT.tapRel=(u,v)=>tapAt(RC.x+u*RC.w,RC.y+v*RC.h);
function sim(dt,tm){const k=RC.k,per=periodNow(),PL=FT.pellets;
 /* pellets: sink, rest on the bottom, fade */
 const fy=floorY(),sink=RC.h*FT.cfg.sinkPerSec;for(const p of PL){if(p.y<fy){p.y=Math.min(fy,p.y+sink*dt);p.x+=Math.sin(tm*2+p.id)*3*dt;if(p.y>=fy)p.rest=0}else{p.rest+=dt*1000;if(p.rest>FT.cfg.restFadeMs[0])p.a=Math.max(0,1-(p.rest-FT.cfg.restFadeMs[0])/FT.cfg.restFadeMs[1])}}
 for(let i=PL.length-1;i>=0;i--)if(PL[i].a<=0)PL.splice(i,1);
 /* assign every pellet to the nearest HUNGRY fish that is not already chasing another pellet */
 for(const f of FT.rt)if(f.tg&&(PL.indexOf(f.tg)<0||!hungry(f.rec,per.key))){if(f.tg.own===f)f.tg.own=null;f.tg=null}
 for(const p of PL){if(p.own&&p.own.tg===p)continue;p.own=null;let best=null,bd=1e18;for(const f of FT.rt){if(f.tg||!hungry(f.rec,per.key))continue;const d=Math.hypot(p.x-f.x,(p.y-f.y)*1.2);if(d<bd){bd=d;best=f}}if(best){best.tg=p;p.own=best}}
 for(const f of FT.rt){const sp=sz(f),L=sp.len*k,mL=L*.46;f.t+=dt;
  if(f.gulp>0)f.gulp=Math.max(0,f.gulp-dt*3.4);
  let spd=sp.speed*k;
  if(f.tg){const p=f.tg;if((p.x-f.x)*f.dir<-mL*.25)f.dir=p.x>f.x?1:-1;const dh=(p.x-f.x)*f.dir,my=f.y,wantX=p.x-f.dir*mL*.85;let vx=wantX-f.x,vy=p.y-my;const d=Math.hypot(vx,vy);
   if(dh>mL*.15&&dh<mL*1.45&&Math.abs(p.y-my)<Math.max(9,sp.h*k*.42)){/* eat: the pellet is inside the mouth zone ahead of the fish (a wide zone, so a pellet next to the glass or right under the head is still reachable) */if(hungry(f.rec,per.key)){if(f.rec.e.k!==per.key){f.rec.e.k=per.key;f.rec.e.n=0}f.rec.e.n++;FT.stats.eaten++;f.gulp=1;persist();const i=PL.indexOf(p);if(i>=0)PL.splice(i,1);f.tg=null}}
   else{const m=Math.min(d,spd*2.6*dt);if(d>1e-6){f.x+=vx/d*m;f.y+=vy/d*m}f.by=f.y}}
  else{f.x+=f.dir*spd*dt;f.turnT-=dt;if(f.turnT<=0){f.turnT=6+Math.random()*14;if(Math.random()<.5)f.dir=-f.dir}
   f.tyT-=dt;if(f.tyT<=0){f.tyT=4+Math.random()*6;f.ty=ry(sp)}f.by+=(f.ty-f.by)*Math.min(1,dt*.45);f.y=f.by+Math.sin(f.t*1.7+f.ph)*(RC.h*.012+3)}
  const m=f.tg?6:L/2+8;if(f.x<m){f.x=m;if(f.dir<0)f.dir=1}else if(f.x>RC.w-m){f.x=RC.w-m;if(f.dir>0)f.dir=-1}
  const yt=RC.h*.1,yb=fy-3;if(f.y<yt)f.y=yt;if(f.y>yb)f.y=yb;if(f.by>yb)f.by=yb;
  f.fx+=(f.dir-f.fx)*Math.min(1,dt*7)}}
/* ---------------- drawing ---------------- */
let last=0,tmAcc=0;
function draw(tm){g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,vw,vh);const r=RC,k=r.k;
 g.save();g.beginPath();g.roundRect?g.roundRect(r.x,r.y,r.w,r.h,10):g.rect(r.x,r.y,r.w,r.h);g.clip();
 const q=bgCache(FT.bg());const cs=Math.max(r.w/960,r.h/540),bw=960*cs,bh=540*cs,bx=r.x+(r.w-bw)/2,by=r.y+(r.h-bh)/2;
 if(!(window.TANKBG250&&TANKBG250.on&&TANKBG250.draw(g,r,FT.bg()))&&q.back)g.drawImage(q.back,bx,by,bw,bh);
 /* light rays (behind the fish) */
 for(let i=0;i<((window.TANKBG250&&TANKBG250.on)?0:4);i++){const x0=r.x+r.w*(.12+i*.24)+Math.sin(tm*.25+i*1.7)*r.w*.04,w0=r.w*.05,w1=r.w*.14;const gr=g.createLinearGradient(0,r.y,0,r.y+r.h*.85);gr.addColorStop(0,'rgba(255,255,230,'+(.13+.05*Math.sin(tm*.6+i)).toFixed(3)+')');gr.addColorStop(1,'rgba(255,255,230,0)');g.fillStyle=gr;g.beginPath();g.moveTo(x0,r.y);g.lineTo(x0+w0,r.y);g.lineTo(x0+w1+r.w*.08,r.y+r.h*.85);g.lineTo(x0+r.w*.08-w1*.2,r.y+r.h*.85);g.fill()}
 /* fish (far-to-near by size so the big ones are in front) */
 const order=FT.rt.slice().sort((a,b)=>sz(a).len-sz(b).len);
 for(const f of order){const sp=sz(f),spr=FT.sprites[f.rec.sp]||FT.sprites[FT.speciesIds[0]];g.save();g.translate(r.x+f.x,r.y+f.y);const gp=1+.14*Math.sin(f.gulp*3.1416);g.scale(f.fx*k*gp,k*gp);try{spr.draw(g,f.t,sp,f)}catch(e){ERR('fishdraw',e)}g.restore()}
 /* pellets */
 for(const p of FT.pellets){g.save();g.globalAlpha=p.a;const px=r.x+p.x,py=r.y+p.y,pr=Math.max(4,4.6*k);g.fillStyle='#8a5a2a';g.beginPath();g.arc(px,py,pr,0,6.2832);g.fill();g.fillStyle='#d8a05a';g.beginPath();g.arc(px-pr*.25,py-pr*.3,pr*.5,0,6.2832);g.fill();g.restore()}
 try{if(window.__FISHEXTRA&&__FISHEXTRA.draw)__FISHEXTRA.draw(g,r,k,tm)}catch(_){}if(q.front)g.drawImage(q.front,bx,by,bw,bh);
 /* water tint, surface, bubbles */
 if(!(window.TANKBG250&&TANKBG250.on)){g.fillStyle='rgba(40,130,190,.10)';g.fillRect(r.x,r.y,r.w,r.h);
 const sy=r.y+r.h*FT.cfg.surface;const gs=g.createLinearGradient(0,r.y,0,sy+10);gs.addColorStop(0,'rgba(200,240,255,.45)');gs.addColorStop(1,'rgba(200,240,255,0)');g.fillStyle=gs;g.fillRect(r.x,r.y,r.w,sy-r.y+10);
 g.strokeStyle='rgba(235,250,255,.7)';g.lineWidth=2;g.beginPath();for(let x=0;x<=r.w;x+=8){const y=sy+Math.sin(x*.03+tm*1.6)*2;x?g.lineTo(r.x+x,y):g.moveTo(r.x,y)}g.stroke();}
 g.fillStyle='rgba(235,250,255,.55)';for(const b of bubbles){g.beginPath();g.arc(r.x+b.x+Math.sin(tm*1.4+b.ph)*5,r.y+b.y,b.r*Math.max(.7,k),0,6.2832);g.fill()}
 g.restore();
 try{FT.frames.glass(g,r)}catch(e){ERR('glass',e)}
 if(tm<7){g.save();g.globalAlpha=Math.min(1,(7-tm)/1.5)*.9;g.fillStyle='#e8f6ff';g.font='700 13px "Noto Sans Thai",system-ui,sans-serif';g.textAlign='center';g.fillText('แตะในน้ำเพื่อโยนอาหาร',vw/2,Math.min(vh-10,r.y+r.h+26));g.restore()}}
let raf=0,t0=0;
function frame(ts){if(!FT.open){raf=0;return}raf=requestAnimationFrame(frame);const t1=performance.now();if(!last)last=ts;let dt=(ts-last)/1000;last=ts;if(dt>.06)dt=.06;if(dt<=0)dt=.001;tmAcc+=dt;
 try{for(const b of bubbles){b.y-=b.v*dt*RC.k;if(b.y<RC.h*FT.cfg.surface){b.y=RC.h*FT.cfg.floor;b.x=Math.random()*RC.w}}sim(dt,tmAcc);draw(tmAcc)}catch(e){ERR('frame',e)}
 const ms=performance.now()-t1;FT.perf.n++;FT.perf.sum+=ms;if(ms>FT.perf.max)FT.perf.max=ms;FT.stats.frames++}
FT.open_=function(){if(FT.open)return true;FT.open=true;FT.stats.opens++;ov.classList.add('in');pick.classList.remove('in');layout();seedBubbles();openFish();FT.pellets.length=0;last=0;tmAcc=0;try{for(const k in keys)keys[k]=false}catch(_){}if(!raf)raf=requestAnimationFrame(frame);return true};
FT.close=function(){if(!FT.open)return false;FT.open=false;ov.classList.remove('in');pick.classList.remove('in');flush();FT.pellets.length=0;try{for(const k in keys)keys[k]=false}catch(_){}return true};
Object.defineProperty(FT,'openNow',{get:()=>FT.open});
/* the property 'open' is the state flag, the opener is FT.show() */
FT.show=function(){return FT.open_()};
cv.addEventListener('pointerdown',e=>{e.preventDefault();try{if(window.__FISHEXTRA&&__FISHEXTRA.tap&&__FISHEXTRA.tap(e.clientX,e.clientY))return}catch(_){}tapAt(e.clientX,e.clientY)});
/* ---------------- world interaction: prompt, F, tap on the tank ---------------- */
const pr=document.createElement('div');pr.id='ftPrompt';pr.innerHTML='<kbd>F</kbd>ดูตู้ปลา';document.body.appendChild(pr);
for(const ev of ['pointerdown','mousedown','touchstart'])pr.addEventListener(ev,e=>e.stopPropagation());
pr.addEventListener('click',e=>{e.stopPropagation();FT.show()});
const placedList=()=>{try{return (H.roomOn?H.roomView():S0()).placed||[]}catch(_){return[]}};
const tankObj=()=>placedList().find(o=>o&&o.id==='fishTank')||null;
FT.tankObj=tankObj;
function distTo(o){const d=IT.fishTank,Q=B.poly(d,o.x,o.y,o.f);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of Q){x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1])}const fx=P.x,fy=P.y+10,dx=Math.max(x0-fx,0,fx-x1),dy=Math.max(y0-fy,0,fy-y1);return Math.hypot(dx,dy*1.4)}
FT.nearTank=()=>{try{if(G.zone!==ZID||G.state!=='play'||!P||P.dead||H.busy||B.on||G.win||G.interact||FT.open)return null;const o=tankObj();if(!o)return null;return distTo(o)<FT.cfg.promptR?o:null}catch(_){return null}};
FT.cfg.promptR=52;FT.cfg.tapR=340;
const keyH=e=>{if(FT.open){if(e.ctrlKey||e.metaKey||e.altKey||/^F\d+$/.test(e.key))return false;if(e.key==='Escape'){if(pick.classList.contains('in'))pick.classList.remove('in');else FT.close()}e.stopImmediatePropagation();e.preventDefault();return true}
 if((e.key==='f'||e.key==='F')&&!e.repeat&&FT.nearTank()){FT.show();e.stopImmediatePropagation();e.preventDefault();return true}return false};
if(window.__EK)window.__EK.unshift(keyH);else addEventListener('keydown',e=>{keyH(e)},true);
document.addEventListener('pointerdown',e=>{try{if(FT.open||B.on||G.zone!==ZID||G.state!=='play'||G.win)return;const t=e.target;if(t.closest&&t.closest('#hBox,#hAct,#hBuildBtn,#houseDown,#houseGm,#gtGm,.mbtn,#bar,#tSkills,#swin,#hStore,#housePrompt,#houseRoomPrompt,#ftPrompt,#ftOv,#hlPick'))return;const [wx,wy]=s2w(e.clientX,e.clientY);const o=B.itemAt(wx,wy);if(o&&o.id==='fishTank'){const d=distTo(o);if(d<=FT.cfg.tapR){e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();FT.show()}else say(FT.msgs.farAway,true)}}catch(er){ERR('tap',er)}},true);
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{if(FT.open){for(const k in keys)keys[k]=false;if(G.zone!==ZID||G.state!=='play'||!tankObj())FT.close()}const n=FT.nearTank();const v=n?'block':'none';if(pr.style.display!==v)pr.style.display=v}catch(e){ERR('tick',e)}return r}}
/* GM (only with ?gm=on): add one random test fish from the house GM panel too */
if(FT.gm){let n=0;const iv=setInterval(()=>{try{const gm=document.getElementById('houseGm');if(gm&&!gm.dataset.ft){gm.dataset.ft='1';const b=document.createElement('button');b.type='button';b.textContent='🐟 GM: เพิ่มปลาทดสอบ';b.style.cssText='font-size:11px;margin:1px;padding:2px 5px';for(const ev of ['pointerdown','mousedown','touchstart'])b.addEventListener(ev,e=>e.stopPropagation());b.addEventListener('click',e=>{e.stopPropagation();FT.addTestFish()});gm.appendChild(b);clearInterval(iv)}else if(++n>60)clearInterval(iv)}catch(_){clearInterval(iv)}},1000)}
FT.ready=true;
})();

