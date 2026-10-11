import express from "express";
import { createProduct, getProductById, getProducts } from "../controllers/product.controller.js";

const router = express.Router();

router.post("/", createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);

export default router;
