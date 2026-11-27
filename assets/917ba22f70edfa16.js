
/* ---- scythe_module_r2 scy_skills.js (gameplay) ---- */
// Lanternfall scythe skills: gameplay (Code, 9 Nov 2026). DeaRz 19:19 "อนุมัติสกิลเคียวทั้งหมดใส่เข้าเกมได้เลย".
// Numbers: BALANCE_scythe_soul_reap_v2, BALANCE_scythe_storm_hits_v2, BALANCE_scythe_flying_v2 (FINAL),
// SCYTHE_numbers_r1 sheets "buff" + "passive", SCYTHE_decisions_r1 (Soul Armor 500 +10%/Lv, lifesteal caps).
// VFX: SCY_FX (scy_fx.js) = the passed demo drawing code. Damage, timing, pulls and buffs are done here, not by the demos.
// The game connects through SCY.init(adapter). Nothing here touches game globals.
(function(){
'use strict';
var FX=window.SCY_FX;
function lv10(a){return function(L){L=Math.max(1,Math.min(10,L|0));return a[L-1]}}
function lv5(a){return function(L){L=Math.max(1,Math.min(5,L|0));return a[L-1]}}
// ---------------- tables ----------------
var TAB={
 soulreap:{name:'เกี่ยววิญญาณ',kind:'atk',mp:function(){return 18},cd:7,max:8,
   r:lv10([150,150,150,150,170,170,170,170,170,190]),
   direct:lv10([168,192,216,240,196,216,238,259,282,143]),second:function(L){return L>=10?144:0},
   bleed:lv10([0,0,0,0,20,21,22,24,26,28]),bleedT:lv10([0,0,0,0,4,4,4,4,4,5])},
 storm:{name:'พายุเคียว',kind:'atk',mp:function(){return 26},cd:12,max:99,r:function(){return 150},pull:30,
   n:lv10([11,11,11,11,17,17,17,17,17,17]),pct:lv10([24.2,27.6,31.1,34.5,25.7,27.9,30.4,33.1,36.0,39.8]),
   walk:function(L){return L>=5}},
 flying:{name:'เคียวบิน',kind:'atk',mp:function(){return 20},cd:9,max:8,range:400,def:280,
   slash:lv10([58.8,67.2,75.6,84.0,96.6,105.0,114.3,124.2,135.3,149.4]),
   R:lv10([130,130,130,130,150,150,150,150,150,170]),dur:lv10([2,2,2,2,2.4,2.4,2.4,2.4,2.4,3]),
   ticks:lv10([10,10,10,10,12,12,12,12,12,15]),tick:lv10([13.7,15.7,17.6,19.6,18.8,20.4,22.2,24.1,26.3,21.7]),
   pullV:450,slow:function(L){return L>=5?0.20:0}},
 bloodlust:{name:'กระหายเลือด',kind:'buff',cd:30,mp:lv10([19,20,21,22,23,24,25,26,28,29]),
   dur:lv10([11.2,12.2,13,14,15.4,16.1,16.8,17.5,18.2,19.6]),v:lv10([0.56,0.64,0.72,0.80,0.88,0.92,0.96,1.0,1.04,1.08])},
 reaper:{name:'ร่างยมทูต',kind:'buff',cd:60,mp:lv10([34,36,38,40,42,44,46,48,50,52]),
   dur:lv10([12,13.1,14,15,16.5,17.2,18,18.8,19.5,21]),rad:lv10([17.5,20,22.5,25,27.5,28.7,30,31.2,32.5,33.8]),
   as:lv10([14,16,18,20,22,23,24,25,26,27])},
 scream:{name:'กรีดร้อง',kind:'buff',cd:28,mp:lv10([22,23,25,26,27,29,30,31,32,34]),
   fear:lv10([1.6,1.7,1.9,2.0,2.2,2.3,2.4,2.5,2.6,2.8]),slow:lv10([21,24,27,30,33,34.5,36,37.5,39,40.5]),slowT:4,
   R:lv10([260,260,260,260,312,312,312,312,312,312])},
 bloodpact:{name:'สัญญาเลือด',kind:'buff',cd:25,mp:lv10([13,14,14,15,16,16,17,18,19,20]),
   dur:lv10([9.6,10.4,11.2,12,13.2,13.8,14.4,15,15.6,16.8]),cost:lv10([10,10,10,10,7,7,7,7,7,7]),
   up:lv10([17.5,20,22.5,25,27.5,28.7,30,31.2,32.5,33.8])},
 soularmor:{name:'เกราะวิญญาณ',kind:'buff',cd:40,mp:lv10([26,27,28,30,32,33,34,36,38,39]),
   dur:lv10([8,8.7,9.3,10,11,11.5,12,12.5,13,14]),def:lv10([14,16,18,20,22,23,24,25,26,27]),
   armor:function(L){return Math.round(500*(1+0.1*(Math.max(1,Math.min(10,L))-1)))}}
};
var PAS={harvest:{name:'เก็บเกี่ยว',v:lv5([0.9,1.2,1.5,1.8,2.1])},
 pain:{name:'พลังแห่งความเจ็บปวด',v:lv5([9.6,12.8,16,19.2,22.4])},
 moonedge:{name:'คมจันทร์',v:lv5([2.4,3.2,4,4.8,5.6])},
 spirit:{name:'วิญญาณเสริม',v:lv5([3.6,4.8,6,7.2,8.4])},
 wontdie:{name:'ไม่ยอมตาย',v:lv5([1.6,1.8,2,2.2,2.4]),th:function(L){return L>=5?0.40:0.30}}};
var CAP={hit:1.5,sweep:4,sec:8,secWD:10,total:15};
// demo timings (from the passed demos)
var TM={soulreap:{sw:.55},storm:{T0:.55,SPIN:1.9},flying:{T0:1.25,TL:1.05},scream:{TS:.55,WT:1.0},
 buffT0:{bloodlust:.2,reaper:.4,bloodpact:2.1,soularmor:1.2},buffAt:{bloodlust:1.1,reaper:1.5,bloodpact:3.5,soularmor:2.45},
 pactCost:{bloodpact:3.0}};

// ---------------- state ----------------
var A=null,K=0.5,NOW=0,inst=[],cds={},buffs={},pas={harvest:0,pain:0,moonedge:0,spirit:0,wontdie:0};
var MS=new WeakMap();function ms(m){var s=MS.get(m);if(!s){s={fear:0,slow:0,slowV:0,pulled:0,bleed:null,fx:0};MS.set(m,s)}return s}
var heals=[],shield=0,shieldMax=0,dummy=null,marks=[];
var cfg={baseLs:0.40,enabled:true,fxScale:1,bodyScale:1.8,heroH:135};// bodyScale: game hero height / demo stand-in hero height (~62 px) for body-worn buff effects
function hero(){return A.hero()}
function alive(m){return m&&!m.dead&&!(m.hp<=0)}
function d2(m,x,y){var dx=m.x-x,dy=(m.y-y)/K;return Math.sqrt(dx*dx+dy*dy)}
function inR(x,y,r){var out=[],L=A.mobs()||[];for(var i=0;i<L.length;i++){var m=L[i];if(alive(m)&&d2(m,x,y)<=r)out.push(m)}return out}
function nearest(list,x,y,n){return list.sort(function(a,b){return d2(a,x,y)-d2(b,x,y)}).slice(0,n)}
function hpMax(){var h=hero();return h.hpMax||h.maxHp||1}
function hpFrac(){var h=hero();return (h.hp||0)/hpMax()}
function rad(){return buffs.reaper?1+buffs.reaper.rad/100:1}

// ---------------- damage + lifesteal ----------------
function dmgMul(nTargets){var m=1;if(buffs.bloodpact)m*=1+buffs.bloodpact.up/100;
  if(pas.pain&&hpFrac()<=0.20)m*=1+PAS.pain.v(pas.pain)/100;
  if(pas.moonedge&&nTargets>1)m*=1+PAS.moonedge.v(pas.moonedge)/100*Math.min(4,nTargets-1);return m}
function healedLastSec(kind){var s=0;for(var i=heals.length-1;i>=0;i--){var h=heals[i];if(NOW-h.t>1)break;if(!kind||h.k===kind)s+=h.v}return s}
function giveHeal(pctMax,kind,info){if(pctMax<=0)return 0;var wd=pas.wontdie&&hpFrac()<PAS.wontdie.th(pas.wontdie);
  var room=CAP.total-healedLastSec();if(kind==='ls')room=Math.min(room,(wd?CAP.secWD:CAP.sec)-healedLastSec('ls'));
  var p=Math.max(0,Math.min(pctMax,room));if(p<=0)return 0;heals.push({t:NOW,v:p,k:kind});if(heals.length>200)heals.splice(0,100);
  var amt=hpMax()*p/100;if(A.heal)A.heal(amt,info||{kind:kind});return amt}
function lifesteal(pct,cast){var v=cfg.baseLs+(buffs.bloodlust?buffs.bloodlust.v:0);if(v<=0)return;
  var p=v*pct/100;if(pas.wontdie&&hpFrac()<PAS.wontdie.th(pas.wontdie))p*=PAS.wontdie.v(pas.wontdie);
  p=Math.min(p,CAP.hit);if(cast){p=Math.min(p,CAP.sweep-cast.ls);if(p<=0)return;cast.ls+=p}
  var got=giveHeal(p,'ls');if(got>0&&buffs.bloodlust&&cast&&cast.fx){cast.drop=(cast.drop||0)+1}}
function hit(m,pct,cast,o){if(!alive(m))return 0;o=o||{};var mul=o.noMul?1:dmgMul(cast?cast.nT:1);
  var d=A.hit(m,pct*mul,{skill:cast?cast.id:o.id,el:'dark',bleed:!!o.bleed,noKnock:true,crit:!o.bleed});
  if(!o.bleed)lifesteal(pct,cast);
  if(cast&&cast.fx&&!o.bleed)hitFx(cast,m,o.j||0);return d}
// ---------------- FX helpers ----------------
function demoXY(c,m){return {x:c.HX+c.dir*(m.x-c.ax),y:c.HY+(m.y-c.ay)}}
function hitFx(c,m,j){var p=demoXY(c,m),f=c.fx;try{f.add({k:'ring',x:p.x,y:p.y,s:44,w:4,col:'#c9a8ff',life:.35,a:.9});
  var sl=f.ev('typeof slashes2!=="undefined"?slashes2:null');if(sl)sl.push({x:p.x,y:p.y-26,t0:f.t,j:j});
  if(c.id==='soulreap'&&c.wisp&&!c.wisp.has(m)){c.wisp.add(m);var w=f.ev('wisps2');if(w)w.push({x:p.x,y:p.y-26,t0:f.t+.05,dur:.62,ph:Math.random()*3,side:p.x<c.HX?-1:1})}
  if(c.id==='storm'||c.id==='flying')for(var q=0;q<2;q++)f.add({k:'s',x:p.x+(Math.random()-.5)*16,y:p.y-20,s:8+Math.random()*6,col:Math.random()<.5?'#8a4dff':'#c9a8ff',vx:(Math.random()-.5)*120,vy:-30-Math.random()*60,life:.4})}catch(e){}}
function mkFX(id,c,env){if(!FX||!FX[id])return null;if(!dummy){var dc=document.createElement('canvas');dc.width=dc.height=1;dummy=dc.getContext('2d')}
  env.dummy=dummy;env.RUNE_IMG=FX.RUNE_IMG;env.foes=[];env.dir=c.dir;env.noScy=true;env.ctx=dummy;
  try{var f=FX[id](env);c.HX=f.ev('typeof HX!=="undefined"?HX:HX0');c.HY=f.ev('typeof HY!=="undefined"?HY:HY0');return f}catch(e){console.warn('SCY fx',id,e);return null}}

// ---------------- casts ----------------
function castAtk(id,L,opt){var T=TAB[id],h=hero(),c={id:id,L:L,t:0,ax:h.x,ay:h.y,dir:(h.dir||-1)<0?-1:1,ls:0,ev:[],nT:1,done:false,follow:false};
  if(id==='soulreap'){var r=T.r(L)*rad();c.r=r;var tg=nearest(inR(h.x,h.y,r),h.x,h.y,T.max);c.nT=tg.length;
    c.fx=mkFX('soulreap',c,{LV:L,cfg:{r:r}});c.wisp=new Set();
    // hit time = when the demo blade passes the monster angle (demo foeHits)
    var prox=tg.map(function(m){var p=demoXY(c,m);return {x:p.x,y:p.y,dx:p.x-c.HX,dg:(p.y-c.HY)/K,k:'gob',f:-1}});var HT=null;
    if(c.fx){c.fx.foes=prox;try{HT=c.fx.ev('foeHits')()}catch(e){}c.fx.foes=[];}
    tg.forEach(function(m,i){var ts=HT&&HT[i]?HT[i]:[TM.soulreap.sw+.25];
      c.ev.push({t:ts[0],f:function(){hit(m,T.direct(L),c,{j:0});if(T.bleed(L)){var s=ms(m);s.bleed={pct:T.bleed(L),left:T.bleedT(L),next:1,src:c}}}});
      if(T.second(L))c.ev.push({t:ts[1]||ts[0]+.4,f:function(){hit(m,T.second(L),c,{j:1})}})});
    c.lock=TM.soulreap.sw+.5+(L>=10?.46:0)+.1;c.end=c.fx?c.fx.end():3.2;if(A.onPose)A.onPose('attack',c.lock);}
  else if(id==='storm'){var r2=T.r(L)*rad();c.r=r2;c.follow=true;c.fx=mkFX('storm',c,{LV:L,cfg:{r:r2,n:T.n(L)}});c.walk=T.walk(L);
    var n=T.n(L),T0=TM.storm.T0,SP=TM.storm.SPIN;c.pulled=new Map();
    for(var k=0;k<n;k++)(function(k){c.ev.push({t:T0+(k+.5)*SP/n,f:function(){var hh=hero(),tg=inR(hh.x,hh.y,c.r);c.nT=Math.max(c.nT,tg.length);tg.forEach(function(m){hit(m,T.pct(L),c,{j:k&1})})}})})(k);
    c.spin=[T0,T0+SP];c.lock=c.walk?0:T0+SP;c.end=c.fx?c.fx.end():3.4;if(A.onPose)A.onPose('attack',T0+SP,{spin:true});}
  else if(id==='flying'){var tx,ty;if(opt&&opt.tx!=null){tx=opt.tx;ty=opt.ty}else{tx=h.x+c.dir*T.def;ty=h.y}
    var dx=tx-h.x,dy=ty-h.y,dl=Math.sqrt(dx*dx+dy*dy);if(dl>T.range){tx=h.x+dx/dl*T.range;ty=h.y+dy/dl*T.range;dx=tx-h.x;dy=ty-h.y}
    if(Math.abs(dx)>4)c.dir=dx<0?-1:1;c.cx=tx;c.cy=ty;var R=T.R(L)*rad();c.R=R;
    c.fx=mkFX('flying',c,{LV:L,cfg:{R:R,dur:T.dur(L),n:T.ticks(L)},tx:c.dir*dx,ty:dy});c.tg=new Set();
    var T0f=TM.flying.T0,du=T.dur(L),nt=T.ticks(L);c.storm=[T0f,T0f+du];
    function pick(){var tg=inR(c.cx,c.cy,c.R),out=[];for(var i=0;i<tg.length;i++){var m=tg[i];if(c.tg.has(m))out.push(m);else if(c.tg.size<T.max){c.tg.add(m);out.push(m)}}c.nT=Math.max(c.nT,c.tg.size);return out}
    c.ev.push({t:T0f,f:function(){pick().forEach(function(m){hit(m,T.slash(L),c,{j:0})})}});
    for(var q=0;q<nt;q++)(function(q){c.ev.push({t:T0f+(q+1)*du/nt,f:function(){var p=(L>=10&&q===nt-1)?T.tick(L)*2:T.tick(L);pick().forEach(function(m){hit(m,p,c,{j:q&1})})}})})(q);
    c.lock=TM.flying.TL+.1;c.end=c.fx?c.fx.end():T0f+du+1.3;if(A.onPose)A.onPose('attack',c.lock);}
  c.ev.sort(function(a,b){return a.t-b.t});return c}
function castBuff(id,L){var T=TAB[id],h=hero(),c={id:id,L:L,t:0,ax:h.x,ay:h.y,dir:(h.dir||-1)<0?-1:1,ev:[],follow:true,buff:true};
  if(id==='scream'){var R=T.R(L)*rad();c.fx=mkFX('scream',c,{LV:L});var TS=TM.scream.TS,WT=TM.scream.WT;
    inR(h.x,h.y,R).forEach(function(m){var at=TS+.1+WT*Math.min(1,d2(m,h.x,h.y)/R);c.ev.push({t:at,f:function(){if(!alive(m))return;var s=ms(m);
      var res=m.boss?0.5:1;s.fear=T.fear(L)*res;s.slowAfter=T.slowT;s.slowV=T.slow(L)/100;s.fx=1;marks.push({m:m,t:NOW});if(A.onStatus)A.onStatus(m,'fear',s.fear)}})});
    c.end=c.fx?Math.min(c.fx.end(),TS+WT+2.2):3;c.follow=false;if(A.onPose)A.onPose('buff',TS+.4);}
  else{var dur=T.dur(L),t0=TM.buffT0[id],at=TM.buffAt[id]-t0;
    var env={LV:L,dur:dur,t0:t0};if(id==='soularmor'){var arm=Math.min(T.armor(L),Math.round(hpMax()*0.5));env.shieldMax=arm;env.shieldV=function(){return Math.max(0,shield)}}
    c.fx=mkFX(id,c,env);c.body=true;
    c.ev.push({t:Math.max(0,at-.05),f:function(){var b={id:id,L:L,left:dur};
      if(id==='bloodlust')b.v=T.v(L);if(id==='reaper'){b.rad=T.rad(L);b.as=T.as(L)}
      if(id==='bloodpact')b.up=T.up(L);if(id==='soularmor'){b.def=T.def(L);shieldMax=Math.min(T.armor(L),Math.round(hpMax()*0.5));shield=shieldMax}
      buffs[id]=b;if(A.onBuff)A.onBuff(id,b)}});
    if(id==='bloodpact')c.ev.push({t:TM.pactCost.bloodpact-t0,f:function(){var hh=hero(),cost=hpMax()*T.cost(L)/100;cost=Math.min(cost,Math.max(0,(hh.hp||0)-1));if(A.spendHP)A.spendHP(cost)}});
    c.end=(c.fx?c.fx.end()-t0:at+dur+1);if(A.onPose)A.onPose('buff',.8);}
  c.ev.sort(function(a,b){return a.t-b.t});return c}

// ---------------- public ----------------
var SCY={TAB:TAB,PAS:PAS,CAP:CAP,cfg:cfg,
 init:function(adapter){A=adapter;K=adapter.K||0.5;return SCY},
 ids:['soulreap','storm','flying','bloodlust','reaper','scream','bloodpact','soularmor'],
 cdLeft:function(id){return Math.max(0,cds[id]||0)},
 resetCd:function(){cds={}},
 mpCost:function(id,L){return TAB[id].mp(L)},
 canCast:function(id,L){if(!cfg.enabled||!A)return 'off';var T=TAB[id];if(!T)return 'unknown';if((cds[id]||0)>0)return 'cd';
   var h=hero();if(h.mp!=null&&h.mp<T.mp(L))return 'mp';if(SCY.locked())return 'busy';return ''},
 cast:function(id,L,opt){var why=SCY.canCast(id,L);if(why)return why;var T=TAB[id];
   if(A.spendMP)A.spendMP(T.mp(L));cds[id]=T.cd;var c=T.kind==='atk'?castAtk(id,L,opt):castBuff(id,L);inst.push(c);if(A.onCast)A.onCast(id,L,c);return ''},
 setPassive:function(id,L){if(id in pas)pas[id]=Math.max(0,Math.min(5,L|0))},
 getPassive:function(id){return pas[id]||0},
 // hero is held in place (no walking) while true
 locked:function(){for(var i=0;i<inst.length;i++){var c=inst[i];if(c.lock&&c.t<c.lock)return true}return false},
 // modifiers the game should read each frame
 mods:function(){return {dmgMul:dmgMul(1),aspd:buffs.reaper?1+buffs.reaper.as/100:1,range:rad(),defPct:buffs.soularmor?buffs.soularmor.def:0,
   maxHpPct:pas.spirit?PAS.spirit.v(pas.spirit):0,shield:Math.max(0,shield),shieldMax:shieldMax,buffs:buffs}},
 // monster status the game should respect: feared monsters run away and do not attack; pulled ones do not attack
 mob:function(m){var s=MS.get(m);if(!s)return null;return {fear:s.fear>0,slow:s.slowV&&s.slowT>0?s.slowV:(s.pullSlow||0),noAttack:s.fear>0||s.pulled>0,pulled:s.pulled>0}},
 // call when the hero takes damage; returns damage left after Soul Armor
 absorb:function(dmg){if(shield<=0||!buffs.soularmor)return dmg;var a=Math.min(shield,dmg);shield-=a;if(shield<=0){shield=0}return dmg-a},
 // call from the game's basic scythe hits so Bloodlust / Won't Die lifesteal also work on normal attacks
 onBasicHit:function(m,pct){lifesteal(pct||100,null)},
 basicMul:function(){return dmgMul(1)},
 onKill:function(m){if(pas.harvest)giveHeal(PAS.harvest.v(pas.harvest),'harvest',{kind:'harvest'});marks.push({m:{x:m.x,y:m.y},t:NOW,k:'harvest'})},
 shake:function(){var s=0;inst.forEach(function(c){if(c.fx)s=Math.max(s,c.fx.shake||0)});return s},
 active:function(){return inst.map(function(c){return c.id})},
 update:function(dt){if(!A)return;NOW+=dt;var h=hero();
   for(var id in cds)if(cds[id]>0)cds[id]-=dt;
   for(var b in buffs){buffs[b].left-=dt;if(buffs[b].left<=0){if(b==='soularmor'){shield=0;shieldMax=0}delete buffs[b];if(A.onBuff)A.onBuff(b,null)}}
   for(var i=inst.length-1;i>=0;i--){var c=inst[i];c.t+=dt;if(c.follow){c.ax=h.x;c.ay=h.y;if(c.buff||c.id==='storm')c.dir=(h.dir||-1)<0?-1:1}
     while(c.ev.length&&c.ev[0].t<=c.t){var e=c.ev.shift();try{e.f()}catch(err){console.warn('SCY ev',c.id,err)}}
     // pulls
     if(c.id==='storm'&&c.t>=c.spin[0]&&c.t<c.spin[1]){var sp=TAB.storm.pull/(c.spin[1]-c.spin[0])*2.2;inR(h.x,h.y,c.r).forEach(function(m){if(m.boss)return;var got=c.pulled.get(m)||0;if(got>=TAB.storm.pull)return;
       var dx=h.x-m.x,dy=h.y-m.y,l=Math.sqrt(dx*dx+dy*dy);if(l<24)return;var st=Math.min(sp*dt*(m.elite?.5:1),TAB.storm.pull-got,l-24);A.moveMob(m,dx/l*st,dy/l*st);c.pulled.set(m,got+st)})}
     if(c.id==='flying'){var on=c.t>=c.storm[0]&&c.t<c.storm[1];c.tg.forEach(function(m){var s=ms(m);if(!alive(m)){s.pulled=0;return}
       if(on&&!m.boss&&d2(m,c.cx,c.cy)<=c.R*1.15){var dx=c.cx-m.x,dy=c.cy-m.y,l=Math.sqrt(dx*dx+dy*dy);s.pulled=.15;if(l>20){var st=Math.min(TAB.flying.pullV*(m.elite?.5:1)*dt,l-20);A.moveMob(m,dx/l*st,dy/l*st)}}
       s.pullSlow=on?TAB.flying.slow(c.L):0;if(!on)s.pullSlow=0})}
     if(c.fx){try{c.fx.step(dt)}catch(err){console.warn('SCY fx step',c.id,err);c.fx=null}}
     if(c.t>=c.end+.3&&!c.ev.length)inst.splice(i,1)}
   // monster status timers + bleed
   var L=A.mobs()||[];for(var j=0;j<L.length;j++){var m=L[j],s=MS.get(m);if(!s)continue;
     if(s.pulled>0)s.pulled-=dt;
     if(s.fear>0){s.fear-=dt;if(s.fear<=0){s.slowT=s.slowAfter||0}}else if(s.slowT>0)s.slowT-=dt;
     if(s.bleed&&alive(m)){s.bleed.next-=dt;if(s.bleed.next<=0){s.bleed.next+=1;s.bleed.left--;hit(m,s.bleed.pct,null,{bleed:true,id:'soulreap_bleed',noMul:false});if(s.bleed.left<=0)s.bleed=null}}
     else if(s.bleed)s.bleed=null}
   for(var q=marks.length-1;q>=0;q--)if(NOW-marks[q].t>1.2)marks.splice(q,1)},
 // draw in WORLD coordinates (the ctx already has the camera transform). pass 'back' = under hero/monsters, 'front' = over.
 draw:function(ctx,pass){if(!A)return;var h=hero();
   if(pass==='back')passiveBack(ctx,h);
   for(var i=0;i<inst.length;i++){var c=inst[i];if(!c.fx)continue;ctx.save();ctx.translate(c.ax,c.ay);var sc=c.body?cfg.bodyScale:cfg.fxScale;if(sc!==1)ctx.scale(sc,sc);ctx.scale(c.dir,1);ctx.translate(-c.HX,-c.HY);
     try{c.fx.draw(ctx,pass)}catch(err){console.warn('SCY fx draw',c.id,err);c.fx=null}ctx.restore()}
   if(pass==='front')statusFront(ctx,h)}
};
// ---------------- passive + status drawing (simple glows in the scythe colours) ----------------
function glowAt(ctx,x,y,r,col,a){if(a<=0)return;var g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a;ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,r,r*K,0,0,6.283);ctx.fill();ctx.restore()}
function passiveBack(ctx,h){var hf=hpFrac();
  if(pas.pain&&hf<=0.20)glowAt(ctx,h.x,h.y,70,'rgba(224,36,94,.9)',.35+.12*Math.sin(NOW*6));
  if(pas.wontdie&&hf<PAS.wontdie.th(pas.wontdie))glowAt(ctx,h.x,h.y,55,'rgba(255,79,143,.9)',.3+.1*Math.sin(NOW*4))}
function statusFront(ctx,h){var L=A.mobs()||[];ctx.save();
  for(var j=0;j<L.length;j++){var m=L[j],s=MS.get(m);if(!s||!alive(m))continue;
    if(s.fear>0){var y=m.y-(m.h||60)-14+Math.sin(NOW*8+j)*2;ctx.globalAlpha=.95;ctx.fillStyle='rgba(40,10,60,.85)';ctx.strokeStyle='#ff9fc0';ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(m.x,y,9,0,6.283);ctx.fill();ctx.stroke();
      ctx.fillStyle='#ffd6ec';ctx.font='bold 13px Sarabun,sans-serif';ctx.textAlign='center';ctx.fillText('!',m.x,y+5)}
    else if(s.slowT>0){ctx.globalAlpha=.7;ctx.strokeStyle='#8a4dff';ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(m.x,m.y+2,17,6,0,0,6.283);ctx.stroke()}
    if(s.bleed){var by=m.y-(m.h||60)-26-Math.sin(NOW*6+m.x)*2;ctx.globalAlpha=.9;ctx.fillStyle='#c4142f';ctx.strokeStyle='#ffd0d6';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(m.x,by-10);ctx.bezierCurveTo(m.x+9,by+1,m.x+7,by+9,m.x,by+9);ctx.bezierCurveTo(m.x-7,by+9,m.x-9,by+1,m.x,by-10);ctx.fill();ctx.stroke()}}
  for(var q=0;q<marks.length;q++){var k=marks[q];if(k.k!=='harvest'||!pas.harvest)continue;var u=(NOW-k.t)/1.2;
    // a pale soul rises from the kill and flies to the hero
    var x=k.m.x+(h.x-k.m.x)*u*u,y=(k.m.y-30)+(h.y-40-(k.m.y-30))*u*u-Math.sin(u*Math.PI)*50;glowAt(ctx,x,y,16,'rgba(184,255,240,.95)',(1-u)*.9)}
  if(shield>0&&buffs.soularmor&&shieldMax>0){var bw=70,bx=h.x-bw/2,byy=h.y-cfg.heroH-14;ctx.globalAlpha=.95;ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(bx-1,byy-1,bw+2,9);ctx.fillStyle='#4c63d8';ctx.fillRect(bx,byy,bw*shield/shieldMax,7);ctx.fillStyle='rgba(220,235,255,.9)';ctx.fillRect(bx,byy,bw*shield/shieldMax,2)}
  ctx.restore()}
window.SCY=SCY;
})();

