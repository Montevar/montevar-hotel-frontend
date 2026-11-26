'use client';

import { Box, Heading, Link, VStack } from '@chakra-ui/react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import SiteHeader from '@/components/site/SiteHeader';

export default function Navbar() {
  const pathname = usePathname();

  const isDashboard = pathname?.startsWith('/dashboard');
  const isManager = pathname?.startsWith('/manager');

  // Management section has its own header
  if (isManager) return null;

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

  // Guest pages: the Montevar header
  return <SiteHeader />;
}
