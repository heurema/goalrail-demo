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

const statusOptions: TrialRequestStatus[] = [
  "new",
  "qualified",
  "approved",
  "rejected"
];

const formatDate = (value: string): string =>
  new Date(value).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  });

const formatStatusLabel = (value: TrialRequestStatus): string =>
  value.replace("_", " ");

const formatSegment = (value: TrialRequest["segment"]): string =>
  value.replace("_", "-");

export default function App() {
  const [listData, setListData] = useState<TrialRequestsResponse | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<TrialRequest | null>(null);
  const [auditItems, setAuditItems] = useState<AuditEvent[]>([]);
  const [nextStatus, setNextStatus] = useState<TrialRequestStatus>("new");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);

  const refreshListAndAudit = async (targetId?: string | null) => {
    const [trialRequests, auditLog] = await Promise.all([
      fetchTrialRequests(),
      fetchAuditLog()
    ]);

    setListData(trialRequests);
    setAuditItems(auditLog.items);

    const preferredId = targetId ?? selectedId ?? trialRequests.items[0]?.id ?? null;
    const existingId = trialRequests.items.find((item) => item.id === preferredId)?.id
      ?? trialRequests.items[0]?.id
      ?? null;

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
    if (!selectedId) {
      setSelectedItem(null);
      return;
    }

    const loadDetail = async () => {
      try {
        setDetailLoading(true);
        const detail = await fetchTrialRequest(selectedId);
        setSelectedItem(detail.item);
        setNextStatus(detail.item.status);
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

  const recentAuditItems = useMemo(
    () =>
      [...auditItems].sort((left, right) =>
        right.createdAt.localeCompare(left.createdAt)
      ),
    [auditItems]
  );

  const handleStatusUpdate = async () => {
    if (!selectedItem || nextStatus === selectedItem.status) {
      return;
    }

    try {
      setSubmitting(true);
      await updateTrialRequestStatus({
        id: selectedItem.id,
        status: nextStatus,
        reason
      });
      const refreshedId = await refreshListAndAudit(selectedItem.id);
      if (refreshedId) {
        const detail = await fetchTrialRequest(refreshedId);
        setSelectedItem(detail.item);
        setNextStatus(detail.item.status);
      }
      setReason("");
      setFeedback({
        kind: "success",
        message: `Updated ${selectedItem.id} to ${formatStatusLabel(nextStatus)}.`
      });
    } catch (error) {
      setFeedback({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Status update failed."
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="hero-card">
        <div>
          <p className="eyebrow">Goalrail demo sandbox</p>
          <h1>TrialOps</h1>
          <p className="subtitle">Demo sandbox for Goalrail live demos</p>
        </div>
        <span className="phase-badge">Baseline flow</span>
      </header>

      {feedback ? (
        <div className={`feedback feedback--${feedback.kind}`}>{feedback.message}</div>
      ) : null}

      <section className="counts-grid">
        <CountCard label="Total" value={listData?.meta.total ?? 0} />
        <CountCard label="New" value={listData?.meta.statusCounts.new ?? 0} status="new" />
        <CountCard
          label="Qualified"
          value={listData?.meta.statusCounts.qualified ?? 0}
          status="qualified"
        />
        <CountCard
          label="Approved"
          value={listData?.meta.statusCounts.approved ?? 0}
          status="approved"
        />
        <CountCard
          label="Rejected"
          value={listData?.meta.statusCounts.rejected ?? 0}
          status="rejected"
        />
      </section>

      <main className="main-grid">
        <section className="panel">
          <div className="panel-header">
            <h2>Trial requests</h2>
            <span>{listData?.meta.total ?? 0} items</span>
          </div>

          {loading ? <p className="panel-message">Loading requests…</p> : null}

          {!loading && listData ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Contact</th>
                    <th>Segment</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {listData.items.map((item) => (
                    <tr
                      key={item.id}
                      className={item.id === selectedId ? "is-selected" : ""}
                      onClick={() => setSelectedId(item.id)}
                    >
                      <td>
                        <strong>{item.companyName}</strong>
                      </td>
                      <td>{item.contactName}</td>
                      <td>{formatSegment(item.segment)}</td>
                      <td>{item.owner ?? "Unassigned"}</td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td>{formatDate(item.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>

        <section className="side-column">
          <section className="panel">
            <div className="panel-header">
              <h2>Request detail</h2>
              {selectedItem ? <span>{selectedItem.id}</span> : null}
            </div>

            {detailLoading ? <p className="panel-message">Loading detail…</p> : null}

            {!detailLoading && selectedItem ? (
              <div className="detail-stack">
                <div className="detail-grid">
                  <DetailRow label="Company" value={selectedItem.companyName} />
                  <DetailRow label="Contact" value={selectedItem.contactName} />
                  <DetailRow label="Email" value={selectedItem.email} />
                  <DetailRow label="Segment" value={formatSegment(selectedItem.segment)} />
                  <DetailRow label="Owner" value={selectedItem.owner ?? "Unassigned"} />
                  <DetailRow
                    label="Created"
                    value={formatDate(selectedItem.createdAt)}
                  />
                </div>

                <div>
                  <p className="field-label">Current status</p>
                  <StatusBadge status={selectedItem.status} />
                </div>

                <div>
                  <p className="field-label">Notes</p>
                  <ul className="notes-list">
                    {selectedItem.notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>

                <div className="status-form">
                  <div className="panel-header panel-header--compact">
                    <h3>Status update</h3>
                    <span>actor: demo.presenter</span>
                  </div>

                  <label>
                    <span className="field-label">Next status</span>
                    <select
                      value={nextStatus}
                      onChange={(event) =>
                        setNextStatus(event.target.value as TrialRequestStatus)
                      }
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {formatStatusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="field-label">Reason</span>
                    <textarea
                      rows={3}
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      placeholder="Optional reason for the status change"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleStatusUpdate}
                    disabled={submitting || nextStatus === selectedItem.status}
                  >
                    {submitting ? "Updating…" : "Update status"}
                  </button>
                </div>
              </div>
            ) : null}

            {!detailLoading && !selectedItem ? (
              <p className="panel-message">Select a request to inspect its detail.</p>
            ) : null}
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>Audit log</h2>
              <span>{recentAuditItems.length} events</span>
            </div>

            {recentAuditItems.length === 0 ? (
              <p className="panel-message">No audit events yet.</p>
            ) : (
              <div className="audit-list">
                {recentAuditItems.map((item) => (
                  <article className="audit-item" key={item.id}>
                    <div className="audit-item__header">
                      <strong>{item.requestId}</strong>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    <div className="audit-transition">
                      <StatusBadge status={item.fromStatus} />
                      <span className="arrow">→</span>
                      <StatusBadge status={item.toStatus} />
                    </div>
                    <p className="audit-meta">actor: {item.actor}</p>
                    <p className="audit-meta">
                      reason: {item.reason?.trim() || "No reason provided"}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

function CountCard(props: {
  label: string;
  value: number;
  status?: TrialRequestStatus;
}) {
  return (
    <article className="count-card">
      <p className="count-card__label">{props.label}</p>
      <p className="count-card__value">{props.value}</p>
      {props.status ? <StatusBadge status={props.status} /> : null}
    </article>
  );
}

function StatusBadge(props: { status: TrialRequestStatus }) {
  return (
    <span className={`status-badge status-badge--${props.status}`}>
      {formatStatusLabel(props.status)}
    </span>
  );
}

function DetailRow(props: { label: string; value: string }) {
  return (
    <div>
      <p className="field-label">{props.label}</p>
      <p className="field-value">{props.value}</p>
    </div>
  );
}
