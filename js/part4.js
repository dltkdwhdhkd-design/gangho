// 제4~5부: 천하비무 뒤 두 달. 같은 사건을 서 있는 자리에 따라 다르게 겪는다
import { G, Sound, fadeTo, toast } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { FOES } from './foes.js';
import { set, at } from './story1.js';

const S = () => G.S, F = () => G.S.flags, side = () => G.S.side;
Object.assign(WHO, { orphan: { name: '복면 아이', face: 'Child' }, drill: { name: '복면 교관', face: 'DarkNinja' } });
Object.assign(FOES, {
  drill: { name: '복면 교관', spr: 'chars/DarkNinja', hp: 1000, atk: 38, def: 10, spd: 78, exp: 220, silver: 60, pause: .95, moves: ['flurry', 'blink', 'dart3', 'lunge'], wpn: 'Ninjaku', guard: .7, elite: 1, poise: 130 },
  dang_ally: { name: '당소연', spr: 'chars/Dang', hp: 1300, atk: 38, def: 9, spd: 74, exp: 0, silver: 0, pause: 1.1, moves: ['dart3', 'venom', 'fan5'], wpn: 'Sai', keep: 70 },
  moyong_ally: { name: '모용설', spr: 'chars/Moyong', hp: 1500, atk: 40, def: 11, spd: 76, exp: 0, silver: 0, pause: 1.1, moves: ['cloud_flash', 'flurry', 'blink'], wpn: 'Katana' },
  baek_ally: { name: '백랑', spr: 'chars/Cavegirl', hp: 1200, atk: 36, def: 8, spd: 80, exp: 0, silver: 0, pause: 1.1, moves: ['quick', 'dart3', 'blink'], wpn: 'Ninjaku' },
});

// ── 맹주 창고 지하: 네 길 모두 겪는 사건 ──
async function granary() {
  const s = side();
  await ctx.chap(s === 'sa' ? 5 : s === 'ma' ? 5 : 4, { jeong: '쫓기는 몸', free: '어디에도 없는 칼', sa: '장강의 불', ma: '장경각의 빗자루' }[s], '창고 밑');
  await narr('밤이 깊어서야 맹주 창고 뒷담을 넘었다. 쌀가마가 천장까지 쌓여 있었다. 그런데 쌀 냄새보다 사람 냄새가 먼저 났다.');
  await say('me', '발밑이 비어 있네.');
  if (s === 'jeong') await say('cheol', '물러나시오, 시주. 문짝은 소승 전문이오.');
  if (s === 'ma') await say('hyeok', '이 밑입니다. 소리를 낮추십시오.');
  if (s === 'sa' && F().lion_debt) await say('lion', '비켜 봐라. 이런 건 산적이 잘 안다.');
  await narr('쌀가마를 밀어내고 마루를 뜯자 사다리가 나왔다. 내려가 보니 긴 밥상이 세 줄로 놓여 있었다. 일고여덟 살쯤 된 아이들이 복면을 무릎에 벗어 놓고 말없이 밥을 먹고 있었다.');
  await narr('밥상 끝에 앉은 아이 목에 나무패가 걸려 있었다. 불에 지진 번호까지 내가 차고 다니던 견대 번호패와 똑같았다.');
  await say('drill', '수저 놓아라. 일어서.');
  await say('me', '얘들한테 뭘 가르치는 거야.');
  await say('drill', '살아남는 법. 너도 배운 것 같은데.');
  const allies = s === 'jeong' ? ['cheol_ally'] : s === 'ma' ? ['hyeok_ally'] : s === 'sa' && F().lion_debt ? ['lion_ally'] : [];
  await ctx.duel({ foes: ['drill', 'shadow2', 'shadow2'], allies, arena: 'room', bgm: 'fight', title: '맹주 창고 지하' });
  ctx.cg('kids');
  await say('orphan', '아저씨는 몇 번이에요?');
  await say('me', '번호 없어. 이름이 있어.');
  await say('orphan', '이름은 어떻게 받아요?');
  await say('me', '…….');
  ctx.cgOff();
  ctx.note('맹주 창고 지하에서 복면 쓴 아이 서른한 명을 보았다. 목에 견대와 같은 나무패가 걸려 있었다.');
  if (s === 'jeong' || s === 'free') {
    const c = await choice('아이들이 줄을 서서 다음 명령을 기다린다. 모두 서른한 명이다.', ['아이들을 데리고 나간다', '명부만 챙겨 나온다']);
    if (c === 0) {
      F().kids_saved = true; ctx.rep('jeong', 2);
      if (s === 'jeong') {
        await say('cheol', '소승이 둘을 업겠소. 시주는 앞장서시오.');
        await narr('아이들을 밤배에 태워 청풍골로 보냈다. 서른한 명이 타고도 아무도 소리를 내지 않았다. 윤설이 밥을 지어 놓았는데, 다들 수저를 들어도 된다는 말이 떨어질 때까지 가만히 앉아 있었다.');
      } else {
        await narr('개방 거지들을 불러 아이들을 밤배로 실어 보냈다.');
        await say('clan_gaebang', '쌀 뒤를 캐 오랬더니 애를 서른이나 캐 왔네. 품삯은 그대로 쳐 주마.');
      }
    } else {
      F().kids_left = true;
      await say('me', '지금 데리고 나가면 다 잡혀. 명부부터 가져가야 해.');
      if (s === 'jeong') await say('cheol', '…알겠소.');
      await narr('명부를 품에 넣고 사다리를 올랐다. 등 뒤에서 수저 드는 소리가 났다.');
    }
    if (s === 'jeong') F().jg_rice = true;
    else { F().fr_rice = true; ctx.silver(200); await freeCheck(); }
    return;
  }
  if (s === 'sa') {
    const c = await choice('아이들이 줄을 서서 다음 명령을 기다린다.', ['배에 태워 강 건너로 보낸다', '흑도맹에서 거둔다']);
    if (c === 0) { F().kids_saved = true; ctx.rep('jeong', 1); await say('samaung', '애들이 무슨 죄냐. 배 한 척 내줘라.'); }
    else { F().kids_kept = true; ctx.rep('sa', 2); await say('baekrang', '애들 손에 칼 쥐여 주는 건 맹주나 우리나 똑같네요.'); }
    F().sa_rice2 = true; ctx.goal('구화성 남문 나루로 가기');
    return;
  }
  if (!F().hyeolma_dead) await say('hyeolma', '심마가 기르던 강아지들이구나. 교단이 거둔다. 좋은 칼이 될 거다.');
  else await say('hyeok', '교단에서는 이 아이들을 천산으로 보내라고 합니다.');
  const c = await choice('아이들이 줄을 서서 다음 명령을 기다린다.', ['교단으로 보낸다', '몰래 풀어 준다']);
  if (c === 0) { F().kids_kept = true; ctx.rep('ma', 2); }
  else { F().kids_saved = true; ctx.rep('jeong', 1); await say('hyeok', '…못 본 것으로 하겠습니다.'); ctx.love('hyeok'); }
  F().ma_rice = true;
  await sutraRaid();
}

