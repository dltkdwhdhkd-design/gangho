"""Build regional, UV-painted modular buildings for the Gangho field and encounters.
Run Blender in background with --python regional_architecture.py. Coordinates are X east, Y north, Z up.
Each role has a 2 x 1.2 plinth, its front at Y=0, and its own finished roof height.
"""
from pathlib import Path
import math
import sys
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "assets/hd2d/models"
FIELD = ROOT / "assets/hd2d/field"
# Slates, plaster, structural timber, local lacquer, and bright fittings (sRGB).
STYLES = {
    "plum": ("484553", "dfd2c4", "703b35", "ac4447", "e2b77d"),
    "tao": ("376361", "c5cdc0", "534b3c", "4c8d80", "d6b269"),
    "temple": ("ac703a", "c89562", "864637", "a84f34", "e7bd68"),
    "workshop": ("4d5251", "a5afa0", "443e39", "657a62", "b48e5d"),
    "observatory": ("4b6860", "d8d2a8", "574c38", "769384", "e4b65d"),
    "sword": ("485671", "d8d4c4", "49495a", "657da1", "d0b17a"),
    "canal": ("55595c", "e0ddd0", "55463d", "755e55", "b59b74"),
    "fortress": ("685454", "a29886", "593f36", "915845", "b89a69"),
    "capital": ("787254", "cbb79b", "804d3d", "a94837", "d4a95d"),
    "alpine": ("8b9aa0", "aaa9a4", "5c514a", "6b8299", "bdd1ce"),
    "caravan": ("ac7955", "d2ac81", "614b3d", "427e80", "caa057"),
    "bamboo": ("67704b", "c5ba88", "736141", "768a58", "c0a065"),
    "shadow": ("403c4c", "a19898", "483340", "824854", "b29569"),
    "village": ("776a53", "cdc2a0", "6c5442", "937254", "cfb286"),
    "harbor": ("4d6669", "c8c2a3", "59493f", "537e80", "d3a46a"),
    "highland": ("8a624e", "e0c6a3", "634737", "9e5744", "d7ad68"),
}
ROLES = ("hall", "wing", "inn", "home", "cottage", "shop", "gate")
MATS = ("roof", "plaster", "cedar", "slab", "plank", "yard", "sand", "plain", "plain")
def lin(v):
    v = v / 255
    return v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4
def rgb(h):
    return tuple(lin(int(h[i:i+2],16)) for i in (0,2,4))
def knot(v, lo, hi):
    return max(lo,min(v,hi))
