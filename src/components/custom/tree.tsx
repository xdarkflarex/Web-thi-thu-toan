"use client"

import * as React from "react"
import { ChevronRight, Folder, File, MoreVertical, Plus, Pencil, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type TreeNode = {
  id: string
  label: string
  children?: TreeNode[]
  icon?: React.ReactNode
  // Optional: custom data payload
  data?: Record<string, unknown>
}

type CommonActionHandlers = {
  onAddChild?: (node: TreeNode) => void
  onRename?: (node: TreeNode) => void
  onDelete?: (node: TreeNode) => void
  onClickItem?: (node: TreeNode) => void
}

export type TreeProps = {
  data: TreeNode[]
  defaultExpandedIds?: string[]
  getActions?: (node: TreeNode) => React.ReactNode
  className?: string
} & CommonActionHandlers

export function Tree({
  data,
  defaultExpandedIds = [],
  getActions,
  className,
  ...handlers
}: TreeProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(
    () => new Set(defaultExpandedIds)
  )

  const toggle = React.useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  return (
    <div className={cn("text-sm", className)}>
      <ul className="space-y-0.5">
        {data.map((node) => (
          <TreeRow
            key={node.id}
            node={node}
            depth={0}
            expanded={expanded}
            onToggle={toggle}
            getActions={getActions}
            {...handlers}
          />
        ))}
      </ul>
    </div>
  )
}

type RowProps = {
  node: TreeNode
  depth: number
  expanded: Set<string>
  onToggle: (id: string) => void
  getActions?: (node: TreeNode) => React.ReactNode
} & CommonActionHandlers

function TreeRow({ node, depth, expanded, onToggle, getActions, ...handlers }: RowProps) {
  const hasChildren = Array.isArray(node.children) && node.children.length > 0
  const isOpen = expanded.has(node.id)

  const handleClickLabel = () => {
    handlers.onClickItem?.(node)
  }

  const icon = node.icon ?? (hasChildren ? <Folder className="size-4 text-muted-foreground" /> : <File className="size-4 text-muted-foreground" />)

  return (
    <li>
      <div
        className={cn(
          "group flex items-center gap-2 rounded-md px-1 py-1 hover:bg-accent/50",
          "focus-within:bg-accent/50"
        )}
      >
        <button
          type="button"
          aria-label={isOpen ? "Collapse" : "Expand"}
          className={cn(
            "flex size-6 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent",
            !hasChildren && "invisible"
          )}
          onClick={() => onToggle(node.id)}
        >
          <ChevronRight className={cn("size-4 transition-transform", isOpen && "rotate-90")} />
        </button>

        <div style={{ paddingLeft: depth * 12 }} className="-ml-1" />

        <div className="flex items-center gap-2 min-w-0 flex-1">
          {icon}
          <button
            type="button"
            onClick={handleClickLabel}
            className="truncate text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-sm px-1"
          >
            {node.label}
          </button>
        </div>

        <div className="ml-1">
          {getActions ? (
            getActions(node)
          ) : (
            <ActionsPopover node={node} {...handlers} />
          )}
        </div>
      </div>

      {hasChildren && isOpen && (
        <ul className="ml-6">
          {node.children!.map((child) => (
            <TreeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
              getActions={getActions}
              {...handlers}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

function ActionsPopover({ node, onAddChild, onRename, onDelete }: { node: TreeNode } & CommonActionHandlers) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Actions">
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6}>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onAddChild?.(node)}>
          <Plus className="size-4" /> Add child
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onRename?.(node)}>
          <Pencil className="size-4" /> Rename
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(node)}>
          <Trash2 className="size-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Tree


