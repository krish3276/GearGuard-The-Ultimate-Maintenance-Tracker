import { cn } from '../../utils/helpers';

const Badge = ({ children, variant = 'default', size = 'md', className }) => {
  const variants = {
    default: 'bg-dark-700/50 text-gray-300 border border-dark-600/50',
    primary: 'bg-primary-500/20 text-primary-300 border border-primary-500/30',
    success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    danger: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    info: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
    purple: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full backdrop-blur-sm',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
