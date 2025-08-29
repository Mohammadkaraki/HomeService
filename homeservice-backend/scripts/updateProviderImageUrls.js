const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Provider = require('../models/Provider');

// Map provider name → external image URL (Picsum with seeds for consistency)
const providerUrlMap = new Map([
    ['Mike Johnson', 'https://randomuser.me/api/portraits/men/11.jpg'],
    ['Sarah Williams', 'https://randomuser.me/api/portraits/women/12.jpg'],
    ['David Lee', 'https://randomuser.me/api/portraits/men/13.jpg'],
    ['Emma Rodriguez', 'https://randomuser.me/api/portraits/women/14.jpg'],
    ['James Wilson', 'https://randomuser.me/api/portraits/men/15.jpg'],
    ['Olivia Martinez', 'https://randomuser.me/api/portraits/women/16.jpg'],
    ['William Brown', 'https://randomuser.me/api/portraits/men/17.jpg'],
    ['Sophia Taylor', 'https://randomuser.me/api/portraits/women/18.jpg'],
    ['Benjamin Garcia', 'https://randomuser.me/api/portraits/men/19.jpg'],
    ['Isabella Miller', 'https://randomuser.me/api/portraits/women/20.jpg'],
    ['Ethan Davis', 'https://randomuser.me/api/portraits/men/21.jpg'],
    ['Mia Wilson', 'https://randomuser.me/api/portraits/women/22.jpg'],
    ['Alexander Thompson', 'https://randomuser.me/api/portraits/men/23.jpg'],
    ['Charlotte Anderson', 'https://randomuser.me/api/portraits/women/24.jpg'],
    ['Daniel Jackson', 'https://randomuser.me/api/portraits/men/25.jpg'],
    ['Amelia White', 'https://randomuser.me/api/portraits/women/26.jpg'],
    ['Matthew Harris', 'https://randomuser.me/api/portraits/men/27.jpg'],
    ['Abigail Clark', 'https://randomuser.me/api/portraits/women/28.jpg'],
    ['Emily Lewis', 'https://randomuser.me/api/portraits/women/29.jpg'],
    ['Samuel Robinson', 'https://randomuser.me/api/portraits/men/30.jpg'],
  ]);
  
  

async function run() {
  const uri = 'mongodb+srv://orders:12345654321@cluster0.oav6y.mongodb.net/homeservice';
  await mongoose.connect(uri);
  try {
    const providers = await Provider.find();
    let updated = 0;
    for (const provider of providers) {
      const newUrl = providerUrlMap.get(provider.fullName);
      if (newUrl && provider.profileImage !== newUrl) {
        await Provider.updateOne(
          { _id: provider._id },
          { $set: { profileImage: newUrl } }
        );
        updated++;
        console.log(`Updated: ${provider.fullName} (${provider.bio.split(' ').slice(0, 3).join(' ')}...)`);
      } else if (!newUrl) {
        console.log(`No URL mapping for: ${provider.fullName}`);
      }
    }
    console.log(`Done. Updated ${updated} providers.`);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
