
/* ---- r263 QOBJ263 (TEST ONLY, ?questobj=off). DeaRz 26 Nov 09:26 UTC "เควสที่ให้เก็บของ ... ให้ Chatgpt เจนให้ทั้งหมด"; Art quest_objects_r2 (PR431, approved for REAL 12:26 UTC).
   The 7 quest gather objects are drawn as Art's sprites at every gather spot of their item while that collect objective is active and the spot is not picked:
   qi_lantern_seed, qi_herb, qi_spiked_herb, qi_lantern_flower, qi_reo_bag, qi_rag_doll, qi_frozen_trap (2x PNGs drawn at 0.5, anchor bottom-centre).
   Depth: drawn in the hero's draw call (objects above the hero's feet line before him, below it after him), so the hero walks in front of / behind them.
   A light code twinkle (3 tiny sparkles) only, no code outline. The HERBVIS231 ring, bouncing marker and label stay (marker raised above the sprite,
   label = item name); its code-drawn herb plant is not drawn when the sprite exists, and the quest-point glow of CH1Q is cut to 22 % over a sprite so the object is not washed out. Picked = gone (the spot leaves the active list). ---- */
(function(){'use strict';
const X=window.QOBJ263={ver:'questobj-r263',on:!/[?&]questobj=off\b/.test(String(location.search)),err:null,draws:0};
if(!X.on)return;
const D={"qi_lantern_seed":{"src":"assets/61d9ee23faf4efb4.png","w":23.0,"h":30.5,"ax":11.5,"ay":30.5},"qi_herb":{"src":"assets/33ef21d8c27c737d.png","w":28.5,"h":30.5,"ax":14.25,"ay":30.5},"qi_spiked_herb":{"src":"assets/3e9ca393230c6ea3.png","w":28.5,"h":30.5,"ax":14.25,"ay":30.5},"qi_lantern_flower":{"src":"assets/245aa910effb7269.png","w":24.5,"h":34.5,"ax":12.25,"ay":34.5},"qi_reo_bag":{"src":"assets/9e3ce78874e233e3.png","w":28.5,"h":23.0,"ax":14.25,"ay":23.0},"qi_rag_doll":{"src":"assets/aeaef8f2f9b4339b.png","w":20.5,"h":24.5,"ax":10.25,"ay":24.5},"qi_frozen_trap":{"src":"assets/ba09d507820870ba.png","w":33.0,"h":20.5,"ax":16.5,"ay":20.5}};
const IM={};for(const id in D){const im=new Image();im.src=D[id].src;IM[id]=im}
X.has=id=>!!(D[id]&&IM[id]&&IM[id].complete&&IM[id].naturalWidth);
X.top=id=>(D[id]?D[id].h:30)+22;
X.name=id=>{try{return (ITEMS[id]&&ITEMS[id].n)||'เก็บของ'}catch(_){return 'เก็บของ'}};
function spots(){const out=[];try{const A=window.CH1Q&&CH1Q.api;if(!A||typeof G==='undefined')return out;const S=A.state();if(!S||!S.q)return out;
  for(const qid in S.q){const r=S.q[qid];if(!r||r.s!=='a')continue;const q=A.QBY[qid];if(!q||!q.objectives)continue;const o=q.objectives[r.i|0];if(!o||o.kind!=='collect'||!D[o.item])continue;
    if(o.from==='drop')continue;if(typeof countItem==='function'&&countItem(o.item)>=(o.n||1))continue;
    const ids=o.point?[o.point]:(o.points||[]);for(const pid of ids){const p=A.PT[pid];if(!p||p.zone!==G.zone)continue;if(r.got&&r.got[pid])continue;out.push({x:p.x,y:p.y,id:o.item})}}}catch(e){X.err=e.message}return out}
function drawOne(c,s,t){const d=D[s.id],im=IM[s.id];if(!im||!im.complete||!im.naturalWidth)return;c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  c.drawImage(im,s.x-d.ax,s.y-d.ay,d.w,d.h);
  c.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const ph=t*1.6+i*2.1+s.x*.01,a=.5+.5*Math.sin(ph*1.3);if(a<.35)continue;const sx=s.x+Math.cos(ph)*d.w*.42,sy=s.y-d.h*.55+Math.sin(ph*1.1)*d.h*.35,z=1.1+a*1.3;
    c.globalAlpha=a*.85;c.fillStyle='#fff6c8';c.beginPath();c.moveTo(sx,sy-z*2);c.lineTo(sx+z*.55,sy);c.lineTo(sx,sy+z*2);c.lineTo(sx-z*.55,sy);c.closePath();c.fill()}
  c.restore();X.draws++}
function isHero(){try{return typeof P!=='undefined'&&P&&!P.dead}catch(_){return false}}
try{const _d=drawPlayer;drawPlayer=function(){let L=null;try{if(isHero()){L=spots();const t=performance.now()/1000;for(const s of L)if(s.y<=P.y)drawOne(ctx,s,t)}}catch(e){X.err='pre '+e.message}
  const r=_d.apply(this,arguments);
  try{if(L){const t=performance.now()/1000;for(const s of L)if(s.y>P.y)drawOne(ctx,s,t)}}catch(e){X.err='post '+e.message}return r}}catch(e){X.err='hook '+e.message}
})();
/* r263c FACINGURL (?facingurl=off): on the web build (web_host build.ps1 turns every data: picture into assets/<hash>.png) housebuild's setFacings() only loaded facing pictures that start with 'data:', so every multi-facing housing item (8-direction decor and the fish tank) was drawn with its default picture on the web whatever way it faced. The patched check also accepts asset / image URLs. */

