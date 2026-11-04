// 구파일방과 오대세가: 대화, 비무, 전수
import { G, Sound, toast } from './core.js';
import { Story, ctx, say, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { learn } from './state.js';
import { HEARTS } from './data.js';
import { CLANS, clansWon } from './clandata.js';
import { LOOT } from './items.js';

async function talk(c) {
  const k = 'clan_' + c.id, F = G.S.flags;
  if (F[k]) {
    await say(k, ['잘 지내시오.', '또 보세.', '몸조심하시오.'][c.tier - 1]);
    const left = LOOT[c.id].filter(i => !G.S.taken[i]);
    if (!left.length || G.S.daily['duel_' + c.id]) return;
    const a = await choice(`다시 비무를 청할까? 이기면 ${c.who}의 물건 하나를 가져온다. (하루 한 번)`, ['청한다', '그만둔다']); if (a) return;
    G.S.daily['duel_' + c.id] = 1;
    if (await ctx.duel({ foes: [k], arena: c.group === '구파일방' ? 'court' : 'ring', bgm: 'boss', title: `${c.name} · ${c.who}`, yieldAt: .25, optional: true, expMul: .4 })) await G.life.lootPick(c.who, left);
    return;
  }
  for (const l of c.intro) l.length === 2 ? await say(l[0], l[1]) : await say(k, l[0]);
  const a = await choice(`${c.name} ${c.who}에게 비무를 청할까?`, ['비무를 청한다', '다음에 온다']);
  if (a) return;
  const won = await ctx.duel({ foes: [k], arena: c.group === '구파일방' ? 'court' : 'ring', bgm: 'boss', title: `${c.name} · ${c.who}`, yieldAt: .25, optional: true });
  if (!won) { await say(k, '다시 오시오.'); return; }
  F[k] = true;
  for (const l of c.win) l.length === 2 ? await say(l[0], l[1]) : await say(k, l[0]);
  c.gift.forEach(id => learn(id));
  if (c.heart && !G.S.hearts.includes(c.heart)) { G.S.hearts.push(c.heart); toast(`심법 ${HEARTS[c.heart].name}을(를) 익혔다`, 3); }
  if (c.note) ctx.note(c.note);
  await G.life.lootPick(c.who, LOOT[c.id]);
  if (clansWon() === 15) { Sound.sfx('ok3'); await say(null, '구파일방과 오대세가의 대표가 모두 인정했다. 강호에 네 이름이 퍼지기 시작했다.'); ctx.note('열다섯 세력에게 모두 인정받았다.'); }
}
async function beggar() {
  const c = await choice('개방 거지가 그릇을 내민다.', ['구파일방이 뭐예요', '오대세가는요', '정천맹은요', '사파는요', '그 밖에 또 있어요?', '그만둔다'], 'clan_gaebang');
  if (c === 0) await say('beggar', '소림, 무당, 화산, 종남, 아미, 곤륜, 공동, 점창, 청성. 이 아홉 문파에 우리 개방을 더해서 구파일방이야. 거지가 낀다고 웃지 마라.');
  if (c === 1) await say('beggar', '남궁, 모용, 제갈, 사천당가, 하북팽가. 대대로 내려오는 다섯 가문이지. 돈은 그쪽이 훨씬 많아.');
  if (c === 2) await say('beggar', '구파일방이랑 오대세가가 맹약을 맺고 세운 게 정천맹이야. 맹주 연경추는 어느 쪽 출신도 아닌데 그 자리에 앉았으니 대단한 양반이지.');
  if (c === 3) await say('beggar', '흑도맹이라고 있어. 산의 녹림, 강의 수로채, 도박판의 하오문, 독쟁이 오독문, 살수 혈의방이 모여서 맹주까지 뽑았지. 맹주는 패천도 사마웅이고.');
  if (c === 4) await say('beggar', '그건 함부로 입에 올리는 게 아니야. 더 묻지 마라.');
}
Object.assign(WHO, { beggar: { name: '개방 거지', face: 'Gaebang' } });

Story.providers.push(function content3(id) {
  const n = [], F = G.S.flags;
  if (id === 'cheongha' && F.burned) n.push({ id: 'beggar', spr: 'Gaebang', x: 20, y: 17, dir: 3, hint: '말 걸기', talk: beggar });
  if (id === 'guhwa') n.push({ id: 'beggar', spr: 'Gaebang', x: 28, y: 22, dir: 2, hint: '말 걸기', talk: beggar });
  for (const c of CLANS) if (c.at[0] === id) n.push({ id: 'clan_' + c.id, spr: c.spr, x: c.at[1], y: c.at[2], dir: 0, mark: () => !G.S.flags['clan_' + c.id], talk: () => talk(c) });
  return { npcs: n, spots: [], trigs: [], roam: [] };
});
