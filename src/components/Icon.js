// Ref.: https://lucide.dev

import { html } from '../lib/html/html.js';

const Icon = (name, options = {}) => {
	const icons = {
		add: () => html`<i class="icon" data-lucide="plus"></i>`,
		addGroup: () => html`<i class="icon" data-lucide="circle-plus"></i>`,
		new: () => html`<i class="icon" data-lucide="file-plus-2"></i>`,
		open: () => html`<i class="icon" data-lucide="folder-open"></i>`,
		edit: () => html`<i class="icon" data-lucide="pencil"></i>`,
		save: () => html`<i class="icon" data-lucide="save"></i>`,
		load: () => html`<i class="icon" data-lucide="import"></i>`,
		close: () => html`<i class="icon" data-lucide="x"></i>`,
		clear: () => html`<i class="icon" data-lucide="brush-cleaning"></i>`,
		send: () => html`<i class="icon" data-lucide="send-horizontal"></i>`,
		smartphone: () => html`<i class="icon" data-lucide="smartphone"></i>`,
		arrowUp: () => html`<i class="icon" data-lucide="arrow-up"></i>`,
		arrowDown: () => html`<i class="icon" data-lucide="arrow-down"></i>`,
		up: () => html`<i class="icon" data-lucide="chevron-up"></i>`,
		down: () => html`<i class="icon" data-lucide="chevron-down"></i>`,
		refresh: () => html`<i class="icon" data-lucide="refresh-cw"></i>`,
		info: () => html`<i class="icon" data-lucide="info"></i>`,
		ellipsisVertical: () => html`<i class="icon" data-lucide="ellipsis-vertical"></i>`,
		remove: () => html`<i class="icon" data-lucide="trash-2"></i>`,
		inputText: () => html`<i class="icon" data-lucide="text-cursor-input"></i>`,
		table: () => html`<i class="icon" data-lucide="table"></i>`,
		check: () => html`<i class="icon" data-lucide="check"></i>`,
		gridPlus: () => html`<i class="icon" data-lucide="grid-2x2-plus"></i>`,
	};

	const $icon = icons[name]();

	if (options.class) {
		options.class.forEach(className =>
			$icon.classList.add(className)
		);
	}

	return $icon;
};

export default Icon;
