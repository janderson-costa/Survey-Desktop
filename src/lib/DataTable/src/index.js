/*
	Criado por Janderson Costa em 05/01/2025.
*/

import { utils } from './utils.js';
import { TableOptions } from './constants.js';
import { Table } from './components/Table.js';

export function DataTable(options) {
	// options: TableOptions

	options = utils.mergeProps(new TableOptions(), options);

	const _table = Table(options);

	if (options.place)
		options.place.appendChild(_table.element);

	window.addEventListener('click', onWindowClick);
	window.addEventListener('keydown', onKeyDown);

	_table.destroy = destroy;

	return _table;

	function onWindowClick(event) {
		if (_table.isDisabled)
			return;

		// remove a seleção ao clicar fora
		if (!event.target.closest('.dt-header') && !event.target.closest('.dt-body')) {
			if (options.onClickOut)
				options.onClickOut({ event });

			// event.cancelUnselectRows: boolean - Propriedade customizada definida em options.onClickOut() para cancelar a desseleção das linhas.
			if (!options.checkbox && !event.cancelUnselectRows)
				_table.unselectRows(event);
		}
	}

	function onKeyDown(event) {
		// ctrl+a
		if (
			event.ctrlKey &&
			event.key == 'a' && ((
				options.rows.selectOnClick &&
				options.rows.allowMultipleSelection
			) ||
				options.checkbox
			)
		) {
			// previne o comportamento padrão de selecionar tudo
			event.preventDefault();

			// seleciona todas as linhas da tabela
			_table.selectRows();
		}

		// ctrl+c
		if (
			options.onCopyClip &&
			event.ctrlKey &&
			event.key == 'c' && ((
				options.rows.selectOnClick
			) ||
				options.checkbox
			)
		) {
			options.onCopyClip({ text: _table.export() });
		}

		// esc
		if (event.key == 'Escape')
			_table.unselectRows(event);
	}

	function destroy() {
		window.removeEventListener('click', onWindowClick);
		window.removeEventListener('keydown', onKeyDown);

		_table.element.remove();
	}
}
