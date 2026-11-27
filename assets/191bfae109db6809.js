
/* ---- r266b WLEAVE266 (TEST ONLY). DeaRz 26 Nov 17:45 UTC on live v3l19b: "ทำไมยังเป็นวาฟส้มอยู่ล่ะ ตอนวาฟไปน่ะ วาฟกลับถูกแล้ว", 17:46 "หมายถึงว่าตอนวาฟถึงอ่ะมันผ่าน แต่ตอน
   กำลังวาฟไปอีกแมพไม่ผ่าน". The leaving part was drawn over a still picture of the old map AFTER the map change had started; on a cold first load the page stops
   drawing for seconds, so the last effect frame (cream fill + wide pillar) stayed on screen under LOADING. New: the leaving part plays on the LIVE old map BEFORE
   the map change starts (the warp circle's own delay from trigger to go is stretched to the effect length, hero hidden and held): the hero becomes a ball of light,
   a narrow pillar rises with a soft glow only at his feet; it fades out fully, the next frames are the plain map, and only then the map change starts (normal
   LOADING screen). No still picture, no screen fill. Zone changes that do not come from a circle (yard, quest teleports) get no leaving visuals.
   The arriving part is unchanged. Off: ?warpleave=old (r252/r259 leaving). ?warpfx=off still removes the whole effect. Debug: window.WLEAVE266 ---- */
(function(){'use strict';
const Q=String(location.search);
const L=window.WLEAVE266={ver:'wleave-r266b',on:!/[?&]warpleave=old\b/.test(Q)&&!/[?&]warpfx=off\b/.test(Q),dur:1.1,fxEnd:.82,n:0,frames:0,hideNow:false,lock:null,err:null,log:[]};
if(!L.on)return;
const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),ez=t=>t*t*(3-2*t);
function cur(){try{const C=window.__WARP&&__WARP.circles;if(!C||typeof G==='undefined')return null;for(const c of C)if(c.z===G.zone&&!c.off&&c.s&&c.s.goT>=0&&!c.s.fired)return c}catch(_){}return null}
L.cur=cur;
try{const _d=drawPlayer;drawPlayer=function(){if(L.hideNow)return;return _d.apply(this,arguments)}}catch(e){L.err='dp '+e.message}
try{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{const c=cur();if(c&&P){if(!L.lock)L.lock={x:P.x,y:P.y};P.x=L.lock.x;P.y=L.lock.y;P.vx=P.vy=0;P.dash=null}else L.lock=null}catch(_){}return r}}catch(e){L.err='up '+e.message}
let lastAct=-9;
function draw(c,u,x,yb,t){const a=1-cl((u-.66)/(L.fxEnd-.66),0,1);if(a<=0)return;const g=cl(u/.25,0,1),up=cl((u-.25)/.5,0,1);
  c.save();c.globalCompositeOperation='lighter';
  /* soft glow only at the feet */
  c.save();c.translate(x,yb);c.scale(1,.38);const R=40+g*14,fg=c.createRadialGradient(0,0,0,0,0,R);fg.addColorStop(0,'rgba(255,248,215,'+(.5*a*g)+')');fg.addColorStop(.45,'rgba(255,228,150,'+(.22*a*g)+')');fg.addColorStop(1,'rgba(255,214,120,0)');c.fillStyle=fg;c.beginPath();c.arc(0,0,R,0,6.2832);c.fill();c.restore();
  /* narrow pillar */
  const w=(5+g*7)*(1-up*.3),pa=g*a*.85;if(pa>0){const pg=c.createLinearGradient(x-w,0,x+w,0);pg.addColorStop(0,'rgba(255,210,120,0)');pg.addColorStop(.5,'rgba(255,252,235,'+pa+')');pg.addColorStop(1,'rgba(255,210,120,0)');
    const top=Math.max(-10,(yb-26)-(1-ez(up))*0-(yb+40)*ez(up));c.fillStyle=pg;c.fillRect(x-w,Math.min(top,yb-30)-(yb)*cl(up*1.4,0,1),w*2,yb-Math.min(top,yb-30)+(yb)*cl(up*1.4,0,1)-6)}
  /* rising motes */
  c.fillStyle='rgba(255,250,225,.9)';for(let i=0;i<8;i++){const ph=(t*1.4+i*.137)%1,px=x+Math.sin(i*12.9898)*14,py=yb-ph*Math.min(yb,260);c.globalAlpha=cl(a*g*(1-ph),0,1);c.beginPath();c.arc(px,py,1.5,0,6.2832);c.fill()}
  /* the ball of light */
  c.globalAlpha=a;const oy=(yb-26)-ez(up)*ez(up)*(yb+60),r=(5+g*9)*(1-up*.25);const og=c.createRadialGradient(x,oy,0,x,oy,r*2.4);og.addColorStop(0,'rgba(255,255,255,1)');og.addColorStop(.25,'rgba(255,246,200,.9)');og.addColorStop(.6,'rgba(255,211,107,.3)');og.addColorStop(1,'rgba(255,190,80,0)');c.fillStyle=og;c.beginPath();c.arc(x,oy,r*2.4,0,6.2832);c.fill();
  c.restore()}
try{const _r=render;render=function(){const r=_r.apply(this,arguments);try{const c=cur(),X=window.WARPFX252;
    if(c){const g=time-c.s.goT,u=cl(g/L.dur,0,1);if(lastAct<0||time-lastAct>2)L.n++;lastAct=time;L.hideNow=true;
      const cv=ctx.canvas,d=(typeof DPR==='number'&&DPR)||1;let p;try{p=w2s(P.x,P.y)}catch(_){p=[cv.width/d/2,cv.height/d/2]}
      ctx.save();ctx.setTransform(d,0,0,d,0,0);if(u<L.fxEnd){draw(ctx,u/L.fxEnd*L.fxEnd,p[0],p[1],performance.now()/1000);L.frames++}ctx.restore();}
    else if(L.hideNow){if((X&&X.seq)||time-lastAct>1.5||time<lastAct)L.hideNow=false}}catch(e){L.err='draw '+e.message}return r}}catch(e){L.err='rh '+e.message}
})();
