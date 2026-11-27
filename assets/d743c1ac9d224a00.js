
/* ---- p294 r1: REAL GAME build (DeaRz 23 Oct 18:27 "รวมเข้าเกมจริงได้เลย", choice page 24 Oct 00:54, 24 Oct 00:56 "แมพ4-8 ... เปิดได้เลย").
   Maps 4-8 + Cave 1 are real maps now (the save is written there like Maps 1-3; the TEST snapshot / storage hold / save block are removed
   by the build's text patches):
   - Map 3's north gate walks into Map 4 (arrival at Map 4's south stairs); walking off Map 4's south edge goes back to Map 3, south of its north gate.
   - Continue from a save made in Map 4-8 / Cave 1 puts the hero back in that map (Cave 1: at the cave mouth in Map 4).
   - Zone names lose "(TEST)"; the TEST tray, the TEST tools panel, the layout editor and the dev panel are hidden; the weapon switch buttons stay
     (the only way to change weapon) without "(TEST)".
   - Map 8's sky deck to Map 9 stays closed. Map 9 is not in the game. ---- */
(function(){'use strict';
const L=window.__LIVE={ver:'p294-r2',err:null,stats:{gate:0,south:0,resume:0,resumeZone:null}};
const M4=window.__M4T;if(!M4||!M4.enter||!M4.r28){L.err='Map 4 module missing';return;}
const M3='astoria_capital',BACK={zone:M3,x:2680,y:330};
const SUBS={w22_map5_test:'map5',w23_map6_test:'map6',w23_map7_test:'map7',w23_map8_test:'map8'};
const FAM=new Set([M4.id,'w22_cave1_test',...Object.keys(SUBS)]);L.fam=[...FAM];
/* names */
for(const z of FAM){const Z=ZONES[z];if(!Z)continue;
  Z.n=String(Z.n).replace(/\s*\(TEST\)/,'');Z.th=String(Z.th).replace(/\s*·\s*แมพทดสอบ/,'');
  Z.sub=String(Z.sub).replace(/\s*·\s*TEST\s*·\s*ไม่บันทึกเซฟ/,'').replace(/\s*·\s*TEST/,'');}
{const SUBT={w22_map4_test:'Map 4 · Lv 10–18',w22_cave1_test:'ถ้ำใต้แมพ 4 · Lv 13–18',w22_map5_test:'Map 5 · Lv 18–24',w23_map6_test:'Map 6 · Lv 24–30',w23_map7_test:'Map 7 · Safe Zone',w23_map8_test:'Map 8 · Safe Zone'};
  for(const z in SUBT){const Z=ZONES[z];if(!Z)continue;Z.sub=SUBT[z];if(/^Map \d$/.test(Z.n)&&Z.th)Z.n=Z.th;}}
/* Map 3 north gate -> Map 4 */
function goMap4(){if(M4.on||G.state!=='play'||G.fade)return;L.stats.gate++;
  if(M4.enter())M4.back=Object.assign({},BACK);}
{const oT=travel;travel=function(to,how){if(to==='w22_map4_planned'){goMap4();return;}return oT.apply(this,arguments);};}
/* Map 4 south edge -> Map 3 (arrival is at gate.y+54; the walkable ground ends near gate.y+93) */
setInterval(()=>{try{if(G.zone!==M4.id)L.z=null;if(!M4.on||G.zone!==M4.id||G.fade||G.state!=='play'||!P)return;
  if(L.z!==G.zone){L.z=G.zone;L.zt=performance.now();}if(performance.now()-L.zt<1500)return;
  if(P.y>M4.gate.y+79&&Math.abs(P.x-M4.gate.x)<260){L.stats.south++;M4.back=Object.assign({},BACK);G.fade={t:0,fn:()=>{M4.exit();}};}}catch(e){L.err='south '+e.message;}},150);
/* Continue from a save inside Maps 4-8 / Cave 1 */
function resume(){const z=G.zone;if(!FAM.has(z)||M4.on)return;const pos=[P.x,P.y];L.stats.resume++;L.stats.resumeZone=z;
  M4.on=true;M4.block=false;M4.back=Object.assign({},BACK);
  if(z===M4.id){M4.r28.enter();return;}
  if(z==='w22_cave1_test'){M4.load(M4.id,{x:M4.cave.x,y:M4.cave.y+80});M4.r28.enter();return;}
  const m=M4[SUBS[z]];if(m&&m.enter){m.enter(pos,-Math.PI/2);}else{M4.load(M4.id,{x:M4.gate.x,y:M4.gate.y+54});M4.r28.enter();}}
{const oS=startGame;startGame=function(){const r=oS.apply(this,arguments);try{resume();}catch(e){L.err='resume '+e.message;}return r;};}
/* hide test tools, keep the weapon switch */
{const s=document.createElement('style');s.textContent='#hudTrayBtn,#hudTray,#r2tBtn,#r2tPanel,#bEdit,#bDev,#ds3View{display:none!important}';document.head.appendChild(s);}
/* Map 3 district names without the layout ids ("Z4 · ") */
try{const W_=window.W22||window.__W22;if(W_&&Array.isArray(W_.districts))for(const d of W_.districts)d.n=String(d.n).replace(/^Z\d+\s*·\s*/,'');}catch(_){}
/* Map 3: normal view (the layout-review frames, IDs and zone borders are off) */
try{if(window.__DS3)__DS3.setView('normal');}catch(_){}
const STRIP=['bowTestBtn','stfTestBtn'];
setInterval(()=>{try{for(const id of STRIP){const b=document.getElementById(id);if(!b)continue;for(const n of b.childNodes)if(n.nodeType===3&&/\(TEST\)/.test(n.textContent))n.textContent=n.textContent.replace(/\s*\(TEST\)/,'');}
  const zt=document.querySelectorAll('#zoneTag *,#banner *');for(const e of zt)for(const n of e.childNodes)if(n.nodeType===3&&/\(TEST\)|แมพทดสอบ|ไม่บันทึกเซฟ/.test(n.textContent))n.textContent=n.textContent.replace(/\s*\(TEST\)/,'').replace(/\s*·\s*แมพทดสอบ/,'').replace(/\s*·\s*TEST\s*·\s*ไม่บันทึกเซฟ/,'');}catch(_){}},400);
})();

