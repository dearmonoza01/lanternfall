
/* ---- puppet_h5_pack_r4 puppet_h5.js + DeaRz layout; patched: apply_arm2.py + apply_order_fix.py ---- */
// Lanternfall 2D cut-out puppet H5 CHIBI (no neck) r2 layout = DeaRz ref (arms at torso sides, legs apart) - facing LEFT; RIGHT = mirror.
// 
// window.PUPPET = { cfg, load, draw(ctx,x,y,scale,facing,pose), pose(name,t) }
(function(){
'use strict';
// Each part: img, pivot [px,py] in its own image, parent, at [ax,ay] in parent image.
var P = { // H5 chibi rig (Art 9 Nov, pivots_r1.json). No neck, one-piece arms, one fist image.
  torso:    {pivot:[113,223], parent:null, at:[0,0]},
  head:     {pivot:[149,271], parent:'torso', at:[108,54]},
  hair:     {pivot:[0,0], parent:'head', at:[-30,-95]},
  arm_near: {pivot:[99,18], parent:'torso', at:[28,62]},
  forearm_near:{pivot:[74.5,106], parent:'arm_near', at:[74.5,106]}, // ARM2 elbow
  elbow_near:{pivot:[74.5,106], parent:'arm_near', at:[74.5,106]}, // ARM2 elbow ring, fades in with bend
  fist_near:{img:'fist', pivot:[79,13], parent:'forearm_near', at:[50,194]},
  arm_far:  {pivot:[91,18], parent:'torso', at:[200,60]},
  forearm_far:{pivot:[72.5,106], parent:'arm_far', at:[72.5,106]}, // ARM2 elbow
  elbow_far:{pivot:[72.5,106], parent:'arm_far', at:[72.5,106]},
  fist_far: {img:'fist_dark', pivot:[79,13], parent:'forearm_far', at:[48,193]},
  leg_near: {pivot:[78,19], parent:'torso', at:[62,205]},
  foot_near:{pivot:[113,15], parent:'leg_near', at:[68,199]},
  leg_far:  {pivot:[69,19], parent:'torso', at:[160,205]},
  foot_far: {pivot:[101,16], parent:'leg_far', at:[67,197]},
  sword:    {pivot:[70,335], parent:'fist_near', at:[79,60]}
};
// back -> front
var ORDER = ['arm_far','forearm_far','elbow_far','fist_far','leg_far','foot_far','leg_near','foot_near','torso','head','hair','sword','arm_near','forearm_near','elbow_near','fist_near']; // DeaRz layout order (10 Nov 07:03: always his)
var cfg = {SWORD_SCALE:1, showSword:true, BODY:0.75, HEAD:1.0, SC:{"torso": 1.0, "arm": 0.6, "fist": 0.85, "leg": 0.62, "foot": 0.85, "sword": 0.8}, REST:{"arm_near": 10, "arm_far": -12}, // DeaRz: shirt over neck = torso drawn over head bottom (ORDER)
  CHIBI:null};
function absS(k){ if(k.indexOf('forearm_')===0) return absS(k.replace('forearm_','arm_')); if(k.indexOf('elbow_')===0) return absS(k.replace('elbow_','arm_')); var c=cfg.SC||{}; if(c[k]!=null) return c[k]; if(k==='head'||k==='hair') return cfg.HEAD; var g=k.replace(/_(near|far)$/,''); return c[g]!=null?c[g]:cfg.BODY; }
function relS(k){ var p=P[k].parent; return absS(k)/(p?absS(p):1); }
var imgs = {};
var slots = {};
function load(src){ // src: name -> url
  var names = Object.keys(src), n = names.length, done = 0;
  return new Promise(function(res){
    names.forEach(function(k){ var im = new Image(); im.onload = im.onerror = function(){ if(++done===n) res(); }; im.src = src[k]; im._key = k; imgs[k] = im; });
  });
}
// slots: eyes, mouth (expressions) + any part name -> image key (outfit / hair sets)
function partImg(k){ var p = P[k]; var key = slots[k] || p.img || k; return imgs[key]; }
function setFace(){ /* H5: face drawn into head */ }
var OUTFIT_PARTS=['torso','arm_near','arm_far','forearm_near','forearm_far','elbow_near','elbow_far','leg_near','leg_far','foot_near','foot_far','fist_near','fist_far'];
// outfit: 'default' | 'knight' | 'rogue' ; hair: 'default' | 'black' | 'silver' | 'red'
function setOutfit(name){ OUTFIT_PARTS.forEach(function(k){ if(!name||name==='default') delete slots[k]; else slots[k]= k==='fist_near'?name+'_fist' : k==='fist_far'?name+'_fist_dark' : name+'_'+k; });
  // H9: far hand shows the finger side (DeaRz 07:24 swap)
  if(cfg.FIST_FRONT!==false){ var pre=(!name||name==='default')?'':name+'_'; if(imgs[pre+'fist_front_dark']||(window.PUPPET_PARTS||{})[pre+'fist_front_dark']) slots.fist_far=pre+'fist_front_dark'; } } // DeaRz 07:24: finger side on the FAR hand; sword hand keeps back-of-hand
function setHair(name){ if(!name||name==='default') delete slots.hair; else slots.hair='hair_'+name; }
// set = {torso:'outfitB_torso', ...} ; null value resets to default
function setParts(set){ Object.keys(set).forEach(function(k){ if(set[k]==null) delete slots[k]; else slots[k]=set[k]; }); }
var D2R = Math.PI/180;
function mul(a,b){ return [a[0]*b[0]+a[2]*b[1], a[1]*b[0]+a[3]*b[1], a[0]*b[2]+a[2]*b[3], a[1]*b[2]+a[3]*b[3], a[0]*b[4]+a[2]*b[5]+a[4], a[1]*b[4]+a[3]*b[5]+a[5]]; }
function T(x,y){ return [1,0,0,1,x,y]; }
function R(d){ var c=Math.cos(d*D2R), s=Math.sin(d*D2R); return [c,s,-s,c,0,0]; }
function S(k){ return [k,0,0,k,0,0]; }
// pose: {rot:{part:deg}, off:{part:[dx,dy]}, root:[dx,dy], rootRot}
function solve(pose){
  var W = {};
  function get(k){
    if(W[k]) return W[k];
    var p = P[k], rot = ((pose.rot && pose.rot[k]) || 0) + ((cfg.REST||{})[k]||0), off = (pose.off && pose.off[k]) || [0,0];
    var base = p.parent ? get(p.parent) : mul(T(pose.root?pose.root[0]:0, pose.root?pose.root[1]:0), R(pose.rootRot||0));
    var ax=p.at[0];
    if(p.parent==='torso' && k!=='head' && slots.torso){ var sq=(window.PUPPET_TORSO_W||{})[slots.torso.split('_')[0]]; if(sq) ax=108+(ax-108)*sq; } // narrower outfit torso: pull arms/legs in
    var m = mul(base, T(ax+off[0], p.at[1]+off[1]));
    m = mul(m, R(rot));
    if(k==='sword') m = mul(m, S(cfg.SWORD_SCALE));
    var rs=relS(k); if(rs!==1) m = mul(m, S(rs));
    m = mul(m, T(-p.pivot[0], -p.pivot[1]));
    // children attach in this part's image space
    W[k] = m; return m;
  }
  ORDER.forEach(get);
  return W;
}
// draw at feet position (x,y); scale = art px -> screen px; facing -1 = left (art), 1 = right (mirror)
function footY(W){
  var best=-1e9;[['foot_near',[30,165]],['foot_near',[160,165]],['foot_far',[30,165]],['foot_far',[150,165]]].forEach(function(q){var m=W[q[0]];var yy=m[1]*q[1][0]+m[3]*q[1][1]+m[5];if(yy>best)best=yy;});return best;}
// ARM2: elbow ring opacity from the real bend angle (0 when straight, full at 25 deg)
var ELBOW_LINE=0; // DeaRz 05:11: no black elbow line
function elbowA(a,f){ if(!a||!f||!ELBOW_LINE) return 0; var d=Math.atan2(f[1],f[0])-Math.atan2(a[1],a[0]); d=Math.atan2(Math.sin(d),Math.cos(d)); return Math.min(1,Math.abs(d)*180/Math.PI/25); }
function draw(ctx, x, y, scale, facing, pose){
  pose = pose||{};
  var W = solve(pose);
  var gy = footY(W) - (pose.air||0) + (pose.rootBob||0);
  var saveE=slots.eyes, saveM=slots.mouth;
  
  slots._blink = !!pose.blink && !pose.eyes;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale * (facing>0 ? -1 : 1), scale);
  ctx.translate(0, -gy);
  ORDER.forEach(function(k){
    if(k==='sword' && !cfg.showSword) return; if(window.__ONLY && k!==window.__ONLY) return;
    var im = partImg(k); if(!im || !im.width) return;
    var m = W[k];
    var al=(window.PUPPET_ALIGN||{})[im._key]||[0,0];
    var ea=k.indexOf('elbow_')===0?elbowA(W[k.replace('elbow_','arm_')],W[k.replace('elbow_','forearm_')]):1; if(ea<=0.01) return;
    ctx.save(); ctx.globalAlpha=ea; ctx.transform(m[0],m[1],m[2],m[3],m[4],m[5]); if(!(window.__WLD&&window.__WLD(ctx,k,im,al)))ctx.drawImage(im,al[0],al[1]); ctx.restore();
  });
  ctx.restore();
  slots.eyes=saveE; slots.mouth=saveM; slots._blink=false;
}

// ---- code-made animations (t in seconds) ----
var TAU=Math.PI*2;
function pose(name, t, o){
  o=o||{}; var r={}, off={}, P={rot:r, off:off, air:0};
  if(name==='idle'){
    var b=Math.sin(t*TAU/2.4);              // breath, 2.4 s
    off.torso=[0,-2.5*(b+1)/2];             // chest lift only
    r.torso=-0.6*(b+1)/2; r.head=0.5*b;
    r.arm_upper_near=1.5*b; r.forearm_near=0; r.fist_near=0; P.swordWorld=150;
    r.arm_upper_far=-1.5*b; r.forearm_far=0; // DeaRz 07:07 idle arms = editor placement
    r.thigh_near=3; r.thigh_far=-3; r.boot_near=-3; r.boot_far=3;
  } else if(name==='walk' || name==='run'){
    var run=name==='run', per=run?0.48:0.8, p=(t/per)%1, a=p*TAU, s=Math.sin(a), c=Math.cos(a);
    var A=run?38:24, K=run?70:34, AR=run?48:26;
    r.thigh_near= A*s; r.thigh_far=-A*s;
    // knee bends back while that leg swings forward (lifting)
    r.boot_near=-K*Math.max(0, c)*(run?1:0.9) - (run?10:0);
    r.boot_far =-K*Math.max(0,-c)*(run?1:0.9) - (run?10:0);
    r.arm_upper_near=-AR*s + (run?10:2); r.arm_upper_far=AR*s + (run?10:2);
    r.forearm_near=run?60:18; r.forearm_far=run?60:18; r.fist_near=0; P.swordWorld=run?118:148;
    r.torso=run?-12:-2; r.head=run?6:1;
    var bob=Math.abs(Math.sin(a));
    off.hips=[0,0]; P.air = run? 10*bob : 0; P.rootBob = run?0:3*(1-bob);
    off.torso=[0, run?0:-1.5*bob];
  } else if(name==='slash'){
    var D=o.dur||0.42, q=Math.min(1,Math.max(0,t/D));
    function E(x){return x<0?0:x>1?1:x*x*(3-2*x);}
    function K(keys){ for(var i=1;i<keys.length;i++){ if(q<=keys[i][0]){ var a=keys[i-1], b=keys[i], u=E((q-a[0])/(b[0]-a[0])); return a[1]+(b[1]-a[1])*u; } } return keys[keys.length-1][1]; }
    // overhead chop: raise in front over head (wind-up), chop forward-down, recover
    var arm=K([[0,4],[0.38,215],[0.58,35],[1,4]]);
    r.torso=K([[0,0],[0.38,7],[0.58,-14],[1,0]]); r.head=K([[0,0],[0.38,-4],[0.58,6],[1,0]]);
    r.arm_upper_near=arm - r.torso; r.forearm_near=K([[0,-18],[0.38,-25],[0.58,0],[1,-18]]); r.fist_near=0;
    var along=arm + r.forearm_near + 180 - 12;
    var blend=K([[0,0],[0.15,1],[0.7,1],[1,0]]);
    P.swordWorld = 150*(1-blend) + along*blend;
    r.arm_upper_far=K([[0,-3],[0.38,-25],[0.58,40],[1,-3]]) - r.torso; r.forearm_far=K([[0,10],[0.58,35],[1,10]]);
    r.thigh_near=K([[0,3],[0.38,0],[0.58,18],[1,3]]); r.thigh_far=K([[0,-3],[0.38,-6],[0.58,-14],[1,-3]]);
    r.boot_near=-3; r.boot_far=K([[0,3],[0.58,-6],[1,3]]);
    P.strike = q>=0.48 && q<0.62; P.hitT = 0.52*D;
  }
  if(name!=='slash'){ var bt=t%3.7; P.blink = bt<0.13; } else { if(q>0.3&&q<0.8){P.eyes='eyes_angry';P.mouth='mouth_shout';} }
  // map to H5 parts: one-piece arm takes upper+half forearm bend; legs/feet
  r.arm_near=(r.arm_upper_near||0); r.arm_far=(r.arm_upper_far||0); var FAc=function(v){return Math.max(-10,Math.min(150,v||0));}; r.forearm_near=FAc(r.forearm_near); r.forearm_far=FAc(r.forearm_far); // ARM2: real elbow
  r.fist_near=(r.fist_near||0); r.fist_far=0;
  r.leg_near=r.thigh_near||0; r.leg_far=r.thigh_far||0; r.foot_near=0.5*(r.boot_near||0); r.foot_far=0.5*(r.boot_far||0);
  if(off.torso){ off.head=[0,off.torso[1]*1.2]; delete off.torso; } // breath: head bob only
  if(P.swordWorld!=null){ r.sword = cfg.SWORD_FOLLOW===false ? (P.swordWorld-150) - ((r.torso||0)+r.arm_near+r.forearm_near+r.fist_near) : 0; } // DeaRz 9 Nov 06:56: sword locked to fist // 150 = neutral grip, so editor sword rot is kept (DeaRz 9 Nov 06:54)
  return P;
}
// Layout JSON from the drag editor: {version:1, parts:{name:{at:[x,y], pivot:[x,y], rot:deg, scale:s}}, order:[back..front]}
// at = attach point in PARENT image px; pivot = rotation point in own image px; rot = rest angle (deg, + = clockwise, art facing left);
// scale = absolute size (1 = art px). Unknown keys ignored.
function applyLayout(L){ if(typeof L==='string') L=JSON.parse(L); var parts=L.parts||{};
  Object.keys(parts).forEach(function(k){ var q=parts[k], p=P[k]; if(!p) return;
    if(q.at) p.at=[+q.at[0],+q.at[1]]; if(q.pivot) p.pivot=[+q.pivot[0],+q.pivot[1]];
    if(q.rot!=null){ cfg.REST=cfg.REST||{}; cfg.REST[k]=+q.rot; }
    if(q.scale!=null){ cfg.SC=cfg.SC||{}; cfg.SC[k]=+q.scale; } });
  if(L.order && L.order.length){ var ok=L.order.filter(function(k){return P[k]||ORDER.indexOf(k)>=0;}); if(ok.length){ var cur=ORDER.slice(), out=ok.slice(); // merge: layout order wins, extra parts keep their place after their previous neighbour
    cur.forEach(function(k,i){ if(out.indexOf(k)>=0) return; var j=i-1; while(j>=0&&out.indexOf(cur[j])<0) j--; out.splice(j<0?0:out.indexOf(cur[j])+1,0,k); });
    ORDER.length=0; out.forEach(function(k){ORDER.push(k);}); } }
  return true; }
function getLayout(){ var o={version:1,parts:{},order:ORDER.slice()}; Object.keys(P).forEach(function(k){ o.parts[k]={at:P[k].at.slice(),pivot:P[k].pivot.slice(),rot:(cfg.REST||{})[k]||0,scale:absS(k)}; }); return o; }

window.PUPPET = {applyLayout:applyLayout, getLayout:getLayout, setOutfit:setOutfit, setHair:setHair, setFace:setFace, setParts:setParts, footY:footY, pose:pose, P:P, ORDER:ORDER, cfg:cfg, absS:absS, slots:slots, imgs:imgs, load:load, draw:draw, solve:solve};
})();

