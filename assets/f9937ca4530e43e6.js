
/* ---- r259 (TEST ONLY) two live-site fixes after REAL v3l17 (26 Nov 2026).
   WARPWAIT259 (?warpwait=off; ?warpfx=off still turns the whole effect off). DeaRz 08:53 UTC "ตอนวาฟทำไมยังเป็นเหมือนเดิมอยู่เลยล่ะ" + live screenshot:
   on the web the new map's pictures load over the network, the game holds its Loading screen (r169 #loadScr) until the map is ready, and the
   WARPFX252 timeline ran on underneath it, so the arriving pillar was spent (or frozen) behind Loading. Now:
     leaving phase (old map still + orb rising) is shown ABOVE the Loading screen (only when the map change itself was quick; when loadZone blocked > 0.3 s the leaving still is skipped, it would look like going back to the old map) (the Loading screen is held invisible for those 0.85 s) and fades to the
     Loading screen's dark colour (not cream); then WAIT while the Loading screen is up / the zone has not changed / a fade runs (nothing drawn, hero hidden,
     the game's Loading screen shows); the arriving phase (pillar + orb down) starts on the first frame after that, on the real map at the hero's real spot.
     Wait cap 20 s, then the hero is revealed anyway; the 6 s safety of WARPFX252 becomes 24 s.
   WARPQ259 (?warpquest=off). DeaRz (via coordinator) 08:54 UTC "เควสให้ไปแมพ 4 แต่แมพ4เข้าไม่ได้": the warp circles (p337) refuse a destination map the
     character has never visited ("ยังไม่เคยไป แมพ 4") and only Maps 1-3 count as visited for a new character, while the old walk-in gates are closed, so a
     never-visited map could not be entered at all. Now a circle also opens when an ACTIVE quest's current objective is on that map (reach / interact / kill /
     cutscene point, kill zone, or the NPC to talk to). Once entered, the map is marked visited as before. ---- */
(function(){'use strict';
const Q=String(location.search);
const X=window.WARPWAIT259={ver:'warpwait-r259',on:!/[?&]warpwait=off\b/.test(Q),err:null,cap:20,slow:.3,waits:[],stats:{waited:0,capped:0}};
if(X.on){try{const st=document.createElement('style');st.textContent='body.wfx259leave #loadScr{opacity:0!important;transition:none!important}';document.head.appendChild(st)}catch(_){}
 const nowS=()=>performance.now()/1000;
 X.step=(s,t,C)=>{try{const b=document.body;
   /* on the web loadZone itself can block for seconds (map pictures); then the old-map leaving still would come back AFTER the Loading screen: skip it */
   if(s.skip===undefined){s.skip=!!(s.tb&&s.made&&s.made-s.tb>X.slow);if(s.skip)X.stats.skipLeave=(X.stats.skipLeave|0)+1}
   if(!s.skip&&t<C.out){if(b&&!b.classList.contains('wfx259leave'))b.classList.add('wfx259leave');return t}
   if(b)b.classList.remove('wfx259leave');
   if(!s.t1){const ld=document.getElementById('loadScr'),loading=!!(ld&&ld.classList.contains('on')),w=nowS()-(s.skip?s.made:s.t0+C.out);if(s.skip)s.waited=Math.max(1,w);
     if((loading||G.zone===s.z0||G.fade)&&w<X.cap){if(!s.skip)s.waited=w;return -1}
     if(w>=X.cap)X.stats.capped++;if(!s.skip)s.waited=w;s.t1=nowS();X.stats.waited++;if(X.waits.length<20)X.waits.push(+w.toFixed(2))}
   return C.out+(nowS()-s.t1)}catch(e){X.err=e.message;try{document.body.classList.remove('wfx259leave')}catch(_){}return t}};
 setInterval(()=>{try{if(!(window.WARPFX252&&WARPFX252.seq))document.body.classList.remove('wfx259leave')}catch(_){}},500)}
const Y=window.WARPQ259={ver:'warpquest-r259',on:!/[?&]warpquest=off\b/.test(Q),err:null,allowed:0};
Y.zones=()=>{const out=new Set();try{const A=CH1Q.api,S=A.state();if(!S||!S.q)return out;for(const id in S.q){const r=S.q[id];if(!r||r.s!=='a')continue;const q=A.QBY[id];if(!q||!q.objectives)continue;const o=q.objectives[r.i|0];if(!o)continue;
   const ids=o.point?[o.point]:(o.points||[]);for(const p of ids){const P_=A.PT[p];if(P_&&P_.zone)out.add(P_.zone)}if(o.zone)out.add(o.zone);if(o.npc&&A.NPC[o.npc]&&A.NPC[o.npc].at)out.add(A.NPC[o.npc].at.zone)}}catch(e){Y.err=e.message}return out};
Y.allow=dest=>{try{if(Y.zones().has(dest)){Y.allowed++;return true}}catch(_){}return false};
})();
/* ---- r259d FAFIX259: old saves kept the First Aid icon in skill bar slot 1 after NOFIRSTAID252 had emptied P.slots (it called a renderSkillBar() that does
   not exist; the bar is drawn by buildBar()). Every 700 ms: if the bar still shows firstAid, rebuild it. Same flag as NOFIRSTAID252 (?firstaid=on = no fix needed). ---- */
(function(){'use strict';const F=window.FAFIX259={on:!/[?&]firstaid=on\b/.test(String(location.search)),rebuilt:0};if(!F.on)return;
 setInterval(()=>{try{if(!document.querySelector('#bar [data-sk="firstAid"]'))return;if(typeof buildBar==='function'){buildBar();F.rebuilt++}}catch(_){}},700)})();
