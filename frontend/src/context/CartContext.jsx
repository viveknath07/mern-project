import { createContext, useCallback, useContext, useEffect, useReducer } from "react";
import {
  addToCart as apiAdd,
  getCart as apiGet,
  removeFromCart as apiRemove,
  updateCartQuantity as apiUpdate
} from "../services/api.js";
import { useAuth } from "./AuthContext.jsx";

// ─── State shape ────────────────────────────────────────────
// cartItems: [{ product: { _id, name, price, image, stock, ... }, quantity }]
// loading:   bool  — true while initial GET /cart is in flight
// error:     string — non-empty when GET /cart fails
// actionLoading: Set of productId strings currently being mutated
//               (prevents double-clicks on individual items)

const CartContext = createContext();

// ─── Reducer ────────────────────────────────────────────────
const initialState = {
  cartItems: [],
  loading: true,
  error: "",
  actionLoading: new Set()
};

function cartReducer(state, action) {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true, error: "" };
    case "LOAD_SUCCESS":
      return { ...state, loading: false, error: "", cartItems: action.payload };
    case "LOAD_ERROR":
      return { ...state, loading: false, error: action.payload };

    case "ACTION_START": {
      const next = new Set(state.actionLoading);
      next.add(action.payload);
      return { ...state, actionLoading: next };
    }
    case "ACTION_DONE": {
      const next = new Set(state.actionLoading);
      next.delete(action.payload);
      return { ...state, actionLoading: next, cartItems: action.cart };
    }
    case "ACTION_FAIL": {
      const next = new Set(state.actionLoading);
      next.delete(action.payload);
      return { ...state, actionLoading: next };
    }

    case "CLEAR_CART":
      return { ...state, cartItems: [], actionLoading: new Set() };

    case "RESET":
      return { ...initialState, loading: false };


    default:
      return state;
  }
}

// ─── Provider ───────────────────────────────────────────────
export const CartProvider = ({ children }) => {
  const { customer } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // ── Load cart from backend ──────────────────────────────
  const loadCart = useCallback(async () => {
    dispatch({ type: "LOAD_START" });
    try {
      const data = await apiGet();
      dispatch({ type: "LOAD_SUCCESS", payload: data.cart });
    } catch {
      dispatch({ type: "LOAD_ERROR", payload: "Unable to load your cart." });
    }
  }, []);

  // Fetch cart when the user logs in; clear it on logout
  useEffect(() => {
    if (customer) {
      loadCart();
    } else {
      dispatch({ type: "RESET" });
    }
  }, [customer, loadCart]);

  // ── Add to cart ─────────────────────────────────────────
  const addItem = useCallback(async (productId) => {
    dispatch({ type: "ACTION_START", payload: productId });
    try {
      const data = await apiAdd(productId);
      dispatch({ type: "ACTION_DONE", payload: productId, cart: data.cart });
      return { success: true };
    } catch (err) {
      dispatch({ type: "ACTION_FAIL", payload: productId });
      const message = err.response?.data?.message || "Unable to add to cart.";
      return { success: false, message };
    }
  }, []);

  // ── Update quantity ──────────────────────────────────────
  const updateItem = useCallback(async (productId, quantity) => {
    dispatch({ type: "ACTION_START", payload: productId });
    try {
      const data = await apiUpdate(productId, quantity);
      dispatch({ type: "ACTION_DONE", payload: productId, cart: data.cart });
      return { success: true };
    } catch (err) {
      dispatch({ type: "ACTION_FAIL", payload: productId });
      const message = err.response?.data?.message || "Unable to update quantity.";
      return { success: false, message };
    }
  }, []);

  // ── Remove item ──────────────────────────────────────────
  const removeItem = useCallback(async (productId) => {
    dispatch({ type: "ACTION_START", payload: productId });
    try {
      const data = await apiRemove(productId);
      dispatch({ type: "ACTION_DONE", payload: productId, cart: data.cart });
      return { success: true };
    } catch (err) {
      dispatch({ type: "ACTION_FAIL", payload: productId });
      return { success: false };
    }
  }, []);

  // ── Clear cart (called after successful payment verification) ─
  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  // ── Derived values ───────────────────────────────────────
  // totalQuantity: sum of all quantities → used in Navbar badge
  const totalQuantity = state.cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // subtotal: Σ(price × quantity)
  const subtotal = state.cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // isInCart: quick lookup by productId
  const isInCart = useCallback(
    (productId) => state.cartItems.some((item) => item.product._id === productId),
    [state.cartItems]
  );

  const isActionLoading = useCallback(
    (productId) => state.actionLoading.has(productId),
    [state.actionLoading]
  );

  return (
    <CartContext.Provider
      value={{
        cartItems: state.cartItems,
        loading: state.loading,
        error: state.error,
        totalQuantity,
        subtotal,
        isInCart,
        isActionLoading,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        loadCart
      }}
    >
      {children}
    </CartContext.Provider>
  );

};

export const useCart = () => useContext(CartContext);
