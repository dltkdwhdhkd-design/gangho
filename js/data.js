// 무공, 무기, 심법, 물건 자료
export const WEAPONS = {
  stick: { name: '낡은 목검', type: '검', atk: 3, spr: 'Stick', desc: '백 노인이 방값 대신 두고 간 목검. 손잡이가 닳아 있다.' },
  iron_sword: { name: '철검', type: '검', atk: 9, spr: 'Sword', price: 90, desc: '대장간에서 흔히 파는 쇠칼. 쓸 만하다.' },
  blue_sword: { name: '청강검', type: '검', atk: 17, spr: 'Rapier', price: 420, desc: '푸른 빛이 도는 잘 벼린 검.' },
  moon_sword: { name: '월영검', type: '검', atk: 30, spr: 'Katana', desc: '달빛을 받으면 칼날이 희게 빛나는 옛 검.' },
  iron_blade: { name: '박도', type: '도', atk: 12, spr: 'BigSword', price: 110, desc: '넓적한 칼. 느리지만 묵직하다.' },
  ghost_blade: { name: '귀두도', type: '도', atk: 22, spr: 'Axe', price: 480, desc: '칼등에 귀신 머리가 새겨진 대도.' },
  iron_spear: { name: '철창', type: '창', atk: 10, spr: 'Lance', price: 100, desc: '길어서 먼저 닿는다.' },
  dragon_spear: { name: '유룡창', type: '창', atk: 19, spr: 'Lance2', price: 450, desc: '창대가 낭창낭창한 명창.' },
  fist_wrap: { name: '면장갑', type: '권', atk: 6, spr: 'Sai', price: 60, desc: '손을 감싼 천. 맨손으로 싸우는 사람의 무기.' },
  iron_gauntlet: { name: '철권투', type: '권', atk: 15, spr: 'Club', price: 400, desc: '쇠로 만든 권투.' },
};

// 평타: 무기 종류마다 다르다
const arc = (r, a, mul, o = {}) => ({ shape: 'arc', r, a, mul, kb: 22, stun: .22, ...o });
const line = (len, w, mul, o = {}) => ({ shape: 'line', len, w, mul, kb: 24, stun: .22, ...o });
const b = (t, step, hit, fx, sfx, dur, cancel) => ({ basic: true, dur, cancel, steps: [{ t: 0, move: { d: step, dur: .08 } }, { t, hit, fx, sfx }] });
export const BASIC = {
  검: [b(.07, 5, arc(24, 65, .85), { n: 'curve', s: 1, flip: 0 }, 'sword', .26, .14), b(.07, 5, arc(24, 65, .95), { n: 'curve', s: 1, flip: 1 }, 'sword', .26, .14), b(.09, 9, arc(27, 80, 1.4, { kb: 46, stun: .34 }), { n: 'double', s: 1.2 }, 'sword2', .38, .22)],
  도: [b(.13, 5, arc(26, 75, 1.25, { kb: 34, stun: .3 }), { n: 'curve', s: 1.2, flip: 0 }, 'sword2', .42, .24), b(.16, 10, arc(30, 90, 1.9, { kb: 70, stun: .42 }), { n: 'double2', s: 1.4 }, 'boom2', .54, .3)],
  창: [b(.08, 4, line(38, 9, .8), { n: 'slash', s: 1.1, along: 1 }, 'sword', .3, .16), b(.08, 4, line(38, 9, .85), { n: 'slash', s: 1.1, along: 1 }, 'sword', .3, .16), b(.11, 8, line(44, 12, 1.35, { kb: 54, stun: .34 }), { n: 'cut', s: 1.3, along: 1 }, 'sword2', .42, .24)],
  권: [b(.05, 3, arc(17, 70, .55), { n: 'claw', s: .7 }, 'mini', .17, .1), b(.05, 3, arc(17, 70, .6), { n: 'claw', s: .7 }, 'mini', .17, .1), b(.05, 3, arc(17, 70, .65), { n: 'claw', s: .8 }, 'hit1', .17, .1), b(.09, 9, arc(21, 80, 1.3, { kb: 56, stun: .36 }), { n: 'spark', s: 1 }, 'hit3', .32, .2)],
};

