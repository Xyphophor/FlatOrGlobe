#!/usr/bin/env python3
"""Calage de la photo de Caussols (13 juin 2026) : appareil rectiligne, focale EXIF
(2 711 px), cap/inclinaison/rotation par modèle. Modes : fit (moindres carrés tronqués,
historique), pred, agel, resid, l1 (écart absolu médian sur les deux sommets : le calage
publié). Usage : python3 research/fit_camera_caussols.py l1"""
import sys, os, json, math, numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0,os.path.join(ROOT,"research"))
import align_photo as A
D=math.pi/180
img,w,h=A.load(os.path.join(ROOT,"data/elev/caussols-2026-06-13-original.jpg"))
R_,G_=img[:,:,0],img[:,:,1]
# ligne de ciel : première chute franche du rouge (ciel ~165 → relief < 130), 3 px de suite
top=np.full(w,-1)
for x in range(w):
    col=R_[:,x]
    for y in range(1250,1750):
        if col[y]<col[y-8:y-2].mean()-35 and col[y+1]<col[y-8:y-2].mean()-35 and col[y+2]<col[y-8:y-2].mean()-35: top[x]=y; break
P=json.load(open(os.path.join(ROOT,"src/data/dem/caussols-view.json"))); AZ=P["az0"]+P["step"]*np.arange(len(P["flat"]))
def cam(yaw,pitch,roll,F,cx,cy):
    f=np.array([math.cos(pitch)*math.sin(yaw),math.cos(pitch)*math.cos(yaw),math.sin(pitch)])
    r=np.array([math.cos(yaw),-math.sin(yaw),0.0]); u=np.cross(r,f)
    cr,sr=math.cos(roll),math.sin(roll); r2=cr*r+sr*u; u2=-sr*r+cr*u
    def proj(az,alt):
        v=np.stack([np.cos(alt)*np.sin(az),np.cos(alt)*np.cos(az),np.sin(alt)],-1)
        Z=v@f; return cx+F*(v@r2)/Z, cy-F*(v@u2)/Z
    return proj
F=2711.0; cx=(w-1)/2; cy=(h-1)/2
if __name__=="__main__":
    print("ligne de ciel :", [(x,int(top[x])) for x in range(0,w,100)])

def fit(model, xs, ys, F=F):
    prof=np.array(P[model])/60*D; az=AZ*D
    def res(p):
        yaw,pitch,roll=p; X,Y=cam(yaw,pitch,roll,F,cx,cy)(az,prof)
        ok=np.isfinite(X)&(np.diff(np.r_[X[0],X])>0)
        yy=np.interp(xs,X[ok],Y[ok],left=np.nan,right=np.nan); d=(ys-yy); d=d[np.isfinite(d)]
        if d.size<0.6*xs.size: return 1e9
        d=np.sort(np.abs(d))[:int(0.85*d.size)]; return float(np.sqrt(np.mean(d**2)))
    best=None
    for yaw in np.arange(80,105,0.2):
        for pitch in np.arange(-6,6,0.25):
            r=res((yaw*D,pitch*D,0.0))
            if best is None or r<best[0]: best=(r,yaw*D,pitch*D,0.0)
    step=[0.1*D,0.1*D,0.5*D]
    p=list(best[1:]); cur=best[0]
    for it in range(60):
        improved=False
        for k in range(3):
            for s in (+1,-1):
                q=p.copy(); q[k]+=s*step[k]; r=res(q)
                if r<cur: cur,p,improved=r,q,True
        if not improved: step=[x/2 for x in step]
        if max(step)<1e-5: break
    return cur,p

if __name__=="__main__" and len(sys.argv)>1:
    xs=np.arange(750,2101).astype(float); ys=top[750:2101].astype(float); m=ys>0; xs,ys=xs[m],ys[m]
    for model in ("globeK","globe","flat"):
        r,(yaw,pitch,roll)=fit(model,xs,ys)
        print(f"{model:7s} rms {r:.1f} px ; cap du centre {yaw/D:.3f}°, inclinaison {pitch/D:+.3f}°, rotation {roll/D:+.3f}°")

def predict(model, p):
    yaw,pitch,roll=p; proj=cam(yaw,pitch,roll,F,cx,cy)
    R=6371000.0; eye=1210.0; Re={"flat":None,"globe":R,"globeK":R/0.87}[model]
    hz=0.0 if Re is None else -math.acos(Re/(Re+eye))
    out={}
    for x in (2250,2400,2550,3750,3850):
        # azimut de la colonne x sur la ligne d'horizon : on cherche az tel que X(az, hz) = x
        azs=np.arange(60,140,0.01)*D; X,Y=proj(azs,np.full(azs.shape,hz)); i=np.nanargmin(np.abs(X-x)); out[f"horizon x{x}"]=float(Y[i])
    ag_d,ag_h,ag_az=39250,1133,81.287
    if Re is None: al=math.atan2(ag_h-eye,ag_d)
    else: th=ag_d/Re; al=math.atan2((Re+ag_h)*math.cos(th)-(Re+eye),(Re+ag_h)*math.sin(th))
    X,Y=proj(np.array([ag_az*D]),np.array([al])); out["Agel"]=(float(X[0]),float(Y[0]))
    return out
