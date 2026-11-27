
/* ---- p336 (TEST map10edit r2, on top of map10mon r5) = p335 + 3 changes (2 Nov):
   a) DeaRz: "เช็คม้อนเตอร์ใหม่ทุกตัวทำไมหันหลังเดินตาม" -> Map 10 monsters now turn to the player again after their first attack
      (engine left e.wind < 0 after a strike, and its chase step only turns the monster when !e.wind). ?mobface=off = old.
   b) DeaRz "ใช้ตามนี้ได้เลย" (2 Nov 06:32): his exported prop layout (26 moved, 13 deleted) is now the map's own data. ?m10bake=off = r1 layout.
   c) DeaRz: "เพิ่มม้อนเตอร์ขึ้น 2 เท่าด้วยนะ" -> Map 10 monster counts x2 (21 -> 42), zone spread 200 -> 140 px.
*/
/* ---- p335 (TEST, on top of map10mon r5): Map 10 waterwheel turns as a whole + Map 10 prop edit mode.
   DeaRz 1 Nov: "หมุนทั้งล้อไม่ได้หรอ มันหมุนแค่ซีกเดียว" and "ทำ edit พร้อพแมพให้หน่อยนะ ทั้ง เพิ่ม และ ลบด้วย".
   1) Waterwheel: before, only the front face turned and the drum (back rim + paddles) was the still picture. Now the whole wheel turns:
      front face turns in its plane, back rim = the same face set back along the axle (darker), 16 paddles (a board cut from the approved
      wheel picture) go round between the two rims, hub + axle stub stay still. The wheel + water ripples follow the mill when it is moved.
      ?m10wheel=off = old wheel.
   2) Prop edit mode for Map 10 (like the Map 2/3 one, p305): button "✏️ แก้พร็อพแมพ 10" (right side, under the quest box) while in Map 10. The game pauses, WASD / arrows move
      the camera. Click = select, drag = move, ◀▲▼▶ nudge (Shift 10 px), 🗑 ลบ (or Delete key) removes the selected prop (old or new),
      palette (Map 10 art + Map 1-4 props, search box, preview) + "วางกลางจอ" adds a new prop at the screen centre.
      💾 บันทึก keeps moves / deletes / adds in this browser (localStorage 'lf_map10_props_v1', applied every time Map 10 loads);
      ⬇ ส่งออก JSON for merging into the game file later. Collision follows each piece (Map 10 pieces + fences now carry their own collision
      instead of one fixed list). Not movable: bridges, the ford stones, river/bank collision, the closed east gate barrier.
      Never writes the player save. ?m10edit=off removes the button. Debug window.__M10ED
   3) Map 10 monsters in the map (DeaRz 1 Nov 19:08 approved all 6, "ส่งเข้าแมพ 10 ได้เลย"): the p334 Studio records now also draw in the game.
      Numbers from balance/approved/BALANCE_map10_monsters_v1.md: Z1 Bog Toad x6 Lv36-37, Z2 Pinecone Squirrel x3 Lv37, Z3 Meadow Ram x5 Lv37-38
      + Buzzbee x3 Lv38, Z4 empty, Z5 Strawman x2 Lv38-39 + Gloomcrow x2 Lv39 (21). HP/ATK/DEF/EXP = the engine's ordinary row x species mult,
      ATK x (1 + .045(L-30)). Respawn 50-80 s each, a cleared zone 90-120 s, Strawman x1.5. Not near arrival A, the mill, gate E or the hero.
      Buzzbee = Lightning (live element system); poison / undead / dark wait for the v2 element table. Behaviour: Bog Toad attack interval x1.3
      + poison on hit (15 % of the hit over 3 s, not in god mode / not in Safe Zone maps), Meadow Ram charge (wind-up >= 0.5 s, then a 150 px
      dash), evasion x1.3 squirrel / x1.5 bee / x1.2 crow, toad / ram / strawman / crow attack on sight, squirrel + bee answer as a pack, sight = aggro/0.7, leash 420 (squirrel 480: past it the mob calms, heals, walks home). ?m10mobs=off = no monsters; ?bogtoad=off etc. = that type neither drawn nor spawned.
      Debug window.__M10MOBS ---- */
