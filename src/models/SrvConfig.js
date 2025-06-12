export { SrvConfig, SrvTable, SrvTableRow, SrvInfo };

function SrvConfig() {
	const config = {
		data: {
			tables: [] // SrvTable[]
		},
		info: {}, // SrvInfo
	};

	return config;
}

function SrvTable() {
	const table = {
		name: '',
		disabled: false,
		rows: [], // SrvTableRow[]
	};

	return table;
}

function SrvTableRow() {
	const row = {
		id: '',
		name: '',
		description: '',
		type: '',
		subtype: '',
		value: '',
		objects: '',
		required: false,
		readonly: false,
		isGroup: false,
	};

	return row;
}

function SrvInfo() {
	const info = {
		id: '',
		created: '',
		author: '',
		emailAuthor: '',
		modified: '',
		modifiedBy: '',
		emailModifiedBy: '',
	};

	return info;
}
