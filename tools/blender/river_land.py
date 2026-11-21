"""Blender source for the Jianghu groves, herb beds, five native animals and Zhuge river bridge."""
import bpy
import math
import random
import runpy
import sys
from pathlib import Path
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[2]
kit=runpy.run_path(str(Path(__file__).with_name('regional_architecture.py')))
Mesh=kit['Mesh']
TAU=math.tau
rng=random.Random(42117)
paint=None
palette={'bark':('765c45',2),'barkLight':('9d815d',2),'barkDark':('56483d',2),
 'pine':('485e46',7),'pineTip':('78895d',7),'pineShade':('344939',7),'leaf':('778859',7),'leafLight':('a2a56a',7),'shade':('536a4a',7),
 'willow':('97a36c',7),'willowLight':('b9b477',7),'plum':('cb8294',7),'petal':('e9b3ba',7),'bud':('a95868',7),
 'gold':('d4a44c',7),'goldLight':('e5bf6a',7),'snow':('e0ded0',7),'ice':('afbfc0',7),'stem':('76864d',7),'reed':('bb9b6a',7),
 'dun':('a27d58',7),'russet':('a05c38',7),'fur':('88735b',7),'cream':('dccaaa',7),'black':('39352f',7),'grey':('887f70',7),
 'teal':('486c65',7),'copper':('b16a3f',7),'red':('b54c40',7),'slate':('929594',3),'joint':('696e69',3),'cap':('c4c1b1',3)}
foliage_ink={'pine','pineTip','pineShade','leaf','leafLight','shade','willow','willowLight','plum','petal','bud','gold','goldLight','ice','snow','stem','reed'}
def plant_paint(mat):
 # Paint small overlapping leaves on a periodic tile, so crowns keep their leaf scale in close and distant views.
 image=next(n.image for n in mat.node_tree.nodes if n.type=='TEX_IMAGE')
 size=64; total=image.size[0]; pixels=list(image.pixels)
 rand=random.Random(47191)
 canopy=[.78+.045*math.cos(x*TAU/size)*math.sin(y*TAU*2/size) for y in range(size) for x in range(size)]
 for i in range(117):
  x=rand.randrange(size);y=rand.randrange(size);r=rand.uniform(2.2,4.4);slant=rand.uniform(-.7,.7)
  light=rand.uniform(.78,.99);dark=rand.uniform(.59,.74)
  for dy in range(-4,5):
   for dx in range(-6,7):
    u=dx+dy*slant; shape=(u/r)**2+(dy/(r*.65))**2
    if shape>=1:continue
    k=((y+dy)%size)*size+(x+dx)%size
    tone=dark if dy<0 and shape>.32 else light
    canopy[k]=canopy[k]*.19+tone*.81
 for y in range(size):
  for x in range(size):
   j=4*((2*size+y)*total+2*size+x)
   pixels[j:j+3]=[canopy[y*size+x]]*3
 image.pixels[:]=pixels;image.update();image.pack()
 return mat
def mesh():
 m=Mesh(kit['STYLES']['canal'])
 for name,(color,cell) in palette.items():m.inks[name]=(8 if name in foliage_ink else cell,kit['rgb'](color))
 return m
def form(m,center,radii,color,n=8,rings=4,noise=0):
 cx,cy,cz=center;rx,ry,rz=radii;rows=[]
 for j in range(1,rings):
  lat=math.pi*j/rings;row=[]
  for i in range(n):
   a=i*TAU/n+(j%2)*.16;v=1+rng.uniform(-noise,noise)
   row.append((cx+rx*math.sin(lat)*math.cos(a)*v,cy+ry*math.sin(lat)*math.sin(a)*v,cz-rz*math.cos(lat)))
  rows.append(row)
 for i in range(n):
  k=(i+1)%n;m.face([(cx,cy,cz-rz),rows[0][k],rows[0][i]],color,.84)
  for j in range(len(rows)-1):
   a,b=rows[j],rows[j+1];m.face([a[i],a[k],b[k],b[i]],color,.88+.16*j/rings+rng.random()*.12)
  m.face([rows[-1][i],rows[-1][k],(cx,cy,cz+rz)],color,1.08)
def branch(m,a,b,r,tone='bark',tip=.32):
 m.beam(a,b,r,tone,6,r*tip)
