
/* LANTACC236 r236 (?lanternaccess=off): DeaRz 26 Nov 2026 09:36 BKK: who may go up to my sky house. At the planted house lantern the prompt
   ("F ขึ้นบ้าน · <house> | V เก็บตะเกียง") gets a third part "⚙ ตั้งค่า" (key O on PC, tap on touch) that opens "ใครขึ้นบ้านได้บ้าง":
   🔓 ทุกคน / 👥 เฉพาะเพื่อน / 🔒 เฉพาะเรา. Default = เฉพาะเรา (DeaRz 09:36:51 "เริ่มต้นให้ใช้ ขึ้นได้แค่เรา"); old saves without the field are เฉพาะเรา too.
   Saved with the house save (HOUSE.state().access = 'all'|'friends'|'owner', mirrored on HOUSE.state().lantern.access while planted; kept when the lantern is picked up
   and planted again). A small icon (🔓 / 👥 / 🔒) floats over the planted lantern.
   Taps inside this menu (and the r233 lantern card) no longer fall through to the house's tap-on-lantern handler (its ignore list gets #lt233,#la236).
   There is no online visiting yet, so the owner can always go up. HOUSE.canEnter(visitor) is the single check for the later online code:
   visitor null/undefined or visitor.owner / visitor.id === state.owner -> true; 'all' -> true; 'friends' -> !!visitor.friend; 'owner' -> false. */