def make_paint():
    # Shared luminance treatment keeps every roof/facade in the same painted visual register.
    size=64
    image=bpy.data.images.new("Regional material swatches",size*3,size*3,alpha=False)
    target=[1.]*(size*size*9*4)
    for cell,name in enumerate(MATS):
        if name=="plain":continue
        src=bpy.data.images.load(str(FIELD/(name+".webp")),check_existing=True)
        src.scale(size,size)
        data=list(src.pixels)
        vals=[.30*data[i]+.54*data[i+1]+.16*data[i+2] for i in range(0,len(data),4)]
        mean=sum(vals)/len(vals) or .3
        for y in range(size):
            for x in range(size):
                j=((cell//3*size+y)*size*3+cell%3*size+x)*4
                a=knot(.75*(vals[y*size+x]/mean)**.60,.32,1.)
                target[j:j+3]=[a]*3
    image.pixels[:]=target
    image.pack()
    mat=bpy.data.materials.new("regional_paint")
    mat.use_nodes=True
    tree=mat.node_tree
    tex=tree.nodes.new("ShaderNodeTexImage");tex.image=image
    tree.links.new(tex.outputs["Color"],tree.nodes.get("Principled BSDF").inputs["Base Color"])
    return mat

class Mesh:
    def __init__(self,palette):
        roof,wall,wood,acc,gold=map(rgb,palette)
        self.inks={"tile":(0,roof),"wall":(1,wall),"wood":(2,wood),"rock":(3,rgb("a69f8e")),
            "plank":(4,rgb("94795a")),"brick":(5,rgb("9b8a77")),"clay":(6,wall),
            "accent":(7,acc),"trim":(7,gold),"ink":(7,rgb("433b3b")),
            "paper":(7,rgb("e9c993")),"light":(7,rgb("ebae71")),"leaf":(7,rgb("7f925e"))}
        self.v=[];self.f=[];self.uv=[];self.c=[]
    def face(self,points,key,shade=1):
        start=len(self.v);self.v.extend(points);self.f.append(tuple(range(start,start+len(points))))
        cell,col=self.inks[key]
        coords=[(0,0),(1,0),(1,1),(0,1)] if len(points)==4 else [(.5+.47*math.cos(2*math.pi*i/len(points)),.5+.47*math.sin(2*math.pi*i/len(points))) for i in range(len(points))]
        for u,v in coords:
            self.uv.append(((cell%3+.025+.95*u)/3,(cell//3+.025+.95*v)/3))
            self.c.append(tuple(knot(k*shade,0,1) for k in col)+(1.,))
    def box(self,x,y,z,w,d,h,k,tone=1):
        x0,x1=x-w/2,x+w/2;y0,y1=y-d/2,y+d/2;z1=z+h
        vs=[(x0,y0,z),(x1,y0,z),(x1,y1,z),(x0,y1,z),(x0,y0,z1),(x1,y0,z1),(x1,y1,z1),(x0,y1,z1)]
        for ix,sh in [((0,3,2,1),.69),((0,1,5,4),.95),((1,2,6,5),.90),((2,3,7,6),.86),((3,0,4,7),.92),((4,5,6,7),1.10)]:
            self.face([vs[i] for i in ix],k,sh*tone)
    def beam(self,a,b,r,k,sides=5,r2=None):
        a,b=Vector(a),Vector(b);axis=b-a
        if axis.length<.00001:return
        axis.normalize(); u=axis.cross(Vector((0,0,1)) if abs(axis.z)<.92 else Vector((1,0,0))).normalized()
        v=axis.cross(u);r2=r if r2 is None else r2
        circ=[u*math.cos(i*math.tau/sides)+v*math.sin(i*math.tau/sides) for i in range(sides)]
        p=[a+r*t for t in circ];q=[b+r2*t for t in circ]
        for i in range(sides):
            j=(i+1)%sides;self.face([p[i],p[j],q[j],q[i]],k,.92+.08*(i%3))
        self.face(q,k)
    def finish(self,name,mat):
        me=bpy.data.meshes.new(name+"_mesh");me.from_pydata(self.v,[],self.f);me.update()
        uv=me.uv_layers.new(name="Paint");uv.data.foreach_set("uv",[a for pt in self.uv for a in pt])
        cols=me.color_attributes.new(name="Color",type="BYTE_COLOR",domain="CORNER")
        cols.data.foreach_set("color",[a for pt in self.c for a in pt]);me.color_attributes.active_color=cols
        ob=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(ob);me.materials.append(mat)
        return ob

def post(m,x,y,z,h,weight=.047):
    m.box(x,y,z,weight*2.8,weight*2.8,.07,"rock")
    m.beam((x,y,z+.055),(x,y,z+h),weight,"wood",6,weight*.86)
    m.box(x,y,z+h-.07,weight*2.9,.14,.045,"accent")
    m.box(x,y,z+h-.034,weight*4.0,.17,.035,"wood")

def deck(m,x,y,z,w,d,high=.14):
    m.box(x,y,z,w,d,high*.74,"rock")
    m.box(x,y,z+high*.74,w+.044,d+.044,high*.26,"brick")
    for i in range(3):
        h=high*(3-i)/4
        m.box(x,y-d*.5-.026-i*.055,z,.47+.04*i,.062,h,"rock")
    return z+high

def lattice(m,x,y,z,w,h,door=False):
    m.box(x,y,z,w,.026,h,"ink")
    m.box(x,y-.018,z+.028,w*.85,.020,h*(.88 if not door else .64),"paper" if not door else "plank")
    for i in range(1,4):
        xx=x+w*(i/4-.5)
        m.box(xx,y-.036,z+.013,.010,.014,h-.023,"wood")
    for f in ((.19,.52,.79) if not door else (.39,.68,.89)):
        m.box(x,y-.037,z+h*f,w,.016,.015,"wood")
    if door:m.box(x,y-.049,z+h*.43,.036,.014,.02,"trim")

def facade(m,x,y,z,w,d,h,bays=3,open_shop=False):
    m.box(x,y,z,w,d,h,"wall")
    front=y-d/2
    m.box(x,front-.008,z,w,.044,h*.12,"brick")
    for i in range(bays):
        u=x+w*((i+.5)/bays-.5)
        if i==bays//2 or open_shop:
            lattice(m,u,front-.028,z+.016,w/bays*.74,h*(.82 if not open_shop else .75),i==bays//2 and not open_shop)
        else:lattice(m,u,front-.029,z+h*.27,w/bays*.71,h*.51)
    for i in range(bays+1):
        xx=x+w*(i/bays-.5);m.box(xx,front-.036,z,.045,.052,h,"wood")
    m.box(x,front-.035,z+h-.065,w+.07,.075,.06,"wood")
    for side in (-1,1):
        xx=x+side*w/2
        for f in (-.28,.28):m.box(xx+side*.006,y+d*f,z,.037,.04,h,"wood")
    return front

def roof(m,x,y,z,w,d,rise,up=.12,hip=.20,style="tile"):
    # Four hip faces curve toward swept corners. Raised ribs follow the same sections.
    a,b=w/2,d/2; ridge=max(.06,a*(1-hip))
    def surf(t,v,side):
        drop=(1-v)**1.36
        return (x+t*(a+(ridge-a)*(1-v)),y+side*b*v,z+rise*drop+up*abs(t)**3*(v**1.65)+.026*(t*t)*(1-v))
    count=8 if w>1.15 else 6
    for side in (-1,1):
        for i in range(count):
            t0,t1=-1+2*i/count,-1+2*(i+1)/count
            for j in range(3):
                v0,v1=j/3,(j+1)/3;p=[surf(t0,v0,side),surf(t1,v0,side),surf(t1,v1,side),surf(t0,v1,side)]
                m.face(p if side==1 else p[::-1],style,.91+.09*((i+2*j)%3)/2)
            p,q=surf(t0,1,side),surf(t1,1,side)
            m.beam(p,q,.023,"accent",4)
        for j in range(1,count*2):
            t=-1+j/count
            for v0,v1 in ((0,.47),(.47,1)):
                m.beam(surf(t,v0,side),surf(t,v1,side),.009,"tile",3)
    for side in (-1,1):
        for i in range(3):
            v0,v1=i/3,(i+1)/3
            lo=[surf(side,v0,-1),surf(side,v1,-1),surf(side,v1,1),surf(side,v0,1)]
            m.face(lo if side<0 else lo[::-1],style)
        for sy in (-1,1):
            pts=[surf(side,j/3,sy) for j in range(4)]
            for a0,b0 in zip(pts,pts[1:]):m.beam(a0,b0,.020,"accent",4)
    m.beam((x-ridge-.035,y,z+rise+.021),(x+ridge+.035,y,z+rise+.021),.030,"accent",6)
    for s in (-1,1):
        p=(x+s*ridge,y,z+rise+.035);q=(x+s*(ridge+.053),y,z+rise+.087)
        m.beam(p,q,.027,"trim",5,.012)

def umbrella(m,x,y,z,r,h,n=8):
    top=(x,y,z+h)
    for i in range(n):
        a,b=math.tau*i/n,math.tau*(i+1)/n
        def pt(t,f,z0):return(x+r*f*math.cos(t),y+r*f*math.sin(t),z+z0)
        mid1,mid2=pt(a,.54,h*.31),pt(b,.54,h*.31)
        e1,e2=pt(a,1,.055),pt(b,1,.055)
        m.face([e1,e2,mid2,mid1],"tile");m.face([mid1,mid2,top],"tile",1.08)
        m.beam(e1,e2,.018,"accent",4);m.beam(e1,mid1,.012,"trim",4);m.beam(mid1,top,.013,"trim",4)
    m.beam(top,(x,y,z+h+.12),.028,"trim",6,.006)

def rail(m,x,y,z,w):
    for i in range(6):
        xx=x+w*(i/5-.5);m.box(xx,y,z,.031,.038,.17,"wood")
    for h in (.065,.15):m.box(x,y,z+h,w+.05,.04,.025,"accent")
def lantern(m,x,y,z):
    m.beam((x,y,z-.09),(x,y,z),.006,"ink",4)
    m.beam((x,y,z-.19),(x,y,z-.143),.037,"light",8,.055)
    m.beam((x,y,z-.143),(x,y,z-.09),.055,"light",8,.036)
    m.beam((x,y,z-.22),(x,y,z-.188),.013,"accent",5)
def comb(m,x,y,z,w,d,n=6):
    for s in (-1,1):
        m.box(x,y+s*d*.5,z,w+.07,.09,.092,"brick")
        for j in range(n):m.box(x+w*(j/(n-1)-.5),y+s*d*.5,z+.078,.10,.105,.093,"rock")
    for t in (-1,1):m.box(x+t*w*.5,y,z,.076,d,.095,"rock")
def ring(m,x,y,z,r,tilt=0):
    pts=[(x+r*math.cos(i*math.tau/16),y+r*math.sin(i*math.tau/16)*math.sin(tilt),z+r*math.sin(i*math.tau/16)*math.cos(tilt)) for i in range(17)]
    for a,b in zip(pts,pts[1:]):m.beam(a,b,.012,"trim",4)
def canopy(m,x,y,z,w,d):
    for i in range(7):
        x0=x-w/2+i*w/7;x1=x0+w/7
        p=[(x0,y,z),(x1,y,z),(x1,y-d,z-.11),(x0,y-d,z-.11)]
        c="accent" if i%2==0 else "wall";m.face(p[::-1],c)
        m.face([p[3],p[2],(x1,y-d,z-.155),(x0,y-d,z-.155)],c)
    for a in (-1,1):m.beam((x+a*w*.46,y,z-.25),(x+a*w*.46,y-d,z-.11),.015,"wood",4)

def octagon(m,x,y,z,r,h):
    for i in range(8):
        a=(i+.5)*math.tau/8;b=a+math.tau/8
        p=(x+r*math.cos(a),y+r*math.sin(a),z);q=(x+r*math.cos(b),y+r*math.sin(b),z)
        m.face([p,q,(q[0],q[1],z+h),(p[0],p[1],z+h)],"wall")
        post(m,p[0],p[1],z,h,.036)

def main_landmark(m,style):
    if style=="tao":
        base=deck(m,0,.62,0,1.85,1.00,.17)
        octagon(m,0,.59,base,.74,.65);lattice(m,0,-.104,base+.02,.45,.53,True)
        umbrella(m,0,.59,.81,.99,.39);octagon(m,0,.59,1.10,.33,.23)
        umbrella(m,0,.59,1.33,.51,.29)
        for s in (-1,1):lantern(m,s*.58,.14,.75)
    elif style=="observatory":
        z=deck(m,0,.64,0,1.91,1.00,.23)
        facade(m,-.40,.66,z,.87,.72,.73);roof(m,-.40,.68,.96,1.17,.98,.23,.105)
        octagon(m,-.40,.68,1.12,.28,.23);umbrella(m,-.40,.68,1.34,.40,.26)
        m.box(.50,.63,z,.63,.68,.29,"rock");m.box(.50,.63,z+.29,.75,.78,.061,"plank");rail(m,.50,.259,z+.36,.73)
        m.beam((.50,.63,.57),(.50,.63,.81),.076,"trim",8,.053)
        for tilt in (.13,.93,1.52):ring(m,.50,.63,1.03,.29,tilt)
        m.beam((.22,.63,.76),(.77,.63,1.29),.015,"trim")
    elif style=="workshop":
        z=deck(m,0,.62,0,1.86,.98,.12)
        facade(m,-.13,.81,z,1.38,.55,.64);roof(m,-.13,.80,.77,1.65,.80,.26,.05)
        facade(m,-.66,.38,z,.40,.58,.41,1);roof(m,-.66,.40,.54,.64,.80,.20,.06)
        for i,(xx,yy,h) in enumerate(((.60,.80,1.20),(.79,.58,.99))):
            m.beam((xx,yy,z),(xx,yy,h-.36),.178,"brick",8,.132)
            m.beam((xx,yy,h-.36),(xx,yy,h),.115,"brick",8,.081)
            m.beam((xx,yy,h),(xx,yy,h+.05),.104,"ink",8)
        canopy(m,-.02,.51,.72,.84,.34)
        for i in range(5):
            xx=-.26+i*.13
            m.beam((xx,.20,z),(xx,.20,z+.13),.045,"clay",7,.061)
            m.beam((xx,.20,z+.13),(xx,.20,z+.17),.061,"accent",7,.039)
        for top in (.36,.51):
            m.box(.62,.18,top,.49,.15,.026,"plank")
            for i in range(3):m.beam((.48+i*.13,.18,top+.02),(.48+i*.13,.18,top+.10),.039,"clay",6,.026)
    elif style=="fortress":
        base=deck(m,0,.61,0,1.95,1.06,.17)
        m.box(0,.67,base,1.66,.80,.71,"brick");lattice(m,0,.247,base+.01,.43,.53,True)
        m.box(0,.25,.84,1.72,.14,.11,"rock");comb(m,0,.68,.91,1.78,.90,9)
        for xx in (-.69,.69):
            m.box(xx,.46,base,.36,.63,.91,"rock")
            for b in (-.09,.09):m.box(xx+b,.133,.65,.036,.025,.25,"ink")
            roof(m,xx,.50,1.09,.58,.85,.27,.045)
    elif style=="shadow":
        z=deck(m,0,.64,0,1.90,1.00,.22)
        facade(m,0,.73,z,1.12,.78,.74);roof(m,0,.74,.97,1.59,1.01,.43,.17)
        facade(m,0,.75,1.19,.52,.45,.19,1);roof(m,0,.75,1.39,.85,.72,.26,.16)
        for s in (-1,1):
            x=s*.77
            m.beam((x,.31,z),(x,.31,.95),.083,"wood",6,.057)
            m.beam((x,.31,.94),(x+s*.14,.31,1.15),.054,"trim",5,.009)
            m.face([(x-.069,.29,.89),(x+.069,.29,.89),(x+.069,.29,.40),(x,.29,.46),(x-.069,.29,.40)],"accent")
    elif style=="canal":
        for xx,yy,w,h in ((-.37,.70,1.05,.76),(.50,.52,.66,.57)):
            z=deck(m,xx,yy,0,w,.82,.09);facade(m,xx,yy,z,w-.08,.71,h,3)
            roof(m,xx,yy,h+z,w+.15,.94,.26,.035)
            for side in (-1,1):
                wx=xx+side*(w*.47)
                for j in range(4):
                    ht=z+h+.08+(.10 if j in (1,2) else 0)
                    m.box(wx,yy-.35+j*.21,z,.056,.22,ht-z,"wall");m.box(wx,yy-.35+j*.21,ht,.083,.24,.034,"tile")
        rail(m,.65,.032,.10,.39);lantern(m,-.67,.27,.79)
    elif style=="harbor":
        for x in (-.79,0,.79):
            for y in (.12,.53,1.):post(m,x,y,0,.27,.063)
        m.box(0,.57,.24,1.92,1.08,.07,"plank");facade(m,-.25,.83,.31,1.25,.49,.56,3,True)
        for x in (-.79,0,.79):post(m,x,.17,.31,.58,.049)
        roof(m,-.13,.67,.91,1.76,1.13,.30,.079);canopy(m,-.20,.36,.77,1.17,.39)
        for xx,yy in ((.64,.32),(.74,.60),(.42,.14)):
            m.beam((xx,yy,.31),(xx,yy,.58),.09,"plank",8,.10)
            m.beam((xx,yy,.50),(xx,yy,.523),.105,"ink",8)
        m.beam((.78,.69,.31),(.78,.69,1.37),.033,"wood");m.beam((.78,.69,1.34),(.42,.69,1.34),.02,"wood")
        m.face([(.43,.69,1.31),(.75,.69,1.31),(.75,.69,.91),(.43,.69,1.02)],"accent")
    else:return False
    return True

def build(style,role,mat):
    m=Mesh(STYLES[style]);large=role=="hall";upper=role in ("hall","inn","wing");gate=role=="gate"
    if large and main_landmark(m,style):return m.finish(role,mat)
    if gate:
        solid=style in ("fortress","capital","shadow","caravan","highland","alpine")
        z=.83 if solid else .94
        for side in (-1,1):
            xx=side*.73
            deck(m,xx,.58,0,.55 if solid else .28,.68,.16)
            if solid:
                m.box(xx,.58,.14,.52,.64,z-.14,"clay" if style in ("caravan","highland") else "brick")
                lattice(m,xx,.243,.38,.19,.23)
            else:
                for yy in (.38,.75):post(m,xx,yy,.13,z-.13,.066)
            if style in ("plum","sword","bamboo","shadow"):roof(m,xx,.55,z-.08,.61,.68,.17,.09)
        m.box(0,.56,z,1.95,.44,.16,"wood" if not solid else "wall")
        m.box(0,.317,z+.034,.59,.033,.102,"accent")
        if style in ("caravan","highland"):comb(m,0,.56,z+.16,2.01,.60)
        elif style in ("tao","observatory","temple"): 
            roof(m,0,.56,z+.14,2.21,.90,.23,.14);umbrella(m,0,.56,z+.32,.48,.30,8 if style!="temple" else 6)
        else:roof(m,0,.56,z+.16,2.22,.91,.28,.14 if not solid else .044)
        if style in ("harbor","canal","village"):canopy(m,-.69,.24,z-.05,.52,.30)
        for side in (-1,1):lantern(m,side*.48,.265,z-.012)
        return m.finish(role,mat)

    cottage=role=="cottage"; shop=role=="shop"
    h=(.72 if large else .62 if upper else .55 if not cottage else .44)
    if style in ("caravan","highland"):h*=1.18
    if style=="alpine":h*=.88
    raised=style in ("bamboo","harbor","canal","observatory")
    w=1.68 if not cottage else 1.48;d=.86 if not cottage else .77;y=.63
    plat=.20 if large else .105
    if raised:
        for xx in (-.73,0,.73):
            for yy in (.22,.99):post(m,xx,yy,0,plat+.085,.045)
        m.box(0,.58,plat,1.92,1.12,.055,"plank");base=plat+.055
        if style in ("bamboo","harbor","canal"):rail(m,-.70,.038,base,.45);rail(m,.70,.038,base,.45)
    else:base=deck(m,0,.62,0,1.91,1.03,plat)
    inset=(.12 if style in ("plum","sword","capital") and large else 0)
    if style in ("workshop","caravan","village","harbor") and (large or shop):inset=.20
    center=-inset*.5;bodyw=w-inset
    front=facade(m,center,y,base,bodyw,d,h,5 if large else 3,shop or style=="harbor" and role=="inn")
    z=base+h
    for xx in (-.74,.74):post(m,xx,.09,base,h+.018,.038 if not large else .053)
    m.box(0,.087,z-.025,1.69,.10,.069,"wood")
    if style in ("caravan","highland"):
        m.box(center,y,z,bodyw+.095,d+.095,.075,"plank");comb(m,center,y,z+.063,bodyw+.04,d+.04,7 if large else 5)
        if upper:
            facade(m,-.13,.69,z+.075,1.06,.63,.34);m.box(-.13,.69,z+.405,1.16,.70,.075,"brick")
            if style=="highland":umbrella(m,-.13,.69,z+.49,.40,.23,4)
            else:comb(m,-.13,.69,z+.48,1.10,.64,4)
        if not cottage:canopy(m,-.1,front-.02,z-.028,1.17,.34)
    elif style in ("tao","temple","observatory") and upper:
        roof(m,0,y,z+.032,2.03,1.27,.27,.10)
        mid=z+.23;m.beam((0,y,mid),(0,y,mid+.31),.38,"wall",8,.34)
        for i in range(8):
            a=math.tau*i/8;post(m,.37*math.cos(a),y+.37*math.sin(a),mid,.31,.023)
        umbrella(m,0,y,mid+.32,.63,.31,8 if style!="temple" else 6)
        if style=="temple" and large:umbrella(m,0,y,mid+.56,.35,.20,6)
        if style=="observatory":
            m.box(.65,.32,z+.04,.37,.33,.085,"rock")
            ring(m,.65,.32,z+.32,.21,.25);ring(m,.65,.32,z+.32,.18,1.25)
            m.beam((.65,.32,z+.12),(.65,.32,z+.32),.025,"trim")
    elif style in ("fortress","shadow") and upper:
        comb(m,0,y,z+.015,1.76,.92,8)
        for side in (-1,1):
            xx=side*.66;facade(m,xx,.64,z+.07,.42,.59,.29,1)
            roof(m,xx,.64,z+.36,.71,.81,.24,.055)
        roof(m,0,.67,z+.10,.98,.80,.21,.055)
    elif style=="workshop":
        roof(m,center-.12,.65,z+.02,bodyw-.07,1.17,.27,.038)
        for xx,yy,hh in ((.66,.89,.39),(.83,.72,.26)) if upper or shop else ((.68,.82,.21),):
            m.box(xx,yy,z-.02,.18,.19,hh,"brick");m.box(xx,yy,z+hh-.026,.22,.23,.055,"ink")
        canopy(m,-.39,front-.025,z+.02,.78,.28)
        for j in range(4):
            xx=.41+.10*(j%2);yy=.10+.11*(j//2)
            m.beam((xx,yy,base),(xx,yy,base+.14),.047,"clay",7,.064)
            m.beam((xx,yy,base+.14),(xx,yy,base+.18),.064,"accent",7,.039)
    elif style=="alpine":
        roof(m,0,y,z,1.92,1.25,.60 if upper else .44,.024,.40)
        if upper:
            for xx in (-.50,.50):
                facade(m,xx,.36,z+.12,.28,.22,.20,1);roof(m,xx,.36,z+.32,.49,.54,.20,.018,.48)
        m.box(.61,.89,z+.11,.12,.16,.43,"brick")
    elif style in ("canal","village","harbor","bamboo"):
        if role in ("hall","inn","wing") and style!="bamboo":
            roof(m,0,y,z,2.04,1.24,.23,.054);front2=facade(m,-.08,.70,z+.16,1.29,.67,.35)
            rail(m,-.08,front2-.10,z+.18,1.45);roof(m,-.08,.69,z+.51,1.59,.90,.28,.09)
        else:roof(m,0,y,z,2.05,1.28,.34 if style=="bamboo" else .29,.052)
        if style=="canal":
            for s in (-1,1):
                xx=s*.86
                for j in range(3):
                    ht=z+.13+j*.082;m.box(xx,.30+j*.19,.06,.077,.20,ht-.06,"wall");m.box(xx,.30+j*.19,ht,.11,.22,.047,"tile")
        if style=="harbor":
            m.beam((.77,.27,base),(.77,.27,z+.52),.028,"wood");m.beam((.77,.27,z+.45),(.43,.27,z+.45),.018,"wood")
            m.face([(.44,.269,z+.43),(.74,.269,z+.43),(.74,.269,z+.18),(.44,.269,z+.22)],"accent")
        if style=="bamboo":
            for xx in (-.70,.70):m.beam((xx,.11,base+.04),(-xx,.11,z-.07),.013,"plank",4)
        if shop or role=="inn":canopy(m,-.14,front-.01,z-.036,1.21,.32)
    else:
        roof(m,0,y,z,2.08,1.30,.32 if not upper else .28,.15 if style=="plum" else .095)
        if upper:
            if style=="sword" and large:
                for xx in (-.66,.66):
                    facade(m,xx,.65,z+.12,.43,.54,.24,1);roof(m,xx,.65,z+.36,.74,.83,.22,.12)
            else:
                facade(m,0,.71,z+.18,1.18,.60,.28 if not large else .38)
                if role=="inn" or style=="capital":rail(m,0,.33,z+.19,1.30)
                roof(m,0,.71,z+(.47 if not large else .57),1.50,1.01,.26,.17 if style=="plum" else .105)
        if shop:canopy(m,0,front-.012,z-.04,1.31,.30)
    if style in ("plum","sword","capital","shadow","workshop") and not cottage:
        m.box(center,front-.054,z-.127,.42,.030,.078,"accent")
    if not cottage:
        for side in (-1,1):lantern(m,side*.63,.095,z-.04)
    return m.finish(role,mat)

if __name__=="__main__":
    bpy.ops.wm.read_factory_settings(use_empty=True)
    paint=make_paint()
    chosen=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else list(STYLES)
    for style in chosen:
        made=[build(style,role,paint) for role in ROLES]
        for ob in made:ob.select_set(True)
        bpy.context.view_layer.objects.active=made[0]
        bpy.ops.export_scene.gltf(filepath=str(OUT/("regional_"+style+".glb")),use_selection=True,
            export_format="GLB",export_yup=True,export_vertex_color="ACTIVE",export_image_format="JPEG",
            export_image_quality=85,export_normals=True,export_animations=False)
        for ob in made:
            me=ob.data;bpy.data.objects.remove(ob,do_unlink=True);bpy.data.meshes.remove(me)

