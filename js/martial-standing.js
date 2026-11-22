// 문파의 세력 규모와 전투원의 직위는 별개다.
const positions = {
  shaolin:'방장급', wudang:'장문인급', hwasan:'매화검수', jongnam:'수석검수', emei:'장문인급',
  gonryun:'장문인급', gongdong:'장로', jeomchang:'수석검수', cheongseong:'장로', gaebang:'장로',
  namgung:'후계자', moyong:'후계자', jegal:'수석군사', dang:'직계고수', paeng:'가주급',
  changun:'문주급', nokrim:'총채주', janggang:'총채주', haomun:'문주급', odok:'문주급', hyeoleui:'방주급', cheonma:'마교 호법',
  haenam:'장문인급', cheonsan:'장문인급', jeonjin:'장문인급', mosan:'장문인급', jangbaek:'장문인급', pota:'장문인급',
  hwangbo:'가주급', ak:'가주급', yang:'가주급', eon:'가주급', jin:'가주급', bukhae:'궁주', noeum:'방장급', podalra:'법왕',
};
const office = {
  '외문 제자':1, '내문 제자':2, '사범':3, '진전 제자':3,
  '장로':5, '원로':5, '후계자':4, '직계고수':4, '수석검수':4, '매화검수':4, '수석군사':5,
  '방장급':6, '장문인급':6, '가주급':6, '문주급':6, '총채주':6, '방주급':6, '궁주':6, '법왕':6, '마교 호법':6,
};
export function standing(f, role = positions[f.id]) {
  return {position:role, realm:office[role]};
}
// 이 게임의 무공 척도다. 원작 등장 시점이 다른 인물들은 각자 개별로 배정한다.
export const fanRanks = Object.freeze({
  cheongmyeong:7, baekcheon:5, yuseol:5, yunjong:4, jogeol:4, dangsoso:3, hyeonjong:4, hyeonyeong:3, hyeonsang:4,
  ungeom:5, unam:3, ungak:4, baeksang:3, jingeumryong:5, isongbaek:4, jongseohan:5, gohwi:3, gimokseung:4, samaseung:5,
  heodo:6, heowon:5, heosan:5, muyeon:4, mujin:4, jinhyeon:4, jinmu:3, danggunak:6, dangbo:7, dangho:4,
  danghwa:3, dangjan:4, dangpae:4, hongdaegwang:5, guchil:3, jongpal:3, wiripsan:4, wisoheng:3, yeompyeong:3, maengso:6,
});
// 같은 경지에서도 무명의 제자와 일문을 대표하는 비무 상대의 지구력은 다르다.
const health = [100,215,405,780,1980,3180,4290,5490];
const attack = [8,17,29,45,68,88,110,135];
const defense = [1,4,6,10,15,20,26,32];
const composure = [0,0,24,63,111,162,223,294];
const opponentFloor = [.64,.70,.76,.84,.94,1,1,1];
export function rankedStats(f, enemy = true) {
  if (!Number.isInteger(f.realm) || !f.position) return f;
  const r=f.realm, expert=f.boss ? 1 : enemy ? opponentFloor[r] : .64;
  const fullAttack=f.boss || (enemy && r>=4);
  return {...f, hp:Math.max(Math.round(f.hp*(f.boss?1.35:1)),Math.round(health[r]*expert)), atk:Math.max(f.atk,attack[r]*(fullAttack?1:.9)),
    def:Math.max(f.def,defense[r]), poise:Math.max(f.poise||0,Math.round(composure[r]*expert))};
}
