
/* ---- candidate_balance_v1_r38: p273 r2 monster elements v1 + art review r1 recolour fixes + name tags (approved table 19 Oct; multipliers = balance proposal in ELEM.cfg; TEST only) ---- */
/* p273 r2 — monster elements v1 (TEST only, candidate_balance_v1_r38). r2 = art review r1 (art/monsters/elements/recolour-review-r1.md):
   ember moss -> red-orange 3-step ramp, frost turtle sprout -> teal, snow gale mint tips -> pale blue, name tags no longer overlap.
   r1 header follows.
   Source: monster element table v1 (DeaRz approved 19 Oct 15:56, "3 ตัวแรกไม่ต้องมีธาตุก็ได้") + approved/systems/ELEMENT_SYSTEM_v1.md
   + balance/staff_elements_r1/REPORT_20261019_staff-elements.md (multipliers and on-hit numbers = balance PROPOSAL, DeaRz has not approved them:
   they live in ELEM.cfg so they can change without touching code).
   - 5 elements: none / Fire / Ice / Lightning / Earth. Rivals Fire<->Ice, Lightning<->Earth (both ways). Same element = resist. Other = x1.
     Replaces the r5 7-element table (Earth/Water/Wind/Fire/Poison/Dark/Light, x1.25/0.9/0.8) inside COLCMB.CFG.
     Old tags map: water/ice -> Ice; wind, poison, dark, light, holy, void, shadow, ghost, undead -> none (bow poison = no element).
   - Basic attack against a target that resists its element counts as no element (balance rule; only matters once the staff exists).
   - Monster element by species, and 3 map variants (Moss Turtle ice on Map 4 / Cave 1 / Map 6, Gale Feather ice on Map 5 / Map 6,
     Ruin Warden ember fire on Map 5) recoloured once at load the same way as the Elder Ruin Warden (HSV group shift; outline, eyes, alpha kept).
   - Monster hits with an element can add burn / chill / shock / knock-back on the player (balance numbers).
   - Name tag shows the element as a word; the icon and the aura are NOT drawn yet (art pending), nothing stands in for them.
   - Damage numbers take the attack element colour; "แพ้ทาง!" / "ต้านทาน" labels on x>1 / x<1 hits.
   Debug: window.ELEM (cfg, stats). ?elem=off disables the whole patch. ?eltest=fire|ice|lightning|earth gives player hits that element (test tool only). */
