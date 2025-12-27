import { Search, X } from 'lucide-react';
import { cn } from '../../utils/helpers';

const SearchInput = ({
  value,
  onChange,
  placeholder = 'Search...',
  className,
  onClear,
}) => {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-10 py-2.5 bg-dark-800/50 border border-dark-600/50 rounded-xl
                   focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50
                   placeholder:text-gray-500 text-sm text-gray-100 transition-all duration-300"
      />
      {value && onClear && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300 
                     hover:bg-glass-hover rounded-lg transition-all duration-300"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
