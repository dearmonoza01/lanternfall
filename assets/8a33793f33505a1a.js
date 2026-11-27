
/* ---- r180 fishextra (TEST ONLY, coordinator Task 16, 22 Nov 2026). Base = TEST r177c. Three features on top of the r175 fishing + r174b tank modules (their public objects window.__FISHING / window.__FISHTANK are used; three exact-string patches in the build call __FISHEXTRA.draw / .tap / .cardFx):
   A) tank feeding reward (?tankreward=off): when a tank fish takes its 3rd pellet of a game-time period it drops ONE reward bubble (once per fish per period): it appears at the fish, rises about 70 px, then bobs in place until tapped (a tap on a bubble never drops a pellet); tap = pop ring + 6 sparkles + floating text. Reward by fish rarity: common 1 G + EXP of 1 ordinary mob kill at the player's level, uncommon 2 G + 2 kills, rare 4 G + 4 kills, very rare 10 G + 8 kills; shiny x2 gold and EXP; 5 % a cooking material of the Maps 1-4 monster drops; 1 % a Spirit Shard (item 'shard'). Bubbles are saved in state.tank.bub (cap 36). Bubble, four icons (gold coin / blue star / green leaf / purple crystal), pop and floating text are PORTED from Art's fish_swim_test.html (dropFrom / drawDrops / icon / pointerdown).
   B) very rare tier (?fishvr=off): rarity 'veryrare' (หายากมาก) with TWO fish: FS16 cloud dragon fish (ปลามังกรเมฆ, divine aura = demo mode 5) and FS13 gold dragon koi (ปลาคาร์ฟมังกรทอง, flower-petal VFX = demo mode 8); together 1 % of bites taken from the common share (split in FX.cfg.vrSplit 0.5/0.5, ONE config value), sell 20 G, bar zone 10 %, speed x2.0, 5 good presses, fail on the 3rd miss. Effects ported from the demo; fish BODIES stay code placeholders (Art's fish_FSxx.png are NOT wired - next task).
   C) shiny variant (?fishshiny=off): 1 % of caught fish are shiny (rolled after the species), same minigame, sells x5, own bag item and tank species ("<fish> ไชนี่"), shinyFx (twinkling gold 4-point stars) ported from the demo, in the tank and in the catch popup.
   With a flag off nothing is rolled / drawn, but bag items and tank species stay registered so saved fish and bubbles stay valid. Data driven: shiny twins are built for every non-shiny roster entry. Debug: window.__FISHEXTRA ---- */
