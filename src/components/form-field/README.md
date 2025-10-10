# Hierarchy Select Component

A powerful single select component that supports hierarchical data selection with tree-like navigation.

## Features

- 🌳 **Hierarchical Structure**: Support for nested tree-like data
- 🔍 **Search Functionality**: Optional search to filter through options
- 📍 **Path Display**: Show full hierarchy path (e.g., "Mathematics > Algebra > Linear Algebra")
- ♿ **Accessibility**: Full keyboard navigation and screen reader support
- 🎨 **Customizable**: Flexible styling and behavior options
- 📱 **Responsive**: Works well on all screen sizes
- 🚫 **Disabled Support**: Individual nodes can be disabled
- 🔗 **Form Integration**: Works seamlessly with react-hook-form

## Components

### 1. HierarchySelectField (Form Integration)

For use with react-hook-form:

```tsx
import { HierarchySelectField } from "@/components/form-field/hierarchy-select-field"

<HierarchySelectField
  name="category"
  label="Category"
  placeholder="Select a category..."
  data={hierarchyData}
  searchable
  showPath
/>
```

### 2. HierarchySelect (Standalone)

For standalone use without forms:

```tsx
import { HierarchySelect } from "@/components/ui/hierarchy-select"

<HierarchySelect
  value={selectedValue}
  onValueChange={setSelectedValue}
  data={hierarchyData}
  searchable
  showPath
/>
```

## Data Structure

The component expects data in the following format:

```tsx
type HierarchyNode = {
  id: string
  label: string
  children?: HierarchyNode[]
  disabled?: boolean
  data?: Record<string, unknown>
}

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
        ],
      },
      {
        id: "geometry",
        label: "Geometry",
        children: [
          { id: "euclidean", label: "Euclidean Geometry" },
          { id: "analytical", label: "Analytical Geometry" },
        ],
      },
    ],
  },
]
```

## Props

### HierarchySelectField Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | - | Form field name (required) |
| `label` | `string` | - | Field label |
| `placeholder` | `string` | `"Select an option..."` | Placeholder text |
| `disabled` | `boolean` | `false` | Disable the entire field |
| `data` | `HierarchyNode[]` | - | Hierarchical data (required) |
| `className` | `string` | - | Additional CSS classes |
| `searchable` | `boolean` | `false` | Enable search functionality |
| `showPath` | `boolean` | `true` | Show full hierarchy path in display |

### HierarchySelect Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | Selected value |
| `onValueChange` | `(value: string) => void` | - | Value change handler |
| `placeholder` | `string` | `"Select an option..."` | Placeholder text |
| `disabled` | `boolean` | `false` | Disable the component |
| `data` | `HierarchyNode[]` | - | Hierarchical data (required) |
| `className` | `string` | - | Additional CSS classes |
| `searchable` | `boolean` | `false` | Enable search functionality |
| `showPath` | `boolean` | `true` | Show full hierarchy path in display |

## Examples

### Basic Usage with Form

```tsx
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import { HierarchySelectField } from "@/components/form-field/hierarchy-select-field"

function MyForm() {
  const form = useForm()

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <HierarchySelectField
          name="category"
          label="Select Category"
          data={categoryData}
          searchable
          showPath
        />
      </form>
    </Form>
  )
}
```

### Standalone Usage

```tsx
import { useState } from "react"
import { HierarchySelect } from "@/components/ui/hierarchy-select"

function MyComponent() {
  const [selectedValue, setSelectedValue] = useState("")

  return (
    <HierarchySelect
      value={selectedValue}
      onValueChange={setSelectedValue}
      data={categoryData}
      placeholder="Choose an option..."
      searchable
    />
  )
}
```

### With Disabled Items

```tsx
const dataWithDisabled: HierarchyNode[] = [
  {
    id: "available",
    label: "Available Options",
    children: [
      { id: "option1", label: "Option 1" },
      { id: "option2", label: "Option 2" },
    ],
  },
  {
    id: "disabled-category",
    label: "Disabled Category",
    disabled: true,
    children: [
      { id: "disabled-option", label: "Disabled Option", disabled: true },
    ],
  },
]
```

## Styling

The component uses Tailwind CSS classes and follows the design system. You can customize the appearance by:

1. **Using className prop**: Add custom classes to the trigger button
2. **CSS Variables**: Override CSS custom properties for colors and spacing
3. **Theme Configuration**: Modify the theme in your Tailwind config

## Accessibility

- Full keyboard navigation support
- Screen reader compatible
- ARIA attributes for proper labeling
- Focus management
- High contrast support

## Browser Support

- Chrome 88+
- Firefox 78+
- Safari 14+
- Edge 88+

## Examples in Codebase

- `/examples/hierarchy-select` - Form integration example
- `/examples/hierarchy-select-standalone` - Standalone usage example
