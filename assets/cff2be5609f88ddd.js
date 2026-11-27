
/* ---- prof-r1 (TEST, 10 Nov 2026): special-skill proficiency (DeaRz APPROVED 13:18; spec BALANCE_special_skill_proficiency_v1) ----
   Special skills (Sakura Blade 'sak', Demon Domain 'dd', Guardian of 18 Arms 'g18') have NO skill points. Each has a level 1-10 and a proficiency bar.
   Gain: +1 per cast that hits at least one valid monster (a whiff or a dummy gives 0). The cast gives the weight of the best monster it hit:
   monster within 5 levels of the player (or higher) 1.0, 6-10 below 0.5, 11-20 below 0.2, more than 20 below 0; elite x1.5, boss x2.
   Casts needed per level: 20, 30, 45, 65, 90, 120, 160, 210, 270 (Lv1->2 ... Lv9->10). State in P.prof = {sak:{lv,n}, dd:{...}, g18:{...}}, saved with the character (kept on death).
   The level shows in the "สกิลพิเศษ" page of the skill window (bar + Lv) and on the round skill button (badge + thin bar).
   EFFECT: the level effect must come from each skill's Lv1-Lv10 table. In the code those skills have ONE set of numbers (no Lv table), so the effect multiplier table PROF.cfg.effect is flat 1.0 until Balance sends the table
   (hit damage is multiplied by effect[id][lv-1]). ?prof=x10 = 10x gain (testing), ?prof=off = no proficiency. Debug: window.PROF. ---- */
