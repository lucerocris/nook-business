"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  SquaresFourIcon,
  PencilSimpleIcon,
  ImagesIcon,
  TagIcon,
  ForkKnifeIcon,
  StarIcon,
  EyeIcon,
  SignOutIcon,
  ArrowSquareOutIcon,
  StorefrontIcon,
} from "@phosphor-icons/react"
import { createClient } from "@/lib/supabase/client"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import type { OwnerCafeContext } from "@/lib/queries/cafes"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// The shared menu button is sized for a desktop pointer (h-8 / 12px text, 16px
// icons). On mobile the sidebar is a full drawer with plenty of room, so size
// rows for a fingertip and drop back to the compact desktop sizing at md.
const MOBILE_ROW =
  "h-11 text-sm [&_svg]:size-5 md:h-8 md:text-[13px] md:[&_svg]:size-4"

// The active page is a pale green chip with green text — a quiet marker on the
// neutral rail rather than a solid fill that competes with the page.
const ACTIVE_PILL =
  "data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground data-active:hover:bg-sidebar-accent data-active:hover:text-sidebar-accent-foreground"

type NavItem = {
  title: string
  url: string
  icon: React.ElementType
}

const SHOW_PREVIEW = false

// Dashboard stands alone; the rest is grouped by who it is for — the listing
// the owner edits, then what customers say about it.
const navGroups: { label?: string; items: NavItem[] }[] = [
  {
    items: [
      { title: "Dashboard", url: "/owner/dashboard", icon: SquaresFourIcon },
    ],
  },
  {
    label: "Your listing",
    items: [
      { title: "Edit listing", url: "/owner/profile", icon: PencilSimpleIcon },
      { title: "Photos", url: "/owner/photos", icon: ImagesIcon },
      { title: "Tags", url: "/owner/tags", icon: TagIcon },
      { title: "Menu", url: "/owner/menu", icon: ForkKnifeIcon },
      ...(SHOW_PREVIEW
        ? [{ title: "Preview", url: "/owner/preview", icon: EyeIcon }]
        : []),
    ],
  },
  {
    label: "Customers",
    items: [{ title: "Reviews", url: "/owner/reviews", icon: StarIcon }],
  },
]

const NOOK_INSTAGRAM = "https://instagram.com/nook_cafefinder"

const STATUS: Record<
  OwnerCafeContext["status"],
  {
    label: string
    pill: string
    body: (name: string) => string
    link: (cafeId: string) => { label: string; href: string }
  }
> = {
  active: {
    label: "Live",
    pill: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    body: (name) => `People can find ${name} on the map and in search.`,
    link: (cafeId) => ({ label: "View on Nook", href: `https://www.nookph.app/cafes/${cafeId}` }),
  },
  draft: {
    label: "Not public yet",
    pill: "bg-[#FFF4DC] text-[#8A5A00] dark:bg-amber-500/15 dark:text-amber-300",
    body: (name) => `People can’t see ${name} until Nook publishes it.`,
    link: () => ({ label: "What happens next", href: NOOK_INSTAGRAM }),
  },
  inactive: {
    label: "Hidden",
    pill: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    body: (name) => `${name} isn’t shown in the Nook app right now.`,
    link: () => ({ label: "Message Nook", href: NOOK_INSTAGRAM }),
  },
}

function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const letters = words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)
  return letters.toUpperCase() || "N"
}

