"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import MathTextarea from "@/components/custom/math-textarea";

type MathTextareaFieldProps = {
  name: string;
  label?: string;
  placeholder?: string;
  hidePreview?: boolean;
};

export function MathTextareaField({
  name,
  label,
  placeholder,
  ...rest
}: MathTextareaFieldProps) {
  const form = useFormContext();
  return (
    <FormField
      control={form.control}
      name={name as never}
      render={({ field }) => (
        <FormItem>
          {label ? <FormLabel>{label}</FormLabel> : null}
          <FormControl>
            <MathTextarea
              value={field.value}
              onChange={field.onChange}
              placeholder={placeholder}
              {...rest}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default MathTextareaField;
