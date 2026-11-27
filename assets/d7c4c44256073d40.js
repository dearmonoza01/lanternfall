
/* ---- town-r2 (TEST, 11 Nov 2026): Astoria villagers drawn with Art's villager kit (town_kit_pieces_r1 idle + town_kit_walk_r1 walk sheets), no story/quest sprites ----
   DeaRz 11:36: the town NPCs used the main-quest NPC sprites (Ferro, Mali ...) tinted, so story NPCs looked scattered around. This replaces them.
   * all drawing is behind ONE adapter: TOWN.drawNpc(n) (a future art pack only needs to replace this function); placement, walking AI, talk bubbles of town-r1 are unchanged;
   * named Astoria NPCs use their own piece (Daren, Emma, newsboy, lamplighter, innkeeper, bard); every other villager gets a generic piece (explicit per-id table below, not random) + race parts for the JSON race (cat ears+tail, horns, elf ears, same layer rule as the hero: tail behind, elf ear under hair, cat ears / horns over hair);
   * WALKERS use the 4-frame walk sheet (frames 1/3 stride, 2/4 passing) of their piece, walk speed only; the frame is advanced by the DISTANCE actually walked (one cycle = CYCLE x body height), so the feet never slide; pauses play the idle piece; mirrored for right-facing;
   * height = hero on-screen height x height_vs_hero (man 1.0, woman .95, kid .7, elder .85); name tags smaller (10 px), lower (below the feet) and shown only near the hero;
   * the 12 main-quest NPC3Q sprites are never used here. ?town=off disables (module not active), ?town2=off keeps the r1 look. Debug: window.__TOWN2 ---- */
