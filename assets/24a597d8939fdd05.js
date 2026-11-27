
/* SETTAB227 r227: settings page split into tabs (กราฟิก / เสียง / ควบคุม / กล้อง / ตัวละคร). ?settab=off */
(function(){const X=window.SETTAB227={on:true,err:null,tab:null,ver:'r227'};
try{if(/[?&]settab=off/.test(location.search)){X.on=false;return}}catch(e){}
const TABS=[['gfx','🖥 กราฟิก'],['snd','🔊 เสียง'],['ctl','🎮 ควบคุม'],['cam','🎥 กล้อง'],['gen','👤 ตัวละคร']];
const KEY='lf_settab227';
try{const st=document.createElement('style');st.textContent=`
#st227bar{clear:both;flex-wrap:nowrap!important;position:sticky;top:-1px;z-index:5;display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 12px;padding:8px 0;background:rgba(12,22,44,.98);border-bottom:1px solid rgba(255,215,120,.25)}
#st227bar button{flex:1 1 0;min-width:0;padding:8px 2px;border-radius:10px;border:1px solid rgba(160,200,255,.3);background:rgba(30,50,90,.7);color:#cfe0ff;font:inherit;font-size:13px;letter-spacing:0;cursor:pointer;white-space:nowrap}
#st227bar button.on{background:linear-gradient(#ffd77a,#e0a840);color:#2a1a00;border-color:#ffe2a0;font-weight:bold}
.st227sec[hidden]{display:none!important}
.st227sec>h4:first-child{margin-top:0}
#st227snd .sl span b{color:#ffd77a}
#st227snd .st227row{display:flex;align-items:center;gap:10px;margin:10px 0}
#st227snd .st227row span{flex:0 0 120px}
#st227snd .st227row input[type=range]{flex:1}
#st227snd .st227row b{flex:0 0 44px;text-align:right;color:#ffd77a}
`;document.head.appendChild(st)}catch(e){X.err='css '+e.message}
function save(t){try{localStorage.setItem(KEY,t)}catch(e){}}
function load(){try{return localStorage.getItem(KEY)}catch(e){return null}}
function aud(){try{return typeof AUD!=='undefined'&&AUD&&AUD.cfg?AUD:null}catch(e){return null}}
function buildSnd(sec){const A=aud();const c=A?A.cfg:{master:.7,bgm:.45,sfx:.8,mute:false};
  sec.innerHTML='<h4>เสียง · Sound</h4>'+[['master','เสียงรวม'],['bgm','ดนตรี (BGM)'],['sfx','เอฟเฟกต์ (SFX)']].map(([k,n])=>`<div class="st227row"><span>${n}</span><input type="range" min="0" max="100" value="${Math.round((c[k]??0)*100)}" data-st227v="${k}"><b id="st227v_${k}">${Math.round((c[k]??0)*100)}%</b></div>`).join('')
   +`<label class="chk"><input type="checkbox" id="st227mute" ${c.mute?'checked':''}> ปิดเสียงทั้งหมด</label>`+(A?'':'<p class="hint">ระบบเสียงยังไม่พร้อม</p>');
  sec.addEventListener('input',e=>{const k=e.target.dataset&&e.target.dataset.st227v;if(!k)return;const A=aud();if(!A)return;A.cfg[k]=+e.target.value/100;const o=document.getElementById('st227v_'+k);if(o)o.textContent=e.target.value+'%';try{audSave();audVol()}catch(_){}});
  sec.addEventListener('change',e=>{if(e.target.id!=='st227mute')return;const A=aud();if(!A)return;A.cfg.mute=e.target.checked;try{audSave();audVol();if(!e.target.checked&&typeof audRestart==='function')audRestart()}catch(_){}});}
function syncSnd(){const A=aud();if(!A)return;for(const k of ['master','bgm','sfx']){const i=document.querySelector(`[data-st227v="${k}"]`);if(i&&document.activeElement!==i){i.value=Math.round(A.cfg[k]*100);const o=document.getElementById('st227v_'+k);if(o)o.textContent=i.value+'%'}}const m=document.getElementById('st227mute');if(m)m.checked=!!A.cfg.mute}
function show(t){X.tab=t;save(t);const p=document.getElementById('camPanel');if(!p)return;
  p.querySelectorAll('#st227bar button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
  p.querySelectorAll('.st227sec').forEach(s=>s.hidden=s.dataset.t!==t);if(t==='snd')syncSnd();}
function classify(ch,cur){const id=ch.id||'',tx=(ch.textContent||'').trim();
  if(id==='apSec'||id==='hudxSetBtn'||id==='ar218'||(ch.querySelector&&ch.querySelector('#camTouch,#hudxSetBtn,#ar218,#apOn')))return 'ctl';
  if(id==='benchBtn')return 'gfx';
  if(ch.tagName==='DETAILS')return 'gen';
  if(/Camera shake|กล้องสั่น/i.test(tx))return 'cam';
  return cur;}
function sort(){const p=document.getElementById('camPanel');if(!p)return;
  let bar=document.getElementById('st227bar'),secs={};
  if(!bar){bar=document.createElement('div');bar.id='st227bar';bar.innerHTML=TABS.map(([k,n])=>`<button type="button" data-t="${k}">${n}</button>`).join('');
    bar.addEventListener('click',e=>{const b=e.target.closest('button[data-t]');if(b)show(b.dataset.t)});
    const title=[...p.children].find(c=>c.tagName==='H4'&&/ตั้งค่า|Settings/i.test(c.textContent));
    if(title)title.after(bar);else p.prepend(bar);
    let after=bar;for(const [k] of TABS){const s=document.createElement('div');s.className='st227sec';s.dataset.t=k;s.id='st227'+k;after.after(s);after=s;if(k==='snd')buildSnd(s);}}
  for(const [k] of TABS)secs[k]=document.getElementById('st227'+k);
  const title=[...p.children].find(c=>c.tagName==='H4'&&/ตั้งค่า|Settings/i.test(c.textContent));
  let cur='gen',moved=0;const kids=[...p.children];
  for(const ch of kids){if(ch===bar||ch===title||ch.id==='obCamClose'||ch.classList.contains('st227sec'))continue;
    if(ch.tagName==='H4'){if(/CAMERA|กล้อง/i.test(ch.textContent))cur='cam';else if(/กราฟิก|ความลื่น/.test(ch.textContent))cur='gfx';else if(/เสียง/.test(ch.textContent))cur='snd';}
    if(ch.classList.contains('setsec')||ch.id==='apSec'){const tx=ch.textContent||'';if(ch.id==='apSec'||/ยา|ควบคุม|Auto/i.test(tx))cur='ctl';else if(/ออร่า/.test(tx))cur='gfx';else if(/ตัวละคร/.test(tx))cur='gen';else if(/เสียง/.test(tx))cur='snd';}
    const k=classify(ch,cur);secs[k].appendChild(ch);moved++;}
  // touch-controls row lives inside the camera block: move it to controls
  const tc=document.getElementById('camTouch');if(tc){const row=tc.closest('label')||tc.parentNode;if(row&&secs.cam.contains(row)){secs.ctl.prepend(row);moved++}}
  if(secs.ctl&&!secs.ctl.querySelector('h4.st227h')){const h=document.createElement('h4');h.className='st227h';h.textContent='ควบคุม · Controls';secs.ctl.prepend(h)}
  if(secs.gen&&!secs.gen.querySelector('h4.st227h')){const h=document.createElement('h4');h.className='st227h';h.textContent='ตัวละคร · ทั่วไป';secs.gen.prepend(h)}
  if(!X.tab||moved){const t=X.tab||load();show(TABS.some(a=>a[0]===t)?t:'gfx')}
  X.n=(X.n||0)+1;}
X.sort=sort;X.show=show;
let wasVis=false;
setInterval(()=>{try{const p=document.getElementById('camPanel');if(!p)return;const vis=p.offsetParent!==null||getComputedStyle(p).display!=='none'&&!p.hidden;
  sort();if(vis&&!wasVis&&X.tab==='snd')syncSnd();wasVis=vis}catch(e){X.err='sort '+e.message}},700);
})();

