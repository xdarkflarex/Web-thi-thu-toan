"use client"

import * as React from "react"
import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

type NumberFieldProps = {
  name: string
  label?: string
  placeholder?: string
  disabled?: boolean
  min?: number
  max?: number
}

export function NumberField({ name, label, placeholder, disabled, min, max }: NumberFieldProps) {
  const form = useFormContext()
  return (
    <FormField
      control={form.control}
      name={name as never}
      render={({ field }) => (
        <FormItem>
          {label ? <FormLabel>{label}</FormLabel> : null}
          <FormControl>
            <Input
              type="number"
              {...field}
              value={field.value ?? ''}
              onChange={(e) => {
                const value = e.target.value === '' ? undefined : parseFloat(e.target.value)
                field.onChange(isNaN(value as number) ? 0 : value)
              }}
              placeholder={placeholder}
              disabled={disabled}
              min={min}
              max={max}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default NumberField

