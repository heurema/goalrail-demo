import { constants } from "node:fs";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { FastifyInstance, FastifyReply } from "fastify";

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
