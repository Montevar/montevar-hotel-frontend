'use client';

import { Box, Button, Flex, Grid, GridItem, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  ImageReveal,
  LineReveal,
  Parallax,
  Reveal,
  Stagger,
  StaggerItem,
  easeLux,
  motion,
  useScroll,
  useTransform,
} from '@/components/motion';
import AvailabilityBar from '@/components/site/AvailabilityBar';
import Lightbox, { type LightboxPhoto } from '@/components/site/Lightbox';
import {
  CATEGORIES,
  CATEGORY_COPY,
  Display,
  Eyebrow,
  Frame,
  HOTEL,
  Photo,
  WEEKLY,
  naira,
  useRoomCategories,
} from '@/components/site/brand';

const sectionAnchor = { scrollMarginTop: '80px' };

// ---------------------------------------------------------------- Hero
function Hero() {
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 900], [0, 180]);
  const textOpacity = useTransform(scrollY, [0, 420], [1, 0]);
  const textY = useTransform(scrollY, [0, 420], [0, -40]);

  return (
    <Box as="section" position="relative" h="100svh" minH={{ base: '660px', md: '760px' }} bg="ink.900" overflow="hidden">
      <motion.div
        style={{ position: 'absolute', inset: '-4% 0', y: imageY }}
        initial={{ scale: 1.16, opacity: 0.4 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2.8, ease: easeLux }}
      >
        <Photo
          src="/images/milan.jpg"
          alt="A Classic Executive room at Montevar Hotel"
          priority
          position="72% 45%"
          grade="saturate(0.72) contrast(1.1) brightness(0.62) sepia(0.12)"
        />
      </motion.div>
      <Box position="absolute" inset={0} bgGradient="linear(to-t, rgba(21,22,24,0.92) 0%, rgba(21,22,24,0.35) 45%, rgba(21,22,24,0.1) 75%)" />
      <Box position="absolute" inset={0} bgGradient="linear(to-r, rgba(21,22,24,0.55), transparent 65%)" />

      <Frame position="relative" h="full" display="flex" flexDirection="column" justifyContent="flex-end" pb={{ base: 10, md: 14, xl: 32 }}>
        <motion.div style={{ opacity: textOpacity, y: textY }}>
          <Reveal onMount delay={0.5}>
            <Eyebrow light>Benin City · Edo State</Eyebrow>
          </Reveal>
          <Text
            as="h1"
            fontFamily="serif"
            fontWeight={300}
            color="ivory.100"
            fontSize={{ base: '48px', sm: '60px', md: '88px', xl: '116px' }}
            lineHeight={0.94}
            letterSpacing="-0.02em"
            mt={{ base: 5, md: 7 }}
          >
            <LineReveal
              onMount
              delay={0.65}
              lines={[
                'Luxury and',
                <>
                  <Box as="em" color="champagne.200" fontWeight={300}>
                    tranquility,
                  </Box>{' '}
                  in the
                </>,
                'heart of the city.',
              ]}
            />
          </Text>

          <Flex
            mt={{ base: 8, md: 12 }}
            justify="space-between"
            align={{ base: 'flex-start', md: 'flex-end' }}
            direction={{ base: 'column', md: 'row' }}
            gap={8}
          >
            <Reveal onMount delay={1.3}>
              <Text color="stone.300" maxW="420px" fontSize={{ base: 'sm', md: 'md' }} lineHeight={1.8}>
                Welcome to Montevar Hotel, where luxury meets comfort and every guest is treated like family.
              </Text>
            </Reveal>
            <Reveal onMount delay={1.45}>
              <Flex gap={3} wrap="wrap">
                <Button as={NextLink} href="/booking" variant="luxLight">
                  Reserve your stay
                </Button>
                <Button as={NextLink} href="#rooms" variant="luxOutlineLight">
                  Discover the rooms
                </Button>
              </Flex>
            </Reveal>
          </Flex>
        </motion.div>
      </Frame>

      {/* Scroll cue */}
      <Box position="absolute" left="50%" bottom={0} display={{ base: 'none', xl: 'block' }} aria-hidden>
        <Box w="1px" h="72px" bg="rgba(246,241,232,0.2)" overflow="hidden">
          <motion.div
            style={{ width: '100%', height: '100%', background: '#D6BF97', transformOrigin: 'top' }}
            animate={{ scaleY: [0, 1, 1], y: ['0%', '0%', '100%'] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: easeLux, repeatDelay: 0.4 }}
          />
        </Box>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------- Availability strip
function QuickAvailability() {
  const router = useRouter();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  const search = () => {
    if (!startDate || !endDate || !category) {
      setError('Please choose your arrival and departure dates and a room type.');
      return;
    }
    setError('');
    router.push(`/booking?${new URLSearchParams({ startDate, endDate, category }).toString()}`);
  };

  return (
    <Frame position="relative" zIndex={2} mt={{ base: 0, xl: '-70px' }} pt={{ base: 8, xl: 0 }}>
      <Reveal onMount delay={1.6}>
        <Box bg="ivory.50" boxShadow={{ xl: '0 30px 60px -30px rgba(21,22,24,0.45)' }}>
          <AvailabilityBar
            startDate={startDate}
            endDate={endDate}
            category={category}
            onStartDate={setStartDate}
            onEndDate={setEndDate}
            onCategory={setCategory}
            onSubmit={search}
            error={error}
          />
        </Box>
      </Reveal>
    </Frame>
  );
}

// ---------------------------------------------------------------- Introduction
function Introduction() {
  return (
    <Frame as="section" id="welcome" py={{ base: 24, md: 36 }} sx={sectionAnchor}>
      <Grid templateColumns={{ base: '1fr', lg: 'repeat(12, 1fr)' }} gap={{ base: 14, lg: 8 }} alignItems="center">
        <GridItem colSpan={{ lg: 6 }}>
          <Reveal>
            <Eyebrow>Welcome to Montevar</Eyebrow>
          </Reveal>
          <Display fontSize={{ base: '44px', md: '64px', xl: '80px' }} mt={7} color="ink.900">
            <LineReveal lines={['Where every guest', <em key="f">is treated</em>, 'like family.']} />
          </Display>
          <Reveal delay={0.2}>
            <Text mt={10} maxW="520px" color="stone.600" fontSize="lg" lineHeight={1.85}>
              We warmly welcome you to Montevar Hotel, where luxury meets comfort. Experience unforgettable moments in our
              elegant rooms, top-notch amenities, and exceptional service.
            </Text>
          </Reveal>

          <Stagger>
            <Grid templateColumns="repeat(3, 1fr)" mt={14} borderTop="1px solid" borderColor="line.light">
              {[
                ['Check-in', HOTEL.checkIn],
                ['Check-out', HOTEL.checkOut],
                ['From the airport', '10–15 min'],
              ].map(([label, value], i) => (
                <StaggerItem key={label}>
                  <Box pt={6} pr={4} pl={i ? 5 : 0} borderLeft={i ? '1px solid' : 'none'} borderColor="line.light" h="full">
                    <Text fontSize="10px" letterSpacing="0.24em" textTransform="uppercase" color="stone.500" fontWeight={600}>
                      {label}
                    </Text>
                    <Text fontFamily="serif" fontSize={{ base: '22px', md: '28px' }} mt={2} color="ink.900">
                      {value}
                    </Text>
                  </Box>
                </StaggerItem>
              ))}
            </Grid>
          </Stagger>

          <Reveal delay={0.1}>
            <Text mt={10} fontSize="11px" letterSpacing="0.2em" textTransform="uppercase" color="champagne.600" fontWeight={600}>
              Best Luxury Hotel 2024 · Top Customer Service 2023
            </Text>
          </Reveal>
        </GridItem>

        <GridItem colStart={{ lg: 8 }} colSpan={{ lg: 5 }} position="relative" pb={{ base: 20, lg: 0 }}>
          <ImageReveal style={{ aspectRatio: '4 / 5' }}>
            <Photo src="/images/montevar-hotel-exterior.jpg" alt="Reception at Montevar Hotel" sizes="(max-width: 992px) 100vw, 40vw" />
          </ImageReveal>
          <Box
            position="absolute"
            w={{ base: '58%', lg: '62%' }}
            left={{ base: '-4%', lg: '-26%' }}
            bottom={{ base: 0, lg: '-16%' }}
            border="10px solid"
            borderColor="ivory.100"
          >
            <ImageReveal delay={0.3} style={{ aspectRatio: '4 / 3' }}>
              <Photo src="/images/pool.jpeg" alt="The outdoor pool at Montevar Hotel" sizes="(max-width: 992px) 60vw, 25vw" />
            </ImageReveal>
          </Box>
        </GridItem>
      </Grid>
    </Frame>
  );
}

// ---------------------------------------------------------------- Rooms & suites
function RoomsAndSuites() {
  const summaries = useRoomCategories();
  const totalRooms = Object.values(summaries).reduce((n, s) => n + s.rooms, 0);

  return (
    <Box as="section" id="rooms" bg="ivory.200" py={{ base: 24, md: 36 }} sx={sectionAnchor}>
      <Frame>
        <Grid templateColumns={{ base: '1fr', lg: '1.4fr 1fr' }} gap={10} alignItems="end" mb={{ base: 16, md: 28 }}>
          <Box>
            <Reveal>
              <Eyebrow>Accommodation</Eyebrow>
            </Reveal>
            <Display fontSize={{ base: '56px', md: '96px', xl: '120px' }} mt={6} color="ink.900">
              <LineReveal lines={['Rooms', <em key="s">& Suites</em>]} />
            </Display>
          </Box>
          <Reveal delay={0.15}>
            <Text color="stone.600" fontSize="lg" lineHeight={1.85} maxW="460px">
              {totalRooms ? `${totalRooms} rooms across five categories, ` : 'Five categories of rooms, '}
              from restful Standard rooms to our Royal Suite. Prices are per night.
            </Text>
          </Reveal>
        </Grid>

        {CATEGORIES.map((category, i) => {
          const copy = CATEGORY_COPY[category];
          const info = summaries[category];
          const flip = i % 2 === 1;
          return (
            <Grid
              key={category}
              templateColumns={{ base: '1fr', lg: flip ? '5fr 7fr' : '7fr 5fr' }}
              gap={{ base: 8, lg: 20 }}
              alignItems="center"
              mb={{ base: 20, md: 32 }}
              _last={{ mb: 0 }}
            >
              <GridItem order={{ lg: flip ? 2 : 1 }}>
                <ImageReveal style={{ aspectRatio: '16 / 11' }}>
                  <Photo src={copy.image} alt={`${category} room at Montevar Hotel`} sizes="(max-width: 992px) 100vw, 58vw" />
                </ImageReveal>
              </GridItem>
              <GridItem order={{ lg: flip ? 1 : 2 }}>
                <Reveal>
                  <Text fontFamily="serif" fontSize="20px" color="champagne.600" fontStyle="italic">
                    {String(i + 1).padStart(2, '0')}
                  </Text>
                  <Text as="h3" fontFamily="serif" fontWeight={400} fontSize={{ base: '40px', md: '56px' }} lineHeight={1} mt={3} color="ink.900">
                    {category}
                  </Text>
                  <Text mt={6} color="stone.600" lineHeight={1.85} maxW="440px">
                    {copy.text}
                  </Text>
                  {info && info.amenities.length >= 3 ? (
                    <Text mt={6} fontSize="12px" letterSpacing="0.08em" color="stone.500">
                      {info.amenities.join('  ·  ')}
                    </Text>
                  ) : null}
                  <Flex mt={8} pt={6} borderTop="1px solid" borderColor="line.light" justify="space-between" align="center" gap={6} wrap="wrap">
                    <Box>
                      <Text fontSize="10px" letterSpacing="0.24em" textTransform="uppercase" color="stone.500" fontWeight={600}>
                        {info ? `From · ${info.rooms} room${info.rooms === 1 ? '' : 's'}` : 'From'}
                      </Text>
                      <Text fontFamily="serif" fontSize="30px" color="ink.900" minH="40px">
                        {info?.fromPrice ? (
                          <>
                            {naira(info.fromPrice)}
                            <Box as="span" fontFamily="body" fontSize="sm" color="stone.500" ml={2}>
                              / night
                            </Box>
                          </>
                        ) : (
                          '—'
                        )}
                      </Text>
                    </Box>
                    <Button as={NextLink} href={`/booking?category=${encodeURIComponent(category)}`} variant="luxOutline">
                      Check availability
                    </Button>
                  </Flex>
                </Reveal>
              </GridItem>
            </Grid>
          );
        })}
      </Frame>
    </Box>
  );
}

// ---------------------------------------------------------------- Facilities
const FACILITIES = [
  ['High-speed Wi-Fi', 'Free fast connection in every room, for work or for unwinding.'],
  ['Outdoor pool', 'Relax by our crystal clear pool, by day or under the lights at night.'],
  ['Restaurant', 'Dine in our exquisite restaurant, from a quiet breakfast to a long dinner.'],
  ['Bar & lounge', 'Indulge in our luxury bar, with exotic cocktails and good company.'],
  ['Games lounge', 'PlayStation consoles and professional snooker tables, with live football on screen.'],
  ['Valet parking', 'On-site valet parking for every guest.'],
];

function Facilities() {
  return (
    <Box as="section" id="facilities" bg="ink.900" color="ivory.100" py={{ base: 24, md: 36 }} sx={sectionAnchor}>
      <Frame>
        <Grid templateColumns={{ base: '1fr', lg: '5fr 7fr' }} gap={{ base: 14, lg: 24 }}>
          <Box position={{ lg: 'sticky' }} top="120px" alignSelf="start">
            <Reveal>
              <Eyebrow light>On site</Eyebrow>
            </Reveal>
            <Display fontSize={{ base: '48px', md: '72px' }} mt={6}>
              <LineReveal lines={['Everything,', <em key="c">close at hand.</em>]} />
            </Display>
            <Parallax amount={40} style={{ marginTop: 48, aspectRatio: '4 / 5' }}>
              <Photo src="/images/bar.jpeg" alt="The bar at Montevar Hotel" sizes="(max-width: 992px) 100vw, 40vw" />
            </Parallax>
          </Box>

          <Stagger gap={0.08}>
            {FACILITIES.map(([title, text], i) => (
              <StaggerItem key={title}>
                <Grid
                  templateColumns="64px 1fr"
                  py={{ base: 7, md: 9 }}
                  borderTop="1px solid"
                  borderColor="line.dark"
                  _hover={{ '.facility-title': { color: 'champagne.300', transform: 'translateX(8px)' } }}
                >
                  <Text fontFamily="serif" fontStyle="italic" color="champagne.300" fontSize="18px" pt={2}>
                    {String(i + 1).padStart(2, '0')}
                  </Text>
                  <Box>
                    <Text
                      className="facility-title"
                      fontFamily="serif"
                      fontSize={{ base: '30px', md: '40px' }}
                      lineHeight={1.1}
                      transition="color 0.5s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)"
                    >
                      {title}
                    </Text>
                    <Text mt={3} color="stone.300" maxW="480px" lineHeight={1.8}>
                      {text}
                    </Text>
                  </Box>
                </Grid>
              </StaggerItem>
            ))}
          </Stagger>
        </Grid>
      </Frame>
    </Box>
  );
}

// ---------------------------------------------------------------- Evenings (events + weekly programme)
const EVENINGS = [
  { src: '/images/pool2.jpg', title: 'Pool parties', text: 'Music, lights, drinks and laughter by the water.', href: '/about#pool-party' },
  { src: '/images/outdoor-party.jpeg', title: 'Live band nights', text: 'Live music, karaoke and stand-up comedy under the stars.', href: '/about#weekly' },
  { src: '/images/val2.jpg', title: 'Love & Feast', text: 'Our Valentine show: live music and gourmet dining.', href: '/about#love-feast-valentine-show' },
  { src: '/images/games-lounge.jpeg', title: 'Gaming tournaments', text: 'Snooker and PlayStation, with prizes and cheering crowds.', href: '/about#gaming-tournament' },
  { src: '/images/pool4.jpg', title: 'Ladies’ night', text: 'Wednesdays by the pool, with karaoke late into the night.', href: '/about#weekly' },
];

// Left edge of the strip lines up with the page frame (snap points honour the same inset)
const STRIP_INSET = { base: '20px', md: '40px', xl: 'max(64px, calc((100vw - 1360px) / 2 + 64px))' };

function Evenings() {
  const strip = useRef<HTMLDivElement>(null);
  const scrollStrip = (dir: number) =>
    strip.current?.scrollBy({ left: dir * strip.current.clientWidth * 0.7, behavior: 'smooth' });

  return (
    <Box as="section" id="evenings" bg="ivory.100" py={{ base: 24, md: 36 }} sx={sectionAnchor} overflow="hidden">
      <Frame>
        <Flex justify="space-between" align="flex-end" gap={8} wrap="wrap" mb={{ base: 12, md: 16 }}>
          <Box>
            <Reveal>
              <Eyebrow>After dark</Eyebrow>
            </Reveal>
            <Display fontSize={{ base: '48px', md: '80px' }} mt={6} color="ink.900">
              <LineReveal lines={['Evenings', <em key="m">at Montevar</em>]} />
            </Display>
          </Box>
          <Flex gap={2}>
            {[-1, 1].map((d) => (
              <Button
                key={d}
                onClick={() => scrollStrip(d)}
                aria-label={d < 0 ? 'Previous events' : 'Next events'}
                variant="unstyled"
                w="52px"
                h="52px"
                border="1px solid"
                borderColor="ink.900"
                borderRadius="full"
                color="ink.900"
                transition="all 0.35s ease"
                _hover={{ bg: 'ink.900', color: 'ivory.100' }}
              >
                {d < 0 ? '←' : '→'}
              </Button>
            ))}
          </Flex>
        </Flex>
      </Frame>

      {/* Horizontal, swipeable strip of events */}
      <Box
        ref={strip}
        display="flex"
        gap={{ base: 4, md: 6 }}
        overflowX="auto"
        px={STRIP_INSET}
        pb={4}
        sx={{
          scrollSnapType: 'x mandatory',
          scrollPaddingInline: STRIP_INSET,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {EVENINGS.map((e, i) => (
          <Box
            as={motion.a}
            href={e.href}
            key={e.title}
            flex="0 0 auto"
            w={{ base: '78vw', sm: '340px', md: '380px' }}
            sx={{ scrollSnapAlign: 'start' }}
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0, transition: { duration: 1, ease: easeLux, delay: Math.min(i, 4) * 0.08 } }}
            viewport={{ once: true, amount: 0.3 }}
            role="group"
          >
            <Box position="relative" overflow="hidden" sx={{ aspectRatio: '3 / 4' }}>
              <Box position="absolute" inset={0} transition="transform 1.2s cubic-bezier(0.22,1,0.36,1)" _groupHover={{ transform: 'scale(1.05)' }}>
                <Photo src={e.src} alt={e.title} sizes="380px" />
              </Box>
            </Box>
            <Text fontFamily="serif" fontSize="28px" mt={5} color="ink.900">
              {e.title}
            </Text>
            <Text color="stone.500" fontSize="sm" mt={1} lineHeight={1.7}>
              {e.text}
            </Text>
          </Box>
        ))}
      </Box>

      {/* Weekly programme */}
      <Frame mt={{ base: 20, md: 28 }}>
        <Grid templateColumns={{ base: '1fr', lg: '4fr 8fr' }} gap={{ base: 8, lg: 16 }}>
          <Reveal>
            <Text fontSize="10px" letterSpacing="0.28em" textTransform="uppercase" color="stone.500" fontWeight={600}>
              Every week
            </Text>
            <Text fontFamily="serif" fontSize={{ base: '32px', md: '40px' }} mt={3} lineHeight={1.1} color="ink.900">
              Every night holds something special.
            </Text>
          </Reveal>
          <Stagger gap={0.07}>
            {WEEKLY.map(([day, title]) => (
              <StaggerItem key={day}>
                <Grid templateColumns={{ base: '110px 1fr', md: '180px 1fr' }} py={5} borderTop="1px solid" borderColor="line.light" alignItems="baseline">
                  <Text fontSize="11px" letterSpacing="0.22em" textTransform="uppercase" color="champagne.600" fontWeight={600}>
                    {day}
                  </Text>
                  <Text fontFamily="serif" fontSize={{ base: '22px', md: '28px' }} color="ink.900">
                    {title}
                  </Text>
                </Grid>
              </StaggerItem>
            ))}
          </Stagger>
        </Grid>
      </Frame>
    </Box>
  );
}

// ---------------------------------------------------------------- Gallery
const GALLERY: (LightboxPhoto & { area: string })[] = [
  { src: '/images/pool.jpeg', alt: 'The pool and terrace', area: 'a' },
  { src: '/images/restaurant.jpeg', alt: 'The restaurant', area: 'b' },
  { src: '/images/croatia.jpg', alt: 'A Standard room', area: 'c' },
  { src: '/images/game4.jpg', alt: 'Snooker in the games lounge', area: 'd' },
  { src: '/images/super-exec.jpeg', alt: 'A Super Executive room', area: 'e' },
  { src: '/images/pool3.jpg', alt: 'A pool party at Montevar', area: 'f' },
  { src: '/images/indonesia.jpg', alt: 'An Executive room', area: 'g' },
];

function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <Box as="section" id="gallery" bg="ivory.200" py={{ base: 24, md: 36 }} sx={sectionAnchor}>
      <Frame>
        <Flex justify="space-between" align="flex-end" mb={{ base: 12, md: 16 }} gap={6} wrap="wrap">
          <Box>
            <Reveal>
              <Eyebrow>Gallery</Eyebrow>
            </Reveal>
            <Display fontSize={{ base: '48px', md: '80px' }} mt={6} color="ink.900">
              <LineReveal lines={[<em key="g">A glimpse</em>, 'of Montevar']} />
            </Display>
          </Box>
          <Reveal delay={0.1}>
            <Text color="stone.500" fontSize="sm">
              Select a photograph to view it larger.
            </Text>
          </Reveal>
        </Flex>

        <Grid
          gap={{ base: 3, md: 4 }}
          templateColumns={{ base: 'repeat(2, 1fr)', lg: 'repeat(12, 1fr)' }}
          gridAutoRows={{ base: '160px', md: '200px', lg: '130px' }}
          templateAreas={{
            base: `"a a" "a a" "b c" "d c" "e e" "f g"`,
            lg: `"a a a a a a a b b b b b" "a a a a a a a b b b b b" "a a a a a a a c c c d d" "e e e e f f f c c c d d" "e e e e f f f g g g g g" "e e e e f f f g g g g g"`,
          }}
        >
          {GALLERY.map((p, i) => (
            <Box
              key={p.src}
              as="button"
              gridArea={p.area}
              onClick={() => setOpen(i)}
              aria-label={`View photo: ${p.alt}`}
              position="relative"
              textAlign="left"
              _focusVisible={{ outline: '2px solid', outlineColor: 'champagne.500', outlineOffset: '3px' }}
              role="group"
            >
              <ImageReveal delay={(i % 3) * 0.08} style={{ position: 'absolute', inset: 0 }}>
                <Photo src={p.src} alt={p.alt} sizes="(max-width: 992px) 50vw, 40vw" />
              </ImageReveal>
              <Box
                position="absolute"
                inset={0}
                bgGradient="linear(to-t, rgba(21,22,24,0.65), transparent 50%)"
                opacity={0}
                transition="opacity 0.5s ease"
                _groupHover={{ opacity: 1 }}
                _groupFocusVisible={{ opacity: 1 }}
                display="flex"
                alignItems="flex-end"
                p={5}
              >
                <Text color="ivory.100" fontFamily="serif" fontSize="xl">
                  {p.alt}
                </Text>
              </Box>
            </Box>
          ))}
        </Grid>
      </Frame>
      <Lightbox photos={GALLERY} index={open} onChange={setOpen} />
    </Box>
  );
}

