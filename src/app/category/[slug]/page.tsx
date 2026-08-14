'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import CreatorCard from '@/components/CreatorCard';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowLeft, Loader2, Award, Sparkles, SlidersHorizontal, CheckCircle2 } from 'lucide-react';

interface Creator {
  id: string;
  name: string | null;
  city: string | null;
  creatorProfile: {
    categories: string[];
    bio: string;
    city: string;
    priceRangeMin: number;
    priceRangeMax: number;
    serviceType: string;
    verified: boolean;
    whatsappNumber?: string | null;
    portfolioItems?: {
      id: string;
      mediaUrl: string;
      mediaType: string;
      caption?: string | null;
    }[];
  } | null;
  averageRating?: number;
  reviewsCount?: number;
}

const CITIES = [
  'Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Goa', 'Chandigarh', 'Lucknow', 'Kochi'
];

const CATEGORY_SEO_COPY: Record<string, { title: string; desc: string; tip: string }> = {
  'singer': {
    title: 'Hire Top Singers in India for Live Gigs & Events',
    desc: 'Unleash the magic of live music! From classical vocalists and acoustic musicians to Bollywood cover artists, discover and hire talented singers for weddings, corporate galas, private concerts, or music festivals.',
    tip: 'Review audio quality and previous stage recordings in their portfolios before sending booking requests.'
  },
  'dancer': {
    title: 'Book Professional Dancers & Performers',
    desc: 'Make your events spectacular with high-energy dance performances! Connect with Indian classical dancers, hip-hop crews, contemporary performers, and Bollywood dancers for choreographies and stage performances.',
    tip: 'Check out their video gallery to see their synchrony and performance quality.'
  },
  'makeup-artist': {
    title: 'Hire Experienced Bridal & Party Makeup Artists',
    desc: 'Look stunning on your special day. Discover professional makeup artists in India specializing in bridal makeup, cinematic HD styling, fashion shoots, prosthetic makeup, and glamorous party touch-ups.',
    tip: 'Compare bridal vs party portfolios and check if hair styling is included in their services.'
  },
  'mehndi-artist': {
    title: 'Find Elite Bridal Mehndi Artists in India',
    desc: 'Exquisite designs for your special day! Hire top-rated Mehndi artists specializing in traditional Marwari, contemporary Arabic, intricate Mandala, and customized bridal portraits to adorn your hands.',
    tip: 'Submit inquiries 2-3 months in advance during major wedding seasons (November - February).'
  },
  'photographer': {
    title: 'Hire Professional Wedding & Portrait Photographers',
    desc: 'Preserve your precious moments forever. Book verified photographers specializing in pre-wedding shoots, cinematic wedding films, fashion portfolios, baby showers, and product photography.',
    tip: 'Ask if raw files are provided and inquire about delivery timelines for edited albums.'
  },
  'stand-up-comedian': {
    title: 'Book Hilarious Stand-up Comedians for Shows',
    desc: 'Add double doses of laughter to your events! Book popular and local stand-up comedians for corporate gigs, college fests, private parties, or open mic events.',
    tip: 'Discuss target audiences and age-appropriateness of the comedy content beforehand.'
  },
  'wedding-vendor': {
    title: 'Find Premier Wedding Vendors and Decorators',
    desc: 'Plan your dream wedding stress-free. Book wedding planners, stage decorators, catering experts, shell decorators, and lights coordinators direct and commission-free.',
    tip: 'Always detail the venue dimensions and themes when requesting inquiries.'
  }
};

const DEFAULT_SEO_COPY = {
  title: 'Hire Verified Creative Professionals in India',
  desc: 'Discover talented creators for bookings, collaborations, and projects. Review portfolios, check estimated pricing, and contact creators directly via WhatsApp.',
  tip: 'Look for the green verified badge indicating manual verification approval by our moderation team.'
};

