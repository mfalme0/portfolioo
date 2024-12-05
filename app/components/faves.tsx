import { FaSpotify, FaGamepad, FaTv, FaFilm, FaTwitch } from "react-icons/fa";
import { SiCounterstrike } from "react-icons/si";
import { GiGoose } from "react-icons/gi";
import gkmc from '@/Images/gkmc.jpg';
import tybw from '@/Images/tybw.jpg';
import inter from '@/Images/landscape.jpg';
import Image from "next/image";
import fazar from '@/Images/fazar.png';
import jay from '@/Images/jay.png';
import gnx from '@/Images/gnx.jpg'
import tdoss from '@/Images/tdoss.jpg'
import supes from '@/Images/supes.png'
import silo from '@/Images/silo.jpg'
import akira from '@/Images/akira.jpg'
import bl from '@/Images/bl.jpg'
import jack from '@/Images/jack.jpg'
import congito from '@/Images/congito.jpg'
import titans from '@/Images/titans.jpg'
import tdk from '@/Images/tdk.jpg'


interface MyFaves {
  title: string;
  artistOrStudio: string;
  icon: JSX.Element; // Use JSX element for the icon
  category: 'Album' | 'Game' | 'TV Show' | 'Movie' | 'Streamer';
  url: string;
}

const goodshit: MyFaves[] = [
  {
    title: 'Counter Strike',
    artistOrStudio: 'Valve',
    icon: <SiCounterstrike className="text-6xl" aria-label="Counter Strike" />,
    category: 'Game',
    url: 'https://www.counter-strike.net/',
  },
  {
    title: 'Goose Goose Duck',
    artistOrStudio: 'Gaggle Studios, inc',
    icon: <GiGoose className="text-6xl" aria-label="Goose Goose Duck" />,
    category: 'Game',
    url: 'https://gaggle.fun/goose-goose-duck',
  },
  {
    title: 'good kid, m.A.A.d city',
    artistOrStudio: 'Kendrick Lamar',
    icon: <Image src={gkmc} alt="good kid, m.A.A.d city" className="w-auto " />,
    category: 'Album',
    url: 'https://open.spotify.com/album/748dZDqSZy6aPXKcI9H80u',
  },
  {
    title: 'Bleach',
    artistOrStudio: 'Studio Pierrot',
    icon: <Image src={tybw} alt="Bleach" className="w-auto " />,
    category: 'TV Show',
    url: 'https://www.crunchyroll.com/series/G63VGG2NY/bleach',
  },
  {
    title: 'Interstellar',
    artistOrStudio: 'Paramount Pictures',
    icon: <Image src={inter} alt="Interstellar" className="w-auto " />,
    category: 'Movie',
    url: 'https://www.max.com/si/en/movies/interstellar/aa5b9295-8f9c-44f5-809b-3f2b84badfbf',
  },
  {
    title: 'Fazar7',
    artistOrStudio: 'Fazar',
    icon: <Image src={fazar} alt="Fazar7" className="w-auto " />,
    category: 'Streamer',
    url: 'https://twitch.tv/fazar7',
  },
  {
    title: 'JaminJayz',
    artistOrStudio: 'Jay',
    icon: <Image src={jay} alt="JaminJayz" className="w-auto " />,
    category: 'Streamer',
    url: 'https://twitch.tv/jaminjayz',
  },
  {
    title: 'GNX',
    artistOrStudio: 'Kendrick Lamar',
    icon: <Image src={gnx} alt="gnx" className="w-auto " />,
    category: 'Album',
    url: 'https://open.spotify.com/album/0hvT3yIEysuuvkK73vgdcW?si=700c43a896314437',
  },
  {
    title: 'The Death of Slim Shady (Coup de Grâce)',
    artistOrStudio: 'Eminem',
    icon: <Image src={tdoss} alt="tdoss" className="w-auto " />,
    category: 'Album',
    url: 'https://open.spotify.com/album/3kjHLu1pL7tdY88GFwEkl6?si=1bf0d549952540f1',
  },
  {
    title: 'SuperMan Unbound',
    artistOrStudio: 'DC Comics',
    icon: <Image src={supes} alt="superman" className="w-auto " />,
    category: 'Movie',
    url: 'https://www.max.com/si/en/movies/super-man-unbound/aa5b9295-8f9c-44f5-809b-3f2b84badfbf',
  },
  {
    title: 'Silo',
    artistOrStudio: 'Apple',
    icon: <Image src={silo} alt="silo" className="w-auto " />,
    category: 'TV Show',
    url: 'https://www.apple.com/tv/',
  },
{
  title: 'Akira',
  artistOrStudio: 'Katsuhiro Otomo',
  icon: <Image src={akira} alt="akira" className="w-auto " />,
  category: 'Movie',
  url: 'https://www.bytowne.ca/movies/drawn-in-akira/',
},
{
  title: 'Black Lagoon',
  artistOrStudio: 'Studio Ghibli',
  icon: <Image src={bl} alt="black lagoon" className="w-auto " />,
  category: 'TV Show',
  url: 'https://www.crunchyroll.com/series/GYW4D0M86/black-lagoon?',
},
{
  title: 'Samurai Jack',
  artistOrStudio: 'Genndy Tartakovsky',
  icon: <Image src={jack} alt="samurai jack" className="w-auto " />,
  category: 'TV Show',
  url: 'https://www.adultswim.com/videos/samurai-jack',
},
{
  title: 'Inside Job',
  artistOrStudio: 'Netflix',
  icon: <Image src={congito} alt="inside job" className="w-auto " />,
  category: 'TV Show',
  url: 'https://www.netflix.com/title/80995819',
},
{
  title: 'Teen Titans: Trouble in Tokyo',
  artistOrStudio: 'Warner Bros',
  icon: <Image src={titans} alt="teen titans" className="w-auto " />,
  category: 'Movie',
  url: 'https://www.max.com/si/en/movies/teen-titans-trouble-in-tokyo/aa5b9295-8f9c-44f5-809b-3f2b84badfbf',
},
{
  title: 'The Dark Knight Rises',
  artistOrStudio: 'Warner Bros',
  icon: <Image src={tdk} alt="dark knight" className="w-auto " />,
  category: 'Movie',
  url: 'https://www.youtube.com/watch?v=g8evyE9TuYk',
},
];

