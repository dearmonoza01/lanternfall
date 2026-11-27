
/* ---- p265 walk r2 (r2: idle sheets re-cut the same way, follow-up from the monster review 18 Oct; body centre within ±1 px across idle frames,
   idle and walk share the same centre so starting / stopping does not jump). r1: Map 4 monster walk without the shake (DeaRz 18 Oct 15:09 "ท่าเดินของหมูป่า เต่า โกเลม แมพ4 มันกระตุกๆแปลกๆ";
   spec art/monsters/map4-walk-check-r1/walk-check-r1.md). TEST only. Runs before p254 so the Elder Ruin Warden recolour uses the new sheet.
   - Cause: the move sheets were cut with every frame placed on its lowest foot pixel, and the lowest foot changes from step to step, so the
     whole body jumped sideways up to 34 px between frames (Turtle N, Boar S 32, Gale E 13, Warden E 9).
   - Fix (art data only): the move sheet of Moss Turtle, Stone Boar, Gale Feather and Ruin Warden is re-cut from the same frames: each frame is
     moved sideways by whole pixels so its body centre (top 70 % of the solid pixels) sits where the idle pose of that direction has it
     (no jump when it starts or stops walking). Foot line, scale, frame order unchanged; never flipped; no other pose touched. The cell is
     wider by the largest shift and has its own anchor. Body moves <= 1 px between frames in every direction.
   - Turning / stopping no longer wait for a "foot down" frame (grounded = every frame) so the side changes without a held step.
   - Leg speed follows walking speed: a slow wander plays the step cycle slower (down to 35 %), a full chase at the authored rate, so the feet
     do not churn while the body barely moves. Rendering only: stats, AI, speed, collision, spawns, save untouched. ---- */
(function(){'use strict';
const W={"turtle":{"move":{"src":"assets/54a5341d23d88b2a.webp","cell":[249,126],"anchor":[126,119]},"idle":{"src":"assets/2ce74143eeb931ad.webp","cell":[185,126],"anchor":[94,119]}},"boar":{"move":{"src":"assets/b6f468be0cf274ab.webp","cell":[307,141],"anchor":[153,133]},"idle":{"src":"assets/784d6106da05e8e0.webp","cell":[261,141],"anchor":[130,133]}},"gale":{"move":{"src":"assets/7d86be7edb72eeba.webp","cell":[183,123],"anchor":[96,116]},"idle":{"src":"assets/d1d0711270b303f4.webp","cell":[163,123],"anchor":[86,116]}},"warden":{"move":{"src":"assets/ec67938d7803b0af.webp","cell":[298,256],"anchor":[149,232]},"idle":{"src":"assets/4505bd71061466cd.webp","cell":[258,256],"anchor":[129,232]}}};const ST={ok:[],err:[],swapped:{},scaled:0};window.__WALK_R1=ST;
const ALL=[0,1,2,3,4,5,6,7];
function fixClips(D){if(!D||!D.clips)return;for(const n in D.clips)if(/^move_/.test(n))D.clips[n].grounded=ALL.slice();}
/* a sprite already loading its old sheets: swap sheet 1 + its image together, only once the old ones have finished loading (no mixed frame) */
function swapLive(R,arr,nw,tag){const ims={};let n=0;const ks=Object.keys(nw);
  for(const i of ks){const im=new Image();im.decoding='async';im.onload=()=>{ims[i]=im;if(++n===ks.length)go();};im.onerror=()=>ST.err.push(tag+' sheet '+i+' failed');im.src=nw[i].src;}
  function go(){if(!R.ready){setTimeout(go,50);return;}for(const i of ks){arr[i]=nw[i];R.imgs[i]=ims[i];}R.img=R.imgs[0];ST.swapped[tag]=ks.length;}}
const sheetsOf=k=>({0:W[k].idle,1:W[k].move});
try{
  const REG=window.MON_SPRITES,TR=window.__MAP4_TRIO,RW=window.__RUIN_WARDEN;
  const TT={mossback:'turtle',stoneboar:'boar',galefeather:'gale'};
  for(const t in TT){const D=TR&&TR.recs&&TR.recs[t],R=REG&&REG.byType[t];if(!D||!R){ST.err.push('no '+t);continue;}
    fixClips(D);swapLive(R,D.sheets,sheetsOf(TT[t]),t);ST.ok.push(t);}
  if(RW&&RW.rec){const rec=RW.rec,old=rec.sheets,nw=sheetsOf('warden');
    rec.sheets=old.slice();rec.sheets[0]=nw[0];rec.sheets[1]=nw[1];rec.sheet=nw[0].src;fixClips(rec);   // new array: the Map 4 Elder copy (recoloured at load, after this) starts from the new sheet
    if(REG&&REG.byType.ruinwarden)swapLive(REG.byType.ruinwarden,old,nw,'ruinwarden');ST.ok.push('ruinwarden');}
  else ST.err.push('no ruinwarden');
}catch(er){ST.err.push(er.message);}
/* leg speed follows walking speed */
const VK={mossback:1,stoneboar:1,galefeather:1,ruinwarden:1,ruinwarden_m4:1},KMIN=.35;
{const o=drawEnemy;drawEnemy=function(e){try{if(e&&VK[e.type]&&!e.dead){const R=window.MON_SPRITES&&MON_SPRITES.byType[e.type],r=R&&R.recs.get(e);
    if(r){const dt=r._wt!=null?Math.min(.1,Math.max(0,time-r._wt)):0;r._wt=time;
      if(r.clip==='move'&&!r.force&&dt>0){const v=(e.m&&e.m.sp)||60,k=Math.max(KMIN,Math.min(1,r.spd/(v*.75)));if(k<1){r.t0+=dt*(1-k);ST.scaled++;}r._k=k;}}}}catch(_){}
  return o.apply(this,arguments);};}
})();