// ── 정파 길 ──
async function jeong4() {
  F().night = false;
  await ctx.part(4, '쫓기는 몸', '움막');
  await narr('청풍골 사냥꾼 호씨가 강가 움막을 내주었다. 곰 잡을 때나 쓰던 곳이라 넷이 누우니 발 디딜 데가 없었다.');
  await say('so', '구파일방에 말이 통하는 사람이 있어도 맨입으로는 안 돼. 맹주 말이랑 역적 말이랑 누구 말을 믿겠어.');
  await say('me', '증거가 있어야겠네요.');
  await say('yun', '칠일소혼산부터 따져 봐요. 그 독은 아무나 못 구해요. 사천당가에 물어보면 위문상이 어디서 구했는지 나올 거예요.');
  await say('cheol', '소승은 구화성 거지들한테 들은 얘기가 있소. 맹주 창고로 들어가는 쌀이 맹에 있는 사람 수보다 훨씬 많다 하더이다. 술값 대신 들은 얘기요.');
  await say('so', '그리고 토벌 명령서. 장서각 쪽지에 맹주 수결이 있었잖아. 원본은 작전을 짠 제갈세가에 있을 거야.');
  await say('me', '제 얼굴이 나루마다 붙어 있는데 구화성에 어떻게 들어가요?');
  await say('cheol', '그래서 소승이 삿갓을 구해 왔소. 값은 시주 앞으로 달아 놨소.');
  set('jg1'); ctx.goal('증거 셋 모으기: 구화성 맹주 창고, 세가 거리의 사천당가와 제갈세가. 순서는 자유 (구화성은 청하진 나루에서 배로)');
  ctx.note('증거를 모으기로 했다. 맹주 창고의 쌀, 당가의 처방 기록, 제갈세가의 명령서.');
}
async function dangRecord() {
  await ctx.chap(4, '쫓기는 몸', '독고');
  await say('clan_dang', '어머, 역적이 대낮에 세가 거리를 걸어 다니네요. 삿갓이 참 안 어울려요.');
  await say('me', '칠일소혼산 처방을 훔쳐 간 사람을 찾고 있어요.');
  await say('clan_dang', '찾아서 뭐 하게요?');
  await say('me', '맹주를 고발하려고요.');
  await say('clan_dang', '…그런 말은 당가 마당에서 크게 하는 거 아니에요. 따라와요.');
  await narr('당소연은 사당 뒤 독고 문을 열었다. 벽을 따라 작은 서랍이 수백 개 붙어 있었고, 문을 닫자 쓴 냄새가 코끝에 달라붙었다.');
  await say('clan_dang', '여기 드나든 사람은 다 적어 둬요. 외부인은 딱 한 사람이에요. 십칠 년 전 봄에 칠일소혼산, 그보다 세 해 앞서 일배혈. 둘 다 같은 손이 가져갔어요.');
  await say('me', '일배혈이요?');
  await say('clan_dang', '한 잔이면 사람이 죽어요. 잔을 내려놓기도 전에요.');
  await say('me', '가져간 사람이 누구예요?');
  await say('clan_dang', '맹주관 서기 위문상. 그때는 그런 자리에 있었나 봐요.');
  await narr('기록을 접는 순간 등 뒤에서 서랍 하나가 저절로 열렸다. 그 안쪽 벽이 통째로 밀려 나오더니 시퍼렇게 부은 것들이 걸어 나왔다.');
  await ctx.duel({ foes: ['myeon', 'puppet', 'puppet'], allies: ['dang_ally'], arena: 'room', bgm: 'fight', title: '당가 독고' });
  await say('clan_dang', '이런 게 우리 독고 안에 있었다는 건 문중에 손님 편을 드는 사람이 있다는 얘기네요. 그 기록은 가져가요.');
  await say('me', '문중에서 곤란해지시는 거 아니에요?');
  await say('clan_dang', '곤란해지면 {나} 씨 찻잔부터 챙겨서 도망갈게요. 농담이에요. 아마도요.');
  F().jg_dang = true; ctx.love('clan_dang');
  ctx.note('당가 독고 기록: 위문상이 십칠 년 전 칠일소혼산을, 그보다 세 해 앞서 일배혈을 가져갔다. 일배혈은 한 잔이면 사람이 죽는 독이다.');
}
async function jegalOrder() {
  await ctx.chap(4, '쫓기는 몸', '날짜');
  await say('clan_jegal', '오실 줄 알았습니다. 삿갓은 벗으셔도 됩니다. 이 거리에서 공자를 못 알아볼 사람은 없습니다.');
  await say('me', '토벌 명령서 원본이 필요합니다.');
  await say('clan_jegal', '계산해 봤습니다. 드리면 제갈세가는 맹주의 적이 되고, 안 드리면 저는 스승을 저버린 제자가 됩니다.');
  await say('me', '스승이요?');
  await say('clan_jegal', '그 명령서는 스승께서 쓰셨습니다. 불이 난 사흘 뒤에요. 맹주가 시켜서 쓰시면서 날짜만은 고치지 않으셨습니다. 언젠가 누가 그 날짜를 읽어 주기를 바라신 겁니다.');
  await say('clan_jegal', '십칠 년 동안 아무도 읽지 않았지요. 가져가십시오.');
  await say('me', '가문에서 가만있을까요?');
  await say('clan_jegal', '서문으로 나가시면 순찰이 넷, 동문으로 나가시면 둘입니다. 동문을 권합니다. 가문 일은 제 계산에 넣어 두었습니다.');
  await ctx.duel({ foes: ['jeong_guard', 'jeong_guard'], arena: 'ring', bgm: 'fight', title: '세가 거리 동문' });
  F().jg_date = true; ctx.note('제갈현이 토벌 명령서 원본을 내주었다. 명령서는 불이 난 사흘 뒤에 쓰였다.');
}
async function camp5() {
  await say('so', '셋 다 모았네. 너 얼굴이 많이 상했다.');
  await say('yun', '팔 줘 봐요.');
  await say('me', '이걸 누구한테 들고 가죠?');
  await say('cheol', '혜각 대사께 가시오. 소승이 문을 부수고 나온 절의 어른이오만, 그분이 입을 열면 다들 듣는 척이라도 하오.');
  await ctx.part(5, '구파 회관의 밤', '혜각');
  await narr('그믐까지 한 달이 남아 있었다. 강 건너에서 흑도맹 깃발을 봤다는 뱃사람이 늘고 있었다.');
  set('jg2'); ctx.goal('구파 회관의 혜각 대사 찾아가기');
}
async function hyegakPlea() {
  await say('clan_shaolin', '시주가 오늘 오실 줄 알았소. 앉으시오.');
  await narr('당가의 기록과 명령서, 창고에서 가져온 명부를 차례로 펼쳤다. 혜각은 염주 돌리던 손을 멈추고 한참 읽었다.');
  await say('clan_shaolin', '아미타불. 노납은 십칠 년을 염불로 때웠소. 소림의 깃발을 들고 간 사람이 입을 닫고 있어서는 안 되는 일이었소.');
  await say('clan_shaolin', '사흘 뒤 장문인 회의가 있소. 그 자리에 시주를 세우겠소.');
  await council();
}
async function council() {
  await ctx.chap(5, '구파 회관의 밤', '장문인 회의');
  await fadeTo(1); F().night = true; G.field.load('ninehall', 20, 12, 1); await fadeTo(0);
  await narr('사흘 뒤 저녁, 구파 회관 마당에 장문인들이 모였다. 나는 소연하와 함께 혜각 대사 뒤에 섰다. 이쪽을 보는 눈이 서른 쌍은 넘었다.');
  await say('clan_namgung', '역적을 마당에 세워 놓고 회의를 합니까, 대사.');
  await say('clan_shaolin', '듣고 나서 베어도 늦지 않소.');
  await say('me', '말씀드리겠습니다. 십칠 년 전 월하곡에 먼저 불을 지른 사람은 맹주입니다.');
  await narr('기록과 명령서를 마당 한가운데 내려놓았다. 웅성거리던 소리가 잦아들었다.');
  await say('clan_jegal', '날짜는 제가 확인했습니다. 불이 먼저였고, 명령은 사흘 뒤였습니다.');
  await say('clan_wudang', '무당은 그날 칼을 뽑지 않았소. 그걸로 죄를 면한 줄 알았는데, 깃발을 든 것만으로 이미 늦었던 모양이오.');
  await say('clan_emei', '곽란이 그날 밤 아이를 안고 내 앞을 지나갔다. 나는 못 본 척했고, 그게 내가 한 일의 전부다.');
  if (F().kids_saved) {
    await narr('철우가 아이 하나를 데리고 마당으로 나왔다. 아이는 어디에 서야 하는지 몰라 철우의 소매만 쥐고 있었다.');
    await say('orphan', '구십일 번이에요. 창고 밑에서 왔어요.');
    await say('clan_namgung', '…그 나무패, 이리 줘 봐라.');
    await narr('남궁진은 나무패를 한참 들여다보더니 아무 말 없이 돌려주었다.');
  }
  ctx.cg('council');
  await narr('그때 맹주 연경추가 마당으로 걸어 들어왔다. 호위는 한 명도 없었다.');
  ctx.cgOff();
  await say('chief', '다들 앉게. 내 얘기를 하는데 내가 빠지면 쓰나.');
  await say('chief', '명령서는 내가 늦게 쓰게 했네. 불을 보고 달려간 사람이 명령서부터 챙기겠나. 위문상은 내 서기였고, 그자는 이미 죽었지. 죽은 사람한테는 물어볼 수가 없네.');
  if (F().kids_saved) await say('chief', '창고 아이들 얘기도 맞네. 전쟁터에서 굶어 죽을 애들을 먹이고 재웠지. 그게 죄라면 달게 받겠네.');
  else await say('chief', '창고 지하? 사람을 보내 보게. 쌀밖에 없을 걸세.');
  await say('so', '그럼 내 사부님은 어디 있는데요.');
  await say('chief', '소 낭자, 그건 나도 알고 싶네.');
  await say('chief', '그런데 어쩌겠나. 오늘 아침 흑도맹이 장강을 건넜네. 사흘이면 구화성 남문일세. 역적 얘기는 전쟁이 끝나고 하세.');
  await narr('장문인들이 서로 얼굴을 보더니 하나둘 일어섰다. 내려놓은 기록을 집어 가는 사람은 없었고, 칼을 뽑는 사람도 없었다.');
  await say('chief', '잘 모았네. 자네 아버지보다 꼼꼼하군.');
  await narr('맹주는 내 어깨를 한 번 두드리고 들어온 길로 걸어 나갔다.');
  await say('so', '봤어? 혼자 걸어 들어와서 말 몇 마디로 다 뒤집었어.');
  await say('clan_shaolin', '뒤집힌 것은 회의뿐이오. 오늘 들은 말을 잊은 사람은 없을 것이오. 소림은 시주 편에 서겠소.');
  await say('so', '전쟁이 터지면 증거고 뭐고 다 묻혀. 맹주가 노린 게 그거야.');
  await say('me', '그럼 전쟁부터 말려야죠. 패천도를 만나 볼게요.');
  await say('cheol', '혼자서 말이오?');
  await say('me', '칼 든 사람이 여럿 가면 말을 못 하잖아요.');
  F().night = false; F().jg_council = true; ctx.rep('jeong', 2); set('jg3');
  ctx.goal('동쪽 산길 너머 흑풍채에서 패천도 사마웅 만나기');
  ctx.note('장문인 회의에서 맹주를 고발했다. 맹주가 전쟁을 내세워 넘어갔지만 혜각 대사는 내 편에 섰다.');
}
async function samaungTalk() {
  await ctx.chap(5, '구파 회관의 밤', '패천도');
  if (F().lion_debt) {
    await say('lion', '점소이 왔냐! 아니지, 이제 역적이라며. 출세했다.');
    await say('me', '패천도를 뵈러 왔어요.');
    await say('lion', '말리고 싶은데 내 말을 들을 분이 아니다. 몸조심해라.');
  }
  await say('samaung', '네놈이 {호} {나}구나. 정파 심부름을 왔냐, 역적 심부름을 왔냐.');
  await say('me', '전쟁을 멈추러 왔습니다. 맹주는 이 전쟁으로 제 죄를 덮으려고 합니다.');
  await say('samaung', '이십 년 전에 내 형제 열둘이 그놈이 따른 술을 마시고 죽었다. 이제 와서 멈추라고? 말은 칼로 해라.');
  await ctx.duel({ foes: ['samaung_foe'], arena: 'fort', bgm: 'boss', title: '패천도 사마웅', survive: 30, tip: '이길 수 없는 상대입니다. 30초를 버티세요.' });
  await narr('칼이 몇 번이나 부러질 뻔했는지 모르겠다. 마지막 일격에 나는 마당 끝까지 날아가 깃대에 부딪혔다.');
  await say('samaung', '아직 일어나네. 왜 일어나냐.');
  await say('me', '…할 말을 아직 안 했으니까요.');
  await say('me', '그 술에 든 독은 일배혈입니다. 사천당가 독고에서 나갔고, 가져간 사람은 맹주관 서기 위문상입니다. 날짜가 여기 있습니다.');
  ctx.cg('flags');
  await narr('사마웅은 기록을 받아 들고 오래 들여다보았다. 산채 위로 검은 깃발 열두 개가 펄럭이는 소리만 들렸다.');
  await say('samaung', '이십 년 동안 그 독이 어디서 왔는지 말해 준 놈이 없었다.');
  await say('samaung', '전쟁은 못 멈춘다. 애들이 벌써 강을 건넜어. 내가 물러나라고 하면 내 목부터 날아간다.');
  await say('samaung', '대신 그믐날 월하곡 물길은 비워 주마. 연경추 목은 네가 따라. 네가 못 따면 내가 딴다.');
  ctx.cgOff(); F().jg_samaung = true; ctx.rep('sa', 2); ctx.note('패천도에게 일배혈 기록을 보였다. 전쟁은 못 멈추지만 그믐날 월하곡 물길은 비워 주겠다고 했다.');
  await fadeTo(1); G.field.load('valley', 26, 15, 2); await fadeTo(0);
  await say('yun', '이번엔 어디를 다친 거예요. 아니, 말하지 마요. 다 보여요.');
  await say('so', '구화성 남문이 불탔대. 아미 사태가 피난민을 맡았고, 혜각 대사는 승병을 돌려보냈다더라.');
  await say('cheol', '그믐이 코앞이오, 시주.');
  await say('me', '가요. 아주머니가 기다리세요.');
  await G.route.toWolha();
}

