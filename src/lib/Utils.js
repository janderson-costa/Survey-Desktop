const utils = new Utils();

export default utils;

function Utils() {
	this.generateGuid = generateGuid;
	this.convert = convert;
	this.isBoolean = isBoolean;
	this.isEmpty = isEmpty;
	this.isNullOrEmpty = isNullOrEmpty;
	this.isUndefinedOrNull = isUndefinedOrNull;
	this.isUndefinedOrNullOrEmpty = isUndefinedOrNullOrEmpty;
	this.isNumber = isNumber;
	this.isInteger = isInteger;
	this.isDateTime = isDateTime;
	this.isIframe = isIframe;
	this.compressTemplateString = compressTemplateString;
	this.truncateText = truncateText;

	function generateGuid() {
		// Retorna randomicamente um GUID padrão - Ex.: a91e32df-9352-4520-9f09-1715a9a0ce41

		const guid = ([1e6] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
			(
				c ^
				(crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
			).toString(16)
		);

		// adiciona uma letra como primeiro caractere para evitar erro na função querySelector
		return 'a' + guid;
	}

	function convert() {
		function toNumber(value, options) {
			// Converte qualquer valor que contenha números para um número puro, inteiro ou decimal.

			/*
				options: {
					digits: int/'auto'
				}
			*/

			if (isUndefinedOrNullOrEmpty(value)) return null;

			const _options = {
				digits: 2,
			};

			if (options) {
				if (options.digits !== 'auto')
					options.digits =
						isNumber(options.digits) && options.digits >= 0
							? options.digits
							: _options.digits;
			} else {
				options = _options;
			}

			let number = value;

			if (typeof value === 'string') {
				let isNegative = value.startsWith('-');
				let numbers = value.match(/\d+/g); // somente números

				number = '';

				if (numbers) {
					for (let i = 0; i < numbers.length; i++) {
						number += numbers[i];

						if (i === numbers.length - 2) number += '.';
					}
				}

				number = Number(isNegative ? '-' + number : number);
			}

			return options.digits === 'auto'
				? number
				: Number(number.toFixed(options.digits));
		}

		function toBoolean(value) {
			// Converte qualquer valor que se entenda como verdadeiro ou falso para booleano.

			if (typeof value === 'boolean') {
				return value;
			} else if (Utils().isUndefinedOrNullOrEmpty(value)) {
				return false;
			} else if (typeof value === 'number') {
				return value === 1;
			} else if (typeof value === 'string') {
				value = value.toLowerCase().trim();

				if (value.match(/^true$|^yes$|^sim$|^1$/)) return true;
				else if (value.match(/^false$|^no$|^não$|^0$/)) return false;
			}

			return false;
		}

		function numberToPx(value) {
			// Converte qualquer valor que contenha números para px.

			value = parseFloat(value);

			return value ? `${value}px` : '';
		}

		return {
			toNumber,
			toBoolean,
			numberToPx,
		};
	}

	function isBoolean(value) {
		return typeof value === 'boolean';
	}

	function isEmpty(value) {
		return value === '' || (Array.isArray(value) && !value.length);
	}

	function isNullOrEmpty(value) {
		return value === null || isEmpty(value);
	}

	function isUndefinedOrNull(value) {
		return value === undefined || value === null;
	}

	function isUndefinedOrNullOrEmpty(value) {
		return isUndefinedOrNull(value) || isNullOrEmpty(value);
	}

	function isNumber(value) {
		if (isUndefinedOrNullOrEmpty(value) || isBoolean(value)) return false;

		return !isNaN(Number(value));
	}

	function isInteger(value) {
		if (isUndefinedOrNullOrEmpty(value) || isBoolean(value)) return false;

		return Number.isInteger(Number(value));
	}

	function isDateTime(value, format) {
		if (isUndefinedOrNullOrEmpty(value) || isBoolean(value)) return false;

		if (value instanceof Date) return true;

		if (format === 'dd/mm/yyyy')
			return value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/) !== null;
		if (format === 'dd/mm/yyyy hh:mm')
			return (
				value.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/) !==
				null
			);
		if (format === 'dd/mm/yyyy hh:mm:ss')
			return (
				value.match(
					/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/
				) !== null
			);
		if (format === 'yyyy-mm-dd')
			return value.match(/^(\d{4})-(\d{2})-(\d{2})$/) !== null;
		if (format === 'yyyy-mm-ddThh:mm')
			return (
				value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/) !==
				null
			);
		if (format === 'yyyy-mm-dd hh:mm')
			return (
				value.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/) !==
				null
			);
		if (format === 'yyyy-mm-ddThh:mm:ss')
			return (
				value.match(
					/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/
				) !== null
			);
		if (format === 'yyyy-mm-dd hh:mm:ss')
			return (
				value.match(
					/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/
				) !== null
			);
		if (format === 'yyyy-mm-ddThh:mm:ssZ')
			return (
				value.match(
					/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/
				) !== null
			);
		if (format === 'yyyy-mm-dd hh:mm:ssZ')
			return (
				value.match(
					/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})Z$/
				) !== null
			);
		if (format === 'yyyy-mm-ddZ')
			return value.match(/^(\d{4})-(\d{2})-(\d{2})Z$/) !== null;
	}

	function isIframe() {
		// Retorna se a página atual está em um iframe.

		return window.location !== window.parent.location;
	}

	function compressTemplateString(text) {
		return text.replace(/\n|\t/g, '').trim();
	}

	function truncateText(text, maxLength) {
		if (text.length > maxLength)
			return text.substring(0, maxLength - 3) + '...';

		return text;
	}
}
