#!/usr/bin/env python3
"""Courbure depuis les triangles transcrits (data/surv/excess/<pub>), aires SANS rayon : longueurs propagées depuis les bases
mesurées par les seuls angles observés (triangles plans, fermeture observée répartie par tiers). Exploratoire, à porter dans fog.
Usage : python3 research/surv_excess_pure.py sp4 sp7"""
import csv,glob,math,heapq,statistics as st,sys
pubs=sys.argv[1:] or ["sp7"]
def nm(s): return s.strip().replace("I'd.","Island").replace("  "," ")
tr={}
for pub in pubs:
  for f in sorted(glob.glob(f"data/surv/excess/{pub}/transcription/p*.csv")):
    for r in csv.DictReader(open(f)): r["pub"]=pub; tr.setdefault((f,r["k"]),[]).append(r)
T=[]
for k,t in tr.items():
    if len(t)!=3: continue
    if any(r["flag"].strip() and "60" not in r["flag"] and "roll" not in r["flag"] for r in t): continue
    st_=[r["pub"]+":"+nm(r["station"]) for r in t]
    ang=[float(r["deg"])*3600+float(r["min"])*60+float(r["sec"]) for r in t]
    eps=sum(ang)-648000
    T.append(dict(st=st_,ang=ang,eps=eps,dist=[float(r["dist"]) for r in t],page=t[0]["page"],net=t[0]["net"]))
side=lambda t,i: frozenset(t["st"][j] for j in range(3) if j!=i)
BASES0={"sp7":{("Epping West Base","Epping East Base"):8715.9422,("Massachusetts North Base","Massachusetts South Base"):17326.3763,
 ("Fire Island East Base","Fire Island West Base"):14058.9709,("Kent Island North Base","Kent Island South Base"):8687.5446,
 ("Atlanta Northeast Base","Atlanta Southwest Base"):9338.4778,("Dauphin Island West Base","Dauphin Island East Base"):10661.8376},
 # SP 4 : la base telle qu'imprimée comme côté de son réseau (les triangles des réseaux de base)
 "sp4":{("Am. Bot. Low. Base","Am. Bot. Up. Base"):7266.884,("El Paso East Base","El Paso West Base"):11289.176,
 ("Holton North Base","Holton South Base"):5500.570,("Kent I. N. Base","Kent I. S. Base"):8687.545,
 ("Olney East Base","Olney West Base"):6590.780,("S. L. Northwest Base","S. L. Southeast Base"):11198.677,
 ("Salina East Base","Salina West Base"):6552.446,("St. Albans East Base","St. Albans West Base"):3870.403,
 ("Yolo N. W. Base","Yolo S. E. Base"):17486.512}}
BASES={tuple(p+":"+x for x in k):v for p in pubs for k,v in BASES0[p].items()}
known={frozenset(k):(v,0,"base") for k,v in BASES.items()}
# présence des bases comme côtés
allsides={side(t,i) for t in T for i in range(3)}
for k in BASES: print("base", k, "comme côté :", frozenset(k) in allsides)
# Dijkstra en nombre de triangles
pq=[(0,s) for s in known]; heapq.heapify(pq); done=set()
bys={}; plen={}
for ti,t in enumerate(T):
    for i in range(3): bys.setdefault(side(t,i),[]).append((ti,i)); plen.setdefault(side(t,i),[]).append(t["dist"][i])
# une paire de stations imprimée avec des longueurs incompatibles = nom ambigu (coquille de nom) : pas de passage par elle
amb={k for k,v in plen.items() if max(v)/min(v)-1>1e-4}
print(len(amb),"paires ambiguës :",[sorted(x) for x in amb])
for k in amb: bys.pop(k,None)
area={}
while pq:
    d,s=heapq.heappop(pq)
    if s in done: continue
    done.add(s); L=known[s][0]
    for ti,i in bys.get(s,[]):
        t=T[ti]; pa=[(a-t["eps"]/3)/3600*math.pi/180 for a in t["ang"]]
        k=L/math.sin(pa[i]); ls=[k*math.sin(x) for x in pa]
        if ti not in area: area[ti]=(ls,d+1)
        for j in range(3):
            sj=side(t,j)
            if sj not in known or known[sj][1]>d+1: known[sj]=(ls[j],d+1,"prop"); heapq.heappush(pq,(d+1,sj))
