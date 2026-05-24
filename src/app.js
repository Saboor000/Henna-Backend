import express from "express";
import dotenv from "dotenv";
import { supabase } from "./lib/supabase.js";
import { errorHandler } from "./middleware/errorHandler.js";
import bridalRoutes from "./modules/bookings/bridal/bridal.routes.js";
import partyRoutes from "./modules/bookings/party/party.routes.js";
import classRoutes from "./modules/classes/classes.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import shopRoutes from "./modules/shop/shop.routes.js";
import { corsMiddleware } from "./middleware/cors.js";
dotenv.config();

const app = express();

// parse JSON and urlencoded request bodies
app.use(corsMiddleware); // ← use
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  if (req.originalUrl === "/api/shop/webhook") {
    next(); // raw body handled by express.raw() in checkout.routes.js
  } else {
    express.json()(req, res, next); // all other routes parse JSON normally
  }
});

app.use("/api/admin", adminRoutes);
app.use("/api/bookings", bridalRoutes);
app.use("/api/bookings", partyRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/shop", shopRoutes);

app.get("/", async (req, res) => {
  const { error } = await supabase.auth.getSession();

  if (error) {
    return res.send("Supabase not connected");
  }

  res.send("Supabase connected");
});

const PORT = process.env.PORT || 5000;

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
