'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CreatorCard from '@/components/CreatorCard';
import { Search, MapPin, SlidersHorizontal, CheckSquare, Square, XCircle, Loader2 } from 'lucide-react';

const CATEGORIES = [
  'Singer', 'Dancer', 'Actor', 'Model', 'Makeup Artist', 'Mehndi Artist', 'Tattoo Artist', 'Photographer', 'Graphic Designer', 'Influencer', 'Video Editor', 'Fashion Stylist', 'DJ', 'Rapper', 'Poet', 'Voice Artist', 'Anchor', 'Stand-up Comedian', 'Wedding Vendor', 'Music Producer', 'Choreographer', 'Nail Artist', 'Hair Artist', 'Digital Creator', 'AI Creator', 'Sketch Artist', 'Calligrapher', 'Interior Designer', 'Costume Designer', 'Mimicry Artist', 'Magician', 'Fitness Creator', 'Chef Creator', 'Travel Creator'
];

const CITIES = [
  'Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Goa', 'Chandigarh', 'Lucknow', 'Kochi'
];

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parsing url search params
  const initialCategory = searchParams.get('category') || '';
  const initialCity = searchParams.get('city') || '';
  const initialVerified = searchParams.get('verified') === 'true';

  // Filters State
  const [category, setCategory] = useState(initialCategory);
  const [city, setCity] = useState(initialCity);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [verified, setVerified] = useState(initialVerified);

  // Result state
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFilteredCreators = () => {
    setLoading(true);
    setError('');

    const params = [];
    if (category) params.push(`category=${encodeURIComponent(category)}`);
    if (city) params.push(`city=${encodeURIComponent(city)}`);
    if (priceMin) params.push(`priceMin=${priceMin}`);
    if (priceMax) params.push(`priceMax=${priceMax}`);
    if (verified) params.push(`verified=true`);

    const queryStr = params.length > 0 ? `?${params.join('&')}` : '';

    fetch(`/api/explore${queryStr}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to load explore directory.');
      })
      .then((data) => {
        setCreators(data.creators || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFilteredCreators();
  }, [category, city, priceMin, priceMax, verified]);

  const clearFilters = () => {
    setCategory('');
    setCity('');
    setPriceMin('');
    setPriceMax('');
    setVerified(false);
    router.push('/explore');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Explore Creators</h1>
        <p className="text-sm text-stone-500 mt-1">Discover, view portfolios, and hire Indian creative talents directly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* 1. Filters Sidebar */}
        <div className="col-span-1 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-6 h-fit sticky top-20">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-amber-500" />
              Filters
            </h2>
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-stone-400 hover:text-stone-750 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-4">
            {/* Category Filter */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold outline-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {/* City Filter */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 block">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold outline-none cursor-pointer"
              >
                <option value="">All Cities</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Price Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">Fee Range (₹)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  placeholder="Min"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold outline-none"
                />
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="Max"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold outline-none"
                />
              </div>
            </div>

            {/* Verified only checkbox */}
            <button
              onClick={() => setVerified(!verified)}
              className="flex items-center gap-2 pt-2 text-stone-700 text-xs font-semibold w-full text-left"
            >
              {verified ? (
                <CheckSquare className="w-4 h-4 text-emerald-600 fill-emerald-50" />
              ) : (
                <Square className="w-4 h-4 text-stone-300" />
              )}
              <span>Verified Profiles Only</span>
            </button>
          </div>

        </div>

        {/* 2. Search Results Grid */}
        <div className="lg:col-span-3 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-100 font-medium">
              {error}
            </div>
          )}

          {loading ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <span className="text-xs font-semibold text-stone-500">Searching creator profiles...</span>
            </div>
          ) : creators.length === 0 ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-stone-200">
              <XCircle className="w-12 h-12 text-stone-350 mb-3" />
              <h3 className="text-base font-bold text-stone-850">No Creators Found</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm">No creators matched your search filters. Try broadening your criteria or resetting filters.</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 border border-stone-250 hover:bg-stone-50 text-stone-700 text-xs font-bold rounded-xl"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {creators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}
