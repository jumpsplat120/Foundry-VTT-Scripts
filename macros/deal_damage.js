const utils = game.saved_macro.utils;

const checkbox = (value, display) => { return `<input type="checkbox" value="${value}" style="vertical-align: sub;"><div style="display: inline-block;">${display}</div>` }
const attacks  = [];
let content = "";

game.user.character.items.forEach(item => {
	if (item.hasDamage) { attacks[attacks.length] = item; }
})

attacks.forEach(item => {
	content += checkbox(utils.simpleName(item.name), item.name)
})

let d = new Dialog({
	title: "Deal Damage",
	content: content,
	buttons: {
		submit: {
			icon: '<i class="fas fa-check"></i>',
			label: "Submit",
			callback: event =>  {
				const checked_boxes = [];
				const checkboxes = event[0].querySelectorAll(":scope input[type='checkbox']");
				checkboxes.forEach(checkbox => { if (checkbox.checked) { checked_boxes[checked_boxes.length] = utils.getItemByName(checkbox.value); }});
				checked_boxes.forEach(item => {
					
				})
			}
		}
	}
}).render(true);