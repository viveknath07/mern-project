import crypto from "crypto";
import Customer from "../models/customer.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { getRazorpay } from "../config/razorpay.js";

// ─────────────────────────────────────────────────────────────
// POST /orders/create-payment-order
// Validates cart → stock → builds snapshot → creates ShopKart
// pending order → creates Razorpay Order → returns checkout data
// ─────────────────────────────────────────────────────────────
export const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    // ── 1. Validate shipping address fields ──────────────────
    const required = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];
    for (const field of required) {
      if (!shippingAddress?.[field]?.toString().trim()) {
        return res.status(400).json({
          success: false,
          message: `Shipping field "${field}" is required`
        });
      }
    }

    if (!/^\d{10}$/.test(shippingAddress.phone.trim())) {
      return res.status(400).json({ success: false, message: "Phone must be a 10-digit number" });
    }

    if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) {
      return res.status(400).json({ success: false, message: "Pincode must be exactly 6 digits" });
    }

    // ── 2. Load cart ─────────────────────────────────────────
    const customer = await Customer.findById(req.user._id).populate({
      path: "cart.product",
      select: "name price stock image"
    });

    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({ success: false, message: "Your cart is empty" });
    }

    // ── 3. Reload latest Product data + validate stock ───────
    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of customer.cart) {
      // Reload from DB so we get absolute latest price & stock
      const product = await Product.findById(cartItem.product._id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product "${cartItem.product.name}" is no longer available`
        });
      }

      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${cartItem.quantity}`
        });
      }

      // Build snapshot — price is locked at this moment in time
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,      // Snapshot — NOT a live reference
        quantity: cartItem.quantity,
        image: product.image
      });

      // Server calculates total — frontend-sent totalAmount is ignored
      totalAmount += product.price * cartItem.quantity;
    }

    // ── 4. Create ShopKart pending order ─────────────────────
    const shopKartOrder = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      totalAmount,
      status: "PENDING_PAYMENT",
      paymentStatus: "PENDING"
    });

    // ── 5. Create Razorpay order (amount in paise) ───────────
    let razorpayOrder;
    try {
      const razorpay = getRazorpay();
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100), // INR → paise
        currency: "INR",
        receipt: shopKartOrder._id.toString()
      });
    } catch (rzpErr) {
      await Order.findByIdAndDelete(shopKartOrder._id);
      return res.status(500).json({
        success: false,
        message: rzpErr.message.includes("not configured")
          ? rzpErr.message
          : "Payment gateway error. Please try again."
      });
    }

    // ── 6. Persist Razorpay order ID to ShopKart order ───────
    shopKartOrder.razorpayOrderId = razorpayOrder.id;
    await shopKartOrder.save();

    // ── 7. Return safe checkout data (Key Secret NOT included) ─
    return res.status(200).json({
      success: true,
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,   // paise
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID  // Key ID only — never the secret
    });
  } catch (error) {
    console.error("createPaymentOrder error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /orders/verify-payment
// Verifies HMAC-SHA256 signature → marks order PAID/PLACED
// → clears cart ONLY after successful verification
// ─────────────────────────────────────────────────────────────
export const verifyPayment = async (req, res) => {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // ── 1. Load the ShopKart order and check ownership ───────
    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // ── 2. Verify HMAC-SHA256 signature ──────────────────────
    // Use the Razorpay Order ID from OUR database — not the one sent by the client
    const body = order.razorpayOrderId + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Signature mismatch → possible tampering
      order.paymentStatus = "FAILED";
      await order.save();
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // ── 3. Mark order as paid (only after verified signature) ─
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // ── 4. Clear cart ONLY after verified payment ─────────────
    await Customer.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });

    return res.status(200).json({
      success: true,
      message: "Payment verified. Order placed successfully.",
      order
    });
  } catch (error) {
    console.error("verifyPayment error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /orders — Get all orders for the authenticated user
// ─────────────────────────────────────────────────────────────
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 }) // Newest first
      .select("_id items totalAmount status paymentStatus createdAt shippingAddress razorpayOrderId");

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /orders/:id — Get a single order (user must own it)
// ─────────────────────────────────────────────────────────────
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Ownership check — a user can never read another user's order by ID
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// ─────────────────────────────────────────────────────────────
// BONUS: PATCH /orders/:id/status — Update order status (admin/dev)
// ─────────────────────────────────────────────────────────────
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowed.join(", ")}`
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
