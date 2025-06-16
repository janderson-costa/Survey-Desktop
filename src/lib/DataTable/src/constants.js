export class TableOptions {
	id = null; // string
	data = []; /* [
		{ fieldName1: value, fieldName2: value },
		{ fieldName2: value, fieldName2: value },
		..
	] */
	place = null; // HTMLElement
	header = {
		hidden: false, // boolean
		disabled: false, // boolean
	};
	columns = null; /* {
		fieldName1: ColumnOptions,
		fieldName2: ColumnOptions,
		..
	} */
	rows = {
		selectOnClick: false, // boolean
		allowMultipleSelection: true, // boolean
	};
	cells = null; /* {
		fieldName1: {
			display: ({ item, value }) => { return.. },
			style: object,
		},
		fieldName2: {
			display: ({ item, value }) => { return.. },
			style: object,
		}
		..
	} */
	borders = {
		table: {
			top: false, // boolean
			bottom: false, // boolean
			all: false, // boolean
			radius: null, // px
		},
		rows: true, // boolean
		cells: false, // boolean
	};
	footer = {
		hidden: false, // boolean
		disabled: false, // boolean
		content: null, // HTMLElement | string
	};
	width = null; // number
	height = null; // number
	style = null; // object: ex.: { color: red, 'min-width': 150 }
	checkbox = false; // boolean
	sort = false; // boolean
	resize = false; // boolean
	disabled = false; // boolean
	onAddRow = null; // function
	onSelectRows = null; // function
	onUnselectRows = null; // function
	onUpdateRow = null; // function
	onRemoveRows = null; // function
	onDoubleClickRow = null; // function
	onResizeColumn = null; // function
	onClickOut = null; // function
	onCopyClip = null; // function
	onScroll = null; // ! REMOVER EVENTO
	onScrollEnd = null; // function
};

export class ColumnOptions {
	// private
	checkbox = false; // boolean

	// public
	name = null; // string
	displayName = null; // string
	width = null; // number | string
	minWidth = null; // number | string
	resize = false; // boolean
	hidden = false; // boolean
	disabled = false; // boolean
	style = null; // object: ex.: { color: red, 'min-width': 150 }
};

export class CellOptions {
	// private
	row = null; // Row
	checkbox = false; // boolean
	data = null; // object
	value = null; // any

	// public
	name = null; // string
	hidden = false; // boolean
	disabled = false; // boolean
	display = null; // function
	style = null; // object: ex.: { color: red, 'min-width': 150 }
};
