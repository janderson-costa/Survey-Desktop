const { ipcMain, dialog } = require('electron');
const AdmZip = require('adm-zip');
const fs = require('fs/promises');
const open = require('open').default;
const path = require('path');
const { execFile } = require('child_process');

module.exports = nodeAPI;

function Result() {
	return {
		data: null,
		error: null,
		canceled: false,
	};
}

async function nodeAPI({ constants, appData, window }) {
	// Registra os manipuladores de acesso o backend.

	// Dados compartilhados
	ipcMain.handle('constants', (event, _) => constants);

	ipcMain.handle('appData', (event, { key, value }) => {
		if (value)
			appData[key] = value;
		else
			return appData[key];
	});

	// Arquivos e pastas
	ipcMain.handle('showOpenDialog', (event, options = {}) => {
		return dialog.showOpenDialog(options);
	});

	ipcMain.handle('readFile', (event, options = {}) => {
		// Lê o conteúdo do arquivo e retorna como string.

		const result = Result();

		return fs.readFile(options.filePath, 'utf8').then(data => {
			result.data = data;
			return result;
		}).catch(err => {
			result.error = err;
			return result;
		});
	});

	ipcMain.handle('writeFile', (event, options = {}) => {
		const result = Result();

		return fs.writeFile(options.filePath, options.data, 'utf8').then(() => {
			return result;
		}).catch(err => {
			result.error = err;
			return result;
		});
	});

	ipcMain.handle('renameFile', (event, options = {}) => {
		const result = Result();
		const dir = path.dirname(options.filePath);
		const ext = path.extname(options.filePath);
		const newPath = path.join(dir, options.name + ext);

		return fs.rename(options.filePath, newPath).then(() => {
			result.data = {
				path: newPath,
				name: options.name + ext,
			};

			return result;
		}).catch(err => {
			result.error = err;
			return result;
		});
	});

	ipcMain.handle('copyFile', (event, options = {}) => {
		const result = Result();

		return fs.copyFile(options.fromFilePath, options.toFilePath).then(() => {
			return result;
		}).catch(err => {
			result.error = err;
			return result;
		});
	});

	ipcMain.handle('openFile', (event, options = {}) => {
		const result = Result();

		return open(options.filePath).then(process => {
			result.data = {
				pid: process.pid
			};

			return result;
		}).catch(err => {
			result.error = err;
			return result;
		});
	});

	ipcMain.handle('clearFolder', async (event, options = {}) => {
		const result = Result();

		options = {
			recursive: true,
			force: true,
			...options
		};

		try {
			await fs.rm(options.folderPath, { recursive: options.recursive, force: options.force });
			fs.mkdir(options.folderPath, { recursive: true }); // Recria a pasta (folderPath) que foi excluída
		} catch (err) {
			result.error = err;
		}

		return result;
	});

	ipcMain.handle('zipFile', async (event, options = {}) => {
		const fileZip = new AdmZip();

		await fileZip.addLocalFolderPromise(options.fromFolderPath);

		return fileZip.writeZipPromise(options.toFilePath, { overwrite: true });
	});

	ipcMain.handle('unzipFile', (event, options = {}) => {
		const result = Result();

		options = {
			overwrite: false,
			keepOriginalPermission: false,
			...options,
		};

		return new Promise((resolve, reject) => {
			const fileZip = new AdmZip(options.fromFilePath);

			// Lista os arquivos do arquivo zip
			result.data = [];
			fileZip.forEach(entry => result.data.push(entry.entryName));

			fileZip.extractAllToAsync(
				options.toFolderPath,
				options.overwrite,
				options.keepOriginalPermission,
				err => {
					if (err) {
						result.error = err;
						result.data = null;
						reject(result);
					} else {
						resolve(result);
					}
				}
			);
		});
	});

	// Janela da aplicação
	ipcMain.handle('window', (event, options = {}) => {
		if (!window) return;

		switch (options.action) {
			case 'minimize':
				window.minimize();
				break;
			case 'maximize':
				window.maximize();
				break;
			case 'restore':
				window.restore();
				break;
			case 'moveTop':
				window.moveTop();
				break;
			case 'alwaysOnTop':
				window.setAlwaysOnTop(options.value);
				break;
			case 'close':
				window.close();
				break;
			case 'focus':
				if (window.isMinimized())
					window.restore();

				window.show();
				window.focus();
				break;
		}
	});

	// Execução de programas
	ipcMain.handle('execute', (event, options = {}) => {
		/*
			options: {
				executablePath: string, // Ex.: 'C:\\caminho\\para\\programa.exe'
				args: string[], // Ex.: ['-param1=1', '-param2=2']
			}
		*/

		const result = Result();

		return new Promise((resolve, reject) => {
			execFile(options.executablePath, options.args, (error, stdout, stderr) => {
				if (error) {
					result.error = error.message;
					reject(result);
					return;
				}

				result.data = {
					stdout: stdout.trim(),
					stderr: stderr.trim(),
				};

				resolve(result);
			});
		});
	});
}
