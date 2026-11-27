
/* ---- r184 food184 (TEST ONLY, coordinator Task 19 parts B + C + UI fixes, 22 Nov 2026). Base = TEST r183b. Numbers = BALANCE_housing_fishing_v1.md r1.7 breeding table, r1.7f inheritance, r1.7g species limit, r1.7h neglect (later letter wins); approved by DeaRz 22 Nov 13:46.
   B) ?fishbreed=off : TANK BREEDING. At most 2 fish of one species may be PUT in the tank (shiny = same species; a baby does not count; tank cap 12 counts babies). Pair = the 2 non-baby fish of one species. Progress counts only for fully witnessed game-time periods in which BOTH parents got full (3 pellets) and neither is hungry: fed periods per baby common 3 / uncommon 6 / rare 15 / very rare 45, litter 1, one baby per pair at a time (the pair breeds again only after the grown baby is moved out of the tank). Baby = small (60% -> 100% with growth), grows only in periods it is full: common 3 / uncommon 6 / rare 9 / very rare 15; a baby gives no reward, cannot be taken out, sold, cooked or moved until adult (growth completes -> baby flag removed, "bred" mark stays). Shiny baby 1% (3% one shiny parent, 10% both). Statuses: each parent stat passes on separately (40% if one parent has it, 70% if both), more than 3 -> keep 3 at random, remaining slots roll normally for the baby's tier; level follows the baby's tier; statuses show once it is an adult. Bred fish carry rec.bred / item.br (kept for the future collection page; a bred fish item does not stack with a caught one).
   C) ?fishhunger=off : NEGLECT. Only fully witnessed game-time periods count (a period that began while the game was closed, or a gap, is skipped). A period is "fed" if the fish ate at least 1 pellet. After 3 unfed periods in a row (baby 2) a fish is hungry (dull colour, thin, slow, small bubble, no reward, no breeding / growth progress); 1 pellet clears it at once. Each further unfed period while hungry: death chance common 10 % / uncommon 8 % / rare 5 % / very rare 3 %, shiny half; a dead fish leaves nothing; the next time the tank opens a message names the fish lost (state.tank.lost).
   UI: bag grid gold check mark for items with statuses, tank panel shows baby / hungry / pair progress, buff bar shows the dish's own buff then the ingredient statuses (short text + tap panel on narrow screens). Debug: window.__F184 ---- */
