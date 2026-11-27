
/* ===== v177 HUD PREVIEW CANDIDATE (based on v175) — visual/layout layer only; no gameplay change.
   Rework of the rejected v176 (kept untouched in candidate_hud_v176/). Smooth navy surfaces · thin aged-brass edges · wood only as a faint frame.
   Loaded after the game script. window.HUD_TEST_BUILD===true shows the collapsed TEST tray (test builds only). ===== */
(function(){'use strict';
const TEST=window.HUD_TEST_BUILD===true,TAG='v177-hud-preview · based on v175';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const css=`
:root{--hv-n1:#16244a;--hv-n2:#0a1228;--hv-n3:rgba(9,15,34,.88);--hv-br:#b39350;--hv-brd:#7a6234;--hv-wd:#4a3523;--hv-cr:#efe6cf;--hv-cr2:#b9ae92;--hv-ink:#e9eefc}
/* ---- shared surface: smooth navy, thin brass edge, faint wood only as outer frame ---- */
.hv-surf{background:linear-gradient(180deg,var(--hv-n1),var(--hv-n2));border:1px solid var(--hv-brd);box-shadow:0 0 0 2px var(--hv-wd),0 3px 10px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,235,190,.08)}
body #menu .mbtn{background:linear-gradient(180deg,var(--hv-n1),var(--hv-n2));border:1px solid var(--hv-brd);color:var(--hv-cr);box-shadow:0 2px 6px rgba(0,0,0,.5)}
body #menu .mbtn:hover,body #menu .mbtn.on{border-color:var(--hv-br);background:linear-gradient(180deg,#22366a,#0f1a38)}
body #menu .mbtn kbd{color:var(--hv-cr2)}
body #bar{background:linear-gradient(180deg,var(--hv-n1),var(--hv-n2));border:1px solid var(--hv-brd);box-shadow:0 0 0 2px var(--hv-wd),0 10px 26px rgba(0,0,0,.7)}
body #bar::before{background:linear-gradient(135deg,#d8bb7a,#7b5d2b);border-color:#2a1c0c}
body #bar .sep{background:linear-gradient(180deg,transparent,var(--hv-brd),transparent)}
body #bar .slot{background:linear-gradient(180deg,#14213f,#091024);border:1px solid var(--hv-brd);box-shadow:inset 0 0 10px rgba(0,0,0,.8)}
body #bar .slot kbd{color:var(--hv-cr2)}
body #bar .slot.pot[data-pot=hp]{background:linear-gradient(180deg,#3d1c2a,#14080e);border-color:#a8505f}
body #bar .slot.pot[data-pot=mp]{background:linear-gradient(180deg,#182f58,#0a1226);border-color:#4f7fc4}
body #autoChip{background:linear-gradient(180deg,var(--hv-n1),var(--hv-n2));border:1px solid var(--hv-brd);color:var(--hv-cr)}
body #log div{background:rgba(9,15,34,.86);border-left-color:var(--hv-br)}
body #zoneTag{background:linear-gradient(180deg,var(--hv-n1),var(--hv-n2));border:1px solid var(--hv-brd)}
body #hud .chip{background:#101b38;border:1px solid var(--hv-brd);color:var(--hv-cr);border-radius:5px}
body #hud .chip.cy{background:#12234a;border-color:#3d5686;color:#cfe0ff}
.glb .ring{filter:sepia(.35) saturate(.85) brightness(.95)}
/* ---- new buttons (hidden until a game is running) ---- */
.hv-b{position:fixed;z-index:10;width:44px;height:44px;border-radius:50%;border:5px solid transparent;background:linear-gradient(180deg,var(--hv-n1),var(--hv-n2));background-clip:padding-box;box-shadow:0 0 0 1px var(--hv-brd),0 0 0 2px #22160d;color:var(--hv-cr);font-size:17px;line-height:1;display:none;place-items:center;padding:0;cursor:pointer;touch-action:manipulation;box-sizing:border-box}
.hv-b::after{content:'';position:absolute;inset:-5px}
.hv-b[aria-expanded=true]{background-image:linear-gradient(180deg,#26407a,#0f1a38)}
.hv-b:focus-visible,.hv-p button:focus-visible,#menu .mbtn:focus-visible,#menu .hv-row:focus-visible{outline:2px solid #ffd98a;outline-offset:2px}
body.hv-play .hv-b{display:grid}
.hv-b.txt{border-radius:12px;font-size:9px;font-weight:700;letter-spacing:.08em}
.hv-p{position:fixed;z-index:11;display:none;flex-direction:column;gap:8px;padding:10px;border-radius:12px;border:1px solid var(--hv-br);background:linear-gradient(180deg,rgba(22,36,74,.98),rgba(9,15,34,.98));box-shadow:0 0 0 2px var(--hv-wd),0 10px 30px rgba(0,0,0,.65);color:var(--hv-cr);font-size:12px;max-width:calc(100vw - 16px)}
.hv-p .hh{display:flex;align-items:center;gap:8px;font-weight:700;letter-spacing:.14em;font-size:12px;color:#e3c985}
.hv-p .hh .x{margin-left:auto;width:44px;height:44px;margin-top:-10px;margin-right:-10px;border:0;background:transparent;color:var(--hv-cr);font-size:18px;cursor:pointer}
.hv-p .nb{font-size:9px;font-weight:700;background:#8b2f3a;color:#fff;border-radius:6px;padding:2px 6px;letter-spacing:.04em}
.hv-p .note{font-size:10px;color:var(--hv-cr2);line-height:1.35}
body.hv-mini #hudMini,body.hv-tray #hudTray{display:flex}
#hudMini canvas{width:100%;border-radius:8px;border:1px solid var(--hv-brd);background:#0b1429;display:block}
#hudTray{width:min(250px,calc(100vw - 16px))}
#hudTray .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
#hudTray .tbtn,#hudTray .mbtn,#hudTray #slChip,#hudTray #slLight button{position:static!important;transform:none!important;width:auto!important;height:auto!important;min-width:44px;min-height:44px;padding:0 12px!important;border-radius:10px;display:inline-flex!important;align-items:center;gap:6px;font-size:12px;border:1px solid var(--hv-brd);background:linear-gradient(180deg,#16244a,#0a1228);color:var(--hv-cr);cursor:pointer;flex-direction:row}
#hudTray #slLight{position:static!important;transform:none!important;display:flex!important;gap:6px;background:none!important;border:0!important;padding:0!important;box-shadow:none!important}
#hudTray .mbtn kbd{display:none}#hudTray .mbtn::after{content:attr(data-hl);font-size:12px;color:var(--hv-cr)}
#hudTray .tag{font-size:10px;color:var(--hv-cr2);letter-spacing:.04em}
#hudTray [hidden],#hudTray .gone{display:none!important}
/* ===== MOBILE / TOUCH ===== */
/* -- status: compact portrait + integrated HP/MP + LV; details live in an expandable panel -- */
body.mobile #hud{left:calc(8px + env(safe-area-inset-left,0px));right:auto;top:calc(8px + env(safe-area-inset-top,0px));display:flex;align-items:flex-start;gap:6px;max-width:240px}
body.mobile #hud{padding-left:62px;min-height:58px}
body.mobile #hud .medal{position:absolute!important;left:0;top:0;width:54px;height:54px;margin:0!important;transform:none!important}
body.mobile #hud .medal::after{content:attr(data-lv);position:absolute;left:50%;bottom:-5px;transform:translateX(-50%);min-width:24px;height:15px;padding:0 5px;border-radius:8px;background:#0b1227;border:1px solid var(--hv-br);color:#f1e2b0;font-size:10px;font-weight:700;line-height:13px;text-align:center;box-sizing:border-box;z-index:3}
body.mobile #hud .hinfo{display:flex!important;flex-direction:column;width:136px;min-width:0;margin:0;flex:none;gap:0}
body.mobile #hud .hplate{height:auto;margin:0 0 2px;padding:0;background:none;border:0;box-shadow:none;gap:0;min-height:0}
body.mobile #hud .hplate>:not(.hpn){display:none!important}
body.mobile #hud .hpn{display:block!important;padding:0}
body.mobile #hud .hname{font-size:12px;line-height:14px;color:var(--hv-cr);font-weight:700;letter-spacing:.04em;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 1px 2px #000}
body.mobile #hud .hcls{display:none!important}
body.mobile #hud .hinfo>.bar.hp,body.mobile #hud .hinfo>.bar.mp{display:block!important;position:relative;width:100%;height:15px;margin:0 0 3px;border-radius:4px;border:1px solid var(--hv-brd);background:#070b18;box-shadow:0 0 0 1px #22160d;overflow:hidden}
body.mobile #hud .hinfo>.bar.mp{height:12px}
body.mobile #hud .bar.hp i{background:linear-gradient(180deg,#e0526f,#a31d40);box-shadow:none}
body.mobile #hud .bar.mp i{background:linear-gradient(180deg,#5aa8ee,#1b4fb0);box-shadow:none}
body.mobile #hud .bar span{position:absolute;inset:0;display:block;text-align:center;font-size:10px;line-height:13px;font-weight:700;color:#fff;text-shadow:0 0 3px #000,0 1px 1px #000;font-variant-numeric:tabular-nums;letter-spacing:0}
body.mobile #hud .bar.mp span{font-size:9px;line-height:10px}
body.mobile #hud .hinfo>.bar.xp,body.mobile #hud .hinfo>.chips{display:none!important}
/* expandable details: only when the panel is open (#hud not .fold) */
body.mobile #hud:not(.fold) .hinfo>.bar.xp{display:block!important;height:5px;margin:2px 0 0;border:1px solid var(--hv-brd);background:#070b18}
body.mobile #hud:not(.fold) .hinfo>.chips{display:flex!important;flex-wrap:wrap;gap:4px;margin:6px 0 0;padding:6px;border-radius:8px;border:1px solid var(--hv-brd);background:rgba(9,15,34,.92);width:178px}
body.mobile #hud .chip{font-size:10px;padding:2px 6px}
body.mobile #hudFold{position:absolute;left:186px;right:auto;top:-2px;width:44px;height:44px;border:0!important;background:transparent!important;box-shadow:none!important;color:transparent;padding:0}
body.mobile #hudFold::before{content:attr(data-g);position:absolute;left:12px;top:12px;width:20px;height:20px;border-radius:50%;border:1px solid var(--hv-brd);background:#0d1630;color:var(--hv-cr);font-size:11px;line-height:18px;text-align:center}
/* -- ☰ menu button + compact list -- */
body.mobile #hudMenuBtn{top:calc(8px + env(safe-area-inset-top,0px));right:calc(8px + env(safe-area-inset-right,0px))}
body.mobile #hudTrayBtn{top:calc(8px + env(safe-area-inset-top,0px));right:calc(60px + env(safe-area-inset-right,0px))}
body:not(.mobile) #hudMenuBtn,body:not(.mobile) #hvLogRow{display:none!important}
body.mobile #menu{display:none;position:fixed;top:calc(58px + env(safe-area-inset-top,0px));right:calc(8px + env(safe-area-inset-right,0px));left:auto;z-index:11;width:min(190px,calc(100vw - 16px));flex-direction:column;gap:2px;padding:6px;border-radius:12px;border:1px solid var(--hv-br);background:linear-gradient(180deg,rgba(22,36,74,.98),rgba(9,15,34,.98));box-shadow:0 0 0 2px var(--hv-wd),0 10px 30px rgba(0,0,0,.65)}
body.mobile.hv-menu #menu{display:flex}
body.mobile #menu .mbtn,body.mobile #menu .hv-row,body.mobile #menu.fold>.mbtn{display:flex!important;flex-direction:row;align-items:center;width:100%;height:44px;min-height:44px;padding:0 10px;gap:10px;justify-content:flex-start;border-radius:8px;border:0;background:transparent;box-shadow:none;color:var(--hv-cr);font:inherit;font-size:13px;cursor:pointer;text-align:left}
body.mobile #menu .mbtn+.mbtn,body.mobile #menu .hv-row{border-top:1px solid rgba(179,147,80,.18)}
body.mobile #menu .mbtn:active,body.mobile #menu .hv-row:active,body.mobile #menu .mbtn.on{background:rgba(179,147,80,.16)}
body.mobile #menu .mbtn::after,body.mobile #menu .hv-row span{content:attr(data-hl);font-size:13px;color:var(--hv-cr);white-space:nowrap}
body.mobile #menu .mbtn svg,body.mobile #menu .hv-row svg{flex:none;width:20px;height:20px;color:var(--hv-br)}
body.mobile #menu .mbtn kbd{display:none}
body.mobile #menu #bAuto.on::after{color:#9ff0c8}
body.mobile #menuFold{display:none!important}
@media (orientation:landscape) and (max-height:520px){body.mobile #menu{width:min(380px,calc(100vw - 16px));display:none;flex-direction:row;flex-wrap:wrap;gap:0 4px;max-height:calc(100vh - 66px);overflow-y:auto}body.mobile.hv-menu #menu{display:flex}body.mobile #menu .mbtn,body.mobile #menu .hv-row,body.mobile #menu.fold>.mbtn{width:calc(50% - 2px);border-top:0}body.mobile #menu .mbtn+.mbtn,body.mobile #menu .hv-row{border-top:0}#hudMenuHead{width:100%}}
#hudMenuHead{display:none}
body.mobile #hudMenuHead{display:flex;align-items:center;gap:8px;padding:0 6px 0 10px;height:30px;font-weight:700;letter-spacing:.14em;font-size:11px;color:#e3c985}
#hudMenuHead .x{margin-left:auto;width:44px;height:44px;margin-top:-6px;margin-right:-6px;border:0;background:transparent;color:var(--hv-cr);font-size:16px;cursor:pointer}
/* -- autoplay: lives in the menu; the chip shows only as a small status pill while ON -- */
body.mobile #autoChip{display:none!important}
body.mobile.hv-autoon #autoChip{display:inline-flex!important;position:fixed;left:auto;transform:none;bottom:auto;top:calc(58px + env(safe-area-inset-top,0px));right:calc(10px + env(safe-area-inset-right,0px));height:22px;min-height:0;padding:0 9px;border-radius:11px;font-size:10px;letter-spacing:.1em;align-items:center;color:#9ff0c8;border:1px solid #3f8f72;background:rgba(9,15,34,.88);box-shadow:none;z-index:7}
body.mobile.hv-autoon #autoChip::before{content:'';position:absolute;inset:-12px -6px}
body.mobile.hv-menu #autoChip{display:none!important}
/* -- log: collapsed by default; toggled from the menu -- */
body.mobile #log{display:none;left:calc(8px + env(safe-area-inset-left,0px));top:auto;bottom:calc(214px + env(safe-area-inset-bottom,0px));max-width:min(60vw,250px);max-height:120px;overflow:hidden;opacity:.92;pointer-events:none}
body.mobile.hv-log #log{display:flex}
/* -- one control style: round, smooth navy, thin brass ring -- */
body.mobile #joyBase{border:1.5px solid rgba(179,147,80,.55);background:radial-gradient(circle,rgba(22,36,74,.32),rgba(6,10,24,.5));box-shadow:inset 0 0 0 5px rgba(9,15,34,.25)}
body.mobile #joyKnob{background:radial-gradient(circle at 40% 32%,#2c4488,#101b3c 70%);border:2px solid var(--hv-br);box-sizing:border-box;box-shadow:0 2px 8px rgba(0,0,0,.6),inset 0 0 8px rgba(0,0,0,.5)}
body.mobile #touchUI :is(#tAtk,#tDash,.tsk){background:radial-gradient(circle at 45% 30%,#22366a,#0a1228 75%)!important;border:2px solid var(--hv-br)!important;color:var(--hv-cr);box-shadow:0 2px 8px rgba(0,0,0,.6),0 0 0 2px #22160d!important}
body.mobile #touchUI #tAtk.hot{border-color:#ffd98a!important;box-shadow:0 0 14px rgba(255,200,110,.8),0 0 0 2px #22160d!important}
body.mobile #touchUI .tsk.flash{filter:brightness(1.5)}
body.mobile #actPad{bottom:calc(136px + env(safe-area-inset-bottom,0px))}
/* dash joins the bottom row (left of the potions) so the play area stays clear */
body.mobile #touchUI #tDash{position:fixed;left:auto;top:auto;right:calc(156px + env(safe-area-inset-right,0px));bottom:calc(13px + env(safe-area-inset-bottom,0px));width:54px;height:54px;font-size:18px}
body.mobile #touchUI #hudPots{position:fixed;right:calc(12px + env(safe-area-inset-right,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));display:flex;gap:16px;pointer-events:none;z-index:9}
body.mobile #hudPots .tb{position:relative;pointer-events:auto;width:56px;height:56px;border-radius:50%;display:grid;place-items:center;touch-action:none;user-select:none;-webkit-user-select:none;background:radial-gradient(circle at 45% 30%,#22366a,#0a1228 75%);border:2px solid var(--hv-br);box-shadow:0 2px 8px rgba(0,0,0,.6),0 0 0 2px #22160d}
body.mobile #hudPots #tHp{background:radial-gradient(circle at 45% 30%,#6a2638,#1a0a10 75%)}
body.mobile #hudPots #tMp{background:radial-gradient(circle at 45% 30%,#1f4e9a,#0a1226 75%)}
body.mobile #hudPots .tb img{width:34px;height:34px}
body.mobile #hudPots .tb::before{content:attr(data-l);position:absolute;left:0;right:0;top:-15px;text-align:center;font-size:10px;font-weight:700;letter-spacing:.1em;color:var(--hv-cr);text-shadow:0 1px 2px #000}
body.mobile #hudPots .tb b{position:absolute;right:-4px;bottom:-4px;min-width:21px;height:19px;padding:0 5px;border-radius:10px;background:#0b1227;border:1px solid var(--hv-br);color:#fff;font-size:12px;line-height:17px;text-align:center;font-variant-numeric:tabular-nums;box-sizing:border-box}
body.mobile #hudPots .tb.empty{opacity:.5}
body.mobile #hudPots .tb.press{transform:scale(.94);filter:brightness(1.3)}
/* camera rotate: secondary, small, bottom-left corner (visible 34px, hit area 44px) */
body.mobile #tPots{left:calc(6px + env(safe-area-inset-left,0px));right:auto;transform:none;bottom:calc(4px + env(safe-area-inset-bottom,0px));gap:6px}
body.mobile #tPots .tb.rot{width:44px;height:44px;border-radius:50%;border:5px solid transparent;background:radial-gradient(circle at 45% 30%,#22366a,#0a1228 75%);background-clip:padding-box;box-shadow:0 0 0 1px var(--hv-brd);opacity:.7;color:var(--hv-cr);font-size:15px;box-sizing:border-box}
body.mobile #banner{top:calc(120px + env(safe-area-inset-top,0px))}
@media (prefers-reduced-motion:reduce){.hv-b,.hv-p{transition:none!important}}
body.ovcompact:not(.ovhud) :is(.hv-b,.hv-p){display:none!important}
`;
const st=document.createElement('style');st.id='hudV177Style';st.textContent=css;document.head.appendChild(st);

// ---------- state ----------
let open=null;const setOpen=k=>{open=(open===k)?null:k;sync();};
const closeAll=()=>{open=null;sync();};
function sync(){const b=document.body;for(const k of['menu','mini','tray'])b.classList.toggle('hv-'+k,open===k);
  const m=$('#hudMenuBtn'),t=$('#hudTrayBtn');
  if(m)m.setAttribute('aria-expanded',open==='menu');if(t)t.setAttribute('aria-expanded',open==='tray'||open==='mini');
  if(open==='mini')drawMini();}
const mk=(tag,props,parent)=>{const e=document.createElement(tag);Object.assign(e,props);if(parent)parent.appendChild(e);return e;};
const btn=(id,label,txt,cb,cls)=>{const b=mk('button',{id,type:'button',className:'hv-b'+(cls?' '+cls:''),textContent:txt},document.body);b.setAttribute('aria-label',label);b.title=label;b.addEventListener('click',e=>{e.stopPropagation();cb();});b.addEventListener('pointerdown',e=>e.stopPropagation());return b;};

// ---------- menu (mobile): ☰ opens a compact closable list; every existing button keeps its own handler ----------
const menu=$('#menu');
const HL={bWiki:'วิกิ',bAuto:'Autoplay',bCam:'ตั้งค่า',bEdit:'Editor',bDev:'GM'};
function labelMenu(){$$('#menu .mbtn').forEach(b=>{let l=HL[b.id];if(!l){l={wMap:'แผนที่',wSkill:'สกิล',wInv:'ตัวละคร'}[b.dataset.win];}if(l){b.dataset.hl=l;b.setAttribute('aria-label',(b.title||l));}});}
labelMenu();
const head=mk('div',{id:'hudMenuHead'});head.innerHTML='<span>เมนู</span>';const hx=mk('button',{type:'button',className:'x',textContent:'✕'},head);hx.setAttribute('aria-label','ปิดเมนู');hx.addEventListener('click',closeAll);menu.insertBefore(head,menu.firstChild);
btn('hudMenuBtn','เปิดเมนู','☰',()=>setOpen('menu')).setAttribute('aria-controls','menu');
// message-log toggle row (log is collapsed by default on mobile)
const logRow=mk('button',{type:'button',className:'hv-row',id:'hvLogRow'},menu);
logRow.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg><span>บันทึกข้อความ</span>';logRow.setAttribute('aria-pressed','false');
logRow.dataset.hl='บันทึกข้อความ';
logRow.addEventListener('click',()=>{const on=document.body.classList.toggle('hv-log');logRow.setAttribute('aria-pressed',on);});
menu.addEventListener('click',e=>{if(e.target.closest('.mbtn,.hv-row'))setTimeout(closeAll,60);});

// ---------- minimap prototype (NEW functionality, test builds only; reached from the test tray) ----------
const mini=mk('div',{id:'hudMini',className:'hv-p'},document.body);mini.setAttribute('role','dialog');mini.setAttribute('aria-label','แผนที่ย่อ');
mini.innerHTML='<div class="hh"><span>MINIMAP</span><span class="nb">NEW · prototype</span><button class="x" type="button" aria-label="ปิดแผนที่ย่อ">✕</button></div><canvas id="hudMiniC" width="360" height="360" aria-hidden="true"></canvas><div class="note" id="hudMiniN"></div>';
mini.querySelector('.x').addEventListener('click',closeAll);
function drawMini(){try{const c=$('#hudMiniC');if(!c||open!=='mini')return;const Z=ZONES[G.zone];if(!Z)return;const w=Z.w,h=Z.h,S=Math.min(340/w,340/h);c.width=Math.round(w*S)+8;c.height=Math.round(h*S)+8;const g=c.getContext('2d');g.translate(4,4);
  g.fillStyle='#16233f';g.fillRect(0,0,w*S,h*S);g.strokeStyle='#a98543';g.lineWidth=2;g.strokeRect(0,0,w*S,h*S);
  const X=x=>x*S,Y=y=>y*S;
  if(Array.isArray(Z.areas))for(const a of Z.areas){g.beginPath();g.arc(X(a.x),Y(a.y),a.r*S,0,7);g.fillStyle=a.safe?'rgba(120,230,170,.18)':'rgba(255,255,255,.07)';g.fill();g.strokeStyle=a.safe?'rgba(120,230,170,.7)':'rgba(255,255,255,.3)';g.lineWidth=1;g.stroke();}
  if(G.zone==='sylva_lab'&&window.COLSLAB){const poly=COLSLAB.safePoly;if(poly){g.beginPath();poly.forEach((p,i)=>i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1])));g.closePath();g.fillStyle='rgba(120,230,170,.16)';g.fill();g.strokeStyle='rgba(120,230,170,.75)';g.stroke();}
    const ng=COLSLAB.nogo;if(ng){g.beginPath();ng.forEach((p,i)=>i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1])));g.closePath();g.fillStyle='rgba(120,230,170,.12)';g.fill();}}
  try{if(typeof PROPS!=='undefined'&&typeof PROP_DEFS!=='undefined')for(const q of PROPS){const D=PROP_DEFS[q.t];if(!D||!D.solid||!D.solid.length)continue;const sc=q.s||1,w=q.t==='svWater';g.fillStyle=w?'rgba(60,130,210,.55)':'rgba(190,170,130,.5)';for(const o of D.solid){const r=Math.max(1,(o.r||0)*(w?1:sc)*S);g.beginPath();g.arc(X(q.x+(o.dx||0)*(w?1:sc)),Y(q.y+(o.dy||0)*(w?1:sc)),r,0,7);g.fill();}}}catch(e){}
  g.fillStyle='#b98cff';if(typeof GATES!=='undefined')for(const t of GATES){g.beginPath();g.arc(X(t.x),Y(t.y),4,0,7);g.fill();}
  if(typeof WAY!=='undefined'&&WAY){g.fillStyle='#5ef0e0';g.fillRect(X(WAY.x)-3,Y(WAY.y)-3,6,6);}
  if(typeof NEXUS!=='undefined'&&NEXUS){g.fillStyle='#8dffe8';g.fillRect(X(NEXUS.x)-4,Y(NEXUS.y)-4,8,8);}
  g.fillStyle='#f0d38f';if(typeof NPCS!=='undefined')for(const n of NPCS){g.fillRect(X(n.x)-1.5,Y(n.y)-1.5,3,3);}
  g.fillStyle='#e0526f';if(typeof enemies!=='undefined')for(const e of enemies){if(e.dead)continue;g.beginPath();g.arc(X(e.x),Y(e.y),3,0,7);g.fill();}
  g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=2;g.beginPath();g.arc(X(P.x),Y(P.y),5,0,7);g.stroke();g.fill();
  $('#hudMiniN').textContent=(Z.n||G.zone)+' · '+w+'×'+h+'  ·  ● you  ● monsters  ◆ gates/waystone  green = safe area / named areas  grey = object footprints  blue = water. Live from the zone\'s own data (no art).';
}catch(e){}}
setInterval(()=>{if(open==='mini')drawMini();},250);

