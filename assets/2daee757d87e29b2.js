
/* ---- candidate_balance_v1_r23: p268 Mistling in the Animation & Combat Studio (TEST, Studio only) ---- */
/* p268 r1 — Mistling art (APPROVED by DeaRz 18 Oct 2026 15:08 "okผ่าน", all poses; spec art/monsters/mistling/mistling-handoff.md).
   STUDIO ONLY: the 'mistling' record (MOBS / MOBX) is added only when the Studio opens (the page reloads when the Studio closes), and the
   sprite record has scope:'studio'. No spawn point, no map zone, no change to any other monster, the slime, stats formulas or the save.
   - Art: idle drift_r2, move NW_r3, attack/hurt/death r1 (MD5-checked). Sheets A (S,SW,W,NW) + B (N,NE,E,SE) joined into one sheet per
     pose; every cell used exactly as its atlas.json rect (no recentre, no per-frame scale, never mirrored); one uniform scale (cell 256 -> 128).
     Ground point (128,240) of the atlas; the body floats above it as drawn.
   - Size: standing mist top = 40 world units above the ground (about the hero's waist, hero 78); shadow small and faint (floating).
   - Attack: frames 1-3 stretched over the engine wind-up, frame 4 = the engine's damage moment, 5-6 follow-through, 7-8 recover; side
     locked for the whole attack. Hurt only on direct hits (no DoT). Death plays once, holds frame 6, then fades (shared p182 rules).
   - Name + HP bar lifted so the bar clears the top of the mist by 8 units.
   - Combat numbers in the Studio come from the engine's normal level formula (makeEnemy) with Studio-only TEST values sz 16, speed 100;
     the balance team sets real values before Mistling is placed on any map. */
