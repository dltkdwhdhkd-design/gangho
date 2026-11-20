"""Draw the field actors at native resolution. All coordinates are final game pixels."""
from pathlib import Path
import json
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'assets/hd2d/field'
INK = '#28232b'
SKIES = {'pale':'e5bda5', 'warm':'dba980', 'tan':'bd896a', 'deep':'966850', 'bone':'cfc4ae', 'moss':'9eaa72'}
CLOTH = {'ink':'3e3948','coal':'494750','navy':'46556c','teal':'43746d','jade':'719278','moss':'797c56','red':'9c4652','wine':'703b50','plum':'79586f','cream':'ded1b6','white':'e2ded0','slate':'798793','earth':'967257','umber':'695348','sand':'c2a471','gold':'bb8d49','blue':'6786aa','blush':'c1838d','violet':'847a9c','ice':'b1c6d4'}
HAIR = {'black':'37303b','blueblack':'323a49','greenblack':'303d3b','umber':'544036','brown':'735247','auburn':'794943','plum':'544450','silver':'a8a29d','white':'c8c1b1','grey':'817d77','gold':'a2875d','red':'8a4a46'}
EYES = {'ink':'4a3c40','blue':'4b6782','teal':'557568','lilac':'997b9c','rose':'aa536b','green':'667c64','brown':'735044','gold':'957a4b'}
def ramp(rgb):
    c=[int(rgb[i:i+2],16) for i in (0,2,4)]
    return [tuple(round(x*(1-t)+z*t) for x,z in zip(c,end)) for t,end in [
        (.66,(27,23,32)),(.40,(32,29,40)),(.17,(45,39,44)),(0,c),
        (.26,(238,221,190)),(.52,(250,239,211))]]

class Figure:
    """Lay out a fresh three-head figure on the pixel grid, planted at y=53."""
    widths={'small':.94,'slim':.90,'regular':1,'broad':1.14,'heavy':1.32}
    def __init__(self,person):
        self.head,self.build=person[11:13]
    def point(self,x,y):
        band,in_band=divmod(y-6,16)
        Y=54-3*self.head+band*self.head+round(in_band*(self.head-1)/15)
        body=max(0,min(1,(y-20)/6))
        width=self.head/16*(1+(self.widths[self.build]-1)*body)
        return round(27.5+(x-27.5)*width),Y
    def stroke(self,width):
        return max(1,round(width*self.head/16))

