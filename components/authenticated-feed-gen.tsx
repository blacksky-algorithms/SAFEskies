'use client';

import { useEffect, useState } from 'react';

export const AuthenticatedFeedGen = ({ actorUri }: { actorUri: string }) => {
  const [data, setData] = useState<{ feeds: []; error: string | null }>({
    feeds: [],
    error: null,
  });

  useEffect(() => {
    const fetchFeedData = async (uri: string) => {
      try {
        const response = await fetch(
          `/api/actor-feeds?actor=${encodeURIComponent(uri)}`
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const result = await response.json();
        setData({ feeds: result, error: null });
      } catch (err) {
        console.error(err);

        setData({ feeds: [], error: 'Failed to fetch feed generator data.' });
      }
    };
    fetchFeedData(actorUri);
  }, []);

  if (!actorUri) {
    return <p>Feed URI is required.</p>;
  }

  return (
    <div>
      {data.error && <p className='error'>{data.error}</p>}
      {data && <pre>{JSON.stringify(data.feeds, null, 2)}</pre>}
    </div>
  );
};
