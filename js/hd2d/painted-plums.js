// The same painted silhouettes are used by both field renderers. Each curved mesh is rooted at the painted trunk.
export function plumVariant(stamp,scenery,r){
  if(stamp==='plum_w')return 1;
  if(!['plum','t_plum','tree_pink','grove_pink','miniPlum'].includes(stamp)&&!['plum','miniPlum'].includes(scenery))return null;
  return r<.34?3:r<.64?0:r<.92?2:1;
}
let image;
export function plumImage(){
  if(!image){image=new Image();image.src='assets/hd2d/field/painted-plums.webp';}
  return image;
}
export function drawPaintedPlum(ctx,index,x,y,height){
  const im=plumImage();if(!im.naturalWidth)return false;
  const cell=im.width/2,shape=plumShape[index],side=height/shape[1];
  ctx.drawImage(im,index%2*cell,Math.floor(index/2)*cell,cell,cell,x-side*shape[0],y-side*.9883,side,side);return true;
}
const plumShape=[[0.3301,0.9766],[0.4434,0.8105],[0.4941,0.9766],[0.3809,0.9766]];
let cached;
export function lightFloweringPlums(period){
  if(cached)cached.m.emissiveIntensity=({night:.08,evening:.34,morning:.52,day:.77})[period]??.58;
}
function paint(T,texture){
  if(cached?.map===texture)return cached;
  // glTF measures V from the top. Field DataTextures store the bottom scanline first.
  const atlas=texture.clone();atlas.offset.y=1;atlas.repeat.y=-1;atlas.needsUpdate=true;
  const m=new T.MeshLambertMaterial({map:atlas,color:'#fffaf4',side:T.DoubleSide,alphaTest:.35});
  m.emissive.set('#f1e5dd');m.emissiveMap=atlas;m.emissiveIntensity=.7;
  const d=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,map:atlas,alphaTest:.35,side:T.DoubleSide});
  cached={map:texture,m,d};return cached;
}
export function plumInstances(T,map,library,tex,heightAt,hs,zs){
  if(!library||!tex)return;
  const source=[0,1,2,3].map(i=>library.getObjectByName('painted_plum_'+i)),lists=[[],[],[],[]],material=paint(T,tex);
  const dummy=new T.Object3D();
  return {
    add(i,x,y,height,r){if(!source[i])return false;lists[i].push({x,y:heightAt(map,x,y)-.16,z:y*zs,h:height*(.93+r*.12)});return true;},
    finish(group){
      for(const [i,items] of lists.entries()){
        if(!items.length)continue;
        const node=source[i],src=node.isMesh?node:node.children.find(q=>q.isMesh);
        const batch=new T.InstancedMesh(src.geometry,material.m,items.length);
        batch.name='painted-flowering-plum-'+i;batch.customDepthMaterial=material.d;batch.castShadow=batch.receiveShadow=true;
        batch.userData={shared:true,deco:true};let lastYaw=Infinity;
        function orient(yaw){
          if(Math.abs(yaw-lastYaw)<.002)return;
          lastYaw=yaw;
          for(const [j,o] of items.entries()){
            dummy.position.set(o.x,o.y,o.z);dummy.rotation.set(0,yaw,0);
            dummy.scale.set(o.h,o.h*hs,o.h*zs);dummy.updateMatrix();batch.setMatrixAt(j,dummy.matrix.clone().multiply(src.matrixWorld));
          }
          batch.instanceMatrix.needsUpdate=true;
        }
        orient(0);batch.computeBoundingSphere();batch.boundingSphere.radius+=Math.max(...items.map(o=>o.h))*.8;
        const direction=new T.Vector3();
        batch.onBeforeRender=(_renderer,_scene,camera)=>{camera.getWorldDirection(direction);orient(Math.atan2(-direction.x,-direction.z));};
        group.add(batch);
      }
    }
  };
}
