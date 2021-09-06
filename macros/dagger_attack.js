const s = game.saved_macro;
const u = s.utils;
const t = s.tracking;
const dagger = u.getItemByName("dagger");

const sfx = [];
const audio_src = sfx[Math.floor(Math.random() * sfx.length)];

const playRandomAudio = _    => { AudioHelper.play({src: audio_src, volume: 0.8, autoplay: true, loop: false}, true); }
const addDamageEntry  = roll => { t.damage.dagger = [roll.result.split(" ")[0] == 20, null, false]; } 
const rollAttackAndPlaySound = (advantage, disadvantage, flavor) => {
    const roll_options = { fastForward: true };

    if (advantage)    { roll_options.advantage    = advantage;    }
    if (disadvantage) { roll_options.disadvantage = disadvantage; }
    if (flavor)       { roll_options.flavor       = flavor;       }

    dagger.rollAttack(roll_options).then(addDamageEntry);
	playRandomAudio();
}
const advantageDialog =  _   => { new Dialog({
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
								rollAttackAndPlaySound(true, null, `Dagger w/ ${advantage[0]} - Attack Roll`);
                                advantage[1]--;
								if (advantage[1] == 0) { t.advantage.splice(i, 1); }
							}
						}
					})
					new Dialog({
						title: "Advantage Sources",
						content: "Please choose a source of advantage.",
						buttons: buttons
					}).render(true);
				}
			},
			no: {
				icon: '<i class="fas fa-times"></i>',
				label: "No",
				callback: event => { rollAttackAndPlaySound(); }
			}
		}
	}).render(true);
}

const lucky_dialog = u.luckyPrompt(event => {
    rollAttackAndPlaySound(null, null, "Dagger w/ Lucky (Reroll) - Attack Roll");
	t.lucky = false;
	t.advantage = t.advantage.filter(arr => arr[0] != "Lucky");
}, event => {
	if (t.advantage.length > 0) {
		advantageDialog();
	} else {
        rollAttackAndPlaySound(event.shiftKey, event.ctrlKey);
	}
})

if (t.lucky && t.damage.dagger) {
    lucky_dialog.render(true);
} else if (t.advantage.length > 0) {
    advantageDialog();
} else {
    rollAttackAndPlaySound(event.shiftKey, event.ctrlKey);
}