// ── 낭인 길 ──
async function free4() {
  F().night = false;
  await ctx.part(4, '어디에도 없는 칼', '일거리');
  await narr('혼자가 되니 제일 먼저 돈이 문제였다. 삿갓을 눌러쓰고 청하진 뒷길로 들어가 개방 거지부터 찾았다. 강호의 일거리는 다 그 사람들 귀로 들어갔다.');
  set('fr1'); ctx.goal('청하진의 개방 거지에게 일거리 묻기');
  await ctx.warp('cheongha', 20, 19, 1);
}
async function frBeggar() {
  await say('beggar', '그 삿갓 벗지 마라. 네 머리값이 은자 오백 냥이야. 나도 좀 흔들린다.');
  await say('me', '일거리 있어요? 돈이 떨어졌어요.');
  await say('beggar', '두 건 있다. 어느 편도 아니면서 칼 쓰는 놈이 요즘 너밖에 없거든.');
  await say('beggar', '하나는 우리 홍두 장로 일이야. 구화성 맹주 창고로 들어간 쌀이 어디로 사라지는지 캐 오면 은자 이백 냥.');
  await say('beggar', '다른 하나는 돈은 안 되는데 네가 궁금해할 일이지. 윤씨 약방에 요즘 복면 쓴 놈이 어깨 약을 타러 온다더라.');
  await say('me', '어깨 약이요?');
  await say('beggar', '오른쪽 어깨에 오래된 칼자국 있는 사람이 먹는 약이라던데. 아는 사람이냐?');
  F().fr_talk = true; ctx.goal('일거리 둘: 구화성 맹주 창고, 윤씨 약방의 어깨 약. 순서는 자유');
}
async function frMed() {
  await ctx.chap(4, '어디에도 없는 칼', '감초');
  await say('doc', '왔구나. 곽씨가 먹던 어깨 약을 요즘 복면 쓴 놈이 타 간다. 보름에 한 번씩 오지.');
  await say('yun', '처방 쪽지가 같이 오는데 곽 아주머니 글씨예요. 외상값 적는 걸 십 년 넘게 봐서 제가 알아요.');
  await say('me', '뭐라고 적혀 있어요?');
  await say('yun', '“약 쓰다. 감초 더 넣어라.”');
  await say('me', '…아주머니 맞네요.');
  await say('yun', '살아 계신 거예요. 오늘이 약 타러 오는 날이고요.');
  await narr('해 질 무렵 복면 쓴 심부름꾼이 약방 문을 열었다. 약봉지를 받아 든 놈을 나루까지 따라갔더니, 나루 끝에 같은 복면이 하나 더 기다리고 있었다.');
  await ctx.duel({ foes: ['shadow2', 'shadow2'], arena: 'dock', bgm: 'fight', title: '약 심부름꾼' });
  await say(null, '놈의 품에서 다음 달 처방 쪽지가 나왔다. 곽 아주머니 글씨였다.');
  await say(null, '“감초 넣었냐. 밥은 먹고 다니고. 서문은 안 찢었다.”');
  await say('me', '서문은 또 뭐지. 끝까지 밥 얘기네.');
  await say('yun', '우시는 거예요?');
  await say('me', '아니요.');
  await say('yun', '팔 줘 봐요.');
  F().fr_med = true; ctx.love('yun'); ctx.note('곽 아주머니가 처방 쪽지에 글을 남겼다. “서문은 안 찢었다.”');
  await freeCheck();
}
async function freeCheck() {
  if (!F().fr_rice || !F().fr_med) return;
  await ctx.part(5, '강을 건너는 사람들', '징발');
  await narr('한 달이 지나자 전쟁이 터졌다. 흑도맹이 장강을 건넜고, 정천맹은 고을마다 징발령을 내렸다.');
  set('fr2'); ctx.goal('청하진 광장의 촌장 어른 만나기');
}
async function frElder() {
  await say('elder', '왔는가. 오늘 아침 정천맹 징발대가 들어왔네. 장정은 다 끌고 가고, 열 살 넘은 아이들은 척후로 쓴다는군.');
  await say('me', '척후요?');
  await say('elder', '앞서 걸으면서 화살이 어디서 날아오나 보는 일이라더군. 맹주 명이라네.');
  await narr('나루까지 어떻게 뛰어갔는지 모르겠다.');
  await fadeTo(1); G.field.load('cheongha', 22.5, 24, 3); await fadeTo(0);
  await say('kid', '쟁반 아저씨!');
  await say('go', '사제. 네가 왜 여기 있느냐.');
  await say('me', '사형, 그 애 내려놓으세요.');
  await say('go', '명령이다. 전쟁에는 눈이 필요하다.');
  await say('me', '저도 일곱 살에 그 명령으로 끌려갔어요. 팔백 명 중에 저 혼자 돌아왔고요.');
  await say('go', '…….');
  await say('go', '명령은 명령이다. 비켜라.');
  await say('smith', '작살 들어! 곽씨네 점소이 혼자 세워 둘 거냐!');
  await ctx.duel({ foes: ['jeong_guard', 'jeong_guard', 'jeong_elite'], allies: ['smith_ally'], arena: 'dock', bgm: 'fight', title: '징발대' });
  await say('go', '네놈이 언제 이렇게 컸지.');
  await say('me', '그 명령, 누구 입에서 나온 건지 아세요?');
  await say('go', '…명부에는 청하진에 아이가 없었다고 적겠다. 나머지는 묻지 마라.');
  await narr('고진은 부하들을 데리고 배로 돌아갔다. 끝까지 뒤를 돌아보지 않았다.');
  await say('elder', '이제 여기도 위험하네. 징발대가 또 올 테고 흑도맹 배도 사흘이면 닿을 걸세. 다들 청풍골로 피하자는데 배가 모자라.');
  if (F().wei_spared) {
    await narr('그때 강 하류에서 돛이 세 개 올라왔다. 돛마다 검은 물고기가 그려져 있었다.');
    await say('wei', '점소이! 배 필요하냐? 이 빚은 잊지 않는다고 했지.');
    await say('me', '수적이 피난민을 태워요?');
    await say('wei', '뱃삯은 곽씨 국수로 받으마. 나중에 갚아라.');
  } else {
    await say('boat', '내 배 한 척으로 열 번 다니면 되지, 뭐. 늙은이 노 젓는 건 공짜여.');
    await say('husband', '저도 젓겠습니다. 그놈들 배에서 노 젓는 건 실컷 배웠거든요.');
  }
  ctx.cg('evac');
  await narr('사흘 밤낮으로 사람을 실어 날랐다. 강씨는 모루를 짊어지고 배에 올랐고, 꼬마는 쟁반을 끌어안고 탔다. 마지막 배가 떠날 때 청하진에는 불 켜진 집이 하나도 없었다.');
  ctx.cgOff();
  await say('yun', '이제 어디로 가요?');
  await say('me', '그믐이 열흘 남았어요. 곽 아주머니가 감초 넣었냐고 물으셔서요.');
  await say('yun', '감초 챙겨 줄게요. 가져가서 직접 드려요.');
  await say('boat', '월하곡 물길까지는 내가 태워다 줄 텨.');
  F().fr_done = true; ctx.rep('jeong', 3);
  await G.route.toWolha();
}

