
/* ---- p307: online-game entry flow (server select → login → character select → loading) ----
   Replaces the old title card. Gameplay, saves and the character system are unchanged:
   both servers and both login types use the same saves on this device (UI only).
   ?entry=off → old title screen. */
(function(){
if(/[?&]entry=off\b/.test(location.search))return;
const KP=(typeof KEYP!=='undefined'?KEYP:'realm_ds3_')+'entry_v1';
const SERVERS=[{n:1,id:'melodic',name:'Melodic'},{n:2,id:'rachel',name:'Rachel'}];
const TIPS=['กด V เพื่อ Dash หลบการโจมตีของมอนสเตอร์','กด M เปิดแผนที่โลก ดูโซนทั้งหมดได้','กด Z ดื่มยา HP · กด X ดื่มยา MP','ถึง Lv 10 เปลี่ยนคลาสได้ กด K ดูผังสกิล','เดินเข้าประตูที่ขอบแมพเพื่อไปโซนข้างเคียง','กด C ดูสเตตัส · กด I เปิดกระเป๋า','กด T เปิด Autoplay ให้ตัวละครสู้เอง','กด F / G ที่แท่นวาร์ปเพื่อเดินทาง','ซูมกล้องด้วยล้อเมาส์ 0.6–1.8×','สร้างตัวละครได้สูงสุด 5 ตัว แต่ละตัวมีเลเวลและกระเป๋าของตัวเอง'];
let ST={server:'melodic',login:null};
try{Object.assign(ST,JSON.parse(localStorage.getItem(KP)||'{}'));}catch(e){}
const save=()=>{try{localStorage.setItem(KP,JSON.stringify(ST));}catch(e){}};
const srv=id=>SERVERS.find(s=>s.id===id)||SERVERS[0];
const BGOFF=/[?&]bg=off\b/.test(location.search);
const css=document.createElement('style');css.textContent=`
#olBg{position:fixed;inset:0;z-index:31;display:none;background:#0a1230 url(assets/ffb71513565a9768.webp) center 30%/cover no-repeat}
#olBg:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(4,8,22,.15) 0%,rgba(4,8,22,0) 35%,rgba(4,8,22,.5) 100%)}
body.olon #olBg{display:block}
#olf{position:fixed;inset:0;z-index:35;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:16px;overflow-y:auto;overflow-x:hidden;
 background:none;-webkit-user-select:none;user-select:none}
#olf .ologo{font-size:clamp(34px,8.5vw,84px);text-align:center;margin:3vh 0 4px;filter:drop-shadow(0 3px 10px rgba(30,10,50,.75));max-width:100%;overflow-wrap:anywhere}
#olf .otag{font-size:clamp(14px,3.6vw,22px)!important;letter-spacing:.14em!important;color:#fff;text-shadow:0 2px 8px rgba(20,8,40,.9);font-size:clamp(11px,3.2vw,14px);letter-spacing:.08em;margin:0 0 18px;text-align:center}
.opan{margin-top:auto;width:min(460px,100%);border-radius:20px;padding:18px;background:linear-gradient(165deg,rgba(22,38,84,.94),rgba(7,12,32,.97));border:1px solid var(--line);box-shadow:0 20px 60px rgba(0,0,0,.6)}
.opan h2{margin:0 0 2px;font-family:var(--display);letter-spacing:.16em;font-size:16px;color:var(--gold);text-transform:uppercase;display:flex;align-items:center;gap:8px}
.opan h2 small{font-family:var(--body);letter-spacing:0;font-size:12px;color:var(--muted);text-transform:none;margin-left:auto}
.opan .osub{margin:0 0 12px;color:var(--muted);font-size:12.5px}
.ogrp{display:flex;align-items:center;gap:8px;margin:4px 0 8px;font-size:13px;color:var(--text)}
.ogrp b{padding:3px 12px;border-radius:999px;border:1px solid var(--gold);background:rgba(255,190,92,.14);color:#ffe2b0}
.ogrp span{color:var(--muted);font-size:12px}
.osrv{display:flex;align-items:center;gap:12px;width:100%;min-height:58px;margin:0 0 8px;padding:10px 14px;border-radius:14px;border:1px solid var(--line);background:rgba(255,255,255,.035);cursor:pointer;text-align:left;font-size:15px}
.osrv:hover{border-color:var(--cyan)}
.osrv.sel{border-color:var(--gold);background:linear-gradient(90deg,rgba(255,190,92,.22),rgba(255,190,92,.04));box-shadow:0 0 16px rgba(255,190,92,.25)}
.osrv .on{width:30px;height:30px;flex:none;border-radius:9px;display:grid;place-items:center;font-family:var(--display);font-weight:700;background:rgba(0,0,0,.35);border:1px solid var(--line2);color:var(--gold)}
.osrv .nm{font-family:var(--display);letter-spacing:.06em;font-weight:700;color:#fff;flex:1;min-width:0}
.osrv .tg{font-size:11px;padding:2px 8px;border-radius:999px;border:1px solid var(--line);color:var(--mint)}
.osrv .stt{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--mint);flex:none}
.osrv .stt i{width:9px;height:9px;border-radius:50%;background:#4dff9a;box-shadow:0 0 8px #4dff9a}
.obig{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:52px;margin:6px 0 0;font-size:16px;border-radius:14px}
.ologin{display:flex;align-items:center;gap:12px;width:100%;min-height:56px;margin:0 0 10px;padding:10px 16px;border-radius:14px;cursor:pointer;font-size:15px;text-align:left}
.ologin .ic{width:32px;height:32px;flex:none;border-radius:50%;display:grid;place-items:center}
.ologin.guest{border:1px solid var(--gold);background:linear-gradient(180deg,rgba(255,190,92,.42),rgba(60,30,4,.9));color:#fff}
.ologin.guest .ic{background:rgba(0,0,0,.3);font-size:18px}
.ologin.google{border:1px solid #dadce0;background:#fff;color:#1f1f1f}
.ologin.google .ic{background:#fff}
.ologin small{display:block;font-size:11.5px;opacity:.75;margin-top:1px}
.ologin.google small{color:#5f6368;opacity:1}
.orow{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:12px;flex-wrap:wrap}
.olink{background:none;border:0;color:var(--sky);cursor:pointer;font-size:13px;padding:8px 4px;min-height:36px}
.ochip{font-size:12px;color:var(--muted)} .ochip b{color:var(--gold);font-weight:600}
.ofoot{margin-bottom:0;display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:16px;max-width:min(560px,100%)}
.ofoot>.btn{font-size:12px!important;margin:0!important;opacity:.85}
.ofoot .introPanel{width:100%}
.octrl{width:min(760px,100%);margin-top:10px}
#olf .octrl.ctrl{display:grid}
.ostep{display:flex;gap:6px;justify-content:center;margin:0 0 14px}
.ostep i{width:26px;height:4px;border-radius:2px;background:rgba(255,255,255,.15)} .ostep i.on{background:var(--gold)}
body.olbar #chOv{padding-top:58px}
body.olbar .chbox{max-height:calc(100dvh - 70px)}
body.olon #menu,body.olon #bDev,body.olon #bEdit,body.olon #hudxGear{visibility:hidden}
#olfBar{position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:36;display:flex;gap:10px;align-items:center;padding:6px 14px;border-radius:999px;background:rgba(6,10,28,.88);border:1px solid var(--line);font-size:12px;color:var(--muted);white-space:nowrap;max-width:calc(100vw - 24px)}
#olfBar b{color:var(--gold)}
#olfBar button{background:none;border:0;color:var(--sky);cursor:pointer;font-size:12px;padding:4px}
#olLoad{position:fixed;inset:0;z-index:50;background-size:cover!important;background-position:center 40%!important;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:16px 16px max(28px,env(safe-area-inset-bottom));
 background:#0a1230;transition:opacity .45s}
#olLoad.fade{opacity:0;pointer-events:none}
#olLoad .lmid{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:9vh;min-height:0;width:100%}
#olLoad .ologo,#olf .ologo{text-shadow:0 4px 24px rgba(10,14,40,.7);}
#olLoad .otag{color:#fff;text-shadow:0 2px 8px rgba(20,8,40,.95);margin:0 0 8px;letter-spacing:.14em;text-align:center}
#olLoad .ologo{filter:drop-shadow(0 3px 12px rgba(20,8,40,.9)) drop-shadow(0 0 2px rgba(20,8,40,.8));font-size:clamp(24px,6vw,60px);text-align:center;margin:0 0 6px;max-width:100%;overflow-wrap:anywhere}
#olLoad .lsrv{color:#fff;text-shadow:0 2px 8px rgba(20,8,40,.95);font-size:13px;letter-spacing:.06em} #olLoad .lsrv b{color:var(--gold)}
#olLoad .lantern{width:58px;height:58px;margin:18px auto 0;border-radius:50%;background:radial-gradient(circle,#ffe7a8 0%,#ffbe5c 35%,rgba(255,138,61,.0) 70%);animation:olGlow 1.6s ease-in-out infinite}
@keyframes olGlow{0%,100%{transform:scale(.85);opacity:.7}50%{transform:scale(1.05);opacity:1}}
#olLoad .lpanel{width:min(680px,100%);padding:12px 14px 10px;border-radius:18px;background:rgba(5,9,24,.62);border:1px solid var(--line);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}
#olLoad .ltip{width:100%;margin:0 0 12px;padding:10px 14px;border-radius:14px;background:rgba(0,0,0,.32);border:1px solid var(--line2);font-size:13.5px;color:var(--text);text-align:center;min-height:42px}
#olLoad .ltip b{color:var(--gold);margin-right:6px}
#olLoad .lbar{width:100%;height:14px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid var(--line);overflow:hidden}
#olLoad .lbar i{display:block;height:100%;width:0;border-radius:inherit;background:linear-gradient(90deg,#ff8a3d,#ffbe5c 60%,#fff1c9);box-shadow:0 0 12px rgba(255,190,92,.6);transition:width .25s linear}
#olLoad .lrow{width:100%;display:flex;justify-content:space-between;margin-top:6px;font-size:12px;color:var(--muted)}
#olLoad .lrow b{color:#fff}
@media (max-height:500px){#olf{justify-content:flex-start}#olf .ologo{font-size:28px}#olf .otag{margin-bottom:10px}.opan{padding:14px}#olLoad .lantern{display:none}}
`;document.head.appendChild(css);
const GSVG='<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
const LBG=['assets/92102e0ec2a6d9d2.webp','assets/6538a0cdfff39ae9.webp'];
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const logoHTML=()=>'<h1 class="logo gtitle ologo">DookDik Story</h1>';
const tagHTML=()=>'<p class="otag">ปฐมบทแห่งนครลอยฟ้า</p>';
try{document.title='DookDik Story · ปฐมบทแห่งนครลอยฟ้า';}catch(e){}
const steps=n=>`<div class="ostep">${[1,2,3,4].map(i=>`<i class="${i<=n?'on':''}"></i>`).join('')}</div>`;
if(!BGOFF){const bg=document.createElement('div');bg.id='olBg';document.body.appendChild(bg);}
let ov=null,foot=null,ctrl=null,step=0;
function root(){if(ov)return ov;ov=document.createElement('div');ov.id='olf';document.body.appendChild(ov);
  ov.addEventListener('click',onClick);return ov;}
function adoptFooter(){ // keep the old title extras reachable (wiki, intro video settings, review arena, key list)
  if(!foot){foot=document.createElement('div');foot.className='ofoot';}
  for(const id of ['tWiki','bArena','tIntroToggle','tIntroPanel']){const e=document.getElementById(id);if(e&&e.parentNode!==foot)foot.appendChild(e);}
  if(!foot.querySelector('#olKeys')){const b=document.createElement('button');b.className='btn';b.id='olKeys';b.textContent='⌨ ปุ่มควบคุม';foot.appendChild(b);}
  const c=document.querySelector('#title .ctrl');if(c){ctrl=c;c.classList.add('octrl');c.hidden=true;}
}
function render(n){step=n;document.body.classList.add('olon');const o=root();o.hidden=false;hideBar();
  const s=srv(ST.server);
  if(n===2){
    o.innerHTML=logoHTML()+`<div class="opan" role="dialog" aria-label="เลือกเซิร์ฟเวอร์">${steps(2)}<h2>เลือกเซิร์ฟเวอร์ <small>${ST.login==='guest'?'Guest':'Google'}</small></h2><p class="osub">เลือกเซิร์ฟที่จะเข้าเล่น</p>
      <div class="ogrp"><b>Server</b><span>${SERVERS.length} เซิร์ฟเวอร์</span></div>
      ${SERVERS.map(v=>`<button class="osrv${v.id===ST.server?' sel':''}" data-olsrv="${v.id}"><span class="on">${v.n}</span><span class="nm">${esc(v.name)}</span>${ST.last===v.id?'<span class="tg">ล่าสุด</span>':''}<span class="stt"><i></i>เปิด</span></button>`).join('')}
      <button class="btn gold big obig" id="olSrvGo">เข้าสู่เซิร์ฟเวอร์ ${esc(s.name)}</button>
      <div class="orow"><button class="olink" id="olBack1">‹ ออกจากระบบ</button></div></div>`;
  }else if(n===1){
    o.innerHTML=logoHTML()+tagHTML()+`<div class="opan" role="dialog" aria-label="ล็อกอิน">${steps(1)}<h2>Login</h2><p class="osub">เลือกวิธีเข้าสู่ระบบ</p>
      <button class="ologin guest" id="olGuest"><span class="ic">👤</span><span>เล่นแบบ Guest<small>ไม่ต้องสมัคร · ข้อมูลเก็บในเครื่องนี้</small></span></button>
      <button class="ologin google" id="olGoogle"><span class="ic">${GSVG}</span><span>Sign in with Google<small>ยังไม่เปิดใช้งาน</small></span></button>
      ${ST.login?`<div class="orow"><span class="ochip">ล่าสุด: <b>${ST.login==='guest'?'Guest':'Google'}</b></span></div>`:''}</div>`;
    adoptFooter();o.appendChild(foot);if(ctrl)o.appendChild(ctrl);
  }
}
function showBar(){let b=document.getElementById('olfBar');const s=srv(ST.server);
  if(!b){b=document.createElement('div');b.id='olfBar';document.body.appendChild(b);b.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;
    if(t.id==='olOut'){if(typeof chClose==='function')chClose();ST.login=null;save();render(1);}
    if(t.id==='olSrv'){if(typeof chClose==='function')chClose();render(2);}});}
  b.innerHTML=`<span>เซิร์ฟ <b>${s.n} · ${esc(s.name)}</b></span><span>${ST.login==='guest'?'Guest':'Google'}</span><button id="olSrv">เปลี่ยนเซิร์ฟ</button><button id="olOut">ออกจากระบบ</button>`;b.hidden=false;document.body.classList.add('olbar');}
