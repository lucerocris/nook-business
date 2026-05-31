"use client"

import Link from "next/link"
import {
  CalendarBlank,
  ChartBar,
  ChatCircle,
  CheckCircle,
  Clock,
  Eye,
  Heart,
  Image,
  Images,
  MapPin,
  NavigationArrow,
  PencilSimple,
  Star,
  Tag,
  XCircle,
} from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type Review = {
  id: string
  rating: number
  content: string
  created_at: string
  profiles: { full_name: string | null; username: string | null } | null
}

type Cafe = {
  id: string
  name: string
  status: "draft" | "active" | "inactive"
  rating: number | null
  review_count: number
  featured_image_url: string | null
  neighborhood: string | null
  city: string
}

type AnalyticsTotals = {
  views: number
  hours: number
  directions: number
  favorites: number
}

const SHOW_PREVIEW = false

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) =>
        i < rating ? (
          <Star key={i} size={12} weight="fill" className="text-yellow-400" />
        ) : (
          <Star key={i} size={12} className="text-muted-foreground" />
        )
      )}
    </div>
  )
}

function formatRelativeDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "1 day ago"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 14) return "1 week ago"
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 60) return "1 month ago"
  return `${Math.floor(diffDays / 30)} months ago`
}

function getInitials(name: string | null, username: string | null): string {
  if (name) {
    const parts = name.trim().split(" ")
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
  if (username) return username.slice(0, 2).toUpperCase()
  return "?"
}

export function OwnerDashboardClient({
  cafe,
  recentReviews,
  analytics,
}: {
  cafe: Cafe
  recentReviews: Review[]
  analytics: AnalyticsTotals
}) {
  const isActive = cafe.status === "active"
  const location = [cafe.neighborhood, cafe.city].filter(Boolean).join(", ")

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8 space-y-8">
      
      {/* Section 1 — Listing Status Banner */}
      {isActive ? (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-950">
          <CheckCircle
            size={20}
            className="text-green-600 dark:text-green-400 shrink-0"
          />
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              Your listing is live on Nook
            </p>
            <p className="text-xs text-green-700 dark:text-green-300">
              Users can find you on the map and in search.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950">
          <XCircle
            size={20}
            className="text-amber-600 dark:text-amber-400 shrink-0"
          />
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Your listing is {cafe.status}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Contact the Nook team to get your listing activated.
            </p>
          </div>
        </div>
      )}

      {/* Section 2 — App Traffic (Last 30 Days) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">App Traffic (Last 30 Days)</h2>
          <Badge variant="secondary" className="font-normal">
            Updated daily @ 10PM
          </Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardDescription>Profile Views</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {analytics.views.toLocaleString()}
              </CardTitle>
              <CardAction>
                <Badge variant="outline" className="px-1.5">
                  <Eye size={14} />
                </Badge>
              </CardAction>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Route Requests</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {analytics.directions.toLocaleString()}
              </CardTitle>
              <CardAction>
                <Badge variant="outline" className="px-1.5">
                  <NavigationArrow size={14} />
                </Badge>
              </CardAction>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Times Saved</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {analytics.favorites.toLocaleString()}
              </CardTitle>
              <CardAction>
                <Badge variant="outline" className="px-1.5">
                  <Heart 
                    size={14} 
                    weight={analytics.favorites > 0 ? "fill" : "regular"} 
                    className={analytics.favorites > 0 ? "text-red-500" : ""}
                  />
                </Badge>
              </CardAction>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Hours Checked</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {analytics.hours.toLocaleString()}
              </CardTitle>
              <CardAction>
                <Badge variant="outline" className="px-1.5">
                  <Clock size={14} />
                </Badge>
              </CardAction>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Section 3 — Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>
                Common tasks for managing your listing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="justify-start gap-3 h-auto py-3 px-4"
                  asChild
                >
                  <Link href="/owner/profile">
                    <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <PencilSimple size={16} className="text-muted-foreground" />
                    </div>
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-sm font-medium">Edit Listing</span>
                      <span className="text-xs text-muted-foreground">
                        Update description and details
                      </span>
                    </div>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="justify-start gap-3 h-auto py-3 px-4"
                  asChild
                >
                  <Link href="/owner/photos">
                    <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <Images size={16} className="text-muted-foreground" />
                    </div>
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-sm font-medium">Manage Photos</span>
                      <span className="text-xs text-muted-foreground">
                        Upload and reorder gallery
                      </span>
                    </div>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="justify-start gap-3 h-auto py-3 px-4"
                  asChild
                >
                  <Link href="/owner/profile">
                    <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <Clock size={16} className="text-muted-foreground" />
                    </div>
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-sm font-medium">Update Hours</span>
                      <span className="text-xs text-muted-foreground">
                        Set your opening times
                      </span>
                    </div>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="justify-start gap-3 h-auto py-3 px-4"
                  asChild
                >
                  <Link href="/owner/reviews">
                    <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <ChatCircle size={16} className="text-muted-foreground" />
                    </div>
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-sm font-medium">View Reviews</span>
                      <span className="text-xs text-muted-foreground">
                        See what customers are saying
                      </span>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Reviews Card */}
          <Card>
            <CardHeader>
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <CardTitle>Recent reviews</CardTitle>
                  <CardDescription>
                    Last {recentReviews.length} reviews
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/owner/reviews">View all →</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-0">
              {recentReviews.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No reviews yet.
                </p>
              ) : (
                recentReviews.map((review) => (
                  <div
                    key={review.id}
                    className="flex flex-row items-start gap-3 py-4 border-b last:border-0"
                  >
                    <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                      {getInitials(
                        review.profiles?.full_name ?? null,
                        review.profiles?.username ?? null
                      )}
                    </div>
                    <div className="flex flex-col flex-1 gap-1">
                      <div className="flex flex-row items-center justify-between">
                        <span className="text-sm font-medium">
                          {review.profiles?.full_name ??
                            review.profiles?.username ??
                            "Anonymous"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeDate(review.created_at)}
                        </span>
                      </div>
                      <StarRating rating={review.rating} />
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                        {review.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 flex flex-col gap-6">

          {/* Listing Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your listing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video w-full bg-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground border overflow-hidden">
                {cafe.featured_image_url ? (
                  <img
                    src={cafe.featured_image_url}
                    alt={cafe.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <Image size={24} />
                    <p className="text-xs mt-1">No hero photo yet</p>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold">{cafe.name}</p>
                {location && (
                  <div className="flex flex-row items-center gap-1.5">
                    <MapPin size={12} className="text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{location}</p>
                  </div>
                )}
                {cafe.rating != null && (
                  <div className="flex flex-row items-center gap-1.5 mt-0.5">
                    <div className="flex flex-row items-center gap-0.5">
                      <Star size={12} weight="fill" className="text-yellow-400" />
                      <span className="text-xs font-medium">
                        {cafe.rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({cafe.review_count} reviews)
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex flex-row justify-between items-center">
                <span className="text-xs text-muted-foreground">Status</span>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`size-1.5 rounded-full ${
                      cafe.status === "active"
                        ? "bg-green-500"
                        : cafe.status === "inactive"
                        ? "bg-red-500"
                        : "bg-amber-500"
                    }`}
                  />
                  <span className="text-xs font-medium capitalize">
                    {cafe.status}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                asChild
              >
                <Link href="/owner/profile">
                  <PencilSimple size={14} />
                  Edit listing
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Phase 3 Coming Soon Card */}
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base">Coming Soon</CardTitle>
              <CardDescription>More tools to grow your cafe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-1">
                <ChartBar size={16} className="shrink-0" />
                Full analytics dashboard
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-1">
                <Tag size={16} className="shrink-0" />
                Vouchers &amp; deals
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-1">
                <CalendarBlank size={16} className="shrink-0" />
                Event promotion
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}