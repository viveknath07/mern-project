import bcrypt from "bcryptjs";
import Customer from "../models/customer.model.js";
import generateToken from "../utils/generateToken.js";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: false,
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const publicCustomer = (customer) => ({
  _id: customer._id,
  fullName: customer.fullName,
  email: customer.email,
  phone: customer.phone
});

export const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const customerExists = await Customer.findOne({ email });

    if (customerExists) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      fullName,
      email,
      password: hashedPassword,
      phone
    });

    return res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: publicCustomer(customer)
    });
  } catch (error) {
    console.error("[registerCustomer]", error);
    return res.status(500).json({ success: false, message: error.message || "Something went wrong" });
  }
};

export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const customer = await Customer.findOne({ email });

    if (!customer) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const passwordMatched = await bcrypt.compare(password, customer.password);

    if (!passwordMatched) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(customer._id);
    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      customer: publicCustomer(customer)
    });
  } catch (error) {
    console.error("[loginCustomer]", error);
    return res.status(500).json({ success: false, message: error.message || "Something went wrong" });
  }
};

export const getMyProfile = (req, res) => {
  return res.status(200).json(publicCustomer(req.user));
};

export const logoutCustomer = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Both passwords are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    const customer = await Customer.findById(req.user._id);
    const passwordMatched = await bcrypt.compare(oldPassword, customer.password);

    if (!passwordMatched) {
      return res.status(401).json({ success: false, message: "Old password is incorrect" });
    }

    customer.password = await bcrypt.hash(newPassword, 10);
    await customer.save();

    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("[changePassword]", error);
    return res.status(500).json({ success: false, message: error.message || "Something went wrong" });
  }
};
