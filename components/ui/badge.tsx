import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      tone: {
        default: "bg-slate-100 text-slate-600 border border-slate-200",
        slate: "bg-slate-800 text-white border border-slate-800",
        coral: "bg-coral-50 text-coral-600 border border-coral-200",
        // 기존 success/warning을 slate 계열로 통일
        success: "bg-slate-800 text-white border border-slate-800",
        warning: "bg-slate-100 text-slate-600 border border-slate-200",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

function Badge({ className, tone, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ tone }), className)} {...props}>
      {icon && <span className="[&_svg]:h-3 [&_svg]:w-3">{icon}</span>}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
