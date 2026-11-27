
/* ---- orahint-r1 (TEST, 12 Nov 2026): Story's option A - the spark orb leads a NEW character from the forest exit to Granny Ora, plus "!" quest markers ----
   * A brand-new character (prologue just finished, no chapter-1 quest started) arrives in Map 1: the spark orb does not vanish, it floats AHEAD of the hero toward Ora (1290,885): it never gets more than ~200 px ahead (it waits when the hero stops or lags) and does not fly past Ora;
     tracker text while it leads: "ตามแสงประกายไปหายายโอรา";
   * when the orb reaches Ora it circles her once and fades; floating text "แสงประกายวนรอบหญิงชราคนหนึ่ง แล้วจางหายไปในอกเจ้า"; then a "!" stays over her while m1_01_spark is available;
   * "!" marker over ANY NPC that gives an available quest (CH1Q engine: same rules as the engine's own offer test - quest not started, prologue done, 'after' quests done, level, affinity, flags; CH2 quests live in the same QBY): drawn while the quest is available, hidden as soon as it is taken;
   * existing characters (legacy / prologue already done earlier) get only the markers, not the orb. ?orahint=off disables everything. Debug: window.__ORAHINT ---- */
(function(){'use strict';
const Q=String(location.search),OFF=/[?&]orahint=off\b/.test(Q);
const H=window.__ORAHINT={ver:'orahint-r1',on:!OFF,err:null,phase:'idle',orb:null,stats:{orbFrames:0,markers:0,started:0,finished:0}};
if(OFF)return;
const ERR=(w,e)=>{H.err=w+': '+((e&&e.message)||e);try{console.error('[ORAHINT]',w,e)}catch(_){}};
const ORA={x:1290,y:885},LEAD=190,SPEED=210,CIRCLE_T=2.4,FADE_T=1.3,TEXT='แสงประกายวนรอบหญิงชราคนหนึ่ง แล้วจางหายไปในอกเจ้า',TRACK='ตามแสงประกายไปหายายโอรา';
const C1=()=>window.CH1Q,A=()=>{const c=C1();return c&&c.api},PS=()=>{try{return PROLOGUE.st&&PROLOGUE.st()}catch(_){return null}};
const clk=()=>typeof time==='number'?time:performance.now()/1000;
let lastZone=null,trackEl=null,textUntil=0;
function ora(){try{const n=A().NPC.npc_ora;return n&&n.at?{x:n.at.x,y:n.at.y}:ORA}catch(_){return ORA}}
function track(on){try{if(on){if(!trackEl){trackEl=document.createElement('div');trackEl.id='oraTrack';const ref=document.getElementById('qTrack');trackEl.style.cssText='position:fixed;right:14px;top:84px;z-index:30;max-width:250px;padding:8px 12px;border-radius:10px;background:rgba(10,18,40,.88);border:1px solid rgba(255,190,92,.45);color:#ffe9b0;font:600 13px "Noto Sans Thai",system-ui,sans-serif;pointer-events:none';document.body.appendChild(trackEl)}trackEl.innerHTML='<div style="font-size:11px;color:#8fa4cc;margin-bottom:2px">เควสบทนำ</div>'+TRACK;trackEl.style.display='block'}else if(trackEl){trackEl.style.display='none'}}catch(e){ERR('track',e)}}
/* ---- start condition: new character that has just come out of the forest into Map 1 ---- */
function maybeStart(){const S=PS(),a=A();if(!S||!a||H.phase!=='idle')return;if(!S.flags||!S.flags.prologueDone||S.flags.legacy||S.flags.oraHintDone)return;
  const c1=S.c1&&S.c1.q?Object.keys(S.c1.q).length:0;if(c1>0){S.flags.oraHintDone=true;return}
  const o=ora();H.phase='lead';H.stats.started++;H.orb={x:P.x+60,y:P.y-50,a:0,t:0,mode:'lead'};track(true);try{log('แสงประกายลอยนำทาง… ตามไปหายายโอรา','v')}catch(_){}}
function finish(){H.phase='done';H.stats.finished++;H.orb=null;track(false);try{const S=PS();if(S&&S.flags)S.flags.oraHintDone=true;try{saveGame()}catch(_){}}catch(_){}}
function tick(dt){
  if(G.state!=='play'||!P)return;
  const z=G.zone;if(z!==lastZone){const prev=lastZone;lastZone=z;if(z==='sylva_lab'&&(prev==='w00_forest'||prev===null&&false))setTimeout(()=>{try{maybeStart()}catch(e){ERR('start',e)}},900);if(z!=='sylva_lab'&&H.phase==='lead'){/* left Map 1: pause the lead */H.orb=null;H.phase='idle';track(false)}}
  if(H.phase==='lead'&&z==='sylva_lab'&&H.orb){H.stats.orbFrames++;const o=ora(),b=H.orb;
    if(b.mode==='lead'){const dh=Math.hypot(o.x-P.x,o.y-P.y);
      if(dh<95){b.mode='circle';b.t=0;b.cx=o.x;b.cy=o.y-34;b.a0=Math.atan2(b.y-b.cy,b.x-b.cx);textUntil=clk()+5.5;try{log(TEXT,'v')}catch(_){}track(false);return}
      /* wanted point = the hero's bearing to Ora, LEAD px ahead (never beyond Ora) */
      const ux=(o.x-P.x)/dh,uy=(o.y-P.y)/dh,ahead=Math.min(LEAD,dh-40),tx=P.x+ux*ahead,ty=P.y+uy*ahead-30;
      /* the orb never moves further from the hero than LEAD: it eases toward the wanted point, at most SPEED px/s, and is pulled back if the hero is slower than that */
      const dx=tx-b.x,dy=ty-b.y,dd=Math.hypot(dx,dy)||1,st=Math.min(dd,SPEED*dt);b.x+=dx/dd*st;b.y+=dy/dd*st+Math.sin(clk()*3)*.25;
      const dh2=Math.hypot(b.x-P.x,b.y-P.y);if(dh2>LEAD+20){const k=(LEAD+20)/dh2;b.x=P.x+(b.x-P.x)*k;b.y=P.y+(b.y-P.y)*k}}
    else if(b.mode==='circle'){b.t+=dt;const u=Math.min(1,b.t/CIRCLE_T),a=b.a0+u*Math.PI*2,r=52-8*u;b.x=b.cx+Math.cos(a)*r;b.y=b.cy+Math.sin(a)*r*.55-u*14;if(b.t>=CIRCLE_T){b.mode='fade';b.t=0}}
    else if(b.mode==='fade'){b.t+=dt;b.alpha=Math.max(0,1-b.t/FADE_T);if(b.t>=FADE_T)finish()}}}
{const o=update;update=function(dt){const r=o.apply(this,arguments);try{tick(dt)}catch(e){ERR('tick',e)}return r}}
/* ---- availability test = the engine's reqOk (the engine's own function is private) ---- */
function avail(q){const a=A();if(!a)return false;const S=PS();if(!S||!S.flags||!S.flags.prologueDone)return false;const st=a.state&&a.state();const rec=st&&st.q&&st.q[q.id];if(rec)return false;const R=q.requires||{};
  const done=id=>{const r=st&&st.q&&st.q[id];return !!(r&&r.s==='d')};
  if((R.after||[]).some(x=>!done(x)&&!(S.flags.prologueDone&&String(x).startsWith('pro_'))))return false;
  if((P.lvl||1)<(R.lv||1))return false;
  if(R.aff&&Object.entries(R.aff).some(([n,v])=>(a.aff?a.aff(n):0)<v))return false;
  if((R.flags||[]).some(f=>!S.flags[f]))return false;return true}
let mk={t:0,list:[]};
function markers(){const now=clk();if(now-mk.t<.4)return mk.list;mk.t=now;const out=[];try{const a=A();if(!a||!a.QBY||!a.NPC||G.state!=='play')return mk.list=[];const seen=new Set();for(const id in a.QBY){const q=a.QBY[id];if(!q||q.auto||!q.giver||seen.has(q.giver))continue;const n=a.NPC[q.giver];if(!n||!n.at||n.at.zone!==G.zone)continue;if(avail(q)){seen.add(q.giver);out.push({x:n.at.x,y:n.at.y,id:q.giver,q:q.id})}}}catch(e){ERR('markers',e)}H.markers=out.map(m=>m.id+':'+m.q);mk.list=out;return out}
/* ---- drawing (world coords, after the entities) ---- */
{const o=drawTexts;drawTexts=function(){const r=o.apply(this,arguments);try{
  if(typeof ctx==='undefined')return r;
  /* markers */
  if(G.state==='play'){const ms=markers();for(const m of ms){H.stats.markers++;const t=clk(),bob=Math.sin(t*3+m.x)*4,x=m.x,y=m.y-92+bob;ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='#ffd447';ctx.strokeStyle='#5a3b00';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,13,0,6.283);ctx.fill();ctx.stroke();ctx.fillStyle='#5a3b00';ctx.font='900 19px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('!',x,y+1);ctx.restore()}}
  /* orb */
  const b=H.orb;if(b&&G.zone==='sylva_lab'){const al=b.mode==='fade'?(b.alpha||0):1,t=clk();ctx.save();try{add()}catch(_){}
    const pulse=.85+.15*Math.sin(t*6);try{glow(b.x,b.y,46*pulse,'#ffd36b',.55*al);glow(b.x,b.y,20,'#fff2c0',.9*al);glow(b.x,b.y,7,'#ffffff',1*al)}catch(_){}
    for(let i=0;i<5;i++){const k=(t*1.3+i/5)%1,px=b.x-Math.cos(t+i)*k*24,py=b.y+k*30;try{glow(px,py,6*(1-k),'#ffe39a',.5*(1-k)*al)}catch(_){}}
    try{norm()}catch(_){}ctx.restore()}
  /* floating text */
  if(clk()<textUntil&&G.zone==='sylva_lab'){const o2=ora(),k=Math.min(1,(textUntil-clk())/1.2);ctx.save();ctx.globalAlpha=k;ctx.font='700 15px "Noto Sans Thai", system-ui, sans-serif';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='rgba(20,14,6,.85)';ctx.fillStyle='#ffe9a8';const y=o2.y-120-(5.5-(textUntil-clk()))*3;ctx.strokeText(TEXT,o2.x,y);ctx.fillText(TEXT,o2.x,y);ctx.restore()}
 }catch(e){ERR('draw',e)}return r}}
H.avail=avail;H.markers_=markers;
console.info('[ORAHINT] ready');
})();
