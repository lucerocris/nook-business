"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowSquareOut,
  CaretRight,
  Copy,
  FacebookLogo,
  Globe,
  InstagramLogo,
  MapPin,
  Star,
  TiktokLogo,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { SaveBar } from "@/components/owner/save-bar"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  updateProfileAction,
  submitCorrectionRequestAction,
} from "@/app/owner/actions"
import {
  closesNextDay,
  dayHoursError,
  normalizeDayHours,
  validateAndNormalizeProfile,
} from "@/lib/validation/profile"

type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday"

type DayHours = {
  open: string
  close: string
  closed: boolean
}

const DAYS: { key: DayKey; label: string }[] = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
]

const DEFAULT_HOURS: Record<DayKey, DayHours> = {
  monday:    { open: "08:00", close: "22:00", closed: false },
  tuesday:   { open: "08:00", close: "22:00", closed: false },
  wednesday: { open: "08:00", close: "22:00", closed: false },
  thursday:  { open: "08:00", close: "22:00", closed: false },
  friday:    { open: "08:00", close: "23:00", closed: false },
  saturday:  { open: "09:00", close: "23:00", closed: false },
  sunday:    { open: "09:00", close: "21:00", closed: false },
}

type Cafe = {
  id: string
  name: string
  description: string | null
  address: string | null
  lat: number | null
  lng: number | null
  neighborhood: string | null
  city: string
  operating_hours: Record<string, { open: string; close: string; closed: boolean }> | null
  social_links: {
    instagram?: string
    facebook?: string
    tiktok?: string
    website?: string
  } | null
  status?: string | null
  cafe_tags?:
    | {
        tag_id: string
        is_featured: boolean
        tags: { name: string; category: string } | null
      }[]
    | null
}

const NAME_MAX = 100
const DESCRIPTION_MAX = 1000
const CORRECTION_MAX = 2000

const STATUS: Record<string, { label: string; className: string; dot: string }> = {
  active: {
    label: "Live on Nook",
    className: "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
    dot: "bg-emerald-600",
  },
  draft: {
    label: "Not public yet",
    className: "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300",
    dot: "bg-amber-600",
  },
  inactive: {
    label: "Hidden",
    className: "bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-300",
    dot: "bg-red-600",
  },
}

const SOCIALS = [
  { key: "instagram", label: "Instagram", icon: InstagramLogo, placeholder: "https://instagram.com/yourcafe" },
  { key: "facebook", label: "Facebook", icon: FacebookLogo, placeholder: "https://facebook.com/yourcafe" },
  { key: "tiktok", label: "TikTok", icon: TiktokLogo, placeholder: "https://tiktok.com/@yourcafe" },
  { key: "website", label: "Website", icon: Globe, placeholder: "https://yourcafe.com" },
] as const

