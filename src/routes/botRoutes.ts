import type { FastifyInstance } from "fastify";

import botController from "../controllers/botController.js";

export default async function evolutionRoutes(fastify: FastifyInstance) {
	fastify.post("/bot/flow/:account_id/:bot_name", botController.index);
	fastify.post("/bot/webhook/jira", botController.index);
}