(function(){
'use strict';
const K=(typeof COLCMB!=='undefined')?COLCMB:window.COLCMB;if(!K||!K.CFG){console.warn('[p273] COLCMB missing');return;}
const Q=String(location.search)+String(location.hash);if(/elem=off/.test(Q)){window.ELEM={off:true};return;}
const cfg={
  mult:{weak:1.3,resist:0.7,other:1.0},                 // balance r1 proposal (spec draft was 1.5 / 0.5); DeaRz card still open
  basicNeutralOnResist:true,
  rivals:{Fire:'Ice',Ice:'Fire',Lightning:'Earth',Earth:'Lightning'},
  species:{slime:null,leafbun:null,puffcap:null,seedling:'Earth',dewbeetle:'Ice',briarfox:'Fire',duskstag:'Lightning',mossback:'Earth',
           stoneboar:'Earth',ruinwarden:'Earth',galefeather:'Lightning',ruinwarden_m4:'Lightning',mistling:'Ice',serpent:'Lightning'},
  variants:{
    mossback_ice:{type:'mossback',el:'Ice',zones:['w22_map4_test','w22_cave1_test','w23_map6_test'],name:'Frost Moss Turtle'},
    gale_ice:{type:'galefeather',el:'Ice',zones:['w22_map5_test','w23_map6_test'],name:'Snow Gale Feather'},
    warden_ember:{type:'ruinwarden_m4',el:'Fire',zones:['w22_map5_test'],name:'Ember Ruin Warden'}},
  onHit:{Fire:{ch:.30,frac:.20,dur:3},Ice:{ch:.30,slow:.20,dur:2},Lightning:{ch:.20,stun:.2,cd:4},Earth:{ch:.30,kb:40}},
  word:{Fire:'ไฟ',Ice:'น้ำแข็ง',Lightning:'สายฟ้า',Earth:'ดิน'},
  col:{Fire:'#ff8a3d',Ice:'#9be8ff',Lightning:'#ffe14d',Earth:'#d9a55a'}};
const ELS=['Fire','Ice','Lightning','Earth'];
const stats={weak:0,resist:0,basicNeutral:0,burn:0,chill:0,shock:0,knock:0,tinted:{},tintErr:[],swaps:0,labels:0};
const ELEM={version:'p273-r2',cfg,stats,ready:false};window.ELEM=ELEM;

/* ---- combat core: 5-element table built from cfg (rows = attack, columns = defence) ---- */
function build(){const m=cfg.mult;K.CFG.elements=ELS.slice();
  K.CFG.elemTable=ELS.map(a=>ELS.map(d=>a===d?m.resist:cfg.rivals[a]===d?m.weak:m.other));}
ELEM.rebuild=build;build();
{const L=K.CFG.legacyElement,none=['neutral','none','phys','wind','poison','dark','light','holy','void','shadow','ghost','undead','Wind','Poison','Dark','Light','Neutral'];
  for(const k of Object.keys(L))delete L[k];for(const k of none)L[k]='Neutral';
  Object.assign(L,{fire:'Fire',Fire:'Fire',ice:'Ice',Ice:'Ice',water:'Ice',Water:'Ice',frost:'Ice',lightning:'Lightning',Lightning:'Lightning',thunder:'Lightning',
    shock:'Lightning',earth:'Earth',Earth:'Earth'});}
ELEM.mult=(a,d)=>K.elemMult(a,d);

/* ---- which element a monster has: species table, map variant, else the old tag mapped to the new set ---- */
const curZone=()=>{try{return G.zone;}catch(_){return null;}};
function variantOf(type,zone){for(const k in cfg.variants){const v=cfg.variants[k];if(v.type===type&&v.zones.includes(zone))return k;}return null;}
function elemFor(e){const vk=e.elVar;if(vk&&cfg.variants[vk])return cfg.variants[vk].el;
  if(Object.prototype.hasOwnProperty.call(cfg.species,e.type))return cfg.species[e.type]||'Neutral';
  let old=null;try{old=mobInfo(e).ele;}catch(_){}return K.elemKey(old);}
function tag(e){if(!e||e.__el273)return e;e.__el273=1;e.elVar=variantOf(e.type,curZone());
  Object.defineProperty(e,'elem',{configurable:true,enumerable:true,get(){return elemFor(this);},set(_v){}});   // old monStats writes are ignored
  return e;}
{const _mk=makeEnemy;makeEnemy=function(){return tag(_mk.apply(this,arguments));};}
const later=()=>{try{for(const e of enemies)tag(e);}catch(_){}};later();

/* ---- player hits: element result per hit (label + colour); basic attack vs resist = no element ---- */
let CUR=null;const TEST=(Q.match(/eltest=(fire|ice|lightning|earth)/)||[])[1];ELEM.test=TEST||null;
{const _h=hitEnemy_v3;hitEnemy_v3=function(e,m,o){const prev=CUR;o=o||{};
  if(TEST&&!o.dot&&!o.elem)o=Object.assign({},o,{elem:TEST});
  CUR={e,basic:!(o.ctx&&o.ctx.def),res:null};try{return _h.call(this,e,m,o);}finally{CUR=prev;}};}
{const _r=K.resolveHit;K.resolveHit=function(i){
  if(CUR&&i&&i.defElem!==undefined){let a=K.elemKey(i.attElem),d=K.elemKey(i.defElem),k=K.elemMult(a,d);
    if(k<1&&CUR.basic&&cfg.basicNeutralOnResist&&a!=='Neutral'){i=Object.assign({},i,{attElem:'Neutral'});stats.basicNeutral++;CUR.res={a,k:1,basicN:1};}
    else CUR.res={a,k};}
  return _r.call(this,i);};}
{const _ad=applyDamage;applyDamage=function(e,d,crit,o){const R=CUR&&CUR.e===e?CUR.res:null;o=o||{};
  if(!R||o.dot||R.a==='Neutral')return _ad.apply(this,arguments);
  const col=cfg.col[R.a],_t=textAt;let first=true;
  textAt=function(x,y,txt,c,size,oo){if(first&&typeof txt==='string'&&/\d/.test(txt)){first=false;c=col;}return _t.call(this,x,y,txt,c,size,oo);};
  let r;try{r=_ad.apply(this,arguments);}finally{textAt=_t;}
  try{if(R.k>1){stats.weak++;_t(e.x,e.y-e.sz*2.4-14,'แพ้ทาง!',col,15,{life:.8});}
      else if(R.k<1){stats.resist++;_t(e.x,e.y-e.sz*2.4-14,'ต้านทาน','#b8c2cc',13,{life:.8});}}catch(_){}
  return r;};}

/* ---- name tag: element word next to the level (the icon is still waiting for art) ---- */
{const _g=dgapTag;dgapTag=function(e){const s=_g.apply(this,arguments);let w='';try{const el=e&&e.elem;if(el&&cfg.word[el]){w=' ['+cfg.word[el]+']';stats.labels++;}}catch(_){}return s+w;};}

/* ---- r2: name tags never overlap. Each frame the tags drawn last frame (position + width) are stacked: front monster (larger y) keeps
   its place, a tag behind it that would touch is lifted in 15 px steps (max 4). Only the HP bar and the "Lv…" text move. ---- */
const TAG={recs:new Map(),lift:new Map(),t:null,on:!/eltag=off/.test(Q)};ELEM.tags=TAG;
function stackTags(){const L=[...TAG.recs.entries()].filter(([e])=>!e.dead).sort((a,b)=>b[1].y-a[1].y),placed=[];TAG.lift=new Map();
  for(const [e,r] of L){let lift=0;for(let k=0;k<4;k++){const y=r.y-lift;if(!placed.some(q=>Math.abs(q.x-r.x)<(q.w+r.w)/2+4&&Math.abs(q.y-y)<15))break;lift+=15;}
    placed.push({x:r.x,y:r.y-lift,w:r.w});if(lift)TAG.lift.set(e,lift);}
  stats.tagLifts=TAG.lift.size;TAG.recs=new Map();}
{const _de=drawEnemy;drawEnemy=function(e){if(!TAG.on)return _de.apply(this,arguments);
  if(TAG.t!==time){TAG.t=time;stackTags();}
  const lift=TAG.lift.get(e)||0,own=Object.prototype.hasOwnProperty.call(ctx,'fillText'),ft=ctx.fillText,rr=rrect;
  ctx.fillText=function(tx,x,y,mw){if(typeof tx==='string'&&/Lv\d/.test(tx)){try{TAG.recs.set(e,{x,y,w:ctx.measureText(tx).width});}catch(_){}y-=lift;}
    return mw===undefined?ft.call(this,tx,x,y):ft.call(this,tx,x,y,mw);};
  if(lift)rrect=function(x,y,w,h,r){return rr.call(this,x,h<=7?y-lift:y,w,h,r);};
  try{return _de.apply(this,arguments);}finally{rrect=rr;if(own)ctx.fillText=ft;else delete ctx.fillText;}};}

/* ---- monster element hits on the player: burn / chill / shock / knock-back ---- */
const PS={burn:null,chillT:0,shockCd:0};ELEM.player=PS;
const now=()=>time;
const safe=()=>{try{return typeof szFullNow==='function'&&szFullNow();}catch(_){return false;}};
{const _hp=hurtPlayer;hurtPlayer=function(raw,src){const hp0=P?P.hp:0;const r=_hp.apply(this,arguments);
  try{const lost=hp0-P.hp;const el=src&&src.m&&src.L!=null?src.elem:null;const H=el&&cfg.onHit[el];
    if(H&&lost>0&&!P.dead&&!safe()&&Math.random()<H.ch){
      if(el==='Fire'){const tot=lost*H.frac;PS.burn={dps:tot/H.dur,end:now()+H.dur,next:now()+1};stats.burn++;textAt(P.x,P.y-78,'ไหม้','#ff8a3d',13,{life:.7});}
      else if(el==='Ice'){PS.chillT=now()+H.dur;stats.chill++;textAt(P.x,P.y-78,'หนาว','#9be8ff',13,{life:.7});}
      else if(el==='Lightning'){if(now()>=PS.shockCd&&!((P.stunT||0)>0)&&!((P.stunImm||0)>0)){P.stunT=H.stun;P.stunTotal=H.stun;P.swing=null;P.casting=null;P.spin=null;P.dash=null;   // short stagger through the v118 player stun
        PS.shockCd=now()+H.cd;stats.shock++;textAt(P.x,P.y-78,'ช็อต','#ffe14d',13,{life:.7});}}
      else if(el==='Earth'){const a=Math.atan2(P.y-src.y,P.x-src.x),c=Math.cos(a),sn=Math.sin(a),Z=ZONES[G.zone];let moved=0;   // 4 steps of kb/4, stops at the first blocked step (game collision incl. TEST maps)
        if(!P.dash)for(let k=1;k<=4;k++){const nx=P.x+c*H.kb/4,ny=P.y+sn*H.kb/4;let ok=true;try{ok=!blocked(nx,ny,P.r||14);}catch(_){}
          if(ok&&Z&&(nx<30||ny<30||nx>Z.w-30||ny>Z.h-30))ok=false;if(!ok)break;P.x=nx;P.y=ny;moved++;}
        if(moved){stats.knock++;}else stats.knockBlocked=(stats.knockBlocked||0)+1;}}}catch(er){}
  return r;};}
{const _B=B;B=function(k){const v=_B.apply(this,arguments);if(k==='speed'&&PS.chillT>now())return v-cfg.onHit.Ice.slow;return v;};}
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);
  try{const b=PS.burn;if(b&&P&&!P.dead){if(safe()){PS.burn=null;}else if(now()>=b.next){b.next+=1;const d=Math.max(1,Math.round(b.dps));
      const hp=Math.min(d,Math.max(0,P.hp-1));if(hp>0){P.hp-=hp;textAt(P.x,P.y-40,String(hp),'#ff9a4a',13,{life:.7});}if(now()>=b.end-1e-6)PS.burn=null;}}   // burn never kills (leaves 1 HP)
    swapTick();}catch(_){}
  return r;};}

