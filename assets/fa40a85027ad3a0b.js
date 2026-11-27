
window.__FZ8A={"orb": "assets/586745b9ead317d2.png", "beam": "assets/fd2bae16ea967191.png", "ripple": "assets/ccb8c0f5f5ce0239.png", "swirl": "assets/02340f46c8320fa7.png", "glow": "assets/2ccfc7f649bc36fc.png", "lava": "assets/d0a51169784cabc6.jpg", "shock": "assets/bca4e49f163c5937.png", "scorch": "assets/ac2ae28db5efaf24.png", "flA0": "assets/f29cead5baaae8a6.png", "flA1": "assets/3b1a3742584ed87c.png", "flA2": "assets/ab653e5267ecc23b.png", "flA3": "assets/fe67447c8c71d776.png", "flA4": "assets/da9b199120c29aed.png", "flA5": "assets/f579838517109886.png", "flB0": "assets/0c3b2007aa459d0a.png", "flB1": "assets/0acc183336d8df98.png", "flB2": "assets/f89a7f909e77e3f5.png", "flB3": "assets/47975adecad80c43.png", "flB4": "assets/e75df596df2307dc.png", "flB5": "assets/e5201c887e6d800c.png", "sm0": "assets/22394abc146b450e.png", "sm1": "assets/0e20bfb771ef24af.png", "sm2": "assets/ee8d1542776c1258.png", "dr1": "assets/9b662d21b215b0a2.png", "dr3": "assets/7362c3219424e7b4.png", "dr5": "assets/fe9e9ad097ed7250.png", "dr7": "assets/65064a10fc65e271.png"};
/* p321 r1 — staff Fireball: the owner's art look v8 (art/skills/staff/fireball_v2_owner_20261026, HANDOFF_fireball_v2.md; DeaRz 26 Oct 10:41 "เยี่ยมแบบนี้แหละ",
   27 Oct 10:56 "ลูฟไฟลองทำได้เลย"). Drawing only: damage, ticks, burst time, radius and burn stay p307 (9 ticks every 0.1 s from landing, burst 0.9 s after landing).
   Timeline from the p307 cast: blue orb falls from 560 px above the target (seed start → landing) with a short faint beam tail; landing = red ground flash,
   ripple + swirl turning opposite ways on the ground, the blue orb floats up into the red orb's core by 0.85 s; red lava orb grows from 0.28 s;
   burst = flash, shock ring, 6 upright flames (A/B sheets every 0.07 s), 5 lava drops, 3 smoke puffs, scorch ~1.7 s.
   Ball size base RB = 90 px (old radius, the approved demo scale); ground pieces follow the skill circle (RG = mean of RB and the circle radius).
   p307 keeps the V7 rune ring, the Lv5 ground fire, the Lv10 pillars, shards and embers. Off: ?fz8=off (= p307 look). Debug window.FZ8. */
