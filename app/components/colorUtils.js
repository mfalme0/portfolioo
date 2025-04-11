// colorUtils.js
export const getColorClasses = (colorName, isHovered) => {
    const colorMap = {
      blue: {
        bg: isHovered ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800',
        icon: isHovered ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400',
        border: isHovered ? 'border-blue-200 dark:border-blue-800' : 'border-gray-200 dark:border-gray-700',
        proficiency: 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200',
        title: isHovered ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'
      },
      indigo: {
        bg: isHovered ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-white dark:bg-gray-800',
        icon: isHovered ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400',
        border: isHovered ? 'border-indigo-200 dark:border-indigo-800' : 'border-gray-200 dark:border-gray-700',
        proficiency: 'bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200',
        title: isHovered ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-800 dark:text-gray-200'
      },
      purple: {
        bg: isHovered ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-white dark:bg-gray-800',
        icon: isHovered ? 'text-purple-500 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400',
        border: isHovered ? 'border-purple-200 dark:border-purple-800' : 'border-gray-200 dark:border-gray-700',
        proficiency: 'bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200',
        title: isHovered ? 'text-purple-600 dark:text-purple-400' : 'text-gray-800 dark:text-gray-200'
      },
      green: {
        bg: isHovered ? 'bg-green-50 dark:bg-green-900/20' : 'bg-white dark:bg-gray-800',
        icon: isHovered ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400',
        border: isHovered ? 'border-green-200 dark:border-green-800' : 'border-gray-200 dark:border-gray-700',
        proficiency: 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200',
        title: isHovered ? 'text-green-600 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'
      },
      yellow: {
        bg: isHovered ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-white dark:bg-gray-800',
        icon: isHovered ? 'text-yellow-500 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400',
        border: isHovered ? 'border-yellow-200 dark:border-yellow-800' : 'border-gray-200 dark:border-gray-700',
        proficiency: 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200',
        title: isHovered ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-800 dark:text-gray-200'
      },
      orange: {
        bg: isHovered ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-white dark:bg-gray-800',
        icon: isHovered ? 'text-orange-500 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400',
        border: isHovered ? 'border-orange-200 dark:border-orange-800' : 'border-gray-200 dark:border-gray-700',
        proficiency: 'bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-200',
        title: isHovered ? 'text-orange-600 dark:text-orange-400' : 'text-gray-800 dark:text-gray-200'
      },
      amber: {
        bg: isHovered ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-white dark:bg-gray-800',
        icon: isHovered ? 'text-amber-500 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400',
        border: isHovered ? 'border-amber-200 dark:border-amber-800' : 'border-gray-200 dark:border-gray-700',
        proficiency: 'bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200',
        title: isHovered ? 'text-amber-600 dark:text-amber-400' : 'text-gray-800 dark:text-gray-200'
      },
      pink: {
        bg: isHovered ? 'bg-pink-50 dark:bg-pink-900/20' : 'bg-white dark:bg-gray-800',
        icon: isHovered ? 'text-pink-500 dark:text-pink-400' : 'text-gray-500 dark:text-gray-400',
        border: isHovered ? 'border-pink-200 dark:border-pink-800' : 'border-gray-200 dark:border-gray-700',
        proficiency: 'bg-pink-100 dark:bg-pink-800 text-pink-800 dark:text-pink-200',
        title: isHovered ? 'text-pink-600 dark:text-pink-400' : 'text-gray-800 dark:text-gray-200'
      },
      red: {
        bg: isHovered ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-gray-800',
        icon: isHovered ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400',
        border: isHovered ? 'border-red-200 dark:border-red-800' : 'border-gray-200 dark:border-gray-700',
        proficiency: 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200',
        title: isHovered ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'
      },
      gray: {
        bg: isHovered ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800',
        icon: isHovered ? 'text-gray-600 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400',
        border: isHovered ? 'border-gray-200 dark:border-gray-700' : 'border-gray-200 dark:border-gray-700',
        proficiency: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
        title: isHovered ? 'text-gray-700 dark:text-gray-300' : 'text-gray-800 dark:text-gray-200'
      }
    };
  
    return colorMap[colorName] || colorMap.gray;
  };