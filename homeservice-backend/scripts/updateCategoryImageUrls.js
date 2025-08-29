const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Category = require('../models/Category');

// Map category name → external image URL
const urlMap = new Map([
  ['Plumbing', 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
  ['Electrical', 'https://images.unsplash.com/photo-1565608438257-fac3c27beb36?q=80&w=2076&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
  ['Cleaning', 'https://plus.unsplash.com/premium_photo-1663011218145-c1d0c3ba3542?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
  ['Landscaping', 'https://plus.unsplash.com/premium_photo-1709440655728-295d8c1cb722?q=80&w=2064&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
  ['Home Repair', 'https://plus.unsplash.com/premium_photo-1664301132849-f52af765df79?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
  ['HVAC', 'https://images.unsplash.com/photo-1615309662243-70f6df917b59?q=80&w=1560&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
  ['Painting', 'https://plus.unsplash.com/premium_photo-1678812165213-12dc8d1f3e19?q=80&w=928&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
  ['Roofing', 'https://images.unsplash.com/photo-1635424824800-692767998d07?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Um9vZmluZ3xlbnwwfHwwfHx8MA%3D%3D'],
  ['Flooring', 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80'],
  ['Carpentry', 'https://images.unsplash.com/photo-1541976590-713941681591?auto=format&fit=crop&w=1200&q=80'],
  ['Moving', 'https://plus.unsplash.com/premium_photo-1679858780540-83cf9db66d55?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bW92aW5nfGVufDB8fDB8fHww'],
  ['Pest Control', 'https://images.unsplash.com/photo-1581578017093-cd30fce4eeb7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
  ['Security', 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80'],
  ['Window Services', 'https://plus.unsplash.com/premium_photo-1683140911652-9eccabee148f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
  ['Appliance Repair', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80'],
  ['Garage Door', 'https://plus.unsplash.com/premium_photo-1672300828707-a430ce7ee64f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
  ['Handyman', 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
  ['Locksmith', 'https://plus.unsplash.com/premium_photo-1661292167106-2224b6d0cefc?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
  ['Pool Maintenance', 'https://images.unsplash.com/photo-1530053969600-caed2596d242?auto=format&fit=crop&w=1200&q=80'],
  ['Interior Design', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80']
]);

async function run() {
  const uri ='mongodb+srv://orders:12345654321@cluster0.oav6y.mongodb.net/homeservice';
  await mongoose.connect(uri);
  try {
    const categories = await Category.find();
    let updated = 0;
    for (const cat of categories) {
      const newUrl = urlMap.get(cat.name);
      if (newUrl && cat.image !== newUrl) {
        cat.image = newUrl;
        await cat.save();
        updated++;
        console.log(`Updated: ${cat.name}`);
      } else if (!newUrl) {
        console.log(`No URL mapping for: ${cat.name}`);
      }
    }
    console.log(`Done. Updated ${updated} categories.`);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});


