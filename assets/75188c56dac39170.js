
window.WATERFISH256=window.WATERFISH256||{ver:'waterfish-r256',on:!/[?&]waterfish1=off\b/.test(String(location.search)),err:null};
/* ---- r249 WATERFISH249 (TEST ONLY). DeaRz 26 Nov 13:32 BKK "ให้น้ำตรงนี้ตกปลาได้ แมพ4 แมพ5 ตรงที่มีลำธาร ตกปลาได้".
   Fishing with the existing r175 fishing (same rod rule, same fish table, same numbers) at real water on three maps:
     - astoria_capital: the Riverside Garden water (zone 9, wooden bridge + garden stones), shape = __M3RIVER.pond.water_outline
     - w22_map4_test:   the Map 4 stream, shape = __M4T.inWater (the same test the map already uses)
     - w22_map5_test:   the Map 5 pool + stream = blue pixels of the Map 5 ground painting that are also not walkable;
                        the waterfall (below the cliff lip, y > fall.top-40) does not count.
   F prompt shows only when the hero stands at a bank and faces water (rays from the feet along P.face, +-20/40 deg, up to 96 px);
   the bobber lands on water 34 px past the bank. With the rod held, a click on water (within the rod's 240 px reach) casts there.
   Home pond untouched. Off: ?waterfish=off. Debug: window.WATERFISH249 ---- */
(function(){'use strict';
const Q=String(location.search);
const R=window.WATERFISH249={ver:'waterfish-r249',on:!/[?&]waterfish=off\b/.test(Q),err:null,
  cfg:{reach:96,step:6,into:34,cone:[0,.35,-.35,.7,-.7],m5k:.25},stats:{near:0,at:0,m5mask:0}};
const ERR=(w,e)=>{R.err=w+': '+((e&&e.message)||e);try{console.error('[WATERFISH249]',w,e)}catch(_){}};
const ZS={astoria_capital:'astoria',w22_map4_test:'map4',w22_map5_test:'map5'};try{if(window.WATERFISH256&&WATERFISH256.on)ZS.sylva_lab='sylva'}catch(_){}
R.zones=ZS;
R.zoneOn=()=>{try{return R.on&&typeof G!=='undefined'&&!!ZS[G.zone]}catch(_){return false}};
function pip(poly,x,y){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c}return c}
/* Map 5: water mask from the ground painting (built once, on the first look) */
let m5=null,m5busy=false;
function buildM5(){if(m5||m5busy)return;try{const A=window.__M5_ART,D=window.__M5_DATA;if(!A||!A.ground||!D)return;m5busy=true;const im=new Image();
  im.onload=()=>{try{const k=R.cfg.m5k,w=Math.round(D.W*k),h=Math.round(D.H*k),c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0,w,h);
    const px=g.getImageData(0,0,w,h).data,M=new Uint8Array(w*h);let n=0;for(let i=0;i<w*h;i++){const r=px[i*4],gg=px[i*4+1],b=px[i*4+2];if(b>r+45&&b>gg+8){M[i]=1;n++}}
    m5={w,h,k,M};R.stats.m5mask=n}catch(e){ERR('m5mask',e)}m5busy=false};
  im.onerror=()=>{m5busy=false};im.src=A.ground.src}catch(e){m5busy=false;ERR('buildM5',e)}}
function walk5(x,y){try{const D=__M5_DATA,row=D.walk[Math.floor(y/D.g4)];if(!row||x<0)return false;const c=Math.floor(x/D.g4);for(let i=0;i<row.length;i+=2)if(c>=row[i]&&c<row[i+1])return true}catch(_){}return false}
function water(x,y){try{const z=ZS[G.zone];if(!z)return false;
  if(z==='sylva'){return !!(window.WATERFISH256&&WATERFISH256.water(x,y))}if(z==='astoria'){const o=window.__M3RIVER&&__M3RIVER.pond&&__M3RIVER.pond.water_outline;return !!(o&&pip(o,x,y))}
  if(z==='map4'){return !!(window.__M4T&&typeof __M4T.inWater==='function'&&__M4T.inWater(x,y))}
  if(z==='map5'){const D=window.__M5_DATA;if(!D)return false;if(!m5){buildM5();return false}if(D.fall&&y>D.fall.top-40)return false;
    const u=Math.floor(x*m5.k),v=Math.floor(y*m5.k);if(u<0||v<0||u>=m5.w||v>=m5.h||!m5.M[v*m5.w+u])return false;return !walk5(x,y)}
 }catch(e){ERR('water',e)}return false}
R.water=water;
const mk=(bx,by)=>({uid:'wf249_'+G.zone,wf249:1,id:'fishPond',x:bx,y:by,bx,by});
/* standing at a bank, facing water -> a spot on the water */
R.near=()=>{try{if(!R.zoneOn()||typeof P==='undefined'||!P)return null;const C=R.cfg,fx=P.x,fy=P.y+6,base=+P.face||0;
  for(const da of C.cone){const a=base+da,cx=Math.cos(a),sy=Math.sin(a);for(let d=C.step;d<=C.reach;d+=C.step){if(!water(fx+cx*d,fy+sy*d))continue;
    let bd=d+C.into;while(bd>d&&!water(fx+cx*bd,fy+sy*bd))bd-=4;R.stats.near++;return mk(fx+cx*bd,fy+sy*bd)}}}catch(e){ERR('near',e)}return null};
/* rod click: the clicked (clamped) point is water -> fish there */
R.at=(x,y)=>{try{if(R.zoneOn()&&water(x,y)){R.stats.at++;return mk(x,y)}}catch(e){ERR('at',e)}return null};
R.isSt=st=>!!(st&&String(st.uid||'').indexOf('wf249')===0);
/* warm the Map 5 mask as soon as the map is entered */
setInterval(()=>{try{if(R.on&&typeof G!=='undefined'&&G.zone==='w22_map5_test')buildM5()}catch(_){}},1000);
})();

