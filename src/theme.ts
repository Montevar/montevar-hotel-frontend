// Montevar design system: warm ivory and deep ink, champagne used sparingly as an accent.
// Serif (Cormorant Garamond) for editorial headlines, sans (Manrope) for everything functional.
// The staff dashboard and manager page keep Chakra's standard components; only fonts change there.
import { extendTheme } from '@chakra-ui/react';

const luxButton = {
  borderRadius: 0,
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  fontSize: '11px',
  fontWeight: 600,
  h: '52px',
  px: 9,
  transition: 'background-color 0.35s ease, color 0.35s ease, border-color 0.35s ease',
};

export const theme = extendTheme({
  fonts: {
    heading: 'var(--font-sans), system-ui, sans-serif',
    body: 'var(--font-sans), system-ui, sans-serif',
    serif: 'var(--font-serif), Georgia, "Times New Roman", serif',
  },
  colors: {
    ivory: { 50: '#FCFAF6', 100: '#F6F1E8', 200: '#EDE5D7', 300: '#E2D8C6' },
    ink: { 600: '#3A3833', 700: '#2A2926', 800: '#1E1E1C', 900: '#151618' },
    champagne: { 200: '#E6D6BA', 300: '#D6BF97', 400: '#C2A577', 500: '#AD8F5F', 600: '#8E7346' },
    stone: { 300: '#BDB4A7', 400: '#A1988B', 500: '#7B7368', 600: '#5E574E' },
    line: { light: '#E2D9CA', dark: 'rgba(246, 241, 232, 0.16)' },
  },
  components: {
    Button: {
      variants: {
        lux: { ...luxButton, bg: 'ink.900', color: 'ivory.100', _hover: { bg: 'champagne.600', _disabled: { bg: 'ink.900' } } },
        luxOutline: {
          ...luxButton,
          bg: 'transparent',
          color: 'ink.900',
          border: '1px solid',
          borderColor: 'ink.900',
          _hover: { bg: 'ink.900', color: 'ivory.100' },
        },
        luxLight: { ...luxButton, bg: 'ivory.100', color: 'ink.900', _hover: { bg: 'champagne.300' } },
        luxOutlineLight: {
          ...luxButton,
          bg: 'transparent',
          color: 'ivory.100',
          border: '1px solid',
          borderColor: 'rgba(246, 241, 232, 0.6)',
          _hover: { bg: 'ivory.100', color: 'ink.900', borderColor: 'ivory.100' },
        },
      },
    },
  },
});
