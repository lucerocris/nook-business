"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ArrowDownLeft,
  ArrowSquareOut,
  ArrowUpRight,
  CaretRight,
  ChatCircle,
  Check,
  Clock,
  Eye,
  ForkKnife,
  Heart,
  Image as ImageIcon,
  Images,
  NavigationArrow,
  PencilSimple,
  Star,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type {
  AnalyticsDay,
  AnalyticsTotals,
  OwnerDashboardCafe,
} from "@/lib/queries/cafes"
import { TRAFFIC_RANGES } from "@/lib/owner/traffic-ranges"

const NOOK_INSTAGRAM = "https://instagram.com/nook_cafefinder"

type Review = {
  id: string
  rating: number
  content: string | null // star-only reviews have null content
  created_at: string
  profiles: { full_name: string | null; username: string | null } | null
}

type Analytics = {
  totals: AnalyticsTotals
  previousTotals: AnalyticsTotals
  currentDays: AnalyticsDay[]
  previousDays: AnalyticsDay[]
}

type Metric = keyof AnalyticsTotals

const METRICS: { key: Metric; label: string; icon: React.ElementType }[] = [
  { key: "views", label: "Profile views", icon: Eye },
  { key: "directions", label: "Route requests", icon: NavigationArrow },
  { key: "favorites", label: "Times saved", icon: Heart },
  { key: "hours", label: "Hours checked", icon: Clock },
]

const STATUS_PILL: Record<OwnerDashboardCafe["status"], { label: string; className: string }> = {
  active: { label: "Live", className: "bg-emerald-50 text-emerald-700" },
  draft: { label: "Not public yet", className: "bg-[#FFF4DC] text-[#8A5A00]" },
  inactive: { label: "Hidden", className: "bg-red-50 text-red-700" },
}

function formatDayRange(days: AnalyticsDay[]) {
  if (days.length === 0) return ""
  // Built by hand: en-GB renders September as "Sept", en-US puts the month first.
  const fmt = (iso: string) => {
    const d = new Date(`${iso}T00:00:00`)
    return `${d.getDate()} ${d.toLocaleDateString("en-US", { month: "short" })}`
  }
  return `${fmt(days[0].date)} – ${fmt(days[days.length - 1].date)}`
}

// Owners are in the Philippines; pin the zone so the server render and the
// browser agree on the greeting.
function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "Asia/Manila",
    }).format(new Date())
  )
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

function formatRelativeDate(dateStr: string) {
  const diffDays = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
  if (diffDays <= 0) return "Today"
  if (diffDays === 1) return "1 day ago"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 14) return "1 week ago"
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 60) return "1 month ago"
  return `${Math.floor(diffDays / 30)} months ago`
}

function getInitials(name: string | null, username: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
  if (username) return username.slice(0, 2).toUpperCase()
  return "?"
}

function hasHours(hours: OwnerDashboardCafe["operating_hours"]) {
  return !!hours && Object.values(hours).some((d) => d && !d.closed && d.open)
}

type Step = {
  title: string
  done: boolean
  body?: string
  cta?: { label: string; href: string }
}

function setupSteps(cafe: OwnerDashboardCafe): Step[] {
  return [
    { title: "Claim your café", done: true },
    {
      title: "Add a cover photo",
      done: !!cafe.featured_image_url,
      body: "It’s the first thing people see on your Nook page and in search.",
      cta: { label: "Add cover photo", href: "/owner/photos" },
    },
    {
      title: "Set opening hours",
      done: hasHours(cafe.operating_hours),
      body: "So nobody shows up to a closed door.",
      cta: { label: "Set hours", href: "/owner/profile#hours" },
    },
    {
      title: "Pick menu highlights",
      done: cafe.highlight_count > 0,
      body: "Choose up to 5 items people should try first. They show on your Nook page.",
      cta: { label: "Add highlights", href: "/owner/menu" },
    },
    {
      title: "Choose your tags",
      done: cafe.tag_count > 0,
      body: "Tags like wifi, outlets or pet-friendly help the right people find you.",
      cta: { label: "Choose tags", href: "/owner/tags" },
    },
    {
      title: "Write a short description",
      done: !!cafe.description?.trim(),
      body: "A few lines on what you serve and what it’s like to stay.",
      cta: { label: "Write description", href: "/owner/profile" },
    },
  ]
}

