import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-white text-black hover:bg-neutral-200 shadow-lg shadow-white/10 shadow-md',
      secondary: 'bg-[#1A1D24] text-white hover:bg-[#2A2E39] border border-white/5',
      outline: 'border border-white/20 text-white hover:bg-white/10 backdrop-blur-sm',
      ghost: 'text-white/70 hover:text-white hover:bg-white/10',
    }
    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-11 px-6 text-sm font-medium',
      lg: 'h-14 px-8 text-base font-semibold',
    }
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
