"use client"

import { useState, useEffect, useCallback } from "react"
import * as React from "react"
import { useTranslation } from "react-i18next"
import { useForm, FormProvider } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { TextField } from "@/components/form-field/text-field"
import { SelectField } from "@/components/form-field/select-field"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Category {
  id: string
  slug: string
  name_en: string
  name_vi: string
  parent_id: string | null
  description?: string | null
  icon?: string | null
  color?: string | null
  sort_order: number
  children?: Category[]
}

const getCategorySchema = (t: (key: string, options?: { ns: string }) => string) => z.object({
  slug: z.string().min(1, t('slugRequired', { ns: 'category' })),
  name_en: z.string().min(1, t('englishNameRequired', { ns: 'category' })),
  name_vi: z.string().min(1, t('vietnameseNameRequired', { ns: 'category' })),
  parent_id: z.string().optional(),
  description: z.string().optional(),
  sort_order: z.preprocess((val) => val === "" || val === undefined ? 0 : Number(val), z.number().min(0))
})

type CategoryFormValues = z.infer<ReturnType<typeof getCategorySchema>>

export default function CategoryManagementPage() {
  const { t, i18n } = useTranslation(['category', 'common', 'question'])
  const [categories, setCategories] = useState<Category[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)

  const categorySchema = React.useMemo(() => getCategorySchema(t), [t])

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      slug: '',
      name_en: '',
      name_vi: '',
      parent_id: '',
      description: '',
      sort_order: 0
    }
  }) as ReturnType<typeof useForm<CategoryFormValues>>

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/categories')
      const result = await res.json()
      if (result.success) {
        setCategories(result.data)
      } else {
        toast.error(result.message || t('failedToFetchCategories', { ns: 'category' }))
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error(t('failedToFetchCategories', { ns: 'category' }))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleSubmit = async (data: CategoryFormValues) => {
    const url = editingCategory 
      ? `/api/categories/${editingCategory.id}`
      : '/api/categories'
    
    const method = editingCategory ? 'PATCH' : 'POST'
    
    const payload = {
      ...data,
      parent_id: (data.parent_id && data.parent_id !== "__none__") ? data.parent_id : null,
      description: data.description || null
    }
    
    try {
      // Get Supabase access token to authenticate API route
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      })
      
      const result = await res.json()
      
      if (res.ok && result.success) {
        toast.success(editingCategory ? t('categoryUpdatedSuccess', { ns: 'category' }) : t('categoryCreatedSuccess', { ns: 'category' }))
        setIsDialogOpen(false)
        resetForm()
        fetchCategories()
      } else {
        toast.error(result.message || t('failedToSaveCategory', { ns: 'category' }))
      }
    } catch (error) {
      console.error('Failed to save category:', error)
      toast.error(t('failedToSaveCategory', { ns: 'category' }))
    }
  }

  const resetForm = () => {
    form.reset({
      slug: '',
      name_en: '',
      name_vi: '',
      parent_id: '__none__',
      description: '',
      sort_order: 0
    })
    setEditingCategory(null)
  }

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat)
    form.reset({
      slug: cat.slug,
      name_en: cat.name_en,
      name_vi: cat.name_vi,
      parent_id: cat.parent_id || '__none__',
      description: cat.description || '',
      sort_order: cat.sort_order
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirmDeleteCategory', { ns: 'category' }))) return
    
    try {
      // Get Supabase access token to authenticate API route
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token

      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        credentials: 'include'
      })
      const result = await res.json()
      
      if (res.ok && result.success) {
        toast.success(t('categoryDeletedSuccess', { ns: 'category' }))
        fetchCategories()
      } else {
        toast.error(result.message || t('failedToDeleteCategory', { ns: 'category' }))
      }
    } catch (error) {
      console.error('Failed to delete category:', error)
      toast.error(t('failedToDeleteCategory', { ns: 'category' }))
    }
  }

  const getAllCategoriesForSelect = (cats: Category[], result: Category[] = [], excludeId?: string): Category[] => {
    cats.forEach(cat => {
      if (cat.id !== excludeId) {
        result.push(cat)
        if (cat.children) getAllCategoriesForSelect(cat.children, result, excludeId)
      }
    })
    return result
  }

  const renderCategoryTree = (cats: Category[], level = 0) => (
    <div className="space-y-1">
      {cats.map(cat => (
        <div key={cat.id} className="border rounded-md">
          <div 
            className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
            style={{ paddingLeft: `${16 + level * 24}px` }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {i18n.language === 'vi' ? cat.name_vi : cat.name_en}
                </span>
                <span className="text-xs text-muted-foreground">({cat.slug})</span>
              </div>
              {cat.description && (
                <p className="text-xs text-muted-foreground mt-1">{cat.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(cat)}
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(cat.id)}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {cat.children && cat.children.length > 0 && (
            <div className="pl-4">
              {renderCategoryTree(cat.children, level + 1)}
            </div>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('categoryManagement', { ns: 'category' })}</h1>
          <p className="text-muted-foreground mt-1">
            {t('manageCategoriesHierarchically', { ns: 'category' })}
          </p>
        </div>
        <Button 
          onClick={() => {
            resetForm()
            setIsDialogOpen(true)
          }}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          {t('addCategory', { ns: 'category' })}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('loadingCategories', { ns: 'category' })}</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">{t('noCategoriesFound', { ns: 'category' })}</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            {t('createFirstCategory', { ns: 'category' })}
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-card">
          {renderCategoryTree(categories)}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? t('editCategory', { ns: 'category' }) : t('createNewCategory', { ns: 'category' })}
            </DialogTitle>
          </DialogHeader>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <TextField
                    name="slug"
                    label={`${t('slug', { ns: 'category' })} *`}
                    placeholder={t('slugPlaceholder', { ns: 'category' })}
                    disabled={!!editingCategory}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('slugHelp', { ns: 'category' })}
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="sort_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('sortOrder', { ns: 'category' })}</FormLabel>
                      <FormControl>
                        <input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <TextField
                  name="name_en"
                  label={`${t('englishName', { ns: 'category' })} *`}
                  placeholder={t('englishNamePlaceholder', { ns: 'category' })}
                />
                <TextField
                  name="name_vi"
                  label={`${t('vietnameseName', { ns: 'category' })} *`}
                  placeholder={t('vietnameseNamePlaceholder', { ns: 'category' })}
                />
              </div>

              <SelectField
                name="parent_id"
                items={[
                  { label: t('noneTopLevel', { ns: 'category' }), value: "__none__" },
                  ...getAllCategoriesForSelect([...categories], [], editingCategory?.id).map(cat => {
                    const getFullPath = (c: Category): string[] => {
                      if (!c.parent_id) return [c.slug]
                      const parent = getAllCategoriesForSelect([...categories]).find(p => p.id === c.parent_id)
                      if (parent) {
                        return [...getFullPath(parent), c.slug]
                      }
                      return [c.slug]
                    }
                    const path = getFullPath(cat).join(' > ')
                    return {
                      label: `${i18n.language === 'vi' ? cat.name_vi : cat.name_en} (${path})`,
                      value: cat.id
                    }
                  })
                ]}
                label={t('parentCategory', { ns: 'category' })}
                placeholder={t('noneTopLevel', { ns: 'category' })}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('description', { ns: 'category' })} ({t('optional', { ns: 'common' })})</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={t('descriptionPlaceholder', { ns: 'category' })}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t('cancel', { ns: 'common' })}
                </Button>
                <Button type="submit">
                  {editingCategory ? t('update', { ns: 'category' }) : t('create', { ns: 'category' })}
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </div>
  )
}

