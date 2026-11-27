
/* ---- thiefrun-r1 + dgvis-r1 (TEST allin_r96, 16 Nov 2026) ----
   thiefrun-r1 — quest m1_02_potions "ยาก่อนเดินทาง" (Ora -> Mali), objective 2 = cutscene cs_m1_02_bread (actor npc_pip):
     BEFORE: the cutscene lasted 1.2 s, the kid Pip was drawn standing at hero x - 110 (a still picture next to the hero) while the floating text "เด็กคนหนึ่งแอบหยิบขนมปังหน้าร้านแล้ววิ่งหนี" showed, then Mali's line.
     NOW: Pip runs out from behind the big (sacred) tree, walks the whole way to Mali's stall (no teleport), stops at the counter, picks the bread up (the bread leaves the stall and he holds it up), then runs off along the road and fades; Mali's line follows when he is gone.
     ?thiefrun=off = old. Numbers in window.__THIEFRUN.cfg (tree, stall, exit, speed). Debug: __THIEFRUN.
   dgvis-r1 — twin-dagger Blade Storm (พายุกริช) and Thousand Shadows Night (ราตรีพันเงา): the hero draw alpha (DGR.heroA) went to 0 for the dash / clone part so only the FX showed.
     NOW the hero stays fully drawn (his normal pose) the whole skill; the clones / afterimages are drawn on top as before. ?dgvis=off = old. Debug: __DGVIS.last = the alpha used. ---- */
(function(){'use strict';
const Q=String(location.search);
window.__DGVIS={ver:'dgvis-r1',on:/[?&]dgvis=on\b/.test(Q),last:1};   /* r98: default OFF (DeaRz 16 Nov 12:28: the hero must be HIDDEN in these two skills; ?dgvis=on = the r96 always-visible look) */
/* dghide-r1 (r98): twin-dagger Blade Storm (พายุกริช) and Thousand Shadows Night (ราตรีพันเงา): from the cast start until the shadows are done and the hero comes back (storm: t < D3_BACK, ult: t < 3.0 s) the hero is not drawn at all - no body, ground shadow, aura; clones / afterimages / FX stay. ?dghide=off = r97 look. Debug: __DGHIDE */
const DH=window.__DGHIDE={ver:'dghide-r1',on:!/[?&]dghide=off\b/.test(Q),until:-1,frames:0};
try{const od=drawPlayer;drawPlayer=function(){if(DH.on&&typeof time==='number'&&time<DH.until&&!(typeof P!=='undefined'&&P&&P.dead)){DH.frames++;return}return od.apply(this,arguments)}}catch(e){DH.err=String(e)}
const TR=window.__THIEFRUN={ver:'thiefrun-r1',on:!/[?&]thiefrun=off\b/.test(Q),err:null,runs:0,
  cfg:{tree:{x:2150,y:1062,r:60,side:-1},stall:{x:1934,y:960},breadAt:{x:-4,y:-56},exit:{x:1380,y:1045},speed:205,emerge:.7,grab:.7,fade:.5,after:.3}};
const C=TR.cfg;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function legs(){const s={x:C.tree.x+C.tree.side*-8,y:C.tree.y+24},a=dist(s,C.stall)/C.speed,b=dist(C.stall,C.exit)/(C.speed*1.1);return {s,tIn:a,tGrab:C.grab,tOut:b}}
TR.total=()=>{const L=legs();return L.tIn+L.tGrab+L.tOut+C.after};
function bread(c,x,y,s,a){c.save();c.globalAlpha*=a==null?1:a;c.translate(x,y);c.scale(s,s);c.fillStyle='#c98a3c';c.strokeStyle='#6b3f14';c.lineWidth=2;c.beginPath();c.ellipse(0,0,13,8,-.2,0,6.283);c.fill();c.stroke();c.strokeStyle='#8e5a22';c.lineWidth=1.5;for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(i*5-2,-5);c.lineTo(i*5+2,3);c.stroke()}c.fillStyle='rgba(255,230,160,.55)';c.beginPath();c.ellipse(-3,-3,5,2.2,-.2,0,6.283);c.fill();c.restore()}
/* called by the patched drawActor; CUT = {t0,dur,o,...}; drawKid(x,y) draws the Pip sprite with its feet at (x,y) */
TR.draw=function(CUT,drawKid,now){try{const c=ctx,t=now-CUT.t0,L=legs();let x,y,face=-1,run=true,hasBread=false,alpha=1,clip=false,breadOnStall=true;
  if(t<L.tIn){const u=t/L.tIn;x=L.s.x+(C.stall.x-L.s.x)*u;y=L.s.y+(C.stall.y-L.s.y)*u;clip=t<C.emerge+.6;if(t<C.emerge)alpha=Math.max(.01,t/C.emerge)*.0+1}
  else if(t<L.tIn+L.tGrab){x=C.stall.x;y=C.stall.y;run=false;const g=(t-L.tIn)/L.tGrab;breadOnStall=g<.45;hasBread=g>=.45}
  else{const u=Math.min(1,(t-L.tIn-L.tGrab)/L.tOut);x=C.stall.x+(C.exit.x-C.stall.x)*u;y=C.stall.y+(C.exit.y-C.stall.y)*u;hasBread=true;breadOnStall=false;const left=L.tOut*(1-u);alpha=Math.min(1,left/C.fade+.0)}
  /* the bread stays on the stall counter until it is picked up */
  if(breadOnStall)bread(c,C.stall.x+C.breadAt.x,C.stall.y+C.breadAt.y,1,1);
  c.save();
  if(clip){c.beginPath();if(C.tree.side>0)c.rect(C.tree.x+C.tree.r*.7,-1e5,2e5,2e5);else c.rect(-1e5,-1e5,C.tree.x-C.tree.r*.7+1e5,2e5);c.clip()}   // still inside the trunk's shadow: only the part that is out from behind the trunk shows
  if(alpha<1)c.globalAlpha*=Math.max(0,alpha);
  const bob=run?Math.abs(Math.sin(t*17))*6:0,lean=run?Math.sin(t*17)*.04:0;
  c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(x,y+2,17-bob*.4,6,0,0,6.283);c.fill();
  c.translate(x,y-bob);c.rotate(lean);c.scale(face,1);c.translate(-x,-y);
  drawKid(x,y);
  c.restore();
  if(hasBread){c.save();if(alpha<1)c.globalAlpha*=Math.max(0,alpha);bread(c,x+10,y-78-bob,.9,1);c.restore()}
  TR.runs=Math.max(TR.runs,1);TR.last={t:+t.toFixed(2),x:Math.round(x),y:Math.round(y),phase:t<L.tIn?'run-in':t<L.tIn+L.tGrab?'grab':'run-out'}}catch(e){TR.err=String((e&&e.message)||e)}};
console.info('[THIEFRUN] ready r1');
})();
