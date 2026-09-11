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

// Services rarely change and there's no admin UI to edit them (see
// prisma/seed.mjs) — revalidate periodically so a DB edit shows up without
// a full redeploy, without hitting the database on every request.
export const revalidate = 300;

// The home page presents the studio and its services; it no longer embeds
// the booking flow itself — Services/ServiceList links straight into
// /reservar (see components/site/ServiceList.jsx), so picking a service
// here takes you directly to booking it in one step.
export default function HomePage() {
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
      </main>
      <Footer />
      <SiteWhatsAppFab />
    </>
  );
}
