
/* ---- r141e mobnamefix (labels in one top pass) (TEST ONLY, DeaRz 17 Nov 10:29 "ทำไมชื่อมันทับกันแบบนี้"): monster name labels were drawn at a fixed spot above each monster, so a crowd on one spot piled its labels on top of each other, and they were still drawn on the death screen.
   Hook: drawEnemy's label block now asks MNFIX.begin(e, text, x, y, ctx) for its text and y; MNFIX.end(ctx) restores the alpha. One label per monster (there is only one label code path; the "double" labels in the screenshot were two different monsters stacked, plus a one-frame dark outline ghost when the elite glyph appeared).
   Rules: no label on the death screen / outside play; labels collide-test per frame in draw order (back to front); a colliding label moves UP in rows of 13 px (max 4), smoothed so it does not jitter; crowd (more than 6 monsters within 450 px of the hero): full "LvNN Name ⚔" only for the target (TLOCK), monsters hit / hitting recently, the one under the cursor and the 3 nearest; the others show the name only, small and 65% opaque; the target is never moved. Names stay white, the sword turns red in combat (unchanged). ?mobnamefix=off = r141c behaviour. Debug: window.MNFIX ---- */
(function(){'use strict';
const F=window.MNFIX={ver:'mobnamefix-r1',on:!/[?&]mobnamefix=off\b/.test(location.search),err:null,stats:{labels:0,moved:0,short:0,hidden:0,frames:0,ms:0},cfg:{crowdN:6,crowdR:450,fullNear:3,rowH:13,maxRows:4,tol:4,smooth:.3,shortFont:9,shortAlpha:.65}};
if(!F.on)return;let fr=null,rects=[],crowd=false,near=new Set(),cursor=null;
function frame(){try{F.stats.frames++;rects=[];near=new Set();crowd=false;cursor=null;const C=F.cfg;const vis=[];for(const e of enemies){if(e.dead)continue;let d=Math.hypot(e.x-P.x,e.y-P.y);if(d>C.crowdR*1.6)continue;vis.push([d,e])}
  let n=0;for(const v of vis)if(v[0]<=C.crowdR)n++;crowd=n>C.crowdN;if(crowd){vis.sort((a,b)=>a[0]-b[0]);for(let i=0;i<Math.min(C.fullNear,vis.length);i++)near.add(vis[i][1])}
  try{if(typeof mouse!=='undefined'&&mouse&&mouse.x!=null){const w=s2w(mouse.x,mouse.y);let bd=48;for(const v of vis){const d=Math.hypot(v[1].x-w[0],v[1].y-w[1]);if(d<bd){bd=d;cursor=v[1]}}}}catch(_){}}catch(e){F.err='frame '+e.message}}
F.begin=function(e,t,x,y,c){try{if(fr!==time){fr=time;frame()}
  if(P.dead||G.state!=='play'){F.stats.hidden++;return {hide:true}}
  const C=F.cfg,tl=window.TLOCK&&TLOCK.e,isT=e===tl;let txt=t,small=false;
  if(crowd&&!isT&&e!==cursor&&!near.has(e)&&!(e.hitT>0)&&!(typeof time==='number'&&time-(e._rbHit||-99)<3)){txt=t.replace(/^(☠ )?Lv\d+\S* /,'');small=true;F.stats.short++}
  const f0=c.font;let fS=f0;if(small)fS=f0.replace(/\d+px/,C.shortFont+'px');c.font=fS;const aS=small?c.globalAlpha*C.shortAlpha:c.globalAlpha;
  const w=Math.max(c.measureText(txt).width+(small?0:24),(window.NPLATE232&&NPLATE232.on&&e._bw)||0);c.font=f0;let dy=0;
  if(!isT){for(let r=0;r<=C.maxRows;r++){const yy=y-r*C.rowH;let hit=false;for(const q of rects){if(Math.abs(q.x-x)<(q.w+w)/2-C.tol&&Math.abs(q.y-yy)<C.rowH-1){hit=true;break}}if(!hit){dy=-r*C.rowH;break}if(r===C.maxRows)dy=-r*C.rowH}}
  const cur=e._mnDy||0;e._mnDy=Math.abs(dy-cur)<.5?dy:cur+(dy-cur)*C.smooth;const yf=y+e._mnDy;rects.push({x,y:yf,w});F.stats.labels++;if(dy)F.stats.moved++;
  return {t:txt,y:yf,small,f:fS,a:aS}}catch(er){F.err='begin '+er.message;return null}};
F.q=[];F.defer=function(e,ft,font,alpha,run){F.q.push({e,ft,font,alpha,run})};
/* one pass after every body is drawn: labels always above the monster sprites (below hit numbers and the HUD); same bb() billboard transform each label had inline; the elite / element icon hook of the inline label (ft) is reused so icons stay */
F.flush=function(bb){const q=F.q;if(!q.length)return;F.q=[];const t0=performance.now();for(const it of q){try{bb(it.e.x,it.e.y,()=>{ctx.save();ctx.font=it.font;ctx.textAlign='center';ctx.shadowColor='#000';ctx.shadowBlur=4;ctx.fillStyle='#ffffff';ctx.globalAlpha=it.alpha;const own=Object.prototype.hasOwnProperty.call(ctx,'fillText'),old=ctx.fillText;ctx.fillText=it.ft;try{it.run()}finally{if(own)ctx.fillText=old;else delete ctx.fillText}ctx.restore()})}catch(er){F.err='flush '+er.message}}F.stats.ms+=performance.now()-t0;F.stats.passes=(F.stats.passes||0)+1};
F.end=function(){};
})();

