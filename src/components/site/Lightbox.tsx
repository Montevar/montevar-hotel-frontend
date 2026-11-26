'use client';

import { Box, Button, Flex, Text } from '@chakra-ui/react';
import Image from 'next/image';
import { useCallback, useEffect } from 'react';
import { AnimatePresence, easeLux, motion } from '@/components/motion';

export type LightboxPhoto = { src: string; alt: string };

// Full-screen photo viewer: arrow keys / buttons to move, Escape or click outside to close
export default function Lightbox({
  photos,
  index,
  onChange,
}: {
  photos: LightboxPhoto[];
  index: number | null;
  onChange: (index: number | null) => void;
}) {
  const open = index !== null;
  const go = useCallback(
    (step: number) => index !== null && onChange((index + step + photos.length) % photos.length),
    [index, onChange, photos.length]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onChange(null);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, go, onChange]);

  const control = {
    variant: 'unstyled' as const,
    color: 'ivory.100',
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.24em',
    textTransform: 'uppercase' as const,
    h: '44px',
    px: 3,
    _hover: { color: 'champagne.300' },
  };

  return (
    <AnimatePresence>
      {index !== null && (
        <Box
          as={motion.div}
          key="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.4 } }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          position="fixed"
          inset={0}
          zIndex={80}
          bg="rgba(15, 16, 18, 0.96)"
          onClick={() => onChange(null)}
          display="flex"
          flexDirection="column"
        >
          <Flex justify="space-between" align="center" px={{ base: 4, md: 8 }} pt={4} onClick={(e) => e.stopPropagation()}>
            <Text color="stone.400" fontSize="xs" letterSpacing="0.2em">
              {String(index + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
            </Text>
            <Button {...control} onClick={() => onChange(null)} autoFocus>
              Close
            </Button>
          </Flex>

          <Box flex={1} position="relative" mx={{ base: 2, md: 20 }} my={4}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={photos[index].src}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: easeLux }}
                style={{ position: 'absolute', inset: 0 }}
              >
                <Image src={photos[index].src} alt={photos[index].alt} fill sizes="100vw" style={{ objectFit: 'contain' }} />
              </motion.div>
            </AnimatePresence>
          </Box>

          <Flex justify="space-between" align="center" px={{ base: 4, md: 8 }} pb={5} onClick={(e) => e.stopPropagation()}>
            <Button {...control} onClick={() => go(-1)}>
              ← Previous
            </Button>
            <Text color="stone.300" fontFamily="serif" fontSize="lg" textAlign="center" px={3} noOfLines={1}>
              {photos[index].alt}
            </Text>
            <Button {...control} onClick={() => go(1)}>
              Next →
            </Button>
          </Flex>
        </Box>
      )}
    </AnimatePresence>
  );
}