(function(){'use strict';
const PLANK='assets/6ffab7e3f04717b6.webp';
/* whole-wheel turn (p335): the approved wheel picture is used in parts. Front face (rim + spokes) turns in its own plane; the back rim is the
   same face, darker, set back along the axle (-237,-48 px in the picture); the paddles between the two rims are a board cut from the picture
   and go round the drum; rim thickness = a few copies of the rim ring. Hub + axle stub stay still. */
function M10Wheel(a,im,plank){
  const S=a.gw/1254,CX=756,CY=641,RX=392,RY=540,KX=RX/RY,HX=780,HY=620,DX=-237,DY=-48,NP=16,RP=.86,PW=.15*RY,PT=.045*RY,RIN=.85,Q=2;
  const W=Math.ceil(2*RX*S*Q)+4,H=Math.ceil(2*RY*S*Q)+4,mk=()=>{const c=document.createElement('canvas');c.width=W;c.height=H;return c;};
  const F=mk(),FD=mk(),R=mk(),RD=mk(),dl=Math.hypot(DX,DY),ux=DX/dl,uy=DY/dl;
  const STUB=[[880,628],[958,622],[992,648],[992,720],[940,732],[880,722]];
  // the turning face must not carry the axle stub round: under the stub, put the face turned by 60 deg (12 spokes, so the spokes line up)
  const CL=document.createElement('canvas');CL.width=im.naturalWidth||im.width;CL.height=im.naturalHeight||im.height;
  {const g=CL.getContext('2d'),k=CL.width/1254;g.drawImage(im,0,0,CL.width,CL.height);g.save();g.scale(k,k);g.beginPath();STUB.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.clip();
    g.clearRect(0,0,1254,1254);g.translate(CX,CY);g.scale(KX,1);g.rotate(-Math.PI/3);g.scale(1/KX,1);g.drawImage(im,-CX,-CY,1254,1254);g.restore();
    g.save();g.scale(k,k);g.beginPath();g.ellipse(HX,HY+10,100,133,0,0,6.2832);g.clip();g.clearRect(0,0,1254,1254);g.restore();}   // hub: still copy on top, hole here
  function bake(ang){
    let g=F.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);g.save();g.translate(W/2,H/2);g.scale(Q,Q);
    g.beginPath();g.ellipse(0,0,RX*S,RY*S,0,0,6.2832);g.clip();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
    g.scale(KX,1);g.rotate(ang);g.scale(1/KX,1);g.drawImage(CL,-CX*S,-CY*S,a.gw,a.gh);g.restore();
    g=R.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);g.drawImage(F,0,0);g.globalCompositeOperation='destination-out';
    g.beginPath();g.ellipse(W/2,H/2,RX*S*Q*RIN,RY*S*Q*RIN,0,0,6.2832);g.fill();g.globalCompositeOperation='source-over';
    for(const [src,dst,al] of [[F,FD,.55],[R,RD,.42]]){g=dst.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);g.globalCompositeOperation='source-over';g.drawImage(src,0,0);
      g.globalCompositeOperation='source-atop';g.fillStyle=`rgba(22,12,4,${al})`;g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';}
  }
  const put=(c,cv,x,y)=>c.drawImage(cv,x-W/2/Q,y-H/2/Q,W/Q,H/Q);
  function draw(c,hx,hy,ang){
    bake(ang);const fx=hx+(CX-HX)*S,fy=hy+(CY-HY)*S,dx=DX*S,dy=DY*S;
    c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
    put(c,FD,fx+dx,fy+dy);                                   // back face (seen through the drum)
    for(const k of [.92,.88])put(c,RD,fx+dx*k,fy+dy*k);      // back rim thickness
    // paddles: sorted far side first; outer face shown where it faces the viewer (normal along the axle's screen direction)
    const pl=[];for(let i=0;i<NP;i++){const p=ang+i*6.2832/NP,cs=Math.cos(p),sn=Math.sin(p);pl.push({cs,sn,fa:cs*ux+sn*uy});}
    pl.sort((p,q)=>p.fa-q.fa);
    for(const p of pl){const {cs,sn,fa}=p;
      const ox=fx+RX*RP*cs*S,oy=fy+RY*RP*sn*S,wx=-KX*sn*PW*S,wy=cs*PW*S,nx=KX*cs*PT*S,ny=sn*PT*S;
      const bx=ox+dx*.9-wx/2,by=oy+dy*.9-wy/2,ex=-dx*.8,ey=-dy*.8;   // board from back rim to front rim
      const sh=fa>0?.12+.25*(1-fa):.55;
      // board edge (thickness), then the board face
      c.save();c.fillStyle='rgba(40,22,8,1)';c.beginPath();
      const e0=fa>0?[nx,ny]:[-nx,-ny];
      c.moveTo(bx,by);c.lineTo(bx+ex,by+ey);c.lineTo(bx+ex+e0[0],by+ey+e0[1]);c.lineTo(bx+e0[0],by+e0[1]);c.closePath();c.fill();c.restore();
      c.save();c.transform(ex/plank.width,ey/plank.width,wx/plank.height,wy/plank.height,bx,by);c.drawImage(plank,0,0);c.restore();
      c.save();c.beginPath();c.moveTo(bx,by);c.lineTo(bx+ex,by+ey);c.lineTo(bx+ex+wx,by+ey+wy);c.lineTo(bx+wx,by+wy);c.closePath();
      c.fillStyle=`rgba(20,10,2,${sh})`;c.fill();c.strokeStyle='rgba(28,14,4,.9)';c.lineWidth=.7;c.stroke();c.restore();}
    for(const k of [.07,.035])put(c,RD,fx+dx*k,fy+dy*k);   // front rim thickness
    put(c,F,fx,fy);                                          // front face, turned
    // hub + axle stub: still
    c.save();c.beginPath();c.ellipse(hx,hy+10*S,110*S,144*S,0,0,6.2832);STUB.forEach(([x,y],i)=>{const X=hx+(x-HX)*S,Y=hy+(y-HY)*S;i?c.lineTo(X,Y):c.moveTo(X,Y);});c.closePath();
    c.clip('nonzero');c.drawImage(im,hx-HX*S,hy-HY*S,a.gw,a.gh);c.restore();
    c.restore();
  }
  return {draw,W,H};
}
const M10=window.__M10,A=window.__M10_ART,D=window.__M10_DATA,A4=window.__M4T_ART;
if(!M10||!A||!D||typeof PROP_DEFS==='undefined'||!PROP_DEFS.m10_a_mill)return;
const ID=M10.id,E=window.__M10ED={ver:'p336',on:false,sel:null,drag:null,hover:null,dirty:false,col:true,err:[],applied:0,confirm:null,st:{pos:{},del:[],add:[]},solSplit:null,wheel:0};
const now=()=>(typeof time==='number'?time:performance.now()/1000);
const T=.866,TAU2=6.283185;
/* ================= 1) waterwheel ================= */
const MILL0=(D.newp.find(n=>n[0]==='a_mill')||[0,2136,1300]).slice(1),HOFF=[D.hub[0]-MILL0[0],D.hub[1]-MILL0[1]],ROFF=[D.race[0]-MILL0[0],D.race[1]-MILL0[1]];
const IM={};const ld=(k,src)=>{if(!IM[k]){const i=new Image();i.decoding='async';i.src=src;IM[k]=i;}const i=IM[k];return i.complete&&i.naturalWidth?i:null;};
const img4=k=>{const a=A4&&A4[k];return a&&a.src?ld('m4:'+k,a.src):null;};
let WH=null;
function stillMill(c,p){const a=A.a_mill,im=ld('a_mill',a.src);if(!im)return;
  const cx=p.x-a.fx+a.gw/2,b=!!P&&Math.abs(P.x-cx)<a.gw*1.05*.42&&P.y<p.y-6&&P.y>p.y-a.gh/T*.95;p.m10al=(p.m10al==null?1:p.m10al)+((b?.55:1)-(p.m10al==null?1:p.m10al))*.15;
  c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';if(p.m10al<1)c.globalAlpha*=p.m10al;c.drawImage(im,p.x-a.fx,p.y-a.fy,a.gw,a.gh);c.restore();return p.m10al;}
function wheelAt(c,p,al){const a=A.a_wheel,im=ld('a_wheel',a.src),pl=ld('plank',PLANK);if(!im||!pl)return;
  if(!WH)WH=M10Wheel(a,im,pl);const hx=p.x+HOFF[0],hy=p.y+HOFF[1];
  c.save();if(al<1)c.globalAlpha*=al;
  {const r=img4('ring-foam-thick')||img4('ring-thin');if(r){const rx=p.x+ROFF[0],ry=p.y+ROFF[1]-8;for(let i=0;i<2;i++){const k=(now()*.5+i*.5)%1;c.save();c.globalAlpha*=.45*(1-k);const w=70+k*60;c.drawImage(r,rx-w/2,ry-w*.22,w,w*.44);c.restore();}}}
  WH.draw(c,hx,hy,(now()*.3)%TAU2);c.restore();E.wheel++;M10.stats.wheel++;}
if(!/[?&]m10wheel=off/.test(location.search))PROP_DEFS.m10_a_mill.live=(c,p)=>{const al=stillMill(c,p);if(al!=null)wheelAt(c,p,al);};
/* ================= 2) collision per piece ================= */
// Map 10 pieces + fences carry their own discs (so they move with the piece); m10Solid keeps only the rest (banks, edges, gate barrier)
const FW={'fence-straight':196,'fence-broken-left':87,'fence-broken-right':79};
const fenceSol=k=>{const w=FW[k],o=[];for(let xx=6;xx<w-5;xx+=13)o.push({dx:xx,dy:-5,r:9});return o;};
for(const k in FW){const b=PROP_DEFS['m4W_'+k];if(b)PROP_DEFS['m10W_'+k]=Object.assign({},b,{n:'Map 10 fence '+k,cat:'m10test',solid:fenceSol(k)});}
(function split(){try{
  const rh=v=>{const f=Math.floor(v);return Math.abs(v-f-.5)<1e-7?(f%2===0?f:f+1):Math.round(v);};   // the map file was built with Python's round (half to even)
  const want=new Map(),key=(x,y,r)=>rh(x)+','+rh(y)+','+(+r),bump=k=>want.set(k,(want.get(k)||0)+1);
  for(const [k,x,y] of D.newp)for(const [dx,dy,r] of (A[k].solid||[]))bump(key(x+dx,y+dy,r));
  for(const [k,x0,y] of D.fences){const w=FW[k.slice(4)];for(let xx=Math.trunc(x0)+6;xx<Math.trunc(x0+w)-5;xx+=13)bump(key(xx,y-5,9));}
  let need=0;for(const v of want.values())need+=v;const rest=[];let got=0;
  for(const s of D.solids){const k=key(s[0],s[1],s[2]),n=want.get(k);if(n){want.set(k,n-1);got++;}else rest.push(s);}
  E.solSplit={need,got,rest:rest.length,all:D.solids.length};
  if(got!==need){E.err.push('solid split '+got+'/'+need);return;}
  for(const k in A){const d=PROP_DEFS['m10_'+k];if(d&&(A[k].solid||[]).length)d.solid=A[k].solid.map(([dx,dy,r])=>({dx,dy,r}));}
  PROP_DEFS.m10Solid.solid=rest.map(([x,y,r])=>({dx:x,dy:y,r}));E.solSplit.ok=1;
}catch(e){E.err.push('split '+e.message);}})();
/* ================= 3) edit mode ================= */
const KEY='lf_map10_props_v1';
const NOED=t=>/^(m10Dbg|m10Solid|edgeBlock|m4L1_|m4L2_|m4Rf_|w22ds\d)/.test(t);
const kOf=q=>q.t+'|'+Math.round(q.x)+'|'+Math.round(q.y);
const editable=q=>q&&(q.__ek||q.__add)&&PROP_DEFS[q.t]&&!NOED(q.t);
const moved=q=>!q.__add&&(Math.round(q.x)!==q.__eo[0]||Math.round(q.y)!==q.__eo[1]);
const mk=(t,x,y)=>({t,x:Math.round(x),y:Math.round(y),s:1,v:0,f:1,ph:Math.random()*TAU2,edge:1,nc:0,m4:1});
function ldSt(){try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&typeof s==='object')return {pos:s.pos&&typeof s.pos==='object'?s.pos:{},del:Array.isArray(s.del)?s.del:[],add:Array.isArray(s.add)?s.add.filter(a=>a&&PROP_DEFS[a.t]):[]};}catch(_){}return {pos:{},del:[],add:[]};}
E.st=ldSt();
let addN=0;
/* r2: DeaRz's approved layout (approved/maps/map10/map10_props_edit_DEARZ_20261102.json, "ใช้ตามนี้ได้เลย" 2 Nov) baked in as the map's own data:
   applied before the editor keys each piece, so the baked spot is the piece's new original. ?m10bake=off = the r1 layout */
