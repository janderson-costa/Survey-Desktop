/*
	Criado por Janderson Costa em  07/01/2024.
	Descrição: Menu de contexto simples.
*/

const __defaultOptions = {
	trigger: null, // HTMLElement - Ex.: button | a | div
	items: [], /* item: {
		icon: HTMLElement, (opcional)
		id: string, (opcional)
		name: string,
		description: string, (opcional)
		onClick: function
	}*/
	position: 'left', // 'left' | 'right' | 'top left' | 'top right'
	top: 0, // Ajuste de posição vertical (opcional)
	left: 0, // Ajuste de posição horizontal (opcional)
	onShow: null,
	onHide: null,
};
let __menu;

window.addEventListener('resize', event => {
	if (!__menu) return;

	// Fechar o menu se a janela for redimensionada
	destroy(__menu);
});

export default function Menu(defaultOptions) {
	defaultOptions = {
		...__defaultOptions,
		...defaultOptions,
	};

	let $menu;
	let _classVisible = '';
	let _classInvisible = '';

	const _context = {
		options: defaultOptions,
		element: null,
		show,
		hide,
	};

	return _context;

	function create() {
		const $menu = document.createElement('div');

		$menu.className = 'ctx-menu';
		$menu.innerHTML = /*html*/`${defaultOptions.items.map(item => {
			if (item.divider) {
				return /*html*/`<div class="ctx-divider"></div>`;
			} else {
				return /*html*/`
					<div class="ctx-item">
						<div class="ctx-icon"></div>
						<div class="ctx-text">
							<div class="ctx-name">${item.name}</div>
							<div class="ctx-description">${item.description || ''}</div>
						</div>
					</div>
				`;
			}
		}).join('')}`;

		// Itens
		$menu.querySelectorAll(':scope > div').forEach(($item, index) => {
			const item = defaultOptions.items[index];
			const icon = item.icon;

			$item.data = item;
			item.element = $item;

			// Ícone
			const $icon = $item.querySelector('.ctx-icon');

			if (icon != undefined && icon != null) {
				if (typeof icon == 'string')
					$icon.innerHTML = icon;
				else if (icon instanceof HTMLElement)
					$icon.appendChild(icon);
			} else {
				$icon.style.display = 'none';
			}

			// Evento
			if (item.divider == undefined) {
				$item.addEventListener('click', event => {
					hide();

					if (item.onClick)
						item.onClick(event);
				});
			}
		});

		_context.element = $menu;
		document.body.appendChild($menu);

		return $menu;
	}

	function show(options = {}) {
		destroy($menu);

		options = {
			...defaultOptions,
			...options,
		};

		let x = options.x || 0;
		let y = options.y || 0;

		$menu = create();
		_classVisible = 'ctx-menu-visible-left';
		_classInvisible = 'ctx-menu-invisible-left';

		// Posição
		setTimeout(() => { // Para que window click não feche o menu
			if (options.trigger) {
				const trigger = options.trigger;

				// Canto inferior esquerdo do trigger
				x = trigger.offsetLeft;
				y = trigger.offsetTop + trigger.offsetHeight + 1;

				if (options.position.includes('top')) {
					// Topo do trigger
					y = trigger.offsetTop - $menu.offsetHeight - 1;
				}

				if (options.position.includes('right')) {
					// Canto direito do trigger
					x = x - $menu.offsetWidth + trigger.offsetWidth - 1;
				}
			}

			if (x + $menu.offsetWidth > window.innerWidth) {
				x = x - $menu.offsetWidth;

				_classVisible = 'ctx-menu-visible-right';
				_classInvisible = 'ctx-menu-invisible-right';
			}

			if (y + $menu.offsetHeight - window.innerHeight > 0)
				y = window.innerHeight - $menu.offsetHeight;

			$menu.className = 'ctx-menu';
			$menu.classList.add(_classVisible);
			$menu.style.left = options.left + x + 'px';
			$menu.style.top = options.top + y + 'px';

			if (options.onShow)
				options.onShow(_context);
		});

		__menu = $menu;
		window.addEventListener('click', hide);
		window.addEventListener('keyup', hide);
	}

	function hide(event) {
		if (!$menu) return;

		if (event) {
			if (
				!(!event.target.closest('.ctx-menu') ||
					event.key == 'Escape')
			) return;
		}

		$menu.classList.remove(_classVisible);
		$menu.classList.add(_classInvisible);

		if (defaultOptions.onHide)
			defaultOptions.onHide(_context);

		setTimeout(() => destroy($menu), 200);

		window.removeEventListener('click', hide);
		window.removeEventListener('keyup', hide);
	}
};

function destroy($menu) {
	if (!$menu) return;

	$menu.remove();
	$menu = null;
}
