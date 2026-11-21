// Shared Blender meshes for the visible field window. Each species gets a single instanced draw.
const names={pine:'pine',oldpine:'pine',miniFirs:'pine',fir:'fir',snowpine:'fir',riverwillow:'willow',willow:'willow',miniPlum:'plum',plum:'plum',bamboo:'bamboo',canes:'bamboo',miniBamboo:'bamboo',goldtree:'ginkgo',ginkgo:'ginkgo',miniGrove:'camphor',persimmon:'camphor',reedbed:'reed',miniReeds:'reed',ferns:'fern',shrub:'azalea'};
const stamps={tree_dead:'snag',grove_dead:'snag',t_dead:'snag',grove_white:'fir',tree_white:'fir',grove_pink:'plum',tree_pink:'plum',grove_pine:'pine',flower1:'chrysanthemum',flower2:'aster',flower3:'azalea',flower4:'aster',g_yflowers:'chrysanthemum',g_wflowers:'aster',g_fern:'fern',g_tallgrass:'grass',g_reeds:'reed',g_ivy:'fern',g_bush:'azalea'};
Object.assign(stamps,{bush1:'azalea',bush2:'grass',bush3:'azalea',bush4:'fern',fern1:'fern',fern2:'fern',t_shrubs:'azalea'});
const variants=new Set(['pine','fir','willow','bamboo','plum','ginkgo','camphor','snag']);
export const foliageNames=[...variants].flatMap(k=>[k+'0',k+'1']).concat(['fern','reed','azalea','aster','grass','chrysanthemum']);
export function foliageName(stamp,scenery,r){
  const species=stamps[stamp]||names[scenery]||stamps[scenery];if(!species)return;
  return species+(variants.has(species)?r<.5?'0':'1':'');
}
const hash=(x,y)=>{let v=Math.imul(Math.round(x)+31,1103515245)^Math.imul(Math.round(y)+19,16777619);return ((v^(v>>>15))>>>0)/4294967296;};
export function groveBatches(T,map,library,heightAt,hs,zs){
  if(!library)return null;
  const meshes=new Map(),dummy=new T.Object3D();
  return {
    add(stamp,scenery,x,y,height){
      const r=hash(x,y),name=foliageName(stamp,scenery,r);if(!name)return false;
      const node=library.getObjectByName(name),src=node?.isMesh?node:node?.children.find(o=>o.isMesh);if(!src)return false;
      const size=height*(.93+.15*r);dummy.position.set(x,heightAt(map,x,y)-.28,y*zs);
      dummy.rotation.set(0,r*6.283,0);dummy.scale.set(size,size*hs,size*zs);dummy.updateMatrix();
      if(!meshes.has(src))meshes.set(src,[]);
      meshes.get(src).push(dummy.matrix.clone().multiply(src.matrixWorld));return true;
    },
    finish(group){
      for(const [src,matrices] of meshes){
        const mesh=new T.InstancedMesh(src.geometry,src.material,matrices.length);
        matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.computeBoundingSphere();
        mesh.name='grove-'+(src.parent?.name||src.name);mesh.userData={deco:true,shared:true};mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);
      }
    }
  };
}
export const animalSizes={rabbit:7.7,pheasant:9.4,deer:12.7,piglet:9.1,badger:8.6};
const animals=new Map();
export function syncWildlife(group,library,items,heightAt,hs,zs){
  const seen=new Set();if(library)for(const a of items){
    if(a.gone)continue;const src=library.getObjectByName(a.kind);if(!src)continue;
    let body=animals.get(a);
    if(!body){body=src.clone(true);body.name='wild-'+a.kind;body.userData.legs=body.children.filter(c=>/_leg[0-3]$/.test(c.name));animals.set(a,body);group.add(body);}
    seen.add(a);const scale=animalSizes[a.kind],moving=Math.abs(a.vx)+Math.abs(a.vy)>.01;
    const phase=(a.walk||0)*2.4;
    const hop=moving&&a.kind==='rabbit'?Math.max(0,Math.sin(phase))*.13*scale:0;
    body.scale.set(scale,scale*hs,scale*zs);
    if(moving)body.rotation.y=Math.atan2(-a.vy*zs,a.vx);
    body.position.set(a.x,heightAt(a.x,a.y)+hop,a.y*zs);
    for(const leg of body.userData.legs){const i=Number(leg.name.slice(-1));leg.rotation.z=moving?Math.sin(phase+([0,3].includes(i)?0:Math.PI))*(a.kind==='deer'?.42:.30):0;}
  }
  for(const [key,body] of animals)if(!seen.has(key)){group.remove(body);animals.delete(key);}
  return seen;
}
export function timberBridge(library,width,length,hs,zs){
  const source=library?.getObjectByName('jegal_bridge');if(!source)return null;
  const obj=source.clone();obj.name='timber-deck';obj.scale.set(width,width*hs,length/5.6*zs);
  obj.traverse(o=>{o.userData={shared:true,deco:true};if(o.isMesh)o.castShadow=o.receiveShadow=true;});return obj;
}
