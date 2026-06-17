const express = require('express');
const router = express.Router();
const dbHelper = require('../config/dbHelper');

// List of pre-configured responses and keywords
const getChatBotResponse = async (message) => {
  const msg = message.toLowerCase().trim();
  
  // Greetings
  if (/\b(hi|hello|hey|greetings|hola|good morning|good evening|good afternoon)\b/.test(msg)) {
    return {
      text: "Hello! Welcome to Apna Restaurant's AI Assistant. How can I help you today? I can recommend dishes, assist with reservations, share our hours, or tell you about our locations.",
      options: ["View Menu", "Reserve a Table", "Signature Dishes", "Opening Hours"]
    };
  }

  // Reservation queries
  if (/\b(reserve|reservation|book|table|booking|dine in)\b/.test(msg)) {
    return {
      text: "You can book a table instantly! Navigate to our 'Reserve Table' tab or click below to fill out the reservation form with your date, time, and guest count. We will send you an email confirmation immediately.",
      options: ["Book Table Now", "Opening Hours"]
    };
  }

  // Opening hours queries
  if (/\b(hours|time|timing|open|close|opening|closing)\b/.test(msg)) {
    return {
      text: "Apna Restaurant is open daily from 11:00 AM to 11:00 PM (Monday to Sunday). Our kitchen last order is taken at 10:30 PM. We hope to see you soon!",
      options: ["View Menu", "Reserve a Table"]
    };
  }

  // Contact queries
  if (/\b(contact|phone|number|call|email|whatsapp|mobile|support)\b/.test(msg)) {
    return {
      text: "You can contact us via:\n📞 Phone: +91 98765 43210\n💬 WhatsApp: +91 98765 43210 (Click the floating widget)\n📧 Email: info@apnarestaurant.com",
      options: ["Reserve a Table", "View Menu"]
    };
  }

  // Location / Address / Map queries
  if (/\b(location|address|where|map|direction|locate|place|city|gps)\b/.test(msg)) {
    return {
      text: "We are located at: 123 Gourmet Boulevard, Foodie Haven, Hyderabad, Telangana - 500001. You can find our exact interactive location via the Google Map at the bottom of our homepage.",
      options: ["Opening Hours", "Contact Us"]
    };
  }

  // Menu items query
  if (/\b(menu|food|eat|dishes|items|price|cost|card)\b/.test(msg)) {
    return {
      text: "We serve an exquisite range of Starters, Main Courses, authentic Dum Biryanis, Chinese specialities, Beverages, and Desserts. You can view prices and add items to your cart directly from our Menu section.",
      options: ["Go to Menu", "Signature Dishes", "Biryani Options"]
    };
  }

  // Biryani queries
  if (/\b(biryani|rice|pulao|dum biryani)\b/.test(msg)) {
    return {
      text: "Our Royal Hyderabadi Dum Chicken Biryani is our crown jewel, slow-cooked in traditional clay pots. We also offer a royal Paneer Veg Dum Biryani for our vegetarian guests. Both are served with freshly made salan and raita.",
      options: ["Order Biryani", "View Full Menu"]
    };
  }

  // Signature dishes query
  if (/\b(signature|best|special|popular|famous|recommend|dishes|must try)\b/.test(msg)) {
    // Attempt to pull signature items dynamically from DB if available
    try {
      const items = await dbHelper.find('menuitems', { isSignature: true });
      if (items && items.length > 0) {
        const itemNames = items.slice(0, 3).map(item => `${item.name} (₹${item.price})`).join('\n✨ ');
        return {
          text: `Here are our top signature dishes crafted by our Master Chefs:\n✨ ${itemNames}\n\nThey are highly recommended for first-time guests!`,
          options: ["Go to Menu", "Reserve a Table"]
        };
      }
    } catch (err) {
      // ignore and use fallback below
    }
    return {
      text: "Our signature dishes include the aromatic Hyderabadi Dum Chicken Biryani, Paneer Tikka Multi-Grain, Apna Signature Paneer Butter Masala, and our decadent Sizzling Chocolate Brownie.",
      options: ["Go to Menu", "Reserve a Table"]
    };
  }

  // Checkout / Payment / Delivery queries
  if (/\b(order|delivery|checkout|pay|payment|razorpay|cash|cod|cart)\b/.test(msg)) {
    return {
      text: "We support online ordering with delivery directly to your doorstep. You can pay securely using Razorpay (supports UPI, Cards, Netbanking) or choose Cash on Delivery. Order tracking is available after placement.",
      options: ["Go to Menu", "Track Order"]
    };
  }

  // Default response
  return {
    text: "Thank you for reaching out to Apna Restaurant support! I'm happy to help. For reservation queries, menu items, opening hours, or location, feel free to ask directly or use the options below.",
    options: ["Signature Dishes", "Reserve a Table", "View Menu", "Contact Us"]
  };
};

// @route   POST api/chat
// @desc    Process chatbot message
// @access  Public
router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ msg: 'Please enter a message' });
  }

  try {
    const response = await getChatBotResponse(message);
    res.json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
