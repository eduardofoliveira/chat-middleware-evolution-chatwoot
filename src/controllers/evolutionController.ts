import cripto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import axios from "axios";
import type { FastifyReply, FastifyRequest } from "fastify";
import FormData from "form-data";
import mime from "mime-types";

import createContact from "../use-cases/contact/createContact.js";
import findContactIdentifier from "../use-cases/contact/findContactIdentifier.js";
import findContactPhoneNumber from "../use-cases/contact/findContactPhoneNumber.js";
import findOpenByContact from "../use-cases/conversation/findOpenByContact.js";
import { salvarMidia } from "../util/evolution.js";

const CHATWOOT_URL = process.env.CHATWOOT_URL;
const API_TOKEN = process.env.CHATWOOT_TOKEN;

const EVOLUTION_URL = process.env.EVOLUTION_URL;
const EVOLUTION_API_TOKEN = process.env.EVOLUTION_API_TOKEN;

const albums: Record<string, any[]> = {};
const albumCount: Record<string, number> = {};
const albumCaptions: Record<string, string> = {};

const handleEvolutionWebhook = async (
	request: FastifyRequest,
	reply: FastifyReply,
) => {
	try {
		const { account_id, inbox_id } = request.params as {
			account_id: number;
			inbox_id: number;
		};

		const body = request.body as {
			instance: any;
			event?: string;
			data?: any;
		};
		const data = body?.data;

		if (!data) {
			return reply.code(200).send();
		}

		console.log(JSON.stringify(data, null, 2));

		// console.log({
		//   account_id,
		//   inbox_id,
		//   EVOLUTION_URL,
		//   EVOLUTION_API_TOKEN,
		//   CHATWOOT_URL,
		//   API_TOKEN,
		//   EVENT: body.event,
		//   instance: body.instance,
		//   identifier: data?.key?.remoteJid,
		//   messageType: data?.messageType,
		// })

		// console.log(JSON.stringify(body, null, 2));

		if (body.event !== "messages.upsert") {
			return reply.status(200).send({ status: "ignored", event: body.event });
		}

		// console.log({
		//   account_id,
		//   identifier: data?.key?.remoteJid,
		//   messageType: data?.messageType,
		//   event: body.event,
		//   instance: body.instance,
		// })

		const isGroup = data.key.remoteJid?.endsWith("@g.us");
		let conversation_id = null;
		let contact = await findContactIdentifier({
			identifier: data.key.remoteJid,
			account_id: Number(account_id),
		});
		if (!contact && !isGroup) {
			contact = await findContactPhoneNumber({
				phone_number: `+${/(.*)@/.exec(data.key.remoteJid)?.[1] || data.key.remoteJid}`,
				account_id: Number(account_id),
			});
			if (!contact) {
				console.log(`Criando contato para ${data.key.remoteJid}`);

				console.log({
					identifier: data.key.remoteJid,
					account_id: Number(account_id),
					name: data.pushName || "Sem Nome",
					phone_number: `+${/(.*)@/.exec(data.key.remoteJid)?.[1] || data.key.remoteJid}`,
					country_code: /(.*)@/.exec(data.key.remoteJid)?.[1]?.startsWith("55")
						? "Brazil"
						: "",
					custom_attributes: JSON.stringify({ source: "evolution" }),
					additional_attributes: JSON.stringify({
						city: "",
						country: /(.*)@/.exec(data.key.remoteJid)?.[1]?.startsWith("55")
							? "Brazil"
							: "",
						description: "",
						company_name: "",
						country_code: /(.*)@/
							.exec(data.key.remoteJid)?.[1]
							?.startsWith("55")
							? "BR"
							: "",
						social_profiles: {
							github: "",
							twitter: "",
							facebook: "",
							linkedin: "",
							instagram: "",
						},
					}),
				});

				await createContact({
					identifier: data.key.remoteJid,
					account_id: Number(account_id),
					name: data.pushName || "Sem Nome",
					phone_number: `+${/(.*)@/.exec(data.key.remoteJid)?.[1] || data.key.remoteJid}`,
					country_code: /(.*)@/.exec(data.key.remoteJid)?.[1]?.startsWith("55")
						? "Brazil"
						: "",
					custom_attributes: JSON.stringify({ source: "evolution" }),
					additional_attributes: JSON.stringify({
						city: "",
						country: /(.*)@/.exec(data.key.remoteJid)?.[1]?.startsWith("55")
							? "Brazil"
							: "",
						description: "",
						company_name: "",
						country_code: /(.*)@/
							.exec(data.key.remoteJid)?.[1]
							?.startsWith("55")
							? "BR"
							: "",
						social_profiles: {
							github: "",
							twitter: "",
							facebook: "",
							linkedin: "",
							instagram: "",
						},
					}),
				});

				contact = await findContactIdentifier({
					identifier: data.key.remoteJid,
					account_id: Number(account_id),
				});

				const profileData = await axios.post(
					`${EVOLUTION_URL}/chat/fetchProfile/${body.instance}`,
					{
						number: /(.*)@/.exec(data.key.remoteJid)?.[1],
					},
					{
						headers: {
							apikey: EVOLUTION_API_TOKEN,
						},
					},
				);

				// console.log(profileData.data.picture)
				if (profileData.data.picture) {
					// download file
					// console.log('Baixando foto do contato:', profileData.data.picture);
					const avatarBuffer = await axios
						.get<Buffer>(profileData.data.picture, {
							responseType: "arraybuffer",
						})
						.then((res) => res.data);

					// console.log('Foto do contato baixada, tamanho:', avatarBuffer.length);
					// save file into /files
					fs.writeFileSync(
						path.resolve("files", `${data.key.remoteJid}.jpg`),
						avatarBuffer,
					);
					// console.log('Foto do contato salva em:', path.resolve('files', `${data.key.remoteJid}.jpg`));

					const form = new FormData();
					form.append(
						"avatar",
						fs.createReadStream(
							path.resolve("files", `${data.key.remoteJid}.jpg`),
						),
					);

					// request.log.info(`✅ Foto do contato ${data.key.remoteJid} enviando para o Chatwoot`);

					await axios.put(
						`${CHATWOOT_URL}/api/v1/accounts/${account_id}/contacts/${contact?.id}`,
						form,
						{
							headers: {
								...form.getHeaders(),
								api_access_token: API_TOKEN,
							},
						},
					);

					// console.log(`Foto do contato ${data.key.remoteJid} enviada para o Chatwoot`);
					fs.unlink(
						path.resolve("files", `${data.key.remoteJid}.jpg`),
						(err) => {
							if (err) {
								console.error(
									`Erro ao deletar arquivo ${data.key.remoteJid}.jpg:`,
									err,
								);
							} else {
								// console.log(`Arquivo ${data.key.remoteJid}.jpg deletado com sucesso.`);
							}
						},
					);
				}
			}
		} else if (!contact && isGroup) {
			const groupInfo = await axios.get(
				`${EVOLUTION_URL}/group/findGroupInfos/${body.instance}`,
				{
					params: {
						groupJid: data.key.remoteJid,
					},
					headers: {
						apikey: EVOLUTION_API_TOKEN,
					},
				},
			);

			// console.log({
			//   groupInfo: groupInfo.data,
			//   pictureUrl: groupInfo.data.pictureUrl
			// })

			// criar contato do grupo
			await createContact({
				identifier: data.key.remoteJid,
				account_id: Number(account_id),
				name: `${groupInfo.data.subject} (Grupo)`,
				phone_number: "",
				custom_attributes: JSON.stringify({ source: "evolution" }),
				additional_attributes: JSON.stringify({
					city: "",
					country: /(.*)@/.exec(data.key.remoteJid)?.[1]?.startsWith("55")
						? "Brazil"
						: "",
					description: "",
					company_name: "",
					country_code: /(.*)@/.exec(data.key.remoteJid)?.[1]?.startsWith("55")
						? "BR"
						: "",
					social_profiles: {
						github: "",
						twitter: "",
						facebook: "",
						linkedin: "",
						instagram: "",
					},
				}),
			});

			contact = await findContactIdentifier({
				identifier: data.key.remoteJid,
				account_id: Number(account_id),
			});

			// upload da foto do grupo para o chatwoot
			if (groupInfo.data.pictureUrl) {
				// download file
				// console.log('Baixando foto do grupo:', groupInfo.data.pictureUrl);
				const avatarBuffer = await axios
					.get<Buffer>(groupInfo.data.pictureUrl, {
						responseType: "arraybuffer",
					})
					.then((res) => res.data);

				// console.log('Foto do grupo baixada, tamanho:', avatarBuffer.length);
				// save file into /files
				fs.writeFileSync(
					path.resolve("files", `${data.key.remoteJid}.jpg`),
					avatarBuffer,
				);
				// console.log('Foto do grupo salva em:', path.resolve('files', `${data.key.remoteJid}.jpg`));

				const form = new FormData();
				form.append(
					"avatar",
					fs.createReadStream(
						path.resolve("files", `${data.key.remoteJid}.jpg`),
					),
				);

				// request.log.info(`✅ Foto do grupo ${data.key.remoteJid} enviando para o Chatwoot`);

				await axios.put(
					`${CHATWOOT_URL}/api/v1/accounts/${account_id}/contacts/${contact?.id}`,
					form,
					{
						headers: {
							...form.getHeaders(),
							api_access_token: API_TOKEN,
						},
					},
				);

				// console.log(`Foto do grupo ${data.key.remoteJid} enviada para o Chatwoot`);
				fs.unlink(path.resolve("files", `${data.key.remoteJid}.jpg`), (err) => {
					if (err) {
						console.error(
							`Erro ao deletar arquivo ${data.key.remoteJid}.jpg:`,
							err,
						);
					} else {
						// console.log(`Arquivo ${data.key.remoteJid}.jpg deletado com sucesso.`);
					}
				});
			}
		} else {
			// console.log('Contato encontrado:', contact);
		}

		const conversation = await findOpenByContact({
			contact_id: contact.id,
			account_id: Number(account_id),
			inbox_id: Number(inbox_id),
		});
		if (!conversation) {
			const conversationCreated = await axios.post(
				`${CHATWOOT_URL}/api/v1/accounts/${account_id}/conversations`,
				{
					source_id: cripto.randomUUID(),
					inbox_id,
					contact_id: contact.id,
					status: "open",
				},
				{
					headers: {
						api_access_token: API_TOKEN,
					},
				},
			);

			if (conversationCreated?.data?.id) {
				conversation_id = conversationCreated.data.id;
			}
		} else {
			conversation_id = conversation.display_id;
		}

		// console.log('Nova mensagem:', JSON.stringify(data, null, 2));
		let header = "";
		if (isGroup) {
			header = `**${data.pushName} - +${/(.*)@/.exec(data.key.participant)?.[1]}:**\n`;
		}

		// Caso seja o início de um álbum
		if (data.messageType === "albumMessage") {
			const albumId = data.key.id;
			albums[albumId] = [];
			albumCount[albumId] = data.message.albumMessage?.expectedImageCount || 0;
			// request.log.info(`📂 Novo álbum iniciado: ${albumId}`);

			setTimeout(async () => {
				// console.log('Álbum completo:', albums[albumId]);
				// console.log('Caption:', albumCaptions[albumId]);
				// console.log('Enviar para Chatwoot');

				// como enviar as imagens para o Chatwoot
				const form = new FormData();
				if (albumCaptions[albumId])
					form.append("content", `${header}${albumCaptions[albumId]}`);
				if (albums[albumId]) {
					for (const filePath of albums[albumId]) {
						form.append("attachments[]", fs.createReadStream(filePath));
					}
				}
				form.append("message_type", "incoming");

				// request.log.info(`✅ Álbum ${albumId} enviando para Chatwoot`);

				await axios.post(
					`${CHATWOOT_URL}/api/v1/accounts/${account_id}/conversations/${conversation_id}/messages`,
					form,
					{
						headers: {
							...form.getHeaders(),
							api_access_token: API_TOKEN,
						},
					},
				);

				// request.log.info(`✅ Álbum ${albumId} enviado para Chatwoot`);

				if (albums[albumId]) {
					for (const filePath of albums[albumId]) {
						fs.unlink(filePath, (err) => {
							if (err) {
								console.error(`Erro ao deletar arquivo ${filePath}:`, err);
							} else {
								// console.log(`Arquivo ${filePath} deletado com sucesso.`);
							}
						});
					}
				}

				// limpar cache
				delete albums[albumId];
				delete albumCount[albumId];
				delete albumCaptions[albumId];
			}, 5000); // espera 5 segundos para garantir que todas as imagens sejam processadas

			return reply.code(200).send({ status: "album_started", albumId });
		}

		// // Caso seja uma imagem/vídeo que pertence a um álbum
		if (
			["imageMessage", "videoMessage"].includes(data.messageType) &&
			data.message?.messageContextInfo?.messageAssociation?.associationType ===
				"MEDIA_ALBUM"
		) {
			const parentId =
				data.message?.messageContextInfo?.messageAssociation?.parentMessageKey
					?.id;

			if (data.message?.imageMessage?.caption) {
				albumCaptions[parentId] = data.message.imageMessage.caption;
			}
			if (data.message?.videoMessage?.caption) {
				albumCaptions[parentId] = data.message.videoMessage.caption;
			}

			await salvarMidia(
				data.message.imageMessage || data.message.videoMessage,
				path.resolve(
					"files",
					`${data.key.id}.${mime.extension(data.message?.imageMessage?.mimetype || data.message?.videoMessage?.mimetype || "bin")}`,
				),
			);

			if (parentId && albums[parentId]) {
				albums[parentId].push(
					path.resolve(
						"files",
						`${data.key.id}.${mime.extension(data.message?.imageMessage?.mimetype || data.message?.videoMessage?.mimetype || "bin")}`,
					),
				);
			}

			return reply
				.code(200)
				.send({ status: "album_image_processed", parentId });
		}

		if (data.messageType === "conversation") {
			if (typeof data.message?.conversation === "string") {
				// mensagem de texto simples
				const content = data.message?.conversation;
				// console.log('Conteúdo da mensagem:', content);
				await axios.post(
					`${CHATWOOT_URL}/api/v1/accounts/${account_id}/conversations/${conversation_id}/messages`,
					{
						content: `${header}${content}`,
						message_type: "incoming",
						// metadata: {
						//   author: "Testando"
						// }
					},
					{
						headers: {
							api_access_token: API_TOKEN,
						},
					},
				);
			}
		}

		if (data.messageType === "imageMessage") {
			// mensagem de imagem
			await salvarMidia(
				data.message.imageMessage,
				path.resolve(
					"files",
					`${data.key.id}.${mime.extension(data.message.imageMessage.mimetype || "jpg")}`,
				),
			);
			const form = new FormData();
			form.append(
				"attachments[]",
				fs.createReadStream(
					path.resolve(
						"files",
						`${data.key.id}.${mime.extension(data.message.imageMessage.mimetype || "jpg")}`,
					),
				),
			);
			form.append("message_type", "incoming");

			if (isGroup) {
				form.append("content", header);
			}

			if (data.message.imageMessage.caption) {
				form.append("content", `${header}${data.message.imageMessage.caption}`);
			}

			// request.log.info(`✅ Imagem ${data.key.id} enviando para Chatwoot`);

			await axios.post(
				`${CHATWOOT_URL}/api/v1/accounts/${account_id}/conversations/${conversation_id}/messages`,
				form,
				{
					headers: {
						...form.getHeaders(),
						api_access_token: API_TOKEN,
					},
				},
			);

			fs.unlink(
				path.resolve(
					"files",
					`${data.key.id}.${mime.extension(data.message.imageMessage.mimetype || "jpg")}`,
				),
				(err) => {
					if (err) {
						console.error(
							`Erro ao deletar arquivo ${data.key.id}.${mime.extension(data.message.imageMessage.mimetype || "jpg")}:`,
							err,
						);
					} else {
						// console.log(`Arquivo ${data.key.id}.${mime.extension(data.message.imageMessage.mimetype || 'jpg')} deletado com sucesso.`);
					}
				},
			);

			// request.log.info(`✅ Imagem ${data.key.id} enviada para Chatwoot`);
		}

		if (data.messageType === "videoMessage") {
			// mensagem de vídeo
			await salvarMidia(
				data.message.videoMessage,
				path.resolve(
					"files",
					`${data.key.id}.${mime.extension(data.message.videoMessage.mimetype || "mp4")}`,
				),
			);
			const form = new FormData();
			form.append(
				"attachments[]",
				fs.createReadStream(
					path.resolve(
						"files",
						`${data.key.id}.${mime.extension(data.message.videoMessage.mimetype || "mp4")}`,
					),
				),
			);
			form.append("content", header);
			form.append("message_type", "incoming");

			if (isGroup) {
				form.append("content", header);
			}

			if (data.message.videoMessage.caption) {
				form.append("content", `${header}${data.message.videoMessage.caption}`);
			}

			// request.log.info(`✅ Vídeo ${data.key.id} enviando para Chatwoot`);

			await axios.post(
				`${CHATWOOT_URL}/api/v1/accounts/${account_id}/conversations/${conversation_id}/messages`,
				form,
				{
					headers: {
						...form.getHeaders(),
						api_access_token: API_TOKEN,
					},
				},
			);

			fs.unlink(
				path.resolve(
					"files",
					`${data.key.id}.${mime.extension(data.message.videoMessage.mimetype || "mp4")}`,
				),
				(err) => {
					if (err) {
						console.error(
							`Erro ao deletar arquivo ${data.key.id}.${mime.extension(data.message.videoMessage.mimetype || "mp4")}:`,
							err,
						);
					} else {
						// console.log(`Arquivo ${data.key.id}.${mime.extension(data.message.videoMessage.mimetype || 'mp4')} deletado com sucesso.`);
					}
				},
			);

			// request.log.info(`✅ Vídeo ${data.key.id} enviado para Chatwoot`);
		}

		if (data.messageType === "stickerMessage") {
			// mensagem de figurinha
			await salvarMidia(
				data.message.stickerMessage,
				path.resolve("files", `${data.key.id}.webp`),
			);
			const form = new FormData();
			form.append(
				"attachments[]",
				fs.createReadStream(path.resolve("files", `${data.key.id}.webp`)),
			);
			form.append("content", header);
			form.append("message_type", "incoming");

			if (isGroup) {
				form.append("content", header);
			}

			// request.log.info(`✅ Figurinha ${data.key.id} enviando para Chatwoot`);

			await axios.post(
				`${CHATWOOT_URL}/api/v1/accounts/${account_id}/conversations/${conversation_id}/messages`,
				form,
				{
					headers: {
						...form.getHeaders(),
						api_access_token: API_TOKEN,
					},
				},
			);

			// request.log.info(`✅ Figurinha ${data.key.id} enviada para Chatwoot`);

			fs.unlink(path.resolve("files", `${data.key.id}.webp`), (err) => {
				if (err) {
					console.error(`Erro ao deletar arquivo ${data.key.id}.webp:`, err);
				} else {
					// console.log(`Arquivo ${data.key.id}.webp deletado com sucesso.`);
				}
			});
		}

		if (data.messageType === "locationMessage") {
			// mensagem de localização
			const loc = data.message.locationMessage;
			const mapsLink = `https://www.google.com/maps/search/?api=1&query=${loc.degreesLatitude},${loc.degreesLongitude}`;
			const content = `${header}📍 Localização: ${loc.name || ""}\n${loc.address || ""}\n[Ver no Google Maps](${mapsLink})`;
			const imageBase64 = data.message.locationMessage.jpegThumbnail;

			if (imageBase64) {
				const imageBuffer = Buffer.from(imageBase64, "base64");
				const imagePath = path.resolve("files", `${data.key.id}.jpg`);
				fs.writeFileSync(imagePath, imageBuffer);
				const form = new FormData();
				form.append("attachments[]", fs.createReadStream(imagePath));
				form.append("content", content);
				form.append("message_type", "incoming");

				await axios.post(
					`${CHATWOOT_URL}/api/v1/accounts/${account_id}/conversations/${conversation_id}/messages`,
					form,
					{
						headers: {
							...form.getHeaders(),
							api_access_token: API_TOKEN,
						},
					},
				);

				fs.unlink(imagePath, (err) => {
					if (err) {
						console.error(`Erro ao deletar arquivo ${imagePath}:`, err);
					} else {
						// console.log(`Arquivo ${imagePath} deletado com sucesso.`);
					}
				});
			} else {
				await axios.post(
					`${CHATWOOT_URL}/api/v1/accounts/${account_id}/conversations/${conversation_id}/messages`,
					{
						content,
						message_type: "incoming",
					},
					{
						headers: {
							api_access_token: API_TOKEN,
						},
					},
				);
			}

			// request.log.info(`✅ Localização ${data.key.id} enviada para Chatwoot`);
		}

		if (data.messageType === "audioMessage") {
			console.log("audioMessage");
			console.log({
				audioMessage: data.message,
				path: path.resolve("files", `${data.key.id}.ogg`),
			});

			// mensagem de áudio
			await salvarMidia(
				data.message.audioMessage,
				path.resolve("files", `${data.key.id}.ogg`),
			);
			const form = new FormData();
			form.append(
				"attachments[]",
				fs.createReadStream(path.resolve("files", `${data.key.id}.ogg`)),
			);
			form.append("content", header);
			form.append("message_type", "incoming");

			if (isGroup) {
				form.append("content", header);
			}

			// request.log.info(`✅ Áudio ${data.key.id} enviando para Chatwoot`);

			await axios.post(
				`${CHATWOOT_URL}/api/v1/accounts/${account_id}/conversations/${conversation_id}/messages`,
				form,
				{
					headers: {
						...form.getHeaders(),
						api_access_token: API_TOKEN,
					},
				},
			);

			// request.log.info(`✅ Áudio ${data.key.id} enviado para Chatwoot`);
		}

		if (data.messageType === "contactMessage") {
			// mensagem de contato
			const contacts = data.message.contactMessage?.vcard || "";

			const nome = /FN:(.*)/.exec(contacts)?.[1] || "Sem Nome";
			const telefone = /TEL;.*:(.*)/.exec(contacts)?.[1] || "Sem Telefone";

			const content = `${header}📇 Contato:\nNome: ${nome}\nTelefone: ${telefone}`;
			await axios.post(
				`${CHATWOOT_URL}/api/v1/accounts/${account_id}/conversations/${conversation_id}/messages`,
				{
					content,
					message_type: "incoming",
				},
				{
					headers: {
						api_access_token: API_TOKEN,
					},
				},
			);

			// request.log.info(`✅ Contato ${data.key.id} enviado para Chatwoot`);
		}

		if (data.messageType === "documentMessage") {
			// mensagem de documento
			await salvarMidia(
				data.message.documentMessage,
				path.resolve(
					"files",
					`${data.key.id}.${data.message.documentMessage.fileName?.split(".").pop() || "bin"}`,
				),
			);
			const caption = data.message.documentMessage.caption
				? `${data.message.documentMessage.caption}\n`
				: "";

			const form = new FormData();
			form.append(
				"attachments[]",
				fs.createReadStream(
					path.resolve(
						"files",
						`${data.key.id}.${data.message.documentMessage.fileName?.split(".").pop() || "bin"}`,
					),
				),
			);
			form.append(
				"content",
				`${header}${caption}📎 Documento: ${data.message.documentMessage.fileName}`,
			);
			form.append("message_type", "incoming");

			await axios.post(
				`${CHATWOOT_URL}/api/v1/accounts/${account_id}/conversations/${conversation_id}/messages`,
				form,
				{
					headers: {
						...form.getHeaders(),
						api_access_token: API_TOKEN,
					},
				},
			);

			// request.log.info(`✅ Documento ${data.key.id} enviado para Chatwoot`);
		}

		reply.code(200).send({ status: "ok" });
	} catch (error: any) {
		console.error(error);

		// request.log.error("Erro ao processar webhook", error);
		reply.code(500).send({ status: "error", message: "Erro interno" });
	}
};

export default { handleEvolutionWebhook };
