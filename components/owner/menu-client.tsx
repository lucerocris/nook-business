"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Plus } from "@phosphor-icons/react"
import { toast } from "sonner"
import imageCompression from "browser-image-compression"

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
import { Button } from "@/components/ui/button"
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
import { Spinner } from "@/components/ui/spinner"
import {
  upsertMenuItemAction,
  deleteMenuItemAction,
  upsertMenuItemVariantsAction,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/app/owner/actions"
import {
  uploadMenuItemImageAction,
  deleteMenuItemImageAction,
} from "@/app/actions/upload"
import { CategoryList } from "@/components/owner/menu/category-list"
import {
  EditItemPanel,
  EMPTY_ITEM_FORM,
  type ItemFormState,
} from "@/components/owner/menu/edit-item-panel"
import { EmptyMenu } from "@/components/owner/menu/empty-menu"
import { HighlightsStrip } from "@/components/owner/menu/highlights-strip"
import { MenuItemRows, type MenuSection } from "@/components/owner/menu/menu-item-rows"
import {
  HIGHLIGHT_LIMIT,
  sortedVariants,
  type Category,
  type MenuItem,
} from "@/components/owner/menu/types"

async function compressImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: "image/webp",
  })
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
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [items, setItems] = React.useState<MenuItem[]>(initialItems)
  const [panelOpen, setPanelOpen] = React.useState(false)
  const [editingItemId, setEditingItemId] = React.useState<string | null>(null)
  const [itemForm, setItemForm] = React.useState<ItemFormState>(EMPTY_ITEM_FORM)
  const [pendingImageFile, setPendingImageFile] = React.useState<File | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [deleteItem, setDeleteItem] = React.useState<string | null>(null)
  const [uploadingItemId, setUploadingItemId] = React.useState<string | null>(null)
  const [imageDeleteTarget, setImageDeleteTarget] = React.useState<
    { id: string; url: string } | null
  >(null)

  const [categoryList, setCategoryList] = React.useState<Category[]>(categories)
  const [addCategoryOpen, setAddCategoryOpen] = React.useState(false)
  const [categoryName, setCategoryName] = React.useState("")
  const [categorySaving, setCategorySaving] = React.useState(false)
  const [categoryDeleting, setCategoryDeleting] = React.useState(false)
  const [editingCategory, setEditingCategory] =
    React.useState<{ id: string; name: string } | null>(null)
  const [deleteCategoryId, setDeleteCategoryId] = React.useState<string | null>(null)
  // Set when the category dialog was opened from the item panel, so the new
  // category is picked for the item being edited.
  const [categoryForItem, setCategoryForItem] = React.useState(false)

  // The chosen category lives in the URL so a reload or a shared link keeps it.
  // An id that no longer matches a category (deleted, or a stale link) falls
  // back to all items instead of an empty list with nothing selected.
  const requestedCategoryId = searchParams.get("category")
  const selectedCategoryId =
    requestedCategoryId && categoryList.some((c) => c.id === requestedCategoryId)
      ? requestedCategoryId
      : null
  function selectCategory(id: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (id) params.set("category", id)
    else params.delete("category")
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const highlightItems = items.filter((i) => i.is_highlight)
  const highlightCount = highlightItems.length
  const editingItem = items.find((item) => item.id === editingItemId) ?? null

  const counts = React.useMemo(() => {
    const map = new Map<string, number>()
    for (const item of items) map.set(item.category_id, (map.get(item.category_id) ?? 0) + 1)
    return map
  }, [items])

  // Sections follow the category list's order: Nook's first, then the
  // owner's own. Items keep their created order inside a section.
  const sections: MenuSection[] = React.useMemo(() => {
    const ordered = [
      ...categoryList.filter((c) => c.is_global),
      ...categoryList.filter((c) => !c.is_global),
    ]
    const known = new Set(ordered.map((c) => c.id))
    const result: MenuSection[] = ordered
      .filter((c) => !selectedCategoryId || c.id === selectedCategoryId)
      .map((c) => ({ id: c.id, name: c.name, items: items.filter((i) => i.category_id === c.id) }))
      .filter((s) => s.items.length > 0 || s.id === selectedCategoryId)
    const orphans = items.filter((i) => !known.has(i.category_id))
    if (!selectedCategoryId && orphans.length > 0) {
      result.push({ id: "uncategorized", name: "Uncategorized", items: orphans })
    }
    // A selected category with nothing in it shows the list's own empty state.
    return result.filter((s) => s.items.length > 0)
  }, [categoryList, items, selectedCategoryId])

  const usedCategoryCount = new Set(items.map((i) => i.category_id)).size

  // ---- Categories ----------------------------------------------------------

  function openAddCategory(forItem = false) {
    setEditingCategory(null)
    setCategoryName("")
    setCategoryForItem(forItem)
    setAddCategoryOpen(true)
  }

  function openEditCategory(cat: Category) {
    setEditingCategory({ id: cat.id, name: cat.name })
    setCategoryName(cat.name)
    setCategoryForItem(false)
    setAddCategoryOpen(true)
  }

  function closeCategoryDialog() {
    setAddCategoryOpen(false)
    setEditingCategory(null)
    setCategoryName("")
    setCategoryForItem(false)
  }

  async function handleSaveCategory() {
    if (categorySaving) return
    setCategorySaving(true)
    try {
      if (editingCategory) {
        const res = await updateCategoryAction(editingCategory.id, categoryName)
        if (!res.ok) {
          toast.error(res.error)
          return
        }
        setCategoryList((prev) =>
          prev.map((c) => (c.id === res.category.id ? { ...c, name: res.category.name } : c))
        )
        setItems((prev) =>
          prev.map((i) =>
            i.category_id === res.category.id && i.menu_categories
              ? { ...i, menu_categories: { ...i.menu_categories, name: res.category.name } }
              : i
          )
        )
        toast.success("Category renamed")
      } else {
        const res = await createCategoryAction(categoryName)
        if (!res.ok) {
          toast.error(res.error)
          return
        }
        setCategoryList((prev) => [
          ...prev,
          { id: res.category.id, name: res.category.name, is_global: false, created_by: cafeId },
        ])
        if (categoryForItem) setItemForm((f) => ({ ...f, categoryId: res.category.id }))
        toast.success("Category added")
      }
      closeCategoryDialog()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save category"
      toast.error(message)
    } finally {
      setCategorySaving(false)
    }
  }

  async function handleDeleteCategory() {
    if (!deleteCategoryId || categoryDeleting) return
    // Had no pending state, so a slow delete looked unresponsive and the
    // confirm button stayed live for repeat taps.
    setCategoryDeleting(true)
    try {
      const res = await deleteCategoryAction(deleteCategoryId)
      if (!res.ok) {
        toast.error(res.error)
        setDeleteCategoryId(null)
        return
      }
      setCategoryList((prev) => prev.filter((c) => c.id !== deleteCategoryId))
      if (selectedCategoryId === deleteCategoryId) selectCategory(null)
      toast.success("Category deleted")
      setDeleteCategoryId(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete category"
      toast.error(message)
      setDeleteCategoryId(null)
    } finally {
      setCategoryDeleting(false)
    }
  }

  // ---- Items ---------------------------------------------------------------

  function resetItemForm() {
    setItemForm(EMPTY_ITEM_FORM)
    setEditingItemId(null)
    setPendingImageFile(null)
  }

  function openAddPanel() {
    resetItemForm()
    // Adding while a category is picked files the item under it.
    const preset = selectedCategoryId && categoryList.some((c) => c.id === selectedCategoryId)
    setItemForm({ ...EMPTY_ITEM_FORM, categoryId: preset ? selectedCategoryId! : "" })
    setPanelOpen(true)
  }

  function openEditPanel(item: MenuItem) {
    const variants = sortedVariants(item)
    setItemForm({
      name: item.name,
      price: item.price.toString(),
      categoryId: item.category_id,
      is_highlight: item.is_highlight,
      sizes: variants.map((v) => ({
        id: v.id,
        label: v.label,
        price: (v.price_override ?? item.price + v.price_modifier).toString(),
        isDefault: v.is_default,
      })),
    })
    setEditingItemId(item.id)
    setPendingImageFile(null)
    setPanelOpen(true)
  }

  async function toggleHighlight(id: string, value: boolean) {
    if (value && highlightCount >= HIGHLIGHT_LIMIT) {
      toast.error(`You can highlight up to ${HIGHLIGHT_LIMIT} items`)
      return
    }
    const item = items.find((i) => i.id === id)
    if (!item) return

    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, is_highlight: value } : i)))
    const revert = () =>
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, is_highlight: !value } : i)))
    try {
      const res = await upsertMenuItemAction({
        id: item.id,
        name: item.name,
        price: item.price,
        category_id: item.category_id,
        is_highlight: value,
        image_url: item.image_url,
      })
      if (!res.ok) {
        revert()
        toast.error(res.error)
        return
      }
      toast.success(value ? `${item.name} is now a highlight` : `${item.name} removed from highlights`)
    } catch {
      revert()
      toast.error("Couldn’t update the highlight. Check your connection and try again.")
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteItem) return
    const id = deleteItem
    setDeleteItem(null)
    const snapshot = items
    setItems((prev) => prev.filter((i) => i.id !== id))
    try {
      const res = await deleteMenuItemAction(id)
      if (!res.ok) {
        setItems(snapshot)
        toast.error(res.error)
        return
      }
      toast.success("Item deleted")
    } catch {
      // Restore the optimistic removal. Without this the item stayed gone
      // locally while still live in the DB and on the public listing, so a
      // failed delete looked like a successful one.
      setItems(snapshot)
      toast.error("Couldn’t delete the item. Check your connection and try again.")
    }
  }

  async function handleSaveItem() {
    if (isSaving) return
    // Enter in a field submits the form even while the button is disabled,
    // so say what's missing instead of doing nothing.
    if (!itemForm.name.trim()) {
      toast.error("Give the item a name")
      return
    }
    if (!itemForm.categoryId) {
      toast.error("Choose a category for the item")
      return
    }

    // Rows left completely blank are dropped rather than rejected.
    const sizes = itemForm.sizes.filter((s) => s.label.trim() || s.price.trim())
    const normalizedVariants = sizes.map((s, index) => ({
      id: s.id,
      label: s.label.trim(),
      price_override: s.price ? Number.parseFloat(s.price) : null,
      price_modifier: 0,
      is_default: s.isDefault,
      sort_order: index,
    }))
    const hasSizes = normalizedVariants.length > 0

    if (hasSizes) {
      if (normalizedVariants.some((v) => !v.label)) {
        toast.error("Give every size a name, like 12 oz or Iced")
        return
      }
      if (
        normalizedVariants.some(
          (v) => v.price_override === null || !Number.isFinite(v.price_override) || v.price_override <= 0
        )
      ) {
        toast.error("Each size needs a price above ₱0")
        return
      }
      if (!normalizedVariants.some((v) => v.is_default)) normalizedVariants[0].is_default = true
    } else {
      // Items without sizes need a real base price — blank/NaN/≤0 is rejected
      // here rather than silently saved as ₱0.00 (or a negative).
      const parsed = Number.parseFloat(itemForm.price)
      if (!Number.isFinite(parsed) || parsed <= 0) {
        toast.error("Enter a base price above ₱0")
        return
      }
    }

    const highlightAllowed =
      highlightCount < HIGHLIGHT_LIMIT || Boolean(editingItem?.is_highlight)
    if (itemForm.is_highlight && !highlightAllowed) {
      toast.error(`You can highlight up to ${HIGHLIGHT_LIMIT} items`)
      return
    }

    const wasNew = !editingItem
    setIsSaving(true)
    try {
      const basePrice = hasSizes
        ? (normalizedVariants.find((v) => v.is_default) ?? normalizedVariants[0]).price_override ?? 0
        : Number.parseFloat(itemForm.price)

      const saved = await upsertMenuItemAction({
        id: editingItemId ?? undefined,
        name: itemForm.name,
        price: basePrice,
        category_id: itemForm.categoryId,
        is_highlight: itemForm.is_highlight && highlightAllowed,
        image_url: editingItem?.image_url ?? null,
      })
      if (!saved.ok) {
        toast.error(saved.error)
        return
      }
      const menuItemId = saved.id
      const category = categoryList.find((c) => c.id === itemForm.categoryId)
      const baseItem: MenuItem = {
        id: menuItemId,
        name: itemForm.name,
        price: basePrice,
        is_highlight: itemForm.is_highlight && highlightAllowed,
        image_url: editingItem?.image_url ?? null,
        category_id: itemForm.categoryId,
        menu_categories: category
          ? { id: category.id, name: category.name, is_global: category.is_global }
          : null,
        menu_item_variants: editingItem?.menu_item_variants ?? [],
      }
      // From here the row exists. Put it in the list now, so a later failure
      // (photo, sizes) can't leave a saved item invisible until a reload, and
      // a second tap on save updates this row instead of inserting another.
      setItems((prev) =>
        prev.some((item) => item.id === menuItemId)
          ? prev.map((item) => (item.id === menuItemId ? baseItem : item))
          : [...prev, baseItem]
      )
      if (!editingItemId) setEditingItemId(menuItemId)

      let imageUrl = baseItem.image_url
      if (itemForm.is_highlight && pendingImageFile && !imageUrl) {
        try {
          const compressed = await compressImage(pendingImageFile)
          const formData = new FormData()
          formData.append("file", compressed)
          const res = await uploadMenuItemImageAction(formData, menuItemId, cafeId)
          if (res.ok) {
            imageUrl = res.url
            setPendingImageFile(null)
          } else toast.error(`Item saved, but the photo didn’t upload: ${res.error}`)
        } catch {
          // Image upload failure is non-fatal — item is still saved
          toast.error("Item saved, but the photo didn’t upload")
        }
      }

      if (imageUrl !== baseItem.image_url) {
        setItems((prev) =>
          prev.map((item) => (item.id === menuItemId ? { ...item, image_url: imageUrl } : item))
        )
      }

      const variantsRes = await upsertMenuItemVariantsAction(menuItemId, normalizedVariants)
      if (!variantsRes.ok) {
        toast.error(variantsRes.error)
        return
      }

      const updatedItem: MenuItem = {
        ...baseItem,
        image_url: imageUrl,
        menu_item_variants: hasSizes ? variantsRes.variants : [],
      }
      setItems((prev) => prev.map((item) => (item.id === menuItemId ? updatedItem : item)))

      resetItemForm()
      setPanelOpen(false)
      toast.success(wasNew ? "Item added" : "Changes saved")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn’t save the item")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleItemImageUpload(id: string, file: File) {
    setUploadingItemId(id)
    // Compression runs before the request, so this covers the whole wait.
    const toastId = toast.loading("Uploading photo…")
    try {
      // compressImage must stay inside the try: it rejects on HEIC, corrupt,
      // and zero-byte files, and outside the try that surfaced as an unhandled
      // rejection with no toast and no spinner reset.
      const compressed = await compressImage(file)
      const formData = new FormData()
      formData.append("file", compressed)
      const res = await uploadMenuItemImageAction(formData, id, cafeId)
      if (!res.ok) throw new Error(res.error)
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, image_url: res.url } : i)))
      toast.success("Photo added", { id: toastId })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed", { id: toastId })
    } finally {
      setUploadingItemId(null)
    }
  }

  async function handleItemImageDelete(id: string, imageUrl: string) {
    setUploadingItemId(id)
    const toastId = toast.loading("Removing photo…")
    try {
      const res = await deleteMenuItemImageAction(id, imageUrl, cafeId)
      if (!res.ok) throw new Error(res.error)
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, image_url: null } : i)))
      toast.success("Photo removed", { id: toastId })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Couldn’t remove the photo", { id: toastId })
    } finally {
      setUploadingItemId(null)
    }
  }

  // ---- Render --------------------------------------------------------------

  const summary =
    items.length === 0
      ? "No items yet."
      : `${items.length} ${items.length === 1 ? "item" : "items"} in ${usedCategoryCount} ${
          usedCategoryCount === 1 ? "category" : "categories"
        }. Prices and highlights show on your café page.`

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">Menu</h1>
            <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
          </div>
          <Button onClick={openAddPanel} className="w-full sm:w-auto">
            <Plus aria-hidden />
            Add item
          </Button>
        </header>

        {items.length === 0 ? (
          <div className="mt-6">
            <EmptyMenu onAdd={openAddPanel} />
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-5">
            <HighlightsStrip
              items={highlightItems}
              uploadingItemId={uploadingItemId}
              onRemove={(id) => void toggleHighlight(id, false)}
              onUpload={handleItemImageUpload}
            />
            <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[264px_minmax(0,1fr)]">
              <CategoryList
                categories={categoryList}
                counts={counts}
                total={items.length}
                selectedId={selectedCategoryId}
                onSelect={selectCategory}
                onAdd={() => openAddCategory()}
                onRename={openEditCategory}
                onDelete={setDeleteCategoryId}
              />
              <MenuItemRows
                sections={sections}
                highlightCount={highlightCount}
                uploadingItemId={uploadingItemId}
                onToggleHighlight={toggleHighlight}
                onEdit={openEditPanel}
                onDelete={setDeleteItem}
                onUpload={handleItemImageUpload}
              />
            </div>
          </div>
        )}
      </div>

      <EditItemPanel
        open={panelOpen}
        onOpenChange={(open) => {
          setPanelOpen(open)
          if (!open) resetItemForm()
        }}
        editingItem={editingItem}
        form={itemForm}
        setForm={setItemForm}
        categories={categoryList}
        highlightCount={highlightCount}
        pendingImageFile={pendingImageFile}
        setPendingImageFile={setPendingImageFile}
        photoBusy={editingItem !== null && uploadingItemId === editingItem.id}
        onUploadPhoto={(file) => editingItem && void handleItemImageUpload(editingItem.id, file)}
        onRemovePhoto={() =>
          editingItem?.image_url &&
          setImageDeleteTarget({ id: editingItem.id, url: editingItem.image_url })
        }
        onNewCategory={() => openAddCategory(true)}
        onSave={handleSaveItem}
        isSaving={isSaving}
      />

      {/* Add / rename category */}
      <Dialog
        open={addCategoryOpen}
        onOpenChange={(open) => {
          if (!open) closeCategoryDialog()
          else setAddCategoryOpen(true)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Rename category" : "New category"}</DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Items in this category keep it under the new name."
                : "Your own category, for things like seasonal drinks. Only your café uses it."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="cat-name">Category name</Label>
            <Input
              id="cat-name"
              placeholder="e.g. Seasonal specials"
              value={categoryName}
              maxLength={60}
              onChange={(e) => setCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && categoryName.trim() && !categorySaving) {
                  e.preventDefault()
                  void handleSaveCategory()
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeCategoryDialog} disabled={categorySaving}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveCategory}
              loading={categorySaving}
              disabled={!categoryName.trim()}
            >
              {editingCategory ? "Save name" : "Add category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete category */}
      <AlertDialog
        open={deleteCategoryId !== null}
        onOpenChange={() => {
          if (!categoryDeleting) setDeleteCategoryId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              {(counts.get(deleteCategoryId ?? "") ?? 0) > 0
                ? "Move its items to another category first — a category with items in it can’t be deleted."
                : "It will be removed from your menu. This can’t be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={categoryDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                // Keep the dialog mounted while the delete is in flight so the
                // pending state is visible instead of flashing closed.
                event.preventDefault()
                void handleDeleteCategory()
              }}
              // The server refuses while items still use it; don't offer a
              // button that can only fail.
              disabled={categoryDeleting || (counts.get(deleteCategoryId ?? "") ?? 0) > 0}
              variant="destructive"
            >
              {categoryDeleting && <Spinner data-icon="inline-start" />}
              {categoryDeleting ? "Deleting…" : "Delete category"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete item */}
      <AlertDialog open={deleteItem !== null} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {items.find((i) => i.id === deleteItem)?.name ?? "this item"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              It will be removed from your menu and your café page. This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDeleteConfirm}>
              Delete item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove item photo */}
      <AlertDialog open={imageDeleteTarget !== null} onOpenChange={() => setImageDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this photo?</AlertDialogTitle>
            <AlertDialogDescription>
              A highlight without a photo is hidden in the app until you add a new one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (imageDeleteTarget) {
                  void handleItemImageDelete(imageDeleteTarget.id, imageDeleteTarget.url)
                }
                setImageDeleteTarget(null)
              }}
            >
              Remove photo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