def blade(m,a,b,w,color):
 a,b=Vector(a),Vector(b);d=b-a
 v=Vector((-d.y,d.x,0));v.normalize() if v.length else None
 if not v.length:v=Vector((1,0,0))
 v*=w;mid=a.lerp(b,.56);mid.z+=w*.45
 # A folded leaf catches two distinct values in the same light.
 m.face([a,mid-v,b,mid],color,.88);m.face([a,mid,b,mid+v],color,1.06)
def offset(a,r,z,v):return (a[0]+r*math.cos(v),a[1]+r*math.sin(v),a[2]+z)
def crown(m,p,r,h,colors,n=13):
 # Lobed canopy with overlapping, scalloped edges and a raised plane facing the sky.
 c0,c1,c2=colors;cx,cy,cz=p
 points=[(cx+math.cos(i*TAU/n)*r*rng.uniform(.78,1.09),cy+math.sin(i*TAU/n)*r*rng.uniform(.78,1.09),cz+rng.uniform(-.13,.15)*h) for i in range(n)]
 inner=[(cx+(x-cx)*.70,cy+(y-cy)*.70,cz+.50*h+rng.uniform(-.08,.13)*h) for x,y,z in points]
 crest=[(cx+(x-cx)*.33,cy+(y-cy)*.33,cz+.79*h+rng.uniform(-.07,.10)*h) for x,y,z in points]
 apex=(cx+r*.077,cy-r*.042,cz+h*.87)
 for i,a in enumerate(points):
  j=(i+1)%n;b=points[j];m.face([a,b,inner[j],inner[i]],c1,.96+.05*rng.random())
  m.face([inner[i],inner[j],crest[j],crest[i]],c1,1.03)
  m.face([crest[i],crest[j],apex],c2,.99)
  m.face([b,a,(cx,cy,cz-h*.28)],c0,.94)
  q=Vector(a).lerp(Vector(b),.42)
  for k in range(3):
   theta=i*TAU/n+(k-1)*.60
   root=offset(q,r*(.05+k*.025),h*(.08-k*.04),theta)
   mid=offset(root,r*rng.uniform(.10,.24),rng.uniform(-.18,.26)*h,theta)
   blade(m,root,mid,r*(.064 if k!=1 else .084),c1 if k==1 else c2)
   tip=offset(mid,r*.10,-h*.16,theta+.36);blade(m,mid,tip,r*.052,c1)

def tree(kind,variant):
 m=mesh()
 if kind=='bamboo':
  for j in range(9):
   a=j*2.40;r=.29*math.sqrt(j/9);base=(r*math.cos(a),r*math.sin(a),0)
   ht=rng.uniform(.62,1.0);last=base
   for k in range(1,8):
    p=offset(base,(k/7)**1.6*.16,k*ht/7,a)
    branch(m,last,p,.016,'stem',.94);m.beam(p,(p[0],p[1],p[2]+.009),.019,'leafLight',6)
    if k>2:
     end=offset(p,.14,.055,a+k*1.78);branch(m,p,end,.006,'stem')
     for n in range(7):
      az=a+k*1.78+(n-3)*.49
      twig=offset(end,.057,.020,az)
      branch(m,end,twig,.005,'leaf')
      blade(m,twig,offset(twig,rng.uniform(.12,.21),rng.uniform(-.094,.028),az),.021,'leafLight' if n%3==0 else 'leaf')
      blade(m,twig,offset(twig,.118,-.066,az+.68),.017,'shade')
    last=p
  return m
 if kind=='fir':
  branch(m,(0,0,0),(.021,0,.98),.057)
  for j in range(5):
   z=.23+j*.146;r=.33*(1-j*.142)
   for i in range(5):
    a=i*TAU/5+j*.80;p=offset((0,0,z),r*.51,0,a)
    crown(m,p,r*.62,r*.41,('pineShade','pine','ice'),8)
    crown(m,(p[0],p[1],z+r*.13),r*.50,r*.34,('ice','ice','snow'),7)
  return m
 pine=kind=='pine';willow=kind=='willow';plum=kind=='plum'
 spine=[(0,0,0),(.035,-.018,.23),(-.07,.008,.45),(.04,.014,.65),(.08,-.01,.86)]
 if willow:spine=[(0,0,0),(-.055,.01,.24),(-.12,.03,.45),(-.07,.02,.69),(-.01,.03,.86)]
 for i in range(4):branch(m,spine[i],spine[i+1],(.081-i*.016),tip=.77)
 for i in range(5):branch(m,offset((0,0,0),.14,.005,i*TAU/5),spine[1],.027,'barkDark',.65)
 for j in range(12 if not willow else 9):
  origin=spine[1+j%3];a=j*2.4+variant*.29;length=(.37 if pine else .31)*rng.uniform(.72,1.15)*(1-(j%3)*.1)
  elbow=offset(origin,length*.55,rng.uniform(.08,.17),a);p=offset(elbow,length*.52,.03 if pine else .13,a+.22)
  branch(m,origin,elbow,.037*(1-(j%3)*.16));branch(m,elbow,p,.023,tip=.36)
  for k in range(3):
   e=offset(p,.07+.038*k,.025+.016*k,a+(k-1)*1.31);branch(m,p,e,.010)
   if kind=='snag':continue
   if willow:
    crown(m,e,.095,.043,('shade','willow','willowLight'),8)
    for u in range(3):
     start=offset(e,.044,.008,a+u*1.6);v=offset(start,.035,-rng.uniform(.19,.39),a)
     branch(m,start,v,.004,'willow')
     for n in range(6):
      q=Vector(start).lerp(Vector(v),n/6)
      blade(m,q,offset(q,.033,-.065,a+n*2.2),.010,'willowLight' if n%3==0 else 'willow')
   elif plum:
    # Overlapping spray silhouettes keep the blossom visible at the scale of a village gate.
    crown(m,e,.122,.045,('bud','plum','petal'),9)
    for u in range(8):
     q=offset(e,.12*rng.random(),.036*rng.random(),rng.random()*TAU)
     form(m,q,(.034,.034,.025),'petal' if (u+j)%3==0 else 'plum' if u%3 else 'bud',5,3,.22)
   else:
    colors=('pineShade','pine','pineTip') if pine else ('shade','gold','goldLight') if kind=='ginkgo' else ('shade','leaf','leafLight')
    crown(m,e,.14 if pine else .16,.05 if pine else .11,colors,10)
 if kind not in ('willow','plum','snag'):
  crown(m,spine[-1],.13,.07,('pineShade','pine','pineTip') if pine else ('shade','gold','goldLight') if kind=='ginkgo' else ('shade','leaf','leafLight'))
 return m
