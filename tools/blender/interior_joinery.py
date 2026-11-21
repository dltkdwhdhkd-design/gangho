"""Original Jianghu furniture, in metres; front faces -Y, floor is Z=0.
blender -b --python tools/blender/interior_joinery.py [-- optional-source.blend]
"""
import math
import random
import sys
from pathlib import Path
import bpy
from mathutils import Vector
from math import sin, cos, pi, tau

ROOT=Path(__file__).resolve().parents[2]
ATLAS=ROOT/'assets/hd2d/field/interior-joinery.webp'
COLORS={
 'elm':(0,'f0e1c9'),'edge':(0,'fff3d6'),'panel':(0,'c3a98c'),'dark':(1,'efdabc'),'back':(1,'b29e8e'),
 'wicker':(2,'ebd2aa'),'quilt':(3,'fff9f1'),'linen':(4,'fff9ec'),'bluewhite':(5,'fffcf1'),
 'paper':(6,'fff2d7'),'brass':(7,'fff3c9'),'jade':(8,'d6e9d0'),'white':(9,'ede5cb'),
 'ink':(9,'292c29'),'red':(9,'853e35'),'cord':(9,'aa8b63'),'iron':(9,'657071'),
 'leaf':(9,'839965'),'sage':(9,'c1bb85'),'seed':(9,'ae8253'),'flower':(9,'ccab76'),
 'book':(9,'384b67'),'teal':(9,'526c69'),'wine':(9,'734c4c'),'label':(10,'fff6e4'),
 'screen':(11,'f9f2dd'),'caption':(12,'fff5e3'),'cedar':(13,'fff4da'),'mat':(14,'cdb99c'),'stone':(15,'b9b7a9')}
def linear(i):
 a=i/255;return a/12.92 if a<.04045 else ((a+.055)/1.055)**2.4
INK={k:(cell,tuple(linear(int(h[i:i+2],16)) for i in (0,2,4))) for k,(cell,h) in COLORS.items()}

