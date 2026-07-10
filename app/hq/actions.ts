"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { isValidHqBasicAuthorization } from "@/lib/hq/basicAuth";
import {
  isLeadPriority,
  isLeadStatus,
  type LeadPriority,
  type LeadStatus,
} from "@/lib/hq/leadFollowUp";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const ASSESSMENT_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const FOLLOW_UP_AT_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const HQ_TIME_ZONE_OFFSET = "-05:00";
const INTERNAL_NOTE_MAX_LENGTH = 1000;
const ARCHIVE_REASON_MAX_LENGTH = 500;

type LeadFollowUpUpdate = {
  assessment_id: string;
  follow_up_at: string | null;
  internal_note: string | null;
  lead_priority: LeadPriority;
  lead_status: LeadStatus;
  mark_contacted: boolean;
};

function getFormText(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function parseFollowUpAt(value: string) {
  if (!value) {
    return null;
  }

  if (!FOLLOW_UP_AT_PATTERN.test(value)) {
    return undefined;
  }

  const parsedDate = new Date(`${value}:00${HQ_TIME_ZONE_OFFSET}`);

  return Number.isNaN(parsedDate.getTime())
    ? undefined
    : parsedDate.toISOString();
}

function parseLeadFollowUpUpdate(
  formData: FormData,
): LeadFollowUpUpdate | undefined {
  const assessmentId = getFormText(formData, "assessment_id");
  const leadStatus = getFormText(formData, "lead_status");
  const leadPriority = getFormText(formData, "lead_priority");
  const internalNote = getFormText(formData, "internal_note");
  const followUpAt = parseFollowUpAt(getFormText(formData, "follow_up_at"));

  if (
    !ASSESSMENT_ID_PATTERN.test(assessmentId) ||
    !isLeadStatus(leadStatus) ||
    !isLeadPriority(leadPriority) ||
    internalNote.length > INTERNAL_NOTE_MAX_LENGTH ||
    followUpAt === undefined
  ) {
    return undefined;
  }

  return {
    assessment_id: assessmentId,
    follow_up_at: followUpAt,
    internal_note: internalNote || null,
    lead_priority: leadPriority,
    lead_status: leadStatus,
    mark_contacted: getFormText(formData, "mark_contacted") === "true",
  };
}

function parseAssessmentId(formData: FormData) {
  const assessmentId = getFormText(formData, "assessment_id");

  return ASSESSMENT_ID_PATTERN.test(assessmentId) ? assessmentId : undefined;
}

function parseArchiveReason(formData: FormData) {
  const archivedReason = getFormText(formData, "archived_reason");

  if (archivedReason.length > ARCHIVE_REASON_MAX_LENGTH) {
    return undefined;
  }

  return archivedReason || null;
}

async function assertHqActionAuthorized() {
  const headerStore = await headers();

  if (!isValidHqBasicAuthorization(headerStore.get("authorization"))) {
    throw new Error("Unauthorized HQ lead update.");
  }
}

export async function updateLeadFollowUp(formData: FormData) {
  await assertHqActionAuthorized();

  const payload = parseLeadFollowUpUpdate(formData);

  if (!payload) {
    return;
  }

  const updatedAt = new Date().toISOString();
  const updatePayload: {
    follow_up_at: string | null;
    internal_note: string | null;
    last_contacted_at?: string;
    lead_priority: LeadPriority;
    lead_status: LeadStatus;
    lead_updated_at: string;
  } = {
    follow_up_at: payload.follow_up_at,
    internal_note: payload.internal_note,
    lead_priority: payload.lead_priority,
    lead_status: payload.lead_status,
    lead_updated_at: updatedAt,
  };

  if (payload.mark_contacted) {
    updatePayload.last_contacted_at = updatedAt;
  }

  const { error } = await createSupabaseServiceClient()
    .from("assessments")
    .update(updatePayload)
    .eq("id", payload.assessment_id);

  if (error) {
    throw new Error("Unable to update HQ lead follow-up fields.");
  }

  revalidatePath("/hq");
}

export async function archiveLeadAssessment(formData: FormData) {
  await assertHqActionAuthorized();

  const assessmentId = parseAssessmentId(formData);
  const archivedReason = parseArchiveReason(formData);

  if (!assessmentId || archivedReason === undefined) {
    return;
  }

  const { error } = await createSupabaseServiceClient()
    .from("assessments")
    .update({
      archived_at: new Date().toISOString(),
      archived_reason: archivedReason,
      is_archived: true,
    })
    .eq("id", assessmentId);

  if (error) {
    throw new Error("Unable to archive HQ lead assessment.");
  }

  revalidatePath("/hq");
}

export async function restoreLeadAssessment(formData: FormData) {
  await assertHqActionAuthorized();

  const assessmentId = parseAssessmentId(formData);

  if (!assessmentId) {
    return;
  }

  const { error } = await createSupabaseServiceClient()
    .from("assessments")
    .update({
      archived_at: null,
      archived_reason: null,
      is_archived: false,
    })
    .eq("id", assessmentId);

  if (error) {
    throw new Error("Unable to restore HQ lead assessment.");
  }

  revalidatePath("/hq");
}
