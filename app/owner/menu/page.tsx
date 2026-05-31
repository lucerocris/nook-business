

import type { Metadata } from "next"
import { getOwnerCafe } from "@/lib/owner/get-owner-cafe"
import { getCategoriesForCafe } from "@/lib/queries/menu"
import { OwnerMenuClient } from "@/components/owner/menu-client"

export const metadata: Metadata = { title: "Menu" }

export default async function OwnerMenuPage() {
  const cafe = await getOwnerCafe()
  const categories = await getCategoriesForCafe(cafe.id)

  return (
    <OwnerMenuClient
      items={(cafe.menu_items as NonNullable<typeof cafe.menu_items>) ?? []}
      categories={categories}
      cafeId={cafe.id}
    />
  )
}
