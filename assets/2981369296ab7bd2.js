
/* ---- r121 questhud (DeaRz HUD + quest-navigation order): (1) the quest tracker moves from the top right to the LEFT, under the HUD, grouped by category with a header each (main = gold, side = blue, repeatable / daily = green, affinity / special = purple; main first; each group collapses); (2) the round dropdown button under the HUD now collapses / expands the QUEST TRACKER and the weapon circle / HUD keep one fixed size (no more shrink); (3) every quest row is clickable = auto-walk: own A* on the game's blocked() grid (32 px cells, props / Map 5-6-11 masks included), monsters standing near the path are avoided, re-path every 0.6 s and on a stall, cross-map goals go through the warp gates (BFS over gatesFor), manual input / attack / skill cancels, stops next to the NPC and opens its dialog, stops next to the nearest quest monster for kill objectives; a small "กำลังเดินไป: <target> ✕" indicator. Flags: ?questhud=off (old tracker + old fold button), ?questnav=off (no click-to-walk), ?questcat=off (flat gold list). Debug: window.__QUESTHUD ---- */
(function(){'use strict';
const Q=String(location.search),QH=window.__QUESTHUD={ver:'questhud-r2',on:!/[?&]questhud=off\b/.test(Q),nav:!/[?&]questnav=off\b/.test(Q),cat:!/[?&]questcat=off\b/.test(Q),err:null,starts:0,arrivals:0,cancels:0,repaths:0,rows:[],cur:null};
if(!QH.on)return;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CATS=[['main','เควสหลัก','#ffd36b'],['side','เควสรอง','#7fb8ff'],['daily','เควสทำซ้ำได้','#8fe39a'],['special','เควสพิเศษ / ความสนิท','#d8a6ff']];
const catOf=q=>{const t=String(q.type||'').toLowerCase(),id=String(q.id||'');if(t==='main')return 'main';if(t==='side')return 'side';if(/daily|repeat/.test(t)||/^d_/.test(id))return 'daily';return 'special'};
QH.catOf=catOf;
let LS={};try{LS=JSON.parse(localStorage.getItem('lanternfall_questhud_v1')||'{}')||{}}catch(_){}
const saveLS=()=>{try{localStorage.setItem('lanternfall_questhud_v1',JSON.stringify(LS))}catch(_){}};
/* ---------- DOM ---------- */
const css=document.createElement('style');css.id='questhudCss';css.textContent=`#c1Track{display:none!important}
#qtL{position:fixed;left:8px;top:168px;z-index:56;width:232px;max-height:clamp(150px,calc(100vh - 520px),520px);overflow:auto;box-sizing:border-box;padding:6px 8px 8px;border-radius:10px;background:rgba(14,14,22,.82);border:1px solid rgba(217,182,92,.7);color:#f4ecd6;font:12.5px/1.4 Sarabun,"Noto Sans Thai",sans-serif;scrollbar-width:thin}
#qtL[hidden]{display:none}
#qtL .th{color:#ffd36b;font-weight:700;font-size:11px;margin-bottom:2px}
#qtL .gh{display:flex;align-items:center;gap:5px;margin-top:5px;font-weight:700;font-size:11.5px;cursor:pointer;user-select:none}
#qtL .gh i{font-style:normal;opacity:.8}
#qtL .qr{margin:2px 0 3px;padding:3px 5px;border-radius:7px;cursor:pointer;border:1px solid transparent}
#qtL .qr:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.15)}
#qtL .qr.go{background:rgba(255,211,107,.14);border-color:rgba(255,211,107,.5)}
#qtL .qn{font-weight:700}#qtL .qo{font-size:11.5px;color:#d8d2c0}#qtL .qo.r{color:#9ff5b0}#qtL .qz{font-size:10.5px;color:#a8b4c8}
#qtInd{position:fixed;left:50%;top:92px;transform:translateX(-50%);z-index:57;display:none;align-items:center;gap:8px;padding:4px 6px 4px 12px;border-radius:999px;background:rgba(14,14,22,.88);border:1px solid #c9a86a;color:#f3e2b0;font:600 12.5px Sarabun,"Noto Sans Thai",sans-serif}
#qtInd.on{display:flex}#qtInd button{width:24px;height:24px;border-radius:50%;border:1px solid #c9a86a;background:#2a2014;color:#f3e2b0;cursor:pointer;font-size:12px;padding:0}`;document.head.appendChild(css);
const box=document.createElement('div');box.id='qtL';box.hidden=true;document.body.appendChild(box);
const ind=document.createElement('div');ind.id='qtInd';ind.innerHTML='<span id="qtIndT"></span><button type="button" aria-label="ยกเลิก">✕</button>';document.body.appendChild(ind);
ind.querySelector('button').addEventListener('click',e=>{e.stopPropagation();stopNav('x')});
for(const t of ['pointerdown','mousedown','touchstart'])box.addEventListener(t,e=>e.stopPropagation());
/* ---------- quest data ---------- */
const A=()=>window.CH1Q&&CH1Q.api;
function npcAt(id){try{const n=(window.__QDATA2&&__QDATA2.npcs||[]).find(x=>x.id===id);return n&&n.at&&n.at.zone?n.at:null}catch(_){return null}}
function npcName(id){try{const n=(window.__QDATA2&&__QDATA2.npcs||[]).find(x=>x.id===id);return (n&&n.name)||id}catch(_){return id}}
function zname(z){try{const Z=ZONES[z];return (Z&&(Z.th||Z.n))||z}catch(_){return z}}
function curObj(q,r){return (q.objectives||[])[r.i|0]||null}
function targetOf(q,r){const a=A();if(!a)return null;
  if(r.s==='r'){const at=npcAt(q.receiver);return at?{zone:at.zone,x:at.x,y:at.y,stop:68,label:npcName(q.receiver),kind:'npc',npc:q.receiver}:null}
  const ob=curObj(q,r);if(!ob)return null;
  if(ob.npc&&/^(talk|buy|deliver)$/.test(ob.kind)){const at=npcAt(ob.npc);return at?{zone:at.zone,x:at.x,y:at.y,stop:68,label:npcName(ob.npc),kind:'npc',npc:ob.npc}:null}
  if(ob.point&&a.PT&&a.PT[ob.point]){const p=a.PT[ob.point];return {zone:p.zone,x:p.x,y:p.y,stop:Math.max(30,(p.r||70)*.55),label:p.label||ob.point,kind:'point'}}
  if(Array.isArray(ob.points)&&a.PT){let best=null,bd=1e18;for(const id of ob.points){const p=a.PT[id];if(!p)continue;const here=p.zone===G.zone,d=(here?0:1e9)+Math.hypot(p.x-P.x,p.y-P.y);if(d<bd){bd=d;best=p}}if(best)return {zone:best.zone,x:best.x,y:best.y,stop:Math.max(30,(best.r||70)*.55),label:best.label||'จุดเก็บของ',kind:'point'}}
  if(ob.kind==='kill'||ob.kind==='collect'){const types=ob.types||ob.dropFrom||[];const zone=ob.zone||q.zone;return {zone,kind:'mob',types,stop:150,label:'ล่า '+(types.map(t=>{try{return MOBS[t].n}catch(_){return t}}).join(' / ')||'มอนสเตอร์')}}
  return null}
function textOf(q,r){try{const a=A(),ob=curObj(q,r);if(a&&a.objText)return a.objText(q,ob,r)||''}catch(_){}try{return r.s==='r'?'กลับไปหา '+npcName(q.receiver):(curObj(q,r)||{}).text||''}catch(_){return ''}}
function collect(){const out=[];try{const a=A();if(!a||!a.state)return out;const st=a.state();if(!st)return out;const qs=st.q||{};for(const id in qs){const r=qs[id],q=a.QBY[id];if(!q||!r||(r.s!=='a'&&r.s!=='r'))continue;out.push({q,r,cat:catOf(q),text:textOf(q,r),tg:targetOf(q,r)})}try{if(window.MAINNEXT&&MAINNEXT.rows)MAINNEXT.rows(out)}catch(_){}}catch(e){QH.err='collect '+e.message}return out}
/* ---------- tracker render ---------- */
let sig='';
function render(){try{const rows=collect();QH.rows=rows.map(x=>x.q.id);const live=!(typeof G==='undefined')&&G.state==='play'&&!String(G.zone).startsWith('w00_');
  if(!live||!rows.length||LS.hidden){box.hidden=true;return}
  const groups=QH.cat?CATS:[['all','เควส','#ffd36b']];let html='<div class="th">เควส</div>';
  if(LS.collapsed){html+='<div class="qo" style="margin-top:2px">▸ '+rows.length+' เควส (กดปุ่มวงกลมเพื่อกางรายการ)</div>';const s=html+QH.nav;if(s!==sig){box.innerHTML=html;sig=s}box.hidden=false;return}
  for(const [gk,gl,gc] of groups){const list=rows.filter(x=>gk==='all'||x.cat===gk);if(!list.length)continue;const col=(LS.g&&LS.g[gk])?1:0;
    if(QH.cat)html+=`<div class="gh" data-g="${gk}" style="color:${gc}"><i>${col?'▸':'▾'}</i>${esc(gl)} (${list.length})</div>`;
    if(col)continue;
    for(const x of list){const tg=x.tg,far=tg&&tg.zone&&tg.zone!==G.zone;html+=`<div class="qr${QH.cur&&QH.cur.id===x.q.id?' go':''}" data-id="${esc(x.q.id)}"><div class="qn" style="color:${gc}">${esc(x.q.name)}</div><div class="qo${x.r.s==='r'?' r':''}" style="color:${x.r.s==='r'?'#9ff5b0':gc};opacity:.92">${esc(x.text)}</div>${far?`<div class="qz">→ ${esc(zname(tg.zone))}</div>`:''}</div>`}}
  const s=html+(QH.cur?QH.cur.id:'');if(s!==sig){box.innerHTML=html;sig=s}box.hidden=false}catch(e){QH.err='render '+e.message}}
box.addEventListener('click',e=>{try{e.stopPropagation();const gh=e.target.closest('.gh');if(gh){LS.g=LS.g||{};LS.g[gh.dataset.g]=LS.g[gh.dataset.g]?0:1;saveLS();sig='';render();return}
  const r=e.target.closest('.qr');if(r&&QH.nav)go(r.dataset.id)}catch(er){QH.err='click '+er.message}});
setInterval(render,500);
/* ---------- fold button: collapses the tracker, HUD keeps one size ---------- */
document.addEventListener('click',e=>{try{const b=e.target.closest&&e.target.closest('#hudFold');if(!b)return;e.stopImmediatePropagation();e.preventDefault();LS.collapsed=!LS.collapsed;saveLS();sig='';render();fixHud()}catch(er){QH.err='fold '+er.message}},true);
function fixHud(){try{const h=document.getElementById('hud');if(h&&h.classList.contains('fold'))h.classList.remove('fold');const b=document.getElementById('hudFold');if(b){b.dataset.g=LS.collapsed?'▾':'▴';b.setAttribute('aria-label',LS.collapsed?'กางรายการเควส':'พับรายการเควส');b.setAttribute('aria-expanded',!LS.collapsed);b.title='พับ/กางรายการเควส'}}catch(_){}}
setInterval(fixHud,400);
/* ---------- navigation ---------- */
const NV={cache:{},tmp:[],path:null,pathT:0,lx:0,ly:0,lt:0,stuck:0,lastCall:0,prevAuto:false,route:null};
function grid(){const zid=G.zone,Z=ZONES[zid];let g=NV.cache[zid];if(g&&g.ok)return g;const C=32,cols=Math.ceil(Z.w/C),rows=Math.ceil(Z.h/C),wk=new Uint8Array(cols*rows);
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const x=i*C+16,y=j*C+16;let b=false;try{b=blocked(x,y,13)}catch(_){}wk[j*cols+i]=b?0:1}
  g=NV.cache[zid]={ok:1,C,cols,rows,wk};return g}
function astar(sx,sy,tx,ty){const g=grid(),C=g.C,W=g.cols,H=g.rows,wk=g.wk;const cx=x=>Math.max(0,Math.min(W-1,Math.floor(x/C))),cy=y=>Math.max(0,Math.min(H-1,Math.floor(y/C)));
  const tmpBlocked=(i,j)=>{const x=i*C+16,y=j*C+16;for(const t of NV.tmp)if(Math.hypot(t.x-x,t.y-y)<t.r)return true;return false};
  const nearOpen=(x,y)=>{let a=cx(x),b=cy(y);if(wk[b*W+a])return [a,b];for(let r=1;r<=8;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const i=a+dx,j=b+dy;if(i<0||j<0||i>=W||j>=H)continue;if(wk[j*W+i])return [i,j]}return [a,b]};
  const [ax,ay]=nearOpen(sx,sy),[bx,by]=nearOpen(tx,ty);const N=W*H,start=ay*W+ax,goal=by*W+bx;
  const gs=new Float32Array(N).fill(1e9),came=new Int32Array(N).fill(-1),closed=new Uint8Array(N);const heap=[];
  const push=(i,f)=>{heap.push([f,i]);let k=heap.length-1;while(k){const p=(k-1)>>1;if(heap[p][0]<=heap[k][0])break;[heap[p],heap[k]]=[heap[k],heap[p]];k=p}};
  const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let k=0;for(;;){const l=2*k+1,r=l+1;let m=k;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===k)break;[heap[m],heap[k]]=[heap[k],heap[m]];k=m}}return top[1]};
  const h=i=>{const dx=Math.abs(i%W-bx),dy=Math.abs(((i/W)|0)-by);return dx+dy-.586*Math.min(dx,dy)};
  gs[start]=0;push(start,h(start));let found=false,exp=0;
  while(heap.length){const cur=pop();if(cur===goal){found=true;break}if(closed[cur])continue;closed[cur]=1;if(++exp>60000)break;const x=cur%W,y=(cur/W)|0;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const ni=ny*W+nx;if(closed[ni]||!wk[ni])continue;if(dx&&dy&&(!wk[y*W+nx]||!wk[ny*W+x]))continue;if(NV.tmp.length&&tmpBlocked(nx,ny))continue;
      const ng=gs[cur]+(dx&&dy?1.414:1);if(ng<gs[ni]){gs[ni]=ng;came[ni]=cur;push(ni,ng+h(ni))}}}
  if(!found)return null;const pts=[];for(let i=goal;i!==-1&&i!==start;i=came[i])pts.push([(i%W+.5)*C,((i/W|0)+.5)*C]);pts.reverse();pts.push([tx,ty]);
  const out=[];let from=[sx,sy],i=0;const los=(x0,y0,x1,y1)=>{const d=Math.hypot(x1-x0,y1-y0),n=Math.ceil(d/16);for(let k=1;k<=n;k++){const t=k/n;const x=x0+(x1-x0)*t,y=y0+(y1-y0)*t;if(blocked(x,y,13))return false;if(NV.tmp.length)for(const q of NV.tmp)if(Math.hypot(q.x-x,q.y-y)<q.r)return false}return true};
  while(i<pts.length){let j=pts.length-1;while(j>i&&!los(from[0],from[1],pts[j][0],pts[j][1]))j--;out.push(pts[j]);from=pts[j];i=j+1}return out}
