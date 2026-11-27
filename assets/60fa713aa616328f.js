
/* ---- r204 farm plot field (TEST ONLY). Art row 400 farmplot_join_r1 (art/housing_r1/farmplot_join_r1/pack_r1/), approved by DeaRz 24 Nov 10:48 BKK
   ("ok เยี่ยม เอาเข้าเกมได้เลย"); his look choice 10:25 BKK = ONE field, outer wood frame only.
   farmPlot now uses the straight-rail art: each plot draws its soil tile (106x71, seamless), a rail only on edges with no plot neighbour, and a
   corner post where two outer edges meet. Neighbours = another farmPlot exactly one pitch away (106 left/right, 71 up/down). While placing or
   moving a farmPlot the ghost snaps to the pitch next to an existing plot (within 30 px). Watered cells = per-cell multiply on the soil.
   Footprint = the soil rect + 2 px (rails hang over). The ghost and a lone plot = farmPlot_join_full.png. Tree plots unchanged.
   L-shaped fields: the inner corner has no post (accepted by DeaRz in the mock). ?plotfield=off = old trapezoid plot. Debug window.PF204 ---- */
(function(){'use strict';
const Q=String(location.search);
const R=window.PF204={ver:'plotfield-r204',on:!/[?&]plotfield=off\b/.test(Q),err:null,stats:{draws:0,snaps:0,rails:0},PITCH:[106,71]};
if(!R.on)return;
const ERR=(w,e)=>{R.err=w+': '+((e&&e.message)||e);try{console.error('[PF204]',w,e)}catch(_){}};
const SRC={"soil": "assets/a481822642122d69.png", "rail_top": "assets/deeef44a0ff0099b.png", "rail_bottom": "assets/465678b18f484f0e.png", "rail_left": "assets/815c5befdbe9c8d4.png", "rail_right": "assets/54e2486f405f9ac8.png", "corner_tl": "assets/39dead5b5829a43c.png", "corner_tr": "assets/0314c93c5ea8d7d0.png", "corner_bl": "assets/385c5e9d58ad7384.png", "corner_br": "assets/d9bf1d034cff66d7.png", "full": "assets/4a4b7bdb4d4385d4.png"},GEO={"soil": {"size": [106.0, 71.0], "off": [0.0, 0.0]}, "rail_top": {"size": [106.0, 10.5], "off": [0.0, -10.5]}, "rail_bottom": {"size": [106.0, 14.0], "off": [0.0, 71.0]}, "rail_left": {"size": [9.5, 71.0], "off": [-9.5, 0.0]}, "rail_right": {"size": [10.0, 71.0], "off": [106.0, 0.0]}, "corner_tl": {"size": [16.0, 15.5], "off": [-9.5, -10.5]}, "corner_tr": {"size": [16.5, 15.5], "off": [99.5, -10.5]}, "corner_bl": {"size": [16.0, 19.0], "off": [-9.5, 66.0]}, "corner_br": {"size": [16.5, 19.0], "off": [99.5, 66.0]}},SPOTS=[[17.9, 11.9], [53.1, 11.9], [88.3, 11.9], [17.9, 35.5], [53.1, 35.5], [88.3, 35.5], [17.9, 59.0], [53.1, 59.0], [88.3, 59.0]];
const IM={};for(const k in SRC){const i=new Image();i.src=SRC[k];IM[k]=i}
const PX=106,PY=71,HX=53,HY=35.5;/* origin = soil tile centre */
/* ---- def: geometry of the new art ---- */
function setDef(){try{const H=window.HOUSE;const d=H&&H.items&&H.items.farmPlot;if(!d)return false;if(d._pf204)return true;d._pf204=1;
 d.sw=125.5;d.sh=95.5;d.ax=HX+9.5;d.ay=HY+10.5;d.foot=[[-55,-37.5],[55,-37.5],[55,37.5],[-55,37.5]];
 d.plantSpots=SPOTS.map(p=>[p[0]+9.5,p[1]+10.5]);d.soilPoly=[[9.5,10.5],[115.5,10.5],[115.5,81.5],[9.5,81.5]];if(d.fac)d.fac=null;return true}catch(e){ERR('def',e);return false}}
{let n=0;const iv=setInterval(()=>{if(setDef()||++n>240)clearInterval(iv)},250)}
setDef();
/* ---- time-of-day tint, same as the housing sprites ---- */
function tint(){try{const H=HOUSE;if(H.roomOn||!window.GTIME)return [255,255,255,0];const t=GTIME.tintAt(GTIME.hour());return [t[0],t[1],t[2],Math.min(H.cfg.tintMax,t[3]*H.cfg.tintBoost)]}catch(_){return [255,255,255,0]}}
const TC={};let tk='';
function piece(k){const im=IM[k];if(!im||!im.complete||!im.naturalWidth)return null;const t=tint(),key=[t[0]|0,t[1]|0,t[2]|0,Math.round(t[3]*40)].join(',');if(key!==tk){tk=key;for(const q in TC)delete TC[q]}if(t[3]<.004)return im;let c=TC[k];if(c)return c;c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const g=c.getContext('2d');g.drawImage(im,0,0);g.globalCompositeOperation='source-atop';g.fillStyle='rgba('+(t[0]|0)+','+(t[1]|0)+','+(t[2]|0)+','+t[3].toFixed(3)+')';g.fillRect(0,0,c.width,c.height);return TC[k]=c}
function put(c,k,x0,y0){const s=piece(k);if(!s)return false;const g=GEO[k];c.drawImage(s,x0+g.off[0],y0+g.off[1],g.size[0],g.size[1]);return true}
/* ---- neighbours ---- */
function plots(ex){try{return HOUSE.state().placed.filter(o=>o&&o.id==='farmPlot'&&(!ex||o.uid!==ex))}catch(_){return []}}
const near=(a,b,dx,dy)=>Math.abs(b.x-(a.x+dx))<1.5&&Math.abs(b.y-(a.y+dy))<1.5;
function nb(o){const ex=(HOUSE.build&&HOUSE.build.sel&&HOUSE.build.sel.uid)||null,L=plots(ex),r={l:0,r:0,t:0,b:0};if(!o.uid)return r;for(const q of L){if(q===o||q.uid===o.uid)continue;if(near(o,q,-PX,0))r.l=1;else if(near(o,q,PX,0))r.r=1;else if(near(o,q,0,-PY))r.t=1;else if(near(o,q,0,PY))r.b=1}return r}
R.nb=nb;
/* ---- draw (hooked from housebuild drawItem) ---- */
R.draw=function(c,it,alpha,d){try{if(!it||it.id!=='farmPlot')return false;if(!IM.soil.complete||!IM.soil.naturalWidth)return false;
 const x0=Math.round(it.x-HX),y0=Math.round(it.y-HY),n=nb(it);c.save();if(alpha!=null)c.globalAlpha=alpha;
 put(c,'soil',x0,y0);
 /* watered cells */
 const w=it.plots&&Array.isArray(it.plots.wet)?it.plots.wet:null;if(w&&w.some(Boolean)){c.save();c.globalCompositeOperation='multiply';c.fillStyle='rgb(158,153,192)';for(let i=0;i<9;i++){if(!w[i])continue;const cx=i%3,cy=(i/3)|0,ax=x0+cx*PX/3+1.2,ay=y0+cy*PY/3+1.2;c.fillRect(ax,ay,PX/3-2.4,PY/3-2.4)}c.restore()}
 if(!n.t)put(c,'rail_top',x0,y0);if(!n.b)put(c,'rail_bottom',x0,y0);if(!n.l)put(c,'rail_left',x0,y0);if(!n.r)put(c,'rail_right',x0,y0);
 if(!n.t&&!n.l)put(c,'corner_tl',x0,y0);if(!n.t&&!n.r)put(c,'corner_tr',x0,y0);if(!n.b&&!n.l)put(c,'corner_bl',x0,y0);if(!n.b&&!n.r)put(c,'corner_br',x0,y0);
 c.restore();R.stats.draws++;return true}catch(e){ERR('draw',e);return false}};
/* ---- snap the build ghost to the pitch next to a plot ---- */
R.snap=function(gh,sel){try{if(!sel||sel.id!=='farmPlot')return null;let best=null,bd=30;for(const o of plots(sel.uid)){for(const [dx,dy] of [[PX,0],[-PX,0],[0,PY],[0,-PY]]){const x=o.x+dx,y=o.y+dy,dd=Math.hypot(gh[0]-x,gh[1]-y);if(dd<bd){if(plots(sel.uid).some(q=>Math.abs(q.x-x)<1.5&&Math.abs(q.y-y)<1.5))continue;let ok='';try{ok=HOUSE.canPlaceAt(x,y,'farmPlot',sel.uid,{f:sel.f|0})}catch(_){ok='x'}if(ok==='')
  {bd=dd;best=[x,y]}}}}if(best)R.stats.snaps++;return best}catch(e){ERR('snap',e);return null}};
})();

