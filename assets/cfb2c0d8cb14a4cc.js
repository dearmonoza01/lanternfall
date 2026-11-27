
/* ---- r134 staffcast (TEST ONLY; Motion pack staff_cast_r2, DeaRz 16 Nov 23:08 "ลองเอาไปใส่กับคทาเวทดู"): rig cast poses for staff SKILL casts.
   When the hero faces left / right (STF8 dir E / W) and casts a staff skill, the game's STF8 sprite clip is replaced by the PUPPET rig pose from Motion's cast_defs (CAST A/B/C/D, degrees added to the staff idle pose; `air` = body lift, shadow stays on the ground); the other 6 directions keep the STF8 clips.
   Mapping: fireball / chain = A (rel 0.42) · ice / spikes = B (rel 0.62) · buffs = C (rel 0.60) · ult = D (rel 1.70 -> beam at CFG.ult.beamAt, charge 0-1 s = raise to the overhead channel). The cast wind-up is scaled so the release lands on the skill's own key frame (POSE.cast); damage / VFX timing is NOT touched (only the body drawing changes).
   Chant stance blends in over 0.25 s and fades as the wind-up takes over. Moving cancels the rig pose back to the normal one. Holy staff mode keeps the old clips.
   Part mapping: arm_near -> arm_upper_near, arm_far -> arm_upper_far, fist / torso / head / leg_* same names, forearm_* untouched; `air` x0.8 px.
   Flags: ?staffcast=off (old clips), ?staffchant=off (casts but no chant). Debug: window.__STFCAST (.at = freeze the cast clock for screenshots) ---- */
