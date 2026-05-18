# Task 5: Free Agent Contract Signing Screen

## Summary
Implemented a contract signing modal/flow for free agents in the transfer market with:
- ContractOfferModal component
- API endpoint for contract offer processing
- Integration with MultiplayerTab for both free agents and auction wins

## Files Created

### 1. `src/components/fm/ContractOfferModal.tsx`
- Full-featured modal component with player info, contract offer form, and player demands
- Player demands generated based on rating tiers (60-70, 70-80, 80-90, 90+)
- Weekly salary input with visual range indicator
- Contract duration slider (1-34 weeks)
- Signing fee input with visual range indicator
- Cost summary section
- Budget validation
- Success/rejection result display with retry option
- Support for both free-agent and auction-win contract modes
- Animated with motion/react, dark theme styling

### 2. `src/app/api/contract-offer/route.ts`
- POST: Validates offer, checks player demands (±20% tolerance), accepts/rejects
- On accept: deducts Kredi (signing fee) and Euro (transfer price) from profile, updates player ownership, deactivates listing
- PUT: Handles auction contract signing and give-up with 5% penalty
- Proper error handling and validation

### 3. Modified `src/components/fm/MultiplayerTab.tsx`
- Added imports: FileText, Handshake icons + ContractOfferModal
- Added state: contractListing, contractMode, wonAuctions
- Changed free agent "Satın Al" button to "Sozlesme Teklifi" button
- Added "Won Auctions" section in auctions tab with "Sozlesme Imzala" and "Vazgec" buttons
- Added ContractOfferModal rendering with proper result handling
- Removed stale setSelectedListing references
- Fetches won auctions (expired where user is highest bidder) via Supabase

## Player Demands Logic
- Rating 60-70: 50K-150K/week salary, 3-8 Kredi signing fee
- Rating 70-80: 150K-300K/week salary, 8-15 Kredi signing fee
- Rating 80-90: 300K-600K/week salary, 15-30 Kredi signing fee
- Rating 90+: 600K-1M/week salary, 30-50 Kredi signing fee

## Offer Acceptance Logic
- Salary must be within ±20% of the midpoint of player's expected range
- Signing fee must be within ±20% of the midpoint of player's expected range
- Both conditions must be met for acceptance

## Auction Win Contract Flow
- Won auctions appear in the "Auctions" tab under "Kazanilan Artirmalar"
- "Sozlesme Imzala" button opens the contract modal with auction-specific settings
- "Vazgec" (Give Up) button applies 5% penalty of bid amount to seller
- Penalty deducted from buyer's money and credited to seller
