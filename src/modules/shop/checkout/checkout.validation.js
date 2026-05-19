import Joi from "joi";

export const checkoutSchema = Joi.object({
  customerEmail: Joi.string().email().required(),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.number().integer().positive().required(),
        variantId: Joi.number().integer().positive().optional(),
        quantity: Joi.number().integer().min(1).default(1),
      }),
    )
    .min(1)
    .required(),
});
