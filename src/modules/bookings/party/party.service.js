import { supabase } from "../../../lib/supabase.js";
import { sendPartyBookingEmail, sendPartyConfirmationEmail } from "../../../lib/mailer.js";

export const createPartyBooking = async (data) => {
  // 1. Save to Supabase
  const { data: booking, error } = await supabase
    .from("party_bookings")
    .insert([
      {
        name: data.name,
        email: data.email,
        whatsapp: data.whatsapp,
        event_date: data.event_date,
        location: data.location,
        number_of_guests: data.number_of_guests,
        preferred_time_slot: data.preferred_time_slot,
        event_type: data.event_type || null,
        notes: data.notes || null,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  // 2. Send email — non blocking, booking is already saved
  Promise.all([
    sendPartyBookingEmail(booking),
    sendPartyConfirmationEmail(booking),
  ]).catch((emailError) =>
    console.error(
      "Email notification failed (booking still saved):",
      emailError.message,
    ),
  );

  return booking;
};
