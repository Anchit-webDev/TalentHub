'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Link as LinkIcon, Loader2, CheckCircle } from 'lucide-react';

interface PortfolioInput {
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'embed';
  caption: string;
}

const CITIES = [
  'Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Goa', 'Chandigarh', 'Lucknow', 'Kochi'
];

const EditProfilePage: React.FC = () => {
  const router = useRouter();
  const { syncedUser, loading: authLoading, refreshProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form states
  const [categories, setCategories] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [priceRangeMin, setPriceRangeMin] = useState(0);
  const [priceRangeMax, setPriceRangeMax] = useState(0);
  const [serviceType, setServiceType] = useState('booking');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  // Portfolio items
  const [portfolioItems, setPortfolioItems] = useState<PortfolioInput[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [newType, setNewType] = useState<'image' | 'video' | 'embed'>('image');
  const [newCaption, setNewCaption] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!syncedUser) {
      router.push('/login');
      return;
    }

    // Fetch active profile details
    fetch(`/api/auth/profile?userId=${syncedUser.id}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to load profile details.');
      })
      .then((data) => {
        const u = data.user;
        const p = u.creatorProfile;

        if (!p) {
          router.push('/onboarding');
          return;
        }

        setCategories(p.categories || []);
        setBio(p.bio || '');
        setCity(p.city || '');
        setPriceRangeMin(p.priceRangeMin || 0);
        setPriceRangeMax(p.priceRangeMax || 0);
        setServiceType(p.serviceType || 'booking');
        setWhatsappNumber(p.whatsappNumber ? p.whatsappNumber.replace('+91', '') : '');
        setInstagramUrl(p.instagramUrl || '');
        setYoutubeUrl(p.youtubeUrl || '');
        
        // Fetch portfolio items
        return fetch(`/api/portfolio?creatorId=${syncedUser.id}`);
      })
      .then((res) => {
        if (res && res.ok) return res.json();
        return { items: [] };
      })
      .then((portData) => {
        if (portData && portData.items) {
          setPortfolioItems(portData.items.map((i: any) => ({
            mediaUrl: i.mediaUrl,
            mediaType: i.mediaType,
            caption: i.caption,
          })));
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [syncedUser, authLoading, router]);

  const addPortfolioItem = () => {
    if (!newUrl.trim()) return;
    if (portfolioItems.length >= 10) {
      alert('Maximum 10 portfolio items allowed.');
      return;
    }

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    if (!bio.trim() || bio.trim().length < 20) {
      setError('Bio must be at least 20 characters.');
      setSaving(false);
      return;
    }
    if (!city) {
      setError('Please select a city.');
      setSaving(false);
      return;
    }
    if (priceRangeMin > priceRangeMax) {
      setError('Minimum fee cannot exceed maximum fee.');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        userId: syncedUser?.id,
        name: syncedUser?.name,
        phone: syncedUser?.phone,
        city,
        categories,
        bio,
        priceRangeMin,
        priceRangeMax,
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
        setSuccess(true);
        await refreshProfile();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to save changes.');
      }
    } catch (err) {
      setError('A network error occurred.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Edit Profile & Portfolio</h1>
          <p className="text-xs text-stone-500">Update your bio, pricing details, and portfolio media</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-100 font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-sm rounded-2xl border border-emerald-100 font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 animate-bounce" />
          Profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form Details */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-2">Creator Info</h3>
            
            {/* Bio */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 block">Bio Description</label>
              <textarea
                rows={5}
                required
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your style, experience..."
                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-stone-950 resize-none transition-all"
              />
            </div>

            {/* City & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">City Base</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-stone-950 font-semibold"
                >
                  <option value="">Select City...</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">Service Type</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-stone-950 font-semibold"
                >
                  <option value="booking">Booking (Hire for Events)</option>
                  <option value="content">Content (Collabs / Following)</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>

            {/* Price ranges */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 block">Pricing Range (₹)</label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  value={priceRangeMin}
                  onChange={(e) => setPriceRangeMin(Number(e.target.value))}
                  className="p-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  placeholder="Min Fee"
                />
                <input
                  type="number"
                  value={priceRangeMax}
                  onChange={(e) => setPriceRangeMax(Number(e.target.value))}
                  className="p-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  placeholder="Max Fee"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-2">Socials & WhatsApp</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">WhatsApp</label>
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
                <label className="text-xs font-bold text-stone-700 block">Instagram Handle</label>
                <input
                  type="text"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="instagram.com/profile"
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">YouTube Link</label>
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="youtube.com/@channel"
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Portfolio Editor */}
        <div className="col-span-1 space-y-6">
          
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-2">Portfolio</h3>
            
            {/* Add media block */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-3">
              <span className="text-xs font-bold text-stone-700">Add Item</span>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-bold"
              >
                <option value="image">Image (Direct URL)</option>
                <option value="video">YouTube Link</option>
                <option value="embed">Instagram URL</option>
              </select>
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="Link / URL"
                className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs outline-none"
              />
              <input
                type="text"
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                placeholder="Caption"
                className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs outline-none"
              />
              <button
                type="button"
                onClick={addPortfolioItem}
                className="w-full flex items-center justify-center gap-1 bg-stone-900 hover:bg-stone-800 text-white py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {portfolioItems.length === 0 ? (
                <div className="text-center py-6 text-stone-400 text-xs border border-dashed border-stone-200 rounded-xl">
                  No portfolio items.
                </div>
              ) : (
                portfolioItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-stone-50 border border-stone-200 rounded-xl gap-2 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="p-1.5 rounded bg-white border border-stone-150 text-amber-600 flex-shrink-0">
                        {item.mediaType === 'image' ? <ImageIcon className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
                      </span>
                      <div className="truncate">
                        <div className="font-bold text-stone-900 truncate">{item.caption || 'No Caption'}</div>
                        <div className="text-[10px] text-stone-500 truncate">{item.mediaType}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePortfolioItem(idx)}
                      className="p-1 text-stone-400 hover:text-red-500 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full btn-premium flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold shadow-md disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Changes</span>
              </>
            )}
          </button>

        </div>

      </form>

    </div>
  );
};

export default EditProfilePage;
