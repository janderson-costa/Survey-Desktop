export function Utils() {
	return {
		form,
		observe,
	};

	function form() {
		return {
			field,
		};

		function field() {
			return {
				autoHeight,
			};

			function autoHeight(textarea) {
				// Ajusta a altura do textarea automaticamente de acordo com o conteúdo.

				setTimeout(() => {
					textarea.style.height = 'auto';
					textarea.style.height = textarea.scrollHeight + 'px';
				}, 100);
			}
		}
	}

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
}
