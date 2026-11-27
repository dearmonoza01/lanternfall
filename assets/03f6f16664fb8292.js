
/* ---- monk-r1 (TEST, 8 Nov 2026): NPC "หลวงตาสุริ" (npc_monk_suri), static seated monk under his klot (ORDER_20261108_npc-monk-suri-test; sprite passed by DeaRz 16:17) ----
   Map 10 (w24_map10_test), under the big oak at the north entrance of the farm. One static sprite (embedded WebP, baked from the 1254x1254 PNG), anchor = seat bottom (560,960 of 1254),
   drawn through the game's own NPC entity pass (NPCS list, drawn by y so the hero walks in front of / behind him; crutch, bowl and kettle are in front of the anchor).
   Scale: his bald head (270 px wide in the PNG) = HEAD_PX world px (the hero's head is about 32 px wide on screen). Name tag. Small ellipse blocker around the klot/seat only.
   Talk (E / the game's interact): placeholder line until the quest is approved. Flag ?monk=off hides him. ALL numbers in window.MONK.cfg. ---- */
(function(){'use strict';const Q=String(location.search);
const MK=window.MONK=window.MONK_SURI={ver:'monk-r5',on:!/[?&]monk=off\b/.test(Q),ok:false,err:null,npc:null,stats:{talks:0,drawn:0,pushed:0},
  cfg:{ZONE:'w24_map10_test',X:785,Y:1460,   /* r3 (DeaRz: too many monsters at the farm): Map 10 SAFE arrival plaza (zone A, x 620-820, y 1400-1600), 85 px east of the landing point (700,1500); lamps at (700,1385) and (700,1622), the west warp circle is at (830,1170). r1/r2 spot was (3010,1990). */
    CLEAR_R:350,   /* no monster may stand within this many px of him: anything that wanders or spawns inside is pushed out to the edge and calmed (0 = off) */   /* seat-bottom anchor in world px (Map 10 is 3400x3000): open grass at the north entrance of the farm, just west of the hay bale (3116,2005); the oaks at (3254,2007) stand in the pine forest, whose canopy would hide him */
    HEAD_PX:32,HEAD_SRC_PX:270,SRC:1254,ANCH:[560,960],   /* head width on screen / in the PNG, PNG size, anchor in the PNG */
    BLOCK:{rx:42,ry:14,dx:0,dy:-6},   /* blocker ellipse around the seat / klot (world px), the hero can walk right up to it */
    NAME:'หลวงตาสุริ',TAG_DY:20,TAG_COL:'#ffd36b',TALK_R:110,
    LINE:'ไว้ค่อยคุยกันนะ',
    HAZE_CUT:20}};   /* the PNG carries a faint grey haze (alpha 14-17 of 255) over the whole square: alpha <= HAZE_CUT is cleared at load (0 = keep the PNG exactly as is) */
if(!MK.on)return;
try{
if(typeof drawMerchant!=='function'||typeof interact!=='function'||typeof update!=='function'||typeof NPCS==='undefined')throw new Error('game hooks missing');
const CF=MK.cfg;
const IMG=new Image();IMG.decoding='async';IMG.src='assets/b5e00bba95eeac8c.webp';
let SPR=null;
function sprite(){if(SPR)return SPR;if(!IMG.complete||!IMG.naturalWidth)return null;const c=document.createElement('canvas');c.width=IMG.naturalWidth;c.height=IMG.naturalHeight;const g=c.getContext('2d');g.drawImage(IMG,0,0);
  if(CF.HAZE_CUT>0){const d=g.getImageData(0,0,c.width,c.height),a=d.data;for(let i=3;i<a.length;i+=4)if(a[i]<=CF.HAZE_CUT)a[i]=0;g.putImageData(d,0,0)}return SPR=c}
const wpx=()=>CF.SRC*CF.HEAD_PX/CF.HEAD_SRC_PX;   /* drawn width/height of the whole picture in world px */
function drawMonk(n){const S=sprite();if(!S)return;const w=wpx(),ax=CF.ANCH[0]/CF.SRC*w,ay=CF.ANCH[1]/CF.SRC*w;
  ctx.drawImage(S,n.x-ax,n.y-ay,w,w);MK.stats.drawn++;
  ctx.save();ctx.font='bold 12px Sarabun,sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='rgba(20,16,30,.85)';ctx.strokeText(CF.NAME,n.x,n.y+CF.TAG_DY);ctx.fillStyle=CF.TAG_COL;ctx.fillText(CF.NAME,n.x,n.y+CF.TAG_DY);ctx.restore()}
{const o=drawMerchant;drawMerchant=function(n){if(n&&n.kind==='monk'){try{drawMonk(n)}catch(e){MK.err='draw '+e.message}return}return o.apply(this,arguments)}}
MK.npc={x:CF.X,y:CF.Y,n:CF.NAME,kind:'monk',id:'npc_monk_suri'};
const PUSHED=new WeakSet();MK.stats.cleared=0;MK.stats.distinct=0;
function clearMonsters(){if(!(CF.CLEAR_R>0)||G.zone!==CF.ZONE||typeof enemies==='undefined')return;const R=CF.CLEAR_R,M=MK.npc,Z=ZONES[CF.ZONE];
  for(const e of enemies){if(!e||e.dead||e.hp<=0)continue;let dx=e.x-M.x,dy=e.y-M.y,d=Math.hypot(dx,dy);if(d>=R)continue;if(d<1){dx=1;dy=0;d=1}
    const k=(R+8)/d;e.x=Math.max(30,Math.min(Z.w-30,M.x+dx*k));e.y=Math.max(30,Math.min(Z.h-30,M.y+dy*k));e.vx=0;e.vy=0;e.aggro=false;MK.stats.cleared++;if(!PUSHED.has(e)){PUSHED.add(e);MK.stats.distinct++}}}
/* runs every game update (not on a timer): no monster can walk inside the radius between two checks */
function ensure(){try{const here=G.zone===CF.ZONE&&G.state==='play',i=NPCS.indexOf(MK.npc);if(here&&i<0)NPCS.push(MK.npc);else if(!here&&i>=0)NPCS.splice(i,1)}catch(e){MK.err='ensure '+e.message}}
setInterval(ensure,250);
/* blocker: push the hero out of a small ellipse around the klot / seat */
{const o=update;update=function(){const r=o.apply(this,arguments);try{clearMonsters()}catch(e){MK.err='clear '+e.message}try{if(G.zone===CF.ZONE&&P&&!P.dead){const B=CF.BLOCK,bx=MK.npc.x+B.dx,by=MK.npc.y+B.dy;let dx=P.x-bx,dy=P.y-by;const e=(dx/B.rx)*(dx/B.rx)+(dy/B.ry)*(dy/B.ry);
    if(e<1){if(e<1e-6){dx=0;dy=B.ry}const k=Math.sqrt((dx/B.rx)*(dx/B.rx)+(dy/B.ry)*(dy/B.ry));P.x=bx+dx/k;P.y=by+dy/k;MK.stats.pushed++}}}catch(er){MK.err='block '+er.message}return r}}
/* talk (r4): dialogue window with the monk's portrait. Same look as the game's own story dialogue box (#qDlg: dark panel, gold border, gold name, portrait at the left, next button);
   that box and its CSS exist only while the story chapters are live, so this is a self-contained copy of the style. 6 portraits (N2_face 1 calm .. 6 laugh), default = calm. Lines are TEST lines in MONK.cfg.LINES. */
const FACES=["assets/7e98a1e1a48f5ba9.webp","assets/2a75241d453372e3.webp","assets/4a68f8f70e293817.webp","assets/fd70f74316362e22.webp","assets/1144315277e2efff.webp","assets/83f7c430af2e457e.webp"];
CF.LINES=[
  {face:0,text:'สวัสดีโยม นั่งพักใต้ร่มก่อนก็ได้นะ วันนี้อากาศดี'},
  {face:1,text:'อาตมาชื่อสุริ เป็นแค่พระเฒ่าขาเจ็บ มานั่งผึ่งแดดอยู่ตรงนี้เอง'},
  {face:2,text:'แต่ทางข้างหน้าไม่ใช่ทุ่งสบายๆ นะโยม ระวังตัวให้ดี'},
  {face:3,text:'อ้าว! แสงในตัวโยมสว่างขนาดนี้ อาตมาเห็นแล้วตกใจเลย'},
  {face:4,text:'ศิษย์คนหนึ่งของอาตมาหายเข้าไปในหมอกนานแล้ว... คิดถึงเหมือนกัน'},
  {face:5,text:'ฮ่าๆ ช่างเถอะ! (ข้อความทดสอบ ไว้ค่อยคุยกันนะโยม)'}];
CF.LINE=CF.LINES[0].text;
const css=document.createElement('style');css.textContent='#monkDlg{position:fixed;left:50%;bottom:150px;transform:translateX(-50%);width:min(640px,92vw);z-index:80;background:rgba(18,16,30,.92);border:2px solid #d9b65c;border-radius:12px;padding:10px 14px 8px 124px;min-height:140px;box-sizing:border-box;color:#fff6e0;font:15px/1.55 Sarabun,sans-serif;box-shadow:0 4px 18px rgba(0,0,0,.45);cursor:pointer;user-select:none;display:none}'
 +'#monkDlg img.pf{position:absolute;left:10px;bottom:8px;width:100px;height:126px;border-radius:10px;background:radial-gradient(#fff6dc,#e8d9b0);border:1px solid #d9b65c;object-fit:contain}'
 +'#monkDlg .mkn{font-weight:700;color:#ffd36b;font-size:14px;margin-bottom:2px}#monkDlg .mkt{min-height:2.9em;white-space:pre-line}'
 +'#monkDlg .mkc{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}#monkDlg .mkc button{flex:1;min-width:120px;padding:8px 10px;border-radius:8px;border:1px solid #d9b65c;background:#2a2440;color:#fff6e0;font:600 14px Sarabun,sans-serif;cursor:pointer}#monkDlg .mkx{text-align:right;font-size:12px;color:#c9b98a;margin-top:4px}'
 +'@media (hover:none),(max-width:520px){#monkDlg{bottom:120px;font-size:14px;padding-left:84px;min-height:104px}#monkDlg img.pf{width:68px;height:86px}}';document.head.appendChild(css);
const dlg=document.createElement('div');dlg.id='monkDlg';dlg.innerHTML='<img class="pf" alt=""><div class="mkn"></div><div class="mkt"></div><div class="mkx"></div>';document.body.appendChild(dlg);
let li=-1,LINES=CF.LINES,END=null,CHS=null,GUARD=true;const open=()=>dlg.style.display==='block';
const chBox=document.createElement('div');chBox.className='mkc';dlg.appendChild(chBox);
const close=()=>{dlg.style.display='none';li=-1;chBox.innerHTML=''};
function show(i){const q=LINES[i];if(!q){finish();return}li=i;chBox.innerHTML='';const im=dlg.querySelector('img.pf'),f=q.face>=0?(FACES[q.face|0]||FACES[0]):null;
  if(f){im.src=f;im.style.display='block';dlg.style.paddingLeft=''}else{im.style.display='none';dlg.style.paddingLeft='16px'}
  dlg.querySelector('.mkn').textContent=(q.who||CF.NAME)+(!q.who&&MK.sub?'  ·  '+MK.sub():'');dlg.querySelector('.mkt').textContent=q.text;
  dlg.querySelector('.mkx').textContent=(i<LINES.length-1?'ต่อไป ▸ ':CHS?'':'ปิด ✕ ')+(LINES.length>1?(i+1)+'/'+LINES.length:'');dlg.style.display='block';MK.face=q.face|0;
  if(i===LINES.length-1&&CHS){for(const c of CHS){const b=document.createElement('button');b.type='button';b.textContent=c.label;b.addEventListener('click',e=>{e.stopPropagation();const fn=c.fn;close();if(fn)fn()});chBox.appendChild(b)}}}
function finish(){const e=END;END=null;CHS=null;close();if(e)try{e()}catch(er){MK.err='end '+er.message}}
const next=()=>{if(li<0)return;if(li>=LINES.length-1){if(CHS)return;finish()}else show(li+1)};
dlg.addEventListener('click',e=>{e.stopPropagation();next()});
for(const ty of ['pointerdown','mousedown','touchstart'])dlg.addEventListener(ty,e=>e.stopPropagation());
addEventListener('keydown',e=>{if(!open())return;if(e.key==='Escape'){CHS=null;if(!GUARD)finish();else{END=null;close()}e.stopImmediatePropagation();return}if(e.key==='Enter'||e.key===' '){next();e.preventDefault();e.stopImmediatePropagation()}},true);
/* MK.say(lines,{onEnd,choices}): lines = [{face:0-5 (-1 = narration, no portrait),text,who?}] ; choices = [{label,fn}] shown on the last line */
MK.say=(ls,o)=>{LINES=ls&&ls.length?ls:CF.LINES;END=o&&o.onEnd||null;CHS=o&&o.choices||null;GUARD=!(o&&o.free);show(0)};MK.isOpen=open;MK.closeDlg=()=>{CHS=null;END=null;close()};
function talk(){if(open()){next();return}MK.stats.talks++;if(typeof MK.onTalk==='function'){try{MK.onTalk();return}catch(er){MK.err='onTalk '+er.message}}MK.say(CF.LINES)}
setInterval(()=>{try{if(open()&&GUARD&&(G.zone!==CF.ZONE||!P||Math.hypot(P.x-MK.npc.x,P.y-MK.npc.y)>CF.TALK_R*1.8))close()}catch(_){}},300);
{const o=interact;interact=function(){const it=G.interact;if(it&&it.k==='npc'&&it.n&&it.n.kind==='monk'&&G.state==='play'){talk();return true}return o.apply(this,arguments)}}
if(typeof npcPrompt==='function'){const o=npcPrompt;npcPrompt=function(n){return n&&n.kind==='monk'?'คุยกับ '+CF.NAME:o.apply(this,arguments)}}
MK.talk=talk;MK.sprite=sprite;MK.ok=true;
}catch(e){MK.err=e.message;MK.ok=false}
})();
