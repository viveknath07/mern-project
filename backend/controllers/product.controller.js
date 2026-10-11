import mongoose from "mongoose";
import Product from "../models/product.model.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /products
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    if (!name || !description || !category || !image) {
      return res.status(400).json({
        success: false,
        message: "name, description, category and image are required"
      });
    }

    if (typeof price !== "number" || isNaN(price) || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a number greater than 0"
      });
    }

    if (typeof stock !== "number" || isNaN(stock) || stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a number of at least 0"
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }

    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// GET /products?search=&category=&sort=
export const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    const filter = {};

    if (search && search.trim()) {
      filter.name = { $regex: search.trim(), $options: "i" };
    }

    if (category && category.trim() && category.trim() !== "All") {
      filter.category = category.trim();
    }

    let query = Product.find(filter);

    if (sort === "price_asc") {
      query = query.sort({ price: 1 });
    } else if (sort === "price_desc") {
      query = query.sort({ price: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const products = await query;

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// GET /products/:id
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
