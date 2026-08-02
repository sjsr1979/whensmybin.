const form = document.getElementById("postcode-form");
const postcodeInput = document.getElementById("postcode");
const statusLine = document.getElementById("status-line");
const addressBlock = document.getElementById("address-block");
const addressSelect = document.getElementById("address-select");
const resultsEl = document.getElementById("results");
const submitBtn = form.querySelector("button");

function setStatus(text, isError = false) {
  statusLine.textContent = text;
  statusLine.hidden = !text;
  statusLine.classList.toggle("error", isError);
  statusLine.classList.remove("confirm");
}

function resetDownstream() {
  addressBlock.hidden = true;
  addressSelect.innerHTML = "";
  resultsEl.hidden = true;
  resultsEl.innerHTML = "";
}

function colorDot(color, size = 22) {
  return `<span class="color-dot" style="width:${size}px;height:${size}px;background:${color}"></span>`;
}

function relativeLabel(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr);
  const diffDays = Math.round((date - today) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays > 1 && diffDays < 7) return `In ${diffDays} days`;
  return null;
}

function currentCouncilSlug() {
  const match = window.location.pathname.match(/^\/council\/([^/]+)/);
  return match ? match[1] : null;
}

async function lookupAddresses(postcode) {
  submitBtn.disabled = true;
  setStatus("Finding addresses…");

  try {
    const addrRes = await fetch(`/api/addresses?postcode=${encodeURIComponent(postcode)}`);
    const addrData = await addrRes.json();

    if (!addrData.addresses || addrData.addresses.length === 0) {
      setStatus("No addresses found for that postcode.", true);
      return;
    }

    setStatus("");
    addressSelect.innerHTML =
      `<option value="">Select your address</option>` +
      addrData.addresses
        .map((a) => `<option value="${a.uprn}" data-address="${encodeURIComponent(a.address)}">${a.address}</option>`)
        .join("");
    addressBlock.hidden = false;
  } catch (err) {
    console.error(err);
    setStatus("Something went wrong. Try again.", true);
  } finally {
    submitBtn.disabled = false;
  }
}

async function handlePostcode(postcode) {
  resetDownstream();
  submitBtn.disabled = true;
  setStatus("Looking up your council…");

  try {
    const councilRes = await fetch(`/api/council?postcode=${encodeURIComponent(postcode)}`);
    const councilData = await councilRes.json();

    if (!councilRes.ok) {
      setStatus("Couldn't find that postcode. Check it and try again.", true);
      return;
    }

    if (!councilData.slug) {
      setStatus(`${postcode.toUpperCase()} is in ${councilData.council}. We don't have this council on the site yet.`, true);
      return;
    }

    if (councilData.slug !== currentCouncilSlug()) {
      window.location.href = `/council/${councilData.slug}?postcode=${encodeURIComponent(postcode)}`;
      return;
    }

    if (!councilData.supported) {
      if (councilData.officialUrl) {
        statusLine.innerHTML = `${postcode.toUpperCase()} is in <strong>${councilData.council}</strong>. <a class="confirm-link" href="${councilData.officialUrl}" target="_blank" rel="noreferrer">Go to ${councilData.council}'s official bin checker →</a>`;
      } else {
        statusLine.textContent = `${postcode.toUpperCase()} is in ${councilData.council}.`;
      }
      statusLine.hidden = false;
      statusLine.classList.remove("error");
      statusLine.classList.add("confirm");
      return;
    }

    await lookupAddresses(postcode);
  } catch (err) {
    console.error(err);
    setStatus("Something went wrong. Try again.", true);
  } finally {
    submitBtn.disabled = false;
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const postcode = postcodeInput.value.trim();
  if (!postcode) return;
  handlePostcode(postcode);
});

addressSelect.addEventListener("change", async () => {
  const uprn = addressSelect.value;
  if (!uprn) {
    resultsEl.hidden = true;
    return;
  }

  const option = addressSelect.selectedOptions[0];
  const address = decodeURIComponent(option.dataset.address);

  resultsEl.hidden = false;
  resultsEl.innerHTML = `<p class="status-line">Loading collection dates…</p>`;

  try {
    const res = await fetch(
      `/api/collections?uprn=${encodeURIComponent(uprn)}&address=${encodeURIComponent(address)}`
    );
    const data = await res.json();

    if (!data.collections || data.collections.length === 0) {
      resultsEl.innerHTML = `<p class="status-line">No upcoming collections found for this address.</p>`;
      return;
    }

    resultsEl.innerHTML = data.collections
      .map((c, i) => {
        const rel = relativeLabel(c.date);
        const badge = rel
          ? `<span class="bin-badge ${i === 0 ? "soonest" : ""}">${rel}</span>`
          : `<span class="bin-badge">${c.dayName}</span>`;
        return `
          <div class="bin-card">
            ${colorDot(c.color, 32)}
            <div class="bin-info">
              <div class="bin-label">${c.label}</div>
              <div class="bin-when">${c.dayName}, ${c.dayShort}</div>
            </div>
            ${badge}
          </div>
        `;
      })
      .join("");
  } catch (err) {
    console.error(err);
    resultsEl.innerHTML = `<p class="status-line">Couldn't load collection dates.</p>`;
  }
});

// If we arrived here with a postcode carried over from another page
// (e.g. redirected from the homepage), pick up where the user left off.
(function autoContinueFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const postcode = params.get("postcode");
  if (!postcode) return;
  postcodeInput.value = postcode;
  handlePostcode(postcode);
})();