(function(){'use strict';
const Q=String(location.search);
const FX=window.__FISHEXTRA={ver:'fishextra-r180',reward:!/[?&]tankreward=off\b/.test(Q),vr:!/[?&]fishvr=off\b/.test(Q),shiny:!/[?&]fishshiny=off\b/.test(Q),gm:/[?&]gm=on\b/.test(Q),err:null,
 cfg:{cap:36,matP:.05,shardP:.01,vrP:.01,shinyP:.01,gold:{common:1,uncommon:2,rare:4,veryrare:10},kills:{common:1,uncommon:2,rare:4,veryrare:8},shinyMul:2,sellMul:5,riseMin:70,riseRand:40},
 stats:{given:0,collected:0,capSkipped:0,mat:0,shard:0,rolls:0,vr:0,shiny:0},pops:[]};
const ERR=(w,e)=>{FX.err=w+': '+((e&&e.message)||e);try{console.error('[FISHEXTRA]',w,e)}catch(_){}};
const FS=window.__FISHING,FT=window.__FISHTANK,H=window.HOUSE;
if(!FS||!FS.cfg||!FS.ready||!FT||!FT.ready||!H){FX.err='fishing / tank module missing (flag off?)';return}
FX.ok=true;
const VR='cloudDragon',VR2='goldDragonKoi',VRS=[VR,VR2];
FX.cfg.vrSplit={cloudDragon:.5,goldDragonKoi:.5};
FS.cfg.rar.veryrare={name:'หายากมาก',col:'#ffc23a',zone:.10,speed:2.0,need:5};
FS.cfg.fish[VR]={n:'ปลามังกรเมฆ',r:'veryrare',w:0,sell:20,item:'fish_cloudDragon'};
FS.cfg.fish[VR2]={n:'ปลาคาร์ฟมังกรทอง',r:'veryrare',w:0,sell:20,item:'fish_goldDragonKoi'};
FT.species[VR]={n:'ปลามังกรเมฆ',r:'veryrare',itemId:'fish_cloudDragon',kind:'dragon',len:176,h:34,speed:42,band:[.2,.58],body:'#e8f6ff',belly:'#ffffff',fin:'#9ad0ff',mark:'#ffd870'};
FT.species[VR2]={n:'ปลาคาร์ฟมังกรทอง',r:'veryrare',itemId:'fish_goldDragonKoi',kind:'fish',len:150,h:54,speed:40,band:[.22,.6],body:'#f2b82a',belly:'#fff0a8',fin:'#e08a14',mark:'#fff6b0'};
const baseIds=Object.keys(FS.cfg.fish).filter(id=>!/_s$/.test(id));
const shinyOf=id=>id+'_s',isShiny=id=>/_s$/.test(id),baseOf=id=>id.replace(/_s$/,''),isVR=id=>VRS.indexOf(baseOf(id))>=0;
for(const id of baseIds){const f=FS.cfg.fish[id],sid=shinyOf(id);FS.cfg.fish[sid]={n:f.n+' ไชนี่',r:f.r,w:0,sell:f.sell*FX.cfg.sellMul,item:f.item+'_s',shiny:1};FT.species[sid]=Object.assign({},FT.species[id],{n:f.n+' ไชนี่',itemId:f.item+'_s',shiny:1,base:id})}
for(const id of Object.keys(FS.cfg.fish))if(FS.fishIds.indexOf(id)<0)FS.fishIds.push(id);
for(const id of Object.keys(FT.species)){FT.species[id].id=id;if(FT.speciesIds.indexOf(id)<0)FT.speciesIds.push(id);FT.species[id]._ph=FT.speciesIds.indexOf(id)*1.7}
/* ===== PORT of Art's fish_swim_test.html effects (tx = context drawn on; fish in LOCAL coords: centre 0,0, facing right, dir=1; the tank mirrors the sprite itself) ===== */
let tx=null,clock=0,dt0=0;const st={paused:false},reduce=false;
function rope(f,key,ax,ay,n,seg,wave,grav,dt,o){let R=f[key];if(!R){R=f[key]=[];for(let i=0;i<n;i++)R.push({x:ax-f.dir*i*seg,y:ay})}
 R[0].x=ax;R[0].y=ay;
 for(let i=1;i<n;i++){const q=R[i],pv=R[i-1];if(!st.paused&&!reduce){q.y+=grav*dt+Math.sin(clock*3.1+o-i*0.75)*wave*dt*i/n;q.x-=f.dir*6*dt}
  let dx=q.x-pv.x,dy=q.y-pv.y,d=Math.hypot(dx,dy)||1;q.x=pv.x+dx/d*seg;q.y=pv.y+dy/d*seg}
 return R}
function mistRope(R,r0,r1,a0){for(let i=0;i<R.length;i++){const u=i/(R.length-1),r=r0+(r1-r0)*u,q=R[i];
  const g=tx.createRadialGradient(q.x,q.y-r*.2,r*.1,q.x,q.y,r);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.6,'rgba(253,236,246,.8)');g.addColorStop(1,'rgba(240,205,235,0)');
  tx.globalAlpha=a0*(1-u)*(1-u*.3);tx.fillStyle=g;tx.beginPath();tx.arc(q.x,q.y,r,0,6.283);tx.fill()}tx.globalAlpha=1}
function star(x,y,r,a){tx.globalAlpha=a;tx.fillStyle='#ffe58a';tx.beginPath();
 for(let i=0;i<8;i++){const rr=i%2?r*.32:r,an=i*Math.PI/4;tx[i?'lineTo':'moveTo'](x+Math.cos(an)*rr,y+Math.sin(an)*rr)}tx.closePath();tx.fill();tx.globalAlpha=1}
function emit(f,every,dt,make,key){key=key||'puffs';const P=f[key]||(f[key]=[]);if(st.paused||reduce)return P;
 f[key+'t']=(f[key+'t']||0)-dt;while(f[key+'t']<=0){f[key+'t']+=every*(0.7+Math.random()*.6);P.push(make())}
 for(const q of P){q.t+=dt;q.x+=q.vx*dt;q.y+=q.vy*dt}
 while(P.length&&P[0].t>P[0].life)P.shift();return P}
function glow(x,y,r,a,c){const g=tx.createRadialGradient(x,y,r*.1,x,y,r);g.addColorStop(0,c||'rgba(255,255,255,.7)');g.addColorStop(1,'rgba(255,240,250,0)');tx.globalAlpha=a;tx.fillStyle=g;tx.beginPath();tx.arc(x,y,r,0,6.283);tx.fill();tx.globalAlpha=1}
function pearls(f,w,h,y,front){const hx=f.x+f.dir*.22*w;for(let k=0;k<5;k++){const a=clock*1.7+k*1.2566,z=Math.cos(a);if((z>0)!==front)continue;
  const px=hx+Math.sin(a)*.3*w,py=y-.05*h+Math.cos(a)*.16*h+Math.sin(a*2)*4,r=5.5+z*1.5;
  tx.fillStyle='#3c1406';tx.beginPath();tx.arc(px,py,r+1.6,0,6.283);tx.fill();
  const g=tx.createRadialGradient(px-r*.3,py-r*.3,1,px,py,r);g.addColorStop(0,'#ffffff');g.addColorStop(1,k%2?'#ffd9f0':'#bfeaff');tx.fillStyle=g;tx.beginPath();tx.arc(px,py,r,0,6.283);tx.fill()}}
function spark(x,y,r,a){if(r<.6||a<=0)return;tx.globalAlpha=a;
 for(const[k,c]of[[1,'#ffd34d'],[.55,'#fffbe6']]){tx.fillStyle=c;tx.beginPath();
  for(let i=0;i<8;i++){const rr=(i%2?.26:1)*r*k*(i%4===0?1:(i%2?1:.62)),an=i*Math.PI/4;tx[i?'lineTo':'moveTo'](x+Math.cos(an)*rr,y+Math.sin(an)*rr)}tx.closePath();tx.fill()}tx.globalAlpha=1}
function shinyFx(f,w,h,y,dt){
 const S=f.sh||(f.sh=Array.from({length:12},()=>({t:Math.random()*1.4,life:0})));
 for(const q of S){if(!st.paused&&!reduce)q.t+=dt;
  if(q.t>=q.life){const an=Math.random()*6.283,k=.75+Math.random()*.45;q.ox=Math.cos(an)*.5*k;q.oy=Math.sin(an)*.6*k;q.r=8+Math.random()*10;q.life=.7+Math.random()*.9;q.t=reduce?q.life*.5:0}
  const u=q.t/q.life,e=Math.sin(u*3.1416);
  spark(f.x+q.ox*w,y+q.oy*h-u*5,q.r*(.35+.65*e),Math.min(1,e*1.4))}}
function twinkle(f,w,h,y,n,key,spread){const S=f[key]||(f[key]=Array.from({length:n},()=>({t:9,life:0})));
 for(const q of S){if(!st.paused&&!reduce)q.t+=dt0;
  if(q.t>=q.life){q.ox=(Math.random()-.5)*.8*spread;q.oy=(Math.random()-.5)*.6*spread;q.r=7+Math.random()*9;q.life=.6+Math.random()*.8;q.t=reduce?q.life*.5:0}
  const e=Math.sin(q.t/q.life*3.1416);spark(f.x+q.ox*w,y+q.oy*h,q.r*(.35+.65*e),Math.min(1,e*1.4))}}
function pet(x,yy,r,rot,a,c){tx.save();tx.translate(x,yy);tx.rotate(rot);tx.scale(1,.55+.45*Math.cos(rot*1.3));tx.globalAlpha=a;
 for(const[k,col]of[[1.22,'#8a3d06'],[1,c?'#ffd24a':'#ffb7c9'],[.5,c?'#fff6c8':'#fff0f4']]){tx.fillStyle=col;tx.beginPath();tx.moveTo(-r*k,0);tx.quadraticCurveTo(0,-r*.9*k,r*k,0);tx.quadraticCurveTo(0,r*.9*k,-r*k,0);tx.fill()}
 tx.restore();tx.globalAlpha=1}
function petals(f,w,h,y,dt,front){const d=f.dir;
 if(!front){const P=emit(f,.035,dt,()=>({x:f.x+d*(Math.random()-.55)*.9*w,y:y+(Math.random()-.5)*.9*h,r:6+Math.random()*6,t:0,life:1.8+Math.random(),vx:-d*(16+Math.random()*26),vy:-8+Math.random()*22,sp:2+Math.random()*4,o:Math.random()*6,c:Math.random()<.5}));
  for(const q of P){const u=q.t/q.life;pet(q.x+Math.sin(q.t*3+q.o)*6,q.y,q.r,q.t*q.sp+q.o,Math.min(1,u*6)*(1-u),q.c)}}
 for(let k=0;k<9;k++){const a=clock*1.5+k*.698,z=Math.cos(a);if((z>0)!==front)continue;
  pet(f.x+Math.sin(a)*.5*w,y+Math.cos(a)*.3*h+Math.sin(a*2+k)*.2*h,9+z*2.5,a*2+k,1,k%2===0)}}
function koiBack(f,w,h,y,dt){dt0=dt;const pu=.8+.2*Math.sin(clock*2);glow(f.x,y,h*.95,.5*pu,'rgba(255,205,150,.8)');petals(f,w,h,y,dt,false)}
function koiFront(f,w,h,y,dt){petals(f,w,h,y,dt,true);twinkle(f,w,h,y,7,'ks',1)}
function vfxBack(f,w,h,y,dt){const d=f.dir,ax=f.x-d*0.02*w,ay=y-0.20*h;
 const hx=f.x+d*.22*w,hy=y-.12*h,pu=.75+.25*Math.sin(clock*2.4);
 glow(hx,hy,h*1.05,.6*pu,'rgba(255,236,160,.85)');
 tx.save();tx.translate(hx,hy);tx.rotate(clock*.5);for(let i=0;i<12;i++){tx.rotate(6.283/12);tx.globalAlpha=.55*pu;tx.fillStyle='#ffe58a';tx.beginPath();tx.moveTo(h*.5,-3);tx.lineTo(h*(.74+.08*(i%2)),0);tx.lineTo(h*.5,3);tx.closePath();tx.fill()}tx.restore();
 for(const[lw,c]of[[7,'#3c1406'],[4,'#ffd45c']]){tx.globalAlpha=1;tx.strokeStyle=c;tx.lineWidth=lw;tx.beginPath();tx.ellipse(hx,hy,h*.46,h*.46,0,0,6.283);tx.stroke()}
 mistRope(rope(f,'m1',ax,ay-4,18,9,28,-8,dt,0),17,6,.9);mistRope(rope(f,'m2',ax-d*8,ay+8,14,9,24,-3,dt,2),13,5,.75);
 const S=emit(f,.05,dt,()=>({x:f.x-d*Math.random()*.5*w,y:y+(Math.random()-.5)*.8*h,r:3+Math.random()*5,t:0,life:1.1+Math.random()*.8,vx:-d*(10+Math.random()*20),vy:-6+Math.random()*4}),'p2');
 for(const q of S){const u=q.t/q.life;star(q.x,q.y,q.r*(.6+.4*Math.sin(u*10)),Math.sin(u*3.1416))}
 pearls(f,w,h,y,false)}
function vfxFront(f,w,h,y,dt){pearls(f,w,h,y,true)}
function fxState(p,t){const S=p&&typeof p==='object'?(p._fx||(p._fx={x:0,dir:1})):{x:0,dir:1};const prev=S._t;S._t=t;clock=t;return {S,dt:prev==null?.016:Math.max(0,Math.min(.05,t-prev))}}
function dragonBody(g,t,sp){
 const L=sp.len,Hh=sp.h;g.save();g.lineJoin='round';g.lineCap='round';const n=22,pts=[];for(let i=0;i<=n;i++){const x=L*.5-L*i/n;pts.push([x,Math.sin(i*.5-t*4.2)*Hh*.34*(.25+i/n*.75)])}
 for(const [w,c] of [[Hh*1.0,'#9ac8ee'],[Hh*.8,sp.body],[Hh*.36,sp.belly]]){g.strokeStyle=c;g.lineWidth=w;g.beginPath();pts.forEach((p,i)=>{i?g.lineTo(p[0],p[1]+(w<Hh*.5?Hh*.14:0)):g.moveTo(p[0],p[1])});g.stroke()}
 g.strokeStyle=sp.mark;g.lineWidth=2.4;for(const s of [-1,1]){g.beginPath();g.moveTo(L*.5+3,s*3);g.quadraticCurveTo(L*.5+22,s*14+Math.sin(t*3+s)*3,L*.5+12,s*24);g.stroke()}
 g.fillStyle=sp.mark;g.beginPath();g.moveTo(L*.44,-Hh*.4);g.lineTo(L*.4,-Hh*.95);g.lineTo(L*.34,-Hh*.4);g.fill();g.beginPath();g.moveTo(L*.36,-Hh*.4);g.lineTo(L*.31,-Hh*.85);g.lineTo(L*.27,-Hh*.4);g.fill();
 g.fillStyle='#fff';g.beginPath();g.ellipse(L*.45,-Hh*.12,Hh*.15,Hh*.15,0,0,6.2832);g.fill();g.fillStyle='#d02030';g.beginPath();g.ellipse(L*.46,-Hh*.12,Hh*.075,Hh*.075,0,0,6.2832);g.fill();
 const tp=pts[n];g.fillStyle='#bfe0ff';g.beginPath();g.moveTo(tp[0],tp[1]);g.quadraticCurveTo(tp[0]-Hh*.9,tp[1]-Hh*.8,tp[0]-Hh*1.5,tp[1]-Hh*.3);g.quadraticCurveTo(tp[0]-Hh*.9,tp[1],tp[0]-Hh*1.5,tp[1]+Hh*.5);g.quadraticCurveTo(tp[0]-Hh*.8,tp[1]+Hh*.6,tp[0],tp[1]);g.fill();g.restore()}
const baseDefault=(FT.sprites.pondCarp||FT.sprites[FT.speciesIds[0]]).draw;
function koiBody(g,t,sp,p){try{baseDefault(g,t,sp,p)}catch(_){}g.save();g.strokeStyle='#ffe27a';g.lineWidth=2;g.lineCap='round';for(const s of [-1,1]){g.beginPath();g.moveTo(sp.len*.5,s*3);g.quadraticCurveTo(sp.len*.5+14,s*11+Math.sin(t*3+s)*2,sp.len*.5+8,s*19);g.stroke()}g.fillStyle='#ffd24a';g.beginPath();g.moveTo(sp.len*.3,-sp.h*.5);g.lineTo(sp.len*.26,-sp.h*.9);g.lineTo(sp.len*.2,-sp.h*.5);g.fill();g.restore()}
const effSize=sp=>({w:sp.len,h:Math.max(sp.h*1.45,sp.len*.44)});
function drawCloud(g,t,sp,p){const {S,dt}=fxState(p,t),z=effSize(sp);if(FX.vr){tx=g;vfxBack(S,z.w,z.h,0,dt)}if(!(window.FISHART268&&FISHART268.body&&FISHART268.body(g,t,sp,p)))dragonBody(g,t,sp);if(FX.vr){tx=g;vfxFront(S,z.w,z.h,0,dt)}}
function drawKoi(g,t,sp,p){const {S,dt}=fxState(p,t),z=effSize(sp);if(FX.vr){tx=g;koiBack(S,z.w,z.h,0,dt)}if(!(window.FISHART268&&FISHART268.body&&FISHART268.body(g,t,sp,p)))koiBody(g,t,sp,p);if(FX.vr){tx=g;koiFront(S,z.w,z.h,0,dt)}}
FT.sprites[VR]={draw:drawCloud};FT.sprites[VR2]={draw:drawKoi};FX.shinyOver=function(g,t,b,p){if(!FX.shiny)return;const z=effSize(b);const S=(p&&typeof p==='object')?(p._sh||(p._sh={x:0,dir:1})):{x:0,dir:1};const prev=S._t;S._t=t;const dt=prev==null?.016:Math.max(0,Math.min(.05,t-prev));tx=g;clock=t;shinyFx(S,z.w,Math.max(b.h*1.3,z.h*.6),0,dt)};
for(const id of baseIds){if(VRS.indexOf(id)>=0)continue;const base=FT.sprites[id]||FT.sprites[FT.speciesIds[0]];
 FT.sprites[shinyOf(id)]={draw(g,t,sp,p){const b=FT.species[id];try{base.draw(g,t,b,p)}catch(_){}if(FX.shiny){const z=effSize(b);const S=(p&&typeof p==='object')?(p._sh||(p._sh={x:0,dir:1})):{x:0,dir:1};const prev=S._t;S._t=t;const dt=prev==null?.016:Math.max(0,Math.min(.05,t-prev));tx=g;clock=t;shinyFx(S,z.w,Math.max(b.h*1.3,z.h*.6),0,dt)}}}}
for(const id of VRS){const base=FT.sprites[id];FT.sprites[shinyOf(id)]={draw(g,t,sp,p){const b=FT.species[id];try{base.draw(g,t,b,p)}catch(_){}if(FX.shiny){const z=effSize(b);const S=(p&&typeof p==='object')?(p._sh||(p._sh={x:0,dir:1})):{x:0,dir:1};const prev=S._t;S._t=t;const dt=prev==null?.016:Math.max(0,Math.min(.05,t-prev));tx=g;clock=t;shinyFx(S,z.w,Math.max(b.h*1.3,z.h*.6),0,dt)}}}}
/* ---------------- bag items ---------------- */
function icon(id){return g=>{try{const sp=FT.species[id],spr=FT.sprites[id];g.save();g.translate(32,32);if(sp&&spr){const k=Math.min(46/sp.len,40/(sp.h*1.5),1.4);g.scale(k,k);spr.draw(g,.4,sp,{})}g.restore()}catch(_){}}}
function regItems(){try{if(typeof ITEMS==='undefined')return false;for(const id of Object.keys(FS.cfg.fish)){const f=FS.cfg.fish[id];if(!(isShiny(id)||isVR(id)))continue;ITEMS[f.item]=Object.assign(ITEMS[f.item]||{},{n:f.n,d:'ปลา'+(isShiny(id)?'ไชนี่ (พิเศษ) ':'')+'('+FS.cfg.rar[f.r].name+') · ขายได้ที่ร้านค้า หรือใส่ตู้ปลา',k:'mat',col:isShiny(id)?'#ffd84a':'#ffc23a',icon:icon(id),price:0,sell:f.sell,stall:1});ITEMS[f.item].sell=f.sell}return true}catch(e){ERR('items',e);return false}}
regItems();setTimeout(regItems,1500);setTimeout(regItems,6000);
/* ---------------- roll ---------------- */
const rollO=FS.roll;
FS.roll=function(h,rnd){let id=rollO.apply(this,arguments);try{const R=rnd||Math.random;FX.stats.rolls++;
  if(FX.vr&&id&&FS.cfg.fish[id]&&FS.cfg.fish[id].r==='common'){const t=FS.table(h);let tot=0,cs=0;for(const k of FS.fishIds){tot+=t[k]||0;if(FS.cfg.fish[k].r==='common'&&!isShiny(k))cs+=t[k]||0}const share=tot?cs/tot:0;if(share>0&&R()<FX.cfg.vrP/share){const q=R(),a=FX.cfg.vrSplit[VR]/(FX.cfg.vrSplit[VR]+FX.cfg.vrSplit[VR2]);id=q<a?VR:VR2;FX.stats.vr++}}
  if(FX.shiny&&id&&!isShiny(id)&&R()<FX.cfg.shinyP){id=shinyOf(id);FX.stats.shiny++}}catch(e){ERR('roll',e)}return id};
/* ---------------- reward bubbles (ported from Art's dropFrom / drawDrops / icon / pointerdown) ---------------- */
const S0=()=>H.state();
function tankObj(){const t=S0().tank;if(!t||typeof t!=='object')return null;if(!Array.isArray(t.bub))t.bub=[];return t}
let saveT=0;const persist=()=>{if(saveT)return;saveT=setTimeout(()=>{saveT=0;try{H.save()}catch(e){ERR('save',e)}},300)};
const uid=()=>'b'+Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-3);
const RC=()=>FT.rect||{x:0,y:0,w:100,h:100,k:1};
FX.bubbles=()=>{const t=tankObj();return t?t.bub.slice():[]};
function cookMats(){try{return Object.entries(COOK.mats).filter(([id,m])=>/ดรอปจาก/.test((m&&m.d)||'')).map(a=>a[0])}catch(_){return[]}}
function mkBubble(rec,f){const t=tankObj();if(!t)return null;if(t.bub.length>=FX.cfg.cap){FX.stats.capSkipped++;return null}
 const sp=rec.sp,fd=FS.cfg.fish[sp]||{},R=RC(),k=R.k||1;const u=Math.max(.06,Math.min(.94,(f?f.x:R.w/2)/R.w)),y0=f?f.y:R.h*.4;
 const ty=Math.max(70*k,y0-(FX.cfg.riseMin+Math.random()*FX.cfg.riseRand)*k);
 const b={id:uid(),sp,sh:isShiny(sp)?1:0,r:fd.r||'common',u,v0:y0/R.h,v:ty/R.h,ph:Math.random()*6.28,t0:performance.now(),k:Math.random()<.5?'g':'x'};
 const T=(FX.cfg.tier&&FX.cfg.tier[b.r])||{};if(T.mode==='either')b.only=b.k;if(Math.random()<(T.mat!=null?T.mat:FX.cfg.matP)){const m=cookMats();if(m.length){b.mat=m[Math.floor(Math.random()*m.length)];b.matN=T.matN||1;b.k='i'}}
 if(Math.random()<(T.shard!=null?T.shard:FX.cfg.shardP)&&typeof ITEMS!=='undefined'&&ITEMS.shard){b.shard=1;b.k='s'}
 t.bub.push(b);FX.stats.given++;persist();return b}
