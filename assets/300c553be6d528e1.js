
/* r218 AUTOSLOT218 (DeaRz 25 Nov 2026 00:51 BKK):
   (1) ?autoslot=off : Auto play uses ONLY the skills the player has installed in the skill slots, i.e. what the slot shows.
       Before: the auto brain cast the old class skills stored in P.slots (hidden under the weapon-skill icons) and never pressed the weapon skills shown in the slots.
       Now: a slot that shows a weapon skill is pressed like a tap on that slot (same code path as the player's finger); a slot that shows an old skill keeps the old auto rule;
       an old skill hidden under a weapon-skill / item icon is no longer cast. Item slots (hotkey items) are never used by Auto.
   (2) ?autoring=off : farming ring. Settings (SET) gets "ระยะฟาร์มของ Auto". Ring centre = where Auto was switched on (re-centred on a map change). Auto only picks monsters inside the ring
       (a monster within 180 px of the hero is always allowed = self defence), idles inside the ring, and the ring is drawn on the ground while Auto is on.
       Slider at the far right = "ทั้งแมพ" (no ring, the old behaviour) = default. Quest auto-walk / guide walk ignore the ring. Saved in localStorage lanternfall_autoring218. */
(function(){'use strict';
const Q=String(location.search),X=window.AUTOSLOT218={on:!/[?&]autoslot=off\b/.test(Q),ring:!/[?&]autoring=off\b/.test(Q),err:null,presses:0,last:null,R:0,MIN:300,MAX:1200,c:null,gap:.45,stats:{skipOut:0,wp:0}};
try{const v=+localStorage.getItem('lanternfall_autoring218');if(v>=X.MIN&&v<X.MAX)X.R=v}catch(_){}
const DS=['ws','bs','dgs','ss','scs','hmk','knk','h2s'];
const slotEl=i=>document.querySelector('#tSkills .tsk[data-ti="'+i+'"]')||document.querySelector('#bar .slot[data-i="'+i+'"]');
const els=i=>[document.querySelector('#bar .slot[data-i="'+i+'"]'),document.querySelector('#tSkills .tsk[data-ti="'+i+'"]')].filter(Boolean);
const wkey=el=>{if(!el||!el.classList.contains('wsk'))return null;for(const k of DS)if(el.dataset[k])return el.dataset[k];return null};
const isItem=el=>!!(el&&el.dataset&&el.dataset.hk);
function painted(i){for(const e of els(i))if(wkey(e)||isItem(e))return true;return false}
X.legacy=function(){try{if(!X.on||typeof P==='undefined'||!P||!P.slots)return P.slots;return P.slots.map((id,i)=>painted(i)?null:id)}catch(e){X.err='legacy '+e.message;return P.slots}};
function ready(el){if(el.classList.contains('wsoff')||el.classList.contains('nomp'))return false;const t=el.querySelector('.cdt');if(t&&t.textContent.trim())return false;
  const c=el.querySelector('.cd');if(c){const v=parseFloat(c.style.getPropertyValue('--cd'));if(v>0)return false}return true}
let lastT=-9,next=0,up=null;
function press(el){const r=el.getBoundingClientRect(),o={bubbles:true,cancelable:true,pointerId:218,pointerType:'touch',isPrimary:true,clientX:r.left+r.width/2,clientY:r.top+r.height/2,button:0,buttons:1};
  el.dispatchEvent(new PointerEvent('pointerdown',o));up=setTimeout(()=>{up=null;try{el.dispatchEvent(new PointerEvent('pointerup',Object.assign({},o,{buttons:0})))}catch(e){X.err='up '+e.message}},90)}
function slots(dt){if(!X.on||up||P.dead||P.casting||time-lastT<X.gap)return;const t=G.autoT;if(!t||t.dead)return;
  const W_=(typeof WEAPONS!=='undefined'&&P.weapon&&WEAPONS[P.weapon.t])||{},dT=Math.hypot(t.x-P.x,t.y-P.y);if(dT>Math.max(W_.range||0,130)+(t.sz||16)+40)return;
  const n=P.slots.length;for(let k=0;k<n;k++){const i=(next+k)%n;let el=null;for(const e of els(i))if(wkey(e)){el=e;break}if(!el||isItem(el)||!ready(el))continue;
    const vis=slotEl(i);press(vis&&wkey(vis)?vis:el);lastT=time;next=(i+1)%n;X.presses++;X.last=wkey(el);return}}
/* ---------------- ring ---------------- */
let wasAuto=false,zone0=null;
const special=()=>{try{if(window.__QUESTHUD&&__QUESTHUD.cur)return true}catch(_){}try{if(typeof GUIDE!=='undefined'&&GUIDE&&GUIDE.walk)return true}catch(_){}return false};
X.active=()=>X.ring&&X.R>0&&typeof G!=='undefined'&&!!G.auto&&!!X.c&&!special();
X.out=function(e){try{if(!X.active()||!e)return false;if(Math.hypot(e.x-P.x,e.y-P.y)<180)return false;const o=Math.hypot(e.x-X.c.x,e.y-X.c.y)>X.R;if(o)X.stats.skipOut++;return o}catch(_){return false}};
X.wp=function(){try{if(!X.active())return null;for(let k=0;k<14;k++){const a=Math.random()*6.283,r=X.R*(.15+.6*Math.random()),x=X.c.x+Math.cos(a)*r,y=X.c.y+Math.sin(a)*r;if(!blocked(x,y,(P.r||14)+4)){X.stats.wp++;return {x,y}}}return {x:X.c.x,y:X.c.y}}catch(_){return null}};
try{const _a=autoPlay;autoPlay=function(dt){
  try{const on=!!G.auto;if(on&&(!wasAuto||zone0!==G.zone||!X.c)){X.c={x:P.x,y:P.y};zone0=G.zone;G.autoWp=null}wasAuto=on;
    if(X.active()&&G.autoT&&X.out(G.autoT))G.autoT=null}catch(e){X.err='pre '+e.message}
  const v=_a.apply(this,arguments);try{if(G.auto&&G.state==='play')slots(dt)}catch(e){X.err='slots '+e.message}return v}}catch(e){X.err='hook '+e.message}
setInterval(()=>{try{if(typeof G!=='undefined'&&!G.auto)wasAuto=false}catch(_){}},400);
try{const ob=drawBeacons;drawBeacons=function(){try{if(X.active()&&typeof ctx!=='undefined'){const c=ctx;c.save();c.globalAlpha=.55;c.lineWidth=3;c.setLineDash([14,10]);c.lineDashOffset=-(time*18)%24;c.strokeStyle='#8dffc8';c.beginPath();c.arc(X.c.x,X.c.y,X.R,0,6.2832);c.stroke();
    c.setLineDash([]);c.globalAlpha=.07;c.fillStyle='#8dffc8';c.fill();c.restore()}}catch(e){X.err='draw '+e.message}return ob.apply(this,arguments)}}catch(e){X.err='hook draw '+e.message}
/* ---------------- settings row ---------------- */
const lab=v=>v>=X.MAX?'ทั้งแมพ (ไม่จำกัดวง)':Math.round(v)+' px';
const add=setInterval(()=>{try{const p=document.getElementById('camPanel');if(!p||document.getElementById('ar218'))return;if(!X.ring){clearInterval(add);return}
  const d=document.createElement('div');d.id='ar218';d.style.cssText='margin:8px 0 2px;padding:8px;border-radius:8px;border:1px solid rgba(141,255,200,.45);background:rgba(10,30,26,.5)';
  d.innerHTML='<div style="font-weight:700;margin-bottom:4px">∞ ระยะฟาร์มของ Auto: <span id="ar218v"></span></div><input type="range" id="ar218r" min="'+X.MIN+'" max="'+X.MAX+'" step="50" style="width:100%"><div style="font-size:11.5px;opacity:.8;margin-top:3px">Auto จะตีเฉพาะมอนสเตอร์ในวงรอบจุดที่กดเปิด Auto · เลื่อนขวาสุด = ทั้งแมพ</div>';
  const ref=document.getElementById('hudxSetBtn')||document.getElementById('benchBtn');if(ref&&ref.parentNode===p)p.insertBefore(d,ref);else p.appendChild(d);
  const r=d.querySelector('#ar218r'),v=d.querySelector('#ar218v');r.value=X.R||X.MAX;v.textContent=lab(+r.value);
  r.addEventListener('input',()=>{const n=+r.value;X.R=n>=X.MAX?0:n;v.textContent=lab(n);try{localStorage.setItem('lanternfall_autoring218',String(X.R))}catch(_){}});
  for(const ev of ['pointerdown','mousedown','touchstart'])d.addEventListener(ev,e=>e.stopPropagation());clearInterval(add)}catch(e){X.err='ui '+e.message}},700);
})();

