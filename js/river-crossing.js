// The old atlas painted one continuous road over both banks of the river below the Zhuge estate.
export const jegalFord = { ax:891.5,ay:653.3,bx:897.2,by:665.2,width:2.7 };
export function onJegalAxis(x,y){
  const b=jegalFord,dx=b.bx-b.ax,dy=b.by-b.ay,length=Math.hypot(dx,dy),ux=dx/length,uy=dy/length;
  const along=(x-b.ax)*ux+(y-b.ay)*uy,side=(x-b.ax)*uy-(y-b.ay)*ux;
  return {t:along/length,side,length,ux,uy,x:b.ax+along*ux,y:b.ay+along*uy};
}
export function layJegalCrossing(terrain,w) {
  const ford=jegalFord;
  const at=(i,j)=>j*w+i;
  for(let j=648;j<=671;j++)for(let i=864;i<=910;i++){
    if(terrain[at(i,j)]===9)terrain[at(i,j)]=2;
  }
  // Two towpaths on the south bank meet the same bridgehead. Leave the riverbed open between them.
  const paths=[[[866,670],[880,669],[890,667],[895,667],[898,667],[902,665],[908,662],[913,664]],
    [[886,648],[888,649],[890,650],[891,652],[892,654]]];
  for(const points of paths)for(let k=1;k<points.length;k++){
    const [a,b]=points[k-1],[c,d]=points[k],n=Math.max(Math.abs(c-a),Math.abs(d-b));
    for(let t=0;t<=n;t++){
      const u=Math.round(a+(c-a)*t/n),v=Math.round(b+(d-b)*t/n);
      for(let j=v-1;j<=v+1;j++)for(let i=u-1;i<=u+1;i++)if(terrain[at(i,j)]!==2&&terrain[at(i,j)]!==1)terrain[at(i,j)]=8;
    }
  }
  for(let j=649;j<670;j++)for(let i=886;i<=901;i++){
    const p=onJegalAxis(i+.5,j+.5);if(Math.abs(p.side)>ford.width/2+.52)continue;
    if(p.t>=0&&p.t<=1)terrain[at(i,j)]=9;
    else if(p.t>-.24&&p.t<1.25)terrain[at(i,j)]=8;
  }
}
export function recoverOldFord(map,px,py,tile){
  const x=px/tile,y=py/tile,b=jegalFord;
  if(x<864||x>910||y<648||y>671||map.g[Math.floor(y)]?.[Math.floor(x)]!==2)return [px,py];
  const p=onJegalAxis(x,y),south=p.t>.5;
  return [(south?b.bx+p.ux:b.ax-p.ux)*tile,(south?b.by+p.uy:b.ay-p.uy)*tile];
}