// ── 사파 길 ──
async function sa5() {
  await ctx.part(5, '장강의 불', '도하');
  await narr('보름 뒤, 흑도맹의 배 삼백 척이 장강을 건넜다. 사마웅은 맨 앞 배 뱃머리에 서서 구화성이 보일 때까지 앉지 않았다.');
  await say('samaung', '맹주 창고부터 턴다. 그놈 쌀을 끊어야 군대가 굶는다. 네가 가라.');
  await say('baekrang', '그 창고는 소문이 이상해요. 쌀은 매일 들어가는데 나오는 걸 본 사람이 없대요.');
  set('sa3'); ctx.goal('구화성 맹주 창고 털기');
  await ctx.warp('guhwa', 24.5, 29, 1);
}
async function saNamgung() {
  await ctx.chap(5, '장강의 불', '남문');
  await say('clan_namgung', '남궁세가 선봉 남궁진이다. 역적이 사파 앞잡이까지 됐군.');
  await say('me', '비켜 주세요. 성 안 사람들이 빠져나갈 시간은 드릴게요.');
  await say('clan_namgung', '남궁은 물러나지 않는다. 칼을 뽑아라.');
  await ctx.duel({ foes: ['clan_namgung'], arena: 'ring', bgm: 'boss', title: '남문 나루 · 남궁진', yieldAt: .25, noLoot: true });
  await say('clan_namgung', '베어라. 포로로 끌려가 가문에 얼굴을 못 들 바에는 그게 낫다.');
  const c = await choice('남궁진이 칼을 떨어뜨린 채 나를 본다.', ['살려 보낸다', '포로로 잡는다']);
  if (c === 0) { await say('me', '가세요. 성문만 열어 두고 가시면 돼요.'); await say('clan_namgung', '…이 빚은 칼로 갚겠다.'); F().sa_nam_spared = true; ctx.rep('jeong', 2); ctx.love('clan_namgung'); }
  else { await say('baekrang', '남궁가 후계자라니. 몸값은 제가 매길게요.'); ctx.rep('sa', 2); }
  ctx.cg('fire_gu');
  await narr('그날 밤 구화성 남쪽이 불탔다. 천하비무가 열렸던 광장으로 피난민들이 보따리를 끌고 지나갔다. 아이 하나가 내 앞에서 넘어지길래 일으켜 주려고 했더니 울면서 달아났다. 내 소매에 검은 깃발 표식이 달려 있었다.');
  ctx.cgOff();
  await say('baekrang', '소문값이 똥값이 됐어요. 다들 죽어서 사러 오는 사람이 없거든요.');
  await say('samaung', '연경추가 달 없는 밤에 월하곡으로 간다는 소식이 왔다. 전쟁은 애들한테 맡기고 우리는 그놈 목을 따러 간다.');
  await say('yun', '붕대 많이 챙겼어요. 이번에는 다치지 마요.');
  F().sa_done = true;
  await G.route.toWolha();
}