/* EXP of one ordinary kill at the player's level = makeEnemy('slime',P.lvl).expBase x lvExpMul(e); fallback legacy 10+L^1.85 (killEnemy_v3). Paid through gainExp(). */
FX.killExp=function(lv){lv=lv||P.lvl||1;try{const e=makeEnemy('slime',lv,0,0);let m=1;try{m=lvExpMul(e)}catch(_){}return Math.round((e.expBase!=null?e.expBase:10+Math.pow(lv,1.85))*m)}catch(_){return Math.round(10+Math.pow(lv,1.85))}};
FX.rewardOf=function(b){const r=b.r||'common',mul=b.sh?FX.cfg.shinyMul:1,T=(FX.cfg.tier&&FX.cfg.tier[r])||{gold:FX.cfg.gold[r]||1,kills:FX.cfg.kills[r]||1};let g=(T.gold||1)*mul,e=FX.killExp()*(T.kills||1)*mul;if(b.only==='g')e=0;else if(b.only==='x')g=0;return{gold:g,exp:e}};
function bpos(b,r,k,tm){const age=Math.max(0,(performance.now()-(b.t0||0))/1000),y0=b.v0!=null?b.v0:b.v,ty=b.v*r.h,ys=y0*r.h,y=ty+(ys-ty)*Math.exp(-2.2*age);return{age,x:r.x+b.u*r.w+Math.sin(tm*1.6+b.ph)*5*k,y:r.y+y+Math.sin(tm*2.3+b.ph)*4*k,R:24*k*Math.min(1,.45+age*3)}}
function icon4(g,kind,x,y,r){g.lineJoin='round';
 if(kind==='g'){for(const[rr,c]of[[r,'#8a3d06'],[r*.85,'#ffc83a'],[r*.62,'#ffe27a']]){g.fillStyle=c;g.beginPath();g.arc(x,y,rr,0,6.283);g.fill()}
  g.fillStyle='#a85a0a';g.font='bold '+(r*1.05)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('G',x,y+1)}
 if(kind==='x'){for(const[rr,c]of[[r*1.1,'#1d3f8a'],[r*.88,'#5fb4ff'],[r*.45,'#d9f0ff']]){g.fillStyle=c;g.beginPath();for(let i=0;i<10;i++){const q=i%2?rr*.48:rr,an=-1.5708+i*.6283;g[i?'lineTo':'moveTo'](x+Math.cos(an)*q,y+Math.sin(an)*q)}g.closePath();g.fill()}}
 if(kind==='i'){g.save();g.translate(x,y);g.rotate(-.5);for(const[kk,c]of[[1.15,'#1f5a1a'],[1,'#6fce4f'],[.5,'#c4f29a']]){g.fillStyle=c;g.beginPath();g.moveTo(-r*kk,0);g.quadraticCurveTo(0,-r*.95*kk,r*kk,0);g.quadraticCurveTo(0,r*.95*kk,-r*kk,0);g.fill()}g.strokeStyle='#1f5a1a';g.lineWidth=1.6;g.beginPath();g.moveTo(-r,0);g.lineTo(r*.8,0);g.stroke();g.restore()}
 if(kind==='s'){for(const[kk,c]of[[1.15,'#3b1a78'],[1,'#b07cff'],[.5,'#efe0ff']]){g.fillStyle=c;g.beginPath();g.moveTo(x,y-r*1.15*kk);g.lineTo(x+r*.8*kk,y);g.lineTo(x,y+r*1.15*kk);g.lineTo(x-r*.8*kk,y);g.closePath();g.fill()}}}
