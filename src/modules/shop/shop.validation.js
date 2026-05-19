import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  short_description: Joi.string().required(),
  price: Joi.number().positive().required(),
  discount_price: Joi.number().positive().less(Joi.ref("price")).optional(), // 👈 must be less than price
  stock: Joi.number().integer().min(0).optional(),
  category: Joi.string().required(),
  is_featured: Joi.boolean().optional(),
  is_active: Joi.boolean().optional(),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  short_description: Joi.string().optional(),
  price: Joi.number().positive().optional(),
  discount_price: Joi.number().positive().less(Joi.ref("price")).optional(),
  stock: Joi.number().integer().min(0).optional(),
  category: Joi.string().optional(),
  is_featured: Joi.boolean().optional(),
  is_active: Joi.boolean().optional(),
});

export const addVariantSchema = Joi.object({
  label: Joi.string().required(),
  value: Joi.string().required(),
  price_modifier: Joi.number().optional(),
});
