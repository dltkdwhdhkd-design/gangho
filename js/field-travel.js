import { cover } from './landscape.js';

// Walking follows the same triangles underneath the character and the same open roads used by encounters.
export function terrainPace(field,map,x,y,dx,dy,tile) {
  if(!field)return 1;
  const u=x/tile,v=y/tile,i=field.index(u,v),surface=map.g[Math.floor(v)]?.[Math.floor(u)];
  if(surface===4||surface===3||surface===5)return 1;
  const hill=(field.height(u+dx*.6,v+dy*.6)-field.height(u,v))/(tile*.6);
  const road=Math.max(0,1-field.roads[i]/4);
  const kind=field.material[i];
  const open=kind===cover.snow?.86:kind===cover.sand?.88:kind===cover.forest?.91:1;
  return (open+(1.12-open)*road)*Math.max(.66,Math.min(1.08,1-hill*.28));
}
export function travelLabels(ctx,map,player,project,tile) {
  if(!map.labels)return;
  const atX=player.x/tile,atY=player.y/tile,options=[];
  for(const item of map.labels){
    const dx=item.x-atX,dy=item.y-atY;
    if(Math.abs(dx)>49||Math.abs(dy)>55)continue;
    const [x,y,depth]=project(item.x*tile,item.y*tile,1);
    if(depth>1||depth<0||x<62||x>1218||y<62||y>656||(x>1075&&y<202))continue;
    if(Math.abs(x-640)<28&&Math.abs(y-379)<30)continue;
    const distance=dx*dx+dy*dy;
    options.push({x,y,distance:distance+(item.text==='주막'?800:0),label:item.text});
  }
  options.sort((a,b)=>a.distance-b.distance);
  const placed=[];ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 15px Galmuri14, sans-serif';ctx.lineJoin='round';
  for(const item of options){
    const {x,y,label}=item,w=ctx.measureText(label).width+22;
    if(placed.some(p=>Math.abs(x-p.x)<(w+p.w)/2+8&&Math.abs(y-p.y)<30))continue;
    placed.push({x,y,w});
    const wash=ctx.createLinearGradient(x-w/2,0,x+w/2,0);wash.addColorStop(0,'rgba(23,35,32,0)');wash.addColorStop(.16,'rgba(23,35,32,.79)');wash.addColorStop(.84,'rgba(23,35,32,.79)');wash.addColorStop(1,'rgba(23,35,32,0)');
    ctx.fillStyle=wash;ctx.fillRect(Math.round(x-w/2),Math.round(y-11),w,21);
    ctx.lineWidth=2.5;ctx.strokeStyle='#29352f';ctx.strokeText(label,x,y);ctx.fillStyle='#fff1c7';ctx.fillText(label,x,y);
    ctx.fillStyle='#f1d496';ctx.beginPath();ctx.moveTo(x-2.8,y+12);ctx.lineTo(x+2.8,y+12);ctx.lineTo(x,y+16);ctx.fill();
    if(placed.length===7)break;
  }
  ctx.restore();
}
