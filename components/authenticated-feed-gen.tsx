'use client';

import { useEffect, useState } from 'react';

export const AuthenticatedFeedGen = ({ actorUri }: { actorUri: string }) => {
  const [data, setData] = useState<{
    feeds: [];
    error: string | null;
    isFetching: boolean;
  }>({
    feeds: [],
    error: null,
    isFetching: true,
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

        setData({ feeds: result.feeds, error: null, isFetching: false });
      } catch (err) {
        console.error(err);

        setData({
          feeds: [],
          error: 'Failed to fetch feed generator data.',
          isFetching: false,
        });
      }
    };
    fetchFeedData(actorUri);
  }, []);

  if (!actorUri) {
    return <p>Feed URI is required.</p>;
  }

  if (data.isFetching) {
    return <p>Fetching your feeds...</p>;
  }

  return (
    <div>
      {data.error && <p className='error'>{data.error}</p>}
      {data &&
        data.feeds.map((feed: any) => (
          <div key={feed.did}>
            <h2>Feed name:{feed.displayName}</h2>
            <p>Created by: @{feed.creator.handle}</p>
            <p>Description: {feed.description}</p>
          </div>
        ))}
    </div>
  );
};
