export const REPORT_REASONS = [
  { value: "fake_review", label: "Fake Review" },
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment" },
  { value: "conflict_of_interest", label: "Conflict of Interest" },
  { value: "inappropriate_content", label: "Inappropriate Content" },
  { value: "other", label: "Other" },
] as const

export type ReportReason = (typeof REPORT_REASONS)[number]["value"]

export const REPORT_REASON_VALUES: ReadonlyArray<ReportReason> =
  REPORT_REASONS.map((r) => r.value)

export const REPORT_DESCRIPTION_MAX_LENGTH = 1000
export const REPORT_EVIDENCE_MAX_FILES = 5

export type SubmitReviewReportPayload = {
  reviewId: string
  cafeId: string
  reasonCode: ReportReason
  description: string
  evidenceUrls: string[]
}

export type SubmitReviewReportError =
  | "NOT_AUTHENTICATED"
  | "NOT_CAFE_OWNER"
  | "REVIEW_NOT_FOUND"
  | "ALREADY_REPORTED"
  | "INVALID_INPUT"
  | "DATABASE_ERROR"

export type SubmitReviewReportResult =
  | { success: true; reviewId: string }
  | { success: false; error: SubmitReviewReportError }

export const REPORT_ERROR_MESSAGES: Record<SubmitReviewReportError, string> = {
  NOT_AUTHENTICATED:
    "Please sign in again to report this review.",
  NOT_CAFE_OWNER:
    "You don't have permission to report reviews for this cafe.",
  REVIEW_NOT_FOUND: "This review is no longer available.",
  ALREADY_REPORTED: "You've already reported this review.",
  INVALID_INPUT: "Please pick a reason before submitting.",
  DATABASE_ERROR: "Couldn't submit the report. Please try again.",
}
