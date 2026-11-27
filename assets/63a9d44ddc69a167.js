
/* p289 r2 (r83: + holy staff Judgment Light ×3 and Spear Rain 5 mobs, order ORDER_20261023_holy-bench-r82) — p289 r1 — in-game perf A/B bench for r80/r81 rune rings + per-hit numbers (?stfbench=1 only; TEST tool, no visual change).
   VFX stage 3 order orders/code/ORDER_20261023_staff-perf-bench-r80.md. Like ?swbench=1: the game never saves in this session, monsters
   are pinned (huge HP, no attacks), HP/MP stay full. Scenes: staff Rainbow Storm ×2 · Ball Lightning 5 mobs ×2 · Earth Spikes + Echo
   forced ×2 · sword Whirl (+storm) ×3 · bow Arrow Rain ×3. Each scene: avg fps, p95 ms, frames >33 / >50 ms, worst ms.
   The 4 variants are page flags (default · runering=off · numsum=on · both off = r79 look), so "วัดครบ 4 แบบ" reloads the page per
   variant in ABBA order (A B C D D C B A) and keeps the results in sessionStorage (not the save) until the table is done.
   window.__stfbench = {runOne, result}. Reload without ?stfbench afterwards. */
(function(){'use strict';const Q=String(location.search);if(!/stfbench=1/.test(Q))return;
const B=window.__STFBENCH={ver:'p289-r2',err:null};
try{saveGame=function(){B.blocked=(B.blocked||0)+1;};}catch(e){B.err='save '+e.message;}
let FT=null,lt=0;try{const R=render;render=function(){const n=performance.now();if(FT)FT.push(n-lt);lt=n;return R.apply(this,arguments);};}catch(e){B.err='render '+e.message;}
let PIN=[];try{const U=update;update=function(dt){const r=U.apply(this,arguments);if(PIN.length&&P&&!P.dead){P.hp=P.maxHp;P.mp=P.maxMp;
  for(const q of PIN){const e=q.e;if(e.dead){e.dead=false;}e.hp=e.maxHp=1e9;e.atkCd=99;e.aggro=false;e.wind=0;e.x=q.x;e.y=q.y;e.vx=e.vy=0;}}return r;};}catch(e){B.err='update '+e.message;}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const VAR=[{k:'A',name:'default (r81)',q:''},{k:'B',name:'runering=off',q:'&runering=off'},{k:'C',name:'numsum=on',q:'&numsum=on'},{k:'D',name:'both off (r79 look)',q:'&runering=off&numsum=on'}];
const cur=()=>VAR.find(v=>v.k==='D'&&/runering=off/.test(Q)&&/numsum=on/.test(Q))||VAR.find(v=>v.k==='B'&&/runering=off/.test(Q)&&!/numsum=on/.test(Q))||VAR.find(v=>v.k==='C'&&/numsum=on/.test(Q)&&!/runering=off/.test(Q))||VAR[0];
function pin(lay){const live=enemies.filter(e=>!(e.m&&e.m.boss)).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y)).slice(0,lay.length);
  PIN=live.map((e,i)=>({e,x:P.x+lay[i][0],y:P.y+lay[i][1]}));for(const q of PIN){q.e.dead=false;q.e.x=q.x;q.e.y=q.y;}return PIN.length;}
