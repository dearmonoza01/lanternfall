
/* ---- p327 r3 = r2 + chapter 2 (Map 5-6, ORDER_20261029_ch2-quests.md, story DeaRz OK 29 Oct 06:39): window.__QDATA2_CH2 is merged into
   the chapter-1 data (off: ?ch2quest=off) + Map 5 north arch rubble / Map 6 ice gate by per-player flags, Mistling in the Map 5/6 zones,
   quest-only Mistling packs, the maddened Veilwater Serpent (per player, art pending), new effects. See the "chapter 2" block below.
   p327 r2: chapter-1 quest engine + NPC affinity + Map 4→5 gate (TEST).
   r1 order orders/code/ORDER_20261029_chapter1-quests.md (DeaRz OK 28 Oct 21:28) · r2 story data order ORDER_20261029_ch1-story-v3.md (DeaRz OK 29 Oct 04:34).
   Everything is read from window.__QDATA2 (quests / npcs / points / items / affinity / ui), embedded by the build; this file holds no story text.
   - state lives in the same per-player quest save as the prologue (PROLOGUE.st(): S.c1 = {q:{id:{s,o,i}}, aff:{npc:{v,d,c}}}, S.flags);
     needs the prologue module (?prologue=off also turns this off). Off: ?ch1quest=off.
   - objective kinds: talk, deliver, buy, use, kill(zone/near/variant), collect(point | drop with dropFrom), reach, interact(hold/fx/give),
     hit_dummy(weapon), switch_weapon, flag, cutscene(point/actor/fx/sfx/setFlag/give/take). Objectives run in order; their "say" lines play
     when one completes. A line is {who,say} ("(…)" who = narration), {choice:[{label,flag:"c_x=v",reply}]} or {…, if:"c_x=v" | "done:id"}.
   - rewards: EXP = value × 0.5 when the player is > 5 levels above the quest level; gold = goldMult × (6 + 3.4 × quest level) (Balance 28 Oct).
   - affinity 0–100 per player per NPC: daily talk +1, liked gift +3 (2/day), other gift +1 (2/day), purchase ≥ 100 gold +1 (3/day),
     non-quest total ≤ 12/day; quest rewards from data. Steps 20/50/80 from data. Day = local date of nowMs().
   - Map 4 → Map 5 portal works only with flag map4_portal_open (per player); characters from before this system (legacy) keep it open.
   - NPCs / scene actors are TEST stand-in tokens with "รอภาพ" until their art arrives; small effects (lantern light, mist, bloom) are drawn here. ---- */
