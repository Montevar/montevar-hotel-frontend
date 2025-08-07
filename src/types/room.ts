export type Room = {
  _id: string;         // ✅ Add this line
  name: string;
  category: string;
  price: number;
  photo: string;
  isBooked?: boolean;  // optional depending on use
};