// ---------- potions: HP/MP buttons sit in the bottom row with the dash (handlers stay on the same elements) ----------
function setupPots(){const t=$('#touchUI');if(!t||$('#hudPots'))return;const hp=$('#tHp'),mp=$('#tMp');if(!hp||!mp)return;
  const box=mk('div',{id:'hudPots'});t.appendChild(box);box.appendChild(hp);box.appendChild(mp);hp.dataset.l='HP';mp.dataset.l='MP';}
setupPots();
// status details start collapsed (reversible via the chevron); only when the player has no stored preference
let foldDone=false;
setInterval(()=>{try{
  for(const [id,nm] of [['tHp','ยา HP'],['tMp','ยา MP']]){const b=$('#'+id),q=$('#'+id+'Q');if(!b||!q)continue;const n=+q.textContent||0;b.setAttribute('aria-label',nm+' เหลือ '+n);b.classList.toggle('empty',n<=0);}
  const hud=$('#hud');if(hud&&P){const m=hud.querySelector('.medal');if(m)m.dataset.lv=P.lvl;const f=$('#hudFold');if(f){const fo=hud.classList.contains('fold');f.dataset.g=fo?'▾':'▴';f.setAttribute('aria-label',fo?'ดูรายละเอียดสถานะ':'ซ่อนรายละเอียดสถานะ');f.setAttribute('aria-expanded',!fo);}}
  const mf=$('#menuFold');if(mf)mf.setAttribute('aria-label','พับ/กางเมนู');
  if(!foldDone&&document.body.classList.contains('mobile')){foldDone=true;try{if(localStorage.getItem('realm_fold_hud')===null&&hud)hud.classList.add('fold');}catch(e){}}
  const play=typeof G!=='undefined'&&G.state==='play'&&!!P;
  document.body.classList.toggle('hv-play',play);
  document.body.classList.toggle('hv-autoon',play&&!!G.auto);
  const ba=$('#bAuto');if(ba){ba.dataset.hl='Autoplay · '+(G.auto?'เปิด':'ปิด');}
}catch(e){}},300);
setInterval(()=>{$$('#menu .mbtn,#bar .slot.pot').forEach(b=>{if(!b.getAttribute('aria-label')&&b.title)b.setAttribute('aria-label',b.title);});},1500);

