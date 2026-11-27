
/* ---- candidate_ruin_warden_r2: p256 Ruin Warden in the Animation & Combat Studio (TEST, Studio only) ---- */
/* p256 r2 — Ruin Warden (art review_r3, approved by DeaRz 17 Oct 2026 "ผ่านได้เลย", all 5 poses; spec art/monsters/ruin-warden-handoff.md).
   STUDIO ONLY: the sprite record has scope:'studio', so the art draws only inside the Animation & Combat Studio scene. No spawn point,
   no map, no drop/EXP table, no save change. Map 4 and the 3→4 gate are untouched.
   - Art: ruin_{idle,move,attack,hurt,death}_8dir_r3.png (MD5-checked, atlas rects = plain 256 px grid), one sheet per pose, 8 authored
     rows S,SW,W,NW,N,NE,E,SE (never mirrored), foot anchor (128,232) in every cell.
   - Size: one uniform scale for every pose/direction: 0.735 world units per art px → standing art ~170 px = ~125 units (1.6 × the hero's 78).
   - Attack: frames 1-3 are stretched over the engine wind-up, frame 4 (the smash) is the first strike frame = the engine's damage moment,
     5-6 follow-through, 7-8 recover; side locked for the whole attack (shared p182 renderer rules). No AoE / stun / knock-back added.
   - Hurt only on direct hits (no DoT), death plays once, holds frame 6, then fades (shared p182 rules).
   - Game data: untouched. 'ruinwarden' is already a Map 2 species in the game data (w22 species batch: Lv 8-10 quarry ruins, sz 32,
     speed 42, wind-up 0.7 s, drawn with the temporary engine golem shape). Its stats, AI and spawns are left exactly as they are; the
     new art only replaces the drawing, and only inside the Studio. Final stats/AI for Map 4 belong to the monster/balance teams.
   - r2 (monster review r1): name + HP bar lifted for this type only (labelLift) so the bar sits at least 8 units above the top of the
     standing art in every direction (idle art top = 56 px in the N row, the highest). Other monsters' bars are untouched.
   - The p182 renderer builds its sprite list once at load, so this module re-runs that renderer's own source for this one type only
     (no second set of engine hooks) and adds the result to MON_SPRITES; drawing, hurt and death go through the existing hooks. */
