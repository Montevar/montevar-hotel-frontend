'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  List,
  ListItem,
  ListIcon,
  Divider,
  Link,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { LineReveal, Reveal } from '@/components/motion';
import { Eyebrow } from '@/components/site/brand';
import NextLink from 'next/link';

export default function TermsPage() {
  return (
    <Box bg="ivory.100" pt={{ base: '128px', md: '176px' }} pb={{ base: 20, md: 32 }}>
      <Container maxW="780px" px={{ base: 5, md: 8 }}>
        <Reveal onMount delay={0.2}>
          <Eyebrow>Montevar Hotel</Eyebrow>
        </Reveal>
        <Text as="h1" fontFamily="serif" fontWeight={300} fontSize={{ base: '52px', md: '84px' }} lineHeight={0.98} color="ink.900" mt={6} mb={{ base: 10, md: 14 }}>
          <LineReveal onMount delay={0.3} lines={['Terms &', <em key="c">Conditions</em>]} />
        </Text>
        <Reveal onMount delay={0.6}>
        <VStack
          spacing={6}
          align="start"
          color="ink.700"
          lineHeight={1.85}
          sx={{
            h2: { fontFamily: 'serif', fontWeight: 400, fontSize: { base: '30px', md: '36px' }, lineHeight: 1.15, color: 'ink.900', pt: 6 },
            hr: { borderColor: 'line.light', opacity: 1 },
            'p, li': { color: 'stone.600' },
            a: { color: 'champagne.600', textDecoration: 'underline', textUnderlineOffset: '3px' },
          }}
        >

          <Text color="gray.600">
            Please read the following terms and conditions carefully. By booking or staying at Montevar Hotel, you agree to abide by these rules.
          </Text>

          <Divider />

          <Heading size="lg">Booking & Reservation</Heading>
          <List spacing={3} pl={4}>
            <ListItem>
              <ListIcon as={CheckIcon} boxSize="10px" color="champagne.600" />
              All room reservations must be paid for to be confirmed.
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} boxSize="10px" color="champagne.600" />
              Reserved rooms that are not paid for at least 24 hours before the check-in date will be automatically canceled.
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} boxSize="10px" color="champagne.600" />
              Early check-in and late check-out are subject to availability and may incur additional fees.
            </ListItem>
          </List>

          <Heading size="lg">Refund Policy</Heading>
          <List spacing={3} pl={4}>
            <ListItem>
              <ListIcon as={CheckIcon} boxSize="10px" color="champagne.600" />
              Cancellations made more than 48 hours before check-in may be eligible for a refund minus a 20% administrative fee.
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} boxSize="10px" color="champagne.600" />
              Cancellations within 48 hours of check-in are non-refundable.
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} boxSize="10px" color="champagne.600" />
              All refunds must be approved by hotel management.
            </ListItem>
          </List>

          <Heading size="lg">Smoking Policy</Heading>
          <List spacing={3} pl={4}>
            <ListItem>
              <ListIcon as={CheckIcon} boxSize="10px" color="champagne.600" />
              Smoking is strictly prohibited inside all rooms and hallways.
            </ListItem>
            <ListItem>
              <ListIcon as={CloseIcon} boxSize="9px" color="red.700" />
              A ₦20,000 fine will be applied for any violation of this policy.
            </ListItem>
          </List>

          <Heading size="lg">Noise & Behavior</Heading>
          <List spacing={3} pl={4}>
            <ListItem>
              <ListIcon as={CheckIcon} boxSize="10px" color="champagne.600" />
              Unnecessary noise, loud music, or disruptive behavior in rooms or public areas is not allowed.
            </ListItem>
            <ListItem>
              <ListIcon as={CloseIcon} boxSize="9px" color="red.700" />
              Parties are strictly not allowed in guest rooms. Violators will incur a ₦25,000 penalty and may be asked to leave without refund.
            </ListItem>
          </List>

          <Heading size="lg">Damage to Property</Heading>
          <List spacing={3} pl={4}>
            <ListItem>
              <ListIcon as={CheckIcon} boxSize="10px" color="champagne.600" />
              Guests are financially responsible for any damage caused to hotel property during their stay.
            </ListItem>
            <ListItem>
              <ListIcon as={CloseIcon} boxSize="9px" color="red.700" />
              Additional charges may be applied to cover the cost of repairs or replacements.
            </ListItem>
          </List>

          <Heading size="lg">Visitors & Security</Heading>
          <List spacing={3} pl={4}>
            <ListItem>
              <ListIcon as={CheckIcon} boxSize="10px" color="champagne.600" />
              All visitors must be registered at the front desk and may only visit between 8:00am – 10:00pm.
            </ListItem>
            <ListItem>
              <ListIcon as={CloseIcon} boxSize="9px" color="red.700" />
              Unregistered overnight guests are not allowed and may result in eviction or a fine.
            </ListItem>
          </List>

          <Heading size="lg">Liability</Heading>
          <List spacing={3} pl={4}>
            <ListItem>
              <ListIcon as={CheckIcon} boxSize="10px" color="champagne.600" />
              Montevar Hotel is not responsible for the loss of valuables not deposited in the hotel safe.
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} boxSize="10px" color="champagne.600" />
              Guests are advised to secure their belongings and lock their doors when leaving rooms.
            </ListItem>
          </List>

          <Heading size="lg">Right to Refuse Service</Heading>
          <Text>
            Montevar Hotel reserves the right to refuse service or cancel bookings at our discretion for guests who violate any of these terms, are abusive, or pose a threat to staff or other guests.
          </Text>

          <Text>
            For how we handle your personal information, see our{' '}
            <Link as={NextLink} href="/privacy" color="teal.600">
              Privacy Policy
            </Link>
            .
          </Text>

          <Text fontSize="sm" color="gray.500" mt={10}>
            Last updated: August 2025
          </Text>
        </VStack>
        </Reveal>
      </Container>
    </Box>
  );
}
