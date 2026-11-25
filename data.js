/* ==========================================================
   BOOT nLOOT — demo data
   All products, sellers and prices are fictional demo data.
   Photography is stock imagery used as a stand-in.
   ========================================================== */

/* ---- Auction config: change the start date/time here -------------------
   ISO 8601 string with timezone. Default is a fixed date in the future.
   Quick test: open index.html?auctionIn=15  (starts in 15 seconds).        */
const AUCTION_CONFIG = {
  start: '2026-12-05T20:00:00+05:30',
  startingBid: 2500000,
  currentBid: 2850000,
  bids: 12,
  minIncrement: 50000,
};

const PHOTO = (id) => id; // keep ids only; URLs are built in app.js

const VENDORS = [
  { id: 'sneaker-syndicate', name: 'Sneaker Syndicate', city: 'Mumbai',    rating: 4.8, reviews: 312, since: 2021, initials: 'SS', tone: '#111',    bio: 'Mumbai-based sneaker collective. Deadstock to well-loved grails, every pair photographed from six angles.' },
  { id: 'luxury-rack',       name: 'The Luxury Rack',   city: 'Delhi',     rating: 4.9, reviews: 478, since: 2020, initials: 'LR', tone: '#2a2a2d', bio: 'Designer leather, tailoring and handbags from Delhi closets. Slow fashion, sharp edit.' },
  { id: 'archive-supply',    name: 'Archive Supply',    city: 'Bengaluru', rating: 4.7, reviews: 205, since: 2022, initials: 'AS', tone: '#3b3b3f', bio: 'Archive streetwear and runway-adjacent pieces, curated by a Bengaluru stylist duo.' },
  { id: 'drip-district',     name: 'Drip District',     city: 'Hyderabad', rating: 4.6, reviews: 164, since: 2022, initials: 'DD', tone: '#1c1c1e', bio: 'Hoodies, tees and kicks for the street-first crowd. Hyderabad born, pan-India shipping (demo).' },
  { id: 'vault-finds',       name: 'Vault Finds',       city: 'Pune',      rating: 4.8, reviews: 189, since: 2021, initials: 'VF', tone: '#4a4a4f', bio: 'Watches, wallets and small luxuries. Every listing shows the full condition report.' },
  { id: 'horology-vault',    name: 'The Horology Vault',city: 'Jaipur',    rating: 5.0, reviews: 61,  since: 2019, initials: 'HV', tone: '#8a7340', bio: 'Fine watches only. Home of The Vault Auction and the rarest pieces on Boot nLoot.' },
];

/* cat: sneakers | jackets | hoodies | tshirts | watches | accessories
   days: how many days ago the listing was added (drives JUST DROPPED / Fresh Finds)
   retail: null when original retail price is not available                */
