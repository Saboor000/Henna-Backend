import Joi from "joi";

const minEventDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const partyBookingSchema = Joi.object({
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

  event_date: Joi.date()
    .custom((value, helpers) => {
      const min = new Date();

      // minimum 1 day ahead
      min.setDate(min.getDate() + 1);

      // reset time to midnight
      min.setHours(0, 0, 0, 0);

      if (value < min) {
        return helpers.error("date.min");
      }

      return value;
    })
    .required()
    .messages({
      "date.min": "Event date must be at least 1 day from today.",
      "any.required": "Event date is required.",
    }),

  location: Joi.string().trim().min(3).max(300).required().messages({
    "any.required": "Event location is required.",
  }),

  number_of_guests: Joi.number().integer().min(1).max(100).required().messages({
    "number.min": "At least 1 guest is required.",
    "number.max": "Maximum 100 guests allowed.",
    "any.required": "Number of guests is required.",
  }),

  preferred_time_slot: Joi.string().trim().required().messages({
    "any.required": "Preferred time slot is required.",
  }),

  event_type: Joi.string()
    .trim()
    .valid("Birthday", "Corporate", "Wedding", "Other")
    .optional(),

  notes: Joi.string().trim().max(500).optional().allow(""),
});
