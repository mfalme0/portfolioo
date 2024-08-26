import { BsMicrosoft, BsGoogle } from "react-icons/bs";

const jobo = [
  { name: 'Microsoft', icon: <BsMicrosoft />, rounds: '7' },
  { name: 'Google', icon: <BsGoogle />, rounds: '2' }
];

export function Rejection() {
  return (
    <div className="bg-slate-50 dark:bg-gray-900 p-8 w-full">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-700 dark:text-gray-200">
        Companies I Have Been Rejected From
      </h1>
      <div className="flex flex-wrap justify-center gap-6">
        {jobo.map((job) => (
          <div
            key={job.name}
            className="relative bg-gray-700 dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-xs w-full group hover:shadow-orange-600 hover:scale-105 transition-transform duration-200"
          >
            <div className="flex justify-center mb-4 text-white text-4xl">
              {job.icon}
            </div>
            <h2 className="text-xl font-semibold text-center text-gray-200">
              {job.name}
            </h2>
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 text-white text-xl font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
              {job.rounds}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
