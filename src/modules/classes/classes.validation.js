import Joi from "joi";

export const enrollmentSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.min": "Full name must be at least 2 characters.",
    "any.required": "Full name is required.",
  }),
  email: Joi.string().email().required().messages({
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
  preferred_class_id: Joi.string().uuid().required().messages({
    "string.uuid": "Please select a valid class.",
    "any.required": "Preferred class is required.",
  }),
  message: Joi.string().max(500).optional().allow(""),
});

export const createClassSchema = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    "any.required": "Class title is required.",
  }),
  description: Joi.string().min(10).required().messages({
    "any.required": "Class description is required.",
  }),
  duration: Joi.string().required().messages({
    "any.required": "Duration is required. e.g. '4 weeks' or '2 hours'",
  }),
  skill_level: Joi.string()
    .valid("Beginner", "Intermediate", "Advanced")
    .required()
    .messages({
      "any.only": "Skill level must be Beginner, Intermediate, or Advanced.",
      "any.required": "Skill level is required.",
    }),
  price: Joi.number().positive().required().messages({
    "number.positive": "Price must be a positive number.",
    "any.required": "Price is required.",
  }),
  what_is_included: Joi.string().optional().allow(""),
  schedule: Joi.string().optional().allow(""),
  instructor_bio: Joi.string().optional().allow(""),
  session_link: Joi.string().uri().optional().allow("").messages({
    "string.uri": "Session link must be a valid URL.",
  }),
  is_active: Joi.boolean().optional().default(true),
});
