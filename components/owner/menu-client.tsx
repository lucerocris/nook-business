"use client"

import * as React from "react"
import {
  DotsSixVertical,
  ForkKnife,
  ImageSquare,
  PencilSimple,
  Plus,
  Star,
  Trash,
  UploadSimple,
  Warning,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  upsertMenuItemAction,
  deleteMenuItemAction,
  upsertMenuItemVariantsAction,
} from "@/app/owner/actions"
import {
  uploadMenuItemImageAction,
  deleteMenuItemImageAction,
} from "@/app/actions/upload"
import imageCompression from "browser-image-compression"

type Category = {
  id: string
  name: string
  is_global: boolean
  created_by: string | null
}

type MenuItem = {
  id: string
  name: string
  price: number
  is_highlight: boolean
  image_url: string | null
  category_id: string
  menu_categories: { id: string; name: string; is_global: boolean } | null
  menu_item_variants?: MenuItemVariant[] | null
}

type MenuItemVariant = {
  id: string
  label: string
  price_override: number | null
  price_modifier: number
  is_default: boolean
  sort_order: number
}

type VariantDraft = {
  id?: string
  label: string
  priceOverride: string
  isDefault: boolean
}

type MenuItemFormState = {
  id?: string
  name: string
  price: string
  categoryId: string
  is_highlight: boolean
  hasVariants: boolean
  variants: VariantDraft[]
}

async function compressImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: "image/webp",
  })
}

function formatPrice(value: number) {
  return `₱${value.toFixed(2)}`
}

function getVariantEffectivePrice(variant: MenuItemVariant, basePrice: number) {
  return variant.price_override ?? basePrice + variant.price_modifier
}

function getItemPriceDisplay(item: MenuItem) {
  const variants = item.menu_item_variants ?? []
  if (variants.length === 0) return formatPrice(item.price)
  const prices = variants.map((variant) =>
    getVariantEffectivePrice(variant, item.price)
  )
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  if (!Number.isFinite(minPrice) || !Number.isFinite(maxPrice)) {
    return formatPrice(item.price)
  }

  if (minPrice === maxPrice) return formatPrice(minPrice)
  return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
}

function createVariantDraft(overrides?: Partial<VariantDraft>): VariantDraft {
  return {
    label: "",
    priceOverride: "",
    isDefault: false,
    ...overrides,
  }
}

