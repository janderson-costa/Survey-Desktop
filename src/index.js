import { html } from './lib/html/html.js';
import { DataTable } from './lib/DataTable/src/index.js';
import srvService from './services/srvService.js';
import { State } from '../src/models/State.js';
import { SrvConfig } from './models/SrvConfig.js';
import Menu from './lib/menu/Menu.js';
import Modal from './lib/Modal/Modal.js';
import Icon from './components/Icon.js';
import Buttons from "./components/Buttons.js";

const _components = {
	layout: null,
	header: null,
	controlsTopLeft: null,
	controlsTopRight: null,
	body: null,
	footer: null,
	tabs: null,
	buttonAddTable: null,
	itemsTotal: null,
};
let _state = State();
let _srvConfig = SrvConfig();
let _dataTables = [];
let _controlsTopLeftGroupId = 0;
let _temp;

init();

async function init() {
	window.__constants = await shared.constants();
	_state = await shared.appData({ key: 'state' }) || _state;
	_srvConfig = await shared.appData({ key: 'srvConfig' }) || _srvConfig;
	_dataTables = [];
	_controlsTopLeftGroupId = _state.opened ? 1 : 0;
	_temp = true;

	setWindowTitle();

	// Observa alteraçoes em _srvConfig
	const srvConfig = observe(_srvConfig, {
		onChange: async () => {
			if (_temp) return;

			_state.saved = false;
			await shared.appData({ key: 'state', value: _state });
			await shared.appData({ key: 'srvConfig', value: _srvConfig });
			setWindowTitle();
		},
	});

	// Monta a página
	const _controlsTopLeft = [
		{ group: 0, title: 'Novo', icon: Icon('new'), onClick: () => newSrvFile() },
		{ group: 0, title: 'Abrir', icon: Icon('open'), onClick: () => openSrvFile() },
		{ group: 1, title: 'Salvar', icon: Icon('save'), onClick: () => saveSrvFile() },
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
	const $controlsTopLeft = html`<div>${() => {
		_controlsTopLeft.forEach(control => {
			control.hidden = true;

			if (control.group <= _controlsTopLeftGroupId)
				control.hidden = false;
		});

		return Buttons(_controlsTopLeft);
	}}</div>`;
	const $controlsTopRight = Buttons([
		{ title: 'Visualizar no dispositivo móvel', icon: Icon('smartphone'), onClick: () => console.log('onClick') },
	]);
	const $tables = srvConfig.data.tables.map(table => {
		const $dt = createDataTable();

		_dataTables.push($dt);

		return $dt.element;
	});
	const $tabs = html`
		<div class="tabs flex gap-2 mr-2" @show="${() => !!srvConfig.data.tables.length}">${() =>
			srvConfig.data.tables.map((table, index) => html`
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

			const sheets = await srvService().getSheets();

			if (sheets.length) {
				menuTables.options.items = sheets.map(name => {
					let $icon = '';

					if (srvConfig.data.tables.find(x => x.name == name)) {
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
				<div class="footer flex items-start border-t border-gray-300 px-4 py-4" @show="${() => !!srvConfig.data.tables.length}">
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
	_components.header = $layout.querySelector('.header');
	_components.body = $layout.querySelector('.body');
	_components.controlsTopLeft = $controlsTopLeft;
	_components.controlsTopRight = $controlsTopRight;
	_components.footer = $layout.querySelector('.footer');
	_components.tabs = $tabs;
	_components.buttonAddTable = $buttonAddTable;
	_components.itemsTotal = $itemsTotal;

	document.body.innerHTML = '';
	document.body.appendChild($layout);
	showTable(0);
	loadTables(srvConfig);
	lucide.createIcons();
	_temp = null;
}

function setWindowTitle() {
	document.title = `${__constants.APP_NAME} - ${__constants.APP_VERSION} ${_state.saved ? '' : '*'}`;
}

function createDataTable() {
	const columns = {
		//id: { displayName: 'Id', hidden: true },
		name: { displayName: 'Nome', minWidth: 150 },
		description: { displayName: 'Descrição', minWidth: 150 },
		//subtype: { displayName: 'Subtipo', hidden: true },
		value: { displayName: 'Valor' },
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
				//all: true,
				// top: false,
				// bottom: false,
			},
			rows: true,
			cells: false,
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
					return html`
						<textarea @onChange="${e => {
							item.description = e.element.value.trim();
						}}">${value}</textarea>
					`;
				}
			},
			type: {
				display: ({ row, item, value }) => {
					const $select =  html`
						<select @onChange="${e => {
							item.type = e.element.value;
						}}">${__constants.TABLE_ROW_FIELD_TYPES.map(type => /*html*/`
							<option value="${type.displayName}">${type.displayName}</option>
						`)}</select>
					`;

					$select.value = value;

					return $select;
				},
			},
			value: {
				display: ({ row, item, value }) => {
					if (item.type == 'Texto') {
						return html`
							<textarea @onChange="${e => {
								item.value = e.element.value;
							}}">${item.value}</textarea>
						`;
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
						const $select = html`
							<select @onChange="${e => {
								item.value = e.element.value;
							}}">${__constants.TABLE_ROW_FIELD_TYPES.map(type => /*html*/`
								<option value="${type.displayName}">${type.displayName}</option>
							`)}</select>
						`;

						$select.value = value;

						return $select;
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
						<label class="flex items-center w-fit min-h-[26px] px-1.5 opacity-90">
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
						<label class="flex items-center w-fit min-h-[26px] px-1.5 opacity-90">
							<input type="checkbox" checked="${() => item.readonly}" @onChange="${e => {
								item.readonly = e.element.checked;
							}}"/>
						</label>
					`;
				},
			},
		},
		onSelectRows: ({ rows }) => {
			_controlsTopLeftGroupId = 2;
			_components.controlsTopLeft.reload();
			lucide.createIcons();
		},
		onUnselectRows: () => {
			_controlsTopLeftGroupId = 1;
			_components.controlsTopLeft.reload();
			lucide.createIcons();
		},
		onClickOut: ({ event }) => {
			// Cancela a chamada de onUnselectRows()
			return false;
		},
	});
}

async function teste() {
	//..
}

async function newSrvFile() {
	if (!_state.saved) {
		saveSrvFile(!_state.saved, newSrvFile);
		return;
	}

	_srvConfig = await srvService().newFile();

	if (!_srvConfig) return;

	_state.opened = true;
	await shared.appData({ key: 'state', value: _state });
	await shared.appData({ key: 'srvConfig', value: _srvConfig });
	_controlsTopLeftGroupId = 1;
	init();
}

async function openSrvFile() {
	if (!_state.saved) {
		saveSrvFile(!_state.saved, newSrvFile);
		return;
	}

	_srvConfig = await srvService().openFile();

	if (!_srvConfig) return;

	_state.opened = true;
	await shared.appData({ key: 'state', value: _state });
	await shared.appData({ key: 'srvConfig', value: _srvConfig });
	_controlsTopLeftGroupId = 1;
	init();

	// uiService().load({
	// 	srvConfig: _srvConfig,
	// 	contentPlace: $layout.querySelector('.body'),
	// 	tabsPlace: $layout.querySelector('.body'),
	// });
}

async function saveSrvFile(confirm = false, callback) {
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

function loadTables(srvConfig) {
	srvConfig.data.tables.forEach((table, index) => {
		_dataTables[index].load(table.rows);
	});

	// Total
	_components.itemsTotal.reload();
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
	if (!_srvConfig.data.tables[index].name) {
		_components.body.classList.add('!hidden');
		_components.footer.classList.add('!hidden');
		return;
	}

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


// ÚTIL

function observe(obj, { onChange, onDelete }) {
	// Observa alterações no objeto e seus filhos recursivamente e retorna um objeto proxy.

	if (typeof obj !== 'object' || obj === null)
		return obj;

	return new Proxy(obj, {
		get(target, prop, receiver) {
			const value = Reflect.get(target, prop, receiver);

			return typeof value === 'object' && value !== null
				? observe(value, { onChange, onDelete }) // Aplica proxy também nos filhos
				: value;
		},
		set(target, prop, value, receiver) {
			const old = target[prop];
			const success = Reflect.set(target, prop, value, receiver);

			if (success && old !== value && onChange) {
				onChange({ target, prop, value });
			}

			return success;
		},
		deleteProperty(target, prop) {
			const success = Reflect.deleteProperty(target, prop);

			if (success && onDelete) {
				onDelete({ target, prop });
			}

			return success;
		}
	});
}
