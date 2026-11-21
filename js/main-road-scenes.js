import {jegalFord,onJegalAxis} from './river-crossing.js';

// The party walks the same roads used in ordinary travel. The boatmen point out the ford twice, on opposite banks.
const trips={
  '4/1':['cheongha','청풍 물굽이','munok','어제는 이 자리에서 장옷만 건졌지요. 오늘은 한 사람 더 태울 테니 손 좀 빌려 주세요.','me','노는 못 저어도 옷자락은 잡습니다. 아주머니, 이번엔 놓치지 않을게요.'],
  '6/1':['cheongha','청하진 쌀 운반길','jangpal','우리 집 솥 보러 산문까지 갈 것 없슈. 장에 올 때 들고 왔거든. 밑이 저 모양인데 쌀을 어디다 담아.','so','사제, 그 솥 오늘은 네가 져. 장 아저씨 손 좀 펴시게.'],
  '11/2':['hwasan','화산 아래 매화 잔도','so','석벽에 흠이 나 있지? 사부님은 칼자국이랬어. 난 장마 때 뱃줄로 저기 사람을 올렸다는 말을 더 믿어.','me','오늘은 우리 차례네요. 줄 이쪽 끝은 제가 맬게요.'],
  '18/1':['ford','제갈세가 남쪽 석교','seam','사람을 구하려거든 칼은 집어넣게. 여기 당기는 줄을 베면 밑의 배가 다리 밑으로 들어가.','me','그럼 풀 수 있는 끝을 찾아야겠군요. 아주머니는 난간에서 제 손을 봐 주세요.'],
  '20/1':['wudang','한수 강안길','munok','두 편 다 강을 지킨답니다. 그런데 여기 살던 사람은 건너도 되느냐고 누구한테 묻지요?','me','오늘은 아무한테도 안 묻게 합시다. 뱃전에 붙은 패부터 떼죠.'],
  '26/1':['ford','제갈세가 남쪽 석교','hangyu','저 위에서 배가 열두 척 지나갔소. 완장 찬 그날엔 수를 쉽게도 셌는데, 오늘은 배마다 누가 탔는지가 보이는군.','me','열셋째가 옵니다. 이번엔 이름부터 물어보시죠.'],
  '34/2':['wudang','한수 서쪽 나루','munok','칼잡이들은 강을 건너가면 전선이 끝난다지요. 나는 사람들이 자기 배에 돌아와야 끝난 셈을 쳐요.','me','마지막 배에는 사공 어르신이 타세요. 닻은 제가 뽑을 테니.'],
  '35/0':['silk','서역 대상길','porter','바람이 멎었는데도 방울이 안 울리지. 말들이 죽어서 그런 줄 알았소. 마부가 하나씩 헝겊을 감았더이다.','me','누구 좋으라고 잠자코 가나 했는데, 저 앞 수레에 겨우 잠든 아이가 있군요.'],
  '40/1':['tiangate','천산 눈고개','so','뒤를 보지 마. 뒤로 간 사람들이 더 잘 온다. 앞사람 넘어지면 네가 잡아.','me','사저가 넘어지면요?','so','그땐 나도 잡아야지. 쓸데없는 걸 묻는다.']
};
export const mainTrip=(id,site)=>trips[id+'/'+site];
export function roadAnchors(map,trip,reverse,tile){
  let path;
  if(trip[0]==='ford'){
    const b=jegalFord,a=onJegalAxis(b.ax,b.ay);
    path=Array.from({length:49},(_,i)=>{const u=i/48*(a.length+1.4)-.70;return [(b.ax+a.ux*u)*tile,(b.ay+a.uy*u)*tile];});
  }else{
    const road=map.scenicStops.find(s=>s.from===trip[0]);
    if(!road)return;
    path=road.trail.map(([x,y])=>[(x+.5)*tile,(y+.5)*tile]);
  }
  if(reverse)path.reverse();
  const open=path.filter(([x,y])=>!map.blocked(x,y));if(open.length<4)return;
  return [0,.32,.67,1].map(t=>open[Math.round(t*(open.length-1))]);
}
