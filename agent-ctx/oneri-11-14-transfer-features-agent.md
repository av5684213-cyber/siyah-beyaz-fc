# Task: Implement ÖNERİ 11-14 Transfer/Market Features

## Summary
Created 4 new transfer/market feature components for Siyah-Beyaz FC:

### ÖNERİ-11: WatchlistAlertPanel.tsx
- **Path**: `src/components/fm/WatchlistAlertPanel.tsx`
- Real-time watchlist alert system with Supabase subscriptions
- Alert types: listed, price_drop, sold, contract_expiring
- Mark individual or all alerts as read
- Color-coded alert cards with icons
- Show more/less toggle for long alert lists

### ÖNERİ-12: TransferNegotiationPanel.tsx
- **Path**: `src/components/fm/TransferNegotiationPanel.tsx`
- Transfer offer negotiation with accept/reject/counter-offer flow
- Incoming and outgoing offer views
- Counter-offer input with amount field
- Uses Supabase RPC functions for offer actions

### ÖNERİ-13: LoanBuyOptionCard.tsx
- **Path**: `src/components/fm/LoanBuyOptionCard.tsx`
- Loan-to-buy option display and exercise functionality
- Deadline tracking with days remaining
- Expired option detection
- Exercise buy option via Supabase RPC

### ÖNERİ-14: AgentInboxPanel.tsx
- **Path**: `src/components/fm/AgentInboxPanel.tsx`
- Agent messaging system with real-time updates
- Message types: contract_warning, offer_received, low_playtime, unhappy, transfer_request, general
- Read/unread tracking with badge count
- Message detail view with response capability
- Real-time subscription for new messages

## Technical Details
- All components use `'use client'` directive
- Import `getSupabase` and `isSupabaseConfigured` from `@/lib/supabase`
- Turkish language UI (consistent with existing project)
- Dark theme styling (bg-white/5, border-white/10, text-white)
- Real-time subscriptions with proper cleanup in useEffect returns
