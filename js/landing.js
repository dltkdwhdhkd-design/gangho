// Resolve an arrival after the destination's terrain, doors and people are in place.
const steps = [[0,1],[0,-1],[-1,0],[1,0]];
const portalAt = (doors,x,y) => doors.find(d=>x>d.x-1 && x<d.x+d.w+1 && y>d.y-1 && y<d.y+d.h+1);
export function personRadius(map) {
  return map.isoRoom ? Math.min(13,7/(map.isoRoom.a||1)) : 8;
}
export function resolveLanding(field, door) {
  const {m,p,npcs}=field, radius=personRadius(m);
  const fits=(x,y)=>!m.blocked(x,y) && !npcs.some(n=>!(n.hide>0)&&!n.ghost&&Math.hypot(n.x-x,n.y-1-y)<radius+1);
  const clear=(x,y)=>fits(x,y)&&!portalAt(m.portals,x,y);
  function canLeave(x,y) {
    return steps.some(([dx,dy])=>[3,6,9,12].every(d=>clear(x+dx*d,y+dy*d)));
  }
  let x=p.x,y=p.y;
  if(door){x=door.x+door.w/2;y=door.y+door.h+10;}
  if(clear(x,y)&&canLeave(x,y)){p.x=x;p.y=y;return;}
  // Prefer an unobstructed step away from the threshold on its public side.
  const dir=steps[p.dir]||steps[0], side=[dir[1],-dir[0]];
  for(let r=4;r<=120;r+=4){
    for(let along=r;along>=-r;along-=4){
      const across=r-Math.abs(along);
      for(const k of across?[across,-across]:[0]){
        const X=x+dir[0]*along+side[0]*k,Y=y+dir[1]*along+side[1]*k;
        if(door&&Y<=door.y+door.h+2)continue;
        if(clear(X,Y)&&canLeave(X,Y)){p.x=X;p.y=Y;return;}
      }
    }
  }
  [p.x,p.y]=m.freeNear(x,y);
}
