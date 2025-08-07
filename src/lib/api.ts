import { getApiBaseUrl } from '@/utils/apiConfig';

const BASE_URL = getApiBaseUrl();

export const getAvailableRooms = async (category: string, start: string, end: string) => {
  const res = await fetch(`${BASE_URL}/api/rooms/available?category=${category}&start=${start}&end=${end}`);
  if (!res.ok) throw new Error("Failed to fetch available rooms");
  return res.json();
};
