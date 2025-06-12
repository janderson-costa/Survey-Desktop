import { html } from './lib/html/html.js';
import { DataTable } from './lib/DataTable/prod/main.js';
import srvService from './services/srvService.js';
import { SrvConfig } from '../src/models/srvConfig.js';
import Menu from './lib/menu/Menu.js';
import Icon from './components/Icon.js';
import Buttons from "./components/Buttons.js";

const _components = {
	controlsTopLeft: null,
	controlsTopRight: null,
	tabs: null,
	buttonAddTable: null,
	itemsTotal: null,
	layout: null,
};
const _dataTables = [];
let _srvConfig = SrvConfig();
let _sheets = [];

(async () => {
	window.__constants = await shared.constants();
	_srvConfig = await shared.appData({ key: 'srvConfig' }) || _srvConfig;

	setWindowTitle();

	const _controlsTopLeft = [
		{ group: 0, title: 'Novo', icon: Icon('new'), onClick: () => console.log('onClick') },
		{ group: 0, title: 'Abrir', icon: Icon('open'), onClick: () => openSrvFile() },
		{ group: 1, title: 'Salvar', icon: Icon('save'), onClick: () => console.log('onClick') },
		{ group: 1, title: 'Informações do arquivo', icon: Icon('info'), onClick: () => console.log('onClick') },
		{ group: 1, divider: true },
		{ group: 1, title: 'Carregar dados nas planilhas', icon: Icon('load'), onClick: () => console.log('onClick') },
		{ group: 1, title: 'Limpar dados das planilhas', icon: Icon('clear'), onClick: () => console.log('onClick') },
		{ group: 1, title: 'Enviar por E-mail', icon: Icon('send'), onClick: () => console.log('onClick') },
		{ group: 1, divider: true },
		{ group: 1, title: 'Adicionar grupo', icon: Icon('addGroup'), onClick: () => console.log('onClick') },
		{ group: 1, title: 'Adicionar item', icon: Icon('add'), onClick: () => console.log('onClick') },
		{ group: 2, title: 'Mover item selecionado para cima', icon: Icon('arrowUp'), onClick: () => console.log('onClick') },
		{ group: 2, title: 'Mover item selecionado para baixo', icon: Icon('arrowDown'), onClick: () => console.log('onClick') },
		{ group: 2, title: 'Excluir item selecionado', icon: Icon('close'), onClick: () => console.log('onClick') },
		{ group: 2, name: 'Teste', onClick: () => teste() },
	];
	const menuTables = Menu({
		items: [],
		align: 'top left',
	});
	const $controlsTopLeft = createControlsTopLeft(_controlsTopLeft);
	const $controlsTopRight = Buttons([
		{ title: 'Visualizar no dispositivo móvel', icon: Icon('smartphone'), onClick: () => console.log('onClick') },
	]);
	const $tables = _srvConfig.data.tables.map(() => {
		const dt = createDataTable();

		_dataTables.push(dt);

		return dt.element;
	});
	const $tabs = html`
		<div class="tabs flex gap-2 mr-2" @show="${() => !!_srvConfig.data.tables.length}">${() =>
			_srvConfig.data.tables.map((table, index) => html`
				<button type="button" class="tab button items-start h-10 px-3 !gap-3 whitespace-nowrap" @onClick="${() => showTable(index)}" @onContextmenu="${e => {
					Menu({
						trigger: e.element,
						items: [
							{ icon: Icon('inputText'), name: 'Renomear', onClick: () => renameTable(table.name) },
							{ icon: Icon('remove'), name: 'Excluir', onClick: () => removeTable(table.name) },
						],
						align: 'top left',
					}).show();

					lucide.createIcons();
				}}">${table.name}</button>
			`)
		}</div>
	`;
	const $buttonAddTable = html`
		<button type="button" class="button add-sheet min-w-10 h-10" title="Adicionar planilha" @onClick="${async e => {
			e.event.stopPropagation();

			_sheets = await srvService().getSheets();

			if (_sheets.length) {
				menuTables.options.items = _sheets.map(name => {
					let $icon = '';

					if (_srvConfig.data.tables.find(x => x.name == name)) {
						$icon = Icon('check');
					}

					return ({ icon: $icon, name: name, onClick: () => addTable(name) });
				});
				menuTables.show({
					trigger: e.element.closest('button'),
					position: 'top',
				});

				lucide.createIcons();
			}

		}}">${Icon('add')}</button>
	`;
	const $itemsTotal = html`<span class="items-total flex items-center h-10 ml-4">${() => {
		let total;

		$tabs.querySelectorAll('.tab').forEach(($tab, index) => {
			if ($tab.classList.contains('active')) {
				const dt = _dataTables[index];

				total = dt.rows.length;
			}
		});

		return total ? `${total} item(s)` : '';
	}}</span>`;
	const $layout = html`
		<div class="layout flex h-screen">
			<div class="flex flex-col w-screen">
				<!-- header -->
				<div class="header flex flex-col gap-4 border-b border-gray-300 px-4 py-4">
					<div class="buttons flex justify-between">
						<div class="left">${$controlsTopLeft}</div>
						<div class="right">${$controlsTopRight}</div>
					</div>
				</div>

				<!-- body -->
				<div class="body flex-1 overflow-auto p-4">${$tables}</div>

				<!-- footer -->
				<div class="footer flex items-start border-t border-gray-300 px-4 py-4" @show="${() => !!_srvConfig.data.tables.length}">
					<div class="flex gap-2 overflow-x-auto">${$tabs}</div>
					${$buttonAddTable}
					${$itemsTotal}
				</div>
			</div>

			<!-- app viewer -->
			<div></div>
		</div>
	`;

	// Componentes
	_components.layout = $layout;
	_components.controlsTopLeft = $controlsTopLeft;
	_components.controlsTopRight = $controlsTopRight;
	_components.tabs = $tabs;
	_components.buttonAddTable = $buttonAddTable;
	_components.itemsTotal = $itemsTotal;

	document.body.appendChild($layout);
	showTable(0);
	loadTables();
	lucide.createIcons();
})();

