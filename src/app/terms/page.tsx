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
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';

export default function TermsPage() {
  return (
    <Box py={10} bg="gray.50">
      <Container maxW="6xl">
        <VStack spacing={6} align="start">
          <Heading size="2xl" textAlign="center" w="full">
            Terms & Conditions
          </Heading>

          <Text color="gray.600">
            Please read the following terms and conditions carefully. By booking or staying at Montevar Hotel, you agree to abide by these rules.
          </Text>

          <Divider />

          <Heading size="lg">Booking & Reservation</Heading>
          <List spacing={3} pl={4}>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              All room reservations must be paid for to be confirmed.
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              Reserved rooms that are not paid for at least 24 hours before the check-in date will be automatically canceled.
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              Early check-in and late check-out are subject to availability and may incur additional fees.
            </ListItem>
          </List>

          <Heading size="lg">Refund Policy</Heading>
          <List spacing={3} pl={4}>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              Cancellations made more than 48 hours before check-in may be eligible for a refund minus a 20% administrative fee.
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              Cancellations within 48 hours of check-in are non-refundable.
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              All refunds must be approved by hotel management.
            </ListItem>
          </List>

          <Heading size="lg">Smoking Policy</Heading>
          <List spacing={3} pl={4}>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              Smoking is strictly prohibited inside all rooms and hallways.
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="red.500" />
              A ₦20,000 fine will be applied for any violation of this policy.
            </ListItem>
          </List>

          <Heading size="lg">Noise & Behavior</Heading>
          <List spacing={3} pl={4}>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              Unnecessary noise, loud music, or disruptive behavior in rooms or public areas is not allowed.
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="red.500" />
              Parties are strictly not allowed in guest rooms. Violators will incur a ₦25,000 penalty and may be asked to leave without refund.
            </ListItem>
          </List>

          <Heading size="lg">Damage to Property</Heading>
          <List spacing={3} pl={4}>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              Guests are financially responsible for any damage caused to hotel property during their stay.
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="red.500" />
              Additional charges may be applied to cover the cost of repairs or replacements.
            </ListItem>
          </List>

          <Heading size="lg">Visitors & Security</Heading>
          <List spacing={3} pl={4}>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              All visitors must be registered at the front desk and may only visit between 8:00am – 10:00pm.
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="red.500" />
              Unregistered overnight guests are not allowed and may result in eviction or a fine.
            </ListItem>
          </List>

          <Heading size="lg">Liability</Heading>
          <List spacing={3} pl={4}>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              Montevar Hotel is not responsible for the loss of valuables not deposited in the hotel safe.
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              Guests are advised to secure their belongings and lock their doors when leaving rooms.
            </ListItem>
          </List>

          <Heading size="lg">Right to Refuse Service</Heading>
          <Text>
            Montevar Hotel reserves the right to refuse service or cancel bookings at our discretion for guests who violate any of these terms, are abusive, or pose a threat to staff or other guests.
          </Text>

          <Text fontSize="sm" color="gray.500" mt={10}>
            Last updated: August 2025
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
