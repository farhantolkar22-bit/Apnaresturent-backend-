const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const { connectDB, getIsConnected, getMockDb, saveMockDb } = require('./config/db');
const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Review = require('./models/Review');

const menuItems = [
  // --- SOUP VEG./NON-VEG ---
  {
    name: "Chicken Manchow Soup",
    description: "Classic spicy and tangy chicken soup loaded with minced vegetables, ginger, garlic, and served with crispy fried noodles.",
    price: 100,
    halfPrice: 50,
    category: "soup",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=600",
    isSignature: true,
    isAvailable: true
  },
  {
    name: "Chicken Clear Soup",
    description: "Light, warm, and comforting soup with tender chicken shreds and seasonal vegetables in clear chicken broth.",
    price: 100,
    halfPrice: 50,
    category: "soup",
    image: "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Baba Soup",
    description: "Chef's special thick and rich chicken soup made with a secret blend of spicy herbs and shredded egg white.",
    price: 160,
    halfPrice: 90,
    category: "soup",
    image: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Veg Manchow Soup",
    description: "A popular Indo-Chinese soup prepared with finely chopped mixed vegetables and served hot with crispy fried noodles.",
    price: 80,
    halfPrice: 40,
    category: "soup",
    image: "https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Veg Clear Soup",
    description: "A nourishing clear broth containing fresh garden broccoli, carrots, mushrooms, and spring onions.",
    price: 80,
    halfPrice: 40,
    category: "soup",
    image: "https://images.unsplash.com/photo-1548940740-204726a1d93f?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Veg Baba Soup",
    description: "Vibrant vegetable soup crafted with spicy herbs, garlic, vinegar, and a touch of chili paste.",
    price: 130,
    halfPrice: 70,
    category: "soup",
    image: "https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Hot & Sour Soup",
    description: "Classic spicy, sour, and thick broth loaded with chicken, mushrooms, bamboo shoots, and tofu.",
    price: 110,
    halfPrice: 60,
    category: "soup",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Veg Hot & Sour Soup",
    description: "A warming and spicy-sour soup filled with mixed vegetables, mushrooms, and green onions.",
    price: 90,
    halfPrice: 50,
    category: "soup",
    image: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Sweet Corn Soup",
    description: "A comforting, creamy, and sweet soup containing fresh sweet corn kernels and tender shredded chicken.",
    price: 110,
    halfPrice: 60,
    category: "soup",
    image: "https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Veg Sweet Corn Soup",
    description: "Mild and creamy soup prepared with tender sweet corn mash, fresh vegetables, and white pepper.",
    price: 90,
    halfPrice: 50,
    category: "soup",
    image: "https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Wonton Soup",
    description: "Delicious hand-folded chicken wontons floating in a piping hot, savory clear chicken broth with baby bok choy.",
    price: 140,
    halfPrice: 80,
    category: "soup",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Veg Wonton Soup",
    description: "Steamed vegetable wontons served in a seasoned clear broth garnished with toasted sesame oil.",
    price: 120,
    halfPrice: 70,
    category: "soup",
    image: "https://images.unsplash.com/photo-1548940740-204726a1d93f?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Lemon Coriander Soup",
    description: "A healthy, zesty soup featuring chicken chunks, fresh coriander, and a strong squeeze of lemon.",
    price: 110,
    halfPrice: 60,
    category: "soup",
    image: "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Veg Lemon Coriander Soup",
    description: "Clear vegetable broth infused with lemon juice, fresh coriander leaves, ginger, and garlic.",
    price: 95,
    halfPrice: 55,
    category: "soup",
    image: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },

  // --- RICE VEG./NON-VEG ---
  {
    name: "Egg Fried Rice",
    description: "Fluffy basmati rice wok-tossed with scrambled eggs, light soy sauce, green peas, and scallions.",
    price: 140,
    halfPrice: 70,
    category: "rice",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Fried Rice",
    description: "Long-grain rice stir-fried with diced chicken pieces, spring onions, fresh carrots, and authentic spices.",
    price: 150,
    halfPrice: 80,
    category: "rice",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Shezwan Fried Rice",
    description: "Fiery red fried rice stir-fried with tender chicken chunks and spicy house-made Schezwan paste.",
    price: 170,
    halfPrice: 90,
    category: "rice",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Triple Fried Rice",
    description: "Combination of chicken fried rice and noodles served with a delicious spicy gravy and crispy fried noodles.",
    price: 200,
    halfPrice: 120,
    category: "rice",
    image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&q=80&w=600",
    isSignature: true,
    isAvailable: true
  },
  {
    name: "Chicken Chopper Fried Rice",
    description: "Wok-tossed chicken fried rice topped with a thick, savory chicken gravy and garnished with chopped green onions.",
    price: 240,
    halfPrice: 140,
    category: "rice",
    image: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Thousand Rice",
    description: "A combination of spicy fried rice served with rich, creamy tomato-based chicken gravy containing roasted dry chilis.",
    price: 280,
    halfPrice: 150,
    category: "rice",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Chilli Rice",
    description: "Spicy stir-fried chicken rice paired with delicious classic chicken chili chunks.",
    price: 240,
    halfPrice: 140,
    category: "rice",
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Packing Rice",
    description: "Flavor-packed fried rice wrapped and infused with garlic chicken gravy, green peppers, and exotic spices.",
    price: 280,
    halfPrice: 180,
    category: "rice",
    image: "https://images.unsplash.com/photo-1623653387945-2fd25214f8fc?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Apna Special Rice",
    description: "Our signature rice preparation tossed with tender chicken strips, fried eggs, and chef's secret aromatic spice blend.",
    price: 280,
    halfPrice: 180,
    category: "rice",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=600",
    isSignature: true,
    isAvailable: true
  },
  {
    name: "Chicken Hong Kong Rice",
    description: "Sweet and spicy stir-fried chicken rice cooked with bell peppers, cashew nuts, and dark soy sauce.",
    price: 180,
    halfPrice: 100,
    category: "rice",
    image: "https://images.unsplash.com/photo-1536392139656-3ee2fbead42a?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Crispy Rice",
    description: "Stir-fried rice topped with golden, crispy batter-fried chicken nuggets and spring onions.",
    price: 200,
    category: "rice",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Boiled Fried Rice",
    description: "Healthy and lightly tossed basmati rice with sliced boiled chicken breast and minimal oil.",
    price: 100,
    category: "rice",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Veg Fried Rice",
    description: "Classic wok-tossed basmati rice with finely chopped carrots, French beans, cabbage, and spring onions.",
    price: 140,
    halfPrice: 70,
    category: "rice",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Veg Shezwan Fried Rice",
    description: "Spicy and flavorful fried rice tossed with seasonal vegetables and loaded with hot Schezwan sauce.",
    price: 150,
    halfPrice: 80,
    category: "rice",
    image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Veg Triple Fried Rice",
    description: "A tasty combination of veg fried rice, noodles, and crispy noodles served with a spicy vegetable gravy.",
    price: 180,
    halfPrice: 100,
    category: "rice",
    image: "https://images.unsplash.com/photo-1623653387945-2fd25214f8fc?auto=format&fit=crop&q=80&w=600",
    isSignature: true,
    isAvailable: true
  },
  {
    name: "Veg Chopper Fried Rice",
    description: "Indo-Chinese rice served with an appetizing topping of finely chopped vegetables in a soy-garlic gravy.",
    price: 220,
    halfPrice: 120,
    category: "rice",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Paneer Chilli Rice",
    description: "Wok-fried rice paired with hot, spicy paneer chunks tossed with capsicum and green chilies.",
    price: 250,
    halfPrice: 150,
    category: "rice",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Paneer Fried Rice",
    description: "A delicious stir-fry of basmati rice, tender paneer cubes, green peas, carrots, and spring onions.",
    price: 150,
    halfPrice: 80,
    category: "rice",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Veg Manchurian Chilli Rice",
    description: "Flavorsome veg fried rice served alongside juicy vegetable Manchurian dumplings in a rich spicy gravy.",
    price: 220,
    halfPrice: 130,
    category: "rice",
    image: "https://images.unsplash.com/photo-1536392139656-3ee2fbead42a?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Veg Crispy Rice",
    description: "Veg fried rice accompanied by batter-fried crunchy vegetables tossed in sweet chili sauce.",
    price: 180,
    category: "rice",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Mushroom Fried Rice",
    description: "Delicious stir-fried Chinese rice cooked with fresh button mushrooms, garlic cloves, and chopped green onions.",
    price: 160,
    halfPrice: 90,
    category: "rice",
    image: "https://images.unsplash.com/photo-1623653387945-2fd25214f8fc?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Schezwan Egg Fried Rice",
    description: "Spicy Schezwan rice wok-tossed with multiple scrambled eggs, sliced bell peppers, cabbage, and red chili sauce.",
    price: 160,
    halfPrice: 90,
    category: "rice",
    image: "https://images.unsplash.com/photo-1536392139656-3ee2fbead42a?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Burnt Garlic Rice",
    description: "Aromatic fried rice loaded with crispy golden burnt garlic flakes, tender chicken bites, and fresh green onions.",
    price: 190,
    halfPrice: 110,
    category: "rice",
    image: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Veg Burnt Garlic Rice",
    description: "A fragrant wok-style rice tossed with plenty of crispy golden garlic, baby corn, fresh broccoli, and sweet carrots.",
    price: 160,
    halfPrice: 90,
    category: "rice",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Singapore Fried Rice",
    description: "Aromatic curry-scented Chinese fried rice prepared with broccoli, fresh beans, cashew nuts, and sweet raisins.",
    price: 180,
    halfPrice: 100,
    category: "rice",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Shanghai Fried Rice",
    description: "Cantonese dark-soy fried rice tossed with tender mushrooms, sweet green peas, spring sprouts, and local spices.",
    price: 180,
    halfPrice: 100,
    category: "rice",
    image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },

  // --- STARTERS VEG./NON-VEG ---
  {
    name: "Chicken Fry Lollipop",
    description: "Juicy chicken wings shaped into lollipops, spiced, deep-fried to perfection and served with Schezwan sauce.",
    price: 200,
    halfPrice: 100,
    category: "starters",
    image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&q=80&w=600",
    isSignature: true,
    isAvailable: true
  },
  {
    name: "Chicken Masala Lollipop",
    description: "Fried chicken lollipops coated in a thick, semi-dry, flavorful dark spice gravy.",
    price: 250,
    halfPrice: 150,
    category: "starters",
    image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Dry Chilli",
    description: "Diced chicken chunks wok-tossed dry with onions, green bell peppers, garlic, soy sauce, and red chilis.",
    price: 180,
    halfPrice: 100,
    category: "starters",
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Chilli",
    description: "Indo-Chinese style tender chicken bites tossed in a delicious spicy-tangy soy chilli gravy.",
    price: 220,
    halfPrice: 120,
    category: "starters",
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Crispy",
    description: "Golden crispy fried chicken strips tossed in a sweet, spicy, and tangy garlic sauce.",
    price: 220,
    halfPrice: 120,
    category: "starters",
    image: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Chinese Bhel",
    description: "Crunchy fried noodles combined with stir-fried chicken strips, fresh cabbage, onions, and hot sauce.",
    price: 160,
    halfPrice: 90,
    category: "starters",
    image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Manchurian",
    description: "Minced chicken meatballs deep-fried and cooked in an aromatic, tangy dark soy-based Manchurian gravy.",
    price: 200,
    halfPrice: 120,
    category: "starters",
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Apna Special Starter",
    description: "Our special recipe featuring marinated chicken fried and tossed with signature red spices and honey glaze.",
    price: 280,
    category: "starters",
    image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&q=80&w=600",
    isSignature: true,
    isAvailable: true
  },
  {
    name: "Veg Chilli",
    description: "Assorted crispy vegetables or cheese cubes tossed with soy sauce, garlic, and fresh green chilies.",
    price: 150,
    halfPrice: 90,
    category: "starters",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Veg Manchurian",
    description: "Crispy mixed veg dumplings fried and tossed in a tangy soy, garlic, and ginger sauce.",
    price: 150,
    halfPrice: 90,
    category: "starters",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Veg Crispy",
    description: "Fresh assorted vegetables batter-coated, fried crisp, and glazed in a mild chili-sweet seasoning.",
    price: 150,
    halfPrice: 90,
    category: "starters",
    image: "https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Veg Chinese Bhel",
    description: "Crunchy fried noodles mixed with raw spring vegetables, onions, cabbage, and a spicy Schezwan dressing.",
    price: 140,
    halfPrice: 80,
    category: "starters",
    image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Paneer Chilli",
    description: "Fresh cottage cheese chunks tossed in hot wok with spring onions, capsicum, green chilies, and soy sauce.",
    price: 250,
    halfPrice: 150,
    category: "starters",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Paneer Crispy",
    description: "Batter-fried golden paneer strips tossed in a sweet-spicy garlic sauce with green onions.",
    price: 250,
    halfPrice: 150,
    category: "starters",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Paneer Manchurian",
    description: "Succulent paneer cubes tossed in a sweet and sour ginger-garlic soy gravy with spring onions.",
    price: 250,
    halfPrice: 150,
    category: "starters",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },

  // --- NOODLES VEG./NON-VEG ---
  {
    name: "Egg Fried Noodles",
    description: "Stir-fried soft noodles tossed with scrambled eggs, cabbage, carrots, bell peppers, and soy sauce.",
    price: 140,
    halfPrice: 70,
    category: "noodles",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Hakka Noodles",
    description: "Hakka-style wheat noodles wok-tossed with tender chicken strips, fresh crisp vegetables, and light seasoning.",
    price: 150,
    halfPrice: 80,
    category: "noodles",
    image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Shezwan Noodles",
    description: "Fiery red soft noodles stir-fried with chicken strips and mixed veggies in a spicy Schezwan sauce.",
    price: 170,
    halfPrice: 90,
    category: "noodles",
    image: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Triple Noodles",
    description: "Combination of stir-fried noodles and rice served with a delicious spicy chicken gravy and crispy fried noodles.",
    price: 200,
    halfPrice: 120,
    category: "noodles",
    image: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=600",
    isSignature: true,
    isAvailable: true
  },
  {
    name: "Chicken Chopper Noodles",
    description: "Hakka noodles topped with a delicious, rich chicken gravy and finely chopped fresh vegetables.",
    price: 240,
    halfPrice: 140,
    category: "noodles",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Thousand Noodles",
    description: "Spicy noodles served with a luscious garlic-chili chicken gravy containing dry red chilis and spring onions.",
    price: 280,
    halfPrice: 150,
    category: "noodles",
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Chilli Noodles",
    description: "Delicious stir-fried noodles paired with separate wok-tossed spicy chicken chili chunks.",
    price: 240,
    halfPrice: 140,
    category: "noodles",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Packing Noodles",
    description: "Savory noodles wrapped in a foil and cooked with thick chicken-veggie garlic gravy.",
    price: 280,
    halfPrice: 180,
    category: "noodles",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Apna Special Noodles",
    description: "Chef's signature hakka noodles tossed with scrambled eggs, chicken shreds, and a secret house spice mix.",
    price: 280,
    halfPrice: 180,
    category: "noodles",
    image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&q=80&w=600",
    isSignature: true,
    isAvailable: true
  },
  {
    name: "Chicken Hong Kong Noodles",
    description: "Delicious noodles cooked with bell peppers, cashew nuts, green chilies, and dark soy sauce.",
    price: 180,
    halfPrice: 100,
    category: "noodles",
    image: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Crispy Noodles",
    description: "Wok-fried soft noodles tossed with batter-fried chicken nuggets and raw cabbage salad.",
    price: 200,
    category: "noodles",
    image: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Boiled Noodles",
    description: "Health-focused boiled noodles tossed lightly with olive oil, boiled chicken shreds, and spring onions.",
    price: 100,
    category: "noodles",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Veg Fried Noodles",
    description: "Classic hakka noodles stir-fried with julienned carrots, cabbage, French beans, and bell peppers.",
    price: 140,
    halfPrice: 70,
    category: "noodles",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Veg Shezwan Noodles",
    description: "Spicy and tangy noodles stir-fried with sliced vegetables and hot, fiery Schezwan sauce.",
    price: 150,
    halfPrice: 80,
    category: "noodles",
    image: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Veg Triple Noodles",
    description: "Stir-fried noodles combined with fried rice, topped with a flavorful hot vegetable Manchurian gravy and crispy noodles.",
    price: 180,
    halfPrice: 100,
    category: "noodles",
    image: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=600",
    isSignature: true,
    isAvailable: true
  },
  {
    name: "Veg Chopper Noodles",
    description: "Hakka noodles served with an appetizing topping of finely chopped vegetables in a thick garlic gravy.",
    price: 220,
    halfPrice: 120,
    category: "noodles",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Paneer Chilli Noodles",
    description: "Wok-fried noodles served with spicy paneer chunks tossed with capsicum and dark soy-chili sauce.",
    price: 250,
    halfPrice: 150,
    category: "noodles",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Paneer Fried Noodles",
    description: "Classic hakka noodles tossed with golden fried paneer cubes, soy sauce, and spring vegetables.",
    price: 150,
    halfPrice: 80,
    category: "noodles",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Veg Manchurian Chilli Noodles",
    description: "Stir-fried noodles paired with hot, saucy vegetable Manchurian dumplings.",
    price: 220,
    halfPrice: 120,
    category: "noodles",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Veg Crispy Noodles",
    description: "Soft stir-fried noodles accompanied by crispy, golden vegetables tossed in a sweet chili soy sauce.",
    price: 180,
    category: "noodles",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Shanghai Pan-Fried Noodles",
    description: "Crispy pan-fried noodles topped with stir-fried Chinese vegetables and mushrooms in a dark savory sauce.",
    price: 170,
    halfPrice: 90,
    category: "noodles",
    image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Chilli Garlic Noodles",
    description: "Spicy noodles stir-fried with fragrant garlic cloves, green chillies, chicken shreds, and dark vinegar soy sauce.",
    price: 170,
    halfPrice: 95,
    category: "noodles",
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Veg Chilli Garlic Noodles",
    description: "Spicy wok-tossed noodles packed with a strong flavor of garlic, red chilli flakes, and shredded vegetables.",
    price: 150,
    halfPrice: 85,
    category: "noodles",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Dan Dan Noodles",
    description: "Authentic Sichuan street-style noodles served in a savory, spicy, nutty sesame sauce with minced chicken chunks.",
    price: 210,
    halfPrice: 120,
    category: "noodles",
    image: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Veg Dan Dan Noodles",
    description: "Sichuan style noodles with savory soy-minced tofu and green onions in a spicy, nutty sesame sauce.",
    price: 180,
    halfPrice: 100,
    category: "noodles",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Chicken Singapore Rice Noodles",
    description: "Thin vermicelli rice noodles stir-fried with fragrant yellow curry powder, chicken strips, egg, and fresh bell peppers.",
    price: 180,
    halfPrice: 100,
    category: "noodles",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  },
  {
    name: "Veg Singapore Rice Noodles",
    description: "Delicate vermicelli noodles tossed in rich curry powder with cabbage, carrots, bell peppers, and bean sprouts.",
    price: 160,
    halfPrice: 90,
    category: "noodles",
    image: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=600",
    isSignature: false,
    isAvailable: true
  }
];

