import { Input,esc,G } from './core.js';
import { save } from './state.js';
import { layout,beginManeuver,availableMoves,moveUnit,canOperate,operate,reached,badge } from './main-maneuvers.js';
let opened=null;
export function maneuvers(run,id,sector,title,place){
 if(opened)return opened;
 const b=layout(id,sector),s=run.board??=beginManeuver(b),root=document.createElement('section');
 root.className='main-command';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label',place+' '+b.mode[1]);
 document.querySelector('#stage').append(root);
 const before=document.activeElement;
 let complete;
 opened=new Promise(resolve=>{complete=resolve;});
 const close=done=>{document.removeEventListener('keydown',keys,true);root.remove();Input.clear();before?.focus?.();opened=null;save();complete(done);};
 function draw(){
  const moves=availableMoves(b,s),nextGuard=b.patrol[(s.turn+1)%4],guard=b.patrol[s.turn%4];
  root.innerHTML='<div class="mc-sheet"><div class="mc-head"><div><small>'+esc(title)+'</small><h2>'+esc(place)+' · '+b.mode[1]+'</h2></div><button type="button" class="btn" data-m="back">현장으로</button></div><div class="mc-body"><div class="mc-grid" role="group" aria-label="작전도"></div><div class="mc-order"><p>'+b.mode[2]+'</p><ol>'+b.labels.map((n,i)=>'<li class="'+(s.mask&(1<<i)?'met':'')+'">'+esc(n)+'</li>').join('')+'</ol><p class="mc-legend">● 내 자리　門 출구<br>붉은 칸 경비　빗금 다음 경계<br>푸른 칸 좁은 길</p><div class="mc-actions"><button class="btn" data-m="do" '+(canOperate(b,s)?'':'disabled')+'>'+esc(b.labels[b.targets.indexOf(s.pos)]||'현장에서 행동')+'</button><button class="btn" data-m="wait">한 수 지켜보기</button></div><small>방향키 또는 이웃한 칸으로 이동 · E 행동</small></div></div></div>';
  const grid=root.querySelector('.mc-grid');
  for(let i=0;i<88;i++){
   const c=document.createElement('button'),j=b.targets.indexOf(i),here=s.pos===i;
   c.type='button';c.dataset.m=String(i);c.tabIndex=-1;c.disabled=!moves.includes(i)&&!here;
   c.className=['mc-cell',b.cells[i]==='#'?'rock':'',b.narrow.includes(i)?'narrow':'',i===guard?'guard':'',i===nextGuard?'warning':'',moves.includes(i)?'legal':'',here?'unit':'',j>=0?'station':''].join(' ');
   c.textContent=here?'●':j>=0?(s.mask&(1<<j)?'✓':badge(j)):i===b.exit?'門':i===guard?'巡':'';
   c.setAttribute('aria-label',here?'내 위치':j>=0?b.labels[j]:i===b.exit?'출구':(i%11+1)+'열 '+(1+Math.floor(i/11))+'행');grid.append(c);
  }
 }
 function act(cmd){
  if(cmd==='back'){close(false);return;}
  if(cmd==='do'||Number(cmd)===s.pos&&cmd!=='wait'){if(!operate(b,s))return;}
  else if(cmd==='wait')moveUnit(b,s,s.pos);
  else if(!moveUnit(b,s,Number(cmd)))return;
  if(reached(b,s)){delete run.board;close(true);return;}
  save();draw();
 }
 function keys(e){
  const d={ArrowLeft:-1,KeyA:-1,ArrowRight:1,KeyD:1,ArrowUp:-11,KeyW:-11,ArrowDown:11,KeyS:11}[e.code];
  if(d===undefined&&!['KeyE','Space','Escape'].includes(e.code))return;
  e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;
  act(d!==undefined?String(s.pos+d):e.code==='Escape'?'back':e.code==='Space'?'wait':'do');
 }
 root.onclick=e=>{const target=e.target.closest('[data-m]');if(target&&!target.disabled)act(target.dataset.m);};
 document.addEventListener('keydown',keys,true);Input.clear();draw();root.querySelector('[data-m="back"]').focus();save();return opened;
}