const BAKE={mv:[["svChPine",830,440,624,217],["svChPine",967,251,801,221],["svChPine",1241,393,932,281],["svChPine",1515,275,1555,285],["svChPine",1652,346,2007,419],["m4CG_svChCG4",2820,1262,2768,1156],["svChPine",2960,1366,2919,1239],["svChWmBarrelM1",1900,1360,1991,1279],["svChWmSackTiedM1",1925,1395,1983,1294],["svChWmSackOpenM1",1958,1408,1976,1317],["svChPine",3070,1362,3075,1328],["m10_w_wall",3064,1418,2949,1334],["m10_w_wallcap",2602,1418,2992,1343],["m10_w_wall",2766,1418,2619,1366],["m10_w_wallbrk",2901,1418,2749,1395],["svChWmBarrelM1",2700,1240,2634,1397],["svChCR2_bank",1200,1750,1200,1749],["m10_f_bale1",2885,2150,3116,2005],["m10_f_scarecrow",2700,2080,2698,2080],["m4CG_svChCG4",2699,2274,2699,2275],["m10_f_stack1",2520,2310,2435,2295],["m10_f_barrow",2960,2300,2814,2299],["m10_f_fenceb1",2880,2665,2958,2701],["m10_f_fenceb1",2540,1975,3162,2747],["m10_f_trough",2925,2765,2943,2802],["m4CG_svChCG5",2992,2790,3019,2816]],del:[["svChWmCrateM1",2655,1215],["svChWmSackTiedM1",2650,1262],["svChWmCrateM1",2600,1200],["svChPine",1926,488],["svChPine",1993,369],["svChPine",1789,417],["svChPine",1582,416],["svChPine",1445,345],["svChPine",1034,392],["svChPine",1104,322],["svChPine",897,321],["svChPine",760,250],["svChPine",1308,274]]};
const BKOFF=/[?&]m10bake=off/.test(location.search);E.bake={moved:0,deleted:0,miss:[]};
function applyTo(r){E.applied=0;const del=new Set(E.st.del),out=[];
  const bm=new Map(),bd=new Map();if(!BKOFF){for(const m of BAKE.mv){const k=m[0]+'|'+m[1]+'|'+m[2];(bm.get(k)||bm.set(k,[]).get(k)).push([m[3],m[4]]);}for(const x of BAKE.del){const k=x.join('|');bd.set(k,(bd.get(k)||0)+1);}}
  E.bake={moved:0,deleted:0,miss:[]};
  for(const q of r){if(!q||typeof q.t!=='string'){out.push(q);continue;}
    if(/^m4W_fence/.test(q.t)&&PROP_DEFS['m10W_'+q.t.slice(4)])q.t='m10W_'+q.t.slice(4);
    if(NOED(q.t)){out.push(q);continue;}
    {const k0=kOf(q);if(bd.get(k0)){bd.set(k0,bd.get(k0)-1);E.bake.deleted++;continue;}const L=bm.get(k0);if(L&&L.length){const p=L.shift();q.x=p[0];q.y=p[1];E.bake.moved++;}}
    q.__ek=kOf(q);q.__eo=[Math.round(q.x),Math.round(q.y)];
    if(del.has(q.__ek)){E.applied++;continue;}
    const o=E.st.pos[q.__ek];if(o){q.x=o[0];q.y=o[1];E.applied++;}out.push(q);}
  for(const a of E.st.add){const q=mk(a.t,a.x,a.y);q.__add=++addN;out.push(q);E.applied++;}
  for(const [k,L] of bm)if(L.length)E.bake.miss.push('mv '+k);for(const [k,n] of bd)if(n>0)E.bake.miss.push('del '+k);
  out.sort((a,b)=>a.y-b.y);return out;}
