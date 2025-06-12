export function Footer(table) {
	const $footer = create();
	const _footer = {
		element: $footer,
		isHidden: table.options.footer.hidden,
		isDisabled: table.options.footer.disabled,
		show,
		disable,
		content,
	};

	content(table.options.footer.content);
	show(!_footer.isHidden);
	disable(_footer.isDisabled);

	return _footer;

	function create() {
		const $footer = document.createElement('div');

		$footer.classList.add('dt-footer');

		return $footer;
	}

	function content(content) {
		if (!content) return;

		if (typeof content == 'string') {
			$footer.innerHTML = content;
		} else if (content instanceof HTMLElement) {
			$footer.appendChild(content);
		}
	}

	function show(show = true) {
		_footer.isHidden = !show;
		$footer.classList.toggle('hidden', !show);
	}

	function disable(disabled = true) {
		_footer.isDisabled = disabled;
		$footer.classList.toggle('disabled', disabled);
	}
}
