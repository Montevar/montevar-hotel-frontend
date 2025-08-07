// /src/components/FooterWrapper.tsx
'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

const FooterWrapper = () => {
  const pathname = usePathname();
  const hideFooter = pathname.startsWith('/dashboard');

  if (hideFooter) return null;

  return <Footer />;
};

export default FooterWrapper;