const BR=FX.bubbleArt={img:null,draw(g,bx,by,R,tm,b){
  if(BR.img&&BR.img.complete&&BR.img.naturalWidth){g.drawImage(BR.img,bx-R*1.2,by-R*1.2,R*2.4,R*2.4);return}
  tx=g;const o=b.ph||0;
  if(b.k==='s'||b.k==='i')glow(bx,by,R*2,.5+.2*Math.sin(tm*4+o),b.k==='s'?'rgba(200,160,255,.9)':'rgba(190,255,160,.9)');
  const gr=g.createRadialGradient(bx-R*.3,by-R*.35,R*.1,bx,by,R);gr.addColorStop(0,'rgba(255,255,255,.55)');gr.addColorStop(.75,'rgba(210,245,255,.22)');gr.addColorStop(1,'rgba(255,255,255,.75)');
  g.fillStyle=gr;g.beginPath();g.arc(bx,by,R,0,6.283);g.fill();g.strokeStyle='rgba(255,255,255,.95)';g.lineWidth=2.2;g.beginPath();g.arc(bx,by,R,0,6.283);g.stroke();
  icon4(g,b.k||'g',bx,by,R*.56);
  g.strokeStyle='rgba(255,255,255,.95)';g.lineWidth=3;g.lineCap='round';g.beginPath();g.arc(bx,by,R*.74,3.6,4.5);g.stroke()},
 setImage(src){const im=new Image();im.src=src;BR.img=im}};
