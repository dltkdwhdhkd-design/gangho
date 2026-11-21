"""Timber roofs, open court halls and garden portals. All measurements are in kit units."""
from math import cos, sin, pi, ceil, tau


def tiled_roof(m,x,y,z,w,d,rise,up=.12,hip=.20,style="tile"):
    half, depth = w/2, d/2
    ridge = max(.04,half*(1-hip))
    # The tile trough flattens above the eave. Only the last fifth of the corners turns up.
    curl = min(up*.69, .098)
    def surface(t,v,side):
        return (x+t*(ridge+(half-ridge)*v), y+side*depth*v,
                z+rise*(1-v)**1.63+curl*abs(t)**4.3*v**1.8+.013*t*t*(1-v))
    def raised(p,h): return (p[0],p[1],p[2]+h)
    count = max(5,min(25,ceil(w/.082)))
    slopes = (0,.24,.48,.70,.87,1)
    dry = style in ("plank","clay","leaf") or m.style=="bamboo" and w>1.9
    ribs = "plank" if dry else "tileRim"
    for side in (-1,1):
        for i in range(count):
            u,v = -1+2*i/count,-1+2*(i+1)/count
            for j,(lo,hi) in enumerate(zip(slopes,slopes[1:])):
                a,b,c,e = surface(u,lo,side),surface(v,lo,side),surface(v,hi,side),surface(u,hi,side)
                pts = [a,b,c,e]
                shade = .90+.026*((i*7+j*11)%7)
                m.face(pts if side==1 else pts[::-1],style,shade)
                # Overlap lips are dark below and weathered on the upper surface.
                if hi<1 and not dry:
                    m.face([e,c,raised(c,-.008),raised(e,-.008)],"tileShade")
            a,b = surface(u,1,side),surface(v,1,side)
            m.face([a,b,raised(b,-.035),raised(a,-.035)],"tileShade")
            c,e = surface(u,.76,side),surface(v,.76,side)
            m.face([raised(a,-.036),raised(b,-.036),raised(e,-.053),raised(c,-.053)],"wood",.71)
            m.beam(raised(a,-.026),raised(b,-.026),.013,"wood",4)
        for i in range(count+1):
            t = -1+2*i/count
            # Each half-round cap has its own highlight and shaded sides. The end disk faces the court.
            points = [surface(t,v,side) for v in slopes]
            radius = min(.016,w/count*.20) * (.77 if dry else 1)
            for j,(a,b) in enumerate(zip(points,points[1:])):
                for k in range(3):
                    def arc(p,angle):
                        return (p[0]+radius*cos(angle),p[1],p[2]+.003+radius*sin(angle))
                    ang0,ang1 = pi*k/3,pi*(k+1)/3
                    quad = [arc(a,ang0),arc(a,ang1),arc(b,ang1),arc(b,ang0)]
                    m.face(quad if side==-1 else quad[::-1],ribs,[.83,1.08,.92][k]*(.98+.014*((j+i)%3)))
            if not dry:
                p = points[-1]
                cap = [(p[0]+radius*cos(k*pi/5),p[1]+side*.004,p[2]+.004+radius*sin(k*pi/5)) for k in range(6)]
                m.face(cap if side==-1 else cap[::-1],"tileEnd",.91+.07*(i%3))
    for end in (-1,1):
        for j,(lo,hi) in enumerate(zip(slopes,slopes[1:])):
            a,b,c,e = surface(end,lo,-1),surface(end,hi,-1),surface(end,hi,1),surface(end,lo,1)
            pts = [a,b,c] if lo==0 else [a,b,c,e]
            m.face(pts if end==1 else pts[::-1],style,.96+.035*(j%3))
            for sy in (-1,1):
                m.beam(raised(surface(end,lo,sy),.007),raised(surface(end,hi,sy),.007),.017,ribs,5)
        edgeA,edgeB = surface(end,1,-1),surface(end,1,1)
        m.face([edgeA,edgeB,raised(edgeB,-.035),raised(edgeA,-.035)],"tileShade")
    m.beam((x-ridge-.018,y,z+rise+.021),(x+ridge+.018,y,z+rise+.021),.028,ribs,6)
    for end in (-1,1):
        a=(x+end*ridge,y,z+rise+.022); b=(x+end*(ridge+.043),y,z+rise+.048)
        m.beam(a,b,.026,ribs,5,.017)


def pillar(m,x,y,base,top,r=.049):
    for h,lo,hi in ((.035,1.60,1.68),(.054,1.68,1.26),(.080,1.26,1.22)):
        z0 = base + (0 if h==.035 else .035 if h==.054 else .054)
        m.beam((x,y,z0),(x,y,base+h),r*lo,"rock",8,r*hi)
    m.beam((x,y,base+.077),(x,y,top-.047),r,"wood",10,r*.94)
    m.box(x,y,top-.056,r*2.7,r*2.7,.038,"wood")
    for side in (-1,1):
        m.beam((x+side*r*.76,y,top-.074),(x+side*r*2.03,y,top-.022),.017,"wood",4,.025)
    m.box(x,y,top-.024,r*5.1,r*2.8,.028,"accent",.76)


