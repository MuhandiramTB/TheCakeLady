export default function Select({ label, error, id, children, ...props }) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-white/70 mb-1.5">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-4 py-2.5 border rounded-lg text-[15px] min-h-[44px] bg-[#2a2a3d] text-white transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent [&>option]:bg-[#2a2a3d] [&>option]:text-white ${
          error ? 'border-error' : 'border-white/10 hover:border-white/20'
        }`}
        {...props}
      >
        {children}
      </select>
      {error && <p role="alert" className="text-error text-sm mt-1.5">{error}</p>}
    </div>
  );
}
