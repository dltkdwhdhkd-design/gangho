import { G, esc } from './core.js';
import { save } from './state.js';
import { Story, narr } from './ctx.js';
import { closeMenu, openMenu } from './ui.js';
import { cases, volumes, routeVoices } from './chronicle-books.js';
import { councils, workMaterials } from './chronicle-council.js';
import { boardFor, newWalk, move, visit, near, reachable, canVisit, rulesFor, ruleText, fits, shuffled } from './chronicle-rules.js';
import { provisionPlan, sumLoads, loadMatches } from './chronicle-stores.js';
import { trialPanel,actOnTrial } from './chronicle-trial-panel.js';
import { eveningFor } from './chronicle-evenings.js';
import { chapterEcho,returnWitnesses } from './chronicle-returns.js';

const state=()=>G.S;
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
function ledger(){
  const s=state();
  return s.chronicle??={unlocked:1,done:{},runs:{},council:{},answers:{},book:0,mode:'quiet',elapsed:0};
}
export function available(s){
  if(s.mode==='free'||s.flags.cleared||s.flags.awaitingRoadEnding||s.flags.finale)return 9;
  const raw=s.chapter?.match(/제(\d+)부/);
  return Math.max(1,Math.min(8,Math.max(s.chronicle?.unlocked||1,Number(raw?.[1]||0))));
}
const live=()=>state().mode!=='free' && !state().flags.cleared;
const caseOpen=(c,d)=> c.volume+1<=available(state()) && (c.volume!==8||c.index<2||!live()||state().flags.awaitingRoadEnding||state().flags.finale) && (c.index===0||own(d.done,c.id-1));
function recordPart(no){
  const d=ledger(), prior=d.unlocked;
  d.unlocked=Math.max(no,d.unlocked);
  if(d.mode==='together'&&no>prior&&no<9)d.notice=no;
}
let mount=null,selected=null,message='',visitedAt=0,owner=null,finishRequested=false,refreshWorld=false;
document.addEventListener('visibilitychange',()=>{visitedAt=!document.hidden&&mount?.isConnected?performance.now():0;});
const sceneNames=['길잡이','기록자'];
const faceNames={'류연재':'yeonjae','단무경':'mugyeong','한재하':'jaeha','서이겸':'igyeom','윤설':'yun','소연하':'so','혁련하':'hyeok','남궁선':'clan_namgung','백랑':'baekrang'};
const btn=(action,label,opts='')=>'<button type="button" class="cr-button" data-cr="'+action+'" '+opts+'>'+esc(String(label))+'</button>';
const para=t=>'<p>'+esc(t)+'</p>';
const heading=t=>'<h3>'+esc(t)+'</h3>';
function speaker(name,line){
  const face=faceNames[name];
  return '<blockquote class="cr-voice">'+(face?'<img src="assets/art/'+face+'_n.webp" alt="">':'')+'<div><b>'+esc(name)+'</b>'+para(line)+'</div></blockquote>';
}
function art(v){return new URL('assets/art/cg_'+v.art+'.webp',document.baseURI).href;}
function banner(v,kicker,title){
  return '<header class="cr-banner" style="background-image:linear-gradient(90deg,rgba(21,28,30,.96),rgba(25,31,31,.78) 60%,rgba(25,31,31,.15)),url('+art(v)+')"><div>'+esc(kicker)+'</div><h2>'+esc(title)+'</h2></header>';
}
const prevEcho=(c,d)=> c.index>0&&own(d.done,c.id-1)?cases[c.id-1].verdicts[d.done[c.id-1]].after:c.volume>0&&own(d.council,c.volume-1)?councils[c.volume-1][11+d.council[c.volume-1]]:'';
function indexScreen(d){
  if(live()&&d.mode==='together'&&[undefined,'p0','p0a'].includes(state().flags.step)){
    return banner(volumes[0],'청하진 · 달맞이 객잔','부엌에 맡긴 삼베')+para('달맞이 객잔에서 국수를 먹고 곽 아주머니의 일을 도우면 점례가 첫 기록을 맡깁니다.');
  }
  const unlocked=available(state()),cnt=Object.keys(d.done).length,v=volumes[d.book]||volumes[0],i=volumes.indexOf(v);
  const cntHere=v.cases.filter(c=>own(d.done,c.id)).length;
  const tabs=volumes.map((b,j)=>'<button class="cr-tab" data-cr="book-'+j+'" aria-pressed="'+(i===j)+'" '+(j+1>unlocked?'disabled':'')+' title="'+esc(b.title)+'">'+(j+1)+'권</button>').join('');
  const listing=v.cases.map(c=>{
    const done=own(d.done,c.id),opened=caseOpen(c,d),run=d.runs[c.id],why=c.volume===8&&c.index>=2&&live()&&!state().flags.awaitingRoadEnding?'결전 뒤 귀환기':'앞 사건 뒤';
    return '<button class="cr-entry" data-cr="case-'+c.id+'" '+(!done&&!opened?'disabled':'')+'><span>'+String(c.index+1).padStart(2,'0')+'</span><strong>'+esc(c.title)+'</strong><small>'+(done?'기록 읽기':run?'이어가기':opened?'시작':why)+'</small></button>';
  }).join('');
  let tail='';
  if(cntHere===8)tail=btn('council',own(d.council,i)?'권말 기록 읽기':'증인들과 권말 평의 열기');
  if(state().flags.awaitingRoadEnding)tail+=btn('finish','행록을 덮고 본편 결말 보기');
  const activeHours=Math.floor(d.elapsed/3600000),activeMin=Math.floor(d.elapsed/60000)%60;
  return banner(v,'달맞이 행록 · '+cnt+' / 72건','제'+(i+1)+'권 '+v.title)+'<nav class="cr-tabs" aria-label="행록 권 선택">'+tabs+'</nav>'+
    '<div class="cr-place">'+esc(v.region)+' · '+esc(v.station)+'</div>'+para(v.opening)+'<div class="cr-list">'+listing+'</div><div class="cr-actions">'+tail+'</div>'+
    '<details class="cr-details"><summary>진행 방법과 기록</summary>'+para('본편에서 새 부에 이르면 다음 권이 도착합니다. 각 권은 순서대로 잇고 다른 권은 오가며 진행할 수 있습니다. 조사, 증언, 일의 순서, 짐 분배, 현장 인계와 권말 평의가 자동 저장됩니다.')+
    para('행록 참여 시간 '+activeHours+'시간 '+activeMin+'분 · 화면을 열고 조작한 구간만 합산합니다.')+
    (live()?btn('pace',d.mode==='together'?'권이 도착해도 본편부터 계속하기':'새 권이 도착하면 행록 함께 열기'):'')+'</details>';
}
function start(c){
  const d=ledger();
  if(!caseOpen(c,d)||own(d.done,c.id))return;
  d.runs[c.id]??={stage:'brief',walk:newWalk(boardFor(c.id)),order:[],verdict:null,assignment:[-1,-1,-1,-1,-1,-1],van:0};
}
const stages={brief:'사건 접수',search:'현장 조사',testimony:'증언 대조',sequence:'일의 순서',trial:'지역 실무',judgment:'당사자에게 답하기',supplies:'보낼 몫 나누기',delivery:'현장 인계',report:'회답'};
function brief(c,d){
  const v=volumes[c.volume],echo=prevEcho(c,d),route=state().side;
  return (echo?'<div class="cr-echo">'+heading('지난 기록')+para(echo)+'</div>':'')+
    speaker(c.scenes[0].speaker,c.scenes[0].line)+
    (c.index===0&&c.volume>=3&&c.volume<=6&&routeVoices[route]?speaker(...routeVoices[route]):'')+
    para(c.scenes.map(s=>s.place).join(' → '))+
    btn('depart','현장으로 가기');
}
function witnesses(c,mask){
  return '<details class="cr-details"><summary>모은 증언 다시 읽기</summary>'+c.scenes.map((s,i)=>mask&1<<i?speaker(s.speaker,s.line):'').join('')+'</details>';
}
const cellName={'#':'막힌 지형','.':'길','~':'교차로','=':'가파른 길','+':'신호대'};
function workBoard(c,r,settling){
  const v=volumes[c.volume],board=boardFor(c.id,settling,r.verdict||0),walk=r.walk,moves=reachable(board,walk);
  const focus=walk.actor,labels=settling?['인계표 받기','받을 몫 확인','두 사람이 함께 인계']:['첫 증언 듣기','두 번째 증언 듣기','두 기록과 현물 맞대기'];
  const siteNames=settling?(r.verdict?[c.scenes[1].place,c.scenes[0].place,c.scenes[2].place]:c.scenes.map(s=>s.place)):c.scenes.map(s=>s.place);
  const tiles=board.cells.map((t,p)=>{
    const who=walk.pos.indexOf(p),target=board.sites.indexOf(p),active=who===focus,done=target>=0&&!!(walk.mask&1<<target);
    const symbol=who!==-1?(who===0?'길':'기'):target!==-1?['①','②','③'][target]:({'#':'','~':'≈','=':'≋','+':'⚑','.':''}[t]);
    const title=(p%10+1)+'열 '+(Math.floor(p/10)+1)+'행 · '+(target>=0?siteNames[target]+' · ':'')+(who>=0?sceneNames[who]:cellName[t]);
    return '<button class="cr-cell kind-'+({'.':'path','#':'rock','~':'water','=':'ridge','+':'flag'}[t])+(moves.includes(p)?' reach':'')+(target>=0?' target':'')+(done?' seen':'')+(who>=0?' pawn p'+who:'')+(active?' current':'')+'" title="'+esc(title)+'" aria-label="'+esc(title)+'" data-cr="'+(who>=0?'actor-'+who:'step-'+p)+'" '+(who<0&&!moves.includes(p)?'disabled':'')+'>'+symbol+'</button>';
  }).join('');
  const stops=labels.map((s,i)=>'<div class="cr-stop"><b>'+['①','②','③'][i]+' '+esc(siteNames[i])+'</b><small>'+esc(i===2?'두 사람 모두':sceneNames[i])+' · '+(walk.mask&1<<i?'완료':'진행 중')+'</small>'+
    (walk.mask&1<<i?'':btn('visit-'+i,s,canVisit(board,walk,i)?'':'disabled'))+'</div>').join('');
  const last=walk.last>=0?walk.last:null;
  const event=last===null?'':settling?speaker(v.voice,[siteNames[0]+'에서 '+v.cargo+'를 받았다. 건넨 이가 수와 이름을 직접 확인했다.',siteNames[1]+'에서 '+v.people+'의 몫을 확인했다. 수령인과 한 자리에서 맞대기로 했다.',c.verdicts[r.verdict].after][last]):speaker(c.scenes[last].speaker,c.scenes[last].line);
  return '<div class="cr-board-layout"><div><div class="cr-switch">'+[0,1].map(i=>btn('actor-'+i,sceneNames[i]+(i===focus?' · 조작 중':''),'aria-pressed="'+(i===focus)+'"')).join('')+'</div><div class="cr-grid" role="group" aria-label="현장 이동 지도" style="--road-art:url('+art(v)+')">'+tiles+'</div><div class="cr-legend">길 · 길잡이 / 기 · 기록자　⚑ 신호대　≈ 교차로</div></div><div class="cr-stops">'+stops+'</div></div>'+
    '<div class="cr-instruct">'+esc(v.terrain)+' '+esc('밝은 칸을 눌러 이동하세요. 목적지에 닿거나 바로 옆에 서면 그곳의 일을 할 수 있습니다. ③에서는 ①과 ②를 마친 두 사람이 모여야 합니다.')+'</div>'+
    '<details class="cr-details"><summary>통행과 신호</summary>'+para('길잡이는 한 번에 세 칸, 기록자는 두 칸을 걷습니다. 서로의 자리로 지나갈 수 없습니다. 다른 사람이 깃발에서 신호를 주면 교차로나 가파른 지름길도 통과할 수 있습니다. 우회로는 늘 열려 있습니다.')+
    btn('rest','다음 통행 신호까지 기다리기')+'</details>'+event+
    (walk.mask===7?btn('file',settling?'인계 회답 읽기':'세 기록을 대조하기'):'');
}
function sceneScreen(c,d){
  const v=volumes[c.volume],r=d.runs[c.id],done=own(d.done,c.id);
  let page=btn('index','‹ 사건 목록')+banner(v,'제'+(c.volume+1)+'권 · '+(c.index+1)+'화 · '+(done?'보관 기록':stages[r.stage]),c.title);
  const evening=eveningFor(c);
  const night=evening?heading('그날 저녁')+speaker(evening[0],evening[1])+speaker(state().name,evening[2])+speaker(evening[0],evening[3]):'';
  if(done)return page+c.scenes.map(s=>speaker(s.speaker,s.line)).join('')+heading(c.verdicts[d.done[c.id]].label)+para(c.verdicts[d.done[c.id]].after)+night+nextButton(c,d);
  switch(r.stage){
    case 'brief':return page+brief(c,d);
    case 'search':return page+workBoard(c,r,false)+witnesses(c,r.walk.mask);
    case 'testimony':return page+witnesses(c,7)+heading(c.question)+shuffled([0,1,2],c.id+43).map(i=>btn('guess-'+i,c.answers[i])).join('');
    case 'sequence':{
      const rules=rulesFor(c.id);
      return page+para('증인들이 기억하는 선후를 맞춰 현장의 다섯 가지 일을 복원하세요.')+'<ul class="cr-rules">'+rules.map(t=>'<li>'+esc(ruleText(t,c.tasks))+'</li>').join('')+'</ul><div class="cr-order">'+(r.order.length?r.order.map((j,i)=>btn('remove-'+i,(i+1)+'. '+c.tasks[j])).join(''):para('아래에서 첫 일부터 고르세요. 고른 일을 누르면 뺄 수 있습니다.'))+'</div><div class="cr-actions">'+shuffled([0,1,2,3,4],87+c.id).filter(k=>!r.order.includes(k)).map(k=>btn('order-'+k,c.tasks[k])).join('')+'</div>'+btn('checkOrder','증언과 맞춰 보기',r.order.length===5?'':'disabled');
    }
    case 'judgment':return page+witnesses(c,7)+heading('어떤 약속을 남길까')+c.verdicts.map((t,i)=>btn('verdict-'+i,t.label)).join('');
    case 'trial':return page+trialPanel(c,r,v,btn);
    case 'supplies':{
      const plan=provisionPlan(c.id,r.verdict),m=workMaterials[c.volume],dest=c.scenes.map(s=>s.place);
      return page+heading(c.verdicts[r.verdict].label)+para('세 곳에 보낼 두 가지 물품을 맞춥니다. 짐은 풀지 않고 두 꾸러미씩 함께 보냅니다. 받을 곳을 고른 뒤 꾸러미를 누르세요.')+
        '<div class="cr-cargo">'+dest.map((name,i)=>{const got=sumLoads(plan.weights,r.assignment.flatMap((k,j)=>k===i?[j]:[]));return btn('van-'+i,name+' · '+m[0]+' '+got[0]+'/'+plan.wants[i][0]+' · '+m[1]+' '+got[1]+'/'+plan.wants[i][1],'aria-pressed="'+(r.van===i)+'"');}).join('')+'</div>'+
        '<div class="cr-loads">'+plan.order.map((k,i)=>btn('load-'+k,'꾸러미 '+(i+1)+' · '+m[0]+' '+plan.weights[k][0]+' / '+m[1]+' '+plan.weights[k][1]+' → '+(r.assignment[k]===-1?'배정 전':dest[r.assignment[k]]))).join('')+'</div>'+btn('dispatch','세 곳으로 보낼 수량 확인');
    }
    case 'delivery':return page+workBoard(c,r,true);
    case 'report':return page+para(c.verdicts[r.verdict].after)+night+btn('complete','회답을 장부에 묶기');
  }
  return page;
}
function nextButton(c,d){
  if(c.index===7)return btn('council',own(d.council,c.volume)?'권말 기록 보기':'권말 평의로');
  const next=cases[c.id+1];return caseOpen(next,d)?btn('case-'+next.id,'다음 사건 · '+next.title):btn('index','목록으로');
}
function councilScreen(d){
  const i=d.book,v=volumes[i],a=councils[i],closed=own(d.council,i),step=d.answers[i]||0;
  let html=btn('index','‹ 사건 목록')+banner(v,'제'+(i+1)+'권 · 증인들의 평의',v.title);
  if(closed){
    const choice=d.council[i];
    html+=heading(a[9+choice])+para(a[11+choice])+para(v.closing);
    if(i<8&&i+1<available(state()))html+=btn('book-'+(i+1),'다음 권 펴기');
    if(i===8)html+=para(endingLine(d));
    if(state().flags.awaitingRoadEnding)html+=btn('finish','행록을 덮고 본편 결말 보기');
    return html;
  }
  if(step<2){
    const offset=1+step*4;
    return html+speaker(a[0],a[offset])+shuffled([0,1,2],i+step+100).map(k=>btn('recall-'+k,a[offset+1+k])).join('')+
      '<details class="cr-details"><summary>이 권에서 남긴 여덟 회답</summary>'+v.cases.map(c=>heading(c.title)+para(c.scenes[2].line)+para(c.verdicts[d.done[c.id]].after)).join('')+'</details>';
  }
  return html+speaker(a[0],'이제 무엇을 뒷사람에게 넘기겠습니까?')+btn('seal-0',a[9])+btn('seal-1',a[10]);
}
function endingLine(d){
  const completed=Object.keys(d.done).length,heard=Object.keys(d.council).length;
  if(!completed)return '빈 대접은 다음 손님 자리에서 주인을 기다렸다.';
  const decisions=Object.values(d.done),first=decisions.filter(n=>n===0).length;
  const ending=first*2>=completed?'공동으로 지킬 자리를 정해 둔 덕에, 내가 떠난 뒤에도 누군가 먼저 문을 열었다.':'기록을 제 손에 돌려받은 사람들이 이번에는 내 이름을 묻고 자기 종이에 적었다.';
  return (heard===9?'아홉 권을 한 상 위에 펼쳤다. ':completed+'건의 회답을 객잔 문턱에 두었다. ')+ending+(own(d.council,8)?' '+councils[8][11+d.council[8]]:'');
}
function paint(){
  if(!mount?.isConnected)return;
  const d=ledger();
  const body=selected==='council'?councilScreen(d):typeof selected==='number'?sceneScreen(cases[selected],d):indexScreen(d);
  mount.innerHTML='<section class="chronicle">'+body+'<div class="cr-message" role="status">'+esc(message)+'</div></section>';
}
function openTab(container){
  const d=ledger();
  if(owner!==state()){selected=null;owner=state();}
  if(typeof selected==='number'&&!own(d.runs,selected)&&!own(d.done,selected))selected=null;
  if(selected==='council'&&!volumes[d.book].cases.every(c=>own(d.done,c.id)))selected=null;
  d.book=Math.min(available(state())-1,d.book||0);
  mount=container;visitedAt=performance.now();
  container.onclick=e=>{const b=e.target.closest('[data-cr]');if(b&&!b.disabled)handle(b.dataset.cr);};
  paint();
}
function tabClosed(){
  mount=null;visitedAt=0;message='';
  if(refreshWorld&&G.field?.m&&G.scene==='field'){refreshWorld=false;G.field.refresh();}
}
function handle(key){
  const d=ledger(),[action,n]=key.split('-'),k=Number(n),c=typeof selected==='number'?cases[selected]:null,r=c&&d.runs[c.id],v=volumes[d.book];
  const now=performance.now();if(visitedAt&&now-visitedAt<90000&&!document.hidden)d.elapsed+=Math.max(0,Math.round(now-visitedAt));visitedAt=now;
  message='';const old=selected,stage=r?.stage,scroll=mount.scrollTop;
  switch(action){
    case 'index':selected=null;break;
    case 'book':if(k>=0&&k<available(state())){d.book=k;selected=null;}break;
    case 'case':{const q=cases[k];if(q&&(caseOpen(q,d)||own(d.done,k))){start(q);d.book=q.volume;selected=k;}break;}
    case 'pace':d.mode=d.mode==='together'?'quiet':'together';break;
    case 'depart':r.stage='search';break;
    case 'actor':r.walk.actor=k;break;
    case 'step':move(boardFor(c.id,r.stage==='delivery',r.verdict||0),r.walk,k);break;
    case 'rest':r.walk.turn++;break;
    case 'visit':visit(boardFor(c.id,r.stage==='delivery',r.verdict||0),r.walk,k);break;
    case 'file':if(r.walk.mask===7)r.stage=r.stage==='search'?'testimony':'report';break;
    case 'guess':if(k===0)r.stage='sequence';else message='그 짐작으로는 현장에 남은 자국을 설명할 수 없습니다. '+c.scenes[2].line;break;
    case 'order':if(!r.order.includes(k)&&r.order.length<5)r.order.push(k);break;
    case 'remove':r.order.splice(k,1);break;
    case 'checkOrder':{
      const bad=rulesFor(c.id).find(t=>!fits(t,r.order));
      if(r.order.length===5&&!bad)r.stage='trial';
      else message=bad?'이 대목을 다시 맞춰 보세요. '+ruleText(bad,c.tasks):'다섯 일을 모두 놓아 주세요.';
      break;
    }
    case 'time': case 'hand': case 'mark': case 'route': case 'unroute': case 'trialCheck':
      message=actOnTrial(c,r,action,k);break;
    case 'verdict':r.verdict=k;r.stage='supplies';break;
    case 'van':r.van=k;break;
    case 'load':r.assignment[k]=r.assignment[k]===r.van?-1:r.van;break;
    case 'dispatch':{
      const check=loadMatches(provisionPlan(c.id,r.verdict),r.assignment);
      if(check.every(Boolean)){r.stage='delivery';r.walk=newWalk(boardFor(c.id,true,r.verdict));}
      else message=check.map((ok,i)=>ok?'':c.scenes[i].place).filter(Boolean).join(' · ')+'에 보낼 두 꾸러미의 수량을 살펴보세요.';
      break;
    }
    case 'complete':if(r?.stage==='report'&&!own(d.done,c.id)){d.done[c.id]=r.verdict;delete d.runs[c.id];refreshWorld=true;}break;
    case 'council':if(v.cases.every(e=>own(d.done,e.id)))selected='council';break;
    case 'recall':if(k===0)d.answers[d.book]=Math.min(2,(d.answers[d.book]||0)+1);else message='다른 사건에서 나온 얘기 같습니다. 아래 여덟 회답을 펴서 당시 증언을 비교해 보세요.';break;
    case 'seal':if(d.answers[d.book]===2&&!own(d.council,d.book))d.council[d.book]=k;break;
    case 'finish':if(state().flags.awaitingRoadEnding&&!finishRequested){finishRequested=true;closeMenu();void G.field.run(G.act3t.lastChoice).finally(()=>{finishRequested=false;});}return;
    default:return;
  }
  save();paint();
  if(mount)mount.scrollTop=old!==selected||stage!==r?.stage?0:scroll;
}
function arrive(){
  if(G.scene!=='field'||state().mode==='free'||G.menuOpen||G.field.busy)return;
  const d=ledger(),notice=d.notice; if(!notice||d.mode!=='together')return;
  delete d.notice;d.book=Math.min(notice-1,available(state())-1);selected=null;save();openMenu('chronicle');
}
async function deferEnding(){
  const s=state(),d=ledger();
  if(s.flags.awaitingRoadEnding||d.mode!=='together'||Object.keys(d.council).length===9)return false;
  s.flags.awaitingRoadEnding=true;d.unlocked=9;d.book=8;d.notice=9;
  await narr('결전 소식은 먼저 강을 건넜다. 아직 돌아오지 못한 이들의 안부가 남았다. 달맞이 객잔으로 가서 흩어진 행록을 받기로 했다.');
  s.goal='청하진에서 달맞이 행록의 귀환기를 잇거나 행록을 덮고 본편 결말을 본다.';
  await G.field.warp('cheongha',22.5,16,0);return true;
}
const stations={'cheongha':[23.5,18.5],'guhwa':[11.5,18.8],'pass':[18,12.5]};
Story.providers.push(function roadDesk(map){
  const p=stations[map],s=state();
  const spot=p&&s?[{id:'chronicle_desk',spr:'',stamp:'sign',x:p[0],y:p[1],hint:'달맞이 행록',dir:0,
    talk:()=>{selected=null;openMenu('chronicle');}}]:[];
  return {npcs:[...spot,...returnWitnesses(map)],spots:[],trigs:[],roam:[]};
});
G.chronicle={tab:openTab,closed:tabClosed,arrive,recordPart,chapterEcho,deferEnding,ending:async()=>{
  const d=ledger();if(Object.keys(d.done).length)await narr(endingLine(d));
},ledger,available};