function hideBar(){document.body.classList.remove('olbar');if(G.state==='play')document.body.classList.remove('olon');const b=document.getElementById('olfBar');if(b)b.hidden=true;}
function toChars(){const o=root();o.hidden=true;step=3;showBar();chOpen_();}
function onClick(e){const t=e.target.closest('button');if(!t)return;
  if(t.dataset.olsrv){ST.server=t.dataset.olsrv;save();render(2);return;}
  if(t.id==='olSrvGo'){ST.last=ST.server;save();toChars();return;}
  if(t.id==='olBack1'){ST.login=null;save();render(1);return;}
  if(t.id==='olGuest'){ST.login='guest';if(!ST.guestId)ST.guestId='G'+Math.random().toString(36).slice(2,8).toUpperCase();save();render(2);return;}
  if(t.id==='olGoogle'){if(typeof notify==='function')notify('Login ด้วย Google ยังไม่เปิดใช้ · ตอนนี้เล่นแบบ Guest ได้ก่อน');return;}
  if(t.id==='olKeys'&&ctrl){ctrl.hidden=!ctrl.hidden;return;}
}
// character select stays the existing one; "กลับ" returns to the login screen
const chOpen_=window.chOpen;
window.chOpen=function(){if(G.state!=='play'){const o=root();o.hidden=true;step=3;if(ST.login)showBar();}return chOpen_.apply(this,arguments);};
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#chBack');if(t&&G.state!=='play')setTimeout(()=>render(ST.login?2:1),0);},true);
// loading screen in front of every world entry (play / create character)
let L=null;
function loader(){if(L)return L;const d=document.createElement('div');d.id='olLoad';d.hidden=true;document.body.appendChild(d);L={el:d,p:0,tipT:null};return L;}
function lSet(p,msg){const l=loader();l.p=Math.max(l.p,p);const i=l.el.querySelector('.lbar i');if(i)i.style.width=l.p.toFixed(0)+'%';
  const r=l.el.querySelector('#olPct');if(r)r.textContent=l.p.toFixed(0)+'%';if(msg){const m=l.el.querySelector('#olMsg');if(m)m.textContent=msg;}}
