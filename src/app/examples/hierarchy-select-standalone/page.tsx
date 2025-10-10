"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HierarchySelect, HierarchyNode } from "@/components/custom/hierarchy-select"

const sampleData: HierarchyNode[] = [
  {
    id: "electronics",
    label: "Electronics",
    children: [
      {
        id: "computers",
        label: "Computers",
        children: [
          { id: "laptops", label: "Laptops" },
          { id: "desktops", label: "Desktops" },
          { id: "tablets", label: "Tablets" },
        ],
      },
      {
        id: "phones",
        label: "Phones",
        children: [
          { id: "smartphones", label: "Smartphones" },
          { id: "feature-phones", label: "Feature Phones" },
        ],
      },
    ],
  },
  {
    id: "clothing",
    label: "Clothing",
    children: [
      {
        id: "mens",
        label: "Men's Clothing",
        children: [
          { id: "shirts", label: "Shirts" },
          { id: "pants", label: "Pants" },
          { id: "shoes", label: "Shoes" },
        ],
      },
      {
        id: "womens",
        label: "Women's Clothing",
        children: [
          { id: "dresses", label: "Dresses" },
          { id: "tops", label: "Tops" },
          { id: "accessories", label: "Accessories" },
        ],
      },
    ],
  },
  {
    id: "books",
    label: "Books",
    children: [
      {
        id: "fiction",
        label: "Fiction",
        children: [
          { id: "mystery", label: "Mystery" },
          { id: "romance", label: "Romance" },
          { id: "sci-fi", label: "Science Fiction" },
        ],
      },
      {
        id: "non-fiction",
        label: "Non-Fiction",
        children: [
          { id: "biography", label: "Biography" },
          { id: "history", label: "History" },
          { id: "self-help", label: "Self Help" },
        ],
      },
    ],
  },
]

export default function StandaloneHierarchySelectExample() {
  const [selectedValue, setSelectedValue] = React.useState<string>("")
  const [selectedValue2, setSelectedValue2] = React.useState<string>("")

  const selectedNode = React.useMemo(() => {
    return findNodeById(sampleData, selectedValue)
  }, [selectedValue])

  const selectedNode2 = React.useMemo(() => {
    return findNodeById(sampleData, selectedValue2)
  }, [selectedValue2])

  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Standalone Hierarchy Select Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">With Search & Path Display</label>
              <HierarchySelect
                value={selectedValue}
                onValueChange={setSelectedValue}
                placeholder="Select a category..."
                data={sampleData}
                searchable
                showPath
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Simple Display</label>
              <HierarchySelect
                value={selectedValue2}
                onValueChange={setSelectedValue2}
                placeholder="Select a category..."
                data={sampleData}
                searchable={false}
                showPath={false}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => {
                setSelectedValue("")
                setSelectedValue2("")
              }}
            >
              Clear All
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedValue("laptops")
                setSelectedValue2("dresses")
              }}
            >
              Set Sample Values
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Selection 1:</h3>
              <div className="text-sm space-y-1">
                <div><strong>Value:</strong> {selectedValue || "None"}</div>
                <div><strong>Label:</strong> {selectedNode?.label || "None"}</div>
                <div><strong>Path:</strong> {selectedNode ? getNodePath(sampleData, selectedNode.id) : "None"}</div>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Selection 2:</h3>
              <div className="text-sm space-y-1">
                <div><strong>Value:</strong> {selectedValue2 || "None"}</div>
                <div><strong>Label:</strong> {selectedNode2?.label || "None"}</div>
                <div><strong>Path:</strong> {selectedNode2 ? getNodePath(sampleData, selectedNode2.id) : "None"}</div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Usage:</h3>
            <pre className="text-sm bg-background p-3 rounded border overflow-x-auto">
{`import { HierarchySelect, HierarchyNode } from "@/components/ui/hierarchy-select"

const data: HierarchyNode[] = [
  {
    id: "electronics",
    label: "Electronics",
    children: [
      { id: "laptops", label: "Laptops" },
      { id: "phones", label: "Phones" },
    ],
  },
]

<HierarchySelect
  value={selectedValue}
  onValueChange={setSelectedValue}
  data={data}
  searchable
  showPath
/>`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper functions
function findNodeById(nodes: HierarchyNode[], id: string): HierarchyNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return null
}

function getNodePath(nodes: HierarchyNode[], nodeId: string): string {
  const path: string[] = []
  const findPath = (nodeList: HierarchyNode[], targetId: string, currentPath: string[]): boolean => {
    for (const node of nodeList) {
      const newPath = [...currentPath, node.label]
      if (node.id === targetId) {
        path.push(...newPath)
        return true
      }
      if (node.children && findPath(node.children, targetId, newPath)) {
        return true
      }
    }
    return false
  }
  findPath(nodes, nodeId, [])
  return path.join(" > ")
}
