'use client';

import { Box, Button, Flex, Link, Text, VisuallyHidden } from '@chakra-ui/react';
import Image from 'next/image';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, easeLux, motion } from '@/components/motion';
import { HOTEL } from './brand';

const LINKS = [
  { label: 'Rooms & Suites', href: '/#rooms' },
  { label: 'Experiences', href: '/about' },
  { label: 'Gallery', href: '/#gallery' },
  { label: 'Contact', href: '/#contact' },
];

// Pages that open on a dark full-bleed photograph, so the header can start transparent
const OVER_PHOTO = ['/', '/about', '/booking'];

function NavLink({ href, children, light }: { href: string; children: React.ReactNode; light: boolean }) {
  return (
    <Link
      as={NextLink}
      href={href}
      position="relative"
      fontSize="11px"
      fontWeight={600}
      letterSpacing="0.2em"
      textTransform="uppercase"
      color={light ? 'ivory.100' : 'ink.900'}
      _hover={{ textDecoration: 'none', _after: { transform: 'scaleX(1)' } }}
      _after={{
        content: '""',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: '-6px',
        height: '1px',
        bg: 'champagne.400',
        transform: 'scaleX(0)',
        transformOrigin: 'left',
        transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      transition="color 0.4s ease"
    >
      {children}
    </Link>
  );
}

function Wordmark({ light }: { light: boolean }) {
  return (
    <Flex as={NextLink} href="/" align="center" gap={{ base: 2, sm: 3 }} minW={0} aria-label="Montevar Hotel home">
      <Box position="relative" w={{ base: '34px', md: '40px' }} h={{ base: '34px', md: '40px' }} flexShrink={0}>
        <Image src="/images/Montevar_logo.png" alt="" fill sizes="40px" style={{ objectFit: 'contain' }} priority />
      </Box>
      <Box lineHeight={1}>
        <Text
          fontFamily="serif"
          fontSize={{ base: '17px', sm: '20px', md: '24px' }}
          letterSpacing={{ base: '0.22em', sm: '0.32em' }}
          fontWeight={500}
          color={light ? 'ivory.100' : 'ink.900'}
          transition="color 0.4s ease"
        >
          MONTEVAR
        </Text>
        <Text fontSize="9px" letterSpacing={{ base: '0.3em', sm: '0.42em' }} fontWeight={600} whiteSpace="nowrap" color={light ? 'champagne.300' : 'champagne.600'} mt="3px">
          HOTEL · BENIN CITY
        </Text>
      </Box>
    </Flex>
  );
}

export default function SiteHeader() {
  const pathname = usePathname() || '/';
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const overPhoto = OVER_PHOTO.includes(pathname);
  const solid = scrolled || !overPhoto;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the menu when the page changes, and stop the page scrolling behind it while open
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const light = !solid;

  return (
    <>
      <Box
        as={motion.header}
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { duration: 1, ease: easeLux, delay: 0.2 } }}
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={60}
        bg={solid ? 'rgba(246, 241, 232, 0.94)' : 'transparent'}
        backdropFilter={solid ? 'saturate(1.2) blur(10px)' : 'none'}
        borderBottom="1px solid"
        borderColor={solid ? 'line.light' : 'transparent'}
        transitionProperty="background-color, border-color, height"
        transitionDuration="0.5s"
        transitionTimingFunction="cubic-bezier(0.22, 1, 0.36, 1)"
      >
        {/* Soft shade behind the transparent header so it stays readable on bright photos */}
        {light && (
          <Box position="absolute" inset={0} bgGradient="linear(to-b, blackAlpha.500, transparent)" pointerEvents="none" />
        )}
        <Flex
          position="relative"
          maxW="1360px"
          mx="auto"
          px={{ base: 5, md: 10, xl: 16 }}
          h={{ base: '72px', lg: solid ? '76px' : '96px' }}
          align="center"
          justify="space-between"
          transition="height 0.5s cubic-bezier(0.22, 1, 0.36, 1)"
        >
          <Flex gap={9} display={{ base: 'none', lg: 'flex' }} flex={1}>
            {LINKS.slice(0, 3).map((l) => (
              <NavLink key={l.href} href={l.href} light={light}>
                {l.label}
              </NavLink>
            ))}
          </Flex>

          <Wordmark light={light} />

          <Flex gap={8} align="center" justify="flex-end" flex={1} display={{ base: 'none', lg: 'flex' }}>
            <NavLink href="/#contact" light={light}>
              Contact
            </NavLink>
            <Button as={NextLink} href="/booking" variant={light ? 'luxLight' : 'lux'} h="44px" px={7}>
              Reserve
            </Button>
          </Flex>

          <Button
            display={{ base: 'inline-flex', lg: 'none' }}
            variant="unstyled"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            color={light ? 'ivory.100' : 'ink.900'}
            fontSize="11px"
            fontWeight={600}
            letterSpacing="0.22em"
            textTransform="uppercase"
            h="44px"
            minW="44px"
            flexShrink={0}
            ml={3}
          >
            Menu
          </Button>
        </Flex>
      </Box>

      {/* Mobile and tablet menu */}
      <AnimatePresence>
        {menuOpen && (
          <Box
            as={motion.div}
            key="menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)', transition: { duration: 0.8, ease: easeLux } }}
            exit={{ clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.6, ease: easeLux } }}
            position="fixed"
            inset={0}
            zIndex={70}
            bg="ink.900"
            color="ivory.100"
            display="flex"
            flexDirection="column"
            px={{ base: 6, md: 10 }}
            py={6}
          >
            <Flex justify="space-between" align="center" h="44px">
              <Wordmark light />
              <Button
                variant="unstyled"
                onClick={() => setMenuOpen(false)}
                color="ivory.100"
                fontSize="11px"
                fontWeight={600}
                letterSpacing="0.22em"
                textTransform="uppercase"
                h="44px"
                minW="44px"
                flexShrink={0}
                ml={3}
              >
                Close
              </Button>
            </Flex>

            <Box
              as={motion.nav}
              mt={{ base: 14, md: 20 }}
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.3 } } }}
            >
              {[{ label: 'Home', href: '/' }, ...LINKS, { label: 'Reserve a stay', href: '/booking' }].map((l) => (
                <Box key={l.href} overflow="hidden" borderBottom="1px solid" borderColor="line.dark">
                  <Box
                    as={motion.div}
                    variants={{ hidden: { y: '100%' }, show: { y: 0, transition: { duration: 0.9, ease: easeLux } } }}
                  >
                    <Link
                      as={NextLink}
                      href={l.href}
                      onClick={() => setMenuOpen(false)}
                      display="block"
                      py={4}
                      fontFamily="serif"
                      fontSize={{ base: '34px', md: '48px' }}
                      fontWeight={400}
                      _hover={{ color: 'champagne.300', textDecoration: 'none' }}
                    >
                      {l.label}
                    </Link>
                  </Box>
                </Box>
              ))}
            </Box>

            <Box mt="auto" fontSize="sm" color="stone.300" lineHeight={1.9}>
              <Link href={HOTEL.phoneHref} display="block">
                {HOTEL.phone}
              </Link>
              <Link href={`mailto:${HOTEL.email}`} display="block">
                {HOTEL.email}
              </Link>
              <VisuallyHidden>Press Escape to close the menu</VisuallyHidden>
            </Box>
          </Box>
        )}
      </AnimatePresence>
    </>
  );
}
