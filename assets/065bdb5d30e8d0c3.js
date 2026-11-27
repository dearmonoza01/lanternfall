
/* ---- p295 r2: Map 9 "Lantern Spire" TEST walk-through, floors 1-7 (DeaRz 24 Oct 07:30 "ทำเลย": put the 7 approved floor paintings in the game
   for a walk test). Art: art_src/map9/paintover F1 v2, F2 v1, F3 v1, F4 v1, F5 v5, F6 v2, F7 v3 (flattened on the sky blue, JPEG).
   - TEST only: no monsters, every floor is SAFE, the save is never written while the hero is in Map 9 (the last save stays in Map 8).
   - way in: the far (north-west) end of Map 8's sky deck -> Floor 1 just inside its south gate. Floor 1's south gate -> back onto the sky deck.
   - stairs (r2): walk up the stair on the back wall onto its top landing = up one floor (arrive beside the stairwell, facing the room);
     walk into the stairwell hole on the left = down one floor (arrive on the top step, next to the landing). Floor 7 has no stair up.
   - collision = the room's floor ellipse + the big props, measured by hand on the paintings (1x = painting pixels).
   - everything is drawn in the painting: the hero is always drawn over it (tall pillars on Floor 1 do not hide the hero yet).
   - the warp crystals are art only (no warp menu yet).
   - TEST: M4T.map9.dbg = true draws the collision discs; ?map9=off removes the map. ---- */