const PLAN={'w22_map4_planned':'w22_map4_test','w22_map10_planned':'w24_map10_test'};
function edgesOf(z){const out=[],seen=new Set();try{for(const c of (window.__WARP&&__WARP.circles)||[]){if(c.z===z&&c.go&&!c.off&&c.dest&&ZONES[c.dest]&&!seen.has(c.dest)){seen.add(c.dest);out.push({to:c.dest,x:c.x,y:c.y+6,circle:1})}}}catch(_){}
  try{for(const g of gatesFor(z)||[]){const to=g.planned?(g.open4?PLAN[g.to]:null):g.to;if(!to||seen.has(to))continue;seen.add(to);out.push(g)}}catch(_){}return out}
function routeTo(zone){const from=G.zone;if(from===zone)return [];const prev={};prev[from]=null;const q=[from];while(q.length){const z=q.shift();if(z===zone)break;const gs=edgesOf(z);for(const g of gs){if(!g||!g.to)continue;let to=g.to;if(g.planned){if(!g.open4)continue;to=PLAN[g.to]||null}if(!to||!ZONES[to]||to in prev)continue;prev[to]=[z,Object.assign({},g,{to})];q.push(to)}}
  if(!(zone in prev))return null;const hops=[];let z=zone;while(prev[z]){hops.push(prev[z]);z=prev[z][0]}hops.reverse();return hops.map(([zf,g])=>({from:zf,to:g.to,x:g.x,y:g.y}))}
