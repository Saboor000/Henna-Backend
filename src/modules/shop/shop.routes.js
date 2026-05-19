import { Router } from "express";
import multer from "multer";
import { adminAuth } from "../../middleware/adminAuth.js";
import {
  listProducts,
  productDetail,
  addProduct,
  addProductImage,
  addVariant,
  editProduct,
  removeProduct,
} from "./shop.controller.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, and WEBP images are allowed."));
    }
    cb(null, true);
  },
});

// Public
router.get("/products", listProducts);
router.get("/products/:identifier", productDetail); // 👈 id or slug

// Admin
router.post("/admin/products", adminAuth, addProduct);
router.post(
  "/admin/products/:id/images",
  adminAuth,
  upload.single("image"),
  addProductImage,
);
router.post("/admin/products/:id/variants", adminAuth, addVariant);
router.patch("/admin/products/:id", adminAuth, editProduct);
router.delete("/admin/products/:id", adminAuth, removeProduct);

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message?.includes("Only JPEG")) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

export default router;
