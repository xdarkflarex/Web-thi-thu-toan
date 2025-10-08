"use client"

import * as React from "react"
import MathTextarea from "@/components/custom/math-textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Page() {
  const [value, setValue] = React.useState<string>("$\\int_0^1 x^2 \\; dx = \\frac{1}{3}$")

  return (
    <div className="container mx-auto max-w-3xl py-8 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">MathTextarea Example</h1>

      <Card>
        <CardHeader>
          <CardTitle>Live LaTeX Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MathTextarea
            label="Expression"
            value={value}
            onChange={setValue}
            placeholder="Type LaTeX, e.g. $\\frac{a}{b} + c$"
          />
        </CardContent>
      </Card>
    </div>
  )
}