function resolve(tg){if(tg.kind==='mob'){let best=null,bd=1e9;for(const e of enemies){if(e.dead||!(e.hp>0)||!tg.types.includes(e.type))continue;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<bd){bd=d;best=e}}if(best)return {x:best.x,y:best.y};const Z=ZONES[G.zone];return {x:Z.w/2,y:Z.h/2,noMob:1}}return {x:tg.x,y:tg.y}}
function go(id){try{const rows=collect(),x=rows.find(r=>r.q.id===id);if(!x||!x.tg){try{textAt(P.x,P.y-62,'เควสนี้ไม่มีจุดหมายให้เดินไป','#ffd98a',13)}catch(_){}return false}
  const tg=x.tg;if(!tg.zone)tg.zone=G.zone;const route=routeTo(tg.zone);if(route===null){try{textAt(P.x,P.y-62,'ยังไม่มีทางไปที่นั่น','#ffd98a',13)}catch(_){}return false}
  stopNav('new',true);QH.cur={id,tg,label:tg.label,route,hop:0,t0:time};NV.route=route;NV.prevAuto=!!G.auto;NV.path=null;NV.tmp.length=0;NV.lastCall=time;NV.lx=P.x;NV.ly=P.y;NV.lt=time;QH.starts++;
  G.auto=true;G.autoT=null;showInd();sig='';render();return true}catch(e){QH.err='go '+e.message;return false}}
