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
import { createErrorResponse } catch (err: any) {
    return createErrorResponse(err, { route: "/api/market/expire" });
  }
} from '@/lib/api-error-handler';

export const GET = auctionCleanupGET;
export const POST = auctionCleanupGET;
