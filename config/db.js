const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isConnected = false;
let dbFallbackData = {
  users: [],
  menuitems: [],
  orders: [],
  bookings: [],
  reviews: []
};

const mockDbPath = path.join(__dirname, '../mock_db');

const loadMockDb = () => {
  if (!fs.existsSync(mockDbPath)) {
    fs.mkdirSync(mockDbPath, { recursive: true });
  }
  
  const files = ['users.json', 'menuitems.json', 'orders.json', 'bookings.json', 'reviews.json'];
  files.forEach(file => {
    const filePath = path.join(mockDbPath, file);
    const key = file.replace('.json', '');
    if (fs.existsSync(filePath)) {
      try {
        dbFallbackData[key] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (err) {
        console.error(`Error loading mock file ${file}:`, err.message);
        dbFallbackData[key] = [];
      }
    } else {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      dbFallbackData[key] = [];
    }
  });
};

const saveMockDb = (key) => {
  if (!fs.existsSync(mockDbPath)) {
    fs.mkdirSync(mockDbPath, { recursive: true });
  }
  const filePath = path.join(mockDbPath, `${key}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(dbFallbackData[key], null, 2));
  } catch (err) {
    console.error(`Error saving mock file ${key}:`, err.message);
  }
};

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/apnarestaurant';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000 // Timeout fast so we can trigger mock db fallback
    });
    isConnected = true;
    console.log('>>> MongoDB Connected Successfully.');
  } catch (err) {
    console.error('>>> MongoDB Connection Failed:', err.message);
    console.log('>>> Fallback: Starting Apna Restaurant in Simulated JSON-Database Mode.');
    loadMockDb();
  }
};

module.exports = {
  connectDB,
  getIsConnected: () => isConnected,
  getMockDb: () => dbFallbackData,
  saveMockDb
};
