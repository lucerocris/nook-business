export type Category = {
  id: string
  name: string
  is_global: boolean
  created_by: string | null
}

export type MenuItemVariant = {
  id: string
  label: string
  price_override: number | null
  price_modifier: number
  is_default: boolean
  sort_order: number
}

export type MenuItem = {
  id: string
  name: string
  price: number
  is_highlight: boolean
  image_url: string | null
  category_id: string
  menu_categories: { id: string; name: string; is_global: boolean } | null
  menu_item_variants?: MenuItemVariant[] | null
}

export const HIGHLIGHT_LIMIT = 5

// Whole pesos read as ₱160; centavos only when there are any.
export function formatPrice(value: number) {
  return `₱${Number.isInteger(value) ? value.toLocaleString("en-PH") : value.toFixed(2)}`
}

function variantPrice(variant: MenuItemVariant, basePrice: number) {
  return variant.price_override ?? basePrice + variant.price_modifier
}

export function sortedVariants(item: MenuItem) {
  return [...(item.menu_item_variants ?? [])].sort((a, b) => a.sort_order - b.sort_order)
}

export function itemPriceLabel(item: MenuItem) {
  const variants = item.menu_item_variants ?? []
  if (variants.length === 0) return formatPrice(item.price)
  const prices = variants.map((v) => variantPrice(v, item.price)).filter(Number.isFinite)
  if (prices.length === 0) return formatPrice(item.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? formatPrice(min) : `${formatPrice(min)} – ${formatPrice(max)}`
}

// "2 sizes · 12 oz, 16 oz · ₱160 – ₱180", or just the price for a single-price item.
export function itemDetailLine(item: MenuItem) {
  const variants = sortedVariants(item)
  if (variants.length === 0) return itemPriceLabel(item)
  const labels = variants.map((v) => v.label).join(", ")
  const count = `${variants.length} ${variants.length === 1 ? "size" : "sizes"}`
  return `${count} · ${labels} · ${itemPriceLabel(item)}`
}
