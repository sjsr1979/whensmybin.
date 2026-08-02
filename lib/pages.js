const { renderLayout } = require("./layout");
const { renderLookupWidget } = require("./widget");
const { colorDot, binIllustration } = require("./icons");
const councils = require("../data/councils");

function renderHome() {
  const councilLinks = councils
    .map(
      (c) => `
      <li>
        <a href="/council/${c.slug}">${c.name} bin collection days</a>
        ${c.supported ? '<span class="tag tag-live">Live lookup</span>' : '<span class="tag">Coming soon</span>'}
      </li>`
    )
    .join("");

  const body = `
    <section class="hero">
      <h1>What bin is it this week?</h1>
      <p class="lede">Enter your postcode, pick your address, and see the next collection for every bin — colour and date.</p>

      ${renderLookupWidget({ defaultPostcode: "CW4 7HQ" })}
    </section>

    <section class="how-it-works">
      <h2>How it works</h2>
      <ol class="steps">
        <li>
          <p class="step-title">1. Enter your postcode</p>
          <p class="step-detail">We match it to your council using the official ONS postcode-to-council data.</p>
        </li>
        <li>
          <p class="step-title">2. Pick your address</p>
          <p class="step-detail">Some streets on the same postcode get different collection days, so we narrow it down to your exact address.</p>
        </li>
        <li>
          <p class="step-title">3. See your next bin days</p>
          <p class="step-detail">Every bin your council empties shows up with its colour and date, soonest first.</p>
        </li>
      </ol>
    </section>

    <section class="council-list">
      <h2>Councils</h2>
      <p class="section-note">This is a build-in-progress — real data is live for one council so far, with more being added over time.</p>
      <ul>${councilLinks}</ul>
    </section>
  `;

  return renderLayout({
    title: "When's My Bin — What bin is it this week?",
    headerNote: "local demo · Cheshire East live data",
    bodyHtml: body,
  });
}

function binByKey(council, key) {
  return council.bins.find((b) => b.key === key);
}

function renderRota(council) {
  if (!council.rota || !council.rota.length) return "";
  const columns = council.rota
    .map((slot) => {
      const chips = slot.binKeys
        .map((key) => {
          const bin = binByKey(council, key);
          if (!bin) return "";
          return `<span class="rota-chip">${colorDot(bin.color)}${bin.label.split(" — ")[0]}</span>`;
        })
        .join("");
      return `<div class="rota-col"><p class="rota-week">${slot.week}</p><div class="rota-chips">${chips}</div></div>`;
    })
    .join('<div class="rota-arrow">→</div>');

  return `
    <section class="council-rota">
      <h2>The rota</h2>
      <p class="section-note">This is just the general pattern, not your specific date — it can't be, since that depends on your exact address. Use the lookup above for the real day.</p>
      <div class="rota-strip">${columns}</div>
    </section>
  `;
}

function renderBinAccordion(b) {
  const goesIn = b.goesIn.map((i) => `<li>${i}</li>`).join("");
  const doesNotGoIn = b.doesNotGoIn.map((i) => `<li>${i}</li>`).join("");
  return `
    <details class="bin-accordion">
      <summary>
        ${binIllustration(b.color, 64)}
        <span class="bin-accordion-title">
          <span class="bin-label">${b.label}</span>
          <span class="bin-when">${b.summary}</span>
        </span>
      </summary>
      <div class="bin-detail-lists">
        <div>
          <p class="bin-list-title bin-list-title-yes">Goes in</p>
          <ul>${goesIn}</ul>
        </div>
        <div>
          <p class="bin-list-title bin-list-title-no">Doesn't go in</p>
          <ul>${doesNotGoIn}</ul>
        </div>
      </div>
    </details>
  `;
}

function renderGenericBinInfo(council) {
  return `
    <section class="bin-types">
      <h2>What's typically collected</h2>
      <p class="section-note">We haven't researched ${council.name}'s exact bin colours yet, so this is the general UK pattern, not confirmed local detail — check ${council.name}'s own page above for the real setup.</p>
      <ul class="generic-bin-list">
        <li><strong>General waste</strong> — usually a black, grey or green bin, fortnightly in most councils now.</li>
        <li><strong>Recycling</strong> — usually plastics, cans and paper together, sometimes glass too; whether it's one mixed bin or split into several varies by council.</li>
        <li><strong>Garden waste</strong> — where offered, usually an optional paid subscription, collected through the growing season.</li>
      </ul>
    </section>`;
}

function renderGenericFaq(council) {
  const items = [
    {
      q: `Does ${council.name} change bin days for bank holidays?`,
      a: `Often, yes — most councils shift collections by a day or two around bank holidays, with revised schedules usually published closer to the date. Worth checking ${council.name}'s own page nearer the time.`,
    },
    {
      q: `What if my bin gets missed?`,
      a: `Most councils ask you to wait until the day after your collection was due, then report it through their website, usually within a few working days. That's what the official ${council.name} link above is for.`,
    },
    {
      q: `Why might my collection day differ from a neighbour's on the same postcode?`,
      a: `Councils run different rounds across their area, so streets sharing a postcode can still end up on different days or weeks.`,
    },
  ];
  const html = items
    .map((f) => `<div class="faq-item"><p class="faq-q">${f.q}</p><p class="faq-a">${f.a}</p></div>`)
    .join("");
  return `<section class="council-faq"><h2>Questions people ask</h2>${html}</section>`;
}

