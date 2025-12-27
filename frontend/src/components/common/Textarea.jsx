import { cn } from '../../utils/helpers';

const Textarea = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  rows = 4,
  className,
}) => {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
          {required && <span className="text-rose-400 ml-1">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={cn(
          'w-full px-4 py-3 bg-dark-800/50 border rounded-xl text-sm text-gray-100 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50',
          'placeholder:text-gray-500 transition-all duration-300',
          'disabled:bg-dark-900 disabled:text-gray-500 disabled:cursor-not-allowed',
          error ? 'border-rose-500/50' : 'border-dark-600/50'
        )}
      />
      {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
    </div>
  );
};

export default Textarea;
