// src/app/about/page.tsx
'use client';

import { Box, Button, Grid, GridItem, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useState } from 'react';
import { ImageReveal, LineReveal, Reveal, Stagger, StaggerItem, easeLux, motion, useScroll, useTransform } from '@/components/motion';
import Lightbox, { type LightboxPhoto } from '@/components/site/Lightbox';
import { Display, Eyebrow, Frame, Photo, WEEKLY } from '@/components/site/brand';

const events = [
  {
    title: 'Pool Party',
    description: 'A vibrant summer evening filled with music, lights, drinks, and laughter.',
    images: ['/images/pool1.jpg', '/images/pool2.jpg', '/images/pool3.jpg', '/images/pool4.jpg', '/images/pool5.jpg'],
  },
  {
    title: 'Love & Feast Valentine Show',
    description: 'A romantic celebration with live music, gourmet dining, and unforgettable memories.',
    images: ['/images/val1.jpg', '/images/val2.jpg', '/images/val3.jpg', '/images/val4.jpg', '/images/val5.jpg'],
  },
  {
    title: 'Gaming Tournament',
    description:
      'Intense and thrilling snooker and PlayStation tournaments with incredible prizes and cheering crowds, and live football matches with friends.',
    images: ['/images/game3.jpg', '/images/game1.jpg', '/images/game2.jpg', '/images/game4.jpg', '/images/game5.jpg'],
  },
];

// Anchor ids used by links elsewhere on the site (e.g. /about#pool-party)
const anchorOf = (title: string) => title.toLowerCase().replace(/[^\w]+/g, '-');

function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 700], [0, 140]);
  return (
    <Box as="section" position="relative" h={{ base: '86svh', md: '92svh' }} minH="560px" bg="ink.900" overflow="hidden">
      <motion.div
        style={{ position: 'absolute', inset: '-4% 0', y }}
        initial={{ scale: 1.14, opacity: 0.4 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2.6, ease: easeLux }}
      >
        <Photo src="/images/val3.jpg" alt="Guests celebrating at Montevar Hotel" priority grade="saturate(0.8) contrast(1.06) brightness(0.62) sepia(0.12)" />
      </motion.div>
      <Box position="absolute" inset={0} bgGradient="linear(to-t, rgba(21,22,24,0.9), rgba(21,22,24,0.2) 60%)" />
      <Frame position="relative" h="full" display="flex" flexDirection="column" justifyContent="flex-end" pb={{ base: 12, md: 20 }}>
        <Reveal onMount delay={0.4}>
          <Eyebrow light>Our story</Eyebrow>
        </Reveal>
        <Text as="h1" fontFamily="serif" fontWeight={300} color="ivory.100" fontSize={{ base: '50px', md: '96px', xl: '120px' }} lineHeight={0.94} mt={6}>
          <LineReveal onMount delay={0.55} lines={['The soul', <em key="h">of hospitality.</em>]} />
        </Text>
      </Frame>
    </Box>
  );
}

function Manifesto() {
  return (
    <Frame as="section" py={{ base: 24, md: 36 }}>
      <Grid templateColumns={{ base: '1fr', lg: 'repeat(12, 1fr)' }} gap={{ base: 12, lg: 8 }}>
        <GridItem colSpan={{ lg: 4 }}>
          <Reveal>
            <Eyebrow>Montevar Hotel</Eyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <Text fontFamily="serif" fontSize={{ base: '28px', md: '34px' }} lineHeight={1.25} mt={8} color="ink.900">
              Your home away from home.
            </Text>
          </Reveal>
        </GridItem>
        <GridItem colStart={{ lg: 6 }} colSpan={{ lg: 7 }}>
          <Display as="div" fontSize={{ base: '30px', md: '44px' }} lineHeight={1.22} fontWeight={300} color="ink.900">
            <Reveal>
              At Montevar Hotel, luxury meets comfort in every corner. Nestled in the heart of Benin, we’ve crafted a serene escape
              where every guest becomes family.
            </Reveal>
          </Display>
          <Reveal delay={0.15}>
            <Text mt={10} color="stone.600" fontSize="lg" lineHeight={1.85} maxW="620px">
              Whether you’re here for a romantic getaway, a celebration, or a retreat from the ordinary, Montevar is where moments
              turn into memories. Every room, every meal, and every smile is infused with the warmth and class that define us.
              Welcome to your home away from home.
            </Text>
          </Reveal>
        </GridItem>
      </Grid>
    </Frame>
  );
}

