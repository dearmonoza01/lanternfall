
/* ---- r194 farmtap + seeduse (TEST ONLY). DeaRz 23 Nov 16:31 UTC: "หน้าแปลงผัก มีให้รดน้ำเก็บเกี่ยว ผมไม่ชอบแบบนี้เลยอ่ะ ให้กดคริกที่ไอค่อนหยดน้ำได้มั้ยและให้ตัวละครเดินไปรดน้ำเอง รวมถึงเก็บเกี่ยวด้วย หน้าขายผักเอาออกไปได้เลยไม่ควรอยู่หน้านี้ ให้เป็น NPC ขายผักในเมืองก็ได้"; 16:33: "ส่วนหว่านเมล็ด ให้เมล็ดสามารถกดใช้งานได้ พอกดใช้งานจัให้เลือกจุดวาง วางได้แค่ช่องที่ว่าง".
   farmtap: the plot panel (#farmPanel: water / harvest / shop buttons) is hidden. Tap the water drop (or the plant) of a dry spot -> the hero walks there by himself and waters it; tap a ripe spot (sparkle) -> walks and harvests. Tap a growing spot -> its info text + a small "ขุดออก" popup (confirm, then walk and dig). F near a spot does the same on the nearest spot. Seeds stay buyable at Emma's shop in town (farm tab); the 🛒 button of the plot panel is gone with the panel.
   seeduse: a "🌱 เมล็ด" button in the yard opens the farm seed list (HOUSE.state().farm.seeds); tap a seed -> planting mode: only EMPTY spots of the right plot kind glow (crop seeds = vegetable plot, saplings = tree plot); tap one -> the hero walks there and plants it. Mode stays while that seed lasts; ✕ or Esc ends it.
   Walking = the game's own movement steered through G.joy each frame (same path as the touch joystick, so collisions/speed are the game's); any player move input cancels the walk.
   ?farmtap=off = old plot panel, no tap-walk; ?seeduse=off = no seed button. */
