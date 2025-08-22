// client/src/config.ts

/**
 * المسار الأساسي لنداءات API:
 * - أثناء التطوير (npm run dev): http://localhost:3000
 * - في بيئة الإنتاج داخل Electron: نفس العنوان
 */
export const API_BASE = import.meta.env.PROD
  ? 'http://localhost:3000'
  : 'http://localhost:3000';