def herb(kind):
 m=mesh()
 for j in range(14):
  a=j*2.4;r=.27*math.sqrt(j/14);p=(r*math.cos(a),r*math.sin(a),0);h=rng.uniform(.38,1)
  if kind=='fern':
   end=offset(p,h*.67,h*.49,a);branch(m,p,end,.014,'stem')
   for n in range(1,8):
    q=Vector(p).lerp(Vector(end),n/8)
    for side in (-1,1):blade(m,q,offset(q,(1-n/9)*h*.28,.035,a+side*1.22),.032*(1-n/10),'leaf' if n%2 else 'shade')
  elif kind in ('reed','grass'):
   end=offset(p,h*.22,h,a);blade(m,p,end,.022 if kind=='reed' else .045,'stem' if j%2 else 'leafLight')
   if kind=='reed' and j%3:
    branch(m,p,end,.012,'reed');form(m,end,(.025,.024,.107),'reed',6,3)
  else:
   end=offset(p,h*.32,h*.74,a);branch(m,p,end,.014,'stem')
   for n in range(3):
    q=Vector(p).lerp(Vector(end),.28+n*.2);blade(m,q,offset(q,.19,.09,a+n*2),.06,'leaf')
   for k in range(5):
    q=offset(end,.066,.004,k*TAU/5)
    form(m,q,(.052,.049,.028),'petal' if kind=='azalea' else 'snow' if kind=='aster' else 'goldLight',5,3)
   form(m,end,(.033,.033,.032),'gold',6,3)
 return m
