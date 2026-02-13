import math
import random
from pathlib import Path
import json

# MPCORB fixed width columns (1-based):
# 1-7 desig, 9-13 H, 15-19 G, 21-25 epoch, 27-35 M, 38-46 Peri, 49-57 Node, 60-68 i, 71-79 e, 81-91 n, 93-103 a

BELT_MAX = 50.0
SCATTER_MAX = 100.0
DETACHED_MAX = 1000.0

LIMITS = {
    'belt': 6000,
    'scattered': 3000,
    'detached': 1500,
}

random.seed(42)


def parse_float(s):
    s = s.strip()
    if not s:
        return None
    try:
        return float(s)
    except ValueError:
        return None


def kepler_solve(M, e, tol=1e-8, max_iter=50):
    # M in radians
    if e < 0.8:
        E = M
    else:
        E = math.pi
    for _ in range(max_iter):
        f = E - e * math.sin(E) - M
        fp = 1 - e * math.cos(E)
        if fp == 0:
            break
        d = -f / fp
        E += d
        if abs(d) < tol:
            break
    return E


def orbit_position(a, e, inc, node, peri, M):
    # all angles in radians, a in AU
    E = kepler_solve(M, e)
    x_p = a * (math.cos(E) - e)
    y_p = a * math.sqrt(1 - e * e) * math.sin(E)
    cosO = math.cos(node)
    sinO = math.sin(node)
    cosw = math.cos(peri)
    sinw = math.sin(peri)
    cosi = math.cos(inc)
    sini = math.sin(inc)
    # rotate from perifocal to ecliptic
    x = (cosO * cosw - sinO * sinw * cosi) * x_p + (-cosO * sinw - sinO * cosw * cosi) * y_p
    y = (sinO * cosw + cosO * sinw * cosi) * x_p + (-sinO * sinw + cosO * cosw * cosi) * y_p
    z = (sinw * sini) * x_p + (cosw * sini) * y_p
    return x, y, z


def reservoir_add(reservoir, item, limit, seen):
    if len(reservoir) < limit:
        reservoir.append(item)
    else:
        j = random.randint(0, seen)
        if j < limit:
            reservoir[j] = item


def main():
    import sys
    if len(sys.argv) < 3:
        print('Usage: python3 scripts/build-kuiper-from-mpcorb.py <MPCORB.DAT> <output.json>')
        return
    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])

    belt = []
    scattered = []
    detached = []
    seen = {'belt': 0, 'scattered': 0, 'detached': 0}

    with input_path.open('r', encoding='utf-8', errors='ignore') as f:
        # skip header
        for line in f:
            if line.startswith('-----'):
                break
        for line in f:
            if not line.strip():
                continue
            a = parse_float(line[92:103])
            if a is None or a < 30.0:
                continue
            e = parse_float(line[70:79])
            inc = parse_float(line[59:68])
            node = parse_float(line[48:57])
            peri = parse_float(line[37:46])
            M = parse_float(line[26:35])
            if None in (e, inc, node, peri, M):
                continue
            # filter extreme eccentricities
            if e >= 1 or e < 0:
                continue
            # categorize
            if a <= BELT_MAX:
                group = 'belt'
            elif a <= SCATTER_MAX:
                group = 'scattered'
            elif a <= DETACHED_MAX:
                group = 'detached'
            else:
                continue
            # compute position
            M_rad = math.radians(M % 360)
            inc_rad = math.radians(inc)
            node_rad = math.radians(node)
            peri_rad = math.radians(peri)
            x, y, z = orbit_position(a, e, inc_rad, node_rad, peri_rad, M_rad)
            item = {
                'a': a,
                'e': e,
                'i': inc,
                'node': node,
                'peri': peri,
                'M': M,
                'pos': [x, y, z],
            }
            seen[group] += 1
            reservoir_add(locals()[group], item, LIMITS[group], seen[group])

    output = {
        'belt': belt,
        'scattered': scattered,
        'detached': detached,
        'counts': {
            'belt': seen['belt'],
            'scattered': seen['scattered'],
            'detached': seen['detached'],
        }
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(output))
    print('written', output_path)
    print('counts', output['counts'])


if __name__ == '__main__':
    main()
