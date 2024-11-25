import { useEffect, useState } from 'react';
import { Agent } from '@atproto/api';

const Dashboard = () => {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const session = JSON.parse(localStorage.getItem('session') || '{}');
      if (!session.access_token) {
        return;
      }

      const agent = new Agent({ service: 'https://bsky.social' });
      agent.setSession(session);

      const result = await agent.getProfile({ actor: agent.accountDid });
      setProfile(result);
    };

    fetchProfile();
  }, []);

  if (!profile) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Welcome, {profile.data.displayName}</h1>
      <p>{profile.data.description}</p>
    </div>
  );
};

export default Dashboard;
