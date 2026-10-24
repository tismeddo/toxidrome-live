"""Stamp asset URLs with a version so browsers fetch fresh files after each update.
Run before committing:  python3 stamp.py"""
import re, time, pathlib
root = pathlib.Path(__file__).parent
v = time.strftime("%Y%m%d%H%M")
for f in root.glob("js/*.js"):
    s = f.read_text()
    s2 = re.sub(r'(from\s+"\./[\w-]+\.js)(\?v=\d+)?"', rf'\1?v={v}"', s)
    if s2 != s: f.write_text(s2)
for f in ("index.html", "play.html"):
    p = root / f; s = p.read_text()
    s2 = re.sub(r'((?:src|href)="(?:js|css|vendor)/[\w-]+\.(?:js|css))(\?v=\d+)?"', rf'\1?v={v}"', s)
    p.write_text(s2)
print("stamped", v)
