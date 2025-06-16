import { html } from './lib/html/html.js';
import { DataTable } from './lib/DataTable/src/index.js';
import { Utils } from './lib/Utils.js';
import srvService from './services/srvService.js';
import { AppState } from './models/AppState.js';
import { SrvConfig } from './models/SrvConfig.js';
import Menu from './lib/menu/Menu.js';
import Modal from './lib/Modal/Modal.js';
import Icon from './components/Icon.js';
import Buttons from "./components/Buttons.js";

const _columns = {
	//id: { displayName: 'Id', hidden: true },
	name: { displayName: 'Nome do campo', minWidth: 150 },
	description: { displayName: 'Descrição', minWidth: 150 },
	//subtype: { displayName: 'Subtipo', hidden: true },
	value: { displayName: 'Valor' },
	//objects: { displayName: 'Objetos', hidden: true },
	type: { displayName: 'Tipo', width: 150 },
	required: { displayName: 'Obrigatório', width: 90 },
	readonly: { displayName: 'Editável', minWidth: 90 },
};
let _ui = {
	layout: null,
	toolbarActionsLeft: null,
	toolbarActionsRight: null,
	toolbarTable: null,
	tables: null,
	tabs: null,
	itemsTotal: null,
};
let _appState = AppState();
let _srvConfig = SrvConfig();
let _dataTables = [];
let _activeDataTable;
let _temp;

window.actions = {
	newFile,
	openFile,
	saveFile,
	showFileInfo,
};

init();

async function init(options = { new: false }) {
	window.__constants = await shared.constants();
	_appState = await shared.appData({ key: 'state' }) || _appState;
	_srvConfig = await shared.appData({ key: 'srvConfig' }) || _srvConfig;
	_dataTables = [];
	_temp = true;

	setWindowTitle();

	// Observa alteraçoes em _srvConfig
	const srvConfig = Utils().observe(_srvConfig, {
		onChange: async () => {
			if (_temp) return;

			_appState.saved = false;
			await shared.appData({ key: 'state', value: _appState });
			await shared.appData({ key: 'srvConfig', value: _srvConfig });
			setWindowTitle();
		},
	});

	// Cria a interface do usuário
	_ui = createUI(srvConfig);

	// Carrega a página
	document.body.innerHTML = '';
	document.body.appendChild(_ui.layout);
	loadTables(srvConfig);
	showTable();
	lucide.createIcons();
	_temp = null;
}


// ACÕES

async function newFile() {
	// Salva o arquivo atual
	if (_appState.opened && !_appState.saved) {
		saveFile(!_appState.saved, newFile);
		return;
	}

	_srvConfig = await srvService().newFile();

	if (!_srvConfig) return;

	_appState.opened = true;
	await shared.appData({ key: 'state', value: _appState });
	await shared.appData({ key: 'srvConfig', value: _srvConfig });
	init({ new: true });
}

async function openFile() {
	// Salva o arquivo atual
	if (_appState.opened && !_appState.saved) {
		saveFile(!_appState.saved, newFile);
		return;
	}

	_srvConfig = await srvService().openFile();

	if (!_srvConfig) return;

	_appState.opened = true;
	await shared.appData({ key: 'state', value: _appState });
	await shared.appData({ key: 'srvConfig', value: _srvConfig });
	init();
}

async function saveFile(confirm = false, callback) {
	let modal;

	// Confirmar se deseja salvar as alterações
	if (confirm) {
		modal = Modal({
			title: 'Survey',
			content: 'Deseja salvar as alterações?',
			width: 360,
			hideOut: true,
			buttons: [
				{ name: 'Sim', primary: true, onClick: () => save()},
				{ name: 'Não', onClick: () => modal.hide() },
			],
		});

		modal.show();
	} else {
		save();
	}

	async function save() {
		let result = await srvService().saveFile(_srvConfig);

		console.log(result);

		// _state.saved = true;
		// await shared.appData({ key: 'state', value: _state });
		// setWindowTitle();

		// if (modal)
		// 	modal.hide();

		// if (callback)
		// 	callback();
	}
}

