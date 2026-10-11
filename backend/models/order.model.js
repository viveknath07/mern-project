import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // Reference to the purchasing customer
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },

    // Snapshot of each item at purchase time.
    // Stored independently so later Product changes don't alter order history.
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        name: { type: String, required: true },   // Snapshot: product name at purchase time
        price: { type: Number, required: true },  // Snapshot: product price at purchase time
        quantity: { type: Number, required: true },
        image: { type: String }
      }
    ],

    // Shipping details captured at checkout
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true }
    },

    // Server-calculated total; never trusted from the client
    totalAmount: { type: Number, required: true },

    // Payment lifecycle
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING"
    },

    // Order lifecycle
    status: {
      type: String,
      enum: ["PENDING_PAYMENT", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"],
      default: "PENDING_PAYMENT"
    },

    // Razorpay identifiers (never the secret)
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String }
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
