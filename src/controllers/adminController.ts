import { Request, Response } from "express";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../model/Admin";

// Login
export const login = async (req: Request, res: Response) => {
    let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  // Force lowercase + trim
  email = email.trim().toLowerCase();

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );

    res.status(200).json({ success: true, token, message: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Signup
export const signup = async (req: Request, res: Response) => {
    const { email, password } = req.body;
  
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
  
  try {
            // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: { $regex: `^${email.trim()}$`, $options: "i" } });
        if (existingAdmin) {
        return res.status(400).json({ error: "Admin already exists" });
        }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = new Admin({ email, password: hashedPassword });
    await newAdmin.save();

    // Generate token
    const token = jwt.sign(
      { id: newAdmin._id, email: newAdmin.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );

    res.status(201).json({ success: true, token });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// Verify
export const verifyAdmin = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: req.user });
};

