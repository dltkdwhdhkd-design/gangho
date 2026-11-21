"""Make relief meshes from the four original field paintings. Height is one metre before placement.
Run with Blender in background, and optionally pass -- followed by an editable .blend path.
"""
import bpy,sys,math
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2]
bpy.ops.wm.read_factory_settings(use_empty=True)
atlas=bpy.data.images.load(str(ROOT/'assets/hd2d/field/painted-plums.webp'));atlas.pack()
W,H=atlas.size;cell=W//2
pixels=[0.]*(W*H*4);atlas.pixels.foreach_get(pixels)
material=bpy.data.materials.new('Flowering plum • original ink and gouache');material.use_nodes=True
nodes=material.node_tree.nodes;tex=nodes.new('ShaderNodeTexImage');tex.image=atlas
shader=nodes.get('Principled BSDF');material.node_tree.links.new(tex.outputs['Color'],shader.inputs['Base Color']);material.node_tree.links.new(tex.outputs['Alpha'],shader.inputs['Alpha'])
shader.inputs['Roughness'].default_value=.94
trees=[]
for i in range(4):
 x0=i%2*cell;y0=(1-i//2)*cell
 def alpha(x,y):return pixels[((int(y)+y0)*W+int(x)+x0)*4+3]
 # Image rows in Blender start at the bottom. The low centroid locates the trunk, not the centre of its crown.
 foot=[x for x in range(cell) for y in range(6,19,2) if alpha(x,y)>.28];foot.sort()
 pivot=foot[len(foot)//2]/cell
 occupied=[y for y in range(cell) if any(alpha(x,y)>.10 for x in range(0,cell,3))]
 floor=min(occupied)/cell;scale=(max(occupied)-min(occupied)+1)/cell
 res=32;verts=[];faces=[];uv=[];mapping={}
 def vertex(x,y):
  key=(x,y)
  if key not in mapping:
   u=x/res;v=y/res;h=max(0,(v-floor)/scale)
   bulge=max(0,1-((u-.50)*1.74)**2)
   front=math.sin(min(1,h)*math.pi*.90)*(.052+.12*bulge)+.025*h*math.sin(u*13+i)
   mapping[key]=len(verts);verts.append(((u-pivot)/scale,-front,h));uv.append(((i%2+u)/2,(1-i//2+v)/2))
  return mapping[key]
 for y in range(res):
  for x in range(res):
   x1=x*cell//res;y1=y*cell//res;x2=(x+1)*cell//res;y2=(y+1)*cell//res
   if max(alpha(X,Y) for X in range(x1,x2,2) for Y in range(y1,y2,2))<.018:continue
   faces.append((vertex(x,y),vertex(x+1,y),vertex(x+1,y+1),vertex(x,y+1)))
 mesh=bpy.data.meshes.new('Plum relief '+str(i));mesh.from_pydata(verts,[],faces);mesh.update();layer=mesh.uv_layers.new(name='Painted plum atlas')
 for loop in mesh.loops:layer.data[loop.index].uv=uv[loop.vertex_index]
 for poly in mesh.polygons:poly.use_smooth=True
 obj=bpy.data.objects.new('painted_plum_'+str(i),mesh);bpy.context.collection.objects.link(obj);obj.data.materials.append(material);trees.append(obj)
# The game binds its WebP once to the four meshes. The editable Blender file keeps the packed painting.
bpy.ops.export_scene.gltf(filepath=str(ROOT/'assets/hd2d/models/painted_plums.glb'),export_format='GLB',export_materials='PLACEHOLDER',export_texcoords=True,export_animations=False)
if '--' in sys.argv:
 for i,obj in enumerate(trees):obj.location.x=i*1.48
 for area in bpy.context.screen.areas:
  if area.type=='VIEW_3D':
   space=area.spaces.active;space.shading.color_type='TEXTURE';space.region_3d.view_distance=4.3;space.region_3d.view_location=(2.15,0,.49)
   space.region_3d.view_rotation=Vector((0,-1,.18)).to_track_quat('Z','Y')
 bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(Path(sys.argv[sys.argv.index('--')+1]).resolve()),compress=True)
