import Fastify from "fastify";
import type { FastifyInstance } from "fastify";

import { ApiError } from "./errors.js";
import { registerRoutes } from "./routes.js";

export const buildServer = (): FastifyInstance => {
  const app = Fastify({
    logger: false
  });

  registerRoutes(app);

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ApiError) {
      reply.status(error.statusCode).send({
        error: error.code,
        message: error.message
      });
      return;
    }

    app.log.error(error);
    reply.status(500).send({
      error: "internal_error",
      message: "Unexpected server error"
    });
  });

  return app;
};
