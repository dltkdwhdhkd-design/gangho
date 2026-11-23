// Reuse one set of geometry across maps. The field group is hidden in battles.
export function makeDiscoveries(T) {
  const root=new T.Group(), box=new T.BoxGeometry(1,1,1);
  const palette=[0x654128,0xa27145,0x342c25,0xc8a15d,0xbdb19a].map(color=>new T.MeshStandardMaterial({color,roughness:.86}));
  function plank(parent,material,x,y,z,w,h,d) {
    const piece=new T.Mesh(box,palette[material]); piece.scale.set(w,h,d);
    piece.position.set(x,y,z); piece.castShadow=true; piece.receiveShadow=true;
    parent.add(piece); return piece;
  }
  const chests=[],tracks=[];
  function chest(i) {
    if (chests[i]) return chests[i];
    const body=new T.Group(), lid=new T.Group();root.add(body);body.add(lid);
    plank(body,2,0,2,0,9,4.1,5.5);
    for (const x of [-4.5,4.5]) plank(body,0,x,2.2,0,.6,4.4,6);
    for (const z of [-2.8,2.8]) {
      plank(body,1,0,2.2,z,9.4,4.4,.45);
      for (const x of [-3,3]) plank(body,3,x,2.2,z*1.08,.7,4.5,.25);
    }
    lid.position.set(0,4.4,-3);
    plank(lid,0,0,.65,3,10,1.3,6.4);
    for (const x of [-3,3]) plank(lid,3,x,1.4,3,.7,.3,6.4);
    plank(lid,3,0,-.1,6.3,1.1,1.4,.4);
    return chests[i]={body,lid};
  }
  function track(i) {
    if (tracks[i]) return tracks[i];
    const pair=new T.Group();root.add(pair);
    for (const [x,z] of [[-1.4,.7],[1.4,-.7]]) {
      plank(pair,4,x,.14,z,1.3,.25,2.8);plank(pair,4,x,.14,z+2,1,.25,.7);
    }
    return tracks[i]=pair;
  }
  let last;
  return {root, update(spots,height,zScale){
    root.visible=true;
    if (last===spots) return;
    last=spots;let boxes=0,feet=0;
    for (const s of spots || []) {
      let mesh;
      if (s.kind==='find') {
        const c=chest(boxes++);mesh=c.body;c.lid.rotation.x=s.done?-1.35:0;
      } else if (s.kind==='leap' && !s.back) {
        mesh=track(feet++); mesh.rotation.y=Math.atan2(s.to[0]-s.px,s.to[1]-s.py);
      } else continue;
      mesh.position.set(s.px,height(s.px,s.py),s.py*zScale);mesh.visible=true;
    }
    for (let i=boxes;i<chests.length;i++) chests[i].body.visible=false;
    for (let i=feet;i<tracks.length;i++) tracks[i].visible=false;
  }};
}
