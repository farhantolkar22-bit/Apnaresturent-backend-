const express = require('express');
const router = express.Router();
const dbHelper = require('../config/dbHelper');
const { auth, admin } = require('../middleware/authMiddleware');

// @route   GET api/menu
// @desc    Get all menu items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const items = await dbHelper.find('menuitems');
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/menu/reviews
// @desc    Get all reviews
// @access  Public
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await dbHelper.find('reviews');
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/menu/:id
// @desc    Get menu item by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const item = await dbHelper.findById('menuitems', req.params.id);
    if (!item) {
      return res.status(404).json({ msg: 'Menu item not found' });
    }
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/menu
// @desc    Add new menu item
// @access  Private/Admin
router.post('/', [auth, admin], async (req, res) => {
  const { name, description, price, category, image, isSignature, isAvailable } = req.body;

  if (!name || !description || price === undefined || !category || !image) {
    return res.status(400).json({ msg: 'Please enter all required fields' });
  }

  try {
    const newItem = await dbHelper.create('menuitems', {
      name,
      description,
      price: Number(price),
      category,
      image,
      isSignature: !!isSignature,
      isAvailable: isAvailable !== undefined ? !!isAvailable : true
    });
    res.json(newItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/menu/:id
// @desc    Update menu item
// @access  Private/Admin
router.put('/:id', [auth, admin], async (req, res) => {
  const { name, description, price, category, image, isSignature, isAvailable } = req.body;
  const updateFields = {};
  
  if (name !== undefined) updateFields.name = name;
  if (description !== undefined) updateFields.description = description;
  if (price !== undefined) updateFields.price = Number(price);
  if (category !== undefined) updateFields.category = category;
  if (image !== undefined) updateFields.image = image;
  if (isSignature !== undefined) updateFields.isSignature = !!isSignature;
  if (isAvailable !== undefined) updateFields.isAvailable = !!isAvailable;

  try {
    let item = await dbHelper.findById('menuitems', req.params.id);
    if (!item) {
      return res.status(404).json({ msg: 'Menu item not found' });
    }

    item = await dbHelper.findByIdAndUpdate('menuitems', req.params.id, updateFields);
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/menu/:id
// @desc    Delete menu item
// @access  Private/Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const item = await dbHelper.findById('menuitems', req.params.id);
    if (!item) {
      return res.status(404).json({ msg: 'Menu item not found' });
    }

    await dbHelper.findByIdAndDelete('menuitems', req.params.id);
    res.json({ msg: 'Menu item removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
