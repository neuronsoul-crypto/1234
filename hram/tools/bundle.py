# Собирает весь сайт hram/ в один самодостаточный HTML (для просмотра двойным щелчком).
# Запуск из папки hram:  python3 tools/bundle.py . dist/hram-sait.html
import sys, os, re, base64, json, mimetypes
ROOT, OUT = sys.argv[1], sys.argv[2]
PAGES = ["index", "o-chasovne", "duhovenstvo", "raspisanie", "vystavki"]
MIME = {".svg": "image/svg+xml", ".webp": "image/webp", ".woff2": "font/woff2", ".png": "image/png", ".jpg": "image/jpeg"}
cache = {}
def data_uri(path):
    if path not in cache:
        b = open(path, "rb").read()
        cache[path] = "data:%s;base64,%s" % (MIME[os.path.splitext(path)[1]], base64.b64encode(b).decode())
    return cache[path]
def read(p): return open(os.path.join(ROOT, p), encoding="utf-8").read()

css = read("assets/css/style.css")
css = re.sub(r'url\("\.\./(img|fonts)/([^"]+)"\)', lambda m: 'url("%s")' % data_uri(os.path.join(ROOT, "assets", m.group(1), m.group(2))), css)

def inline_assets(html):
    return re.sub(r'(src|href)="(assets/img/[^"]+)"', lambda m: '%s="%s"' % (m.group(1), data_uri(os.path.join(ROOT, m.group(2)))), html)
def fix_links(html):
    html = re.sub(r'href="index\.html"', 'href="#index"', html)
    return re.sub(r'href="(%s)\.html"' % "|".join(PAGES[1:]), r'href="#\1"', html)

titles, mains = {}, {}
for p in PAGES:
    h = read(p + ".html")
    titles[p] = re.search(r"<title>(.*?)</title>", h).group(1)
    mains[p] = re.search(r'<main id="main">\n?(.*?)\n?</main>', h, re.S).group(1)

base = read("index.html")
head = re.search(r"<head>(.*?)</head>", base, re.S).group(1)
head = re.sub(r'\s*<script src=[^>]+></script>', "", head)
head = re.sub(r'\s*<link rel="(stylesheet" href="assets|preload)[^>]+>', "", head)
head = inline_assets(head) + "\n<style>\n" + css + "\n</style>"
header = re.search(r'(<a class="skip-link".*?)<main id="main">', base, re.S).group(1)
header = re.sub(r'\s*aria-current="page"', "", header)
footer = re.search(r"</main>\s*(<footer.*?</footer>)", base, re.S).group(1)

main = "\n".join('<div class="page" data-page="%s"%s>\n%s\n</div>' % (p, "" if p == "index" else " hidden", mains[p]) for p in PAGES)

def embedded(name):
    d = json.loads(read("data/" + name))
    for it in d.get("items", []):
        if it.get("image", "").startswith("assets/"): it["image"] = data_uri(os.path.join(ROOT, it["image"]))
    return d
data = {"data/schedule.json": embedded("schedule.json"), "data/news.json": embedded("news.json")}

router = """
(function () {
  var TITLES = %s;
  function show() {
    var id = location.hash.slice(1) || 'index';
    if (!TITLES[id]) return;
    document.querySelectorAll('.page').forEach(function (p) { p.hidden = p.getAttribute('data-page') !== id; });
    document.querySelectorAll('.nav a, .drawer nav a').forEach(function (a) {
      if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    document.title = TITLES[id];
    var drawer = document.querySelector('.drawer.is-open [data-close]');
    if (drawer) drawer.click();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  window.addEventListener('hashchange', show);
  show();
})();
""" % json.dumps(titles, ensure_ascii=False)

html = """<!DOCTYPE html>
<html lang="ru">
<head>%s
</head>
<body>
%s
<main id="main">
%s
</main>

%s
<script>window.EMBEDDED_DATA = %s;</script>
<script>%s</script>
<script>%s</script>
<script>%s</script>
</body>
</html>
""" % (head, fix_links(inline_assets(header)), fix_links(inline_assets(main)), fix_links(inline_assets(footer)),
       json.dumps(data, ensure_ascii=False), read("assets/js/main.js"), read("assets/js/schedule.js"), router)
open(OUT, "w", encoding="utf-8").write(html)
print(OUT, round(len(html.encode()) / 1024), "KB")
