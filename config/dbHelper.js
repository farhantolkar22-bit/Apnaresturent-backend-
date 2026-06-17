const { getIsConnected, getMockDb, saveMockDb } = require('./db');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

const getModel = (collectionName) => {
  switch (collectionName) {
    case 'users': return User;
    case 'menuitems': return MenuItem;
    case 'orders': return Order;
    case 'bookings': return Booking;
    case 'reviews': return Review;
    default: throw new Error(`Model not found for ${collectionName}`);
  }
};

const generateMockId = (prefix) => {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
};

module.exports = {
  find: async (collectionName, query = {}) => {
    if (getIsConnected()) {
      const Model = getModel(collectionName);
      return await Model.find(query);
    } else {
      const mockDb = getMockDb();
      const list = mockDb[collectionName] || [];
      // Simple filter logic
      return list.filter(item => {
        for (let key in query) {
          // support simple key-value matching
          if (query[key] !== undefined && item[key] !== query[key]) {
            return false;
          }
        }
        return true;
      });
    }
  },

  findOne: async (collectionName, query = {}) => {
    if (getIsConnected()) {
      const Model = getModel(collectionName);
      return await Model.findOne(query);
    } else {
      const mockDb = getMockDb();
      const list = mockDb[collectionName] || [];
      return list.find(item => {
        for (let key in query) {
          if (item[key] !== query[key]) {
            return false;
          }
        }
        return true;
      }) || null;
    }
  },

  findById: async (collectionName, id) => {
    if (getIsConnected()) {
      const Model = getModel(collectionName);
      return await Model.findById(id);
    } else {
      const mockDb = getMockDb();
      const list = mockDb[collectionName] || [];
      return list.find(item => item._id === id || item.id === id) || null;
    }
  },

  create: async (collectionName, data) => {
    if (getIsConnected()) {
      const Model = getModel(collectionName);
      const doc = new Model(data);
      return await doc.save();
    } else {
      const mockDb = getMockDb();
      const prefix = collectionName.substring(0, 3);
      const newDoc = {
        _id: generateMockId(prefix),
        id: generateMockId(prefix),
        ...data,
        createdAt: new Date().toISOString()
      };
      mockDb[collectionName].push(newDoc);
      saveMockDb(collectionName);
      return newDoc;
    }
  },

  findByIdAndUpdate: async (collectionName, id, updateData) => {
    if (getIsConnected()) {
      const Model = getModel(collectionName);
      return await Model.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const mockDb = getMockDb();
      const list = mockDb[collectionName] || [];
      const index = list.findIndex(item => item._id === id || item.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...updateData };
        saveMockDb(collectionName);
        return list[index];
      }
      return null;
    }
  },

  findByIdAndDelete: async (collectionName, id) => {
    if (getIsConnected()) {
      const Model = getModel(collectionName);
      return await Model.findByIdAndDelete(id);
    } else {
      const mockDb = getMockDb();
      const list = mockDb[collectionName] || [];
      const index = list.findIndex(item => item._id === id || item.id === id);
      if (index !== -1) {
        const deleted = list.splice(index, 1)[0];
        saveMockDb(collectionName);
        return deleted;
      }
      return null;
    }
  }
};