(function(){'use strict';const Q=String(location.search);
const C1=window.CH1Q={ver:'p327-r3',on:!/ch1quest=off/.test(Q),ok:false,err:null,stats:{ev:0,done:0,talks:0,gate:0,gifts:0,buys:0,saves:0,cuts:0,drops:0},log:[]};
if(!C1.on)return;
try{
// chapter 2 data joins the chapter-1 data before anything reads it (?ch2quest=off leaves the game exactly as r2)
const CH2=(!/ch2quest=off/.test(Q)&&window.__QDATA2_CH2)||null;C1.ch2=!!CH2;
if(CH2&&window.__QDATA2&&!window.__QDATA2.c2merged){const D0=window.__QDATA2;D0.c2merged=1;D0.quests=(D0.quests||[]).concat(CH2.quests);D0.points=(D0.points||[]).concat(CH2.points);
  const byId={};for(const n of (D0.npcs=D0.npcs||[]))byId[n.id]=n;for(const n of CH2.npcs){if(byId[n.id])Object.assign(byId[n.id],n);else{D0.npcs.push(n);byId[n.id]=n;}}
  if(byId.npc_demon_wounded)Object.assign(byId.npc_demon_wounded,CH2.kraga);if(byId.npc_traveler_m4)byId.npc_traveler_m4.at2=CH2.reoAt2;
  D0.items=Object.assign(D0.items||{},CH2.items);D0.ui=Object.assign(D0.ui||{},CH2.ui);
  const AN=((D0.affinity=D0.affinity||{}).npcs=D0.affinity.npcs||{});for(const [id,l] of Object.entries(CH2.liked||{})){AN[id]=AN[id]||{name:(byId[id]||{}).name};AN[id].likedIds=Array.from(new Set((AN[id].likedIds||[]).concat(l)));}}
const D=window.__QDATA2||{},QS=D.quests||[],QBY={},NPC={},PT={},UI=D.ui||{},AFF=(D.affinity&&D.affinity.npcs)||{};
for(const q of QS)QBY[q.id]=q;for(const n of (D.npcs||[]))NPC[n.id]=n;for(const p of (D.points||[]))PT[p.id]=p;
const say=s=>{C1.log.push([Math.round((typeof time!=='undefined'?time:0)*10)/10,s]);if(C1.log.length>400)C1.log.shift();};
const PRO=()=>window.PROLOGUE,ST=()=>{const p=PRO();return p&&p.st?p.st():null;},UIx=()=>(PRO()&&PRO().ui)||null;
const t=(k,v)=>{let s=UI[k]||k;if(v)for(const [a,b] of Object.entries(v))s=s.split('{'+a+'}').join(b);return s;};   // UI strings come from data
function c1(){const S=ST();if(!S)return null;if(!S.c1)S.c1={q:{},aff:{}};if(!S.flags)S.flags={};return S;}
const live=()=>{const S=c1();return !!(S&&S.flags.prologueDone&&typeof G!=='undefined'&&G.state==='play');};
const dlgOpen=()=>{const u=UIx();return !!(u&&u.isOpen());};
const clk=()=>performance.now()/1000;
/* ---------- quest items (Code-created; icon = colour until Art) ---------- */
for(const [id,it] of Object.entries(D.items||{})){try{if(!ITEMS[id])ITEMS[id]=Object.assign({k:'mat',price:0,sell:0,col:'#ffd36b',c1q:it.gift?0:1},it);}catch(_){}}
const itemName=id=>ITEMS[id]?ITEMS[id].n:id;
const noSell=it=>!!(it&&it.id&&ITEMS[it.id]&&(ITEMS[it.id].key||ITEMS[it.id].c1q));
/* ---------- day + affinity ---------- */
function today(){const d=new Date(typeof nowMs==='function'?nowMs():Date.now());return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
const CAP=Object.assign({talk:[1,1],like:[3,2],other:[1,2],buy:[1,3],total:12},(D.affinity&&D.affinity.rules)||{});
function affRec(id){const S=c1();let a=S.c1.aff[id];if(!a)a=S.c1.aff[id]={v:0,d:'',c:{}};const d=today();if(a.d!==d){a.d=d;a.c={};}return a;}
function aff(id){const S=c1();return S&&S.c1.aff[id]?S.c1.aff[id].v:0;}
function affAdd(id,src,quest){const n=NPC[id];if(!n||n.affinity===false)return 0;if(n.affGate&&!c1().flags[n.affGate])return 0;   // Kraga counts only after kraga_met (c2_m3)
  const a=affRec(id),v0=a.v;let add=0;
  if(quest){add=quest;}else{const [pts,cap]=CAP[src]||[0,0];if((a.c[src]||0)>=cap)return 0;if((a.c.tot||0)+pts>CAP.total)return 0;a.c[src]=(a.c[src]||0)+1;a.c.tot=(a.c.tot||0)+pts;add=pts;}
  a.v=Math.min(100,a.v+add);for(const s of [20,50,80,100])if(v0<s&&a.v>=s){try{notify((n.name||id)+' · '+t('affStep')+' '+s);}catch(_){}say('aff '+id+' '+s);}
  return a.v-v0;}
function discount(id){const s=AFF[id]&&AFF[id].s50;return aff(id)>=50&&s&&s.discountPct?s.discountPct:0;}
/* ---------- quest state ---------- */
const qs=id=>{const S=c1();return S&&S.c1.q[id];};
const isDone=id=>{const r=qs(id);return !!(r&&r.s==='d');};
function reqOk(q){const S=c1(),R=q.requires||{};if(!S||!S.flags.prologueDone)return false;
  if((R.after||[]).some(a=>!isDone(a)&&!(S.flags.prologueDone&&String(a).startsWith('pro_'))))return false;
  if((P.lvl||1)<(R.lv||1))return false;if(R.aff&&Object.entries(R.aff).some(([n,v])=>aff(n)<v))return false;
  if((R.flags||[]).some(f=>!S.flags[f]))return false;return true;}
const avail=q=>!qs(q.id)&&reqOk(q);
const curObj=q=>{const r=qs(q.id);return r&&r.s==='a'?q.objectives[r.i]:null;};
const need=o=>o.n||1;
/* ---------- dialogue lines: {who,say} / narration / choice / if ---------- */
const NAR=/^\(/;const VIS=new Set();
function condOk(l){if(!l||!l.if)return true;const S=c1();return String(l.if).split('&').every(c=>{let neg=c[0]==='!';if(neg)c=c.slice(1);
  let ok;if(c.startsWith('done:'))ok=isDone(c.slice(5));else{const [k,v]=c.split('=');ok=v==null?!!S.flags[k]:String(v).split('|').indexOf(String(k==='race'&&window.__RACE_NOW?window.__RACE_NOW():S.flags[k]))>=0;}return neg?!ok:ok;});}
function setChoiceFlag(f){const S=c1(),[k,v]=String(f).split('=');S.flags[k]=v==null?true:v;}
const npcName=id=>NPC[id]?NPC[id].name:'';
function toLine(l,defNpc){if(typeof l==='string')return {who:npcName(defNpc),text:l};const w=l.who||'';
  if(NAR.test(w)){const vis=/^\(ภาพนิมิต/.test(w),text=(vis?'【'+w.slice(1,-1)+'】 ':'')+(l.say||'');if(vis)VIS.add(text);return {who:'',text,nar:true};}
  return {who:w,text:l.say||''};}
function play(lines,defNpc,done,endChoices){lines=(lines||[]).filter(condOk);const u=UIx();if(!u){done&&done();return;}
  const seg=[];let i=0;for(;i<lines.length;i++){if(lines[i]&&lines[i].choice)break;seg.push(toLine(lines[i],defNpc));}
  if(i<lines.length){const ch=lines[i].choice,rest=lines.slice(i+1);if(!seg.length)seg.push({who:npcName(defNpc),text:t('choose'),nar:true});
    u.openDlg(seg,c=>{const o=c&&ch[c.k2];if(o&&o.flag){setChoiceFlag(o.flag);say('choice '+o.flag);save();}play(((o&&o.reply)||[]).concat(rest),defNpc,done,endChoices);},ch.map((c,k)=>({label:c.label,k2:k})));return;}
  if(!seg.length){if(!endChoices){done&&done();return;}seg.push({who:npcName(defNpc),text:'...'});}
  u.openDlg(seg,done,endChoices);}
const dlgLines=(npc,lines,done,choices)=>play(lines,npc,done,choices);
function thought(s){const u=UIx();if(u)u.thought(s);}
/* ---------- quest flow ---------- */
function start(q){const S=c1();S.c1.q[q.id]={s:'a',i:0,o:q.objectives.map(()=>0)};say('accept '+q.id);
  for(const g of (q.startGive||[]))if(countItem(g.id)<g.n)addItem({id:g.id,q:g.n-countItem(g.id)});
  onObjStart(q);save();renderTrack();
  const o=curObj(q);if(o&&o.kind==='talk'&&o.npc&&o.npc===q.giver)progress(q,need(o));}   // the talk goes on right after accepting
function objFx(o){const p=PT[o.point];if(o.fx)fx(o.fx,p?p.x:P.x,p?p.y:P.y);if(o.sfx)sfxC1(o.sfx);if(o.take)takeItem(o.take,1);if(o.give)addItem({id:o.give,q:1});if(o.setFlag)c1().flags[o.setFlag]=true;}
function progress(q,add,abs){const r=qs(q.id),o=curObj(q);if(!o)return;const v=abs!=null?abs:r.o[r.i]+add;r.o[r.i]=Math.min(need(o),v);
  if(r.o[r.i]>=need(o)){say('obj '+q.id+' #'+r.i+' '+o.kind);r.i++;
    if(o.kind!=='cutscene'){objFx(o);const th=o.think||[];if(th.length)thought(th[0]);}
    const lines=o.kind==='cutscene'?[]:(o.say||[]);
    if(lines.length)dlgLines(o.npc||q.receiver||q.giver,lines,()=>afterObj(q));else afterObj(q);}
  renderTrack();save();}
function afterObj(q){const r=qs(q.id);if(!r||r.s!=='a')return;if(r.i>=q.objectives.length){const last=q.objectives[q.objectives.length-1];if(q.receiver&&!(last&&(last.kind==='talk'||last.kind==='deliver')&&last.npc===q.receiver)){r.s='r';say('ready '+q.id);}else finish(q);}else onObjStart(q);renderTrack();}
function finish(q){const r=qs(q.id);if(!r||r.s==='d')return;const done=(q.dialogue&&q.dialogue.done)||[];r.s='d';
  if(done.length)dlgLines(q.receiver||q.giver,done,()=>reward(q));else reward(q);C1.stats.done++;say('done '+q.id);renderTrack();save();}
function giveItem(id,n,out){let got=0;for(let k=0;k<n;k++){let ok;
    if(id==='gear:held'){const L=(QBY[out.q]&&QBY[out.q].reward.expLevelUsed)||P.lvl||1,w=makeWeapon((P.weapon&&P.weapon.t&&P.weapon.t!=='fist')?P.weapon.t:'sword',L,0);ok=P.inv.length<Math.max(P.invSize||64,1)?(P.inv.push(w),true):false;}
    else ok=addItem({id,q:1});if(ok)got++;else out.full=1;}return got;}
function reward(q){const S=c1(),R=q.reward||{},L=R.expLevelUsed||R.lv||1,out={q:q.id};
  try{let ex=R.exp||0;if((P.lvl||1)-L>(R.expHalfIfPlayerAboveLevelBy||5))ex=Math.round(ex*.5);if(ex>0){gainExp(ex,P.x,P.y-60);out.exp=ex;}}catch(e){C1.err='exp '+e.message;}
  try{const g=Math.round((R.goldMult||0)*(6+3.4*L));if(g>0){P.gold=(P.gold||0)+g;out.gold=g;try{if(typeof textAt==='function')textAt('+'+g+' G',P.x,P.y-90,'#ffd36b');}catch(_){}}}catch(e){C1.err='gold '+e.message;}
  for(const it of (R.items||[])){try{let id=it.id;if(id==='skillbook:held')id='c1_skillbook_'+((P.weapon&&P.weapon.t)||'sword');if(id.startsWith('c1_skillbook_')&&!ITEMS[id])id='c1_skillbook_sword';
    giveItem(id,it.n||1,out);out.items=(out.items||[]).concat(id+'×'+(it.n||1));}catch(e){C1.err='item '+e.message;}}
  for(const f of (R.flags||[]))S.flags[f]=true;
  if(R.affinity){for(const [n,v] of Object.entries(R.affinity))affAdd(n,null,v);out.aff=R.affinity;}
  else if(q.type==='side'&&q.giver&&NPC[q.giver]&&NPC[q.giver].affinity!==false){const an=q.giver,first=!Object.values(S.c1.q).some(x=>x.s==='d'&&x.affGiven===an);affAdd(an,null,first?15:10);qs(q.id).affGiven=an;out.aff=an;}
  try{notify(t('questDone')+': '+q.name);}catch(_){}delete out.q;say('reward '+q.id+' '+JSON.stringify(out));C1.last=out;save();}
/* ---------- events from the game ---------- */
function active(){const S=c1();if(!S)return [];return QS.filter(q=>{const r=S.c1.q[q.id];return r&&r.s==='a';});}
function nearPt(id,e,R){const p=PT[id];return !p||(p.zone===G.zone&&Math.hypot(e.x-p.x,e.y-p.y)<(R||800));}
function ev(kind,d){if(!live())return;C1.stats.ev++;
  for(const q of active()){const o=curObj(q);if(!o||o.kind!==kind)continue;
    if(kind==='kill'){if((o.types||[]).includes(d.type)&&(!o.zone||o.zone===G.zone)&&(!o.near||nearPt(o.near,d))&&(!o.variant||d.v===o.variant))progress(q,1);}
    else if(kind==='use'||kind==='buy'){if(!o.item||o.item===d.item)progress(q,d.n||1);}
    else if(kind==='switch_weapon')progress(q,1);
    else if(kind==='hit_dummy'){if(!o.weapon||o.weapon===d.w)progress(q,1);}
    else if(kind==='reach'||kind==='interact'){if(o.point===d.point)progress(q,need(o));}
    else if(kind==='flag'){if(c1().flags[o.name])progress(q,need(o));}}}
C1.ev=ev;
const PEND=[];   // point-less cutscenes wait until no dialogue is open
function onObjStart(q){const o=curObj(q);if(!o)return;if(o.kind==='flag'&&c1().flags[o.name])progress(q,need(o));
  if(o.kind==='collect')progress(q,0,Math.min(need(o),countItem(o.item)));if(o.kind==='hit_dummy')dummies();
  if(o.kind==='cutscene'&&!o.point)PEND.push(q.id);ensureVariant();}
function dropFor(q,o){const ty=o.dropFrom||o.types||[];if(o.p!=null)return o.p;   // a kill objective of the same mobs in the quest → every kill drops one
  return q.objectives.some(k=>k.kind==='kill'&&(k.types||[]).some(x=>ty.includes(x))&&need(k)>=need(o))?1:.6;}
let LASTVAR=null;
{const o=killEnemy;killEnemy=function(e){if(e&&e.c1Dummy){e.hp=e.maxHp;e.dead=false;return;}const was=e&&e.dead,r=o.apply(this,arguments);
  try{if(e&&!was&&e.dead&&!e.lab&&!e.dev){if(e.c1Var)LASTVAR={x:e.x,y:e.y};ev('kill',{type:e.type,v:e.c1Var,x:e.x,y:e.y});
    for(const q of active()){const rr=qs(q.id);q.objectives.forEach((ob,j)=>{if(j<rr.i||ob.kind!=='collect'||ob.from!=='drop'||!(ob.dropFrom||ob.types||[]).includes(e.type))return;
      if(countItem(ob.item)>=need(ob)||Math.random()>=dropFor(q,ob))return;addItem({id:ob.item,q:1});C1.stats.drops++;
      try{if(typeof textAt==='function')textAt('+1 '+itemName(ob.item),e.x,e.y-40,'#bff5a0');}catch(_){}
      if(j===rr.i)progress(q,0,Math.min(need(ob),countItem(ob.item)));});}}}catch(er){C1.err='kill '+er.message;}return r;};}
if(typeof useItemId==='function'){const o=useItemId;useItemId=function(id){const n0=(()=>{try{return countItem(id);}catch(_){return 0;}})(),r=o.apply(this,arguments);try{if(countItem(id)<n0)ev('use',{item:id});}catch(_){}return r;};}
{const o=applyDamage;applyDamage=function(e,d,crit,op){const r=o.apply(this,arguments);try{if(e&&e.c1Dummy&&!(op&&op.dot)){ev('hit_dummy',{w:P.weapon&&P.weapon.t});e.hp=e.maxHp;e.dead=false;}}catch(_){}return r;};}
// key items and quest items: never sold (bag sell + shop sell)
if(typeof sellInv==='function'){const o=sellInv;sellInv=function(i){if(noSell(P.inv[i])){try{notify(t('keyItem'));}catch(_){}return;}return o.apply(this,arguments);};}
try{if(typeof doSell==='function'&&typeof SHOPV!=='undefined'){const o=doSell;doSell=function(){try{for(const it of [...SHOPV.sel])if(noSell(it))SHOPV.sel.delete?SHOPV.sel.delete(it):0;}catch(_){}return o.apply(this,arguments);};}}catch(_){}
let lastW=null;
/* ---------- fixed NPCs ---------- */
const NP=Object.values(NPC).filter(n=>n.at&&n.at.zone&&!n.actor);   // n.at = {zone,x,y} chosen by Code (positions table in the data build)
function shown(n){const s=n.showIf;if(!s)return true;const r=qs(s.quest);return !!(r&&(r.s!=='a'||r.i>=(s.idx||0)));}
function npcHere(){return typeof G==='undefined'||!live()?[]:NP.filter(n=>n.at.zone===G.zone&&shown(n));}
function mark(n){if(!live())return null;for(const q of QS){const r=qs(q.id);if(r&&r.s==='r'&&q.receiver===n.id)return '?';
    const o=curObj(q);if(o&&(o.kind==='talk'||o.kind==='deliver')&&o.npc===n.id&&(o.kind==='talk'||countItem(o.item)>=need(o)))return '?';}
  for(const q of QS)if(q.giver===n.id&&avail(q)&&!q.auto)return '!';return null;}
function talk(n){C1.stats.talks++;try{if(window.NPCAFF254&&n)NPCAFF254.cur=n.id}catch(_){}say('talk '+n.id);try{if(window.TRAINWPN246&&TRAINWPN246.on)TRAINWPN246.talk(n)}catch(_){}
  // 1) turn in, 2) talk/deliver objective, 3) offer a quest, 4) quest in progress, 5) idle talk (affinity lines, shop, gift)
  for(const q of QS){const r=qs(q.id);if(r&&r.s==='r'&&q.receiver===n.id){finish(q);return;}}
  for(const q of active()){const o=curObj(q);if(!o||o.npc!==n.id)continue;
    if(o.kind==='talk'){progress(q,need(o));return;}
    if(o.kind==='deliver'){if(countItem(o.item)>=need(o)){takeItem(o.item,need(o));progress(q,need(o));}else dlgLines(n.id,[t('notYet')+' ('+itemName(o.item)+' '+countItem(o.item)+'/'+need(o)+')']);return;}}
  const offer=QS.find(q=>q.giver===n.id&&avail(q)&&!q.auto);
  if(offer){const b=(offer.dialogue&&offer.dialogue.before)||[];dlgLines(n.id,(b.length?b:[]).concat([{who:'(q)',say:'【'+offer.name+'】'}]),c=>{if(c&&c.k==='yes')start(offer);},[{label:t('accept'),k:'yes'},{label:t('later'),k:'no'}]);return;}
  idle(n);}
function idle(n){const a=n.affinity!==false?affRec(n.id):null;if(a)affAdd(n.id,'talk');
  const A=AFF[n.id]||{},v=aff(n.id);let lines=(n.idle||[]).slice(0,2);
  if(v>=50&&A.s50&&A.s50.text&&(a.c.talkTurn=(a.c.talkTurn||0)+1)%2===0)lines=A.s50.text;else if(v>=20&&A.s20)lines=A.s20;
  const ch=[];if(n.shop)ch.push({label:t('shop'),k:'shop'});if(n.service)ch.push({label:t('service'),k:'svc'});if(n.affinity!==false)ch.push({label:t('gift'),k:'gift'});ch.push({label:t('bye'),k:'bye'});
  dlgLines(n.id,lines.length?lines:['...'],c=>{if(!c)return;if(c.k==='shop')shop(n);else if(c.k==='gift')giftMenu(n);else if(c.k==='svc'){try{openWin_v3(n.service);}catch(e){C1.err='svc '+e.message;}}},ch.slice(0,4));}
function shop(n){const off=discount(n.id),list=n.shop||[];if(window.__SHOPWIN&&__SHOPWIN.on&&__SHOPWIN.openNpc&&__SHOPWIN.openNpc({name:n.name,off,list:list.map(s=>({id:s.id,p:Math.round(s.price*(100-off)/100)})),buy:(id,p,q)=>{let done=0;for(let i=0;i<q;i++){if((P.gold||0)<p)break;if(!addItem({id,q:1})){try{notify(t('bagFull'))}catch(_){}break}P.gold-=p;C1.stats.buys++;if(p>=100)affAdd(n.id,'buy');ev('buy',{item:id});done++}if(done)save();return done}}))return;const ch=list.slice(0,3).map(s=>{const p=Math.round(s.price*(100-off)/100);return {label:itemName(s.id)+' '+p+'G',k:'buy',id:s.id,p};});ch.push({label:t('bye'),k:'bye'});
  dlgLines(n.id,[t('shopLine')+(off?' (−'+off+'%)':'')+' · '+t('gold')+' '+(P.gold|0)],c=>{if(!c||c.k!=='buy')return;
    if((P.gold||0)<c.p){try{notify(t('noGold'));}catch(_){}shop(n);return;}
    if(!addItem({id:c.id,q:1})){try{notify(t('bagFull'));}catch(_){}return;}P.gold-=c.p;C1.stats.buys++;if(c.p>=100)affAdd(n.id,'buy');ev('buy',{item:c.id});save();shop(n);},ch);}
function questNeeds(){const s=new Set();for(const q of active()){const r=qs(q.id);q.objectives.forEach((o,j)=>{if(j>=r.i&&o.item)s.add(o.item);});}return s;}
function giftMenu(n){const A=AFF[n.id]||{},liked=A.likedIds||[],busy=questNeeds();
  const inv=(P.inv||[]).filter(x=>x&&x.id&&ITEMS[x.id]&&!ITEMS[x.id].c1q&&!ITEMS[x.id].key&&!ITEMS[x.id].keep&&!busy.has(x.id)&&x.q>0);
  const pick=[...inv.filter(x=>liked.includes(x.id)),...inv.filter(x=>!liked.includes(x.id))].slice(0,3);
  const ch=pick.map(x=>({label:itemName(x.id),k:'g',id:x.id}));ch.push({label:t('bye'),k:'bye'});
  dlgLines(n.id,[t('giftLine')],c=>{if(!c||c.k!=='g')return;if(!takeItem(c.id,1))return;const lk254=liked.includes(c.id),got=affAdd(n.id,lk254?'like':'other');C1.stats.gifts++;let th254=t('giftThanks');try{if(window.NPCAFF254&&NPCAFF254.on&&got>0)th254=NPCAFF254.gift(n,got,lk254)||th254}catch(_){}
    dlgLines(n.id,[got>0?th254:t('giftCap')]);save();},ch);}
/* ---------- points (reach / interact / collect / cutscene) + training dummies ---------- */
function pointsHere(){const out=[];if(!live())return out;for(const q of active()){const o=curObj(q);if(!o)continue;
  const ids=o.point?[o.point]:(o.points||[]);for(const id of ids){const p=PT[id];if(p&&p.zone===G.zone&&!(o.kind==='collect'&&(qs(q.id).got||{})[id]))out.push({p,q,o});}}return out;}
let HOLD=null;
function tickPoints(dt){if(dlgOpen()||CUT)return;
  for(const {p,q,o} of pointsHere()){const d=Math.hypot(P.x-p.x,P.y-p.y),r=p.r||60;if(d>r)continue;
    if(o.kind==='reach'){ev('reach',{point:p.id});return;}
    else if(o.kind==='collect'&&o.from!=='drop'){if(countItem(o.item)>=need(o))continue;const rr=qs(q.id);rr.got=rr.got||{};rr.got[p.id]=1;addItem({id:o.item,q:1});try{if(typeof textAt==='function')textAt('+1 '+itemName(o.item),p.x,p.y-50,'#bff5a0');}catch(_){}progress(q,0,Math.min(need(o),countItem(o.item)));
      if(o.points&&o.points.length<need(o)){rr.got={};}   // fewer spots than items (one flowerbed, 5 flowers): the spot refills after a step away
      return;}
    else if(o.kind==='cutscene'){cutscene(q,o);return;}}
  if(HOLD){if(Math.hypot(P.x-HOLD.x,P.y-HOLD.y)>40){HOLD=null;thought(t('holdBroken'));}else if((HOLD.t-=dt)<=0){const h=HOLD;HOLD=null;ev('interact',{point:h.id});}}}
const DUMS=[];function dummies(){try{if(G.zone!=='astoria_capital')return;safeLift(true);for(const e of enemies)if(e.c1Dummy)return;
  for(const p of ((window.DUMMYTEST247&&DUMMYTEST247.on&&DUMMYTEST247.spots)||D.dummySpots||[])){const e=makeEnemy('devdummy',1,p[0],p[1]);if(!e){say('dummy null');continue;}e.c1Dummy=1;if(window.DUMMYTEST247&&DUMMYTEST247.on){e.dt247=1;e.x=p[0];e.y=p[1];}e.sx0=e.x;e.sy0=e.y;e.maxHp=e.hp=1e9;e.sp=0;e.aggro=false;e.atk=0;enemies.push(e);DUMS.push(e);}say('dummies '+DUMS.length+' '+G.zone);}catch(er){C1.err='dummy '+er.message;say('dummy err '+er.message);}}
// safe towns sweep every enemy each frame (szSweep, not reachable from outside): while a dummy objective runs, the town's fullSafe flag is
// lifted (nothing hostile spawns in towns; quest dummies have atk 0 and no aggro) and put back as soon as the objective ends or the zone changes
let SAFE0=null;function safeLift(on){try{const Z=ZONES.astoria_capital;if(!Z)return;if(on&&SAFE0==null){SAFE0=!!Z.fullSafe;Z.fullSafe=false;}else if(!on&&SAFE0!=null){Z.fullSafe=SAFE0;SAFE0=null;}}catch(_){}}
function keepDummies(){for(const e of enemies)if(e.c1Dummy){e.x=e.sx0;e.y=e.sy0;e.sx=e.x;e.sy=e.y;e.vx=0;e.vy=0;e.hp=e.maxHp;e.dead=false;}}
function needDummies(){try{if(window.DUMMYTEST247&&DUMMYTEST247.want())return true}catch(_){}return active().some(q=>{const o=curObj(q);return o&&o.kind==='hit_dummy';});}
/* ---------- story variant of a mob (the mist-possessed Warden): same numbers, extra black mist drawn on top ---------- */
function variantWanted(){for(const q of active()){const r=qs(q.id),o=curObj(q);if(!o)continue;const nx=q.objectives[r.i+1];
  if(o.kind==='kill'&&o.variant)return {q,o};if(o.kind==='cutscene'&&nx&&nx.kind==='kill'&&nx.variant)return {q,o:nx};}return null;}
function ensureVariant(){try{const w=variantWanted();if(!w||G.zone!==w.q.zone)return;if(enemies.some(e=>e.c1Var&&!e.dead))return;
  const sa=w.o.spawnAt&&PT[w.o.spawnAt],p=sa||PT[(w.q.objectives.find(o=>o.point&&PT[o.point]&&PT[o.point].zone===w.q.zone)||{}).point]||{x:P.x+200,y:P.y};
  let e=sa?null:enemies.find(e=>!e.dead&&w.o.types.includes(e.type)&&Math.hypot(e.x-p.x,e.y-p.y)<500);
  if(!e){if(typeof MOBS==='undefined'||!MOBS[w.o.types[0]])return;const s=sa?c2Spot(sa.x+60,sa.y+50,40,220,34):null;
    e=makeEnemy(w.o.types[0],w.o.lv||(QBY[w.q.id].requires.lv||16)+1,s?s[0]:p.x-130,s?s[1]:p.y+30);if(!e)return;if(sa){e.c2home=[e.x,e.y];e.c2q=w.q.id;}enemies.push(e);}
  e.c1Var=w.o.variant;say('variant '+e.type+' '+w.o.variant);}catch(er){C1.err='variant '+er.message;}}
/* ---------- small effects drawn by code ---------- */
const FXDUR={village_lantern_flash:1.6,village_lantern_relight:2.4,mist_shadow_flee:2.2,lantern_flower_bloom:2.6,mist_possess_warden:2.4,mist_core_burn:2.4,orb_light_and_spark_earth:2.8,
  lantern_push_rubble:2.4,ice_spark_resonance:3,lantern_blue_tint_on:2.2,ice_gate_break:2.4,small_lantern_on:1.6};
const FX=[];function fx(k,x,y){FX.push({k,x,y,t0:clk(),dur:FXDUR[k]||1.4});say('fx '+k);try{c2FxStart(k,x,y);}catch(_){}}
function glowAt(x,y,R,rgb,a){if(a<=0)return;const g=ctx.createRadialGradient(x,y,0,x,y,R);g.addColorStop(0,'rgba('+rgb+','+a+')');g.addColorStop(1,'rgba('+rgb+',0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,R,0,6.283);ctx.fill();}
function serpent(x,y,len,w,a){ctx.save();ctx.globalAlpha=a;ctx.fillStyle='#14161f';ctx.beginPath();for(let i=0;i<=30;i++){const u=i/30,px=x-len*u,py=y+Math.sin(u*9+clk()*3)*18*(1-u*.5);i?ctx.lineTo(px,py-w*(1-u)):ctx.moveTo(px,py-w);}
  for(let i=30;i>=0;i--){const u=i/30,px=x-len*u,py=y+Math.sin(u*9+clk()*3)*18*(1-u*.5);ctx.lineTo(px,py+w*(1-u));}ctx.fill();ctx.restore();}
function drawFx(){const now=clk();for(let i=FX.length-1;i>=0;i--){const f=FX[i],k=(now-f.t0)/f.dur;if(k>=1){FX.splice(i,1);continue;}const s=Math.sin(Math.PI*k);
  ctx.save();ctx.globalCompositeOperation='lighter';
  if(f.k==='village_lantern_flash')glowAt(f.x,f.y-110,60+340*k,'255,214,120',.75*(1-k));
  else if(f.k==='village_lantern_relight'){glowAt(f.x,f.y-110,80+260*s,'255,214,120',.7*s+.2);for(let j=0;j<14;j++){const a=j*2.4,r=30+180*k;glowAt(f.x+Math.cos(a)*r,f.y-110-Math.abs(Math.sin(a))*r*.6-60*k,8,'255,236,170',.9*(1-k));}}
  else if(f.k==='lantern_flower_bloom'){for(let j=0;j<16;j++){const a=j*.393,r=60+30*Math.sin(j*1.7),kk=Math.min(1,Math.max(0,k*1.6-j*.04));glowAt(f.x+Math.cos(a)*r,f.y+Math.sin(a)*r*.5-14,6+12*kk,'255,226,140',.9*kk);}}
  else if(f.k==='orb_light_and_spark_earth'){glowAt(f.x,f.y-80,40+260*s,'235,245,255',.8*s);const u=Math.min(1,Math.max(0,(k-.35)/.6)),sx=f.x+(P.x-f.x)*u,sy=f.y-80+(P.y-60-(f.y-80))*u-Math.sin(Math.PI*u)*120;if(u>0&&u<1)glowAt(sx,sy,26,'255,170,70',.95);}
  else if(f.k==='mist_core_burn'){ctx.globalCompositeOperation='source-over';const sc=1-k;ctx.globalAlpha=.85*sc+.1;ctx.fillStyle='#120f18';ctx.beginPath();ctx.moveTo(f.x,f.y-150*sc-20);ctx.lineTo(f.x-16*sc,f.y-40);ctx.lineTo(f.x+16*sc,f.y-40);ctx.closePath();ctx.fill();
    ctx.globalCompositeOperation='lighter';glowAt(f.x,f.y-70,40+50*s,'255,140,60',.6*s);}
  else if(f.k==='mist_possess_warden'){ctx.globalCompositeOperation='source-over';const e=enemies.find(e=>e.c1Var&&!e.dead)||f;for(let j=0;j<18;j++){const u=(k*1.4+j/18)%1;ctx.globalAlpha=.55*(1-u)*s;ctx.fillStyle='#16131e';ctx.beginPath();ctx.arc(e.x+Math.sin(j*2.1)*50*(1-u),e.y-260+220*u,14+10*(1-u),0,6.283);ctx.fill();}}
  else if(f.k==='mist_shadow_flee'){ctx.globalCompositeOperation='source-over';serpent(f.x+60+520*k,f.y-30,200,14,.6*(1-k));}
  else if(c2DrawFx(f,k,s)){}
  else glowAt(f.x,f.y-40,60+120*k,'200,230,255',.6*(1-k));
  ctx.restore();}}
function drawPersistent(){const S=c1();if(!S)return;const tt=clk();ctx.save();ctx.globalCompositeOperation='lighter';
  const L=PT.p_sylva_village_lantern;if(L&&L.zone===G.zone&&S.flags.sylva_lantern_lit)glowAt(L.x,L.y-110,70+6*Math.sin(tt*3),'255,214,120',.55);
  const F=PT.p_astoria_flowerbed;if(F&&F.zone===G.zone&&isDone('s3_02_garden'))for(let j=0;j<12;j++){const a=j*.52;glowAt(F.x+Math.cos(a)*(60+20*Math.sin(j)),F.y+Math.sin(a)*30-14,10+2*Math.sin(tt*2+j),'255,226,140',.55);}
  const O=PT.p_m4_shrine;if(O&&O.zone===G.zone&&S.flags.spark_earth)glowAt(O.x,O.y-160,60+8*Math.sin(tt*2),'255,190,110',.45);
  try{c2Persistent(S,tt);}catch(e){C1.err='c2p '+e.message;}
  for(const e of enemies)if(e.c1Var&&!e.dead){ctx.globalCompositeOperation='source-over';for(let j=0;j<6;j++){const a=tt*1.5+j*1.05;ctx.globalAlpha=.32;ctx.fillStyle='#14111c';ctx.beginPath();ctx.arc(e.x+Math.cos(a)*30,e.y-30+Math.sin(a)*14-j*8,22,0,6.283);ctx.fill();}}
  ctx.restore();}
/* ---------- sound: soft metallic clink made with the game's own audio graph (respects mute) ---------- */
function sfxC1(k){try{if(typeof AUD==='undefined'||!AUD.ctx||AUD.cfg&&AUD.cfg.mute)return;const c=AUD.ctx,out=AUD.sfxG||AUD.master,vol=/faint/.test(k)?.05:.11,t0=c.currentTime;
  for(let j=0;j<(/faint/.test(k)?2:3);j++){const o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.value=2300+j*410+Math.random()*120;const s=t0+j*.11;
    g.gain.setValueAtTime(0,s);g.gain.linearRampToValueAtTime(vol,s+.005);g.gain.exponentialRampToValueAtTime(.0005,s+.25);o.connect(g);g.connect(out);o.start(s);o.stop(s+.3);}say('sfx '+k);}catch(_){}}
/* ---------- cutscenes: effect + actor for a moment, then give/take/flag, then the lines ---------- */
let CUT=null;
function cutscene(q,o){if(CUT)return;const p=PT[o.point],x=p?p.x:P.x,y=p?p.y:P.y,dur=(window.__THIEFRUN&&__THIEFRUN.on&&o.id==='cs_m1_02_bread')?__THIEFRUN.total():(o.fx?FXDUR[o.fx]||1.6:(o.actor?1.2:.3));
  const vx=o.fx==='mist_core_burn'&&LASTVAR?LASTVAR:null;CUT={id:o.id,t0:clk(),dur,q,o,x:vx?vx.x:x,y:vx?vx.y:y};C1.stats.cuts++;say('cut '+o.id);
  if(o.fx)fx(o.fx,CUT.x,CUT.y);if(o.sfx)sfxC1(o.sfx);
  setTimeout(()=>{const C=CUT;if(!C)return;if(o.take)takeItem(o.take,1);if(o.give)addItem({id:o.give,q:1});if(o.setFlag)c1().flags[o.setFlag]=true;
    const end=()=>{CUT=null;progress(C.q,need(C.o));};if((o.say||[]).length)dlgLines(o.actor||q.receiver||q.giver,o.say,end);else end();},dur*1000);}
function drawActor(){if(!CUT||!CUT.o.actor)return;if(window.__THIEFRUN&&__THIEFRUN.on&&CUT.o.id==='cs_m1_02_bread'){__THIEFRUN.draw(CUT,(x_,y_)=>{if(!drawArtNpc(CUT.o.actor,x_,y_))drawToken(x_,y_,'ปิ๊บ',false)},clk());return;}const a=CUT.o.actor,k=Math.min(1,(clk()-CUT.t0)/Math.max(.6,CUT.dur));
  let x=CUT.x+70,y=CUT.y;if(!CUT.o.point&&!CUT.o.fx){x=P.x-110;y=P.y;}
  if(a==='npc_mist_shadow'){const k2=CUT.o.point==='p_m4_portal'?'mist_look':'mist_0';if(aok(k2)){ctx.save();ctx.globalAlpha*=Math.min(1,k*2.5)*.92;shadow(x,y,26);sprite(k2,x,y-4*Math.sin(clk()*1.6),110);ctx.restore();return;}serpent(x+120,y-120,260,16,.6);return;}   // N14 r2 art; the code serpent only if it fails to load
  if(npcHere().some(m=>m.id===a))return;
  const n=NPC[a]||{name:a},ghost=a==='npc_tobin_echo';ctx.save();ctx.globalAlpha=ghost?.5*Math.min(1,k*3):1;if(!drawArtNpc(a,x,y))drawToken(x,y,n.name,ghost);ctx.restore();
  if(ghost){ctx.save();ctx.globalCompositeOperation='lighter';glowAt(x+16,y-50,40,'255,214,120',.6);ctx.restore();}}
/* ---------- Map 4 → Map 5 gate ---------- */
function gateOpen(){const S=c1();if(!S)return true;return !!(S.flags.map4_portal_open||S.flags.legacy||!S.flags.prologueDone);}
function wrapGate(){const M=window.__M4T;if(!M||!M.goMap5||M.goMap5.c1)return;const o=M.goMap5;M.goMap5=function(){if(!gateOpen()){C1.stats.gate++;if(!M._c1t||clk()-M._c1t>3){M._c1t=clk();thought(t('portalShut'));}return false;}return o.apply(this,arguments);};M.goMap5.c1=1;}
wrapGate();
/* ---------- interaction (F / mobile action button) ---------- */
{const ou=updPlayer;updPlayer=function(){const r=ou.apply(this,arguments);try{if(!live())return r;
  for(const n of npcHere())if(Math.hypot(P.x-n.at.x,P.y-n.at.y)<(n.at.r||75)){G.interact={k:'npc',n:{n:n.name,x:n.at.x,y:n.at.y,c1n:n.id}};return r;}
  for(const {p,o} of pointsHere())if(o.kind==='interact'&&Math.hypot(P.x-p.x,P.y-p.y)<(p.r||60)){G.interact={k:'npc',n:{n:p.label||t('inspect'),x:p.x,y:p.y,c1p:p.id,hold:o.hold||0}};return r;}}catch(e){C1.err='upd '+e.message;}return r;};}
{const oi=interact;interact=function(){const it=G.interact;try{const u=UIx();if(u&&u.isOpen())return true;
  if(it&&it.k==='npc'&&it.n&&it.n.c1n){if(CUT)return true;talk(NPC[it.n.c1n]);return true;}
  if(it&&it.k==='npc'&&it.n&&it.n.c1p){if(it.n.hold>0){if(HOLD&&HOLD.id===it.n.c1p)return true;HOLD={id:it.n.c1p,x:P.x,y:P.y,t:it.n.hold};thought(t('holdStart'));}else ev('interact',{point:it.n.c1p});return true;}}catch(e){C1.err='int '+e.message;}return oi.apply(this,arguments);};}
// on-screen prompt ("F · …"): the game's npcPrompt names its own merchants; quest NPCs / points get their own names
if(typeof npcPrompt==='function'){const o=npcPrompt;npcPrompt=function(n){try{if(n&&n.c1n)return t('p_talk',{name:n.n});if(n&&n.c1p)return n.n+(n.hold?' '+t('o_hold',{s:n.hold}):'');}catch(_){}return o.apply(this,arguments);};}
/* weapon skill-slot keys (sword p240, bow p272, staff p276, daggers p300) take F before the game's own "F = talk first" check,
   so with a skill on slot F nobody could talk. While something can be talked to / inspected, slot F reads empty for that key press. */
function fixSlotF(BS){try{if(!BS||!BS.map||BS.map.c1px)return;const fix=m=>new Proxy(m,{get(t,k){if(k==='c1px')return 1;if(k==='9'&&G.interact){const e=window.event;if(e&&e.type==='keydown'&&(e.key||'').toLowerCase()==='f')return undefined;}return t[k];}});
  let cur=fix(BS.map);Object.defineProperty(BS,'map',{configurable:true,get(){return cur;},set(v){cur=v&&v.c1px?v:fix(v||{});}});}catch(e){C1.err='slotF '+e.message;}}
for(const g of ['__WSK','BSK','STF','DGR'])fixSlotF(window[g]&&window[g].slots);
// phone: the talk button (#ctxInt) avoids the HUD but not the newer round skill buttons (Sakura / Demon Domain ...), which sit above it and swallow the tap. Nudge it clear.
(function(){const b=document.getElementById('ctxInt');if(!b||b.c1av)return;b.c1av=1;let busy=0;
 const obs=()=>{const A=[];for(const e of document.querySelectorAll('body>button')){if(e===b)continue;const cs=getComputedStyle(e);if(cs.position!=='fixed'||cs.display==='none'||(+cs.zIndex||0)<=9)continue;const r=e.getBoundingClientRect();if(r.width>4&&r.height>4)A.push(r);}return A;};
 const hit=(x,y,w,h,A)=>A.some(r=>!(x+w+6<=r.left||r.right+6<=x||y+h+6<=r.top||r.bottom+6<=y));
 const fix=()=>{if(busy||!b.classList.contains('on'))return;const q=b.getBoundingClientRect(),A=obs();if(!hit(q.left,q.top,q.width,q.height,A))return;
  const W=innerWidth,H=innerHeight,w=q.width,h=q.height;const C=[];for(let d=50;d<=400;d+=25){C.push([q.left,q.top-d],[q.left-d,q.top],[q.left+d,q.top],[q.left,q.top+d]);}
  for(const [x,y] of C){if(x<8||y<8||x+w>W-8||y+h>H-8)continue;if(!hit(x,y,w,h,A)){busy=1;b.style.left=x+'px';b.style.top=y+'px';busy=0;return;}}};
 new MutationObserver(fix).observe(b,{attributes:true,attributeFilter:['style','class']});setInterval(fix,300);})();
// zone-title banner: the safe-zone module (v168) tints the title with style.background = gradient; that shorthand also resets
// background-clip to border-box, so in fully safe maps (Map 1, Astoria, Map 4 safe floors) the title became a solid green box. Keep the clip on text.
if(typeof showBanner==='function'){const o=showBanner;showBanner=function(){const r=o.apply(this,arguments);try{const T=document.getElementById('bnT');if(T&&T.style.background){T.style.webkitBackgroundClip='text';T.style.backgroundClip='text';}
    // DeaRz 29 Oct 06:40: drop the words "Safe Zone" from the subtitle under the map title (it showed twice)
    const S=document.getElementById('bnS');if(S&&/Safe Zone/i.test(S.textContent))S.textContent=S.textContent.replace(/🛡\s*/g,'').split('·').map(x=>x.trim()).filter(x=>x&&!/^Safe Zone$/i.test(x)).join(' · ');}catch(_){}return r;};}
/* ---------- props: Ferro replaces the placeholder ball; NPC footprints are solid ---------- */
function addSolid(x,y,r){const o={x,y,r};SOLIDS.push(o);const pad=r+50;for(let gx=Math.floor((x-pad)/SCELL);gx<=Math.floor((x+pad)/SCELL);gx++)for(let gy=Math.floor((y-pad)/SCELL);gy<=Math.floor((y+pad)/SCELL);gy++){const k=gx+','+gy;let l=SGRID.get(k);if(!l)SGRID.set(k,l=[]);l.push(o);}}
{const o=buildSolids;buildSolids=function(){const r=o.apply(this,arguments);try{for(const n of npcHere())addSolid(n.at.x,n.at.y,16);PROPZ=null;propSolids();}catch(_){}return r;};}
function placeFixed(){try{if(typeof G==='undefined')return;if(npcHere().some(n=>n.replaces)){for(const n of npcHere())if(n.replaces)for(let i=PROPS.length-1;i>=0;i--)if(PROPS[i]&&PROPS[i].t===n.replaces)PROPS.splice(i,1);}
  buildSolids();}catch(e){C1.err='place '+e.message;}}
{const o=loadZone;loadZone=function(){const r=o.apply(this,arguments);try{placeFixed();wrapGate();if(needDummies())dummies();ensureVariant();}catch(_){}return r;};}
/* ---------- Chapter 1 art r1 (window.__C1ART, Art Director passed 29 Oct; DeaRz has not reviewed it yet) ----------
   world sizes follow the brief (Ora 55, Mali 75 ...); N14 mist shade failed review -> the code-drawn serpent stays until r2. */
const AR=window.__C1ART||{},AI={};for(const [k,u] of Object.entries(AR)){const im=new Image();im.decoding='async';im.src=u;AI[k]=im;}
const aok=k=>{const i=AI[k];return !!(i&&i.complete&&i.naturalWidth);};
const NART={npc_ora:{f:['ora_0','ora_1'],h:55,face:'ora_face0'},npc_mali:{f:['mali_0','mali_1'],h:75,face:'mali_face0'},npc_ferro:{f:['ferro_0','ferro_1'],h:72,face:'ferro_face1'},
  npc_astoria_trainer:{f:['tor_0'],h:80,face:'tor_face0'},npc_astoria_gardener:{f:['fon_0'],h:70},npc_traveler_m4:{f:['reo_0'],h:78,face:'reo_face0'},
  npc_pip:{f:['pip_0'],h:55,face:'pip_face0'},npc_pell:{f:['pell_0'],h:74,face:'pell_face0'},npc_tobin_echo:{f:['tobin_0'],h:80},npc_cat_somjeed:{f:['cat_sit'],h:34},
  // chapter 2 (Art Director passed 29 Oct 18:05/19:15): Mira 13 y, old tracker Hark, Varg taller than the hero (78), Kraga lies half-buried in snow (raises an arm in cs_c2_m3_shield)
  npc_mira:{f:['mira_0'],h:64,face:'mira_face0'},npc_hark:{f:['hark_0'],h:80,face:'hark_face0'},npc_hunter_varg:{f:['varg_0'],h:96,pick:()=>CUT&&CUT.o.id==='cs_c2_m6_retreat'?'varg_back':'varg_0'},
  npc_demon_wounded:{f:['kraga_lie'],h:108,still:1,face:()=>kSat()?'kraga_face0':'kraga_face1',pick:()=>CUT&&CUT.o.actor==='npc_demon_wounded'?'kraga_shield':kSat()?(Math.floor(clk()/1.4)%2?'kraga_sit1':'kraga_sit0'):'kraga_lie',hk:{kraga_sit0:118,kraga_sit1:118}}};
// Kraga sits against the ruin wall (art S1/S2, 29 Oct 20:25) once chapter 2 is over; in chapter 2 he lies in the snow with the 'pain' face
function kSat(){const r=qs('c2_m7_ice_gate');return !!(r&&r.s==='d'&&aok('kraga_sit0'));}
function sprite(k,x,y,h,sy){const im=AI[k];if(!aok(k))return false;const w=h*im.naturalWidth/im.naturalHeight,hh=h*(sy||1);ctx.drawImage(im,x-w/2,y-hh,w,hh);return true;}
function shadow(x,y,rx){ctx.save();ctx.globalAlpha*=.28;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(x,y,rx,rx*.32,0,0,6.283);ctx.fill();ctx.restore();}
function drawArtNpc(id,x,y,a){const A=NART[id];if(!A)return false;if(window.NPC3QHOOK&&NPC3QHOOK(id,x,y,a,A))return true;const tt=clk(),two=A.f.length>1,k=A.pick?A.pick():two?A.f[Math.floor(tt/.7+x*.01)%2]:A.f[0];if(!aok(k))return false;
  ctx.save();if(a!=null)ctx.globalAlpha*=a;const hh=(A.hk&&A.hk[k])||A.h,sit=/^kraga_sit/.test(k);if(!/^kraga_/.test(k))shadow(x,y,hh*(A.still?.6:.3));sprite(k,x,y,hh,two||(A.still&&!sit)?1:1+(sit?.02:.012)*Math.sin(tt*(sit?1.6:2.2)+x));ctx.restore();return true;}
// item icons: the game's itemIcon() checks ICONS['i_'+id] first
const ICO={ki_black_iron_lantern:'ic_ki_black_iron_lantern',qi_tobin_lantern:'ic_ki_black_iron_lantern',qi_ora_letter:'ic_qi_ora_letter',qi_ferro_letter:'ic_qi_ferro_letter',qi_tobin_letter:'ic_qi_tobin_letter',
  qi_mali_parcel:'ic_qi_mali_parcel',qi_reo_bag:'ic_qi_reo_bag',qi_herb:'ic_qi_herb',qi_slime_gel:'ic_qi_slime_gel',qi_bunny_fur:'ic_qi_bunny_fur',qi_tor_bracelet:'ic_qi_tor_bracelet',
  qi_lantern_seed:'ic_qi_lantern_seed',qi_lantern_flower:'ic_qi_lantern_flower',qi_stone_core:'ic_qi_stone_core',item_recipe_black_iron:'ic_item_recipe_black_iron',
  qi_rag_doll:'ic_qi_rag_doll',qi_tor_page:'ic_qi_tor_page',qi_claw_rubbing:'ic_qi_claw_rubbing',qi_frozen_trap:'ic_qi_frozen_trap',qi_spiked_herb:'ic_qi_herb',
  c1_skillbook_sword:'ic_c1_skillbook',c1_skillbook_bow:'ic_c1_skillbook',c1_skillbook_staff:'ic_c1_skillbook',c1_skillbook_dagger:'ic_c1_skillbook'};
try{for(const [id,k] of Object.entries(ICO))if(AR[k]&&typeof ICONS!=='undefined'){ICONS['i_'+id]=AR[k];const im=AI[k];im.addEventListener('load',()=>{try{const c=document.createElement('canvas');c.width=c.height=64;c.getContext('2d').drawImage(im,0,0,64,64);if(typeof ICONCV!=='undefined')ICONCV['i_'+id]=c;}catch(_){}});}}catch(e){C1.err='ico '+e.message;}
// map props from the story: burn trail + closed lantern-flower ring (Map 2), flowerbed + tally wall (Astoria), old campfire + broken staff (Map 4)
function propList(){const L=[],P2=k=>PT[k]&&PT[k].zone===G.zone?PT[k]:null;let p;
  if(p=P2('p_plains_burn_mark'))L.push({k:'burn',x:p.x-40,y:p.y+10,w:440,ground:1});
  if(p=P2('p_plains_lantern_tree'))for(let j=0;j<8;j++){const a=-.35+j/7*(Math.PI+.7);L.push({k:'flower_closed',x:p.x+Math.cos(a)*105,y:p.y-28+Math.sin(a)*46,h:40});}   // front arc round the trunk; the back is hidden by the canopy
  if(p=P2('p_astoria_flowerbed')){const open=isDone('s3_02_garden');for(const [dx,dy] of [[-62,-14],[-22,-30],[22,-24],[60,-8],[0,8]])L.push({k:open?'flower_open':'flower_closed',x:p.x+dx,y:p.y+dy,h:42});}
  if(p=P2('p_astoria_tally_wall'))L.push({k:'wall',x:p.x,y:p.y-46,w:118});
  if(p=P2('p_m4_pell_trace_1'))L.push({k:'campfire',x:p.x+46,y:p.y-26,w:72,ground:1});
  if(p=P2('p_m4_pell_trace_2'))L.push({k:'staff',x:p.x+40,y:p.y-30,h:62});
  try{c2Props(L,P2);}catch(e){C1.err='c2props '+e.message;}
  return L;}
// chapter 2 props (art P1/P2/P3): claw marks at house 2 (across the door) and house 3 (over the burn), blanket in house 4, claw-torn plank at Kraga's ruin,
// 5 small lanterns (off -> on as c2_s2 lights them), mist nests at lights 3 and 5 until lit, the new village sign after c2_s6, dead pines + frozen traps on Map 6
function c2Lit(i){const r=qs('c2_s2_small_lights'),q=QBY.c2_s2_small_lights;if(!r||!q)return false;const j=q.objectives.findIndex(o=>o.kind==='interact'&&o.point==='p_m5_light_'+i);return r.s==='d'||r.s==='r'||(j>=0&&r.s==='a'&&r.i>j);}
function c2Sign(){const r=qs('c2_s6_mira_grave');return !!(r&&(r.s!=='a'||r.i>=1));}
function c2Props(L,P2){if(!CH2)return;let p;
  if(p=P2('p_m5_house_2'))L.push({k:'claw_floor',x:p.x,y:p.y+26,w:118,ground:1});
  if(p=P2('p_m5_house_3'))L.push({k:'claw_floor',x:p.x+12,y:p.y+18,w:104,ground:1});
  if(p=P2('p_m5_house_4'))L.push({k:'blanket',x:p.x+30,y:p.y-6,h:34});
  if(p=P2('p_m6_kraga_house'))L.push({k:'claw_wall',x:p.x-150,y:p.y+70,w:74});   // p331: the claw-torn door went with Kraga to Map 6
  for(let i=1;i<=5;i++)if(p=P2('p_m5_light_'+i)){const on=c2Lit(i);L.push({k:on?'lamp_on':'lamp_off',x:p.x,y:p.y,h:44,lamp:1});if(!on&&(i===3||i===5))L.push({k:'mist_nest',x:p.x-58,y:p.y+22,w:92,ground:1});}
  if((p=P2('p_m5_plaza_sign'))&&c2Sign())L.push({k:'village_sign',x:p.x+34,y:p.y,h:64,solid:12});
  if((p=P2('p_m5_plaza_sign'))&&c1().flags.mira_lantern_lit)L.push({k:'lamp_on',x:p.x-30,y:p.y+4,h:40,lamp:1});
  for(let i=1;i<=3;i++)if(p=P2('p_m6_dead_pine_'+i))L.push({k:'dead_pine',x:p.x+56,y:p.y-4,h:200,solid:14,tall:1});
  const r5=qs('c2_s5_hark_traps');if(!(r5&&r5.s!=='a'))for(let i=1;i<=4;i++){const id='p_m6_trap_'+i;if((p=P2(id))&&!(r5&&r5.got&&r5.got[id]))L.push({k:'frozen_trap',x:p.x,y:p.y,h:40});}}
function c2Sig(){if(!CH2)return '';const a=[];for(const id of ['c2_s2_small_lights','c2_s5_hark_traps','c2_s6_mira_grave']){const r=qs(id);a.push(r?r.s+r.i+Object.keys(r.got||{}).length:'-');}a.push(c1()&&c1().flags.mira_lantern_lit?1:0);return a.join(',');}
let PROPC=null,PROPZ=null;function props(){const z=G.zone+'|'+isDone('s3_02_garden')+'|'+c2Sig();if(PROPZ!==z){const re=PROPZ&&PROPZ.split('|')[0]===G.zone;PROPZ=z;PROPC=propList();if(re)try{buildSolids();}catch(_){}}return PROPC||[];}
function drawProp(o){const im=AI[o.k];if(!aok(o.k))return;const w=o.w||o.h*im.naturalWidth/im.naturalHeight,h=o.h||o.w*im.naturalHeight/im.naturalWidth;
  if(o.ground){ctx.save();ctx.globalAlpha*=o.a||(o.k==='burn'?.92:1);ctx.drawImage(im,o.x-w/2,o.y-h/2,w,h);ctx.restore();return;}
  shadow(o.x,o.y,w*.32);ctx.drawImage(im,o.x-w/2,o.y-h,w,h);}
function drawProps(top){for(const o of props()){if(o.ground){if(!top)drawProp(o);continue;}if((P.y>o.y)!==top)drawProp(o);}}
// the wall is solid (standing rule: solid props block their footprint)
function propSolids(){for(const o of props()){if(o.k==='wall'){addSolid(o.x-30,o.y-8,26);addSolid(o.x+30,o.y-8,26);}if(o.solid)addSolid(o.x,o.y-4,o.solid);if(o.k==='claw_wall')addSolid(o.x,o.y-6,22);}}
// dialogue portraits: the prologue box already styles img.pf; the speaker's name picks the face
const FACE={};for(const [id,A] of Object.entries(NART))if(A.face&&NPC[id])FACE[NPC[id].name]=A.face;   // a face may be a function (Kraga: by chapter)
function faceFix(){const d=document.getElementById('qDlg');if(!d||d.hidden)return;const nm=d.querySelector('.nm'),f0=nm&&FACE[nm.textContent],k=typeof f0==='function'?f0():f0;if(!k||!AR[k]||d.querySelector('img.pf'))return;
  const im=document.createElement('img');im.className='pf';im.alt='';im.src=AR[k];im.style.objectFit='contain';d.insertBefore(im,d.firstChild);d.classList.add('pf');}
{const d=document.getElementById('qDlg');if(d)new MutationObserver(faceFix).observe(d,{childList:true});}
/* ---------- drawing ---------- */
function txt(s,x,y,col,sz,a){ctx.save();ctx.globalAlpha*=a==null?1:a;ctx.font='bold '+(sz||13)+'px Sarabun,sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='rgba(20,16,30,.85)';ctx.strokeText(s,x,y);ctx.fillStyle=col;ctx.fillText(s,x,y);ctx.restore();}
function drawToken(x,y,name,ghost){const b=Math.sin(clk()*2+x)*1.5;   // art pending: TEST stand-in token (never in a build DeaRz reviews)
  ctx.save();ctx.globalAlpha*=.3;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(x,y+2,18,6,0,0,6.283);ctx.fill();ctx.restore();
  ctx.save();ctx.strokeStyle=ghost?'rgba(200,230,255,.9)':'rgba(255,226,140,.95)';ctx.setLineDash([5,4]);ctx.lineWidth=2;ctx.fillStyle='rgba(30,26,44,.35)';ctx.beginPath();ctx.rect(x-20,y-78+b,40,76);ctx.fill();ctx.stroke();ctx.restore();
  txt(t('waitArt'),x,y-38+b,'#ffe6a0',11);txt(name,x,y+20,'#ffd36b',13);txt('TEST',x,y+33,'#c8b88a',9,.8);}
function drawNpc(n){const A=NART[n.id],art=drawArtNpc(n.id,n.at.x,n.at.y);if(!art)drawToken(n.at.x,n.at.y,n.name);else txt(n.name,n.at.x,n.at.y+16,'#ffd36b',12,.9);
  const m=mark(n);if(m)txt(m,n.at.x,n.at.y-(art?A.h+18:92)+Math.sin(clk()*4)*3,'#ffd36b',30);}
function drawPoints(){const tt=clk();for(const {p,o} of pointsHere()){try{if(window.HERBVIS231&&HERBVIS231.on)HERBVIS231.draw(ctx,p,o,tt);}catch(_){}const a=.55+.3*Math.sin(tt*3+p.x),col=o.kind==='collect'?'#bff5a0':o.kind==='interact'?'#a8d8ff':'#fff2b0';
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(window.QOBJ263&&o.kind==='collect'&&QOBJ263.has(o.item))?a*.22:a;const g=ctx.createRadialGradient(p.x,p.y-20,0,p.x,p.y-20,30);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y-20,30,0,6.283);ctx.fill();ctx.restore();
  if(o.kind!=='collect'&&p.label)txt(p.label,p.x,p.y+16,'#fff2b0',12,.9);}
  if(HOLD){const h=HOLD,o=active().map(curObj).find(x=>x&&x.point===h.id),tot=(o&&o.hold)||1,k=1-h.t/tot;ctx.save();ctx.strokeStyle='#a8d8ff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(P.x,P.y-100,16,-Math.PI/2,-Math.PI/2+6.283*k);ctx.stroke();ctx.restore();}}
function target(q){const r=qs(q.id),o=curObj(q);if(r&&r.s==='r'){const n=NPC[q.receiver];return n&&n.at?{zone:n.at.zone,x:n.at.x,y:n.at.y}:null;}if(!o)return null;
  const id=o.point||(o.points||[]).find(x=>!(r.got||{})[x]);if(id&&PT[id])return PT[id];const n=NPC[o.npc];if(n&&n.at)return {zone:n.at.zone,x:n.at.x,y:n.at.y};
  if(o.spawnAt&&PT[o.spawnAt])return PT[o.spawnAt];
  if(o.kind==='kill'&&(o.near||o.zone))return o.near&&PT[o.near]?PT[o.near]:{zone:o.zone||q.zone};return null;}
function drawGuide(){if(!live())return;const f=active()[0]||QS.find(q=>{const r=qs(q.id);return r&&r.s==='r';});if(!f)return;const p=target(f);if(!p||p.zone!==G.zone||p.x==null)return;
  const d=Math.hypot(p.x-P.x,p.y-P.y);if(d<220)return;const a=Math.atan2(p.y-P.y,p.x-P.x),x=P.x+Math.cos(a)*70,y=P.y-40+Math.sin(a)*50;
  ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.globalAlpha=.85;ctx.fillStyle='#ffd36b';ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(-6,-8);ctx.lineTo(-2,0);ctx.lineTo(-6,8);ctx.closePath();ctx.fill();ctx.restore();}
function drawWorld(top){if(!live())return;drawProps(top);for(const n of npcHere()){if(n.id==='npc_demon_wounded'&&KSORT.zone===G.zone)continue;const front=P.y>n.at.y;if(front!==top)drawNpc(n);}if(top){drawPersistent();drawPoints();drawGuide();drawFx();drawActor();}}
{const o=drawRaidTele;drawRaidTele=function(){const r=o.apply(this,arguments);try{drawWorld(false);}catch(e){C1.err='d0 '+e.message;}return r;};}
{const o=drawParts;drawParts=function(){const r=o.apply(this,arguments);try{drawWorld(true);}catch(e){C1.err='d1 '+e.message;}return r;};}
/* ---------- tracker (right side, under the prologue box position) + vision frame ---------- */
const st=document.createElement('style');st.textContent='#c1Track{position:fixed;right:10px;top:84px;z-index:56;width:230px;background:rgba(14,18,28,.78);border:1px solid rgba(217,182,92,.7);border-radius:10px;padding:6px 10px;color:#f4ecd6;font:12.5px/1.45 Sarabun,sans-serif;pointer-events:none}'
 +'#c1Track .h{color:#ffd36b;font-weight:700;font-size:11px}#c1Track .q{margin-top:3px}#c1Track .t{font-weight:700}#c1Track .r{color:#9ff5b0}#c1Track .z{color:#a8b4c8;font-size:11px}@media (hover:none){#c1Track{width:180px;font-size:11.5px;top:70px}}'
 +'#c1Vis{position:fixed;inset:0;z-index:54;background:rgba(6,6,14,.82);display:flex;align-items:center;justify-content:center;pointer-events:none}#c1Vis[hidden]{display:none}'
 +'#c1Vis div{width:min(62vw,560px);height:min(36vw,300px);border:2px dashed rgba(255,226,140,.8);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#ffe6a0;font:700 16px Sarabun,sans-serif;text-align:center;margin-bottom:22vh}'
 +'#c1Vis div[hidden]{display:none}#c1Vis img{width:min(80vw,760px);max-height:56vh;object-fit:cover;aspect-ratio:16/9;border-radius:10px;margin-bottom:22vh;box-shadow:0 0 40px rgba(120,140,255,.35);animation:c1vin 1.2s ease-out}#c1Vis img[hidden]{display:none}@keyframes c1vin{from{opacity:0;transform:scale(1.04)}to{opacity:1;transform:none}}@media (hover:none){#c1Vis img{max-height:48vh;margin-bottom:30vh}}';
document.head.appendChild(st);const TR=document.createElement('div');TR.id='c1Track';TR.hidden=true;document.body.appendChild(TR);
const VI=document.createElement('div');VI.id='c1Vis';VI.hidden=true;VI.innerHTML='<div></div><img alt="" hidden>';document.body.appendChild(VI);
function visTick(){const d=document.getElementById('qDlg'),tx=d&&!d.hidden&&d.querySelector('.tx');const s=tx?tx.textContent:'';const sc=!!(s&&CUT&&CUT.o.id==='cs_c2_m4_varg'&&aok('sc_varg'));if(sc){VI.hidden=false;const img=VI.lastChild;if(img.dataset.k!=='sc_varg'){img.dataset.k='sc_varg';img.src=AR.sc_varg;}img.hidden=false;VI.firstChild.hidden=true;return;}
  const on=VIS.has(s);VI.hidden=!on;if(on){const m=s.match(/^【(.+?)】/),n=m&&m[1].match(/(\d)/),k=n?'v'+n[1]:null,img=VI.lastChild;
    if(k&&AR[k]){if(img.dataset.k!==k){img.dataset.k=k;img.src=AR[k];}img.hidden=false;VI.firstChild.hidden=true;}else{img.hidden=true;VI.firstChild.hidden=false;VI.firstChild.textContent=(m?m[1]:t('vision'))+' · '+t('waitArt');}}}
function zoneName(z){try{const Z=ZONES[z];return (Z&&(Z.th||Z.n))||z;}catch(_){return z;}}
function objText(q,o,r){if(!o)return r.s==='r'?t('returnTo')+' '+npcName(q.receiver):'';if(o.text)return o.text;const n=need(o),v=r.o[r.i]||0;
  const mob=(o.types||[]).map(x=>{try{return (MOBS[x]&&MOBS[x].n)||x;}catch(_){return x;}}).join(' / ');
  const pt=o.point&&PT[o.point]?PT[o.point].label:'';let s=t('o_'+o.kind,{npc:npcName(o.npc),item:itemName(o.item),mob,point:pt});
  if(o.kind==='cutscene'&&!o.point)s=t('o_cutsceneHere');if(o.kind==='interact'&&o.hold)s+=' '+t('o_hold',{s:o.hold});if(o.kind==='hit_dummy'&&o.weapon)s+=' '+t('w_'+o.weapon);
  return s+(n>1?' ('+(o.kind==='collect'||o.kind==='deliver'?Math.min(n,countItem(o.item)):v)+'/'+n+')':'');}
function renderTrack(){try{if(!live()||String(G.zone).startsWith('w00_')){TR.hidden=true;return;}
  const S=c1(),rows=QS.filter(q=>{const r=S.c1.q[q.id];return r&&(r.s==='a'||r.s==='r');}).slice(0,3);if(!rows.length){TR.hidden=true;return;}
  {const pt=document.getElementById('qTrack');if(pt&&S.flags.prologueDone&&!S.cur)pt.hidden=true;}   // never stack under a stale prologue tracker
  TR.innerHTML='';const h=document.createElement('div');h.className='h';h.textContent=t('tracker');TR.appendChild(h);
  for(const q of rows){const r=S.c1.q[q.id],d=document.createElement('div');d.className='q';const a=document.createElement('div');a.className='t';a.textContent=q.name;const b=document.createElement('div');if(r.s==='r')b.className='r';b.textContent=objText(q,curObj(q),r);d.append(a,b);
    const tg=target(q);if(tg&&tg.zone&&tg.zone!==G.zone){const z=document.createElement('div');z.className='z';z.textContent='→ '+zoneName(tg.zone);d.appendChild(z);}TR.appendChild(d);}
  TR.hidden=false;}catch(e){C1.err='trk '+e.message;}}
/* ---------- per-frame ---------- */
let trkT=0;
{const o=update;update=function(dt){const r=o.apply(this,arguments);try{if(live()){tickPoints(dt);if(needDummies()&&G.zone==='astoria_capital'){if(!enemies.some(e=>e.c1Dummy))dummies();keepDummies();}else{safeLift(false);for(let i=enemies.length-1;i>=0;i--)if(enemies[i].c1Dummy)enemies.splice(i,1);}
    const w=P.weapon&&P.weapon.t;if(lastW&&w&&w!==lastW)ev('switch_weapon',{w});lastW=w;
    for(const q of active()){const ob=curObj(q);if(ob&&ob.kind==='flag'&&c1().flags[ob.name])progress(q,need(ob));}
    for(const q of QS)if(q.auto&&avail(q))start(q);
    if(PEND.length&&!dlgOpen()&&!CUT){const id=PEND.shift(),q=QBY[id],ob=q&&curObj(q);if(ob&&ob.kind==='cutscene'&&!ob.point)cutscene(q,ob);}
    visTick();if((trkT-=dt)<=0){trkT=.5;renderTrack();ensureVariant();}}if(CH2)c2Tick(dt);}catch(e){C1.err='tick '+e.message;}return r;};}
function save(){try{saveGame();C1.stats.saves++;}catch(_){}}
/* ---------- chapter 2 (Map 5-6) · order ORDER_20261029_ch2-quests.md ----------
   - Map 5 north arch: the approved A1 rubble (art/map5/assets/a1-north-rubble.png, 175 wide as in review-a1) stands in the doorway again and
     blocks it (solid + the Map 6 trip refused) until the per-player flag map5_north_arch_open; legacy characters keep it open (as Map 4 → 5).
   - Map 6 ice gate: shut (solid across the doorway) until map6_ice_gate_open; open = the same approved gate art with its ice pane cleared.
   - Mistling (art approved 18 Oct) now lives on Map 5/6: ordinary row × Balance v1 (HP .6 ATK .9 DEF .5 EXP .75 eva 1.3 move 1.3), zone mixes
     Map 5 zone 2 = 4 boar + 6 mistling, Map 6 zone 2 = 3 boar + 3, zone 6 = 2 warden + 3; Map 6 mistlings Lv26-28; packs of 3 share a home.
     Snow puffs round their feet while calm (code).
   - quest-only packs of 3 (kill.pack): spawned near the step's point while the hero is close, one pack at a time, gone when the step ends.
   - maddened Veilwater Serpent (c2_m4): per player at the still pool, Lv22 boss row, ATK ×1.25, speed 90, always chasing, never walks home;
     a player death resets it to full HP at the pool. Art pending: the engine's drake shape with a "รอภาพ" label (TEST only).
   - Kraga's ruin: a 5th low-wall ruin (the same approved pieces as house 4) west of the hamlet; Reo moves to the Map 5 plaza after m4_03. */
const M5ID='w22_map5_test',M6ID='w23_map6_test',C2={stats:{waves:0,wmobs:0,serpReset:0,archBlock:0,iceHint:0,regroup:0,despawn:0},err:[]};
const C2A=window.__C2ART||{},C2I={};for(const k of ['rubble','gateOpen'])if(C2A[k]){const im=new Image();im.decoding='async';im.src=C2A[k];C2I[k]=im;}
const c2ok=k=>{const i=C2I[k];return !!(i&&i.complete&&i.naturalWidth);};
const M4T=()=>window.__M4T||{};
function archOpen(){const S=c1();if(!CH2||!S)return true;return !!(S.flags.map5_north_arch_open||S.flags.legacy||!S.flags.prologueDone);}
function iceOpen(){const S=c1();if(!CH2||!S)return true;return !!(S.flags.map6_ice_gate_open||S.flags.legacy||!S.flags.prologueDone);}
function walkOk(x,y){const D=G.zone===M5ID?window.__M5_DATA:G.zone===M6ID?window.__M6_DATA:null;if(!D)return true;const R=D.walk[Math.floor(y/D.g4)];if(!R||x<0)return false;
  const c=Math.floor(x/D.g4);for(let i=0;i<R.length;i+=2)if(c>=R[i]&&c<R[i+1])return true;return false;}
function c2Spot(x,y,r0,r1,sz){for(let k=0;k<80;k++){const a=Math.random()*6.283,d=r0+Math.random()*(r1-r0),px=x+Math.cos(a)*d,py=y+Math.sin(a)*d*.8;
  if(!walkOk(px,py)||!walkOk(px+sz,py)||!walkOk(px-sz,py)||!walkOk(px,py+sz)||!walkOk(px,py-sz))continue;if(typeof blocked==='function'&&blocked(px,py,sz+6))continue;return [px,py];}return null;}
/* species + zone mixes */
const MSPC={hpMul:.6,atkMul:.9,defMul:.5,expMul:.75,evaMul:1.3,spdMul:1.3,aggro:.8,leash:400,join:'pack',joinR:170,lootFrom:'stoneboar'};
let C2READY=false;
// DeaRz 29 Oct 09:25 "more mobs x2, softer hits, swarm play" -> balance/approved/BALANCE_ch2_swarm_v1.md (Map 5/6 combat zones, TEST, ?mobx2=off)
const SWARM={on:!/mobx2=off/.test(Q),dmg:.6,exp:.9,gold:.9,maxAtk:6,ring:120,pack:2,held:0,
  mix:{map5:{2:[['stoneboar',2],['mistling',12]],3:8,4:12,7:8},map6:{2:[['stoneboar',4],['mistling',6]],3:8,5:8,6:[['stoneboar',3],['ruinwarden_m4',4],['mistling',3]],7:8}}};
const swOn=()=>CH2&&SWARM.on&&typeof G!=='undefined'&&(G.zone===M5ID||G.zone===M6ID);
const swMob=e=>e&&e.m&&!e.c2boss&&!e.m.boss&&!e.m.elite&&!e.eliteX&&!e.c1Dummy;
if(CH2&&SWARM.on&&typeof hurtPlayer==='function'){const _h=hurtPlayer;hurtPlayer=function(raw,src){if(swOn()&&swMob(src))raw*=SWARM.dmg;return _h.call(this,raw,src);};}
if(CH2&&SWARM.on&&typeof killEnemy==='function'){const _k=killEnemy;killEnemy=function(e){if(!swOn()||!swMob(e)||e.dead)return _k.apply(this,arguments);
  const g0=P.gold,n0=typeof loots!=='undefined'?loots.length:0;if(e.expBase&&!e.c2xp){e.c2xp=1;e.expBase=Math.max(1,Math.round(e.expBase*SWARM.exp));}
  try{return _k.apply(this,arguments);}finally{const dg=P.gold-g0;if(dg>0)P.gold=g0+Math.round(dg*SWARM.gold);
    if(typeof loots!=='undefined')for(let i=n0;i<loots.length;i++){const l=loots[i];if(l&&l.gold)l.gold=Math.max(1,Math.round(l.gold*SWARM.gold));}}};}
// at most 6 mobs strike the hero at once; the rest hold at ~120 px and take a slot when one drops out
function swarmTick(){if(!swOn()||P.dead)return;const near=[];for(const e of enemies){if(e.dead||!swMob(e)||!e.aggro)continue;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<260)near.push([d,e]);}
  if(near.length<=SWARM.maxAtk)return;near.sort((a,b)=>a[0]-b[0]);
  for(let i=SWARM.maxAtk;i<near.length;i++){const [d,e]=near[i];e.atkCd=Math.max(e.atkCd||0,.25);if(e.wind>0&&!e.strikeT)e.wind=0;SWARM.held++;
    if(d<SWARM.ring&&d>1){const k=(SWARM.ring-d)/d*.35,nx=e.x+(e.x-P.x)*k,ny=e.y+(e.y-P.y)*k;if(walkOk(nx,ny)){e.x=nx;e.y=ny;}}}}
function c2Species(){if(C2READY||!CH2)return C2READY;try{
  if(typeof MOBS==='undefined')return false;if(!MOBS.mistling&&window.__MISTLING&&__MISTLING.pick)__MISTLING.pick();if(!MOBS.mistling){C2.err.push('no mistling');return false;}
  if(!MOBS.veilwater_serpent){MOBS.veilwater_serpent={n:'Veilwater Serpent',sh:'drake',c:'#3d93bf',c2:'#0b2a3a',sz:34,sp:90,boss:1};try{if(typeof MOBX!=='undefined'&&!MOBX.veilwater_serpent)MOBX.veilwater_serpent=['dragon','water'];}catch(_){}}
  const SPD=window.W22&&W22.sp10&&W22.sp10.data;if(SPD){if(!SPD.mistling){const src=SPD[MSPC.lootFrom]||{};SPD.mistling=Object.assign({id:'mistling'},MSPC,{loot:Object.assign({},src.loot||{}),lv:[18,20]});}
    if(SPD.mistling&&!SPD.mistling.lv)SPD.mistling.lv=[18,20];   // the Studio monster list reads sp10.data[k].lv
    if(!SPD.veilwater_serpent)SPD.veilwater_serpent={id:'veilwater_serpent',aggro:1,leash:700,loot:{},lv:[22,22]};}
  const REG=window.MON_SPRITES,R=REG&&REG.byType&&REG.byType.mistling;   // the Mistling art is Studio-only (p268); Map 5/6 use it too (as Map 6 does for the Gale Feather)
  if(R&&!R.data.c2scope){R.data.c2scope=1;const d=Object.getOwnPropertyDescriptor(R.data,'scope'),old=d&&d.get?d.get:()=>d?d.value:'studio';
    Object.defineProperty(R.data,'scope',{configurable:true,get(){return (typeof G!=='undefined'&&(G.zone===M5ID||G.zone===M6ID))?'map56test':old.call(R.data);}});}
  const mix=(M,id,m)=>{if(!M||!M.zc||(M.zones&&M.zones.planned))return;const z=M.zc.find(z=>z.id===id);if(z){z.mix=m;z.cnt=m.reduce((a,q)=>a+q[1],0);}};
  mix(M4T().map5,2,[['stoneboar',4],['mistling',6]]);mix(M4T().map6,2,[['stoneboar',3],['mistling',3]]);mix(M4T().map6,6,[['ruinwarden_m4',2],['mistling',3]]);
  if(SWARM.on)for(const [mk,T] of Object.entries(SWARM.mix)){const M=M4T()[mk];if(!M||!M.zc||(M.zones&&M.zones.planned))continue;for(const z of M.zc){const v=T[z.id];if(v==null||z.c2x)continue;z.c2x=1;
    if(Array.isArray(v))mix(M,z.id,v);else if(Array.isArray(z.mix)){const t0=z.mix.reduce((a,q)=>a+q[1],0)||1;let left=v;z.mix=z.mix.map((q,i)=>{const n=i===z.mix.length-1?left:Math.round(q[1]*v/t0);left-=n;return [q[0],n].concat(q.slice(2));});z.cnt=v;}else z.cnt=v;}}
  return C2READY=true;}catch(e){C2.err.push('species '+e.message);return false;}}
c2Species();
function c2Stats(e){if(!e)return e;
  if(e.type==='mistling'){if(typeof C182!=='undefined'&&C182.monStats){const t={type:e.type,L:e.L,m:Object.assign({},e.m,{elite:0,boss:0})};C182.monStats(t);
      e.maxHp=e.hp=Math.max(1,Math.round(t.maxHp*MSPC.hpMul));e.atk=t.atk*MSPC.atkMul;e.def=t.def*MSPC.defMul;e.def0=e.def;if(t.eva!=null)e.eva=t.eva*MSPC.evaMul;e.expBase=Math.round(t.expBase*MSPC.expMul);}
    e.sp=Math.round(((MOBS.stoneboar&&MOBS.stoneboar.sp)||70)*MSPC.spdMul);e.joinMode='pack';}
  else if(e.type==='veilwater_serpent'){e.atk*=.35;e.maxHp=e.hp=(window.__SERPK&&__SERPK.on?210000:235000);e.sp=90;if(typeof G==='undefined'||G.zone!=='anim_studio')e.c2boss=1;}   // the Studio copy keeps the numbers but not the quest rules (reset, no loot)
  return e;}
{const o=makeEnemy;makeEnemy=function(t,L){if(CH2&&t==='mistling'&&typeof G!=='undefined'&&G.zone===M6ID&&L<26)arguments[1]=Math.min(28,L+2);const e=o.apply(this,arguments);try{if(CH2)c2Stats(e);}catch(_){}return e;};}
/* props: rubble, ice gate stop, Kraga's ruin */
const P_=o=>Object.assign({cat:'m4test',w:2,h:2,ax:1,ay:1,liveOnly:1,nofade:1,draw(){}},o);
const RUB={x:762,y:352,w:175,h:146.5,fy:141};
function drawRubble(c,x,y,a,dy){if(!c2ok('rubble'))return;c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';if(a!=null)c.globalAlpha*=a;c.drawImage(C2I.rubble,x-RUB.w/2,y-RUB.fy+(dy||0),RUB.w,RUB.h);c.restore();}
const KR={dx:-1200,dy:-370,pieces:[],solid:[]};
try{const D5=window.__M5_DATA;if(D5){const H=D5.props.filter(p=>p[0]==='ruin'&&p[2]>1400&&p[3]>2500);KR.pieces=H.map(p=>['m5S_'+p[1],p[2]+KR.dx,p[3]+KR.dy]);
  KR.solid=D5.solids.filter(s=>s[0]>1380&&s[0]<1820&&s[1]>2560&&s[1]<2780).map(([x,y,r])=>({dx:x+KR.dx,dy:y+KR.dy,r}));}}catch(e){C2.err.push('kruin '+e.message);}
if(CH2&&typeof PROP_DEFS!=='undefined'){
  PROP_DEFS.c2Rubble=P_({n:'Map 5 north arch rubble (A1, chapter 2)',w:RUB.w,h:RUB.h,ax:RUB.w/2,ay:RUB.fy,live:(c,p)=>drawRubble(c,p.x,p.y),solid:[-62,-31,0,31,62].map(dx=>({dx,dy:-6,r:27}))});
  PROP_DEFS.c2IceStop=P_({n:'Map 6 ice gate shut (chapter 2)',solid:[-90,-60,-30,0,30,60,90].map(dx=>({dx,dy:500,r:24}))});
  // the same black burn trail as Map 2 inside each ruin (story c2_m2), as a Map 5 ground-layer piece (drawn over the baked ground)
  PROP_DEFS.c2Burn=P_({n:'Map 5 burn trail in a ruin (chapter 2)',layer:'ground',w:320,h:120,ax:160,ay:60,live:(c,p)=>{if(!aok('burn'))return;const im=AI.burn,w=300,h=w*im.naturalHeight/im.naturalWidth;
    c.save();c.globalAlpha*=.9;c.imageSmoothingEnabled=true;c.drawImage(im,p.x-w/2,p.y-h/2,w,h);c.restore();}});
  PROP_DEFS.c2KruinSolid=P_({n:'Map 5 Kraga ruin collision (chapter 2)',solid:KR.solid});}
// p331 r3 (DeaRz 30 Oct 10:05): in Map 6 Kraga is drawn inside the game's y-sort (as a live prop at his feet), so the clawed-wall
// layer of his ruined house no longer covers his head when the hero stands in front of him
const KSORT={zone:null};if(typeof PROP_DEFS!=='undefined')PROP_DEFS.c2KragaSort=P_({n:'Kraga y-sort (chapter 2, Map 6)',live(c,p){try{const n=npcHere().find(m=>m.id==='npc_demon_wounded');if(n)drawNpc(n);}catch(e){C2.err.push('ksort '+e.message);}}});
const mkp=(t,x,y)=>({t,x:Math.round(x),y:Math.round(y),s:1,v:0,f:1,ph:0,edge:1,nc:0,m4:1});
if(CH2&&typeof loadPropsFor==='function'){const o=loadPropsFor;loadPropsFor=function(zid){const r=o.apply(this,arguments);try{if(Array.isArray(r)){
  if(zid===M5ID){if(!archOpen())r.push(mkp('c2Rubble',RUB.x,RUB.y));for(const [t,x,y] of KR.pieces)if(PROP_DEFS[t])r.push(mkp(t,x,y));for(const id of ['p_m5_house_1','p_m5_house_2','p_m5_house_3','p_m5_house_4']){const q=PT[id];if(q)r.push(mkp('c2Burn',q.x+15,q.y+8));}r.push(mkp('c2KruinSolid',0,0));}
  if(zid===M6ID&&!iceOpen())r.push(mkp('c2IceStop',1700,0));
  if(zid===M6ID&&PROP_DEFS.c2KragaSort){const k=NP.find(n=>n.id==='npc_demon_wounded');if(k&&k.at.zone===M6ID){r.push(mkp('c2KragaSort',k.at.x,k.at.y));KSORT.zone=M6ID;}}}}catch(e){C2.err.push('props '+e.message);}return r;};}
function c2Refresh(){if(typeof PROPS==='undefined')return;let ch=0;
  for(let i=PROPS.length-1;i>=0;i--){const p=PROPS[i];if(!p)continue;if((p.t==='c2Rubble'&&archOpen())||(p.t==='c2IceStop'&&iceOpen())){PROPS.splice(i,1);ch=1;}}
  if(ch)try{buildSolids();}catch(_){}}
function wrapArch(){const M=M4T();if(!CH2||!M.goMap6||M.goMap6.c2)return;const o=M.goMap6;
  M.goMap6=function(){if(G.zone===M5ID&&!archOpen()){C2.stats.archBlock++;if(!M._c2t||clk()-M._c2t>3){M._c2t=clk();thought(t('archShut'));}return false;}return o.apply(this,arguments);};M.goMap6.c2=1;}
wrapArch();
function gateArt(){const M6=M4T().map6;if(!M6||!M6.art||G.zone!==M6ID)return;const open=iceOpen()&&clk()>(C2.iceBreakUntil||0),cur=M6.art.gate;
  if(open){if(c2ok('gateOpen')&&cur!==C2I.gateOpen)M6.art.gate=C2I.gateOpen;}else if(cur===C2I.gateOpen)delete M6.art.gate;}
/* NPC spots that change with the story (Reo → Map 5 plaza after m4_03) */
function npcMoves(){for(const n of Object.values(NPC)){if(!n.at2)continue;if(isDone(n.at2.after)){if(!n.at0)n.at0=n.at;if(n.at.zone!==n.at2.zone)n.at={zone:n.at2.zone,x:n.at2.x,y:n.at2.y};}else if(n.at0&&n.at!==n.at0)n.at=n.at0;}}
/* quest-only Mistling packs */
const WV={};
function zoneLv(){return G.zone===M6ID?[26,28]:[18,20];}
function waveTick(){const want=new Set();if(dlgOpen()||CUT)return;
  for(const q of active()){const r=qs(q.id),o=curObj(q);if(!o||o.kind!=='kill'||!o.pack)continue;const p=PT[o.near];if(!p||p.zone!==G.zone)continue;
    const key=q.id+'#'+r.i;want.add(key);const W=WV[key]||(WV[key]={n:0,deadT:0});const alive=enemies.filter(e=>e.c2w===key&&!e.dead).length,left=need(o)-(r.o[r.i]||0);
    if(alive){W.deadT=0;continue;}if(left<=0||Math.hypot(P.x-p.x,P.y-p.y)>750)continue;if(W.n>0){if(!W.deadT)W.deadT=clk();if(clk()-W.deadT<2.5)continue;}
    const lv=zoneLv();let got=0;for(let j=0,nP=o.pack*(SWARM.on?SWARM.pack:1);j<nP;j++){const s=c2Spot(p.x,p.y,90,230,16);if(!s)continue;const e=makeEnemy('mistling',lv[0]+Math.floor(Math.random()*(lv[1]-lv[0]+1)),s[0],s[1]);if(!e)continue;
      e.c2w=key;e.sx=s[0];e.sy=s[1];e.wx=e.x;e.wy=e.y;e.aggro=q.type==='main';if(e.aggro)e.alertT=.6;enemies.push(e);got++;try{ring(s[0],s[1],8,60,.5,'#cfe3ee',3);}catch(_){}}
    if(got){W.n++;W.deadT=0;C2.stats.waves++;C2.stats.wmobs+=got;say('wave '+key+' '+got);}}
  for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];if(e.c2w&&!want.has(e.c2w)&&!e.dead&&!e.aggro){enemies.splice(i,1);C2.stats.despawn++;}}}
/* the maddened serpent: always on the hero, never walks home, resets when the hero falls */
function serpentTick(){for(const e of enemies){if(!e.c2boss||e.dead)continue;
  if(P.dead){if(!e.c2reset){e.c2reset=1;e.hp=e.maxHp;e.aggro=false;if(e.c2home){e.x=e.sx=e.c2home[0];e.y=e.sy=e.c2home[1];}for(const k in (e.st||{}))delete e.st[k];C2.stats.serpReset++;say('serpent reset');}continue;}
  if(e.c2reset){e.c2reset=0;try{thought(t('serpentReset'));}catch(_){}}
  if(Math.hypot(P.x-e.x,P.y-e.y)<700){e.aggro=true;e.sx=e.x;e.sy=e.y;}
  // bite cooldown x0.8 (Balance v1): a new attack just reset atkCd upward -> shorten it once
  if((e.atkCd||0)>(e.c2cd||0)+.05){e.atkCd*=.8;C2.stats.bite=(C2.stats.bite||0)+1;}e.c2cd=e.atkCd||0;}}
// the quest serpent is not the world boss: no "Dark Lord vanquished" banner / world-boss timer, no normal loot (Balance v1); its EXP stays
{const o=killEnemy;killEnemy=function(e){if(!e||!e.c2boss||e.dead)return o.apply(this,arguments);const m0=e.m,b0=G.bossT,g0=P.gold,ad=addItem,dl=typeof dropLoot==='function'?dropLoot:null;
  e.m=Object.assign({},m0,{boss:0});addItem=()=>true;if(dl)dropLoot=()=>{};try{return o.apply(this,arguments);}finally{e.m=m0;G.bossT=b0;P.gold=g0;addItem=ad;if(dl)dropLoot=dl;say('serpent down');}};}
{const o=killEnemy;killEnemy=function(e){const was=e&&e.dead,r=o.apply(this,arguments);try{if(e&&!was&&e.dead&&e.type==='veilwater_serpent')serpSmoke(e.x,e.y);}catch(_){}return r;};}
// the approved sprites exist (p328): no stand-in label · death: the black shard melts into smoke (art brief: smoke is drawn in game)
function serpArt(){const S=window.__SERPENT;return !!(S&&S.R&&S.R.ready&&S.R.cfg.enabled);}
function serpSmoke(x,y){if(typeof part!=='function')return;const z=G.zone;C2.stats.smoke=(C2.stats.smoke||0)+1;
  for(let k=0;k<10;k++)setTimeout(()=>{if(G.zone!==z)return;for(let j=0;j<4;j++){const r=Math.random;part({x:x+(r()-.5)*36,y:y-78+(r()-.5)*14,vx:(r()-.5)*24,vy:-24-r()*26,life:1.3+r()*.8,max:2.1,size:16+r()*14,col:j%3?'#17151f':'#3b3548',type:'smoke',grow:16,drag:.96});}},520+k*110);}
/* the Map 5/6 mistling packs: the plan spreads homes one by one; move every 2nd/3rd mistling home next to the 1st (a pack of 3) */
function regroup(){for(const M of [M4T().map5,M4T().map6]){const Z=M&&M.zones;if(!Z||!Z.planned||Z.c2grp)continue;Z.c2grp=1;
  const by={};for(const m of Z.members)if(m.type==='mistling')(by[m.z.id]=by[m.z.id]||[]).push(m);
  for(const L of Object.values(by))for(let i=0;i<L.length;i+=3){const a=L[i];for(let j=1;j<3&&i+j<L.length;j++){const m=L[i+j],hx=a.hx+(j===1?-55:55),hy=a.hy+(j===1?30:35);
    m.hx=hx;m.hy=hy;const e=m.e;if(e&&!e.dead&&!e.aggro&&(!P||Math.hypot(P.x-e.x,P.y-e.y)>500)){e.x=e.sx=e.wx=hx;e.y=e.sy=e.wy=hy;}C2.stats.regroup++;}}}}
function iceHint(){if(G.zone!==M6ID||iceOpen()||active().some(q=>{const o=curObj(q);return o&&o.point==='p_m6_ice_gate';}))return;if(Math.hypot(P.x-1700,P.y-560)<110&&(!C2.ihT||clk()-C2.ihT>4)){C2.ihT=clk();C2.stats.iceHint++;thought(t('iceShut'));}}
let c2T=0;function c2Tick(dt){try{swarmTick();}catch(_){}try{if(typeof P!=='undefined'&&P&&P.dead)serpentTick();}catch(_){}if(!live())return;c2Species();wrapArch();gateArt();if((c2T-=dt)>0)return;c2T=.25;
  try{npcMoves();c2Refresh();waveTick();serpentTick();regroup();iceHint();}catch(e){if(C2.err.length<20)C2.err.push('tick '+e.message);}}
{const o=loadZone;loadZone=function(){try{npcMoves();c2Species();}catch(_){}return o.apply(this,arguments);};}
/* effects */
function c2FxStart(k){if(k==='ice_gate_break')C2.iceBreakUntil=clk()+1.1;}
function shard(x,y,a,s){ctx.beginPath();ctx.moveTo(x+Math.cos(a)*s,y+Math.sin(a)*s);ctx.lineTo(x+Math.cos(a+2.3)*s*.6,y+Math.sin(a+2.3)*s*.6);ctx.lineTo(x+Math.cos(a+4)*s*.8,y+Math.sin(a+4)*s*.8);ctx.closePath();ctx.fill();}
function c2DrawFx(f,k,s){const tt=clk();
  if(f.k==='lantern_push_rubble'){glowAt(P.x,P.y-60,50+90*s,'255,214,120',.65*s);ctx.globalCompositeOperation='source-over';drawRubble(ctx,RUB.x,RUB.y,Math.max(0,1-k*1.25),24*k);
    ctx.fillStyle='#c9c2b4';for(let j=0;j<14;j++){const a=j*.45,r=40+110*k;ctx.globalAlpha=.45*(1-k);ctx.beginPath();ctx.arc(RUB.x+Math.cos(a)*r,RUB.y-20+Math.sin(a)*r*.35-20*k,10+14*k,0,6.283);ctx.fill();}return true;}
  if(f.k==='ice_spark_resonance'){for(let j=0;j<3;j++){const q=(k*1.6+j/3)%1;ctx.save();ctx.strokeStyle='rgba(170,225,255,'+(.8*(1-q))+')';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(f.x,f.y-90,40+260*q,(40+260*q)*.42,0,0,6.283);ctx.stroke();ctx.restore();}
    glowAt(f.x,f.y-90,40+120*s,'190,235,255',.7*s);const u=Math.min(1,Math.max(0,(k-.45)/.5)),sx=f.x+(P.x-f.x)*u,sy=f.y-90+(P.y-60-(f.y-90))*u-Math.sin(Math.PI*u)*110;if(u>0&&u<1)glowAt(sx,sy,24,'200,240,255',.95);return true;}
  if(f.k==='lantern_blue_tint_on'){glowAt(P.x+14,P.y-66,30+60*s,'120,190,255',.75*s);glowAt(P.x+14,P.y-66,12+10*s,'255,226,150',.9*s);
    for(let j=0;j<8;j++){const a=tt*3+j*.785,r=26+22*s;glowAt(P.x+14+Math.cos(a)*r,P.y-66+Math.sin(a)*r*.6,6,'150,210,255',.8*(1-k));}return true;}
  if(f.k==='ice_gate_break'){const cx=f.x,cy=300;glowAt(cx,cy,60+200*k,'220,240,255',.8*(1-k));ctx.globalCompositeOperation='source-over';
    if(k>.42){const u=(k-.42)/.58;for(let j=0;j<26;j++){const a=j*2.399,v=120+90*Math.sin(j*1.7),x=cx+Math.cos(a)*v*u*1.3,y=cy+60*Math.sin(j)+Math.sin(a)*v*u*.5+260*u*u;
      ctx.globalAlpha=.85*(1-u);ctx.fillStyle=j%3?'#cfeaff':'#ffffff';shard(x,y,a+tt*4+j,8+6*Math.sin(j*3.1)**2);}}
    else{ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=2;for(let j=0;j<7;j++){const a=j*.9+.3,l=30+120*(k/.42);ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*l,cy+Math.sin(a)*l*.9);ctx.stroke();}}return true;}
  if(f.k==='small_lantern_on'){glowAt(f.x,f.y-26,20+70*s,'255,200,110',.75*s);glowAt(f.x,f.y-26,8+6*s,'255,245,200',.95);return true;}
  return false;}
function flame(x,y,tt,i,sc){sc=sc||1;const fl=1+.08*Math.sin(tt*9+i*1.3)+.05*Math.sin(tt*14+i);glowAt(x,y-26*sc,(46+4*Math.sin(tt*5+i))*sc,'255,170,70',.55);
  ctx.save();ctx.globalCompositeOperation='source-over';const h=24*sc*fl,w=8*sc,yb=y-14*sc;const g=ctx.createLinearGradient(0,yb-h,0,yb);g.addColorStop(0,'rgba(255,240,170,.95)');g.addColorStop(.55,'rgba(255,170,60,.95)');g.addColorStop(1,'rgba(230,90,30,.9)');
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x,yb-h);ctx.quadraticCurveTo(x+w*1.3,yb-h*.35,x,yb);ctx.quadraticCurveTo(x-w*1.3,yb-h*.35,x,yb-h);ctx.fill();ctx.restore();glowAt(x,y-22*sc,10*sc,'255,245,210',.9);}
function c2Persistent(S,tt){if(!CH2)return;const z=G.zone;if(z!==M5ID&&z!==M6ID)return;
  const s2=qs('c2_s2_small_lights'),q2=QBY.c2_s2_small_lights;
  if(s2&&q2)for(let i=1;i<=5;i++){const p=PT['p_m5_light_'+i];if(!p||p.zone!==z)continue;const j=q2.objectives.findIndex(o=>o.kind==='interact'&&o.point===p.id);if(s2.s==='d'||s2.s==='r'||(j>=0&&s2.i>j)){if(aok('lamp_on')){glowAt(p.x,p.y-24,30+3*Math.sin(tt*3+i),'255,196,110',.55);glowAt(p.x,p.y-24,9,'255,240,190',.7);}else flame(p.x,p.y,tt,i);}}
  const sg=PT.p_m5_plaza_sign;if(sg&&sg.zone===z&&S.flags.mira_lantern_lit){if(aok('lamp_on')){glowAt(sg.x-30,sg.y-24,30+3*Math.sin(tt*3),'255,196,110',.55);}else flame(sg.x,sg.y,tt,9,1.4);}
  ctx.save();ctx.globalCompositeOperation='source-over';
  for(const e of enemies){if(e.dead)continue;
    if(e.type==='mistling'&&!e.aggro){const id=(e.id||e.sx||0)*.37;for(let j=0;j<4;j++){const q=(tt*.7+j/4+id)%1,a=j*1.7+id;ctx.globalAlpha=.42*(1-q)*Math.min(1,q*4);ctx.fillStyle='#f4f8fc';
      ctx.beginPath();ctx.arc(e.x+Math.cos(a)*(10+16*q),e.y+6-q*16,4+7*q,0,6.283);ctx.fill();}}
    if(e.c2boss&&!serpArt()){ctx.globalAlpha=1;txt(t('waitArt')+' · TEST',e.x,e.y-(e.sz||30)*3.1-14,'#ffe6a0',12);}}
  ctx.restore();}
C2.api={archOpen,iceOpen,WV,KR,regroup,c2Spot,walkOk,propList,props,aok:k=>aok(k),SWARM,serpSmoke:(x,y)=>serpSmoke(x,y)};

C1.api={hold:()=>HOLD,cut:()=>CUT,QBY,NPC,PT,start,talk,finish,ev,aff,affAdd,affRec,discount,gateOpen,play,mark,shown,objText,
  state:()=>{const S=c1();return S&&S.c1;},flags:()=>{const S=c1();return S&&S.flags;},cutscene,today,fx,c2:()=>C2};
C1.ok=true;
}catch(e){C1.err=e.message;C1.ok=false;}
})();

