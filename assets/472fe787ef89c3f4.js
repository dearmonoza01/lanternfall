
/* ---- r254 NPCAFF254 (TEST ONLY). DeaRz 26 Nov 14:05 BKK (via coordinator, screenshot of ปู่ฟอน): "NPC ที่ให้ของขวัญได้ จะมีค่าความชอบโชว์ว่าได้กี่แต้มแล้ว
   เมื่อกดให้ของขวัญจะมีอิโมจิหัวใจขึ้นบนหัว และแต้มเพิ่ม และเพิ่มกล่องข้อความหน้ายิ้มแล้วขอบคุณนะ ในแต่ละแบบของตัว NPC".
   1) every gift NPC (CH1Q NPC with affinity) shows "❤ v/100" (this character's points) under its name tag when the hero is within 260 px,
      and in the talk / gift window next to the name.
   2) a gift that counts: a ❤ rises from the NPC's head with "+N" (the points really gained, +1 / +3 by the existing CH1Q rules), the number updates at once.
   3) a speech bubble over the NPC: 😊 + a thank-you line in that NPC's voice (warmer line for a liked gift); the same line replaces the generic thank-you in the dialogue.
      Lines = DRAFT (Code 26 Nov), listed in README_r254.md for DeaRz to change. Daily cap reached = the existing refusal, no heart, no bubble.
   Off: ?npcaff=off. Debug: window.NPCAFF254 ---- */
