import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/auth/UserModel.js";

export const protect = asyncHandler(async (req, res, next) => {
  try {
    // Check if the user is logged in
    const token = req.cookies.token;

    if (!token) {
      // 401 unauthorized
      return res.status(401).json({ message: "Not authorized, please login!" });
    }

    // verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // get user details from the token -- make sure to exclude the password
    const user = await User.findById(decoded.id).select("-password");

    // check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // set the user details in the req object
    req.user = user;
    next();
  } catch (error) {
    // 401 unauthorized
    return res.status(401).json({ message: "Not authorized, token failed!" });
  }
});

export const adminMiddleware = asyncHandler(async (req, res, next) => {
  // check if the user is an admin
  if (req.user && req.user.role === "admin") {
    // Move to the next middleware/controller
    next();
    return;
  }

  // else, 403 Forbidden
  return res.status(403).json({ message: "Only admins allowed!" });
});

export const creatorMiddleware = asyncHandler(async (req, res, next) => {
  // check the role of the user
  if (
    (req.user && req.user.role === "creator") ||
    (req.user && req.user.role === "admin")
  ) {
    // If admin or creator, then move to the next middleware/controller
    next();
    return;
  }
  // If not, 403 Forbidden
  return res.status(403).json({ message: "Only creator allowed!" });
});

export const verifiedMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isVerified) {
    next();
    return;
  }

  return res.status(403).json({ message: "Please verify your email address!" });
});
