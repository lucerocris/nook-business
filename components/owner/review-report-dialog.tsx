"use client"

import * as React from "react"
import { Plus, X } from "@phosphor-icons/react"
import { toast } from "sonner"
import imageCompression from "browser-image-compression"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"

import { submitReviewReportAction } from "@/app/owner/reviews/actions"
import { uploadReviewReportEvidenceAction } from "@/app/actions/upload"
import {
  REPORT_DESCRIPTION_MAX_LENGTH,
  REPORT_EVIDENCE_MAX_FILES,
  REPORT_ERROR_MESSAGES,
  REPORT_REASONS,
  type ReportReason,
  type SubmitReviewReportResult,
} from "@/types/review-report"

const EVIDENCE_MAX_BYTES = 10 * 1024 * 1024
const EVIDENCE_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const EVIDENCE_COMPRESSION = {
  maxSizeMB: 0.3,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: "image/webp" as const,
}

type FormErrors = {
  reason?: string
}

type ReviewReportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reviewId: string | null
  cafeId: string
  onSubmitted: (reviewId: string) => void
  resetKey?: string | number
}

async function compressEvidence(file: File): Promise<File> {
  return imageCompression(file, EVIDENCE_COMPRESSION)
}

function getErrorMessage(
  result: Extract<SubmitReviewReportResult, { success: false }>
) {
  return REPORT_ERROR_MESSAGES[result.error]
}

