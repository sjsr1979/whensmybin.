const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const councils = require("./data/councils");
const { renderHome, renderCouncilPage, renderTownPage } = require("./lib/pages");

const PORT = 4173;
const PUBLIC_DIR = path.join(__dirname, "public");

const BIN_META = {
  "Empty Standard General Waste": { label: "General waste", color: "#2b2b2f", key: "general" },
  "Empty Standard Mixed Recycling": { label: "Recycling", color: "#9aa0a6", key: "recycling" },
  "Empty Bin Standard Garden Waste": { label: "Garden waste", color: "#3f7d42", key: "garden" },
};

function binMetaFor(name, jobDescription) {
  if (BIN_META[name]) return BIN_META[name];
  const desc = (jobDescription || "").toUpperCase();
  if (desc.includes("BLACK")) return { label: name, color: "#2b2b2f", key: "general" };
  if (desc.includes("SILVER")) return { label: name, color: "#9aa0a6", key: "recycling" };
  if (desc.includes("GREEN")) return { label: name, color: "#3f7d42", key: "garden" };
  return { label: name, color: "#6b7280", key: "other" };
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        { headers: { "User-Agent": "Mozilla/5.0 bin-day-clone/1.0", Accept: "application/json" } },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              resolve(JSON.parse(data));
            } catch (err) {
              reject(err);
            }
          });
        }
      )
      .on("error", reject);
  });
}

function getText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0 bin-day-clone/1.0" } }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

async function resolveCouncil(postcode) {
  const clean = encodeURIComponent(postcode.replace(/\s+/g, ""));
  const json = await getJson(`https://api.postcodes.io/postcodes/${clean}`);
  if (json.status !== 200 || !json.result) return null;
  return {
    postcode: json.result.postcode,
    council: json.result.admin_district,
  };
}

async function fetchAddresses(postcode) {
  const url = `https://online.cheshireeast.gov.uk/MyCollectionDay/SearchByAjax/Search?postcode=${encodeURIComponent(
    postcode
  )}&propertyname=`;
  const html = await getText(url);
  const addresses = [];
  const re = /data-uprn="(\d+)"[^>]*>([^<]+)</g;
  let m;
  while ((m = re.exec(html))) {
    addresses.push({ uprn: m[1], address: m[2].trim() });
  }
  return addresses;
}

async function fetchCollections(uprn, onelineaddress) {
  const url = `https://online.cheshireeast.gov.uk/MyCollectionDay/SearchByAjax/GetBartecJobList?uprn=${encodeURIComponent(
    uprn
  )}&onelineaddress=${encodeURIComponent(onelineaddress)}`;
  const html = await getText(url);

  const rows = html.split('<tr class="data-row');
  const jobs = [];
  for (const row of rows.slice(1)) {
    const nameMatch = row.match(/\.Name"[^>]*value="([^"]*)"/);
    const startMatch = row.match(/\.ScheduledStart"[^>]*value="([^"]*)"/);
    const descMatch = row.match(/\.JobDescription"[^>]*value="([^"]*)"/);
    if (!nameMatch || !startMatch) continue;

    const [datePart, timePart] = startMatch[1].split(" ");
    const [dd, mm, yyyy] = datePart.split("/").map(Number);
    const date = new Date(yyyy, mm - 1, dd, ...(timePart || "0:0:0").split(":").map(Number));

    jobs.push({
      name: nameMatch[1],
      jobDescription: descMatch ? descMatch[1] : "",
      date,
    });
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const nextByType = new Map();
  for (const job of jobs) {
    if (job.date < now) continue;
    const existing = nextByType.get(job.name);
    if (!existing || job.date < existing.date) {
      nextByType.set(job.name, job);
    }
  }

  const results = Array.from(nextByType.values())
    .map((job) => {
      const meta = binMetaFor(job.name, job.jobDescription);
      return {
        label: meta.label,
        color: meta.color,
        date: job.date.toISOString().slice(0, 10),
        dayName: job.date.toLocaleDateString("en-GB", { weekday: "long" }),
        dayShort: job.date.toLocaleDateString("en-GB", { day: "numeric", month: "long" }),
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return results;
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

function serveStatic(req, res) {
  let filePath = path.join(PUBLIC_DIR, req.url === "/" ? "index.html" : req.url);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end("Not found");
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
    res.end(data);
  });
}

function sendJson(res, status, obj) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(obj));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  try {
    if (url.pathname === "/") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(renderHome());
    }

    const councilMatch = url.pathname.match(/^\/council\/([^/]+)\/?$/);
    if (councilMatch) {
      const council = councils.findBySlug(councilMatch[1]);
      if (!council) {
        res.writeHead(404);
        return res.end("Council not found");
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(renderCouncilPage(council));
    }

    const townMatch = url.pathname.match(/^\/council\/([^/]+)\/([^/]+)\/?$/);
    if (townMatch) {
      const council = councils.findBySlug(townMatch[1]);
      const town = council && council.towns && council.towns.find((t) => t.slug === townMatch[2]);
      if (!council || !town) {
        res.writeHead(404);
        return res.end("Not found");
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(renderTownPage(council, town));
    }

    if (url.pathname === "/api/council") {
      const postcode = url.searchParams.get("postcode") || "";
      const result = await resolveCouncil(postcode);
      if (!result) return sendJson(res, 404, { error: "Postcode not found" });
      const supported = result.council === "Cheshire East";
      return sendJson(res, 200, { ...result, supported });
    }

    if (url.pathname === "/api/addresses") {
      const postcode = url.searchParams.get("postcode") || "";
      const addresses = await fetchAddresses(postcode);
      return sendJson(res, 200, { addresses });
    }

    if (url.pathname === "/api/collections") {
      const uprn = url.searchParams.get("uprn") || "";
      const address = url.searchParams.get("address") || "";
      const collections = await fetchCollections(uprn, address);
      return sendJson(res, 200, { collections });
    }

    return serveStatic(req, res);
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: "Something went wrong" });
  }
});

server.listen(PORT, () => {
  console.log(`Bin Day clone running at http://localhost:${PORT}`);
});