const reviews = [
  {
    name: "Aarav Sharma",
    rating: 5,
    comment: "The Chicken Apna Special Noodles were absolutely stellar! The chicken was melt-in-the-mouth, and the spices were perfectly balanced. Highly recommend this place for family dinners.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    isFeatured: true
  },
  {
    name: "Priya Patel",
    rating: 5,
    comment: "Apna Restaurant has a beautiful vibe! The Chicken Fry Lollipops were crisp and juicy, and ordering online was a breeze.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    isFeatured: true
  },
  {
    name: "Rohan Malhotra",
    rating: 4,
    comment: "Excellent taste and very quick delivery! Order tracking was accurate, and the Triple Fried Rice was divine. Definitely ordering again.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
    isFeatured: true
  }
];

const runSeed = async () => {
  console.log(">>> Starting seed script...");
  
  // Connect to Database
  await connectDB();
  
  const isConnected = getIsConnected();
  const hashedPassword = await bcrypt.hash("adminpassword", 10);
  
  const adminUser = {
    name: "Apna Admin",
    email: "admin@apnarestaurant.com",
    password: hashedPassword,
    role: "admin",
    createdAt: new Date()
  };

  if (isConnected) {
    try {
      // Seed MongoDB
      console.log("Seeding MongoDB...");
      
      // Clear existing
      await MenuItem.deleteMany({});
      await Review.deleteMany({});
      await User.deleteMany({ role: 'admin' });
      
      // Insert
      await MenuItem.insertMany(menuItems);
      await Review.insertMany(reviews);
      
      // Check if admin already exists
      const existingAdmin = await User.findOne({ email: adminUser.email });
      if (!existingAdmin) {
        await User.create(adminUser);
      }
      
      console.log(">>> MongoDB seeding completed successfully!");
    } catch (err) {
      console.error("Error seeding MongoDB:", err.message);
    }
  }

  // Always seed JSON mock DB files as well, so fallback is ready
  console.log("Seeding simulated JSON database...");
  const mockDb = getMockDb();
  
  // Seed local structures
  mockDb.menuitems = menuItems.map((item, idx) => ({ _id: `mock_menu_${idx}`, ...item }));
  mockDb.reviews = reviews.map((rev, idx) => ({ _id: `mock_rev_${idx}`, ...rev }));
  
  // Check if admin exists in mock users
  const mockAdminExists = mockDb.users.some(u => u.email === adminUser.email);
  if (!mockAdminExists) {
    mockDb.users.push({ _id: "mock_user_admin", ...adminUser });
  }
  
  // Save mock files
  saveMockDb('menuitems');
  saveMockDb('reviews');
  saveMockDb('users');
  saveMockDb('orders');
  saveMockDb('bookings');
  
  console.log(">>> Simulated JSON database seeding completed!");
  
  if (isConnected) {
    mongoose.connection.close();
  }
  console.log(">>> Seed finished. Exiting...");
  process.exit(0);
};

runSeed();
