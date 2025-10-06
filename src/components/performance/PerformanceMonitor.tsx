'use client';

import { useEffect } from 'react';

interface PerformanceMonitorProps {
  routeName: string;
}

export function PerformanceMonitor({ routeName }: PerformanceMonitorProps) {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;

    // Measure Core Web Vitals
    const measureWebVitals = () => {
      // First Contentful Paint (FCP)
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            console.log(`[${routeName}] FCP: ${entry.startTime}ms`);
            // Send to analytics service
            // analytics.track('web_vital', { metric: 'FCP', value: entry.startTime, route: routeName });
          }
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log(`[${routeName}] LCP: ${lastEntry.startTime}ms`);
        // analytics.track('web_vital', { metric: 'LCP', value: lastEntry.startTime, route: routeName });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        console.log(`[${routeName}] CLS: ${clsValue}`);
        // analytics.track('web_vital', { metric: 'CLS', value: clsValue, route: routeName });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as PerformanceEventTiming;
          const fid = fidEntry.processingStart - fidEntry.startTime;
          console.log(`[${routeName}] FID: ${fid}ms`);
          // analytics.track('web_vital', { metric: 'FID', value: fid, route: routeName });
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Time to Interactive (TTI) approximation
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const navEntry = entry as PerformanceNavigationTiming;
          const loadTime = navEntry.loadEventEnd - navEntry.fetchStart;
          console.log(`[${routeName}] Load Time: ${loadTime}ms`);
          // analytics.track('performance', { metric: 'load_time', value: loadTime, route: routeName });
        }
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });

      // Cleanup observers after 30 seconds
      setTimeout(() => {
        fcpObserver.disconnect();
        lcpObserver.disconnect();
        clsObserver.disconnect();
        fidObserver.disconnect();
        navigationObserver.disconnect();
      }, 30000);
    };

    // Start measuring when the page is loaded
    if (document.readyState === 'complete') {
      measureWebVitals();
    } else {
      window.addEventListener('load', measureWebVitals);
    }

    return () => {
      window.removeEventListener('load', measureWebVitals);
    };
  }, [routeName]);

  // This component doesn't render anything
  return null;
}