(function(){'use strict';
const Q=String(location.search),mq=/[?&]prof=(x\d+|off)\b/.exec(Q),mode=mq?mq[1]:'on';
const PR=window.PROF={ver:'prof-r1',on:mode!=='off',mult:mode&&/^x\d+$/.test(mode)?+mode.slice(1):1,err:null,log:[],
  cfg:{need:[20,30,45,65,90,120,160,210,270],maxLv:10,win:{sak:4,dd:6,g18:8,th:6},names:{sak:'ดาบซากุระ',dd:'อาณาเขตปีศาจ',g18:'ผู้พิทักษ์ 18 กร',th:'เทพดาบสายฟ้า'},kind:{sakura:'sak',demon:'dd',guardian18:'g18'},
    effect:{sak:null,dd:null,g18:null,th:null}}};   /* effect[id] = array of 10 damage multipliers, null = flat */
const ERR=(w,e)=>{PR.err=w+': '+((e&&e.message)||e);try{console.error('[PROF]',w,e)}catch(_){}};
if(!PR.on)return;
const C=PR.cfg,IDS=['sak','dd','g18','th'];
/* ---- state ---- */
const slotSave=()=>{try{if(typeof CH!=='undefined'&&CH&&CH.cur>=0&&CH.list&&CH.list[CH.cur]){const r=CH.list[CH.cur].save;return r?JSON.parse(r):null}}catch(_){}return undefined};
function fresh(){const o={};for(const id of IDS)o[id]={lv:1,n:0};return o}
const PK='lanternfall_prof_v1';   /* stored per character slot (slot number + name), not inside the save json: a death / revive / exp change cannot lose it, and a new character starts fresh */
const charKey=()=>{try{if(typeof CH!=='undefined'&&CH&&CH.cur>=0&&CH.list&&CH.list[CH.cur])return CH.cur+':'+(CH.list[CH.cur].name||'')}catch(_){}return 'solo'};
function readAll(){try{return JSON.parse(localStorage.getItem(PK)||'{}')||{}}catch(_){return {}}}
function init(){const sv=readAll()[charKey()],o=fresh();
  if(sv&&typeof sv==='object')for(const id of IDS)if(sv[id]){o[id].lv=Math.max(1,Math.min(C.maxLv,sv[id].lv|0||1));o[id].n=+sv[id].n||0}
  P.prof=o;P._profInit=1;P._profKey=charKey()}
function persist(){try{if(!P||P._profInit!==1)return;const a=readAll();a[P._profKey||charKey()]=P.prof;localStorage.setItem(PK,JSON.stringify(a))}catch(e){ERR('persist',e)}}
PR.persist=persist;PR.gain=function(){return gain.apply(this,arguments)};const S=()=>{if(!P)return fresh();if(P._profInit!==1)init();return P.prof};
PR.state=()=>JSON.parse(JSON.stringify(S()));
const needOf=lv=>lv>=C.maxLv?0:C.need[lv-1];
/* ---- cast windows and hits ---- */
let ctxs=[];
function weight(e){try{const m=e.m||{},t=String(e.type||'');if(/dummy/i.test(t)||m.dummy||e.dummy)return 0;
  const d=(P.lvl|0)-(e.L|0);let w=d<=5?1:d<=10?.5:d<=20?.2:0;if(m.boss)w*=2;else if(m.elite||e.eliteX)w*=1.5;return w}catch(_){return 0}}
function startCtx(id){ctxs.push({id,t0:(typeof time==='number'?time:0),best:0,hits:0,done:false})}
function wrapCast(obj,name,id){try{const o=obj&&obj.cast;if(typeof o!=='function'||o._prof)return false;const f=function(a){const r=o.apply(this,arguments);if(r&&!(id==='g18'&&a===true))startCtx(id);return r};f._prof=1;obj.cast=f;return true}catch(e){ERR('wrap '+name,e);return false}}
let wrapped={};setInterval(()=>{try{if(!wrapped.sak&&window.SAKURA)wrapped.sak=wrapCast(SAKURA,'SAKURA','sak');if(!wrapped.dd&&window.DDOM)wrapped.dd=wrapCast(DDOM,'DDOM','dd');if(!wrapped.g18&&window.GUARDIAN18)wrapped.g18=wrapCast(GUARDIAN18,'G18','g18')}catch(e){ERR('wrap',e)}},400);
try{const _he=hitEnemy;hitEnemy=function(e,m,o){const id=o&&o.kind&&C.kind[o.kind];
  if(id&&P&&!P.dead){const t=(typeof time==='number'?time:0);let cx=null;for(let i=ctxs.length-1;i>=0;i--)if(ctxs[i].id===id&&!ctxs[i].done){cx=ctxs[i];break}
    if(cx){cx.hits++;const w=weight(e);if(w>cx.best)cx.best=w}
    const ef=C.effect[id];if(ef){const lv=S()[id].lv;if(ef[lv-1]!=null)m=m*ef[lv-1]}}
  return _he.call(this,e,m,o)}}catch(e){ERR('hook hit',e)}
function gain(id,amt){const s=S()[id];if(!s)return;amt*=PR.mult;if(amt<=0)return;
  s.n+=amt;while(s.lv<C.maxLv&&s.n>=needOf(s.lv)){s.n-=needOf(s.lv);s.lv++;PR.log.push(id+' -> Lv'+s.lv);try{textAt(P.x,P.y-80,C.names[id]+' เลเวล '+s.lv+'!','#ffe08a',16,{life:1.8});log(C.names[id]+' ชำนาญขึ้นเป็น Lv '+s.lv,'g')}catch(_){}}
  if(s.lv>=C.maxLv)s.n=0;persist()}
setInterval(()=>{try{if(typeof P==='undefined'||!P)return;const t=(typeof time==='number'?time:0);
  for(const c of ctxs){if(!c.done&&t-c.t0>=C.win[c.id]){c.done=true;PR.log.push(c.id+' cast: hits='+c.hits+' best='+c.best);if(c.hits>0&&c.best>0)gain(c.id,c.best)}}
  ctxs=ctxs.filter(c=>!c.done||t-c.t0<C.win[c.id]+2)}catch(e){ERR('tick',e)}},150);
PR.casts=()=>ctxs.length;
setInterval(()=>{try{if(P&&P._profInit===1&&P._profKey!==charKey()){P._profInit=0}}catch(_){}},1000);
/* ---- UI: special-skill page rows + round buttons ---- */
const st=document.createElement('style');st.textContent='.spProf{margin-top:4px;font:700 12px system-ui,sans-serif;color:#ffe9b0}.spProf .bar{height:7px;border-radius:4px;background:rgba(0,0,0,.55);border:1px solid #9a7a3a;overflow:hidden;margin-top:3px}.spProf .bar i{display:block;height:100%;background:linear-gradient(90deg,#e0a43a,#ffe08a)}'
  +'.spLvB{position:absolute;right:-2px;top:-4px;min-width:22px;padding:1px 5px;border-radius:9px;background:#5a3a14;border:1px solid #ffd98a;color:#fff4cf;font:800 11px system-ui,sans-serif;z-index:3;pointer-events:none;text-align:center}.spBarB{position:absolute;left:8%;right:8%;bottom:-6px;height:5px;border-radius:3px;background:rgba(0,0,0,.6);border:1px solid #9a7a3a;overflow:hidden;z-index:3;pointer-events:none}.spBarB i{display:block;height:100%;background:linear-gradient(90deg,#e0a43a,#ffe08a)}';
document.head.appendChild(st);
const label=id=>{const s=S()[id],nd=needOf(s.lv),pct=nd?Math.min(100,Math.round(100*s.n/nd)):100;return {lv:s.lv,pct,txt:nd?('ชำนาญ Lv '+s.lv+' · '+Math.floor(s.n)+' / '+nd+' ('+pct+'%)'):('ชำนาญ Lv '+s.lv+' (เต็ม)')}};
function decorate(){try{const list=document.getElementById('spList');
  if(list)for(const row of list.children){const txt=row.textContent||'';let id=null;for(const k of IDS)if(txt.indexOf(C.names[k])>=0){id=k;break}if(!id)continue;const L=label(id);
    let p=row.querySelector('.spProf');if(!p){p=document.createElement('div');p.className='spProf';p.innerHTML='<span class="t"></span><div class="bar"><i></i></div>';const host=row.querySelector('.spmain')||row;host.appendChild(p)}
    const t=p.querySelector('.t');if(t.textContent!==L.txt)t.textContent=L.txt;const b=p.querySelector('.bar i');const w=L.pct+'%';if(b.style.width!==w)b.style.width=w}
  for(const [bid,id] of [['sakBtn','sak'],['ddBtn','dd'],['g18Btn','g18']]){const b=document.getElementById(bid);if(!b)continue;const L=label(id);
    let lb=b.querySelector('.spLvB');if(!lb){lb=document.createElement('span');lb.className='spLvB';b.appendChild(lb);const bar=document.createElement('span');bar.className='spBarB';bar.innerHTML='<i></i>';b.appendChild(bar)}
    const t='Lv'+L.lv;if(lb.textContent!==t)lb.textContent=t;const i=b.querySelector('.spBarB i');const w=L.pct+'%';if(i&&i.style.width!==w)i.style.width=w;b.title=(b.title||'').replace(/ · ชำนาญ.*$/,'')+' · '+L.txt}}catch(e){ERR('ui',e)}}
setInterval(decorate,400);
console.info('[PROF] special-skill proficiency loaded · mode='+mode);
})();
