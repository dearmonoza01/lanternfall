
/* ---- merge m13: p204 attack lock + root motion ---- */
/* p204 — basic attack: no walking during a swing + root motion from the Mixamo source (merge m13 candidate; user 9 Oct 2026 23:57).
   1. While a basic-attack swing is playing (HERO3D.anim), movement input is ignored (dash / death / knock-back from other code still work).
   2. The body travels like the original One_Hand_Club_Combo: the source Hips forward (Z) and sideways (X) curve is replayed in the aim
      direction fixed at the start of each swing. Scale: source cm x 0.701 (retarget ratio) x 43.3 game px per metre (render 102.55 px/m x
      draw scale 0.4223) = 0.3035 px per source cm -> swing 1 ~28 px forward, swing 2 ~22 px, swing 3 ~15 px forward then ~20 px back.
      The step stops at walls (blocked) and does not push into a monster right in front (stops at contact). */
(function(){
'use strict';
const SZ=[0.71, 0.8, 1.01, 1.44, 2.15, 3.15, 4.25, 5.55, 7.17, 9.2, 11.85, 15.19, 18.82, 22.81, 27.01, 31.42, 35.91, 40.47, 44.94, 49.54, 54.58, 59.79, 65.0, 69.96, 74.46, 78.61, 82.37, 85.63, 88.35, 90.57, 92.66, 94.48, 96.0, 97.4, 98.74, 99.89, 100.78, 101.81, 103.27, 105.12, 107.42, 110.15, 113.62, 118.13, 123.14, 128.33, 133.51, 138.45, 143.57, 148.27, 151.95, 154.77, 157.38, 159.83, 162.1, 164.23, 166.36, 168.54, 170.64, 172.71, 174.74, 176.69, 178.48, 180.3, 182.67, 185.81, 190.06, 195.06, 200.34, 206.1, 211.81, 215.67, 218.31, 220.29, 221.6, 222.45, 222.9, 222.71, 221.88, 220.39, 218.22, 215.39, 211.87, 207.65, 203.47, 199.53, 194.97, 190.08, 185.79, 182.0, 178.58, 175.41, 172.33, 169.21, 165.97, 162.88, 159.97, 157.21, 154.5, 151.77, 148.98, 146.15, 144.6, 144.15, 144.24, 144.49, 144.69, 144.92, 145.1, 145.17],SX=[-0.84, -0.93, -0.92, -0.77, -0.44, 0.11, 0.9, 1.97, 3.42, 5.41, 7.57, 9.51, 11.39, 12.98, 14.26, 15.19, 15.47, 15.03, 14.01, 12.63, 11.05, 9.39, 7.8, 6.49, 5.6, 5.13, 4.61, 3.91, 3.11, 2.25, 1.31, 0.3, -0.69, -1.63, -2.29, -2.51, -2.55, -2.57, -3.07, -3.71, -4.48, -5.32, -6.58, -8.18, -9.7, -10.74, -11.75, -12.57, -13.06, -13.42, -13.51, -13.38, -13.1, -12.9, -12.72, -12.51, -12.16, -11.74, -11.23, -10.56, -9.85, -9.1, -8.65, -8.49, -8.68, -9.24, -9.97, -10.63, -10.99, -11.4, -11.69, -11.47, -11.05, -9.96, -9.21, -8.55, -7.96, -7.66, -7.55, -7.45, -7.18, -6.88, -6.29, -5.39, -4.61, -3.82, -3.05, -2.33, -1.71, -1.18, -0.71, -0.29, 0.07, 0.34, 0.56, 0.72, 0.83, 0.88, 0.88, 0.73, 0.6, 0.63, 0.52, 0.28, -0.02, -0.33, -0.61, -0.76, -0.76, -0.84],K=0.3035,ERR=[];
const H=()=>window.HERO3D,DATA=window.__HERO3D;
function srcAt(sf){const i=Math.max(0,Math.min(SZ.length-1,sf-1)),i0=Math.floor(i),i1=Math.min(SZ.length-1,i0+1),f=i-i0;return [SZ[i0]+(SZ[i1]-SZ[i0])*f,SX[i0]+(SX[i1]-SX[i0])*f];}
let cur=null;   // {anim, a, z0, x0, df, dl}
function step(){const S=H();if(!S||!DATA||!DATA.combo)return;const A=S.anim;
  if(!A||P.dead){cur=null;return;}
  const seg=DATA.combo[A.k];if(!seg||!seg.src)return;
  if(!cur||cur.anim!==A){let a=P.face||0;try{const t=aimPoint();if(t&&isFinite(t.x))a=Math.atan2(t.y-P.y,t.x-P.x);}catch(_){}
    P.face=a;const s0=srcAt(seg.src[0]);cur={anim:A,a,z0:s0[0],x0:s0[1],df:0,dl:0};}
  const u=Math.min(seg.len,S.uOf?S.uOf(A,time):(time-A.t0)*A.f),s=srcAt(seg.src[0]+u*30);
  const tf=(s[0]-cur.z0)*K,tl=(s[1]-cur.x0)*K;let ddf=tf-cur.df,ddl=tl-cur.dl;cur.df=tf;cur.dl=tl;
  const c=Math.cos(cur.a),sn=Math.sin(cur.a);
  if(ddf>0){for(const e of enemies){if(e.dead||e.sprGhost)continue;const dx=e.x-P.x,dy=e.y-P.y,ahead=dx*c+dy*sn;if(ahead>0&&Math.hypot(dx,dy)<e.sz+P.r+2){ddf=0;break;}}}
  const mx=c*ddf+sn*ddl,my=sn*ddf-c*ddl;   // character's left = (sin a, -cos a) on screen; Mixamo +X = character's left
  if(!mx&&!my)return;const nx=P.x+mx,ny=P.y+my;
  try{if(blocked(nx,ny,P.r))return;}catch(_){}
  const Z=ZONES[G.zone];P.x=Math.max(30,Math.min(Z.w-30,nx));P.y=Math.max(30,Math.min(Z.h-30,ny));}
try{const _up=updPlayer;updPlayer=function(){const S=H(),lock=!!(S&&S.anim&&!P.dash&&!P.dead);const x0=P.x,y0=P.y;
    const r=_up.apply(this,arguments);
    if(lock&&!P.dash){P.x=x0;P.y=y0;P.vx=0;P.vy=0;}
    try{step();}catch(e){if(!ERR.length)ERR.push('step '+e.message);}
    return r;};}catch(e){ERR.push('updPlayer '+e.message);}
window.__P204={errors:ERR};setTimeout(()=>{if(ERR.length)console.warn('[p204]',ERR);},1500);
})();

