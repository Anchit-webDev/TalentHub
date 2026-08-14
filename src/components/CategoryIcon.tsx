'use client';

import React from 'react';
import * as Lucide from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className }) => {
  // Safe lookup for the icon component from Lucide bundle
  const IconComponent = (Lucide as any)[name];
  
  if (!IconComponent) {
    // Default fallback icon
    return <Lucide.Sparkles className={className} />;
  }
  
  return <IconComponent className={className} />;
};

export default CategoryIcon;