function lTip(){const l=loader(),k=(l.tip=((l.tip==null?Math.floor(Math.random()*TIPS.length):l.tip+1))%TIPS.length);const e=l.el.querySelector('.ltip');if(e)e.innerHTML='<b>TIP</b>'+esc(TIPS[k]);}
function lShow(){const l=loader(),s=srv(ST.server);l.p=0;l.el.classList.remove('fade');l.n=((l.n==null?Math.floor(Math.random()*2):l.n+1))%2;l.el.style.background=BGOFF?'radial-gradient(ellipse at 50% 35%,#16285c 0%,#0a1230 45%,#03060f 100%)':'#0a1230 url('+LBG[l.n]+') center 40%/cover no-repeat';
  l.el.innerHTML=`<div class="lmid">${logoHTML()}${tagHTML()}<div class="lsrv">เซิร์ฟ <b>${s.n} · ${esc(s.name)}</b></div></div>
   <div class="lpanel"><div class="ltip"></div><div class="lbar"><i></i></div><div class="lrow"><span id="olMsg">กำลังเชื่อมต่อเซิร์ฟเวอร์…</span><b id="olPct">0%</b></div></div>`;
  l.el.hidden=false;lTip();clearInterval(l.tipT);l.tipT=setInterval(lTip,3200);if(ov)ov.hidden=true;hideBar();}
