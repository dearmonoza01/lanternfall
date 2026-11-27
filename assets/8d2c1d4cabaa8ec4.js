
/* ---- TEST ch2 r1: p328 Maddened Veilwater Serpent sprites (Map 5 chapter-2 boss + Animation & Combat Studio) ---- */
/* p328 r1 — art APPROVED by DeaRz 29 Oct 2026 (concepts serpent_A_r2 / serpent_B_r1 10:24, sprite sheets "ใช้อันเดิมได้เลย" 11:03);
   files art/veilwater-pass/serpent_sprites_r1/: idle_A_r1, idle_B_r2, move_A_r1, move_B_r2, attack_A_r1, attack_B_r1, hurt_A_r1, hurt_B_r1,
   death_A_r1, death_B_r1 (MD5 in ART.files). 248 frames, 8 authored views (A rows S,SW,W,NW · B rows N,NE,E,SE), never mirrored.
   - Cut: frames split by shape (alpha>160 cores grown inside the body: some cells touch), orange matte on soft edges replaced by the
     neighbouring body colour, alpha thresholded to 0/255. Each frame stands on its own foot line (lowest body row) with the bottom of the
     coil centred on the anchor, so the coil does not drift.
   - Size: one scale per pose so every pose matches the idle size; raised head = 172 world units (2.2x the 78-unit hero), refH 200 art px.
   - Attack: frames 1-3 stretched over the engine wind-up, frame 4 = the bite (damage moment), 5-6 follow-through, 7-8 recover.
   - Death: plays once, holds frame 6, fades; the black shard's smoke is drawn by p327 (chapter 2) on the kill.
   - p330 (30 Oct): skill poses spit/roar/tailsweep/charge/slam/dive/emerge from art/veilwater-pass/serpent_skills_r1/approved
     (DeaRz "ผ่าน" 30 Oct 06:36), cut by alpha groups, defringed, each half (A/B) scaled so frame 1 matches the idle size (MD5 in ART.skFiles).
   - Scope: everywhere the 'veilwater_serpent' type exists (only the chapter-2 quest spawns it; the Studio lists it). ?veilwater_serpent=off */
