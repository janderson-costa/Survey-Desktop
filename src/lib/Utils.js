export function Utils() {
	return {
		form,
		observe,
		css,
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

	function css(element, style = {}) {
		const pxProps = new Set([
			'borderBottomLeftRadius',
			'borderBottomRightRadius',
			'borderBottomWidth',
			'borderLeftWidth',
			'borderRadius',
			'borderRightWidth',
			'borderTopLeftRadius',
			'borderTopRightRadius',
			'borderTopWidth',
			'borderWidth',
			'bottom',
			'columnGap',
			'fontSize',
			'gap',
			'height',
			'left',
			'letterSpacing',
			'lineHeight',
			'margin',
			'marginBottom',
			'marginLeft',
			'marginRight',
			'marginTop',
			'maxHeight',
			'maxWidth',
			'minHeight',
			'minWidth',
			'outlineWidth',
			'padding',
			'paddingBottom',
			'paddingLeft',
			'paddingRight',
			'paddingTop',
			'right',
			'rowGap',
			'top',
			'translateX',
			'translateY',
			'translateZ',
			'width',
		]);

		const processedStyle = {};

		for (const [prop, value] of Object.entries(style)) {
			// Se o valor for um número, adiciona 'px' no final
			if (pxProps.has(prop) && typeof value == 'number') {
				processedStyle[prop] = `${value}px`;
			} else {
				processedStyle[prop] = value;
			}
		}

		Object.assign(element.style, processedStyle);
	}
}
