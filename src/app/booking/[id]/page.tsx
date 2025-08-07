// app/booking/[id]/page.tsx
import BookingPageClient from './BookingPageClient';
import { notFound } from 'next/navigation';
import axios from 'axios';
import { Box } from '@chakra-ui/react';

type BookingPageProps = {
  params: { id: string };
};

export default async function RoomBookingPage({ params }: BookingPageProps) {
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
