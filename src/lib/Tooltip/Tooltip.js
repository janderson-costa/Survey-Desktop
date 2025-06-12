/*
	Criado por Janderson Costa em 28/01/2025.
*/

const defaultOptions = {
	position: 'top', // 'top', 'right', 'bottom', 'left'
	text: 'Tooltip text.',
	fontSize: '0.9em', // em | px
	maxWidth: 'auto', // px
	offset: 8, // px
};

export default function Tooltip(targetElement, options) {
	options = { ...defaultOptions, ...options };

	let $tooltip;
	let $content;

	create();

	function create() {
		$tooltip = document.createElement('div');
		$tooltip.classList.add('tooltip', options.position);
		$tooltip.innerHTML = /*html*/`<div class="tooltip-content"></div>`;
		$content = $tooltip.querySelector('.tooltip-content');

		targetElement.style.position = 'relative';
		targetElement.appendChild($tooltip);
		targetElement.addEventListener('mouseover', show);
		targetElement.addEventListener('mouseout', hide);

		$tooltip.addEventListener('mouseout', event => {
			event.stopPropagation();

			// Impede que seja fechado ao passar o mouse sobre outros elementos dentro do tooltip
			if (event.relatedTarget && event.relatedTarget.closest('.tooltip')) return;

			hide();
		});
		$tooltip.addEventListener('click', event => {
			event.stopPropagation();
			event.preventDefault();
		});
	}

	function show() {
		$content.innerHTML = options.text;
		$tooltip.style.padding = typeof options.offset == 'number' ? options.offset + 'px' : 'initial';

		if (options.style) {
			style($content, options.style);
		}

		$tooltip.classList.add('tooltip-visible');
	}

	function hide() {
		$tooltip.classList.remove('tooltip-visible');
		$content.innerHTML = '';
		$content.style = null;
	}
}

function style(element, style = {}) {
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
