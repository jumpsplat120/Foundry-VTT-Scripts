const s = game.saved_macro;
const u = s.utils;
const t = s.tracking;
const bow = u.getItemByName("longbow");

if (t.advantage.length > 0) {
    let d = new Dialog({
	title: "Advantage",
	content: "You have sources of advantage! Would you like to use one?",
	buttons: {
		yes: {
			icon: '<i class="fas fa-check"></i>',
			label: "Yes",
			callback: event =>  {
				const buttons = {}
				t.advantage.forEach((advantage, i) => {
					buttons[u.simpleName(advantage[0])] = {
						icon: `<i class="fas fa-${advantage[2]}"></i>`,
						label: advantage[0],
						callback: _ => {
							advantage[3]();
							bow.rollAttack({fastForward: true, advantage: true, flavor: `Longbow w/ ${advantage[0]} - Attack Roll`});
							u.updateItemQuantity("arrows", 1, "-");
							t.arrows++;
							advantage[1]--;
							if (advantage[1] == 0) { t.advantage.splice(i, 1); }
						}
					}
				})
				let d = new Dialog({
					title: "Advantage Sources",
					content: "Please choose a source of advantage.",
					buttons: buttons
				}).render(true);
			}
		},
		no: {
			icon: '<i class="fas fa-times"></i>',
			label: "No",
			callback: event =>  {
				bow.rollAttack({fastForward: true });
				u.updateItemQuantity("arrows", 1, "-");
				t.arrows++;
			}
		}
	}
}).render(true);
} else {
    bow.rollAttack({fastForward: true, advantage: event.shiftKey, disadvantage: event.ctrlKey });
	u.updateItemQuantity("arrows", 1, "-");
	t.arrows++;
}