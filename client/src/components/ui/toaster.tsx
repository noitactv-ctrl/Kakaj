import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle2, AlertCircle } from "lucide-react"

function compactErrorMessage(description: React.ReactNode): React.ReactNode {
  if (typeof description !== "string" || description.length <= 96) return description;
  const firstSentence = description.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim();
  const message = firstSentence && firstSentence.length <= 96 ? firstSentence : description;
  return message.length <= 96 ? message : `${message.slice(0, 93).trimEnd()}...`;
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const isError = variant === "destructive"
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 mt-0.5">
                {isError
                  ? <AlertCircle className="h-4 w-4 text-white" />
                  : <CheckCircle2 className="h-4 w-4 text-[#15120d]" />
                }
              </div>
              <div className="flex-1 min-w-0">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>
                    {isError ? compactErrorMessage(description) : description}
                  </ToastDescription>
                )}
              </div>
            </div>
            {action}
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