function Panel({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      className={cn("rounded-xl border bg-card p-4 sm:p-5", className)}
      {...props}
    />
  )
}

function QuickAction({
  href,
  icon: Icon,
  children,
  external,
}: {
  href: string
  icon: React.ElementType
  children: React.ReactNode
  external?: boolean
}) {
  const className =
    "inline-flex h-9 items-center gap-1.5 rounded-full border bg-background px-3.5 text-[13px] font-medium outline-hidden transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
  const content = (
    <>
      <Icon className="size-4 text-muted-foreground" aria-hidden />
      {children}
    </>
  )
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <Link href={href} className={className}>
      {content}
    </Link>
  )
}

function Delta({ current, previous }: { current: number; previous: number }) {
  // No baseline to compare against — a percentage would be meaningless.
  if (previous === 0) return null
  const change = Math.round(((current - previous) / previous) * 100)
  if (change === 0) {
    return <span className="text-xs text-muted-foreground">No change</span>
  }
  const up = change > 0
  const Icon = up ? ArrowUpRight : ArrowDownLeft
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
        up ? "text-emerald-700" : "text-red-700"
      )}
    >
      <Icon className="size-3" weight="bold" aria-hidden />
      {Math.abs(change)}%
      <span className="sr-only">{up ? "up" : "down"} from the period before</span>
    </span>
  )
}

function MetricTab({
  icon: Icon,
  label,
  value,
  previous,
  selected,
  interactive,
  onSelect,
}: {
  icon: React.ElementType
  label: string
  value: number
  previous: number
  selected: boolean
  interactive: boolean
  onSelect: () => void
}) {
  const body = (
    <>
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5 shrink-0" aria-hidden />
        <span className="truncate">{label}</span>
      </span>
      <span className="mt-1 flex flex-wrap items-baseline gap-x-2">
        <span
          className={cn(
            "text-2xl font-medium tabular-nums",
            value === 0 && "text-muted-foreground"
          )}
        >
          {value.toLocaleString()}
        </span>
        <Delta current={value} previous={previous} />
      </span>
    </>
  )
  // With no traffic there is no chart to switch, so the tabs are plain stats.
  if (!interactive) return <div className="min-w-0 px-3 py-2.5">{body}</div>
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        "flex min-w-0 flex-col rounded-lg px-3 py-2.5 text-left outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "bg-muted" : "hover:bg-muted/60"
      )}
    >
      {body}
    </button>
  )
}

const CHART_W = 600
const CHART_H = 140

function linePath(values: number[], max: number) {
  const step = values.length > 1 ? CHART_W / (values.length - 1) : 0
  return values
    .map((v, i) => {
      const x = i * step
      const y = CHART_H - (v / max) * (CHART_H - 8) - 4
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")
}

function TrafficChart({
  metric,
  current,
  previous,
}: {
  metric: (typeof METRICS)[number]
  current: AnalyticsDay[]
  previous: AnalyticsDay[]
}) {
  const now = current.map((d) => d[metric.key])
  const before = previous.map((d) => d[metric.key])
  const max = Math.max(1, ...now, ...before)

  return (
    <figure className="mt-5">
      <div className="relative h-36">
        {/* Gridlines */}
        <div aria-hidden className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-t border-border" />
          ))}
        </div>
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 size-full overflow-visible"
          role="img"
          aria-label={`${metric.label} per day: ${now.reduce((a, b) => a + b, 0)} this period, ${before.reduce((a, b) => a + b, 0)} the period before`}
        >
          <path
            d={linePath(before, max)}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
            className="text-muted-foreground/45"
          />
          <path
            d={linePath(now, max)}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className="text-primary"
          />
        </svg>
      </div>
      <figcaption className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-0.5 w-3.5 rounded-full bg-primary" />
          {formatDayRange(current)}
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="w-3.5 border-t-2 border-dashed border-muted-foreground/45" />
          {formatDayRange(previous)}
        </span>
      </figcaption>
    </figure>
  )
}