function showFileInfo() {
	const modal = Modal({
		title: 'Informações do arquivo',
		content: 'Informações do arquivo.',
		width: 360,
		hideOut: true,
		buttons: [
			{ name: 'OK', primary: true, onClick: () => modal.hide()},
		],
	});

	modal.show();
}


// UI

function setWindowTitle() {
	document.title = `${__constants.APP_NAME} - ${__constants.APP_VERSION} ${_appState.saved ? '' : '*'}`;
}

function createUI(srvConfig) {
	const _menu = Menu({ items: [] });

	const _toolbarActionsLeft = [
		{ title: 'Novo', icon: Icon('new'), onClick: () => newFile() },
		{ title: 'Abrir', icon: Icon('open'), onClick: () => openFile() },
		{ title: 'Salvar', icon: Icon('save'), onClick: () => saveFile() },
		{ title: 'Informações do arquivo', icon: Icon('info'), onClick: () => showFileInfo() },
		{ divider: true },
		{ title: 'Carregar dados nas planilhas', icon: Icon('load'), onClick: () => console.log('onClick') },
		{ title: 'Limpar dados das planilhas', icon: Icon('clear'), onClick: () => console.log('onClick') },
		{ title: 'Enviar por E-mail', icon: Icon('send'), onClick: () => console.log('onClick') },
	];
	const _toolbarActionsRight = [
		{ title: 'Visualizar no dispositivo móvel', icon: Icon('smartphone'), onClick: () => console.log('onClick') }
	];
	const _toolbarTable = [
		{ divider: true },
		{ title: 'Adicionar grupo', icon: Icon('addGroup'), onClick: () => console.log('onClick') },
		{ title: 'Adicionar item', icon: Icon('add'), onClick: () => console.log('onClick') },
		{ title: 'Mover item selecionado para cima', icon: Icon('arrowUp'), onClick: () => console.log('onClick') },
		{ title: 'Mover item selecionado para baixo', icon: Icon('arrowDown'), onClick: () => console.log('onClick') },
		{ title: 'Excluir item selecionado', icon: Icon('close'), onClick: () => console.log('onClick') },
	];

	const $toolbarActionsLeft = html`<div>${() => {
		_toolbarActionsLeft.forEach((control, index) => {
			if (!_appState.opened && index > 1)
				control.hidden = true;
		});

		return Buttons(_toolbarActionsLeft);
	}}</div>`;

	const $toolbarActionsRight = Buttons(_toolbarActionsRight);

	// const $tabs = html`
	// 	<div class="tabs flex gap-2">${() =>
	// 		srvConfig.data.tables.filter(x => x.enabled).map(table => {
	// 			const $tab = html`
	// 				<button type="button" class="tab button h-10 px-3 whitespace-nowrap" id="${table.id}" @onClick="${() => showTable(table)}">
	// 					<span>${table.name}</span>
	// 				</button>
	// 			`

	// 			console.log($tab);

	// 			return $tab;
	// 		})
	// 	}</div>
	// `;
	const $tabs = html`
		<div class="tabs flex gap-2">${() =>
		[]
		}</div>
	`;

	console.log($tabs);

	const $buttonAddTable = html`
		<button type="button" class="button add-sheet min-w-10 h-10" title="Adicionar planilha" @onClick="${async e => {
			e.event.stopPropagation();

			const sheets = await srvService().getSheets();

			if (sheets.length) {
				_menu.options.items = sheets.map(sheet => {
					let $icon = '';

					if (srvConfig.data.tables.find(x => x.name == sheet.Name)) {
						$icon = Icon('check');
					}

					return ({ icon: $icon, name: sheet.Name, onClick: () => addTable(sheet) });
				});
				_menu.show({
					trigger: e.element.closest('button'),
					position: 'bottom left',
				});

				lucide.createIcons();
			}

		}}">${Icon('add')}</button>
	`;

	const $toolbarTable = html`<div>${() => {
		_toolbarTable.forEach((control, index) => {
			if (index > 2) {
				control.hidden = true;

				if (_activeDataTable && _activeDataTable.rows.some(x => x.isSelected)) {
					control.hidden = false;
				}
			}
		});

		return Buttons(_toolbarTable);
	}}</div>`;

	const $tables = srvConfig.data.tables.map(table => {
		const dt = createDataTable(table);

		_dataTables.push(dt);

		return dt.element;
	});

	const $itemsTotal = html`<span class="flex items-center h-10">${() => {
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
			<div class="flex flex-col justify-between w-screen h-screen">
				<div>
					<!-- toolbar-actions -->
					<div class="toolbar-actions flex justify-between gap-4 px-4 py-4">
						<div class="left">${$toolbarActionsLeft}</div>
						<div class="right" @show="${_appState.opened}">${$toolbarActionsRight}</div>
					</div>

					<!-- toolbar-table -->
					<div class="toolbar-table flex gap-2 px-4 pb-4">
						<div class="flex gap-2 w-max-[600px] overflow-x-auto">${$tabs}</div>
						${_appState.opened ? $buttonAddTable : ''}
						${$toolbarTable}
					</div>
				</div>

				<!-- tables -->
				<div class="tables flex-1 overflow-auto px-4">${$tables}</div>

				<!-- footer -->
				<div class="footer flex gap-4 px-4 py-4">${$itemsTotal}</div>
			</div>

			<!-- app viewer -->
			<div></div>
		</div>
	`;

	return {
		layout: $layout,
		toolbarActionsLeft: $toolbarActionsLeft,
		toolbarActionsRight: $toolbarActionsRight,
		toolbarTable: $toolbarTable,
		itemsTotal: $itemsTotal,
		tabs: $tabs,
		tables: $layout.querySelector('.tables'),
	};
}


