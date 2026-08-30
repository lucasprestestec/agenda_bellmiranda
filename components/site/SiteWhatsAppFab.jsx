'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { WhatsAppFab } from '../editorial/WhatsAppFab';
import { Icon } from '../core/Icon';
import { SITE } from '../../lib/site-config';

// Hidden on the booking view and once #agendar scrolls into frame, so it
// never competes with the primary booking CTA.
export function SiteWhatsAppFab() {
  const pathname = usePathname();
  const [nearBooking, setNearBooking] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const el = document.getElementById('agendar');
      setNearBooking(!!el && el.getBoundingClientRect().top < window.innerHeight - 80);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  if (pathname.startsWith('/agendar') || nearBooking) return null;
  return <WhatsAppFab href={SITE.whatsappHref} icon={<Icon name="message-circle" size={16} />} />;
}
