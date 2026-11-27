
/* scythe_combo_r4 drawc.js + r18: the overhead layer swap (arm + scythe behind the head) only runs with window.SCYSWAP (?scyswap=on); the standing rule torso < head < hair < sword < arm_near is kept by default */
window.SCYSWAP=/[?&]scyswap=on\b/.test(location.search);
// draw wrapper: weapon/arm layer swap (overhead = arm passes BEHIND the head), forward lunge, body turns (front/back art or squash+flip), blade-tip point
(function(){
var U=window.PUPPET, O=U.ORDER, GROUP=['sword','arm_near','forearm_near','elbow_near','arrow','fist_near'];
function setLayer(over){ var g=GROUP.filter(function(k){return O.indexOf(k)>=0;}); g.forEach(function(k){ O.splice(O.indexOf(k),1); });
  var at; if(over){ at=O.indexOf('head'); } else { at=O.indexOf('scarf'); at=at<0?O.indexOf('hair'):at; at=at<0?O.length:at+1; }
  Array.prototype.splice.apply(O,[at<0?O.length:at,0].concat(g)); }
// user layer order (DeaRz editor): reorder parts present; parts not listed stay right after their old neighbour
function applyUser(){ var W=window.USER_ORDER, out=O.slice();
  if(W&&W.length){ var cur=O.slice(); out=W.filter(function(k){return cur.indexOf(k)>=0;});
    cur.forEach(function(k,i){ if(out.indexOf(k)<0){ var j=i>0?out.indexOf(cur[i-1]):-1; out.splice(j+1,0,k); } }); }
  O.length=0; out.forEach(function(k){O.push(k);}); }
// hide one part for this draw only (blink of the selected part in the editor, and visibility test)
function hidePart(){ var h=window.HIDE_PART; if(!h&&window.BLINK_PART&&(performance.now()%700)<260) h=window.BLINK_PART; if(h){ HID={k:h,had:Object.prototype.hasOwnProperty.call(U.slots,h),v:U.slots[h]}; U.slots[h]='__hidden__'; } }
var HID=null; function unhide(){ if(!HID) return; if(HID.had) U.slots[HID.k]=HID.v; else delete U.slots[HID.k]; HID=null; }
window.comboOrder=function(){ var s=O.slice(); applyUser(); var r=O.slice(); O.length=0; s.forEach(function(k){O.push(k);}); return r; };
function screenPt(p,x,y,sc,face,pt){ var W=U.solve(p), m=W.sword, gy=U.footY(W)-(p.air||0)+(p.rootBob||0);
  var ax=m[0]*pt[0]+m[2]*pt[1]+m[4], ay=m[1]*pt[0]+m[3]*pt[1]+m[5]; return [x+ax*sc*(face>0?-1:1), y+(ay-gy)*sc]; }
// blade points only (no drawing), used to sub-sample fast swings for the effect ribbon
window.comboBlade=function(x,y,sc,face,p){ var A=p.air||0; if(A){ p=Object.create(p); p.air=0; y=y-A*sc; }
  var X=x+(p.lunge||0)*sc*(face>0?-1:1), th=(((p.turn||0)%360)+360)%360, turning=th>0.5&&th<359.5, c=Math.cos(th*Math.PI/180), f=face, sx=1, vw=null;
  if(turning){ if(window.SPINVIEW&&SPINVIEW.ok()){ if(th>=45&&th<135) vw='front'; else if(th>=225&&th<315) vw='back'; }
    if(!vw){ f=(c>=0?face:-face); sx=Math.max(SPINVIEW&&SPINVIEW.ok()?0.72:0.36,Math.abs(c)); } }
  if(vw){ var ty=y-(p.hold==='low'?70:p.hold==='over'?470:230)*sc, sd=(vw==='front'?-1:1); return {X:X,tip:[X+sd*170*sc,ty],heel:[X+sd*90*sc,ty-40*sc]}; }
  var tip=screenPt(p,X,y,sc,f,[10,170]), heel=screenPt(p,X,y,sc,f,[230,75]); if(sx!==1){ tip[0]=X+(tip[0]-X)*sx; heel[0]=X+(heel[0]-X)*sx; } return {X:X,tip:tip,heel:heel}; };
window.drawCombo=function(cx,x,y,sc,face,p){
  var SAVED=O.slice(); function back(){ unhide(); O.length=0; SAVED.forEach(function(k){O.push(k);}); }
  applyUser(); if(p.over&&window.SCYSWAP) setLayer(true); hidePart(); var A=p.air||0; if(A){ p=Object.create(p); p.air=0; y=y-A*sc; p.airUp=A; }
  var X=x+(p.lunge||0)*sc*(face>0?-1:1);
  var th=(((p.turn||0)%360)+360)%360, turning=th>0.5&&th<359.5, c=Math.cos(th*Math.PI/180), f=face, sx=1, vw=null;
  if(turning){ if(window.SPINVIEW&&SPINVIEW.ok()){ if(th>=45&&th<135) vw='front'; else if(th>=225&&th<315) vw='back'; }
    if(!vw){ f=(c>=0?face:-face); sx=Math.max(SPINVIEW&&SPINVIEW.ok()?0.72:0.36,Math.abs(c)); } }
  if(vw){ SPINVIEW.draw(cx,X,y,sc,vw,p); back(); var ty=y-(p.hold==='low'?70:p.hold==='over'?470:230)*sc-(p.air||0)*sc, sd=(vw==='front'?-1:1); return {X:X,tip:[X+sd*170*sc,ty],heel:[X+sd*90*sc,ty-40*sc]}; }
  cx.save(); if(sx!==1){ cx.translate(X,0); cx.scale(sx,1); cx.translate(-X,0); } U.draw(cx,X,y,sc,f,p); cx.restore();
  var tip=screenPt(p,X,y,sc,f,[10,170]), heel=screenPt(p,X,y,sc,f,[230,75]); if(sx!==1){ tip[0]=X+(tip[0]-X)*sx; heel[0]=X+(heel[0]-X)*sx; }
  back(); return {X:X,tip:tip,heel:heel}; };
})();

