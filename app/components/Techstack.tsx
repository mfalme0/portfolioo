
import { SiWindows10, SiWindows11, SiMacos,SiAndroid,SiIos, SiLinux } from 'react-icons/si';
import { FaAws, FaDocker } from 'react-icons/fa';
import { DiMongodb } from 'react-icons/di';
import { RiFirebaseFill } from 'react-icons/ri';
const languages = [
  { name: 'Windows 10', icon: <SiWindows10 className="text-4xl text-sky-600" />, proficiency: 'Expert' },
  { name: 'Windows 11', icon: <SiWindows11 className="text-4xl text-white" />, proficiency: 'Expert' },
  { name: 'MacOs', icon: <SiMacos className="text-4xl text-white" />, proficiency: 'Intermediate' },
  { name: 'Ios', icon: <SiIos className="text-4xl text-white" />, proficiency: 'Expert' },
  { name: 'Android', icon: <SiAndroid className="text-4xl text-lime-500" />, proficiency: 'Advanced' },
  { name: 'Linux', icon: <SiLinux className="text-4xl text-black" />, proficiency: 'Advanced' },
  { name: 'AWS', icon: <FaAws className="text-4xl text-orange-600" />, proficiency: 'intermediate' },
  { name: 'Mongodb', icon: <DiMongodb className="text-4xl text-green-500" />, proficiency: 'Intermediate' },
  { name: 'Firebase', icon: <RiFirebaseFill className="text-4xl text-amber-400" />, proficiency: 'Advanced' },
  {name: 'Docker', icon: <FaDocker className="text-4xl text-blue-600" />, proficiency: "advance"},

];
export default function Techstack() {
  return (
    <div className=" bg-white dark:bg-gray-900 p-8">
      <h1 className="text-3xl font-bold mb-6 text-center  text-gray-500">Techstack</h1>
      <div className="flex flex-wrap justify-center gap-6">
        {languages.map((lang) => (
          <div key={lang.name} className="relative bg-gray-700 p-6 rounded-lg shadow-lg max-w-xs w-full group">
            <div className="flex justify-center mb-4">
              {lang.icon}
            </div>
            <h2 className="text-xl font-semibold text-center text-gray-800">{lang.name}</h2>
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 text-white text-xl font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
              {lang.proficiency}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