QH.go=go;
function showInd(){const c=QH.cur;if(!c){ind.classList.remove('on');return}ind.querySelector('#qtIndT').textContent='กำลังเดินไป: '+c.label;ind.classList.add('on')}
function stopNav(why,silent){if(!QH.cur)return;const keep=QH.cur;QH.cur=null;NV.path=null;if(why==='arrive')QH.arrivals++;else QH.cancels++;G.auto=NV.prevAuto;G.autoT=null;if(!NV.prevAuto){try{const ch=document.getElementById('autoChip');if(ch){ch.classList.remove('on');ch.textContent='AUTOPLAY · OFF'}}catch(_){}}ind.classList.remove('on');sig='';
  if(why==='arrive'&&keep.tg.kind==='npc'){try{const a=A();if(a&&a.talk)a.talk((!/[?&]qtalkfix=off\b/.test(location.search)&&a.NPC&&a.NPC[keep.tg.npc])||keep.tg.npc)/* r214: the quest talk needs the NPC record, not its id (with the id it fell to an idle talk without shop / quest) */}catch(e){QH.err='talk '+e.message}}}
function step(dt){const c=QH.cur;if(!c)return null;NV.lastCall=time;try{if(typeof dlgOpen==='function'&&dlgOpen()){QH.paused=(QH.paused||0)+1;return [0,0]}}catch(_){}
  const hopNow=NV.route&&NV.route[c.hop];
  if(hopNow&&G.zone===hopNow.to){c.hop++;NV.path=null;NV.tmp.length=0}
  const next=NV.route&&NV.route[c.hop];let gx,gy,stop;
  if(next){if(G.zone!==next.from){const r2=routeTo(c.tg.zone);if(r2===null){stopNav('x');return null}NV.route=r2;c.hop=0;NV.path=null;return [0,0]}gx=next.x;gy=next.y;stop=6;if(Math.hypot(gx-P.x,gy-P.y)<18){c.stand=(c.stand||0)+dt;NV.lastCall=time;return [0,0]}else c.stand=0}
  else{if(c.tg.zone&&G.zone!==c.tg.zone){const r2=routeTo(c.tg.zone);if(r2===null||!r2.length){stopNav('x');return null}NV.route=r2;c.hop=0;return [0,0]}const p=resolve(c.tg);gx=p.x;gy=p.y;stop=c.tg.stop;if(p.noMob){try{textAt(P.x,P.y-62,'ยังไม่เห็นมอนสเตอร์ในแมพนี้','#ffd98a',13)}catch(_){}}}
  const d=Math.hypot(gx-P.x,gy-P.y);
  if(!next&&d<=stop){stopNav('arrive');return [0,0]}
  /* stall detection: 0.5 s with < 10 px of progress -> temp-block the cells in front and re-path */
  if(time-NV.lt>.5){const mv=Math.hypot(P.x-NV.lx,P.y-NV.ly);if(mv<10&&!(next&&Math.hypot(gx-P.x,gy-P.y)<30)){NV.stuck++;NV.tmp.push({x:P.x+(NV.dx||0)*46,y:P.y+(NV.dy||0)*46,r:34,t:time+3});NV.path=null;QH.repaths++}else NV.stuck=0;NV.lx=P.x;NV.ly=P.y;NV.lt=time}
  NV.tmp=NV.tmp.filter(t=>t.t>time);
  /* monsters near the route count as temporary obstacles */
  if(time>=NV.pathT||!NV.path||NV.goalX!==Math.round(gx/16)||NV.goalY!==Math.round(gy/16)){NV.pathT=time+.6;NV.goalX=Math.round(gx/16);NV.goalY=Math.round(gy/16);
    const dyn=[];for(const e of enemies){if(e.dead||!(e.hp>0))continue;const dd=Math.hypot(e.x-P.x,e.y-P.y);if(dd<700&&dd>90&&!(c.tg.kind==='mob'&&Math.hypot(e.x-gx,e.y-gy)<40))dyn.push({x:e.x,y:e.y,r:Math.max(34,(e.sz||16)*1.2+14),t:time+.7})}
    const keep=NV.tmp;NV.tmp=keep.concat(dyn);try{NV.path=astar(P.x,P.y,gx,gy)}catch(e){QH.err='astar '+e.message;NV.path=null}NV.tmp=keep;if(!NV.path)NV.path=[[gx,gy]]}
  let wp=NV.path[0];while(NV.path.length>1&&Math.hypot(wp[0]-P.x,wp[1]-P.y)<22){NV.path.shift();wp=NV.path[0]}
  let dx=wp[0]-P.x,dy=wp[1]-P.y;const L=Math.hypot(dx,dy)||1;dx/=L;dy/=L;NV.dx=dx;NV.dy=dy;return [dx,dy]}
/* hook the autoplay brain: while a quest walk is active it drives the hero and nothing else */
try{const _a=autoPlay;autoPlay=function(dt){if(QH.cur){try{if(G.state==='play'&&!P.dead){const v=step(dt);if(v)return v}else stopNav('x')}catch(e){QH.err='step '+e.message;stopNav('x')}}return _a.apply(this,arguments)}}catch(e){QH.err='hook '+e.message}
/* cancel: manual movement (autoplay not asked for a vector any more), attack, skill, death, zone fade not caused by a gate */
try{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{if(QH.cur){if(P.dead){stopNav('x')}else if(time-NV.lastCall>.35){if(window.NAVWARP264&&NAVWARP264.hold()){NV.lastCall=time;G.auto=true}else stopNav('manual')}else if(!G.auto){if(window.NAVWARP264&&NAVWARP264.hold()){G.auto=true}else stopNav('manual')}}}catch(e){QH.err='upd '+e.message}return r}}catch(e){QH.err='hook upd '+e.message}
for(const fn of ['basicAttack','castSkill','castSkillNow']){try{const o=window[fn];if(typeof o==='function')window[fn]=function(){if(QH.cur)stopNav('attack');return o.apply(this,arguments)}}catch(_){}}
})();







