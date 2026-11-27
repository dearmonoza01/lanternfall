
/* ---- r169 warpload (TEST): travel without the visible pull-back. Before: after a map change the new map was shown with the hero at the default arrival point and the warp circle module moved him onto the linked circle up to 100 ms later (the "pull"), the camera easing after him; goMap5-8 / door / lantern style changes (G.fade without travel()) showed no Loading screen at all, and the old Loading screen was a fixed 1 s. Now: (1) the warp module puts the hero on the destination circle INSIDE loadZone (patched in the warp module, ?warpload=off = old order), with camera snapped; (2) the existing Loading screen (#loadScr) is held up on the first frame of any G.fade zone change and comes down only when the fade is over, the zone is ready (ground baked / tiles), hero and camera have not moved for 8 frames, the zoom has settled (snapped under the overlay), and 150 ms have passed (cap 8 s); input is locked while it is up; (3) when it comes down: camera snapped on the hero, zoom snapped. Flag ?warpload=off = old behaviour. Debug: window.__WARPLOAD ---- */
(function(){'use strict';const Q=String(location.search);const S=window.__WARPLOAD={ver:'warpload-r169',on:!/[?&]warpload=off\b/.test(Q),err:null,shown:0,hidden:0,lastMs:0,lastWhy:null,log:[]};if(!S.on)return;
try{
const el=()=>document.getElementById('loadScr');
let A=null;/* {t0,z0,stable,px,py,cx,cy,sawFade,zoneChanged} */
function zoneReady(){try{const z=G.zone;if(typeof BG==='undefined'||!BG)return false;const M=window.__M4T;if(M){for(const k of ['map5','map6','map7','map8']){const m=M[k];if(m&&m.id===z&&m.groundOk===false)return false}}const t=window.__TILEBG;if(t&&t.zone===z&&window.__MAP11&&__MAP11.zone!==false&&z==='map11'&&!(__MAP11.ready))return false;if(z==='map12'&&window.__MAP12&&__MAP12.ready===false)return false;return true}catch(_){return true}}
function show(direct){const e=el();if(!e)return;if(direct){e.style.transition='none';setTimeout(()=>{if(e)e.style.transition=''},60)}/* the old showLoading() starts a 1 s timer: replace it by a held overlay */e.classList.add('on');try{const dots=e.querySelector('i');if(A&&!A.iv){let n=0;A.iv=setInterval(()=>{n=(n+1)%4;if(dots)dots.textContent='.'.repeat(n)},220)}}catch(_){}S.shown++}
function hide(why){const e=el();if(e)e.classList.remove('on');if(A&&A.iv)clearInterval(A.iv);S.hidden++;S.lastMs=Math.round(performance.now()-A.t0);S.lastWhy=why;if(S.log.length<30)S.log.push([S.lastMs,why,G.zone,Math.round(P.x),Math.round(P.y)]);A=null}
/* replace the fixed 1 s Loading with the held one */
window.showLoading=function(){if(!A){begin()}};
function begin(direct){if(A)return;A={t0:performance.now(),z0:G.zone,stable:0,px:NaN,py:NaN,cx:NaN,cy:NaN,sawFade:!!G.fade||!!direct,zoneChanged:false,iv:null,why:''};show(direct)}
/* keyboard lock while up */
const kb=e=>{if(A){e.stopImmediatePropagation();e.preventDefault()}};addEventListener('keydown',kb,true);addEventListener('keyup',e=>{if(A)e.stopImmediatePropagation()},true);
function snap(){try{camSync();cam.x=P.x-VW/2;cam.y=P.y-VH/2;clampCam();if(window.CAM){CAM.z=CAM.zt;if(CAM.tt!==undefined)CAM.tilt=CAM.tt;if(CAM.yt!==undefined)CAM.yaw=CAM.yt}camSync();cam.x=P.x-VW/2;cam.y=P.y-VH/2;clampCam()}catch(e){S.err='snap '+e.message}}
function frame(){try{if(!A){if(G.fade&&G.state==='play')begin();return}
 if(G.zone!==A.z0)A.zoneChanged=true;if(G.fade){A.sawFade=true;A.stable=0;try{P.vx=P.vy=0}catch(_){}}
 const now=performance.now(),age=now-A.t0;
 if(age>8000){snap();hide('cap');return}
 if(G.fade){return}
 if(!A.sawFade&&!A.zoneChanged&&age>300){hide('nofade');return}
 try{P.vx=P.vy=0}catch(_){}
 /* hold hero and camera still while measuring */
 snap();const moved=Math.hypot(P.x-A.px,P.y-A.py)>.5||Math.hypot(cam.x-A.cx,cam.y-A.cy)>.5;A.px=P.x;A.py=P.y;A.cx=cam.x;A.cy=cam.y;
 if(moved){A.stable=0;A.why='moved';return}if(!zoneReady()){A.stable=0;A.why='zone';return}
 A.stable++;
 if(A.stable>=8&&age>=150)hide('ready')
}catch(e){S.err=e.message}}
S.dbg=()=>A&&{stable:A.stable,why:A.why,age:Math.round(performance.now()-A.t0),sawFade:A.sawFade,zc:A.zoneChanged};const olz=window.loadZone;window.loadZone=function(){const r=olz.apply(this,arguments);try{if(!A&&P&&G.state==='play'&&!G.fade)begin(true)}catch(_){}return r};
const orn=window.render;window.render=function(){const r=orn.apply(this,arguments);frame();return r};
/* the hero does not move or act while the overlay is up */
const oup=window.updPlayer;if(typeof oup==='function')window.updPlayer=function(){if(A){try{P.vx=P.vy=0}catch(_){}return}return oup.apply(this,arguments)};
}catch(e){S.err=e.message}})();