(function(){'use strict';
const R=window.FZ8={ver:'p321-r1',ok:false,on:!/fz8=off/.test(String(location.search)),n:0,ready:0,draws:0,err:null};
if(!R.on)return;
try{
const SRC=window.__FZ8A||{},ART={};
for(const k in SRC){R.n++;const im=new Image();im.onload=()=>{R.ready++;R.ok=R.ready===R.n;};im.src=SRC[k];ART[k]=im;}
const ease=u=>1-Math.pow(1-u,3),cl01=v=>v<0?0:v>1?1:v,ok=k=>ART[k]&&ART[k].complete&&ART[k].naturalWidth>0;
const RB=90;let KY=.38;
function sprite(k,x,y,w,h,rot,alpha,add){if(!ok(k)||alpha<=0)return;ctx.save();if(add)ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.min(1,alpha);ctx.translate(x,y);if(rot)ctx.rotate(rot);ctx.drawImage(ART[k],-w/2,-h/2,w,h);ctx.restore();}
function ground(k,x,y,d,rot,alpha,add){if(!ok(k)||alpha<=0)return;ctx.save();if(add)ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.min(1,alpha);ctx.translate(x,y);ctx.scale(1,KY);ctx.rotate(rot);ctx.drawImage(ART[k],-d/2,-d/2,d,d);ctx.restore();}
const RG=z=>(RB+z.r)/2;
/* ground-layer radius of the vortex (rv) and the red orb size, landing-relative time tl, burst gap FB */
function rv(z,tl){const gr0=tl>=.28?ease(cl01((tl-.28)/.57)):0,g=RG(z);return Math.max(g*1.3*(.3+.7*ease(cl01(tl/.4))),g*(.14+.86*gr0)*1.55);}
function lavaBall(x,cy,Rr,T,a){ctx.save();ctx.globalAlpha=a;ctx.beginPath();ctx.arc(x,cy,Rr,0,6.283);ctx.clip();
  ctx.fillStyle='#b00810';ctx.fillRect(x-Rr,cy-Rr,Rr*2,Rr*2);
  if(ok('lava')){const im=ART.lava,h=Rr*2.2,w=h*im.naturalWidth/im.naturalHeight,off=((T*Rr*.35)%w+w)%w;for(const dx of [-off,-off+w])ctx.drawImage(im,x-Rr*1.1+dx,cy-h/2,w,h);}
  let g=ctx.createRadialGradient(x-Rr*.25,cy-Rr*.3,Rr*.1,x,cy,Rr);g.addColorStop(0,'rgba(255,120,90,.18)');g.addColorStop(.62,'rgba(120,0,10,0)');g.addColorStop(1,'rgba(60,0,6,.72)');
  ctx.fillStyle=g;ctx.fillRect(x-Rr,cy-Rr,Rr*2,Rr*2);
  ctx.globalCompositeOperation='lighter';g=ctx.createLinearGradient(0,cy+Rr,0,cy-Rr*.25);g.addColorStop(0,'rgba(255,240,245,.8)');g.addColorStop(.3,'rgba(255,160,175,.35)');g.addColorStop(1,'rgba(255,90,100,0)');
  ctx.fillStyle=g;ctx.fillRect(x-Rr,cy-Rr,Rr*2,Rr*2);ctx.restore();
  ctx.save();ctx.globalAlpha=a*.5;ctx.lineWidth=2.5;ctx.strokeStyle='rgba(255,190,170,.9)';ctx.beginPath();ctx.arc(x,cy,Rr-1.5,Math.PI*1.05,Math.PI*1.75);ctx.stroke();ctx.restore();
  sprite('glow',x,cy,Rr*.45,Rr*.45,T*2,a*.9,true);}
/* below monsters and the hero: landing mark, ripple + swirl, scorch, shock ring */
R.ground=function(z,t,T,K){if(!R.ok)return false;try{KY=K.KY||.38;const x=z.x,y=z.y,tl=t-K.S1,FB=K.BT-K.S1,g=RG(z);
    if(t>=K.S0&&tl<0){const u=cl01((t-K.S0)/(K.S1-K.S0));ground('ripple',x,y,g*.9*(.6+.4*u),T*2,.35*u,true);}
    if(tl>=0&&tl<=FB+.2){const fade=tl>FB?cl01(1-(tl-FB)/.18):1,ap=cl01(tl/.12)*fade,r=rv(z,tl);
      ground('ripple',x,y,r*2.15,T*1.1,ap*.95,true);ground('swirl',x,y,r*1.55,-T*2.6,ap*.85,false);ground('swirl',x,y,r*1.55,-T*2.6,ap*.35,true);}
    const tb=t-K.BT;
    if(tb>=0&&tb<=1.7){const a=(tb<.08?tb/.08:1)*(tb>1.2?1-(tb-1.2)/.5:1);ground('scorch',x,y,g*2.3,.4,a*.9,false);}
    if(tb>=0&&tb<.55){const u=tb/.55;ground('shock',x,y,g*2*(.45+2.1*ease(u)),T*.8,(1-u)*1.1,false);ground('shock',x,y,g*2*(.45+2.1*ease(u))*.92,-T*.8,(1-u)*.6,true);ground('ripple',x,y,g*2*(.7+1.2*ease(u)),T*1.1,(1-u)*.6,true);}
    R.draws++;return true;}catch(e){R.err='ground '+e.message;return false;}};
/* over monsters and the hero: falling blue orb, red lava orb + its core, front ripple, burst (flash, flames, drops, smoke) */
R.top=function(z,t,T,K){if(!R.ok)return false;try{KY=K.KY||.38;const x=z.x,y=z.y,tl=t-K.S1,FB=K.BT-K.S1;
    if(t>=K.S0&&tl<0){const u=cl01((t-K.S0)/(K.S1-K.S0)),e=u*u,top=y-560,yb=top+(y-14-top)*e,d=34;
      if(ok('beam')){const L=Math.min(90,20+(yb-top)*.3),w=22;ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.55;ctx.drawImage(ART.beam,x-w/2,yb-L+d*.3,w,L);ctx.restore();}
      ctx.save();ctx.globalCompositeOperation='lighter';const gg=ctx.createRadialGradient(x,yb,0,x,yb,d*1.5);gg.addColorStop(0,'rgba(150,190,255,.6)');gg.addColorStop(1,'rgba(80,120,255,0)');ctx.fillStyle=gg;ctx.beginPath();ctx.arc(x,yb,d*1.5,0,6.283);ctx.fill();ctx.restore();
      sprite('orb',x,yb,d,d,T*9,1,false);}
    if(tl>=0&&tl<=FB+.2){const fade=tl>FB?cl01(1-(tl-FB)/.18):1,pop=tl>FB?1+.3*ease(cl01((tl-FB)/.15)):1,gr0=tl>=.28?ease(cl01((tl-.28)/.57)):0,ap=cl01(tl/.12)*fade,r=rv(z,tl);
      if(tl<.18){const v=tl/.18;sprite('glow',x,y-20,RB*1.1*(.6+.6*v),RB*.9*(.6+.6*v),0,(1-v)*1.2,true);}
      if(tl>=.28){const Rr=RB*(.14+.86*gr0)*pop,cy=y-Rr*.62;
        ctx.save();ctx.globalAlpha=.3*gr0*fade;ctx.fillStyle='#200406';ctx.beginPath();ctx.ellipse(x,y+2,Rr*.8,Rr*.8*KY*.7,0,0,6.283);ctx.fill();ctx.restore();
        sprite('glow',x,cy,Rr*3.1,Rr*3.1,T*.6,fade*(.35+.45*(1-gr0)),true);lavaBall(x,cy,Rr,T,fade);}
      {const ur=ease(cl01(tl/.85)),Rf=RB*(.14+.86*gr0)*pop,yo=(y-14)+((y-Rf*.62)-(y-14))*ur,d=34*(1-.25*ur),ab=fade*(tl<.6?1:1-cl01((tl-.6)/.3)*.85);
        ctx.save();ctx.globalCompositeOperation='lighter';const gg=ctx.createRadialGradient(x,yo,0,x,yo,d*1.6);gg.addColorStop(0,'rgba(170,205,255,'+(.6*ab)+')');gg.addColorStop(1,'rgba(90,130,255,0)');ctx.fillStyle=gg;ctx.beginPath();ctx.arc(x,yo,d*1.6,0,6.283);ctx.fill();ctx.restore();
        sprite('orb',x,yo,d,d,T*6,ab,false);}
      ctx.save();ctx.beginPath();ctx.rect(x-r*1.2,y-2,r*2.4,r);ctx.clip();ground('ripple',x,y,r*2.15,T*1.1,ap*(tl>=.28?.7:.4),true);ctx.restore();}
    const tb=t-K.BT;
    if(tb>=0&&tb<=1.7){const cy=y-RB*.62;
      for(let i=0;i<3;i++){const ts=tb-.35-i*.08;if(ts<0||ts>1.3)continue;const u=ts/1.3,dx=(i-1)*RB*.35*(1+u),d=RB*(.8+.8*ease(u));
        if(ok('sm'+i)){ctx.save();ctx.globalAlpha=.32*(u<.2?u/.2:1-u);ctx.drawImage(ART['sm'+i],x+dx-d/2,y-RB*1.1-70*ts-d/2,d,d);ctx.restore();}}
      if(tb<.45){const u=tb/.45;sprite('glow',x,cy,RB*2.6*(1+.6*ease(u)),RB*2.6*(1+.6*ease(u)),u,(1-u)*(1-u)*1.3,true);}
      if(tb<.75){const sh=Math.floor(T/.07)%2?'flA':'flB',L=[[0,-.1,1.25],[-.32,0,1],[.32,0,1],[-.16,.12,.9],[.16,.12,.9],[0,.18,.8]];
        for(let i=0;i<6;i++){const [dx,dy,s]=L[i],ui=cl01((tb-i*.025)/.7);if(ui<=0)continue;const g=ease(cl01(ui/.35)),d=RB*s*(.55+.85*g),fx=x+dx*RB*(.7+.5*g),fy=y-d*.42+dy*RB-55*tb;
          const al=ui<.08?ui/.08:1-Math.pow(cl01((ui-.35)/.65),1.4);sprite(sh+i,fx,fy,d,d,dx*.35,al,false);sprite(sh+i,fx,fy,d,d,dx*.35,al*.4,true);}}
      if(tb<.6){const DR=[1,3,5,7,1];for(let i=0;i<DR.length;i++){const k='dr'+DR[i];if(!ok(k))continue;const a=-Math.PI*(.2+.6*(i/(DR.length-1))),sp=260+60*(i%2),vx=Math.cos(a)*sp,vy=Math.sin(a)*sp,
          px=x+vx*tb,py=cy+vy*tb+500*tb*tb,rot=Math.atan2(vy+1000*tb,vx)-2.1,im=ART[k],s=.32,al=tb>.4?1-(tb-.4)/.2:1;sprite(k,px,py,im.naturalWidth*s,im.naturalHeight*s,rot,al,false);}}}
    return true;}catch(e){R.err='top '+e.message;return false;}};
}catch(e){R.err='init '+e.message;}})();