class Parts:
 def __init__(self):
  self.points=[];self.faces=[];self.uv=[];self.color=[];self.normals=[]
 def face(self,pts,mat,shade=1,uv=None,normals=None):
  p=[tuple(v) for v in pts];n=len(p);start=len(self.points)
  if n<3:return
  normal=(Vector(p[1])-Vector(p[0])).cross(Vector(p[2])-Vector(p[0])).normalized()
  if normal.length<.01:return
  self.points.extend(p);self.faces.append(tuple(range(start,start+n)))
  slot,ink=INK[mat]
  if uv is None:
   # Long grain follows the longest rail in each part. Grains on a post run vertically.
   side=max(range(3),key=lambda i:abs(normal[i]));axes=[i for i in range(3) if i!=side]
   ext=[max(v[a] for v in p)-min(v[a] for v in p) for a in axes]
   if ext[1]>ext[0]*1.3:axes.reverse()
   u,v=axes;U=min(q[u] for q in p);V=min(q[v] for q in p)
   dx=max(.0001,max(q[u] for q in p)-U);dy=max(.0001,max(q[v] for q in p)-V)
   offset=(sum(p[0])*.39)%1
   uw=min(.94,.31+dx*.42);vh=min(.94,.16+dy*.59)
   uv=[(.02+offset*(.95-uw)+(q[u]-U)/dx*uw,.025+((offset*.61)%1)*(.95-vh)+(q[v]-V)/dy*vh) for q in p]
  for i,(u,v) in enumerate(uv):
   self.uv.append(((slot%4+.008+.984*u)/4,(3-slot//4+.008+.984*v)/4))
   self.color.append(tuple(min(1,a*shade) for a in ink)+(1,))
   self.normals.append(tuple(normals[i] if normals else normal))
 def box(self,x,y,z,w,d,h,mat='elm',r=.012):
  r=min(r,w*.20,d*.20,h*.28);a=w/2;b=d/2
  def loop(s,Z):
   A=a-s;B=b-s;c=min(r*.72,A*.33,B*.33)
   return [(x+X,y+Y,z+Z) for X,Y in [(-A+c,-B),(A-c,-B),(A,-B+c),(A,B-c),(A-c,B),(-A+c,B),(-A,B-c),(-A,-B+c)]]
  rings=[loop(r*.43,0),loop(0,r*.52),loop(0,h-r*.67),loop(r*.57,h)]
  self.face(rings[0][::-1],mat,.78)
  for j in range(3):
   for i in range(8):
    k=(i+1)%8;self.face([rings[j][i],rings[j][k],rings[j+1][k],rings[j+1][i]],mat,[.81,1,1.11][j])
  self.face(rings[3],mat,1.04)
 def beam(self,a,b,r,mat='dark',sides=9,end=None):
  a,b=Vector(a),Vector(b);axis=(b-a).normalized()
  if not axis.length:return
  u=axis.cross(Vector((0,0,1)) if abs(axis.z)<.9 else Vector((0,1,0))).normalized();v=axis.cross(u);e=r if end is None else end
  ring=[u*cos(i*tau/sides)+v*sin(i*tau/sides) for i in range(sides)]
  A=[a+r*n for n in ring];B=[b+e*n for n in ring]
  for i in range(sides):
   j=(i+1)%sides;self.face([A[i],A[j],B[j],B[i]],mat,1,normals=[ring[i],ring[j],ring[j],ring[i]])
  self.face(A[::-1],mat,.88);self.face(B,mat)
 def turn(self,x,y,z,profile,mat,sides=20):
  for k,((r,h),(R,H)) in enumerate(zip(profile,profile[1:])):
   slope=-(R-r)/max(.001,H-h) if abs(H-h)>.001 else (4 if R<r else -4)
   for i in range(sides):
    a=i*tau/sides;b=(i+1)*tau/sides
    pts=[(x+r*cos(a),y+r*sin(a),z+h),(x+r*cos(b),y+r*sin(b),z+h),(x+R*cos(b),y+R*sin(b),z+H),(x+R*cos(a),y+R*sin(a),z+H)]
    norm=[Vector((cos(v),sin(v),slope)).normalized() for v in (a,b,b,a)]
    self.face(pts,mat,1,[(i/sides,k/(len(profile)-1)),((i+1)/sides,k/(len(profile)-1)),((i+1)/sides,(k+1)/(len(profile)-1)),(i/sides,(k+1)/(len(profile)-1))],norm)
 def label(self,x,y,z,w,h,i,school=False):
  u=(i%4)/4;v=(3-i//4%4)/4
  # The square cells contain a 38/64-high paper slip surrounded by bleed.
  self.face([(x-w/2,y,z),(x+w/2,y,z),(x+w/2,y,z+h),(x-w/2,y,z+h)],'caption' if school else 'label',
   1,[(u+.014,v+.048),(u+.236,v+.048),(u+.236,v+.202),(u+.014,v+.202)])
 def finish(self,key,material):
  mesh=bpy.data.meshes.new(key+'-joinery');mesh.from_pydata(self.points,[],self.faces);mesh.update()
  uv=mesh.uv_layers.new(name='Workshop');uv.data.foreach_set('uv',[a for p in self.uv for a in p])
  attr=mesh.color_attributes.new(name='Color',type='BYTE_COLOR',domain='CORNER')
  attr.data.foreach_set('color',[a for p in self.color for a in p]);mesh.color_attributes.active_color=attr
  mesh.normals_split_custom_set(self.normals)
  obj=bpy.data.objects.new(key,mesh);bpy.context.collection.objects.link(obj);mesh.materials.append(material);return obj

def curve(m,pts,r,mat):
 for a,b in zip(pts,pts[1:]):m.beam(a,b,r,mat,7)
def handle(m,x,y,z,w=.075):
 for s in (-1,1):m.beam((x+s*w/2,y+.002,z),(x+s*w/2,y-.019,z),.012,'brass',8,.009)
 pts=[(x+w*.5*cos(a*pi/8),y-.020-.009*sin(a*pi/8),z-w*.31*sin(a*pi/8)) for a in range(9)]
 curve(m,pts,.007,'brass')
def legs(m,x,y,z,w,d,h,r=.058):
 for sx in (-1,1):
  for sy in (-1,1):
   X=x+sx*(w/2-r);Y=y+sy*(d/2-r)
   m.box(X,Y,z,r*1.26,r*1.28,.045,'edge')
   m.box(X,Y,z+.036,r*1.11,r*1.11,h-.036,'dark')
   m.box(X,Y,z+h-.097,r*1.44,r*1.40,.080,'elm')
def panel(m,x,y,z,w,h):
 m.box(x,y,z,w,.044,h,'dark')
 m.box(x,y-.019,z+.022,w-.042,.028,h-.045,'edge',.01)
 m.box(x,y-.037,z+.044,w-.083,.014,h-.089,'panel',.005)
def drawer(m,x,y,z,w,h,i,labelled=True):
 m.box(x,y,z,w-.012,.064,h-.014,'dark',.008)
 m.box(x,y-.035,z+.013,w-.027,.027,h-.04,'elm',.009)
 if labelled:
  m.box(x,y-.054,z+h*.46,w*.66,.010,h*.43,'brass',.003)
  m.label(x,y-.060,z+h*.475,w*.60,h*.38,i)
 handle(m,x,y-.056,z+h*.38,min(.085,w*.40))
def jar(m,x,y,z,r,h,kind='bluewhite',lid=True,fabric=False):
 # A foot ring, expanded belly, shoulder, narrow throat and rolled lip remain legible at field scale.
 pr=[(.48,0),(.49,.06),(.67,.095),(.89,.25),(1,.49),(.96,.68),(.76,.81),(.52,.865),(.49,.94),(.56,.951),(.56,.995),(.46,1)]
 m.turn(x,y,z,[(r*a,h*b) for a,b in pr],kind)
 m.turn(x,y,z,[(r*.54,h*.945),(r*.565,h*.958),(r*.562,h*.976)],'book' if kind=='bluewhite' else 'brass',20)
 if lid:
  if fabric:
   m.turn(x,y,z,[(r*.55,h*.92),(r*.62,h*1.012),(r*.48,h*1.04),(r*.03,h*1.055)],'red',14)
   m.turn(x,y,z,[(r*.57,h*.93),(r*.595,h*.95)],'cord',16)
  else:
   m.turn(x,y,z,[(r*.57,h*.981),(r*.62,h*1.016),(r*.50,h*1.05),(r*.20,h*1.07),(r*.11,h*1.11),(r*.15,h*1.14),(r*.01,h*1.17)],kind)
 else:m.turn(x,y,z,[(r*.46,h),(r*.42,h*.89),(r*.01,h*.85)],'ink',16)
def basket(m,x,y,z,r,h,herbs=True):
 m.turn(x,y,z,[(r*.64,0),(r*.77,.025),(r,h*.82),(r*1.03,h),(r*.91,h*1.03),(r*.78,h*.54),(r*.02,h*.40)],'wicker',20)
 m.turn(x,y,z,[(r*.99,h*.86),(r*1.045,h*.93),(r*.993,h*1.03)],'cord')
 if herbs:
  for i in range(14):
   a=i*2.399;b=r*(.20+.51*(i%5)/5);X=x+b*cos(a);Y=y+b*sin(a);H=z+h*.67
   m.beam((X-.033*cos(a),Y-.033*sin(a),H),(X+.052*cos(a),Y+.052*sin(a),H+.018+.007*(i%3)),.010,'sage' if i%3 else 'seed',5,.002)
def books(m,x,y,z,w,d,n=3,color='book'):
 for i in range(n):
  X=x+.021*sin(i*2.7);Y=y+.012*cos(i*3);h=.050+(i%2)*.013
  m.box(X,Y,z,w,d,.009,color);m.box(X,Y,z+.009,w*.978,d*.95,h-.014,'paper',.006)
  m.box(X,Y,z+h-.008,w,d,.012,color)
  for off in (.23,.34):
   m.box(X-w*off,Y-d*.486,z+.004,.008,.014,h,'cord',.002)
  z+=h+.003
def scroll(m,x,y,z,w,r=.035):
 m.beam((x-w/2,y,z+r),(x+w/2,y,z+r),r,'paper',14)
 for side in (-1,1):m.beam((x+side*(w/2-.008),y,z+r),(x+side*(w/2+.020),y,z+r),r*.48,'dark')
 m.beam((x-.012,y,z+r),(x+.012,y,z+r),r*1.04,'wine')
def parcels(m,x,y,z,w=.28,n=2):
 for i in range(n):
  X=x+.024*(i%2);d=w*.59;h=.072
  m.box(X,y,z,w,d,h,'paper',.019)
  m.box(X,y,z+h-.002,.014,d+.002,.007,'cord',.002);m.box(X,y-d*.50,z+.004,.013,.008,h-.004,'cord',.002)
  m.box(X,y,z+h+.003,w,.010,.004,'cord',.001);z+=h+.010
def hanging(m,x,y,z,n=4):
 for j in range(n):
  X=x+(j-(n-1)/2)*.129
  m.beam((X,y,z+.006),(X+.009,y-.009,z-.065),.006,'cord',6)
  for i in range(8):
   a=i*2.39;end=z-.215-.061*(i%3)
   A=(X+.01,y,z-.053);B=(X+.045*cos(a),y+.030*sin(a),end)
   m.beam(A,B,.006,'seed',5,.003)
   for k in (1,2):
    v=Vector(A).lerp(Vector(B),k/2.6);q=v+Vector((cos(a)*.057,sin(a)*.041,-.066))
    m.beam(v,q,.023,'leaf' if i%3 else 'sage',5,.002)
def shelf_frame(m,w,d,h,tiers,back=True):
 legs(m,0,0,0,w,d,.18,.071)
 if back:
  for i in range(5):m.box(w*((i+.5)/5-.5),d*.448,.12,w/5-.005,.039,h-.17,'back')
 for x in (-w/2+.034,w/2-.034):
  for y in (-d/2+.034,d/2-.034):m.box(x,y,.092,.068,.064,h-.115,'dark')
 for i,z in enumerate(tiers):
  m.box(0,0,z-.043,w-.023,d,.043,'elm')
  m.box(0,-d/2-.002,z-.061,w+.008,.037,.039,'edge')
 m.box(0,0,h-.075,w+.035,d+.018,.035,'dark');m.box(0,-.003,h-.041,w+.092,d+.068,.041,'elm')
def medicine(m):
 w=1.60;d=.55;h=1.74
 shelf_frame(m,w,d,h,[.19,.57,1.60])
 for i in (-1,1):
  panel(m,i*.365,-.274,.19,.716,.344);handle(m,i*.075,-.316,.398,.067)
 for j in range(5):
  for i in range(5):
   drawer(m,(i-2)*.289,-.265,.575+j*.204,.286,.202,(4-j)*5+i)
 m.box(0,-.251,1.6,1.52,.09,.094,'dark')
 m.box(0,-.302,1.61,.50,.018,.074,'brass');m.label(0,-.315,1.618,.36,.060,1,True)

def shelving(m,kind):
 herb=kind in ('herb_shelf','herb_drying'); archive=kind in ('bookcase','scroll_press');kitchen=kind in ('crockery','tea_cabinet')
 w=1.80 if kind!='herb_drying' else 1.48;d=.51;h=1.66 if kind!='herb_drying' else 1.49
 tiers=[.17,.55,1.045] if kind!='herb_drying' else [.18,.64,.995]
 shelf_frame(m,w,d,h,tiers,kind!='herb_drying')
 if kind=='herb_shelf':
  for i,(x,r,H,mat) in enumerate([(-.60,.146,.355,'bluewhite'),(-.28,.098,.254,'jade'),(.04,.105,.267,'white'),(.48,.164,.361,'bluewhite')]):jar(m,x,.014,1.045,r,H,mat,True,i==2)
  jar(m,-.54,.015,h,.19,.38,'bluewhite',True);jar(m,-.15,.04,h,.116,.247,'white',True,True);parcels(m,.40,-.01,h,.31,2)
  parcels(m,-.55,-.01,.55,.32,3);basket(m,-.08,.015,.55,.159,.11);basket(m,.39,.015,.55,.187,.145)
  for x in (-.52,.47):jar(m,x,.01,.17,.125,.257,'dark',True,True)
  parcels(m,-.09,0,.17,.29,2)
 elif kind=='herb_drying':
  m.box(.26,.015,.998,.035,.43,.381,'elm');hanging(m,-.16,-.19,h-.066,5)
  jar(m,.47,.013,.995,.104,.248,'jade')
  basket(m,-.34,.01,h,.233,.14);basket(m,.26,.01,h,.184,.11)
  for x in (-.43,-.05,.37):basket(m,x,.01,.64,.142,.106)
  for i in range(2):parcels(m,-.40+i*.73,-.01,.18,.41,3)
 elif archive:
  for j,z in enumerate(tiers):
   if kind=='scroll_press' and j!=1:
    for i in range(4):
     x=-.65+i*.42;scroll(m,x,.014,z,.29,.049);scroll(m,x,.015,z+.092,.24,.044)
   else:
    for i in range(3):
     x=-.58+i*.56;books(m,x,.012,z,.37+.03*((i+j)%2),.26,3+(i+j)%3,['book','teal','wine'][(i+j)%3])
  if kind=='scroll_press':
   for i in range(4):scroll(m,-.53+i*.31,0,h,.25,.052)
  else:books(m,-.53,.036,h,.43,.24,4,'teal')
  m.box(-.31,0,.553,.035,.42,.493,'elm')
  if kind=='bookcase':
   m.box(.554,-.239,1.079,.45,.031,.43,'dark')
   for i in range(5):m.box(.37+i*.085,-.263,1.10,.014,.017,.373,'edge')
   for z in (1.13,1.34):m.box(.55,-.264,z,.412,.014,.019,'elm')
 elif kitchen:
  for i,x in enumerate((-.59,-.21,.22,.61)):jar(m,x,0,1.045,.113,.26 if i%2 else .34,'bluewhite' if i%3 else 'jade',i%3!=0)
  for x in (-.58,.04,.56):
   for i in range(3):
    m.turn(x,.00,.55+i*.034,[(.073,0),(.095,.014),(.147,.068),(.151,.077),(.14,.081),(.078,.018)],'bluewhite')
  basket(m,-.40,.013,.17,.22,.17,False);jar(m,.43,.008,.17,.171,.28,'dark',True,True)
 else:
  for j in (0,1):panel(m,(-1 if j==0 else 1)*w*.235,-.257,.17,w*.455,.34)
  books(m,-.54,.01,.55,.43,.29,3,'teal');parcels(m,.15,.02,.55,.32,3);jar(m,.61,.03,.55,.101,.27,'jade')
  basket(m,-.47,0,1.045,.164,.132);jar(m,.05,.03,1.045,.133,.31,'bluewhite');scroll(m,.54,0,1.045,.36)

def bolster(m,x,y,z,length,r):
 for i,(a,b,R,S) in enumerate([(-.5,-.46,.57,.85),(-.46,-.36,.85,1),(-.36,.35,1,1.03),(.35,.46,1.03,.86),(.46,.5,.86,.58)]):
  m.beam((x,y+a*length,z),(x,y+b*length,z),r*R,'linen',18,r*S)
 for a in (-.40,.40):m.beam((x,y+length*a-.004,z),(x,y+length*a+.004,z),r*.961,'cord',18)
def cloth(m,x,y,z,w,d,mat):
 nx,ny=18,12
 def v(i,j):
  u=i/nx;s=j/ny;X=(u-.5)*w;Y=(s-.5)*d
  side=max(0,(abs(s-.50)-.38)/.12);end=max(0,(u-.88)/.12)
  height=.048+.045*sin(pi*s)+.018*sin(u*17+s*5)+.011*cos(u*31-s*12)
  height-=side**1.5*(.107+.020*cos(u*23));height-=end**1.7*.075
  return (x+X+.011*sin(s*11+u*9),y+Y+.018*sin(u*12)*side,z+height)
 for i in range(nx):
  for j in range(ny):
   uv=[(i/nx,j/ny),((i+1)/nx,j/ny),((i+1)/nx,(j+1)/ny),(i/nx,(j+1)/ny)]
   m.face([v(i,j),v(i+1,j),v(i+1,j+1),v(i,j+1)],mat,1,uv)
 for j in range(ny):m.beam(v(0,j),v(0,j+1),.009,'linen',6)
 for i in range(nx):m.beam(v(i,0),v(i+1,0),.005,'teal',5)
def bed(m,guest=False):
 w=2.00;d=.88;legs(m,0,0,0,w,d,.34,.095)
 m.box(0,0,.221,w-.05,d-.038,.107,'dark');m.box(0,0,.306,w+.042,d+.045,.073,'edge')
 m.box(0,0,.377,w-.080,d-.042,.089,'mat',.032);m.box(0,-.006,.45,w-.099,d-.067,.062,'linen',.024)
 # Pierced headboard and rear gallery with a gently arched arm rail.
 for X in (-.957,.957):
  for Y in (-.371,.37):m.box(X,Y,.32,.065,.068,.299 if X<0 else .208,'dark')
  high=.654 if X<0 else .556
  curve(m,[(X,-.37+i*.074,high+.025*sin(i*pi/10)) for i in range(11)],.029,'elm')
  for i in range(5):m.box(X,-.31+i*.156,.44,.033,.019,high-.445,'panel')
 for i in range(8):m.box(-.80+i*.22,.392,.45,.033,.033,.157,'dark')
 m.box(0,.393,.604,w-.04,.052,.044,'elm')
 bolster(m,-.68,0,.601,.64,.091)
 cloth(m,.33,-.014,.521,1.20,.925,'quilt' if not guest else 'linen')
 cloth(m,-.13,-.016,.551,.22,.918,'quilt' if not guest else 'mat')
def counter(m,clinic=False):
 w=1.88;d=.655;legs(m,0,0,0,w,d,.27,.086)
 m.box(0,0,.12,w-.043,d-.07,.608,'back')
 for i in range(3):panel(m,(i-1)*.585,-d*.46,.16,.553,.414);drawer(m,(i-1)*.585,-d*.448,.587,.55,.142,i,False)
 m.box(0,0,.728,w+.026,d+.024,.053,'dark');m.box(0,-.007,.778,w+.088,d+.076,.055,'edge')
 if clinic:
  # Beam scale, two suspended pans, prescription packets and the medicine mortar.
  m.turn(-.43,.06,.836,[(.137,0),(.139,.027),(.086,.045)],'dark')
  m.beam((-.43,.061,.875),(-.43,.061,1.174),.014,'brass')
  m.beam((-.633,.061,1.155),(-.222,.061,1.177),.012,'brass')
  for xx,hh in ((-.622,1.15),(-.230,1.17)):
   for yy in (-.039,.055):m.beam((xx,.061,hh),(xx,.061+yy,hh-.14),.0039,'cord',5)
   m.turn(xx,.061,hh-.173,[(.014,0),(.044,.011),(.072,.032),(.073,.04),(.024,.015)],'brass')
  parcels(m,.08,.044,.834,.28,1)
  m.turn(.58,-.026,.836,[(.057,0),(.087,.034),(.109,.123),(.094,.145),(.073,.079),(.02,.047)],'stone')
  m.beam((.58,-.026,.907),(.649,-.007,1.047),.017,'cedar',10,.023)
def table(m,w,d,h,kind):
 legs(m,0,0,0,w,d,h-.046,.068 if h>.6 else .047)
 m.box(0,0,h-.109,w-.035,d-.043,.063,'dark')
 m.box(0,0,h-.055,w+.056,d+.046,.055,'elm')
 for sx in (-1,1):
  for sy in (-1,1):
   X=sx*(w/2-.068);Y=sy*(d/2-.065)
   curve(m,[(X,Y,h-.233),(X-sx*.06,Y,h-.218),(X-sx*.125,Y,h-.140),(X-sx*.21,Y,h-.115)],.018,'edge')
 for sy in (-1,1):m.box(0,sy*(d/2-.056),h*.28,w-.12,.025,.028,'dark')
 if kind=='altar':
  for x in (-w*.42,w*.42):m.box(x,0,h,.047,d+.03,.065,'dark');m.box(x,0,h+.058,.062,d+.049,.029,'edge')
def chair(m,stool=False):
 w=.45;d=.42;h=.41;table(m,w,d,h,'seat')
 if stool:return
 for x in (-.17,.17):m.beam((x,.16,h-.08),(x,.21,.90),.023,'dark')
 m.box(0,.178,.466,.194,.039,.31,'panel')
 pts=[(-.28+i*.056,.190+.028*sin(i*pi/10),.86+.057*sin(i*pi/10)) for i in range(11)]
 curve(m,pts,.032,'edge')
 for s in (-1,1):
  curve(m,[(s*.18,-.14,h),(s*.18,-.14,.59),(s*.19,-.05,.628),(s*.20,.14,.648)],.019,'dark')
def screen(m):
 for side in (-1,0,1):
  angle=side*.29;c=cos(angle);s=sin(angle);x=side*.463;y=abs(side)*.059
  def p(u,v,z):return (x+u*c-v*s,y+u*s+v*c,z)
  for X in (-.215,.215):
   m.beam(p(X,0,.03),p(X,0,1.43),.026,'dark',4)
   m.beam(p(X,-.087,.025),p(X,.09,.025),.025,'dark',4)
  for z in (.14,.25,1.32,1.41):m.beam(p(-.225,0,z),p(.225,0,z),.025,'elm',4)
  u=(side+1)/3
  m.face([p(-.204,-.002,.27),p(.204,-.002,.27),p(.204,-.002,1.29),p(-.204,-.002,1.29)],'screen',1,[(u,.01),(u+.325,.01),(u+.325,.99),(u,.99)])
def chest(m):
 w=.91;d=.53;legs(m,0,0,0,w,d,.16,.064);m.box(0,0,.094,w,d,.313,'elm',.025)
 m.box(0,0,.398,w+.035,d+.031,.094,'dark',.026)
 for X in (-.33,.33):
  m.box(X,0,.492,.049,d+.012,.008,'brass');m.box(X,-.27,.17,.049,.018,.29,'brass')
 handle(m,0,-.277,.387,.13)
def rack(m):
 table(m,1.50,.39,.23,'rack')
 for x in (-.68,.68):m.box(x,.055,.18,.064,.065,1.04,'dark')
 for h in (.68,1.14):m.box(0,.05,h,1.48,.090,.066,'elm')
 for i in range(5):
  x=-.48+i*.235
  m.beam((x,-.042,.23),(x+.045,-.042,1.16),.025,'wine' if i%2 else 'teal',8,.025)
  m.box(x+.046,-.042,1.14,.115,.052,.031,'brass');m.beam((x+.046,-.042,1.163),(x+.050,-.042,1.303),.019,'dark')
def frontage(m,kind):
 if kind=='clinic_front':
  table(m,1.12,.42,.61,'stand');basket(m,-.31,-.005,.612,.169,.098)
  m.turn(.085,-.018,.611,[(.068,0),(.085,.029),(.096,.124),(.084,.137),(.060,.075)],'stone')
  jar(m,.37,.041,.611,.099,.177,'jade',False)
  m.beam((-.47,.142,.61),(-.47,.142,1.18),.022,'dark');m.beam((.45,.142,.61),(.45,.142,1.18),.022,'dark')
  m.beam((-.54,.144,1.16),(.52,.144,1.16),.024,'elm');hanging(m,-.09,.132,1.14,5)
 elif kind=='books_front':
  table(m,1.10,.42,.64,'stand');books(m,-.28,0,.641,.40,.26,3);scroll(m,.20,.018,.641,.29,.047);books(m,.39,-.011,.641,.23,.14,1,'wine')
 elif kind=='tea_front':
  table(m,1.02,.44,.50,'stand');jar(m,-.26,.017,.501,.135,.225,'bluewhite',True);basket(m,.23,0,.501,.137,.082)
 else:
  basket(m,-.23,-.031,0,.232,.22);basket(m,.16,.09,0,.198,.197,False);parcels(m,.10,-.22,0,.27,2)
def bowl(m,x,y,z,r,food=False):
 m.turn(x,y,z,[(r*.35,0),(r*.50,.012),(r*.79,r*.24),(r,r*.46),(r*1.02,r*.53),(r*.92,r*.55),(r*.49,r*.16)],'bluewhite')
 if food:
  for i in range(12):
   a=i*2.39;rr=r*(.17+.52*(i%4)/4)
   m.turn(x+rr*cos(a),y+rr*sin(a),z+r*.29,[(.015,0),(.022,.013),(.005,.029)],'linen' if i%3 else 'seed',7)
def tabletop(m,key):
 table(m,1.58,.73,.75,'table');h=.752
 if key=='writing_table':
  m.box(-.23,.008,h,.66,.42,.013,'book');m.box(-.24,-.003,h+.013,.645,.405,.013,'paper')
  for u in range(8):
   for v in range(6-(u+2)%3):m.box(-.48+u*.069,.130-v*.042,h+.026,.014,.015,.0015,'ink',.001)
  m.box(.354,.103,h,.201,.167,.035,'stone');m.box(.354,.108,h+.035,.15,.105,.003,'ink')
  scroll(m,.35,-.083,h,.34,.039);m.beam((.09,.19,h+.034),(.51,.19,h+.03),.009,'elm',8)
 elif key=='meal_table':
  bowl(m,-.50,-.065,h,.132,True);bowl(m,.45,.060,h,.136,True);bowl(m,.01,.024,h,.18,True)
  for x in (-.28,.64):
   for dx in (0,.029):m.beam((x+dx,-.16,h+.01),(x+dx+.031,.107,h+.018),.005,'dark',7)
 elif key=='tea_table':
  m.box(-.39,0,h,.48,.34,.018,'cedar',.020);jar(m,-.446,.019,h+.019,.085,.131,'jade',True)
  for x,y in ((-.24,-.074),(-.31,.079),(.49,.05),(.47,-.105)):bowl(m,x,y,h+.018 if x<0 else h,.045)
  books(m,.45,.045,h,.30,.18,2,'teal')
 elif key=='gaming_table':
  m.box(0,0,h,.93,.53,.010,'mat');m.box(-.39,.02,h+.011,.12,.34,.022,'dark')
  for i,(x,y) in enumerate(((-.21,.04),(-.05,-.047),(.063,.08))):
   m.box(x,y,h+.014,.074,.074,.071,'linen',.010)
   for j in range(i+2):m.box(x-.019+(j%2)*.032,y-.017+(j//2)*.028,h+.085,.009,.009,.002,'red')
  bowl(m,.43,-.02,h,.106);parcels(m,-.58,.013,h,.16,1)
 elif key=='silk_table':
  for i,mat in enumerate(('wine','teal','quilt','linen')):m.beam((-.56+i*.31,-.18,h+.088),(-.56+i*.31,.18,h+.088),.083,mat,18)

def make(key,m):
 if key=='medicine_chest':medicine(m)
 elif key in ('herb_shelf','herb_drying','bookcase','scroll_press','crockery','tea_cabinet','house_cabinet'):shelving(m,key)
 elif key in ('daybed','dorm_bed'):bed(m,key=='dorm_bed')
 elif key in ('counter','dispensing_counter'):counter(m,key=='dispensing_counter')
 elif key in ('writing_table','meal_table','tea_table','gaming_table','silk_table'):tabletop(m,key)
 elif key in ('table','altar','teatable','bench'):table(m,*{'table':(1.58,.73,.75),'altar':(1.93,.64,.87),'teatable':(.66,.52,.48),'bench':(1.53,.31,.43)}[key],key)
 elif key in ('chair','stool'):chair(m,key=='stool')
 elif key=='folding_screen':screen(m)
 elif key=='coffer':chest(m)
 elif key=='display_rack':rack(m)
 else:frontage(m,key)
def main():
 bpy.ops.wm.read_factory_settings(use_empty=True)
 material=bpy.data.materials.new('Hand-finished elm, silk and porcelain');material.use_nodes=True
 nt=material.node_tree;im=bpy.data.images.load(str(ATLAS));im.pack();tex=nt.nodes.new('ShaderNodeTexImage');tex.image=im
 nt.links.new(tex.outputs['Color'],nt.nodes['Principled BSDF'].inputs['Base Color'])
 keys='medicine_chest herb_shelf herb_drying bookcase scroll_press crockery tea_cabinet house_cabinet daybed dorm_bed counter dispensing_counter table altar teatable bench chair stool folding_screen coffer display_rack clinic_front books_front tea_front market_baskets writing_table meal_table tea_table gaming_table silk_table'.split()
 objects=[]
 for key in keys:
  m=Parts();make(key,m);objects.append(m.finish(key,material))
 bpy.ops.export_scene.gltf(filepath=str(ROOT/'assets/hd2d/models/interior_joinery.glb'),export_format='GLB',export_yup=True,export_vertex_color='ACTIVE',export_image_format='JPEG',export_image_quality=90,export_animations=False)
 if '--' in sys.argv:
  vc=nt.nodes.new('ShaderNodeVertexColor');vc.layer_name='Color';mix=nt.nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1
  nt.links.new(tex.outputs[0],mix.inputs[1]);nt.links.new(vc.outputs['Color'],mix.inputs[2]);nt.links.new(mix.outputs[0],nt.nodes['Principled BSDF'].inputs['Base Color'])
  for i,ob in enumerate(objects):ob.location=((i%5)*2.8,(i//5)*2.5,0)
  for area in bpy.context.screen.areas:
   if area.type=='VIEW_3D':area.spaces.active.region_3d.view_distance=15;area.spaces.active.region_3d.view_location=(5.6,5.0,.7);area.spaces.active.shading.color_type='TEXTURE'
  bpy.context.preferences.filepaths.save_version=0
  bpy.ops.wm.save_as_mainfile(filepath=str(Path(sys.argv[sys.argv.index('--')+1]).resolve()),compress=True)
if __name__=='__main__':main()