const wpn=w=>{try{const t=P.weapon&&P.weapon.t;if(w==='staff'&&t!=='staff')STF.toggle();if(w==='bow'&&t!=='bow')BOW.toggle();if(w==='sword'){if(t==='staff')STF.toggle();else if(t==='bow')BOW.toggle();}}catch(e){B.err='weapon '+e.message;}};
const cds=()=>{for(const id in P.cds)P.cds[id]=0;};
const LAY5=[[150,0],[220,40],[300,-40],[380,20],[200,-90]];
const SCN=[
 {id:'storm',name:'คทา พายุรุ้ง ×2',w:'staff',lay:LAY5,n:2,ms:5200,go:()=>{STF.aimOv={x:P.x+220,y:P.y};return STF.cast('ult');}},
 {id:'ball',name:'คทา ลูกบอลสายฟ้า 5 ตัว ×2',w:'staff',lay:LAY5,n:2,ms:5600,go:()=>{STF.aimOv={x:P.x+300,y:P.y};return STF.cast('chain');}},
 {id:'earth',name:'คทา หนามดิน + เวทสะท้อน ×2',w:'staff',lay:[[250,0],[300,40],[200,-50],[320,-30],[180,50]],n:2,ms:4600,go:()=>{STF.cfg.echo.chance=1;STF.aimOv={x:P.x+250,y:P.y};const r=STF.cast('spikes');return r;},after:()=>{STF.cfg.echo.chance=B.echo0;}},
 {id:'whirl',name:'ดาบ วังวน (+พายุ) ×3',w:'sword',lay:[[55,10],[-45,35],[20,-60],[-30,-40],[70,40]],n:3,ms:3000,go:()=>{const m=window.__SKATK3;if(m)m.cast();}},
 {id:'rain',name:'ธนู ห่าธนู ×3',w:'bow',lay:[[230,0],[260,40],[200,-40],[290,-20],[240,60]],n:3,ms:2800,go:()=>{BSK.aimOv={x:P.x+240,y:P.y};return BSK.cast('rain');}},
 {id:'judg',name:'คทาศักดิ์สิทธิ์ แสงพิพากษา ×3',w:'staff',lay:[[200,0]],n:3,ms:2300,go:()=>{HOLY.aimOv={x:P.x+200,y:P.y};return HOLY.cast('jl');},after:()=>{HOLY.aimOv=null;}},
 {id:'spear',name:'คทาศักดิ์สิทธิ์ ฝนหอก 5 ตัว ×1',w:'staff',lay:[[150,0],[230,40],[260,-40],[100,60],[190,-80]],n:1,ms:6300,go:()=>{HOLY.aimOv={x:P.x+160,y:P.y};return HOLY.cast('sr');},after:()=>{HOLY.aimOv=null;}}];
function stats(name,ft){ft=ft.slice(2).filter(x=>x>0);if(!ft.length)return null;const s=ft.slice().sort((a,b)=>a-b),avg=ft.reduce((a,b)=>a+b,0)/ft.length,q=f=>s[Math.min(s.length-1,Math.floor(s.length*f))];
  return {name,frames:ft.length,fpsAvg:+(1000/avg).toFixed(1),p95ms:+q(.95).toFixed(1),over33:ft.filter(x=>x>33.4).length,over50:ft.filter(x=>x>50).length,worstMs:+s[s.length-1].toFixed(1)};}
async function runOne(){if(!P||P.dead||G.state!=='play')return {err:'not in play'};B.echo0=STF.cfg.echo.chance;const out=[];
  for(const sc of SCN){wpn(sc.w);await wait(400);P.face=0;try{if(window.TLOCK)TLOCK.e=null;}catch(_){}pin(sc.lay);await wait(300);FT=[];
    for(let i=0;i<sc.n;i++){msg(sc.name+' '+(i+1)+'/'+sc.n+'…');cds();try{sc.go();}catch(e){B.err=sc.id+' '+e.message;}await wait(sc.ms);}
    const st=stats(sc.name,FT);FT=null;if(st){st.id=sc.id;out.push(st);}try{sc.after&&sc.after();}catch(_){}await wait(300);}
  PIN=[];try{STF.aimOv=null;BSK.aimOv=null;}catch(_){}wpn('staff');
  return {variant:cur().k,vname:cur().name,res:out,peak:{dmg:window.__DMGNUM&&__DMGNUM.stats.peak,rune:window.STF&&STF.runeN},err:B.err};}
