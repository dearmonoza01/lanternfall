
/* ---- puppet_creator_pack_r11 faces_h31.js (10 faces + eye colour + blink; after dressroom_h27 + race_h26) ---- */
// faces_h31 (Code 10 Nov 2026): 10 hero faces (5 boy + 5 girl) + changeable eye colour + BLINK, for the dressing room and game. TEST only.
// h31 = h30 + blink (Art game_blink r4, QA-look + QA-motion PASS): open -> half 60 ms -> closed 90 ms -> half 60 ms -> open, every 2.5-5 s. ?blink=off.
// Art handoff art/hero2d/faces_r1/HANDOFF_code_faces_r1.md (QA-look PASS; DeaRz 08:58 "เอาทั้งหมด", 08:59 eye colour changeable).
// Needs face_data_r2.js (window.FACE_DATA) and must load AFTER dressroom_h27.js (wraps openCreator) and race_h26.js.
// The chosen face replaces the images behind the keys head3q / head3q_noear / girl_head3q / girl_head3q_noear (same canvas + alignment),
// so race no-ear heads, layer order (DeaRz standard) and every other module keep working unchanged.
// Eye colour: inside the iris mask set the HSV hue, keep S and V (silver: S x 0.03, amber = original). Baked once per face+colour, cached.
// API: PUPPET.setFace('f1'..'f5'), PUPPET.setEyeColor(id), getChar()/setChar() carry .face / .eyeColor. ?faces=off disables.
(function(){
if(/[?&]faces=off/.test(location.search)) return;
var U=window.PUPPET, FD=window.FACE_DATA; if(!U||!FD) return;
U.FACE_NAMES={boy:['อ่อนโยน','เท่','ร่าเริง','ง่วงนอน','กล้าหาญ'], girl:['หวาน','สง่า','ร่าเริง','ขี้อาย','ทอมบอย']};
U.EYE_COLORS=[{id:'amber',name:'อำพัน',c:'#d48a1e'},{id:'blue',name:'ฟ้า',h:210,c:'#3d7fd6'},{id:'green',name:'เขียว',h:120,c:'#3fa04a'},
  {id:'violet',name:'ม่วง',h:270,c:'#8a4fd0'},{id:'red',name:'แดง',h:0,c:'#d23a3a'},{id:'silver',name:'เงิน',grey:true,c:'#b8bcc4'}];
var ST={face:'f1', eye:'amber'}, RAW={}, OUT={}, ready=false, pend=0;
function eyeOf(id){ for(var i=0;i<U.EYE_COLORS.length;i++) if(U.EYE_COLORS[i].id===id) return U.EYE_COLORS[i]; return U.EYE_COLORS[0]; }
function loadImg(src){ pend++; var im=new Image(); im.onload=im.onerror=function(){ if(--pend===0){ ready=true; apply(); } }; im.src=src; return im; }
['boy','girl'].forEach(function(g){ for(var f in FD[g]){ var e=FD[g][f]; RAW[g+f]={h:loadImg(e.h),hn:loadImg(e.hn),m:loadImg(e.m),mn:loadImg(e.mn)}; if(e.hh){ RAW[g+f].hh=loadImg(e.hh); RAW[g+f].hhn=loadImg(e.hhn); RAW[g+f].hc=loadImg(e.hc); RAW[g+f].hcn=loadImg(e.hcn); RAW[g+f].mh=loadImg(e.mh); RAW[g+f].mhn=loadImg(e.mhn); } } });
function rgb2hsv(r,g,b){ r/=255; g/=255; b/=255; var mx=Math.max(r,g,b), mn=Math.min(r,g,b), d=mx-mn, h=0;
  if(d){ if(mx===r) h=((g-b)/d)%6; else if(mx===g) h=(b-r)/d+2; else h=(r-g)/d+4; h*=60; if(h<0) h+=360; } return [h, mx?d/mx:0, mx]; }
function hsv2rgb(h,s,v){ var c=v*s, x=c*(1-Math.abs((h/60)%2-1)), m=v-c, r=0,g=0,b=0;
  if(h<60){r=c;g=x;} else if(h<120){r=x;g=c;} else if(h<180){g=c;b=x;} else if(h<240){g=x;b=c;} else if(h<300){r=x;b=c;} else {r=c;b=x;}
  return [(r+m)*255,(g+m)*255,(b+m)*255]; }
function bake(g,f,noear,eid,fr){ fr=fr||''; var ck=g+f+(noear?'n':'')+fr+'@'+eid; if(OUT[ck]) return OUT[ck]; var R=RAW[g+f]; if(!R) return null;
  var im=fr==='c'?(noear?R.hcn:R.hc):fr==='h'?(noear?R.hhn:R.hh):(noear?R.hn:R.h), mk=fr==='c'?null:fr==='h'?(noear?R.mhn:R.mh):(noear?R.mn:R.m); if(!im||!im.width) return null;
  var c=document.createElement('canvas'); c.width=im.width; c.height=im.height; var x=c.getContext('2d'); x.drawImage(im,0,0); var col=eyeOf(eid);
  if(mk&&(col.h!=null||col.grey)){ try{
    var id=x.getImageData(0,0,c.width,c.height), d=id.data, m2=document.createElement('canvas'); m2.width=c.width; m2.height=c.height; var mx=m2.getContext('2d'); mx.drawImage(mk,0,0);
    var md=mx.getImageData(0,0,c.width,c.height).data;
    for(var i=0;i<d.length;i+=4){ var a=md[i]/255; if(a<=0.004||d[i+3]<4) continue; var hsv=rgb2hsv(d[i],d[i+1],d[i+2]);
      var o=col.grey?hsv2rgb(hsv[0],hsv[1]*0.03,hsv[2]):hsv2rgb(col.h,hsv[1],hsv[2]);
      d[i]=d[i]*(1-a)+o[0]*a; d[i+1]=d[i+1]*(1-a)+o[1]*a; d[i+2]=d[i+2]*(1-a)+o[2]*a; }
    x.putImageData(id,0,0); }catch(e){} }
  return OUT[ck]=c; }
var FR='';   // current blink frame: '' open, 'h' half, 'c' closed
function apply(){ if(!ready||!U.imgs) return; ['boy','girl'].forEach(function(g){ [false,true].forEach(function(ne){
  var key=(g==='girl'?'girl_':'')+'head3q'+(ne?'_noear':''), c=bake(g,ST.face,ne,ST.eye,FR)||bake(g,ST.face,ne,ST.eye,''); if(c){ c._key=key; U.imgs[key]=c; } }); }); }
// blink: frame chosen from the clock right before each draw (pointer swap only; frames baked once per face+eye colour)
var BLINK=!/[?&]blink=off/.test(location.search), nextB=performance.now()+2500+Math.random()*2500;
function blinkFrame(t){ if(window.__REST_SLEEP) return 'c'; if(!BLINK) return ''; var d=t-nextB; if(d<0) return ''; if(d<60) return 'h'; if(d<150) return 'c'; if(d<210) return 'h'; nextB=t+2500+Math.random()*2500; return ''; }
var baseDraw=U.draw; U.draw=function(){ var f=blinkFrame(performance.now()); if(f!==FR){ FR=f; apply(); } return baseDraw.apply(this,arguments); };
U.blinkNow=function(){ nextB=performance.now(); };
U.setBlink=function(on){ BLINK=!!on; if(!BLINK&&FR){ FR=''; apply(); } };
// re-apply after PUPPET.load (it rebuilds imgs from PUPPET_PARTS) and after every look change
var baseLoad=U.load; if(baseLoad) U.load=function(){ return baseLoad.apply(this,arguments).then(function(r){ apply(); return r; }); };
['setOutfit','setGender','setLook','setHair','set3q'].forEach(function(f){ var b=U[f]; if(!b) return; U[f]=function(){ var r=b.apply(this,arguments); apply(); return r; }; });
U.setFace=function(f){ if(RAW['boy'+f]) ST.face=f; apply(); return ST.face; };
U.setEyeColor=function(id){ ST.eye=eyeOf(id).id; apply(); return ST.eye; };
var bg=U.getChar, bs=U.setChar;
U.getChar=function(){ var c=bg(); c.face=ST.face; c.eyeColor=ST.eye; return c; };
U.setChar=function(o){ o=o||{}; if(o.face&&RAW['boy'+o.face]) ST.face=o.face; if(o.eyeColor) ST.eye=eyeOf(o.eyeColor).id; var r=bs.apply(this,arguments); apply(); return U.getChar(); };
// ---- dressing room rows: หน้าตา (5 per gender, f1 default) + สีตา
var CSS='#pcc .fb{padding:0;width:64px;height:64px;overflow:hidden}#pcc .fb canvas{width:64px;height:64px;display:block}';
var baseOpen=U.openCreator;
U.openCreator=function(opts,onDone){ if(typeof opts==='function'){ onDone=opts; opts={}; } opts=opts||{};
  if(opts.char){ if(opts.char.face) ST.face=opts.char.face; if(opts.char.eyeColor) ST.eye=eyeOf(opts.char.eyeColor).id; } apply();
  var h=baseOpen(opts,function(r){ r.face=ST.face; r.eyeColor=ST.eye; if(onDone) onDone(r); });
  decorate(document.getElementById('pcc')); return h; };
function decorate(root){ if(!root||root.querySelector('[data-r=face]')) return;
  if(!document.getElementById('pcc-face-css')){ var st=document.createElement('style'); st.id='pcc-face-css'; st.textContent=CSS; document.head.appendChild(st); }
  var cRow=root.querySelector('[data-r=c]'), cSec=cRow&&(cRow.closest('.sec')||cRow.parentNode); if(!cSec) return;
  var fs=document.createElement('div'); fs.className='sec'; fs.innerHTML='<div class="lbl">หน้าตา</div><div class="row" data-r="face"></div>';
  var es=document.createElement('div'); es.className='sec'; es.innerHTML='<div class="lbl">สีตา</div><div class="row" data-r="eye"></div>';
  var hSec=root.querySelector('[data-r=h]'); hSec=hSec&&(hSec.closest('.sec')||hSec.parentNode);
  (hSec||cSec).parentNode.insertBefore(fs,hSec||cSec.nextSibling); cSec.parentNode.insertBefore(es,cSec.nextSibling);
  var fRow=fs.querySelector('.row'), eRow=es.querySelector('.row');
  function gender(){ return U.getChar().gender==='girl'?'girl':'boy'; }
  function thumb(cv,f){ var x=cv.getContext('2d'), g=gender(), im=bake(g,f,false,ST.eye,''); x.fillStyle='#4a3428'; x.fillRect(0,0,cv.width,cv.height); if(!im) return;
    var sw=im.width*0.62, sx=im.width*0.04, sy=im.height*0.30; x.drawImage(im,sx,sy,sw,sw,0,0,cv.width,cv.height); }
  function mark(){ fRow.querySelectorAll('[data-face]').forEach(function(b){ b.setAttribute('aria-pressed',b.getAttribute('data-face')===ST.face?'true':'false'); });
    eRow.querySelectorAll('[data-eye]').forEach(function(b){ b.setAttribute('aria-pressed',b.getAttribute('data-eye')===ST.eye?'true':'false'); }); }
  function buildFaces(){ fRow.innerHTML=''; var g=gender(); ['f1','f2','f3','f4','f5'].forEach(function(f,i){ var b=document.createElement('button'); b.className='fb'; b.setAttribute('data-face',f);
      b.setAttribute('aria-label','หน้าตา '+(U.FACE_NAMES[g][i]||i+1)); b.title=U.FACE_NAMES[g][i]||''; var c=document.createElement('canvas'); c.width=128; c.height=128; b.appendChild(c); fRow.appendChild(b); thumb(c,f);
      b.onclick=function(){ U.setFace(f); mark(); }; }); mark(); }
  U.EYE_COLORS.forEach(function(e){ var b=document.createElement('button'); b.className='sw'; b.setAttribute('data-eye',e.id); b.title=e.name; b.setAttribute('aria-label','สีตา '+e.name); b.style.background=e.c; eRow.appendChild(b);
    b.onclick=function(){ U.setEyeColor(e.id); buildFaces(); }; });
  root.querySelectorAll('[data-g]').forEach(function(b){ b.addEventListener('click',function(){ setTimeout(buildFaces,0); }); });
  if(!ready){ var t=setInterval(function(){ if(ready){ clearInterval(t); apply(); buildFaces(); } },100); }
  buildFaces(); }
apply(); decorate(document.getElementById('pcc'));   // creator already open (preview page opens it right after load)
})();

