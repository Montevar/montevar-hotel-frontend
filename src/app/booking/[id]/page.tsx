// src/app/booking/[id]/page.tsx

import { notFound } from 'next/navigation';
import { Box } from '@chakra-ui/react';
import axios from 'axios';
import BookingPageClient from './BookingPageClient';

export default async function RoomBookingPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  let room = null;
  try {
    const res = await axios.get(`${process.env.BACKEND_URL}/api/rooms/${id}`);
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