(function(){'use strict';
const Q=String(location.search),OFF=/[?&]town2=off\b/.test(Q),ZID='astoria_capital';
const T=window.__TOWN,ART=window.__TOWN2_ART;if(!T||!T.on||!ART||OFF)return;
const T2=window.__TOWN2={ver:'town-r2',err:null,cfg:{CYCLE:.62,NAMER:260,TAG:10},stats:{drawn:0,walkDrawn:0,missing:0}};
const ERR=(w,e)=>{T2.err=w+': '+((e&&e.message)||e);try{console.error('[TOWN2]',w,e)}catch(_){}};
T.cfg.speed=70;   // walk speed (hero walks ~130-175); frames follow the distance walked
const LOOK={ast_daren:'npc_daren_guard',ast_emma:'npc_emma',ast_newskid:'npc_newsboy',ast_lamplighter:'npc_lamplighter',ast_innkeeper:'npc_innkeeper',ast_bard:'npc_bard',
 ast_guard_n1:'man_guard',ast_guard_n2:'man_guard',ast_guard_e:'man_guard',ast_patrol1:'man_guard',ast_patrol2:'man_guard',ast_traveler_n:'woman_traveller',ast_cart_check:'man_porter',
 ast_baker:'man_merchant',ast_fruit:'woman_seller',ast_fish:'man_porter',ast_haggler1:'woman_housewife',ast_haggler2:'man_merchant',ast_mother:'woman_housewife',ast_cat_stall:'woman_seller',
 ast_demon_knife:'man_merchant',ast_couple:'woman_traveller',ast_kid_pigeon1:'kid_boy',ast_kid_pigeon2:'kid_girl_pigtails',ast_flute:'man_craftsman',ast_weapon:'man_craftsman',ast_carpenter:'man_porter',
 ast_apprentice:'kid_apprentice',ast_demon_smith:'man_craftsman',ast_laundry:'woman_housewife',ast_grandma:'elder_grandma',ast_milk:'kid_milk_girl',ast_sweeper:'elder_sweeper',ast_dog_owner:'elder_grandpa_cane',
 ast_drunk:'man_porter',ast_elf_archer:'woman_traveller',ast_farmer:'man_porter',ast_fisher:'elder_fisherman',ast_camel:'man_merchant'};
const VS=b=>/^kid_/.test(b)?.7:/^elder_/.test(b)?.85:/^woman_/.test(b)?.95:1;
const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const heroH=()=>{try{const c=window.PUPPETX&&PUPPETX.cfg;return c?c.TARGET_H*c.H_FACTOR:64}catch(_){return 64}};
const IMC={};const im=src=>{let i=IMC[src];if(i)return i;i=IMC[src]=new Image();i.decoding='async';i.src=src;return i};
const ok=i=>i&&i.complete&&i.naturalWidth>0;
/* ---- look: body piece + race parts (stable per NPC id) ---- */
function lookOf(n){if(n._lk)return n._lk;const body=LOOK[n.id]||'man_porter',h=hash(n.id),L={body,parts:[]};
  const pick=a=>a[h%a.length];
  if(n.race==='cat'){const c=pick(['black','brown','calico','cream','orange','tabby']);L.parts.push({k:'cat_tail_'+c,z:-1,at:'tail'},{k:'cat_ears_'+c,z:1,at:'ears'})}
  else if(n.race==='demon'){const kid=/^kid_/.test(body),f=kid?'child_red':pick(['ram_grey','swept_black','chipped_brown']);L.parts.push({k:'horn_'+f+'_a',z:1,at:'hornL'},{k:'horn_'+f+'_b',z:1,at:'hornR'})}
  else if(n.race==='elf'){const e=/^elder_/.test(body)?'old':pick(['light','tan','dark']);L.parts.push({k:'elf_ear_'+e,z:-1,at:'elf'})}
  return n._lk=L}
/* part anchors in the body box (bw x bh, feet at bottom-centre, art faces LEFT): [x as fraction of bw from centre, bottom y as fraction of bh above the feet] */
const AT={ears:[-.02,.86],hornL:[-.2,.86],hornR:[.17,.86],elf:[.30,.70],tail:[.40,.30]};
function drawParts(L,z,s,bh,bw){for(const p of L.parts){if(p.z!==z)continue;const a=ART.parts[p.k];if(!a)continue;const i=im(a.src);if(!ok(i))continue;const A=AT[p.at],w=a.ow*s,h=a.oh*s,x=A[0]*bw,y=-A[1]*bh;
  ctx.drawImage(i,x-w/2,p.at==='tail'?y-h*.5:y-h,w,h)}}
/* ---- the adapter ---- */
function poseMove(n,t){let rot=0,bob=0,sy=1+.005*(1+Math.sin(t*2.2));switch(n.pose){case 'hammer':rot=Math.max(0,Math.sin(t*5))*.11;bob=Math.max(0,Math.sin(t*5))*1.5;break;case 'sweep':rot=Math.sin(t*2.2)*.07;break;case 'play':bob=-Math.abs(Math.sin(t*3))*2;rot=Math.sin(t*1.5)*.03;break;case 'sleep':rot=.1+Math.sin(t*.8)*.02;sy=1+.01*Math.sin(t*.8);break}return {rot,bob,sy}}
T.drawNpc=function(n){
  const t=(typeof time==='number'?time:performance.now()/1000)+(n.ph||0),x=n.x,y=n.y;
  if(n.tk==='board'||n.race==='none'&&/ป้าย/.test(n.n)){board(n,x,y);tag(n,x,y);return}
  const L=lookOf(n),idle=ART.idle[L.body],wk=ART.walk[L.body];
  if(!idle){T2.stats.missing++;return}
  const H=heroH()*VS(L.body),s=H/idle.oh;                     // screen px per original pixel
  /* distance walked since the last drawn frame drives the walk cycle */
  if(n.lx==null){n.lx=x;n.ly=y;n.wd=0}const mv=Math.hypot(x-n.lx,y-n.ly);n.lx=x;n.ly=y;if(mv<40)n.wd=(n.wd||0)+mv;
  const walking=n.moving&&wk&&mv>.01||(n.moving&&wk&&(n._wk||0)>0);n._wk=mv>.01?.25:Math.max(0,(n._wk||0)-1/60);
  const useWalk=!!(n.moving&&wk&&(mv>.01||n._wk>0));
  let img,bw,bh,box;
  if(useWalk){const cyc=T2.cfg.CYCLE*H,fi=Math.floor((n.wd/cyc)*4)%4;img=im(wk.f[fi<0?0:fi]);bh=H;bw=wk.w*H/wk.h;T2.stats.walkDrawn++}
  else{img=im(idle.src);bh=H;bw=idle.ow*s}
  const dw=bw;ctx.save();ctx.globalAlpha*=.28;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(x,y+2,dw*.3,dw*.08,0,0,6.283);ctx.fill();ctx.restore();
  if(!ok(img)){ctx.fillStyle='#c9a46a';ctx.beginPath();ctx.arc(x,y-H*.5,10,0,6.283);ctx.fill();tag(n,x,y);return}
  let pm={rot:0,bob:0,sy:1};if(!useWalk)pm=poseMove(n,t);
  ctx.save();ctx.translate(x,y+pm.bob);ctx.rotate(pm.rot);ctx.scale(n.face>0?-1:1,pm.sy);
  const ps=useWalk?(H/idle.oh)*1:s;                                    // parts keep the idle scale (same character height)
  drawParts(L,-1,ps,bh,bw);ctx.drawImage(img,-bw/2,-bh,bw,bh);drawParts(L,1,ps,bh,bw);ctx.restore();
  T2.stats.drawn++;
  if(n.pose==='sleep'&&!useWalk){ctx.save();ctx.fillStyle='#cfe6ff';ctx.font='700 14px sans-serif';ctx.globalAlpha=.5+.4*Math.sin(t*2);ctx.fillText('z',x+14,y-H*.9-Math.sin(t)*3);ctx.restore()}
  tag(n,x,y)}
function board(n,x,y){ctx.save();ctx.translate(x,y);ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(0,2,22,6,0,0,6.283);ctx.fill();ctx.fillStyle='#5a3d22';ctx.fillRect(-18,-52,5,52);ctx.fillRect(13,-52,5,52);ctx.fillStyle='#b98c52';ctx.fillRect(-24,-70,48,38);ctx.strokeStyle='#5a3d22';ctx.lineWidth=2;ctx.strokeRect(-24,-70,48,38);ctx.fillStyle='#f1e6c8';ctx.fillRect(-18,-64,16,12);ctx.fillRect(2,-64,16,12);ctx.fillRect(-18,-48,16,10);ctx.fillRect(2,-48,16,10);ctx.restore()}
/* name tag: small, below the feet, only near the hero */
function tag(n,x,y){try{if(typeof P==='undefined'||!P||Math.hypot(P.x-x,P.y-y)>T2.cfg.NAMER)return;ctx.save();ctx.font='600 '+T2.cfg.TAG+'px "Noto Sans Thai", system-ui, sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='rgba(20,14,8,.85)';ctx.fillStyle='#efe6cf';ctx.globalAlpha=.9;ctx.strokeText(n.n,x,y+13);ctx.fillText(n.n,x,y+13);ctx.restore()}catch(_){}}
try{const _dm=drawMerchant;drawMerchant=function(n){if(n&&n.town){try{return T.drawNpc(n)}catch(e){ERR('draw',e);return}}return _dm.apply(this,arguments)}}catch(e){ERR('hook draw',e)}
console.info('[TOWN2] villager kit loaded: '+Object.keys(ART.idle).length+' idle, '+Object.keys(ART.walk).length+' walk sheets');
})();
