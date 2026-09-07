export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-[rgba(174,198,255,0.12)] text-[#aec6ff] border border-[rgba(174,198,255,0.2)]',
    success: 'bg-[rgba(100,220,180,0.12)] text-[#64dcb4] border border-[rgba(100,220,180,0.2)]',
    danger: 'bg-[rgba(218,30,40,0.12)] text-[#ffb4ab] border border-[rgba(218,30,40,0.2)]',
    warning: 'bg-[rgba(255,200,80,0.12)] text-[#ffc850] border border-[rgba(255,200,80,0.2)]',
    head: 'bg-[rgba(180,130,255,0.12)] text-[#b482ff] border border-[rgba(180,130,255,0.2)]',
    member: 'bg-[rgba(174,198,255,0.08)] text-[#8c909f] border border-[rgba(174,198,255,0.12)]',
  }
  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
