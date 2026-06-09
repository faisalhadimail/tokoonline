import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

// ==================== DATA ====================

const categories = [
  { name: 'Fashion Wanita', slug: 'fashion-wanita', description: 'Koleksi fashion wanita terkini' },
  { name: 'Fashion Pria', slug: 'fashion-pria', description: 'Pakaian pria stylish dan modern' },
  { name: 'Fashion Anak', slug: 'fashion-anak', description: 'Pakaian anak lucu dan nyaman' },
  { name: 'Sepatu', slug: 'sepatu', description: 'Sepatu branded dan lokal berkualitas' },
  { name: 'Tas', slug: 'tas', description: 'Tas fashion untuk segala kebutuhan' },
  { name: 'Aksesoris', slug: 'aksesoris', description: 'Aksesoris melengkapi penampilan Anda' },
  { name: 'Hijab', slug: 'hijab', description: 'Hijab modern dan elegan' },
  { name: 'Jam Tangan', slug: 'jam-tangan', description: 'Jam tangan original dan trendy' },
];

const products = [
  {
    name: 'Blouse Ruffle Elegant',
    slug: 'blouse-ruffle-elegant',
    description: 'Blouse wanita dengan detail ruffle yang elegan. Cocok untuk acara semi-formal maupun casual. Material: 100% Polyester premium yang ringan dan nyaman.',
    shortDesc: 'Blouse ruffle premium untuk tampilan elegan',
    price: 189000,
    comparePrice: 259000,
    sku: 'FW-BLR-001',
    barcode: '8991234567001',
    weight: 0.2,
    stock: 85,
    isFeatured: true,
    isNew: false,
    images: JSON.stringify(['/images/products/dress-1.png']),
    categorySlugs: ['fashion-wanita'],
    variations: [
      { color: 'Putih', size: 'S', sku: 'FW-BLR-001-WH-S', stock: 20, price: null },
      { color: 'Putih', size: 'M', sku: 'FW-BLR-001-WH-M', stock: 25, price: null },
      { color: 'Putih', size: 'L', sku: 'FW-BLR-001-WH-L', stock: 20, price: null },
      { color: 'Hitam', size: 'S', sku: 'FW-BLR-001-BK-S', stock: 10, price: null },
      { color: 'Hitam', size: 'M', sku: 'FW-BLR-001-BK-M', stock: 10, price: null },
    ],
  },
  {
    name: 'Kemeja Linen Premium',
    slug: 'kemeja-linen-premium',
    description: 'Kemeja pria dari material linen premium yang breathable. Cocok untuk cuaca tropis Indonesia. Tampilan smart casual yang timeless.',
    shortDesc: 'Kemeja linen breathable untuk pria',
    price: 249000,
    comparePrice: 329000,
    sku: 'FP-KLN-001',
    barcode: '8991234567002',
    weight: 0.25,
    stock: 60,
    isFeatured: true,
    isNew: false,
    images: JSON.stringify(['/images/products/shirt-1.png']),
    categorySlugs: ['fashion-pria'],
    variations: [
      { color: 'Navy', size: 'M', sku: 'FP-KLN-001-NV-M', stock: 15, price: null },
      { color: 'Navy', size: 'L', sku: 'FP-KLN-001-NV-L', stock: 15, price: null },
      { color: 'Navy', size: 'XL', sku: 'FP-KLN-001-NV-XL', stock: 10, price: null },
      { color: 'Cream', size: 'M', sku: 'FP-KLN-001-CR-M', stock: 10, price: null },
      { color: 'Cream', size: 'L', sku: 'FP-KLN-001-CR-L', stock: 10, price: null },
    ],
  },
  {
    name: 'Gamis Syar\'i Premium',
    slug: 'gamis-syari-premium',
    description: 'Gamis syar\'i dengan material jersey premium yang jatuh sempurna. Desain simple yet elegant dengan detail plisket. Cocok untuk harian maupun acara.',
    shortDesc: 'Gamis syar\'i jersey premium plisket',
    price: 345000,
    comparePrice: 450000,
    sku: 'FW-GMS-001',
    barcode: '8991234567003',
    weight: 0.35,
    stock: 40,
    isFeatured: true,
    isNew: true,
    images: JSON.stringify(['/images/products/hijab-1.png']),
    categorySlugs: ['fashion-wanita', 'hijab'],
    variations: [
      { color: 'Maroon', size: 'M', sku: 'FW-GMS-001-MR-M', stock: 10, price: null },
      { color: 'Maroon', size: 'L', sku: 'FW-GMS-001-MR-L', stock: 10, price: null },
      { color: 'Maroon', size: 'XL', sku: 'FW-GMS-001-MR-XL', stock: 5, price: null },
      { color: 'Dusty Pink', size: 'M', sku: 'FW-GMS-001-DP-M', stock: 8, price: null },
      { color: 'Dusty Pink', size: 'L', sku: 'FW-GMS-001-DP-L', stock: 7, price: null },
    ],
  },
  {
    name: 'Sneakers Urban Classic',
    slug: 'sneakers-urban-classic',
    description: 'Sepatu sneakers dengan desain klasik yang tidak pernah ketinggalan zaman. Sol empuk dan ringan, cocok untuk aktivitas seharian. Upper material kulit sintetis.',
    shortDesc: 'Sneakers klasik untuk aktivitas harian',
    price: 299000,
    comparePrice: 429000,
    sku: 'SP-URB-001',
    barcode: '8991234567004',
    weight: 0.8,
    stock: 50,
    isFeatured: true,
    isNew: false,
    images: JSON.stringify(['/images/products/shoes-1.png']),
    categorySlugs: ['sepatu'],
    variations: [
      { color: 'Putih', size: '39', sku: 'SP-URB-001-WH-39', stock: 10, price: null },
      { color: 'Putih', size: '40', sku: 'SP-URB-001-WH-40', stock: 10, price: null },
      { color: 'Putih', size: '41', sku: 'SP-URB-001-WH-41', stock: 10, price: null },
      { color: 'Putih', size: '42', sku: 'SP-URB-001-WH-42', stock: 10, price: null },
      { color: 'Putih', size: '43', sku: 'SP-URB-001-WH-43', stock: 10, price: null },
    ],
  },
  {
    name: 'Tas Tote Premium Canvas',
    slug: 'tas-tote-premium-canvas',
    description: 'Tas tote berbahan kanvas premium dengan kapasitas besar. Dilengkapi resleting untuk keamanan barang. Cocok untuk kerja, kuliah, atau jalan-jalan.',
    shortDesc: 'Tas tote canvas kapasitas besar',
    price: 175000,
    comparePrice: 225000,
    sku: 'TS-TOT-001',
    barcode: '8991234567005',
    weight: 0.5,
    stock: 70,
    isFeatured: true,
    isNew: true,
    images: JSON.stringify(['/images/products/bag-1.png']),
    categorySlugs: ['tas'],
    variations: [
      { color: 'Hitam', size: 'One Size', sku: 'TS-TOT-001-BK-OS', stock: 25, price: null },
      { color: 'Coklat', size: 'One Size', sku: 'TS-TOT-001-BR-OS', stock: 25, price: null },
      { color: 'Army', size: 'One Size', sku: 'TS-TOT-001-AR-OS', stock: 20, price: null },
    ],
  },
  {
    name: 'Jam Tangan Digital Sport',
    slug: 'jam-tangan-digital-sport',
    description: 'Jam tangan digital dengan fitur lengkap: stopwatch, alarm, backlight, water resistant 50m. Desain sporty dan tangguh untuk segala aktivitas.',
    shortDesc: 'Jam digital sport water resistant 50m',
    price: 425000,
    comparePrice: 550000,
    sku: 'JT-DSP-001',
    barcode: '8991234567006',
    weight: 0.1,
    stock: 35,
    isFeatured: true,
    isNew: false,
    images: JSON.stringify(['/images/products/watch-1.png']),
    categorySlugs: ['jam-tangan'],
    variations: [
      { color: 'Hitam', size: 'One Size', sku: 'JT-DSP-001-BK-OS', stock: 15, price: null },
      { color: 'Silver', size: 'One Size', sku: 'JT-DSP-001-SL-OS', stock: 10, price: null },
      { color: 'Navy', size: 'One Size', sku: 'JT-DSP-001-NV-OS', stock: 10, price: null },
    ],
  },
  {
    name: 'Celana Jogger Slim Fit',
    slug: 'celana-jogger-slim-fit',
    description: 'Celana jogger slim fit dengan material cotton terry yang lembut. Cocok untuk olahraga ringan, hangout, atau sebagai daily wear. Elastic waistband.',
    shortDesc: 'Jogger slim fit cotton terry premium',
    price: 199000,
    comparePrice: 275000,
    sku: 'FP-JOG-001',
    barcode: '8991234567007',
    weight: 0.3,
    stock: 90,
    isFeatured: false,
    isNew: true,
    images: JSON.stringify(['/images/products/shirt-1.png']),
    categorySlugs: ['fashion-pria'],
    variations: [
      { color: 'Hitam', size: 'M', sku: 'FP-JOG-001-BK-M', stock: 20, price: null },
      { color: 'Hitam', size: 'L', sku: 'FP-JOG-001-BK-L', stock: 20, price: null },
      { color: 'Hitam', size: 'XL', sku: 'FP-JOG-001-BK-XL', stock: 15, price: null },
      { color: 'Abu', size: 'M', sku: 'FP-JOG-001-GR-M', stock: 15, price: null },
      { color: 'Abu', size: 'L', sku: 'FP-JOG-001-GR-L', stock: 20, price: null },
    ],
  },
  {
    name: 'Set Baju Anak Lucu',
    slug: 'set-baju-anak-lucu',
    description: 'Set baju anak (atasan + celana) dengan motif kartun yang lucu dan menarik. Material cotton combed 24s yang lembut untuk kulit sensitif anak.',
    shortDesc: 'Set baju anak cotton combed motif kartun',
    price: 129000,
    comparePrice: 175000,
    sku: 'FA-SET-001',
    barcode: '8991234567008',
    weight: 0.15,
    stock: 120,
    isFeatured: false,
    isNew: true,
    images: JSON.stringify(['/images/products/kids-1.png']),
    categorySlugs: ['fashion-anak'],
    variations: [
      { color: 'Biru', size: '2-3T', sku: 'FA-SET-001-BL-23', stock: 30, price: null },
      { color: 'Biru', size: '3-4T', sku: 'FA-SET-001-BL-34', stock: 30, price: null },
      { color: 'Pink', size: '2-3T', sku: 'FA-SET-001-PK-23', stock: 30, price: null },
      { color: 'Pink', size: '3-4T', sku: 'FA-SET-001-PK-34', stock: 30, price: null },
    ],
  },
  {
    name: 'Kalung Pendant Minimalis',
    slug: 'kalung-pendant-minimalis',
    description: 'Kalung pendant dengan desain minimalis modern. Berbahan stainless steel anti karat dengan rantai box chain. Cocok untuk daily wear dan tampilan elegan.',
    shortDesc: 'Kalung stainless steel anti karat minimalis',
    price: 89000,
    comparePrice: 135000,
    sku: 'AK-KLN-001',
    barcode: '8991234567009',
    weight: 0.05,
    stock: 200,
    isFeatured: false,
    isNew: true,
    images: JSON.stringify(['/images/products/acc-1.png']),
    categorySlugs: ['aksesoris'],
    variations: [
      { color: 'Gold', size: 'One Size', sku: 'AK-KLN-001-GD-OS', stock: 70, price: null },
      { color: 'Silver', size: 'One Size', sku: 'AK-KLN-001-SL-OS', stock: 70, price: null },
      { color: 'Rose Gold', size: 'One Size', sku: 'AK-KLN-001-RG-OS', stock: 60, price: null },
    ],
  },
  {
    name: 'Hijab Pashmina Voal Premium',
    slug: 'hijab-pashmina-voal-premium',
    description: 'Hijab pashmina dari material voal super premium yang halus, ringan, dan tidak mudah kusut. Tekstur crinkle yang natural. Mudah dibentuk dan nyaman sepanjang hari.',
    shortDesc: 'Pashmina voal super premium anti kusut',
    price: 79000,
    comparePrice: 110000,
    sku: 'HJ-PSH-001',
    barcode: '8991234567010',
    weight: 0.1,
    stock: 150,
    isFeatured: false,
    isNew: false,
    images: JSON.stringify(['/images/products/hijab-1.png']),
    categorySlugs: ['hijab'],
    variations: [
      { color: 'Sage', size: 'One Size', sku: 'HJ-PSH-001-SG-OS', stock: 30, price: null },
      { color: 'Mauve', size: 'One Size', sku: 'HJ-PSH-001-MV-OS', stock: 30, price: null },
      { color: 'Caramel', size: 'One Size', sku: 'HJ-PSH-001-CM-OS', stock: 30, price: null },
      { color: 'Hitam', size: 'One Size', sku: 'HJ-PSH-001-BK-OS', stock: 30, price: null },
      { color: 'Milktea', size: 'One Size', sku: 'HJ-PSH-001-MT-OS', stock: 30, price: null },
    ],
  },
  {
    name: 'Dress Midi Floral Summer',
    slug: 'dress-midi-floral-summer',
    description: 'Dress midi motif floral yang cantik untuk summer. Bahan chiffon premium yang ringan dan jatuh sempurna. Cocok untuk hangout dan acara outdoor.',
    shortDesc: 'Dress midi floral chiffon untuk summer',
    price: 275000,
    comparePrice: 380000,
    sku: 'FW-DRS-001',
    barcode: '8991234567011',
    weight: 0.2,
    stock: 45,
    isFeatured: false,
    isNew: true,
    images: JSON.stringify(['/images/products/dress-1.png']),
    categorySlugs: ['fashion-wanita'],
    variations: [
      { color: 'Floral Pink', size: 'S', sku: 'FW-DRS-001-FP-S', stock: 10, price: null },
      { color: 'Floral Pink', size: 'M', sku: 'FW-DRS-001-FP-M', stock: 10, price: null },
      { color: 'Floral Pink', size: 'L', sku: 'FW-DRS-001-FP-L', stock: 10, price: null },
      { color: 'Floral Blue', size: 'S', sku: 'FW-DRS-001-FB-S', stock: 5, price: null },
      { color: 'Floral Blue', size: 'M', sku: 'FW-DRS-001-FB-M', stock: 5, price: null },
      { color: 'Floral Blue', size: 'L', sku: 'FW-DRS-001-FB-L', stock: 5, price: null },
    ],
  },
  {
    name: 'Heels Pump Classic',
    slug: 'heels-pump-classic',
    description: 'Sepatu heels pump klasik berbahan kulit sintetis premium. Tinggi hak 7cm yang nyaman untuk dipakai seharian. Cocok untuk ke kantor dan acara formal.',
    shortDesc: 'Heels pump kulit sintetis 7cm',
    price: 329000,
    comparePrice: 450000,
    sku: 'SP-HPM-001',
    barcode: '8991234567012',
    weight: 0.6,
    stock: 35,
    isFeatured: false,
    isNew: false,
    images: JSON.stringify(['/images/products/shoes-1.png']),
    categorySlugs: ['sepatu'],
    variations: [
      { color: 'Hitam', size: '37', sku: 'SP-HPM-001-BK-37', stock: 7, price: null },
      { color: 'Hitam', size: '38', sku: 'SP-HPM-001-BK-38', stock: 7, price: null },
      { color: 'Hitam', size: '39', sku: 'SP-HPM-001-BK-39', stock: 7, price: null },
      { color: 'Nude', size: '37', sku: 'SP-HPM-001-ND-37', stock: 5, price: null },
      { color: 'Nude', size: '38', sku: 'SP-HPM-001-ND-38', stock: 5, price: null },
      { color: 'Nude', size: '39', sku: 'SP-HPM-001-ND-39', stock: 4, price: null },
    ],
  },
  {
    name: 'Tas Selempang Mini',
    slug: 'tas-selempang-mini',
    description: 'Tas selempang mini berbahan kulit PU premium. Ukuran compact tapi muat HP, dompet, dan barang esensial lainnya. Adjustable strap.',
    shortDesc: 'Tas selempang mini kulit PU premium',
    price: 149000,
    comparePrice: 199000,
    sku: 'TS-SLP-001',
    barcode: '8991234567013',
    weight: 0.3,
    stock: 80,
    isFeatured: false,
    isNew: true,
    images: JSON.stringify(['/images/products/bag-1.png']),
    categorySlugs: ['tas'],
    variations: [
      { color: 'Hitam', size: 'One Size', sku: 'TS-SLP-001-BK-OS', stock: 25, price: null },
      { color: 'Coklat', size: 'One Size', sku: 'TS-SLP-001-BR-OS', stock: 25, price: null },
      { color: 'Maroon', size: 'One Size', sku: 'TS-SLP-001-MR-OS', stock: 15, price: null },
      { color: 'Army', size: 'One Size', sku: 'TS-SLP-001-AR-OS', stock: 15, price: null },
    ],
  },
  {
    name: 'Gelang Rantai Gold Plated',
    slug: 'gelang-rantai-gold-plated',
    description: 'Gelang rantai gold plated 18K yang elegan. Material stainless steel berlapis emas yang tahan lama. Cocok untuk pria dan wanita. Water resistant.',
    shortDesc: 'Gelang gold plated 18K water resistant',
    price: 65000,
    comparePrice: 95000,
    sku: 'AK-GLG-001',
    barcode: '8991234567014',
    weight: 0.03,
    stock: 250,
    isFeatured: false,
    isNew: true,
    images: JSON.stringify(['/images/products/acc-1.png']),
    categorySlugs: ['aksesoris'],
    variations: [
      { color: 'Gold', size: 'One Size', sku: 'AK-GLG-001-GD-OS', stock: 100, price: null },
      { color: 'Silver', size: 'One Size', sku: 'AK-GLG-001-SL-OS', stock: 80, price: null },
      { color: 'Rose Gold', size: 'One Size', sku: 'AK-GLG-001-RG-OS', stock: 70, price: null },
    ],
  },
  {
    name: 'Kaos Oversize Unisex',
    slug: 'kaos-oversize-unisex',
    description: 'Kaos oversize cotton combed 30s yang nyaman dan trendy. Bisa dipakai pria dan wanita. Cocok untuk daily wear, hangout, atau layered outfit.',
    shortDesc: 'Kaos oversize cotton combed 30s unisex',
    price: 119000,
    comparePrice: 165000,
    sku: 'FP-KOS-001',
    barcode: '8991234567015',
    weight: 0.2,
    stock: 200,
    isFeatured: false,
    isNew: false,
    images: JSON.stringify(['/images/products/shirt-1.png']),
    categorySlugs: ['fashion-pria', 'fashion-wanita'],
    variations: [
      { color: 'Hitam', size: 'L', sku: 'FP-KOS-001-BK-L', stock: 40, price: null },
      { color: 'Hitam', size: 'XL', sku: 'FP-KOS-001-BK-XL', stock: 40, price: null },
      { color: 'Putih', size: 'L', sku: 'FP-KOS-001-WH-L', stock: 40, price: null },
      { color: 'Putih', size: 'XL', sku: 'FP-KOS-001-WH-XL', stock: 40, price: null },
      { color: 'Cream', size: 'L', sku: 'FP-KOS-001-CR-L', stock: 20, price: null },
      { color: 'Cream', size: 'XL', sku: 'FP-KOS-001-CR-XL', stock: 20, price: null },
    ],
  },
  {
    name: 'Sandal Slide EVA Comfort',
    slug: 'sandal-slide-eva-comfort',
    description: 'Sandal slide dengan sol EVA yang super empuk dan ringan. Anti slip, water friendly, cocok untuk dalam dan luar rumah. Unisex design.',
    shortDesc: 'Sandal slide EVA empuk anti slip unisex',
    price: 59000,
    comparePrice: 89000,
    sku: 'SP-SDL-001',
    barcode: '8991234567016',
    weight: 0.3,
    stock: 300,
    isFeatured: false,
    isNew: true,
    images: JSON.stringify(['/images/products/shoes-1.png']),
    categorySlugs: ['sepatu'],
    variations: [
      { color: 'Hitam', size: '39', sku: 'SP-SDL-001-BK-39', stock: 30, price: null },
      { color: 'Hitam', size: '40', sku: 'SP-SDL-001-BK-40', stock: 30, price: null },
      { color: 'Hitam', size: '41', sku: 'SP-SDL-001-BK-41', stock: 30, price: null },
      { color: 'Hitam', size: '42', sku: 'SP-SDL-001-BK-42', stock: 30, price: null },
      { color: 'Hitam', size: '43', sku: 'SP-SDL-001-BK-43', stock: 30, price: null },
    ],
  },
];

