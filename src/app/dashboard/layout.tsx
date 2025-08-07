'use client';

import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  Flex,
  Heading,
  IconButton,
  Link,
  Text,
  VStack,
  useDisclosure,
  Input,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';
import { getApiBaseUrl } from '@/utils/apiConfig';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/auth/check-session`, {
          credentials: 'include',
        });
        const data = await res.json();
        setIsAuthenticated(data.authenticated === true);
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  if (checkingSession) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Text>Loading...</Text>
      </Flex>
    );
  }

  if (!isAuthenticated) {
    return <TOTPLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  return <DashboardLayout onLogout={() => setIsAuthenticated(false)}>{children}</DashboardLayout>;
}

function DashboardLayout({
  children,
  onLogout,
}: {
  children: React.ReactNode;
  onLogout: () => void;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLogout = () => {
    fetch(`${getApiBaseUrl()}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).then(() => {
      onLogout();
      window.location.href = '/dashboard';
    });
  };

  return (
    <Flex minH="100vh" direction="column" bg="gray.100">
      {/* Mobile Top Bar */}
      <Flex
        display={{ base: 'flex', md: 'none' }}
        justify="space-between"
        align="center"
        p={4}
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.300"
      >
        <IconButton
          icon={<HamburgerIcon />}
          aria-label="Open menu"
          onClick={onOpen}
        />
        <Button colorScheme="red" onClick={handleLogout}>
          Logout
        </Button>
      </Flex>

      {/* Desktop layout */}
      <Flex flex="1" direction="row">
        {/* Sidebar for desktop */}
        <Box
          as="nav"
          position={{ base: 'static', md: 'fixed' }}
          top="0"
          left="0"
          h="100vh"
          w="220px"
          display={{ base: 'none', md: 'block' }}
          bg="gray.200"
          p={6}
        >
          <Heading size="md" mb={8}>
            Admin Dashboard
          </Heading>
          <VStack align="start" spacing={4}>
            <Link as={NextLink} href="/dashboard" fontWeight="bold" _hover={{ textDecoration: 'underline', color: 'teal.400' }}>
              Info Page
            </Link>
            <Link as={NextLink} href="/dashboard/listings" fontWeight="bold" _hover={{ textDecoration: 'underline', color: 'teal.400' }}>
              Room Listings
            </Link>
          </VStack>
        </Box>

        {/* Mobile Drawer */}
        <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerHeader borderBottomWidth="1px">Admin Dashboard</DrawerHeader>
            <DrawerBody>
              <VStack align="start" spacing={4}>
                <Link as={NextLink} href="/dashboard" onClick={onClose}>
                  Info Page
                </Link>
                <Link as={NextLink} href="/dashboard/listings" onClick={onClose}>
                  Room Listings
                </Link>
                <Button colorScheme="red" onClick={handleLogout}>
                  Logout
                </Button>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Main Content Area */}
        <Box
          ml={{ base: 0, md: '220px' }}
          w="100%"
          p={4}
        >
          {/* Top bar for desktop */}
          <Flex
            display={{ base: 'none', md: 'flex' }}
            justify="flex-end"
            align="center"
            p={4}
            borderBottom="1px solid"
            borderColor="gray.300"
            bg="white"
          >
            <Button colorScheme="red" onClick={handleLogout}>
              Logout
            </Button>
          </Flex>

          <Box p={6}>
            {children}
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
}

function TOTPLogin({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const verifyCode = async () => {
    setError('');

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/verify-totp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.message || 'Invalid code');
      }
    } catch (err) {
      setError('Network error, please try again.');
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50" p={4}>
      <Box
        p={6}
        maxW="400px"
        borderRadius="md"
        boxShadow="md"
        bg="white"
        w="100%"
      >
        <Heading mb={4} size="lg" textAlign="center">
          Admin Login
        </Heading>
        <Text mb={4}>Enter your 6-digit authentication code:</Text>

        <Input
          placeholder="123456"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          mb={3}
          size="lg"
          type="text"
          inputMode="numeric"
        />

        {error && (
          <Text color="red.500" mb={3}>
            {error}
          </Text>
        )}

        <Button colorScheme="teal" onClick={verifyCode} w="100%">
          Verify
        </Button>
      </Box>
    </Flex>
  );
}