// DATATABLES

function createDataTable(table) {
	return DataTable({
		id: table.id,
		data: [],
		place: null,
		checkbox: false,
		sort: false,
		resize: true,
		//width: 'fit-content',
		height: '100%',
		columns: _columns,
		borders: {
			table: {
				all: true,
				// top: false,
				// bottom: false,
				radius: 6,
			},
			rows: true,
			cells: true,
		},
		footer: {
			hidden: true,
		},
		rows: {
			selectOnClick: true,
		},
		cells: {
			name: {
				display: ({ row, item, value }) => {
					return html`
						<input type="text" value="${value}" @onChange="${e => {
							item.name = e.element.value.trim();
						}}"/>
					`;
				}
			},
			description: {
				display: ({ row, item, value }) => {
					const $field = html`
						<textarea rows="1" @onChange="${e => {
							item.description = e.element.value.trim();
						}}" @onInput="${e => {
							Utils().form().field().autoHeight(e.element);
						}}">${value}</textarea>
					`;

					Utils().form().field().autoHeight($field);

					return $field;
				}
			},
			type: {
				display: ({ row, item, value }) => {
					const $field = html`
						<select @onChange="${e => {
							item.type = e.element.value;
						}}">${__constants.TABLE_ROW_FIELD_TYPES.map(type => /*html*/`
							<option value="${type.displayName}">${type.displayName}</option>
						`)}</select>
					`;

					$field.value = value;

					return $field;
				},
			},
			value: {
				display: ({ row, item, value }) => {
					if (item.type == 'Texto') {
						const $field = html`
							<textarea rows="1" @onChange="${e => {
								item.value = e.element.value;
							}}" @onInput="${e => {
								Utils().form().field().autoHeight(e.element);
							}}">${item.value}</textarea>
						`;

						Utils().form().field().autoHeight($field);

						return $field;
					} else if (item.type == 'Número') {
						return html`
							<input type="number" value="${item.value}" @onChange="${e => {
								item.value = e.element.value;
							}}"/>
						`;
					} else if (item.type == 'E-mail') {
						return html`
							<input type="email" value="${item.value}" @onChange="${e => {
								item.value = e.element.value;
							}}"/>
						`;
					} else if (item.type == 'Data') {
						return html`
							<input type="date" value="${item.value}" @onChange="${e => {
								item.value = e.element.value;
							}}"/>
						`;
					} else if (item.type == 'Data/Hora') {
						return html`
							<input type="datetime-local" value="${item.value}" @onChange="${e => {
								item.value = e.element.value;
							}}"/>
						`;
					} else if (item.type == 'Horário') {
						return html`
							<input type="time" value="${item.value}" @onChange="${e => {
								item.value = e.element.value;
							}}"/>
						`;
					} else if (item.type == 'Opção') {
						const $field = html`
							<select @onChange="${e => {
								item.value = e.element.value;
							}}">${__constants.TABLE_ROW_FIELD_TYPES.map(type => /*html*/`
								<option value="${type.displayName}">${type.displayName}</option>
							`)}</select>
						`;

						$field.value = value;

						return $field;
					} else if (item.type == 'Opcão Múltipla') {
						//
					} else if (item.type == 'Imagem') {
						//
					} else if (item.type == 'Assinatura') {
						//
					}

					return html`
						<input type="text" value="${item.value}" @onChange="${e => {
							item.value = e.element.value;
						}}"/>
					`;
				},
			},
			required: {
				display: ({ row, item, value }) => {
					return html`
						<label class="flex items-center justify-center w-[80px] h-[32px] px-1.5 opacity-90">
							<input type="checkbox" checked="${() => item.required}" @onChange="${e => {
								item.required = e.element.checked;
							}}"/>
						</label>
					`;
				},
			},
			readonly: {
				display: ({ row, item, value }) => {
					return html`
						<label class="flex items-center justify-center w-[56px] h-[32px] px-1.5 opacity-90">
							<input type="checkbox" checked="${() => item.readonly}" @onChange="${e => {
								item.readonly = e.element.checked;
							}}"/>
						</label>
					`;
				},
			},
		},
		onSelectRows: ({ rows }) => {
			_ui.toolbarTable.reload();
			lucide.createIcons();
		},
		onUnselectRows: () => {
			_ui.toolbarTable.reload();
			lucide.createIcons();
		},
		onClickOut: ({ event }) => {
			// Cancela a chamada de onUnselectRows()
			return false;
		},
	});
}

