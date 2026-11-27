
/* ---- puppet_creator_pack_r11 roomtone_h29.js ---- */
// roomtone_h29 (Code 10 Nov 2026): colour-grade the dressing room (bg + window tree + bird) to match the game tone (DeaRz 06:53).
// window.PUPPET_ROOM_TONE = {b:brightness, c:contrast, s:saturation, w:warmth}; PUPPET.setRoomTone(t) re-bakes. ?tone=off = original art. ?toneui=1 shows sliders.
(function(){ var U=window.PUPPET; if(!U||U.__roomtone) return; U.__roomtone=1;
var RTP={light:{b:0.96,c:1.04,s:0.94,w:0.03,v:0.10},mid:{b:0.92,c:1.08,s:0.86,w:0.05,v:0.20},strong:{b:0.86,c:1.12,s:0.78,w:0.08,v:0.32},off:{b:0.88,c:1.12,s:1.25,w:-0.04},dm:{b:0.88,c:1.12,s:1.25,w:-0.04,v:0}}; var RTQ=(location.search.match(/[?&]roomtone=(light|mid|strong|off)/)||[])[1]||"dm"; var DEF=RTP[RTQ]; /* r16: ?roomtone=light|mid|strong (default mid); off = the r15 look; ?tone=off = the raw art */
var ORIG={bg:window.PUPPET_ROOM_BG, anim:window.PUPPET_ROOM_ANIM?JSON.parse(JSON.stringify(window.PUPPET_ROOM_ANIM)):null};
function load(src){ return new Promise(function(r){ var i=new Image(); i.onload=function(){r(i)}; i.onerror=function(){r(null)}; i.src=src; }); }
function grade(im,t,type,isBg){ var c=document.createElement('canvas'); c.width=im.naturalWidth; c.height=im.naturalHeight; var x=c.getContext('2d'); x.drawImage(im,0,0);
  var d=x.getImageData(0,0,c.width,c.height), p=d.data, B=t.b, C=t.c, S=t.s, Wr=1+t.w, Wb=1-t.w;
  for(var i=0;i<p.length;i+=4){ if(!p[i+3]) continue; var r=((p[i]/255-.5)*C+.5)*B, g=((p[i+1]/255-.5)*C+.5)*B, b=((p[i+2]/255-.5)*C+.5)*B, L=.299*r+.587*g+.114*b;
    p[i]=255*(L+(r-L)*S)*Wr; p[i+1]=255*(L+(g-L)*S); p[i+2]=255*(L+(b-L)*S)*Wb; }
  x.putImageData(d,0,0); if(isBg&&t.v){ var vg=x.createRadialGradient(c.width/2,c.height*0.56,c.width*0.22,c.width/2,c.height*0.56,c.width*0.78); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(34,20,8,'+t.v+')'); x.fillStyle=vg; x.fillRect(0,0,c.width,c.height); } return type==='png'?c.toDataURL('image/png'):c.toDataURL('image/jpeg',0.92); }
var busy=null;
function setRoomTone(t){ t=t||null; window.PUPPET_ROOM_TONE=t;
  var job=(async function(){ if(!t){ window.PUPPET_ROOM_BG=ORIG.bg; if(ORIG.anim) swapAnim(ORIG.anim.treeImg,ORIG.anim.birdImg); return; }
    var bg=await load(ORIG.bg); if(bg) window.PUPPET_ROOM_BG=grade(bg,t,'jpg',true);
    if(ORIG.anim){ var tr=await load(ORIG.anim.treeImg), bd=await load(ORIG.anim.birdImg); swapAnim(tr?grade(tr,t,'jpg'):ORIG.anim.treeImg, bd?grade(bd,t,'png'):ORIG.anim.birdImg); } })();
  busy=job; return job; }
function swapAnim(tree,bird){ var A=window.PUPPET_ROOM_ANIM; if(!A) return; A.treeImg=tree; A.birdImg=bird; var a=U.__roomAN&&U.__roomAN(); if(a){ a.tree.src=tree; a.bird.src=bird; } }
U.setRoomTone=setRoomTone; U.ROOM_TONE_DEFAULT=DEF;
var q=location.search; if(!/[?&]tone=off/.test(q)) setRoomTone(window.PUPPET_ROOM_TONE||DEF);
/* toneui removed in r19: the room tone is final */
function ui(){ if(document.getElementById('rtone')) return; var t=Object.assign({},window.PUPPET_ROOM_TONE||DEF), box=document.createElement('div'); box.id='rtone';
  box.style.cssText='position:fixed;left:6px;top:6px;z-index:99999;background:rgba(30,20,14,.85);color:#f3e6cf;font:11px sans-serif;padding:6px 8px;border-radius:10px;width:min(190px,44vw);box-sizing:border-box';
  var F=[['b','ความสว่าง',0.6,1.2],['c','ความคมชัด',0.8,1.4],['s','ความสดของสี',0.6,1.8],['w','อุ่น ↔ เย็น',-0.15,0.15],['v','Vignette',0,0.5]];
  box.innerHTML='<b id="rtt" style="cursor:pointer">🎨 โทนสีห้อง ▾</b><div id="rtv" style="opacity:.85;margin-top:2px;word-break:break-all"></div><div id="rtb" style="display:none">'+F.map(function(f){return '<div style="margin-top:6px">'+f[1]+'<input type=range min='+f[2]+' max='+f[3]+' step=0.01 data-k='+f[0]+' style="width:100%"></div>';}).join('')+
   '<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px"><button data-p=orig style="white-space:nowrap;font-size:11px">ภาพเดิม</button><button data-p=game style="white-space:nowrap;font-size:11px">เข้ากับเกม</button><button data-p=copy style="white-space:nowrap;font-size:11px">Copy values</button><button data-p=ref style="white-space:nowrap;font-size:11px">ภาพในเกม</button></div><img id="rtref" src="'+(window.ROOMTONE_REF||'')+'" style="display:none;width:100%;margin-top:6px;border-radius:6px"></div>';
  document.body.appendChild(box);
  function show(){ box.querySelectorAll('input').forEach(function(i){ i.value=(t[i.dataset.k]||0); }); box.querySelector('#rtv').textContent='b'+t.b.toFixed(2)+' c'+t.c.toFixed(2)+' s'+t.s.toFixed(2)+' w'+t.w.toFixed(2)+' v'+(t.v||0).toFixed(2); }
  var tm=null; function apply(){ clearTimeout(tm); tm=setTimeout(function(){ setRoomTone(Object.assign({},t)); },120); }
  box.addEventListener('input',function(e){ var k=e.target.dataset.k; if(!k) return; t[k]=+e.target.value; show(); apply(); });
  box.querySelector('#rtt').onclick=function(){ var b=box.querySelector('#rtb'), o=b.style.display==='none'; b.style.display=o?'block':'none'; this.textContent='🎨 โทนสีห้อง '+(o?'▴':'▾'); };
  box.addEventListener('click',function(e){ var p=e.target.dataset.p; if(!p) return; if(p==='copy'){ var cs=JSON.stringify({b:+t.b.toFixed(2),c:+t.c.toFixed(2),s:+t.s.toFixed(2),w:+t.w.toFixed(2),v:+(t.v||0).toFixed(2)}); try{ navigator.clipboard.writeText(cs); }catch(_){ try{ window.prompt('copy',cs); }catch(__){} } box.querySelector('#rtv').textContent=cs+' (copied)'; return; } if(p==='ref'){ var r=box.querySelector('#rtref'); r.style.display=r.style.display==='none'?'block':'none'; return; }
    t=p==='orig'?{b:1,c:1,s:1,w:0,v:0}:Object.assign({},DEF); show(); apply(); });
  show(); }
})();

