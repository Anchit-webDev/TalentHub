'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi';

interface TranslationDictionary {
  [key: string]: {
    en: string;
    hi: string;
  };
}

const translations: TranslationDictionary = {
  // Nav & Layout
  navHome: { en: 'Home', hi: 'होम' },
  navExplore: { en: 'Explore', hi: 'खोजें' },
  navDashboard: { en: 'Dashboard', hi: 'डैशबोर्ड' },
  navLogin: { en: 'Login', hi: 'लॉगिन' },
  navSignup: { en: 'Register', hi: 'रजिस्टर' },
  navLogout: { en: 'Logout', hi: 'लॉगआउट' },
  navAdmin: { en: 'Admin Panel', hi: 'एडमिन पैनल' },
  langToggleLabel: { en: 'हिन्दी', hi: 'English' },

  // Hero Section
  heroTitle: { en: 'Find & Hire India’s Top Creative Talents', hi: 'भारत के सर्वश्रेष्ठ रचनात्मक कलाकारों को खोजें और काम पर रखें' },
  heroSubtitle: { en: 'Connect directly with singers, dancers, makeup artists, mehndi artists, and 30+ other categories. Simple, fast, and verified.', hi: 'गायक, नर्तक, मेकअप आर्टिस्ट, मेहंदी आर्टिस्ट और 30+ अन्य श्रेणियों से सीधे जुड़ें। सरल, तेज़ और सत्यापित।' },
  searchPlaceholder: { en: 'Search by category (e.g. Mehndi Artist, Dancer, Singer...)', hi: 'श्रेणी के अनुसार खोजें (जैसे कि मेहंदी कलाकार, डांसर, गायक...)' },
  searchCityPlaceholder: { en: 'Select City...', hi: 'शहर चुनें...' },
  searchBtn: { en: 'Search', hi: 'खोजें' },

  // How it works
  howItWorksTitle: { en: 'How TalentHub Works', hi: 'टैलेंटहब कैसे काम करता है' },
  howItWorksSubtitle: { en: 'Hire verified creators across India in three simple steps', hi: 'तीन आसान चरणों में भारत भर के सत्यापित रचनाकारों को काम पर रखें' },
  step1Title: { en: '1. Explore Profiles', hi: '1. प्रोफाइल खोजें' },
  step1Desc: { en: 'Browse through 30+ creative categories, view portfolios, photos, and youtube videos.', hi: '30+ रचनात्मक श्रेणियों को ब्राउज़ करें, उनके पोर्टफोलियो, तस्वीरें और यूट्यूब वीडियो देखें।' },
  step2Title: { en: '2. Send Free Inquiry', hi: '2. निःशुल्क पूछताछ भेजें' },
  step2Desc: { en: 'Submit your event date and details. No booking fee or platform commission.', hi: 'अपने इवेंट की तारीख और विवरण सबमिट करें। कोई बुकिंग शुल्क या प्लेटफॉर्म कमीशन नहीं।' },
  step3Title: { en: '3. Deal Directly', hi: '3. सीधे बातचीत करें' },
  step3Desc: { en: 'Once accepted, get the creator’s WhatsApp details and finalize payments off-platform.', hi: 'एक बार स्वीकार होने के बाद, निर्माता के व्हाट्सएप विवरण प्राप्त करें और सीधे भुगतान तय करें।' },

  // Category Names (Dynamic or Static translations)
  categoryTitle: { en: 'Browse by Category', hi: 'श्रेणियों के अनुसार ब्राउज़ करें' },
  singer: { en: 'Singer', hi: 'गायक (Singer)' },
  dancer: { en: 'Dancer', hi: 'नर्तक (Dancer)' },
  actor: { en: 'Actor', hi: 'अभिनेता (Actor)' },
  model: { en: 'Model', hi: 'मॉडल (Model)' },
  'makeup-artist': { en: 'Makeup Artist', hi: 'मेकअप आर्टिस्ट (Makeup Artist)' },
  'mehndi-artist': { en: 'Mehndi Artist', hi: 'मेहंदी कलाकार (Mehndi Artist)' },
  'tattoo-artist': { en: 'Tattoo Artist', hi: 'टैटू कलाकार (Tattoo Artist)' },
  photographer: { en: 'Photographer', hi: 'फोटोग्राफर (Photographer)' },
  'graphic-designer': { en: 'Graphic Designer', hi: 'ग्राफिक डिजाइनर (Graphic Designer)' },
  influencer: { en: 'Influencer', hi: 'इन्फ्लुएंसर (Influencer)' },
  'video-editor': { en: 'Video Editor', hi: 'वीडियो एडिटर (Video Editor)' },
  'fashion-stylist': { en: 'Fashion Stylist', hi: 'फैशन स्टाइलिस्ट (Fashion Stylist)' },
  dj: { en: 'DJ', hi: 'डीजे (DJ)' },
  rapper: { en: 'Rapper', hi: 'रैपर (Rapper)' },
  poet: { en: 'Poet', hi: 'कवि/शायर (Poet)' },
  'voice-artist': { en: 'Voice Artist', hi: 'आवाज कलाकार (Voice Artist)' },
  anchor: { en: 'Anchor/Host', hi: 'एंकर (Anchor)' },
  'stand-up-comedian': { en: 'Stand-up Comedian', hi: 'कॉमेडियन (Stand-up Comedian)' },
  'wedding-vendor': { en: 'Wedding Vendor', hi: 'वेडिंग वेंडर (Wedding Vendor)' },
  'music-producer': { en: 'Music Producer', hi: 'संगीत निर्माता (Music Producer)' },
  choreographer: { en: 'Choreographer', hi: 'कोरियोग्राफर (Choreographer)' },
  'nail-artist': { en: 'Nail Artist', hi: 'नेल आर्टिस्ट (Nail Artist)' },
  'hair-artist': { en: 'Hair Artist', hi: 'हेयर आर्टिस्ट (Hair Artist)' },
  'digital-creator': { en: 'Digital Creator', hi: 'डिजिटल क्रिएटर (Digital Creator)' },
  'ai-creator': { en: 'AI Creator', hi: 'एआई क्रिएटर (AI Creator)' },
  'sketch-artist': { en: 'Sketch Artist', hi: 'स्केच कलाकार (Sketch Artist)' },
  calligrapher: { en: 'Calligrapher', hi: 'कैलीग्राफर (Calligrapher)' },
  'interior-designer': { en: 'Interior Designer', hi: 'इंटीरियर डिजाइनर (Interior Designer)' },
  'costume-designer': { en: 'Costume Designer', hi: 'कॉस्ट्यूम डिजाइनर (Costume Designer)' },
  'mimicry-artist': { en: 'Mimicry Artist', hi: 'मिमिक्री कलाकार (Mimicry Artist)' },
  magician: { en: 'Magician', hi: 'जादूगर (Magician)' },
  'fitness-creator': { en: 'Fitness Creator', hi: 'फिटनेस क्रिएटर (Fitness Creator)' },
  'chef-creator': { en: 'Chef Creator', hi: 'शेफ क्रिएटर (Chef Creator)' },
  'travel-creator': { en: 'Travel Creator', hi: 'ट्रैवल क्रिएटर (Travel Creator)' },

  // General Buttons/Labels
  verifiedBadge: { en: 'Verified Creator', hi: 'सत्यापित कलाकार' },
  startingPrice: { en: 'Price Range', hi: 'मूल्य सीमा' },
  cityLabel: { en: 'City', hi: 'शहर' },
  sendInquiry: { en: 'Send Inquiry', hi: 'पूछताछ भेजें' },
  viewProfile: { en: 'View Profile', hi: 'प्रोफाइल देखें' },
  ratingsCount: { en: 'ratings', hi: 'रेटिंग्स' },
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Load user choice if exists
  useEffect(() => {
    const saved = localStorage.getItem('talenthub_lang') as Language;
    if (saved === 'en' || saved === 'hi') {
      setLanguage(saved);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);
    localStorage.setItem('talenthub_lang', newLang);
  };

  const t = (key: string): string => {
    if (!translations[key]) {
      // Return key formatted nicely if translation is missing
      return key;
    }
    return translations[key][language];
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
