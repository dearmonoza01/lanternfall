
/* p337 warp circle art: approved/warp/WARP_base_r1.png (as in the approved demo r10) + approved V7 rune atlas */
const WARP_BASE="assets/f2fa35744bc06b19.png",WARP_RUNES="assets/4805fb864a70531e.png";
/* ---- p337 (TEST warp r1; r2 2 Nov adds the edit mode below): warp circles (วงวาร์ป) at the entry and exit of every map.
   DeaRz 2 Nov 08:25: "Ok ให้ แชท code นำไปใส่จุดวาฟเข้าและออกทุกแมพ". Order orders/code/ORDER_20261102_warp-circles.md,
   handoff approved/warp/HANDOFF_warp_circle_r1.md, look = approved/vfx/WARP_CIRCLE_demo_r10_source.html (drawing code ported 1:1, scaled).
   - Pad + inner disc light + rune ring + dashed rings are drawn on the ground layer (under the hero, walk-through, no collision).
   - Aura plumes + rising rings + sparkles are drawn over the world (light, low intensity).
   - Stand on the centre ~0.8 s -> "go" (2.2 s surge); at 0.5 s the map's OWN gate / go function runs (so every lock and save rule of
     that gate still applies), then the hero is put on the linked circle of the other map (it plays an arrival surge there).
   - Locked links (Map 4 portal, Map 5 north arch, Map 6 ice gate, Map 9 tower door, Map 10 east gate) = dim grey circle, no go.
   - A destination the hero has never reached = dim, no go. Hit in the last 5 s = no go. Dialogue / fade / edit mode = no go.
   - Only the nearest circle animates in full; others draw as a still idle pad. Low graphics (gfxCap<=1 or touch): fewer plumes/rings/sparkles.
   ?warp=off = no circles. */
