import { Cormorant_Garamond, Manrope, Parisienne } from 'next/font/google';
import './globals.css';

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--next-serif',
  display: 'swap',
});

const sans = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--next-sans',
  display: 'swap',
});

const script = Parisienne({
  subsets: ['latin'],
  weight: '400',
  variable: '--next-script',
  display: 'swap',
});

export const metadata = {
  title: 'Bell Miranda — Nail Designer & Beauty Studio',
  description:
    'Cuidado técnico com a cutícula, alongamento em gel e fibra, e nail design feito à mão. Estúdio em Tatuí — SP.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${serif.variable} ${sans.variable} ${script.variable}`}>
      <body>{children}</body>
    </html>
  );
}
