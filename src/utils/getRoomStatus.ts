// src/utils/getRoomStatus.ts
import { Booking } from "@/types";

// Status of a room right now, based on the admin bookings list.
// Room names are unique, so bookings are matched by name.
export function getRoomStatus(roomName: string, bookings: Booking[]) {
  const now = new Date();

  for (const booking of bookings) {
    if (booking.roomName !== roomName || booking.isCancelled) continue;

    const start = new Date(booking.startDate);
    start.setHours(0, 0, 0, 0); // treat the whole check-in day as taken (walk-ins arrive before 2 PM)
    const end = new Date(booking.endDate); // already set to 12:00 noon check-out by the server

    if (now >= start && now <= end) {
      return booking.isPaid ? "Booked" : "Reserved";
    }
  }

  return "Available";
}