const users = [
  {
    name: 'Admin LUXE',
    email: 'admin@luxefashion.com',
    password: '$2b$10$placeholder_hash_for_admin',
    phone: '+62 812 0000 0001',
    role: 'admin',
    memberLevel: 'admin',
    points: 0,
    isActive: true,
  },
  {
    name: 'Sari Dewi',
    email: 'sari.dewi@email.com',
    password: '$2b$10$placeholder_hash',
    phone: '+62 812 3456 7891',
    role: 'customer',
    memberLevel: 'gold',
    points: 2500,
    isActive: true,
  },
  {
    name: 'Budi Santoso',
    email: 'budi.santoso@email.com',
    password: '$2b$10$placeholder_hash',
    phone: '+62 813 9876 5432',
    role: 'customer',
    memberLevel: 'silver',
    points: 1200,
    isActive: true,
  },
  {
    name: 'Anisa Rahma',
    email: 'anisa.rahma@email.com',
    password: '$2b$10$placeholder_hash',
    phone: '+62 857 1234 5678',
    role: 'customer',
    memberLevel: 'silver',
    points: 800,
    isActive: true,
  },
  {
    name: 'Dian Pratama',
    email: 'dian.pratama@email.com',
    password: '$2b$10$placeholder_hash',
    phone: '+62 878 9876 1234',
    role: 'customer',
    memberLevel: 'gold',
    points: 3400,
    isActive: true,
  },
];

