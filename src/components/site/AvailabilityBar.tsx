'use client';

import { Box, Button, Grid, Input, Select, Text } from '@chakra-ui/react';
import { AnimatePresence, motion } from '@/components/motion';
import { CATEGORIES } from './brand';

type Props = {
  startDate: string;
  endDate: string;
  category: string;
  onStartDate: (v: string) => void;
  onEndDate: (v: string) => void;
  onCategory: (v: string) => void;
  onSubmit: () => void;
  error?: string;
  busy?: boolean;
  buttonLabel?: string;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box as="label" display="block" px={{ base: 5, md: 6 }} py={{ base: 4, md: 5 }} borderColor="line.light" cursor="pointer">
      <Text fontSize="10px" fontWeight={600} letterSpacing="0.24em" textTransform="uppercase" color="stone.500" mb={1.5}>
        {label}
      </Text>
      {children}
    </Box>
  );
}

const fieldInput = {
  variant: 'unstyled' as const,
  fontFamily: 'serif',
  fontSize: '22px',
  color: 'ink.900',
  h: '32px',
};

// Arrival / departure / room type, laid out as one refined strip (stacks on phones)
export default function AvailabilityBar({
  startDate,
  endDate,
  category,
  onStartDate,
  onEndDate,
  onCategory,
  onSubmit,
  error,
  busy,
  buttonLabel = 'Check availability',
}: Props) {
  return (
    <Box>
      <Grid
        as="form"
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          onSubmit();
        }}
        templateColumns={{ base: '1fr', md: '1fr 1fr', xl: '1fr 1fr 1.2fr auto' }}
        bg="ivory.50"
        border="1px solid"
        borderColor="line.light"
        sx={{ '& > label': { borderBottomWidth: { base: '1px', xl: 0 }, borderRightWidth: { base: 0, xl: '1px' } } }}
      >
        <Field label="Arrival">
          <Input type="date" value={startDate} onChange={(e) => onStartDate(e.target.value)} {...fieldInput} />
        </Field>
        <Field label="Departure">
          <Input type="date" value={endDate} onChange={(e) => onEndDate(e.target.value)} {...fieldInput} />
        </Field>
        <Field label="Room type">
          <Select
            value={category}
            onChange={(e) => onCategory(e.target.value)}
            placeholder="Choose a category"
            {...fieldInput}
            iconColor="champagne.600"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Button type="submit" variant="lux" h="auto" minH={{ base: '60px', xl: 'auto' }} px={10} isLoading={busy} gridColumn={{ md: 'span 2', xl: 'auto' }}>
          {buttonLabel}
        </Button>
      </Grid>
      <AnimatePresence>
        {error && (
          <Text
            as={motion.p}
            key={error}
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            mt={3}
            fontSize="sm"
            color="red.700"
          >
            {error}
          </Text>
        )}
      </AnimatePresence>
    </Box>
  );
}
