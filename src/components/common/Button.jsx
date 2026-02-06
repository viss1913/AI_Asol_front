import { motion } from 'framer-motion';

const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const variants = {
    primary: 'bg-accent-gradient text-white shadow-md hover:shadow-lg',
    outline: 'border-2 border-[#6366f1] text-[#6366f1] hover:bg-[#6366f1]/5',
    ghost: 'text-slate-600 hover:bg-slate-100',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg font-semibold',
  };

  const baseClasses = "rounded-xl transition-all flex items-center justify-center gap-2 font-medium";

  return (
    <motion.button
      whileHover={{ scale: 1.02, translateY: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      style={{
        background: variant === 'primary' ? 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' : undefined
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
