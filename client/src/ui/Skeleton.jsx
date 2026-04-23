export function SkeletonCard() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse-soft">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 bg-white/10 rounded w-1/3" />
        <div className="h-4 bg-accent/20 rounded-full w-16" />
      </div>
      <div className="h-4 bg-white/10 rounded w-1/2 mb-2" />
      <div className="h-6 bg-accent/20 rounded w-24 mb-4" />
      <div className="flex gap-2">
        <div className="h-8 bg-white/10 rounded-lg w-16" />
        <div className="h-8 bg-white/10 rounded-lg w-12" />
        <div className="h-8 bg-white/10 rounded-lg w-14" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex gap-4 items-center p-4 bg-white/5 border border-white/10 rounded-xl animate-pulse-soft">
      <div className="h-4 bg-white/10 rounded w-1/4" />
      <div className="h-4 bg-white/10 rounded w-1/3" />
      <div className="h-4 bg-white/10 rounded w-1/6" />
    </div>
  );
}

export function SkeletonPage({ cards = 6 }) {
  return (
    <div className="py-6 animate-fade-in">
      <div className="h-8 bg-white/10 rounded w-1/3 mb-6 animate-pulse-soft" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: cards }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
