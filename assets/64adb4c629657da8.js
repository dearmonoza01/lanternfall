
/* ---- r157: ?propsredraw=off is gone (the old art of every swapped id is removed from the file); r149 propsredraw (TEST ONLY, Art props_redraw_r1, 46 props, DeaRz 17:34 "the code outline flickers and looks rough"):
   swaps the old drawn sprite of each id for Art's redrawn one (outline baked in), at draw_wh_1x, anchored by the BOTTOM-CENTRE of the old sprite rectangle (the def's w x h box placed at (-ax,-ay)): same size, same foot position, same collision and depth (nothing of the prop def is touched).
   Per-instance scale / flip: Map 12 props use the layout (window.__M12_LAYOUT: scale + flip per placement), all other props use p.s / p.f like the game's own drawProp. The game's own "tall prop fades when the hero is behind it" rule (0.42) is reproduced; Map 12 bushes never fade.
   All swapped ids are opted out of the runtime outline (window.__OUTLINE.keyOk.set(id,false)). m7S_pine_planter_1107 reuses the 1298 art scaled to its own def size.
   ?propsredraw=off = old sprites + old outline. Live compare: PROPSREDRAW.set(true|false). Debug: window.PROPSREDRAW ---- */
(function(){'use strict';
const Q=String(location.search),PR=window.PROPSREDRAW={ver:'propsredraw-r2-aligned',scale:{'c1C_cry-s':0.6458},skip:{'m10_a_mill':1},on:true,err:null,stats:{drawn:0,fallback:0},ids:[]};
const DATA=window.__PROPS_REDRAW;if(!DATA||!DATA.items){PR.err='no data';return}
const T={};for(const id in DATA.items){const a=DATA.items[id],im=new Image();im.decoding='async';im.src=a.src;T[id]={im,w:a.w,h:a.h}}
try{const a=T.m7S_pine_planter_1298,d1=PROP_DEFS.m7S_pine_planter_1298,d2=PROP_DEFS.m7S_pine_planter_1107;if(a&&d1&&d2&&!T.m7S_pine_planter_1107){const k=d2.h/d1.h;T.m7S_pine_planter_1107={im:a.im,w:a.w*k,h:a.h*k}}}catch(e){PR.err='alias '+e.message}
PR.palmcap=!/[?&]palmcap=off\b/.test(Q);PR.ids=Object.keys(T);PR.table=T;PR.off={"m4B_reeds-b":[-12.78,2],"m7S_palace_1000":[-2.39,-28],"m7S_fountain_1000":[-0.44,-16],"c1C_cry-s":[-0.18,-19],"m12_bush_pink":[8.4,-3],"m12_bush_yellow":[8.31,-3],"m12_camel_stand":[6.29,-3],"m12_camel_walk":[6.36,-2],"m12_caravanserai":[2.86,-7],"m12_drum_stage":[37.4,-5],"m12_grandma_mew_tent":[-11.95,-5],"m12_inn":[10.79,-8],"m12_palm_small_a":[14.45,-6],"m12_palm_small_b":[14.86,-5],"m12_shop_smith":[7.31,-6],"m12_stall_fruit":[8.59,-3],"m12_stall_rugs":[12.43,-3],"m12_stall_sweets":[7.09,-3]};/* optional per-id correction [dx,dy] in world px if an id has to be moved relative to the old sprite box (empty = Art's rule: bottom-centre of the old sprite rect) */
/* Map 12: scale + flip per placement */
const LK={};try{for(const e of (window.__M12_LAYOUT||[]))LK['m12_'+e.name+'|'+Math.round(e.ex!=null?e.ex:e.x)+'|'+Math.round(e.y)]={scale:e.scale==null?1:e.scale,flip:!!e.flip}}catch(e){PR.err='layout '+e.message}
function outline(on){try{const OL=window.__OUTLINE;if(!OL||!OL.keyOk)return;for(const id of PR.ids){if(on&&!PR.skip[id])OL.keyOk.set(id,false);else OL.keyOk.delete(id)}}catch(e){PR.err='outline '+e.message}}
PR.set=v=>{PR.on=!!v;outline(PR.on);return PR.on};outline(PR.on);
function drawNew(p,R,d){let S=p.s||1,flip=p.f<0;if(p.t.indexOf('m12_')===0){const o=LK[p.t+'|'+Math.round(p.x)+'|'+Math.round(p.y)];if(o){S=o.scale;flip=o.flip}else{S=1;flip=false}}
  if(PR.palmcap&&p.t==='m12_palm_small_b'&&S*.5>1.25)S=2.5;/* r160: the 2 placements at layout scale 3.0 (1.5x the png) are capped to 1.25x, same base point */
  let fade=1;try{if(P&&!d.layer&&!d.nofade&&d.h*S>120&&!ED.on&&!/^m12_bush/.test(p.t)&&depthKey(p)>depthKey(P)){const a=w2s(p.x,p.y),b=w2s(P.x,P.y-20),z=camZ(),hw=d.w*S*z*.4,top=a[1]-d.ay*S*z;if(Math.abs(b[0]-a[0])<hw&&b[1]<a[1]&&b[1]>top)fade=.42}}catch(_){}
  const of=PR.off[p.t]||[0,0],bcx=(-d.ax+d.w/2)*S+of[0],bcy=(-d.ay+d.h)*S+of[1],SC=PR.scale[p.t]||1,dw=R.w*S*SC,dh=R.h*S*SC;ctx.save();ctx.globalAlpha*=fade;ctx.translate(p.x,p.y);if(flip)ctx.scale(-1,1);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(R.im,bcx-dw/2,bcy-dh,dw,dh);ctx.restore()}
try{const _dp=window.drawProp;window.drawProp=function(p){if(PR.on&&p&&!PR.skip[p.t]){const R=T[p.t];if(R&&R.im.complete&&R.im.naturalWidth){const d=PROP_DEFS[p.t];if(d){try{drawNew(p,R,d);PR.stats.drawn++;return}catch(e){PR.err='draw '+e.message}}}else if(R)PR.stats.fallback++}return _dp.apply(this,arguments)}}catch(e){PR.err='hook '+e.message}
})();

