import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

export const metadata: Metadata = { title: "Preview" }
import {
  ArrowLeft,
  Eye,
  Heart,
  Image,
  ImageSquare,
  InstagramLogo,
  MapPin,
  MapTrifold,
  NavigationArrow,
  PencilSimple,
  Star,
  TiktokLogo,
} from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { getOwnerCafe } from "@/lib/owner/get-owner-cafe"
import { getReviewsForCafe } from "@/lib/queries/reviews"

const SHOW_OWNER_PREVIEW = false

export default async function OwnerPreviewPage() {
  if (!SHOW_OWNER_PREVIEW) {
    notFound()
  }

  const cafe = await getOwnerCafe()
  const reviews = await getReviewsForCafe(cafe.id, { limit: 2 })

  const tags = (
    cafe.cafe_tags as {
      tag_id: string
      is_featured: boolean
      tags: { id: string; name: string } | null
    }[] | null
  ) ?? []

  const menuHighlights = (
    cafe.menu_items as {
      id: string
      name: string
      price: number
      is_highlight: boolean
      image_url: string | null
    }[] | null
  )?.filter((i) => i.is_highlight).slice(0, 5) ?? []

  const location = [cafe.neighborhood, cafe.city].filter(Boolean).join(", ")

  return (
    <div className=" w-full max-w-6xl mx-auto flex flex-col h-full">

      {/* Toolbar */}
      <div className="border-b bg-background px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-2 sticky top-0 z-10">
        <div className="flex flex-row items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/owner/dashboard">
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back to dashboard</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-5 hidden sm:block" />
          <p className="text-sm text-muted-foreground hidden sm:block">
            Preview - {cafe.name}
          </p>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            <Eye size={12} />
            Read only
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <Link href="/owner/profile">
              <PencilSimple size={16} />
              Edit listing
            </Link>
          </Button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex justify-center py-8 px-4 bg-muted min-h-screen">

        {/* Mobile device frame */}
        <div className="w-97.5 bg-background rounded-[40px] border-[3px] border-foreground/20 shadow-2xl overflow-hidden">
          <div className="overflow-y-auto max-h-211">

            {/* 1 - Hero image */}
            <div className="relative h-64 bg-muted">
              {cafe.featured_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cafe.featured_image_url}
                  alt={cafe.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                  <Image size={40} />
                  <p className="text-xs">No hero photo yet</p>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <div className="size-8 rounded-full bg-background/80 flex items-center justify-center">
                  <ArrowLeft size={16} />
                </div>
              </div>
              <div className="absolute top-4 right-4">
                <div className="size-8 rounded-full bg-background/80 flex items-center justify-center">
                  <Heart size={16} />
                </div>
              </div>
            </div>

            {/* 2 - Cafe info */}
            <div className="px-5 pt-4 pb-3 space-y-2">
              <div className="flex flex-row items-start justify-between gap-2">
                <h2 className="text-xl font-bold leading-tight">
                  {cafe.name}
                </h2>
                {cafe.is_new && (
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    New
                  </Badge>
                )}
              </div>

              <div className="flex flex-row items-center gap-2 text-sm flex-wrap">
                {cafe.rating != null && (
                  <>
                    <div className="flex flex-row items-center gap-0.5">
                      <Star size={14} weight="fill" className="text-yellow-400" />
                      <span className="font-semibold">{cafe.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-muted-foreground">({cafe.review_count} reviews)</span>
                    <span className="text-muted-foreground">.</span>
                  </>
                )}
              </div>

              {location && (
                <div className="flex flex-row items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin size={14} />
                  <span>{location}</span>
                </div>
              )}
            </div>

            {/* 3 - Tag pills */}
            {tags.length > 0 && (
              <div className="px-5 pb-3">
                <div className="flex flex-row gap-2 overflow-x-auto pb-1">
                  {tags
                    .filter((t) => t.tags?.name)
                    .map((t) => (
                      <Badge
                        key={t.tag_id}
                        variant={t.is_featured ? "default" : "secondary"}
                        className="text-sm whitespace-nowrap"
                      >
                        {t.tags!.name}
                      </Badge>
                    ))}
                </div>
              </div>
            )}

            {/* 4 - Divider */}
            <Separator className="mx-5" style={{ width: "calc(100% - 2.5rem)" }} />

            {/* 5 - Description */}
            {cafe.description && (
              <div className="px-5 py-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {cafe.description}
                </p>
              </div>
            )}

            {/* 6 - Menu Highlights */}
            {menuHighlights.length > 0 && (
              <div className="px-5 pb-4">
                <p className="text-sm font-semibold mb-3">Menu Highlights</p>
                <div className="flex flex-row gap-3 overflow-x-auto">
                  {menuHighlights.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-1.5 shrink-0 w-28"
                    >
                      <div className="aspect-square rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                        {item.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageSquare size={20} className="text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-xs font-medium leading-tight">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PHP {item.price.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7 - Divider */}
            <Separator className="mx-5" style={{ width: "calc(100% - 2.5rem)" }} />

            {/* 8 - Location & Contacts */}
            <div className="px-5 pb-4 space-y-3">
              <p className="text-sm font-semibold">Location &amp; Contacts</p>

              <div className="h-28 w-full bg-muted rounded-xl flex items-center justify-center">
                <MapTrifold size={24} className="text-muted-foreground" />
              </div>

              {cafe.address && (
                <p className="text-xs text-muted-foreground">{cafe.address}</p>
              )}

              <button className="w-full h-9 text-sm gap-2 rounded-md border flex items-center justify-center">
                <NavigationArrow size={16} />
                Get Directions
              </button>

              <div className="flex flex-row gap-3">
                {cafe.social_links?.instagram && (
                  <InstagramLogo size={20} className="text-muted-foreground" />
                )}
                {cafe.social_links?.tiktok && (
                  <TiktokLogo size={20} className="text-muted-foreground" />
                )}
              </div>
            </div>

            {/* 9 - Reviews */}
            {reviews.length > 0 && (
              <div className="px-5 pb-6">
                <div className="flex flex-row items-center justify-between mb-4">
                  <p className="text-sm font-semibold">Reviews</p>
                  <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    See All
                  </button>
                </div>

                <div>
                  {reviews.map((review, idx) => (
                    <div
                      key={review.id}
                      className={`py-3 ${idx < reviews.length - 1 ? "border-b" : ""}`}
                    >
                      <div className="flex flex-row items-center justify-between mb-1">
                        <span className="text-xs font-medium">
                          {review.profiles?.full_name ?? "Anonymous"}
                        </span>
                        <div className="flex flex-row gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              weight={i < review.rating ? "fill" : "regular"}
                              className={
                                i < review.rating
                                  ? "text-yellow-400"
                                  : "text-muted-foreground"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {review.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom safe area */}
            <div className="h-8" />

          </div>
        </div>
      </div>
    </div>
  )
}