const getcatanimations = (category: string) => {
  switch (category) {
    case 'Album':
      return 'transition-transform duration-500 hover:scale-105';
    case 'Game':
      return 'transition-opacity duration-700 hover:opacity-75';
    case 'TV Show':
      return 'transition-transform duration-500 hover:translate-y-2';
    case 'Movie':
      return 'transition-all duration-700 hover:rotate-3';
    case 'Streamer':
      return 'transition duration-500 hover:scale-105 hover:rotate-1';
    default:
      return '';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Album':
      return <FaSpotify className="text-green-500 " />;
    case 'Game':
      return <FaGamepad className="text-blue-500" />;
    case 'TV Show':
      return <FaTv className="text-red-500" />;
    case 'Movie':
      return <FaFilm className="text-yellow-500" />;
    case 'Streamer':
      return <FaTwitch className="text-purple-700" />;
    default:
      return null;
  }
};

export default function Myshit() {
  // Get unique categories
  const uniqueCategories = Array.from(new Set(goodshit.map(item => item.category)));

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-200">
        My Favourites
      </h2>
      {uniqueCategories.map((category) => (
        <div key={category} className="mb-10">
          <h3 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
          {getCategoryIcon(category)}
          <span className="ml-2">{category}</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {goodshit
              .filter((item) => item.category === category)
              .map((item, index) => (
                <a
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative overflow-hidden rounded-lg shadow-lg bg-grey-400 hover:shadow-2xl transform ${getcatanimations(item.category)}`}
                >
                  <div className="flex justify-center items-center h-60 bg-gray-200 dark:bg-gray-800">
                    {item.icon}
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <div className="flex items-center space-x-2 text-white">
                      {getCategoryIcon(item.category)}
                      <p className="text-lg font-semibold">{item.title}</p>
                    </div>
                    <p className="text-sm text-gray-300">{item.artistOrStudio}</p>
                  </div>
                </a>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
