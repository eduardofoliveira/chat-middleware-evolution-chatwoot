import crypto from "crypto";
import fs from "fs";
import fetch from "node-fetch";

type MediaType = "image" | "video" | "audio" | "document";

const getMediaKeys = (mediaKeyBase64: string, mediaType: MediaType) => {
	const mediaKey = Buffer.from(mediaKeyBase64, "base64");

	const infoStrMap: Record<MediaType, string> = {
		image: "WhatsApp Image Keys",
		video: "WhatsApp Video Keys",
		audio: "WhatsApp Audio Keys",
		document: "WhatsApp Document Keys",
	};
	const infoStr = infoStrMap[mediaType];

	// HKDF derivando 112 bytes
	const expanded = crypto.hkdfSync(
		"sha256",
		mediaKey,
		Buffer.alloc(32), // salt vazio
		Buffer.from(infoStr), // info string
		112,
	);

	return {
		iv: expanded.slice(0, 16),
		cipherKey: expanded.slice(16, 48),
		macKey: expanded.slice(48, 80),
	};
};

/**
 * Descarrega e descriptografa mídia do WhatsApp
 * @param {object} mediaObj - Objeto com url, mediaKey, mimetype etc.
 * @param {string} outputPath - Caminho de destino no disco (ex: "./saida.jpg")
 */
export async function salvarMidia(
	mediaObj: { url: string; mediaKey: string; mimetype: string },
	outputPath: string,
) {
	// 1. Detectar tipo de mídia pelo mimetype
	let mediaType: MediaType = "document";
	if (mediaObj.mimetype.startsWith("image/")) mediaType = "image";
	else if (mediaObj.mimetype.startsWith("video/")) mediaType = "video";
	else if (mediaObj.mimetype.startsWith("audio/")) mediaType = "audio";

	console.log(`⬇️ Baixando mídia do WhatsApp (${mediaType})...`);
	console.log(`URL: ${mediaObj.url}`);

	// 2. Baixar o arquivo criptografado
	const response = await fetch(mediaObj.url);
	if (!response.ok)
		throw new Error(`Erro ao baixar mídia: ${response.statusText}`);
	const encFile = Buffer.from(await response.arrayBuffer());

	console.log({
		mediaKey: mediaObj.mediaKey,
		mediaType,
	});

	// 3. Gerar chaves
	const keys = getMediaKeys(mediaObj.mediaKey, mediaType);

	// 4. Remover os últimos 10 bytes (HMAC)
	const fileData = encFile.slice(0, encFile.length - 10);

	// 5. Descriptografar
	const decipher = crypto.createDecipheriv(
		"aes-256-cbc",
		Buffer.from(keys.cipherKey),
		Buffer.from(keys.iv),
	);
	const decrypted = Buffer.concat([
		decipher.update(fileData),
		decipher.final(),
	]);

	console.log({
		outputPath,
		decrypted,
	});

	// 6. Salvar no disco
	fs.writeFileSync(outputPath, decrypted);
	console.log(`✅ Mídia descriptografada salva em: ${outputPath}`);
}

export default {
	salvarMidia,
};

// const testar = async () => {
//   const media = {
//     "url": "https://mmg.whatsapp.net/v/t62.7118-24/546068838_1484667409333282_2235158355488426328_n.enc?ccb=11-4&oh=01_Q5Aa2gG863ze3XzUsAlLVfIkqUSodSKadssx1MLAcMl5MNFrxg&oe=68EA526A&_nc_sid=5e03e0&mms3=true",
//     "mimetype": "image/jpeg",
//     "fileSha256": "nkn7x1amVV9hmfYrzXu6uKF/Tc9sH5WPuAcIsWmNQQk=",
//     "fileLength": "109686",
//     "height": 1600,
//     "width": 740,
//     "mediaKey": "PkhAqTmTz9qVD5b5AKymagbiEMyytippSEQEMNvSsQw=",
//     "fileEncSha256": "uk5cwKqkIraxeXCz/zdHfPvx7Yv9nDAvQ2mZm2Dmahs=",
//     "directPath": "/v/t62.7118-24/546068838_1484667409333282_2235158355488426328_n.enc?ccb=11-4&oh=01_Q5Aa2gG863ze3XzUsAlLVfIkqUSodSKadssx1MLAcMl5MNFrxg&oe=68EA526A&_nc_sid=5e03e0",
//     "mediaKeyTimestamp": "1757592994",
//     "jpegThumbnail": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABsSFBcUERsXFhceHBsgKEIrKCUlKFE6PTBCYFVlZF9VXVtqeJmBanGQc1tdhbWGkJ6jq62rZ4C8ybqmx5moq6T/2wBDARweHigjKE4rK06kbl1upKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKT/wgARCABIAEgDASIAAhEBAxEB/8QAGgAAAwEBAQEAAAAAAAAAAAAAAAIDAQQFBv/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/9oADAMBAAIQAxAAAAD6HBLKGYrTcI3jU0QLY+Qs7RGF0fdBBwnz34ympY2/Pp0otAADF8pfX3yOtOw3AJROsQDgAZwO5QFAHAP/xAAUEQEAAAAAAAAAAAAAAAAAAABA/9oACAECAQE/AE//xAAVEQEBAAAAAAAAAAAAAAAAAAAwEf/aAAgBAwEBPwB4X//EAC4QAAEDAgQEBgAHAAAAAAAAAAEAAgMREgQhMUEQFFGRBSAiI1JhEzNCQ1Nxgf/aAAgBAQABPwDyyMqb25OCLrzGd68ap5ucG7boEAK8XW7qqqE2MtmuqLdlWiZ6QQXVz3VjUImDQaotaBU6K6Ct1zc/tVi+Te6ui+Q7qxpVjeifE1zaacSA4EEZFHCQH9CGFhFPRojhYTqxAUFBoOM7rWVoT/SMwGVJOy5gAjKTsmztDq+4f8QxjSCbH9kx17Q4AivXg6tck3RYo2wk3Fv2EZAR+e/soSZH2iZ1fsLlZKEGY5puFlH75K5eX+cqGN0YNzy4niQDrmrW/EdkAAagDzzyCKJzzssJjnTTODpfSTQFFzmzn3y4jYLDY+GSQQ/iAydOM8xiaC1pdXoucfUey5RPMjA5zbT0U7Wvic19KEUzUXhsDbaAUHRSeEROdcyR7D9FYTwuHDTGUEuf1PBzA41KMbAM0I2HMIADIL///gADAP/Z",
//     "contextInfo": {
//       "statusSourceType": "IMAGE"
//     },
//     "firstScanSidecar": "d9pItheKEZmoWA==",
//     "firstScanLength": 9095,
//     "scansSidecar": "d9pItheKEZmoWASMOpY2AaKx6ch9CeAqmvLb5aDYoXCS44By5rnHtQ==",
//     "scanLengths": [
//       9095,
//       50236,
//       19864,
//       30489
//     ],
//     "midQualityFileSha256": "fPQewM9L01aEMU4lESIMrrRFKc77m81Nr8/xGsPsaBo=",
//     "imageSourceType": "USER_IMAGE"
//   }

//   await salvarMidia(media, "./saida.jpg");
// }

// testar()
