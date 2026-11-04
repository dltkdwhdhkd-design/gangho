// 적의 동작과 적 자료
import { SKILLS } from './data.js';
const M = (range, dur, steps, o = {}) => ({ range, dur, steps, ...o });
const arc = (r, a, mul, o = {}) => ({ shape: 'arc', r, a, mul, kb: 26, stun: .3, ...o });
const line = (len, w, mul, o = {}) => ({ shape: 'line', len, w, mul, kb: 30, stun: .3, ...o });
const cir = (r, mul, o = {}) => ({ shape: 'circle', r, mul, kb: 46, stun: .4, ...o });
export const MOVES = {
  slash: M(24, .86, [{ t: .44, sfx: 'sword', move: { d: 8, dur: .06 }, hit: arc(24, 70, 1), fx: { n: 'curve', s: 1 } }]),
  quick: M(22, .6, [{ t: .28, sfx: 'sword', move: { d: 6, dur: .05 }, hit: arc(22, 65, .8), fx: { n: 'curve', s: 1, flip: 1 } }]),
  punch: M(18, .7, [{ t: .34, sfx: 'hit1', move: { d: 7, dur: .05 }, hit: arc(18, 70, 1), fx: { n: 'claw', s: .8 } }]),
  lunge: M(52, 1, [{ t: .52, sfx: 'jump', move: { d: 46, dur: .1 }, hit: line(52, 12, 1.3, { back: 46 }), fx: { n: 'cut', s: 1.3, along: 1 } }]),
  double: M(26, 1.05, [{ t: .36, sfx: 'sword', move: { d: 6, dur: .05 }, hit: arc(26, 70, .8), fx: { n: 'curve', s: 1 } }, { t: .66, sfx: 'sword2', move: { d: 8, dur: .05 }, hit: arc(28, 80, 1.1), fx: { n: 'double', s: 1.2 } }]),
  heavy: M(34, 1.4, [{ t: .82, sfx: 'boom2', hit: cir(30, 2, { off: 20, ub: true, stun: .6 }), fx: { n: 'rock', s: 1.2, at: 'front', off: 20 }, shake: 3 }]),
  spin: M(34, 1.3, [{ t: .74, sfx: 'sword2', hit: cir(38, 1.7, { ub: true }), fx: { n: 'circle', s: 1.7, at: 'self' } }]),
  arrow: M(120, 1.1, [{ t: .6, sfx: 'sword', proj: { img: 'p_arrow', speed: 165, mul: 1, life: 1.2, r: 4, stun: .25 } }], { keep: 80 }),
  dart3: M(100, 1, [{ t: .5, sfx: 'sword', proj: { img: 'p_kunai', speed: 190, mul: .8, life: .9, n: 3, spread: 16, r: 4, stun: .2 } }], { keep: 70 }),
  charge: M(100, 1.5, [{ t: .66, sfx: 'jump', rush: { d: 120, dur: .4, mul: 1.5, kb: 80, stun: .5 } }], { tele: { shape: 'line', len: 120, w: 16 } }),
  bite: M(18, .62, [{ t: .28, sfx: 'hit2', move: { d: 8, dur: .05 }, hit: arc(18, 70, .9), fx: { n: 'claw', s: .8 } }]),
  venom: M(18, .72, [{ t: .34, sfx: 'hit2', move: { d: 10, dur: .05 }, hit: arc(18, 70, .7, { dot: { dps: .35, t: 3 } }), fx: { n: 'claw', s: .8 } }]),
  spit: M(110, 1.2, [{ t: .6, sfx: 'fireball', proj: { img: 'p_fire', speed: 120, mul: 1.2, life: 1.6, r: 6, stun: .3 } }], { keep: 70 }),
  rain: M(160, 1.5, [{ t: .3, sfx: 'alert', zone: { at: 'target', n: 3, spread: 34, r: 16, delay: .85, mul: 1.5, ub: true, stun: .4, fx: 'flam', sfx: 'boom2' } }]),
  quake: M(46, 1.5, [{ t: .25, zone: { at: 'self', r: 52, delay: .75, mul: 1.8, ub: true, stun: .5, fx: 'rock', sfx: 'boom' } }]),
  blink: M(130, 1.1, [{ t: .4, sfx: 'magic2', blink: { behind: 14, enemy: true }, fx: { n: 'smoke', s: 1, at: 'self' } }, { t: .72, sfx: 'sword2', hit: arc(26, 90, 1.5), fx: { n: 'double', s: 1.2 } }], { noTele: true }),
  fan5: M(140, 1.3, [{ t: .66, sfx: 'magic1', proj: { img: 'p_energy', speed: 130, mul: 1.1, life: 1.5, n: 5, spread: 18, r: 6, stun: .3 } }]),
  ring8: M(120, 1.5, [{ t: .8, sfx: 'magic3', proj: { img: 'p_bigenergy', speed: 110, mul: 1.2, life: 1.6, n: 8, spread: 45, r: 8, stun: .3 } }], { tele: { shape: 'circle', r: 26 } }),
  flurry: M(30, 1.5, [.42, .58, .74, .9].map((t, i) => ({ t, sfx: i % 2 ? 'sword' : 'sword2', move: { d: 7, dur: .05 }, hit: arc(28, 75, .75), fx: { n: 'curve', s: 1.1, flip: i % 2 } }))),
  summon2: M(200, 1.2, [{ t: .6, sfx: 'strange', spawn: { id: 'minion', n: 2 } }], { once: 14 }),
};
for (const k in MOVES) MOVES[k].id = k;
for (const k in SKILLS) if (!MOVES[k]) {
  const s = SKILLS[k]; const h = s.steps.find(x => x.hit || x.proj);
  let range = 40;
  if (h && h.hit) range = (h.hit.shape === 'line' ? h.hit.len : h.hit.r) * .9;
  if (h && h.proj) range = 100;
  MOVES[k] = { ...s, id: k, range, fromSkill: true };
}

