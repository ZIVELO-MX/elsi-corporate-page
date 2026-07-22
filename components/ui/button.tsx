import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-[8px] text-sm font-extrabold whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform,opacity] outline-none active:scale-[0.97] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border border-[var(--primary)] bg-[var(--primary)] text-[var(--text)] shadow-sm pointer-fine:hover:-translate-y-0.5 pointer-fine:hover:border-[#242650] pointer-fine:hover:bg-[#242650] pointer-fine:hover:text-white pointer-fine:hover:shadow-md",
        primary:
          "border border-[var(--primary)] bg-[var(--primary)] text-[var(--text)] shadow-sm pointer-fine:hover:-translate-y-0.5 pointer-fine:hover:border-[#242650] pointer-fine:hover:bg-[#242650] pointer-fine:hover:text-white pointer-fine:hover:shadow-md",
        destructive:
          "bg-destructive text-white pointer-fine:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-[var(--primary)] bg-transparent text-[var(--primary-hover)] shadow-xs pointer-fine:hover:-translate-y-0.5 pointer-fine:hover:bg-[var(--primary-light)] pointer-fine:hover:text-[var(--primary-hover)] pointer-fine:hover:shadow-sm dark:border-input dark:bg-input/30 dark:pointer-fine:hover:bg-input/50",
        secondary:
          "border border-[var(--secondary)] bg-[var(--secondary)] text-[var(--secondary-foreground)] pointer-fine:hover:-translate-y-0.5 pointer-fine:hover:border-[var(--primary)] pointer-fine:hover:bg-[var(--primary-light)] pointer-fine:hover:text-[var(--primary-hover)]",
        inverse:
          "border border-white bg-white text-[var(--primary-hover)] shadow-sm pointer-fine:hover:-translate-y-0.5 pointer-fine:hover:bg-[var(--primary-light)] pointer-fine:hover:text-[var(--primary-hover)] pointer-fine:hover:shadow-md",
        ghost:
          "text-foreground pointer-fine:hover:bg-[var(--primary-light)] pointer-fine:hover:text-[var(--primary-hover)] dark:pointer-fine:hover:bg-accent/50",
        link: "h-auto rounded-none px-0 py-0 text-[var(--primary-hover)] underline-offset-4 pointer-fine:hover:text-[var(--accent)] pointer-fine:hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-11",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
