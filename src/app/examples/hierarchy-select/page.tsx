"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import HierarchySelectField, { HierarchyNode } from "@/components/form-field/hierarchy-select-field"

const formSchema = z.object({
  category: z.string().min(1, "Please select a category"),
  subcategory: z.string().min(1, "Please select a subcategory"),
})

type FormData = z.infer<typeof formSchema>

const sampleData: HierarchyNode[] = [
  {
    id: "math",
    label: "Mathematics",
    children: [
      {
        id: "algebra",
        label: "Algebra",
        children: [
          { id: "linear-algebra", label: "Linear Algebra" },
          { id: "abstract-algebra", label: "Abstract Algebra" },
          { id: "polynomials", label: "Polynomials" },
        ],
      },
      {
        id: "geometry",
        label: "Geometry",
        children: [
          { id: "euclidean", label: "Euclidean Geometry" },
          { id: "analytical", label: "Analytical Geometry" },
          { id: "differential", label: "Differential Geometry" },
        ],
      },
      {
        id: "calculus",
        label: "Calculus",
        children: [
          { id: "differential-calc", label: "Differential Calculus" },
          { id: "integral-calc", label: "Integral Calculus" },
          { id: "multivariable", label: "Multivariable Calculus" },
        ],
      },
    ],
  },
  {
    id: "science",
    label: "Science",
    children: [
      {
        id: "physics",
        label: "Physics",
        children: [
          { id: "mechanics", label: "Mechanics" },
          { id: "thermodynamics", label: "Thermodynamics" },
          { id: "electromagnetism", label: "Electromagnetism" },
          { id: "quantum", label: "Quantum Physics" },
        ],
      },
      {
        id: "chemistry",
        label: "Chemistry",
        children: [
          { id: "organic", label: "Organic Chemistry" },
          { id: "inorganic", label: "Inorganic Chemistry" },
          { id: "physical", label: "Physical Chemistry" },
        ],
      },
      {
        id: "biology",
        label: "Biology",
        children: [
          { id: "cell-bio", label: "Cell Biology" },
          { id: "genetics", label: "Genetics" },
          { id: "ecology", label: "Ecology" },
        ],
      },
    ],
  },
  {
    id: "language",
    label: "Language Arts",
    children: [
      {
        id: "literature",
        label: "Literature",
        children: [
          { id: "poetry", label: "Poetry" },
          { id: "prose", label: "Prose" },
          { id: "drama", label: "Drama" },
        ],
      },
      {
        id: "writing",
        label: "Writing",
        children: [
          { id: "creative", label: "Creative Writing" },
          { id: "technical", label: "Technical Writing" },
          { id: "academic", label: "Academic Writing" },
        ],
      },
    ],
  },
  {
    id: "disabled-item",
    label: "Disabled Category",
    disabled: true,
    children: [
      { id: "disabled-child", label: "Disabled Child", disabled: true },
    ],
  },
]

export default function HierarchySelectExample() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      subcategory: "",
    },
  })

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data)
    alert(`Selected: ${JSON.stringify(data, null, 2)}`)
  }

  const selectedCategory = form.watch("category")
  const selectedSubcategory = form.watch("subcategory")

  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hierarchy Select Component Example</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <HierarchySelectField
                  name="category"
                  label="Category"
                  placeholder="Select a category..."
                  data={sampleData}
                  searchable
                  showPath
                />

                <HierarchySelectField
                  name="subcategory"
                  label="Subcategory"
                  placeholder="Select a subcategory..."
                  data={sampleData}
                  searchable={false}
                  showPath={false}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit">Submit</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset()
                  }}
                >
                  Reset
                </Button>
              </div>
            </form>
          </Form>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Current Selection:</h3>
            <div className="space-y-1 text-sm">
              <div>
                <strong>Category:</strong> {selectedCategory || "None"}
              </div>
              <div>
                <strong>Subcategory:</strong> {selectedSubcategory || "None"}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Features:</h3>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Hierarchical tree structure with expandable/collapsible nodes</li>
              <li>Search functionality (enabled for first field)</li>
              <li>Path display showing full hierarchy (enabled for first field)</li>
              <li>Disabled items support</li>
              <li>Form integration with react-hook-form</li>
              <li>Keyboard navigation support</li>
              <li>Responsive design</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
