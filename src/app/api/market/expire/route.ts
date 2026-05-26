/**
 * /api/market/expire
 *
 * @deprecated Bu endpoint artık auction-cleanup cron'una yönlendirilmiştir.
 * Açık artırma çözümlemesi tek kaynaktan yapılır: /api/cron/auction-cleanup
 *
 * Önceki davranış (5% tazminat, re-listing) auction-cleanup ile birleştirildi
 * (2.5% komisyon, oyuncu transferi). Çift işlem riski giderildi.
 */

import { GET as auctionCleanupGET } from '../../cron/auction-cleanup/route';

export const GET = auctionCleanupGET;
export const POST = auctionCleanupGET;
