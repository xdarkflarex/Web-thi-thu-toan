"use client"

import * as React from "react"
import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

type SelectFieldProps = {
  name: string
  label?: string
  placeholder?: string
  disabled?: boolean
  items: Array<{ label: string; value: string }>
}

export function SelectField({ name, label, placeholder, disabled, items }: SelectFieldProps) {
  const form = useFormContext()
  return (
    <FormField
      control={form.control}
      name={name as never}
      render={({ field }) => (
        <FormItem>
          {label ? <FormLabel>{label}</FormLabel> : null}
          <FormControl>
            <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {items.map((it) => (
                  <SelectItem key={it.value} value={it.value}>{it.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default SelectField