const blogPosts = [
  {
    title: '5 Tren Fashion 2024 yang Wajib Kamu Tahu',
    slug: '5-tren-fashion-2024-wajib-kamu-tahu',
    excerpt: 'Tahun 2024 membawa berbagai tren fashion baru yang fresh dan exciting. Simak 5 tren terbesar yang akan mendominasi dunia fashion tahun ini.',
    content: `<h2>Tren Fashion 2024</h2><p>Tahun 2024 membawa revolusi dalam dunia fashion. Berikut 5 tren terbesar yang wajib kamu tahu:</p><h3>1. Quiet Luxury</h3><p>Tampil mewah tanpa logo berlebihan. Fokus pada kualitas bahan dan potongan yang sempurna.</p><h3>2. Bold Colors</h3><p>Warna-warna cerah dan bold seperti fuchsia, electric blue, dan lime green menjadi statement.</p><h3>3. Oversized Everything</h3><p>Siluet oversize tetap dominan, dari blazer hingga celana wide-leg yang nyaman.</p><h3>4. Sustainable Fashion</h3><p>Fashion berkelanjutan semakin populer. Pilihan bahan ramah lingkungan menjadi prioritas.</p><h3>5. Y2K Revival</h3><p>Nostalgia era 2000-an kembali dengan crop top, low-rise jeans, dan aksesoris bling-bling.</p>`,
    author: 'LUXE Fashion Team',
    coverImage: '/images/banners/hero1.png',
    isPublished: true,
  },
  {
    title: 'Tips Memilih Hijab Sesuai Bentuk Wajah',
    slug: 'tips-memilih-hijab-sesuai-bentuk-wajah',
    excerpt: 'Memilih hijab yang tepat bisa menonjolkan kecantikan wajahmu. Berikut panduan lengkap untuk berbagai bentuk wajah.',
    content: `<h2>Panduan Memilih Hijab</h2><p>Hijab bukan hanya penutup aurat, tapi juga bagian dari fashion yang bisa meningkatkan kepercayaan diri.</p><h3>Wajah Oval</h3><p>Bentuk wajah oval paling fleksibel. Hampir semua gaya hijab cocok!</p><h3>Wajah Bulat</h3><p>Pilih hijab dengan drape yang jatuh di bawah dagu untuk memberi kesan tirus.</p><h3>Wajah Kotak</h3><p>Gunakan hijab dengan layer dan volume di area pipi untuk melunakkan sudut wajah.</p><h3>Wajah Hati</h3><p>Pashmina yang dililit longgar di bawah dagu bisa menyeimbangkan proporsi wajah.</p>`,
    author: 'LUXE Fashion Team',
    coverImage: '/images/banners/hero2.png',
    isPublished: true,
  },
  {
    title: 'Cara Merawat Baju Agar Awet dan Tetap Berwarna',
    slug: 'cara-merawat-baju-awet-tetap-berwarna',
    excerpt: 'Baju favoritmu cepat pudar? Simak tips merawat pakaian agar tetap awet, warna tetap cerah, dan bahan tetap bagus.',
    content: `<h2>Tips Perawatan Pakaian</h2><p>Merawat pakaian dengan benar bisa memperpanjang usia pakai dan menjaga kualitasnya.</p><h3>Pisahkan Warna</h3><p>Selalu pisahkan pakaian berwarna gelap, terang, dan putih saat mencuci.</p><h3>Gunakan Deterjen Lembut</h3><p>Pilih deterjen yang gentle untuk bahan premium seperti linen dan silk.</p><h3>Hindari Mesin Pengering</h3><p>Jemur di tempat teduh untuk menjaga warna dan elastisitas bahan.</p><h3>Setrika dengan Suhu Tepat</h3><p>Sesuaikan suhu setrika dengan jenis bahan pakaian.</p>`,
    author: 'LUXE Fashion Team',
    coverImage: '/images/products/dress-1.png',
    isPublished: true,
  },
];

