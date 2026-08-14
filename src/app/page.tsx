'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import CategoryIcon from '@/components/CategoryIcon';
import { Search, MapPin, Sparkles, Star, Shield, ArrowRight } from 'lucide-react';

const CATEGORIES = [
  { name: 'Singer', slug: 'singer', icon: 'Music' },
  { name: 'Dancer', slug: 'dancer', icon: 'Footprints' },
  { name: 'Actor', slug: 'actor', icon: 'Clapperboard' },
  { name: 'Model', slug: 'model', icon: 'Camera' },
  { name: 'Makeup Artist', slug: 'makeup-artist', icon: 'Sparkles' },
  { name: 'Mehndi Artist', slug: 'mehndi-artist', icon: 'Flower2' },
  { name: 'Tattoo Artist', slug: 'tattoo-artist', icon: 'PenTool' },
  { name: 'Photographer', slug: 'photographer', icon: 'Camera' },
  { name: 'Graphic Designer', slug: 'graphic-designer', icon: 'Palette' },
  { name: 'Influencer', slug: 'influencer', icon: 'Users' },
  { name: 'Video Editor', slug: 'video-editor', icon: 'Video' },
  { name: 'Fashion Stylist', slug: 'fashion-stylist', icon: 'Shirt' },
  { name: 'DJ', slug: 'dj', icon: 'Disc' },
  { name: 'Rapper', slug: 'rapper', icon: 'Mic' },
  { name: 'Poet', slug: 'poet', icon: 'BookOpen' },
  { name: 'Voice Artist', slug: 'voice-artist', icon: 'Volume2' },
  { name: 'Anchor', slug: 'anchor', icon: 'Megaphone' },
  { name: 'Stand-up Comedian', slug: 'stand-up-comedian', icon: 'Laugh' },
  { name: 'Wedding Vendor', slug: 'wedding-vendor', icon: 'Heart' },
  { name: 'Music Producer', slug: 'music-producer', icon: 'Sliders' },
  { name: 'Choreographer', slug: 'choreographer', icon: 'Compass' },
  { name: 'Nail Artist', slug: 'nail-artist', icon: 'Sparkles' },
  { name: 'Hair Artist', slug: 'hair-artist', icon: 'Scissors' },
  { name: 'Digital Creator', slug: 'digital-creator', icon: 'Laptop' },
  { name: 'AI Creator', slug: 'ai-creator', icon: 'Cpu' },
  { name: 'Sketch Artist', slug: 'sketch-artist', icon: 'Brush' },
  { name: 'Calligrapher', slug: 'calligrapher', icon: 'Pen' },
  { name: 'Interior Designer', slug: 'interior-designer', icon: 'Home' },
  { name: 'Costume Designer', slug: 'costume-designer', icon: 'Scissors' },
  { name: 'Mimicry Artist', slug: 'mimicry-artist', icon: 'Smile' },
  { name: 'Magician', slug: 'magician', icon: 'Wand2' },
  { name: 'Fitness Creator', slug: 'fitness-creator', icon: 'Dumbbell' },
  { name: 'Chef Creator', slug: 'chef-creator', icon: 'Utensils' },
  { name: 'Travel Creator', slug: 'travel-creator', icon: 'Plane' },
];

const CITIES = [
  'Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Goa', 'Chandigarh', 'Lucknow', 'Kochi'
];

export default function HomePage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    let path = '/explore';
    const params = [];
    
    if (searchQuery.trim()) {
      params.push(`category=${encodeURIComponent(searchQuery.trim())}`);
    }
    if (selectedCity) {
      params.push(`city=${encodeURIComponent(selectedCity)}`);
    }

    if (params.length > 0) {
      path += `?${params.join('&')}`;
    }
    router.push(path);
  };

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative gradient-hero py-24 px-4 overflow-hidden border-b border-stone-200/50">
        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-rose-500/25 text-rose-100 text-xs font-black rounded-full border border-rose-400/30 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-rose-300" />
            100% Commission Free Creative Marketplace
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl mx-auto drop-shadow-md">
            {t('heroTitle')}
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-stone-200 max-w-3xl mx-auto leading-relaxed drop-shadow-sm font-medium">
            {t('heroSubtitle')}
          </p>

          {/* WeddingBazaar styled select form */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto flex flex-col md:flex-row gap-3 bg-white p-4 rounded-3xl border border-stone-200/40 shadow-2xl">
            
            {/* Category select dropdown */}
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <select
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 bg-transparent text-sm text-stone-700 outline-none font-bold cursor-pointer"
              >
                <option value="">Select Category (e.g. Mehndi Artist, Singer)</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.slug} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            {/* Divider line */}
            <div className="hidden md:block w-px bg-stone-200 my-2" />

            {/* City select dropdown */}
            <div className="flex items-center gap-2 px-3 md:max-w-[220px]">
              <MapPin className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full py-2 bg-transparent text-sm text-stone-700 outline-none font-bold cursor-pointer"
              >
                <option value="">Select City</option>
                {CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="btn-premium px-10 py-3.5 rounded-2xl text-sm font-black shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              Search Professionals
            </button>
          </form>

          {/* Badges/USPs */}
          <div className="flex flex-wrap justify-center items-center gap-6 pt-4 text-xs font-bold text-stone-200">
            <span className="flex items-center gap-1.5 drop-shadow-sm">
              <Shield className="w-4 h-4 text-emerald-400" /> Verified Portfolios
            </span>
            <span className="flex items-center gap-1.5 drop-shadow-sm">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Direct WhatsApp Chats
            </span>
            <span className="flex items-center gap-1.5 drop-shadow-sm">
              💸 Zero Brokerage Fees
            </span>
          </div>

        </div>

        {/* Decorative background shapes */}
        <div className="absolute top-1/2 left-0 w-72 h-72 rounded-full bg-pink-300/20 blur-3xl -translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-12 right-0 w-80 h-80 rounded-full bg-amber-200/25 blur-3xl translate-x-1/3" />
      </section>

      {/* 2. Grid of Categories */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">{t('categoryTitle')}</h2>
          <p className="text-sm text-stone-500">Connecting creative talents across 30+ service industries</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group bg-white p-5 rounded-2xl border border-stone-200/70 hover:border-amber-400 hover:shadow-md transition-all flex flex-col items-center text-center gap-3 relative overflow-hidden"
            >
              {/* Icon Container */}
              <div className="h-12 w-12 rounded-xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center text-amber-600 transition-colors">
                <CategoryIcon name={cat.icon} className="w-6 h-6 transform group-hover:scale-110 transition-transform duration-200" />
              </div>
              <span className="text-xs font-bold text-stone-850 group-hover:text-amber-700 transition-colors">
                {t(cat.slug)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. How it works section */}
      <section id="how-it-works" className="bg-stone-50 border-y border-stone-200/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">{t('howItWorksTitle')}</h2>
            <p className="text-sm text-stone-500">{t('howItWorksSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-3xl border border-stone-250/70 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-stone-900">{t('step1Title')}</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {t('step1Desc')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-3xl border border-stone-250/70 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-stone-900">{t('step2Title')}</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {t('step2Desc')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-3xl border border-stone-250/70 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-stone-900">{t('step3Title')}</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {t('step3Desc')}
              </p>
            </div>

          </div>

          <div className="text-center">
            <Link
              href="/explore"
              className="btn-premium inline-flex items-center gap-2 py-3 px-8 rounded-full text-sm font-bold shadow-md"
            >
              <span>Browse Creators Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
