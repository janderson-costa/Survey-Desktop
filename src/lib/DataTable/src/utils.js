const utils = new Utils();

export { utils };

function Utils() {
	this.generateGuid = generateGuid;
	this.mergeProps = mergeProps;
	this.getElementIndex = getElementIndex;
	this.createRangeArray = createRangeArray;
	this.isArrayOfHTMLElement = isArrayOfHTMLElement;
	this.parseDimension = parseDimension;
	this.setElementAttr = setElementAttr;
	this.setElementStyle = setElementStyle;

	function generateGuid() {
		// Retorna randomicamente um GUID - Ex.: a91e32df-9352-4520-9f09-1715a9a0ce41

		const guid = ([1e6] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
			(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
		);

		// adiciona uma letra como primeiro caractere para evitar erro na função querySelector
		return 'a' + guid;
	}

	function mergeProps(target, source) {
		const merged = { ...target };

		for (const key in source) {
			if (
				source[key] instanceof Object &&
				!(source[key] instanceof Array) &&
				!(source[key] instanceof Function) &&
				!(source[key] instanceof HTMLElement)
			) {
				merged[key] = mergeProps(target[key] || {}, source[key]);
			} else {
				merged[key] = source[key];
			}
		}

		return merged;
	}

	function getElementIndex($element) {
		const children = Array.from($element.parentElement.children);

		return children.indexOf($element);
	}

	function createRangeArray(startNumber, endNumber) {
		// verifica a direção do intervalo (crescente ou decrescente)
		const isAscending = startNumber <= endNumber;

		// cria o intervalo
		return Array.from(
			{ length: Math.abs(endNumber - startNumber) + 1 },
			(_, index) => isAscending
				? startNumber + index
				: startNumber - index
		);
	}

	function isArrayOfHTMLElement(obj) {
		if (Array.isArray(obj))
			return obj.every(item => item instanceof HTMLElement);

		return false;
	}

	function parseDimension(value) {
		return typeof value == 'number' ? `${value}px` : value || '';
	}

	function setElementStyle(elements, attributes = {}) {
		setElementAttr(elements, attributes, 'style');
	}

	function setElementAttr(elements, attributes = {}, objectName = '') {
		// attributes: object
		// object: string - ex.: style

		elements = elements instanceof Array ? elements : [elements];

		elements.forEach(x => {
			for (const key in attributes) {
				let node = objectName ? x[objectName] : x;
				let value = attributes[key];

				// valores inteiros com unidade px
				if (objectName == 'style') {
					let important = '';

					if (!key.match(/index|line|grid|order|tab|orphans|widows|columns|counter|opacity/i))
						value = typeof value == 'number' ? value + 'px' : value;

					if (value.match(/important/i)) {
						value = value.substring(0, value.indexOf('!') - 1).trim();
						important = 'important';
					}

					if (important)
						node.setProperty(key, value, important);
					else
						node[key] = value;
				} else {
					typeof node[key] == 'undefined' ?
						node.setAttribute(key, value) :
						node[key] = value;
				}
			}
		});
	}
}
