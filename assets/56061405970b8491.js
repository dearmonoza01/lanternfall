
/* ---- p304 r1: REAL v2j (DeaRz 25 Oct 02:07, 3 screenshots).
   1. Map 3: the district name written on the ground under the hero's feet ("ตลาดและร้านทั่วไป · Market & General Store", ...) is gone.
      (It was the only on-ground name label in the game; the zone banner / map screen names stay.)
   2. Grass / flower stepping standard = Map 2 (p219 root rule) for EVERY walk-through grass, flower clump and low bush in every map,
      and for any such prop added later (picked by name: grass / flower / bush / reed / fern / tuft / clump / หญ้า / ดอก / พุ่ม / เฟิร์น,
      walk-through = no collision discs, not a flat ground decal; pots, planters, flower beds, trees, rocks, hay, crates ... never):
      - the clump sorts at its ROOT against the character's FEET (P.y + the hero's foot offset): feet behind the root -> the whole clump
        is drawn over the character; feet past the root -> the character is drawn over the clump. So feet never stick out under a clump
        that covers the body (Map 3 flowers sorted at their anchor, Map 1 grass 30 px behind the hero).
      - never turned see-through (nofade). Monsters sort the same way. Collision / art / size / placement unchanged.
      Debug window.__GSTD (types, keys); ?gstd=off turns it off.
   3. Map 3 north gate (Veilwater Pass): the boards are off. Open stone arch with a soft blue warp light; walking into it goes to Map 4
      (the existing p294 link, arrival at Map 4's south stairs). Label: "Map 4 · Lv 10–18". ---- */
(function(){'use strict';
const ST=window.__GSTD={ver:'p304-r1',on:!/gstd=off/.test(location.search),types:[],keys:0,err:null,labels:null,gate:0};
const M3='astoria_capital';
/* 1. ground district labels off */
try{const W_=window.W22||window.__W22;if(W_){ST.labels=Array.isArray(W_.districts)?W_.districts.length:0;W_.districts=[];}}catch(e){ST.err='labels '+e.message;}
/* 2. grass standard */
const VEG=/grass|flower|bush|reed|fern|tuft|clump|หญ้า|ดอก|พุ่ม|เฟิร์น|ใบไม้คลุมดิน/i;
const NOT=/pot|planter|flower ?bed|tree|ต้นไม้|กระถาง|แปลง|hay|ฟาง|rock|หิน|ตอไม้|ขอนไม้|stall|cart|flag|ถัง|ลัง|หีบ|ป้าย|ตะกร้า|tumbleweed|seaweed|floor|collision|front piece|outside/i;
const KIND=new Map();
function isVeg(t){let v=KIND.get(t);if(v!==undefined)return v;const d=PROP_DEFS[t];v=false;
  if(d){let s=t+' '+(d.n||'');const m=/\(([A-Za-z0-9_]+)\)\s*$/.exec(d.n||'');if(m&&m[1]!==t&&PROP_DEFS[m[1]])s+=' '+m[1]+' '+(PROP_DEFS[m[1]].n||'');/* Map 3 dressing kits name their source art */v=VEG.test(s)&&!NOT.test(s)&&!(d.solid&&d.solid.length)&&d.layer!=='ground'&&(d.h||0)<200;
    if(v){d.nofade=1;ST.types.push(t);}}
  KIND.set(t,v);return v;}
try{for(const t in PROP_DEFS)isVeg(t);}catch(e){ST.err='scan '+e.message;}
const FOOT=(window.__HERO3D&&+__HERO3D.footY)||10;
if(typeof depthKey==='function'){const o=depthKey;depthKey=function(e){
  if(ST.on&&e&&e!==P&&typeof e.t==='string'&&e.hp===undefined&&isVeg(e.t)){let T=.866;try{T=camT()||T;}catch(_){}ST.keys++;return o({x:e.x,y:e.y-FOOT/T});}
  return o.apply(this,arguments);};}
else ST.err='depthKey missing';
{const oL=loadPropsFor;loadPropsFor=function(zid){const r=oL.apply(this,arguments);try{if(Array.isArray(r))for(const q of r)if(q&&typeof q.t==='string')isVeg(q.t);}catch(_){}return r;};}
/* 3. Map 3 north gate open */
const ISN=g=>g&&g.to==='w22_map4_planned';
{const og=gatesFor;gatesFor=function(zid){const out=og.apply(this,arguments);
  try{if(zid===M3)for(const g of out)if(ISN(g)){g.open4=1;g.sub='Map 4 · Lv 10–18 · ออกนอก Safe Zone';}}catch(_){}return out;};}
if(typeof drawGate==='function'){const od=drawGate;drawGate=function(g){if(!(g&&g.open4))return od.apply(this,arguments);
  ST.gate++;const x=g.x,y=g.y,t=typeof time==='number'?time:performance.now()/1000;ctx.save();ctx.translate(x,y);
  // warp light inside the arch (behind the stones)
  const gr=ctx.createRadialGradient(0,-48,4,0,-48,62);gr.addColorStop(0,'rgba(190,240,255,.75)');gr.addColorStop(.55,'rgba(110,190,255,.38)');gr.addColorStop(1,'rgba(80,150,255,0)');
  ctx.save();ctx.beginPath();ctx.moveTo(-42,6);ctx.lineTo(-42,-78);ctx.arc(0,-78,42,Math.PI,TAU);ctx.lineTo(42,6);ctx.closePath();ctx.clip();
  ctx.globalAlpha=.8+.2*Math.sin(t*2.2);ctx.fillStyle=gr;ctx.fillRect(-46,-124,92,132);
  ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.35;ctx.strokeStyle='#bfefff';ctx.lineWidth=2;
  for(let i=0;i<3;i++){const k=((t*.45+i/3)%1);ctx.beginPath();ctx.ellipse(0,-40,8+k*34,(8+k*34)*1.5,0,0,TAU);ctx.globalAlpha=.35*(1-k);ctx.stroke();}
  ctx.restore();
  // ground glow at the threshold
  ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.35+.1*Math.sin(t*2.2);ctx.fillStyle='#7cc8ff';ctx.beginPath();ctx.ellipse(0,2,40,9,0,0,TAU);ctx.fill();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  // the same stone arch as before, without the boards
  ctx.fillStyle='#3a3f4c';ctx.fillRect(-58,-80,16,86);ctx.fillRect(42,-80,16,86);ctx.strokeStyle='#4a5060';ctx.lineWidth=14;ctx.beginPath();ctx.arc(0,-78,50,Math.PI,TAU);ctx.stroke();
  ctx.restore();};}
else ST.err=(ST.err?ST.err+'; ':'')+'drawGate missing';
})();