(function(){'use strict';
const Q=String(location.search);
const B4=window.__F184={ver:'food-r184',breed:!/[?&]fishbreed=off\b/.test(Q),hunger:!/[?&]fishhunger=off\b/.test(Q),err:null,panelOn:false,stats:{births:0,grown:0,deaths:0,hungry:0,periods:0,skipped:0},log:[]};
const ERR=(w,e)=>{B4.err=w+': '+((e&&e.message)||e);try{console.error('[F184]',w,e)}catch(_){}};
const F=window.__F183,FS=window.__FISHING,FT=window.__FISHTANK,H=window.HOUSE;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
B4.cfg={maxPerSpecies:2,need:{common:3,uncommon:6,rare:15,veryrare:45},grow:{common:3,uncommon:6,rare:9,veryrare:15},
 shinyP:{none:.01,one:.03,both:.10},inh:{one:.40,both:.70},babyScale:.6,
 hungerAfter:{adult:3,baby:2},death:{common:.10,uncommon:.08,rare:.05,veryrare:.03},shinyDeathMul:.5};
if(!F||!F.ok||!FS||!FS.cfg||!FT||!FT.ready||!H){B4.err='food183 / fishing / tank missing';B4.ready=true;return}
B4.ok=true;
const isShiny=id=>/_s$/.test(String(id||'')),baseOf=id=>String(id||'').replace(/_s$/,''),shinyOf=id=>baseOf(id)+'_s';
const tierOf=sp=>{const f=FS.cfg.fish[sp];return f?f.r:'common'};
const ORDER=F.cfg.order;const canon=st=>(st||[]).slice().sort((a,b)=>ORDER.indexOf(a[0])-ORDER.indexOf(b[0]));
/* ---------------- tank state ---------------- */
const S0=()=>H.state();
function tankS(){const S=S0();if(!S.tank||typeof S.tank!=='object')return null;if(!S.tank.br||typeof S.tank.br!=='object')S.tank.br={};if(!Array.isArray(S.tank.lost))S.tank.lost=[];return S.tank}
let saveT=0;const persist=()=>{if(saveT)return;saveT=setTimeout(()=>{saveT=0;try{H.save()}catch(e){ERR('save',e)}},300)};
const brOf=b=>{const t=tankS();if(!t)return {n:0,baby:null};return t.br[b]||(t.br[b]={n:0,baby:null})};
const isBaby=rec=>B4.breed&&!!rec.baby;
const adultsOf=(L,b)=>{const lk=(tankS()||{br:{}}).br[b];return L.filter(r=>!isBaby(r)&&baseOf(r.sp)===b&&!(lk&&lk.baby===r.u))};
/* ---------------- period bookkeeping (only fully witnessed periods count) ---------------- */
function nextKey(k){const m=/^(-?\d+)([mdn])$/.exec(String(k));if(!m)return null;const d=+m[1],id=m[2];return id==='m'?d+'d':id==='d'?d+'n':(d+1)+'m'}
let pk=null,partial=true;
const rndf=Math.random;
function fedN(rec,K){return rec.e&&rec.e.k===K?rec.e.n:0}
/* inheritance (r1.7f): each parent stat passes separately, more than 3 -> keep 3 at random, remaining slots roll normally for the baby's tier */
B4.inherit=function(pa,pb,tier,rnd){rnd=rnd||rndf;const sa=((pa&&pa.st)||[]).map(x=>x[0]),sb=((pb&&pb.st)||[]).map(x=>x[0]);const all=Array.from(new Set(sa.concat(sb))),got=[];
 for(const s of all){const both=sa.includes(s)&&sb.includes(s);if(rnd()<(both?B4.cfg.inh.both:B4.cfg.inh.one))got.push(s)}
 while(got.length>3)got.splice(Math.floor(rnd()*got.length),1);
 const lv=F.cfg.lvOf[tier]||1,ch=F.cfg.chance[tier]||[],st=got.map(s=>[s,lv]);
 while(st.length<3){if(!(rnd()<(ch[st.length]||0)))break;const pool=ORDER.filter(s=>!st.some(x=>x[0]===s));if(!pool.length)break;st.push([pool[Math.floor(rnd()*pool.length)],lv])}
 return canon(st)};
B4.shinyChance=(pa,pb)=>{const n=(isShiny(pa.sp)?1:0)+(isShiny(pb.sp)?1:0);return n===2?B4.cfg.shinyP.both:n===1?B4.cfg.shinyP.one:B4.cfg.shinyP.none};
function birth(pa,pb,b,st){const tier=tierOf(pa.sp),sp=(Math.random()<B4.shinyChance(pa,pb))?shinyOf(b):b;const r=FT.addFish(sp,{src:'bred'});if(!r||!r.ok)return null;const rec=r.rec;rec.baby=1;rec.gr=0;rec.bred=1;rec.un=0;rec.hg=0;const inh=B4.inherit(pa,pb,tier);if(inh.length)rec.st=inh;st.baby=rec.u;st.n=0;B4.stats.births++;B4.log.push('birth '+sp+' '+(inh.length?inh.map(a=>a.join(':')).join('+'):'-'));try{FT.say('ปลา'+((FS.cfg.fish[sp]||{}).n||sp)+'ฟักเป็นลูกปลาในตู้แล้ว 🐣')}catch(_){}return rec}
function deathP(rec){const t=tierOf(rec.sp);return (B4.cfg.death[t]||.1)*(isShiny(rec.sp)?B4.cfg.shinyDeathMul:1)}
/* one finished period K (a fully witnessed one): growth, breeding, hunger */
B4.endPeriod=function(K,rnd){rnd=rnd||rndf;try{const L=FT.fishList(),t=tankS();if(!t)return;B4.stats.periods++;const full=r=>fedN(r,K)>=FT.cfg.perPeriod&&!(B4.hunger&&r.hg);
 if(B4.breed){/* baby growth: only in periods it is full */
  for(const rec of L){if(!rec.baby)continue;if(full(rec)){rec.gr=(rec.gr|0)+1;if(rec.gr>=(B4.cfg.grow[tierOf(rec.sp)]||3)){rec.baby=0;B4.stats.grown++;B4.log.push('grown '+rec.sp);try{FT.say('ลูกปลา'+((FS.cfg.fish[rec.sp]||{}).n||rec.sp)+'โตเต็มวัยแล้ว')}catch(_){}}}}
  /* pairs */
  const by={};for(const r of L){if(isBaby(r))continue;const b=baseOf(r.sp);(by[b]||(by[b]=[])).push(r)}
  for(const b in by){const st=brOf(b);if(st.baby&&!L.some(r=>r.u===st.baby))st.baby=null;const a=adultsOf(L,b);if(a.length!==2){st.n=0;continue}if(st.baby)continue;
   if(full(a[0])&&full(a[1]))st.n++;const need=B4.cfg.need[tierOf(a[0].sp)]||3;if(st.n>=need){if(L.length<FT.cfg.cap)birth(a[0],a[1],b,st);else st.n=need}}}
 if(B4.hunger){const lost=[];for(const rec of L.slice()){const fed=fedN(rec,K)>=1;if(fed){rec.un=0;if(rec.hg)rec.hg=0;continue}
   rec.un=(rec.un|0)+1;const lim=(B4.breed&&rec.baby)?B4.cfg.hungerAfter.baby:B4.cfg.hungerAfter.adult;
   if(!rec.hg){if(rec.un>=lim){rec.hg=1;B4.stats.hungry++}}else if(rnd()<deathP(rec)){lost.push(rec)}}
  for(const rec of lost){const f=FS.cfg.fish[rec.sp]||{};FT.removeFish(rec.u);t.lost.push({n:f.n||rec.sp,sp:rec.sp,t:Date.now()});B4.stats.deaths++;B4.log.push('died '+rec.sp)}}
 persist()}catch(e){ERR('endPeriod',e)}};
function tick(){try{const k=FT.period().key;if(pk===null){pk=k;partial=true;return}if(k===pk)return;const ended=pk,contig=nextKey(ended)===k;if(!partial&&contig)B4.endPeriod(ended);else B4.stats.skipped++;partial=!contig;pk=k}catch(e){ERR('tick',e)}}
B4.state=()=>({pk,partial});
/* feeding clears hunger at once; lost-fish message when the tank opens */
const lastN=new WeakMap();
function poll(){try{if(!FT.open)return;const k=FT.period().key;if(B4.hunger)for(const f of FT.rt){const rec=f.rec,n=fedN(rec,k),pv=lastN.get(rec);lastN.set(rec,n);if(pv!==undefined&&n>pv&&rec.hg){rec.hg=0;rec.un=0;persist()}}
 const t=tankS();if(t&&t.lost.length&&!B4._msgT){const l=t.lost.splice(0,t.lost.length);persist();let i=0;const next=()=>{if(i>=l.length){B4._msgT=0;return}FT.say('ปลา '+l[i].n+' หายไปจากตู้เพราะหิว',true);i++;B4._msgT=setTimeout(next,3300)};next()}}catch(e){ERR('poll',e)}}
/* ---------------- look: baby size, hungry look, hungry bubble, slow swimming ---------------- */
function wrapSprites(){try{for(const id of FT.speciesIds){const s=FT.sprites[id];if(!s||s._w184||typeof s.draw!=='function')continue;const d=s.draw;s.draw=function(g,t,sp,f){const rec=f&&f.rec;if(!rec||f._in184)return d.apply(this,arguments);f._in184=1;try{const baby=isBaby(rec),hg=B4.hunger&&rec.hg;
   if(hg){if(f._lx!=null){f.x=f._lx+(f.x-f._lx)*.45}f._lx=f.x}else f._lx=null;
   g.save();if(baby){const sc=B4.cfg.babyScale+(1-B4.cfg.babyScale)*Math.min(1,(rec.gr||0)/(B4.cfg.grow[tierOf(rec.sp)]||3));g.scale(sc,sc)}
   if(hg){try{g.filter='saturate(.3) brightness(.78)'}catch(_){}g.scale(1,.84)}
   try{d.apply(this,arguments)}finally{try{g.filter='none'}catch(_){}g.restore()}
   if(hg){g.save();const y=-(sp.h||30)*1.15-14;g.fillStyle='rgba(255,255,255,.95)';g.strokeStyle='#3d2c20';g.lineWidth=2;g.beginPath();g.arc(0,y,12,0,6.2832);g.fill();g.stroke();g.beginPath();g.moveTo(-4,y+10);g.lineTo(0,y+18);g.lineTo(4,y+10);g.closePath();g.fill();g.stroke();g.fillStyle='#d03a2a';g.font='900 15px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('!',0,y+1);g.restore()}
  }finally{f._in184=0}};s._w184=1}}catch(e){ERR('wrapSprites',e)}}
/* the rewards (fishextra poll) skip hungry fish and babies */
B4.noReward=rec=>!!((B4.hunger&&rec.hg)||(B4.breed&&rec.baby));
/* ---------------- put / take (species limit, babies stay, statuses + bred mark travel with the fish) ---------------- */
const fishItemMap=()=>{const m={};for(const sp in FS.cfg.fish)m[FS.cfg.fish[sp].item]=sp;return m};
B4.put=function(it){try{const m=fishItemMap(),sp=m[it.id],f=FS.cfg.fish[sp];if(!f)return {ok:false,why:'none'};if(!P.inv.includes(it)||it.q<1){try{FS.say('ไม่มี'+f.n+'ในกระเป๋า',true)}catch(_){}return {ok:false,why:'bag'}}
 const L=FT.fishList();if(L.length>=FT.cfg.cap){try{FT.say(FT.msgs.full,true)}catch(_){}return {ok:false,why:'full'}}
 if(B4.breed&&adultsOf(L,baseOf(sp)).length>=B4.cfg.maxPerSpecies){try{FT.say('ตู้ปลาใส่ปลาชนิดเดียวกันได้สูงสุด '+B4.cfg.maxPerSpecies+' ตัว (ปลาไชนี่นับเป็นชนิดเดียวกัน)',true)}catch(_){}return {ok:false,why:'species'}}
 const st=it.st?JSON.parse(JSON.stringify(it.st)):null,br=!!it.br;it.q-=1;if(it.q<=0){const i=P.inv.indexOf(it);if(i>=0)P.inv.splice(i,1)}
 const r=FT.addFish(sp,{src:'bag'});if(!r.ok){const back={id:f.item,q:1};if(st)back.st=st;if(br)back.br=1;try{addItem(back)}catch(_){}return r}
 if(st)r.rec.st=st;if(br)r.rec.bred=1;try{FT.say('ใส่'+f.n+'ลงตู้แล้ว')}catch(_){}try{if(G.win==='wInv')renderInv()}catch(_){}persist();B4.panel&&panelRefresh();return {ok:true,rec:r.rec}}catch(e){ERR('put',e);return {ok:false,why:'err'}}};
B4.take=function(u){try{const rec=FT.fishList().find(x=>x.u===u);if(!rec)return {ok:false,why:'none'};const f=FS.cfg.fish[rec.sp];if(!f)return {ok:false,why:'unknown'};
 if(isBaby(rec)){try{FT.say('ลูกปลายังโตไม่เต็มวัย · เอาออก / ขาย / ทำอาหารไม่ได้',true)}catch(_){}return {ok:false,why:'baby'}}
 const it={id:f.item,q:1};if(rec.st&&rec.st.length)it.st=rec.st;if(rec.bred)it.br=1;let ok=false;try{ok=addItem(it)!==false}catch(_){}if(!ok){try{FS.say('กระเป๋าเต็ม · เอาปลาออกไม่ได้',true)}catch(_){}return {ok:false,why:'bagFull'}}
 FT.removeFish(u);const t=tankS();if(t)for(const b in t.br)if(t.br[b].baby===u)t.br[b].baby=null;try{FT.say('เอา'+f.n+'กลับใส่กระเป๋าแล้ว')}catch(_){}persist();B4.panel&&panelRefresh();return {ok:true}}catch(e){ERR('take',e);return {ok:false,why:'err'}}};
function hookApi(){try{if(!FS._f183)return false;F.tankPutSt=B4.put;const _p=FS.tankPut;FS.tankPut=function(id){const f=FS.cfg.fish[id];if(!f)return _p.apply(this,arguments);const ch=P.inv.filter(i=>i&&i.id===f.item).sort((a,b)=>((a.st?1:0)+(a.br?1:0))-((b.st?1:0)+(b.br?1:0)));if(!ch.length){try{FS.say('ไม่มี'+f.n+'ในกระเป๋า',true)}catch(_){}return {ok:false,why:'bag'}}return B4.put(ch[0])};FS.tankTake=B4.take;FS._f184=1;return true}catch(e){ERR('hookApi',e);return true}}
/* ---------------- tank panel (replaces the r183 one through a delegate) ---------------- */
function statText(rec){return rec.st&&rec.st.length?F.txtSt(rec.st,isShiny(rec.sp)):''}
function panelRefresh(){try{const pn=document.getElementById('ftFish');if(pn&&pn.classList.contains('in'))B4.panel(pn)}catch(_){}}
B4.panel=function(pn){pn._mine=1;const FTr=FT;const icon=sp=>{const c=document.createElement('canvas');c.width=64;c.height=64;try{const it=ITEMS[FS.cfg.fish[sp].item];if(it&&it.icon)it.icon(c.getContext('2d'))}catch(_){}return c};
 pn.innerHTML='';const mk=t=>{const h=document.createElement('h4');h.textContent=t;pn.appendChild(h)};const m=fishItemMap();mk('ปลาในกระเป๋า (กดเพื่อใส่ตู้)');let any=false;
 for(const x of P.inv){if(!x||!m[x.id])continue;const sp=m[x.id],f=FS.cfg.fish[sp];if(!f)continue;any=true;const row=document.createElement('div');row.className='row';row.appendChild(icon(sp));const nm=document.createElement('div');nm.innerHTML='<span style="color:'+FS.cfg.rar[f.r].col+'">'+esc(f.n)+'</span> ×'+x.q+(x.br?' <small style="color:#9fe0ff">🐣เพาะเอง</small>':'')+(x.st?'<br><span style="color:#ffd98a;font-size:11px">✦ '+esc(F.txtSt(x.st,isShiny(sp)))+'</span>':'');row.appendChild(nm);const b=document.createElement('button');b.type='button';b.textContent='ใส่ตู้';b.addEventListener('click',()=>{B4.put(x)});row.appendChild(b);pn.appendChild(row)}
 if(!any){const d=document.createElement('div');d.className='x';d.textContent='ไม่มีปลาในกระเป๋า · ตกปลาที่บ่อในลานก่อน';pn.appendChild(d)}
 mk('ปลาในตู้ (กดเพื่อเอากลับกระเป๋า)');const L=FTr.fishList();if(!L.length){const d=document.createElement('div');d.className='x';d.textContent='ตู้ยังว่างอยู่';pn.appendChild(d)}
 for(const rec of L){const f=FS.cfg.fish[rec.sp];if(!f)continue;const row=document.createElement('div');row.className='row';row.appendChild(icon(rec.sp));const baby=isBaby(rec),need=B4.cfg.grow[tierOf(rec.sp)]||3;const nm=document.createElement('div');
  nm.innerHTML='<span style="color:'+FS.cfg.rar[f.r].col+'">'+esc(f.n)+'</span>'+(baby?' <small style="color:#9fe0ff">🐣 ลูกปลา โต '+(rec.gr|0)+'/'+need+'</small>':rec.bred?' <small style="color:#9fe0ff">🐣เพาะเอง</small>':'')+(B4.hunger&&rec.hg?' <small style="color:#ff9a8a">หิว!</small>':'')+(!baby&&statText(rec)?'<br><span style="color:#ffd98a;font-size:11px">✦ '+esc(statText(rec))+'</span>':'');row.appendChild(nm);
  const b=document.createElement('button');b.type='button';b.textContent=baby?'โตก่อน':'เอาออก';if(baby)b.disabled=true;b.addEventListener('click',()=>FS.tankTake(rec.u));row.appendChild(b);pn.appendChild(row)}
 if(B4.breed){const by={};for(const r of L)if(!isBaby(r))(by[baseOf(r.sp)]||(by[baseOf(r.sp)]=[])).push(r);const lines=[];for(const b in by){const a=adultsOf(L,b);if(a.length!==2)continue;const st=brOf(b),need=B4.cfg.need[tierOf(a[0].sp)]||3,f=FS.cfg.fish[b]||{};lines.push('<div style="color:#cfe8ff;font-size:12px;padding:6px 2px">💞 คู่ '+esc(f.n||b)+': '+(st.baby?'มีลูกปลาอยู่ในตู้ (รอโต / เอาออก)':'ได้ '+Math.min(st.n,need)+'/'+need+' คาบที่กินอิ่มทั้งคู่')+'</div>')}
  if(lines.length){mk('คู่ปลา');const d=document.createElement('div');d.innerHTML=lines.join('');pn.appendChild(d)}}};
/* ---------------- bag grid: gold mark for items with statuses ---------------- */
const css=document.createElement('style');css.textContent='.invg .cell{position:relative}.invg .cell .f184st{position:absolute;left:3px;top:1px;color:#ffd24a;font:900 13px/1 sans-serif;text-shadow:0 0 3px #000,0 0 2px #000;pointer-events:none}#cookBuff{pointer-events:auto!important;cursor:pointer;white-space:normal;max-width:min(94vw,680px)}#cookBuffPanel{position:fixed;left:50%;transform:translateX(-50%);top:96px;z-index:9000;display:none;max-width:min(94vw,420px);padding:8px 12px;border-radius:10px;background:rgba(20,15,8,.96);border:1px solid #c9a86a;color:#ffe9b0;font:13px/1.5 system-ui,"Noto Sans Thai",sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.6)}';document.head.appendChild(css);
function decorateBag(){try{for(const c of document.querySelectorAll('.invg .cell[data-inv]')){const it=P.inv[+c.dataset.inv];const has=!!(it&&((it.st&&it.st.length)||String(it.id||'').indexOf('ds:')===0));const cur=c.querySelector('.f184st');if(has&&!cur){const s=document.createElement('span');s.className='f184st';s.textContent='✦';c.appendChild(s)}else if(!has&&cur)cur.remove()}}catch(_){}}
try{const _ri=renderInv;renderInv=function(){const r=_ri.apply(this,arguments);decorateBag();return r}}catch(e){ERR('hook renderInv',e)}
/* ---------------- buff bar: own buff first, then the ingredient statuses ---------------- */
const panel=document.createElement('div');panel.id='cookBuffPanel';document.body.appendChild(panel);
function ownText(food){const it=ITEMS[food]||{},base=it.base||food;const r=(F.R||[]).find(x=>x.id===base);let d=r?r.d:((ITEMS[base]||{}).d||'');return String(d).replace(/\s*นาน\s*\d+\s*นาที.*$/,'').replace(/\s*\(ใช้ร่วมกับอาหารได้\)/,'')}
B4.chip=function(chip,b,it){try{const own=ownText(b.food),st=it&&it.stTxt;const base=chip.textContent.replace(/ · ✦ .*$/,'').replace(/ ▾$/,'');const full=base+(own?' · '+own:'')+(st?' · ✦ '+st:'');
 if(innerWidth<900&&(own||st)){chip.textContent=base+' ▾';panel.innerHTML='<b>'+esc(it&&it.n||'')+'</b><br>'+(own?esc(own)+'<br>':'')+(st?'<span style="color:#ffd98a">✦ สถานะวัตถุดิบ: '+esc(st)+'</span>':'')}else{chip.textContent=full;panel.style.display='none'}}catch(_){}};
document.getElementById('cookBuff')&&0;{const iv=setInterval(()=>{const c=document.getElementById('cookBuff');if(c&&!c._f184){c._f184=1;c.addEventListener('click',e=>{e.stopPropagation();if(innerWidth<900)panel.style.display=panel.style.display==='block'?'none':'block'});for(const ev of ['pointerdown','mousedown','touchstart'])c.addEventListener(ev,e=>e.stopPropagation());clearInterval(iv)}},800)}
/* ---------------- loop ---------------- */
B4.panelOn=true;
{let n=0;const iv=setInterval(()=>{const a=hookApi();wrapSprites();if(a||++n>120)clearInterval(iv)},500)}
setInterval(wrapSprites,1500);
{const _up=update;update=function(dt){const r=_up.apply(this,arguments);try{if(G.state==='play'&&(B4.breed||B4.hunger)){tick();poll()}}catch(e){ERR('upd',e)}return r}}
/* GM / tests */
B4.deathP=deathP;B4.add=function(sp,o){const r=FT.addFish(sp,{src:'gm'});if(r.ok&&o)Object.assign(r.rec,o);return r.rec};
B4.simBirths=function(pa,pb,n,rnd){const tier=tierOf(pa.sp),out={n,none:0,withAny:0,perStat:{},both:0,sh:0,keep3:0,bySize:{0:0,1:0,2:0,3:0}};for(let i=0;i<n;i++){const st=B4.inherit(pa,pb,tier,rnd);out.bySize[st.length]++;for(const a of st)out.perStat[a[0]]=(out.perStat[a[0]]|0)+1;if(Math.random()<B4.shinyChance(pa,pb))out.sh++}return out};
B4.ready=true;
})();

