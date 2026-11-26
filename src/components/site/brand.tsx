'use client';

// Montevar brand building blocks: hotel facts, photo treatment and small typographic pieces.
import { Box, Text, type BoxProps, type TextProps } from '@chakra-ui/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getApiBaseUrl } from '@/utils/apiConfig';

// ---------- Facts (unchanged hotel information) ----------
export const HOTEL = {
  name: 'Montevar Hotel',
  address: ['1 Montevar Street, Ofumwengbe Community Road', 'Benin City, Edo State'],
  phone: '+234 706 099 6380',
  phoneHref: 'tel:+2347060996380',
  email: 'montevarhotels@gmail.com',
  checkIn: '2:00 PM',
  checkOut: '12:00 noon',
  airport: 'Approx. 10–15 minute drive from Benin Airport',
  taxi: 'Airport taxi fare: ₦5,000 (estimated)',
  languages: 'English, French',
  payment: 'Paystack, Visa, MasterCard',
  mapEmbed:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63455.740690730854!2d5.544495948022307!3d6.265861313837151!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1040d1a1e26898ef%3A0xd78dbe6d260d36b0!2sMontevar%20Hotel!5e0!3m2!1sen!2sbj!4v1752833726989!5m2!1sen!2sbj',
  social: {
    facebook: 'https://www.facebook.com/montevar.hotel',
    instagram: 'https://www.instagram.com/montevarhotelbenin',
    tiktok: 'https://www.tiktok.com/discover/montevar-hotel',
  },
};

// Room categories in the order guests see them. Prices and amenities come from the live room list.
export const CATEGORIES = ['Standard', 'Executive', 'Classic Executive', 'Super Executive', 'Royal Suite'] as const;

export const CATEGORY_COPY: Record<string, { image: string; text: string }> = {
  Standard: {
    image: '/images/malaysia.jpg',
    text: 'Calm, well-kept rooms with a generous bed and everything you need for a restful night in the city.',
  },
  Executive: {
    image: '/images/indonesia.jpg',
    text: 'Deep velvet headboards and a little more space to unwind after a day in Benin City.',
  },
  'Classic Executive': {
    image: '/images/classic-exec.jpeg',
    text: 'Elegance meets comfort in our Classic Executive rooms, with luxurious bedding and ambient lighting.',
  },
  'Super Executive': {
    image: '/images/super-exec.jpeg',
    text: 'Spacious and serene, our Super Executive rooms are designed for premium relaxation and style.',
  },
  'Royal Suite': {
    image: '/images/canada.jpg',
    text: 'Our most generous accommodation: a Royal Suite with a separate lounge and the full Montevar experience.',
  },
};

// Weekly programme (shown on the homepage and the About page)
export const WEEKLY = [
  ['Wednesday', 'Ladies’ Night, Pool Party & Karaoke'],
  ['Thursday', 'Old School Highlights'],
  ['Friday', 'Comedy Club Night'],
  ['Saturday', 'Live Band Music'],
  ['Sunday', 'Afrobeats & Amapiano Night'],
];

// ---------- Photography ----------
// One warm, slightly deeper grade so phone photographs from different days read as one series
export const PHOTO_GRADE = 'saturate(0.82) contrast(1.06) brightness(0.96) sepia(0.06)';

export function Photo({
  src,
  alt,
  sizes = '100vw',
  priority = false,
  position = 'center',
  grade = PHOTO_GRADE,
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  position?: string;
  grade?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      style={{ objectFit: 'cover', objectPosition: position, filter: grade }}
    />
  );
}

// ---------- Typography ----------
export function Eyebrow({ children, light = false, ...rest }: TextProps & { light?: boolean }) {
  return (
    <Text
      as="span"
      display="inline-flex"
      alignItems="center"
      gap={3}
      fontSize="11px"
      fontWeight={600}
      letterSpacing="0.28em"
      textTransform="uppercase"
      color={light ? 'champagne.300' : 'champagne.600'}
      {...rest}
    >
      <Box as="span" w="28px" h="1px" bg="currentColor" display="inline-block" />
      {children}
    </Text>
  );
}

export function Display({ children, ...rest }: TextProps) {
  return (
    <Text as="h2" fontFamily="serif" fontWeight={400} lineHeight={1.02} letterSpacing="-0.01em" {...rest}>
      {children}
    </Text>
  );
}

// Page-width container used by every guest page
export function Frame({ children, ...rest }: BoxProps) {
  return (
    <Box maxW="1360px" mx="auto" px={{ base: 5, md: 10, xl: 16 }} {...rest}>
      {children}
    </Box>
  );
}

export const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

// ---------- Live room data ----------
type ApiRoom = { name: string; category: string; price: number; images?: string[]; amenities?: string[] };
export type CategorySummary = { category: string; rooms: number; fromPrice: number | null; amenities: string[] };

// Rooms per category, lowest price, and the amenities every room in that category has
export function useRoomCategories() {
  const [summaries, setSummaries] = useState<Record<string, CategorySummary>>({});

  useEffect(() => {
    let cancelled = false;
    fetch(`${getApiBaseUrl()}/api/rooms`)
      .then((r) => (r.ok ? r.json() : []))
      .then((rooms: ApiRoom[]) => {
        if (cancelled || !Array.isArray(rooms)) return;
        const out: Record<string, CategorySummary> = {};
        for (const category of CATEGORIES) {
          const list = rooms.filter((r) => r.category === category);
          if (!list.length) continue;
          const shared = (list[0].amenities || []).filter((a) => list.every((r) => (r.amenities || []).includes(a)));
          out[category] = {
            category,
            rooms: list.length,
            fromPrice: Math.min(...list.map((r) => r.price)),
            amenities: shared.slice(0, 5),
          };
        }
        setSummaries(out);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return summaries;
}
