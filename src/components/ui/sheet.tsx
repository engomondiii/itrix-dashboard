"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 supports-backdrop-filter:backdrop-blur-xs data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
        className
      )}
      {...props}
    />
  )
}

const sheetVariants = cva(
  "fixed z-50 flex flex-col bg-popover text-popover-foreground shadow-lg transition-transform duration-300 ease-out",
  {
    variants: {
      side: {
        left: "inset-y-0 left-0 h-full w-3/4 max-w-sm border-r border-border-soft data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full",
        right:
          "inset-y-0 right-0 h-full w-3/4 max-w-sm border-l border-border-soft data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full",
        top: "inset-x-0 top-0 h-auto border-b border-border-soft data-[ending-style]:-translate-y-full data-[starting-style]:-translate-y-full",
        bottom:
          "inset-x-0 bottom-0 h-auto border-t border-border-soft data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full",
      },
    },
    defaultVariants: { side: "right" },
  }
)

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: SheetPrimitive.Popup.Props & VariantProps<typeof sheetVariants>) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {children}
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-section font-semibold", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sec text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
}
