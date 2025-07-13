# Hooks

Custom React hooks used throughout the SAFEskies application.

## Available Hooks

- **[`useScrollRestoration`](./useScrollRestoration.md)** - Automatic scroll position restoration for feed navigation
- **`usePaginatedFeed`** - Feed data fetching with infinite scroll pagination
- **`usePullToRefresh`** - Pull-to-refresh functionality for mobile devices
- **`useModeration`** - Moderation actions and post reporting functionality
- **`useIntersectionObserver`** - Intersection observer for infinite scroll triggering
- **`useDebounce`** - Debounce values for search and input handling

## Testing

All hooks are thoroughly tested. Run tests with:

```bash
npm test hooks/
```