(function(){'use strict';
const Q=location.search;if(/map9=off/.test(Q))return;
const M4=window.__M4T,A=window.__M9_ART;if(!M4||!M4.sub||!M4.load||!A||typeof ZONES==='undefined')return;
const IW=1448,IH=1086,KX=1.75,T=.866,KY=KX/T,MW=Math.round(IW*KX),MH=Math.round(IH*KY),GK=1/KX,SKY='#9db4d6';
const LAND=[755,372,66,12];
/* r11 (DeaRz 17:24 "แก้ให้ตรงรอบสุดท้าย", yellow band): the right-front wall's inner edge, read off DeaRz's drawing (fitted to floor 1's pillar rings);
   third value 1 = used as drawn (no automatic inset) */
/* r12 (DeaRz 17:29 yellow outline, measured against the landing's collision box STW): solid area under the stair and right of the landing base */
const UNDERST=[[801,374],[801,284],[818,282],[896,297],[890,357],[818,353]];   /* r13 (DeaRz 17:32 blue "ลบออก"): the strip along the floor under the stair and the leg below the box removed */
const YR=[[842,876,1],[936,862,1],[1006,848,1],[1076,823,1],[1146,792,1],[1188,764,1],[1230,722,1],[1258,673,1],[1283,610,1],[1286,571,1]];
/* r2 (DeaRz 24 Oct 08:01): the way up is the landing at the top of the back-wall stair. The stair is walkable: walls along both sides of the steps and round the landing top. */
const STW=[[660,212,690,203],[690,203,822,203],[822,203,822,265],[690,268,822,268]],LTOP=[752,236,52,22],STARR=[655,250],STFACE=2.6;
/* r3 (DeaRz 24 Oct 09:20 "เช็คทุกชั้น"): the stair's two edges measured on each floor's painting (back = wall side, front = step noses), foot -> top.
   The walls sit 10 px outside each edge (radius 10), so the hero's feet stay on the drawn steps. */
const SE={1:{bk:[402,350,684,212],fr:[430,392,684,258]},2:{bk:[402,362,666,212],fr:[427,394,688,273]},3:{bk:[399,362,670,212],fr:[434,398,688,259]},
  4:{bk:[399,359,670,209],fr:[459,398,688,269]},5:{bk:[402,369,666,230],fr:[456,401,684,273]},6:{bk:[402,348,670,223],fr:[449,405,684,269]}};
/* r3 (DeaRz 24 Oct 09:18-09:19): tall things in the paintings are drawn again over the hero when the hero is behind them (y-sorted at their base line b).
   p = outline in painting pixels. */
const RC=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
const SPK=(cx,cy,rx,ry,top)=>[[cx-rx,cy+ry],[cx-rx,cy],[cx-rx*.55,top+(cy-top)*.45],[cx,top],[cx+rx*.55,top+(cy-top)*.45],[cx+rx,cy],[cx+rx,cy+ry]];
const WARP={p:RC(256,396,316,506),b:500};
const OC={1:[{p:RC(406,198,500,468),b:775},{p:RC(404,472,502,796),b:775},{p:RC(948,198,1042,468),b:775},{p:RC(946,474,1045,796),b:775},   /* r8 (DeaRz 17:51 "ทั้ง2ฝั่ง"): each side is one tall pillar standing at y 775, so its upper part also hides a hero behind it (was 452) */
    {p:[[640,545],[680,520],[722,416],[765,520],[812,528],[792,642],[660,642]],b:645},{p:RC(912,320,966,430),b:425},{p:RC(616,788,834,978),b:940}],
  /* r7 (DeaRz 17:50 "เช็คทุกจุดให้ยืนหลังหอสมุด"): each shelf piece's baseline follows the shelf ring (base:'up' = back arc, 'lo' = front arc)
     instead of one flat line, so the hero is behind a shelf wherever it stands north of that shelf's foot */
  2:[{p:[[373,560],[373,470],[440,395],[540,352],[700,338],[917,352],[917,500],[880,506],[760,486],[620,482],[500,500],[430,560]],b:490,base:'up'},
    {p:[[373,540],[425,518],[472,640],[470,738],[420,722],[373,640]],b:732,base:'lo'},
    {p:[[533,708],[640,702],[760,702],[900,690],[1000,642],[1050,600],[1077,560],[1077,645],[1040,705],[960,762],[860,797],[760,814],[640,810],[536,792]],b:800,base:'lo'},
    {p:[[976,425],[1010,406],[1077,500],[1077,560],[1050,600],[1000,652],[992,722],[976,600]],b:716,base:'lo'},WARP],
  3:[{p:[[618,442],[828,442],[828,558],[762,562],[748,566],[704,566],[698,562],[618,552]],b:560},
     {p:RC(702,548,746,646),b:641},WARP],   /* r6 (DeaRz 17:38 "ให้ตัวละครยืนด้านหลัง"): the shaft is its own front piece, anchored at its foot, so a hero standing behind it is drawn under it */
  4:[{p:SPK(520,525,62,30,415),b:525},{p:SPK(725,640,105,50,458),b:640},{p:SPK(980,515,72,35,392),b:515},{p:SPK(1185,540,55,30,438),b:540},
    {p:SPK(1085,712,85,40,580),b:712},{p:SPK(515,785,70,35,655),b:785},{p:SPK(835,830,62,35,732),b:830},WARP],
  5:[{p:RC(698,468,752,664),b:645},{p:RC(198,698,264,774),b:765},{p:RC(1184,686,1252,772),b:765},WARP],
  6:[{p:[[640,600],[700,392],[752,392],[802,408],[792,452],[762,560],[832,600],[838,662],[760,694],[680,694],[612,652]],b:672},
    {p:RC(186,656,246,742),b:735},{p:RC(1198,468,1264,557),b:550},{p:RC(1158,698,1224,787),b:780},WARP],
  7:[{p:[[663,448],[700,418],[730,418],[767,448],[787,602],[762,642],[690,642],[663,602]],b:630},{p:RC(628,508,660,674),b:655},{p:RC(786,508,818,674),b:655},WARP]};
/* per floor, painting pixels: room = floor ellipse [cx,cy,a,b]; up = stair foot x; well = stairwell {hole:[cx,cy,rx,ry], rails:[[x1,y1,x2,y2]], arrive:[x,y]};
   obs = solid ellipses [cx,cy,rx,ry]; ring = shelf ring {c:[cx,cy,a,b], gaps:[[deg0,deg1]], w} */
const F=[null,
 {n:'ห้องโถงทางเข้า',lv:'',room:[725,625,608,260],gate:1,up:420,dn:[370,452],warp:[940,410],
  obs:[[453,775,52,24],[995,775,52,24],[725,637,182,90],LAND,   /* r4 (DeaRz 16:02 blue): the upper pillar rings [453,455] / [995,455] removed */
       [457,510,50,24],[999,508,50,24]],
  /* r7 (DeaRz 17:06 red band): the outer wall's inner edge, painting px; the gate stays open between its posts (648 / 802) */
  wall:[[[393,353],[227,435],[179,489],[122,585],[113,618],[141,709],[236,792],[346,845],[555,899],[648,899]],
        [[802,899],...YR,[1325,568],[1235,435],[1092,361],[864,328],[822,272]]]},   /* last point: joined to the landing's corner */   // r3: dais outer step + pillar bases full size (DeaRz 09:19); r4 (DeaRz 15:45): the octagon blocks of the two front pillars are solid
 {n:'ห้องสมุด',lv:'',room:[725,625,610,262],up:430,warp:[285,488],
  well:{hole:[212,556,55,24],rails:[[150,518,300,545],[128,568,282,590]],arrive:[350,578]},
  ring:{c:[722,640,330,160],gaps:[[124,151],[299,326]],w:20},obs:[LAND]},   /* r4 (DeaRz 16:03 blue): the shelf ring's lower-left end shortened; r6: outer wall = SHELL below */
 {n:'ห้องเฟือง',lv:'',room:[725,622,580,257],up:430,warp:[285,488],
  well:{hole:[207,553,55,22],rails:[[150,515,300,545],[125,570,280,585]],arrive:[345,580]},
  obs:[LAND,[723,638,20,8]],   /* r4 (DeaRz 16:05 "ลบเสร็จเด๊ยวผมวางให้ใหม่"): the gear pit collision [730,650,332,152] removed; r5 (DeaRz 16:32): the gear shaft */
  polys:[[[454,512],[531,479],[635,457],[723,452],[812,453],[900,468],[989,510],[804,563],[723,557],[647,563]],   /* r5 (DeaRz 16:32 red outlines): back pit wedge */
         [[410,559],[394,629],[426,702],[498,753],[667,801],[667,687],[591,614]],                                 /* left pit wedge */
         [[1045,556],[1057,636],[1021,717],[932,768],[780,801],[780,680],[864,614]]]},   /* r6: v41's full-shaft collision removed again (DeaRz 17:38: the hero should stand behind the shaft) */                            /* right pit wedge; the 3 walkways + centre stay walkable */
 {n:'ห้องคริสตัล',lv:'',room:[727,625,580,258],up:430,warp:[285,488],
  well:{hole:[207,557,55,24],rails:[[150,518,302,548],[118,568,282,592]],arrive:[352,580]},
  obs:[[520,525,62,30],[725,640,105,50],[980,515,72,35],[1185,540,55,30],[1085,712,85,40],[515,785,70,35],[835,830,62,35],LAND]},
 {n:'ห้องเมฆ',lv:'',room:[727,627,607,262],up:430,warp:[285,488],
  well:{hole:[212,557,55,26],rails:[[155,505,310,560],[120,560,272,610]],arrive:[350,592]},
  obs:[[725,632,55,28],[230,738,32,18],[1215,735,32,18],LAND]},
 {n:'หอดูดาว',lv:'',room:[727,625,605,260],up:430,warp:[285,488],
  well:{hole:[225,552,58,26],rails:[[172,490,325,545],[128,555,285,605]],arrive:[365,582]},
  obs:[[725,645,110,55],[215,712,28,16],[1230,535,28,16],[1190,760,28,16],LAND]},
 {n:'Lantern Heart',lv:'Lv 95–100',room:[728,592,612,298],warp:[285,488],
  well:{hole:[202,555,52,24],rails:[[125,515,290,545],[120,575,265,600]],arrive:[330,585]},
  obs:[[725,640,125,60]],
  /* r14 (DeaRz 17:41 "ชั้น7ต้องแก้ใหม่เพราะห้องไม่เท่ากัน", yellow band): floor 7's own wall line; the back follows the yellow band (measured on the warp
     crystal and the centre dais), the sides / front are floor 1's line scaled to this room */
  /* r15 (DeaRz 17:46 arrows): the back now sits exactly on the dark line where the low back wall meets the floor, measured on the floor 7 painting */
  wall:[[[150,505,1],[160,480,1],[195,440,1],[260,400,1],[330,375,1],[430,345,1],[550,322,1],[720,310,1],[900,320,1],[1050,355,1],[1150,395,1],[1225,435,1],[1280,470,1],[1300,495,1],[1327,534,1],
         [1290,575,1],[1264,647,1],[1236,703,1],[1194,751,1],[1152,783,1],[1081,819,1],[1011,848,1],[940,864,1],[846,880,1],[728,911],[557,906],[347,844],[236,783],[140,688],[112,584],[121,546],[150,505,1]]]}];
const ID=n=>'w24_map9f'+n+'_test',IDS=new Set();for(let n=1;n<=7;n++)IDS.add(ID(n));
const M9={on:false,floor:0,dbg:false,art:{},stats:{enter:0,exit:0,up:0,down:0,saveBlocked:0,deck:0,locked:0}};M4.map9=M9;
/* REAL v2i (DeaRz 24 Oct 18:05 "แมพ9ต้องทำเควสถึงเข้าได้ ก็ปล่อยไว้ก่อนรอเควสเนื้อเรื่องค่อยปรับ"): the tower door is LOCKED until the story quest exists.
   Open for testing: add ?map9=on to the address, or run M4T.map9.unlock(true) (kept in localStorage lf_map9_open_v1; unlock(false) closes it). The quest will call M4T.map9.unlock(true) later. */
const OPENK='lf_map9_open_v1';M9.open=()=>{if(/map9=on/.test(Q))return true;try{return localStorage.getItem(OPENK)==='1';}catch(_){return false;}};
M9.unlock=on=>{try{on?localStorage.setItem(OPENK,'1'):localStorage.removeItem(OPENK);}catch(_){}return M9.open();};
let lockT=0;function lockMsg(){M9.stats.locked++;const t=(typeof time==='number'?time:0);if(t<lockT)return;lockT=t+2.5;try{textAt(P.x,P.y-70,'🔒 ประตูหอโคมไฟยังปิดอยู่','#ffe2a0',15,{life:1.6});}catch(_){}}
const img=k=>{const s=A[k];if(!s)return null;if(!M9.art[k]){const i=new Image();i.decoding='async';i.src=s;M9.art[k]=i;}const i=M9.art[k];return i.complete&&i.naturalWidth?i:null;};
const now=()=>(typeof time==='number'?time:0);
const w=(x,y)=>[x*KX,y*KY],i1=()=>[P.x/KX,P.y/KY];
/* ---------- collision discs (world) ---------- */
function fillEll(out,cx,cy,rx,ry){const X=cx*KX,Y=cy*KY,RX=rx*KX,RY=ry*KY;
  if(RX>=RY){const st=Math.max(6,RY*.5);for(let d=-RX;d<=RX+.1;d+=st){const r=RY*Math.sqrt(Math.max(0,1-(d/RX)**2));if(r>6)out.push([X+d,Y,r]);}}
  else{const st=Math.max(6,RX*.5);for(let d=-RY;d<=RY+.1;d+=st){const r=RX*Math.sqrt(Math.max(0,1-(d/RY)**2));if(r>6)out.push([X,Y+d,r]);}}}
function line(out,x1,y1,x2,y2,r){const [a,b]=w(x1,y1),[c,d]=w(x2,y2),L=Math.hypot(c-a,d-b),n=Math.max(1,Math.ceil(L/(r*.8)));for(let i=0;i<=n;i++)out.push([a+(c-a)*i/n,b+(d-b)*i/n,r]);}
function fillPoly(o,Q){const xs=Q.map(q=>q[0]),ys=Q.map(q=>q[1]);   /* a polygon (painting px) filled with small discs */
  const inQ=(x,y)=>{let c=false;for(let i=0,j=Q.length-1;i<Q.length;j=i++){const [xi,yi]=Q[i],[xj,yj]=Q[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c;}return c;};
  for(let x=Math.ceil(Math.min(...xs));x<=Math.max(...xs);x+=9)for(let y=Math.ceil(Math.min(...ys));y<=Math.max(...ys);y+=9)if(inQ(x,y))o.push([x*KX,y*KY,8*KX]);}
/* r6: inner edge of the outer wall, left half (painting px of a 725/625/610/262 room), from DeaRz's black line on floor 2 (16:46) */
const SHELL=[[352,407],[268,465],[201,493],[142,537],[130,580],[142,630],[176,680],[226,724],[293,774],[335,796],[411,828],[480,850],[600,862],[648,864],[725,865]];   /* 648 = floor 1's gate post */
/* r8 (DeaRz 17:08 "ชั้น2-7 มันไม่มีประตู ผมเลยขีดเผื่อไว้"): floors 2-7 use floor 1's wall line closed across the front (no gate), scaled to each room;
   floor 7 has no stair / landing, so its back is closed along the room edge too */
function WALLX(f){const W1=[[393,353],[227,435],[179,489],[122,585],[113,618],[141,709],[236,792],[346,845],[555,899],[725,903],...YR,[1325,568],[1235,435],[1092,361],[864,328],[822,272]];
  if(!f.up)W1.pop();   /* no landing: drop its corner */
  if(!f.up)for(const x of [780,700,600,500,420]){const d=(x-725)/608;W1.push([x,625-260*Math.sqrt(Math.max(0,1-d*d))-30]);}
  if(!f.up)W1.push([393,353]);
  const [cx,cy,a,b]=f.room;return [W1.map(([x,y,k])=>[cx+(x-725)*a/608,cy+(y-625)*b/260,k])];}
const NOWALL=true;   /* r7 (DeaRz 17:01 "เอาออกให้หมดเด๊ยวผมวงให้"): every outer-wall piece is off (old ring, SHELL band, wall-to-stair gap line, floor 1 gate posts) until DeaRz marks the walls */
function solids(f){const o=[],[cx,cy,a,b]=f.room,X=cx*KX,Y=cy*KY,A_=a*KX,B_=b*KY,R=70;
  if(!NOWALL)for(let t=0;t<360;t+=1.2){const r=t*Math.PI/180,px=cx+a*Math.cos(r);if(f.gate&&Math.sin(r)>0&&Math.abs(px-725)<76)continue;if(f.up&&Math.sin(r)<0&&px>388&&px<720)continue;
    o.push([X+(A_+R)*Math.cos(r),Y+(B_+R)*Math.sin(r),R]);}
  /* r6 (DeaRz 16:46 + 16:49 "วัดทั้งแมพ"): the outer wall's inner edge follows DeaRz's black line (floor 2, left side), mirrored for the right side,
     on the same inset from the gold rim along the front; scaled to each floor's room; the back wall / stair are unchanged; floor 1 keeps its gate open */
  if(!NOWALL){const L0=SHELL,R0=L0.slice(0,-1).reverse().map(([x,y])=>[1450-x,y]),ln=[...L0,...R0,[1039,380]].map(([x,y])=>[cx+(x-725)*a/610,cy+(y-625)*b/262]);
   const out=([x,y])=>[cx+(x-cx)*1.13,cy+(y-cy)*1.28];
   for(let i=0;i<ln.length-1;i++){const p=ln[i],q=ln[i+1],mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2;if(f.gate&&my>cy&&Math.abs(mx-725)<80)continue;fillPoly(o,[p,q,out(q),out(p)]);}}
  if(!NOWALL&&f.up&&f.st){const {bk}=f.st;line(o,384,edgeY(f,384)+4,bk[0],bk[1]-10,12*KX);}   /* r4 (DeaRz 16:01 red): the gap between the room wall and the stair's back edge closed */
  if(f.up&&f.st){const {bk,fr}=f.st;line(o,bk[0],bk[1]-10,bk[2],bk[3]-10,10*KX);line(o,fr[0],fr[1]+10,fr[2],fr[3]+10,10*KX);}   // r3: stair edges per floor
  if(f.up){for(const s of STW)line(o,...s,12*KX);let px=505,py=edgeY(f,505)+4;for(let x=520;x<=725;x+=15){const y=edgeY(f,x)+4;line(o,px,py,x,y,12*KX);px=x;py=y;}}   // stair sides + the floor edge under the stair
  /* r9 (DeaRz 17:11 "ทำไมคุณทำมาไม่ตรงบรีฟ"): the band sat too far out (over the rim's outer edge); every line point moves INSET px toward the room
     centre along the ellipse normal, except points tied to the stair foot / landing corner */
  const INSET=28,inset=L=>L.map(([x,y,fx],i)=>{if(fx)return [x,y];if(Math.hypot(x-393,y-353)<2||Math.hypot(x-822,y-272)<2)return [x,y];let nx=(x-cx)/(a*a),ny=(y-cy)/(b*b);const n=Math.hypot(nx,ny)||1;
    const k=Math.max(0,Math.min(1,(y-(cy+.45*b))/(.4*b)));   /* r10 (DeaRz 17:19 yellow): back and sides stay on the drawn line (against the wall base); only the front moves in */
    return [x-nx/n*INSET*k,y-ny/n*INSET*k];});
  if(f.up)line(o,725,369,864,330,12*KX);
  if(f.up)fillPoly(o,UNDERST);   /* r12 (DeaRz 17:29 yellow): the floor strip under the stair + the landing base's right side + the box right of it, as drawn */   /* r10 (DeaRz 17:19 red): the gap between the floor edge under the stair and the wall band below the landing's corner */
  for(const L0 of f.wall||WALLX(f)){const L=inset(L0);for(let i=0;i<L.length-1;i++){const p=L[i],q=L[i+1],dx=q[0]-p[0],dy=q[1]-p[1],n=Math.hypot(dx,dy)||1;   /* r7: DeaRz's own wall lines: a 30 px band outward from the line */
    let nx=-dy/n,ny=dx/n;if(nx*((p[0]+q[0])/2-cx)+ny*((p[1]+q[1])/2-cy)<0){nx=-nx;ny=-ny;}const D=30;fillPoly(o,[p,q,[q[0]+nx*D,q[1]+ny*D],[p[0]+nx*D,p[1]+ny*D]]);line(o,p[0],p[1],q[0],q[1],8*KX);}}
  if((!NOWALL||f.wall)&&f.gate){line(o,648,860,648,1010,14);line(o,802,860,802,1010,14);}
  for(const e of f.obs||[])fillEll(o,...e);
  for(const Q of f.polys||[])fillPoly(o,Q);   /* r5: solid polygons (painting px) */
  if(f.warp)fillEll(o,f.warp[0],f.warp[1]+4,22,11);
  if(f.well)for(const r of f.well.rails)line(o,...r,12*KX);
  if(f.ring){const [rcx,rcy,ra,rb]=f.ring.c,r=f.ring.w*KX;for(let t=0;t<360;t+=1.5){if(f.ring.gaps.some(([g0,g1])=>t>=g0&&t<=g1))continue;const q=t*Math.PI/180;o.push([(rcx+ra*Math.cos(q))*KX,(rcy+rb*Math.sin(q))*KY,r]);}}
  return o;}
function edgeY(f,x){const [cx,cy,a,b]=f.room,d=(x-cx)/a;return cy-b*Math.sqrt(Math.max(0,1-d*d));}
function inEll(x,y,cx,cy,rx,ry){return ((x-cx)/rx)**2+((y-cy)/ry)**2<=1;}
/* ---------- zones / props ---------- */
const P_=(o)=>Object.assign({cat:'m4test',w:2,h:2,ax:1,ay:1,liveOnly:1,nofade:1,draw(){}},o);
for(let n=1;n<=7;n++){const f=F[n],id=ID(n);M4.sub.add(id);
  ZONES[id]={n:`Map 9 ชั้น ${n}`,th:`หอโคมไฟ · ${f.n}`,sub:`Map 9 · ชั้น ${n}${f.lv?" · "+f.lv:""} · ไม่บันทึกเซฟ`,safe:1,fullSafe:1,w:MW,h:MH,seed:4900+n,ground:['#efe4d0','#e6d8bf','#f6efe2',SKY],acc:'#ffe2a0',amb:'mote',mobs:[],density:0,areas:[],m4test:1,interior:1};
  try{if(typeof EDGE_THEME!=='undefined')EDGE_THEME[id]=[];}catch(e){}
  f.st=SE[n]||null;f.sol=solids(f);PROP_DEFS['m9Solid_'+n]=P_({n:'Map 9 floor '+n+' collision',solid:f.sol.map(([x,y,r])=>({dx:x,dy:y,r}))});
  (OC[n]||[]).forEach((oc,i)=>{const xs=oc.p.map(q=>q[0]),ys=oc.p.map(q=>q[1]);oc.bb=[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];oc.cx=(oc.bb[0]+oc.bb[2])/2;
    if(oc.base&&f.ring){const [rcx,rcy,ra,rb]=f.ring.c,up=oc.base==='up';   /* r7: baseline along the shelf ring; the sort anchor is its lowest point */
      oc.bf=x=>{const d=Math.max(-.97,Math.min(.97,(x-rcx)/ra)),s=Math.sqrt(1-d*d);return up?rcy-rb*s+20*s:rcy+rb*s+12;};
      let mb=0;for(let x=oc.bb[0];x<=oc.bb[2];x+=4)mb=Math.max(mb,oc.bf(x));oc.b=Math.min(Math.max(mb,oc.b),oc.bb[3]+20);}
    const [x0,y0,x1,y1]=oc.bb;PROP_DEFS['m9Oc_'+n+'_'+i]=P_({n:'Map 9 floor '+n+' front piece '+i,w:(x1-x0)*KX,h:(Math.max(y1,oc.b)-y0)*KY,ax:(oc.cx-x0)*KX,ay:(oc.b-y0)*KY,live:(c,p)=>ocDraw(c,p,oc,n)});});}
PROP_DEFS.m9Dbg=P_({n:'Map 9 collision (TEST)',layer:'ground',w:MW+400,h:MH+400,ax:(MW+400)/2,ay:(MH+400)/2,live:liveDbg});
/* r3: a front piece = its outline cut from the floor painting once, drawn in ground space (same transform undo as Map 8's base-layer cut-outs);
   only while the hero stands behind it and overlaps it, at 60 % like the other maps' see-through props */
function ocCanvas(n,oc){if(oc.cv)return oc.cv;const im=img('f'+n);if(!im)return null;const [x0,y0,x1,y1]=oc.bb,S=2,cv=document.createElement('canvas');
  cv.width=Math.ceil((x1-x0)*S);cv.height=Math.ceil((y1-y0)*S);const g=cv.getContext('2d');g.beginPath();oc.p.forEach(([x,y],k)=>{const X=(x-x0)*S,Y=(y-y0)*S;k?g.lineTo(X,Y):g.moveTo(X,Y);});g.closePath();g.clip();
  g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(im,x0,y0,x1-x0,y1-y0,0,0,cv.width,cv.height);oc.cv=cv;return cv;}
function ocDraw(c,p,oc,n){if(!P||P.y>=p.y)return;const hx=P.x/KX,hy=P.y/KY,[x0,y0,x1,y1]=oc.bb;if(hy<y0||hx<x0-14||hx>x1+14)return;if(oc.bf&&hy>=oc.bf(hx))return;const cv=ocCanvas(n,oc);if(!cv)return;
  const T0=camT(),th=camY();c.save();if(!(T0>.995&&Math.abs(th)<1e-3)){const s=CAM.persp?1+(w2s(p.x,p.y)[1]/H-.55)*(1-T0)*.5:1;c.translate(p.x,p.y);c.scale(1/s,T0/s);if(th)c.rotate(th);c.translate(-p.x,-p.y);}
  c.imageSmoothingEnabled=true;c.globalAlpha*=.6;c.drawImage(cv,x0*KX,y0*KY,(x1-x0)*KX,(y1-y0)*KY);c.restore();M9.stats.oc=(M9.stats.oc||0)+1;}
const floorOf=z=>{const m=/^w24_map9f(\d)_test$/.exec(z||'');return m?+m[1]:0;};
{const o=loadPropsFor;loadPropsFor=function(zid){const n=floorOf(zid);if(n){try{ED.source='default';}catch(e){}const m=(t,x,y)=>({t,x:Math.round(x),y:Math.round(y),s:1,v:0,f:1,ph:0,edge:1,nc:0,m4:1});
  const out=[m('m9Dbg',MW/2,MH/2),m('m9Solid_'+n,0,0)];(OC[n]||[]).forEach((oc,i)=>out.push(m('m9Oc_'+n+'_'+i,oc.cx*KX,oc.b*KY)));return out;}return o.apply(this,arguments);};}
{const o=genBG;genBG=function(zid){const n=floorOf(zid);if(!n)return o.apply(this,arguments);LIGHTS=[];const c=document.createElement('canvas');c.width=Math.round(MW*GK);c.height=Math.round(MH*GK);
  const g=c.getContext('2d');g.fillStyle=SKY;g.fillRect(0,0,c.width,c.height);BGS=GK;let k=0;
  const go=()=>{const im=img('f'+n);if(im){g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(im,0,0,c.width,c.height);M9.groundOk=n;return;}if(++k<300)setTimeout(go,50);};M9.groundOk=0;go();return c;};}
{const o=gatesFor;gatesFor=function(zid){if(floorOf(zid))return [];return o.apply(this,arguments);};}
{const o=spawnEnemy;spawnEnemy=function(){if(floorOf(G.zone))return;return o.apply(this,arguments);};}
/* save: never written from Map 9 (TEST) */
{const o=saveGame;saveGame=function(){if(floorOf(G.zone)){M9.stats.saveBlocked++;return;}return o.apply(this,arguments);};}
{const o=updZoneTag;updZoneTag=function(){const r=o.apply(this,arguments);try{const n=floorOf(G.zone);if(n){const s=document.getElementById('zSub'),e=document.getElementById('zName');
  if(e){e.textContent=`Map 9 ชั้น ${n} · ${F[n].n}`;e.style.color='#7dff9a';}if(s)s.textContent=`🛡 Safe Zone${F[n].lv?" · "+F[n].lv:""} · ไม่บันทึกเซฟ`;}}catch(_){}return r;};}
/* ---------- moving ---------- */
function preload(){for(const k in A)img(k);}
function enterFloor(n,p1,face){preload();const id=ID(n),[x,y]=w(p1[0],p1[1]);
  if(!M4.load(id,{x,y})){console.warn('[p295] Map 9 floor '+n+' did not load');return false;}
  M9.on=true;M9.floor=n;M9.stats.enter++;M9.armT=now()+1.2;M9.armed=false;if(M9.z0==null)M9.z0=CAM.zt;CAM.zt=.7;try{P.face=face;}catch(_){}return true;}
function leaveClean(){if(M9.on&&M9.z0!=null){CAM.zt=M9.z0;M9.z0=null;}M9.on=false;M9.floor=0;}
const upArrive=n=>[F[n].well.arrive,0],downArrive=n=>[STARR,STFACE];
function go(fn){if(G.fade)return;G.fade={t:0,fn};}
function goUp(n){M9.stats.up++;go(()=>{const [p,fc]=upArrive(n+1);enterFloor(n+1,p,fc);});}
function goDown(n){M9.stats.down++;go(()=>{const [p,fc]=downArrive(n-1);enterFloor(n-1,p,fc);});}
/* Map 8 sky deck far end (1x deck y 6-30, x 65-150) <-> Floor 1 south gate */
const M8=()=>M4.map8;
function fromDeck(){M9.stats.deck++;go(()=>{try{M8()&&M8().leave&&M8().leave();}catch(e){}enterFloor(1,[725,770],-Math.PI/2);});}   // r3: arrive inside the hall, clear of the door beam (DeaRz 09:18)
function toDeck(){M9.stats.exit++;go(()=>{leaveClean();const m=M8();if(!m)return;const K8=m.data.KX,K8y=m.data.KY;
  if(m.enter([138*K8,42*K8y],Math.PI/4)){try{m.setLevel&&m.setLevel(2);}catch(e){console.warn('[p295] deck level',e);}m.armT=now()+1.5;}});}
M9.enterFloor=enterFloor;M9.leave=leaveClean;M9.F=F;
setInterval(()=>{try{
  if(M9.bgSet&&!floorOf(G.zone)){if(window.EDGE_BG===SKY)window.EDGE_BG=M9.bg0===SKY?null:M9.bg0;M9.bgSet=0;}
  if(M9.on&&!floorOf(G.zone)&&!G.fade)leaveClean();
  if(!P||G.fade||G.state!=='play')return;
  const n=floorOf(G.zone);
  if(n){if(window.EDGE_BG!==SKY){M9.bg0=window.EDGE_BG;window.EDGE_BG=SKY;M9.bgSet=1;}
    if(now()<M9.armT)return;const f=F[n],[x,y]=i1();
    const inUp=f.up&&(inEll(x,y,...LTOP)||(x>=694&&x<=822&&y>=203&&y<=268)),   /* r4 (DeaRz 15:47 "วิ่งได้ไม่เต็มบรรได"): the whole landing goes up (holding only "up" ended at the landing's top-left corner, outside the ellipse) */inWell=f.well&&inEll(x,y,...f.well.hole),inGate=f.gate&&y>930&&x>648&&x<802;
    if(!M9.armed){if(!inUp&&!inWell&&!inGate)M9.armed=true;return;}   // the hero must step off a trigger before it works
    if(inUp&&n<7){goUp(n);return;}if(inWell&&n>1){goDown(n);return;}if(inGate){toDeck();return;}return;}
  const m=M8();if(m&&m.on&&G.zone===m.id&&m.level===2&&now()>(m.armT||0)){const x=P.x/m.data.KX,y=P.y/m.data.KY;if(y<26&&x<170){if(M9.open())fromDeck();else lockMsg();}}
}catch(e){M9.err=e.message;}},40);
function liveDbg(c){if(!M9.dbg)return;const n=floorOf(G.zone);if(!n)return;c.save();c.fillStyle='rgba(255,40,60,.28)';c.strokeStyle='rgba(255,40,60,.85)';c.lineWidth=1.5;
  for(const [x,y,r] of F[n].sol){c.beginPath();c.arc(x,y,r,0,6.2832);c.fill();c.stroke();}
  const f=F[n];c.strokeStyle='rgba(60,140,255,.95)';c.lineWidth=3;
  if(f.up){const [a,b]=w(LTOP[0],LTOP[1]);c.beginPath();c.ellipse(a,b,LTOP[2]*KX,LTOP[3]*KY,0,0,6.2832);c.stroke();}
  if(f.well){const [hx,hy,rx,ry]=f.well.hole,[a,b]=w(hx,hy);c.beginPath();c.ellipse(a,b,rx*KX,ry*KY,0,0,6.2832);c.stroke();}
  c.restore();}
})();

