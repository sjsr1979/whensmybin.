// Registry of councils. `supported: true` means the live postcode/address
// lookup is wired up against that council's real bin-collection system.
// Bin contents copy is sourced directly from each council's own published
// waste pages — nothing fabricated. Population is ONS 2021 Census.

module.exports = [
  {
    slug: "cheshire-east",
    name: "Cheshire East",
    supported: true,
    adminDistrict: "Cheshire East", // must match ONS admin_district exactly
    population: "398,800",
    foodWaste: "From Sep 2026",
    intro:
      "Cheshire East collects from three bins on a two-week cycle: a black bin for general waste, a silver bin for mixed recycling, and a green bin for garden and food waste. Recycling and garden bins go out together one week; the black bin follows on its own the next.",
    rota: [
      { week: "Week 1", binKeys: ["general"] },
      { week: "Week 2", binKeys: ["recycling", "garden"] },
    ],
    bins: [
      {
        key: "general",
        label: "Black bin — general waste",
        color: "#2b2b2f",
        summary: "Household waste that can't be recycled. Collected every 2 weeks.",
        goesIn: ["Anything non-recyclable and non-hazardous — try to recycle as much as possible in the silver bin first"],
        doesNotGoIn: [
          "Batteries and electrical items",
          "Asbestos, rubble or bricks",
          "Gas canisters and hazardous aerosols",
          "Knives, syringes or needles",
        ],
      },
      {
        key: "recycling",
        label: "Silver bin — mixed recycling",
        color: "#9aa0a6",
        summary: "Paper, card, plastics, cans and glass together, left loose. Collected every 2 weeks, opposite week to the black bin.",
        goesIn: [
          "Cardboard, paper, newspapers and magazines",
          "Cartons (juice, food, milk)",
          "Glass bottles and jars",
          "Plastic bottles, tubs, trays and bags",
          "Tins, cans and clean foil",
          "Empty non-hazardous aerosols",
        ],
        doesNotGoIn: [
          "Food waste (goes in the garden/food bin)",
          "Nappies, textiles, carpets",
          "Polystyrene and hard plastics",
          "Tied bin bags — leave items loose",
        ],
      },
      {
        key: "garden",
        label: "Green bin — garden & food waste",
        color: "#3f7d42",
        summary: "Subscription service only — collected the same week as recycling if you're signed up to the garden waste scheme.",
        goesIn: [
          "Grass cuttings, leaves, hedge clippings",
          "Flowers, plants and twigs",
          "Food waste including meat, fish, bones and peelings",
          "Tea bags and coffee grounds",
        ],
        doesNotGoIn: ["Soil, rubble and stone", "Plastic plant pots and bags", "Animal waste", "Liquid cooking fat or oil"],
      },
    ],
    notes: [
      "Bins go out by 6:30am on your collection day.",
      "Bank holidays don't usually shift the schedule, except Christmas Day, Boxing Day and New Year's Day.",
      "Missed one? Report it the same day rather than leaving the bin out — call 0300 123 5011 or use the council's online form.",
    ],
    faqs: [
      {
        q: "Why is my bin only collected every two weeks?",
        a: "Cheshire East runs everything on a two-week cycle: the black bin one week, silver recycling and (if you subscribe) the green bin the next. It alternates every week, borough-wide.",
      },
      {
        q: "When does the separate food waste caddy start?",
        a: "It doesn't exist yet — Cheshire East is introducing a weekly food waste collection by mid-September 2026. Until then, food waste goes in the green bin if you're subscribed to garden waste, or the black bin if you're not.",
      },
      {
        q: "I don't pay for garden waste collection — what do I do with food waste?",
        a: "For now it goes in your general waste bin, or you can compost at home. Cheshire East publishes alternative options on their site for households without a garden waste subscription.",
        link: { label: "Alternatives to the garden waste scheme", url: "https://www.cheshireeast.gov.uk/waste_and_recycling/bins/garden-waste-recycling-scheme/alternative-options-for-garden-waste.aspx" },
      },
      {
        q: "Does Christmas change the schedule?",
        a: "Yes, most years — but the exact revised dates are only published closer to the time. The lookup above will always reflect whatever Cheshire East currently has live.",
      },
    ],
    contactPhone: "0300 123 5011",
    officialUrl: "https://www.cheshireeast.gov.uk/waste_and_recycling/bins/bin-collection-days.aspx",
    towns: [
      {
        slug: "holmes-chapel",
        name: "Holmes Chapel",
        blurb:
          "A large village in Cheshire East on the River Dane, between Middlewich and Congleton. Bin collections follow the standard Cheshire East fortnightly cycle.",
      },
      {
        slug: "brereton",
        name: "Brereton",
        blurb:
          "The parish of Brereton (including Brereton Green and Smethwick Green) sits just south of Sandbach in Cheshire East, on the same fortnightly collection cycle as the rest of the borough.",
      },
      {
        slug: "middlewich",
        name: "Middlewich",
        blurb:
          "A historic salt town in Cheshire East at the meeting point of the Trent & Mersey and Shropshire Union canals. Bin collections follow the standard Cheshire East fortnightly cycle.",
      },
    ],
  },
];

function findBySlug(slug) {
  return module.exports.find((c) => c.slug === slug);
}

module.exports.findBySlug = findBySlug;
