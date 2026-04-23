export default function Spinner({ size = 'default' }) {
  const sizeClass = size === 'small' ? 'w-5 h-5' : 'w-8 h-8';
  return (
    <div className="flex justify-center items-center py-12" role="status" aria-label="Loading">
      <div className={`${sizeClass} border-3 border-primary/20 border-t-primary rounded-full animate-spin`} />
    </div>
  );
}
