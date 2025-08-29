const fs = require('fs');
const path = require('path');
const https = require('https');

const outputDir = path.join(__dirname, '..', 'public', 'categories');

/**
 * List of categories with representative Unsplash image URLs
 * Images will be saved locally as kebab-case filenames, e.g. plumbing.jpg
 */
const categoryImages = [
  { name: 'Plumbing', url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Electrical', url: 'https://images.unsplash.com/photo-1581091862237-1e7e5160f3b9?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Cleaning', url: 'https://images.unsplash.com/photo-1581579188871-45ea61f2a0c8?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Landscaping', url: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Home Repair', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80' },
  { name: 'HVAC', url: 'https://images.unsplash.com/photo-1581090463049-3859d8aa8c9e?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Painting', url: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Roofing', url: 'https://images.unsplash.com/photo-1562254495-8c8f3ca0a063?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Flooring', url: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Carpentry', url: 'https://images.unsplash.com/photo-1541976590-713941681591?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Moving', url: 'https://images.unsplash.com/photo-1581092333667-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Pest Control', url: 'https://images.unsplash.com/photo-1617957681416-22cc0f0df9e3?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Security', url: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Window Services', url: 'https://images.unsplash.com/photo-1529119368496-1c368fd0c40f?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Appliance Repair', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Garage Door', url: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Handyman', url: 'https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Locksmith', url: 'https://images.unsplash.com/photo-1604668915840-5272d9f1ec2d?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Pool Maintenance', url: 'https://images.unsplash.com/photo-1530053969600-caed2596d242?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Interior Design', url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80' }
];

function toKebabCase(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function download(url, destinationPath) {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(destinationPath);
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          // Follow redirect
          return https.get(res.headers.location, (res2) => {
            res2.pipe(fileStream);
            fileStream.on('finish', () => fileStream.close(resolve));
          }).on('error', reject);
        }
        if (res.statusCode && res.statusCode >= 400) {
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        res.pipe(fileStream);
        fileStream.on('finish', () => fileStream.close(resolve));
      })
      .on('error', reject);
  });
}

async function run() {
  ensureDir(outputDir);
  console.log(`Saving category images to: ${outputDir}`);

  for (const item of categoryImages) {
    const filename = `${toKebabCase(item.name)}.jpg`;
    const dest = path.join(outputDir, filename);
    try {
      console.log(`Downloading ${item.name} → ${filename}`);
      await download(item.url, dest);
    } catch (err) {
      console.error(`Failed to download ${item.name}:`, err.message);
    }
  }

  console.log('Done downloading category images.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});


