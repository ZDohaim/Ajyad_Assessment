# FRD Missing Items Plan

## Missing Requirement

The current implementation is missing an explicit **"Distribution of bids vs winners"** view in the Company Intelligence section.

FRD reference:
- `FRD.md` lines 52-60

Current state:
- Present: total participations, total wins, win rate, average bid value, recent activity, average position
- Missing: a dedicated distribution view or metric showing how a company's bids compare against winning outcomes

## Implementation Plan

1. Define the metric clearly
- Decide on the exact interpretation of "Distribution of bids vs winners".
- Recommended scope: show how often a company is `Winner`, `Lowest bidder but lost`, `Competitive but not lowest`, and `Uncompetitive / high-priced loss`.

2. Extend the company detail API
- Update `src/app/api/companies/[id]/route.ts` to compute distribution buckets from proposal data.
- For each proposal, compare the company's bid against:
  - the winning bid
  - the minimum bid in that tender
- Return aggregate counts and percentages for each bucket.

3. Add a dedicated distribution section to the company page
- Update `src/app/(dashboard)/companies/[id]/page.tsx`.
- Add a small chart or segmented bar plus a supporting table.
- Show both counts and percentages so the insight is explicit and readable.

4. Keep terminology aligned with procurement behavior
- Use labels that are easy to understand in product terms, not just technical rank values.
- Example labels:
  - `Won`
  - `Lowest bid, lost`
  - `Close to winner, lost`
  - `Far above winner`

5. Validate edge cases
- Handle tenders with missing ranks.
- Handle tenders with only one bidder.
- Handle proposals where winner or minimum bid cannot be derived cleanly.
- Avoid misleading percentages when participation count is very low.

6. Verify requirement coverage
- Confirm the final company page still shows:
  - total participations
  - total wins
  - win rate
  - average bid value
  - recent activity
  - average position
  - bid vs winner distribution

## Suggested Acceptance Check

The requirement should be considered met when a user can open a company detail page and clearly understand not only how often the company wins, but also how its losing bids are distributed relative to the winner and lowest bidder.
