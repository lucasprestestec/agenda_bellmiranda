import { MobileBookingShell } from '../../components/site/MobileBookingShell';
import { BookingFlow } from '../../components/site/BookingFlow';
import { listActiveServices } from '../../lib/services';

export const metadata = {
  title: 'Agendar — Bell Miranda',
};

// Compact phone-width booking link — meant for the Instagram bio / WhatsApp
// away message, mirroring the design kit's ui_kits/booking screen.
export default async function ReservarPage({ searchParams }) {
  const sp = await searchParams;
  const services = await listActiveServices();
  const requested = typeof sp.servico === 'string' ? sp.servico : undefined;
  const fallback = services.find((s) => s.slug === 'alongamento-gel')?.slug;
  const initialServiceSlug = requested || fallback;

  return (
    <MobileBookingShell>
      <BookingFlow services={services} initialServiceSlug={initialServiceSlug} layout="mobile" />
    </MobileBookingShell>
  );
}
