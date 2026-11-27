
/* ---- monkquest-r1 (TEST, 9 Nov 2026): หลวงตาสุริ affinity + memories + quest sp_03_guardian18 "ก้าวที่หายไป" (ORDER_20261109_monk-suri-quest; story passed by DeaRz 9 Nov 00:36) ----
   Self-contained module (own state in localStorage 'lf_monkquest_v1'): the game's story chapter system (affinity / NPC_MEMORIES / quest objectives) only runs while the prologue state is live, which these test builds never have,
   so the same rules are rebuilt here with the same shapes (affinity 0-100, memory scenes at 20/50/80, objective kinds interact(hold)/cutscene/defend/talk, flag guardian18_learned).
   Flow: talk (first meeting +10, daily +1) -> memories at 20/50/80 (+5 each) -> at affinity 100 and Lv 40 the monk offers the quest -> light 3 candles (Map 6 ice pond, Map 7 ruined wall, Map 8 bridge deck, stand 3 s)
   -> 3 travellers are cornered on the Map 8 bridge: DEFEND 3 Mistling waves (9/12/15, Lv 40), the protection bar 100 % (drain 0.8 %/s per attacking Mistling, +15 % between waves; 0 % = restart this objective only)
   -> the Guardian of 18 Arms appears (the real skill VFX, forced cast) and clears the rest -> talk to the monk: skill learned (flag guardian18_learned = the real unlock; ?guardian18lv=off stays a test bypass).
   ALL numbers: window.MONKQ.cfg (Balance v1.1 estimates, untested). Test shortcuts: window.MONKQ.gm + the small candle tray at the bottom left (?mqtest=off hides it). ?monkquest=off = module off (Lv 40 gate as in guardian18 r3). ---- */
