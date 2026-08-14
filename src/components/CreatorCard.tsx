import React from 'react';
import Link from 'next/link';
import { Star, MapPin, CheckCircle2, MessageCircle } from 'lucide-react';

export interface CreatorCardProps {
  creator: {
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
  };
}

// Default images mapping to render stunning context-specific covers
const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  'singer': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600',
  'dancer': 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600',
  'makeup artist': 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=600',
  'mehndi artist': 'https://images.unsplash.com/photo-1590075865003-e48277faa558?q=80&w=600',
  'photographer': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600',
  'dj': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600',
  'wedding vendor': 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600',
  'music producer': 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600',
  'nail artist': 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=600',
  'hair artist': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600',
  'digital creator': 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=600',
  'sketch artist': 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600',
};

const CreatorCard: React.FC<CreatorCardProps> = ({ creator }) => {
  const profile = creator.creatorProfile;
  if (!profile) return null;

  // Resolve cover image from portfolio items, or default categories, or standard fallback
  const firstPortfolioImage = profile.portfolioItems?.find(item => item.mediaType === 'image')?.mediaUrl;
  let coverImage = firstPortfolioImage || '';

  if (!coverImage) {
    const mainCategory = profile.categories[0]?.toLowerCase() || '';
    coverImage = DEFAULT_CATEGORY_IMAGES[mainCategory] || 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600';
  }

  // Build WhatsApp share string
  const contactPhone = profile.whatsappNumber || '';
  const cleanPhone = contactPhone.replace(/\D/g, '');
  const whatsappUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(creator.name || 'there')},%20I%20saw%20your%20profile%20on%20TalentHub%20and%20wanted%20to%20inquire%20about%20your%20services!`
    : null;

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 hover:border-pink-300 hover:shadow-xl hover:shadow-pink-500/5 transition-all duration-300 overflow-hidden flex flex-col group h-full relative">
      
      {/* 1. Visual Card Header */}
      <div className="h-48 w-full overflow-hidden relative bg-stone-100 flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverImage}
          alt={creator.name || 'Creator profile'}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {profile.verified ? (
            <span className="bg-emerald-500/95 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
              <CheckCircle2 className="w-3.5 h-3.5 fill-white text-emerald-500" />
              VERIFIED
            </span>
          ) : <div />}

          <div className="flex items-center gap-1 bg-white/95 text-stone-900 px-2 py-0.5 rounded-lg text-xs font-black shadow-md">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{creator.averageRating && creator.averageRating > 0 ? creator.averageRating.toFixed(1) : 'New'}</span>
            {creator.reviewsCount && creator.reviewsCount > 0 ? (
              <span className="text-stone-400 font-medium">({creator.reviewsCount})</span>
            ) : null}
          </div>
        </div>

        {/* Location & Name Overlay at the bottom of the Image */}
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <div className="flex items-center gap-1 text-[11px] font-bold text-pink-200 uppercase tracking-widest drop-shadow-sm">
            <MapPin className="w-3 h-3 flex-shrink-0 text-pink-300" />
            <span>{profile.city || creator.city || 'India'}</span>
          </div>
          <h3 className="font-extrabold text-lg mt-0.5 truncate drop-shadow-md">
            {creator.name || 'Creative Professional'}
          </h3>
        </div>
      </div>

      {/* 2. Details Body */}
      <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
        
        <div className="space-y-3">
          {/* Category Pill tags */}
          <div className="flex flex-wrap gap-1.5">
            {profile.categories.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="bg-stone-50 text-stone-650 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-stone-200"
              >
                {tag}
              </span>
            ))}
            {profile.categories.length > 3 && (
              <span className="bg-stone-50 text-stone-500 px-2 py-1 rounded-lg text-[9px] font-bold border border-stone-150">
                +{profile.categories.length - 3} more
              </span>
            )}
          </div>

          {/* Bio (Truncated) */}
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-medium">
            {profile.bio}
          </p>
        </div>

        {/* Pricing & CTA Buttons */}
        <div className="border-t border-stone-100 pt-4 flex flex-col space-y-3">
          
          <div className="flex justify-between items-baseline">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Estimated Budget</span>
            <div className="text-sm font-black text-rose-600">
              ₹{profile.priceRangeMin.toLocaleString('en-IN')} <span className="text-stone-400 font-semibold text-[10px]">onwards</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              href={`/creator/${creator.id}`}
              className="w-full text-center py-2.5 text-xs font-bold text-stone-700 hover:text-white bg-stone-100 hover:bg-stone-900 border border-stone-200 rounded-xl transition-all"
            >
              View Profile
            </Link>

            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                WhatsApp
              </a>
            ) : (
              <Link
                href={`/creator/${creator.id}`}
                className="w-full py-2.5 text-xs font-bold text-white btn-premium rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
              >
                Inquire
              </Link>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default CreatorCard;
