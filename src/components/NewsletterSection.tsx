'use client';

import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const toast = useToast();

  const handleSubscribe = () => {
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid email',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Add your newsletter API logic here

    toast({
      title: 'Subscribed!',
      description: 'Thank you for subscribing.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    setEmail('');
  };

  return (
    <Flex
      direction="column"
      align="center"
      bg="gray.900"
      color="white"
      py={16}
      px={6}
      textAlign="center"
    >
      <Heading mb={4}>Stay Updated</Heading>
      <Text mb={6} fontSize="lg">
        Subscribe to our newsletter for updates on events and exclusive offers.
      </Text>
      <Flex direction={{ base: 'column', md: 'row' }} gap={4} maxW="500px" w="full">
        <Input
          placeholder="Enter your email"
          bg="white"
          color="black"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button colorScheme="teal" px={8} onClick={handleSubscribe}>
          Subscribe
        </Button>
      </Flex>
    </Flex>
  );
}