const vouchers = [
  {
    code: 'WELCOME50',
    type: 'percentage',
    value: 50,
    minPurchase: 200000,
    maxDiscount: 100000,
    quota: 100,
    used: 23,
    isActive: true,
  },
  {
    code: 'HEMAT30K',
    type: 'fixed',
    value: 30000,
    minPurchase: 150000,
    quota: 200,
    used: 87,
    isActive: true,
  },
  {
    code: 'FLASH20',
    type: 'percentage',
    value: 20,
    minPurchase: 100000,
    maxDiscount: 75000,
    quota: 150,
    used: 0,
    isActive: true,
  },
];

const promos = [
  {
    name: 'Promo Diskon Akhir Bulan',
    code: 'AKHIRBULAN25',
    description: 'Diskon 25% untuk semua produk tanpa minimum pembelian!',
    type: 'percentage',
    value: 25,
    scope: 'global',
    productIds: '[]',
    minPurchase: 0,
    maxDiscount: 150000,
    quota: 500,
    used: 124,
    isActive: true,
    bannerText: 'DISKON 25% ALL ITEM',
    bannerSubtext: 'Gunakan kode: AKHIRBULAN25 — Berlaku untuk semua produk',
    bannerBg: 'from-rose-600 to-rose-500',
  },
  {
    name: 'Potongan Ongkir Jabodetabek',
    code: 'FREEONGKIR',
    description: 'Gratis ongkir hingga Rp 25.000 untuk pengiriman ke area Jabodetabek',
    type: 'shipping',
    value: 25000,
    scope: 'global',
    productIds: '[]',
    minPurchase: 200000,
    maxDiscount: null,
    quota: 300,
    used: 56,
    isActive: true,
    bannerText: 'FREE ONGKIR JABODETABEK',
    bannerSubtext: 'Min. belanja Rp 200rb — Gunakan kode: FREEONGKIR',
    bannerBg: 'from-emerald-600 to-emerald-500',
  },
  {
    name: 'Diskon Spesial Fashion Wanita',
    code: 'WOMENSDAY',
    description: 'Diskon 30% khusus kategori Fashion Wanita dan Hijab',
    type: 'percentage',
    value: 30,
    scope: 'per_item',
    productIds: '[]', // will be updated with actual product IDs
    minPurchase: 100000,
    maxDiscount: 200000,
    quota: 200,
    used: 33,
    isActive: true,
    bannerText: 'WOMEN\'S DAY SPECIAL 30% OFF',
    bannerSubtext: 'Khusus Fashion Wanita & Hijab — Kode: WOMENSDAY',
    bannerBg: 'from-violet-600 to-purple-500',
  },
];