const F = (name, spr, hp, atk, def, spd, exp, silver, pause, moves, o = {}) => ({ name, spr, hp, atk, def, spd, exp, silver, pause, moves, ...o });
export const FOES = {
  // 프롤로그
  rowdy: F('왈패', 'chars/Villager2', 34, 6, 0, 46, 8, 3, 1.5, ['slash'], { wpn: 'Club' }),
  rowdy2: F('왈패 두목', 'chars/Caveman', 58, 8, 1, 48, 14, 8, 1.3, ['slash', 'heavy'], { wpn: 'Club' }),
  shadow0: F('흑의인', 'chars/DarkNinja', 48, 8, 1, 62, 14, 4, 1.2, ['quick', 'dart3'], { wpn: 'Ninjaku' }),
  // 1장
  boar: F('멧돼지', 'mon/Beast', 62, 10, 2, 50, 12, 2, 1.3, ['charge', 'bite'], { mon: 1 }),
  snake: F('독사', 'mon/Snake', 40, 8, 0, 60, 10, 2, 1.1, ['venom'], { mon: 1 }),
  raccoon: F('너구리', 'mon/Racoon', 46, 8, 1, 62, 10, 3, 1.1, ['bite', 'charge'], { mon: 1 }),
  bamboo: F('죽귀', 'mon/Bamboo', 60, 10, 3, 42, 14, 3, 1.3, ['slash', 'spit'], { mon: 1 }),
  bandit: F('산적', 'chars/Villager2', 74, 11, 2, 52, 16, 6, 1.25, ['slash', 'lunge'], { wpn: 'Axe' }),
  archer: F('산적 궁수', 'chars/Samurai', 52, 11, 1, 46, 16, 6, 1.3, ['arrow'], { keep: 90 }),
  bruiser: F('산적 행동대장', 'chars/Caveman2', 170, 15, 4, 44, 44, 20, 1.2, ['heavy', 'slash', 'spin'], { wpn: 'BigSword', elite: 1, poise: 30 }),
  raccoon_king: F('대왕 너구리', 'boss/GiantRacoon', 520, 14, 3, 48, 90, 40, 1, ['heavy', 'charge', 'quake', 'bite'], { boss: 1, poise: 90, big: { frames: 6, w: 60, h: 60, img: 'boss/GiantRacoonIdle' }, r: 13 }),
  lion: F('광사자 맹호', 'chars/Lion', 760, 17, 5, 58, 160, 120, .95, ['slash', 'double', 'heavy', 'spin', 'lunge'], { wpn: 'BigSword', boss: 1, poise: 120, phases: [{ hp: .5, say: '하하! 이제 좀 몸이 풀리는군!', add: ['flurry', 'quake'], pause: .75 }], scale: 1.4 }),
  // 1부 장강수로채
  pirate: F('수적', 'chars/Villager3', 58, 9, 1, 54, 13, 5, 1.25, ['slash', 'lunge'], { wpn: 'Axe', drops: [['ore_iron', .2, 1, 1]] }),
  pirate_bow: F('수적 궁수', 'chars/Samurai', 44, 9, 1, 48, 13, 5, 1.3, ['arrow'], { keep: 90 }),
  pirate_hook: F('갈고리 수적', 'chars/Caveman', 112, 12, 3, 50, 28, 12, 1.2, ['heavy', 'lunge', 'slash'], { wpn: 'Club', elite: 1, poise: 20 }),
  wei: F('낭리비어 위충', 'chars/Paeng', 640, 15, 4, 66, 130, 90, .95, ['double', 'lunge', 'spin', 'dart3', 'heavy'], { wpn: 'Lance', boss: 1, poise: 100, phases: [{ hp: .5, say: '강에서는 내가 법이다!', add: ['flurry', 'rain'], pause: .78 }], scale: 1.3 }),
  // 2장
  disciple: F('창운문 제자', 'chars/GreenNinja', 140, 18, 5, 60, 34, 14, 1.2, ['slash', 'swallow_qi', 'cloud_flash'], { wpn: 'Sword', guard: .5 }),
  senior_go: F('사형 고진', 'chars/Inspector', 420, 22, 7, 62, 110, 60, 1, ['double', 'cloud_flash', 'swallow_qi', 'wind_turn'], { wpn: 'Sword', guard: .7, boss: 1, poise: 70 }),
  so_rival: F('소연하', 'chars/RedSamurai', 620, 24, 7, 76, 180, 0, .9, ['flurry', 'cloud_flash', 'blink', 'fan5'], { wpn: 'Katana', guard: 1, boss: 1, poise: 90, title: '벽수궁 객원' }),
  shadow: F('무면회 살수', 'chars/GrayNinja', 190, 24, 6, 72, 50, 16, 1.05, ['quick', 'blink', 'dart3'], { wpn: 'Ninjaku', guard: .3 }),
  puppet: F('독강시', 'chars/Skeleton', 240, 26, 12, 40, 60, 10, 1.3, ['venom', 'heavy'], { poise: 30 }),
  elder_wi: F('검각주 위문상', 'chars/Noble', 1560, 30, 10, 66, 420, 300, .85, ['double', 'cloud_flash', 'swallow_qi', 'fan5', 'heavy'], { wpn: 'Rapier', guard: .8, boss: 1, poise: 160, phases: [{ hp: .55, say: '제법이구나. 그럼 이건 어떠냐.', add: ['flurry', 'rain', 'summon2'], pause: .7 }], minion: 'shadow', scale: 1.3 }),
  // 3장
  fighter_a: F('공동파 곽충', 'chars/Monk', 460, 30, 9, 58, 110, 60, 1, ['iron_fist', 'chain_kick', 'earth_stomp'], { wpn: 'Club', guard: .6, poise: 50, elite: 1 }),
  fighter_b: F('팽가 마혜', 'chars/Cavegirl', 520, 32, 9, 74, 130, 70, .9, ['flurry', 'blood_fan', 'quick'], { wpn: 'Ninjaku', guard: .5, poise: 50, elite: 1 }),
  fighter_c: F('곤륜파 등표', 'chars/GoldKnight', 640, 34, 12, 56, 160, 90, 1, ['heavy', 'spin', 'rain', 'one_point'], { wpn: 'Lance', guard: .5, poise: 80, elite: 1 }),
  cheolu_spar: F('철우', 'chars/Monk2', 700, 30, 14, 56, 170, 0, 1, ['iron_fist', 'chain_kick', 'earth_stomp', 'heavy'], { wpn: 'Club', guard: .8, boss: 1, poise: 120 }),
  so_final: F('소연하', 'chars/RedSamurai', 1500, 37, 11, 84, 460, 400, .8, ['flurry', 'cloud_flash', 'blink', 'fan5', 'wind_turn', 'moon3'], { wpn: 'Katana', guard: 1.2, boss: 1, poise: 170, phases: [{ hp: .5, say: '여기서부터 진심이야.', add: ['rain', 'sky_sword'], pause: .65 }] }),
  shadow2: F('무면회 살수', 'chars/DarkNinja', 300, 36, 9, 80, 80, 20, 1, ['quick', 'blink', 'dart3', 'lunge'], { wpn: 'Ninjaku', guard: .5 }),
  // 4장
  ghost: F('원혼', 'mon/Spirit', 300, 40, 6, 56, 90, 16, 1.1, ['spit', 'blink', 'bite'], { mon: 1 }),
  skull: F('백골병', 'chars/Skeleton', 380, 42, 16, 50, 100, 16, 1.1, ['slash', 'heavy', 'lunge'], { wpn: 'Sword', poise: 40 }),
  demon_eye: F('혈안귀', 'boss/DemonCyclop', 1900, 44, 12, 50, 520, 300, .85, ['heavy', 'ring8', 'quake', 'rain', 'charge'], { boss: 1, poise: 200, big: { frames: 5, w: 50, h: 50, img: 'boss/DemonCyclopIdle' }, r: 13 }),
  fox: F('호면', 'chars/MaskedNinja', 2600, 46, 14, 88, 800, 500, .75, ['moon1', 'moon3', 'blink', 'flurry', 'fan5', 'dart3'], { wpn: 'Katana', guard: 1.2, boss: 1, poise: 220, phases: [{ hp: .5, say: '이 달빛이 네 것이라 생각했나.', add: ['moon5', 'rain', 'ring8'], pause: .6 }], scale: 1.2 }),
  fox0: F('호면', 'chars/MaskedNinja', 9999, 28, 30, 80, 0, 0, 1, ['blink', 'flurry', 'moon1'], { wpn: 'Katana', boss: 1, poise: 9999, nameplate: '???' }),
  chief: F('맹주 연경추', 'chars/Master', 3600, 44, 15, 76, 1500, 1000, .8, ['sky_sword', 'wind_turn', 'moon5', 'ring8', 'flurry', 'blink', 'quake'], { wpn: 'BigSword', guard: 1.2, boss: 1, poise: 320, phases: [{ hp: .66, say: '너희 사문이 왜 망했는지 아느냐.', add: ['rain', 'moon3'], pause: .68 }, { hp: .33, say: '월하칠식은 내가 먼저 완성했다!', add: ['moon6x', 'fan5'], pause: .55 }], scale: 1.5 }),
  // 현상수배
  wanted1: F('좀도둑 쥐눈이', 'chars/EggBoy', 120, 12, 2, 80, 40, 40, .9, ['quick', 'dart3'], { wpn: 'Ninjaku', elite: 1 }),
  wanted2: F('독수리 마삼', 'chars/Samurai', 340, 24, 6, 70, 120, 120, .95, ['double', 'arrow', 'lunge'], { wpn: 'Axe', elite: 1, poise: 40 }),
  wanted3: F('인면수 낭패', 'chars/Lion', 900, 38, 11, 78, 340, 300, .85, ['flurry', 'heavy', 'charge', 'quake'], { wpn: 'BigSword', elite: 1, poise: 100 }),
  so_ally: F('소연하', 'chars/RedSamurai', 1500, 42, 10, 80, 0, 0, 1, ['flurry', 'cloud_flash', 'fan5'], { wpn: 'Katana' }),
  cheol_ally: F('철우', 'chars/Monk2', 1900, 38, 16, 58, 0, 0, 1.2, ['iron_fist', 'chain_kick', 'earth_stomp'], { wpn: 'Club' }),
  dummy: F('허수아비', 'chars/Villager', 99999, 0, 0, 0, 0, 0, 99, [], { dummy: 1, stamp: 'stump' }),
  log: F('장작더미', 'chars/Villager', 26, 0, 0, 0, 4, 0, 99, [], { dummy: 1, stamp: 'log' }),
};
MOVES.moon6x = MOVES.quake;
