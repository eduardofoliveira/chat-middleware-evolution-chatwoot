import type { FastifyInstance } from "fastify";

import evolutionController from "../controllers/evolutionController.js";

export default async function evolutionRoutes(fastify: FastifyInstance) {
  fastify.post("/evolution/webhook/:account_id/:inbox_id", evolutionController.handleEvolutionWebhook);
}