// ==================== SEED FUNCTION ====================

async function seed() {
  console.log('🌱 Seeding database...\n');

  // 1. Clean existing data (order matters due to FK constraints)
  console.log('🧹 Cleaning existing data...');
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.review.deleteMany();
  await db.wishlist.deleteMany();
  await db.flashSaleItem.deleteMany();
  await db.flashSale.deleteMany();
  await db.productVariation.deleteMany();
  await db.categoryProduct.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.user.deleteMany();
  await db.address.deleteMany();
  await db.blogPost.deleteMany();
  await db.voucher.deleteMany();
  await db.promo.deleteMany();
  await db.analytics.deleteMany();
  await db.storeSettings.deleteMany();
  console.log('✓ Data cleaned\n');

  // 2. Create Categories
  console.log('📁 Creating categories...');
  const createdCategories: Record<string, string> = {};
  for (const cat of categories) {
    const created = await db.category.create({ data: cat });
    createdCategories[cat.slug] = created.id;
    console.log(`  ✓ ${cat.name}`);
  }
  console.log(`✓ ${categories.length} categories created\n`);

  // 3. Create Products with Variations and Category links
  console.log('👕 Creating products...');
  const createdProducts: string[] = [];
  for (const p of products) {
    const { categorySlugs, variations, ...productData } = p;
    const product = await db.product.create({ data: productData });
    createdProducts.push(product.id);

    // Link to categories
    for (const slug of categorySlugs) {
      if (createdCategories[slug]) {
        await db.categoryProduct.create({
          data: { categoryId: createdCategories[slug], productId: product.id },
        });
      }
    }

    // Create variations
    for (const v of variations) {
      await db.productVariation.create({
        data: { ...v, productId: product.id },
      });
    }

    console.log(`  ✓ ${p.name}`);
  }
  console.log(`✓ ${products.length} products created\n`);

  // 4. Create Users
  console.log('👤 Creating users...');
  const createdUsers: string[] = [];
  for (const u of users) {
    const user = await db.user.create({ data: u });
    createdUsers.push(user.id);
    console.log(`  ✓ ${u.name} (${u.email})`);
  }
  console.log(`✓ ${users.length} users created\n`);

  // 5. Create Addresses
  console.log('📍 Creating addresses...');
  const addresses = [
    { userId: createdUsers[1], label: 'Rumah', recipient: 'Sari Dewi', phone: '+62 812 3456 7891', address: 'Jl. Melati No. 15, RT 03/RW 05', city: 'Jakarta Selatan', province: 'DKI Jakarta', postalCode: '12345', isDefault: true },
    { userId: createdUsers[1], label: 'Kantor', recipient: 'Sari Dewi', phone: '+62 812 3456 7891', address: 'Jl. Sudirman Kav. 52-53, Lantai 8', city: 'Jakarta Selatan', province: 'DKI Jakarta', postalCode: '12190', isDefault: false },
    { userId: createdUsers[2], label: 'Rumah', recipient: 'Budi Santoso', phone: '+62 813 9876 5432', address: 'Jl. Anggrek No. 27', city: 'Bandung', province: 'Jawa Barat', postalCode: '40115', isDefault: true },
    { userId: createdUsers[3], label: 'Rumah', recipient: 'Anisa Rahma', phone: '+62 857 1234 5678', address: 'Jl. Kenanga Raya No. 8, Blok C3', city: 'Surabaya', province: 'Jawa Timur', postalCode: '60234', isDefault: true },
    { userId: createdUsers[4], label: 'Rumah', recipient: 'Dian Pratama', phone: '+62 878 9876 1234', address: 'Jl. Sunset Road No. 12', city: 'Denpasar', province: 'Bali', postalCode: '80361', isDefault: true },
  ];
  for (const a of addresses) {
    await db.address.create({ data: a });
  }
  console.log(`✓ ${addresses.length} addresses created\n`);

  // 6. Create Orders
  console.log('📦 Creating orders...');
  const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const paymentMethods = ['transfer_bca', 'transfer_mandiri', 'ewallet_gopay', 'cod'];
  const couriers = ['JNE', 'J&T', 'SiCepat'];
  const courierServices = ['Reguler', 'YES', 'Express'];

  for (let i = 0; i < 8; i++) {
    const userIdx = 1 + (i % 4);
    const numItems = 1 + Math.floor(Math.random() * 3);
    const subtotal = 150000 + Math.floor(Math.random() * 500000);
    const shippingCost = 15000 + Math.floor(Math.random() * 20000);
    const discount = Math.floor(Math.random() * 50000);
    const total = Math.max(0, subtotal + shippingCost - discount);
    const status = orderStatuses[Math.min(i, orderStatuses.length - 1)];
    const orderDate = new Date(Date.now() - (8 - i) * 24 * 60 * 60 * 1000);

    const order = await db.order.create({
      data: {
        orderNumber: `ORD-${String(1000 + i).padStart(4, '0')}`,
        userId: createdUsers[userIdx],
        status,
        subtotal,
        shippingCost,
        discount,
        total,
        paymentMethod: paymentMethods[i % paymentMethods.length],
        paymentStatus: ['delivered', 'shipped'].includes(status) ? 'paid' : status === 'cancelled' ? 'expired' : 'pending',
        courier: couriers[i % couriers.length],
        courierService: courierServices[i % courierServices.length],
        trackingNumber: status === 'shipped' || status === 'delivered'
          ? `${couriers[i % couriers.length].toUpperCase()}${String(1000000000 + Math.floor(Math.random() * 9000000000))}`
          : null,
        shippingAddress: JSON.stringify({
          recipient: users[userIdx].name,
          phone: users[userIdx].phone,
          address: 'Jl. Contoh No. ' + (10 + i),
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345',
        }),
        paidAt: ['delivered', 'shipped'].includes(status) ? orderDate : null,
        createdAt: orderDate,
        updatedAt: orderDate,
      },
    });

    // Create order items
    for (let j = 0; j < numItems; j++) {
      const productIdx = (i + j) % createdProducts.length;
      const product = await db.product.findUnique({ where: { id: createdProducts[productIdx] } });
      if (product) {
        const qty = 1 + Math.floor(Math.random() * 2);
        await db.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            productName: product.name,
            productImage: JSON.parse(product.images)[0] || null,
            variation: `${['Hitam', 'Putih', 'Navy'][j % 3]} / ${['M', 'L', 'One Size'][j % 3]}`,
            price: product.price,
            quantity: qty,
            subtotal: product.price * qty,
          },
        });
      }
    }
    console.log(`  ✓ ${order.orderNumber} - ${status} - Rp ${total.toLocaleString('id-ID')}`);
  }
  console.log(`✓ 8 orders created\n`);

  // 7. Create Reviews
  console.log('⭐ Creating reviews...');
  const reviewComments = [
    { rating: 5, title: 'Sangat Puas!', comment: 'Kualitas bahan sangat bagus dan pengiriman cepat. Recommended!' },
    { rating: 5, title: 'Premium Quality', comment: 'Harga terjangkau dengan kualitas premium. Pasti beli lagi!' },
    { rating: 4, title: 'Bagus Banget', comment: 'Koleksi lengkap dan modern. Packing rapi dan aman.' },
    { rating: 5, title: 'Love it!', comment: 'Cocok banget, sesuai ekspektasi. Material nyaman dipakai.' },
    { rating: 4, title: 'Worth the Price', comment: 'Harga worth it banget untuk kualitas yang didapat.' },
    { rating: 3, title: 'Cukup Baik', comment: 'Bagus tapi ukuran agak longgar. Overall oke.' },
  ];

  for (let i = 0; i < 10; i++) {
    const userIdx = 1 + (i % 4);
    const productIdx = i % createdProducts.length;
    const reviewData = reviewComments[i % reviewComments.length];
    await db.review.create({
      data: {
        userId: createdUsers[userIdx],
        productId: createdProducts[productIdx],
        ...reviewData,
        isVerified: Math.random() > 0.3,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log(`✓ 10 reviews created\n`);

  // 8. Create Blog Posts
  console.log('📝 Creating blog posts...');
  for (const post of blogPosts) {
    await db.blogPost.create({ data: post });
    console.log(`  ✓ ${post.title}`);
  }
  console.log(`✓ ${blogPosts.length} blog posts created\n`);

  // 9. Create Vouchers
  console.log('🎫 Creating vouchers...');
  for (const v of vouchers) {
    await db.voucher.create({ data: v });
    console.log(`  ✓ ${v.code} - ${v.type === 'percentage' ? `${v.value}%` : `Rp ${v.value.toLocaleString('id-ID')}`}`);
  }
  console.log(`✓ ${vouchers.length} vouchers created\n`);

  // 10. Create Promos (update per_item productIds)
  console.log('🎁 Creating promos...');
  // Get women's fashion and hijab product IDs for WOMENSDAY promo
  const womenCategory = await db.category.findUnique({ where: { slug: 'fashion-wanita' } });
  const hijabCategory = await db.category.findUnique({ where: { slug: 'hijab' } });
  let womenProductIds: string[] = [];
  if (womenCategory) {
    const cp1 = await db.categoryProduct.findMany({ where: { categoryId: womenCategory.id }, select: { productId: true } });
    womenProductIds.push(...cp1.map(c => c.productId));
  }
  if (hijabCategory) {
    const cp2 = await db.categoryProduct.findMany({ where: { categoryId: hijabCategory.id }, select: { productId: true } });
    womenProductIds.push(...cp2.map(c => c.productId));
  }
  // deduplicate
  womenProductIds = [...new Set(womenProductIds)];

  for (const promo of promos) {
    const data = { ...promo };
    if (promo.code === 'WOMENSDAY') {
      data.productIds = JSON.stringify(womenProductIds);
    }
    await db.promo.create({ data });
    console.log(`  ✓ ${promo.code} - ${promo.name}`);
  }
  console.log(`✓ ${promos.length} promos created\n`);

  // 11. Create Flash Sale
  console.log('⚡ Creating flash sale...');
  const flashSale = await db.flashSale.create({
    data: {
      name: 'Flash Sale Mingguan',
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  // Add first 4 products as flash sale items
  for (let i = 0; i < 4 && i < createdProducts.length; i++) {
    const product = await db.product.findUnique({ where: { id: createdProducts[i] } });
    if (product) {
      await db.flashSaleItem.create({
        data: {
          flashSaleId: flashSale.id,
          productId: product.id,
          salePrice: Math.round(product.price * 0.7), // 30% off
          maxQty: 20 + Math.floor(Math.random() * 30),
          soldQty: Math.floor(Math.random() * 10),
        },
      });
    }
  }
  console.log(`  ✓ Flash Sale "${flashSale.name}" with 4 items\n`);

  // 12. Create Analytics (last 30 days)
  console.log('📊 Creating analytics...');
  for (let i = 29; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    await db.analytics.create({
      data: {
        date: dateStr,
        visitors: 50 + Math.floor(Math.random() * 200),
        orders: 2 + Math.floor(Math.random() * 15),
        revenue: 500000 + Math.floor(Math.random() * 3000000),
        pageViews: 200 + Math.floor(Math.random() * 800),
      },
    });
  }
  console.log(`✓ 30 days analytics created\n`);

  // 13. StoreSettings is auto-created by API, but let's ensure it exists
  console.log('🏪 Ensuring store settings...');
  const existingSettings = await db.storeSettings.count();
  if (existingSettings === 0) {
    await db.storeSettings.create({
      data: {
        storeName: 'LUXE Fashion',
        storeTagline: 'Tampil Stylish Setiap Hari',
        storeEmail: 'hello@luxefashion.com',
        storePhone: '+62 812 3456 7890',
        whatsapp: '+62 812 3456 7890',
        storeAddress: 'Jl. Fashion Boulevard No. 88',
        storeCity: 'Jakarta Selatan',
        storeProvince: 'DKI Jakarta',
        storePostalCode: '12345',
        instagram: 'https://instagram.com/luxefashion',
        facebook: 'https://facebook.com/luxefashion',
        tiktok: 'https://tiktok.com/@luxefashion',
        metaTitle: 'LUXE Fashion - Toko Fashion Online Terlengkap',
        metaDesc: 'Belanja fashion terlengkap dengan harga terbaik. COD, pengiriman cepat, dan banyak promo menarik.',
        metaKeywords: 'fashion, baju, pakaian, online shop, jakarta',
        shippingMethods: JSON.stringify([
          { id: 'jne-reg', courier: 'JNE', service: 'Reguler', price: 18000, eta: '2-3 hari' },
          { id: 'jne-yes', courier: 'JNE', service: 'YES', price: 32000, eta: '1 hari' },
          { id: 'jnt-ez', courier: 'J&T', service: 'EZ', price: 15000, eta: '2-3 hari' },
          { id: 'sicepat-reg', courier: 'SiCepat', service: 'Reguler', price: 16000, eta: '2-3 hari' },
        ]),
        paymentMethods: JSON.stringify([
          { id: 'bca', name: 'BCA Transfer', type: 'bank' },
          { id: 'mandiri', name: 'Mandiri Transfer', type: 'bank' },
          { id: 'bri', name: 'BRI Transfer', type: 'bank' },
          { id: 'gopay', name: 'GoPay', type: 'ewallet' },
          { id: 'ovo', name: 'OVO', type: 'ewallet' },
          { id: 'shopeepay', name: 'ShopeePay', type: 'ewallet' },
          { id: 'cod', name: 'COD (Bayar di Tempat)', type: 'cod' },
        ]),
        bankName: 'Bank Central Asia',
        bankAccount: '1234567890',
        bankHolder: 'PT LUXE Fashion Indonesia',
        primaryColor: '#f43f5e',
        originDistrictName: 'Kebayoran Baru',
        originDistrictCode: '317407',
        originVillageName: 'Selong',
        originVillageCode: '3174071004',
      },
    });
    console.log('  ✓ Store settings created');
  } else {
    console.log('  ✓ Store settings already exist');
  }
  console.log('');

  console.log('🎉 Seed completed successfully!');
  console.log('========================================');
  console.log(`  Categories:  ${categories.length}`);
  console.log(`  Products:    ${products.length}`);
  console.log(`  Users:       ${users.length}`);
  console.log(`  Orders:      8`);
  console.log(`  Reviews:     10`);
  console.log(`  Blog Posts:  ${blogPosts.length}`);
  console.log(`  Vouchers:    ${vouchers.length}`);
  console.log(`  Promos:      ${promos.length}`);
  console.log(`  Flash Sale:  1 (4 items)`);
  console.log(`  Analytics:   30 days`);
  console.log('========================================');
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
