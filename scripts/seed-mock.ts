/**
 * Mock seed script — generates realistic procurement data
 * Run: npx tsx scripts/seed-mock.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local
function loadEnv() {
  try {
    const env = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
    for (const line of env.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [key, ...rest] = trimmed.split("=");
      if (key && rest.length > 0) {
        process.env[key.trim()] = rest.join("=").trim();
      }
    }
  } catch {
    // .env.local not found, use existing env vars
  }
}

loadEnv();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

faker.seed(42);

const SECTORS = ["IT", "Construction", "Healthcare", "Transport", "Energy", "Consulting", "Facilities", "Defence"];
const AGENCIES = [
  "Ministry of Health",
  "Ministry of Education",
  "Ministry of Finance",
  "National Roads Authority",
  "State IT Agency",
  "Regional Water Authority",
  "Public Transport Corp",
  "National Defence Procurement",
  "Municipal Services Office",
  "Energy Regulatory Authority",
  "Digital Government Authority",
  "Saudi Aramco Supply",
];
const REGIONS = ["Riyadh", "Jeddah", "Dammam", "Mecca", "Medina", "Tabuk"];

async function seed() {
  console.log("[seed] Starting seed...");

  // Clear existing data
  console.log("Clearing existing data...");
  await supabase.from("proposal").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("tender").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("company").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // Create companies
  console.log("Creating companies...");
  const companyTiers: Record<string, number> = {};
  const companies = Array.from({ length: 45 }, () => {
    const name = faker.company.name();
    const sector = faker.helpers.arrayElement(SECTORS);
    const tier = faker.helpers.weightedArrayElement([
      { value: 1, weight: 10 }, // high win rate
      { value: 2, weight: 20 }, // medium win rate
      { value: 3, weight: 15 }, // low win rate
    ]);
    companyTiers[name] = tier;
    return {
      name,
      sector,
      region: faker.helpers.arrayElement(REGIONS),
    };
  });

  const { data: insertedCompanies, error: compError } = await supabase
    .from("company")
    .insert(companies)
    .select("id, name, sector");

  if (compError) throw compError;
  console.log(`[ok] ${insertedCompanies?.length} companies created`);

  // Create tenders
  console.log("Creating tenders...");
  const now = new Date();

  const tenders = Array.from({ length: 160 }, (_, i) => {
    const sector = faker.helpers.arrayElement(SECTORS);
    const agency = faker.helpers.arrayElement(AGENCIES);
    const status: "active" | "awarded" | "expired" =
      i < 50 ? "active" : i < 120 ? "awarded" : "expired";

    const publishedDaysAgo = faker.number.int({ min: 30, max: 365 });
    const published = new Date(now);
    published.setDate(published.getDate() - publishedDaysAgo);

    const deadlineDaysFromPublished = faker.number.int({ min: 30, max: 90 });
    const deadline = new Date(published);
    deadline.setDate(deadline.getDate() + deadlineDaysFromPublished);

    const awardedAt =
      status === "awarded"
        ? new Date(deadline.getTime() + faker.number.int({ min: 7, max: 30 }) * 86400000)
        : null;

    const estimatedValue = (() => {
      const ranges: Record<string, [number, number]> = {
        IT: [50000, 2000000],
        Construction: [500000, 50000000],
        Healthcare: [100000, 5000000],
        Transport: [200000, 10000000],
        Energy: [300000, 20000000],
        Consulting: [30000, 1000000],
        Facilities: [50000, 2000000],
        Defence: [500000, 30000000],
      };
      const [min, max] = ranges[sector] ?? [50000, 5000000];
      return faker.number.int({ min, max });
    })();

    return {
      title: `${faker.word.adjective()} ${sector} ${faker.helpers.arrayElement(["System", "Infrastructure", "Services", "Platform", "Solution", "Programme", "Framework", "Contract"])} Procurement`,
      agency,
      sector,
      region: faker.helpers.arrayElement(REGIONS),
      status,
      published_at: published.toISOString(),
      deadline: deadline.toISOString(),
      awarded_at: awardedAt?.toISOString() ?? null,
      description: faker.lorem.sentences(2),
      estimated_value: estimatedValue,
    };
  });

  const { data: insertedTenders, error: tenderError } = await supabase
    .from("tender")
    .insert(tenders)
    .select("id, status, estimated_value, sector");

  if (tenderError) throw tenderError;
  console.log(`[ok] ${insertedTenders?.length} tenders created`);

  // Create proposals for non-active tenders
  console.log("Creating proposals...");
  const allProposals = [];

  for (const tender of insertedTenders?.filter((t) => t.status !== "active") ?? []) {
    const numBidders = faker.number.int({ min: 2, max: 10 });

    // Pick random companies (prefer matching sector)
    const sectorCompanies = insertedCompanies?.filter((c) => c.sector === tender.sector) ?? [];
    const otherCompanies = insertedCompanies?.filter((c) => c.sector !== tender.sector) ?? [];
    const pool = [...sectorCompanies, ...otherCompanies];
    const picked = faker.helpers.shuffle(pool).slice(0, numBidders);

    if (picked.length === 0) continue;

    const baseValue = Number(tender.estimated_value) || 1000000;

    // Generate bids
    const bids = picked.map((company) => {
      const tier = companyTiers[company.name] ?? 2;
      const tierFactor = tier === 1 ? 0.85 : tier === 2 ? 1.0 : 1.15;
      const bid = baseValue * tierFactor * faker.number.float({ min: 0.75, max: 1.25 });
      return { company_id: company.id, bid: Math.round(bid) };
    });

    // Sort by bid ascending to assign ranks
    bids.sort((a, b) => a.bid - b.bid);

    // Determine winner: 70% = lowest, 20% = second, 10% = random
    let winnerIndex = 0;
    const roll = faker.number.float();
    if (roll > 0.9 && bids.length > 2) {
      winnerIndex = faker.number.int({ min: 2, max: bids.length - 1 });
    } else if (roll > 0.7 && bids.length > 1) {
      winnerIndex = 1;
    }

    for (let i = 0; i < bids.length; i++) {
      allProposals.push({
        tender_id: tender.id,
        company_id: bids[i].company_id,
        bid_amount: bids[i].bid,
        is_winner: i === winnerIndex,
        rank: i + 1,
        submitted_at: new Date(
          Date.now() - faker.number.int({ min: 1, max: 60 }) * 86400000
        ).toISOString(),
      });
    }
  }

  // Batch insert proposals
  const BATCH = 500;
  for (let i = 0; i < allProposals.length; i += BATCH) {
    const batch = allProposals.slice(i, i + BATCH);
    const { error } = await supabase.from("proposal").insert(batch);
    if (error) throw error;
  }

  console.log(`[ok] ${allProposals.length} proposals created`);
  console.log("\n[done] Seed complete!");
  console.log(`\nDemo login: create an account at /register`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
