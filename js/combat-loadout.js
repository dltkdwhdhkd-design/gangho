import { WEAPONS } from './data.js';
import { LOOT, ACCS } from './items.js';
import { ARMORS } from './gear.js';

const tools = {
  short_knife:{name:'단도',atk:9,spr:'Ninjaku',gear:'dagger'},
  bow: {name:'각궁',atk:11,gear:'bow'},
  needles: {name:'은침갑',atk:9,gear:'dart'},
  knives: {name:'비도집',atk:24,gear:'dart'},
  staff: {name:'행각장',atk:9,spr:'Stick',gear:'staff'},
  cudgel: {name:'참나무 몽둥이',atk:4,spr:'Club',gear:'club'},
  hatchet: {name:'벌목 도끼',atk:12,spr:'Axe',gear:'blade'},
  ladle: {name:'무쇠 국자',atk:8,spr:'Club',gear:'club'},
};
const personal = {
  yun:['needles','cloth_robe','b_yun'], so:['blue_sword','cloud_robe','b_so'],
  clan_dang:['w_dang','silk_robe','b_dang'], clan_moyong:['w_moyong','silk_robe','b_mo'],
  clan_namgung:['w_namgung','cloud_robe','b_nam'], baekrang:['w_dang','leather_vest','b_bae'],
  hyeok:['moon_sword','silk_robe','b_hyeok'], igyeom:['iron_spear','leather_vest','b_igyeom'],
  mugyeong:['iron_gauntlet','leather_vest','b_mugyeong'], yeonjae:['pine_sword','silk_robe','b_yeonjae'],
  jaeha:['ring_blade','leather_vest','b_jaeha'], cheol:['fist_wrap','cloth_robe','b_cheol'],
  c_gal:['needles','cloth_robe'], gwak:['ladle','cloth_robe'],
  maengso:['fist_wrap','frost_fur','a_jangbaek'], dangbo:['knives','cloud_robe','a_dang'],
  danggunak:['knives','gold_silk','a_dang'], dangpae:['knives','silk_robe','a_dang'],
  danghwa:['needles','silk_robe','a_dang'], dangho:['w_dang','chain_shirt','a_dang'],
  dangjan:['knives','leather_vest','a_dang'], dangsoso:['w_plum','cloth_robe','b_yun'],
  cheongmyeong:['w_plum','cloud_robe','a_plum'], yuseol:['w_plum','wind_robe','a_plum'],
  baekcheon:['w_plum','cloud_robe','a_plum'], yunjong:['blue_sword','cloth_robe','a_plum'],
  jogeol:['blue_sword','leather_vest','a_plum'], ungeom:['w_plum','cloud_robe','a_plum'],
  hongdaegwang:['w_tagu','cloth_robe','a_gae'], guchil:['staff','cloth_robe','a_gae'],
  jongpal:['staff','leather_vest','a_gae'],
};
const aliases={dang:'clan_dang',moyong:'clan_moyong',nam:'clan_namgung',bae:'baekrang',baek:'baekrang',so_rival:'so',gwak_foe:'gwak'};
const common = {Sword:'iron_sword',Rapier:'blue_sword',Katana:'pine_sword',Ninjaku:'short_knife',
  Lance:'iron_spear',Lance2:'dragon_spear',Club:'cudgel',BigSword:'iron_blade',Axe:'hatchet',Sai:'tiger_claw',Stick:'staff'};
const equipmentKind={stick:'wood',fist_wrap:'fist',iron_gauntlet:'ironfist',diamond_fist:'goldfist',
  w_jegal:'fan',w_emei:'piercer',w_dang:'dagger',w_tagu:'staff',w_hangma:'ironfist',w_noeum:'staff',w_podalra:'vajra',
  tiger_claw:'claw',ring_blade:'ringblade'};
const tokens = {
  road:{name:'노잣돈 주머니',fx:{hp:2}},
  guard:{name:'호위패',fx:{def:2}},
};
export function fighterEquipment(id,f) {
  if (f.mon || f.big || f.dummy || !f.spr?.startsWith('chars/')) return null;
  let who=f.artId || id.replace(/^(fan_|pty_|spar_)/,'').replace(/_ally$/,'');
  who=aliases[who] || who;
  const fac=f.school || f.uniform?.replace(/^uniform_/,'') || (id.startsWith('clan_')?id.slice(5):null);
  const local=LOOT[fac], high=(f.realm ?? 0)>=3 || f.boss;
  const moves=f.moves || [];
  const generic=moves.includes('arrow')?'bow':!f.wpn && moves.some(x=>['dart3','fan5'].includes(x))?'knives':
    !f.wpn && moves.some(x=>['iron_fist','punch','luohan'].includes(x))?'fist_wrap':common[f.wpn] || (high?'blue_sword':'stick');
  const rankWeapon=local && high?local[0]:fac==='shaolin'||fac==='gongdong'?'fist_wrap':fac==='gaebang'?'staff':generic;
  const [wid,aid,tid]=personal[who] || [];
  const weapon=tools[wid || rankWeapon] || WEAPONS[wid || rankWeapon];
  const armor=ARMORS[aid || (high?(fac?'cloud_robe':'chain_shirt'):f.elite?'leather_vest':'cloth_robe')];
  const trinket=ACCS[tid || local?.[1]] || tokens[high?'guard':'road'];
  const fx={...armor.fx};
  for (const [key,val] of Object.entries(trinket.fx || {})) fx[key]=(fx[key] || 0)+val;
  return {weapon,armor,trinket,fx,gear:weapon.gear || equipmentKind[wid || rankWeapon] ||
    (weapon.type==='권'?'ironfist':undefined)};
}
export function armedStats(f,e) {
  if (!e) return f;
  const {weapon,fx}=e;
  return {...f, wpn:weapon.spr || null, hp:Math.round(f.hp*(1+(fx.hp || 0)/200)),
    atk:(f.atk+Math.min(weapon.atk*.16,f.atk*.13))*(1+(fx.atk || 0)/200),
    def:f.def+Math.min((fx.def || 0)*.45,2+f.def*.2),spd:f.spd*(1+(fx.spd || 0)/200)};
}
export const nativeMoveNames={
  slash:'가로베기',quick:'쾌격',punch:'정권',lunge:'내지르기',double:'이연격',heavy:'내려치기',spin:'회전격',arrow:'시위 당기기',
  dart3:'삼연비도',charge:'돌진',bite:'물어뜯기',venom:'독니',spit:'독액',rain:'암기비',quake:'진각',blink:'영보',
  fan5:'오방비도',ring8:'팔방기탄',flurry:'난격',tide:'파도치기',summon2:'지원 요청',
};
