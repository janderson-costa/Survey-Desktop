import { SrvConfig, SrvTable, SrvTableRow, SrvInfo } from '../models/SrvConfig.js';
import Toast from '../lib/Toast/Toast.js';

export default function srvService() {
	return {
		newFile,
		openFile,
		getSheets,
		saveFile,
	};

	async function newFile() {
		let result = await shared.actions.showOpenDialog({
			title: 'Novo',
			filters: [{ name: 'Excel', extensions: ['xlsx', 'xls'] }],
			properties: ['openFile'],
		});

		if (result.canceled)
			return;

		const toast = Toast({ message: 'Não foi possível criar o template.' });

		// Limpa a pasta temp
		await shared.actions.clearFolder({ folderPath: './temp' });

		let filePath = result.filePaths[0];
		let ext = filePath.substring(filePath.lastIndexOf('.'));
		let tempFileName = 'temp' + ext;

		await shared.appData({ key: 'tempFileName', value: tempFileName });

		// Copia p arquivo da planilha para pasta temp
		result = await shared.actions.copyFile({
			fromFilePath: filePath,
			toFilePath: './temp/' + tempFileName,
		});

		if (result.error) {
			toast.show();
			return;
		}

		// Abre temp.xls(x) no Excel
		result = await shared.actions.openFile({
			filePath: './temp/temp' + ext,
		});

		if (result.error) {
			toast.show();
			return;
		}

		shared.actions.window({ action: 'minimize' });

		return new Promise(resolve => {
			// Aguarda o Excel abrir
			const interval = setInterval(async () => {
				const sheets = await getSheets(false);

				if (sheets.length) {
					clearInterval(interval);

					// Cria o arquivo config.json
					const srvConfig = SrvConfig();

					sheets.forEach((sheet, index) => {
						const table = SrvTable();

						table.id = sheet.Id; // ! Obs.: Id válido somente enquanto o arquivo do Excel estiver aberto
						table.name = sheet.Name;
						table.enabled = index == 0; // Habilita a primeira

						srvConfig.data.tables.push(table);
					});

					// Escreve o arquivo config.json
					result = await shared.actions.writeFile({
						filePath: './temp/config.json',
						data: JSON.stringify(srvConfig),
					});

					if (result.error) {
						toast.show();
						return;
					}

					// Ativa a janela da aplicação
					await shared.actions.window({ action: 'focus' });

					resolve(srvConfig);
				}
			}, 500);
		});
	}

	async function openFile() {
		let result = await shared.actions.showOpenDialog({
			title: 'Abrir',
			filters: [{ name: 'Survey', extensions: ['srv'] }],
			properties: ['openFile'],
		});

		if (result.canceled)
			return;

		let srvConfig = SrvConfig();
		const filePath = result.filePaths[0];
		const toast = Toast({ message: `Falha ao abrir o arquivo.` });

		await shared.appData({ key: 'srvFilePath', value: filePath });

		// Limpa a pasta temp
		await shared.actions.clearFolder({ folderPath: './temp' });

		// Extrai o conteúdo na pasta temp
		result = await shared.actions.unzipFile({
			fromFilePath: filePath,
			toFolderPath: './temp',
			overwrite: true,
			keepOriginalPermission: true,
		});

		if (result.error) {
			toast.show();
			return;
		}

		// Cria uma cópia da planilha com o nome padrão se necessário
		let tempFileName = result.data.find(x => x.startsWith('temp.xls')); // .xlsx | .xls

		if (!tempFileName) {
			const oldTempFileName = result.data.find(x => x.startsWith('spreadsheet')); // .xlsx | .xls
			const ext = oldTempFileName.substring(oldTempFileName.lastIndexOf('.'));

			tempFileName = 'temp' + ext;

			result = await shared.actions.copyFile({
				fromFilePath: './temp/' + oldTempFileName,
				toFilePath: './temp/' + tempFileName,
			});
		}

		shared.appData({ key: 'tempFileName', value: tempFileName });

		// Lê o arquivo config.json ou antigos: formdata.json, report.json e options.json
		const config = await shared.actions.readFile({ filePath: './temp/config.json' });

		if (config.data) {
			srvConfig = JSON.parse(config.data);
		} else {
			const formdata = await shared.actions.readFile({ filePath: './temp/formdata.json' });
			const report = await shared.actions.readFile({ filePath: './temp/report.json' });

			if (formdata.data) {
				const data = JSON.parse(formdata.data);

				srvConfig.data = parseFormdata(data);
			}

			if (report.data) {
				const data = JSON.parse(report.data);

				srvConfig.info = parseReport(data);
			}

			await shared.actions.writeFile({
				filePath: './temp/config.json',
				data: JSON.stringify(srvConfig),
			});
		}

		// Abre spreadsheet.xls(x) no Excel
		result = await shared.actions.openFile({
			filePath: './temp/' + tempFileName,
		});

		if (result.error) {
			toast.show();
			return;
		}

		shared.actions.window({ action: 'minimize' });

		return new Promise(resolve => {
			// Aguarda o Excel abrir
			const interval = setInterval(async () => {
				const sheets = await getSheets(false);

				if (sheets.length) {
					clearInterval(interval);

					sheets.forEach(sheet => {
						let isNewTable = true;

						// Atualizar o id da tabela
						srvConfig.data.tables.forEach(table => {
							if (sheet.Name == table.name) {
								table.id = sheet.Id; // ! Obs.: Id válido somente enquanto o arquivo do Excel estiver aberto
								isNewTable = false;
							}
						});

						// Para arquivos .srv de versões anteriores, adiciona o restante das planilhas como desabilitadas
						if (isNewTable) {
							const table = SrvTable();

							table.id = sheet.Id;
							table.name = sheet.Name;
							table.enabled = false;

							srvConfig.data.tables.push(table);
						}
					});

					// Ativa a janela da aplicação
					await shared.actions.window({ action: 'focus' });

					resolve(srvConfig);
				}
			}, 500);
		});
	}

	async function saveFile(srvConfig) {
		//const toast = Toast({ message: 'Não foi possível salvar.' });

		const tempFileName = await shared.appData({ key: 'tempFileName' });

		// Atualiza o arquivo config.json
		let result = await shared.actions.writeFile({
			filePath: './temp/config.json',
			data: JSON.stringify(srvConfig),
		});

		// Salva a planilha temp
		result = shared.actions.execute({
			executablePath: __constants.EXCEL_API_PATH,
			args: [`workbookPath=${__constants.TEMP_FOLDER_PATH}/${tempFileName}`, 'method=SaveWorkbook'],
		}).then(result => {
			console.log(result);
		}).catch(error => {
			console.log(error);
		});

		// Empacota o arquivo .srv
		const srvFilePath = await shared.appData({ key: 'srvFilePath' });

		result = await shared.actions.zipFile({
			fromFolderPath: './temp',
			toFilePath: srvFilePath,
		});
	}

	async function getSheets(notify = true) {
		// Retorna os nomes das planilhas disponíveis no arquivo do Excel.

		const tempFileName = await shared.appData({ key: 'tempFileName' });

		return shared.actions.execute({
			executablePath: __constants.EXCEL_API_PATH,
			args: [`workbookPath=${__constants.TEMP_FOLDER_PATH}/${tempFileName}`, 'method=GetSheets'],
		}).then(result => {
			if (result.data.stdout) {
				return JSON.parse(result.data.stdout);
			} else if (notify) {
				Toast({ message: `Falha ao acessar as planilhas.` }).show();
			}

			return [];
		}).catch(error => {
			Toast({ message: `Falha ao acessar as planilhas.` }).show();
			return [];
		});
	}
}

