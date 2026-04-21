import type { FastifyInstance } from "fastify";

import { NotFoundError, ValidationError } from "./errors.js";
import {
  allowedStatuses,
  findTrialRequestById,
  getStatusCounts,
  readAuditLog,
  readTrialRequests,
  updateTrialRequestStatus
} from "./data-store.js";
import type { TrialRequestStatus } from "./types.js";

type StatusPatchBody = {
  status?: string;
  actor?: string;
  reason?: string;
};

type AuditLogQuery = {
  requestId?: string;
};

const isTrialRequestStatus = (
  value: string
): value is TrialRequestStatus => allowedStatuses.includes(value as TrialRequestStatus);

export const registerRoutes = (app: FastifyInstance): void => {
  app.get("/health", async () => ({
    status: "ok",
    service: "trialops-api",
    phase: "2",
    dataStore: "file-backed-json"
  }));

  app.get("/api/trial-requests", async () => {
    const items = await readTrialRequests();
    return {
      items,
      meta: {
        total: items.length,
        statusCounts: getStatusCounts(items)
      }
    };
  });

  app.get<{ Params: { id: string } }>(
    "/api/trial-requests/:id",
    async (request) => {
      const item = await findTrialRequestById(request.params.id);
      if (!item) {
        throw new NotFoundError();
      }

      return { item };
    }
  );

  app.patch<{ Params: { id: string }; Body: StatusPatchBody }>(
    "/api/trial-requests/:id/status",
    async (request) => {
      const body = request.body ?? {};

      if (typeof body.status !== "string" || !isTrialRequestStatus(body.status)) {
        throw new ValidationError(
          "Invalid status. Allowed statuses: new, qualified, approved, rejected",
          "invalid_status"
        );
      }

      if (typeof body.actor !== "string" || body.actor.trim().length === 0) {
        throw new ValidationError("Actor is required", "invalid_actor");
      }

      if (
        body.reason !== undefined &&
        (typeof body.reason !== "string" || body.reason.trim().length === 0)
      ) {
        throw new ValidationError(
          "Reason must be a non-empty string when provided",
          "invalid_reason"
        );
      }

      const result = await updateTrialRequestStatus({
        id: request.params.id,
        status: body.status,
        actor: body.actor.trim(),
        reason: body.reason?.trim()
      });

      if (!result) {
        throw new NotFoundError();
      }

      return result;
    }
  );

  app.get<{ Querystring: AuditLogQuery }>("/api/audit-log", async (request) => {
    const items = await readAuditLog();

    if (typeof request.query.requestId === "string" && request.query.requestId.length > 0) {
      return {
        items: items.filter((item) => item.requestId === request.query.requestId)
      };
    }

    return { items };
  });
};
