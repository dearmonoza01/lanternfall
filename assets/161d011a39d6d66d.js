
/* ===== v180 HUD ART SKIN (based on v177; loaded AFTER the unchanged v177 module) — visual/layout layer only; no gameplay change.
   Reusable SVG components (data-URIs injected as CSS variables by the build): dimensional antique-gold frames, oak-leaf relief, navy enamel, teal gems.
   Re-shows the touch skill buttons that p96 hides on mobile (existing buildTouchSkills/castSkill code, unchanged). ===== */
(function(){'use strict';
const A=window.HUD_ART||{};const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const u=k=>'url("'+A[k]+'")';
const css=`
:root{${Object.keys(A).map(k=>`--c-${k}:${u(k)}`).join(';')};--en1:#22366a;--en2:#0a1228;--gold-edge:#a38744}
/* ---- enamel + frame helper: frame sits above content as a transparent-hole overlay ---- */
body.mobile .hv-fr{position:relative}
.hv-fr::after{content:'';position:absolute;inset:-13.6%;background:var(--fr) center/100% 100% no-repeat;pointer-events:none;z-index:4}
/* ---- status: portrait ring (leaf wreath + top gem), LV badge, framed bars ---- */
body.mobile #hud .medal>:is(.hmsvg,.hmglow,.hmrays){display:none!important}
body.mobile #hud{left:calc(13px + env(safe-area-inset-left,0px))}
body.mobile #hud .medal{filter:drop-shadow(0 2px 4px rgba(0,0,0,.6))}
body.mobile #hud .medal::before{content:'';position:absolute;inset:-13.6%;background:var(--c-ring_P) center/100% 100% no-repeat;z-index:4;pointer-events:none}
body.mobile #hud .hmico{position:absolute;inset:18%;border-radius:50%;overflow:hidden;display:grid;place-items:center;background:radial-gradient(circle at 40% 30%,#35508f,#0b1430);z-index:1}
body.mobile #hud .hmico img{width:84%!important;height:84%!important;border-radius:22%!important;box-shadow:none!important}
body.mobile #hud .medal::after{left:-7px;bottom:-4px;transform:none;min-width:24px;width:24px;height:24px;padding:0;border:0;border-radius:50%;background:radial-gradient(circle at 40% 30%,#22366a,#0a1228);box-shadow:inset 0 0 0 2.5px #b3994f,inset 0 0 0 4px #2a1d0a,0 1px 3px rgba(0,0,0,.7);color:#f4e8c0;font-size:11px;line-height:24px;z-index:6}
body.mobile #hud .hinfo>.bar.hp,body.mobile #hud .hinfo>.bar.mp,body.mobile #hud:not(.fold) .hinfo>.bar.xp{border:0;box-shadow:none;border-radius:5px;overflow:visible;background:#060a18;position:relative}
body.mobile #hud .hinfo>.bar.hp{height:17px;margin-bottom:2px}
body.mobile #hud .hinfo>.bar.mp{height:13px}
body.mobile #hud:not(.fold) .hinfo>.bar.xp{height:8px;margin-top:2px}
body.mobile #hud .bar>i{position:absolute;left:0;max-width:100%;top:3px;bottom:3px;border-radius:2px;box-shadow:inset 0 1px 0 rgba(255,255,255,.35),inset 0 -2px 3px rgba(0,0,0,.25)}
body.mobile #hud .bar.xp>i{top:2px;bottom:2px;background:linear-gradient(180deg,#f0d27a,#a47a22)}
body.mobile #hud .bar.xp.job>i{background:linear-gradient(180deg,#9fe0ff,#2a7fb4)}
body.mobile #hud .bar.hp::after{content:'';position:absolute;inset:0;background:var(--c-bar_hp) center/100% 100% no-repeat;pointer-events:none;z-index:2}
body.mobile #hud .bar.mp::after{content:'';position:absolute;inset:0;background:var(--c-bar_mp) center/100% 100% no-repeat;pointer-events:none;z-index:2}
body.mobile #hud .bar.xp::after{content:'';position:absolute;inset:0;background:var(--c-bar_xp) center/100% 100% no-repeat;pointer-events:none;z-index:2}
body.mobile #hud .bar span{z-index:3;font-size:10px;line-height:17px}
body.mobile #hud .bar.mp span{font-size:9px;line-height:13px}
body.mobile #hud .hname{text-shadow:0 1px 2px #000,0 0 4px #000}
body.mobile #hud:not(.fold) .hinfo>.chips{background:linear-gradient(180deg,#16244a,#0a1228);border:2px solid transparent;border-radius:8px;background-clip:padding-box;box-shadow:0 0 0 1.5px #8d7236,0 0 0 3px #1a1106,0 4px 10px rgba(0,0,0,.5)}
body.mobile #hudFold{left:199px!important}
body.mobile #hudFold::before{width:22px;height:22px;left:11px;top:11px;border:0;background:radial-gradient(circle at 40% 30%,#22366a,#0a1228);box-shadow:inset 0 0 0 2.5px #b3994f,inset 0 0 0 4px #2a1d0a;line-height:22px}
/* ---- top-right buttons (☰, TEST) ---- */
.hv-b{width:48px;height:48px;border:4px solid transparent;background:radial-gradient(circle at 45% 30%,var(--en1),var(--en2) 75%);background-clip:padding-box;box-shadow:none;position:fixed}
.hv-b::after{content:'';position:absolute;inset:-13.6%;background:var(--c-ring_M) center/100% 100% no-repeat;pointer-events:none}
.hv-b[aria-expanded=true]{background-image:radial-gradient(circle at 45% 30%,#34509a,#101c40 75%)}
.hv-b.txt{border-radius:50%;font-size:8.5px;letter-spacing:.04em}
body.mobile #hudMenuBtn{top:calc(5px + env(safe-area-inset-top,0px));right:calc(5px + env(safe-area-inset-right,0px))}
body.mobile #hudTrayBtn{top:calc(5px + env(safe-area-inset-top,0px));right:calc(56px + env(safe-area-inset-right,0px))}
body.mobile #menu,body.mobile #menu.fold{top:calc(60px + env(safe-area-inset-top,0px))}
body.mobile.hv-autoon #autoChip{top:calc(62px + env(safe-area-inset-top,0px))}
/* ---- panels: gold-gradient edge, navy enamel, corner ornaments ---- */
.hv-p,body.mobile #menu{border:2px solid transparent!important;border-radius:12px!important;background:var(--c-corner_tl) 0 0/26px no-repeat,var(--c-corner_tr) 100% 0/26px no-repeat,var(--c-corner_br) 100% 100%/26px no-repeat,var(--c-corner_bl) 0 100%/26px no-repeat,linear-gradient(180deg,#16244a,#0a1228) padding-box,linear-gradient(135deg,#d9c48f,#8b6f33 50%,#e0cc98) border-box!important;box-shadow:0 0 0 1.5px #1a1106,0 10px 30px rgba(0,0,0,.65)!important}
/* ---- touch controls: one component family ---- */
body.mobile #touchUI :is(#tAtk,#tDash,.tsk),body.mobile #hudPots .tb,body.mobile #tPots .tb.rot{border:0!important;box-shadow:none!important;overflow:visible!important;border-radius:50%!important;background:radial-gradient(circle at 45% 30%,var(--en1),var(--en2) 75%)!important}
body.mobile #touchUI #tAtk::after,body.mobile #touchUI .tsk::after,body.mobile #hudPots .tb::after,body.mobile #tPots .tb.rot::after{content:'';position:absolute;inset:-13.6%;background:center/100% 100% no-repeat;pointer-events:none;z-index:4}
body.mobile #touchUI #tAtk::after{background-image:var(--c-ring_L)}
body.mobile #touchUI .tsk::after{background-image:var(--c-ring_K)}
body.mobile #hudPots .tb::after{background-image:var(--c-ring_M)}
body.mobile #tPots .tb.rot::after{background-image:var(--c-ring_S)}
/* dash keeps its cooldown ::after; its frame goes on ::before */
body.mobile #touchUI #tDash::before{content:'';position:absolute;inset:-13.6%;background:var(--c-ring_M) center/100% 100% no-repeat;pointer-events:none;z-index:4}
body.mobile #touchUI #tDash::after{inset:12%;border-radius:50%;z-index:3}
body.mobile #touchUI #tAtk{font-size:38px;color:#f3e6bf;text-shadow:0 0 6px rgba(120,220,210,.5),0 1px 2px #000}
body.mobile #touchUI #tAtk.hot::after{filter:drop-shadow(0 0 6px rgba(255,210,120,.9))}
body.mobile #touchUI #tDash{width:56px;height:56px;color:#f3e6bf;font-size:20px;right:calc(158px + env(safe-area-inset-right,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px))}
body.mobile #hudPots .tb{width:56px;height:56px}
body.mobile #hudPots #tHp{background:radial-gradient(circle at 45% 30%,#7a2a40,#1c0a12 75%)!important}
body.mobile #hudPots #tMp{background:radial-gradient(circle at 45% 30%,#245aa8,#0a1226 75%)!important}
body.mobile #hudPots .tb img{width:36px;height:36px;filter:drop-shadow(0 2px 2px rgba(0,0,0,.6));position:relative;z-index:2}
body.mobile #hudPots .tb b{z-index:6;right:-5px;bottom:-5px;min-width:22px;height:22px;line-height:20px;border:0;background:radial-gradient(circle at 40% 30%,#22366a,#0a1228);box-shadow:inset 0 0 0 2px #b3994f,0 1px 3px rgba(0,0,0,.7);font-size:12px}
body.mobile #hudPots .tb::before{top:-17px;z-index:5}
body.mobile #tPots .tb.rot{width:34px;height:34px;border:5px solid transparent!important;background-clip:padding-box;opacity:.85}
body.mobile #tPots{gap:14px;left:calc(14px + env(safe-area-inset-left,0px));bottom:calc(8px + env(safe-area-inset-bottom,0px))}
@media (orientation:landscape) and (max-height:520px){body.mobile #tPots{left:50%;transform:translateX(-50%);bottom:calc(6px + env(safe-area-inset-bottom,0px))}}
/* joystick */
body.mobile #joyBase{border:0;background:radial-gradient(circle,rgba(22,36,74,.35),rgba(6,10,24,.55) 70%);box-shadow:none;overflow:visible}
body.mobile #joyBase::after{content:'';position:absolute;inset:-12px;background:var(--c-joy_base) center/100% 100% no-repeat;pointer-events:none}
body.mobile #joyKnob{border:0;box-shadow:none;background:var(--c-joy_knob) center/100% 100% no-repeat}
/* skills: all 8 slots, two arcs; positions set in JS; empty slots are not drawn */
body.mobile.hv-play #tSkills{display:block!important}
body.mobile #tSkills .tsk{width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%}
body.mobile #tSkills .tsk:not([data-sk]){display:none}
body.mobile #tSkills .tsk::before{content:'';position:absolute;inset:-3px;border-radius:50%}
body.mobile #tSkills .tsk img{inset:16%;width:68%;height:68%;border-radius:50%;filter:drop-shadow(0 1px 1px rgba(0,0,0,.7));z-index:2}
body.mobile #tSkills .tsk .cd{inset:16%;border-radius:50%;z-index:3}
body.mobile #tSkills .tsk .cdt{z-index:5;font-size:13px}
body.mobile #tSkills .tsk kbd{display:none}
body.mobile #tSkills .tsk.nomp img{filter:grayscale(.7) brightness(.6)}
body.mobile #tSkills .tsk.ready::after{filter:drop-shadow(0 0 2px rgba(94,240,224,.45))}
@media (max-height:520px){body.mobile #tSkills .tsk{width:46px;height:46px;margin:-23px 0 0 -23px}}
`;
const st=document.createElement('style');st.id='hudV178Style';st.textContent=css;document.head.appendChild(st);

// ---------- skill layout: two arcs around the attack button (hit areas 52px, never overlapping) ----------
const ARC=[[88,172],[88,136],[88,100],[88,64],[142,156],[142,133.5],[142,111],[142,88.5]];
function layoutSkills(){const box=$('#tSkills');if(!box)return;
  $$('#tSkills .tsk').forEach(e=>{const i=+e.dataset.ti;if(!(i>=0&&i<8))return;if(window.SKPAGE219&&SKPAGE219.on&&document.body.classList.contains('mobile'))return;/* r219: the page layout owns the positions */const [r,d]=ARC[i],a=d*Math.PI/180;e.style.left=(Math.cos(a)*r).toFixed(1)+'px';e.style.top=(-Math.sin(a)*r).toFixed(1)+'px';
    const id=(typeof P!=='undefined'&&P&&P.slots)?P.slots[i]:null;e.setAttribute('role','button');if(id&&typeof SK!=='undefined'&&SK[id])e.setAttribute('aria-label',(SK[id].name||id)+' · ช่อง '+(i+1));});}
let sig='';
setInterval(()=>{try{if(typeof P==='undefined'||!P||!P.slots||typeof buildTouchSkills!=='function')return;const s=P.slots.join(',');
  if(s!==sig||!$('#tSkills .tsk')){sig=s;buildTouchSkills();}layoutSkills();}catch(e){}},400);

// ---------- minimap ring (optional prototype; test builds only) ----------
if(window.HUD_TEST_BUILD===true){
  const ring=document.createElement('button');ring.id='hudMiniRing';ring.type='button';ring.setAttribute('aria-label','แผนที่ย่อ (ต้นแบบ) — แตะเพื่อขยาย');
  ring.innerHTML='<canvas width="120" height="120" aria-hidden="true"></canvas>';document.body.appendChild(ring);
  const s2=document.createElement('style');s2.textContent=`
#hudMiniRing{position:fixed;z-index:9;display:none;width:64px;height:64px;padding:0;border:0;background:#13281a;border-radius:50%;cursor:pointer;touch-action:manipulation;top:calc(112px + env(safe-area-inset-top,0px));right:calc(12px + env(safe-area-inset-right,0px))}
#hudMiniRing::before{content:'';position:absolute;inset:-6px;border-radius:50%}
#hudMiniRing::after{content:'';position:absolute;inset:-13.6%;background:var(--c-ring_mini) center/100% 100% no-repeat;pointer-events:none}
#hudMiniRing canvas{position:absolute;inset:18%;width:64%;height:64%;border-radius:50%}
body.hv-play.hv-minion #hudMiniRing{display:block}
body.hv-menu #hudMiniRing,body.hv-tray #hudMiniRing,body.hv-mini #hudMiniRing{display:none}
body:not(.mobile) #hudMiniRing{top:calc(150px + env(safe-area-inset-top,0px));right:26px}`;document.head.appendChild(s2);
  ring.addEventListener('click',e=>{e.stopPropagation();window.HUDV177&&HUDV177.setOpen('mini');});
  const mo=document.getElementById('hudMiniOpen');if(mo){mo.textContent='Minimap ring (NEW prototype)';mo.addEventListener('click',e=>{e.stopImmediatePropagation();document.body.classList.toggle('hv-minion');window.HUDV177&&HUDV177.closeAll();},true);}
  // small live view: draws a window of the real zone data around the player (re-uses the prototype's own data; no art)
  setInterval(()=>{try{if(!document.body.classList.contains('hv-minion'))return;const Z=ZONES[G.zone];if(!Z)return;const c=ring.querySelector('canvas'),g=c.getContext('2d'),W=c.width,V=700;const S=W/V,X=x=>(x-P.x)*S+W/2,Y=y=>(y-P.y)*S+W/2;
    g.fillStyle='#16233f';g.fillRect(0,0,W,W);
    try{if(typeof PROPS!=='undefined'&&typeof PROP_DEFS!=='undefined')for(const q of PROPS){if(Math.abs(q.x-P.x)>V||Math.abs(q.y-P.y)>V)continue;const D=PROP_DEFS[q.t];if(!D||!D.solid||!D.solid.length)continue;const sc=q.s||1,wt=q.t==='svWater';g.fillStyle=wt?'rgba(60,130,210,.6)':'rgba(190,170,130,.55)';for(const o of D.solid){g.beginPath();g.arc(X(q.x+(o.dx||0)*(wt?1:sc)),Y(q.y+(o.dy||0)*(wt?1:sc)),Math.max(1,(o.r||0)*(wt?1:sc)*S),0,7);g.fill();}}}catch(e){}
    g.fillStyle='#b98cff';if(typeof GATES!=='undefined')for(const t of GATES){g.beginPath();g.arc(X(t.x),Y(t.y),3,0,7);g.fill();}
    g.fillStyle='#e0526f';if(typeof enemies!=='undefined')for(const e of enemies){if(e.dead)continue;g.beginPath();g.arc(X(e.x),Y(e.y),2.5,0,7);g.fill();}
    g.fillStyle='#fff';g.beginPath();g.arc(W/2,W/2,4,0,7);g.fill();}catch(e){}},300);
}
window.HUDV178={build:'v180-hud-art',arc:ARC,layoutSkills};
})();

