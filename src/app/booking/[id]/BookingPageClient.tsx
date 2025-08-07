// app/booking/[id]/BookingPageClient.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { Box, Text, VStack } from '@chakra-ui/react';
import BookingForm from '@/components/BookingForm';
import { Room } from '@/types/room';

export default function BookingPageClient({ room }: { room: Room }) {
  const searchParams = useSearchParams();
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');

  if (!checkIn || !checkOut) {
    return (
      <Box p={10} textAlign="center">
        <Text color="red.500">Invalid booking link or missing dates.</Text>
      </Box>
    );
  }

  return (
    <VStack p={10} spacing={8} align="stretch">
      <BookingForm room={room} checkIn={checkIn} checkOut={checkOut} />
    </VStack>
  );
}
