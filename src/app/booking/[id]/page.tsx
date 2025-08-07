// src/app/booking/[id]/page.tsx

import { notFound } from 'next/navigation';
import { Box } from '@chakra-ui/react';
import axios from 'axios';
import BookingPageClient from './BookingPageClient';

// Helper function for server-side API calls
const getServerApiBaseUrl = () => {
  return process.env.NODE_ENV === 'production' 
    ? 'https://montevar-hotel-server.onrender.com'
    : 'http://localhost:3001';
};

export default async function RoomBookingPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  let room = null;
  try {
    const res = await axios.get(`${getServerApiBaseUrl()}/api/rooms/${id}`);
    room = res.data;
  } catch (error) {
    notFound();
  }

  if (!room) {
    notFound();
  }

  return (
    <Box p={10} maxW="3xl" mx="auto">
      <BookingPageClient room={room} />
    </Box>
  );
}
