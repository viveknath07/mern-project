import express from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist
} from "../controllers/wishlist.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";

const router = express.Router();

// All wishlist routes are protected
router.get("/", isAuthenticated, getWishlist);
router.post("/:productId", isAuthenticated, addToWishlist);
router.delete("/:productId", isAuthenticated, removeFromWishlist);
router.patch("/:productId/toggle", isAuthenticated, toggleWishlist);

export default router;