def paper_screen(m,x,y,z,w,h,door=False):
    m.box(x,y,z,w,.041,h,"wood",.85)
    m.box(x,y-.026,z+h*.30,w*.89,.015,h*.61,"rice")
    for i in range(1,6):
        m.box(x+w*(i/6-.5)*.90,y-.041,z+h*.294,.009,.012,h*.634,"wood",.9)
    for row in (.32,.73,.85,.92):
        m.box(x,y-.041,z+row*h,w*.95,.014,.013,"wood")
    if door:
        m.box(x,y-.039,z+.008,.022,.021,h*.97,"wood")
        for side in (-1,1):
            m.box(x+side*w*.055,y-.049,z+h*.31,.012,.008,.020,"trim")
    for side in (-1,1):
        m.box(x+side*w*.24,y-.028,z+.015,w*.40,.014,h*.218,"plank",.72)


def censer(m,x,y,z):
    for i in range(3):
        a = tau*i/3-pi/2
        m.beam((x+.077*cos(a),y+.077*sin(a),z),(x+.049*cos(a),y+.049*sin(a),z+.115),.017,"bronze",6,.023)
    for lo,hi,r,R in ((.093,.128,.050,.088),(.128,.186,.088,.119),(.186,.200,.119,.113),(.200,.214,.113,.130)):
        m.beam((x,y,z+lo),(x,y,z+hi),r,"bronze",12,R)
    m.beam((x,y,z+.208),(x,y,z+.215),.096,"ink",12)
    for side in (-1,1):
        m.beam((x+side*.084,y,z+.158),(x+side*.15,y,z+.256),.012,"bronze",5)
        m.beam((x+side*.15,y,z+.256),(x+side*.106,y,z+.245),.012,"bronze",5)
    for u in (-.015,.012,.030):
        m.beam((x+u,y,z+.214),(x+u*1.25,y+.008,z+.292+u),.004,"wood",4)


