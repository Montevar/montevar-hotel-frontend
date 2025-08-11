export type Room = {
  _id: string;         // ✅ Add this line
  name: string;
  category: string;
  price: number;
  images: string[];       // <-- Add this line
  isBooked?: boolean;  // optional depending on use
};