/* ---- variant recolour: once at load, then the right sheet set is shown for the current map ---- */
function hsv(r,g,b){const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d>0){h=mx===r?60*(((g-b)/d)%6):mx===g?60*((b-r)/d+2):60*((r-g)/d+4);if(h<0)h+=360;}return [h,mx?d/mx:0,mx];}
function rgb(h,s,v){const C_=v*s,X=C_*(1-Math.abs((h/60)%2-1)),m=v-C_;let r=0,g=0,b=0;
  if(h<60){r=C_;g=X;}else if(h<120){r=X;g=C_;}else if(h<180){g=C_;b=X;}else if(h<240){g=X;b=C_;}else if(h<300){r=X;b=C_;}else{r=C_;b=X;}return [(r+m)*255,(g+m)*255,(b+m)*255];}
/* recipes: group(h,s,v) -> index into T; T = [target hue, s factor, v factor]; hue moves by (target - median hue of that group) so shading stays */
const RECIPE={
  mossback_ice:{group:(h,s,v)=>(((h>=50&&h<115&&s>=.45)||(h>=75&&h<130&&s>=.3))&&v>.25)?0:-1,   // r2: + lit yellow-green sprout / moss edges
                T:[[172,.85,1.0]]},                      // moss -> blue-green; shell, skin, eyes kept
  gale_ice:{group:(h,s,v)=>(h>=110&&h<215&&s>=.15&&v>.2)?0:-1,   // r2: + mint feather / tail tips
            T:[[205,.42,1.16]]},                         // teal feathers -> white-blue; belly, beak, feet kept
  warden_ember:{src:'rw',group:(h,s,v)=>((h<48||h>=340)&&s<.62&&v>.25)?0:(h>=48&&h<130&&s>=.25)?1:(h>=130&&h<200&&s>=.25)?2:-1,   // same groups as the Elder recolour
    T:[[15,.25,.52],{ramp:['#7a2a12','#b8461a','#e07a2c']},[28,1.2,1.15]]}};   // r2: stone dark grey, moss = ember ramp by brightness (shadow / mid / upper-left lit), gem orange                                                        // stone darker, moss to soot, chest gem orange