(function(){'use strict';
if(/[?&]warp=off/.test(location.search))return;
if(typeof drawBeacons!=='function'||typeof drawTexts!=='function'||typeof ctx==='undefined'){console.warn('[p337] hooks missing');return;}
const WP=window.__WARP={ver:'p337',err:[],stats:{go:0,arrive:0,blocked:{},draws:0},circles:null,seenKey:'lf_warp_seen_v1'};
const base=new Image(),runes=new Image();let ready=0;base.onload=runes.onload=()=>{ready++;};base.src=WARP_BASE;runes.src=WARP_RUNES;
const COL={warp:{core:[190,240,255],mid:[90,200,255],rim:[255,214,120]},town:{core:[210,255,200],mid:[110,230,130],rim:[255,230,140]},
  dungeon:{core:[235,205,255],mid:[170,110,255],rim:[255,190,120]},lock:{core:[170,176,186],mid:[120,128,140],rim:[150,150,150]}};
const rgb=(c,a)=>`rgba(${c[0]},${c[1]},${c[2]},${a<0?0:a})`;
/* demo geometry (pad 700 px wide); world pad width PW -> scale K */
const BW=700,BH=Math.round(700*597/900),RX=BW*.385,RY=BW*.222,OX=-BW*.498,OY=-BH*.455;   // pad top-left relative to the disc centre
const PW=200,K=PW/BW,WRX=RX*K,WRY=RY*K;
const M4=()=>window.__M4T||{},ST=()=>{try{const p=window.PROLOGUE;const S=p&&p.st?p.st():null;return S&&S.flags?S:null;}catch(_){return null;}};
const flag=k=>{const S=ST();if(!S)return true;return !!(S.flags[k]||S.flags.legacy||!S.flags.prologueDone);};
/* r6 (DeaRz 2 Nov 17:09 "บัค วาฟไปวาฟมา แก้ไขให้ติด Cd หรือ ต้องเดินเข้าใหม่ถึงจะวาฟได้"): after ANY arrival in a map the old gates' walk-in spots
   do nothing until the hero has walked 170 px away from where he arrived (circles already need a step off). Calls made by a circle pass (WP.via). */
const GU=WP.guard={z:null,x:0,y:0,t:0,on:false,blocks:0};
const guardBlock=()=>{if((window.GATEBOUNCE264?GATEBOUNCE264.via(WP):WP.via)||!GU.on)return false;GU.blocks++;return true;};
setInterval(()=>{try{if(typeof G==='undefined'||!P)return;const t=performance.now();
  if(G.zone!==GU.z){GU.z=G.zone;GU.x=P.x;GU.y=P.y;GU.t=t;GU.on=true;return;}
  if(G.fade||t-GU.t<1500){GU.x=P.x;GU.y=P.y;return;}   // the hero is still being placed (fade / circle arrival)
  if(GU.on&&Math.hypot(P.x-GU.x,P.y-GU.y)>170)GU.on=false;}catch(_){}},100);
/* r7 (DeaRz 2 Nov 18:24 "ตรงนี้ยังวิ่งชนวาฟไปแมพ5ได้อยู่นะ แก้ไขด้วย" + 18:20 "ทำไมวาฟเสร็จแล้วมันต้องดึงกลับไปจุดเดิม"): the walk-in spots of the
   removed old gates no longer do anything at all (no warp, no push-back, no "แมพ 5 ยังไม่มี" notice). Only the circles use them (WP.via).
   Kept: Map 8 -> Map 9 tower door, boarded "planned" gates, Map 10 west edge. ?oldgate=on brings the old walk-ins back. */
const OLDOFF=!/[?&]oldgate=on/.test(location.search);WP.oldBlocks=0;
const oldHidNear=to=>{try{const H=hidSet(G.zone);if(!H||!P)return false;return (typeof GATES!=='undefined'?GATES:[]).some(g=>g.to===to&&H.has(gKey(g))&&Math.hypot(g.x-P.x,g.y-P.y)<420);}catch(_){return false;}};
{const ot=travel;window.travel=function(to,how){if(how==='gate'&&!(window.GATEBOUNCE264?GATEBOUNCE264.via(WP):WP.via)){if(OLDOFF&&oldHidNear(to)){WP.oldBlocks++;return;}if(guardBlock())return;}return ot.apply(this,arguments);};}
{const M=window.__M4T;if(M){const wrapFn=(o,k,keep)=>{if(!o||typeof o[k]!=='function'||o[k].__wpg)return;const f=o[k];
    const w=function(){if(!(window.GATEBOUNCE264?GATEBOUNCE264.via(WP):WP.via)){if(OLDOFF&&!keep){WP.oldBlocks++;return true;}if(guardBlock())return false;}return f.apply(this,arguments);};w.__wpg=1;o[k]=w;};
  const wrapAll=()=>{for(const k of ['goMap5','goMap6','goMap7','goMap8'])wrapFn(M,k);for(const m of ['map5','map6','map7','map8'])wrapFn(M[m],'goBack');wrapFn(M.map9,'enterFloor',1);};
  wrapAll();setInterval(()=>{try{wrapAll();}catch(_){}},2000);   // re-wrap if a later module replaces one
  /* the Map 5-8 walk-ins call their own local functions, all gated by the map's armT: keep it shut (circles call the functions directly) */
  if(OLDOFF)setInterval(()=>{try{for(const m of ['map5','map6','map7','map8']){const o=M[m];if(o&&typeof o.armT==='number'&&o.armT<1e12)o.armT=1e13;}}catch(_){}},50);
  /* Map 4 south stairs walk-in reads M4.gate.y: past the stairs line it reads as far away unless a circle sent the hero there */
  if(OLDOFF&&M.gate&&!M.gate.__wp){const R=M.gate,Y0=R.y,Q={__wp:1};for(const k in R)if(k!=='y')Q[k]=R[k];
    Object.defineProperty(Q,'y',{enumerable:true,get(){try{if(!WP.via&&G.zone===M.id&&P&&P.y>Y0+60){return Y0+1e6;}}catch(_){}return Y0;},set(v){}});M.gate=Q;}}}
const tp=(x,y)=>()=>{WP.via=1;try{const g=(typeof GATES!=='undefined'?GATES:[]).find(q=>Math.hypot(q.x-x,q.y-y)<8);if(g&&typeof travel==='function'&&!G.fade){travel(g.to,'gate');return true;}}catch(e){}finally{WP.via=0;}P.x=x;P.y=y;WP.via=2;WP.viaZ=G.zone;setTimeout(()=>{if(WP.via===2)WP.via=0;},1500);return true;};
const call=f=>()=>{WP.via=1;try{return f()!==false;}catch(e){WP.err.push('go '+e.message);return false;}finally{WP.via=0;}};
/* zone names (shown above an active circle) */
const NM={sylva_lab:'แมพ 1',cartroad_plains:'แมพ 2',astoria_capital:'แมพ 3 เมืองหลวง',w22_map4_test:'แมพ 4',w22_map5_test:'แมพ 5',w23_map6_test:'แมพ 6',
  w23_map7_test:'แมพ 7 ปราสาทหิมะ',w23_map8_test:'แมพ 8',w24_map9f1_test:'แมพ 9 หอโคมไฟ',w24_map10_test:'แมพ 10'};
const TOWN=new Set(['sylva_lab','astoria_capital','w23_map7_test']),DUNG=new Set(['w24_map9f1_test','w22_cave1_test']);
/* circles: id, zone, centre of the inner disc, linked circle id (or dest zone), how the map's own gate is used, lock */
const C=[
 {id:'m1E',z:'sylva_lab',x:3230,y:960,to:'m2W',go:tp(3540,1010)},
 {id:'m2W',z:'cartroad_plains',x:560,y:540,to:'m1E',go:tp(110,790)},
 {id:'m2E',z:'cartroad_plains',x:4990,y:740,to:'m3W',go:tp(5370,870)},
 {id:'m3W',z:'astoria_capital',x:480,y:1540,to:'m2E',go:tp(110,1970)},
 {id:'m3N',z:'astoria_capital',x:2950,y:125,to:'m4S',go:tp(2680,110)},
 {id:'m3E',z:'astoria_capital',x:5080,y:1780,to:'m10W',go:tp(5250,1950)},
 {id:'m4S',z:'w22_map4_test',x:830,y:4560,to:'m3N',go:tp(1000,4712),arm:1.6},
 {id:'m4N',z:'w22_map4_test',x:1258,y:320,to:'m5S',go:call(()=>M4().goMap5()),lock:()=>!flag('map4_portal_open')},
 {id:'m5S',z:'w22_map5_test',x:1600,y:3160,to:'m4N',go:call(()=>M4().map5.goBack())},
 {id:'m5N',z:'w22_map5_test',x:1030,y:470,to:'m6S',go:call(()=>M4().goMap6()),lock:()=>!flag('map5_north_arch_open')},
 {id:'m6S',z:'w23_map6_test',x:1880,y:3400,to:'m5N',go:call(()=>M4().map6.goBack())},
 {id:'m6N',z:'w23_map6_test',x:1880,y:620,to:'m7S',go:call(()=>M4().goMap7()),lock:()=>!flag('map6_ice_gate_open')},
 {id:'m7S',z:'w23_map7_test',x:1880,y:4150,to:'m6N',go:call(()=>M4().map7.goBack())},
 {id:'m7N',z:'w23_map7_test',x:1980,y:560,to:'m8S',go:call(()=>M4().goMap8())},
 {id:'m8S',z:'w23_map8_test',x:1890,y:4080,to:'m7N',go:call(()=>M4().map8.goBack())},
 /* fix-r1 (DeaRz 6 Nov): the Map 8 'แมพ 9 หอโคมไฟ' warp circle on the snow is removed; Map 9 is entered only by walking into the sky tower door (deck, NW end) */
 {id:'m10W',z:'w24_map10_test',x:830,y:1170,to:'m3E',go:tp(30,1500)},
 {id:'m10E',z:'w24_map10_test',x:2880,y:1430,dest:null,go:null,lock:()=>true},
];
const BY={};for(const c of C){BY[c.id]=c;c.s={lvl:.18,goT:-1,arrT:-1,stand:0,arm:true,acc:0,parts:[]};}
for(const c of C){c.dest=c.to?BY[c.to].z:c.dest;c.col=DUNG.has(c.dest)?'dungeon':TOWN.has(c.dest)?'town':'warp';}
WP.circles=C;
/* r2 edit mode (DeaRz 2 Nov 12:26 "ทำให้ผม ลบวาฟเก่าและวางวาฟใหม่ได้หน่อย"): positions / removed circles kept in this browser, exported as JSON */
/* v2y bake (DeaRz 3 Nov 16:48 export, "ok ผ่านนำเข้าเกมจริงได้เลย"): his circle spots become the defaults; ?warpbake=off = r7 defaults */
const BAKE=!/[?&]warpbake=off/.test(location.search),BPOS={"m1E":[3541,986],"m2W":[113,785],"m2E":[5342,866],"m3W":[102,1955],"m3N":[2675,89],"m4S":[1001,4670],"m4N":[1200,56],"m5S":[1430,3291],"m5N":[781,355],"m6S":[1710,3451],"m6N":[1691,462],"m7S":[1719,4244],"m7N":[1708,338],"m8S":[1735,4162],"m8N":[1454,467]};
if(BAKE)for(const c of C){const q=BPOS[c.id];if(q){c.x=q[0];c.y=q[1];}}
const EKEY='lf_warp_edit_v1';for(const c of C){c.x0=c.x;c.y0=c.y;}
function loadEdit(){let o=null;try{o=JSON.parse(localStorage.getItem(EKEY)||'null');}catch(_){}if(!o||typeof o!=='object')return;
  if(!o.r4&&o.pos)delete o.pos.m4N;   // r4: the Map 4 north circle spot DeaRz drew on 2 Nov 15:46 replaces any older saved spot (once)
  for(const c of C){const q=o.pos&&o.pos[c.id];if(Array.isArray(q)&&isFinite(q[0])&&isFinite(q[1])){c.x=+q[0];c.y=+q[1];}c.off=!!(o.off&&o.off.indexOf(c.id)>=0);}}
loadEdit();
/* r3 (DeaRz 2 Nov 14:23 "ลบแค่ซุ้มแต่ยังวาฟไปได้เหมือนเดิม" / "จะเอาวาฟใหม่ไปตั้งแทน"): the old gate ARCHES can be removed per gate in the edit mode.
   Only the picture goes (the gate drawing + the arch prop and its collision); stepping on the old gate spot still warps as before. */
const ARCH=WP.arch={hid:{},gone:{},last:[],n:0};
{let o=null;try{o=JSON.parse(localStorage.getItem(EKEY)||'null');}catch(_){}if(o&&o.arch&&typeof o.arch==='object')for(const z in o.arch)if(Array.isArray(o.arch[z]))ARCH.hid[z]=o.arch[z].filter(k=>typeof k==='string');}
const AOFF=/[?&]archdel=off/.test(location.search);
/* r4 (DeaRz 2 Nov 15:46 "เอาวาฟเก่าที่อยู่แถวๆนี้ออกและใส่จุดใหม่ที่ผมวาง"): the old Map 4 north portal (swirl frame + 2 pillars) is removed by default;
   its walk-in spot still warps to Map 5. "↺ คืนซุ้มแมพนี้" brings it back. */
/* r5 (DeaRz 2 Nov 16:28 "วาฟเก่าเอาออกให้หมดได้เลยนะ ใช้วาฟใหม่แทน ยกเว้นวาฟแมพ 9 ไว้"): every old open gate picture is removed by default
   (Map 8 -> Map 9 tower door kept; boarded "planned" gates to maps not built yet kept). Walk-in spots still work. */
const ADEF0={
 sylva_lab:['G|cartroad_plains'],
 cartroad_plains:['G|sylva_lab','G|astoria_capital'],
 astoria_capital:['G|cartroad_plains','G|w22_map4_planned','P|w22dsGateN|2680|110','G|w22_map10_planned','P|w22dsGateE|5250|1950'],
 w22_map4_test:['P|m4Stairs|1000|4627','P|m4ShrinePlat|1580|1040','P|m4Crystal|1580|1048','P|m4ShrinePillar|1498|1002','P|m4ShrinePillar|1662|1002','P|m4Portal|1210|380','P|m4P_b3-portal-pillar-left|1085|380','P|m4P_b3-portal-pillar-right|1333|380','P|m4P_b3-gate-pillar-left|869|4617','P|m4P_b3-gate-pillar-right|1131|4617'],
 w22_map5_test:['X|m5Ring','P|m5Swirl|1431|3295','P|m5S_arch|850|330','P|m5S_pillar0|1278|3281','P|m5S_pillar1|1582|3282','P|m5S_pillar2|1302|3363','P|m5S_pillar3|1558|3363'],
 w23_map6_test:['P|m6S_gate|1784|440','P|m6S_arch|1783|3548'],
 w23_map7_test:[],
 w23_map8_test:['P|m8S_gate_1000|1706|3628']};
const ADEF=BAKE?{"astoria_capital":["G|w22_map4_planned","P|w22dsGateN|2680|110","G|cartroad_plains","G|w22_map10_planned","P|w22dsGateE|5250|1950"],"cartroad_plains":["G|w22_map20_planned","G|sylva_lab","G|astoria_capital"],"w22_map4_test":["P|m4ShrinePillar|1662|1002","P|m4ShrinePillar|1498|1002","P|m4P_b3-portal-pillar-right|1333|380","P|m4P_b3-portal-pillar-left|1085|380","P|m4Portal|1210|380","P|m4P_b3-gate-pillar-left|869|4617","P|m4P_b3-gate-pillar-right|1131|4617","P|m4Stairs|1000|4627","P|m4ShrinePlat|1580|1040","P|m4Crystal|1580|1048"],"w22_map5_test":["P|m5S_pillar3|1558|3363","P|m5S_pillar2|1302|3363","P|m5S_pillar0|1278|3281","P|m5S_pillar1|1582|3282","P|m5Swirl|1431|3295","P|m5S_arch|850|330","X|m5Ring"],"sylva_lab":["P|svChCR2_rkt|1503|908","P|svChCR5_rkt|1527|878","P|svChGdnBedM1|2180|671","P|svChGdnCanM1|2224|644","P|svChCR2_bank|2623|817","P|svChCR4_bank|2600|817","G|cartroad_plains"],"w23_map6_test":["P|m6S_gate|1784|440","P|m6S_arch|1783|3548"],"w23_map7_test":[],"w23_map8_test":["P|m8S_gate_1000|1706|3628"]}:ADEF0;   // v2y bake: DeaRz's removals (incl. 6 Map 1 props) are the defaults
{let o=null;try{o=JSON.parse(localStorage.getItem(EKEY)||'null');}catch(_){}const fresh=!(o&&o.r7);   // r7: the new default removals are added once to an older saved list
 for(const z in ADEF){if(!ARCH.hid[z])ARCH.hid[z]=ADEF[z].slice();else if(fresh)for(const k of ADEF[z])if(ARCH.hid[z].indexOf(k)<0)ARCH.hid[z].push(k);}if(!(o&&o.ug7)){const a=ARCH.hid['w23_map7_test'];if(a){const i=a.indexOf('P|m7S_gate_1000|1710|4033');if(i>=0)a.splice(i,1)}}}
const gKey=g=>'G|'+g.to,pKey=q=>'P|'+q.t+'|'+Math.round(q.x)+'|'+Math.round(q.y);
const hidSet=z=>{const a=ARCH.hid[z];return a&&a.length&&!AOFF?new Set(a):null;};
const gHidden=g=>{try{const H=hidSet(G.zone);return !!(H&&g&&H.has(gKey(g)));}catch(_){return false;}};
function archApply(){try{if(typeof PROPS==='undefined'||typeof G==='undefined')return;const H=hidSet(G.zone);if(!H)return;let n=0;
  for(let i=PROPS.length-1;i>=0;i--){const q=PROPS[i];if(q&&!q.__wpKeep&&H.has(pKey(q))){PROPS.splice(i,1);n++;const L=ARCH.gone[G.zone]||(ARCH.gone[G.zone]=[]);if(L.indexOf(q)<0)L.push(q);}}
  if(n){ARCH.n+=n;try{buildSolids();}catch(_){}}}catch(e){if(WP.err.length<20)WP.err.push('arch '+e.message);}}
{const od=drawGate;window.drawGate=function(g){if(gHidden(g))return;return od.apply(this,arguments);};}
if(typeof w22DrawGateLabels==='function'){const ol=w22DrawGateLabels;window.w22DrawGateLabels=function(){const H=hidSet(G.zone);if(!H)return ol.apply(this,arguments);
  const keep=GATES;try{GATES=keep.filter(g=>!H.has(gKey(g)));return ol.apply(this,arguments);}finally{GATES=keep;}};}
{const ol=loadZone;window.loadZone=function(){const r=ol.apply(this,arguments);archApply();return r;};}
setInterval(archApply,250);
/* r7 (DeaRz 2 Nov 18:24 "แท่นวางวาฟที่คร้ายกับรูป2 เอาออกให้หน่อยนะ"): Map 5's old stone ring is painted into the baked ground. It is covered with the
   path dirt of the same baked image (mirrored tiles, soft edge), so the plaza stays a dirt clearing. The 4 pillar collisions go with the pillars. */
const M5Z='w22_map5_test',RING={x:1431,y:3308,rx:174,ry:108};
function ringPaint(c,gk){try{const w=Math.round(RING.rx*2*gk),h=Math.round(RING.ry*2*gk),T=document.createElement('canvas');T.width=w;T.height=h;const t=T.getContext('2d');
    const ox=(RING.x-RING.rx)*gk,oy=(RING.y-RING.ry)*gk;
    /* plain dirt of the same clearing (left / right of the ring) and the path north of it, stamped at random as soft round patches */
    const SRC=[[1220,3240,1262,3380],[1598,3240,1640,3380],[1352,3070,1404,3180]];let sd=91;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};
    const R=Math.round(22*gk),D=R*2,M=document.createElement('canvas');M.width=M.height=D;const mx=M.getContext('2d');
    const base=c.getContext('2d').getImageData(Math.round(1225*gk),Math.round(3260*gk),Math.round(30*gk),Math.round(100*gk)).data;let r=0,g=0,b=0,n=0;for(let k=0;k<base.length;k+=4){r+=base[k];g+=base[k+1];b+=base[k+2];n++;}
    t.fillStyle='rgb('+Math.round(r/n)+','+Math.round(g/n)+','+Math.round(b/n)+')';t.fillRect(0,0,w,h);
    for(let k=0;k<Math.round(w*h/(R*R)*2.2);k++){const S=SRC[Math.floor(rnd()*SRC.length)],sx=(S[0]+rnd()*(S[2]-S[0]-44))*gk,sy=(S[1]+rnd()*(S[3]-S[1]-44))*gk;
      mx.globalCompositeOperation='source-over';mx.clearRect(0,0,D,D);mx.drawImage(c,sx,sy,D,D,0,0,D,D);mx.globalCompositeOperation='destination-in';
      const gr=mx.createRadialGradient(R,R,R*.35,R,R,R);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(1,'rgba(0,0,0,0)');mx.fillStyle=gr;mx.fillRect(0,0,D,D);
      t.save();t.translate(rnd()*w,rnd()*h);t.rotate(Math.floor(rnd()*4)*Math.PI/2);t.drawImage(M,-R,-R);t.restore();}
    t.globalCompositeOperation='destination-in';t.save();t.translate(w/2,h/2);t.scale(1,h/w);const g2=t.createRadialGradient(0,0,w*.45,0,0,w/2);g2.addColorStop(0,'rgba(0,0,0,1)');g2.addColorStop(1,'rgba(0,0,0,0)');
    t.fillStyle=g2;t.beginPath();t.arc(0,0,w/2,0,Math.PI*2);t.fill();t.restore();
    c.getContext('2d').drawImage(T,Math.round(ox),Math.round(oy));WP.ringPainted=(WP.ringPainted||0)+1;}catch(e){if(WP.err.length<20)WP.err.push('ring '+e.message);}}
{const og=genBG;window.genBG=function(zid){const c=og.apply(this,arguments);try{if(zid===M5Z){const H=hidSet(M5Z);if(H&&H.has('X|m5Ring')&&c&&c.getContext){let n=0;
    const w=()=>{const m=window.__M4T&&__M4T.map5;if(m&&m.groundOk){ringPaint(c,c.width/(ZONES[M5Z].w||3400));return;}if(++n<400)setTimeout(w,50);};w();}}}catch(_){}return c;};}
/* collisions that live in a map's own collision list go with the hidden pictures: [zone, def, key, x, y] (within 26 px) */
const SOLX=[[M5Z,'m5Solid','P|m5S_pillar0|1278|3281',1281,3272],[M5Z,'m5Solid','P|m5S_pillar1|1582|3282',1585,3273],[M5Z,'m5Solid','P|m5S_pillar2|1302|3363',1305,3354],[M5Z,'m5Solid','P|m5S_pillar3|1558|3363',1561,3354],
  ['w22_map4_test','m4Solid','P|m4ShrinePillar|1498|1002',1498,998],['w22_map4_test','m4Solid','P|m4ShrinePillar|1662|1002',1662,998],['w22_map4_test','m4Solid','P|m4Crystal|1580|1048',1580,1045]];
function m5Solids(){try{const z=G.zone,L=SOLX.filter(q=>q[0]===z);if(!L.length)return;const H=hidSet(z);let ch=0;
  for(const dn of new Set(L.map(q=>q[1]))){const d=PROP_DEFS[dn];if(!d||!Array.isArray(d.solid))continue;if(!d.__wp0)d.__wp0=d.solid.slice();
    const want=H?d.__wp0.filter(s=>!L.some(q=>q[1]===dn&&H.has(q[2])&&Math.hypot(s.dx-q[3],s.dy-q[4])<26)):d.__wp0;
    if(want.length!==d.solid.length){d.solid=want.slice();ch=1;}}
  if(ch)try{buildSolids();}catch(_){}}catch(e){if(WP.err.length<20)WP.err.push('sol '+e.message);}}
setInterval(m5Solids,500);
/* reached maps */
let seen=new Set();try{const a=JSON.parse(localStorage.getItem(WP.seenKey)||'[]');if(Array.isArray(a))seen=new Set(a);}catch(_){}
function markSeen(z){if(!z||seen.has(z))return;seen.add(z);try{localStorage.setItem(WP.seenKey,JSON.stringify([...seen]));}catch(_){}}
const reached=z=>!!z&&(seen.has(z)||(G.unlocked&&G.unlocked.has&&G.unlocked.has(z))||z==='sylva_lab'||z==='cartroad_plains'||z==='astoria_capital');
/* why a circle cannot be used right now (null = usable) */
function why(c){if(!c.go||!c.dest)return 'closed';try{if(c.lock&&c.lock())return 'lock';}catch(_){return 'lock';}if(!reached(c.dest)&&!(window.WARPWALK260&&WARPWALK260.on)&&!(window.WARPQ259&&WARPQ259.on&&WARPQ259.allow(c.dest)))return 'new';return null;}
let lastHit=-99;{const h=window.hurtPlayer;if(typeof h==='function'){window.hurtPlayer=function(){const hp=P?P.hp:0;const r=h.apply(this,arguments);try{if(P&&P.hp<hp)lastHit=time;}catch(_){}return r;};}}
const dlgOpen=()=>{try{const u=window.PROLOGUE&&PROLOGUE.ui;if(u&&u.isOpen&&u.isOpen())return true;}catch(_){}const d=document.getElementById('qDlg');return !!(d&&!d.hidden&&d.offsetParent!==null);};
const fight=now=>{if(now-lastHit<5)return true;try{return typeof CMB!=='undefined'&&!(ZONES[G.zone]&&ZONES[G.zone].safe)&&time-CMB.t<CMB.lock;}catch(_){return false;}};
const busy=()=>typeof G==='undefined'||G.state!=='play'||!!G.fade||!!G.edit||!P||P.dead||dlgOpen();
/* graphics level */
const LOW=()=>{try{if(typeof gfxCap==='function'&&gfxCap()<=1)return true;}catch(_){}return ('ontouchstart' in window)&&Math.min(innerWidth,innerHeight)<600;};
/* ---- logic (10 Hz + on draw) ---- */
let pend=null;   // {from, to, t0, z0}
{const _lz=window.loadZone;window.loadZone=function(){const r=_lz.apply(this,arguments);try{if(!/[?&]warpload=off\b/.test(location.search)&&pend&&G.zone!==pend.z0){const d=BY[pend.to];if(d&&!d.off&&G.zone===d.z){P.x=d.x;P.y=d.y+WRY*.15;P.vx=P.vy=0;if(typeof camSync==='function'){camSync();cam.x=P.x-VW/2;cam.y=P.y-VH/2;clampCam()}WP.stats.early=(WP.stats.early||0)+1}}}catch(e){}return r}}
function inner(c,x,y){const dx=(x-c.x)/WRX,dy=(y-c.y)/WRY;return dx*dx+dy*dy;}
function tick(){try{
  if(typeof G==='undefined'||!P)return;if(G.state==='play'&&!G.fade)markSeen(G.zone);
  const now=time;
  if(pend){   // waiting for the gate to move us
    if(G.zone!==pend.z0&&!G.fade&&G.state==='play'){const d=BY[pend.to];if(d&&!d.off&&G.zone===d.z){P.x=d.x;P.y=d.y+WRY*.15;d.s.arm=false;d.s.arrT=now;d.s.stand=0;WP.stats.arrive++;try{if(typeof pal==='function')burst(P.x,P.y,pal(null),24,220);}catch(_){}}pend=null;}
    else if(now-pend.t0>(G.zone!==pend.z0||G.fade?20:6)){WP.err.push('no move '+pend.from);pend=null;}
    return;}
  if(WP.edit)return;
  for(const c of C){if(c.z!==G.zone||c.off)continue;const s=c.s,k=inner(c,P.x,P.y);
    if(k>1.3)s.arm=true;   // must step off before it can be used again (after arriving on it)
    if(s.goT>=0){const g=now-s.goT;if(g>=(window.WLEAVE266&&WLEAVE266.on?WLEAVE266.dur:.5)&&!s.fired){s.fired=1;
        if(busy()){s.goT=-1;continue;}const z0=G.zone;const ok=c.go();WP.stats.go++;if(ok&&c.to)pend={from:c.id,to:c.to,t0:now,z0};}
      if(g>2.2){s.goT=-1;s.fired=0;}continue;}
    if(k<.45&&s.arm){s.stand+=.1;const w=why(c);
      if(w||busy()||fight(now)){if(s.stand>=.8&&(!s.msgT||now-s.msgT>2.5)){s.msgT=now;WP.stats.blocked[w||'busy']=(WP.stats.blocked[w||'busy']||0)+1;
          try{textAt(c.x,c.y-WRY*3.2,w==='lock'||w==='closed'?'🔒 ทางนี้ยังปิดอยู่':w==='new'?'ยังไม่เคยไป '+(NM[c.dest]||''):fight(now)?'กำลังต่อสู้ วาร์ปไม่ได้':'ยังวาร์ปไม่ได้','#ffe2a0',15,{life:1.6});}catch(_){}}}
      else if(s.stand>=.8){s.goT=now;s.fired=0;s.stand=0;s.burst=1;}}
    else s.stand=0;}
}catch(e){if(WP.err.length<20)WP.err.push('tick '+e.message);}}
setInterval(tick,100);
/* ---- drawing ---- */
/* p340 r3 (17:09 "ตัวอักษรสีดำ เห็นไม่ค่อยชัด": bigger, bolder black runes with a light halo). p340 r2 (17:02 Ok = solid centre; outer runes black). p340 (DeaRz 3 Nov 16:44 "แท่นวาฟเอาออก และใช้ VFX วาดแทน", 16:50 "ให้เปลี่ยนแค่แท่น วงที่อยู่บนแท่นยังเหมือนเดิม", 16:58 "แบบ a แต่ขอพื้นที่ตรงกลางทึบหน่อย"):
   the stone pad picture is replaced by design A (outer light ring + small runes turning the other way + soft ground shade) with a solid light disc
   under the unchanged circle. ?warppad=old = stone pad, ?warppad=1 = half-solid centre, default = solid centre (2). */
const PADV=(()=>{const m=location.search.match(/[?&]warppad=(old|1|2)/);return m?(m[1]==='old'?0:+m[1]):2;})();
const dk=(c,k)=>[Math.round(c[0]*k),Math.round(c[1]*k),Math.round(c[2]*k)];
function padA(g,t,L,surge,f,cc,colk){
  g.globalCompositeOperation='source-over';const sh=g.createRadialGradient(0,0,0,0,0,RX*1.45);sh.addColorStop(0,'rgba(10,30,20,.30)');sh.addColorStop(.7,'rgba(10,30,20,.16)');sh.addColorStop(1,'rgba(10,30,20,0)');
  g.save();g.scale(1,RY/RX);g.fillStyle=sh;g.beginPath();g.arc(0,0,RX*1.45,0,6.2832);g.fill();g.restore();
  {const A=f===1?[.62,.55,.5]:[.9,.85,.8],c0=cc.core,c1=dk(cc.mid,.95),c2=dk(cc.mid,.5),c3=dk(cc.mid,.33);const fg=g.createRadialGradient(0,-RY*.15,0,0,0,RX*1.02);
   fg.addColorStop(0,rgb(c0,A[0]));fg.addColorStop(.55,rgb(c1,A[1]));fg.addColorStop(.9,rgb(c2,A[2]));fg.addColorStop(1,rgb(c3,A[2]));
   g.save();g.scale(1,RY/RX);g.fillStyle=fg;g.beginPath();g.arc(0,0,RX*1.03,0,6.2832);g.fill();g.restore();
   g.lineWidth=5;g.strokeStyle=rgb(dk(cc.mid,.25),A[2]*.8);ell(g,RX*1.04,RY*1.04);g.stroke();}
  g.globalCompositeOperation='lighter';const R=1.2;
  g.lineWidth=30;g.strokeStyle=rgb(cc.mid,.10*L);ell(g,RX*R,RY*R);g.stroke();
  g.lineWidth=12;g.strokeStyle=rgb(cc.mid,.16*L);ell(g,RX*R,RY*R);g.stroke();
  g.save();g.lineWidth=2.4;g.strokeStyle=rgb(cc.rim,Math.min(1,.85*L));g.setLineDash([30,14]);g.lineDashOffset=t*40*(1+surge*3);ell(g,RX*1.31,RY*1.31);g.stroke();g.restore();
  g.lineWidth=1.6;g.strokeStyle=rgb(cc.core,.6*L);ell(g,RX*1.09,RY*1.09);g.stroke();
  g.globalCompositeOperation='source-over';const N=14,rot=-t*.15*(1+surge*4);if(ready>=2)for(let i=0;i<N;i++){const a=rot+i/N*6.2832,x=Math.cos(a)*RX*R,y=Math.sin(a)*RY*R-6*Math.sin(t*2+i)*(1+surge*2),sz=52;
    g.save();g.translate(x,y);g.scale(1,RY/RX);g.rotate(a+Math.PI/2);g.globalAlpha=colk==='lock'?.6:.92;g.drawImage(runeBlack((i*5)%12),-sz*.75,-sz*.75,sz*1.5,sz*1.5);g.restore();}
  g.globalAlpha=1;}
/* DeaRz 3 Nov 17:02 "อักษรรอบนอกสุดเป็นสีดำ": the outer ring runes are black (normal paint, not light) */
const blk={};function runeBlack(i){if(blk[i])return blk[i];const S=96,o=document.createElement('canvas');o.width=o.height=S;const x=o.getContext('2d');const gl=document.createElement('canvas');gl.width=gl.height=64;const y=gl.getContext('2d');y.drawImage(runes,i*64,0,64,64,0,0,64,64);y.globalCompositeOperation='source-in';y.fillStyle='#fff6dc';y.fillRect(0,0,64,64);const bk=document.createElement('canvas');bk.width=bk.height=64;const z=bk.getContext('2d');z.drawImage(runes,i*64,0,64,64,0,0,64,64);z.globalCompositeOperation='source-in';z.fillStyle='#0d0a07';z.fillRect(0,0,64,64);const c=(S-64)/2;x.globalAlpha=.55;for(let a=0;a<16;a++){const r=6;x.drawImage(gl,c+Math.cos(a/16*6.2832)*r,c+Math.sin(a/16*6.2832)*r);}x.globalAlpha=1;for(let a=0;a<8;a++){x.drawImage(bk,c+Math.cos(a/8*6.2832)*1.6,c+Math.sin(a/8*6.2832)*1.6);}x.drawImage(bk,c,c);return blk[i]=o;}

const tint={};function runeTint(i,col){const k=i+'|'+col;if(tint[k])return tint[k];const o=document.createElement('canvas');o.width=o.height=64;const x=o.getContext('2d');x.drawImage(runes,i*64,0,64,64,0,0,64,64);x.globalCompositeOperation='source-in';x.fillStyle=rgb(COL[col].rim,1);x.fillRect(0,0,64,64);return tint[k]=o;}
function ell(g,rx,ry,y0){g.beginPath();g.ellipse(0,y0||0,rx,ry,0,0,6.2832);}
function stateOf(c){const s=c.s,w=why(c),d=Math.hypot(P.x-c.x,P.y-c.y),now=time;
  const go=s.goT>=0?now-s.goT:s.arrT>=0&&now-s.arrT<2.2?now-s.arrT:-1;
  const tgt=w?.1:d<300?1:.18;return {w,go,tgt,colk:w?'lock':c.col};}
let lastT=0;
function vis(c,m){try{return inView(c.x,c.y-60,m);}catch(_){return true;}}
function nearest(){let b=null,bd=1e9;for(const c of C){if(c.z!==G.zone||c.off)continue;const d=Math.hypot(P.x-c.x,P.y-c.y);if(d<bd){bd=d;b=c;}}return b;}
function groundPass(){const f257=(window.WARPPAD257&&WARPPAD257.on)?WARPPAD257.f():1;if(f257<.02){WARPPAD257.skips++;return}if(f257<.999){const g0=ctx,fo=g0.filter;g0.filter='opacity('+(f257*100).toFixed(1)+'%)';try{return groundPass0()}finally{g0.filter=fo}}return groundPass0()}
function groundPass0(){if(window.MAPWARP213&&MAPWARP213.on){try{return MAPWARP213.ground(C,stateOf,nearest,vis)}catch(e){MAPWARP213.err='ground '+e.message;MAPWARP213.on=false}}const dt=Math.min(.05,Math.max(0,time-lastT));lastT=time;const nb=nearest();
  for(const c of C){if(c.z!==G.zone||c.off||!vis(c,260))continue;const st=stateOf(c),s=c.s,full=c===nb;
    s.lvl+=(st.tgt-s.lvl)*Math.min(1,dt*3);c._st=st;c._full=full;
    const t=time,go=st.go,surge=go>=0?Math.sin(Math.min(1,go/2.2)*Math.PI):0,L=s.lvl*(1+surge*.7),cc=COL[st.colk];
    const g=ctx;g.save();g.translate(c.x,c.y);g.scale(K,K);
    g.globalCompositeOperation='lighter';let gr=g.createRadialGradient(0,0,0,0,0,RX*1.5);gr.addColorStop(0,rgb(cc.mid,.14*L));gr.addColorStop(1,rgb(cc.mid,0));g.fillStyle=gr;ell(g,RX*1.5,RY*1.5);g.fill();
    g.globalCompositeOperation='source-over';if(PADV===0){if(ready>=2){if(st.w){g.globalAlpha=.92;}g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(base,OX,OY,BW,BH);g.globalAlpha=1;}}else{g.save();padA(g,full?t:0,Math.min(1.4,L),surge,PADV,cc,st.colk);g.restore();g.globalCompositeOperation='source-over';g.globalAlpha=1;}
    g.save();ell(g,RX,RY);g.clip();g.globalCompositeOperation='lighter';
    const tt=full?t:0,pul=full?.75+.25*Math.sin(t*2.4):.85;
    gr=g.createRadialGradient(0,0,0,0,0,RX);gr.addColorStop(0,rgb(cc.core,.22*L*pul));gr.addColorStop(.55,rgb(cc.mid,.12*L));gr.addColorStop(1,rgb(cc.mid,.05*L));g.fillStyle=gr;g.fillRect(-RX,-RY,RX*2,RY*2);
    for(let k=0;k<3;k++){const rr=[.82,.62,.4][k],dir=k%2?1:-1,sp=[.35,.6,.9][k];g.save();g.lineWidth=[2.2,1.8,1.6][k];g.strokeStyle=rgb(k?cc.core:cc.rim,Math.min(1,L));g.setLineDash([[14,10],[4,9],[22,8]][k]);g.lineDashOffset=-tt*dir*sp*60;ell(g,RX*rr,RY*rr);g.stroke();g.restore();}
    g.lineWidth=3;g.strokeStyle=rgb(cc.core,.7*L);for(let k=0;k<3;k++){const a0=tt*.8+k*2.094;g.beginPath();g.ellipse(0,0,RX*.3,RY*.3,0,a0,a0+1.3);g.stroke();}
    const N=12,rot=tt*.22*(1+surge*3);
    if(ready>=2)for(let i=0;i<N;i++){const a=rot+i/N*6.2832,fl=full?.75+.25*Math.sin(t*3+i*1.7+surge*8):.85;const x=Math.cos(a)*RX*.9,y=Math.sin(a)*RY*.9,sz=(56+8*Math.sin(a))*(1+.15*surge);
      g.save();g.translate(x,y);g.scale(1,RY/RX);g.rotate(a+Math.PI/2);g.globalAlpha=Math.min(1,fl*L);g.drawImage(runeTint(i%12,st.colk),-sz/2,-sz/2,sz,sz);g.restore();}
    g.restore();
    g.globalCompositeOperation='source-over';g.lineWidth=2;g.strokeStyle=rgb(cc.rim,.8*L*pul);ell(g,RX*1.02,RY*1.02);g.stroke();
    g.restore();WP.stats.draws++;}}
function ringBand(g,y,rx,ry,al,k,t,c,p,colk){if(al<.02)return;const col1=k%2?c.rim:c.core;
  for(const [dy,m] of [[26*p+6,.22],[12*p+3,.42],[0,1]]){const A=al*m,yy=y+dy;g.setLineDash([]);
    g.lineWidth=10;g.strokeStyle=rgb(c.mid,.10*A);g.beginPath();g.ellipse(0,yy,rx,ry,0,0,6.2832);g.stroke();
    g.lineWidth=2;g.strokeStyle=rgb(col1,.38*A);g.beginPath();g.ellipse(0,yy,rx,ry,0,Math.PI,6.2832);g.stroke();
    g.lineWidth=7;g.strokeStyle=rgb(c.mid,.55*A);g.beginPath();g.ellipse(0,yy,rx,ry,0,0,Math.PI);g.stroke();
    g.lineWidth=3;g.strokeStyle=rgb(col1,A);g.beginPath();g.ellipse(0,yy,rx,ry,0,0,Math.PI);g.stroke();
    g.lineWidth=1.2;g.strokeStyle=rgb([255,255,255],.9*A);g.beginPath();g.ellipse(0,yy,rx,ry*.995,0,.05,Math.PI-.05);g.stroke();
    if(m<1)continue;const s=t*(k%2?-1.6:1.9)+k*2;g.lineWidth=5;g.strokeStyle=rgb([255,255,255],.95*A);g.beginPath();g.ellipse(0,yy,rx,ry,0,s,s+.55);g.stroke();
    for(let i=0;i<12;i++){const a=s*.5+i/12*6.2832,x=Math.cos(a)*rx,yb=yy+Math.sin(a)*ry,front=Math.sin(a)>0,ga=A*(front?1:.4);
      if(k%2===0&&ready>=2){const q=front?22:16;g.save();g.globalAlpha=ga;g.drawImage(runeTint((i+k*3)%12,colk),x-q/2,yb-q/2,q,q);g.restore();}
      else{g.fillStyle=rgb(col1,ga);g.beginPath();g.moveTo(x,yb-4);g.lineTo(x+3,yb);g.lineTo(x,yb+4);g.lineTo(x-3,yb);g.closePath();g.fill();}}}}
function overPass(){const low=LOW(),dt=Math.min(.05,Math.max(0,time-(overPass.t||time)));overPass.t=time;
  for(const c of C){if(c.z!==G.zone||c.off||!c._st||!vis(c,320))continue;const st=c._st,s=c.s,t=time;
    const go=st.go,surge=go>=0?Math.sin(Math.min(1,go/2.2)*Math.PI):0,L=s.lvl*(1+surge*.7),cc=COL[st.colk],lvl=s.lvl;
    const g=ctx;g.save();g.translate(c.x,c.y);g.scale(K,K);
    if(c._full&&!st.w&&!(window.MAPWARP213&&MAPWARP213.on)){const Rc=RX*.92,Rcy=Rc*RY/RX,hc=RX*1.8*(.55+.45*Math.min(L,1.3));
      if(lvl>.35){const k2=Math.min(1,(lvl-.3)/.7)*(1+surge*.5);g.globalCompositeOperation='lighter';
        g.save();g.translate(0,-hc*.45);g.scale(Rc*.95,hc*.75);const pg=g.createRadialGradient(0,.15,0,0,0,1);pg.addColorStop(0,rgb(cc.core,.14*k2*lvl));pg.addColorStop(.45,rgb(cc.mid,.07*k2*lvl));pg.addColorStop(1,rgb(cc.mid,0));g.fillStyle=pg;g.beginPath();g.arc(0,0,1,0,6.2832);g.fill();g.restore();
        const NP=low?10:24;for(let i=0;i<NP;i++){const p=(((t*.3+i/NP+Math.sin(i*5.3)*.05)%1)+1)%1,sw=Math.sin(i*12.9+t*.8+p*3)*Rc*.8*(1-p*.3),x=sw,y=-p*hc*1.05,rr=(Rc*.5+Math.sin(i*3.1)*Rc*.15)*(1-p*.45)+6,al=Math.pow(Math.sin(p*Math.PI),1.1)*.16*k2*Math.min(1,L)*(low?1.5:1);
          g.save();g.translate(x,y);g.scale(1,2.9+Math.sin(i)*.5);const ag=g.createRadialGradient(0,0,0,0,0,rr);ag.addColorStop(0,rgb(i%3?cc.core:cc.mid,al));ag.addColorStop(.5,rgb(cc.mid,al*.45));ag.addColorStop(1,rgb(cc.mid,0));g.fillStyle=ag;g.beginPath();g.arc(0,0,rr,0,6.2832);g.fill();g.restore();}
        g.globalCompositeOperation='source-over';const NR=low?2:3;for(let k=0;k<NR;k++){const p=((t*.28+k/NR)%1),y=-p*hc,al=Math.pow(Math.sin(p*Math.PI),.8)*k2;ringBand(g,y,Rc*(.94+.08*p),Rcy*(.94+.08*p),al,k,t,cc,p,st.colk);}}
      // sparkles
      const P2=s.parts;s.acc+=dt*(lvl<.3?4:18)*(low?.5:1);while(s.acc>1){s.acc--;const a=Math.random()*6.283,r=Math.sqrt(Math.random());P2.push({x:Math.cos(a)*RX*.62*r,y:Math.sin(a)*RY*.85*r,vy:-(25+Math.random()*50),vx:(Math.random()-.5)*12,life:0,max:1.8+Math.random()*1.4,s:1+Math.random()*2.2,ph:Math.random()*6});}
      if(s.burst||(go>=0&&go<.12&&!s.bdone)){s.burst=0;s.bdone=1;for(let i=0;i<(low?20:40);i++){const a=Math.random()*6.283,r=Math.sqrt(Math.random());P2.push({x:Math.cos(a)*RX*.62*r,y:Math.sin(a)*RY*.85*r,vy:-(60+Math.random()*160),vx:(Math.random()-.5)*80,life:0,max:1.2+Math.random(),s:1+Math.random()*2.2,ph:Math.random()*6});}}
      if(go<0)s.bdone=0;
      g.globalCompositeOperation='lighter';
      for(let i=P2.length-1;i>=0;i--){const p=P2[i];p.life+=dt;if(p.life>p.max){P2.splice(i,1);continue;}p.y+=p.vy*dt;p.x+=p.vx*dt+Math.sin(p.life*4+p.ph)*8*dt;
        const a=Math.sin(p.life/p.max*Math.PI);g.fillStyle=g.strokeStyle=rgb(cc.core,a*.95*Math.max(.3,L));if(p.s>1.9){const q=p.s*2.6*(.7+.3*Math.sin(p.life*9+p.ph));g.lineWidth=1.5;g.beginPath();g.moveTo(p.x-q,p.y);g.lineTo(p.x+q,p.y);g.moveTo(p.x,p.y-q);g.lineTo(p.x,p.y+q);g.stroke();}else g.fillRect(p.x-p.s,p.y-p.s,p.s*2,p.s*2);}
      if(P2.length>160)P2.splice(0,P2.length-160);
      // go flash (a soft bloom around the circle; the map's own fade does the screen)
      if(go>=0&&go<.6){const fa=.55*Math.sin(Math.min(1,go/.5)*Math.PI);const fg=g.createRadialGradient(0,-RY,0,0,-RY,RX*2.4);fg.addColorStop(0,rgb(cc.core,fa));fg.addColorStop(1,rgb(cc.core,0));g.fillStyle=fg;g.fillRect(-RX*2.4,-RY-RX*2.4,RX*4.8,RX*4.8);}
      g.globalCompositeOperation='source-over';}
    g.restore();
    // label: where it goes (only near)
    const d=Math.hypot(P.x-c.x,P.y-c.y);if(d<300&&go<0){const txt=st.w==='closed'||st.w==='lock'?'🔒 '+(c.dest?(NM[c.dest]||''):'ยังไม่เปิด'):'วาร์ป → '+(NM[c.dest]||'');
      ctx.save();ctx.globalAlpha=Math.min(1,(300-d)/80)*(st.w?.7:1);ctx.font='bold 13px sans-serif';ctx.textAlign='center';const w=ctx.measureText(txt).width+16,y=c.y-WRY-30;
      ctx.fillStyle='rgba(10,16,28,.6)';ctx.fillRect(c.x-w/2,y-15,w,22);ctx.fillStyle=st.w?'#c9ced6':'#cfefff';ctx.fillText(txt,c.x,y+1);ctx.restore();}}}
/* ---- r2: warp edit mode ----
   Button "✏️ แก้วงวาร์ป" -> panel with the circles of the map you are in. While it is open no circle warps.
   - click a circle on the map = select it, drag = move it
   - 🗑 ลบวงนี้ = the circle disappears (its link still works by walking through the map's own gate)
   - 📍 วางที่ตัวละคร = put the selected circle (also a removed one) where the hero stands; or press "วางด้วยการคลิก" then click the ground
   - ↺ คืนวงนี้ / ↺ คืนทั้งหมด = back to the built-in spot
   - 💾 บันทึก keeps the layout in this browser (lf_warp_edit_v1); ⬇ ส่งออก gives the JSON to send to the code chat to bake in
   The links between maps stay the game's own (a circle can be moved / removed / put back, not pointed at another map).
   ?wedit=off = no edit button. */
const WE=WP.ed={on:false,sel:null,drag:null,place:false,arch:false,dirty:false};
if(!/[?&]wedit=off/.test(location.search)){try{
const css=document.createElement('style');css.textContent=`
#wpEdBtn{position:fixed;right:12px;top:calc(232px + env(safe-area-inset-top,0px));z-index:58;padding:6px 12px;border-radius:10px;border:1px solid #6fd3ff;background:rgba(8,22,40,.88);color:#cfefff;font:600 13px sans-serif;cursor:pointer}
#wpEdBtn.on{background:#1f6f9a;color:#fff}
#wpEdPanel{position:fixed;right:12px;top:calc(272px + env(safe-area-inset-top,0px));z-index:58;width:260px;max-width:calc(100vw - 24px);max-height:calc(100vh - 300px);overflow:auto;padding:10px;border-radius:12px;border:1px solid #3f8fb8;background:rgba(6,16,30,.94);color:#e4f4ff;font:12px/1.45 sans-serif;box-sizing:border-box}
#wpEdPanel .mut{color:#9fb8c9}#wpEdPanel .r{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}
#wpEdPanel button{font:12px sans-serif;padding:5px 8px;border-radius:7px;border:1px solid #3f8fb8;background:#0d2236;color:#e4f4ff;cursor:pointer}
#wpEdPanel button:disabled{opacity:.4;cursor:default}#wpEdPanel button.del{border-color:#c46a6a;color:#ffd0d0}#wpEdPanel button.on{background:#1f6f9a}
#wpEdList div{padding:4px 6px;border-radius:6px;cursor:pointer;margin:2px 0;border:1px solid transparent}#wpEdList div.sel{border-color:#6fd3ff;background:#123049}
#wpEdPanel textarea{width:100%;height:90px;font:11px monospace;background:#03080f;color:#e4f4ff;border:1px solid #3f8fb8;border-radius:6px;box-sizing:border-box}`;
document.head.appendChild(css);
const btn=document.createElement('button');btn.id='wpEdBtn';btn.type='button';btn.hidden=true;btn.textContent='✏️ แก้วงวาร์ป';
const pan=document.createElement('div');pan.id='wpEdPanel';pan.hidden=true;
pan.innerHTML=`<div><b>แก้วงวาร์ป</b> <span id="wpEdSt" class="mut"></span></div>
<div class="mut">คลิกวงบนแมพเพื่อเลือก ลากเพื่อย้าย · ระหว่างแก้ วงจะไม่วาร์ป · เดินไปส่วนอื่นของแมพได้ตามปกติ</div>
<div id="wpEdList"></div>
<div id="wpEdSel" class="mut">ยังไม่ได้เลือก</div>
<div class="r"><button data-a="del" class="del">🗑 ลบวงนี้</button><button data-a="here">📍 วางที่ตัวละคร</button><button data-a="click">🖱 วางด้วยการคลิก</button><button data-a="reset1">↺ คืนวงนี้</button></div>
<div class="mut" style="margin-top:8px"><b>ซุ้มประตูเดิม</b> ลบแค่ภาพ เดินเข้าตรงนั้นยังวาร์ปได้เหมือนเดิม</div>
<div class="r"><button data-a="arch" class="del">🏛 ลบซุ้ม (คลิกที่ซุ้ม)</button><button data-a="archUndo">↶ คืนซุ้มล่าสุด</button><button data-a="archReset">↺ คืนซุ้มแมพนี้</button></div>
<div class="r"><button data-a="save">💾 บันทึก</button><button data-a="export">⬇ ส่งออก</button><button data-a="resetAll">↺ คืนทั้งหมด</button></div>
<div class="r"><button data-a="close">ปิดโหมดแก้</button></div>
<textarea id="wpEdOut" hidden readonly></textarea><div class="r"><button data-a="copy" hidden>📋 คัดลอก</button></div>`;
const mount=()=>{if(!document.body){setTimeout(mount,200);return;}document.body.appendChild(btn);document.body.appendChild(pan);};mount();
for(const ev of ['pointerdown','pointerup','mousedown','mouseup','touchstart','touchend','click','keydown'])pan.addEventListener(ev,e=>e.stopPropagation());
for(const ev of ['pointerdown','pointerup','mousedown','mouseup','touchstart','touchend'])btn.addEventListener(ev,e=>e.stopPropagation());
const $$=q=>pan.querySelector(q);
const here=()=>C.filter(c=>c.z===G.zone);
const lbl=c=>(c.dest?(NM[c.dest]||c.dest):'ทางที่ยังไม่เปิด');
const movedC=c=>Math.round(c.x)!==c.x0||Math.round(c.y)!==c.y0;
function ui(msg){if(!WE.on)return;const L=here(),list=$$('#wpEdList');list.innerHTML='';
  if(!L.length)list.innerHTML='<div class="mut">แมพนี้ไม่มีวงวาร์ป</div>';
  for(const c of L){const d=document.createElement('div');if(c===WE.sel)d.className='sel';
    d.textContent=(c.off?'🗑 ':'◎ ')+'ไป '+lbl(c)+(c.off?' · ลบแล้ว':movedC(c)?' · ย้ายแล้ว':'');d.onclick=()=>{WE.sel=c;WE.place=false;ui();};list.appendChild(d);}
  const s=WE.sel&&WE.sel.z===G.zone?WE.sel:null;if(!s)WE.sel=null;
  $$('#wpEdSel').innerHTML=s?`<b>ไป ${lbl(s)}</b><br>${s.off?'ลบแล้ว (กดวางเพื่อเอากลับมา)':'x '+Math.round(s.x)+', y '+Math.round(s.y)}${movedC(s)?' · เดิม '+s.x0+', '+s.y0:''}`:'ยังไม่ได้เลือก';
  let mv=0,of=0;for(const c of C){if(c.off)of++;else if(movedC(c))mv++;}
  $$('#wpEdSt').innerHTML=(WE.dirty?'<span style="color:#ffb35a">● ยังไม่บันทึก</span>':'บันทึกแล้ว')+` · ย้าย ${mv} · ลบ ${of} · ลบซุ้ม ${archCount()}`+(msg?'<br>'+msg:'');
  for(const b of pan.querySelectorAll('[data-a="del"],[data-a="here"],[data-a="click"],[data-a="reset1"]'))b.disabled=!s;
  if(s&&s.off)$$('[data-a="del"]').disabled=true;$$('[data-a="click"]').classList.toggle('on',!!WE.place);$$('[data-a="arch"]').classList.toggle('on',!!WE.arch);
  $$('[data-a="archUndo"]').disabled=!ARCH.last.length;$$('[data-a="archReset"]').disabled=!(ARCH.hid[G.zone]&&ARCH.hid[G.zone].length);}
function mark(){WE.dirty=true;ui();}
function setOn(on){if(on===WE.on)return;WE.on=WP.edit=on;pan.hidden=!on;btn.classList.toggle('on',on);WE.sel=null;WE.drag=null;WE.place=false;WE.arch=false;
  if(on){for(const c of C){c.s.goT=-1;c.s.stand=0;}ui();}else{$$('#wpEdOut').hidden=true;$$('[data-a="copy"]').hidden=true;for(const c of C)if(c.z===G.zone&&inner(c,P.x,P.y)<1.3)c.s.arm=false;}}
btn.addEventListener('click',e=>{e.stopPropagation();setOn(!WE.on);});
function putAt(c,x,y){c.x=Math.round(x);c.y=Math.round(y);c.off=false;c.s.arm=false;c.s.lvl=.18;mark();}
function stateNow(){const pos={},off=[],arch={};for(const c of C){if(movedC(c))pos[c.id]=[Math.round(c.x),Math.round(c.y)];if(c.off)off.push(c.id);}
  for(const z in ARCH.hid)if(ARCH.hid[z].length||ADEF[z])arch[z]=ARCH.hid[z].slice();return {pos,off,arch,r4:1,r5:1,r7:1,ug7:1};}
const archCount=()=>{let n=0;for(const z in ARCH.hid)n+=ARCH.hid[z].length;return n;};
function save(){const st=stateNow();try{localStorage.setItem(EKEY,JSON.stringify({ver:1,saved:new Date().toISOString(),...st}));WE.dirty=false;ui(`บันทึกแล้ว (ย้าย ${Object.keys(st.pos).length} · ลบ ${st.off.length} · ลบซุ้ม ${archCount()})`);}catch(e){ui('บันทึกไม่ได้: '+e.message);}}
function exportJson(){const st=stateNow(),rows=[];for(const c of C){if(c.off)rows.push({id:c.id,map:NM[c.z]||c.z,to:lbl(c),removed:true,was:[c.x0,c.y0]});else if(movedC(c))rows.push({id:c.id,map:NM[c.z]||c.z,to:lbl(c),from:[c.x0,c.y0],at:[Math.round(c.x),Math.round(c.y)]});}
  for(const z in ARCH.hid)for(const k of ARCH.hid[z])rows.push({map:NM[z]||z,arch_removed:k});
  const out=$$('#wpEdOut');out.value=JSON.stringify({ver:1,kind:'lanternfall_warp_edit',exported:new Date().toISOString(),...st,changes:rows},null,1);out.hidden=false;$$('[data-a="copy"]').hidden=false;out.select();ui('ส่งออกแล้ว คัดลอกข้อความนี้ส่งให้แชท code');}
pan.addEventListener('click',e=>{const b=e.target.closest('button[data-a]');if(!b)return;const a=b.dataset.a,s=WE.sel;
  if(a==='del'&&s){s.off=true;WE.place=false;mark();}
  else if(a==='here'&&s){putAt(s,P.x,P.y);WE.place=false;}
  else if(a==='click'&&s){WE.place=!WE.place;ui(WE.place?'คลิกพื้นที่จะวางวง':'');}
  else if(a==='reset1'&&s){s.x=s.x0;s.y=s.y0;s.off=false;mark();}
  else if(a==='resetAll'){for(const c of C){c.x=c.x0;c.y=c.y0;c.off=false;}for(const z in ARCH.hid)archRestore(z,ARCH.hid[z].slice());ARCH.last=[];mark();}
  else if(a==='save')save();else if(a==='export')exportJson();
  else if(a==='copy'){const t=$$('#wpEdOut').value;try{navigator.clipboard.writeText(t).then(()=>ui('คัดลอกแล้ว'),()=>{$$('#wpEdOut').select();ui('เลือกข้อความแล้ว กด Ctrl+C');});}catch(_){$$('#wpEdOut').select();}}
  else if(a==='arch'){WE.arch=!WE.arch;WE.place=false;ui(WE.arch?'คลิกที่ซุ้มประตูเดิมบนแมพเพื่อลบ (คลิกได้หลายอัน)':'');}
  else if(a==='archUndo'){const L=ARCH.last.pop();if(L)archRestore(L.z,L.keys);mark();}
  else if(a==='archReset'){const z=G.zone;archRestore(z,(ARCH.hid[z]||[]).slice());ARCH.last=ARCH.last.filter(l=>l.z!==z);mark();}
  else if(a==='close')setOn(false);});
function archRestore(z,keys){const H=ARCH.hid[z]||[];for(const k of keys){const i=H.indexOf(k);if(i>=0)H.splice(i,1);}
  if(z===G.zone&&z===M5Z&&keys.indexOf('X|m5Ring')>=0){try{BG=genBG(z);}catch(_){}}
  if(z===G.zone)setTimeout(m5Solids,0);
  if(z===G.zone){const L=ARCH.gone[z]||[];let n=0;for(let i=L.length-1;i>=0;i--){const q=L[i];if(keys.indexOf(pKey(q))>=0){L.splice(i,1);if(PROPS.indexOf(q)<0){PROPS.push(q);n++;}}}if(n)try{buildSolids();}catch(_){}}}
function archPick(wx,wy){const keys=[];
  for(const g of (typeof GATES!=='undefined'?GATES:[]))if(Math.abs(wx-g.x)<90&&wy>g.y-190&&wy<g.y+40&&!gHidden(g)){keys.push(gKey(g));break;}
  let best=null,by=-1e9;for(const q of (typeof PROPS!=='undefined'?PROPS:[])){const d=PROP_DEFS[q.t];if(!d||d.layer==='ground'||!d.w||!d.h)continue;let b;try{b=propBounds(q);}catch(_){continue;}
    if(wx<b.x||wx>b.x+b.w||wy<b.y||wy>b.y+b.h)continue;const cx=b.x+b.w/2,cy=b.y+b.h*.55,nx=(wx-cx)/(b.w*.5),ny=(wy-cy)/(b.h*.55);if(nx*nx+ny*ny>1.05)continue;if(q.y>by){by=q.y;best=q;}}
  if(best)keys.push(pKey(best));return keys;}
function archHide(keys){const z=G.zone,H=ARCH.hid[z]||(ARCH.hid[z]=[]);const add=keys.filter(k=>H.indexOf(k)<0);if(!add.length)return 0;for(const k of add)H.push(k);ARCH.last.push({z,keys:add});archApply();return add.length;}
const onCv=e=>e.target&&e.target.tagName==='CANVAS';
const wxy=e=>{try{return [mwx(e.clientX,e.clientY),mwy(e.clientX,e.clientY)];}catch(_){return null;}};
const hit=(x,y)=>{let b=null,bk=1.6;for(const c of here()){if(c.off)continue;const k=inner(c,x,y);if(k<bk){bk=k;b=c;}}return b;};
addEventListener('pointerdown',e=>{if(!WE.on||!onCv(e))return;const w=wxy(e);if(!w)return;
  if(WE.arch){e.stopImmediatePropagation();e.preventDefault();const k=archPick(w[0],w[1]);if(k.length&&archHide(k)){mark();ui('ลบซุ้มแล้ว (กดบันทึกเพื่อเก็บ) · '+k.map(x=>x.split('|')[1]).join(', '));}else ui('ตรงนี้ไม่มีซุ้มให้ลบ');return;}
  if(WE.place&&WE.sel){e.stopImmediatePropagation();e.preventDefault();putAt(WE.sel,w[0],w[1]);WE.place=false;ui();return;}
  const c=hit(w[0],w[1]);if(!c)return;e.stopImmediatePropagation();e.preventDefault();WE.sel=c;WE.drag={dx:c.x-w[0],dy:c.y-w[1],moved:false};ui();},true);
addEventListener('pointermove',e=>{if(!WE.on||!WE.drag||!WE.sel)return;const w=wxy(e);if(!w)return;e.stopImmediatePropagation();
  WE.sel.x=Math.round(w[0]+WE.drag.dx);WE.sel.y=Math.round(w[1]+WE.drag.dy);WE.drag.moved=true;},true);
addEventListener('pointerup',e=>{if(!WE.on||!WE.drag)return;e.stopImmediatePropagation();if(WE.drag.moved){WE.sel.s.arm=false;mark();}WE.drag=null;},true);
for(const ev of ['mousedown','touchstart'])addEventListener(ev,e=>{if(WE.on&&(WE.drag||WE.place||WE.arch))e.stopImmediatePropagation();},true);
let lastZ=null;setInterval(()=>{try{const play=typeof G!=='undefined'&&G.state==='play'&&!G.win&&!(typeof ED!=='undefined'&&ED.on);btn.hidden=!play;
  if(!play&&WE.on)setOn(false);if(WE.on&&G.zone!==lastZ){WE.sel=null;ui();}lastZ=typeof G!=='undefined'?G.zone:null;}catch(_){}},300);
WE.draw=function(){if(!WE.on)return;const g=ctx;g.save();g.textAlign='center';g.font='bold 12px sans-serif';
  for(const c of here()){if(c.off)continue;const on=c===WE.sel;g.lineWidth=on?3:1.5;g.setLineDash(on?[]:[6,5]);g.strokeStyle=on?'#ffe27a':'rgba(160,220,255,.9)';
    g.beginPath();g.ellipse(c.x,c.y,WRX*1.15,WRY*1.15,0,0,6.2832);g.stroke();g.setLineDash([]);
    const t='ไป '+lbl(c),w=g.measureText(t).width+12;g.fillStyle='rgba(6,16,30,.8)';g.fillRect(c.x-w/2,c.y+WRY+10,w,18);g.fillStyle=on?'#ffe27a':'#cfefff';g.fillText(t,c.x,c.y+WRY+23);}
  {const H=hidSet(G.zone);if(H)for(const gt of (typeof GATES!=='undefined'?GATES:[]))if(H.has(gKey(gt))){g.strokeStyle='rgba(255,150,120,.9)';g.lineWidth=2;g.setLineDash([5,4]);g.strokeRect(gt.x-60,gt.y-150,120,170);g.setLineDash([]);
    const t='ลบซุ้มแล้ว · ยังวาร์ปได้',w=g.measureText(t).width+12;g.fillStyle='rgba(40,10,6,.8)';g.fillRect(gt.x-w/2,gt.y-172,w,18);g.fillStyle='#ffd0c0';g.fillText(t,gt.x,gt.y-159);}}
  if(WE.arch){g.fillStyle='rgba(40,10,6,.85)';const t='โหมดลบซุ้ม: คลิกที่ซุ้ม';const w=g.measureText(t).width+14;g.fillRect(P.x-w/2,P.y-120,w,20);g.fillStyle='#ffd0c0';g.fillText(t,P.x,P.y-106);}
  g.restore();};
WE.setOn=setOn;WE.save=save;WE.exportJson=exportJson;WE.ui=ui;
}catch(e){WP.err.push('edit '+e.message);}}

{const ob=drawBeacons;window.drawBeacons=function(){try{if(typeof G!=='undefined'&&P)groundPass();}catch(e){if(WP.err.length<20)WP.err.push('ground '+e.message);}return ob.apply(this,arguments);};}
{const ot=drawTexts;window.drawTexts=function(){try{if(typeof G!=='undefined'&&P){overPass();if(WE.draw)WE.draw();}}catch(e){if(WP.err.length<20)WP.err.push('over '+e.message);}return ot.apply(this,arguments);};}
/* r6 sharp screen (DeaRz 2 Nov 17:10 "เรื่องภาพไม่คมแก้ไขหรือยัง"): on a computer the game canvas now always renders at the screen's real pixel density
   (Windows 125 % / 150 % scaling), also when the auto graphics setting has stepped down to กลาง / ประหยัด. Before, those settings drew the canvas at 1x and the
   browser stretched it = the whole map looked soft. Phones/tablets keep the old rule (speed). ?sharp=off = as before. */
if(!/[?&]sharp=off/.test(location.search)&&typeof gfxCap==='function'){const touch=('ontouchstart' in window)||navigator.maxTouchPoints>0;
  if(!touch){const og=gfxCap;window.gfxCap=function(){const d=Math.min(window.devicePixelRatio||1,2);return Math.max(og.apply(this,arguments),d);};WP.sharp=1;try{resize();}catch(_){}
    addEventListener('resize',()=>{});}}
WP.why=why;WP.markSeen=markSeen;WP.by=BY;WP.reached=reached;WP.tick=tick;
})();