function ReviewReportForm({
  reviewId,
  cafeId,
  onSubmitted,
  onClose,
}: {
  reviewId: string
  cafeId: string
  onSubmitted: (reviewId: string) => void
  onClose: () => void
}) {
  const [reason, setReason] = React.useState<ReportReason | "">("")
  const [description, setDescription] = React.useState("")
  const [evidenceFiles, setEvidenceFiles] = React.useState<File[]>([])
  const [evidencePreviews, setEvidencePreviews] = React.useState<string[]>([])
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isUploadingEvidence, setIsUploadingEvidence] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const previewUrlsRef = React.useRef<string[]>([])

  React.useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      previewUrlsRef.current = []
    }
  }, [])

  function handleReasonChange(value: string) {
    setReason(value as ReportReason)
    if (errors.reason) {
      setErrors((prev) => ({ ...prev, reason: undefined }))
    }
  }

  function handleDescriptionChange(
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    setDescription(event.target.value.slice(0, REPORT_DESCRIPTION_MAX_LENGTH))
  }

  function handleEvidencePick(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ""
    if (files.length === 0) return

    const availableSlots = REPORT_EVIDENCE_MAX_FILES - evidenceFiles.length
    if (availableSlots <= 0) {
      toast.error(`You can attach up to ${REPORT_EVIDENCE_MAX_FILES} images.`)
      return
    }

    const valid: File[] = []
    for (const file of files.slice(0, availableSlots)) {
      if (!EVIDENCE_ALLOWED_TYPES.includes(file.type)) {
        toast.error("Only JPG, PNG, and WEBP are allowed.")
        continue
      }
      if (file.size > EVIDENCE_MAX_BYTES) {
        toast.error("Each image must be under 10MB.")
        continue
      }
      valid.push(file)
    }

    if (valid.length === 0) return

    const newPreviews = valid.map((file) => URL.createObjectURL(file))
    previewUrlsRef.current = [...previewUrlsRef.current, ...newPreviews]
    setEvidenceFiles((prev) => [...prev, ...valid])
    setEvidencePreviews((prev) => [...prev, ...newPreviews])
  }

  function handleEvidenceRemove(index: number) {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index))
    setEvidencePreviews((prev) => {
      const removed = prev[index]
      if (removed) {
        URL.revokeObjectURL(removed)
        previewUrlsRef.current = previewUrlsRef.current.filter(
          (url) => url !== removed
        )
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  async function uploadEvidence(targetReviewId: string): Promise<string[]> {
    if (evidenceFiles.length === 0) return []
    setIsUploadingEvidence(true)
    const uploaded: string[] = []
    try {
      for (const file of evidenceFiles) {
        const compressed = await compressEvidence(file)
        const formData = new FormData()
        formData.append("file", compressed)
        const { url } = await uploadReviewReportEvidenceAction(
          formData,
          targetReviewId,
          cafeId
        )
        uploaded.push(url)
      }
      return uploaded
    } finally {
      setIsUploadingEvidence(false)
    }
  }

  async function handleSubmit() {
    if (!reason) {
      setErrors({ reason: "Please pick a reason before submitting." })
      return
    }
    setErrors({})
    setIsSubmitting(true)
    let evidenceUrls: string[] = []
    try {
      evidenceUrls = await uploadEvidence(reviewId)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Image upload failed."
      toast.error(message)
      setIsSubmitting(false)
      return
    }

    try {
      const result = await submitReviewReportAction({
        reviewId,
        cafeId,
        reasonCode: reason,
        description,
        evidenceUrls,
      })

      if (result.success) {
        onSubmitted(result.reviewId)
        toast.success(
          "Report submitted successfully. Our moderation team will review the report."
        )
        onClose()
        return
      }

      if (result.error === "ALREADY_REPORTED") {
        onSubmitted(reviewId)
        toast.success(getErrorMessage(result))
        onClose()
        return
      }

      toast.error(getErrorMessage(result))
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Couldn't submit the report."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isBusy = isSubmitting || isUploadingEvidence
  const remainingSlots = REPORT_EVIDENCE_MAX_FILES - evidenceFiles.length

  return (
    <>
      <DialogHeader>
        <DialogTitle>Report Review</DialogTitle>
        <DialogDescription>
          Tell us why this review should be reviewed by moderation.
        </DialogDescription>
      </DialogHeader>

      <FieldGroup>
        <FieldSet data-invalid={errors.reason ? true : undefined}>
          <FieldLegend variant="label">Reason</FieldLegend>
          <FieldDescription>
            Pick the reason that best describes the issue.
          </FieldDescription>
          <RadioGroup
            value={reason}
            onValueChange={handleReasonChange}
            aria-invalid={errors.reason ? true : undefined}
            disabled={isBusy}
          >
            {REPORT_REASONS.map((option) => {
              const id = `report-reason-${option.value}`
              return (
                <Field
                  key={option.value}
                  orientation="horizontal"
                  data-invalid={errors.reason ? true : undefined}
                >
                  <RadioGroupItem
                    id={id}
                    value={option.value}
                    aria-invalid={errors.reason ? true : undefined}
                  />
                  <FieldLabel
                    htmlFor={id}
                    className="font-normal cursor-pointer"
                  >
                    {option.label}
                  </FieldLabel>
                </Field>
              )
            })}
          </RadioGroup>
          {errors.reason && <FieldError>{errors.reason}</FieldError>}
        </FieldSet>

        <Field>
          <FieldLabel htmlFor="report-description">Additional details</FieldLabel>
          <Textarea
            id="report-description"
            value={description}
            onChange={handleDescriptionChange}
            maxLength={REPORT_DESCRIPTION_MAX_LENGTH}
            placeholder="Provide any context that would help our moderation team…"
            disabled={isBusy}
          />
          <div className="flex items-center justify-between gap-2">
            <FieldDescription>Optional</FieldDescription>
            <FieldDescription className="tabular-nums">
              {description.length}/{REPORT_DESCRIPTION_MAX_LENGTH}
            </FieldDescription>
          </div>
        </Field>
      </FieldGroup>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isBusy}
        >
          Cancel
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={isBusy}>
          {isBusy && <Spinner data-icon="inline-start" />}
          Submit Report
        </Button>
      </DialogFooter>
    </>
  )
}

export function ReviewReportDialog({
  open,
  onOpenChange,
  reviewId,
  cafeId,
  onSubmitted,
  resetKey,
}: ReviewReportDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onOpenChange(false)
      }}
    >
      {open && reviewId ? (
        <DialogContent key={resetKey ?? reviewId}>
          <ReviewReportForm
            reviewId={reviewId}
            cafeId={cafeId}
            onSubmitted={onSubmitted}
            onClose={() => onOpenChange(false)}
          />
        </DialogContent>
      ) : (
        <DialogContent />
      )}
    </Dialog>
  )
}
