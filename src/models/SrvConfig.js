export { SrvConfig, SrvTable, SrvTableRow, SrvInfo };

function SrvConfig() {
	const config = {
		versions: {
			desktop: typeof __contants != 'undefined' ? __contants.APP_VERSION : null,
			mobile: null,
		},
		data: {
			tables: [] // SrvTable[]
		},
		info: SrvInfo(),
	};

	return config;
}

function SrvTable() {
	const table = {
		id: '', // Válido somente enquanto o arquivo do Excel estiver aberto
		name: '',
		enabled: true,
		rows: [SrvTableRow()],
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
		// id: '',
		createdAt: '',
		createdBy: '',
		createdByEmail: '',
		// modifiedBy: '',
		// modifiedAt: '',
		// modifiedByEmail: '',
	};

	return info;
}
