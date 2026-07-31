function colorDot(color, size = 14) {
  return `<span class="color-dot" style="width:${size}px;height:${size}px;background:${color}"></span>`;
}

// A bigger illustrated wheelie bin for content use (showing which physical
// bin a colour belongs to) — not used as the site logo.
function binIllustration(color, size = 72) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="50" cy="93" rx="26" ry="4" fill="black" opacity="0.06"/>
      <rect x="34" y="8" width="32" height="9" rx="3" fill="${color}"/>
      <path d="M24 20a4 4 0 0 1 4-4h44a4 4 0 0 1 4 4v6H24v-6Z" fill="${color}"/>
      <path d="M26 26h48l-4.2 60.5A6 6 0 0 1 63.8 92H36.2a6 6 0 0 1-6-5.5L26 26Z" fill="${color}"/>
      <path d="M26 26h48l-1 14H27l-1-14Z" fill="black" opacity="0.12"/>
      <rect x="42" y="34" width="4" height="48" rx="2" fill="white" opacity="0.3"/>
      <rect x="54" y="34" width="4" height="48" rx="2" fill="white" opacity="0.3"/>
      <circle cx="38" cy="93" r="5" fill="#2b2b2f"/>
      <circle cx="62" cy="93" r="5" fill="#2b2b2f"/>
    </svg>
  `;
}

module.exports = { colorDot, binIllustration };
