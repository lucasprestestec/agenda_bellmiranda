import { Header } from '../components/site/Header';
import { Hero } from '../components/site/Hero';
import { Portfolio } from '../components/site/Portfolio';
import { About } from '../components/site/About';
import { Services } from '../components/site/Services';
import { WhyBell } from '../components/site/WhyBell';
import { Gallery } from '../components/site/Gallery';
import { Testimonials } from '../components/site/Testimonials';
import { Footer } from '../components/site/Footer';
import { SiteWhatsAppFab } from '../components/site/SiteWhatsAppFab';
import { BookingFlow } from '../components/site/BookingFlow';
import { listActiveServices } from '../lib/services';

// Services rarely change and there's no admin UI to edit them (see
// prisma/seed.mjs) — revalidate periodically so a DB edit shows up without
// a full redeploy, without hitting the database on every request.
export const revalidate = 300;

export default async function HomePage() {
  const services = await listActiveServices();
  return (
    <>
      <Header overlay />
      <main>
        <Hero />
        <Portfolio />
        <About />
        <Services />
        <WhyBell />
        <Gallery />
        <Testimonials />
        <BookingFlow services={services} />
      </main>
      <Footer />
      <SiteWhatsAppFab />
    </>
  );
}
