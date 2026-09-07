import { useEffect } from 'react'

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-xl' }) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal-box ${maxWidth} w-full fade-in`} role="dialog" aria-modal="true">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(174,198,255,0.1)]">
          <h2 className="text-base font-semibold text-[#e2e2e2]">{title}</h2>
          <button
            onClick={onClose}
            className="btn-ghost w-8 h-8 p-0 flex items-center justify-center"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