function lDone(){const l=loader();lSet(100,'พร้อมแล้ว');setTimeout(()=>{l.el.classList.add('fade');setTimeout(()=>{l.el.hidden=true;clearInterval(l.tipT);},460);},250);}
const anim=(from,to,ms,msg)=>new Promise(res=>{const t0=performance.now();lSet(from,msg);(function f(){const k=Math.min(1,(performance.now()-t0)/ms);lSet(from+(to-from)*k);if(k<1)requestAnimationFrame(f);else res();})();});
const _sg=window.startGame;
window.startGame=function(cont){const io=(typeof INTRO!=='undefined')?INTRO.on:false,self=this,args=arguments;
  lShow();
  (async()=>{await anim(0,30,450,'กำลังเชื่อมต่อเซิร์ฟเวอร์…');await anim(30,42,200,'กำลังโหลดแผนที่…');
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    const cur=(typeof INTRO!=='undefined')?INTRO.on:false;if(typeof INTRO!=='undefined')INTRO.on=io;
    try{_sg.apply(self,args);}catch(e){console.error(e);}finally{if(typeof INTRO!=='undefined')INTRO.on=cur;}
    // the intro cutscene (new characters, if switched on) plays above; the world loads when it ends
    for(let i=0;i<600&&G.state!=='play';i++){const c=document.getElementById('cut');if(c&&!c.hidden)loader().el.hidden=true;await new Promise(r=>setTimeout(r,100));}
    loader().el.hidden=false;
    await anim(42,100,650,'กำลังเตรียมตัวละคร…');
    if(ov)ov.hidden=true;try{if(typeof chHud==='function')chHud();}catch(e){}lDone();})();
};
// any other way into the world (test modes, review arena) clears the entry screens
(function watch(){if(G.state==='play'&&ov&&!ov.hidden&&(!L||L.el.hidden)){ov.hidden=true;hideBar();}
  if(G.state==='play'&&!(L&&!L.el.hidden))hideBar();requestAnimationFrame(watch);})();
// boot: hide the old title card and open the server screen
function boot(){const t=document.getElementById('title');if(t){t.style.visibility='hidden';}
  if(G.state==='title'&&!(document.getElementById('chOv')&&!document.getElementById('chOv').hidden))render(1);}
setTimeout(boot,200);
// the old title card is shown again by "change character" in game: keep it invisible, our screens are used instead
window.__OLF={render,ST,SERVERS,step:()=>step};
})();

