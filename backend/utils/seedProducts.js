import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/product.model.js";

dotenv.config();

const products = [
  {
    name: "Noise Cancelling Headphones",
    description: "Wireless over-ear headphones with active noise cancellation and 30 hour battery life.",
    price: 4999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    stock: 25
  },
  {
    name: "Mechanical Keyboard",
    description: "RGB mechanical keyboard with blue switches and aluminium frame.",
    price: 2999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600",
    stock: 10
  },
  {
    name: "Smartphone Pro Max",
    description: "Flagship smartphone with 120Hz AMOLED display and triple camera setup.",
    price: 69999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600",
    stock: 8
  },
  {
    name: "Cotton Casual Shirt",
    description: "Breathable pure cotton casual shirt, perfect for everyday wear.",
    price: 1299,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
    stock: 40
  },
  {
    name: "Running Shoes",
    description: "Lightweight running shoes with cushioned sole for daily jogging.",
    price: 2499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    stock: 0
  },
  {
    name: "The Alchemist",
    description: "A bestselling novel by Paulo Coelho about following your dreams.",
    price: 349,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600",
    stock: 60
  },
  {
    name: "Atomic Habits",
    description: "A practical guide to building good habits and breaking bad ones.",
    price: 499,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600",
    stock: 35
  },
  {
    name: "Ceramic Coffee Mug",
    description: "Handcrafted 350ml ceramic mug with a matte finish.",
    price: 399,
    category: "Home",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600",
    stock: 80
  },
  {
    name: "Table Lamp",
    description: "Minimal wooden table lamp with warm LED lighting.",
    price: 1499,
    category: "Home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600",
    stock: 15
  },
  {
    name: "Wireless Phone Charger",
    description: "Fast 15W wireless charging pad compatible with all Qi devices.",
    price: 1099,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600",
    stock: 30
  }
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    await Product.deleteMany({});
    const created = await Product.insertMany(products);
    console.log(`Seeded ${created.length} products`);
  } catch (error) {
    console.log("Seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedProducts();
