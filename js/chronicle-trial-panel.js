import { esc } from './core.js';
import { dutyTrial,dutyFits,dutyWords,when,sealTrial,sealLines,courierTrial,courierResult,trialType } from './chronicle-trials.js';
import { shuffled } from './chronicle-rules.js';

const hands=['나루 당번','길잡이','동행 서기'];
const startTrial=()=>({time:[-1,-1,-1],hand:[-1,-1,-1],bits:Array(25).fill(0),route:[]});
export function trialPanel(c,r,v,btn){
  const t=r.trial??=startTrial(),places=c.scenes.map(s=>s.place),kind=trialType(c);
  if(kind==='duty'){
    const plan=dutyTrial(c.id);
    return '<h3>다른 때, 다른 손</h3><p>세 곳의 회답에 시각과 인계자가 흩어져 있습니다. 각 시각과 사람은 한 번씩 쓰입니다. 칸을 눌러 맞춰 주세요.</p><ul class="cr-rules">'+plan.rules.map(a=>'<li>'+esc(dutyWords(a,places,hands))+'</li>').join('')+'</ul>'+
      places.map((p,i)=>'<div class="cr-duty"><b>'+esc(p)+'</b>'+btn('time-'+i,when[t.time[i]]||'시각 고르기')+btn('hand-'+i,hands[t.hand[i]]||'사람 고르기')+'</div>').join('')+btn('trialCheck','세 곳의 인계 기록 대조');
  }
  if(kind==='seal'){
    const {lines}=sealTrial(c.id);
    const rowCells=lines.rows.map((row,y)=>'<span class="cr-axis">'+row.join(' ')+'</span>'+t.bits.slice(y*5,y*5+5).map((value,x)=>'<button class="cr-mark m'+value+'" data-cr="mark-'+(y*5+x)+'" aria-label="'+(y+1)+'행 '+(x+1)+'열 '+['빈 칸','먹이 찍힘','비울 칸'][value]+'">'+['·','◆','×'][value]+'</button>').join('')).join('');
    return '<h3>번진 표식의 탁본</h3><p>'+esc(c.scenes[2].place)+'에서 걷은 기록의 먹점이 번졌습니다. 가장자리에 적힌 수는 한 줄에 이어지는 먹점 수입니다. 숫자가 둘이면 그 사이 한 칸 이상을 비웁니다.</p><div class="cr-seal"><span></span>'+lines.cols.map(col=>'<span class="cr-axis">'+col.join('<br>')+'</span>').join('')+rowCells+'</div><p>칸을 눌러 먹점, 빗금, 빈칸 순서로 바꿉니다. 빗금은 풀이용 표시입니다.</p>'+btn('trialCheck','복원한 탁본 확인');
  }
  const names=[...places,v.voice+'의 숙소','인수처',v.station],plan=courierTrial(c.id),travel=courierResult(plan,t.route);
  return '<h3>회답을 실을 파발</h3><p>출발과 귀환은 '+esc(v.station)+'입니다. 다섯 곳을 한 번씩 들러 정한 시각에 회답을 받으세요. 표의 숫자는 그 길에 드는 각입니다. 귀환 한도는 '+plan.limit+'각입니다.</p><div class="cr-table-wrap"><table class="cr-road-table"><tr><th>구간</th>'+names.map((s,i)=>'<th title="'+esc(s)+'">'+(i===5?'출발':i+1)+'</th>').join('')+'<th>인수 시각</th></tr>'+names.map((name,i)=>'<tr><th>'+esc(i===5?'출발 · '+name:(i+1)+' · '+name)+'</th>'+plan.cost[i].map(n=>'<td>'+(n||'·')+'</td>').join('')+'<td>'+(i===5?'귀환':plan.windows[i].join('~')+'각')+'</td></tr>').join('')+'</table></div><div class="cr-order">'+(t.route.length?t.route.map((k,i)=>btn('unroute-'+i,(i+1)+'. '+names[k]+' · '+travel.times[i]+'각')).join(''):'먼저 갈 곳을 고르세요.')+'</div>'+
    shuffled([0,1,2,3,4],c.id+62).filter(k=>!t.route.includes(k)).map(k=>btn('route-'+k,names[k])).join('')+btn('trialCheck','파발의 인수 시각 확인',t.route.length===5?'':'disabled');
}
export function actOnTrial(c,r,action,k){
  const t=r.trial??=startTrial();
  if(action==='time'||action==='hand'){t[action][k]=(t[action][k]+1)%3;return '';}
  if(action==='mark'){t.bits[k]=(t.bits[k]+1)%3;return '';}
  if(action==='route'){if(!t.route.includes(k))t.route.push(k);return '';}
  if(action==='unroute'){t.route.splice(k,1);return '';}
  if(action!=='trialCheck')return '';
  const type=trialType(c);
  if(type==='duty'){
    if([t.time,t.hand].some(row=>row.includes(-1)||new Set(row).size!==3))return '각 시각과 각 사람을 세 곳에 한 번씩 배정해 주세요.';
    const rule=dutyTrial(c.id).rules.find(a=>!dutyFits(a,t));if(rule)return dutyWords(rule,c.scenes.map(s=>s.place),hands);
  }else if(type==='seal'){
    const before=sealTrial(c.id).lines,after=sealLines(t.bits.map(v=>v===1?1:0));
    const y=after.rows.findIndex((v,i)=>String(v)!==String(before.rows[i]));if(y!==-1)return (y+1)+'번째 가로줄의 먹점 묶음이 남은 기록과 다릅니다.';
    const x=after.cols.findIndex((v,i)=>String(v)!==String(before.cols[i]));if(x!==-1)return (x+1)+'번째 세로줄의 먹점 묶음을 다시 살펴보세요.';
  }else{
    const plan=courierTrial(c.id),s=courierResult(plan,t.route);
    if(t.route.length!==5)return '다섯 곳이 모두 들어가야 합니다.';
    if(s.late>=0)return (s.late+1)+'번째 도착이 정한 시각과 다릅니다. 그곳에는 '+plan.windows[t.route[s.late]].join('~')+'각에 사람이 기다립니다.';
    if(s.total>plan.limit)return '마지막 회답은 받았지만 돌아갈 때 '+(s.total-plan.limit)+'각이 모자랍니다.';
  }
  r.stage='judgment';return '';
}
