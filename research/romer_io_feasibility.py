# Exploratoire (2026-11-25) : faisabilite de Romer a l envers -- UA depuis les eclipses d Io
# de la compilation Lieske (IMCCE NSDC, 1652-1983_J1-4_lieske.data.txt), c de labo, orbites
# kepleriennes (a_J par Kepler III depuis les periodes). Usage : python3 -I research/romer_io_feasibility.py <fichier> <an0> <an1> [V|P]
import sys, math, numpy as np
y0,y1=int(sys.argv[2]),int(sys.argv[3]); only=sys.argv[4] if len(sys.argv)>4 else None
R=[]
for l in open(sys.argv[1]):
    if len(l)<40: continue
    y=int(l[0:4]); s=int(l[14:17]); typ=l[17]; sat=int(l[18]); ev=l[19]; jd=float(l[24:38])
    if sat==1 and y0<=y<=y1 and (only is None or typ==only): R.append((jd,s,ev))
jd=np.array([r[0] for r in R]); sg=np.array([r[1] for r in R],float); D=np.array([r[2]=='D' for r in R])
d2r=math.pi/180
def kep(L0,n,pw,e,a,t):
    M=(L0-pw+n*(t-2451545.0))*d2r; E=M.copy()
    for _ in range(8): E=M+e*np.sin(E)
    nu=2*np.arctan2(math.sqrt(1+e)*np.sin(E/2),math.sqrt(1-e)*np.cos(E/2)); r=a*(1-e*np.cos(E))
    lon=nu+pw*d2r; return r*np.cos(lon), r*np.sin(lon), lon
PJ=4332.589; aJ=(PJ/365.25636)**(2/3)   # Kepler III, AU from periods only
xe,ye,_=kep(100.464,0.98560912,102.937,0.01671,1.0,jd)
xj,yj,LJ=kep(34.396,360/PJ,14.728,0.04839,aJ,jd)
dAU=np.hypot(xj-xe,yj-ye)
n1=203.488955; c=299792.458; day=86400
theta=(0.08309+0.7396)*d2r*(jd-2451545)          # Laplace term, period ~437.6 d
LJd=np.unwrap(LJ)/d2r
phase=LJd - n1*jd
k=np.round((phase-phase[0])/360.)   # integer cycles
# model: lam0_D/R + n1*jd + dn*(jd-jm) - q*dAU + a sin + b cos = LJd + 360k  (unknowns in deg)
jm=jd.mean()
y=LJd+360*k*0 - n1*jd
# redo k: remove 360 wraps so residual small
y=y-360*np.round((y-np.median(y[D]))/360)
X=np.column_stack([D, ~D, (jd-jm), -dAU, np.sin(theta), np.cos(theta), (jd-jm)**2/1e4]).astype(float)
w=1/(sg/day*n1)  # weights in deg
r0=(y-np.where(D,np.median(y[D]),np.median(y[~D])))
k0=np.abs(r0)<5
X,y,w,sg,jd,D=X[k0],y[k0],w[k0],sg[k0],jd[k0],D[k0]
for it in range(4):
    beta,*_=np.linalg.lstsq(X*w[:,None], y*w, rcond=None)
    res=(y-X@beta)/n1*day
    keep=np.abs(res)<3.5*np.std(res)
    X,y,w,sg,jd,D,res=X[keep],y[keep],w[keep],sg[keep],jd[keep],D[keep],res[keep]
cov=np.linalg.inv((X*w[:,None]).T@(X*w[:,None]))*np.sum((res/sg)**2)/(len(y)-X.shape[1])
q,dq=beta[3],math.sqrt(cov[3,3])
tau=q/n1*day; dtau=dq/n1*day
A=tau*c; dA=dtau*c
print(f"{y0}-{y1} {only or 'V+P'}: N={len(y)} rms={np.std(res):.0f}s  light time/AU = {tau:.1f} ± {dtau:.1f} s  -> AU = {A/1e6:.1f} ± {dA/1e6:.1f} Mkm ; Laplace amp = {math.hypot(beta[4],beta[5])/n1*day/60:.1f} min ; D-R half-duration={(beta[1]-beta[0])/2/n1*24*60:.1f} min")
