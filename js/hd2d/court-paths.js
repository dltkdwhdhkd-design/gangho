// Footpaths from each shop or wing to its actual landing, in tile units.
export function addApproach(map,door,spine){
  const k=map.k,x=(door.x+door.w/2)/16,y=(door.y+door.h)/16;
  const outward=x<spine?1:-1,endY=(18.6+(x<spine?.48:-.32))*k;
  const a=[x,y-.16],b=[x+.18*k*outward,Math.max(y+.65*k,endY+.60*k)],c=[spine-outward*3.0*k,endY-.43*k],d=[spine,endY];
  (map.approaches||=[]).push({a,b,c,d,k});
}
function at(p,t){const q=1-t;return [0,1].map(i=>q*q*q*p.a[i]+3*q*q*t*p.b[i]+3*q*t*t*p.c[i]+t*t*t*p.d[i]);}
export function onApproach(map,x,y){
  return map.approaches?.some(p=>{
    const line=p.samples||=Array.from({length:24},(_,i)=>at(p,i/23)),r=p.k*.53;
    return line.some(([u,v])=>(u-x)**2+(v-y)**2<r*r);
  });
}
export function paintApproaches(ctx,map,tile,images){
  if(!map.approaches)return;
  ctx.save();ctx.scale(tile,tile);ctx.lineCap='round';ctx.lineJoin='round';
  for(const [j,p] of map.approaches.entries()){
    const road=new Path2D();road.moveTo(...p.a);road.bezierCurveTo(...p.b,...p.c,...p.d);
    for(const [width,alpha] of [[1.40,.12],[1.23,.22],[1.03,.36],[.83,.43]]){
      ctx.strokeStyle='#937f59';ctx.globalAlpha=alpha;ctx.lineWidth=width*p.k;ctx.stroke(road);
    }
    const earth=images?.field_road&&ctx.createPattern(images.field_road,'repeat');
    if(earth){earth.setTransform(new DOMMatrix().scale(.011));ctx.strokeStyle=earth;ctx.lineWidth=.88*p.k;ctx.globalAlpha=.42;ctx.stroke(road);}
    const length=Math.hypot(p.d[0]-p.a[0],p.d[1]-p.a[1]),n=Math.max(3,Math.ceil(length/.63));
    for(let i=0;i<n;i++){
      const t=(i+.18)/n;if(t>.42&&(i+2*j)%5!==0)continue;
      const [x,y]=at(p,t),next=at(p,Math.min(1,t+.015));
      const angle=Math.atan2(next[1]-y,next[0]-x),s=Math.sin(i*43.31+j*15.7);
      ctx.save();ctx.translate(x,y);ctx.rotate(angle+s*.17);
      const a=.19+.041*s,b=(.48+.13*Math.cos(i*3.3))*Math.min(1.5,p.k);
      ctx.beginPath();ctx.moveTo(-a,-b*.69);ctx.lineTo(-a*.68,-b);ctx.lineTo(a*.39,-b*.94);ctx.lineTo(a,-b*.64);ctx.lineTo(a*.86,b*.64);ctx.lineTo(a*.49,b);ctx.lineTo(-a*.89,b*.88);ctx.closePath();
      ctx.globalAlpha=.82;ctx.fillStyle=['#87816c','#9c9682','#868674','#aa9b7e'][(i+j)%4];ctx.fill();ctx.lineWidth=.021;ctx.strokeStyle='#534f42';ctx.stroke();
      ctx.clip();const flags=images?.['field_court-flags'];if(flags){ctx.globalAlpha=.32;ctx.drawImage(flags,14+i*11%102,16+j*17%92,58,48,-a,-b,2*a,2*b);}
      ctx.restore();
    }
  }
  ctx.restore();
}
