'use client';

import React from 'react';
import MobileNav from '@/components/fm/MobileNav';

/**
 * Layout-level mobile navigation wrapper.
 * Visible only on mobile (flex md:hidden).
 * On the main page, tab-based navigation is used.
 * On other pages, route-based navigation is used.
 */
export default function LayoutMobileNav() {
  return (
    <MobileNav />
  );
}
