
/* HELPERCARDS235 r235 (?helpercards=off): DeaRz 26 Nov 2026 09:34 BKK, screenshot of the helper manager "จัดการผู้ช่วย": "ทำให้โชว์ตัวม้อนเตอร์ที่เรามีเลยไม่ใช่โชว์แค่ชื่อ".
   Before (r181 helpermgr): every entry was a text row with the same small orb icon.
   Now every entry (ม้อนในกระเป๋า, ม้อนในกล่องบ้าน, ผู้ช่วยตอนนี้) shows the monster's REAL in-game look: the picture is drawn once per species by the game's own drawEnemy
   (same way the yard draws helpers: name plate / HP bar / glow halo stripped, approved Studio art allowed), on the main canvas between two frames, copied into a cached
   picture, then the canvas is put back (nothing visible changes). The picture bobs gently (CSS). Monsters that are mostly glow (wisps) are drawn again with their glow kept. Fallback = the old orb icon if a species cannot be drawn.
   Layout: bag / box entries are cards in a grid (picture, name, job / level / trait, the same "ให้เป็นผู้ช่วย" button); current helpers keep all their buttons with a bigger picture.
   Phone (width <= 640): one column, the whole panel scrolls. Empty lists stay as text. */
(function(){'use strict';
const X=window.HELPERCARDS235={on:!/[?&]helpercards=off\b/.test(String(location.search)),ver:'r235',made:0,fail:0,err:null,cache:{}};
if(!X.on)return;
const S=176;   // portrait size (px)
try{const st=document.createElement('style');st.textContent=
 '@keyframes hc235b{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}'
+'#hpMgr img.pt235{width:72px;height:72px;flex:none;object-fit:contain;animation:hc235b 2.4s ease-in-out infinite;filter:drop-shadow(0 2px 2px rgba(0,0,0,.5))}'
+'#hpMgr .pt235w{width:72px;height:72px;flex:none;border-radius:12px;background:radial-gradient(ellipse at 50% 70%,rgba(255,217,138,.18),rgba(0,0,0,0) 70%);display:flex;align-items:center;justify-content:center}'
+'#hpMgr .bd>.col:first-child{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));align-content:start;gap:6px}'
+'#hpMgr .bd>.col:first-child>h4,#hpMgr .bd>.col:first-child>.none{grid-column:1/-1}'
+'#hpMgr .bd>.col:first-child .rw{flex-direction:column;align-items:stretch;text-align:center;margin:0;padding:7px 6px}'
+'#hpMgr .bd>.col:first-child .rw .pt235w{margin:0 auto}#hpMgr .bd>.col:first-child .rw .nm b{white-space:normal}#hpMgr .bd>.col:first-child .rw button{width:100%}'
+'#hpMgr .hc .t .pt235w{width:80px;height:80px}#hpMgr .hc .t img.pt235{width:80px;height:80px}'
+'@media (max-width:640px){#hpMgr .pn{height:min(94vh,720px)}#hpMgr .bd{display:block;overflow:auto;-webkit-overflow-scrolling:touch}#hpMgr .col{overflow:visible;margin-bottom:10px}#hpMgr .bd>.col:first-child{grid-template-columns:repeat(auto-fill,minmax(104px,1fr))}}';
 document.head.appendChild(st)}catch(e){X.err='css '+e.message}
const keyOf=r=>String((r&&r.sp)||'');
/* draw one species with the game's drawEnemy into a cached picture (between frames, canvas restored) */
function make(r,glow){const sp=keyOf(r);if(!sp||(X.cache[sp]&&!glow))return;X.cache[sp]='…';
 setTimeout(()=>{const c=ctx,cv=c.canvas;let bak=null,en=null;const px=P.x,py=P.y,sv=[c.fillText,c.strokeText,c.fillRect,c.createLinearGradient,c.fill,c.drawImage],nop=function(){};
  const V=window.__VIS,vr=V?V.r:0;let R=null,sc0=null;
  try{if(!MOBS[sp]&&r.mob)MOBS[sp]=Object.assign({},r.mob);if(!MOBS[sp])throw new Error('no MOBS '+sp);
   const wx=(typeof cam!=='undefined'&&typeof VW!=='undefined')?cam.x+VW/2:P.x,wy=(typeof cam!=='undefined'&&typeof VH!=='undefined')?cam.y+VH/2:P.y;
   en=makeEnemy(sp,1,wx,wy);en.aggro=false;en.dead=false;en.hp=en.maxHp;en.hitT=0;en.flash=0;en.x=wx;en.y=wy;en.vx=en.vy=0;en.face=Math.PI*.05;en.st=en.st||{};
   try{const M=window.MON_SPRITES;R=M&&M.byType&&M.byType[sp];if(R&&R.data&&R.data.scope==='studio'){sc0=R.data.scope;R.data.scope='home'}else R=null}catch(_){R=null}
   const D=300,sz=Math.max(10,en.sz||20),k=Math.min(2.0,D*.2/sz);
   c.save();c.setTransform(1,0,0,1,0,0);bak=c.getImageData(0,0,D,D);c.clearRect(0,0,D,D);
   c.setTransform(k,0,0,k,D/2-en.x*k,D*.72-en.y*k);
   P.x=en.x+580;P.y=en.y;if(V)V.r=1e6;
   c.fillText=nop;c.strokeText=nop;c.fillRect=nop;c.createLinearGradient=function(){const g=sv[3].apply(this,arguments);g.addColorStop=nop;return g};c.fill=function(){if(this.fillStyle==='rgba(3, 6, 18, 0.8)')return;return sv[4].apply(this,arguments)};c.drawImage=function(im){if(!glow&&im&&im.tagName==='CANVAS'&&im.width===64&&im.height===64)return;return sv[5].apply(this,arguments)};
   try{drawEnemy(en)}finally{c.fillText=sv[0];c.strokeText=sv[1];c.fillRect=sv[2];c.createLinearGradient=sv[3];c.fill=sv[4];c.drawImage=sv[5];P.x=px;P.y=py;if(V)V.r=vr;if(R)R.data.scope=sc0}
   c.setTransform(1,0,0,1,0,0);const raw=c.getImageData(0,0,D,D).data;
   // bounding box of the drawn monster + how much of it is bright (a wisp drawn without its glow is only two dark eyes)
   let x0=D,y0=D,x1=-1,y1=-1,n=0,lit=0;for(let y=0;y<D;y+=2)for(let x=0;x<D;x+=2){const i=(y*D+x)*4,al=raw[i+3];if(al>24){n++;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;if(raw[i]+raw[i+1]+raw[i+2]>200&&al>90)lit++}}
   if((n<20||lit<25)&&!glow){c.putImageData(bak,0,0);bak=null;setTimeout(()=>make(r,true),0);return}   // mostly-glow monsters (wisps): draw again with their glow
   if(n<20)throw new Error('empty draw '+sp);
   const pad=6,bw=x1-x0+1+pad*2,bh=y1-y0+1+pad*2,side=Math.max(bw,bh),o=document.createElement('canvas');o.width=o.height=S;const g=o.getContext('2d');
   const sx=x0-pad-(side-bw)/2,sy=y0-pad-(side-bh);   // keep the feet at the bottom of the square
   g.imageSmoothingQuality='high';g.drawImage(cv,sx,sy,side,side,0,0,S,S);   X.cache[sp]=o.toDataURL('image/png');X.made++;
   for(const im of document.querySelectorAll('#hpMgr [data-pt235="'+sp+'"]')){im.outerHTML='<img class="pt235" src="'+X.cache[sp]+'" alt="">'}
  }catch(e){X.cache[sp]='x';X.fail++;X.err=e.message}
  finally{try{if(bak)c.putImageData(bak,0,0)}catch(_){}try{c.restore()}catch(_){}try{const F=window.MNFIX;if(F&&F.q&&en)F.q=F.q.filter(it=>it.e!==en)}catch(_){}}},0)}
X.ico=function(r){const sp=keyOf(r);if(!sp)return '';const v=X.cache[sp];
 if(v&&v!=='…'&&v!=='x')return '<span class="pt235w"><img class="pt235" src="'+v+'" alt=""></span>';
 if(v==='x')return '';           // old orb icon
 make(r);return '<span class="pt235w"><span data-pt235="'+sp+'"><canvas width="34" height="34" data-o="1"></canvas></span></span>'};
})();