// 초식. steps 안의 t는 초식을 시작한 뒤 흐른 초.
const S = (name, han, w, school, mp, cd, desc, dur, steps, o = {}) => ({ name, han, w, school, mp, cd, desc, dur, steps, ...o });
export const SKILLS = {
  // 공통
  tray: S('쟁반 던지기', '', '무관', '점소이 잡기', 5, 3, '객잔에서 십 년 갈고닦은 쟁반 투척. 날아갔다가 돌아온다.', .3, [{ t: .08, sfx: 'jump', proj: { img: 'tray', speed: 170, mul: 1.1, life: 1.05, ret: true, pierce: true, r: 6, stun: .3 } }]),
  dart: S('비도술', '飛刀術', '무관', '강호 잡학', 8, 4, '비도 세 자루를 부채꼴로 던진다.', .3, [{ t: .1, sfx: 'sword', proj: { img: 'p_kunai', speed: 230, mul: .8, life: .9, n: 3, spread: 16, r: 4, stun: .15 } }]),
  breath: S('운기조식', '運氣調息', '무관', '강호 잡학', 0, 22, '잠깐 멈춰 숨을 고른다. 체력과 내력이 조금 돌아온다.', .9, [{ t: .05, sfx: 'power1', fx: { n: 'aura', s: 1.4, at: 'self' } }, { t: .7, heal: { hp: .16, mp: .12 } }], { self: true }),
  // 검
  cloud_flash: S('청운일섬', '靑雲一閃', '검', '청운검법', 14, 5, '앞으로 번개처럼 파고들며 벤다. 파고드는 동안 맞지 않는다.', .42, [{ t: 0, sfx: 'sword2', move: { d: 62, dur: .13, iframe: true, ghost: true } }, { t: .13, hit: { shape: 'line', len: 66, w: 14, back: 66, mul: 2.1, kb: 40, stun: .4 }, fx: { n: 'cut', s: 1.4, along: 1 } }]),
  flow_three: S('유운삼검', '流雲三劍', '검', '청운검법', 16, 7, '구름 흐르듯 세 번 잇달아 벤다.', .62, [{ t: .05, sfx: 'sword', move: { d: 7, dur: .07 }, hit: { shape: 'arc', r: 28, a: 75, mul: .95, kb: 12, stun: .24 }, fx: { n: 'curve', s: 1.2, flip: 0 } }, { t: .2, sfx: 'sword', move: { d: 7, dur: .07 }, hit: { shape: 'arc', r: 28, a: 75, mul: .95, kb: 12, stun: .24 }, fx: { n: 'curve', s: 1.2, flip: 1 } }, { t: .37, sfx: 'sword2', move: { d: 10, dur: .07 }, hit: { shape: 'arc', r: 32, a: 90, mul: 1.5, kb: 56, stun: .4 }, fx: { n: 'double', s: 1.4 } }]),
  wind_turn: S('회풍검', '回風劍', '검', '청운검법', 18, 8, '몸을 돌려 주위를 모두 벤다. 둘러싸였을 때 좋다.', .5, [{ t: .12, sfx: 'sword2', hit: { shape: 'circle', r: 34, mul: 2, kb: 62, stun: .4 }, fx: { n: 'circle', s: 1.5, at: 'self' } }]),
  swallow_qi: S('비연검기', '飛燕劍氣', '검', '청운검법', 12, 4, '검기를 날려 멀리 있는 적을 벤다.', .34, [{ t: .12, sfx: 'magic1', proj: { img: 'p_energy', speed: 200, mul: 1.5, life: .95, r: 7, pierce: true, stun: .3 } }]),
  fall_flower: S('낙화유수', '落花流水', '검', '청운검법', 10, 9, '자세를 낮추고 기다린다. 이때 맞으면 흘리고 되받아 벤다.', .7, [{ t: 0, sfx: 'select', counter: { dur: .62, mul: 2.8 }, fx: { n: 'shieldy', s: 1.1, at: 'self' } }], { self: true }),
  sky_sword: S('창궁무애검', '蒼穹無涯劍', '검', '남궁세가', 45, 28, '[절초] 하늘을 가르듯 내리긋는다. 앞의 적을 쓸어버린다.', .85, [{ t: .02, cut: 1 }, { t: .32, sfx: 'boom', hit: { shape: 'line', len: 150, w: 34, mul: 5.5, kb: 90, stun: .8, ub: true }, fx: { n: 'cut', s: 3.2, along: 1 }, shake: 5 }], { ult: true }),
  // 도
  break_mount: S('파산일도', '破山一刀', '도', '파산도법', 18, 7, '온몸을 실어 내리찍는다. 치는 동안 밀리지 않는다.', .72, [{ t: 0, armor: .5 }, { t: .36, sfx: 'boom2', move: { d: 12, dur: .05 }, hit: { shape: 'circle', off: 22, r: 28, mul: 3, kb: 70, stun: .6 }, fx: { n: 'rock', s: 1.2, at: 'front', off: 22 }, shake: 3 }]),
  mad_wind: S('광풍난무', '狂風亂舞', '도', '파산도법', 22, 10, '회전하며 앞으로 밀고 나간다.', .9, [{ t: 0, armor: .9, move: { d: 70, dur: .8 } }, ...[.08, .24, .4, .56, .72].map((t, i) => ({ t, sfx: i % 2 ? 'sword' : 'sword2', hit: { shape: 'circle', r: 28, mul: .85, kb: 18, stun: .22 }, fx: { n: 'circle', s: 1.3, at: 'self' } }))]),
  blood_fan: S('혈선도', '血扇刀', '도', '파산도법', 14, 5, '부채처럼 넓게 휘두른다.', .5, [{ t: .17, sfx: 'sword2', hit: { shape: 'arc', r: 42, a: 80, mul: 2.2, kb: 48, stun: .4 }, fx: { n: 'double2', s: 1.8 } }]),
  tiger_roar: S('오호단문도', '五虎斷門刀', '도', '하북팽가', 45, 28, '[절초] 범이 울부짖듯 땅을 가른다.', .95, [{ t: .02, cut: 1, armor: .9 }, { t: .4, sfx: 'boom', hit: { shape: 'circle', off: 34, r: 62, mul: 6, kb: 110, stun: .9, ub: true }, fx: { n: 'rock', s: 2.8, at: 'front', off: 34 }, shake: 6 }], { ult: true }),
  // 창
  one_point: S('일점돌', '一點突', '창', '유룡창법', 10, 3.5, '창끝 하나에 힘을 모아 길게 찌른다.', .4, [{ t: .14, sfx: 'sword2', move: { d: 10, dur: .06 }, hit: { shape: 'line', len: 64, w: 11, mul: 2, kb: 44, stun: .36 }, fx: { n: 'cut', s: 1.8, along: 1 } }]),
  dragon_pass: S('유룡천', '遊龍穿', '창', '유룡창법', 16, 6, '창을 앞세우고 적을 꿰뚫으며 지나간다.', .5, [{ t: 0, sfx: 'jump', move: { d: 96, dur: .2, iframe: true, ghost: true } }, { t: .18, sfx: 'sword2', hit: { shape: 'line', len: 104, w: 16, back: 100, mul: 2.2, kb: 26, stun: .4 }, fx: { n: 'slash', s: 1.8, along: 1 } }]),
  sweep_army: S('횡소천군', '橫掃千軍', '창', '유룡창법', 18, 7, '창을 크게 휘둘러 앞을 쓸어낸다.', .54, [{ t: .18, sfx: 'sword2', hit: { shape: 'arc', r: 52, a: 110, mul: 2.2, kb: 84, stun: .45 }, fx: { n: 'double2', s: 2.1 } }]),
  hundred_flower: S('백화난무', '百花亂舞', '창', '유룡창법', 24, 10, '꽃잎이 쏟아지듯 창을 잇달아 찌른다.', .86, [.08, .18, .28, .38, .48, .58, .68].map((t, i) => ({ t, sfx: i % 2 ? 'mini' : 'sword', hit: { shape: 'line', len: 50, w: 16, mul: .55, kb: i == 6 ? 56 : 4, stun: .2 }, fx: { n: 'slash', s: 1.1, along: 1 } }))),
  sky_pierce: S('천룡강림', '天龍降臨', '창', '유룡창법', 45, 28, '[절초] 높이 뛰어올라 창과 함께 내리꽂힌다.', 1, [{ t: .02, cut: 1, iframe: .55, jump: .5 }, { t: .52, sfx: 'boom', hit: { shape: 'circle', r: 56, mul: 5.8, kb: 90, stun: .9, ub: true }, fx: { n: 'thunder', s: 2.4, at: 'self' }, shake: 6 }], { ult: true, teleToFoe: true }),
  // 권
  iron_fist: S('붕권', '崩拳', '권', '소림 외가권', 8, 3, '짧게 내질러 상대를 크게 밀어낸다.', .32, [{ t: .1, sfx: 'hit3', move: { d: 8, dur: .05 }, hit: { shape: 'arc', r: 22, a: 60, mul: 2.2, kb: 96, stun: .45 }, fx: { n: 'spark', s: 1.3, at: 'front', off: 14 } }]),
  chain_kick: S('연환각', '連環脚', '권', '소림 외가권', 14, 6, '발차기를 쉬지 않고 이어 간다.', .72, [.06, .18, .3, .42, .56].map((t, i) => ({ t, sfx: 'mini', move: { d: 10, dur: .06 }, hit: { shape: 'arc', r: 22, a: 75, mul: i == 4 ? 1.3 : .7, kb: i == 4 ? 60 : 6, stun: .24 }, fx: { n: 'claw', s: .9 } }))),
  earth_stomp: S('진각', '震脚', '권', '소림 외가권', 16, 8, '땅을 굴러 주위 적의 다리를 묶는다.', .5, [{ t: .18, sfx: 'boom2', hit: { shape: 'circle', r: 40, mul: 1.5, kb: 16, stun: 1 }, fx: { n: 'ring', s: 1.8, at: 'self' }, shake: 3 }]),
  diamond_body: S('금강호체', '金剛護體', '권', '소림 외가권', 20, 18, '여섯 호흡 동안 살이 쇠처럼 굳는다. 받는 피해가 줄고 밀리지 않는다.', .4, [{ t: .1, sfx: 'power2', buff: { id: 'diamond', dur: 6 }, fx: { n: 'shieldy', s: 1.4, at: 'self' } }], { self: true }),
  tathagata: S('여래신장', '如來神掌', '권', '소림사', 45, 28, '[절초] 손바닥 하나에 내력을 다 실어 내민다.', .9, [{ t: .02, cut: 1, armor: .8 }, { t: .36, sfx: 'boom', hit: { shape: 'arc', r: 76, a: 55, mul: 6, kb: 130, stun: .9, ub: true }, fx: { n: 'spark', s: 4, at: 'front', off: 34 }, shake: 6 }], { ult: true }),
  // 구파일방
  luohan: S('나한복호권', '羅漢伏虎拳', '권', '소림사', 14, 5, '범을 누르듯 세 번 내리친다. 마지막 일격이 묵직하다.', .66, [{ t: .08, sfx: 'hit1', move: { d: 7, dur: .05 }, hit: { shape: 'arc', r: 24, a: 70, mul: 1, kb: 10, stun: .26 }, fx: { n: 'claw', s: 1 } }, { t: .24, sfx: 'hit1', move: { d: 7, dur: .05 }, hit: { shape: 'arc', r: 24, a: 70, mul: 1, kb: 10, stun: .26 }, fx: { n: 'claw', s: 1 } }, { t: .42, sfx: 'hit3', move: { d: 10, dur: .05 }, hit: { shape: 'circle', off: 16, r: 24, mul: 2, kb: 76, stun: .5 }, fx: { n: 'spark', s: 1.6, at: 'front', off: 16 }, shake: 2 }]),
  taiji: S('태극혜검', '太極慧劍', '검', '무당파', 16, 8, '둥근 원을 그린다. 날아오던 것이 사라지고 주위가 베인다.', .5, [{ t: .12, sfx: 'magic2', clearProj: true, hit: { shape: 'circle', r: 38, mul: 1.8, kb: 34, stun: .5 }, fx: { n: 'ringw', s: 2, at: 'self' } }]),
  plum: S('이십사수매화검법', '二十四手梅花劍法', '검', '화산파', 20, 8, '검 끝에서 매화 일곱 송이가 부채꼴로 흩날린다.', .52, [{ t: .16, sfx: 'magic1', proj: { img: 'plum', speed: 185, mul: .8, life: .72, n: 7, spread: 9, r: 5, stun: .22 } }]),
  zhongnan: S('천하삼십육검', '天下三十六劍', '검', '종남파', 18, 7, '곧게 나아가며 쉬지 않고 찌르고 벤다.', .72, [.06, .16, .26, .36, .46, .56].map((t, i) => ({ t, sfx: i % 2 ? 'mini' : 'sword', move: { d: 9, dur: .05 }, hit: { shape: 'arc', r: 26, a: 60, mul: i === 5 ? 1.3 : .62, kb: i === 5 ? 56 : 6, stun: .22 }, fx: { n: 'curve', s: 1.1, flip: i % 2 } }))),
  emei: S('불광보조', '佛光普照', '무관', '아미파', 22, 14, '빛이 번지며 주위 적을 밀어내고 체력을 되찾는다.', .46, [{ t: .14, sfx: 'power1', heal: { hp: .14, mp: 0 }, hit: { shape: 'circle', r: 46, mul: 1, kb: 96, stun: .4 }, fx: { n: 'ringw', s: 2.4, at: 'self' } }]),
  kunlun: S('운룡대팔식', '雲龍大八式', '무관', '곤륜파', 20, 9, '구름을 밟듯 뛰어올라 적에게 내려앉으며 벤다.', .68, [{ t: .02, iframe: .42, jump: .4, sfx: 'jump' }, { t: .42, sfx: 'sword2', hit: { shape: 'circle', r: 34, mul: 2.6, kb: 54, stun: .5 }, fx: { n: 'circle', s: 1.6, at: 'self' } }], { teleToFoe: true }),
  kongtong: S('칠상권', '七傷拳', '권', '공동파', 12, 5, '가장 센 주먹이지만 내 몸도 상한다. 체력을 조금 잃는다.', .44, [{ t: .16, sfx: 'boom2', selfhurt: .06, move: { d: 10, dur: .05 }, hit: { shape: 'arc', r: 28, a: 65, mul: 3.8, kb: 90, stun: .6 }, fx: { n: 'spark', s: 1.8, at: 'front', off: 16 }, shake: 3 }]),
  diancang: S('사일검', '射日劍', '검', '점창파', 14, 5, '해를 쏘듯 단 한 번 찌른다. 보이지 않을 만큼 빠르고 멀리 닿는다.', .34, [{ t: .07, sfx: 'sword2', move: { d: 26, dur: .05 }, hit: { shape: 'line', len: 120, w: 10, mul: 2.5, kb: 30, stun: .4 }, fx: { n: 'cut', s: 2.4, along: 1 } }]),
  qingcheng: S('송풍검', '松風劍', '검', '청성파', 14, 5, '솔바람처럼 검기 세 줄기를 내보낸다. 적을 뚫고 지나간다.', .4, [{ t: .14, sfx: 'magic1', proj: { img: 'p_energy', speed: 170, mul: 1, life: .85, n: 3, spread: 15, r: 6, pierce: true, stun: .25 } }]),
  tagu: S('타구봉법', '打狗棒法', '무관', '개방', 12, 6, '막대기로 치듯 다리를 후려 넘어뜨린다. 무기가 달라도 쓴다.', .62, [.06, .2, .34].map((t, i) => ({ t, sfx: 'mini', move: { d: 6, dur: .05 }, hit: { shape: 'arc', r: 26, a: 90, mul: .8, kb: 8, stun: i === 2 ? .9 : .28 }, fx: { n: 'curve', s: 1.1, flip: i % 2 } }))),
  hangryong: S('항룡십팔장', '降龍十八掌', '권', '개방', 45, 28, '[절초] 장력이 용처럼 뻗어 나가 앞의 모두를 밀어낸다.', .9, [{ t: .02, cut: 1, armor: .8 }, { t: .34, sfx: 'boom', hit: { shape: 'line', len: 130, w: 44, mul: 5.6, kb: 130, stun: .8, ub: true }, fx: { n: 'spirit', s: 3.4, at: 'front', off: 44 }, shake: 6 }], { ult: true }),
  // 오대세가
  ihwa: S('이화접목', '移花接木', '무관', '모용세가', 14, 9, '받을 자세를 취한다. 이때 들어온 공격은 막을 수 없는 것이라도 그대로 되돌려 준다.', .86, [{ t: 0, sfx: 'select', counter: { dur: .78, mul: 3.4, all: true }, fx: { n: 'shieldb', s: 1.2, at: 'self' } }], { self: true }),
  palmun: S('팔문금쇄진', '八門金鎖陣', '무관', '제갈세가', 26, 13, '주위 여덟 방위에 진을 깐다. 잠시 뒤 진이 터지며 적을 묶는다.', .42, [{ t: .1, sfx: 'magic3', zone: { at: 'ring', n: 8, dist: 46, r: 16, delay: .55, mul: 1.5, stun: 1.2, kb: 0, player: true, fx: 'ringw', sfx: 'magic2' } }]),
  manchen: S('만천화우', '滿天花雨', '무관', '사천당가', 42, 26, '[절초] 사방으로 독 묻은 암기가 꽃비처럼 쏟아진다.', .7, [{ t: .02, cut: 1 }, { t: .26, sfx: 'magic3', proj: { img: 'p_kunai', speed: 200, mul: 1.1, life: 1, n: 16, spread: 22.5, r: 5, stun: .3, dot: { dps: .3, t: 3 } } }, { t: .42, sfx: 'sword', proj: { img: 'p_kunai', speed: 170, mul: 1.1, life: 1, n: 16, spread: 22.5, r: 5, stun: .3 } }], { ult: true }),
  // 월하칠식: 무기를 가리지 않는다
  moon1: S('제1식 초승', '初生', '무관', '월하칠식', 16, 6, '달이 뜨듯 적의 등 뒤로 건너가 벤다. 백 노인이 걸레질로 가르친 걸음이다.', .42, [{ t: .03, sfx: 'magic2', blink: { behind: 16 }, fx: { n: 'smoke', s: 1, at: 'self' } }, { t: .16, sfx: 'sword2', hit: { shape: 'arc', r: 28, a: 90, mul: 2.4, kb: 40, stun: .45 }, fx: { n: 'double', s: 1.3 } }]),
  moon2: S('제2식 월영', '月影', '무관', '월하칠식', 20, 9, '달그림자를 남기고 물러난다. 잠시 뒤 그림자가 터진다.', .36, [{ t: .02, sfx: 'magic1', zone: { at: 'self', r: 34, delay: .5, mul: 2.6, stun: .6, kb: 50, player: true }, move: { d: -56, dur: .12, iframe: true, ghost: true } }]),
  moon3: S('제3식 반월', '半月', '무관', '월하칠식', 18, 6, '반달 모양의 큰 참격을 날린다. 적을 뚫고 지나간다.', .4, [{ t: .14, sfx: 'magic3', proj: { img: 'crescent', speed: 180, mul: 2.2, life: 1.1, r: 13, pierce: true, stun: .4, kb: 40 } }]),
  moon4: S('제4식 월광', '月光', '무관', '월하칠식', 24, 16, '달빛을 몸에 두른다. 네 호흡 동안 막기만 해도 튕겨낸다.', .34, [{ t: .08, sfx: 'power2', buff: { id: 'moonlight', dur: 4 }, fx: { n: 'shieldb', s: 1.5, at: 'self' } }], { self: true }),
  moon5: S('제5식 만월', '滿月', '무관', '월하칠식', 28, 10, '보름달을 그리듯 크게 벤다. 주위 적을 끌어당긴다.', .66, [{ t: .05, sfx: 'magic2', pull: { r: 84, f: 120 } }, { t: .34, sfx: 'boom2', hit: { shape: 'circle', r: 46, mul: 3.2, kb: 60, stun: .6 }, fx: { n: 'circle', s: 2.3, at: 'self' }, shake: 3 }]),
  moon6: S('제6식 월식', '月蝕', '무관', '월하칠식', 30, 20, '달이 먹히듯 주위가 느려진다. 다섯 호흡 동안 적의 움직임이 무뎌진다.', .4, [{ t: .1, sfx: 'strange', slowfoes: { dur: 5, f: .5 }, fx: { n: 'aurap', s: 2.4, at: 'self' } }], { self: true }),
  moon7: S('제7식 낙월', '落月', '무관', '월하칠식', 60, 34, '[절초] 달이 떨어진다. 화면의 모든 적을 차례로 벤다.', 1.3, [{ t: .02, cut: 1, iframe: 1.25 }, ...[.34, .46, .58, .7, .82, .94].map(t => ({ t, sfx: 'sword2', moonstrike: { mul: 1.5 } })), { t: 1.1, sfx: 'boom', moonstrike: { mul: 3, big: true }, shake: 6 }], { ult: true }),
};

