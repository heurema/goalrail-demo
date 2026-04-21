import { useEffect, useMemo, useState } from "react";

import {
  fetchAuditLog,
  fetchTrialRequest,
  fetchTrialRequests,
  updateTrialRequestStatus
} from "./api.js";
import type {
  AuditEvent,
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

type TimelineEntry =
  | {
      id: string;
      tone: TimelineTone;
      kind: "status";
      actor: string;
      createdAt: string;
      fromStatus: TrialRequestStatus;
      toStatus: TrialRequestStatus;
      note?: string;
    }
  | {
      id: string;
      tone: TimelineTone;
      kind: "text";
      actor: string;
      createdAt: string;
      prefix?: string;
      emphasis?: string;
      suffix?: string;
      note?: string;
    };

type TrialPresentation = {
  planLabel: string;
  seats: number;
  mrr: number;
  region: string;
  source: string;
  requesterTitle: string;
  trialLength: string;
  defaultReason: string;
};

const statusOptions: TrialRequestStatus[] = [
  "new",
  "qualified",
  "approved",
  "rejected"
];

const statusFilterOptions: StatusFilter[] = [
  "all",
  "new",
  "qualified",
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
  approved: { delta: "+6.8%", window: "7d", tone: "up" },
  rejected: { delta: "−1.4%", window: "7d", tone: "down" }
};

const statusClassNames: Record<TrialRequestStatus, string> = {
  new: "s-new",
  qualified: "s-qual",
  approved: "s-approved",
  rejected: "s-rejected"
};

const metricLabels: Array<{ key: "total" | TrialRequestStatus; label: string }> = [
  { key: "total", label: "Total" },
  { key: "new", label: "New" },
  { key: "qualified", label: "Qualified" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" }
];

const formatStatusLabel = (value: TrialRequestStatus): string =>
  value.replace("_", " ");

const formatStatusTitle = (value: TrialRequestStatus): string =>
  value[0].toUpperCase() + value.slice(1).replace("_", " ");

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

const formatAuditTime = (value: string): string =>
  new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit"
  });

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
      trialLength: "14 days",
      defaultReason:
        item.status === "approved"
          ? "Approved in the current baseline flow. No second reviewer was required."
          : item.status === "rejected"
            ? "Outside the current pilot scope at this stage."
            : item.status === "qualified"
              ? "Strong ICP fit. Verified domain and core onboarding requirements."
              : "Initial intake complete. Waiting on qualification."
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
      trialLength: "30 days",
      defaultReason:
        item.status === "approved"
          ? "Approved directly per the current baseline policy for enterprise onboarding."
          : item.status === "rejected"
            ? "High-touch scope but no active pilot sponsor yet."
            : item.status === "qualified"
              ? "Strong ICP fit. Enterprise onboarding requirements are already understood."
              : "Initial intake captured. Awaiting qualification review."
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
    trialLength: "30 days",
    defaultReason:
      item.status === "approved"
        ? "Approved in the current baseline flow. Provisioning can happen immediately."
        : item.status === "rejected"
          ? "Not enough urgency for a pilot this month."
          : item.status === "qualified"
            ? "Strong ICP fit. Verified domain and baseline requirements. Approving directly per current policy."
            : "Initial intake complete. Waiting on qualification."
  };
};

const getPrimaryActionLabel = (value: TrialRequestStatus): string => {
  switch (value) {
    case "approved":
      return "Approve trial";
    case "rejected":
      return "Save rejection";
    case "qualified":
      return "Mark as qualified";
    case "new":
      return "Return to new";
    default:
      return "Apply decision";
  }
};

const getStatusTone = (value: TrialRequestStatus): TimelineTone => {
  switch (value) {
    case "approved":
      return "ok";
    case "rejected":
      return "warn";
    case "qualified":
      return "accent";
    default:
      return "default";
  }
};

const getTopNavCounts = (meta: TrialRequestsResponse["meta"] | null) => ({
  inbox: meta?.statusCounts.new ?? 0,
  trialRequests: meta?.total ?? 0,
  provisioning: meta?.statusCounts.qualified ?? 0
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
    items[0]?.id ??
    null
  );
};

const getSuggestedNextStatus = (status: TrialRequestStatus): TrialRequestStatus => {
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
  auditItems: AuditEvent[]
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
      note:
        item.status === "approved"
          ? "Approved directly in the baseline flow."
          : undefined
    });
  }

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

  if (item.owner) {
    entries.push({
      id: `${item.id}-owner`,
      tone: "default",
      kind: "text",
      actor: item.owner,
      createdAt: addMinutes(item.createdAt, 21),
      prefix: "Assigned to ",
      emphasis: item.owner
    });
  }

  return entries.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
};

