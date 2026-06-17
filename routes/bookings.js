const express = require('express');
const router = express.Router();
const dbHelper = require('../config/dbHelper');
const { auth, admin } = require('../middleware/authMiddleware');

// @route   POST api/bookings
// @desc    Create a table reservation
// @access  Public
router.post('/', async (req, res) => {
  const { name, email, phone, date, time, guests } = req.body;

  if (!name || !phone || !date || !time || !guests) {
    return res.status(400).json({ msg: 'Please enter all required reservation fields (name, phone, date, time, guests)' });
  }

  try {
    const newBooking = await dbHelper.create('bookings', {
      name,
      email,
      phone,
      date,
      time,
      guests: Number(guests),
      status: 'pending'
    });
    res.json({ success: true, booking: newBooking });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/bookings
// @desc    Get all table reservations
// @access  Private/Admin
router.get('/', [auth, admin], async (req, res) => {
  try {
    const bookings = await dbHelper.find('bookings');
    // Sort by date desc (mock sorting since simple helper doesn't do it)
    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/bookings/:id
// @desc    Update reservation status
// @access  Private/Admin
router.put('/:id', [auth, admin], async (req, res) => {
  const { status } = req.body;

  if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ msg: 'Invalid booking status' });
  }

  try {
    let booking = await dbHelper.findById('bookings', req.params.id);
    if (!booking) {
      return res.status(404).json({ msg: 'Reservation not found' });
    }

    booking = await dbHelper.findByIdAndUpdate('bookings', req.params.id, { status });
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/bookings/:id
// @desc    Delete a reservation
// @access  Private/Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const booking = await dbHelper.findById('bookings', req.params.id);
    if (!booking) {
      return res.status(404).json({ msg: 'Reservation not found' });
    }

    await dbHelper.findByIdAndDelete('bookings', req.params.id);
    res.json({ msg: 'Reservation removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
