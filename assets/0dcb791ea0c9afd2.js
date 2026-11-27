
/* scythe_combo_r4 combo.js (Motion + Art, DeaRz approved 12 Nov) */
// Scythe combo r3 = DeaRz reference clip (staff kata, 226 frames @30 ms = 6.78 s) transcribed beat by beat. r3b: cut at clip frame 156 by DeaRz.
// All keys are written in CLIP FRAME numbers, so every pose can be checked against the clip. World aim: 0 up, 270 forward, 180 down, 90 back.
(function(){
var U=window.PUPPET, K=U.WEAPON_KF, FT=0.03;
function E(x){return x<0?0:x>1?1:x*x*(3-2*x);}
function key(keys,q){ if(!keys) return 0; for(var i=1;i<keys.length;i++){ if(q<=keys[i][0]){ var a=keys[i-1],b=keys[i],u=E((q-a[0])/((b[0]-a[0])||1)); return a[1]+(b[1]-a[1])*u; } } return keys[keys.length-1][1]; }
// track builder: items are [frame,value] or {lin:[fa,fb,va,vb]} (constant-speed segment, dense keys)
function mk(F0,F1){ function Q(f){ return (f-F0)/(F1-F0); }
  function tr(items){ var o=[]; items.forEach(function(it){ if(it.lin){ var l=it.lin, n=Math.max(1,Math.round((l[1]-l[0])*2)); for(var i=0;i<=n;i++){ var u=i/n; o.push([Q(l[0]+(l[1]-l[0])*u), l[2]+(l[3]-l[2])*u]); } } else o.push([Q(it[0]),it[1]]); });
    if(o[0][0]>0) o.unshift([0,o[0][1]]); if(o[o.length-1][0]<1) o.push([1,o[o.length-1][1]]); return o; }
  return {Q:Q,tr:tr}; }
function build(d){ var m=mk(d.F0,d.F1), tr=m.tr, legN=[], legF=[], ftN=[], ftF=[];
  d.stance.forEach(function(s){ legN.push([s[0],s[1]]); legF.push([s[0],s[2]]); ftN.push([s[0],-0.85*s[1]]); ftF.push([s[0],-0.85*s[2]]); });
  var torso=tr(d.torso), head=torso.map(function(k){ return [k[0],-0.6*k[1]]; });
  var keys={torso:torso,head:head,leg_near:tr(legN),leg_far:tr(legF),foot_near:tr(ftN),foot_far:tr(ftF)};
  if(d.elbowN) keys.forearm_near=tr(d.elbowN); if(d.elbowF) keys.forearm_far=tr(d.elbowF);
  var sc={};
  function rg(a){ return (a||[]).map(function(r){ return [m.Q(r[0]),m.Q(r[1]),r[2]]; }); }
  return {fx:d.fx,name:d.name,F0:d.F0,F1:d.F1,dur:(d.F1-d.F0)*FT,hits:d.hits.map(m.Q),hitF:d.hits,
    env:{solo:tr(d.envSolo),chain:tr(d.envChain)},
    world:{arm_near:tr(d.armN),'sword@fist_near':tr(d.aim),arm_far:tr(d.armF)},keys:keys,sc:sc,
    reachN:tr(d.reachN||[[d.F0,0]]),reachF:tr(d.reachF||[[d.F0,0]]),lunge:tr(d.lunge),hop:tr(d.hop||[[d.F0,0]]),turn:tr(d.turn),over:rg(d.over),holds:rg(d.holds),beats:d.beats}; }
// R = clip transcription per old set (R[2] kept as backup, not used since DeaRz 12 Nov 03:52)
var R={
 1:({name:'ชุดที่ 1 กวาดรอบเอว ควงเหนือหัว ฟาดลงต่ำ',F0:0,F1:46,hits:[7,9,20,25,29,36],
  fx:{7:['spin'],9:['spin'],20:['none'],25:['twirl'],29:['twirl'],36:['slam']},
  envSolo:[[0,0],[2,1],[42,1],[46,0]],envChain:[[0,0],[2,1],[46,1]],
  armN:[[0,190],[3,215],[5,215],[11,225],[12,270],[14,330],[16,40],[17,42],[19,285],[20,238],[21,236],[22,8],[33,8],[36,240],[46,240]],
  armF:[[0,185],[3,205],[11,215],[12,225],[14,300],[16,25],[17,25],[19,255],[20,225],[21,225],[22,200],[33,200],[36,232],[46,232]],
  aim:[[0,30],[3,268],[11,268],[12,360],[14,420],[16,485],[17,492],{lin:[17,20,492,250]},[21,262],[22,270],{lin:[22,33,270,990]},[36,988],[46,988]],
  reachN:[[0,0],[13,0],[15,150],[17,160],[18.6,0],[20,0],[22,200],[33,200],[36,0],[46,0]], reachF:[[0,0],[13,0],[15,130],[17,140],[18.6,0],[46,0]], over:[[13.6,18.6],[21.3,34]],
  torso:[[0,0],[3,10],[11,8],[12,-2],[16,-14],[17,-14],[20,16],[21,14],[22,-4],[33,-4],[36,16],[46,14]],
  stance:[[0,0,0],[3,30,-30],[11,30,-30],[12,10,-10],[16,22,-22],[17,22,-22],[20,52,-52],[21,52,-52],[22,6,-6],[33,6,-6],[36,58,-58],[46,58,-58]],
  turn:[[0,0],[5,0],{lin:[5,11,0,360]},[46,360]], holds:[[5,11,'chest']],
  lunge:[[0,0],[17,-4],[20,-16],[36,-22],[46,-22]],
  beats:[[0,5,'ย่อตัว เคียวลงขนานพื้น'],[5,11,'หมุนตัวกวาดรอบเอว 1 รอบ'],[11,12,'ตั้งเคียวตรงหน้า'],[12,17,'ง้างเคียวข้ามหัวไปจนถึงข้างหลัง (DeaRz สั่งแก้)'],[17,21,'ฟาดกลับมาข้างหน้า ดาเมจลงเฟรม 20'],[21,34,'ยืนตรง ชูแขน ควงเคียวเหนือหัว 2 รอบ'],[34,46,'ทรุดตัวฟาดลง ค้างท่าต่ำ']]}),
 2:({name:'ชุดที่ 2 ฟันเฉียงขึ้น ชูเหนือหัว กวาดต่ำต่อเนื่อง',F0:46,F1:118,hits:[49,53,55,73,75,89,92,95,104,108,112],
  fx:{49:['arc',-0.6],53:['spin'],55:['spin'],73:['ring'],75:['ring'],89:['arc',0.5],92:['ring'],95:['ring'],104:['ring'],108:['ring'],112:['thrust']},
  envSolo:[[46,0],[48,1],[112,1],[118,0]],envChain:[[46,1],[118,1]],
  armN:[[46,240],[50,330],[51,255],[56,255],[58,225],[61,225],[64,10],[70,10],[71,225],[76,225],[78,335],[82,335],[86,300],[90,240],[91,225],[101,228],[110,225],[112,262],[113,262],[118,250]],
  armF:[[46,232],[50,200],[51,240],[56,240],[58,250],[61,250],[64,352],[70,352],[71,210],[76,210],[78,200],[82,200],[86,240],[90,235],[118,235]],
  aim:[[46,268],[50,325],[51,270],[56,270],[58,266],[61,266],[64,270],[70,270],[71,268],[76,268],[78,385],[82,385],[86,270],[90,238],[91,268],[101,272],[110,268],[112,270],[113,270],[118,300]],
  reachN:[[46,0],[48,190],[50,190],[51,0],[62,0],[64,200],[70,200],[71,0],[77,0],[78,190],[82,190],[86,0],[118,0]],
  reachF:[[46,0],[62,0],[64,200],[70,200],[71,0],[118,0]], over:[[47.3,50.6],[63,70.6],[77.3,84]],
  elbowN:[[46,0],[57,0],[58,95],[61,95],[63,0],[118,0]],
  torso:[[46,14],[50,-8],[51,4],[56,4],[58,16],[61,16],[64,0],[70,0],[71,14],[76,14],[78,6],[82,6],[90,18],[101,16],[110,14],[112,20],[118,10]],
  stance:[[46,58,-58],[50,18,-18],[56,20,-20],[58,55,-55],[61,55,-55],[64,38,-38],[70,38,-38],[71,50,-50],[76,50,-50],[78,60,-70],[82,60,-70],[90,56,-62],[101,55,-55],[110,52,-52],[112,62,-40],[118,45,-45]],
  turn:[[46,0],[51,0],{lin:[51,56,0,360]},[70,360],{lin:[71,76,360,720]},[90,720],{lin:[91,96,720,1080]},[101,1080],{lin:[102,110,1080,1800]},[118,1800]],
  holds:[[51,56,'chest'],[71,76,'low'],[91,96,'low'],[102,110,'low']],
  lunge:[[46,-22],[112,-40],[118,-40]],
  beats:[[46,51,'ลุกขึ้นฟันเฉียงขึ้น'],[51,57,'หมุนตัวกวาดระดับอก 1 รอบ'],[57,62,'ย่อต่ำ พาดเคียวบนไหล่'],[62,71,'ยืนกางขา ชูเคียวขนานพื้นเหนือหัว'],[71,77,'หมุนตัวกวาดต่ำ 1 รอบ'],[77,84,'คุกเข่า ชูเคียวเฉียงขึ้น'],[84,91,'หมุนเคียวข้ามไหล่ ฟันเฉียงลง'],[91,97,'หมุนตัวกวาดต่ำ'],[97,102,'ค้างท่าต่ำ เคียวขนานพื้น'],[102,111,'หมุนตัวกวาดต่ำ 2 รอบ'],[111,118,'แทงตรงข้างหน้า']]}),
 3:({name:'ชุดที่ 3 ควงฟาด กระโดดหมุนกลางอากาศ',F0:130,F1:166,hits:[141,143,145,150,152,155],
  fx:{141:['arc',0.6],143:['ring'],145:['ring'],150:['spin'],152:['spin'],155:['slam']},
  // DeaRz 12 Nov: clip cut at frame 156 (kneel plant + long recover removed). 156-166 = short recover added by Motion, not in the clip.
  envSolo:[[118,0],[120,1],[156,1],[166,0]],envChain:[[118,1],[156,1],[166,0]],
  armN:[[118,250],[122,250],[126,250],[130,262],[134,8],[141,8],[143,230],[146,225],[148,10],[150,10],[153,255],[156,225],[166,200]],
  armF:[[118,235],[126,225],[134,352],[141,352],[143,225],[146,210],[148,350],[150,350],[153,240],[156,216],[166,190]],
  aim:[[118,300],[122,360],[126,360],[130,300],[134,360],[136,315],[138,285],{lin:[138,141,285,645]},[143,595],[144,628],[147,628],[148,630],[156,628],[166,630]],
  reachN:[[118,0],[133,0],[134,200],[141,200],[143,0],[147,0],[148,200],[150,200],[152,0],[166,0]],
  reachF:[[118,0],[133,0],[134,200],[141,200],[143,0],[147,0],[148,200],[150,200],[152,0],[166,0]], over:[[133.3,141.8],[147.3,150.8]],
  torso:[[118,10],[122,4],[126,4],[134,-4],[141,-4],[143,14],[146,12],[148,-6],[152,0],[156,16],[166,0]],
  stance:[[118,45,-45],[122,40,-50],[126,40,-50],[134,8,-8],[141,8,-8],[143,45,-45],[146,45,-45],[148,14,-20],[152,-10,16],[156,58,-58],[166,0,0]],
  turn:[[118,0],[143,0],{lin:[143,147,0,360]},[150,360],{lin:[150,156,360,1080]},[166,1080]],
  holds:[[143,147,'low'],[150,153,'over'],[153,156,'low']],
  hop:[[118,0],[147,0],[148,40],[150,95],[152,80],[154,30],[155,0],[166,0]],
  lunge:[[130,-40],[156,-50],[166,-40]],
  beats:[[130,133,'เริ่มที่เฟรม 130 เอียงเคียวชี้ไปหน้า (DeaRz ตัด 118-129)'],[133,139,'ยืนตรง ชูเคียวเหนือหัวสองมือ'],[139,143,'ควงเหนือหัว 1 รอบ แล้วฟันเฉียงลง'],[143,147,'หมุนตัวกวาดต่ำ'],[147,153,'กระโดด ชูเคียว หมุนตัวกลางอากาศ'],[153,156,'ลงพื้นหมุนต่ำ (จบคลิปที่เฟรม 156)'],[156,166,'ลุกกลับท่ายืน (เติมเอง ไม่มีในคลิป)']]})
};
function ext(a,b){ var o={}, k; for(k in a) o[k]=a[k]; for(k in b) o[k]=b[k]; return o; }
function clipBeats(bs,f0,f1){ return bs.filter(function(b){return b[1]>f0&&b[0]<f1;}).map(function(b){return [Math.max(b[0],f0),Math.min(b[1],f1),b[2]];}); }
// DeaRz 12 Nov 03:52: combo = 3 clicks. click 1 = old set 1 frames 1-21, click 2 = old set 1 frames 22-45, click 3 = set 3 (flying wave at 141 removed)
var D={
 1:ext(R[1],{name:'คลิก 1 กวาดรอบเอว ง้างข้ามหัวแล้วฟาด',F0:1,F1:20,hits:[7,9,19.7],fx:{7:['spin'],9:['spin'],19.7:['none']},beats:clipBeats(R[1].beats,1,20)}),
 2:ext(R[1],{name:'คลิก 2 ควงเหนือหัว 2 รอบ ฟาดลงต่ำ',F0:22,F1:45,hits:[25,29,36],fx:{25:['twirl'],29:['twirl'],36:['slam']},beats:clipBeats(R[1].beats,22,45)}),
 3:ext(R[3],{name:'คลิก 3 ควงฟาด กวาดต่ำ กระโดดหมุน',fx:ext(R[3].fx,{141:['none']})})};
// lead = 8-frame lead-in from idle; rec = 10-frame recover to idle (click 3 has its own recover); shift = start the lunge at 0
var PRE=8, POST=10, HOLD={1:20,2:45,3:156};
function lunAt(L,f){ if(f<=L[0][0]) return L[0][1]; for(var i=1;i<L.length;i++) if(f<=L[i][0]){ var a=L[i-1],b=L[i]; return a[1]+(b[1]-a[1])*(f-a[0])/(b[0]-a[0]); } return L[L.length-1][1]; }
function variant(d,n,lead,rec,shift){ var s=ext(d,{}), own=n===3, pre=lead?PRE:0, post=(rec&&!own)?POST:0, l0=shift?lunAt(d.lunge,d.F0):0;
  s.F0=d.F0-pre; s.F1=d.F1+post;
  var e=lead?[[s.F0,0],[d.F0,1]]:[[d.F0,1]]; e.push([HOLD[n],1]); if(own) e.push([d.F1,0]); else e.push([s.F1,post?0:1]); s.envSolo=e; s.envChain=e;
  s.lunge=[[d.F0,lunAt(d.lunge,d.F0)-l0]].concat(d.lunge.filter(function(k){return k[0]>d.F0;}).map(function(k){return [k[0],k[1]-l0];}));
  s.beats=(lead?[[s.F0,d.F0,'เริ่มจากท่ายืน']]:[]).concat(d.beats); if(post) s.beats=s.beats.concat([[d.F1,s.F1,'กลับท่ายืน']]);
  return s; }
var C={}, S={};
for(var n=1;n<=3;n++) S[n]=build(variant(D[n],n,true,true,true));
C[1]=build(variant(D[1],1,true,false,false)); // chained click 2 starts at frame 20 so the 20->22 raise is not skipped
C[2]=build(variant(ext(D[2],{F0:20,beats:clipBeats(R[1].beats,20,45)}),2,false,true,false)); C[3]=build(variant(D[3],3,true,true,true));
window.COMBO=C; window.COMBO_SOLO=S;
window.comboDef=function(n,mode){ return mode==='solo'?S[n]:C[n]; };
for(var n in C){ K['scythe_c'+n]={dur:C[n].dur,hits:C[n].hits,env:C[n].env.chain,world:C[n].world,keys:C[n].keys,sc:C[n].sc}; K['scythe_s'+n]={dur:S[n].dur,hits:S[n].hits,env:S[n].env.solo,world:S[n].world,keys:S[n].keys,sc:S[n].sc}; }
function inR(rs,q){ for(var i=0;i<rs.length;i++) if(q>=rs[i][0]&&q<rs[i][1]) return rs[i]; return null; }
window.comboPose=function(n,q,mode){ var so=mode==='solo', c=so?S[n]:C[n], id=(so?'scythe_s':'scythe_c')+n;
  var p=U.pose(id, q*c.dur, {dur:c.dur});
  p.off=p.off||{}; var rn=key(c.reachN,q), rf=key(c.reachF,q); if(rn) p.off.fist_near=[0,rn]; if(rf) p.off.fist_far=[0,rf]; p.lunge=key(c.lunge,q); p.air=(p.air||0)+key(c.hop,q); p.turn=key(c.turn,q);
  var h=inR(c.holds,q); p.hold=h?h[2]:'chest'; p.over=!!inR(c.over,q); p.swordBack=false; p.q=q; p.hit=n; p.frame=c.F0+q*(c.F1-c.F0);
  var w=0.7/(c.F1-c.F0); p.strike=c.hits.some(function(x){return Math.abs(q-x)<w;});
  var b=null; c.beats.forEach(function(x){ if(p.frame>=x[0]&&p.frame<x[1]) b=x[2]; }); p.beat=b||'';
  return p; };
// f = uniform speed factor (1 = clip speed)
window.comboQ=function(n,t,f,mode){ return Math.min(1,t*f/comboDef(n,mode).dur); };
window.comboTotal=function(n,f,mode){ return comboDef(n,mode).dur/f; };
})();

