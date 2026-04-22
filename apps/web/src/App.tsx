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
import { demoArtifactSteps } from "./demoArtifacts.js";
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

const metricMeta: Record<
  "total" | TrialRequestStatus,
  { delta: string; window: string; tone: MetricTone }
> = {
  total: { delta: "+4.1%", window: "7d", tone: "up" },
  new: { delta: "+18%", window: "24h", tone: "up" },
  qualified: { delta: "+2.3%", window: "7d", tone: "flat" },
  manual_review: { delta: "review gate", window: "active", tone: "flat" },
  approved: { delta: "+6.8%", window: "7d", tone: "up" },
  rejected: { delta: "−1.4%", window: "7d", tone: "down" }
};

const statusClassNames: Record<TrialRequestStatus, string> = {
  new: "s-new",
  qualified: "s-qual",
  manual_review: "s-review",
  approved: "s-approved",
  rejected: "s-rejected"
};

const metricLabels: Array<{ key: "total" | TrialRequestStatus; label: string }> = [
  { key: "total", label: "Total" },
  { key: "new", label: "New" },
  { key: "qualified", label: "Qualified" },
  { key: "manual_review", label: "Manual review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" }
];

const formatStatusLabel = (value: TrialRequestStatus): string =>
  value.replace("_", " ");

const formatStatusTitle = (value: TrialRequestStatus): string =>
  value
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");

const formatRequestCode = (value: string): string => {
  const digits = value.replace(/\D/g, "").padStart(3, "0");
  return `TR-${digits}`;
};

const formatCount = (value: number): string =>
  new Intl.NumberFormat("en-US").format(value);

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);

const formatAuditTime = (value: string): string => {
  const timestamp = new Date(value);
  const timeLabel = timestamp.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit"
  });
  const now = new Date();
  const isToday =
    timestamp.getDate() === now.getDate() &&
    timestamp.getMonth() === now.getMonth() &&
    timestamp.getFullYear() === now.getFullYear();

  if (isToday) {
    return `Today · ${timeLabel}`;
  }

  const dateLabel = timestamp.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short"
  });

  return `${dateLabel} · ${timeLabel}`;
};

