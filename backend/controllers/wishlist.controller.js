import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /wishlist/:productId — Add product to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const customer = await Customer.findById(req.user._id);

    // Duplicate prevention — 409 Conflict
    const alreadySaved = customer.wishlist.some(
      (id) => id.toString() === productId
    );
    if (alreadySaved) {
      return res.status(409).json({ success: false, message: "Product already in wishlist" });
    }

    customer.wishlist.push(productId);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// GET /wishlist — Get current user's wishlist with populated product data
export const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: "wishlist",
      select: "name price category image stock description"
    });

    return res.status(200).json({
      success: true,
      count: customer.wishlist.length,
      wishlist: customer.wishlist
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// DELETE /wishlist/:productId — Remove product from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const customer = await Customer.findById(req.user._id);

    const index = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    if (index === -1) {
      return res.status(404).json({ success: false, message: "Product not in wishlist" });
    }

    customer.wishlist.splice(index, 1);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// PATCH /wishlist/:productId/toggle — Bonus: toggle wishlist state
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const customer = await Customer.findById(req.user._id);

    const index = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    let saved;
    if (index === -1) {
      // Not saved → add
      customer.wishlist.push(productId);
      saved = true;
    } else {
      // Already saved → remove
      customer.wishlist.splice(index, 1);
      saved = false;
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      saved,
      message: saved ? "Product added to wishlist" : "Product removed from wishlist"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
