const s = game.saved_macro;
const u = s.utils;
const t = s.tracking;
const bow = u.getItemByName("longbow");
const arrows = u.getItemByName("arrows");

const audio_src = s.sounds.bow.random();

const advantage_dialog = new Dialog({
		title: "Advantage",
		content: "You have sources of advantage! Would you like to use one?",
		buttons: {
			yes: {
				icon: '<i class="fas fa-check"></i>',
				label: "Yes",
				callback: event => {
					const buttons = {}
					t.advantage.forEach((advantage, i) => {
						buttons[u.simpleName(advantage[0])] = {
							icon: `<i class="fas fa-${advantage[2]}"></i>`,
							label: advantage[0],
							callback: _ => {
								advantage[3]();
								bow.rollAttack({fastForward: true, advantage: true, flavor: `Longbow w/ ${advantage[0]} - Attack Roll`}).then(roll => {t.damage.longbow = [roll.result.split(" ")[0] == 20, null, false] });
								u.updateItemQuantity("arrows", 1, "-");
								t.arrows++;
								advantage[1]--;
								if (advantage[1] == 0) { t.advantage.splice(i, 1); }
								u.playSound(audio_src);
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
					bow.rollAttack({fastForward: true }).then(roll => { t.damage.longbow = [roll.result.split(" ")[0] == 20, null, false] });
					u.updateItemQuantity("arrows", 1, "-");
					t.arrows++;
					AudioHelper.play({src: audio_src, volume: 0.8, autoplay: true, loop: false}, true);
				}
			}
		}
	})


const lucky_dialog = u.luckyPrompt(event => {
	bow.rollAttack({fastForward: true, flavor: `Longbow w/ Lucky (Reroll) - Attack Roll` }).then(roll => { t.damage.longbow = [roll.result.split(" ")[0] == 20, null, false] });
	t.lucky = false;
	t.advantage = t.advantage.filter(arr => arr[0] != "Lucky");
	AudioHelper.play({src: audio_src, volume: 0.8, autoplay: true, loop: false}, true);
}, event => {
	if (t.advantage.length > 0) {
		advantage_dialog.render(true);
	} else {
		bow.rollAttack({fastForward: true, advantage: event.shiftKey, disadvantage: event.ctrlKey }).then(roll => { t.damage.longbow = [roll.result.split(" ")[0] == 20, null, false] });
		u.updateItemQuantity("arrows", 1, "-");
		t.arrows++;
		AudioHelper.play({src: audio_src, volume: 0.8, autoplay: true, loop: false}, true);
	}
})

if (arrows.data.data.quantity > 0) {
	if (t.lucky && t.damage.longbow) {
		lucky_dialog.render(true);
	} else if (t.advantage.length > 0) {
		advantage_dialog.render(true);
	} else {
		bow.rollAttack({fastForward: true, advantage: event.shiftKey, disadvantage: event.ctrlKey }).then(roll => { t.damage.longbow = [roll.result.split(" ")[0] == 20, null, false] });
		u.updateItemQuantity("arrows", 1, "-");
		t.arrows++;
		//AudioHelper.play({src: audio_src, volume: 0.8, autoplay: true, loop: false}, true);
	}
} else {
	Dialog.prompt({
		title: "Ammo Notification",
		content: "You have no more ammo!",
		label: "OK",
		callback: function() {},
		rejectClose: false
	});
}