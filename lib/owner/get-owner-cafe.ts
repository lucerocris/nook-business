import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import {
  getCafeForOwner,
  getOwnerCafeContextByOwnerUserId,
} from "@/lib/queries/cafes"

export async function getOwnerCafeContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const context = await getOwnerCafeContextByOwnerUserId(user.id)
  // The owner is signed in and gated in (they have an owner link), but no cafe
  // resolved. Send them to a dedicated screen — redirecting to /login here would
  // bounce back through middleware into a loop.
  if (!context) redirect("/owner/no-cafe")

  return context
}

export async function getOwnerCafe() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const cafe = await getCafeForOwner(user.id)
  if (!cafe) redirect("/owner/no-cafe")

  return cafe
}
