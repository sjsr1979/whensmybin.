function renderLayout({ title, headerNote = "local demo", breadcrumbHtml, bodyHtml, sidebarHtml, includeLeaflet = false }) {
  const breadcrumbBar = breadcrumbHtml
    ? `<div class="breadcrumb-bar"><div class="wrap">${breadcrumbHtml}</div></div>`
    : "";

  const mainInner = sidebarHtml
    ? `<div class="page-grid"><div class="page-main">${bodyHtml}</div><aside class="page-sidebar">${sidebarHtml}</aside></div>`
    : bodyHtml;

  const leafletTags = includeLeaflet
    ? `
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <link rel="stylesheet" href="/style.css" />${leafletTags}
</head>
<body>
  <header class="site-header">
    <div class="wrap header-inner">
      <a href="/" class="brand"><img src="/images/logo.png" alt="whensmybin.co.uk" class="brand-logo" /></a>
      <span class="header-note">${headerNote}</span>
    </div>
  </header>

  ${breadcrumbBar}

  <main class="wrap">
    ${mainInner}
  </main>

  <footer class="site-footer">
    <div class="wrap">
      <p>Independent demo. Not affiliated with any UK council. Bin dates come from each council's own public lookup and can change — check the council site for anything that matters.</p>
    </div>
  </footer>

  <script src="/app.js"></script>
</body>
</html>`;
}

module.exports = { renderLayout };
