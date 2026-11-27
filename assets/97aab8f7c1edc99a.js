

/* ---- SOULBOOK245 (TEST r245): approved capture-book art (Art pack book_r1/pack_r1, design 3).
   Bag icon = soulBook_64; open book floats beside the hero while aiming and during the chain (rune + glow are code);
   the sealed prize that flies back is the closed book (was the cage picture). Off: ?soulbookart=off ---- */
(function(){'use strict';
const X=window.SOULBOOK245={ver:'soulbook-r245',on:!/[?&]soulbookart=off\b/.test(String(location.search)),err:null,n:{icon:0,open:0,fly:0}};
if(!X.on)return;
const SRC={icon:'assets/4ae0aa8b18dbbad1.png',fly:'assets/ffd3727b3b8908a9.png',l:'assets/1d9edaf8f2107341.png',r:'assets/a758341663b720ac.png'};
const IM={};for(const k in SRC){const i=new Image();i.src=SRC[k];IM[k]=i}
const ok=i=>i&&i.complete&&i.naturalWidth>0;
const HPf=()=>window.__HELPER;
const now=()=>performance.now()/1000;
/* bag icon */
function icon(g){try{if(ok(IM.icon)){g.drawImage(IM.icon,0,0,64,64);X.n.icon++;return}}catch(e){X.err=e.message}try{if(X._old)X._old(g)}catch(_){}}
function hookIcon(){try{if(typeof ITEMS==='undefined'||!ITEMS.soulBook)return false;const it=ITEMS.soulBook;const d=Object.getOwnPropertyDescriptor(it,'icon');if(d&&d.get)return true;X._old=it.icon;Object.defineProperty(it,'icon',{configurable:true,enumerable:true,get(){return icon},set(v){if(v!==icon)X._old=v}});return true}catch(e){X.err='icon: '+e.message;return false}}
{let n=0;const iv=setInterval(()=>{if(hookIcon()||++n>120)clearInterval(iv)},500);hookIcon()}
/* open book beside the hero */
let show=0,last=0;
function drawOpen(c){const HP=HPf();if(!HP||!HP.on)return;const t=now(),dt=Math.min(.1,t-last||0);last=t;let st=null;try{st=HP.chSt?HP.chSt():null}catch(_){}
 let want=false;try{want=!!((HP.aim&&G.state==='play'&&!P.dead&&!G.win)||(st&&st!=='break'))}catch(_){}
 show+=((want?1:0)-show)*Math.min(1,dt*9);if(show<.02)return;
 const a=P.face||0,left=Math.cos(a)<0,im=left?IM.l:IM.r;if(!ok(im))return;
 const w=left?62:64,h=49,bx=P.x+(left?-36:36),by=P.y-36+Math.sin(t*2.6)*2.5-(1-show)*8;
 c.save();c.globalAlpha=show;
 /* soft glow behind */
 c.save();c.globalCompositeOperation='lighter';const gr=c.createRadialGradient(bx,by,2,bx,by,34);gr.addColorStop(0,'rgba(150,120,255,.38)');gr.addColorStop(1,'rgba(150,120,255,0)');c.fillStyle=gr;c.beginPath();c.arc(bx,by,34,0,6.2832);c.fill();c.restore();
 const s=.72;c.drawImage(im,bx-w*s/2,by-h*s/2,w*s,h*s);
 /* rune over the pages (code): turning ring + flame mark, stronger while the chain works */
 const pw=st&&st!=='fire'?1:.55,pu=.65+.35*Math.sin(t*5);c.save();c.globalCompositeOperation='lighter';c.translate(bx,by-3);c.scale(1,.55);c.rotate(t*1.4);c.strokeStyle='rgba(170,225,255,'+(pw*pu).toFixed(3)+')';c.shadowColor='#8fd0ff';c.shadowBlur=8;c.lineWidth=2;c.beginPath();c.arc(0,0,11,0,6.2832);c.stroke();c.beginPath();for(let i=0;i<3;i++){const q=i*2.0944;c.moveTo(Math.cos(q)*11,Math.sin(q)*11);c.lineTo(Math.cos(q+2.0944)*11,Math.sin(q+2.0944)*11)}c.stroke();c.restore();
 c.restore();X.n.open++}
function hookDraw(){try{if(typeof drawEditorOverlay!=='function')return false;const _o=drawEditorOverlay;drawEditorOverlay=function(){const r=_o.apply(this,arguments);try{drawOpen(ctx)}catch(e){X.err='open: '+e.message}return r};return true}catch(e){X.err='hook: '+e.message;return false}}
hookDraw();
/* the prize flying back = closed book (replaces the cage picture during the pull only) */
function hookFly(){try{const HP=HPf();if(!HP||!HP.frames||!HP.frames.cageDraw)return false;if(HP.frames._sb245)return true;const _c=HP.frames.cageDraw;HP.frames.cageDraw=function(g,x,y,k,part){let st=null;try{st=HP.chSt?HP.chSt():null}catch(_){}
  if(st==='pull'&&part==null&&ok(IM.fly)){try{const t=now(),s=(k||1)*1.0;g.save();g.translate(x,y-10);g.save();g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(0,0,2,0,0,40*s);gr.addColorStop(0,'rgba(170,140,255,.55)');gr.addColorStop(1,'rgba(170,140,255,0)');g.fillStyle=gr;g.beginPath();g.arc(0,0,40*s,0,6.2832);g.fill();g.restore();g.rotate(Math.sin(t*9)*.35);g.drawImage(IM.fly,-32*s,-32*s,64*s,64*s);g.restore();X.n.fly++;return}catch(e){X.err='fly: '+e.message}}
  return _c.apply(this,arguments)};HP.frames._sb245=1;return true}catch(e){X.err='flyhook: '+e.message;return false}}
{let n=0;const iv=setInterval(()=>{if(hookFly()||++n>120)clearInterval(iv)},500);hookFly()}
})();

