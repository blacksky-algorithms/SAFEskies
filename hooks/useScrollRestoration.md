# useScrollRestoration Hook

A React hook that provides automatic scroll position restoration for scrollable containers. Designed for feed navigation where users expect to return to their previous scroll position after viewing individual posts.

## Features

- ✅ **Automatic scroll saving** on user scroll
- ✅ **Smart restoration** with content loading detection
- ✅ **Conditional restore/clear** based on navigation state
- ✅ **Memory leak prevention** with proper timeout cleanup
- ✅ **Multiple retry attempts** for content loading timing
- ✅ **Independent feed support** with unique keys

## Usage

```tsx
import { useScrollRestoration } from '@/hooks/useScrollRestoration';

function FeedComponent({ feedName, isReturningFromPost, isNewFeed }) {
  const { containerRef } = useScrollRestoration({
    key: feedName,           // Unique identifier for this scrollable area
    shouldRestore: isReturningFromPost,  // When to restore scroll position
    shouldClear: isNewFeed,              // When to clear saved position
  });

  return (
    <div ref={containerRef} className="overflow-y-auto">
      {/* Your scrollable content */}
    </div>
  );
}
```

## API

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | `string` | ✅ | Unique identifier for the scrollable area (e.g., feed name) |
| `shouldRestore` | `boolean` | ✅ | When `true`, attempts to restore saved scroll position |
| `shouldClear` | `boolean` | ✅ | When `true`, clears any saved scroll position |

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `containerRef` | `React.RefObject<HTMLElement>` | Ref to attach to your scrollable container |

## How It Works

1. **Scroll Saving**: Automatically saves scroll position to `sessionStorage` on scroll events
2. **Smart Restoration**:
   - Tries immediate restore when `shouldRestore` becomes `true`
   - If content isn't loaded (no scrollable height), retries with timeouts (100ms, 300ms)
   - Validates scroll positions (ignores invalid/negative values)
3. **Cleanup**: Properly cleans up event listeners and timeouts on unmount
4. **Storage**: Uses `sessionStorage` with keys like `scroll-{feedName}`

## Example: Feed Navigation

```tsx
// In your Feed component
const searchParams = useSearchParams();
const uri = searchParams.get('uri'); // Post URI when viewing individual post
const feedName = 'blacksky';

const { containerRef } = useScrollRestoration({
  key: feedName,
  shouldRestore: !!uri,  // Restore when coming back from a post
  shouldClear: !uri,     // Clear when switching feeds or refreshing
});

return (
  <div ref={containerRef} className="overflow-y-auto h-screen">
    {/* Feed posts */}
  </div>
);
```

## Performance Considerations

- Uses `passive: true` for scroll event listeners (non-blocking)
- Debounces via browser's natural scroll event throttling
- Minimal DOM operations (only reads `scrollTop`, `scrollHeight`, `clientHeight`)
- Automatic cleanup prevents memory leaks
- Early exit from restore attempts when successful

## Browser Support

- ✅ Modern browsers with `sessionStorage` support
- ✅ Mobile Safari, Chrome, Firefox
- ✅ Works with custom scroll containers (not just `window`)

## Testing

The hook is fully tested with comprehensive test coverage:

```bash
npm test useScrollRestoration
```

Tests cover:

- Scroll position saving and restoration
- Content loading timing edge cases
- Invalid data handling
- Multi-feed independence
- Memory leak prevention
- Event listener cleanup
