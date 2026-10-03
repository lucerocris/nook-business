"use client"

import * as React from "react"
import { Flag, MagnifyingGlass, Star } from "@phosphor-icons/react"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

import { ReviewReportDialog } from "@/components/owner/review-report-dialog"

type Review = {
  id: string
  cafe_id: string
  rating: number
  content: string | null // star-only reviews have null content
  created_at: string
  profiles: {
    full_name: string | null
    username: string | null
    avatar_url: string | null
  } | null
}

type Cafe = {
  id: string
  rating: number | null
  review_count: number
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div
      role="img"
      aria-label={`${rating} out of 5 stars`}
      className="flex shrink-0 flex-row items-center gap-0.5"
    >
      {Array.from({ length: 5 }).map((_, i) =>
        i < rating ? (
          <Star key={i} size={13} weight="fill" aria-hidden="true" />
        ) : (
          <Star key={i} size={13} aria-hidden="true" className="text-muted-foreground/60" />
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
  reportedReviewIds,
}: {
  reviews: Review[]
  cafe: Cafe
  reportedReviewIds: string[]
}) {
  const [search, setSearch] = React.useState("")
  const [ratingFilter, setRatingFilter] = React.useState("all")
  const [sort, setSort] = React.useState("recent")
  const [reportReviewId, setReportReviewId] = React.useState<string | null>(null)
  const [reportSession, setReportSession] = React.useState(0)
  const [reportedIds, setReportedIds] = React.useState<Set<string>>(
    () => new Set(reportedReviewIds)
  )

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
          (r.content ?? "").toLowerCase().includes(q)
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

  // From the visible reviews, not cafe.rating, which also counts reviews
  // moderation has hidden.
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null

  function handleReported(reviewId: string) {
    setReportedIds((prev) => {
      if (prev.has(reviewId)) return prev
      const next = new Set(prev)
      next.add(reviewId)
      return next
    })
  }

  function openReportDialog(reviewId: string) {
    setReportSession((s) => s + 1)
    setReportReviewId(reviewId)
  }

  const thisMonth = React.useMemo(() => {
    const now = new Date()
    return reviews.filter((r) => {
      const d = new Date(r.created_at)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    }).length
  }, [reviews])

  const hasFilters = search.trim() !== "" || ratingFilter !== "all"

  return (
    <>
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div>
          <h1 className="text-2xl font-semibold">Reviews</h1>
          <p className="text-sm text-muted-foreground">
            Reviews from Nook visitors. Report any that break the rules.
          </p>
        </div>

        {reviews.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-1 px-5 py-12 text-center">
              <Star size={26} aria-hidden="true" className="mb-1 text-muted-foreground" />
              <p className="text-base font-semibold">No reviews yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                When people rate or review your café in the Nook app, it shows
                up here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="flex flex-col gap-5 px-5 sm:flex-row sm:items-center sm:gap-12">
                <div className="shrink-0">
                  <div className="flex items-center gap-2">
                    <Star size={26} weight="fill" aria-hidden="true" />
                    <span className="text-4xl font-semibold tabular-nums">
                      {avgRating != null ? avgRating.toFixed(1) : "—"}
                    </span>
                  </div>
                  {/* Counts the reviews actually shown. cafe.review_count
                      includes ones hidden by moderation, so it disagreed with
                      both this list and the average rating computed above it. */}
                  <p className="mt-1 text-sm text-muted-foreground">
                    {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                    {thisMonth > 0 ? ` · ${thisMonth} this month` : ""}
                  </p>
                </div>

                <ul className="w-full max-w-sm space-y-1.5">
                  {ratingBreakdown.map(({ stars, pct, count }) => (
                    <li key={stars} className="flex items-center gap-3 text-xs">
                      <span className="flex w-7 shrink-0 items-center gap-0.5 tabular-nums">
                        {stars}
                        <Star size={11} weight="fill" aria-hidden="true" />
                        <span className="sr-only">stars</span>
                      </span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <span
                          className="block h-full rounded-full bg-foreground"
                          style={{ width: `${pct}%` }}
                        />
                      </span>
                      <span className="w-6 shrink-0 text-right text-muted-foreground tabular-nums">
                        {count}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative sm:w-80">
                <MagnifyingGlass
                  size={16}
                  aria-hidden="true"
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="search"
                  aria-label="Search reviews"
                  placeholder="Search reviews"
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger aria-label="Filter by rating" className="flex-1 sm:w-36 sm:flex-none">
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
                  <SelectTrigger aria-label="Sort reviews" className="flex-1 sm:w-40 sm:flex-none">
                    <SelectValue placeholder="Most recent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most recent</SelectItem>
                    <SelectItem value="highest">Highest rated</SelectItem>
                    <SelectItem value="lowest">Lowest rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card className="py-0">
              <CardContent className="px-5">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center gap-1 py-12 text-center">
                    <p className="text-base font-semibold">No reviews match</p>
                    <p className="text-sm text-muted-foreground">
                      Try a different word or rating.
                    </p>
                    {hasFilters && (
                      <Button
                        variant="link"
                        onClick={() => {
                          setSearch("")
                          setRatingFilter("all")
                        }}
                      >
                        Clear search and filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <ul className="divide-y">
                    {filtered.map((review) => {
                      const isReported = reportedIds.has(review.id)
                      const name = review.profiles?.full_name ?? "Anonymous"
                      return (
                        <li key={review.id} className="flex items-start gap-3 py-4">
                          <div
                            aria-hidden="true"
                            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-medium text-primary"
                          >
                            {getInitials(
                              review.profiles?.full_name ?? null,
                              review.profiles?.username ?? null
                            )}
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                              <span className="max-w-full truncate text-sm font-medium">{name}</span>
                              <StarRow rating={review.rating} />
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeDate(review.created_at)}
                              </span>
                              {isReported && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-500/15 dark:text-amber-300">
                                  <span aria-hidden="true" className="size-1.5 rounded-full bg-amber-600" />
                                  Reported · under review
                                </span>
                              )}
                            </div>

                            {review.content ? (
                              // break-words: a pasted URL/long token has no break
                              // opportunity and would be clipped by the layout's
                              // overflow-x-hidden rather than wrapping.
                              <p className="text-sm leading-relaxed break-words">
                                {review.content}
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                Rated without a written review
                              </p>
                            )}

                            {!isReported && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="-ml-3 text-muted-foreground hover:text-destructive sm:hidden"
                                onClick={() => openReportDialog(review.id)}
                              >
                                <Flag aria-hidden="true" />
                                Report
                              </Button>
                            )}
                          </div>

                          {!isReported && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="hidden shrink-0 text-muted-foreground hover:text-destructive sm:inline-flex"
                              onClick={() => openReportDialog(review.id)}
                              aria-label={`Report review by ${name}`}
                            >
                              <Flag aria-hidden="true" />
                              Report
                            </Button>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ReviewReportDialog
        open={reportReviewId !== null}
        onOpenChange={(open) => {
          if (!open) setReportReviewId(null)
        }}
        reviewId={reportReviewId}
        cafeId={cafe.id}
        onSubmitted={handleReported}
        resetKey={reportSession}
      />
    </>
  )
}