function parseFormdata(data) {
	// Converte os dados de versão antiga para o novo modelo.

	const planilhas = [...new Set(data.map(data => data.Planilha))]; // Somente os nomes das planilhas únicos
	const _data = {
		tables: [],
	};
	let lastGroup = '';

	planilhas.forEach(planilha => {
		const table = SrvTable();

		table.name = planilha;
		table.rows = [];

		data.filter(data => data.Planilha == planilha).forEach(item => {
			// Grupo
			if (item.Grupo && item.Grupo != lastGroup) {
				lastGroup = item.Grupo;

				const row = SrvTableRow();

				row.isGroup = true;
				row.name = item.Grupo;
				table.rows.push(row);
			}

			// Linha
			const row = SrvTableRow();

			row.id = item.Id;
			row.objects = JSON.parse(item.Objetos || '[]');
			row.name = item.Nome;
			row.description = item.Descricao;
			row.type = item.Tipo;
			row.subtype = item.SubTipo;
			row.value = item.Valor;
			row.required = item.Obrigatorio == '1';
			row.readonly = item.Editavel != '1';

			table.rows.push(row);
		});

		_data.tables.push(table);
	});

	return _data;
}

function parseReport(data) {
	// Converte os dados de versão antiga para o novo modelo.

	const info = SrvInfo();

	// info.id = data.id;
	info.createdBy = data.author;
	info.createdByEmail = data.mailAuthor;
	info.createdAt = data.created;
	// info.modifiedBy = data.modifiedBy;
	// info.modifiedByEmail = data.mailModifiedBy;
	// info.modifiedAt = data.modified;

	return info;
}