const PRODUCTS = [
  /* tryon: 'top' | 'shoes' | 'watch' | 'glasses' | 'bag' | 'belt'  -> virtual try-on available (needs a clean cut-out in assets/wear/<id>.png) */
  // ---- SNEAKERS
  { id: 'p1',  brand: 'Nike',   name: 'Free Run Flyknit "Crimson"',          cat: 'sneakers', size: 'UK 9',  cond: 'Like New',    price: 6499,   retail: 12995,  vendor: 'sneaker-syndicate', verified: true,  days: 1,  img: '1542291026-7eec264c27ff', tryon: 'shoes' },
  { id: 'p4',  brand: 'Nike',   name: 'Air Max 1 "Orange Pulse"',            cat: 'sneakers', size: 'UK 9',  cond: 'Gently Used', price: 8999,   retail: 13995,  vendor: 'drip-district',     verified: true,  days: 12, img: '1600185365926-3a2ce3cdb9eb', tryon: 'shoes' },
  { id: 'p5',  brand: 'Jordan', name: 'Air Jordan 1 Retro High OG "Chicago"',cat: 'sneakers', size: 'UK 9',  cond: 'Like New',    price: 42000,  retail: null,   vendor: 'sneaker-syndicate', verified: true,  days: 0,  img: 'assets/wear/p5.png', tryon: 'shoes' },
  { id: 'p7',  brand: 'Jordan', name: 'Air Jordan 1 Mid "Graffiti"',         cat: 'sneakers', size: 'UK 7',  cond: 'Like New',    price: 9499,   retail: 11995,  vendor: 'archive-supply',    verified: true,  days: 2,  img: 'assets/wear/p7.png', tryon: 'shoes' },
  { id: 'p9',  brand: 'Nike',   name: 'Zoom Fly "Flash Crimson"',            cat: 'sneakers', size: 'UK 10', cond: 'Brand New',   price: 8299,   retail: 14995,  vendor: 'sneaker-syndicate', verified: true,  days: 6,  img: 'assets/wear/p9.png', tryon: 'shoes' },

  // ---- JACKETS
  { id: 'p31', brand: 'Gucci',    name: 'GG Canvas Zip Bomber',            cat: 'jackets',  size: 'L',     cond: 'Like New',    price: 74000,  retail: 215000, vendor: 'luxury-rack',       verified: true,  days: 0,  img: 'assets/intro/cut/2.png', tryon: 'top' },
  { id: 'p32', brand: 'Burberry', name: 'Harrington Bomber "Terracotta"',  cat: 'jackets',  size: 'M',     cond: 'Gently Used', price: 28500,  retail: 79000,  vendor: 'archive-supply',    verified: false, days: 1,  img: 'assets/tryon/bomber.png', tryon: 'top' },

  // ---- HOODIES & SWEATSHIRTS (no clean cut-out photos yet, so no try-on)
  { id: 'p14', brand: 'Off-White', name: 'Arrow Logo Hoodie',                cat: 'hoodies',  size: 'L',     cond: 'Gently Used', price: 24500,  retail: 62000,  vendor: 'drip-district',     verified: false, days: 2,  img: '1556821840-3a63f95609a7' },
  { id: 'p15', brand: 'Balenciaga',name: 'Logo Oversized Hoodie',            cat: 'hoodies',  size: 'M',     cond: 'Like New',    price: 36000,  retail: 89000,  vendor: 'luxury-rack',       verified: true,  days: 6,  img: '1620799140188-3b2a02fd9a77' },
  { id: 'p16', brand: 'Burberry',  name: 'Oversized Crewneck Sweatshirt',    cat: 'hoodies',  size: 'S',     cond: 'Brand New',   price: 18900,  retail: 42000,  vendor: 'archive-supply',    verified: true,  days: 0,  img: '1578587018452-892bacefd3f2' },

  // ---- T-SHIRTS & SHIRTS
  { id: 'p17', brand: 'Off-White', name: 'Graphic Print Tee',                cat: 'tshirts',  size: 'M',     cond: 'Like New',    price: 9200,   retail: 24000,  vendor: 'drip-district',     verified: false, days: 8,  img: '1576566588028-4147f3842f27', tryon: 'top' },
  { id: 'p18', brand: 'Versace',   name: 'Barocco Silk Shirt',               cat: 'tshirts',  size: 'L',     cond: 'Brand New',   price: 24500,  retail: 62000,  vendor: 'luxury-rack',       verified: true,  days: 10, img: 'assets/wear/p18.png', tryon: 'top' },
  { id: 'p19', brand: 'Dior',      name: 'Oblique Embroidered Tee',          cat: 'tshirts',  size: 'M',     cond: 'Gently Used', price: 16800,  retail: 48000,  vendor: 'archive-supply',    verified: true,  days: 20, img: '1618354691373-d851c5c3a990', tryon: 'top' },
  { id: 'p20', brand: 'Gucci',     name: 'Minimal Logo Tee',                 cat: 'tshirts',  size: 'S',     cond: 'Gently Used', price: 12400,  retail: 38000,  vendor: 'vault-finds',       verified: false, days: 3,  img: 'assets/wear/p20.png', tryon: 'top' },

  // ---- WATCHES
  { id: 'p21', brand: 'Rolex',            name: 'Datejust 36 Gold, Blue Diamond Dial', cat: 'watches', size: '36 mm', cond: 'Gently Used', price: 1450000, retail: 1620000, vendor: 'vault-finds',    verified: true,  days: 2,  img: 'assets/wear/p21.png', tryon: 'watch' },
  { id: 'p23', brand: 'Patek Philippe',   name: 'Nautilus 5711 Stainless Steel',  cat: 'watches',  size: '40 mm', cond: 'Gently Used', price: 7800000, retail: null,    vendor: 'horology-vault', verified: true,  days: 5,  img: 'assets/wear/p23.png', tryon: 'watch' },

  // ---- BAGS & ACCESSORIES
  { id: 'p25', brand: 'Gucci',          name: 'GG Marmont Mini Matelassé Bag', cat: 'accessories', size: 'One Size', cond: 'Like New',    price: 62000, retail: 115000, vendor: 'luxury-rack',    verified: true,  days: 0,  img: '1548036328-c9fa89d128fa', tryon: 'bag' },
  { id: 'p26', brand: 'Prada',          name: 'Brushed Leather Top-Handle Bag',cat: 'accessories', size: 'One Size', cond: 'Gently Used', price: 48000, retail: 160000, vendor: 'archive-supply', verified: false, days: 4,  img: '1584917865442-de89df76afd3', tryon: 'bag' },
  { id: 'p27', brand: 'Louis Vuitton',  name: 'Brazza Monogram Wallet',        cat: 'accessories', size: 'One Size', cond: 'Gently Used', price: 21500, retail: 42000,  vendor: 'vault-finds',    verified: true,  days: 6,  img: '1627123424574-724758594e93' },
  { id: 'p28', brand: 'Versace',        name: 'Greca Rectangular Sunglasses',  cat: 'accessories', size: 'One Size', cond: 'Brand New',   price: 18500, retail: 34000,  vendor: 'drip-district',  verified: false, days: 11, img: 'assets/wear/p28.png', tryon: 'glasses' },
  { id: 'p29', brand: 'Gucci',          name: 'Round Metal Sunglasses',        cat: 'accessories', size: 'One Size', cond: 'Like New',    price: 17500, retail: 34000,  vendor: 'archive-supply', verified: true,  days: 2,  img: '1511499767150-a48a237f0083', tryon: 'glasses' },
  { id: 'p30', brand: 'Dior',           name: 'Saddle-Style Leather Handbag',  cat: 'accessories', size: 'One Size', cond: 'Gently Used', price: 72000, retail: 210000, vendor: 'luxury-rack',    verified: true,  days: 13, img: '1590874103328-eac38a683ce7', tryon: 'bag' },
  { id: 'p33', brand: 'Michael Kors',   name: 'Ruthie Monogram Tote',          cat: 'accessories', size: 'One Size', cond: 'Like New',    price: 15500, retail: 28000,  vendor: 'luxury-rack',    verified: false, days: 3,  img: 'assets/wear/p33.png', tryon: 'bag' },
  { id: 'p34', brand: 'Prada',          name: 'Saffiano Triangle Plaque Belt', cat: 'accessories', size: '90 cm',    cond: 'Like New',    price: 17500, retail: 32000,  vendor: 'vault-finds',    verified: true,  days: 4,  img: 'assets/wear/p34.png', tryon: 'belt' },
];
const CATEGORIES = [
  { key: 'sneakers',    label: 'Sneakers',            img: '1556906781-9a412961c28c', tag: '5 pairs' },
  { key: 'jackets',     label: 'Jackets',             img: '1551028719-00167b16eac5', tag: 'Leather & tailoring' },
  { key: 'hoodies',     label: 'Sweatshirts & Hoodies', img: '1556821840-3a63f95609a7', tag: 'Street staples' },
  { key: 'tshirts',     label: 'T-Shirts',            img: '1576566588028-4147f3842f27', tag: 'Graphic & logo' },
  { key: 'watches',     label: 'Luxury Watches',      img: '1609587312208-cea54be969e7', tag: 'Fine timepieces' },
  { key: 'accessories', label: 'Bags & Accessories',  img: '1548036328-c9fa89d128fa', tag: 'Bags, shades, small goods' },
];