// ── 마교 길 ──
async function ma5() {
  await ctx.part(5, '장경각의 빗자루', '전쟁');
  await narr('그사이 전쟁이 터졌다. 흑도맹이 장강을 건너자 정천맹은 구파일방의 승병까지 끌어모았고, 강호의 눈이 모두 강으로 쏠렸다.');
  await say('hyeok', '일이 둘 남았습니다. 구화성 맹주 창고 지하에 심마가 기르는 것이 있습니다. 그리고 소림 장경각에 봉인을 세운 낙월선자의 기록이 있습니다. 승병이 내려간 지금이 아니면 가지 못합니다.');
  set('ma3'); ctx.goal('구화성 맹주 창고 지하로 가기 (청하진 나루에서 배로)');
}
async function sutraRaid() {
  await ctx.chap(5, '장경각의 빗자루', '비질 소리');
  await fadeTo(1); G.field.load('sutra', 7, 9, 1); await fadeTo(0);
  await narr('숭산에는 종소리가 없었다. 승병이 다 내려간 소림은 텅 비어 있었고, 장경각 문도 잠겨 있지 않았다.');
  await say('hyeok', '셋째 서가입니다. 저는 문을 보겠습니다.');
  await narr('서가 앞으로 걸어가는데 등 뒤에서 비질 소리가 났다.');
  await say('sodi', '왼발로 미는구나.');
  await say('me', '…스님.');
  await say('sodi', '네가 닦아 놓은 바닥이다. 신발은 털고 들어와야지.');
  await say('me', '낙월선자의 기록을 가지러 왔습니다.');
  await say('sodi', '셋째 서가 맨 아래 칸이다. 오십 년 동안 먼지만 앉았으니 가져가도 아무도 모른다.');
  await say('me', '안 말리세요?');
  await say('sodi', '늙은이가 빗자루로 뭘 말리겠느냐. 어디 서 있든 네 걸음은 네 걸음이다. 어디로 걷는지는 네가 봐야지.');
  const c = await choice('비질 소리가 멈췄다.', ['기록을 가져간다', '두고 나간다']);
  if (c === 0) { F().ma_sutra = true; ctx.rep('ma', 2); await narr('책을 꺼내자 먼지가 일었다. 스님은 다시 비질을 시작했다. 내가 나갈 때까지 고개를 들지 않았다.'); }
  else { await say('me', '오늘은 바닥만 밟고 갈게요.'); await say('sodi', '허허. 그래도 신발은 털고 가거라.'); await say('hyeok', '명을 어기셨습니다.'); await say('me', '네.'); await say('hyeok', '…보고는 제가 하겠습니다.'); ctx.rep('jeong', 1); ctx.love('hyeok'); }
  await fadeTo(1); G.field.load('shrine', 7, 8, 1); await fadeTo(0);
  await say('hyeok', '심마가 달 없는 밤에 월하곡으로 간다고 합니다. 그곳에서 끝내야 합니다.');
  await G.route.toWolha();
}

