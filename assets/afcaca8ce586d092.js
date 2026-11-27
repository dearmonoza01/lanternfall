
/* ---- r265 WFIX265 + WNAME265 (TEST ONLY). DeaRz approved in the Balance thread 26 Nov 16:44 UTC ("เอาเข้าเกมได้เลย"), spec via coordinator; Balance answers 16:47.
   WFIX265 (?wfix=off): weapons get a TIER (ขั้น I/II/III) instead of an item level. ATK = round(B[tier] x rarity x typeFactor x nameMul), B = 34 / 99 / 203;
   MATK non-magic = round(B x rarity x 0.2); staff MATK = round(B x 1.6 x rarity x nameMul). New items carry the tier's representative hidden level 10 / 35 / 75
   (refine bonus + fee, sell price, sub-stats, unique ATK follow it). Tier from the source level: <20 I, 20-29 I or II (50/50), 30-49 II, 50-59 II or III (50/50), 60+ III.
   Equip level: I Lv1, II Lv20, III Lv50. Saved weapons: level 1-19 -> I, 20-49 -> II, 50+ -> III, ATK recomputed for plain-named weapons (old level kept);
   uniques / relics / custom / test weapons keep their own stats. Removed types (gun, greatsword, axe, spear, book) untouched. Thor's training weapon = tier I.
   Hammer names (Art weapon looks WL31-33): Steam Hammer / Spirit Steam Hammer / Azure Steam Hammer.
   WNAME265 (?wname=off): one effect per base name (r1b), strength x rarity multiplier x name effect mul (1.1 / 1.0 / 0.9); chances capped at 40%;
   bosses immune to stun and slow. Extra hits are 'echo' hits (no further procs). Debug: window.WFIX265 / window.WNAME265 ---- */
