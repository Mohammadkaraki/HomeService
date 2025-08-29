const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category');

// Map subcategory name → external image URL (Pixabay stable CDN)
// High-quality, non-empty images from LoremFlickr (stable via ?lock=)
// Tip: Add 'loremflickr.com' to next.config.js images.remotePatterns
// Stable, non-empty images from picsum.photos using seeds
const subcategoryUrlMap = new Map([
    ['Pipe Repair', 'https://picsum.photos/seed/pipe-repair/1600/900.jpg'],
    ['Drain Cleaning', 'https://picsum.photos/seed/drain-cleaning/1600/900.jpg'],
    ['Wiring', 'https://picsum.photos/seed/wiring/1600/900.jpg'],
    ['Lighting Installation', 'https://picsum.photos/seed/lighting-installation/1600/900.jpg'],
    ['House Cleaning', 'https://picsum.photos/seed/house-cleaning/1600/900.jpg'],
    ['Office Cleaning', 'https://picsum.photos/seed/office-cleaning/1600/900.jpg'],
    ['Lawn Mowing', 'https://picsum.photos/seed/lawn-mowing/1600/900.jpg'],
    ['Garden Design', 'https://picsum.photos/seed/garden-design/1600/900.jpg'],
    ['Interior Painting', 'https://picsum.photos/seed/interior-painting/1600/900.jpg'],
    ['Exterior Painting', 'https://picsum.photos/seed/exterior-painting/1600/900.jpg'],
    ['AC Installation', 'https://picsum.photos/seed/ac-installation/1600/900.jpg'],
    ['Heating Repair', 'https://picsum.photos/seed/heating-repair/1600/900.jpg'],
    ['Roof Installation', 'https://picsum.photos/seed/roof-installation/1600/900.jpg'],
    ['Roof Repair', 'https://picsum.photos/seed/roof-repair/1600/900.jpg'],
    ['Hardwood Installation', 'https://picsum.photos/seed/hardwood-installation/1600/900.jpg'],
    ['Tile Installation', 'https://picsum.photos/seed/tile-installation/1600/900.jpg'],
    ['Custom Furniture', 'https://picsum.photos/seed/custom-furniture/1600/900.jpg'],
    ['Cabinet Making', 'https://picsum.photos/seed/cabinet-making/1600/900.jpg'],
    ['Residential Moving', 'https://picsum.photos/seed/residential-moving/1600/900.jpg'],
    ['Commercial Moving', 'https://picsum.photos/seed/commercial-moving/1600/900.jpg'],
    ['Pest Extermination', 'https://picsum.photos/seed/pest-extermination/1600/900.jpg'],
    ['Preventative Treatments', 'https://picsum.photos/seed/preventative-treatments/1600/900.jpg'],
    ['Security System Installation', 'https://picsum.photos/seed/security-system-installation/1600/900.jpg'],
    ['CCTV Installation', 'https://picsum.photos/seed/cctv-installation/1600/900.jpg'],
    ['Window Installation', 'https://picsum.photos/seed/window-installation/1600/900.jpg'],
    ['Window Cleaning', 'https://picsum.photos/seed/window-cleaning/1600/900.jpg'],
    ['Refrigerator Repair', 'https://picsum.photos/seed/refrigerator-repair/1600/900.jpg'],
    ['Washer/Dryer Repair', 'https://picsum.photos/seed/washer-dryer-repair/1600/900.jpg'],
  ]);
  
  

async function run() {
  const uri = 'mongodb+srv://orders:12345654321@cluster0.oav6y.mongodb.net/homeservice';
  await mongoose.connect(uri);
  try {
    const subcategories = await Subcategory.find().populate('category');
    let updated = 0;
    for (const sc of subcategories) {
      const newUrl = subcategoryUrlMap.get(sc.name);
      if (newUrl && sc.image !== newUrl) {
        sc.image = newUrl;
        await sc.save();
        updated++;
        console.log(`Updated: ${sc.category?.name || 'Category'} → ${sc.name}`);
      } else if (!newUrl) {
        console.log(`No URL mapping for: ${sc.name}`);
      }
    }
    console.log(`Done. Updated ${updated} subcategories.`);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});


