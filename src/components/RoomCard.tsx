'use client';

import { Box, Button, Image, Text, Badge, VStack } from '@chakra-ui/react';
import { Room } from '@/types/room';

type Props = {
  room: Room;
  onSelect: (room: Room) => void;
};

export default function RoomCard({ room, onSelect }: Props) {
  return (
    <Box
      borderWidth="1px"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="md"
      p={4}
      bg="white"
      maxW="sm"
      w="full"
    >
      <Image
        src={room.images[0]}
        alt={room.name}
        borderRadius="md"
        mb={3}
        objectFit="cover"
        w="100%"
        h="160px"
      />
      <VStack align="start" spacing={1}>
        <Text fontSize="xl" fontWeight="bold">
          {room.name}
        </Text>
        <Badge colorScheme="teal">{room.category}</Badge>
        <Text color="gray.600">₦{room.price.toLocaleString()}</Text>
        <Text fontSize="sm" color={room.isBooked ? 'red.500' : 'green.500'}>
          {room.isBooked ? 'Booked' : 'Available'}
        </Text>
        <Button
          colorScheme="orange"
          size="sm"
          isDisabled={room.isBooked}
          onClick={() => onSelect(room)}
          mt={2}
          w="full"
        >
          {room.isBooked ? 'Unavailable' : 'Book This Room'}
        </Button>
      </VStack>
    </Box>
  );
}