(function(){'use strict';
const Q=String(location.search);
const F=window.WFIX265={ver:'wfix-r265',on:!/[?&]wfix=off\b/.test(Q),err:null,made:0,mig:0,gate:0,calc:0};
const N=window.WNAME265={ver:'wname-r265',on:!/[?&]wname=off\b/.test(Q),err:null,st:{}};
const ERR=(o,w,e)=>{o.err=w+': '+((e&&e.message)||e);try{console.warn('[r265]',w,e)}catch(_){}};
const BB=[0,34,99,203],REP=[0,10,35,75],REQ=[0,1,20,50],TN=['','I','II','III'],NMUL=[.95,1,1.05],EMUL=[1.1,1,.9];
const HN=['Steam Hammer','Spirit Steam Hammer','Azure Steam Hammer'];
const KEPT=new Set(['sword','dagger','bow','staff','scythe','knuckle','hammer']);
F.B=BB;F.REQ=REQ;F.HN=HN;
const R_=r=>RARITY[r|0]||RARITY[0];
const names=t=>t==='hammer'?HN:((typeof WNAMES!=='undefined'&&WNAMES[t])||[]);
function baseName(it){let n=String((it&&it.name)||'');const R=R_(it.rar);if(R.n&&n.indexOf(R.n)===0)n=n.slice(R.n.length);return n.trim();}
function nameIdx(it){if(!it||!KEPT.has(it.t))return -1;return names(it.t).indexOf(baseName(it));}
F.baseName=baseName;F.nameIdx=nameIdx;
function tierRoll(L){L=+L||1;if(L===REP[1])return 1;if(L===REP[2])return 2;if(L===REP[3])return 3;if(L<20)return 1;if(L<30)return rng()<.5?1:2;if(L<50)return 2;if(L<60)return rng()<.5?2:3;return 3;}
const tierMig=L=>{L=+L||1;return L>=50?3:L>=20?2:1;};
F.tierRoll=tierRoll;F.tierMig=tierMig;
function calc(it){const W=WEAPONS[it.t];if(!W||!it.tier)return;const R=R_(it.rar),i=nameIdx(it),nm=i>=0?NMUL[i]:1,b=BB[it.tier];
  it.atk=Math.round(b*R.m*W.f*nm);it.matk=Math.round(it.t==='staff'?b*1.6*R.m*nm:b*R.m*.2);F.calc++;}
F.calc1=calc;
F.expect=(t,tier,rar,ni)=>{const W=WEAPONS[t],R=R_(rar),nm=ni>=0?NMUL[ni]:1,b=BB[tier];return {atk:Math.round(b*R.m*W.f*nm),matk:Math.round(t==='staff'?b*1.6*R.m*nm:b*R.m*.2)};};
const plain=it=>!it.sty&&!it.custom&&!/Relic|TEST|ทดลอง|กริชคู่/.test(String(it.name||''))&&nameIdx(it)>=0;
/* ---- new weapons ---- */
if(F.on){try{const _m=makeWeapon;makeWeapon=function(t,lvl,rar,opt){
    if(!KEPT.has(t))return _m.apply(this,arguments);
    const tier=tierRoll(lvl);const it=_m.call(this,t,REP[tier],rar,opt);if(!it||it.kind!=='wpn'||!KEPT.has(it.t))return it;
    it.tier=tier;it.wfix=1;
    try{if(it.t==='hammer'&&!it.sty){const R=R_(it.rar);it.name=(R.n||'')+HN[(rng()*3)|0];}}catch(_){}
    if(plain(it))calc(it);F.made++;return it;};}catch(e){ERR(F,'makeWeapon',e)}}
/* ---- saved / converted weapons ---- */
function migrate(it){if(!it||it.kind!=='wpn'||!KEPT.has(it.t))return false;
  if(it.tw246&&it.tier!==1){it.tier=1;calc(it);return true;}
  if(it.tier)return false;it.tier=tierMig(it.lvl);it.wfix=2;if(plain(it))calc(it);F.mig++;return true;}
F.migrate=migrate;
function scan(){if(!F.on||typeof P==='undefined'||!P)return;let ch=false;
  try{const L=[P.weapon];if(Array.isArray(P.inv))L.push(...P.inv);if(P.equip)for(const k in P.equip)L.push(P.equip[k]);
    for(const k in P){const a=P[k];if(k!=='inv'&&Array.isArray(a)&&a.length&&a.length<600)for(const x of a)if(x&&x.kind==='wpn')L.push(x);}
    for(const it of L)if(migrate(it))ch=true;
    if(ch)try{recalc()}catch(_){}}catch(e){ERR(F,'scan',e)}}
F.scan=scan;setInterval(scan,800);
/* ---- equip level gate ---- */
if(F.on){try{const _e=equipItem;equipItem=function(i){try{const it=P.inv[i];if(it&&it.kind==='wpn'){migrate(it);if(it.tier&&(P.lvl|0)<REQ[it.tier]){F.gate++;
      try{notify(`ต้องเลเวล ${REQ[it.tier]} ขึ้นไป จึงใช้อาวุธขั้น ${TN[it.tier]} ได้`)}catch(_){}return;}}}catch(_){}return _e.apply(this,arguments);};}catch(e){ERR(F,'equip',e)}}
/* ---- name effects ---- */
const EF={
 sword:[{k:'aspd',v:.10,d:'ความเร็วโจมตี +{v}%'},{k:'bounce',c:.15,p:.5,d:'{c}% ต่อการตี เด้งไปโดนศัตรูใกล้ๆ 1 ตัว {p}%'},{k:'bleed',c:.15,p:.4,d:'{c}% ต่อการตี เลือดไหล {p}% ของดาเมจใน 3 วิ (ซ้อน 3)'}],
 dagger:[{k:'crit',v:6,d:'คริติคอล +{v}%'},{k:'again',c:.10,p:1,d:'{c}% ต่อการตี ตีซ้ำอีกครั้ง {p}%'},{k:'venom',c:.20,p:.3,d:'{c}% ต่อการตี พิษ {p}% ของดาเมจใน 3 วิ (ซ้อน 3)'}],
 bow:[{k:'far',v:.20,x:.08,d:'ระยะยิง +{v}% · ดาเมจ +{x}% กับเป้าไกลกว่า 250'},{k:'pierce',p:.6,d:'ลูกธนูทะลุศัตรู 1 ตัว {p}%'},{k:'aspd',v:.10,d:'ความเร็วโจมตี +{v}%'}],
 staff:[{k:'mpcost',v:.15,d:'MP สกิล -{v}%'},{k:'slow',c:.20,d:'{c}% ต่อการตี ทำให้ช้าลง 2 วิ'},{k:'sdmg',v:.08,d:'ดาเมจสกิล +{v}%'}],
 scythe:[{k:'leech',v:.02,d:'ดูดเลือด {v}% ของดาเมจ'},{k:'critdmg',v:.20,d:'ดาเมจคริติคอล +{v}%'},{k:'exec',v:.25,d:'ดาเมจ +{v}% กับศัตรู HP ต่ำกว่า 30%'}],
 knuckle:[{k:'stun',c:.05,d:'{c}% ต่อการตี มึน 0.5 วิ'},{k:'aspd',v:.10,d:'ความเร็วโจมตี +{v}%'},{k:'bleed',c:.15,p:.4,d:'{c}% ต่อการตี เลือดไหล {p}% ของดาเมจใน 3 วิ (ซ้อน 3)'}],
 hammer:[{k:'crush',c:.20,d:'{c}% ต่อการตี ลด DEF ศัตรู 10% 4 วิ'},{k:'splash',p:.4,d:'ดาเมจกระจาย {p}% รัศมี 90'},{k:'bulwark',v:.10,d:'DEF +{v}% ขณะถือ'}]};
N.EF=EF;
function effOf(it){if(!N.on||!it||it.kind!=='wpn')return null;const i=nameIdx(it);if(i<0||it.sty)return null;const d=EF[it.t]&&EF[it.t][i];if(!d)return null;
  const s=R_(it.rar).m*EMUL[i],o={k:d.k,s,d:d.d};
  if(d.v!=null)o.v=(d.k==='crit'?d.v:d.v)*s;if(d.x!=null)o.x=d.x*s;if(d.c!=null)o.c=Math.min(.4,d.c*s);
  if(d.p!=null)o.p=(d.k==='pierce'||d.k==='splash')?Math.min(1,d.p*s):d.p;return o;}
N.effOf=effOf;
const pc=v=>{const r=Math.round(v*1000)/10;return (r%1?r.toFixed(1):String(r));};
function effText(it){const o=effOf(it);if(!o)return '';return o.d.replace('{v}',o.k==='crit'?pc(o.v/100):pc(o.v||0)).replace('{x}',pc(o.x||0)).replace('{c}',pc(o.c||0)).replace('{p}',pc(o.p||0));}
N.text=effText;
F.lv=function(it){try{if(!it||it.kind!=='wpn')return 'Lv '+(it&&it.lvl);let s=(F.on&&it.tier)?`ขั้น ${TN[it.tier]} · ใช้ได้ Lv${REQ[it.tier]}`:'Lv '+it.lvl;const e=effText(it);if(e)s+=' · ✦ '+e;return s;}catch(_){return 'Lv '+(it&&it.lvl);}};
const cur=()=>{try{return P&&P.weapon?effOf(P.weapon):null}catch(_){return null}};
/* stat effects */
try{const _rc=recalc;recalc=function(){const r=_rc.apply(this,arguments);try{const o=cur();if(o){P.pb=P.pb||{};
    if(o.k==='aspd')P.pb.aspd=(P.pb.aspd||0)+o.v;
    else if(o.k==='crit')P.crit=(P.crit||0)+o.v;
    else if(o.k==='critdmg')P.pb.critDmg=(P.pb.critDmg||0)+o.v;
    else if(o.k==='bulwark')P.def=Math.round((P.def||0)*(1+o.v));}}catch(e){ERR(N,'recalc',e)}return r;};}catch(e){ERR(N,'recalc hook',e)}
let lastW=null;setInterval(()=>{try{if(typeof P==='undefined'||!P)return;const k=P.weapon?(P.weapon.uid+'|'+P.weapon.name+'|'+N.on):'';if(k!==lastW){lastW=k;recalc();}
  const BW=window.BOW,o=cur();if(BW&&BW.cfg&&WEAPONS.bow){const want=(o&&o.k==='far'&&P.weapon.t==='bow')?Math.round(BW.cfg.range*(1+o.v)):BW.cfg.range;if(WEAPONS.bow.range!==want)WEAPONS.bow.range=want;}}catch(_){}},250);
/* skill MP cost (refund) + skill time */
try{const _cs=castSkill;castSkill=function(){const mp0=P.mp;N.skillT=time;const r=_cs.apply(this,arguments);try{const o=cur();const sp=mp0-P.mp;if(o&&o.k==='mpcost'&&sp>0){P.mp=Math.min(P.maxMp,P.mp+sp*o.v);N.st.mpRef=(N.st.mpRef||0)+sp*o.v;N.st.mpSpent=(N.st.mpSpent||0)+sp;}}catch(_){}return r;};}catch(e){ERR(N,'cast hook',e)}
const isBoss=e=>!!(e&&(e.m&&e.m.boss||e.raidB));
function isBasic(o){if(o.skill||o.sk||o.cast)return false;const bt=G.basicT==null?-99:G.basicT,dt=time-bt;if(dt>=0&&dt<.3)return true;
  if((o.kind==='arrow'||o.kind==='orb')&&dt>=0&&dt<1.8&&(N.skillT==null||N.skillT<bt))return true;return false;}
N.isBasic=isBasic;
const cnt=k=>{N.st[k]=(N.st[k]||0)+1;};
const near=(e,r,skip)=>{const out=[];for(const x of enemies)if(x&&!x.dead&&x!==e&&x!==skip&&Math.hypot(x.x-e.x,x.y-e.y)<=r)out.push(x);return out;};
function addDot(e,tot,k){if(!(tot>0))return;const L=e.__dot265||(e.__dot265=[]);const same=L.filter(s=>s.k===k);if(same.length>=3){same.sort((a,b)=>a.t-b.t);L.splice(L.indexOf(same[0]),1);}L.push({k,per:tot/6,n:6,nt:.5});cnt(k+'Stacks');}
setInterval(()=>{try{if(typeof enemies==='undefined')return;const now=time;for(const e of enemies){if(!e||e.dead)continue;
    if(e.__crushT&&now>e.__crushT){if(e.__def0!=null)e.def=e.__def0;e.__crushT=0;}
    const L=e.__dot265;if(!L||!L.length)continue;for(let i=L.length-1;i>=0;i--){const s=L[i];s.nt-=.25;if(s.nt<=0){s.nt+=.5;s.n--;const d=Math.max(1,Math.round(s.per));
      try{applyDamage(e,d,false,{dot:s.k})}catch(_){e.hp-=d;if(e.hp<=0)try{killEnemy(e)}catch(_){}}N.st[s.k+'Dmg']=(N.st[s.k+'Dmg']||0)+d;if(s.n<=0)L.splice(i,1);if(e.dead)break;}}}}catch(e){ERR(N,'dot',e)}},250);
try{const _h=hitEnemy;hitEnemy=function(e,m,o){o=o||{};let o2=null;try{o2=cur()}catch(_){}
  if(!o2||!e||e.dead||o.dot||o.echo||o.n265)return _h.apply(this,arguments);
  const basic=isBasic(o);let mm=m;
  if(o2.k==='sdmg'&&!basic){mm*=1+o2.v;cnt('sdmgHits');}
  if(o2.k==='far'&&basic&&Math.hypot(e.x-P.x,e.y-P.y)>250){mm*=1+o2.x;cnt('farHits');}
  if(o2.k==='exec'&&e.maxHp&&e.hp<e.maxHp*.3){mm*=1+o2.v;cnt('execHits');}
  const hp0=e.hp;const r=_h.call(this,e,mm,o);
  try{const dmg=Math.max(0,hp0-Math.max(0,e.hp));if(!basic)return r;cnt('basicHits');N.st.basicDmg=(N.st.basicDmg||0)+dmg;
    const ex=Object.assign({},o,{echo:1,n265:1});const R=()=>rng();
    switch(o2.k){
      case 'bounce':if(R()<o2.c){const t=near(e,170)[0];cnt('bounceRoll');if(t){cnt('bounce');timers.push({t:.08,fn:()=>{if(!t.dead)_h.call(window,t,m*o2.p,ex)}});}}break;
      case 'bleed':case 'venom':if(R()<o2.c){addDot(e,dmg*o2.p,o2.k);cnt(o2.k);}break;
      case 'again':if(R()<o2.c){cnt('again');timers.push({t:.09,fn:()=>{if(!e.dead)_h.call(window,e,m*o2.p,ex)}});}break;
      case 'pierce':{const a=Math.atan2(e.y-P.y,e.x-P.x);let best=null,bd=1e9;for(const x of near(e,240)){const b=Math.atan2(x.y-e.y,x.x-e.x);let df=Math.abs(((b-a+Math.PI*3)%(Math.PI*2))-Math.PI);if(df<.6){const d=Math.hypot(x.x-e.x,x.y-e.y);if(d<bd){bd=d;best=x;}}}
        if(best){cnt('pierce');_h.call(window,best,m*o2.p,ex);}break;}
      case 'slow':if(R()<o2.c){if(isBoss(e)){cnt('slowBossImmune');}else{try{applySt(e,{slow:2},{dt:'phys'})}catch(_){}cnt('slow');}}break;
      case 'stun':if(R()<o2.c){if(isBoss(e)){cnt('stunBossImmune');}else{e.st=e.st||{};e.st.stun=Math.max(e.st.stun||0,.5);cnt('stun');}}break;
      case 'leech':{const h=dmg*o2.v;if(h>0){P.hp=Math.min(P.maxHp,P.hp+h);N.st.leechHp=(N.st.leechHp||0)+h;}break;}
      case 'crush':if(R()<o2.c){if(e.__def0==null||!e.__crushT)e.__def0=e.def;e.def=Math.round(e.__def0*.9);e.__crushT=time+4;cnt('crush');}break;
      case 'splash':for(const x of near(e,90)){cnt('splash');_h.call(window,x,m*o2.p,ex);}break;
    }}catch(x){ERR(N,'proc',x)}
  return r;};}catch(e){ERR(N,'hit hook',e)}
})();
