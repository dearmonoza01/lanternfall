
/* ---- npc3q-r1 (TEST, 10 Nov 2026): NPC 3/4 sprites (DeaRz PASS 10 Nov 12:57) + one-arm monk (13:18) + monsters in 2 directions (14:01) ----
   NPCs: the 12 new LEFT-facing sprites replace the old flat / 4-direction ones. Hook = drawArtNpc (chapter module, patched in the base to call NPC3QHOOK first) and drawLysel (NPC3QDRAW).
   Drawn height = hero chibi height x scale (pack table), anchor = bottom centre of the feet, 8 px padding, mirrored for RIGHT, facing = toward the hero when the hero is within 420 px (a +-14 px dead zone keeps the last facing),
   idle breath = scaleY 1.0..1.01 from the feet. Name tag, talk icon (its height is taken from the new sprite) and the talk radius are the game's own and unchanged. ?npc3q=off = the old sprites.
   Monk (หลวงตาสุริ): same anchor and scale as the old sprite (registered by content bbox), new picture. Monsters: ?mondir2=off = old directions. window.NPC3QX. ---- */
(function(){'use strict';
const Q=String(location.search),X=window.NPC3QX={ver:'npc3q-r1',on:!/[?&]npc3q=off\b/.test(Q),md2:!/[?&]mondir2=off\b/.test(Q),err:null,drawn:{},monk:0,md2n:0};
const ERR=(w,e)=>{X.err=w+': '+((e&&e.message)||e);try{console.error('[NPC3Q]',w,e)}catch(_){}};
const MAP={npc_ora:'ora',npc_mali:'mali',npc_ferro:'ferro',npc_astoria_trainer:'tor',npc_astoria_gardener:'fon',npc_traveler_m4:'reo',npc_pip:'pip',npc_pell:'pell',npc_mira:'mira',npc_hark:'hark',npc_hunter_varg:'varg',npc_angel_lysel:'lysel'};
X.map=MAP;
const IM={};
function img(k){if(IM[k]!==undefined)return IM[k];const d=window.NPC3Q&&NPC3Q[k];if(!d){IM[k]=null;return null}const i=new Image();i.decoding='async';i.src=d.src;IM[k]=i;return i}
if(X.on&&window.NPC3Q)for(const k in NPC3Q)img(k);
const FACE={};
const heroH=()=>{try{const c=window.PUPPETX&&PUPPETX.cfg;return c?c.TARGET_H*c.H_FACTOR:64}catch(_){return 64}};
function facing(key,x){let f=FACE[key];if(f===undefined)f=FACE[key]=-1;try{if(typeof P!=='undefined'&&P&&Math.abs(P.x-x)<420&&Math.abs(P.y-0)<1e9){const dx=P.x-x;if(dx<-14)f=-1;else if(dx>14)f=1}}catch(_){}FACE[key]=f;return f}
function sprite(key,x,y,a,A,noShadow){const d=NPC3Q[key],im=img(key);if(!im||!im.complete||!im.naturalWidth)return null;
  const hh=heroH()*d.scale*(key==='lysel'&&!/[?&]lyscale=off\b/.test(location.search)?1.3:1),sc=hh/(d.h-2*d.pad),dw=d.w*sc,dh=d.h*sc,t=(typeof time==='number'?time:performance.now()/1000);
  const fl=facing(key,x)>0?-1:1,sy=1+.005*(1+Math.sin(t*2.2+x*.01));
  ctx.save();if(a!=null)ctx.globalAlpha*=a;
  if(!noShadow){ctx.save();ctx.globalAlpha*=.28;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(x,y+2,dw*.22,dw*.07,0,0,6.283);ctx.fill();ctx.restore()}
  ctx.translate(x,y);ctx.scale(fl,sy);ctx.drawImage(im,-dw/2,-(d.h-d.pad)*sc,dw,dh);ctx.restore();
  if(A)A.h=Math.round(hh);   /* the talk icon / marker height of the chapter module */
  X.drawn[key]=(X.drawn[key]||0)+1;return -(d.h-d.pad)*sc}
window.NPC3QHOOK=function(id,x,y,a,A){try{if(!X.on)return false;const k=MAP[id];if(!k||!window.NPC3Q||!NPC3Q[k])return false;return sprite(k,x,y,a,A)!==null}catch(e){ERR('hook',e);return false}};
window.NPC3QDRAW=function(key,x,y){try{if(!X.on||!window.NPC3Q||!NPC3Q[key])return null;const t=sprite(key,x,y,null,null,true);return t===null?null:y+t}catch(e){ERR('lysel',e);return null}};
/* ---- the monk ---- */
try{const _dm=drawMerchant;drawMerchant=function(n){
  try{if(X.on&&n&&n.kind==='monk'&&window.NPC3Q_MONK&&window.MONK&&MONK.cfg){const M=NPC3Q_MONK;let im=M._im;if(!im){im=M._im=new Image();im.src=M.src}
    if(im.complete&&im.naturalWidth){const CF=MONK.cfg,k=CF.HEAD_PX/CF.HEAD_SRC_PX*M.half,ax=M.anchorFull[0]/M.half*k,ay=M.anchorFull[1]/M.half*k;
      ctx.drawImage(im,n.x-ax,n.y-ay,M.w*k,M.h*k);X.monk++;
      ctx.save();ctx.font='bold 12px Sarabun,sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='rgba(20,16,30,.85)';ctx.strokeText(CF.NAME,n.x,n.y+CF.TAG_DY);ctx.fillStyle=CF.TAG_COL;ctx.fillText(CF.NAME,n.x,n.y+CF.TAG_DY);ctx.restore();return}}}catch(e){ERR('monk',e)}
  return _dm.apply(this,arguments)}}catch(e){ERR('hook monk',e)}
/* ---- monsters: LEFT / RIGHT only. The monster modules pick their frame row from e.face, so while a monster is drawn e.face is snapped to the screen angle 0 (E) or PI (W);
   N / S / diagonal movement keeps the last left / right (the sign of cos(face), dead zone 0.2 keeps the previous one). e.face is restored right after the draw (the AI keeps its own value). ---- */
try{const _de=drawEnemy;drawEnemy=function(e){
  if(!X.md2||!e||typeof e.face!=='number')return _de.apply(this,arguments);
  const f0=e.face;let d=e._d2;const c=Math.cos(f0);if(c>.2)d=1;else if(c<-.2)d=-1;else if(!d)d=c>=0?1:-1;e._d2=d;
  let yaw=0;try{yaw=typeof camY==='function'?camY():0}catch(_){}
  e.face=(d>0?0:Math.PI)-yaw;X.md2n++;
  try{return _de.apply(this,arguments)}finally{e.face=f0}}}catch(e){ERR('hook drawEnemy',e)}
console.info('[NPC3Q] loaded · npc3q='+X.on+' mondir2='+X.md2);
})();
