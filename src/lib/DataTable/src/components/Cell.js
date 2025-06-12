import { utils } from '../utils.js';

export function Cell(table, options) {
	// options: CellOptions

	const $cell = create();
	const _cell = {
		element: $cell,
		isHidden: options.hidden,
		isDisabled: options.disabled,
		options,
		value,
		display,
		checked,
		show,
		showContent,
		disable,
	};

	show(!options.hidden);
	showContent(!options.hidden);
	display(value());

	return _cell;

	function create() {
		const $cell = document.createElement('div');

		$cell.classList.add('dt-body-row-cell');

		if (options.checkbox) {
			$cell.classList.add('checkbox');
			$cell.insertAdjacentHTML('afterbegin', /*html*/`
				<label class="dt-row-checkbox">
					<input type="checkbox"/>
				</label>
			`);

			const $checkbox = $cell.querySelector('label');

			$checkbox.addEventListener('click', event => event.stopPropagation());
			$checkbox.addEventListener('change', event => {
				table.header.cells[0].checked(false);
				options.row.select(event.target.checked, event);
			});
		} else {
			const value = options.value != undefined ? options.value : '';
			const cell = table.options.cells ? table.options.cells[options.name] || {} : {};

			$cell.dataset.name = options.name;
			$cell.insertAdjacentHTML('afterbegin', /*html*/`
				<div class="value-hidden">${value}</div>
				<div class="value-display">${value}</div>
			`);

			if (cell.style)
				utils.setElementStyle($cell, cell.style);
		}

		if (table.options.borders.cells)
			$cell.classList.add('cell-border-right');

		if (table.options.borders.rows)
			$cell.classList.add('cell-border-bottom');

		return $cell;
	}

	function value(value, _display = true) {
		const $value = $cell.querySelector('.value-hidden');

		// Primeiro checkbox
		if (!$value)
			return;

		if (value != undefined) {
			options.data[options.name] = value;
			$value.textContent = value;

			if (_display)
				display(value);
		} else {
			value = options.value != undefined ? options.value : $value.textContent;

			return value;
		}
	}

	function display(value) {
		// Obs.: Preferir usar através cell('name').value(any)

		const $display = $cell.querySelector('.value-display');
		const cell = table.options.cells ? table.options.cells[options.name] || {} : {};

		if (cell.display) {
			const result = cell.display({
				row: options.row,
				item: options.data,
				value,
			});

			$display.innerHTML = '';

			if (result instanceof HTMLElement) {
				$display.appendChild(result);
			} else if (utils.isArrayOfHTMLElement(result)) {
				result.forEach(x => $display.appendChild(x));
			} else {
				$display.innerHTML = result;
			}
		} else {
			if ($display)
				$display.innerHTML = value;
		}
	}

	function show(show = true) {
		_cell.isHidden = !show;

		$cell.classList.toggle('visible', show);
		$cell.classList.toggle('hidden', !show);
	}

	function showContent(show = true) {
		_cell.isHidden = !show;

		Array.from($cell.children).forEach($child => {
			$child.classList.toggle('hidden', !show);
		});
	}

	function checked(checked = true) {
		const $checkbox = $cell.querySelector('.dt-row-checkbox input');

		if ($checkbox)
			$checkbox.checked = checked;
	}

	function disable(disabled = true) {
		_cell.isDisabled = disabled;

		Array.from($cell.children).forEach($child => {
			$child.classList.toggle('disabled', disabled);
		});
	}
}
