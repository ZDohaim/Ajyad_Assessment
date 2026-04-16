Overview
You are building a lightweight SaaS product similar to TendersAlerts. The goal is to help SMEs discover tenders, understand competition, and make better bidding decisions.

The goal of this task is to test your ability to build products with the leverage of AI
Objective
Build a working web application that allows a user to:
Login and manage his account
Discover open and historical tenders
Understand who is winning and at what price
Analyze competitors in a given sector
Extract actionable insights before bidding
Export the opportunity in PDF

What You Will Be Given
A dataset containing procurement opportunities
Each opportunity may include:
Tender details (agency, sector, location, deadlines)
Submitted proposals (vendors, prices, status)
An API key for AI usage (OpenRouter.ai) details below

What We Care About (Important)
We are evaluating your ability to:
Ship a usable product fast
Structure messy data into something usable
Use AI tools to accelerate development
Make good product decisions (what matters vs what doesn’t)
We are not evaluating:
Perfect UI
Complex backend architecture
Clean code

Core Requirements
A working web application (no API-only submissions).
Tenders feed and listing (Like a Marketplace)
Display all opportunities
Support filtering by:
Agency
Sector / activity
Region / city
Status (active, awarded, expired)

Opportunity Detail View
Each opportunity must clearly present:
Basic information (title, agency, sector, dates)
All submitted proposals
For proposals:
Show all vendors
Show bid values
Clearly identify the winner
Highlight differences between bid

Company Intelligence View (Critical)
For each vendor:
Total number of participations
Total wins
Win rate
Average bid value
Recent activity
Distribution of bids vs winners
Average position (e.g. lowest bidder vs not)

Market / Competitive Views (Core of the Challenge)
You must build multiple views that go beyond listing data.

Required examples:
Top Performing Companies
Ranked by number of wins
Filterable by sector or agency
Competitive Density
Opportunities ranked by number of bidders
Identify highly competitive vs low competition tenders
Pricing Analysis
For each tender:
Minimum bid
Maximum bid
Winning bid
Spread between bids 5. One market Insight View
Examples (you may choose one or create your own):
Companies that consistently lose despite offering lower prices
Vendors with high participation but low win rates
Agencies where price variance is unusually high
Correlation between number of bidders and price spread
Vendors that only win in specific sectors or regions

6. Login & account management
   Users should be able to register and login
   Users should be able to change the account name

7. Export as PDF
   Users should be able to export any opportunity in pdf

Constraints
Time limit: 48 hours
Must be a working product
Any tech stack is allowed