const formatAge = (value: string): string => {
  const createdAt = new Date(value).getTime();
  const diffMs = Math.max(0, Date.now() - createdAt);
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60_000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  return `${Math.floor(diffHours / 24)}d`;
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

const getSource = (item: TrialRequest): string => {
  const notes = item.notes.join(" ").toLowerCase();

  if (notes.includes("founder network")) {
    return "founder intro";
  }
  if (notes.includes("security questionnaire")) {
    return "security review";
  }
  if (notes.includes("proof artifacts")) {
    return "sales assisted";
  }
  if (notes.includes("live walkthrough")) {
    return "live demo";
  }
  if (notes.includes("deterministic reset")) {
    return "product-page CTA";
  }
  if (notes.includes("pilot window")) {
    return "pilot handoff";
  }

  return "website form";
};

const getTrialPresentation = (item: TrialRequest): TrialPresentation => {
  const seed = getSeed(item.id);

  if (item.segment === "smb") {
    const seats = 6 + (seed % 6) * 2;
    const planLabel = seats <= 12 ? "Starter" : "Team";
    return {
      planLabel,
      seats,
      mrr: seats * 45,
      region: "Europe · eu-central-1",
      source: getSource(item),
      requesterTitle: "Operations lead",
      trialLength: "14 days"
    };
  }

  if (item.segment === "enterprise") {
    const seats = 120 + (seed % 6) * 40;
    return {
      planLabel: "Enterprise",
      seats,
      mrr: seats * 70,
      region: "North America · us-east-1",
      source: getSource(item),
      requesterTitle: "VP Platform",
      trialLength: "30 days"
    };
  }

  const seats = 24 + (seed % 8) * 8;
  return {
    planLabel: seed % 2 === 0 ? "Business" : "Team",
    seats,
    mrr: seats * 60,
    region: "North America · us-east-2",
    source: getSource(item),
    requesterTitle: "Director of Operations",
    trialLength: "30 days"
  };
};

const getDefaultReasonForStatus = (
  item: TrialRequest,
  targetStatus: TrialRequestStatus,
  workflowMode: DemoWorkflowMode
): string => {
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
  workflowMode: DemoWorkflowMode
): string => {
  if (workflowMode === "goalrail") {
    if (currentStatus === "manual_review" && targetStatus === "approved") {
      return "Approve after review";
    }

    if (currentStatus === "manual_review" && targetStatus === "rejected") {
      return "Reject after review";
    }

    if (targetStatus === "manual_review") {
      return "Send to manual review";
    }

    if (targetStatus === "qualified") {
      return "Mark as qualified";
    }

    return "Apply Goalrail decision";
  }

  switch (targetStatus) {
    case "approved":
      return "Approve trial";
    case "rejected":
      return "Save rejection";
    case "qualified":
      return "Mark as qualified";
    case "manual_review":
      return "Manual review unavailable";
    case "new":
    default:
      return "Return to new";
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

const matchesSearch = (item: TrialRequest, query: string): boolean => {
  if (!query.trim()) {
    return true;
  }

  const presentation = getTrialPresentation(item);
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
    ...item.notes
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.trim().toLowerCase());
};

const buildTimeline = (
  item: TrialRequest,
  auditItems: AuditEvent[],
  workflowMode: DemoWorkflowMode
): TimelineEntry[] => {
  const presentation = getTrialPresentation(item);
  const entries: TimelineEntry[] = [
    {
      id: `${item.id}-received`,
      tone: "accent",
      kind: "text",
      actor: "system",
      createdAt: item.createdAt,
      emphasis: "Request received",
      suffix: ` from ${presentation.source}`
    },
    {
      id: `${item.id}-enrichment`,
      tone: "default",
      kind: "text",
      actor: "system",
      createdAt: addMinutes(item.createdAt, 6),
      prefix: "Enrichment complete"
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
            ? "Approved directly in the baseline flow."
            : "Approved after manual review in the Goalrail slice."
          : item.status === "manual_review"
            ? "Moved into manual review before approval."
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
      emphasis: "Policy notice",
      suffix: " · eligible for direct approval",
      note:
        "No second reviewer configured — a single operator can approve and provision this trial."
    });
  } else {
    entries.push({
      id: `${item.id}-goalrail-policy`,
      tone: "accent",
      kind: "text",
      actor: "policy.goalrail",
      createdAt: addMinutes(item.createdAt, 19),
      emphasis: "Goalrail slice active",
      suffix: " · approval requires manual review",
      note:
        "Review decisions must show a reviewer actor, assigned owner, and explicit decision reason."
    });
  }

  if (item.owner) {
    entries.push({
      id: `${item.id}-owner`,
      tone: "default",
      kind: "text",
      actor: item.owner,
      createdAt: addMinutes(item.createdAt, 21),
      prefix: "Assigned owner · ",
      emphasis: item.owner
    });
  }

  return entries.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
};

const isFinalStatus = (status: TrialRequestStatus): boolean =>
  status === "approved" || status === "rejected";

export default function App() {
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
  const [flowPanelOpen, setFlowPanelOpen] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

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
    const load = async () => {
      try {
        setLoading(true);
        await refreshRuntime();
      } catch (error) {
        setFeedback({
          kind: "error",
          message:
            error instanceof Error ? error.message : "Failed to load demo data."
        });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

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

      return matchesSearch(item, searchQuery);
    });
  }, [listData, searchQuery, statusFilter]);

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
              : "Failed to load request detail."
        });
      } finally {
        setDetailLoading(false);
      }
    };

    void loadDetail();
  }, [selectedId]);

  useEffect(() => {
    if (!selectedItem) {
      return;
    }

    const presentation = getTrialPresentation(selectedItem);
    const suggestedStatus = getSuggestedNextStatus(selectedItem.status, demoMode);
    setNextStatus(suggestedStatus);
    setTrialLength(presentation.trialLength);
    setActor("demo.presenter");
    setOwner(selectedItem.owner ?? "");
    setReason(getDefaultReasonForStatus(selectedItem, suggestedStatus, demoMode));
    setReasonDirty(false);
  }, [selectedItem, demoMode]);

  const navCounts = useMemo(() => getTopNavCounts(listData?.meta ?? null), [listData]);

  const selectedAuditItems = useMemo(() => {
    if (!selectedId) {
      return [];
    }

    return auditItems.filter((item) => item.requestId === selectedId);
  }, [auditItems, selectedId]);

  const selectedPresentation = useMemo(
    () => (selectedItem ? getTrialPresentation(selectedItem) : null),
    [selectedItem]
  );

  const timelineItems = useMemo(
    () => (selectedItem ? buildTimeline(selectedItem, selectedAuditItems, demoMode) : []),
    [selectedItem, selectedAuditItems, demoMode]
  );

  const handlePlaceholderAction = (label: string) => {
    setFeedback({
      kind: "info",
      message: `${label} is not implemented in the deterministic demo.`
    });
  };

  const syncReasonForTargetStatus = (targetStatus: TrialRequestStatus) => {
    if (!selectedItem) {
      return;
    }

    const currentDefault = getDefaultReasonForStatus(selectedItem, nextStatus, demoMode);
    setNextStatus(targetStatus);

    if (!reasonDirty || reason.trim() === currentDefault.trim()) {
      setReason(getDefaultReasonForStatus(selectedItem, targetStatus, demoMode));
      setReasonDirty(false);
    }
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
            ? "Baseline mode restored. Direct approval is visible again."
            : "Goalrail slice active. Approval now requires manual review."
      });
    } catch (error) {
      setFeedback({
        kind: "error",
        message: error instanceof Error ? error.message : "Demo mode update failed."
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
        demoMode
      );
      const submissionReason =
        targetStatus !== nextStatus &&
        (!reasonDirty || reason.trim() === currentDefaultReason.trim())
          ? getDefaultReasonForStatus(selectedItem, targetStatus, demoMode)
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
        message: `${formatRequestCode(selectedItem.id)} updated to ${formatStatusTitle(targetStatus)}.`
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Status update failed.";

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

  return (
    <>
      <div className="app" data-screen-label="TrialOps Workflow Change Demo">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true" />
            <div className="brand-name">TrialOps</div>
          </div>

          <nav className="nav" aria-label="Primary navigation">
            <NavItem label="Inbox" count={navCounts.inbox} />
            <NavItem label="Trial requests" count={navCounts.trialRequests} active />
            <NavItem label="Accounts" />
            <NavItem label="Provisioning" count={navCounts.provisioning} />
          </nav>

          <div className="nav-divider" />

          <nav className="nav" aria-label="Operations navigation">
            <NavItem label="Audit log" />
            <NavItem label="Policies" />
            <NavItem label="Proof pack" />
            <NavItem label="Reports" />
          </nav>

          <div className="nav-divider" />

          <nav className="nav" aria-label="Admin navigation">
            <NavItem label="Team" />
            <NavItem label="Settings" />
          </nav>

          <div className="sidebar-foot">
            <div className="avatar">MO</div>
            <div className="who">
              <b>M. Ortega</b>
              <span>Ops · Admin</span>
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
                placeholder="Search"
              />
              <span className="kbd-inline">⌘K</span>
            </label>

            <DemoModeToggle
              workflowMode={demoMode}
              disabled={modeUpdating}
              onChange={handleModeChange}
            />

            <div className="top-actions">
              <div className="env-chip">
                <span className="pulse" aria-hidden="true" />
                deterministic local demo
              </div>
              <button
                type="button"
                className="icon-btn"
                title="Notifications"
                onClick={() => handlePlaceholderAction("Notifications")}
              >
                <BellIcon />
              </button>
            </div>
          </div>

          <section className="hero">
            <div className="hero-copy">
              <h1>
                Trial requests
                <span className={`flow-label ${demoMode === "goalrail" ? "goalrail" : "baseline"}`}>
                  <span className="dot" aria-hidden="true" />
                  {demoMode === "baseline"
                    ? "Baseline flow · direct approval visible"
                    : "Goalrail workflow slice · review gate active"}
                </span>
              </h1>
              <p className="hero-subtitle">
                {demoMode === "baseline"
                  ? "Before-state: the sandbox still allows a single operator to approve a trial immediately."
                  : "After-state: approval must pass through manual review with reviewer, owner, and decision reason."}
              </p>
            </div>
            <div className="hero-btns">
              <button
                type="button"
                className="btn"
                onClick={() => setFlowPanelOpen(true)}
              >
                Goalrail flow
              </button>
              <button
                type="button"
                className="btn ghost"
                onClick={() => handlePlaceholderAction("Export")}
              >
                Export
              </button>
            </div>
          </section>

          {demoMode === "goalrail" ? (
            <section className="goalrail-banner" aria-label="Goalrail slice active">
              <div>
                <b>Goalrail slice active.</b> Approval is blocked until the request enters manual review and a reviewer records owner plus reason.
              </div>
            </section>
          ) : null}

          <section className="metrics" aria-label="Workflow metrics">
            {metricLabels.map(({ key, label }) => {
              const config = metricMeta[key];
              const value =
                key === "total"
                  ? listData?.meta.total ?? 0
                  : listData?.meta.statusCounts[key] ?? 0;

              return (
                <article className="metric" key={key}>
                  <div className="label">{label}</div>
                  <div className="value">{formatCount(value)}</div>
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
                <div className="seg" role="tablist" aria-label="Status filter">
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
                        {filter === "all" ? "All" : formatStatusTitle(filter)}
                        <span className="num">{formatCount(count)}</span>
                      </button>
                    );
                  })}
                </div>
                <span className="grow" />
                <button
                  type="button"
                  className="btn ghost table-sort"
                  onClick={() => handlePlaceholderAction("Sort")}
                >
                  Sort · Age
                </button>
              </div>

              {loading ? (
                <div className="table-empty">Loading demo requests…</div>
              ) : filteredItems.length === 0 ? (
                <div className="table-empty">No requests match the current filters.</div>
              ) : (
                <>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th style={{ width: "34%" }}>Company</th>
                          <th>Request</th>
                          <th>Plan</th>
                          <th>Seats</th>
                          <th>MRR</th>
                          <th>Status</th>
                          <th style={{ width: "56px" }}>Age</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredItems.map((item) => {
                          const presentation = getTrialPresentation(item);
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
                              <td className="num">{formatCount(presentation.seats)}</td>
                              <td className="money">{formatCurrency(presentation.mrr)}</td>
                              <td>
                                <StatusChip status={item.status} />
                              </td>
                              <td className="age">{formatAge(item.createdAt)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="table-foot">
                    <div>
                      Showing <b>{formatCount(filteredItems.length)}</b> of{" "}
                      <b>{formatCount(listData?.meta.total ?? filteredItems.length)}</b>
                    </div>
                    <div className="pager">
                      <button type="button" aria-label="Previous page">
                        ‹
                      </button>
                      <button type="button" className="on">
                        1
                      </button>
                      <button type="button">2</button>
                      <button type="button">3</button>
                      <button type="button">…</button>
                      <button type="button">13</button>
                      <button type="button" aria-label="Next page">
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
                  <div className="detail-empty">Loading request detail…</div>
                ) : selectedItem && selectedPresentation ? (
                  <>
                    <div className="detail-head">
                      <div className="co-logo">{getInitials(selectedItem.companyName)}</div>
                      <div className="detail-title">
                        <b>{selectedItem.companyName}</b>
                        <span>
                          {formatRequestCode(selectedItem.id)} · {formatAge(selectedItem.createdAt)} ago
                        </span>
                      </div>
                      <span className="grow" />
                      <StatusChip status={selectedItem.status} compact />
                      <button
                        type="button"
                        className="icon-btn"
                        title="More"
                        onClick={() => handlePlaceholderAction("More actions")}
                      >
                        <MoreIcon />
                      </button>
                    </div>

                    <div className="detail-body">
                      <div className="fieldset">
                        <div className="l">Requester</div>
                        <div className="v">
                          {selectedItem.contactName}
                          <span className="muted">· {selectedPresentation.requesterTitle}</span>
                        </div>

                        <div className="l">Email</div>
                        <div className="v mono">{selectedItem.email}</div>

                        <div className="l">Plan</div>
                        <div className="v">
                          {selectedPresentation.planLabel} · {formatCount(selectedPresentation.seats)} seats · {formatCurrency(selectedPresentation.mrr)}/mo
                        </div>

                        <div className="l">Owner</div>
                        <div className="v">
                          {selectedItem.owner ?? "Unassigned"}
                          <span className="muted">
                            · {demoMode === "baseline" ? "baseline ops queue" : "must be visible before review approval"}
                          </span>
                        </div>

                        <div className="l">Region</div>
                        <div className="v">{selectedPresentation.region}</div>

                        <div className="l">Source</div>
                        <div className="v">Inbound · {selectedPresentation.source}</div>

                        <div className="l">Mode</div>
                        <div className="v">
                          {demoMode === "baseline" ? "Baseline / before-state" : "Goalrail slice / review gate"}
                        </div>
                      </div>
                    </div>

                    <div className="notes">
                      <div className="nh">Requester notes</div>
                      {selectedItem.notes.join(" ")}
                    </div>

                    {demoMode === "baseline" ? (
                      <div className="form">
                        <div className="form-h">
                          <h4>Update status</h4>
                          <span className="hint">Written to audit log</span>
                        </div>

                        <div className="form-row">
                          <div className="field">
                            <label htmlFor="decision-select">Decision</label>
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
                                    demoMode
                                  )}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="field">
                            <label htmlFor="trial-length">Trial length</label>
                            <select
                              id="trial-length"
                              className="select"
                              value={trialLength}
                              onChange={(event) => setTrialLength(event.target.value)}
                            >
                              <option>30 days</option>
                              <option>14 days</option>
                              <option>60 days</option>
                            </select>
                          </div>
                        </div>

                        <div className="field">
                          <label htmlFor="baseline-reason">Internal reason</label>
                          <textarea
                            id="baseline-reason"
                            placeholder="Optional note…"
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
                            <b>Direct approval enabled.</b> Approve provisions the trial immediately — no second reviewer required.
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
                            Reject
                          </button>
                          <button
                            type="button"
                            className="btn approve"
                            onClick={() => void handleStatusUpdate()}
                            disabled={submitting || nextStatus === selectedItem.status}
                          >
                            {submitting
                              ? "Applying…"
                              : getPrimaryActionLabel(
                                  selectedItem.status,
                                  nextStatus,
                                  demoMode
                                )}
                          </button>
                        </div>
                      </div>
                    ) : selectedItem.status === "manual_review" ? (
                      <div className="form">
                        <div className="form-h">
                          <h4>Review decision</h4>
                          <span className="hint">Reviewer, owner, and reason are required</span>
                        </div>

                        <div className="form-row review-grid">
                          <div className="field">
                            <label htmlFor="reviewer-actor">Reviewer</label>
                            <input
                              id="reviewer-actor"
                              className="text-input"
                              value={actor}
                              onChange={(event) => setActor(event.target.value)}
                              placeholder="demo.presenter"
                            />
                          </div>
                          <div className="field">
                            <label htmlFor="review-owner">Assigned owner</label>
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
                          <label htmlFor="review-reason">Decision reason</label>
                          <textarea
                            id="review-reason"
                            placeholder="Explain why the request is ready for approval or why it should be rejected."
                            value={reason}
                            onChange={(event) => {
                              setReason(event.target.value);
                              setReasonDirty(true);
                            }}
                          />
                        </div>

                        <div className="goalrail-inline">
                          <div className="goalrail-inline-title">Manual review required</div>
                          <div className="goalrail-inline-copy">
                            The demo will reject approval until the reviewer actor, assigned owner, and decision reason are visible.
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
                            {submitting ? "Applying…" : "Reject after review"}
                          </button>
                          <button
                            type="button"
                            className="btn approve"
                            onClick={() => void handleStatusUpdate("approved")}
                            disabled={submitting}
                          >
                            {submitting ? "Applying…" : "Approve after review"}
                          </button>
                        </div>
                      </div>
                    ) : isFinalStatus(selectedItem.status) ? (
                      <div className="final-state-card">
                        <div className="final-state-head">
                          <b>Final status ready for proof</b>
                          <StatusChip status={selectedItem.status} compact />
                        </div>
                        <p>
                          The Goalrail slice is now in a final state. Show the audit log, then open the proof and readout samples for the pilot CTA.
                        </p>
                        <ul>
                          <li>Proof sample · demo/proof-packs/workflow-change/proof-sample.md</li>
                          <li>Readout sample · demo/proof-packs/workflow-change/readout-sample.md</li>
                        </ul>
                      </div>
                    ) : (
                      <div className="form">
                        <div className="form-h">
                          <h4>Goalrail review gate</h4>
                          <span className="hint">Approval is blocked until review is completed</span>
                        </div>

                        <div className="review-gate-card">
                          <div className="review-gate-title">Goalrail slice active</div>
                          <div className="review-gate-copy">
                            Direct approval is blocked in this mode. Move the request into <b>manual review</b> first, then complete the review decision with owner plus reason.
                          </div>
                        </div>

                        <div className="actions split-actions">
                          {selectedItem.status === "new" ? (
                            <button
                              type="button"
                              className="btn ghost"
                              onClick={() => void handleStatusUpdate("qualified")}
                              disabled={submitting}
                            >
                              {submitting ? "Applying…" : "Mark as qualified"}
                            </button>
                          ) : null}
                          <span className="grow" />
                          <button
                            type="button"
                            className="btn approve"
                            onClick={() => void handleStatusUpdate("manual_review")}
                            disabled={submitting}
                          >
                            {submitting ? "Applying…" : "Send to manual review"}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="detail-empty">Select a trial request to inspect its detail.</div>
                )}
              </div>

              <div className="panel">
                <div className="panel-h">
                  <h3>Audit log</h3>
                  <span className="sub">
                    {selectedItem ? formatRequestCode(selectedItem.id) : "Demo"}
                  </span>
                </div>

                <div className="audit">
                  {timelineItems.length === 0 ? (
                    <div className="audit-empty">No audit activity yet.</div>
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
                              Status <span className="tag">{formatStatusLabel(item.fromStatus!)}</span> →{" "}
                              <span className="tag">{formatStatusLabel(item.toStatus!)}</span>
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
                            <span>{formatAuditTime(item.createdAt)}</span>
                          </div>
                          {item.assignedOwner ? (
                            <div className="audit-meta">Assigned owner · {item.assignedOwner}</div>
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

      {flowPanelOpen ? (
        <FlowDrawer
          workflowMode={demoMode}
          selectedItem={selectedItem}
          onClose={() => setFlowPanelOpen(false)}
        />
      ) : null}

      {feedback ? (
        <div className={`feedback-toast ${feedback.kind}`}>{feedback.message}</div>
      ) : null}
    </>
  );
}

function NavItem(props: { label: string; count?: number; active?: boolean }) {
  return (
    <a className={props.active ? "active" : undefined} href="#">
      {props.label}
      {typeof props.count === "number" ? (
        <span className="count">{formatCount(props.count)}</span>
      ) : null}
    </a>
  );
}

function DemoModeToggle(props: {
  workflowMode: DemoWorkflowMode;
  disabled?: boolean;
  onChange: (mode: DemoWorkflowMode) => void;
}) {
  return (
    <div className="demo-mode-switcher" aria-label="Demo mode switcher">
      <div className="demo-mode-label">Demo mode</div>
      <div className="demo-mode-buttons">
        <button
          type="button"
          className={props.workflowMode === "baseline" ? "active" : undefined}
          onClick={() => props.onChange("baseline")}
          disabled={props.disabled}
        >
          <span className="mode-context">Before</span>
          Baseline
        </button>
        <button
          type="button"
          className={props.workflowMode === "goalrail" ? "active" : undefined}
          onClick={() => props.onChange("goalrail")}
          disabled={props.disabled}
        >
          <span className="mode-context">After</span>
          Goalrail slice
        </button>
      </div>
    </div>
  );
}

function StatusChip(props: { status: TrialRequestStatus; compact?: boolean }) {
  return (
    <span
      className={`status ${statusClassNames[props.status]}${props.compact ? " compact" : ""}`}
    >
      <span className="d" aria-hidden="true" />
      {formatStatusTitle(props.status)}
    </span>
  );
}

function FlowDrawer(props: {
  workflowMode: DemoWorkflowMode;
  selectedItem: TrialRequest | null;
  onClose: () => void;
}) {
  return (
    <div className="flow-overlay" role="dialog" aria-modal="true" aria-label="Goalrail flow overlay">
      <button
        type="button"
        className="flow-overlay-backdrop"
        aria-label="Close Goalrail flow overlay"
        onClick={props.onClose}
      />
      <aside className="flow-drawer">
        <div className="flow-drawer-head">
          <div>
            <div className="flow-drawer-eyebrow">Goalrail flow</div>
            <h2>Business request → proof</h2>
            <p>
              The sandbox stays deterministic, but the artifacts make the bounded delivery flow visible and inspectable.
            </p>
          </div>
          <button type="button" className="icon-btn" onClick={props.onClose} title="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="flow-drawer-summary">
          <div>
            <span className="summary-label">Current mode</span>
            <b>{props.workflowMode === "baseline" ? "Baseline / before-state" : "Goalrail slice / after-state"}</b>
          </div>
          <div>
            <span className="summary-label">Selected request</span>
            <b>
              {props.selectedItem
                ? `${formatRequestCode(props.selectedItem.id)} · ${formatStatusTitle(props.selectedItem.status)}`
                : "No request selected"}
            </b>
          </div>
        </div>

        <div className="flow-chain" aria-hidden="true">
          <span>Request</span>
          <span>Clarify</span>
          <span>Contract</span>
          <span>Tasks</span>
          <span>Proof</span>
          <span>Readout</span>
        </div>

        <div className="flow-step-list">
          {demoArtifactSteps.map((step, index) => (
            <article key={step.id} className="flow-step-card">
              <div className="flow-step-index">0{index + 1}</div>
              <div className="flow-step-body">
                <div className="flow-step-top">
                  <h3>{step.title}</h3>
                  <span className={`flow-step-status ${step.statusLabel}`}>{step.statusLabel}</span>
                </div>
                <p>{step.summary}</p>
                <div className="flow-step-path">
                  <span>Artifact path</span>
                  <code>{step.artifactPath}</code>
                </div>
              </div>
            </article>
          ))}
        </div>
      </aside>
    </div>
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
