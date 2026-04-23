export default function Card({ children, interactive, className = '', ...props }) {
  return (
    <div
      className={`bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-6 transition-all duration-200 ${
        interactive ? 'hover:bg-white/10 hover:border-accent/30 hover:scale-[1.02] cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
