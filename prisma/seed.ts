import { db } from '../src/lib/db';
import { Prisma } from '@prisma/client';

async function main() {
  console.log('🌱 Seeding database...');
  console.log('🗑️  Clearing existing data...');

  // Clear in correct order (respect foreign keys)
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.review.deleteMany();
  await db.wishlist.deleteMany();
  await db.flashSaleItem.deleteMany();
  await db.flashSale.deleteMany();
  await db.analytics.deleteMany();
  await db.blogPost.deleteMany();
  await db.voucher.deleteMany();
  await db.productVariation.deleteMany();
  await db.categoryProduct.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.address.deleteMany();
  await db.user.deleteMany();

  // ============================
  // 1. CATEGORIES
  // ============================
  console.log('📂 Creating categories...');

  const categories = await Promise.all([
    db.category.create({
      data: {
        name: 'Fashion Pria',
        slug: 'fashion-pria',
        description: 'Koleksi fashion pria terlengkap dari kasual hingga formal',
        image: '/images/products/shirt-1.png',
      },
    }),
    db.category.create({
      data: {
        name: 'Fashion Wanita',
        slug: 'fashion-wanita',
        description: 'Koleksi fashion wanita modern dan elegan',
        image: '/images/products/dress-1.png',
      },
    }),
    db.category.create({
      data: {
        name: 'Fashion Anak',
        slug: 'fashion-anak',
        description: 'Pakaian anak yang nyaman dan stylish',
        image: '/images/products/kids-1.png',
      },
    }),
    db.category.create({
      data: {
        name: 'Sepatu',
        slug: 'sepatu',
        description: 'Berbagai pilihan sepatu untuk segala kesempatan',
        image: '/images/products/shoes-1.png',
      },
    }),
    db.category.create({
      data: {
        name: 'Tas',
        slug: 'tas',
        description: 'Tas fashion fungsional dan trendy',
        image: '/images/products/bag-1.png',
      },
    }),
    db.category.create({
      data: {
        name: 'Aksesoris',
        slug: 'aksesoris',
        description: 'Aksesoris pelengkap penampilan Anda',
        image: '/images/products/acc-1.png',
      },
    }),
    db.category.create({
      data: {
        name: 'Hijab',
        slug: 'hijab',
        description: 'Koleksi hijab modern dan berkualitas',
        image: '/images/products/hijab-1.png',
      },
    }),
    db.category.create({
      data: {
        name: 'Jam Tangan',
        slug: 'jam-tangan',
        description: 'Jam tangan premium untuk segala gaya',
        image: '/images/products/watch-1.png',
      },
    }),
  ]);

  const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));
  console.log(`   ✅ Created ${categories.length} categories`);

  // ============================
  // 2. PRODUCTS
  // ============================
  console.log('🛍️  Creating products...');

  type ProductData = Prisma.ProductCreateArgs['data'];

  const productsData: ProductData[] = [
    // Product 1: Elegant Summer Dress
    {
      name: 'Elegant Summer Dress',
      slug: 'elegant-summer-dress',
      description:
        'Gaun musim panas yang elegan dengan bahan adem dan nyaman. Desain floral yang cantik cocok untuk berbagai acara casual maupun semi-formal. Bahan premium yang ringan dan breathable, sempurna untuk cuaca tropis Indonesia.',
      shortDesc: 'Gaun floral elegan untuk musim panas',
      price: 450000,
      comparePrice: 600000,
      sku: 'LXE-DRESS-001',
      weight: 0.3,
      stock: 150,
      minStock: 10,
      images: JSON.stringify(['/images/products/dress-1.png']),
      isFeatured: true,
      isNew: true,
      metaTitle: 'Elegant Summer Dress - LUXE Fashion',
      metaDesc: 'Beli Elegant Summer Dress online di LUXE Fashion. Bahan adem, desain floral cantik.',
    },
    // Product 2: Premium Cotton Shirt
    {
      name: 'Premium Cotton Shirt',
      slug: 'premium-cotton-shirt',
      description:
        'Kemeja katun premium dengan kualitas terbaik. Bahan 100% cotton combed yang lembut dan nyaman dipakai sehari-hari. Cocok untuk ke kantor maupun acara casual. Tersedia dalam berbagai warna dan ukuran.',
      shortDesc: 'Kemeja katun premium untuk pria',
      price: 350000,
      comparePrice: 450000,
      sku: 'LXE-SHIRT-001',
      weight: 0.25,
      stock: 200,
      minStock: 15,
      images: JSON.stringify(['/images/products/shirt-1.png']),
      isFeatured: true,
      isNew: false,
      metaTitle: 'Premium Cotton Shirt - LUXE Fashion',
      metaDesc: 'Kemeja katun premium berkualitas tinggi untuk pria modern.',
    },
    // Product 3: Instant Hijab Jersey
    {
      name: 'Instant Hijab Jersey',
      slug: 'instant-hijab-jersey',
      description:
        'Hijab instan bahan jersey premium yang lembut dan tidak mudah kusut. Praktis dipakai tanpa perlu peniti. Tersedia dalam berbagai warna pastel yang cantik. Bahan adem dan menyerap keringat dengan baik.',
      shortDesc: 'Hijab instan jersey premium, praktis dan nyaman',
      price: 120000,
      comparePrice: 180000,
      sku: 'LXE-HIJB-001',
      weight: 0.1,
      stock: 300,
      minStock: 20,
      images: JSON.stringify(['/images/products/hijab-1.png']),
      isFeatured: false,
      isNew: true,
      metaTitle: 'Instant Hijab Jersey - LUXE Fashion',
      metaDesc: 'Hijab instan jersey premium, praktis dan nyaman dipakai sehari-hari.',
    },
    // Product 4: Urban Street Sneakers
    {
      name: 'Urban Street Sneakers',
      slug: 'urban-street-sneakers',
      description:
        'Sepatu sneakers urban dengan desain modern dan stylish. Sol karet yang anti-slip dan empuk untuk kenyamanan seharian. Upper bahan kulit sintetis berkualitas tinggi. Cocok untuk aktivitas sehari-hari maupun olahraga ringan.',
      shortDesc: 'Sneakers urban modern untuk aktivitas sehari-hari',
      price: 650000,
      comparePrice: 850000,
      sku: 'LXE-SHOE-001',
      weight: 0.8,
      stock: 100,
      minStock: 10,
      images: JSON.stringify(['/images/products/shoes-1.png']),
      isFeatured: true,
      isNew: true,
      metaTitle: 'Urban Street Sneakers - LUXE Fashion',
      metaDesc: 'Sepatu sneakers urban modern, nyaman dan stylish.',
    },
    // Product 5: Crossbody Leather Bag
    {
      name: 'Crossbody Leather Bag',
      slug: 'crossbody-leather-bag',
      description:
        'Tas selempang kulit premium dengan desain minimalis dan elegan. Bahan kulit sintetis berkualitas tinggi yang tahan lama. Kompartemen luas dengan organizer interior. Tali strap adjustable untuk kenyamanan penggunaan.',
      shortDesc: 'Tas selempang kulit premium dengan desain minimalis',
      price: 550000,
      comparePrice: 750000,
      sku: 'LXE-BAG-001',
      weight: 0.5,
      stock: 80,
      minStock: 8,
      images: JSON.stringify(['/images/products/bag-1.png']),
      isFeatured: true,
      isNew: false,
      metaTitle: 'Crossbody Leather Bag - LUXE Fashion',
      metaDesc: 'Tas selempang kulit premium, desain minimalis dan elegan.',
    },
    // Product 6: Rose Gold Watch
    {
      name: 'Rose Gold Watch',
      slug: 'rose-gold-watch',
      description:
        'Jam tangan rose gold dengan desain elegan dan feminin. Movement Japan Quartz yang akurat. Water resistant hingga 30 meter. Tali stainless steel rose gold dengan clasp yang aman. Cocok untuk segala kesempatan.',
      shortDesc: 'Jam tangan rose gold elegan untuk wanita',
      price: 850000,
      comparePrice: 1200000,
      sku: 'LXE-WTCH-001',
      weight: 0.1,
      stock: 50,
      minStock: 5,
      images: JSON.stringify(['/images/products/watch-1.png']),
      isFeatured: true,
      isNew: false,
      metaTitle: 'Rose Gold Watch - LUXE Fashion',
      metaDesc: 'Jam tangan rose gold elegan, movement Japan Quartz.',
    },
    // Product 7: Kids Striped Tee Set
    {
      name: 'Kids Striped Tee Set',
      slug: 'kids-striped-tee-set',
      description:
        'Set kaos bergaris untuk anak dengan bahan katun 100% yang lembut dan aman untuk kulit anak. Desain colorful yang ceria dan menyenangkan. Tersedia dalam set 3 pcs dengan warna berbeda. Mudah dicuci dan tidak mudah pudar.',
      shortDesc: 'Set kaos bergaris ceria untuk anak-anak',
      price: 180000,
      comparePrice: 250000,
      sku: 'LXE-KIDS-001',
      weight: 0.2,
      stock: 120,
      minStock: 10,
      images: JSON.stringify(['/images/products/kids-1.png']),
      isFeatured: false,
      isNew: true,
      metaTitle: 'Kids Striped Tee Set - LUXE Fashion',
      metaDesc: 'Set kaos bergaris ceria untuk anak, bahan katun aman.',
    },
    // Product 8: Gold Layered Necklace Set
    {
      name: 'Gold Layered Necklace Set',
      slug: 'gold-layered-necklace-set',
      description:
        'Set kalung layered gold plated dengan desain modern dan elegan. Terdiri dari 3 layer kalung dengan panjang berbeda. Material tahan karat dan anti-alergi. Cocok dipadukan dengan berbagai outfit untuk penampilan yang stylish.',
      shortDesc: 'Set kalung layered gold plated yang elegan',
      price: 250000,
      comparePrice: 350000,
      sku: 'LXE-ACC-001',
      weight: 0.05,
      stock: 90,
      minStock: 10,
      images: JSON.stringify(['/images/products/acc-1.png']),
      isFeatured: false,
      isNew: true,
      metaTitle: 'Gold Layered Necklace Set - LUXE Fashion',
      metaDesc: 'Set kalung layered gold plated, desain modern dan elegan.',
    },
    // Product 9: Blazer Wanita Premium
    {
      name: 'Blazer Wanita Premium',
      slug: 'blazer-wanita-premium',
      description:
        'Blazer wanita premium dengan potongan yang flattering dan modern. Bahan katun campuran yang nyaman dan tidak mudah kusut. Cocok untuk ke kantor, meeting, maupun acara semi-formal. Desain timeless yang tidak pernah ketinggalan zaman.',
      shortDesc: 'Blazer wanita premium untuk penampilan profesional',
      price: 780000,
      comparePrice: 950000,
      sku: 'LXE-BLZR-001',
      weight: 0.4,
      stock: 60,
      minStock: 8,
      images: JSON.stringify(['/images/products/dress-1.png']),
      isFeatured: true,
      isNew: false,
      metaTitle: 'Blazer Wanita Premium - LUXE Fashion',
      metaDesc: 'Blazer wanita premium, potongan modern dan timeless.',
    },
    // Product 10: Kaos Polos Premium
    {
      name: 'Kaos Polos Premium',
      slug: 'kaos-polos-premium',
      description:
        'Kaos polos premium dengan bahan cotton combed 30s yang super lembut dan nyaman. Jahitan rantai yang kuat dan rapi. Tersedia dalam berbagai warna dasar yang mudah dipadukan. Cocok untuk daily wear maupun dipakai sebagai inner.',
      shortDesc: 'Kaos polos cotton combed 30s, lembut dan nyaman',
      price: 150000,
      sku: 'LXE-TSHR-001',
      weight: 0.15,
      stock: 500,
      minStock: 30,
      images: JSON.stringify(['/images/products/shirt-1.png']),
      isFeatured: false,
      isNew: false,
      metaTitle: 'Kaos Polos Premium - LUXE Fashion',
      metaDesc: 'Kaos polos cotton combed 30s, bahan lembut dan nyaman.',
    },
    // Product 11: Rok Pleated Mini
    {
      name: 'Rok Pleated Mini',
      slug: 'rok-pleated-mini',
      description:
        'Rok pleated mini dengan desain yang girly dan stylish. Bahan polyester yang jatuh sempurna dan tidak mudah kusut. Cocok dipadukan dengan kaos, blouse, maupun kemeja. Tersedia dalam warna-warna netral yang mudah di-mix and match.',
      shortDesc: 'Rok pleated mini, girly dan stylish',
      price: 280000,
      comparePrice: 380000,
      sku: 'LXE-SKRT-001',
      weight: 0.2,
      stock: 110,
      minStock: 10,
      images: JSON.stringify(['/images/products/dress-1.png']),
      isFeatured: false,
      isNew: true,
      metaTitle: 'Rok Pleated Mini - LUXE Fashion',
      metaDesc: 'Rok pleated mini stylish, bahan jatuh sempurna.',
    },
    // Product 12: Hoodie Oversize
    {
      name: 'Hoodie Oversize',
      slug: 'hoodie-oversize',
      description:
        'Hoodie oversize dengan bahan fleece premium yang tebal dan hangat. Cocok untuk cuaca dingin atau AC ruangan. Desain trendy dengan hoodie dan kantong kangaroo. Tersedia dalam warna-warna basic yang timeless.',
      shortDesc: 'Hoodie oversize fleece premium, hangat dan trendy',
      price: 320000,
      comparePrice: 420000,
      sku: 'LXE-HOOD-001',
      weight: 0.45,
      stock: 90,
      minStock: 10,
      images: JSON.stringify(['/images/products/shirt-1.png']),
      isFeatured: false,
      isNew: false,
      metaTitle: 'Hoodie Oversize - LUXE Fashion',
      metaDesc: 'Hoodie oversize fleece premium, tebal dan hangat.',
    },
  ];

  // Category assignments per product slug
  const productCategorySlugs: Record<string, string[]> = {
    'elegant-summer-dress': ['fashion-wanita'],
    'premium-cotton-shirt': ['fashion-pria'],
    'instant-hijab-jersey': ['hijab'],
    'urban-street-sneakers': ['sepatu'],
    'crossbody-leather-bag': ['tas'],
    'rose-gold-watch': ['jam-tangan'],
    'kids-striped-tee-set': ['fashion-anak'],
    'gold-layered-necklace-set': ['aksesoris'],
    'blazer-wanita-premium': ['fashion-wanita'],
    'kaos-polos-premium': ['fashion-pria'],
    'rok-pleated-mini': ['fashion-wanita'],
    'hoodie-oversize': ['fashion-pria'],
  };

  // Variation definitions per product slug
  const productVariations: Record<string, Array<{ color: string; size: string; sku: string; stock: number }>> = {
    'elegant-summer-dress': [
      { color: 'Putih', size: 'S', sku: 'LXE-DRESS-001-WH-S', stock: 15 },
      { color: 'Putih', size: 'M', sku: 'LXE-DRESS-001-WH-M', stock: 20 },
      { color: 'Putih', size: 'L', sku: 'LXE-DRESS-001-WH-L', stock: 15 },
      { color: 'Pink', size: 'S', sku: 'LXE-DRESS-001-PK-S', stock: 10 },
      { color: 'Pink', size: 'M', sku: 'LXE-DRESS-001-PK-M', stock: 15 },
      { color: 'Pink', size: 'L', sku: 'LXE-DRESS-001-PK-L', stock: 10 },
    ],
    'premium-cotton-shirt': [
      { color: 'Putih', size: 'S', sku: 'LXE-SHIRT-001-WH-S', stock: 25 },
      { color: 'Putih', size: 'M', sku: 'LXE-SHIRT-001-WH-M', stock: 30 },
      { color: 'Putih', size: 'L', sku: 'LXE-SHIRT-001-WH-L', stock: 25 },
      { color: 'Putih', size: 'XL', sku: 'LXE-SHIRT-001-WH-XL', stock: 20 },
      { color: 'Navy', size: 'S', sku: 'LXE-SHIRT-001-NV-S', stock: 20 },
      { color: 'Navy', size: 'M', sku: 'LXE-SHIRT-001-NV-M', stock: 25 },
      { color: 'Navy', size: 'L', sku: 'LXE-SHIRT-001-NV-L', stock: 20 },
      { color: 'Navy', size: 'XL', sku: 'LXE-SHIRT-001-NV-XL', stock: 15 },
      { color: 'Hitam', size: 'M', sku: 'LXE-SHIRT-001-BK-M', stock: 20 },
      { color: 'Hitam', size: 'L', sku: 'LXE-SHIRT-001-BK-L', stock: 20 },
    ],
    'instant-hijab-jersey': [
      { color: 'Pink', size: 'M', sku: 'LXE-HIJB-001-PK-M', stock: 40 },
      { color: 'Hitam', size: 'M', sku: 'LXE-HIJB-001-BK-M', stock: 40 },
      { color: 'Navy', size: 'M', sku: 'LXE-HIJB-001-NV-M', stock: 30 },
      { color: 'Putih', size: 'M', sku: 'LXE-HIJB-001-WH-M', stock: 30 },
      { color: 'Merah', size: 'M', sku: 'LXE-HIJB-001-RD-M', stock: 25 },
    ],
    'urban-street-sneakers': [
      { color: 'Putih', size: '39', sku: 'LXE-SHOE-001-WH-39', stock: 12 },
      { color: 'Putih', size: '40', sku: 'LXE-SHOE-001-WH-40', stock: 15 },
      { color: 'Putih', size: '41', sku: 'LXE-SHOE-001-WH-41', stock: 15 },
      { color: 'Putih', size: '42', sku: 'LXE-SHOE-001-WH-42', stock: 12 },
      { color: 'Putih', size: '43', sku: 'LXE-SHOE-001-WH-43', stock: 10 },
      { color: 'Hitam', size: '40', sku: 'LXE-SHOE-001-BK-40', stock: 12 },
      { color: 'Hitam', size: '41', sku: 'LXE-SHOE-001-BK-41', stock: 12 },
      { color: 'Hitam', size: '42', sku: 'LXE-SHOE-001-BK-42', stock: 12 },
    ],
    'crossbody-leather-bag': [
      { color: 'Hitam', size: 'M', sku: 'LXE-BAG-001-BK-M', stock: 25 },
      { color: 'Coklat', size: 'M', sku: 'LXE-BAG-001-BR-M', stock: 25 },
      { color: 'Navy', size: 'M', sku: 'LXE-BAG-001-NV-M', stock: 15 },
    ],
    'rose-gold-watch': [
      { color: 'Rose Gold', size: 'M', sku: 'LXE-WTCH-001-RG-M', stock: 25 },
    ],
    'kids-striped-tee-set': [
      { color: 'Multi', size: '2-3T', sku: 'LXE-KIDS-001-ML-2T', stock: 20 },
      { color: 'Multi', size: '4-5T', sku: 'LXE-KIDS-001-ML-4T', stock: 25 },
      { color: 'Multi', size: '6-7T', sku: 'LXE-KIDS-001-ML-6T', stock: 20 },
      { color: 'Multi', size: '8-9T', sku: 'LXE-KIDS-001-ML-8T', stock: 20 },
    ],
    'gold-layered-necklace-set': [
      { color: 'Gold', size: 'M', sku: 'LXE-ACC-001-GD-M', stock: 30 },
      { color: 'Silver', size: 'M', sku: 'LXE-ACC-001-SV-M', stock: 25 },
      { color: 'Rose Gold', size: 'M', sku: 'LXE-ACC-001-RG-M', stock: 20 },
    ],
    'blazer-wanita-premium': [
      { color: 'Hitam', size: 'S', sku: 'LXE-BLZR-001-BK-S', stock: 12 },
      { color: 'Hitam', size: 'M', sku: 'LXE-BLZR-001-BK-M', stock: 15 },
      { color: 'Hitam', size: 'L', sku: 'LXE-BLZR-001-BK-L', stock: 12 },
      { color: 'Navy', size: 'S', sku: 'LXE-BLZR-001-NV-S', stock: 8 },
      { color: 'Navy', size: 'M', sku: 'LXE-BLZR-001-NV-M', stock: 8 },
    ],
    'kaos-polos-premium': [
      { color: 'Hitam', size: 'S', sku: 'LXE-TSHR-001-BK-S', stock: 40 },
      { color: 'Hitam', size: 'M', sku: 'LXE-TSHR-001-BK-M', stock: 50 },
      { color: 'Hitam', size: 'L', sku: 'LXE-TSHR-001-BK-L', stock: 50 },
      { color: 'Hitam', size: 'XL', sku: 'LXE-TSHR-001-BK-XL', stock: 40 },
      { color: 'Putih', size: 'S', sku: 'LXE-TSHR-001-WH-S', stock: 40 },
      { color: 'Putih', size: 'M', sku: 'LXE-TSHR-001-WH-M', stock: 50 },
      { color: 'Putih', size: 'L', sku: 'LXE-TSHR-001-WH-L', stock: 50 },
      { color: 'Putih', size: 'XL', sku: 'LXE-TSHR-001-WH-XL', stock: 40 },
      { color: 'Navy', size: 'M', sku: 'LXE-TSHR-001-NV-M', stock: 40 },
      { color: 'Navy', size: 'L', sku: 'LXE-TSHR-001-NV-L', stock: 40 },
      { color: 'Merah', size: 'M', sku: 'LXE-TSHR-001-RD-M', stock: 25 },
    ],
    'rok-pleated-mini': [
      { color: 'Hitam', size: 'S', sku: 'LXE-SKRT-001-BK-S', stock: 20 },
      { color: 'Hitam', size: 'M', sku: 'LXE-SKRT-001-BK-M', stock: 25 },
      { color: 'Hitam', size: 'L', sku: 'LXE-SKRT-001-BK-L', stock: 20 },
      { color: 'Navy', size: 'S', sku: 'LXE-SKRT-001-NV-S', stock: 15 },
      { color: 'Navy', size: 'M', sku: 'LXE-SKRT-001-NV-M', stock: 15 },
      { color: 'Pink', size: 'S', sku: 'LXE-SKRT-001-PK-S', stock: 15 },
    ],
    'hoodie-oversize': [
      { color: 'Hitam', size: 'L', sku: 'LXE-HOOD-001-BK-L', stock: 20 },
      { color: 'Hitam', size: 'XL', sku: 'LXE-HOOD-001-BK-XL', stock: 15 },
      { color: 'Navy', size: 'L', sku: 'LXE-HOOD-001-NV-L', stock: 15 },
      { color: 'Navy', size: 'XL', sku: 'LXE-HOOD-001-NV-XL', stock: 15 },
      { color: 'Merah', size: 'L', sku: 'LXE-HOOD-001-RD-L', stock: 10 },
      { color: 'Putih', size: 'L', sku: 'LXE-HOOD-001-WH-L', stock: 15 },
    ],
  };

  // Create all products
  const products: Record<string, string> = {};
  for (const productData of productsData) {
    const product = await db.product.create({ data: productData });
    products[product.slug] = product.id;

    // Create category-product relations
    const catSlugs = productCategorySlugs[product.slug] || [];
    for (const catSlug of catSlugs) {
      const catId = categoryMap.get(catSlug);
      if (catId) {
        await db.categoryProduct.create({
          data: {
            categoryId: catId,
            productId: product.id,
          },
        });
      }
    }

    // Create variations
    const variations = productVariations[product.slug] || [];
    for (const variation of variations) {
      await db.productVariation.create({
        data: {
          productId: product.id,
          color: variation.color,
          size: variation.size,
          sku: variation.sku,
          stock: variation.stock,
        },
      });
    }
  }

  console.log(`   ✅ Created ${Object.keys(products).length} products with variations`);

  // ============================
  // 3. VOUCHERS
  // ============================
  console.log('🎫 Creating vouchers...');

  const now = new Date();
  const threeMonthsLater = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const vouchers = await Promise.all([
    db.voucher.create({
      data: {
        code: 'WELCOME10',
        type: 'percentage',
        value: 10,
        minPurchase: 200000,
        maxDiscount: 100000,
        quota: 1000,
        used: 0,
        startDate: now,
        endDate: threeMonthsLater,
        isActive: true,
      },
    }),
    db.voucher.create({
      data: {
        code: 'DISKON50K',
        type: 'nominal',
        value: 50000,
        minPurchase: 300000,
        quota: 500,
        used: 0,
        startDate: now,
        endDate: threeMonthsLater,
        isActive: true,
      },
    }),
    db.voucher.create({
      data: {
        code: 'GRATISONGKIR',
        type: 'shipping',
        value: 15000,
        quota: 2000,
        used: 0,
        startDate: now,
        endDate: threeMonthsLater,
        isActive: true,
      },
    }),
  ]);

  console.log(`   ✅ Created ${vouchers.length} vouchers`);

  // ============================
  // 4. FLASH SALE
  // ============================
  console.log('⚡ Creating flash sale...');

  const flashSaleStart = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
  const flashSaleEnd = new Date(now.getTime() + 22 * 60 * 60 * 1000); // 22 hours from now

  const flashSale = await db.flashSale.create({
    data: {
      name: 'Flash Sale Akhir Pekan',
      startDate: flashSaleStart,
      endDate: flashSaleEnd,
      isActive: true,
    },
  });

  // Flash sale items
  const flashSaleItemsData = [
    { productId: products['elegant-summer-dress'], salePrice: 299000, maxQty: 20, soldQty: 5 },
    { productId: products['urban-street-sneakers'], salePrice: 499000, maxQty: 15, soldQty: 3 },
    { productId: products['rose-gold-watch'], salePrice: 650000, maxQty: 10, soldQty: 2 },
    { productId: products['crossbody-leather-bag'], salePrice: 399000, maxQty: 15, soldQty: 4 },
  ];

  for (const item of flashSaleItemsData) {
    await db.flashSaleItem.create({
      data: {
        flashSaleId: flashSale.id,
        productId: item.productId,
        salePrice: item.salePrice,
        maxQty: item.maxQty,
        soldQty: item.soldQty,
      },
    });
  }

  console.log('   ✅ Created flash sale with 4 items');

  // ============================
  // 5. USERS
  // ============================
  console.log('👥 Creating users...');

  const adminUser = await db.user.create({
    data: {
      email: 'admin@luxefashion.com',
      password: 'admin123',
      name: 'Admin LUXE Fashion',
      phone: '081234567890',
      role: 'admin',
      memberLevel: 'admin',
      points: 0,
      isActive: true,
    },
  });

  const customerUser = await db.user.create({
    data: {
      email: 'customer@example.com',
      password: 'customer123',
      name: 'Sarah Wijaya',
      phone: '087654321098',
      avatar: null,
      role: 'customer',
      memberLevel: 'gold',
      points: 2500,
      isActive: true,
    },
  });

  // Customer address
  await db.address.create({
    data: {
      userId: customerUser.id,
      label: 'Rumah',
      recipient: 'Sarah Wijaya',
      phone: '087654321098',
      address: 'Jl. Sudirman No. 123, Blok A5',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      postalCode: '12190',
      isDefault: true,
    },
  });

  console.log('   ✅ Created admin and customer users');

  // ============================
  // 6. REVIEWS
  // ============================
  console.log('⭐ Creating reviews...');

  const reviewsData = [
    {
      userId: customerUser.id,
      productId: products['elegant-summer-dress'],
      rating: 5,
      title: 'Sangat puas!',
      comment: 'Bahan dressnya lembut dan adem, cocok banget dipakai di cuaca Indonesia. Warna pastelnya juga cantik. Pengiriman cepat dan packaging rapi. Pasti order lagi!',
    },
    {
      userId: customerUser.id,
      productId: products['premium-cotton-shirt'],
      rating: 4,
      title: 'Kualitas bagus',
      comment: 'Kemejanya bagus, bahannya tebal tapi tetap nyaman. Hanya saja ukurannya agak longgar, next time pilih size lebih kecil. Overall recommended!',
    },
    {
      userId: customerUser.id,
      productId: products['urban-street-sneakers'],
      rating: 5,
      title: 'Sepatu keren banget',
      comment: 'Designnya modern dan keren banget. Solnya empuk, nyaman dipakai seharian. Bahan berkualitas, worth it dengan harganya. Sudah rekomendasikan ke teman-teman.',
    },
    {
      userId: customerUser.id,
      productId: products['instant-hijab-jersey'],
      rating: 4,
      title: 'Hijab praktis',
      comment: 'Warnanya cantik dan bahannya adem. Praktis banget karena instan, tinggal slup langsung rapi. Cuma kadang agak longgar di bagian pipi. Tapi overall suka!',
    },
    {
      userId: customerUser.id,
      productId: products['crossbody-leather-bag'],
      rating: 5,
      title: 'Tas impian',
      comment: 'Tasnya bagus banget! Kulit sintetisnya terlihat premium dan kuat. Kompartemen dalamnya luas, bisa muat banyak barang. Strapnya adjustable dan nyaman dipakai. Worth every penny!',
    },
    {
      userId: customerUser.id,
      productId: products['rose-gold-watch'],
      rating: 4,
      title: 'Elegan dan feminin',
      comment: 'Jam tangan rose goldnya cantik banget, elegan dan feminin. Ukurannya pas untuk pergelangan tangan wanita. Movement-nya juga akurat. Box packaging mewah, cocok buat hadiah.',
    },
    {
      userId: customerUser.id,
      productId: products['hoodie-oversize'],
      rating: 5,
      title: 'Hoodie terbaik',
      comment: 'Bahannya tebal dan hangat, cocok banget buat cuaca dingin atau di ruangan AC. Desain oversizenya kekinian. Sudah beli 3 warna karena suka banget!',
    },
    {
      userId: customerUser.id,
      productId: products['kids-striped-tee-set'],
      rating: 5,
      title: 'Anak saya suka!',
      comment: 'Kaos anaknya lucu dan bahannya lembut, aman untuk kulit anak. Warna-warnanya cerah dan menarik. Set 3 pcs harganya sangat worth it. Anak saya suka semua warnanya!',
    },
  ];

  for (const reviewData of reviewsData) {
    await db.review.create({
      data: {
        ...reviewData,
        isVerified: true,
      },
    });
  }

  console.log(`   ✅ Created ${reviewsData.length} reviews`);

  // ============================
  // 7. ORDERS
  // ============================
  console.log('📦 Creating orders...');

  // Order 1: Delivered order
  const order1 = await db.order.create({
    data: {
      orderNumber: 'ORD-20240115-001',
      userId: customerUser.id,
      status: 'delivered',
      subtotal: 800000,
      shippingCost: 15000,
      discount: 50000,
      total: 765000,
      paymentMethod: 'bank_transfer',
      paymentStatus: 'paid',
      paidAt: new Date('2024-01-15T10:30:00.000Z'),
      courier: 'JNE',
      courierService: 'REG',
      trackingNumber: 'JNE1234567890',
      shippingAddress: JSON.stringify({
        recipient: 'Sarah Wijaya',
        phone: '087654321098',
        address: 'Jl. Sudirman No. 123, Blok A5',
        city: 'Jakarta Selatan',
        province: 'DKI Jakarta',
        postalCode: '12190',
      }),
      voucherCode: 'DISKON50K',
      createdAt: new Date('2024-01-15T10:00:00.000Z'),
    },
  });

  await db.orderItem.create({
    data: {
      orderId: order1.id,
      productId: products['elegant-summer-dress'],
      productName: 'Elegant Summer Dress',
      productImage: '/images/products/dress-1.png',
      variation: 'Putih / M',
      price: 450000,
      quantity: 1,
      subtotal: 450000,
    },
  });

  await db.orderItem.create({
    data: {
      orderId: order1.id,
      productId: products['instant-hijab-jersey'],
      productName: 'Instant Hijab Jersey',
      productImage: '/images/products/hijab-1.png',
      variation: 'Pink / M',
      price: 120000,
      quantity: 2,
      subtotal: 240000,
    },
  });

  // Order 2: Shipped order
  const order2 = await db.order.create({
    data: {
      orderNumber: 'ORD-20240118-002',
      userId: customerUser.id,
      status: 'shipped',
      subtotal: 1000000,
      shippingCost: 20000,
      discount: 0,
      total: 1020000,
      paymentMethod: 'ewallet',
      paymentStatus: 'paid',
      paidAt: new Date('2024-01-18T14:15:00.000Z'),
      courier: 'J&T',
      courierService: 'EZ',
      trackingNumber: 'JT9876543210',
      shippingAddress: JSON.stringify({
        recipient: 'Sarah Wijaya',
        phone: '087654321098',
        address: 'Jl. Gatot Subroto No. 45, Unit B3',
        city: 'Jakarta Selatan',
        province: 'DKI Jakarta',
        postalCode: '12950',
      }),
      createdAt: new Date('2024-01-18T14:00:00.000Z'),
    },
  });

  await db.orderItem.create({
    data: {
      orderId: order2.id,
      productId: products['urban-street-sneakers'],
      productName: 'Urban Street Sneakers',
      productImage: '/images/products/shoes-1.png',
      variation: 'Putih / 41',
      price: 650000,
      quantity: 1,
      subtotal: 650000,
    },
  });

  await db.orderItem.create({
    data: {
      orderId: order2.id,
      productId: products['kaos-polos-premium'],
      productName: 'Kaos Polos Premium',
      productImage: '/images/products/shirt-1.png',
      variation: 'Hitam / L',
      price: 150000,
      quantity: 2,
      subtotal: 300000,
    },
  });

  await db.orderItem.create({
    data: {
      orderId: order2.id,
      productId: products['gold-layered-necklace-set'],
      productName: 'Gold Layered Necklace Set',
      productImage: '/images/products/acc-1.png',
      variation: 'Gold / M',
      price: 250000,
      quantity: 1,
      subtotal: 250000,
    },
  });

  // Order 3: Processing order
  const order3 = await db.order.create({
    data: {
      orderNumber: 'ORD-20240120-003',
      userId: customerUser.id,
      status: 'processing',
      subtotal: 350000,
      shippingCost: 15000,
      discount: 0,
      total: 365000,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      courier: 'SiCepat',
      courierService: 'REG',
      shippingAddress: JSON.stringify({
        recipient: 'Sarah Wijaya',
        phone: '087654321098',
        address: 'Jl. Sudirman No. 123, Blok A5',
        city: 'Jakarta Selatan',
        province: 'DKI Jakarta',
        postalCode: '12190',
      }),
      createdAt: new Date('2024-01-20T09:30:00.000Z'),
    },
  });

  await db.orderItem.create({
    data: {
      orderId: order3.id,
      productId: products['hoodie-oversize'],
      productName: 'Hoodie Oversize',
      productImage: '/images/products/shirt-1.png',
      variation: 'Hitam / XL',
      price: 320000,
      quantity: 1,
      subtotal: 320000,
    },
  });

  console.log('   ✅ Created 3 sample orders');

  // ============================
  // 8. WISHLIST
  // ============================
  console.log('💖 Creating wishlist...');

  await Promise.all([
    db.wishlist.create({
      data: {
        userId: customerUser.id,
        productId: products['rose-gold-watch'],
      },
    }),
    db.wishlist.create({
      data: {
        userId: customerUser.id,
        productId: products['crossbody-leather-bag'],
      },
    }),
    db.wishlist.create({
      data: {
        userId: customerUser.id,
        productId: products['blazer-wanita-premium'],
      },
    }),
  ]);

  console.log('   ✅ Created 3 wishlist items');

  // ============================
  // 9. BLOG POSTS
  // ============================
  console.log('📝 Creating blog posts...');

  const blogPosts = await Promise.all([
    db.blogPost.create({
      data: {
        title: 'Trend Fashion 2024: Warna Pastel Dominasi',
        slug: 'trend-fashion-2024-warna-pastel-dominasi',
        content: `## Trend Fashion 2024: Warna Pastel Dominasi

Tahun 2024 membawa angin segar dalam dunia fashion dengan dominasi warna-warna pastel yang lembut dan menenangkan. Dari catwalk hingga street style, warna-warna seperti lavender, mint, peach, dan baby blue menjadi pilihan utama para fashionista.

### Mengapa Pastel?

Warna pastel memberikan kesan yang soft dan sophisticated. Tidak hanya terlihat cantik, warna-warna ini juga sangat versatile dan mudah dipadukan dengan outfit sehari-hari. Di era yang penuh dengan kesibukan, warna pastel memberikan visual yang calming dan refreshing.

### Tips Memadukan Warna Pastel

1. **Monochrome Pastel** - Padukan nuansa pastel senada untuk tampilan yang elegan dan harmonis.
2. **Pastel + Netral** - Kombinasikan dengan warna netral seperti putih, beige, atau abu-abu untuk tampilan yang balanced.
3. **Bold Accent** - Tambahkan satu aksen bold seperti merah atau hitam untuk kontras yang menarik.
4. **Aksesoris Pastel** - Mulai dari kalung, tas, hingga hijab pastel bisa menjadi statement piece.

### Warna Pastel yang Wajib Dimiliki

- **Lavender** - Warna ungu muda yang romantis dan feminin
- **Mint Green** - Segar dan modern, cocok untuk semua skin tone
- **Peach** - Warm dan welcoming, memberikan glow pada wajah
- **Baby Blue** - Klasik dan timeless, selalu terlihat stylish
- **Blush Pink** - Feminin dan lembut, favorit banyak wanita

### Penutup

Trend warna pastel di 2024 bukan hanya tentang mengikuti fashion, tetapi juga tentang mengekspresikan kepribadian yang lembut namun tetap stylish. Jangan takut untuk bereksperimen dengan warna-warna cantik ini!`,
        excerpt: 'Tahun 2024 membawa angin segar dengan dominasi warna pastel. Simak tips dan inspirasi padu padan warna pastel yang stylish.',
        coverImage: '/images/blog/blog-1.png',
        author: 'Tim LUXE Fashion',
        metaTitle: 'Trend Fashion 2024: Warna Pastel Dominasi - LUXE Fashion Blog',
        metaDesc: 'Simak trend fashion 2024 dengan dominasi warna pastel. Tips padu padan dan inspirasi outfit pastel yang stylish.',
        isPublished: true,
      },
    }),
    db.blogPost.create({
      data: {
        title: 'Tips Mix and Match Outfit Kantor',
        slug: 'tips-mix-and-match-outfit-kantor',
        content: `## Tips Mix and Match Outfit Kantor

Tampil stylish di kantor bukan berarti harus ribet! Dengan mix and match yang tepat, kamu bisa tampil profesional sekaligus fashionable setiap hari. Berikut tips yang bisa kamu praktikkan:

### 1. Investasi pada Basic Items

Mulailah dengan mengoleksi basic items yang berkualitas:
- **Kemeja putih** - Must have item untuk pria maupun wanita
- **Blazer** - Outerwear yang bisa elevate tampilan apa pun
- **Celana formal hitam** - Classic dan selalu aman
- **Rok midi** - Feminin dan profesional

### 2. Play with Colors

Siapa bilang outfit kantor harus membosankan? Cobalah paduan warna-warna ini:
- Navy + Putih = Classic combo yang selalu works
- Blush + Abu-abu = Soft dan sophisticated
- Hitam + Gold accent = Elegant dan powerful

### 3. Layering adalah Kunci

Mastering layering bisa membuat outfit sederhana terlihat lebih kompleks:
- Blazer atas kemeja
- Cardigan atas dress
- Vest atas kaos

### 4. Aksesoris yang Tepat

Aksesoris bisa membuat perbedaan besar:
- **Jam tangan** - Memberikan kesan profesional
- **Kalung simple** - Menambah elegan tanpa berlebihan
- **Tas structured** - Terlihat lebih organized
- **Scarf** - Bisa menjadi statement piece

### 5. Sepatu yang Nyaman

Investasi pada sepatu kantor yang nyaman:
- Loafers atau oxford untuk pria
- Low heels atau flats untuk wanita
- Pilih warna netral: hitam, coklat, navy

### 6. Perhatikan Fabric

Bahan pakaian sangat mempengaruhi penampilan:
- Pilih katun atau linen untuk cuaca panas
- Pilih wool atau cashmere untuk cuaca dingin
- Hindari bahan yang mudah kusut

Dengan tips ini, kamu bisa tampil fashionable ke kantor setiap hari tanpa effort berlebihan!`,
        excerpt: 'Tampil stylish di kantor setiap hari dengan tips mix and match yang mudah diikuti. Dari basic items hingga aksesoris yang tepat.',
        coverImage: '/images/blog/blog-2.png',
        author: 'Tim LUXE Fashion',
        metaTitle: 'Tips Mix and Match Outfit Kantor - LUXE Fashion Blog',
        metaDesc: 'Tips mix and match outfit kantor untuk tampil profesional dan stylish setiap hari.',
        isPublished: true,
      },
    }),
    db.blogPost.create({
      data: {
        title: 'Panduan Ukuran Pakaian Online',
        slug: 'panduan-ukuran-pakaian-online',
        content: `## Panduan Ukuran Pakaian Online

Beli pakaian online sering kali membuat khawatir karena tidak bisa mencoba langsung. Tapi tenang! Dengan panduan ukuran yang tepat, kamu bisa mendapatkan pakaian yang pas meskipun belanja online.

### Cara Mengukur Tubuh dengan Benar

Sebelum belanja, pastikan kamu tahu ukuran tubuhmu:

**Untuk Wanita:**
1. **Lingkar Dada** - Ukur di bagian terlebar dada
2. **Lingkar Pinggang** - Ukur di bagian terkecil pinggang
3. **Lingkar Pinggul** - Ukur di bagian terlebar pinggul
4. **Panjang Baju** - Dari pundak ke bawah sesuai selera

**Untuk Pria:**
1. **Lingkar Dada** - Ukur di bagian terlebar dada
2. **Lingkar Pinggang** - Ukur di bagian pinggang
3. **Lebar Bahu** - Dari ujung bahu kiri ke kanan
4. **Panjang Baju** - Dari pundak ke bawah

### Panduan Ukuran Umum

| Size | Lingkar Dada (cm) | Lingkar Pinggang (cm) |
|------|-------------------|----------------------|
| XS   | 80-84             | 60-64                |
| S    | 84-88             | 64-68                |
| M    | 88-92             | 68-72                |
| L    | 92-96             | 72-76                |
| XL   | 96-100            | 76-80                |

### Tips untuk Hasil yang Akurat

1. **Ukur dengan pita ukur yang flexible**
2. **Ukur tanpa pakaian tebal** untuk hasil akurat
3. **Berdiri tegak dan rileks** saat mengukur
4. **Ukur 2-3 kali** dan ambil rata-rata
5. **Perhatikan size chart setiap brand** karena bisa berbeda

### Jika Ukuran di Antara Dua Size

Jika hasil ukuranmu di antara dua size:
- Untuk pakaian yang seharusnya **loose/oversize**, pilih **size yang lebih besar**
- Untuk pakaian yang seharusnya **fitted**, pilih **size yang lebih kecil**
- Saat ragu, selalu **pilih size yang lebih besar** karena lebih mudah di-alter

### Kebijakan Pengembalian LUXE Fashion

Di LUXE Fashion, kami menyediakan:
- ✅ Penukaran gratis dalam 7 hari
- ✅ Panduan ukuran detail di setiap produk
- ✅ Customer service siap membantu konsultasi ukuran

Jangan ragu untuk menghubungi customer service kami jika butuh bantuan dalam memilih ukuran yang tepat!`,
        excerpt: 'Panduan lengkap mengukur tubuh dan memilih ukuran pakaian online yang tepat. Tips agar belanja online tanpa khawatir salah size.',
        coverImage: '/images/blog/blog-3.png',
        author: 'Tim LUXE Fashion',
        metaTitle: 'Panduan Ukuran Pakaian Online - LUXE Fashion Blog',
        metaDesc: 'Panduan lengkap cara mengukur tubuh dan memilih ukuran pakaian yang tepat saat belanja online.',
        isPublished: true,
      },
    }),
  ]);

  console.log(`   ✅ Created ${blogPosts.length} blog posts`);

  // ============================
  // 10. ANALYTICS
  // ============================
  console.log('📊 Creating analytics data...');

  const analyticsData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    analyticsData.push({
      date: dateStr,
      visitors: Math.floor(Math.random() * 500) + 300,
      orders: Math.floor(Math.random() * 30) + 10,
      revenue: Math.floor(Math.random() * 5000000) + 2000000,
      pageViews: Math.floor(Math.random() * 2000) + 1000,
    });
  }

  for (const data of analyticsData) {
    await db.analytics.create({
      data,
    });
  }

  console.log(`   ✅ Created ${analyticsData.length} days of analytics data`);

  // ============================
  // VERIFICATION
  // ============================
  console.log('\n🔍 Verifying seed data...');

  const categoryCount = await db.category.count();
  const productCount = await db.product.count();
  const variationCount = await db.productVariation.count();
  const voucherCount = await db.voucher.count();
  const flashSaleItemCount = await db.flashSaleItem.count();
  const userCount = await db.user.count();
  const reviewCount = await db.review.count();
  const orderCount = await db.order.count();
  const orderItemCount = await db.orderItem.count();
  const blogPostCount = await db.blogPost.count();
  const analyticsCount = await db.analytics.count();
  const wishlistCount = await db.wishlist.count();

  console.log('\n📊 Seed Summary:');
  console.log(`   Categories:        ${categoryCount}`);
  console.log(`   Products:          ${productCount}`);
  console.log(`   Variations:        ${variationCount}`);
  console.log(`   Vouchers:          ${voucherCount}`);
  console.log(`   Flash Sale Items:  ${flashSaleItemCount}`);
  console.log(`   Users:             ${userCount}`);
  console.log(`   Reviews:           ${reviewCount}`);
  console.log(`   Orders:            ${orderCount}`);
  console.log(`   Order Items:       ${orderItemCount}`);
  console.log(`   Blog Posts:        ${blogPostCount}`);
  console.log(`   Analytics Days:    ${analyticsCount}`);
  console.log(`   Wishlist Items:    ${wishlistCount}`);

  console.log('\n✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
