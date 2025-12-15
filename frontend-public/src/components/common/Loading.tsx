import { motion } from 'framer-motion';

export function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <motion.div
        className="flex space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-4 h-4 bg-primary-500 rounded-full"
            animate={{
              y: [-10, 10, -10],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