FX.collect=function(id){try{const t=tankObj();if(!t)return null;const i=t.bub.findIndex(b=>b.id===id);if(i<0)return null;const b=t.bub.splice(i,1)[0];persist();const rw=FX.rewardOf(b);const R=RC(),pp=bpos(b,R,R.k||1,performance.now()/1000);
  P.gold=(P.gold|0)+rw.gold;const lv0=P.lvl;try{gainExp(rw.exp)}catch(e){ERR('exp',e)}
  const lines=[];if(rw.gold)lines.push(['+'+rw.gold+' G','#ffd95a']);if(rw.exp)lines.push(['+'+rw.exp+' EXP','#8fd0ff']);
  if(b.mat){try{if(addItem({id:b.mat,q:b.matN||1})!==false){FX.stats.mat++;lines.push(['วัตถุดิบ +'+(b.matN||1)+' · '+((COOK.mats[b.mat]&&COOK.mats[b.mat].n)||b.mat),'#b8f08a'])}}catch(e){ERR('mat',e)}}
  if(b.shard){try{if(addItem({id:'shard',q:1})!==false){FX.stats.shard++;lines.push(['ผลึกวิญญาณ +1','#d9b8ff'])}}catch(e){ERR('shard',e)}}
  FX.pops.push({x:pp.x,y:pp.y,t:performance.now(),o:Math.random()*6,lines});FX.stats.collected++;try{if(G.win==='wInv')renderInv()}catch(_){}
  FX.lastCollect={gold:rw.gold,exp:rw.exp,mat:b.mat||null,shard:!!b.shard,lvl0:lv0};return FX.lastCollect}catch(e){ERR('collect',e);return null}};