(function(){'use strict';
const X=window.LANTACC236={on:!/[?&]lanternaccess=off\b/.test(String(location.search)),ver:'r236',opened:0,set:0,err:null};
if(!X.on)return;
const H=window.HOUSE;if(!H||!H.state){X.on=false;X.err='no HOUSE';return}
const OPT=[['all','🔓','ทุกคน','ใครก็ขึ้นบ้านเราได้'],['friends','👥','เฉพาะเพื่อน','เฉพาะคนในรายชื่อเพื่อน'],['owner','🔒','เฉพาะเรา','ล็อก · ขึ้นได้คนเดียว']];
const valid=v=>OPT.some(o=>o[0]===v);
X.get=function(){try{const S=H.state();if(!valid(S.access))S.access='owner';if(S.lantern&&S.lantern.access!==S.access)S.lantern.access=S.access;return S.access}catch(e){return 'owner'}};
X.setAccess=function(v){if(!valid(v))return false;try{const S=H.state();S.access=v;if(S.lantern)S.lantern.access=v;H.save();try{saveGame()}catch(_){}X.set++;return true}catch(e){X.err='set '+e.message;return false}};
X.icon=()=>(OPT.find(o=>o[0]===X.get())||OPT[2])[1];
H.canEnter=function(visitor){try{const S=H.state();if(!visitor||visitor.owner||(visitor.id&&visitor.id===S.owner))return true;const a=X.get();if(a==='all')return true;if(a==='friends')return !!visitor.friend;return false}catch(e){return !visitor}};
X.span=t=>'<span class="hpB" data-a="acc">'+(t?'':'<kbd>O</kbd>')+X.icon()+' ตั้งค่า</span>';
/* menu */
let box=null;
function ensure(){if(box)return box;const st=document.createElement('style');st.textContent='#la236{position:fixed;inset:0;z-index:9100;display:none;align-items:center;justify-content:center;background:rgba(5,8,16,.5);padding:16px}'
 +'#la236 .c{box-sizing:border-box;width:min(92vw,340px);background:linear-gradient(180deg,#2a2016,#17120c);border:1px solid #ffd98a;border-radius:14px;box-shadow:0 0 26px rgba(255,200,100,.3);color:#fff4dc;padding:14px 16px;font:14px/1.45 "Noto Sans Thai",system-ui,sans-serif}'
 +'#la236 h3{margin:0 0 8px;font-size:16px;color:#ffd98a}#la236 button.o{display:flex;width:100%;align-items:center;gap:10px;text-align:left;margin:0 0 6px;padding:9px 10px;border-radius:10px;border:1px solid #6a5230;background:#241b12;color:#fff4dc;cursor:pointer;font:inherit;touch-action:manipulation}'
 +'#la236 button.o.on{border-color:#ffd98a;background:#4a3618;box-shadow:inset 0 0 0 1px #ffd98a}#la236 button.o i{font-style:normal;font-size:20px;width:26px;text-align:center}#la236 button.o b{display:block}#la236 button.o small{color:#c9b892;font-size:12px}'
 +'#la236 .nt{font-size:12px;color:#bfae8c;margin:4px 0 10px}#la236 .x{display:block;margin:0 0 0 auto;min-width:72px;width:auto;flex:none;border-radius:999px;border:1px solid #ffd98a;background:#3a2c18;color:#fff4dc;padding:6px 16px;cursor:pointer;font:600 14px "Noto Sans Thai",system-ui,sans-serif}';
 document.head.appendChild(st);box=document.createElement('div');box.id='la236';document.body.appendChild(box);
 for(const ev of ['pointerdown','pointerup','mousedown','mouseup','click','dblclick','touchstart','touchend','wheel','contextmenu'])box.addEventListener(ev,e=>e.stopPropagation());
 box.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-v],[data-x]');if(!b){if(e.target===box)X.close();return}if(b.dataset.x){X.close();return}X.setAccess(b.dataset.v);render()});return box}
function render(){const a=X.get();box.innerHTML='<div class="c" role="dialog" aria-label="ใครขึ้นบ้านได้บ้าง"><h3>⚙ ใครขึ้นบ้านได้บ้าง</h3>'+OPT.map(o=>'<button type="button" class="o'+(o[0]===a?' on':'')+'" data-v="'+o[0]+'"><i>'+o[1]+'</i><span><b>'+o[2]+(o[0]===a?' ✔':'')+'</b><small>'+o[3]+'</small></span></button>').join('')
 +'<p class="nt">ตอนนี้ยังไม่มีระบบเยี่ยมบ้านออนไลน์ เจ้าของบ้านขึ้นได้เสมอ · ค่านี้จะใช้เมื่อเปิดให้คนอื่นมาเยี่ยม</p><button type="button" class="x" data-x="1">ปิด</button></div>'}
X.open=function(){try{ensure();render();box.style.display='flex';X.opened++;try{for(const k in keys)keys[k]=false}catch(_){}return true}catch(e){X.err='open '+e.message;return false}};
X.close=function(){if(box)box.style.display='none'};
/* key O while the lantern prompt is up (same early key hook the house uses for F / V) */
function keyH(e){try{const k=e.key;if(box&&box.style.display==='flex'&&k==='Escape'){X.close();e.stopImmediatePropagation();e.preventDefault();return true}
 if((k==='o'||k==='O')&&!e.repeat&&G.state==='play'&&!H.busy&&!G.win&&!G.interact&&H.nearLantern&&H.nearLantern()){e.stopImmediatePropagation();e.preventDefault();X.open();return true}}catch(er){X.err='key '+er.message}return false}
if(window.__EK)window.__EK.push(keyH);else addEventListener('keydown',e=>{keyH(e)},true);
/* icon over the planted lantern: drawn in the top overlay pass (same hook the house uses for its placement ghost) so trees / roofs in front never hide it */
try{const _o=drawEditorOverlay;drawEditorOverlay=function(){const r=_o.apply(this,arguments);try{const S=H.state(),L=S.lantern;if(L&&L.zone===G.zone&&!H.roomOn&&G.state==='play'&&!H.place){const c=ctx,t=time||0;let tw=0;try{c.save();c.font='700 13px system-ui,sans-serif';tw=c.measureText(H.houseName()).width;c.restore()}catch(_){}const x=L.x+8-tw/2-16,yy=L.y-112;   /* left of the lantern's name tag (tag: centre x+8, baseline y-108, 13 px) */
  c.save();c.globalAlpha=1;c.font='15px "Noto Color Emoji","Segoe UI Emoji",sans-serif';c.textAlign='center';c.textBaseline='middle';
  c.fillStyle='rgba(20,15,8,.8)';c.strokeStyle='rgba(255,217,138,.85)';c.lineWidth=1.3;c.beginPath();c.arc(x,yy,12,0,6.2832);c.fill();c.stroke();c.fillStyle='#fff';c.fillText(X.icon(),x,yy+1);c.restore();X.iconDraws=(X.iconDraws||0)+1}}catch(_){}return r}}catch(e){X.err='overlay '+e.message}X.get();
})();
