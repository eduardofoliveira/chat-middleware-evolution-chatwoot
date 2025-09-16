import "dotenv/config";
import Fastify from "fastify";
// import axios from "axios"; 
// import path from "path";
// import mime from 'mime-types'
// import FormData from "form-data";
// import fs from "fs";

// const CHATWOOT_URL = "https://chatwoot.cloudcom.com.br";
// const ACCOUNT_ID = "1"; // troque pelo seu account_id
// const CONVERSATION_ID = "1952"; // troque pela conversa de destino
// const API_TOKEN = "n6zGScvNEKuZaYTMxEicoK76";

// import { salvarMidia } from "./util/evolution.js";

import evolutionRoutes from "./routes/evolutionRoutes.js";

const server = Fastify({
  logger: false,
});

// const albums: Record<string, any[]> = {};
// const albumCount: Record<string, number> = {};
// const albumCaptions: Record<string, string> = {};

server.register(evolutionRoutes);

const start = async () => {
  try {
    await server.listen({ port: Number(process.env.PORT) || 3001, host: "0.0.0.0" });
    console.log(`🚀 Servidor rodando em http://localhost:${process.env.PORT || 3001}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();