function ItemRow({
  item,
  highlightCount,
  onToggleHighlight,
  onEdit,
  onDelete,
  onImageUpload,
  onImageDelete,
  isUploadingImage,
  showMissingImageWarning,
}: {
  item: MenuItem
  highlightCount: number
  onToggleHighlight: (id: string, value: boolean) => void
  onEdit: (item: MenuItem) => void
  onDelete: (id: string) => void
  onImageUpload: (id: string, file: File) => void
  onImageDelete: (id: string, imageUrl: string) => void
  isUploadingImage?: boolean
  showMissingImageWarning?: boolean
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const highlightCapReached = !item.is_highlight && highlightCount >= 5
  const categoryName = item.menu_categories?.name ?? "Uncategorized"

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    onImageUpload(item.id, file)
    e.target.value = ""
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0">
      <DotsSixVertical size={16} className="text-muted-foreground cursor-grab shrink-0" />

      {item.is_highlight ? (
        item.image_url ? (
          <div className="relative size-10 rounded-md bg-muted shrink-0 flex items-center justify-center border overflow-hidden group/img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
            <button
              type="button"
              className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"
              onClick={() => onImageDelete(item.id, item.image_url!)}
              disabled={isUploadingImage}
              title="Remove image"
            >
              <Trash size={12} className="text-white" />
            </button>
          </div>
        ) : (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="outline"
              size="icon"
              className="size-10 shrink-0 border-dashed"
              disabled={isUploadingImage}
              onClick={() => inputRef.current?.click()}
              title="Upload image"
            >
              {isUploadingImage
                ? <ImageSquare size={16} className="text-muted-foreground animate-pulse" />
                : <Plus size={16} className="text-muted-foreground" />
              }
            </Button>
          </>
        )
      ) : (
        <div className="size-10 shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex flex-row items-center gap-2">
          <span className="text-sm font-medium truncate">{item.name}</span>
          {item.is_highlight && (
            <Badge
              variant="outline"
              className="text-xs text-green-700 border-green-300 bg-green-50 dark:bg-green-950 shrink-0"
            >
              Highlight
            </Badge>
          )}
        </div>
        <div className="flex flex-row items-center gap-2 mt-0.5">
          <Badge variant="secondary" className="text-xs">{categoryName}</Badge>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">
            {getItemPriceDisplay(item)}
          </span>
        </div>
        {showMissingImageWarning && item.is_highlight && !item.image_url && (
          <div className="flex flex-row items-center gap-1 mt-0.5">
            <Warning size={12} className="text-amber-500 shrink-0" />
            <span className="text-xs text-amber-600 dark:text-amber-400">
              Add a photo to show this highlight in the app
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-0.5 shrink-0">
        <Switch
          checked={item.is_highlight}
          disabled={highlightCapReached}
          onCheckedChange={(v) => onToggleHighlight(item.id, v)}
          className={highlightCapReached ? "opacity-50" : ""}
        />
        <span className="text-xs text-muted-foreground">Highlight</span>
      </div>

      <div className="flex items-center shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => onEdit(item)}
        >
          <PencilSimple size={14} className="text-muted-foreground" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 hover:text-destructive"
          onClick={() => onDelete(item.id)}
        >
          <Trash size={14} className="text-muted-foreground" />
        </Button>
      </div>
    </div>
  )
}

export function OwnerMenuClient({
  items: initialItems,
  categories,
  cafeId,
}: {
  items: MenuItem[]
  categories: Category[]
  cafeId: string
}) {
  const [items, setItems] = React.useState<MenuItem[]>(initialItems)
  const [itemDialogOpen, setItemDialogOpen] = React.useState(false)
  const [editingItemId, setEditingItemId] = React.useState<string | null>(null)
  const [addCategoryOpen, setAddCategoryOpen] = React.useState(false)
  const [deleteItem, setDeleteItem] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [uploadingItemId, setUploadingItemId] = React.useState<string | null>(null)
  const [uploadError, setUploadError] = React.useState("")
  const [pendingImageFile, setPendingImageFile] = React.useState<File | null>(null)
  const dialogInputRef = React.useRef<HTMLInputElement>(null)
  const [itemForm, setItemForm] = React.useState<MenuItemFormState>({
    name: "",
    price: "",
    categoryId: "",
    is_highlight: false,
    hasVariants: false,
    variants: [createVariantDraft({ isDefault: true })],
  })

  const globalCategories = categories.filter((c) => c.is_global)
  const customCategories = categories.filter((c) => !c.is_global)

  const highlightCount = items.filter((i) => i.is_highlight).length
  const isEditing = editingItemId !== null
  const editingItem = items.find((item) => item.id === editingItemId) ?? null

  function resetItemForm() {
    setItemForm({
      name: "",
      price: "",
      categoryId: "",
      is_highlight: false,
      hasVariants: false,
      variants: [createVariantDraft({ isDefault: true })],
    })
    setEditingItemId(null)
    setPendingImageFile(null)
  }

  function openAddDialog() {
    resetItemForm()
    setItemDialogOpen(true)
  }

  function openEditDialog(item: MenuItem) {
    const sortedVariants = [...(item.menu_item_variants ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order
    )
    const hasVariants = sortedVariants.length > 0

    setItemForm({
      id: item.id,
      name: item.name,
      price: item.price.toString(),
      categoryId: item.category_id,
      is_highlight: item.is_highlight,
      hasVariants,
      variants: hasVariants
        ? sortedVariants.map((variant) =>
          createVariantDraft({
            id: variant.id,
            label: variant.label,
            priceOverride:
              (variant.price_override ?? item.price + variant.price_modifier).toString(),
            isDefault: variant.is_default,
          })
        )
        : [createVariantDraft({ isDefault: true })],
    })
    setEditingItemId(item.id)
    setPendingImageFile(null)
    setItemDialogOpen(true)
  }

  function ensureDefaultVariant(variants: VariantDraft[]) {
    if (variants.some((variant) => variant.isDefault)) return variants
    if (variants.length === 0) return variants
    return variants.map((variant, index) => ({
      ...variant,
      isDefault: index === 0,
    }))
  }

  async function toggleHighlight(id: string, value: boolean) {
    if (value && highlightCount >= 5) {
      toast.error("You can only highlight up to 5 items")
      return
    }
    const item = items.find((i) => i.id === id)
    if (!item) return

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, is_highlight: value } : i))
    )

    try {
      await upsertMenuItemAction({
        id: item.id,
        name: item.name,
        price: item.price,
        category_id: item.category_id,
        is_highlight: value,
        image_url: item.image_url,
      })
      toast.success(value ? "Item highlighted" : "Item removed from highlights")
    } catch {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, is_highlight: !value } : i))
      )
      toast.error("Failed to update highlight")
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteItem) return
    const id = deleteItem
    setDeleteItem(null)
    setItems((prev) => prev.filter((i) => i.id !== id))
    try {
      await deleteMenuItemAction(id)
      toast.success("Menu item deleted")
    } catch {
      // Revert on error — server will revalidate on next load
      toast.error("Failed to delete menu item")
    }
  }

  async function handleSaveItem() {
    if (!itemForm.name.trim() || !itemForm.categoryId) return

    if (itemForm.hasVariants && itemForm.variants.length === 0) {
      toast.error("Add at least one variant")
      return
    }

    const normalizedVariants = itemForm.hasVariants
      ? itemForm.variants.map((variant, index) => ({
        id: variant.id,
        label: variant.label.trim(),
        price_override: variant.priceOverride
          ? Number.parseFloat(variant.priceOverride)
          : null,
        price_modifier: 0,
        is_default: variant.isDefault,
        sort_order: index,
      }))
      : []

    if (itemForm.hasVariants) {
      const missingLabel = normalizedVariants.some((variant) => !variant.label)
      if (missingLabel) {
        toast.error("Variant label is required")
        return
      }

      const invalidPrice = normalizedVariants.some((variant) =>
        variant.price_override === null || Number.isNaN(variant.price_override)
      )
      if (invalidPrice) {
        toast.error("Variant price is required")
        return
      }

      if (!normalizedVariants.some((variant) => variant.is_default)) {
        normalizedVariants[0].is_default = true
      }
    }

    const highlightCapReached = highlightCount >= 5
    const highlightAllowed =
      !highlightCapReached || Boolean(editingItem?.is_highlight)
    if (itemForm.is_highlight && !highlightAllowed) {
      toast.error("You can only highlight up to 5 items")
      return
    }

    setIsSaving(true)
    try {
      let basePrice = Number.parseFloat(itemForm.price) || 0
      if (itemForm.hasVariants) {
        const defaultVariant = normalizedVariants.find((variant) => variant.is_default)
        const fallbackVariant = defaultVariant ?? normalizedVariants[0]
        if (!fallbackVariant) {
          toast.error("Add at least one variant")
          return
        }
        basePrice = fallbackVariant.price_override ?? 0
      }

      const { id: menuItemId } = await upsertMenuItemAction({
        id: editingItemId ?? undefined,
        name: itemForm.name,
        price: basePrice,
        category_id: itemForm.categoryId,
        is_highlight: itemForm.is_highlight && highlightAllowed,
        image_url: editingItem?.image_url ?? null,
      })

      let imageUrl = editingItem?.image_url ?? null
      if (!isEditing && itemForm.is_highlight && pendingImageFile) {
        try {
          const compressed = await compressImage(pendingImageFile)
          const formData = new FormData()
          formData.append("file", compressed)
          const { url } = await uploadMenuItemImageAction(
            formData,
            menuItemId,
            cafeId
          )
          imageUrl = url
        } catch {
          // Image upload failure is non-fatal — item is still saved
          toast.error("Item saved, but image upload failed")
        }
      }

      const variantsPayload = itemForm.hasVariants
        ? normalizedVariants.map((variant, index) => ({
          id: variant.id,
          label: variant.label.trim(),
          price_override: variant.price_override,
          price_modifier: 0,
          is_default: variant.is_default,
          sort_order: index,
        }))
        : []

      const savedVariants = await upsertMenuItemVariantsAction(
        menuItemId,
        variantsPayload
      )

      const category = categories.find((c) => c.id === itemForm.categoryId)
      const updatedItem: MenuItem = {
        id: menuItemId,
        name: itemForm.name,
        price: basePrice,
        is_highlight: itemForm.is_highlight && highlightAllowed,
        image_url: imageUrl,
        category_id: itemForm.categoryId,
        menu_categories: category
          ? { id: category.id, name: category.name, is_global: category.is_global }
          : null,
        menu_item_variants: itemForm.hasVariants ? savedVariants : [],
      }

      setItems((prev) => {
        if (editingItemId) {
          return prev.map((item) => (item.id === menuItemId ? updatedItem : item))
        }
        return [...prev, updatedItem]
      })

      resetItemForm()
      setItemDialogOpen(false)
      toast.success(isEditing ? "Menu item updated" : "Menu item added")
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Failed to save menu item"
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleItemImageUpload(id: string, file: File) {
    const compressed = await compressImage(file)
    const formData = new FormData()
    formData.append("file", compressed)
    setUploadingItemId(id)
    setUploadError("")
    try {
      const { url } = await uploadMenuItemImageAction(formData, id, cafeId)
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, image_url: url } : i))
      )
      toast.success("Item image uploaded")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed"
      setUploadError(msg)
      toast.error(msg)
      setTimeout(() => setUploadError(""), 4000)
    } finally {
      setUploadingItemId(null)
    }
  }

  async function handleItemImageDelete(id: string, imageUrl: string) {
    setUploadingItemId(id)
    try {
      await deleteMenuItemImageAction(id, imageUrl, cafeId)
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, image_url: null } : i))
      )
      toast.success("Item image removed")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed"
      setUploadError(msg)
      toast.error(msg)
      setTimeout(() => setUploadError(""), 4000)
    } finally {
      setUploadingItemId(null)
    }
  }

  const highlightItems = items.filter((i) => i.is_highlight)

  return (
    <>
      <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6">

        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-semibold">Menu</h1>
            <p className="text-sm text-muted-foreground">
              Manage your menu items and highlight up to 5 on your cafe detail
              page
            </p>
          </div>
          <Button variant="default" size="sm" className="w-full sm:w-auto" onClick={openAddDialog}>
            <Plus className="size-4" />
            Add Item
          </Button>
        </div>

        {/* Highlight Summary Card */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium">Menu highlights</p>
                <p className="text-xs text-muted-foreground">
                  Highlighted items appear on your cafe detail page with a photo
                </p>
              </div>
              <div className="flex flex-row items-center gap-3">
                <div className="flex flex-row items-center gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) =>
                    i < highlightCount ? (
                      <div key={i} className="size-2 rounded-full bg-primary" />
                    ) : (
                      <div
                        key={i}
                        className="size-2 rounded-full border border-muted-foreground/30"
                      />
                    )
                  )}
                </div>
                <span className="text-sm font-medium">{highlightCount} / 5</span>
                <span className="text-xs text-muted-foreground">highlights</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="all">
              All Items
              <Badge variant="secondary" className="ml-1.5 text-xs">
                {items.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="highlights">
              Highlights
              <Badge variant="secondary" className="ml-1.5 text-xs">
                {highlightCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          {/* All Items */}
          <TabsContent value="all">
            <Card>
              <CardContent className="pt-2 pb-0">
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    No menu items yet. Add your first item!
                  </p>
                ) : (
                  items.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      highlightCount={highlightCount}
                      onToggleHighlight={toggleHighlight}
                      onEdit={openEditDialog}
                      onDelete={setDeleteItem}
                      onImageUpload={handleItemImageUpload}
                      onImageDelete={handleItemImageDelete}
                      isUploadingImage={uploadingItemId === item.id}
                    />
                  ))
                )}
                {highlightCount >= 5 && (
                  <p className="text-xs text-destructive py-2">
                    Maximum 5 highlights reached
                  </p>
                )}
                {uploadError && (
                  <p className="text-sm text-destructive py-2">{uploadError}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Highlights */}
          <TabsContent value="highlights">
            <Card>
              <CardContent className="pt-4 pb-0">
                <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground mb-4">
                  <Star size={14} className="text-yellow-500 shrink-0" />
                  {highlightCount} of 5 highlight slots used — highlighted items
                  appear on your cafe detail page with photos
                </div>
                {highlightItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No highlights set yet. Toggle items in All Items.
                  </p>
                ) : (
                  highlightItems.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      highlightCount={highlightCount}
                      onToggleHighlight={toggleHighlight}
                      onEdit={openEditDialog}
                      onDelete={setDeleteItem}
                      onImageUpload={handleItemImageUpload}
                      onImageDelete={handleItemImageDelete}
                      isUploadingImage={uploadingItemId === item.id}
                      showMissingImageWarning
                    />
                  ))
                )}
                {highlightCount >= 5 && (
                  <p className="text-xs text-destructive py-2">
                    Maximum 5 highlights reached
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories */}
          <TabsContent value="categories">
            <Card>
              <CardContent className="pt-5 pb-4 space-y-6">

                {/* Global categories */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Global categories
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Shared across all cafes — managed by the Nook team
                  </p>
                  <div>
                    {globalCategories.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center gap-3 py-2.5 border-b last:border-0"
                      >
                        <div className="size-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                          <ForkKnife size={14} className="text-muted-foreground" />
                        </div>
                        <span className="text-sm flex-1">{cat.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          Global
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom categories */}
                <div>
                  <div className="flex flex-row items-center justify-between mb-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Your categories
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setAddCategoryOpen(true)}
                    >
                      <Plus size={14} />
                      Add Category
                    </Button>
                  </div>

                  {customCategories.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                      No custom categories yet.
                    </p>
                  ) : (
                    customCategories.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center gap-3 py-2.5 border-b last:border-0"
                      >
                        <div className="size-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                          <ForkKnife size={14} className="text-muted-foreground" />
                        </div>
                        <span className="text-sm flex-1">{cat.name}</span>
                        <Button variant="ghost" size="icon" className="size-8">
                          <PencilSimple size={14} className="text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 hover:text-destructive"
                        >
                          <Trash size={14} className="text-muted-foreground" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Item Dialog */}
      <Dialog
        open={itemDialogOpen}
        onOpenChange={(open) => {
          setItemDialogOpen(open)
          if (!open) resetItemForm()
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit menu item" : "Add menu item"}</DialogTitle>
            <DialogDescription>
              menu_items — price stored as numeric
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Item name</Label>
              <Input
                id="item-name"
                placeholder="e.g. Iced Oat Latte"
                value={itemForm.name}
                onChange={(e) =>
                  setItemForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {!itemForm.hasVariants && (
                <div className="space-y-2">
                  <Label htmlFor="item-price">Price (₱)</Label>
                  <Input
                    id="item-price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={itemForm.price}
                    onChange={(e) =>
                      setItemForm((prev) => ({ ...prev, price: e.target.value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Stored as numeric — e.g. 180.00
                  </p>
                </div>
              )}

              <div className={itemForm.hasVariants ? "col-span-2 space-y-2" : "space-y-2"}>
                <Label>Category</Label>
                <Select
                  value={itemForm.categoryId}
                  onValueChange={(v) =>
                    setItemForm((prev) => ({ ...prev, categoryId: v }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">Variants</span>
                <span className="text-xs text-muted-foreground">
                  Offer size or add-ons with different prices
                </span>
              </div>
              <Switch
                checked={itemForm.hasVariants}
                onCheckedChange={(value) =>
                  setItemForm((prev) => ({
                    ...prev,
                    hasVariants: value,
                    variants: value
                      ? ensureDefaultVariant(
                        prev.variants.length > 0
                          ? prev.variants
                          : [createVariantDraft({ isDefault: true })]
                      )
                      : prev.variants,
                  }))
                }
              />
            </div>

            {itemForm.hasVariants && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Variant list</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() =>
                      setItemForm((prev) => ({
                        ...prev,
                        variants: [
                          ...prev.variants,
                          createVariantDraft({
                            isDefault: prev.variants.length === 0,
                          }),
                        ],
                      }))
                    }
                  >
                    <Plus size={14} />
                    Add Variant
                  </Button>
                </div>

                {itemForm.variants.map((variant, index) => (
                  <div
                    key={`${variant.id ?? "new"}-${index}`}
                    className="grid grid-cols-1 gap-3 rounded-lg border p-3 sm:grid-cols-[1.5fr_1fr_auto_auto] sm:items-end"
                  >
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Label</Label>
                      <Input
                        placeholder="e.g. Small"
                        value={variant.label}
                        onChange={(e) =>
                          setItemForm((prev) => ({
                            ...prev,
                            variants: prev.variants.map((entry, idx) =>
                              idx === index
                                ? { ...entry, label: e.target.value }
                                : entry
                            ),
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Price (₱)
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={variant.priceOverride}
                        onChange={(e) =>
                          setItemForm((prev) => ({
                            ...prev,
                            variants: prev.variants.map((entry, idx) =>
                              idx === index
                                ? { ...entry, priceOverride: e.target.value }
                                : entry
                            ),
                          }))
                        }
                      />
                    </div>

                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <input
                        type="radio"
                        name="default-variant"
                        checked={variant.isDefault}
                        onChange={() =>
                          setItemForm((prev) => ({
                            ...prev,
                            variants: prev.variants.map((entry, idx) => ({
                              ...entry,
                              isDefault: idx === index,
                            })),
                          }))
                        }
                      />
                      Default
                    </label>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 hover:text-destructive"
                      onClick={() =>
                        setItemForm((prev) => {
                          const next = prev.variants.filter((_, idx) => idx !== index)
                          return {
                            ...prev,
                            variants: ensureDefaultVariant(next),
                          }
                        })
                      }
                      disabled={itemForm.variants.length <= 1}
                    >
                      <Trash size={14} className="text-muted-foreground" />
                    </Button>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  At least one variant is required.
                </p>
              </div>
            )}

            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">Feature as highlight</span>
                <span className="text-xs text-muted-foreground">
                  Shows on your cafe detail page
                </span>
              </div>
              <Switch
                checked={itemForm.is_highlight}
                disabled={!itemForm.is_highlight && highlightCount >= 5 && !editingItem?.is_highlight}
                onCheckedChange={(v) =>
                  setItemForm((prev) => ({ ...prev, is_highlight: v }))
                }
              />
            </div>

            {itemForm.is_highlight && highlightCount >= 5 && !editingItem?.is_highlight && (
              <p className="text-xs text-destructive">
                Maximum 5 highlights reached — toggle off another item first
              </p>
            )}

            {!isEditing && itemForm.is_highlight && highlightCount < 5 && (
              <div className="space-y-2">
                <Label>Photo</Label>
                <input
                  ref={dialogInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    setPendingImageFile(e.target.files?.[0] ?? null)
                  }}
                />
                <div
                  className="h-24 w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-muted text-muted-foreground transition-colors"
                  onClick={() => dialogInputRef.current?.click()}
                >
                  {pendingImageFile ? (
                    <>
                      <ImageSquare size={20} className="text-primary" />
                      <span className="text-sm font-medium truncate max-w-[180px]">
                        {pendingImageFile.name}
                      </span>
                      <span className="text-xs">Click to change</span>
                    </>
                  ) : (
                    <>
                      <UploadSimple size={20} />
                      <span className="text-sm">Click to upload</span>
                      <span className="text-xs">JPG, PNG, WEBP · Max 10MB</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSaveItem}
              disabled={isSaving || !itemForm.name.trim() || !itemForm.categoryId}
            >
              {isSaving ? "Saving..." : (isEditing ? "Save Changes" : "Add Item")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={addCategoryOpen} onOpenChange={setAddCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add custom category</DialogTitle>
            <DialogDescription>
              menu_categories — is_global = false, created_by = your cafe
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Category name</Label>
              <Input
                id="cat-name"
                placeholder="e.g. Seasonal Specials"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCategoryOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => {
                setAddCategoryOpen(false)
              }}
            >
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Item Dialog */}
      <AlertDialog
        open={deleteItem !== null}
        onOpenChange={() => setDeleteItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete item?</AlertDialogTitle>
            <AlertDialogDescription>
              This item will be permanently removed from your menu. This cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
