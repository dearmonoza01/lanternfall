
/* ---- candidate_balance_v1_r72: p282 r1 in-game sword skill bench (?swbench=1 only; TEST tool) ---- */
/* VFX stage 3 order 23 Oct (ORDER_20261023_sword-rework-motion-fix §3): compare the new sword skills (r72) with the old ones (add
   &swrework=off) inside the real game. Only with ?swbench=1: the game never saves in this session (saveGame is a no-op), a
   "วัดสกิลดาบ" button appears; it pins 8 nearby monsters around the hero (no attacks, huge HP), keeps HP/MP full, then runs:
   idle 4 s · Fang ×6 · Whirl ×6 · Judgment ×4 · Sanctuary ×1 and shows fps / 1 % low / worst frame / frames >33 and >50 ms
   with a copy button. window.__bench = {run, result}. Reload the page afterwards (nothing was saved). */
(function(){'use strict';if(!/swbench=1/.test(location.search))return;
const B=window.__SWBENCH={ver:'p282-r1',err:null,saving:false};
try{const o=saveGame;saveGame=function(){B.blocked=(B.blocked||0)+1;};}catch(e){B.err='save '+e.message;}
let FT=null,lt=0;try{const R=render;render=function(){const n=performance.now();if(FT)FT.push(n-lt);lt=n;return R.apply(this,arguments);};}catch(e){B.err='render '+e.message;}
let PIN=[];try{const U=update;update=function(dt){const r=U.apply(this,arguments);if(PIN.length&&P&&!P.dead){P.hp=P.maxHp;P.mp=P.maxMp;
  for(const q of PIN){const e=q.e;if(e.dead)continue;e.hp=e.maxHp=1e9;e.atkCd=99;e.aggro=false;e.wind=0;if(!q.free){e.x=q.x;e.y=q.y;e.vx=e.vy=0;}}}return r;};}catch(e){B.err='update '+e.message;}
const LAY=[[60,10],[-50,30],[20,-55],[150,-40],[230,40],[200,-120],[290,0],[-140,60]];
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function pin(){const live=enemies.filter(e=>!e.dead&&!(e.m&&e.m.boss)).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y)).slice(0,8);
  PIN=live.map((e,i)=>({e,x:P.x+LAY[i][0],y:P.y+LAY[i][1]}));for(const q of PIN){q.e.x=q.x;q.e.y=q.y;}return PIN.length;}
const MOD={sk2:'__SK2L',atk3:'__SKATK3',atk4:'__SKATK4',atk5:'__SKATK5'},LEN={sk2:3300,atk3:2600,atk4:3800,atk5:6600},NAME={sk2:'เขี้ยวผ่าศิลา',atk3:'วังวนเจ็ดคม',atk4:'ดาบพิพากษา',atk5:'เขตแดนดาบพิทักษ์'};
const NEW=!!(window.__SWRW&&__SWRW.on&&__SWRW.ok);
async function cast(k){for(const id in P.cds)if(/^ws/.test(id))P.cds[id]=0;P.face=0;try{if(window.TLOCK)TLOCK.e=null;}catch(_){}pin();for(const q of PIN)q.free=false;
  const m=window[MOD[k]];if(!m)return;
  if(k==='atk4'&&!NEW){m.press('bench');await wait(1400);m.release();}else if(k==='atk4')m.press('bench');else m.cast();}
function stats(name,ft){ft=ft.slice(2).filter(x=>x>0);if(!ft.length)return null;const s=ft.slice().sort((a,b)=>a-b),avg=ft.reduce((a,b)=>a+b,0)/ft.length,p99=s[Math.min(s.length-1,Math.floor(s.length*.99))];
  return {name,frames:ft.length,fpsAvg:+(1000/avg).toFixed(1),fpsLow1:+(1000/p99).toFixed(1),worstMs:+s[s.length-1].toFixed(1),over33:ft.filter(x=>x>33.4).length,over50:ft.filter(x=>x>50).length,pct33:+(100*ft.filter(x=>x>33.4).length/ft.length).toFixed(1)};}
let RESULT=null;
const box=document.createElement('div');box.style.cssText='position:fixed;left:8px;top:64px;z-index:99999;font:13px/1.4 system-ui,sans-serif;color:#fff;background:rgba(20,16,10,.88);border:1px solid #b8862e;border-radius:8px;padding:8px 10px;max-width:min(560px,92vw)';
box.innerHTML='<button id="swbGo" style="font:inherit;padding:6px 10px">วัดสกิลดาบ ('+(NEW?'ใหม่ r72':'เดิม r70')+')</button> <button id="swbCopy" style="font:inherit;padding:6px 10px">คัดลอกผล</button><div id="swbMsg" style="margin-top:6px">ถือดาบ แล้วยืนในแมพที่มีมอน กดวัด แล้ววางเครื่องเฉย ๆ ~1 นาที</div><textarea id="swbOut" readonly style="display:none;width:100%;height:70px;margin-top:6px;font:11px monospace"></textarea>';
const mount=()=>{if(document.body&&!box.isConnected)document.body.appendChild(box);};setTimeout(mount,1500);setInterval(mount,3000);
const msg=t=>{box.querySelector('#swbMsg').textContent=t;};
async function run(){if(!P||P.dead||G.state!=='play'){msg('เข้าเกมก่อน');return;}if(!(P.weapon&&P.weapon.t==='sword')){msg('ต้องถือดาบ');return;}
  if(pin()<3){msg('มอนใกล้ ๆ ไม่พอ ไปยืนในแมพที่มีมอนก่อน');return;}
  const out=[];msg('วัดฉากปกติ 4 วินาที…');await wait(600);FT=[];await wait(4000);out.push(stats('ฉากปกติ ไม่มีสกิล',FT));
  for(const [k,n] of [['sk2',6],['atk3',6],['atk4',4],['atk5',1]]){FT=[];for(let i=0;i<n;i++){msg(NAME[k]+' '+(i+1)+' / '+n+'…');await cast(k);await wait(LEN[k]);}out.push(stats(NAME[k]+' ×'+n,FT));FT=null;await wait(300);}
  PIN=[];RESULT={page:'sword-bench-ingame',skills:NEW?'new r72':'old r70 (swrework=off)',ua:navigator.userAgent,dpr:window.devicePixelRatio||1,view:innerWidth+'x'+innerHeight,res:out,when:new Date().toISOString()};
  const t=box.querySelector('#swbOut');t.style.display='block';t.value=JSON.stringify(RESULT);
  msg(out.map(s=>s?s.name+': '+s.fpsAvg+' fps, ต่ำสุด '+s.fpsLow1+', >33ms '+s.pct33+'%':'').join(' · ')+' · โหลดหน้าใหม่ก่อนเล่นต่อ (ไม่ได้บันทึกเกม)');}
box.addEventListener('click',e=>{if(e.target.id==='swbGo')run();if(e.target.id==='swbCopy'){const t=box.querySelector('#swbOut');if(!t.value){msg('ยังไม่มีผล');return;}try{navigator.clipboard.writeText(t.value).then(()=>msg('คัดลอกแล้ว'),()=>t.select());}catch(_){t.select();}}});
window.__bench={run,get result(){return RESULT;}};
B.ok=!B.err;
})();

