function renderLookupWidget({ defaultPostcode = "" } = {}) {
  return `
    <form id="postcode-form" class="lookup-form" autocomplete="off">
      <label class="sr-only" for="postcode">Postcode</label>
      <input id="postcode" name="postcode" type="text" inputmode="text" placeholder="e.g. SW1 1AA" value="${defaultPostcode}" required />
      <button type="submit">Find addresses</button>
    </form>

    <p id="status-line" class="status-line" hidden></p>

    <div id="address-block" class="field-block" hidden>
      <label for="address-select">Your address</label>
      <select id="address-select"></select>
    </div>

    <div id="results" class="results" hidden></div>
  `;
}

module.exports = { renderLookupWidget };
