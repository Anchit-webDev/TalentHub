'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, ArrowLeft, ArrowRight, Check, Image as ImageIcon, Link as LinkIcon, Trash2, Plus, Loader2 } from 'lucide-react';

const CATEGORY_OPTIONS = [
  'Singer', 'Dancer', 'Actor', 'Model', 'Makeup Artist', 'Mehndi Artist', 'Tattoo Artist', 'Photographer', 'Graphic Designer', 'Influencer', 'Video Editor', 'Fashion Stylist', 'DJ', 'Rapper', 'Poet', 'Voice Artist', 'Anchor', 'Stand-up Comedian', 'Wedding Vendor', 'Music Producer', 'Choreographer', 'Nail Artist', 'Hair Artist', 'Digital Creator', 'AI Creator', 'Sketch Artist', 'Calligrapher', 'Interior Designer', 'Costume Designer', 'Mimicry Artist', 'Magician', 'Fitness Creator', 'Chef Creator', 'Travel Creator'
];

const CITIES = [
  'Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Goa', 'Chandigarh', 'Lucknow', 'Kochi'
];

interface PortfolioInput {
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'embed';
  caption: string;
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshProfile } = useAuth();
  
  const userId = searchParams.get('userId') || '';
  const initialPhone = searchParams.get('phone') || '';
  const initialName = searchParams.get('name') || '';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [priceRangeMin, setPriceRangeMin] = useState(1000);
  const [priceRangeMax, setPriceRangeMax] = useState(10000);
  const [serviceType, setServiceType] = useState<'booking' | 'content' | 'both'>('booking');
  const [whatsappNumber, setWhatsappNumber] = useState(initialPhone.replace('+91', ''));
  const [instagramUrl, setInstagramUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  // Portfolio items
  const [portfolioItems, setPortfolioItems] = useState<PortfolioInput[]>([
    { mediaUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600', mediaType: 'image', caption: 'Live Show Performance' }
  ]);
  const [newUrl, setNewUrl] = useState('');
  const [newType, setNewType] = useState<'image' | 'video' | 'embed'>('image');
  const [newCaption, setNewCaption] = useState('');

  useEffect(() => {
    if (!userId) {
      setError('A session userId was not found. Please log in or sign up first.');
    }
  }, [userId]);

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const addPortfolioItem = () => {
    if (!newUrl.trim()) return;
    if (portfolioItems.length >= 10) {
      alert('Maximum 10 portfolio items allowed.');
      return;
    }
    
    // Simple youtube/instagram embed-link parsing
    let type = newType;
    let url = newUrl.trim();
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      type = 'video';
    } else if (url.includes('instagram.com')) {
      type = 'embed';
    }

    setPortfolioItems([...portfolioItems, { mediaUrl: url, mediaType: type, caption: newCaption }]);
    setNewUrl('');
    setNewCaption('');
  };

  const removePortfolioItem = (index: number) => {
    setPortfolioItems(portfolioItems.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async () => {
    setError('');
    
    if (selectedCategories.length === 0) {
      setStep(1);
      setError('Please select at least one category.');
      return;
    }
    if (!bio.trim() || bio.trim().length < 20) {
      setStep(2);
      setError('Please provide a bio of at least 20 characters.');
      return;
    }
    if (!city) {
      setStep(2);
      setError('Please select a city.');
      return;
    }
    if (priceRangeMin > priceRangeMax) {
      setStep(2);
      setError('Minimum price cannot exceed maximum price.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        userId,
        name: initialName,
        phone: initialPhone,
        city,
        categories: selectedCategories,
        bio,
        priceRangeMin: Number(priceRangeMin),
        priceRangeMax: Number(priceRangeMax),
        serviceType,
        whatsappNumber: whatsappNumber ? `+91${whatsappNumber}` : null,
        instagramUrl: instagramUrl || null,
        youtubeUrl: youtubeUrl || null,
        portfolioItems,
      };

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Refresh the synced profile in AuthContext
        await refreshProfile();
        // Redirect to dashboard on success
        router.push('/dashboard');
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to complete onboarding. Please try again.');
      }
    } catch (err: any) {
      setError('A network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Progress header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight text-gradient">Set Up Creator Profile</h1>
        <p className="text-sm text-stone-600 mt-1">Let clients know about your skills, fees, and location.</p>
        
        {/* Step Indicator */}
        <div className="flex items-center gap-2 mt-6">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  step === s 
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                    : step > s 
                      ? 'bg-emerald-500 text-white'
                      : 'bg-stone-200 text-stone-600'
                }`}>
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </span>
                <span className={`text-xs font-bold ${step === s ? 'text-stone-900' : 'text-stone-500'}`}>
                  {s === 1 ? 'Categories' : s === 2 ? 'Details' : 'Portfolio'}
                </span>
              </div>
              {s < 3 && <div className={`flex-1 h-0.5 max-w-[60px] mx-2 ${step > s ? 'bg-emerald-500' : 'bg-stone-200'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-100 font-medium">
          {error}
        </div>
      )}

      {/* STEP 1: Categories tag selection */}
      {step === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-md space-y-6">
          <div>
            <h2 className="text-xl font-bold text-stone-900">What skills do you offer?</h2>
            <p className="text-sm text-stone-500 mt-1">Select all categories that apply to you. You can select multiple tags (e.g. Singer and Rapper).</p>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-stone-700 block uppercase tracking-wider">Select Skills to Add</label>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (val && !selectedCategories.includes(val)) {
                    setSelectedCategories([...selectedCategories, val]);
                  }
                  e.target.value = ""; // Reset dropdown
                }}
                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-stone-905 font-bold cursor-pointer transition-all"
              >
                <option value="">-- Choose a skill to add to your profile --</option>
                {CATEGORY_OPTIONS.filter(cat => !selectedCategories.includes(cat)).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Selected tags */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-500 block">Your Selected Skills:</span>
              {selectedCategories.length === 0 ? (
                <div className="text-xs text-stone-400 bg-stone-50/50 p-8 rounded-2xl border border-stone-200 border-dashed text-center font-semibold">
                  No categories selected yet. Use the dropdown selector above to add skills.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-2 bg-amber-50 text-amber-900 border border-amber-250/70 px-4 py-2 rounded-full text-xs font-extrabold shadow-sm animate-scale-up"
                    >
                      <span>{cat}</span>
                      <button
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className="h-4 w-4 bg-amber-200 hover:bg-amber-300 text-amber-800 rounded-full flex items-center justify-center text-[10px] font-black transition-all"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-stone-100">
            <button
              onClick={() => {
                if (selectedCategories.length === 0) {
                  setError('Please pick at least one skill category.');
                } else {
                  setError('');
                  setStep(2);
                }
              }}
              className="btn-premium flex items-center gap-2 py-3 px-6 rounded-2xl font-bold"
            >
              <span>Next: Profile Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: General Bio & Details */}
      {step === 2 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-md space-y-6">
          <div>
            <h2 className="text-xl font-bold text-stone-900">About you & Pricing</h2>
            <p className="text-sm text-stone-500 mt-1">Provide pricing estimates and contact info for bookings.</p>
          </div>

          <div className="space-y-4">
            
            {/* Bio */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Bio Description</label>
              <textarea
                rows={4}
                required
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your style, experience, instruments, training, or notable clients you have worked with..."
                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-stone-950 transition-all resize-none"
              />
              <span className="text-[10px] text-stone-400">Min 20 characters</span>
            </div>

            {/* City & Service Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">City Base</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-stone-950 transition-all font-semibold"
                >
                  <option value="">Select City...</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Service Category Type</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as any)}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-stone-950 transition-all font-semibold"
                >
                  <option value="booking">Booking (Hire for Events/Gigs)</option>
                  <option value="content">Content (Follow/Social Collabs)</option>
                  <option value="both">Both (Gigs & Social Content)</option>
                </select>
              </div>
            </div>

            {/* Pricing range */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Estimated Fee Range (per Event/Project in ₹)</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-stone-500">Minimum Fee (₹)</span>
                  <input
                    type="number"
                    value={priceRangeMin}
                    onChange={(e) => setPriceRangeMin(Number(e.target.value))}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-stone-950 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-stone-500">Maximum Fee (₹)</span>
                  <input
                    type="number"
                    value={priceRangeMax}
                    onChange={(e) => setPriceRangeMax(Number(e.target.value))}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-stone-950 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">WhatsApp Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-500 text-xs font-bold">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-12 pr-3 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Instagram Handle/URL</label>
                <input
                  type="text"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="e.g. instagram.com/profile"
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-stone-950"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">YouTube Channel/URL</label>
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="e.g. youtube.com/@channel"
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-stone-950"
                />
              </div>
            </div>

          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-stone-100">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            
            <button
              onClick={() => {
                if (!bio.trim() || bio.trim().length < 20) {
                  setError('Please fill in a bio description (min 20 characters).');
                } else if (!city) {
                  setError('Please select a city.');
                } else {
                  setError('');
                  setStep(3);
                }
              }}
              className="btn-premium flex items-center gap-2 py-3 px-6 rounded-2xl font-bold"
            >
              <span>Next: Add Portfolio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Portfolio Items */}
      {step === 3 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-md space-y-6">
          <div>
            <h2 className="text-xl font-bold text-stone-900">Your Portfolio / Media Items</h2>
            <p className="text-sm text-stone-500 mt-1">Add links to your videos, posts or insert image URLs. You can display up to 10 items.</p>
          </div>

          <div className="space-y-4">
            {/* Add Portfolio Form */}
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200/60 space-y-3">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Add Media Item</span>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="col-span-1">
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-xs font-bold"
                  >
                    <option value="image">Image (Direct URL)</option>
                    <option value="video">YouTube Video Link</option>
                    <option value="embed">Instagram Post URL</option>
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <input
                    type="text"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder={newType === 'image' ? 'Paste image URL (e.g. unsplash.com/...)' : newType === 'video' ? 'Paste YouTube Link (e.g. youtube.com/watch?v=...)' : 'Paste Instagram post URL'}
                    className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="Item caption (e.g. Dance routine at wedding gig)"
                  className="flex-grow p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-xs"
                />
                <button
                  type="button"
                  onClick={addPortfolioItem}
                  className="flex items-center gap-1 bg-stone-900 text-white hover:bg-stone-850 px-4 py-3 rounded-xl text-xs font-bold transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* List of items */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {portfolioItems.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs border border-dashed border-stone-200 rounded-2xl">
                  No portfolio items added yet. We recommend adding at least one item.
                </div>
              ) : (
                portfolioItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-stone-50 border border-stone-200/80 rounded-2xl gap-3">
                    <div className="flex items-center gap-3 truncate">
                      <span className="p-2 rounded-lg bg-white border border-stone-200 text-amber-600">
                        {item.mediaType === 'image' ? <ImageIcon className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                      </span>
                      <div className="truncate">
                        <div className="text-xs font-bold text-stone-900 truncate">{item.caption || 'No Caption'}</div>
                        <div className="text-[10px] text-stone-500 truncate font-semibold">{item.mediaType.toUpperCase()} • {item.mediaUrl}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePortfolioItem(idx)}
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-stone-100">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-premium flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-bold disabled:opacity-50 min-w-[150px]"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Submit Profile</span>
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
