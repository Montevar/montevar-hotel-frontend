'use client';

import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Spacer,
  VStack,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const isDashboard = pathname?.startsWith('/dashboard');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isDashboard) {
    // 🧱 Left sticky sidebar for admin dashboard
    return (
      <Box
        as="nav"
        position="fixed"
        left={0}
        top={0}
        bottom={0}
        width="220px"
        bg="gray.800"
        color="white"
        p={6}
        zIndex={100}
      >
        <Heading size="md" mb={6}>
          Admin Dashboard
        </Heading>
        <VStack spacing={4} align="flex-start">
          <Link as={NextLink} href="/dashboard" _hover={{ color: 'teal.300' }}>
            Info Page
          </Link>
          <Link as={NextLink} href="/dashboard/listings" _hover={{ color: 'teal.300' }}>
            Room Listings
          </Link>
        </VStack>
      </Box>
    );
  }

  // 🌍 Default top navbar for public pages
  return (
    <>
      <Box bg="teal.500" p={4} color="white" zIndex={20} position="relative">
        <Flex align="center" flexWrap="wrap">
          <Heading
            size="md"
            flexShrink={0}
            display={{ base: 'none', md: 'block' }}
          >
            Montevar Hotel
          </Heading>

          <Spacer />
          <Flex
            gap={4}
            flexWrap="wrap"
            align="center"
            mt={{ base: 2, md: 0 }}
            justify={{ base: 'center', md: 'flex-end' }}
            width={{ base: '100%', md: 'auto' }}
          >
            <Link as={NextLink} href="/">Home</Link>
            <Link as={NextLink} href="/about">About</Link>
            <Link as={NextLink} href="/booking">Booking</Link>
            <Link as={NextLink} href="#contact">Contact</Link>
            <Button
              as={NextLink}
              href="/booking"
              size="sm"
              colorScheme="orange"
              ml={{ base: 0, md: 2 }}
              mt={{ base: 2, md: 0 }}
              width={{ base: '100%', md: 'auto' }}
            >
              Reserve Now
            </Button>
          </Flex>
        </Flex>
      </Box>

      {scrolled && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          zIndex={50}
          bg="teal.500"
          py={3}
          px={4}
          textAlign="center"
          transition="all 0.3s ease-in-out"
        >
          <Button
            as={NextLink}
            href="/booking"
            width="100%"
            maxW="100%"
            mx="auto"
            colorScheme="whiteAlpha"
            fontSize={{ base: 'md', md: 'lg' }}
            size="lg"
            bg="white"
            color="teal.500"
            _hover={{ bg: 'orange.100' }}
            shadow="md"
            borderRadius="xl"
          >
            Reserve Your Stay at Montevar Hotel
          </Button>
        </Box>
      )}
    </>
  );
}
