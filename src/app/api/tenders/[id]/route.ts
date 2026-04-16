import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: tender, error } = await supabase
    .from("tender")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  const { data: proposals } = await supabase
    .from("proposal")
    .select("*, company:company(id, name, sector, region)")
    .eq("tender_id", id)
    .order("rank", { ascending: true, nullsFirst: false });

  return NextResponse.json({ ...tender, proposals: proposals || [] });
}
