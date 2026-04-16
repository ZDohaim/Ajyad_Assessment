/**
 * Dataset import script
 * Run: npx tsx scripts/import.ts ./path/to/dataset.csv
 *      npx tsx scripts/import.ts ./path/to/dataset.json
 *
 * Edit the COLUMN_MAP below to match your dataset's column names.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, extname } from "path";

// Load .env.local
function loadEnv() {
  try {
    const env = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
    for (const line of env.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [key, ...rest] = trimmed.split("=");
      if (key && rest.length > 0) process.env[key.trim()] = rest.join("=").trim();
    }
  } catch { /* ignore */ }
}

loadEnv();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * EDIT THIS MAP to match your dataset's column names.
 * Left = field in TenderTrack DB, Right = column name in your file
 *
 * Set to null if the field doesn't exist in your dataset.
 */
const COLUMN_MAP = {
  // Tender fields
  tender_title: "title",         // required
  tender_agency: "agency",       // required
  tender_sector: "sector",       // required
  tender_region: "region",       // required
  tender_status: "status",       // "active" | "awarded" | "expired"
  tender_deadline: "deadline",   // ISO date string or parseable date
  tender_published: "published_at",
  tender_estimated_value: "estimated_value",
  tender_description: "description",

  // Company fields
  company_name: "vendor_name",   // required

  // Proposal fields
  bid_amount: "bid_amount",      // required (number)
  is_winner: "is_winner",        // boolean or "true"/"false"/"1"/"0"
};

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

function get(row: Record<string, string>, field: string | null): string | null {
  if (!field) return null;
  return row[field] ?? null;
}

function parseBool(v: string | null): boolean {
  if (!v) return false;
  return v === "1" || v.toLowerCase() === "true" || v.toLowerCase() === "yes";
}

async function importData(filePath: string) {
  console.log(`\n[file] Reading ${filePath}...`);
  const content = readFileSync(resolve(process.cwd(), filePath), "utf-8");
  const ext = extname(filePath).toLowerCase();

  let rows: Record<string, string>[];
  if (ext === ".json") {
    const parsed = JSON.parse(content);
    rows = Array.isArray(parsed) ? parsed : parsed.data ?? parsed.rows ?? [];
  } else {
    rows = parseCSV(content);
  }

  console.log(`Found ${rows.length} rows`);
  if (rows.length === 0) {
    console.error("No rows found. Check your file format.");
    process.exit(1);
  }

  // Show first row for verification
  console.log("\nFirst row sample:");
  console.log(JSON.stringify(rows[0], null, 2));
  console.log("\nMapping columns:");
  Object.entries(COLUMN_MAP).forEach(([field, col]) => {
    if (col) console.log(`  ${field} ← "${col}" = "${rows[0]?.[col] ?? "NOT FOUND"}"`);
  });

  console.log("\nProceeding with import...\n");

  // Collect unique companies
  const companyMap = new Map<string, string>(); // name → id
  const uniqueCompanyNames = [...new Set(
    rows.map((r) => get(r, COLUMN_MAP.company_name)).filter(Boolean) as string[]
  )];

  for (const name of uniqueCompanyNames) {
    const { data, error } = await supabase
      .from("company")
      .upsert({ name }, { onConflict: "name" })
      .select("id")
      .single();
    if (!error && data) companyMap.set(name, data.id);
  }
  console.log(`[ok] ${companyMap.size} companies upserted`);

  // Collect unique tenders
  const tenderMap = new Map<string, string>(); // title → id
  const uniqueTitles = [...new Set(
    rows.map((r) => get(r, COLUMN_MAP.tender_title)).filter(Boolean) as string[]
  )];

  for (const title of uniqueTitles) {
    const sampleRow = rows.find((r) => get(r, COLUMN_MAP.tender_title) === title)!;
    const { data, error } = await supabase
      .from("tender")
      .upsert({
        title,
        agency: get(sampleRow, COLUMN_MAP.tender_agency) ?? "Unknown",
        sector: get(sampleRow, COLUMN_MAP.tender_sector) ?? "General",
        region: get(sampleRow, COLUMN_MAP.tender_region) ?? "Unknown",
        status: (get(sampleRow, COLUMN_MAP.tender_status) ?? "awarded") as "active" | "awarded" | "expired",
        deadline: get(sampleRow, COLUMN_MAP.tender_deadline),
        published_at: get(sampleRow, COLUMN_MAP.tender_published),
        estimated_value: get(sampleRow, COLUMN_MAP.tender_estimated_value)
          ? Number(get(sampleRow, COLUMN_MAP.tender_estimated_value))
          : null,
        description: get(sampleRow, COLUMN_MAP.tender_description),
      }, { onConflict: "title" })
      .select("id")
      .single();
    if (!error && data) tenderMap.set(title, data.id);
  }
  console.log(`[ok] ${tenderMap.size} tenders upserted`);

  // Import proposals
  let proposalCount = 0;
  for (const row of rows) {
    const title = get(row, COLUMN_MAP.tender_title);
    const vendorName = get(row, COLUMN_MAP.company_name);
    const bidAmountStr = get(row, COLUMN_MAP.bid_amount);

    if (!title || !vendorName || !bidAmountStr) continue;

    const tenderId = tenderMap.get(title);
    const companyId = companyMap.get(vendorName);
    if (!tenderId || !companyId) continue;

    const { error } = await supabase.from("proposal").insert({
      tender_id: tenderId,
      company_id: companyId,
      bid_amount: Number(bidAmountStr.replace(/[^0-9.]/g, "")),
      is_winner: parseBool(get(row, COLUMN_MAP.is_winner)),
    });

    if (!error) proposalCount++;
  }
  console.log(`[ok] ${proposalCount} proposals imported`);

  // Fix ranks
  console.log("Computing ranks...");
  const { data: tenders } = await supabase.from("tender").select("id");
  for (const t of tenders ?? []) {
    const { data: props } = await supabase
      .from("proposal")
      .select("id, bid_amount")
      .eq("tender_id", t.id)
      .order("bid_amount", { ascending: true });

    for (let i = 0; i < (props?.length ?? 0); i++) {
      await supabase.from("proposal").update({ rank: i + 1 }).eq("id", props![i].id);
    }
  }

  console.log("\n[done] Import complete!");
}

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: npx tsx scripts/import.ts ./path/to/dataset.csv");
  process.exit(1);
}

importData(filePath).catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