(function(){
'use strict';
const ART={"sheets":[{"src":"assets/9174478c36fc3463.webp","cell":[227,214],"anchor":[113.9,209.8]},{"src":"assets/f67feba044ecf6e1.webp","cell":[272,221],"anchor":[122.3,216.2]},{"src":"assets/145d9569e2cd00bc.webp","cell":[284,217],"anchor":[138.7,212.6]},{"src":"assets/b35452f108315b8a.webp","cell":[235,218],"anchor":[121.6,214.0]},{"src":"assets/b50ca4fb3c0d501f.webp","cell":[227,211],"anchor":[114.4,206.5]},{"src":"assets/dad1fea7db326461.webp","cell":[240,226],"anchor":[107.8,221.8]},{"src":"assets/fa6cb2edbf8ab614.webp","cell":[225,222],"anchor":[109.9,217.2]},{"src":"assets/0067768b09b036f7.webp","cell":[346,232],"anchor":[162.4,227.5]},{"src":"assets/003e47e2f314be5b.webp","cell":[436,210],"anchor":[211.3,205.1]},{"src":"assets/9672c90ea943cf7d.webp","cell":[281,240],"anchor":[138.0,235.3]},{"src":"assets/fb26f26d6e8e58cd.webp","cell":[234,211],"anchor":[110.0,206.7]},{"src":"assets/6dad6e8bc65e27fe.webp","cell":[257,271],"anchor":[128.5,266.0]}],"skFiles":{"V1_beam_r1":"1ac2f9157e8dd2893862717db3547b0b","V2_droplets_r1":"16d244f8495a9966d1e3c6a136b21f58","V3_geyser_r1":"048358613a08aa0042919fae9d07da14","V4_whirlpool_r1":"0a23b0ca2899cbaf7ff94e120fccac9e","V5_ripple_crown_r1":"74c51a7a6642ef16440b17d9d9059c28","V6_splash_trail_ring_r1":"d6c2f9b3670fa5ea57031d8cac33d2c5","V6b_tail_arc_r1":"eb91b854b4021bc6277504a410b51de2","V7_purple_smoke_r1":"04093d6bdca41f590e6015f446ef3ae4","charge_A_r1":"2874f2b3a292dcc4edd9ed08e7e5d8cb","charge_B_r1":"ed644709c2c10083415419c87f993173","dive_A_r1":"bb0e066f5a41b5d15f22957594a44856","dive_B_r1":"edc5230e8ab9addb41e4a8dd75cb4e91","emerge_A_r1":"15211e92291ba2fca4fa0e64ed4cd819","emerge_B_r1":"2625b70886be84779ca7c05ab5011cb4","roar_A_r1":"f62a63d879b7e570f71f0a384c6d5d52","roar_B_r1":"5d86f5f742d8d9e2f267d62b1b03fe72","slam_A_r2":"df866acf7e5313c5e2985b8edf06a32f","slam_B_r2":"51b2ae0b399099e7c00a6206eb93f42a","spit_A_r1":"0ccf17279c8a86fc5c306804a75a2b4e","spit_B_r1":"de16d3171134fb9881a663cda6faa8be","tailsweep_A_r2":"b0aa3d01737c7f47290d96a85c5de751","tailsweep_B_r1b":"2bab9f8dbdf49dd0c58ebe457cd1f087"},"files":{"idle_A_r1":"f76f6d17f6112d403bda7f2d21ed58a8","idle_B_r2":"2a73782339ef7e6be045928931e6d12c","move_A_r1":"a5d0a8a9bace85f64ddea827b84dfb42","move_B_r2":"610f10a167ce34136201be0655a73970","attack_A_r1":"2c2a4b482f4a28e1e871ee0ae22fa103","attack_B_r1":"92d8466309d04715bbb305291a2ee646","hurt_A_r1":"ddc3bafe6174728bf95c79196abe78fb","hurt_B_r1":"e799811359fd16e41e97159923d900da","death_A_r1":"d3e0036250b42605427aa5948a304c6d","death_B_r1":"1d105f651dabf1bb32f2a840601722d9"},"refPx":200.0,"k":[0.8299,0.9644,0.9748,0.5915,0.8198]};
const DIRS=['S','SW','W','NW','N','NE','E','SE'];
const TYPE='veilwater_serpent',SZ=34,UNITS=172,BAR_GAP=10,SHADOW_R=1.55,SHADOW_A=.9;
const MOB={n:'Veilwater Serpent',sh:'drake',c:'#3d93bf',c2:'#0b2a3a',sz:SZ,sp:90,boss:1};
const MS=window.__SERPENT={ok:false,err:null,registered:false,R:null,art:{files:ART.files,k:ART.k,refPx:ART.refPx}};
function register(){if(MS.registered)return;try{if(typeof MOBS!=='undefined'&&!MOBS[TYPE])MOBS[TYPE]=Object.assign({},MOB);}catch(_){}
  try{if(typeof MOBX!=='undefined'&&!MOBX[TYPE])MOBX[TYPE]=['dragon','water'];}catch(_){}MS.registered=true;}
function record(){
  const AN=ART.sheets[0].anchor,refH=ART.refPx,hK=UNITS/SZ,clips={};
  DIRS.forEach((d,r)=>{
    clips['idle_'+d]={s:0,row:r,n:6,ms:[190,180,190,190,180,200],loop:true};
    clips['move_'+d]={s:1,row:r,n:8,ms:new Array(8).fill(95),loop:true};
    clips['atk_windup_'+d]={s:2,row:r,n:3,ms:[120,120,120],c0:0};
    clips['atk_strike_'+d]={s:2,row:r,n:3,ms:[60,60,60],c0:3};
    clips['atk_recover_'+d]={s:2,row:r,n:2,ms:[140,160],c0:6};
    clips['hurt_'+d]={s:3,row:r,n:3,ms:[90,110,130]};
    clips['death_'+d]={s:4,row:r,n:6,ms:[150,160,170,190,220,300]};
    /* p330 skill poses (serpent_skills_r1, approved 30 Oct): timed to the p329 kit (spit f4 = jet release at 1.0 s, tailsweep f4 = sweep hit at .85 s, slam f4 = orbs) */
    clips['spit_'+d]={s:5,row:r,n:8,ms:[333,333,334,80,80,90,100,100]};clips['roar_'+d]={s:6,row:r,n:6,ms:[150,150,200,250,200,150]};
    clips['tailsweep_'+d]={s:7,row:r,n:8,ms:[283,283,284,60,60,60,60,70]};clips['charge_'+d]={s:8,row:r,n:6,ms:[450,450,70,70,70,70]};
    clips['slam_'+d]={s:9,row:r,n:6,ms:[70,70,70,110,200,180]};clips['dive_'+d]={s:10,row:r,n:4,ms:[100,110,120,120]};clips['emerge_'+d]={s:11,row:r,n:6,ms:[70,70,80,90,90,100]};});
  return {version:'veilwater-serpent-maddened-r1',target:TYPE,scope:'game',offKey:TYPE,
    status:'TEST ch2 — art approved by DeaRz 29 Oct 2026; gameplay in TEST only',
    sheets:ART.sheets,sheet:ART.sheets[0].src,cell:ART.sheets[0].cell,anchor:AN,hK,refH,drawK:1,barSh:'elemental',strikeWin:.15,dirs:DIRS,defDir:'S',dirHys:8,
    view:'8 authored views per pose (rows S,SW,W,NW,N,NE,E,SE); never mirrored',clips,
    slots:{attack:{status:'installed (test)',sync:'frames 1-3 wind-up stretched over the engine wind-up; frame 4 = damage moment; 5-6 strike; 7-8 recover; side locked'},
      hurt:{status:'installed (test)'},death:{status:'installed (test)',hold:1.2,fade:.8}},
    source:{pack:'art/veilwater-pass/serpent_sprites_r1',files:ART.files,k:ART.k},
    labelLift:e=>{const s=e.sz||SZ,sc=s*hK/refH,head=s*.35-refH*sc,barBottom=-s*2.4-12+6+2.5;return Math.max(0,barBottom-(head-BAR_GAP));},
    size:'Veilwater Serpent: '+UNITS+' world units = '+refH+' art px at sz '+SZ,missing:['knock-back','fall']};}
try{
  const REC=record(),RECS={};RECS[TYPE]=REC;MS.rec=REC;
  window.__MON_SPRITES=window.__MON_SPRITES||{};window.__MON_SPRITES[TYPE]=REC;
  const REG=window.MON_SPRITES;if(!REG||!REG.byType)throw new Error('p182 renderer missing');
  let src=null;for(const s of document.scripts){const t=s.text;if(t&&t.indexOf('p182 (r3) — data-driven monster sprite renderer')>=0&&t.indexOf('function makeSprite(D)')>=0){src=t;break;}}
  if(!src)throw new Error('p182 source not found');
  const swap=(a,b)=>{const i=src.indexOf(a);if(i<0||src.indexOf(a,i+1)>=0)throw new Error('p182 text changed: '+a.slice(0,40));src=src.slice(0,i)+b+src.slice(i+a.length);};
  window.__SERPENT_RECS=RECS;
  swap("const SRC=Object.assign({},window.__MON_SPRITES||{});if(window.__SLIME_CHIBI&&!SRC[window.__SLIME_CHIBI.target])SRC[window.__SLIME_CHIBI.target]=window.__SLIME_CHIBI;","const SRC=Object.assign({},window.__SERPENT_RECS);");
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
}catch(er){MS.err=er.message;console.warn('[p328] serpent',er);}
register();
/* register the MOBS record at load (chapter 2 spawns it) and when the Studio opens (both menu buttons and STUDIO.enter); never outside the Studio */
try{
  document.addEventListener('click',ev=>{const t=ev.target&&ev.target.closest&&ev.target.closest('#stuOpenA,#stuOpenB');if(t)register();},true);
  const hook=()=>{const S=window.STUDIO;if(!S||!S.enter||S.enter.__p328)return false;const o=S.enter;S.enter=function(){register();return o.apply(this,arguments);};S.enter.__p328=1;return true;};
  if(!hook()){let n=0;const iv=setInterval(()=>{if(hook()||++n>200)clearInterval(iv);},50);}
  MS.pick=()=>{register();const S=window.STUDIO;if(!S||!S.on)return false;S.mobType=TYPE;S.mobLv=22;S.subject='mob';S.stTarget='mob';S.spawnMob();try{S.paint(true);}catch(_){}return true;};
}catch(er){MS.hookErr=er.message;}
})();


