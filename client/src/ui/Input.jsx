export default function Input({ label, error, id, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-white/70 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-describedby={error ? `${inputId}-error` : undefined}
        aria-invalid={!!error}
        className={`w-full px-4 py-2.5 border rounded-lg text-[15px] min-h-[44px] bg-white/5 text-white transition-all duration-150 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent ${
          error ? 'border-error ring-1 ring-error/30' : 'border-white/10 hover:border-white/20'
        }`}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-error text-sm mt-1.5 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
}