const EDOFF=/[?&]m10edit=off/.test(location.search);if(EDOFF)E.st={pos:{},del:[],add:[]};
{const oL=loadPropsFor;loadPropsFor=function(zid){const r=oL.apply(this,arguments);if(zid!==ID||!Array.isArray(r))return r;try{return applyTo(r);}catch(e){E.err.push('load '+e.message);return r;}};}
/* palette */
const GROUPS=[['m10','Map 10 (ภาพใหม่)',k=>/^m10(_|W_)/.test(k)],['sv','Map 1–2',k=>PROP_DEFS[k].cat==='sylvalab'],['m3','Map 3',k=>PROP_DEFS[k].cat==='m3art'||(PROP_DEFS[k].cat==='w22'&&!/^w22ds\d/.test(k))],['m4','Map 4',k=>PROP_DEFS[k].cat==='m4test'&&!/^(m4L1_|m4L2_|m4Rf_|m4Water)/.test(k)]];
let PAL=null;const pal=()=>{if(PAL)return PAL;PAL=[];for(const [g,gn,f] of GROUPS)for(const k of Object.keys(PROP_DEFS)){const d=PROP_DEFS[k];if(!d||NOED(k)||!f(k)||d.cat==='hidden')continue;if(d.w>1400||d.h>1400)continue;PAL.push({k,g,n:(d.n||k)+''});}return PAL;};
/* UI */
const css=document.createElement('style');css.textContent=`
#m10EdBtn{position:fixed;right:calc(14px + env(safe-area-inset-right,0px));top:calc(168px + env(safe-area-inset-top,0px));z-index:57;min-height:40px;padding:4px 10px;border-radius:12px;border:1px solid rgba(255,214,120,.7);background:rgba(36,26,8,.88);color:#ffe7a8;font:700 13px sans-serif;cursor:pointer}
#m10EdBtn.on{background:#ffcf5a;color:#2a1c00}
#m10EdPanel{position:fixed;right:calc(12px + env(safe-area-inset-right,0px));top:calc(70px + env(safe-area-inset-top,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:58;width:min(300px,calc(100vw - 24px));padding:10px 12px;border-radius:12px;border:1px solid rgba(255,214,120,.6);background:rgba(18,14,6,.93);color:#f5ecd6;font:13px/1.45 sans-serif;display:flex;flex-direction:column;gap:7px;overflow:auto}
#m10EdPanel b{color:#ffd77a}
#m10EdPanel .r{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
#m10EdPanel button{padding:5px 9px;border-radius:8px;border:1px solid rgba(255,214,120,.5);background:rgba(60,44,12,.9);color:#ffeec4;font:700 12px sans-serif;cursor:pointer}
#m10EdPanel button.del{border-color:rgba(255,120,110,.7);background:rgba(90,24,18,.9);color:#ffd2c8}
#m10EdPanel button:disabled{opacity:.4;cursor:default}
#m10EdPanel .mut{color:#c9bc9a;font-size:12px}
#m10EdPanel select,#m10EdPanel input[type=search]{width:100%;box-sizing:border-box;background:#0c0904;color:#f5ecd6;border:1px solid #6b5520;border-radius:6px;font:12px sans-serif;padding:4px}
#m10EdPanel select[size]{height:150px}
#m10EdPrev{width:100%;height:96px;background:#3d5a2c;border-radius:6px}
#m10EdPanel textarea{width:100%;height:90px;font:11px monospace;background:#0c0904;color:#f5ecd6;border:1px solid #6b5520;border-radius:6px;box-sizing:border-box}`;
document.head.appendChild(css);
const btn=document.createElement('button');btn.id='m10EdBtn';btn.hidden=true;btn.textContent='✏️ แก้พร็อพแมพ 10';
const pan=document.createElement('div');pan.id='m10EdPanel';pan.hidden=true;
pan.innerHTML=`<div><b>แก้พร็อพแมพ 10</b> <span id="m10EdSt" class="mut"></span></div>
<div class="mut">คลิกเลือก · ลากเพื่อย้าย · WASD/ลูกศร เลื่อนกล้อง · Delete = ลบ · เกมหยุดระหว่างแก้</div>
<div id="m10EdSel" class="mut">ยังไม่ได้เลือก</div>
<div class="r"><button data-n="-1,0">◀</button><button data-n="0,-1">▲</button><button data-n="0,1">▼</button><button data-n="1,0">▶</button><span class="mut">Shift = 10</span></div>
<div class="r"><button data-a="del" class="del">🗑 ลบชิ้นนี้</button><button data-a="reset1">↺ คืนชิ้นนี้</button></div>
<div><b>เพิ่มพร็อพ</b></div>
<select id="m10EdGrp"></select>
<input id="m10EdQ" type="search" placeholder="ค้นหาชื่อ เช่น bale, tree, fence">
<select id="m10EdList" size="8"></select>
<canvas id="m10EdPrev" width="280" height="96"></canvas>
<div class="r"><button data-a="add">＋ วางกลางจอ</button><span id="m10EdPick" class="mut"></span></div>
<div class="r"><button data-a="save">💾 บันทึก</button><button data-a="export">⬇ ส่งออก JSON</button></div>
<div class="r"><button data-a="resetAll">↺ คืนทั้งแมพ</button><label class="mut"><input type="checkbox" id="m10EdCol" checked> แสดงกันชน</label></div>
<div class="r"><button data-a="close">ปิดโหมดแก้</button></div>
<textarea id="m10EdOut" hidden readonly></textarea>`;
const mount=()=>{if(!document.body){setTimeout(mount,200);return;}document.body.appendChild(btn);document.body.appendChild(pan);};mount();
const $$=s=>pan.querySelector(s);
const esc=s=>String(s).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
function counts(){let mv=0,ad=0;for(const q of PROPS){if(!editable(q))continue;if(q.__add)ad++;else if(moved(q))mv++;}return {mv,ad};}
function ui(msg){if(!E.on)return;const s=E.sel;
  $$('#m10EdSel').innerHTML=s?`<b>${esc(PROP_DEFS[s.t].n||s.t)}</b><br>x ${Math.round(s.x)}, y ${Math.round(s.y)}${s.__add?' · ชิ้นใหม่':' · เดิม '+s.__eo[0]+', '+s.__eo[1]}`:'ยังไม่ได้เลือก';
  const c=counts();$$('#m10EdSt').innerHTML=(E.dirty?'<span style="color:#ffb35a">● ยังไม่บันทึก</span>':'บันทึกแล้ว')+` · ย้าย ${c.mv} · เพิ่ม ${c.ad} · ลบ ${E.pendDel.size}`+(msg?'<br>'+msg:'');
  for(const b of pan.querySelectorAll('[data-n],[data-a="del"],[data-a="reset1"]'))b.disabled=!s;if(s&&s.__add)$$('[data-a="reset1"]').disabled=true;}
