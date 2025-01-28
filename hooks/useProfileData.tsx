import { useState, useEffect } from 'react';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';

interface UseProfileDataResult {
  profile: ProfileViewBasic | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProfileData(): UseProfileDataResult {
  const [profile, setProfile] = useState<ProfileViewBasic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/profile');
      if (!response.ok) {
        setProfile(null);
        return;
      }

      const data = await response.json();
      setProfile(data.profile);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = async () => {
    await fetchProfile();
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    isLoading,
    error,
    refetch,
  };
}
