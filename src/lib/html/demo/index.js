import { html, css, onHtml } from '../html.js';

const list = ['Item 1', 'Item 2', 'Item 3'];
const items = [
	{ name: 'Item 1' },
	{ name: 'Item 2' },
	{ name: 'Item 3' },
];
const colors = ['Red', 'Blue', 'Green'];
const component1 = {
	name: 'Componente 1',
	color: 'Blue',
	colors: ['Blue', 'Green'],
	items: ['Item 1', 'Item 3'],
	readonly: true,
	disabled: true,
};
const select = html`
	<select @onChange="${e => {
		component1.color = e.element.value;
		e.reload();
	}}">${() => colors.map((color, index) =>
		html`<option type="checkbox" selected="${component1.color == color}">${color}</option>`
	)}</select>
`;


// ! Exemplo
const comp1 = html`
	<div style="flex-direction: column;">
		<h1>${() => component1.name}</h1>
		<div style="flex-direction: column;" @show="${() => !!items.length}">
			<div>
				<button @onClick="${e => console.log(e.event)}">Test</button>
				<button @onClick="${e => {
					component1.name = new Date().toUTCString();
					e.reload();
				}}">Change</button>
				<button @onClick="${e => {
					list.push(new Date().toUTCString());
					e.reload();
				}}">Add</button>
				<button @onClick="${e => {
					list.pop(1);
					e.reload();
				}}">Remove</button>
			</div>

			<div>
				<b>Name</b>
				<input type="text" value="${() => component1.name}" @onChange="${e => {
					component1.name = e.element.value;
					e.reload();
				}}" />
			</div>

			<div>
				<b>Name (ReadOnly)</b>
				<input type="text" value="${() => component1.name}" readonly="${() => component1.readonly}" />
			</div>

			<div>
				<b>Name</b>
				<textarea rows="2" @onChange="${e => {
					component1.name = e.element.value;
					e.reload();
				}}">${() => component1.name}</textarea>
			</div>

			<div>
				<b>Name (Disabled)</b>
				<textarea rows="2" disabled="${() => component1.disabled}">${() => component1.name}</textarea>
			</div>

			${select}
			${select.cloneNode(true)}

			${() => items.map(item => html`
				<label>
					<input type="checkbox" name="checkboxOrigem" checked="${component1.items.some(x => x == item.name)}" @onChange="${e => {
						if (e.element.checked)
							component1.items.push(item.name);
						else
							component1.items = component1.items.filter(x => x != item.name);

						console.log(component1.items);
					}}">${item.name}
				</label>
			`)}

			<div>
				<div class="${() => component1.disabled ? 'disabled' : ''}">
					${() => colors.map(color => html`
						<label>
							<input type="checkbox" name="checkboxColor" checked="${component1.colors.some(x => x == color)}" @onChange="${e => {
								if (e.element.checked)
									component1.colors.push(color);
								else
									component1.colors = component1.colors.filter(x => x != color);
							}}">${color}
						</label>
					`)}
				</div>
				<button @onClick="${e => {
					component1.disabled = false;
					e.reload();
				}}">Enable</button>
			</div>

			${colors.map(color => html`
				<label>
					<input type="radio" name="radioColor" value="${color}" checked="${component1.color == color}" @onChange="${e => {
						component1.color = e.element.value;
					}}">${color}
				</label>
			`)}

			<ul>
				${() => list.map((item, index) => html`
					<li>${(index + 1) + ' - ' + item}</li>
				`)}
			</ul>
		</div>
	</div>
`;

// CSS - Exemplo de uso (Obs.: as propriedades são redefinidas no reload())
comp1.querySelectorAll('button')[3].css({ color: 'red' }); // Para elementos gerados pela lib
select.css({ color: 'blue' });
css(comp1.querySelector('h1'), { color: 'blue' }); // Para qualquer elemento

document.body.appendChild(comp1);
console.log(comp1);

onHtml.Reload = onHtmlReload;

function onHtmlReload(result) {
	console.log('onHtmlReload', result);
}
