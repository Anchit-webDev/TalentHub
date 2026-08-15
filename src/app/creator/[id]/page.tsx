'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Star, MapPin, CheckCircle2, Calendar, Phone, ArrowLeft, MessageSquare, Plus, Loader2, Send, Heart, Play, MessageCircle, Info, ExternalLink } from 'lucide-react';

interface CreatorDetails {
  creator: {
    id: string;
    name: string | null;
    city: string | null;
    phone: string | null;
    profile: {
      categories: string[];
      bio: string;
      city: string;
      priceRangeMin: number;
      priceRangeMax: number;
      serviceType: string;
      verified: boolean;
      instagramUrl: string | null;
      youtubeUrl: string | null;
      whatsappNumber: string | null;
      portfolioItems: Array<{
        id: string;
        mediaUrl: string;
        mediaType: 'image' | 'video' | 'embed';
        caption: string | null;
      }>;
    };
  };
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    clientName: string;
  }>;
  canReview: boolean;
  eligibleInquiryId: string;
}

const getYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Gallery default sets to fill the 5-photo layout with premium thematic visuals
const DEFAULT_CREATOR_GALLERIES: Record<string, string[]> = {
  'singer': [
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600',
    'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=600',
    'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=600',
    'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=600',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=600'
  ],
  'dancer': [
    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600',
    'https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=600',
    'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?q=80&w=600',
    'https://images.unsplash.com/photo-1535525153412-5a42439a210d?q=80&w=600',
    'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=600'
  ],
  'makeup artist': [
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=600',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=600',
    'https://images.unsplash.com/photo-1515688594390-b649af70d282?q=80&w=600',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600'
  ],
  'mehndi artist': [
    'https://images.unsplash.com/photo-1590075865003-e48277faa558?q=80&w=600',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600',
    'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?q=80&w=600',
    'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=600',
    'https://images.unsplash.com/photo-1590075865003-e48277faa558?q=80&w=800'
  ],
  'photographer': [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600',
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=600',
    'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=600',
    'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?q=80&w=600',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600'
  ],
};

const DEFAULT_FALLBACK_GALLERY = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=600',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600',
  'https://images.unsplash.com/photo-1519225495810-7517c319b53e?q=80&w=600',
  'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=600'
];

