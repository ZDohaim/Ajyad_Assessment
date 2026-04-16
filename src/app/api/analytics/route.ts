import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sector = searchParams.get("sector");
  const agency = searchParams.get("agency");

  const supabase = await createClient();

  // --- Top Companies ---
  let companyQuery = supabase.from("company").select("id, name, sector, region");
  if (sector) companyQuery = companyQuery.eq("sector", sector);

  const { data: companies } = await companyQuery;

  const companyStats = await Promise.all(
    (companies || []).map(async (c) => {
      let pQuery = supabase
        .from("proposal")
        .select("bid_amount, is_winner, rank, tender:tender(agency, sector)")
        .eq("company_id", c.id);

      const { data: proposals } = await pQuery;

      let filtered = proposals || [];
      if (agency) {
        filtered = filtered.filter(
          (p) => (p.tender as unknown as { agency: string } | null)?.agency === agency
        );
      }

      const total = filtered.length;
      const wins = filtered.filter((p) => p.is_winner).length;
      const avg_bid =
        total > 0
          ? filtered.reduce((s, p) => s + Number(p.bid_amount), 0) / total
          : 0;

      return {
        id: c.id,
        name: c.name,
        sector: c.sector,
        region: c.region,
        total_participations: total,
        total_wins: wins,
        win_rate: total > 0 ? wins / total : 0,
        avg_bid,
        avg_rank: null,
      };
    })
  );

  const top_companies = companyStats
    .filter((c) => c.total_participations > 0)
    .sort((a, b) => b.total_wins - a.total_wins)
    .slice(0, 15);

  // --- Competitive Density ---
  const { data: tenders } = await supabase
    .from("tender")
    .select("id, title, agency, sector, status")
    .neq("status", "active");

  const density = await Promise.all(
    (tenders || []).map(async (t) => {
      const { count } = await supabase
        .from("proposal")
        .select("id", { count: "exact", head: true })
        .eq("tender_id", t.id);

      return {
        tender_id: t.id,
        title: t.title,
        agency: t.agency,
        sector: t.sector,
        bidder_count: count ?? 0,
      };
    })
  );

  density.sort((a, b) => b.bidder_count - a.bidder_count);

  // --- Pricing Analysis ---
  const { data: awardedTenders } = await supabase
    .from("tender")
    .select("id, title, agency, sector")
    .eq("status", "awarded");

  const pricing = await Promise.all(
    (awardedTenders || []).map(async (t) => {
      const { data: proposals } = await supabase
        .from("proposal")
        .select("bid_amount, is_winner")
        .eq("tender_id", t.id);

      if (!proposals || proposals.length === 0) return null;

      const bids = proposals.map((p) => Number(p.bid_amount));
      const min_bid = Math.min(...bids);
      const max_bid = Math.max(...bids);
      const winning_bid =
        proposals.find((p) => p.is_winner)?.bid_amount ?? null;
      const spread = max_bid - min_bid;
      const spread_pct = min_bid > 0 ? (spread / min_bid) * 100 : 0;

      return {
        tender_id: t.id,
        title: t.title,
        agency: t.agency,
        sector: t.sector,
        min_bid,
        max_bid,
        winning_bid: winning_bid ? Number(winning_bid) : null,
        spread,
        spread_pct,
      };
    })
  );

  return NextResponse.json({
    top_companies,
    density: density.slice(0, 50),
    pricing: pricing
      .filter(Boolean)
      .sort((a, b) => (b?.spread_pct ?? 0) - (a?.spread_pct ?? 0))
      .slice(0, 50),
  });
}
