// Every field operation uses the people and objects named in that chapter.
const instructions=[
'소쿠리를 받는다/나룻삯을 센다/문옥에게 건넨다','마부를 찾는다/부상자를 옮긴다/뒷문을 연다','빈 배를 찾는다/쌀독을 돌려준다/돈을 나눈다','돛감을 거둔다/주문자를 쫓는다/재봉사를 숨긴다','사공을 부른다/뱃짐을 묶는다/고개에 오른다',
'증인을 맞는다/산문을 연다/밥을 보낸다','멜빵을 돌려준다/다친 아이를 업는다/산길을 뚫는다','약함을 닫는다/의원을 찾는다/환자를 옮긴다','서고 창을 살핀다/탁본을 싼다/사서를 보호한다','압류표를 걷는다/곳간을 연다/주인을 찾아간다',
'짚신을 거둔다/산문을 연다/사공을 들인다','아이를 찾는다/고갯길을 편다/배를 돌려준다','사공을 맞는다/언덕을 살핀다/두 배를 붙인다','거울을 가린다/백기를 든다/증인을 뺀다','불 난 배를 푼다/노꾼을 구한다/갈대밭을 건넌다',
'사공을 찾는다/명패를 맞춘다/밑창을 연다','돛폭을 잇는다/밥통을 내린다/수문을 푼다','죽은 이를 찾는다/패를 갈라낸다/노역줄을 푼다','전령을 멈춘다/봉서를 맞댄다/아이들을 건넨다','사슬을 당긴다/돌배를 띄운다/뒷나루를 연다',
'여울을 재 본다/쌀배를 민다/섬에 닻을 댄다','망루를 찾는다/거울을 돌린다/밤배를 부른다','피난길을 튼다/굴뚝을 비운다/마지막 배를 댄다','빗장을 든다/사슬을 받친다/갇힌 사공을 뺀다','노꾼을 내린다/선미를 잡는다/갑판을 비운다',
'탁본을 말린다/날짜를 겹친다/돌무더기를 지난다','술잔을 거둔다/호위패를 맞춘다/세 번째 배에 탄다','쐐기를 찾는다/위패를 닦는다/곽씨를 모신다','끈을 맡긴다/발자국을 좇는다/가면을 놓아준다','군패를 거둔다/이름을 읽는다/제단문을 연다',
'덧문을 연다/환자를 찾는다/종을 내린다','약천을 씻는다/물을 옮긴다/아이에게 먹인다','긴 상을 받친다/빈 의자를 놓는다/증인을 부른다','빗장을 받친다/목탁을 울린다/피난민을 들인다','곡간을 연다/수레를 돌린다/서쪽 길을 묻는다',
'수통을 거둔다/그늘을 편다/뒤처진 이를 찾는다','눈을 걷는다/칼집을 찾는다/눈길을 되밟는다','피리를 찾는다/아이를 보낸다/빈 박에 부른다','피홈을 읽는다/샛문을 연다/제관을 내보낸다','이름을 남긴다/부상자를 옮긴다/퇴로를 연다',
'신발을 벗긴다/수레를 민다/부상자를 받친다','대청을 닦는다/약사발을 든다/서문을 편다','빈 노를 나눈다/샛길을 연다/국을 나른다','놋틀을 돌린다/매듭을 푼다/빈 종을 지난다','물길을 씻는다/칼집을 내린다/빈 그릇을 든다'];
const formations=[
['###########','#.........#','#..###....#','#....#..#.#','#.#.....#.#','#...##....#','#.........#','###########'],
['###########','#.........#','#..#...#..#','#..#.#....#','#....##...#','#.#.....#.#','#.........#','###########'],
['###########','#.........#','#.###..#..#','#......#..#','#...#.....#','#...#.##..#','#.........#','###########'],
['###########','#.........#','#..#.##...#','#....#....#','#.#....##.#','#...#.....#','#.........#','###########'],
['###########','#.........#','#.##...#..#','#....#....#','#..#...#..#','#...##....#','#.........#','###########']];
const modes=[
 ['escort','호송','첫 자리에 있는 사람을 맞아 끝까지 함께 이동하세요. 동행 중에는 좁은 칸을 건널 수 있습니다.'],
 ['scout','답사','세 지점을 어떤 순서로든 살핀 뒤 출구로 가세요. 경계가 옮겨 갈 칸은 빗금으로 보입니다.'],
 ['signal','전령','신호를 ①, ②, ③ 순서로 전하세요. 멀리 돌아가거나 한 수 멈춰 경비를 보낼 수 있습니다.'],
 ['sluice','수문','①에서 물길을 바꾸면 얕은 여울이 열립니다. 남은 두 곳을 돌고 출구로 가세요.'],
 ['carry','운반','①에서 짐을 받아 ②에 내려놓으세요. 짐을 든 동안 좁은 칸을 피하고 마지막 사람에게 알리세요.']
];
const planOrder=[0,1,4,2,0,2,0,4,1,4,0,0,3,1,2,0,3,1,2,3,4,1,0,3,2,1,2,0,1,2,2,4,1,0,4,4,1,0,3,2,0,4,0,2,3];
const glyphs=['①','②','③'];
export function layout(id,sector){
 const seed=id*17+sector*13,rows=formations[(id+sector*3)%formations.length],mx=!!(seed&1),my=!!(seed&2);
 const index=(x,y)=>(my?7-y:y)*11+(mx?10-x:x);
 const cells=Array(88).fill('#');for(let y=0;y<8;y++)for(let x=0;x<11;x++)cells[index(x,y)]=rows[y][x];
 const targets=(sector?[[8,1],[2,6],[8,6]]:[[2,1],[9,5],[2,6]]).map(p=>index(...p));
 const start=index(1,sector?6:3),exit=index(9,sector?3:1),tracks=sector?[[3,1],[4,1],[5,1],[4,1]]:[[6,6],[7,6],[8,6],[7,6]];
 const patrol=tracks.map(p=>index(...p)),narrow=[index(5,1),index(6,6)],mode=modes[(planOrder[id]+(sector?2:0))%5];
 return {id,sector,cells,start,exit,targets,patrol,narrow,mode,labels:instructions[id].split('/')};
}
export function beginManeuver(board){return {pos:board.start,mask:0,turn:0};}
export function availableMoves(board,s){
 const {cells,narrow,mode,patrol}=board,carrying=mode[0]==='carry'&&s.mask===1;
 return [-11,1,11,-1].map(n=>s.pos+n).filter(i=>cells[i]==='.'&&i!==patrol[(s.turn+1)%4]&&
   !(narrow.includes(i)&&(carrying||!s.mask&&['sluice','escort'].includes(mode[0]))));
}
export function moveUnit(board,s,to){
 if(to!==s.pos&&!availableMoves(board,s).includes(to))return false;
 s.pos=to;s.turn++;return true;
}
export function canOperate(board,s){
 const i=board.targets.indexOf(s.pos);if(i<0||s.mask&(1<<i))return false;
 if(board.mode[0]==='scout')return true;
 if(board.mode[0]==='sluice')return i===0||!!(s.mask&1);
 return s.mask===(1<<i)-1;
}
export function operate(board,s){if(!canOperate(board,s))return false;s.mask|=1<<board.targets.indexOf(s.pos);return true;}
export const reached=(b,s)=>s.mask===7&&s.pos===b.exit;
export const badge=i=>glyphs[i];
