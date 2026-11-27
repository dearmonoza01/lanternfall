
/* scythe_combo_r4 views.js (Motion + Art, DeaRz approved 12 Nov) */
// front/back views for the turn (draft: assembled from Art's spin_front_back_r1 parts; outfits default+reaper, boy default hair / girl g6 only)
(function(){
var U=window.PUPPET, S=window.SPIN_PARTS||{}, V=window.SPIN_PIV||{}, IM={}, D2R=Math.PI/180;
window.CUR_OUTFIT='reaper';
window.SPINVIEW={ready:false,
 load:function(){ var ks=Object.keys(S), n=0; return new Promise(function(res){ if(!ks.length) return res(); ks.forEach(function(k){ var im=new Image(); im.onload=im.onerror=function(){ if(++n===ks.length){ SPINVIEW.ready=true; res(); } }; im.src=S[k]; IM[k]=im; }); }); },
 ok:function(){ var o=window.CUR_OUTFIT, c=U.getChar(); if(!SPINVIEW.ready) return false; if(o!=='default'&&o!=='reaper') return false; return (c.gender==='boy'&&c.hair==='default')||(c.gender==='girl'&&c.hair==='g6'); }};
function rigH(k){ var key=U.slots[k]||(U.P[k]&&U.P[k].img)||k, im=U.imgs[key]; return im?im.height*U.absS(k):0; }
function sz(n){ var i=IM[n]; return [i.naturalWidth||i.width,i.naturalHeight||i.height]; }
function put(cx,n,px,py,ox,oy,s,rot){ // draw part n with its point (px,py) [image px] at (ox,oy); scale s; rotation deg about that point
  var im=IM[n]; if(!im) return; cx.save(); cx.translate(ox,oy); cx.rotate((rot||0)*D2R); cx.scale(s,s); cx.drawImage(im,-px,-py); cx.restore(); }
// view: 'front'|'back'; x,y = feet position; sc = same draw scale as PUPPET.draw; p = pose (air, q, turn)
window.SPINVIEW.draw=function(cx,x,y,sc,view,p){
 var o=window.CUR_OUTFIT, c=U.getChar(), girl=c.gender==='girl', pre=o+'_'+view+'_', t=(p.q||0)*6.283*2;
 var tn=pre+(girl&&IM[pre+'girl_torso']?'girl_torso':'torso');
 var tv=V[tn], st=rigH('torso')/tv.size[1]*(girl?1:1);
 var sa=rigH('arm_near')/V[pre+'arm_near'].size[1], sl=0.8*rigH('leg_near')/V[pre+'leg_near'].size[1], sf=rigH('foot_near')/V[pre+'foot_near'].size[1];
 st=rigH('torso')/ (V[pre+'torso'].size[1]); var air=(p.air||0); if(p.hold==='low') sl*=0.55;
 // stack from the ground up (units = rig px, y up negative)
 var fv=V[pre+'foot_near'], lv=V[pre+'leg_near'];
 var ankleY=-(fv.size[1]-fv.ankle[1])*sf; var hipY=ankleY-(lv.bottom_pivot[1]-lv.top_pivot[1])*sl;
 var tvv=V[tn], torsoTop=hipY-((tvv.hip_near[1]+tvv.hip_far[1])/2)*st+26, hipHalf=(tvv.hip_far[0]-tvv.hip_near[0])*st/2*1.15;
 var shY=torsoTop+tvv.shoulder[1]*st, shHalf=tvv.size[0]*st*0.5-0.2*V[pre+'arm_near'].size[0]*sa;
 cx.save(); cx.translate(x,y-air*sc); cx.scale(sc,sc);
 var spread=(p.hold==='low'?30:10)+6*Math.sin(t); // legs stride
 // legs + feet (near = character right = screen left in front view; swapped in back view)
 var sgn=view==='front'?-1:1;
 [['far',-sgn],['near',sgn]].forEach(function(a){ var side=a[0], dx=a[1]*hipHalf, r=(side==='near'?1:-1)*spread*(view==='front'?1:-1);
  put(cx,pre+'leg_'+side,V[pre+'leg_'+side].top_pivot[0],V[pre+'leg_'+side].top_pivot[1],dx,hipY,sl,r);
  var rr=r*D2R, ax=dx-Math.sin(rr)*(lv.bottom_pivot[1]-lv.top_pivot[1])*sl, ay=hipY+Math.cos(rr)*(lv.bottom_pivot[1]-lv.top_pivot[1])*sl;
  put(cx,pre+'foot_'+side,V[pre+'foot_'+side].ankle[0],V[pre+'foot_'+side].ankle[1],ax,ay,sf,r*0.5); });
 // head + hair (hair front over face, back covers head), then torso over the neck
 var hn=(girl?'girl_':'boy_')+view+'_', hv=V[hn+'head'], hs=1, headBottom=torsoTop+tvv.neck_top[1]*st+58;
 var hx=0, hy=headBottom-(hv.neck_base[1])*hs;
 put(cx,hn+'head',hv.neck_base[0],hv.neck_base[1],hx,headBottom,hs,0);
 var hairN=hn+'hair_default', hh=V[hairN]; if(hh){ var hsz=hh.size, hk=IM[hairN]; cx.save(); cx.translate(hx,headBottom-hv.neck_base[1]*hs+ (view==='front'?-0.02:0.0)*hv.size[1]); cx.scale(hs,hs); cx.drawImage(hk, -hsz[0]/2, view==='front'?-(hsz[1]-hv.size[1])*0.5-4:-(hsz[1]-hv.size[1])*0.5, hsz[0], hsz[1]); cx.restore(); }
 put(cx,tn,tvv.neck_top[0],tvv.neck_top[1],0,torsoTop+tvv.neck_top[1]*st,st,0);
 // arms: both bent toward the middle holding the scythe across the body
 var hand=[];
 [['far',-sgn],['near',sgn]].forEach(function(a){ var side=a[0], sx=a[1]*shHalf, rot=a[1]*(({chest:28,low:12,over:122})[p.hold||'chest']+4*Math.sin(t+1));
  var av=V[pre+'arm_'+side]; put(cx,pre+'arm_'+side,av.top_pivot[0],av.top_pivot[1],sx,shY,sa,rot);
  var rr=rot*D2R, L=(av.bottom_pivot[1]-av.top_pivot[1])*sa, hx2=sx-Math.sin(rr)*L, hy2=shY+Math.cos(rr)*L; hand.push([side,hx2,hy2]); });
 var mx=(hand[0][1]+hand[1][1])/2, my=(hand[0][2]+hand[1][2])/2;
 // scythe across the hands (horizontal), blade to the screen side of the facing direction
 var sw=U.imgs['w_scythe']; if(sw){ cx.save(); cx.translate(mx,my); cx.rotate((view==='front'?-82:-98)*D2R); cx.scale(0.8,0.8); cx.drawImage(sw,-263,-492+210); cx.restore(); }
 hand.forEach(function(h){ var fn=pre+'fist_'+h[0], fv2=V[fn]; if(fv2) put(cx,fn,fv2.wrist[0],fv2.wrist[1],h[1],h[2],sa*1.0,0); });
 cx.restore(); };
})();

