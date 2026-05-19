import { enrollmentSchema, createClassSchema } from "./classes.validation.js";
import {
  getAllClasses,
  getClassById,
  createEnrollment,
  createClass,
} from "./classes.service.js";

// GET /api/classes
export const listClasses = async (req, res, next) => {
  try {
    const { data, pagination } = await getAllClasses(req.query);
    return res.status(200).json({ success: true, pagination, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/classes/:id
export const classDetail = async (req, res, next) => {
  try {
    const classData = await getClassById(req.params.id);

    if (!classData) {
      return res
        .status(404)
        .json({ success: false, message: "Class not found." });
    }

    return res.status(200).json({ success: true, data: classData });
  } catch (err) {
    next(err);
  }
};

// POST /api/classes (admin only)
export const addClass = async (req, res, next) => {
  try {
    const { error, value } = createClassSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((d) => d.message),
      });
    }

    const newClass = await createClass(value);

    return res.status(201).json({
      success: true,
      message: "Class created successfully.",
      data: newClass,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/classes/enroll
export const enrollClass = async (req, res, next) => {
  try {
    // 1. Validate
    const { error, value } = enrollmentSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((d) => d.message),
      });
    }

    // 2. Process
    const enrollment = await createEnrollment(value);

    // 3. Respond
    return res.status(201).json({
      success: true,
      message:
        "You have successfully enrolled! The artist will contact you via WhatsApp with class details and next steps.",
      enrollment_id: enrollment.id,
    });
  } catch (err) {
    next(err);
  }
};
