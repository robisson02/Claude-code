import sys
f=lambda x: float(x.replace(',','.'))
rows=[l.rstrip('\n').split('\t') for l in open(sys.argv[1])]
key=lambda r:(int(r[1]), r[2])
low=[r for r in rows if int(r[1])<=6]
print('niv1-6 : durée moy %.2f (min %.2f, max %.2f) ; pertes moy %.1f (min %.1f, max %.1f) ; défaites %d sur %d combats ; sans fin %d' % (
  sum(f(r[3]) for r in low)/len(low), min(f(r[3]) for r in low), max(f(r[3]) for r in low),
  sum(f(r[4]) for r in low)/len(low), min(f(r[4]) for r in low), max(f(r[4]) for r in low),
  sum(int(r[5].split()[0]) for r in low), 400*len(low), sum(int(r[5].split()[1]) for r in low)))
hi=[r for r in rows if int(r[1])>6]
print('niv10/26 : défaites %d, sans fin %d' % (sum(int(r[5].split()[0]) for r in hi), sum(int(r[5].split()[1]) for r in hi)))
for c in sorted(set(r[0] for r in rows)):
    rr=sorted([r for r in low if r[0]==c], key=key)
    print('%-13s durée %s | pertes %s | déf %s' % (c, ' '.join(r[3] for r in rr), ' '.join(r[4] for r in rr), sum(int(r[5].split()[0]) for r in rr)))
