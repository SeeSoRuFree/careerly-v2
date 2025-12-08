# Impression Tracking Hooks

## Usage

### 1. Set up impression tracker at page/layout level

```tsx
'use client';

import { useImpressionTracker } from '@/lib/hooks/useImpressionTracker';

export default function PostsPage() {
  const { trackImpression } = useImpressionTracker();

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} trackImpression={trackImpression} />
      ))}
    </div>
  );
}
```

### 2. Track individual post impressions

```tsx
'use client';

import { usePostImpression } from '@/lib/hooks/usePostImpression';

interface PostCardProps {
  post: Post;
  trackImpression: (id: number) => void;
}

export function PostCard({ post, trackImpression }: PostCardProps) {
  const ref = usePostImpression(post.id, trackImpression, 0.5);

  return (
    <article ref={ref}>
      <h3>{post.title}</h3>
      <p>{post.content}</p>
    </article>
  );
}
```

## Features

- **Batching**: Automatically batches impressions (max 10 or every 3 seconds)
- **Deduplication**: Tracks each post ID only once per session
- **Auth-aware**: Only tracks when user is authenticated
- **Beacon fallback**: Uses `sendBeacon` on page unload for reliability
- **IntersectionObserver**: Tracks when 50% of post is visible (configurable)

## Configuration

Edit `/lib/hooks/useImpressionTracker.ts`:

```typescript
const FLUSH_INTERVAL = 3000;  // milliseconds
const MAX_QUEUE_SIZE = 10;    // impressions
```

Edit threshold when calling `usePostImpression`:

```typescript
const ref = usePostImpression(post.id, trackImpression, 0.7); // 70% visible
```
