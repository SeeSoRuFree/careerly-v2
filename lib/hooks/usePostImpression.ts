'use client';

import { useEffect, useRef } from 'react';

export function usePostImpression(
  postId: number,
  trackImpression: (id: number) => void,
  threshold = 0.5
) {
  const ref = useRef<HTMLDivElement>(null);
  const tracked = useRef(false);

  useEffect(() => {
    if (!ref.current || tracked.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !tracked.current) {
          tracked.current = true;
          trackImpression(postId);
        }
      },
      { threshold }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [postId, trackImpression, threshold]);

  return ref;
}
