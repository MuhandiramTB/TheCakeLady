import { formatDate, formatTime } from './formatDate.js';

/**
 * Clean a phone number for wa.me — digits only, no +, no spaces, no dashes.
 * wa.me requires international format (country code + number) without +.
 * For Sri Lankan numbers: if it starts with "0" (local format) and has 10 digits,
 * drop the 0 and prepend 94.
 */
function cleanPhone(phone) {
  if (!phone) return '';
  let digits = String(phone).replace(/[^0-9]/g, '');
  // 10-digit number starting with 0 (e.g. 0771234567) → assume SL local → 94771234567
  if (digits.length === 10 && digits.startsWith('0')) {
    digits = '94' + digits.slice(1);
  }
  return digits;
}

/**
 * Build a wa.me link with a pre-filled message.
 * Returns '' if phone is missing/invalid.
 * Valid: 11-13 digits total (country code + local number).
 */
export function buildWhatsAppLink(phone, message) {
  const clean = cleanPhone(phone);
  if (!clean || clean.length < 10 || clean.length > 15) return '';
  const encoded = encodeURIComponent(message || '');
  return `https://wa.me/${clean}?text=${encoded}`;
}

/**
 * Message templates (keep friendly, short, salon-appropriate)
 */
export const waTemplates = {
  // Admin → Customer: booking confirmed
  confirm: ({ customerName, serviceName, bookingDate, startTime, endTime, price, salonName, appUrl }) =>
    `Hi ${customerName} 👋\n\n` +
    `Your booking at *${salonName}* is *CONFIRMED*! ✅\n\n` +
    `📋 *${serviceName}*\n` +
    `📅 ${formatDate(bookingDate)}\n` +
    `⏰ ${formatTime(startTime)} – ${formatTime(endTime)}\n` +
    `💰 Rs. ${price}\n\n` +
    `See you then! Reply here if you need anything.` +
    (appUrl ? `\n\n🔗 View your booking: ${appUrl}/my-bookings` : ''),

  // Admin → Customer: booking cancelled
  cancel: ({ customerName, serviceName, bookingDate, startTime, salonName, appUrl }) =>
    `Hi ${customerName},\n\n` +
    `Your booking at *${salonName}* has been cancelled:\n\n` +
    `📋 ${serviceName}\n` +
    `📅 ${formatDate(bookingDate)} at ${formatTime(startTime)}\n\n` +
    `Please contact us to rebook. Sorry for the inconvenience.` +
    (appUrl ? `\n\n🔗 Book again: ${appUrl}/services` : ''),

  // Admin → Customer: booking completed (thank-you / review ask)
  complete: ({ customerName, serviceName, salonName, appUrl }) =>
    `Hi ${customerName} 🙏\n\n` +
    `Thank you for visiting *${salonName}*! We hope you enjoyed your *${serviceName}*.\n\n` +
    `We'd love to see you again soon!` +
    (appUrl ? `\n\n🔗 Book your next visit: ${appUrl}/services` : ''),

  // Admin → Customer: general follow-up / reminder
  reminder: ({ customerName, serviceName, bookingDate, startTime, salonName, appUrl }) =>
    `Hi ${customerName},\n\n` +
    `Reminder: you have a booking at *${salonName}*:\n\n` +
    `📋 ${serviceName}\n` +
    `📅 ${formatDate(bookingDate)} at ${formatTime(startTime)}\n\n` +
    `See you soon!` +
    (appUrl ? `\n\n🔗 View booking: ${appUrl}/my-bookings` : ''),

  // Customer → Salon: I just booked (primary flow on booking confirm)
  customerToSalon: ({ customerName, customerPhone, customerEmail, serviceName, bookingDate, startTime, endTime, price, salonName, appUrl }) =>
    `🔔 *NEW BOOKING* 🔔\n` +
    (salonName ? `_${salonName}_\n\n` : '\n') +
    `*Customer Details*\n` +
    `👤 ${customerName}\n` +
    `📞 ${customerPhone || '—'}\n` +
    (customerEmail ? `📧 ${customerEmail}\n` : '') +
    `\n*Booking Details*\n` +
    `📋 ${serviceName}\n` +
    `📅 ${formatDate(bookingDate)}\n` +
    `⏰ ${formatTime(startTime)} – ${formatTime(endTime)}\n` +
    (price ? `💰 Rs. ${price}\n` : '') +
    `\nPlease confirm when ready. Thanks! 🙏` +
    (appUrl ? `\n\n🔗 Open admin panel:\n${appUrl}/admin/bookings` : ''),
};

/**
 * Open a WhatsApp chat in a new tab/window.
 */
export function openWhatsApp(phone, message) {
  const link = buildWhatsAppLink(phone, message);
  if (!link) return false;
  window.open(link, '_blank', 'noopener,noreferrer');
  return true;
}