export function OwnerProfileClient({ cafe }: { cafe: Cafe }) {
  const [isDirty, setIsDirty] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [name, setName] = React.useState(cafe.name)
  const [description, setDescription] = React.useState(cafe.description ?? "")
  const [correctionText, setCorrectionText] = React.useState("")
  const [correctionSent, setCorrectionSent] = React.useState(false)
  const [correctionOpen, setCorrectionOpen] = React.useState(false)
  const [isSendingCorrection, setIsSendingCorrection] = React.useState(false)

  const [instagram, setInstagram] = React.useState(
    cafe.social_links?.instagram ?? ""
  )
  const [facebook, setFacebook] = React.useState(
    cafe.social_links?.facebook ?? ""
  )
  const [tiktok, setTiktok] = React.useState(cafe.social_links?.tiktok ?? "")
  const [website, setWebsite] = React.useState(
    cafe.social_links?.website ?? ""
  )

  // Normalize stored hours on load ("7:30" → "07:30", "24:00" → "00:00").
  // Anything unparseable becomes blank and gets an inline prompt below, so
  // one bad day no longer blocks saving the rest of the form.
  const initialHours = Object.fromEntries(
    DAYS.map(({ key }) => [
      key,
      cafe.operating_hours?.[key]
        ? normalizeDayHours(cafe.operating_hours[key])
        : DEFAULT_HOURS[key],
    ])
  ) as Record<DayKey, DayHours>
  const [hours, setHours] = React.useState<Record<DayKey, DayHours>>(initialHours)

  // Per-day problems show only after a save attempt, so a half-typed time
  // isn't flagged while the owner is still entering it.
  const [showHourErrors, setShowHourErrors] = React.useState(false)

  const [touchedDays, setTouchedDays] = React.useState<Set<DayKey>>(() => new Set())

  function updateHours(day: DayKey, field: keyof DayHours, value: string | boolean) {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
    setTouchedDays((prev) => new Set(prev).add(day))
    setIsDirty(true)
  }

  // Opening a closed day with no stored times used to land straight on an
  // error. Borrow the nearest open day's hours instead; the owner adjusts.
  function setDayOpen(day: DayKey, open: boolean) {
    const current = hours[day]
    if (open && (!current.open || !current.close)) {
      const idx = DAYS.findIndex((d) => d.key === day)
      const ordered = [...DAYS.slice(0, idx).reverse(), ...DAYS.slice(idx + 1)]
      const donor = ordered
        .map(({ key }) => hours[key])
        .find((h) => !h.closed && h.open && h.close)
      setHours((prev) => ({
        ...prev,
        [day]: {
          open: current.open || donor?.open || "08:00",
          close: current.close || donor?.close || "22:00",
          closed: false,
        },
      }))
      setTouchedDays((prev) => new Set(prev).add(day))
      setIsDirty(true)
      return
    }
    updateHours(day, "closed", !open)
  }

  // 14 time pickers is the slowest part of onboarding; most cafes keep the
  // same hours daily. Copies Monday (open/close and open-or-closed) to all.
  function copyFirstDayToAll() {
    const first = hours[DAYS[0].key]
    setHours(
      Object.fromEntries(DAYS.map(({ key }) => [key, { ...first }])) as Record<
        DayKey,
        DayHours
      >
    )
    setTouchedDays(new Set(DAYS.map(({ key }) => key)))
    setIsDirty(true)
    toast.success(`Copied ${DAYS[0].label}'s hours to every day`)
  }

  // Warn before leaving (refresh / close / browser back) with unsaved edits.
  React.useEffect(() => {
    if (!isDirty) return
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [isDirty])

  async function handleSave() {
    const input = {
      name,
      description,
      operating_hours: hours,
      social_links: { instagram, facebook, tiktok, website },
    }

    // Fast client-side check so the owner gets the exact field/message before a
    // round-trip; the server re-validates the same way.
    const check = validateAndNormalizeProfile(input)
    if (!check.ok) {
      setShowHourErrors(true)
      toast.error(check.error)
      return
    }

    setIsSaving(true)
    try {
      const res = await updateProfileAction(input)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      setIsDirty(false)
      toast.success("Listing saved")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save profile"
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSendCorrection() {
    if (!correctionText.trim()) return
    setIsSendingCorrection(true)
    try {
      const res = await submitCorrectionRequestAction(correctionText)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      setCorrectionText("")
      setCorrectionSent(true)
      setCorrectionOpen(false)
      toast.success("Correction request sent")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send correction request"
      toast.error(message)
    } finally {
      setIsSendingCorrection(false)
    }
  }

  const socials = { instagram, facebook, tiktok, website }
  const setSocial = {
    instagram: setInstagram,
    facebook: setFacebook,
    tiktok: setTiktok,
    website: setWebsite,
  }
  const status = cafe.status ? STATUS[cafe.status] : undefined
  const tags = (cafe.cafe_tags ?? []).filter((t) => t.tags)
  const featuredCount = tags.filter((t) => t.is_featured).length
  // Featured first: they are the ones shown on the cafe card.
  const tagPreview = [...tags].sort(
    (a, b) => Number(b.is_featured) - Number(a.is_featured)
  )
  const nameTooLong = name.length > NAME_MAX
  const descriptionTooLong = description.length > DESCRIPTION_MAX

  return (
    <>
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div>
          <h1 className="text-2xl font-semibold text-balance">Edit listing</h1>
          <p className="text-sm text-muted-foreground">
            What people see on your café page in the app and on nookph.app.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Basics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 px-5">
                <div className="space-y-2">
                  <Label htmlFor="cafe-name">Café name</Label>
                  <Input
                    id="cafe-name"
                    value={name}
                    autoComplete="organization"
                    aria-invalid={nameTooLong || !name.trim() ? true : undefined}
                    aria-describedby="cafe-name-help"
                    onChange={(e) => {
                      setName(e.target.value)
                      setIsDirty(true)
                    }}
                  />
                  <p
                    id="cafe-name-help"
                    className={cn(
                      "text-xs text-muted-foreground",
                      (nameTooLong || !name.trim()) && "text-destructive"
                    )}
                  >
                    {!name.trim()
                      ? "Café name is required."
                      : nameTooLong
                        ? `${name.length} / ${NAME_MAX} — keep it to ${NAME_MAX} characters or fewer.`
                        : "Shown on cards, the map and your page."}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cafe-description">Description</Label>
                  <Textarea
                    id="cafe-description"
                    value={description}
                    rows={4}
                    className="min-h-28 resize-y md:text-sm"
                    aria-invalid={descriptionTooLong ? true : undefined}
                    aria-describedby="cafe-description-help"
                    onChange={(e) => {
                      setDescription(e.target.value)
                      setIsDirty(true)
                    }}
                  />
                  <div
                    id="cafe-description-help"
                    className="flex items-start justify-between gap-3 text-xs text-muted-foreground"
                  >
                    <span>Shown under your photos on your café page.</span>
                    <span
                      className={cn(
                        "shrink-0 tabular-nums",
                        descriptionTooLong && "text-destructive"
                      )}
                    >
                      {description.length} / {DESCRIPTION_MAX}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card id="hours" className="scroll-mt-20">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Opening hours</CardTitle>
                <CardDescription>
                  Turn a day off if you&apos;re closed. Closing after midnight is fine.
                </CardDescription>
                <CardAction>
                  <Button variant="outline" size="sm" onClick={copyFirstDayToAll}>
                    <Copy className="size-4" />
                    <span className="hidden sm:inline">Copy Monday to all</span>
                    <span className="sm:hidden">Copy to all</span>
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className="px-5">
                <div
                  aria-hidden="true"
                  className="hidden grid-cols-[10rem_9rem_9rem_1fr] gap-x-3 border-b pb-2 text-xs text-muted-foreground sm:grid"
                >
                  <span>Day</span>
                  <span>Opens</span>
                  <span>Closes</span>
                </div>
                <ul className="divide-y">
                  {DAYS.map(({ key, label }) => {
                    const day = hours[key]
                    const isOpen = !day.closed
                    // Flag a row as soon as the owner has touched it, not only on
                    // Save; untouched rows wait for a save attempt.
                    const problem =
                      showHourErrors || touchedDays.has(key) ? dayHoursError(day) : null
                    return (
                      <li
                        key={key}
                        className="grid grid-cols-2 items-center gap-x-3 gap-y-2 py-3 sm:grid-cols-[10rem_9rem_9rem_1fr]"
                      >
                        <label className="col-span-2 flex min-h-11 items-center gap-3 sm:col-span-1 sm:min-h-0">
                          <Switch
                            checked={isOpen}
                            onCheckedChange={(open) => setDayOpen(key, open)}
                            aria-label={`${label}: open`}
                          />
                          <span
                            className={cn(
                              "text-sm font-medium",
                              !isOpen && "text-muted-foreground"
                            )}
                          >
                            {label}
                          </span>
                          {!isOpen && (
                            <span className="ml-auto text-sm text-muted-foreground sm:hidden">
                              Closed
                            </span>
                          )}
                        </label>

                        {isOpen ? (
                          <>
                            <Input
                              type="time"
                              aria-label={`${label} opening time`}
                              aria-invalid={problem ? true : undefined}
                              value={day.open}
                              onChange={(e) => updateHours(key, "open", e.target.value)}
                            />
                            <Input
                              type="time"
                              aria-label={`${label} closing time`}
                              aria-invalid={problem ? true : undefined}
                              value={day.close}
                              onChange={(e) => updateHours(key, "close", e.target.value)}
                            />
                            {problem ? null : closesNextDay(day) ? (
                              <p className="col-span-2 text-xs text-muted-foreground sm:col-span-1">
                                {day.close === "00:00"
                                  ? "Closes at midnight"
                                  : "Closes the next day"}
                              </p>
                            ) : null}
                            {problem && (
                              <p
                                role="alert"
                                className="col-span-2 text-xs text-destructive sm:col-span-4"
                              >
                                {problem}
                              </p>
                            )}
                          </>
                        ) : (
                          <span className="hidden text-sm text-muted-foreground sm:block">
                            Closed
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Social links</CardTitle>
                <CardDescription>So people can follow your updates.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 px-5 sm:grid-cols-2">
                {SOCIALS.map(({ key, label, icon: Icon, placeholder }) => {
                  const value = socials[key]
                  const invalid = !!value.trim() && !/^https?:\/\//i.test(value.trim())
                  return (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={`social-${key}`}>{label}</Label>
                      <div className="relative">
                        <Icon
                          aria-hidden="true"
                          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                          id={`social-${key}`}
                          type="url"
                          inputMode="url"
                          autoComplete="url"
                          className="pl-9"
                          placeholder={placeholder}
                          value={value}
                          aria-invalid={invalid ? true : undefined}
                          aria-describedby={`social-${key}-help`}
                          onChange={(e) => {
                            setSocial[key](e.target.value)
                            setIsDirty(true)
                          }}
                        />
                      </div>
                      <p
                        id={`social-${key}-help`}
                        className={cn(
                          "text-xs text-muted-foreground",
                          invalid && "text-destructive"
                        )}
                      >
                        {invalid ? "Enter a full link starting with https://" : "Optional"}
                      </p>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            {status && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                      status.className
                    )}
                  >
                    <span aria-hidden="true" className={cn("size-1.5 rounded-full", status.dot)} />
                    {status.label}
                  </span>
                  {cafe.status === "active" ? (
                    <a
                      href={`https://www.nookph.app/cafes/${cafe.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex w-fit items-center gap-1.5 rounded-sm text-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      View your page on Nook
                      <ArrowSquareOut aria-hidden="true" className="size-3.5" />
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {cafe.status === "draft"
                        ? "People can’t see your café until Nook publishes it."
                        : "Your café isn’t shown in the Nook app right now."}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Address</CardTitle>
                <CardDescription>Set by the Nook team.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 px-5">
                <div className="flex items-start gap-2.5 rounded-lg bg-muted px-3 py-2.5">
                  <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <p className="min-w-0 text-sm break-words">
                    {cafe.address ?? "No address on file"}
                  </p>
                </div>
                {correctionSent ? (
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-500/15 dark:text-amber-300">
                      <span aria-hidden="true" className="size-1.5 rounded-full bg-amber-600" />
                      Correction requested
                    </span>
                    <span className="text-xs text-muted-foreground">
                      We&apos;ll update it within 24 hours.
                    </span>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setCorrectionOpen(true)}>
                    Request a correction
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Tags</CardTitle>
                <CardDescription>
                  {tags.length === 0
                    ? "None picked yet"
                    : `${tags.length} picked · ${featuredCount} of 3 featured`}
                </CardDescription>
                <CardAction>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/owner/tags">
                      {tags.length === 0 ? "Add" : "Edit"}
                      <CaretRight aria-hidden="true" className="size-3.5" />
                    </Link>
                  </Button>
                </CardAction>
              </CardHeader>
              {tags.length > 0 && (
                <CardContent className="px-5">
                  <ul className="flex flex-wrap gap-1.5">
                    {tagPreview.slice(0, 8).map((t) => (
                      <li
                        key={t.tag_id}
                        className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs"
                      >
                        {t.is_featured && (
                          <Star aria-hidden="true" weight="fill" className="size-3" />
                        )}
                        {t.tags!.name}
                      </li>
                    ))}
                    {tags.length > 8 && (
                      <li className="px-1 py-0.5 text-xs text-muted-foreground">
                        +{tags.length - 8} more
                      </li>
                    )}
                  </ul>
                </CardContent>
              )}
            </Card>
          </aside>
        </div>
      </div>

      <Dialog open={correctionOpen} onOpenChange={setCorrectionOpen}>
        <DialogContent className="gap-4 p-6 text-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Request an address correction
            </DialogTitle>
            <DialogDescription className="text-sm">
              Only the Nook team can move your pin, so the map stays accurate.
              Tell us what&apos;s wrong and we&apos;ll update it within 24 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-muted px-3 py-2.5">
            <p className="text-xs text-muted-foreground">Current address</p>
            <p className="text-sm break-words">{cafe.address ?? "No address on file"}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="correction-text">What should change?</Label>
            <Textarea
              id="correction-text"
              rows={3}
              className="min-h-24 resize-y md:text-sm"
              placeholder="e.g. We moved to the 2nd floor, or the pin is slightly off…"
              value={correctionText}
              maxLength={CORRECTION_MAX}
              disabled={isSendingCorrection}
              onChange={(e) => setCorrectionText(e.target.value)}
            />
            <p className="text-xs text-muted-foreground tabular-nums">
              {correctionText.length} / {CORRECTION_MAX}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCorrectionOpen(false)}
              disabled={isSendingCorrection}
            >
              Cancel
            </Button>
            <Button
              disabled={!correctionText.trim()}
              loading={isSendingCorrection}
              onClick={handleSendCorrection}
            >
              Send request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SaveBar
        visible={isDirty}
        saving={isSaving}
        onSave={handleSave}
        onDiscard={() => {
          setName(cafe.name)
          setDescription(cafe.description ?? "")
          setInstagram(cafe.social_links?.instagram ?? "")
          setFacebook(cafe.social_links?.facebook ?? "")
          setTiktok(cafe.social_links?.tiktok ?? "")
          setWebsite(cafe.social_links?.website ?? "")
          setHours(initialHours)
          setShowHourErrors(false)
          setTouchedDays(new Set())
          setIsDirty(false)
        }}
      />
    </>
  )
}
