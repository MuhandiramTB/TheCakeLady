import { useState } from 'react';

/**
 * Password input with show/hide toggle (eye icon).
 * Drop-in replacement for <Input type="password" />.
 */
export default function PasswordInput({ label, error, id, ...props }) {
  const [visible, setVisible] = useState(false);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-white/70 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          aria-describedby={error ? `${inputId}-error` : undefined}
          aria-invalid={!!error}
          className={`w-full px-4 py-2.5 pr-11 border rounded-lg text-[15px] min-h-[44px] bg-white/5 text-white transition-all duration-150 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent ${
            error ? 'border-error ring-1 ring-error/30' : 'border-white/10 hover:border-white/20'
          }`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          title={visible ? 'Hide password' : 'Show password'}
          className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
            visible
              ? 'text-accent bg-accent/10 hover:bg-accent/20'
              : 'text-white/70 hover:text-accent hover:bg-white/10'
          }`}
        >
          {visible ? (
            // Eye with slash (hide)
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            // Eye (show)
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-error text-sm mt-1.5 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
}
