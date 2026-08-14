import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Pitch */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-gradient-to-tr from-amber-500 to-pink-500 flex items-center justify-center text-white font-black text-sm">
                T
              </span>
              <span className="text-lg font-bold tracking-tight text-white">
                Talent<span className="text-amber-500">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-stone-400 max-w-sm">
              India’s first fully open, commission-free creative talent marketplace. Connect directly via WhatsApp/phone with singers, dancers, makeup artists, and wedding vendors.
            </p>
            <div className="text-xs text-stone-500">
              © {new Date().getFullYear()} TalentHub India. All rights reserved.
            </div>
          </div>

          {/* Quick links: Discover */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Discover</h3>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link href="/explore" className="hover:text-amber-500 transition-colors">
                  Explore Talents
                </Link>
              </li>
              <li>
                <Link href="/explore?verified=true" className="hover:text-amber-500 transition-colors">
                  Verified Creators
                </Link>
              </li>
              <li>
                <Link href="/#categories" className="hover:text-amber-500 transition-colors">
                  Popular Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick links: Join */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">For Creators</h3>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link href="/signup" className="hover:text-amber-500 transition-colors">
                  Join as Creator
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-amber-500 transition-colors">
                  Creator Dashboard
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-amber-500 transition-colors">
                  How it Works
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-stone-800 text-center text-xs text-stone-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>Connecting creative fields: from Mehndi & Calligraphy to Stand-up Comedy & AI generation.</p>
          <p className="flex items-center gap-1 font-semibold text-stone-400">
            Made with <span className="text-red-500">❤️</span> in India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