def draw_actor(person,direction,phase,pose=None):
    _,style,hair,hue,coat,trim,skin,eyes,mood,beard,accessory=person[:11]
    figure=Figure(person)
    H,C,T,S=map(ramp,(HAIR[hue],CLOTH[coat],CLOTH[trim],SKIES[skin]))
    E='#'+EYES[eyes]
    # The action cell has transparent margins for an extended hand or airborne head.
    ox,oy=(12,8) if pose else (0,0)
    im=Image.new('RGBA',(56+2*ox,56+2*oy));g=ImageDraw.Draw(im)
    side=direction>=2;rear=direction==1;right=direction==3
    swing=(0,1,0,-1)[phase]
    # The two supporting soles always land on y=53. Arms and skirt have their own walk poses.
    def local(x,y):
        px,py=figure.point(x,y)
        return px+ox,py+oy
    def joint(x,y):
        if not pose:return local(x,y)
        # Head, neck and torso move as a unit. Lower cloth follows the planted hips.
        follow=max(0,min(1,(51-y)/20))
        return local(x+round(pose.lean*follow),y+round(pose.drop*follow))
    def coords(points,dx=0,dy=0):
        xy=[joint(x+dx,y+dy) for x,y in points]
        return [(55-x if right else x,y) for x,y in xy]
    def poly(c,points,dx=0,dy=0):g.polygon(coords(points,dx,dy),fill=c)
    def line(c,points,dx=0,dy=0):g.line(coords(points,dx,dy),fill=c)
    def dot(c,x,y):g.point(coords([(x,y)])[0],fill=c)
    def rect(c,x0,y0,x1,y1):
        a,b=coords([(x0,y0),(x1,y1)]);g.rectangle((min(a[0],b[0]),a[1],max(a[0],b[0]),b[1]),fill=c)
    long=hair in ('loose','middle','bang','flow','pony','band','mane','braid','veil')
    robe=style in ('robe','scholar','doctor','elder','silk','official','monk','priest')
    armor=style in ('armor','guard','general')
    boots=ramp('564b48');gold=ramp('b49962')

    # The hair behind the shoulders must read in all four directions.
    if long:
        tail=3 if hair in ('flow','loose','middle','mane') else 0
        poly(H[0],[(25,12),(33,11),(35,16),(34,24),(36+tail,29),(34,29),(36,33),(32,31),(30,36),(26,31),(21-tail,32),(23,24),(22,19)])
        poly(H[2],[(29,14),(33,14),(32,22),(34,28),(30,31),(30,26),(26,29),(27,20)])
        line(H[4],[(31,17),(30,23),(31,26)])
        if side and hair in ('loose','middle','flow','mane','pony'):
            sway=-swing if not pose else (-3 if pose.lean<0 else 1)
            poly(H[0],[(30,13),(34,13),(35,19),(35,23),(39-sway,27),(37-sway,28),(40-sway,30),(36,29),(32,27),(31,24)])
            poly(H[2],[(32,15),(34,17),(34,22),(36,25),(38-sway,28),(35,27),(32,23)])
            line(H[4],[(33,18),(33,22),(35,25)])

    # Boots, cloth gaiters and legs have independent pixel silhouettes in each pose.
    if pose:
        for i,(knee,ankle) in enumerate(pose.legs):
            hip=joint(26+i*4,35)
            knee=local(*knee);ankle=local(*ankle)
            chain=[hip,knee,ankle]
            g.line(chain,fill=INK,width=figure.stroke(6),joint='curve')
            g.line(chain,fill=C[1+i],width=figure.stroke(4),joint='curve')
            g.line([hip,knee],fill=C[2+i],width=figure.stroke(4))
            g.line([(knee[0]-1,knee[1]-1),(knee[0]+1,knee[1])],fill=C[4])
            shin=((knee[0]+ankle[0])//2,(knee[1]+ankle[1])//2)
            g.line([shin,ankle],fill=boots[2],width=figure.stroke(4))
            g.line([(shin[0]-1,shin[1]),(shin[0]+1,shin[1]-1)],fill=boots[4])
            x,y=ankle
            g.polygon([(x-2,y-5),(x+2,y-4),(x+2,y+1),(x-5,y+1),(x-5,y),(x-2,y-2)],fill=INK)
            g.line([(x-2,y-4),(x+1,y-3)],fill=boots[4])
            g.line([(x-4,y),(x,y-1)],fill=boots[3])
    for index in ([] if pose else ((1,0) if side else (0,1))):
        center=(26 if index==0 else 30) if side else (24 if index==0 else 31)
        dx=(swing*(3 if index==0 else -3)) if side else 0
        lift=(2 if swing==(1 if index==0 else -1) else 0)
        foot=53-lift;center+=dx
        poly(INK,[(center-3,39),(center+3,39),(center+2,48),(center+2,foot),(center-3,foot),(center-4,foot-1),(center-3,foot-3)])
        poly(C[1],[(center-2,39),(center+2,39),(center+1,46),(center-2,47)])
        rect(boots[1],center-2,47-lift,center+1,foot-1)
        for y in (47,49):line(boots[4],[(center-2,y-lift),(center,y+1-lift)])
        line(boots[3],[(center-3,foot-1),(center,foot-1)])
        if side:rect(boots[1],center-4,foot-1,center-2,foot)

    # Hem and the back panel retain the material's native clusters at every size.
    hem=48 if robe else 42 if armor else 45
    if side:
        poly(INK,[(23,30),(31,31),(34,hem-1),(32,hem),(29,hem-2),(25,hem+1),(21,hem),(22,39)])
        poly(C[2],[(24,32),(30,32),(32,hem-2),(29,hem-3),(26,hem-1),(23,hem-1)])
        poly(C[3],[(24,33),(27,33),(26,hem-3),(23,hem-2)])
        line(C[4],[(25,36),(25,41),(23,hem-3)])
    else:
        poly(INK,[(22,31),(33,31),(34,39),(37,hem-1),(33,hem),(30,hem-1),(27,hem+1),(23,hem),(19,hem-1),(21,39)])
        poly(C[2],[(22,33),(32,32),(33,39),(35,hem-2),(30,hem-2),(26,hem),(20,hem-2)])
        poly(C[3],[(23,33),(29,33),(27,40),(26,hem-1),(21,hem-3)])
        poly(C[4],[(24,35),(26,35),(23,hem-4),(22,hem-4)])
        line(C[1],[(29,36),(30,41),(29,hem-2)])
        if robe or style in ('disciple','hero'):line(T[3],[(21,hem-3),(25,hem-1),(29,hem-2),(34,hem-2)])
    if style in ('beggar','worker','fur'):poly(T[2],[(22,39),(25,38),(26,41),(24,43),(21,42)])
    if armor:
        for y in (36,39,42):
            line(T[2],[(23,y),(27,y+1),(32,y)])
            for x in (24,27,30):dot(T[4],x,y)

    # Shoulder line and waist position are shared by every body and every costume.
    left,rightEdge=(22,33) if side else (19,36)
    poly(INK,[(25,21),(30,21),(rightEdge,24),(rightEdge-2,30),(32,34),(23,34),(21,29),(left,25)])
    poly(C[2],[(25,22),(30,22),(rightEdge-1,25),(32,31),(31,33),(23,33),(22,28),(left+1,25)])
    poly(C[3],[(25,22),(28,24),(26,29),(23,31),(left+1,25)])
    if rear:
        line(C[4],[(22,25),(27,24),(32,25)]);line(C[1],[(27,25),(28,29),(27,32)])
    else:
        poly(T[3],[(24,21),(27,22),(31,23),(29,26),(24,32),(22,32),(26,26)])
        line(T[5],[(29,23),(28,26),(24,30)])
        line(C[0],[(24,23),(26,25)])
        if style in ('disciple','hero','priest'):
            for x,y in [(31,25),(30,26),(32,26),(31,27)]:dot(T[4],x,y)
            dot(T[2],31,26)
        if armor:
            poly(T[1],[(23,25),(26,27),(32,24),(32,28),(27,31),(23,29)])
            for y in (26,28):
                for x in (24,27,30):line(T[4],[(x,y),(x+1,y)])
        if style=='fur':
            for x,y in [(22,24),(24,25),(25,23),(31,24),(32,25),(33,23)]:dot(C[0],x,y)
    rect(T[0],23,32,32,34);line(T[3],[(23,32),(27,33),(32,32)])
    if not rear:
        rect(gold[2],28,32,30,34);dot(gold[5],29,32)
        line(T[4],[(29,35),(30,37),(29,39)])
    if accessory in ('sword','pin','band','medal') and not rear:
        line(INK,[(31,35),(33,40),(35,45)]);line(T[1],[(32,35),(34,40),(35,43)]);line(gold[4],[(30,35),(33,34)])
    if accessory in ('pouch','book','medicine','gourd'):
        poly(T[0],[(30,33),(34,33),(35,37),(33,39),(30,38)])
        rect(T[3],31,34,33,37);dot(gold[4],32,34)
    # Sleeves are outlined from the same shoulder/elbow/wrist joints.
    for arm in ([] if pose else ([1] if side else [0,1])):
        x=(28 if side else (21 if arm==0 else 34))
        lift=swing*(1 if arm==0 else -1);dx=(swing if side else 0)
        w=3 if style in ('silk','scholar','elder','monk','robe') else 2
        poly(INK,[(x-1,23),(x+1,24),(x+2,28),(x+w+dx,33+lift),(x+1+dx,36+lift),(x-2+dx,35+lift),(x-w,31),(x-2,27)])
        poly(C[2],[(x-1,24),(x+1,25),(x+1,29),(x+w-1+dx,33+lift),(x-1+dx,34+lift),(x-w+1,30)])
        line(C[4] if arm==0 or side else C[3],[(x-1,25),(x-1,28),(x,30)])
        line(T[3],[(x-2+dx,33+lift),(x+1+dx,34+lift)])
        rect(S[2],x-1+dx,35+lift,x+1+dx,37+lift);dot(S[4],x-1+dx,35+lift)
        if armor:line(T[4],[(x-2,25),(x,24),(x+2,26)])
    if accessory=='staff' and not pose:
        line(boots[0],[(37,20),(36,50)]);line(gold[3],[(37,21),(37,30)]);dot(gold[5],37,19)
    rect(S[1],25,19,29,22);line(S[3],[(26,21),(28,21)])

    # The skull spans 14 pixels. Eye line is 15 and chin is 21, in all views and ages.
    skull=[(24,6),(30,6),(33,8),(35,11),(35,16),(33,19),(30,21),(26,21),(23,19),(21,16),(21,10)]
    if side:skull=[(25,6),(30,6),(33,8),(34,12),(33,17),(30,20),(26,21),(24,20),(23,18),(21,17),(20,16),(22,14),(22,10)]
    poly(INK,skull)
    poly(H[2] if rear and hair!='bald' else S[3],[(25,7),(30,7),(33,9),(34,12),(33,17),(30,20),(26,20),(23,17),(22,13),(23,9)])
    if rear and hair!='bald':
        poly(H[3],[(24,8),(29,7),(32,9),(33,12),(29,17),(25,17),(22,14)])
        line(H[4],[(24,9),(27,8),(30,9)]);line(H[1],[(32,11),(31,16),(28,19)])
    else:
        poly(S[2],[(31,9),(33,10),(34,13),(33,17),(30,20),(27,20),(28,18),(31,17)])
        poly(S[4],[(24,10),(28,9),(30,11),(29,14),(26,16),(23,15)])
        if side:line(S[4],[(24,15),(21,16),(23,16)])
        else:dot(S[1],28,17);dot(S[5],27,16)
        if not rear:
            for ex in ([24] if side else [24,30]):
                by=13 if mood in ('stern','sharp','cool') else 12
                line(H[1],[(ex-1,by),(ex+1,by+(1 if mood=='stern' else 0))])
                line(INK,[(ex-1,15),(ex+1,14 if mood in ('sharp','cool') else 15)])
                if mood!='gentle':dot(E,ex,16);dot(S[5],ex-1,16)
            line(S[1],[(24 if side else 26,19),(26 if side else 28,18 if mood in ('smile','impish') else 19)])
            if mood=='age':dot(S[1],23,17);dot(S[1],32,17)
    if hair!='bald':
        poly(H[1],[(22,11),(23,8),(25,6),(30,6),(33,8),(35,11),(34,14),(32,12),(30,11),(26,10),(24,12),(22,15)])
        poly(H[3],[(23,10),(25,7),(29,7),(31,8),(28,8),(25,10),(24,12)])
        line(H[4],[(25,8),(27,7),(29,7)])
        if hair in ('loose','middle','flow','mane','band','veil'):
            line(H[0],[(27,8),(25,10),(23,13),(22,19),(20,23)])
            line(H[3],[(24,11),(22,15),(22,19)])
            line(H[1],[(29,8),(32,11),(33,15),(34,20),(33,23)])
            if hair=='mane':
                for x,y in [(21,12),(34,12),(20,17),(35,17)]:poly(H[2],[(x,y-2),(x+2,y+1),(x-1,y+6),(x-1,y+2)])
        if hair in ('bang','short','pony','braid','curl','twins'):
            poly(H[2],[(23,9),(30,8),(32,10),(29,12),(27,15 if hair=='bang' else 12),(27,11),(24,13),(24,11),(22,13)])
        if hair=='curl':
            for x,y in [(21,10),(23,8),(26,7),(30,7),(33,9),(34,11)]:rect(H[2],x,y,x+2,y+2);dot(H[4],x,y)
        if hair in ('knot','pony','braid','twins','cap'):
            for x in ([21,33] if hair=='twins' else [28]):
                poly(H[0],[(x-2,7),(x-1,6),(x+1,6),(x+3,8),(x+2,10),(x-1,10),(x-2,9)])
                line(H[3],[(x-1,7),(x+1,7),(x+2,8)]);dot(T[4],x-1,10)
        if hair=='twins' and not rear:
            line(H[2],[(23,11),(22,15),(21,19),(22,21)])
            line(H[2],[(32,11),(33,14),(34,18),(33,20)])
        if hair=='braid':line(H[3],[(34,18),(35,22),(33,25),(34,27)]);dot(T[4],34,27)
        if rear and long:
            poly(H[2],[(23,12),(32,11),(33,18),(32,24),(34,29),(30,28),(29,32),(26,29),(23,30),(24,21)])
            line(H[4],[(25,13),(27,15),(26,20),(25,24)]);line(H[1],[(31,15),(29,23),(30,27)])
    else:
        line(S[5],[(24,9),(26,7),(29,7)]);line(S[2],[(32,8),(34,11),(34,13)])
    if hair=='hat':
        poly(INK,[(17,13),(20,11),(25,7),(26,6),(29,6),(35,11),(39,13),(37,14),(20,14)])
        poly(gold[3],[(19,12),(25,8),(27,7),(32,9),(37,12),(31,13),(23,13)])
        line(gold[5],[(21,12),(26,8)]);line(gold[1],[(28,8),(32,12)])
    if hair=='hood':
        poly(C[1],[(22,10),(25,6),(30,6),(34,10),(35,17),(33,20),(31,17),(32,12),(27,10),(24,12),(23,17),(21,18)])
        line(C[4],[(23,10),(26,7),(29,7)]);line(C[0],[(31,8),(33,11),(33,15)])
    if accessory in ('band','medal','headwrap'):
        line(T[4] if accessory!='band' else (237,229,212),[(22,11),(27,10),(33,11)])
        if accessory=='medal':rect(gold[2],26,10,28,12);dot(gold[5],27,10)
    if side:
        # The visible eye sits between the fringe and the silhouette of the nose.
        line(H[1],[(23,13),(25,12 if mood in ('sharp','cool','impish') else 13)])
        line(INK,[(23,15),(25,14 if mood in ('sharp','cool') else 15)])
        dot(S[5],23,16);dot(E,24,16)
        dot(S[4],21,16);dot(S[1],23,17)
        line(S[1],[(24,19),(26,18 if mood in ('smile','impish') else 19)])
        if hair not in ('hood','veil'):line(S[2],[(30,15),(31,14),(31,16)])
    if not rear and accessory=='glasses':
        for x in ([23] if side else [23,29]):
            g.ellipse(coords([(x,14),(x+3,17)]) if not right else coords([(x+3,14),(x,17)]),outline=H[1])
        if not side:line(H[1],[(26,15),(29,15)])
    if not rear and beard!='none':
        line(H[2],[(24,18),(26,17),(27,18)]);line(H[2],[(28,18),(29,17),(31,18)])
        if beard!='stache':
            length={'stubble':21,'short':23,'full':25,'long':29,'fork':27}.get(beard,23)
            poly(H[1],[(23,18),(26,20),(29,20),(32,18),(31,length-2),(28,length),(26,length-1),(25,length)])
            line(H[4],[(25,20),(27,21),(27,length-2)])
    if not rear and accessory=='mask':poly(C[1],[(22,16),(26,17),(33,15),(32,19),(29,21),(25,20)])
    if pose:
        for i,(elbow,hand) in enumerate((pose.off,pose.main)):
            shoulder=joint(30 if i==0 else 26,24)
            elbow=local(*elbow);hand=local(*hand)
            sleeve=[shoulder,elbow,hand]
            g.line(sleeve,fill=INK,width=figure.stroke(6),joint='curve')
            g.line(sleeve,fill=C[1+i],width=figure.stroke(4),joint='curve')
            g.line([shoulder,elbow],fill=C[3+i],width=figure.stroke(2))
            wx,wy=hand
            cuff=((elbow[0]+3*wx)//4,(elbow[1]+3*wy)//4)
            g.line([cuff,hand],fill=T[3],width=4)
            g.rectangle((wx-1,wy-1,wx+1,wy+1),fill=S[2])
            g.point((wx-1,wy-1),fill=S[5])
    return im

def main():
    people=json.loads((Path(__file__).with_name('field_people.json')).read_text(encoding='utf8'))
    manifest={}
    for offset in range(0,len(people),8):
        group=people[offset:offset+8];page=f'walk{offset//8:02}'
        atlas=Image.new('RGBA',(224,len(group)*224))
        for row,person in enumerate(group):
            manifest[person[0]]=[page,row]
            for direction in range(4):
                for phase in range(4):
                    sprite=draw_actor(person,direction,phase)
                    assert sprite.getbbox()[1:4:2] == (54-3*person[11],54), (person[0],direction,phase,sprite.getbbox())
                    atlas.alpha_composite(sprite,(56*direction,224*row+56*phase))
        atlas.save(DEST/(page+'.webp'),lossless=True,method=5)
    (DEST/'walk.json').write_text(json.dumps(manifest,separators=(',',':'))+'\n',encoding='utf8')
if __name__ == '__main__':
    from painted_actors import main as import_painted_cast
    import_painted_cast()
