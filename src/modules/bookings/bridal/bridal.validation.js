import Joi from "joi";
// booking date must be a future date at least 3 days from today
const minBookingDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const bridalBookingSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.min": "Full name must be at least 2 characters.",
    "any.required": "Full name is required.",
  }),

  email: Joi.string().trim().email().required().messages({
    "string.email": "Please provide a valid email address.",
    "any.required": "Email is required.",
  }),

  whatsapp: Joi.string()
    .pattern(/^\+[1-9]\d{7,14}$/)
    .required()
    .messages({
      "string.pattern.base":
        "WhatsApp number must include country code, e.g. +923001234567.",
      "any.required": "WhatsApp number is required.",
    }),

  booking_date: Joi.date()
    .custom((value, helpers) => {
      const min = new Date();
      min.setDate(min.getDate() + 3);
      min.setHours(0, 0, 0, 0);
      if (value < min) {
        return helpers.error("date.min");
      }
      return value;
    })
    .required()
    .messages({
      "date.min": "Booking date must be at least 3 days from today.",
      "any.required": "Booking date is required.",
    }),

  location: Joi.string().trim().min(3).max(300).required().messages({
    "any.required": "Event location is required.",
  }),

  bridesmaids_henna: Joi.boolean().required().messages({
    "any.required": "Please indicate if bridesmaids henna is needed.",
  }),

  notes: Joi.string().trim().max(500).optional().allow(""),
});
