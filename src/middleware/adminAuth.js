import { supabase } from "../lib/supabase.js";

export const adminAuth = async (req, res, next) => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Invalid or expired token.",
      });
    }

    // 3. Check admin role
    const role = data.user.user_metadata?.role;
    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden. Admin access only.",
      });
    }

    // 4. Attach user to request
    req.admin = data.user;
    next();
  } catch (err) {
    next(err);
  }
};