function recolour(im,RC,key){const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0);
  const D_=g.getImageData(0,0,c.width,c.height),p=D_.data,n=p.length/4,Gp=new Int8Array(n).fill(-1),Hh=new Float32Array(n),Ss=new Float32Array(n),Vv=new Float32Array(n);
  const NG=RC.T.length,hist=[...Array(NG)].map(()=>new Uint32Array(400)),cnt=new Array(NG).fill(0);
  for(let i=0;i<n;i++){if(!p[i*4+3])continue;const [h,s,v]=hsv(p[i*4]/255,p[i*4+1]/255,p[i*4+2]/255);Hh[i]=h;Ss[i]=s;Vv[i]=v;const k=RC.group(h,s,v);Gp[i]=k;if(k<0)continue;
    const hh=h>=340?h-360:h;hist[k][Math.max(0,Math.min(399,Math.floor(hh)+40))]++;cnt[k]++;}
  const med=hist.map((hs,k)=>{let a=0;const half=cnt[k]/2;for(let j=0;j<400;j++){a+=hs[j];if(a>=half)return j-40+.5;}return 0;});
  // ramp groups: brightness percentiles 5 / 95 of the group map onto the 3 given colours (keeps the drawn light and shade)
  const hex=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
  const RP=RC.T.map((T,k)=>{if(!T||!T.ramp)return null;const vh=new Uint32Array(256);for(let i=0;i<n;i++)if(Gp[i]===k)vh[Math.min(255,Math.round(Vv[i]*255))]++;
    const pc=q=>{let a=0;const lim=cnt[k]*q;for(let j=0;j<256;j++){a+=vh[j];if(a>=lim)return j/255;}return 1;};return {lo:pc(.05),hi:pc(.95),c:T.ramp.map(hex)};});
  for(let i=0;i<n;i++){const k=Gp[i];if(k<0)continue;const T=RC.T[k];
    if(RP[k]){const R_=RP[k],t=Math.max(0,Math.min(1,(Vv[i]-R_.lo)/Math.max(1e-6,R_.hi-R_.lo))),a=t<.5?R_.c[0]:R_.c[1],b=t<.5?R_.c[1]:R_.c[2],u=t<.5?t*2:(t-.5)*2;
      p[i*4]=Math.round(a[0]+(b[0]-a[0])*u);p[i*4+1]=Math.round(a[1]+(b[1]-a[1])*u);p[i*4+2]=Math.round(a[2]+(b[2]-a[2])*u);continue;}const h=((Hh[i]+T[0]-med[k])%360+360)%360;const o=rgb(h,Math.min(1,Ss[i]*T[1]),Math.min(1,Vv[i]*T[2]));
    p[i*4]=Math.round(o[0]);p[i*4+1]=Math.round(o[1]);p[i*4+2]=Math.round(o[2]);}
  g.putImageData(D_,0,0);(stats.tinted[key]=stats.tinted[key]||[]).push({w:c.width,h:c.height,px:cnt,median:med.map(x=>+x.toFixed(1))});
  return new Promise(res=>c.toBlob(bl=>{const u=URL.createObjectURL(bl),im2=new Image();im2.onload=()=>res(im2);im2.onerror=()=>res(null);im2.src=u;},'image/png'));}
