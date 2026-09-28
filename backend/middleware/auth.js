const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("-passwordHash");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Non-blocking check for routes that are public but show more to the admin
// (e.g. unpublished blog drafts). Resolves to true only for a valid token.
const isAdminRequest = async (req) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return false;
  try {
    const payload = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
    return !!(await User.exists({ _id: payload.sub }));
  } catch {
    return false;
  }
};

module.exports = { protect, isAdminRequest };