export function OwnerSidebar({
  cafe,
  account,
  claimInReview = false,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  cafe: OwnerCafeContext | null
  account: { name: string | null; email: string | null }
  claimInReview?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { isMobile, setOpenMobile } = useSidebar()

  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  // On mobile the sidebar is an overlay drawer. Navigating is a client-side
  // transition that doesn't unmount it, so without this the drawer stayed open
  // on top of the page the owner just navigated to.
  function closeOnMobile() {
    if (isMobile) setOpenMobile(false)
  }

  async function handleLogout() {
    // signOut() is a network call and /login is server-rendered, so without a
    // pending state the sidebar sat inert after the click and invited repeat
    // presses.
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await supabase.auth.signOut()
      closeOnMobile()
      router.push("/login")
      router.refresh()
    } catch {
      // Sign-out failed (offline, etc.) — let the owner try again.
      setIsLoggingOut(false)
    }
  }

  const status = cafe ? STATUS[cafe.status] : null
  const accountLabel = account.name || account.email || "Your account"

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-3 group-data-[collapsible=icon]:p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              tooltip={cafe?.cafeName ?? "No café linked"}
              className="h-auto gap-3 py-2 hover:bg-sidebar-accent/60"
            >
              <Link href="/owner/dashboard" onClick={closeOnMobile}>
                {!cafe ? (
                  <span
                    aria-hidden
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent/60 text-sidebar-foreground group-data-[collapsible=icon]:size-8"
                  >
                    <StorefrontIcon className="size-4" />
                  </span>
                ) : cafe.featuredImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cafe.featuredImageUrl}
                    alt=""
                    className="size-9 shrink-0 rounded-lg object-cover group-data-[collapsible=icon]:size-8"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-xs font-semibold tracking-tight text-sidebar-primary-foreground group-data-[collapsible=icon]:size-8"
                  >
                    {initials(cafe.cafeName)}
                  </span>
                )}
                <span className="grid min-w-0 flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {cafe?.cafeName ?? "No café linked"}
                  </span>
                  <span className="truncate text-xs text-sidebar-foreground/75">
                    Nook café portal
                  </span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {navGroups.map((group, i) => (
          <SidebarGroup key={i} className="px-3 py-1.5 group-data-[collapsible=icon]:px-2">
            {group.label && (
              <SidebarGroupLabel className="h-7 px-2 text-[11px] font-medium tracking-wide text-sidebar-foreground/65 uppercase">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarMenu>
              {group.items.map((item) => {
                const isActive =
                  pathname === item.url || pathname.startsWith(item.url + "/")
                // Every owner page needs a café; without one they'd only
                // bounce to /owner/no-cafe, so show them as locked instead.
                if (!cafe) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        aria-disabled
                        tooltip={`${item.title} — unlocks once a café is linked`}
                        className={cn(MOBILE_ROW, "cursor-not-allowed opacity-45 hover:bg-transparent active:bg-transparent")}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                }
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(MOBILE_ROW, ACTIVE_PILL)}
                    >
                      <Link
                        href={item.url}
                        onClick={closeOnMobile}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <item.icon weight={isActive ? "fill" : "regular"} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="gap-3 p-3 group-data-[collapsible=icon]:p-2">
        {cafe && status ? (
          <div className="rounded-lg border border-sidebar-border bg-background p-3 group-data-[collapsible=icon]:hidden">
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                status.pill
              )}
            >
              {status.label}
            </span>
            <p className="mt-2 text-xs leading-relaxed text-sidebar-foreground">
              {status.body(cafe.cafeName)}
            </p>
            <a
              href={status.link(cafe.cafeId).href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-8 items-center gap-1 rounded-md text-xs font-medium text-foreground underline-offset-4 outline-hidden hover:underline focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            >
              {status.link(cafe.cafeId).label}
              <ArrowSquareOutIcon className="size-3.5" aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        ) : (
          <div className="rounded-lg border border-sidebar-border bg-background p-3 group-data-[collapsible=icon]:hidden">
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                claimInReview ? "bg-[#FFF4DC] text-[#8A5A00] dark:bg-amber-500/15 dark:text-amber-300" : "bg-muted text-muted-foreground"
              )}
            >
              {claimInReview ? "Claim in review" : "No café linked"}
            </span>
            <p className="mt-2 text-xs leading-relaxed text-sidebar-foreground">
              {claimInReview
                ? "These pages unlock once your claim is approved."
                : "These pages unlock once a café is linked to this account."}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-sidebar-border pt-3 group-data-[collapsible=icon]:border-t-0 group-data-[collapsible=icon]:pt-0">
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-[11px] font-semibold text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden"
          >
            {initials(accountLabel)}
          </span>
          <span className="grid min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-[13px] font-medium">{accountLabel}</span>
            {account.name && account.email && (
              <span className="truncate text-xs text-sidebar-foreground/75">
                {account.email}
              </span>
            )}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                aria-busy={isLoggingOut}
                aria-label={isLoggingOut ? "Signing out…" : "Sign out"}
                className="flex size-11 shrink-0 items-center justify-center rounded-md outline-hidden hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring active:bg-sidebar-accent disabled:opacity-60 md:size-8"
              >
                {isLoggingOut ? (
                  <Spinner className="size-4" />
                ) : (
                  <SignOutIcon className="size-5 md:size-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" hidden={isMobile}>
              {isLoggingOut ? "Signing out…" : "Sign out"}
            </TooltipContent>
          </Tooltip>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