(function(){
'use strict';
const ART=/* art data (5 WebP sheets) is in the patch */ {"sheets":[{"src":"assets/53601fa249c0aad5.webp","cell":[128,128],"anchor":[64.0,120.0]},{"src":"assets/393f6049ea44e2e9.webp","cell":[128,128],"anchor":[64.0,120.0]},{"src":"assets/6b21d49e795cb91b.webp","cell":[128,128],"anchor":[64.0,120.0]},{"src":"assets/4eca10617a74d825.webp","cell":[128,128],"anchor":[64.0,120.0]},{"src":"assets/6a7568f45d7a67a9.webp","cell":[128,128],"anchor":[64.0,120.0]}],"files":[{"zip":"mistling_idle_AB_drift_r2.zip","md5":"4f09f3f0089631574a62631067d172d8"},{"zip":"mistling_move_AB_NW_r3.zip","md5":"b53b1778bdb3c3970746e76eaada4ca5"},{"zip":"mistling_attack_AB.zip","md5":"6a49cbd18115d1f121df1445e811fb76"},{"zip":"mistling_hurt_AB.zip","md5":"b59182acdf2b978ac6091e8769388e8b"},{"zip":"mistling_death_AB.zip","md5":"4f5891193f7d54448fe80da13692956f"}],"K":0.5,"cell":[128,128],"anchor":[64.0,120.0],"idleTopSrc":70,"idleTop":35.0,"refPx":85.0};
const DIRS=['S','SW','W','NW','N','NE','E','SE'];
const TYPE='mistling',SZ=16,UNITS=40,BAR_GAP=8,SHADOW_R=.55,SHADOW_A=.45;
const MOB={n:'Mistling',sh:'wisp',c:'#cfe3ee',c2:'#5f7f98',sz:SZ,sp:100};
const MS=window.__MISTLING={ok:false,err:null,registered:false,R:null,art:{files:ART.files,K:ART.K,refPx:ART.refPx}};
function register(){if(MS.registered)return;try{if(typeof MOBS!=='undefined'&&!MOBS[TYPE])MOBS[TYPE]=Object.assign({},MOB);}catch(_){}
  try{if(typeof MOBX!=='undefined'&&!MOBX[TYPE])MOBX[TYPE]=['formless','water'];}catch(_){}MS.registered=true;}
function record(){
  const AN=ART.anchor,refH=ART.refPx,hK=UNITS/SZ,clips={};
  DIRS.forEach((d,r)=>{
    clips['idle_'+d]={s:0,row:r,n:6,ms:[170,160,170,170,160,180],loop:true};
    clips['move_'+d]={s:1,row:r,n:8,ms:new Array(8).fill(85),loop:true};
    clips['atk_windup_'+d]={s:2,row:r,n:3,ms:[120,120,120],c0:0};
    clips['atk_strike_'+d]={s:2,row:r,n:3,ms:[50,50,50],c0:3};
    clips['atk_recover_'+d]={s:2,row:r,n:2,ms:[130,150],c0:6};
    clips['hurt_'+d]={s:3,row:r,n:3,ms:[80,100,120]};
    clips['death_'+d]={s:4,row:r,n:6,ms:[110,110,120,130,150,200]};});
  return {version:'mistling-r1',target:TYPE,scope:'studio',offKey:TYPE,
    status:'TEST MODE — Studio only; art approved by DeaRz 18 Oct 2026, gameplay not approved',
    sheets:ART.sheets,sheet:ART.sheets[0].src,cell:ART.cell,anchor:AN,hK,refH,drawK:1,barSh:'elemental',strikeWin:.15,dirs:DIRS,defDir:'S',dirHys:8,
    view:'8 authored views per pose (rows S,SW,W,NW,N,NE,E,SE); never mirrored',clips,
    slots:{attack:{status:'installed (test)',sync:'frames 1-3 wind-up stretched over the engine wind-up; frame 4 = damage moment; 5-6 strike; 7-8 recover; side locked'},
      hurt:{status:'installed (test)'},death:{status:'installed (test)',hold:.6,fade:.5}},
    source:{pack:'Mistling (Chatgpt Monster/mistling_* zips)',files:ART.files,K:ART.K},
    labelLift:e=>{const s=e.sz||SZ,sc=s*hK/refH,head=s*.35-(AN[1]-ART.idleTop)*sc,barBottom=-s*2.4-12+6+2.5;return Math.max(0,barBottom-(head-BAR_GAP));},
    size:'Mistling: '+UNITS+' world units = '+refH+' art px at sz '+SZ,missing:['knock-back','fall']};}
try{
  const REC=record(),RECS={};RECS[TYPE]=REC;MS.rec=REC;
  window.__MON_SPRITES=window.__MON_SPRITES||{};window.__MON_SPRITES[TYPE]=REC;
  const REG=window.MON_SPRITES;if(!REG||!REG.byType)throw new Error('p182 renderer missing');
  let src=null;for(const s of document.scripts){const t=s.text;if(t&&t.indexOf('p182 (r3) — data-driven monster sprite renderer')>=0&&t.indexOf('function makeSprite(D)')>=0){src=t;break;}}
  if(!src)throw new Error('p182 source not found');
  const swap=(a,b)=>{const i=src.indexOf(a);if(i<0||src.indexOf(a,i+1)>=0)throw new Error('p182 text changed: '+a.slice(0,40));src=src.slice(0,i)+b+src.slice(i+a.length);};
  window.__MISTLING_RECS=RECS;
  swap("const SRC=Object.assign({},window.__MON_SPRITES||{});if(window.__SLIME_CHIBI&&!SRC[window.__SLIME_CHIBI.target])SRC[window.__SLIME_CHIBI.target]=window.__SLIME_CHIBI;","const SRC=Object.assign({},window.__MISTLING_RECS);");
  swap("const REG={byType:{},list:[]};window.MON_SPRITES=REG;","const REG=window.MON_SPRITES;");
  swap("window.SLIME_CHIBI=REG.byType.slime||null;","");
  // name + HP bar lift (as p257) and a smaller, fainter engine shadow for this floating type
  swap("m.sh=bs;SHAPES[bs]=function(e2,x,y,s,t){let ok=false;try{ok=drawBody(e2,x,s);}catch(er){if(R.stats.errors.length<20)R.stats.errors.push(String(er&&er.message||er));}if(!ok){R.stats.fallback++;fb(e2,x,y,s,t);}};",
       "const lift=D.labelLift?D.labelLift(e):0,ftOwn=Object.prototype.hasOwnProperty.call(ctx,'fillText');let rrO=null,ftO=null;"+
       "m.sh=bs;SHAPES[bs]=function(e2,x,y,s,t){let ok=false;try{ok=drawBody(e2,x,s);}catch(er){if(R.stats.errors.length<20)R.stats.errors.push(String(er&&er.message||er));}if(!ok){R.stats.fallback++;fb(e2,x,y,s,t);}"+
       "if(lift>0&&!rrO){rrO=rrect;ftO=ctx.fillText;rrect=function(a,b,c,d,r_){return rrO.call(this,a,b-lift,c,d,r_);};ctx.fillText=function(tx,a,b,mw){return mw===undefined?ftO.call(this,tx,a,b-lift):ftO.call(this,tx,a,b-lift,mw);};R.stats.labelLift=lift;}};");
  swap("if(CFG.drawK!==1&&typeof ell==='function'){const _ell=ell,fy=e.y+e.sz*.35;let done=false;\n    ell=function(x,y,rx,ry,col,a){if(!done&&x===e.x&&Math.abs(y-fy)<1e-6&&col==='#000000'){done=true;R.stats.shadowScaled=(R.stats.shadowScaled||0)+1;return _ell(x,y,rx*CFG.drawK,ry*CFG.drawK,col,a);}return _ell.apply(this,arguments);};",
       "if(typeof ell==='function'){const _ell=ell,fy=e.y+e.sz*.35;let done=false;\n    ell=function(x,y,rx,ry,col,a){if(!done&&x===e.x&&Math.abs(y-fy)<1e-6&&col==='#000000'){done=true;R.stats.shadowScaled=(R.stats.shadowScaled||0)+1;return _ell(x,y,rx*CFG.drawK*"+SHADOW_R+",ry*CFG.drawK*"+SHADOW_R+",col,a*"+SHADOW_A+");}return _ell.apply(this,arguments);};");
  swap("try{return v1.apply(self,args);}finally{m.sh=orig;SHAPES[bs]=keep;if(restoreEll)restoreEll();}}",
       "try{return v1.apply(self,args);}finally{m.sh=orig;SHAPES[bs]=keep;if(restoreEll)restoreEll();if(rrO){rrect=rrO;if(ftOwn)ctx.fillText=ftO;else delete ctx.fillText;}}}");
  swap("try{ell(g.x,ay,s*.95*CFG.drawK,s*.32*CFG.drawK,'#000000',.4*a);}catch(_){}","try{ell(g.x,ay,s*.95*CFG.drawK*"+SHADOW_R+",s*.32*CFG.drawK*"+SHADOW_R+",'#000000',.4*a*"+SHADOW_A+");}catch(_){}");
  swap("setTimeout(()=>{try{install();}catch(er){console.warn('[p182] install',er);}},0);","");   // the hooks are already installed once by the original
  (0,eval)(src);
  MS.R=REG.byType[TYPE];MS.ok=!!MS.R;
}catch(er){MS.err=er.message;console.warn('[p268] mistling',er);}
/* register the Studio-only MOBS record when the Studio opens (both menu buttons and STUDIO.enter); never outside the Studio */
try{
  document.addEventListener('click',ev=>{const t=ev.target&&ev.target.closest&&ev.target.closest('#stuOpenA,#stuOpenB');if(t)register();},true);
  const hook=()=>{const S=window.STUDIO;if(!S||!S.enter||S.enter.__p268)return false;const o=S.enter;S.enter=function(){register();return o.apply(this,arguments);};S.enter.__p268=1;return true;};
  if(!hook()){let n=0;const iv=setInterval(()=>{if(hook()||++n>200)clearInterval(iv);},50);}
  MS.pick=()=>{register();const S=window.STUDIO;if(!S||!S.on)return false;S.mobType=TYPE;S.mobLv=S.mobLv||10;S.subject='mob';S.stTarget='mob';S.spawnMob();try{S.paint(true);}catch(_){}return true;};
}catch(er){MS.hookErr=er.message;}
})();

