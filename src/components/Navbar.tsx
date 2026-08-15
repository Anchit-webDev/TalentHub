'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Menu, X, Globe, User, LogOut, LayoutDashboard, ShieldAlert } from 'lucide-react';

const Navbar: React.FC = () => {
  const { syncedUser, signOut } = useAuth();
  const { toggleLanguage, t, language } = useLanguage();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isActive = (path: string) => pathname === path;

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#fffdf9]/80 backdrop-blur-md border-b border-stone-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
              <span className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-pink-500 flex items-center justify-center text-white font-black text-xl shadow-md transform group-hover:scale-105 transition-transform duration-200">
                T
              </span>
              <span className="text-xl font-bold tracking-tight text-stone-900 group-hover:text-amber-600 transition-colors">
                Talent<span className="bg-gradient-to-r from-amber-600 to-pink-600 bg-clip-text text-transparent">Hub</span>
              </span>
            </Link>
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-8 md:flex md:space-x-6">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all ${
                  isActive('/')
                    ? 'border-amber-500 text-stone-950 font-semibold'
                    : 'border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300'
                }`}
              >
                {t('navHome')}
              </Link>
              <Link
                href="/explore"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all ${
                  isActive('/explore')
                    ? 'border-amber-500 text-stone-950 font-semibold'
                    : 'border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300'
                }`}
              >
                {t('navExplore')}
              </Link>
            </div>
          </div>

          {/* Desktop Right Hand buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Toggle - Only standalone when logged out */}
            {!syncedUser && (
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200/80 text-stone-700 rounded-full border border-stone-200 transition-all hover:scale-105 active:scale-95"
              >
                <Globe className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('langToggleLabel')}</span>
              </button>
            )}

            {/* Admin Portal link */}
            {syncedUser?.role === 'admin' && (
              <Link
                href="/admin"
                className="flex items-center gap-1 text-sm text-rose-600 hover:text-rose-800 font-semibold transition-colors"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{t('navAdmin')}</span>
              </Link>
            )}

            {/* Authenticated Links */}
            {syncedUser ? (
              <div className="flex items-center space-x-3">
                {syncedUser.role === 'creator' && (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-stone-700 hover:text-amber-700 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>{t('navDashboard')}</span>
                    </Link>
                    {syncedUser.creatorProfile && (
                      <Link
                        href={`/creator/${syncedUser.id}`}
                        className="px-4 py-2 rounded-xl text-xs font-bold border border-amber-500 text-amber-700 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                      >
                        {t('viewProfile')}
                      </Link>
                    )}
                  </>
                )}

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-1.5 pl-2 border-l border-stone-200 hover:opacity-80 transition-all outline-none"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                      {syncedUser.name ? syncedUser.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                    <span className="text-xs font-semibold text-stone-700 hidden lg:inline-block max-w-[100px] truncate">
                      {syncedUser.name || 'User'}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 shadow-xl rounded-2xl py-2 z-50 text-stone-800">
                      
                      {/* Language section header */}
                      <div className="px-4 py-1.5 text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-rose-500" />
                        Language
                      </div>

                      {/* English option */}
                      <button
                        onClick={() => {
                          if (language !== 'en') toggleLanguage();
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors flex justify-between items-center ${
                          language === 'en' ? 'text-rose-600 bg-rose-50/50' : 'text-stone-750 hover:bg-stone-50'
                        }`}
                      >
                        English
                        {language === 'en' && <span className="text-rose-500">✓</span>}
                      </button>

                      {/* Hindi option */}
                      <button
                        onClick={() => {
                          if (language !== 'hi') toggleLanguage();
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors flex justify-between items-center ${
                          language === 'hi' ? 'text-rose-600 bg-rose-50/50' : 'text-stone-750 hover:bg-stone-50'
                        }`}
                      >
                        हिन्दी
                        {language === 'hi' && <span className="text-rose-500">✓</span>}
                      </button>

                      {/* Divider */}
                      <div className="h-px bg-stone-100 my-1.5" />

                      {/* Logout option */}
                      <button
                        onClick={() => {
                          handleSignOut();
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-black text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                      >
                        <span className="text-sm">🚪</span>
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-stone-700 hover:text-amber-700 text-sm font-semibold px-3 py-2 transition-colors"
                >
                  {t('navLogin')}
                </Link>
                <Link
                  href="/signup"
                  className="btn-premium px-4 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
                >
                  {t('navSignup')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-2">
            {/* Lang toggle for mobile */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-stone-100 text-stone-700 rounded-full border border-stone-200"
            >
              <Globe className="w-3 h-3 text-amber-600" />
              <span>{language === 'en' ? 'हिं' : 'EN'}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 focus:outline-none transition-all"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-stone-200 bg-[#fffdf9]/95 backdrop-blur-md transition-all duration-300">
          <div className="pt-2 pb-4 px-4 space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-xl text-base font-semibold ${
                isActive('/') ? 'bg-amber-50 text-amber-700' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              {t('navHome')}
            </Link>
            <Link
              href="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-xl text-base font-semibold ${
                isActive('/explore') ? 'bg-amber-50 text-amber-700' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              {t('navExplore')}
            </Link>

            {syncedUser?.role === 'admin' && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-base font-semibold text-rose-600 hover:bg-rose-50"
              >
                {t('navAdmin')}
              </Link>
            )}

            {syncedUser ? (
              <div className="pt-4 border-t border-stone-200/80 mt-4 space-y-2">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-amber-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {syncedUser.name ? syncedUser.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-stone-900">{syncedUser.name || 'User'}</div>
                    <div className="text-xs text-stone-500 capitalize">{syncedUser.role}</div>
                  </div>
                </div>
                
                {syncedUser.role === 'creator' && (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2.5 rounded-xl text-base font-semibold text-stone-700 hover:bg-stone-50"
                    >
                      {t('navDashboard')}
                    </Link>
                    {syncedUser.creatorProfile && (
                      <Link
                        href={`/creator/${syncedUser.id}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2.5 rounded-xl text-base font-semibold text-amber-600 hover:bg-amber-50"
                      >
                        {t('viewProfile')}
                      </Link>
                    )}
                  </>
                )}

                <button
                  onClick={handleSignOut}
                  className="w-full text-left block px-3 py-2.5 rounded-xl text-base font-semibold text-rose-600 hover:bg-rose-50"
                >
                  {t('navLogout')}
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-stone-200/80 mt-4 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl font-semibold border border-stone-300 text-stone-700 hover:bg-stone-50"
                >
                  {t('navLogin')}
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center btn-premium py-2.5 rounded-xl font-bold"
                >
                  {t('navSignup')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
