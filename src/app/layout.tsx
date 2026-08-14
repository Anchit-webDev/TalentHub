import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: 'TalentHub | India’s Creative Talent Marketplace',
  description: 'Discover and hire verified Indian creative talents including singers, dancers, mehndi artists, makeup artists, photographers, and more. Direct communication, zero commission.',
  keywords: 'hiring creators, indian talent marketplace, hire mehndi artist, hire photographer, makeup artist mumbai, booking app delhi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} font-sans bg-[#fffdf9] text-stone-900 min-h-screen flex flex-col antialiased`}>
        <LanguageProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
