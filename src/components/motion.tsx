'use client';

// Shared Motion (motion.dev) presets for the whole site, so every animation moves the same way.
// Editorial pieces (headlines, photographs) use one slow "luxury" ease; interface pieces (tabs,
// lists, dialogs) use one quick spring. Only opacity, transform and clip-path are animated.
// Visitors who ask their device for reduced motion get fades only (MotionConfig + useReducedMotion).
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Transition,
  type Variants,
} from 'motion/react';
import { useRef, type CSSProperties, type ReactNode } from 'react';

export { AnimatePresence, motion, useReducedMotion, useScroll, useTransform };

// ---------- Timing ----------
export const easeLux = [0.22, 1, 0.36, 1] as const; // long, soft deceleration
export const editorial: Transition = { duration: 1.1, ease: easeLux };
export const spring: Transition = { type: 'spring', stiffness: 260, damping: 32, mass: 0.9 };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: editorial },
};

const staggerVariants = (gap: number, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

const inView = { once: true, amount: 0.2 } as const;

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={spring}>
      {children}
    </MotionConfig>
  );
}

type WrapperProps = { children: ReactNode; className?: string; style?: CSSProperties };

// ---------- Editorial ----------

// Fades a block up once, when it first scrolls into view (or straight away with onMount)
export function Reveal({ children, delay = 0, onMount = false, className, style }: WrapperProps & { delay?: number; onMount?: boolean }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      {...(onMount ? { animate: 'show' } : { whileInView: 'show', viewport: inView })}
      variants={{ hidden: fadeUp.hidden, show: { opacity: 1, y: 0, transition: { ...editorial, delay } } }}
    >
      {children}
    </motion.div>
  );
}

// Headline whose lines rise out of a mask, one after another
export function LineReveal({
  lines,
  delay = 0,
  onMount = false,
  lineStyle,
}: {
  lines: ReactNode[];
  delay?: number;
  onMount?: boolean;
  lineStyle?: (index: number) => CSSProperties | undefined;
}) {
  return (
    <motion.span
      style={{ display: 'block' }}
      initial="hidden"
      {...(onMount ? { animate: 'show' } : { whileInView: 'show', viewport: inView })}
      variants={staggerVariants(0.12, delay)}
    >
      {lines.map((line, i) => (
        <span key={i} style={{ display: 'block', overflow: 'hidden', paddingBottom: '0.08em', marginBottom: '-0.08em' }}>
          <motion.span
            style={{ display: 'block', ...lineStyle?.(i) }}
            variants={{ hidden: { y: '105%', opacity: 0 }, show: { y: '0%', opacity: 1, transition: { duration: 1.2, ease: easeLux } } }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

// Photograph that unveils from a narrow band and settles from a slight zoom.
// The child should fill the frame (e.g. next/image with fill).
export function ImageReveal({
  children,
  delay = 0,
  className,
  style,
  hoverZoom = true,
}: WrapperProps & { delay?: number; hoverZoom?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
      // Same start and end either way (the preference is only known after the first render);
      // with reduced motion the unveil is instant and only the fade remains
      initial={{ clipPath: 'inset(12% 8% 12% 8%)', opacity: 0.4 }}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={reduce ? { duration: 0.5, delay, clipPath: { duration: 0 } } : { duration: 1.4, ease: easeLux, delay }}
      whileHover="hover"
    >
      <motion.div
        style={{ position: 'absolute', inset: 0 }}
        initial={{ scale: 1.14 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 1.8, ease: easeLux, delay }}
        variants={hoverZoom ? { hover: { scale: 1.04, transition: { duration: 1.2, ease: easeLux } } } : undefined}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// Moves its content a little slower than the page while scrolling (subtle depth)
export function Parallax({ children, amount = 60, className, style }: WrapperProps & { amount?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-amount, amount]);
  return (
    <div ref={ref} className={className} style={{ position: 'relative', overflow: 'hidden', ...style }}>
      <motion.div style={{ position: 'absolute', inset: `-${amount}px 0`, y }}>{children}</motion.div>
    </div>
  );
}

// Reveals its StaggerItem descendants one after another (variants pass through layout components)
export function Stagger({
  children,
  gap = 0.1,
  delay = 0,
  onMount = false,
  className,
  style,
}: WrapperProps & { gap?: number; delay?: number; onMount?: boolean }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      {...(onMount ? { animate: 'show' } : { whileInView: 'show', viewport: { once: true, amount: 0.1 } })}
      variants={staggerVariants(gap, delay)}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, style }: WrapperProps) {
  return (
    <motion.div className={className} style={style} variants={fadeUp}>
      {children}
    </motion.div>
  );
}

// ---------- Interface (staff dashboard, manager page, booking results) ----------

// Short fade-and-rise for content that appears after a click (tab panels, results, login cards)
export function FadeIn({ children, className, style }: WrapperProps) {
  return (
    <motion.div className={className} style={style} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
      {children}
    </motion.div>
  );
}

// Entrance for one card in a long list: only the first few are delayed, so long lists never wait
export function ListItem({ children, index, className, style }: WrapperProps & { index: number }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: Math.min(index, 8) * 0.04 }}
    >
      {children}
    </motion.div>
  );
}
