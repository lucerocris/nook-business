"use server"

// 1. FIX: Import the standard server client instead of the admin client
import { createClient } from "@/lib/supabase/server"
import {
  REPORT_DESCRIPTION_MAX_LENGTH,
  REPORT_EVIDENCE_MAX_FILES,
  REPORT_REASON_VALUES,
  type ReportReason,
  type SubmitReviewReportPayload,
  type SubmitReviewReportResult,
} from "@/types/review-report"

const UUID_LIKE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const POSTGRES_UNIQUE_VIOLATION = "23505"

function isUuid(value: string): boolean {
  return UUID_LIKE.test(value)
}

function isValidReason(value: string): value is ReportReason {
  return (REPORT_REASON_VALUES as ReadonlyArray<string>).includes(value)
}

function validatePayload(
  payload: SubmitReviewReportPayload
): SubmitReviewReportResult | null {
  if (!payload || typeof payload !== "object") {
    return { success: false, error: "INVALID_INPUT" }
  }
  if (
    typeof payload.reviewId !== "string" ||
    !isUuid(payload.reviewId) ||
    typeof payload.cafeId !== "string" ||
    !isUuid(payload.cafeId)
  ) {
    return { success: false, error: "INVALID_INPUT" }
  }
  if (
    typeof payload.reasonCode !== "string" ||
    !isValidReason(payload.reasonCode)
  ) {
    return { success: false, error: "INVALID_INPUT" }
  }
  if (typeof payload.description !== "string") {
    return { success: false, error: "INVALID_INPUT" }
  }
  if (payload.description.length > REPORT_DESCRIPTION_MAX_LENGTH) {
    return { success: false, error: "INVALID_INPUT" }
  }
  if (
    !Array.isArray(payload.evidenceUrls) ||
    payload.evidenceUrls.length > REPORT_EVIDENCE_MAX_FILES
  ) {
    return { success: false, error: "INVALID_INPUT" }
  }
  if (
    !payload.evidenceUrls.every(
      (url) => typeof url === "string" && url.length > 0
    )
  ) {
    return { success: false, error: "INVALID_INPUT" }
  }
  return null
}

export async function submitReviewReportAction(
  payload: SubmitReviewReportPayload
): Promise<SubmitReviewReportResult> {
  const validationError = validatePayload(payload)
  if (validationError) return validationError

  // 2. FIX: Initialize the standard client and await it
  const supabase = await createClient()

  // This will now successfully read the cookies and find the user
  const { data: userData, error: userError } = await supabase.auth.getUser()
  const user = userData?.user
  
  if (userError || !user) {
    return { success: false, error: "NOT_AUTHENTICATED" }
  }

  // Because of your RLS policies, this standard client handles everything securely
  const { data: ownership, error: ownershipError } = await supabase
    .from("cafe_owner_cafe")
    .select("owner_id")
    .eq("owner_id", user.id)
    .eq("cafe_id", payload.cafeId)
    .maybeSingle()

  if (ownershipError) {
    return { success: false, error: "DATABASE_ERROR" }
  }
  if (!ownership) {
    return { success: false, error: "NOT_CAFE_OWNER" }
  }

  const { data: review, error: reviewError } = await supabase
    .from("reviews")
    .select("id, cafe_id")
    .eq("id", payload.reviewId)
    .eq("cafe_id", payload.cafeId)
    .maybeSingle()

  if (reviewError) {
    return { success: false, error: "DATABASE_ERROR" }
  }
  if (!review) {
    return { success: false, error: "REVIEW_NOT_FOUND" }
  }

  const trimmedDescription = payload.description.trim()
  const { error: insertError } = await supabase.from("review_reports").insert({
    review_id: payload.reviewId,
    cafe_id: payload.cafeId,
    reporter_id: user.id,
    reporter_type: "owner",
    reason_code: payload.reasonCode,
    description: trimmedDescription.length > 0 ? trimmedDescription : null,
    evidence_urls: payload.evidenceUrls,
    status: "pending",
  })

  if (insertError) {
    if (insertError.code === POSTGRES_UNIQUE_VIOLATION) {
      return { success: false, error: "ALREADY_REPORTED" }
    }
    return { success: false, error: "DATABASE_ERROR" }
  }

  return { success: true, reviewId: payload.reviewId }
}