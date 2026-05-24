import {
  createProductSchema,
  addVariantSchema,
  updateProductSchema,
} from "./shop.validation.js";

import {
  getAllProducts,
  getProductByIdentifier,
  createProduct,
  uploadProductImage,
  addProductVariant,
  updateProduct,
  deactivateProduct,
} from "./shop.service.js";

// GET /api/shop/products
export const listProducts = async (req, res, next) => {
  try {
    const { data, pagination } = await getAllProducts(req.query);
    return res.status(200).json({ success: true, pagination, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/shop/products/:identifier  (id or slug)
export const productDetail = async (req, res, next) => {
  try {
    const product = await getProductByIdentifier(req.params.identifier);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }
    return res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// POST /api/shop/admin/products
export const addProduct = async (req, res, next) => {
  try {
    const { error, value } = createProductSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((d) => d.message),
      });
    }
    const product = await createProduct(value);
    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/shop/admin/products/:id/images
export const addProductImage = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Image files are required.",
      });
    }

    const isPrimary = req.body.is_primary === "true";
    const displayOrder = parseInt(req.body.display_order) || 0;

    const uploadedImages = [];

    for (const file of req.files) {
      const image = await uploadProductImage(
        req.params.id,
        file,
        isPrimary,
        displayOrder,
      );

      uploadedImages.push(image);
    }

    return res.status(201).json({
      success: true,
      message: "Images uploaded successfully.",
      data: uploadedImages,
    });
  } catch (err) {
    next(err);
  }
};
// POST /api/shop/admin/products/:id/variants
export const addVariant = async (req, res, next) => {
  try {
    const { error, value } = addVariantSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((d) => d.message),
      });
    }
    const variant = await addProductVariant(req.params.id, value);
    return res.status(201).json({
      success: true,
      message: "Variant added successfully.",
      data: variant,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/shop/admin/products/:id
export const editProduct = async (req, res, next) => {
  try {
    const { error, value } = updateProductSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((d) => d.message),
      });
    }
    const updated = await updateProduct(req.params.id, value);
    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/shop/admin/products/:id
export const removeProduct = async (req, res, next) => {
  try {
    const product = await deactivateProduct(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
      data: product,
    });
  } catch (err) {
    next(err);
  }
};
