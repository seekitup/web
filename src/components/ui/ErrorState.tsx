import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ErrorStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  ctaText?: string;
  ctaTo?: string;
}

export function ErrorState({ icon, title, description, ctaText, ctaTo }: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center text-center px-6 py-20 min-h-[60vh]"
    >
      {icon && (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          {icon}
        </motion.div>
      )}
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">{title}</h1>
      <p className="text-neutral-500 text-base md:text-lg max-w-md mb-8">{description}</p>
      {ctaText && ctaTo && (
        <Link
          to={ctaTo}
          className="bg-primary text-black font-semibold px-6 py-3 rounded-full hover:bg-primary-dark transition-colors text-sm no-underline"
        >
          {ctaText}
        </Link>
      )}
    </motion.div>
  );
}
