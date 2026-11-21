// 사각 지형, 두 일꾼의 통행, 목격 순서 복원. 화면과 저장 장치 없이도 같은 판을 재현한다.
const terrains = [
 ['..##...+..','...~..#...','.#.~#...#.','.+..##....','..#...~.#.','...#..~...','.#...+..#.','....#.....'],
 ['..#....+..','....#.=.#.','.#..#.==..','.+....#...','...##....#','.#...=.#..','...+....#.','..#...#...'],
 ['...#..+...','.#...~..#.','.+.#.##...','.....#..#.','.#..~...#.','...#..#...','.#...+..#.','...#......'],
 ['..+..#....','.#.~...##.','...~.#....','.##..#.~#.','.+...#.~..','..#.....#.','....#+....','.#.....#..'],
 ['...#...+..','.#...#.~..','.+.#...~#.','...#.##...','.#.....#..','...#.~....','..+..#..#.','....#.....'],
 ['....#..+..','.#.~..#...','...~#...#.','.+....#...','..#.#.~.#.','......~...','.#..+..##.','...#......'],
 ['..#...+...','....#.=.#.','.#..#.=...','.+....#...','...##...#.','.#....#...','...#.+..#.','..........'],
 ['...#...+..','.#.~.#....','.+.~....#.','...#..#...','.#...~..#.','...#.~....','..+....#..','....#.....'],
 ['..+...#...','.#..=...#.','....=.#...','.#....#...','...#....#.','.#...~....','...+.#..#.','..#.......']
];
const W=10,H=8;
export { W,H };
export function shuffled(list,seed){
  let n=(seed+1)*2654435761>>>0;const a=[...list];
  for(let i=a.length-1;i>0;i--){n=(Math.imul(n,1664525)+1013904223)>>>0;const j=n%(i+1);[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
export function neighbors(p){
  const x=p%W,y=Math.floor(p/W),out=[];
  if(x>0)out.push(p-1);if(x+1<W)out.push(p+1);if(y>0)out.push(p-W);if(y+1<H)out.push(p+W);
  return out;
}
const manhattan=(a,b)=>Math.abs(a%W-b%W)+Math.abs(Math.floor(a/W)-Math.floor(b/W));
function distances(start,pass){
  const q=[start],ds=new Map([[start,0]]);
  for(let i=0;i<q.length;i++)for(const n of neighbors(q[i])){
    if(!ds.has(n)&&pass(n)){ds.set(n,ds.get(q[i])+1);q.push(n);}
  }
  return ds;
}
export function boardFor(id,delivery=false,decision=0){
  const v=Math.floor(id/8), seed=id*11+(delivery?101+decision*37:0);
  let lines=[...terrains[v]];
  if(seed%2)lines=lines.map(r=>[...r].reverse().join(''));
  if(Math.floor(seed/2)%2)lines.reverse();
  const cells=[...lines.join('')],normal=p=>cells[p]==='.'||cells[p]==='+';
  const all=shuffled(cells.map((_,i)=>i).filter(normal),seed);
  // Leave room around the two crews and their work sites to pass one another.
  const start=all.find(p=>neighbors(p).filter(normal).length>=3);
  const land=distances(start,normal);
  const points=all.filter(p=>land.has(p)&&neighbors(p).filter(normal).length>=2);
  const neighbor=neighbors(start).find(n=>points.includes(n));
  const far=(from,exclude)=>points.reduce((best,p)=>{
    if(exclude.includes(p))return best;
    const dist=Math.min(...from.map(a=>manhattan(a,p)));
    return dist>best[1]?[p,dist]:best;
  },[-1,-1])[0];
  const a=far([start],[neighbor]),b=far([start,a],[neighbor]),c=far([a,b,start],[neighbor]);
  return {cells,starts:[start,neighbor],sites:[a,b,c],seed};
}
export function newWalk(board){
  return {pos:[...board.starts],actor:0,turn:0,mask:0,last:-1};
}
export const near=(a,b)=>manhattan(a,b)<=1;
export function allowed(board,walk,p){
  const cell=board.cells[p], other=walk.pos[1-walk.actor];
  if(cell==='#'||p===other)return false;
  if(cell==='~' && (walk.turn+board.seed)%3===1 && board.cells[other]!=='+')return false;
  if(cell==='=' && walk.actor===1 && board.cells[other]!=='+')return false;
  return true;
}
export function reachable(board,walk){
  const ds=distances(walk.pos[walk.actor],p=>allowed(board,walk,p));
  const stride=walk.actor===0?3:2;
  return [...ds].filter(([,d])=>d>0&&d<=stride).map(([p])=>p);
}
export function canVisit(board,walk,i){
  if(walk.mask&(1<<i))return false;
  const site=board.sites[i];
  if(i===0||i===1)return near(walk.pos[i],site);
  return (walk.mask&3)===3 && walk.pos.every(p=>near(p,site));
}
export function move(board,walk,p){
  if(!reachable(board,walk).includes(p))return false;
  walk.pos[walk.actor]=p;walk.turn++;walk.last=-1;return true;
}
export function visit(board,walk,i){
  if(!canVisit(board,walk,i))return false;
  walk.mask|=1<<i;walk.last=i;return true;
}
const order=[0,1,2,3,4];
function permutations(list){
  if(!list.length)return [[]];
  return list.flatMap(n=>permutations(list.filter(k=>k!==n)).map(t=>[n,...t]));
}
export const orders=permutations(order);
export function fits(rule,seq){
  const [kind,a,b]=rule,x=seq.indexOf(a),y=seq.indexOf(b);
  if(kind==='before')return x<y;
  if(kind==='next')return y===x+1;
  if(kind==='gap')return Math.abs(y-x)===2;
  if(kind==='adj')return Math.abs(y-x)===1;
  return x!==b;
}
export function rulesFor(id){
  const pool=[];
  for(const a of order)for(const b of order){
    for(const kind of ['before','next','gap','adj','away']){
      if(kind!=='away'&&a===b)continue;
      const r=[kind,a,b];if(fits(r,order))pool.push(r);
    }
  }
  let remaining=orders;const clues=[];
  for(const r of shuffled(pool,id+185)){
    const reduced=remaining.filter(seq=>fits(r,seq));
    if(reduced.length===remaining.length)continue;
    remaining=reduced;clues.push(r);
    if(remaining.length===1)break;
  }
  return clues;
}
export function ruleText([kind,a,b],tasks){
  const A='〈'+tasks[a]+'〉',B='〈'+tasks[b]+'〉';
  if(kind==='before')return A+' 다음에야 '+B+'에 손을 댈 수 있다.';
  if(kind==='next')return A+' 바로 다음이 '+B+'였다.';
  if(kind==='gap')return A+'와 '+B+' 사이에 다른 일 하나가 있었다.';
  if(kind==='adj')return A+'와 '+B+'는 연달아 했다. 어느 쪽이 먼저인지는 보지 못했다.';
  return A+'는 '+['첫째','둘째','셋째','넷째','다섯째'][b]+' 차례에 들지 않았다.';
}
