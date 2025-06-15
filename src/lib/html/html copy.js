// Criado por Janderson Costa em 05/2025.

const onHtml = {
	Reload: null,
};

export { html, css, onHtml };

_setHtmlStyle();

function html(templateString, ...expressions) {
	let _templateString = templateString;
	let _expressions = expressions;
	let _component = createComponent();
	let _xPath;

	return _component;

	function reload() {
		// Recria um novo componente e substitui o anterior.

		const newComponent = createComponent();

		_component.replaceWith(newComponent);
		_component = newComponent;

		focus();

		if (onHtml.Reload)
			onHtml.Reload({ component: newComponent });

		return newComponent;
	}

	function createComponent() {
		const html = parseTemplateString();
		const component = createElement(html);

		setComponent(component);

		return component;
	}

	function parseTemplateString() {
		const htmlParts = _templateString;
		const html = htmlParts.reduce((acc, cur, i) => {
			acc = compressTemplateString(acc);
			cur = compressTemplateString(cur);

			if (i == 0)
				return cur;

			const index = i - 1;
			const part = compressTemplateString(htmlParts[index]);
			const onEventRegex = /@on[a-zA-Z0-9]*="$/; // Termina com @on<eventName>="

			let expression = _expressions[index];
			let isFunction = typeof expression == 'function';

			if (isElement(expression)) {
				expression = `<element>${index}</element>`;
			} else if (isFunction && (part.endsWith('>') || !onEventRegex.test(part))) {
				isFunction = false;
				expression = expression();

				if (isElement(expression))
					expression = `<function>${index}</function>`;
			}

			return (acc + (isFunction ? index : expression) + cur)
				.replaceAll('readonly="true"', 'readonly')
				.replaceAll('readonly="false"', '')
				.replaceAll('disabled="true"', 'disabled')
				.replaceAll('disabled="false"', '')
				.replaceAll('selected="true"', 'selected')
				.replaceAll('selected="false"', '')
				.replaceAll('checked="true"', 'checked')
				.replaceAll('checked="false"', '');
		}, '');

		return html;

		function compressTemplateString(text) {
			return typeof text == 'string' ? text.replace(/\n|\t/g, '') : '';
		}

		function isElement(any) {
			return any instanceof Element || any[0] instanceof Element;
		}
	}

	function createElement(html) {
		const template = document.createElement('template');

		template.innerHTML = html.trim();

		return template.content.firstChild;
	}

	function setComponent(element) {
		// Configura o componente e todos os seus elementos.

		const elements = element.querySelectorAll('element, function');

		elements.forEach(element => {
			const index = element.textContent;
			const expression = _expressions[index];
			const result = element.tagName.toLowerCase() == 'function' ? expression() : expression;
			const children = result instanceof Array ? result : [result];

			children.forEach((child, index) => {
				element.before(child);

				if (index == children.length - 1)
					element.remove();
			});
		});

		set(element);

		Array.from(element.children).forEach(child => {
			set(child);

			if (child.children.length)
				setComponent(child);
		});

		function set(element) {
			setPublicProperties(element);

			Array.from(element.attributes).forEach(attr => {
				const attrName = attr.name.toLowerCase();

				// @onEvent
				if (attrName.startsWith('@on')) {
					const func = _expressions[attr.value];
					const _attrName = attrName.substring(3);

					element.addEventListener(_attrName, event => {
						_xPath = _getXPath(event.target);
						func({ event, element, reload });
					});

					element.removeAttribute(attrName);
				}

				// @show
				if (attrName == '@show') {
					element.classList[attr.value != 'true' ? 'add' : 'remove']('hidden');
				}
			});
		}
	}

	function setPublicProperties(element) {
		if (!element.reload)
			element.reload = reload;

		if (!element.css)
			element.css = style => css(element, style);
	}

	function focus() {
		const element = _getElementByXPath(_xPath);

		if (!element) return;

		const tagName = element.tagName.toLowerCase();
		const type = element.type;

		if (element && !(
			tagName == 'textarea' ||
			type.match(/text|number|password|email|url|search|tel/)
		)) element.focus();
	}


	// INTERNO

	function _getElementByXPath(xPath) {
		if (!xPath)
			return null;

		return document.evaluate(
			xPath,
			document,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		).singleNodeValue;
	}

	function _getXPath(element) {
		if (!(element instanceof Element))
			return null;

		const parts = [];

		while (element && element.nodeType === Node.ELEMENT_NODE) {
			let index = 1;
			let sibling = element.previousElementSibling;

			while (sibling) {
				if (sibling.nodeName === element.nodeName)
					index++;

				sibling = sibling.previousElementSibling;
			}

			const tagName = element.nodeName.toLowerCase();
			const part = `${tagName}[${index}]`;

			parts.unshift(part);
			element = element.parentNode;
		}

		return `/${parts.join('/')}`;
	}
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


// INTERNO

function _setHtmlStyle() {
	if (document.querySelector('style#html-style'))
		return;

	document.querySelector('head').appendChild(html`
		<style id="html-style">
			.disabled {
				opacity: .6;
				-webkit-user-select: none;
				-moz-user-select: none;
				user-select: none;
				pointer-events: none;
			}
		</style>
	`);
}