export const HEARTS = {
  none: { name: '없음', desc: '심법을 익히지 않았다.' },
  tonap: { name: '기초토납법', desc: '내력이 30% 빨리 찬다.' },
  iron_shirt: { name: '철포삼', desc: '받는 피해가 10% 줄어든다.' },
  swift: { name: '쾌검심결', desc: '초식 쿨타임이 15% 줄어든다.' },
  fury: { name: '광혈심법', desc: '체력이 절반 아래면 공격력이 25% 오른다.' },
  mercy: { name: '인의심공', desc: '튕겨내기에 성공하면 체력이 조금 돌아온다.' },
  sesu: { name: '세수경 잔결', desc: '소림 노승에게 받은 호흡법. 내력 회복 +20%, 체력 +5%.' },
  yigin: { name: '역근경', desc: '소림의 심법. 최대 체력이 15% 늘어난다.' },
  taecheong: { name: '태청신공', desc: '무당의 심법. 내력이 50% 빨리 찬다.' },
  jaha: { name: '자하신공', desc: '화산의 심법. 초식 위력이 12% 오른다.' },
  changgung: { name: '창궁심결', desc: '남궁의 심법. 쿨타임이 10% 줄고 체력이 10% 늘어난다.' },
  moon_heart: { name: '월하심법', desc: '튕겨내기에 성공하면 모든 쿨타임이 2초 줄어든다.' },
};

export const ITEMS = {
  hp: { name: '금창약', icon: 'hp', price: 12, desc: '전투 중 H 키. 체력을 35% 되찾는다.' },
};
export const RANKS = [[1, '삼류'], [6, '이류'], [11, '일류'], [17, '절정'], [23, '초절정'], [29, '화경']];
export const rankOf = lv => RANKS.reduce((r, [l, n]) => lv >= l ? n : r, '삼류');
export const expNeed = lv => Math.round(18 * Math.pow(lv, 1.32));
