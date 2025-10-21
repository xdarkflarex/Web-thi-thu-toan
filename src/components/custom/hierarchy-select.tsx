"use client"

import * as React from "react"
import { ChevronDown, ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

export type HierarchyNode = {
  id: string
  label: string
  children?: HierarchyNode[]
  disabled?: boolean
  data?: Record<string, unknown>
}

type HierarchySelectProps = {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  data: HierarchyNode[]
  className?: string
  searchable?: boolean
  showPath?: boolean
}

export function HierarchySelect({
  value,
  onValueChange,
  placeholder = "Select an option...",
  disabled,
  data,
  className,
  searchable = false,
  showPath = true,
}: HierarchySelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(new Set())

  const selectedNode = React.useMemo(() => {
    return findNodeById(data, value || "")
  }, [data, value])

  const filteredData = React.useMemo(() => {
    if (!searchable || !searchTerm.trim()) return data
    return filterNodesBySearch(data, searchTerm)
  }, [data, searchTerm])

  const getNodePath = React.useCallback((nodeId: string): string => {
    const path: string[] = []
    const findPath = (nodes: HierarchyNode[], targetId: string, currentPath: string[]): boolean => {
      for (const node of nodes) {
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
    findPath(data, nodeId, [])
    return path.join(" > ")
  }, [data])

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }

  const handleSelect = (node: HierarchyNode) => {
    if (node.disabled) return
    onValueChange?.(node.id)
    setOpen(false)
    setSearchTerm("")
  }

  const displayValue = React.useMemo(() => {
    if (!selectedNode) return placeholder
    if (showPath) {
      return getNodePath(selectedNode.id)
    }
    return selectedNode.label
  }, [selectedNode, placeholder, showPath, getNodePath])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <span className="truncate">{displayValue}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="max-h-[300px] overflow-auto">
          {searchable && (
            <div className="p-2 border-b">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
          <div className="p-1">
            {filteredData.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No options found
              </div>
            ) : (
              <HierarchyTree
                nodes={filteredData}
                selectedId={value}
                expandedNodes={expandedNodes}
                onToggle={toggleNode}
                onSelect={handleSelect}
                showPath={showPath}
                getNodePath={getNodePath}
              />
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

type HierarchyTreeProps = {
  nodes: HierarchyNode[]
  selectedId?: string
  expandedNodes: Set<string>
  onToggle: (nodeId: string) => void
  onSelect: (node: HierarchyNode) => void
  showPath: boolean
  getNodePath: (nodeId: string) => string
  depth?: number
}

function HierarchyTree({
  nodes,
  selectedId,
  expandedNodes,
  onToggle,
  onSelect,
  showPath,
  getNodePath,
  depth = 0,
}: HierarchyTreeProps) {
  return (
    <div className="space-y-0.5">
      {nodes.map((node) => {
        const hasChildren = node.children && node.children.length > 0
        const isExpanded = expandedNodes.has(node.id)
        const isSelected = selectedId === node.id
        const isDisabled = node.disabled

        return (
          <div key={node.id}>
            <div
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isSelected && "bg-accent text-accent-foreground",
                isDisabled && "opacity-50 cursor-not-allowed",
                depth > 0 && "ml-4"
              )}
              style={{ paddingLeft: depth * 16 + 8 }}
              onClick={() => {
                if (hasChildren) {
                  onToggle(node.id)
                } else {
                  onSelect(node)
                }
              }}
            >
              {hasChildren ? (
                <button
                  type="button"
                  className="flex items-center justify-center w-4 h-4 hover:bg-accent rounded-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggle(node.id)
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </button>
              ) : (
                <div className="w-4" />
              )}
              
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isSelected && <Check className="w-4 h-4 text-primary" />}
                <span className="truncate">
                  {showPath ? getNodePath(node.id) : node.label}
                </span>
              </div>
            </div>

            {hasChildren && isExpanded && (
              <HierarchyTree
                nodes={node.children!}
                selectedId={selectedId}
                expandedNodes={expandedNodes}
                onToggle={onToggle}
                onSelect={onSelect}
                showPath={showPath}
                getNodePath={getNodePath}
                depth={depth + 1}
              />
            )}
          </div>
        )
      })}
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

function filterNodesBySearch(nodes: HierarchyNode[], searchTerm: string): HierarchyNode[] {
  const filtered: HierarchyNode[] = []
  const term = searchTerm.toLowerCase()

  for (const node of nodes) {
    const matchesSearch = node.label.toLowerCase().includes(term)
    const filteredChildren = node.children ? filterNodesBySearch(node.children, searchTerm) : []

    if (matchesSearch || filteredChildren.length > 0) {
      filtered.push({
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : node.children,
      })
    }
  }

  return filtered
}