print(len(T),"triangles ;",len(area),"atteints depuis une base")
rat=[];E=[];A=[];depth=[]
for ti,(ls,d) in area.items():
    t=T[ti]; rat+= [l/p-1 for l,p in zip(ls,t["dist"])]
    a,b,c=ls; s=(a+b+c)/2; A.append(math.sqrt(s*(s-a)*(s-b)*(s-c))); E.append(t["eps"]); depth.append(d)
print(f"nos côtés / imprimés − 1 : médiane {st.median(rat):+.2e}, |max| {max(map(abs,rat)):.2e}; profondeur max {max(depth)}")
rad=math.pi/180/3600
K=sum(e*a for e,a in zip(E,A))/sum(a*a for a in A); res=[e-K*a for e,a in zip(E,A)]; s=st.pstdev(res)
print(f"pur, par zéro (sans exclusion) : R = {1/math.sqrt(K*rad)/1000:.0f} km, n={len(E)}, dispersion {s:.2f}″")
unreached=[T[i] for i in range(len(T)) if i not in area]
print("non atteints par réseau :",sorted({t['net'] for t in unreached}))
bad=[]
for ti,(ls,d) in area.items():
    t=T[ti]; m=max(abs(l/p-1) for l,p in zip(ls,t["dist"]))
    if m>1e-4: bad.append((m,t["page"],t["st"],d))
bad.sort(reverse=True); print(len(bad),"triangles > 1e-4"); [print(f"  {m:.2e} p{p} {s} prof {d}") for m,p,s,d in bad[:12]]
q=sorted(abs(x) for x in rat); print("quantiles |écart| 50/90/99 %:",[f"{q[int(len(q)*f)]:.1e}" for f in (.5,.9,.99)])
# --- ajustement sur les aires pures : exclusion 3σ (point laissé de côté), puis bootstrap par page imprimée
import random
P=[];
for ti,(ls,d) in area.items():
    a,b,c=ls; s_=(a+b+c)/2; P.append((T[ti]["eps"], math.sqrt(s_*(s_-a)*(s_-b)*(s_-c)), T[ti]["pub"] if "pub" in T[ti] else "", T[ti]["page"], T[ti]["st"][0].split(":")[0]))
def fitK(rows): return sum(e*a for e,a,*_ in rows)/sum(a*a for e,a,*_ in rows)
keep=P[:]
while True:
    out=[]
    for i,r in enumerate(keep):
        o=keep[:i]+keep[i+1:]; Ko=fitK(o); so=st.pstdev([e-Ko*a for e,a,*_ in o])
        if abs(r[0]-Ko*r[1])>3*so: out.append(i)
    if not out: break
    keep=[r for i,r in enumerate(keep) if i not in out]
K=fitK(keep); R=lambda k:1/math.sqrt(k*rad)/1000
res=[e-K*a for e,a,*_ in keep]; sK=st.pstdev(res)/math.sqrt(sum(a*a for e,a,*_ in keep))
groups={}
for r in keep: groups.setdefault((r[4],r[3]),[]).append(r)
G=list(groups.values()); random.seed(1); bs=[]
for _ in range(2000):
    smp=[r for _ in G for r in random.choice(G)]; bs.append(R(fitK(smp)))
bs.sort()
print(f"PUR, {len(P)-len(keep)} exclus > 3σ : R = {R(K):.0f} km ; 1σ naïf ± {R(K)-R(K+sK):.0f} km ; bootstrap par page ({len(G)} pages) 16–84 % : {bs[320]:.0f}–{bs[1680]:.0f} km")
