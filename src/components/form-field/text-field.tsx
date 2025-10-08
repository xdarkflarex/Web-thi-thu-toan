"use client"

import * as React from "react"
import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

type TextFieldProps = {
  name: string
  label?: string
  placeholder?: string
  disabled?: boolean
}

export function TextField({ name, label, placeholder, disabled }: TextFieldProps) {
  const form = useFormContext()
  return (
    <FormField
      control={form.control}
      name={name as never}
      render={({ field }) => (
        <FormItem>
          {label ? <FormLabel>{label}</FormLabel> : null}
          <FormControl>
            <Input {...field} placeholder={placeholder} disabled={disabled} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default TextField


