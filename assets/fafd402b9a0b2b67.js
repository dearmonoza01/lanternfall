
/* ---- r196 cdeasy (TEST ONLY): "easy play" cooldowns, APPROVED by DeaRz 23 Nov 17:05 UTC in the Balance thread ("Okใช้ตามนี้เลย"), table balance/cooldown_r1/COOLDOWN_easy_r1.md.
   Rules (applied on top of the game's own numbers at the moment a skill is cast, so skill levels and cooldown reduction still scale):
   attack skill: cooldown x0.5 (min 3 s), damage per cast x0.75, MP x0.6 · ultimate / special: cooldown x0.5 (min 15 s), damage x0.8, MP x0.6 · buff: cooldown x0.5 (min 8 s, at most duration + 5 s), values unchanged · robot: cooldown 45 s (after its 30 min).
   How: (1) P.cds is wrapped: when a listed skill STARTS a cooldown the value is converted by the rule; (2) the MP a listed skill takes in that same cast is refunded by 40 %; (3) hits whose damage context says kind 'skill' with a listed attack / ultimate id are multiplied by 0.75 / 0.8 (buff-made hits stay x1).
   ?cdeasy=off = old numbers. Debug: window.CDEASY196 ---- */
(function(){'use strict';
const Q=String(location.search);
const R=window.CDEASY196={ver:'cdeasy-r196',on:!/[?&]cdeasy=off\b/.test(Q),err:null,stats:{cd:0,mpRefund:0,mpRefundN:0,hits:0,unknownSkillHits:{}},log:[]};
if(!R.on)return;
const ERR=(w,e)=>{R.err=w+': '+((e&&e.message)||e);try{console.error('[CDEASY196]',w,e)}catch(_){}};
/* id -> type (a = attack, u = ultimate/special, b = buff). Names = Balance table. */
const T={
 /* sword */ wsSword1:'a',wsSword2:'a',wsAtk3:'a',wsAtk4:'a',wsAtk5:'u',wsSword3:'b',provoke:'b',wsBuff3:'b',wsBuff4:'b',wsBuff5:'b',
 /* bow */ bskPierce:'a',bskRain:'a',bskLeap:'a',bskFan:'a',bskLantern:'u',bskFocus:'b',bskWind:'b',bskPoison:'b',bskWeak:'b',bskStance:'b',
 /* staff */ stfFire:'a',stfIce:'a',stfChain:'a',stfSpikes:'a',stfUlt:'u',stfFocus:'b',stfShield:'b',stfCurse:'b',stfMana:'b',stfAvatar:'b',
 /* holy */ holyJL:'a',hkHeal:'a',hkLant:'a',hkSeal:'a',hkRing:'a',holySR:'u',hkBless:'b',hkWard:'b',hkMana:'b',hkHalo:'b',
 /* dagger */ dgShadow:'a',dgBlades:'a',dgStorm:'a',dgSmoke:'a',dgUlt:'u',dgCloak:'b',dgCoat:'b',dgStep:'b',dgFocus:'b',dgBody:'b',
 /* scythe */ scy_soulreap:'a',scy_storm:'a',scy_flying:'a',scy_dm:'a',scy_nh:'u',scy_bloodlust:'b',scy_reaper:'b',scy_scream:'b',scy_bloodpact:'b',scy_soularmor:'b',
 /* hammer */ hmTurret:'a',hmSmash:'a',hmDolls:'a',hmTrap:'a',hmRepair:'b',hmArmor:'b',hmUpg:'b',hmLube:'b',hmSuit:'b',
 /* special */ spStorm:'a',spThunder:'t',spSakura:'u',spDemon:'u',spGuardian:'u',spDragon:'u'};
/* buff caps from the table (duration + 5 s) where that is lower than max(8, cd x0.5) */
const CAP={stfMana:13,stfAvatar:17,hkMana:13,hkHalo:17,scy_reaper:20,scy_scream:8,scy_bloodpact:12,scy_soularmor:15,hmArmor:17,hmUpg:17,hmSuit:20};
R.T=T;R.CAP=CAP;
const typeOf=(id,v)=>{const t=T[id];if(t==='t')return v>=20?'u':'a';/* thunder sword god: tap 8 s = attack, charge 30 s = ultimate */return t||null};
function conv(id,v){const t=typeOf(id,v);if(!t)return v;if(t==='a')return Math.max(3,v*.5);if(t==='u')return Math.max(15,v*.5);let n=Math.max(8,v*.5);if(CAP[id]!=null)n=Math.min(n,CAP[id]);return Math.min(n,v)}
R.conv=conv;
/* ---- MP: watch drops of P.mp; a drop within 120 ms of a listed cast (either order) gets 40 % back ---- */
let pend=null,drop=null;const ms=()=>performance.now();
function refund(amt,id){const k=.4;const g=amt*k;if(!(g>0))return;try{P.mp=Math.min(P.maxMp||1e9,P.mp+g)}catch(_){}R.stats.mpRefund+=g;R.stats.mpRefundN++;R.log.push(['mp',id,+amt.toFixed(1),+g.toFixed(1)]);if(R.log.length>60)R.log.shift()}
function onCast(id){const t=typeOf(id,99);if(!t)return;if(drop&&ms()-drop.t<120&&!drop.used){drop.used=1;refund(drop.amt,id)}else pend={id,t:ms()}}
function installMp(){try{if(!P||P.__mp196)return;let v=P.mp;Object.defineProperty(P,'mp',{configurable:true,enumerable:true,get(){return v},set(n){const o=v;v=n;try{if(typeof n==='number'&&typeof o==='number'&&n<o-.01&&!R.inRefund){const amt=o-n;if(pend&&ms()-pend.t<120){const id=pend.id;pend=null;R.inRefund=1;try{refund(amt,id)}finally{R.inRefund=0}}else drop={amt,t:ms()}}}catch(_){}}});Object.defineProperty(P,'__mp196',{value:1,enumerable:false,configurable:true})}catch(e){ERR('mp',e)}}
/* ---- cooldowns ---- */
function wrapCds(){try{if(typeof P==='undefined'||!P||!P.cds||P.cds.__cd196)return;const tgt=P.cds;P.cds=new Proxy(tgt,{get(o,k){if(k==='__cd196')return true;if(typeof k==='string'){lastRead=k;lastT=performance.now()}return o[k]},set(o,k,v){try{if(typeof v==='number'&&T[k]&&v>(+o[k]||0)+.25){const n=conv(k,v);if(n!==v){R.stats.cd++;R.log.push(['cd',k,+v.toFixed(2),+n.toFixed(2)]);if(R.log.length>60)R.log.shift()}if(v>0)RATIO[k]=n/v;v=n;onCast(k)}}catch(e){ERR('cdset',e)}o[k]=v;return true}})}catch(e){ERR('wrap',e)}}
/* hotbar rings: each module draws --cd = remaining / its own full cooldown; the full cooldown is now shorter, so the ring of the skill whose cooldown was just read is rescaled (starts full, empties at 0) */
const RATIO={};let lastRead=null,lastT=0;R.RATIO=RATIO;
try{const SP=CSSStyleDeclaration.prototype.setProperty;CSSStyleDeclaration.prototype.setProperty=function(prop,val){try{if(prop==='--cd'&&lastRead&&performance.now()-lastT<4){const k=lastRead;lastRead=null;const r=RATIO[k],x=+val;if(r>0&&r<1&&x>0&&isFinite(x)){val=String(Math.min(1,x/r))}}}catch(_){}return arguments.length>2?SP.call(this,prop,val,arguments[2]):SP.call(this,prop,val)}}catch(e){ERR('ring',e)}
/* robot: 90 -> 45 in its own config (its cooldown starts after the 30 min ride) */
function robot(){try{const C=window.ROBOT&&ROBOT.cfg;if(C&&!C.__cd196&&C.CD===90){C.CD=45;C.__cd196=1}}catch(e){ERR('robot',e)}}
/* ---- damage: outermost hitEnemy ---- */
const DMG={a:.75,u:.8};
function idOfCtx(c){try{if(!c||c.kind!=='skill')return null;let id=c.id||(c.def&&c.def.id);if(!id)return null;if(T[id])return id;for(const k in T)if(id.indexOf(k)===0)return k;R.stats.unknownSkillHits[id]=(R.stats.unknownSkillHits[id]|0)+1;return null}catch(_){return null}}
function hookHit(){try{if(typeof hitEnemy!=='function'||hitEnemy.__cd196)return;const o=hitEnemy;const f=function(e,m,opts){try{const c=(opts&&opts.ctx)||(window.C182&&C182.cur);const id=idOfCtx(c);if(id&&typeof m==='number'){let t=typeOf(id,id==='spThunder'?(c.charge||c.def&&c.def.charge?30:8):99);if(t==='a'||t==='u'){const f=DMG[t];if(c&&typeof c==='object'&&c.kind==='skill'){/* skill damage = def.coefTotal x ctx.lvScale x weight x k: scale lvScale once per cast (m is only a ratio to m0) */if(!c.__cd196){c.__cd196=1;c.lvScale=(c.lvScale||1)*f}}else m*=f;R.stats.hits++}}}catch(er){ERR('hit',er)}return o.apply(this,arguments)};f.__cd196=1;hitEnemy=f}catch(e){ERR('hookHit',e)}}
function tick(){wrapCds();installMp();robot();hookHit()}
setInterval(tick,400);setTimeout(tick,0);
})();

