import { supabase } from "../../../lib/supabase.js";
import { sendBridalBookingEmail, sendBridalConfirmationEmail } from "../../../lib/mailer.js";

export const createBridalBooking = async (data) => {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid booking payload");
  }

  // 1. Save to Supabase
  const { data: booking, error } = await supabase
    .from("bridal_bookings")
    .insert([
      {
        name: data.name,
        email: data.email,
        whatsapp: data.whatsapp,
        booking_date: data.booking_date,
        location: data.location,
        bridesmaids_henna: data.bridesmaids_henna,
        notes: data.notes || null,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  if (!booking) {
    throw new Error("Database did not return the inserted booking");
  }

  // 2. Send email notification (non-blocking — don't fail the request if email fails)
  Promise.all([
    sendBridalBookingEmail(booking),
    sendBridalConfirmationEmail(booking),
  ]).catch((emailError) =>
    console.error(
      "Email notification failed (booking still saved):",
      emailError.message,
    ),
  );
  return booking;
};
