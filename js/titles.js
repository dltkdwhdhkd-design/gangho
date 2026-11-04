// 강호 호칭: 조건을 채우면 얻고, 메뉴에서 골라 쓴다
import { G, Sound, toast } from './core.js';
import { CLANS } from './clandata.js';

export const DEFAULT_TITLE = '떠돌이 낭인';
const won = (S, group) => CLANS.filter(c => (!group || c.group === group) && S.flags['clan_' + c.id]).length;
export const TITLES = [
  { id: 'ronin', name: DEFAULT_TITLE, how: '처음부터' },
  { id: 'dog', name: '견대의 마지막 개', how: '처음부터' },
  { id: 'tray', name: '쟁반 점소이', how: '객잔의 왈패를 쟁반으로 내보낸다', ok: S => S.skills.includes('tray') },
  { id: 'guard', name: '청하진의 칼', how: '그믐날 나루를 지킨다', ok: () => G.after('c1e') },
  { id: 'moon', name: '월하문의 마지막 아이', how: '우물 아래에서 편지를 읽는다', ok: S => S.flags.well_open },
  { id: 'cloud', name: '창운문의 객', how: '창운문의 일을 매듭짓는다', ok: () => G.after('t1') },
  { id: 'sweep', name: '장경각 청소부', how: '소림 장경각 바닥을 닦는다', ok: () => G.after('t4') },
  { id: 'champ', name: '천하비무 제일인', how: '구화성 천하비무에서 우승한다', ok: () => G.after('c4a') },
  { id: 'end', name: '달을 이은 사람', how: '월하곡에서 연경추를 쓰러뜨린다', ok: S => S.flags.cleared },
  { id: 'nine', name: '구파일방의 손님', how: '구파일방 다섯 곳에게 인정받는다', ok: S => won(S, '구파일방') >= 5 },
  { id: 'five', name: '오대세가의 골칫거리', how: '오대세가를 모두 꺾는다', ok: S => won(S, '오대세가') >= 5 },
  { id: 'walker', name: '강호행자', how: '열다섯 세력에게 모두 인정받는다', ok: S => won(S) >= 15 },
  { id: 'loot', name: '남의 물건 수집가', how: '비무로 물건 열 개를 가져온다', ok: S => Object.keys(S.taken).length >= 10 },
  { id: 'fish', name: '청하 강태공', how: '물고기 여덟 종을 낚는다', ok: S => Object.keys(S.fishLog).length >= 8 },
  { id: 'house', name: '집 있는 낭인', how: '집을 산다', ok: S => S.flags.own_house },
  { id: 'rich', name: '은자 주머니', how: '은자 삼천 냥을 모은다', ok: S => S.silver >= 3000 },
  { id: 'wed', name: '공처가', how: '혼인한다', ok: S => S.married },
  { id: 'bro', name: '밥값 내는 아우', how: '철우와 의형제를 맺는다', ok: S => S.sworn === 'cheol' },
  { id: 'hero', name: '협객', how: '정파 평판 3', ok: S => S.rep.jeong >= 3 },
  { id: 'sapa', name: '사파의 벗', how: '사파 평판 3', ok: S => S.rep.sa >= 3 },
];
export function checkTitles() {
  const S = G.S; if (!S) return;
  for (const t of TITLES) if (t.ok && !S.titles.includes(t.id) && t.ok(S)) { S.titles.push(t.id); Sound.sfx('bonus'); toast(`호칭을 얻었다: ${t.name}`, 3); }
}
