import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { openrouter, FALLBACK_MODEL, MODEL, hasAiKey } from "@/lib/openrouter";

function shouldRetryWithFallback(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const maybeError = error as {
    status?: number;
    code?: number | string;
    message?: string;
  };

  return (
    maybeError.status === 404 ||
    maybeError.code === 404 ||
    maybeError.message?.includes("No endpoints found") === true
  );
}

async function createInsightStream(prompt: string) {
  try {
    return await openrouter.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      stream: true,
      max_tokens: 300,
    });
  } catch (error) {
    if (MODEL !== FALLBACK_MODEL && shouldRetryWithFallback(error)) {
      return openrouter.chat.completions.create({
        model: FALLBACK_MODEL,
        messages: [{ role: "user", content: prompt }],
        stream: true,
        max_tokens: 300,
      });
    }

    throw error;
  }
}

// GET — returns pre-computed insight data
export async function GET() {
  const supabase = await createClient();

  // 1. Persistent losers: >5 participations, <20% win rate
  const { data: companies } = await supabase
    .from("company")
    .select("id, name");

  const loserStats = await Promise.all(
    (companies || []).map(async (c) => {
      const { data: proposals } = await supabase
        .from("proposal")
        .select("bid_amount, is_winner")
        .eq("company_id", c.id);

      const total = proposals?.length ?? 0;
      const wins = proposals?.filter((p) => p.is_winner).length ?? 0;
      const avg_bid =
        total > 0
          ? (proposals || []).reduce((s, p) => s + Number(p.bid_amount), 0) / total
          : 0;

      return {
        company_id: c.id,
        company_name: c.name,
        participations: total,
        wins,
        win_rate: total > 0 ? wins / total : 0,
        avg_bid,
      };
    })
  );

  const persistent_losers = loserStats
    .filter((c) => c.participations > 5 && c.win_rate < 0.2)
    .sort((a, b) => b.participations - a.participations)
    .slice(0, 10);

  // 2. Non-lowest winners: winner had rank > 1
  const { data: nonLowestProps } = await supabase
    .from("proposal")
    .select("tender_id, bid_amount, is_winner, rank, company:company(name)")
    .eq("is_winner", true)
    .gt("rank", 1);

  const non_lowest_winners = await Promise.all(
    (nonLowestProps || []).map(async (p) => {
      const { data: tender } = await supabase
        .from("tender")
        .select("title, agency")
        .eq("id", p.tender_id)
        .single();

      const { data: allBids } = await supabase
        .from("proposal")
        .select("bid_amount")
        .eq("tender_id", p.tender_id)
        .order("bid_amount", { ascending: true })
        .limit(1);

      const lowest_bid = Number(allBids?.[0]?.bid_amount ?? p.bid_amount);
      const winning_bid = Number(p.bid_amount);
      const diff = ((winning_bid - lowest_bid) / lowest_bid) * 100;

      return {
        tender_id: p.tender_id,
        title: tender?.title ?? "Unknown",
        agency: tender?.agency ?? "Unknown",
        lowest_bid,
        winning_bid,
        winner_name: (p.company as unknown as { name: string } | null)?.name ?? "Unknown",
        difference_pct: diff,
      };
    })
  );

  // 3. High variance agencies
  const { data: awardedTenders } = await supabase
    .from("tender")
    .select("id, agency")
    .eq("status", "awarded");

  const agencySpread: Record<string, number[]> = {};

  await Promise.all(
    (awardedTenders || []).map(async (t) => {
      const { data: bids } = await supabase
        .from("proposal")
        .select("bid_amount")
        .eq("tender_id", t.id);

      if (!bids || bids.length < 2) return;
      const amounts = bids.map((b) => Number(b.bid_amount));
      const min = Math.min(...amounts);
      const max = Math.max(...amounts);
      const spread_pct = min > 0 ? ((max - min) / min) * 100 : 0;

      if (!agencySpread[t.agency]) agencySpread[t.agency] = [];
      agencySpread[t.agency].push(spread_pct);
    })
  );

  const high_variance_agencies = Object.entries(agencySpread)
    .map(([agency, spreads]) => ({
      agency,
      tender_count: spreads.length,
      avg_spread_pct: spreads.reduce((a, b) => a + b, 0) / spreads.length,
      max_spread_pct: Math.max(...spreads),
    }))
    .sort((a, b) => b.avg_spread_pct - a.avg_spread_pct)
    .slice(0, 10);

  return NextResponse.json({
    persistent_losers,
    non_lowest_winners: non_lowest_winners.slice(0, 10),
    high_variance_agencies,
  });
}

// POST — generate AI narrative
export async function POST(request: NextRequest) {
  if (!hasAiKey()) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY not configured" },
      { status: 503 }
    );
  }

  const { type, data } = await request.json();

  const prompts: Record<string, string> = {
    losers: `You are a procurement market analyst. Write in a clear, natural, human tone. Be concise, straightforward, and grounded in the data. Start with a quick 1-sentence summary, then add 2-3 short sentences of explanation. Avoid robotic phrasing, filler, and em dashes.
Here are companies that bid frequently but rarely win:
${JSON.stringify(data.slice(0, 5), null, 2)}

Explain what this pattern usually indicates in public procurement markets and what these companies may be doing wrong.`,

    nonlowest: `You are a procurement market analyst. Write in a clear, natural, human tone. Be concise, straightforward, and grounded in the data. Start with a quick 1-sentence summary, then add 2-3 short sentences of explanation. Avoid robotic phrasing, filler, and em dashes.
Here are public tenders where the lowest bid did NOT win:
${JSON.stringify(data.slice(0, 5), null, 2)}

Explain which non-price factors are most likely driving these decisions and what this means for companies bidding in these sectors.`,

    variance: `You are a procurement market analyst. Write in a clear, natural, human tone. Be concise, straightforward, and grounded in the data. Start with a quick 1-sentence summary, then add 2-3 short sentences of explanation. Avoid robotic phrasing, filler, and em dashes.
These agencies show high price variance across their tenders:
${JSON.stringify(data.slice(0, 5), null, 2)}

Explain what high price variance suggests about these agencies' evaluation processes and how bidders should adapt.`,
  };

  const prompt = prompts[type];
  if (!prompt) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  try {
    const stream = await createInsightStream(prompt);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || "";
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Failed to generate insights narrative", error);

    return NextResponse.json(
      {
        error:
          "AI insight generation failed. Check OPENROUTER_MODEL or provider availability.",
      },
      { status: 502 }
    );
  }
}
