export type TenderStatus = "active" | "awarded" | "expired";

export interface Tender {
  id: string;
  title: string;
  agency: string;
  sector: string;
  region: string;
  status: TenderStatus;
  published_at: string | null;
  deadline: string | null;
  awarded_at: string | null;
  description: string | null;
  estimated_value: number | null;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  sector: string | null;
  region: string | null;
  created_at: string;
}

export interface Proposal {
  id: string;
  tender_id: string;
  company_id: string;
  bid_amount: number;
  is_winner: boolean;
  rank: number | null;
  submitted_at: string | null;
}

export interface ProposalWithCompany extends Proposal {
  company: Company;
}

export interface TenderWithProposals extends Tender {
  proposals: ProposalWithCompany[];
  bidder_count: number;
  winning_bid: number | null;
}

export interface CompanyStats {
  id: string;
  name: string;
  sector: string | null;
  region: string | null;
  total_participations: number;
  total_wins: number;
  win_rate: number;
  avg_bid: number;
  avg_rank: number | null;
}

export interface CompanyWithActivity extends CompanyStats {
  recent_proposals: Array<{
    id: string;
    tender_id: string;
    tender_title: string;
    tender_agency: string;
    bid_amount: number;
    is_winner: boolean;
    rank: number | null;
    submitted_at: string | null;
  }>;
}

export interface BidOutcomeDistributionBucket {
  key: "won" | "lowest_lost" | "close_lost" | "far_lost";
  label: string;
  description: string;
  count: number;
  percentage: number;
}

export interface BidOutcomeDistribution {
  evaluated_count: number;
  unevaluable_count: number;
  buckets: BidOutcomeDistributionBucket[];
}

export interface AnalyticsData {
  top_companies: CompanyStats[];
  density: Array<{
    tender_id: string;
    title: string;
    agency: string;
    sector: string;
    bidder_count: number;
  }>;
  pricing: Array<{
    tender_id: string;
    title: string;
    agency: string;
    sector: string;
    min_bid: number;
    max_bid: number;
    winning_bid: number | null;
    spread: number;
    spread_pct: number;
  }>;
}

export interface InsightData {
  persistent_losers: Array<{
    company_id: string;
    company_name: string;
    participations: number;
    wins: number;
    win_rate: number;
    avg_bid: number;
  }>;
  non_lowest_winners: Array<{
    tender_id: string;
    title: string;
    agency: string;
    lowest_bid: number;
    winning_bid: number;
    winner_name: string;
    difference_pct: number;
  }>;
  high_variance_agencies: Array<{
    agency: string;
    tender_count: number;
    avg_spread_pct: number;
    max_spread_pct: number;
  }>;
}

export interface Profile {
  id: string;
  display_name: string | null;
  updated_at: string | null;
}