(function(){'use strict';
const Q=String(location.search);
const R=window.FARM193=window.FARM194={ver:'farm194-r1',tap:!/[?&]farmtap=off\b/.test(Q),seed:!/[?&]seeduse=off\b/.test(Q),err:null,job:null,mode:null,stats:{tap:0,walk:0,arrive:0,water:0,harvest:0,plant:0,dig:0,cancel:0,fail:0,key:0}};
const ERR=(w,e)=>{R.err=w+': '+((e&&e.message)||e);try{console.error('[FARM193]',w,e)}catch(_){}};
const T2=m=>{try{toast(m,'#ffe9b0')}catch(_){}};
let H,F,B;
function ready(){H=window.HOUSE;F=H&&H.farm;B=H&&H.build;return !!(F&&F._plots&&F.plant&&B)}
const inYard=()=>{try{return G.state==='play'&&G.zone===H.ZID&&!B.on&&!H.roomOn&&typeof P!=='undefined'&&P&&!P.dead}catch(_){return false}};
const cropName=id=>{const c=F.cfg.trees[id]||F.cfg.crops[id];return c?c.name:id};
const isTree=id=>!!F.cfg.trees[id];
const seeds=()=>{try{const f=H.state().farm;return (f&&f.seeds)||{}}catch(_){return {}}};
const key=s=>s.o.uid+'#'+s.i;
const find=k=>{for(const s of F._plots())if(key(s)===k)return s;return null};
const markOff=s=>{const st=s.sp.stage|0;if(s.tree&&window.TMK203&&TMK203.on)return TMK203.off(s)-8;return s.tree&&st>=3?70:(st>=3?26:16)};
/* stand point: just in front of the plot's front edge, in line with the spot (so the hero does not stand on the soil and hide the plants); trees: in front of the trunk */
/* r200 (TEST): DeaRz 24 Nov 09:06 - the hero walks ONTO the clicked spot (inside the plot) to sow / water / harvest / dig, not to a point in front of the plot. ?farmstand=off = the r194 stand point. */
const standOld=s=>{try{if(!s.tree&&B.poly){const q=B.poly(s.d,s.o.x,s.o.y,s.o.f);let by=-1e9;for(const p of q)if(p[1]>by)by=p[1];if(by>s.y&&by-s.y<120)return [s.x,by+10]}}catch(_){}return [s.x,s.y+(s.tree?24:8)]};
const standOf=s=>/[?&]farmstand=off\b/.test(String(location.search))?standOld(s):[s.x,s.y];

/* ---------- walk + act ---------- */
let myJoy=null,lastIn=null;
function stopWalk(why){const j=R.job;R.job=null;try{if(G.joy&&G.joy===myJoy)G.joy=null}catch(_){}myJoy=null;if(lastIn!=null){try{G.lastInput=lastIn}catch(_){}lastIn=null}if(why&&j){R.stats.cancel++}}
function playerInput(){try{for(const k of ['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'])if(keys[k])return true;if(typeof TOUCH!=='undefined'&&TOUCH&&TOUCH.joy)return true;if(G.touch&&G.touch.move)return true}catch(_){}return false}
function walkTo(s,act,arg){const st=(act==='water'&&!s.tree&&window.FMOT206&&FMOT206.on&&!/[?&]waterstand=off\b/.test(location.search))?[s.x-(P.x<=s.x?1:-1)*55,s.y+4]:standOf(s);R.job={k:key(s),act,arg,tx:st[0],ty:st[1],t0:performance.now(),lp:[P.x,P.y],lt:performance.now()};R.stats.walk++;if(lastIn==null)lastIn=G.lastInput;if(Math.hypot(P.x-st[0],P.y-st[1])<12)arrive()}
function doAct(s,act,arg){let m='';try{
 if(act==='water'){m=F.water(s);if(!m){R.stats.water++;T2('รดน้ำ'+cropName(s.sp.crop)+'แล้ว')}}
 else if(act==='harvest'){m=F.harvest(s);if(!m)R.stats.harvest++}
 else if(act==='plant'){m=F.plant(arg,s);if(!m){R.stats.plant++;const n=seeds()[arg]|0;T2('ปลูก'+cropName(arg)+'แล้ว · เหลือ '+n);if(n<1)setMode(null)}}
 else if(act==='dig'){m=F.dig(s);if(!m){R.stats.dig++;T2('ขุดออกแล้ว')}}
 }catch(e){ERR('act',e);m='ทำไม่สำเร็จ'}if(m)T2(m)}
function arrive(){const j=R.job;stopWalk();if(!j)return;R.stats.arrive++;const s=find(j.k);if(!s){T2('ไม่พบช่องนี้แล้ว');return}try{const dx=s.x-P.x,dy=s.y-P.y;if(Math.abs(dx)>2)P.face=dx>0?0:Math.PI;else P.face=Math.atan2(dy,dx)}catch(_){}if(window.FMOT202&&FMOT202.start(s,j.act,j.arg,()=>{const s2=find(j.k)||s;doAct(s2,j.act,j.arg)}))return;doAct(s,j.act,j.arg)}
function steer(){requestAnimationFrame(steer);const j=R.job;if(!j)return;if(window.FMOT202&&FMOT202.busy()){j.t0=j.lt=performance.now();j.lp=[P.x,P.y];return}try{
 if(!inYard()||H.busy||G.win){stopWalk('state');return}
 if(playerInput()){stopWalk('input');return}
 const dx=j.tx-P.x,dy=j.ty-P.y,d=Math.hypot(dx,dy),now=performance.now();
 if(d<10){arrive();return}
 if(now-j.lt>500){const mv=Math.hypot(P.x-j.lp[0],P.y-j.lp[1]);j.lp=[P.x,P.y];j.lt=now;if(mv<3){const s=find(j.k);if(s&&Math.hypot(s.x-P.x,s.y-P.y)<=F.cfg.near){arrive();return}stopWalk();R.stats.fail++;T2('เดินไปไม่ถึงช่องนี้');return}}
 if(now-j.t0>9000){const s=find(j.k);if(s&&Math.hypot(s.x-P.x,s.y-P.y)<=F.cfg.near){arrive();return}stopWalk();R.stats.fail++;T2('เดินไปไม่ถึงช่องนี้');return}
 const th=camY(),c=Math.cos(th),sn=Math.sin(th),u=dx*c-dy*sn,v=dx*sn+dy*c,L=Math.hypot(u,v)||1,T=camT();
 myJoy={x:u/L,y:v/L*T,m:Math.min(1,Math.max(.4,d/45)),f193:1};G.joy=myJoy;G.lastInput='touch';
 }catch(e){ERR('steer',e);stopWalk()}}
requestAnimationFrame(steer);

/* ---------- planting mode + glow on empty spots ---------- */
function okSpot(s,id){return !s.sp.crop&&!s.sp.fin&&(!!s.tree===isTree(id))}
function setMode(id){R.mode=id||null;renderBanner();if(id){const any=F._plots().some(s=>okSpot(s,id));if(!any)T2(isTree(id)?'ไม่มีแปลงต้นไม้ที่ว่าง':'ไม่มีช่องว่างในแปลงผัก')}}
function defsGlow(){if(PROP_DEFS.farmseedglow)return;PROP_DEFS.farmseedglow={n:'Seed spot glow',cat:'misc',w:40,h:20,ax:20,ay:10,liveOnly:1,nofade:1,draw(){},live(c,p){try{const t=performance.now()/1000,a=.55+.35*Math.sin(t*4+p.ph),r=p.r;c.save();c.translate(p.x,p.y);c.scale(1,.55);c.globalAlpha=a;c.strokeStyle='#b8ff7a';c.lineWidth=2.5;c.shadowColor='#7dff4a';c.shadowBlur=8;c.beginPath();c.arc(0,0,r,0,7);c.stroke();c.globalAlpha=a*.35;c.fillStyle='#b8ff7a';c.fill();c.restore();c.save();c.translate(p.x,p.y-2);c.globalAlpha=a;c.fillStyle='#eaffd8';c.fillRect(-1.5,-6,3,12);c.fillRect(-6,-1.5,12,3);c.restore()}catch(e){ERR('glow',e)}}}}
const GL=[];
function glow(){try{for(const p of GL){const i=PROPS.indexOf(p);if(i>=0)PROPS.splice(i,1)}GL.length=0;if(!R.mode||!inYard())return;defsGlow();for(const s of F._plots()){if(!okSpot(s,R.mode))continue;const p={t:'farmseedglow',x:s.x,y:s.y,r:s.tree?22:10,s:1,v:0,f:1,ph:s.x*.13,house:1};GL.push(p);PROPS.push(p)}}catch(e){ERR('glowList',e)}}

/* ---------- tap ---------- */
function inPoly(x,y,q){let r=false;for(let i=0,j=q.length-1;i<q.length;j=i++){const a=q[i],b=q[j];if(((a[1]>y)!==(b[1]>y))&&(x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]))r=!r}return r}
function hitSpot(cx,cy,pred,rad){let best=null,bd=1e9;const z=camZ();for(const s of F._plots()){if(!pred(s))continue;for(const [oy,rr] of rad(s)){const a=w2s(s.x,s.y-oy),d=Math.hypot(a[0]-cx,a[1]-cy);if(d<rr*Math.max(.8,z)&&d<bd){bd=d;best=s}}}return best}
const plantRad=s=>{const st=s.sp.stage|0,o=markOff(s);return s.tree?[[o+6,30],[st>=3?45:15,34]]:[[o+6,22],[6,15]]};
function onPlot(wx,wy){try{for(const o of H.state().placed){const d=H.items[o.id];if(d&&d.farm&&B.poly&&inPoly(wx,wy,B.poly(d,o.x,o.y,o.f)))return true}}catch(_){}return false}
function eat(e){e.stopImmediatePropagation();if(e.cancelable)e.preventDefault()}
function onDown(e){try{if(!R.tap||!inYard()||G.win||H.busy)return;if(e.button>0)return;if(e.target!==cv)return;const cx=e.clientX,cy=e.clientY;
 /* planting mode: empty spot of the right kind */
 if(R.mode){const s=hitSpot(cx,cy,s=>okSpot(s,R.mode),s=>[[0,s.tree?30:16]]);if(s){eat(e);R.stats.tap++;closePop();if((seeds()[R.mode]|0)<1){T2('เมล็ดหมดแล้ว');setMode(null);return}walkTo(s,'plant',R.mode);return}}
 const s=hitSpot(cx,cy,s=>!!s.sp.crop,plantRad);
 if(s){eat(e);R.stats.tap++;closePop();const sp=s.sp;
  if(sp.ripe&&!sp.fin){walkTo(s,'harvest');return}
  if(!sp.fin&&!sp.w){walkTo(s,'water');return}
  try{F.ptr&&F.ptr(e)}catch(_){}openPop(s,cx,cy);return}
 const [wx,wy]=s2w(cx,cy);
 if(onPlot(wx,wy)){eat(e);closePop();if(R.mode){T2('ช่องนี้ปลูกไม่ได้ · แตะช่องที่เรืองแสง')}else{const e2=F._plots().some(s=>!s.sp.crop&&!s.sp.fin);T2(e2?(R.seed?'กด 🌱 เมล็ด แล้วเลือกช่องว่างเพื่อปลูก':'ช่องว่าง'):'แปลงเต็มแล้ว')}return}
 }catch(er){ERR('tap',er)}}
addEventListener('pointerdown',onDown,true);
/* keyboard: F next to a spot = the same action, no walking */
function onKey(e){try{if(!R.tap||!(e.key==='f'||e.key==='F')||e.repeat||!inYard()||G.win||H.busy||G.interact)return false;let best=null,bd=46;for(const s of F._plots()){const d=Math.hypot(s.x-P.x,s.y-(P.y+10));if(d<bd){bd=d;best=s}}if(!best)return false;R.stats.key++;eat(e);const sp=best.sp;
 if(sp.crop&&sp.ripe&&!sp.fin)doAct(best,'harvest');else if(sp.crop&&!sp.fin&&!sp.w)doAct(best,'water');else if(!sp.crop&&!sp.fin&&R.mode&&okSpot(best,R.mode))doAct(best,'plant',R.mode);else if(!sp.crop)T2(R.seed?'กด 🌱 เมล็ด แล้วเลือกช่องว่างเพื่อปลูก':'ช่องว่าง');else T2(sp.fin?'ต้นไม้ไม่ออกผลแล้ว':'กำลังโต · รดน้ำแล้ว');return true}catch(er){ERR('key',er)}return false}
function onEsc(e){try{if(e.key==='Escape'&&R.mode&&inYard()){setMode(null);closeList();eat(e);return true}}catch(_){}return false}
if(window.__EK){__EK.unshift(onEsc);__EK.unshift(onKey)}

/* ---------- UI ---------- */
const css=document.createElement('style');css.textContent=
'body.f193tap #farmPanel{display:none!important}'+
'#f193Seed{position:fixed;right:12px;z-index:30;display:none;min-height:40px;padding:0 14px;border-radius:12px;border:1px solid #ffd98a;background:linear-gradient(#5a8a3a,#2f5a1c);color:#f4ffe0;font:800 14px system-ui,sans-serif;cursor:pointer;touch-action:manipulation;box-shadow:0 3px 12px rgba(0,0,0,.5)}'+
'#f193Seed.on{background:linear-gradient(#8fd05a,#3f7a22)}'+
'#f193List,#f193Pop{position:fixed;z-index:31;display:none;padding:10px 12px;border-radius:14px;background:rgba(20,15,8,.95);border:1px solid #ffd98a;color:#fff;font:13px system-ui,sans-serif;box-shadow:0 0 18px rgba(255,200,100,.35)}'+
'#f193List{left:50%;top:50%;transform:translate(-50%,-50%);width:min(340px,92vw);max-height:70vh;overflow:auto}'+
'#f193List .hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;color:#ffe9b0;font-weight:800;font-size:15px}'+
'#f193List .gr{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:6px}'+
'#f193List .sd{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 4px;border-radius:10px;border:1px solid #6a5530;background:rgba(255,255,255,.06);color:#fff;font:12px system-ui,sans-serif;min-height:44px;cursor:pointer}'+
'#f193List .sd img{width:40px;height:40px;object-fit:contain}#f193List .sd b{color:#ffe27a}'+
'#f193List .sd[disabled]{opacity:.38}#f193List .no{color:#ccc;text-align:center;padding:8px}'+
'#f193List button.x,#f193Pop button,#f193Ban button{min-width:44px;min-height:40px;padding:4px 12px;border-radius:10px;border:1px solid #ffd98a;background:#3a2a12;color:#fff;font:700 13px system-ui,sans-serif;cursor:pointer}'+
'#f193Ban{position:fixed;left:50%;top:calc(70px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:31;display:none;align-items:center;gap:10px;padding:6px 8px 6px 14px;border-radius:22px;background:rgba(30,60,20,.92);border:1px solid #b8ff7a;color:#eaffd8;font:700 13px system-ui,sans-serif;max-width:94vw}';
document.head.appendChild(css);
const mk=(tag,id)=>{const e=document.createElement(tag);e.id=id;document.body.appendChild(e);for(const ev of ['pointerdown','mousedown','touchstart'])e.addEventListener(ev,x=>x.stopPropagation());return e};
let sb,ls,pop,ban;
function iconSrc(id){try{const im=H.crops&&H.crops.img[id+(isTree(id)?'|s1':'|s4')];return (im&&im.src)||''}catch(_){return ''}}
function openList(){const f=seeds();let h='<div class="hd"><span>🌱 เมล็ดพันธุ์</span><button class="x" data-x="1">✕</button></div>';const ids=[...Object.keys(F.cfg.crops),...Object.keys(F.cfg.trees)].filter(id=>(f[id]|0)>0);
 if(!ids.length)h+='<div class="no">ยังไม่มีเมล็ด · ซื้อได้ที่ร้านของ Emma ในเมือง (แท็บ ฟาร์ม)</div>';
 else{h+='<div class="gr">';for(const id of ids)h+='<button class="sd" data-seed="'+id+'"><img alt="" src="'+iconSrc(id)+'"><span>'+(isTree(id)?'ต้นกล้า':'เมล็ด')+cropName(id)+'</span><b>×'+(f[id]|0)+'</b></button>';h+='</div>'}
 ls.innerHTML=h;ls.style.display='block'}
function closeList(){if(ls)ls.style.display='none'}
function renderBanner(){if(!ban)return;if(!R.mode||!inYard()){ban.style.display='none';return}const n=seeds()[R.mode]|0,t='🌱 ปลูก'+cropName(R.mode)+' ×'+n+' · แตะช่องว่างที่เรืองแสง';if(ban.dataset.t!==t){ban.dataset.t=t;ban.firstChild.textContent=t}ban.style.display='flex'}
let popS=null;
function openPop(s,cx,cy){popS=key(s);const sp=s.sp;pop.innerHTML='<div style="margin-bottom:8px;color:#ffe9b0">'+(s.tree?'ต้นไม้':'ช่อง')+': '+cropName(sp.crop)+(sp.fin?' · ไม่ออกผลแล้ว':' · รดน้ำแล้ว รอโต')+'</div><div style="display:flex;gap:8px;justify-content:center"><button data-a="dig">ขุดออก</button><button data-a="close">✕</button></div>';pop.style.display='block';const w=pop.offsetWidth,h=pop.offsetHeight;pop.style.left=Math.max(6,Math.min(innerWidth-w-6,cx-w/2))+'px';pop.style.top=Math.max(6,Math.min(innerHeight-h-6,cy-h-40))+'px'}
function closePop(){if(pop)pop.style.display='none';popS=null}
function ui(){
 document.body.classList.toggle('f193tap',!!R.tap);
 if(R.seed){sb=mk('button','f193Seed');sb.type='button';sb.textContent='🌱 เมล็ด';sb.addEventListener('click',e=>{e.stopPropagation();if(ls.style.display==='block')closeList();else{closePop();openList()}});
  ls=mk('div','f193List');ls.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('button');if(!b)return;if(b.dataset.x){closeList();return}const id=b.dataset.seed;if(id){closeList();setMode(id)}});
  ban=mk('div','f193Ban');ban.innerHTML='<span></span><button type="button">✕ เลิกปลูก</button>';ban.querySelector('button').addEventListener('click',e=>{e.stopPropagation();setMode(null)})}
 pop=mk('div','f193Pop');pop.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('button');if(!b)return;const k=popS;closePop();if(b.dataset.a==='dig'){const s=k&&find(k);if(!s||!s.sp.crop)return;confirmDig(s)}});
}
let cf=null;
function confirmDig(s){const k=key(s);if(!cf){cf=mk('div','f193Cf');cf.style.cssText='position:fixed;inset:0;z-index:40;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.45)';cf.innerHTML='<div style="background:rgba(20,15,8,.96);border:1px solid #ffd98a;border-radius:14px;padding:16px 18px;max-width:86vw;text-align:center;color:#fff;font:15px system-ui,sans-serif"><div class="t" style="margin-bottom:12px"></div><div style="display:flex;gap:10px;justify-content:center"><button data-a="no" style="min-width:80px;min-height:44px;border-radius:10px;border:1px solid #ffd98a;background:#3a2a12;color:#fff;font:700 14px system-ui">ยกเลิก</button><button data-a="yes" style="min-width:80px;min-height:44px;border-radius:10px;border:1px solid #ff9a7a;background:#7a2a12;color:#fff;font:700 14px system-ui">ขุดออก</button></div></div>';cf.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('button');if(!b)return;cf.style.display='none';if(b.dataset.a==='yes'){const s2=find(cf.dataset.k);if(s2&&s2.sp.crop)walkTo(s2,'dig')}})}
 cf.dataset.k=k;cf.querySelector('.t').textContent='ขุด'+cropName(s.sp.crop)+'ออก? (ไม่คืนเงิน/เมล็ด)';cf.style.display='flex'}
function loop(){try{const y=inYard()&&!G.win;
 if(sb){const any=y&&F._plots().length>0;if(any){const hb=document.getElementById('hBuildBtn');let top=184;if(hb){const r=hb.getBoundingClientRect();if(r.width>0&&r.height>0)top=Math.round(r.bottom+8)}sb.style.top=top+'px';sb.style.display='block';sb.classList.toggle('on',!!R.mode)}else{sb.style.display='none';closeList()}}
 if(!y){if(R.mode&&!(G.zone===H.ZID&&(G.win||B.on)))setMode(null);closePop()}
 if(B.on&&R.mode)setMode(null);
 renderBanner();glow()}catch(e){ERR('loop',e)}}
function start(){if(!ready())return false;try{ui();setInterval(loop,250);R.ok=true}catch(e){ERR('start',e)}return true}
R.setMode=id=>setMode(id);R.walkTo=(k,act,arg)=>{const s=find(k);if(s)walkTo(s,act,arg);return !!s};R.find=find;R.key=key;R.stop=()=>stopWalk('api');
{let n=0;const iv=setInterval(()=>{if(start()||++n>120)clearInterval(iv)},500)}
})();

