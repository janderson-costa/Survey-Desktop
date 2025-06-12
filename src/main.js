
// Observa arquivos da aplicação e recarrega ao atualizar/salvar
require('electron-reload')([__dirname], {
	electron: require(`../node_modules/electron`)
});

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
	TEMP_FILE_NAME: 'D:/_dev/Survey/2.0/Electron/temp/temp.xlsx',
};
const _appData = {};
let _mainWindow;


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
	const menu = Menu.buildFromTemplate([
		{
			label: 'Arquivo',
			submenu: [
				{ label: 'Novo' },
				{ label: 'Abrir' },
				{ label: 'Salvar' },
				{ label: 'Salvar Como' },
				{ type: 'separator' },
				{ label: 'Enviar por E-mail' },
				{ type: 'separator' },
				{ label: 'Ir para o Local do Arquivo' },
				{ type: 'separator' },
				{ label: 'Sair' },
			],
		},
		{
			label: 'Exibir',
			submenu: [
				{ label: 'Informações do Arquivo' },
				{ type: 'separator' },
				{
					label: 'Atualizar janela', click: () => {
						_mainWindow.webContents.reloadIgnoringCache();
					},
				},
				{
					role: 'toggleDevTools',
					accelerator: 'f12',
				}
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

	Menu.setApplicationMenu(menu);
	_mainWindow.loadFile(_constants.INDEX_URL);
};

app.whenReady().then(() => {
	createWindow();
	nodeAPI({
		constants: _constants,
		appData: _appData,
		window: _mainWindow
	});
});
