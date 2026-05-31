"use client"

import * as React from "react"
import {
  ChatCircle,
  Flag,
  MagnifyingGlass,
  Star,
} from "@phosphor-icons/react"
import { toast } from "sonner"

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
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

type Review = {
  id: string
  rating: number
  content: string
  created_at: string
  profiles: {
    full_name: string | null
    username: string | null
    avatar_url: string | null
  } | null
}

type Cafe = {
  rating: number | null
  review_count: number
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex flex-row gap-0.5 items-center">
      {Array.from({ length: 5 }).map((_, i) =>
        i < rating ? (
          <Star key={i} size={14} weight="fill" className="text-yellow-400" />
        ) : (
          <Star key={i} size={14} className="text-muted-foreground" />
        )
      )}
    </div>
  )
}

function getInitials(full_name: string | null, username: string | null): string {
  if (full_name) {
    const parts = full_name.trim().split(" ")
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
  if (username) return username.replace("@", "").slice(0, 2).toUpperCase()
  return "?"
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

export function OwnerReviewsClient({
  reviews,
  cafe,
}: {
  reviews: Review[]
  cafe: Cafe
}) {
  const [search, setSearch] = React.useState("")
  const [ratingFilter, setRatingFilter] = React.useState("all")
  const [sort, setSort] = React.useState("recent")
  const [reportReview, setReportReview] = React.useState<string | null>(null)

  const ratingBreakdown = React.useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) counts[r.rating]++
    })
    const total = reviews.length
    return [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: counts[stars],
      pct: total > 0 ? Math.round((counts[stars] / total) * 100) : 0,
    }))
  }, [reviews])

  const filtered = React.useMemo(() => {
    let list = [...reviews]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (r) =>
          (r.profiles?.full_name ?? "").toLowerCase().includes(q) ||
          (r.profiles?.username ?? "").toLowerCase().includes(q) ||
          r.content.toLowerCase().includes(q)
      )
    }

    if (ratingFilter !== "all") {
      const n = parseInt(ratingFilter)
      list = list.filter((r) => r.rating === n)
    }

    if (sort === "highest") list.sort((a, b) => b.rating - a.rating)
    else if (sort === "lowest") list.sort((a, b) => a.rating - b.rating)

    return list
  }, [reviews, search, ratingFilter, sort])

  const avgRating = cafe.rating ?? (
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null
  )

  return (
    <>
      <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6">

        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold">Reviews</h1>
          <p className="text-sm text-muted-foreground">
            All reviews for your cafe — read-only in Phase 1
          </p>
        </div>


        {/* Summary Card */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">

              {/* Overall rating */}
              <div className="flex flex-row items-center gap-4 sm:flex-col sm:items-center sm:gap-1 sm:shrink-0">
                <span className="text-4xl font-bold">
                  {avgRating != null ? avgRating.toFixed(1) : "—"}
                </span>
                <div className="flex flex-row gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      weight={
                        avgRating != null && i < Math.round(avgRating)
                          ? "fill"
                          : "regular"
                      }
                      className={
                        avgRating != null && i < Math.round(avgRating)
                          ? "text-yellow-400"
                          : "text-muted-foreground"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {cafe.review_count} reviews
                </span>
              </div>

              <Separator orientation="vertical" className="h-20 hidden sm:block" />

              {/* Breakdown */}
              <div className="flex-1 space-y-1.5">
                {ratingBreakdown.map(({ stars, pct, count }) => (
                  <div key={stars} className="flex items-center gap-3">
                    <div className="flex flex-row items-center gap-0.5 w-16 shrink-0">
                      <span className="text-xs text-muted-foreground">{stars}</span>
                      <Star size={12} className="text-yellow-400" />
                    </div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-4 text-right shrink-0">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters Bar */}
        <div className="flex flex-row items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlass
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search reviews..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All ratings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ratings</SelectItem>
              <SelectItem value="5">5 stars</SelectItem>
              <SelectItem value="4">4 stars</SelectItem>
              <SelectItem value="3">3 stars</SelectItem>
              <SelectItem value="2">2 stars</SelectItem>
              <SelectItem value="1">1 star</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Most recent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most recent</SelectItem>
              <SelectItem value="highest">Highest rated</SelectItem>
              <SelectItem value="lowest">Lowest rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reviews List Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-row items-center justify-between">
              <CardTitle>All reviews</CardTitle>
              <Badge variant="secondary">{cafe.review_count} total</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-0 p-0">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground px-6 py-8 text-center">
                No reviews match your filters.
              </p>
            ) : (
              filtered.map((review) => (
                <div
                  key={review.id}
                  className="flex flex-row items-start gap-4 px-6 py-4 border-b last:border-0"
                >
                  {/* Avatar */}
                  <div className="size-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                    {getInitials(
                      review.profiles?.full_name ?? null,
                      review.profiles?.username ?? null
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex flex-row items-center justify-between gap-2">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-sm font-medium truncate">
                          {review.profiles?.full_name ?? "Anonymous"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {review.profiles?.username
                            ? `@${review.profiles.username}`
                            : ""}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        {formatRelativeDate(review.created_at)}
                      </span>
                    </div>

                    <StarRow rating={review.rating} />

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {review.content}
                    </p>

                    <div className="flex flex-row justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-muted-foreground gap-1.5 hover:text-destructive"
                        onClick={() => setReportReview(review.id)}
                      >
                        <Flag size={14} />
                        Report
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Report Review Dialog */}
      <AlertDialog
        open={reportReview !== null}
        onOpenChange={() => setReportReview(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report this review?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send a notification to the Nook team for review. The
              review will remain visible until the team takes action. We do not
              remove reviews on behalf of owners.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setReportReview(null)
                console.log("Review reported — the Nook team will take a look.")
                toast.success("Report sent to the Nook team")
              }}
            >
              Send Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
