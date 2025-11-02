"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Tree, { TreeNode } from "@/components/custom/tree"
import { Input } from "@/components/ui/input"

export default function Page() {
  const [nodes, setNodes] = React.useState<TreeNode[]>([
    {
      id: "1",
      label: "HÌNH HỌC VÀ ĐO LƯỜNG",
      children: [
        {
          id: "1-1",
          label: "Hình học không gian",
          children: [
            {
              id: "1-1-1",
              label: "Phương pháp tọa độ trong không gian",
              children: [
                { id: "1-1-1-1", label: "Tọa độ vectơ đối với một hệ trục tọa độ" },
                { id: "1-1-1-2", label: "Biểu thức tọa độ của các phép toán vectơ" },
                { id: "1-1-1-3", label: "Phương trình mặt phẳng" },
              ],
            },
          ],
        },
      ],
    },
  ])

  const findAndUpdate = React.useCallback(
    (
      list: TreeNode[],
      id: string,
      updater: (n: TreeNode) => void
    ): TreeNode[] => {
      return list.map((n) => {
        if (n.id === id) {
          const clone: TreeNode = { ...n }
          updater(clone)
          return clone
        }
        if (n.children?.length) {
          return { ...n, children: findAndUpdate(n.children, id, updater) }
        }
        return n
      })
    },
    []
  )

  const addChild = (node: TreeNode) => {
    setNodes((prev) =>
      findAndUpdate(prev, node.id, (n) => {
        const nextId = `${n.id}-${(n.children?.length ?? 0) + 1}`
        n.children = [...(n.children ?? []), { id: nextId, label: "New item" }]
      })
    )
  }

  const edit = (node: TreeNode) => {
    const newLabel = prompt("Edit item", node.label)
    if (!newLabel) return
    setNodes((prev) => findAndUpdate(prev, node.id, (n) => void (n.label = newLabel)))
  }

  const remove = (node: TreeNode) => {
    const removeRec = (list: TreeNode[], id: string): TreeNode[] =>
      list
        .filter((n) => n.id !== id)
        .map((n) => ({ ...n, children: n.children ? removeRec(n.children, id) : n.children }))
    setNodes((prev) => removeRec(prev, node.id))
  }

  return (
    <div className="container mx-auto max-w-5xl py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tree Example</CardTitle>
        </CardHeader>
        <CardContent>
          <Tree
            data={nodes}
            defaultExpandedIds={["1", "1-1", "1-1-1"]}
            onAddChild={addChild}
            onEdit={edit}
            onDelete={remove}
            onClickItem={(n) => console.log("Clicked", n)}
          />
        </CardContent>
      </Card>
    </div>
  )
}