// ---------------------------------------------------------------- Guest notes
const NOTES = [
  { quote: 'A breathtaking experience! The staff were friendly and the rooms were spotless.', name: 'Sandra Ezejifor' },
  { quote: 'Luxury at its finest. I’ll definitely be back!', name: 'Eseosa' },
  { quote: 'Clean, peaceful, and the ambience is amazing.', name: 'West Eromosele' },
];

function GuestNotes() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setI((n) => (n + 1) % NOTES.length), 7000);
    return () => clearTimeout(t);
  }, [i, paused]);

  return (
    <Box as="section" bg="ivory.100" py={{ base: 24, md: 36 }}>
      <Frame
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <Grid templateColumns={{ base: '1fr', lg: '3fr 9fr' }} gap={{ base: 8, lg: 16 }}>
          <Reveal>
            <Eyebrow>Guest notes</Eyebrow>
          </Reveal>
          <Box>
            <Box minH={{ base: '240px', md: '260px' }} position="relative" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.figure
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.9, ease: easeLux }}
                  style={{ margin: 0 }}
                >
                  <Text as="blockquote" fontFamily="serif" fontWeight={300} fontStyle="italic" fontSize={{ base: '34px', md: '56px' }} lineHeight={1.12} color="ink.900">
                    “{NOTES[i].quote}”
                  </Text>
                  <Text as="figcaption" mt={8} fontSize="11px" letterSpacing="0.24em" textTransform="uppercase" color="stone.500" fontWeight={600}>
                    {NOTES[i].name}
                  </Text>
                </motion.figure>
              </AnimatePresence>
            </Box>
            <Flex gap={3} mt={10}>
              {NOTES.map((n, k) => (
                <Box
                  key={n.name}
                  as="button"
                  onClick={() => setI(k)}
                  aria-label={`Show note from ${n.name}`}
                  aria-current={k === i}
                  w="56px"
                  h="20px"
                  position="relative"
                >
                  <Box position="absolute" top="50%" left={0} right={0} h="1px" bg="stone.300" />
                  {k === i && (
                    <motion.div
                      layoutId="note-indicator"
                      style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: '#151618' }}
                    />
                  )}
                </Box>
              ))}
            </Flex>
          </Box>
        </Grid>
      </Frame>
    </Box>
  );
}