function SetupChecklist({ steps }: { steps: Step[] }) {
  const doneCount = steps.filter((s) => s.done).length
  const current = steps.findIndex((s) => !s.done)

  if (current === -1) {
    return (
      <Panel className="flex items-center gap-3 p-4 sm:p-4">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check className="size-3.5" weight="bold" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Your listing is complete</h2>
          <p className="text-xs text-muted-foreground">
            {doneCount}/{steps.length} · Nothing left to set up
          </p>
        </div>
      </Panel>
    )
  }

  return (
    <Panel className="p-3 sm:p-3">
      <div className="flex items-center justify-between gap-3 px-2 pt-1 pb-3">
        <h2 className="text-[15px] font-semibold">
          Finish your listing
        </h2>
        <div className="flex items-center gap-2">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={steps.length}
            aria-valuenow={doneCount}
            aria-label="Setup progress"
            className="h-1 w-12 overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-foreground transition-[width]"
              style={{ width: `${(doneCount / steps.length) * 100}%` }}
            />
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">
            {doneCount}/{steps.length}
          </span>
        </div>
      </div>
      <ol className="flex flex-col gap-0.5">
        {steps.map((step, i) => {
          const isCurrent = i === current
          return (
            <li
              key={step.title}
              className={cn(
                "flex gap-3 rounded-lg px-2 py-2",
                isCurrent && "bg-muted py-3"
              )}
            >
              {step.done ? (
                <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="size-3" weight="bold" aria-hidden />
                  <span className="sr-only">Done:</span>
                </span>
              ) : (
                <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium tabular-nums text-muted-foreground">
                  {i + 1}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm",
                    step.done ? "text-muted-foreground" : "font-medium text-foreground"
                  )}
                >
                  {step.title}
                </p>
                {isCurrent && step.body && (
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                )}
                {isCurrent && step.cta && (
                  <Button asChild size="sm" className="mt-2.5">
                    <Link href={step.cta.href}>{step.cta.label}</Link>
                  </Button>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </Panel>
  )
}

function RangeSelect({ days }: { days: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = React.useTransition()

  return (
    <Select
      value={String(days)}
      onValueChange={(value) =>
        startTransition(() => router.replace(`${pathname}?range=${value}`, { scroll: false }))
      }
    >
      <SelectTrigger
        size="sm"
        aria-label="Traffic period"
        aria-busy={isPending}
        className={cn("shrink-0 text-xs text-muted-foreground", isPending && "opacity-60")}
      >
        {/* Explicit label: Radix only fills SelectValue from the items once
            the content has mounted, so it rendered blank on first paint. */}
        <SelectValue>Last {days} days</SelectValue>
      </SelectTrigger>
      <SelectContent align="end">
        {TRAFFIC_RANGES.map((r) => (
          <SelectItem key={r} value={String(r)}>
            Last {r} days
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function OwnerDashboardClient({
  cafe,
  recentReviews,
  analytics,
  days,
  firstName,
}: {
  cafe: OwnerDashboardCafe
  recentReviews: Review[]
  analytics: Analytics
  days: number
  firstName: string | null
}) {
  const isActive = cafe.status === "active"
  const area = [cafe.neighborhood, cafe.city].filter(Boolean).join(", ")
  const pill = STATUS_PILL[cafe.status]
  const steps = setupSteps(cafe)
  const { totals, previousTotals } = analytics
  const totalTraffic = totals.views + totals.directions + totals.favorites + totals.hours
  const [metricKey, setMetricKey] = React.useState<Metric>("views")
  const metric = METRICS.find((m) => m.key === metricKey) ?? METRICS[0]
  const publicUrl = `https://www.nookph.app/cafes/${cafe.id}`

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting()}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isActive
            ? `Here’s how ${cafe.name} is doing on Nook.`
            : cafe.status === "draft"
              ? `${cafe.name} isn’t public yet. Here’s where things stand.`
              : `${cafe.name} is hidden from Nook right now. Here’s where things stand.`}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <QuickAction href="/owner/profile#hours" icon={Clock}>
            Update hours
          </QuickAction>
          <QuickAction href="/owner/photos" icon={Images}>
            Add photos
          </QuickAction>
          <QuickAction href="/owner/menu" icon={ForkKnife}>
            Edit menu
          </QuickAction>
          <QuickAction href={NOOK_INSTAGRAM} icon={ChatCircle} external>
            Message Nook
          </QuickAction>
        </div>
      </header>

      <div className="mt-8 grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] lg:gap-5">
        <div className="flex min-w-0 flex-col gap-4 lg:gap-5">
          {/* Listing */}
          <Panel>
            <div className="flex gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground sm:size-20">
                {cafe.featured_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cafe.featured_image_url}
                    alt={`Cover photo of ${cafe.name}`}
                    className="size-full object-cover"
                  />
                ) : (
                  <ImageIcon className="size-6" aria-label="No cover photo yet" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="min-w-0 text-base font-semibold break-words">{cafe.name}</h2>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                      pill.className
                    )}
                  >
                    {pill.label}
                  </span>
                </div>
                <dl className="mt-3 grid grid-cols-1 gap-3 rounded-lg bg-muted px-3 py-2.5 sm:grid-cols-3">
                  <div className="min-w-0">
                    <dt className="text-[11px] text-muted-foreground">Area</dt>
                    <dd className="mt-0.5 truncate text-[13px] font-medium">{area || "—"}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] text-muted-foreground">Rating</dt>
                    <dd className="mt-0.5 flex items-center gap-1 text-[13px] font-medium">
                      {cafe.rating != null && cafe.review_count > 0 ? (
                        `${cafe.rating.toFixed(1)} · ${cafe.review_count} ${cafe.review_count === 1 ? "review" : "reviews"}`
                      ) : (
                        "No reviews yet"
                      )}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] text-muted-foreground">Cover photo</dt>
                    <dd className="mt-0.5 text-[13px] font-medium">
                      {cafe.featured_image_url ? "Added" : "Missing"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/owner/profile">
                  Edit listing
                  <PencilSimple aria-hidden />
                </Link>
              </Button>
              {isActive ? (
                <Button asChild variant="outline" size="sm">
                  <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                    View on Nook
                    <ArrowSquareOut aria-hidden />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  title="Available once your listing is public"
                >
                  View on Nook
                  <ArrowSquareOut aria-hidden />
                </Button>
              )}
            </div>
          </Panel>

          {/* App traffic */}
          <Panel>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold">App traffic</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  How people found you in the Nook app · updated daily
                </p>
              </div>
              <RangeSelect days={days} />
            </div>
            <div
              role={totalTraffic > 0 ? "tablist" : undefined}
              aria-label="Metric shown on the chart"
              className="mt-5 grid grid-cols-2 gap-1 sm:grid-cols-4"
            >
              {METRICS.map((m) => (
                <MetricTab
                  key={m.key}
                  icon={m.icon}
                  label={m.label}
                  value={totals[m.key]}
                  previous={previousTotals[m.key]}
                  selected={m.key === metricKey}
                  interactive={totalTraffic > 0}
                  onSelect={() => setMetricKey(m.key)}
                />
              ))}
            </div>
            {totalTraffic > 0 && (
              <TrafficChart
                metric={metric}
                current={analytics.currentDays}
                previous={analytics.previousDays}
              />
            )}
            {totalTraffic === 0 && (
              <div className="mt-5 rounded-lg bg-muted px-4 py-8 text-center">
                <p className="text-sm font-semibold">No visits yet</p>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
                  {isActive
                    ? `Nobody has opened your listing in the last ${days} days. Profile views, route requests, saves and hours checks show up here.`
                    : "Profile views, route requests, saves and hours checks start counting the day your listing goes public."}
                </p>
              </div>
            )}
          </Panel>

          {/* Recent reviews */}
          <Panel>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[15px] font-semibold">Recent reviews</h2>
              {recentReviews.length > 0 && (
                <Link
                  href="/owner/reviews"
                  className="inline-flex min-h-8 items-center gap-1 rounded-md text-[13px] font-medium outline-hidden hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  View all
                  <CaretRight className="size-3.5" aria-hidden />
                </Link>
              )}
            </div>
            {recentReviews.length === 0 ? (
              <div className="flex flex-col items-center px-4 py-8 text-center">
                <Star className="size-5 text-muted-foreground" aria-hidden />
                <p className="mt-2 text-sm font-semibold">No reviews yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ratings and reviews from Nook visitors show up here.
                </p>
              </div>
            ) : (
              <ul className="mt-3 border-t">
                {recentReviews.map((review) => {
                  const name =
                    review.profiles?.full_name ?? review.profiles?.username ?? "Anonymous"
                  return (
                    <li key={review.id} className="border-b py-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-0.5" role="img" aria-label={`${review.rating} out of 5 stars`}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              weight={i < review.rating ? "fill" : "regular"}
                              className={cn(
                                "size-3.5",
                                i < review.rating ? "text-foreground" : "text-muted-foreground/50"
                              )}
                              aria-hidden
                            />
                          ))}
                        </div>
                        <span className="shrink-0 text-xs whitespace-nowrap text-muted-foreground">
                          {formatRelativeDate(review.created_at)}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "mt-2 line-clamp-3 text-sm break-words",
                          !review.content && "text-muted-foreground"
                        )}
                      >
                        {review.content ?? "Rated without a written review"}
                      </p>
                      <div className="mt-3 flex items-center gap-2.5">
                        <span
                          aria-hidden
                          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold"
                        >
                          {getInitials(review.profiles?.full_name ?? null, review.profiles?.username ?? null)}
                        </span>
                        <span className="grid min-w-0 leading-tight">
                          <span className="truncate text-[13px] font-medium">{name}</span>
                          {review.profiles?.username && (
                            <span className="truncate text-xs text-muted-foreground">
                              @{review.profiles.username}
                            </span>
                          )}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Panel>
        </div>

        {/* Setup */}
        {/* On one column an unfinished checklist is the most useful thing on
            the page, so it moves up; on desktop it sits in the side rail. */}
        <aside
          className={cn(
            "flex min-w-0 flex-col gap-3 lg:sticky lg:top-6 lg:order-none",
            steps.some((s) => !s.done) && "order-first"
          )}
        >
          <SetupChecklist steps={steps} />
          <p className="flex gap-2 px-3 text-xs leading-relaxed text-muted-foreground">
            <span
              aria-hidden
              className={cn(
                "mt-1.5 size-1.5 shrink-0 rounded-full",
                isActive ? "bg-emerald-600" : cafe.status === "draft" ? "bg-amber-600" : "bg-red-600"
              )}
            />
            {isActive
              ? "Nook reviewed and published your listing."
              : cafe.status === "draft"
                ? "Nook is reviewing your listing — usually within 2 working days."
                : "Your listing is hidden. Message Nook to bring it back."}
          </p>
        </aside>
      </div>
    </div>
  )
}
