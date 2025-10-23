import axios from "axios";
import type { FastifyReply, FastifyRequest } from "fastify";
import FormData from "form-data";

import catalogo from "../catalogo.json" with { type: "json" };

type CatalogoType = {
	pageProps: {
		content: {
			content: {
				montadoras: any;
				veiculos: any;
				modelos: any;
				produtos: any;
			};
		};
	};
};

const typedCatalogo = catalogo as CatalogoType;

const montadoras = async (_: FastifyRequest, reply: FastifyReply) => {
	return reply.send(
		typedCatalogo.pageProps.content.content.montadoras.map((montadora: any) => {
			return {
				id: montadora._id,
				title: montadora.title,
			};
		}),
	);
};

const veiculos = async (request: FastifyRequest, reply: FastifyReply) => {
	const { montadora } = request.query as { montadora?: string };

	const idsVeiculos: string[] = [];

	const produtosMontadora = typedCatalogo.pageProps.content.content.produtos
		.filter((produto: any) => {
			if (produto.montadora.includes(montadora)) {
				console.log(produto);

				return produto;
			}
			return null;
		})
		.map((produto: any) => {
			return produto.veiculo;
		});

	produtosMontadora.flat().forEach((idVeiculo: string) => {
		if (!idsVeiculos.includes(idVeiculo)) {
			idsVeiculos.push(idVeiculo);
		}
	});

	const veiculosFiltrados = typedCatalogo.pageProps.content.content.veiculos
		.filter((veiculo: { _id: string; title: string }) => {
			// console.log(veiculo);

			if (idsVeiculos.includes(veiculo._id)) {
				return veiculo;
			}
			return null;
		})
		.map((veiculo: any) => {
			return {
				id: veiculo._id,
				title: veiculo.title,
			};
		});

	return reply.send(veiculosFiltrados);
};

const modelos = async (request: FastifyRequest, reply: FastifyReply) => {
	const { montadora, veiculo } = request.query as {
		montadora?: string;
		veiculo?: string;
	};

	const produtosMontadora = typedCatalogo.pageProps.content.content.produtos
		.filter((produto: any) => {
			if (
				produto.montadora.includes(montadora) &&
				produto.veiculo.includes(veiculo)
			) {
				console.log(produto);

				return produto;
			}
			return null;
		})
		.map((produto: any) => {
			return {
				id: produto._id,
				title: produto.title,
			};
		});

	return reply.send(produtosMontadora);
};

const produto = async (request: FastifyRequest, reply: FastifyReply) => {
	const { produto } = request.query as {
		produto?: string;
	};

	const produtoFiltrado = typedCatalogo.pageProps.content.content.produtos.find(
		(p: any) => p._id === produto,
	);

	if (!produtoFiltrado) {
		return reply.status(404).send({ message: "Produto não encontrado" });
	}

	return reply.send(produtoFiltrado);
};

const sendMessage = async (request: FastifyRequest, reply: FastifyReply) => {
	const body = request.body as {
		account_id: number;
		conversation_id: number;
		message: string;
	};

	if (
		[".jpg", ".jpeg", ".png", ".gif"].some((ext) => body.message.includes(ext))
	) {
		const res = await axios.get(body.message, { responseType: "stream" });

		const formData = new FormData();
		formData.append("message_type", "outgoing");
		formData.append("private", true);
		formData.append("attachments[]", res.data);

		// Enviar para o Chawooot
		const { data } = await axios.post(
			`https://chatwoot.cloudcom.com.br/api/v1/accounts/${body.account_id}/conversations/${body.conversation_id}/messages`,
			formData,
			{
				headers: {
					"Content-Type": "application/json",
					api_access_token: process.env.CHATWOOT_TOKEN,
					...formData.getHeaders(),
				},
			},
		);

		return reply.send(data);
	}

	const { data } = await axios.post(
		`https://chatwoot.cloudcom.com.br/api/v1/accounts/${body.account_id}/conversations/${body.conversation_id}/messages`,
		{
			content: body.message,
			message_type: "outgoing",
			private: true,
		},
		{
			headers: {
				"Content-Type": "application/json",
				api_access_token: process.env.CHATWOOT_TOKEN,
			},
		},
	);

	return reply.send(data);
};

export default { montadoras, veiculos, modelos, produto, sendMessage };
