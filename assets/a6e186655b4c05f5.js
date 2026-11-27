
/* ---- charsel-r1 (TEST, 11 Nov 2026): character-select portraits with the NEW puppet hero + toast for an unlearned / wrong-class spin skill ----
   DeaRz: the portrait box of every existing character on the select screen (เลือกตัวละคร) was empty (dark blue gradient): the game's chDrawHero draws the OLD hero, which this build does not contain.
   Now chDrawHero(cv,..) for a slot card (canvas[data-chcv=i]) draws that slot's own saved P.pLook (gender, hair, hair colour, race, face, eye colour; cat colour) with the puppet, idle pose, default outfit
   (PUPPET.setChar(look) -> pose('idle') -> draw -> restore the hero's own char), auto-fitted into the box (feet near the bottom, centred). A slot with no pLook gets the default puppet look.
   The snapshot is cached per slot + look (static; no per-frame puppet work). The creator preview canvas (#chBig) is untouched. ?charsel=off disables.
   Toast: pressing a spin skill that is not learned (skill Lv 0) / needs another class used to do nothing; now it says "ต้องเปลี่ยนอาชีพสายดาบก่อน" or "สกิลยังไม่ได้เรียน". Debug: window.CHARSEL ---- */
(function(){'use strict';
const Q=String(location.search),OFF=/[?&]charsel=off\b/.test(Q);
const CS=window.CHARSEL={ver:'charsel-r3',on:!OFF,err:null,drawn:0,cache:{},toasts:0,last:null};
if(OFF)return;
const ERR=(w,e)=>{CS.err=w+': '+((e&&e.message)||e);try{console.error('[CHARSEL]',w,e)}catch(_){}};
const DEF={gender:'boy',hair:'default',hairColor:'natural'};
try{const _sw=window.PUPPET&&window.PUPPET.setWeapon;if(_sw&&!window.PUPPET.__swTrack){window.PUPPET.__swTrack=1;window.PUPPET.setWeapon=function(w){CS.curW=w;return _sw.apply(this,arguments)}}}catch(e){}
/* r2: ONE scale for every slot, fitted to the tallest / widest look the creator can make (every hair of both genders x the 4 races, with horns / cat ears / long hair), so the whole character incl. hair tips and race parts fits with 11 % headroom at the top, feet at 6 % from the bottom, centred; characters never change size between slots. */
let REF=null;
const WMAP={sword:'sword',bow:'bow',staff:'staff',holy:'holy',dagger:'dagger',scythe:'scythe',knuckle:'knuckle'};
function drawLook(look,wt){const U=window.PUPPET;const ch={};for(const k of ['gender','hair','hairColor','race','catColor','face','eyeColor'])if(look[k]!=null)ch[k]=look[k];U.setChar(Object.assign({},DEF,ch));
  if(wt!==undefined&&U.setWeapon){try{U.setWeapon(WMAP[wt]||'none');U.cfg.showSword=!!WMAP[wt];}catch(_){}}
  const big=document.createElement('canvas');big.width=300;big.height=360;const g=big.getContext('2d',{willReadFrequently:true});const p=U.pose('idle',0,{});U.draw(g,150,300,.5,-1,p);
  const d=g.getImageData(0,0,300,360).data;let x0=300,x1=-1,y0=360,y1=-1;for(let y=0;y<360;y++)for(let x=0;x<300;x++){if(d[(y*300+x)*4+3]>24){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}}
  return {big,x0,x1,y0,y1}}
function refExt(){if(REF)return REF;const U=window.PUPPET;let up=0,half=0,n=0;
  for(const gd of ['boy','girl']){const hs=(U.HAIRS_BY_GENDER&&U.HAIRS_BY_GENDER[gd])||['default'];for(const h of hs)for(const race of ['human','demon','elf','cat']){const m=drawLook({gender:gd,hair:h,hairColor:'natural',race,catColor:'orange'});if(m.x1<0)continue;n++;up=Math.max(up,300-m.y0);half=Math.max(half,150-m.x0,m.x1-150)}}
  REF={up:up||150,half:half||90,n};CS.ref=REF;return REF}
function snap(look,W,H,wt){const U=window.PUPPET;if(!U||!U.draw||!U.pose||!U.setChar||!U.getChar)return null;
  const keep=U.getChar(),keepW=(CS.curW!==undefined?CS.curW:((typeof P!=='undefined'&&P&&P.weapon&&G&&G.state==='play')?(WMAP[P.weapon.t]||'none'):undefined)),keepSS=U.cfg&&U.cfg.showSword;let out=null;
  try{const R=refExt();const m=drawLook(look,wt);if(m.x1<0)return null;
    const s=Math.min(H*.83/R.up,W*.47/R.half,1.6);CS.scale=s;
    out=document.createElement('canvas');out.width=W;out.height=H;const o=out.getContext('2d');o.imageSmoothingEnabled=true;o.imageSmoothingQuality='high';
    o.drawImage(m.big,W/2-150*s,H*.94-300*s,300*s,360*s)}
  catch(e){ERR('snap',e);out=null}
  finally{try{U.setChar(keep)}catch(_){}try{if(wt!==undefined){if(keepW!==undefined)U.setWeapon(keepW);if(U.cfg)U.cfg.showSword=keepSS}}catch(_){}}
  return out}try{const _c=chDrawHero;chDrawHero=function(cv,look,a,t){
  try{if(cv&&cv.dataset&&cv.dataset.chcv!=null){const i=+cv.dataset.chcv,s=chSaveOf(i),pl=(s&&s.P&&s.P.pLook)||null,wt=(s&&s.P&&s.P.weapon&&s.P.weapon.t)||'fist',key=i+'|'+wt+'|'+JSON.stringify(pl||DEF);
      let im=CS.cache[key];if(!im){im=snap(pl||DEF,cv.width,cv.height,wt);if(im)CS.cache[key]=im}
      if(im){const g=cv.getContext('2d');g.clearRect(0,0,cv.width,cv.height);g.imageSmoothingEnabled=true;cv.style.imageRendering='auto';g.drawImage(im,0,0);CS.drawn++;CS.last={slot:i,pLook:pl};return}}}
  catch(e){ERR('draw',e)}
  return _c.apply(this,arguments)}}catch(e){ERR('hook chDrawHero',e)}
/* the old 3D-hero module (hero3d cover) hides each slot canvas and puts an empty .hero3dPrev canvas on top of it (that is the empty box): give the slot canvas back */
setInterval(()=>{try{const ov=document.getElementById('chOv');if(!ov||ov.hidden)return;ov.querySelectorAll('canvas.hero3dPrev').forEach(c=>{const old=c.previousElementSibling;if(old&&old.dataset&&old.dataset.chcv!=null){old.style.display='';c.remove();CS.uncovered=(CS.uncovered||0)+1}})}catch(e){ERR('uncover',e)}},120);
/* toast: spin skill refused because it is not learned / belongs to another class */
try{const _s=castSkillNow;castSkillNow=function(id){const r=_s.apply(this,arguments);
  try{if(r===false&&P&&!P.dead&&G.state==='play'){const s=SK&&SK[id];if(s&&s.type==='spin'&&!((P.skills&&P.skills[id])>0)){const wrong=s.cls&&P.cls!==s.cls&&!(P.skills&&id in P.skills);const msg=wrong?'ต้องเปลี่ยนอาชีพสายดาบก่อน':'สกิลยังไม่ได้เรียน';CS.toasts++;CS.lastToast=msg;try{textAt(P.x,P.y-62,msg,'#ffb4a8',14)}catch(_){}try{log(msg,'w')}catch(_){}}}}catch(e){ERR('toast',e)}
  return r}}catch(e){ERR('hook castSkillNow',e)}
console.info('[CHARSEL] select-screen puppet portraits loaded');
})();
