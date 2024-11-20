import React from "react";
import Image from "next/image"; // Next.js optimized image handling
import { Clock, ExternalLink } from "lucide-react";

const steamFriends = [
  {
    id: 1,
    name: "itsfidelgray",
    steamId: "76561199189051141",
    status: "online", // added status field for online indication
  },
  {
    id: 2,
    name: "qubeshex",
    steamId: "76561199042388931",
    status: "in-game",
  },
  {
    id: 3,
    name: "itsfidelgray",
    steamId: "76561199189051141",
    status: "in-game",
  },
  {
    id: 4,
    name: "itsfidelgray",
    steamId: "76561199189051141",
    status: "in-game",
  },
  
];

const SteamFriends = () => {
  const getSteamProfile = (steamId) => `https://steamcommunity.com/profiles/${steamId}`;
 
  return (
    <div className="p-6 max-w-lg mx-auto bg-gray-900 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">The Fam</h2>
        <span className="text-sm text-gray-400">{steamFriends.length} friends</span>
      </div>

      <div className="space-y-4">
        {steamFriends.map((friend) => (
          <a
            key={friend.id}
            href={getSteamProfile(friend.steamId)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-4 bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition duration-300"
          >
            {/* Avatar Section */}
            <div className="relative">

              <div
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${
                  friend.status === "online"
                    ? "bg-green-500"
                    : friend.status === "in-game"
                    ? "bg-blue-500"
                    : "bg-gray-500"
                }`}
              />
            </div>

            {/* Friend Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">{friend.name}</span>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <p className="text-sm text-gray-400">
                {friend.status === "online"
                  ? "Online"
                  : friend.status === "in-game"
                  ? "In Game"
                  : "Offline"}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default SteamFriends;
