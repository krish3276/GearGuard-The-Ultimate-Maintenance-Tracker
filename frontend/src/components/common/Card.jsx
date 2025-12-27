import { cn } from '../../utils/helpers';

const Card = ({ children, className, padding = true, hover = false, onClick, variant = 'default' }) => {
  const variants = {
    default: 'bg-dark-800/60 backdrop-blur-xl border-dark-700/50',
    glass: 'bg-glass-light backdrop-blur-xl border-glass-border bg-gradient-to-br from-white/10 to-white/5',
    solid: 'bg-dark-800 border-dark-700',
  };

  return (
    <div
      className={cn(
        'rounded-2xl border shadow-glass transition-all duration-300',
        variants[variant],
        padding && 'p-6',
        hover && 'hover:border-primary-500/30 hover:shadow-glow-sm cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className }) => {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, className }) => {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-100', className)}>
      {children}
    </h3>
  );
};

const CardDescription = ({ children, className }) => {
  return (
    <p className={cn('text-sm text-gray-400 mt-1', className)}>
      {children}
    </p>
  );
};

const CardContent = ({ children, className }) => {
  return <div className={cn(className)}>{children}</div>;
};

const CardFooter = ({ children, className }) => {
  return (
    <div className={cn('mt-4 pt-4 border-t border-dark-700/50', className)}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