function setWindowTitle() {
	document.title = `${__constants.APP_NAME} - ${__constants.APP_VERSION}`;
}

function createDataTable() {
	const columns = {
		//id: { displayName: 'Id', hidden: true },
		name: { displayName: 'Nome', width: 150 },
		description: { displayName: 'Descrição', width: 250 },
		//subtype: { displayName: 'Subtipo', hidden: true },
		value: { displayName: 'Valor', width: 250 },
		//objects: { displayName: 'Objetos', hidden: true },
		type: { displayName: 'Tipo', width: 150 },
		required: { displayName: 'Obrigatório', width: 90 },
		readonly: { displayName: 'Editável', minWidth: 90 },
	};

	return DataTable({
		data: [],
		place: null,
		checkbox: false,
		sort: false,
		resize: true,
		//width: 'fit-content',
		height: '100%',
		columns: columns,
		borders: {
			table: {
				top: false,
				bottom: false,
			},
			rows: true,
			cells: false,
		},
		footer: {
			hidden: true,
		},
	});
}

async function teste() {
	//..
}

function createControlsTopLeft(controls, group) {
	group = sessionStorage.getItem('controlsTopLeft') || 0;

	controls.forEach(control => {
		control.hidden = true;

		if (control.group <= group)
			control.hidden = false;
	});

	return Buttons(controls);
}

async function openSrvFile() {
	_srvConfig = await srvService().openFile();

	if (!_srvConfig) return;

	_sheets = [];
	shared.appData({ key: 'srvConfig', value: _srvConfig });
	sessionStorage.setItem('controlsTopLeft', 1);
	location.reload();

	// uiService().load({
	// 	srvConfig: _srvConfig,
	// 	contentPlace: $layout.querySelector('.body'),
	// 	tabsPlace: $layout.querySelector('.body'),
	// });
}

function loadTables() {
	console.log(_srvConfig);

	_srvConfig.data.tables.forEach((table, index) => {
		_dataTables[index].load(table.rows);
	});
}

function addTable(name) {
	const table = _srvConfig.data.tables.find(x => x.name == name);

	// if (!table) return;

	// const dt = createDataTable();

	// dt.setData(table.data);
	// dt.element.classList.add('dt');
	// document.querySelector('.body').appendChild(dt.element);

	// _tables.push(dt);
	// showTable(_tables.length - 1);
}

function showTable(index = 0) {
	// Tab ativa
	_components.tabs.querySelectorAll('.tab').forEach((x, _index)=> {
		x.classList.remove('active');

		if (index == _index)
			x.classList.add('active');
	});
	
	// Exibe a tabela especificada
	document.querySelectorAll('.dt').forEach((x, _index)=> {
		x.classList.add('!hidden');

		if (index == _index)
			x.classList.remove('!hidden');
	});

	// Total
	_components.itemsTotal.reload();
}
