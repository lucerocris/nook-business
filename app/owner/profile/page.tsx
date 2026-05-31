import type { Metadata } from "next"
import { getOwnerCafe } from "@/lib/owner/get-owner-cafe"
import { OwnerProfileClient } from "@/components/owner/profile-client"

export const metadata: Metadata = { title: "Profile" }

export default async function OwnerProfilePage() {
  const cafe = await getOwnerCafe()

  return <OwnerProfileClient cafe={cafe} />
}

