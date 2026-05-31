import { createAdminClient } from "@/lib/supabase/admin"

type LinkedCafe = {
  owner_id: string
  role: string
  cafes: {
    id: string
    name: string
    neighborhood: string
    status: string
  } | null
}

export async function getOwners() {
  const supabase = createAdminClient()

  const [usersResult, linksResult] = await Promise.all([
    supabase.auth.admin.listUsers(),
    supabase
      .from("cafe_owner_cafe")
      .select(`
        owner_id, role,
        cafes ( id, name, neighborhood, status )
      `),
  ])

  const {
    data: { users },
    error,
  } = usersResult
  if (error) throw error

  const { data: links, error: linksError } = linksResult
  if (linksError) throw linksError

  const owners = users.filter(
    (u) => u.app_metadata?.role === "cafe_owner"
  )

  const normalizedLinks: LinkedCafe[] = (links ?? []).map((link: any) => {
    const cafe = Array.isArray(link.cafes)
      ? (link.cafes[0] ?? null)
      : (link.cafes ?? null)

    return {
      owner_id: link.owner_id,
      role: link.role,
      cafes: cafe,
    }
  })

  const linksByOwnerId = normalizedLinks.reduce<Record<string, LinkedCafe[]>>((acc, link) => {
    if (!acc[link.owner_id]) acc[link.owner_id] = []
    acc[link.owner_id].push(link)
    return acc
  }, {})

  return owners.map((user) => ({
    id:               user.id,
    email:            user.email,
    created_at:       user.created_at,
    last_sign_in_at:  user.last_sign_in_at,
    linked_cafes:     linksByOwnerId[user.id] ?? [],
  }))
}

export async function createOwnerAccount(payload: {
  email: string
  full_name: string
  role: "owner" | "manager"
  cafe_id: string
}) {
  const supabase = createAdminClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

  // inviteUserByEmail creates the account AND sends the invite email in one step
  const { data: { user }, error: inviteError } =
    await supabase.auth.admin.inviteUserByEmail(payload.email, {
      data: {
        full_name: payload.full_name,
        password_changed: false,
      },
      redirectTo: `${siteUrl}/login/reset-password`,
    })

  if (inviteError) throw inviteError
  if (!user) throw new Error("User creation failed")

  // Set role in app_metadata (inviteUserByEmail only sets user_metadata)
  const { error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { app_metadata: { role: "cafe_owner" } }
  )
  if (updateError) throw updateError

  const { error: linkError } = await supabase
    .from("cafe_owner_cafe")
    .insert({
      owner_id: user.id,
      cafe_id: payload.cafe_id,
      role: payload.role,
    })

  if (linkError) throw linkError

  return { userId: user.id }
}

export async function resendCredentials(ownerId: string) {
  const supabase = createAdminClient()
  const { data: { user } } =
    await supabase.auth.admin.getUserById(ownerId)
  if (!user?.email) throw new Error("Owner not found")

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${siteUrl}/login/reset-password`,
  })
  if (error) throw error
}

export async function revokeOwnerAccess(
  ownerId: string,
  cafeId: string
) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("cafe_owner_cafe")
    .delete()
    .match({ owner_id: ownerId, cafe_id: cafeId })

  if (error) throw error
}
