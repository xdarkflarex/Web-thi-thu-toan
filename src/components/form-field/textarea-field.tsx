"use client"

import * as React from "react"
import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

type TextareaFieldProps = {
  name: string
  label?: string
  placeholder?: string
  disabled?: boolean
  rows?: number
}

export function TextareaField({ name, label, placeholder, disabled, rows }: TextareaFieldProps) {
  const form = useFormContext()
  return (
    <FormField
      control={form.control}
      name={name as never}
      render={({ field }) => (
        <FormItem>
          {label ? <FormLabel>{label}</FormLabel> : null}
          <FormControl>
            <Textarea {...field} placeholder={placeholder} disabled={disabled} rows={rows} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default TextareaField

