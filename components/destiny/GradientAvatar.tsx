interface Props { name: string; size?: 'sm' | 'md' | 'lg' }
export function GradientAvatar({ name, size = 'md' }: Props) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const colors = [
    'from-violet-500 to-indigo-500',
    'from-teal-500 to-indigo-500',
    'from-coral-400 to-violet-500',
    'from-indigo-500 to-teal-500',
  ]
  const colorIndex = name.charCodeAt(0) % colors.length
  const sizeMap = { sm: 'h-10 w-10 text-sm', md: 'h-16 w-16 text-xl', lg: 'h-24 w-24 text-3xl' }
  return (
    <div className={`rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center font-heading font-bold text-white ${sizeMap[size]}`}>
      {initials}
    </div>
  )
}