G.ch = {
  jeong4, free4, sa5, ma5,
  // 원래 있던 인물이 이야기가 있을 때 먼저 말을 꺼내게 한다
  hook(k) {
    { const h = G.act3 && G.act3.hook7(k); if (h) return h; }
    if (at('jg1')) { if (k === 'clan_dang' && !F().jg_dang) return dangRecord; if (k === 'clan_jegal' && !F().jg_date) return jegalOrder; }
    if (at('jg2') && k === 'clan_shaolin') return hyegakPlea;
    if (at('fr1')) { if (k === 'beggar' && !F().fr_talk) return frBeggar; if (k === 'doc' && F().fr_talk && !F().fr_med) return frMed; }
    return null;
  },
};

const job = o => ({ dir: 0, mark: () => true, ...o });
Story.providers.push(function part4(id) {
  const n = [];
  if (id === 'valley' && at('jg1', 'jg2', 'jg3')) {
    const ready = () => at('jg1') && !!F().jg_rice && !!F().jg_dang && !!F().jg_date;
    n.push({ id: 'so', spr: 'RedSamurai', x: 27, y: 13, dir: 2, mark: ready, talk: async () => { if (ready()) await camp5(); else await say('so', '칼은 닦았어?'); } });
    n.push({ id: 'yun', spr: 'Princess', x: 29, y: 14, dir: 2, talk: async () => { await say('yun', '금창약은 넉넉해요?'); } });
    n.push({ id: 'cheol', spr: 'Monk2', x: 28, y: 16, dir: 2, talk: async () => { await say('cheol', '나무아미… 시주, 오늘 저녁은 뭐요?'); } });
  }
  if (id === 'guhwa') {
    const go = (at('jg1') && !F().jg_rice) || (at('fr1') && !!F().fr_talk && !F().fr_rice) || (at('sa3') && !F().sa_rice2) || (at('ma3') && !F().ma_rice);
    if (go) n.push(job({ id: 'job_store', spr: 'Knight', x: 41, y: 18, hint: '창고 뒷담 넘기', talk: granary }));
    if (at('sa3') && F().sa_rice2) n.push(job({ id: 'job_nam', spr: 'Namgung', x: 24.5, y: 26, hint: '남궁진과 맞서기', talk: saNamgung }));
  }
  if (id === 'fort' && at('jg3')) n.push(job({ id: 'samaung', spr: 'Samaung', x: 18, y: 20, hint: '패천도 만나기', talk: samaungTalk }));
  if (id === 'cheongha' && at('fr2')) n.push(job({ id: 'elder', spr: 'Monk', x: 23.5, y: 18.4, dir: 2, talk: frElder }));
  return { npcs: n, spots: [], trigs: [], roam: [] };
});
