import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper: populate cart and return the formatted array
const populateCart = async (customerId) => {
  const customer = await Customer.findById(customerId).populate({
    path: "cart.product",
    select: "name price category image stock description"
  });
  return customer.cart;
};

// POST /cart/:productId — Add product (qty 1) or increment if already in cart
export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (product.stock < 1) {
      return res.status(400).json({ success: false, message: "Product is out of stock" });
    }

    const customer = await Customer.findById(req.user._id);

    const existing = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existing) {
      // Already in cart — increment quantity
      const newQty = existing.quantity + 1;
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} unit(s) available. You already have ${existing.quantity} in your cart.`
        });
      }
      existing.quantity = newQty;
    } else {
      // Not in cart — add with quantity 1
      customer.cart.push({ product: productId, quantity: 1 });
    }

    await customer.save();

    const cart = await populateCart(req.user._id);
    return res.status(200).json({ success: true, message: "Cart updated", cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// GET /cart — Get authenticated user's cart with populated product data
export const getCart = async (req, res) => {
  try {
    const cart = await populateCart(req.user._id);
    return res.status(200).json({ success: true, cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// PATCH /cart/:productId — Update quantity for a cart item
export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be a whole number of at least 1" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} unit(s) available`
      });
    }

    const customer = await Customer.findById(req.user._id);

    const item = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ success: false, message: "Product not in cart" });
    }

    item.quantity = quantity;
    await customer.save();

    const cart = await populateCart(req.user._id);
    return res.status(200).json({ success: true, message: "Quantity updated", cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// DELETE /cart/:productId — Remove a product from cart
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const customer = await Customer.findById(req.user._id);

    const index = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (index === -1) {
      return res.status(404).json({ success: false, message: "Product not in cart" });
    }

    customer.cart.splice(index, 1);
    await customer.save();

    const cart = await populateCart(req.user._id);
    return res.status(200).json({ success: true, message: "Product removed from cart", cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