(function(){'use strict';
const X=window.NPCAFF254={ver:'npcaff-r254',on:!/[?&]npcaff=off\b/.test(String(location.search)),err:null,cur:null,fx:[],stats:{gifts:0,tags:0},cfg:{near:260,tagDy:34,headDy:78,heartSec:1.6,bubbleSec:3.4}};
if(!X.on)return;
const ERR=(w,e)=>{X.err=w+': '+((e&&e.message)||e);try{console.error('[NPCAFF254]',w,e)}catch(_){}};
/* thank-you lines [normal, liked] (draft) */
X.lines={
 npc_ora:['ขอบใจนะเจ้า ยายจะเก็บไว้ข้างตะเกียง','โอ้... ของที่ยายชอบเลย เจ้านี่ใจดีจริง ๆ'],
 npc_mali:['ขอบใจจ้ะ ข้าจะวางไว้หน้าร้านเลย','ว้าย ของโปรดข้าเลย รู้ใจข้าจริง ๆ นะเจ้า'],
 npc_ferro:['อืม ขอบใจ เดี๋ยวข้าหาที่ใช้ให้','ฮ่า! ของดีแบบนี้ข้าชอบนัก ขอบใจมาก'],
 npc_astoria_trainer:['ขอบใจ ซ้อมต่ออย่าให้ขาดล่ะ','ของชิ้นนี้ข้าชอบเลย ศิษย์ดีจริง ๆ!'],
 npc_astoria_gardener:['ขอบใจนะ ข้าจะเอาไปวางข้างแปลงดอกไม้','ดอกไม้กับสมุนไพรแบบนี้แหละที่ข้าชอบ ขอบใจมากนะเจ้า'],
 npc_traveler_m4:['ขอบใจ ระหว่างทางข้าคงได้ใช้','ของที่ข้าอยากได้พอดีเลย ขอบใจมากนะ!'],
 npc_beggar_reaper:['...ขอบใจ ข้าจะไม่ลืมน้ำใจนี้','ของกินอุ่น ๆ... ข้าชอบนัก ขอบใจเจ้ามาก'],
 npc_demon_wounded:['ฮึ่ม... ขอบใจ มนุษย์','ของถูกใจข้า... เจ้าไม่เลวเลยนะ มนุษย์'],
 npc_pip:['ขอบคุณครับ! ข้าจะเก็บไว้อย่างดี','ว้าว ของที่ข้าชอบที่สุดเลย ขอบคุณครับ!'],
 npc_pell:['ขอบใจนะ เจ้านี่ใจดีจริง','ของชิ้นนี้ข้าชอบมากเลย ขอบใจ!'],
 npc_mira:['ขอบคุณนะ มิราจะเก็บไว้อย่างดี','ของที่มิราชอบเลย! ขอบคุณมาก ๆ นะ'],
 npc_hark:['ขอบใจ จะใช้ให้คุ้ม','ของดีแบบนี้แหละที่ข้าชอบ ขอบใจมาก']};
const api=()=>window.CH1Q&&CH1Q.api;
const now=()=>performance.now()/1000;
function giftable(n){try{if(!n||n.affinity===false||!n.at)return false;const A=api();if(n.affGate){const f=A.flags&&A.flags();if(!f||!f[n.affGate])return false}return true}catch(_){return false}}
function val(id){try{return api().aff(id)|0}catch(_){return 0}}
X.val=val;
/* called from the patched giftMenu after affAdd: returns the dialogue line */
X.gift=(n,got,liked)=>{try{const L=X.lines[n.id]||['ขอบใจนะ','ของที่ข้าชอบเลย ขอบใจมาก!'],line=L[liked?1:0];const t=now();
  X.fx.push({k:'heart',id:n.id,t0:t,got});X.fx.push({k:'bub',id:n.id,t0:t,line});X.stats.gifts++;X.cur=n.id;setTimeout(nameTag,30);return line}catch(e){ERR('gift',e);return null}};
/* world drawing: tags, hearts, bubbles */
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath()}
function draw(){const A=api();if(!A||!A.NPC||typeof G==='undefined'||G.state!=='play'||typeof P==='undefined'||!P)return;const c=ctx,t=now();c.save();
 if(window.AFFMAP266&&!AFFMAP266.on){}else for(const id in A.NPC){const n=A.NPC[id];if(!giftable(n)||n.at.zone!==G.zone)continue;if(Math.hypot(P.x-n.at.x,P.y-n.at.y)>X.cfg.near)continue;
  const s='❤ '+val(id)+'/100';c.font='800 11px system-ui,"Noto Sans Thai",sans-serif';const w=c.measureText(s).width+12,x=n.at.x-w/2,y=n.at.y+X.cfg.tagDy-8;
  c.globalAlpha=.9;c.fillStyle='rgba(40,16,26,.78)';rr(c,x,y,w,16,8);c.fill();c.strokeStyle='rgba(255,150,180,.8)';c.lineWidth=1;c.stroke();c.globalAlpha=1;c.fillStyle='#ffd0de';c.textAlign='center';c.textBaseline='middle';c.fillText(s,n.at.x,y+8.5);X.stats.tags++}
 for(let i=X.fx.length-1;i>=0;i--){const f=X.fx[i],n=A.NPC[f.id],age=t-f.t0;if(!n||!n.at||n.at.zone!==G.zone){if(age>4)X.fx.splice(i,1);continue}
  if(f.k==='heart'){const D=X.cfg.heartSec;if(age>D){X.fx.splice(i,1);continue}const u=age/D,hx=n.at.x+Math.sin(age*5)*4,hy=n.at.y-X.cfg.headDy-u*46,sc=age<.18?.4+age/.18*.75:1.15-u*.25;
   c.globalAlpha=Math.min(1,(1-u)*1.6);c.font=Math.round(26*sc)+'px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('❤️',hx,hy);
   c.font='900 15px system-ui,sans-serif';c.lineWidth=3;c.strokeStyle='rgba(60,10,25,.85)';c.fillStyle='#ff8fb0';const ps='+'+f.got;c.strokeText(ps,hx+22,hy+2);c.fillText(ps,hx+22,hy+2);c.globalAlpha=1}
  else if(f.k==='bub'){const D=X.cfg.bubbleSec;if(age>D){X.fx.splice(i,1);continue}const a=Math.min(1,age/.18,(D-age)/.35);const s='😊 '+f.line;c.font='700 12px system-ui,"Noto Sans Thai",sans-serif';const w=Math.min(260,c.measureText(s).width+18),h=26,bx=n.at.x-w/2,by=n.at.y-X.cfg.headDy-28-h-(1-Math.min(1,age/.18))*6;
   c.globalAlpha=a;c.fillStyle='rgba(255,252,240,.97)';rr(c,bx,by,w,h,9);c.fill();c.strokeStyle='#8a5a2a';c.lineWidth=1.5;c.stroke();c.beginPath();c.moveTo(n.at.x-6,by+h-.5);c.lineTo(n.at.x+6,by+h-.5);c.lineTo(n.at.x,by+h+8);c.closePath();c.fillStyle='rgba(255,252,240,.97)';c.fill();c.beginPath();c.moveTo(n.at.x-6,by+h);c.lineTo(n.at.x,by+h+8);c.lineTo(n.at.x+6,by+h);c.stroke();
   c.fillStyle='#3a2410';c.textAlign='center';c.textBaseline='middle';c.fillText(s,n.at.x,by+h/2+.5,w-10);c.globalAlpha=1}}
 c.restore()}
try{const _o=drawEditorOverlay;drawEditorOverlay=function(){const r=_o.apply(this,arguments);try{draw()}catch(e){ERR('draw',e)}return r}}catch(e){ERR('hook',e)}
/* name in the talk / gift window: "ปู่ฟอน ❤ 12/100" */
function nameTag(){try{const d=document.getElementById('qDlg');if(!d)return;const nm=d.querySelector('.nm');if(!nm)return;const A=api();if(!A)return;
  let sp=nm.querySelector('.af254');const n=X.cur&&A.NPC[X.cur];const base=(nm.firstChild&&nm.firstChild.nodeType===3)?nm.firstChild.nodeValue.trim():'';
  if(!n||!giftable(n)||base!==n.name){if(sp)sp.remove();return}
  const s='❤ '+val(n.id)+'/100';if(!sp){sp=document.createElement('span');sp.className='af254';sp.style.cssText='margin-left:10px;padding:1px 8px;border-radius:9px;background:rgba(255,120,160,.18);border:1px solid rgba(255,150,180,.6);color:#ffc4d6;font-size:.82em;font-weight:800';nm.appendChild(sp)}
  if(sp.textContent!==s)sp.textContent=s}catch(e){ERR('nameTag',e)}}
setInterval(nameTag,200);
})();