const CAT_LABEL = { sneakers: 'Sneakers', jackets: 'Jackets', hoodies: 'Sweatshirts & Hoodies', tshirts: 'T-Shirts', watches: 'Watches', accessories: 'Bags & Accessories' };

const CONDITIONS = ['Brand New', 'Like New', 'Gently Used', 'Used'];
const CONDITION_INFO = {
  'Brand New':   'Unworn. Original tags and packaging where available.',
  'Like New':    'Worn once or twice. No visible flaws in the seller\'s photos.',
  'Gently Used': 'Light signs of wear such as minor creasing or small marks.',
  'Used':        'Clear signs of wear. Priced to reflect the condition.',
};

const AUCTION_IMG = '1614164185128-e4ec99c436d7';

/* ==========================================================
   STUDENT MARKET (demo): peer-to-peer resale between students,
   shown per city after a demo "student ID" login.
   Names, courses, prices are fictional.
   ========================================================== */
const STUDENT_CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Pune'];
const STUDENT_CAT_LABEL = { sneakers: 'Sneakers', watches: 'Watches', furniture: 'Furniture', books: 'Books' };

/* seller: [id, name, course, city, initials] */
const STUDENT_SELLERS = [
  ['st-m1', 'Rohan M.',  'B.Com, Year 2',        'Mumbai',    'RM'],
  ['st-m2', 'Isha P.',   'B.Des, Year 3',        'Mumbai',    'IP'],
  ['st-m3', 'Kabir S.',  'MBA, Year 1',          'Mumbai',    'KS'],
  ['st-m4', 'Tanvi R.',  'B.A. Economics, Yr 2', 'Mumbai',    'TR'],
  ['st-d1', 'Aarav K.',  'B.Tech, Year 3',       'Delhi',     'AK'],
  ['st-d2', 'Meera J.',  'B.A. English, Year 2', 'Delhi',     'MJ'],
  ['st-d3', 'Dev T.',    'BBA, Year 2',          'Delhi',     'DT'],
  ['st-d4', 'Sana Q.',   'M.Sc, Year 1',         'Delhi',     'SQ'],
  ['st-b1', 'Nikhil R.', 'B.Tech, Year 4',       'Bengaluru', 'NR'],
  ['st-b2', 'Ananya V.', 'B.Sc, Year 2',         'Bengaluru', 'AV'],
  ['st-b3', 'Harsh B.',  'M.Tech, Year 1',       'Bengaluru', 'HB'],
  ['st-b4', 'Pooja N.',  'BBA, Year 3',          'Bengaluru', 'PN'],
  ['st-h1', 'Sai T.',    'B.Tech, Year 2',       'Hyderabad', 'ST'],
  ['st-h2', 'Fatima Z.', 'B.Pharm, Year 3',      'Hyderabad', 'FZ'],
  ['st-h3', 'Varun C.',  'MBA, Year 2',          'Hyderabad', 'VC'],
  ['st-h4', 'Lakshmi D.','B.A. Psychology, Yr 1','Hyderabad', 'LD'],
  ['st-p1', 'Arjun D.',  'B.E., Year 3',         'Pune',      'AD'],
  ['st-p2', 'Riya G.',   'LL.B, Year 2',         'Pune',      'RG'],
  ['st-p3', 'Omkar W.',  'B.Arch, Year 4',       'Pune',      'OW'],
  ['st-p4', 'Neha L.',   'B.Sc, Year 3',         'Pune',      'NL'],
].map(([id, name, course, city, initials]) => ({ id, name, course, city, initials, tone: '#2a2a2d', student: true }));

