
/* race_lines_ch1_ch2_v1_1.json (Story, approved; Lysel moved to pro_05_rebirth) */
window.__RACELINES_DATA={
 "version": "race_lines_ch1_ch2_v1_1",
 "date": "2026-11-11",
 "status": "APPROVED text (from RACE_LORE_v1 sec 2, DeaRz 11 Nov 00:04)",
 "rule": "Each entry adds lines to an existing quest/NPC. Do not change other lines. Lines with no if = all races. Insert in the order given.",
 "modes": {
  "insert_first": "before the first line of that block",
  "insert_after": "right after the line whose say contains 'anchor'",
  "greet_first": "NPC first-talk greeting (once per player, flag greet_<npc>)"
 },
 "entries": [
  {
   "quest": "pro_05_rebirth",
   "block": "Lysel talk (pro_05 lines 1-3)",
   "mode": "insert_after",
   "anchor": "ตะเกียงที่แตกสลาย",
   "who": "ไลเซล",
   "lines": [
    {
     "say": "ร่างนี้ไม่ใช่ของเจ้ามาก่อน แต่ต่อจากนี้มันคือเจ้า"
    },
    {
     "say": "เขาเล็ก ๆ นั่น... เหมาะกับเจ้าดี",
     "if": "race=demon"
    },
    {
     "say": "หูของเจ้าจะได้ยินเสียงที่คนอื่นไม่ได้ยิน",
     "if": "race=elf"
    },
    {
     "say": "หางนั่นจะช่วยเจ้าทรงตัว... ข้าคิดนะ",
     "if": "race=cat"
    }
   ],
   "note": "v1_1: the race is picked in the creator before the prologue, so Lysel says it at rebirth, between 'มันจะนำทางเจ้าไปหาตะเกียงที่แตกสลาย' and 'ไปเถิด จงมีชีวิตอีกครั้ง'. Render as normal {who,say} talk lines, not plain strings."
  },
  {
   "quest": "m1_01_spark",
   "block": "objectives[talk npc_ora].say",
   "mode": "insert_first",
   "who": "โอรา",
   "lines": [
    {
     "say": "เจ้าไม่ใช่คนแถวนี้",
     "if": "race=human"
    },
    {
     "say": "เด็กเผ่าภูเขา... ที่นี่ไม่มีใครไล่เจ้าหรอก",
     "if": "race=demon"
    },
    {
     "say": "เอลฟ์ไม่ค่อยลงมาถึงที่นี่ เจ้าหลงทางรึ",
     "if": "race=elf"
    },
    {
     "say": "เผ่ามิวมาส่งของอีกแล้วรึ... อ้อ ไม่ใช่",
     "if": "race=cat"
    }
   ]
  },
  {
   "npc": "npc_mali",
   "block": "shop first greeting",
   "mode": "greet_first",
   "who": "มะลิ",
   "lines": [
    {
     "say": "ซื้อสามขวดแถมคำอวยพร",
     "if": "race=human"
    },
    {
     "say": "ยาข้าไม่เลือกว่าใครมีเขา",
     "if": "race=demon"
    },
    {
     "say": "ยาข้าไม่มีกลิ่นดอกไม้แบบที่เอลฟ์ชอบนะ",
     "if": "race=elf"
    },
    {
     "say": "ลูกค้าเผ่าเดียวกับข้า! ...ลดให้ไม่ได้นะ",
     "if": "race=cat"
    }
   ],
   "note": "Mali is a cat (RACE_LORE sec 3)."
  },
  {
   "quest": "m1_03_forge",
   "block": "dialogue.before",
   "mode": "insert_after",
   "anchor": "ไปให้พ้น",
   "who": "เฟอร์โร",
   "lines": [
    {
     "say": "มือเผ่าภูเขาจับค้อนเป็นมาแต่เกิด... แต่ข้าก็ยังไม่ตีให้",
     "if": "race=demon&!done:s1_02_letter"
    },
    {
     "say": "เอลฟ์ไม่ถูกกับเตาไฟ",
     "if": "race=elf&!done:s1_02_letter"
    },
    {
     "say": "หางเจ้าอย่าเข้าใกล้เตา",
     "if": "race=cat&!done:s1_02_letter"
    }
   ],
   "note": "Human keeps the existing 'ไปให้พ้น' line only."
  },
  {
   "quest": "c2_m1_arrival",
   "block": "objectives[talk npc_mira].say",
   "mode": "insert_after",
   "anchor": "หยุดตรงนั้น",
   "who": "มิรา",
   "lines": [
    {
     "say": "เขา... เจ้าเหมือนมัน แต่ตัวเล็กกว่า... ขอโทษ ข้าไม่ได้ตั้งใจ",
     "if": "race=demon"
    }
   ]
  },
  {
   "quest": "c2_m3_kraga",
   "block": "first talk with npc_demon_wounded (Kraga)",
   "mode": "insert_first",
   "who": "ครากา",
   "lines": [
    {
     "say": "เลือดเดียวกัน... อย่าคิดว่าข้าจะใจดีกว่าเดิม",
     "if": "race=demon"
    }
   ]
  },
  {
   "npc": "npc_monk_suri",
   "quest": "sp_03_guardian18",
   "block": "first greeting",
   "mode": "greet_first",
   "who": "หลวงตาสุริ",
   "lines": [
    {
     "say": "เดินมาไกลนะโยม"
    },
    {
     "say": "เขาบนหัวไม่ได้หนักเท่าใจหรอกโยม",
     "if": "race=demon"
    }
   ],
   "note": "Use the monk's npc id from special_guardian18_v1_2.json."
  }
 ],
 "villain_defeat_rule": {
  "source": "RACE_LORE_v1 sec 2.1",
  "status": "no villain defeat in Ch1-2 yet; Varg template for a later chapter",
  "varg_template": [
   {
    "who": "(ผู้เล่น)",
    "say": "เราเกิดมาเผ่าเดียวกัน... แต่เจ้าเลือกเดินไปอีกทาง",
    "if": "race=human"
   },
   {
    "who": "(ผู้เล่น)",
    "say": "คนชอบชี้ว่าเผ่าข้าเป็นตัวร้าย ขนาดมนุษย์อย่างเจ้า ยังไปรับใช้ความมืดได้",
    "if": "race=demon"
   },
   {
    "who": "(ผู้เล่น)",
    "say": "ตำนานเผ่าข้าเล่าถึงคนแบบเจ้า... ไม่เคยมีตอนจบดี",
    "if": "race=elf"
   },
   {
    "who": "(ผู้เล่น)",
    "say": "หางข้าตั้งตั้งแต่ได้กลิ่นเจ้าแล้ว ไม่ใช่เพราะเผ่า แต่เพราะสิ่งที่เจ้าทำ",
    "if": "race=cat"
   },
   {
    "who": "วาร์ก",
    "say": "เผ่า? ...แสงหรือมืดไม่เคยถามข้าว่าเกิดมาเป็นอะไร"
   }
  ]
 },
 "changelog": [
  "v1_1 11 Nov: Lysel lines moved pro_02 -> pro_05_rebirth (Code found no anchor in pro_02)"
 ]
};