// DeaRz layout r1 (editor, 9 Nov 07:09)
window.PUPPET.setOutfit('default');
window.PUPPET.applyLayout({"version":1,"parts":{"torso":{"at":[-51,-58],"pivot":[113,223],"rot":0,"scale":1},"head":{"at":[131,26],"pivot":[149,271],"rot":0,"scale":1},"hair":{"at":[367,496],"pivot":[404,593],"rot":0,"scale":1},"arm_near":{"at":[172,69],"pivot":[105,49],"rot":-20.6,"scale":0.847},"fist_near":{"at":[47,192],"pivot":[95,35],"rot":-11.4,"scale":0.937},"arm_far":{"at":[49.6,78.3],"pivot":[67,43],"rot":-0.3,"scale":0.847},"fist_far":{"at":[52.6,176.8],"pivot":[89,26],"rot":12.3,"scale":0.937},"leg_near":{"at":[127,203],"pivot":[78,19],"rot":0,"scale":0.62},"foot_near":{"at":[71,191],"pivot":[113,15],"rot":0,"scale":0.85},"leg_far":{"at":[66,199],"pivot":[69,19],"rot":0,"scale":0.62},"foot_far":{"at":[67,191],"pivot":[101,16],"rot":0,"scale":0.85},"sword":{"at":[72,71],"pivot":[86,350],"rot":-62.2,"scale":0.8}},"order":["arm_far","fist_far","leg_far","foot_far","leg_near","foot_near","torso","head","hair","sword","arm_near","fist_near"]});

