/*
	Criado por Janderson Costa em  27/05/2024.
	Descrição: Caixa de diálogo do tipo modal simples.
*/

const defaultOptions = {
	title: '', // string,
	content: '', // string/HTMLElement,
	width: 360, // number
	hideOut: true, // boolean - Fechar o modal ao clicar fora
	buttons: null, /* [
		{
			name: 'OK',
			primary: true,
			onClick: function
		}, 
		{
			name: 'Cancelar',
			primary: false,
			onClick: function
		}
	]*/
};

export default function Modal(options) {
	options = { ...defaultOptions, ...options };

	let _blocked = false;
	let $overlay;
	let $buttons;

	return {
		show,
		hide,
		block,
		showSpin,
	};

	function create() {
		const $overlay = document.createElement("div");

		$overlay.className = 'modal-overlay';
		$overlay.innerHTML = /*html*/`
			<div class="modal">
				<div class="modal-title">
					<span>${options.title}</span>
					<span class="modal-spin"></span>
				</div>
				<div class="modal-content"></div>
				<div class="modal-buttons"></div>
			</div>
		`;
		const $modal = $overlay.querySelector('.modal');
		const $content = $overlay.querySelector('.modal-content');

		// overlay
		$overlay.addEventListener('click', () => {
			if (options.hideOut)
				hide();
		});

		// modal
		$modal.addEventListener('click', event => event.stopPropagation());

		if (options.width)
			$modal.style.width = options.width + 'px';

		if (options.content instanceof HTMLElement)
			$content.appendChild(options.content);
		else
			$content.innerHTML = options.content;

		// botões
		$buttons = $overlay.querySelector('.modal-buttons');

		(options.buttons || []).forEach(button => {
			const $button = document.createElement('button');

			$button.type = 'button';
			$button.innerHTML = button.name;
			$button.classList.toggle('primary', !!button.primary);

			if (button.onClick)
				$button.addEventListener('click', button.onClick);

			if (button.name.match(/Cancel|No/))
				$button.addEventListener('click', hide);

			$buttons.appendChild($button);
		});

		return $overlay;
	}

	function show() {
		$overlay = create();
		document.body.appendChild($overlay);
		$overlay.classList.remove('modal-invisible');
		$overlay.classList.add('modal-visible');

		if (options.buttons)
			$buttons.querySelector('button').focus();

		window.addEventListener('keydown', onKeyDown);
	}

	function hide() {
		destroy();
	}

	function block(block = true) {
		if (!options.buttons) return;

		_blocked = block;

		$buttons.querySelectorAll('button').forEach($button => {
			$button.blur();
			$button.classList.toggle('disabled', block);
		});
	}

	function showSpin(show = true) {
		$overlay.querySelector('.modal-spin').classList.toggle('visible', show);
	}

	function destroy() {
		if (_blocked) return;

		$overlay.classList.remove('modal-visible');
		$overlay.classList.add('modal-invisible');

		setTimeout(() => {
			$overlay.remove();
			window.removeEventListener('keydown', onKeyDown);
		}, 200);
	}

	function onKeyDown(event) {
		if (event.key == 'Tab') {
			if (_blocked)
				event.preventDefault();
		}

		if (event.key == 'Escape') {
			if (options.hideOut)
				destroy();
		}
	}
}
