
/* astoria_npcs_v1.json (Story FINAL, DeaRz approved 11 Nov 2026 07:58) */
window.__TOWN_DATA={
 "town": "astoria_capital",
 "map": 3,
 "approved": "DeaRz 11 Nov 2026 07:58 (+07) after his own edits in review doc; typos cleaned by Story",
 "note": "lines are story draft v1; kind: quest/shop/stand/walk/board; race lines use if race=; done: flags per player | FINAL text v1 approved.",
 "npcs": [
  {
   "id": "ast_daren",
   "name": "สิบเอกดาเรน",
   "district": "north_gate",
   "race": "human",
   "kind": "quest",
   "lines": [
    {
     "say": "สามร้อยปีแล้วที่ประตูนี้ไม่เคยเปิดตอนกลางคืน... เพราะไม่มีใครกล้าออกไปข้างนอกนั่น"
    },
    {
     "if": "race=demon",
     "say": "เขาเจ้าเกือบเกี่ยวธงข้าแล้วนะ ระวังหน่อย ฮา ๆ"
    }
   ]
  },
  {
   "id": "ast_guard_n1",
   "name": "ทหารยาม",
   "district": "north_gate",
   "race": "human",
   "kind": "stand",
   "lines": [
    {
     "say": "ทางขึ้นเขาหมอกหนา ถ้าไม่จำเป็นอย่าขึ้นตอนค่ำจะดีกว่า"
    }
   ]
  },
  {
   "id": "ast_guard_n2",
   "name": "ทหารยาม",
   "district": "north_gate",
   "race": "human",
   "kind": "stand",
   "lines": [
    {
     "say": "ข้าเฝ้ายามมาทั้งคืน... อย่าบอกหัวหน้านะว่าข้าแอบงีบไปนิดหน่อย"
    }
   ]
  },
  {
   "id": "ast_traveler_n",
   "name": "นักเดินทาง",
   "district": "north_gate",
   "race": "human",
   "kind": "walk",
   "lines": [
    {
     "say": "ได้ยินว่าหมู่บ้านที่อยู่เหนือน้ำตกไม่เหลือใครแล้ว จริงหรือเปล่านะ..."
    }
   ]
  },
  {
   "id": "ast_cart_check",
   "name": "คนตรวจเกวียน",
   "district": "north_gate",
   "race": "human",
   "kind": "stand",
   "lines": [
    {
     "say": "เปิดผ้าคลุมด้วย ไม่ใช่ว่าไม่ไว้ใจนะ แค่หมอกมันชอบซ่อนตัวเสมอน่ะ"
    }
   ]
  },
  {
   "id": "ast_emma",
   "name": "นางเอ็มมา",
   "district": "market",
   "race": "human",
   "kind": "shop",
   "lines": [
    {
     "say": "ผ้าดีต้องทนหมอก ทนฝน แล้วก็ต้องสวยด้วย จริงไหม"
    },
    {
     "if": "race=cat",
     "say": "หางเจ้าสวยนัก ข้าตัดชุดเว้นช่องหางให้ได้นะ"
    }
   ]
  },
  {
   "id": "ast_baker",
   "name": "คนขายขนมปัง",
   "district": "market",
   "race": "human",
   "kind": "shop",
   "lines": [
    {
     "say": "ขนมปังเพิ่งออกจากเตา! อุ่นกว่าตะเกียงเมืองอีก"
    }
   ]
  },
  {
   "id": "ast_fruit",
   "name": "แม่ค้าผลไม้",
   "district": "market",
   "race": "human",
   "kind": "shop",
   "lines": [
    {
     "say": "แอปเปิลจากทุ่งตะวันออก ล็อตสุดท้ายก่อนหมอกลง"
    }
   ]
  },
  {
   "id": "ast_fish",
   "name": "คนขายปลา",
   "district": "market",
   "race": "human",
   "kind": "shop",
   "lines": [
    {
     "say": "ปลาจากแม่น้ำตรงนั้นนั่นแหละ สดทุกเช้า ข้าสั่งมาเองกับมือ"
    }
   ]
  },
  {
   "id": "ast_haggler1",
   "name": "ลูกค้าต่อราคา",
   "district": "market",
   "race": "human",
   "kind": "stand",
   "lines": [
    {
     "say": "ห้าเหรียญ? เมื่อวานสี่เหรียญเองนะ!"
    }
   ]
  },
  {
   "id": "ast_haggler2",
   "name": "ลูกค้าต่อราคา",
   "district": "market",
   "race": "human",
   "kind": "walk",
   "lines": [
    {
     "say": "ของแพงขึ้นทุกวันตั้งแต่ถนนทางเหนือปิด"
    }
   ]
  },
  {
   "id": "ast_mother",
   "name": "แม่พาลูก",
   "district": "market",
   "race": "human",
   "kind": "walk",
   "lines": [
    {
     "say": "จับมือแม่ไว้สิ!"
    }
   ]
  },
  {
   "id": "ast_newskid",
   "name": "เด็กขายหนังสือพิมพ์",
   "district": "market",
   "race": "human",
   "kind": "stand",
   "lines": [
    {
     "say": "ข่าวด่วน! หมอกหนาขึ้นทางเหนือ!"
    },
    {
     "if": "done:c2_m7",
     "say": "ข่าวด่วน! มีคนเห็นงูยักษ์ในแดนหิมะ!"
    }
   ]
  },
  {
   "id": "ast_cat_stall",
   "name": "แม่ค้าคาราวาน",
   "district": "market",
   "race": "cat",
   "kind": "shop",
   "lines": [
    {
     "say": "ของจากทะเลทราย ต่อได้ แต่ต้องซื้อนะเหมียววว!"
    },
    {
     "if": "race=cat",
     "say": "อ้าว พวกเดียวกัน! ลดให้ครึ่งเหรียญ!"
    }
   ]
  },
  {
   "id": "ast_demon_knife",
   "name": "ช่างมีดปีศาจ",
   "district": "market",
   "race": "demon",
   "kind": "shop",
   "lines": [
    {
     "say": "มีดจากเตาเอมเบอร์โฮลด์ คมจนตัดเพชรได้... ถ้าไม่ได้ก็เกือบ ๆ แหละ!"
    },
    {
     "if": "race=human",
     "say": "ไม่ต้องถอยห่างหรอก ข้าขายมีด ไม่ได้ใช้มีด"
    }
   ]
  },
  {
   "id": "ast_couple",
   "name": "คู่รักบนม้านั่ง",
   "district": "plaza",
   "race": "human",
   "kind": "stand",
   "lines": [
    {
     "say": "ถ้าตะเกียงใหญ่กลับมาสว่าง เราจะไปดูดาวบนเขากันนะ"
    }
   ]
  },
  {
   "id": "ast_kid_pigeon1",
   "name": "เด็กไล่นกพิราบ",
   "district": "plaza",
   "race": "human",
   "kind": "walk",
   "lines": [
    {
     "say": "นกพิราบไม่กลัวหมอกเลย ข้าก็จะไม่กลัวเหมือนกัน!"
    }
   ]
  },
  {
   "id": "ast_kid_pigeon2",
   "name": "เด็กไล่นกพิราบ",
   "district": "plaza",
   "race": "cat",
   "kind": "walk",
   "lines": [
    {
     "say": "ข้าจับได้แน่ ข้าเป็นแมวนะ!"
    }
   ]
  },
  {
   "id": "ast_flute",
   "name": "นักดนตรีเป่าขลุ่ย",
   "district": "plaza",
   "race": "human",
   "kind": "stand",
   "lines": [
    {
     "say": "เพลงนี้ยายข้าสอน ท่านว่าแต่ก่อนทั้งเมืองร้องกันตอนตะเกียงยังไม่แตกแบบนี้..."
    }
   ]
  },
  {
   "id": "ast_lamplighter",
   "name": "คนเติมตะเกียง",
   "district": "plaza",
   "race": "human",
   "kind": "walk",
   "lines": [
    {
     "say": "เติมน้ำมันทุกเสา ทุกคืน ตะเกียงใหญ่ไม่ช่วยเราแล้ว เราก็ต้องช่วยกันเอง"
    }
   ]
  },
  {
   "id": "ast_patrol1",
   "name": "ทหารลาดตระเวน",
   "district": "plaza",
   "race": "human",
   "kind": "walk",
   "lines": [
    {
     "say": "รอบที่สามแล้ว เงียบดี"
    }
   ]
  },
  {
   "id": "ast_patrol2",
   "name": "ทหารลาดตระเวน",
   "district": "plaza",
   "race": "elf",
   "kind": "walk",
   "lines": [
    {
     "say": "เงียบเกินไปต่างหาก"
    }
   ]
  },
  {
   "id": "ast_weapon",
   "name": "ร้านอาวุธ",
   "district": "smiths",
   "race": "human",
   "kind": "shop",
   "lines": [
    {
     "say": "อาวุธทุกชนิด ใช้เป็นหรือไม่เป็นก็ขาย แต่ข้าแนะนำให้ใช้เป็นจะดีกว่านะ เดี๋ยวมันจะบาดเอา"
    }
   ]
  },
  {
   "id": "ast_carpenter",
   "name": "ช่างไม้",
   "district": "smiths",
   "race": "human",
   "kind": "stand",
   "lines": [
    {
     "say": "ซ่อมประตูเมืองเป็นรอบที่สิบแล้วนะปีนี้!"
    }
   ]
  },
  {
   "id": "ast_apprentice",
   "name": "เด็กฝึกงาน",
   "district": "smiths",
   "race": "human",
   "kind": "walk",
   "lines": [
    {
     "say": "ถ่านหนักกว่าที่คิด... แต่วันหนึ่งข้าจะตีดาบเอง!"
    }
   ]
  },
  {
   "id": "ast_demon_smith",
   "name": "ช่างปีศาจจากเอมเบอร์โฮลด์",
   "district": "smiths",
   "race": "demon",
   "kind": "stand",
   "lines": [
    {
     "say": "เหล็กเมืองนี้อ่อนไป แต่คนเมืองนี้ใจดี ข้าเลยอยู่"
    },
    {
     "if": "race=demon",
     "say": "บ้านเราเตายังร้อนอยู่ไหม ข้าคิดถึงจัง"
    }
   ]
  },
  {
   "id": "ast_laundry",
   "name": "คนตากผ้า",
   "district": "homes",
   "race": "human",
   "kind": "stand",
   "lines": [
    {
     "say": "ผ้าแห้งช้าตั้งแต่หมอกมา ทุกอย่างช้าไปหมด"
    }
   ]
  },
  {
   "id": "ast_grandma",
   "name": "คุณยายหน้าบ้าน",
   "district": "homes",
   "race": "human",
   "kind": "stand",
   "lines": [
    {
     "say": "หลานเอ๊ย นั่งก่อน ยายเล่าเรื่องตอนตะเกียงยังสว่างให้ฟัง"
    }
   ]
  },
  {
   "id": "ast_milk",
   "name": "เด็กส่งนม",
   "district": "homes",
   "race": "human",
   "kind": "walk",
   "lines": [
    {
     "say": "นมมาแล้ว! ถุงละ 5 เหรียญ!"
    }
   ]
  },
  {
   "id": "ast_sweeper",
   "name": "คนกวาดถนน",
   "district": "homes",
   "race": "human",
   "kind": "walk",
   "lines": [
    {
     "say": "กวาดเถ้าดำทุกเช้า ไม่รู้มันมาจากไหน"
    }
   ]
  },
  {
   "id": "ast_dog_owner",
   "name": "คนพาหมาเดิน",
   "district": "homes",
   "race": "elf",
   "kind": "walk",
   "lines": [
    {
     "say": "มันเห่าหมอกทุกคืน ข้าเลยชื่อมันว่ายาม!?"
    }
   ]
  },
  {
   "id": "ast_innkeeper",
   "name": "เจ้าของโรงเตี๊ยม",
   "district": "inn",
   "race": "human",
   "kind": "shop",
   "lines": [
    {
     "say": "ห้องว่างมีเหลือ ตั้งแต่ผู้คนเดินทางน้อยลง"
    },
    {
     "if": "race=elf",
     "say": "เอลฟ์มาพักทีไร แขกคนอื่นชอบมาขอฟังเพลงเสมอเลย"
    }
   ]
  },
  {
   "id": "ast_board",
   "name": "ป้ายประกาศงาน",
   "district": "inn",
   "race": "none",
   "kind": "board",
   "lines": [
    {
     "say": "(งานประจำวันจากชาวเมือง)"
    }
   ]
  },
  {
   "id": "ast_drunk",
   "name": "นักผจญภัยเมา",
   "district": "inn",
   "race": "human",
   "kind": "stand",
   "lines": [
    {
     "say": "ข้าเคยสู้เงาหมอกมือเปล่านะ! ...ในฝัน"
    }
   ]
  },
  {
   "id": "ast_elf_archer",
   "name": "เอลฟ์นักธนู",
   "district": "inn",
   "race": "elf",
   "kind": "stand",
   "lines": [
    {
     "say": "หมอกมาจากรอยไหม้ ข้าตามรอยมาจากทะเล มันยาวกว่าที่ใครคิด"
    }
   ]
  },
  {
   "id": "ast_bard",
   "name": "กวีเล่าตำนาน",
   "district": "inn",
   "race": "human",
   "kind": "stand",
   "lines": [
    {
     "say": "ฟังไหม ตำนานผู้ถือตะเกียงเหล็กดำ... เอ๊ะ ท่านถืออยู่นี่นา",
     "if": "done:m2_02"
    },
    {
     "if": "!done:m2_02",
     "say": "ฟังไหม ตำนานตะเกียงใหญ่ที่ลอยเหนือฟ้า"
    }
   ]
  },
  {
   "id": "ast_farmer",
   "name": "ชาวนาเข็นเกวียน",
   "district": "east_gate",
   "race": "human",
   "kind": "walk",
   "lines": [
    {
     "say": "ทุ่งสองแควยังพอปลูกได้ แต่ต้องรีบเก็บก่อนฟ้ามืดนะ"
    }
   ]
  },
  {
   "id": "ast_fisher",
   "name": "คนตกปลาบนสะพาน",
   "district": "east_gate",
   "race": "human",
   "kind": "stand",
   "lines": [
    {
     "say": "ปลาไม่กินเหยื่อตั้งแต่น้ำเย็นลง ข้าเลยมานั่งเฉย ๆ"
    }
   ]
  },
  {
   "id": "ast_guard_e",
   "name": "ทหารยาม",
   "district": "east_gate",
   "race": "human",
   "kind": "stand",
   "lines": [
    {
     "say": "ทางตะวันออกไปถึงทะเลทราย คาราวานยังมาอยู่ แต่น้อยลงทุกเดือน"
    }
   ]
  },
  {
   "id": "ast_camel",
   "name": "คาราวานอูฐเผ่ามิว",
   "district": "east_gate",
   "race": "cat",
   "kind": "stand",
   "lines": [
    {
     "say": "ตลาดซันสการ์อยู่ไกลตะวันออก ไปกับพวกเราไหมเหมียว"
    },
    {
     "if": "race=cat",
     "say": "กลับบ้านด้วยกันไหม ยายมิ้วเนตราคิดถึงลูกหลานทุกคนนะ"
    }
   ]
  }
 ]
};
