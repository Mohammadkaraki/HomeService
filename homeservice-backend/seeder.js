const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Load models
const User = require('./models/User');
const Provider = require('./models/Provider');
const Category = require('./models/Category');
const Subcategory = require('./models/Subcategory');
const Service = require('./models/Service');
const Booking = require('./models/Booking');
const Review = require('./models/Review');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Hash passwords
const salt = bcrypt.genSaltSync(10);
const password = bcrypt.hashSync('password123', salt);

// Users
const users = [
  {
    fullName: 'John Doe',
    email: 'john@example.com',
    password,
    phoneNumber: '123-456-7890',
    location: 'New York, NY',
    role: 'user',
    isActive: true
  },
  {
    fullName: 'Jane Smith',
    email: 'jane@example.com',
    password,
    phoneNumber: '123-456-7891',
    location: 'Los Angeles, CA',
    role: 'user',
    isActive: true
  },
  {
    fullName: 'Admin User',
    email: 'admin@example.com',
    password,
    phoneNumber: '123-456-7892',
    location: 'Chicago, IL',
    role: 'admin',
    isActive: true
  }
];

// Providers
const providers = [
  {
    fullName: 'Mike Johnson',
    email: 'mike@example.com',
    password,
    phoneNumber: '123-456-7893',
    location: 'New York, NY',
    bio: 'Professional plumber with 10 years of experience',
    services: [],
    availability: {
      monday: { start: '09:00', end: '17:00', isAvailable: true },
      tuesday: { start: '09:00', end: '17:00', isAvailable: true },
      wednesday: { start: '09:00', end: '17:00', isAvailable: true },
      thursday: { start: '09:00', end: '17:00', isAvailable: true },
      friday: { start: '09:00', end: '17:00', isAvailable: true },
      saturday: { start: '10:00', end: '15:00', isAvailable: true },
      sunday: { start: '00:00', end: '00:00', isAvailable: false }
    },
    isVerified: true,
    isActive: true
  },
  {
    fullName: 'Sarah Williams',
    email: 'sarah@example.com',
    password,
    phoneNumber: '123-456-7894',
    location: 'Los Angeles, CA',
    bio: 'Certified electrician specializing in residential services',
    services: [],
    availability: {
      monday: { start: '08:00', end: '16:00', isAvailable: true },
      tuesday: { start: '08:00', end: '16:00', isAvailable: true },
      wednesday: { start: '08:00', end: '16:00', isAvailable: true },
      thursday: { start: '08:00', end: '16:00', isAvailable: true },
      friday: { start: '08:00', end: '16:00', isAvailable: true },
      saturday: { start: '09:00', end: '14:00', isAvailable: true },
      sunday: { start: '00:00', end: '00:00', isAvailable: false }
    },
    isVerified: true,
    isActive: true
  },
  {
    fullName: 'David Lee',
    email: 'david@example.com',
    password,
    phoneNumber: '123-456-7895',
    location: 'Chicago, IL',
    bio: 'Experienced cleaner with attention to detail',
    services: [],
    availability: {
      monday: { start: '10:00', end: '18:00', isAvailable: true },
      tuesday: { start: '10:00', end: '18:00', isAvailable: true },
      wednesday: { start: '10:00', end: '18:00', isAvailable: true },
      thursday: { start: '10:00', end: '18:00', isAvailable: true },
      friday: { start: '10:00', end: '18:00', isAvailable: true },
      saturday: { start: '10:00', end: '16:00', isAvailable: true },
      sunday: { start: '10:00', end: '14:00', isAvailable: true }
    },
    isVerified: true,
    isActive: true
  },
  {
    fullName: 'Emma Rodriguez',
    email: 'emma@example.com',
    password,
    phoneNumber: '123-456-7896',
    location: 'Miami, FL',
    bio: 'Expert HVAC technician for all cooling and heating needs',
    services: [],
    availability: {
      monday: { start: '08:00', end: '18:00', isAvailable: true },
      tuesday: { start: '08:00', end: '18:00', isAvailable: true },
      wednesday: { start: '08:00', end: '18:00', isAvailable: true },
      thursday: { start: '08:00', end: '18:00', isAvailable: true },
      friday: { start: '08:00', end: '18:00', isAvailable: true },
      saturday: { start: '09:00', end: '15:00', isAvailable: true },
      sunday: { start: '00:00', end: '00:00', isAvailable: false }
    },
    isVerified: true,
    isActive: true
  },
  {
    fullName: 'James Wilson',
    email: 'james@example.com',
    password,
    phoneNumber: '123-456-7897',
    location: 'Dallas, TX',
    bio: 'Professional painter with expertise in interior and exterior painting',
    services: [],
    availability: {
      monday: { start: '07:00', end: '16:00', isAvailable: true },
      tuesday: { start: '07:00', end: '16:00', isAvailable: true },
      wednesday: { start: '07:00', end: '16:00', isAvailable: true },
      thursday: { start: '07:00', end: '16:00', isAvailable: true },
      friday: { start: '07:00', end: '16:00', isAvailable: true },
      saturday: { start: '08:00', end: '14:00', isAvailable: true },
      sunday: { start: '00:00', end: '00:00', isAvailable: false }
    },
    isVerified: true,
    isActive: true
  },
  {
    fullName: 'Olivia Martinez',
    email: 'olivia@example.com',
    password,
    phoneNumber: '123-456-7898',
    location: 'Seattle, WA',
    bio: 'Certified roofer with 15 years of experience',
    services: [],
    availability: {
      monday: { start: '08:00', end: '17:00', isAvailable: true },
      tuesday: { start: '08:00', end: '17:00', isAvailable: true },
      wednesday: { start: '08:00', end: '17:00', isAvailable: true },
      thursday: { start: '08:00', end: '17:00', isAvailable: true },
      friday: { start: '08:00', end: '17:00', isAvailable: true },
      saturday: { start: '09:00', end: '15:00', isAvailable: true },
      sunday: { start: '00:00', end: '00:00', isAvailable: false }
    },
    isVerified: true,
    isActive: true
  },
  {
    fullName: 'William Brown',
    email: 'william@example.com',
    password,
    phoneNumber: '123-456-7899',
    location: 'Boston, MA',
    bio: 'Expert flooring installer for all types of flooring',
    services: [],
    availability: {
      monday: { start: '09:00', end: '18:00', isAvailable: true },
      tuesday: { start: '09:00', end: '18:00', isAvailable: true },
      wednesday: { start: '09:00', end: '18:00', isAvailable: true },
      thursday: { start: '09:00', end: '18:00', isAvailable: true },
      friday: { start: '09:00', end: '18:00', isAvailable: true },
      saturday: { start: '10:00', end: '16:00', isAvailable: true },
      sunday: { start: '00:00', end: '00:00', isAvailable: false }
    },
    isVerified: true,
    isActive: true
  },
  {
    fullName: 'Sophia Taylor',
    email: 'sophia@example.com',
    password,
    phoneNumber: '123-456-7900',
    location: 'Atlanta, GA',
    bio: 'Master carpenter specializing in custom furniture and cabinetry',
    services: [],
    availability: {
      monday: { start: '08:30', end: '17:30', isAvailable: true },
      tuesday: { start: '08:30', end: '17:30', isAvailable: true },
      wednesday: { start: '08:30', end: '17:30', isAvailable: true },
      thursday: { start: '08:30', end: '17:30', isAvailable: true },
      friday: { start: '08:30', end: '17:30', isAvailable: true },
      saturday: { start: '09:00', end: '14:00', isAvailable: true },
      sunday: { start: '00:00', end: '00:00', isAvailable: false }
    },
    isVerified: true,
    isActive: true
  },
  {
    fullName: 'Benjamin Garcia',
    email: 'benjamin@example.com',
    password,
    phoneNumber: '123-456-7901',
    location: 'Phoenix, AZ',
    bio: 'Professional moving service with a careful team',
    services: [],
    availability: {
      monday: { start: '07:00', end: '19:00', isAvailable: true },
      tuesday: { start: '07:00', end: '19:00', isAvailable: true },
      wednesday: { start: '07:00', end: '19:00', isAvailable: true },
      thursday: { start: '07:00', end: '19:00', isAvailable: true },
      friday: { start: '07:00', end: '19:00', isAvailable: true },
      saturday: { start: '08:00', end: '18:00', isAvailable: true },
      sunday: { start: '08:00', end: '18:00', isAvailable: true }
    },
    isVerified: true,
    isActive: true
  },
  {
    fullName: 'Isabella Miller',
    email: 'isabella@example.com',
    password,
    phoneNumber: '123-456-7902',
    location: 'Denver, CO',
    bio: 'Certified pest control specialist with environmentally friendly solutions',
    services: [],
    availability: {
      monday: { start: '08:00', end: '17:00', isAvailable: true },
      tuesday: { start: '08:00', end: '17:00', isAvailable: true },
      wednesday: { start: '08:00', end: '17:00', isAvailable: true },
      thursday: { start: '08:00', end: '17:00', isAvailable: true },
      friday: { start: '08:00', end: '17:00', isAvailable: true },
      saturday: { start: '09:00', end: '15:00', isAvailable: true },
      sunday: { start: '00:00', end: '00:00', isAvailable: false }
    },
    isVerified: true,
    isActive: true
  },
  {
    fullName: 'Ethan Davis',
    email: 'ethan@example.com',
    password,
    phoneNumber: '123-456-7903',
    location: 'San Francisco, CA',
    bio: 'Security systems expert for residential and commercial properties',
    services: [],
    availability: {
      monday: { start: '09:00', end: '18:00', isAvailable: true },
      tuesday: { start: '09:00', end: '18:00', isAvailable: true },
      wednesday: { start: '09:00', end: '18:00', isAvailable: true },
      thursday: { start: '09:00', end: '18:00', isAvailable: true },
      friday: { start: '09:00', end: '18:00', isAvailable: true },
      saturday: { start: '10:00', end: '16:00', isAvailable: true },
      sunday: { start: '00:00', end: '00:00', isAvailable: false }
    },
    isVerified: true,
    isActive: true
  },
  {
    fullName: 'Mia Wilson',
    email: 'mia@example.com',
    password,
    phoneNumber: '123-456-7904',
    location: 'Portland, OR',
    bio: 'Professional window installation and repair service',
    services: [],
    availability: {
      monday: { start: '08:00', end: '17:00', isAvailable: true },
      tuesday: { start: '08:00', end: '17:00', isAvailable: true },
      wednesday: { start: '08:00', end: '17:00', isAvailable: true },
      thursday: { start: '08:00', end: '17:00', isAvailable: true },
      friday: { start: '08:00', end: '17:00', isAvailable: true },
      saturday: { start: '09:00', end: '15:00', isAvailable: true },
      sunday: { start: '00:00', end: '00:00', isAvailable: false }
    },
    isVerified: true,
    isActive: true
  },
  {
    fullName: 'Alexander Thompson',
    email: 'alexander@example.com',
    password,
    phoneNumber: '123-456-7905',
    location: 'San Diego, CA',
    bio: 'Certified appliance repair technician for all major brands',
    services: [],
    availability: {
      monday: { start: '08:30', end: '17:30', isAvailable: true },
      tuesday: { start: '08:30', end: '17:30', isAvailable: true },
      wednesday: { start: '08:30', end: '17:30', isAvailable: true },
      thursday: { start: '08:30', end: '17:30', isAvailable: true },
      friday: { start: '08:30', end: '17:30', isAvailable: true },
      saturday: { start: '09:00', end: '14:00', isAvailable: true },
      sunday: { start: '00:00', end: '00:00', isAvailable: false }
    },
    isVerified: true,
    isActive: true
  },
  {
    fullName: 'Charlotte Anderson',
    email: 'charlotte@example.com',
    password,
    phoneNumber: '123-456-7906',
    location: 'Austin, TX',
    bio: 'Garage door installation and repair specialist',
    services: [],
    availability: {
      monday: { start: '08:00', end: '17:00', isAvailable: true },
      tuesday: { start: '08:00', end: '17:00', isAvailable: true },
      wednesday: { start: '08:00', end: '17:00', isAvailable: true },
      thursday: { start: '08:00', end: '17:00', isAvailable: true },
      friday: { start: '08:00', end: '17:00', isAvailable: true },
      saturday: { start: '09:00', end: '15:00', isAvailable: true },
      sunday: { start: '00:00', end: '00:00', isAvailable: false }
    },
    isVerified: true,
    isActive: true
  },
  {
    fullName: 'Daniel Jackson',
    email: 'daniel@example.com',
    password,
    phoneNumber: '123-456-7907',
    location: 'Nashville, TN',
    bio: 'Handyman with experience in all areas of home repair',
    services: [],
    availability: {
      monday: { start: '08:00', end: '18:00', isAvailable: true },
      tuesday: { start: '08:00', end: '18:00', isAvailable: true },
      wednesday: { start: '08:00', end: '18:00', isAvailable: true },
      thursday: { start: '08:00', end: '18:00', isAvailable: true },
      friday: { start: '08:00', end: '18:00', isAvailable: true },
      saturday: { start: '09:00', end: '16:00', isAvailable: true },
      sunday: { start: '09:00', end: '14:00', isAvailable: true }
    },
    isVerified: true,
    isActive: true
  },
  {
    fullName: 'Amelia White',
    email: 'amelia@example.com',
    password,
    phoneNumber: '123-456-7908',
    location: 'Philadelphia, PA',
    bio: 'Professional locksmith for residential and commercial needs',
    services: [],
    availability: {
      monday: { start: '08:00', end: '20:00', isAvailable: true },
      tuesday: { start: '08:00', end: '20:00', isAvailable: true },
      wednesday: { start: '08:00', end: '20:00', isAvailable: true },
      thursday: { start: '08:00', end: '20:00', isAvailable: true },
      friday: { start: '08:00', end: '20:00', isAvailable: true },
      saturday: { start: '09:00', end: '17:00', isAvailable: true },
      sunday: { start: '10:00', end: '16:00', isAvailable: true }
    },
    isVerified: true,
    isActive: true
  },
  {
    fullName: 'Matthew Harris',
    email: 'matthew@example.com',
    password,
    phoneNumber: '123-456-7909',
    location: 'Las Vegas, NV',
    bio: 'Pool maintenance and repair specialist with 12 years of experience',
    services: [],
    availability: {
      monday: { start: '08:00', end: '17:00', isAvailable: true },
      tuesday: { start: '08:00', end: '17:00', isAvailable: true },
      wednesday: { start: '08:00', end: '17:00', isAvailable: true },
      thursday: { start: '08:00', end: '17:00', isAvailable: true },
      friday: { start: '08:00', end: '17:00', isAvailable: true },
      saturday: { start: '09:00', end: '15:00', isAvailable: true },
      sunday: { start: '00:00', end: '00:00', isAvailable: false }
    },
    isVerified: true,
    isActive: true
  },
  {
    fullName: 'Abigail Clark',
    email: 'abigail@example.com',
    password,
    phoneNumber: '123-456-7910',
    location: 'Charlotte, NC',
    bio: 'Professional interior designer with a modern aesthetic',
    services: [],
    availability: {
      monday: { start: '09:00', end: '18:00', isAvailable: true },
      tuesday: { start: '09:00', end: '18:00', isAvailable: true },
      wednesday: { start: '09:00', end: '18:00', isAvailable: true },
      thursday: { start: '09:00', end: '18:00', isAvailable: true },
      friday: { start: '09:00', end: '18:00', isAvailable: true },
      saturday: { start: '10:00', end: '16:00', isAvailable: true },
      sunday: { start: '00:00', end: '00:00', isAvailable: false }
    },
    isVerified: true,
    isActive: true
  },
  {
    fullName: 'Emily Lewis',
    email: 'emily@example.com',
    password,
    phoneNumber: '123-456-7911',
    location: 'Houston, TX',
    bio: 'Expert landscaper specializing in drought-resistant designs',
    services: [],
    availability: {
      monday: { start: '07:00', end: '16:00', isAvailable: true },
      tuesday: { start: '07:00', end: '16:00', isAvailable: true },
      wednesday: { start: '07:00', end: '16:00', isAvailable: true },
      thursday: { start: '07:00', end: '16:00', isAvailable: true },
      friday: { start: '07:00', end: '16:00', isAvailable: true },
      saturday: { start: '08:00', end: '14:00', isAvailable: true },
      sunday: { start: '00:00', end: '00:00', isAvailable: false }
    },
    isVerified: true,
    isActive: true
  },
  {
    fullName: 'Samuel Robinson',
    email: 'samuel@example.com',
    password,
    phoneNumber: '123-456-7912',
    location: 'Minneapolis, MN',
    bio: 'Home repair specialist with focus on kitchen and bathroom renovations',
    services: [],
    availability: {
      monday: { start: '08:00', end: '17:00', isAvailable: true },
      tuesday: { start: '08:00', end: '17:00', isAvailable: true },
      wednesday: { start: '08:00', end: '17:00', isAvailable: true },
      thursday: { start: '08:00', end: '17:00', isAvailable: true },
      friday: { start: '08:00', end: '17:00', isAvailable: true },
      saturday: { start: '09:00', end: '15:00', isAvailable: true },
      sunday: { start: '00:00', end: '00:00', isAvailable: false }
    },
    isVerified: true,
    isActive: true
  }
];