export default function App() {
  const [listData, setListData] = useState<TrialRequestsResponse | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<TrialRequest | null>(null);
  const [auditItems, setAuditItems] = useState<AuditEvent[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [nextStatus, setNextStatus] = useState<TrialRequestStatus>("new");
  const [trialLength, setTrialLength] = useState("30 days");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const refreshListAndAudit = async (targetId?: string | null) => {
    const [trialRequests, auditLog] = await Promise.all([
      fetchTrialRequests(),
      fetchAuditLog()
    ]);

    setListData(trialRequests);
    setAuditItems(auditLog.items);

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
        await refreshListAndAudit();
      } catch (error) {
        setFeedback({
          kind: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load baseline data."
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

    const timer = window.setTimeout(() => setFeedback(null), 3200);
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
        const presentation = getTrialPresentation(detail.item);
        setSelectedItem(detail.item);
        setNextStatus(getSuggestedNextStatus(detail.item.status));
        setTrialLength(presentation.trialLength);
        setReason(presentation.defaultReason);
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
    () => (selectedItem ? buildTimeline(selectedItem, selectedAuditItems) : []),
    [selectedItem, selectedAuditItems]
  );

  const handlePlaceholderAction = (label: string) => {
    setFeedback({
      kind: "info",
      message: `${label} is not implemented in the baseline demo.`
    });
  };

  const handleStatusUpdate = async (targetStatus = nextStatus) => {
    if (!selectedItem || targetStatus === selectedItem.status) {
      return;
    }

    try {
      setSubmitting(true);
      await updateTrialRequestStatus({
        id: selectedItem.id,
        status: targetStatus,
        reason
      });

      const refreshedId = await refreshListAndAudit(selectedItem.id);
      if (refreshedId) {
        const detail = await fetchTrialRequest(refreshedId);
        const presentation = getTrialPresentation(detail.item);
        setSelectedItem(detail.item);
        setNextStatus(getSuggestedNextStatus(detail.item.status));
        setTrialLength(presentation.trialLength);
        setReason(presentation.defaultReason);
      }

      setFeedback({
        kind: "success",
        message: `${formatRequestCode(selectedItem.id)} updated to ${formatStatusTitle(targetStatus)}.`
      });
    } catch (error) {
      setFeedback({
        kind: "error",
        message: error instanceof Error ? error.message : "Status update failed."
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="app" data-screen-label="TrialOps Baseline Dashboard">
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
            <NavItem label="Webhooks" />
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

            <div className="top-actions">
              <div className="env-chip">
                <span className="pulse" aria-hidden="true" />
                production
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
            <h1>
              Trial requests
              <span className="flow-label">
                <span className="dot" aria-hidden="true" />
                Baseline flow · v0.14
              </span>
            </h1>
            <div className="hero-btns">
              <button type="button" className="btn ghost" onClick={() => handlePlaceholderAction("Export")}>
                Export
              </button>
              <button type="button" className="btn" onClick={() => handlePlaceholderAction("Filters")}>
                Filters
              </button>
              <button type="button" className="btn primary" onClick={() => handlePlaceholderAction("New request")}>
                New request
              </button>
            </div>
          </section>

          <section className="metrics" aria-label="Baseline metrics">
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
                <button type="button" className="btn ghost table-sort" onClick={() => handlePlaceholderAction("Sort")}> 
                  Sort · Age
                </button>
              </div>

              {loading ? (
                <div className="table-empty">Loading baseline requests…</div>
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
                                <span className={`status ${statusClassNames[item.status]}`}>
                                  <span className="d" aria-hidden="true" />
                                  {formatStatusTitle(item.status)}
                                </span>
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
                      Showing <b>{formatCount(filteredItems.length)}</b> of <b>{formatCount(listData?.meta.total ?? filteredItems.length)}</b>
                    </div>
                    <div className="pager">
                      <button type="button" aria-label="Previous page">‹</button>
                      <button type="button" className="on">1</button>
                      <button type="button">2</button>
                      <button type="button">3</button>
                      <button type="button">…</button>
                      <button type="button">13</button>
                      <button type="button" aria-label="Next page">›</button>
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
                          <span className="muted">· baseline ops queue</span>
                        </div>

                        <div className="l">Region</div>
                        <div className="v">{selectedPresentation.region}</div>

                        <div className="l">Source</div>
                        <div className="v">Inbound · {selectedPresentation.source}</div>
                      </div>
                    </div>

                    <div className="notes">
                      <div className="nh">Requester notes</div>
                      {selectedItem.notes.join(" ")}
                    </div>

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
                              setNextStatus(event.target.value as TrialRequestStatus)
                            }
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {getPrimaryActionLabel(status)}
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
                        <label htmlFor="internal-reason">Internal reason</label>
                        <textarea
                          id="internal-reason"
                          placeholder="Optional note…"
                          value={reason}
                          onChange={(event) => setReason(event.target.value)}
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
                          {submitting ? "Applying…" : getPrimaryActionLabel(nextStatus)}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="detail-empty">Select a trial request to inspect its detail.</div>
                )}
              </div>

              <div className="panel">
                <div className="panel-h">
                  <h3>Audit log</h3>
                  <span className="sub">
                    {selectedItem ? formatRequestCode(selectedItem.id) : "Baseline"}
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
                              Status <span className="tag">{formatStatusLabel(item.fromStatus)}</span> → {" "}
                              <span className="tag">{formatStatusLabel(item.toStatus)}</span>
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