if __name__=="__main__" and len(sys.argv)>1 and sys.argv[1]=="pred":
    xs=np.arange(750,2101).astype(float); ys=top[750:2101].astype(float); m=ys>0; xs,ys=xs[m],ys[m]
    for model in ("globeK","globe","flat"):
        r,p=fit(model,xs,ys); o=predict(model,p)
        print(model, f"rms {r:.1f}", {k:(round(v,0) if isinstance(v,float) else tuple(round(z) for z in v)) for k,v in o.items()})
    # horizon OBSERVÉ : chute du rouge (brume → mer) sur la droite
    for x in (2250,2400,2550,3750,3850):
        col=R_[:,x].astype(float); y=next(y for y in range(1450,1800) if col[y] < col[y-10:y-3].mean()-8)
        print("horizon observé x", x, ": y", y, "| couleurs au-dessus/dessous", img[y-6,x].astype(int).tolist(), img[y+6,x].astype(int).tolist())
    for model in ("globeK","globe","flat"):
        r,p=fit(model,xs,ys); print(model, "paramètres : cap %.3f° incl. %+.3f° rot. %+.3f°"%(p[0]/D,p[1]/D,p[2]/D))
if __name__=="__main__" and len(sys.argv)>1 and sys.argv[1]=="agel":
    print("ligne de ciel détectée :", [(x,int(top[x])) for x in range(1440,1620,15)])
    # horizon observé extrapolé à la colonne de l'Agel : droite passant par les points mer dégagée
    X=np.array([2250,2400,2550,3750,3850]); Y=np.array([1553,1557,1562,1596,1598]); a,b=np.polyfit(X,Y,1)
    print("horizon observé extrapolé à x 1522 : y %.1f (pente %.4f)"%(a*1522+b,a))
    ys=top[1500:1545]; print("ligne de ciel autour de l'Agel (1500-1545) : min %d, médiane %d"%(ys[ys>0].min(), np.median(ys[ys>0])))
if __name__=="__main__" and len(sys.argv)>1 and sys.argv[1]=="resid":
    yaw,pitch,roll=92.109*D,-0.525*D,0.919*D
    prof=np.array(P["globeK"])/60*D; X,Y=cam(yaw,pitch,roll,F,cx,cy)(AZ*D,prof)
    ok=np.isfinite(X)&(np.diff(np.r_[X[0],X])>0)
    for name,a,b in (("dôme (Puy de Tourrettes)",750,1300),("col",1300,1550),("Pic de Courmettes",1550,2100)):
        xs=np.arange(a,b); yy=np.interp(xs,X[ok],Y[ok]); d=top[a:b]-yy; d=d[top[a:b]>0]
        print(f"{name:26s} photo − LiDAR : médiane {np.median(d):+.1f} px, quartiles {np.percentile(d,25):+.1f} / {np.percentile(d,75):+.1f} (négatif = photo plus HAUTE)")
    xs=np.arange(1550,2100); yy=np.interp(xs,X[ok],Y[ok]); i=np.argmin(yy); j=np.argmin(np.where(top[1550:2100]>0,top[1550:2100],9999))
    print(f"sommet du Courmettes : LiDAR x {xs[i]} y {yy[i]:.0f} ; photo x {1550+j} y {top[1550+j]}")
def fit_l1(model, xs, ys, start):
    prof=np.array(P[model])/60*D; az=AZ*D
    def res(p):
        X,Y=cam(p[0],p[1],p[2],F,cx,cy)(az,prof); ok=np.isfinite(X)&(np.diff(np.r_[X[0],X])>0)
        yy=np.interp(xs,X[ok],Y[ok],left=np.nan,right=np.nan); d=ys-yy; d=d[np.isfinite(d)]
        return float(np.median(np.abs(d))) if d.size>0.6*xs.size else 1e9
    p=list(start); cur=res(p); step=[0.2*D,0.2*D,0.5*D]
    for it in range(200):
        imp=False
        for k in range(3):
            for s in (+1,-1):
                q=p.copy(); q[k]+=s*step[k]; r=res(q)
                if r<cur: cur,p,imp=r,q,True
        if not imp: step=[x/2 for x in step]
        if max(step)<1e-6: break
    return cur,p
if __name__=="__main__" and len(sys.argv)>1 and sys.argv[1]=="l1":
    xs=np.r_[np.arange(1000,1301),np.arange(1550,1801)].astype(float); ys=top[xs.astype(int)].astype(float); m=ys>0; xs,ys=xs[m],ys[m]
    starts={"globeK":(92.109,-0.525,0.919),"globe":(92.111,-0.552,0.900),"flat":(92.451,-0.193,1.374)}
    for model,s0 in starts.items():
        r,p=fit_l1(model,xs,ys,[v*D for v in s0])
        prof=np.array(P[model])/60*D; X,Y=cam(*p,F,cx,cy)(AZ*D,prof); ok=np.isfinite(X)&(np.diff(np.r_[X[0],X])>0)
        med=lambda a,b: float(np.median(top[a:b]-np.interp(np.arange(a,b),X[ok],Y[ok])))
        o=predict(model,p)
        print(f"{model:7s} médiane |écart| {r:.1f} px ; cap {p[0]/D:.3f}° incl. {p[1]/D:+.3f}° rot. {p[2]/D:+.3f}° ; médianes dôme {med(1000,1300):+.1f} Courmettes {med(1550,1800):+.1f} ; horizon prédit", [round(o[k]) for k in o if k.startswith('horizon')], "Agel", tuple(round(z) for z in o['Agel']))
