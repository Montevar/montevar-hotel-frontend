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
import { CheckCircleIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';

const CONTACT_EMAIL = 'montevarhotels@gmail.com';
const CONTACT_PHONE = '+234 706 099 6380';

function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <List spacing={3} pl={4}>
      {items.map((item, i) => (
        <ListItem key={i}>
          <ListIcon as={CheckCircleIcon} color="green.500" />
          {item}
        </ListItem>
      ))}
    </List>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <Box py={10} bg="gray.50">
      <Container maxW="6xl">
        <VStack spacing={6} align="start">
          <Heading size="2xl" textAlign="center" w="full">
            Privacy Policy
          </Heading>

          <Text color="gray.600">
            This policy explains what personal information Montevar Hotel (&quot;we&quot;, &quot;us&quot;) collects when you use
            montevarhotel.com or book a stay with us, why we collect it, and the choices you have. We handle personal data in line
            with the Nigeria Data Protection Act 2023.
          </Text>

          <Divider />

          <Heading size="lg">Information We Collect</Heading>
          <Bullets
            items={[
              'Booking details you give us: your full name, email address and phone number.',
              'Details of your stay: the room you choose, check-in and check-out dates, price, and whether the booking is reserved or paid.',
              'Payment records: when you pay online, our payment provider Paystack tells us whether the payment succeeded, the amount and a payment reference. We never see or store your card number, PIN or bank login.',
              'Bookings made at our front desk or by phone are recorded by our staff with the same details.',
              'Basic technical information, such as your IP address and browser type, which our hosting providers log automatically to keep the website secure and working.',
            ]}
          />

          <Heading size="lg">How We Use Your Information</Heading>
          <Bullets
            items={[
              'To make, confirm, manage and cancel your reservations.',
              'To process payments and refunds, and to keep records for accounting.',
              'To contact you about your booking, for example to confirm payment before check-in.',
              'To protect the website, our guests and our staff from fraud and misuse.',
              'To meet our legal and tax obligations.',
            ]}
          />
          <Text>We do not sell your personal information, and we do not use it for advertising.</Text>

          <Heading size="lg">Who We Share It With</Heading>
          <Bullets
            items={[
              <>
                <strong>Paystack</strong>, which processes online card and bank payments under its own privacy policy.
              </>,
              'The companies that host our website, booking system and database, only to run the service for us.',
              'Hotel staff and management, only as needed to look after your booking.',
              'Government or law-enforcement authorities, only when the law requires it.',
            ]}
          />

          <Heading size="lg">Cookies</Heading>
          <Bullets
            items={[
              'Guests do not need any cookies to browse rooms or make a booking, and we do not use advertising or tracking cookies.',
              'Our staff and managers use a secure login cookie when they sign in to the hotel’s admin pages.',
              'Our contact section shows an embedded Google Map. Google may set its own cookies when the map loads, under Google’s privacy policy.',
              'Hotel managers sign in to the admin pages with their Google account. We only receive their name and email address from Google for that sign-in.',
            ]}
          />

          <Heading size="lg">How Long We Keep It</Heading>
          <Text>
            We keep booking and payment records for as long as we need them to run the hotel and to meet our legal, tax and
            accounting obligations. When we no longer need them, we delete them or make them anonymous.
          </Text>

          <Heading size="lg">How We Protect It</Heading>
          <Bullets
            items={[
              'All connections to our website are encrypted (HTTPS).',
              'Guest details can only be viewed by signed-in hotel staff. Admin access is protected by two-step sign-in, login attempt limits and automatic sign-out.',
              'Card payments are handled entirely by Paystack, so card details never touch our systems.',
            ]}
          />

          <Heading size="lg">Your Rights</Heading>
          <Text>Under the Nigeria Data Protection Act 2023 you can ask us to:</Text>
          <Bullets
            items={[
              'Tell you what personal information we hold about you and give you a copy.',
              'Correct information that is wrong or incomplete.',
              'Delete your information, where we are not required by law to keep it.',
              'Stop or limit how we use it, or withdraw consent you have given.',
            ]}
          />
          <Text>
            To make a request, contact us using the details below. We will respond within 30 days. If you are not satisfied with
            our response, you can complain to the Nigeria Data Protection Commission (NDPC).
          </Text>

          <Heading size="lg">Children</Heading>
          <Text>
            Our booking service is meant for adults. We do not knowingly collect personal information from children under 18
            without the consent of a parent or guardian.
          </Text>

          <Heading size="lg">Changes to This Policy</Heading>
          <Text>
            We may update this policy from time to time. The latest version will always be on this page, with the date it was last
            updated.
          </Text>

          <Heading size="lg">Contact Us</Heading>
          <Text>
            Montevar Hotel, 1 Montevar Street, Ofumwengbe Community Road, Benin City, Edo State, Nigeria
            <br />
            Email:{' '}
            <Link href={`mailto:${CONTACT_EMAIL}`} color="teal.600">
              {CONTACT_EMAIL}
            </Link>
            <br />
            Phone: {CONTACT_PHONE}
          </Text>

          <Text>
            See also our{' '}
            <Link as={NextLink} href="/terms" color="teal.600">
              Terms &amp; Conditions
            </Link>
            .
          </Text>

          <Text fontSize="sm" color="gray.500" mt={10}>
            Last updated: October 2026
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
