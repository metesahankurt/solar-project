import json
import math
import random
from pathlib import Path

C_KM_S = 299_792.458
H0 = 70
LY_PER_MPC = 3_261_560

if __name__ == '__main__':
    import sys
    if len(sys.argv) < 3:
        print('Usage: python3 scripts/build-2mrs-density.py <input_2mrs.json> <output_density.json>')
        sys.exit(1)

    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])

    data = json.loads(input_path.read_text())
    points = []
    for item in data:
        cz = item.get('cz')
        vec = item.get('vector')
        if cz is None or not vec:
            continue
        z = cz / C_KM_S
        dist_mpc = (C_KM_S / H0) * z
        dist_ly = dist_mpc * LY_PER_MPC
        if dist_ly < 500_000 or dist_ly > 200_000_000:
            continue
        x = vec[0] * dist_ly
        y = vec[1] * dist_ly
        zc = vec[2] * dist_ly
        points.append((x, y, zc))

    random.seed(1337)
    target = 6000
    if len(points) > target:
        points = random.sample(points, target)

    n = len(points)
    print('points', n)

    # Compute density proxy: inverse of average distance to k nearest neighbors
    k = 8
    densities = []
    for i in range(n):
        xi, yi, zi = points[i]
        dists = []
        for j in range(n):
            if i == j:
                continue
            xj, yj, zj = points[j]
            dx = xi - xj
            dy = yi - yj
            dz = zi - zj
            d2 = dx*dx + dy*dy + dz*dz
            if d2 == 0:
                continue
            dists.append(d2)
        dists.sort()
        if len(dists) >= k:
            avg = sum(math.sqrt(d) for d in dists[:k]) / k
        else:
            avg = math.sqrt(dists[0]) if dists else 1.0
        density = 1.0 / max(avg, 1.0)
        densities.append(density)

    # Normalize densities to 0..1
    mn = min(densities)
    mx = max(densities)
    norm = [0.0 if mx == mn else (d - mn) / (mx - mn) for d in densities]

    out = {
        'points': points,
        'weights': norm,
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(out))
    print('done')
