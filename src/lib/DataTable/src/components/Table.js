import { utils } from '../utils.js';
import { Header } from './Header.js';
import { Row } from './Row.js';
import { Footer } from './Footer.js';

export function Table(options) {
	const _table = {
		options,
		id: options.id || utils.generateGuid(),
		element: null,
		elements: {
			scrollable: null,
		},
		header: null,
		body: {
			element: null,
		},
		_columnWidths: null,
		rows: [],
		_lastRowSelected: null,
		footer: null,
		isDisabled: false,
		_data: options.data || [],
		data,
		append,
		load,
		reload,
		width,
		height,
		column,
		addRow,
		selectedRows,
		selectRows,
		unselectRows,
		rowsByFieldValue,
		moveSelectedRows,
		removeRows,
		removeSelectedRows,
		removeUnselectedRows,
		sort,
		disable,
		clear,
		export: _export,
		_setBorders,
	};
	const $table = create();
	const key_storedWidths = `${_table.id}-widths`;

	createHeader();
	createBody();
	createFooter();
	width(options.width);
	height(options.height);
	disable(options.disabled);
	load(options.data);

	return _table;

	function create() {
		const $table = document.createElement('div');

		$table.id = _table.id;
		$table.classList.add('dt');

		const $scrollable = document.createElement('div');

		$scrollable.classList.add('scrollable');
		$table.appendChild($scrollable);
		$scrollable.addEventListener('scroll', event => {
			let element = event.target;
			let atBottom = Math.ceil(element.scrollTop + element.clientHeight) >= element.scrollHeight - 1;

			if (atBottom && !element.alreadyAtBottom) {
				element.alreadyAtBottom = true;

				if (options.onScrollEnd)
					options.onScrollEnd({ event, end: true });
			} else if (!atBottom) {
				// Se o usuário rolar para cima
				element.alreadyAtBottom = false;
			}
		});

		if (options.borders.table.all) {
			$table.classList.add('table-border-all');

			if (options.borders.table.radius != null) {
				let radius = options.borders.table.radius;

				$table.style.borderRadius = utils.parseDimension(radius);
				$scrollable.style.borderRadius = utils.parseDimension(radius);
			}
		} else {
			if (options.borders.table.top)
				$table.classList.add('table-border-top');

			if (options.borders.table.bottom)
				$table.classList.add('table-border-bottom');
		}

		if (options.style)
			utils.setElementStyle($table, options.style);

		_table.element = $table;
		_table.elements.scrollable = $scrollable;

		return $table;
	}

	function createHeader() {
		const header = Header(_table);

		_table.header = header;

		$table.querySelector('.scrollable').appendChild(header.element);
		header.show(!options.header.hidden);
		header.disable(options.header.disabled);
	}

	function createBody() {
		const $body = document.createElement('div');

		$body.classList.add('dt-body');
		_table.body.element = $body;

		$table.querySelector('.scrollable').appendChild($body);
	}

	function createFooter() {
		if (options.footer) {
			const footer = Footer(_table);

			_table.footer = footer;
			$table.appendChild(footer.element);
		}
	}

	function column(nameOrIndex) {
		return {
			show,
			disable,
		};

		function show(show = true) {
			_table.header.cell(nameOrIndex).show(show);
			_table.rows.forEach(row => row.cell(nameOrIndex).show(show));

			_setColumnWidths();
		}

		function disable(disabled = true) {
			_table.header.cell(nameOrIndex).disable(disabled);
			_table.rows.forEach(row => row.cell(nameOrIndex).disable(disabled));
		}
	}

	function width(width) {
		if (width == undefined)
			return $table.clientWidth;

		$table.style.width = utils.parseDimension(width) || 'auto';
	}

	function height(height) {
		if (height == undefined)
			return $table.clientHeight;

		$table.style.height = utils.parseDimension(height) || 'auto';
	}

	function data(data, meta = false) {
		data = data || _table._data;

		// Adiciona campos conforme options.columns caso não existam
		// Previne erros caso sejam adicionadas novas colunas (campos) que não existem em data
		if (data.length) {
			for (const columnName in options.columns) {
				data.forEach(item => {
					if (!item.hasOwnProperty(columnName))
						item[columnName] = '';
				});
			}
		}

		_table._data = data;

		// remove a propriedade meta
		if (!meta)
			return _table._data.map(({ meta, ...item }) => item);

		return _table._data;
	}

	function load(_data) {
		clear(!!_data);

		data(_data, true).forEach(item =>
			addRow(item, false, false)
		);

		_setColumnWidths();
		_setColumnResizable();
		_setBorders();

		// Rola para o topo
		_table.elements.scrollable.scrollTop = 0;
	}

	function append(_data) {
		data([..._table._data, ..._data], true);

		_data.forEach(item =>
			addRow(item, false, false)
		);

		_setBorders();
	}

	function reload() {
		load();
	}

	function clear(clearData = true) {
		if (clearData)
			data([]);

		_table.rows = [];
		_table.body.element.innerHTML = '';
		_table.header.cells[0].checked(false);
	}

	function addRow(data, insert = true, setBorders = true) {
		const row = Row(_table, { data });

		_table.rows.push(row);
		_table.body.element.appendChild(row.element);

		data.meta = {
			row: {
				id: row.id,
			},
		};

		if (insert)
			_table._data.push(data);

		if (setBorders)
			_setBorders();

		if (options.onAddRow)
			options.onAddRow({ row });

		return row;
	}

	function selectedRows() {
		return _table.rows.filter(x => x.isSelected);
	}

	function rowsByFieldValue(fieldName, value) {
		if (fieldName == undefined || value == undefined)
			return;

		return _table.rows.filter(row =>
			row._data[fieldName] == value
		);
	}

	function selectRows(indexes) {
		// Seleciona todas as linhas ou apenas as especificadas.

		if (indexes)
			indexes = indexes instanceof Array ? indexes : [indexes];

		_table.rows.forEach(row => {
			let selected = false;

			if (indexes) {
				for (let i = 0; i < indexes.length; i++) {
					if (utils.getElementIndex(row.element) == indexes[i]) {
						selected = true;
						break;
					}
				}
			} else {
				selected = true;
			}

			row.isSelected = selected;

			if (options.checkbox) {
				row.cells[0].checked(selected);
			} else {
				row.element.classList.toggle('selected', selected);
			}
		});

		if (options.checkbox)
			_table.header.cells[0].checked();

		if (options.onSelectRows)
			options.onSelectRows({ rows: selectedRows() });
	}

	function unselectRows(event, callback = true) {
		// Desseleciona todas as linhas.

		_table.header.cells[0].checked(false);

		selectedRows().forEach(row => {
			row.isSelected = false;
			row.element.classList.remove('selected');
			row.cells[0].checked(false);
		});

		if (options.onUnselectRows && callback)
			options.onUnselectRows({ event });
	}

	function moveSelectedRows(down = true) {
		if (options.sort) return;

		if (down) {
			for (let i = _table.rows.length - 1; i >= 0; i--) {
				let fromIndex = i;
				let toIndex = i + 1;

				if (_table.rows[i].isSelected) {
					if (toIndex < _table.rows.length)
						changePosition(fromIndex, toIndex);
					else
						break;
				}
			}
		} else {
			for (let i = 0; i < _table.rows.length; i++) {
				let fromIndex = i;
				let toIndex = i - 1;

				if (_table.rows[i].isSelected) {
					if (toIndex >= 0)
						changePosition(fromIndex, toIndex);
					else
						break;
				}
			}
		}

		_table.rows.forEach(row => _table.body.element.appendChild(row.element));

		function changePosition(fromIndex, toIndex) {
			const row = _table.rows.splice(fromIndex, 1)[0];
			const item = _table._data.splice(fromIndex, 1)[0];

			_table.rows.splice(toIndex, 0, row);
			_table._data.splice(toIndex, 0, item);
		}
	}

	function removeRows(rows) {
		rows = rows instanceof Array ? rows : [rows];

		if (!rows.length)
			return;

		rows.forEach(row => {
			// row
			_table.rows.forEach((_row, index) => {
				if (_row.id == row.id)
					_table.rows.splice(index, 1);
			});

			// data
			_table._data.forEach((item, index) => {
				if (item.meta.row.id == row.id)
					_table._data.splice(index, 1);
			});

			row.element.remove();
		});

		if (options.onRemoveRows)
			options.onRemoveRows();
	}

	function removeSelectedRows() {
		removeRows(selectedRows());
		_table.header.cells[0].checked(false);
	}

	function removeUnselectedRows() {
		removeRows(_table.rows.filter(row => !row.isSelected));
	}

	function sort(fieldName, ascending = true) {
		_table.rows.sort((a, b) => {
			// let va = a._data[fieldName];
			// let vb = b._data[fieldName];
			let va = a.cell(fieldName).value();
			let vb = b.cell(fieldName).value();

			if (typeof va == 'string') {
				va = String(va).toLowerCase();
				vb = String(vb).toLowerCase();
			}

			if (va < vb)
				return ascending ? -1 : 1;

			if (va > vb)
				return ascending ? 1 : -1;

			return 0;
		});

		_table.rows.forEach(row => _table.body.element.appendChild(row.element));
	}

	function disable(disabled = true) {
		_table.isDisabled = disabled;
		$table.classList.toggle('disabled', disabled);
	}

	function _export(rows, options = { separator: '\t' }) {
		// Exporta as linhas especificadas ou selecionadas para um formato de texto separado por tabulação.

		let text = (rows || _table.selectedRows()).map(row => {
			let fieldNames = row.cells.filter(x => !x.checkbox && !x.isHidden).map(x => x.options.name);

			return row.text(fieldNames).join(options.separator);
		}).join('\n');

		return text;
	}

	function _setColumnWidths() {
		let widths = _storedWidths() || _table._columnWidths;

		if (!widths) {
			widths = [];

			if (options.checkbox)
				widths.push('34px');

			for (let name in options.columns) {
				let column = options.columns[name];

				if (column.hidden)
					continue;

				let width = column.width;
				let minWidth = column.minWidth;
				let minMaxWidth;

				if (!width && !minWidth) {
					minMaxWidth = '1fr';
				} else if (width == minWidth) {
					minMaxWidth = width + 'px';
				} else {
					width = width ? width + 'px' : '1fr';
					minWidth = minWidth ? minWidth + 'px' : width;
					minMaxWidth = `minmax(${minWidth}, ${width})`;
				}

				widths.push(minMaxWidth);
			}
		}

		_table._columnWidths = widths;
		_table.header.element.style.gridTemplateColumns = widths.join(' ');
		_table.body.element.style.gridTemplateColumns = widths.join(' ');
	}

	function _setColumnResizable() {
		const $header = _table.header.element;
		const $headerCells = $header.querySelectorAll('.dt-header-cell:not(.hidden)');
		const $body = _table.body.element;
		let currentColumn = null;
		let currentColumnIndex;
		let columnWidths;
		let startX;
		let startWidth;
		let diff;
		let isResizing = false;

		if ($header.hasResizeHandler)
			return;

		$headerCells.forEach(($cell, index) => {
			const $resizer = $cell.querySelector('.resizer');

			if ($resizer) {
				$resizer.addEventListener('mousedown', event => startResize(event, index, $cell));
				$resizer.addEventListener('click', event => event.stopPropagation());
			}
		});

		$header.hasResizeHandler = true;

		function startResize(event, index, $column) {
			document.addEventListener('mousemove', resize);
			document.addEventListener('mouseup', stopResize);

			currentColumn = _table.header.cell($column.dataset.name);

			if (!options.resize && !currentColumn.options.resize)
				return;

			$header.classList.add('resizing');
			isResizing = true;
			currentColumnIndex = index;
			startX = event.pageX;
			columnWidths = getComputedStyle($header).gridTemplateColumns.split(' ');
			startWidth = parseFloat(columnWidths[currentColumnIndex]);
			document.body.style.cursor = 'e-resize';
			document.body.style.userSelect = 'none';
		}

		function resize(e) {
			if (!isResizing) return;

			diff = e.pageX - startX;

			let minWidth = currentColumn.options.minWidth || 50;
			let width = Math.max(minWidth, startWidth + diff);

			setColumnWidth(currentColumnIndex, width);
		}

		function setColumnWidth(columnIndex, width) {
			width = typeof width == 'number' ? width + 'px' : width;

			columnWidths = getComputedStyle($header).gridTemplateColumns.split(' ');
			columnWidths[columnIndex] = width;
			$header.style.gridTemplateColumns = columnWidths.join(' ');
			$body.style.gridTemplateColumns = columnWidths.join(' ');
			_table._columnWidths = columnWidths;
		}

		function stopResize() {
			document.removeEventListener('mousemove', resize);
			document.removeEventListener('mouseup', stopResize);

			if (!isResizing)
				return;

			isResizing = false;
			$header.classList.remove('resizing');
			document.body.style.cursor = '';
			document.body.style.userSelect = '';
			_storedWidths(_table._columnWidths);

			if (diff && options.onResizeColumn) {
				options.onResizeColumn({ column: currentColumn, widths: _table._columnWidths });
				diff = 0;
			}
		}
	}

	function _storedWidths(widths) {
		if (widths) {
			widths[widths.length - 1] = `minmax(${widths[widths.length - 1]}, 1fr)`; // última coluna com largura máxima

			localStorage.setItem(key_storedWidths, JSON.stringify(widths));
		} else {
			widths = localStorage.getItem(key_storedWidths);

			if (widths)
				_table._columnWidths = JSON.parse(widths);

			return _table._columnWidths;
		}
	}

	function _setBorders() {
		if (!(
			data().length &&
			_table.header &&
			_table.body
		)) return;

		// remove a borda da última célula com a classe .visible (não é possível fazer isso via css).
		_table.header.element.querySelector('.visible:last-child').classList.remove('cell-border-right');
		_table.body.element.childNodes.forEach(($row, index) => {
			$row.querySelector('.visible:last-child').classList.remove('cell-border-right');
		});

		// footer
		let radius = options.footer.hidden ? 'inherit' : '0px';

		_table.elements.scrollable.style.borderBottomLeftRadius = radius;
		_table.elements.scrollable.style.borderbottomRightRadius = radius;
	}
}
