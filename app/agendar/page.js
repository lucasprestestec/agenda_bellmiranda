import { Header } from '../../components/site/Header';
import { Footer } from '../../components/site/Footer';
import { BookingFlow } from '../../components/site/BookingFlow';
import { listActiveServices } from '../../lib/services';

export const metadata = {
  title: 'Agendar horário — Bell Miranda',
};

export default async function AgendarPage({ searchParams }) {
  const sp = await searchParams;
  const services = await listActiveServices();
  const initialServiceSlug = typeof sp.servico === 'string' ? sp.servico : undefined;

  return (
    <>
      <Header />
      <main>
        <BookingFlow services={services} initialServiceSlug={initialServiceSlug} />
      </main>
      <Footer />
    </>
  );
}
