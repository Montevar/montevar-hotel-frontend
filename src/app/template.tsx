'use client';

// Next.js re-creates a template on every page change, so each new page fades in gently.
// Opacity only: nothing moves, and the layout never jumps.
import { motion } from '@/components/motion';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
      {children}
    </motion.div>
  );
}