function renderFaqs(council) {
  if (!council.faqs || !council.faqs.length) {
    return council.supported ? "" : renderGenericFaq(council);
  }
  const items = council.faqs
    .map(
      (f) => `
      <div class="faq-item">
        <p class="faq-q">${f.q}</p>
        <p class="faq-a">${f.a}${f.link ? ` <a href="${f.link.url}" target="_blank" rel="noreferrer">${f.link.label}</a>.` : ""}</p>
      </div>`
    )
    .join("");
  return `
    <section class="council-faq">
      <h2>Questions people ask</h2>
      ${items}
    </section>
  `;
}

function renderTownPills(council) {
  if (!council.towns || !council.towns.length) return "";
  const pills = council.towns
    .map((t) => `<a class="pill" href="/council/${council.slug}/${t.slug}">${t.name}</a>`)
    .join("");
  return `
    <section class="council-towns">
      <h2>Nearby</h2>
      <div class="pill-row">${pills}</div>
    </section>
  `;
}

function renderSidebar(council, currentTownSlug) {
  const links = [`<li><a href="${council.officialUrl}" target="_blank" rel="noreferrer">Official ${council.name} bin page</a></li>`];
  if (currentTownSlug) {
    links.push(`<li><a href="/council/${council.slug}">All of ${council.name}</a></li>`);
  }
  (council.towns || [])
    .filter((t) => t.slug !== currentTownSlug)
    .forEach((t) => links.push(`<li><a href="/council/${council.slug}/${t.slug}">${t.name} bin collection</a></li>`));

  return `<h2>Related</h2><ul class="sidebar-list">${links.join("")}</ul>`;
}

function renderCouncilBody(council, { heading, lede, extraNote }) {
  const widgetOrLink = council.supported
    ? renderLookupWidget({ defaultPostcode: "" })
    : `
      ${renderLookupWidget({ defaultPostcode: "" })}
      <div class="official-link-card">
        <div>
          <p class="official-link-title">Check your ${council.name} bin day directly</p>
          <p class="official-link-detail">${council.name} runs their own bin-day checker with your real, accurate collection dates — we don't have live data here yet.</p>
        </div>
        <a class="official-link-cta" href="${council.officialUrl}" target="_blank" rel="noreferrer">Go to ${council.name}'s bin lookup →</a>
      </div>
      <p class="section-note">
        Looking for somewhere we do have live data? Try <a href="/council/cheshire-east">Cheshire East</a>.
      </p>`;

  const finalLede = lede || `Find your ${council.name} bin day below, or go straight to the council's own checker.`;

  const binSection =
    council.bins && council.bins.length
      ? `
    <section class="bin-types">
      <h2>What's in each bin</h2>
      ${extraNote ? `<p class="section-note">${extraNote}</p>` : ""}
      <div class="bin-accordion-list">${council.bins.map(renderBinAccordion).join("")}</div>
    </section>`
      : !council.supported
        ? renderGenericBinInfo(council)
        : "";

  const notesSection =
    council.notes && council.notes.length
      ? `
    <section class="council-notes">
      <h2>If something's wrong</h2>
      <ul>${council.notes.map((n) => `<li>${n}</li>`).join("")}</ul>
    </section>`
      : "";

  return `
    <section class="hero">
      <h1>${heading}</h1>
      <p class="lede">${finalLede}</p>

      ${widgetOrLink}
    </section>

    ${renderRota(council)}

    ${binSection}

    ${notesSection}

    ${renderFaqs(council)}

    ${renderTownPills(council)}
  `;
}

function renderCouncilPage(council) {
  const body = renderCouncilBody(council, {
    heading: `${council.name} bin collection`,
    lede: council.intro,
  });

  return renderLayout({
    title: `${council.name} bin collection days — When's My Bin`,
    headerNote: `${council.name} · ${council.supported ? "live data" : "coming soon"}`,
    breadcrumbHtml: `<a href="/">Home</a> / <strong>${council.name}</strong>`,
    bodyHtml: body,
    sidebarHtml: renderSidebar(council),
  });
}

function renderTownPage(council, town) {
  const body = renderCouncilBody(council, {
    heading: `${town.name} bin collection`,
    lede: town.blurb,
    extraNote: `${town.name} sits within ${council.name}, so it runs on the same bins and the same rota.`,
  });

  return renderLayout({
    title: `${town.name} bin collection days — When's My Bin`,
    headerNote: `${town.name}, ${council.name}`,
    breadcrumbHtml: `<a href="/">Home</a> / <a href="/council/${council.slug}">${council.name}</a> / <strong>${town.name}</strong>`,
    bodyHtml: body,
    sidebarHtml: renderSidebar(council, town.slug),
  });
}

module.exports = { renderHome, renderCouncilPage, renderTownPage };
