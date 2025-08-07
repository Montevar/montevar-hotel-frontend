'use client';

import { Box, Select, FormControl, FormLabel } from '@chakra-ui/react';
import { useState, useEffect } from 'react';

interface RoomSelectorProps {
  onCategoryChange: (category: string) => void;
}

const categories = [
  'Standard',
  'Executive',
  'Classic Executive',
  'Super Executive',
  'Royal Suite',
];

export default function RoomSelector({ onCategoryChange }: RoomSelectorProps) {
  const [selected, setSelected] = useState('');

  useEffect(() => {
    if (selected) onCategoryChange(selected);
  }, [selected, onCategoryChange]);

  return (
    <Box mb={6}>
      <FormControl>
        <FormLabel fontWeight="bold">Select Room Category</FormLabel>
        <Select
          placeholder="Choose a category"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          bg="white"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