export default function CategoryLandingPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { t } = useLanguage();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter and Sort states
  const [filterVerified, setFilterVerified] = useState(false);
  const [selectedCityFilter, setSelectedCityFilter] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'none'>('none');

  // Get readable category name
  const rawCatName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const displayName = t(slug) !== slug ? t(slug) : rawCatName;

  const seo = CATEGORY_SEO_COPY[slug] || {
    title: `Hire Best ${displayName}s in India | TalentHub`,
    desc: `Looking for top-tier ${displayName}s? ${DEFAULT_SEO_COPY.desc}`,
    tip: DEFAULT_SEO_COPY.tip
  };

  useEffect(() => {
    setLoading(true);
    // Fetch creators in this category tag
    fetch(`/api/explore?category=${encodeURIComponent(rawCatName)}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to load category listings.');
      })
      .then((data) => {
        setCreators(data.creators || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug, rawCatName]);

  // Apply filters and sorting in memory
  const filteredCreators = creators
    .filter(c => {
      if (filterVerified && !c.creatorProfile?.verified) return false;
      if (selectedCityFilter && c.creatorProfile?.city.toLowerCase() !== selectedCityFilter.toLowerCase()) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') {
        return (b.averageRating || 0) - (a.averageRating || 0);
      }
      if (sortBy === 'price') {
        return (a.creatorProfile?.priceRangeMin || 0) - (b.creatorProfile?.priceRangeMin || 0);
      }
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Breadcrumbs */}
      <div className="flex flex-col gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Home
        </Link>
        <div className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">
          Marketplace &gt; {displayName}s {selectedCityFilter ? `&gt; ${selectedCityFilter}` : ''}
        </div>
      </div>

      {/* SEO Banner */}
      <section className="bg-gradient-to-br from-rose-500/5 via-pink-500/5 to-transparent p-6 sm:p-10 rounded-3xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row gap-8 items-start justify-between">
        <div className="space-y-4 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-rose-800 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
            <Sparkles className="w-3.5 h-3.5 text-rose-700" />
            Verified Storefront Profiles
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
            {seo.title} {selectedCityFilter && `in ${selectedCityFilter}`}
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed font-medium">
            {seo.desc}
          </p>
        </div>

        {/* Booking Tips Card */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm max-w-xs space-y-2 flex-shrink-0">
          <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            Booking Tip
          </h4>
          <p className="text-[11px] text-stone-500 leading-relaxed font-semibold">
            {seo.tip}
          </p>
        </div>
      </section>

      {/* Interactive Filters Ribbon */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-stone-200/85 shadow-sm text-xs">
        <div className="flex items-center gap-1 text-stone-500 font-bold uppercase tracking-wider mr-2">
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters:</span>
        </div>
        
        {/* City Filter */}
        <select
          value={selectedCityFilter}
          onChange={(e) => setSelectedCityFilter(e.target.value)}
          className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-700 outline-none cursor-pointer hover:bg-stone-100 transition-all"
        >
          <option value="">All Cities / Locations</option>
          {CITIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Verified Switcher */}
        <button
          onClick={() => setFilterVerified(!filterVerified)}
          className={`px-4 py-2 rounded-xl border font-bold transition-all ${
            filterVerified
              ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm'
              : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
          }`}
        >
          Verified Only
        </button>

        <div className="h-4 w-px bg-stone-200 mx-2 hidden lg:block" />
        
        <div className="text-stone-500 font-bold uppercase tracking-wider mr-2">Sort:</div>

        {/* Sort Buttons */}
        <button
          onClick={() => setSortBy(sortBy === 'rating' ? 'none' : 'rating')}
          className={`px-4 py-2 rounded-xl border font-bold transition-all ${
            sortBy === 'rating'
              ? 'bg-rose-500 border-rose-600 text-white shadow-sm'
              : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
          }`}
        >
          Highest Rating
        </button>

        <button
          onClick={() => setSortBy(sortBy === 'price' ? 'none' : 'price')}
          className={`px-4 py-2 rounded-xl border font-bold transition-all ${
            sortBy === 'price'
              ? 'bg-rose-500 border-rose-600 text-white shadow-sm'
              : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
          }`}
        >
          Price: Low to High
        </button>
      </div>

      {/* Creators Grid section */}
      <section className="space-y-6">
        <div className="flex justify-between items-center border-b border-stone-150 pb-3">
          <h2 className="text-lg font-bold text-stone-900">
            Available {displayName}s ({filteredCreators.length})
          </h2>
          <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">
            {selectedCityFilter ? `Matching ${selectedCityFilter}` : 'Across India'}
          </span>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-100 font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            <span className="text-xs font-semibold text-stone-500 font-heading">Loading verified storefronts...</span>
          </div>
        ) : filteredCreators.length === 0 ? (
          <div className="text-center py-20 bg-stone-50 border border-stone-200 border-dashed rounded-3xl p-8 space-y-4">
            <p className="text-sm text-stone-500 max-w-md mx-auto font-medium">
              We couldn't find any registered {displayName}s matching the selected filters.
            </p>
            <button
              onClick={() => {
                setFilterVerified(false);
                setSelectedCityFilter('');
                setSortBy('none');
              }}
              className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold shadow-md hover:bg-stone-850 transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCreators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
