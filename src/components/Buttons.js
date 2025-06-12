import { html } from '../lib/html/html.js';

export default function Buttons(buttons, options = { width: 10 }) {
	return html`
		<div class="Buttons flex items-center gap-2">
			${() => buttons.filter(x => !x.hidden).map(button => {
				if (button.divider) {
					return html`<div class="divider h-5.5"></div>`;
				} else {
					return html`<button type="button" class="button w-${options.width} h-10" title="${button.title || ''}" @onClick="${e => button.onClick(e)}">
						${button.icon || ''}
						${button.name || ''}
					</button>`
				}
			})}
		</div>
	`;
}
