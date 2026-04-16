import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agency = searchParams.get("agency");
  const sector = searchParams.get("sector");
  const region = searchParams.get("region");
  const status = searchParams.get("status");

  const supabase = await createClient();

  let query = supabase
    .from("tender")
    .select("id, title, agency, sector, region, status, published_at, deadline, awarded_at, estimated_value")
    .order("created_at", { ascending: false });

  if (agency) query = query.eq("agency", agency);
  if (sector) query = query.eq("sector", sector);
  if (region) query = query.eq("region", region);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Enrich with bidder counts and winning bids
  const enriched = await Promise.all(
    (data || []).map(async (tender) => {
      const { data: proposals } = await supabase
        .from("proposal")
        .select("bid_amount, is_winner")
        .eq("tender_id", tender.id);

      const bidder_count = proposals?.length ?? 0;
      const winning_bid = proposals?.find((p) => p.is_winner)?.bid_amount ?? null;

      return { ...tender, bidder_count, winning_bid };
    })
  );

  return NextResponse.json(enriched);
}
