// pages/programming-languages.js

import { FaJava, FaPython, FaJs, FaReact, FaNodeJs, FaHtml5, FaCss3Alt } from 'react-icons/fa';
import { SiCsharp, SiFlutter, SiKotlin,SiNextdotjs,SiCplusplus } from 'react-icons/si';
import { FaVuejs } from 'react-icons/fa';
const languages = [
  { name: 'Java', icon: <FaJava className="text-4xl text-white-800" />, proficiency: 'Expert' },
  { name: 'Python', icon: <FaPython className="text-4xl text-white-800" />, proficiency: 'Intermediate' },
  { name: 'JavaScript', icon: <FaJs className="text-4xl text-yellow-400" />, proficiency: 'Expert' },
  { name: 'React', icon: <FaReact className="text-4xl text-blue-600" />, proficiency: 'Advanced' },
  { name: 'Node.js', icon: <FaNodeJs className="text-4xl text-green-700" />, proficiency: 'Advanced' },
  { name: 'HTML5', icon: <FaHtml5 className="text-4xl text-orange-600" />, proficiency: 'Expert' },
  { name: 'CSS3', icon: <FaCss3Alt className="text-4xl text-blue-500" />, proficiency: 'Advanced' },
  { name: 'C#', icon: <SiCsharp className="text-4xl text-violet-500" />, proficiency: 'Expert' },
  { name: 'Flutter', icon: <SiFlutter className="text-4xl text-sky-400" />, proficiency: 'Advanced' },
  { name: 'Kotlin', icon: <SiKotlin className="text-4xl text-blue-500" />, proficiency: 'Advanced' },
  { name: 'NextJS', icon: <SiNextdotjs className="text-4xl text-black" />, proficiency: 'Expert' },
  { name: 'C++', icon: <SiCplusplus className="text-4xl text-blue-500" />, proficiency: 'Advanced' },
  { name: 'VueJS', icon: <FaVuejs className="text-4xl text-blue-500" />, proficiency: 'Advanced' },
];

export default function ProgrammingLanguages() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <h1 className="text-3xl font-bold mb-6 text-center  text-gray-500">Languages I am familiar with</h1>
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
