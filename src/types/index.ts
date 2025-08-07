// 📁 src/types/index.ts
export interface Room {
  _id: string;
  name: string;
  category: string;
  price: number;
  roomNumber: string;
  images: string[];
}

export interface Booking {
  _id: string;              // MongoDB id, required
  name: string;
  email: string;
  phone?: string;           // make phone optional, some bookings may not have it
  roomId?: string;          // optional if you want
  roomName: string;
  roomNumber?: number;
  roomPrice: number; // ✅ add this
  price?: number;
  startDate: string;        // or Date if you parse it
  endDate: string;
  status: "pending" | "booked" | "reserved" | "cancelled" | "confirmed";
  paymentStatus?: string;
  source: "user" | "dashboard" | string;
  isPaid?: boolean; // 👈 Add this line
  fullName?: string; // 👈 ADD THIS LINE
  isCancelled?: boolean; // ✅ Add this
  // Add any other props you use
}

