import "dotenv/config";

import catalogo from "./catalogo.json";

// Toyota
const ID_MONTADORA = "6271207aa163f2a67d76c43f";
const ID_VEICULO = "627120eca163f2a67d76c6c2";
const ID_MODELO = "627129289f48001d6c2dc390";

const veiculos: string[] = [];
const modelos: string[] = [];

catalogo.pageProps.content.content.montadoras.map((montadora: any) => {
	if (montadora._id === ID_MONTADORA) {
		console.log("--- Montadora ---");
		console.log(montadora._id);
		// console.log(montadora.uid);
		console.log(montadora.title);
		// console.log(montadora.slug);
		console.log("");
	}
});

// catalogo.pageProps.content.content.linhas.map((linha: any) => {
// 	console.log("--- Linha ---");
// 	console.log(linha);
// 	console.log(linha._id);
// 	// console.log(montadora.uid);
// 	console.log(linha.title);
// 	// console.log(montadora.slug);
// 	console.log("");
// });

catalogo.pageProps.content.content.produtos.map((produto: any) => {
	// console.log(produto);

	if (produto.montadora.includes("6271207aa163f2a67d76c43f")) {
		// console.log("--- Produto ---");
		// console.log(produto.title);
		// console.log(produto);

		produto.veiculo.map((id_veiculo: string) => {
			veiculos.includes(id_veiculo) ? null : veiculos.push(id_veiculo);
			return id_veiculo;
		});

		if (produto.veiculo.includes(ID_VEICULO)) {
			produto.modelo.map((modelo: string) => {
				modelos.includes(modelo) ? null : modelos.push(modelo);
				return modelo;
			});
		}

		// if (produto.veiculo.includes(ID_VEICULO)) {
		// 	modelos.includes(produto.modelo) ? null : modelos.push(produto.modelo);
		// }
	}
});

catalogo.pageProps.content.content.veiculos.map((veiculo: any) => {
	if (veiculos.includes(veiculo._id) && veiculo._id === ID_VEICULO) {
		console.log("--- Veículo ---");
		// console.log(veiculo);
		console.log(veiculo._id);
		console.log(veiculo.title);
		// console.log(veiculo.slug);
		console.log("");
	}
});

catalogo.pageProps.content.content.modelos.map((modelo: any) => {
	if (modelos.includes(modelo._id) && modelo._id === ID_MODELO) {
		console.log("--- Modelo ---");
		// console.log(modelo);
		console.log(modelo._id);
		console.log(modelo.title);
		console.log("");
		// console.log(modelo);ID_MODELO
	}
});

catalogo.pageProps.content.content.produtos.map((produto: any) => {
	if (
		produto.montadora.includes(ID_MONTADORA) &&
		produto.veiculo.includes(ID_VEICULO) &&
		produto.modelo.includes(ID_MODELO)
	) {
		// console.log(produto);

		produto.gallery.map((foto: any) => {
			console.log(foto.url);
		});

		console.log("");

		produto.info.map((info: any) => {
			Object.keys(info)
				.sort()
				.map((key: string) => {
					if (key === "item_0") {
						console.log(`Código Produto: ${info[key]}`);
					}
					if (key === "item_1") {
						console.log(`Aplicação: ${info[key]}`);
					}
					if (key === "item_2") {
						console.log(`Código Montadora: ${info[key]}`);
					}
					if (key === "item_3") {
						console.log(`Preço Bruto: ${info[key]}`);
					}
				});
		});

		console.log("");
		console.log("codigo_equivalencia");
		console.log("");
		produto.codigo_equivalencia.map((codigo: any) => {
			console.log(codigo.item);
		});
	}
});

console.log("");

// catalogo.pageProps.content.content.categories.map((categoria: any) => {
// 	console.log(categoria);
// });

// catalogo.pageProps.content.content.configs.map((config: any) => {
// 	console.log(config);
// });

// catalogo.pageProps.content.content.linhas.map((linha: any) => {
// 	console.log(linha);
// });

// catalogo.pageProps.content.content.clientes.map((cliente: any) => {
// 	console.log(cliente);
// });

// console.log(Object.keys(catalogo.pageProps.content.content));
