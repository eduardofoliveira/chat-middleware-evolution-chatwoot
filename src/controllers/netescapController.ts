import type { FastifyReply, FastifyRequest } from "fastify";

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

export default { montadoras, veiculos, modelos, produto };
