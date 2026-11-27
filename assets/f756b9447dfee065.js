

/* ---- WARPFX252 (TEST): map warp effect (DeaRz 26 Nov 13:52 BKK). Walking into a warp: the hero becomes a ball of light and a light
   pillar shoots up; on the other map a pillar comes down with the ball and the hero appears. Works on every zone change during play:
   the old map is kept as a still picture (hero hidden) for the first half while the new map loads underneath. Off: ?warpfx=off ---- */
(function(){'use strict';
const X=window.WARPFX252={ver:'warpfx-r252',on:!/[?&]warpfx=off\b/.test(String(location.search)),err:null,seq:null,hide:false,n:0,cfg:{out:.85,inn:.9,show:.6}};
if(!X.on)return;
const now=()=>performance.now()/1000,cl=(v,a,b)=>Math.max(a,Math.min(b,v)),ez=t=>t*t*(3-2*t);
function cvs(){try{return ctx.canvas}catch(_){return null}}
/* hero hidden while he is the ball */
try{const _d=drawPlayer;drawPlayer=function(){if(X.hide)return;return _d.apply(this,arguments)}}catch(e){X.err='dp '+e.message}
function begin(){if(window.WLEAVE266&&WLEAVE266.on){try{const p=w2s(P.x,P.y);X.hide=true;return {snap:null,sx:p[0],sy:p[1],z0:G.zone,tb:performance.now()/1000-5,stub:1}}catch(_){}}const c=cvs();if(!c||!c.width)return null;let s;try{X.hide=true;render()}catch(e){X.err='snap '+e.message}
 try{const o=document.createElement('canvas');o.width=c.width;o.height=c.height;o.getContext('2d').drawImage(c,0,0);const p=w2s(P.x,P.y);s={snap:o,sx:p[0],sy:p[1],z0:G.zone,tb:performance.now()/1000}}catch(e){X.err='copy '+e.message;s=null}
 return s}
try{const _l=loadZone;loadZone=function(zid,arrive){let s=null;
  try{if(X.on&&!X.seq&&typeof G!=='undefined'&&G.state==='play'&&typeof P!=='undefined'&&P&&!P.dead&&G.zone&&zid&&zid!==G.zone&&!document.hidden)s=begin()}catch(e){X.err='pre '+e.message;s=null}
  let r;try{r=_l.apply(this,arguments)}catch(e){X.hide=false;throw e}
  if(s){s.t0=0;s.made=now();s.lock=null;s.from=null;X.seq=s;X.n++}else if(!X.seq)X.hide=false;
  return r}}catch(e){X.err='lz '+e.message}
/* hold the hero in place while the effect plays */
try{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{const s=X.seq;if(s&&P){if(!s.lock)s.lock={x:P.x,y:P.y};else{P.x=s.lock.x;P.y=s.lock.y}P.dash=null;if(!(P.invT>.3))P.invT=.3}}catch(e){X.err='upd '+e.message}return r}}catch(e){X.err='uh '+e.message}
function orb(c,x,y,r,a){if(r<=0||a<=0)return;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=cl(a,0,1);const g=c.createRadialGradient(x,y,0,x,y,r*2.6);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.22,'rgba(255,246,200,.95)');g.addColorStop(.5,'rgba(255,211,107,.45)');g.addColorStop(1,'rgba(255,190,80,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,r*2.6,0,6.2832);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(x,y,r*.55,0,6.2832);c.fill();c.restore()}
function pillar(c,x,yb,w,a,t){if(w<=0||a<=0)return;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=cl(a,0,1);
 const g=c.createLinearGradient(x-w,0,x+w,0);g.addColorStop(0,'rgba(255,200,90,0)');g.addColorStop(.3,'rgba(255,220,130,.35)');g.addColorStop(.5,'rgba(255,255,240,.95)');g.addColorStop(.7,'rgba(255,220,130,.35)');g.addColorStop(1,'rgba(255,200,90,0)');
 c.fillStyle=g;c.fillRect(x-w,-10,w*2,yb+10);
 /* ground ring + rising motes */
 /* ground glow: soft, no edge (several drifting blobs that fade to nothing) */
 for(let i=0;i<5;i++){const a2=i*1.2566+t*.6,R=w*(3.4+.5*Math.sin(t*2.1+i*1.7)),ox=i?Math.cos(a2)*w*.9:0,oy=i?Math.sin(a2)*w*.9:0;c.save();c.translate(x+ox,yb+oy*.36);c.scale(1,.36);const gg=c.createRadialGradient(0,0,0,0,0,R);gg.addColorStop(0,'rgba(255,250,220,'+(i?.22:.55)+')');gg.addColorStop(.35,'rgba(255,232,160,'+(i?.12:.26)+')');gg.addColorStop(.7,'rgba(255,214,120,.05)');gg.addColorStop(1,'rgba(255,210,110,0)');c.fillStyle=gg;c.beginPath();c.arc(0,0,R,0,6.2832);c.fill();c.restore()}
 c.fillStyle='rgba(255,250,225,.9)';for(let i=0;i<10;i++){const ph=(t*1.3+i*.137)%1,px=x+Math.sin(i*12.9898)*w*.75,py=yb-ph*Math.min(yb,360);c.globalAlpha=cl(a*(1-ph),0,1);c.beginPath();c.arc(px,py,1.6+((i*7)%3)*.6,0,6.2832);c.fill()}
 c.restore()}
function overlay(){const s=X.seq;if(!s)return;if(!s.t0)s.t0=now();const C=X.cfg;let t=now()-s.t0;if((window.WARPWAIT259&&WARPWAIT259.on)){t=WARPWAIT259.step(s,t,C);if(t<0)return}const c=ctx,cv=cvs();if(!cv)return;const d=(typeof DPR==='number'&&DPR)||1,Wc=cv.width/d,Hc=cv.height/d;
 c.save();c.setTransform(d,0,0,d,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';
 if(t<C.out){const u=t/C.out;/* old map still */if(!s.snap){c.restore();return}c.drawImage(s.snap,0,0,Wc,Hc);
  const x=s.sx,yb=s.sy,g=cl(u/.3,0,1),up=cl((u-.3)/.6,0,1),oy=yb-26-ez(up)*ez(up)*(yb+80);
  pillar(c,x,yb,(10+g*20)*(1-up*.45),g*(1-cl((u-.85)/.15,0,1)*.4),t);orb(c,x,oy,6+g*10-up*3,1);
  if(u<.18){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=(1-u/.18)*.8;const fg=c.createRadialGradient(x,yb-26,0,x,yb-26,60);fg.addColorStop(0,'#fff');fg.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=fg;c.beginPath();c.arc(x,yb-26,60,0,6.2832);c.fill();c.restore()}
  const wf=cl((u-.78)/.22,0,1);if(wf>0){c.globalAlpha=wf;c.fillStyle=(window.WARPWAIT259&&WARPWAIT259.on)?'#02040c':'#fff8e0';c.fillRect(0,0,Wc,Hc)}}
 else{const v=t-C.out,u=v/C.inn;if(u>=1){X.seq=null;X.hide=false;c.restore();return}
  let p;try{p=w2s(P.x,P.y)}catch(_){p=[Wc/2,Hc/2]}const x=p[0],yb=p[1];
  const wf=1-cl(u/.25,0,1);if(wf>0){c.globalAlpha=wf;c.fillStyle=((window.WARPWAIT259&&WARPWAIT259.on)&&s.waited>.25)?'#02040c':'#fff8e0';c.fillRect(0,0,Wc,Hc);c.globalAlpha=1}
  const dn=cl(u/C.show,0,1),oy=-60+(yb-26+60)*ez(dn),land=cl((u-C.show)/(1-C.show),0,1);
  pillar(c,x,yb,(26-dn*8)*(1-land),1-land,t);
  if(dn<1)orb(c,x,oy,14,1);else{X.hide=false;orb(c,x,yb-26,14+land*26,1-land)}}
 c.restore()}
try{const _r=render;render=function(){const r=_r.apply(this,arguments);try{overlay()}catch(e){X.err='ov '+e.message;X.seq=null;X.hide=false}return r}}catch(e){X.err='rh '+e.message}
/* safety: never leave the hero hidden */
setInterval(()=>{try{const s=X.seq;if(s&&now()-(s.t0||s.made)>((window.WARPWAIT259&&WARPWAIT259.on)?24:6)){X.seq=null;X.hide=false}if(!s&&X.hide)X.hide=false}catch(_){}},1000);
})();

