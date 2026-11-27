
/* ---- puppet_creator_pack_r11 dressroom_h27.js ---- */
// Lanternfall character creation = DRESSING ROOM (DeaRz 9 Nov 23:58): hero stands in the middle of a real room
// (wardrobe, mirror, rug, vanity table); option list on the right. Replaces PUPPET.openCreator. Load AFTER race_h26.js.
// Room art: window.PUPPET_ROOM_BG (data URL / src of the QA-passed Art background). Until it exists a drawn stand-in room is used.
(function(){
var U=window.PUPPET;
var RICON={"human": "assets/6031adbc3491370b.webp", "demon": "assets/944fb41a5babfb85.webp", "elf": "assets/06e9210d1d115f54.webp", "cat": "assets/3b4093db59d3d766.webp"};
// race info (lore = Story RACE_LORE_draft_v1 sec 1, short; bonus = RACE_SYSTEM_v1 / Balance race_r1: given once at creation)
var RINFO={human:{name:'มนุษย์',bonus:{},note:'',lore:'มาจากที่ราบลุ่มแม่น้ำและเมืองท่าทางตะวันออก เป็นเผ่าที่มีมากที่สุด ค้าขายเก่ง สร้างเมืองใหญ่อย่าง Astoria ร่วมกับเอลฟ์ ปรับตัวได้ทุกทาง'},
 demon:{name:'ปีศาจ',bonus:{STR:2,VIT:2},note:'โบนัสเผ่า STR +2, VIT +2',lore:'มาจากหุบผาและเหมืองทางใต้ เป็นช่างแร่ ช่างไฟ และนักรบภูเขา เขาเล็กกับหางเป็นเรื่องปกติของเผ่า ชื่อ "ปีศาจ" มาจากคนเมืองที่กลัวรูปร่าง ไม่ใช่นิสัย'},
 elf:{name:'เอลฟ์',bonus:{INT:2,DEX:2},note:'โบนัสเผ่า INT +2, DEX +2',lore:'มาจากเมืองริมทะเลสาบและป่าศาลทางตะวันตก อายุยืน จำเพลงและตำนานเก่าได้มากที่สุด เป็นผู้เฝ้าบันทึก นักเวท และนักธนู'},
 cat:{name:'มนุษย์แมว',bonus:{AGI:2,LUK:2},note:'โบนัสเผ่า AGI +2, LUK +2',lore:'เผ่ามิวไม่มีบ้านเกิดถาวร เร่ร่อนตามชายฝั่ง เกาะ และเส้นทางค้า เป็นคนส่งของ พ่อค้าเร่ และนักสำรวจ ลายหูกับหางต่างกันตามครอบครัว ว่องไวและโชคดี'}};

var CSS='#pcc{position:fixed;inset:0;z-index:99999;background:#140f0c;color:#f6efe2;font:15px/1.35 "Sarabun",system-ui,sans-serif;display:flex;-webkit-user-select:none;user-select:none;overflow:hidden}'+
 '#pcc .stage{position:absolute;inset:0}#pcc .stage canvas{position:absolute;inset:0;width:100%;height:100%;display:block}'+
 '#pcc .side{position:absolute;top:8px;right:8px;bottom:8px;width:min(36vw,380px);display:flex;flex-direction:column;background:rgba(30,20,14,.80);border:1px solid rgba(255,211,107,.35);border-radius:14px;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}'+
 '#pcc .side h2{margin:0;padding:12px 16px 8px;font:600 19px "Mitr","Sarabun",sans-serif;color:#ffd99a;letter-spacing:.3px}'+
 '#pcc .list{flex:1;overflow:auto;padding:0 12px 8px;-webkit-overflow-scrolling:touch}'+
 '#pcc .sec{margin:6px 0 12px}#pcc .sec>.lbl{font-weight:600;font-size:13px;color:#e9cf9f;margin:2px 4px 6px}'+
 '#pcc .row{display:flex;flex-wrap:wrap;gap:6px}'+
 '#pcc button{min-width:44px;min-height:44px;border-radius:10px;border:2px solid #5b4430;background:#33261d;color:#f6efe2;font:inherit;padding:4px 10px;cursor:pointer}'+
 '#pcc button[aria-pressed=true]{border-color:#ffd36b;background:#4a3624;box-shadow:0 0 0 1px #ffd36b inset}'+
 '#pcc button:focus-visible{outline:2px solid #ffd36b;outline-offset:2px}'+
 '#pcc .sw{width:40px;height:40px;min-width:40px;min-height:40px;padding:0;border-radius:50%}'+
 '#pcc .hb{padding:0;width:62px;height:62px;overflow:hidden}#pcc .hb canvas{width:62px;height:62px;display:block}'+
 '#pcc input{min-height:42px;border-radius:10px;border:2px solid #5b4430;background:#120d0a;color:#fff;font:inherit;padding:0 12px;width:100%;box-sizing:border-box}'+
 '#pcc .foot{padding:10px 12px 12px;border-top:1px solid #5b443088}#pcc .note{font-size:12px;opacity:.8;margin:0 0 8px}'+
 '#pcc .ok{width:100%;background:#c9892b;border-color:#ffd36b;font-weight:700;font-size:17px}'+
 '#pcc .tap{position:absolute;left:0;right:min(36vw,380px);bottom:10px;text-align:center;font-size:12px;opacity:.75;pointer-events:none}'+
 '#pcc .info{position:absolute;top:8px;left:8px;max-height:calc(100% - 16px);width:min(26vw,300px);overflow:auto;background:rgba(30,20,14,.62);border:1px solid rgba(255,211,107,.35);border-radius:14px;color:#fff6e6;padding:12px 14px;box-sizing:border-box;font:13px/1.5 "Sarabun",sans-serif;text-shadow:0 1px 2px #000;z-index:2}'+
 '#pcc .info .hd{display:flex;align-items:center;gap:10px}#pcc .info .hd img{width:52px;height:52px}#pcc .info h3{margin:0;font:600 18px "Mitr","Sarabun",sans-serif;color:#ffd99a}'+
 '#pcc .info .t{margin:10px 0 4px;color:#ffd36b;font-weight:600;font-size:12px;letter-spacing:.5px}#pcc .info p{margin:0;color:#fff6e6;opacity:1;background:rgba(18,10,6,.62);border-radius:8px;padding:6px 8px}#pcc .info td{color:#fff6e6;opacity:1;border:0;background:none}'+
 '#pcc .info table{width:100%;border-collapse:collapse}#pcc .info td{padding:2px 0}#pcc .info td.n{text-align:right;width:2.2em}#pcc .info td.b{color:#9be37a;text-align:right;width:2.6em}#pcc .info td.v{text-align:right;font-weight:700;width:2.2em}'+
 '#pcc .info .pm{min-width:30px;min-height:30px;padding:0 6px;margin-left:4px;font-size:15px}#pcc .info .pm:disabled{opacity:.35}#pcc .info .left{color:#ffd36b;font-size:12px;margin-top:4px}'+
 '@media (orientation:portrait){#pcc .info{width:calc(50vw - 18px);top:6px;left:6px;bottom:auto;max-height:46vh;padding:8px 10px;font-size:11px}#pcc .info .hd img{width:36px;height:36px}#pcc .info h3{font-size:15px}}'+
'#pcc .turn{position:absolute;transform:translateX(-50%);display:flex;gap:56px;z-index:3}#pcc .turn button{min-width:40px;min-height:40px;width:40px;height:40px;border-radius:50%;padding:0;font-size:16px;background:rgba(30,20,14,.75)}'+
'@media (orientation:portrait){#pcc .side{width:50vw;top:6px;right:6px;bottom:6px}#pcc .side h2{font-size:16px;padding:10px 10px 6px}#pcc .list{padding:0 8px 8px}#pcc button{padding:4px 8px;font-size:14px}#pcc .hb{width:54px;height:54px}#pcc .hb canvas{width:54px;height:54px}#pcc .sw{width:34px;height:34px;min-width:34px;min-height:34px}#pcc .tap{font-size:11px}}';
function hsl(h,s,l){ return 'hsl('+Math.round(h)+','+Math.round(s*100)+'%,'+Math.round(l*100)+'%)'; }
// ---------- stand-in room (until Art's background arrives) ----------
function drawRoom(x,W,H,T){
  var fy=H*0.64; // floor line
  var g=x.createLinearGradient(0,0,0,fy); g.addColorStop(0,'#5a3b2c'); g.addColorStop(1,'#7a5440'); x.fillStyle=g; x.fillRect(0,0,W,fy);
  x.fillStyle='rgba(255,230,190,.06)'; for(var i=0;i<W;i+=46) x.fillRect(i,0,18,fy); // wallpaper stripes
  x.fillStyle='#3e2a1f'; x.fillRect(0,fy-14,W,14); // skirting
  var f=x.createLinearGradient(0,fy,0,H); f.addColorStop(0,'#6b4630'); f.addColorStop(1,'#3c2619'); x.fillStyle=f; x.fillRect(0,fy,W,H-fy);
  x.strokeStyle='rgba(0,0,0,.18)'; x.lineWidth=2; for(var j=0;j<14;j++){ var px=W/2+(j-7)*W*0.16; x.beginPath(); x.moveTo(W/2+(j-7)*W*0.07,fy); x.lineTo(px,H); x.stroke(); }
  // window light
  x.fillStyle='rgba(255,236,190,.10)'; x.beginPath(); x.moveTo(W*0.06,0); x.lineTo(W*0.22,0); x.lineTo(W*0.42,fy); x.lineTo(W*0.18,fy); x.fill();
  // wardrobe (left)
  var wx=W*0.03,wy=fy*0.18,ww=W*0.22,wh=fy*0.84; x.fillStyle='#4a2e1e'; x.fillRect(wx,wy,ww,wh); x.fillStyle='#5e3b27'; x.fillRect(wx+8,wy+10,ww/2-12,wh-20); x.fillRect(wx+ww/2+4,wy+10,ww/2-12,wh-20);
  x.fillStyle='#d9b26a'; x.fillRect(wx+ww/2-10,wy+wh*0.5,5,18); x.fillRect(wx+ww/2+5,wy+wh*0.5,5,18); x.fillStyle='#3a2416'; x.fillRect(wx-6,wy-10,ww+12,12);
  // tall mirror (behind hero, right of centre)
  var mx=W*0.60,my=fy*0.10,mw=W*0.12,mh=fy*0.86; x.fillStyle='#c79a4a'; x.beginPath(); x.ellipse(mx+mw/2,my+mw/2,mw/2+6,mw/2+6,0,Math.PI,0); x.lineTo(mx+mw+6,my+mh); x.lineTo(mx-6,my+mh); x.fill();
  var mg=x.createLinearGradient(mx,my,mx+mw,my+mh); mg.addColorStop(0,'#b9d3e6'); mg.addColorStop(.5,'#7e9fb8'); mg.addColorStop(1,'#a8c4d8'); x.fillStyle=mg; x.beginPath(); x.ellipse(mx+mw/2,my+mw/2,mw/2,mw/2,0,Math.PI,0); x.lineTo(mx+mw,my+mh-6); x.lineTo(mx,my+mh-6); x.fill();
  x.fillStyle='rgba(255,255,255,.35)'; x.beginPath(); x.moveTo(mx+mw*0.2,my+mw*0.3); x.lineTo(mx+mw*0.35,my+mw*0.3); x.lineTo(mx+mw*0.15,my+mh*0.6); x.lineTo(mx+mw*0.05,my+mh*0.6); x.fill();
  // vanity table (right)
  var vx=W*0.78,vy=fy*0.58,vw=W*0.2; x.fillStyle='#d8c7a8'; x.beginPath(); x.ellipse(vx+vw/2,vy-fy*0.2,vw*0.32,fy*0.17,0,0,6.283); x.fill(); x.fillStyle='#9fb9cc'; x.beginPath(); x.ellipse(vx+vw/2,vy-fy*0.2,vw*0.27,fy*0.14,0,0,6.283); x.fill();
  x.fillStyle='#5a3825'; x.fillRect(vx,vy,vw,fy*0.12); x.fillRect(vx+6,vy+fy*0.12,10,fy*0.3); x.fillRect(vx+vw-16,vy+fy*0.12,10,fy*0.3);
  x.fillStyle='#e7a3b8'; x.fillRect(vx+vw*0.2,vy-12,10,12); x.fillStyle='#9ad0c0'; x.beginPath(); x.arc(vx+vw*0.7,vy-7,7,0,6.283); x.fill();
  // round rug (hero stands on it)
  var rx=(T&&T.gx)||W*0.4,ry=H*0.85; x.fillStyle='#7d2b35'; x.beginPath(); x.ellipse(rx,ry,W*0.2,H*0.075,0,0,6.283); x.fill(); x.strokeStyle='#e0b45c'; x.lineWidth=3; x.beginPath(); x.ellipse(rx,ry,W*0.17,H*0.06,0,0,6.283); x.stroke();
  x.strokeStyle='rgba(224,180,92,.5)'; x.lineWidth=1.5; x.beginPath(); x.ellipse(rx,ry,W*0.11,H*0.038,0,0,6.283); x.stroke();
  // warm vignette
  var v=x.createRadialGradient(W*0.42,H*0.6,H*0.2,W*0.42,H*0.6,W*0.75); v.addColorStop(0,'rgba(0,0,0,0)'); v.addColorStop(1,'rgba(0,0,0,.45)'); x.fillStyle=v; x.fillRect(0,0,W,H);
}
var BG=null; function bgImg(){ var s=window.PUPPET_ROOM_BG; if(!s) return null; if(!BG||BG._s!==s){ BG=new Image(); BG._s=s; BG.src=s; } return BG.complete&&BG.naturalWidth?BG:null; }
var RUG=[0.495,0.798]; // rug centre in the room picture (fraction)
function cover(x,im,W,H,gx){ var r=Math.max(W/im.naturalWidth,H/im.naturalHeight)*1.02,w=im.naturalWidth*r,h=im.naturalHeight*r; var ox=(gx==null?(W-w)/2:gx-RUG[0]*w); ox=Math.min(0,Math.max(W-w,ox)); var oy=(H-h)/2; x.drawImage(im,ox,oy,w,h); return {x:ox+RUG[0]*w,y:oy+RUG[1]*h,s:h,ox:ox,oy:oy,r:r}; }
// DeaRz 00:43: the bird on the sill and the tree outside the window move. Layers cut from the room picture (room_bg_r2.js).
var AN=null; window.PUPPET.__roomAN=function(){ return AN; }; function anim(){ var A=window.PUPPET_ROOM_ANIM; if(!A) return null; if(!AN){ AN={A:A,tree:new Image(),mask:new Image(),bird:new Image(),oc:document.createElement('canvas'),nextAct:2+Math.random()*2,act:null,actT:0,face:1};
  AN.tree.src=A.treeImg; AN.mask.src=A.maskImg; AN.bird.src=A.birdImg; AN.oc.width=A.tree[2]; AN.oc.height=A.tree[3]; }
  return (AN.tree.complete&&AN.mask.complete&&AN.bird.complete&&AN.tree.naturalWidth)?AN:null; }
function drawAnim(x,tr,T,dt){ var a=anim(); if(!a) return; var A=a.A, R=A.tree, o=a.oc, c=o.getContext('2d');
  // tree: soft wind sway, top moves more than the trunk, gusts now and then
  c.globalCompositeOperation='source-over'; c.clearRect(0,0,o.width,o.height);
  var gust=1+0.6*Math.max(0,Math.sin(T*0.37))*Math.max(0,Math.sin(T*0.11+1)), sl=3;
  for(var y=0;y<o.height;y+=sl){ var k=1-y/o.height*0.75, dx=(Math.sin(T*1.25+y*0.018)*7+Math.sin(T*2.3+y*0.05)*2.4)*k*gust, dy=Math.sin(T*1.1+y*0.03)*1.6*k;
    c.drawImage(a.tree,0,y,o.width,sl,dx,y+dy,o.width,sl); }
  c.globalCompositeOperation='destination-in'; c.drawImage(a.mask,0,0); c.globalCompositeOperation='source-over';
  x.drawImage(o,tr.ox+R[0]*tr.r,tr.oy+R[1]*tr.r,R[2]*tr.r,R[3]*tr.r);
  // bird: breathing, little hops, looks around (turns), pecks
  a.nextAct-=dt; if(!a.act&&a.nextAct<=0){ var q=Math.random(); a.act=q<0.4?'hop':q<0.7?'turn':'peck'; a.actT=0; }
  var hop=0,rot=0,sy=1+0.025*Math.sin(T*3.2),sx=1/sy*1.0;
  if(a.act){ a.actT+=dt; var u=a.actT;
    if(a.act==='hop'){ var d=0.42; hop=u<d?Math.sin(u/d*Math.PI)*9:0; if(u<0.08){ sy*=1-0.12*(u/0.08); } if(u>=d+0.1) a.act=null; }
    else if(a.act==='turn'){ if(u<0.05) a.face=-a.face; if(u>1.6+Math.random()*0.02){ a.face=1; a.act=null; } }
    else if(a.act==='peck'){ rot=-0.28*Math.max(0,Math.sin(Math.min(1,u/0.5)*Math.PI*2)); if(u>0.5) a.act=null; }
    if(!a.act) a.nextAct=2+Math.random()*3.5; }
  var bw=a.bird.naturalWidth, bh=a.bird.naturalHeight, fx=A.feet[0], fy=A.feet[1];
  var sx0=tr.ox+fx*tr.r, sy0=tr.oy+fy*tr.r;
  x.save(); x.fillStyle='rgba(120,60,20,'+(0.22-hop*0.012)+')'; x.beginPath(); x.ellipse(sx0,sy0-2*tr.r,46*tr.r*(1-hop*0.02),7*tr.r,0,0,6.3); x.fill();
  x.translate(sx0,sy0-hop*tr.r); x.rotate(rot*a.face); x.scale(tr.r*sx*a.face,tr.r*sy); x.drawImage(a.bird,A.bird[0]-fx,A.bird[1]-fy,bw,bh); x.restore(); }

U.openCreator=function(opts,onDone){ if(typeof opts==='function'){ onDone=opts; opts={}; } opts=opts||{};
  var old=document.getElementById('pcc'); if(old) old.remove();
  if(!document.getElementById('pcc-css2')){ var st=document.createElement('style'); st.id='pcc-css2'; st.textContent=CSS; document.head.appendChild(st); }
  var swayWas=U.cfg.SWAY; U.setChar(opts.char||U.getChar()); if(U.setSway) U.setSway(true); if(opts.bare&&U.setWeapon){ try{ U.setWeapon('none'); }catch(e){} }
  var root=document.createElement('div'); root.id='pcc'; root.setAttribute('role','dialog'); root.setAttribute('aria-label','ห้องแต่งตัว สร้างตัวละคร');
  root.innerHTML='<div class="stage"><canvas></canvas><div class="tap">แตะตัวละครเพื่อดูท่าเดิน/วิ่ง</div></div>'+
    '<div class="info" aria-live="polite"></div><div class="side"><h2>ห้องแต่งตัว</h2><div class="list">'+
    '<div class="sec"><div class="lbl">เผ่า</div><div class="row" data-r="race"></div></div>'+
    '<div class="sec"><div class="lbl">เพศ</div><div class="row" data-r="g"><button data-g="boy">ชาย</button><button data-g="girl">หญิง</button></div></div>'+
    '<div class="sec"><div class="lbl">ทรงผม</div><div class="row" data-r="h"></div></div>'+
    '<div class="sec"><div class="lbl">สีผม</div><div class="row" data-r="c"></div></div>'+
    '<div class="sec" data-s="k"><div class="lbl">ลายหูและหางแมว</div><div class="row" data-r="k"></div></div>'+
    (opts.askName===false?'':'<div class="sec"><div class="lbl">ชื่อ</div><input maxlength="12" placeholder="ชื่อตัวละคร" aria-label="ชื่อตัวละคร" value="'+String(opts.name||'').replace(/[<>"&]/g,'')+'"></div>')+
    '</div><div class="foot"><p class="note">ชุดและผ้าคลุมซื้อได้ในร้านค้า</p><button class="ok">'+(opts.okText||'เริ่มผจญภัย')+'</button></div></div>';
  document.body.appendChild(root);
  var cv=root.querySelector('.stage canvas'), cx=cv.getContext('2d'), alive=true, last=performance.now(), anim='idle', animT=0, T=0;
  function q(s){ return root.querySelector(s); } function qa(s){ return root.querySelectorAll(s); }
  function press(sel,attr,val){ qa(sel).forEach(function(b){ b.setAttribute('aria-pressed',b.getAttribute(attr)===val?'true':'false'); }); }
  function mark(){ var c=U.getChar(); press('[data-race]','data-race',c.race||'human'); press('[data-g]','data-g',c.gender); press('[data-h]','data-h',c.hair); press('[data-c]','data-c',c.hairColor); press('[data-k]','data-k',c.catColor);
    q('[data-s=k]').hidden=(c.race!=='cat'); }
  function renderInfo(){ var c=U.getChar(), id=c.race||'human', R=RINFO[id]||RINFO.human, el=q('.info'), ST=['STR','AGI','VIT','INT','DEX','LUK'];
    var bon={}; ST.forEach(function(k){ bon[k]=(R.bonus[k]||0)+(id==='human'?(FREE[k]||0):0); }); var used=0; ST.forEach(function(k){ used+=FREE[k]||0; });
    el.innerHTML='<div class="hd"><img alt="" src="'+(RICON[id]||'')+'"><h3>เผ่า'+R.name+'</h3></div><div class="t">ความเป็นมา</div><p>'+R.lore+'</p><div class="t">ค่าสเตตัสเริ่มต้น</div><table>'+
      ST.map(function(k){ return '<tr><td>'+k+'</td><td class="n">5</td><td class="b">'+(bon[k]?'+'+bon[k]:'')+'</td><td class="v">'+(5+bon[k])+'</td>'+(id==='human'?'<td style="text-align:right;white-space:nowrap"><button class="pm" data-m="'+k+'" aria-label="ลด '+k+'">−</button><button class="pm" data-p="'+k+'" aria-label="เพิ่ม '+k+'">+</button></td>':'')+'</tr>'; }).join('')+'</table>'+
      (id==='human'?'<div class="left">แต้มอิสระเหลือ '+(4-used)+' / 4 (ใส่ได้ไม่เกิน +2 ต่อค่า)</div>':'<div class="left">'+R.note+'</div>');
    el.querySelectorAll('[data-p]').forEach(function(b){ var k=b.getAttribute('data-p'); b.disabled=used>=4||(FREE[k]||0)>=2; b.onclick=function(){ FREE[k]=(FREE[k]||0)+1; renderInfo(); }; });
    el.querySelectorAll('[data-m]').forEach(function(b){ var k=b.getAttribute('data-m'); b.disabled=!(FREE[k]>0); b.onclick=function(){ FREE[k]--; renderInfo(); }; }); }
  var FREE=Object.assign({},(opts.char&&opts.char.freePts)||{});
  (U.RACES||[{id:'human',name:'มนุษย์'}]).forEach(function(r){ var b=document.createElement('button'); b.setAttribute('data-race',r.id); b.textContent=r.name; q('[data-r=race]').appendChild(b);
    b.onclick=function(){ if(U.setRace) U.setRace(r.id); buildHair(); mark(); renderInfo(); }; });
  (U.CAT_COLORS||[]).forEach(function(k){ var b=document.createElement('button'); b.className='sw'; b.setAttribute('data-k',k.id); b.title=k.name; b.setAttribute('aria-label','ลาย '+k.name); b.style.background=k.c; q('[data-r=k]').appendChild(b);
    b.onclick=function(){ U.setRace(null,{cat:k.id}); buildHair(); mark(); }; });
  U.HAIR_COLORS.forEach(function(c){ var b=document.createElement('button'); b.className='sw'; b.setAttribute('data-c',c.id); b.title=c.name; b.setAttribute('aria-label','สีผม '+c.name);
    if(c.id==='natural'){ b.textContent='เดิม'; b.style.fontSize='12px'; } else b.style.background=hsl(c.h,c.s,c.l); q('[data-r=c]').appendChild(b);
    b.onclick=function(){ U.setHairColor(c.id); buildHair(); mark(); }; });
  qa('[data-g]').forEach(function(b){ b.onclick=function(){ U.setChar({gender:b.getAttribute('data-g')}); buildHair(); mark(); }; });
  function thumb(c,hair){ var x=c.getContext('2d'); x.clearRect(0,0,c.width,c.height); x.fillStyle='#4a3428'; x.fillRect(0,0,c.width,c.height); var keep=U.getChar(); U.setChar({hair:hair}); var p=U.pose('idle',0,{}); U.draw(x,c.width/2,c.height*1.55,0.30,-1,p); U.setChar(keep); }
  function buildHair(){ var row=q('[data-r=h]'); row.innerHTML=''; var sway=U.cfg.SWAY; U.cfg.SWAY=false;
    U.HAIRS_BY_GENDER[U.getChar().gender].forEach(function(h,i){ var b=document.createElement('button'); b.className='hb'; b.setAttribute('data-h',h); b.setAttribute('aria-label','ทรงผม '+(i+1)); var c=document.createElement('canvas'); c.width=124; c.height=124; b.appendChild(c); row.appendChild(b); thumb(c,h);
      b.onclick=function(){ U.setChar({hair:h}); anim='idle'; mark(); }; });
    U.cfg.SWAY=sway; }
  cv.onclick=function(){ anim=anim==='idle'?'walk':anim==='walk'?'run':'idle'; animT=0; };
  q('.ok').onclick=function(){ var inp=q('input'); var r=U.getChar(); r.name=inp?inp.value.trim():''; var RB=(RINFO[r.race||'human']||RINFO.human).bonus, B={}; ['STR','AGI','VIT','INT','DEX','LUK'].forEach(function(k){ var v=(RB[k]||0)+((r.race||'human')==='human'?(FREE[k]||0):0); if(v) B[k]=v; }); r.raceBonus=B; r.freePts=(r.race||'human')==='human'?Object.assign({},FREE):{}; close(); if(onDone) onDone(r); };
  function close(){ alive=false; root.remove(); if(U.setSway) U.setSway(swayWas); if(opts.bare&&U.setWeapon){ U.__bareW=0; try{ U.setWeapon('sword'); }catch(e){} } }
  function size(){ var r=cv.getBoundingClientRect(), d=Math.min(2,window.devicePixelRatio||1), w=Math.max(1,Math.round(r.width*d)), h=Math.max(1,Math.round(r.height*d)); if(cv.width!==w||cv.height!==h){ cv.width=w; cv.height=h; } }
  function frame(now){ if(!alive) return; var dt=Math.min(0.05,(now-last)/1000); last=now; T+=dt; animT+=dt; size(); var W=cv.width,H=cv.height;
    var pw=root.querySelector('.side').getBoundingClientRect().width*(W/cv.getBoundingClientRect().width), ib=root.querySelector('.info').getBoundingClientRect(), lw=(innerHeight>innerWidth||ib.left>=root.querySelector('.side').getBoundingClientRect().left-4)?0:ib.right*(W/cv.getBoundingClientRect().width), free=Math.max(W*0.3,W-pw-lw), gx=lw+free*0.5, gy=H*0.86, sc=Math.min(H/1500,free/620);
    var im=bgImg(); if(im){ var rg=cover(cx,im,W,H,gx); drawAnim(cx,rg,T,dt); gx=rg.x; gy=rg.y; } else drawRoom(cx,W,H,{gx:gx});
    var shr=140*sc*1.3, shg=cx.createRadialGradient(gx,gy,0,gx,gy,shr); shg.addColorStop(0,'rgba(40,24,10,.42)'); shg.addColorStop(1,'rgba(40,24,10,0)'); cx.save(); cx.translate(gx,gy); cx.scale(1,.2); cx.translate(-gx,-gy); cx.fillStyle=shg; cx.beginPath(); cx.arc(gx,gy,shr,0,6.3); cx.fill(); cx.restore();
    if(opts.bare&&U.setWeapon){ if(U.__bareW!==1){ try{ U.setWeapon('none'); }catch(e){} U.__bareW=1; } U.slots.sword='_none'; } var p=U.pose(anim,animT,{dur:0.5}); if(opts.bare) U.slots.sword='_none'; U.draw(cx,gx-feetDX(FACE)*sc*1.1,gy,sc*1.1,FACE,p); placeTurn(gx,gy); requestAnimationFrame(frame); }
  var FDX={}; function feetDX(f){ if(FDX[f]!=null) return FDX[f]; try{ var c=document.createElement('canvas'); c.width=600; c.height=900; var x=c.getContext('2d'); U.draw(x,300,850,1,f,U.pose('idle',0,{}));
    var d=x.getImageData(0,600,600,300).data, lo=1e9, hi=-1, yb=-1; for(var y=299;y>=0&&yb<0;y--) for(var i=0;i<600;i++) if(d[(y*600+i)*4+3]>40){ yb=y; break; }
    if(yb<0) return (FDX[f]=0); for(var y2=Math.max(0,yb-30);y2<=yb;y2++) for(var i2=0;i2<600;i2++) if(d[(y2*600+i2)*4+3]>40){ if(i2<lo) lo=i2; if(i2>hi) hi=i2; }
    FDX[f]=(lo+hi)/2-300; }catch(e){ FDX[f]=0; } return FDX[f]; }
  var FACE=-1, turn=document.createElement('div'); turn.className='turn'; turn.innerHTML='<button data-f="-1" aria-label="หันซ้าย">◀</button><button data-f="1" aria-label="หันขวา">▶</button>'; root.querySelector('.stage').appendChild(turn);
  turn.querySelectorAll('button').forEach(function(b){ b.onclick=function(e){ e.stopPropagation(); FACE=+b.getAttribute('data-f'); pressTurn(); }; }); function pressTurn(){ turn.querySelectorAll('button').forEach(function(b){ b.setAttribute('aria-pressed',+b.getAttribute('data-f')===FACE?'true':'false'); }); } pressTurn();
  function placeTurn(gx,gy){ var k=cv.getBoundingClientRect().width/cv.width; turn.style.left=(gx*k)+'px'; turn.style.top=(gy*k+12)+'px'; } // DeaRz 07:51: feet (not the rig root) stand on the rug centre
  buildHair(); mark(); renderInfo(); requestAnimationFrame(frame); if(opts.onCancel){ var cb=document.createElement('button'); cb.className='cancelBtn'; cb.type='button'; cb.textContent='\u0e22\u0e01\u0e40\u0e25\u0e34\u0e01'; cb.style.cssText='background:transparent;color:#ffe9b0;border:1px solid rgba(255,211,107,.4);border-radius:10px;padding:6px 12px;margin-top:6px;font:13px system-ui,sans-serif;cursor:pointer;width:100%'; cb.onclick=function(){ close(); opts.onCancel(); }; var ft=root.querySelector('.foot'); if(ft) ft.appendChild(cb); }
  return {close:close}; };
})();

