import { checkoutSchema } from "./checkout.validation.js";
import {
  createCheckoutSession,
  handleStripeWebhook,
} from "./checkout.service.js";

// POST /api/shop/checkout
export const checkout = async (req, res, next) => {
  try {
    const { error, value } = checkoutSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((d) => d.message),
      });
    }

    const session = await createCheckoutSession(
      value.items,
      value.customerEmail,
    );
    return res.status(200).json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
};

// POST /api/shop/webhook
export const stripeWebhook = async (req, res, next) => {
  console.log("Body is Buffer:", Buffer.isBuffer(req.body)); // must print true
  try {
    const signature = req.headers["stripe-signature"];
    const result = await handleStripeWebhook(req.body, signature);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
