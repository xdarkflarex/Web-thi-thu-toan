import * as React from "react"

import { cn } from "@/lib/utils"
import { MathJax, MathJaxContext } from "better-react-mathjax"

type MathTextareaProps = {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  textareaClassName?: string
  previewClassName?: string
  label?: string
  hidePreview?: boolean
} & Omit<React.ComponentProps<"div">, "onChange"> & {
  textareaProps?: Omit<React.ComponentProps<"textarea">, "className" | "value" | "defaultValue" | "onChange" | "placeholder">
}

const defaultMathJaxConfig = {
  loader: { load: ["input/tex", "output/chtml"] },
  tex: { inlineMath: [["$", "$"], ["\\(", "\\)"]] }
}

export function MathTextarea({
  value,
  defaultValue,
  onChange,
  placeholder,
  className,
  textareaClassName,
  previewClassName,
  label,
  hidePreview,
  textareaProps,
  ...props
}: MathTextareaProps) {
  const [internalValue, setInternalValue] = React.useState<string>(defaultValue ?? "")
  const isControlled = value !== undefined
  const currentValue = isControlled ? value! : internalValue

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    if (!isControlled) setInternalValue(newValue)
    onChange?.(newValue)
  }

  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      {label ? (
        <div className="text-sm font-medium text-foreground">{label}</div>
      ) : null}

      <textarea
        data-slot="textarea"
        value={currentValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          textareaClassName
        )}
        {...textareaProps}
      />

      {hidePreview ? null : (
        <div
          className={cn(
            "rounded-md border p-3 text-sm text-foreground/90 bg-background/40 whitespace-pre-wrap break-words",
            previewClassName
          )}
        >
          <MathJaxContext version={3} config={defaultMathJaxConfig}>
            <MathJax dynamic inline={false}>
              {currentValue && currentValue.trim().length > 0 ? currentValue : "Type LaTeX here to preview…"}
            </MathJax>
          </MathJaxContext>
        </div>
      )}
    </div>
  )
}

MathTextarea.displayName = "MathTextarea"

export default MathTextarea


