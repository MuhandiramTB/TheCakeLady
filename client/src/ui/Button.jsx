const variants = {
  primary: 'bg-gradient-gold text-primary font-semibold hover:shadow-lg hover:shadow-accent/20 active:scale-[0.97]',
  secondary: 'bg-white text-text-primary border border-border hover:border-accent/50 hover:text-accent active:scale-[0.97]',
  danger: 'bg-error text-white hover:bg-red-600 shadow-md hover:shadow-lg active:scale-[0.97]',
  ghost: 'bg-transparent text-text-secondary hover:bg-gray-100 hover:text-text-primary active:scale-[0.97]',
  dark: 'bg-primary text-white hover:bg-primary-hover shadow-md hover:shadow-lg active:scale-[0.97]',
};

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  disabled,
  isLoading,
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-[15px] min-h-[44px] transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
