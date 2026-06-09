---
Task ID: 5
Agent: Main Agent
Task: Seed dummy data into PostgreSQL database

Work Log:
- Created comprehensive seed script at `prisma/seed.ts`
- Added `db:seed` script to package.json
- Seeded data includes:
  - 8 Categories (Fashion Wanita, Fashion Pria, Fashion Anak, Sepatu, Tas, Aksesoris, Hijab, Jam Tangan)
  - 16 Products with variations (colors, sizes, SKUs)
  - 5 Users (1 admin, 4 customers)
  - 5 Addresses
  - 8 Orders with order items
  - 10 Reviews
  - 3 Blog Posts (published)
  - 3 Vouchers (WELCOME50, HEMAT30K, FLASH20)
  - 3 Promos (AKHIRBULAN25, FREEONGKIR, WOMENSDAY)
  - 1 Flash Sale with 4 items
  - 30 days of analytics data
  - Store settings
- Verified all data via API calls and browser snapshot
- Homepage now shows categories, flash sale products, featured products, promo banners, and new arrivals
- All promo banners render correctly (DISKON 25%, FREE ONGKIR JABODETABEK, WOMEN'S DAY SPECIAL)

Stage Summary:
- Database fully seeded with realistic Indonesian fashion e-commerce data
- All API endpoints verified working with seeded data
- Homepage displays all data correctly

---
Task ID: 6
Agent: Main Agent
Task: Fix order creation - orders not entering the system

Work Log:
- Diagnosed FK constraint violation: `Order_userId_fkey` — API used hardcoded `'customer-demo'` userId that doesn't exist in PostgreSQL
- Diagnosed FK constraint violation: `OrderItem_productId_fkey` — productId must reference valid product in database
- Fixed `/api/orders/route.ts` POST handler:
  - Auto-creates/finds guest user based on phone number (no more hardcoded userId)
  - Handles productId gracefully (checks length for valid cuid format)
  - Added promo/voucher usage tracking (auto-increments `used` counter on order creation)
  - Added user info in GET response
- Made `OrderItem.productId` optional in Prisma schema (allows orders to persist even if product deleted)
- Updated store settings with correct location codes:
  - `originDistrictCode`: `3174050` → `317407` (Kebayoran Baru)
  - `originVillageCode`: `3174050003` → `3174071004` (Selong)
- Updated seed script with correct location codes
- Verified order creation works end-to-end via API (3 new orders created)
- Verified promo usage counter increments correctly

Stage Summary:
- Orders now successfully enter the system with auto-created guest users
- Promo/voucher tracking works on order creation
- 11 total orders in database (8 seeded + 3 new test orders)