const loadImg=src=>new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>rej(new Error('sheet load'));im.src=src;});
const VS={};ELEM.variantSheets=VS;   // key -> {type, orig:[img], tint:[img], ready}
function prepVariant(key){const v=cfg.variants[key],RC=RECIPE[key];if(VS[key]||!RC)return;const REG=window.MON_SPRITES,R=REG&&REG.byType&&REG.byType[v.type];
  if(!R||!R.ready||!R.imgs||R.imgs.some(x=>!x))return;
  let base;if(RC.src==='rw'){const rec=window.__RUIN_WARDEN&&__RUIN_WARDEN.rec;if(!rec||!rec.sheets||rec.sheets.length!==R.imgs.length)return;base=Promise.all(rec.sheets.map(s=>loadImg(s.src)));}
  else base=Promise.resolve(R.imgs.slice());
  VS[key]={type:v.type,R,orig:R.imgs.slice(),tint:null,ready:false,cur:'orig',t0:performance.now()};
  base.then(async ims=>{const out=[];for(const im of ims){await new Promise(r=>setTimeout(r,0));out.push(await recolour(im,RC,key));}return out;})   // one sheet per task: no single long freeze
    .then(t=>{if(t.some(x=>!x))throw new Error('recolour failed');VS[key].tint=t;VS[key].ready=true;(stats.ms=stats.ms||{})[key]=Math.round(performance.now()-VS[key].t0);})
    .catch(er=>{stats.tintErr.push(key+': '+(er&&er.message||er));});}
let lastZ=null;
/* the recoloured sheets are built one after another in the background as soon as the sprites exist (not on map entry, so entering a map
   has no extra hitch); they are blob PNGs, decoded by the browser only when drawn. Each frame the right set is shown for the current map. */
const VKEYS=Object.keys(cfg.variants);
function swapTick(){const REG=window.MON_SPRITES;if(!REG||!REG.byType)return;const z=curZone();
  for(const k of VKEYS)if(!VS[k])prepVariant(k);   // the 3 variants run side by side, each one sheet at a time
  for(const k in VS){const V=VS[k];if(!V.ready)continue;const want=cfg.variants[k].zones.includes(z)?'tint':'orig';if(V.cur===want)continue;
    const set=V[want],R=V.R;for(let i=0;i<set.length;i++)R.imgs[i]=set[i];R.img=R.imgs[0];V.cur=want;stats.swaps++;}
  if(z!==lastZ){lastZ=z;later();}}
ELEM.swapTick=swapTick;
ELEM.ready=true;
})();

