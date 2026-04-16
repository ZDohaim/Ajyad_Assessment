import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data: companies, error } = await supabase
    .from("company")
    .select("id, name, sector, region")
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const enriched = await Promise.all(
    (companies || []).map(async (company) => {
      const { data: proposals } = await supabase
        .from("proposal")
        .select("bid_amount, is_winner, rank")
        .eq("company_id", company.id);

      const total = proposals?.length ?? 0;
      const wins = proposals?.filter((p) => p.is_winner).length ?? 0;
      const avg_bid =
        total > 0
          ? (proposals || []).reduce((s, p) => s + Number(p.bid_amount), 0) / total
          : 0;
      const ranked = (proposals || []).filter((p) => p.rank !== null);
      const avg_rank =
        ranked.length > 0
          ? ranked.reduce((s, p) => s + (p.rank ?? 0), 0) / ranked.length
          : null;

      return {
        ...company,
        total_participations: total,
        total_wins: wins,
        win_rate: total > 0 ? wins / total : 0,
        avg_bid,
        avg_rank,
      };
    })
  );

  return NextResponse.json(enriched);
}
