import { cn } from '../../utils/helpers';

const Select = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  error,
  required = false,
  disabled = false,
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
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          'w-full px-4 py-3 bg-dark-800/50 border rounded-xl text-sm text-gray-100',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50',
          'disabled:bg-dark-900 disabled:text-gray-500 disabled:cursor-not-allowed',
          'transition-all duration-300 cursor-pointer',
          error ? 'border-rose-500/50' : 'border-dark-600/50',
          !value && 'text-gray-500'
        )}
      >
        <option value="" className="bg-dark-800 text-gray-400">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-dark-800 text-gray-100">
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
    </div>
  );
};

export default Select;
