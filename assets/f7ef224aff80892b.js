
/* ---- p296 r1: in-game smoothness bench (order ORDER_20261024_map3-perf-bench, VFX stage 3). Settings ⚙ → "📊 วัดความลื่นแมพ 3".
   Runs Map 1 (baseline, 1 lap) then Map 3 (2 laps) on the same route as the stage-3 server bench (centre → houses → train → north gate → centre),
   the hero glides along it (no collision, invulnerable), frame times from requestAnimationFrame on the real device.
   Shows fps / p95 / frames >50 ms / >100 ms / worst / JS heap (if the browser gives it) / load time + a Copy button.
   Never saves: saveGame is a no-op while the bench runs; afterwards the hero goes back where they were. Only from Maps 1–3. Debug: window.__BENCH. ---- */
(function(){'use strict';
const B=window.__BENCH={ver:'p296-r1',on:false,err:null,last:null};
const M1='sylva_lab',M3='astoria_capital';
const R3=[[2680,1800],[1200,2600],[3900,2600],[2680,330],[2680,1800]];
function route(z){if(z===M3)return R3;const Z=ZONES[z],w=Z.w,h=Z.h;return [[w*.5,h*.5],[w*.25,h*.65],[w*.75,h*.65],[w*.5,h*.15],[w*.5,h*.5]];}
const LEG=4.1;   // seconds per leg (stage 3: 41 steps × 100 ms)
{const o=saveGame;saveGame=function(){if(B.on)return;return o.apply(this,arguments);};}
const raf=()=>new Promise(r=>requestAnimationFrame(r));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const heap=()=>{try{return performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):null;}catch(_){return null;}};
async function settle(){for(let i=0;i<600&&(G.fade||G.state!=='play');i++)await raf();for(let i=0;i<30;i++)await raf();}
async function runZone(z,laps,ui){
  const R=route(z),t0=performance.now();ui('กำลังโหลด '+(ZONES[z].n||z)+' …');
  loadZone(z,{x:R[0][0],y:R[0][1]});await settle();const loadMs=Math.round(performance.now()-t0);
  await sleep(1500);
  const ft=[];let last=performance.now();const legs=[];for(let l=0;l<laps;l++)for(let i=0;i<R.length-1;i++)legs.push([R[i],R[i+1]]);
  const T=legs.length*LEG,s0=performance.now();
  while(true){const now=await new Promise(r=>requestAnimationFrame(r));ft.push(now-last);last=now;
    const t=(now-s0)/1000;if(t>=T||!B.on)break;const li=Math.max(0,Math.min(legs.length-1,Math.floor(t/LEG))),u=Math.max(0,Math.min(1,(t-li*LEG)/LEG)),[a,b]=legs[li];
    P.x=a[0]+(b[0]-a[0])*u;P.y=a[1]+(b[1]-a[1])*u;P.vx=(b[0]-a[0])/LEG;P.vy=(b[1]-a[1])/LEG;P.invT=Math.max(P.invT||0,1);P.hp=P.maxHp;
    if(G.zone!==z)break;
    if((ft.length&31)===0)ui((ZONES[z].n||z)+' · '+Math.round(t)+' / '+Math.round(T)+' วิ');}
  P.vx=P.vy=0;
  const a=ft.slice(5).sort((x,y)=>x-y),n=a.length,sum=a.reduce((x,y)=>x+y,0);
  return {zone:z,name:ZONES[z].n,laps,frames:n,fps:+(1000/(sum/n)).toFixed(1),p50:+a[n>>1].toFixed(1),p95:+a[Math.floor(n*.95)].toFixed(1),
    over50:a.filter(x=>x>50).length,over100:a.filter(x=>x>100).length,worst:Math.round(a[n-1]),heapMB:heap(),loadMs};}
function fmt(r){return r.name+' ('+r.laps+' รอบ): '+r.fps+' fps · p95 '+r.p95+' ms · >50 ms '+r.over50+' · >100 ms '+r.over100+' · แย่สุด '+r.worst+' ms · หน่วยความจำ '+(r.heapMB==null?'วัดไม่ได้':r.heapMB+' MB')+' · โหลด '+(r.loadMs/1000).toFixed(1)+' วิ';}
function dev(){const n=navigator;return {ua:n.userAgent,dpr:window.devicePixelRatio||1,view:[innerWidth,innerHeight],cores:n.hardwareConcurrency||null,memGB:n.deviceMemory||null,build:'REAL v2 + p296'};}
/* panel */
let box=null;
function panel(){if(box)return box;box=document.createElement('div');box.id='benchBox';
  box.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:99999;background:rgba(20,16,30,.94);color:#f3ecff;border:1px solid #8b74ff;border-radius:12px;padding:14px 16px;width:min(92vw,520px);font:14px/1.5 system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.5)';
  box.innerHTML='<b style="font-size:16px">📊 วัดความลื่นแมพ 3</b><div id="benchMsg" style="margin:8px 0;white-space:pre-wrap"></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button id="benchCopy" type="button" style="display:none">คัดลอกผล</button><button id="benchStop" type="button">หยุด</button><button id="benchClose" type="button" style="display:none">ปิด</button></div>';
  for(const b of box.querySelectorAll('button'))b.style.cssText='font:inherit;padding:8px 14px;border-radius:8px;border:0;background:#7b5cff;color:#fff;cursor:pointer';
  for(const ev of ['pointerdown','pointerup','mousedown','touchstart','click'])box.addEventListener(ev,e=>e.stopPropagation());
  document.body.appendChild(box);
  box.querySelector('#benchStop').onclick=()=>{B.on=false;};
  box.querySelector('#benchClose').onclick=()=>{box.style.display='none';};
  box.querySelector('#benchCopy').onclick=()=>{const t=B.text||'';const done=()=>{box.querySelector('#benchCopy').textContent='คัดลอกแล้ว ✓';};
    try{navigator.clipboard.writeText(t).then(done,()=>fallback(t,done));}catch(_){fallback(t,done);}};
  return box;}
function fallback(t,done){const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;left:0;top:0;opacity:0';document.body.appendChild(a);a.select();try{document.execCommand('copy');done();}catch(_){}a.remove();}
B.start=async function(){
  if(B.on)return;const b=panel();b.style.display='';const msg=b.querySelector('#benchMsg'),ui=t=>{msg.textContent=t;};
  b.querySelector('#benchCopy').style.display='none';b.querySelector('#benchClose').style.display='none';b.querySelector('#benchStop').style.display='';b.querySelector('#benchCopy').textContent='คัดลอกผล';
  if(G.state!=='play'||!P||P.dead){ui('เริ่มได้ตอนกำลังเล่นเท่านั้น');b.querySelector('#benchClose').style.display='';return;}
  if(![M1,'cartroad_plains',M3].includes(G.zone)||(window.__M4T&&__M4T.on)){ui('กลับมาที่แมพ 1–3 ก่อน แล้วค่อยกดวัด');b.querySelector('#benchClose').style.display='';return;}
  try{const cp=document.getElementById('camPanel');if(cp)cp.hidden=true;}catch(_){}
  const home={z:G.zone,x:P.x,y:P.y};B.on=true;B.err=null;const res=[];
  try{res.push(await runZone(M1,1,ui));if(B.on)res.push(await runZone(M3,2,ui));}catch(e){B.err=e.message;B.stack=String(e.stack).slice(0,600);}
  B.on=false;try{loadZone(home.z,{x:home.x,y:home.y});}catch(e){B.err=(B.err?B.err+'; ':'')+e.message;}
  const d=dev();B.last={res,dev:d,at:new Date().toISOString()};
  B.text=res.map(fmt).join('\n')+'\n'+'เครื่อง: '+d.ua+' · DPR '+d.dpr+' · จอ '+d.view.join('×')+' · CPU '+(d.cores||'?')+' · RAM '+(d.memGB||'?')+' GB'+(B.err?'\nerror: '+B.err:'')+'\nJSON '+JSON.stringify(B.last);
  ui(res.map(fmt).join('\n\n')+(B.err?'\n\nerror: '+B.err:'')+'\n\nไม่ได้บันทึกเซฟระหว่างวัด · กด "คัดลอกผล" แล้ววางส่งในแชทได้เลย');
  b.querySelector('#benchCopy').style.display='';b.querySelector('#benchClose').style.display='';b.querySelector('#benchStop').style.display='none';};
/* settings button */
const add=setInterval(()=>{try{const p=document.getElementById('camPanel');if(!p||document.getElementById('benchBtn'))return;
  const btn=document.createElement('button');btn.id='benchBtn';btn.type='button';btn.textContent='📊 วัดความลื่นแมพ 3';
  btn.style.cssText='display:block;width:100%;margin:8px 0 2px;padding:8px;border-radius:8px;border:1px solid #8b74ff;background:#2a2140;color:#f3ecff;font:inherit;cursor:pointer';
  btn.addEventListener('click',e=>{e.stopPropagation();B.start();});p.appendChild(btn);clearInterval(add);}catch(e){B.err='btn '+e.message;}},500);
})();

