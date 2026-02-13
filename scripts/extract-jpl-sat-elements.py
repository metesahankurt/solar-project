import re
import json
from pathlib import Path

TARGETS = {
    'Phobos', 'Deimos',
    'Io', 'Europa', 'Ganymede', 'Callisto',
    'Mimas', 'Enceladus', 'Tethys', 'Dione', 'Rhea', 'Titan', 'Iapetus',
    'Miranda', 'Ariel', 'Umbriel', 'Titania', 'Oberon',
    'Triton', 'Proteus', 'Nereid'
}

HTML_PATH = Path('/tmp/jpl_sats_elem.html')
OUTPUT_PATH = Path('data/jpl_sat_elements.json')

html = HTML_PATH.read_text(encoding='utf-8', errors='ignore')

rows = re.findall(r'<tr>\s*(.*?)\s*</tr>', html, flags=re.DOTALL)

def strip_tags(text):
    text = re.sub(r'<[^>]*>', '', text)
    return ' '.join(text.split())

results = {}

for row in rows:
    cols = re.findall(r'<td[^>]*>(.*?)</td>', row, flags=re.DOTALL)
    if len(cols) < 14:
        continue
    cols = [strip_tags(c) for c in cols]
    # columns: ID, Planet, Satellite, Code, Ephem, Frame, Epoch, a, e, w, M, i, node, P, ...
    satellite = cols[2]
    if satellite not in TARGETS:
        continue
    planet = cols[1]
    try:
        a_km = float(cols[7])
        e = float(cols[8])
        w = float(cols[9])
        M = float(cols[10])
        inc = float(cols[11])
        node = float(cols[12])
        period_days = float(cols[13])
    except ValueError:
        continue
    results[satellite] = {
        'planet': planet,
        'a_km': a_km,
        'e': e,
        'w_deg': w,
        'M_deg': M,
        'i_deg': inc,
        'node_deg': node,
        'period_days': period_days,
    }

OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
OUTPUT_PATH.write_text(json.dumps(results, indent=2))
print('extracted', len(results))
print(sorted(results.keys()))
