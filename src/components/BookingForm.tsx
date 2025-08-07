'use client';

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  useToast,
  Image,
} from '@chakra-ui/react';
import { useState } from 'react';
import axios from 'axios';
import { getApiBaseUrl } from '@/utils/apiConfig';

type Props = {
  room: {
    _id: string;
    name: string;
    category: string;
    price: number;
    photo: string;
  };
  checkIn: string;
  checkOut: string;
};

export default function BookingForm({ room, checkIn, checkOut }: Props) {
  const [guestName, setGuestName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const handleBooking = async () => {
    if (!guestName || !email || !phone) {
      toast({
        title: 'Please fill all fields',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.post(`${getApiBaseUrl()}/api/booking`, {
        roomId: room._id,
        name: guestName,
        email,
        phone,
        checkIn,
        checkOut,
      });

      toast({
        title: 'Booking successful',
        description: 'Redirecting to payment...',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Redirect to Stripe or confirmation page
      window.location.href = response.data.checkoutUrl; // expect Windsurf backend to return this
    } catch (err) {
      toast({
        title: 'Booking failed',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="md"
      p={6}
      maxW="lg"
      bg="white"
    >
      <VStack spacing={4} align="stretch">
        <Image src={room.photo} alt={room.name} borderRadius="md" h="200px" objectFit="cover" />

        <Box>
          <Text fontSize="xl" fontWeight="bold">{room.name}</Text>
          <Text>{room.category}</Text>
          <Text color="teal.600">₦{room.price.toLocaleString()}</Text>
          <Text fontSize="sm" mt={2}>
            {checkIn} to {checkOut}
          </Text>
        </Box>

        <FormControl isRequired>
          <FormLabel>Your Full Name</FormLabel>
          <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Email Address</FormLabel>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Phone Number</FormLabel>
          <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </FormControl>

        <Button
          colorScheme="orange"
          onClick={handleBooking}
          isLoading={submitting}
        >
          Book & Continue to Payment
        </Button>
      </VStack>
    </Box>
  );
}
