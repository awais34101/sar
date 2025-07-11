import mongoose from 'mongoose';

const mongoUrl = process.env.MONGODB_URL || process.env.DATABASE_URL || 'mongodb://localhost:27017/crm_dev';

if (!mongoUrl.startsWith('mongodb://') && !mongoUrl.startsWith('mongodb+srv://')) {
  console.error('❌ Invalid MongoDB URL format');
  console.error('📋 Please follow these steps:');
  console.error('1. Create MongoDB database in MongoDB Atlas or use MongoDB service');
  console.error('2. Copy the connection string from your MongoDB provider');
  console.error('3. Add MONGODB_URL to your environment variables');
  console.error('4. Redeploy your web service');
  console.error('5. Example: mongodb+srv://username:password@cluster.mongodb.net/database');
  process.exit(1);
}

console.log('🔌 Connecting to MongoDB...');

export async function connectToDatabase() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('✅ Successfully connected to MongoDB');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

// Handle connection events
mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});