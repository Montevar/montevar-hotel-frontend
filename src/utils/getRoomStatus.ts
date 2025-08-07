// src/utils/getRoomStatus.ts
import { Booking } from "@/types";



export function getRoomStatus(
  roomNumber: number,
  roomName: string,
  bookings: Booking[]
) {
  const now = new Date();

  for (const booking of bookings) {
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    end.setHours(12, 0, 0, 0); // end date expiry is 12 noon

    const match =
      booking.roomNumber === roomNumber && booking.roomName === roomName;

    if (match && now >= start && now <= end) {
      return booking.status === "reserved" ? "Reserved" : "Booked";
    }
  }

  return "Available";
}
