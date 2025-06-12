import { utils } from '../utils.js';
import { ColumnOptions } from '../constants.js';
import { Column } from './Column.js';

export function Header(table) {
	const _header = {
		element: null,
		cells: [],
		isHidden: false,
		isDisabled: false,
		cell,
		show,
		disable,
	};
	const $header = create();

	return _header;

	function create() {
		const $header = document.createElement('div');

		$header.classList.add('dt-header');

		if (table.options.checkbox) {
			const options = new ColumnOptions();

			options.checkbox = true;
			options.resize = false;

			const cell = Column(table, options);

			_header.cells.push(cell);
			$header.appendChild(cell.element);
		}

		for (const name in table.options.columns) {
			const column = table.options.columns[name];
			const options = utils.mergeProps(new ColumnOptions(), column);

			options.name = name;

			const cell = Column(table, options);

			_header.cells.push(cell);
			$header.appendChild(cell.element);
		}

		_header.element = $header;

		return $header;
	}

	function cell(nameOrIndex) {
		const cell = typeof nameOrIndex == 'number' ?
			_header.cells[nameOrIndex] :
			_header.cells.find(cell => cell.options.name == nameOrIndex);

		return cell;
	}

	function show(show = true) {
		_header.isHidden = !show;
		$header.classList.toggle('hidden', !show);
	}

	function disable(disabled = true) {
		_header.isDisabled = disabled;

		Array.from($header.children).forEach($child => {
			$child.classList.toggle('disabled', disabled);
		});
	}
}
