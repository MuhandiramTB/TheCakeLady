import Button from './Button.jsx';

export default function EmptyState({ icon = '📋', title, description, actionLabel, onAction }) {
  return (
    <div className="text-center py-16 animate-fade-in">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && <p className="text-white/70 mb-6 max-w-sm mx-auto">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
