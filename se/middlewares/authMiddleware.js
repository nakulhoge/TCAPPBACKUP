const jwt = require("jsonwebtoken");
const User = require("../models/Users");

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized, Token not provided" });
  }

  // Remove the "Bearer " prefix and trim the token
  const jwtToken = token.replace("Bearer", "").trim();
 
  try {
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);
    const userData = await User.findById(decoded.userId)
      .select("-password")
      .populate("roles", "role");
 

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = userData;
    req.token = token;
    req.userID = userData._id;

    next(); 
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ message: "Unauthorized, Invalid token" });
  }
};

module.exports = authMiddleware;
