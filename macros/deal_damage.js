const saved   = game.saved_macro;
const utils   = saved.utils;
const track   = saved.tracking;
const damages = track.damage;

let content = "";

const checkbox = (value, display) => { return `<input type="checkbox" name="damages" value="${value}" style="vertical-align: sub;"><div style="display: inline-block;">${display}</div><br>` }
const attacks = {};

if (damages.length > 0) {
	Object.entries(damages).forEach(item => { 
		content += checkbox(item[0], utils.fancyName(item[0]));
		attacks[item[0]] = item[1];
	})
	
	new Dialog({
		title: "Deal Damage",
		content: content,
		buttons: {
			submit: {
				icon: '<i class="fas fa-check"></i>',
				label: "Submit",
				callback: event => {
					const checked_boxes = [];
					const checkboxes = event[0].querySelectorAll(":scope input[type='checkbox']");
					const formula = [];
					checkboxes.forEach(checkbox => { if (checkbox.checked) { checked_boxes[checked_boxes.length] = utils.getItemByName(checkbox.value); }});
					checked_boxes.forEach((item, index) => {
						const data = attacks[utils.simpleName(item.name)];
						item.rollDamage({critical: data[0], spellLevel: data[1], versatile: data[2], options: { fastForward: true, chatMessage: false }}).then(roll => { 
							roll.toMessage({}, { rollMode: "selfroll" });
							formula[formula.length] = [roll.total, roll.options.flavor.match(/\((\w+)\)/)[1]]
							if (formula.length == checked_boxes.length) {
								const combined = {}
								let formula_str = "";
								formula.forEach(array => {
									if (combined[array[1]]) { combined[array[1]] += array[0]; } else { combined[array[1]] = array[0]; }
								})
								Object.entries(combined).forEach(array => { formula_str += array[1] + `[${array[0]}] + ` })
								new Roll(formula_str.slice(0, -3)).toMessage({ flavor: "Combined Damage" });
							}
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