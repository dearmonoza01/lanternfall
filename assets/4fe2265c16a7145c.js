
/* ---- candidate_hud_v2_r1: p259 HUD v2 skin (TEST only, visual/layout only) ---- */
/* p259 r1 — HUD v2 (charcoal + antique gold) over HUD v180. TEST candidate only: not merged, not published.
   Art: approved/hud/HANDOFF_hud_v2.md + hud_v2/*.png (DeaRz 17 Oct 2026 "ให้แชทหลักติดตั้งได้เลย"); pieces cut by tools/extract.py,
   packed by tools/build_assets.py into window.__HUD2A (p259 data).
   Visuals and layout only: no game rule, stat, item, skill or save is read-for-write here. Every handler stays on the element the game
   built; this layer only adds CSS, a few wrapper divs (the HP/MP fill elements move inside a cropping box), state classes, and the minimap
   drawing (a view of zone data that the v180 prototype already showed).
   Rules kept: art is never squashed/stretched (one uniform factor per piece; long frames were joined from their own plain rail at build
   time; fills are cropped to the current %, never scaled), no placeholder art (anything without a piece keeps its current look and is
   listed as pending), touch targets >= the v180 HUD. Debug: window.HUD2. */
(function(){'use strict';
const A=window.__HUD2A;const H2=window.HUD2={ver:'p259-r1',err:null,on:!!A,stats:{flash:0,press:0,buffs:0,mini:0},mini:{V:700}};
if(!A){H2.err='no art';return;}if(/[?&]hudv2=off\b/.test(location.search)){H2.on=false;H2.err='off by ?hudv2=off';return;}
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const u=k=>'url("'+A[k]+'")';
/* ---- bar geometry (art units of the joined bar frame: 147 tall, opening rows 47..98, caps 87 / 88 px wide at the opening) ---- */
function barCss(sel,W,H,key){const s=H/147,inL=87*s,inR=88*s,fT=45*s,fH=56*s,k=fH/62,kt=fH/57;const f=n=>n.toFixed(2)+'px';
  return `${sel}{position:relative!important;display:block!important;width:${f(W)}!important;height:${f(H)}!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:none!important;box-shadow:none!important;overflow:visible!important}
${sel}::after{content:''!important;position:absolute!important;inset:0!important;background:${u(key)} 0 0/100% 100% no-repeat!important;pointer-events:none;z-index:3!important;filter:none!important}
${sel}>.h2in{position:absolute;left:${f(inL)};top:${f(fT)};width:${f(W-inL-inR)};height:${f(fH)};overflow:hidden;background:${u('track')} ${f(-4*kt)} ${f(-4*kt)}/${f(923*kt)} ${f(68*kt)} no-repeat;z-index:1}
${sel}>.h2in>i{position:absolute!important;left:0!important;top:0!important;bottom:0!important;height:auto!important;max-width:100%!important;border-radius:0!important;box-shadow:none!important;transition:width .15s linear;background-position:${f(-5*k)} ${f(-5*k)}!important;background-size:${f(924*k)} ${f(72*k)}!important;background-repeat:no-repeat!important}
${sel}>.h2in>.h2fl{position:absolute;left:0;top:0;width:${f(923*k)};height:${f(35*k)};background:${u('flash')} ${f(-5*k)} ${f(-5*k)}/${f(923*k)} ${f(35*k)} no-repeat;opacity:0;pointer-events:none;z-index:2}
${sel} span{position:absolute!important;left:${f(inL)}!important;right:${f(inR)}!important;top:${f(fT)}!important;height:${f(fH)}!important;display:flex!important;align-items:center;justify-content:center;line-height:1!important;z-index:4!important;color:#fff;font-weight:700;text-shadow:0 0 3px #000,0 1px 1px #000;font-variant-numeric:tabular-nums;letter-spacing:0}`;}
const GOLD='#c9a24e',GOLD2='#e8cf8a',CR='#efe6cf',CH1='#262628',CH2='#141415';
const css=`
:root{--h2g:${GOLD};--h2g2:${GOLD2};--h2cr:${CR};--h2c1:${CH1};--h2c2:${CH2}}
/* ===================== shared ===================== */
#hud .bar.hp>.h2in>i{background-image:${u('fill_hp')}!important}
#hud .bar.mp>.h2in>i{background-image:${u('fill_mp')}!important}
#hud .bar.h2flash>.h2in>.h2fl{animation:h2fl .32s ease-out}
@keyframes h2fl{0%{opacity:.95}100%{opacity:0}}
#hud .medal>:is(.hmsvg,.hmglow,.hmrays){display:none!important}
#hud .medal{position:relative;filter:drop-shadow(0 3px 6px rgba(0,0,0,.6))!important}
#hud .medal::before{content:''!important;position:absolute!important;inset:0!important;background:${u('ring')} center/100% 100% no-repeat!important;z-index:4!important;pointer-events:none}
#hud .hmico{position:absolute!important;left:21.5%!important;top:21%!important;width:57%!important;height:57%!important;border-radius:50%!important;overflow:hidden;display:grid!important;place-items:center;background:radial-gradient(circle at 40% 30%,#3a3a3d,#111112)!important;z-index:1!important;filter:none!important}
#hud .hmico img{width:86%!important;height:86%!important;border-radius:22%!important;box-shadow:none!important}
#hud .chip{background:linear-gradient(180deg,${CH1},${CH2})!important;border:1px solid #8d6f33!important;color:${GOLD2}!important;border-radius:5px!important}
#hud .chip.cy{border-color:#6b6253!important;color:#ddd3bd!important}
#hud .chip.alert{background:linear-gradient(180deg,#5c2228,#2a0e12)!important;border-color:#c0504f!important;color:#ffd6d0!important}
#cGold::before{content:'';display:inline-block;width:14px;height:12px;margin:0 4px -2px 0;background:${u('it_gold')} center/contain no-repeat}
#h2Buffs{display:flex;gap:4px;flex-wrap:wrap;pointer-events:none}
#h2Buffs:empty{display:none}
#h2Buffs .h2st{position:relative;width:26px;height:26px;background:${u('stslot')} center/100% 100% no-repeat}
#h2Buffs .h2st img{position:absolute;left:16%;top:16%;width:68%;height:68%;border-radius:3px}
#h2Buffs .h2st i{position:absolute;left:16%;right:16%;bottom:16%;height:var(--h2t,0%);background:rgba(0,0,0,.55);font-style:normal}
#zoneTag{background:linear-gradient(180deg,${CH1},${CH2})!important;border:1px solid #8d6f33!important;box-shadow:0 0 0 1px #1a1106,0 4px 12px rgba(0,0,0,.5)!important}
#zoneTag b{color:${GOLD2}!important}
#log div{background:rgba(22,22,24,.86)!important;border-left-color:${GOLD}!important}
/* ---- small round buttons: v180 ring art off, HUD v2 round button frame on ---- */
.hv-b{background:${u('rb_n')} center/contain no-repeat!important;border:0!important;box-shadow:none!important;color:${CR}!important}
.hv-b::after{background:none!important}
.hv-b[aria-expanded=true]{background-image:${u('rb_rdy')}!important}
/* ---- panels (minimap dialog, test tray, mobile menu, windows): 9-slice panel ---- */
.hv-p,body.mobile #menu{border:22px solid transparent!important;border-image:${u('panel9')} 55 fill/22px/0 repeat!important;background:none!important;border-radius:0!important;box-shadow:0 10px 30px rgba(0,0,0,.6)!important;padding:4px!important}
.hv-p .hh,#hudMenuHead{color:${GOLD2}!important}
.win{border:22px solid transparent!important;border-image:${u('panel9')} 55 fill/22px/0 repeat!important;background:none!important;border-radius:0!important;box-shadow:0 24px 70px rgba(0,0,0,.65)!important}
.win header h2{color:${GOLD2}!important}
.win .x,.hv-p .x,#hudMenuHead .x{border:0!important;background:${u('x_n')} center/contain no-repeat!important;color:transparent!important;font-size:0!important;box-shadow:none!important}
.win .x:hover,.hv-p .x:hover,#hudMenuHead .x:hover{background-image:${u('x_h')}!important}
.win .x:active,.hv-p .x:active,#hudMenuHead .x:active{background-image:${u('x_p')}!important}
.hv-p .x,#hudMenuHead .x{background-size:30px!important}
#invBody .cell{background:${u('sq_n')} center/contain no-repeat!important;border-color:transparent!important;box-shadow:none!important}
#invBody .cell:hover{background-image:${u('sq_h')}!important}
.strow.h2strow{position:relative;padding-left:30px!important}
.strow.h2strow b::before{content:'';position:absolute;left:7px;top:50%;width:18px;height:18px;transform:translateY(-50%);background:var(--h2st) center/contain no-repeat}
body.mobile .strow.h2strow{padding-left:26px!important}body.mobile .strow.h2strow b::before{left:5px;width:16px;height:16px}
/* ---- skill slots (desktop bar + touch skills share the state classes) ---- */
.slot.h2s-ready{--h2fr:${u('slot_ready')}}.slot.h2s-cd{--h2fr:${u('slot_cd')}}.slot.h2s-nomp{--h2fr:${u('slot_nomp')}}.slot.h2s-press{--h2fr:${u('slot_press')}}
.slot.h2s-empty{--h2fr:${u('sq_n')}}.slot.h2s-lock{--h2fr:${u('sq_lock')}}
/* ===================== DESKTOP ===================== */
body:not(.mobile) .glb{display:none!important}
body:not(.mobile) #hud{gap:6px!important;align-items:flex-start}
body:not(.mobile) #hud .medal{width:84px!important;height:86px!important;margin:0!important;flex:none}
body:not(.mobile) #hud .hinfo{width:auto!important;margin-left:84px!important;display:flex;flex-direction:column;gap:0!important}
body:not(.mobile) #hud .hplate{justify-content:flex-start}body:not(.mobile) #hud .hplate .hpn{flex:none!important;max-width:150px}
body:not(.mobile) #hud .hplate{margin:4px 0 0 2px!important;height:auto!important;padding:0!important;background:none!important;border:0!important;box-shadow:none!important;gap:10px!important}
body:not(.mobile) #hud .hname{text-shadow:0 1px 2px #000,0 0 4px #000!important;color:${CR}!important}
body:not(.mobile) #hud .hcls{color:${GOLD}!important;text-shadow:0 1px 2px #000}
body:not(.mobile) #hud .hplate .hsep{background:linear-gradient(180deg,transparent,${GOLD},transparent)!important}
body:not(.mobile) #hud .hplate .hlv{color:${GOLD}!important;text-shadow:0 1px 2px #000}
body:not(.mobile) #hud .hplate .hlv b{color:${GOLD2}!important}
${barCss('body:not(.mobile) #hud .hinfo>.bar.hp',245,36,'barfr_d')}
${barCss('body:not(.mobile) #hud .hinfo>.bar.mp',245,36,'barfr_d')}
body:not(.mobile) #hud .hinfo>.bar.hp{margin:-2px 0 0 -6px!important}
body:not(.mobile) #hud .hinfo>.bar.mp{margin:-12px 0 0 -6px!important}
body:not(.mobile) #hud .hinfo>.bar span{font-size:11px!important}
body:not(.mobile) #hud .hinfo>.bar.xp{display:none!important}
body:not(.mobile) #h2Buffs{margin:-3px 0 2px 2px}
body:not(.mobile) #hud .hinfo>.chips{margin:2px 0 0 2px!important}
body:not(.mobile) #hudFold{width:30px!important;height:30px!important;border:0!important;border-radius:50%!important;background:${u('rb_n')} center/contain no-repeat!important;color:${CR}!important;box-shadow:none!important}
/* menu: square HUD v2 buttons */
body:not(.mobile) #menu{gap:6px!important;align-items:center}
body:not(.mobile) #menu .mbtn{position:relative;width:52px!important;height:52px!important;border:0!important;border-radius:0!important;background:${u('mb_n')} center/100% 100% no-repeat!important;box-shadow:none!important;color:${GOLD2}!important;gap:0!important}
body:not(.mobile) #menu .mbtn:hover{background-image:${u('mb_h')}!important}
body:not(.mobile) #menu .mbtn:active,body:not(.mobile) #menu .mbtn.on{background-image:${u('mb_p')}!important}
body:not(.mobile) #menu .mbtn kbd{position:absolute!important;left:0;right:0;bottom:5px;text-align:center;font-size:9px!important;color:#cdb88a!important;line-height:1}
body:not(.mobile) #menu .mbtn svg{width:20px!important;height:20px!important;margin-top:-8px}
body:not(.mobile) #menu .mbtn[data-h2i] svg{display:none!important}
#menu .mbtn[data-h2i]::before{content:'';position:absolute;left:50%;top:45%;width:26px;height:26px;transform:translate(-50%,-50%);background:var(--h2ic) center/contain no-repeat;pointer-events:none}
#menu .mbtn.h2dot::after{content:''!important;position:absolute;right:4px;top:4px;width:12px;height:12px;background:${u('ic_dot')} center/contain no-repeat;pointer-events:none}
body:not(.mobile) #menuFold{position:relative;width:44px!important;height:44px!important;border:0!important;border-radius:0!important;background:${u('mb_n')} center/100% 100% no-repeat!important;box-shadow:none!important;color:transparent!important;font-size:0!important}
body:not(.mobile) #menuFold::before{content:'';position:absolute;inset:12px;background:${u('ic_x')} center/contain no-repeat}
body:not(.mobile) #menu.fold>#menuFold::before{background-image:${u('ic_back')}}
/* dock: EXP/JOB strip + skill bar backplate (788x80, joined at build time) */
body:not(.mobile) .xpr .tr{background:#111112!important}
body:not(.mobile) .xpr.e .tr{border-color:#7a5d26!important}
body:not(.mobile) .xpr.j .tr{border-color:#4d5868!important}
body:not(.mobile) .xpr.e .tr i{background:linear-gradient(90deg,#8a6220,#d9ad52,#f3dc9a)!important}
body:not(.mobile) .xpr.j .tr i{background:linear-gradient(90deg,#3e5b80,#7fa3cc,#d3e2f2)!important}
body:not(.mobile) #bar{box-sizing:border-box;width:788px!important;height:80px!important;padding:0 24px!important;gap:6px!important;border:0!important;border-radius:0!important;background:${u('sbfr')} 0 0/100% 100% no-repeat!important;box-shadow:none!important;flex-wrap:nowrap!important}
body:not(.mobile) #bar::before{left:50%!important;top:-13px!important;width:22px!important;height:24px!important;transform:translateX(-50%)!important;background:${u('gdiamond')} center/contain no-repeat!important;border:0!important;z-index:2}
body:not(.mobile) #bar .sep{width:10px!important;height:40px!important;background:linear-gradient(180deg,transparent,#8d6f33 30%,#8d6f33 70%,transparent) center/1px 100% no-repeat!important}
body:not(.mobile) #bar .slot:not(.pot){width:54px!important;height:54px!important;flex:none;border:0!important;border-radius:0!important;background:var(--h2fr,${u('sq_n')}) center/contain no-repeat!important;box-shadow:none!important}
body:not(.mobile) #bar .slot:not(.pot) img{left:15%!important;top:15%!important;width:70%!important;height:70%!important;border-radius:4px!important}
body:not(.mobile) #bar .slot:not(.pot) .cd{inset:15%!important;border-radius:4px}
body:not(.mobile) #bar .slot kbd{left:50%!important;right:auto!important;top:auto!important;bottom:-8px!important;transform:translateX(-50%);width:26px;height:15px;line-height:15px!important;text-align:center!important;background:${u('keybadge')} center/contain no-repeat;color:${CR}!important;font-size:9px!important;font-family:inherit!important;z-index:3}
body:not(.mobile) #bar .slot .lv{right:6px!important;top:5px!important;font-size:9px}
body:not(.mobile) #bar .slot.pot{width:56px!important;height:54px!important;flex:none;border:0!important;border-radius:0!important;background:${u('potslot')} center/contain no-repeat!important;box-shadow:none!important}
body:not(.mobile) #bar .slot.pot img{left:20%!important;top:18%!important;width:60%!important;height:62%!important;border-radius:0!important;object-fit:contain}
body:not(.mobile) #bar .slot.pot[data-pot=hp] img{content:${u('it_hpPot')}}
body:not(.mobile) #bar .slot.pot[data-pot=mp] img{content:${u('it_mpPot')}}
body:not(.mobile) #bar .slot.pot .q{right:2px!important;bottom:2px!important;min-width:16px;height:15px;padding:0 3px;border-radius:8px;background:#151516;box-shadow:inset 0 0 0 1px ${GOLD};text-align:center;line-height:15px;font-size:10px!important;z-index:3}
body:not(.mobile) #autoChip{width:150px!important;height:34px!important;padding:0!important;border:0!important;border-radius:0!important;background:${u('auto_off')} center/contain no-repeat!important;box-shadow:none!important;color:#e9e0cb!important;font-size:9px!important;font-weight:700;letter-spacing:.08em!important;text-shadow:0 1px 1px #000}
body:not(.mobile) #autoChip.on{background-image:${u('auto_on')}!important;color:#2b1d07!important;text-shadow:0 1px 0 rgba(255,240,200,.5)}
@media (max-width:1000px){body:not(.mobile) #dock{zoom:.86}}
/* ===================== MOBILE ===================== */
body.mobile #hud{padding-left:66px!important;min-height:62px}
body.mobile #hud .medal{width:58px!important;height:60px!important;left:0;top:0}
body.mobile #hud .medal::after{left:-4px!important;bottom:-6px!important;width:22px!important;min-width:22px!important;height:25px!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:${u('diamond')} center/contain no-repeat!important;color:#fff7df!important;font-size:11px!important;font-weight:800;line-height:25px!important;text-shadow:0 0 2px #000,0 0 3px #000,0 1px 1px #000!important}
body.mobile #hud .hinfo{width:160px!important}
${barCss('body.mobile #hud .hinfo>.bar.hp',156,30,'barfr_m')}
${barCss('body.mobile #hud .hinfo>.bar.mp',156,30,'barfr_m')}
body.mobile #hud .hinfo>.bar.hp{margin:-3px 0 0 -6px!important}
body.mobile #hud .hinfo>.bar.mp{margin:-10px 0 0 -6px!important}
body.mobile #hud .hinfo>.bar span{font-size:10px!important}
body.mobile #h2Buffs{margin:-2px 0 0 0}
body.mobile #h2Buffs .h2st{width:22px;height:22px}
body.mobile #hudFold{left:224px!important}
body.mobile #hudFold::before{border:0!important;box-shadow:none!important;background:${u('rb_n')} center/contain no-repeat!important;color:${CR}!important}
body.mobile #hud:not(.fold) .hinfo>.bar.xp{display:none!important}
body.mobile #hud:not(.fold) .hinfo>.chips{border:0!important;box-shadow:none!important;background:rgba(20,20,22,.92)!important;outline:1px solid #8d6f33}
/* menu list rows */
body.mobile #menu .mbtn,body.mobile #menu .hv-row{position:relative;color:${CR}!important}
body.mobile #menu .mbtn[data-h2i]::before{position:static!important;transform:none!important;flex:none;width:24px;height:24px}
body.mobile #menu .mbtn[data-h2i] svg{display:none!important}
body.mobile #menu .mbtn svg,body.mobile #menu .hv-row svg{color:${GOLD}!important}
body.mobile #menu .mbtn.h2dot::after{position:absolute!important;left:22px;top:6px;right:auto;content:''!important}
body.mobile.hv-autoon #autoChip{border:0!important;background:${u('auto_on')} center/contain no-repeat!important;color:#2b1d07!important;height:26px!important;width:92px;justify-content:center;font-weight:700}
/* touch controls */
body.mobile #joyBase{background:${u('joy')} center/contain no-repeat!important;border:0!important;box-shadow:none!important}
body.mobile #joyBase::after{background:none!important}
body.mobile #joyKnob{background:${u('knob')} center/contain no-repeat!important;border:0!important;box-shadow:none!important}
body.mobile #touchUI #tAtk{background:${u('atk')} center/contain no-repeat!important}
body.mobile #touchUI #tAtk::after{background-image:none!important}
body.mobile #touchUI #tAtk[data-h2w]{color:transparent!important;text-shadow:none!important}
body.mobile #touchUI #tAtk[data-h2w]::before{content:'';position:absolute;left:24%;top:24%;width:52%;height:52%;background:var(--h2w) center/contain no-repeat;pointer-events:none;z-index:2}
body.mobile #touchUI #tAtk.hot{filter:drop-shadow(0 0 8px rgba(255,210,120,.8))}
body.mobile #touchUI #tDash{background:${u('dash')} center/contain no-repeat!important;color:transparent!important;width:58px!important;height:58px!important}
body.mobile #touchUI #tDash::before{background:none!important}
body.mobile #touchUI #tInt{background:${u('rb_n')} center/contain no-repeat!important;border:0!important;box-shadow:none!important;color:${CR}!important}
body.mobile #touchUI #tSkills .tsk{width:48px!important;height:48px!important;margin:-24px 0 0 -24px!important;background:var(--h2rb,${u('rb_n')}) center/contain no-repeat!important}
body.mobile #touchUI #tSkills .tsk::after{background-image:none!important;filter:none!important}
body.mobile #tSkills .tsk.h2s-ready{--h2rb:${u('rb_rdy')}}
body.mobile #tSkills .tsk.h2s-nomp{--h2rb:${u('rb_dis')}}
body.mobile #tSkills .tsk.h2s-press,body.mobile #tSkills .tsk.flash{--h2rb:${u('rb_rdy')};filter:brightness(1.25)}
body.mobile #tSkills .tsk img{left:19%!important;top:19%!important;width:62%!important;height:62%!important}
body.mobile #tSkills .tsk .cd{inset:19%!important}
body.mobile #hudPots .tb,body.mobile #hudPots #tHp,body.mobile #hudPots #tMp{width:58px!important;height:56px!important;background:${u('potslot')} center/contain no-repeat!important}
body.mobile #hudPots .tb::after{background-image:none!important}
body.mobile #hudPots #tHp img{content:${u('it_hpPot')}}
body.mobile #hudPots #tMp img{content:${u('it_mpPot')}}
body.mobile #hudPots .tb img{width:32px!important;height:36px!important;object-fit:contain;filter:drop-shadow(0 2px 2px rgba(0,0,0,.6))!important}
body.mobile #hudPots .tb b{background:#151516!important;box-shadow:inset 0 0 0 2px ${GOLD},0 1px 3px rgba(0,0,0,.7)!important}
body.mobile #hudxGear{background:${u('rb_n')} center/contain no-repeat!important;border:0!important;box-shadow:none!important;color:${CR}!important}
body.mobile #tPots .tb.rot{background:${u('rb_n')} center/contain no-repeat!important;border:0!important;opacity:.9}
body.mobile #tPots .tb.rot::after{background-image:none!important}
/* ===================== MINIMAP (test-build prototype ring, now HUD v2 ring + disc + markers + zoom) ===================== */
#hudMiniRing{background:${u('mm_disc')} center/88% 88% no-repeat!important;border-radius:50%}
#hudMiniRing::after{background:${u('mm_ring')} center/100% 100% no-repeat!important;inset:0!important}
#hudMiniRing>canvas:not(#h2MiniC){display:none!important}
#h2MiniC{position:absolute;left:9%;top:9%;width:82%;height:82%;border-radius:50%}
body:not(.mobile) #hudMiniRing{width:150px!important;height:150px!important;top:calc(140px + env(safe-area-inset-top,0px))!important;right:22px!important}
body.mobile #hudMiniRing{width:92px!important;height:92px!important;top:calc(58px + env(safe-area-inset-top,0px))!important;right:calc(8px + env(safe-area-inset-right,0px))!important}
#h2MiniBtns{position:fixed;z-index:9;display:none;gap:6px}
body.hv-play.hv-minion:not(.hv-menu):not(.hv-tray):not(.hv-mini) #h2MiniBtns{display:flex}
body:not(.mobile) #h2MiniBtns{flex-direction:row;top:calc(296px + env(safe-area-inset-top,0px));right:31px}
body.mobile #h2MiniBtns{flex-direction:column;top:calc(58px + env(safe-area-inset-top,0px));right:calc(106px + env(safe-area-inset-right,0px));gap:1px}
#h2MiniBtns button{position:relative;width:36px;height:36px;padding:0;border:0;background:var(--h2b) center/contain no-repeat;cursor:pointer;touch-action:manipulation}
body.mobile #h2MiniBtns button{width:30px;height:30px}
body.mobile #h2MiniBtns button::before{content:'';position:absolute;inset:-7px}
#h2MiniBtns button:disabled{cursor:default}
`;
const st=document.createElement('style');st.id='hudV2Style';st.textContent=css;document.head.appendChild(st);

/* ---------- HP / MP: the fill element moves into a cropping box (same element, so the game's width writes still land) ---------- */
function wrapBars(){for(const k of ['hp','mp']){const b=$('#hud .hinfo>.bar.'+k);if(!b||b.querySelector('.h2in'))continue;const i=b.querySelector('i');if(!i)continue;
  const box=document.createElement('div');box.className='h2in';b.insertBefore(box,b.firstChild);box.appendChild(i);const fl=document.createElement('div');fl.className='h2fl';box.appendChild(fl);}}
wrapBars();
/* buff icons in the status slots under the bars (skill buffs that have a skill icon; nothing new is drawn for anything else) */
const buffs=document.createElement('div');buffs.id='h2Buffs';buffs.setAttribute('aria-label','บัฟที่ทำงานอยู่');
{const mp=$('#hud .hinfo>.bar.mp');if(mp)mp.after(buffs);}
let bsig='';
function updBuffs(){if(typeof P==='undefined'||!P||!P.buffs)return;const ids=Object.keys(P.buffs).filter(id=>typeof SK!=='undefined'&&SK[id]&&typeof skillIcon==='function').slice(0,8);
  const s=ids.join(',');if(s!==bsig){bsig=s;buffs.innerHTML=ids.map(id=>`<div class="h2st" data-b="${id}" title="${(SK[id].name||id).replace(/"/g,'')}"><img alt="" src="${skillIcon(id)}"><i></i></div>`).join('');H2.stats.buffs=ids.length;}
  for(const el of buffs.children){const b=P.buffs[el.dataset.b];if(b&&b.max)el.querySelector('i').style.setProperty('--h2t',Math.round((1-b.t/b.max)*100)+'%');}}
/* ---------- slot states (desktop bar + touch ring): ready / cooldown / not enough MP / pressed / empty / locked ---------- */
const PRESS=new Map();
function slotState(el){if(PRESS.get(el)>performance.now())return 'press';
  const has=el.dataset.sk||el.dataset.ws;if(!has)return 'empty';
  if(el.classList.contains('wsoff'))return 'lock';
  const t=el.querySelector('.cdt');if(t&&t.textContent!=='')return 'cd';
  if(el.classList.contains('nomp'))return 'nomp';
  if(el.dataset.sk&&!el.dataset.ws&&!el.classList.contains('ready'))return 'cd';
  return 'ready';}
const ST=['ready','cd','nomp','press','empty','lock'];
function updSlots(){for(const el of $$('#bar .slot:not(.pot),#tSkills .tsk')){const s=slotState(el);if(el.dataset.h2s===s)continue;el.dataset.h2s=s;for(const k of ST)el.classList.toggle('h2s-'+k,k===s);}}
const press=el=>{if(!el)return;PRESS.set(el,performance.now()+160);H2.stats.press++;updSlots();setTimeout(updSlots,170);};
addEventListener('pointerdown',e=>{const el=e.target&&e.target.closest&&e.target.closest('#bar .slot:not(.pot),#tSkills .tsk');if(el)press(el);},true);
addEventListener('keydown',e=>{try{if(e.repeat||!e.key||(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName)))return;const i=['1','2','3','4','5','6','q','e','r','f'].indexOf(e.key.toLowerCase());if(i<0)return;press($(`#bar .slot[data-i="${i}"]`));}catch(x){}},true);
/* ---------- menu icons (only where a HUD v2 icon exists for that button) + notification dot ---------- */
const MI={M:'ic_map',K:'ic_book',I:'ic_bag',SET:'ic_gear',CAM:'ic_gear'};
function updMenu(){for(const b of $$('#menu .mbtn')){if(b.dataset.h2i)continue;const k=b.querySelector('kbd'),key=k&&k.textContent.trim();const ic=MI[key];if(!ic)continue;b.dataset.h2i=ic;b.style.setProperty('--h2ic',u(ic));}
  try{const inv=$('#menu .mbtn[data-win="wInv"]'),sk=$('#menu .mbtn[data-win="wSkill"]');if(inv)inv.classList.toggle('h2dot',!!(P&&P.statPts>0));if(sk)sk.classList.toggle('h2dot',!!(P&&P.skillPts>0));}catch(e){}}
/* ---------- stat icons in the Status panel (the six stats the game has) ---------- */
const STI={str:'st_str',agi:'st_agi',vit:'st_vit',int:'st_int',dex:'st_dex',luk:'st_luk'};
function updStats(){if(!G||G.win!=='wInv')return;for(const r of $$('#invBody .strow')){const bt=r.querySelector('button[data-stat]'),b=r.querySelector('b');if(!bt||!b||b.dataset.h2st)continue;const ic=STI[bt.dataset.stat];if(!ic)continue;b.dataset.h2st=bt.dataset.stat;r.classList.add('h2strow');r.style.setProperty('--h2st',u(ic));}}
/* ---------- attack button icon follows the equipped weapon type (sword / bow); other types keep the current glyph ---------- */
function updAtk(){const a=$('#tAtk');if(!a||!P||!P.weapon)return;const t=P.weapon.t;const w=t==='bow'?'ic_bowA':t==='sword'?'ic_swordA':'';
  if((a.dataset.h2w||'')===w)return;if(w){a.dataset.h2w=w;a.style.setProperty('--h2w',u(w));}else{delete a.dataset.h2w;a.style.removeProperty('--h2w');}}
/* ---------- HP/MP flash strip on damage / heal ---------- */
let lastHp=null,lastMp=null;
function flash(k){const b=$('#hud .hinfo>.bar.'+k);if(!b)return;b.classList.remove('h2flash');void b.offsetWidth;b.classList.add('h2flash');H2.stats.flash++;}
function updFlash(){if(!P||G.state!=='play'){lastHp=lastMp=null;return;}const h=Math.ceil(P.hp),m=Math.floor(P.mp);
  if(lastHp!==null&&Math.abs(h-lastHp)>=Math.max(1,P.maxHp*.01))flash('hp');if(lastMp!==null&&Math.abs(m-lastMp)>=Math.max(1,P.maxMp*.04))flash('mp');lastHp=h;lastMp=m;}

/* ---------- minimap: HUD v2 ring + disc + markers; + / − zoom the view, fullscreen opens the big prototype map ---------- */
const ZL=[400,700,1100];let zi=1;
const ring=$('#hudMiniRing');let mc=null,btns=null;const MK={};
for(const k of ['mk_arrow','mk_mob','mk_elite','mk_boss','mk_npc','mk_shop','mk_smith','mk_gate']){const im=new Image();im.src=A[k];MK[k]=im;}
if(ring){mc=document.createElement('canvas');mc.id='h2MiniC';mc.width=mc.height=256;mc.setAttribute('aria-hidden','true');ring.appendChild(mc);
  btns=document.createElement('div');btns.id='h2MiniBtns';document.body.appendChild(btns);
  const mk=(id,label,img,cb)=>{const b=document.createElement('button');b.type='button';b.id=id;b.setAttribute('aria-label',label);b.title=label;b.dataset.img=img;b.style.setProperty('--h2b',u(img));
    b.addEventListener('click',e=>{e.stopPropagation();cb();});b.addEventListener('pointerdown',e=>e.stopPropagation());btns.appendChild(b);return b;};
  mk('h2MiniPlus','ซูมเข้าแผนที่ย่อ','mm_plus',()=>{if(zi>0){zi--;drawMini();}});
  mk('h2MiniMinus','ซูมออกแผนที่ย่อ','mm_minus',()=>{if(zi<ZL.length-1){zi++;drawMini();}});
  mk('h2MiniFs','เปิดแผนที่ย่อแบบเต็ม','mm_fs',()=>{try{window.HUDV177&&HUDV177.setOpen('mini');}catch(e){}});}
function btnState(){if(!btns)return;const set=(id,dis,img)=>{const b=document.getElementById(id);if(!b)return;b.disabled=dis;b.style.setProperty('--h2b',u(dis?img+'_d':img));};
  set('h2MiniPlus',zi<=0,'mm_plus');set('h2MiniMinus',zi>=ZL.length-1,'mm_minus');set('h2MiniFs',!(window.HUDV177),'mm_fs');}
const npcKind=n=>{const k=String(n.kind||n.k||'').toLowerCase(),nm=String(n.n||'').toLowerCase();if(/smith|refine|anvil/.test(k+' '+nm))return 'mk_smith';if(/shop|merchant|eq|wpn|armor|item|fash|vendor|store/.test(k)||/shop|merchant/.test(nm))return 'mk_shop';return 'mk_npc';};
function drawMini(){try{if(!mc||!document.body.classList.contains('hv-minion')||G.state!=='play'||!P)return;const Z=ZONES[G.zone];if(!Z)return;
  btnState();const W=mc.width,V=ZL[zi],S=(W/2)/V,X=x=>(x-P.x)*S+W/2,Y=y=>(y-P.y)*S+W/2,g=mc.getContext('2d');H2.mini.V=V;
  g.clearRect(0,0,W,W);g.save();g.beginPath();g.arc(W/2,W/2,W/2,0,7);g.clip();
  // zone edge + ground features from the zone's own data (same data the v180 prototype drew)
  g.strokeStyle='rgba(201,162,78,.55)';g.lineWidth=2;g.strokeRect(X(0),Y(0),Z.w*S,Z.h*S);
  try{if(Array.isArray(Z.areas))for(const a of Z.areas){if(!a.safe)continue;g.beginPath();g.arc(X(a.x),Y(a.y),a.r*S,0,7);g.fillStyle='rgba(120,200,140,.14)';g.fill();}}catch(e){}
  try{if(typeof PROPS!=='undefined'&&typeof PROP_DEFS!=='undefined')for(const q of PROPS){if(Math.abs(q.x-P.x)>V*1.2||Math.abs(q.y-P.y)>V*1.2)continue;const D=PROP_DEFS[q.t];if(!D||!D.solid||!D.solid.length)continue;const sc=q.s||1,wt=q.t==='svWater';g.fillStyle=wt?'rgba(70,120,190,.55)':'rgba(170,150,110,.38)';for(const o of D.solid){g.beginPath();g.arc(X(q.x+(o.dx||0)*(wt?1:sc)),Y(q.y+(o.dy||0)*(wt?1:sc)),Math.max(1,(o.r||0)*(wt?1:sc)*S),0,7);g.fill();}}}catch(e){}
  const put=(k,x,y,sz,rot)=>{const im=MK[k];if(!im||!im.complete||!im.naturalWidth)return;const px=X(x),py=Y(y);if((px-W/2)**2+(py-W/2)**2>(W/2+sz)**2)return;const r=Math.min(sz/im.naturalWidth,sz/im.naturalHeight),w=im.naturalWidth*r,h=im.naturalHeight*r;
    g.save();g.translate(px,py);if(rot)g.rotate(rot);g.drawImage(im,-w/2,-h/2,w,h);g.restore();};
  let n=0;
  try{if(typeof GATES!=='undefined')for(const t of GATES){put('mk_gate',t.x,t.y,26);n++;}}catch(e){}
  try{if(typeof WAY!=='undefined'&&WAY){put('mk_gate',WAY.x,WAY.y,24);n++;}if(typeof NEXUS!=='undefined'&&NEXUS){put('mk_gate',NEXUS.x,NEXUS.y,24);n++;}}catch(e){}
  try{if(typeof NPCS!=='undefined')for(const q of NPCS){put(npcKind(q),q.x,q.y,22);n++;}}catch(e){}
  try{const sb=window.__P212;if(G.zone==='sylva_lab'&&sb&&sb.placed){put('mk_smith',796,652,22);n++;}}catch(e){}
  try{if(typeof enemies!=='undefined')for(const e of enemies){if(e.dead)continue;const boss=typeof sxIsBoss==='function'&&sxIsBoss(e),el=!!((e.m&&e.m.elite)||e.eliteX);put(boss?'mk_boss':el?'mk_elite':'mk_mob',e.x,e.y,boss?26:el?20:13);n++;}}catch(e){}
  put('mk_arrow',P.x,P.y,24,(P.face||0)+Math.PI/2);
  g.restore();H2.stats.mini=n;}catch(e){H2.err='mini '+e.message;}}

/* ---------- ticks ---------- */
setInterval(()=>{try{if(typeof P==='undefined'||!P)return;wrapBars();updSlots();updFlash();}catch(e){H2.err='fast '+e.message;}},120);
setInterval(()=>{try{if(typeof P==='undefined'||!P)return;updBuffs();updMenu();updStats();updAtk();}catch(e){H2.err='slow '+e.message;}},300);
setInterval(drawMini,250);
})();

