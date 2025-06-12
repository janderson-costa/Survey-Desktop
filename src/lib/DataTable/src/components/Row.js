import { utils } from '../utils.js';
import { CellOptions } from '../constants.js';
import { Cell } from './Cell.js';

export function Row(table, options) {
	const _row = {
		element: null,
		id: utils.generateGuid(),
		cells: [],
		isSelected: false,
		isHidden: false,
		isDisabled: false,
		_data: options.data || {}, // interno
		data,
		cell,
		index,
		show,
		disable,
		select,
		text,
		remove,
	};
	const $row = create();

	_loadCells();

	return _row;

	function create() {
		const $row = document.createElement('div');

		$row.id = _row.id;
		$row.classList.add('dt-body-row');
		$row.addEventListener('click', event => {
			if (!table.options.checkbox && table.options.rows.selectOnClick)
				select(true, event);
		});
		$row.addEventListener('dblclick', event => {
			if (!table.options.rows.selectOnClick)
				return;

			// impede que o texto seja selecionado
			if (window.getSelection)
				window.getSelection().removeAllRanges();

			if (table.options.onDoubleClickRow)
				table.options.onDoubleClickRow({ row: _row, event });
		});

		$row.classList.toggle('selectable', table.options.rows.selectOnClick);

		_row.element = $row;

		return $row;
	}

	function _loadCells() {
		if (table.options.checkbox) {
			const options = new CellOptions();

			options.row = _row;
			options.checkbox = true;
			options.resize = false;

			const cell = Cell(table, options);

			_row.cells.push(cell);
			$row.appendChild(cell.element);
		}

		for (const name in table.options.columns) {
			const column = table.options.columns[name];
			const options = utils.mergeProps(new CellOptions(), column);

			options.row = _row;
			options.name = name;
			options.data = _row._data;
			options.value = _row._data[name];

			const cell = Cell(table, options);

			_row.cells.push(cell);
			$row.appendChild(cell.element);
		}
	}

	function cell(nameOrIndex) {
		// Retorna a célula pelo nome ou pelo índice.

		const cell = typeof nameOrIndex == 'number' ?
			_row.cells[nameOrIndex] :
			_row.cells.find(cell => cell.options.name == nameOrIndex);

		return cell;
	}

	function index() {
		return utils.getElementIndex($row);
	}

	function show(show = true) {
		_row.isHidden = !show;
		$row.classList.toggle('hidden', !show);
	}

	function disable(disabled = true) {
		_row.isDisabled = disabled;
		$row.classList.toggle('disabled', disabled);
	}

	function select(selected = true, event) {
		// impede que o texto seja selecionado com shift
		if (event && event.shiftKey && window.getSelection)
			window.getSelection().removeAllRanges();

		if (table.options.checkbox) {
			_row.isSelected = selected;

			if (table.options.onSelectRows)
				table.options.onSelectRows({ rows: table.selectedRows() });
		} else {
			if (
				!table.options.rows.allowMultipleSelection ||
				!event ||
				(!event.ctrlKey && !event.shiftKey)
			) {
				table.unselectRows(event, false);
				table._lastRowSelected = null;
			}

			if (event && event.ctrlKey) {
				// inverte a seleção com CTRL pressionado
				selected = !_row.isSelected;
			}

			if (event && event.shiftKey && table._lastRowSelected) {
				let indexes = utils.createRangeArray(utils.getElementIndex(table._lastRowSelected), utils.getElementIndex($row));

				table.selectRows(indexes);
			}

			_row.isSelected = selected;

			if (!event || !event.shiftKey)
				table._lastRowSelected = $row;

			$row.classList.toggle('selected', selected);

			if (table.options.onSelectRows)
				table.options.onSelectRows({ rows: table.selectedRows() });
		}
	}

	function data(fields, meta = false) {
		if (fields) {
			for (const name in fields) {
				let value = fields[name];
				let cell = _row.cell(name);

				cell.value(value);
			}

			if (table.options.onUpdateRow)
				table.options.onUpdateRow({ row: _row, fields });
		} else {
			// remove a propriedade meta
			if (!meta)
				return (({ meta, ...data }) => data)(_row._data);

			return _row._data;
		}
	}

	function text(fieldNames) {
		let cells = fieldNames ? _row.cells.filter(x => !!fieldNames.find(name => name == x.options.name)) : _row.cells;
		let text = [];

		cells.forEach(cell =>
			text.push(cell.element.querySelector('.value-display').innerText.trim())
		);

		return text;
	}

	function remove() {
		table.removeRows(_row);
	}
}
