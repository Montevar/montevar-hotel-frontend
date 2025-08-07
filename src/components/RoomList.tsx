'use client';

import { Box, Grid, Text } from '@chakra-ui/react';
import RoomCard from './RoomCard';
import { useEffect, useState } from 'react';
import { Room } from '@/types/room'; // import from centralized type

interface RoomListProps {
  category: string;
  onSelectRoom: (room: Room) => void; // receive callback prop
}

// Mock rooms data
const mockRooms: Room[] = [
  { _id: '1', name: 'Room Canada', category: 'Standard', price: 30000, photo: '/images/canada.jpeg', isBooked: false },
  { _id: '2', name: 'Room Italy', category: 'Standard', price: 30000, photo: '/images/italy.jpeg', isBooked: true },
  { _id: '3', name: 'Room USA', category: 'Executive', price: 40000, photo: '/images/usa.jpeg', isBooked: false },
  { _id: '4', name: 'Room Paris', category: 'Classic Executive', price: 50000, photo: '/images/paris.jpeg', isBooked: false },
  // Add all 21 rooms later
];

export default function RoomList({ category, onSelectRoom }: RoomListProps) {
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);

  useEffect(() => {
    const match = mockRooms.filter((room) => room.category === category);
    setFilteredRooms(match);
  }, [category]);

  return (
    <Box>
      {filteredRooms.length === 0 ? (
        <Text>No rooms available in this category.</Text>
      ) : (
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
          {filteredRooms.map((room) => (
            <RoomCard key={room._id} room={room} onSelect={onSelectRoom} />
          ))}
        </Grid>
      )}
    </Box>
  );
}

