export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <span className="material-symbols-outlined text-[#424754] mb-4" style={{ fontSize: 48 }}>
        {icon || 'inbox'}
      </span>
      <h3 className="text-base font-semibold text-[#8c909f] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[#525252] mb-6 max-w-sm">{description}</p>
      )}
      {action}
    </div>
  )
}