const lastN=new Map();
function poll(){if(!FX.reward||!FT.open)return;let per;try{per=FT.period()}catch(_){return}
 for(const f of FT.rt){const rec=f.rec,n=rec.e&&rec.e.k===per.key?rec.e.n:0,prev=lastN.get(rec);lastN.set(rec,n);
  if(prev===undefined)continue;
  if(prev<FT.cfg.perPeriod&&n>=FT.cfg.perPeriod&&rec.rw!==per.key&&!(window.__F184&&__F184.noReward&&__F184.noReward(rec))){rec.rw=per.key;mkBubble(rec,f);persist()}}}
FX.draw=function(g,r,k,tm){try{poll();if(!FX.reward)return;const t=tankObj();const now=performance.now();
  if(t&&t.bub.length)for(const b of t.bub){const p=bpos(b,r,k,tm);BR.draw(g,p.x,p.y,p.R,tm,b)}
  for(let i=FX.pops.length-1;i>=0;i--){const p=FX.pops[i],uT=(now-p.t)/1500,u=Math.min(1,(now-p.t)/800);if(uT>=1){FX.pops.splice(i,1);continue}
   g.save();tx=g;g.globalAlpha=1-u;g.strokeStyle='#fff';g.lineWidth=3*(1-u);g.beginPath();g.arc(p.x,p.y,24*k+u*26*k,0,6.283);g.stroke();g.globalAlpha=1;
   for(let j=0;j<6;j++){const an=j*1.047+p.o;spark(p.x+Math.cos(an)*(20+u*38)*k,p.y+Math.sin(an)*(20+u*38)*k,9*k*(1-u),1-u)}
   g.globalAlpha=uT<.45?1:Math.max(0,1-(uT-.45)/.55);g.font='900 '+Math.round(30*Math.max(.85,k))+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=7;g.lineJoin='round';g.strokeStyle='#140800';
   p.lines.forEach((ln,li)=>{const yy=Math.max(p.y,r.y+(p.lines.length+.6)*34*k+40)-20-Math.min(1,uT*1.6)*36-li*34*k;g.strokeText(ln[0],p.x,yy);g.fillStyle=ln[1];g.fillText(ln[0],p.x,yy)});g.restore()}}catch(e){ERR('draw',e)}};
