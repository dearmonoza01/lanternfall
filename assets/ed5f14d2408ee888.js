
/* ---- r135 campart (TEST ONLY): Art's campfire pack r1 swapped in (icons_r1 38 x 128x128 RGBA named by item id, fire_r1 world sprites at ~2x game size, drawn at 0.5 scale, anchor bottom-centre).
   * item icons: itemIcon() returns the art for the 38 campfire / cooking item ids (bag, shop, cooking window, tooltips).
   * world: COOK.drawPile (unlit pile, fades in over the 1 s build), COOK.drawFire (pile_lit_base + 6-frame flame loop with the flame bottom at the centre of the lit base, sparks cf_spark_1..6, smoke s/m/l by age + the code glow), burn-out = ember pile fading 6 s, COOK.drawGhost (unlit pile 50 % alpha tinted green / red).
   * depth: the fire is a PROPS entry (campfire.js) so the game's y-sort puts it behind / in front of the hero.
   ?campart=off = the code-drawn look (still depth sorted). Debug: window.__CAMPART ---- */
(function(){'use strict';
const Q=String(location.search),CA=window.__CAMPART={ver:'campart-r1',on:!/[?&]campart=off\b/.test(Q),err:null,ready:0,N:{icons:0,fire:0}};
if(!CA.on||!window.COOK||!window.__CAMPART_DATA)return;
const D=window.__CAMPART_DATA,IMG={};let loaded=0,total=0;
for(const k in D.fire){total++;const im=new Image();im.onload=()=>{im.ok=true;loaded++;if(loaded>=total)CA.ready=1};im.src=D.fire[k];IMG[k]=im}
CA.N.icons=Object.keys(D.icons).length;CA.N.fire=total;CA.img=IMG;
/* ---- icons ---- */
try{const _ii=itemIcon;itemIcon=function(it){try{if(it&&it.id&&D.icons[it.id]&&!it.kind)return D.icons[it.id]}catch(_){}return _ii.apply(this,arguments)}}catch(e){CA.err='icon '+e.message}
const SC=.5,ok=k=>IMG[k]&&IMG[k].ok;
function spr(c,k,x,yb,s,al){const im=IMG[k];if(!im||!im.ok)return false;const w=im.naturalWidth*SC*s,h=im.naturalHeight*SC*s;c.globalAlpha=al==null?1:al;c.drawImage(im,x-w/2,yb-h,w,h);return true}
const O={pile:COOK.drawPile,fire:COOK.drawFire,ghost:COOK.drawGhost};
COOK.drawPile=function(c,f,u){if(!ok('pile_unlit'))return O.pile.apply(this,arguments);c.save();c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(f.x,f.y+2,34,11,0,0,7);c.fill();const k=.86+.14*Math.min(1,u);spr(c,'pile_unlit',f.x,f.y+6,k,Math.min(1,u*1.7));c.restore()};
COOK.drawFire=function(c,f,t,k){if(!ok('pile_lit_base')||!ok('flame_1'))return O.fire.apply(this,arguments);const x=f.x,yb=f.y+6,bh=IMG.pile_lit_base.naturalHeight*SC;
  c.save();c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(x,f.y+2,36,12,0,0,7);c.fill();spr(c,'pile_lit_base',x,yb,1,1);
  c.globalCompositeOperation='lighter';const fl=.85+.15*Math.sin(t*13+f.ph),gr=c.createRadialGradient(x,yb-bh*.5,2,x,yb-bh*.5,140*k*fl);gr.addColorStop(0,'rgba(255,170,70,.32)');gr.addColorStop(1,'rgba(255,120,30,0)');c.fillStyle=gr;c.fillRect(x-150,yb-bh*.5-150,300,300);c.globalCompositeOperation='source-over';
  const fi=1+Math.floor(t*10+f.ph)%6;spr(c,'flame_'+fi,x,yb-bh*.5,k,Math.min(1,.4+k));
  for(const s of f.sm){const a=1-s.life/s.max,key=a<.34?'smoke_s':a<.67?'smoke_m':'smoke_l';c.save();spr(c,key,s.x,s.y,.8+a*.5,Math.max(0,s.life/s.max)*.55*k);c.restore()}
  c.globalCompositeOperation='lighter';for(const e of f.em){const a=Math.max(0,e.life/e.max),sk='spark_'+(1+(Math.abs((e.x*7)|0)%6));spr(c,sk,e.x,e.y+4,.6+.5*a,a)}
  c.restore()};
const tintC=document.createElement('canvas');
COOK.drawGhost=function(c,x,y,good){if(!ok('pile_unlit'))return O.ghost.apply(this,arguments);const im=IMG.pile_unlit,w=im.naturalWidth*SC,h=im.naturalHeight*SC;tintC.width=Math.ceil(w);tintC.height=Math.ceil(h);const g=tintC.getContext('2d');g.clearRect(0,0,w,h);g.drawImage(im,0,0,w,h);g.globalCompositeOperation='source-atop';g.fillStyle=good?'rgba(60,255,120,.55)':'rgba(255,60,60,.55)';g.fillRect(0,0,w,h);
  const pu=.5+.5*Math.sin(time*6);c.save();c.globalAlpha=.35+.45*pu;c.strokeStyle=good?'#c8ffd8':'#ffc0c0';c.lineWidth=4;c.beginPath();c.ellipse(x,y+3,40+5*pu,16+2*pu,0,0,7);c.stroke();c.globalAlpha=.9;c.strokeStyle=good?'#3dff7a':'#ff3d3d';c.lineWidth=2;c.beginPath();c.ellipse(x,y+3,36,14,0,0,7);c.stroke();c.globalAlpha=.6;c.drawImage(tintC,x-w/2,y+6-h,w,h);c.globalAlpha=.18;c.strokeStyle=good?'#6dff9a':'#ff6a6a';c.lineWidth=2;c.beginPath();c.ellipse(P.x,P.y+2,COOK.cfg.RANGE,COOK.cfg.RANGE*.55,0,0,7);c.stroke();c.restore()};
/* ---- burn out: ember pile fades for 6 s ---- */
COOK.paintEmber=function(c,p){const a=1-(time-p.cfEmber)/6;if(a<=0)return;c.save();if(!spr(c,'pile_ember',p.x,p.y+6,1,Math.min(1,a*1.3))){c.globalAlpha=a*.6;c.fillStyle='#3a2a20';c.beginPath();c.ellipse(p.x,p.y,24,9,0,0,7);c.fill()}c.restore()};
COOK.onBurnOut=function(f){try{if(!ok('pile_ember')||!PROP_DEFS.campfire)return;const p={t:'campfire',x:f.x,y:f.y,s:1,v:0,f:1,ph:0,cfEmber:time};PROPS.push(p);const iv=setInterval(()=>{if(time-p.cfEmber>6.2||G.state!=='play'){clearInterval(iv);const i=PROPS.indexOf(p);if(i>=0)PROPS.splice(i,1)}},500)}catch(e){CA.err='ember '+e.message}};
})();