E.pendDel=new Set(E.st.del);
function mark(){E.dirty=true;try{buildSolids();}catch(e){E.err.push('solids '+e.message);}try{PROPS.sort((a,b)=>a.y-b.y);}catch(_){}ui();}
function fillGroups(){const g=$$('#m10EdGrp');if(g.options.length)return;for(const [k,n] of GROUPS){const o=document.createElement('option');o.value=k;o.textContent=n+' ('+pal().filter(p=>p.g===k).length+')';g.appendChild(o);}fillList();}
function fillList(){const g=$$('#m10EdGrp').value,q=$$('#m10EdQ').value.trim().toLowerCase(),L=$$('#m10EdList');L.innerHTML='';let n=0;
  for(const p of pal()){if(p.g!==g)continue;if(q&&p.k.toLowerCase().indexOf(q)<0&&p.n.toLowerCase().indexOf(q)<0)continue;const o=document.createElement('option');o.value=p.k;o.textContent=p.n.replace(/^Map 10 /,'');o.title=p.k;L.appendChild(o);if(++n>=400)break;}
  if(L.options.length){L.selectedIndex=0;}prev();}
function prev(){const t=$$('#m10EdList').value,cv2=$$('#m10EdPrev'),g=cv2.getContext('2d');g.clearRect(0,0,cv2.width,cv2.height);$$('#m10EdPick').textContent=t?'':'ไม่พบ';E.pick=t||null;if(!t)return;
  const d=PROP_DEFS[t];if(!d)return;const sc=Math.min((cv2.width-10)/d.w,(cv2.height-8)/d.h,1.4);const q=mk(t,0,0);q.__prev=1;
  g.save();try{g.translate(cv2.width/2-(d.w/2-d.ax)*sc,cv2.height-4-(d.h-d.ay)*sc);g.scale(sc,sc);
    if(!d.liveOnly&&typeof propSprite==='function'){const c=propSprite(t,0);if(c)g.drawImage(c,-d.ax,-d.ay,d.w,d.h);}if(d.live)d.live(g,q,1,now());}catch(e){}g.restore();
  setTimeout(()=>{if(E.pick===t&&!E.prevAgain){E.prevAgain=1;prev();E.prevAgain=0;}},400);}
function setOn(on){if(on===E.on)return;
  if(on){if(G.zone!==ID||G.state!=='play'||G.edit)return;try{if(G.auto)toggleAuto();}catch(_){}try{closeWin();}catch(_){}E.on=true;G.edit=true;E.sel=null;pan.hidden=false;btn.classList.add('on');fillGroups();ui();}
  else{E.on=false;if(!(typeof ED!=='undefined'&&ED.on))G.edit=false;E.sel=E.drag=E.hover=null;pan.hidden=true;btn.classList.remove('on');$$('#m10EdOut').hidden=true;}}
btn.addEventListener('click',()=>setOn(!E.on));
function stateNow(){const pos={},add=[];for(const q of PROPS){if(!editable(q))continue;if(q.__add)add.push({t:q.t,x:Math.round(q.x),y:Math.round(q.y)});else if(moved(q))pos[q.__ek]=[Math.round(q.x),Math.round(q.y)];}
  return {pos,del:[...E.pendDel],add};}
function save(){const s=stateNow();E.st=s;try{localStorage.setItem(KEY,JSON.stringify({ver:1,map:ID,saved:new Date().toISOString(),...s}));E.dirty=false;ui(`บันทึกแล้ว (ย้าย ${Object.keys(s.pos).length} · เพิ่ม ${s.add.length} · ลบ ${s.del.length})`);}catch(e){ui('บันทึกไม่ได้: '+esc(e.message));}}
function exportJson(){const s=stateNow(),mv=[],dl=[];for(const q of PROPS)if(editable(q)&&moved(q))mv.push({t:q.t,name:PROP_DEFS[q.t].n||'',from:q.__eo,to:[Math.round(q.x),Math.round(q.y)]});
  for(const k of s.del){const [t,x,y]=k.split('|');dl.push({t,at:[+x,+y]});}
  const txt=JSON.stringify({map:'Map 10 '+ID,build:'TEST map10edit r2 (on map10mon r5)',exported:new Date().toISOString(),moved:mv,deleted:dl,added:s.add.map(a=>({t:a.t,name:PROP_DEFS[a.t].n||'',at:[a.x,a.y]}))},null,1);E.lastExport=txt;
  try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'application/json'}));a.download='map10_props_'+new Date().toISOString().slice(0,16).replace(/[-:T]/g,'')+'.json';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},2000);}catch(_){}
  const o=$$('#m10EdOut');o.value=txt;o.hidden=false;ui(`ส่งออกแล้ว (ย้าย ${mv.length} · เพิ่ม ${s.add.length} · ลบ ${dl.length}) ถ้าไม่มีไฟล์ดาวน์โหลด ให้คัดลอกข้อความในกล่อง`);}
