
/* ---- puppet_creator_pack_r11 charcreate_h25.js ---- */
// Lanternfall chibi hero: hair colour (dye) + character creation page (DeaRz 9 Nov 18:28) (Code, 9 Nov 2026)
// "หน้าสร้างตัวละคร เพิ่มฟังชั่น เปลี่ยน ทรงผม สีผม เพศ ... ชุดไม่ต้อง (ขายชุดกับผ้าคลุมเป็นแคช)"
// Load AFTER face3q_scarf_h24.js. Needs PUPPET.load done before setHairColor / openCreator.
// API:
//   PUPPET.HAIR_COLORS                  list of {id, name, h,s,l}
//   PUPPET.setHairColor(id)             'natural' = original art colour
//   PUPPET.getChar() / setChar({gender, hair, hairColor})
//   PUPPET.HAIRS_BY_GENDER              {boy:[...], girl:[...]}
//   PUPPET.openCreator(opts, onDone)    full-screen page; onDone({gender,hair,hairColor,name}) on confirm
(function(){
'use strict';
var U=window.PUPPET, slots=U.slots, AL=window.PUPPET_ALIGN=window.PUPPET_ALIGN||{};
// outfits + scarf are cash-shop items now: the starter look is default outfit, no scarf
if(U.setScarf) U.setScarf(false);
U.HAIRS_BY_GENDER={boy:['default','b1','b2','b3','b4','b5'], girl:['g6','g7','g8','g9','g10']};
U.HAIR_COLORS=[
  {id:'natural', name:'สีเดิม'},
  {id:'black',  name:'ดำ',      h:220, s:0.12, l:0.20},
  {id:'brown',  name:'น้ำตาล',  h:25,  s:0.45, l:0.35},
  {id:'blond',  name:'บลอนด์',  h:45,  s:0.75, l:0.62},
  {id:'red',    name:'แดง',     h:4,   s:0.70, l:0.45},
  {id:'orange', name:'ส้ม',     h:22,  s:0.85, l:0.52},
  {id:'silver', name:'เงิน',    h:215, s:0.10, l:0.78},
  {id:'blue',   name:'น้ำเงิน', h:220, s:0.65, l:0.42},
  {id:'green',  name:'เขียว',   h:150, s:0.55, l:0.40},
  {id:'purple', name:'ม่วง',    h:275, s:0.55, l:0.45},
  {id:'pink',   name:'ชมพู',    h:335, s:0.70, l:0.70}
];
function rgb2hsl(r,g,b){ r/=255; g/=255; b/=255; var mx=Math.max(r,g,b), mn=Math.min(r,g,b), l=(mx+mn)/2, h=0, s=0, d=mx-mn;
  if(d>1e-6){ s=l>0.5?d/(2-mx-mn):d/(mx+mn); h= mx===r?((g-b)/d+(g<b?6:0)) : mx===g?((b-r)/d+2) : ((r-g)/d+4); h*=60; } return [h,s,l]; }
function hue2(p,q,t){ if(t<0)t+=1; if(t>1)t-=1; if(t<1/6)return p+(q-p)*6*t; if(t<1/2)return q; if(t<2/3)return p+(q-p)*(2/3-t)*6; return p; }
function hsl2rgb(h,s,l){ h/=360; if(s<=0){ var v=l*255; return [v,v,v]; } var q=l<0.5?l*(1+s):l+s-l*s, p=2*l-q; return [hue2(p,q,h+1/3)*255,hue2(p,q,h)*255,hue2(p,q,h-1/3)*255]; }
function hd(a,b){ var d=Math.abs(a-b)%360; return d>180?360-d:d; }
// analyse an image once: dominant hair hue (weighted histogram of coloured, opaque pixels) + median lightness/saturation
var STAT={};
function stats(im,d){ if(STAT[im._key]) return STAT[im._key]; var H=new Float32Array(36), i, n=d.length, hs=[];
  for(i=0;i<n;i+=4){ if(d[i+3]<128) continue; var c=rgb2hsl(d[i],d[i+1],d[i+2]); if(c[2]<0.12||c[2]>0.95) continue; H[Math.floor(c[0]/10)%36]+=c[1]+0.05; hs.push(c); }
  var best=0; for(i=1;i<36;i++) if(H[i]>H[best]) best=i; var hue=best*10+5;
  var L=[], S=[]; hs.forEach(function(c){ if(hd(c[0],hue)<=40||c[1]<0.12){ L.push(c[2]); S.push(c[1]); } });
  L.sort(); S.sort(); var st={h:hue, l:L.length?L[L.length>>1]:0.5, s:S.length?S[S.length>>1]:0.4, grey:(S.length?S[S.length>>1]:0)<0.15};
  return STAT[im._key]=st; }
var CACHE={};
// near-white pixels (min rgb>=196) in connected groups smaller than 120 px = hair shine, bigger = ornament
function specks(d,W,H){ var n=W*H, wm=new Uint8Array(n), out=new Uint8Array(n), st=[], comp=[], tot=0, nw=0;
  for(var i=0;i<n;i++){ if(d[i*4+3]<8) continue; tot++; if(Math.min(d[i*4],d[i*4+1],d[i*4+2])>=196){ wm[i]=1; nw++; } }
  for(var j=0;j<n;j++){ if(wm[j]!==1) continue; comp.length=0; st.push(j); wm[j]=2;
    while(st.length){ var q=st.pop(); comp.push(q); var x=q%W, y=(q/W)|0;
      if(x>0&&wm[q-1]===1){wm[q-1]=2;st.push(q-1);} if(x<W-1&&wm[q+1]===1){wm[q+1]=2;st.push(q+1);} if(y>0&&wm[q-W]===1){wm[q-W]=2;st.push(q-W);} if(y<H-1&&wm[q+W]===1){wm[q+W]=2;st.push(q+W);} }
    if(comp.length<120) for(var k=0;k<comp.length;k++) out[comp[k]]=1; }
  out.light=tot>0&&nw/tot>0.25; return out; } // light=white/silver hair (g10): its near-white body is hair, not ornament
function dyed(key,col){ var ck=key+'@'+col.id; if(U.imgs[ck]) return ck; var im=U.imgs[key]; if(!im||!im.width) return null;
  var c=document.createElement('canvas'); c.width=im.width; c.height=im.height; var x=c.getContext('2d'); x.drawImage(im,0,0);
  var id; try{ id=x.getImageData(0,0,c.width,c.height); }catch(e){ return null; }
  var d=id.data, st=stats(im,d), win=st.grey?360:40;
  var SPECK=specks(d,c.width,c.height);
  for(var i=0;i<d.length;i+=4){ if(d[i+3]<8) continue; var p=rgb2hsl(d[i],d[i+1],d[i+2]);
    if(p[2]<0.09) continue;                                  // keep black line art
    var wh=SPECK[i>>2]||(SPECK.light&&Math.min(d[i],d[i+1],d[i+2])>=196); // DeaRz 10 Nov 07:56: shine specks / near-white body of light hair have random hue -> treat as hair (were kept white = looked like holes)
    var near=wh||(st.grey?(p[1]<0.25):(hd(p[0],st.h)<=win||p[1]<0.10)); if(!near) continue; // keep ribbons/flowers/ornaments of other colours
    if(!wh && !st.grey && p[1]<0.10 && p[2]>0.85) continue;          // keep white ornaments (big white areas, e.g. flower petals)
    var l=Math.max(0.03,Math.min(0.97,col.l+(p[2]-st.l)*(col.l<0.3?0.7:1))), s=Math.max(0,Math.min(1,col.s*(st.grey?1:Math.min(1.6,(p[1]+0.05)/(st.s+0.05)))));
    var o=hsl2rgb(col.h,s,l); d[i]=o[0]; d[i+1]=o[1]; d[i+2]=o[2]; }
  x.putImageData(id,0,0); c._key=ck; U.imgs[ck]=c; if(AL[key]) AL[ck]=AL[key].slice(); return ck; }
var CHAR={gender:'boy', hair:'default', hairColor:'natural'};
function colOf(id){ for(var i=0;i<U.HAIR_COLORS.length;i++) if(U.HAIR_COLORS[i].id===id) return U.HAIR_COLORS[i]; return U.HAIR_COLORS[0]; }
function applyColor(){ var col=colOf(CHAR.hairColor); ['hair','hair_back'].forEach(function(k){ var s=slots[k]; if(!s||s==='_none') return; var base=s.split('@')[0]; if(/^_/.test(base)) return;
  if(col.id==='natural'){ slots[k]=base; return; } var nk=dyed(base,col); if(nk) slots[k]=nk; }); }
// keep the dye after every look change (wrap outermost)
['setOutfit','setGender','setLook','setHair','set3q'].forEach(function(f){ var b=U[f]; if(!b) return; U[f]=function(){ var r=b.apply(this,arguments); applyColor(); return r; }; });
U.setHairColor=function(id){ CHAR.hairColor=colOf(id).id; U.setLook(U.getLook()); };
U.setChar=function(o){ o=o||{}; if(o.gender) CHAR.gender=o.gender==='girl'?'girl':'boy'; var list=U.HAIRS_BY_GENDER[CHAR.gender];
  if(o.hair) CHAR.hair=o.hair; if(list.indexOf(CHAR.hair)<0) CHAR.hair=list[0]; if(o.hairColor) CHAR.hairColor=colOf(o.hairColor).id;
  U.setLook({gender:CHAR.gender, hair:CHAR.hair}); return U.getChar(); };
U.getChar=function(){ return {gender:CHAR.gender, hair:CHAR.hair, hairColor:CHAR.hairColor}; };

// ---------- character creation page ----------
var CSS='#pcc{position:fixed;inset:0;z-index:99999;background:linear-gradient(#1d2a3a,#0e1620);color:#f2efe6;font:15px/1.35 system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;overflow:auto;-webkit-user-select:none;user-select:none}'+
 '#pcc h2{margin:14px 0 4px;font-size:20px;letter-spacing:.5px}#pcc .pv{width:min(92vw,360px);height:min(46vh,380px);display:block}'+
 '#pcc .row{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:6px 12px;max-width:560px}#pcc canvas{background:radial-gradient(#3b5874,#22344a);border-radius:12px}#pcc .lbl{color:#f2efe6;font-weight:600;width:100%;text-align:center;opacity:.9;font-size:13px;margin-top:6px}'+
 '#pcc button{min-width:44px;min-height:44px;border-radius:10px;border:2px solid #4b5d73;background:#24364b;color:#f2efe6;font:inherit;padding:4px 10px;cursor:pointer}'+
 '#pcc button[aria-pressed=true]{border-color:#ffd36b;background:#3a4f68}#pcc .sw{width:44px;height:44px;padding:0;border-radius:50%}'+
 '#pcc .hb{padding:0;width:64px;height:64px;overflow:hidden}#pcc .hb canvas{width:64px;height:64px;display:block}'+
 '#pcc input{min-height:40px;border-radius:10px;border:2px solid #4b5d73;background:#101b27;color:#fff;font:inherit;padding:0 12px;width:min(80vw,260px);text-align:center}'+
 '#pcc .ok{background:#c9892b;border-color:#ffd36b;font-weight:700;padding:8px 28px;margin:12px 0 20px}#pcc .note{color:#f2efe6;opacity:.8;font-size:12px;margin-top:4px}';
U.openCreator=function(opts,onDone){ opts=opts||{}; if(typeof opts==='function'){ onDone=opts; opts={}; }
  var old=document.getElementById('pcc'); if(old) old.remove();
  if(!document.getElementById('pcc-css')){ var st=document.createElement('style'); st.id='pcc-css'; st.textContent=CSS; document.head.appendChild(st); }
  var saved=U.getLook(), swayWas=U.cfg.SWAY; U.setChar(opts.char||CHAR); if(U.setSway) U.setSway(true);
  var root=document.createElement('div'); root.id='pcc'; root.setAttribute('role','dialog'); root.setAttribute('aria-label','สร้างตัวละคร');
  root.innerHTML='<h2>สร้างตัวละคร</h2><canvas class="pv" width="720" height="760"></canvas>'+
    '<div class="row" data-r="g"><div class="lbl">เพศ</div><button data-g="boy">ชาย</button><button data-g="girl">หญิง</button></div>'+
    '<div class="row" data-r="h"><div class="lbl">ทรงผม</div></div>'+
    '<div class="row" data-r="c"><div class="lbl">สีผม</div></div>'+
    (opts.askName===false?'':'<div class="row"><div class="lbl">ชื่อ</div><input maxlength="12" placeholder="ชื่อตัวละคร" value="'+String(opts.name||'').replace(/[<>"&]/g,'')+'"></div>')+
    '<div class="note">ชุดและผ้าคลุมซื้อได้ในร้านค้า</div><button class="ok">'+(opts.okText||'เริ่มผจญภัย')+'</button>';
  document.body.appendChild(root);
  var cv=root.querySelector('.pv'), cx=cv.getContext('2d'), alive=true, T=0, last=performance.now(), anim='idle', animT=0;
  function mark(){ root.querySelectorAll('[data-g]').forEach(function(b){ b.setAttribute('aria-pressed',b.getAttribute('data-g')===CHAR.gender?'true':'false'); });
    root.querySelectorAll('[data-h]').forEach(function(b){ b.setAttribute('aria-pressed',b.getAttribute('data-h')===CHAR.hair?'true':'false'); });
    root.querySelectorAll('[data-c]').forEach(function(b){ b.setAttribute('aria-pressed',b.getAttribute('data-c')===CHAR.hairColor?'true':'false'); }); }
  function thumb(c,hair){ var x=c.getContext('2d'); x.clearRect(0,0,c.width,c.height); var keep=U.getChar(); U.setChar({hair:hair}); var p=U.pose('idle',0,{}); U.draw(x,c.width/2,c.height*1.55,0.30,-1,p); U.setChar(keep); }
  function buildHair(){ var row=root.querySelector('[data-r=h]'); row.querySelectorAll('button').forEach(function(b){ b.remove(); });
    U.HAIRS_BY_GENDER[CHAR.gender].forEach(function(h,i){ var b=document.createElement('button'); b.className='hb'; b.setAttribute('data-h',h); b.setAttribute('aria-label','ทรงผม '+(i+1)); var c=document.createElement('canvas'); c.width=128; c.height=128; b.appendChild(c); row.appendChild(b);
      b.onclick=function(){ U.setChar({hair:h}); anim='idle'; mark(); }; });
    var sway=U.cfg.SWAY; U.cfg.SWAY=false; row.querySelectorAll('.hb').forEach(function(b){ thumb(b.firstChild,b.getAttribute('data-h')); }); U.cfg.SWAY=sway; }
  var crow=root.querySelector('[data-r=c]');
  U.HAIR_COLORS.forEach(function(c){ var b=document.createElement('button'); b.className='sw'; b.setAttribute('data-c',c.id); b.setAttribute('aria-label','สีผม '+c.name); b.title=c.name;
    if(c.id==='natural'){ b.textContent='เดิม'; b.style.fontSize='12px'; } else { var o=hsl2rgb(c.h,c.s,c.l); b.style.background='rgb('+(o[0]|0)+','+(o[1]|0)+','+(o[2]|0)+')'; }
    crow.appendChild(b); b.onclick=function(){ U.setHairColor(c.id); mark(); buildHair(); mark(); }; });
  root.querySelectorAll('[data-g]').forEach(function(b){ b.onclick=function(){ U.setChar({gender:b.getAttribute('data-g')}); buildHair(); mark(); }; });
  cv.onclick=function(){ anim=anim==='idle'?'walk':anim==='walk'?'run':'idle'; animT=0; };
  root.querySelector('.ok').onclick=function(){ var inp=root.querySelector('input'); var r=U.getChar(); r.name=inp?inp.value.trim():''; close(); if(onDone) onDone(r); };
  function close(){ alive=false; root.remove(); if(U.setSway) U.setSway(swayWas); }
  function frame(now){ if(!alive) return; var dt=Math.min(0.05,(now-last)/1000); last=now; T+=dt; animT+=dt;
    cx.clearRect(0,0,cv.width,cv.height); cx.fillStyle='rgba(0,0,0,.25)'; cx.beginPath(); cx.ellipse(360,700,150,24,0,0,6.3); cx.fill();
    var p=U.pose(anim,animT,{dur:0.5}); U.draw(cx,360,700,0.75,-1,p); requestAnimationFrame(frame); }
  buildHair(); mark(); requestAnimationFrame(frame);
  return {close:close}; };
})();

