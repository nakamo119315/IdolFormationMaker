import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Header() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/members', label: 'Members' },
    { path: '/groups', label: 'Groups' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              IDOL☆STAGE
            </span>
          </Link>

          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  location.pathname === item.path
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </motion.header>
  );
}