function twice(b,fn){if(E.confirm===b){E.confirm=null;fn();return;}E.confirm=b;const t=b.textContent;b.textContent='กดอีกครั้งเพื่อยืนยัน';setTimeout(()=>{if(E.confirm===b)E.confirm=null;b.textContent=t;},3000);}
function delSel(){const q=E.sel;if(!q||!editable(q))return;const i=PROPS.indexOf(q);if(i>=0)PROPS.splice(i,1);if(!q.__add)E.pendDel.add(q.__ek);E.sel=null;E.hover=null;mark();ui('ลบแล้ว (กดบันทึกเพื่อเก็บ)');}
function addPick(){const t=E.pick;if(!t||!PROP_DEFS[t])return;const q=mk(t,cam.x+VW/2,cam.y+VH/2);q.__add=++addN;PROPS.push(q);E.sel=q;mark();ui('วางแล้วกลางจอ ลากไปที่ที่ต้องการ');}
function reload(st){E.st=st;E.pendDel=new Set(st.del);const fresh=loadPropsFor(ID);PROPS.length=0;for(const q of fresh)PROPS.push(q);E.sel=E.hover=null;try{buildSolids();}catch(_){}}
pan.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.n&&E.sel){const [dx,dy]=b.dataset.n.split(',').map(Number),k=e.shiftKey?10:1;E.sel.x+=dx*k;E.sel.y+=dy*k;mark();return;}
  const a=b.dataset.a;
  if(a==='save')save();else if(a==='export')exportJson();else if(a==='del')delSel();else if(a==='add')addPick();
  else if(a==='reset1'&&E.sel&&!E.sel.__add){E.sel.x=E.sel.__eo[0];E.sel.y=E.sel.__eo[1];mark();}
  else if(a==='resetAll')twice(b,()=>{reload({pos:{},del:[],add:[]});E.dirty=true;ui('คืนทั้งแมพแล้ว (กดบันทึกเพื่อเก็บ)');});
  else if(a==='close'){if(E.dirty)twice(b,()=>{E.dirty=false;reload(ldSt());setOn(false);});else setOn(false);}});
$$('#m10EdCol').addEventListener('change',e=>{E.col=e.target.checked;});
$$('#m10EdGrp').addEventListener('change',fillList);$$('#m10EdQ').addEventListener('input',fillList);$$('#m10EdList').addEventListener('change',prev);
$$('#m10EdList').addEventListener('dblclick',addPick);
for(const t of ['keydown','keyup'])pan.addEventListener(t,e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))e.stopPropagation();});
window.addEventListener('keydown',e=>{if(!E.on||/INPUT|SELECT|TEXTAREA/.test((e.target&&e.target.tagName)||''))return;if((e.key==='Delete'||e.key==='Backspace')&&E.sel){e.preventDefault();e.stopImmediatePropagation();delSel();}},true);
/* picking + dragging */
function pick(wx,wy){let best=null,by=-1e9;for(const q of PROPS){if(!editable(q))continue;const b=propBounds(q);if(wx<b.x||wx>b.x+b.w||wy<b.y||wy>b.y+b.h)continue;
  const cx=b.x+b.w/2,cy=b.y+b.h*.55,nx=(wx-cx)/(b.w*.5),ny=(wy-cy)/(b.h*.55);if(nx*nx+ny*ny>1.05)continue;const g=PROP_DEFS[q.t].layer==='ground'?-5000:0;if(q.y+g>by){by=q.y+g;best=q;}}return best;}
const onCv=e=>e.target===cv;
window.addEventListener('pointerdown',e=>{if(!E.on||!onCv(e))return;e.stopImmediatePropagation();e.preventDefault();
  const wx=mwx(e.clientX,e.clientY),wy=mwy(e.clientX,e.clientY),q=pick(wx,wy);E.sel=q;E.drag=q?{dx:q.x-wx,dy:q.y-wy,moved:false}:null;
  try{cv.setPointerCapture(e.pointerId);}catch(_){}ui();},true);
window.addEventListener('pointermove',e=>{if(!E.on)return;const wx=mwx(e.clientX,e.clientY),wy=mwy(e.clientX,e.clientY);
  if(E.drag&&E.sel){e.stopImmediatePropagation();E.sel.x=Math.round(wx+E.drag.dx);E.sel.y=Math.round(wy+E.drag.dy);E.drag.moved=true;}
  else if(onCv(e))E.hover=pick(wx,wy);},true);
window.addEventListener('pointerup',e=>{if(!E.on)return;if(E.drag){e.stopImmediatePropagation();if(E.drag.moved)mark();E.drag=null;}},true);
for(const t of ['click','mousedown','contextmenu','touchstart'])window.addEventListener(t,e=>{if(E.on&&onCv(e)){e.stopImmediatePropagation();if(t!=='touchstart')e.preventDefault();}},{capture:true,passive:false});
/* overlay */
{const o=drawEditorOverlay;drawEditorOverlay=function(){const r=o.apply(this,arguments);if(!E.on)return r;
  try{ctx.save();
    if(E.col){ctx.strokeStyle='rgba(255,70,90,.85)';ctx.lineWidth=2;const vx=cam.x-100,vy=cam.y-100,vw=VW+200,vh=VH+200;
      for(const o of SOLIDS){if(o.x<vx||o.x>vx+vw||o.y<vy||o.y>vy+vh)continue;ctx.beginPath();ctx.arc(o.x,o.y,o.r,0,TAU2);ctx.stroke();}}
    const box=(q,col,dash)=>{const b=propBounds(q);ctx.setLineDash(dash?[8,6]:[]);ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.strokeRect(b.x,b.y,b.w,b.h);ctx.setLineDash([]);ctx.fillStyle=col;ctx.beginPath();ctx.arc(q.x,q.y,5,0,TAU2);ctx.fill();};
    if(E.hover&&E.hover!==E.sel&&PROPS.indexOf(E.hover)>=0)box(E.hover,'rgba(150,255,200,.75)',true);
    if(E.sel){box(E.sel,'#ffc94a',false);if(E.drag&&E.drag.moved)ui();}
    ctx.restore();}catch(e){if(E.err.length<20)E.err.push('draw '+e.message);}return r;};}
setInterval(()=>{try{const inM=G.zone===ID&&G.state==='play';btn.hidden=!inM||EDOFF;if(E.on&&!inM)setOn(false);}catch(_){}},400);
E.setOn=setOn;E.save=save;E.exportJson=exportJson;E.pick=null;E.pickAt=pick;E.addPick=addPick;E.delSel=delSel;E.pal=pal;E.reload=reload;E.mark=mark;
})();

