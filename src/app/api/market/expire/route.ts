/**
 * /api/market/expire
 *
 * @deprecated Bu endpoint artık auction-cleanup cron'una yönlendirilmiştir.
 * Açık artırma çözümlemesi tek kaynaktan yapılır: /api/cron/auction-cleanup
 */

import { GET as auctionCleanupGET } from '../../cron/auction-cleanup/route';

export const GET = auctionCleanupGET;
export const POST = auctionCleanupGET;