export default function CreatorProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { syncedUser } = useAuth();

  const [data, setData] = useState<CreatorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inquiryError, setInquiryError] = useState('');
  const [reviewError, setReviewError] = useState('');

  // Active Tab state
  const [activeTab, setActiveTab] = useState<'about' | 'portfolio' | 'pricing' | 'reviews'>('about');

  // Booking Form State
  const [selectedCategory, setSelectedCategory] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const fetchCreatorDetails = () => {
    const clientIdParam = syncedUser ? `&clientId=${syncedUser.id}` : '';
    fetch(`/api/creator?id=${id}${clientIdParam}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Creator profile not found.');
      })
      .then((creatorData) => {
        setData(creatorData);
        if (creatorData.creator.profile.categories.length > 0) {
          setSelectedCategory(creatorData.creator.profile.categories[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCreatorDetails();
  }, [id, syncedUser]);

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syncedUser) {
      router.push('/login');
      return;
    }
    
    setInquiryError('');
    setSendingInquiry(true);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: id,
          clientId: syncedUser.id,
          category: selectedCategory,
          eventDate: eventDate || null,
          message: inquiryMessage,
        }),
      });

      if (res.ok) {
        setInquirySuccess(true);
        setInquiryMessage('');
        setEventDate('');
      } else {
        setInquiryError('Failed to submit booking inquiry. Please try again.');
      }
    } catch (err) {
      setInquiryError('A network error occurred.');
    } finally {
      setSendingInquiry(false);
    }
  };

  const handleSendReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.eligibleInquiryId) return;

    setReviewError('');
    setSubmittingReview(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiryId: data.eligibleInquiryId,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      if (res.ok) {
        setReviewSuccess(true);
        setReviewComment('');
        // Reload details to update review feed and recalculate average
        fetchCreatorDetails();
      } else {
        setReviewError('Failed to submit review.');
      }
    } catch (err) {
      setReviewError('Error submitting review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-2 bg-stone-50/20">
        <Loader2 className="w-9 h-9 animate-spin text-rose-500" />
        <span className="text-xs font-bold text-stone-500 font-heading">Loading verified storefront...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-stone-900 font-heading">Storefront Not Found</h2>
        <p className="text-sm text-stone-500 font-medium">{error || 'This creator profile is invalid or deactivated.'}</p>
        <Link href="/explore" className="btn-premium inline-block py-3 px-8 rounded-2xl text-xs font-bold shadow-md">
          Back to Explore Directory
        </Link>
      </div>
    );
  }

  const { creator, reviews, canReview } = data;
  const profile = creator.profile;

  // Resolve cover gallery (exactly 5 photos for standard mosaic grid)
  const portfolioImages = profile.portfolioItems
    .filter(item => item.mediaType === 'image')
    .map(item => item.mediaUrl);

  const mainCategoryKey = profile.categories[0]?.toLowerCase() || '';
  const defaultImages = DEFAULT_CREATOR_GALLERIES[mainCategoryKey] || DEFAULT_FALLBACK_GALLERY;

  const resolvedGallery: string[] = [];
  for (let i = 0; i < 5; i++) {
    resolvedGallery.push(portfolioImages[i] || defaultImages[i] || DEFAULT_FALLBACK_GALLERY[i]);
  }

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  // Build WhatsApp share string
  const contactPhone = profile.whatsappNumber || creator.phone || '';
  const cleanPhone = contactPhone.replace(/\D/g, '');
  const whatsappUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(creator.name || 'there')},%20I%20saw%2520your%20portfolio%20on%20TalentHub%20and%20wanted%20to%20hire%20you!`
    : null;

  return (
    <div className="bg-[#fffdf9] pb-24">
      
      {/* 1. Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 flex items-center justify-between">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>
        <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider hidden sm:inline">
          {profile.categories[0]} &gt; {profile.city} &gt; {creator.name}
        </span>
      </div>

      {/* 2. WeddingBazaar 5-Photo Mosaic Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[260px] md:h-[400px] rounded-3xl overflow-hidden shadow-sm relative group/gallery">
          {/* Main big image on the left (spans 2 columns, full height) */}
          <div className="md:col-span-2 h-full w-full relative overflow-hidden bg-stone-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolvedGallery[0]}
              alt="Main Portfolio"
              className="w-full h-full object-cover hover:scale-102 transition-transform duration-500"
            />
          </div>

          {/* Grid of 4 smaller images on the right */}
          <div className="hidden md:grid grid-cols-2 col-span-2 gap-2 h-full">
            {resolvedGallery.slice(1, 5).map((img, idx) => (
              <div key={idx} className="h-full w-full relative overflow-hidden bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`Portfolio Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>

          {/* Gallery floating count */}
          <div className="absolute bottom-4 right-4 bg-stone-900/80 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none">
            {portfolioImages.length > 0 ? `${portfolioImages.length} Photos` : 'Thematic Gallery'}
          </div>
        </div>
      </div>

      {/* 3. Main Detail Layout (2-Column Grid) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Column A: Information tabs & Content (Left side, spans 2) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Storefront Identity Title Header */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                {profile.verified ? (
                  <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 fill-white text-emerald-500" />
                    VERIFIED PARTNER
                  </span>
                ) : (
                  <span className="bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    VERIFICATION PENDING
                  </span>
                )}
                <span className="bg-rose-50 border border-rose-250 text-rose-800 text-[10px] font-black px-2.5 py-1 rounded-full">
                  POPULAR CREATIVE
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-950 tracking-tight leading-tight">
                {creator.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-stone-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-stone-400 flex-shrink-0" />
                  {profile.city || creator.city || 'India'}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                  Rating: <span className="text-stone-900 font-bold">{averageRating > 0 ? averageRating.toFixed(1) : 'New'}</span>
                  {reviews.length > 0 && <span className="text-stone-400 font-semibold">({reviews.length} Reviews)</span>}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {profile.categories.map((c) => (
                  <span
                    key={c}
                    className="bg-stone-100 text-stone-800 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-stone-200"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Navigation Tabs Ribbon */}
            <div className="border-b border-stone-200 flex gap-4 overflow-x-auto scrollbar-none pt-2">
              {[
                { id: 'about', label: 'About' },
                { id: 'pricing', label: 'Services & Pricing' },
                { id: 'portfolio', label: 'Portfolio Showcase' },
                { id: 'reviews', label: `Reviews (${reviews.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3.5 text-sm font-extrabold border-b-2 whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'border-rose-500 text-rose-600 font-black scale-102'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab viewport container */}
            <div className="space-y-6">
              
              {/* Tab 1: About */}
              {activeTab === 'about' && (
                <div className="space-y-6 animate-scale-up">
                  {/* Bio */}
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
                    <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest flex items-center gap-2">
                      <Info className="w-4 h-4 text-rose-500" />
                      About {creator.name}
                    </h3>
                    <p className="text-sm text-stone-650 leading-relaxed font-medium whitespace-pre-line">
                      {profile.bio}
                    </p>
                  </div>

                  {/* Quick Profile attributes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center gap-3">
                      <span className="text-2xl">🌍</span>
                      <div>
                        <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Service Mode</div>
                        <div className="text-xs font-bold text-stone-850">
                          {profile.serviceType === 'booking' ? 'Event Bookings Only' : profile.serviceType === 'content' ? 'Digital Content / Gigs' : 'Event Bookings & Content'}
                        </div>
                      </div>
                    </div>

                    {profile.instagramUrl && (
                      <a
                        href={profile.instagramUrl.startsWith('http') ? profile.instagramUrl : `https://${profile.instagramUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center gap-3 hover:border-pink-300 transition-colors"
                      >
                        <span className="text-2xl">📸</span>
                        <div>
                          <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Instagram</div>
                          <div className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
                            <span>Instagram Handle</span>
                            <ExternalLink className="w-3 h-3 text-stone-400" />
                          </div>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Pricing */}
              {activeTab === 'pricing' && (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-sm space-y-6 animate-scale-up">
                  <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest border-b border-stone-100 pb-2">Estimated Price List</h3>
                  
                  <div className="space-y-4">
                    {profile.categories.map((cat, idx) => (
                      <div key={cat} className="flex justify-between items-center p-4 bg-stone-50 rounded-2xl border border-stone-150">
                        <div>
                          <h4 className="text-sm font-bold text-stone-900">{cat} Packages</h4>
                          <p className="text-[11px] text-stone-400 font-semibold mt-0.5">Professional, personalized delivery by creator.</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-stone-400 font-bold uppercase tracking-wider">Starting From</div>
                          <div className="text-sm font-black text-rose-600">
                            ₹{profile.priceRangeMin.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/50 flex gap-3 text-xs text-amber-900 font-medium">
                    <span className="text-lg">💡</span>
                    <p className="leading-relaxed">
                      Pricing rates indicated above are estimated price quotes. Exact rates can vary based on event duration, travel needs, and custom demands. Send an inquiry or chat directly on WhatsApp to request a custom quote.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 3: Portfolio */}
              {activeTab === 'portfolio' && (
                <div className="space-y-6 animate-scale-up">
                  {profile.portfolioItems.length === 0 ? (
                    <div className="py-16 text-center text-stone-400 text-xs bg-white border border-dashed border-stone-250 rounded-3xl shadow-sm">
                      This creator hasn't uploaded any media items yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {profile.portfolioItems.map((item) => {
                        const isYoutube = item.mediaType === 'video' && getYoutubeId(item.mediaUrl);
                        
                        return (
                          <div key={item.id} className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm group">
                            {/* Media frame */}
                            <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
                              {isYoutube ? (
                                <iframe
                                  className="w-full h-full"
                                  src={`https://www.youtube.com/embed/${getYoutubeId(item.mediaUrl)}`}
                                  title={item.caption || 'YouTube Video'}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              ) : item.mediaType === 'image' ? (
                                <img
                                  src={item.mediaUrl}
                                  alt={item.caption || 'Portfolio Showcase'}
                                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="p-4 text-center text-white text-xs flex flex-col items-center gap-2">
                                  <Play className="w-8 h-8 text-rose-500" />
                                  <span>Embed Media Link</span>
                                </div>
                              )}
                            </div>

                            {/* Caption info */}
                            {item.caption && (
                              <div className="p-3 border-t border-stone-100 bg-stone-50/50">
                                <p className="text-xs font-semibold text-stone-700 leading-tight truncate">{item.caption}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Reviews */}
              {activeTab === 'reviews' && (
                <div className="space-y-6 animate-scale-up">
                  
                  {/* Rating breakdown summary header */}
                  <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-6 justify-between">
                    <div className="text-center sm:text-left space-y-1">
                      <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Average Rating</div>
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <span className="text-3xl font-black text-stone-900">{averageRating > 0 ? averageRating.toFixed(1) : '0.0'}</span>
                        <div className="flex items-center text-amber-500">
                          <Star className="w-5 h-5 fill-amber-500" />
                        </div>
                      </div>
                      <p className="text-xs text-stone-500 font-semibold">Based on {reviews.length} verified ratings</p>
                    </div>

                    <div className="h-px w-full sm:h-12 sm:w-px bg-stone-150" />

                    <div className="text-center sm:text-right">
                      <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Review policy</div>
                      <p className="text-xs text-stone-500 font-semibold leading-relaxed mt-1 max-w-xs">
                        Only clients who have booked this creator through TalentHub can submit verified reviews.
                      </p>
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {reviews.length === 0 ? (
                      <div className="py-12 text-center text-stone-400 text-xs bg-white border border-dashed border-stone-250 rounded-3xl shadow-sm">
                        No reviews have been written for this creator yet.
                      </div>
                    ) : (
                      reviews.map((rev) => (
                        <div key={rev.id} className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xs font-black text-stone-900">{rev.clientName || 'Anonymous Client'}</h4>
                              <span className="text-[9px] text-stone-400 font-semibold">{new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-0.5 bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded text-xs font-bold border border-amber-100 flex-shrink-0">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              <span>{rev.rating}</span>
                            </div>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed font-semibold">{rev.comment}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Write a review (Verified check) */}
                  {canReview && (
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-md space-y-4">
                      <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-rose-500" />
                        Write a Verified Review
                      </h3>

                      {reviewSuccess ? (
                        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-100">
                          Thank you! Your verified review has been submitted successfully.
                        </div>
                      ) : (
                        <form onSubmit={handleSendReview} className="space-y-4">
                          {reviewError && (
                            <div className="p-3 bg-rose-50 text-rose-800 text-xs font-bold rounded-2xl border border-rose-100 text-center">
                              {reviewError}
                            </div>
                          )}
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-stone-600 block">Rating (1 to 5 Stars)</label>
                            <div className="flex items-center gap-1.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReviewRating(star)}
                                  className="p-1 hover:scale-110 transition-transform"
                                >
                                  <Star
                                    className={`w-6 h-6 ${
                                      star <= reviewRating
                                        ? 'text-amber-500 fill-amber-500'
                                        : 'text-stone-200'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-stone-600 block">Comment / Review Details</label>
                            <textarea
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              rows={4}
                              required
                              placeholder="Describe your event booking experience..."
                              className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none text-xs text-stone-900 font-medium"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={submittingReview}
                            className="btn-premium px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                          >
                            {submittingReview ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            Submit Review
                          </button>
                        </form>
                      )}
                    </div>
                  )}

                </div>
              )}

            </div>

          </div>

          {/* Column B: Sticky Contact / Inquiry Form & Pricing Widget (Right side, spans 1) */}
          <div id="inquiry-widget" className="space-y-6 lg:sticky lg:top-8 scroll-mt-20">
            
            <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-lg space-y-6">
              {/* Price Tag Header */}
              <div className="space-y-1">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Estimated Service Fee</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-rose-600">₹{profile.priceRangeMin.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-stone-400 font-semibold">onwards</span>
                </div>
                <span className="text-[10px] text-stone-500 font-bold block mt-0.5">*(No Commission / Booking fees)*</span>
              </div>

              <div className="border-t border-stone-100 pt-4 space-y-4">
                
                {/* Inquiry Form Success Box */}
                {inquirySuccess ? (
                  <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-2xl border border-emerald-100 text-center space-y-2">
                    <span className="text-xl block">🎉</span>
                    <h5 className="font-bold">Inquiry Sent Successfully!</h5>
                    <p className="text-[10px] text-emerald-700 leading-normal">
                      The creator has been notified. They will contact you shortly to confirm availability and discuss pricing.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSendInquiry} className="space-y-4">
                    {inquiryError && (
                      <div className="p-3 bg-rose-50 text-rose-800 text-[10px] font-bold rounded-xl border border-rose-100 text-center">
                        {inquiryError}
                      </div>
                    )}
                    <h4 className="text-xs font-black text-stone-900 uppercase tracking-widest">Send Booking Inquiry</h4>
                    
                    {/* Select Category Tag */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-600 uppercase">Service Required</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full p-3 bg-stone-50 border border-stone-250 rounded-xl outline-none text-xs text-stone-800 font-bold cursor-pointer focus:border-rose-500"
                      >
                        {profile.categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Date Picker */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-600 uppercase">Event Date (Optional)</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          className="w-full p-3 bg-stone-50 border border-stone-250 rounded-xl outline-none text-xs text-stone-800 font-semibold focus:border-rose-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Message Box */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-600 uppercase">Message details</label>
                      <textarea
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                        rows={3}
                        required
                        placeholder="Detail your event location, timings, and expectations..."
                        className="w-full p-3 bg-stone-50 border border-stone-250 rounded-xl outline-none text-xs text-stone-800 font-medium focus:border-rose-500"
                      />
                    </div>

                    {/* Action button */}
                    <button
                      type="submit"
                      disabled={sendingInquiry}
                      className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      {sendingInquiry ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      {syncedUser ? 'Send Booking Inquiry' : 'Login to Send Inquiry'}
                    </button>
                  </form>
                )}

                {/* Direct WhatsApp Call Action */}
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                    Chat Directly on WhatsApp
                  </a>
                )}
              </div>
            </div>

            {/* Quick Vendor Policy Card */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 flex gap-3 text-xs text-stone-550 font-semibold leading-relaxed">
              <span className="text-base flex-shrink-0">🛡️</span>
              <p>
                <strong>TalentHub Security Guard</strong>: We never act as brokers. All communications, contracts, and deposits occur directly between you and the creator.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar for Mobile Screen Actions */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 z-40 flex gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <MessageCircle className="w-4 h-4 fill-white text-emerald-650" />
            WhatsApp
          </a>
        )}
        <button
          onClick={() => {
            const widget = document.getElementById('inquiry-widget');
            widget?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`${whatsappUrl ? 'flex-1' : 'w-full'} py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm text-center`}
        >
          Send Inquiry
        </button>
      </div>

    </div>
  );
}
