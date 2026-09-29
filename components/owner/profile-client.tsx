"use client"

import * as React from "react"
import {
  CheckCircle,
  Copy,
  EnvelopeSimple,
  FacebookLogo,
  Globe,
  InstagramLogo,
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
import { Separator } from "@/components/ui/separator"
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
}

export function OwnerProfileClient({ cafe }: { cafe: Cafe }) {
  const [isDirty, setIsDirty] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [name, setName] = React.useState(cafe.name)
  const [description, setDescription] = React.useState(cafe.description ?? "")
  const [correctionText, setCorrectionText] = React.useState("")
  const [correctionSent, setCorrectionSent] = React.useState(false)
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
      toast.success("Profile updated")
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
      toast.success("Correction request sent")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send correction request"
      toast.error(message)
    } finally {
      setIsSendingCorrection(false)
    }
  }

  return (
    <>
      <div className="w-full max-w-3xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6">

        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Edit Listing</h1>
            <p className="text-sm text-muted-foreground">Update your cafe details</p>
          </div>
        </div>

        {/* Card 1 — Cafe Name */}
        <Card>
          <CardHeader>
            <CardTitle>Cafe name</CardTitle>
            <CardDescription>
              This is how your cafe appears across Nook.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="cafe-name">Name</Label>
              <Input
                id="cafe-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setIsDirty(true)
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Card 2 — Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
            <CardDescription>
              Tell customers what makes your cafe special, what to expect, and
              what you are known for.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Textarea
                value={description}
                rows={4}
                className="resize-none"
                onChange={(e) => {
                  setDescription(e.target.value)
                  setIsDirty(true)
                }}
              />
              <div className="flex flex-row justify-end">
                <span className="text-xs text-muted-foreground">
                  {description.length} characters
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3 — Operating Hours */}
        <Card id="hours" className="scroll-mt-20">
          <CardHeader>
            <CardTitle>Opening hours</CardTitle>
            <CardDescription>
              Turn a day off if you&apos;re closed. Closing after midnight is fine.
            </CardDescription>
            <CardAction>
              <Button variant="outline" size="sm" onClick={copyFirstDayToAll}>
                <Copy className="size-4" />
                <span className="hidden sm:inline">Same hours every day</span>
                <span className="sm:hidden">Copy to all</span>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
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
                    className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 py-3 sm:grid-cols-[7rem_auto_1fr]"
                  >
                    <span className="text-sm font-medium">{label}</span>

                    <label className="flex items-center gap-2 justify-self-end sm:justify-self-start">
                      <Switch
                        checked={isOpen}
                        onCheckedChange={(open) => setDayOpen(key, open)}
                        aria-label={`${label}: open`}
                      />
                      <span className="w-12 text-sm text-muted-foreground">
                        {isOpen ? "Open" : "Closed"}
                      </span>
                    </label>

                    {isOpen ? (
                      <div className="col-span-2 flex flex-wrap items-center gap-x-2 gap-y-1 sm:col-span-1">
                        <Input
                          type="time"
                          aria-label={`${label} opening time`}
                          aria-invalid={problem ? true : undefined}
                          className="w-[8.5rem]"
                          value={day.open}
                          onChange={(e) => updateHours(key, "open", e.target.value)}
                        />
                        <span className="text-sm text-muted-foreground">to</span>
                        <Input
                          type="time"
                          aria-label={`${label} closing time`}
                          aria-invalid={problem ? true : undefined}
                          className="w-[8.5rem]"
                          value={day.close}
                          onChange={(e) => updateHours(key, "close", e.target.value)}
                        />
                        {problem ? (
                          <p role="alert" className="basis-full text-sm text-destructive">
                            {problem}
                          </p>
                        ) : closesNextDay(day) ? (
                          <p className="basis-full text-sm text-muted-foreground">
                            {day.close === "00:00"
                              ? "Closes at midnight"
                              : "Closes after midnight, the next day"}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>

        {/* Card 4 — Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social links</CardTitle>
            <CardDescription>
              Add your active social pages so customers can follow updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Instagram</Label>
              <div className="relative">
                <InstagramLogo className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="https://instagram.com/..."
                  value={instagram}
                  onChange={(e) => {
                    setInstagram(e.target.value)
                    setIsDirty(true)
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Facebook</Label>
              <div className="relative">
                <FacebookLogo className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="https://facebook.com/..."
                  value={facebook}
                  onChange={(e) => {
                    setFacebook(e.target.value)
                    setIsDirty(true)
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>TikTok</Label>
              <div className="relative">
                <TiktokLogo className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="https://tiktok.com/..."
                  value={tiktok}
                  onChange={(e) => {
                    setTiktok(e.target.value)
                    setIsDirty(true)
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="https://..."
                  value={website}
                  onChange={(e) => {
                    setWebsite(e.target.value)
                    setIsDirty(true)
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 5 — Address Correction Request */}
        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
            <CardDescription>
              Need to fix your address or map pin? Send a correction request
              and our team will verify it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted px-4 py-3">
              <p className="text-xs text-muted-foreground mb-1">
                Current address
              </p>
              <p className="text-sm font-medium">
                {cafe.address ?? "No address on file"}
              </p>
              {(cafe.lat != null || cafe.lng != null) && (
                <div className="flex flex-row gap-4 mt-2">
                  {cafe.lat != null && (
                    <div className="flex flex-col">
                      <p className="text-xs text-muted-foreground">Latitude</p>
                      <p className="text-xs font-mono">{cafe.lat}</p>
                    </div>
                  )}
                  {cafe.lng != null && (
                    <div className="flex flex-col">
                      <p className="text-xs text-muted-foreground">Longitude</p>
                      <p className="text-xs font-mono">{cafe.lng}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium mb-2">Request a correction</p>
              <p className="text-xs text-muted-foreground mb-3">
                Coordinates can only be updated by the Nook team to ensure map
                accuracy. Describe the correction and we&apos;ll update it
                within 24 hours.
              </p>
              <Textarea
                placeholder={`e.g. We moved to the 2nd floor, or the pin is slightly off...`}
                rows={3}
                className="resize-none"
                value={correctionText}
                onChange={(e) => setCorrectionText(e.target.value)}
              />

              {correctionSent ? (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mt-2">
                  <CheckCircle className="size-4" />
                  Correction request sent — we&apos;ll update this within 24
                  hours.
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  disabled={!correctionText.trim()}
                  loading={isSendingCorrection}
                  onClick={handleSendCorrection}
                >
                  {isSendingCorrection ? null : (
                    <EnvelopeSimple className="size-4" />
                  )}
                  Send Correction Request
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

      </div>

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
