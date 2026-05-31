"use client"

import * as React from "react"
import {
  CheckCircle,
  EnvelopeSimple,
  FacebookLogo,
  FloppyDisk,
  Globe,
  Info,
  InstagramLogo,
  TiktokLogo,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
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

  const initialHours: Record<DayKey, DayHours> = {
    ...DEFAULT_HOURS,
    ...(cafe.operating_hours as Record<DayKey, DayHours> | null ?? {}),
  }
  const [hours, setHours] = React.useState<Record<DayKey, DayHours>>(initialHours)

  function updateHours(day: DayKey, field: keyof DayHours, value: string | boolean) {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
    setIsDirty(true)
  }

  async function handleSave() {
    setIsSaving(true)
    try {
      await updateProfileAction({
        name,
        description,
        operating_hours: hours,
        social_links: { instagram, facebook, tiktok, website },
      })
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
      await submitCorrectionRequestAction(correctionText)
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
      <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6">

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
              For MVP, name validation is on hold and updates save immediately.
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
        <Card>
          <CardHeader>
            <CardTitle>Operating hours</CardTitle>
            <CardDescription>
              Keep your hours accurate so customers know when you are open.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {DAYS.map(({ key, label }) => (
              <div
                key={key}
                className="flex flex-col gap-2 py-3 border-b last:border-0 sm:flex-row sm:items-center sm:gap-4"
              >
                <span className="text-sm font-medium sm:w-28 sm:shrink-0">{label}</span>

                <div className="flex flex-row items-center gap-2 flex-1">
                  <Input
                    type="time"
                    className="flex-1 sm:w-32 sm:flex-none"
                    value={hours[key].open}
                    disabled={hours[key].closed}
                    onChange={(e) => updateHours(key, "open", e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input
                    type="time"
                    className="flex-1 sm:w-32 sm:flex-none"
                    value={hours[key].close}
                    disabled={hours[key].closed}
                    onChange={(e) => updateHours(key, "close", e.target.value)}
                  />
                  <div className="flex items-center gap-2 sm:hidden ml-auto">
                    <Switch
                      checked={hours[key].closed}
                      onCheckedChange={(v) => updateHours(key, "closed", v)}
                    />
                    <Label className="text-xs text-muted-foreground">Closed</Label>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 ml-auto">
                  <Switch
                    checked={hours[key].closed}
                    onCheckedChange={(v) => updateHours(key, "closed", v)}
                  />
                  <Label className="text-xs text-muted-foreground">Closed</Label>
                </div>
              </div>
            ))}
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
                  disabled={!correctionText.trim() || isSendingCorrection}
                  onClick={handleSendCorrection}
                >
                  <EnvelopeSimple className="size-4" />
                  {isSendingCorrection ? "Sending..." : "Send Correction Request"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {isDirty && <div className="h-20" />}
      </div>

      {/* Sticky Save Bar */}
      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur px-4 py-3 sm:px-6 sm:py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between z-50">
          <p className="text-sm text-muted-foreground">
            You have unsaved changes
          </p>
          <div className="flex flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => {
                setName(cafe.name)
                setDescription(cafe.description ?? "")
                setInstagram(cafe.social_links?.instagram ?? "")
                setFacebook(cafe.social_links?.facebook ?? "")
                setTiktok(cafe.social_links?.tiktok ?? "")
                setWebsite(cafe.social_links?.website ?? "")
                setHours(initialHours)
                setIsDirty(false)
              }}
            >
              Discard
            </Button>
            <Button
              variant="default"
              className="flex-1 sm:flex-none"
              onClick={handleSave}
              disabled={isSaving}
            >
              <FloppyDisk className="size-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
