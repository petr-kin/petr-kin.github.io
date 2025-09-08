interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="animate-spin rounded-full border-2 border-slate-200 border-t-cyan-500">
        <div className="w-full h-full rounded-full border-2 border-transparent border-r-blue-400 animate-spin" 
             style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
      </div>
    </div>
  )
}