(function(){
'use strict';
const ART={"sheets": [{"src": "assets/2bd1c77babe15edd.webp", "cell": [256, 256], "anchor": [128, 232]}, {"src": "assets/478f1dc91a58c63f.webp", "cell": [256, 256], "anchor": [128, 232]}, {"src": "assets/f81c682855fde18f.webp", "cell": [256, 256], "anchor": [128, 232]}, {"src": "assets/fcfcd6744b7f4841.webp", "cell": [256, 256], "anchor": [128, 232]}, {"src": "assets/7a5ae3478bacc628.webp", "cell": [256, 256], "anchor": [128, 232]}], "files": [{"name": "ruin_idle_8dir_r3.png", "md5": "598a46dcc6d8117432631fd618d2172e", "sha256": "ecdb4216950e1d48da63150189d9e49b5b73b5ee9479947662437ae7c3e8bae5"}, {"name": "ruin_move_8dir_r3.png", "md5": "73404d2c260f83bda80abf080e4653f4", "sha256": "1a20d07c05e747726269d4bea6a80be31f58412de70abcf621bb1570238466e5"}, {"name": "ruin_attack_8dir_r3.png", "md5": "fed35be58350d1a70f878eb192ff7321", "sha256": "5ff36a4e324f9abe4cadc7f509167ab9f418fc0f1f99700612bdad4351bd111f"}, {"name": "ruin_hurt_8dir_r3.png", "md5": "214cc5a89b7deb8cc2bf383d6eb9430d", "sha256": "d9fef84bc5b64ee62e2cd98c848f6b1d79df184650eeee0a85a4dca6d0236514"}, {"name": "ruin_death_8dir_r3.png", "md5": "46b77c47926346ece96ed98da144b211", "sha256": "5994ce8713a57c1c4b14c062ec8d72ca37b7e592f3e04f6ec0ad2b55aca3ab65"}], "grounded": {"S": [0, 1, 2, 5], "SW": [1, 2, 4, 7], "W": [0, 1, 3, 5], "NW": [0, 2, 4, 6], "N": [0, 2, 4, 5], "NE": [0, 2, 5, 7], "E": [1, 2, 3, 4], "SE": [0, 2, 3, 4]}};
const DIRS=['S','SW','W','NW','N','NE','E','SE'];
const SZ=32,TARGET_H=125,ART_H=170;                 // SZ = the species' own size in the game data (sz 32); 125 units ≈ 1.6 × hero
const MOVE_MS=110;
const IDLE_TOP_PX=56,BAR_GAP=8;                     // highest opaque idle pixel row over all 8 directions (N); bar bottom must clear the head by 8 units                       // per move frame: one 8-frame cycle covers the stride measured on the art at the walk speed
const clips={};
DIRS.forEach((d,r)=>{
  clips['idle_'+d]={s:0,row:r,n:6,ms:[220,200,220,220,200,240],loop:true};
  clips['move_'+d]={s:1,row:r,n:8,ms:new Array(8).fill(MOVE_MS),loop:true,grounded:ART.grounded[d]};
  clips['atk_windup_'+d]={s:2,row:r,n:3,ms:[150,150,150],c0:0};
  clips['atk_strike_'+d]={s:2,row:r,n:3,ms:[50,50,50],c0:3};
  clips['atk_recover_'+d]={s:2,row:r,n:2,ms:[140,160],c0:6};
  clips['hurt_'+d]={s:3,row:r,n:3,ms:[80,100,120]};
  clips['death_'+d]={s:4,row:r,n:6,ms:[120,120,130,140,160,200]};});
const REC={version:'ruin-warden-8dir-review_r3-r2',target:'ruinwarden',scope:'studio',offKey:'ruinwarden',
  status:'TEST MODE — Studio only; art approved by DeaRz 17 Oct 2026, gameplay not approved',
  sheets:ART.sheets,sheet:ART.sheets[0].src,cell:[256,256],anchor:[128,232],
  hK:TARGET_H/SZ,refH:ART_H,drawK:1,barSh:'elemental',strikeWin:.15,dirs:DIRS,defDir:'S',dirHys:8,
  view:'8 authored views per pose (one sheet per pose, rows S,SW,W,NW,N,NE,E,SE); never mirrored',clips,
  slots:{attack:{status:'installed (test)',sync:'frames 1-3 wind-up stretched over the engine wind-up; frame 4 = damage moment; 5-6 strike; 7-8 recover; side locked'},
    hurt:{status:'installed (test)'},death:{status:'installed (test)',hold:.6,fade:.5}},
  source:{pack:'Ruin Warden review_r3 (Chatgpt Monster/ruin_*_8dir_r3.zip)',files:ART.files},
  labelLift:e=>{const s=e.sz||SZ,sc=s*(TARGET_H/SZ)/ART_H,head=s*.35-(232-IDLE_TOP_PX)*sc,barBottom=-s*2.4-12+6+2.5;return Math.max(0,barBottom-(head-BAR_GAP));},   // engine bar: top = y − 2.4·sz (elemental), bar y = top − 12, 6 tall, idle bob ±2.5
  size:'world idle height = 170 art px × '+(TARGET_H/ART_H).toFixed(3)+' = 125 units (hero 78)',missing:['knock-back','fall']};
const RW={rec:REC,ok:false,err:null,stats:{}};window.__RUIN_WARDEN=RW;
try{
  window.__MON_SPRITES=window.__MON_SPRITES||{};window.__MON_SPRITES.ruinwarden=REC;
  const REG=window.MON_SPRITES;if(!REG||!REG.byType)throw new Error('p182 renderer missing');
  let src=null;for(const s of document.scripts){const t=s.text;if(t&&t.indexOf('p182 (r3) — data-driven monster sprite renderer')>=0&&t.indexOf('function makeSprite(D)')>=0){src=t;break;}}
  if(!src)throw new Error('p182 source not found');
  const swap=(a,b)=>{const i=src.indexOf(a);if(i<0||src.indexOf(a,i+1)>=0)throw new Error('p182 text changed: '+a.slice(0,40));src=src.slice(0,i)+b+src.slice(i+a.length);};
  swap("const SRC=Object.assign({},window.__MON_SPRITES||{});if(window.__SLIME_CHIBI&&!SRC[window.__SLIME_CHIBI.target])SRC[window.__SLIME_CHIBI.target]=window.__SLIME_CHIBI;","const SRC={ruinwarden:window.__RUIN_WARDEN.rec};");
  swap("const REG={byType:{},list:[]};window.MON_SPRITES=REG;","const REG=window.MON_SPRITES;");
  swap("window.SLIME_CHIBI=REG.byType.slime||null;","");
  swap("m.sh=bs;SHAPES[bs]=function(e2,x,y,s,t){let ok=false;try{ok=drawBody(e2,x,s);}catch(er){if(R.stats.errors.length<20)R.stats.errors.push(String(er&&er.message||er));}if(!ok){R.stats.fallback++;fb(e2,x,y,s,t);}};",
       "const lift=D.labelLift?D.labelLift(e):0,ftOwn=Object.prototype.hasOwnProperty.call(ctx,'fillText');let rrO=null,ftO=null;"+
       "m.sh=bs;SHAPES[bs]=function(e2,x,y,s,t){let ok=false;try{ok=drawBody(e2,x,s);}catch(er){if(R.stats.errors.length<20)R.stats.errors.push(String(er&&er.message||er));}if(!ok){R.stats.fallback++;fb(e2,x,y,s,t);}"+
       "if(lift>0&&!rrO){rrO=rrect;ftO=ctx.fillText;rrect=function(a,b,c,d,r_){return rrO.call(this,a,b-lift,c,d,r_);};ctx.fillText=function(tx,a,b,mw){return mw===undefined?ftO.call(this,tx,a,b-lift):ftO.call(this,tx,a,b-lift,mw);};R.stats.labelLift=lift;}};");   // r2: everything the engine draws after the body (name, HP bar) is lifted for this type
  swap("try{return v1.apply(self,args);}finally{m.sh=orig;SHAPES[bs]=keep;if(restoreEll)restoreEll();}}",
       "try{return v1.apply(self,args);}finally{m.sh=orig;SHAPES[bs]=keep;if(restoreEll)restoreEll();if(rrO){rrect=rrO;if(ftOwn)ctx.fillText=ftO;else delete ctx.fillText;}}}");
  swap("setTimeout(()=>{try{install();}catch(er){console.warn('[p182] install',er);}},0);","");   // the hooks are already installed once by the original
  (0,eval)(src);
  RW.ok=!!REG.byType.ruinwarden;RW.R=REG.byType.ruinwarden;
}catch(er){RW.err=er.message;console.warn('[p256] Ruin Warden',er);}
})();

