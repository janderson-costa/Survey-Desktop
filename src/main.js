
// Observa arquivos da aplicação e recarrega ao atualizar/salvar
require('electron-reload')([__dirname], {
	electron: require(`../node_modules/electron`)
});
//
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const nodeAPI = require('./api/nodeAPI');


// CONSTANTES

const _constants = {
	APP_NAME: 'Survey',
	APP_VERSION: '2.0.0',
	APP_AUTHOR: 'Janderson Costa',
	APP_ICON: 'icon.png',
	INDEX_URL: './src/index.html',
	WINDOW_WIDTH: 1800,
	WINDOW_HEIGHT: 900,
	EXCEL_API_PATH: 'D:/_dev/Survey/2.0/ExcelAPI/bin/Debug/net48/win-x86/ExcelAPI.exe',
	TEMP_FOLDER_PATH: 'D:/_dev/Survey/2.0/Electron/temp',
	TABLE_ROW_FIELD_TYPES: [
		{ name: '', displayName: 'Texto' },
		{ name: '', displayName: 'Número' },
		{ name: '', displayName: 'E-mail' },
		{ name: '', displayName: 'Data' },
		{ name: '', displayName: 'Data/Hora' },
		{ name: '', displayName: 'Opção' },
		{ name: '', displayName: 'Opção Múltipla' },
		{ name: '', displayName: 'Imagem' },
		{ name: '', displayName: 'Assinatura' },
	],
};
const _appData = {};
let _mainWindow;
const _menu = Menu.buildFromTemplate([
	{
		label: 'Arquivo',
		submenu: [
			{ label: 'Novo', click: () => actions('newFile()') },
			{ label: 'Abrir', click: () => actions('openFile()') },
			{ label: 'Salvar', click: () => actions('saveFile()') },
			{ label: 'Salvar Como', click: () => actions('saveFileAs()') },
			{ type: 'separator' },
			{ label: 'Enviar por E-mail', click: () => actions('sendByEmail()') },
			{ type: 'separator' },
			{ label: 'Abrir Local do Arquivo', click: () => actions('openFileLocation()') },
			{ type: 'separator' },
			{ label: 'Sair', click: () => _mainWindow.close() },
		],
	},
	{
		label: 'Exibir',
		submenu: [
			{ label: 'Informações do Arquivo', click: () => actions('showFileInfo()') },
			{ type: 'separator' },
			{ label: 'Atualizar janela', click: () => _mainWindow.webContents.reloadIgnoringCache() },
			{ role: 'toggleDevTools', accelerator: 'f12' }
		],
	},
	{
		label: 'Ferramentas',
		submenu: [
			{ label: 'Carregar Dados nas Planilhas' },
			{ label: 'Limpar Dados das Planilhas' },
			{ type: 'separator' },
			{ label: 'Enviar por E-mail' },
			{ type: 'separator' },
			{ label: 'Visualizar no Dispositivo Móvel' },
		],
	},
	{
		label: 'Ajuda',
		submenu: [
			{ label: 'Ajuda' },
			{ label: 'Sobre' },
		],
	},
]);


// EXECUÇÃO

const createWindow = () => {
	_mainWindow = new BrowserWindow({
		width: _constants.WINDOW_WIDTH,
		height: _constants.WINDOW_HEIGHT,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			sandbox: false,
			preload: path.join(__dirname, 'api/preload.js'),
		},
	});

	Menu.setApplicationMenu(_menu);
	_mainWindow.loadFile(_constants.INDEX_URL);

	// Eventos
	_mainWindow.on('close', closeWindow);
};

app.whenReady().then(() => {
	createWindow();
	nodeAPI({
		constants: _constants,
		appData: _appData,
		window: _mainWindow
	});
});

function actions(functionName) {
	// window.actions: Implementados no arquivo index.js

	return _mainWindow.webContents.executeJavaScript(`window.actions.${functionName}`);
}

async function closeWindow(event) {
	event.preventDefault();

	// Verifica se o arquivo foi salvo
	if (_appData.state && !_appData.state.saved) {
		let result = await actions('saveFile(true)'); // true | false | 'canceled' | 'error'

		if (typeof result == 'boolean')
			close();
	} else {
		close();
	}

	async function close() {
		// Fecha o arquivo temp.xls(x)
		const result = await actions('closeWorkbook()');

		console.log(result);

		if (result.error) {
			alert(`Não foi possível fechar o arquivo temp.xls(x)<br>${result.error}`);
			return;
		}

		_mainWindow.destroy(); // Fecha forçado
	}
}
