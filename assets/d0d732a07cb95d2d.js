
/* ---- r268i FOODART268 (TEST ONLY). DeaRz 27 Nov 02:03 UTC (campfire cooking window screenshot): "อาหารนำรูปจาก Art มาใส่ด้วยนะ". Art pack foodart_r1
   (MD5 5d793446f21b0a0045a23155be1eabdb): campfire_icons_r1 (38 icons by item id) + food_new_r1 (12 newer dishes, mapped by name: tomatoSoup, fruitSalad, applePie,
   crispyFish, fishCabbageSoup, fishSkewer, berryBread, boarCurry, peachPudding, steamedFish, grapeFish, luckyTart) + item_recipe_scroll for the 5 recipe_* items.
   Why the cooking window showed code pictures although r135 campart had wired the 38 icons: the newer cooking window (r183) draws each row icon on a small canvas
   from ITEMS[id].icon (the code drawing) instead of itemIcon(); and the 12 newer dishes had no Art at all. Now itemIcon() returns the Art for all these ids (bag,
   tooltip, shop rows, hotbar, the r130 list) and the r183 cooking window paints the same Art on its canvases. Recipe ingredient groups: "any fish" (*fish, *fishU,
   *fishR) shows the river fish icon, "any apple" (*apple) the east apple icon. No Art: fishStew (ต้มปลา) keeps its code picture. Off: ?foodart=off. ---- */
(function(){'use strict';
const X=window.FOODART268={ver:'foodart-r268i',on:!/[?&]foodart=off\b/.test(String(location.search)),hits:0,err:null};
if(!X.on)return;
const ICON={'applePie':'assets/703b3d4927b167b0.png',
'bandage':'assets/a0276df8f08f010d.png',
'berryBread':'assets/a87d9d63e38fda3a.png',
'boarCurry':'assets/d96028834b5de2cc.png',
'boarMeat':'assets/426781f8c7021b02.png',
'boarSkewer':'assets/ac7f159511955705.png',
'breadStew':'assets/f655b25aeb27e341.png',
'cabbage':'assets/b27d437b3d9fb859.png',
'campBread':'assets/b307fa20835b62fb.png',
'campKit':'assets/81944433fef52b59.png',
'crispyFish':'assets/445d911799915d2d.png',
'croissant':'assets/22abe640fcca7310.png',
'eastApple':'assets/e26c9335cf025d7e.png',
'fishCabbageSoup':'assets/fdfd3984fc0771e8.png',
'fishSkewer':'assets/65af5f36c8895b86.png',
'fishSoup':'assets/109b7875e4b76810.png',
'forestSalad':'assets/1af45a712676d50a.png',
'fruitSalad':'assets/0137cbb379472e04.png',
'fruitTart':'assets/5aaa2df197abf4b8.png',
'garlicBread':'assets/b864b348b571282e.png',
'goldPeach':'assets/b05f2edc0b4b1b88.png',
'grapeFish':'assets/b61aea2f7a7be0f4.png',
'grillFish':'assets/2c81871d6da6fb0a.png',
'hamSandwich':'assets/a83b149962fc0918.png',
'herbFish':'assets/496bc93b3ef6350c.png',
'hunterStew':'assets/b09c7656d6d69b31.png',
'indigoBerry':'assets/751dd683ac7b9853.png',
'jellyDessert':'assets/a172e33bbb2daf6a.png',
'luckyTart':'assets/c69ed8c4d2aafe92.png',
'meatPie':'assets/f9f460afd553900e.png',
'mistCarrot':'assets/a1c742183a141604.png',
'mistShawl':'assets/da6a3ff03f426e8b.png',
'mossHerb':'assets/6ecf4c8f9a668bff.png',
'mtGrape':'assets/ebfa885c5cf3726a.png',
'mushSoup':'assets/a28c193bc1a4b640.png',
'onion':'assets/5fb8310006eccb1a.png',
'peachPudding':'assets/13bb5d1c7ded7258.png',
'potato':'assets/658b9d5c53e59e82.png',
'puffcapMush':'assets/3acb2315149f1132.png',
'riverFish':'assets/1331630ae4c1f6bf.png',
'rootPancake':'assets/17a8f555ec213407.png',
'slimeJelly':'assets/1c9e3182c233b154.png',
'steamedFish':'assets/2069dc83efac0f7b.png',
'sweetRoot':'assets/86cda2c56c0a222b.png',
'tenderLeaf':'assets/1f86553e583d1e13.png',
'tomato':'assets/7d4867081d1afc1d.png',
'tomatoSoup':'assets/06d4fe37495f00f2.png',
'warmBread':'assets/ceadcbf4b27db1d5.png',
'wheat':'assets/3d0592a0d7af290a.png',
'whetstone':'assets/3b44530bc10ffaaf.png'};const SCROLL='assets/b2cea47f77825c39.png';
for(const id of ['recipe_boarCurry','recipe_peachPudding','recipe_steamedFish','recipe_grapeFish','recipe_luckyTart'])ICON[id]=SCROLL;
const GROUP={'*fish':'riverFish','*fishU':'riverFish','*fishR':'riverFish','*apple':'eastApple'};
X.url=id=>{id=GROUP[id]||id;return ICON[id]||null};X.ids=Object.keys(ICON);
const IMG={};function img(u){let im=IMG[u];if(!im){im=new Image();im.src=u;IMG[u]=im}return im}
X.paint=function(g,id,c){try{const u=X.url(id);if(!u)return false;const im=img(u);if(im.complete&&im.naturalWidth){g.drawImage(im,0,0,64,64);X.hits++;return true}
  if(c&&!im._w){im._w=1;im.addEventListener('load',()=>{try{for(const cv of document.querySelectorAll('canvas[data-i]')){if(X.url(cv.dataset.i)!==u)continue;const q=cv.getContext('2d');q.setTransform(1,0,0,1,0,0);q.clearRect(0,0,cv.width,cv.height);q.drawImage(im,0,0,cv.width,cv.height)}}catch(_){}})}return true}catch(e){X.err=e.message;return false}};
try{const _i=itemIcon;itemIcon=function(it){try{if(it&&it.id&&!it.kind&&ICON[it.id])return ICON[it.id]}catch(_){}return _i.apply(this,arguments)}}catch(e){X.err='icon '+e.message}
for(const u of new Set(Object.values(ICON)))img(u);
})();