// ---------------------------------------------------------------- Location & contact
function Location() {
  return (
    <Box as="section" id="contact" bg="ivory.200" sx={sectionAnchor}>
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }}>
        <Parallax amount={70} style={{ minHeight: 420 }}>
          <Photo src="/images/top1.jpeg" alt="Montevar Hotel, the building and pool" sizes="(max-width: 992px) 100vw, 50vw" />
        </Parallax>
        <Box px={{ base: 5, md: 16, xl: 24 }} py={{ base: 20, md: 28 }}>
          <Reveal>
            <Eyebrow>Find us</Eyebrow>
          </Reveal>
          <Display fontSize={{ base: '44px', md: '64px' }} mt={6} color="ink.900">
            <LineReveal lines={['In the heart', <em key="b">of Benin City.</em>]} />
          </Display>
          <Reveal delay={0.15}>
            <Text mt={8} color="stone.600" fontSize="lg" lineHeight={1.8}>
              {HOTEL.address[0]}
              <br />
              {HOTEL.address[1]}
            </Text>
            <Box mt={10} borderTop="1px solid" borderColor="line.light">
              {[
                ['Airport', HOTEL.airport],
                ['Taxi', HOTEL.taxi],
                ['Languages', HOTEL.languages],
                ['Payment', HOTEL.payment],
              ].map(([k, v]) => (
                <Grid key={k} templateColumns="130px 1fr" py={4} borderBottom="1px solid" borderColor="line.light" fontSize="sm">
                  <Text fontSize="10px" letterSpacing="0.22em" textTransform="uppercase" color="stone.500" fontWeight={600} pt="2px">
                    {k}
                  </Text>
                  <Text color="ink.700">{v}</Text>
                </Grid>
              ))}
            </Box>
            <Flex mt={10} gap={3} wrap="wrap">
              <Button as="a" href={HOTEL.phoneHref} variant="lux">
                {HOTEL.phone}
              </Button>
              <Button as="a" href={`mailto:${HOTEL.email}`} variant="luxOutline">
                Email us
              </Button>
            </Flex>
          </Reveal>
        </Box>
      </Grid>
      <Box
        as="iframe"
        title="Map showing Montevar Hotel"
        src={HOTEL.mapEmbed}
        w="100%"
        h={{ base: '320px', md: '420px' }}
        border={0}
        display="block"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        sx={{ filter: 'grayscale(1) contrast(0.95) brightness(1.02)' }}
      />
    </Box>
  );
}

// ---------------------------------------------------------------- Page
export default function HomePage() {
  return (
    <Box bg="ivory.100">
      <Hero />
      <QuickAvailability />
      <Introduction />
      <RoomsAndSuites />
      <Facilities />
      <Evenings />
      <Gallery />
      <GuestNotes />
      <Location />
    </Box>
  );
}
