import { SiCounterstrike, SiThefinals } from "react-icons/si";
import { GiGoose } from "react-icons/gi";
import Image from "next/image";
import NFS from "../../Images/nfs.png";

const games = [
  { name: 'Counter Strike', icon: <SiCounterstrike aria-label="Counter Strike" />, rounds: 'Expert' },
  { name: 'The Finals', icon: <SiThefinals aria-label="The Finals" />, rounds: 'Mid' },
  { name: 'Goose Goose Duck', icon: <GiGoose aria-label="Goose Goose Duck" />, rounds: 'Hectic' },
  { name: 'Need For Speed Unbound', icon: <Image src={NFS} alt="Need For Speed" className="w-auto h-16" />, rounds: "Mediocre" }
];

export function Games() {
  return (
    <div className="py-10">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-gray-200">
        Games I Play
      </h1>
      <div className="flex flex-wrap justify-center gap-10">
        {games.map((game) => (
          <div
            key={game.name}
            className="relative bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6 rounded-lg shadow-md max-w-xs w-full group transition-transform duration-300 hover:shadow-lg hover:scale-105"
          >
            <div className="flex justify-center mb-4 text-gray-600 dark:text-gray-300 text-5xl transition-colors duration-300 group-hover:text-purple-600">
              {game.icon}
            </div>
            <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-200">
              {game.name}
            </h2>
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 text-white text-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
              {game.rounds}
            </div>
            <div className="absolute bottom-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
