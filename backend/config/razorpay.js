import Razorpay from "razorpay";

let _instance = null;

// Lazily create the Razorpay instance the first time it is needed.
// This prevents a startup crash when placeholder keys are still in .env.
export const getRazorpay = () => {
  if (!_instance) {
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes("REPLACE")) {
      throw new Error(
        "Razorpay keys are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file."
      );
    }
    _instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return _instance;
};

export default getRazorpay;
