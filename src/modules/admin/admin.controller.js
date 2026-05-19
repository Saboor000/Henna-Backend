import { supabase } from "../../lib/supabase.js";
import { loginSchema } from "./admin.validation.js";

export const adminLogin = async (req, res, next) => {
  try {
    // 1. Validate
    const { error, value } = loginSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((d) => d.message),
      });
    }

    // 2. Sign in with Supabase Auth
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: value.email,
      password: value.password,
    });

    if (authError || !data.user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 3. Check admin role in user metadata
    const role = data.user.user_metadata?.role;
    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not an admin.",
      });
    }

    // 4. Return token
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      access_token: data.session.access_token,
      expires_at: data.session.expires_at,
    });
  } catch (err) {
    next(err);
  }
};
