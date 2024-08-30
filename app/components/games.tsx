import { SiCounterstrike, SiThefinals } from "react-icons/si";
import { GiGoose } from "react-icons/gi";
import Image from "next/image";
import NFS from "../../Images/nfs.png"

const games = [
  { name: 'Counter Strike', icon: <SiCounterstrike aria-label="Counter Strike" />, rounds: 'Expert' },
  { name: 'The Finals', icon: <SiThefinals aria-label="The Finals" />, rounds: 'Mid' },
  { name: 'Goose Goose Duck', icon: <GiGoose aria-label="Goose Goose Duck" />, rounds: 'Hectic' },
  { name: 'Need For Speed Unbound', icon: <Image src={NFS} alt="nfs" className="w-auto h-16"/>, round:"medicore" }
];

export function Games() {
  return (
    <div className="bg-slate-50 dark:bg-gray-900 p-8 w-full">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-700 dark:text-gray-200">
        Games I Play
      </h1>
      <div className="flex flex-wrap justify-center gap-8">
        {games.map((game) => (
          <div
            key={game.name}
            className="relative bg-gray-700 dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-xs w-full group hover:shadow-teal-600 hover:scale-105 transition-transform duration-200"
          >
            <div className="flex justify-center mb-4 text-white text-4xl">
              {game.icon}
            </div>
            <h2 className="text-xl font-semibold text-center text-gray-200">
              {game.name}
            </h2>
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 text-white text-xl font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
              {game.rounds}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
