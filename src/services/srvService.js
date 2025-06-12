import { SrvConfig, SrvTable, SrvTableRow, SrvInfo } from '../models/srvConfig.js';
import Toast from '../lib/Toast/Toast.js';
import Result from '../models/result.js';

let _isDialogOpen = false;

export default function srvService() {
	return {
		openFile,
		getSheets,
	};

	async function openFile() {
		if (_isDialogOpen) return;

		_isDialogOpen = true;

		let result = await shared.actions.showOpenDialog({
			title: 'Abrir',
			filters: [{ name: 'Survey', extensions: ['srv'] }],
			properties: ['openFile'],
		});

		_isDialogOpen = false;

		if (result.canceled)
			return;

		let srvConfig = SrvConfig();
		const filePath = result.filePaths[0];

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
			Toast({ message: `Falha ao abrir o arquivo.` });
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
			Toast({ message: `Falha ao abrir a planilha.` });
			return;
		}

		// Ativa a janela da aplicação
		// shared.actions.window({ action: 'minimize' });
		// setTimeout(() => {
		// 	shared.actions.window({ action: 'focus' });
		// }, 2000);

		return srvConfig;
	}

	function getSheets() {
		// Retorna os nomes das planilhas disponíveis no arquivo do Excel.

		return shared.actions.execute({
			executablePath: __constants.EXCEL_API_PATH,
			args: [`workbookPath=${__constants.TEMP_FILE_NAME}`, 'method=GetSheets'],
		}).then(result => {
			if (result.data.stdout)
				return JSON.parse(result.data.stdout);

			return [];
		}).catch(result => null);
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
			row.objects = item.Objetos;
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

	info.id = data.id;
	info.created = data.created;
	info.author = data.author;
	info.emailAuthor = data.mailAuthor;
	info.modified = data.modified;
	info.modifiedBy = data.modifiedBy;
	info.emailModifiedBy = data.mailModifiedBy;

	return info;
}
