import { useEffect, useMemo, useState } from "react";

import {
  ApiError,
  fetchAuditLog,
  fetchDemoMode,
  fetchTrialRequest,
  fetchTrialRequests,
  updateDemoMode,
  updateTrialRequestStatus
} from "./api.js";
import {
  demoArtifactOrder,
  getDemoArtifacts,
  type DemoArtifact,
  type DemoArtifactCard,
  type DemoArtifactKind,
  type DemoArtifactSection,
  type DemoArtifactTable
} from "./demoArtifacts.js";
import {
  artifactStatusTitles,
  getIntlLocale,
  getLocaleFromPath,
  getPathForLocale,
  statusTitles,
  type AppLocale,
  uiCopy
} from "./locale.js";
import type {
  AuditEvent,
  DemoWorkflowMode,
  TrialRequest,
  TrialRequestStatus,
  TrialRequestsResponse
} from "./types.js";

type StatusFilter = "all" | TrialRequestStatus;

type FeedbackState = {
  kind: "success" | "error" | "info";
  message: string;
} | null;

type MetricTone = "up" | "down" | "flat";

type TimelineTone = "accent" | "ok" | "warn" | "default";

type TimelineEntry = {
  id: string;
  tone: TimelineTone;
  kind: "status" | "text";
  actor: string;
  createdAt: string;
  fromStatus?: TrialRequestStatus;
  toStatus?: TrialRequestStatus;
  assignedOwner?: string;
  note?: string;
  prefix?: string;
  emphasis?: string;
  suffix?: string;
};

type TrialPresentation = {
  planLabel: string;
  seats: number;
  mrr: number;
  region: string;
  source: string;
  requesterTitle: string;
  trialLength: string;
};

const statusOptions: TrialRequestStatus[] = [
  "new",
  "qualified",
  "manual_review",
  "approved",
  "rejected"
];

const statusFilterOptions: StatusFilter[] = [
  "all",
  "new",
  "qualified",
  "manual_review",
  "approved",
  "rejected"
];

const statusClassNames: Record<TrialRequestStatus, string> = {
  new: "s-new",
  qualified: "s-qual",
  manual_review: "s-review",
  approved: "s-approved",
  rejected: "s-rejected"
};

const getMetricMeta = (
  locale: AppLocale
): Record<"total" | TrialRequestStatus, { delta: string; window: string; tone: MetricTone }> => {
  const copy = uiCopy[locale];

  return {
    total: { delta: "+4.1%", window: locale === "ru" ? "7д" : "7d", tone: "up" },
    new: { delta: "+18%", window: locale === "ru" ? "24ч" : "24h", tone: "up" },
    qualified: { delta: "+2.3%", window: locale === "ru" ? "7д" : "7d", tone: "flat" },
    manual_review: {
      delta: copy.metricReviewGate,
      window: copy.metricActive,
      tone: "flat"
    },
    approved: { delta: "+6.8%", window: locale === "ru" ? "7д" : "7d", tone: "up" },
    rejected: { delta: "−1.4%", window: locale === "ru" ? "7д" : "7d", tone: "down" }
  };
};

const getMetricLabels = (
  locale: AppLocale
): Array<{ key: "total" | TrialRequestStatus; label: string }> => {
  const copy = uiCopy[locale];

  return [
    { key: "total", label: copy.metricTotal },
    { key: "new", label: copy.metricNew },
    { key: "qualified", label: copy.metricQualified },
    { key: "manual_review", label: copy.metricManualReview },
    { key: "approved", label: copy.metricApproved },
    { key: "rejected", label: copy.metricRejected }
  ];
};

const formatStatusLabel = (value: TrialRequestStatus, locale: AppLocale): string =>
  statusTitles[locale][value].toLowerCase();

const formatStatusTitle = (value: TrialRequestStatus, locale: AppLocale): string =>
  statusTitles[locale][value];

const formatRequestCode = (value: string): string => {
  const digits = value.replace(/\D/g, "").padStart(3, "0");
  return `TR-${digits}`;
};

const formatCount = (value: number, locale: AppLocale): string =>
  new Intl.NumberFormat(getIntlLocale(locale)).format(value);

const formatCurrency = (value: number, locale: AppLocale): string =>
  new Intl.NumberFormat(getIntlLocale(locale), {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);

const formatAuditTime = (value: string, locale: AppLocale): string => {
  const timestamp = new Date(value);
  const copy = uiCopy[locale];
  const timeLabel = timestamp.toLocaleTimeString(locale === "ru" ? "ru-RU" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit"
  });
  const now = new Date();
  const isToday =
    timestamp.getDate() === now.getDate() &&
    timestamp.getMonth() === now.getMonth() &&
    timestamp.getFullYear() === now.getFullYear();

  if (isToday) {
    return `${copy.today} · ${timeLabel}`;
  }

  const dateLabel = timestamp.toLocaleDateString(
    locale === "ru" ? "ru-RU" : "en-GB",
    {
    day: "2-digit",
    month: "short"
    }
  );

  return `${dateLabel} · ${timeLabel}`;
};