def animal(kind):
 # Height and limb proportions differ by species. Every moving limb has a local shoulder/hip pivot.
 w,h,base,coat={'rabbit':(.34,.29,.30,'fur'),'deer':(.33,.36,.81,'dun'),'piglet':(.35,.36,.38,'russet'),'badger':(.31,.26,.29,'grey'),'pheasant':(.22,.24,.41,'copper')}[kind]
 body=mesh();bird=kind=='pheasant';long=.64 if kind=='deer' else .44 if kind=='rabbit' else .48 if bird else .57
 form(body,(0,0,base+h*.29),(long,w,h),coat,12,6,.045)
 head=(long*.89,0,base+h*(1.44 if kind in ('deer','pheasant') else .79))
 if kind=='deer':
  branch(body,(.32,0,base+.1),head,.17,coat,.68)
 headcol='teal' if bird else 'cream' if kind=='badger' else coat
 form(body,head,(long*.39,w*.65,h*.62),headcol,10,5)
 nose=(head[0]+long*.29,0,head[2]-.039)
 form(body,nose,(long*.19,w*.43,h*.33),'gold' if bird else 'fur' if kind=='piglet' else 'cream',8,4)
 if not bird:form(body,(nose[0]+long*.14,0,nose[2]+.012),(.029,w*.18,.028),'black',7,3)
 for side in (-1,1):
  x,y,z=head
  if not bird:
   e=(x-.056,side*w*.33,z+h*.31);end=(x-.16 if kind=='rabbit' else x-.091,side*w*(.62 if kind=='deer' else .46),z+h*(1.87 if kind=='rabbit' else .95 if kind=='deer' else .66))
   blade(body,e,end,.072 if kind=='rabbit' else .054,coat);blade(body,(e[0]+.008,e[1],e[2]),(end[0]+.01,end[1],end[2]-.023),.027,'cream')
  ey=(x+.071,side*w*.54,z+.036)
  if kind=='badger':form(body,(x+.02,side*w*.51,z+.025),(.135,.033,.055),'black',8,4)
  if bird:form(body,(x+.034,side*w*.54,z+.032),(.074,.03,.07),'red',8,4)
  form(body,ey,(.032,.021,.033),'black',6,4)
  form(body,(ey[0]+.008,ey[1]+side*.012,ey[2]+.011),(.009,.009,.009),'snow',5,3)
  if kind=='deer':
   a=(x-.07,side*.08,z+.09);b=(x-.14,side*.16,z+.34);c=(x-.23,side*.20,z+.47)
   branch(body,a,b,.027,'cream');branch(body,b,c,.016,'reed')
   branch(body,b,(x+.015,side*.21,z+.45),.016,'cream')
   for j in range(7):
    form(body,(-.32+(j%4)*.13,side*w*(.88-j//4*.09),base+.17+j//4*.071),(.031,.012,.022),'cream',5,3)
  if kind=='piglet':
   for j in range(4):blade(body,(-.32+j*.16,side*w*.82,base+.22),(-.44+j*.16,side*w*.86,base+.08),.029,'cream')
  if bird:
   form(body,(-.08,side*w*.74,base+.13),(.31,.075,.16),'russet',9,5)
   for j in range(4):blade(body,(.08,side*w*.99,base+.15+j*.018),(-.40,side*w,base+.03+j*.035),.024,'gold')
 if bird:
  for j in range(7):
   y=(j-3)*.036;blade(body,(-.29,y,base+.11),(-1.09+abs(j-3)*.066,y*2,base+.05-abs(y)),.04,'dun' if j%2 else 'barkDark')
 else:form(body,(-long*.96,0,base+h*.38),(.16 if kind=='badger' else .10,.078,.087),'cream' if kind in ('deer','rabbit') else coat,7,4)
 root=bpy.data.objects.new(kind,None);bpy.context.collection.objects.link(root);body.finish(kind+'_body',paint).parent=root
 for i in range(2 if bird else 4):
  hind=i>1;leg=mesh();x=(-.56 if hind else .57)*long if not bird else 0
  y=(-1 if i%2 else 1)*w*.56
  k=(-.12 if hind else .05,0,-base*.52);foot=(.025 if not hind else -.035,0,-base+.015)
  branch(leg,(0,0,0),k,.032 if bird else .064,coat,.72);branch(leg,k,foot,.022 if bird else .038,'reed' if bird else 'fur',.60)
  form(leg,(foot[0]+.038,0,foot[2]+.018),(.123 if kind=='rabbit' and hind else .07,.034,.025),'black' if kind=='deer' else 'reed' if bird else coat,6,3)
  ob=leg.finish(kind+'_leg'+str(i),paint);ob.parent=root;ob.location=(x,y,base)
 return root
def bridge():
 # Two timber bents carry three short spans. The stone approaches remain flush with the towpath.
 m=mesh(); length=5.6; count=41
 def level(y):return .15*math.sin(math.pi*(y/length+.5))**2
 def pt(x,y,h):return (x,y,level(y)+h)
 for y in (-length/2+.058,length/2-.058):
  m.box(0,y,-.24,1.022,.195,.18,'joint')
  m.box(0,y,-.071,1.067,.22,.058,'slate')
 for y in (-length/6,length/6):
  for side in (-1,1):
   x=side*.385
   m.beam((x,y,-.59),(x,y,level(y)-.106),.058,'barkDark',8,.052)
   m.beam((x,y,-.10),(x,y,-.05),.060,'teal',8)
   for sign in (-1,1):
    m.beam((x,y,level(y)-.31),pt(x,y+sign*.32,-.103),.037,'bark',4)
  m.box(0,y,level(y)-.157,1.04,.13,.087,'barkDark')
  m.beam((-.385,y,-.35),(.385,y,level(y)-.16),.028,'bark',4)
 for i in range(12):
  a=length*(i/12-.5);b=length*((i+1)/12-.5)
  for x in (-.447,0,.447):
   m.beam(pt(x,a,-.076),pt(x,b,-.076),.057,'barkDark',4)
 for j in range(count):
  a=length*(j/count-.5);b=length*((j+1)/count-.5)-.0034
  A=level(a);B=level(b);edge=.503+.006*math.sin(j*2.1)
  # Sawn edges and tight joints. Longer planks run across the walk.
  corners=[(-edge,a,A),(edge,a,A),(edge,b,B),(-edge,b,B)]
  m.face(corners,'plank',.96+.035*math.sin(j*1.73)+(.043 if j%7==1 else 0))
  for k in range(4):
   p,q=corners[k],corners[(k+1)%4]
   m.face([p,(p[0],p[1],p[2]-.037),(q[0],q[1],q[2]-.037),q],'bark',.86)
  if j%3==1:
   for x in (-.421,.421):m.box(x,(a+b)/2,(A+B)/2+.0008,.019,.011,.002,'barkDark')
 for side in (-1,1):
  x=side*.465
  for i in range(10):
   y=(i/9-.5)*(length-.045);z=level(y)
   m.box(x,y,z-.066,.062,.067,.279,'bark')
   m.box(x,y,z+.209,.073,.077,.020,'barkLight',.90)
   m.beam((x,y,z+.227),(x,y,z+.243),.043,'bark',4,.028)
   if i<9:
    Y=((i+1)/9-.5)*(length-.045)
    for h,r in ((.099,.018),(.184,.026)):
     m.beam(pt(x,y,h),pt(x,Y,h),r,'bark' if h>.1 else 'barkDark',4)
 return m

def make_obj(name,m):
 ob=m.finish(name,paint)
 if name.rstrip('01') in ('pine','fir','willow','plum','ginkgo','camphor'):
  # The painted leaf clusters share their shading across contact edges even though the UV islands are separate.
  data=ob.data;normals={};loops=[];saved=[]
  for poly in data.polygons:
   normal=poly.normal.copy()
   for loop_id in poly.loop_indices:
    index=data.loops[loop_id].vertex_index
    position=data.vertices[index].co
    key=(round(position.x,5),round(position.y,5),round(position.z,5))
    if key not in normals:normals[key]=Vector((0,0,0))
    normals[key]+=normal;loops.append(key);saved.append(normal)
   poly.use_smooth=True
  data.normals_split_custom_set([(normals[k].normalized()*.85+n*.15).normalized() for k,n in zip(loops,saved)])
 return ob
def main():
 global paint
 bpy.ops.wm.read_factory_settings(use_empty=True);paint=plant_paint(kit['make_paint']())
 roots=[]
 for i,kind in enumerate(('pine','fir','willow','bamboo','plum','ginkgo','camphor','snag')):
  for v in range(2):
   rng.seed(417+i*19+v);roots.append(make_obj(kind+str(v),tree(kind,v)))
 for i,k in enumerate(('fern','reed','azalea','aster','grass','chrysanthemum')):
  rng.seed(813+i);roots.append(make_obj(k,herb(k)))
 for k in ('rabbit','deer','pheasant','badger','piglet'):roots.append(animal(k))
 roots.append(make_obj('jegal_bridge',bridge()))
 bpy.ops.export_scene.gltf(filepath=str(ROOT/'assets/hd2d/models/river_land.glb'),export_format='GLB',export_yup=True,export_vertex_color='ACTIVE',export_animations=False,export_image_format='JPEG',export_image_quality=82)
 args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
 if args:
  bpy.context.preferences.filepaths.save_version=0
  for i,ob in enumerate(roots):ob.location=((i%7)*2.35,(i//7)*2.65,0)
  bpy.context.scene.render.engine='BLENDER_EEVEE'
  for area in bpy.context.screen.areas:
   if area.type=='VIEW_3D':
    area.spaces.active.region_3d.view_distance=14;area.spaces.active.region_3d.view_location=(6,4,0);area.spaces.active.shading.color_type='VERTEX'
  bpy.ops.wm.save_as_mainfile(filepath=str(Path(args[0]).resolve()),compress=True)
if __name__=='__main__':main()