(function(){'use strict';
const Q=String(location.search),SC=window.__STFCAST={ver:'staffcast-r1',on:/[?&]staffcast=on\b/.test(Q),chant:!/[?&]staffchant=off\b/.test(Q),err:null,used:0,at:null,last:null};
if(!SC.on)return;
const E=u=>u*u*(3-2*u);
function KF(k,t){if(t<=k[0][0])return k[0][1];for(let i=0;i<k.length-1;i++){if(t<=k[i+1][0]){const u=(t-k[i][0])/(k[i+1][0]-k[i][0]);return k[i][1]+(k[i+1][1]-k[i][1])*E(u)}}return k[k.length-1][1]}
const CAST={
 A:{dur:1.0,rel:0.42,keys:{torso:[[0,0],[0.28,7],[0.42,-9],[0.62,-7],[1.0,0]],head:[[0,0],[0.28,-4],[0.42,-2],[1.0,0]],arm_near:[[0,0],[0.28,30],[0.42,100],[0.62,98],[1.0,0]],fist_near:[[0,0],[0.28,40],[0.42,-55],[0.62,-55],[1.0,0]],arm_far:[[0,0],[0.28,60],[0.42,-35],[0.62,-35],[1.0,0]],leg_near:[[0,0],[0.28,-4],[0.42,12],[0.62,12],[1.0,0]],leg_far:[[0,0],[0.28,4],[0.42,-8],[0.62,-8],[1.0,0]]}},
 B:{dur:1.25,rel:0.62,keys:{torso:[[0,0],[0.42,10],[0.62,-12],[0.85,-10],[1.25,0]],head:[[0,0],[0.42,-8],[0.62,5],[1.25,0]],arm_near:[[0,0],[0.42,165],[0.62,70],[0.85,68],[1.25,0]],fist_near:[[0,0],[0.42,-75],[0.62,-95],[0.85,-95],[1.25,0]],arm_far:[[0,0],[0.42,150],[0.62,20],[0.85,15],[1.25,0]],leg_near:[[0,0],[0.42,-6],[0.62,16],[0.85,16],[1.25,0]],leg_far:[[0,0],[0.42,6],[0.62,-12],[0.85,-12],[1.25,0]]},air:[[0,0],[0.42,14],[0.56,14],[0.62,0],[1.25,0]]},
 C:{dur:1.3,rel:0.6,keys:{torso:[[0,0],[0.35,4],[0.6,2],[0.95,2],[1.3,0]],head:[[0,0],[0.35,-10],[0.6,-12],[0.95,-10],[1.3,0]],arm_near:[[0,0],[0.35,35],[0.95,35],[1.3,0]],fist_near:[[0,0],[0.35,55],[0.95,55],[1.3,0]],arm_far:[[0,0],[0.35,95],[0.6,120],[0.95,110],[1.3,0]],fist_far:[[0,0],[0.35,-20],[0.95,-20],[1.3,0]]},air:[[0,0],[0.35,0],[0.6,18],[0.95,16],[1.3,0]]},
 D:{dur:2.4,rel:1.7,keys:{torso:[[0,0],[0.4,8],[1.45,10],[1.7,-12],[2.0,-10],[2.4,0]],head:[[0,0],[0.4,-12],[1.45,-14],[1.7,4],[2.4,0]],arm_near:[[0,0],[0.4,140],[1.45,146],[1.7,90],[2.0,88],[2.4,0]],fist_near:[[0,0],[0.4,-50],[1.45,-56],[1.7,-70],[2.0,-70],[2.4,0]],arm_far:[[0,0],[0.4,120],[1.45,130],[1.7,-30],[2.0,-30],[2.4,0]],fist_far:[[0,0],[0.4,-30],[1.45,-30],[1.7,0],[2.4,0]],leg_near:[[0,0],[0.4,8],[1.45,10],[1.7,14],[2.0,12],[2.4,0]],leg_far:[[0,0],[0.4,-14],[1.45,-16],[1.7,-10],[2.0,-8],[2.4,0]]},air:[[0,0],[0.4,30],[1.45,40],[1.7,22],[2.0,0],[2.4,0]]}};
const CHANT={IN:0.25,keys:{torso:3,head:-7,arm_near:32,fist_near:52,arm_far:78,fist_far:-25,leg_near:4,leg_far:-4}};
function chantRot(t,k){const r={};for(const p in CHANT.keys)r[p]=CHANT.keys[p]*k;const b=Math.sin(t*2*Math.PI/1.1);r.torso+=1.5*b*k;r.arm_far+=6*Math.sin(t*2*Math.PI/0.9)*k;r.fist_far+=8*Math.sin(t*2*Math.PI/0.9+1)*k;r.fist_near+=2*b*k;r.head+=1.5*Math.sin(t*2*Math.PI/1.1+0.6)*k;return r}
const PM={arm_near:'arm_upper_near',arm_far:'arm_upper_far'};
const typeOf=p=>(p.kind==='ult'||p.sk==='ult')?'D':p.kind==='buff'?'C':(p.sk==='ice'||p.sk==='spikes')?'B':'A';
function mapS(T,p,e){const C=CAST[T],key=Math.max(.05,p.cast||.3);
  if(T==='D'){const tb=(STF.cfg&&STF.cfg.ult&&STF.cfg.ult.beamAt)||2,ch=Math.min(1,tb*.5);if(e<ch)return e/ch*0.4;if(e<tb-.3)return 0.4+(e-ch)/Math.max(.1,tb-.3-ch)*1.05;if(e<tb)return 1.45+(e-(tb-.3))/.3*.25;return 1.7+(e-tb)}
  if(e<key)return e/key*C.rel;return C.rel+(e-key)}
function active(){try{if(!PUPPET||!window.STF||!STF.pose||!P||P.dead||G.state!=='play')return null;if(PUPPET.cfg&&PUPPET.cfg.WEAPON!=='staff')return null;if(window.HOLYW&&HOLYW.on)return null;
  const p=STF.pose();if(!p||p.kind==='basic'||p.d==null)return null;if(p.d!==0&&p.d!==4)return null;if(Math.hypot(P.vx||0,P.vy||0)>45)return null;
  const T=typeOf(p),e=SC.at!=null?SC.at:time-p.t0,s=mapS(T,p,e);if(e<0||s>=CAST[T].dur)return null;return {p,T,e,s}}catch(er){SC.err='act '+er.message;return null}}
SC.takes=function(st){return !!active()};
SC.pose=function(t){const a=active();if(!a)return null;try{const b=PUPPET.pose('idle',t),rot=Object.assign({},b.rot),C=CAST[a.T];
    for(const k in C.keys){const m=PM[k]||k;rot[m]=(rot[m]||0)+KF(C.keys[k],a.s)}
    const key=Math.max(.05,a.p.cast||.3);if(SC.chant&&a.e<key+.22){const u=Math.min(1,a.e/key),w=Math.min(1,a.e/CHANT.IN)*(1-E(u)),cr=chantRot(a.e,w);for(const k in cr){const m=PM[k]||k;rot[m]=(rot[m]||0)+cr[k]}}
    const out=Object.assign({},b,{rot,air:(b.air||0)+(C.air?KF(C.air,a.s)*0.5:0)});SC.used++;SC.last={T:a.T,sk:a.p.sk||a.p.kind,e:+a.e.toFixed(2),s:+a.s.toFixed(2)};return {name:'idle',p:out}}catch(er){SC.err='pose '+er.message;return null}};
})();