function loadTables(srvConfig) {
	srvConfig.data.tables.filter(x => x.enabled).forEach((table, index) => {
		_dataTables[index].load(table.rows);
	});
}

function showTable(table) {
	table = table || _srvConfig.data.tables[0];
	_activeDataTable = _dataTables.find(dt => dt.id == table.id);

	// if (!_srvConfig.data.tables[index].name) {
	// 	_ui.tables.classList.add('!hidden');
	// 	_ui.toolbarTable.classList.add('!hidden');
	// 	return;
	// }

	// Tab ativa
	_ui.tabs.querySelectorAll('.tab').forEach(($tab, _index)=> {
		$tab.classList.remove('active');

		if ($tab.id == table.id)
			$tab.classList.add('active');
	});
	
	// Exibe a tabela especificada
	document.querySelectorAll('.dt').forEach(($dt, _index)=> {
		$dt.classList.add('!hidden');

		if ($dt.id == table.id)
			$dt.classList.remove('!hidden');
	});

	// Recarrega a barra de botões da tabela
	_ui.toolbarTable.reload();
	lucide.createIcons();

	// Total
	_ui.itemsTotal.reload();
}

function addTable(sheet) {
	const table = _srvConfig.data.tables.find(x => x.name == sheet.Name);

	// if (!table) return;

	// const dt = createDataTable();

	// dt.setData(table.data);
	// dt.element.classList.add('dt');
	// document.querySelector('.tables').appendChild(dt.element);

	// _tables.push(dt);
	// showTable(_tables.length - 1);
}

async function observeSheets() {
	// Observa as planilhas disponíveis no arquivo do Excel.
}
