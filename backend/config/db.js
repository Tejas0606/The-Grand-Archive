const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/grand_archive';
    if (!process.env.MONGO_URI && process.env.NODE_ENV === 'production') {
      console.error('[The Grand Archive] FATAL: MONGO_URI environment variable is not defined in Render!');
      process.exit(1);
    }
    const conn = await mongoose.connect(uri);
    console.log(`[The Grand Archive] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[The Grand Archive] MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
