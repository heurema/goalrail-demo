import { constants } from "node:fs";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { FastifyInstance, FastifyReply } from "fastify";

import { NotFoundError, ValidationError } from "./errors.js";
import {
  allowedStatuses,
  allowedWorkflowModes,
  findTrialRequestById,
  getStatusCounts,
  readAuditLog,
  readDemoMode,
  readTrialRequests,
  updateDemoMode,
  updateTrialRequestStatus
} from "./data-store.js";
import type { DemoWorkflowMode, TrialRequest, TrialRequestStatus } from "./types.js";

const webDistRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "web",
  "dist"
);

const staticMimeTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

const tryReadStaticAsset = async (
  requestPath: string
): Promise<{ body: Buffer; contentType: string } | null> => {
  const normalizedPath = requestPath === "/" ? "/index.html" : requestPath;
  const relativePath = normalizedPath.replace(/^\/+/, "");
  const assetPath = path.resolve(webDistRoot, relativePath);

  if (!assetPath.startsWith(webDistRoot)) {
    return null;
  }

  try {
    await access(assetPath, constants.R_OK);
  } catch {
    return null;
  }

  const extension = path.extname(assetPath).toLowerCase();
  return {
    body: await readFile(assetPath),
    contentType: staticMimeTypes[extension] ?? "application/octet-stream"
  };
};

const sendWebIndex = async (reply: FastifyReply) => {
  const indexPath = path.join(webDistRoot, "index.html");
  const body = await readFile(indexPath);
  return reply.type("text/html; charset=utf-8").send(body);
};

type StatusPatchBody = {
  status?: string;
  actor?: string;
  owner?: string;
  reason?: string;
};

type DemoModePatchBody = {
  workflowMode?: string;
};

type AuditLogQuery = {
  requestId?: string;
};

const isTrialRequestStatus = (
  value: string
): value is TrialRequestStatus => allowedStatuses.includes(value as TrialRequestStatus);

const isDemoWorkflowMode = (
  value: string
): value is DemoWorkflowMode =>
  allowedWorkflowModes.includes(value as DemoWorkflowMode);

const normalizeOptionalText = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const goalrailTransitions: Record<TrialRequestStatus, TrialRequestStatus[]> = {
  new: ["qualified", "manual_review"],
  qualified: ["manual_review"],
  manual_review: ["approved", "rejected"],
  approved: [],
  rejected: []
};

const validateGoalrailTransition = (input: {
  current: TrialRequest;
  targetStatus: TrialRequestStatus;
  owner?: string;
  reason?: string;
}): void => {
  const { current, targetStatus, owner, reason } = input;

  if (
    (current.status === "new" || current.status === "qualified") &&
    targetStatus === "approved"
  ) {
    throw new ValidationError(
      "Approval requires manual review in Goalrail mode",
      "review_required"
    );
  }

  if (
    current.status === "manual_review" &&
    (targetStatus === "approved" || targetStatus === "rejected")
  ) {
    if (!owner) {
      throw new ValidationError(
        "Assigned owner is required for a review decision",
        "owner_required"
      );
    }

    if (!reason) {
      throw new ValidationError(
        "Decision reason is required for a review decision",
        "reason_required"
      );
    }

    return;
  }

  const allowedTargets = goalrailTransitions[current.status];
  if (!allowedTargets.includes(targetStatus)) {
    throw new ValidationError(
      `Transition from ${current.status} to ${targetStatus} is not allowed in Goalrail mode`,
      "invalid_transition"
    );
  }
};

export const registerRoutes = (app: FastifyInstance): void => {
  app.get("/health", async () => ({
    status: "ok",
    service: "trialops-api",
    phase: "5",
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

  app.get("/api/demo-mode", async () => readDemoMode());

  app.patch<{ Body: DemoModePatchBody }>("/api/demo-mode", async (request) => {
    const mode = request.body?.workflowMode;

    if (typeof mode !== "string" || !isDemoWorkflowMode(mode)) {
      throw new ValidationError(
        "Invalid workflow mode. Allowed modes: baseline, goalrail",
        "invalid_workflow_mode"
      );
    }

    return updateDemoMode(mode);
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
      const owner = normalizeOptionalText(body.owner);
      const reason = normalizeOptionalText(body.reason);

      if (typeof body.status !== "string" || !isTrialRequestStatus(body.status)) {
        throw new ValidationError(
          "Invalid status. Allowed statuses: new, qualified, manual_review, approved, rejected",
          "invalid_status"
        );
      }

      if (typeof body.actor !== "string" || body.actor.trim().length === 0) {
        throw new ValidationError("Actor is required", "invalid_actor");
      }

      if (
        body.reason !== undefined &&
        reason === undefined
      ) {
        throw new ValidationError(
          "Reason must be a non-empty string when provided",
          "invalid_reason"
        );
      }

      if (body.owner !== undefined && owner === undefined) {
        throw new ValidationError(
          "Assigned owner must be a non-empty string when provided",
          "invalid_owner"
        );
      }

      const current = await findTrialRequestById(request.params.id);
      if (!current) {
        throw new NotFoundError();
      }

      const workflowMode = (await readDemoMode()).workflowMode;

      if (workflowMode === "goalrail") {
        validateGoalrailTransition({
          current,
          targetStatus: body.status,
          owner,
          reason
        });
      }

      const result = await updateTrialRequestStatus({
        id: request.params.id,
        status: body.status,
        actor: body.actor.trim(),
        owner,
        reason
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

  app.get("/", async (_request, reply) => sendWebIndex(reply));

  app.get<{ Params: { "*": string } }>("/assets/*", async (request, reply) => {
    const asset = await tryReadStaticAsset(`/assets/${request.params["*"]}`);

    if (!asset) {
      throw new NotFoundError("Asset not found");
    }

    return reply.type(asset.contentType).send(asset.body);
  });

  app.get("/*", async (request, reply) => {
    const requestPath = request.url.split("?")[0];
    const asset = await tryReadStaticAsset(requestPath);

    if (asset) {
      return reply.type(asset.contentType).send(asset.body);
    }

    return sendWebIndex(reply);
  });
};
