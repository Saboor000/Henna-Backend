import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── Artist Notification Emails ───────────────────────────────────────────────

export const sendBridalBookingEmail = async (booking) => {
  const html = `
    <h2>New Bridal Booking Received</h2>
    <table cellpadding="8" style="border-collapse:collapse; width:100%;">
      <tr><td><strong>Name</strong></td><td>${booking.name}</td></tr>
      <tr><td><strong>Email</strong></td><td>${booking.email}</td></tr>
      <tr><td><strong>WhatsApp</strong></td><td>${booking.whatsapp}</td></tr>
      <tr><td><strong>Booking Date</strong></td><td>${booking.booking_date}</td></tr>
      <tr><td><strong>Location</strong></td><td>${booking.location}</td></tr>
      <tr><td><strong>Bridesmaids Henna</strong></td><td>${booking.bridesmaids_henna ? "Yes" : "No"}</td></tr>
      <tr><td><strong>Notes</strong></td><td>${booking.notes || "—"}</td></tr>
      <tr><td><strong>Submitted At</strong></td><td>${new Date(booking.created_at).toLocaleString()}</td></tr>
    </table>
  `;

  await transporter.sendMail({
    from: `"Henna Bookings" <${process.env.EMAIL_USER}>`,
    to: process.env.ARTIST_EMAIL,
    subject: `New Bridal Booking — ${booking.name} on ${booking.booking_date}`,
    html,
  });
};

export const sendPartyBookingEmail = async (booking) => {
  const html = `
    <h2>New Party / Event Booking Received</h2>
    <table cellpadding="8" style="border-collapse:collapse; width:100%;">
      <tr><td><strong>Name</strong></td><td>${booking.name}</td></tr>
      <tr><td><strong>Email</strong></td><td>${booking.email}</td></tr>
      <tr><td><strong>WhatsApp</strong></td><td>${booking.whatsapp}</td></tr>
      <tr><td><strong>Event Date</strong></td><td>${booking.event_date}</td></tr>
      <tr><td><strong>Location</strong></td><td>${booking.location}</td></tr>
      <tr><td><strong>Number of Guests</strong></td><td>${booking.number_of_guests}</td></tr>
      <tr><td><strong>Preferred Time Slot</strong></td><td>${booking.preferred_time_slot}</td></tr>
      <tr><td><strong>Event Type</strong></td><td>${booking.event_type || "—"}</td></tr>
      <tr><td><strong>Notes</strong></td><td>${booking.notes || "—"}</td></tr>
      <tr><td><strong>Submitted At</strong></td><td>${new Date(booking.created_at).toLocaleString()}</td></tr>
    </table>
  `;

  await transporter.sendMail({
    from: `"Henna Bookings" <${process.env.EMAIL_USER}>`,
    to: process.env.ARTIST_EMAIL,
    subject: `New Party Booking — ${booking.name} on ${booking.event_date}`,
    html,
  });
};

export const sendEnrollmentEmail = async (enrollment, classTitle) => {
  const html = `
    <h2>New Class Enrollment Received</h2>
    <table cellpadding="8" style="border-collapse:collapse; width:100%;">
      <tr><td><strong>Name</strong></td><td>${enrollment.name}</td></tr>
      <tr><td><strong>Email</strong></td><td>${enrollment.email}</td></tr>
      <tr><td><strong>WhatsApp</strong></td><td>${enrollment.whatsapp}</td></tr>
      <tr><td><strong>Class Selected</strong></td><td>${classTitle}</td></tr>
      <tr><td><strong>Message</strong></td><td>${enrollment.message || "—"}</td></tr>
      <tr><td><strong>Submitted At</strong></td><td>${new Date(enrollment.created_at).toLocaleString()}</td></tr>
    </table>
  `;

  await transporter.sendMail({
    from: `"Henna Bookings" <${process.env.EMAIL_USER}>`,
    to: process.env.ARTIST_EMAIL,
    subject: `New Class Enrollment — ${enrollment.name} for ${classTitle}`,
    html,
  });
};

// ─── Customer Confirmation Emails ─────────────────────────────────────────────

export const sendBridalConfirmationEmail = async (booking) => {
  const html = `
    <h2>Your email has been sent!</h2>
    <p>Hi <strong>${booking.name}</strong>,</p>
    <p>We've received your message and it's been sent successfully. Our team will review your request and get back to you as soon as possible.</p>
    <p>You can expect to hear from us via WhatsApp on <strong>${booking.whatsapp}</strong> or by email at <strong>${booking.email}</strong>.</p>
    <p>If you don't hear back within 48 hours, feel free to reply to this email and we'll get right on it.</p>
    <p>— The Henna Team</p>
  `;

  await transporter.sendMail({
    from: `"Henna Bookings" <${process.env.EMAIL_USER}>`,
    to: booking.email,
    subject: `We've received your message — we'll be in touch!`,
    html,
  });
};

export const sendPartyConfirmationEmail = async (booking) => {
  const html = `
    <h2>Your email has been sent!</h2>
    <p>Hi <strong>${booking.name}</strong>,</p>
    <p>We've received your message and it's been sent successfully. Our team will look into your request and reach out to you shortly.</p>
    <p>You can expect to hear from us via WhatsApp on <strong>${booking.whatsapp}</strong> or by email at <strong>${booking.email}</strong>.</p>
    <p>If you don't hear back within 48 hours, feel free to reply to this email and we'll get right on it.</p>
    <p>— The Henna Team</p>
  `;

  await transporter.sendMail({
    from: `"Henna Bookings" <${process.env.EMAIL_USER}>`,
    to: booking.email,
    subject: `We've received your message — we'll be in touch!`,
    html,
  });
};

export const sendEnrollmentConfirmationEmail = async (
  enrollment,
  classTitle,
) => {
  const html = `
    <h2>Your email has been sent!</h2>
    <p>Hi <strong>${enrollment.name}</strong>,</p>
    <p>We've received your message and it's been sent successfully. Our team will review your request and get back to you as soon as possible.</p>
    <p>You can expect to hear from us via WhatsApp on <strong>${enrollment.whatsapp}</strong> or by email at <strong>${enrollment.email}</strong>.</p>
    <p>If you don't hear back within 48 hours, feel free to reply to this email and we'll get right on it.</p>
    <p>— The Henna Team</p>
  `;

  await transporter.sendMail({
    from: `"Henna Bookings" <${process.env.EMAIL_USER}>`,
    to: enrollment.email,
    subject: `We've received your message — we'll be in touch!`,
    html,
  });
};

// ─── Verify connection on startup ─────────────────────────────────────────────

transporter.verify((error) => {
  if (error) {
    console.error("Mailer connection failed:", error.message);
  } else {
    console.log("Mailer ready");
  }
});
