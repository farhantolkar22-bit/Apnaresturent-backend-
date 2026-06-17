const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const dbHelper = require('../config/dbHelper');
const { auth, admin } = require('../middleware/authMiddleware');

let razorpay = null;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  try {
    razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET
    });
    console.log('>>> Razorpay SDK Initialized Successfully.');
  } catch (err) {
    console.error('>>> Failed to initialize Razorpay SDK:', err.message);
  }
} else {
  console.log('>>> Note: Razorpay keys missing in .env. Checkout will run in Demo/Simulation Mode.');
}

// @route   POST api/orders
// @desc    Create a new order (Checkout)
// @access  Public/Private
router.post('/', async (req, res) => {
  const { userId, customerInfo, items, totalAmount, paymentMethod } = req.body;

  if (!customerInfo || !items || !items.length || !totalAmount || !paymentMethod) {
    return res.status(400).json({ msg: 'Please provide all checkout details' });
  }

  try {
    // 1. Create the order object in DB (marked as pending payment if Razorpay)
    const paymentStatus = paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending';
    const orderStatus = 'received';

    const orderData = {
      user: userId || null,
      customerInfo,
      items,
      totalAmount: Number(totalAmount),
      paymentMethod,
      paymentStatus,
      orderStatus,
      paymentId: ''
    };

    const createdOrder = await dbHelper.create('orders', orderData);

    // 2. If Razorpay, create Razorpay Order
    if (paymentMethod === 'razorpay' && razorpay) {
      const options = {
        amount: Math.round(Number(totalAmount) * 100), // in paisa
        currency: 'INR',
        receipt: `receipt_${createdOrder._id || createdOrder.id}`
      };

      razorpay.orders.create(options, async (err, rzOrder) => {
        if (err) {
          console.error('Razorpay Order creation failed:', err);
          return res.status(500).json({ msg: 'Razorpay order creation failed, please try Demo Mode.' });
        }
        
        // Save razorpay order id in paymentId
        await dbHelper.findByIdAndUpdate('orders', createdOrder._id || createdOrder.id, {
          paymentId: rzOrder.id
        });

        return res.json({
          success: true,
          orderId: createdOrder._id || createdOrder.id,
          razorpayOrderId: rzOrder.id,
          keyId: RAZORPAY_KEY_ID,
          totalAmount: totalAmount,
          isDemo: false
        });
      });
    } else {
      // Demo Mode or Cash on Delivery, or Razorpay Fallback Simulation
      const updatedOrder = await dbHelper.findByIdAndUpdate('orders', createdOrder._id || createdOrder.id, {
        paymentId: paymentMethod === 'razorpay' ? `sim_pay_${Math.random().toString(36).substr(2, 9)}` : '',
        paymentStatus: paymentMethod === 'demo_mode' ? 'paid' : 'pending',
        orderStatus: paymentMethod === 'demo_mode' ? 'confirmed' : 'received'
      });

      return res.json({
        success: true,
        orderId: updatedOrder._id || updatedOrder.id,
        isDemo: true,
        totalAmount: totalAmount,
        msg: paymentMethod === 'demo_mode' 
          ? 'Demo payment simulated successfully!' 
          : 'Order placed in Cash on Delivery mode.'
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/orders/verify
// @desc    Verify Razorpay payment signature
// @access  Public
router.post('/verify', async (req, res) => {
  const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

  if (!orderId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
    return res.status(400).json({ msg: 'Verification signatures missing' });
  }

  try {
    const text = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (expectedSignature === razorpaySignature) {
      // Payment matches, update order in DB
      await dbHelper.findByIdAndUpdate('orders', orderId, {
        paymentStatus: 'paid',
        orderStatus: 'confirmed',
        paymentId: razorpayPaymentId
      });

      res.json({ success: true, msg: 'Payment verified successfully!' });
    } else {
      res.status(400).json({ success: false, msg: 'Invalid payment signature' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/orders/verify-demo
// @desc    Verify mock demo payment directly for test flow
// @access  Public
router.post('/verify-demo', async (req, res) => {
  const { orderId, paymentId } = req.body;
  try {
    await dbHelper.findByIdAndUpdate('orders', orderId, {
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      paymentId: paymentId || `demo_pay_${Date.now()}`
    });
    res.json({ success: true, msg: 'Demo payment simulated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/orders
// @desc    Get all orders (Admin only)
// @access  Private/Admin
router.get('/', [auth, admin], async (req, res) => {
  try {
    const orders = await dbHelper.find('orders');
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/orders/user/:userId
// @desc    Get orders for specific user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await dbHelper.find('orders', { user: req.params.userId });
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/orders/:id
// @desc    Get order details by order ID (for Tracking page)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const order = await dbHelper.findById('orders', req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/orders/:id
// @desc    Update order status
// @access  Private/Admin
router.put('/:id', [auth, admin], async (req, res) => {
  const { orderStatus, paymentStatus } = req.body;
  const updateFields = {};

  if (orderStatus !== undefined) updateFields.orderStatus = orderStatus;
  if (paymentStatus !== undefined) updateFields.paymentStatus = paymentStatus;

  try {
    let order = await dbHelper.findById('orders', req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    order = await dbHelper.findByIdAndUpdate('orders', req.params.id, updateFields);
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
