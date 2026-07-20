"use client"

import * as React from "react"
import Image from "next/image"
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
} from "@phosphor-icons/react"
import { createClient } from "@/lib/supabase/client"
import { Spinner } from "@/components/ui/spinner"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

// The shared menu button is sized for a desktop pointer (h-8 / 12px text, 16px
// icons). On mobile the sidebar is a full drawer with plenty of room, so size
// rows for a fingertip and drop back to the compact desktop sizing at md.
const MOBILE_ROW =
  "h-11 text-sm [&_svg]:size-5 md:h-8 md:text-xs md:[&_svg]:size-4"

type NavItem = {
  title: string
  url: string
  icon: React.ElementType
}

const SHOW_PREVIEW = false

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/owner/dashboard", icon: SquaresFourIcon },
  { title: "Edit Listing", url: "/owner/profile", icon: PencilSimpleIcon },
  { title: "Photos", url: "/owner/photos", icon: ImagesIcon },
  { title: "Tags", url: "/owner/tags", icon: TagIcon },
  { title: "Menu", url: "/owner/menu", icon: ForkKnifeIcon },
  { title: "Reviews", url: "/owner/reviews", icon: StarIcon },
  ...(SHOW_PREVIEW
    ? [{ title: "Preview", url: "/owner/preview", icon: EyeIcon }]
    : []),
]

export function OwnerSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/owner/dashboard" onClick={closeOnMobile}>
                <Image
                  src="https://lucerocris.sgp1.cdn.digitaloceanspaces.com/nook-sites/app_icon.png"
                  alt="Nook"
                  width={32}
                  height={32}
                  className="size-8 rounded-lg"
                />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Nook</span>
                  <span className="truncate text-xs text-muted-foreground">Cafe Portal</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => {
              const isActive =
                pathname === item.url || pathname.startsWith(item.url + "/")
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className={MOBILE_ROW}
                  >
                    <Link href={item.url} onClick={closeOnMobile}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              onClick={handleLogout}
              disabled={isLoggingOut}
              aria-busy={isLoggingOut}
              className={MOBILE_ROW}
            >
              {isLoggingOut ? <Spinner className="size-4" /> : <SignOutIcon />}
              <span>{isLoggingOut ? "Signing out…" : "Logout"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
