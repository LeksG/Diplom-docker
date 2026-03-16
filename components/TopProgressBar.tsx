'use client';

import NextTopLoader from 'nextjs-toploader';

export default function TopProgressBar() {
  return (
    <NextTopLoader
      color="#0700cc" 
      initialPosition={0.08}
      crawlSpeed={200}
      height={3} 
      crawl={true}
      showSpinner={false} 
      easing="ease"
      speed={200}
      shadow="0 0 10px #cc0000,0 0 5px #cc0000"
      zIndex={1600} 
    />
  );
}