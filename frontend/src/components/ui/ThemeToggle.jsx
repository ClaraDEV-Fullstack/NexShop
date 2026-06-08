import { HiSun, HiMoon } from 'react-icons/hi';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 rounded-full bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-all duration-300"
            aria-label="Toggle theme"
        >
            <div className="relative w-6 h-6">
                {/* Sun Icon */}
                <HiSun
                    className={`absolute inset-0 w-6 h-6 text-yellow-500 transform transition-all duration-300
                        ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`}
                />
                {/* Moon Icon */}
                <HiMoon
                    className={`absolute inset-0 w-6 h-6 text-primary-400 transform transition-all duration-300
                        ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`}
                />
            </div>
        </button>
    );
};

export default ThemeToggle;