function EventStory({ event, index, onOpen }: { event: (typeof events)[number]; index: number; onOpen: (photos: LightboxPhoto[], i: number) => void }) {
  const photos = event.images.map((src, i) => ({ src, alt: `${event.title}, photo ${i + 1}` }));
  const flip = index % 2 === 1;

  const tile = (i: number, area: string) => (
    <Box
      key={photos[i].src}
      as="button"
      gridArea={area}
      position="relative"
      onClick={() => onOpen(photos, i)}
      aria-label={`View ${photos[i].alt}`}
      _focusVisible={{ outline: '2px solid', outlineColor: 'champagne.500', outlineOffset: '3px' }}
    >
      <ImageReveal delay={(i % 3) * 0.08} style={{ position: 'absolute', inset: 0 }}>
        <Photo src={photos[i].src} alt={photos[i].alt} sizes={i === 0 ? '(max-width: 992px) 100vw, 55vw' : '(max-width: 992px) 50vw, 22vw'} />
      </ImageReveal>
    </Box>
  );

  return (
    <Box as="article" id={anchorOf(event.title)} py={{ base: 16, md: 24 }} borderTop="1px solid" borderColor="line.light" sx={{ scrollMarginTop: '80px' }}>
      <Grid templateColumns={{ base: '1fr', lg: flip ? '8fr 4fr' : '4fr 8fr' }} gap={{ base: 10, lg: 16 }}>
        <GridItem order={{ lg: flip ? 2 : 1 }}>
          <Text fontFamily="serif" fontStyle="italic" fontSize="20px" color="champagne.600">
            {String(index + 1).padStart(2, '0')}
          </Text>
          <Display as="h2" fontSize={{ base: '40px', md: '56px' }} mt={3} color="ink.900">
            <LineReveal lines={[event.title]} />
          </Display>
          <Reveal delay={0.1}>
            <Text mt={6} color="stone.600" lineHeight={1.85} maxW="380px">
              {event.description}
            </Text>
          </Reveal>
        </GridItem>
        <GridItem order={{ lg: flip ? 1 : 2 }}>
          <Grid
            gap={{ base: 2, md: 3 }}
            templateColumns="repeat(4, 1fr)"
            gridAutoRows={{ base: '120px', md: '170px' }}
            templateAreas={{
              base: `"a a a a" "a a a a" "b b c c" "d d e e"`,
              md: `"a a b b" "a a c c" "d d e e"`,
            }}
          >
            {['a', 'b', 'c', 'd', 'e'].map((area, i) => tile(i, area))}
          </Grid>
        </GridItem>
      </Grid>
    </Box>
  );
}

function WeeklyProgramme() {
  return (
    <Box as="section" id="weekly" bg="ink.900" color="ivory.100" py={{ base: 24, md: 36 }} sx={{ scrollMarginTop: '80px' }}>
      <Frame>
        <Grid templateColumns={{ base: '1fr', lg: '5fr 7fr' }} gap={{ base: 12, lg: 20 }}>
          <Box>
            <Reveal>
              <Eyebrow light>Every week</Eyebrow>
            </Reveal>
            <Display fontSize={{ base: '48px', md: '76px' }} mt={6}>
              <LineReveal lines={['Weekly', <em key="w">at Montevar</em>]} />
            </Display>
            <Reveal delay={0.1}>
              <Text mt={8} color="stone.300" lineHeight={1.8} maxW="360px">
                Every night holds something special — come and celebrate with us!
              </Text>
            </Reveal>
          </Box>
          <Stagger gap={0.08}>
            {WEEKLY.map(([day, title]) => (
              <StaggerItem key={day}>
                <Grid templateColumns={{ base: '1fr', md: '200px 1fr' }} gap={2} py={{ base: 6, md: 8 }} borderTop="1px solid" borderColor="line.dark" alignItems="baseline">
                  <Text fontSize="11px" letterSpacing="0.24em" textTransform="uppercase" color="champagne.300" fontWeight={600}>
                    {day}
                  </Text>
                  <Text fontFamily="serif" fontSize={{ base: '28px', md: '36px' }} lineHeight={1.15}>
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

export default function AboutPage() {
  const [viewer, setViewer] = useState<{ photos: LightboxPhoto[]; index: number | null }>({ photos: [], index: null });

  return (
    <Box bg="ivory.100">
      <Hero />
      <Manifesto />

      <Frame as="section" pb={{ base: 16, md: 24 }}>
        <Box mb={{ base: 4, md: 8 }}>
          <Reveal>
            <Eyebrow>Events</Eyebrow>
          </Reveal>
        </Box>
        {events.map((event, i) => (
          <EventStory key={event.title} event={event} index={i} onOpen={(photos, index) => setViewer({ photos, index })} />
        ))}
        <Reveal>
          <Box pt={{ base: 8, md: 12 }} borderTop="1px solid" borderColor="line.light">
            <Button as={NextLink} href="/booking" variant="lux">
              Reserve your stay
            </Button>
          </Box>
        </Reveal>
      </Frame>

      <WeeklyProgramme />

      <Lightbox photos={viewer.photos} index={viewer.index} onChange={(index) => setViewer((v) => ({ ...v, index }))} />
    </Box>
  );
}