// Categories
const categories = [
  {
    name: 'Plumbing',
    description: 'All plumbing services for your home or office',
    isActive: true
  },
  {
    name: 'Electrical',
    description: 'Professional electrical services for residential and commercial properties',
    isActive: true
  },
  {
    name: 'Cleaning',
    description: 'Home and office cleaning services',
    isActive: true
  },
  {
    name: 'Landscaping',
    description: 'Garden design, maintenance, and lawn care services',
    isActive: true
  },
  {
    name: 'Home Repair',
    description: 'General home repair and maintenance services',
    isActive: true
  },
  {
    name: 'HVAC',
    description: 'Heating, ventilation, and air conditioning services',
    isActive: true
  },
  {
    name: 'Painting',
    description: 'Interior and exterior painting services for homes and businesses',
    isActive: true
  },
  {
    name: 'Roofing',
    description: 'Roof installation, repair, and maintenance services',
    isActive: true
  },
  {
    name: 'Flooring',
    description: 'Installation and repair of various flooring types',
    isActive: true
  },
  {
    name: 'Carpentry',
    description: 'Custom woodworking, furniture building, and repair services',
    isActive: true
  },
  {
    name: 'Moving',
    description: 'Residential and commercial moving services',
    isActive: true
  },
  {
    name: 'Pest Control',
    description: 'Pest extermination and prevention services',
    isActive: true
  },
  {
    name: 'Security',
    description: 'Home and business security system installation and monitoring',
    isActive: true
  },
  {
    name: 'Window Services',
    description: 'Window installation, repair, and cleaning services',
    isActive: true
  },
  {
    name: 'Appliance Repair',
    description: 'Repair and maintenance of household appliances',
    isActive: true
  },
  {
    name: 'Garage Door',
    description: 'Garage door installation, repair, and maintenance',
    isActive: true
  },
  {
    name: 'Handyman',
    description: 'General handyman services for various small tasks',
    isActive: true
  },
  {
    name: 'Locksmith',
    description: 'Lock installation, repair, and key services',
    isActive: true
  },
  {
    name: 'Pool Maintenance',
    description: 'Swimming pool cleaning, maintenance, and repair',
    isActive: true
  },
  {
    name: 'Interior Design',
    description: 'Professional interior design and decoration services',
    isActive: true
  }
];