FX.tap=function(cx,cy){try{if(!FX.reward||!FT.open)return false;const t=tankObj();if(!t||!t.bub.length)return false;const r=RC(),k=r.k||1,tm=performance.now()/1000;let best=null,bd=1e9;
  for(const b of t.bub){const p=bpos(b,r,k,tm),d=Math.hypot(cx-p.x,cy-p.y);if(d<38*Math.max(.8,k)&&d<bd){bd=d;best=b}}
  if(!best)return false;FX.collect(best.id);return true}catch(e){ERR('tap',e);return false}};
FX.cardFx=function(sp,card){try{if(!(isShiny(sp)||isVR(sp)))return;const cvs=card.querySelector('canvas');if(!cvs)return;const t0=performance.now(),state={};(function loop(){if(card.style.display==='none'||!cvs.isConnected)return;try{const g=cvs.getContext('2d');g.clearRect(0,0,64,64);g.save();g.translate(32,32);const s=FT.species[sp],k=Math.min(46/s.len,40/(s.h*1.5),1.4);g.scale(k,k);FT.sprites[sp].draw(g,(performance.now()-t0)/1000,s,state);g.restore()}catch(_){}requestAnimationFrame(loop)})()}catch(e){ERR('cardFx',e)}};
FX.giveBag=id=>{const f=FS.cfg.fish[id];if(!f)return false;try{return addItem({id:f.item,q:1})!==false}catch(_){return false}};
FX.toTank=id=>{if(!FX.giveBag(id))return {ok:false,why:'bag'};return FS.tankPut(id)};
FX.simulate=function(n,h,rnd){const o={n:0,byRar:{},byFish:{},shiny:0};for(let i=0;i<n;i++){const id=FS.roll(h,rnd),f=FS.cfg.fish[id];o.n++;o.byFish[id]=(o.byFish[id]|0)+1;o.byRar[f.r]=(o.byRar[f.r]|0)+1;if(isShiny(id))o.shiny++}return o};
FX.mkBubble=mkBubble;
if(FX.gm){let n=0;const iv=setInterval(()=>{try{const ov=document.getElementById('ftOv');if(ov&&!ov.dataset.fx){ov.dataset.fx='1';const mk=(txt,left,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=txt;b.style.cssText='position:absolute;z-index:2;left:'+left+'px;bottom:52px;min-height:36px;padding:0 10px;border-radius:10px;border:1px solid #ffd98a;background:rgba(40,26,12,.92);color:#ffe9b0;font:800 12px system-ui,"Noto Sans Thai",sans-serif;cursor:pointer';b.addEventListener('click',e=>{e.stopPropagation();fn()});ov.appendChild(b)};mk('🐉 GM: ปลามังกรเมฆ',10,()=>FX.toTank(VR));mk('🐲 GM: ปลาคาร์ฟมังกรทอง',150,()=>FX.toTank(VR2));mk('✨ GM: ปลาไชนี่',330,()=>FX.toTank(shinyOf(FT.speciesIds.filter(i=>!isShiny(i)&&!isVR(i))[Math.floor(Math.random()*8)])));mk('🫧 GM: ฟองรางวัล',470,()=>{const l=FT.fishList()[0];const rec=l&&FT.rt.find(f=>f.rec===l);if(l)mkBubble(l,rec)});clearInterval(iv)}else if(++n>80)clearInterval(iv)}catch(_){clearInterval(iv)}},1000)}
FX.ready=true;
})();

