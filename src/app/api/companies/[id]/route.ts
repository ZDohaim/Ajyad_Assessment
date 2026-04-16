import { createClient } from "@/lib/supabase/server";
import { BidOutcomeDistribution } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: company, error } = await supabase
    .from("company")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  const { data: proposals } = await supabase
    .from("proposal")
    .select("*, tender:tender(id, title, agency, sector, status, deadline)")
    .eq("company_id", id)
    .order("submitted_at", { ascending: false });

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

  const tenderIds = Array.from(
    new Set((proposals || []).map((proposal) => proposal.tender_id).filter(Boolean))
  );

  let distribution: BidOutcomeDistribution = {
    evaluated_count: 0,
    unevaluable_count: 0,
    buckets: [
      {
        key: "won",
        label: "Won",
        description: "Awarded proposal",
        count: wins,
        percentage: 0,
      },
      {
        key: "lowest_lost",
        label: "Lowest bid, lost",
        description: "Lowest priced offer that still lost",
        count: 0,
        percentage: 0,
      },
      {
        key: "close_lost",
        label: "Close to winner, lost",
        description: "Losing bid within 10% of the winner",
        count: 0,
        percentage: 0,
      },
      {
        key: "far_lost",
        label: "Far above winner",
        description: "Losing bid more than 10% above the winner",
        count: 0,
        percentage: 0,
      },
    ],
  };

  if (tenderIds.length > 0) {
    const { data: tenderProposals } = await supabase
      .from("proposal")
      .select("tender_id, bid_amount, is_winner, rank")
      .in("tender_id", tenderIds);

    type TenderProposal = NonNullable<typeof tenderProposals>[number];
    const proposalsByTender = new Map<string, TenderProposal[]>();
    for (const proposal of tenderProposals || []) {
      const current = proposalsByTender.get(proposal.tender_id) || [];
      current.push(proposal);
      proposalsByTender.set(proposal.tender_id, current);
    }

    const bucketCounts = {
      won: wins,
      lowest_lost: 0,
      close_lost: 0,
      far_lost: 0,
    };

    let evaluatedCount = 0;
    let unevaluableCount = 0;

    for (const proposal of proposals || []) {
      if (proposal.is_winner) {
        evaluatedCount += 1;
        continue;
      }

      const competitors = proposalsByTender.get(proposal.tender_id) || [];
      if (competitors.length <= 1) {
        unevaluableCount += 1;
        continue;
      }

      const numericBids = competitors
        .map((item) => Number(item.bid_amount))
        .filter((amount) => Number.isFinite(amount) && amount > 0);

      const minBid =
        numericBids.length > 0 ? Math.min(...numericBids) : null;
      const winner = competitors.find((item) => item.is_winner);
      const winningBid =
        winner && Number.isFinite(Number(winner.bid_amount)) && Number(winner.bid_amount) > 0
          ? Number(winner.bid_amount)
          : null;

      const currentBid = Number(proposal.bid_amount);
      if (!Number.isFinite(currentBid) || currentBid <= 0 || minBid === null || winningBid === null) {
        unevaluableCount += 1;
        continue;
      }

      evaluatedCount += 1;

      if (currentBid === minBid) {
        bucketCounts.lowest_lost += 1;
        continue;
      }

      const deltaPct = (currentBid - winningBid) / winningBid;
      if (deltaPct <= 0.1) {
        bucketCounts.close_lost += 1;
        continue;
      }

      bucketCounts.far_lost += 1;
    }

    distribution = {
      evaluated_count: evaluatedCount,
      unevaluable_count: unevaluableCount,
      buckets: distribution.buckets.map((bucket) => ({
        ...bucket,
        count: bucketCounts[bucket.key],
        percentage: evaluatedCount > 0 ? bucketCounts[bucket.key] / evaluatedCount : 0,
      })),
    };
  }

  return NextResponse.json({
    ...company,
    total_participations: total,
    total_wins: wins,
    win_rate: total > 0 ? wins / total : 0,
    avg_bid,
    avg_rank,
    bid_distribution: distribution,
    proposals: proposals || [],
  });
}
