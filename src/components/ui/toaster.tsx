"use client"

import { useToast } from "@/hooks/use-toast"
import { usePageVisibility } from "@/hooks/usePageVisibility"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()
  const isPageVisible = usePageVisibility()

  // Sayfa arka plandayken toast'ları render etme
  if (!isPageVisible) {
    return (
      <ToastProvider>
        <ToastViewport />
      </ToastProvider>
    )
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}