/* ================= 4) Map 10 monsters spawn (DeaRz 1 Nov 19:08 "อนุมัติทั้งหมด ให้ Code ส่งเข้าแมพ 10 ได้เลย") ================= */
(function(){'use strict';
if(/[?&]m10mobs=off/.test(location.search))return;
const M10=window.__M10,D=window.__M10_DATA,REG=window.MON_SPRITES,NM=window.__M10MON;if(!M10||!D||typeof MOBS==='undefined'||typeof makeEnemy!=='function')return;
const ID=M10.id,S=window.__M10MOBS={ok:false,err:[],spawned:{},cap:null};
// the 6 records were Studio only (p334): same MOBS values, and their sprites now draw outside the Studio too
const DEF={bogtoad:{n:'Bog Toad',sh:'brute',c:'#7a8a3a',c2:'#e8d9a8',sp:52,x:['brute','poison']},gloomcrow:{n:'Gloomcrow',sh:'brute',c:'#3a2f4a',c2:'#9a6ad0',sp:66,x:['brute','wind']},
 strawman:{n:'Strawman',sh:'golem',c:'#d9a24a',c2:'#4a3020',sp:38,x:['undead','earth']},buzzbee:{n:'Buzzbee',sh:'wisp',c:'#f2b630',c2:'#3a2a18',sp:84,x:['insect','wind']},
 meadowram:{n:'Meadow Ram',sh:'brute',c:'#f2ede0',c2:'#4a3a30',sp:58,x:['brute','earth']},pinesquirrel:{n:'Pinecone Squirrel',sh:'brute',c:'#c0622a',c2:'#6b3f1d',sp:78,rng:1,x:['brute','earth']}};
const ON=t=>!new RegExp('[?&]'+t+'=off').test(location.search);
try{for(const t in DEF){const R=REG&&REG.byType[t];if(!R){S.err.push('no sprite '+t);continue;}const d=DEF[t],mb={n:d.n,sh:d.sh,c:d.c,c2:d.c2,sz:R.data&&window.__M10MON_RECS?(window.__M10MON_RECS[t].size.match(/at sz (\d+)/)||[0,30])[1]*1:30,sp:d.sp};if(d.rng)mb.rng=1;
  if(!MOBS[t])MOBS[t]=mb;try{if(typeof MOBX!=='undefined'&&!MOBX[t])MOBX[t]=d.x;}catch(_){}try{const sp=window.ELEM&&ELEM.cfg&&ELEM.cfg.species;if(sp&&!(t in sp))sp[t]=null;}catch(_){}
  R.data.scope='game';}}catch(e){S.err.push('reg '+e.message);}
// Balance balance/approved/BALANCE_map10_monsters_v1.md (1 Nov, + update 20:00: toad/ram/strawman HP + EXP lowered): zones, counts, levels, species multipliers on the ordinary row, respawn
const SP={bogtoad:{z:1,n:12,lv:[36,37],hp:1.0,atk:1.13,def:1.0,exp:1.05},pinesquirrel:{z:2,n:6,lv:[37,37],hp:.7,atk:1.0,def:.6,exp:1.0},
 meadowram:{z:3,n:10,lv:[37,38],hp:1.0,atk:1.15,def:1.2,exp:1.05},buzzbee:{z:3,n:6,lv:[38,38],hp:.55,atk:1.0,def:.5,exp:.8,el:'Lightning'},
 strawman:{z:5,n:4,lv:[38,39],hp:1.1,atk:1.3,def:1.1,exp:1.2,resp:1.5},gloomcrow:{z:5,n:4,lv:[39,39],hp:.8,atk:1.0,def:.7,exp:1.0}};
// behaviour (Balance 1 Nov 19:26 'build now'): eva mult, aggro (0.7 = the engine's normal sight, so aggroMul = aggro/0.7), leash px
const BH={bogtoad:{aggr:1,aggro:.7,leash:420,int:1.3,poison:.15},pinesquirrel:{eva:1.3,aggro:.9,leash:480},meadowram:{aggr:1,aggro:.7,leash:420,charge:1},buzzbee:{eva:1.5,aggro:.9,leash:420},strawman:{aggr:1,aggro:.6,leash:420},gloomcrow:{aggr:1,eva:1.2,aggro:.9,leash:420}};S.bh=BH;
S.sp=SP;
try{const es=window.ELEM&&ELEM.cfg&&ELEM.cfg.species;if(es)for(const t in SP)if(SP[t].el)es[t]=SP[t].el;}catch(_){}
// ordinary row = what the engine makes for a plain size-22 mob at that level (all live layers included)
MOBS.m10ref={n:'m10 ref',sh:'brute',c:'#888',c2:'#444',sz:22,sp:50};
const row=L=>{const r=makeEnemy('m10ref',L,0,0);return {hp:r.maxHp,atk:r.atk,def:r.def};};
function stats(t,L){const o=row(L),k=SP[t],af=L>30?1+.045*(L-30):1;return {hp:Math.max(1,Math.round(o.hp*k.hp)),atk:o.atk*k.atk*af,def:o.def*k.def,exp:k.exp};}
S.stats=stats;S.row=row;
const ZN=D.zones.reduce((o,z)=>(o[z.id]=z,o),{});
const SLOTS=[];for(const t in SP)for(let i=0;i<SP[t].n;i++)SLOTS.push({t,z:SP[t].z,e:null,due:0});S.slots=SLOTS;
ZONES[ID].density=SLOTS.length/(ZONES[ID].w*ZONES[ID].h/520000);
ZONES[ID].mobs=Object.keys(SP).map(t=>[t,SP[t].lv[0]]);
function polyIn(x,y,Q){let c=false;for(let i=0,j=Q.length-1;i<Q.length;j=i++){const a=Q[i],b=Q[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
const NOW=()=>performance.now()/1000,rnd=(a,b)=>a+Math.random()*(b-a);
const MILL=()=>{const m=PROPS.find(q=>q.t==='m10_a_mill');return m?[m.x,m.y-80]:[2136,1220];};
function okSpot(x,y,Q,initial){const ar=D.arrive,g=D.gap,ml=MILL();
  return polyIn(x,y,Q)&&!blocked(x,y,40)&&!blocked(x+30,y,20)&&!blocked(x-30,y,20)&&!blocked(x,y+30,20)&&!blocked(x,y-30,20)
    &&Math.hypot(x-ar[0],y-ar[1])>320&&Math.hypot(x-P.x,y-P.y)>(initial?480:360)&&Math.hypot(x-ml[0],y-ml[1])>240&&Math.hypot(x-g.x,y-g.y)>260;}
// keep slots up to date: a death sets that slot's wait; a zone whose mobs are all down waits as one
function tick(){const t=NOW();const byZ={};
  for(const s of SLOTS){if(s.e&&(s.e.dead||enemies.indexOf(s.e)<0)){s.e=null;s.due=t+rnd(50,80)*(SP[s.t].resp||1);s.fresh=1;}(byZ[s.z]=byZ[s.z]||[]).push(s);}
  for(const z in byZ){const L=byZ[z];if(L.every(s=>!s.e)&&L.some(s=>s.fresh)){const w=rnd(90,120);for(const s of L){s.due=t+w*(SP[s.t].resp||1);s.fresh=0;}}else for(const s of L)s.fresh=0;}}
function spawnOne(initial){tick();const t=NOW();
  const s=SLOTS.find(s=>!s.e&&(initial||s.due<=t)&&ON(s.t)&&MOBS[s.t]);if(!s)return;const Z=ZN[s.z];if(!Z)return;
  const Q=Z.poly,xs=Q.map(q=>q[0]),ys=Q.map(q=>q[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  // spread: at least 140 px from mobs already in this zone (r2: twice as many mobs, so 200/sqrt2)
  let x,y,ok=false;for(let i=0;i<80&&!ok;i++){x=rnd(x0,x1);y=rnd(y0,y1);ok=okSpot(x,y,Q,initial)&&(i>50||SLOTS.every(o=>!o.e||o.z!==s.z||Math.hypot(o.e.x-x,o.e.y-y)>140));}
  if(!ok){s.due=t+3;return;}
  const k=SP[s.t],L=k.lv[0]+Math.floor(Math.random()*(k.lv[1]-k.lv[0]+1)),e=makeEnemy(s.t,L,x,y),st=stats(s.t,L);
  e.maxHp=e.hp=st.hp;e.atk=st.atk;e.def=st.def;e.def0=e.def;e.m10exp=st.exp;e.m10z=s.z;{const h=BH[s.t];if(h.eva&&e.eva!=null)e.eva*=h.eva;e.aggroMul=h.aggro/.7;e.m10bh=h;}s.e=e;enemies.push(e);S.spawned[s.t]=(S.spawned[s.t]||0)+1;}
// EXP multiplier: only while a Map 10 mob is being killed
{let cur=1;
  if(typeof killEnemy==='function'){const ok=killEnemy;killEnemy=function(e){const c0=cur;if(e&&e.m10exp&&!e.dead)cur=e.m10exp;try{return ok.apply(this,arguments);}finally{cur=c0;}};
    for(const n of ['gainExp','gainJobExp']){const f=(n==='gainExp'&&typeof gainExp==='function')?gainExp:(n==='gainJobExp'&&typeof gainJobExp==='function')?gainJobExp:null;if(!f)continue;
      const g=function(a){if(cur!==1&&typeof a==='number')arguments[0]=Math.round(a*cur);return f.apply(this,arguments);};if(n==='gainExp')gainExp=g;else gainJobExp=g;}}else S.err.push('no killEnemy');}
{const o=spawnEnemy;spawnEnemy=function(initial){if(typeof G!=='undefined'&&G.zone===ID){try{spawnOne(initial);}catch(e){if(S.err.length<20)S.err.push('spawn '+e.message);}return;}return o.apply(this,arguments);};}
/* behaviour layer, after the engine's own enemy step */
S.bst={slow:0,charge:0,dash:0,leash:0,poison:0,ptick:0};
/* facing (r2): after each strike the engine leaves e.wind a little below 0, and its chase step turns the monster to the player only when
   !e.wind, so after the first attack the monster kept its old facing (back to the player). Map 10 monsters: reset to 0 each step. ?mobface=off = old */
const FACEOFF=/[?&]mobface=off/.test(location.search);S.faceFix=!FACEOFF;
const PZ=[];   // toad poison on the hero: 15 % of the hit, 3 ticks over 3 s
if(typeof updEnemies==='function'){const ue=updEnemies;updEnemies=function(dt){if(G.zone===ID&&!FACEOFF)try{for(const e of enemies)if(e&&e.m10bh&&e.wind<0)e.wind=0;}catch(_){}const r=ue.apply(this,arguments);if(G.zone!==ID)return r;
  try{for(const e of enemies){const h=e.m10bh;if(!h||e.dead)continue;
    if(h.int){if(e._pcd!=null&&e.atkCd>e._pcd+.05){e.atkCd*=h.int;S.bst.slow++;}e._pcd=e.atkCd;}
    if(h.charge){
      if(e.wind>0&&!e._chg){e._chg=1;if(e.wind<.5){e.wind=.5;e.windT=Math.max(e.windT||0,.5);}S.bst.charge++;}
      if(e._chg===1&&!(e.wind>0)){e._chg=2;e._dash=.18;e._da=e.atkAng!=null?e.atkAng:Math.atan2(P.y-e.y,P.x-e.x);S.bst.dash++;}
      if(e._dash>0){const st=Math.min(e._dash,dt),v=150/.18*st,nx=e.x+Math.cos(e._da)*v,ny=e.y+Math.sin(e._da)*v;if(!blocked(nx,ny,e.sz*.6)&&Math.hypot(nx-P.x,ny-P.y)>e.sz+P.r*.6){e.x=nx;e.y=ny;}e._dash-=st;if(e._dash<=0)e._chg=0;}
      else if(e._chg===2)e._chg=0;}
    if(h.leash&&e.aggro&&!e._home&&Math.hypot(e.x-e.sx,e.y-e.sy)>h.leash){e._home=1;e.hp=e.maxHp;S.bst.leash++;}
    if(e._home){e.aggro=false;e.wind=0;e.strikeT=0;const dx=e.sx-e.x,dy=e.sy-e.y,l=Math.hypot(dx,dy);if(l<30){e._home=0;e.calmT=2;}
      else{const v=Math.min(l,(e.sp||50)*1.4*dt),nx=e.x+dx/l*v,ny=e.y+dy/l*v;if(!blocked(nx,ny,e.sz*.5)){e.x=nx;e.y=ny;}else{e.x=e.sx;e.y=e.sy;e._home=0;}e.face=Math.atan2(dy,dx);e.vx=dx/l*(e.sp||50);e.vy=dy/l*(e.sp||50);}}}}
  catch(er){if(S.err.length<20)S.err.push('bh '+er.message);}
  const t=time;for(let i=PZ.length-1;i>=0;i--){const z=PZ[i];if(t<z.next)continue;
    if(!P||P.dead||G.zone!==ID){PZ.splice(i,1);continue;}const a=Math.max(1,Math.round(z.per));const hp=Math.min(a,P.hp);
    if(hp>0){P.hp-=hp;P.hurtT=.15;try{textAt(P.x,P.y-40,fmt(hp),'#8dff6a',13,{life:.7});}catch(_){}S.bst.ptick++;if(P.hp<=0)try{playerDeath();}catch(_){}}
    z.next+=1;if(--z.n<=0)PZ.splice(i,1);}
  return r;};}else S.err.push('no updEnemies');
if(typeof hurtPlayer==='function'){const hp_=hurtPlayer;hurtPlayer=function(raw,src){const h0=P?P.hp:0;const r=hp_.apply(this,arguments);
  try{if(src&&src.m10bh&&src.m10bh.poison&&!src.dead&&P&&!P.dead&&!G.god){const lost=h0-P.hp;if(lost>0){PZ.push({per:lost*src.m10bh.poison/3,n:3,next:time+1});S.bst.poison++;}}}catch(_){}return r;};}
// aggressive (attack on sight) = toad, ram, strawman, crow; squirrel + bee stay as the engine's pack: they answer when one of them is hit
if(typeof isAggressive==='function'){const ia=isAggressive;isAggressive=function(e){if(e&&e._home)return false;return !!(e&&e.m10bh&&e.m10bh.aggr)||ia.apply(this,arguments);};}
S.ok=true;S.spawnOne=spawnOne;S.tick=tick;S.pz=PZ;
})();

