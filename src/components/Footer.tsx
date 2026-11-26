'use client';

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  Grid,
  Input,
  Link,
  Text,
  useToast,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useState } from 'react';
import { FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa';
import { LineReveal, Reveal } from '@/components/motion';
import { Eyebrow, Frame, HOTEL } from '@/components/site/brand';

const FAQ = [
  { q: 'What time is check-in?', a: `Check-in begins at ${HOTEL.checkIn}, and check-out is at ${HOTEL.checkOut}.` },
  { q: 'Do you allow pets?', a: 'Unfortunately, pets are not allowed at Montevar Hotel, except for service animals.' },
  { q: 'Is breakfast included?', a: 'On special occasions, we serve complimentary breakfast to all registered guests each morning.' },
];

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text fontSize="10px" fontWeight={600} letterSpacing="0.28em" textTransform="uppercase" color="champagne.300" mb={5}>
      {children}
    </Text>
  );
}

const footerLink = {
  display: 'block',
  color: 'stone.300',
  fontSize: 'sm',
  lineHeight: 2.1,
  transition: 'color 0.3s ease',
  _hover: { color: 'ivory.100', textDecoration: 'none' },
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const toast = useToast();

  const handleSubscribe = () => {
    if (!email || !email.includes('@')) {
      toast({ title: 'Invalid email', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    toast({ title: 'Subscribed!', description: 'Thank you for subscribing.', status: 'success', duration: 3000, isClosable: true });
    setEmail('');
  };

  return (
    <Box as="footer" bg="ink.900" color="ivory.100" pt={{ base: 20, md: 28 }} pb={10}>
      <Frame>
        {/* Closing statement */}
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          justify="space-between"
          align={{ base: 'flex-start', lg: 'flex-end' }}
          gap={10}
          pb={{ base: 16, md: 20 }}
          borderBottom="1px solid"
          borderColor="line.dark"
        >
          <Box>
            <Eyebrow light mb={6}>
              Montevar Hotel
            </Eyebrow>
            <Text as="p" fontFamily="serif" fontWeight={300} fontSize={{ base: '44px', md: '72px', xl: '88px' }} lineHeight={0.98} mt={6}>
              <LineReveal lines={['Stay a while', <em key="i">in Benin City.</em>]} />
            </Text>
          </Box>
          <Reveal>
            <Flex gap={3} wrap="wrap">
              <Button as={NextLink} href="/booking" variant="luxLight">
                Reserve your stay
              </Button>
              <Button as="a" href={HOTEL.phoneHref} variant="luxOutlineLight">
                Call the hotel
              </Button>
            </Flex>
          </Reveal>
        </Flex>

        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', xl: '1.1fr 1fr 0.8fr 1.4fr' }}
          gap={{ base: 12, md: 14 }}
          py={{ base: 14, md: 20 }}
        >
          <Box>
            <ColumnTitle>Visit</ColumnTitle>
            <Text color="stone.300" fontSize="sm" lineHeight={2.1}>
              {HOTEL.address[0]}
              <br />
              {HOTEL.address[1]}
            </Text>
            <Text color="stone.400" fontSize="sm" mt={3}>
              {HOTEL.airport}
            </Text>
          </Box>

          <Box>
            <ColumnTitle>Contact</ColumnTitle>
            <Link href={HOTEL.phoneHref} {...footerLink}>
              {HOTEL.phone}
            </Link>
            <Link href={`mailto:${HOTEL.email}`} {...footerLink}>
              {HOTEL.email}
            </Link>
            <Flex gap={3} mt={5}>
              {[
                { href: HOTEL.social.facebook, icon: FaFacebookF, label: 'Facebook' },
                { href: HOTEL.social.instagram, icon: FaInstagram, label: 'Instagram' },
                { href: HOTEL.social.tiktok, icon: FaTiktok, label: 'TikTok' },
              ].map(({ href, icon: Icon, label }) => (
                <Link
                  key={label}
                  href={href}
                  isExternal
                  aria-label={label}
                  w="40px"
                  h="40px"
                  display="grid"
                  placeItems="center"
                  border="1px solid"
                  borderColor="line.dark"
                  color="stone.300"
                  transition="all 0.35s ease"
                  _hover={{ color: 'ink.900', bg: 'ivory.100', borderColor: 'ivory.100' }}
                >
                  <Icon size={14} />
                </Link>
              ))}
            </Flex>
          </Box>

          <Box>
            <ColumnTitle>Explore</ColumnTitle>
            {[
              ['Home', '/'],
              ['Rooms & Suites', '/#rooms'],
              ['Experiences', '/about'],
              ['Reserve', '/booking'],
              ['Contact', '/#contact'],
            ].map(([label, href]) => (
              <Link key={href} as={NextLink} href={href} {...footerLink}>
                {label}
              </Link>
            ))}
          </Box>

          <Box>
            <ColumnTitle>Good to know</ColumnTitle>
            <Accordion allowToggle>
              {FAQ.map((item) => (
                <AccordionItem key={item.q} borderColor="line.dark">
                  <AccordionButton px={0} py={3} _hover={{ bg: 'transparent', color: 'ivory.100' }} color="stone.300">
                    <Box flex="1" textAlign="left" fontSize="sm">
                      {item.q}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel px={0} pb={4} color="stone.400" fontSize="sm" lineHeight={1.8}>
                    {item.a}
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>

            <Text mt={10} color="stone.300" fontSize="sm">
              Event news and exclusive offers, now and then.
            </Text>
            <Flex mt={3} borderBottom="1px solid" borderColor="stone.500" _focusWithin={{ borderColor: 'champagne.300' }}>
              <Input
                variant="unstyled"
                placeholder="Your email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address for the newsletter"
                flex={1}
                minW={0}
                color="ivory.100"
                _placeholder={{ color: 'stone.500' }}
                py={3}
              />
              <Button
                variant="unstyled"
                onClick={handleSubscribe}
                flexShrink={0}
                pl={4}
                color="champagne.300"
                fontSize="10px"
                fontWeight={600}
                letterSpacing="0.24em"
                textTransform="uppercase"
                _hover={{ color: 'ivory.100' }}
              >
                Subscribe
              </Button>
            </Flex>
          </Box>
        </Grid>

        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          gap={4}
          pt={8}
          borderTop="1px solid"
          borderColor="line.dark"
          fontSize="xs"
          color="stone.400"
          letterSpacing="0.06em"
        >
          <Text>&copy; {new Date().getFullYear()} Montevar Hotel. All rights reserved.</Text>
          <Flex gap={6}>
            <Link as={NextLink} href="/terms" _hover={{ color: 'ivory.100' }}>
              Terms &amp; Conditions
            </Link>
            <Link as={NextLink} href="/privacy" _hover={{ color: 'ivory.100' }}>
              Privacy Policy
            </Link>
          </Flex>
        </Flex>
      </Frame>
    </Box>
  );
}
