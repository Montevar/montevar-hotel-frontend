const BASE_URL = 'http://localhost:5000/api';

export const getAvailableRooms = async (category: string, start: string, end: string) => {
  const res = await fetch(`${BASE_URL}/rooms/available?category=${category}&start=${start}&end=${end}`);
  if (!res.ok) throw new Error("Failed to fetch available rooms");
  return res.json();
};