const formatAge = (value: string, locale: AppLocale): string => {
  const createdAt = new Date(value).getTime();
  const diffMs = Math.max(0, Date.now() - createdAt);
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60_000));
  const copy = uiCopy[locale];

  if (diffMinutes < 60) {
    return `${diffMinutes}${copy.minutesShort}`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}${copy.hoursShort}`;
  }

  return `${Math.floor(diffHours / 24)}${copy.daysShort}`;
};

const getTrialLengthOptions = (locale: AppLocale): Array<{ value: string; label: string }> => {
  const copy = uiCopy[locale];

  return [
    { value: "30 days", label: copy.days30 },
    { value: "14 days", label: copy.days14 },
    { value: "60 days", label: copy.days60 }
  ];
};

const addMinutes = (value: string, minutes: number): string =>
  new Date(new Date(value).getTime() + minutes * 60_000).toISOString();

const getInitials = (value: string): string => {
  const parts = value
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "");

  return parts.join("") || value.slice(0, 2).toUpperCase();
};

const getDomain = (email: string): string => email.split("@")[1] ?? email;

const getSeed = (value: string): number => {
  const digits = Number.parseInt(value.replace(/\D/g, ""), 10);
  return Number.isFinite(digits) && digits > 0 ? digits : 1;
};

const translateRequestNote = (note: string, locale: AppLocale): string => {
  if (locale === "en") {
    return note;
  }

  const exactNotes: Record<string, string> = {
    "Asked for a shared onboarding checklist.":
      "Попросили общий чеклист для onboarding.",
    "Wants a short implementation estimate before kickoff.":
      "До kickoff хотят короткую оценку implementation.",
    "Security questionnaire sent.":
      "Опросник по безопасности уже отправлен.",
    "Interested in guided onboarding for two teams later.":
      "Позже интересует guided onboarding для двух команд.",
    "Pilot window starts next Monday.":
      "Окно pilot стартует в следующий понедельник.",
    "Prefers async status updates.":
      "Предпочитают асинхронные статус-обновления.",
    "No active engineering sponsor.":
      "Нет активного engineering sponsor.",
    "Asked to revisit in one quarter.":
      "Попросили вернуться к теме через квартал.",
    "Needs a compliance-friendly demo path.":
      "Нужен demo path, удобный для compliance.",
    "Asks about proof artifacts early.":
      "Рано спрашивают про proof artifacts.",
    "Inbound from founder network intro.":
      "Входящий запрос после intro из founder network.",
    "Interested in one repo, one case pilot.":
      "Интересен pilot в формате one repo, one case.",
    "Completed pilot scoping.":
      "Pilot scoping завершён.",
    "Wants proof-oriented readout for leadership.":
      "Нужен proof-oriented readout для leadership.",
    "Only one individual buyer, no team sponsor.":
      "Есть только один individual buyer, но нет team sponsor.",
    "No repo identified for a pilot case.":
      "Repo для pilot case не определён.",
    "Wants a live walkthrough with fake production-like data.":
      "Нужен live walkthrough на данных, похожих на production.",
    "May expand to a second repo later.":
      "Позже могут расшириться на второй repo.",
    "Needs a clearer example of trial request review flow.":
      "Нужен более понятный пример trial request review flow.",
    "Asked for a deterministic reset between demos.":
      "Попросили deterministic reset между демо."
  };

  return exactNotes[note] ?? note;
};

const getSource = (item: TrialRequest, locale: AppLocale): string => {
  const notes = item.notes.join(" ").toLowerCase();
  const copy = uiCopy[locale];

  if (notes.includes("founder network")) {
    return copy.sourceFounderIntro;
  }
  if (notes.includes("security questionnaire")) {
    return copy.sourceSecurityReview;
  }
  if (notes.includes("proof artifacts")) {
    return copy.sourceSalesAssisted;
  }
  if (notes.includes("live walkthrough")) {
    return copy.sourceLiveDemo;
  }
  if (notes.includes("deterministic reset")) {
    return copy.sourceProductPage;
  }
  if (notes.includes("pilot window")) {
    return copy.sourcePilotHandoff;
  }

  return copy.sourceWebsiteForm;
};

const getTrialPresentation = (
  item: TrialRequest,
  locale: AppLocale
): TrialPresentation => {
  const seed = getSeed(item.id);
  const copy = uiCopy[locale];

  if (item.segment === "smb") {
    const seats = 6 + (seed % 6) * 2;
    const planLabel = seats <= 12 ? copy.planStarter : copy.planTeam;
    return {
      planLabel,
      seats,
      mrr: seats * 45,
      region: `${copy.regionEurope} · eu-central-1`,
      source: getSource(item, locale),
      requesterTitle: copy.titleOperationsLead,
      trialLength: locale === "ru" ? "14 дней" : "14 days"
    };
  }

  if (item.segment === "enterprise") {
    const seats = 120 + (seed % 6) * 40;
    return {
      planLabel: copy.planEnterprise,
      seats,
      mrr: seats * 70,
      region: `${copy.regionNorthAmerica} · us-east-1`,
      source: getSource(item, locale),
      requesterTitle: copy.titleVPPlatform,
      trialLength: locale === "ru" ? "30 дней" : "30 days"
    };
  }

  const seats = 24 + (seed % 8) * 8;
  return {
    planLabel: seed % 2 === 0 ? copy.planBusiness : copy.planTeam,
    seats,
    mrr: seats * 60,
    region: `${copy.regionNorthAmerica} · us-east-2`,
    source: getSource(item, locale),
    requesterTitle: copy.titleDirectorOps,
    trialLength: locale === "ru" ? "30 дней" : "30 days"
  };
};

const getDefaultReasonForStatus = (
  item: TrialRequest,
  targetStatus: TrialRequestStatus,
  workflowMode: DemoWorkflowMode,
  locale: AppLocale
): string => {
  if (locale === "ru") {
    if (workflowMode === "goalrail") {
      switch (targetStatus) {
        case "qualified":
          return "Заявка подходит для среза Goalrail. Готова к ручной проверке перед выдачей trial.";
        case "manual_review":
          return "Готово к ручной проверке перед выдачей trial. Одобрение заблокировано до завершения проверки.";
        case "approved":
          return "Ручная проверка завершена. Ответственный назначен, обоснование решения зафиксировано до одобрения.";
        case "rejected":
          return "Ручная проверка завершена. Заявка отклонена с назначенным ответственным и явным обоснованием решения.";
        case "new":
        default:
          return "Вернули в новый статус для ограниченной повторной проверки перед review.";
      }
    }

    if (item.segment === "smb") {
      switch (targetStatus) {
        case "approved":
          return "Одобрено в текущем baseline flow. Второй reviewer не требовался.";
        case "rejected":
          return "Сейчас это вне рамок текущего pilot.";
        case "qualified":
          return "Хорошее попадание в ICP. Домен и базовые требования к onboarding подтверждены.";
        case "manual_review":
          return "Ручная проверка не входит в baseline flow.";
        case "new":
        default:
          return "Первичный intake завершён. Ждём квалификацию.";
      }
    }

    if (item.segment === "enterprise") {
      switch (targetStatus) {
        case "approved":
          return "Одобрено напрямую по текущей baseline policy для enterprise onboarding.";
        case "rejected":
          return "Есть high-touch scope, но пока нет активного sponsor для pilot.";
        case "qualified":
          return "Хорошее попадание в ICP. Требования enterprise onboarding уже понятны.";
        case "manual_review":
          return "Ручная проверка не входит в baseline flow.";
        case "new":
        default:
          return "Первичный intake зафиксирован. Ожидает review на квалификацию.";
      }
    }

    switch (targetStatus) {
      case "approved":
        return "Одобрено в текущем baseline flow. Выдачу trial можно запускать сразу.";
      case "rejected":
        return "Недостаточно срочно для pilot в этом месяце.";
      case "qualified":
        return "Хорошее попадание в ICP. Домен и baseline requirements проверены. Готово к следующему шагу.";
      case "manual_review":
        return "Ручная проверка не входит в baseline flow.";
      case "new":
      default:
        return "Первичный intake завершён. Ждём квалификацию.";
    }
  }

  if (workflowMode === "goalrail") {
    switch (targetStatus) {
      case "qualified":
        return "Qualified for the Goalrail slice. Ready for manual review before provisioning.";
      case "manual_review":
        return "Ready for manual review before provisioning. Approval is blocked until review is complete.";
      case "approved":
        return "Manual review completed. Owner assigned and decision reason captured before approval.";
      case "rejected":
        return "Manual review completed. Request rejected with owner assignment and explicit decision reason.";
      case "new":
      default:
        return "Returned to new for a bounded recheck before review.";
    }
  }

  if (item.segment === "smb") {
    switch (targetStatus) {
      case "approved":
        return "Approved in the current baseline flow. No second reviewer was required.";
      case "rejected":
        return "Outside the current pilot scope at this stage.";
      case "qualified":
        return "Strong ICP fit. Verified domain and core onboarding requirements.";
      case "manual_review":
        return "Manual review is not part of the baseline flow.";
      case "new":
      default:
        return "Initial intake complete. Waiting on qualification.";
    }
  }

  if (item.segment === "enterprise") {
    switch (targetStatus) {
      case "approved":
        return "Approved directly per the current baseline policy for enterprise onboarding.";
      case "rejected":
        return "High-touch scope but no active pilot sponsor yet.";
      case "qualified":
        return "Strong ICP fit. Enterprise onboarding requirements are already understood.";
      case "manual_review":
        return "Manual review is not part of the baseline flow.";
      case "new":
      default:
        return "Initial intake captured. Awaiting qualification review.";
    }
  }

  switch (targetStatus) {
    case "approved":
      return "Approved in the current baseline flow. Provisioning can happen immediately.";
    case "rejected":
      return "Not enough urgency for a pilot this month.";
    case "qualified":
      return "Strong ICP fit. Verified domain and baseline requirements. Ready for the next review step.";
    case "manual_review":
      return "Manual review is not part of the baseline flow.";
    case "new":
    default:
      return "Initial intake complete. Waiting on qualification.";
  }
};

const getPrimaryActionLabel = (
  currentStatus: TrialRequestStatus,
  targetStatus: TrialRequestStatus,
  workflowMode: DemoWorkflowMode,
  locale: AppLocale
): string => {
  const copy = uiCopy[locale];

  if (workflowMode === "goalrail") {
    if (currentStatus === "manual_review" && targetStatus === "approved") {
      return copy.approveAfterReview;
    }

    if (currentStatus === "manual_review" && targetStatus === "rejected") {
      return copy.rejectAfterReview;
    }

    if (targetStatus === "manual_review") {
      return copy.sendToManualReview;
    }

    if (targetStatus === "qualified") {
      return copy.markQualified;
    }

    return copy.applyGoalrailDecision;
  }

  switch (targetStatus) {
    case "approved":
      return locale === "ru" ? copy.approveTrial : "Approve trial";
    case "rejected":
      return copy.saveRejection;
    case "qualified":
      return copy.markQualified;
    case "manual_review":
      return copy.manualReviewUnavailable;
    case "new":
    default:
      return copy.returnedToNew;
  }
};

const getStatusTone = (value: TrialRequestStatus): TimelineTone => {
  switch (value) {
    case "approved":
      return "ok";
    case "rejected":
      return "warn";
    case "qualified":
    case "manual_review":
      return "accent";
    case "new":
    default:
      return "default";
  }
};

const getTopNavCounts = (meta: TrialRequestsResponse["meta"] | null) => ({
  inbox: meta?.statusCounts.new ?? 0,
  trialRequests: meta?.total ?? 0,
  provisioning: (meta?.statusCounts.qualified ?? 0) + (meta?.statusCounts.manual_review ?? 0)
});

const getPreferredSelectionId = (
  items: TrialRequest[],
  preferredId?: string | null
): string | null => {
  if (!items.length) {
    return null;
  }

  if (preferredId) {
    const matched = items.find((item) => item.id === preferredId)?.id;
    if (matched) {
      return matched;
    }
  }

  return (
    items.find((item) => item.status === "qualified")?.id ??
    items.find((item) => item.status === "manual_review")?.id ??
    items[0]?.id ??
    null
  );
};

const getSuggestedNextStatus = (
  status: TrialRequestStatus,
  workflowMode: DemoWorkflowMode
): TrialRequestStatus => {
  if (workflowMode === "goalrail") {
    switch (status) {
      case "new":
      case "qualified":
        return "manual_review";
      case "manual_review":
        return "approved";
      default:
        return status;
    }
  }

  switch (status) {
    case "new":
    case "qualified":
      return "approved";
    default:
      return status;
  }
};

const matchesSearch = (
  item: TrialRequest,
  query: string,
  locale: AppLocale
): boolean => {
  if (!query.trim()) {
    return true;
  }

  const presentation = getTrialPresentation(item, locale);
  const haystack = [
    item.id,
    formatRequestCode(item.id),
    item.companyName,
    item.contactName,
    item.email,
    item.segment,
    item.owner ?? "",
    item.status,
    presentation.planLabel,
    presentation.source,
    ...item.notes.map((note) => translateRequestNote(note, locale))
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.trim().toLowerCase());
};

const buildTimeline = (
  item: TrialRequest,
  auditItems: AuditEvent[],
  workflowMode: DemoWorkflowMode,
  locale: AppLocale
): TimelineEntry[] => {
  const copy = uiCopy[locale];
  const presentation = getTrialPresentation(item, locale);
  const entries: TimelineEntry[] = [
    {
      id: `${item.id}-received`,
      tone: "accent",
      kind: "text",
      actor: "system",
      createdAt: item.createdAt,
      emphasis: copy.requestReceived,
      suffix: `${copy.from}${presentation.source}`
    },
    {
      id: `${item.id}-enrichment`,
      tone: "default",
      kind: "text",
      actor: "system",
      createdAt: addMinutes(item.createdAt, 6),
      prefix: copy.enrichmentComplete
    }
  ];

  const orderedAudit = [...auditItems].sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt)
  );

  if (orderedAudit.length > 0) {
    entries.push(
      ...orderedAudit.map((audit) => ({
        id: audit.id,
        tone: getStatusTone(audit.toStatus),
        kind: "status" as const,
        actor: audit.actor,
        createdAt: audit.createdAt,
        fromStatus: audit.fromStatus,
        toStatus: audit.toStatus,
        assignedOwner: audit.assignedOwner,
        note: audit.reason?.trim() || undefined
      }))
    );
  } else if (item.status !== "new") {
    entries.push({
      id: `${item.id}-baseline-status`,
      tone: getStatusTone(item.status),
      kind: "status",
      actor: item.owner ?? "demo.presenter",
      createdAt: addMinutes(item.createdAt, 15),
      fromStatus: "new",
      toStatus: item.status,
      assignedOwner: item.owner ?? undefined,
      note:
        item.status === "approved"
          ? workflowMode === "baseline"
            ? locale === "ru"
              ? "Одобрено напрямую в baseline flow."
              : "Approved directly in the baseline flow."
            : locale === "ru"
              ? "Одобрено после manual review в срезе Goalrail."
              : "Approved after manual review in the Goalrail slice."
          : item.status === "manual_review"
            ? locale === "ru"
              ? "Переведено в manual review перед approval."
              : "Moved into manual review before approval."
            : undefined
    });
  }

  if (workflowMode === "baseline") {
    entries.push({
      id: `${item.id}-policy`,
      tone: "warn",
      kind: "text",
      actor: "policy.baseline",
      createdAt: addMinutes(item.createdAt, 19),
      emphasis: copy.policyNotice,
      suffix: copy.eligibleForDirectApproval,
      note: copy.noSecondReviewerConfigured
    });
  } else {
    entries.push({
      id: `${item.id}-goalrail-policy`,
      tone: "accent",
      kind: "text",
      actor: "policy.goalrail",
      createdAt: addMinutes(item.createdAt, 19),
      emphasis: copy.goalrailSliceActiveTimeline,
      suffix: copy.approvalRequiresManualReview,
      note: copy.reviewDecisionsMustShow
    });
  }

  if (item.owner) {
    entries.push({
      id: `${item.id}-owner`,
      tone: "default",
      kind: "text",
      actor: item.owner,
      createdAt: addMinutes(item.createdAt, 21),
      prefix: copy.assignedOwnerPrefix,
      emphasis: item.owner
    });
  }

  return entries.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
};

const isFinalStatus = (status: TrialRequestStatus): boolean =>
  status === "approved" || status === "rejected";

const resolveLocalizedError = (error: unknown, locale: AppLocale): string => {
  if (error instanceof ApiError && locale === "ru") {
    switch (error.code) {
      case "review_required":
        return "Для approval сначала требуется manual review.";
      case "owner_required":
        return "Для review decision нужно указать owner.";
      case "reason_required":
        return "Для review decision нужно указать reason.";
      case "invalid_status":
        return "Передан недопустимый статус.";
      case "invalid_actor":
        return "Reviewer actor обязателен.";
      case "invalid_reason":
        return "Reason должен быть непустой строкой.";
      case "invalid_owner":
        return "Owner должен быть непустой строкой.";
      case "invalid_transition":
        return "Такой переход статуса не разрешён в текущем режиме.";
      case "not_found":
        return "Заявка не найдена.";
      default:
        return error.message;
    }
  }

  if (error instanceof ApiError) {
    return error.message;
  }

  return error instanceof Error ? error.message : uiCopy[locale].statusUpdateFailed;
};

export default function App() {
  const [locale, setLocale] = useState<AppLocale>(() =>
    typeof window === "undefined" ? "en" : getLocaleFromPath(window.location.pathname)
  );
  const [listData, setListData] = useState<TrialRequestsResponse | null>(null);
  const [demoMode, setDemoMode] = useState<DemoWorkflowMode>("baseline");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<TrialRequest | null>(null);
  const [auditItems, setAuditItems] = useState<AuditEvent[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [nextStatus, setNextStatus] = useState<TrialRequestStatus>("new");
  const [trialLength, setTrialLength] = useState("30 days");
  const [actor, setActor] = useState("demo.presenter");
  const [owner, setOwner] = useState("");
  const [reason, setReason] = useState("");
  const [reasonDirty, setReasonDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modeUpdating, setModeUpdating] = useState(false);
  const [artifactPanelOpen, setArtifactPanelOpen] = useState(false);
  const [activeArtifactId, setActiveArtifactId] =
    useState<DemoArtifactKind>("business_request");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const copy = uiCopy[locale];
  const metricMeta = useMemo(() => getMetricMeta(locale), [locale]);
  const metricLabels = useMemo(() => getMetricLabels(locale), [locale]);
  const demoArtifacts = useMemo(() => getDemoArtifacts(locale), [locale]);
  const trialLengthOptions = useMemo(() => getTrialLengthOptions(locale), [locale]);

  const refreshRuntime = async (targetId?: string | null) => {
    const [trialRequests, auditLog, modeState] = await Promise.all([
      fetchTrialRequests(),
      fetchAuditLog(),
      fetchDemoMode()
    ]);

    setListData(trialRequests);
    setAuditItems(auditLog.items);
    setDemoMode(modeState.workflowMode);

    const existingId = getPreferredSelectionId(
      trialRequests.items,
      targetId ?? selectedId ?? null
    );

    setSelectedId(existingId);
    return existingId;
  };

  useEffect(() => {
    const onPopState = () => {
      setLocale(getLocaleFromPath(window.location.pathname));
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title =
      demoMode === "baseline" ? copy.pageTitleBaseline : copy.pageTitleGoalrail;
  }, [copy.pageTitleBaseline, copy.pageTitleGoalrail, demoMode, locale]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await refreshRuntime();
      } catch (error) {
        setFeedback({
          kind: "error",
          message:
            error instanceof Error ? error.message : copy.demoDataFailed
        });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [copy.demoDataFailed]);

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timer = window.setTimeout(() => setFeedback(null), 3600);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const filteredItems = useMemo(() => {
    const source = [...(listData?.items ?? [])].sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt)
    );

    return source.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }

      return matchesSearch(item, searchQuery, locale);
    });
  }, [listData, locale, searchQuery, statusFilter]);

  useEffect(() => {
    if (!filteredItems.length) {
      setSelectedId(null);
      return;
    }

    if (!selectedId || !filteredItems.some((item) => item.id === selectedId)) {
      setSelectedId(filteredItems[0]?.id ?? null);
    }
  }, [filteredItems, selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedItem(null);
      return;
    }

    const loadDetail = async () => {
      try {
        setDetailLoading(true);
        const detail = await fetchTrialRequest(selectedId);
        setSelectedItem(detail.item);
      } catch (error) {
        setFeedback({
          kind: "error",
          message:
            error instanceof Error
              ? error.message
              : copy.requestDetailFailed
        });
      } finally {
        setDetailLoading(false);
      }
    };

    void loadDetail();
  }, [copy.requestDetailFailed, selectedId]);

  useEffect(() => {
    if (!selectedItem) {
      return;
    }

    const presentation = getTrialPresentation(selectedItem, locale);
    const suggestedStatus = getSuggestedNextStatus(selectedItem.status, demoMode);
    setNextStatus(suggestedStatus);
    setTrialLength(presentation.trialLength);
    setActor("demo.presenter");
    setOwner(selectedItem.owner ?? "");
    setReason(
      getDefaultReasonForStatus(selectedItem, suggestedStatus, demoMode, locale)
    );
    setReasonDirty(false);
  }, [selectedItem, demoMode, locale]);

  const navCounts = useMemo(() => getTopNavCounts(listData?.meta ?? null), [listData]);

  const selectedAuditItems = useMemo(() => {
    if (!selectedId) {
      return [];
    }

    return auditItems.filter((item) => item.requestId === selectedId);
  }, [auditItems, selectedId]);

  const latestSelectedAuditItem = useMemo(() => {
    if (selectedAuditItems.length === 0) {
      return null;
    }

    return [...selectedAuditItems].sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt)
    )[0] ?? null;
  }, [selectedAuditItems]);

  const selectedPresentation = useMemo(
    () => (selectedItem ? getTrialPresentation(selectedItem, locale) : null),
    [selectedItem, locale]
  );

  const timelineItems = useMemo(
    () =>
      selectedItem
        ? buildTimeline(selectedItem, selectedAuditItems, demoMode, locale)
        : [],
    [selectedItem, selectedAuditItems, demoMode, locale]
  );

  const handlePlaceholderAction = (label: string) => {
    setFeedback({
      kind: "info",
      message: `${label} ${copy.notificationsPlaceholder}`
    });
  };

  const syncReasonForTargetStatus = (targetStatus: TrialRequestStatus) => {
    if (!selectedItem) {
      return;
    }

    const currentDefault = getDefaultReasonForStatus(
      selectedItem,
      nextStatus,
      demoMode,
      locale
    );
    setNextStatus(targetStatus);

    if (!reasonDirty || reason.trim() === currentDefault.trim()) {
      setReason(
        getDefaultReasonForStatus(selectedItem, targetStatus, demoMode, locale)
      );
      setReasonDirty(false);
    }
  };

  const handleLocaleChange = (nextLocale: AppLocale) => {
    if (nextLocale === locale) {
      return;
    }

    window.history.pushState({}, "", getPathForLocale(nextLocale));
    setLocale(nextLocale);
  };

  const handleModeChange = async (mode: DemoWorkflowMode) => {
    if (mode === demoMode) {
      return;
    }

    try {
      setModeUpdating(true);
      await updateDemoMode(mode);
      const refreshedId = await refreshRuntime(selectedId);
      if (refreshedId) {
        const detail = await fetchTrialRequest(refreshedId);
        setSelectedItem(detail.item);
      }

      setFeedback({
        kind: "success",
        message:
          mode === "baseline"
            ? copy.baselineModeRestored
            : copy.goalrailModeActive
      });
    } catch (error) {
      setFeedback({
        kind: "error",
        message: error instanceof Error ? error.message : copy.demoModeUpdateFailed
      });
    } finally {
      setModeUpdating(false);
    }
  };

  const handleStatusUpdate = async (targetStatus = nextStatus) => {
    if (!selectedItem || targetStatus === selectedItem.status) {
      return;
    }

    try {
      const currentDefaultReason = getDefaultReasonForStatus(
        selectedItem,
        nextStatus,
        demoMode,
        locale
      );
      const submissionReason =
        targetStatus !== nextStatus &&
        (!reasonDirty || reason.trim() === currentDefaultReason.trim())
          ? getDefaultReasonForStatus(selectedItem, targetStatus, demoMode, locale)
          : reason;

      setSubmitting(true);
      await updateTrialRequestStatus({
        id: selectedItem.id,
        status: targetStatus,
        actor,
        owner: owner.trim() || undefined,
        reason: submissionReason
      });

      const refreshedId = await refreshRuntime(selectedItem.id);
      if (refreshedId) {
        const detail = await fetchTrialRequest(refreshedId);
        setSelectedItem(detail.item);
      }

      setFeedback({
        kind: "success",
        message: `${formatRequestCode(selectedItem.id)} ${copy.directStatusUpdateSuccess} ${formatStatusTitle(targetStatus, locale)}.`
      });
    } catch (error) {
      const message = resolveLocalizedError(error, locale);

      setFeedback({
        kind: "error",
        message
      });
    } finally {
      setSubmitting(false);
    }
  };

  const baselineDecisionOptions = useMemo(
    () => statusOptions.filter((status) => status !== "manual_review"),
    []
  );

  const openArtifactPanel = (artifactId: DemoArtifactKind = activeArtifactId) => {
    setActiveArtifactId(artifactId);
    setArtifactPanelOpen(true);
  };

  return (
    <>
      <div className="app" data-screen-label={copy.appScreenLabel}>
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true" />
            <div className="brand-name">TrialOps</div>
          </div>

          <nav className="nav" aria-label={copy.primaryNavigation}>
            <NavItem label={copy.navInbox} count={navCounts.inbox} activeLocale={locale} />
            <NavItem
              label={copy.navTrialRequests}
              count={navCounts.trialRequests}
              active
              activeLocale={locale}
            />
            <NavItem label={copy.navAccounts} activeLocale={locale} />
            <NavItem
              label={copy.navProvisioning}
              count={navCounts.provisioning}
              activeLocale={locale}
            />
          </nav>

          <div className="nav-divider" />

          <nav className="nav" aria-label={copy.operationsNavigation}>
            <NavItem label={copy.navAuditLog} activeLocale={locale} />
            <NavItem label={copy.navPolicies} activeLocale={locale} />
            <NavItem label={copy.navProofPack} activeLocale={locale} />
            <NavItem label={copy.navReports} activeLocale={locale} />
          </nav>

          <div className="nav-divider" />

          <nav className="nav" aria-label={copy.adminNavigation}>
            <NavItem label={copy.navTeam} activeLocale={locale} />
            <NavItem label={copy.navSettings} activeLocale={locale} />
          </nav>

          <div className="sidebar-foot">
            <div className="avatar">MO</div>
            <div className="who">
              <b>M. Ortega</b>
              <span>{copy.sidebarRole}</span>
            </div>
          </div>
        </aside>

        <main className="main">
          <div className="topbar">
            <label className="search" htmlFor="trialops-search">
              <SearchIcon />
              <input
                id="trialops-search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={copy.searchPlaceholder}
              />
              <span className="kbd-inline">⌘K</span>
            </label>

            <LanguageToggle locale={locale} onChange={handleLocaleChange} />

            <DemoModeToggle
              workflowMode={demoMode}
              locale={locale}
              disabled={modeUpdating}
              onChange={handleModeChange}
            />

            <div className="top-actions">
              <div className="env-chip">
                <span className="pulse" aria-hidden="true" />
                {copy.envChip}
              </div>
              <button
                type="button"
                className="icon-btn"
                title={copy.notifications}
                onClick={() => handlePlaceholderAction(copy.notifications)}
              >
                <BellIcon />
              </button>
            </div>
          </div>

          <section className="hero">
            <div className="hero-copy">
              <h1>
                {copy.heroTitle}
                <span className={`flow-label ${demoMode === "goalrail" ? "goalrail" : "baseline"}`}>
                  <span className="dot" aria-hidden="true" />
                  {demoMode === "baseline"
                    ? copy.heroFlowBaseline
                    : copy.heroFlowGoalrail}
                </span>
              </h1>
              <p className="hero-subtitle">
                {demoMode === "baseline"
                  ? copy.heroSubtitleBaseline
                  : copy.heroSubtitleGoalrail}
              </p>
            </div>
            <div className="hero-btns">
              <button
                type="button"
                className="btn"
                onClick={() => openArtifactPanel("business_request")}
              >
                {copy.goalrailArtifacts}
              </button>
              <button
                type="button"
                className="btn ghost"
                onClick={() => handlePlaceholderAction(copy.export)}
              >
                {copy.export}
              </button>
            </div>
          </section>

          {demoMode === "goalrail" ? (
            <section className="goalrail-banner" aria-label={copy.goalrailModeActive}>
              <div>
                <b>{copy.goalrailBannerTitle}</b> {copy.goalrailBannerBody}
              </div>
            </section>
          ) : null}

          <section className="metrics" aria-label={copy.workflowMetrics}>
            {metricLabels.map(({ key, label }) => {
              const config = metricMeta[key];
              const value =
                key === "total"
                  ? listData?.meta.total ?? 0
                  : listData?.meta.statusCounts[key] ?? 0;

              return (
                <article className="metric" key={key}>
                  <div className="label">{label}</div>
                  <div className="value">{formatCount(value, locale)}</div>
                  <div className="delta">
                    <span className={`chip ${config.tone}`}>{config.delta}</span>
                    <span>{config.window}</span>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="body">
            <div className="panel table-panel">
              <div className="filter-row">
                <div className="seg" role="tablist" aria-label={copy.statusFilter}>
                  {statusFilterOptions.map((filter) => {
                    const count =
                      filter === "all"
                        ? listData?.meta.total ?? 0
                        : listData?.meta.statusCounts[filter] ?? 0;

                    return (
                      <button
                        key={filter}
                        type="button"
                        className={filter === statusFilter ? "on" : undefined}
                        onClick={() => setStatusFilter(filter)}
                      >
                        {filter === "all"
                          ? copy.filterAll
                          : formatStatusTitle(filter, locale)}
                        <span className="num">{formatCount(count, locale)}</span>
                      </button>
                    );
                  })}
                </div>
                <span className="grow" />
                <button
                  type="button"
                  className="btn ghost table-sort"
                  onClick={() => handlePlaceholderAction(copy.sortAge)}
                >
                  {copy.sortAge}
                </button>
              </div>

              {loading ? (
                <div className="table-empty">{copy.tableLoading}</div>
              ) : filteredItems.length === 0 ? (
                <div className="table-empty">{copy.tableEmpty}</div>
              ) : (
                <>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th style={{ width: "34%" }}>{copy.tableCompany}</th>
                          <th>{copy.tableRequest}</th>
                          <th>{copy.tablePlan}</th>
                          <th>{copy.tableSeats}</th>
                          <th>{copy.tableMrr}</th>
                          <th>{copy.tableStatus}</th>
                          <th style={{ width: "56px" }}>{copy.tableAge}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredItems.map((item) => {
                          const presentation = getTrialPresentation(item, locale);
                          return (
                            <tr
                              key={item.id}
                              className={item.id === selectedId ? "selected" : undefined}
                              onClick={() => setSelectedId(item.id)}
                            >
                              <td>
                                <div className="co">
                                  <div className="co-logo">{getInitials(item.companyName)}</div>
                                  <div>
                                    <b>{item.companyName}</b>
                                    <div className="dom">{getDomain(item.email)}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="req-id">{formatRequestCode(item.id)}</span>
                              </td>
                              <td>
                                <span className="plan-pill">{presentation.planLabel}</span>
                              </td>
                              <td className="num">{formatCount(presentation.seats, locale)}</td>
                              <td className="money">{formatCurrency(presentation.mrr, locale)}</td>
                              <td>
                                <StatusChip status={item.status} locale={locale} />
                              </td>
                              <td className="age">{formatAge(item.createdAt, locale)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="table-foot">
                    <div>
                      {copy.showing} <b>{formatCount(filteredItems.length, locale)}</b>{" "}
                      {copy.of} <b>{formatCount(listData?.meta.total ?? filteredItems.length, locale)}</b>
                    </div>
                    <div className="pager">
                      <button type="button" aria-label={copy.previousPage}>
                        ‹
                      </button>
                      <button type="button" className="on">
                        1
                      </button>
                      <button type="button">2</button>
                      <button type="button">3</button>
                      <button type="button">…</button>
                      <button type="button">13</button>
                      <button type="button" aria-label={copy.nextPage}>
                        ›
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <aside className="right">
              <div className="panel">
                {detailLoading ? (
                  <div className="detail-empty">{copy.detailLoading}</div>
                ) : selectedItem && selectedPresentation ? (
                  <>
                    <div className="detail-head">
                      <div className="co-logo">{getInitials(selectedItem.companyName)}</div>
                      <div className="detail-title">
                        <b>{selectedItem.companyName}</b>
                        <span>
                          {formatRequestCode(selectedItem.id)} · {formatAge(selectedItem.createdAt, locale)} {copy.ago}
                        </span>
                      </div>
                      <span className="grow" />
                      <StatusChip status={selectedItem.status} compact locale={locale} />
                      <button
                        type="button"
                        className="icon-btn"
                        title={copy.moreActions}
                        onClick={() => handlePlaceholderAction(copy.moreActions)}
                      >
                        <MoreIcon />
                      </button>
                    </div>

                    <div className="detail-body">
                      <div className="fieldset">
                        <div className="l">{copy.requester}</div>
                        <div className="v">
                          {selectedItem.contactName}
                          <span className="muted">· {selectedPresentation.requesterTitle}</span>
                        </div>

                        <div className="l">{copy.email}</div>
                        <div className="v mono">{selectedItem.email}</div>

                        <div className="l">{copy.plan}</div>
                        <div className="v">
                          {selectedPresentation.planLabel} · {formatCount(selectedPresentation.seats, locale)} {copy.seatsUnit} · {formatCurrency(selectedPresentation.mrr, locale)}{copy.perMonth}
                        </div>

                        <div className="l">{copy.owner}</div>
                        <div className="v">
                          {selectedItem.owner ?? copy.unassigned}
                          <span className="muted">
                            · {demoMode === "baseline" ? copy.baselineQueue : copy.ownerMustBeVisible}
                          </span>
                        </div>

                        <div className="l">{copy.region}</div>
                        <div className="v">{selectedPresentation.region}</div>

                        <div className="l">{copy.source}</div>
                        <div className="v">{copy.inbound} · {selectedPresentation.source}</div>

                        <div className="l">{copy.mode}</div>
                        <div className="v">
                          {demoMode === "baseline" ? copy.baselineBeforeState : copy.goalrailReviewGate}
                        </div>
                      </div>
                    </div>

                    <div className="notes">
                      <div className="nh">{copy.notes}</div>
                      {selectedItem.notes.map((note) => translateRequestNote(note, locale)).join(" ")}
                    </div>

                    {demoMode === "baseline" ? (
                      <div className="form">
                        <div className="form-h">
                          <h4>{copy.updateStatus}</h4>
                          <span className="hint">{copy.writtenToAudit}</span>
                        </div>

                        <div className="form-row">
                          <div className="field">
                            <label htmlFor="decision-select">{copy.decision}</label>
                            <select
                              id="decision-select"
                              className="select"
                              value={nextStatus}
                              onChange={(event) =>
                                syncReasonForTargetStatus(
                                  event.target.value as TrialRequestStatus
                                )
                              }
                            >
                              {baselineDecisionOptions.map((status) => (
                                <option key={status} value={status}>
                                  {getPrimaryActionLabel(
                                    selectedItem.status,
                                    status,
                                    demoMode,
                                    locale
                                  )}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="field">
                            <label htmlFor="trial-length">{copy.trialLength}</label>
                            <select
                              id="trial-length"
                              className="select"
                              value={trialLength}
                              onChange={(event) => setTrialLength(event.target.value)}
                            >
                              {trialLengthOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="field">
                          <label htmlFor="baseline-reason">{copy.internalReason}</label>
                          <textarea
                            id="baseline-reason"
                            placeholder={copy.optionalNote}
                            value={reason}
                            onChange={(event) => {
                              setReason(event.target.value);
                              setReasonDirty(true);
                            }}
                          />
                        </div>

                        <div className="warn-inline">
                          <WarnIcon />
                          <div>
                            <b>{copy.directApprovalTitle}</b> {copy.directApprovalBody}
                          </div>
                        </div>

                        <div className="actions">
                          <span className="grow" />
                          <button
                            type="button"
                            className="btn danger-ghost"
                            onClick={() => void handleStatusUpdate("rejected")}
                            disabled={submitting || selectedItem.status === "rejected"}
                          >
                            {copy.reject}
                          </button>
                          <button
                            type="button"
                            className="btn approve"
                            onClick={() => void handleStatusUpdate()}
                            disabled={submitting || nextStatus === selectedItem.status}
                          >
                            {submitting
                              ? copy.applying
                              : getPrimaryActionLabel(
                                  selectedItem.status,
                                  nextStatus,
                                  demoMode,
                                  locale
                                )}
                          </button>
                        </div>
                      </div>
                    ) : selectedItem.status === "manual_review" ? (
                      <div className="form">
                        <div className="form-h">
                          <h4>{copy.reviewDecision}</h4>
                          <span className="hint">{copy.reviewerOwnerReasonRequired}</span>
                        </div>

                        <div className="form-row review-grid">
                          <div className="field">
                            <label htmlFor="reviewer-actor">{copy.reviewer}</label>
                            <input
                              id="reviewer-actor"
                              className="text-input"
                              value={actor}
                              onChange={(event) => setActor(event.target.value)}
                              placeholder="demo.presenter"
                            />
                          </div>
                          <div className="field">
                            <label htmlFor="review-owner">{copy.assignedOwner}</label>
                            <input
                              id="review-owner"
                              className="text-input"
                              value={owner}
                              onChange={(event) => setOwner(event.target.value)}
                              placeholder="R. Singh"
                            />
                          </div>
                        </div>

                        <div className="field">
                          <label htmlFor="review-reason">{copy.decisionReason}</label>
                          <textarea
                            id="review-reason"
                            placeholder={copy.decisionReasonPlaceholder}
                            value={reason}
                            onChange={(event) => {
                              setReason(event.target.value);
                              setReasonDirty(true);
                            }}
                          />
                        </div>

                        <div className="goalrail-inline">
                          <div className="goalrail-inline-title">{copy.manualReviewRequired}</div>
                          <div className="goalrail-inline-copy">
                            {copy.manualReviewRequiredBody}
                          </div>
                        </div>

                        <div className="actions">
                          <span className="grow" />
                          <button
                            type="button"
                            className="btn danger-ghost"
                            onClick={() => void handleStatusUpdate("rejected")}
                            disabled={submitting}
                          >
                            {submitting ? copy.applying : copy.rejectAfterReview}
                          </button>
                          <button
                            type="button"
                            className="btn approve"
                            onClick={() => void handleStatusUpdate("approved")}
                            disabled={submitting}
                          >
                            {submitting ? copy.applying : copy.approveAfterReview}
                          </button>
                        </div>
                      </div>
                    ) : isFinalStatus(selectedItem.status) ? (
                      <div className="final-state-card">
                        <div className="final-state-head">
                          <b>{copy.finalStatusReady}</b>
                          <StatusChip status={selectedItem.status} compact locale={locale} />
                        </div>
                        <p>{copy.finalStateBody}</p>
                        <div className="artifact-shortcuts">
                          <button
                            type="button"
                            className="btn ghost"
                            onClick={() => openArtifactPanel("proof")}
                          >
                            {copy.openProofInUi}
                          </button>
                          <button
                            type="button"
                            className="btn"
                            onClick={() => openArtifactPanel("readout")}
                          >
                            {copy.openReadoutInUi}
                          </button>
                        </div>
                        <div className="artifact-fallback-note">
                          {copy.markdownFallbackOnly}
                        </div>
                      </div>
                    ) : (
                      <div className="form">
                        <div className="form-h">
                          <h4>{copy.goalrailReviewGateTitle}</h4>
                          <span className="hint">{copy.approvalBlockedHint}</span>
                        </div>

                        <div className="review-gate-card">
                          <div className="review-gate-title">{copy.goalrailBannerTitle}</div>
                          <div className="review-gate-copy">{copy.goalrailReviewGateBody}</div>
                        </div>

                        <div className="actions split-actions">
                          {selectedItem.status === "new" ? (
                            <button
                              type="button"
                              className="btn ghost"
                              onClick={() => void handleStatusUpdate("qualified")}
                              disabled={submitting}
                            >
                              {submitting ? copy.applying : copy.markQualified}
                            </button>
                          ) : null}
                          <span className="grow" />
                          <button
                            type="button"
                            className="btn approve"
                            onClick={() => void handleStatusUpdate("manual_review")}
                            disabled={submitting}
                          >
                            {submitting ? copy.applying : copy.sendToManualReview}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="detail-empty">{copy.detailEmpty}</div>
                )}
              </div>

              <div className="panel">
                <div className="panel-h">
                  <h3>{copy.auditLog}</h3>
                  <span className="sub">
                    {selectedItem ? formatRequestCode(selectedItem.id) : copy.demo}
                  </span>
                </div>

                <div className="audit">
                  {timelineItems.length === 0 ? (
                    <div className="audit-empty">{copy.noAuditActivity}</div>
                  ) : (
                    timelineItems.map((item) => (
                      <div
                        key={item.id}
                        className={
                          item.tone === "default"
                            ? "audit-item"
                            : `audit-item ${item.tone}`
                        }
                      >
                        <span className="audit-dot" aria-hidden="true" />
                        <div className="audit-body">
                          {item.kind === "status" ? (
                            <div className="audit-l1">
                              {copy.statusPrefix}{" "}
                              <span className="tag">{formatStatusLabel(item.fromStatus!, locale)}</span> →{" "}
                              <span className="tag">{formatStatusLabel(item.toStatus!, locale)}</span>
                            </div>
                          ) : (
                            <div className="audit-l1">
                              {item.prefix ? <span>{item.prefix}</span> : null}
                              {item.emphasis ? <b>{item.emphasis}</b> : null}
                              {item.suffix ? <span>{item.suffix}</span> : null}
                            </div>
                          )}
                          <div className="audit-l2">
                            <span className="actor">{item.actor}</span>
                            <span>{formatAuditTime(item.createdAt, locale)}</span>
                          </div>
                          {item.assignedOwner ? (
                            <div className="audit-meta">{copy.assignedOwnerPrefix}{item.assignedOwner}</div>
                          ) : null}
                          {item.note ? <div className="audit-note">{item.note}</div> : null}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </aside>
          </section>
        </main>
      </div>

      {artifactPanelOpen ? (
        <GoalrailArtifactPanel
          locale={locale}
          copy={copy}
          demoArtifacts={demoArtifacts}
          workflowMode={demoMode}
          selectedItem={selectedItem}
          selectedAuditItems={selectedAuditItems}
          latestAuditItem={latestSelectedAuditItem}
          activeArtifactId={activeArtifactId}
          onSelectArtifact={setActiveArtifactId}
          onClose={() => setArtifactPanelOpen(false)}
        />
      ) : null}

      {feedback ? (
        <div className={`feedback-toast ${feedback.kind}`}>{feedback.message}</div>
      ) : null}
    </>
  );
}

function NavItem(props: {
  label: string;
  count?: number;
  active?: boolean;
  activeLocale: AppLocale;
}) {
  return (
    <a className={props.active ? "active" : undefined} href="#">
      {props.label}
      {typeof props.count === "number" ? (
        <span className="count">{formatCount(props.count, props.activeLocale)}</span>
      ) : null}
    </a>
  );
}

function LanguageToggle(props: {
  locale: AppLocale;
  onChange: (locale: AppLocale) => void;
}) {
  const copy = uiCopy[props.locale];

  return (
    <div className="demo-mode-switcher locale-switcher" aria-label={copy.language}>
      <div className="demo-mode-label">{copy.language}</div>
      <div className="demo-mode-buttons">
        <button
          type="button"
          className={props.locale === "en" ? "active" : undefined}
          onClick={() => props.onChange("en")}
        >
          {copy.langEnglish}
        </button>
        <button
          type="button"
          className={props.locale === "ru" ? "active" : undefined}
          onClick={() => props.onChange("ru")}
        >
          {copy.langRussian}
        </button>
      </div>
    </div>
  );
}

function DemoModeToggle(props: {
  workflowMode: DemoWorkflowMode;
  locale: AppLocale;
  disabled?: boolean;
  onChange: (mode: DemoWorkflowMode) => void;
}) {
  const copy = uiCopy[props.locale];

  return (
    <div className="demo-mode-switcher" aria-label={copy.demoMode}>
      <div className="demo-mode-label">{copy.demoMode}</div>
      <div className="demo-mode-buttons">
        <button
          type="button"
          className={props.workflowMode === "baseline" ? "active" : undefined}
          onClick={() => props.onChange("baseline")}
          disabled={props.disabled}
        >
          <span className="mode-context">{copy.before}</span>
          {copy.baseline}
        </button>
        <button
          type="button"
          className={props.workflowMode === "goalrail" ? "active" : undefined}
          onClick={() => props.onChange("goalrail")}
          disabled={props.disabled}
        >
          <span className="mode-context">{copy.after}</span>
          {copy.goalrailSlice}
        </button>
      </div>
    </div>
  );
}

function StatusChip(props: {
  status: TrialRequestStatus;
  compact?: boolean;
  locale: AppLocale;
}) {
  return (
    <span
      className={`status ${statusClassNames[props.status]}${props.compact ? " compact" : ""}`}
    >
      <span className="d" aria-hidden="true" />
      {formatStatusTitle(props.status, props.locale)}
    </span>
  );
}

const formatArtifactStatus = (
  value: DemoArtifact["status"],
  locale: AppLocale
): string => artifactStatusTitles[locale][value];

function GoalrailArtifactPanel(props: {
  locale: AppLocale;
  copy: (typeof uiCopy)[AppLocale];
  demoArtifacts: DemoArtifact[];
  workflowMode: DemoWorkflowMode;
  selectedItem: TrialRequest | null;
  selectedAuditItems: AuditEvent[];
  latestAuditItem: AuditEvent | null;
  activeArtifactId: DemoArtifactKind;
  onSelectArtifact: (artifactId: DemoArtifactKind) => void;
  onClose: () => void;
}) {
  const activeArtifact =
    props.demoArtifacts.find((artifact) => artifact.id === props.activeArtifactId) ??
    props.demoArtifacts[0];

  const latestTransition = props.latestAuditItem
    ? `${formatStatusTitle(props.latestAuditItem.fromStatus, props.locale)} → ${formatStatusTitle(
        props.latestAuditItem.toStatus,
        props.locale
      )}`
    : props.copy.evidencePending;

  return (
    <div
      className="artifact-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={props.copy.goalrailArtifactsPanelLabel}
    >
      <button
        type="button"
        className="artifact-overlay-backdrop"
        aria-label={props.copy.close}
        onClick={props.onClose}
      />
      <aside className="artifact-panel">
        <div className="artifact-panel-head">
          <div>
            <div className="artifact-panel-eyebrow">{props.copy.goalrailArtifacts}</div>
            <h2>{props.copy.artifactWorkspace}</h2>
            <p>{props.copy.artifactWorkspaceBody}</p>
          </div>
          <button type="button" className="icon-btn" onClick={props.onClose} title={props.copy.close}>
            <CloseIcon />
          </button>
        </div>

        <div className="artifact-context-strip">
          <ArtifactContextStat
            label={props.copy.currentMode}
            value={
              props.workflowMode === "baseline"
                ? props.copy.baselineBeforeState
                : props.copy.goalrailReviewGate
            }
          />
          <ArtifactContextStat
            label={props.copy.selectedRequest}
            value={
              props.selectedItem ? formatRequestCode(props.selectedItem.id) : props.copy.noRequestSelected
            }
          />
          <ArtifactContextStat
            label={props.copy.currentStatus}
            value={
              props.selectedItem
                ? formatStatusTitle(props.selectedItem.status, props.locale)
                : props.copy.noRequestSelected
            }
          />
          <ArtifactContextStat
            label={props.copy.currentOwner}
            value={props.selectedItem?.owner ?? props.copy.unassigned}
          />
          <ArtifactContextStat
            label={props.copy.latestAuditEvidence}
            value={latestTransition}
          />
        </div>

        <div className="artifact-contour" aria-label={props.copy.demoProofContour}>
          {demoArtifactOrder.map((artifactId) => {
            const artifact = props.demoArtifacts.find((item) => item.id === artifactId);
            if (!artifact) {
              return null;
            }

            return (
              <button
                key={artifact.id}
                type="button"
                className={`artifact-contour-step${
                  artifact.id === activeArtifact.id ? " active" : ""
                }`}
                onClick={() => props.onSelectArtifact(artifact.id)}
              >
                {artifact.navLabel}
              </button>
            );
          })}
        </div>

        <div className="artifact-workspace">
          <ArtifactNav
            locale={props.locale}
            copy={props.copy}
            demoArtifacts={props.demoArtifacts}
            activeArtifactId={activeArtifact.id}
            onSelectArtifact={props.onSelectArtifact}
          />

          <div className="artifact-detail-shell">
            <div className="artifact-detail-head">
              <div>
                <div className="artifact-detail-eyebrow">{props.copy.selectedArtifact}</div>
                <h3>{activeArtifact.title}</h3>
                <p>{activeArtifact.subtitle}</p>
              </div>
              <span className={`artifact-status-pill ${activeArtifact.status}`}>
                {formatArtifactStatus(activeArtifact.status, props.locale)}
              </span>
            </div>

            <div className="artifact-detail-meta">
              <div className="artifact-presenter-cue">
                <span>{props.copy.presenterCue}</span>
                <b>{activeArtifact.presenterNote}</b>
              </div>
              <div className="artifact-source-meta">
                <span>{props.copy.sourceArtifact}</span>
                <code>{activeArtifact.artifactPath}</code>
              </div>
            </div>

            <div className="artifact-detail-layout">
              <div className="artifact-detail-main">
                {activeArtifact.sections.map((section) => (
                  <ArtifactSectionCard key={section.title} section={section} />
                ))}

                {activeArtifact.cards?.length ? (
                  <ArtifactCardsGrid cards={activeArtifact.cards} />
                ) : null}

                {activeArtifact.tables?.map((table) => (
                  <ArtifactTableCard key={table.title} table={table} />
                ))}
              </div>

              <div className="artifact-detail-side">
                <CurrentEvidenceCard
                  locale={props.locale}
                  copy={props.copy}
                  selectedItem={props.selectedItem}
                  latestAuditItem={props.latestAuditItem}
                  evidenceCount={props.selectedAuditItems.length}
                />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function ArtifactNav(props: {
  locale: AppLocale;
  copy: (typeof uiCopy)[AppLocale];
  demoArtifacts: DemoArtifact[];
  activeArtifactId: DemoArtifactKind;
  onSelectArtifact: (artifactId: DemoArtifactKind) => void;
}) {
  return (
    <nav className="artifact-nav" aria-label={props.copy.artifactNavigation}>
      {props.demoArtifacts.map((artifact) => (
        <button
          key={artifact.id}
          type="button"
          className={`artifact-nav-item${
            artifact.id === props.activeArtifactId ? " active" : ""
          }`}
          onClick={() => props.onSelectArtifact(artifact.id)}
        >
          <div className="artifact-nav-top">
            <span className="artifact-nav-label">{artifact.navLabel}</span>
            <span className={`artifact-nav-status ${artifact.status}`}>
              {formatArtifactStatus(artifact.status, props.locale)}
            </span>
          </div>
          <div className="artifact-nav-note">{artifact.presenterNote}</div>
        </button>
      ))}
    </nav>
  );
}

function ArtifactContextStat(props: { label: string; value: string }) {
  return (
    <div className="artifact-context-card">
      <span>{props.label}</span>
      <b>{props.value}</b>
    </div>
  );
}

function ArtifactSectionCard(props: { section: DemoArtifactSection }) {
  return (
    <article className="artifact-section-card">
      <h4>{props.section.title}</h4>
      {props.section.body ? <p>{props.section.body}</p> : null}
      {props.section.callout ? (
        <div className="artifact-callout">{props.section.callout}</div>
      ) : null}
      {props.section.bullets?.length ? (
        <ul>
          {props.section.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function ArtifactCardsGrid(props: { cards: DemoArtifactCard[] }) {
  return (
    <div className="artifact-card-grid">
      {props.cards.map((card) => (
        <article key={card.title} className="artifact-detail-card">
          <h4>{card.title}</h4>
          {card.subtitle ? <p>{card.subtitle}</p> : null}
          {card.meta?.length ? (
            <dl className="artifact-card-meta">
              {card.meta.map((item) => (
                <div key={`${card.title}-${item.label}`}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {card.bullets?.length ? (
            <ul>
              {card.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function ArtifactTableCard(props: { table: DemoArtifactTable }) {
  return (
    <article className="artifact-table-card">
      <div className="artifact-table-head">
        <h4>{props.table.title}</h4>
      </div>
      <div className="artifact-table-wrap">
        <table className="artifact-table">
          <thead>
            <tr>
              {props.table.columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {props.table.rows.map((row) => (
              <tr key={row.join("|")}>
                {row.map((cell, index) => (
                  <td key={`${row[0]}-${props.table.columns[index]}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function CurrentEvidenceCard(props: {
  locale: AppLocale;
  copy: (typeof uiCopy)[AppLocale];
  selectedItem: TrialRequest | null;
  latestAuditItem: AuditEvent | null;
  evidenceCount: number;
}) {
  return (
    <aside className="current-evidence-card">
      <div className="current-evidence-head">
        <div>
          <div className="artifact-detail-eyebrow">{props.copy.currentEvidence}</div>
          <h4>{props.copy.liveRequestProof}</h4>
        </div>
        <span className="current-evidence-count">
          {formatCount(props.evidenceCount, props.locale)} {props.copy.events}
        </span>
      </div>

      <dl className="current-evidence-grid">
        <div>
          <dt>{props.copy.selectedRequest}</dt>
          <dd>
            {props.selectedItem ? formatRequestCode(props.selectedItem.id) : props.copy.noRequestSelected}
          </dd>
        </div>
        <div>
          <dt>{props.copy.currentStatus}</dt>
          <dd>
            {props.selectedItem
              ? formatStatusTitle(props.selectedItem.status, props.locale)
              : props.copy.noRequestSelected}
          </dd>
        </div>
        <div>
          <dt>{props.copy.owner}</dt>
          <dd>{props.selectedItem?.owner ?? props.copy.unassigned}</dd>
        </div>
      </dl>

      {props.latestAuditItem ? (
        <>
          <dl className="current-evidence-grid">
            <div>
              <dt>{props.copy.latestTransition}</dt>
              <dd>
                {formatStatusTitle(props.latestAuditItem.fromStatus, props.locale)} →{" "}
                {formatStatusTitle(props.latestAuditItem.toStatus, props.locale)}
              </dd>
            </div>
            <div>
              <dt>{props.copy.latestActor}</dt>
              <dd>{props.latestAuditItem.actor}</dd>
            </div>
            <div>
              <dt>{props.copy.latestTime}</dt>
              <dd>{formatAuditTime(props.latestAuditItem.createdAt, props.locale)}</dd>
            </div>
          </dl>

          <div className="current-evidence-reason">
            <span>{props.copy.latestReason}</span>
            <p>{props.latestAuditItem.reason ?? props.copy.noReasonRecorded}</p>
          </div>
        </>
      ) : (
        <div className="current-evidence-empty">
          {props.copy.evidenceWillAppear}
        </div>
      )}
    </aside>
  );
}

function SearchIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="19" cy="12" r="1.4" />
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <circle cx="12" cy="16" r="0.6" fill="currentColor" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M6 6 18 18" />
      <path d="M18 6 6 18" />
    </svg>
  );
}