/* listing: id, brand, name, cat, size, cond, price, retail, seller, days, img */
const STUDENT_PRODUCTS = [
  // Mumbai
  ['s1',  'Vans',      'Old Skool "Burgundy"',          'sneakers', 'UK 8',     'Gently Used', 2400,  5499,  'st-m1', 1, '1525966222134-fcfa99b8ae77'],
  ['s2',  'Fossil',    'Grant Chronograph',             'watches',  '44 mm',    'Gently Used', 4800,  11995, 'st-m2', 3, '1622434641406-a158123450f9'],
  ['s3',  'Study Set', 'Desk + Ergonomic Chair',        'furniture','Desk 120cm','Gently Used', 5500, null,  'st-m3', 2, '1518455027359-f3f8164ba6bd'],
  ['s4',  'Books',     'Startup & Business Reads (6)',  'books',    'Set of 6', 'Like New',    900,   2400,  'st-m4', 0, '1512820790803-83ca734da794'],
  // Delhi
  ['s5',  'Nike',      'Revolution 6 Running Shoes',    'sneakers', 'UK 9',     'Like New',    2900,  6495,  'st-d1', 0, '1460353581641-37baddab0fa2'],
  ['s6',  'Apple',     'Watch Series 6 (40 mm)',        'watches',  '40 mm',    'Gently Used', 14500, 40900, 'st-d2', 4, '1579586337278-3befd40fd17a'],
  ['s7',  'Eames-style','Moulded Study Chair',          'furniture','Standard', 'Used',        1800,  null,  'st-d3', 6, '1581539250439-c96689b516dd'],
  ['s8',  'Books',     'Milk and Honey (Paperback)',    'books',    '1 book',   'Like New',    250,   399,   'st-d4', 1, '1544947950-fa07a98d237f'],
  // Bengaluru
  ['s9',  'Nike',      'SuperRep Go Training Shoes',    'sneakers', 'UK 8',     'Like New',    3800,  8995,  'st-b1', 2, '1606107557195-0e29a4b5b4aa'],
  ['s10', 'Daniel Wellington','Petite Rose Gold Watch', 'watches',  '28 mm',    'Gently Used', 3200,  7500,  'st-b2', 5, '1590736969955-71cc94801759'],
  ['s11', 'Study Light','Adjustable Floor Lamp',        'furniture','Height 150cm','Like New', 1200,  2999,  'st-b3', 1, '1507473885765-e6ed057f782c'],
  ['s12', 'Books',     'Engineering Textbook Stack (8)','books',    'Set of 8', 'Gently Used', 1500,  5200,  'st-b4', 3, '1497633762265-9d179a990aa6'],
  // Hyderabad
  ['s13', 'Puma',      'Court Classic Sneakers',        'sneakers', 'UK 7',     'Gently Used', 1900,  4999,  'st-h1', 2, '1608231387042-66d1773070a5'],
  ['s14', 'Smartwatch','Fitness Band Watch (White)',    'watches',  '42 mm',    'Gently Used', 2500,  5999,  'st-h2', 7, '1523275335684-37898b6baf30'],
  ['s15', 'Stool',     'Solid Wood Bar Stool',          'furniture','Height 65cm','Used',      700,   null,  'st-h3', 4, '1503602642458-232111445657'],
  ['s16', 'Books',     'Classic Hardcovers Bundle (7)', 'books',    'Set of 7', 'Used',        600,   null,  'st-h4', 6, '1495446815901-a7297e633e8d'],
  // Pune
  ['s17', 'Nike',      'Court Vision Low Black',        'sneakers', 'UK 9',     'Like New',    3100,  7995,  'st-p1', 0, '1491553895911-0055eca6402d'],
  ['s18', 'Skagen',    'Minimalist Leather-Strap Watch','watches',  '37 mm',    'Gently Used', 4200,  9500,  'st-p2', 5, '1524592094714-0f0654e20314'],
  ['s19', 'Armchair',  'Mustard Lounge Armchair',       'furniture','Standard', 'Gently Used', 4500,  null,  'st-p3', 3, '1550226891-ef816aed4a98'],
  ['s20', 'Books',     'Law & Reference Books (5)',     'books',    'Set of 5', 'Like New',    1100,  3800,  'st-p4', 1, '1589998059171-988d887df646'],
].map(([id, brand, name, cat, size, cond, price, retail, vendor, days, img]) => ({
  id, brand, name, cat, size, cond, price, retail, vendor, verified: false, days, img, student: true,
  city: STUDENT_SELLERS.find((s) => s.id === vendor).city,
}));