def formal_hall(m,style):
    levels={"tao":(.179,.84,1.32,5),"plum":(.139,.78,1.16,5),
            "temple":(.154,.86,1.30,5),"capital":(.133,.76,1.17,7)}
    base,eave,upper,bays=levels[style]
    w=1.84; front=.31; back=1.10; porch=.028
    m.box(0,.56,0,2.00,1.12,base*.77,"brick")
    m.box(0,.56,base*.77,2.05,1.14,base*.23,"rock",1.11)
    # A deep covered porch wraps in front of recessed doors. Its darker inner ceiling remains visible.
    m.box(0,(front+back)/2,base,w,back-front,eave-base-.03,"wall")
    m.box(0,front-.012,base,w,.046,eave-base-.055,"ink",.80)
    stepW=.86 if style!="capital" else 1.10
    for j in range(4):
        m.box(0,-.035-j*.041,0,stepW+j*.039,.050,base*(4-j)/5,"rock",1+(j%2)*.055)
    for i in range(bays):
        x=w*((i+.5)/bays-.5)
        paper_screen(m,x,front-.04,base+.013,w/bays*.91,eave-base-.109,i==bays//2)
    for i in range(bays+1):
        x=w*(i/bays-.5)
        pillar(m,x,porch,base,eave,.046 if style!="capital" else .039)
        m.box(x,front-.075,base,.047,.048,eave-base-.038,"wood")
    m.box(0,porch,eave-.078,w+.20,.15,.08,"wood",.83)
    m.box(0,porch-.061,eave-.033,w+.25,.051,.026,"accent",.69)
    # Lower roof extends over the portico. Upper walls rise through its inner, concealed portion.
    tiled_roof(m,0,.55,eave,2.23,1.46,.205,.090,.26)
    z1=eave+.157
    m.box(0,.59,z1,1.59,.69,upper-z1,"wood")
    for i in range(bays):
        x=1.57*((i+.5)/bays-.5)
        paper_screen(m,x,.234,z1+.014,1.57/bays*.89,upper-z1-.023)
    m.box(0,.22,upper-.033,1.69,.11,.043,"wood")
    tiled_roof(m,0,.61,upper,1.98,1.15,.31 if style=="tao" else .37,.115 if style=="plum" else .072,.24)
    if style in ("tao","temple"):
        for side in (-1,1):
            censer(m,side*.744,-.15,0)
    elif style=="plum":
        for side in (-1,1):
            x=side*.85
            m.beam((x,-.058,base),(x,-.058,eave-.065),.016,"wood")
            m.face([(x-.045,-.06,eave-.10),(x+.048,-.06,eave-.10),(x+.048,-.06,eave-.39),(x,-.06,eave-.35),(x-.045,-.06,eave-.40)],"accent")
    else:
        for side in (-1,1):m.box(side*.73,-.073,.022,.27,.17,.085,"brick")


def garden_gate(m,style):
    # An actual through-opening between the two gardens; the voussoirs follow the circle down to the sill.
    r=.353; zc=.346; h=.85; outer=r+.045; depth=.18; y=.37
    for side in (-1,1):
        m.box(side*(.96+outer)/2,y,0,.96-outer,depth,h,"wall")
    for i in range(32):
        a,b=tau*i/32,tau*(i+1)/32
        def p(q,radius,y0):return (radius*cos(q),y0,zc+radius*sin(q))
        def rim(q):
            cs,sn=cos(q),sin(q)
            dx=outer/max(1e-6,abs(cs)); dz=(h-zc)/max(1e-6,sn) if sn>0 else zc/max(1e-6,-sn)
            return min(dx,dz)
        for side in (-1,1):
            f=y+side*depth/2
            outerA,outerB=p(a,rim(a),f),p(b,rim(b),f)
            left,right=p(a,outer,f),p(b,outer,f)
            # Only the masonry above the walkable sill is visible.
            m.face([left,right,outerB,outerA],"wall")
            m.face([p(a,r,f+side*.009),p(b,r,f+side*.009),right,left],"rock",.93+.035*(i%4))
        m.face([p(b,r,y-depth/2),p(a,r,y-depth/2),p(a,r,y+depth/2),p(b,r,y+depth/2)],"rock",.84)
    m.box(0,y,0,.59,depth+.11,.024,"rock")
    tiled_roof(m,0,y,h,2.09,.44,.145,.071,.13)
    for side in (-1,1):
        m.box(side*.78,y-.097,.09,.245,.026,.295,"wood")
        for j in (-1,0,1):m.box(side*.78+j*.062,y-.117,.102,.035,.013,.265,"rice")


def market(m,style,role):
    inn=role=="inn"; base=.101 if style=="harbor" else .066
    m.box(0,.61,0,1.89,1.02,base,"brick")
    m.box(0,.69,base,1.70,.66,.57,"wall")
    for i in range(3):
        x=-.53+i*.53
        if i==2 and not inn:paper_screen(m,x,.34,base+.03,.40,.44,True)
        else:
            m.box(x,.35,base+.08,.46,.031,.39,"ink")
            m.box(x,.273,base+.12,.46,.19,.052,"plank")
            for j in range(3):
                u=x-.145+j*.134
                m.beam((u,.25,base+.177),(u,.25,base+.223+(j%2)*.027),.031,"clay",7,.039)
                m.beam((u,.25,base+.224+(j%2)*.027),(u,.25,base+.24+(j%2)*.027),.039,"clay",7,.024)
    for x in (-.80,-.26,.28,.81):pillar(m,x,.087,base,.66,.035)
    m.box(0,.10,.60,1.83,.108,.061,"wood")
    if inn:
        m.box(0,.64,.65,1.64,.72,.39,"wall")
        for x in (-.57,-.19,.19,.57):paper_screen(m,x,.271,.70,.29,.29)
        m.box(0,.25,.639,1.85,.39,.041,"plank")
        for x in (-.81,-.41,0,.41,.81):m.box(x,.062,.672,.031,.035,.16,"wood")
        m.box(0,.062,.811,1.73,.032,.03,"wood")
        for side in (-1,1):m.box(side*.84,.20,.82,.03,.31,.03,"wood")
        tiled_roof(m,0,.59,1.06,2.06,1.24,.305,.068,.18)
        tiled_roof(m,.02,.18,.62,1.92,.46,.086,.031,.09)
    else:
        tiled_roof(m,0,.69,.67,1.99,.94,.26,.059,.23)
        for i in range(9):
            x=-.82+i*.182
            tone="accent" if i%3==0 else "linen"
            m.face([(x,.34,.617),(x+.182,.34,.617),(x+.182,-.19,.516),(x,-.19,.516)],tone)
            m.face([(x,-.19,.516),(x+.182,-.19,.516),(x+.176,-.192,.476),(x+.008,-.19,.480)],tone,.89)
        m.box(-.51,-.092,.16,.48,.12,.033,"plank")
        for x in (-.69,-.33):m.box(x,-.092,.013,.045,.085,.147,"wood")


def courtyard_build(m,style,role):
    if role=="hall" and style in ("tao","plum","temple","capital"):
        formal_hall(m,style); return True
    if role=="gate" and style in ("canal","observatory"):
        garden_gate(m,style); return True
    if role in ("shop","inn") and style in ("canal","harbor","village","capital","plum","tao","sword","temple"):
        market(m,style,role); return True
    return False
