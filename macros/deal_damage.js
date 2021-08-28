const utils = game.saved_macro.utils;

const checkbox = (value, display) => { return `<input type="checkbox" value="${value}" style="vertical-align: sub;"><div style="display: inline-block;">${display}</div><br>` }
const attacks = {};
const damages = game.saved_macro.tracking.damage;
let content = "";

if (damages.length > 0) {
	Object.entries(damages).forEach(item => { 
		content += checkbox(item[0], utils.fancyName(item[0]));
		attacks[item[0]] = item[1];
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
					let formula = "";
					let counter = 0;
					checkboxes.forEach(checkbox => { if (checkbox.checked) { checked_boxes[checked_boxes.length] = utils.getItemByName(checkbox.value); }});
					checked_boxes.forEach((item, index) => {
						const data = attacks[utils.simpleName(item.name)];
						item.rollDamage({critical: data[0], spellLevel: data[1], versatile: data[2], options: { fastForward: true, chatMessage: false }}).then(roll => { 
							console.log(roll);
							roll.toMessage({}, { rollMode: "selfroll" });
							formula += roll.total + `[${item.name}] + `;
							counter++;
							if (counter == checked_boxes.length) { new Roll(formula.slice(0, -3)).toMessage({ flavor: "Combined Damage" }); }
						})
					})
					game.saved_macro.tracking.damage = {};
				}
			}
		}
	}).render(true);
} else {
	Dialog.prompt({
		title: "Attack Notification",
		content: "You have not made any attacks.",
		label: "OK",
		callback: function() {},
		rejectClose: false
	});
}