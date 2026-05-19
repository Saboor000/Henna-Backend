import { bridalBookingSchema } from "./bridal.validation.js";
import { createBridalBooking } from "./bridal.service.js";

export const submitBridalBooking = async (req, res, next) => {
  try {
    // 1. Validate
    const { error, value } = bridalBookingSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((d) => d.message),
      });
    }

    // 2. Process
    const booking = await createBridalBooking(value);

    // 3. Respond
    return res.status(201).json({
      success: true,
      message:
        "Your bridal booking has been received! We will contact you via WhatsApp to confirm your 50% deposit and finalise your appointment.",
      booking_id: booking.id,
    });
  } catch (err) {
    next(err); // passes to global error handler
  }
};