let RESULT=null;
const box=document.createElement('div');box.style.cssText='position:fixed;left:8px;top:64px;z-index:99999;font:13px/1.4 system-ui,sans-serif;color:#fff;background:rgba(20,16,10,.9);border:1px solid #7b5cff;border-radius:8px;padding:8px 10px;max-width:min(620px,94vw)';
box.innerHTML='<button id="sbOne" style="font:inherit;padding:6px 10px">วัดแบบนี้ ('+cur().k+' '+cur().name+')</button> <button id="sbAll" style="font:inherit;padding:6px 10px">วัดครบ 4 แบบ ABBA</button> <button id="sbCopy" style="font:inherit;padding:6px 10px">คัดลอกผล</button><div id="sbMsg" style="margin-top:6px">ยืนในแมพที่มีมอน 5 ตัวขึ้นไป แล้วกดวัด (ไม่บันทึกเกม)</div><textarea id="sbOut" style="display:none;width:100%;height:90px;margin-top:6px;font:11px monospace"></textarea>';
const mount=()=>{if(document.body&&!box.isConnected)document.body.appendChild(box);};setTimeout(mount,1500);setInterval(mount,3000);
function msg(t){const m=box.querySelector('#sbMsg');if(m)m.textContent=t;}
const KEY='lf_TEST_stfbench_r1',SEQ=['A','B','C','D','D','C','B','A'];
const ss={get(){try{return JSON.parse(sessionStorage.getItem(KEY)||'null');}catch(_){return null;}},set(v){try{sessionStorage.setItem(KEY,JSON.stringify(v));}catch(_){}},del(){try{sessionStorage.removeItem(KEY);}catch(_){}}};
function urlFor(k){const base=location.href.split('?')[0],v=VAR.find(x=>x.k===k);return base+'?stfbench=1'+v.q+(location.hash||'');}
function table(runs){const by={};for(const r of runs)for(const s of r.res){const key=s.id+'|'+r.variant;(by[key]=by[key]||[]).push(s);}
  const rows=[];for(const sc of SCN)for(const v of VAR){const a=by[sc.id+'|'+v.k];if(!a)continue;const m=f=>+(a.reduce((x,s)=>x+s[f],0)/a.length).toFixed(1);rows.push({scene:sc.id,variant:v.k,vname:v.name,fpsAvg:m('fpsAvg'),p95ms:m('p95ms'),over33:m('over33'),over50:m('over50'),worstMs:Math.max(...a.map(s=>s.worstMs)),n:a.length});}
  return rows;}
function show(){const t=box.querySelector('#sbOut');t.style.display='block';t.value=JSON.stringify(RESULT);}
async function step(){const st=ss.get();if(!st||!st.queue||!st.queue.length)return;if(cur().k!==st.queue[0]){location.href=urlFor(st.queue[0]);return;}
  await wait(2500);msg('ABBA '+(SEQ.length-st.queue.length+1)+'/'+SEQ.length+' แบบ '+cur().k+'…');const r=await runOne();st.runs.push(r);st.queue.shift();ss.set(st);
  if(st.queue.length){location.href=urlFor(st.queue[0]);return;}
  RESULT={page:'staff-bench-ingame',build:'r83',order:'ABBA',ua:navigator.userAgent,dpr:window.devicePixelRatio||1,view:innerWidth+'x'+innerHeight,rows:table(st.runs),runs:st.runs,when:new Date().toISOString()};ss.del();show();
  msg('เสร็จ ครบ 4 แบบ · กดคัดลอกผล · โหลดหน้าใหม่ (ไม่มี ?stfbench) ก่อนเล่นต่อ');}
box.addEventListener('click',async e=>{if(e.target.id==='sbOne'){const r=await runOne();RESULT={page:'staff-bench-ingame',build:'r83',ua:navigator.userAgent,dpr:window.devicePixelRatio||1,view:innerWidth+'x'+innerHeight,runs:[r],rows:table([r])};show();msg(r.res.map(s=>s.id+' '+s.fpsAvg+' fps').join(' · '));}
  if(e.target.id==='sbAll'){ss.set({queue:SEQ.slice(),runs:[]});step();}
  if(e.target.id==='sbCopy'){const t=box.querySelector('#sbOut');if(!t.value){msg('ยังไม่มีผล');return;}try{navigator.clipboard.writeText(t.value).then(()=>msg('คัดลอกแล้ว'),()=>t.select());}catch(_){t.select();}}});
window.__stfbench={runOne,table,get result(){return RESULT;},scenes:SCN.map(s=>s.id),variant:()=>cur()};
setTimeout(()=>{if(ss.get())step();},4000);
B.ok=!B.err;})();

