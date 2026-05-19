import { partyBookingSchema } from "./party.validation.js";
import { createPartyBooking } from "./party.service.js";

export const submitPartyBooking = async (req, res, next) => {
  try {
    // 1. Validate
    const { error, value } = partyBookingSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((d) => d.message),
      });
    }

    // 2. Process
    const booking = await createPartyBooking(value);

    // 3. Respond
    return res.status(201).json({
      success: true,
      message:
        "Your party booking has been received! Our team will contact you via WhatsApp to confirm pricing and your 50% deposit.",
      booking_id: booking.id,
    });
  } catch (err) {
    next(err);
  }
};
