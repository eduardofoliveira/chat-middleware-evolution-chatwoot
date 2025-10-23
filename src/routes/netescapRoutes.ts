import type { FastifyInstance } from "fastify";

import netescapController from "../controllers/netescapController.js";

export default async function evolutionRoutes(fastify: FastifyInstance) {
	fastify.get("/netscape/montadoras", netescapController.montadoras);
	fastify.get("/netscape/veiculos", netescapController.veiculos);
	fastify.get("/netscape/modelos", netescapController.modelos);
	fastify.get("/netscape/produto", netescapController.produto);
	fastify.post("/netscape/send", netescapController.sendMessage);
}
