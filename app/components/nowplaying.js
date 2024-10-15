// components/NowPlaying.js
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import auth from './auth.json'


const NowPlaying = () => {
  const [track, setTrack] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        // Replace 'YOUR_ACCESS_TOKEN' with your actual access token
        const accessToken = auth;
        const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.data && response.data.is_playing) {
          setTrack(response.data.item);
        } else {
          setTrack(null);
        }
      } catch (err) {
        setError('Error fetching currently playing track');
      }
    };

    fetchNowPlaying();

    // Poll for track updates every 30 seconds
    const intervalId = setInterval(fetchNowPlaying, 30000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Now Playing</h2>
      {error && <p className="text-red-500">{error}</p>}
      {track ? (
        <div className="flex items-center">
          <Image src={track.album.images[0].url} alt={track.name} className="w-16 h-16 rounded-md mr-4" />
          <div>
            <p className="font-semibold">{track.name}</p>
            <p className="text-sm text-gray-300">{track.artists.map(artist => artist.name).join(', ')}</p>
            <p className="text-sm text-gray-400">{track.album.name}</p>
          </div>
        </div>
      ) : (
        <p className="text-gray-300">Nothing is playing right now.</p>
      )}
    </div>
  );
};

export default NowPlaying;