(function(){'use strict';const Q=String(location.search);
const MQ=window.MONKQ={ver:'monkquest-r1',on:!/[?&]monkquest=off\b/.test(Q),ok:false,err:null,S:null,D:null,stats:{talks:0,toasts:0,mist:null,ttk:null,defendFails:0,defendWins:0},gm:{},
  cfg:{
    AFF:{FIRST:10,DAILY:1,LIKED:3,LIKED_DAY:2,OTHER:1,OTHER_DAY:3,MEM:5,MAX:100},      /* Balance v1.1: first meeting +10, daily talk +1, liked gift +3 (max 2/day), other gift +1 (max 3/day), memory +5 each */
    MEM_STEPS:[20,50,80],QUEST:{LV:40,AFF:100},
    POINTS:[   /* candle points, picked on the real maps (checked with screenshots) */
      {id:'p_sp3_candle_m6_pond',zone:'w23_map6_test',x:1340,y:2140,r:70,hold:3,label:'เทียนริมบ่อน้ำแข็ง'},      /* Map 6: snow bank next to the frozen pond, north of the wooden plank bridge (1400,2190) */
      {id:'p_sp3_candle_m7_ruins',zone:'w23_map7_test',x:1000,y:3620,r:70,hold:3,label:'เทียนข้างซากกำแพง'},       /* Map 7: outside the south wall, beside the broken white wall blocks */
      {id:'p_sp3_candle_m8_bridge',zone:'w23_map8_test',x:2790,y:2000,r:70,hold:3,label:'เทียนบนสะพานข้ามหุบ'}],    /* Map 8: stone bridge deck over the gorge (gorge bridge posts at 2790,2106) */
    DEFEND:{WAVES:[9,12,15],SPAWN_T:8,NEXT_DELAY:6,DRAIN:.8,HEAL:15,LV:40,HP_MUL:.5,ATK_MUL:.78,SWARM_ATK:.6,SPEED:125,PREFER_R:200,HIT_R:56,GUARD_REMAIN:6,GUARD_TIMEOUT:30,GUARD_T:3.5,RESTART_T:3,
      TRAV:[[-70,26],[0,-26],[70,26]],ARC_R:430,BASE_TYPE:'tuskboar',LOOK:['nullhound','dunehound','cinderhound','tuskboar'],TRAV_ART:['ora_0','mali_0','ferro_0','reo_0','pip_0','pell_0'],TRAV_H:[58,74,74]},
    REWARD:{EXP:40000,GOLD:710}}};
if(!MQ.on)return;
try{
const MK=window.MONK,G18=window.GUARDIAN18;if(!MK||!MK.ok||!MK.say)throw new Error('monk module r5 missing');
const CF=MQ.cfg,KEY='lf_monkquest_v1',clk=()=>typeof time==='number'?time:performance.now()/1000;
const bypassLv=/guardian18lv=off|monkquestlv=off/.test(Q);
/* ------------ state ------------ */
const fresh=()=>({aff:0,met:0,dayTalk:'',mem:{},giftDay:'',gl:0,go:0,learned:false,q:{s:'none',step:0,hold:0}});
function load(){try{const o=JSON.parse(localStorage.getItem(KEY)||'null');if(o&&typeof o==='object'){const f=fresh();return Object.assign(f,o,{q:Object.assign(f.q,o.q||{})})}}catch(_){}return fresh()}
let S=MQ.S=load();function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(_){}refresh()}
const today=()=>new Date().toISOString().slice(0,10);
MQ.flag=k=>k==='guardian18_learned'?!!S.learned:false;
/* the real unlock of the skill: the learned flag (the Lv 40 gate stays); ?guardian18lv=off = test bypass */
if(G18&&G18.cfg){try{Object.defineProperty(G18.cfg,'MINLV',{configurable:true,enumerable:true,get(){return /guardian18lv=off/.test(Q)?0:(S.learned?40:99999)}})}catch(e){MQ.err='gate '+e.message}}
/* ------------ small UI: toast, tracker, defend bar ------------ */
const css=document.createElement('style');css.textContent='#mqToast{position:fixed;left:50%;top:16%;transform:translateX(-50%);z-index:85;max-width:min(86vw,520px);padding:8px 16px;border-radius:10px;background:rgba(18,16,30,.9);border:1px solid #d9b65c;color:#ffe9a8;font:600 15px Sarabun,sans-serif;text-align:center;pointer-events:none;opacity:0;transition:opacity .25s}'
 +'#mqToast.on{opacity:1}#mqTrack{position:fixed;left:12px;top:150px;z-index:60;max-width:230px;padding:6px 10px;border-radius:8px;background:rgba(18,16,30,.82);border:1px solid #d9b65c;color:#fff6e0;font:13px/1.4 Sarabun,sans-serif;display:none;pointer-events:none}#mqTrack b{color:#ffd36b;display:block}'
 +'#mqBar{position:fixed;left:50%;top:70px;transform:translateX(-50%);z-index:70;width:min(300px,70vw);padding:4px 8px;border-radius:8px;background:rgba(18,16,30,.85);border:1px solid #d9b65c;color:#fff6e0;font:12px Sarabun,sans-serif;text-align:center;display:none;pointer-events:none}#mqBar i{display:block;height:8px;border-radius:4px;background:#3a3350;margin-top:3px;overflow:hidden}#mqBar i s{display:block;height:100%;background:linear-gradient(90deg,#f2c14e,#ffe9a8);width:100%}'
 +'#mqGM{position:fixed;left:8px;bottom:120px;z-index:90;font:12px Sarabun,sans-serif}#mqGM>button{width:38px;height:38px;border-radius:50%;border:2px solid #d9b65c;background:#17131f;color:#ffd36b;font-size:18px;cursor:pointer;padding:0}#mqGM .pn{display:none;position:absolute;left:0;bottom:44px;width:min(300px,86vw);max-height:60vh;overflow:auto;padding:8px;border-radius:10px;background:rgba(18,16,30,.96);border:1px solid #d9b65c;color:#fff6e0}'
 +'#mqGM .pn.on{display:block}#mqGM .pn h6{margin:6px 0 3px;font-size:12px;color:#ffd36b}#mqGM .pn button{margin:2px;padding:3px 7px;border-radius:6px;border:1px solid #a58a3c;background:#2a2440;color:#fff6e0;font:12px Sarabun,sans-serif;cursor:pointer}#mqGM .st{font-size:11px;color:#c9b98a;margin-bottom:4px;white-space:pre-line}';document.head.appendChild(css);
const el=(id)=>{const d=document.createElement('div');d.id=id;document.body.appendChild(d);return d};
const toastEl=el('mqToast'),trackEl=el('mqTrack'),barEl=el('mqBar');barEl.innerHTML='<span></span><i><s></s></i>';let toastT=null;
function toast(t,ms){MQ.stats.toasts++;toastEl.textContent=t;toastEl.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>toastEl.classList.remove('on'),ms||3200);try{log(t,'y')}catch(_){}}
const STEPS=['จุดเทียนที่บ่อน้ำแข็ง (แมพ 6)','จุดเทียนข้างซากกำแพง (แมพ 7)','จุดเทียนบนสะพานข้ามหุบ (แมพ 8)','ช่วยนักเดินทางบนสะพาน (แมพ 8)','ปกป้องนักเดินทางจนครบ 3 ระลอก','ผู้พิทักษ์ปรากฏ','กลับไปคุยกับหลวงตาสุริ (แมพ 10)'];
function refresh(){try{const q=S.q;if(q.s==='active'){trackEl.style.display='block';trackEl.innerHTML='<b>ก้าวที่หายไป</b>'+(q.step<=2?CF.POINTS[q.step].label+' · '+(['แมพ 6','แมพ 7','แมพ 8'][q.step])+(q.step===2?'':'')+' (ยืนค้าง '+CF.POINTS[q.step].hold+' วิ)':STEPS[q.step]||'')}else trackEl.style.display='none'}catch(_){}
  try{gmUpd()}catch(_){}}
/* ------------ affinity ------------ */
MK.sub=()=>'♥ '+S.aff+'/'+CF.AFF.MAX;
function addAff(n,why){const b=S.aff;S.aff=Math.max(0,Math.min(CF.AFF.MAX,S.aff+n));if(S.aff!==b)toast('ความสนิทหลวงตาสุริ +'+(S.aff-b)+(why?' ('+why+')':'')+' · '+S.aff+'/'+CF.AFF.MAX,2600);save()}
function gift(kind){const d=today();if(S.giftDay!==d){S.giftDay=d;S.gl=0;S.go=0}const A=CF.AFF;
  if(kind==='liked'){if(S.gl>=A.LIKED_DAY){toast('วันนี้ให้ของที่ชอบครบแล้ว');return false}S.gl++;addAff(A.LIKED,'ของที่ชอบ')}else{if(S.go>=A.OTHER_DAY){toast('วันนี้ให้ของอื่นครบแล้ว');return false}S.go++;addAff(A.OTHER,'ของอื่น')}return true}
/* ------------ lines ------------ */
const L1=(t,f)=>({face:f||0,text:t});
const GREET=[L1('เดินมาไกลนะโยม นั่งพักใต้ต้นไม้ก่อน ต้นนี้ไม่รีบใคร')];
const FIRST=[L1('เดินมาไกลนะโยม นั่งพักใต้ต้นไม้ก่อน ต้นนี้ไม่รีบใคร'),L1('อาตมาไม่ขายอะไร ไม่รับเงินด้วย มีแต่เรื่องเล่ากับร่มคันนี้',1)];
const MEM={20:[L1('อาตมาเดินธุดงค์มาสี่สิบพรรษา ทุกแผ่นดินที่เท้าไปถึง...'),L1('จนวันที่เท้าเหลือข้างเดียว',4)],
  50:[L1('คืนที่ฟ้าแตก อาตมาเฝ้าเด็กกลุ่มหนึ่งในศาลาริมผา',4),L1('เงาหมอกมา อาตมายืนขวางประตู... เสียขาไปข้างหนึ่ง',2),L1('แล้วมีแขนทองมากมายเหลือนับ ยื่นลงมาจากฟ้า',3)],
  80:[L1('สิ่งที่ลงมาคืนนั้นไม่ได้อยู่ฝ่ายไหน มันไม่ปกป้องฝ่าย',2),L1('มันปกป้องคนที่ยืนขวางหน้าคนอื่น',0),L1('อาตมานั่งตรงนี้ ถามมันทุกวันว่าจะเลือกข้างไหม... มันยังไม่ตอบ',4)]};
const UNLOCK={20:'ปลดล็อก: จุดเดินธุดงค์ 3 จุดบนแผนที่',50:'ปลดล็อก: บันทึกตำนานผู้พิทักษ์',80:'ปลดล็อก: เควส ก้าวที่หายไป (ที่ความสนิท 100)'};
const BEFORE=[L1('อาตมาเหลือทางธุดงค์อีกสามจุดที่ไปไม่ถึง โยมไปแทนได้ไหม จุดเทียนให้หน่อย',0)];
const DONE=[L1('(ลืมตา ยิ้ม) ขาอาตมาเดินไม่ได้ แต่วันนี้... ไปถึงแล้ว',1),L1('มันยังไม่เลือกข้างหรอก แต่มันเลือกโยมแล้ว',1)];
const AFTER=[L1('นั่งพักก่อนโยม ผู้ที่อยู่ข้างหลังโยมก็เหนื่อยเหมือนกัน',0)];
const lvOk=()=>bypassLv||(P.lvl|0)>=CF.QUEST.LV;
MK.onTalk=function(){MQ.stats.talks++;const A=CF.AFF;let first=false;
  if(!S.met){S.met=1;first=true;addAff(A.FIRST,'พบครั้งแรก')}
  const d=today();if(S.dayTalk!==d){S.dayTalk=d;if(!first)addAff(A.DAILY,'คุยวันนี้')}
  for(const st of CF.MEM_STEPS){if(S.aff>=st&&!S.mem[st]){S.mem[st]=1;save();MK.say(MEM[st],{onEnd:()=>{addAff(A.MEM,'ความทรงจำ '+st);toast(UNLOCK[st],3600)}});return}}
  const q=S.q;
  if(q.s==='done'){MK.say(AFTER);return}
  if(q.s==='none'){if(S.aff>=CF.QUEST.AFF&&lvOk()&&S.mem[80]){MK.say(BEFORE,{choices:[{label:'รับเควส · จุดเทียนแทน',fn:startQuest},{label:'ไว้ก่อน'}]});return}
    const extra=S.aff>=CF.QUEST.AFF&&!lvOk()?[L1('ทางข้างหน้าหนักนัก ไว้โยมแข็งแรงกว่านี้ (Lv '+CF.QUEST.LV+') แล้วค่อยมาคุยกัน',2)]:[];
    MK.say((first?FIRST:GREET).concat(extra));return}
  if(q.step>=6){MK.say(DONE,{onEnd:finishQuest});return}
  MK.say([L1('จุดเทียนสามจุด แล้วช่วยนักเดินทางนะโยม — '+(STEPS[q.step]||''),0)])};
function startQuest(){S.q={s:'active',step:0,hold:0};save();toast('รับเควส: ก้าวที่หายไป',3000)}
function finishQuest(){S.q={s:'done',step:7,hold:0};S.learned=true;try{gainExp(CF.REWARD.EXP)}catch(_){}try{P.gold+=CF.REWARD.GOLD}catch(_){}save();
  toast('ได้สกิล ผู้พิทักษ์ 18 กร (ปุ่ม 9) · +'+CF.REWARD.EXP+' EXP · +'+CF.REWARD.GOLD+' G',5000);try{if(window.SPSK){SPSK.sig='';}}catch(_){}}
/* ------------ candle points ------------ */
let hold=0;
function pointNow(){const q=S.q;return q.s==='active'&&q.step<=2?CF.POINTS[q.step]:null}
const STEPSAY=[['เทียนติดไฟ ลมหยุดครู่หนึ่ง','"ใบไม้ไม่รีบร่วง"'],['เทียนติดไฟข้างกำแพงพัง','"กำแพงกันลม ไม่กันคน"'],['"สะพานไม่เลือกคนข้าม"']];
function candleDone(){const i=S.q.step;const ls=STEPSAY[i]||[];ls.forEach((t,k)=>setTimeout(()=>toast(t,2600),k*1500));S.q.step=i+1;hold=0;save();if(S.q.step===3)startCutscene()}
/* ------------ defend ------------ */
const art={};function artImg(k){if(art[k]!==undefined)return art[k];let src=null;try{const C=window.__C1ART||{},P2=window.__PROART||{};src=C[k]||P2[k]||null}catch(_){}if(!src){art[k]=null;return null}const im=new Image();im.src=typeof src==='string'?src:(src.src||'');art[k]=im;return im}
function travArt(){const D=CF.DEFEND,out=[];for(const k of D.TRAV_ART){if(artImg(k)&&out.length<3)out.push(k)}return out}
let D=MQ.D=null;
function startCutscene(){const p=CF.POINTS[2];MK.say([{face:-1,who:'(ข้อความลอย)',text:'นักเดินทางสามคนถูกฝูงหมาหมอกล้อมกลางสะพาน'},{face:-1,who:'นักเดินทาง',text:'ช่วยด้วย!'}],{onEnd:beginDefend,free:true})}
function mkMist(x,y){const d=CF.DEFEND;const look=d.LOOK.find(k=>MOBS[k])||'slime';const base=makeEnemy(MOBS[d.BASE_TYPE]?d.BASE_TYPE:look,d.LV,x,y);
  const e=makeEnemy(look,d.LV,x,y);const hp=Math.max(1,Math.round(base.hp*d.HP_MUL)),atk=base.atk*d.ATK_MUL*d.SWARM_ATK;
  e.maxHp=e.hp=hp;e.atk=atk;e.L=d.LV;e.sp=d.SPEED;e.aggro=true;e.mist=1;e.def=Math.min(e.def,base.def);e.m=Object.assign({},e.m,{n:'Mistling',boss:false,elite:false});
  MQ.stats.mist={base:{type:d.BASE_TYPE,hp:base.hp,atk:+base.atk.toFixed(1)},mist:{look,hp,atk:+atk.toFixed(1),speed:d.SPEED,lv:d.LV}};return e}
function beginDefend(){const p=CF.POINTS[2];if(G.zone!==p.zone)return;const d=CF.DEFEND,ta=travArt();
  D=MQ.D={on:true,wave:0,state:'between',t:d.NEXT_DELAY-1,bar:100,mobs:[],spawned:0,total:0,gt:0,fails:0,
    trav:d.TRAV.map((o,i)=>({x:p.x+o[0],y:p.y+o[1],art:ta[i]||null,h:d.TRAV_H[i]||70,hit:0}))};S.q.step=4;save();barUpd();toast('ปกป้องนักเดินทาง! ระลอก 1 กำลังมา',2600)}
function endDefendClear(){if(!D)return;for(const e of D.mobs){e.dead=true;e.hp=0;const i=enemies.indexOf(e);if(i>=0)enemies.splice(i,1)}D.mobs=[]}
function barUpd(){if(!D||!D.on){barEl.style.display='none';return}barEl.style.display='block';barEl.firstChild.textContent='ปกป้องนักเดินทาง '+Math.max(0,Math.round(D.bar))+'% · ระลอก '+Math.max(1,Math.min(D.wave,CF.DEFEND.WAVES.length))+'/'+CF.DEFEND.WAVES.length;barEl.querySelector('s').style.width=Math.max(0,Math.min(100,D.bar))+'%'}
function failDefend(){if(!D)return;MQ.stats.defendFails++;D.fails++;endDefendClear();D.bar=100;D.wave=0;D.state='restart';D.t=0;toast('นักเดินทางหนีไม่ทัน... เริ่มเป้าหมายนี้ใหม่',3000);barUpd()}
function winDefend(){if(!D)return;MQ.stats.defendWins++;D.on=false;barUpd();S.q.step=6;save();toast('แสงทองขึ้นจากพื้นหลังเจ้า... ร่างทองนั่งหลับตาปรากฏ',3600);setTimeout(()=>toast('อาวุธสิบแปดชิ้นตกลงรอบตัว หมอกหายไปหมด',3600),3800);setTimeout(()=>toast('กลับไปคุยกับหลวงตาสุริ (แมพ 10)',3600),7600)}
function spawnOne(k,total){const p=CF.POINTS[2],d=CF.DEFEND;const side=k%3,ang=[-2.6,-0.5,1.6][side]+(Math.random()-.5)*.6;const e=mkMist(p.x+Math.cos(ang)*d.ARC_R,p.y+Math.sin(ang)*d.ARC_R*.8);enemies.push(e);D.mobs.push(e)}
const alive=()=>D.mobs.filter(e=>e&&!e.dead&&e.hp>0);
function tickDefend(dt){if(!D||!D.on)return;const d=CF.DEFEND,p=CF.POINTS[2];
  if(G.zone!==p.zone){if(D.mobs.length){endDefendClear()}D.state='away';return}
  if(D.state==='away'){D.state='restart';D.t=0}
  D.mobs=D.mobs.filter(e=>e&&!e.dead&&e.hp>0&&enemies.indexOf(e)>=0);
  if(D.state==='restart'){D.t+=dt;if(D.t>=d.RESTART_T){D.state='between';D.t=d.NEXT_DELAY-1}}
  else if(D.state==='between'){D.t+=dt;if(D.t>=d.NEXT_DELAY){D.wave++;D.total=d.WAVES[D.wave-1];D.spawned=0;D.t=0;D.state='spawn';toast('ระลอก '+D.wave+'/'+d.WAVES.length+' · Mistling '+D.total+' ตัว',2200);barUpd()}}
  else if(D.state==='spawn'){D.t+=dt;while(D.spawned<D.total&&D.t>=D.spawned*d.SPAWN_T/D.total){spawnOne(D.spawned,D.total);D.spawned++}if(D.spawned>=D.total){D.state='fight';D.t=0}}
  else if(D.state==='fight'){D.t+=dt;const n=alive().length;
    if(D.wave<d.WAVES.length){if(n===0){D.bar=Math.min(100,D.bar+d.HEAL);D.state='between';D.t=0;toast('ระลอก '+D.wave+' ผ่าน · ความปลอดภัย '+Math.round(D.bar)+'%',2400)}}
    else if(n<=d.GUARD_REMAIN||D.t>d.GUARD_TIMEOUT){D.state='guardian';D.t=0;try{if(G18&&G18.cast)G18.cast(true)}catch(e){MQ.err='guardian '+e.message}}}
  else if(D.state==='guardian'){D.t+=dt;if(D.t>=d.GUARD_T){endDefendClear();winDefend()}}
  if(D.bar<=0&&D.on&&D.state!=='restart')failDefend();barUpd()}
/* mistling steering: they chase the hero when he is within PREFER_R, otherwise the nearest traveller (their own movement is replaced, the rest of the game's AI still fights the hero) */
function steer(dt,saved){if(!D||!D.on||!D.mobs.length||D.state==='guardian')return;const d=CF.DEFEND;let attackers=0;
  for(const e of D.mobs){const sv=saved.get(e);if(!sv||e.dead||e.hp<=0)continue;if(Math.hypot(e.x-P.x,e.y-P.y)<=d.PREFER_R)continue;
    let best=null,bd=1e9;for(const t of D.trav){const q=Math.hypot(t.x-sv[0],t.y-sv[1]);if(q<bd){bd=q;best=t}}if(!best)continue;
    e.x=sv[0];e.y=sv[1];e.vx=0;e.vy=0;e.aggro=true;
    if(bd>d.HIT_R){const k=Math.min(bd-d.HIT_R*.5,d.SPEED*dt)/bd;e.x+=(best.x-e.x)*k;e.y+=(best.y-e.y)*k}else{attackers++;best.hit=.25}}
  if(attackers)D.bar-=d.DRAIN*attackers*dt}
{const o=update;update=function(dt){const sav=new Map();if(D&&D.on)for(const e of D.mobs)sav.set(e,[e.x,e.y]);const r=o.apply(this,arguments);
  try{if(G.state==='play'&&P&&!P.dead){const q=S.q;
    if(q.s==='active'&&q.step<=2){const p=CF.POINTS[q.step];if(G.zone===p.zone&&!MK.isOpen()){if(Math.hypot(P.x-p.x,P.y-p.y)<=p.r)hold+=dt;else hold=Math.max(0,hold-dt*2);if(hold>=p.hold)candleDone()}else hold=0}
    if(q.s==='active'&&q.step===3&&D===null&&G.zone===CF.POINTS[2].zone&&Math.hypot(P.x-CF.POINTS[2].x,P.y-CF.POINTS[2].y)<500&&!MK.isOpen())startCutscene();
    if(q.s==='active'&&q.step===4&&(!D||!D.on)&&G.zone===CF.POINTS[2].zone&&!MK.isOpen())beginDefend();
    steer(dt||.016,sav);tickDefend(dt||.016)}}catch(e){MQ.err='tick '+e.message}return r}}
/* ------------ drawing: candle markers (ground pass) and travellers (top pass) ------------ */
const GCTX=new Function('return ctx');
{const o=drawRaidTele;drawRaidTele=function(){const r=o.apply(this,arguments);try{const p=pointNow();if(p&&G.zone===p.zone){const c=GCTX(),t=clk(),a=.55+.3*Math.sin(t*3);c.save();c.translate(p.x,p.y);c.scale(1,.55);
    const g=c.createRadialGradient(0,0,4,0,0,p.r);g.addColorStop(0,'rgba(255,214,120,'+a+')');g.addColorStop(1,'rgba(255,170,60,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,p.r,0,6.283);c.fill();
    c.strokeStyle='rgba(255,233,168,.9)';c.lineWidth=3;c.beginPath();c.arc(0,0,p.r*.55,-1.5708,-1.5708+6.283*Math.min(1,hold/p.hold));c.stroke();c.restore();
    c.save();c.font='bold 13px Sarabun,sans-serif';c.textAlign='center';c.lineWidth=3;c.strokeStyle='rgba(20,16,30,.9)';c.strokeText(p.label,p.x,p.y+22);c.fillStyle='#fff2b0';c.fillText(p.label,p.x,p.y+22);c.restore()}}catch(e){MQ.err='mark '+e.message}return r}}
{const o=drawParts;drawParts=function(){const r=o.apply(this,arguments);try{if(D&&D.on&&G.zone===CF.POINTS[2].zone){const c=GCTX();for(const t of D.trav){c.save();c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(t.x,t.y+2,16,6,0,0,6.283);c.fill();
      const im=t.art&&art[t.art];if(im&&im.complete&&im.naturalWidth){const h=t.h,w=h*im.naturalWidth/im.naturalHeight;c.drawImage(im,t.x-w/2,t.y-h+4,w,h)}else{c.fillStyle='#e8d4b8';c.beginPath();c.arc(t.x,t.y-22,9,0,6.283);c.fill();c.fillRect(t.x-9,t.y-14,18,14)}
      if(t.hit>0){c.globalAlpha=.5;c.fillStyle='#ff6a5a';c.beginPath();c.arc(t.x,t.y-26,22,0,6.283);c.fill();t.hit-=.016}c.restore()}}}catch(e){MQ.err='trav '+e.message}return r}}
/* ------------ GM / test shortcuts ------------ */
const gm=MQ.gm;
gm.aff=n=>{S.aff=Math.max(0,Math.min(100,n|0));save();return S.aff};
gm.addAff=(n)=>addAff(n|0,'GM');
gm.gift=gift;
gm.lv40=()=>{try{P.lvl=Math.max(P.lvl|0,40)}catch(_){}return P.lvl};
gm.reset=()=>{endDefendClear();D=MQ.D=null;S=MQ.S=fresh();hold=0;save();barUpd();return 'reset'};
gm.mem=st=>{if(!MEM[st])return 'step 20/50/80';S.mem[st]=0;if(S.aff<st)S.aff=st;save();MK.say(MEM[st],{onEnd:()=>{S.mem[st]=1;addAff(CF.AFF.MEM,'ความทรงจำ '+st);toast(UNLOCK[st],3000)}});return 'play '+st};
gm.start=()=>{if(S.aff<100)S.aff=100;S.mem[20]=S.mem[50]=S.mem[80]=1;gm.lv40();startQuest();return S.q};
gm.step=n=>{n=n|0;endDefendClear();D=MQ.D=null;S.q={s:'active',step:Math.max(0,Math.min(6,n)),hold:0};hold=0;save();barUpd();return S.q};
gm.tp=i=>{const p=CF.POINTS[i|0];if(!p)return 'point 0/1/2';travel(p.zone,'tele');const t0=performance.now(),iv=setInterval(()=>{try{if(G.zone===p.zone&&!G.fade){clearInterval(iv);P.x=p.x-90;P.y=p.y+40}else if(performance.now()-t0>20000)clearInterval(iv)}catch(e){clearInterval(iv)}},400);return 'warp '+p.zone};
gm.tpMonk=()=>{travel('w24_map10_test','tele');const t0=performance.now(),iv=setInterval(()=>{try{if(G.zone==='w24_map10_test'&&!G.fade){clearInterval(iv);P.x=MK.npc.x-60;P.y=MK.npc.y+30}else if(performance.now()-t0>25000)clearInterval(iv)}catch(e){clearInterval(iv)}},400);return 'warp monk'};
gm.failDefend=()=>{if(!D||!D.on)return 'no defend';D.bar=0;return 'fail'};
gm.learned=v=>{S.learned=!!v;save();try{if(window.SPSK)SPSK.sig=''}catch(_){}return S.learned};
gm.state=()=>JSON.parse(JSON.stringify({aff:S.aff,mem:S.mem,q:S.q,learned:S.learned,defend:D?{on:D.on,wave:D.wave,state:D.state,bar:Math.round(D.bar),alive:D.mobs.length,fails:D.fails}:null,stats:MQ.stats}));
/* Balance check 1: print the Lv 40 Mistling HP / ATK */
gm.mistStats=()=>{const e=mkMist(0,0);return MQ.stats.mist};
/* Balance check 2: time to kill one Lv 40 Mistling with the basic attack of the held weapon (seconds, game clock) */
gm.ttk=async(weapon)=>{const sleep=ms=>new Promise(r=>setTimeout(r,ms));const w0=P.weapon&&P.weapon.t;if(weapon&&P.weapon)P.weapon.t=weapon;gm.lv40();const out=[];
  for(let n=0;n<3;n++){const e=mkMist(P.x+70,P.y);e.atk=0;enemies.push(e);const t0=clk();let tries=0;while(!e.dead&&e.hp>0&&tries<600){P.face=Math.atan2(e.y-P.y,e.x-P.x);P.atkCd=0;try{basicAttack()}catch(er){MQ.err='ttk '+er.message}await sleep(50);e.x=P.x+70;e.y=P.y;e.vx=e.vy=0;tries++}out.push(+(clk()-t0).toFixed(2));const i=enemies.indexOf(e);if(i>=0)enemies.splice(i,1)}
  if(weapon&&P.weapon)P.weapon.t=w0;const r={weapon:weapon||w0,lvl:P.lvl,hp:MQ.stats.mist&&MQ.stats.mist.mist.hp,seconds:out,avg:+(out.reduce((a,b)=>a+b,0)/out.length).toFixed(2)};MQ.stats.ttk=r;return r};
/* tray */
const gmEl=el('mqGM');gmEl.innerHTML='<button type="button" title="ทดสอบเควสหลวงตาสุริ">🕯</button><div class="pn"><div class="st"></div>'
 +'<h6>ความสนิท</h6><button data-a="aff0">0</button><button data-a="aff20">20</button><button data-a="aff50">50</button><button data-a="aff80">80</button><button data-a="aff100">100</button><button data-a="gl">ของที่ชอบ +3</button><button data-a="go">ของอื่น +1</button>'
 +'<h6>ความทรงจำ</h6><button data-a="mem20">20</button><button data-a="mem50">50</button><button data-a="mem80">80</button>'
 +'<h6>เควส</h6><button data-a="lv40">Lv 40</button><button data-a="start">เริ่มเควส</button><button data-a="s0">จุด1</button><button data-a="s1">จุด2</button><button data-a="s2">จุด3</button><button data-a="s3">ฉากนักเดินทาง</button><button data-a="s6">ไปคุยหลวงตา</button><button data-a="fail">ล้มเป้าหมาย</button>'
 +'<h6>วาร์ป</h6><button data-a="tp0">แมพ6</button><button data-a="tp1">แมพ7</button><button data-a="tp2">แมพ8</button><button data-a="tpm">หลวงตา</button>'
 +'<h6>อื่นๆ</h6><button data-a="learn">สกิล ✔/✖</button><button data-a="reset">รีเซ็ต</button><button data-a="mist">ดู HP/ATK</button><button data-a="ttk">วัด TTK</button></div>';
const pn=gmEl.querySelector('.pn');gmEl.firstChild.addEventListener('click',e=>{e.stopPropagation();pn.classList.toggle('on')});
for(const ev of ['pointerdown','mousedown','touchstart','click'])gmEl.addEventListener(ev,e=>e.stopPropagation());
pn.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.a;let r;
  if(a.startsWith('aff'))r=gm.aff(+a.slice(3));else if(a==='gl')r=gift('liked');else if(a==='go')r=gift('other');else if(a.startsWith('mem'))r=gm.mem(+a.slice(3));else if(a==='lv40')r=gm.lv40();else if(a==='start')r=gm.start();
  else if(/^s\d$/.test(a))r=gm.step(+a.slice(1));else if(a==='fail')r=gm.failDefend();else if(a.startsWith('tp')){r=a==='tpm'?gm.tpMonk():gm.tp(+a.slice(2))}else if(a==='learn')r=gm.learned(!S.learned);else if(a==='reset')r=gm.reset();
  else if(a==='mist')r=gm.mistStats();else if(a==='ttk')r=await gm.ttk();pn.querySelector('.st').textContent=typeof r==='object'?JSON.stringify(r):String(r);gmUpd()});
function gmUpd(){const s=pn.querySelector('.st');if(s&&!pn.matches('.on'))return;if(s&&!s.dataset.hold)s.textContent='aff '+S.aff+' · quest '+S.q.s+' step '+S.q.step+(S.learned?' · learned':'')}
if(/[?&]mqtest=off\b/.test(Q)||!/[?&]gm=on\b/.test(location.search))gmEl.style.display='none';
const fixSp=setInterval(()=>{try{const d=window.SPSK&&SPSK.defs&&SPSK.defs.find(x=>x.id==='g18');if(d){d.lv=CF.QUEST.LV;d.npc='หลวงตาสุริ แมพ 10 (เควส ก้าวที่หายไป)';clearInterval(fixSp)}}catch(_){}},500);
refresh();MQ.ok=true;
}catch(e){MQ.err=e.message;MQ.ok=false}
})();

