/*
	Criado por Janderson Costa em 17/03/2024.
*/

const defaultOptions = {
	icon: null, // HTMLElement | string
	message: null, // string (text | html)
	position: 'bottom center', // string ('top left' | 'top center' | 'top right' | 'bottom left' | 'bottom center' | 'bottom right')
	gap: 12, // number (pixels)
	inset: 12, // number (pixels)
	time: 5, // number (seconds)
	spin: false, // boolean (Exibe o spin girando)
	buttonClose: false, // boolean (Exibe o botão X)
	onHide: null, // function
	onClose: null, // function
	onBeforeClose: null, // function
};

(() => {
	// Style
	let link = document.querySelector('link#toast');

	if (link) return;

	link = document.createElement('link');
	link.id = 'toast';
	link.rel = 'stylesheet';
	link.type = 'text/css';
	link.href = '/sites/appcatalog/dev/common/lib/toast/prod/style.css?v=' + new Date().getTime();

	document.querySelector('head').appendChild(link);
})();

// Container
let $toasts = document.querySelector('.toasts');

if (!$toasts) {
	$toasts = document.createElement('div');
	$toasts.className = 'toasts';
	$toasts.addEventListener('mouseover', () => $toasts.classList.add('scrollable', 'mouseover'));
	$toasts.addEventListener('mouseout', () => $toasts.classList.remove('scrollable', 'mouseover'));

	document.body.appendChild($toasts);
}

export default function Toast(options = {}) {
	options = { ...defaultOptions, ...options };

	let $toastWrapper;
	let _interval;

	$toasts.style.inset = `${options.inset}px`;
	create();

	return {
		message,
		show,
		hide,
	};

	function create() {
		$toastWrapper = document.createElement('div');
		$toastWrapper.classList.add('toast-wrapper');
		$toastWrapper.innerHTML = /*html*/`
			<div class="toast">
				<div class="toast-icon"></div>
				<div class="toast-body">
					<div class="toast-content">
						${options.message}
					</div>
				</div>
				<div class="toast-controls">
					<div class="toast-button hidden">
						<button type="button" class="toast-button-icon" title="Fechar">✖</button>
					</div>
					<div class="toast-spin hidden"></div>
				</div>
			</div>
		`;

		// Toast
		const $toast = $toastWrapper.querySelector('.toast');
		const $icon = $toast.querySelector('.toast-icon');
		const $controls = $toast.querySelector('.toast-controls');
		const $button = $toast.querySelector('.toast-button');
		const $spin = $toast.querySelector('.toast-spin');

		$toast.addEventListener('mouseover', () => $toast.classList.add('mouseover'));
		$toast.addEventListener('mouseout', () => $toast.classList.remove('mouseover'));
		$toastWrapper.prepend($toast);

		// Ícone
		if (options.icon) {
			if (options.icon instanceof HTMLElement)
				$icon.appendChild(options.icon);
			else
				$icon.innerHTML = options.icon;

			$toast.prepend($icon);
		}

		// Botão ocultar
		if (options.buttonClose) {
			$button.classList.remove('hidden');
			$button.querySelector('button').addEventListener('click', async () => {
				if (options.onBeforeClose) {
					let closed = await options.onBeforeClose();

					if (closed)
						hide();
				} else {
					hide();
				}
			});
		}

		// Spin
		if (options.spin) {
			$spin.classList.remove('hidden');
			$button.classList.add('hidden');
		}

		// Alterna entre botão e spin
		$controls.addEventListener('mouseover', () => {
			if (options.buttonClose && options.spin) {
				$spin.classList.add('hidden');
				$button.classList.remove('hidden');
			}
		});

		$controls.addEventListener('mouseout', () => {
			if (options.buttonClose && options.spin) {
				$spin.classList.remove('hidden');
				$button.classList.add('hidden');
			}
		});
	}

	function message(text) {
		$toastWrapper.querySelector('.toast-content').innerHTML = text || '';
	}

	function show() {
		// Posição horizontal
		let positionX = 'center';

		if (options.position.match('left')) {
			positionX = 'left';
		} else if (options.position.match('right')) {
			positionX = 'right';
		}

		$toastWrapper.classList.add(positionX);

		// Posição vertical
		if (options.position.match('top')) {
			$toasts.querySelectorAll('.toast-wrapper.bottom').forEach(x => x.remove());
			$toastWrapper.classList.add('top');
			$toastWrapper.style.transform = 'scale(0.8) translateY(-16px)';

			// Adiciona em cima do anterior
			$toasts.prepend($toastWrapper);

			const height = $toastWrapper.offsetHeight;

			setTimeout(() => {
				$toastWrapper.style.transform = 'scale(1)';
				$toastWrapper.style.transform = 'translateY(0px)';
				$toastWrapper.style.opacity = 1;
			}, 0);

			// Move os outros para baixo
			const $items = $toasts.querySelectorAll('.toast-wrapper');

			$items.forEach(($toastWrapper, index) => {
				if (index == 0) return;

				const translateY = Number($toastWrapper.style.transform.replace(/\D/g, ''));

				$toastWrapper.style.transform = `translateY(calc(${translateY + height}px + ${options.gap}px))`;
			});
		}

		if (options.position.match('bottom')) {
			$toasts.querySelectorAll('.toast-wrapper.top').forEach(x => x.remove());
			$toastWrapper.classList.add('bottom');
			$toastWrapper.style.transform = 'scale(0.8) translateY(16px)';

			// Adiciona em baixo do anterior
			$toasts.appendChild($toastWrapper);

			const height = $toastWrapper.offsetHeight;

			setTimeout(() => {
				$toastWrapper.style.transform = 'scale(1)';
				$toastWrapper.style.transform = 'translateY(0px)';
				$toastWrapper.style.opacity = 1;
			}, 0);

			// Move os outros para cima
			const $items = $toasts.querySelectorAll('.toast-wrapper');

			$items.forEach(($toastWrapper, index) => {
				if (index == $items.length - 1) return;

				const translateY = Number($toastWrapper.style.transform.replace(/\D/g, ''));

				$toastWrapper.style.transform = `translateY(calc(-1 * (${translateY + height}px + ${options.gap}px)))`;
			});
		}

		// Oculta/Remove ao término do tempo de exibição
		_interval = setInterval(() => {
			if (
				!options.buttonClose &&
				!options.spin &&
				!$toasts.querySelectorAll('.toast.mouseover').length
			) {
				hide();
			}
		}, options.time * 1000);
	}

	function hide() {
		// Oculta
		$toastWrapper.style.transform = `translateY(${$toastWrapper.style.transform})`;
		$toastWrapper.style.opacity = 0;

		// Move os outros para cima ou baixo
		const isTop = options.position.match('top');
		let $items = Array.from($toasts.querySelectorAll('.toast-wrapper'));
		let height;

		$items = isTop ? $items : $items.reverse();

		for (const $tw of $items) {
			if ($tw == $toastWrapper) {
				height = $toastWrapper.offsetHeight;
				continue;
			}

			if (height) {
				let translateY = Number($tw.style.transform.replace(/\D/g, ''));

				translateY = isTop ?
					`${translateY - height - options.gap}px` :
					`calc(-1 * ${translateY - height - options.gap}px)`;

				$tw.style.transform = `translateY(${translateY})`;
			}
		}

		// Remove
		setTimeout(() => $toastWrapper.remove(), 300);

		if (options.onHide)
			options.onHide();

		if (options.onClose)
			options.onClose();

		clearInterval(_interval);
	}
}
