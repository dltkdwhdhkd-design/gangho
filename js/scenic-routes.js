// Waypoints are picked on the same terrain the player walks. The original trunk roads remain connected.
import { LOCS } from './worlddata.js';

const journeys = [
  ['cheongha','valley','청풍 물굽이','숲길을 내려가면 청풍골, 큰길을 따라 동쪽으로 가면 청하진이다.',7,'teahut'],
  ['hwasan','changan','매화 잔도','바위 능선을 지나면 화산 산문이 보인다. 서쪽 길은 장안으로 이어진다.',9,'cairn'],
  ['wudang','janggang','한수 강안길','버드나무가 우거진 강안을 따라가면 장강수로채로 내려간다.',8,'teahut'],
  ['seongdo','emei','촉산 죽림길','돌표지 서쪽은 아미 산길이고, 동쪽은 성도로 나가는 장사꾼의 길이다.',10,'cairn'],
  ['silk','oasis','서역 대상길','바람을 등지고 사암 봉우리를 돌아가면 사주성의 대상길과 만난다.',11,'teahut'],
  ['tiangate','snowpeak','천산 눈고개','눈이 덮여도 돌무더기를 하나씩 따라가면 빙궁 고개로 넘어갈 수 있다.',8,'cairn']
];
export function scenicRoutes(T,w,h,scale,footprints) {
  const stops=[];
  const reserved=new Uint8Array(w*h);
  const protect=(x0,y0,x1,y1)=>{for(let y=Math.max(0,y0);y<=Math.min(h-1,y1);y++)reserved.fill(1,y*w+Math.max(0,x0),y*w+Math.min(w,x1+1));};
  for(const box of footprints)protect(...box);
  for(let i=0;i<T.length;i++)if(T[i]===10){const x=i%w,y=Math.floor(i/w);protect(x-5,y-6,x+5,y+3);}
  const noBuild=(x,y)=>!!reserved[y*w+x];
  const wet=k=>k===1||k===2||k===9;
  const ok=(x,y)=>x>1&&x<w-2&&y>1&&y<h-2&&!wet(T[y*w+x])&&!noBuild(x,y);
  function nearest(px,py,r,pred) {
    let best=null,bd=Infinity;
    for(let y=Math.round(py)-r;y<=py+r;y++)for(let x=Math.round(px)-r;x<=px+r;x++){
      const d=(x-px)**2+(y-py)**2;if(d<bd&&ok(x,y)&&pred(T[y*w+x])){bd=d;best=[x,y];}
    }
    return best;
  }
  function route(a,b) {
    const x0=Math.max(1,Math.min(a[0],b[0])-13),y0=Math.max(1,Math.min(a[1],b[1])-13);
    const x1=Math.min(w-2,Math.max(a[0],b[0])+13),y1=Math.min(h-2,Math.max(a[1],b[1])+13);
    const width=x1-x0+1,size=width*(y1-y0+1),dist=new Float32Array(size).fill(Infinity),parent=new Int32Array(size).fill(-1);
    const idx=(x,y)=>(y-y0)*width+x-x0, start=idx(...a),goal=idx(...b),queue=[start],inQueue=new Uint8Array(size);
    dist[start]=0;inQueue[start]=1;
    for(let p=0;p<queue.length;p++){
      const i=queue[p],x=x0+i%width,y=y0+Math.floor(i/width);inQueue[i]=0;
      for(const [dx,dy] of [[0,1],[1,0],[0,-1],[-1,0]]){
        const X=x+dx,Y=y+dy;if(X<x0||Y<y0||X>x1||Y>y1||!ok(X,Y))continue;
        const j=idx(X,Y),c=T[Y*w+X],cost=c===5||c===6?6:c===8?2.5:c===4?1.25:1;
        if(dist[i]+cost+.01>=dist[j])continue;dist[j]=dist[i]+cost;parent[j]=i;
        if(!inQueue[j]){queue.push(j);inQueue[j]=1;}
      }
    }
    if(parent[goal]<0)return null;
    const path=[];for(let j=goal;j!==-1;j=parent[j])path.push([x0+j%width,y0+Math.floor(j/width)]);
    return path.reverse();
  }
  for(const [from,to,name,note,bend,prop] of journeys){
    const p=LOCS.find(l=>l.id===from).px.map(a=>a*scale),q=LOCS.find(l=>l.id===to).px.map(a=>a*scale);
    const dx=q[0]-p[0],dy=q[1]-p[1],len=Math.hypot(dx,dy),road=c=>c===8;
    let done=false;
    for(const [u,v] of [[.30,.72],[.12,.43],[.56,.90],[.19,.56],[.42,.80],[.03,.34],[.66,.98]]){
    const a=nearest(p[0]+dx*u,p[1]+dy*u,25,road),b=nearest(p[0]+dx*v,p[1]+dy*v,25,road);
    if(!a||!b||Math.hypot(a[0]-b[0],a[1]-b[1])<6)continue;
    for(const sign of [1,-1,.55,-.55]){
      const mid=nearest((a[0]+b[0])/2-dy/len*bend*sign,(a[1]+b[1])/2+dx/len*bend*sign,9,c=>![5,6,8,10].includes(c));
      if(!mid)continue;
      const first=route(a,mid),last=route(mid,b);if(!first||!last)continue;
      const cells=first.concat(last.slice(1));let opened=0;
      for(const [x,y] of cells)for(const [ax,ay] of [[0,0],[1,0],[0,1]]){
        const X=x+ax,Y=y+ay,i=Y*w+X;
        if(ok(X,Y)&&T[i]!==10&&T[i]!==8){T[i]=8;opened++;}
      }
      if(opened<3)continue;
      const side=nearest(mid[0]+1,mid[1]-2,5,c=>![5,6,8,10].includes(c))||mid;
      stops.push({from,to,name,note,prop,x:side[0]+.5,y:side[1]+.5,trail:cells});done=true;break;
    }
    if(done)break;
    }
  }
  return stops;
}
