import { TS } from './core.js';

// Resolve an arrival after the destination's terrain, doors and people are in place.
export function portalOpen(portal,state) {
  return !portal.when || !!state.flags[portal.when] || !!(portal.world && state.mode==='free');
}
const steps = [[0,1],[0,-1],[-1,0],[1,0]];
const portalAt = (doors,x,y) => doors.find(d=>x>d.x-1 && x<d.x+d.w+1 && y>d.y-1 && y<d.y+d.h+1);
// A furnishing layout must leave a continuous walking route from the player to the door.
export function canReachHouseExit(map,x,y) {
  const door=map.portals.find(q=>q.to==='cheongha');
  if (!door || !Number.isFinite(x) || !Number.isFinite(y) || map.blocked(x,y)) return false;
  const step=4, cols=map.w*TS/step+1, rows=map.h*TS/step+1;
  const seen=new Uint8Array(cols*rows);
  const startX=Math.floor(x/step), startY=Math.floor(y/step);
  const ox=x-startX*step, oy=y-startY*step;
  const queue=[startY*cols+startX];seen[queue[0]]=1;
  for (let i=0;i<queue.length;i++) {
    const cell=queue[i], gx=cell%cols, gy=Math.floor(cell/cols), px=gx*step+ox, py=gy*step+oy;
    if (px>door.x && px<door.x+door.w && py>door.y && py<door.y+door.h) return true;
    for (const [dx,dy] of steps) {
      const nx=gx+dx, ny=gy+dy, next=ny*cols+nx;
      if (nx<0 || nx>=cols || ny<0 || ny>=rows || seen[next]) continue;
      if (map.blocked(px+dx*step,py+dy*step) || map.blocked(px+dx*step/2,py+dy*step/2)) continue;
      seen[next]=1;queue.push(next);
    }
  }
  return false;
}
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
