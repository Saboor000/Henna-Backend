// checkout.validation.js
import Joi from "joi";

export const checkoutSchema = Joi.object({
  customerEmail: Joi.string().email().required(),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().uuid().required(),
        variantId: Joi.string().uuid().optional(),
        quantity: Joi.number().integer().min(1).default(1),
      }).options({ stripUnknown: true }), // ✅ drops variants, any other extra fields
    )
    .min(1)
    .required(),
});