// Import Data
const importData = async () => {
  try {
    // Clear all data
    await User.deleteMany();
    await Provider.deleteMany();
    await Category.deleteMany();
    await Subcategory.deleteMany();
    await Service.deleteMany();
    await Booking.deleteMany();
    await Review.deleteMany();

    console.log('Data cleared successfully');

    // Insert users
    const createdUsers = await User.insertMany(users);
    console.log(`${createdUsers.length} users imported successfully`);

    // Insert providers
    const createdProviders = await Provider.insertMany(providers);
    console.log(`${createdProviders.length} providers imported successfully`);

    // Insert categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`${createdCategories.length} categories imported successfully`);

    // Create subcategories
    const subcategories = [
      {
        name: 'Pipe Repair',
        description: 'Fixing leaky pipes and installing new plumbing',
        category: createdCategories[0]._id,
        isActive: true
      },
      {
        name: 'Drain Cleaning',
        description: 'Unclogging drains and maintaining proper water flow',
        category: createdCategories[0]._id,
        isActive: true
      },
      {
        name: 'Wiring',
        description: 'Electrical wiring installation and repair',
        category: createdCategories[1]._id,
        isActive: true
      },
      {
        name: 'Lighting Installation',
        description: 'Installing and repairing light fixtures',
        category: createdCategories[1]._id,
        isActive: true
      },
      {
        name: 'House Cleaning',
        description: 'Comprehensive house cleaning services',
        category: createdCategories[2]._id,
        isActive: true
      },
      {
        name: 'Office Cleaning',
        description: 'Professional cleaning for office spaces',
        category: createdCategories[2]._id,
        isActive: true
      },
      {
        name: 'Lawn Mowing',
        description: 'Regular lawn mowing and maintenance',
        category: createdCategories[3]._id,
        isActive: true
      },
      {
        name: 'Garden Design',
        description: 'Creative garden design and implementation',
        category: createdCategories[3]._id,
        isActive: true
      },
      {
        name: 'Painting',
        description: 'Interior and exterior painting services',
        category: createdCategories[4]._id,
        isActive: true
      },
      {
        name: 'Carpentry',
        description: 'Woodworking and furniture repair',
        category: createdCategories[4]._id,
        isActive: true
      },
      {
        name: 'AC Installation',
        description: 'Installation of new air conditioning systems',
        category: createdCategories[5]._id,
        isActive: true
      },
      {
        name: 'Heating Repair',
        description: 'Repair of heating systems and furnaces',
        category: createdCategories[5]._id,
        isActive: true
      },
      {
        name: 'Interior Painting',
        description: 'Professional interior wall painting',
        category: createdCategories[6]._id,
        isActive: true
      },
      {
        name: 'Exterior Painting',
        description: 'Exterior house and building painting',
        category: createdCategories[6]._id,
        isActive: true
      },
      {
        name: 'Roof Installation',
        description: 'New roof installation services',
        category: createdCategories[7]._id,
        isActive: true
      },
      {
        name: 'Roof Repair',
        description: 'Fixing leaks and damaged roofing',
        category: createdCategories[7]._id,
        isActive: true
      },
      {
        name: 'Hardwood Installation',
        description: 'Installation of hardwood flooring',
        category: createdCategories[8]._id,
        isActive: true
      },
      {
        name: 'Tile Installation',
        description: 'Installation of ceramic and porcelain tiles',
        category: createdCategories[8]._id,
        isActive: true
      },
      {
        name: 'Custom Furniture',
        description: 'Building custom furniture pieces',
        category: createdCategories[9]._id,
        isActive: true
      },
      {
        name: 'Cabinet Making',
        description: 'Custom cabinet design and installation',
        category: createdCategories[9]._id,
        isActive: true
      },
      {
        name: 'Residential Moving',
        description: 'Moving services for homes and apartments',
        category: createdCategories[10]._id,
        isActive: true
      },
      {
        name: 'Commercial Moving',
        description: 'Moving services for businesses and offices',
        category: createdCategories[10]._id,
        isActive: true
      },
      {
        name: 'Pest Extermination',
        description: 'Removal of various pests from properties',
        category: createdCategories[11]._id,
        isActive: true
      },
      {
        name: 'Preventative Treatments',
        description: 'Regular treatments to prevent pest infestations',
        category: createdCategories[11]._id,
        isActive: true
      },
      {
        name: 'Security System Installation',
        description: 'Installation of home and business security systems',
        category: createdCategories[12]._id,
        isActive: true
      },
      {
        name: 'CCTV Installation',
        description: 'Setting up surveillance camera systems',
        category: createdCategories[12]._id,
        isActive: true
      },
      {
        name: 'Window Installation',
        description: 'Installation of new windows in homes and buildings',
        category: createdCategories[13]._id,
        isActive: true
      },
      {
        name: 'Window Cleaning',
        description: 'Professional window cleaning services',
        category: createdCategories[13]._id,
        isActive: true
      },
      {
        name: 'Refrigerator Repair',
        description: 'Repair services for refrigerators of all brands',
        category: createdCategories[14]._id,
        isActive: true
      },
      {
        name: 'Washer/Dryer Repair',
        description: 'Fixing washing machines and dryers',
        category: createdCategories[14]._id,
        isActive: true
      }
    ];

    const createdSubcategories = await Subcategory.insertMany(subcategories);
    console.log(`${createdSubcategories.length} subcategories imported successfully`);

    // Create services
    const services = [
      {
        provider: createdProviders[0]._id,
        category: createdCategories[0]._id,
        subcategory: createdSubcategories[0]._id,
        title: 'Emergency Pipe Repair',
        description: 'Fast response for emergency pipe repairs, leaks, and installations',
        basePrice: 85,
        priceUnit: 'hour',
        isAvailable: true,
        serviceArea: ['New York', 'Brooklyn', 'Queens'],
        tags: ['emergency', 'pipes', 'leaks', 'repairs']
      },
      {
        provider: createdProviders[0]._id,
        category: createdCategories[0]._id,
        subcategory: createdSubcategories[1]._id,
        title: 'Professional Drain Cleaning',
        description: 'Unclog any drain with our professional equipment and techniques',
        basePrice: 75,
        priceUnit: 'job',
        isAvailable: true,
        serviceArea: ['New York', 'Brooklyn', 'Queens'],
        tags: ['drain', 'unclog', 'cleaning', 'pipes']
      },
      {
        provider: createdProviders[1]._id,
        category: createdCategories[1]._id,
        subcategory: createdSubcategories[2]._id,
        title: 'Electrical Wiring Service',
        description: 'Complete electrical wiring services for new construction or renovations',
        basePrice: 95,
        priceUnit: 'hour',
        isAvailable: true,
        serviceArea: ['Los Angeles', 'Beverly Hills', 'Santa Monica'],
        tags: ['electrical', 'wiring', 'installation', 'safety']
      },
      {
        provider: createdProviders[1]._id,
        category: createdCategories[1]._id,
        subcategory: createdSubcategories[3]._id,
        title: 'Modern Lighting Solutions',
        description: 'Installation of modern lighting fixtures with energy-efficient options',
        basePrice: 80,
        priceUnit: 'hour',
        isAvailable: true,
        serviceArea: ['Los Angeles', 'Beverly Hills', 'Santa Monica'],
        tags: ['lighting', 'installation', 'modern', 'energy-efficient']
      },
      {
        provider: createdProviders[2]._id,
        category: createdCategories[2]._id,
        subcategory: createdSubcategories[4]._id,
        title: 'Deep House Cleaning',
        description: 'Thorough cleaning of your entire home from top to bottom',
        basePrice: 30,
        priceUnit: 'hour',
        isAvailable: true,
        serviceArea: ['Chicago', 'Evanston', 'Oak Park'],
        tags: ['cleaning', 'house', 'deep cleaning', 'residential']
      },
      {
        provider: createdProviders[2]._id,
        category: createdCategories[2]._id,
        subcategory: createdSubcategories[5]._id,
        title: 'Commercial Office Cleaning',
        description: 'Professional cleaning services for offices and commercial spaces',
        basePrice: 45,
        priceUnit: 'hour',
        isAvailable: true,
        serviceArea: ['Chicago', 'Evanston', 'Oak Park'],
        tags: ['cleaning', 'office', 'commercial', 'business']
      },
      {
        provider: createdProviders[3]._id,
        category: createdCategories[5]._id,
        subcategory: createdSubcategories[10]._id,
        title: 'AC System Installation',
        description: 'Expert installation of all types of air conditioning systems',
        basePrice: 120,
        priceUnit: 'job',
        isAvailable: true,
        serviceArea: ['Miami', 'Miami Beach', 'Fort Lauderdale'],
        tags: ['ac', 'air conditioning', 'installation', 'cooling']
      },
      {
        provider: createdProviders[3]._id,
        category: createdCategories[5]._id,
        subcategory: createdSubcategories[11]._id,
        title: 'Heating System Repair',
        description: 'Prompt repair of furnaces and heating systems of all brands',
        basePrice: 90,
        priceUnit: 'hour',
        isAvailable: true,
        serviceArea: ['Miami', 'Miami Beach', 'Fort Lauderdale'],
        tags: ['heating', 'furnace', 'repair', 'hvac']
      },
      {
        provider: createdProviders[4]._id,
        category: createdCategories[6]._id,
        subcategory: createdSubcategories[12]._id,
        title: 'Interior Painting Service',
        description: 'Professional interior painting with premium paints and finishes',
        basePrice: 40,
        priceUnit: 'hour',
        isAvailable: true,
        serviceArea: ['Dallas', 'Fort Worth', 'Plano'],
        tags: ['painting', 'interior', 'walls', 'residential']
      }
    ];

    const createdServices = await Service.insertMany(services);
    console.log(`${createdServices.length} services imported successfully`);

    // Update providers with service information
    await Provider.findByIdAndUpdate(createdProviders[0]._id, {
      $set: {
        services: [
          {
            category: createdCategories[0]._id,
            subcategories: [createdSubcategories[0]._id, createdSubcategories[1]._id],
            hourlyRate: 85
          }
        ]
      }
    });

    await Provider.findByIdAndUpdate(createdProviders[1]._id, {
      $set: {
        services: [
          {
            category: createdCategories[1]._id,
            subcategories: [createdSubcategories[2]._id, createdSubcategories[3]._id],
            hourlyRate: 95
          }
        ]
      }
    });

    await Provider.findByIdAndUpdate(createdProviders[2]._id, {
      $set: {
        services: [
          {
            category: createdCategories[2]._id,
            subcategories: [createdSubcategories[4]._id, createdSubcategories[5]._id],
            hourlyRate: 30
          }
        ]
      }
    });

    await Provider.findByIdAndUpdate(createdProviders[3]._id, {
      $set: {
        services: [
          {
            category: createdCategories[5]._id,
            subcategories: [createdSubcategories[10]._id, createdSubcategories[11]._id],
            hourlyRate: 100
          }
        ]
      }
    });

    await Provider.findByIdAndUpdate(createdProviders[4]._id, {
      $set: {
        services: [
          {
            category: createdCategories[6]._id,
            subcategories: [createdSubcategories[12]._id, createdSubcategories[13]._id],
            hourlyRate: 40
          }
        ]
      }
    });

    await Provider.findByIdAndUpdate(createdProviders[5]._id, {
      $set: {
        services: [
          {
            category: createdCategories[7]._id,
            subcategories: [createdSubcategories[14]._id, createdSubcategories[15]._id],
            hourlyRate: 90
          }
        ]
      }
    });
    
    console.log('Providers updated with services successfully');

    // Create bookings
    const bookings = [
      {
        user: createdUsers[0]._id,
        provider: createdProviders[0]._id,
        service: {
          category: createdCategories[0]._id,
          subcategory: createdSubcategories[0]._id
        },
        bookingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        startTime: '10:00',
        estimatedHours: 2,
        totalPrice: 170,
        status: 'confirmed',
        userDetails: {
          fullName: createdUsers[0].fullName,
          phoneNumber: createdUsers[0].phoneNumber,
          location: '123 Main St, New York, NY'
        },
        notes: 'Please bring all necessary equipment for a pipe replacement.',
        paymentStatus: 'pending'
      },
      {
        user: createdUsers[1]._id,
        provider: createdProviders[1]._id,
        service: {
          category: createdCategories[1]._id,
          subcategory: createdSubcategories[3]._id
        },
        bookingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        startTime: '14:00',
        estimatedHours: 3,
        totalPrice: 240,
        status: 'pending',
        userDetails: {
          fullName: createdUsers[1].fullName,
          phoneNumber: createdUsers[1].phoneNumber,
          location: '456 Oak St, Los Angeles, CA'
        },
        notes: 'Need to install 5 new light fixtures in living room and kitchen.',
        paymentStatus: 'pending'
      },
      {
        user: createdUsers[0]._id,
        provider: createdProviders[2]._id,
        service: {
          category: createdCategories[2]._id,
          subcategory: createdSubcategories[4]._id
        },
        bookingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        startTime: '09:00',
        estimatedHours: 4,
        totalPrice: 120,
        status: 'completed',
        userDetails: {
          fullName: createdUsers[0].fullName,
          phoneNumber: createdUsers[0].phoneNumber,
          location: '789 Pine St, Chicago, IL'
        },
        notes: 'Need deep cleaning for 3 bedroom house, including kitchen and 2 bathrooms.',
        paymentStatus: 'paid'
      }
    ];

    const createdBookings = await Booking.insertMany(bookings);
    console.log(`${createdBookings.length} bookings imported successfully`);

    // Create reviews
    const reviews = [
      {
        user: createdUsers[0]._id,
        provider: createdProviders[2]._id,
        booking: createdBookings[2]._id,
        rating: 5,
        comment: 'David did an excellent job cleaning our home. Everything was spotless and he was very professional.'
      }
    ];

    const createdReviews = await Review.insertMany(reviews);
    console.log(`${createdReviews.length} reviews imported successfully`);

    console.log('All data imported successfully!');
    
    process.exit();
  } catch (error) {
    console.error(`Error importing data: ${error.message}`);
    process.exit(1);
  }
};

// Delete Data
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Provider.deleteMany();
    await Category.deleteMany();
    await Subcategory.deleteMany();
    await Service.deleteMany();
    await Booking.deleteMany();
    await Review.deleteMany();

    console.log('All data deleted successfully!');
    
    process.exit();
  } catch (error) {
    console.error(`Error deleting data: ${error.message}`);
    process.exit(1);
  }
};

// Run script based on command arguments
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please provide proper command: -i (import data) or -d (delete data)');
  process.exit();
} 