// ---------- close behaviours: outside tap, Esc ----------
document.addEventListener('pointerdown',e=>{if(!open)return;if(e.target.closest('#menu,.hv-p,.hv-b'))return;closeAll();},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&open)closeAll();});

// ---------- panel placement ----------
const place=document.createElement('style');place.textContent='body.mobile #hudMini,body.mobile #hudTray{top:calc(58px + env(safe-area-inset-top,0px));right:calc(8px + env(safe-area-inset-right,0px))}body.mobile #hudMini{width:200px}'
 +'body:not(.mobile) #hudMini,body:not(.mobile) #hudTray{right:22px;top:calc(134px + env(safe-area-inset-top,0px))}body:not(.mobile) #hudMini{width:240px}body:not(.mobile) #hudTrayBtn{right:22px;top:calc(82px + env(safe-area-inset-top,0px))}';
document.head.appendChild(place);

// ---------- TEST tray (test builds only): collapsed; holds every test/admin control ----------
if(TEST){
  btn('hudTrayBtn','เครื่องมือทดสอบ (เฉพาะบิลด์ทดสอบ)','TEST',()=>setOpen('tray'),'txt');
  const tr=mk('div',{id:'hudTray',className:'hv-p'},document.body);tr.setAttribute('role','dialog');tr.setAttribute('aria-label','เครื่องมือทดสอบ');
  tr.innerHTML='<div class="hh"><span>TEST TRAY</span><button class="x" type="button" aria-label="ปิดเครื่องมือทดสอบ">✕</button></div><div class="tag">'+TAG+'</div><div class="row" id="hudTrayRow"></div><div class="row" id="hudTrayLab"></div>';
  tr.querySelector('.x').addEventListener('click',closeAll);
  const row=$('#hudTrayRow'),lab=$('#hudTrayLab');
  const enter=mk('button',{type:'button',className:'tbtn',id:'hudEnterLab',textContent:'เข้า Sylva Lab'},row);
  enter.addEventListener('click',()=>{try{COLSLAB.enable(true);setTimeout(()=>{COLSLAB.enter();closeAll();},500);}catch(e){}});
  const mm=mk('button',{type:'button',className:'tbtn',id:'hudMiniOpen',textContent:'Minimap (NEW prototype)'},row);mm.addEventListener('click',()=>{open=null;setOpen('mini');});
  const mv=()=>{for(const id of['bEdit','bDev']){const b=$('#'+id);if(b&&b.parentElement!==row){row.appendChild(b);b.dataset.hl=id==='bEdit'?'Map Editor':'GM Console';}}
    for(const id of['slChip','slLight']){const e=$('#'+id);if(e&&e.parentElement!==lab)lab.appendChild(e);}
    enter.classList.toggle('gone',!(typeof G!=='undefined'&&G.zone!=='sylva_lab'&&window.COLSLAB));};
  setInterval(mv,500);mv();
}
window.HUDV177={build:'v177-hud-preview',test:TEST,open:()=>open,setOpen,closeAll};
})();

