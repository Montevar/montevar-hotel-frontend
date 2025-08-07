'use client';

import {
  Box,
  Container,
  Flex,
  HStack,
  Text,
  VStack,
  Link,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  IconButton,
  Divider,
} from '@chakra-ui/react';
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';
import NextLink from 'next/link';

export default function Footer() {
  return (
    <Box bg="gray.100" pt={10} borderTop="1px solid" borderColor="gray.300">
      <Container maxW="6xl">
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align="start"
          gap={{ base: 10, md: 40 }}
        >
          {/* FAQ Section (Left Side) */}
          <Box flex={1}>
            <Text fontWeight="bold" mb={4}>FAQ</Text>
            <Accordion allowToggle>
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">What time is check-in?</Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>Check-in begins at 3:00 PM. Early check-in may be available upon request.</AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">Do you allow pets?</Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>Unfortunately, pets are not allowed at Montevar Hotel, except for service animals.</AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">Is breakfast included?</Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>On special occasions, we serve complimentary breakfast to all registered guests each morning.</AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">Is the pool free to use?</Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  Absolutely! Our serene outdoor pool is free and open to all guests throughout their stay.
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">What is your cancellation policy?</Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  Cancellations made at least 48 hours before check-in are -20%. no refund will be made for Later cancellations.
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Box>

          {/* Navigation Links (Middle) */}
          <Box flex={1}>
            <VStack align="start">
              <Text fontWeight="bold" mb={2}>Explore</Text>
              <Link as={NextLink} href="/">Home</Link>
              <Link as={NextLink} href="/about">About</Link>
              <Link as={NextLink} href="/booking">Booking</Link>
              <Link as={NextLink} href="#contact">Contact</Link>
            </VStack>
          </Box>

          {/* Follow Us Section (Right Side) */}
          <Box flex={1}>
            <Text fontWeight="bold" mb={4}>Follow Us</Text>
            <HStack spacing={6}>
              <Link href="https://www.facebook.com/montevar.hotel" isExternal>
                <IconButton
                  aria-label="Facebook"
                  icon={<FaFacebook size="28px" />}
                  variant="ghost"
                  color="black"
                  _hover={{ bg: 'transparent', color: 'gray.600' }}
                />
              </Link>
              <Link href="https://www.instagram.com/montevarhotelbenin" isExternal>
                <IconButton
                  aria-label="Instagram"
                  icon={<FaInstagram size="28px" />}
                  variant="ghost"
                  color="black"
                  _hover={{ bg: 'transparent', color: 'gray.600' }}
                />
              </Link>
              <Link href="https://www.tiktok.com/discover/montevar-hotel" isExternal>
                <IconButton
                  aria-label="TikTok"
                  icon={<FaTiktok size="28px" />}
                  variant="ghost"
                  color="black"
                  _hover={{ bg: 'transparent', color: 'gray.600' }}
                />
              </Link>
            </HStack>
          </Box>
        </Flex>

        {/* Horizontal Line */}
        <Divider my={10} borderColor="gray.400" />

        {/* Bottom Row: Terms & Rights */}
        <Flex
          justify="space-between"
          direction={{ base: 'column', md: 'row' }}
          align="center"
          gap={4}
          pb={4}
        >
          <Text>&copy; {new Date().getFullYear()} Montevar Hotel. All rights reserved.</Text>

          <HStack spacing={6}>
            <Link as={NextLink} href="/terms">Terms & Conditions</Link>
            <Link as={NextLink} href="#hotel-info">Policy</Link>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
